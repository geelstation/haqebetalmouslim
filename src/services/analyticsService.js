import { db } from '../firebase/config';
import { doc, setDoc, getDoc, collection, getDocs, query, where, increment } from 'firebase/firestore';

const PRESENCE_COLLECTION = 'presence';
const ANALYTICS_DOC = 'analytics/counters';
const VISITOR_ID_KEY = 'visitorId';
const SESSION_KEY = 'sessionId';
const HEARTBEAT_INTERVAL_MS = 30000; // 30s
const ONLINE_THRESHOLD_MS = 120000; // 2 minutes

let heartbeatTimer = null;
let currentPlaybackData = null;

function generateId() {
  return 'v_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = generateId();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

function getUserAgentInfo() {
  const ua = navigator.userAgent;
  
  // كشف نظام التشغيل
  let os = 'Unknown';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iOS') !== -1 || ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';
  
  // كشف المتصفح
  let browser = 'Unknown';
  if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Edg') !== -1) browser = 'Edge';
  else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';
  
  // كشف نوع الجهاز
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/.test(ua)) device = 'Tablet';
  
  return { os, browser, device };
}

async function getCountryFromIP() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      ip: data.ip || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      regionCode: data.region_code || 'Unknown',
      postal: data.postal || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'Unknown',
      currency: data.currency || 'Unknown',
      languages: data.languages || 'Unknown',
      org: data.org || 'Unknown'
    };
  } catch (err) {
    console.warn('Failed to get location:', err);
    return { 
      ip: 'Unknown',
      country: 'Unknown', 
      countryCode: 'XX', 
      city: 'Unknown',
      region: 'Unknown',
      regionCode: 'Unknown',
      postal: 'Unknown',
      latitude: 0,
      longitude: 0,
      timezone: 'Unknown',
      currency: 'Unknown',
      languages: 'Unknown',
      org: 'Unknown'
    };
  }
}

export async function startTrackingPresence(user) {
  console.log('🎯 startTrackingPresence called with user:', user?.email || 'Anonymous');
  
  const visitorId = getVisitorId();
  console.log('🆔 Visitor ID:', visitorId);
  
  const presenceRef = doc(db, PRESENCE_COLLECTION, visitorId);
  console.log('📄 Firestore reference created for:', PRESENCE_COLLECTION + '/' + visitorId);
  
  // تسجيل زيارة جديدة (كل مرة يفتح الموقع)
  const sessionId = sessionStorage.getItem(SESSION_KEY);
  const sessionStartTime = sessionStorage.getItem('sessionStartTime');
  
  if (!sessionId) {
    // جلسة جديدة - نزيد عداد الزيارات
    const newSessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, newSessionId);
    sessionStorage.setItem('sessionStartTime', Date.now().toString());
    
    try {
      const analyticsRef = doc(db, 'analytics', 'counters');
      await setDoc(analyticsRef, { 
        totalVisits: increment(1),
        lastVisit: new Date()
      }, { merge: true });
    } catch (err) {
      console.warn('Failed to increment visit counter:', err);
    }
  }
  
  // جلب الموقع الجغرافي ومعلومات الجهاز
  const location = await getCountryFromIP();
  const deviceInfo = getUserAgentInfo();
  
  // حساب مدة الجلسة
  const sessionDuration = sessionStartTime ? Math.floor((Date.now() - parseInt(sessionStartTime)) / 1000) : 0;
  
  const payload = {
    visitorId,
    sessionId: sessionId || generateId(),
    userId: user?.uid || null,
    email: user?.email || null,
    displayName: user?.displayName || null,
    photoURL: user?.photoURL || null,
    isAnonymous: !user || user.isAnonymous,
    // معلومات جغرافية
    location: {
      ip: location.ip,
      country: location.country,
      city: location.city,
      region: location.region
    },
    ip: location.ip,
    country: location.country,
    countryCode: location.countryCode,
    city: location.city,
    region: location.region,
    regionCode: location.regionCode,
    postal: location.postal,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    currency: location.currency,
    languages: location.languages,
    org: location.org,
    // معلومات الجهاز
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    device: deviceInfo.device,
    userAgent: navigator.userAgent,
    // حالة الزائر
    isOnline: true,
    firstSeen: new Date(),
    lastSeen: new Date(),
    lastActive: new Date(),
    status: 'online',
    currentPage: window.location.pathname,
    sessionDuration: sessionDuration,
    currentlyPlaying: null,
    playHistory: []
  };
  
  try {
    const snap = await getDoc(presenceRef);
    if (snap.exists()) {
      const existingData = snap.data();
      const isNewSession = !sessionId;
      const newVisitCount = (existingData.visitCount || 0) + (isNewSession ? 1 : 0);
      
      console.log('🔄 Updating visitor:', {
        visitorId,
        existingVisitCount: existingData.visitCount,
        isNewSession,
        newVisitCount
      });
      
      await setDoc(presenceRef, { 
        ...payload, 
        firstSeen: existingData.firstSeen || new Date(),
        visitCount: newVisitCount,
        playHistory: existingData.playHistory || []
      }, { merge: true });
      
      console.log('✅ Visitor data updated successfully in Firestore');
    } else {
      console.log('✨ New visitor:', visitorId);
      await setDoc(presenceRef, {
        ...payload,
        visitCount: 1
      }, { merge: true });
      
      console.log('✅ New visitor data saved successfully in Firestore');
    }
  } catch (err) {
    console.error('❌ Presence init failed:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
  }

  // heartbeat
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(async () => {
    try {
      const sessionStartTime = sessionStorage.getItem('sessionStartTime');
      const sessionDuration = sessionStartTime ? Math.floor((Date.now() - parseInt(sessionStartTime)) / 1000) : 0;
      
      await setDoc(presenceRef, { 
        lastSeen: new Date(),
        lastActive: new Date(), 
        isOnline: true,
        status: 'online',
        currentPage: window.location.pathname,
        sessionDuration: sessionDuration,
        currentlyPlaying: currentPlaybackData 
      }, { merge: true });
    } catch (err) {
      console.warn('Presence heartbeat failed:', err);
    }
  }, HEARTBEAT_INTERVAL_MS);

  // mark offline on unload
  window.addEventListener('beforeunload', async () => {
    try {
      await setDoc(presenceRef, { 
        lastSeen: new Date(),
        lastActive: new Date(), 
        isOnline: false,
        status: 'offline' 
      }, { merge: true });
    } catch {}
  });
}

export async function getStats() {
  try {
    console.log('🔍 getStats: بدء جلب البيانات من Firestore...');
    const coll = collection(db, PRESENCE_COLLECTION);
    const allSnap = await getDocs(coll);
    const all = allSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`📦 getStats: تم جلب ${all.length} زائر من Firestore`);
    
    if (all.length > 0) {
      console.log('👤 عينة من البيانات:', all.slice(0, 2).map(v => ({
        id: v.id,
        visitCount: v.visitCount,
        isAnonymous: v.isAnonymous,
        country: v.country
      })));
    }
    
    const now = Date.now();
    
    // حساب عدد الزيارات الكلي من مجموع visitCount لكل زائر
    const totalVisits = all.reduce((sum, visitor) => {
      const count = visitor.visitCount || 1;
      return sum + count;
    }, 0);
    
    console.log('📊 Total Visits Calculated:', totalVisits, 'from', all.length, 'unique visitors');
    
    // حساب المتواجدين الآن (آخر 10 دقائق)
    const tenMinutesAgo = now - (10 * 60 * 1000);
    const onlineUsers = all.filter(d => {
      if (!d.isOnline) return false;
      const ts = d.lastSeen instanceof Date ? d.lastSeen.getTime() : (d.lastSeen?.toMillis?.() || 0);
      return ts && (now - ts) <= (10 * 60 * 1000);
    });
    
    // حساب زيارات اليوم والأسبوع
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    
    const visitsToday = all.filter(v => {
      const ts = v.firstSeen instanceof Date ? v.firstSeen.getTime() : (v.firstSeen?.toMillis?.() || 0);
      return ts >= startOfToday.getTime();
    }).length;
    
    const visitsThisWeek = all.filter(v => {
      const ts = v.firstSeen instanceof Date ? v.firstSeen.getTime() : (v.firstSeen?.toMillis?.() || 0);
      return ts >= startOfWeek.getTime();
    }).length;
    
    const visitsLastWeek = all.filter(v => {
      const ts = v.firstSeen instanceof Date ? v.firstSeen.getTime() : (v.firstSeen?.toMillis?.() || 0);
      return ts >= startOfLastWeek.getTime() && ts < startOfWeek.getTime();
    }).length;
    
    // معدل النمو
    const growthRate = visitsLastWeek > 0 
      ? Math.round(((visitsThisWeek - visitsLastWeek) / visitsLastWeek) * 100)
      : 0;
    
    // متوسط مدة الجلسة
    const totalSessionTime = all.reduce((sum, v) => sum + (v.sessionDuration || 0), 0);
    const avgSessionDuration = all.length > 0 ? Math.floor(totalSessionTime / all.length) : 0;
    
    // نسبة المسجلين
    const registeredUsers = all.filter(v => !v.isAnonymous).length;
    const anonymousUsers = all.filter(v => v.isAnonymous).length;
    const registeredPercentage = all.length > 0 
      ? Math.round((registeredUsers / all.length) * 100)
      : 0;
    
    // أكثر وقت نشاطاً (حسب الساعة)
    const hourStats = {};
    all.forEach(visitor => {
      const ts = visitor.lastSeen instanceof Date ? visitor.lastSeen : visitor.lastSeen?.toDate?.();
      if (ts) {
        const hour = ts.getHours();
        hourStats[hour] = (hourStats[hour] || 0) + 1;
      }
    });
    
    const peakHour = Object.entries(hourStats)
      .sort((a, b) => b[1] - a[1])[0];
    
    const peakHourFormatted = peakHour 
      ? `${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00 (${peakHour[1]} زائر)`
      : 'لا يوجد بيانات';
    
    // إحصائيات الدول والمدن
    const countryStats = {};
    const cityStats = {};
    const regionStats = {};
    const osStats = {};
    const browserStats = {};
    const deviceStats = {};
    const timezoneStats = {};
    const currencyStats = {};
    
    all.forEach(visitor => {
      const country = visitor.country || 'Unknown';
      const city = visitor.city || 'Unknown';
      const region = visitor.region || 'Unknown';
      const location = `${city}, ${country}`;
      const os = visitor.os || 'Unknown';
      const browser = visitor.browser || 'Unknown';
      const device = visitor.device || 'Unknown';
      const timezone = visitor.timezone || 'Unknown';
      const currency = visitor.currency || 'Unknown';
      
      countryStats[country] = (countryStats[country] || 0) + 1;
      cityStats[location] = (cityStats[location] || 0) + 1;
      regionStats[region] = (regionStats[region] || 0) + 1;
      osStats[os] = (osStats[os] || 0) + 1;
      browserStats[browser] = (browserStats[browser] || 0) + 1;
      deviceStats[device] = (deviceStats[device] || 0) + 1;
      timezoneStats[timezone] = (timezoneStats[timezone] || 0) + 1;
      currencyStats[currency] = (currencyStats[currency] || 0) + 1;
    });
    
    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    const topCities = Object.entries(cityStats)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    const topRegions = Object.entries(regionStats)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    const topOS = Object.entries(osStats)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count);
      
    const topBrowsers = Object.entries(browserStats)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);
      
    const topDevices = Object.entries(deviceStats)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
      
    const topTimezones = Object.entries(timezoneStats)
      .map(([timezone, count]) => ({ timezone, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
      
    const topCurrencies = Object.entries(currencyStats)
      .map(([currency, count]) => ({ currency, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // إحصائيات الأشرطة المشغلة حالياً
    const playingNow = onlineUsers
      .filter(u => u.currentlyPlaying)
      .map(u => u.currentlyPlaying);
    
    const cassettePlayCount = {};
    playingNow.forEach(playing => {
      if (playing?.cassetteTitle) {
        cassettePlayCount[playing.cassetteTitle] = (cassettePlayCount[playing.cassetteTitle] || 0) + 1;
      }
    });
    const topPlaying = Object.entries(cassettePlayCount)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // أكثر شريط اليوم
    const todayPlays = {};
    all.forEach(visitor => {
      if (visitor.playHistory && Array.isArray(visitor.playHistory)) {
        visitor.playHistory.forEach(play => {
          const playTs = play.timestamp instanceof Date ? play.timestamp.getTime() : (play.timestamp?.toMillis?.() || 0);
          if (playTs >= startOfToday.getTime()) {
            todayPlays[play.cassetteTitle] = (todayPlays[play.cassetteTitle] || 0) + 1;
          }
        });
      }
    });
    
    const topPlayedToday = Object.entries(todayPlays)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)[0];
    
    return {
      totalVisits,
      uniqueVisitors: all.length,
      onlineNow: onlineUsers.length,
      visitsToday,
      visitsThisWeek,
      growthRate,
      avgSessionDuration,
      registeredUsers,
      anonymousUsers,
      registeredPercentage,
      peakHour: peakHourFormatted,
      topCountry: topCountries[0],
      topPlayedToday,
      topCountries,
      topCities,
      topRegions,
      topOS,
      topBrowsers,
      topDevices,
      topTimezones,
      topCurrencies,
      activeListeners: playingNow.length,
      topPlaying,
      allVisitors: all // كل بيانات الزوار للعرض التفصيلي
    };
  } catch (err) {
    console.warn('getStats failed:', err);
    return { 
      totalVisits: 0,
      uniqueVisitors: 0, 
      onlineNow: 0, 
      topCountries: [],
      topCities: [],
      topRegions: [],
      topOS: [],
      topBrowsers: [],
      topDevices: [],
      topTimezones: [],
      topCurrencies: [],
      activeListeners: 0,
      topPlaying: [],
      allVisitors: []
    };
  }
}

// تحديث بيانات التشغيل الحالي
export async function updateCurrentPlayback(cassetteTitle, itemTitle) {
  currentPlaybackData = cassetteTitle ? {
    cassetteTitle,
    itemTitle,
    timestamp: new Date()
  } : null;
  
  // تحديث سجل التشغيل في Firestore
  if (cassetteTitle) {
    try {
      const visitorId = getVisitorId();
      const presenceRef = doc(db, PRESENCE_COLLECTION, visitorId);
      const snap = await getDoc(presenceRef);
      
      if (snap.exists()) {
        const playHistory = snap.data().playHistory || [];
        const newPlay = {
          cassetteTitle,
          itemTitle,
          timestamp: new Date()
        };
        
        // إضافة للتاريخ (نحتفظ بآخر 20 تشغيل)
        const updatedHistory = [newPlay, ...playHistory].slice(0, 20);
        
        // حساب الأكثر تشغيلاً
        const playCount = {};
        updatedHistory.forEach(play => {
          playCount[play.cassetteTitle] = (playCount[play.cassetteTitle] || 0) + 1;
        });
        
        const mostPlayed = Object.entries(playCount)
          .sort((a, b) => b[1] - a[1])[0];
        
        await setDoc(presenceRef, {
          currentlyPlaying: currentPlaybackData,
          playHistory: updatedHistory,
          mostPlayedCassette: mostPlayed ? {
            title: mostPlayed[0],
            count: mostPlayed[1]
          } : null
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to update play history:', err);
    }
  }
}


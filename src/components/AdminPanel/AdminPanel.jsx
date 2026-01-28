import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEdit, FaEye, FaTrash, FaBullhorn, FaUsers } from 'react-icons/fa';
import { 
  getPendingCassettes, 
  getAllCassettes,
  getUserCassettes,
  approveCassette, 
  rejectCassette,
  updateCassette,
  deleteCassette 
} from '../../services/cassetteService';
import { getAppSettings, updateTopBarMessage } from '../../services/settingsService';
import './AdminPanel.css';
import { getStats } from '../../services/analyticsService';
import OnlineUsers from '../OnlineUsers/OnlineUsers';

function AdminPanel({ isAdmin, currentUser }) {
  const [pendingCassettes, setPendingCassettes] = useState([]);
  const [allCassettes, setAllCassettes] = useState([]);
  const [myCassettes, setMyCassettes] = useState([]);
  const [viewMode, setViewMode] = useState('pending'); // 'pending' | 'all' | 'mine'
  const [selectedCassette, setSelectedCassette] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [topBarMessages, setTopBarMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [separatorIcon, setSeparatorIcon] = useState('☪');
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [stats, setStats] = useState({ totalVisits: 0, uniqueVisitors: 0, onlineNow: 0 });
  const [showAllVisitorsModal, setShowAllVisitorsModal] = useState(false);
  const [allVisitorsData, setAllVisitorsData] = useState([]);
  const [showListenersModal, setShowListenersModal] = useState(false);
  const [currentListeners, setCurrentListeners] = useState([]);

  // دالة تعريب النصوص
  const translateToArabic = (text) => {
    const translations = {
      // الدول
      'Egypt': 'مصر',
      'United States': 'الولايات المتحدة',
      'Yemen': 'اليمن',
      'Saudi Arabia': 'السعودية',
      'United Arab Emirates': 'الإمارات',
      'Kuwait': 'الكويت',
      'Jordan': 'الأردن',
      'Palestine': 'فلسطين',
      'Lebanon': 'لبنان',
      'Syria': 'سوريا',
      'Iraq': 'العراق',
      'Qatar': 'قطر',
      'Bahrain': 'البحرين',
      'Oman': 'عمان',
      'Morocco': 'المغرب',
      'Algeria': 'الجزائر',
      'Tunisia': 'تونس',
      'Libya': 'ليبيا',
      'Sudan': 'السودان',
      'Unknown': 'غير معروف',
      
      // المدن المصرية
      'Alexandria': 'الإسكندرية',
      'Cairo': 'القاهرة',
      'Giza': 'الجيزة',
      'Ash-Shaykh Zayid': 'الشيخ زايد',
      'Alexandria Governorate': 'محافظة الإسكندرية',
      'Cairo Governorate': 'محافظة القاهرة',
      
      // المدن الأمريكية
      'Ashburn': 'أشبورن',
      'Boardman': 'بوردمان',
      'Virginia': 'فيرجينيا',
      'Oregon': 'أوريغون',
      
      // المدن اليمنية
      'Sanaa': 'صنعاء',
      'Amanat Alasimah': 'أمانة العاصمة',
      
      // الأجهزة
      'Desktop': 'كمبيوتر',
      'Mobile': 'موبايل',
      'Tablet': 'تابلت',
      
      // أنظمة التشغيل
      'Windows': 'ويندوز',
      'macOS': 'ماك',
      'Linux': 'لينكس',
      'Android': 'أندرويد',
      'iOS': 'آيفون',
      
      // المتصفحات
      'Chrome': 'كروم',
      'Firefox': 'فايرفوكس',
      'Safari': 'سفاري',
      'Edge': 'إيدج',
      'Opera': 'أوبرا',
      
      // المناطق الزمنية
      'Africa/Cairo': 'القاهرة',
      'Asia/Aden': 'عدن',
      'America/New_York': 'نيويورك',
      'America/Los_Angeles': 'لوس أنجلوس',
      'Europe/London': 'لندن',
      'Asia/Dubai': 'دبي',
      'Asia/Riyadh': 'الرياض',
      
      // العملات
      'EGP': 'جنيه مصري',
      'USD': 'دولار أمريكي',
      'SAR': 'ريال سعودي',
      'AED': 'درهم إماراتي',
      'YER': 'ريال يمني',
      'EUR': 'يورو',
      'GBP': 'جنيه استرليني'
    };
    
    return translations[text] || text;
  };

  // قائمة الأيقونات الإسلامية المتاحة
  const iconOptions = [
    { icon: '☪', name: 'هلال ونجمة' },
    { icon: '✦', name: 'نجمة' },
    { icon: '❈', name: 'زهرة' },
    { icon: '✿', name: 'وردة' },
    { icon: '❣', name: 'قلب مزخرف' },
    { icon: '✹', name: 'نجمة ثمانية' },
    { icon: '✱', name: 'نجمة ثقيلة' },
    { icon: '◆', name: 'معين' },
    { icon: '•', name: 'نقطة' },
    { icon: '|', name: 'خط عمودي' }
  ];

  useEffect(() => {
    if (isAdmin) {
      loadPendingCassettes();
      loadAllCassettes();
      loadTopBarMessage();
      loadStats();
      const interval = setInterval(loadStats, 30000);
      return () => clearInterval(interval);
    }
    if (currentUser) {
      loadMyCassettes();
    }
  }, [isAdmin, currentUser]);

  const loadTopBarMessage = async () => {
    try {
      const settings = await getAppSettings();
      if (settings.topBarMessages && settings.topBarMessages.length > 0) {
        setTopBarMessages(settings.topBarMessages);
      } else if (settings.topBarMessage) {
        setTopBarMessages([settings.topBarMessage]);
      } else {
        setTopBarMessages(['بسم الله الرحمن الرحيم']);
      }
      
      // تحميل الأيقونة المحفوظة
      if (settings.separatorIcon) {
        setSeparatorIcon(settings.separatorIcon);
      }
    } catch (error) {
      console.error('خطأ في تحميل الرسالة:', error);
    }
  };

  const loadStats = async () => {
    try {
      console.log('📊 AdminPanel: جاري تحميل الإحصائيات...');
      const s = await getStats();
      console.log('📊 AdminPanel: الإحصائيات المستلمة:', {
        totalVisits: s.totalVisits,
        uniqueVisitors: s.uniqueVisitors,
        onlineNow: s.onlineNow
      });
      setStats(s);
      
      // حفظ بيانات كل الزوار للـ modal
      if (s.allVisitors) {
        setAllVisitorsData(s.allVisitors);
      }
      
      // حفظ المستمعين الحاليين
      if (s.topPlaying) {
        setCurrentListeners(s.topPlaying);
      }
    } catch (e) {
      console.error('❌ AdminPanel: خطأ في تحميل الإحصائيات:', e);
      setStats({ totalVisits: 0, uniqueVisitors: 0, onlineNow: 0 });
    }
  };
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0 ثانية';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    let result = '';
    if (hours > 0) result += `${hours} ساعة `;
    if (minutes > 0) result += `${minutes} دقيقة `;
    if (secs > 0 || !result) result += `${secs} ثانية`;
    return result.trim();
  };

  const loadPendingCassettes = async () => {
    // ✅ عرض قائمة فارغة فوراً
    setPendingCassettes([]);
    
    // 🚀 تحميل البيانات في الخلفية
    try {
      const cassettes = await getPendingCassettes();
      setPendingCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ Firestore غير متاح، عرض قائمة فارغة:', error);
      setPendingCassettes([]);
    }
  };

  const loadAllCassettes = async () => {
    setAllCassettes([]);
    try {
      const cassettes = await getAllCassettes();
      setAllCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ خطأ في تحميل جميع الأشرطة:', error);
      setAllCassettes([]);
    }
  };

  const loadMyCassettes = async () => {
    if (!currentUser?.uid) return;
    setMyCassettes([]);
    try {
      const cassettes = await getUserCassettes(currentUser.uid);
      setMyCassettes(cassettes);
    } catch (error) {
      console.warn('⚠️ خطأ في تحميل أشرطتي:', error);
      setMyCassettes([]);
    }
  };

  const handleApprove = async (cassetteId) => {
    if (window.confirm('هل تريد الموافقة على هذا الشريط؟')) {
      try {
        await approveCassette(cassetteId);
        alert('✅ تم الموافقة على الشريط');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الموافقة');
      }
    }
  };

  const handleReject = async (cassetteId) => {
    const reason = prompt('اذكر سبب الرفض (اختياري):');
    if (reason !== null) {
      try {
        await rejectCassette(cassetteId, reason);
        alert('❌ تم رفض الشريط');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الرفض');
      }
    }
  };

  const handleEdit = (cassette) => {
    setSelectedCassette(cassette);
    setEditData({
      title: cassette.title,
      imageUrl: cassette.imageUrl || '',
      items: cassette.items
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateCassette(selectedCassette.id, editData);
      alert('✅ تم التعديل بنجاح');
      setEditMode(false);
      setSelectedCassette(null);
      loadPendingCassettes();
      loadAllCassettes();
      loadMyCassettes();
    } catch (error) {
      alert('❌ فشل في التعديل');
    }
  };

  const handleDelete = async (cassetteId) => {
    if (window.confirm('هل تريد حذف هذا الشريط نهائياً؟')) {
      try {
        await deleteCassette(cassetteId);
        alert('🗑️ تم الحذف');
        loadPendingCassettes();
        loadAllCassettes();
        loadMyCassettes();
      } catch (error) {
        alert('❌ فشل في الحذف');
      }
    }
  };

  const handleSaveMessage = async () => {
    try {
      console.log('🔄 محاولة تحديث الرسائل:', topBarMessages);
      await updateTopBarMessage(topBarMessages, separatorIcon);
      console.log('✅ تم التحديث بنجاح');
      alert('✅ تم تحديث الرسائل بنجاح');
      setIsEditingMessage(false);
      setCurrentMessage('');
      await loadTopBarMessage();
    } catch (error) {
      console.error('❌ خطأ في تحديث الرسائل:', error);
      console.error('تفاصيل الخطأ:', error.message);
      alert(`❌ فشل في تحديث الرسائل: ${error.message}`);
    }
  };

  const handleAddMessage = () => {
    if (currentMessage.trim()) {
      setTopBarMessages([...topBarMessages, currentMessage.trim()]);
      setCurrentMessage('');
    }
  };

  const handleRemoveMessage = (index) => {
    setTopBarMessages(topBarMessages.filter((_, i) => i !== index));
  };

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <div className="access-denied">
          <h2>⛔ غير مصرح لك بالدخول</h2>
          <p>هذه الصفحة مخصصة للأدمن فقط</p>
        </div>
      </div>
    );
  }

  // تحديد القائمة المعروضة
  const currentCassettes = viewMode === 'pending' ? pendingCassettes :
                          viewMode === 'all' ? allCassettes :
                          myCassettes;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🎛️ لوحة تحكم الأدمن</h1>
        
        {/* إحصائيات رئيسية - صف أول */}
        <div className="main-stats-grid">
          <div className="main-stat-card visits">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalVisits || 0}</div>
              <div className="stat-label">إجمالي الزيارات</div>
              <div className="stat-hint">كل مرة يفتح حد الموقع</div>
            </div>
          </div>
          
          <div className="main-stat-card visitors" onClick={() => setShowAllVisitorsModal(true)} style={{cursor: 'pointer'}}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.uniqueVisitors || 0}</div>
              <div className="stat-label">زوار فريدين</div>
              <div className="stat-hint">اضغط لعرض التفاصيل</div>
            </div>
          </div>
          
          <div className="main-stat-card online">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <div className="stat-value">{stats.onlineNow || 0}</div>
              <div className="stat-label">متواجدون الآن</div>
              <div className="stat-hint">آخر 10 دقائق</div>
            </div>
          </div>
          
          <div className="main-stat-card listening" onClick={() => setShowListenersModal(true)} style={{cursor: 'pointer'}}>
            <div className="stat-icon">🎧</div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeListeners || 0}</div>
              <div className="stat-label">يستمعون الآن</div>
              <div className="stat-hint">اضغط لعرض التفاصيل</div>
            </div>
          </div>
          
          <div className="main-stat-card cassettes">
            <div className="stat-icon">📼</div>
            <div className="stat-content">
              <div className="stat-value">{allCassettes.length || 0}</div>
              <div className="stat-label">إجمالي الأشرطة</div>
              <div className="stat-hint">كل الأشرطة المعتمدة</div>
            </div>
          </div>
          
          <div className="main-stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{pendingCassettes.length || 0}</div>
              <div className="stat-label">معلقة</div>
              <div className="stat-hint">تنتظر الموافقة</div>
            </div>
          </div>
        </div>
        {/* إحصائيات متقدمة - صف ثاني */}
        <div className="advanced-stats-grid">
          <div className="advanced-stat-card today">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.visitsToday || 0}</div>
              <div className="stat-label">زيارات اليوم</div>
              <div className="stat-hint">من بداية اليوم</div>
            </div>
          </div>
          
          <div className="advanced-stat-card week">
            <div className="stat-icon">📆</div>
            <div className="stat-content">
              <div className="stat-value">{stats.visitsThisWeek || 0}</div>
              <div className="stat-label">زيارات الأسبوع</div>
              <div className="stat-hint">آخر 7 أيام</div>
            </div>
          </div>
          
          <div className="advanced-stat-card growth">
            <div className="stat-icon">{stats.growthRate >= 0 ? '📈' : '📉'}</div>
            <div className="stat-content">
              <div className="stat-value" style={{color: stats.growthRate >= 0 ? '#4caf50' : '#f44336'}}>
                {stats.growthRate > 0 ? '+' : ''}{stats.growthRate || 0}%
              </div>
              <div className="stat-label">معدل النمو</div>
              <div className="stat-hint">مقارنة بالأسبوع الماضي</div>
            </div>
          </div>
          
          <div className="advanced-stat-card session">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.floor((stats.avgSessionDuration || 0) / 60)}:{String((stats.avgSessionDuration || 0) % 60).padStart(2, '0')}
              </div>
              <div className="stat-label">متوسط مدة الجلسة</div>
              <div className="stat-hint">دقيقة:ثانية</div>
            </div>
          </div>
          
          <div className="advanced-stat-card country">
            <div className="stat-icon">🌍</div>
            <div className="stat-content">
              <div className="stat-value" style={{fontSize: '18px'}}>
                {stats.topCountry ? translateToArabic(stats.topCountry.country) : 'لا يوجد'}
              </div>
              <div className="stat-label">أكثر دولة نشاطاً</div>
              <div className="stat-hint">{stats.topCountry ? `${stats.topCountry.count} زائر` : ''}</div>
            </div>
          </div>
          
          <div className="advanced-stat-card peak">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-value" style={{fontSize: '14px'}}>
                {stats.peakHour || 'لا يوجد'}
              </div>
              <div className="stat-label">أكثر وقت نشاطاً</div>
              <div className="stat-hint">حسب الساعة</div>
            </div>
          </div>
          
          <div className="advanced-stat-card registered">
            <div className="stat-icon">👤</div>
            <div className="stat-content">
              <div className="stat-value">{stats.registeredPercentage || 0}%</div>
              <div className="stat-label">نسبة المسجلين</div>
              <div className="stat-hint">{stats.registeredUsers || 0} مسجل / {stats.anonymousUsers || 0} زائر</div>
            </div>
          </div>
          
          <div className="advanced-stat-card top-cassette">
            <div className="stat-icon">🔝</div>
            <div className="stat-content">
              <div className="stat-value" style={{fontSize: '14px'}}>
                {stats.topPlayedToday ? stats.topPlayedToday.title : 'لا يوجد'}
              </div>
              <div className="stat-label">أكثر شريط اليوم</div>
              <div className="stat-hint">{stats.topPlayedToday ? `${stats.topPlayedToday.count} تشغيل` : ''}</div>
            </div>
          </div>
        </div>
        {/* شبكة الإحصائيات التفصيلية */}
        <div className="stats-grid">
        {/* إحصائيات الدول */}
        {stats.topCountries && stats.topCountries.length > 0 && (
          <div className="countries-stats">
            <h3>🌍 الزوار حسب الدولة</h3>
            <div className="country-list">
              {stats.topCountries.map((item, idx) => (
                <div key={idx} className="country-item">
                  <span className="country-name">{translateToArabic(item.country)}</span>
                  <span className="country-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المدن */}
        {stats.topCities && stats.topCities.length > 0 && (
          <div className="cities-stats">
            <h3>🏙️ الزوار حسب المدينة</h3>
            <div className="city-list">
              {stats.topCities.map((item, idx) => {
                const [city, country] = item.location.split(', ');
                const arabicLocation = `${translateToArabic(city)}، ${translateToArabic(country)}`;
                return (
                  <div key={idx} className="city-item">
                    <span className="city-name">{arabicLocation}</span>
                    <span className="city-count">{item.count} زائر</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* إحصائيات المناطق */}
        {stats.topRegions && stats.topRegions.length > 0 && (
          <div className="regions-stats">
            <h3>📍 الزوار حسب المنطقة</h3>
            <div className="region-list">
              {stats.topRegions.map((item, idx) => (
                <div key={idx} className="region-item">
                  <span className="region-name">{translateToArabic(item.region)}</span>
                  <span className="region-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات الأجهزة */}
        {stats.topDevices && stats.topDevices.length > 0 && (
          <div className="devices-stats">
            <h3>📱 الزوار حسب الجهاز</h3>
            <div className="device-list">
              {stats.topDevices.map((item, idx) => (
                <div key={idx} className="device-item">
                  <span className="device-name">{translateToArabic(item.device)}</span>
                  <span className="device-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات أنظمة التشغيل */}
        {stats.topOS && stats.topOS.length > 0 && (
          <div className="os-stats">
            <h3>💻 الزوار حسب نظام التشغيل</h3>
            <div className="os-list">
              {stats.topOS.map((item, idx) => (
                <div key={idx} className="os-item">
                  <span className="os-name">{translateToArabic(item.os)}</span>
                  <span className="os-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المتصفحات */}
        {stats.topBrowsers && stats.topBrowsers.length > 0 && (
          <div className="browsers-stats">
            <h3>🌐 الزوار حسب المتصفح</h3>
            <div className="browser-list">
              {stats.topBrowsers.map((item, idx) => (
                <div key={idx} className="browser-item">
                  <span className="browser-name">{translateToArabic(item.browser)}</span>
                  <span className="browser-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات المناطق الزمنية */}
        {stats.topTimezones && stats.topTimezones.length > 0 && (
          <div className="timezones-stats">
            <h3>🕐 الزوار حسب المنطقة الزمنية</h3>
            <div className="timezone-list">
              {stats.topTimezones.map((item, idx) => (
                <div key={idx} className="timezone-item">
                  <span className="timezone-name">{translateToArabic(item.timezone)}</span>
                  <span className="timezone-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* إحصائيات العملات */}
        {stats.topCurrencies && stats.topCurrencies.length > 0 && (
          <div className="currencies-stats">
            <h3>💰 الزوار حسب العملة</h3>
            <div className="currency-list">
              {stats.topCurrencies.map((item, idx) => (
                <div key={idx} className="currency-item">
                  <span className="currency-name">{translateToArabic(item.currency)}</span>
                  <span className="currency-count">{item.count} زائر</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* الأشرطة المشغلة حالياً */}
        {stats.topPlaying && stats.topPlaying.length > 0 && (
          <div className="playing-stats">
            <h3>🎵 الأشرطة المشغلة الآن</h3>
            <div className="playing-list">
              {stats.topPlaying.map((item, idx) => (
                <div key={idx} className="playing-item">
                  <span className="cassette-title">{item.title}</span>
                  <span className="listener-count">{item.count} مستمع</span>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>{/* نهاية stats-grid */}

        <div className="view-mode-tabs">
          <button 
            className={`tab-btn ${viewMode === 'pending' ? 'active' : ''}`}
            onClick={() => setViewMode('pending')}
          >
            المعلقة ({pendingCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            كل الأشرطة ({allCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            أشرطتي ({myCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            أشرطتي ({myCassettes.length})
          </button>
          <button 
            className={`tab-btn ${viewMode === 'online' ? 'active' : ''}`}
            onClick={() => setViewMode('online')}
          >
            <FaUsers /> المتواجدون الآن
          </button>
        </div>
      </div>

      {/* قسم تعديل رسالة الشريط العلوي */}
      <div className="message-editor-section">
        <div className="section-header">
          <h2><FaBullhorn /> رسالة الشريط العلوي</h2>
          <button 
            className="edit-message-btn"
            onClick={() => setIsEditingMessage(!isEditingMessage)}
          >
            {isEditingMessage ? <FaTimes /> : <FaEdit />}
            {isEditingMessage ? 'إلغاء' : 'تعديل'}
          </button>
        </div>

        {isEditingMessage ? (
          <div className="message-editor">
            <div className="messages-list">
              {topBarMessages.map((msg, index) => (
                <div key={index} className="message-item">
                  <span>{msg}</span>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveMessage(index)}
                    title="حذف"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            
            {/* اختيار الأيقونة الفاصلة */}
            <div className="icon-selector">
              <label>الأيقونة الفاصلة:</label>
              <div className="icon-options">
                {iconOptions.map((option) => (
                  <button
                    key={option.icon}
                    className={`icon-option ${separatorIcon === option.icon ? 'selected' : ''}`}
                    onClick={() => setSeparatorIcon(option.icon)}
                    title={option.name}
                  >
                    {option.icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="add-message-form">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
                placeholder="اكتب رسالة جديدة..."
                className="message-input"
              />
              <button className="add-btn" onClick={handleAddMessage}>
                <FaCheck /> إضافة
              </button>
            </div>
            <div className="message-actions">
              <button className="save-btn" onClick={handleSaveMessage}>
                <FaCheck /> حفظ جميع الرسائل
              </button>
              <button className="cancel-btn" onClick={() => {
                loadTopBarMessage();
                setIsEditingMessage(false);
                setCurrentMessage('');
              }}>
                <FaTimes /> إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="current-message">
            {topBarMessages.map((msg, index) => (
              <span key={index} style={{ fontWeight: 700, fontSize: '16px' }}>
                {msg}
                {index < topBarMessages.length - 1 && (
                  <span style={{ margin: '0 12px', color: 'var(--accent-color)', fontSize: '18px' }}> {separatorIcon} </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="divider"></div>

      {viewMode === 'online' ? (
        <OnlineUsers />
      ) : currentCassettes.length === 0 ? (
        <div className="no-cassettes">
          <p>✅ لا توجد شرايط</p>
        </div>
      ) : (
        <div className="cassettes-grid">
          {currentCassettes.map(cassette => (
            <div key={cassette.id} className="cassette-card">
              <div className="cassette-header">
                <h3>{cassette.title}</h3>
                <span className={`status-badge ${cassette.status}`}>
                  {cassette.status === 'approved' ? 'معتمد' : 
                   cassette.status === 'pending' ? 'معلق' : 'مرفوض'}
                </span>
              </div>
              
              <div className="cassette-info">
                <p><strong>القسم:</strong> {cassette.sectionId}</p>
                <p><strong>رفع بواسطة:</strong> {cassette.createdByName}</p>
                <p><strong>الإيميل:</strong> {cassette.createdByEmail}</p>
                <p><strong>عدد الملفات:</strong> {cassette.items?.length || 0}</p>
              </div>

              <div className="cassette-actions">
                {cassette.status !== 'approved' && (
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(cassette.id)}
                    title="موافقة"
                  >
                    <FaCheck /> موافقة
                  </button>
                )}
                
                <button 
                  className="edit-btn"
                  onClick={() => handleEdit(cassette)}
                  title="تعديل"
                >
                  <FaEdit /> تعديل
                </button>
                
                {cassette.status !== 'rejected' && (
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(cassette.id)}
                    title="رفض"
                  >
                    <FaTimes /> رفض
                  </button>
                )}
                
                <button 
                  className="delete-btn"
                  onClick={() => handleDelete(cassette.id)}
                  title="حذف"
                >
                  <FaTrash /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editMode && selectedCassette && editData && (
        <div className="edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>تعديل: {selectedCassette.title}</h2>
              <button onClick={() => setEditMode(false)}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>اسم الشريط:</label>
                <input 
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>صورة الشريط (اختياري):</label>
                <input 
                  type="url"
                  value={editData.imageUrl || ''}
                  onChange={(e) => setEditData({...editData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {editData.imageUrl && (
                  <div className="image-preview">
                    <img src={editData.imageUrl} alt="معاينة" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>الملفات الصوتية:</label>
                {editData.items.map((item, index) => (
                  <div key={index} className="audio-item">
                    <input 
                      type="text"
                      placeholder="العنوان"
                      value={item.title}
                      onChange={(e) => {
                        const newItems = [...editData.items];
                        newItems[index].title = e.target.value;
                        setEditData({...editData, items: newItems});
                      }}
                    />
                    <input 
                      type="text"
                      placeholder="الرابط"
                      value={item.audioUrl}
                      onChange={(e) => {
                        const newItems = [...editData.items];
                        newItems[index].audioUrl = e.target.value;
                        setEditData({...editData, items: newItems});
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveEdit}>
                حفظ التعديلات
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: المستمعون الآن */}
      {showListenersModal && (
        <div className="modal-overlay" onClick={() => setShowListenersModal(false)}>
          <div className="modal-content listeners-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎧 يستمعون الآن ({currentListeners.length})</h2>
              <button className="close-btn" onClick={() => setShowListenersModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              {currentListeners.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎵</div>
                  <p>لا يوجد أحد يستمع الآن</p>
                </div>
              ) : (
                <div className="listeners-grid">
                  {currentListeners.map((listener) => {
                    const visitor = allVisitorsData.find(v => 
                      v.currentlyPlaying && 
                      v.currentlyPlaying.cassetteTitle === listener.cassetteTitle
                    );
                    
                    return (
                      <div key={listener.cassetteTitle} className="listener-card">
                        {/* الشريط المُشغَّل */}
                        <div className="playing-cassette">
                          <div className="cassette-header">
                            <div className="playing-indicator">
                              <span className="pulse-dot"></span>
                              <span className="live-text">مباشر</span>
                            </div>
                            <div className="listeners-count">{listener.count} مستمع</div>
                          </div>
                          <h3 className="cassette-title-large">{listener.cassetteTitle}</h3>
                        </div>
                        
                        {/* قائمة المستمعين لهذا الشريط */}
                        <div className="listeners-list">
                          <h4>👥 المستمعون:</h4>
                          {allVisitorsData
                            .filter(v => v.currentlyPlaying && v.currentlyPlaying.cassetteTitle === listener.cassetteTitle)
                            .map((v, idx) => (
                              <div key={v.id} className="listener-item">
                                <div className="listener-avatar">
                                  {v.photoURL ? (
                                    <img src={v.photoURL} alt={v.displayName} />
                                  ) : (
                                    <div className="avatar-placeholder">
                                      {v.isAnonymous ? '👤' : '👤'}
                                    </div>
                                  )}
                                </div>
                                <div className="listener-info">
                                  <div className="listener-name">
                                    {v.displayName || 'زائر'}
                                    <span className={`listener-badge ${v.isAnonymous ? 'anonymous' : 'registered'}`}>
                                      {v.isAnonymous ? 'زائر' : 'مسجل'}
                                    </span>
                                  </div>
                                  <div className="listener-location">
                                    📍 {translateToArabic(v.city || 'غير معروف')}, {translateToArabic(v.country || 'غير معروف')}
                                  </div>
                                  <div className="listener-device">
                                    📱 {translateToArabic(v.device || 'غير معروف')} • {translateToArabic(v.browser || 'غير معروف')}
                                  </div>
                                  {v.currentlyPlaying.itemTitle && (
                                    <div className="current-track">
                                      🎵 {v.currentlyPlaying.itemTitle}
                                    </div>
                                  )}
                                  <div className="listener-stats">
                                    <span>⏱️ {formatDuration(v.sessionDuration || 0)}</span>
                                    <span>•</span>
                                    <span>🔢 {v.visitCount || 1} زيارة</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal: كل الزوار الفريدين */}
      {showAllVisitorsModal && (
        <div className="modal-overlay" onClick={() => setShowAllVisitorsModal(false)}>
          <div className="modal-content all-visitors-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👥 جميع الزوار الفريدين ({allVisitorsData.length})</h2>
              <button className="close-btn" onClick={() => setShowAllVisitorsModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="visitors-grid">
                {allVisitorsData
                  .sort((a, b) => {
                    const aTime = a.lastSeen instanceof Date ? a.lastSeen.getTime() : (a.lastSeen?.toMillis?.() || 0);
                    const bTime = b.lastSeen instanceof Date ? b.lastSeen.getTime() : (b.lastSeen?.toMillis?.() || 0);
                    return bTime - aTime;
                  })
                  .map((visitor) => (
                  <div key={visitor.id} className={`visitor-detail-card ${visitor.isAnonymous ? 'anonymous' : 'registered'}`}>
                    {/* الرأس */}
                    <div className="visitor-header">
                      {visitor.photoURL ? (
                        <img src={visitor.photoURL} alt={visitor.displayName} className="visitor-avatar" />
                      ) : (
                        <div className="visitor-avatar-placeholder">
                          {visitor.isAnonymous ? '👤' : '👤'}
                        </div>
                      )}
                      <div className="visitor-basic">
                        <h3>{visitor.displayName || 'زائر'}</h3>
                        <p>{visitor.email || `ID: ${visitor.id.substring(0, 12)}...`}</p>
                        <span className={`visitor-badge ${visitor.isAnonymous ? 'anonymous' : 'registered'}`}>
                          {visitor.isAnonymous ? 'زائر' : 'مسجل'}
                        </span>
                      </div>
                    </div>
                    
                    {/* الموقع */}
                    <div className="visitor-section">
                      <h4>🌍 الموقع</h4>
                      <div className="visitor-info-grid">
                        <div className="info-item">
                          <span className="label">الدولة:</span>
                          <span className="value">{translateToArabic(visitor.country || 'غير معروف')}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">المدينة:</span>
                          <span className="value">{translateToArabic(visitor.city || 'غير معروف')}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">المنطقة:</span>
                          <span className="value">{translateToArabic(visitor.region || 'غير معروف')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* الإحصائيات */}
                    <div className="visitor-section">
                      <h4>📊 الإحصائيات</h4>
                      <div className="visitor-stats-row">
                        <div className="stat-box-small">
                          <div className="stat-icon-mini">🔢</div>
                          <div>
                            <div className="stat-value-mini">{visitor.visitCount || 1}</div>
                            <div className="stat-label-mini">زيارة</div>
                          </div>
                        </div>
                        <div className="stat-box-small">
                          <div className="stat-icon-mini">⏱️</div>
                          <div>
                            <div className="stat-value-mini">{formatDuration(visitor.sessionDuration || 0)}</div>
                            <div className="stat-label-mini">وقت الجلسة</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* الشريط المفضل */}
                    {visitor.mostPlayedCassette && (
                      <div className="visitor-section">
                        <h4>⭐ الأكثر استماعاً</h4>
                        <div className="favorite-cassette">
                          <span className="cassette-name">{visitor.mostPlayedCassette.title}</span>
                          <span className="play-count">{visitor.mostPlayedCassette.count} مرة</span>
                        </div>
                      </div>
                    )}
                    
                    {/* تاريخ الاستماع */}
                    {visitor.playHistory && visitor.playHistory.length > 0 && (
                      <div className="visitor-section">
                        <h4>📜 تاريخ الاستماع</h4>
                        <div className="play-history-compact">
                          {visitor.playHistory.slice(0, 3).map((play, idx) => (
                            <div key={idx} className="play-item-compact">
                              <span className="play-title">{play.cassetteTitle}</span>
                            </div>
                          ))}
                          {visitor.playHistory.length > 3 && (
                            <div className="more-plays">+{visitor.playHistory.length - 3} أخرى</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* الجهاز */}
                    <div className="visitor-section">
                      <h4>📱 الجهاز</h4>
                      <div className="device-info">
                        <span>{translateToArabic(visitor.device || 'غير معروف')}</span>
                        <span>•</span>
                        <span>{translateToArabic(visitor.os || 'غير معروف')}</span>
                        <span>•</span>
                        <span>{translateToArabic(visitor.browser || 'غير معروف')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

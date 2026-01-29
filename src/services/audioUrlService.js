// ===================================================
// خدمة معالجة الروابط الصوتية (Audio URL Service)
// ===================================================

/**
 * تحويل رابط archive.org إلى رابط مباشر للتشغيل
 */
export const normalizeArchiveOrgUrl = (url) => {
  if (!url) return url;
  
  // إذا كان الرابط من archive.org/details/
  // مثال: https://archive.org/details/collection-name/audio.mp3
  // يجب تحويله إلى: https://archive.org/download/collection-name/audio.mp3
  
  if (url.includes('archive.org/details/')) {
    return url.replace('/details/', '/download/');
  }
  
  return url;
};

/**
 * التحقق من صحة رابط الصوت
 */
export const isValidAudioUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmedUrl = url.trim();
  
  // التحقق من أنه رابط HTTP/HTTPS
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return false;
  }
  
  // قائمة الامتدادات المدعومة
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac', '.opus'];
  
  // التحقق من وجود امتداد صوتي
  const hasAudioExtension = audioExtensions.some(ext => 
    trimmedUrl.toLowerCase().includes(ext)
  );
  
  if (hasAudioExtension) return true;
  
  // دعم روابط خاصة من مواقع معروفة
  const trustedDomains = [
    'archive.org',
    'mp3quran.net',
    'everyayah.com',
    'cdn.islamic',
    'islamicnetwork.com'
  ];
  
  // إذا كان من موقع موثوق، نقبله حتى بدون امتداد واضح
  const isTrustedDomain = trustedDomains.some(domain => 
    trimmedUrl.includes(domain)
  );
  
  return isTrustedDomain;
};

/**
 * معالجة رابط الصوت قبل التشغيل
 */
export const prepareAudioUrl = (url) => {
  if (!url) return null;
  
  let processedUrl = url.trim();
  
  // معالجة روابط archive.org
  processedUrl = normalizeArchiveOrgUrl(processedUrl);
  
  // إضافة CORS proxy إذا لزم الأمر (اختياري)
  // يمكن تفعيله لاحقاً إذا كانت هناك مشاكل CORS
  // processedUrl = addCorsProxy(processedUrl);
  
  return processedUrl;
};

/**
 * إضافة CORS proxy (اختياري - للاستخدام إذا لزم الأمر)
 */
const addCorsProxy = (url) => {
  // يمكن استخدام خدمة CORS proxy إذا كانت هناك مشاكل
  // const corsProxies = [
  //   'https://corsproxy.io/?',
  //   'https://api.allorigins.win/raw?url='
  // ];
  // return corsProxies[0] + encodeURIComponent(url);
  
  return url; // حالياً نعيد الرابط كما هو
};

/**
 * اختبار إمكانية تشغيل رابط صوتي
 */
export const testAudioUrl = async (url) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(false);
    }, 10000); // 10 ثواني timeout
    
    audio.onloadedmetadata = () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(true);
    };
    
    audio.onerror = () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(false);
    };
    
    const processedUrl = prepareAudioUrl(url);
    audio.src = processedUrl;
  });
};

/**
 * استخراج اسم الملف من الرابط
 */
export const getFilenameFromUrl = (url) => {
  if (!url) return 'مقطع صوتي';
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    // إزالة الامتداد
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // استبدال الشرطات والنقاط بمسافات
    const cleanName = nameWithoutExt
      .replace(/[._-]/g, ' ')
      .trim();
    
    return cleanName || 'مقطع صوتي';
  } catch (error) {
    return 'مقطع صوتي';
  }
};

/**
 * التحقق من نوع المصدر
 */
export const getAudioSourceType = (url) => {
  if (!url) return 'unknown';
  
  if (url.includes('archive.org')) return 'archive.org';
  if (url.includes('mp3quran.net')) return 'mp3quran.net';
  if (url.includes('everyayah.com')) return 'everyayah.com';
  if (url.includes('islamicnetwork.com')) return 'islamicnetwork.com';
  
  return 'other';
};

export default {
  normalizeArchiveOrgUrl,
  isValidAudioUrl,
  prepareAudioUrl,
  testAudioUrl,
  getFilenameFromUrl,
  getAudioSourceType
};

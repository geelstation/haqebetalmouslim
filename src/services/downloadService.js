// خدمة التحميل المحلي للملفات الصوتية
// يعمل في بيئة Electron لتحميل الملفات على الجهاز

const DOWNLOADS_KEY = 'downloadedAudioFiles';
const CASSETTES_DOWNLOADS_KEY = 'downloadedCassettes';
const ACTIVE_DOWNLOADS_KEY = 'activeDownloads';

// متغير عام لإدارة حالة التحميل
let downloadControllers = {};

// الحصول على قائمة الملفات المحملة
export const getDownloadedFiles = () => {
  try {
    const data = localStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('خطأ في جلب قائمة التحميلات:', error);
    return {};
  }
};

// الحصول على قائمة الأشرطة المحملة بالكامل
export const getDownloadedCassettes = () => {
  try {
    const data = localStorage.getItem(CASSETTES_DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('خطأ في جلب قائمة الأشرطة المحملة:', error);
    return [];
  }
};

// الحصول على التحميلات النشطة
export const getActiveDownloads = () => {
  try {
    const data = localStorage.getItem(ACTIVE_DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('خطأ في جلب التحميلات النشطة:', error);
    return [];
  }
};

// حفظ التحميلات النشطة
const saveActiveDownloads = (downloads) => {
  try {
    localStorage.setItem(ACTIVE_DOWNLOADS_KEY, JSON.stringify(downloads));
  } catch (error) {
    console.error('خطأ في حفظ التحميلات النشطة:', error);
  }
};

// إضافة تحميل نشط
export const addActiveDownload = (cassetteId, cassetteInfo) => {
  const activeDownloads = getActiveDownloads();
  const existing = activeDownloads.findIndex(d => d.id === cassetteId);
  
  const download = {
    id: cassetteId,
    title: cassetteInfo.title,
    items: cassetteInfo.items,
    progress: 0,
    current: 0,
    total: cassetteInfo.items.length,
    status: 'downloading', // downloading, paused, completed, error
    startedAt: Date.now(),
    updatedAt: Date.now()
  };
  
  if (existing !== -1) {
    activeDownloads[existing] = download;
  } else {
    activeDownloads.push(download);
  }
  
  saveActiveDownloads(activeDownloads);
  return download;
};

// تحديث تقدم التحميل
export const updateDownloadProgress = (cassetteId, current, total, status = 'downloading') => {
  const activeDownloads = getActiveDownloads();
  const index = activeDownloads.findIndex(d => d.id === cassetteId);
  
  if (index !== -1) {
    activeDownloads[index].current = current;
    activeDownloads[index].total = total;
    activeDownloads[index].progress = Math.round((current / total) * 100);
    activeDownloads[index].status = status;
    activeDownloads[index].updatedAt = Date.now();
    saveActiveDownloads(activeDownloads);
  }
};

// إزالة تحميل نشط
export const removeActiveDownload = (cassetteId) => {
  const activeDownloads = getActiveDownloads();
  const filtered = activeDownloads.filter(d => d.id !== cassetteId);
  saveActiveDownloads(filtered);
  
  // إلغاء controller إذا موجود
  if (downloadControllers[cassetteId]) {
    downloadControllers[cassetteId].cancelled = true;
    delete downloadControllers[cassetteId];
  }
};

// حفظ معلومات ملف محمل
export const saveDownloadedFile = (audioUrl, localPath, fileInfo) => {
  try {
    const downloads = getDownloadedFiles();
    downloads[audioUrl] = {
      localPath,
      downloadedAt: Date.now(),
      size: fileInfo.size || 0,
      fileName: fileInfo.fileName || 'audio.mp3'
    };
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ معلومات التحميل:', error);
    return false;
  }
};

// حفظ معلومات شريط محمل بالكامل
export const saveDownloadedCassette = (cassetteId, cassetteInfo) => {
  try {
    const cassettes = getDownloadedCassettes();
    const index = cassettes.findIndex(c => c.id === cassetteId);
    
    if (index !== -1) {
      cassettes[index] = {
        id: cassetteId,
        ...cassetteInfo,
        downloadedAt: Date.now()
      };
    } else {
      cassettes.push({
        id: cassetteId,
        ...cassetteInfo,
        downloadedAt: Date.now()
      });
    }
    
    localStorage.setItem(CASSETTES_DOWNLOADS_KEY, JSON.stringify(cassettes));
    
    // إزالة من التحميلات النشطة
    removeActiveDownload(cassetteId);
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ معلومات الشريط المحمل:', error);
    return false;
  }
};

// التحقق من وجود ملف محمل
export const isFileDownloaded = (audioUrl) => {
  const downloads = getDownloadedFiles();
  return !!downloads[audioUrl];
};

// التحقق من تحميل شريط بالكامل
export const isCassetteDownloaded = (cassetteId) => {
  try {
    const cassettes = getDownloadedCassettes();
    return cassettes.some(c => c.id === cassetteId);
  } catch (error) {
    console.error('خطأ في فحص تحميل الشريط:', error);
    return false;
  }
};

// الحصول على المسار المحلي لملف
export const getLocalPath = (audioUrl) => {
  try {
    const downloads = getDownloadedFiles();
    return downloads[audioUrl]?.localPath || null;
  } catch (error) {
    console.error('خطأ في جلب المسار المحلي:', error);
    return null;
  }
};

// حذف ملف محمل
export const deleteDownloadedFile = (audioUrl) => {
  try {
    const downloads = getDownloadedFiles();
    delete downloads[audioUrl];
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));
    return true;
  } catch (error) {
    console.error('خطأ في حذف معلومات التحميل:', error);
    return false;
  }
};

// حذف شريط محمل
export const deleteDownloadedCassette = (cassetteId) => {
  try {
    const cassettes = getDownloadedCassettes();
    const filtered = cassettes.filter(c => c.id !== cassetteId);
    localStorage.setItem(CASSETTES_DOWNLOADS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('خطأ في حذف معلومات الشريط المحمل:', error);
    return false;
  }
};

// حساب حجم التحميلات الكلي
export const getTotalDownloadSize = () => {
  const downloads = getDownloadedFiles();
  let totalSize = 0;
  
  Object.values(downloads).forEach(file => {
    totalSize += file.size || 0;
  });
  
  return totalSize;
};

// تنسيق حجم الملف
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// مسح جميع التحميلات
export const clearAllDownloads = () => {
  try {
    localStorage.removeItem(DOWNLOADS_KEY);
    localStorage.removeItem(CASSETTES_DOWNLOADS_KEY);
    return true;
  } catch (error) {
    console.error('خطأ في مسح التحميلات:', error);
    return false;
  }
};

// إحصائيات التحميلات
export const getDownloadStats = () => {
  const files = getDownloadedFiles();
  const cassettes = getDownloadedCassettes();
  const totalSize = getTotalDownloadSize();
  
  return {
    filesCount: Object.keys(files).length,
    cassettesCount: cassettes.length,
    totalSize: totalSize,
    totalSizeFormatted: formatFileSize(totalSize)
  };
};

// دالة التحميل (ستتطلب تكامل مع Electron)
export const downloadAudioFile = async (audioUrl, fileName, onProgress) => {
  // هذه الدالة ستحتاج تنفيذ في preload.js
  // لأن التحميل يتم عبر Electron's download API
  
  if (window.electronAPI && window.electronAPI.downloadFile) {
    try {
      const result = await window.electronAPI.downloadFile(audioUrl, fileName, onProgress);
      
      if (result.success) {
        saveDownloadedFile(audioUrl, result.localPath, {
          size: result.size,
          fileName: fileName
        });
        return result;
      } else {
        throw new Error(result.error || 'فشل التحميل');
      }
    } catch (error) {
      console.error('خطأ في تحميل الملف:', error);
      throw error;
    }
  } else {
    // ❌ في المتصفح - لا يمكن التحميل الفعلي
    console.error('❌ Electron API غير متوفر - التحميل غير ممكن في المتصفح');
    throw new Error('التحميل متاح فقط في تطبيق سطح المكتب');
  }
};

// تحميل شريط كامل مع دعم الإيقاف والاستئناف
export const downloadEntireCassette = async (cassette, onProgress) => {
  const cassetteId = cassette.id;
  
  // إنشاء controller للتحكم بالتحميل
  downloadControllers[cassetteId] = {
    paused: false,
    cancelled: false
  };
  
  // إضافة للتحميلات النشطة
  addActiveDownload(cassetteId, cassette);
  
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < cassette.items.length; i++) {
    const controller = downloadControllers[cassetteId];
    
    // فحص إذا تم الإلغاء
    if (controller && controller.cancelled) {
      console.log('تم إلغاء التحميل');
      removeActiveDownload(cassetteId);
      return {
        success: false,
        cancelled: true,
        successCount,
        failCount,
        results
      };
    }
    
    // فحص إذا تم الإيقاف المؤقت
    while (controller && controller.paused) {
      updateDownloadProgress(cassetteId, i, cassette.items.length, 'paused');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const item = cassette.items[i];
    const fileName = `${cassette.title}_${item.title}.mp3`;
    
    try {
      // تحديث التقدم
      updateDownloadProgress(cassetteId, i + 1, cassette.items.length, 'downloading');
      
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: cassette.items.length,
          fileName: item.title,
          status: 'downloading'
        });
      }
      
      const result = await downloadAudioFile(item.audioUrl, fileName);
      results.push({ success: true, item: item.title });
      successCount++;
    } catch (error) {
      results.push({ success: false, item: item.title, error: error.message });
      failCount++;
    }
  }
  
  // ✅ حفظ الشريط فقط إذا تم تحميل كل الملفات بنجاح
  if (successCount === cassette.items.length) {
    // حساب الحجم الفعلي
    const downloads = getDownloadedFiles();
    let totalSize = 0;
    cassette.items.forEach(item => {
      const fileInfo = downloads[item.audioUrl];
      if (fileInfo && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    });
    
    saveDownloadedCassette(cassetteId, {
      cassetteId: cassette.id,
      title: cassette.title,
      items: cassette.items,
      itemsCount: cassette.items.length,
      downloadedItemsCount: successCount,
      totalSize: totalSize,
      downloadedAt: Date.now()
    });
    console.log('✅ تم تحميل الشريط بالكامل:', cassette.title, '-', totalSize, 'bytes');
  } else {
    console.warn('⚠️ لم يتم تحميل الشريط بالكامل:', successCount, '/', cassette.items.length);
  }
  
  // إزالة من التحميلات النشطة
  removeActiveDownload(cassetteId);
  
  if (onProgress) {
    onProgress({
      current: cassette.items.length,
      total: cassette.items.length,
      status: 'completed',
      successCount,
      failCount
    });
  }
  
  // تنظيف controller
  delete downloadControllers[cassetteId];
  
  return {
    success: failCount === 0,
    successCount,
    failCount,
    results
  };
};

// إيقاف التحميل مؤقتاً
export const pauseDownload = (cassetteId) => {
  if (downloadControllers[cassetteId]) {
    downloadControllers[cassetteId].paused = true;
    updateDownloadProgress(cassetteId, 0, 0, 'paused');
    return true;
  }
  return false;
};

// استئناف التحميل
export const resumeDownload = (cassetteId) => {
  if (downloadControllers[cassetteId]) {
    downloadControllers[cassetteId].paused = false;
    updateDownloadProgress(cassetteId, 0, 0, 'downloading');
    return true;
  }
  return false;
};

// إلغاء التحميل
export const cancelDownload = (cassetteId) => {
  if (downloadControllers[cassetteId]) {
    downloadControllers[cassetteId].cancelled = true;
  }
  removeActiveDownload(cassetteId);
  return true;
};

// ===================================================
// خدمات localStorage للميزات المتقدمة
// ===================================================

// 1️⃣ المفضلات (Favorites)
// ===================================================

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addToFavorites = (cassetteId) => {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(cassetteId)) {
      favorites.push(cassetteId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = (cassetteId) => {
  try {
    let favorites = getFavorites();
    favorites = favorites.filter(id => id !== cassetteId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = (cassetteId) => {
  const favorites = getFavorites();
  return favorites.includes(cassetteId);
};

// 2️⃣ حفظ حالة التشغيل (Playback State)
// ===================================================

export const savePlaybackState = (cassetteId, itemId, position = 0) => {
  try {
    const state = {
      cassetteId,
      itemId,
      position,
      timestamp: Date.now()
    };
    localStorage.setItem('lastPlaybackState', JSON.stringify(state));
    return true;
  } catch (error) {
    console.error('Error saving playback state:', error);
    return false;
  }
};

export const getPlaybackState = () => {
  try {
    const state = localStorage.getItem('lastPlaybackState');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Error getting playback state:', error);
    return null;
  }
};

export const clearPlaybackState = () => {
  try {
    localStorage.removeItem('lastPlaybackState');
    return true;
  } catch (error) {
    console.error('Error clearing playback state:', error);
    return false;
  }
};

// 3️⃣ Offline Cache للأشرطة
// ===================================================

export const cacheCassette = (cassette) => {
  try {
    const cache = getOfflineCache();
    
    // إضافة timestamp للتتبع
    const cachedCassette = {
      ...cassette,
      cachedAt: Date.now()
    };
    
    // إضافة أو تحديث في الcache
    const existingIndex = cache.findIndex(c => c.id === cassette.id);
    if (existingIndex >= 0) {
      cache[existingIndex] = cachedCassette;
    } else {
      cache.push(cachedCassette);
    }
    
    // حفظ (مع حد أقصى 100 شريط)
    const limitedCache = cache.slice(-100);
    localStorage.setItem('offlineCache', JSON.stringify(limitedCache));
    
    console.log('✅ Cached cassette:', cassette.title);
    return true;
  } catch (error) {
    console.error('Error caching cassette:', error);
    // إذا امتلأ localStorage، نحذف الأقدم
    if (error.name === 'QuotaExceededError') {
      clearOldCache(50); // احذف أقدم 50 شريط
      return cacheCassette(cassette); // حاول مرة أخرى
    }
    return false;
  }
};

export const getOfflineCache = () => {
  try {
    const cache = localStorage.getItem('offlineCache');
    return cache ? JSON.parse(cache) : [];
  } catch (error) {
    console.error('Error getting offline cache:', error);
    return [];
  }
};

export const getCachedCassette = (cassetteId) => {
  const cache = getOfflineCache();
  return cache.find(c => c.id === cassetteId) || null;
};

export const isCached = (cassetteId) => {
  return getCachedCassette(cassetteId) !== null;
};

export const clearOldCache = (keepCount = 50) => {
  try {
    const cache = getOfflineCache();
    // رتب حسب الأحدث
    cache.sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0));
    // احتفظ بأحدث keepCount فقط
    const newCache = cache.slice(0, keepCount);
    localStorage.setItem('offlineCache', JSON.stringify(newCache));
    console.log(`🗑️ Cleared old cache, kept ${keepCount} newest cassettes`);
    return true;
  } catch (error) {
    console.error('Error clearing old cache:', error);
    return false;
  }
};

export const clearAllCache = () => {
  try {
    localStorage.removeItem('offlineCache');
    console.log('🗑️ Cleared all offline cache');
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};

// 4️⃣ إحصائيات التخزين
// ===================================================

export const getStorageStats = () => {
  try {
    const favorites = getFavorites();
    const cache = getOfflineCache();
    const playbackState = getPlaybackState();
    
    // تقدير حجم التخزين (تقريبي)
    const favoritesSize = new Blob([JSON.stringify(favorites)]).size;
    const cacheSize = new Blob([JSON.stringify(cache)]).size;
    const stateSize = new Blob([JSON.stringify(playbackState)]).size;
    const totalSize = favoritesSize + cacheSize + stateSize;
    
    return {
      favoritesCount: favorites.length,
      cachedCassettesCount: cache.length,
      hasPlaybackState: !!playbackState,
      estimatedSize: {
        favorites: formatBytes(favoritesSize),
        cache: formatBytes(cacheSize),
        state: formatBytes(stateSize),
        total: formatBytes(totalSize)
      }
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

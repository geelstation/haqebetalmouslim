// ===================================================
// خدمة قوائم التشغيل (Playlists Service)
// ===================================================

const PLAYLISTS_KEY = 'quran_playlists';

/**
 * جلب جميع القوائم
 */
export const getPlaylists = () => {
  try {
    const stored = localStorage.getItem(PLAYLISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('خطأ في جلب القوائم:', error);
    return [];
  }
};

/**
 * حفظ القوائم
 */
const savePlaylists = (playlists) => {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return true;
  } catch (error) {
    console.error('خطأ في حفظ القوائم:', error);
    return false;
  }
};

/**
 * إنشاء قائمة جديدة
 */
export const createPlaylist = (name, description = '') => {
  try {
    const playlists = getPlaylists();
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    playlists.push(newPlaylist);
    savePlaylists(playlists);
    return newPlaylist;
  } catch (error) {
    console.error('خطأ في إنشاء القائمة:', error);
    return null;
  }
};

/**
 * تحديث قائمة
 */
export const updatePlaylist = (playlistId, updates) => {
  try {
    const playlists = getPlaylists();
    const index = playlists.findIndex(p => p.id === playlistId);
    
    if (index !== -1) {
      playlists[index] = {
        ...playlists[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      savePlaylists(playlists);
      return playlists[index];
    }
    return null;
  } catch (error) {
    console.error('خطأ في تحديث القائمة:', error);
    return null;
  }
};

/**
 * حذف قائمة
 */
export const deletePlaylist = (playlistId) => {
  try {
    const playlists = getPlaylists();
    const filtered = playlists.filter(p => p.id !== playlistId);
    savePlaylists(filtered);
    return true;
  } catch (error) {
    console.error('خطأ في حذف القائمة:', error);
    return false;
  }
};

/**
 * إضافة مقطع إلى قائمة
 */
export const addItemToPlaylist = (playlistId, cassette, item) => {
  try {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;
    
    // التحقق من عدم وجود المقطع مسبقاً
    const exists = playlist.items.some(i => 
      i.itemId === item.id && i.cassetteId === cassette.id
    );
    
    if (exists) return false;
    
    playlist.items.push({
      itemId: item.id,
      itemTitle: item.title,
      itemUrl: item.url,
      cassetteId: cassette.id,
      cassetteTitle: cassette.title,
      addedAt: new Date().toISOString()
    });
    
    playlist.updatedAt = new Date().toISOString();
    savePlaylists(playlists);
    return true;
  } catch (error) {
    console.error('خطأ في إضافة المقطع:', error);
    return false;
  }
};

/**
 * إزالة مقطع من قائمة
 */
export const removeItemFromPlaylist = (playlistId, itemId) => {
  try {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;
    
    playlist.items = playlist.items.filter(i => i.itemId !== itemId);
    playlist.updatedAt = new Date().toISOString();
    savePlaylists(playlists);
    return true;
  } catch (error) {
    console.error('خطأ في إزالة المقطع:', error);
    return false;
  }
};

/**
 * تصدير قائمة
 */
export const exportPlaylist = (playlistId) => {
  try {
    const playlists = getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    
    if (!playlist) return false;
    
    const dataStr = JSON.stringify(playlist, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `playlist-${playlist.name}-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('خطأ في تصدير القائمة:', error);
    return false;
  }
};

/**
 * استيراد قائمة
 */
export const importPlaylist = async (file) => {
  try {
    const text = await file.text();
    const playlist = JSON.parse(text);
    
    // التحقق من صحة البيانات
    if (!playlist.name || !Array.isArray(playlist.items)) {
      throw new Error('ملف غير صالح');
    }
    
    const playlists = getPlaylists();
    
    // إنشاء معرف جديد لتجنب التعارض
    playlist.id = Date.now().toString();
    playlist.createdAt = new Date().toISOString();
    playlist.updatedAt = new Date().toISOString();
    
    playlists.push(playlist);
    savePlaylists(playlists);
    return true;
  } catch (error) {
    console.error('خطأ في استيراد القائمة:', error);
    throw error;
  }
};

// ===================================================
// خدمة البحث (Search Service)
// ===================================================

/**
 * البحث في الأشرطة والمقاطع
 */
export const searchCassettes = (cassettes, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return cassettes;
  }

  const term = searchTerm.toLowerCase().trim();

  return cassettes.filter(cassette => {
    // البحث في عنوان الشريط
    if (cassette.title.toLowerCase().includes(term)) {
      return true;
    }

    // البحث في القارئ/الشيخ
    if (cassette.reciter && cassette.reciter.toLowerCase().includes(term)) {
      return true;
    }

    // البحث في الوصف
    if (cassette.description && cassette.description.toLowerCase().includes(term)) {
      return true;
    }

    // البحث في المقاطع
    if (cassette.items && cassette.items.some(item => 
      item.title.toLowerCase().includes(term)
    )) {
      return true;
    }

    return false;
  });
};

/**
 * البحث في القوائم
 */
export const searchPlaylists = (playlists, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return playlists;
  }

  const term = searchTerm.toLowerCase().trim();

  return playlists.filter(playlist => {
    return playlist.name.toLowerCase().includes(term) ||
           (playlist.description && playlist.description.toLowerCase().includes(term));
  });
};

/**
 * تصفية حسب الفئة
 */
export const filterByCategory = (cassettes, category) => {
  if (!category || category === 'all') {
    return cassettes;
  }

  return cassettes.filter(cassette => 
    cassette.category === category
  );
};

/**
 * ترتيب النتائج
 */
export const sortCassettes = (cassettes, sortBy = 'date') => {
  const sorted = [...cassettes];

  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    
    case 'date':
      return sorted.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0);
        const dateB = new Date(b.uploadedAt || 0);
        return dateB - dateA;
      });
    
    case 'popular':
      return sorted.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    
    default:
      return sorted;
  }
};

/**
 * بحث متقدم
 */
export const advancedSearch = (cassettes, filters = {}) => {
  let results = [...cassettes];

  // تطبيق البحث النصي
  if (filters.searchTerm) {
    results = searchCassettes(results, filters.searchTerm);
  }

  // تصفية حسب الفئة
  if (filters.category) {
    results = filterByCategory(results, filters.category);
  }

  // تصفية حسب القارئ
  if (filters.reciter) {
    results = results.filter(c => c.reciter === filters.reciter);
  }

  // ترتيب النتائج
  if (filters.sortBy) {
    results = sortCassettes(results, filters.sortBy);
  }

  return results;
};

/**
 * ترتيب نتائج البحث
 */
export const sortSearchResults = (results, sortBy) => {
  return sortCassettes(results, sortBy);
};

/**
 * اقتراحات البحث
 */
export const getSearchSuggestions = (cassettes, searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  const suggestions = new Set();

  cassettes.forEach(cassette => {
    if (cassette.title.toLowerCase().includes(term)) {
      suggestions.add(cassette.title);
    }
    if (cassette.reciter && cassette.reciter.toLowerCase().includes(term)) {
      suggestions.add(cassette.reciter);
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

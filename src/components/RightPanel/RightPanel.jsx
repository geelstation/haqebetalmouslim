import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTimes, FaSort } from 'react-icons/fa';
import AudioCard from '../AudioCard/AudioCard';
import { getApprovedCassettes, getLatestCassettes, getTrendingCassettes, incrementViews } from '../../services/cassetteService';
import { cacheCassette, getOfflineCache, getFavorites, getCachedCassette } from '../../services/storageService';
import { advancedSearch, sortSearchResults, getSearchSuggestions } from '../../services/searchService';
import './RightPanel.css';

function RightPanel({ 
  selectedSection, 
  selectedCassette,
  setSelectedCassette,
  refreshTrigger,
  isPlaying
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [cassettes, setCassettes] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc'); // الترتيب
  const [suggestions, setSuggestions] = useState([]); // اقتراحات البحث

  // تحميل الشرايط من Firestore بشكل فوري
  useEffect(() => {
    const loadCassettes = async () => {
      if (!selectedSection) {
        setCassettes([]);
        return;
      }

      // 🔥 تحميل مباشر من Firebase
      console.log('🔄 RightPanel: تحميل الأشرطة للقسم:', selectedSection.id);
      
      try {
        let firebaseCassettes;
        
        // ⭐ معالجة قسم المفضلة من localStorage + Firebase
        if (selectedSection.id === 'favorites') {
          const favoriteIds = getFavorites();
          console.log('⭐ تحميل المفضلة:', favoriteIds.length, 'شريط');
          
          if (favoriteIds.length === 0) {
            console.log('💭 لا توجد أشرطة في المفضلة');
            setCassettes([]);
            return;
          }
          
          // جلب الأشرطة المفضلة من cache أولاً (سريع)
          const favoriteCassettes = [];
          for (const id of favoriteIds) {
            const cached = getCachedCassette(id);
            if (cached) {
              favoriteCassettes.push(cached);
            } else {
              // جلب من Firebase لو مش موجود في cache
              try {
                const { getCassetteById } = await import('../../services/cassetteService');
                const cassette = await getCassetteById(id);
                if (cassette) {
                  favoriteCassettes.push(cassette);
                  cacheCassette(cassette); // حفظه في cache
                }
              } catch (error) {
                console.warn('⚠️ فشل تحميل شريط:', id);
              }
            }
          }
          
          console.log('✅ تم تحميل', favoriteCassettes.length, 'شريط من المفضلة');
          setCassettes(favoriteCassettes);
          return;
        }
        
        // ✨ معالجة خاصة للأقسام الجديدة
        if (selectedSection.id === 'latest') {
          // أحدث الأشرطة (حسب التحديث/الإضافة)
          firebaseCassettes = await getLatestCassettes(20);
          console.log('🆕 تم تحميل أحدث', firebaseCassettes.length, 'شريط');
        } else if (selectedSection.id === 'trending') {
          // الأكثر مشاهدة
          firebaseCassettes = await getTrendingCassettes(20);
          console.log('🔥 تم تحميل', firebaseCassettes.length, 'شريط من الأكثر مشاهدة');
        } else {
          // أقسام عادية (القرآن، الأناشيد، إلخ)
          firebaseCassettes = await getApprovedCassettes(selectedSection.id);
          console.log('✅ تم تحميل', firebaseCassettes.length, 'شريط من قسم', selectedSection.name);
        }
        
        console.log('📋 الأشرطة:', firebaseCassettes);
        if (firebaseCassettes.length === 0) {
          console.warn('⚠️ لا توجد أشرطة للقسم:', selectedSection.id);
        }
        
        // 📥 حفظ الأشرطة في Offline Cache تلقائياً
        firebaseCassettes.forEach(cassette => {
          try {
            cacheCassette(cassette);
          } catch (error) {
            console.warn('⚠️ فشل حفظ الشريط في cache:', error.message);
          }
        });
        console.log('💾 تم حفظ الأشرطة في Offline Cache');
        
        setCassettes(firebaseCassettes);
      } catch (error) {
        console.error('❌ RightPanel: خطأ في التحميل:', error);
        
        // 📱 محاولة التحميل من Offline Cache
        console.log('📱 محاولة التحميل من Offline Cache...');
        const cachedCassettes = getOfflineCache();
        const filteredCache = cachedCassettes.filter(c => {
          if (selectedSection.id === 'latest' || selectedSection.id === 'trending') {
            return true; // عرض كل المحفوظات
          }
          return c.sectionId === selectedSection.id;
        });
        
        if (filteredCache.length > 0) {
          console.log('✅ تم تحميل', filteredCache.length, 'شريط من Offline Cache');
          setCassettes(filteredCache);
        } else {
          console.warn('⚠️ لا توجد أشرطة محفوظة');
          setCassettes([]);
        }
      }
    };

    loadCassettes();

    // ✅ تحديث تلقائي كل 10 ثوانٍ للحصول على أحدث الأشرطة
    const interval = setInterval(() => {
      if (selectedSection) {
        console.log('🔄 تحديث تلقائي للأشرطة...');
        loadCassettes();
      }
    }, 10000); // 10 ثوانٍ

    return () => clearInterval(interval); // تنظيف عند إلغاء التحميل
  }, [selectedSection, refreshTrigger]);

  // 🔍 البحث المتقدم مع الترتيب
  const filteredCassettes = useMemo(() => {
    let results = cassettes;

    // تطبيق البحث
    if (searchQuery.trim()) {
      results = advancedSearch(cassettes, searchQuery, {
        sectionId: selectedSection?.id !== 'latest' && selectedSection?.id !== 'trending' 
          ? selectedSection?.id 
          : undefined
      });
    }

    // تطبيق الترتيب
    results = sortSearchResults(results, sortBy);

    return results;
  }, [cassettes, searchQuery, sortBy, selectedSection]);

  // 📝 اقتراحات البحث
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const newSuggestions = getSearchSuggestions(cassettes, searchQuery);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, cassettes]);

  const handleCassetteClick = async (cassette) => {
    setSelectedCassette(cassette);
    
    // زيادة عداد المشاهدات للشرايط من Firestore فقط
    if (cassette.id && !cassette.id.startsWith('surah-')) {
      try {
        await incrementViews(cassette.id);
      } catch (error) {
        console.error('Error incrementing views:', error);
      }
    }
  };

  return (
    <div className="right-panel">
      <div className="search-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="ابحث في الشرايط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="مسح البحث"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* اقتراحات البحث */}
        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-item"
                onClick={() => setSearchQuery(suggestion)}
              >
                <FaSearch /> {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* شريط الأدوات (فلاتر + ترتيب) */}
        <div className="search-toolbar">
          <div className="sort-controls">
            <FaSort />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date-desc">الأحدث</option>
              <option value="date-asc">الأقدم</option>
              <option value="views">الأكثر مشاهدة</option>
              <option value="downloads">الأكثر تحميلاً</option>
              <option value="title">أبجدياً</option>
            </select>
          </div>

          <div className="results-count">
            {filteredCassettes.length} {filteredCassettes.length === 1 ? 'شريط' : 'شريط'}
          </div>
        </div>
      </div>

      <div className="cards-grid">
        {!selectedSection ? (
          <div className="empty-state">
            <p>اختر قسماً من القائمة</p>
          </div>
        ) : filteredCassettes.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد نتائج</p>
          </div>
        ) : (
          filteredCassettes.map((cassette) => (
            <AudioCard
              key={cassette.id}
              cassette={cassette}
              isSelected={selectedCassette?.id === cassette.id}
              isPlaying={isPlaying && selectedCassette?.id === cassette.id}
              onClick={() => handleCassetteClick(cassette)}
            />
          ))
        )}
      </div>

      {selectedSection && filteredCassettes.length > 0 && (
        <div className="list-footer">
          <span className="items-count">
            {filteredCassettes.length} {filteredCassettes.length === 1 ? 'شريط' : 'شريط'}
          </span>
        </div>
      )}
    </div>
  );
}

export default React.memo(RightPanel);

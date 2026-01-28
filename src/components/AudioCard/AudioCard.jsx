import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaCheckCircle, FaShare } from 'react-icons/fa';
import { isFavorite, addToFavorites, removeFromFavorites } from '../../services/storageService';
import { isCassetteDownloaded } from '../../services/downloadService';
import { shareCassette, showShareFeedback } from '../../services/shareService';
import './AudioCard.css';

function AudioCard({ cassette, isSelected, isPlaying, onClick }) {
  const [favorite, setFavorite] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // فحص إذا كان في المفضلة والتحميلات عند التحميل
  useEffect(() => {
    if (cassette?.id) {
      setFavorite(isFavorite(cassette.id));
      setDownloaded(isCassetteDownloaded(cassette.id));
    }
  }, [cassette]);

  // إضافة/إزالة من المفضلة
  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // منع تشغيل onClick للكرت
    
    if (!cassette?.id) return;
    
    if (favorite) {
      removeFromFavorites(cassette.id);
      setFavorite(false);
    } else {
      addToFavorites(cassette.id);
      setFavorite(true);
    }
  };

  // مشاركة الشريط
  const handleShareClick = async (e) => {
    e.stopPropagation();
    const result = await shareCassette(cassette);
    showShareFeedback(result);
  };

  // تنسيق التاريخ
  const formatDate = (timestamp) => {
    if (!timestamp) return 'غير متوفر';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'غير متوفر';
    }
  };

  return (
    <div 
      className={`cassette-card ${isSelected ? 'selected' : ''} ${isPlaying && isSelected ? 'playing' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`شريط ${cassette.reciter || cassette.title}`}
      onKeyPress={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="cassette-body">
        {/* زر المفضلة */}
        <button 
          className={`favorite-btn ${favorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={favorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          {favorite ? <FaHeart /> : <FaRegHeart />}
        </button>

        {/* مؤشر التحميل الكامل */}
        {downloaded && (
          <div className="downloaded-indicator" title="محمل بالكامل - يعمل بدون إنترنت">
            <FaCheckCircle />
          </div>
        )}

        {/* زر المشاركة */}
        <button 
          className="share-btn"
          onClick={handleShareClick}
          title="مشاركة الشريط"
        >
          <FaShare />
        </button>

        <div className="screw screw-top-left"></div>
        <div className="screw screw-top-right"></div>
        <div className="screw screw-bottom-left"></div>
        <div className="screw screw-bottom-right"></div>
        <div className="screw screw-center"></div>

        <div className="cassette-window">
          {/* صورة الشريط/الشيخ */}
          {cassette.imageUrl && (
            <div className="cassette-image">
              <img 
                src={cassette.imageUrl} 
                alt={cassette.title}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          
          <div className="reel reel-left">
            <div className="reel-hub"></div>
            <div className="reel-teeth"></div>
          </div>
          <div className="tape-line"></div>
          <div className="reel reel-right">
            <div className="reel-hub"></div>
            <div className="reel-teeth"></div>
          </div>
        </div>

        <div className="cassette-label">
          <h4 className="label-title">{cassette.reciter || cassette.title}</h4>
          {cassette.reciter && (
            <p className="label-subtitle">{cassette.title}</p>
          )}
        </div>

        <div className="cassette-bottom-slot"></div>
      </div>
    </div>
  );
}

export default React.memo(AudioCard);

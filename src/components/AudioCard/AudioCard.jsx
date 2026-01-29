import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaCheckCircle, FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';
import { isFavorite, addToFavorites, removeFromFavorites } from '../../services/storageService';
import { isCassetteDownloaded } from '../../services/downloadService';
import { shareOnFacebook, shareOnTwitter, shareOnWhatsApp, copyShareLink } from '../../services/shareService';
import { checkVerificationStatus } from '../../services/verificationService';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import './AudioCard.css';

function AudioCard({ cassette, isSelected, isPlaying, onClick }) {
  const [favorite, setFavorite] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // فحص إذا كان في المفضلة والتحميلات عند التحميل
  useEffect(() => {
    if (cassette?.id) {
      setFavorite(isFavorite(cassette.id));
      setDownloaded(isCassetteDownloaded(cassette.id));
    }
    
    // فحص حالة التوثيق
    if (cassette?.userEmail) {
      checkVerificationStatus(cassette.userEmail).then(status => {
        setIsVerified(status.isVerified);
      });
    }
  }, [cassette]);

  // إغلاق قائمة المشاركة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showShareMenu && !e.target.closest('.share-container')) {
        setShowShareMenu(false);
      }
    };
    
    if (showShareMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showShareMenu]);

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

  // فتح/إغلاق قائمة المشاركة
  const handleShareClick = (e) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  // المشاركة على فيسبوك
  const handleFacebookShare = (e) => {
    e.stopPropagation();
    shareOnFacebook(cassette);
    setShowShareMenu(false);
  };

  // المشاركة على تويتر
  const handleTwitterShare = (e) => {
    e.stopPropagation();
    shareOnTwitter(cassette);
    setShowShareMenu(false);
  };

  // المشاركة على واتساب
  const handleWhatsAppShare = (e) => {
    e.stopPropagation();
    shareOnWhatsApp(cassette);
    setShowShareMenu(false);
  };

  // نسخ الرابط
  const handleCopyLink = async (e) => {
    e.stopPropagation();
    const success = await copyShareLink(cassette);
    if (success) {
      // عرض رسالة نجاح بصرية
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ تم النسخ';
      btn.style.background = 'rgba(76, 175, 80, 0.2)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 2000);
    }
    setShowShareMenu(false);
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

        {/* زر المشاركة مع قائمة الخيارات */}
        <div className="share-container">
          <button 
            className={`share-btn ${showShareMenu ? 'active' : ''}`}
            onClick={handleShareClick}
            title="مشاركة الشريط"
          >
            <FaShareAlt />
          </button>
          
          {showShareMenu && (
            <div className="share-menu">
              <button 
                className="share-option facebook"
                onClick={handleFacebookShare}
                title="مشاركة على فيسبوك"
              >
                <FaFacebook />
              </button>
              <button 
                className="share-option twitter"
                onClick={handleTwitterShare}
                title="مشاركة على تويتر"
              >
                <FaTwitter />
              </button>
              <button 
                className="share-option whatsapp"
                onClick={handleWhatsAppShare}
                title="مشاركة على واتساب"
              >
                <FaWhatsapp />
              </button>
              <button 
                className="share-option copy"
                onClick={handleCopyLink}
                title="نسخ الرابط"
              >
                <FaLink />
              </button>
            </div>
          )}
        </div>

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
          <div className="label-title-container">
            <h4 className="label-title">{cassette.reciter || cassette.title}</h4>
            {isVerified && <VerifiedBadge size="small" />}
          </div>
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

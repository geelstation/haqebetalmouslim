import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaGlobe, FaYoutube, FaFacebook, FaTwitter, FaShare } from 'react-icons/fa';
import { getVerifiedUserProfile } from '../../services/verificationService';
import { getUserCassettes } from '../../services/cassetteService';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import './VerifiedUserProfile.css';

function VerifiedUserProfile({ userId }) {
  const [profile, setProfile] = useState(null);
  const [cassettes, setCassettes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getVerifiedUserProfile(userId);
      
      if (!userProfile || !userProfile.isVerified) {
        setProfile(null);
        setLoading(false);
        return;
      }
      
      // الحصول على أشرطة المستخدم باستخدام البريد الإلكتروني
      const allCassettes = await getUserCassettes(userProfile.email);
      
      setProfile(userProfile);
      setCassettes(allCassettes.filter(c => c.status === 'approved'));
    } catch (error) {
      console.error('خطأ في تحميل الملف الشخصي:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: profile.displayName,
        text: profile.bio || `صفحة ${profile.displayName} الموثقة`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط!');
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found">
        <h2>⚠️ الحساب غير موجود أو غير موثق</h2>
        <p>هذا الحساب غير موثق أو تم إلغاء التوثيق</p>
      </div>
    );
  }

  return (
    <div className="verified-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="cover-gradient"></div>
        </div>
        
        <div className="profile-info-container">
          <div className="profile-avatar-section">
            <img 
              src={profile.photoURL || '/default-avatar.png'} 
              alt={profile.displayName}
              className="profile-avatar-large"
            />
          </div>
          
          <div className="profile-main-info">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {profile.displayName}
                <VerifiedBadge size="large" />
              </h1>
              <div className="profile-email">{profile.email}</div>
            </div>
            
            <button className="share-profile-btn" onClick={handleShare}>
              <FaShare /> مشاركة الصفحة
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* Bio */}
        {profile.bio && (
          <div className="profile-section">
            <h2 className="section-title">📝 نبذة تعريفية</h2>
            <div className="profile-bio">
              <p>{profile.bio}</p>
            </div>
          </div>
        )}

        {/* Social Links */}
        {(profile.website || profile.youtube || profile.facebook || profile.twitter) && (
          <div className="profile-section">
            <h2 className="section-title">🔗 الروابط</h2>
            <div className="social-links-grid">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="social-link-card website">
                  <FaGlobe className="social-icon" />
                  <div className="social-info">
                    <div className="social-label">الموقع الإلكتروني</div>
                    <div className="social-value">{profile.website}</div>
                  </div>
                </a>
              )}
              
              {profile.youtube && (
                <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="social-link-card youtube">
                  <FaYoutube className="social-icon" />
                  <div className="social-info">
                    <div className="social-label">قناة يوتيوب</div>
                    <div className="social-value">{profile.youtube}</div>
                  </div>
                </a>
              )}
              
              {profile.facebook && (
                <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="social-link-card facebook">
                  <FaFacebook className="social-icon" />
                  <div className="social-info">
                    <div className="social-label">فيسبوك</div>
                    <div className="social-value">{profile.facebook}</div>
                  </div>
                </a>
              )}
              
              {profile.twitter && (
                <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="social-link-card twitter">
                  <FaTwitter className="social-icon" />
                  <div className="social-info">
                    <div className="social-label">تويتر</div>
                    <div className="social-value">{profile.twitter}</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Cassettes */}
        <div className="profile-section">
          <h2 className="section-title">🎵 الأشرطة ({cassettes.length})</h2>
          {cassettes.length === 0 ? (
            <div className="no-cassettes">
              <p>لا توجد أشرطة منشورة بعد</p>
            </div>
          ) : (
            <div className="cassettes-grid">
              {cassettes.map(cassette => (
                <div key={cassette.id} className="cassette-card-profile">
                  {cassette.imageUrl && (
                    <div className="cassette-image">
                      <img src={cassette.imageUrl} alt={cassette.title} />
                    </div>
                  )}
                  <div className="cassette-info">
                    <h3 className="cassette-title">{cassette.title}</h3>
                    <div className="cassette-meta">
                      <span className="track-count">{cassette.items.length} مقطع</span>
                      {cassette.createdAt && (
                        <span className="upload-date">
                          {new Date(cassette.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifiedUserProfile;

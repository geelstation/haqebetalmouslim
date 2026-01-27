import React, { useState, useEffect } from 'react';
import { FaYoutube, FaInstagram, FaTwitter, FaFacebook, FaTimes, FaEdit } from 'react-icons/fa';
import AudioCard from '../AudioCard/AudioCard';
import { getUserCassettes } from '../../services/cassetteService';
import { updateUserProfile, getUserProfile } from '../../services/userService';
import './UserProfile.css';

function UserProfile({ userId, userName, currentUser, onClose, onCassetteClick }) {
  const [userCassettes, setUserCassettes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    youtube: '',
    instagram: '',
    twitter: '',
    facebook: ''
  });

  const isOwnProfile = currentUser?.uid === userId;

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // تحميل أشرطة المستخدم
      const cassettes = await getUserCassettes(userId);
      setUserCassettes(cassettes.filter(c => c.status === 'approved'));

      // تحميل بروفايل المستخدم
      const profile = await getUserProfile(userId);
      if (profile) {
        setUserProfile(profile);
        setProfileData({
          bio: profile.bio || '',
          youtube: profile.youtube || '',
          instagram: profile.instagram || '',
          twitter: profile.twitter || '',
          facebook: profile.facebook || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(userId, profileData);
      setUserProfile({ ...userProfile, ...profileData });
      setIsEditingProfile(false);
      alert('✅ تم حفظ البروفايل بنجاح');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('❌ حدث خطأ في حفظ البروفايل');
    }
  };

  return (
    <div className="user-profile-overlay" onClick={onClose}>
      <div className="user-profile-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-profile-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* معلومات المستخدم */}
        <div className="profile-header">
          <div className="profile-avatar">
            {userName?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{userName}</h2>
          
          {isEditingProfile ? (
            <div className="profile-edit-form">
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                placeholder="نبذة عنك..."
                className="bio-input"
                rows="3"
              />
              
              <div className="social-inputs">
                <div className="social-input-group">
                  <FaYoutube className="social-icon youtube" />
                  <input
                    type="text"
                    value={profileData.youtube}
                    onChange={(e) => setProfileData({ ...profileData, youtube: e.target.value })}
                    placeholder="رابط قناة اليوتيوب"
                  />
                </div>
                <div className="social-input-group">
                  <FaInstagram className="social-icon instagram" />
                  <input
                    type="text"
                    value={profileData.instagram}
                    onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                    placeholder="رابط الانستقرام"
                  />
                </div>
                <div className="social-input-group">
                  <FaTwitter className="social-icon twitter" />
                  <input
                    type="text"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    placeholder="رابط تويتر"
                  />
                </div>
                <div className="social-input-group">
                  <FaFacebook className="social-icon facebook" />
                  <input
                    type="text"
                    value={profileData.facebook}
                    onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                    placeholder="رابط فيسبوك"
                  />
                </div>
              </div>

              <div className="profile-edit-actions">
                <button onClick={handleSaveProfile} className="save-profile-btn">
                  💾 حفظ
                </button>
                <button onClick={() => setIsEditingProfile(false)} className="cancel-profile-btn">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <>
              {userProfile?.bio && (
                <p className="profile-bio">{userProfile.bio}</p>
              )}
              
              {/* روابط التواصل */}
              <div className="social-links">
                {userProfile?.youtube && (
                  <a href={userProfile.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                    <FaYoutube /> يوتيوب
                  </a>
                )}
                {userProfile?.instagram && (
                  <a href={userProfile.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                    <FaInstagram /> انستقرام
                  </a>
                )}
                {userProfile?.twitter && (
                  <a href={userProfile.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                    <FaTwitter /> تويتر
                  </a>
                )}
                {userProfile?.facebook && (
                  <a href={userProfile.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                    <FaFacebook /> فيسبوك
                  </a>
                )}
              </div>

              {isOwnProfile && (
                <button onClick={() => setIsEditingProfile(true)} className="edit-profile-btn">
                  <FaEdit /> تعديل البروفايل
                </button>
              )}
            </>
          )}
        </div>

        {/* أشرطة المستخدم */}
        <div className="profile-cassettes-section">
          <h3 className="section-title">
            🎵 أشرطة {isOwnProfile ? 'الخاصة بك' : userName} ({userCassettes.length})
          </h3>
          
          {userCassettes.length > 0 ? (
            <div className="cassettes-grid">
              {userCassettes.map(cassette => (
                <AudioCard
                  key={cassette.id}
                  cassette={cassette}
                  onClick={() => onCassetteClick(cassette)}
                />
              ))}
            </div>
          ) : (
            <div className="no-cassettes">
              <p>لا توجد أشرطة معتمدة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

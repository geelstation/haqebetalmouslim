import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { FaUser, FaUserSlash, FaGlobe, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './OnlineUsers.css';

function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [anonymousUsers, setAnonymousUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // الحد الزمني: آخر 10 دقائق = نشط حالياً
    const tenMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 1000));

    // الاستماع للمستخدمين المسجلين النشطين
    const registeredQuery = query(
      collection(db, 'presence'),
      where('isOnline', '==', true),
      where('isAnonymous', '==', false)
    );

    const unsubscribeRegistered = onSnapshot(
      registeredQuery,
      (snapshot) => {
        const users = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.lastSeen && user.lastSeen.toDate() >= tenMinutesAgo.toDate())
          .sort((a, b) => b.lastSeen.toDate() - a.lastSeen.toDate());
        setOnlineUsers(users);
        setLoading(false);
      },
      (error) => {
        console.error('خطأ في جلب المستخدمين المسجلين:', error);
        setLoading(false);
      }
    );

    // الاستماع للزوار غير المسجلين
    const anonymousQuery = query(
      collection(db, 'presence'),
      where('isOnline', '==', true),
      where('isAnonymous', '==', true)
    );

    const unsubscribeAnonymous = onSnapshot(
      anonymousQuery,
      (snapshot) => {
        const users = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => user.lastSeen && user.lastSeen.toDate() >= tenMinutesAgo.toDate())
          .sort((a, b) => b.lastSeen.toDate() - a.lastSeen.toDate());
        setAnonymousUsers(users);
      },
      (error) => {
        console.error('خطأ في جلب الزوار:', error);
      }
    );

    return () => {
      unsubscribeRegistered();
      unsubscribeAnonymous();
    };
  }, []);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'غير معروف';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) return 'الآن';
    if (diffMins === 1) return 'منذ دقيقة';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'منذ ساعة';
    return `منذ ${diffHours} ساعة`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return '0 ثانية';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
    if (minutes > 0) return `${minutes} دقيقة و ${secs} ثانية`;
    return `${secs} ثانية`;
  };

  const translateToArabic = (text) => {
    const translations = {
      // الدول
      'Egypt': 'مصر',
      'United States': 'الولايات المتحدة',
      'Yemen': 'اليمن',
      'Saudi Arabia': 'السعودية',
      'United Arab Emirates': 'الإمارات',
      'Kuwait': 'الكويت',
      'Jordan': 'الأردن',
      'Palestine': 'فلسطين',
      'Lebanon': 'لبنان',
      'Syria': 'سوريا',
      'Iraq': 'العراق',
      'Qatar': 'قطر',
      'Bahrain': 'البحرين',
      'Oman': 'عمان',
      'Morocco': 'المغرب',
      'Algeria': 'الجزائر',
      'Tunisia': 'تونس',
      'Libya': 'ليبيا',
      'Sudan': 'السودان',
      'Unknown': 'غير معروف',
      
      // المدن المصرية
      'Alexandria': 'الإسكندرية',
      'Cairo': 'القاهرة',
      'Giza': 'الجيزة',
      'Ash-Shaykh Zayid': 'الشيخ زايد',
      'Port Said': 'بورسعيد',
      'Suez': 'السويس',
      'Luxor': 'الأقصر',
      'Aswan': 'أسوان',
      'Mansoura': 'المنصورة',
      'Tanta': 'طنطا',
      'Asyut': 'أسيوط',
      'Ismailia': 'الإسماعيلية',
      'Zagazig': 'الزقازيق',
      'Damietta': 'دمياط',
      
      // المدن الأمريكية
      'Ashburn': 'أشبورن',
      'Boardman': 'بوردمان',
      'New York': 'نيويورك',
      'Los Angeles': 'لوس أنجلوس',
      'Chicago': 'شيكاغو',
      'Houston': 'هيوستن',
      'Phoenix': 'فينيكس',
      'Philadelphia': 'فيلادلفيا',
      'San Antonio': 'سان أنطونيو',
      'San Diego': 'سان دييغو',
      'Dallas': 'دالاس',
      'San Jose': 'سان خوسيه',
      
      // المدن اليمنية
      'Sanaa': 'صنعاء',
      'Aden': 'عدن',
      'Taiz': 'تعز',
      'Hodeidah': 'الحديدة',
      'Ibb': 'إب',
      
      // المدن السعودية
      'Riyadh': 'الرياض',
      'Jeddah': 'جدة',
      'Mecca': 'مكة',
      'Medina': 'المدينة',
      'Dammam': 'الدمام',
      'Khobar': 'الخبر',
      
      // المدن الإماراتية
      'Dubai': 'دبي',
      'Abu Dhabi': 'أبوظبي',
      'Sharjah': 'الشارقة',
      'Ajman': 'عجمان',
      
      // المدن الأخرى
      'London': 'لندن',
      'Paris': 'باريس',
      'Berlin': 'برلين',
      'Rome': 'روما',
      'Madrid': 'مدريد',
      'Istanbul': 'إسطنبول',
      'Moscow': 'موسكو',
      'Tokyo': 'طوكيو',
      'Beijing': 'بكين',
      'Seoul': 'سيول',
      'Mumbai': 'مومباي',
      'Delhi': 'دلهي',
      'Karachi': 'كراتشي',
      'Sydney': 'سيدني',
      'Melbourne': 'ملبورن',
      'Toronto': 'تورنتو',
      'Montreal': 'مونتريال'
    };
    
    return translations[text] || text;
  };

  const getLocationString = (location) => {
    if (!location) return 'غير معروف';
    
    const parts = [];
    if (location.city) parts.push(translateToArabic(location.city));
    if (location.country) parts.push(translateToArabic(location.country));
    
    return parts.length > 0 ? parts.join('، ') : 'غير معروف';
  };

  if (loading) {
    return (
      <div className="online-users-loading">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="online-users-container">
      {/* إحصائيات ملخصة */}
      <div className="online-stats">
        <div className="stat-box registered">
          <FaUser className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{onlineUsers.length}</span>
            <span className="stat-label">مستخدم مسجل</span>
          </div>
        </div>
        
        <div className="stat-box anonymous">
          <FaUserSlash className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{anonymousUsers.length}</span>
            <span className="stat-label">زائر</span>
          </div>
        </div>
        
        <div className="stat-box total">
          <FaGlobe className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">{onlineUsers.length + anonymousUsers.length}</span>
            <span className="stat-label">المجموع</span>
          </div>
        </div>
        
        <div className="stat-box duration">
          <FaClock className="stat-icon" />
          <div className="stat-info">
            <span className="stat-number">
              {formatDuration(
                [...onlineUsers, ...anonymousUsers].reduce((sum, u) => sum + (u.sessionDuration || 0), 0)
              )}
            </span>
            <span className="stat-label">إجمالي مدة الجلسات</span>
          </div>
        </div>
      </div>

      {/* المستخدمون المسجلون */}
      {onlineUsers.length > 0 && (
        <div className="users-section">
          <h3 className="section-title">
            <FaUser /> المستخدمون المسجلون ({onlineUsers.length})
          </h3>
          <div className="users-list">
            {onlineUsers.map((user) => (
              <div key={user.id} className="user-card registered detailed">
                <div className="user-header">
                  <img 
                    src={user.photoURL || '/default-avatar.png'} 
                    alt={user.displayName}
                    className="user-avatar"
                  />
                  <div className="user-basic-info">
                    <div className="user-name">{user.displayName || 'مستخدم'}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                  <div className="online-indicator"></div>
                </div>
                
                <div className="user-details-grid">
                  {/* معلومات الموقع */}
                  <div className="detail-section">
                    <div className="section-header">
                      <FaMapMarkerAlt /> الموقع الجغرافي
                    </div>
                    <div className="section-content">
                      <div className="detail-item">
                        <span className="detail-label">الدولة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.country || user.country || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المدينة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.city || user.city || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المنطقة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.region || user.region || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المنطقة الزمنية:</span>
                        <span className="detail-value">{translateToArabic(user.timezone || 'غير معروف')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* معلومات الجهاز */}
                  <div className="detail-section">
                    <div className="section-header">
                      📱 الجهاز والمتصفح
                    </div>
                    <div className="section-content">
                      <div className="detail-item">
                        <span className="detail-label">الجهاز:</span>
                        <span className="detail-value">{translateToArabic(user.device || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">النظام:</span>
                        <span className="detail-value">{translateToArabic(user.os || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المتصفح:</span>
                        <span className="detail-value">{translateToArabic(user.browser || 'غير معروف')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* النشاط والإحصائيات */}
                  <div className="detail-section full-width">
                    <div className="section-header">
                      📊 الإحصائيات والنشاط
                    </div>
                    <div className="section-content stats-grid">
                      <div className="stat-item-small">
                        <div className="stat-icon-small">🔢</div>
                        <div>
                          <div className="stat-value-small">{user.visitCount || 1}</div>
                          <div className="stat-label-small">زيارة</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">⏱️</div>
                        <div>
                          <div className="stat-value-small">{formatDuration(user.sessionDuration || 0)}</div>
                          <div className="stat-label-small">مدة الجلسة</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">🕐</div>
                        <div>
                          <div className="stat-value-small">{formatTimeAgo(user.lastSeen)}</div>
                          <div className="stat-label-small">آخر نشاط</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">📄</div>
                        <div>
                          <div className="stat-value-small" style={{fontSize: '11px'}}>{user.currentPage || '/'}</div>
                          <div className="stat-label-small">الصفحة الحالية</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* الشريط الحالي */}
                  {user.currentlyPlaying && (
                    <div className="detail-section full-width playing-now">
                      <div className="section-header">
                        🎵 يستمع الآن
                      </div>
                      <div className="currently-playing-details">
                        <div className="cassette-name">{user.currentlyPlaying.cassetteTitle}</div>
                        {user.currentlyPlaying.itemTitle && (
                          <div className="track-name">{user.currentlyPlaying.itemTitle}</div>
                        )}
                        <div className="play-time">بدأ منذ {formatTimeAgo(user.currentlyPlaying.timestamp)}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* الأكثر استماعاً */}
                  {user.mostPlayedCassette && (
                    <div className="detail-section full-width favorite">
                      <div className="section-header">
                        ⭐ الشريط المفضل
                      </div>
                      <div className="favorite-details">
                        <div className="cassette-name">{user.mostPlayedCassette.title}</div>
                        <div className="play-count">استمع له {user.mostPlayedCassette.count} مرة</div>
                      </div>
                    </div>
                  )}
                  
                  {/* تاريخ التشغيل */}
                  {user.playHistory && user.playHistory.length > 0 && (
                    <div className="detail-section full-width history">
                      <div className="section-header">
                        📜 تاريخ الاستماع ({user.playHistory.length})
                      </div>
                      <div className="play-history-list">
                        {user.playHistory.slice(0, 5).map((play, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-title">{play.cassetteTitle}</div>
                            <div className="history-time">{formatTimeAgo(play.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* الزوار غير المسجلين */}
      {anonymousUsers.length > 0 && (
        <div className="users-section">
          <h3 className="section-title">
            <FaUserSlash /> الزوار ({anonymousUsers.length})
          </h3>
          <div className="users-list">
            {anonymousUsers.map((user) => (
              <div key={user.id} className="user-card anonymous detailed">
                <div className="user-header">
                  <FaUserSlash className="anonymous-icon-large" />
                  <div className="user-basic-info">
                    <div className="user-name">زائر</div>
                    <div className="user-id-badge">ID: {user.id.substring(0, 12)}...</div>
                  </div>
                  <div className="online-indicator"></div>
                </div>
                
                <div className="user-details-grid">
                  {/* معلومات الموقع */}
                  <div className="detail-section">
                    <div className="section-header">
                      <FaMapMarkerAlt /> الموقع الجغرافي
                    </div>
                    <div className="section-content">
                      <div className="detail-item">
                        <span className="detail-label">الدولة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.country || user.country || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المدينة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.city || user.city || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المنطقة:</span>
                        <span className="detail-value">{translateToArabic(user.location?.region || user.region || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">IP:</span>
                        <span className="detail-value" style={{fontSize: '11px'}}>{user.ip || 'مخفي'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* معلومات الجهاز */}
                  <div className="detail-section">
                    <div className="section-header">
                      📱 الجهاز والمتصفح
                    </div>
                    <div className="section-content">
                      <div className="detail-item">
                        <span className="detail-label">الجهاز:</span>
                        <span className="detail-value">{translateToArabic(user.device || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">النظام:</span>
                        <span className="detail-value">{translateToArabic(user.os || 'غير معروف')}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">المتصفح:</span>
                        <span className="detail-value">{translateToArabic(user.browser || 'غير معروف')}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* النشاط والإحصائيات */}
                  <div className="detail-section full-width">
                    <div className="section-header">
                      📊 الإحصائيات والنشاط
                    </div>
                    <div className="section-content stats-grid">
                      <div className="stat-item-small">
                        <div className="stat-icon-small">🔢</div>
                        <div>
                          <div className="stat-value-small">{user.visitCount || 1}</div>
                          <div className="stat-label-small">زيارة</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">⏱️</div>
                        <div>
                          <div className="stat-value-small">{formatDuration(user.sessionDuration || 0)}</div>
                          <div className="stat-label-small">مدة الجلسة</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">🕐</div>
                        <div>
                          <div className="stat-value-small">{formatTimeAgo(user.lastSeen)}</div>
                          <div className="stat-label-small">آخر نشاط</div>
                        </div>
                      </div>
                      <div className="stat-item-small">
                        <div className="stat-icon-small">📄</div>
                        <div>
                          <div className="stat-value-small" style={{fontSize: '11px'}}>{user.currentPage || '/'}</div>
                          <div className="stat-label-small">الصفحة الحالية</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* الشريط الحالي */}
                  {user.currentlyPlaying && (
                    <div className="detail-section full-width playing-now">
                      <div className="section-header">
                        🎵 يستمع الآن
                      </div>
                      <div className="currently-playing-details">
                        <div className="cassette-name">{user.currentlyPlaying.cassetteTitle}</div>
                        {user.currentlyPlaying.itemTitle && (
                          <div className="track-name">{user.currentlyPlaying.itemTitle}</div>
                        )}
                        <div className="play-time">بدأ منذ {formatTimeAgo(user.currentlyPlaying.timestamp)}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* الأكثر استماعاً */}
                  {user.mostPlayedCassette && (
                    <div className="detail-section full-width favorite">
                      <div className="section-header">
                        ⭐ الشريط المفضل
                      </div>
                      <div className="favorite-details">
                        <div className="cassette-name">{user.mostPlayedCassette.title}</div>
                        <div className="play-count">استمع له {user.mostPlayedCassette.count} مرة</div>
                      </div>
                    </div>
                  )}
                  
                  {/* تاريخ التشغيل */}
                  {user.playHistory && user.playHistory.length > 0 && (
                    <div className="detail-section full-width history">
                      <div className="section-header">
                        📜 تاريخ الاستماع ({user.playHistory.length})
                      </div>
                      <div className="play-history-list">
                        {user.playHistory.slice(0, 5).map((play, idx) => (
                          <div key={idx} className="history-item">
                            <div className="history-title">{play.cassetteTitle}</div>
                            <div className="history-time">{formatTimeAgo(play.timestamp)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {onlineUsers.length === 0 && anonymousUsers.length === 0 && (
        <div className="empty-state">
          <p>لا يوجد مستخدمون متصلون حالياً</p>
        </div>
      )}
    </div>
  );
}

export default OnlineUsers;

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
    // الحد الزمني: آخر 5 دقائق = نشط حالياً
    const fiveMinutesAgo = Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000));

    // الاستماع للمستخدمين المسجلين النشطين
    const registeredQuery = query(
      collection(db, 'presence'),
      where('isOnline', '==', true),
      where('lastSeen', '>=', fiveMinutesAgo),
      where('isAnonymous', '==', false),
      orderBy('lastSeen', 'desc')
    );

    const unsubscribeRegistered = onSnapshot(
      registeredQuery,
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
      where('lastSeen', '>=', fiveMinutesAgo),
      where('isAnonymous', '==', true),
      orderBy('lastSeen', 'desc')
    );

    const unsubscribeAnonymous = onSnapshot(
      anonymousQuery,
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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

  const getLocationString = (location) => {
    if (!location) return 'غير معروف';
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'غير معروف';
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
      </div>

      {/* المستخدمون المسجلون */}
      {onlineUsers.length > 0 && (
        <div className="users-section">
          <h3 className="section-title">
            <FaUser /> المستخدمون المسجلون ({onlineUsers.length})
          </h3>
          <div className="users-list">
            {onlineUsers.map((user) => (
              <div key={user.id} className="user-card registered">
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt={user.displayName}
                  className="user-avatar"
                />
                <div className="user-details">
                  <div className="user-name">{user.displayName || 'مستخدم'}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-meta">
                    <span className="user-location">
                      <FaMapMarkerAlt /> {getLocationString(user.location)}
                    </span>
                    <span className="user-time">
                      <FaClock /> {formatTimeAgo(user.lastSeen)}
                    </span>
                  </div>
                  {user.currentPage && (
                    <div className="user-activity">
                      📄 {user.currentPage}
                    </div>
                  )}
                </div>
                <div className="online-indicator active"></div>
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
              <div key={user.id} className="user-card anonymous">
                <FaUserSlash className="anonymous-icon" />
                <div className="user-details">
                  <div className="user-name">زائر</div>
                  <div className="user-meta">
                    <span className="user-location">
                      <FaMapMarkerAlt /> {getLocationString(user.location)}
                    </span>
                    <span className="user-time">
                      <FaClock /> {formatTimeAgo(user.lastSeen)}
                    </span>
                  </div>
                  {user.currentPage && (
                    <div className="user-activity">
                      📄 {user.currentPage}
                    </div>
                  )}
                  <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                </div>
                <div className="online-indicator active"></div>
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

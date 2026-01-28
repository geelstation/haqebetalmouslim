import React, { useState, useEffect } from 'react';
import { FaPlus, FaSignOutAlt, FaSignInAlt, FaMoon, FaSun, FaMosque } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getAppSettings } from '../../services/settingsService';
import './TopBar.css';

function TopBar({ onAddCassetteClick }) {
  const { currentUser, logout, loginWithGoogle, lastAuthError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [topBarMessages, setTopBarMessages] = useState(['بسم الله الرحمن الرحيم']);
  const [separatorIcon, setSeparatorIcon] = useState('☪');

  // جلب رسالة الشريط العلوي من Firebase
  useEffect(() => {
    const loadMessage = async () => {
      try {
        const settings = await getAppSettings();
        if (settings.topBarMessages && settings.topBarMessages.length > 0) {
          setTopBarMessages(settings.topBarMessages);
        } else if (settings.topBarMessage) {
          // دعم الصيغة القديمة
          setTopBarMessages([settings.topBarMessage]);
        }
        
        // تحميل الأيقونة المحفوظة
        if (settings.separatorIcon) {
          setSeparatorIcon(settings.separatorIcon);
        }
      } catch (error) {
        console.error('خطأ في تحميل رسالة الشريط العلوي:', error);
      }
    };
    
    loadMessage();
    
    // تحديث الرسالة كل 30 ثانية
    const interval = setInterval(loadMessage, 30000);
    return () => clearInterval(interval);
  }, []);

  // عرض أخطاء إعادة التوجيه (إن وجدت) بشكل ودي للمستخدم
  useEffect(() => {
    if (lastAuthError) {
      const code = lastAuthError?.code || 'unknown';
      const message = lastAuthError?.message || '';
      const hints = [];
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        hints.push('المتصفح منع النافذة المنبثقة — سيتم استخدام إعادة التوجيه تلقائياً.');
      }
      if (code === 'auth/unauthorized-domain') {
        hints.push('أضِف النطاق: geelstation.github.io إلى Authorized domains في Firebase Auth.');
        hints.push('أضِف أيضاً: localhost أثناء التطوير المحلي.');
      }
      if (code === 'auth/operation-not-allowed') {
        hints.push('فعّل موفّر Google من صفحة Authentication → Sign-in method في Firebase.');
      }
      alert(`فشل تسجيل الدخول. الكود: ${code}\n${message}\n${hints.join('\n')}`);
    }
  }, [lastAuthError]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      const code = error?.code || 'unknown';
      const message = error?.message || '';
      const hints = [];
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        hints.push('المتصفح منع النافذة المنبثقة — سيتم استخدام إعادة التوجيه تلقائياً.');
      }
      if (code === 'auth/unauthorized-domain') {
        hints.push('أضِف النطاق: geelstation.github.io إلى Authorized domains في Firebase Auth.');
      }
      alert(`فشل تسجيل الدخول. الكود: ${code}\n${message}\n${hints.join('\n')}`);
    }
  };

  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <h1 className="app-title">حقيبة المسلم</h1>
        <div className="message-area">
          <p className="message-text">
            {topBarMessages.map((msg, index) => (
              <span key={index}>
                {msg}
                {index < topBarMessages.length - 1 && (
                  <span className="message-separator">{separatorIcon}</span>
                )}
              </span>
            ))}
          </p>
        </div>
        
        {/* أزرار الإجراءات */}
        <div className="top-bar-actions">
          <button 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={
              theme === 'dark' ? 'وضع فاتح' :
              theme === 'light' ? 'المسجد النبوي' :
              theme === 'islamic1' ? 'قبة الصخرة' :
              theme === 'islamic2' ? 'المخطوطات' :
              theme === 'islamic3' ? 'الكعبة' :
              theme === 'islamic4' ? 'المسجد الحرام' :
              'وضع داكن'
            }
          >
            {theme === 'dark' || theme === 'light' ? <FaMosque /> : <FaMosque />}
          </button>

          {currentUser ? (
            <>
              <button 
                className="add-cassette-btn"
                onClick={onAddCassetteClick}
                title="إضافة شريط جديد"
              >
                <FaPlus />
                <span>إضافة شريط</span>
              </button>

              <div className="user-section">
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName}
                  className="user-avatar"
                />
                <span className="user-name">{currentUser.displayName}</span>
                <button 
                  className="logout-btn"
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </>
          ) : (
            <button 
              className="login-btn"
              onClick={handleLogin}
              title="تسجيل الدخول"
            >
              <FcGoogle className="google-icon" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;

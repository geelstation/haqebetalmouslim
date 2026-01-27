import { useEffect } from 'react';

/**
 * Hook لاختصارات لوحة المفاتيح
 * @param {Object} handlers - مجموعة من الوظائف لكل اختصار
 */
export const useKeyboardShortcuts = (handlers) => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // تجاهل إذا كان المستخدم يكتب في حقل إدخال
      if (event.target.tagName === 'INPUT' || 
          event.target.tagName === 'TEXTAREA' || 
          event.target.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      
      // Space - تشغيل/إيقاف
      if (key === ' ' && handlers.onPlayPause) {
        event.preventDefault();
        handlers.onPlayPause();
      }
      
      // Arrow Right - تقديم 10 ثواني
      if (key === 'arrowright' && handlers.onSeekForward) {
        event.preventDefault();
        handlers.onSeekForward();
      }
      
      // Arrow Left - ترجيع 10 ثواني
      if (key === 'arrowleft' && handlers.onSeekBackward) {
        event.preventDefault();
        handlers.onSeekBackward();
      }
      
      // Arrow Up - رفع الصوت
      if (key === 'arrowup' && handlers.onVolumeUp) {
        event.preventDefault();
        handlers.onVolumeUp();
      }
      
      // Arrow Down - خفض الصوت
      if (key === 'arrowdown' && handlers.onVolumeDown) {
        event.preventDefault();
        handlers.onVolumeDown();
      }
      
      // N - التالي
      if (key === 'n' && handlers.onNext) {
        event.preventDefault();
        handlers.onNext();
      }
      
      // P - السابق
      if (key === 'p' && handlers.onPrevious) {
        event.preventDefault();
        handlers.onPrevious();
      }
      
      // M - كتم الصوت
      if (key === 'm' && handlers.onMute) {
        event.preventDefault();
        handlers.onMute();
      }
      
      // S - إيقاف
      if (key === 's' && handlers.onStop) {
        event.preventDefault();
        handlers.onStop();
      }
      
      // F - ملء الشاشة
      if (key === 'f' && handlers.onToggleFullscreen) {
        event.preventDefault();
        handlers.onToggleFullscreen();
      }
      
      // أرقام 0-9 للقفز إلى نسب مئوية (0% - 90%)
      if (/^[0-9]$/.test(key) && handlers.onSeekToPercent) {
        event.preventDefault();
        const percent = parseInt(key) * 10;
        handlers.onSeekToPercent(percent);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handlers]);
};

export default useKeyboardShortcuts;

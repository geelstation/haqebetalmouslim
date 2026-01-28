import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // منع الضغط المزدوج
  const [lastAuthError, setLastAuthError] = useState(null);

  // ✅ ضبط استمرارية الجلسة عند التحميل الأول
  useEffect(() => {
    const initPersistence = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        console.log('✅ Auth Persistence: LOCAL (الجلسة ستبقى دائماً)');
      } catch (error) {
        console.warn('⚠️ فشل ضبط استمرارية الجلسة:', error);
      }
    };
    initPersistence();
  }, []);

  // مراقبة حالة المستخدم من Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('👤 المستخدم مسجل الدخول:', user.email);
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous || false
        });
      } else {
        console.log('👤 لا يوجد مستخدم مسجل');
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // معالجة نتيجة إعادة التوجيه بعد عودة الصفحة من Google
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        // عند النجاح، سيتم تحديث المستخدم تلقائياً عبر onAuthStateChanged
        if (result?.user) {
          setLastAuthError(null);
        }
      } catch (error) {
        console.error('خطأ نتيجة إعادة التوجيه:', error);
        setLastAuthError(error);
      }
    };

    checkRedirectResult();
  }, []);

  // تسجيل دخول بواسطة Google
  const loginWithGoogle = async () => {
    // منع الضغط المتكرر
    if (isAuthenticating) {
      console.warn('⚠️ عملية تسجيل دخول جارية بالفعل');
      return;
    }

    try {
      setIsAuthenticating(true);
      setLastAuthError(null);
      
      // استخدام لغة الجهاز لواجهة Google
      auth.useDeviceLanguage?.();

      // محاولة عبر Popup أولاً
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);

      // تجاهل خطأ cancelled-popup-request (المستخدم أغلق النافذة)
      if (error?.code === 'auth/cancelled-popup-request') {
        console.log('ℹ️ تم إلغاء popup القديم لفتح واحد جديد');
        return;
      }

      // أخطاء شائعة على GitHub Pages: منع النوافذ المنبثقة أو نطاق غير مخوّل
      const code = error?.code || '';
      const popupBlocked = code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user';
      const unauthorizedDomain = code === 'auth/unauthorized-domain';

      if (popupBlocked || unauthorizedDomain) {
        try {
          await signInWithRedirect(auth, googleProvider);
          // لا يمكن الحصول على النتيجة هنا لأن الصفحة ستنتقل، وسيتم التقاطها في useEffect أعلاه
          return null;
        } catch (redirectError) {
          console.error('خطأ في تسجيل الدخول بإعادة التوجيه:', redirectError);
          // إعادة تمرير الخطأ لكي يظهر للمستخدم
          throw redirectError;
        }
      }
      // إعادة تمرير الخطأ الأصلي لكي نحصل على code/message في الواجهة
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // تسجيل خروج
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    loading,
    isAuthenticating,
    lastAuthError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

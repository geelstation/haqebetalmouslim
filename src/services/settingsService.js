import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_DOC_ID = 'appSettings';

// جلب إعدادات التطبيق
export const getAppSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data();
    } else {
      // إعدادات افتراضية
      return {
        topBarMessage: 'بسم الله الرحمن الرحيم'
      };
    }
  } catch (error) {
    console.error('❌ خطأ في جلب الإعدادات:', error);
    // في حالة الخطأ، إرجاع القيمة الافتراضية
    return {
      topBarMessage: 'بسم الله الرحمن الرحيم'
    };
  }
};

// تحديث رسالة الشريط العلوي (للأدمن فقط)
export const updateTopBarMessage = async (messages, separatorIcon = '☪') => {
  try {
    const settingsRef = doc(db, 'settings', SETTINGS_DOC_ID);
    
    // دعم الرسائل المتعددة والرسالة الواحدة
    const messageData = Array.isArray(messages) ? messages : [messages];
    
    await setDoc(settingsRef, {
      topBarMessages: messageData,
      topBarMessage: messageData[0], // للتوافق مع الإصدارات القديمة
      separatorIcon: separatorIcon,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ تم تحديث رسائل الشريط العلوي');
    return true;
  } catch (error) {
    console.error('❌ خطأ في تحديث الرسائل:', error);
    throw error;
  }
};

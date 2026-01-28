import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuw9wrp1J425Eq9ICq-e1F4c9nIfQFxb8",
  authDomain: "haqebetelmuslim.firebaseapp.com",
  projectId: "haqebetelmuslim",
  storageBucket: "haqebetelmuslim.firebasestorage.app",
  messagingSenderId: "803361212566",
  appId: "1:803361212566:web:58dc843f545c3e6a81dab7",
  measurementId: "G-9KP2M8DNN2"
};

console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase initialized');

export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ إبقاء الجلسة مفتوحة (لا تسجيل خروج تلقائي)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ تم ضبط الاستمرارية على LOCAL - الجلسة ستبقى مفتوحة');
  })
  .catch((error) => {
    console.warn('⚠️ فشل ضبط الاستمرارية:', error);
  });

export const googleProvider = new GoogleAuthProvider();
// تحسين تجربة اختيار الحساب
try {
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch {}

// عنوان البريد الإلكتروني للمسؤول
export const ADMIN_EMAIL = "geelstation@gmail.com";

console.log('✅ Firebase config loaded');

export default app;

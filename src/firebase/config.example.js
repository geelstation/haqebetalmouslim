// مثال على ملف Firebase Config
// انسخ هذا الملف إلى config.js وضع إعداداتك الحقيقية

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// احصل على هذه القيم من Firebase Console
// Project Settings → General → Your apps → Firebase SDK snippet
const firebaseConfig = {
  apiKey: "AIzaSy...",                  // مثال: AIzaSyAbCdEf1234567890
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// لا تعدل هذا القسم
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

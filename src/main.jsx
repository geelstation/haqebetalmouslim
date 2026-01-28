import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';
import './animations.css';

console.log('🚀 Starting application...');

const rootElement = document.getElementById('root');
console.log('📦 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
  console.log('✅ App rendered successfully');
}

// 🔧 تسجيل Service Worker للعمل Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/haqebetalmouslim/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // التحقق من التحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Service Worker update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // يوجد تحديث جديد - يمكن إظهار رسالة للمستخدم
              console.log('✨ New Service Worker available - refresh to update');
            }
          });
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

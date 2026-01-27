// Service Worker لتطبيق حقيبة المسلم
// يوفر عمل التطبيق Offline بالكامل

const CACHE_NAME = 'haqebetalmouslim-v1.0.0';
const AUDIO_CACHE_NAME = 'haqebetalmouslim-audio-v1.0.0';
const OFFLINE_CACHE_NAME = 'haqebetalmouslim-offline-v1.0.0';

// الملفات الأساسية للتخزين المؤقت
const STATIC_FILES = [
  '/haqebetalmouslim/',
  '/haqebetalmouslim/index.html',
  '/haqebetalmouslim/favicon.svg',
  '/haqebetalmouslim/manifest.json'
];

// ✅ تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(() => {
        console.log('✅ Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Install failed:', error);
      })
  );
});

// ✅ تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف الcaches القديمة
            if (cacheName !== CACHE_NAME && 
                cacheName !== AUDIO_CACHE_NAME && 
                cacheName !== OFFLINE_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// ✅ معالجة الطلبات (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // تجاهل طلبات Firebase و Chrome Extensions
  if (url.origin.includes('firebaseio.com') || 
      url.origin.includes('googleapis.com') ||
      url.origin.includes('gstatic.com') ||
      url.origin.includes('firebase') ||
      url.origin.includes('google') ||
      url.protocol === 'chrome-extension:') {
    return; // لا نخزن مؤقتاً - نترك Firebase يعمل بحرية
  }
  
  // ✅ استراتيجية مختلفة للملفات الصوتية
  if (request.url.includes('.mp3') || request.url.includes('audio')) {
    event.respondWith(audioFetchStrategy(request));
    return;
  }
  
  // ✅ استراتيجية Network First للـ HTML/JSON
  if (request.method === 'GET' && 
      (request.headers.get('Accept')?.includes('text/html') || 
       request.url.includes('.json'))) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // ✅ استراتيجية Cache First للملفات الثابتة
  event.respondWith(cacheFirstStrategy(request));
});

// 🎵 استراتيجية الملفات الصوتية (Cache then Network)
async function audioFetchStrategy(request) {
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('🎵 Audio: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // تحميل من الشبكة وحفظ في Cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      console.log('📥 Audio: Caching new audio file:', request.url);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Audio fetch failed:', error);
    return new Response('Audio not available offline', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    });
  }
}

// 🌐 Network First (للصفحات الديناميكية)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // إذا لم يوجد في Cache، أرجع صفحة Offline
    return caches.match('/haqebetalmouslim/index.html');
  }
}

// 💾 Cache First (للملفات الثابتة)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Fetch failed:', error);
    return new Response('Resource not available offline', { 
      status: 503 
    });
  }
}

// ✅ معالجة رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // تنظيف الcache عند الطلب
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// ✅ معالجة التحديثات في الخلفية (Background Sync)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  console.log('📊 Background Sync: Syncing analytics...');
  // يمكن إضافة منطق مزامنة هنا
}

console.log('✅ Service Worker loaded successfully');

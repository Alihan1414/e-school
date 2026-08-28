// Service Worker for E-School Daara (PWA & Offline-First Caching)
const CACHE_NAME = 'eschool-daara-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/presentation.html',
  '/manifest.json',
  '/css/style.css',
  '/css/dashboard.css',
  '/css/print.css',
  '/js/data.js',
  '/js/hardware-manager.js',
  '/js/i18n-engine.js',
  '/js/i18n/fr.js',
  '/js/i18n/wo.js',
  '/js/i18n/en.js',
  '/js/i18n/es.js',
  '/js/firebase-config.js',
  '/js/firebase-service.js',
  '/js/api-client.js',
  '/js/app.js'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell and offline assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Network-First with Cache Fallback for dynamic data, Cache-First for static assets)
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or external chrome-extension schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid responses dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

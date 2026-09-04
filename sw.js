// Service Worker for E-School Daara (PWA & Offline-First Enterprise Caching)
const CACHE_NAME = 'eschool-daara-v27';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './presentation.html',
  './manifest.json',
  './css/style.css',
  './css/dashboard.css',
  './css/print.css',
  './icons/logo.png',
  './icons/logo.svg',
  './icons/logo-horizontal.svg',
  './icons/favicon.svg',
  './icons/favicon-32x32.png',
  './icons/favicon-16x16.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/logo-transparent.svg',
  './icons/logo-horizontal-dark.svg',
  './js/data.js',
  './js/hardware-manager.js',
  './js/i18n-engine.js',
  './js/i18n/fr.js',
  './js/i18n/wo.js',
  './js/i18n/en.js',
  './js/i18n/es.js',
  './js/device-detector.js',
  './js/pwa-installer.js',
  './js/offline-sync.js',
  './js/attendance.js',
  './js/grades.js',
  './js/firebase-config.js',
  './js/firebase-service.js',
  './js/api-client.js',
  './js/app.js'
];

// Skip waiting on demand
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// Install Event - Precache Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Precaching app shell and corporate assets');
      for (const url of ASSETS_TO_CACHE) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[Service Worker] Pre-cache skip for:', url, err.message);
        }
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Purging old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale While Revalidate / Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Handle HTML navigation requests
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html') || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Handle static assets & APIs
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// KNOX Shop - Service Worker
const CACHE_NAME = 'knox-shop-v1';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './style.css',
  './app.js',
  './lang.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          if (e.request.url.startsWith('http')) cache.put(e.request, clone).catch(() => {});
        });
        return res;
      }).catch(() => cached);
    })
  );
});

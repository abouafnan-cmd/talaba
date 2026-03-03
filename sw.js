// sw.js
const CACHE_NAME = 'institute-app-v2'; // قمنا بتغيير الإصدار لكي يتحدث الكاش
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './js/auth.js',
  './app.js',
  './icons/192.png',  // إضافة الأيقونة الصغيرة
  './icons/512.png'   // إضافة الأيقونة الكبيرة
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
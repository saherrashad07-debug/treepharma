const CACHE_NAME = 'tree-pharma-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './logo.jpg.jpg',
  './data.json',
  './offers.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // مهم جداً عشان يفعل النسخة الجديدة على طول
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // مهم جداً عشان يسيطر على الصفحة فوراً
});

// هنا بقوله دايماً روح هات من النت الأول، ولو النت فاصل ارجع للنسخة المحفوظة
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // لو فيه نت، احفظ النسخة الجديدة
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // لو النت فاصل، افتح المحفوظ
  );
});

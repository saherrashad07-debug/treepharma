const CACHE_NAME = 'tree-pharma-cache-v6'; // الإصدار السادس
const urlsToCache = [
  './',
  './index.html',
  './logo.jpg.jpg'
];

// 1. عند التثبيت: تخطى الانتظار وسيطر فوراً
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 2. عند التفعيل: امسح أي ذاكرة قديمة وسيطر على كل الصفحات المفتوحة
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // دي السطر اللي بيخليه يتحكم في الموقع فوراً
});

// 3. عند الفتح: دايماً اسأل النت الأول، ولو النت فاصل افتح الذاكرة
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

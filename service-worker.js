const CACHE_NAME = 'tree-pharma-cache-v4'; // تم تغيير رقم الإصدار
const urlsToCache = [
  './',
  './index.html',
  './logo.jpg.jpg'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // بيخلي النسخة الجديدة تتفعل على طول
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name)) // بيمسح أي ذاكرة قديمة
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // ملفات HTML و JSON: دايماً هات من النت الأول عشان التحديثات توصل فوراً
  if (requestUrl.pathname.endsWith('.json') || requestUrl.pathname.endsWith('.html') || requestUrl.pathname === '/') {
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
        .catch(() => caches.match(event.request)) // لو النت فاصل، افتح القديم
    );
    return;
  }

  // باقي الملفات (صور وكود): افتح القديم بسرعة، وبعدين حدثه في الخلفية
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        const fetchPromise = fetch(event.request).then(fetchRes => {
          if (fetchRes && fetchRes.status === 200) {
            const fetchResClone = fetchRes.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, fetchResClone);
            });
          }
          return fetchRes;
        }).catch(() => response);
        return response || fetchPromise;
      })
  );
});

const CACHE_NAME = 'tree-pharma-cache-v3'; // تم تغيير رقم الإصدار لإجبار المتصفح على التحديث

// قائمة الملفات الأساسية للتطبيق
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './logo.jpg.jpg',
    './medical.json',
    './cosmetics.json',
    './offers.json'
];

// 1. تثبيت الـ Service Worker وحفظ الملفات الأساسية
self.addEventListener('install', event => {
    self.skipWaiting(); // إجبار التفعيل فوراً بدون انتظار إغلاق الصفحات
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// 2. تفعيل الـ Service Worker وحذف الكاش القديم فوراً
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // مسح أي كاش قديم فوراً
                    }
                })
            );
        })
    );
    self.clients.claim(); // السيطرة على جميع الصفحات المفتوحة فوراً
});

// 3. استراتيجية الجلب (Network First للـ HTML والـ JSON - Cache First للصور)
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // للملفات الأساسية وملفات البيانات (HTML, JSON): ابحث عن النسخة الجديدة من الإنترنت أولاً
    if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.json') || requestUrl.pathname.endsWith('.html')) {
        event.respondWith(
            fetch(event.request, { cache: 'no-cache' }).then(response => {
                // لو الرد تمام، احفظ النسخة الجديدة في الكاش واعرضها
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            }).catch(() => {
                // لو مفيش إنترنت، اعرض النسخة القديمة المحفوظة
                return caches.match(event.request);
            })
        );
    } else {
        // للصور والملفات الثابتة: اعرض من الكاش أولاً لسرعة الفتح، ولو مش موجودة جيبها من النت
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});

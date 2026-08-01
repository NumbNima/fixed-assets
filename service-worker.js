const CACHE_NAME = 'fixed-assets-v1';

// فقط فایل‌های ایستا و بی‌خطر کش می‌شن (نه صفحه‌ی اصلی)
const STATIC_ASSETS = [
  'manifest.json',
  'icon-192.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // پاک کردن کش‌های نسخه‌ی قدیمی
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // فقط درخواست‌های GET همین سایت رو مدیریت کن
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // navigation requests (خود صفحه‌ی HTML): همیشه network-first
  // این تضمین می‌کنه چک رمز (Basic Auth) هر بار واقعاً انجام بشه
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // فایل‌های ایستا (فونت، آیکون، manifest): cache-first برای سرعت،
  // ولی در پس‌زمینه آپدیت می‌شن (stale-while-revalidate)
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

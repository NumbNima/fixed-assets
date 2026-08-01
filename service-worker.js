// این نسخه عمداً خودش را غیرفعال می‌کند تا کش‌های قبلی که
// باعث دور زدن احراز هویت می‌شدند پاک شوند.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // پاک کردن تمام کش‌های قدیمی
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      // خارج کردن این Service Worker از ثبت
      await self.registration.unregister();
      // اجبار به رفرش تمام تب‌های باز
      const clientsList = await self.clients.matchAll({ type: 'window' });
      clientsList.forEach((client) => client.navigate(client.url));
    })()
  );
});

/* Service Worker v9 - 清除所有快取並停用 */
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* 不攔截任何請求，全部直接去網路 */
self.addEventListener('fetch', function(event) {
  /* pass-through - do nothing */
});

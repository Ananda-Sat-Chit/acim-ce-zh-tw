/* Service Worker v7 — 版本更新會自動清除 v6 舊快取 */
const CACHE_CORE = 'acim-core-v7';
const CACHE_FONT = 'acim-font-v7';

const CORE_FILES = [
  './',
  './index.htm',
  './manifest.json',
  './favicon.ico',
  './pwa-192x192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_CORE).then(function (cache) {
      return cache.addAll(CORE_FILES);
    }).then(function () {
      return self.skipWaiting(); // 強制立即取代舊 SW
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k !== CACHE_CORE && k !== CACHE_FONT;
        }).map(function (k) {
          console.log('[SW] 刪除舊快取:', k);
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim(); // 立即接管所有分頁
    })
  );
});

self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  /* Google Fonts → staleWhileRevalidate */
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONT).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          var fetchPromise = fetch(event.request).then(function (response) {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(function () { return cached; });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  /* 核心檔案 → network-first（確保拿到最新版） */
  if (url.includes('index.htm') || url.endsWith('/') || url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_CORE).then(function (cache) { cache.put(event.request, clone); });
        return response;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  /* 其他靜態資源 → cache-first */
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});

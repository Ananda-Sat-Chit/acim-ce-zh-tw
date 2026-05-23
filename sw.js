/* Service Worker v6 — 快取策略：核心離線 + 字型 staleWhileRevalidate */
const CACHE_CORE = 'acim-core-v6';
const CACHE_FONT = 'acim-font-v6';

const CORE_FILES = [
  './',
  './index.htm',
  './manifest.json',
  './favicon.ico',
  './pwa-192x192.png',
  './icon-512.png'
];

/* install：快取核心檔案 */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_CORE).then(function (cache) {
      return cache.addAll(CORE_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

/* activate：清除舊版快取 */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k !== CACHE_CORE && k !== CACHE_FONT;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* fetch：三種策略 */
self.addEventListener('fetch', function (event) {
  var url = event.request.url;

  /* 字型（Google Fonts）→ staleWhileRevalidate */
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

  /* 核心檔案 → cache-first */
  if (CORE_FILES.some(function (f) { return url.endsWith(f.replace('./', '')); }) || url === self.location.origin + '/') {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        return cached || fetch(event.request);
      })
    );
    return;
  }

  /* 其他 → network-first */
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request);
    })
  );
});

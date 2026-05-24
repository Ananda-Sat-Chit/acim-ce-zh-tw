/* Service Worker v8 */
const CACHE_CORE = 'acim-core-v8';
const CACHE_FONT = 'acim-font-v8';

const CORE_FILES = [
  './',
  './index.htm',
  './manifest.json',
  './favicon.ico',
  './pwa-192x192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_CORE)
      .then(function(cache) { return cache.addAll(CORE_FILES); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_CORE && k !== CACHE_FONT; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  /* Google Fonts → stale-while-revalidate */
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_FONT).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var fresh = fetch(event.request).then(function(res) {
            if (res && res.status === 200) cache.put(event.request, res.clone());
            return res;
          }).catch(function() { return cached; });
          return cached || fresh;
        });
      })
    );
    return;
  }

  /* index.htm → network-first（永遠拿最新版） */
  if (url.includes('index.htm') || url.endsWith('/') || url.endsWith('/acim-ce-zh-tw/')) {
    event.respondWith(
      fetch(event.request).then(function(res) {
        caches.open(CACHE_CORE).then(function(c) { c.put(event.request, res.clone()); });
        return res;
      }).catch(function() { return caches.match(event.request); })
    );
    return;
  }

  /* 其他 → cache-first */
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});

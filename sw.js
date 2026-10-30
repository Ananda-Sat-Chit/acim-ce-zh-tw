/* Service Worker v15 - ACIM CE PWA */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.setConfig({ debug: false });
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;

/* This version must match ACIM_VERSION in index.htm. */
const CACHE_VERSION = 'v15';
const SHELL_CACHE = 'acim-shell-' + CACHE_VERSION;
const FONT_CACHE = 'acim-fonts-' + CACHE_VERSION;
const IMAGE_CACHE = 'acim-images-' + CACHE_VERSION;
const CONTENT_CACHE = 'acim-content-' + CACHE_VERSION;

registerRoute(
  ({ request, url }) =>
    request.destination === 'document' ||
    url.pathname.endsWith('manifest.json') ||
    url.pathname.endsWith('.png') && !url.pathname.includes('index.files') ||
    url.pathname.endsWith('.ico'),
  new CacheFirst({
    cacheName: SHELL_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: FONT_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: FONT_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.pathname.includes('/index.files/'),
  new CacheFirst({
    cacheName: IMAGE_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 90 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    !url.pathname.endsWith('/sw.js'),
  new NetworkFirst({
    cacheName: CONTENT_CACHE,
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
);

/* Preload main files; do not force an update during a reading session. */
self.addEventListener('install', function(event) {
  var BASE = '/acim-ce-zh-tw/';
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.addAll([
        BASE,
        BASE + 'index.htm',
        BASE + 'manifest.json',
        BASE + 'offline.html'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  var validCaches = [SHELL_CACHE, FONT_CACHE, IMAGE_CACHE, CONTENT_CACHE];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        if (!validCaches.includes(key)) return caches.delete(key);
      }));
    }).then(function() { return self.clients.claim(); })
  );
});

/* Catch failed navigations with the offline page. */
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/acim-ce-zh-tw/offline.html');
      })
    );
  }
});

self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('sync', function(event) {
  if (event.tag === 'acim-reading-progress') {
    /* Reserved for a future optional synchronization service. */
  }
});

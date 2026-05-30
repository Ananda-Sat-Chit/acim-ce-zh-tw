/* ═══════════════════════════════════════════════════════
   Service Worker v11 — 完整加註版奇蹟課程 PWA
   策略：
     Shell (HTML / manifest / icons)  → CacheFirst
     Google Fonts CSS                 → StaleWhileRevalidate
     Google Fonts 字型檔 (.woff2)     → CacheFirst (長效)
     圖片 (index.files/)              → CacheFirst
     其餘同源請求                      → NetworkFirst
   ═══════════════════════════════════════════════════════ */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');

/* ── Workbox 設定 ── */
workbox.setConfig({ debug: false });

const { registerRoute }          = workbox.routing;
const { CacheFirst,
        NetworkFirst,
        StaleWhileRevalidate }   = workbox.strategies;
const { ExpirationPlugin }       = workbox.expiration;
const { CacheableResponsePlugin }= workbox.cacheableResponse;

/* ── 快取名稱 ── */
const SHELL_CACHE   = 'acim-shell-v5';
const FONT_CACHE    = 'acim-fonts-v1';
const IMAGE_CACHE   = 'acim-images-v1';
const CONTENT_CACHE = 'acim-content-v1';

/* ──────────────────────────────────────────────────────
   1. Shell：HTML 主文件 + manifest + icons
      CacheFirst → 離線直接從快取服務，背景更新
   ────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────
   2. Google Fonts CSS
      StaleWhileRevalidate → 快速回應 + 背景更新
   ────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────
   3. Google Fonts 字型檔 (.woff2 等)
      CacheFirst → 字型檔很少變動，快取一年
   ────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────
   4. 書中圖片 (index.files/)
      CacheFirst → 圖片不會變動，長效快取
   ────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────
   5. 其餘同源請求（sw.js 本身除外）
      NetworkFirst → 盡量取最新，失敗才用快取
   ────────────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────────────
   Install & Activate
   skipWaiting + clientsClaim → 新 SW 立刻生效
   precache Shell → 安裝時預先快取主文件，確保離線可用
   清理舊版快取（名稱不在白名單內的）
   ────────────────────────────────────────────────────── */
self.addEventListener('install', function(event) {
  self.skipWaiting();
  /* 使用絕對路徑，與 manifest.json 的 scope (/acim-ce-zh-tw/) 完全一致，
     避免 SW 攔截範圍與 manifest scope 因相對路徑解析差異而不吻合 */
  var BASE = '/acim-ce-zh-tw/';
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.addAll([BASE, BASE + 'index.htm', BASE + 'manifest.json']);
    })
  );
});

self.addEventListener('activate', function(event) {
  var validCaches = [SHELL_CACHE, FONT_CACHE, IMAGE_CACHE, CONTENT_CACHE];
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (!validCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ──────────────────────────────────────────────────────
   Background Sync（預留框架）
   目前 PWA 僅用 localStorage 儲存閱讀位置與設定，
   不需要伺服器同步，故 sync 事件僅做 console 記錄。
   未來若加入書籤、筆記、進度雲端同步功能，
   請在此擴充對應 tag 的處理邏輯。
   ────────────────────────────────────────────────────── */
self.addEventListener('sync', function(event) {
  if (event.tag === 'acim-reading-progress') {
    /* 未來：同步閱讀進度至後端 */
    console.log('[ACIM SW] Background sync triggered:', event.tag);
  }
});

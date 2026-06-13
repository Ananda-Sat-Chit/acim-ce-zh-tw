/* ═══════════════════════════════════════════════════════
   Service Worker v13 — 完整加註版奇蹟課程 PWA
   策略：
     Shell (HTML / manifest / icons)  → CacheFirst
     Google Fonts CSS                 → StaleWhileRevalidate
     Google Fonts 字型檔 (.woff2)     → CacheFirst (長效)
     圖片 (index.files/)              → CacheFirst
     其餘同源請求                      → NetworkFirst
     離線 fallback                    → offline.html
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

/* ── 快取版本統一管理：更新內容時只需改此處 ── */
const CACHE_VERSION = 'v13';
const SHELL_CACHE   = 'acim-shell-'   + CACHE_VERSION;
const FONT_CACHE    = 'acim-fonts-'   + CACHE_VERSION;
const IMAGE_CACHE   = 'acim-images-'  + CACHE_VERSION;
const CONTENT_CACHE = 'acim-content-' + CACHE_VERSION;

/* ──────────────────────────────────────────────────────
   1. Shell：HTML 主文件 + manifest + icons + offline
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
      失敗且快取未命中 → offline fallback
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
   precache Shell + offline.html → 確保離線體驗完整
   清理舊版快取（名稱不在白名單內的）
   注意：不在 install 呼叫 skipWaiting()，
         改由頁面透過 postMessage 主動觸發，
         讓使用者點擊 Toast 後再切換，避免打斷閱讀。
   ────────────────────────────────────────────────────── */
self.addEventListener('install', function(event) {
  var BASE = '/acim-ce-zh-tw/';
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache) {
      return cache.addAll([
        BASE,
        BASE + 'index.htm',
        BASE + 'manifest.json',
        BASE + 'offline.html'   /* 離線 fallback 頁 */
      ]);
    })
  );
  /* 不在此呼叫 skipWaiting()：改由 message 事件觸發，
     讓使用者點擊更新 Toast 後才切換新 SW */
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
   離線 Fallback
   document 請求失敗（NetworkFirst 超時且快取未命中）
   → 回傳 offline.html，避免使用者看到瀏覽器錯誤頁
   ────────────────────────────────────────────────────── */
self.addEventListener('fetch', function(event) {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match('/acim-ce-zh-tw/offline.html');
      })
    );
  }
});

/* ──────────────────────────────────────────────────────
   Message 事件：接收頁面指令
   目前支援：
     { type: 'SKIP_WAITING' } → 執行 skipWaiting()
       由更新 Toast 點擊後發送，讓新 SW 立刻接管，
       無需完整頁面重整（頁面端再呼叫 location.reload()）
   ────────────────────────────────────────────────────── */
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ──────────────────────────────────────────────────────
   Background Sync（預留框架）
   目前 PWA 僅用 localStorage 儲存閱讀位置與設定，
   不需要伺服器同步。未來若加入書籤、筆記、進度雲端
   同步功能，請在此擴充對應 tag 的處理邏輯。
   ────────────────────────────────────────────────────── */
self.addEventListener('sync', function(event) {
  if (event.tag === 'acim-reading-progress') {
    /* 未來：同步閱讀進度至後端 */
  }
});

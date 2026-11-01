/* ACIM CE PWA v22 — 自包含 Service Worker。
   V22 變更：
   1. 移除 Workbox CDN 依賴（storage.googleapis.com 於部分地區不可達），
      改為 ~200 行自寫實作，功能對應 V21（precache / 導航 network-first /
      字型與圖片 cache-first / 離線回退 / 完整性驗證）。
   2. 楷體字型改為自架 8 片子集（fonts/*.woff2，共 ~594KB），
      安裝後 20 秒背景預熱，兼顧首訪傳輸與離線完整。
   3. index.htm 仍於安裝時做 SHA-256 完整性驗證。 */
const CACHE_VERSION = 'v22';
const SHELL_CACHE = 'acim-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'acim-runtime-' + CACHE_VERSION;
const FONT_CACHE = 'acim-fonts-' + CACHE_VERSION;
const BOOK_SHA256 = '9ed967b0ea6d49c2cb691c3a7dfa1e339ef8d774cab8b55a237c546569bd0255';
const BASE = new URL(self.registration.scope).pathname;

/* 核心外殼：書籍本體（index.htm = 全書）、離線頁、manifest、favicon */
const SHELL_PRECACHE = [
  'index.htm', 'offline.html', 'manifest.json', 'favicon.ico'
];

async function verifyBook(response) {
  if (!response || response.status !== 200)
    throw new Error('[ACIM] index.htm is not HTTP 200');
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (actual !== BOOK_SHA256) throw new Error('[ACIM] Release mismatch: index.htm');
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_PRECACHE);
    await verifyBook(await cache.match(BASE + 'index.htm'));
    /* Intentionally no skipWaiting: keep the reader's explicit update choice. */
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE]);
    for (const key of await caches.keys()) {
      if (key.startsWith('acim-') && !keep.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
    /* 背景預熱：20 秒後逐片快取楷體子集（離線閱讀完整字型） */
    setTimeout(async () => {
      try {
        const cache = await caches.open(FONT_CACHE);
        for (const f of ["lxgw-slice0.woff2", "lxgw-slice1.woff2", "lxgw-slice2.woff2", "lxgw-slice3.woff2", "lxgw-slice4.woff2", "lxgw-slice5.woff2", "lxgw-slice6.woff2", "lxgw-slice7.woff2"]) {
          const url = BASE + 'fonts/' + f;
          if (!(await cache.match(url))) {
            try {
              const r = await fetch(url, {cache: 'force-cache'});
              if (r && r.status === 200) await cache.put(url, r);
            } catch (e) { /* 離線時略過，之後上線再補 */ break; }
          }
        }
      } catch (e) {}
    }, 20000);
  })());
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  try {
    const response = await fetch(request);
    if (response && (response.status === 200 || response.type === 'opaque')) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (e) { return Response.error(); }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
    const response = await Promise.race([fetch(request), timer]);
    if (response && response.status === 200) {
      /* 導航回應若與書籍主檔同源同路徑，更新快取（新版上線即同步） */
      if (new URL(request.url).pathname === BASE ||
          new URL(request.url).pathname === BASE + 'index.htm') {
        cache.put(BASE + 'index.htm', response.clone());
      } else {
        cache.put(request, response.clone());
      }
      return response;
    }
  } catch (e) { /* fallthrough */ }
  const cached =
    (await cache.match(BASE + 'index.htm')) ||
    (await cache.match(request)) ||
    (await caches.open(RUNTIME_CACHE).then(c => c.match(request)));
  return cached || (await cache.match(BASE + 'offline.html')) ||
         new Response('Offline', {status: 503, statusText: 'Offline'});
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith(BASE + 'fonts/')) {
      event.respondWith(cacheFirst(request, FONT_CACHE));
    } else {
      event.respondWith(cacheFirst(request, RUNTIME_CACHE));
    }
    return;
  }
  /* 跨源（如圖床）：直接放行，不快取 */
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

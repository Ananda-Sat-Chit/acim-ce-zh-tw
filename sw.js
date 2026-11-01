/* ACIM CE PWA v23 — 自包含 Service Worker。
   V23 變更：
   1. 全書快取金鑰改為 './'（站點根，伺服器即回 index.html 本體）：
      讀者開站時瀏覽器才剛下載過同一 URL 的導航回應（快取 max-age 600s），
      安裝期驗證直接命中 HTTP 快取——省下 V22 安裝時重複下載 index.htm
      副本的 1.87 MB，每位新讀者的首訪總傳輸因此下降。
   2. index.htm 改為數百位元組的轉址 stub（相容既有安裝的 start_url），
      一併 precache；離線開啟舊捷徑也能自動轉入全書。
   3. 離線 fallback 鏈更新：'./' → 請求本身 → runtime → offline.html。
   4. 全書 SHA-256 完整性驗證沿用（V23 版本基準之雜湊已重算）。 */
const CACHE_VERSION = 'v23';
const SHELL_CACHE = 'acim-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'acim-runtime-' + CACHE_VERSION;
const FONT_CACHE = 'acim-fonts-' + CACHE_VERSION;
const BOOK_SHA256 = 'e7180fbc3e1f4bf4b6c4a3f9a22b6945dc87c56afbb9aef675975a0c49ab9691';
const BASE = new URL(self.registration.scope).pathname;

/* 核心外殼：'./' = 全書本體、index.htm = 舊入口 stub、離線頁、manifest、favicon */
const SHELL_PRECACHE = [
  './', 'index.htm', 'offline.html', 'manifest.json', 'favicon.ico'
];

async function verifyBook(response) {
  if (!response || response.status !== 200)
    throw new Error('[ACIM] book entry is not HTTP 200');
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (actual !== BOOK_SHA256) throw new Error('[ACIM] Release mismatch: book');
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    /* 全書本體：以預設快取模式抓取。cache.addAll 依規格以 no-store 強制回源，
       會多耗 1.8MB；此處 fetch('./') 直接命中讀者剛載入的導航回應
       （HTTP 快取 max-age 600s），首訪安裝期淨增傳輸為零。 */
    await cache.put('./', await fetch('./'));
    /* 其餘小檔用 addAll（no-store 強制回源，保證拿到最新版） */
    await cache.addAll(['index.htm', 'offline.html', 'manifest.json', 'favicon.ico']);
    await verifyBook(await cache.match(BASE));
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
      /* 全書導航回應（'/' 或 /index.html）統一以 './' 金鑰更新快取（新版上線即同步）；
         其餘路徑（如 index.htm stub）各自快取。 */
      const p = new URL(request.url).pathname;
      if (p === BASE || p === BASE + 'index.html') {
        cache.put(BASE, response.clone());
      } else {
        cache.put(request, response.clone());
      }
      return response;
    }
  } catch (e) { /* fallthrough */ }
  const cached =
    (await cache.match(BASE)) ||
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

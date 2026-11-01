/* ACIM CE PWA v24 — 自包含 Service Worker。
   V24 變更（程式強化，依外部審查 SW03／SW06／SW08／SW17 與複核根因）：
   1. SW17：cache.put 全部納入等待——cacheFirst 改 await；
      導航 200 的寫入以 event.waitUntil 包住（回應不等寫入，讀者零延遲，
      但 SW 生命週期涵蓋寫入完成，不再有孤兒寫入）。
   2. SW03：安裝改「先驗後留」——install 內先寫入再驗證，驗證失敗即
      刪除本次 SHELL_CACHE，不留半套污染快取（原行為：驗證失敗僅中斷，
      已寫入內容殘留至下次 activate）。
   3. SW06：activate 清理範圍收斂——由「所有 acim- 前綴」改為
      /^acim-(shell|runtime|fonts)-/ 正則，僅清理本專案既有命名，
      不波及同一 GitHub Pages 源上其他專案的 acim- 前綴快取。
   4. 字型快取去版本化（acim-fonts）：字型檔未隨版本變更，去版本化後
      跨版本保留，讀者更新 V24 不再重下 592KB 字型。
      ※ 未來若更換字型檔內容，須改回版本化命名（如 acim-fonts-v25）
        或於此手動破壞相容，並同步調整 SW_CLEAN_RE。
   5. 註解更正：cache.addAll 依 W3C 規格「不使用 no-store」（規格演算法
      全文無此步驟），V23 註解有誤；addAll 以預設快取模式發出請求。
   V23 沿用：
   · 全書快取金鑰 './'（安裝驗證命中讀者剛下載的導航回應，淨增傳輸零）。
   · index.htm 轉址 stub precache；離線 fallback 鏈 ./ → 請求 → runtime
     → offline.html。
   · 全書 SHA-256 完整性驗證（V24 基準雜湊已重算）。
   · 不使用 skipWaiting：更新由讀者以 toast 自主決定（message SKIP_WAITING）。 */
const CACHE_VERSION = 'v24';
const SHELL_CACHE = 'acim-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'acim-runtime-' + CACHE_VERSION;
const FONT_CACHE = 'acim-fonts'; /* V24：去版本化，跨版本保留字型 */
const BOOK_SHA256 = '5440cc8e8113f2234254da174b96ac8734cb470e0f36a25c4f723108332952d7';
const BASE = new URL(self.registration.scope).pathname;

/* SW06 強化：僅清理本專案歷來使用的快取命名（shell/runtime/fonts + 版本號），
   其他 acim- 前綴（同源他站專案）不受影響。 */
const SW_CLEAN_RE = /^acim-(shell|runtime|fonts)-/;

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
    try {
      /* 全書本體：以預設快取模式抓取，直接命中讀者剛載入的導航回應
         （HTTP 快取 max-age 600s），首訪安裝期淨增傳輸為零。 */
      await cache.put('./', await fetch('./'));
      /* 其餘小檔用 addAll（預設快取模式；規格不含 no-store 步驟，V23 註解有誤已更正） */
      await cache.addAll(['index.htm', 'offline.html', 'manifest.json', 'favicon.ico']);
      await verifyBook(await cache.match(BASE));
    } catch (e) {
      /* SW03 強化：安裝驗證失敗即清除本次寫入，不留半套污染快取 */
      await caches.delete(SHELL_CACHE);
      throw e;
    }
    /* Intentionally no skipWaiting: keep the reader's explicit update choice. */
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE]);
    for (const key of await caches.keys()) {
      if (SW_CLEAN_RE.test(key) && !keep.has(key)) await caches.delete(key);
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
      /* SW17 強化：await 寫入（小檔，成本可忽略），寫入完成前 SW 不被終止 */
      await cache.put(request, response.clone());
    }
    return response;
  } catch (e) { return Response.error(); }
}

async function networkFirstNavigation(request, event) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
    const response = await Promise.race([fetch(request), timer]);
    if (response && response.status === 200) {
      /* 全書導航回應（'/' 或 /index.html）統一以 './' 金鑰更新快取（新版上線即同步）；
         其餘路徑（如 index.htm stub）各自快取。
         SW17 強化：寫入以 event.waitUntil 包住——回應立即交付（零延遲），
         SW 生命週期涵蓋寫入完成（不再 fire-and-forget）。 */
      const p = new URL(request.url).pathname;
      const putPromise = (p === BASE || p === BASE + 'index.html')
        ? cache.put(BASE, response.clone())
        : cache.put(request, response.clone());
      if (event && event.waitUntil) event.waitUntil(putPromise);
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
    event.respondWith(networkFirstNavigation(request, event));
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

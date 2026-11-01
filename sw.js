/* ACIM CE PWA v25.1 — 自包含 Service Worker。
   V25.1：配套附錄三目錄修正；同步全書雜湊並支援點版本快取清理。
   V25 變更（依外部審查 A03/A04/A05/A06/A16 與 P1 優先序）：
   1. A04 版本契約：導航 200 覆寫正式書籍快取前，先核對回應內
      <meta name="acim-version"> 與本 SW 配套版本（EXPECT_VERSION）。
      版本不符（未完成發布／他版 HTML）→ 不覆寫已驗證離線版，
      當次回應仍交付讀者閱讀；版本未知 → 同樣保守不覆寫。
      （完整 SHA-256 驗證仍在安裝時執行。）
   2. A16 保存與閱讀分離：cacheFirst 的 fetch 與 cache.put 分開處理——
      網路已回 200 時，無論快取寫入是否被拒（配額／磁碟），當下回應
      一律交付讀者；寫入失敗靜默記錄，不再讓可用資源變成 Response.error。
   3. A03 專案隔離：快取改用專案前綴命名 acimce-zh-tw-*，
      清理正則收斂為「本專案歷史精確命名 + 本專案新命名族」，
      同源其他專案（如 acim-shell-other-v1）不再可能被誤刪。
   4. A06 字型快取遷移：activate 時先將 V22–V24 的 acim-fonts(-vNN)
      複製遷移到 acimce-zh-tw-fonts，完成後才清理，
      V23/V24 讀者升級不需重下 592KB 楷體子集。
   5. A05 預熱生命週期：20 秒字型預熱納入 activate 的 waitUntil，
      SW 存活至預熱完成（原 setTimeout 在 worker 閒置時可能被終止）。
   V24 沿用：
   · SW03 安裝「先驗後留」（驗證失敗刪除本版 shell）；
     SW17 cache.put 全部納入等待；SW06 僅清理本專案快取。
   · 全書快取金鑰 './'；index.htm stub precache；離線 fallback 鏈。
   · 全書 SHA-256 完整性驗證（本發布套件雜湊已重算）。
   · 不使用 skipWaiting：更新由讀者以 toast 自主決定（SKIP_WAITING）。 */
const CACHE_VERSION = 'v25.1';
const PROJ = 'acimce-zh-tw';
const SHELL_CACHE  = PROJ + '-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = PROJ + '-runtime-' + CACHE_VERSION;
const FONT_CACHE   = PROJ + '-fonts';
const EXPECT_VERSION = CACHE_VERSION; /* A04：與 index.html meta[name=acim-version] 對應 */
const BOOK_SHA256 = '9a15d6b951fe147d6c80bd12b74f02cec404b62fba1b3b4271c0b55e61ef3803';
const BASE = new URL(self.registration.scope).pathname;

/* A03：清理範圍＝本專案 V22–V24 歷史精確命名＋本專案新命名族（排除 keep）。
   其他專案的同形快取（acim-shell-其他-v1 等）不受影響。 */
const LEGACY_RE = /^(?:acim-(?:shell|runtime)-v(?:22|23|24)|acim-fonts(?:-v(?:22|23))?)$/;
const OWN_RE = new RegExp('^' + PROJ + '-(?:(?:shell|runtime)-v\\d+(?:\\.\\d+)*|fonts)$');
/* A06：遷移來源（V22–V24 字型快取） */
const OLD_FONT_CACHES = ['acim-fonts-v22', 'acim-fonts-v23', 'acim-fonts'];

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
         （HTTP 快取 max-age 600s），首訪安裝期淨增傳輸趨近於零。 */
      await cache.put('./', await fetch('./'));
      await cache.addAll(['index.htm', 'offline.html', 'manifest.json', 'favicon.ico']);
      await verifyBook(await cache.match(BASE));
    } catch (e) {
      /* SW03：安裝驗證失敗即清除本次寫入，不留半套污染快取 */
      await caches.delete(SHELL_CACHE);
      throw e;
    }
    /* Intentionally no skipWaiting: keep the reader's explicit update choice. */
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    /* A06：先遷移舊字型快取（V22–V24 → acimce-zh-tw-fonts），讀者不重下 592KB */
    try {
      const dest = await caches.open(FONT_CACHE);
      for (const oldName of OLD_FONT_CACHES) {
        try {
          const old = await caches.open(oldName);
          for (const req of await old.keys()) {
            if (!(await dest.match(req))) {
              const resp = await old.match(req);
              if (resp) await dest.put(req, resp);
            }
          }
        } catch (e) { /* 單一舊快取遷移失敗不阻斷啟用 */ }
      }
    } catch (e) {}
    /* A03：僅清理本專案歷史與現行命名，其他專案快取不受影響 */
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE]);
    for (const key of await caches.keys()) {
      if (keep.has(key)) continue;
      if (LEGACY_RE.test(key) || OWN_RE.test(key)) await caches.delete(key);
    }
    await self.clients.claim();
    /* A05：背景預熱納入 activate 生命週期——20 秒後逐片快取楷體子集，
       SW 存活至預熱完成（離線閱讀具完整字型）。 */
    await new Promise(r => setTimeout(r, 20000));
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
  })());
});

/* A04：讀回應前 16KB，核對 <meta name="acim-version">（head 位於檔案前段）。 */
async function sniffVersion(response) {
  try {
    const reader = response.clone().body.getReader();
    const decoder = new TextDecoder('utf-8');
    let text = '', got = 0;
    while (got < 16384) {
      const {done, value} = await reader.read();
      if (done) break;
      text += decoder.decode(value, {stream: true});
      got += value.length;
      const m = text.match(/<meta\s+name=["']acim-version["']\s+content=["']([^"']+)["']/i);
      if (m) { reader.cancel(); return m[1]; }
    }
    reader.cancel();
    const m2 = text.match(/<meta\s+name=["']acim-version["']\s+content=["']([^"']+)["']/i);
    return m2 ? m2[1] : null;
  } catch (e) { return null; }
}

/* A16：fetch 與 cache.put 分離——保存失敗不影響當下閱讀。 */
async function cacheFirst(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  let response;
  try {
    response = await fetch(request);
  } catch (e) { return Response.error(); }
  if (response && (response.status === 200 || response.type === 'opaque')) {
    const put = cache.put(request, response.clone()).catch(() => {});
    if (event && event.waitUntil) event.waitUntil(put);
  }
  return response;
}

async function networkFirstNavigation(request, event) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const timer = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
    const response = await Promise.race([fetch(request), timer]);
    if (response && response.status === 200) {
      const p = new URL(request.url).pathname;
      if (p === BASE || p === BASE + 'index.html') {
        /* A04：正式書籍鍵只接受與本 SW 配套版本的內容；
           版本不符或未知（未完成發布／他版 HTML）→ 不覆寫已驗證離線版，
           當次回應照常交付（讀者看得到，離線快取不被無聲污染）。 */
        const putPromise = (async () => {
          try {
            const ver = await sniffVersion(response);
            if (ver === EXPECT_VERSION) await cache.put(BASE, response.clone());
          } catch (e) { /* 驗證失敗不覆寫 */ }
        })();
        if (event && event.waitUntil) event.waitUntil(putPromise);
        return response;
      }
      const putPromise2 = cache.put(request, response.clone());
      if (event && event.waitUntil) event.waitUntil(putPromise2);
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
    /* A12：scope 外的同源資源直接放行（不寫入本專案 runtime 快取） */
    if (!url.pathname.startsWith(BASE)) return;
    if (url.pathname.startsWith(BASE + 'fonts/')) {
      event.respondWith(cacheFirst(request, FONT_CACHE, event));
    } else {
      event.respondWith(cacheFirst(request, RUNTIME_CACHE, event));
    }
    return;
  }
  /* 跨源（如圖床）：直接放行，不快取 */
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

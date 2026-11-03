/* ACIM CE PWA v30.1 — release-bound offline book.
   The active worker serves only its SHA-256-verified release. A newer release is
   installed in its own cache and becomes visible when its worker activates.
   activate performs local migration/cleanup only: no delay or network warmup.
   WARM_FONTS / PREPARE_OFFLINE run separately, with bounded network work and
   explicit cache status. RELEASE_ID, BOOK_SHA256 and ASSET_SHA256 are filled by
   the deterministic release builder; never hand-edit the compiled worker. */
const CACHE_VERSION = 'v30.1';
const RELEASE_ID = '7be67cdc934c9ba9bc114b1dec5182fa08b971b3d7954c88048f04c0ccdcf81f';
const PROJ = 'acimce-zh-tw';
const SHELL_CACHE = PROJ + '-shell-' + CACHE_VERSION + '-' + RELEASE_ID;
const RUNTIME_CACHE = PROJ + '-runtime-' + CACHE_VERSION + '-' + RELEASE_ID;
const FONT_CACHE = PROJ + '-fonts';
const EXPECT_VERSION = CACHE_VERSION;
const BOOK_SHA256 = 'f6210feb674fe232ab44c0781aa10932a8b2ed5ed9387c4bb8c995813e054af1';
const BASE = new URL(self.registration.scope).pathname;
const LEGACY_RE = /^(?:acim-(?:shell|runtime)-v(?:22|23|24)|acim-fonts(?:-v(?:22|23))?)$/;
const OWN_RE = new RegExp('^' + PROJ + '-(?:shell|runtime)-v(\\d+(?:\\.\\d+)*)(?:-[a-f0-9]{64})?$');
const OLD_FONT_CACHES = ['acim-fonts-v22', 'acim-fonts-v23', 'acim-fonts'];
const CORE_FILES = ['index.htm', 'offline.html', 'manifest.json', 'favicon.ico'];
const FONT_FILES = [
  'fonts/ntc-regular-00.woff2',
  'fonts/ntc-regular-01.woff2',
  'fonts/ntc-regular-02.woff2',
  'fonts/ntc-regular-03.woff2',
  'fonts/ntc-regular-04.woff2',
  'fonts/ntc-regular-05.woff2',
  'fonts/ntc-regular-06.woff2',
  'fonts/ntc-regular-07.woff2',
  'fonts/ntc-regular-08.woff2',
  'fonts/ntc-regular-09.woff2',
  'fonts/ntc-bold-00.woff2',
  'fonts/ntc-bold-01.woff2',
  'fonts/ntc-bold-02.woff2',
  'fonts/ntc-bold-03.woff2',
  'fonts/ntc-bold-04.woff2',
  'fonts/ntc-bold-05.woff2',
  'fonts/ntc-bold-06.woff2',
  'fonts/ntc-bold-07.woff2',
  'fonts/ntc-bold-08.woff2',
  'fonts/ntc-bold-09.woff2',
  'fonts/wenkai-00.woff2',
  'fonts/wenkai-01.woff2',
  'fonts/wenkai-02.woff2',
  'fonts/wenkai-03.woff2',
  'fonts/wenkai-04.woff2',
  'fonts/wenkai-05.woff2',
  'fonts/wenkai-06.woff2',
  'fonts/wenkai-07.woff2',
  'fonts/wenkai-08.woff2',
  'fonts/wenkai-09.woff2'
];
const IMAGE_FILES = ['index.files/image001.webp', 'index.files/image002.webp', 'index.files/image003.jpg', 'index.files/ce-manuscript.webp'];
const RUNTIME_FILES = IMAGE_FILES.concat(['icon-512.png', 'pwa-192x192.png', 'screenshot-og.png']);
const RUNTIME_MAX_ENTRIES = 24;
const NETWORK_TIMEOUT_MS = 8000;
const WARMUP_BUDGET_MS = 60000; /* V30：30 個切片，3 並行下載 */
const ASSET_SHA256 = {
  'index.htm': '60241fbe8694050be271bc1cd8d18b49eff0f530018acfc8e8ab50c936bd42d0',
  'offline.html': 'f102e49019429b6884091b8f96b32ef23ad2bfb1bed16953156decbf0d0c34ff',
  'manifest.json': '3a209276dff02d2493d528e81fadb28dc73d941eceb36e3e0c7ff1dc9403c9e3',
  'fonts/ntc-regular-00.woff2': 'c830483a03e982db87fc7b5faa361cbac7b0c0265b3bf51959994cfc839e7fcd',
  'fonts/ntc-regular-01.woff2': 'ae80842c86375a91f2a3d0a7ff4835f2c39667b45a9a141f734efdc7c245cb0a',
  'fonts/ntc-regular-02.woff2': '9c55164062f33e520c84bf3aac7bad90c3c7a7f5c83dc45b82ef581463236c76',
  'fonts/ntc-regular-03.woff2': 'e2be90fac5bab11408de5d86f0897291648cbefd9e0ca86c5b344beb02c31b29',
  'fonts/ntc-regular-04.woff2': 'fce65ed9c1d6584dc2cb56b7e78b5ab99985f8681ee5eb5d774a309db1d6752d',
  'fonts/ntc-regular-05.woff2': 'f20fb8e040e4a12a876c6a3192ac063bdf6e1edce5cc28789f79124f3a0fb993',
  'fonts/ntc-regular-06.woff2': '0b6ff73029b121ff5b9bbfe3bd8f5b7b81b62b9e18d9929c1b509137132fc1a7',
  'fonts/ntc-regular-07.woff2': 'a372ffaec24c002b57dcf01424e74358a37546b518c0b7ae9cefbf9ec93a10f9',
  'fonts/ntc-regular-08.woff2': '1172b23d74ce2e325418ae2c0bb15c3586689b7edae30b905d36cea0c7ba0315',
  'fonts/ntc-regular-09.woff2': '4d78b9c058360ab378fe28865d763146139b3ca2b5c1c4d154291fd3252fac7d',
  'fonts/ntc-bold-00.woff2': 'aae41578f6715501d15fadf9456f7077bbe8ea5cdc35aba7499baaf865b2d9d2',
  'fonts/ntc-bold-01.woff2': '496b958c3e1e1407edcc086b9270d838c414dbed86800e5d6ad9fee0589e6283',
  'fonts/ntc-bold-02.woff2': '9143b7fcdcb8d4af89f77bc7668166b6f385c0e680e40da1a25937be6588193f',
  'fonts/ntc-bold-03.woff2': '85041df1aeafea96d77b69f8a45996c16258637e34cff976daf7699e51bab6ea',
  'fonts/ntc-bold-04.woff2': '8e629c514c4e497011e3ff45672abcdee06f26747de509a105f14fb80ff63c62',
  'fonts/ntc-bold-05.woff2': 'e0c1ebe7b882fde6336ba12baa6cc87cc0b5cf9654c9fff598481e68c644a563',
  'fonts/ntc-bold-06.woff2': '85bd0fbe6011e05077ea0674a42e45c469b1a53d2920eb678e6b631bf79a3d4e',
  'fonts/ntc-bold-07.woff2': 'b9bf24460df9c5f6f149cec078f99a0e4c821e861d4a6def0d7b9ce0b12fb1ab',
  'fonts/ntc-bold-08.woff2': 'f895cab9bb9efd4ee7e9f42ecd3bd2d96edfcdd3c61a61739e18ed1977ff4128',
  'fonts/ntc-bold-09.woff2': 'b1e8ec6e69748eb3aa3ea1b5badae0e1a2e947f45dc62e8f6d1b31917a864a3a',
  'fonts/wenkai-00.woff2': '8ef68e35904ce576f25cc9f6aa5e2417d033acb2913669fb94514cc4b92df492',
  'fonts/wenkai-01.woff2': '454b51ad666c3e471526bf4e6d0685b08a67304a422751d98ac5ffff7ccfc883',
  'fonts/wenkai-02.woff2': 'b0c6bb5ad62b4e02bcdedba8c6769edf2d3279e7c7203e1df50ccc0accb0c252',
  'fonts/wenkai-03.woff2': '40a17f94b19a21ac979df46bc9554f19cd98f948f1e6b8240b8d93f6067870be',
  'fonts/wenkai-04.woff2': '29fc7634a5d7a3b406b0a615cc81f3c4b9d1a67fec9490091eac725c1ae688a1',
  'fonts/wenkai-05.woff2': '9580776326f96ff7a1fd5c0294bf93be6ebb7dc965d8157385924f243b34d15c',
  'fonts/wenkai-06.woff2': 'e92ceb70c8fe435a250f1c139436b8fd63fd8cf58b62b4ab711a2af140b13bd7',
  'fonts/wenkai-07.woff2': '7e1ab188e6e71e7eff7ba16e3f38b072f5cd04e8b32ca3d77fdef948a7b7e5c9',
  'fonts/wenkai-08.woff2': 'f91c42d82bd1fccd5d986797fa1283c9f28ed85e23f810c43745bbe4c3fdd195',
  'fonts/wenkai-09.woff2': '8df48aaaa3a348d2244813440a3974bd6388d877b9d83c95f3f99546f38ef589',
  'favicon.ico': '0c3efbc9e430c0acef49275c9f6e4a5dbd8bc4ae9baf3432212cf59c87351fa4',
  'index.files/image001.webp': '9a4295437a5cf3a57cdd3dfa73a6b1db65baf9016781643e8592b19a39fde374',
  'index.files/image002.webp': 'c4bfe8793c7811d8a0d6f9cc7ed152c8a38da36f69ffb410aa944c9554928395',
  'index.files/image003.jpg': 'c3189d69a3c2df5250db3575e15374c72e5c8e957d8d272eab0765a50e228675',
  'index.files/ce-manuscript.webp': 'eecd7efba4c93d721f43eae8cc755a14473d76739d0ceefbe0d47be18a33c6c8',
  'icon-512.png': 'bcebd97a9e265d97874a52da80c330271809de62caf1e26d6effcd59e8371d36',
  'pwa-192x192.png': 'b31efb602bed26f7781fb03b6c94b9ac36a86941138f7d71c4a64690f8f36bd5',
  'screenshot-og.png': '62f95328589f44a360987cda864322fa3e3765c23f90b0b030430f26fe35b8ed'
};
let bookVerifiedInWorker = false;
let bookVerificationGeneration = 0;
let warmingTask = null;
let lastWarmError = '';
let storageError = '';
let runtimeWriteQueue = Promise.resolve();

async function responseDigest(response) {
  const bytes = await response.clone().arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
async function verifyBook(response) {
  if (!response || response.status !== 200) throw new Error('book-http');
  const bytes = await response.clone().arrayBuffer();
  const head = new TextDecoder('utf-8').decode(new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 16384)));
  const tag = head.match(/<meta\b[^>]*\bname=["']acim-version["'][^>]*>/i);
  const version = tag && tag[0].match(/\bcontent=["']([^"']+)["']/i);
  if (!version || version[1] !== EXPECT_VERSION) throw new Error('book-version');
  const releaseTag = head.match(/<meta\b[^>]*\bname=["']acim-release-id["'][^>]*>/i);
  const release = releaseTag && releaseTag[0].match(/\bcontent=["']([^"']+)["']/i);
  if (!release || release[1] !== RELEASE_ID) throw new Error('book-release');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const actual = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (actual !== BOOK_SHA256) throw new Error('book-integrity');
  return response;
}
async function verifyAsset(response, relativePath) {
  return !!response && response.status === 200 &&
    ASSET_SHA256[relativePath] === await responseDigest(response);
}
function fetchBounded(request, timeoutMs = NETWORK_TIMEOUT_MS, init = {}) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('network-timeout'));
    }, timeoutMs);
  });
  // Include the response body, not only HTTP headers, in the timeout. A stalled
  // stream must not keep a font save or installation event alive indefinitely.
  const downloaded = fetch(request, {...init, signal: controller.signal}).then(async response => {
    if (response && response.body) await response.clone().arrayBuffer();
    return response;
  });
  return Promise.race([downloaded, timeout])
    .finally(() => clearTimeout(timer));
}
async function readCache(name, request) {
  try { return await (await caches.open(name)).match(request); }
  catch (e) { storageError = 'cache-read'; return undefined; }
}
async function cachedBook(forceVerification = false) {
  const response = await readCache(SHELL_CACHE, BASE);
  if (!response) { bookVerifiedInWorker = false; bookVerificationGeneration++; return undefined; }
  if (forceVerification || !bookVerifiedInWorker) {
    // An older asynchronous check must not restore trust after a newer failed
    // status check, cache eviction, or replacement. Each returned response is
    // still checked against its own bytes; ordinary later navigations reuse the
    // flag only because this worker's book writes always verify the same hash.
    const generation = ++bookVerificationGeneration;
    bookVerifiedInWorker = false;
    try {
      await verifyBook(response);
      if (generation === bookVerificationGeneration) bookVerifiedInWorker = true;
    } catch (e) {
      if (generation === bookVerificationGeneration) bookVerifiedInWorker = false;
      return undefined;
    }
  }
  return response;
}
async function storeBook(response) {
  await verifyBook(response);
  try {
    await (await caches.open(SHELL_CACHE)).put(BASE, response.clone());
    bookVerificationGeneration++;
    bookVerifiedInWorker = true;
    return true;
  } catch (e) { storageError = 'cache-write'; return false; }
}

async function completeShell(cache) {
  // A marker could survive partial browser eviction. Verify the actual five
  // required responses instead, both for interrupted installs and reinstallation.
  const book = await cache.match(BASE);
  try {
    await verifyBook(book);
  } catch (e) {
    if (/^book-(?:http|version|release|integrity)$/.test(e && e.message)) return false;
    throw e; // An unreadable cache or failed digest is unknown, not disposable.
  }
  for (const file of CORE_FILES) {
    if (!await verifyAsset(await cache.match(BASE + file), file)) return false;
  }
  return true;
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    let ownsCandidate = false;
    try {
      // Do not use readCache here: caches.open() creates a cache, which would
      // erase the distinction between an existing shell and this install's work.
      if ((await caches.keys()).includes(SHELL_CACHE) &&
          await completeShell(await caches.open(SHELL_CACHE))) {
        bookVerificationGeneration++;
        bookVerifiedInWorker = true;
        return; // A verified identical release also reinstalls while offline.
      }
      const book = await fetchBounded(BASE, NETWORK_TIMEOUT_MS, {cache: 'reload'});
      await verifyBook(book);
      const assets = await Promise.all(CORE_FILES.map(async file => {
        const response = await fetchBounded(BASE + file, NETWORK_TIMEOUT_MS, {cache: 'reload'});
        if (!response || response.status !== 200) throw new Error('shell-http:' + file);
        if (!await verifyAsset(response, file)) throw new Error('shell-integrity:' + file);
        return [BASE + file, response];
      }));
      // Finish all network work and integrity checks before opening a candidate.
      // Recheck after downloading: a same-release reader may have repaired its
      // shell meanwhile. Pre-existing data is never owned by this installation.
      const existedBeforeWrites = (await caches.keys()).includes(SHELL_CACHE);
      const cache = await caches.open(SHELL_CACHE);
      ownsCandidate = !existedBeforeWrites;
      await cache.put(BASE, book);
      for (const [url, response] of assets) await cache.put(url, response);
      bookVerificationGeneration++;
      bookVerifiedInWorker = true;
    } catch (e) {
      bookVerifiedInWorker = false;
      bookVerificationGeneration++;
      // Only a new, incomplete candidate belongs to this failed installation.
      // Keep pre-existing shells, including their usable entries after a failed
      // repair, and keep a candidate another same-release reader has completed.
      if (ownsCandidate) {
        try {
          if (!await completeShell(await caches.open(SHELL_CACHE))) await caches.delete(SHELL_CACHE);
        } catch (cleanupError) { /* A failed cleanup must not hide the install error. */ }
      }
      throw e;
    }
    // Deliberately no skipWaiting: retain the reader's explicit update choice.
  })());
});

function ownedFontPath(request) {
  const url = new URL(typeof request === 'string' ? request : request.url, self.registration.scope);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return '';
  const relative = url.pathname.slice(BASE.length);
  return FONT_FILES.includes(relative) ? relative : '';
}
async function migrateLegacyFonts() {
  const retained = new Set();
  let names;
  try { names = await caches.keys(); }
  catch (e) { storageError = 'cache-read'; return new Set(OLD_FONT_CACHES); }
  for (const oldName of OLD_FONT_CACHES.filter(name => names.includes(name))) {
    let complete = true;
    let anyOwned = false;
    try {
      const old = await caches.open(oldName);
      const dest = await caches.open(FONT_CACHE);
      for (const request of await old.keys()) {
        const file = ownedFontPath(request);
        if (!file) { complete = false; continue; } // Never discard unrelated contents.
        anyOwned = true;
        const key = BASE + file;
        if (await verifyAsset(await dest.match(key), file)) continue;
        const response = await old.match(request);
        if (!await verifyAsset(response, file)) { complete = false; continue; }
        try {
          await dest.put(key, response);
          if (!await verifyAsset(await dest.match(key), file)) complete = false;
        } catch (e) { complete = false; storageError = 'cache-write'; }
      }
    } catch (e) { complete = false; storageError = 'cache-migration'; }
    if (!anyOwned) {
      // A legacy font cache holding nothing usable for this release is dead
      // weight (e.g. the V28 lxgw slices); reclaim it instead of retaining.
      try { await caches.delete(oldName); } catch (e) { retained.add(oldName); }
    } else if (!complete) retained.add(oldName);
  }
  return retained;
}
async function trimRuntime(cache) {
  const keys = await cache.keys();
  const overflow = keys.length - RUNTIME_MAX_ENTRIES;
  for (let i = 0; i < overflow; i++) await cache.delete(keys[i]);
}
function olderProjectCache(name) {
  const match = name.match(OWN_RE);
  if (!match) return false;
  const candidate = match[1].split('.').map(Number);
  const current = CACHE_VERSION.slice(1).split('.').map(Number);
  for (let i = 0; i < Math.max(candidate.length, current.length); i++) {
    const difference = (candidate[i] || 0) - (current[i] || 0);
    if (difference) return difference < 0;
  }
  return false;
}
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const retainedFonts = await migrateLegacyFonts();
    const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, FONT_CACHE, ...retainedFonts]);
    try {
      for (const name of await caches.keys()) {
        // Cache names cannot tell which same-version build is active or waiting.
        // Keep all sibling builds and all newer versions, without timestamp
        // guesses. A later numeric release may collect these older versions.
        if (!keep.has(name) && (LEGACY_RE.test(name) || olderProjectCache(name))) await caches.delete(name);
      }
      await trimRuntime(await caches.open(RUNTIME_CACHE));
      // V30: drop font entries that no longer belong to this release's slice
      // set (e.g. the pre-V30 full-file fonts left in returning readers' storage).
      try {
        const fontCache = await caches.open(FONT_CACHE);
        for (const req of await fontCache.keys()) {
          const path = new URL(req.url).pathname;
          const rel = path.startsWith(BASE) ? path.slice(BASE.length) : '';
          if (rel && !FONT_FILES.includes(rel)) await fontCache.delete(req);
        }
      } catch (e) { storageError = 'cache-cleanup'; }
    } catch (e) { storageError = 'cache-cleanup'; }
    await self.clients.claim();
    // Fonts/images are prepared by separate messages, after activation finishes.
  })());
});

async function legacyFont(file) {
  let names;
  try { names = await caches.keys(); } catch (e) { return undefined; }
  for (const name of OLD_FONT_CACHES.filter(n => names.includes(n))) {
    try {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (ownedFontPath(request) !== file) continue;
        const response = await cache.match(request);
        if (await verifyAsset(response, file)) return response;
      }
    } catch (e) { /* Preserve another readable legacy source if one fails. */ }
  }
}
async function storeAsset(file, response) {
  if (!await verifyAsset(response, file)) return false;
  const cacheName = FONT_FILES.includes(file) ? FONT_CACHE : RUNTIME_CACHE;
  const write = async () => {
    try {
      const cache = await caches.open(cacheName);
      await cache.put(BASE + file, response.clone());
      if (cacheName === RUNTIME_CACHE) await trimRuntime(cache);
      return true;
    } catch (e) { storageError = 'cache-write'; return false; }
  };
  if (cacheName !== RUNTIME_CACHE) return write();
  // Serialize runtime insert+trim so concurrent image loads cannot exceed the cap.
  const result = runtimeWriteQueue.then(write, write);
  runtimeWriteQueue = result.then(() => {}, () => {});
  return result;
}
async function assetResponse(file, event) {
  const cacheName = FONT_FILES.includes(file) ? FONT_CACHE : RUNTIME_CACHE;
  const hit = await readCache(cacheName, BASE + file);
  if (await verifyAsset(hit, file)) return hit;
  if (FONT_FILES.includes(file)) {
    const old = await legacyFont(file);
    if (old) {
      event.waitUntil(storeAsset(file, old.clone()));
      return old;
    }
  }
  let response;
  try { response = await fetchBounded(BASE + file); }
  catch (e) { return Response.error(); }
  // Storage failure must not turn an available network resource into an error.
  if (response && response.status === 200) {
    if (!await verifyAsset(response, file)) { lastWarmError = 'asset-integrity:' + file; return Response.error(); }
    event.waitUntil(storeAsset(file, response.clone()).catch(() => false));
  }
  return response;
}
async function offlineFallback() {
  try {
    const response = await readCache(SHELL_CACHE, BASE + 'offline.html');
    if (await verifyAsset(response, 'offline.html')) return response;
  } catch (e) { /* An unverifiable fallback must not be served as trusted HTML. */ }
  return new Response('目前無法取得已驗證的離線書籍，請連線後重新載入。', {
    status: 503, statusText: 'Offline', headers: {'Content-Type': 'text/plain; charset=utf-8'}
  });
}
async function bookNavigation(event) {
  const hit = await cachedBook();
  if (hit) return hit;
  try {
    const response = await fetchBounded(BASE, NETWORK_TIMEOUT_MS, {cache: 'reload'});
    await verifyBook(response);
    event.waitUntil(storeBook(response.clone()).catch(() => false));
    return response;
  } catch (e) { return offlineFallback(); }
}
async function otherNavigation(request) {
  try {
    const response = await fetchBounded(request);
    if (response && response.status === 200) return response;
  } catch (e) {}
  return await cachedBook() || offlineFallback();
}
async function shellAsset(file) {
  const cached = await readCache(SHELL_CACHE, BASE + file);
  if (await verifyAsset(cached, file)) return cached;
  try {
    const response = await fetchBounded(BASE + file);
    if (await verifyAsset(response, file)) return response;
  } catch (e) {}
  return file === 'index.htm' ? await cachedBook() || offlineFallback() : Response.error();
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  const file = url.pathname.slice(BASE.length);
  if (request.mode === 'navigate') {
    if (file === '' || file === 'index.html') event.respondWith(bookNavigation(event));
    else if (CORE_FILES.includes(file)) event.respondWith(shellAsset(file));
    else event.respondWith(otherNavigation(request));
    return;
  }
  if (CORE_FILES.includes(file)) event.respondWith(shellAsset(file));
  else if (FONT_FILES.includes(file) || RUNTIME_FILES.includes(file)) event.respondWith(assetResponse(file, event));
  // Unknown paths and cross-origin resources are not persisted in this project.
});

async function countVerifiedAssets(files) {
  let count = 0;
  for (const file of files) {
    const name = FONT_FILES.includes(file) ? FONT_CACHE : RUNTIME_CACHE;
    if (await verifyAsset(await readCache(name, BASE + file), file)) count++;
  }
  return count;
}
async function offlineStatus() {
  const bookReady = !!await cachedBook(true);
  let shellCount = bookReady ? 1 : 0;
  for (const file of CORE_FILES) {
    const response = await readCache(SHELL_CACHE, BASE + file);
    if (await verifyAsset(response, file)) shellCount++;
  }
  const fontsCached = await countVerifiedAssets(FONT_FILES);
  const imagesCached = await countVerifiedAssets(IMAGE_FILES);
  const complete = shellCount === CORE_FILES.length + 1 && fontsCached === FONT_FILES.length && imagesCached === IMAGE_FILES.length;
  if (complete) storageError = ''; // A fresh complete check supersedes old save errors.
  return {type: 'ACIM_OFFLINE_STATUS', version: CACHE_VERSION, releaseId: RELEASE_ID,
    bookReady, shellReady: shellCount === CORE_FILES.length + 1,
    shellCached: shellCount, shellTotal: CORE_FILES.length + 1,
    fontsCached, fontsTotal: FONT_FILES.length, imagesCached, imagesTotal: IMAGE_FILES.length,
    complete,
    warming: !!warmingTask, lastWarmError, storageError};
}
async function broadcast(message) {
  try {
    const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    for (const client of clients) {
      if (client.url && new URL(client.url).origin === self.location.origin && new URL(client.url).pathname.startsWith(BASE)) client.postMessage(message);
    }
  } catch (e) { /* A closed client does not fail the save job. */ }
}
function reply(event, message) {
  const id = event.data && event.data.requestId;
  if (typeof id === 'number' || (typeof id === 'string' && id.length <= 120)) message.requestId = id;
  try {
    if (event.ports && event.ports[0]) event.ports[0].postMessage(message);
    else if (event.source && event.source.postMessage) event.source.postMessage(message);
  } catch (e) {}
}
async function repairShell(deadline) {
  async function download(file) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('warmup-timeout');
    return fetchBounded(BASE + file, Math.min(NETWORK_TIMEOUT_MS, remaining), {cache: 'reload'});
  }
  if (!await cachedBook(true)) {
    const response = await download('');
    await verifyBook(response);
    if (!await storeBook(response)) throw new Error('cache-write');
  }
  // Core assets are tiny. Keep this pass sequential and within the same deadline.
  for (const file of CORE_FILES) {
    if (await verifyAsset(await readCache(SHELL_CACHE, BASE + file), file)) continue;
    const response = await download(file);
    if (!await verifyAsset(response, file)) throw new Error('shell-integrity:' + file);
    try { await (await caches.open(SHELL_CACHE)).put(BASE + file, response); }
    catch (e) { storageError = 'cache-write'; throw new Error('cache-write'); }
  }
}
async function warmResources(includeImages) {
  if (warmingTask) {
    await warmingTask;
    if (!includeImages) return;
    return warmResources(true); // Recheck: another full-save request may have won.
  }
  const files = includeImages ? FONT_FILES.concat(IMAGE_FILES) : FONT_FILES.slice();
  lastWarmError = '';
  storageError = '';
  warmingTask = (async () => {
    const deadline = Date.now() + WARMUP_BUDGET_MS;
    if (includeImages) {
      try { await repairShell(deadline); }
      catch (e) { lastWarmError = e && e.message ? e.message : 'shell-repair'; return; }
    }
    let cursor = 0, completed = 0, stop = false;
    async function worker() {
      while (cursor < files.length && !stop) {
        const file = files[cursor++];
        let error = '';
        try {
          const cacheName = FONT_FILES.includes(file) ? FONT_CACHE : RUNTIME_CACHE;
          if (!await verifyAsset(await readCache(cacheName, BASE + file), file)) {
            let response = FONT_FILES.includes(file) ? await legacyFont(file) : undefined;
            if (!response) {
              const remaining = deadline - Date.now();
              if (remaining <= 0) throw new Error('warmup-timeout');
              response = await fetchBounded(BASE + file, Math.min(NETWORK_TIMEOUT_MS, remaining), {cache: 'reload'});
              if (!response || response.status !== 200) throw new Error('asset-http:' + file);
              if (!await verifyAsset(response, file)) throw new Error('asset-integrity:' + file);
            }
            if (!await storeAsset(file, response)) throw new Error('cache-write');
          }
        } catch (e) {
          error = e && e.message ? e.message : 'asset-download';
          lastWarmError = error;
          if (/timeout|Failed to fetch|NetworkError|network|offline/i.test(error) || (e && e.name === 'TypeError')) stop = true;
        }
        completed++;
        await broadcast({type: 'ACIM_OFFLINE_PROGRESS', version: CACHE_VERSION, releaseId: RELEASE_ID, completed, total: files.length, resource: file, error, warming: true});
      }
    }
    await Promise.all(Array.from({length: Math.min(3, files.length)}, worker));
  })();
  try { await warmingTask; }
  finally { warmingTask = null; }
  await broadcast(await offlineStatus());
}
self.addEventListener('message', event => {
  const type = event.data && event.data.type;
  if (type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (!['GET_OFFLINE_STATUS', 'WARM_FONTS', 'PREPARE_OFFLINE'].includes(type)) return;
  event.waitUntil((async () => {
    try {
      if (type !== 'GET_OFFLINE_STATUS') await warmResources(type === 'PREPARE_OFFLINE');
      reply(event, await offlineStatus());
    } catch (e) {
      reply(event, {type: 'ACIM_OFFLINE_STATUS', version: CACHE_VERSION, releaseId: RELEASE_ID, bookReady: false,
        shellReady: false, fontsCached: 0, fontsTotal: FONT_FILES.length, imagesCached: 0, imagesTotal: 4,
        complete: false, warming: !!warmingTask, lastWarmError: 'status-unavailable', storageError: 'cache-unavailable'});
    }
  })());
});

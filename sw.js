/* ACIM CE PWA v27 — release-bound offline book.
   The active worker serves only its SHA-256-verified release. A newer release is
   installed in its own cache and becomes visible when its worker activates.
   activate performs local migration/cleanup only: no delay or network warmup.
   WARM_FONTS / PREPARE_OFFLINE run separately, with bounded network work and
   explicit cache status. RELEASE_ID, BOOK_SHA256 and ASSET_SHA256 are filled by
   the deterministic release builder; never hand-edit the compiled worker. */
const CACHE_VERSION = 'v27';
const RELEASE_ID = 'a12301848f24093316c8ac5a2f8a80510646d9f33c63310af349abc6459d83b3';
const PROJ = 'acimce-zh-tw';
const SHELL_CACHE = PROJ + '-shell-' + CACHE_VERSION + '-' + RELEASE_ID;
const RUNTIME_CACHE = PROJ + '-runtime-' + CACHE_VERSION + '-' + RELEASE_ID;
const FONT_CACHE = PROJ + '-fonts';
const EXPECT_VERSION = CACHE_VERSION;
const BOOK_SHA256 = '552a94af3cffb39ee1d6f24b39208e36bb29a5b535e030f65438db6b66fb0950';
const BASE = new URL(self.registration.scope).pathname;
const LEGACY_RE = /^(?:acim-(?:shell|runtime)-v(?:22|23|24)|acim-fonts(?:-v(?:22|23))?)$/;
const OWN_RE = new RegExp('^' + PROJ + '-(?:shell|runtime)-v(\\d+(?:\\.\\d+)*)(?:-[a-f0-9]{64})?$');
const OLD_FONT_CACHES = ['acim-fonts-v22', 'acim-fonts-v23', 'acim-fonts'];
const CORE_FILES = ['index.htm', 'offline.html', 'manifest.json', 'favicon.ico'];
const FONT_FILES = Array.from({length: 8}, (_, i) => 'fonts/lxgw-slice' + i + '.woff2');
const IMAGE_FILES = ['index.files/image001.webp', 'index.files/image002.webp', 'index.files/image003.jpg', 'index.files/ce-manuscript.webp'];
const RUNTIME_FILES = IMAGE_FILES.concat(['icon-512.png', 'pwa-192x192.png', 'screenshot-og.png']);
const RUNTIME_MAX_ENTRIES = 24;
const NETWORK_TIMEOUT_MS = 8000;
const WARMUP_BUDGET_MS = 25000;
const ASSET_SHA256 = {
  'index.htm': '60241fbe8694050be271bc1cd8d18b49eff0f530018acfc8e8ab50c936bd42d0',
  'offline.html': 'f102e49019429b6884091b8f96b32ef23ad2bfb1bed16953156decbf0d0c34ff',
  'manifest.json': '5759df0802261d01c159d03dbf9fb7a078370cd2e9751c5f9f861d178b288caf',
  'favicon.ico': '0c3efbc9e430c0acef49275c9f6e4a5dbd8bc4ae9baf3432212cf59c87351fa4',
  'fonts/lxgw-slice0.woff2': 'f9a66ac4804aee452b472434b74e31a3acb61f602b705dc4ef497931c8c45742',
  'fonts/lxgw-slice1.woff2': '54ec244c37be1b213d080d4ddb1a1b9fe47094854e1d2cf228ff4b7e137e0cb9',
  'fonts/lxgw-slice2.woff2': 'b6edd6cc5b04920e22994c6f2cb9b1d6f8dcec995f8deb229d0b26af2784de4d',
  'fonts/lxgw-slice3.woff2': '6f9cb4f61ca805364aaee7cee0d09c084045f6e850db7c6d367e457daeb04ff9',
  'fonts/lxgw-slice4.woff2': 'd03a9d378fc34aa8dd8dfe327a241a4f3df891a8cb287c8ce6647dd82151a58c',
  'fonts/lxgw-slice5.woff2': '98e9bcaa43888e4752d19deb75bbd14cd287bb98314fe94564afe273a5efb881',
  'fonts/lxgw-slice6.woff2': 'bc9a42b889da557c7ab33d83169cc66bc51fd3ad0067fb6d2aabb61dc142d2c0',
  'fonts/lxgw-slice7.woff2': 'a61224e9e375c127ed3f0d744c30eca038a08c0bd1542497fbed99621fb5a584',
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
    try {
      const old = await caches.open(oldName);
      const dest = await caches.open(FONT_CACHE);
      for (const request of await old.keys()) {
        const file = ownedFontPath(request);
        if (!file) { complete = false; continue; } // Never discard unrelated contents.
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
    if (!complete) retained.add(oldName);
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
        shellReady: false, fontsCached: 0, fontsTotal: 8, imagesCached: 0, imagesTotal: 4,
        complete: false, warming: !!warmingTask, lastWarmError: 'status-unavailable', storageError: 'cache-unavailable'});
    }
  })());
});

/* ACIM CE PWA Service Worker v19 — 小幅修正，與 index.htm 同版。 */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.setConfig({debug:false});
const {registerRoute,setCatchHandler}=workbox.routing;
const {CacheFirst,NetworkFirst,StaleWhileRevalidate}=workbox.strategies;
const {ExpirationPlugin}=workbox.expiration;
const {CacheableResponsePlugin}=workbox.cacheableResponse;

const CACHE_VERSION='v19';
const SHELL_CACHE='acim-shell-'+CACHE_VERSION;
const FONT_CACHE='acim-fonts-'+CACHE_VERSION;
const IMAGE_CACHE='acim-images-'+CACHE_VERSION;
const CONTENT_CACHE='acim-content-'+CACHE_VERSION;
const BASE=new URL(self.registration.scope).pathname;
const BOOK_URL=BASE+'index.htm';
const OFFLINE_URL=BASE+'offline.html';

/* 主文件/manifest/icons：採 CacheFirst 以確保離線閱讀。 */
registerRoute(
  ({request,url})=>request.destination==='document' ||
    url.pathname.endsWith('manifest.json') ||
    (url.pathname.endsWith('.png') && !url.pathname.includes('/index.files/')) ||
    url.pathname.endsWith('.ico'),
  new CacheFirst({
    cacheName:SHELL_CACHE,
    plugins:[
      /* /acim-ce-zh-tw/ 與 /index.htm 指向同一快取，減少一份重複的全書 HTML。 */
      {cacheKeyWillBeUsed:async ({request})=>{
        var pathname=new URL(request.url).pathname;
        if(pathname===BASE || pathname===BOOK_URL)
          return new URL(BOOK_URL,self.location.origin).href;
        return request;
      }},
      new CacheableResponsePlugin({statuses:[0,200]}),
      new ExpirationPlugin({maxEntries:20,maxAgeSeconds:30*24*60*60})
    ]
  })
);
registerRoute(
  ({url})=>url.origin==='https://fonts.googleapis.com',
  new StaleWhileRevalidate({cacheName:FONT_CACHE,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:10,maxAgeSeconds:365*24*60*60})
  ]})
);
registerRoute(
  ({url})=>url.origin==='https://fonts.gstatic.com',
  new CacheFirst({cacheName:FONT_CACHE,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:20,maxAgeSeconds:365*24*60*60})
  ]})
);
registerRoute(
  ({url})=>url.pathname.includes('/index.files/'),
  new CacheFirst({cacheName:IMAGE_CACHE,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:60,maxAgeSeconds:90*24*60*60})
  ]})
);
registerRoute(
  ({url})=>url.origin===self.location.origin && !url.pathname.endsWith('/sw.js'),
  new NetworkFirst({cacheName:CONTENT_CACHE,networkTimeoutSeconds:5,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:30,maxAgeSeconds:7*24*60*60})
  ]})
);

/* 由 Workbox 單一 fetch 路由處理錯誤，避免再次呼叫 respondWith。 */
setCatchHandler(async ({event})=>{
  if(event.request.mode==='navigate' || event.request.destination==='document')
    return await caches.match(OFFLINE_URL) || Response.error();
  return Response.error();
});

self.addEventListener('install',function(event){
  /* 一份完整書稿 + 清單 + 離線頁；失敗時保留舊版 SW，不中斷閱讀。 */
  event.waitUntil(caches.open(SHELL_CACHE).then(cache=>cache.addAll([
    BOOK_URL, BASE+'manifest.json', OFFLINE_URL
  ])));
  /* 不自動 skipWaiting；由使用者點更新提示決定是否套用。 */
});
self.addEventListener('activate',function(event){
  var prefixes=['acim-shell-','acim-fonts-','acim-images-','acim-content-'];
  var keep=[SHELL_CACHE,FONT_CACHE,IMAGE_CACHE,CONTENT_CACHE];
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>{
    if(prefixes.some(prefix=>key.startsWith(prefix)) && !keep.includes(key))
      return caches.delete(key);
  }))).then(()=>self.clients.claim()));
});
self.addEventListener('message',function(event){
  if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('sync',function(event){
  if(event.tag==='acim-reading-progress') { /* 預留未來擴充使用。 */ }
});

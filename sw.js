/* ACIM CE PWA v20. Keep index.htm and sw.js from the SAME release together. */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.setConfig({debug:false});
const {registerRoute,setCatchHandler}=workbox.routing;
const {CacheFirst,NetworkFirst,StaleWhileRevalidate}=workbox.strategies;
const {ExpirationPlugin}=workbox.expiration;
const {CacheableResponsePlugin}=workbox.cacheableResponse;

const CACHE_VERSION='v20';
/* Fonts and book images are unchanged from v19. Bump ASSET_VERSION only
   when publishing changed assets at an existing URL, not for text-only edits. */
const ASSET_VERSION='v19';
const BOOK_SHA256='92049f63e20233c2d01a6b523eec8be7fe46172f4d9e605b9e44662b76c531df';
const SHELL_CACHE='acim-shell-'+CACHE_VERSION;
const FONT_CACHE='acim-fonts-'+ASSET_VERSION;
const IMAGE_CACHE='acim-images-'+ASSET_VERSION;
const CONTENT_CACHE='acim-content-'+CACHE_VERSION;
const BASE=new URL(self.registration.scope).pathname;
const BOOK_URL=BASE+'index.htm';
const OFFLINE_URL=BASE+'offline.html';
const absolute=path=>new URL(path,self.location.origin).href;
function isBook(url){
  return url.origin===self.location.origin && (url.pathname===BASE || url.pathname===BOOK_URL);
}
async function verifyBook(response){
  if(!response || response.status!==200) throw new Error('[ACIM] Book response is not HTTP 200');
  const bytes=await response.clone().arrayBuffer();
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(actual!==BOOK_SHA256) throw new Error('[ACIM] Release mismatch: index.htm and sw.js must be uploaded together');
  return response;
}

registerRoute(
  ({request,url})=>url.origin===self.location.origin && url.pathname.startsWith(BASE) &&
    (request.destination==='document' || isBook(url) || url.pathname.endsWith('manifest.json') ||
     (url.pathname.endsWith('.png')&&!url.pathname.includes('/index.files/')) || url.pathname.endsWith('.ico')),
  new CacheFirst({cacheName:SHELL_CACHE,plugins:[
    {cacheKeyWillBeUsed:async ({request})=>isBook(new URL(request.url))?absolute(BOOK_URL):request,
     fetchDidSucceed:async ({request,response})=>isBook(new URL(request.url))?verifyBook(response):response},
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:20,maxAgeSeconds:30*24*60*60})
  ]})
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
  ({url})=>url.origin===self.location.origin && url.pathname.startsWith(BASE+'index.files/'),
  new CacheFirst({cacheName:IMAGE_CACHE,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:60,maxAgeSeconds:90*24*60*60})
  ]})
);
registerRoute(
  ({url})=>url.origin===self.location.origin && url.pathname.startsWith(BASE) && !url.pathname.endsWith('/sw.js'),
  new NetworkFirst({cacheName:CONTENT_CACHE,networkTimeoutSeconds:5,plugins:[
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:30,maxAgeSeconds:7*24*60*60})
  ]})
);
setCatchHandler(async ({event})=>{
  if(event.request.mode==='navigate'||event.request.destination==='document'){
    const cache=await caches.open(SHELL_CACHE);
    return await cache.match(absolute(OFFLINE_URL)) || Response.error();
  }
  return Response.error();
});

self.addEventListener('install',function(event){
  event.waitUntil((async()=>{
    /* Fetch ALL required resources before writing the new shell cache.
       A mismatched book, a network failure or an HTTP error fails installation;
       the current worker and its caches remain active. */
    const paths=[BOOK_URL,BASE+'manifest.json',OFFLINE_URL];
    const responses=await Promise.all(paths.map(path=>fetch(new Request(absolute(path),{cache:'reload'}))));
    if(responses.some(r=>r.status!==200)) throw new Error('[ACIM] Required offline resource failed');
    await verifyBook(responses[0]);
    const cache=await caches.open(SHELL_CACHE);
    await Promise.all(paths.map((path,i)=>cache.put(absolute(path),responses[i])));
  })());
  /* Intentionally no skipWaiting(): respect the reader's update choice. */
});
self.addEventListener('activate',function(event){
  const prefixes=['acim-shell-','acim-fonts-','acim-images-','acim-content-'];
  const keep=[SHELL_CACHE,FONT_CACHE,IMAGE_CACHE,CONTENT_CACHE];
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>{
    if(prefixes.some(prefix=>key.startsWith(prefix))&&!keep.includes(key))return caches.delete(key);
  }))).then(()=>self.clients.claim()));
});
self.addEventListener('message',function(event){
  if(event.data&&event.data.type==='SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('sync',function(event){
  if(event.tag==='acim-reading-progress'){ /* Reserved; no user data is uploaded. */ }
});

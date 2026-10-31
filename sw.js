/* ACIM CE PWA v21. Publish this file and index.htm from the SAME release.
   Workbox remains pinned to the existing CDN release. No unverified vendor
   copies or new rendering framework are introduced in this conservative build. */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js');
workbox.setConfig({debug:false});
const {registerRoute,setCatchHandler}=workbox.routing;
const {CacheFirst,NetworkFirst,StaleWhileRevalidate}=workbox.strategies;
const {ExpirationPlugin,CacheExpiration}=workbox.expiration;
const {CacheableResponsePlugin}=workbox.cacheableResponse;

const CACHE_VERSION='v21';
const ASSET_VERSION='v19';
const FONT_CACHE_VERSION='v21';
const BOOK_SHA256='c0ff5673524559725f32556548eb33083b0b69cf8f04e8c1e5ee32768218a86e';
const BOOK_IMAGE_PATH='index.files/ce-manuscript-d43d5d40e701.png';
const BOOK_IMAGE_SHA256='d43d5d40e701e3eebc53e91927cda7dc08116e379b3b4875730e8eff10a33fcf';
const SHELL_CACHE='acim-shell-'+CACHE_VERSION;
const FONT_CSS_CACHE='acim-font-css-'+FONT_CACHE_VERSION;
const FONT_FILE_CACHE='acim-font-files-'+FONT_CACHE_VERSION;
const LEGACY_FONT_CACHE='acim-fonts-v19';
const IMAGE_CACHE='acim-images-'+ASSET_VERSION;
const CONTENT_CACHE='acim-content-'+CACHE_VERSION;
const BASE=new URL(self.registration.scope).pathname;
const BOOK_URL=BASE+'index.htm';
const OFFLINE_URL=BASE+'offline.html';
const absolute=path=>new URL(path,self.location.origin).href;
const FONT_MAX_AGE=365*24*60*60;
function isBook(url){
  return url.origin===self.location.origin && (url.pathname===BASE || url.pathname===BOOK_URL);
}
async function verifyResponse(response,expected,label){
  if(!response || response.status!==200) throw new Error('[ACIM] '+label+' is not HTTP 200');
  const digest=await crypto.subtle.digest('SHA-256',await response.clone().arrayBuffer());
  const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  if(actual!==expected) throw new Error('[ACIM] Release mismatch: '+label);
  return response;
}
const verifyBook=response=>verifyResponse(response,BOOK_SHA256,'index.htm');
function fontTarget(request){
  const origin=new URL(request.url).origin;
  if(origin==='https://fonts.googleapis.com') return FONT_CSS_CACHE;
  if(origin==='https://fonts.gstatic.com') return FONT_FILE_CACHE;
  return null;
}
function usableLegacy(response){
  if(!response || (response.status!==0 && response.status!==200)) return false;
  const date=Date.parse(response.headers.get('date')||'');
  return !Number.isFinite(date) || Date.now()-date<=FONT_MAX_AGE*1000;
}
/* A failed migration never deletes the legacy cache. On a cache miss it can
   still supply previously downloaded fonts; no user reading data is touched. */
let legacyAvailable=null;
const legacyFallback={cachedResponseWillBeUsed:async({request,cachedResponse})=>{
  if(cachedResponse) return cachedResponse;
  if(!fontTarget(request)) return undefined;
  if(legacyAvailable===null) legacyAvailable=(await caches.keys()).includes(LEGACY_FONT_CACHE);
  if(!legacyAvailable) return undefined;
  const response=await (await caches.open(LEGACY_FONT_CACHE)).match(request);
  return usableLegacy(response)?response:undefined;
}};

registerRoute(
  ({request,url})=>url.origin===self.location.origin && url.pathname.startsWith(BASE) &&
    (request.destination==='document' || isBook(url) || url.pathname.endsWith('manifest.json') ||
     (url.pathname.endsWith('.png')&&!url.pathname.includes('/index.files/')) || url.pathname.endsWith('.ico')),
  new CacheFirst({cacheName:SHELL_CACHE,plugins:[
    {cacheKeyWillBeUsed:async({request})=>isBook(new URL(request.url))?absolute(BOOK_URL):request,
     fetchDidSucceed:async({request,response})=>isBook(new URL(request.url))?verifyBook(response):response},
    new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:20,maxAgeSeconds:30*24*60*60})
  ]})
);
registerRoute(
  ({url})=>url.origin==='https://fonts.googleapis.com',
  new StaleWhileRevalidate({cacheName:FONT_CSS_CACHE,plugins:[
    legacyFallback,new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:10,maxAgeSeconds:FONT_MAX_AGE})
  ]})
);
registerRoute(
  ({url})=>url.origin==='https://fonts.gstatic.com',
  new CacheFirst({cacheName:FONT_FILE_CACHE,plugins:[
    legacyFallback,new CacheableResponsePlugin({statuses:[0,200]}),
    new ExpirationPlugin({maxEntries:200,maxAgeSeconds:FONT_MAX_AGE})
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
setCatchHandler(async({event})=>{
  if(event.request.mode==='navigate'||event.request.destination==='document'){
    const cache=await caches.open(SHELL_CACHE);
    return await cache.match(absolute(OFFLINE_URL)) || Response.error();
  }
  return Response.error();
});

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    /* The former inline PNG must be available offline even if its chapter has
       never been opened. Validate BOTH book and image before enabling update. */
    const paths=[BOOK_URL,BASE+'manifest.json',OFFLINE_URL,BASE+BOOK_IMAGE_PATH];
    const responses=await Promise.all(paths.map(path=>fetch(new Request(absolute(path),{cache:'reload'}))));
    if(responses.some(r=>r.status!==200)) throw new Error('[ACIM] Required offline resource failed');
    await verifyBook(responses[0]);
    await verifyResponse(responses[3],BOOK_IMAGE_SHA256,BOOK_IMAGE_PATH);
    const image=await caches.open(IMAGE_CACHE);
    await image.put(absolute(paths[3]),responses[3]);
    const shell=await caches.open(SHELL_CACHE);
    await Promise.all(paths.slice(0,3).map((path,i)=>shell.put(absolute(path),responses[i])));
  })());
  /* Intentionally no skipWaiting: keep the reader's explicit update choice. */
});
async function migrateFonts(){
  const keys=await caches.keys();
  if(!keys.includes(LEGACY_FONT_CACHE)) return true;
  try{
    const legacy=await caches.open(LEGACY_FONT_CACHE);
    const limits=new Map([[FONT_CSS_CACHE,10],[FONT_FILE_CACHE,200]]);
    const managers=new Map();
    for(const [name,maxEntries] of limits){
      managers.set(name,new CacheExpiration(name,{maxEntries,maxAgeSeconds:FONT_MAX_AGE}));
    }
    for(const request of await legacy.keys()){
      const name=fontTarget(request);if(!name)continue;
      const response=await legacy.match(request);if(!usableLegacy(response))continue;
      const dest=await caches.open(name);
      if(!await dest.match(request)){
        await dest.put(request,response);
      }
      /* Also repair metadata after a prior successful put followed by an
         IndexedDB failure; an existing newer response is never overwritten. */
      await managers.get(name).updateTimestamp(request.url);
    }
    for(const manager of managers.values()) await manager.expireEntries();
    return true;
  }catch(error){
    console.warn('[ACIM] Font migration deferred; keeping legacy cache.',error);
    return false;
  }
}
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const migrated=await migrateFonts();
    const prefixes=['acim-shell-','acim-fonts-','acim-font-css-','acim-font-files-','acim-images-','acim-content-'];
    const keep=[SHELL_CACHE,FONT_CSS_CACHE,FONT_FILE_CACHE,IMAGE_CACHE,CONTENT_CACHE];
    if(!migrated)keep.push(LEGACY_FONT_CACHE);
    await Promise.all((await caches.keys()).map(key=>{
      if(prefixes.some(prefix=>key.startsWith(prefix))&&!keep.includes(key))return caches.delete(key);
    }));
    legacyAvailable=!migrated;
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('sync',event=>{
  if(event.tag==='acim-reading-progress'){ /* Reserved; no user data uploaded. */ }
});

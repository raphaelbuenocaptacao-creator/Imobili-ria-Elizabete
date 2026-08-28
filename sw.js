const CACHE_NAME='elizabeth-imoveis-v3';
const STATIC_ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-512-maskable.svg','./assets/logo.svg','./assets/logo-maskable.svg'];
const PRIVATE_PATH_RE=/\/(api|auth|login|logout|admin|session|sessions|token|tokens|account|profile|me)(\/|$)/i;

function isPrivate(request,url){
  return request.method!=='GET'||request.headers.has('authorization')||url.origin!==self.location.origin||PRIVATE_PATH_RE.test(url.pathname);
}

function isStaticShell(request){
  return STATIC_ASSETS.some(path=>request.url===new URL(path,self.registration.scope).href);
}

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(isPrivate(request,url)) return;

  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }

  if(!isStaticShell(request)) return;
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));
    }
    return response;
  })));
});

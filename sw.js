const CACHE_PREFIX='elizabete-imoveis-';
const CACHE_NAME=`${CACHE_PREFIX}v6-safe-shell`;
const STATIC_ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.svg','./icon-512.svg','./icon-512-maskable.svg','./assets/logo.svg','./assets/logo-maskable.svg'];
const PRIVATE_PATH_RE=/\/(api|auth|login|logout|admin|session|sessions|token|tokens|password|account|profile|me)(\/|$)/i;
const SENSITIVE_QUERY_RE=/^(token|access_token|refresh_token|password|passwd|secret|session|auth|authorization|api_key|apikey|key|code|credential|credentials)$/i;

function hasSensitiveQuery(url){
  for(const key of url.searchParams.keys()) if(SENSITIVE_QUERY_RE.test(key)) return true;
  return false;
}

function isPrivate(request,url){
  return request.method!=='GET'||request.headers.has('authorization')||request.headers.has('cookie')||url.origin!==self.location.origin||PRIVATE_PATH_RE.test(url.pathname)||hasSensitiveQuery(url);
}

function isStaticShell(request,url){
  if(url.search) return false;
  return STATIC_ASSETS.some(path=>request.url===new URL(path,self.registration.scope).href);
}

function isSafeResponse(response){
  if(!response||!response.ok||response.type!=='basic'||response.status===206) return false;
  const cacheControl=(response.headers.get('cache-control')||'').toLowerCase();
  if(cacheControl.includes('private')||cacheControl.includes('no-store')) return false;
  if(response.headers.has('set-cookie')) return false;
  return true;
}

async function precacheShell(){
  const cache=await caches.open(CACHE_NAME);
  await Promise.all(STATIC_ASSETS.map(async path=>{
    try{
      const request=new Request(path,{credentials:'omit',cache:'reload'});
      const response=await fetch(request);
      if(isSafeResponse(response)) await cache.put(request,response.clone());
    }catch(_error){/* keep install resilient */}
  }));
}

self.addEventListener('install',event=>{
  event.waitUntil(precacheShell());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(isPrivate(request,url)) return;

  if(request.mode==='navigate'){
    event.respondWith(fetch(request,{cache:'no-store'}).catch(async()=>{
      const cache=await caches.open(CACHE_NAME);
      return (await cache.match('./index.html'))||(await cache.match('./'))||Response.error();
    }));
    return;
  }

  if(!isStaticShell(request,url)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const hit=await cache.match(request);
    if(hit) return hit;
    const response=await fetch(new Request(request,{credentials:'omit',cache:'no-store'}));
    if(isSafeResponse(response)) event.waitUntil(cache.put(request,response.clone()));
    return response;
  })());
});

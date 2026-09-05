const CACHE_PREFIX='elizabete-imoveis-';
const CACHE_NAME=`${CACHE_PREFIX}v8-raster-safe-shell`;
const STATIC_ASSETS=['./','./index.html','./styles.css','./app.js','./pwa-register.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-512-maskable.png'];
const PRIVATE_PATH_RE=/\/(api|auth|login|logout|admin|session|sessions|token|tokens|password|account|profile|me)(\/|$)/i;
const SENSITIVE_QUERY_RE=/^(token|access_token|refresh_token|id_token|jwt|password|passwd|secret|client_secret|session|auth|authorization|api_key|apikey|key|code|credential|credentials|assertion|samlresponse|signature|sig)$/i;
const SENSITIVE_VARY_RE=/(^|,)\s*(cookie|authorization)\s*(,|$)/i;

function hasSensitiveQuery(url){
  for(const key of url.searchParams.keys()) if(SENSITIVE_QUERY_RE.test(key)) return true;
  return false;
}

function isPrivate(request,url){
  return request.method!=='GET'||request.headers.has('authorization')||request.headers.has('cookie')||request.headers.has('range')||request.headers.has('if-range')||url.origin!==self.location.origin||PRIVATE_PATH_RE.test(url.pathname)||hasSensitiveQuery(url);
}

function isStaticShell(request,url){
  if(url.search) return false;
  return STATIC_ASSETS.some(path=>request.url===new URL(path,self.registration.scope).href);
}

function isSafeResponse(response){
  if(!response||!response.ok||response.type!=='basic'||response.status===206||response.redirected) return false;
  if(response.headers.has('content-range')||response.headers.has('set-cookie')) return false;
  const vary=response.headers.get('vary')||'';
  if(vary==='*'||SENSITIVE_VARY_RE.test(vary)) return false;
  const cacheControl=(response.headers.get('cache-control')||'').toLowerCase();
  if(cacheControl.includes('private')||cacheControl.includes('no-store')) return false;
  return true;
}

async function precacheShell(){
  const cache=await caches.open(CACHE_NAME);
  const critical=['./index.html','./styles.css','./app.js','./pwa-register.js','./manifest.webmanifest'];
  const failures=[];
  for(const path of STATIC_ASSETS){
    try{
      const request=new Request(path,{credentials:'omit',cache:'no-store',redirect:'error'});
      const response=await fetch(request);
      if(!isSafeResponse(response)) throw new Error(`unsafe:${path}`);
      await cache.put(request,response.clone());
    }catch(_error){
      if(critical.includes(path)) failures.push(path);
    }
  }
  if(failures.length){
    await caches.delete(CACHE_NAME);
    throw new Error(`critical-shell-missing:${failures.join(',')}`);
  }
}

self.addEventListener('install',event=>{
  event.waitUntil(precacheShell());
});

self.addEventListener('message',event=>{
  if(event.data?.type==='SKIP_WAITING') self.skipWaiting();
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
    event.respondWith(fetch(request,{cache:'no-store',redirect:'error'}).then(response=>{
      if(!response.ok||response.redirected) throw new Error('unsafe-navigation');
      return response;
    }).catch(async()=>{
      const cache=await caches.open(CACHE_NAME);
      return (await cache.match('./index.html'))||(await cache.match('./'))||new Response('Elizabete Imóveis está offline. Reconecte para continuar.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
    }));
    return;
  }

  if(!isStaticShell(request,url)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const hit=await cache.match(request);
    if(hit) return hit;
    const response=await fetch(new Request(request,{credentials:'omit',cache:'no-store',redirect:'error'}));
    if(isSafeResponse(response)) event.waitUntil(cache.put(request,response.clone()));
    return response;
  })());
});

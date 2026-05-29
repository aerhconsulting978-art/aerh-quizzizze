const CACHE='aerh-v2';
const ASSETS=['/','index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.url.includes('firebase')||e.request.url.includes('googleapis')||e.request.url.includes('netlify/functions')||e.request.url.includes('qrserver'))return;
  e.respondWith(fetch(e.request).then(r=>{const rc=r.clone();caches.open(CACHE).then(c=>c.put(e.request,rc));return r;}).catch(()=>caches.match(e.request)));
});

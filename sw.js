// Seserahan Tracker SW v9 - tambah diet
const CACHE_NAME='seserahan-v14';
const urlsToCache=['./','./index.html','./daftar.html','./grafik.html','./planning.html','./board.html','./diet.html','./style.css','./app.js','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{self.skipWaiting();
 e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(urlsToCache.map(u=>c.add(u).catch(err=>console.warn('Gagal cache:',u,err))))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE_NAME).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=r.url;
 if(r.method!=='GET'||new URL(u).origin!==location.origin)return;
 e.respondWith(fetch(r).then(res=>{if(res.status===200&&res.type==='basic'){const k=res.clone();caches.open(CACHE_NAME).then(c=>c.put(r,k))}return res})
 .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||(r.mode==='navigate'?caches.match('./index.html'):new Response('Offline',{status:503})))))});

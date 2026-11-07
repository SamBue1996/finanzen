/* Finanz-App offline: die Seite kommt frisch aus dem Netz, wenn es gibt; sonst aus dem Speicher auf dem Gerät.
   Schriften und PDF-Leser werden einmal geladen und dann aufgehoben. Die Verbindung zu GitHub (Daten) wird nie zwischengespeichert. */
const C='finanzen-1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add('./')).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
const keep=(req,res)=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(req,cp))}return res};
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.origin===location.origin){
    const net=fetch(r).then(res=>keep(r,res));
    const late=new Promise(ok=>setTimeout(ok,4000)).then(()=>caches.match(r,{ignoreSearch:true}));
    e.respondWith(Promise.race([net,late.then(m=>m||net)]).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));return}
  if(/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.hostname))
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>keep(r,res))))});

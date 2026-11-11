// Pim Pam · service worker (0.76). It only serves files once Pim Pam has been installed from the «Instal·la» button:
// pwa.js (in the page) downloads every file listed in pwa-fitxers.json into the cache «pimpam-fitxers», keyed by
// path + content hash, and then writes the list it completed to «pimpam-meta/actiu». Until that list exists the
// worker lets every request go to the network, so visiting the web never downloads anything extra.
// The downloads of pwa.js carry ?pwa-baixa=1 and always go to the network (otherwise an update would get the old copy).
// Video requests come with a Range header: the cached file is cut to the requested bytes (206), or <video> would not play.
const DATA='pimpam-fitxers', META='pimpam-meta';
let actiu; // undefined = not read yet, null = not installed, {version,files:{path:hash}}
const scope=()=>self.registration.scope;
const clau=(path,hash)=>scope()+path+'?pwa='+hash;
async function llegeixActiu(){
 if(actiu!==undefined)return actiu;
 try{const r=await (await caches.open(META)).match('actiu');actiu=r?await r.json():null;}catch{actiu=null;}
 return actiu;
}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{if(e.data&&e.data.type==='pimpam-actiu'){actiu=undefined;e.waitUntil(llegeixActiu());}});
function camiDe(url){
 const s=scope();if(!url.startsWith(s))return null;
 let p=decodeURIComponent(url.slice(s.length).split('#')[0].split('?')[0]);
 if(p===''||p.endsWith('/'))p+='index.html';
 return p;
}
async function talla(req,r){
 const range=req.headers.get('range');if(!range)return r;
 const m=/bytes=(\d*)-(\d*)/.exec(range);const blob=await r.blob();const len=blob.size;
 if(!m)return r;
 let a,b;if(m[1]===''){a=Math.max(0,len-Number(m[2]));b=len-1;}else{a=Number(m[1]);b=m[2]===''?len-1:Math.min(len-1,Number(m[2]));}
 if(a>=len||a>b)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${len}`}});
 return new Response(blob.slice(a,b+1),{status:206,statusText:'Partial Content',headers:{
  'Content-Type':r.headers.get('content-type')||'application/octet-stream','Content-Range':`bytes ${a}-${b}/${len}`,
  'Content-Length':String(b-a+1),'Accept-Ranges':'bytes'}});
}
async function respon(req,path){
 const a=await llegeixActiu();
 const hash=a&&a.files[path];
 if(hash){
  const r=await (await caches.open(DATA)).match(clau(path,hash));
  if(r)return talla(req,r);
 }
 return fetch(req);
}
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET'||actiu===null)return;
 const path=camiDe(req.url);
 if(!path||path==='sw.js'||path==='pwa-fitxers.json'||req.url.includes('pwa-baixa='))return;
 e.respondWith(respon(req,path));
});

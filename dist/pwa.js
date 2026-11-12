// Pim Pam · installation as an app (PWA, 0.76).
// The «Instal·la» button of the home header opens a window that first says how much space the installed app takes
// (the real total of pwa-fitxers.json, which tools/pwa-build.mjs writes from dist/ at every publication), then asks
// the browser to install it (beforeinstallprompt, Chrome and Edge) and downloads every file into the Cache Storage, so
// that it works without a connection. sw.js serves those files. The download runs here, in the page, because a service
// worker can be stopped by the browser after a few minutes; it can be stopped and resumed (files already kept are not
// downloaded again). Each later version downloads only the files whose content changed and deletes the old ones.
// Visiting the web without installing downloads nothing extra. On file:// (single-file build) everything is off.
const pw_DATA='pimpam-fitxers', pw_META='pimpam-meta';
const pw_base=()=>new URL('./',document.baseURI).href;
const pw_clau=(path,hash)=>pw_base()+path+'?pwa='+hash;
const pw_ruta=p=>pw_base()+p.split('/').map(encodeURIComponent).join('/');
const pw_pwa={on:false,prompt:null,actiu:null,llista:null,feina:null,progres:null,error:'',acabat:false,obre:null};
const pw_standalone=()=>matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: minimal-ui)').matches||navigator.standalone===true;
const pw_esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// Sizes as Windows shows them (1 MB = 1024 × 1024 bytes), without decimals below 10 GB… only the GB carry one.
export function pwaMida(bytes){
 const mb=bytes/1048576;
 if(mb>=1024)return (Math.round(mb/1024*10)/10).toString().replace('.',',')+' GB';
 return (mb<10?Math.max(0.1,Math.round(mb*10)/10):Math.round(mb)).toString().replace('.',',')+' MB';
}
// The total split into what it is made of, for the window.
export function pwaParts(llista){
 const p={video:0,so:0,imatge:0,codi:0};
 for(const [path,size] of llista.files){
  const ext=path.slice(path.lastIndexOf('.')+1).toLowerCase();
  p[ext==='mp4'||ext==='webm'?'video':['mp3','ogg','wav','m4a'].includes(ext)?'so':['png','webp','jpg','jpeg','svg','gif','avif'].includes(ext)?'imatge':'codi']+=size;
 }
 return p;
}

function pw_llegeixActiu(){
 return caches.open(pw_META).then(c=>c.match('actiu')).then(r=>r?r.json():null).catch(()=>null);
}
function pw_demanaLlista(){
 return fetch(pw_base()+'pwa-fitxers.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('llista '+r.status);return r.json();});
}
function pw_avisaSW(){
 const m={type:'pimpam-actiu'};
 navigator.serviceWorker.controller?.postMessage(m);
 navigator.serviceWorker.getRegistration().then(r=>r?.active?.postMessage(m)).catch(()=>{});
}
function pw_hex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');}

// Downloads every file of the list that is not kept yet. onPas(fet,total) after each file.
function pw_descarrega(llista,onPas,senyal){
 return caches.open(pw_DATA).then(c=>c.keys().then(keys=>{
  const tinc=new Set(keys.map(r=>r.url));
  const falten=llista.files.filter(([p,,h])=>!tinc.has(new URL(pw_clau(p,h)).href));
  let fet=llista.total-falten.reduce((s,f)=>s+f[1],0);
  onPas(fet,llista.total);
  const cua=falten.slice();
  const un=([p,size,h],intent=0)=>fetch(pw_ruta(p)+'?pwa-baixa=1',{cache:'no-cache',signal:senyal}).then(r=>{
    if(!r.ok)throw new Error(p+' '+r.status);
    return r.arrayBuffer().then(buf=>crypto.subtle.digest('SHA-256',buf).then(d=>{
     if(pw_hex(d).slice(0,16)!==h){const e=new Error('versio');e.versio=true;throw e;}
     return c.put(pw_clau(p,h),new Response(buf,{headers:{'Content-Type':r.headers.get('content-type')||'application/octet-stream','Content-Length':String(size)}}));
    }));
   }).catch(e=>{
    if(senyal.aborted||e.versio||e.name==='QuotaExceededError'||intent>=3)throw e;
    return new Promise(ok=>setTimeout(ok,1200*(intent+1))).then(()=>un([p,size,h],intent+1));
   }).then(()=>{fet+=size;onPas(fet,llista.total);});
  const fil=()=>cua.length&&!senyal.aborted?un(cua.shift()).then(fil):Promise.resolve();
  return Promise.all(Array.from({length:6},fil));
 })).then(()=>{if(senyal.aborted)throw new DOMException('Aturat','AbortError');});
}
// Makes the downloaded list the one the service worker serves and deletes the files of older versions.
function pw_activa(llista){
 const files={};for(const [p,,h] of llista.files)files[p]=h;
 const actiu={version:llista.version,hash:llista.hash,total:llista.total,files};
 return caches.open(pw_META).then(c=>c.put('actiu',new Response(JSON.stringify(actiu),{headers:{'Content-Type':'application/json'}}))).then(()=>{
  pw_pwa.actiu=actiu;pw_avisaSW();pw_estat();
  const vull=new Set(llista.files.map(([p,,h])=>new URL(pw_clau(p,h)).href));
  return caches.open(pw_DATA).then(c=>c.keys().then(keys=>Promise.all(keys.filter(r=>!vull.has(r.url)).map(r=>c.delete(r)))));
 });
}
function pw_sincronitza(llista,onPas){
 const ctrl=new AbortController();
 pw_pwa.feina={ctrl,llista};pw_pwa.progres=[0,llista.total];pw_pwa.error='';
 const p=pw_descarrega(llista,(f,t)=>{pw_pwa.progres=[f,t];onPas?.(f,t);},ctrl.signal).then(()=>pw_activa(llista)).finally(()=>{pw_pwa.feina=null;pw_estat();});
 pw_estat();
 return p;
}

// Header button state: hidden when the browser cannot install (file://), and inside the installed app once complete.
function pw_estat(){
 const root=document.documentElement;
 const complet=!!(pw_pwa.actiu&&pw_pwa.llista&&pw_pwa.actiu.hash===pw_pwa.llista.hash)||!!(pw_pwa.actiu&&!pw_pwa.llista);
 root.classList.toggle('pwa-no',!pw_pwa.on);
 root.classList.toggle('pwa-instal-lada',!!pw_pwa.actiu);
 root.classList.toggle('pwa-complet',complet&&!pw_pwa.feina);
 root.classList.toggle('pwa-app',pw_standalone());
 for(const b of document.querySelectorAll('[data-instal] span'))b.textContent=pw_pwa.feina?'Descarregant…':pw_pwa.actiu&&!pw_standalone()&&!pw_pwa.prompt?'Instal·lada':'Instal·la';
 if(pw_pwa.obre)pw_pwa.obre.pinta();
}
export function pwaBotoHtml(icon){
 return `<button class="settings-button instal-button" data-instal aria-label="Instal·la Pim Pam en aquest dispositiu" title="Instal·la Pim Pam en aquest dispositiu">${icon}<span>Instal·la</span></button>`;
}
export function pwaRefresca(){pw_estat();}

export function pwaInit(){
 pw_pwa.on='serviceWorker' in navigator&&'caches' in self&&/^https?:$/.test(location.protocol)&&isSecureContext;
 pw_estat();
 if(!pw_pwa.on)return;
 addEventListener('beforeinstallprompt',e=>{e.preventDefault();pw_pwa.prompt=e;pw_estat();});
 addEventListener('appinstalled',()=>{pw_pwa.prompt=null;pw_estat();});
 matchMedia('(display-mode: standalone)').addEventListener?.('change',pw_estat);
 navigator.serviceWorker.register('./sw.js').catch(()=>{});
 pw_llegeixActiu().then(a=>{
  pw_pwa.actiu=a;pw_estat();
  if(!a)return;
  // Installed: keep it up to date with the published version, quietly and only with the files that changed.
  setTimeout(()=>{if(!navigator.onLine||pw_pwa.feina)return;pw_demanaLlista().then(l=>{pw_pwa.llista=l;pw_estat();if(l.hash!==a.hash)return pw_sincronitza(l);}).catch(()=>{});},6000);
 });
}

// ── The window ──
function pw_finestra(close,onClose){
 const d=document.createElement('dialog');
 d.className='dialog instal-dialog';d.id='instal';d.setAttribute('aria-labelledby','instal-title');
 let fase='info',quota=null,fiSensePrompt=false;
 const tanca=()=>{if(pw_pwa.obre!==obj)return;pw_pwa.obre=null;d.close();d.remove();onClose?.();};
 const parts=l=>{const p=pwaParts(l);return [['Vídeos',p.video],['Sons i música',p.so],['Imatges',p.imatge],['Programa i textos',p.codi]].filter(x=>x[1]>0)
  .map(([n,b])=>`<li><span>${n}</span><strong>${pwaMida(b)}</strong></li>`).join('');};
 const cos=()=>{
  const l=pw_pwa.llista;
  if(pw_pwa.error)return `<p class="instal-error">${pw_esc(pw_pwa.error)}</p><div class="dialog-actions"><button class="btn" data-instal-tanca>Tanca</button><button class="btn primary" data-instal-va>Torna-ho a provar</button></div>`;
  if(!l)return `<p>Calculant l’espai que ocupa…</p>`;
  if(pw_pwa.feina||fase==='baixa'){
   const [f,t]=pw_pwa.progres||[0,l.total];const pc=t?Math.floor(f/t*100):0;
   return `<p>S’estan descarregant les activitats, els sons i els vídeos. Deixeu aquesta finestra oberta fins que acabi.</p>
<div class="instal-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><span style="width:${pc}%"></span></div>
<p class="instal-xifres"><span>${pwaMida(f)} de ${pwaMida(t)}</span><span>${pc} %</span></p>
<div class="dialog-actions"><span class="hint">Si s’atura, la propera vegada continuarà on s’ha quedat.</span><button class="btn" data-instal-atura>Atura</button></div>`;
  }
  const complet=pw_pwa.actiu&&pw_pwa.actiu.hash===l.hash;
  if(complet||fase==='fet'){
   return `<p class="instal-ok">${pw_standalone()||!fiSensePrompt?'Pim Pam està instal·lat en aquest dispositiu i funciona sense connexió.':'Totes les activitats ja són en aquest dispositiu i funcionen sense connexió.'}</p>
${fiSensePrompt&&!pw_standalone()?`<p class="hint">Si el navegador no ha mostrat cap avís d’instal·lació: a Chrome i Edge, feu servir la icona d’instal·lar de la barra d’adreces; a l’iPad i l’iPhone, Safari › Comparteix › Afegeix a la pantalla d’inici.</p>`:''}
<div class="instal-total"><span>Espai que ocupa</span><strong>${pwaMida(l.total)}</strong></div>
<div class="dialog-actions"><button class="btn" data-instal-esborra>Esborra les activitats d’aquest dispositiu</button>${pw_pwa.prompt?`<button class="btn" data-instal-app>Instal·la l’aplicació</button>`:''}<button class="btn primary" data-instal-tanca>D’acord</button></div>`;
  }
  const kept=pw_pwa.actiu?Object.keys(pw_pwa.actiu.files).length:0;
  const falta=l.total;
  const lliure=quota?quota.quota-quota.usage:null;
  return `<p>Pim Pam s’instal·larà en aquest dispositiu com una aplicació, i s’hi descarregaran totes les activitats, els sons i els vídeos perquè funcioni sense connexió.</p>
<div class="instal-total"><span>Espai total que ocuparà instal·lat</span><strong>${pwaMida(l.total)}</strong></div>
<ul class="instal-parts">${parts(l)}</ul>
${lliure!==null?`<p class="hint">Espai que aquest navegador pot fer servir en aquest dispositiu: ${pwaMida(lliure)}.</p>`:''}
${lliure!==null&&lliure<falta?`<p class="instal-error">No hi ha prou espai lliure per instal·lar Pim Pam en aquest dispositiu.</p>`:''}
<p class="hint">La descàrrega pot trigar uns quants minuts. Les versions noves s’actualitzaran soles i només baixaran el que hagi canviat.</p>${kept?'<p class="hint">Una part ja és descarregada i no es tornarà a baixar.</p>':''}
<div class="dialog-actions"><button class="btn" data-instal-tanca>Cancel·la</button><button class="btn primary" data-instal-va>${icon('download')}Instal·la (${pwaMida(l.total)})</button></div>`;
 };
 let icon=()=>'';
 const obj={pinta(){const b=d.querySelector('.dialog-body');if(b){const f=document.activeElement&&d.contains(document.activeElement)?[...b.querySelectorAll('button')].indexOf(document.activeElement):-1;b.innerHTML=cos();const bs=b.querySelectorAll('button');(bs[f]||b.querySelector('.btn.primary')||bs[0])?.focus?.();}},tanca,set icon(f){icon=f;}};
 const va=()=>{
  pw_pwa.error='';
  const l=pw_pwa.llista;
  if(!l){obj.pinta();pw_demanaLlista().then(x=>{pw_pwa.llista=x;pw_estat();}).catch(()=>{pw_pwa.error='No s’ha pogut saber què cal descarregar. Torneu-ho a provar d’aquí a una estona.';obj.pinta();});return;}
  const baixa=()=>{fase='baixa';obj.pinta();navigator.storage?.persist?.().catch(()=>{});
   pw_sincronitza(l,()=>{if(pw_pwa.obre===obj)obj.pinta();}).then(()=>{fase='fet';obj.pinta();}).catch(e=>{
    fase='info';
    if(e.name==='AbortError'){obj.pinta();return;}
    pw_pwa.error=e.versio?'Mentre es descarregava s’ha publicat una versió nova de Pim Pam. Torneu-ho a provar: continuarà on s’havia quedat.'
     :e.name==='QuotaExceededError'?'No hi ha prou espai lliure en aquest dispositiu per acabar la instal·lació.'
     :navigator.onLine?'No s’ha pogut descarregar tot. Torneu-ho a provar: continuarà on s’havia quedat.':'S’ha perdut la connexió. Torneu-ho a provar quan torni a haver-n’hi: continuarà on s’havia quedat.';
    obj.pinta();});};
  if(pw_pwa.prompt&&!pw_standalone()){
   const p=pw_pwa.prompt;pw_pwa.prompt=null;
   p.prompt();
   p.userChoice.then(c=>{if(c.outcome==='accepted')baixa();else{fase='info';obj.pinta();}}).catch(baixa);
  }else{fiSensePrompt=!pw_standalone();baixa();}
 };
 d.addEventListener('click',e=>{
  if(e.target===d){tanca();return;}
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-instal-tanca')||b.hasAttribute('data-close-instal'))tanca();
  else if(b.hasAttribute('data-instal-va'))va();
  else if(b.hasAttribute('data-instal-atura'))pw_pwa.feina?.ctrl.abort();
  else if(b.hasAttribute('data-instal-app')){const p=pw_pwa.prompt;pw_pwa.prompt=null;p?.prompt();p?.userChoice.finally(()=>pw_estat());}
  else if(b.hasAttribute('data-instal-esborra')){
   Promise.all([caches.delete(pw_DATA),caches.delete(pw_META)]).then(()=>{pw_pwa.actiu=null;fase='info';pw_avisaSW();pw_estat();obj.pinta();});
  }
 });
 d.addEventListener('cancel',e=>{e.preventDefault();tanca();});
 d.innerHTML=`<div class="dialog-head"><div class="dialog-title"><h2 id="instal-title">Instal·la Pim Pam</h2><button class="icon-button" data-close-instal aria-label="Tanca" title="Tanca">${close||'×'}</button></div></div><div class="dialog-body instal-body"></div>`;
 return {d,obj,fase:f=>{fase=f;},quota:q=>{quota=q;}};
}
export function pwaObre({close,icon,onClose}={}){
 if(!pw_pwa.on||pw_pwa.obre)return false;
 const f=pw_finestra(close,onClose);f.obj.icon=icon||(()=>'');
 pw_pwa.obre=f.obj;
 (document.fullscreenElement||document.body).append(f.d);
 f.obj.pinta();f.d.showModal();
 const q=navigator.storage?.estimate?navigator.storage.estimate().then(e=>{f.quota(e);}).catch(()=>{}):Promise.resolve();
 Promise.all([pw_demanaLlista(),q]).then(([l])=>{pw_pwa.llista=l;pw_estat();})
  .catch(()=>{if(!pw_pwa.llista){pw_pwa.error=navigator.onLine?'No s’ha pogut saber què cal descarregar. Torneu-ho a provar d’aquí a una estona.':'Cal connexió a internet per instal·lar Pim Pam.';}pw_estat();});
 return true;
}
export const PWA=pw_pwa;

// ---------- Activitats personalitzades (0.44): what is kept on the device ----------
// Marc, 4 November 2026: the family or the professionals of each child make their own activities with their photos, videos and music,
// on one of the mechanics of Pim Pam. They are kept only on this device (IndexedDB of this browser), never sent anywhere; they can be
// exported to a file and imported again, all at once or one by one. Adults only add pictures, videos and music: nothing is programmed.
// Two stores: 'acts' (the activities, small records) and 'media' (each photo, video or sound, with its thumbnail and its loudness gain).
// The export is a .zip without compression (the media are compressed already): pim-pam.json plus media/<id>.<ext>.

export const PD_DB='pimpam-personal',PD_VERSION=1;
export const PD_LIMITS=Object.freeze({image:40e6,video:1.5e9,audio:200e6,side:1920,thumb:480,decode:80e6});
// The loudness the recordings are brought to before the master (gated RMS, dBFS): with the master at the default volume it lands
// about where the music of the collection sits (−30 LUFS integrated).
export const PD_TARGET=-13;
let pdOpening=null;
function pdOpen(){if(pdOpening)return pdOpening;pdOpening=new Promise((res,rej)=>{let rq;try{rq=indexedDB.open(PD_DB,PD_VERSION);}catch(e){rej(e);return;}
 rq.onupgradeneeded=()=>{const db=rq.result;if(!db.objectStoreNames.contains('acts'))db.createObjectStore('acts',{keyPath:'id'});if(!db.objectStoreNames.contains('media'))db.createObjectStore('media',{keyPath:'id'});};
 rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);rq.onblocked=()=>rej(Error('La base de dades està oberta en una altra pestanya.'));});pdOpening.catch(()=>{pdOpening=null;});return pdOpening;}
function pdReq(rq){return new Promise((res,rej)=>{rq.onsuccess=()=>res(rq.result);rq.onerror=()=>rej(rq.error);});}
async function pdTx(store,mode,fn){const db=await pdOpen();return new Promise((res,rej)=>{const tx=db.transaction(store,mode),st=tx.objectStore(store);let out;Promise.resolve(fn(st)).then(v=>{out=v;}).catch(rej);tx.oncomplete=()=>res(out);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error||Error('No s’ha pogut desar: potser no hi ha prou espai.'));});}
export const pdActs=()=>pdTx('acts','readonly',st=>pdReq(st.getAll()));
export const pdPutAct=a=>pdTx('acts','readwrite',st=>pdReq(st.put(a)));
export const pdDelAct=id=>pdTx('acts','readwrite',st=>pdReq(st.delete(id)));
export const pdMedia=id=>pdTx('media','readonly',st=>pdReq(st.get(id)));
export const pdPutMedia=m=>pdTx('media','readwrite',st=>pdReq(st.put(m)));
export const pdMediaKeys=()=>pdTx('media','readonly',st=>pdReq(st.getAllKeys()));
export const pdDelMedia=id=>pdTx('media','readwrite',st=>pdReq(st.delete(id)));
// Every media an activity uses: its items (picture or video, and its own sound) and its music.
export function pdUses(a){const out=[];for(const it of a.items||[]){if(it.media)out.push(it.media);if(it.sound)out.push(it.sound);}if(a.music)out.push(a.music);return out;}
// The media no activity uses any more (an activity deleted, an item removed, an editor closed without saving) are deleted.
async function pdSweep(keep=[]){const used=new Set(keep);for(const a of await pdActs())for(const m of pdUses(a))used.add(m);let n=0;for(const k of await pdMediaKeys())if(!used.has(k)){await pdDelMedia(k);n++;}return n;}
export function pdId(prefix){const r=crypto.getRandomValues(new Uint32Array(2));return prefix+Date.now().toString(36)+r[0].toString(36)+r[1].toString(36).slice(0,4);}
async function pdEstimate(){try{const e=await navigator.storage?.estimate?.();return e?{used:e.usage||0,quota:e.quota||0}:null;}catch{return null;}}
async function pdPersist(){try{if(navigator.storage?.persisted&&await navigator.storage.persisted())return true;return !!await navigator.storage?.persist?.();}catch{return false;}}
export function pdSize(n){if(!(n>0))return '0 MB';if(n<1e6)return Math.max(1,Math.round(n/1e3))+' kB';if(n<1e9)return (n/1e6).toFixed(n<1e7?1:0).replace('.',',')+' MB';return (n/1e9).toFixed(1).replace('.',',')+' GB';}

// ---------- Preparing what is added ----------
function pdCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
const pdBlob=(cv,type='image/jpeg',q=.9)=>new Promise((res,rej)=>cv.toBlob(b=>b?res(b):rej(Error('No s’ha pogut preparar la imatge.')),type,q));
function pdFitDraw(src,sw,sh,max){const k=Math.min(1,max/Math.max(sw,sh)),cv=pdCanvas(sw*k,sh*k),c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.imageSmoothingQuality='high';c.drawImage(src,0,0,cv.width,cv.height);return cv;}
// The loudness of a decoded sound: the RMS of its 100 ms blocks louder than −50 dBFS (so silences do not count), and its peak.
export function pdLoudness(buffer){const n=buffer.length,ch=buffer.numberOfChannels,block=Math.max(1,Math.round(buffer.sampleRate*.1)),data=[];for(let k=0;k<ch;k++)data.push(buffer.getChannelData(k));let peak=0,sum=0,count=0;
 for(let i=0;i<n;i+=block){let s=0,m=Math.min(n,i+block);for(let j=i;j<m;j++){let v=0;for(let k=0;k<ch;k++)v+=data[k][j];v/=ch;s+=v*v;const a=Math.abs(v);if(a>peak)peak=a;}const ms=s/Math.max(1,m-i);if(ms>1e-5){sum+=ms;count++;}}
 const rms=count?10*Math.log10(sum/count):-99;return {rms,peak};}
export function pdGain(l){if(!l||!(l.rms>-90))return 1;let g=10**((PD_TARGET-l.rms)/20);if(l.peak>0)g=Math.min(g,1/l.peak);return Math.max(.1,Math.min(4,g));}
async function pdDecodeGain(file){if(file.size>PD_LIMITS.decode)return {gain:1,decoded:false,dur:null};try{const AC=window.OfflineAudioContext||window.webkitOfflineAudioContext,ac=new AC(1,1,44100),buf=await ac.decodeAudioData(await file.arrayBuffer());return {gain:pdGain(pdLoudness(buf)),decoded:true,dur:buf.duration};}catch{return {gain:1,decoded:false,dur:null};}}
function pdWait(el,ok,bad,ms=20000){return new Promise((res,rej)=>{const t=setTimeout(()=>{done();rej(Error('timeout'));},ms),on=()=>{done();res();},off=()=>{done();rej(Error('error'));},done=()=>{clearTimeout(t);el.removeEventListener(ok,on);el.removeEventListener(bad,off);};el.addEventListener(ok,on);el.addEventListener(bad,off);});}
const pdKind=f=>/^image\//.test(f.type)?'image':/^video\//.test(f.type)?'video':/^audio\//.test(f.type)?'audio':/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name)?'image':/\.(mp4|m4v|webm|mov|ogv)$/i.test(f.name)?'video':/\.(mp3|m4a|aac|wav|ogg|oga|opus|flac|weba)$/i.test(f.name)?'audio':null;
// A file the person adds becomes a media record: a photo is made at most 1920 px on its long side (JPEG), a video and a sound are kept
// as they are once this browser shows it can play them. Each one gets a small thumbnail (480 px) and, if it sounds, a loudness gain.
async function pdPrepare(file,want){const kind=pdKind(file);if(!kind||want&&!want.includes(kind))throw Error(`«${file.name}» no és ${want?.includes('audio')&&want.length===1?'un fitxer de so':'una foto ni un vídeo'} que es pugui fer servir.`);
 if(file.size>PD_LIMITS[kind])throw Error(`«${file.name}» és massa gran (${pdSize(file.size)}; com a màxim ${pdSize(PD_LIMITS[kind])}).`);const id=pdId('m');
 if(kind==='image'){let bmp;try{bmp=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw Error(`Aquest navegador no pot obrir la imatge «${file.name}». Proveu-la en JPG o PNG.`);}
  const big=pdFitDraw(bmp,bmp.width,bmp.height,PD_LIMITS.side),thumb=pdFitDraw(bmp,bmp.width,bmp.height,PD_LIMITS.thumb);bmp.close?.();
  const blob=await pdBlob(big,'image/jpeg',.9);return {id,kind,type:'image/jpeg',name:file.name,size:blob.size,w:big.width,h:big.height,dur:null,gain:1,sound:false,blob,thumb:await pdBlob(thumb,'image/jpeg',.82),added:Date.now()};}
 const url=URL.createObjectURL(file);try{
  if(kind==='video'){const v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=url;
   try{await pdWait(v,'loadeddata','error');}catch{throw Error(`Aquest navegador no pot reproduir el vídeo «${file.name}». Proveu-lo en MP4 (H.264) o WebM.`);}
   if(!(v.videoWidth>0))throw Error(`El vídeo «${file.name}» no té imatge.`);const dur=Number.isFinite(v.duration)?v.duration:null;
   try{v.currentTime=Math.min(1,(dur||2)/3);await pdWait(v,'seeked','error',8000);}catch{}
   const thumb=pdFitDraw(v,v.videoWidth,v.videoHeight,PD_LIMITS.thumb),g=await pdDecodeGain(file);
   return {id,kind,type:file.type||'video/mp4',name:file.name,size:file.size,w:v.videoWidth,h:v.videoHeight,dur,gain:g.gain,sound:g.decoded||file.size>PD_LIMITS.decode,blob:file,thumb:await pdBlob(thumb,'image/jpeg',.82),added:Date.now()};}
  const a=document.createElement('audio');a.preload='metadata';a.src=url;try{await pdWait(a,'loadedmetadata','error');}catch{throw Error(`Aquest navegador no pot reproduir el so «${file.name}». Proveu-lo en MP3.`);}
  const g=await pdDecodeGain(file);return {id,kind,type:file.type||'audio/mpeg',name:file.name,size:file.size,w:0,h:0,dur:Number.isFinite(a.duration)?a.duration:g.dur,gain:g.gain,sound:true,blob:file,thumb:null,added:Date.now()};
 }finally{URL.revokeObjectURL(url);}}

// ---------- Export and import: a .zip with no compression ----------
const PD_CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^c>>>1:c>>>1;t[n]=c>>>0;}return t;})();
async function pdCrc(blob,chunk=8<<20){let c=0xFFFFFFFF;for(let o=0;o<blob.size;o+=chunk){const b=new Uint8Array(await blob.slice(o,o+chunk).arrayBuffer());for(let i=0;i<b.length;i++)c=PD_CRC[(c^b[i])&255]^c>>>8;}return (c^0xFFFFFFFF)>>>0;}
const pdU16=(v,o,x)=>v.setUint16(o,x,true),pdU32=(v,o,x)=>v.setUint32(o,x>>>0,true);
function pdDos(d){return {time:(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date:((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()};}
// files: [{name, blob}] → one Blob (the parts are the media Blobs themselves: nothing big is copied in memory).
async function pdZip(files,onStep){const parts=[],central=[],enc=new TextEncoder(),{time,date}=pdDos(new Date());let offset=0,total=0;for(const f of files)total+=f.blob.size;
 if(total>3.9e9)throw Error('L’exportació passa de 3,9 GB: exporteu les activitats una per una.');
 for(let i=0;i<files.length;i++){const f=files[i],name=enc.encode(f.name),crc=await pdCrc(f.blob),size=f.blob.size,h=new DataView(new ArrayBuffer(30));
  pdU32(h,0,0x04034b50);pdU16(h,4,20);pdU16(h,6,0x0800);pdU16(h,8,0);pdU16(h,10,time);pdU16(h,12,date);pdU32(h,14,crc);pdU32(h,18,size);pdU32(h,22,size);pdU16(h,26,name.length);pdU16(h,28,0);
  parts.push(h.buffer,name,f.blob);const c=new DataView(new ArrayBuffer(46));pdU32(c,0,0x02014b50);pdU16(c,4,20);pdU16(c,6,20);pdU16(c,8,0x0800);pdU16(c,10,0);pdU16(c,12,time);pdU16(c,14,date);pdU32(c,16,crc);pdU32(c,20,size);pdU32(c,24,size);pdU16(c,28,name.length);pdU32(c,42,offset);
  central.push(c.buffer,name);offset+=30+name.length+size;onStep?.((i+1)/files.length);}
 let csize=0;for(const p of central)csize+=p.byteLength;const e=new DataView(new ArrayBuffer(22));pdU32(e,0,0x06054b50);pdU16(e,8,files.length);pdU16(e,10,files.length);pdU32(e,12,csize);pdU32(e,16,offset);
 return new Blob([...parts,...central,e.buffer],{type:'application/zip'});}
async function pdUnzip(blob){const tail=new DataView(await blob.slice(Math.max(0,blob.size-65558)).arrayBuffer());let e=-1;for(let i=tail.byteLength-22;i>=0;i--)if(tail.getUint32(i,true)===0x06054b50){e=i;break;}
 if(e<0)throw Error('El fitxer no és una exportació de Pim Pam.');const n=tail.getUint16(e+10,true),cs=tail.getUint32(e+12,true),co=tail.getUint32(e+16,true),cd=new DataView(await blob.slice(co,co+cs).arrayBuffer()),dec=new TextDecoder(),out=new Map();let p=0;
 for(let i=0;i<n;i++){if(cd.getUint32(p,true)!==0x02014b50)throw Error('El fitxer està malmès.');const method=cd.getUint16(p+10,true),size=cd.getUint32(p+20,true),nl=cd.getUint16(p+28,true),xl=cd.getUint16(p+30,true),cl=cd.getUint16(p+32,true),lo=cd.getUint32(p+42,true),name=dec.decode(new Uint8Array(cd.buffer,cd.byteOffset+p+46,nl));p+=46+nl+xl+cl;
  if(method!==0)throw Error('Aquest .zip està comprimit: només es poden importar els fitxers exportats des de Pim Pam.');const lh=new DataView(await blob.slice(lo,lo+30).arrayBuffer()),start=lo+30+lh.getUint16(26,true)+lh.getUint16(28,true);out.set(name,blob.slice(start,start+size));}
 return out;}
const PD_EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov','audio/mpeg':'mp3','audio/mp4':'m4a','audio/x-m4a':'m4a','audio/wav':'wav','audio/x-wav':'wav','audio/ogg':'ogg','audio/webm':'weba','audio/aac':'aac','audio/flac':'flac'};
export const pdFileName=(name,ext='zip')=>'pim-pam-'+(String(name||'activitats').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'activitats')+'.'+ext;
// The export: the activities (as they are kept) and every media they use, with the thumbnails.
async function pdExport(acts,onStep,head={}){const files=[],media=[];for(const a of acts)for(const id of pdUses(a)){if(media.some(m=>m.id===id))continue;const m=await pdMedia(id);if(!m)continue;const ext=PD_EXT[m.type]||(m.kind==='image'?'jpg':m.kind==='video'?'mp4':'mp3'),file=`media/${m.id}.${ext}`;
  const {blob,thumb,...meta}=m;media.push({...meta,file,thumbFile:thumb?`media/${m.id}-mini.jpg`:null});files.push({name:file,blob});if(thumb)files.push({name:`media/${m.id}-mini.jpg`,blob:thumb});}
 const manifest={app:'Pim Pam',kind:'personalitzades',version:1,exported:new Date().toISOString(),...head,activities:acts.map(({owner,...a})=>({...a,...(head.kind==='usuaris'?{owner}:{})})),media};
 files.unshift({name:'pim-pam.json',blob:new Blob([JSON.stringify(manifest,null,1)],{type:'application/json'})});return pdZip(files,onStep);}
export const PD_TEMPLATES=['album','pas','moment','video','tria','troba'];
// The import: every activity comes in as a new one with new ids (nothing on the device is overwritten); one already imported from the same
// origin with the same date is skipped.
// 0.46: the activities belong to the user who is playing (owner), and the export of users (usuaris.js) carries theirs in the same
// format with kind 'usuaris' and the owner of each one; ownerOf tells the owner on this device of every activity imported.
async function pdRead(file){const zip=await pdUnzip(file),mf=zip.get('pim-pam.json');if(!mf)throw Error('El fitxer no és una exportació de Pim Pam.');let data;try{data=JSON.parse(await mf.text());}catch{throw Error('El fitxer està malmès.');}
 if(data.app!=='Pim Pam'||!['personalitzades','usuaris'].includes(data.kind)||data.version!==1||!Array.isArray(data.activities)||!Array.isArray(data.media))throw Error('No és una exportació compatible de Pim Pam.');return {zip,data};}
async function pdImport(file,onStep,owner='guest'){const {zip,data}=await pdRead(file);if(data.kind==='usuaris')throw Error('Aquest fitxer és una exportació d’usuaris: importeu-lo des de «Usuaris», a dalt del menú.');return pdImportData(zip,data,()=>owner,onStep);}
async function pdImportData(zip,data,ownerOf,onStep){
 const have=await pdActs(),seen=new Set(have.map(a=>(a.owner||'guest')+'|'+(a.origin||a.id)+'|'+a.updated)),ids=new Map(),added=[];let skipped=0,k=0;
 const mediaOf=new Map(data.media.map(m=>[m.id,m]));
 for(const a of data.activities){if(!a||typeof a!=='object'||!PD_TEMPLATES.includes(a.tpl)||!Array.isArray(a.items)){skipped++;continue;}const origin=a.origin||a.id,owner=ownerOf(a);if(!owner){skipped++;continue;}if(seen.has(owner+'|'+origin+'|'+a.updated)){skipped++;continue;}
  const need=pdUses(a);for(const id of need){if(ids.has(id))continue;const m=mediaOf.get(id),blob=m&&zip.get(m.file);if(!m||!blob)throw Error('Falta un fitxer dins de l’exportació.');const thumb=m.thumbFile?zip.get(m.thumbFile):null,nid=pdId('m');
   await pdPutMedia({id:nid,kind:m.kind,type:m.type,name:String(m.name||''),size:blob.size,w:+m.w||0,h:+m.h||0,dur:Number.isFinite(+m.dur)?+m.dur:null,gain:Math.max(.1,Math.min(4,+m.gain||1)),sound:!!m.sound,blob:new Blob([blob],{type:m.type}),thumb:thumb?new Blob([thumb],{type:'image/jpeg'}):null,added:Date.now()});ids.set(id,nid);}
  const na={...pdClean(a),id:pdId('pp-'),origin,owner,imported:Date.now()};na.items=na.items.map(it=>({...it,id:pdId('i'),media:ids.get(it.media),sound:it.sound?ids.get(it.sound):null}));na.music=a.music?ids.get(a.music):null;await pdPutAct(na);added.push(na);seen.add(owner+'|'+origin+'|'+a.updated);onStep?.(++k/data.activities.length);}
 return {added,skipped};}
// Only the known fields of an activity are kept, with their types.
// 0.46: owner (the user of this device it belongs to; none = the guest) and the pauses of «Vídeo a poc a poc»: every video stops after
// pauseEvery seconds or at the moments marked on it (marks, in seconds), and the screen darkens as much as dark says.
export const PD_EVERY=Object.freeze([3,5,8,10,15,20,30,60]);
export function pdMarks(list){return [...new Set((Array.isArray(list)?list:[]).map(Number).filter(x=>Number.isFinite(x)&&x>.2&&x<36000).map(x=>Math.round(x*10)/10))].sort((a,b)=>a-b).slice(0,60);}
export function pdClean(a){const str=(x,n)=>String(x??'').slice(0,n);return {id:str(a.id,80),v:1,name:str(a.name,60)||'Activitat',child:str(a.child,40),tpl:PD_TEMPLATES.includes(a.tpl)?a.tpl:'album',items:(Array.isArray(a.items)?a.items:[]).slice(0,40).map(it=>({id:str(it.id,40),media:str(it.media,60),sound:it.sound?str(it.sound,60):null,...(Array.isArray(it.marks)&&it.marks.length?{marks:pdMarks(it.marks)}:{})})).filter(it=>it.media),
 pauseMode:a.pauseMode==='marks'?'marks':'every',pauseEvery:PD_EVERY.includes(+a.pauseEvery)?+a.pauseEvery:5,dark:['suau','mitja','fort'].includes(a.dark)?a.dark:'mitja',...(a.owner&&a.owner!=='guest'?{owner:str(a.owner,40)}:{}),
 music:a.music?str(a.music,60):null,musicMode:['own','pimpam','none'].includes(a.musicMode)?a.musicMode:'pimpam',fit:a.fit==='cover'?'cover':'contain',videoMax:[15,30,60,180].includes(+a.videoMax)?+a.videoMax:30,order:a.order==='shuffle'?'shuffle':'list',created:+a.created||Date.now(),updated:+a.updated||Date.now(),...(a.origin?{origin:str(a.origin,80)}:{})};}
export {pdSweep,pdEstimate,pdPersist,pdPrepare,pdCrc,pdZip,pdUnzip,pdExport,pdImport,pdRead,pdImportData};

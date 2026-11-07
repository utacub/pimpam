// ---------- Usuaris (0.46): optional users of this device ----------
// Marc, 6 November 2026: anyone can play as «Convidat» (the default, nothing to do) or make a user with only a name (no password). A user
// keeps its own settings, favourites, decor choices, personalised activities and a record of what it played, all on this device; users
// can be exported to a file and imported on another one. The guest keeps the keys Pim Pam always used (pimpam-profile…), so a device
// where nobody makes a user works exactly as before; a user's keys are pimpam-u-<id>-<name>.
// Nothing here is sent anywhere: localStorage of this browser only (the media of the personalised activities stay in IndexedDB).
export const US_GUEST='guest';
export const US_KEYS=Object.freeze(['profile','common-bg','backgrounds','favorites','visits','log']);
export const US_LOG_MAX=3000;
const US_REG='pimpam-users';
const usStore=()=>{try{return typeof localStorage!=='undefined'?localStorage:null;}catch{return null;}};
function usGet(key,fallback){try{const v=usStore()?.getItem(key);return v===null||v===undefined?fallback:JSON.parse(v)??fallback;}catch{return fallback;}}
function usSet(key,value){try{usStore()?.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
function usDel(key){try{usStore()?.removeItem(key);}catch{}}
// The colours of the users' badges (each user gets the next one); only to tell them apart in the list.
export const US_COLORS=Object.freeze(['#d6336c','#2355d6','#007e69','#c0531b','#713bd0','#0b6f8a','#a3367a','#2f7d32']);
const usStr=(x,n)=>String(x??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
export function usCleanUser(u){return {id:usStr(u?.id,40).replace(/[^a-z0-9]/gi,'')||usNewId(),name:usStr(u?.name,40)||'Usuari',created:+u?.created||Date.now(),color:US_COLORS.includes(u?.color)?u.color:US_COLORS[0]};}
export function usNewId(){let r='';try{r=[...crypto.getRandomValues(new Uint32Array(2))].map(x=>x.toString(36)).join('');}catch{r=Math.random().toString(36).slice(2,12);}return 'u'+Date.now().toString(36)+r.slice(0,8);}
// The register: the users of this device, who is playing and whether the last one comes back when Pim Pam opens.
function usReg(){const r=usGet(US_REG,null),list=Array.isArray(r?.list)?r.list.map(usCleanUser):[];const ids=new Set();const uniq=list.filter(u=>!ids.has(u.id)&&ids.add(u.id));
 return {v:1,list:uniq,last:typeof r?.last==='string'?r.last:US_GUEST,remember:!!r?.remember};}
let US_CUR=US_GUEST;
// When Pim Pam opens, it is the guest, unless the device was told to come back to the last user.
export function usBoot(){const r=usReg();US_CUR=r.remember&&r.list.some(u=>u.id===r.last)?r.last:US_GUEST;return US_CUR;}
export const usList=()=>usReg().list;
export const usCurrent=()=>US_CUR;
export const usIsGuest=()=>US_CUR===US_GUEST;
export const usUser=id=>usReg().list.find(u=>u.id===(id??US_CUR))||null;
export const usName=(id=US_CUR)=>id===US_GUEST?'Convidat':usUser(id)?.name||'Convidat';
export const usRemember=()=>usReg().remember;
export function usSetRemember(on){const r=usReg();r.remember=!!on;usSet(US_REG,r);}
// The localStorage key of one piece of a user's data.
export function usKey(name,id=US_CUR){return id===US_GUEST?'pimpam-'+name:`pimpam-u-${id}-${name}`;}
export const usRead=(name,fallback,id)=>usGet(usKey(name,id),fallback);
export const usWrite=(name,value,id)=>usSet(usKey(name,id),value);
export function usSwitch(id){const r=usReg();if(id!==US_GUEST&&!r.list.some(u=>u.id===id))return false;US_CUR=id;r.last=id;usSet(US_REG,r);return true;}
// A new user: a name (made unique on this device) and, if asked, a copy of the settings of whoever is playing now.
export function usUniqueName(name,except=null){const taken=new Set(usReg().list.filter(u=>u.id!==except).map(u=>u.name.toLowerCase()));taken.add('convidat');let n=usStr(name,40)||'Usuari',k=2;const base=n;while(taken.has(n.toLowerCase()))n=`${base.slice(0,36)} (${k++})`;return n;}
export function usCreate(name,copyFrom=null){const r=usReg(),u=usCleanUser({id:usNewId(),name:usUniqueName(name),created:Date.now(),color:US_COLORS[r.list.length%US_COLORS.length]});r.list.push(u);usSet(US_REG,r);
 if(copyFrom!==null)for(const k of ['profile','common-bg','backgrounds','favorites']){const v=usGet(usKey(k,copyFrom),null);if(v!==null)usSet(usKey(k,u.id),v);}
 const p=usGet(usKey('profile',u.id),null);if(p&&typeof p==='object')usSet(usKey('profile',u.id),{...p,name:u.name});return u;}
export function usRename(id,name){const r=usReg(),u=r.list.find(x=>x.id===id);if(!u)return null;u.name=usUniqueName(name,id);usSet(US_REG,r);const p=usGet(usKey('profile',id),null);if(p&&typeof p==='object')usSet(usKey('profile',id),{...p,name:u.name});return u;}
// Deleting a user removes its data from this device (its personalised activities are deleted by the caller).
export function usDelete(id){if(id===US_GUEST)return false;const r=usReg();r.list=r.list.filter(u=>u.id!==id);if(r.last===id)r.last=US_GUEST;usSet(US_REG,r);for(const k of US_KEYS)usDel(usKey(k,id));if(US_CUR===id)US_CUR=US_GUEST;return true;}

// ---------- The record of what a user played ----------
// One line per time an activity was opened: when, which one, how long it was played (the time on the screen, without the pauses and the
// settings) and how many presses were accepted; on the scanning activities also how many choices were made. Only users keep it; the guest
// keeps nothing. The last US_LOG_MAX lines are kept.
export function usCleanEntry(e){const n=x=>Math.max(0,Math.round(+x||0));return {t:+e?.t||0,id:usStr(e?.id,60),code:usStr(e?.code,8),name:usStr(e?.name,80),type:e?.type==='scan'?'scan':'ce',d:n(e?.d),n:n(e?.n),p:n(e?.p),...(e?.persona?{persona:true}:{})};}
export function usLog(id=US_CUR){if(id===US_GUEST)return [];const l=usGet(usKey('log',id),[]);return Array.isArray(l)?l.map(usCleanEntry).filter(e=>e.t>0&&e.id):[];}
export function usLogAdd(entry,id=US_CUR){if(id===US_GUEST)return false;const l=usLog(id);l.push(usCleanEntry(entry));while(l.length>US_LOG_MAX)l.shift();return usSet(usKey('log',id),l);}
export function usLogClear(id=US_CUR){usDel(usKey('log',id));}
// A summary for the record: totals, and every activity with how many times, how long and when it was played last.
export function usSummary(log){const by=new Map();let time=0,presses=0;const days=new Set();
 for(const e of log){time+=e.d;presses+=e.n;days.add(usDay(e.t));const k=e.id;let a=by.get(k);if(!a){a={id:e.id,code:e.code,name:e.name,type:e.type,times:0,d:0,n:0,p:0,last:0};by.set(k,a);}a.times++;a.d+=e.d;a.n+=e.n;a.p+=e.p;if(e.t>=a.last){a.last=e.t;a.name=e.name;}}
 return {sessions:log.length,time,presses,days:days.size,activities:[...by.values()].sort((a,b)=>b.d-a.d||b.times-a.times)};}
export function usDay(t){const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function usDuration(s){s=Math.round(s);if(s<60)return `${s} s`;const m=Math.floor(s/60),h=Math.floor(m/60);if(h)return `${h} h ${String(m%60).padStart(2,'0')} min`;return `${m} min${s%60?` ${s%60} s`:''}`;}
// The record as a CSV for a spreadsheet (semicolons, as Catalan spreadsheets expect, with the BOM so the accents open well).
export function usCsv(log,name){const q=v=>{const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;};const rows=[['Usuari','Data','Hora','Codi','Activitat','Tipus','Durada (s)','Pulsacions','Tries']];
 for(const e of log){const d=new Date(e.t);rows.push([name,usDay(e.t),`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,e.code,e.name,e.type==='scan'?'Encercament':'Causa-efecte',e.d,e.n,e.type==='scan'?e.p:'']);}
 return '﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n');}

// ---------- Export and import ----------
// A user travels as its register line and every piece of its data; the personalised activities go in the same .zip (persona-dades.js).
export function usSnapshot(id){const u=usUser(id);if(!u)return null;const data={};for(const k of US_KEYS){const v=usGet(usKey(k,id),null);if(v!==null)data[k]=v;}return {...u,data};}
// An imported user: the same id comes back to the same user (its data are replaced by the file's, the record keeps the lines of both);
// a new id makes a new user, with a name made unique on this device. Only known keys are written.
export function usRestore(snap){if(!snap||typeof snap!=='object')throw Error('El fitxer no té cap usuari vàlid.');const r=usReg(),clean=usCleanUser(snap),had=r.list.find(u=>u.id===clean.id),data=snap.data&&typeof snap.data==='object'?snap.data:{};
 if(had){had.name=usUniqueName(clean.name,had.id);}else{clean.name=usUniqueName(clean.name);r.list.push(clean);}usSet(US_REG,r);const u=had||clean;
 for(const k of US_KEYS){if(!(k in data))continue;if(k==='log'){const both=[...usLog(u.id),...(Array.isArray(data.log)?data.log.map(usCleanEntry):[])].filter(e=>e.t>0&&e.id),seen=new Set(),out=[];for(const e of both.sort((a,b)=>a.t-b.t)){const key=e.t+'|'+e.id;if(seen.has(key))continue;seen.add(key);out.push(e);}usSet(usKey('log',u.id),out.slice(-US_LOG_MAX));continue;}
  const v=data[k];if(k==='favorites'||k==='visits'||k==='backgrounds'||k==='common-bg'||k==='profile'){if(v&&typeof v==='object')usSet(usKey(k,u.id),k==='profile'?{...v,name:u.name}:v);}}
 return {user:u,replaced:!!had};}

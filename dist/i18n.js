// Languages of Pim Pam (0.71). The app is written in Catalan; the other languages are dictionaries (dist/i18n/<lang>.json, made by
// tools/i18n-build.mjs from i18n/*.tsv) that map each Catalan text to its translation. A watcher translates every text node and every
// aria-label / title / alt / placeholder as soon as the app writes it, so the rest of the code keeps writing Catalan. Texts made of
// pieces (a number, a name) are matched by the patterns of the dictionary («Pas {n} de {m}.»), and their {x} pieces are translated
// in turn. Nothing inside an element with translate="no" is touched (user names, the language list).
export const I18N_LANGS=Object.freeze([['ca','Català'],['es','Castellano'],['eu','Euskara'],['gl','Galego'],['en','English'],['fr','Français']]);
const KEY='pimpam-lang',ATTRS=['aria-label','title','alt','placeholder'];
let lang='ca',dict=null,pats=[],cache=new Map(),observer=null;
const orig=new WeakMap(),written=new WeakMap(),attrOrig=new WeakMap();
export const i18nLang=()=>lang;
const stored=()=>{try{const l=localStorage.getItem(KEY);return I18N_LANGS.some(x=>x[0]===l)?l:'ca';}catch{return 'ca';}};
// The single-file build puts the dictionaries here (build_standalone.py).
const I18N_EMBEDDED=null;
async function load(l){if(l==='ca')return {s:{},p:[]};if(I18N_EMBEDDED)return I18N_EMBEDDED[l];const r=await fetch(`./i18n/${l}.json`);if(!r.ok)throw Error('i18n '+l);return r.json();}
const reEsc=s=>s.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
function compile(p){return p.map(([ca,tr])=>{const names=[];const src=reEsc(ca).replace(/\{([a-z]\d?)\}/g,(m,k)=>{names.push(k);return k[0]==='n'?'(\\d+(?:[.,]\\d+)?)':'(.+?)';});return {re:new RegExp('^'+src+'$'),names,tr};});}
// t(): the translation of one Catalan text (the whole text, or one of the patterns); the Catalan text if there is none.
export function t(s){if(lang==='ca'||!dict||s==null)return s;const str=String(s);if(!str.trim())return str;
 const lead=str.match(/^\s*/)[0],tail=str.slice(lead.length).match(/\s*$/)[0],core=str.slice(lead.length,str.length-tail.length);
 const hit=dict[core];if(hit!==undefined)return lead+hit+tail;
 if(cache.has(core)){const c=cache.get(core);return c===null?str:lead+c+tail;}
 cache.set(core,null);let res=direct(core);if(res===null)res=pieces(core);if(res===null)res=affix(core);
 if(cache.size>4000)cache.clear();cache.set(core,res);return res===null?str:lead+res+tail;}
// The whole text, or one of the patterns; null if neither.
function direct(core){const hit=dict[core];if(hit!==undefined)return hit;
 for(const p of pats){const m=core.match(p.re);if(!m)continue;const v={};p.names.forEach((k,i)=>v[k]=k[0]==='n'?m[i+1]:piece(m[i+1]));return p.tr.replace(/\{([a-z]\d?)\}/g,(x,k)=>v[k]??x);}
 return null;}
// A piece of a pattern: as it is, or written in lower case inside a sentence («S’obre rosella»).
function piece(x){const r=t(x);if(r!==x||!/^\p{Ll}/u.test(x))return r;const up=x[0].toUpperCase()+x.slice(1),u=t(up);return u!==up?u[0].toLowerCase()+u.slice(1):x;}
// A text made of known pieces («Flor de paper · Pluja de colors», «Nom. Descripció de dues frases.», «A, B i C»): first a name and
// a known rest, then each piece on its own.
// «· Nom», «Nom ·», «Nom …», «Nom.»: the name, with its mark.
function affix(core){const m=core.match(/^(·\s+)?(.+?)(\s+·|\s*…|\.)?$/);if(!m||!(m[1]||m[3]))return null;const r=t(m[2]);return r!==m[2]?(m[1]||'')+r+(m[3]||''):null;}
const CONJ={es:'y',eu:'eta',gl:'e',en:'and',fr:'et'};
function pieces(core){for(const sep of [' · ','. ',': ','; ',' — ',', ',' i ']){if(!core.includes(sep))continue;
  const keep=sep==='. ',parts=keep?core.split(/(?<=\.) /):core.split(sep),glue=keep?' ':sep,out=sep===' i '?' '+(CONJ[lang]||'i')+' ':glue;
  // «Nom. Frase. Frase.»: the sentence pieces carry their full stop; a name is looked up without it.
  const dot=x=>{const y=direct(x);if(y!==null||!keep||!x.endsWith('.'))return y;const z=direct(x.slice(0,-1));return z===null?null:z+'.';};
  for(let k=1;k<parts.length;k++){const ta=dot(parts.slice(0,k).join(glue)),tb=dot(parts.slice(k).join(glue));if(ta!==null&&tb!==null)return ta+out+tb;}
  const tr=parts.map(x=>{const y=t(x);if(y!==x||!keep||!x.endsWith('.'))return y;const z=t(x.slice(0,-1));return z!==x.slice(0,-1)?z+'.':x;});
  if(tr.some((x,i)=>x!==parts[i]))return tr.join(out);}
 return null;}
const frozen=n=>{const e=n.nodeType===1?n:n.parentElement;return !e||!!e.closest('[translate="no"],script,style');};
function doText(n){if(frozen(n))return;const cur=n.nodeValue;if(written.get(n)===cur)return;orig.set(n,cur);const tr=t(cur);if(tr!==cur){written.set(n,tr);n.nodeValue=tr;}else written.delete(n);}
function doAttr(el,a){if(!el.hasAttribute(a)||frozen(el))return;let m=attrOrig.get(el);const cur=el.getAttribute(a);if(m?.w?.[a]===cur)return;if(!m){m={o:{},w:{}};attrOrig.set(el,m);}m.o[a]=cur;const tr=t(cur);m.w[a]=tr;if(tr!==cur)el.setAttribute(a,tr);}
function walk(root){if(root.nodeType===3){doText(root);return;}if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;if(root.nodeType===1){if(root.closest('[translate="no"]'))return;for(const a of ATTRS)doAttr(root,a);}
 const it=document.createTreeWalker(root,5,{acceptNode:n=>n.nodeType===1&&(n.getAttribute('translate')==='no'||/^(SCRIPT|STYLE|CANVAS|svg)$/i.test(n.tagName))?2:1});let n;while((n=it.nextNode())){if(n.nodeType===3)doText(n);else for(const a of ATTRS)doAttr(n,a);}}
// Back to the Catalan written by the app, so that another language can be put on it.
function restore(root){const it=document.createTreeWalker(root,5);let n;while((n=it.nextNode())){if(n.nodeType===3){if(orig.has(n)&&written.get(n)===n.nodeValue){n.nodeValue=orig.get(n);}written.delete(n);}else{const m=attrOrig.get(n);if(m){for(const a in m.o)if(m.w[a]===n.getAttribute(a))n.setAttribute(a,m.o[a]);attrOrig.delete(n);}}}}
function watch(){if(observer)return;observer=new MutationObserver(ms=>{if(lang==='ca')return;for(const m of ms){if(m.type==='characterData')doText(m.target);else if(m.type==='attributes')doAttr(m.target,m.attributeName);else for(const n of m.addedNodes)walk(n);}});
 observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});}
function apply(data,l){dict=data.s||{};pats=compile(data.p||[]);cache=new Map();lang=l;document.documentElement.lang=l;}
const baseTitle=document.title;
async function i18nInit(){const l=stored();if(l!=='ca'){try{apply(await load(l),l);}catch{apply({},'ca');lang='ca';}}document.documentElement.lang=lang;watch();if(lang!=='ca'){document.title=t(baseTitle);walk(document.body);}}
async function i18nSet(l){if(!I18N_LANGS.some(x=>x[0]===l)||l===lang)return;const data=await load(l);restore(document.body);document.title=baseTitle;apply(data,l);try{localStorage.setItem(KEY,l);}catch{}if(l!=='ca'){document.title=t(baseTitle);walk(document.body);}}
// The language menu of the header (globe, code, list with code badges, native names and a check on the one in use).
const GLOBE='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3"/></svg>';
const CHEV='<svg class="icon lang-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',CHECK='<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
export function langMenuHtml(){return `<div class="lang" translate="no"><button type="button" class="settings-button lang-button" data-lang-toggle aria-haspopup="true" aria-expanded="false" aria-label="${LANG_LABEL[lang]}">${GLOBE}<span>${lang.toUpperCase()}</span>${CHEV}</button><div class="lang-menu" role="menu" hidden>${I18N_LANGS.map(([c,n])=>`<button type="button" role="menuitemradio" aria-checked="${c===lang}" lang="${c}" class="lang-item${c===lang?' on':''}" data-lang="${c}"><span class="lang-code">${c.toUpperCase()}</span><span class="lang-name">${n}</span>${c===lang?CHECK:'<span class="icon"></span>'}</button>`).join('')}</div></div>`;}
const LANG_LABEL={ca:'Idioma: català',es:'Idioma: castellano',eu:'Hizkuntza: euskara',gl:'Idioma: galego',en:'Language: English',fr:'Langue : français'};
export function langMenuOpen(box,open){const b=box?.querySelector('[data-lang-toggle]'),m=box?.querySelector('.lang-menu');if(!b||!m)return;m.hidden=!open;b.setAttribute('aria-expanded',String(open));box.classList.toggle('open',open);if(open)(m.querySelector('.on')||m.querySelector('button'))?.focus();}
// The voice of the scanning: a voice of the language in use, if the device has one.
export const i18nVoice=voices=>voices.find(v=>new RegExp('^'+lang+'(?:-|_|$)','i').test(v.lang));
export {i18nInit,i18nSet};

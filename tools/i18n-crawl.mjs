// i18n crawl (0.77 audit): opens the app in one language, walks the home page, every folder, every dialog of the header, every
// activity with its ⓘ panel and its settings (every tab), and lists the visible texts and labels that stayed in Catalan.
// Usage: [LANG=en] [ONLY=id,id] node tools/i18n-crawl.mjs http://127.0.0.1:8765/ out.json
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [url='http://127.0.0.1:8765/',out='i18n-crawl.json']=process.argv.slice(2),LANG=process.env.LANG_UI||'en';
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});
await ctx.addInitScript(l=>{try{localStorage.setItem('pimpam-lang',l);}catch{}},LANG);
const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.goto(url);await page.waitForTimeout(2500);
const found=new Map();
async function harvest(where){const list=await page.evaluate(async()=>{const {t,i18nLang}=await import('./i18n.js');const res=[];
  if(!window.__vals){const d=await (await fetch('./i18n/'+i18nLang()+'.json')).json();window.__vals=new Set(Object.values(d.s).map(x=>x.replace(/\s+/g,' ').trim()));const esc=x=>x.replace(/[.*+?^$()|[\]\\]/g,'\\$&');window.__pats=d.p.map(([,tr])=>new RegExp('^'+esc(tr).replace(/\\\{[a-z]\d?\\\}|\{[a-z]\d?\}/g,'.+?')+'$'));}
  const done=s=>window.__vals.has(s)||s.split(/ · |\. |: |; | — |, /).every(x=>!/\p{L}{2,}/u.test(x)||window.__vals.has(x.trim())||window.__vals.has(x.trim()+'.')||window.__pats.some(r=>r.test(x.trim())))||window.__pats.some(r=>r.test(s));
  const keep=s=>{s=s.replace(/\s+/g,' ').trim();if(!s||!/\p{L}{2,}/u.test(s))return;if(t(s)!==s||done(s))return;res.push(s);};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const el=n.parentElement;if(!el||el.closest('[translate="no"],script,style,svg'))continue;if(el.checkVisibility&&!el.checkVisibility())continue;keep(n.nodeValue);}
  for(const el of document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')){if(el.closest('[translate="no"]'))continue;if(el.checkVisibility&&!el.checkVisibility()&&!el.closest('dialog[open]'))continue;for(const a of ['aria-label','title','alt','placeholder'])if(el.hasAttribute(a))keep(el.getAttribute(a));}
  return res;});
 for(const s of list){if(!found.has(s))found.set(s,new Set());found.get(s).add(where);}}
const click=async sel=>{const ok=await page.evaluate(s=>{const b=document.querySelector(s);if(!b)return false;b.click();return true;},sel);await page.waitForTimeout(500);return ok;};
const tabs=async where=>{const ids=await page.evaluate(()=>[...document.querySelectorAll('dialog[open] [data-tab]')].map(b=>b.dataset.tab));await harvest(where);for(const id of ids){await click(`dialog[open] [data-tab="${id}"]`);await harvest(where+' · '+id);}};
const closeDialogs=async()=>{await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await page.waitForTimeout(200);};
await harvest('inici');
for(const [sel,name] of [['[data-settings]','Configuració'],['[data-sobre]','Informació'],['[data-about]','Sobre aquesta versió'],['[data-users]','Usuaris'],['[data-lang-toggle]','idioma']]){if(await click('.wrap '+sel)||await click(sel)){await tabs(name);}await closeDialogs();await page.keyboard.press('Escape');await page.waitForTimeout(200);}
const pwa=await page.evaluate(()=>{const b=document.querySelector('.topbar .nav button:last-child');return b&&!b.matches('[data-settings]')?b.outerHTML.slice(0,120):null;});
const folders=await page.evaluate(()=>[...document.querySelectorAll('.card-open[data-folder]')].map(b=>b.dataset.folder));const where={};
for(const f of folders){await click(`.card-open[data-folder="${f}"]`);await harvest('carpeta '+f);for(const id of await page.evaluate(()=>[...document.querySelectorAll('.cards [data-start]')].map(b=>b.dataset.start)))where[id]??=f;
 const infos=await page.evaluate(()=>[...document.querySelectorAll('.cards [data-info]')].map(b=>b.dataset.info));for(const id of infos){await click(`.cards [data-info="${id}"]`);await harvest('fitxa '+id);await closeDialogs();}
 await click('.folder-back');}
const only=(process.env.ONLY||'').split(',').filter(Boolean);
for(const id of Object.keys(where)){if(only.length&&!only.includes(id))continue;
 try{await click(`.card-open[data-folder="${where[id]}"]`);await click(`.cards [data-start="${id}"]`);
  await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:60000}).catch(()=>{});await page.waitForTimeout(800);await harvest(id);
  if(await click('#stage [data-info], .game [data-info], [data-info]:not(.card-info)')){await harvest(id+' ⓘ');await closeDialogs();}
  if(await click('.game [data-settings], #stage ~ * [data-settings], header [data-settings], [data-settings]')){await tabs(id+' configuració');await closeDialogs();}
  await page.keyboard.press('Escape');await page.waitForTimeout(600);await click('.folder-back');
 }catch(e){errors.push(id+': '+e);}}
const rows=[...found].map(([s,w])=>({s,where:[...w].slice(0,6),n:w.size})).sort((a,b)=>b.n-a.n);
writeFileSync(out,JSON.stringify({lang:LANG,count:rows.length,errors,pwa,rows},null,1));console.log(LANG,rows.length,'untranslated texts; errors',errors.length);
await browser.close();

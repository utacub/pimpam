// Fractals a la natura (CE46, 0.74; 0.74.2 with the way back to black) in the app: the folder and the card, its «Informació» panel, the tab of its settings, a few forms
// grown with real presses, the notes the app plays (window.__pimpamSoundLog), the recordings started, the words for the screen reader in
// Catalan and in English, the errors of the page, and stills.
// Usage: node tools/fractals-app.mjs <built.html | http://…/> <outdir> [width] [height] [dpr] [presses]
// Headless Chromium draws with the processor (SwiftShader): the activity runs here much slower than on a graphics card.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [src,out,wArg='960',hArg='540',dArg='1',nArg='4']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg,N=+nArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[];
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GL Driver|GPU stall|swiftshader/i.test(m.text())))errors.push(m.text());});
await page.addInitScript(()=>{window.__pimpamSoundLog=[];window.__frRec=0;const st=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__frRec++;return st.apply(this,a);};});
await page.goto(/^https?:/.test(src)?src:'file://'+src);await page.waitForTimeout(1500);
const shot=async s=>page.screenshot({path:`${out}/${s}.jpg`,type:'jpeg',quality:88,timeout:300000});
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
const phase=()=>page.evaluate(()=>document.querySelector('#stage')?.dataset?.phase||'');
const status=()=>page.evaluate(()=>document.querySelector('#live')?.textContent||'');
const until=async(re,max=120000)=>{const t0=Date.now();while(Date.now()-t0<max){const p=await phase();if(re.test(p))return p;await page.waitForTimeout(150);}return 'timeout '+(await phase());};
await page.evaluate(()=>document.querySelector('[data-folder="espectacles"]')?.click());await page.waitForTimeout(900);
const cards=await page.evaluate(()=>[...document.querySelectorAll('[data-card]')].map(x=>x.dataset.card));console.log('folder',cards.join(' '));
await page.evaluate(()=>document.querySelector('[data-card="fractals"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(700);await shot('01_fitxa');
// the «Informació» panel of the card
await page.evaluate(()=>document.querySelector('[data-info="fractals"]')?.click());await page.waitForTimeout(900);
console.log('info cards',await page.evaluate(()=>document.querySelectorAll('dialog[open] .info-card').length));await shot('02_informacio');
await page.evaluate(()=>document.querySelector('dialog[open] [data-close-info]')?.click());await page.waitForTimeout(400);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());
await page.evaluate(()=>document.querySelector('[data-start="fractals"]')?.click());
{const t0=Date.now();while(Date.now()-t0<120000&&await page.evaluate(()=>!!document.querySelector('.load-cover')))await page.waitForTimeout(150);console.log('cover',Date.now()-t0,'ms');await page.waitForTimeout(600);}
await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(400);
const fields=await page.evaluate(()=>['frGrow','frFirst'].map(id=>{const e=document.getElementById(id);return e?id+':'+[...e.options].map(o=>o.textContent).join('/'):id+' MISSING';}));console.log(fields.join(' | '));
await shot('03_ajustos');if(process.env.FR_FIRST){await page.selectOption('#frFirst',process.env.FR_FIRST);await page.waitForTimeout(200);}
await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());await page.waitForTimeout(300);
if(/paused/.test(await phase())){await press();await page.waitForTimeout(800);}
console.log('start',await phase(),'|',await status());await shot('04_inici');
for(let k=1;k<=N;k++){await until(/rest/);await press();await page.waitForTimeout(1800);await shot(`05_pulsacio_${k}_1_creix`);console.log('press',k,await phase(),'|',await status());
 console.log('       ',await until(/full/),'|',await status());await shot(`05_pulsacio_${k}_2_sencera`);
 console.log('       ',await until(/back/),'|',await status());await page.waitForTimeout(1200);await shot(`05_pulsacio_${k}_3_es_desfa`);
 await until(/rest/);await page.waitForTimeout(400);await shot(`05_pulsacio_${k}_4_negre`);console.log('       ',await phase(),'|',await status());}
const log=await page.evaluate(()=>window.__pimpamSoundLog.filter(x=>x.op==='play').map(x=>x.event?.inst));const by={};for(const i of log)by[i]=(by[i]||0)+1;
console.log('notes',log.length,JSON.stringify(by));console.log('recordings started',await page.evaluate(()=>window.__frRec));
// the words in English (the language menu of the home page)
await page.evaluate(()=>document.querySelector('[data-home]')?.click());await page.waitForTimeout(800);
await page.evaluate(()=>document.querySelector('[data-lang-toggle]')?.click());await page.waitForTimeout(200);await page.evaluate(()=>document.querySelector('[data-lang="en"]')?.click());await page.waitForTimeout(1200);
await page.evaluate(()=>document.querySelector('[data-folder="espectacles"]')?.click());await page.waitForTimeout(900);
await page.evaluate(()=>document.querySelector('[data-card="fractals"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(500);await shot('06_fitxa_en');
console.log('card en:',await page.evaluate(()=>document.querySelector('[data-card="fractals"]')?.innerText.replace(/\s+/g,' ').slice(0,300)));
await page.evaluate(()=>document.querySelector('[data-start="fractals"]')?.click());
{const t0=Date.now();while(Date.now()-t0<120000&&await page.evaluate(()=>!!document.querySelector('.load-cover')))await page.waitForTimeout(150);await page.waitForTimeout(600);}
console.log('en start |',await status());await press();await page.waitForTimeout(1500);console.log('en press |',await status());
console.log('en',await until(/full/),'|',await status());console.log('en',await until(/back/),'|',await status());console.log('en',await until(/rest/),'|',await status());
console.log('en help |',await page.evaluate(()=>document.querySelector('#game-help')?.innerText.replace(/\s+/g,' ').slice(0,400)));
await page.evaluate(()=>document.querySelector('[data-home]')?.click());await page.waitForTimeout(500);
await page.evaluate(()=>document.querySelector('[data-lang-toggle]')?.click());await page.waitForTimeout(200);await page.evaluate(()=>document.querySelector('[data-lang="ca"]')?.click());await page.waitForTimeout(500);
console.log('errors',errors.length);for(const e of errors.slice(0,8))console.log(' ',e.slice(0,300));await browser.close();

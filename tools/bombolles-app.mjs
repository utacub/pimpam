// Bombolles sense pes (CE05, 0.63) in the app: the folder and the card, the activity through the whole arc of its first matter (with
// the setting of 4 presses: in, growth, the full moment, the way out to black) and the first press of the next one, the tab of its
// settings; the notes the app plays (window.__pimpamSoundLog), the recordings started, the errors of the page, and stills.
// Usage: node tools/bombolles-app.mjs <built.html | http://…/> <outdir> [width] [height] [dpr]
// Headless Chromium draws with the processor (SwiftShader): the activity runs here much slower than on a graphics card.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [src,out,wArg='960',hArg='540',dArg='1']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[];
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||(m.type()==='warning'&&!/GL Driver|GPU stall|swiftshader/i.test(m.text())))errors.push(m.text());});
await page.addInitScript(()=>{window.__pimpamSoundLog=[];window.__bbRec=0;const st=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__bbRec++;return st.apply(this,a);};});
await page.goto(/^https?:/.test(src)?src:'file://'+src);await page.waitForTimeout(1500);
const shot=async s=>page.screenshot({path:`${out}/${s}.jpg`,type:'jpeg',quality:86,timeout:300000});
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
const phase=()=>page.evaluate(()=>document.querySelector('#stage')?.dataset?.phase||'');
const status=()=>page.evaluate(()=>document.querySelector('#live')?.textContent||'');
const until=async(re,max=90000)=>{const t0=Date.now();while(Date.now()-t0<max){const p=await phase();if(re.test(p))return p;await page.waitForTimeout(150);}return 'timeout '+(await phase());};
await page.evaluate(()=>document.querySelector('[data-folder="espectacles"]')?.click());await page.waitForTimeout(900);
const cards=await page.evaluate(()=>[...document.querySelectorAll('[data-card]')].map(x=>x.dataset.card));console.log('folder',cards.join(' '));
await page.evaluate(()=>document.querySelector('[data-card="bubbles"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(500);await shot('01_fitxa');
await page.evaluate(()=>document.querySelector('[data-start="bubbles"]')?.click());
{const t0=Date.now();while(Date.now()-t0<90000&&await page.evaluate(()=>!!document.querySelector('.load-cover')))await page.waitForTimeout(150);console.log('cover',Date.now()-t0,'ms');await page.waitForTimeout(600);}
// the settings of the activity: 4 presses
await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(400);
const fields=await page.evaluate(()=>['bbPresses','bbFirst'].map(id=>{const e=document.getElementById(id);return e?id+':'+[...e.options].map(o=>o.textContent).join('/'):id+' MISSING';}));console.log(fields.join(' | '));
await shot('02_ajustos');await page.selectOption('#bbPresses','4');await page.waitForTimeout(200);await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());await page.waitForTimeout(300);
// closing the settings leaves the game paused: a press resumes it
if(/paused/.test(await phase())){await press();await page.waitForTimeout(800);}
console.log('start',await phase(),'|',await status());await shot('03_inici');
for(let k=1;k<=4;k++){await until(/rest/);await press();await page.waitForTimeout(k===3?5000:2500);await shot(`04_pulsacio_${k}`);console.log('press',k,await phase(),'|',await status());}
console.log('out:',await until(/black|rest/,120000),'|',await status());await shot('05_negre');
await until(/rest/);console.log('next',await status());await press();await page.waitForTimeout(2500);await shot('06_mel_1');console.log('press',await phase(),'|',await status());
const log=await page.evaluate(()=>window.__pimpamSoundLog.filter(x=>x.op==='play').map(x=>x.event?.inst));const by={};for(const i of log)by[i]=(by[i]||0)+1;
console.log('notes',log.length,JSON.stringify(by));console.log('recordings started',await page.evaluate(()=>window.__bbRec));
console.log('errors',errors.length);for(const e of errors.slice(0,8))console.log(' ',e.slice(0,300));await browser.close();

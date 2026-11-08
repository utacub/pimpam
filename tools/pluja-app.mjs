// La nova Pluja de colors (CE45, 0.55) in the built HTML: the folder and the card, the activity through a whole scene (presses until
// the floor is full, the dilution, the next scene), the settings tab; frame times of the real loop and the errors of the page.
// Usage: node tools/pluja-app.mjs <built.html> <outdir> [width] [height] [dpr] [presses]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='960',hArg='540',dArg='1',pArg='6']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg,PRESSES=+pArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const errors=[];
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
// PLJ_SCALE (e.g. 0.5): the scale the picture starts at, as if learnt on this device (below 0.7 the floor is made smaller too)
if(process.env.PLJ_SCALE)await page.addInitScript(k=>{try{localStorage.setItem('pimpam-escala-immersions',JSON.stringify({'pluja-colors':k}));}catch{}},+process.env.PLJ_SCALE);
await page.goto('file://'+html);await page.waitForTimeout(1500);
const shot=async s=>page.screenshot({path:`${out}/${s}.jpg`,type:'jpeg',quality:86,timeout:300000});
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
const frames=async ms=>page.evaluate(ms=>new Promise(res=>{const d=[];let last=performance.now();const t0=last;const f=t=>{d.push(t-last);last=t;if(t-t0<ms)requestAnimationFrame(f);else{d.sort((a,b)=>a-b);res({n:d.length,med:+d[d.length>>1].toFixed(1),p90:+d[Math.floor(d.length*.9)].toFixed(1),max:+d[d.length-1].toFixed(1)});}};requestAnimationFrame(f);}),ms);
const phase=()=>page.evaluate(()=>document.querySelector('#stage')?.dataset?.phase||'');
const status=()=>page.evaluate(()=>document.querySelector('#live')?.textContent||'');
const until=async(re,max=60000)=>{const t0=Date.now();while(Date.now()-t0<max){const p=await phase();if(re.test(p))return p;await page.waitForTimeout(120);}return 'timeout '+(await phase());};
await page.evaluate(()=>document.querySelector('[data-folder="espectacles"]')?.click());await page.waitForTimeout(900);
await page.evaluate(()=>document.querySelector('[data-card="pluja-colors"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(400);await shot('01_fitxa');
await page.evaluate(()=>document.querySelector('[data-start="pluja-colors"]')?.click());
{const t0=Date.now();while(Date.now()-t0<60000&&await page.evaluate(()=>!!document.querySelector('.load-cover')))await page.waitForTimeout(150);console.log('cover',Date.now()-t0,'ms');await page.waitForTimeout(600);}
if(PRESSES!==10){await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(400);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(300);
 await page.selectOption('#pjPresses',String(PRESSES));await page.waitForTimeout(200);await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());await page.waitForTimeout(300);}
console.log('start',await phase(),'|',await status());await shot('02_inici');
const T=[];
for(let k=0;k<PRESSES;k++){await until(/rest/);await press();await page.waitForTimeout(700);T.push(await frames(1200));if(k===0||k===2||k===PRESSES-1)await shot(`03_pulsacio_${k+1}`);console.log('press',k+1,await phase(),'|',await status());}
console.log(await until(/fill/));await page.waitForTimeout(2500);await shot('04_plena');console.log(await status());
console.log(await until(/dilute/));await page.waitForTimeout(2200);await shot('05_dilucio');
console.log(await until(/rest/,30000),'|',await status());await press();await page.waitForTimeout(1500);await shot('06_escena_seguent');
await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(400);await shot('07_ajustos');
await page.evaluate(()=>document.querySelector('[data-tab="display"],[data-tab="screen"]')?.click());await page.waitForTimeout(300);await shot('08_pantalla');
console.log(JSON.stringify({frames:T},null,0));console.log('errors',errors.length?'\n'+errors.slice(0,20).join('\n'):'none');await browser.close();

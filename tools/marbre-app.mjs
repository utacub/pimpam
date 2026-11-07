// La nova Pluja de colors (0.52) in the built HTML: the home with its folder, the card, the activity through a whole sheet (the rain,
// the comb, the print and the clothesline), the ⓘ panel and the settings tab; frame times of the real loop and the errors of the page.
// Usage: node tools/marbre-app.mjs <built.html> <outdir> [width] [height] [dpr]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',dArg='2']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errors=[];
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+html);await page.waitForTimeout(1500);
const shot=async s=>page.screenshot({path:`${out}/${s}.jpg`,type:'jpeg',quality:86});
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
// the real frame loop: frame times measured with requestAnimationFrame for ms milliseconds
const frames=async ms=>page.evaluate(ms=>new Promise(res=>{const d=[];let last=performance.now();const end=last+ms;const f=t=>{d.push(t-last);last=t;if(t<end)requestAnimationFrame(f);else{d.sort((a,b)=>a-b);res({n:d.length,mean:+(d.reduce((a,b)=>a+b,0)/d.length).toFixed(1),p95:+d[Math.floor(d.length*.95)].toFixed(1),max:+d.at(-1).toFixed(1)});}};requestAnimationFrame(f);}),ms);
await shot('01_home');
await page.evaluate(()=>document.querySelector('[data-folder="espectacles"]')?.click());await page.waitForTimeout(900);await shot('02_carpeta');
await page.evaluate(()=>document.querySelector('[data-card="color-rain"]')?.scrollIntoView({block:'center'}));await page.waitForTimeout(400);await shot('03_fitxa');
await page.evaluate(()=>document.querySelector('[data-info="color-rain"]')?.click());await page.waitForTimeout(900);await shot('04_info');
await page.keyboard.press('Escape');await page.waitForTimeout(300);await page.evaluate(()=>document.querySelector('dialog[open]')?.close());
await page.evaluate(()=>document.querySelector('[data-start="color-rain"]')?.click());await page.waitForTimeout(2500);await shot('05_inici');
// a press only when the bath waits (the status says which step comes), so that no press falls on a step under way
const status=()=>page.evaluate(()=>document.querySelector('#activity-status, [aria-live]')?.textContent||'');
const ready=async(max=30000)=>{const t0=Date.now();while(Date.now()-t0<max){const s=await status();if(/espera el full|pas \d+ de/.test(s))return s;await page.waitForTimeout(150);}return 'timeout '+(await status());};
// the loading cover first (while it is up, presses are ignored and no time passes)
{const t0=Date.now();while(Date.now()-t0<30000&&await page.evaluate(()=>{const e=document.querySelector('.load-ring,.load-spin');return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0&&getComputedStyle(e.closest('[class]')||e).opacity!=='0';}))await page.waitForTimeout(150);await page.waitForTimeout(800);}
console.log('start',await ready());
const T={};
await press();await page.waitForTimeout(900);T.rain=await frames(1600);await shot('06_pluja');console.log(await ready());
await press();await page.waitForTimeout(700);T.rings=await frames(1600);await shot('07_anells');console.log(await ready());
await press();await page.waitForTimeout(600);T.spray=await frames(1400);await shot('08_pluja_fina');console.log(await ready());
await press();await page.waitForTimeout(1200);T.gesture=await frames(1500);await shot('09_pinta');console.log(await ready());await page.waitForTimeout(1500);T.rest=await frames(1000);
await press();await page.waitForTimeout(2600);T.print=await frames(1500);await shot('10_estampa');console.log(await ready());await page.waitForTimeout(800);await shot('11_estenedor');
await press();await page.waitForTimeout(1400);await shot('12_full_seguent');console.log(await ready());
const st=await page.evaluate(()=>({stage:document.querySelector('#stage')?.dataset?.variant}));
await page.evaluate(()=>document.querySelector('.stage-tools [data-settings]')?.click());await page.waitForTimeout(500);await page.evaluate(()=>document.querySelector('[data-tab="activity"]')?.click());await page.waitForTimeout(400);await shot('13_ajustos');
console.log(JSON.stringify({frames:T,st},null,1));console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

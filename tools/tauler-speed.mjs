// Time between frames, in real time, of the scanning boards of 0.16 in the built HTML: the board while the focus goes round, and the
// result (the trip of On anem?, the piece of Detectius de sons). Usage: node tools/tauler-speed.mjs <built.html> [width] [height]
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,wArg='1280',hArg='720']=process.argv.slice(2),W=+wArg,H=+hArg;
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const gaps=()=>page.evaluate(()=>new Promise(r=>{const t=[];const f=n=>{t.push(n);if(t.length<181)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}));
const report=(name,g)=>{g.sort((a,b)=>a-b);const q=p=>g[Math.floor(p*(g.length-1))].toFixed(1);console.log(`${W}x${H} ${name}: median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);};
await page.goto('file://'+html);
for(const [id,label,wait] of [['destinations','La neu',0],['sounds','L’arpa',0]]){await page.locator(`[data-start="${id}"]`).first().click();await page.waitForTimeout(4000);report(id+' board',await gaps());
 for(let k=0;k<40;k++){const l=await page.evaluate(()=>document.querySelector('[data-choice].scanned')?.getAttribute('aria-label'));if(l===label)break;await page.waitForTimeout(250);}
 await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');await page.waitForTimeout(1500);report(id+' result',await gaps());
 await page.evaluate(()=>document.querySelector('[data-nav="home"]')?.click());await page.waitForTimeout(500);}
console.log('errors',errors.length?errors.join('\n'):'none');await browser.close();

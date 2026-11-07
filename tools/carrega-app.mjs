// The loading cover (0.40) in the built HTML: opens an activity from its card and keeps pictures while its cover is up and once it is
// shown, with the progress the cover says; lists the errors of the page. Real time (no mock clock: the cover counts real frames).
// Usage: node tools/carrega-app.mjs <built.html> <outdir> <activity id> [width] [height] [dpr]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,ACT,wArg='1000',hArg='625',dArg='2']=process.argv.slice(2);mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:+wArg,height:+hArg},deviceScaleFactor:+dArg});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+html);await page.waitForTimeout(2000);
const state=()=>page.evaluate(()=>{const c=document.querySelector('.load-cover');return c?{p:c.style.getPropertyValue('--load-p'),gone:c.classList.contains('gone'),ring:getComputedStyle(c.querySelector('.load-ring')).opacity}:'shown';});
const t0=Date.now();await page.evaluate(id=>document.querySelector(`[data-start="${id}"]`).click(),ACT);
for(const at of [150,700,1500,3000]){const wait=at-(Date.now()-t0);if(wait>0)await page.waitForTimeout(wait);const s=await state();console.log(ACT,'at',Date.now()-t0,'ms',JSON.stringify(s));
 await page.screenshot({path:`${out}/${ACT}_${String(at).padStart(4,'0')}.jpg`,type:'jpeg',quality:82,timeout:60000});if(s==='shown')break;}
await page.waitForFunction(()=>!document.querySelector('.load-cover'),null,{timeout:45000,polling:50});console.log(ACT,'shown after',Date.now()-t0,'ms');
await page.waitForTimeout(1500);await page.screenshot({path:`${out}/${ACT}_shown.jpg`,type:'jpeg',quality:82});
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

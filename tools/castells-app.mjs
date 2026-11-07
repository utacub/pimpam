// 0.45.7: Fem castells in the built HTML: opens it, presses through a whole castell (7 presses, one level each since 0.45.8), measures the frame interval during each
// press and keeps a picture after each one. Usage: node tools/castells-app.mjs <built.html> <outdir> [dpr] [width] [height]
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,dpr='1',w='1280',h='720']=process.argv.slice(2);
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:+w,height:+h},deviceScaleFactor:+dpr});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.goto('file://'+html);await page.waitForTimeout(1500);
await page.locator('.card-open[data-folder="historia"]').click();await page.waitForTimeout(400);
await page.locator('[data-start="castells"]').first().click();
await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:45000,polling:100});await page.waitForTimeout(1500);
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(80);await page.keyboard.up('Space');};
for(let k=1;k<=7;k++){await press();
 const st=await page.evaluate(()=>new Promise(r=>{const t=[];let last=performance.now();const end=last+4000;const f=n=>{t.push(n-last);last=n;if(n<end)requestAnimationFrame(f);else{t.sort((a,b)=>a-b);r({median:t[t.length>>1].toFixed(1),p90:t[Math.floor(t.length*.9)].toFixed(1),max:t[t.length-1].toFixed(1)});}};requestAnimationFrame(f);}));
 console.log('press',k,JSON.stringify(st));await page.waitForTimeout(k===7?3000:5200);await page.screenshot({path:`${out}/app_press${k}_dpr${dpr}.jpg`,type:'jpeg',quality:80});}
console.log('errors',errors.length?errors.join('\n'):'none');await browser.close();

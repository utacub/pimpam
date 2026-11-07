// Sabana de paper (CE36, 0.30) in the built HTML: opens the activity from its card, keeps pictures of the sky before the first
// press, of the travelling, of the stimulus and of the scene stopped and dark after it, presses again, and measures how many frames per
// second the page draws while a stimulus runs. Without a GPU (as here) the browser draws WebGL in software: the frame rate says nothing
// of a real device, but it shows that the activity works. Usage: node tools/sabana-app.mjs <built.html> <outdir> [width] [height] [presses]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',pArg='2']=process.argv.slice(2),W=+wArg,H=+hArg,PRESSES=+pArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.type()+': '+m.text());});
await page.goto('file://'+html);await page.waitForTimeout(2500);
await page.screenshot({path:`${out}/home.jpg`,type:'jpeg',quality:75,timeout:180000});
await page.locator('[data-start="savanna"]').first().click();await page.waitForTimeout(2500);
const shot=async name=>{await page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:80,timeout:180000});console.log(name,await page.evaluate(()=>document.querySelector('#progress')?.textContent));};
const fps=async ms=>page.evaluate(ms=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<ms)requestAnimationFrame(f);else r(n/(performance.now()-t0)*1000);};requestAnimationFrame(f);}),ms);
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');};
await shot('0_sky');
for(let k=1;k<=PRESSES;k++){await press();await page.waitForTimeout(900);await shot(`${k}_travel`);await page.waitForTimeout(4000);await shot(`${k}_stimulus`);
 console.log('fps',(await fps(3000)).toFixed(1));await page.waitForTimeout(Math.max(0,16500-8900));await shot(`${k}_waiting`);}
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

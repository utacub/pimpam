// El cambrer equilibrista (CE31) in the built HTML: the card of the home page, then a whole round of 3 presses and the first press of
// the next round (the last place fades away); keeps pictures of each moment and lists the page errors, the recordings started and the
// status line. With "speed", it measures the time between frames in real time during a final.
// Usage: node tools/cambrer-app.mjs <built.html> <outdir> [width] [height] [speed]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',speed='']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{window.__starts=[];const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:+(this.buffer?.duration||0).toFixed(2),at:+(this.context.currentTime).toFixed(2)});return start.apply(this,a);};
 try{localStorage.setItem('pimpam-profile',JSON.stringify({steps:3}));}catch{}});
const card='[data-start="waiter"]';
if(speed){
 await page.goto('file://'+html);await page.locator(card).first().click();await page.waitForTimeout(2500);
 for(let i=0;i<2;i++){await page.keyboard.press('Space');await page.waitForTimeout(8200);}
 await page.keyboard.press('Space');await page.waitForTimeout(3500);
 const gaps=await page.evaluate(()=>new Promise(r=>{const t=[];const f=n=>{t.push(n);if(t.length<300)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}));
 gaps.sort((a,b)=>a-b);const q=p=>gaps[Math.floor(p*(gaps.length-1))].toFixed(1);console.log(`${W}x${H} real time during the fall of a final: median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);
}else{
 await page.clock.install({time:new Date('2026-10-30T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-30T10:01:00Z'));
 const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
 const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step)await page.clock.runFor(step);};
 const live=async()=>(await page.locator('#live').textContent().catch(()=>''))||'';
 await run(1500);await page.locator(card).first().scrollIntoViewIfNeeded();await run(300);await page.locator(card).first().screenshot({path:`${out}/00_targeta.jpg`,type:'jpeg',quality:90});
 await page.locator(card).first().click();await run(1500);await shot('01_obrir');
 for(let k=1;k<=2;k++){await page.keyboard.press('Space');await run(600);await shot(`${k}0_vola`);await run(1600);await shot(`${k}1_es_gronxa`);await run(5800);await shot(`${k}2_espera`);}
 await page.keyboard.press('Space');for(const [ms,name] of [[2600,'30_orgull'],[1500,'31_contratemps'],[1200,'32_cau'],[2400,'33_gelatina'],[2000,'34_riu'],[1300,'35_reverencia'],[3000,'36_final']]){await run(ms);await shot(name);}
 await page.keyboard.press('Space');await run(500);await shot('40_ronda_nova');await run(1500);await shot('41_ronda_nova');
 console.log('status:',await live());
 console.log('recordings started (s):',JSON.stringify(await page.evaluate(()=>window.__starts.map(s=>s.d))));
}
console.log('page errors:',errors.length?errors:'none');await browser.close();

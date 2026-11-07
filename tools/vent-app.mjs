// El vent del bosc (CE26) in the built HTML: opens the activity, holds the switch, lets it go and keeps pictures of each moment; lists
// the errors of the page and the recordings started (the wind loop and the sound of the place). With "speed", it also measures the
// time between frames in real time while the wind blows.
// Usage: node tools/vent-app.mjs <built.html> <outdir> [width] [height] [speed]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',speed='']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
// Every recording started: its length, whether it loops, and the time it starts.
await page.addInitScript(()=>{window.__starts=[];const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:+(this.buffer?.duration||0).toFixed(2),loop:this.loop,at:+(this.context.currentTime).toFixed(2)});return start.apply(this,a);};});
if(speed){
 await page.goto('file://'+html);await page.locator('[data-start="wind"]').first().click();await page.waitForTimeout(6000);
 await page.keyboard.down('Space');await page.waitForTimeout(1500);
 const gaps=await page.evaluate(()=>new Promise(r=>{const t=[];const f=n=>{t.push(n);if(t.length<240)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}));
 await page.keyboard.up('Space');gaps.sort((a,b)=>a-b);const q=p=>gaps[Math.floor(p*(gaps.length-1))].toFixed(1);
 console.log(`${W}x${H} real time while blowing: median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);
}else{
 await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));
 await page.clock.runFor(1500);await page.locator('[data-start="wind"]').first().click();
 const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
 const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step)await page.clock.runFor(step);};
 await run(400);await shot('00_obrir');await run(4000);await shot('01_repos');
 await page.keyboard.down('Space');await run(1000);await shot('02_brisa');await run(3500);await shot('03_vent');await run(4500);await shot('04_ventada');await run(2000);await shot('05_ratxa');
 await page.keyboard.up('Space');await run(800);await shot('06_calma');await run(4000);await shot('07_espera');
 // A short press: it still blows for three seconds.
 await page.keyboard.down('Space');await run(150);await page.keyboard.up('Space');await run(2000);await shot('08_curta');await run(4000);
 // Enough wind for the place to change: the next press paints the next place.
 await page.keyboard.down('Space');await run(14000);await page.keyboard.up('Space');await run(5000);
 await page.keyboard.down('Space');await run(900);await shot('09_canvi');await run(1500);await shot('10_canvi');await run(3000);await shot('11_lloc_nou');await page.keyboard.up('Space');await run(5000);
 console.log('status:',await page.locator('#live').textContent());
 console.log('recordings started:',JSON.stringify(await page.evaluate(()=>window.__starts.filter(s=>s.d>5))));
}
console.log('page errors:',errors.length?errors:'none');await browser.close();

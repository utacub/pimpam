// Toc, toc! Qui hi ha? (CE30) in the built HTML: opens the activity, presses before anybody knocks (nothing must happen: no sound,
// no change), waits for the knock, presses, and keeps pictures of each moment of three visits (with 3 steps, the third is the party)
// and of the next round; lists the page errors, the recordings started and the status line. With "speed", it measures the time
// between frames in real time during a visit.
// Usage: node tools/toc-app.mjs <built.html> <outdir> [width] [height] [speed]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',speed='']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{window.__starts=[];const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:+(this.buffer?.duration||0).toFixed(2),at:+(this.context.currentTime).toFixed(2)});return start.apply(this,a);};
 try{localStorage.setItem('pimpam-profile',JSON.stringify({steps:3}));}catch{}});
if(speed){
 await page.goto('file://'+html);await page.locator('[data-start="door"]').first().click();
 await page.waitForFunction(()=>document.querySelector('#live')?.textContent?.includes('Truquen'),null,{timeout:20000});await page.keyboard.press('Space');await page.waitForTimeout(1500);
 const gaps=await page.evaluate(()=>new Promise(r=>{const t=[];const f=n=>{t.push(n);if(t.length<240)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}));
 gaps.sort((a,b)=>a-b);const q=p=>gaps[Math.floor(p*(gaps.length-1))].toFixed(1);console.log(`${W}x${H} real time during a visit: median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);
}else{
 await page.clock.install({time:new Date('2026-10-30T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-30T10:01:00Z'));
 await page.clock.runFor(1500);await page.locator('[data-start="door"]').first().click();
 const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
 const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step)await page.clock.runFor(step);};
 const live=async()=>(await page.locator('#live').textContent())||'';
 const waitKnock=async()=>{for(let i=0;i<300;i++){if((await live()).includes('Truquen'))return true;await run(100);}return false;};
 await run(600);await shot('00_obrir');
 // A press before the knock: nothing at all.
 const before=await page.evaluate(()=>window.__starts.length);await page.keyboard.press('Space');await run(800);const after=await page.evaluate(()=>window.__starts.length);
 console.log('a press before the knock started',after-before,'recordings; status:',await live());await shot('01_abans_del_truc');
 for(let k=1;k<=3;k++){console.log('knock',k,await waitKnock());await run(250);await shot(`${k}0_truquen`);await run(3000);await shot(`${k}1_truquen_de_nou`);
  await page.keyboard.press('Space');await run(400);await shot(`${k}2_obre`);await run(1600);await shot(`${k}3_gag`);await run(1600);await shot(`${k}4_gag`);await run(2600);await shot(`${k}5_al_carrer`);
  if(k===3){await run(3000);await shot('36_festa');await run(2600);await shot('37_reverencia');}await run(2500);}
 await run(1200);await shot('40_ronda_nova');
 console.log('status:',await live());
 console.log('recordings started (s):',JSON.stringify(await page.evaluate(()=>window.__starts.map(s=>s.d))));
}
console.log('page errors:',errors.length?errors:'none');await browser.close();

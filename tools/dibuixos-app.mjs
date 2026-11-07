// Dibuixos que ballen (CE32, 0.25) and Caleidoscopi «Contrast alt» in the built HTML: the cards of the home page, then three presses of
// Dibuixos que ballen (with the profile given, as JSON) and one of Caleidoscopi; keeps pictures of each moment and lists the page errors,
// the recordings started and the status line. With "speed", it measures the time between frames in real time while a drawing dances.
// Usage: node tools/dibuixos-app.mjs <built.html> <outdir> [width] [height] [profile JSON] [speed]
// ACT=toys or ACT=kitchen tries Joguines que ballen or La cuina que balla (0.26) instead of Dibuixos que ballen.
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',profile='{}',speed='']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(p=>{window.__starts=[];const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:+(this.buffer?.duration||0).toFixed(2),at:+(this.context.currentTime).toFixed(2)});return start.apply(this,a);};
 try{localStorage.setItem('pimpam-profile',JSON.stringify({duration:10,...JSON.parse(p)}));}catch{}},profile);
const card=id=>`[data-start="${id}"]`,act=process.env.ACT||'drawings';
if(speed){
 await page.goto('file://'+html);await page.locator(card(act)).first().click();await page.waitForTimeout(2500);
 for(let k=0;k<2;k++){await page.keyboard.press('Space');await page.waitForTimeout(2600);
  const gaps=await page.evaluate(()=>new Promise(r=>{const t=[];const f=n=>{t.push(n);if(t.length<240)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}));
  gaps.sort((a,b)=>a-b);const q=p=>gaps[Math.floor(p*(gaps.length-1))].toFixed(1);console.log(`${W}x${H} real time while drawing ${k+1} dances: median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);await page.waitForTimeout(6000);}
}else{
 await page.clock.install({time:new Date('2026-10-30T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-30T10:01:00Z'));
 const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
 const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step)await page.clock.runFor(step);};
 const live=async()=>(await page.locator('#live').textContent().catch(()=>''))||'';
 await run(1500);for(const id of [act,'kaleido']){await page.locator(card(id)).first().scrollIntoViewIfNeeded();await run(300);await page.locator(card(id)).first().screenshot({path:`${out}/00_targeta_${id}.jpg`,type:'jpeg',quality:90});}
 await page.locator(card(act)).first().click();await run(1500);await shot('01_obrir');
 for(let k=1;k<=3;k++){const before=await page.evaluate(()=>window.__starts.length);await page.keyboard.press('Space');await run(100);const starts=await page.evaluate(()=>window.__starts.length);
  await run(600);await shot(`${k}0_es_dibuixa`);await run(2300);await shot(`${k}1_balla`);await run(1000);await shot(`${k}2_balla`);await run(7200);await shot(`${k}3_aturat`);console.log(`press ${k}: ${starts-before} recordings at the press; status «${await live()}»`);}
 await page.keyboard.press('Escape');await run(800);await page.locator(card('kaleido')).first().click();await run(1500);await page.keyboard.press('Space');for(const [ms,name] of [[400,'50_cal_inici'],[2600,'51_cal'],[3000,'52_cal'],[4000,'53_cal_final']]){await run(ms);await shot(name);}
}
console.log('page errors:',errors.length?errors:'none');await browser.close();

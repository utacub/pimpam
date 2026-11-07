// The scanning boards of 0.16 in the built HTML: opens On anem? (EN04) and Detectius de sons (EN11), lets the focus go round, chooses,
// and keeps pictures of each moment; lists the errors of the page, the overlay buttons over the zones and the recordings started.
// Usage: node tools/tauler-app.mjs <built.html> <outdir> [width] [height]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{window.__starts=[];const start=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(...a){window.__starts.push({d:+(this.buffer?.duration||0).toFixed(2),loop:this.loop,at:+(this.context.currentTime).toFixed(2)});return start.apply(this,a);};});
await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));await page.clock.runFor(1500);
const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step){await page.clock.runFor(step);if(t%1000===0)await page.waitForTimeout(20);}};
const info=async()=>page.evaluate(()=>({zones:[...document.querySelectorAll('.board-zone')].map(b=>b.getAttribute('aria-label')+':'+Math.round(b.offsetWidth)+'x'+Math.round(b.offsetHeight)),commands:[...document.querySelectorAll('.board-strip .scan-action')].map(b=>b.textContent.replace('▶','')),scanned:document.querySelector('[data-choice].scanned')?.getAttribute('aria-label')||document.querySelector('[data-choice].scanned')?.textContent.replace('▶',''),labels:document.querySelector('.board-labels')?.textContent,state:document.querySelector('#stage')?.dataset.scanState}));
const press=async()=>{await page.keyboard.down('Space');await page.clock.runFor(60);await page.keyboard.up('Space');};
// EN04
await page.locator('[data-start="destinations"]').first().click();await page.waitForTimeout(1500);
await run(500);await shot('en04_00_obrir');console.log('EN04 start',JSON.stringify(await info()));
await run(3000);await shot('en04_01_focus2');console.log('EN04 +3s',JSON.stringify(await info()));
await run(2500);await shot('en04_02_focus3');console.log('EN04 +5.5s',JSON.stringify(await info()));
await press();await run(500);await shot('en04_03_obertura');await run(3500);await shot('en04_04_viatge');await run(4000);await shot('en04_05_arribada');await run(1500);await shot('en04_06_fet');console.log('EN04 done',JSON.stringify(await info()));
// another round: the scan of the commands until «Una altra ronda»
for(let k=0;k<12;k++){const i=await info();if(i.scanned==='Una altra ronda')break;await run(600);}await press();await run(800);await shot('en04_07_ronda2');console.log('EN04 round 2',JSON.stringify(await info()));
// EN11
await page.evaluate(()=>document.querySelector('[data-nav="home"]')?.click());await page.waitForTimeout(300);await run(300);
await page.locator('[data-start="sounds"]').first().click();await page.waitForTimeout(2500);
await run(300);await shot('en11_00_pista');console.log('EN11 start',JSON.stringify(await info()));
await run(2500);await shot('en11_01_focus');console.log('EN11 +2.8s',JSON.stringify(await info()));
const target=await page.evaluate(()=>document.querySelector('.board-zone')&&null);
// choose the first zone in focus (right or wrong), then look at the result
await press();await run(400);await shot('en11_02_tria');await run(1500);await shot('en11_03_resposta');console.log('EN11 after choice',JSON.stringify(await info()));
await run(4000);await shot('en11_04');await run(3500);await shot('en11_05');console.log('EN11 later',JSON.stringify(await info()));
const starts=await page.evaluate(()=>window.__starts);console.log('recordings started',starts.length,'loops',starts.filter(x=>x.loop).length);
console.log('ERRORS',errors.length?errors.join('\n'):'none');await browser.close();

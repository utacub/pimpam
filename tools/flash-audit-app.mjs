// Flash audit of the whole app (0.77 audit, Marc 11 November 2026). Opens every activity of the published dist/ (served over http)
// in Chromium with a fake clock (Playwright clock: Date, performance, timers and requestAnimationFrame), so every frame is captured
// at exact virtual time whatever the speed of the machine. Presses the switch every few seconds (holds it in the hold activities)
// and sends each frame as JPEG to tools/flash-analyze.py, which applies the WCAG 2.3.1 general and red flash thresholds.
// Videos (<video>) do not follow the fake clock: the MP4 files are analysed apart with ffmpeg (FLASH_VIDEOS=1).
// Usage: [ONLY=id,id] [SECS=24] [FPS=30] node tools/flash-audit-app.mjs http://127.0.0.1:8765/ out.json
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {writeFileSync,readdirSync,statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const here=path.dirname(fileURLToPath(import.meta.url)),ANALYZE=path.join(here,'flash-analyze.py');
const [url='http://127.0.0.1:8765/',out='flash-audit.json']=process.argv.slice(2);
// The analysis grid is always 1024×576 (the 10° field is 341×256 px of it); the page may be captured smaller (CAPW) to save time on
// machines without a GPU, and each frame is then scaled up before the analysis.
const W=1024,H=576,CW=+(process.env.CAPW||1024),CH=Math.round(CW*9/16),FPS=+(process.env.FPS||30),SECS=+(process.env.SECS||24),DT=1000/FPS;
const HOLD=new Set(['wind','viatge']);
function analyser(){const p=spawn('python3',['-I',ANALYZE,String(FPS),String(W),String(H)],{stdio:['pipe','pipe','inherit']});let buf='';p.stdout.on('data',d=>buf+=d);
 return {send(jpg){const h=Buffer.alloc(4);h.writeUInt32BE(jpg.length);p.stdin.write(h);p.stdin.write(jpg);},done(){return new Promise(r=>{p.on('close',()=>r(JSON.parse(buf)));p.stdin.end();});}};}
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const results=[];
async function fresh(){const ctx=await browser.newContext({viewport:{width:CW,height:CH},deviceScaleFactor:1,serviceWorkers:'block'});const page=await ctx.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.clock.install({time:new Date('2026-11-11T10:00:00')});await page.clock.pauseAt(new Date('2026-11-11T10:00:01'));
 // pauseAt: without it the fake time also flows with the real time, so every slow screenshot added seconds to the activity
 // the audio clock follows the fake clock too: activities that time their pictures by AudioContext.currentTime would otherwise run
 // several times too fast while the frames are captured slowly (the sound itself is not analysed)
 // the time a requestAnimationFrame callback receives must be the fake time too: the app takes dt from it (clamped at 100 ms),
 // and with the real timestamp every frame counted as 100 ms, so the activities ran six times too fast
 await page.addInitScript(()=>{const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(()=>cb(performance.now()));});
 await page.addInitScript(()=>{const d=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'currentTime');Object.defineProperty(AudioContext.prototype,'currentTime',{configurable:true,get(){if(this.__t0===undefined)this.__t0=performance.now()-d.get.call(this)*1000;return (performance.now()-this.__t0)/1000;}});});await page.goto(url);for(let i=0;i<30;i++){await page.clock.runFor(100);await page.waitForTimeout(20);}
 const cdp=await ctx.newCDPSession(page);return {ctx,page,cdp,errors};}
// list the activities by folder (as tools/smoke-all.mjs)
let s=await fresh();
const where={};for(const f of await s.page.evaluate(()=>[...document.querySelectorAll('.card-open[data-folder]')].map(b=>b.dataset.folder))){await s.page.locator(`.card-open[data-folder="${f}"]`).click();await s.page.clock.runFor(400);for(const id of await s.page.evaluate(()=>[...document.querySelectorAll('.cards [data-start]')].map(b=>b.dataset.start)))where[id]??=f;await s.page.locator('.folder-back').click();await s.page.clock.runFor(300);}
await s.ctx.close();
const only=(process.env.ONLY||'').split(',').filter(Boolean),ids=Object.keys(where).filter(id=>!only.length||only.includes(id));
console.log(ids.length,'activities');
// the home page with its crossfading pictures, then every activity
for(const id of ['__home__',...ids]){const t0=Date.now();var loadS=0;s=await fresh();const {page,cdp,errors}=s;let video=false;
 try{
  if(id!=='__home__'){await page.locator(`.card-open[data-folder="${where[id]}"]`).click();await page.clock.runFor(300);await page.locator(`.cards [data-start="${id}"]`).first().click();
   let lifted=false;for(let i=0;i<900&&!lifted;i++){await page.clock.runFor(100);await page.waitForTimeout(i<50?40:120);lifted=await page.evaluate(()=>!document.querySelector('.load-cover:not(.gone)'));}
   var loadS=(Date.now()-t0)/1000;if(!lifted)errors.push('the loading cover did not lift');await page.clock.runFor(600);}
  const an=analyser(),frames=Math.round(SECS*FPS);let held=false;const phases=[];
  for(let f=0;f<frames;f++){const t=f/FPS;
   if(id!=='__home__'){
    if(HOLD.has(id)){const want=(t%10)>=1&&(t%10)<7;if(want!==held){held=want;await page.keyboard[want?'down':'up']('Space');}}
    else if(f%(4*FPS)===FPS){await page.keyboard.down('Space');if(!process.env.QUICKPRESS)await page.clock.runFor(80);await page.keyboard.up('Space');}}
   await page.clock.runFor(DT);
   const {data}=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:88,clip:{x:0,y:0,width:CW,height:CH,scale:1}});const buf=Buffer.from(data,'base64');if(process.env.PHASES)phases.push(t.toFixed(2)+':'+await page.evaluate(()=>document.querySelector('#stage')?.dataset.phase));an.send(buf);if(process.env.DUMP&&t>=+(process.env.DUMP_FROM||0)&&t<=+(process.env.DUMP_TO||1e9))writeFileSync(`${process.env.DUMP}/${id}-${String(f).padStart(4,'0')}.jpg`,buf);}
  video=await page.evaluate(()=>!!document.querySelector('#stage video'));
  const r=await an.done();if(phases.length)console.log(id,'phases',phases.join(' '));results.push({id,folder:where[id]||'',...r,video,errors:[...new Set(errors)].slice(0,8),secs:(Date.now()-t0)/1000});
  console.log(id,r.passed?'OK':'REVISAR','field/s',r.fieldGeneral?.flashesPerSecond,'red/s',r.fieldRed?.flashesPerSecond,'cells gen',(r.general.worstArea*100).toFixed(1)+'%','cell',r.general.worstCell,'red',(r.red.worstArea*100).toFixed(1)+'%','meanStep',r.maxMeanStep.toFixed(3),video?'VIDEO':'',errors.length?'ERRORS '+errors.length:'',((Date.now()-t0)/1000).toFixed(0)+'s','load',loadS.toFixed(0)+'s');
 }catch(e){results.push({id,folder:where[id]||'',failed:String(e),errors});console.log(id,'FAILED',String(e).slice(0,200));}
 writeFileSync(out,JSON.stringify(results,null,1));await s.ctx.close();}
await browser.close();

// El vestidor fantàstic (EN06, 0.73) in the app, served from dist/ over http: opens the activity from its folder, lets the focus go
// round, picks a piece at each step (Space) and keeps pictures of the board, the steps and the show (JPEG); lists the sounds the app
// scheduled (window.__pimpamSoundLog) and the errors of the page. Usage: node tools/vestidor-app.mjs <outdir> [width] [height] [dpr]
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {serve} from './vestidor-frames.mjs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [out,wArg='1000',hArg='625',dArg='1']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const srv=await serve(),port=srv.address().port;
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(()=>{window.__pimpamSoundLog=[];});
await page.goto(`http://127.0.0.1:${port}/index.html`);await page.waitForTimeout(1500);
const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:86});
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(80);await page.keyboard.up('Space');};
const zones=async()=>page.evaluate(()=>[...document.querySelectorAll('.board-zone')].map(b=>b.getAttribute('aria-label')));
if(!await page.locator('[data-start="vestidor"]').count()){await page.locator('[data-folder="triar"]').first().click();await page.waitForTimeout(500);}
await shot('00_carpeta');await page.locator('[data-start="vestidor"]').first().click();await page.waitForTimeout(6000);await shot('01_tauler');console.log('board',JSON.stringify(await zones()));
const t0=Date.now();for(let k=0;k<4;k++){await page.waitForTimeout(2600);await press();await page.waitForTimeout(1400);await shot(`0${2+k}_tria${k+1}`);
 if(k<3){await page.waitForTimeout(5600);console.log('step',k+1,JSON.stringify(await zones()));}}
for(const t of [4,8,12,16,20,24])await page.waitForTimeout(t===4?2600:4000),await shot(`1${t<10?'0'+t:t}_show`);
await page.waitForTimeout(6000);await shot('20_next');console.log('next board',JSON.stringify(await zones()));
const log=await page.evaluate(()=>window.__pimpamSoundLog||[]),plays=log.filter(e=>e.op==='play'),insts={};for(const e of plays){const k=e.event?.inst+(e.event?.variant?':'+e.event.variant:'');insts[k]=(insts[k]||0)+1;}
console.log('sound events',log.length,'plays',plays.length,JSON.stringify(Object.entries(insts).sort((a,b)=>b[1]-a[1]).slice(0,40)));
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();srv.close();

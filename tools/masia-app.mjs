// Estiu a la masia (EN26) in the built HTML, at a given screen density: opens the activity from its card, lets the focus go round, picks
// a character and keeps pictures of the board and the episode (JPEG, device pixels); lists the errors of the page. Written for the
// 0.39.1 fix (the panorama was painted at half size on dense screens). Usage: node tools/masia-app.mjs <built.html> <outdir> [width] [height] [dpr] [activity id]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1000',hArg='625',dArg='2',ACT='masia']=process.argv.slice(2),W=+wArg,H=+hArg,DPR=+dArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:DPR});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.clock.install({time:new Date('2026-11-03T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-11-03T10:01:00Z'));await page.clock.runFor(1500);
const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step){await page.clock.runFor(step);if(t%1000===0)await page.waitForTimeout(20);}};
const press=async()=>{await page.keyboard.down('Space');await page.clock.runFor(60);await page.keyboard.up('Space');};
const info=async()=>page.evaluate(()=>{const cv=document.querySelector('#stage canvas');return {canvas:cv?cv.width+'x'+cv.height+' css '+cv.clientWidth+'x'+cv.clientHeight:null,zones:[...document.querySelectorAll('.board-zone')].map(b=>b.getAttribute('aria-label')+':'+Math.round(b.offsetLeft)+','+Math.round(b.offsetTop)+' '+Math.round(b.offsetWidth)+'x'+Math.round(b.offsetHeight))};});
await shot('00_menu');
// since 0.42 the cards live in folders: open the folder that holds the activity
if(!await page.locator(`[data-start="${ACT}"]`).count()){const ids=await page.evaluate(()=>[...document.querySelectorAll('[data-folder-card]')].map(e=>e.dataset.folderCard));
 for(const id of ids){await page.locator(`[data-folder="${id}"]`).first().click();await page.clock.runFor(300);if(await page.locator(`[data-start="${ACT}"]`).count())break;await page.locator('[data-folder=""]').first().click();await page.clock.runFor(300);}}
await page.locator(`[data-start="${ACT}"]`).first().click();await page.waitForTimeout(1500);await run(800);await shot('01_tauler');console.log('board',JSON.stringify(await info()));
await run(3000);await shot('02_focus2');
await press();await run(300);await shot('03_tria');await run(5000);await shot('04_episodi_5s');await run(6000);await shot('05_episodi_11s');await run(6000);await shot('06_tornada');console.log('after pick',JSON.stringify(await info()));
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

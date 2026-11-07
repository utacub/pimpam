// Detectius de sons (EN11) in the built HTML: opens it, lets the clue sound and the focus go round, chooses, and keeps pictures.
// Usage: node tools/detectius-app.mjs <built.html> <outdir> [width] [height] [dpr] [profileJSON]
// Two switches (Space moves, Enter chooses): a wrong pick first, then the right one (round 0 hides the target in the second cell).
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',dArg='1',sArg='{}']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:+dArg});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.clock.install({time:new Date('2026-10-27T10:00:00Z')});await page.goto('file://'+html);await page.clock.pauseAt(new Date('2026-10-27T10:01:00Z'));await page.clock.runFor(1500);
const shot=async name=>page.screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});
const run=async(ms,step=50)=>{for(let t=0;t<ms;t+=step){await page.clock.runFor(step);if(t%1000===0)await page.waitForTimeout(20);}};
const press=async()=>{await page.keyboard.down('Space');await page.clock.runFor(60);await page.keyboard.up('Space');};
const extra={mode:2,...JSON.parse(sArg)};
const bg=extra.bg;delete extra.bg;
await page.evaluate(([x,bg])=>{const p=JSON.parse(localStorage.getItem('pimpam-profile')||'{}');localStorage.setItem('pimpam-profile',JSON.stringify({...p,...x}));if(bg)localStorage.setItem('pimpam-backgrounds',JSON.stringify({sounds:bg}));},[extra,bg]);await page.reload();await page.clock.runFor(1500);
const folders=await page.evaluate(()=>[...document.querySelectorAll('[data-folder]')].map(b=>b.dataset.folder).filter(Boolean));
for(const f of folders){await page.evaluate(f=>document.querySelector(`[data-folder="${f}"]`)?.click(),f);await page.waitForTimeout(200);if(await page.evaluate(()=>!!document.querySelector('[data-start="sounds"]')))break;await page.evaluate(()=>document.querySelector('[data-folder=""]')?.click());await page.waitForTimeout(100);}
await page.evaluate(()=>document.querySelector('[data-start="sounds"]')?.click());
await page.waitForTimeout(2500);
const found=await page.evaluate(()=>!!document.querySelector('.board-zone'));console.log('board',found);
const key=async k=>{await page.keyboard.down(k);await page.clock.runFor(60);await page.keyboard.up(k);};
await run(300);await shot('00_pista');await run(9000);await shot('01_espera');
await key('Space');await run(300);await shot('02_primera');await key('Enter');await run(600);await shot('03_errada');await run(3000);await shot('04_despres_errada');
await key('Space');await run(300);await shot('05_segona');await key('Enter');await run(500);await shot('06_encert');await run(2500);await shot('07_escenari');await run(4000);await shot('08_escenari');await run(6000);await shot('09_seguent');
console.log('ERRORS',errors.length?errors.join('\n'):'none');await browser.close();

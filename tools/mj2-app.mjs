// The six Mira i Juga 2 activities (0.78). Two jobs, with dist/ served over http (SwiftShader WebGL):
//  node tools/mj2-app.mjs cartes            -> dist/mj2/cartes/<id>.png (a still of each scene when it asks; then tools/mj2-cartes.py makes the WebP)
//  node tools/mj2-app.mjs app <out> [ids…]  -> opens each activity in the app from its folder, scans and chooses with Space (one switch)
//                                              and keeps JPEG pictures; lists the page errors.
import {mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {serve} from './vestidor-frames.mjs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const IDS={'mj-robot':'triar','mj-conte':'triar','mj-nenufars':'triar','mj-planol':'relacionar','mj-escolta':'relacionar','mj-ou':'relacionar'};
const [job='app',outArg='/tmp/mj2-app',...only]=process.argv.slice(2);
const srv=await serve(),port=srv.address().port;
const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const errors=[];
const watch=page=>{page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});};
if(job==='cartes'){const out='dist/mj2/cartes';mkdirSync(out,{recursive:true});
 for(const id of only.length?only:Object.keys(IDS)){const page=await browser.newPage({viewport:{width:1280,height:720}});watch(page);
  await page.goto(`http://127.0.0.1:${port}/mj2/index.html`);await page.waitForTimeout(800);await page.evaluate(id=>PP.open(id,{lang:'ca',cfg:{size:1}}),id);
  for(let i=0;i<60&&!(await page.evaluate(()=>PP.targets().length));i++)await page.waitForTimeout(500);
  await page.waitForTimeout(1500);await page.screenshot({path:`${out}/${id}.png`});console.log('carta',id);await page.close();}}
else{mkdirSync(outArg,{recursive:true});
 for(const id of only.length?only:Object.keys(IDS)){const page=await browser.newPage({viewport:{width:1280,height:800}});watch(page);
  await page.goto(`http://127.0.0.1:${port}/index.html`);await page.waitForTimeout(1500);
  await page.locator(`[data-folder="${IDS[id]}"]`).first().click();await page.waitForTimeout(600);
  await page.locator(`[data-start="${id}"]`).first().click();
  const phase=()=>page.evaluate(()=>document.querySelector('#stage')?.dataset.phase);
  const shot=name=>page.screenshot({path:`${outArg}/${id}_${name}.jpg`,type:'jpeg',quality:84});
  let picks=0;const t0=Date.now();
  while(picks<8&&Date.now()-t0<150000){for(let i=0;i<40&&await phase()!=='choose';i++)await page.waitForTimeout(500);
   if(await phase()!=='choose')break;await page.waitForTimeout(2600);if(picks<3)await shot(`${picks+1}_focus`);
   await page.keyboard.down('Space');await page.waitForTimeout(80);await page.keyboard.up('Space');picks++;await page.waitForTimeout(1800);if(picks<3)await shot(`${picks}_tria`);}
  await shot('final');console.log(id,'picks',picks,'s',Math.round((Date.now()-t0)/1000));await page.close();}}
console.log(errors.length?[...new Set(errors)].join('\n'):'no errors');await browser.close();srv.close();

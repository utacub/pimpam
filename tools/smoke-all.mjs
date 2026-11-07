// Every activity of the built HTML, one after the other (0.26.1): opens it from its card, presses the switch a few times (in the
// scanning activities a press chooses the option in focus), keeps a picture of each one and goes back home. Lists the cards of the home
// page, the words of the footer and every error of the page. Usage: [ONLY=id,id] [SHOT_TIMEOUT=ms] node tools/smoke-all.mjs <built.html> <outdir> [width] [height]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720']=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];let current='home';page.on('pageerror',e=>errors.push(current+': '+String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(current+': '+m.text());});
await page.goto('file://'+html);await page.waitForTimeout(1500);
// 0.42: the menu shows folders; every folder is opened to list its cards (an activity remembers its folder to be opened from it)
const where={},folders=await page.evaluate(()=>[...document.querySelectorAll('.card-open[data-folder]')].map(b=>b.dataset.folder));
for(const f of folders){await page.locator(`.card-open[data-folder="${f}"]`).click();await page.waitForTimeout(300);for(const id of await page.evaluate(()=>[...document.querySelectorAll('.cards [data-start]')].map(b=>b.dataset.start)))where[id]??=f;await page.locator('.folder-back').click();await page.waitForTimeout(200);}
const ids=Object.keys(where);console.log('folders:',folders.join(' '));
console.log(ids.length,'activities:',ids.join(' '));console.log('footer:',await page.evaluate(()=>document.querySelector('.footer')?.textContent.replace(/\s+/g,' ').trim()));
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(80);await page.keyboard.up('Space');};
const only=(process.env.ONLY||"").split(",").filter(Boolean);
for(const id of ids){if(only.length&&!only.includes(id))continue;current=id;await page.evaluate(()=>{const b=document.querySelector('.folder-back');if(b)b.click();});await page.waitForTimeout(150);await page.locator(`.card-open[data-folder="${where[id]}"]`).click();await page.waitForTimeout(150);const t0=Date.now();await page.locator(`.cards [data-start="${id}"]`).first().click();
 // 0.40: the activity is shown when its loading cover lifts; the presses start then
 await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:45000,polling:100}).catch(()=>errors.push(id+': the loading cover did not lift'));const cover=Date.now()-t0;await page.waitForTimeout(1600);
 for(let k=0;k<3;k++){await press();await page.waitForTimeout(k===2?1800:2600);}
 await page.screenshot({path:`${out}/${id}.jpg`,type:'jpeg',quality:70,timeout:+(process.env.SHOT_TIMEOUT||30000)});
 const state=await page.evaluate(()=>({phase:document.querySelector('#stage')?.dataset.phase,activity:document.querySelector('#stage')?.dataset.activity}));
 console.log(id,'cover',cover,'ms',JSON.stringify(state));await page.keyboard.press('Escape');await page.waitForTimeout(500);}
current='home';console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

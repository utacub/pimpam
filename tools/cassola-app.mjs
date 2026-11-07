// La cassola d'en Glups (EN23, 0.24; 0.27) in the built HTML, in real time: opens it, lets the focus go round, chooses a magic
// ingredient and a biscuit (or, with PROFILE=one, the three presses of «Un ingredient sorpresa»), keeps pictures of each moment and measures the time between
// frames on the board, in a choice and through the show. Lists the zones (with their words for the assistive technologies), the words
// visible on the page and the errors. Usage: node tools/cassola-app.mjs <built.html> <outdir> [width] [height] [one]
import {createRequire} from 'node:module';
import {mkdirSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,wArg='1280',hArg='720',mode='']=process.argv.slice(2),W=+wArg,H=+hArg,one=mode==='one';mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.addInitScript(p=>{try{localStorage.setItem('pimpam-profile',JSON.stringify(p));}catch{}},one?{potPick:'one'}:{});
const gaps=ms=>page.evaluate(ms=>new Promise(r=>{const t=[],end=performance.now()+ms;const f=n=>{t.push(n);if(n<end)requestAnimationFrame(f);else r(t.slice(1).map((x,i)=>x-t[i]));};requestAnimationFrame(f);}),ms);
const report=(name,g)=>{g.sort((a,b)=>a-b);const q=p=>g[Math.floor(p*(g.length-1))].toFixed(1);console.log(`${W}x${H}${one?' one':''} ${name}: ${g.length} frames, median ${q(.5)} ms, p90 ${q(.9)} ms, max ${q(1)} ms`);};
const shot=name=>page.screenshot({path:`${out}/${W}x${H}${one?'_one':''}_${name}.jpg`,type:'jpeg',quality:88});
const info=()=>page.evaluate(()=>({zones:[...document.querySelectorAll('.board-zone')].map(b=>b.getAttribute('aria-label')),scanned:document.querySelector('[data-choice].scanned')?.getAttribute('aria-label')||'',phase:document.querySelector('#stage')?.dataset.phase,
 words:[...document.querySelectorAll('#stage *')].filter(e=>e.offsetParent&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>e.textContent.trim()).filter(Boolean)}));
await page.goto('file://'+html);await page.locator('[data-start="pot"]').first().click();await page.waitForTimeout(3500);
console.log('board',JSON.stringify(await info()));report('board',await gaps(3000));await shot('board');
const turns=one?3:2;
for(let k=0;k<turns;k++){
 for(let n=0;n<60;n++){const s=await info();if(s.phase==='ready'&&s.scanned)break;await page.waitForTimeout(200);}
 const before=await info();await page.keyboard.down('Space');await page.waitForTimeout(60);await page.keyboard.up('Space');
 if(k<turns-1){await page.waitForTimeout(700);await shot(`step${k}`);report(`choice ${k+1} (${before.scanned})`,await gaps(1400));await page.waitForTimeout(800);console.log('next',JSON.stringify((await info()).zones));}
 else{console.log('last press on',before.scanned);report('show 0–3 s (the plop, the ladle, the sip)',await gaps(3000));await shot('show_taste');report('show 3–6 s (the change, the scene)',await gaps(3000));await shot('show_scene1');
  report('show 6–9 s (the scene)',await gaps(3000));await shot('show_scene2');report('show 9–12 s (the scene)',await gaps(3000));await shot('show_scene3');report('show 12–15 s (the hiccup, the way back)',await gaps(3000));await shot('show_rest');await page.waitForTimeout(2500);await shot('next_round');console.log('next round',JSON.stringify(await info()));}}
console.log('errors',errors.length?errors.join('\n'):'none');await browser.close();

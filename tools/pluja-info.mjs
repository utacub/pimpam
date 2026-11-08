// La nova Pluja de colors (CE45, 0.55): the picture of the home card (Primera llum, its floor full of paint just before it dilutes),
// into production/info/cards/; and, on request, a still of each scene for a review (PNG). The activity has no «Informació» panel: from
// one scene to the next only the colours, the instrument and the rhythm change. The real activity runs in Chromium (the model, the
// placing of the drops and the WebGL2 floor of dist/), press after press as a person would press, at 30 steps a second on a floor of
// 432 rows (the activity: 60 and 864; PLJ_DYEH and PLJ_STEPS change them): without a graphics card the floor takes about half a second
// a step here, and the pictures are small.
// Usage: node tools/pluja-info.mjs                 the card (then python3 production/info/make_info.py)
//        node tools/pluja-info.mjs <outdir> [first last]   a still of scenes first…last (0–9) into outdir, 768 × 432
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const PJ_PAGE_MODULES=['kaleido-base.js','sampler.js','paper.js','escenari.js','carrega.js','pluja-escenes.js','pluja-colors.js','pluja-shaders.js','pluja-gl.js','pluja-escena.js'];
export function pjPageSource(){const code=PJ_PAGE_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/\bexport\s+(?=(const|let|function|class)\b)/g,'');
 return '(()=>{'+code+'\nwindow.PJ={pjStart,pjPress,pjTick,pjFloor,pjDraw,pjFixedScale,PJ_SCENES,PLJ,render:pljRender};})();';}
// one scene: presses whenever the floor waits (2.4 s after the last one), until the floor is full; returns the time it got there
export async function pjRunScene(page,id,o={}){return page.evaluate(([id,o])=>{const s={pjDrops:'curta',pjPresses:10,pjView:'perspectiva',pjFlow:'lent',pjFirst:id,lock:true,sound:false,waitCue:false,reduced:false,...(o.s||{})};
  const game={};window.PJ.pjStart(game,s);const F=game.pluja,cv=document.getElementById('c'),W=cv.width,H=cv.height;let last=-9,n=0;
  while(n<200000){if(F.phase==='rest'&&F.t-last>=(o.gap??2.4)&&F.t>.4){window.PJ.pjPress(game,s);last=F.t;}window.PJ.pjTick(game,s,o.dt??(1/+(window.PJ_STEPS||30)));window.PJ.pjFloor(F,s,W,H);n++;
   if(F.phase==='fill'&&F.t-F.at>=(o.after??3.4))break;if(o.midK&&F.k>=o.midK&&F.phase==='rest'&&F.t-last>=(o.gap??2.4)-.05)break;}
  window.game=game;window.s=s;const c=cv.getContext('2d');window.PJ.pjDraw(c,W/2,H/2,game,s);window.PJ.PLJ.gl.finish();return {t:F.t,k:F.k};},[id,o]);}
export async function pjOpen(W,H){const browser=await playwright.chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}" style="width:${W}px;height:${H}px"></canvas></body></html>`);
 await page.addScriptTag({content:pjPageSource()});await page.evaluate(([h,n])=>{window.PJ.pjFixedScale(1,h);window.PJ_STEPS=n;},[+(process.env.PLJ_DYEH||432),+(process.env.PLJ_STEPS||30)]);return {browser,page,errors};}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [out,a='0',b='9']=process.argv.slice(2);
 if(process.env.PLJ_MID){const {browser,page}=await pjOpen(768,432);const ids=await page.evaluate(()=>window.PJ.PJ_SCENES.map(x=>x.id));for(const k of process.env.PLJ_MID.split(',').map(Number)){const r=await pjRunScene(page,ids[+a],{midK:k});writeFileSync(out+`/mig_${ids[+a]}_${k}.png`,await page.locator('#c').screenshot({type:'png',timeout:600000}));console.log('mig',k,JSON.stringify(r));}await browser.close();process.exit(0);}
 if(out){const {browser,page,errors}=await pjOpen(768,432);const ids=await page.evaluate(()=>window.PJ.PJ_SCENES.map(x=>x.id));
  for(let i=+a;i<=+b;i++){const t0=Date.now(),r=await pjRunScene(page,ids[i]);writeFileSync(out+`/pluja-colors_${String(i+1).padStart(2,'0')}.png`,await page.locator('#c').screenshot({type:'png',timeout:600000}));console.log(ids[i],JSON.stringify(r),((Date.now()-t0)/1000).toFixed(0)+' s');}
  await browser.close();if(errors.length)console.log('ERRORS',errors.slice(0,5));process.exit(0);}
 const tmp=mkdtempSync(join(tmpdir(),'pluja-info-'))+'/',card=await pjOpen(976,546);const id=await card.page.evaluate(()=>window.PJ.PJ_SCENES[0].id);await pjRunScene(card.page,id);
 writeFileSync(tmp+'card.png',await card.page.locator('#c').screenshot({type:'png',timeout:600000}));await card.browser.close();if(card.errors.length)console.log('ERRORS',card.errors.slice(0,5));
 execFileSync('python3',['-c',`
from PIL import Image
im=Image.open('${tmp}card.png').convert('RGB').resize((488,273),Image.LANCZOS);im.save('${root}production/info/cards/pluja-colors.jpg',quality=84,optimize=True)
print('ok')
`],{stdio:'inherit'});
 rmSync(tmp,{recursive:true,force:true});}

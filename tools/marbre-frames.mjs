// Review tool for La nova Pluja de colors (CE03, 0.52): still frames through the real scene, as JPEG files, with drawing times.
// Usage: node tools/marbre-frames.mjs OUTDIR WIDTH HEIGHT [DPR] JSON ...
//   each JSON is a paint order: {"name":"x","s":{settings},"sim":{"presses":[seconds…],"t":seconds}} runs the model from the start
//   (pressing at those times) and paints the moment t; {"name":"x","sheet":[g,j,steps,lap]} paints a finished sheet (as the card and
//   the ⓘ panel show it); "preview":true paints the card's picture. "flush":true includes the drawing reaching the pixels in the time.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const MB_MODULES=['kaleido-base.js','sampler.js','glass.js','paper.js','escenari.js','input.js','marbre-tallers.js','marbre-tinta.js','color-rain.js','marbre-escena.js'];
export function mbSource(){const code=MB_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.MB={mbScene,mbStart,mbPress,mbTick,mbSimulate,defaults};})();';}
export async function openMb(width,height,dpr=1){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width*dpr}" height="${height*dpr}" style="width:${width}px;height:${height}px"></canvas></body></html>`);
 await page.addScriptTag({content:mbSource()});
 await page.addScriptTag({content:`window.DPR=${dpr};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width/DPR,h=cv.height/DPR;c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
  const S={...MB.defaults,background:'full',...(o.s||{})};let game=null;
  if(o.sim){game={count:0,completed:0};MB.mbStart(game,S);const P=o.sim.presses||[],T=o.sim.t||0;let k=0;for(let t=0;t<=T+1e-6;t+=1/60){while(k<P.length&&P[k]<=t+1e-6){MB.mbPress(game,{...S,lock:false});k++;}MB.mbTick(game,S,1/60);}}
  else if(o.sheet){const [g,j,steps,lap]=o.sheet;game={marbre:MB.mbSimulate(g,j,{steps:steps??4,lap:lap??0})};}
  const t1=performance.now();MB.mbScene(c,w,h,game,S,!!o.preview);if(o.flush)c.getImageData(0,0,1,1);return performance.now()-t1;};`});
 return {browser,page,errors};}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [out,W,H,D,...orders]=process.argv.slice(2);const dpr=+D||1;mkdirSync(out,{recursive:true});const {browser,page,errors}=await openMb(+W,+H,dpr);
 for(const s of orders){const o=JSON.parse(s);let ms=0;for(let i=0;i<(o.reps||1);i++)ms=await page.evaluate(x=>window.paint(x),o);const buf=await page.locator('#c').screenshot({type:'jpeg',quality:88});writeFileSync(`${out}/${o.name}.jpg`,buf);console.log(o.name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.slice(0,5));await browser.close();}

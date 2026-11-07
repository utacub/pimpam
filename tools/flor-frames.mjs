// Review tool for La nova Flor de paper (CE02, 0.51): still frames through the real art, as JPEG files, with drawing times.
// Usage: node tools/flor-frames.mjs OUTDIR WIDTH HEIGHT [DPR] JSON ...
//   each JSON is a paint order: {"name":"x","scene":{...}} for a whole scene (fpScene), or {"name":"x","flowers":[{sp,x,y,R,p,wake,...}]}
//   for single flowers on black (x, y, R as fractions of the height/width as in the scene). "flush":true in a scene order waits for the
//   drawing to reach the pixels, so the time printed includes it.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const FP_MODULES=['kaleido-base.js','sampler.js','glass.js','paper.js','escenari.js','input.js','flor-especies.js','flor-paper.js','flor-art.js','flor-escena.js','flor.js'];
export function fpSource(){const have=FP_MODULES.filter(n=>{try{readFileSync(root+'dist/'+n);return true;}catch{return false;}});
 const code=have.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 const names=['fpFlower','fpLook','FP_SPECIES','FP_GARDENS','fpScene','fpNew','fpPress','fpTick','fpStart','defaults'].filter(x=>new RegExp('\\b(function|const|let|class)\\s+'+x+'\\b').test(code));
 return '(()=>{'+code+'\nwindow.FP={'+names.join(',')+'};})();';}
export async function openFp(width,height,dpr=1){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width*dpr}" height="${height*dpr}" style="width:${width}px;height:${height}px"></canvas></body></html>`);
 await page.addScriptTag({content:fpSource()});
 await page.addScriptTag({content:`window.DPR=${dpr};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width/DPR,h=cv.height/DPR;c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle=o.bg||'#000';c.fillRect(0,0,w,h);const t0=performance.now();
  if(o.scene){const S={...FP.defaults,...(o.scene.s||{})};let game=o.scene.game||null;
   if(o.scene.sim){game={count:0,completed:0};FP.fpStart(game,S);const P=o.scene.sim.presses||[],T=o.scene.sim.t||0;let k=0;for(let t=0;t<=T+1e-6;t+=1/30){while(k<P.length&&P[k]<=t+1e-6){FP.fpPress(game,{...S,lock:false});k++;}FP.fpTick(game,S,1/30);}}
   const t1=performance.now();FP.fpScene(c,w,h,game,S,!!o.scene.preview,o.scene.now);if(o.flush)c.getImageData(0,0,1,1);return performance.now()-t1;}
  else for(const f of o.flowers){const sp=FP.fpLook(FP.FP_SPECIES[f.sp],f.alt);FP.fpFlower(c,sp,{...f,x:f.x*w,y:f.y*h,R:f.R*h});}
  return performance.now()-t0;};`});
 return {browser,page,errors};}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [out,W,H,D,...orders]=process.argv.slice(2);const dpr=+D||1;mkdirSync(out,{recursive:true});const {browser,page,errors}=await openFp(+W,+H,dpr);
 for(const s of orders){const o=JSON.parse(s);let ms=0;for(let i=0;i<(o.reps||1);i++)ms=await page.evaluate(x=>window.paint(x),o);const buf=await page.locator('#c').screenshot({type:'jpeg',quality:90});writeFileSync(`${out}/${o.name}.jpg`,buf);console.log(o.name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.slice(0,5));await browser.close();}

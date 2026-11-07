// Review tool for the stage stories of phase 1 (0.14), L'orquestra que es desperta (CE12) and El cel de les constel·lacions (CE10):
// renders still frames as PNG files and reports the drawing time of each one.
// Usage: node tools/stage-frames.mjs orquestra|constel|castells|globus|mag|cambrer OUTDIR WIDTH HEIGHT "variant,count,steps,t[,idle,from]" ...
// t is the time since the press (1000 = at rest); the duration of each press is the activity's minimum (step or final).
// Fem castells (0.16.1): DECOR=full|dim|none, BASE=black|white and OPACITY=0..100 give the decor setting (the name ends with it).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const STAGE_MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','escenari.js','orquestra.js','orquestra-art.js','constel.js','constel-art.js','castells.js','castells-gent.js','castells-art.js','globus.js','globus-art.js','mag.js','mag-art.js','cambrer.js','cambrer-art.js'];
export function stageSource(){const code=STAGE_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.ST={drawOrquestra,oqPlan,oqScore,oqRound,OQ_STEP_MIN,OQ_FINAL_MIN,drawConstel,skScore,SK_STEP_MIN,SK_FINAL_MIN,drawCastells,fmBusy,femScore,femPlan,FEM_STEP_MIN,FEM_FINAL_MIN,drawGlobus,gbPlan,gbScore,gbRound,GB_STEP_MIN,GB_FINAL_MIN,drawMag,mgPlan,mgScore,mgRound,MG_STEP_MIN,MG_FINAL_MIN,drawCambrer,cbPlan,cbScore,cbRound,CB_STEP_MIN,CB_FINAL_MIN,escGroups,escAges};})();';}
export async function openStage(width,height){const browser=await playwright.chromium.launch({args:(process.env.DIA_BROWSER_ARGS||'').split(' ').filter(Boolean)}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:stageSource()});
 await page.addScriptTag({content:`window.paint=(kind,o)=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  const fin=o.count>=o.steps,K=kind==='orquestra'?['drawOrquestra','OQ']:kind==='castells'?['drawCastells','FEM']:kind==='globus'?['drawGlobus','GB']:kind==='mag'?['drawMag','MG']:kind==='cambrer'?['drawCambrer','CB']:['drawConstel','SK'],D=o.duration??(fin?ST[K[1]+'_FINAL_MIN']:ST[K[1]+'_STEP_MIN']);const t0=performance.now();ST[K[0]](c,cv.width,cv.height,{...o,duration:D});c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [kind,out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openStage(+W,+H);
 for(const s of specs){const [variant,count,steps,t,idle,from]=s.split(',').map(x=>x===''||x===undefined?undefined:Number(x));const decor=process.env.DECOR?{background:process.env.DECOR,base:process.env.BASE||'black',opacity:+(process.env.OPACITY||25)}:{},o={variant,count,steps,t,idle:idle??(t<1e3?t:7),held:1e3,from,...decor};let ms=await page.evaluate(([k,o])=>paint(k,o),[kind,o]);
  // Castells: the mosaics are made between frames; wait for them and paint again.
  if(kind==='castells'){await page.evaluate(async()=>{for(let i=0;i<600&&ST.fmBusy();i++)await new Promise(r=>setTimeout(r,20));});await page.evaluate(()=>new Promise(r=>setTimeout(r,900)));ms=await page.evaluate(([k,o])=>paint(k,o),[kind,o]);}
  const png=await page.locator('#c').screenshot();const name=`${out}/${kind}_${variant}_${count}of${steps}_${t}${process.env.DECOR?'_'+process.env.DECOR+(process.env.BASE==='white'?'_white':''):''}.png`;writeFileSync(name,png);console.log(name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.join('\n'));await browser.close();}

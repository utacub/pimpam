// Review tool for the scanning boards of 0.16 (EN04 On anem?, EN11 Detectius de sons): renders still frames as PNG files and reports
// drawing times. Usage: node tools/tauler-frames.mjs OUTDIR WIDTH HEIGHT "kind,round,a,b[,c]" ...
//   board,ROUND,FOCUS,PROGRESS[,waiting|plain|reduced]  the board with the focus on a zone (FOCUS -1: none)
//   trip,ROUND,PLACE,T                                    the trip of EN04 at T seconds since the choice (PLACE: sea|forest|snow|space)
//   band,ROUND,FOCUS,PROGRESS[,…] / show,ROUND,INDEX,T     the same for EN11 (once it exists)
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const TAULER_MODULES=['carrega.js','sampler.js','tauler.js','estacio.js','estacio-art.js','templet.js','templet-art.js'];
export function taulerSource(){const code=TAULER_MODULES.filter(n=>existsSync(root+'dist/'+n)).map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.TB={tlLayout,tlLights,etBoard,etResult,etTrip,ET_PLACES,'+(existsSync(root+'dist/templet-art.js')?'tmBoard,tmResult,tmStage,tmTarget,tmDrawInstrument,':'')+'};})();';}
export async function openTauler(width,height){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:taulerSource()});
 await page.addScriptTag({content:`window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width,h=cv.height;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
  const s={reduced:o.flag==='reduced',plainScene:o.flag==='plain'},state={round:o.round,hint:false};
  if(o.kind==='board'){const places=TB.ET_PLACES.map((p,i)=>TB.ET_PLACES[(i+o.round)%4]),zones=TB.tlLayout('destinations',4,w,h),lights=zones.map((z,i)=>i===o.a?1:.6);
   TB.etBoard(c,w,h,state,{},s,{options:places.map(value=>({value})),zones,lights,focus:o.a,progress:o.b,waiting:o.flag==='waiting',clock:3.2});}
  else if(o.kind==='open'){const places=TB.ET_PLACES.map((p,i)=>TB.ET_PLACES[(i+o.round)%4]),zones=TB.tlLayout('destinations',4,w,h),lights=zones.map((z,i)=>i===o.a?1:.6);
   TB.etResult(c,w,h,state,{},s,{options:places.map(value=>({value})),zones,lights,chosen:o.a,place:places[o.a],clock:0},o.b);}
  else if(o.kind==='trip')TB.etTrip(c,0,0,w,h,o.a,o.round,o.b,s);
  else if(o.kind==='band'||o.kind==='show'){const n=o.n||4,opts=TB.tmStage(o.round,n),zones=TB.tlLayout('sounds',n,w,h),focus=o.kind==='band'?o.a:-1,lights=zones.map((z,i)=>i===focus?1:.6);state.hint=o.flag==='hint';
   const view={options:opts.map(x=>({value:x.id})),zones,lights,focus,progress:o.b,waiting:o.flag==='waiting',clock:3.2,cue:o.flag==='cue'?1:0,sounding:o.flag==='sound'?o.a:-1,soundLevel:.9};
   if(o.kind==='band')TB.tmBoard(c,w,h,state,{},s,view);else{const target=TB.tmTarget(o.round).id;TB.tmResult(c,w,h,state,{},s,{...view,chosen:o.a,correct:opts[o.a].id===target,picked:opts[o.a].id},o.b);}}
  c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openTauler(+W,+H);
 for(const spec of specs){const [kind,round,a,b,flag,n]=spec.split(',');const o={kind,round:+round,a:isNaN(+a)?a:+a,b:b==='null'?null:+b,flag,n:n?+n:undefined};
  const ms=[];for(let k=0;k<3;k++)ms.push(await page.evaluate(o=>paint(o),o));
  const url=await page.evaluate(()=>document.getElementById('c').toDataURL('image/png'));const name=`${out}/${spec.replace(/[,.]/g,'_')}.png`;writeFileSync(name,Buffer.from(url.split(',')[1],'base64'));
  console.log(name,'first',ms[0].toFixed(1),'ms; then',ms.slice(1).map(x=>x.toFixed(1)).join(', '),'ms');}
 if(errors.length)console.log('ERRORS\n'+errors.join('\n'));await browser.close();}

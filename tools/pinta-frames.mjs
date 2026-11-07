// Review tool for Pinta el món (EN25, 0.38): renders still frames of the page as PNG files, with WebGL, and reports drawing times.
// Usage: node tools/pinta-frames.mjs OUTDIR WIDTH HEIGHT "kind,round,picks,a,b[,flag]" ...
//   board,ROUND,PICKS,FOCUS,PROGRESS[,none|dim|plain|reduced|waiting]   the board: PICKS the zones painted (cel+fons…, or -), the focus
//                                                                       on the FOCUS-th offered zone (-1: none), the ring at PROGRESS
//   result,ROUND,PICKS,ZONE,T[,flag]                                      ZONE being painted, T seconds into the result
//   final,ROUND,-,-,T[,flag]                                              the sixth zone painted: the finale (and the page turn) at T
//   preview,ROUND,-,-,-                                                   the home card
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const PINTA_MODULES=['carrega.js','input.js','sampler.js','tauler.js','pinta.js','pinta-shaders.js','pinta-gl.js','pinta-eines.js','pinta-terres.js','pinta-terres2.js','pinta-terres3.js','pinta-vida.js','pinta-gags.js','pinta-art.js'];
export function pintaSource(){const code=PINTA_MODULES.filter(n=>existsSync(root+'dist/'+n)).map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.PT={ptBoard,ptResult,ptLayout,ptPage,ptOrder,ptOptions,PT_ZONES,PT_FINAL,PT_STEP,PT_PAINT,TL_RING,TL_DIM,pintaPrewarm,pintaGlFailed};})();';}
export async function openPinta(width,height){const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:pintaSource()});
 await page.addScriptTag({content:`window.game={board:{lights:[],clock:0}};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width,h=cv.height;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
  const flag=o.flag||'',s={reduced:flag==='reduced',plainScene:flag==='plain'},decor=flag==='none'?{mode:'none',full:false,fade:0,base:'#000000',white:false}:flag==='dim'?{mode:'dim',full:false,fade:.25,base:'#000000',white:false}:{mode:'full',full:true,fade:1,base:'#ffffff',white:true};
  const round=o.round|0,all=PT.PT_ZONES,picks=o.picks==='-'||!o.picks?[]:o.picks.split('+'),state={id:'pinta',round,stage:picks.length,picks:picks.map(value=>({id:value,value})),status:'choose',pending:null,armed:flag!=='waiting',hint:false};
  const content=PT.ptOptions(state,3).map(value=>({id:value,value,label:value})),zones=PT.ptLayout(state,content,w,h);
  const b=game.board;b.clock=(o.clock??6)+0;const base={decor,ring:PT.TL_RING,options:content,zones,lights:zones.map((z,i)=>i===o.a?1:PT.TL_DIM),focus:o.a??-1,progress:o.b??null,waiting:flag==='waiting',wait:flag==='waiting'?1:0,clock:b.clock,cue:0,sounding:-1,soundLevel:0,trip:round,picks};
  if(o.kind==='board'){game.time=null;PT.ptBoard(c,w,h,state,game,s,base);}
  else if(o.kind==='preview'){game.time=null;PT.ptBoard(c,w,h,state,game,s,{...base,preview:true});}
  else if(o.kind==='result'){game.time=o.b;b.clock=20+o.b;PT.ptResult(c,w,h,state,game,s,{...base,clock:b.clock,chosen:0,pendingZone:o.a,final:false},o.b);}
  else if(o.kind==='final'){const order=PT.ptOrder(round),st={...state,picks:order.slice(0,5).map(value=>({id:value,value})),stage:5};game.time=o.b;b.clock=40+o.b;for(const z of order.slice(0,5))b.ptDone=b.ptDone||{};
   PT.ptResult(c,w,h,st,game,s,{...base,clock:b.clock,picks:order.slice(0,5),chosen:0,pendingZone:order[5],final:true},o.b);}
  c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openPinta(+W,+H);
 for(const spec of specs){const [kind,round,picks,a,b,flag]=spec.split(',');const o={kind,round:+round,picks,a:a==='-'?-1:isNaN(+a)?a:+a,b:b==='null'||b==='-'?null:+b,flag};
  const ms=[];for(let k=0;k<3;k++)ms.push(await page.evaluate(o=>paint(o),o));
  const url=await page.evaluate(()=>document.getElementById('c').toDataURL('image/png'));const name=`${out}/${spec.replace(/[,.+]/g,'_')}.png`;writeFileSync(name,Buffer.from(url.split(',')[1],'base64'));
  console.log(name,'first',ms[0].toFixed(1),'ms; then',ms.slice(1).map(x=>x.toFixed(1)).join(', '),'ms');}
 const gl=await page.evaluate(()=>PT.pintaGlFailed());console.log('webgl failed:',gl);if(errors.length)console.log('ERRORS\n'+errors.join('\n'));await browser.close();}

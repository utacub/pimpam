// Review tool for Estiu a la masia (EN26, 0.39): renders still frames of the activity as JPEG files through the real board art
// (masia-art.js over the scanning view), and reports drawing times. Usage:
//   node tools/masia-frames.mjs OUTDIR WIDTH HEIGHT "kind,picks,a,b[,flag]" ...
//   board,PICKS,FOCUS,PROGRESS[,none|dim|reduced|waiting]   the board at rest: PICKS the characters already picked (avia+avi…, or -),
//                                                           the focus on the FOCUS-th offered character (-1: none), the ring at PROGRESS
//   result,PICKS,CHAR,T[,flag[,round]]                       CHAR picked, T seconds into the effect (push-in 0–1.5, episode to 15.5, back)
//   final,PICKS,CHAR,T[,flag[,round]]                        the fifth pick: the episode and the dinner at T (0–35)
//   preview,-,-,-                                            the home card
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const MASIA_MODULES=['carrega.js','input.js','sampler.js','tauler.js','masia-pinzell.js','masia-natura.js','masia-personatges.js','masia-decorats.js','masia-efectes.js','masia.js','masia-episodis.js','masia-art.js'];
export function masiaSource(){const code=MASIA_MODULES.filter(n=>existsSync(root+'dist/'+n)).map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.MA={maBoard,maResult,maLayout,maPrewarm,msOptions,msOrder,MS_STEP,MS_FINAL,MS_PUSH,MS_EP,TL_RING,TL_DIM};})();';}
export async function openMasia(width,height){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height}});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:masiaSource()});
 await page.addScriptTag({content:`window.game={board:{lights:[],clock:0}};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width,h=cv.height;c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
  const flag=o.flag||'',s={reduced:flag==='reduced',scanOptions:3},decor=flag==='none'?{mode:'none',full:false,fade:0,base:'#000000',white:false}:flag==='dim'?{mode:'dim',full:false,fade:.25,base:'#000000',white:false}:{mode:'full',full:true,fade:1,base:'#000000',white:false};
  const round=o.round|0,picks=o.picks==='-'||!o.picks?[]:o.picks.split('+'),state={id:'masia',round,stage:picks.length,picks:picks.map(value=>({id:value,value})),status:'choose',pending:null,armed:flag!=='waiting',hint:false};
  const content=MA.msOptions(state,3).map(value=>({id:value,value,label:value})),zones=MA.maLayout(state,content,w,h);
  const b=game.board;b.clock=(o.clock??6)+0;const base={decor,ring:MA.TL_RING,options:content,zones,picks,lights:zones.map((z,i)=>i===o.a?1:MA.TL_DIM),focus:typeof o.a==='number'?o.a:-1,progress:o.b??null,waiting:flag==='waiting',wait:flag==='waiting'?1:0,clock:b.clock,cue:0,sounding:-1,soundLevel:0,trip:round};
  if(o.kind==='board'){game.time=null;MA.maBoard(c,w,h,state,game,s,base);}
  else if(o.kind==='preview'){game.time=null;MA.maBoard(c,w,h,state,game,s,{...base,preview:true});}
  else if(o.kind==='result'){game.time=o.b;b.clock=20+o.b;MA.maResult(c,w,h,state,game,s,{...base,clock:b.clock,chosen:0,pendingChar:o.a,final:false},o.b);}
  else if(o.kind==='final'){game.time=o.b;b.clock=40+o.b;MA.maResult(c,w,h,state,game,s,{...base,clock:b.clock,chosen:0,pendingChar:o.a,final:true},o.b);}
  c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openMasia(+W,+H);
 for(const spec of specs){const [kind,picks,a,b,flag,round]=spec.split(',');const o={kind,picks,a:a==='-'?-1:isNaN(+a)?a:+a,b:b==='null'||b==='-'?null:+b,flag,round:round?+round:0};
  const ms=[];for(let k=0;k<3;k++)ms.push(await page.evaluate(o=>paint(o),o));
  const url=await page.evaluate(()=>document.getElementById('c').toDataURL('image/jpeg',.9));const name=`${out}/${spec.replace(/[,.+]/g,'_')}.jpg`;writeFileSync(name,Buffer.from(url.split(',')[1],'base64'));
  console.log(name,'first',ms[0].toFixed(1),'ms; then',ms.slice(1).map(x=>x.toFixed(1)).join(', '),'ms');}
 if(errors.length)console.log('ERRORS\n'+errors.join('\n'));await browser.close();}

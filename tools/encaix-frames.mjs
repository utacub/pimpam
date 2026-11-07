// Review tool for Encaixos de fusta (EN12, 0.45): still frames of the board through the real art (encaix-art.js), as JPEG files, with
// drawing times. Usage: node tools/encaix-frames.mjs OUTDIR WIDTH HEIGHT [DPR] "kind,round,picks,a,b[,flag]" ...
//   board,ROUND,PICKS,FOCUS,PROGRESS[,none|dim|white|waiting|lliure|silueta|help]   the board at rest (PICKS: ids joined by +, or -)
//   result,ROUND,PICKS,CHOSEN,T[,flag]      the piece CHOSEN (index in the tray) fits, T seconds into the effect
//   wrong,ROUND,PICKS,CHOSEN,T[,flag]       the piece CHOSEN does not fit, T seconds
//   final,ROUND,PICKS,CHOSEN,T[,flag]       the fourth piece: the party and the change of board at T
//   preview,-,-,-,-                         the home card
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const EX_MODULES=['carrega.js','input.js','sampler.js','tauler.js','encaix.js','encaix-figures.js','encaix-mons.js','encaix-so.js','encaix-art.js'];
export function exSource(){const code=EX_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.EX={exTiles,exPieceSprite,exHoleSprite,exPrewarm,exScene,exFigure,exBoard,exResult,exLayout,exOptions,exTarget,exBoardOf,exSlots,exGeom,TL_RING,TL_DIM,EX_FLY,EX_STEP,EX_FINAL,EX_WRONG,scanRing,defaults};})();';}
export async function openEx(width,height,dpr=1){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width*dpr}" height="${height*dpr}" style="width:${width}px;height:${height}px"></canvas></body></html>`);
 await page.addScriptTag({content:exSource()});
 await page.addScriptTag({content:`window.DPR=${dpr};window.game={board:{lights:[],clock:0}};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width/DPR,h=cv.height/DPR;c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
  const flag=o.flag||'',white=flag.includes('white'),s={...EX.defaults,reduced:flag.includes('reduced'),scanOptions:o.n||3,exMode:flag.includes('lliure')?'lliure':'encaixa',exHint:flag.includes('silueta')?'silueta':'imatge',exLike:flag.includes('semblants')?'semblants':'diferents',exHelp:'2',exGlow:!flag.includes('noglow'),exMark:flag.includes('contorn')?'contorn':flag.includes('focus')?'focus':flag.includes('fletxa')?'fletxa':'',exPace:'normal'};
  const decor=flag.includes('none')?{mode:'none',full:false,fade:0,base:white?'#ffffff':'#000000',white}:flag.includes('dim')?{mode:'dim',full:false,fade:.25,base:white?'#ffffff':'#000000',white}:{mode:'full',full:true,fade:1,base:'#000000',white:false};
  const round=o.round|0,picks=o.picks==='-'||!o.picks?[]:o.picks.split('+'),state={id:'encaix',round,stage:picks.length,picks:picks.map(value=>({id:value,value})),status:'choose',pending:null,armed:!flag.includes('waiting'),hint:false,errors:flag.includes('help')?2:0};
  const ids=EX.exOptions(state,s),content=ids.map(value=>({id:value,value,label:value})),zones=EX.exLayout(state,content,w,h);
  const b=game.board;b.clock=(o.clock??6)+0;const base={decor,ring:EX.scanRing(s),options:content,zones,picks,lights:zones.map((z,i)=>i===o.a?1:EX.TL_DIM),focus:typeof o.a==='number'?o.a:-1,progress:o.b??null,waiting:flag.includes('waiting'),wait:flag.includes('waiting')?1:0,clock:b.clock,cue:0,sounding:-1,soundLevel:0};
  if(o.kind==='board'){game.time=null;EX.exBoard(c,w,h,state,game,s,base);}
  else if(o.kind==='preview'){game.time=null;EX.exBoard(c,w,h,state,game,s,{...base,preview:true});}
  else{const chosen=o.a|0,id=ids[chosen];game.time=o.b;b.clock=20+o.b;const correct=o.kind!=='wrong',final=o.kind==='final';EX.exResult(c,w,h,state,game,s,{...base,clock:b.clock,chosen,pendingId:id,correct,final,focus:-1},o.b);}
  c.getImageData(0,0,1,1);return {ms:performance.now()-t0,ids};};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,D='1',...specs]=process.argv.slice(2);mkdirSync(out,{recursive:true});const {browser,page,errors}=await openEx(+W,+H,+D);
 for(const spec of specs){const [kind,round,picks,a,b,flag]=spec.split(',');const o={clock:process.env.CLOCK?+process.env.CLOCK:undefined,kind,round:+round||0,picks,a:a==='-'?-1:+a,b:b==='null'||b==='-'||b===undefined?null:+b,flag};
  const ms=[];let ids;for(let k=0;k<3;k++){const r=await page.evaluate(o=>paint(o),o);ms.push(r.ms);ids=r.ids;}
  const url=await page.evaluate(()=>document.getElementById('c').toDataURL('image/jpeg',.9));const name=`${out}/${spec.replace(/[,.+]/g,'_')}.jpg`;writeFileSync(name,Buffer.from(url.split(',')[1],'base64'));
  console.log(name,'first',ms[0].toFixed(1),'ms; then',ms.slice(1).map(x=>x.toFixed(1)).join(', '),'ms; tray',ids.join(' '));}
 if(errors.length)console.log('ERRORS\n'+errors.join('\n'));await browser.close();}

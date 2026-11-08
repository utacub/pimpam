// Review tool for El taller de vehicles (EN07, 0.53): still frames of the 3D board through the real art (vehicles-art.js and three.js),
// as PNG files, with drawing times. Headless Chromium renders with SwiftShader (no GPU), so the frames are slow but exact.
// Usage: node tools/vehicles-frames.mjs OUTDIR WIDTH HEIGHT [DPR] "kind,round,picks,a,b[,flags]" ...
//   board,ROUND,PICKS,FOCUS,PROGRESS[,flags]   the board at rest (PICKS: ids joined by +, or -; FOCUS: index in the tray)
//   result,ROUND,PICKS,CHOSEN,T[,flags]        the piece CHOSEN (index in the tray) clicks on, T seconds into the effect
//   final,ROUND,PICKS,CHOSEN,T[,flags]         the last piece: the wait, the ride and the garage at T seconds (flag go=N: pressed at N s)
//   flags: none dim white waiting reduced sorpresa auto tranquila curt llarg steps2 steps4 n2 n3 n4 (peces a la safata; quatre per defecte) alta mitjana baixa flat sala pati passadis bany (primer racó)
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const VH_MODULES=['carrega.js','input.js','tauler.js','vehicles.js','vehicles-3d.js','vehicles-art.js'];
export function vhSource(){const code=VH_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.VH={vhBoard,vhResult,vhLayout,vhOptions,vhStageKind,vhPicks,vhTimeline,vhPhase,vhLoad,vhReady,vhRender,vhDebug,vhSlots,vhGeom,TL_RING,TL_DIM,VH_SNAP,scanRing,defaults};})();';}
export async function openVh(width,height,dpr=1,{gl=true}={}){const browser=await playwright.chromium.launch({args:gl?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']:['--disable-gpu','--disable-webgl']}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width*dpr}" height="${height*dpr}" style="width:${width}px;height:${height}px"></canvas></body></html>`);
 if(gl)await page.addScriptTag({path:root+'dist/vendor/three-taller.js'});
 await page.addScriptTag({content:vhSource()});
 await page.addScriptTag({content:`window.DPR=${dpr};window.game={board:{lights:[],clock:0}};
 window.load=()=>{const t0=performance.now();let n=0;while(VH.vhLoad()<1&&n++<40);return {ms:performance.now()-t0,ready:VH.vhReady(),steps:n};};
 window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width/DPR,h=cv.height/DPR;c.setTransform(DPR,0,0,DPR,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
  const flag=o.flag||'',white=flag.includes('white'),s={...VH.defaults,reduced:flag.includes('reduced'),scanOptions:3,vhCells:flag.includes('n2')?'2':flag.includes('n3')?'3':'4',vhCorner:flag.includes('sala')?'sala':flag.includes('pati')?'pati':flag.includes('passadis')?'passadis':flag.includes('bany')?'bany':'habitacio',vhSteps:flag.includes('steps2')?'2':flag.includes('steps4')?'4':'3',vhWho:flag.includes('sorpresa')?'sorpresa':'alumne',vhGo:flag.includes('auto')?'auto':'puls',vhRide:flag.includes('curt')?'curt':flag.includes('llarg')?'llarg':'mitja',vhCamera:flag.includes('tranquila')?'tranquila':'dinamica',vhGarage:!flag.includes('nogarage'),vhQuality:flag.includes('mitjana')?'mitjana':flag.includes('baixa')?'baixa':flag.includes('alta')?'alta':'auto'};
  const decor=flag.includes('none')?{mode:'none',full:false,fade:0,base:white?'#ffffff':'#000000',white}:flag.includes('dim')?{mode:'dim',full:false,fade:.25,base:white?'#ffffff':'#000000',white}:{mode:'full',full:true,fade:1,base:'#000000',white:false};
  const round=o.round|0,picks=o.picks==='-'||!o.picks?[]:o.picks.split('+'),state={id:'vehicles',round,stage:picks.length,picks:picks.map(value=>({id:value,value})),status:'choose',pending:null,armed:!flag.includes('waiting'),hint:false,errors:0};
  const ids=VH.vhOptions(state,s),content=ids.map(value=>({id:value,value,label:value})),zones=VH.vhLayout(state,content,w,h);
  const b=game.board;b.clock=(o.clock??6)+0;const base={decor,ring:VH.scanRing(s),options:content,zones,lights:zones.map((z,i)=>i===o.a?1:VH.TL_DIM),focus:typeof o.a==='number'?o.a:-1,progress:o.b??null,waiting:flag.includes('waiting'),wait:flag.includes('waiting')?1:0,clock:b.clock,cue:0,sounding:-1,soundLevel:0};
  const m=/go=([\\d.]+)/.exec(flag);game.vhGo=m?+m[1]:null;
  if(o.kind==='board'){game.time=null;VH.vhBoard(c,w,h,state,game,s,base);}
  else if(o.kind==='preview'){game.time=null;VH.vhBoard(c,w,h,state,game,s,{...base,preview:true});}
  else{const chosen=o.a|0,id=ids[chosen];game.time=o.b;b.clock=20+o.b;const final=o.kind==='final';state.pending={option:{id,value:id},correct:true,final};VH.vhResult(c,w,h,state,game,s,{...base,clock:b.clock,chosen,pendingId:id,correct:true,final,focus:-1},o.b);}
  c.getImageData(0,0,1,1);return {ms:performance.now()-t0,ids,kind:VH.vhStageKind(state,s)};};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,D='1',...specs]=process.argv.slice(2);mkdirSync(out,{recursive:true});const flat=specs.some(x=>x.includes('flat'));const {browser,page,errors}=await openVh(+W,+H,+D,{gl:!flat});
 const L=await page.evaluate(()=>load());console.log('load',L);
 for(const spec of specs){const [kind,round,picks,a,b,flag]=spec.split(',');const o={clock:process.env.CLOCK?+process.env.CLOCK:undefined,kind,round:+round||0,picks,a:a==='-'?-1:+a,b:b==='null'||b==='-'||b===undefined?null:+b,flag};
  const ms=[];let r;for(let k=0;k<2;k++){r=await page.evaluate(o=>paint(o),o);ms.push(r.ms);}
  const url=await page.evaluate(()=>document.getElementById('c').toDataURL('image/png'));const name=`${out}/${spec.replace(/[,.+=]/g,'_')}.png`;writeFileSync(name,Buffer.from(url.split(',')[1],'base64'));
  console.log(name,'first',ms[0].toFixed(1),'ms; then',ms.slice(1).map(x=>x.toFixed(1)).join(', '),'ms;',r.kind,r.ids.join(' '));}
 if(errors.length)console.log('ERRORS\n'+errors.join('\n'));await browser.close();}

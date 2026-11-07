// Review tool for El far (CE28, 0.20): renders still frames as PNG files and reports the drawing time of each one.
// Usage: node tools/far-frames.mjs OUTDIR WIDTH HEIGHT "night,boats,mode,t[,phase]" ...
// mode: sweep (the light at phase, in cycles), glow (t seconds before the light is on the first boat), hit (a press with the light on the first boat, t seconds ago), final (the same for the
// third boat of the night), miss (a press with the light away from the boats, t seconds ago). DECOR=full|dim|none, BASE=black|white,
// OPACITY=0..100 and REDUCED=1 as in stage-frames.mjs; SPEED and WINDOW give the settings of the light.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','escenari.js','far.js','far-art.js'];
const source=()=>'(()=>{'+MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'')+
 '\nwindow.FR={drawFar,farEnsure,farPress,farTick,farDock,farPool,farGap,farPeriod,farWindow,farCount,FAR_STEP,FAR_FINAL,FAR_MISS};})();';
export async function openFar(width,height){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:source()});
 await page.addScriptTag({content:`window.paintFar=(spec,s)=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  const [night,boats,mode,t,phase]=spec,S={farSpeed:s.speed||'slow',farWindow:s.window||'wide',farBoats:boats},g=FR.farEnsure({variant:night},S);g.farNow=20;g.farSea.forEach(b=>b.born=0);
  if(mode==='final'){g.farHome=2;g.farDocked=[1,5];}
  if(mode==='sweep')g.farBeam=phase??.3;
  else if(mode==='glow')g.farBeam=Math.acos(1-2*g.farSea[0].t)/(2*Math.PI)-(t||0)/FR.farPeriod(S);
  else if(mode==='miss'){let best=0,gap=-1;for(let k=0;k<200;k++){const ph=k/200,m=Math.min(...g.farSea.map(b=>FR.farGap(ph,b.t,FR.farPeriod(S))));if(m>gap){gap=m;best=ph;}}g.farBeam=best;}
  else g.farBeam=Math.acos(1-2*g.farSea[0].t)/(2*Math.PI);
  let D=null;if(mode!=='sweep'&&mode!=='glow'){const k=FR.farPress(g,S);D=k==='miss'?FR.FAR_MISS:k==='final'?FR.FAR_FINAL:FR.FAR_STEP;}
  const t0=performance.now();FR.drawFar(c,cv.width,cv.height,{game:g,t:mode==='sweep'||mode==='glow'?null:t,duration:D,period:FR.farPeriod(S),window:FR.farWindow(S),boats,reduced:!!s.reduced,preview:mode==='preview',background:s.background,base:s.base,opacity:s.opacity});c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openFar(+W,+H);
 const s={background:process.env.DECOR||'full',base:process.env.BASE||'black',opacity:+(process.env.OPACITY||25),reduced:process.env.REDUCED==='1',speed:process.env.SPEED,window:process.env.WINDOW};
 for(const spec of specs){const [night,boats,mode,t,phase]=spec.split(',');const a=[+night,+boats,mode,+t,phase===undefined?undefined:+phase];const ms=await page.evaluate(([a,s])=>paintFar(a,s),[a,s]);
  const png=await page.locator('#c').screenshot();const name=`${out}/far_${night}_${boats}_${mode}_${t}${phase!==undefined?'_'+phase:''}${process.env.DECOR?'_'+process.env.DECOR+(process.env.BASE==='white'?'_white':''):''}.png`;writeFileSync(name,png);console.log(name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.join('\n'));await browser.close();}

// Review tool for Toc, toc! Qui hi ha? (CE30, 0.22): renders still frames as PNG files and reports the drawing time of each one.
// Usage: node tools/toc-frames.mjs OUTDIR WIDTH HEIGHT "round,mode,t[,who[,out]]" ...
// mode: wait, knock or leave (t seconds into it), visit (who: the index of the visitor, t seconds after the press), final (the same
// for the last visit of a round, with the party), change (t seconds into a new round), preview (the home card). out: how many
// visitors are already in the street (default 2; 6 for final). DECOR=full|dim|none, BASE=black|white, OPACITY=0..100 and
// REDUCED=1 as in stage-frames.mjs.
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODULES=['kaleido-base.js','glass.js','paper.js','sampler.js','escenari.js','toc.js','toc-art.js'];
const source=()=>'(()=>{'+MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'')+
 '\nwindow.TC={drawToc,tcRound,TC_VISIT,TC_FINAL,TC_FIRST};})();';
export async function openToc(width,height){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:source()});
 await page.addScriptTag({content:`window.paintToc=(spec,s)=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);
  const [v,mode,t,who,nOut]=spec,r=TC.tcRound(v),final=mode==='final',out=r.order.filter(x=>x!==who).slice(0,nOut??(final?6:2));let g,D=null,tt=null;
  if(mode==='visit'||final){D=final?TC.TC_FINAL:TC.TC_VISIT;tt=t;g={variant:v,tcNow:40,tcPhase:'visit',tcAt:40-t,tcOut:out,tcVisit:{who,slot:out.length,final,at:40-t},tcFrom:null,tcAgain:0};}
  else if(mode==='change')g={variant:(v+1)%20,tcNow:40,tcPhase:'wait',tcAt:40-t,tcOut:[],tcVisit:null,tcFrom:{variant:v,out:r.order.slice(0,7),at:40-t},tcAgain:0};
  else g={variant:v,tcNow:40,tcPhase:mode,tcAt:40-t,tcOut:out,tcVisit:null,tcFrom:null,tcAgain:0};
  const t0=performance.now();TC.drawToc(c,cv.width,cv.height,{game:g,t:tt,duration:D,reduced:!!s.reduced,preview:mode==='preview',background:s.background,base:s.base,opacity:s.opacity});c.getImageData(0,0,1,1);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openToc(+W,+H);
 const s={background:process.env.DECOR||'full',base:process.env.BASE||'black',opacity:+(process.env.OPACITY||25),reduced:process.env.REDUCED==='1'};
 for(const spec of specs){const [v,mode,t,who,n]=spec.split(',');const a=[+v,mode,+t,who===undefined?0:+who,n===undefined?undefined:+n];const ms=await page.evaluate(([a,s])=>paintToc(a,s),[a,s]);
  const png=await page.locator('#c').screenshot();const name=`${out}/toc_${v}_${mode}_${t}${who!==undefined?'_'+who:''}${n!==undefined?'_'+n:''}${process.env.DECOR?'_'+process.env.DECOR+(process.env.BASE==='white'?'_white':''):''}.png`;writeFileSync(name,png);console.log(name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.join('\n'));await browser.close();}

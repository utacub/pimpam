// What makes each activity wait when it opens (0.40): in the built HTML, a fresh page for every activity, the menu, then the card is
// opened and the page is watched for some seconds: the first frame after the click, the gaps between frames (the page frozen), the long
// tasks, the sound samples decoded and the pictures loaded, and when the page settles (the last long gap); with the loading cover
// (0.40), how long it stayed up and the longest wait between frames once the activity is shown. Writes a JSON and a table.
// Usage: [GPU=1] [W=1280 H=800 DPR=1] node tools/carrega-mesura.mjs <built.html> <out.json> [seconds per activity] [ids,comma,separated] [ms on the menu before the click]
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,out,secArg='14',only='',menuArg='2500']=process.argv.slice(2),SEC=+secArg,MENU=+menuArg;
// GPU=1: the canvases on an emulated graphics card (SwiftShader through ANGLE), as on a computer with a GPU: much slower than a real one,
// but the costs that only the accelerated canvas has show up (0.40.1: the masia painted its sheets there).
const GPU_ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-gpu-rasterization','--ignore-gpu-blocklist','--enable-accelerated-2d-canvas'];
const browser=await playwright.chromium.launch({args:['--autoplay-policy=no-user-gesture-required',...(process.env.GPU==='1'?GPU_ARGS:[])]});
const probe=await browser.newPage();await probe.goto('file://'+html);await probe.waitForTimeout(1500);
const ids=only?only.split(','):await probe.evaluate(()=>[...new Set([...document.querySelectorAll('[data-start]')].map(b=>b.dataset.start))]);await probe.close();
const rows=[];
for(const id of ids){
 const page=await browser.newPage({viewport:{width:+(process.env.W||1280),height:+(process.env.H||800)},deviceScaleFactor:+(process.env.DPR||1)});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>{const W=window.__load={dec:0,decDone:0,decLast:0,img:0,imgDone:0,imgLast:0,frames:[],long:[]};
  const D=BaseAudioContext.prototype.decodeAudioData;BaseAudioContext.prototype.decodeAudioData=function(...a){W.dec++;const p=D.apply(this,a);Promise.resolve(p).then(()=>{W.decDone++;W.decLast=performance.now();},()=>{});return p;};
  const I=window.Image;window.Image=function(...a){const im=new I(...a);W.img++;im.addEventListener('load',()=>{W.imgDone++;W.imgLast=performance.now();});return im;};window.Image.prototype=I.prototype;
  new PerformanceObserver(l=>{for(const e of l.getEntries())W.long.push([e.startTime,e.duration]);}).observe({type:'longtask',buffered:true});
  const tick=t=>{W.frames.push(t);if(document.querySelector('.load-cover:not(.gone)')){W.coverSeen=true;W.coverLast=t;}requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 const t0=Date.now();await page.goto('file://'+html);await page.waitForSelector(`[data-start="${id}"]`);const menuMs=Date.now()-t0;await page.waitForTimeout(MENU);
 const T=await page.evaluate(id=>{window.__load.t0=performance.now();window.__load.dec0=window.__load.dec;document.querySelector(`[data-start="${id}"]`).click();return window.__load.t0;},id);
 await page.waitForTimeout(SEC*1000);
 const r=await page.evaluate(()=>{const W=window.__load,t0=W.t0,f=W.frames.filter(t=>t>=t0),gaps=[];for(let i=1;i<f.length;i++)gaps.push([f[i-1]-t0,f[i]-f[i-1]]);
  const long=W.long.filter(([s])=>s>=t0-5).map(([s,d])=>[s-t0,d]),big=gaps.filter(([,g])=>g>120);
  const canvas=document.querySelector('#stage canvas'),shown=W.coverSeen?W.coverLast:t0,after=gaps.filter(([at])=>at+t0>shown);
  return {first:f.length?f[0]-t0:null,frames:f.length,maxGap:Math.max(0,...gaps.map(g=>g[1])),frozen:big.reduce((a,[,g])=>a+g,0),settle:big.length?big[big.length-1][0]+big[big.length-1][1]:0,
   long:long.length,longSum:long.reduce((a,[,d])=>a+d,0),longMax:Math.max(0,...long.map(l=>l[1])),dec:W.dec-W.dec0,decAll:W.dec,decDone:W.decDone,decLast:W.decLast?W.decLast-t0:null,img:W.img,imgDone:W.imgDone,imgLast:W.imgLast?W.imgLast-t0:null,
   cover:W.coverSeen?Math.round(W.coverLast-t0):null,maxGapAfter:Math.max(0,...after.map(g=>g[1])),bigGaps:big.slice(0,8).map(([at,g])=>Math.round(at)+'+'+Math.round(g)),canvas:canvas?canvas.width+'x'+canvas.height:null};});
 rows.push({id,menuMs,...r,errors});console.log(id.padEnd(10),'first',Math.round(r.first),'maxGap',Math.round(r.maxGap),'frozen',Math.round(r.frozen),'settle',Math.round(r.settle),'long',r.long,Math.round(r.longSum),'dec',r.decDone+'/'+r.decAll,r.decLast?Math.round(r.decLast):'-','img',r.imgDone+'/'+r.img,'cover',r.cover,'afterGap',Math.round(r.maxGapAfter),r.bigGaps.join(' '),errors.length?'ERR '+errors[0]:'');
 await page.close();}
writeFileSync(out,JSON.stringify(rows,null,1));await browser.close();

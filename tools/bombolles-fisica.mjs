// Bombolles sense pes · review of a simulated matter (0.64): the stimulus module itself (dist/bombolles-<name>.js) in Chromium, frame
// by frame (its solver runs inside its drawing), with the presses of a whole arc, and stills at chosen moments, plus what the
// stimulus reports (coverage, drops, events). Usage:
//   node tools/bombolles-fisica.mjs OUTDIR aigua [W H] [--gpu]      env BMB_PRESSES (8), BMB_GAP (s, 5), BMB_SEED, BMB_SHOTS='[["name",s],…]',
//   BMB_PHYS='{"Hs":90,…}' (a smaller box to review faster without a graphics card), BMB_FPS (frames a second of the review, 30), BMB_LAP (the lap: 1 for the second palette)
// Without --gpu Chromium draws with the processor (SwiftShader): many times slower than a graphics card.
import {createRequire} from 'node:module';
import http from 'node:http';
import {readFileSync,existsSync,statSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,extname} from 'node:path';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=new URL('..',import.meta.url).pathname,[out,stim='aigua',W0='960',H0='540']=process.argv.slice(2).filter(a=>!a.startsWith('--')),W=+W0,H=+H0;mkdirSync(out,{recursive:true});
const server=http.createServer((q,r)=>{const p=join(root,decodeURIComponent(q.url.split('?')[0]));if(!existsSync(p)||statSync(p).isDirectory()){r.writeHead(200,{'content-type':'text/html'});r.end('<!doctype html><title>b</title><body style="margin:0;background:#000">');return;}
 r.writeHead(200,{'content-type':{'.js':'text/javascript','.mjs':'text/javascript'}[extname(p)]||'application/octet-stream'});r.end(readFileSync(p));}).listen(0);
const browser=await playwright.chromium.launch({args:process.argv.includes('--gpu')?[]:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:W,height:H}});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if((m.type()==='error'||m.type()==='warning')&&!/GPU stall|GL Driver/.test(m.text()))errors.push(m.text());});
await page.goto(`http://localhost:${server.address().port}/`);
const P=+(process.env.BMB_PRESSES||8),gap=+(process.env.BMB_GAP||5),seed=+(process.env.BMB_SEED||11),fps=+(process.env.BMB_FPS||30);
const times=[];{let x=.5;for(let k=1;k<=P;k++){times.push(x);x+=k===P-1?gap*2:gap;}}
const end=times[P-1]+14,shots=process.env.BMB_SHOTS?JSON.parse(process.env.BMB_SHOTS):[['01_arribada',times[0]+3.5],['02_arribada2',times[1]+4],['03_creixement',times[Math.min(P-3,3)]+4],['04_creixement2',times[P-3]+4],['05_ple',times[P-2]+6],['06_ple2',times[P-2]+2*gap-.5],['07_sortida',times[P-1]+3],['08_final',end]];
const ok=await page.evaluate(async([W,H,stim,seed,P,phys,lap])=>{const M=await import('/dist/bombolles-motor.js'),mod=await import(`/dist/bombolles-${stim}.js`);
 if(!M.bmbSetup(W,H))return 'no WebGL2';const cv=M.bmbCanvas();cv.style.cssText='display:block;width:100%;height:100%';document.body.appendChild(cv);
 const pre=Object.keys(mod).find(k=>k.endsWith('New')).slice(0,-3),phy=Object.keys(mod).find(k=>/_PHYS$/.test(k));
 if(phys&&phy)Object.assign(mod[phy],JSON.parse(phys));
 window.R={M,mod,pre,S:mod[pre+'New']({seed,lap,AR:W/H,presses:P}),k:0,t:0,ev:{}};return 'ok';},[W,H,stim,seed,P,process.env.BMB_PHYS||'',+(process.env.BMB_LAP||0)]);
if(ok!=='ok'){console.log(ok,errors);process.exit(1);}
const t1=Date.now();
for(const [name,at] of shots){
 const res=await page.evaluate(async([at,times,fps])=>{const {M,mod,pre}=window.R,S=window.R.S,dt=1/fps;const t0=performance.now();
  while(window.R.t<at-1e-6){if(window.R.k<times.length&&window.R.t>=times[window.R.k]-1e-6){mod[pre+'Press'](S,window.R.k+1,times.length);window.R.k++;}
   mod[pre+'Step'](S,dt);window.R.t+=dt;M.bmbBegin(S.t);M.bmbRopeReset();mod[pre+'Draw'](S);M.bmbEnd(S.post||{});for(const e of S.ev)window.R.ev[e.type]=(window.R.ev[e.type]||0)+1;S.ev.length=0;
   // a new task each frame, as in the app: WebGL fences only become signalled between tasks (the small picture of the matter needs them)
   await new Promise(r=>setTimeout(r,0));}
  M.BMB.gl.finish();const c=mod[pre+'Cover'];
  return {t:window.R.t,ms:performance.now()-t0,k:window.R.k,cover:c?c(S):null,empty:mod[pre+'EmptyNow'](S),blobs:S.nBlobs??null,simT:S.simT??null,steps:S.sim?.steps??null,ev:window.R.ev};},[at,times,fps]);
 writeFileSync(`${out}/${name}.jpg`,await page.screenshot({type:'jpeg',quality:90,timeout:1800000}));
 console.log(name,'t',res.t.toFixed(1),'press',res.k,'simT',res.simT?.toFixed(1),'steps',res.steps,'cover',res.cover?.toFixed(2),'drops',res.blobs,'empty',res.empty,'ms',res.ms.toFixed(0),JSON.stringify(res.ev));}
console.log('total s',((Date.now()-t1)/1000).toFixed(0));if(errors.length)console.log('ERRORS\n'+errors.slice(0,10).join('\n'));await browser.close();server.close();

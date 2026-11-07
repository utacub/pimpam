// Selva de llum (CE35): still frames of the jungle dive (I=0: the start, in the sky), drawn by the app's own renderer (selva-gl.js) in a browser page, as JPEG
// files, with the drawing time of each. Without a GPU (as here) the browser draws WebGL in software: the times say nothing of a
// real device.
// Usage: node tools/selva-frames.mjs OUTDIR WIDTH HEIGHT SPEC ...
//   I,T[,FLAG...]  stimulus I (1–20) T seconds after its press (I=0: the surface before the first press). FLAGs: dim, none (decor),
//                  white (base), wait (the scene stopped and dark after its end), op=N (opacity of «Decorat atenuat», %)
// With SHEET=name.jpg, also a contact sheet of all the frames (4 columns).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const [out,wArg='1280',hArg='720',...specs]=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const code=['selva-shaders.js','selva.js','selva-gl.js'].map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:'(()=>{'+code+'\nwindow.F={drawFons:drawSelva,fonsDuration:selvaDuration,FONS_N:SELVA_N,FONS_STIM:SELVA_STIM,fonsAvailable:selvaAvailable};})();'});
await page.addScriptTag({content:`
// The clocks as the app keeps them, for a dive pressed without pauses: the scene clock wakes over 0.6 s after each press.
const wake=t=>{const u=Math.min(1,t/.6);return t<.6?.6*(u*u*u-u*u*u*u/2):t-.3;};
window.frame=(I,T,flags)=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),v=I-1;let sea=0;for(let j=0;j<v;j++)sea+=wake(F.fonsDuration(j));
 const wait=flags.includes('wait'),D=v>=0?F.fonsDuration(v):0,t=wait?null:T,tau=v>=0?wake(wait?D:T):0,prevTau=v>0?wake(F.fonsDuration(v-1))+tau:null;
 const op=+(flags.find(f=>f.startsWith('op='))||'op=25').slice(3);
 const o={variant:v,t,tau,prevTau,stim:F.FONS_STIM,sea:sea+tau,dark:wait?.85:0,background:flags.includes('none')?'none':flags.includes('dim')?'dim':'full',opacity:op,base:flags.includes('white')?'white':'black',done:wait&&v===F.FONS_N-1,scale:1};
 const t0=performance.now();c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);const ok=F.drawFons(c,cv.width,cv.height,o);
 return {ok,ms:performance.now()-t0,url:cv.toDataURL('image/jpeg',.9)};};`});
const files=[];
for(const spec of specs){const [I,T,...flags]=spec.split(',');const r=await page.evaluate(([I,T,f])=>frame(I,T,f),[+I,+T,flags]);
 const name=`${out}/selva_${String(I).padStart(2,'0')}_${(+T).toFixed(2)}${flags.length?'_'+flags.join('_'):''}.jpg`;writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);
 console.log(name,r.ok?'':'NOT DRAWN',r.ms.toFixed(0)+' ms');}
if(process.env.SHEET&&files.length){const cols=Math.min(4,files.length),w=480,h=Math.round(480*H/W);
 execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...files.flatMap(f=>['-i',f]),'-filter_complex',`${files.map((_,i)=>`[${i}]scale=${w}:${h}[s${i}]`).join(';')};${files.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_,i)=>`${(i%cols)*w}_${Math.floor(i/cols)*h}`).join('|')}${files.length===1?'':''}`,out+'/'+process.env.SHEET]);}
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

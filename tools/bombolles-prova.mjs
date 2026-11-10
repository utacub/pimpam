// Bombolles sense pes: the style trial. Runs the real engine (dist/bombolles-*.js) in Chromium with a fixed sequence of presses (the
// whole arc of a stimulus: black, arrival, growth, the full moment, the way out, black) at a fixed step, and writes still frames.
// Usage: node tools/bombolles-prova.mjs OUTDIR sabo|plasma|… [W H DPR] [lap]      (env BMB_SHOTS='[["name",seconds],…]', BMB_GAP, BMB_SEED)
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
// the stimuli: name → the prefix of its functions (xNew, xPress, xStep, xDraw, xCover, xEmptyNow) and its module
export const BMB_STIMS={sabo:['sbo','sabo'],plasma:['pla','plasma'],aigua:['aig','aigua'],fum:['fum','fum'],ferro:['fer','ferro'],oli:['oli','oli'],nebulosa:['neb','nebulosa']};
import {existsSync} from 'node:fs';
const have=Object.entries(BMB_STIMS).filter(([,v])=>existsSync(root+'dist/bombolles-'+v[1]+'.js'));
export const BMB_MODULES=['bombolles-shaders.js','bombolles-motor.js',...have.map(([,v])=>'bombolles-'+v[1]+'.js')];
export function bmbSource(){const code=BMB_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export \{[^}]+\};$/gm,'').replace(/^export\s+(?=(const|let|function|class)\b)/gm,'');
 return '(()=>{'+code+'\nwindow.BM={BMB,bmbSetup,bmbCanvas,bmbBegin,bmbEnd,bmbRopeReset,stim:{'+have.map(([n,[x]])=>`${n}:{nou:${x}New,prem:${x}Press,pas:${x}Step,pinta:${x}Draw,cobert:${x}Cover,buit:${x}EmptyNow}`).join(',')+'}};})();';}
// the times of the presses of the trial: one every `gap` seconds, the full moment kept longer
export function bmbPressTimes(P=8,gap=6,full=12){const t=[];let x=.5;for(let k=1;k<=P;k++){t.push(x);x+=k===P-1?full:gap;}return t;}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const [out,stim='sabo',W0='1280',H0='720',D0='2',lap='0']=process.argv.slice(2),W=+W0,H=+H0,dpr=+D0;mkdirSync(out,{recursive:true});
 const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:dpr});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.text());});
 await page.setContent('<!doctype html><html><body style="margin:0;background:#000"></body></html>');await page.addScriptTag({content:bmbSource()});
 const P=+(process.env.BMB_PRESSES||8),gap=+(process.env.BMB_GAP||6),times=bmbPressTimes(P,gap),seed=+(process.env.BMB_SEED||11);
 const ok=await page.evaluate(([W,H,dpr,stim,lap,seed,P])=>{const B=window.BM;if(!B.bmbSetup(W*dpr,H*dpr))return false;const cv=B.bmbCanvas();cv.style.width=W+'px';cv.style.height=H+'px';cv.style.display='block';document.body.appendChild(cv);
  window.ST=B.stim[stim];window.S=window.ST.nou({seed,lap,AR:W/H,presses:P});window.kNext=0;return true;},[W,H,dpr,stim,+lap,seed,P]);
 if(!ok){console.log('no WebGL2',errors);await browser.close();process.exit(1);}
 const end=times[P-1]+12,shots=process.env.BMB_SHOTS?JSON.parse(process.env.BMB_SHOTS):[['01_arribada',times[0]+4.5],['02_creixement',times[Math.min(P-3,3)]+4.5],['03_ple',times[P-2]+9],['04_sortida',times[P-1]+3.2],['05_negre',end]];
 let t=0;const t1=Date.now();
 for(const [name,at] of shots){
  const res=await page.evaluate(([t,at,times])=>{const B=window.BM,S=window.S,ST=window.ST,dt=1/60;let x=t;const t0=performance.now();
   while(x<at-1e-6){if(window.kNext<times.length&&x>=times[window.kNext]-1e-6){ST.prem(S,window.kNext+1,times.length);window.kNext++;}ST.pas(S,dt);x+=dt;}
   B.bmbBegin(x);B.bmbRopeReset();ST.pinta(S);B.bmbEnd(S.post||{});B.BMB.gl.finish();const ev={};for(const e of S.ev)ev[e.type]=(ev[e.type]||0)+1;
   return {x,ms:performance.now()-t0,cover:ST.cobert(S),buit:ST.buit(S),k:window.kNext,ev,n:(S.b||S.n||[]).length};},[t,at,times]);
  t=res.x;const buf=await page.screenshot({type:'jpeg',quality:92,timeout:900000});writeFileSync(`${out}/${name}.jpg`,buf);console.log(name,'t',t.toFixed(2),'press',res.k,'cobert',res.cover.toFixed(2),'buit',res.buit,'n',res.n,'ms',res.ms.toFixed(0),JSON.stringify(res.ev));}
 console.log('total s',((Date.now()-t1)/1000).toFixed(1));if(errors.length)console.log('ERRORS',errors.slice(0,8).join('\n'));await browser.close();}

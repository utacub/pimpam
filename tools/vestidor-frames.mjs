// Review tool for El vestidor fantàstic (EN06, 0.73): still frames of the board and of the effects through the real modules
// (scan-catalog.js, scan-art.js, vestidor-art.js), served from dist/ over http so that the pictures load as in the app.
// Usage: node tools/vestidor-frames.mjs OUTDIR WIDTH HEIGHT DPR "kind,round,picks,a,b[,flags]" ...
//   board,ROUND,PICKS,FOCUS,CLOCK[,flags]     the board at rest (PICKS: ids joined by +, or -; FOCUS: index of the card in focus, -1 none)
//   result,ROUND,PICKS,CHOSEN,T[,flags]       the card CHOSEN is picked, T seconds into the effect (the last pick: the show)
//   flags (joined by +): dim none white n2 n4 steps3 nodesp curt llarg waiting first=hug made=r:cap.cos.peus.obj/…
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {extname,join} from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url)),dist=join(root,'dist');
const TYPES={'.js':'text/javascript','.webp':'image/webp','.html':'text/html','.mp3':'audio/mpeg','.json':'application/json','.css':'text/css','.png':'image/png'};
export function serve(){return new Promise(ok=>{const srv=createServer((q,r)=>{const p=join(dist,decodeURIComponent(q.url.split('?')[0]));if(!p.startsWith(dist)||!existsSync(p)){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TYPES[extname(p)]||'application/octet-stream'});r.end(readFileSync(p));});srv.listen(0,'127.0.0.1',()=>ok(srv));});}
const PAGE=`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c"></canvas><script type="module">
import {createScanState,scanContent,scanChoices} from './scan-catalog.js';
import {renderScanActivity} from './scan-art.js';
import {defaults} from './input.js';
import {vsLoad,vsLayout} from './vestidor-art.js';
import {vsSteps,vsTimes,vsSlotOf} from './vestidor.js';
window.VSF={settings(flag){const F=(flag||'').split('+'),has=t=>F.includes(t),get=k=>(F.find(x=>x.startsWith(k+'='))||'').split('=')[1];
  return {...defaults,scanOptions:has('n2')?2:has('n4')?4:3,vsSteps:has('steps3')?'3':'4',vsDespistes:!has('nodesp'),vsNumber:has('curt')?'curt':has('llarg')?'llarg':'normal',vsFirst:get('first')||'rita',background:has('none')?'none':has('dim')?'dim':'full',base:has('white')?'white':'black',opacity:25};},
 async load(flag,round){const s=VSF.settings(flag);let n=0;while(n++<600){let a=1;for(let r=Math.max(0,round-3);r<=round+1;r++)a=Math.min(a,vsLoad(s,r));if(a>=1)break;await new Promise(r=>setTimeout(r,50));}return n;},
 paint(o){const cv=document.getElementById('c'),dpr=o.dpr,w=o.w,h=o.h;if(cv.width!==w*dpr){cv.width=w*dpr;cv.height=h*dpr;cv.style.width=w+'px';cv.style.height=h+'px';}const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);
  const F=(o.flag||'').split('+'),s=VSF.settings(o.flag),st=createScanState('vestidor',s);st.round=o.round;st.armed=true;
  const picks=o.picks==='-'?[]:o.picks.split('+');st.picks=picks.map(v=>({id:'x-'+v,value:v}));st.stage=picks.length;
  const content=scanContent(st,s),made={};for(const m of (F.find(x=>x.startsWith('made='))||'made=').slice(5).split('/').filter(Boolean)){const [r,l]=m.split(':'),p=l.split('.');made[+r]={cap:p[0],cos:p[1],peus:p[2],objecte:p[3]||null};}
  const game={item:{id:'vestidor'},scanState:st,time:null,vsMade:made,board:{clock:o.clock??3.2,lights:content.map((_,i)=>i===o.a?1:.6),focus:o.a>=0?o.a:undefined,wait:F.includes('waiting')?1:0}};
  if(o.kind==='result'){const forced=(F.find(x=>x.startsWith('pick='))||'').split('=')[1];const opt=forced?{id:vsSlotOf(st,s)+'-'+forced,label:forced,kind:'vestidor',value:forced}:(content[o.a]||content[0]);const final=st.stage>=vsSteps(s)-1;st.pending={option:opt,correct:true,final};st.status='effect';game.time=o.b;game.board.focus=undefined;}
  else game.board.clock=o.b??3.2;if(o.clock===0)game.board.clock=0;
  const t0=performance.now();renderScanActivity(c,w,h,'vestidor',game,s);return {ms:performance.now()-t0,options:content.map(x=>x.value),slot:vsSlotOf(st,s),times:vsTimes(s,st)};}};
window.READY=true;
</script></body></html>`;
export async function openVs(width,height,dpr=1){const srv=await serve(),port=srv.address().port;writeFileSync(join(dist,'_vs_frames.html'),PAGE);
 const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(`http://127.0.0.1:${port}/_vs_frames.html`);await page.waitForFunction(()=>window.READY===true);
 return {page,browser,errors,close:async()=>{await browser.close();srv.close();try{(await import('node:fs')).unlinkSync(join(dist,'_vs_frames.html'));}catch{}}};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,D,...specs]=process.argv.slice(2);mkdirSync(out,{recursive:true});const w=+W,h=+H,dpr=+D||1;const V=await openVs(w,h,dpr);
 for(const spec of specs){const [kind,round,picks,a,b,flag]=spec.split(',');const o={kind,round:+round,picks,a:+a,b:b===undefined?null:+b,flag:flag||'',w,h,dpr};
  await V.page.evaluate(([f,r])=>VSF.load(f,r),[o.flag,o.round]);
  // two paints: the first one starts the compositions (they are cached), the second one is the frame
  await V.page.evaluate(o=>VSF.paint({...o,clock:0,b:o.kind==='board'?0:o.b}),o);await V.page.waitForTimeout(60);const info=await V.page.evaluate(o=>VSF.paint(o),o);
  const name=spec.replace(/[^a-z0-9.+=-]+/gi,'_')+'.png';await V.page.locator('#c').screenshot({path:join(out,name)});console.log(name,JSON.stringify(info));}
 if(V.errors.length)console.log('ERRORS',V.errors.join('\n'));await V.close();}

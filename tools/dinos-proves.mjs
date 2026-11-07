// El pou del temps (CE37), style tests: draws the test picture (production/dinos_proves/*.glsl) in a browser page with WebGL2, as JPEG
// frames, and makes the test videos. Without a GPU (as here) the browser draws WebGL in software: the times say nothing of a device.
// The video: the press at 0 s goes down through the rock to the mammoths (2 s of travelling, the fossil wakes); the press at 14 s goes
// down through the end of the Cretaceous to the tyrannosaurs; at 28 s the stimulus ends and the picture stops and darkens.
// Usage:
//   node tools/dinos-proves.mjs frames OUTDIR W H SPEC ...    SPEC = STYLE,T[,dim|none|white|op=N]   STYLE A, B or C; T video seconds
//   node tools/dinos-proves.mjs video OUT.mp4 W H STYLE [FPS] [FROM] [TO]   (JOBS=n workers; AUDIO=file.wav to mux)
// With SHEET=name.jpg (frames), also a contact sheet (4 columns).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync,rmSync,readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const SRC=['common','rock','mamut','trex','main'].map(n=>readFileSync(root+'production/dinos_proves/'+n+'.glsl','utf8')).join('\n');
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const wake=t=>{if(t<=0)return 0;const u=Math.min(1,t/.6);return t<.6?.6*(u*u*u-u*u*u*u/2):t-.3;};
const ease=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
export const END=28,WAIT=1.5;
// The state of the picture at video time T.
export function state(T){const Tf=Math.min(T,END);
 let camY,move=0;if(Tf<2){camY=2.2*(1-ease(Tf/2));move=Math.sin(Math.PI*Tf/2);}else if(Tf<14)camY=0;else if(Tf<16){camY=-2.2*ease((Tf-14)/2);move=Math.sin(Math.PI*(Tf-14)/2);}else camY=-2.2;
 const life0=ss(1.6,3.8,Tf)*(1-ss(14,15,Tf)),life1=ss(15.6,17.8,Tf);
 return {camY,move,tau:[wake(Tf),wake(Tf-14)],life:[life0,life1],dark:T>END?.85*ss(0,.6,T-END):0};}
const STY={A:0,B:1,C:2};
// The passes of a frame: 0 the rock, 1 and 2 the fossils, 3 and 4 the windows of life (each one a program of its own, for its style
// and pass only, drawn inside a scissor box round what it can touch). JS decides what to draw.
const SCY=[0,-2.2],CW=[[.08,0],[.02,0]],FOSB=[[-.80,.50,-.34,.24],[-.82,1.0,-.34,.22]];
export function plan(o,W,H){const A=W/H,passes=[];const R=k=>1.30*ss(0,.62,o.life[k]);
 const box=(x0,x1,y0,y1)=>{const X0=Math.max(0,Math.floor((x0/1+A/2)*H)),X1=Math.min(W,Math.ceil((x1+A/2)*H)),Y0=Math.max(0,Math.floor((y0-o.camY+.5)*H)),Y1=Math.min(H,Math.ceil((y1-o.camY+.5)*H));
  return X1>X0&&Y1>Y0?[X0,Y0,X1-X0,Y1-Y0]:null;};
 // does a window cover the whole screen?
 let covered=false;for(const k of [0,1]){const c=[CW[k][0],CW[k][1]+SCY[k]];let far=0;for(const sx of [-A/2,A/2])for(const sy of [-.5,.5]){const dx=sx-c[0],dy=(sy+o.camY-c[1])*1.15;far=Math.max(far,Math.hypot(dx,dy));}
  if(o.life[k]>0&&R(k)-.05>far)covered=true;}
 if(!covered){passes.push([0,[0,0,W,H]]);
  for(const k of [0,1]){if(o.life[k]>=.62)continue;const b=FOSB[k];const r=box(b[0],b[1],b[2]+SCY[k],b[3]+SCY[k]);if(r)passes.push([1+k,r]);}}
 for(const k of [0,1]){if(o.life[k]<=0)continue;const r0=R(k)+.07,c=[CW[k][0],CW[k][1]+SCY[k]];const r=box(c[0]-r0,c[0]+r0,c[1]-r0/1.15,c[1]+r0/1.15);if(r)passes.push([3+k,r]);}
 return passes;}
async function openPage(W,H){
 const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type())&&!/GPU stall/.test(m.text()))errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
 await page.evaluate(src=>{const cv=document.getElementById('c');const gl=cv.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,premultipliedAlpha:true,alpha:false});
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const progs={};
  const prog=(style,pass)=>{const key=style+'_'+pass;if(progs[key])return progs[key];const fs=src.replace('precision highp float;',`precision highp float;\n#define STYLE ${style}\n#define PASS ${pass}`);
   const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
   gl.bindAttribLocation(pr,0,'a');gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
   const U={};for(const n of ['uR','uCamY','uTau','uLife','uStyle','uDecor','uOpacity','uBase','uDark','uMove'])U[n]=gl.getUniformLocation(pr,n);return progs[key]={pr,U};};
  window.draw=(o,passes)=>{const t0=performance.now();gl.viewport(0,0,cv.width,cv.height);gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);
   const per=[];
   for(const [pass,r] of passes){const t1=performance.now();const {pr,U}=prog(o.style,pass);gl.useProgram(pr);gl.scissor(r[0],r[1],r[2],r[3]);
    if(pass===0)gl.disable(gl.BLEND);else{gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);}
    gl.uniform2f(U.uR,cv.width,cv.height);gl.uniform1f(U.uCamY,o.camY);gl.uniform2f(U.uTau,o.tau[0],o.tau[1]);
    gl.uniform2f(U.uLife,o.life[0],o.life[1]);gl.uniform1f(U.uDecor,o.decor);gl.uniform1f(U.uOpacity,o.opacity);gl.uniform1f(U.uBase,o.base);
    gl.uniform1f(U.uDark,o.dark);gl.uniform1f(U.uMove,o.move);gl.drawArrays(gl.TRIANGLES,0,3);const px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);per.push(pass+':'+(performance.now()-t1).toFixed(0));}
   const ms=performance.now()-t0;return {ms,per:per.join(' '),url:cv.toDataURL('image/jpeg',.92)};};},SRC).catch(e=>{console.error(String(e).split('\n').slice(0,30).join('\n'));process.exit(1);});
 // compile every program first (so the times below are drawing only)
 for(const st of [0,1,2])for(const ps of [0,1,2,3,4])await page.evaluate(([st,ps])=>{window.draw({style:st,camY:9,tau:[0,0],life:[0,0],decor:0,opacity:.25,base:0,dark:0,move:0},[[ps,[0,0,1,1]]]);},[st,ps]).catch(e=>{console.error(String(e).split('\n').slice(0,30).join('\n'));process.exit(1);});
 return {browser,page,errors};}
const render=async(page,o,W,H)=>page.evaluate(([o,p])=>draw(o,p),[o,plan(o,W,H)]);
const flagsTo=(flags)=>({decor:flags.includes('none')?2:flags.includes('dim')?1:0,opacity:+(flags.find(f=>f.startsWith('op='))||'op=25').slice(3)/100,base:flags.includes('white')?1:0});
const [mode,...args]=process.argv.slice(2);
if(mode==='frames'){const [out,wA,hA,...specs]=args;const W=+wA,H=+hA;mkdirSync(out,{recursive:true});const {browser,page,errors}=await openPage(W,H);const files=[];
 for(const spec of specs){const [S,T,...flags]=spec.split(',');const o={...state(+T),style:STY[S],...flagsTo(flags)};const r=await render(page,o,W,H);
  const name=`${out}/dinos_${S}_${(+T).toFixed(2)}${flags.length?'_'+flags.join('_'):''}.jpg`;writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);console.log(name,r.ms.toFixed(0)+' ms','['+r.per+']');}
 if(process.env.SHEET&&files.length>1){const cols=Math.min(4,files.length),w=480,h=Math.round(480*H/W);
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...files.flatMap(f=>['-i',f]),'-filter_complex',`${files.map((_,i)=>`[${i}]scale=${w}:${h}[s${i}]`).join(';')};${files.map((_,i)=>`[s${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_,i)=>`${(i%cols)*w}_${Math.floor(i/cols)*h}`).join('|')}:fill=black`,out+'/'+process.env.SHEET]);}
 console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();}
else if(mode==='worker'){const [dir,wA,hA,S,fps,from,i0,i1,flagStr]=args;const W=+wA,H=+hA;const {browser,page,errors}=await openPage(W,H);let tot=0,n=0;const flags=flagStr?flagStr.split(':'):[];
 for(let i=+i0;i<+i1;i++){const T=+from+i/+fps;const o={...state(T),style:STY[S],...flagsTo(flags)};const r=await render(page,o,W,H);tot+=r.ms;n++;
  writeFileSync(`${dir}/f${String(i).padStart(5,'0')}.jpg`,Buffer.from(r.url.split(',')[1],'base64'));}
 writeFileSync(`${dir}/ms_${i0}.json`,JSON.stringify({n,tot,errors}));await browser.close();}
else if(mode==='video'){const [out,wA,hA,S,fps='30',from='0',to=String(END+WAIT),flagStr='']=args;const jobs=+(process.env.JOBS||3);const dir=out+'.frames';rmSync(dir,{recursive:true,force:true});mkdirSync(dir,{recursive:true});
 const N=Math.round((+to-+from)*+fps);const per=Math.ceil(N/jobs);const t0=Date.now();
 await Promise.all([...Array(jobs).keys()].map(j=>new Promise((res,rej)=>{const p=spawn(process.execPath,[fileURLToPath(import.meta.url),'worker',dir,wA,hA,S,fps,from,String(j*per),String(Math.min(N,(j+1)*per)),flagStr],{stdio:'inherit'});p.on('exit',c=>c?rej(new Error('worker '+c)):res());})));
 let tot=0,n=0,errs=[];for(const f of readdirSync(dir).filter(f=>f.startsWith('ms_'))){const m=JSON.parse(readFileSync(dir+'/'+f));tot+=m.tot;n+=m.n;errs.push(...m.errors);}
 const a=['-hide_banner','-loglevel','error','-y','-framerate',fps,'-i',dir+'/f%05d.jpg'];if(process.env.AUDIO)a.push('-ss',from,'-i',process.env.AUDIO);
 a.push('-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium');if(process.env.AUDIO)a.push('-c:a','aac','-b:a','192k','-shortest');a.push(out);execFileSync('ffmpeg',a);
 console.log(out,N,'frames',`mean draw ${(tot/n).toFixed(0)} ms (software GL)`,`wall ${((Date.now()-t0)/1000).toFixed(0)} s`,'errors',errs.length?errs.join('; '):'none');
 if(!process.env.KEEP)rmSync(dir,{recursive:true,force:true});}
else{console.log('usage: see the head of the file');}

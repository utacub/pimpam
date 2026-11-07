// Gegants del blau (CE38), style tests: draws a test scene (production/gegants_proves/*.glsl) in a browser page with WebGL2, as JPEG
// stills. Without a GPU (as here) the browser draws WebGL in software: the times say nothing of a device.
// Usage: node tools/gegants-proves.mjs OUTDIR W H SPEC ...   SPEC = SCENE,STYLE,T[,dim|none|white|op=N]  (SCENE 11 or 20; STYLE A, B, C;
// T scene seconds since the press; view=X:Y:VH overrides the camera, for review). With SHEET=name.jpg, also a contact sheet (COLS columns, default 3).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const rd=n=>readFileSync(root+'production/gegants_proves/'+n+'.glsl','utf8');
const STY={A:0,B:1,C:2};
const [out,wA,hA,...specs]=process.argv.slice(2);const W=+wA,H=+hA;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type())&&!/GPU stall/.test(m.text()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.evaluate(()=>{const cv=document.getElementById('c');const gl=cv.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,alpha:false});
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 const progs={};
 window.prog=(key,fs)=>{if(progs[key])return progs[key];const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));
  gl.bindAttribLocation(pr,0,'a');gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const U={};for(const n of ['uR','uT','uDecor','uOpacity','uBase','uDark','uView'])U[n]=gl.getUniformLocation(pr,n);return progs[key]={pr,U};};
 window.draw=(key,o)=>{const t0=performance.now();const {pr,U}=progs[key];gl.viewport(0,0,cv.width,cv.height);gl.useProgram(pr);
  gl.uniform2f(U.uR,cv.width,cv.height);gl.uniform1f(U.uT,o.T);gl.uniform1f(U.uDecor,o.decor);gl.uniform1f(U.uOpacity,o.opacity);gl.uniform1f(U.uBase,o.base);gl.uniform1f(U.uDark,o.dark);gl.uniform3f(U.uView,o.view[0],o.view[1],o.view[2]);
  gl.drawArrays(gl.TRIANGLES,0,3);const px=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return {ms:performance.now()-t0,url:cv.toDataURL('image/jpeg',.92)};};});
const files=[];
for(const spec of specs){const [S,St,T,...flags]=spec.split(',');const key=S+St;
 const src=[rd('common'),rd('scene'+S),rd('main')].join('\n').replace('precision highp float;',`precision highp float;\n#define STYLE ${STY[St]}\n#define SCENE ${S}`);
 const t0=Date.now();await page.evaluate(([k,s])=>{prog(k,s);},[key,src]).catch(e=>{console.error(String(e).split('\n').slice(0,40).join('\n'));process.exit(1);});const tc=Date.now()-t0;
 const o={T:+T,decor:flags.includes('none')?2:flags.includes('dim')?1:0,opacity:+(flags.find(f=>f.startsWith('op='))||'op=25').slice(3)/100,base:flags.includes('white')?1:0,dark:+(flags.find(f=>f.startsWith('dark='))||'dark=0').slice(5),view:(flags.find(f=>f.startsWith('view='))||'view=0:0:0').slice(5).split(':').map(Number)};
 const r=await page.evaluate(([k,o])=>draw(k,o),[key,o]);
 const name=`${out}/gegants_${S}_${St}_${(+T).toFixed(2)}${flags.length?'_'+flags.join('_'):''}.jpg`;writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);
 console.log(name,'draw',r.ms.toFixed(0)+' ms',tc>50?'(compile '+tc+' ms)':'');}
if(process.env.SHEET&&files.length>1){const cols=Math.min(+(process.env.COLS||3),files.length),w=640,h=Math.round(640*H/W);
 execFileSync('python3',['-c',`
import sys
from PIL import Image
fs=sys.argv[3:];cols=int(sys.argv[1]);w,h=${w},${h}
rows=(len(fs)+cols-1)//cols;S=Image.new('RGB',(cols*w+(cols-1)*6,rows*h+(rows-1)*6),(20,20,20))
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((w,h),Image.LANCZOS);S.paste(im,((i%cols)*(w+6),(i//cols)*(h+6)))
S.save(sys.argv[2],quality=90)`,String(cols),out+'/'+process.env.SHEET,...files]);console.log('sheet',out+'/'+process.env.SHEET);}
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await browser.close();

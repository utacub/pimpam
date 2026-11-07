// Pinta el món (EN25), style tests: the valley in spring, as JPEG stills, with the watercolour in WebGL2 (production/pinta/aquarel.js)
// and the ink in Canvas 2D (production/pinta/tinta.js). Without a GPU the browser draws WebGL in software.
// Usage: node tools/pinta-proves.mjs OUTDIR W H SPEC ...   SPEC = STYLE,p0:p1:p2:p3:p4:p5[,dim|none|white|op=N]  (STYLE A, B, C; p = progress
// of each zone 0..1: cel, fons, aigua, arbres, poble, camp). With SHEET=name.jpg, also a contact sheet (COLS columns, default 3).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const src=n=>readFileSync(root+'production/pinta/'+n+'.js','utf8').replace(/^export (const|function|let)/gm,'$1').replace(/^export \{[^}]*\};?$/gm,'');
export const STYLES={
 A:{name:'Quadern de viatge',dens:.62,edge:.75,gran:.12,bleed:0,grain:.9,bloom:.5,glaze:0,warm:.25,ink:{width:.8,tremor:.9,alpha:.9,gaps:0,pool:.8}},
 B:{name:'Il·lustració d’àlbum',dens:.78,edge:.9,gran:.26,bleed:0,grain:1,bloom:.5,glaze:1,warm:.35,ink:{width:1.35,tremor:.5,alpha:.94,gaps:0,pool:.3}},
 D:{name:'Producció (B + línia A)',dens:.78,edge:.9,gran:.26,bleed:0,grain:1,bloom:.5,glaze:1,warm:.35,ink:{width:1.1,tremor:.7,alpha:.92,gaps:0,pool:.5}},
 C:{name:'Aiguada lliure',dens:.8,edge:.6,gran:.18,bleed:1,grain:.7,bloom:1.1,glaze:1,warm:.1,ink:{width:.85,tremor:.7,alpha:.82,gaps:.45,pool:.9}}};
const [out,wA,hA,...specs]=process.argv.slice(2);const W=+wA,H=+hA;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type())&&!/GPU stall/.test(m.text()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:src('dibuix')+'\n'+src('vall')+'\n'+src('aquarel')+'\n'+src('tinta')+`
window.setup=()=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),W=cv.width,H=cv.height;const g=document.createElement('canvas');g.width=W;g.height=H;
 const gl=g.getContext('webgl2',{antialias:false,preserveDrawingBuffer:true,alpha:false});const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 const s=Math.max(W/SHEET[0],H/SHEET[1]),map=[s,s,(W-SHEET[0]*s)/2,(H-SHEET[1]*s)/2];
 const ink=inkVall();const zones=ZONES.map(z=>({...z,polys:[z.poly,...(ink.sils[z.id]||[])],accents:ink.accents[z.id]||[]}));const ic=document.createElement('canvas');ic.width=W;ic.height=H;const icx=ic.getContext('2d');
 const masks=aqMasks(zones,W,H,map,Math.max(4,6*s));const tex={M:masks.M.map(x=>aqTexture(gl,x)),B:masks.B.map(x=>aqTexture(gl,x)),A:masks.A.map(x=>aqTexture(gl,x))};
 const P=aqProgram(gl);window.S={cv,c,W,H,g,gl,map,ink,zones,tex,P,ic,icx};};
window.render=(style,prog,o)=>{const S=window.S,t0=performance.now();aqDraw(S.gl,S.P,S.tex,{W:S.W,H:S.H,map:S.map,zones:S.zones,prog,style,decor:o.decor,base:o.base,t:0});
 S.c.setTransform(1,0,0,1,0,0);S.c.drawImage(S.g,0,0);const dark=o.decor==='none'&&o.base!=='white';
 S.icx.setTransform(1,0,0,1,0,0);S.icx.clearRect(0,0,S.W,S.H);inkDraw(S.icx,S.ink.strokes,S.map,{...style.ink,ink:dark?[232,222,200]:[52,36,24]},3);S.c.drawImage(S.ic,0,0);return {ms:performance.now()-t0,url:S.cv.toDataURL('image/jpeg',.92)};};`});
const se=await page.evaluate(()=>{try{setup();return null;}catch(e){return e.stack;}});if(se){console.error(se);process.exit(1);}
const files=[];
for(const spec of specs){const [St,pr,...flags]=spec.split(',');const style=STYLES[St];if(!style){console.error('estil?',St);continue;}
 const prog=pr.split(':').map(Number);const o={decor:flags.includes('none')?'none':flags.includes('dim')?'dim':'full',base:flags.includes('white')?'white':'black'};
 const r=await page.evaluate(([style,prog,o])=>render(style,prog,o),[style,prog,o]);
 const name=`${out}/pinta_${St}_${prog.join('')}${flags.length?'_'+flags.join('_'):''}.jpg`;writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);console.log(name,'draw',r.ms.toFixed(0)+' ms');}
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

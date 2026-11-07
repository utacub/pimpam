// El viatge en globus (CE43), style tests: the valley from the balloon as JPEG stills (Canvas 2D in headless Chromium).
// Usage: node tools/globus-proves.mjs OUTDIR W H SPEC ...   SPEC = STYLE,MOMENT,ALT[,none|dim|white|tren|ovelles|wave|look|noburn|fitxa]
// STYLE A, B, C; MOMENT alba, migdia, posta, nit; ALT 0..1. With SHEET=name.jpg, also a contact sheet (COLS columns, default 3).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const src=n=>readFileSync(root+'production/globus/'+n+'.js','utf8').replace(/^export (const|function|let)/gm,'$1').replace(/^export \{[^}]*\};?$/gm,'');
const [out,wA,hA,...specs]=process.argv.slice(2);const W=+wA,H=+hA;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch();
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:src('pinzell')+'\n'+src('globus')+'\n'+src('escena')+`
window.render=(spec)=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),W=cv.width,H=cv.height;const t0=performance.now();
 const k=Math.max(W/SHEET[0],H/SHEET[1]);c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.setTransform(k,0,0,k,(W-SHEET[0]*k)/2,(H-SHEET[1]*k)/2);
 const style=STYLES[spec.style];
 if(spec.fitxa)paintSheet(c,SHEET[0],SHEET[1],style);else paintScene(c,SHEET[0],SHEET[1],{moment:spec.moment,alt:spec.alt,style,decor:spec.decor,base:spec.base,scene:spec.scene,pose:spec.pose,burn:spec.burn});
 return {ms:performance.now()-t0,url:cv.toDataURL('image/jpeg',.92)};};`});
const files=[];
for(const spec of specs){const [St,moment,altS,...flags]=spec.split(',');if(!['A','B','C'].includes(St)){console.error('estil?',St);continue;}
 const o={style:St,moment:moment||'migdia',alt:Number(altS||.5),decor:flags.includes('none')?'none':flags.includes('dim')?'dim':'full',base:flags.includes('white')?'white':'black',
  scene:flags.includes('ovelles')?'ovelles':'tren',pose:flags.includes('wave')?'wave':flags.includes('look')?'look':'point',burn:flags.includes('noburn')?false:flags.includes('burn')?true:null,fitxa:flags.includes('fitxa')};
 const r=await page.evaluate(spec=>{try{return render(spec);}catch(e){return {err:e.stack};}},o);if(r.err){console.error(spec,'\n',r.err);continue;}
 const name=`${out}/globus_${St}_${o.moment}_${Math.round(o.alt*100)}${flags.length?'_'+flags.join('_'):''}.jpg`;writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);console.log(name,'draw',r.ms.toFixed(0)+' ms');}
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

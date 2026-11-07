// Estiu a la masia (EN26), style tests: the panorama and the sets as JPEG stills (Canvas 2D in headless Chromium).
// Usage: node tools/masia-proves.mjs OUTDIR W H SPEC ...   SPEC = PART,HOUR[,zoom=K,cx=X,cy=Y,nofore,novig,lights=L,wave=W,name=N]
// PART tauler | cuina | fitxa | sky | far ...; HOUR 0..1 (0 morning, .36 noon, .7 afternoon, 1 dusk). SHEET=name.jpg makes a contact sheet (COLS).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODS=(process.env.MODS||'masia-pinzell,masia-natura,masia-decorats').split(',');
const src=n=>readFileSync(root+'dist/'+n+'.js','utf8').replace(/^import [^;]*;$/gm,'').replace(/^export (const|function|let|class)/gm,'$1').replace(/^export \{[^}]*\};?$/gm,'');
const [out,wA,hA,...specs]=process.argv.slice(2);const W=+wA,H=+hA;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch();
const page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:MODS.map(src).join('\n')+`
window.render=(spec)=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),W=cv.width,H=cv.height;const t0=performance.now();
 const [SW,SH]=MS_SHEET;const k=Math.max(W/SW,H/SH)*(spec.zoom||1);c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,W,H);
 const cx=spec.cx??SW/2,cy=spec.cy??SH/2;c.setTransform(k,0,0,k,W/2-cx*k,H/2-cy*k);
 const L=mpHour(spec.hour);const o={fore:!spec.nofore,vignette:!spec.novig,lights:spec.lights,wave:spec.wave??.35};
 if(typeof window.renderPart==='function'&&window.renderPart(spec.part,c,L,o,spec))return {ms:performance.now()-t0,url:cv.toDataURL('image/jpeg',.92)};
 if(spec.part==='tauler')mdPanorama(c,L,o);
 else if(spec.part==='sky'){mdSky(c,L,o);mdFar(c,L);}
 else if(spec.part==='mid'){mdSky(c,L,o);mdFar(c,L);mdMid(c,L,o);}
 else if(spec.part==='casa'){mdSky(c,L,o);mdFar(c,L);mdMid(c,L,o);mdHouse(c,L,o);mdFig(c,L);}
 else throw new Error('part? '+spec.part);
 return {ms:performance.now()-t0,url:cv.toDataURL('image/jpeg',.92)};};`+(process.env.EXTRA?readFileSync(process.env.EXTRA,'utf8'):'')});
const files=[];
for(const spec of specs){const [part,hourS,...flags]=spec.split(',');const o={part,hour:Number(hourS||.36)};
 for(const f of flags){const [k,v]=f.split('=');if(v===undefined)o[k]=true;else o[k]=isNaN(+v)?v:+v;}
 const r=await page.evaluate(spec=>{try{return render(spec);}catch(e){return {err:e.stack};}},o);if(r.err){console.error(spec,'\n',r.err);continue;}
 const name=`${out}/${o.name||('masia_'+part+'_'+Math.round(o.hour*100)+(flags.filter(f=>!f.startsWith('name=')).length?'_'+flags.filter(f=>!f.startsWith('name=')).join('_').replace(/[=.]/g,''):''))}.jpg`;
 writeFileSync(name,Buffer.from(r.url.split(',')[1],'base64'));files.push(name);console.log(name,'draw',r.ms.toFixed(0)+' ms');}
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

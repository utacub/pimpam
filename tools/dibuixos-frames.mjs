// Review tool for Dibuixos que ballen (CE32, 0.25), Joguines que ballen (CE33) and La cuina que balla (CE34, 0.26): renders still
// frames as JPEG files and reports the drawing time of each.
// Usage: node tools/dibuixos-frames.mjs OUTDIR WIDTH HEIGHT SPEC ...
//   INDEX,T[,FLAG...]   drawing INDEX (0–19) T seconds after the press. FLAGs: slow, still, reduced, white (base), dim, full (decor),
//                       yellow, red, whiteline (colour of the line), d=SECONDS (duration, 10 by default), set=toys|kitchen (the
//                       collection; Dibuixos que ballen by default)
import {createRequire} from 'node:module';
import {readFileSync,mkdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODULES=['kaleido-base.js','sampler.js','kaleido-music.js','dibuixos-art.js','dibuixos.js','joguines-art.js','joguines.js','cuina-art.js','cuina.js'].filter(n=>existsSync(root+'dist/'+n));
const sets=['drawings:DB_SET',...(MODULES.includes('joguines.js')?['toys:JG_SET']:[]),...(MODULES.includes('cuina.js')?['kitchen:CN_SET']:[])].join(',');
const source=()=>'(()=>{'+MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class|let))/gm,'')+`\nwindow.DB={drawDibuixos,sets:{${sets}}};})();`;
const [out,wArg,hArg,...specs]=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:source()});
await page.addScriptTag({content:`window.paint=(spec)=>{const cv=document.getElementById('c'),c=cv.getContext('2d'),w=cv.width,h=cv.height,p=spec.split(','),f=new Set(p.slice(2));
 const d=[...f].find(x=>x.startsWith('d='));const o={index:+p[0],t:+p[1],duration:d?+d.slice(2):10,speed:f.has('slow')?'slow':'normal',still:f.has('still'),reduced:f.has('reduced'),base:f.has('white')?'white':'black',background:f.has('full')?'full':f.has('dim')?'dim':'none',opacity:30,color:f.has('yellow')?'yellow':f.has('red')?'red':f.has('whiteline')?'white':'own'};
 const st=[...f].find(x=>x.startsWith('set='));o.set=DB.sets[st?st.slice(4):'drawings'];
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle=o.base==='white'?'#fff':'#000';c.fillRect(0,0,w,h);const t0=performance.now();DB.drawDibuixos(c,w,h,o);c.getImageData(0,0,1,1);return performance.now()-t0;};`});
const REPEAT=+(process.env.REPEAT||0);
for(const spec of specs){let ms=await page.evaluate(s=>window.paint(s),spec);
 if(REPEAT){const t=await page.evaluate(([s,n])=>{const r=[];for(let i=0;i<n;i++){const t0=performance.now();window.paint(s);r.push(performance.now()-t0);}return r.sort((x,y)=>x-y);},[spec,REPEAT]);ms=t[t.length>>1];}
 const name=spec.replace(/[,+=]/g,'_');await page.locator('#c').screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});console.log(name,ms.toFixed(1)+' ms');}
console.log('page errors:',errors.length?errors:'none');await browser.close();

// Style sheets for La cassola d'en Glups (0.27): renders the drawing given by a script (a function body run in the page with c, w, h
// and the modules' names in scope) into a JPEG. Usage: node tools/grec-style.mjs OUT.jpg WIDTH HEIGHT SCRIPT.js [T]
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODULES=(process.env.MODULES||'kaleido-base.js,sampler.js,glass.js,paper.js,escenari.js,tauler.js,grec-art.js').split(',');
const [out,wArg,hArg,script,...ts]=process.argv.slice(2),W=+wArg,H=+hArg;
const src='(()=>{'+MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import [^;]*;$/gm,'').replace(/^export\s+(?=(const|function|class|let))/gm,'')+`\nwindow.paint=(c,w,h,T)=>{${readFileSync(script,'utf8')}};})();`;
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());else console.log('log:',m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:src});
for(const T of (ts.length?ts:['0'])){const ms=await page.evaluate(T=>{const c=document.getElementById('c').getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,c.canvas.width,c.canvas.height);const t0=performance.now();window.paint(c,c.canvas.width,c.canvas.height,+T);c.getImageData(0,0,1,1);return performance.now()-t0;},T);
 const name=ts.length>1?out.replace(/\.jpg$/,`_${T}.jpg`):out;await page.locator('#c').screenshot({path:name,type:'jpeg',quality:90});console.log(name,ms.toFixed(1)+' ms');}
console.log('page errors:',errors.length?errors:'none');await browser.close();

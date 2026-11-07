// Review tool for El vent del bosc (CE26): renders still frames as PNG files once the place is painted, and reports drawing times.
// Usage: node tools/vent-frames.mjs OUTDIR WIDTH HEIGHT "variant,press,t[,release,offset,idle]" ...
// t: seconds since the press (1000 = at rest); release: when the wind starts to calm (empty while held).
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const VENT_MODULES=['carrega.js','kaleido-base.js','glass.js','paper.js','sampler.js','escenari.js','vent.js','vent-art.js'];
export function ventSource(){const code=VENT_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.VT={drawVent,vtBusy,ventWind,ventScene,ventScore,ventPlan,VENT_SPAN};})();';}
export async function openVent(width,height){const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:ventSource()});
 await page.addScriptTag({content:`window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);const t0=performance.now();VT.drawVent(c,cv.width,cv.height,o);c.getImageData(0,0,1,1);return performance.now()-t0;};
  window.settle=async()=>{for(let i=0;i<3000&&VT.vtBusy();i++)await new Promise(r=>setTimeout(r,10));};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openVent(+W,+H);
 for(const s of specs){const [variant,press,t,release,offset,idle]=s.split(',').map(x=>x===''||x===undefined?undefined:Number(x));const o={variant,press,t,release:release??null,offset:offset??0,idle:idle??(t<1e3?t:7)};
  await page.evaluate(o=>paint(o),o);await page.evaluate(()=>settle());const ms=await page.evaluate(o=>paint(o),o);
  const png=await page.locator('#c').screenshot();const name=`${out}/vent_${variant}_${press}_${t}${release!==undefined?'_r'+release:''}.png`;writeFileSync(name,png);console.log(name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.join('\n'));await browser.close();}

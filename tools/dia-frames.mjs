// Review tool for Dia rere dia (CE09): renders still frames of the scene at chosen positions of the day, as PNG files.
// Usage: node tools/dia-frames.mjs OUTDIR WIDTH HEIGHT "phi,target,t[,idle]" ...
import {createRequire} from 'node:module';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
export const DIA_MODULES=['kaleido-base.js','glass.js','paper.js','dia.js','dia-art.js'];
export function diaSource(){const code=DIA_MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.D={drawDia,diaDay,diaScore,diaNext,diaStart,diaStatus,diaPhase,diaStops,DIA_MOMENTS};})();';}
export async function openDia(width,height){const browser=await playwright.chromium.launch({args:(process.env.DIA_BROWSER_ARGS||'').split(' ').filter(Boolean)}),page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:diaSource()});
 await page.addScriptTag({content:`window.paint=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,cv.width,cv.height);const t0=performance.now();D.drawDia(c,cv.width,cv.height,o);return performance.now()-t0;};`});
 return {browser,page,errors};}
if(import.meta.url===`file://${process.argv[1]}`){const [out,W,H,...specs]=process.argv.slice(2);const {browser,page,errors}=await openDia(+W,+H);
 for(const s of specs){const [phi,target,t,idle]=s.split(',').map(Number);const ms=await page.evaluate(o=>paint(o),{phi,target,t,idle:idle??t,quality:1});
  const png=await page.locator('#c').screenshot();const name=`${out}/dia_${String(phi).replace('-','m')}_${target}_${t}.png`;writeFileSync(name,png);console.log(name,ms.toFixed(1)+' ms');}
 if(errors.length)console.log('ERRORS',errors.join('\n'));await browser.close();}

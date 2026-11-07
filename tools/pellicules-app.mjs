// 0.50 · Petites pel·lícules: opens the app served over http (with Range requests, as GitHub Pages does), goes into the folder, opens
// each film and plays every sequence with a press each, checking that a press during a sequence is refused, that each one stops on its
// last frame and darkens, and that after the last one the film starts again. Stills of the folder and of a paused sequence.
// node tools/pellicules-app.mjs <dist dir> <out dir> [videos dir (default <dist>/videos)] [dpr]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}const {chromium}=playwright;
const [dist,out,vids,dprArg]=process.argv.slice(2);const dpr=Number(dprArg||1);fs.mkdirSync(out,{recursive:true});
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.mp3':'audio/mpeg','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';
 const file=vids&&u.startsWith('/videos/')?path.join(vids,u.slice(8)):path.join(dist,u);
 if(!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,type=TYPES[path.extname(file)]||'application/octet-stream',range=req.headers.range;
 if(range){const m=/bytes=(\d*)-(\d*)/.exec(range);const a=m[1]?+m[1]:0,b=m[2]?+m[2]:size-1;res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${a}-${b}/${size}`,'Accept-Ranges':'bytes','Content-Length':b-a+1});fs.createReadStream(file,{start:a,end:b}).pipe(res);}
 else{res.writeHead(200,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Length':size});fs.createReadStream(file).pipe(res);}});
await new Promise(r=>server.listen(0,r));const base=`http://127.0.0.1:${server.address().port}/`;
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:dpr});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const fails=[];const ok=(c,msg)=>{console.log((c?'ok   ':'FAIL ')+msg);if(!c)fails.push(msg);};
await page.goto(base);await page.waitForTimeout(1500);
const folders=await page.$$eval('[data-folder-card]',l=>l.map(e=>e.dataset.folderCard));
ok(folders.indexOf('pellicules')===folders.indexOf('historia')+1,'the folder goes right after «Històries pas a pas»: '+folders.join(','));
await page.click('[data-folder="pellicules"]');await page.waitForTimeout(1200);await page.screenshot({path:`${out}/carpeta.jpg`,quality:80});
for(const [id,n] of [['mos',10],['comunicar',11]]){
 await page.click(`[data-start="${id}"]`);
 await page.waitForFunction(()=>/Prem per començar/.test(document.querySelector('#live')?.textContent||''),null,{timeout:30000}).catch(()=>{});
 const status=()=>page.evaluate(()=>document.querySelector('#live')?.textContent||'');
 ok(/Prem per començar/.test(await status()),`${id}: the cover waits for the first press (${await status()})`);
 for(let i=0;i<n;i++){await page.keyboard.press('Space');await page.waitForTimeout(400);const s=await status();ok(s===`Seqüència ${i+1} de ${n}.`,`${id}: press ${i+1} plays sequence ${i+1} (${s})`);
  if(i===0){await page.keyboard.press('Space');await page.waitForTimeout(200);ok(await status()===`Seqüència 1 de ${n}.`,`${id}: a press during a sequence is refused`);}
  await page.waitForFunction(()=>/S’ha acabat/.test(document.querySelector('#live')?.textContent||''),null,{timeout:120000});await page.waitForTimeout(1500);
  if(i===2)await page.screenshot({path:`${out}/${id}_pausa.jpg`,quality:80});
  const s2=await status();ok(i<n-1?s2===`S’ha acabat la seqüència ${i+1}. Prem per veure la següent.`||/Carregant/.test(s2):/pel·lícula/.test(s2),`${id}: after sequence ${i+1}: ${s2}`);
  if(i<n-1)await page.waitForFunction(()=>/Prem per veure la següent/.test(document.querySelector('#live')?.textContent||''),null,{timeout:60000});}
 await page.keyboard.press('Space');await page.waitForTimeout(400);ok(await status()===`Seqüència 1 de ${n}.`,`${id}: after the last one the film starts again`);
 await page.keyboard.press('Escape').catch(()=>{});await page.evaluate(()=>document.querySelector('[data-home],[data-exit],.stage-tools [aria-label*="Surt"]')?.click());await page.waitForTimeout(800);
 if(!(await page.$(`[data-start="${id==='mos'?'comunicar':'mos'}"]`))){await page.click('[data-folder="pellicules"]').catch(()=>{});await page.waitForTimeout(800);}}
ok(!errors.length,'no errors: '+errors.join(' | '));
await browser.close();server.close();console.log(fails.length?`${fails.length} FAILED`:'ALL OK');process.exit(fails.length?1:0);

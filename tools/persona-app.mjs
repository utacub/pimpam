// Activitats personalitzades (0.44) in the built HTML: makes one activity of each mechanic from the files of a folder (photos, a video,
// sounds, a song) through the editor, plays each one with the switch, keeps pictures, exports them all, deletes them, imports the file
// and checks they are back. Usage: node tools/persona-app.mjs <built.html> <media dir> <outdir> [dpr]
import {createRequire} from 'node:module';
import {mkdirSync,mkdtempSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const [html,media,out,dprArg='1']=process.argv.slice(2),dpr=+dprArg;mkdirSync(out,{recursive:true});
const ctx=await playwright.chromium.launchPersistentContext(mkdtempSync(join(tmpdir(),'pp-')),{viewport:{width:1280,height:800},deviceScaleFactor:dpr,acceptDownloads:true,args:['--autoplay-policy=no-user-gesture-required']});
const page=ctx.pages()[0]||await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('dialog',d=>d.accept());
await page.goto('file://'+html);await page.waitForTimeout(1200);
const f=n=>join(media,n),shot=async n=>page.screenshot({path:`${out}/${n}.jpg`,type:'jpeg',quality:72});
await page.locator('.card-open[data-folder="personal"]').click();await page.waitForTimeout(400);await shot('01-carpeta-buida');
const plan=[
 {name:'La família',child:'Laia',tpl:'album',files:['foto1.jpg','video1.webm','foto2.jpg'],sound:{0:'so1.mp3'},music:'own'},
 {name:'Qui hi ha sota el paper?',child:'',tpl:'pas',files:['foto3.jpg','foto4.jpg'],sound:{},music:'pimpam'},
 {name:'Qui s’amaga?',child:'Pau',tpl:'moment',files:['foto5.jpg','video1.webm'],sound:{0:'so2.mp3'},music:'pimpam'},
 {name:'Tria i mira',child:'',tpl:'tria',files:['foto1.jpg','foto2.jpg','foto3.jpg','video1.webm'],sound:{1:'so3.mp3'},music:'none'},
 {name:'Escolta i troba',child:'',tpl:'troba',files:['foto4.jpg','foto5.jpg','foto6.jpg'],sound:{0:'so1.mp3',1:'so2.mp3',2:'so4.mp3'},music:'pimpam'}];
const idle=()=>page.waitForFunction(()=>{const s=document.querySelector('#pe-status');return s&&s.hidden;},null,{timeout:60000});
for(const [k,p] of plan.entries()){await page.locator('[data-ps-new]').first().click();await page.waitForSelector('#ps-editor');
 await page.fill('#pe-name',p.name);await page.fill('#pe-child',p.child);await page.click(`[data-pe-tpl="${p.tpl}"]`);
 await page.setInputFiles('#pe-files',p.files.map(f));await page.waitForTimeout(300);await idle();
 for(const [i,s] of Object.entries(p.sound)){await page.click(`[data-pe-sound="${i}"]`).catch(()=>{});await page.setInputFiles('#pe-audio',f(s));await page.waitForTimeout(200);await idle();}
 await page.click(`[data-pe-set="musicMode"][data-value="${p.music}"]`);if(p.music==='own'){await page.click('[data-pe-music]').catch(()=>{});await page.setInputFiles('#pe-audio',f('canco.mp3'));await page.waitForTimeout(200);await idle();}
 if(k===0)await shot('02-editor');
 const err=await page.evaluate(()=>document.querySelector('#pe-error')?.textContent);if(err)errors.push('editor: '+err);
 await page.click('[data-pe-save]');await page.waitForSelector('#ps-editor',{state:'detached',timeout:20000}).catch(()=>errors.push('editor did not close: '+p.name));await page.waitForTimeout(500);}
await page.waitForTimeout(800);await shot('03-carpeta');
const ids=await page.evaluate(()=>[...document.querySelectorAll('.ps-card [data-start]')].map(b=>b.dataset.start));console.log('activities',ids.length);
const press=async()=>{await page.keyboard.down('Space');await page.waitForTimeout(90);await page.keyboard.up('Space');};
for(const [k,id] of ids.entries()){const t0=Date.now();await page.locator(`.ps-card [data-start="${id}"]`).click();
 await page.waitForFunction(()=>!document.querySelector('.load-cover:not(.gone)'),null,{timeout:45000,polling:100}).catch(()=>errors.push(id+': cover did not lift'));const cover=Date.now()-t0;await page.waitForTimeout(800);
 const tpl=plan[k].tpl,shots=[];
 if(tpl==='album'){for(let i=0;i<3;i++){await press();await page.waitForTimeout(i===1?2600:700);await shot(`10-album-${i}`);}}
 else if(tpl==='pas'){for(let i=0;i<5;i++){await press();await page.waitForTimeout(i<4?600:1500);await shot(`20-pas-${i}`);}await page.waitForTimeout(6000);await press();await page.waitForTimeout(400);await shot('20-pas-5');}
 else if(tpl==='moment'){await page.waitForTimeout(4500);await shot('30-moment-knock');await press();await page.waitForTimeout(700);await shot('30-moment-open');await page.waitForTimeout(1500);await shot('30-moment-show');}
 else{await page.waitForTimeout(tpl==='troba'?4500:500);await shot(`40-${tpl}-board`);await press();await page.waitForTimeout(500);await shot(`40-${tpl}-open`);await page.waitForTimeout(1600);await shot(`40-${tpl}-show`);}
 const st=await page.evaluate(()=>({...document.querySelector('#stage')?.dataset,audio:[...document.querySelectorAll('video')].length}));console.log(tpl,'cover',cover,'ms',JSON.stringify({phase:st.phase,template:st.template,step:st.step,scanState:st.scanState}));
 await page.keyboard.press('Escape');await page.waitForTimeout(600);await page.evaluate(()=>{if(!document.querySelector('[data-ps-new]'))document.querySelector('.card-open[data-folder="personal"]')?.click();});await page.waitForTimeout(400);}
// export all, delete all, import back
const [dl]=await Promise.all([page.waitForEvent('download',{timeout:60000}),page.click('[data-ps-export-all]')]);const zip=join(out,'export.zip');await dl.saveAs(zip);console.log('export',dl.suggestedFilename(),statSync(zip).size,'bytes');
for(const id of ids){await page.click(`[data-ps-delete="${id}"]`);await page.waitForTimeout(500);}
console.log('after delete',await page.evaluate(()=>document.querySelectorAll('.ps-card').length));
await page.setInputFiles('#ps-import-file',zip);await page.waitForFunction(n=>document.querySelectorAll('.ps-card').length===n,ids.length,{timeout:60000}).catch(()=>errors.push('import did not bring them back'));
console.log('after import',await page.evaluate(()=>document.querySelectorAll('.ps-card').length),await page.evaluate(()=>document.querySelector('#toast')?.textContent));
await page.setInputFiles('#ps-import-file',zip);await page.waitForTimeout(2500);console.log('second import',await page.evaluate(()=>document.querySelectorAll('.ps-card').length),await page.evaluate(()=>document.querySelector('#toast')?.textContent));
await page.waitForTimeout(800);await shot('50-importades');
console.log('errors',errors.length?'\n'+errors.join('\n'):'none');await ctx.close();

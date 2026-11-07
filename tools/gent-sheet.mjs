// 0.45.7 style sheet of the castellers (castells-gent.js): node tools/gent-sheet.mjs out.png [scale]
import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));const [out,sc='1']=process.argv.slice(2);
const code=['kaleido-base.js','castells-gent.js'].map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
const b=await playwright.chromium.launch(),pg=await b.newPage({viewport:{width:1280,height:720},deviceScaleFactor:+sc});const errs=[];pg.on('pageerror',e=>errs.push(String(e)));
await pg.setContent('<canvas id=c width=1280 height=720></canvas>');await pg.addScriptTag({content:code+`
const cv=document.getElementById('c'),c=cv.getContext('2d');c.fillStyle='#8fc3ee';c.fillRect(0,0,1280,720);c.fillStyle='#d8c6a2';c.fillRect(0,560,1280,160);
const H=300;let x=120;
for(const [facing,kid,seed,arms,open] of [[-1,0,1,'side',0],[-1,0,2,'up',0],[1,0,3,'side',0],[1,0,4,'down',0],[-1,1,5,'side',0],[1,1,6,'aleta',2]]){
 const h=kid?H*.62:H,L=fgLook(seed,{kid:!!kid,shirt:'#2f9e52',helmet:!!kid}),y=640,P=[x,y-fgDims(h,!!kid).stand];
 const S=x,hands=arms==='side'?[[x-h*.32,y-h*.8],[x+h*.32,y-h*.8]]:arms==='up'?[[x-h*.18,y-h*1.05],[x+h*.18,y-h*1.05]]:arms==='aleta'?[[x-h*.3,y-h*.6],[x+h*.12,y-h*1.25]]:null;
 fgPerson(c,{H:h,kid:!!kid,broad:L.broad,pelvis:P,feet:[[x-h*.07,y],[x+h*.07,y]],hands,facing,open,elbowUp:arms==='up'||arms==='aleta'},L);x+=200;}
`});
await pg.locator('#c').screenshot({path:out});console.log(errs.join('\n')||'ok');await b.close();

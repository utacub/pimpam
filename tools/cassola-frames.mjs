// Review tool for La cassola d'en Glups (EN23, 0.24; 0.27): renders still frames of the board, of a choice and of the show as JPEG files, and
// reports the drawing time of each. Usage: node tools/cassola-frames.mjs OUTDIR WIDTH HEIGHT SPEC ...
//   board,ROUND,STAGE,N,FOCUS,PICKS[,FLAG]        the board (PICKS: ids joined with +, or -; FLAG: reduced|waiting|none|dim|white|one)
//   step,ROUND,STAGE,N,CHOSEN,PICKS,T[,FLAG]      a choice that is not the last one, T seconds after the press (PICKS without it)
//   show,ROUND,N,CHOSEN,PICKS,T[,FLAG]            the show, T seconds after the last press (PICKS: the magic and the biscuit, and the ladle with «one»)
//   card                                          the card of the home page (320 × 180)
import {createRequire} from 'node:module';
import {readFileSync,existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url));
const MODULES=['carrega.js','kaleido-base.js','sampler.js','glass.js','paper.js','escenari.js','tauler.js','cassola.js','grec-art.js','grec-bestiari.js','cassola-mites2.js','cassola-mites3.js','cassola-mites.js','cassola-art.js'];
const source=()=>'(()=>{'+MODULES.map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class|let))/gm,'')+'\nwindow.GP={tlLayout,tlLights,gpBoard,gpResult,gpOptions,gpItem,escDecor,GP_LADLE};})();';
const [out,wArg,hArg,...specs]=process.argv.slice(2),W=+wArg,H=+hArg;mkdirSync(out,{recursive:true});
const browser=await playwright.chromium.launch(),page=await browser.newPage({viewport:{width:W,height:H},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${W}" height="${H}"></canvas></body></html>`);
await page.addScriptTag({content:source()});
await page.addScriptTag({content:`window.paint=(spec,cw,ch)=>{const cv=document.getElementById('c');if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}const c=cv.getContext('2d'),w=cw,h=ch;c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,w,h);const t0=performance.now();
 const p=spec.split(','),kind=p[0],flag=p[p.length-1],s={reduced:flag==='reduced',scanOptions:3,potPick:flag==='one'?'one':'choose',background:flag==='none'||flag==='white'?'none':flag==='dim'?'dim':'full',base:flag==='white'?'white':'black',opacity:30};
 const ids=(stage,n,round,picks=[])=>GP.gpOptions(stage,n,round,s.potPick,picks),picksOf=x=>x==='-'?[]:x.split('+');
 const decor=GP.escDecor({background:s.background,base:s.base,opacity:s.opacity});
 if(kind==='card'){const zones=GP.tlLayout('pot',3,w,h),o=ids(0,3,0);GP.gpBoard(c,w,h,{round:0,stage:0,picks:[]},{},s,{decor:GP.escDecor({preview:true}),options:o.map(value=>({value})),zones,lights:zones.map(()=>1),focus:-1,progress:null,picks:[],clock:0,preview:true});}
 else if(kind==='board'){const round=+p[1],stage=+p[2],n=+p[3],focus=+p[4],picks=picksOf(p[5]),o=ids(stage,n,round,picks),zones=GP.tlLayout('pot',o.length,w,h);s.scanOptions=n;
  GP.gpBoard(c,w,h,{round,stage,picks},{},s,{decor,options:o.map(value=>({value})),zones,lights:zones.map((z,i)=>i===focus?1:.6),focus,progress:.45,picks,waiting:flag==='waiting',wait:flag==='waiting'?1:0,clock:3.3});}
 else if(kind==='step'){const round=+p[1],stage=+p[2],n=+p[3],chosen=+p[4],picks=picksOf(p[5]),T=+p[6],o=ids(stage,n,round,picks),zones=GP.tlLayout('pot',o.length,w,h);s.scanOptions=n;
  GP.gpResult(c,w,h,{round,stage,picks},{},s,{decor,options:o.map(value=>({value})),zones,lights:zones.map(()=>.6),focus:-1,chosen,picks:[...picks,o[chosen]],final:false,clock:3.3+T},T);}
 else if(kind==='show'){const round=+p[1],n=+p[2],chosen=+p[3],picks=picksOf(p[4]),T=+p[5],stage=picks.length-1,o=ids(stage,n,round,picks.slice(0,-1)),zones=GP.tlLayout('pot',o.length,w,h);s.scanOptions=n;
  GP.gpResult(c,w,h,{round,stage,picks:picks.slice(0,-1)},{},s,{decor,options:o.map(value=>({value})),zones,lights:zones.map(()=>.6),focus:-1,chosen,picks,final:true,clock:3.3+T},T);}
 c.getImageData(0,0,1,1);return performance.now()-t0;};`});
// REPEAT=n draws each frame n more times and reports the median of those (the first draw also builds the cached sheets).
const REPEAT=+(process.env.REPEAT||0);
for(const spec of specs){const [cw,ch]=spec==='card'?[320,180]:[W,H];let ms=await page.evaluate(([s,a,b])=>window.paint(s,a,b),[spec,cw,ch]);
 if(REPEAT){const t=await page.evaluate(([s,a,b,n])=>{const cv=document.getElementById('c'),r=[];for(let i=0;i<n;i++){const t0=performance.now();window.paint(s,cv.width,cv.height);r.push(performance.now()-t0);}return r.sort((x,y)=>x-y);},[spec,cw,ch,REPEAT]);ms=t[t.length>>1];}
 const name=spec.replace(/[,+]/g,'_');await page.locator('#c').screenshot({path:`${out}/${name}.jpg`,type:'jpeg',quality:88});console.log(name,ms.toFixed(1)+' ms');}
console.log('page errors:',errors.length?errors:'none');await browser.close();

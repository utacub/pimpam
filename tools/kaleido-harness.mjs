// Shared harness for the review tools: loads the Caleidoscopi (CE21), Vitralls (CE22), Natura (CE23), Piromusical (CE24), Dibuixos que
// ballen (CE32, 0.25), Joguines que ballen (CE33) and La cuina que balla (CE34, 0.26) modules into a headless Chromium page with a single canvas. 'kaleido-contrast' is Caleidoscopi with «Contrast alt» (yellow).
// The recorded instruments are read from dist/assets/samples when a tool calls loadRecorded() in the page.
// Playwright is a development tool only; the app itself has no dependencies.
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
export const root=fileURLToPath(new URL('..',import.meta.url));
// The modules of the collections, in build order, as one classic script (the same transformation as build_standalone.py).
export const KALEIDO_MODULES=['kaleido-base.js','kaleido-art.js','sampler.js','kaleido-music.js','kaleido.js','synth.js','glass.js','vitrall-art.js','vitrall.js','paper.js','natura-art.js','natura.js','firework.js','piro-art.js','piro.js','dibuixos-art.js','dibuixos.js','joguines-art.js','joguines.js','cuina-art.js','cuina.js'].filter(name=>existsSync(root+'dist/'+name));
export function kaleidoSource(){
 const code=KALEIDO_MODULES.map(name=>readFileSync(root+'dist/'+name,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
 return '(()=>{'+code+'\nwindow.K={drawKaleido,kaleidoPhase,kaleidoScore,kaleidoTimeline,kaleidoEvents,KALEIDO_PATTERNS,KALEIDO_MIN_DURATION,createSynth,SYNTH_SUSTAINED,loadSamples,samplesReady,drawVitrall,vitrallQuality,vitrallScore,vitrallEvents,VITRALL_PATTERNS,VITRALL_MIN_DURATION,drawNatura,naturaQuality,naturaScore,naturaEvents,NATURA_PATTERNS,NATURA_MIN_DURATION,NATURA_MUSIC,drawPiro,piroQuality,piroScore,piroEvents,PIRO_PATTERNS,PIRO_MIN_DURATION,PIRO_MUSIC,drawDibuixos,dbScore,dbPulses,DW_ART,DB_MIN_DURATION,KALEIDO_CONTRAST_COLORS,DB_SETS:{drawings:DB_SET'+(KALEIDO_MODULES.includes('joguines.js')?',toys:JG_SET':'')+(KALEIDO_MODULES.includes('cuina.js')?',kitchen:CN_SET':'')+'}};})();';
}
export async function openHarness(width,height){
 const browser=await playwright.chromium.launch();
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id="c" width="${width}" height="${height}"></canvas></body></html>`);
 await page.addScriptTag({content:kaleidoSource()});
 await page.exposeFunction('readSample',file=>/^[A-Za-z]+\/[A-Za-z0-9-]+\.mp3$/.test(file)?readFileSync(root+'dist/assets/samples/'+file).toString('base64'):'');
 await page.addScriptTag({content:`window.paint=(o,base='black')=>{const cv=document.getElementById('c'),c=cv.getContext('2d',{willReadFrequently:true});c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle=base==='white'?'#fff':'#000';c.fillRect(0,0,cv.width,cv.height);COLLECTION(o.collection).draw(c,cv.width,cv.height,{background:'none',opacity:25,base,adaptive:false,...o});return c;};
window.loadRecorded=()=>K.loadSamples({load:async file=>{const s=atob(await readSample(file)),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer;}});
// The functions of one collection, by name, for the review tools.
const DB_CODES={drawings:['CE32','dib'],toys:['CE33','jog'],kitchen:['CE34','cui']};
window.COLLECTION=name=>K.DB_SETS[name]?(set=>({code:DB_CODES[name][0],draw:(c,w,h,o)=>K.drawDibuixos(c,w,h,{color:'own',speed:'normal',...o,set}),score:(i,D,seed)=>K.dbScore(i,D,seed,'normal',set),events:(i,D)=>K.dbPulses(i,D,'normal',set),patterns:set.art.map((a,i)=>({plan:i+1,id:DB_CODES[name][1]+'-'+a.name,name:a.name})),min:K.DB_MIN_DURATION}))(K.DB_SETS[name]):name==='kaleido-contrast'?{code:'CE21c',draw:(c,w,h,o)=>K.drawKaleido(c,w,h,{...o,contrast:K.KALEIDO_CONTRAST_COLORS.yellow}),score:K.kaleidoScore,events:K.kaleidoEvents,patterns:K.KALEIDO_PATTERNS,min:K.KALEIDO_MIN_DURATION}:name==='piro'?{code:'CE24',draw:K.drawPiro,score:K.piroScore,events:K.piroEvents,patterns:K.PIRO_PATTERNS,min:K.PIRO_MIN_DURATION}:name==='vitrall'?{code:'CE22',draw:K.drawVitrall,score:K.vitrallScore,events:K.vitrallEvents,patterns:K.VITRALL_PATTERNS,min:K.VITRALL_MIN_DURATION}:name==='natura'?{code:'CE23',draw:K.drawNatura,score:K.naturaScore,events:K.naturaEvents,patterns:K.NATURA_PATTERNS,min:K.NATURA_MIN_DURATION}:{code:'CE21',draw:K.drawKaleido,score:K.kaleidoScore,events:K.kaleidoEvents,patterns:K.KALEIDO_PATTERNS,min:K.KALEIDO_MIN_DURATION};`});
 return {browser,page};
}

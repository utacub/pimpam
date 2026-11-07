// D'on ve aquest so? (EN21) and El meu espectacle de llum (EN22), 0.18.
import test from 'node:test';
import assert from 'node:assert/strict';
import {OG_PLACES,OG_CLUE,OG_RESULT,OG_WRONG,ogRound,ogTarget,ogClue,ogPiece,ogScore,ogTaste} from '../dist/origen.js';
import {ogBoard,ogResult,ogLandscape} from '../dist/origen-art.js';
import {GX_COLORS,GX_SHAPES,GX_MUSIC,GX_SHOW,GX_STEP,GX_DRAW,GX_FADE,GX_PLACES,gxShow,gxPiece,gxScore,gxStep,gxTaste,gxPicks} from '../dist/guix.js';
import {gxBoard,gxResult} from '../dist/guix-art.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {SCAN_ACTIVITIES,createScanState,scanChoices,scanContent,scanTarget,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {tlLayout,TL_STRIP,TL_DIM} from '../dist/tauler.js';
import {escDecor} from '../dist/escenari.js';
import {defaults,scanRing} from '../dist/input.js';
const ctx=()=>{const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});};
// Every note in the range of its recordings (with the sampler's 4 semitones of margin), and only plucked, struck or short notes.
const LONG=['violinsRec','celliRec','hornRec','tromboneRec','tubaRec','oboeRec','clarinetRec','snareRollRec'];
function checkNotes(notes,limit,label){for(const n of notes){assert.ok(SAMPLE_BANK[n.inst],`${label}: ${n.inst}`);assert.ok(!LONG.includes(n.inst),`${label}: no sustained instrument (${n.inst})`);assert.ok(n.t>=0&&n.t<limit,`${label}: ${n.inst} at ${n.t}`);
 const b=SAMPLE_BANK[n.inst];if(b.pitched){const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;for(const m of n.midi)assert.ok(m>=lo&&m<=hi,`${label}: ${n.inst} ${m}`);}
 if(['fluteRec','trumpetRec'].includes(n.inst))assert.ok(n.len<=.5,`${label}: ${n.inst} notes are short`);}}
test('D’on ve aquest so?: twenty different rounds; the model is always on the board and the first two others come from other families',()=>{
 const rows=new Set();for(let r=0;r<20;r++){const R=ogRound(r,4);rows.add(R.target+'|'+R.options.join());const fam=OG_PLACES.find(x=>x.id===R.target).family;
  for(const n of [2,3,4]){const o=ogRound(r,n).options;assert.equal(o.length,n);assert.ok(o.includes(R.target));assert.equal(new Set(o).size,n);}
  for(const id of ogRound(r,3).options.filter(x=>x!==R.target))assert.notEqual(OG_PLACES.find(x=>x.id===id).family,fam,`round ${r}: ${id}`);
  assert.equal(ogTarget(r).id,R.target);assert.equal(ogTarget(r+20).id,R.target);}
 assert.equal(rows.size,20);assert.deepEqual(new Set(Array.from({length:20},(_,r)=>ogRound(r).target)).size,9,'all nine places are models');
 assert.equal(new Set(Array.from({length:6},(_,r)=>ogRound(r).moment)).size,3);});
test('D’on ve aquest so?: the model is the sound alone; the piece has the place’s sound, acoustic notes and ends on plucked and struck notes',()=>{
 for(let r=0;r<20;r++){const c=ogClue(r);assert.equal(c.length,OG_CLUE);assert.equal(c.notes.length,1);assert.equal(c.notes[0].inst,'natureRec');assert.equal(c.notes[0].variant,ogPlace(ogTarget(r).id).nature);}
 for(const p of OG_PLACES)for(const r of [0,7,13]){const notes=ogPiece(p.id,r),music=notes.filter(n=>n.inst!=='natureRec');assert.equal(notes.filter(n=>n.inst==='natureRec').length,1);
  checkNotes(music,OG_RESULT,p.id);const last=Math.max(...music.map(n=>n.t));assert.ok(last<OG_RESULT-1.5,'time to ring out');
  assert.ok(music.filter(n=>n.t===last).every(n=>['harpRec','glockRec','celliPizzRec','marimbaRec'].includes(n.inst)));
  assert.ok(ogScore(p.id,r).every(e=>e.at>=0&&e.at<1&&e.length>0));const t=ogTaste(p.id);assert.equal(t.nature,p.nature);assert.ok(t.length<=1.4);}
 assert.ok(OG_WRONG>=1.2&&OG_WRONG<2);});
function ogPlace(id){return OG_PLACES.find(x=>x.id===id);}
test('El meu espectacle de llum: rockets at most two a second, bursts that grow in ≥0.3 s and fade in ≥0.6 s, and music of plucked, struck and short notes',()=>{
 assert.ok(GX_DRAW>=.3&&GX_FADE>=.6);
 for(let r=0;r<10;r++){const b=gxShow(r);assert.equal(b.length,8);for(let i=1;i<b.length;i++)assert.ok(b[i].t-b[i-1].t>=.5-1e-9);for(const x of b){assert.ok(x.x>=.1&&x.x<=.9&&x.y>=.15&&x.y<=.45&&x.size>0&&x.size<=1);assert.ok(x.t+GX_DRAW<GX_SHOW);}
  for(const m of GX_MUSIC){const notes=gxPiece(m.id,r);checkNotes(notes,GX_SHOW,m.id);assert.ok(gxScore(m.id,r).every(e=>e.at>=0&&e.at<1));
   const music=notes.filter(n=>!['fireRec','cymbalRec','triangleRec','snareRec'].includes(n.inst)),last=Math.max(...music.map(n=>n.t));assert.ok(music.filter(n=>n.t>=last-.2).every(n=>['harpRec','glockRec','celliPizzRec','marimbaRec','timpaniRec'].includes(n.inst)),m.id+': ends struck or plucked');assert.ok(last<GX_SHOW-1.2);}
  for(const [k,list] of [GX_COLORS,GX_SHAPES,GX_MUSIC].entries())for(const x of list){checkNotes(gxTaste(k,x.id,r),1.5,'taste '+x.id);const st=gxStep(k,x.id,r);checkNotes(st,GX_STEP,'step '+x.id);assert.ok(Math.max(...gxTaste(k,x.id,r).map(n=>n.t+n.len))<=1.4);}}
 assert.deepEqual(gxPicks([{value:'blue'},{value:'spiral'},{value:'band'}]),{color:'blue',shape:'spiral',music:'band'});assert.deepEqual(gxPicks([]),{color:'gold',shape:'peony',music:'harp'});
 assert.equal(GX_PLACES.length,5);});
test('the two boards: zones inside the stage, apart, large enough, in landscape and in portrait',()=>{
 for(const id of ['sources','lights'])for(const [w,h] of [[1280,720],[1024,768],[720,1000],[1920,1080]])for(const n of [2,3,4]){const z=tlLayout(id,n,w,h),H=h-TL_STRIP;assert.equal(z.length,n);
  for(const a of z){assert.ok(a.x>=0&&a.y>=0&&a.x+a.w<=w&&a.y+a.h<=H,`${id} ${w}×${h} ${n}`);assert.ok(a.w*a.h>=w*H*.08,`${id} ${w}×${h} ${n}: ${(a.w*a.h/(w*H)).toFixed(3)}`);assert.ok(Math.min(a.w,a.h)>=140);}
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=z[i],b=z[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,'apart');}}});
test('both activities run in the scanning catalogue: the guided landscapes keep the round after another one; the show comes after three choices',()=>{
 const s={...defaults,scanOptions:3};assert.ok(SCAN_ACTIVITIES.find(x=>x.id==='sources'&&x.code==='EN21'&&x.recorded&&x.task==='guided'));assert.ok(SCAN_ACTIVITIES.find(x=>x.id==='lights'&&x.code==='EN22'&&x.recorded&&x.task==='creative'));
 const st=createScanState('sources',s);assert.equal(st.cueNeeded,true);const goal=scanTarget(st,s).id,ch=scanChoices(st,s);assert.deepEqual(ch.map(x=>x.action||'').filter(Boolean),['cue']);
 const wrong=ch.findIndex(x=>!x.action&&x.id!==goal);let r=chooseScan(st,s,wrong);assert.equal(r.duration,OG_WRONG);finishScan(st,s);assert.equal(st.outcome,'retry');assert.equal(scanTarget(st,s).id,goal);
 r=chooseScan(st,s,scanChoices(st,s).findIndex(x=>x.id===goal));assert.equal(r.duration,OG_RESULT);finishScan(st,s);assert.equal(st.round,1);
 const lt=createScanState('lights',s),seen=[];for(let k=0;k<3;k++){const o=scanContent(lt,s);assert.equal(o.length,3);seen.push(o[0].kind);r=chooseScan(lt,s,1);assert.equal(r.duration,k<2?GX_STEP:GX_SHOW);assert.equal(lt.pending.final,k===2);finishScan(lt,s);}
 assert.deepEqual(seen,['light-0','light-1','light-2']);assert.equal(lt.round,1);
 const four=createScanState('lights',{...s,scanOptions:4});assert.equal(scanContent(four,{...s,scanOptions:4}).length,4);
 assert.notDeepEqual(scanContent({...lt,round:0},{...s,scanOptions:2}).map(x=>x.id),scanContent({...lt,round:1},{...s,scanOptions:2}).map(x=>x.id),'the options change with the round');});
test('the boards and the results draw with finite geometry in every decor mode, at rest, in focus, sounding and in every moment of the result',()=>{
 const modes=[{background:'full'},{background:'dim',opacity:30},{background:'none',base:'black'},{background:'none',base:'white'}];
 for(const o of modes)for(const [w,h] of [[1280,720],[720,1000]])for(const reduced of [false,true]){const s={...defaults,...o,reduced};
  // D'on ve aquest so?
  for(const r of [0,5]){const R=ogRound(r,3),options=R.options.map(id=>({id,value:id})),zones=tlLayout('sources',3,w,h),view={decor:escDecor(s),ring:scanRing(s),options,zones,lights:zones.map((_,i)=>i?TL_DIM:1),focus:0,progress:.4,waiting:false,wait:0,clock:2.3,cue:.6,sounding:0,soundLevel:.8};
   ogBoard(ctx(),w,h,{round:r,hint:true},{},s,view);ogBoard(ctx(),w,h,{round:r,hint:false},{},s,{...view,sounding:-1,cue:0,focus:-1});
   for(const T of [0,.5,1.4,4,8.9])ogResult(ctx(),w,h,{round:r,hint:true},{},s,{...view,chosen:R.options.indexOf(R.target),correct:true,picked:R.target},T);
   ogResult(ctx(),w,h,{round:r},{},s,{...view,chosen:0,correct:false,picked:R.options[0]},.8);}
  for(const p of OG_PLACES)for(const m of ['mati','tarda','vespre'])ogLandscape(ctx(),0,0,400,300,p.id,m,{t:1.7,a:1,beat:.5,ink:o.base==='white'});
  // El meu espectacle de llum
  for(const r of [0,3])for(const stage of [0,1,2]){const list=[GX_COLORS,GX_SHAPES,GX_MUSIC][stage],options=list.slice(0,4).map(x=>({id:x.id,value:x.id})),zones=tlLayout('lights',4,w,h),picks=['pink','willow','band'].slice(0,stage);
   const view={decor:escDecor(s),ring:scanRing(s),options,zones,lights:zones.map((_,i)=>i===1?1:TL_DIM),focus:1,progress:.5,waiting:false,wait:0,clock:1.9,picks},state={round:r,stage,picks:picks.map(value=>({value}))};
   for(const clock of [.2,.9,2])gxBoard(ctx(),w,h,state,{},s,{...view,clock});
   const T=stage<2?[0,.4,.9,1.6]:[0,.5,1.4,3,6,8.6,9.6,10.9];for(const t of T)gxResult(ctx(),w,h,state,{},s,{...view,chosen:1,picks:[...picks,options[1].value],final:stage===2},t);}}});
test('the built file joins the modules in one scope: no two modules declare a function of the same name (0.18)',async()=>{
 const fs=await import('node:fs'),src=fs.readFileSync(new URL('../build_standalone.py',import.meta.url),'utf8'),list=[...src.match(/for name in \[(.*?)\]\)/s)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]),seen=new Map();
 for(const m of list)for(const [,name] of fs.readFileSync(new URL('../dist/'+m,import.meta.url),'utf8').matchAll(/^(?:export\s+)?function\s+([A-Za-z_$][\w$]*)/gm)){assert.ok(!seen.has(name),`${name}: ${seen.get(name)} and ${m}`);seen.set(name,m);}
 assert.ok(list.includes('origen.js')&&list.includes('guix-art.js'));});

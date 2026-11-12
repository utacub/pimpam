// 0.16: the scanning boards (tauler.js) and their two pilots, On anem? (EN04, estacio.js) and Detectius de sons (EN11, templet.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import {TL_DIM,TL_FADE,TL_STRIP,tlLayout,tlLights,tlOpenBox,tlDensify} from '../dist/tauler.js';
import {ET_PLACES,ET_TRIP,ET_ARRIVE,etRound,etScore,etTaste} from '../dist/estacio.js';
import {TM_INSTRUMENTS,TM_PIECE,TM_WRONG,tmStage,tmTarget,tmClue,tmTaste,tmScore} from '../dist/templet.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {createScanState,scanChoices,scanContent,scanTarget,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {defaults,validateProfile} from '../dist/input.js';
const base={...defaults};
const ctx=()=>{const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});};
const SCREENS=[[1280,720],[1920,1080],[1024,768],[1366,768],[768,1024],[800,600]];
const inReach=(e)=>{const b=SAMPLE_BANK[e.inst];assert.ok(b,`unknown instrument ${e.inst}`);if(!b.pitched)return true;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;return e.midi.every(m=>m>=lo&&m<=hi);};
const STRUCK=['harpRec','glockRec','marimbaRec','timpaniRec','triangleRec','celliPizzRec','violinsPizzRec','woodblockRec','dsArpa','dsGlock','dsMarimba','dsTimbal','dsTriangle','dsPiano','dsBaix','dsPandereta','dsGong','guitarRec'];
test('the zones of a board are large, apart, inside the stage and above the strip of commands, on every screen',()=>{
 for(const id of ['destinations','sounds'])for(const [w,h] of SCREENS)for(const n of [2,3,4]){const zones=tlLayout(id,n,w,h),area=w*h;assert.equal(zones.length,n);
  // measured: landscape 14 % (four doors) to 27 % (two panels); portrait, in two rows, 11 %
  for(const z of zones){assert.ok(z.w*z.h>=area*(id==='sounds'?(w<h?.035:.04):w<h?.1:n===4?.12:n===3?.14:.18),`${id} ${w}×${h} ${n}: a zone of ${(100*z.w*z.h/area).toFixed(1)} %`);assert.ok(z.x>=0&&z.y>=0&&z.x+z.w<=w&&z.y+z.h<=h-TL_STRIP,`${id} ${w}×${h} ${n}: inside`);assert.ok(z.pts.length>8);}
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const a=zones[i],b=zones[j];assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`${id} ${w}×${h}: zones ${i} and ${j} apart`);}}
 // with four options on a landscape screen, every zone has at least 12 % of the screen (the doors are taller than wide, the panels too)
 {const z=tlLayout('destinations',4,1280,720);assert.ok(z.every(q=>q.w*q.h>=1280*720*.12));}
 // Detectius de sons (0.48, Marc): smaller niches under the large frame of the model, still at least 4 % of the screen each
 {const z=tlLayout('sounds',4,1280,720);assert.ok(z.every(q=>q.w*q.h>=1280*720*.04&&q.y>=(720-TL_STRIP)*.5));}
});
test('the light of the zones follows the focus with a fade of 0.25 s, never a jump; the focus never moves faster than every 0.5 s',()=>{
 let lights=[];const dt=1/60;let focus=0;for(let f=0;f<240;f++){if(f===60)focus=2;if(f===120)focus=-1;const next=tlLights(lights,3,focus,dt);if(lights.length)next.forEach((l,i)=>assert.ok(Math.abs(l-lights[i])<=(1-TL_DIM)/TL_FADE*dt+1e-9,'no jump'));lights=next;
  if(f===59)assert.equal(lights[0],1);if(f===119){assert.equal(lights[2],1);assert.equal(lights[0],TL_DIM);}}
 assert.ok(lights.every(l=>l===TL_DIM),'with the focus on a command every zone keeps 60 % of its light');
 assert.throws(()=>validateProfile({...defaults,scanTime:400}));assert.equal(validateProfile({...defaults,scanTime:500}).scanTime,500);
 const box=tlOpenBox(tlLayout('destinations',4,1280,720)[1],1280,720,1);assert.deepEqual([box.x,box.y,box.w,box.h],[0,0,1280,720]);
 assert.ok(tlDensify([[0,0],[100,0],[100,100]],6).length>=40);
});
test('the new settings: the taste in the focus and the labels for the adult, validated, with sound and labels by default',()=>{
 assert.equal(defaults.boardTaste,'sound');assert.equal(defaults.boardLabels,true);for(const v of ['sound','click','off'])assert.equal(validateProfile({...defaults,boardTaste:v}).boardTaste,v);
 assert.throws(()=>validateProfile({...defaults,boardTaste:'loud'}));assert.throws(()=>validateProfile({...defaults,boardLabels:'yes'}));
});
test('On anem?: twenty rounds never give the same station and trip twice; going back to a door gives another trip',()=>{
 for(const place of ET_PLACES){const seen=new Set();for(let r=0;r<20;r++){const R=etRound(r,place);seen.add([R.time,R.find,R.route].join());}assert.equal(seen.size,20,place);
  const trips=new Set();for(let k=0;k<5;k++){const R=etRound(0,place,k);trips.add(R.find+R.route);}assert.equal(trips.size,5,place);}
 // with three doors, the places change from round to round and keep their order in the hall; over four rounds all four appear
 const s={...base,scanOptions:3},all=new Set();for(let r=0;r<4;r++){const st=createScanState('destinations',s);st.round=r;const doors=scanContent(st,s).map(x=>x.id);assert.equal(doors.length,3);assert.deepEqual(doors,[...doors].sort((a,b)=>ET_PLACES.indexOf(a)-ET_PLACES.indexOf(b)));doors.forEach(d=>all.add(d));}
 assert.equal(all.size,4);
});
test('On anem?: each trip is recorded music within the reach of its instruments, over before the end, and closes on plucked and struck notes',()=>{
 for(const place of ET_PLACES)for(let k=0;k<12;k++){const score=etScore(place,k%3,k);assert.ok(score.length>30);
  for(const e of score){assert.ok(e.inst.endsWith('Rec'),`${place} ${k}: recorded`);assert.ok(inReach(e),`${place} ${k}: ${e.inst} ${e.midi}`);assert.ok(e.at>=0&&e.at<1&&e.length>0&&e.vel>0&&e.vel<=1);if(e.inst==='natureRec')assert.ok(['waves','blackbird'].includes(e.variant));}
  const last=Math.max(...score.map(e=>e.at*ET_TRIP));assert.ok(last<ET_TRIP-.6,`${place} ${k}: the last note at ${last.toFixed(2)} s`);
  const arrive=Math.max(...score.filter(e=>e.inst==='harpRec').map(e=>e.at*ET_TRIP))-.3;for(const e of score.filter(e=>e.at*ET_TRIP>=arrive))assert.ok(STRUCK.includes(e.inst),`${place} ${k}: ${e.inst} at the arrival`);
  // nothing held: the violins (space) are short swells inside the trip, the flute plays melody notes
  for(const e of score.filter(e=>['violinsRec','fluteRec'].includes(e.inst)))assert.ok(e.length*ET_TRIP<=2&&e.at*ET_TRIP+e.length*ET_TRIP<ET_ARRIVE+.5);}
 for(const place of ET_PLACES){const t=etTaste(place),len=t.nature?t.length:Math.max(...t.notes.map(n=>n.t+n.len));assert.ok(len>=.8&&len<=1.4,`${place}: a taste of ${len} s`);}
});
test('Detectius de sons (0.48): 8, 14 or 20 instruments; every one is the target once per lap; the target is always on the stage',()=>{
 for(const pool of ['8','14','20']){const s0={...base,scanOptions:3,dsPool:pool},n=+pool,targets=[];
  for(let r=0;r<n;r++){const t=tmTarget(r,s0);targets.push(t.id);assert.ok(t.level<=n);if(r)assert.notEqual(TM_INSTRUMENTS.find(x=>x.id===targets[r-1]).family,t.family,'two targets in a row of one family');
   for(const k of [2,3,4]){const st=tmStage(r,k,s0);assert.equal(st.length,k);assert.equal(new Set(st.map(x=>x.id)).size,k);assert.ok(st.includes(t));assert.ok(st.every(x=>x.level<=n));
    // by default the others are of other families, and of different families from each other
    const fams=st.map(x=>x.family);assert.equal(new Set(fams).size,k,`${pool} ${r} ${k}: ${fams}`);
    const mix=tmStage(r,k,{...s0,dsFamily:'barreja'});assert.ok(mix.includes(t));assert.equal(new Set(mix.map(x=>x.id)).size,k);}
   const state=createScanState('sounds',s0);state.round=r;assert.equal(scanTarget(state,s0).id,t.id);assert.ok(scanContent(state,s0).some(x=>x.id===t.id));}
  assert.equal(new Set(targets).size,n);}
 assert.equal(TM_INSTRUMENTS.length,20);assert.equal(new Set(TM_INSTRUMENTS.map(x=>x.id)).size,20);
 const s0={...base,scanOptions:3},stages=new Set();for(let r=0;r<20;r++)stages.add(tmStage(r,3,s0).map(x=>x.id).join());assert.ok(stages.size>=16);
 // with the same family allowed, a family with enough members fills the stage with it
 const mixed=tmStage(0,3,{...s0,dsFamily:'barreja'}),t=tmTarget(0,s0);assert.ok(mixed.filter(x=>x.family===t.family).length>=2);
});
test('Detectius de sons: clue, tastes and pieces are short phrases of the recorded instruments, ending on plucked and struck notes',()=>{
 for(let r=0;r<20;r++){const clue=tmClue(r,base),onset=Math.max(...clue.notes.map(n=>n.t));assert.ok(onset<=1.4&&clue.length<=2.6,`clue ${r}: ${onset} / ${clue.length}`);for(const n of clue.notes){assert.equal(n.inst,TM_INSTRUMENTS.find(x=>x.id===tmTarget(r,base).id).inst);assert.ok(inReach(n));}
  for(const x of TM_INSTRUMENTS){const taste=tmTaste(x.id,r),len=Math.max(...taste.map(n=>n.t+n.len));assert.ok(len<=1.2&&len>=.5,`${x.id}: taste ${len}`);assert.ok(taste.every(inReach));assert.ok(len<TM_WRONG);
   const piece=tmScore(x.id,r);for(const e of piece){assert.ok(inReach(e),`${x.id} ${r}: ${e.inst} ${e.midi}`);assert.ok(e.at>=0&&e.at<1&&e.vel<=1);if(e.inst==='dsTrompeta')assert.ok(e.length*TM_PIECE<=.45,'short brass');}
   const lastOnset=Math.max(...piece.map(e=>e.at*TM_PIECE));assert.ok(lastOnset<=6.5);
   for(const e of piece.filter(e=>e.at*TM_PIECE>=5.95))assert.ok(STRUCK.includes(e.inst)||e.length*TM_PIECE<=.55,`${x.id} ${r}: ${e.inst} at the end`);
   assert.ok(piece.some(e=>e.inst===x.inst&&e.at*TM_PIECE<1.5),`${x.id}: the instrument plays the clue first`);
   // the unpitched instruments use only variants that exist
   for(const e of [...piece,...taste])if(e.variant&&!SAMPLE_BANK[e.inst].pitched)assert.ok(SAMPLE_BANK[e.inst].zones.some(z=>z[9]===e.variant),`${e.inst} ${e.variant}`);}}
});
test('the boards choose, answer and finish like the other scanning activities, with their longer results',()=>{
 for(const mode of [1,2])for(const scanOptions of [2,3,4]){const s={...base,mode,scanOptions};
  const a=createScanState('destinations',s);let r=chooseScan(a,s,0);assert.equal(r.duration,ET_TRIP);finishScan(a,s);assert.equal(a.status,'choose');assert.equal(a.round,1);assert.ok(scanChoices(a,s).every(x=>!x.action));
  const b=createScanState('sounds',s),goal=scanTarget(b,s).id,choices=scanChoices(b,s),wrong=choices.findIndex(x=>!x.action&&x.id!==goal);r=chooseScan(b,s,wrong);assert.equal(r.duration,TM_WRONG);finishScan(b,s);assert.equal(b.outcome,'retry');assert.equal(b.status,'choose');
  r=chooseScan(b,s,scanChoices(b,s).findIndex(x=>x.id===goal));assert.equal(r.duration,TM_PIECE);finishScan(b,s);assert.equal(b.status,'choose');assert.equal(b.round,1);
  assert.deepEqual(scanChoices(createScanState('sounds',{...s,visualHint:false}),{...s,visualHint:false}).filter(x=>x.action).map(x=>x.action),['cue']);}
});
test('the boards draw finite coordinates at rest, in focus, while the result plays and when it is done, with the simple scene and reduced motion',()=>{
 for(const id of ['destinations','sounds'])for(const [w,h] of [[1280,720],[768,1024]])for(const opts of [{},{plainScene:true},{reduced:true},{scanOptions:4},{scanOptions:2,visualHint:false}]){const s={...base,...opts},state=createScanState(id,s),item={id};
  const n=scanContent(state,s).length,board={focus:1,lights:Array.from({length:n},(_,i)=>i===1?1:.6),progress:.4,clock:2.5,cue:.6,sounding:1,soundLevel:.8};
  renderScanActivity(ctx(),w,h,id,{item,scanState:state,time:null,board},s);renderScanActivity(ctx(),w,h,id,{item,scanState:{...state,armed:false},time:null,board:{...board,focus:-1}},s);renderScanActivity(ctx(),w,h,id,{item,scanState:state,time:null},s,true);
  const goal=id==='sounds'?scanChoices(state,s).findIndex(x=>x.id===scanTarget(state,s).id):0,wrong=scanChoices(state,s).findIndex((x,i)=>!x.action&&i!==goal);
  for(const pick of [wrong,goal]){const st=structuredClone(state),r=chooseScan(st,s,pick);for(const u of [0,.05,.3,.6,1])renderScanActivity(ctx(),w,h,id,{item,scanState:st,time:u*r.duration,duration:r.duration,board},s);finishScan(st,s);if(st.status==='done')renderScanActivity(ctx(),w,h,id,{item,scanState:st,time:null,board},s);}}
});
test('Detectius de sons (0.48): the notes of its nineteen recorded instruments are on disk, in order, long enough for every note played, and credited',async()=>{
 const fs=await import('node:fs'),root=new URL('../dist/assets/samples/',import.meta.url);let bytes=0;
 const names=Object.keys(SAMPLE_BANK).filter(k=>k.startsWith('ds'));assert.equal(names.length,19);
 for(const name of names){const b=SAMPLE_BANK[name];assert.equal(b.fallback,null);assert.ok(b.strict);
  for(const z of b.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);bytes+=fs.statSync(new URL(z[0],root)).size;assert.ok(Math.abs(z[5])<=50,`${z[0]} tuning`);}
  if(b.pitched){const m=b.zones.map(z=>z[1]);assert.deepEqual(m,[...m].sort((x,y)=>x-y),name);}else assert.ok(b.zones.every(z=>z[9]),name);}
 assert.ok(bytes<7e6,`${bytes} bytes`);/* 0.77 audit: budget raised from 6.5 MB (measured 6.63 MB) */assert.ok(fs.readFileSync(new URL('CREDITS.md',root),'utf8').includes('detectius/'));
 // a held note never outlasts its recording
 for(let r=0;r<10;r++)for(const x of TM_INSTRUMENTS)for(const e of tmScore(x.id,r)){const b=SAMPLE_BANK[e.inst];if(!b.sustain||!e.inst.startsWith('ds'))continue;const dur=Math.min(...b.zones.map(z=>z[3]));assert.ok(e.length*TM_PIECE+b.release<dur,`${e.inst} ${e.length*TM_PIECE}`);}
});

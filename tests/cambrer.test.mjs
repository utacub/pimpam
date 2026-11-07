// 0.23: El cambrer equilibrista (CE31). At each press something flies out of the kitchen door onto the waiter's tray; the pile grows
// and sways more and more; at the final a jelly lands on top, a small mishap brings it all down in slow motion, every thing lands
// somewhere safe and the jelly lands on the waiter's head.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {CB_ITEMS,CB_HEROES,CB_PLACES,CB_SLIPS,CB_T,CB_FALL,CB_FALL_GAP,CB_STEP_MIN,CB_FINAL_MIN,cbPlan,cbRound,cbStep,cbSway} from '../dist/cambrer.js';
import {drawCambrer} from '../dist/cambrer-art.js';
import {EXTRA_CAUSES} from '../dist/cause-catalog.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];

test('El cambrer: twenty rounds, each waiter in each place once; two rounds in a row change the waiter, the place, the mishap, the key and the first things',()=>{
 const rounds=Array.from({length:20},(_,v)=>cbRound(v));
 assert.equal(new Set(rounds.map(r=>`${r.hero}|${r.place}`)).size,20);
 for(const r of rounds){assert.deepEqual([...r.order].sort(),[0,1,2,3,4,5]);assert.ok(r.hero<CB_HEROES.length&&r.place<CB_PLACES.length&&r.slip<CB_SLIPS.length);}
 for(let v=0;v<20;v++){const a=rounds[v],b=rounds[(v+1)%20];
  for(const k of ['hero','place','slip','key'])assert.notEqual(a[k],b[k],`${v}: ${k}`);
  assert.ok(!a.order.slice(0,2).some(i=>b.order.slice(0,2).includes(i)),`${v}: the first two things`);
  assert.ok(a.order.slice(0,3).filter(i=>b.order.slice(0,3).includes(i)).length<=1,`${v}: the first three things`);}
 for(const r of rounds)for(const s of CB_SLIPS)assert.ok(rounds.some(x=>x.hero===r.hero&&CB_SLIPS[x.slip]===s),`${CB_HEROES[r.hero]} ${s}`);
 assert.deepEqual(cbRound(23),cbRound(3));assert.deepEqual(cbRound(-1),cbRound(19));});

test('El cambrer: each press brings a new thing onto the pile, and the last press is the final with all of them',()=>{
 for(const steps of [3,5,7])for(let v=0;v<20;v++){const seen=[];
  for(let count=1;count<steps;count++){const s=cbStep(v,count,steps);assert.equal(s.final,false);assert.deepEqual(s.done,seen);assert.ok(!seen.includes(s.item));seen.push(s.item);}
  const fin=cbStep(v,steps,steps);assert.equal(fin.final,true);assert.deepEqual(fin.items,seen);assert.equal(seen.length,steps-1);}
 // The pile sways more with each thing.
 for(let k=1;k<7;k++)assert.ok(cbSway(k+1)>cbSway(k));assert.ok(cbSway(7)<.2);});

test('El cambrer: the moments fit in a press, the three mishaps end together, and everything has landed before the jelly',()=>{
 assert.ok(CB_T.step.end<=CB_STEP_MIN-1.5&&CB_T.final.end<=CB_FINAL_MIN-1.5);
 for(const s of CB_SLIPS){const S=CB_T[s];assert.equal(S.go,CB_T[CB_SLIPS[0]].go);assert.ok(Object.values(S).every(t=>t>=CB_T.final.slip&&t<=S.go));}
 assert.ok(CB_T.final.fall>=CB_T.sneeze.go&&CB_T.final.fall+CB_FALL+5*CB_FALL_GAP<CB_T.final.jelly);
 const F=CB_T.final;assert.ok(F.land<F.proud&&F.proud<F.slip&&F.jelly<F.notice&&F.notice<F.laugh&&F.laugh<F.up&&F.up<F.bow&&F.bow<F.end);});

test('El cambrer: each thing rings one marimba note higher than the one before, and the fall plays them again from the bottom up',()=>{
 for(const v of [0,7,13])for(const steps of [3,7]){const notes=[];
  for(let count=1;count<steps;count++){const p=cbPlan(v,count,steps,CB_STEP_MIN),land=CB_T.step.land/p.D;
   notes.push(p.score.find(e=>e.inst==='marimbaRec'&&Math.abs(e.at-land)<1e-6).midi[0]);}
  for(let i=1;i<notes.length;i++)assert.ok(notes[i]>notes[i-1],`${v}: the notes go up`);
  const fin=cbPlan(v,steps,steps,CB_FINAL_MIN),T=CB_T.final;
  const fall=notes.map((_,i)=>fin.score.find(e=>e.inst==='marimbaRec'&&Math.abs(e.at*fin.D-(T.fall+CB_FALL+i*CB_FALL_GAP))<1e-6).midi[0]);
  assert.deepEqual(fall,notes,`${v}: the fall`);}});

test('El cambrer: the cartoon sounds are its own files, and the final has the sound of its own mishap',()=>{
 const bank=SAMPLE_BANK.toonRec;assert.equal(bank.strict,true);assert.equal(bank.fallback,null);
 for(const v of ['clink','jelly','clatter']){const z=bank.zones.find(x=>x[9]===v);assert.ok(z,v);assert.ok(existsSync(new URL('../dist/assets/samples/'+z[0],import.meta.url)),z[0]);}
 for(let v=0;v<20;v++)for(let count=1;count<7;count++)assert.ok(cbPlan(v,count,7,CB_STEP_MIN).score.some(e=>e.inst==='toonRec'&&e.variant==='clink'));
 const own={sneeze:'slideUp',banana:'slideDown',hiccup:null};
 for(let v=0;v<20;v++){const p=cbPlan(v,7,7,CB_FINAL_MIN),slip=CB_SLIPS[cbRound(v).slip],toon=new Set(p.score.filter(e=>e.inst==='toonRec').map(e=>e.variant));
  for(const s of ['jelly','clatter','boing'])assert.ok(toon.has(s),`${v}: ${s}`);
  if(own[slip])assert.ok(toon.has(own[slip]),`${v}: ${slip}`);else assert.ok(p.score.some(e=>e.inst==='woodblockRec'&&e.at*p.D>=CB_T.hiccup.hic1-1e-6&&e.at*p.D<=CB_T.hiccup.go+1e-6),`${v}: the hiccups`);}
 // Nothing is held: the brass and the clarinet play short notes, so no press ever ends on a drone.
 for(let v=0;v<20;v+=3)for(const steps of [3,7])for(let count=1;count<=steps;count++){const D=count===steps?CB_FINAL_MIN:CB_STEP_MIN;
  for(const e of cbPlan(v,count,steps,D).score)if(SAMPLE_BANK[e.inst].sustain)assert.ok(e.length*D<=2.6,`${e.inst} held ${(e.length*D).toFixed(1)} s`);}});

test('El cambrer draws with finite coordinates in every decor, at rest, in each press, at the final, at a change of round, on narrow screens',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1280,720],[1024,768],[400,700]])for(const v of [0,5,13,19])for(const steps of [3,7])for(let count=0;count<=steps;count++){const D=count===steps?CB_FINAL_MIN:CB_STEP_MIN;
  for(const t of count===steps?[0,.7,2.6,3.6,4.46,5,6.1,7.2,7.5,9,10.8,1e3]:[0,.7,1.3,2.5,4.4,1e3])for(const reduced of [false,true]){const c=ctx();
   drawCambrer(c,w,h,{variant:v,count,steps,t,duration:D,from:count===1?(v+19)%20:undefined,idle:reduced?0:t+30,reduced,...decor});assert.ok(c.calls.length>0);}}
 const card=ctx();drawCambrer(card,320,180,{variant:0,count:0,steps:5,preview:true});assert.ok(card.calls.length>50);});

test('El cambrer keeps dark outlines in every decor, and lightens the darkest fills on a black base',()=>{
 const look=decor=>{const strokes=new Set(),fills=new Set(),c=ctx();const proxy=new Proxy(c,{set(o,k,v){if(k==='strokeStyle')strokes.add(v);if(k==='fillStyle')fills.add(v);o[k]=v;return true;},get(o,k){const v=o[k];return typeof v==='function'?v.bind(o):v;}});
  drawCambrer(proxy,1280,720,{variant:0,count:3,steps:7,t:2.4,duration:CB_STEP_MIN,idle:0,reduced:true,...decor});return {strokes,fills};};
 for(const decor of DECORS)assert.ok(look(decor).strokes.has('#2a211e'),`${JSON.stringify(decor)}: dark outlines`);
 assert.ok(look({background:'none'}).fills.has('#596079'),'lighter trousers on black');assert.ok(look({background:'full'}).fills.has('#2e3240'),'the usual trousers with the decor');
 assert.ok(look({background:'none',base:'white'}).fills.has('#2e3240'),'the usual trousers on white');});

test('El cambrer equilibrista is a stage story of the catalogue: CE31, 20 rounds, recorded music, a press of 7.5 s and a final of 13.5 s',()=>{
 const item=EXTRA_CAUSES.find(x=>x.id==='waiter');assert.ok(item);assert.equal(item.code,'CE31');assert.equal(item.kind,'sequence');
 assert.equal(item.variants,20);assert.equal(item.stage,true);assert.equal(item.recorded,true);assert.equal(item.stepMin,CB_STEP_MIN);assert.equal(item.finalMin,CB_FINAL_MIN);
 assert.equal(CB_ITEMS.length,6);});

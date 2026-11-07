// Phase 5 (0.21): the funny cartoon activities. El mag desastrós (CE29), a magician in a painted theatre whose tricks go wrong in a
// different way at each press; what falls stays on stage until the final, when everything vanishes and he takes a bow.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {MG_GAGS,MG_T,MG_STEP_MIN,MG_FINAL_MIN,MG_VANISH,mgPlan,mgRound,mgStep} from '../dist/mag.js';
import {drawMag} from '../dist/mag-art.js';
import {EXTRA_CAUSES} from '../dist/cause-catalog.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];
const n=c=>c.calls.filter(k=>k==='drawImage'||k==='fill'||k==='stroke').length;

test('El mag desastrós: twenty different rounds; two rounds in a row change the curtain, the backdrop and the coat, and start with other tricks',()=>{
 const all=new Set(),pairs=new Set();
 for(let v=0;v<20;v++){const r=mgRound(v),p=mgRound((v+1)%20);all.add(`${r.order.join('')}|${r.curtain}|${r.back}|${r.coat}|${r.key}`);pairs.add(`${r.curtain}|${r.back}`);
  assert.deepEqual([...r.order].sort(),[0,1,2,3,4,5],`round ${v}: each trick once`);
  assert.notEqual(r.curtain,p.curtain);assert.notEqual(r.back,p.back);assert.notEqual(r.coat,p.coat);
  for(const g of r.order.slice(0,2))assert.ok(!p.order.slice(0,2).includes(g),`rounds ${v} and ${(v+1)%20} share a first trick`);}
 assert.equal(all.size,20);assert.equal(pairs.size,20,'every curtain with every backdrop');});

test('El mag desastrós: each press of a round is another trick, and the last press is the final',()=>{
 for(let v=0;v<20;v++)for(const steps of [3,5,7]){const seen=new Set();
  for(let count=1;count<steps;count++){const s=mgStep(v,count,steps);assert.equal(s.final,false);assert.ok(MG_GAGS[s.gag]);assert.ok(!seen.has(s.gag));seen.add(s.gag);assert.equal(s.done.length,count-1);}
  const f=mgStep(v,steps,steps);assert.equal(f.final,true);assert.equal(f.tricks.length,steps-1);assert.deepEqual(new Set(f.tricks),seen);}});

test('El mag desastrós: every trick has its own cartoon sound, and the cartoon sounds are files of their own',()=>{
 const own={scarf:'slideDown',flower:'squirt',wand:'boing',feathers:'poof',cards:'cards',cloth:'yank'};
 for(let v=0;v<20;v++)for(let count=1;count<7;count++){const p=mgPlan(v,count,7,MG_STEP_MIN);
  assert.ok(p.score.some(e=>e.inst==='toonRec'&&e.variant===own[p.name]),`round ${v}: ${p.name}`);}
 const fin=mgPlan(3,7,7,MG_FINAL_MIN);for(const v of ['slideDown','boing','slideUp'])assert.ok(fin.score.some(e=>e.inst==='toonRec'&&e.variant===v),v);
 const bank=SAMPLE_BANK.toonRec;assert.equal(bank.strict,true);assert.equal(bank.fallback,null);assert.equal(bank.sustain,false);
 for(const z of bank.zones)assert.ok(existsSync(new URL('../dist/assets/samples/'+z[0],import.meta.url)),z[0]);
 // Nothing is held: the brass and the clarinet play short notes, so no press ever ends on a drone.
 for(let v=0;v<20;v+=3)for(const steps of [3,7])for(let count=1;count<=steps;count++){const D=count===steps?MG_FINAL_MIN:MG_STEP_MIN;
  for(const e of mgPlan(v,count,steps,D).score)if(SAMPLE_BANK[e.inst].sustain)assert.ok(e.length*D<=2.6,`${e.inst} held ${(e.length*D).toFixed(1)} s`);}});

test('El mag desastrós: what falls stays on stage until the final, and the final clears it all',()=>{
 const at=(steps,count,t)=>{const c=ctx();drawMag(c,1280,720,{variant:6,count,steps,t,duration:count===steps?MG_FINAL_MIN:MG_STEP_MIN,held:1e3,idle:0,reduced:true});return n(c);};
 // after the third trick, more is drawn than after the first; at the end of the final, the stage is the same whatever came before
 assert.ok(at(7,4,.1)>at(7,2,.1),'the mess builds up');
 assert.ok(at(7,7,MG_T.final.clean-.2)>at(3,3,MG_T.final.clean-.2),'before the clean-up the mess of six tricks is still there');
 assert.equal(at(7,7,MG_T.final.end+.4),at(3,3,MG_T.final.end+.4),'after it, nothing is left');
 // the mess of each trick vanishes in a small sparkle, never more than three a second, all before the bow, each with a glockenspiel note
 assert.ok(MG_VANISH>=1/3);assert.ok(MG_T.final.clean+5*MG_VANISH+.35<MG_T.final.bow);
 for(const steps of [3,5,7]){const p=mgPlan(2,steps,steps,MG_FINAL_MIN),notes=p.score.filter(e=>e.inst==='glockRec'&&(q=>Math.abs(q-Math.round(q))<1e-6)((e.at*MG_FINAL_MIN-MG_T.final.clean-.05)/MG_VANISH)&&e.at*MG_FINAL_MIN>MG_T.final.clean);
  assert.equal(notes.length,steps,`${steps} steps: a note per trick and the top one`);}});

test('El mag desastrós draws with finite coordinates in every decor, at rest, in each trick, at the final, at a change of round, on narrow screens',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1280,720],[1024,768],[400,700]])for(const v of [0,5,13,19])for(const steps of [3,7])for(let count=0;count<=steps;count++){const D=count===steps?MG_FINAL_MIN:MG_STEP_MIN;
  for(const t of count?[0,.6,1.5,2.5,3.3,4.5,6,7.4,9,10.6,12,D-.1,1e3].filter(x=>x<D||x===1e3):[1e3])for(const reduced of [false,true]){const c=ctx();
   drawMag(c,w,h,{variant:v,count,steps,t,duration:D,held:count>1?2:undefined,from:count===1?(v+19)%20:undefined,idle:reduced?0:t+30,reduced,...decor});assert.ok(c.calls.length>0);}}
 const card=ctx();drawMag(card,320,180,{variant:0,count:0,steps:5,preview:true});assert.ok(card.calls.length>20);});

test('El mag desastrós is a stage story of the catalogue: CE29, 20 rounds, recorded music, a trick of 8 s and a final of 13.5 s',()=>{
 const item=EXTRA_CAUSES.find(x=>x.id==='magician');assert.ok(item);assert.equal(item.code,'CE29');assert.equal(item.kind,'sequence');
 assert.equal(item.variants,20);assert.equal(item.stage,true);assert.equal(item.recorded,true);assert.equal(item.stepMin,MG_STEP_MIN);assert.equal(item.finalMin,MG_FINAL_MIN);
 assert.ok(MG_T.final.end<MG_FINAL_MIN&&Object.values(MG_T).filter(x=>x!==MG_T.final).every(x=>x.end<=MG_STEP_MIN-1.5));});

// 0.21.1: the outlines stay dark without decor or with the decor dimmed (they used to turn cream on black); on black, the darkest
// fills are lighter instead, so that the magician stands out.
test('El mag desastrós keeps dark outlines in every decor, and lightens the darkest fills on a black base',()=>{
 const strokes=decor=>{const seen=new Set(),fills=new Set(),c=ctx();const proxy=new Proxy(c,{set(o,k,v){if(k==='strokeStyle')seen.add(v);if(k==='fillStyle')fills.add(v);o[k]=v;return true;},get(o,k){const v=o[k];return typeof v==='function'?v.bind(o):v;}});
  drawMag(proxy,1280,720,{variant:0,count:3,steps:7,t:3.4,duration:MG_STEP_MIN,idle:0,reduced:true,...decor});return {seen,fills};};
 for(const decor of DECORS){const {seen}=strokes(decor);assert.ok(seen.has('#1c1322'),`${JSON.stringify(decor)}: dark outlines`);assert.ok(!seen.has('#f2ead8'),`${JSON.stringify(decor)}: no cream outlines`);}
 assert.ok(strokes({background:'none'}).fills.has('#4a4170'),'a lighter coat on black');assert.ok(strokes({background:'full'}).fills.has('#29233f'),'the usual coat with the decor');
 assert.ok(strokes({background:'none',base:'white'}).fills.has('#29233f'),'the usual coat on white');});

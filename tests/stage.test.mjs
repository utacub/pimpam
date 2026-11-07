// The stage stories: the shared engine (escenari.js), L'orquestra que es desperta (CE12) and El cel de les constel·lacions (CE10)
// of phase 1 (0.14), Fem castells (CE25) of phase 2 (0.15), Festa de globus (CE27, 0.20), El mag desastrós (CE29, 0.21) and El cambrer equilibrista (CE31, 0.23). Each press must bring a moment of its own, each round must differ, and the music must stay within the reach
// of the recorded instruments and end on plucked or struck notes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {escGroups,escAges,escReached} from '../dist/escenari.js';
import {oqPlan,oqRound,OQ_STEP_MIN,OQ_FINAL_MIN} from '../dist/orquestra.js';
import {skPlan,skRound,SK_EVENTS,SK_STEP_MIN,SK_FINAL_MIN} from '../dist/constel.js';
import {drawOrquestra} from '../dist/orquestra-art.js';
import {drawConstel} from '../dist/constel-art.js';
import {femPlan,femRound,femEvent,femLeave,FEM_EVENTS,FEM_STEP_MIN,FEM_FINAL_MIN,FEM_DOWN,FEM_DOWN_GAP,FEM_TOC,FEM_PRESSES} from '../dist/castells.js';
import {drawCastells,fmDecor} from '../dist/castells-art.js';
import {gbPlan,GB_STEP_MIN,GB_FINAL_MIN} from '../dist/globus.js';
import {mgPlan,MG_STEP_MIN,MG_FINAL_MIN} from '../dist/mag.js';
import {cbPlan,CB_STEP_MIN,CB_FINAL_MIN} from '../dist/cambrer.js';
import {defaults,validateProfile,FEM_SHIRT_COLORS} from '../dist/input.js';
import {existsSync,readFileSync} from 'node:fs';
import {SAMPLE_BANK} from '../dist/sampler.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const STORIES=[['orquestra',oqPlan,OQ_STEP_MIN,OQ_FINAL_MIN],['constel',skPlan,SK_STEP_MIN,SK_FINAL_MIN],['globus',gbPlan,GB_STEP_MIN,GB_FINAL_MIN],['mag',mgPlan,MG_STEP_MIN,MG_FINAL_MIN],['cambrer',cbPlan,CB_STEP_MIN,CB_FINAL_MIN]];

test('the seven moments are shared out between 3, 5 or 7 presses, and the last press is always the final',()=>{
 assert.deepEqual(escGroups(7),[[0],[1],[2],[3],[4],[5],[6]]);
 assert.deepEqual(escGroups(5),[[0,1],[2],[3,4],[5],[6]]);
 assert.deepEqual(escGroups(3),[[0,1,2],[3,4,5],[6]]);
 // The press cut short keeps its own clock (held + t); older ones are settled; the moments of a group come in one after another.
 const a=escAges(2,5,1,3,.5);assert.deepEqual(a.slice(0,4),[4,3.5,1,-1]);assert.equal(escAges(3,5,1,3,.5)[0],1e4);
 const b=escAges(1,5,.3,undefined,.5);assert.deepEqual(b.slice(0,2),[.3,-1]);assert.equal(escReached(escAges(3,3,0,0)),7);});

for(const [name,plan,stepMin,finalMin] of STORIES){
 test(`${name}: every press of every round has music of its own, within reach of the recordings, ending on plucked or struck notes`,()=>{
  for(const steps of [3,5,7])for(let v=0;v<20;v++){const seen=new Set();
   for(let count=1;count<=steps;count++){const D=count===steps?finalMin:stepMin,p=plan(v,count,steps,D);assert.ok(p.score.length>4,`${name} ${v} ${count}/${steps}: music`);
    for(const e of p.score){const z=SAMPLE_BANK[e.inst];assert.ok(z,`${e.inst} is recorded`);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9,'inside the press');
     if(z.pitched&&e.inst!=='natureRec')for(const m of e.midi)assert.ok(z.zones.some(q=>Math.abs(q[1]-m)<=4),`${name} ${v} ${count}/${steps}: ${e.inst} ${m} out of reach`);}
    const notes=p.score.filter(e=>e.inst!=='natureRec'),last=Math.max(...notes.map(e=>e.at));
    assert.ok(notes.filter(e=>e.at>last-.02).some(e=>!SAMPLE_BANK[e.inst].sustain),`${name} ${v} ${count}/${steps}: ends on a plucked or struck note`);
    assert.ok(p.close<=D-1.5,`${name} ${v} ${count}/${steps}: the closing chord rings out before the end`);
    const key=JSON.stringify(notes.map(e=>[e.inst,e.midi,Math.round(e.at*1e3)]));assert.ok(!seen.has(key),`${name} ${v}: press ${count} repeats another`);seen.add(key);}}});
}

test('the orchestra: twenty different rounds (place, piece and order of the sections)',()=>{
 const rounds=new Set(Array.from({length:20},(_,v)=>{const r=oqRound(v);return `${r.place}|${r.piece}|${r.order.join('')}`;}));assert.equal(rounds.size,20);
 for(let v=0;v<20;v++)assert.deepEqual([...oqRound(v).order].sort(),[0,1,2,3,4,5],'each section wakes once');});

test('the sky: twenty different rounds, and six different events in each one, possible in its landscape and season',()=>{
 const rounds=new Set();for(let v=0;v<20;v++){const r=skRound(v);rounds.add(`${r.figure}|${r.land}|${r.season}`);assert.equal(new Set(r.events).size,6);
  for(const id of r.events){const e=SK_EVENTS[id];assert.ok(e,id);assert.ok(!e.lands||e.lands.includes(r.land),`${id} in landscape ${r.land}`);assert.ok(!e.seasons||e.seasons.includes(r.season),`${id} in season ${r.season}`);}
  // Every press before the final brings at least one event, and the events of the round differ from those of the round before.
  for(const steps of [3,5,7])for(let count=1;count<steps;count++)assert.ok(skPlan(v,count,steps,SK_STEP_MIN).events.length>=1);
  if(v)assert.notDeepEqual(r.events,skRound(v-1).events);}
 assert.equal(rounds.size,20);});

test('the stories draw with finite coordinates at rest, during each press, at the final, at a change of round and with reduced motion',()=>{
 for(const [draw,stepMin,finalMin] of [[drawOrquestra,OQ_STEP_MIN,OQ_FINAL_MIN],[drawConstel,SK_STEP_MIN,SK_FINAL_MIN],[drawCastells,FEM_STEP_MIN,FEM_FINAL_MIN]])for(const v of [0,1,2,3,6,10,13,15,18,19])for(const steps of [3,7]){
  for(let count=0;count<=steps;count++){const D=count===steps?finalMin:stepMin;for(const t of count?[0,.7,2.5,D*.5,D-.2,1e3]:[1e3])for(const reduced of [false,true]){const c=ctx();
   assert.equal(draw(c,1000,700,{variant:v,count,steps,t,duration:D,held:count>1?2:undefined,from:count===1?(v+19)%20:undefined,idle:reduced?0:t+40,reduced}),true);assert.ok(c.calls.length>20);}}
  for(const t of [1.5,4,8.9,9.5,10.6,12.9]){const c=ctx();drawConstel(c,1000,700,{variant:v,count:steps,steps,t,duration:SK_FINAL_MIN,held:1,idle:t});}}});

test('the sky goes quiet at the end of the final: the last frame draws as little as the rest before the next round',()=>{
 for(const v of [0,4,10,15]){const end=ctx(),rest=ctx();drawConstel(end,1000,700,{variant:v,count:7,steps:7,t:SK_FINAL_MIN-.01,duration:SK_FINAL_MIN,held:1e3,idle:50});drawConstel(rest,1000,700,{variant:v,count:0,steps:7,t:1e3,idle:50});
  const fills=c=>c.calls.filter(k=>k==='fill'||k==='stroke').length;assert.ok(fills(end)<=fills(rest)+4,`round ${v}: ${fills(end)} shapes at the end, ${fills(rest)} at rest`);}});

test('the castells: twenty different rounds; two rounds in a row change the castell, the square, the time of day and the colla',()=>{
 const rounds=new Set();for(let v=0;v<20;v++){const r=femRound(v),p=femRound((v+19)%20);rounds.add(`${r.per}|${r.place}|${r.time}|${r.shirt}`);
  assert.deepEqual([...r.events].sort(),[...FEM_EVENTS].sort(),'each event of the square once');
  for(const k of ['per','place','time','shirt'])assert.notEqual(r[k],p[k],`round ${v}: ${k} repeats the round before`);
  assert.deepEqual(Array.from({length:7},(_,k)=>femEvent(r,k)).slice(5),['mans','confeti']);
  // By day, no blue or teal shirts (they would fade into the sky); at sunset, only green, blue or teal.
  assert.ok(r.time===2?['#2f9e52','#2f6fd1','#14a0a6'].includes(r.shirt):!['#2f6fd1','#14a0a6'].includes(r.shirt),`round ${v}: shirt for the time of day`);}
 assert.equal(rounds.size,20);});

test('the castells: the castell comes down level by level after the aleta, and the colla leaves before the final ends',()=>{
 for(const D of [FEM_FINAL_MIN,18,25]){const L=femLeave(D);assert.ok(L.at>=FEM_DOWN+6*FEM_DOWN_GAP,'the pinya opens once the castell is down');assert.ok(L.at+L.len<=D-.5,'gone before the end');}
});

test('the castells (0.45.8): each press plays the next piece of the real toc, once, inside the press; the seventh holds the end of the toc on the aleta',()=>{
 const z=SAMPLE_BANK.tocRec;assert.ok(z&&z.strict&&z.fallback===null,'a recording, never replaced');assert.equal(z.zones.length,FEM_PRESSES);
 for(let k=1;k<=FEM_PRESSES;k++){const zone=z.zones.find(q=>q[9]===`toc${k}`);assert.ok(zone,`piece ${k}`);assert.equal(zone[3],FEM_TOC[k-1],'the length in the bank is the length in castells.js');
  assert.ok(existsSync(new URL(`../dist/assets/samples/${zone[0]}`,import.meta.url)),zone[0]);assert.ok(readFileSync(new URL('../dist/assets/samples/CREDITS.md',import.meta.url),'utf8').includes(zone[0].split('/').pop()),`${zone[0]} credited`);
  for(const v of [0,7,19]){const D=k===FEM_PRESSES?FEM_FINAL_MIN:FEM_STEP_MIN,p=femPlan(v,k,7,D);assert.equal(p.score.length,1);const e=p.score[0];
   assert.equal(e.inst,'tocRec');assert.equal(e.variant,`toc${k}`);assert.ok(e.at*D<.1&&(e.at+e.length)*D<=D-.39,'starts at once and ends before the press does');}}
 assert.ok(FEM_TOC.slice(0,-1).every(l=>l<=FEM_STEP_MIN-.4),'each piece fits the shortest press');assert.ok(FEM_TOC.at(-1)<=FEM_FINAL_MIN-.4);assert.equal(FEM_TOC.length,FEM_PRESSES);});

test('the castells: the plain background setting (fons senzill) is off by default, only takes true or false, and draws',()=>{
 assert.equal(defaults.plainScene,false);assert.equal(validateProfile({plainScene:true}).plainScene,true);assert.throws(()=>validateProfile({plainScene:1}));
 for(const count of [0,3,7]){const c=ctx();assert.equal(drawCastells(c,1280,720,{variant:5,count,steps:7,t:count?2:1e3,duration:count===7?FEM_FINAL_MIN:FEM_STEP_MIN,idle:3,plain:true}),true);assert.ok(c.calls.length>50);}});
test('the castells: the decor setting (0.16.1) leaves the castell on the base colour, dims the square or shows it whole, and the cards always show it',()=>{
 assert.deepEqual((({mode,fade,base})=>({mode,fade,base}))(fmDecor({background:'none',base:'black'})),{mode:'none',fade:0,base:'#000000'});
 assert.deepEqual((({mode,fade,base})=>({mode,fade,base}))(fmDecor({background:'none',base:'white'})),{mode:'none',fade:0,base:'#ffffff'});
 assert.equal(fmDecor({background:'dim',opacity:40}).fade,.4);assert.equal(fmDecor({background:'full'}).fade,1);assert.equal(fmDecor({}).mode,'full');
 assert.equal(fmDecor({background:'none',preview:true}).mode,'full');
 const draw=decor=>{const c=ctx();assert.equal(drawCastells(c,1280,720,{variant:4,count:5,steps:5,t:9,duration:FEM_FINAL_MIN,idle:3,...decor}),true);return c.calls.length;};
 const none=draw({background:'none',base:'black'}),dim=draw({background:'dim',opacity:30,base:'white'}),full=draw({background:'full'});
 assert.ok(none>50&&none<full,'without the decor, the square is not drawn');assert.ok(dim>none+20,'dimmed, the square is drawn and veiled');
 // a new round coming in over the old one, in every mode
 for(const background of ['full','dim','none']){const c=ctx();assert.equal(drawCastells(c,1280,720,{variant:6,count:1,steps:5,t:.8,duration:FEM_STEP_MIN,idle:2,from:5,background,opacity:50}),true);}});

test('Fem castells: the adult can fix the shirt colour of the colla (0.45.6), and the default keeps the colour of each round', () => {
 assert.equal(defaults.femShirt,'ronda');
 assert.ok(Object.keys(FEM_SHIRT_COLORS).length>=12);
 for(const c of Object.values(FEM_SHIRT_COLORS))assert.match(c,/^#[0-9a-f]{6}$/);
 assert.equal(validateProfile({...defaults,femShirt:'verd'}).femShirt,'verd');
 assert.throws(()=>validateProfile({...defaults,femShirt:'Castellers de Vilafranca'}));
 const own=FEM_SHIRT_COLORS.malva,seen=new Set();
 for(let v=0;v<20;v++){const a=femRound(v),b=femRound(v,own);seen.add(a.shirt);assert.equal(b.shirt,own);
  assert.deepEqual({...b,shirt:a.shirt},a);}
 assert.ok(seen.size>=6,'without a fixed colour the rounds keep changing it');
 assert.equal(femRound(3,'not a colour').shirt,femRound(3).shirt);
});

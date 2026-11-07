// Phase 4 of the redesign (0.20): Festa de globus (CE27), a story of balloons sewn in felt, and El far (CE28), a timing activity: the
// light of a lighthouse sweeps a night sea and a press while it is on a boat brings the boat home.
import test from 'node:test';
import assert from 'node:assert/strict';
import {gbRound,gbPlan,GB_STEP_MIN,GB_FINAL_MIN,GB_LIFT,GB_FLY} from '../dist/globus.js';
import {drawGlobus} from '../dist/globus-art.js';
import {FAR_ARRIVE,FAR_FINAL,FAR_MISS,FAR_STEP,FAR_SAIL,FAR_NIGHT,FAR_BERTHS,FAR_SPEEDS,FAR_WINDOWS,farDock,farEnsure,farGap,farNear,farPool,farPress,farScore,farTick,farPeriod,farWindow} from '../dist/far.js';
import {drawFar,frNight,frTrack} from '../dist/far-art.js';
import {EXTRA_CAUSES,beginCause,causeBusy,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {defaults,validateProfile} from '../dist/input.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];

test('Festa de globus: twenty rounds; two rounds in a row change the square, the time of day and the shape of the balloons',()=>{
 const all=new Set();for(let v=0;v<20;v++){const r=gbRound(v),p=gbRound((v+1)%20);all.add(`${r.place}|${r.time}|${r.shape}|${r.colors[0]}|${r.key}|${r.tune.join('')}`);
  assert.notEqual(r.place,p.place);assert.notEqual(r.time,p.time);assert.notEqual(r.shape,p.shape);assert.equal(r.spots.length,7);assert.equal(r.colors.length,7);}
 assert.equal(all.size,20);});

test('Festa de globus: the final ends with the balloons rising together; the whole tune is played and no balloon bursts',()=>{
 for(const v of [0,7,13])for(const steps of [3,5,7]){const p=gbPlan(v,steps,steps,GB_FINAL_MIN);assert.ok(p.final);
  const marimba=p.score.filter(e=>e.inst==='marimbaRec'&&e.at*GB_FINAL_MIN>GB_LIFT);assert.ok(marimba.length>=7,'the whole tune after the lift');
  assert.ok(p.score.some(e=>e.inst==='harpRec'&&Math.abs(e.at*GB_FINAL_MIN-(GB_LIFT-.4))<.05),'a harp glissando as they rise');
  assert.ok(!p.score.some(e=>['snareRec','bassdrumRec','timpaniRec'].includes(e.inst)),'nothing that sounds like a burst');}
 // after the flight, every balloon has left the sky: the last frame of the final draws only the square
 const end=ctx(),rest=ctx();drawGlobus(end,1000,700,{variant:2,count:5,steps:5,t:GB_LIFT+GB_FLY+1.2,duration:GB_FINAL_MIN,held:1e3,idle:9});drawGlobus(rest,1000,700,{variant:2,count:0,steps:5,t:1e3,idle:9});
 const n=c=>c.calls.filter(k=>k==='drawImage'||k==='fill'||k==='stroke').length;assert.equal(n(end),n(rest));});

test('Festa de globus draws with finite coordinates in every decor, at rest, in each press, at the final, at a change of round, in portrait',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1000,700],[400,700]])for(const v of [0,4,9,19])for(const steps of [3,7])for(let count=0;count<=steps;count++){const D=count===steps?GB_FINAL_MIN:GB_STEP_MIN;
  for(const t of count?[0,.5,1.4,3,D*.6,D-.1,1e3]:[1e3])for(const reduced of [false,true]){const c=ctx();drawGlobus(c,w,h,{variant:v,count,steps,t,duration:D,held:count>1?2:undefined,from:count===1?(v+19)%20:undefined,idle:reduced?0:t+30,reduced,...decor});assert.ok(c.calls.length>0);}}
 const card=ctx();drawGlobus(card,320,180,{variant:0,count:0,steps:5,preview:true});assert.ok(card.calls.length>20);});

test('El far: the light goes out to sea and back; the gap to a boat is the time to the nearest moment the light is on it',()=>{
 assert.equal(farPool(0),0);assert.equal(farPool(.5),1);assert.ok(Math.abs(farPool(.25)-.5)<1e-9);
 for(const P of Object.values(FAR_SPEEDS))for(const t of [.2,.5,.8]){const c=Math.acos(1-2*t)/(2*Math.PI);assert.ok(farGap(c,t,P)<1e-9);assert.ok(Math.abs(farGap(c+.1,t,P)-Math.min(.1*P,farGap(c+.1,t,P)))<1e-9);
  assert.ok(Math.abs(farGap(1-c,t,P))<1e-9,'it passes over each boat twice a cycle');assert.equal(farNear(c,t,P,2),1);for(let q=0;q<50;q++){const ph=q/50;assert.equal(farNear(ph,t,P,2)>0,farGap(ph,t,P)<1);}}});

test('El far: a press inside the window of a boat brings it home, whatever its place; outside it, the water shimmers and nothing is lost',()=>{
 for(const speed of Object.keys(FAR_SPEEDS))for(const win of Object.keys(FAR_WINDOWS))for(const boats of [1,2,3]){const s={...defaults,farSpeed:speed,farWindow:win,farBoats:boats},P=farPeriod(s),W=farWindow(s);
  for(let j=0;j<boats;j++){const g=farEnsure({variant:3},s);g.farNow=10;const b=g.farSea[j],c=Math.acos(1-2*b.t)/(2*Math.PI);
   // just inside the window (in time), the press is a hit on this boat or on another one that is also within reach
   g.farBeam=c+(W/2-.05)/P;const before=g.farSea.map(x=>x.t),k=farPress(g,s);assert.notEqual(k,'miss',`${speed} ${win} ${boats}: boat ${j} at ${b.t.toFixed(2)}`);assert.ok(g.farRet);
   const far=farEnsure({variant:3},s);far.farNow=10;let ph=0,best=-1;for(let q=0;q<400;q++){const p=q/400,m=Math.min(...far.farSea.map(x=>farGap(p,x.t,P)));if(m>best){best=m;ph=p;}}
   if(best>W/2+.01){far.farBeam=ph;assert.equal(farPress(far,s),'miss');assert.equal(far.farRet,null);assert.deepEqual(far.farSea.map(x=>x.t),far.farSea.map(x=>x.t));assert.ok(far.farMiss);}
   assert.deepEqual(before,g.farSea.map(x=>x.t),'the boats stay where they are until the boat is home');}}});

test('El far: the light waits while it guides a boat home; at the jetty a new boat comes in its place; three boats change the night',()=>{
 const s={...defaults,farBoats:2},item=EXTRA_CAUSES.find(x=>x.id==='lighthouse');assert.ok(item.beam);
 const g={item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null};farEnsure(g,s);g.farNow=10;
 for(let home=1;home<=FAR_BERTHS;home++){g.farNow+=FAR_ARRIVE;const b=g.farSea[0];g.farBeam=Math.floor(g.farBeam)+Math.acos(1-2*b.t)/(2*Math.PI);
  assert.ok(beginCause(g,s));assert.ok(g.farRet);assert.equal(g.duration,home===FAR_BERTHS?FAR_FINAL:FAR_STEP);assert.equal(causeBusy(g,s),true,'a press while the boat goes home is not taken');assert.equal(beginCause(g,s),false);
  const phase=g.farBeam;farTick(g,s,2);assert.equal(g.farBeam,phase,'the light stays on the boat');assert.equal(retimeCause(g,s,10),false);
  g.time=g.duration;finishCause(g,s);assert.equal(g.time,null);assert.equal(g.farRet,null);assert.equal(farPool(g.farBeam),1,'the light starts again from the port');
  if(home<FAR_BERTHS){assert.equal(g.farHome,home);assert.equal(g.farDocked.length,home);assert.notDeepEqual(g.farSea[0],b);assert.equal(g.variant,0);}
  else{assert.equal(g.farHome,0);assert.deepEqual(g.farDocked,[]);assert.equal(g.variant,1);assert.equal(g.completed,1);}}
 // a press away from the boats: a short shimmer, not busy, and the light goes on
 let ph=0,best=-1;for(let q=0;q<400;q++){const p=q/400,m=Math.min(...g.farSea.map(x=>farGap(p,x.t,farPeriod(s))));if(m>best){best=m;ph=p;}}g.farBeam=ph;
 assert.ok(beginCause(g,s));assert.equal(g.duration,FAR_MISS);assert.equal(causeBusy(g,s),false);const phase=g.farBeam;farTick(g,s,1);assert.ok(g.farBeam>phase);finishCause(g,s);assert.equal(g.farMiss,null);});

test('El far: the settings are checked, and changing the number of boats changes the sea without losing the boat on its way home',()=>{
 const p=validateProfile({...defaults,farSpeed:'fast',farWindow:'narrow',farBoats:3});assert.equal(p.farSpeed,'fast');assert.equal(p.farBoats,3);
 assert.throws(()=>validateProfile({...defaults,farSpeed:'turbo'}));assert.throws(()=>validateProfile({...defaults,farWindow:2}));assert.throws(()=>validateProfile({...defaults,farBoats:4}));
 assert.equal(defaults.farSpeed,'slow');assert.equal(defaults.farWindow,'wide');assert.equal(defaults.farBoats,1);
 const g=farEnsure({variant:0},{farBoats:3});g.farNow=10;g.farBeam=Math.acos(1-2*g.farSea[2].t)/(2*Math.PI);assert.notEqual(farPress(g,{farBoats:3}),'miss');
 farEnsure(g,{farBoats:1});assert.equal(g.farSea.length,1);assert.ok(g.farRet);assert.ok(farDock(g,{farBoats:1}));assert.equal(g.farSea.length,1);assert.equal(g.farHome,1);});

test('El far: the music of each kind of press is within reach of the recordings and ends on plucked or struck notes; twenty tunes',()=>{
 const tunes=new Set();for(const kind of ['home','final','miss'])for(let tune=0;tune<20;tune++)for(const p of [0,.5,1]){const D=kind==='miss'?FAR_MISS:kind==='final'?FAR_FINAL:FAR_STEP,score=farScore(kind,tune,p,D);assert.ok(score.length>=2);
  for(const e of score){const z=SAMPLE_BANK[e.inst];assert.ok(z,e.inst);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9);if(z.pitched)for(const m of e.midi)assert.ok(z.zones.some(q=>Math.abs(q[1]-m)<=4),`${kind} ${tune}: ${e.inst} ${m}`);}
  const last=Math.max(...score.map(e=>e.at));assert.ok(score.filter(e=>e.at>last-.02).some(e=>!SAMPLE_BANK[e.inst].sustain));
  if(kind==='home'){tunes.add(JSON.stringify(score.filter(e=>e.inst==='fluteRec').map(e=>e.midi)));assert.ok(score.some(e=>e.inst==='tubaRec'&&e.at*D>=FAR_SAIL),'the band at the jetty');}
  if(kind==='final')assert.ok(score.some(e=>e.at*D>D-FAR_NIGHT),'notes while the night changes');}
 assert.equal(tunes.size,20);});

test('El far draws with finite coordinates in every decor, at rest, during a shimmer, on the way home, at the change of night, in portrait',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1000,700],[400,700],[1600,600]])for(const boats of [1,3])for(const reduced of [false,true]){const s={farBoats:boats},g=farEnsure({variant:7},s);g.farNow=12;
  for(const ph of [0,.2,.5,.77]){g.farBeam=ph;const c=ctx();drawFar(c,w,h,{game:g,t:null,period:16,window:3,boats,reduced,...decor});assert.ok(c.calls.length>0);}
  g.farBeam=.3;farPress(g,s);for(const t of [0,.3,1]){const c=ctx();drawFar(c,w,h,{game:g,t,duration:g.farRet?FAR_STEP:FAR_MISS,period:16,window:3,boats,reduced,...decor});}
  const b=g.farSea[0];g.farHome=2;g.farDocked=[1,2];g.farBeam=Math.acos(1-2*b.t)/(2*Math.PI);g.farRet=null;assert.equal(farPress(g,s),'final');
  for(const t of [0,.4,3,FAR_SAIL,FAR_SAIL+2,FAR_FINAL-2,FAR_FINAL-.05]){const c=ctx();drawFar(c,w,h,{game:g,t,duration:FAR_FINAL,period:16,window:3,boats,reduced,...decor});assert.ok(c.calls.length>0);}}
 const card=ctx();drawFar(card,320,180,{game:{variant:0},preview:true,period:16,window:3,boats:1});assert.ok(card.calls.length>20);
 // the track of the light stays on the sea, between the horizon and the waves in front, at any width
 for(const W of [400,1280,2000])for(const t of [0,.5,1]){const [x,y]=frTrack(W,t);assert.ok(x>0&&x<W);assert.ok(y>360&&y<620);}});

test('El far: twenty different nights; two nights in a row (also the last and the first) change the sky and the moon',()=>{
 assert.equal(new Set(Array.from({length:20},(_,v)=>`${frNight(v).pal}|${frNight(v).moon}`)).size,20);
 for(let v=0;v<20;v++){const a=frNight(v),b=frNight((v+1)%20);assert.notEqual(a.pal,b.pal);assert.notEqual(a.moon,b.moon);}});

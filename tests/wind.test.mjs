// El vent del bosc (CE26), 0.15: the wind blows while the switch is held, stronger the longer it is held; a short press still blows
// for VENT_MIN seconds; letting go calms it. Eight places through the year, five years; the place changes after VENT_CHANGE seconds of
// wind. The music must stay within the reach of the recorded instruments and the wind must close on plucked or struck notes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {VENT_CALM,VENT_CHANGE,VENT_GRADES,VENT_LEVELS,VENT_MIN,VENT_SETTLE,VENT_SPAN,VENT_VARIANTS,ventCoda,ventEnd,ventGrade,ventHeld,ventOffset,ventPlan,ventRelease,ventScene,ventWind} from '../dist/vent.js';
import {drawVent} from '../dist/vent-art.js';
import {EXTRA_CAUSES,beginCause,causeBusy,finishCause,releaseCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {defaults} from '../dist/input.js';
const setup=()=>({item:EXTRA_CAUSES.find(x=>x.id==='wind'),time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const PLUCKED=['harpRec','glockRec','marimbaRec','violinsPizzRec','celliPizzRec'];

test('the wind starts at once, climbs grade by grade to the gale and never weakens while held',()=>{
 assert.ok(ventHeld(.3)>=VENT_LEVELS[0]-1e-9,'a breeze within 0.3 s');let prev=0;
 for(let h=0;h<=40;h+=.05){const L=ventHeld(h);assert.ok(L>=prev-1e-9,`no weakening at ${h}`);assert.ok(L<=1+1e-9);prev=L;}
 for(let g=0;g<4;g++)assert.equal(ventGrade(VENT_GRADES[g]+.01),g+1);
 for(const L of [.1,.3,.5,.7,.9])assert.ok(Math.abs(ventHeld(ventOffset(L))-L)<1e-3,'the offset gives back the strength');
 // While held, gusts can lift it a little over the gale; after letting go it falls to nothing within the calm.
 for(const ch of ['recta','ondulant','remoli','cops'])for(let t=0;t<30;t+=.1){const w=ventWind(t,null,0,ch);assert.ok(w.level>=0&&w.level<1.3,`${ch} ${t}`);}
 const w=ventWind(10+VENT_CALM+.01,10,0,'recta');assert.ok(w.level<.01);});

test('a short press blows for VENT_MIN seconds; letting go calms the wind and the trees settle before the end',()=>{
 assert.equal(ventRelease(.4),VENT_MIN);assert.equal(ventRelease(12),12);assert.equal(ventEnd(5),5+VENT_CALM+VENT_SETTLE);
 const s={...defaults,interaction:'effect',lock:true},g=setup();assert.ok(beginCause(g,s));
 assert.equal(g.control,'hold','the wind always follows the switch');assert.equal(g.duration,Infinity);assert.equal(causeBusy(g,s),true);
 g.time=.6;assert.ok(releaseCause(g));assert.equal(g.releaseTime,VENT_MIN);assert.equal(g.duration,ventEnd(VENT_MIN));assert.equal(releaseCause(g),false);
 assert.equal(g.ventTotal,VENT_MIN);assert.equal(causeBusy(g,s),true,'with the lock, the calm ends first');assert.equal(causeBusy(g,{...s,lock:false}),false);
 g.time=g.duration;finishCause(g,s);assert.equal(g.time,null);assert.equal(g.wait.mode,'wait');assert.ok(beginCause(g,s));assert.equal(g.wait.mode,'run');});

test('in toggle mode a press starts the wind and the next one calms it; a press during the calm goes on from the strength it has',()=>{
 const s={...defaults,interaction:'toggle',lock:false},g=setup();assert.ok(beginCause(g,s));assert.equal(g.control,'toggle');assert.equal(causeBusy(g,s),false);
 g.time=8;assert.ok(beginCause(g,s));assert.equal(g.releaseTime,8);assert.equal(g.ventPress,0,'letting go is not a new press');
 g.time=8.4;const level=ventWind(8.4,8,g.ventOffset,'recta').level;assert.ok(level>.2);assert.ok(beginCause(g,s));
 assert.equal(g.ventPress,1);assert.equal(g.releaseTime,null);assert.ok(Math.abs(ventHeld(g.ventOffset)-Math.min(1,level))<1e-3,'the wind goes on from where it was');});

test('the place stays until it has had VENT_CHANGE seconds of wind; then the next press paints the next place over it',()=>{
 const s={...defaults,interaction:'hold'},g=setup();let blown=0,changes=0,last=0;
 for(let press=0;press<60;press++){const before=g.variant;assert.ok(beginCause(g,s));
  if(press===0)assert.equal(g.variant,0);else if(blown>=VENT_CHANGE){assert.equal(g.ventChange,true);assert.equal(g.ventFrom,before);assert.equal(g.variant,(before+1)%VENT_VARIANTS);assert.equal(g.ventOffset,0);blown=0;changes++;}
  else{assert.equal(g.ventChange,false);assert.equal(g.variant,before);}
  g.time=[1,6,9.5,2.5][press%4];releaseCause(g);blown+=g.releaseTime;g.time=g.duration;finishCause(g,s);last=g.variant;}
 assert.ok(changes>=8,`${changes} changes of place`);assert.ok(last>=8);});

test('forty different scenes: each year every place comes at another time of day or under another sky',()=>{
 const keys=new Set();for(let v=0;v<VENT_VARIANTS;v++){const S=ventScene(v);keys.add([S.place,S.time,S.sky,S.fly].join());assert.ok(S.place===v%8);
  if(v%8)assert.notEqual(ventScene(v-1).place,S.place);if(v>=8){const P=ventScene(v-8);assert.ok(P.time!==S.time||P.sky!==S.sky);}}
 assert.equal(keys.size,VENT_VARIANTS);});

test('every place, press and cycle has music within reach of the recordings, and the wind closes on plucked or struck notes',()=>{
 for(let v=0;v<VENT_VARIANTS;v++)for(let press=0;press<4;press++)for(const offset of [0,ventOffset(.5),ventOffset(.95)])for(let cycle=0;cycle<3;cycle++){
  const p=ventPlan(v,press,cycle,offset);assert.ok(p.score.length>8,`${v} ${press} ${cycle}: music`);
  for(const e of p.score){const z=SAMPLE_BANK[e.inst];assert.ok(z,`${e.inst} is recorded`);assert.ok(e.at>=0&&e.at<=1+1e-9);
   for(const m of e.midi)assert.ok(z.zones.some(q=>Math.abs(q[1]-m)<=4),`${v} ${press}: ${e.inst} ${m} out of reach`);}}
 for(let v=0;v<VENT_VARIANTS;v++)for(let press=0;press<4;press++){const coda=ventCoda(v,press);assert.ok(coda.length>=2);
  for(const e of coda){assert.ok(PLUCKED.includes(e.inst),'the calm ends on plucked or struck notes');for(const m of e.midi)assert.ok(SAMPLE_BANK[e.inst].zones.some(q=>Math.abs(q[1]-m)<=4));}}
 // The music grows: the breeze has only the harp; the strong wind brings in marimba and plucked strings; the gale the flute.
 const at=(h)=>new Set(ventPlan(0,0,0,h).score.filter(e=>e.at*VENT_SPAN<1.5).map(e=>e.inst));
 assert.deepEqual([...at(0)],['harpRec']);assert.ok(at(VENT_GRADES[2]+.1).has('marimbaRec'));assert.ok(ventPlan(0,0,0,VENT_GRADES[3]).score.some(e=>e.inst==='fluteRec'));});

test('the painted place draws with finite coordinates at rest, blowing, calming, changing place and on the card',()=>{
 for(let v=0;v<VENT_VARIANTS;v+=3)for(const [t,release,offset] of [[1e3,null,0],[.2,null,0],[5,null,0],[19,null,0],[4.1,3,2],[7,6,7.8]])for(const reduced of [false,true]){
  const c=ctx();assert.equal(drawVent(c,1280,720,{variant:v,press:v,t,release,offset,idle:2,reduced}),true);assert.ok(c.calls.length>20);}
 const c=ctx();drawVent(c,1024,768,{variant:9,press:1,t:1.2,release:null,offset:0,change:true,from:8,idle:0});assert.ok(c.calls.length>20);
 const card=ctx();renderExtraCause(card,600,400,'wind',{time:3},{...defaults},true);assert.ok(card.calls.length>20);});

test('the wind waits like the step-by-step stories: dark before the first press, lit while it blows',()=>{
 const s={...defaults},g=setup(),c=ctx();renderExtraCause(c,1000,700,'wind',g,s);assert.ok(c.calls.length>0);
 assert.ok(beginCause(g,s,10));assert.equal(g.wait.mode,'run');g.time=2;releaseCause(g);g.time=g.duration;finishCause(g,s,20);assert.equal(g.wait.mode,'wait');});

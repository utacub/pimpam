// Dia rere dia (CE09, 0.13): the plan of the days, the moments of the chosen set, the music and the drawing.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DIA_EVENTS,DIA_MIN_DURATION,DIA_MOMENTS,diaDay,diaLabel,diaNext,diaPhase,diaScore,diaStart,diaStatus,diaStops,diaTravel} from '../dist/dia.js';
import {drawDia} from '../dist/dia-art.js';
import {EXTRA_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
const settings={...defaults};
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}

test('eight moments a day, one event at each, and the first four days follow the seasons',()=>{assert.equal(DIA_MOMENTS.length,8);
 for(let d=0;d<4;d++){const day=diaDay(d);assert.equal(day.season,d);assert.equal(day.events.length,8);assert.equal(new Set(day.events).size,8);
  day.events.forEach((e,m)=>{assert.ok(DIA_EVENTS[e],e);assert.equal(DIA_EVENTS[e].moment,m,`${e} belongs to moment ${m}`);});}
 assert.ok(diaDay(1).festa&&diaDay(2).rain&&diaDay(3).snow);assert.ok(diaDay(-1).events.every(e=>!e),'the night before the first dawn is quiet');});

test('every later day has an event at each moment and is different from the day before (5 moments or more) and from the same season before (3 or more)',()=>{
 for(let d=4;d<200;d++){const day=diaDay(d),prev=diaDay(d-1),year=diaDay(d-4);assert.equal(day.season,d%4);
  day.events.forEach((e,m)=>{assert.ok(e&&DIA_EVENTS[e],`day ${d} moment ${m}`);assert.equal(DIA_EVENTS[e].moment,m);});
  assert.ok(day.events.filter((e,m)=>e!==prev.events[m]).length>=5,`day ${d} differs from day ${d-1}`);assert.ok(day.events.filter((e,m)=>e!==year.events[m]).length>=3,`day ${d} differs from day ${d-4}`);
  if(!day.snow)for(const e of ['neu','ninot','neuRosa','neuFluixa','estrellesNeu'])assert.ok(!day.events.includes(e),`${e} without snow on day ${d}`);}
 assert.deepEqual(diaDay(27),diaDay(27),'the same day is always drawn the same way');});

test('the chosen set of moments: 8, 4 or 2 a day, and the first press brings the first stop',()=>{assert.deepEqual(diaStops(8),[0,1,2,3,4,5,6,7]);assert.deepEqual(diaStops(4),[0,2,4,6]);assert.deepEqual(diaStops(2),[2,6]);
 for(const n of [8,4,2]){let x=diaStart(n);const seen=[];for(let i=0;i<3*n;i++){const y=diaNext(x,n);assert.ok(y>x);assert.ok(diaStops(n).includes(((y%8)+8)%8));seen.push(y);x=y;}assert.equal(seen[0],diaStops(n)[0]);assert.equal(seen[n],8+diaStops(n)[0]);}
 assert.throws(()=>validateProfile({...defaults,dayMoments:3}));assert.equal(validateProfile({...defaults,dayMoments:2}).dayMoments,2);assert.equal(defaults.dayMoments,8);});

test('the sky moves smoothly from where it is to the moment reached, never past it',()=>{for(const [a,b] of [[-1,0],[3,4],[2,6],[6,10],[4.6,6]]){let last=a;const len=diaTravel(a,b);assert.ok(len>=2&&len<=4.2,'a slow change of light');
 for(let t=0;t<=len+1;t+=.05){const x=diaPhase(a,b,t);assert.ok(x>=last-1e-9&&x<=b+1e-9);last=x;}assert.ok(Math.abs(last-b)<1e-9);}});

test('each moment has its own music: recorded instruments and nature sounds only, bounded, and ending on plucked or struck notes',()=>{
 for(let d=-1;d<12;d++)for(let m=0;m<8;m++)for(const D of [6,9,15]){const score=diaScore(8*d+m,D);assert.ok(score.length>20);
  for(let i=0;i<score.length;i++){const e=score[i];assert.ok(e.at>=0&&e.at<1&&e.length>0&&e.at+e.length<=1+1e-9);if(i)assert.ok(e.at>=score[i-1].at);
   const bank=SAMPLE_BANK[e.inst];assert.ok(bank,e.inst);assert.ok(e.midi.every(Number.isFinite));assert.ok(e.vel>0&&e.vel<=1);
   if(e.variant)assert.ok(bank.zones.some(z=>z[9]===e.variant),`${e.inst}:${e.variant}`);}
  assert.ok(score.some(e=>e.inst==='natureRec'),'a nature sound');
  const end=Math.max(...score.filter(e=>e.inst!=='natureRec').map(e=>e.at)),last=score.filter(e=>e.inst!=='natureRec'&&e.at>end-.06);assert.ok(last.every(e=>['harpRec','glockRec'].includes(e.inst)),'the close rings out on harp and glockenspiel');
  assert.ok(!score.some(e=>/organ|pad|drone/i.test(e.inst)));}
 const a=diaScore(0,9).map(e=>e.inst+e.midi),b=diaScore(8,9).map(e=>e.inst+e.midi);assert.notDeepEqual(a,b,'the next day sounds different');});

test('status and progress lines name the moment, the day and what happens',()=>{assert.match(diaStatus(0),/^Albada del dia 1 \(primavera\): .*boira/);assert.match(diaStatus(14),/^Nit del dia 2 \(estiu\): .*focs/);assert.equal(diaLabel(19),'Tarda · dia 3 · tardor');});

test('the drawing fills the frame for every moment of many days, in every set of moments, without invalid coordinates',()=>{
 for(let d=-1;d<10;d++)for(let m=0;m<8;m++)for(const stops of [diaStops(8),diaStops(2)])for(const t of [0,1.2,3,6,1e3]){const c=ctx(),target=8*d+m,phi=diaPhase(target-1,target,t);
  assert.equal(drawDia(c,1280,720,{phi,target,t,stops,idle:t*1.7,reduced:false}),true);assert.ok(c.calls.includes('fillRect'));}
 for(const [w,h] of [[720,1280],[2560,1080],[400,300]])drawDia(ctx(),w,h,{phi:13.4,target:14,t:4,stops:diaStops(8),idle:3});});

test('in the activity: the scene stays after each press, retiming keeps the moment, and the card shows a feast sunset',()=>{const item=EXTRA_CAUSES.find(x=>x.id==='daynight');assert.equal(item.kind,'cycle');assert.equal(item.name,'Dia rere dia');assert.ok(item.recorded&&item.ownPhases);
 const g={item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null};assert.ok(beginCause(g,settings));assert.equal(g.duration,Math.max(DIA_MIN_DURATION,settings.duration));g.time=2;
 const target=g.diaTarget;assert.ok(retimeCause(g,settings,15));assert.equal(g.diaTarget,target);assert.equal(g.duration,15);
 finishCause(g,settings);const c=ctx();renderExtraCause(c,1000,700,'daynight',g,settings);assert.ok(c.calls.length>0);
 // A press while the light is still moving starts from where it is shown.
 assert.ok(beginCause(g,settings));assert.equal(g.diaPrev,target,'the moment left keeps its own clock');assert.equal(g.diaHeld,1e3);g.time=1;assert.ok(beginCause(g,{...settings,lock:false}));assert.ok(g.diaFrom>target&&g.diaFrom<target+1);assert.equal(g.diaHeld,1);
 const p=ctx();renderExtraCause(p,1000,700,'daynight',{item,count:0,variant:0},settings,true);assert.ok(p.calls.length>0);});

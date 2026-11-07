// 0.22: Toc, toc! Qui hi ha? (CE30), wait and then press. A door in a comic street: after a while somebody knocks, and the knocking
// comes back until the pupil presses; then the door opens and a visitor comes out with a gag and stays in the street. A press
// before the knock does nothing at all. 3, 5 or 7 visits make a round; the last one is the party, and the next round is another
// house at another time of day.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {TC_FINAL,TC_FIRST,TC_KNOCK_EVERY,TC_KNOCKS,TC_LEAVES,TC_LEAVING,TC_ROUNDS,TC_T,TC_VISIT,TC_VISITORS,TC_WAITS,tcEnsure,tcKnockScore,tcPlan,tcRound,tcTick,tcWait} from '../dist/toc.js';
import {drawToc} from '../dist/toc-art.js';
import {EXTRA_CAUSES,beamTick,beginCause,causeBusy,finishCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(k)}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];
const setup=()=>({item:EXTRA_CAUSES.find(x=>x.id==='door'),time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
// The app's frame: the street's own clock first, then the effect (as app.js does).
function run(g,s,secs,dt=.05){for(let t=0;t<secs-1e-9;t+=dt){beamTick(g,s,dt);if(g.time!==null){g.time+=dt;if(Number.isFinite(g.duration)&&g.time>=g.duration){finishCause(g,s);g.time=null;}}}}

test('Toc, toc: twenty different rounds; every house at every time of day once; two rounds in a row change both and bring new faces first',()=>{
 const all=new Set(),pairs=new Set();
 for(let v=0;v<TC_ROUNDS;v++){const r=tcRound(v),p=tcRound((v+1)%TC_ROUNDS);all.add(r.order.join(''));pairs.add(`${r.house}|${r.time}`);
  assert.deepEqual([...r.order].sort(),[0,1,2,3,4,5,6],`round ${v}: each visitor once`);
  assert.notEqual(r.house,p.house);assert.notEqual(r.time,p.time);
  for(const w of r.order.slice(0,3))assert.ok(!p.order.slice(0,3).includes(w),`rounds ${v} and ${(v+1)%TC_ROUNDS} share one of the first three visitors`);}
 assert.equal(all.size,20);assert.equal(pairs.size,20);
 const firsts=new Map();for(let v=0;v<TC_ROUNDS;v++){const f=tcRound(v).order[0];firsts.set(f,(firsts.get(f)||0)+1);}
 assert.equal(firsts.size,7);for(const n of firsts.values())assert.ok(n>=2&&n<=3);});

test('Toc, toc: a press before the knock does nothing at all, and the knock comes after a wait within the setting',()=>{
 for(const wait of Object.keys(TC_WAITS))for(let v=0;v<20;v+=7){const s={...defaults,tcWait:wait},g={...setup(),variant:v};
  // the first beat: the house is shown, then the wait; nothing is accepted
  tcEnsure(g,s);const due=g.tcCue;const [a,b]=TC_WAITS[wait];assert.ok(due>=TC_FIRST+a-1e-9&&due<=TC_FIRST+b+1e-9,`${wait}: ${due}`);
  for(let t=0;t<due-.1;t+=.05){beamTick(g,s,.05);assert.equal(beginCause(g,s),false,'nothing happens before the knock');assert.equal(g.time,null);assert.equal(g.score??null,null);assert.equal(g.count,0);}
  run(g,s,.3);assert.equal(g.tcPhase,'knock');assert.equal(g.duration,Infinity,'the knocking goes on until the press');assert.equal(g.audioDuration,TC_KNOCK_EVERY);
  assert.equal(beginCause(g,s),true);assert.equal(g.tcPhase,'visit');assert.equal(g.duration,TC_VISIT);assert.ok(causeBusy(g,s),'a visit is not cut short');assert.equal(beginCause(g,s),false);}
 // every wait of a round is different (it depends on the visit and the times the visitor has gone away)
 const ws=new Set();for(let k=0;k<7;k++)for(let again=0;again<3;again++)ws.add(tcWait({...defaults,tcWait:'long'},4,k,again).toFixed(3));assert.ok(ws.size>=18);});

test('Toc, toc: the visitor waits at the door until the press, or goes away after a while and knocks again later (tcLeave)',()=>{
 const s0={...defaults},g0=setup();run(g0,s0,TC_FIRST+4.2);assert.equal(g0.tcPhase,'knock');run(g0,s0,60);assert.equal(g0.tcPhase,'knock','by default they wait as long as it takes');
 for(const [leave,secs] of Object.entries(TC_LEAVES)){if(!secs)continue;const s={...defaults,tcLeave:leave},g=setup();for(let i=0;i<400&&g.tcPhase!=='knock';i++)run(g,s,.05);assert.equal(g.tcPhase,'knock');
  run(g,s,secs-.2);assert.equal(g.tcPhase,'knock');run(g,s,.4);assert.equal(g.tcPhase,'leave');assert.equal(g.time,null,'the knocking stops');assert.equal(beginCause(g,s),false,'a press as they walk away does nothing');
  run(g,s,TC_LEAVING+.1);assert.equal(g.tcPhase,'wait');assert.equal(g.tcAgain,1);run(g,s,4.2);assert.equal(g.tcPhase,'knock','they come back and knock again');assert.ok(beginCause(g,s));assert.equal(g.tcVisit.slot,0,'the same visitor');}});

test('Toc, toc: 3, 5 or 7 visits make a round; the last is the party; then another house and an empty street',()=>{
 for(const steps of [3,5,7]){const s={...defaults,steps},g=setup();const v0=0,order=tcRound(v0).order;
  for(let k=0;k<steps;k++){for(let i=0;i<400&&g.tcPhase!=='knock';i++)run(g,s,.05);assert.ok(beginCause(g,s));
   assert.equal(g.tcVisit.who,order[k]);assert.equal(g.tcVisit.final,k===steps-1);assert.equal(g.duration,k===steps-1?TC_FINAL:TC_VISIT);run(g,s,g.duration+.1);
   if(k<steps-1){assert.equal(g.tcOut.length,k+1);assert.equal(g.variant,v0);}}
  assert.equal(g.variant,1);assert.equal(g.tcOut.length,0);assert.equal(g.completed,1);assert.equal(g.tcFrom.out.length,steps);assert.equal(g.tcPhase,'wait');}});

test('Toc, toc: each visit has the door, its own tune and gag, and ends on plucked or struck notes; the knocking is three knocks and a question',()=>{
 const bank=SAMPLE_BANK.toonRec;for(const v of ['knock','doorOpen','doorClose'])assert.ok(bank.zones.some(z=>z[z.length-1]===v),v);
 for(const z of bank.zones)assert.ok(existsSync(new URL('../dist/assets/samples/'+z[0],import.meta.url)),z[0]);
 const k=tcKnockScore(3);assert.equal(k[0].inst,'toonRec');assert.equal(k[0].variant,'knock');assert.equal(k[0].at,0);assert.ok(k.slice(1).every(e=>e.inst==='marimbaRec'));
 assert.deepEqual([...TC_KNOCKS],[.15,.35,.55]);assert.ok(TC_KNOCKS[2]+.6<TC_KNOCK_EVERY);
 const gag={giant:['yank','slideUp'],bighead:['poof','boing'],band:['slideUp','boing'],snowman:['slideDown'],astronaut:['boing'],cook:['slideDown','squirt'],dancer:[]};
 for(let v=0;v<20;v+=3)for(let who=0;who<7;who++)for(const final of [false,true]){const D=final?TC_FINAL:TC_VISIT,p=tcPlan(v,who,final,D),sc=p.score,name=TC_VISITORS[who];
  for(const x of ['doorOpen','doorClose',...gag[name]])assert.ok(sc.some(e=>e.inst==='toonRec'&&e.variant===x),`${name}: ${x}`);
  let last=0;for(const e of sc){assert.ok(e.at>=0&&e.at+e.length<=1.001);assert.ok(e.vel>0&&e.vel<=1);last=Math.max(last,e.at*D);
   if(SAMPLE_BANK[e.inst].sustain)assert.ok(e.length*D<=2.6,`${name}: ${e.inst} held ${(e.length*D).toFixed(1)} s`);}
  const end=sc.filter(e=>e.at*D>=last-.05);assert.ok(end.every(e=>!SAMPLE_BANK[e.inst].sustain),`${name}: it ends on plucked or struck notes`);assert.ok(last<=D-1.4,`${name}: the music ends before the picture`);}});

test('Toc, toc: every gag happens before the walk to the street, and the party and the bow before the end',()=>{
 const D=TC_T.door;assert.ok(D.wide<D.walk&&D.walk<D.placed&&D.placed<D.shut&&D.shut<D.closed&&D.closed<TC_VISIT-1);
 for(const name of TC_VISITORS){const moments=Object.values(TC_T[name]);assert.ok(Math.max(...moments)<=D.walk-.35,name);assert.ok(Math.min(...moments)>=D.wide,name);}
 assert.ok(TC_T.final.party>D.closed&&TC_T.final.bow<TC_T.final.end&&TC_T.final.end<TC_FINAL-1);});

test('Toc, toc draws with finite coordinates in every decor: waiting, knocking, going away, in each gag, at the party, at a change of round, on narrow screens',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1280,720],[1024,768],[400,700]])for(const v of [0,6,13,19]){
  for(const [phase,pt] of [['wait',.5],['knock',.2],['knock',.5],['knock',3.1],['leave',.7]]){const c=ctx();drawToc(c,w,h,{game:{variant:v,tcNow:30,tcPhase:phase,tcAt:30-pt,tcOut:[0,1],tcVisit:null,tcFrom:null},t:null,reduced:false,...decor});assert.ok(c.calls.length>0);}
  for(let who=0;who<7;who++)for(const final of [false,true]){const D=final?TC_FINAL:TC_VISIT;
   for(const t of [0,.3,.6,1,1.6,2.2,2.8,3.1,3.4,3.9,4.4,5,5.6,6.2,7.1,8,9.5,12.8,14.4].filter(x=>x<D))for(const reduced of [false,true]){const c=ctx();
    drawToc(c,w,h,{game:{variant:v,tcNow:40,tcPhase:'visit',tcAt:40-t,tcOut:final?[1,2,3,4,5,6]:[2],tcVisit:{who,slot:final?6:1,final,at:40-t},tcFrom:null},t,duration:D,reduced,...decor});assert.ok(c.calls.length>0);}}
  const c=ctx();drawToc(c,w,h,{game:{variant:(v+1)%20,tcNow:40,tcPhase:'wait',tcAt:39.3,tcOut:[],tcVisit:null,tcFrom:{variant:v,out:[0,1,2,3,4,5,6],at:39.3}},t:null,...decor});assert.ok(c.calls.length>0);}
 const card=ctx();drawToc(card,320,180,{preview:true});assert.ok(card.calls.length>200);
 const g=setup(),rest=ctx();renderExtraCause(rest,1000,700,'door',g,{...defaults,background:'none'});assert.ok(rest.calls.length>0,'the door is there before the first knock, also without decor');});

test('Toc, toc keeps dark outlines in every decor; marks drawn only as lines are light on a black base without decor',()=>{
 const look=(decor,phase,pt)=>{const seen=new Set(),c=ctx();const proxy=new Proxy(c,{set(o,k,v){if(k==='strokeStyle')seen.add(v);o[k]=v;return true;},get(o,k){const v=o[k];return typeof v==='function'?v.bind(o):v;}});
  drawToc(proxy,1280,720,{game:{variant:3,tcNow:30,tcPhase:phase,tcAt:30-pt,tcOut:[0,1],tcVisit:phase==='visit'?{who:1,slot:2,final:false,at:30-pt}:null,tcFrom:null},t:phase==='visit'?pt:null,duration:TC_VISIT,...decor});return seen;};
 for(const decor of DECORS)assert.ok(look(decor,'visit',2.4).has('#231a20'),`${JSON.stringify(decor)}: dark outlines`);
 assert.ok(look({background:'none'},'knock',.4).has('#ffe6a8'),'the knock marks are light on black');assert.ok(!look({background:'full'},'knock',.4).has('#ffe6a8'));});

test('Toc, toc is CE30 in the catalogue: wait and press, 20 rounds, recorded music; its settings are checked',()=>{
 const item=EXTRA_CAUSES.find(x=>x.id==='door');assert.ok(item);assert.equal(item.code,'CE30');assert.equal(item.kind,'knock');assert.equal(item.knock,true);
 assert.equal(item.variants,20);assert.equal(item.recorded,true);assert.equal(item.level,'04 · Al moment');assert.ok(!/[«»]/.test(item.name));
 assert.equal(defaults.tcWait,'short');assert.equal(defaults.tcLeave,'never');
 const p=validateProfile({...defaults,tcWait:'long',tcLeave:'short'});assert.equal(p.tcWait,'long');assert.equal(p.tcLeave,'short');
 assert.throws(()=>validateProfile({...defaults,tcWait:'forever'}));assert.throws(()=>validateProfile({...defaults,tcLeave:2}));});

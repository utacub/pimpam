// 0.47: La fira de llauna (CE44), ready, steady, go. A fair of printed tin toys: after a calm of a different length each time, three
// bulbs light one after another with three rising notes; when the third is lit, the press launches (the bitllot, the human
// cannonball, the wind-up rocket, the strength tester, the horse race) and a gag follows, with a medal hung on the stall. A press
// before the third bulb does nothing by default. 3, 5 or 7 launches make a round; the last one is the finale, and the next round is
// another attraction in another light.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FI_ATTRS,FI_FINAL,FI_FINAL_GAG,FI_GAG_NAMES,FI_RING,FI_ROUNDS,FI_SHOT,FI_SLOW,FI_T,FI_TICK,fiBulbs,fiCountScore,fiEnsure,fiGagOf,fiPlan,fiPress,fiRhythm,fiRound,fiTick,fiTickScore} from '../dist/fira.js';
import {drawFira} from '../dist/fira-art.js';
import {EXTRA_CAUSES,beamTick,beginCause,causeBusy,finishCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${String(k)}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];
const setup=()=>({item:EXTRA_CAUSES.find(x=>x.id==='fira'),time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null,variant:0});
// The app's frame: the fair's own clock first, then the effect (as app.js does).
function run(g,s,secs,dt=.05){for(let t=0;t<secs-1e-9;t+=dt){beamTick(g,s,dt);if(g.time!==null){g.time+=dt;if(Number.isFinite(g.duration)&&g.time>=g.duration){finishCause(g,s);g.time=null;}}}}
const toGo=(g,s)=>{for(let i=0;i<600&&g.fiPhase!=='go';i++)run(g,s,.05);};

test('La fira: twenty different rounds; every attraction in every light once; two rounds in a row change both, and the four rounds of an attraction start with different gags',()=>{
 const seen=new Set();for(let v=0;v<FI_ROUNDS;v++){const r=fiRound(v),n=fiRound(v+1);seen.add(`${r.attr}|${r.light}`);assert.notEqual(r.attr,n.attr);assert.notEqual(r.light,n.light);assert.deepEqual([...r.order].sort(),[0,1,2,3,4,5]);}
 assert.equal(seen.size,20);
 for(let a=0;a<5;a++){const firsts=new Set();for(let v=a;v<20;v+=5)firsts.add(fiRound(v).order[0]);assert.equal(firsts.size,4,FI_ATTRS[a]);}
 // with 7 launches no gag repeats, and the last is the finale
 for(const steps of [3,5,7]){const gags=Array.from({length:steps},(_,i)=>fiGagOf(4,i,steps));assert.equal(gags[steps-1],FI_FINAL_GAG);assert.equal(new Set(gags).size,steps);}});

test('La fira: the calm, then three bulbs one after another at the rhythm of the setting, then the figure waits; a press before the third does nothing by default',()=>{
 for(const fiRhythm of ['lent','normal','rapid']){const s={...defaults,fiRhythm},g=setup(),I=fiRhythm==='lent'?1.6:fiRhythm==='normal'?1.1:.8;
  run(g,s,.5);assert.equal(g.fiPhase,'calm');assert.equal(beginCause(g,s),false,'nothing before the bulbs');assert.equal(g.time,null);
  for(let i=0;i<400&&g.fiPhase!=='count';i++)run(g,s,.05);assert.equal(g.fiPhase,'count');assert.equal(fiBulbs(g,s).n,1);assert.ok(g.time!==null&&!Number.isFinite(g.duration),'the count plays');
  run(g,s,I+.05);assert.equal(fiBulbs(g,s).n,2);assert.equal(beginCause(g,s),false,'nothing on the second bulb');
  run(g,s,I);assert.equal(g.fiPhase,'go');assert.equal(fiBulbs(g,s).n,3);
  run(g,s,FI_RING+.1);assert.equal(g.audioDuration,FI_TICK,'the ticking after the third bulb');
  run(g,s,30);assert.equal(g.fiPhase,'go','the figure waits as long as it takes');
  assert.equal(beginCause(g,s),true);assert.equal(g.fiPhase,'launch');assert.ok(causeBusy(g,s));assert.equal(g.duration,FI_SHOT);assert.equal(beginCause(g,s),false,'nothing during the gag');
  run(g,s,FI_SHOT+.1);assert.equal(g.fiPhase,'calm');assert.deepEqual(g.fiOut.length,1);assert.equal(g.count,1);}});

test('La fira: an early press can restart the bulbs or launch slowly; without a press the bulbs can go out and come back (fiPress)',()=>{
 let s={...defaults,fiEarly:'reinicia'},g=setup();for(let i=0;i<400&&g.fiPhase!=='count';i++)run(g,s,.05);run(g,s,1.2);
 assert.equal(beginCause(g,s),false);assert.equal(g.fiPhase,'calm');assert.equal(g.time,null,'the count stops');assert.equal(fiBulbs(g,s).n,2,'the lit bulbs fade');
 s={...defaults,fiEarly:'lent'};g=setup();for(let i=0;i<400&&g.fiPhase!=='count';i++)run(g,s,.05);
 assert.equal(beginCause(g,s),true);assert.equal(g.fiShot.speed,FI_SLOW);assert.ok(Math.abs(g.duration-FI_SHOT/FI_SLOW)<1e-9);
 s={...defaults,fiPress:'short'};g=setup();toGo(g,s);run(g,s,3.1);assert.equal(g.fiPhase,'calm');assert.equal(g.time,null);toGo(g,s);assert.equal(g.fiPhase,'go','the count comes back');
 // the calm changes from launch to launch
 const calms=new Set();for(let k=0;k<5;k++){g=setup();g.variant=k;fiEnsure(g,defaults);calms.add((g.fiCalmEnd-g.fiNow).toFixed(3));}assert.ok(calms.size>=4);});

test('La fira: 3, 5 or 7 launches, then the finale; the next round is another attraction',()=>{
 for(const steps of [3,5,7]){const s={...defaults,steps,fiFirst:'coet'},g=setup();g.variant=undefined;
  for(let k=0;k<steps;k++){toGo(g,s);assert.equal(beginCause(g,s),true);const final=k===steps-1;assert.equal(g.fiShot.final,final);assert.equal(g.duration,final?FI_FINAL:FI_SHOT);run(g,s,g.duration+.1);}
  assert.equal(g.completed,1);assert.deepEqual(g.fiOut,[]);assert.equal(fiRound(g.variant).name,FI_ATTRS[(FI_ATTRS.indexOf('coet')+1)%5]);assert.ok(g.fiFrom);}});

test('La fira: every launch has its own sounds and the band, all inside the effect, ending on plucked or struck notes; the count is the same three rising notes',()=>{
 const pitched=new Set(['harpRec','celliPizzRec','marimbaRec','glockRec','violinsPizzRec','timpaniRec']);
 for(let v=0;v<20;v++)for(let gag=0;gag<7;gag++)for(const speed of [1,FI_SLOW]){const p=fiPlan(v,gag,speed);assert.ok(p.score.length>8,`${v}/${gag}`);
  for(let j=0;j<p.score.length;j++){const e=p.score[j];assert.ok(e.at>=0&&e.at<=1,`${v}/${gag}: at`);assert.ok(e.vel>0&&e.vel<=1);assert.ok(SAMPLE_BANK[e.inst],e.inst);if(j)assert.ok(e.at>=p.score[j-1].at);
   if(e.variant)assert.ok(SAMPLE_BANK[e.inst].zones.some(z=>z[z.length-1]===e.variant),`${e.inst}: ${e.variant}`);}
  const last=p.score.filter(e=>e.midi.length).at(-1);assert.ok(pitched.has(last.inst),`ends on ${last.inst}`);assert.ok(last.at*p.D<p.D-1);}
 for(let v=0;v<20;v++){const {score,D}=fiCountScore(v,defaults),m=score.filter(e=>e.inst==='marimbaRec');assert.equal(m.length,3);assert.ok(m[0].midi[0]<m[1].midi[0]&&m[1].midi[0]<m[2].midi[0]);assert.ok(Math.abs(m[2].at*D-2*fiRhythm(defaults))<1e-6);}
 const tick=fiTickScore();assert.ok(tick.every(e=>e.vel<.12));});

test('La fira draws with finite coordinates in every decor: calm, count, waiting, each gag of each attraction, the finale, the turn, narrow screens and the home card',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1280,720],[1024,768],[400,700]])for(const v of [0,1,2,3,4,7,13,19]){
  for(const [phase,pt] of [['calm',.3],['calm',2],['count',.4],['count',1.5],['count',2.1],['go',.2],['go',4]]){const c=ctx(),g=fiEnsure({variant:v},{});g.fiNow=30;g.fiPhase=phase;g.fiAt=30-pt;g.fiOut=[0,3];drawFira(c,w,h,{game:g,settings:{},reduced:false,...decor});assert.ok(c.calls.length>0);}
  if(v>4||(decor.background!=='full'&&decor.background!=='none')||(w!==1280&&decor.background!=='full'))continue;
  for(let gag=0;gag<7;gag++){const D=gag===FI_FINAL_GAG?FI_FINAL:FI_SHOT;for(let t=0;t<D;t+=.45)for(const reduced of (w===1280?[false,true]:[false])){const c=ctx(),g=fiEnsure({variant:v},{});g.fiNow=40;g.fiPhase='launch';g.fiAt=40-t;g.fiOut=gag===FI_FINAL_GAG?[0,1,2,3]:[1];g.fiShot={gag,slot:g.fiOut.length,final:gag===FI_FINAL_GAG,slow:false,at:40-t,speed:1};
   drawFira(c,w,h,{game:g,settings:{},reduced,...decor});assert.ok(c.calls.length>0);}}
  for(const ft of [.2,1,1.3,2.2]){const c=ctx(),g=fiEnsure({variant:(v+1)%20},{});g.fiNow=40;g.fiFrom={variant:v,out:[0,1,6],at:40-ft};drawFira(c,w,h,{game:g,settings:{},...decor});assert.ok(c.calls.length>0);}}
 const card=ctx();drawFira(card,320,180,{preview:true});assert.ok(card.calls.length>200);
 const g=setup(),rest=ctx();renderExtraCause(rest,1000,700,'fira',g,{...defaults,background:'none'});assert.ok(rest.calls.length>0,'the fair is there before the first press, also without decor');});

test('La fira is CE44 in the catalogue: ready-steady-go, 20 rounds, recorded music; its settings are checked',()=>{
 const item=EXTRA_CAUSES.find(x=>x.id==='fira');assert.ok(item);assert.equal(item.code,'CE44');assert.equal(item.kind,'ready');assert.equal(item.ready,true);
 assert.equal(item.variants,20);assert.equal(item.recorded,true);assert.equal(item.level,'04 · Al moment');
 for(const a of FI_ATTRS){assert.equal(FI_GAG_NAMES[a].length,7);for(const n of FI_GAG_NAMES[a])assert.ok(FI_T[a][n]||true);const T=FI_T[a];assert.ok(T.rel<T.hit&&T.hit<=T.cheer&&T.cheer<T.reset&&T.reset<FI_SHOT);}
 assert.equal(defaults.fiRhythm,'normal');assert.equal(defaults.fiCalm,'variable');assert.equal(defaults.fiEarly,'res');assert.equal(defaults.fiPress,'never');assert.equal(defaults.fiFirst,'bitlles');
 const p=validateProfile({...defaults,fiRhythm:'rapid',fiEarly:'lent',fiFirst:'atzar'});assert.equal(p.fiRhythm,'rapid');assert.equal(p.fiEarly,'lent');
 assert.throws(()=>validateProfile({...defaults,fiRhythm:'molt'}));assert.throws(()=>validateProfile({...defaults,fiPress:5}));});

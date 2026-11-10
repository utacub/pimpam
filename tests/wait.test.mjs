// The waiting scene (0.14.1): in Dia rere dia, L'orquestra que es desperta, El cel de les constel·lacions and (0.15) Fem castells, when a step has ended
// (El vent del bosc waits too once its wind has calmed: tests/wind.test.mjs)
// the scene slows down to a stop and darkens until the next press, so that it is clear when to press again. On by default; the
// setting waitCue turns it off. The ambient clock must never jump, and the light must change gradually.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ESC_WAIT,ESC_WAIT_START,escWaitClock,escWaitTurn} from '../dist/escenari.js';
import {EXTRA_CAUSES,beginCause,finishCause,restCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {defaults,validateProfile} from '../dist/input.js';
const WAITING=['daynight','orchestra','constellations','castells'];
const setup=id=>({item:EXTRA_CAUSES.find(x=>x.id===id),time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
// A drawing context that records the colour of every rectangle filled over the whole picture.
function ctx(){const fills=[],gradient={addColorStop(){}};const o={fills,fillStyle:'#000'};return new Proxy(o,{get(t,k){if(k in t)return t[k];return(...a)=>{if(k==='fillRect'&&a[2]>=1000&&a[3]>=700)fills.push(t.fillStyle);return k.startsWith('create')?gradient:undefined;};},set(t,k,v){t[k]=v;return true;}});}
const overlay=c=>c.fills.filter(f=>typeof f==='string'&&f.startsWith('rgba(3,5,14,')).map(f=>+f.slice(12,-1));

test('the setting is on by default, can be turned off and only takes true or false',()=>{
 assert.equal(defaults.waitCue,true);assert.equal(validateProfile({}).waitCue,true);assert.equal(validateProfile({waitCue:false}).waitCue,false);
 assert.throws(()=>validateProfile({waitCue:'no'}));});

// The darkening follows a smoothstep (at most 1.5 × dark / stop per second); the light comes back on a cubic ease-out (at most
// 3 × dark / wake per second), a quick answer to the press that is still spread over 0.6 s.
test('the ambient clock never jumps nor runs backwards, and the light changes gradually, whatever the timing of the presses',()=>{
 let seed=7;const rand=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let run=0;run<200;run++){let w=ESC_WAIT_START,now=100,mode='wait',prev=escWaitClock(w,now);
  for(let i=0;i<12;i++){const span=mode==='wait'?rand()*4:.2+rand()*10;for(let k=1;k<=40;k++){const t=now+span*k/40,c=escWaitClock(w,t),dt=span/40;
    assert.ok(c.idle>=prev.idle-1e-9&&c.idle-prev.idle<=dt*(1+1e-9),'idle moves at most at real speed');assert.ok(c.dark>=-1e-9&&c.dark<=ESC_WAIT.dark+1e-9);
    assert.ok(Math.abs(c.dark-prev.dark)<=dt*ESC_WAIT.dark*Math.max(1.5/ESC_WAIT.stop,3/ESC_WAIT.wake)+1e-9,'no sudden change of light');prev=c;}
   now+=span;mode=mode==='wait'?'run':'wait';const before=escWaitClock(w,now);w=escWaitTurn(w,mode,now);const after=escWaitClock(w,now);
   assert.ok(Math.abs(after.idle-before.idle)<1e-9&&Math.abs(after.dark-before.dark)<1e-9&&Math.abs(after.rate-before.rate)<1e-9,'a turn starts where the clock was');}}});

test('before the first press the scene is dark and still; a press lights it up; when the step ends it slows down, darkens and stays still',()=>{
 const start=escWaitClock(ESC_WAIT_START,50);assert.equal(start.dark,ESC_WAIT.dark);assert.equal(start.still,true);assert.equal(start.idle,4);
 let w=escWaitTurn(ESC_WAIT_START,'run',50);assert.equal(escWaitClock(w,50+ESC_WAIT.wake).dark,0);assert.equal(escWaitClock(w,58).rate,1);
 w=escWaitTurn(w,'wait',58);const mid=escWaitClock(w,58+ESC_WAIT.stop/2),end=escWaitClock(w,58+ESC_WAIT.stop),later=escWaitClock(w,70);
 assert.ok(mid.dark>0&&mid.dark<ESC_WAIT.dark&&mid.rate>0&&!mid.still);assert.equal(end.still,true);assert.equal(end.rate,0);assert.equal(later.idle,end.idle);assert.ok(Math.abs(later.dark-ESC_WAIT.dark)<1e-9);});

test('the step-by-step stories keep the waiting state: a press runs, the end of a step waits; other activities do not',()=>{
 for(const id of WAITING){const g=setup(id),s={...defaults};assert.ok(beginCause(g,s,10));assert.equal(g.wait.mode,'run');assert.equal(g.wait.at,10);
  g.time=g.duration;finishCause(g,s,10+g.duration);assert.equal(g.wait.mode,'wait');assert.equal(g.wait.at,10+g.duration);
  assert.equal(restCause(g,30),false,'already waiting');assert.ok(beginCause(g,s,40));assert.equal(g.wait.mode,'run');}
 for(const id of ['lighthouse','door']){const g=setup(id);beginCause(g,{...defaults},10);assert.equal(g.wait,undefined);}
 // Fons marí de vidre (0.28) waits too: each stimulus stops and darkens at its end.
 {const g=setup('jelly'),s={...defaults};assert.ok(beginCause(g,s,10));assert.equal(g.wait.mode,'run');g.time=g.duration;finishCause(g,s,10+g.duration);assert.equal(g.wait.mode,'wait');}});

test('waiting, the whole scene is darkened; lit while a step runs; never with the setting off nor on the cards',()=>{
 const now=typeof performance!=='undefined'?performance.now()/1000:0;
 for(const id of WAITING){const s={...defaults,steps:5},g=setup(id);
  // Before the first press: dark.
  let c=ctx();renderExtraCause(c,1000,700,id,g,s);assert.ok(Math.abs(overlay(c).pop()-ESC_WAIT.dark)<.002,`${id}: dark before the first press`);
  // With the setting off: no darkening.
  c=ctx();renderExtraCause(c,1000,700,id,g,{...s,waitCue:false});assert.equal(overlay(c).length,0,`${id}: setting off`);
  // Long after a press, while its step runs: lit.
  beginCause(g,s,now-5);g.time=4;c=ctx();renderExtraCause(c,1000,700,id,g,s);assert.equal(overlay(c).length,0,`${id}: lit during the step`);
  // Long after the step has ended: dark again.
  g.time=g.duration;finishCause(g,s,now-3);c=ctx();renderExtraCause(c,1000,700,id,g,s);assert.ok(Math.abs(overlay(c).pop()-ESC_WAIT.dark)<.002,`${id}: dark when waiting`);
  // The card on the home page is never darkened.
  c=ctx();renderExtraCause(c,1000,700,id,{time:3},s,true);assert.equal(overlay(c).length,0,`${id}: card`);}});

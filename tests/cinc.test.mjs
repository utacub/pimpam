// Cinc petits mons (0.37): the five activities made with ChatGPT, with the settings of the app.
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,validateProfile} from '../dist/input.js';
import {CINC_CAUSES,cincBlocked,cincFactoryOptions,cincPress,cincRelease,cincReset,cincTick,isCinc} from '../dist/cinc.js';
import {SCAN_ACTIVITIES} from '../dist/scan-catalog.js';
const S=(o={})=>validateProfile({...defaults,...o});
const game=(id,s)=>{const g={item:CINC_CAUSES.find(x=>x.id===id)};
 // cincStart without the module import cycle of app.js
 return import('../dist/cinc.js').then(m=>{m.cincStart(g,s);return g;});};
const run=(g,s,sec)=>{for(let t=0;t<sec;t+=.05)cincTick(g,s,.05,1000+t);};
test('three cause activities CE40–CE42 and the factory EN24, with ids of their own; La caixa sorpresa (CE39) is gone (0.47.3)',()=>{
 assert.deepEqual(CINC_CAUSES.map(x=>x.code),['CE40','CE41','CE42']);assert.ok(!isCinc('surprise'));for(const id of ['robotbuild','flora','frog','inventions'])assert.ok(isCinc(id),id);
 assert.ok(SCAN_ACTIVITIES.some(x=>x.id==='inventions'&&x.code==='EN24'));for(const id of ['flower','bubbles','robot','box'])assert.ok(!isCinc(id),id);});
test('repeatScene stays a setting of the profile (old profiles still load), off by default',()=>{assert.equal(S().repeatScene,false);assert.equal(S({repeatScene:true}).repeatScene,true);assert.throws(()=>validateProfile({repeatScene:'yes'}));});
test('the robot and the flower follow the steps (3, 5, 7); a change of steps starts again; the final always waits',async()=>{
 for(const id of ['robotbuild','flora'])for(const n of [3,5,7]){const s=S({steps:n,lock:false});const g=await game(id,s);for(let i=1;i<=n;i++){assert.ok(cincPress(g,s),`${id} ${i}`);assert.equal(g.count,i);if(i<n)run(g,s,.5);}
  assert.ok(cincBlocked(g,s),'final');assert.equal(cincPress(g,s),false);cincReset(g,s);assert.equal(g.count,0);}
 const s=S({steps:5,lock:true}),g=await game('robotbuild',s);cincPress(g,s);run(g,s,.5);assert.ok(cincBlocked(g,s));});
test('the frog: hold and release, toggle, the maximum, and the scenes in turn',async()=>{
 let s=S({interaction:'hold'}),g=await game('frog',s);cincPress(g,s);assert.equal(g.cinc.phase,'inflate');assert.ok(cincBlocked(g,s));run(g,s,1);assert.ok(cincRelease(g));assert.equal(g.cinc.phase,'effect');
 s=S({interaction:'toggle'});g=await game('frog',s);cincPress(g,s);run(g,s,.8);assert.ok(!cincBlocked(g,s));assert.ok(cincPress(g,s));assert.equal(g.cinc.phase,'effect');
 g=await game('frog',s);cincPress(g,s);run(g,s,3);assert.equal(g.cinc.phase,'effect');
 s=S({interaction:'effect',lock:true});g=await game('frog',s);const seen=[];for(let i=0;i<7;i++){cincPress(g,s);cincRelease(g);seen.push(g.cinc.gag);run(g,s,16);}assert.deepEqual(seen,[0,1,2,3,4,5,6]);});
test('the factory shows two or three pictures, which change from round to round with two',()=>{
 for(const st of [0,1]){assert.equal(cincFactoryOptions(st,0,3).length,3);assert.equal(cincFactoryOptions(st,0,4).length,3);const a=cincFactoryOptions(st,0,2).map(x=>x.value),b=cincFactoryOptions(st,1,2).map(x=>x.value);assert.equal(a.length,2);assert.notDeepEqual(a,b);}});

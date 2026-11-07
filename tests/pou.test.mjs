// El pou del temps (CE37, 0.31): a descent through the rock, back in time, in twenty stimuli, from the Ice Age to the first dinosaurs,
// with travellings of the camera down the rock between them, each stimulus stopping and darkening at its end, the climb back to the
// garden of today after the twentieth, its music of recorded instruments per era and its sounds (voices of the animals, their gestures).
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {POU_N,POU_NAMES,POU_POSES,POU_RETURN,POU_STIM,POU_START,POU_TRAVEL,POU_CLIMB,POU_GARDEN,POU_IDLE,pouCamera,pouDuration,pouLayers,pouLife,pouRest,pouRestLayers,pouScore} from '../dist/pou.js';
import {POU_GLSL} from '../dist/pou-shaders.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {EXTRA_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {defaults} from '../dist/input.js';
const item=EXTRA_CAUSES.find(x=>x.id==='well');
const setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
const close=(a,b,e=1e-9)=>a.every((x,i)=>Math.abs(x-b[i])<e);

test('twenty scenes and the garden: a pose, a name and a shader each; the well goes down, older at each scene',()=>{
 assert.equal(POU_N,20);assert.equal(POU_POSES.length,20);assert.equal(POU_NAMES.length,20);assert.equal(POU_GLSL.scenes.length,21);assert.equal(POU_GARDEN,20);
 for(const src of POU_GLSL.scenes.slice(0,20)){assert.match(src,/const vec2 WIN_C=/);assert.match(src,/void fossil\(vec2 q\)/);assert.match(src,/void life\(vec2 q,float t\)/);}
 assert.match(POU_GLSL.scenes[20],/#define SURFACE/);
 for(let i=1;i<20;i++)assert.ok(POU_POSES[i][1]<POU_POSES[i-1][1]-2,`${i}: deeper`);
 assert.ok(POU_POSES[4][1]-POU_POSES[3][1]<-3,'the long stretch of rock between the Ice Age and the end of the Cretaceous');
 assert.ok(POU_START[1]>POU_POSES[0][1]+2,'the garden is above the first scene');
 for(const p of POU_POSES)assert.ok(p[2]>.5&&p[2]<2,'a sensible height of the screen');});
test('no reserved words of GLSL ES 3.0 used as names in the shaders',()=>{
 const reserved=['cast','input','output','filter','sample','common','partition','active','superp','namespace','using','goto','union','enum','typedef','template','this','packed','resource','inline','noinline','public','static','extern','external','interface','long','short','double','half','fixed','unsigned','sizeof','class','asm'];
 for(const src of [POU_GLSL.common,POU_GLSL.rock,POU_GLSL.head,POU_GLSL.tail,...POU_GLSL.scenes]){const code=src.replace(/\/\/.*$/gm,'');for(const w of reserved)assert.ok(!new RegExp(`\\b${w}\\b`).test(code),w);}});
test('each press: two seconds of travelling, the stimulus, and seven more seconds for the climb and the robin after the twentieth',()=>{
 for(let i=0;i<20;i++)assert.equal(pouDuration(i),POU_TRAVEL+POU_STIM+(i===19?POU_RETURN:0));
 assert.ok(POU_CLIMB<POU_RETURN);assert.equal(pouDuration(3,20),POU_TRAVEL+20);assert.equal(pouDuration(3,6),POU_TRAVEL+POU_STIM,'never shorter than the stimulus');});
test('the camera leaves from where it was, arrives at the scene, drifts, and climbs to the garden after the last one',()=>{
 for(let i=0;i<20;i++){const from=pouRest(i-1),a=pouCamera(i,0,POU_STIM,from);assert.ok(close(a,from,1e-6),`${i}: starts where it was`);
  for(let t=0;t<=pouDuration(i);t+=.05){const c=pouCamera(i,t,POU_STIM,from),d=pouCamera(i,t+.05,POU_STIM,from);
   assert.ok(c.every(Number.isFinite)&&c[2]>0);assert.ok(Math.abs(Math.log(d[2]/c[2]))<.12,`${i} ${t}: no jump in the zoom`);
   assert.ok(Math.hypot(d[0]-c[0],d[1]-c[1])/Math.min(c[2],d[2])<(i===19?2.5:1),`${i} ${t}: no jump`);}
  if(i<19)assert.ok(close(pouCamera(i,POU_TRAVEL+POU_STIM),pouRest(i),1e-9),`${i}: rests where the drift ends`);}
 assert.ok(close(pouCamera(19,POU_TRAVEL+POU_STIM+POU_CLIMB),[...POU_START],1e-9),'back in the garden at the end of the climb');
 assert.ok(close(pouCamera(19,pouDuration(19)),[...POU_START],1e-9),'and it stays there while the robin sings');
 assert.deepEqual(pouRest(-1),[...POU_START]);});
test('the fossil wakes: the scene is stone while the camera travels and alive by the key moment; the layers of each moment',()=>{
 assert.equal(pouLife(0),0);assert.equal(pouLife(1.3),0);assert.ok(pouLife(2.4)>0&&pouLife(2.4)<1);assert.equal(pouLife(3.5),1);assert.equal(pouLife(40),1);
 assert.deepEqual(pouLayers(0,.5,.5,null).map(l=>l.scene),[POU_GARDEN,0],'the first press leaves the garden');
 const L=pouLayers(5,.6,.6,10.3);assert.deepEqual(L.map(l=>l.scene),[4,5]);assert.ok(L[0].life<1&&L[0].life>0,'the scene left behind turns back to stone');
 assert.deepEqual(pouLayers(5,POU_TRAVEL+.5,2.5,12.2).map(l=>l.scene),[5]);
 // slow frames: the scene's clock runs ahead of the camera, which is still on its way; the fossil waits for it
 assert.equal(pouLayers(0,.9,6,null).find(l=>l.scene===0).life,0,'stone while the camera travels, whatever the scene clock says');
 const end=pouLayers(19,POU_TRAVEL+POU_STIM+3,POU_TRAVEL+POU_STIM+3,null);assert.deepEqual(end.map(l=>l.scene),[POU_GARDEN],'after the twentieth: the garden');
 assert.deepEqual(pouRestLayers(-1,0,false).map(l=>l.scene),[POU_GARDEN]);assert.equal(pouRestLayers(-1,0,false)[0].tau,POU_IDLE);
 assert.deepEqual(pouRestLayers(7,30,false),[{scene:7,tau:30,life:1}]);assert.deepEqual(pouRestLayers(19,30,true).map(l=>l.scene),[POU_GARDEN]);});
test('the music: the instruments of the eras and the sounds of the well only, inside the press, ordered; it ends plucked or struck',()=>{
 const struck=new Set(['harpRec','marimbaRec','glockRec','celliPizzRec','violinsPizzRec','timpaniRec','triangleRec','vibRec','uduRec','escletxaRec','crestaRec','pouRec','pouPerc','natureRec']);
 for(const dur of [12,16,20])for(let i=0;i<20;i++){const S=pouScore(i,dur),D=pouDuration(i,dur),end=POU_TRAVEL+Math.max(POU_STIM,dur);assert.ok(S.length>30,`${i}: a full piece`);
  for(let j=0;j<S.length;j++){const e=S[j];assert.ok(e.inst.endsWith('Rec')||e.inst==='pouPerc',e.inst);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9);assert.ok(e.vel>0&&e.vel<=1);if(j)assert.ok(e.at>=S[j-1].at);
   // in the last two seconds of the stimulus (and in the climb) only plucked or struck notes and the sounds of the animals and places
   if(e.at*D>end-2)assert.ok(struck.has(e.inst),`${i} ${dur}: ${e.inst} at ${(e.at*D).toFixed(2)}`);
   assert.ok((e.at+e.length)*D<=(i===19?D:end)+1e-6,`${i}: nothing after the stimulus`);}
  assert.ok(S.some(e=>e.at*D<POU_TRAVEL),`${i}: the travelling sounds`);}
 const last=pouScore(19),D=pouDuration(19);assert.ok(last.some(e=>e.variant==='pitroig'&&e.at*D>POU_TRAVEL+POU_STIM),'the robin sings in the garden at the end');
 for(let i=0;i<19;i++)assert.ok(!pouScore(i).some(e=>e.variant==='pitroig'),`${i}: no birdsong before the robin`);});
test('a press: the first starts from the garden, each next one from where the last rests, after the twentieth from the garden again',()=>{
 const g=setup(),s={...defaults};
 for(let k=0;k<22;k++){const v=k%20,prev=g.variant;assert.ok(beginCause(g,s,10+k*25));assert.equal(g.variant,v);assert.equal(g.duration,pouDuration(v,s.duration));
  assert.ok(close(g.fonsFrom,k===0||prev===19?[...POU_START]:pouRest(prev),1e-9),`press ${k}`);assert.equal(g.score.length>0,true);
  g.time=g.duration;finishCause(g,s,10+k*25+g.duration);assert.equal(g.wait.mode,'wait');}});
test('a press while a stimulus runs travels from where the camera is; a new «Durada» keeps the place in the stimulus',()=>{
 const g=setup(),s={...defaults};beginCause(g,s,10);g.time=6;const here=pouCamera(0,6,g.fonsStim,g.fonsFrom);beginCause(g,{...s,lock:false},16);
 assert.equal(g.variant,1);assert.ok(close(g.fonsFrom,here,1e-9));assert.ok(g.fonsPrevTau>0);
 g.time=g.duration*.4;assert.ok(retimeCause(g,s,20));assert.ok(Math.abs(g.time/g.duration-.4)<1e-9);assert.equal(g.duration,pouDuration(1,20));});
test('the sounds of the well and its instruments: every one the music asks for is in a bank, as a file, credited, and heard',()=>{
 const root=new URL('../dist/assets/samples/',import.meta.url),credits=readFileSync(new URL('CREDITS.md',root),'utf8');
 const have=inst=>new Set(SAMPLE_BANK[inst].zones.map(z=>z[9]));const banks={natureRec:have('natureRec'),pouRec:have('pouRec'),pouPerc:have('pouPerc')};const used=new Set();
 for(let i=0;i<20;i++)for(const e of pouScore(i)){assert.ok(SAMPLE_BANK[e.inst],e.inst);if(banks[e.inst]){assert.ok(banks[e.inst].has(e.variant),`${i}: ${e.inst} ${e.variant}`);used.add(e.inst+':'+e.variant);}}
 for(const z of SAMPLE_BANK.natureRec.zones.filter(z=>z[9].startsWith('pou')))assert.ok(used.has('natureRec:'+z[9]),`${z[9]} is heard`);
 for(const inst of ['pouRec','pouPerc'])for(const v of banks[inst])assert.ok(used.has(inst+':'+v),`${inst} ${v} is heard`);
 for(const inst of ['pouRec','pouPerc','uduRec','escletxaRec','crestaRec','vibRec'])for(const z of SAMPLE_BANK[inst].zones){assert.ok(existsSync(new URL(z[0],root)),z[0]);assert.ok(credits.includes(z[0]),`${z[0]} credited`);}
 for(const z of SAMPLE_BANK.natureRec.zones.filter(z=>z[9].startsWith('pou'))){assert.ok(existsSync(new URL(z[0],root)),z[0]);assert.ok(credits.includes(z[0]),`${z[0]} credited`);}
 for(const inst of ['pouRec','pouPerc','uduRec','escletxaRec','crestaRec']){assert.equal(SAMPLE_BANK[inst].fallback,null);assert.equal(SAMPLE_BANK[inst].strict,true);}
 for(const inst of ['uduRec','escletxaRec','crestaRec','vibRec'])assert.ok(SAMPLE_BANK[inst].pitched,`${inst} is played at every pitch from its notes`);});
test('the catalogue: El pou del temps is CE37, a dive with acoustic music that starts in the garden',()=>{
 assert.equal(item.code,'CE37');assert.equal(item.name,'El pou del temps');assert.ok(item.dive&&item.recorded&&item.ownPhases);assert.equal(item.variants,20);assert.equal(item.minDuration,POU_STIM);
 assert.ok(!/\d/.test(POU_NAMES.join('')),'no numbers in the names');});
test('portrait screens: the renderer pulls back so that each scene keeps its whole width',()=>{
 const gl=readFileSync(new URL('../dist/pou-gl.js',import.meta.url),'utf8');const fit=+gl.match(/const PG_FIT=([\d.]+);/)[1];assert.ok(fit<=16/9/2,'16:9 screens are not changed');
 // the scenes are composed for 16:9 with animals out to the sides (the mammoth calf, the tyrannosaur chicks, the triceratops calf): narrower
 // screens (4:3, portrait) pull back far enough to keep them
 assert.ok(fit>=.8,'the animals at the sides stay in view');});

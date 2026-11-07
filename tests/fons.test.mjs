// Fons marí de vidre (CE06, 0.28): the dive from the surface to the abyss in twenty stimuli, with travellings of the camera between
// them, each stimulus stopping and darkening at its end, the climb back to the surface after the twentieth, and its music.
import test from 'node:test';
import assert from 'node:assert/strict';
import {FONS_N,FONS_NAMES,FONS_POSES,FONS_RETURN,FONS_STIM,FONS_SURF,FONS_TRAVEL,fonsCamera,fonsDuration,fonsLayers,fonsRest,fonsScore} from '../dist/fons.js';
import {FONS_GLSL} from '../dist/fons-shaders.js';
import {EXTRA_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {defaults} from '../dist/input.js';
const item=EXTRA_CAUSES.find(x=>x.id==='jelly');
const setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
const close=(a,b,e=1e-9)=>a.every((x,i)=>Math.abs(x-b[i])<e);

test('twenty scenes: a pose, a name and a shader each; the descent goes from the surface to the floor',()=>{
 assert.equal(FONS_N,20);assert.equal(FONS_POSES.length,20);assert.equal(FONS_NAMES.length,20);assert.equal(FONS_GLSL.scenes.length,20);
 for(const src of FONS_GLSL.scenes)assert.match(src,/void scene\(vec2 q,float t\)/);
 assert.ok(FONS_POSES[0][1]>-1&&FONS_POSES[19][1]<-22,'from just under the surface to the floor');
 for(const p of FONS_POSES)assert.ok(p[2]>.2&&p[2]<2,'a sensible height of the screen');});
test('no reserved words of GLSL ES 3.0 used as names in the shaders',()=>{
 const reserved=['cast','input','output','filter','sample','common','partition','active','superp','namespace','using','goto','union','enum','typedef','template','this','packed','resource','inline','noinline','public','static','extern','external','interface','long','short','double','half','fixed','unsigned','sizeof','class','asm'];
 for(const src of [FONS_GLSL.common,FONS_GLSL.bg,FONS_GLSL.head,FONS_GLSL.tail,...FONS_GLSL.scenes]){const code=src.replace(/\/\/.*$/gm,'');for(const w of reserved)assert.ok(!new RegExp(`\\b${w}\\b`).test(code),w);}});
test('each press: two seconds of travelling, the stimulus, and five more seconds for the climb after the twentieth',()=>{
 for(let i=0;i<20;i++)assert.equal(fonsDuration(i),FONS_TRAVEL+FONS_STIM+(i===19?FONS_RETURN:0));
 assert.equal(fonsDuration(3,20),FONS_TRAVEL+20);assert.equal(fonsDuration(3,6),FONS_TRAVEL+FONS_STIM,'never shorter than the stimulus');});
test('the camera leaves from where it was, arrives at the scene, drifts, and climbs to the surface after the last one',()=>{
 for(let i=0;i<20;i++){const from=fonsRest(i-1),a=fonsCamera(i,0,FONS_STIM,from);assert.ok(close(a,from,1e-6),`${i}: starts where it was`);
  for(let t=0;t<=fonsDuration(i);t+=.05){const c=fonsCamera(i,t,FONS_STIM,from),d=fonsCamera(i,t+.05,FONS_STIM,from);
   assert.ok(c.every(Number.isFinite)&&c[2]>0);assert.ok(Math.abs(Math.log(d[2]/c[2]))<.12,`${i} ${t}: no jump in the zoom`);
   assert.ok(Math.hypot(d[0]-c[0],d[1]-c[1])/Math.min(c[2],d[2])<(i===19?2.5:1),`${i} ${t}: no jump`);}
  if(i<19)assert.ok(close(fonsCamera(i,FONS_TRAVEL+FONS_STIM),fonsRest(i),1e-9),`${i}: rests where the drift ends`);}
 assert.ok(close(fonsCamera(19,fonsDuration(19)),FONS_SURF,1e-9),'back at the surface');
 assert.deepEqual(fonsRest(-1),[...FONS_SURF]);});
test('during the travelling the scene left behind is drawn and fades; the last scene fades away while the camera climbs',()=>{
 assert.deepEqual(fonsLayers(0,.5,.2,null).map(l=>l.scene),[0]);
 const L=fonsLayers(5,.6,.3,10.3);assert.deepEqual(L.map(l=>l.scene),[4,5]);assert.ok(L[0].alpha<1&&L[0].alpha>0);
 assert.deepEqual(fonsLayers(5,FONS_TRAVEL+.5,2.2,12.2).map(l=>l.scene),[5]);
 assert.equal(fonsLayers(19,FONS_TRAVEL+FONS_STIM+3,15,null).length,0);});
test('the music: recorded instruments and natural sounds only, inside the press, ordered; it ends plucked or struck',()=>{
 const struck=new Set(['harpRec','glockRec','marimbaRec','celliPizzRec','violinsPizzRec','triangleRec','natureRec']);
 for(const dur of [12,16,20])for(let i=0;i<20;i++){const S=fonsScore(i,dur),D=fonsDuration(i,dur),end=FONS_TRAVEL+Math.max(FONS_STIM,dur);assert.ok(S.length>30,`${i}: a full piece`);
  for(let j=0;j<S.length;j++){const e=S[j];assert.ok(e.inst.endsWith('Rec'),e.inst);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9);assert.ok(e.vel>0&&e.vel<=1);if(j)assert.ok(e.at>=S[j-1].at);
   // in the last two seconds of the stimulus (and in the climb) only plucked or struck notes and the sea
   if(e.at*D>end-2)assert.ok(struck.has(e.inst),`${i} ${dur}: ${e.inst} at ${(e.at*D).toFixed(2)}`);
   assert.ok((e.at+e.length)*D<=(i===19?D:end)+1e-6,`${i}: nothing after the stimulus`);}
  assert.ok(S.some(e=>e.at*D<FONS_TRAVEL),`${i}: the travelling sounds`);}});
test('a press: the first starts from the surface, each next one from where the last rests, after the twentieth from the surface again',()=>{
 const g=setup(),s={...defaults};
 for(let k=0;k<22;k++){const v=k%20,prev=g.variant;assert.ok(beginCause(g,s,10+k*20));assert.equal(g.variant,v);assert.equal(g.duration,fonsDuration(v,s.duration));
  assert.ok(close(g.fonsFrom,k===0||prev===19?[...FONS_SURF]:fonsRest(prev),1e-9),`press ${k}`);assert.equal(g.score.length>0,true);
  g.time=g.duration;finishCause(g,s,10+k*20+g.duration);assert.equal(g.wait.mode,'wait');}});
test('a press while a stimulus runs travels from where the camera is; a new «Durada» keeps the place in the stimulus',()=>{
 const g=setup(),s={...defaults};beginCause(g,s,10);g.time=6;const here=fonsCamera(0,6,g.fonsStim,g.fonsFrom);beginCause(g,{...s,lock:false},16);
 assert.equal(g.variant,1);assert.ok(close(g.fonsFrom,here,1e-9));assert.ok(g.fonsPrevTau>0);
 g.time=g.duration*.4;assert.ok(retimeCause(g,s,20));assert.ok(Math.abs(g.time/g.duration-.4)<1e-9);assert.equal(g.duration,fonsDuration(1,20));});
test('portrait screens: the renderer and the scenes pull back by the same amount, so each scene keeps its whole width',async()=>{
 const {readFileSync}=await import('node:fs');const gl=readFileSync(new URL('../dist/fons-gl.js',import.meta.url),'utf8');
 const fit=+gl.match(/const FG_FIT=([\d.]+);/)[1],m=FONS_GLSL.tail.match(/ASP=max\(\.5\*uR\.x\/uR\.y,([\d.]+)\)/);
 assert.ok(m,'the scenes know the narrowest width');assert.equal(+m[1],fit);assert.ok(fit<.75,'16:9 and 4:3 screens are not changed');});

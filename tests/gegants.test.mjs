// Gegants del blau (CE38, 0.36): a journey across the oceans in twenty stimuli, from the Arctic to the Southern Ocean, with travellings
// through open water between them, each stimulus stopping and darkening at its end, the climb to the sea at sunset after the twentieth,
// its music of recorded instruments per ocean and the sounds of the animals' gestures.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {GG_N,GG_NAMES,GG_RETURN,GG_STIM,GG_START,GG_STILL,GG_SURF,GG_IDLE,GG_TRAVEL,ggCamera,ggDuration,ggLayers,ggRest,ggRestLayers,ggScore,ggShot,ggStim} from '../dist/gegants.js';
import {GG_GLSL} from '../dist/gegants-shaders.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {EXTRA_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {defaults} from '../dist/input.js';
const item=EXTRA_CAUSES.find(x=>x.id==='giants');
const setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
const close=(a,b,e=1e-9)=>a.length===b.length&&a.every((x,i)=>Math.abs(x-b[i])<e);
const src=readFileSync(new URL('../dist/gegants.js',import.meta.url),'utf8');

test('twenty scenes and the surface: a name and a shader each, a still moment inside each stimulus',()=>{
 assert.equal(GG_N,20);assert.equal(GG_NAMES.length,20);assert.equal(GG_GLSL.scenes.length,21);assert.equal(GG_SURF,20);
 for(const s of GG_GLSL.scenes)assert.match(s,/void scene\(vec2 w,float T\)/);
 assert.equal(GG_STILL.length,20);GG_STILL.forEach((t,i)=>assert.ok(t>GG_TRAVEL+1&&t<GG_TRAVEL+ggStim(i),`${i}: ${t}`));
 assert.ok(!/\d/.test(GG_NAMES.join('')),'no numbers in the names');});
test('no reserved words of GLSL ES 3.0 used as names in the shaders',()=>{
 const reserved=['cast','input','output','out\\s*[=;,)]','filter','sample','common','partition','active','superp','namespace','using','goto','union','enum','typedef','template','this','packed','resource','inline','noinline','public','static','extern','external','interface','long','short','double','half','fixed','unsigned','sizeof','class','asm'];
 for(const s of [GG_GLSL.common,GG_GLSL.head,GG_GLSL.tail,...GG_GLSL.scenes]){const code=s.replace(/\/\/.*$/gm,'');for(const w of reserved)assert.ok(!new RegExp(`\\b${w}`).test(code.replace(/\bout (float|vec[234]|int|mat[234])\b/g,'')),w);}});
test('each press: two seconds of travelling and the stimulus (two more for the whale shark and the blue whale), the climb after the twentieth',()=>{
 for(let i=0;i<20;i++)assert.equal(ggDuration(i),GG_TRAVEL+GG_STIM+(i===14||i===19?2:0)+(i===19?GG_RETURN:0));
 assert.equal(ggDuration(3,20),GG_TRAVEL+20);assert.equal(ggDuration(3,6),GG_TRAVEL+GG_STIM,'never shorter than the stimulus');});
test('the camera arrives at each scene, moves without jumps, rests where it ends; the climb ends at the surface',()=>{
 for(let i=0;i<20;i++){const from=ggRest(i-1),S=ggStim(i);
  assert.ok(close(ggCamera(i,GG_TRAVEL,GG_STIM,from),ggShot(i,GG_TRAVEL),1e-9),`${i}: arrives at its first key`);
  for(let t=GG_TRAVEL;t<=GG_TRAVEL+S;t+=.05){const c=ggCamera(i,t,GG_STIM,from),d=ggCamera(i,t+.05,GG_STIM,from);
   assert.ok(c.every(Number.isFinite)&&c[3]>0);if(t+.05>GG_TRAVEL+S)break;
   assert.ok(Math.abs(Math.log(d[3]/c[3]))<.12,`${i} ${t}: no jump in the zoom`);assert.ok(Math.hypot(d[1]-c[1],d[2]-c[2])/Math.min(c[3],d[3])<.5,`${i} ${t}: no jump`);}
  if(i<19)assert.ok(close(ggCamera(i,GG_TRAVEL+S),ggRest(i),1e-9),`${i}: rests where it ends`);}
 assert.ok(close(ggCamera(19,ggDuration(19)),[...GG_START],1e-9),'back at the surface at the end of the climb');
 assert.deepEqual(ggRest(-1),[...GG_START]);});
test('the layers: the first press leaves the surface; a travelling dissolves the scene left behind; after the twentieth, the surface',()=>{
 assert.deepEqual(ggLayers(0,.5,.5,null).map(l=>l.scene),[GG_SURF,0]);
 assert.deepEqual(ggLayers(5,.6,.6,10.3).map(l=>l.scene),[4,5]);assert.deepEqual(ggLayers(5,GG_TRAVEL+.5,2.2,12.2).map(l=>l.scene),[5]);
 const T0=GG_TRAVEL+ggStim(19);assert.deepEqual(ggLayers(19,T0+5,T0+5,null).map(l=>l.scene),[GG_SURF]);
 assert.deepEqual(ggRestLayers(-1,0,false).map(l=>[l.scene,l.tau]),[[GG_SURF,GG_IDLE]]);assert.deepEqual(ggRestLayers(7,30,false).map(l=>l.scene),[7]);
 assert.deepEqual(ggRestLayers(19,30,true).map(l=>l.scene),[GG_SURF]);});
test('the music: recorded instruments and sounds only, inside the press, in order; the end is plucked or struck',()=>{
 const struck=new Set(['harpRec','marimbaRec','glockRec','celliPizzRec','violinsPizzRec','timpaniRec','triangleRec','vibRec','kalimbaRec','uduRec','escletxaRec','pouRec','pouPerc','selvaRec','sabanaRec','natureRec','ggRec']);
 for(const dur of [12,16,20])for(let i=0;i<20;i++){const S=ggScore(i,dur),D=ggDuration(i,dur),end=GG_TRAVEL+ggStim(i,dur);assert.ok(S.length>30,`${i}: a full piece`);
  for(let j=0;j<S.length;j++){const e=S[j];assert.ok(struck.has(e.inst),`${i}: ${e.inst}`);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9);assert.ok(e.vel>0&&e.vel<=1);if(j)assert.ok(e.at>=S[j-1].at);
   assert.ok((e.at+e.length)*D<=(i===19?D:end)+1e-6,`${i}: nothing after the stimulus`);}
  assert.ok(S.some(e=>e.at*D<GG_TRAVEL),`${i}: the travelling sounds`);}
 const D=ggDuration(19),T0=GG_TRAVEL+ggStim(19);assert.ok(ggScore(19).some(e=>e.variant==='bufada'&&e.at*D>T0+4),'the blue whale blows at the surface');});
test('the gestures and the voices: each named sound is in its bank, as a file, credited, and heard',()=>{
 const m=src.match(/const GG_FX=Object\.freeze\(\{([\s\S]*?)\}\);/);assert.ok(m);const fx=Function(`return {${m[1]}};`)();
 const have=inst=>new Set(SAMPLE_BANK[inst].zones.map(z=>z[9]));const heard=new Set();
 for(let i=0;i<20;i++)for(const e of ggScore(i)){assert.ok(SAMPLE_BANK[e.inst],e.inst);if(e.variant&&SAMPLE_BANK[e.inst].strict){assert.ok(have(e.inst).has(e.variant),`${i}: ${e.inst} ${e.variant}`);heard.add(e.inst+':'+e.variant);}}
 for(const [k,v] of Object.entries(fx)){assert.ok(v,k);assert.ok(have(v[0]).has(v[1]),`${k}: ${v.join(' ')}`);assert.ok(heard.has(v.join(':')),`${k} is heard`);}
 const root=new URL('../dist/assets/samples/',import.meta.url),credits=readFileSync(new URL('CREDITS.md',root),'utf8');
 for(const z of SAMPLE_BANK.ggRec.zones){assert.ok(existsSync(new URL(z[0],root)),z[0]);assert.ok(credits.includes(z[0]),`${z[0]} credited`);assert.ok(heard.has('ggRec:'+z[9]),`${z[9]} is heard`);}
 assert.equal(SAMPLE_BANK.ggRec.fallback,null);assert.equal(SAMPLE_BANK.ggRec.strict,true);});
test('a press: the first starts from the surface, each next one from where the last rests, after the twentieth from the surface again',()=>{
 const g=setup(),s={...defaults};
 for(let k=0;k<22;k++){const v=k%20,prev=g.variant;assert.ok(beginCause(g,s,10+k*30));assert.equal(g.variant,v);assert.equal(g.duration,ggDuration(v,s.duration));
  assert.ok(close(g.fonsFrom,k===0||prev===19?[...GG_START]:ggRest(prev),1e-9),`press ${k}`);assert.ok(g.score.length>0);
  g.time=g.duration;finishCause(g,s,10+k*30+g.duration);assert.equal(g.wait.mode,'wait');}});
test('a press while a stimulus runs travels from where the camera is; a new «Durada» keeps the place in the stimulus',()=>{
 const g=setup(),s={...defaults};beginCause(g,s,10);g.time=6;const here=ggCamera(0,6,g.fonsStim,g.fonsFrom);beginCause(g,{...s,lock:false},16);
 assert.equal(g.variant,1);assert.ok(close(g.fonsFrom,here,1e-9));assert.ok(g.fonsPrevTau>0);
 g.time=g.duration*.4;assert.ok(retimeCause(g,s,20));assert.ok(Math.abs(g.time/g.duration-.4)<1e-9);assert.equal(g.duration,ggDuration(1,20));});
test('the catalogue: Gegants del blau is CE38, a dive with acoustic music',()=>{
 assert.equal(item.code,'CE38');assert.equal(item.name,'Gegants del blau');assert.ok(item.dive&&item.recorded);assert.equal(item.variants,20);assert.equal(item.minDuration,GG_STIM);});
test('portrait screens: the renderer pulls back so that each scene keeps its width',()=>{
 const gl=readFileSync(new URL('../dist/gegants-gl.js',import.meta.url),'utf8');const fit=+gl.match(/const GGL_FIT=([\d.]+);/)[1];assert.ok(fit<=16/9/2);assert.ok(fit>=.8);});

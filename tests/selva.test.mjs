// Selva de llum (CE35, 0.29): the dive from the dawn sky over the canopy to the bed of the river in twenty stimuli, with travellings of the camera between
// them, each stimulus stopping and darkening at its end, the climb back to the sky after the twentieth, its music and its sounds.
import test from 'node:test';
import assert from 'node:assert/strict';
import {SELVA_N as FONS_N,SELVA_NAMES as FONS_NAMES,SELVA_POSES as FONS_POSES,SELVA_RETURN as FONS_RETURN,SELVA_STIM as FONS_STIM,SELVA_START as FONS_SURF,SELVA_TRAVEL as FONS_TRAVEL,selvaCamera as fonsCamera,selvaDuration as fonsDuration,selvaLayers as fonsLayers,selvaRest as fonsRest,selvaScore as fonsScore} from '../dist/selva.js';
import {SELVA_GLSL as FONS_GLSL} from '../dist/selva-shaders.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {existsSync} from 'node:fs';
import {EXTRA_CAUSES,beginCause,finishCause,retimeCause} from '../dist/cause-catalog.js';
import {defaults} from '../dist/input.js';
const item=EXTRA_CAUSES.find(x=>x.id==='jungle');
const setup=()=>({item,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
const close=(a,b,e=1e-9)=>a.every((x,i)=>Math.abs(x-b[i])<e);

test('twenty scenes: a pose, a name and a shader each; the descent goes from the sky to the bed of the river',()=>{
 assert.equal(FONS_N,20);assert.equal(FONS_POSES.length,20);assert.equal(FONS_NAMES.length,20);assert.equal(FONS_GLSL.scenes.length,20);
 for(const src of FONS_GLSL.scenes)assert.match(src,/void scene\(vec2 q,float t\)/);
 assert.ok(FONS_POSES[0][1]>0&&Math.min(...FONS_POSES.map(p=>p[1]))<-14,'from over the crowns to the bed of the river');assert.ok(FONS_SURF[1]>FONS_POSES[0][1],'the start is in the sky');
 for(const p of FONS_POSES)assert.ok(p[2]>.2&&p[2]<2,'a sensible height of the screen');});
test('no reserved words of GLSL ES 3.0 used as names in the shaders',()=>{
 const reserved=['cast','input','output','filter','sample','common','partition','active','superp','namespace','using','goto','union','enum','typedef','template','this','packed','resource','inline','noinline','public','static','extern','external','interface','long','short','double','half','fixed','unsigned','sizeof','class','asm'];
 for(const src of [FONS_GLSL.common,FONS_GLSL.bg,FONS_GLSL.near,FONS_GLSL.head,FONS_GLSL.tail,...FONS_GLSL.scenes]){const code=src.replace(/\/\/.*$/gm,'');for(const w of reserved)assert.ok(!new RegExp(`\\b${w}\\b`).test(code),w);}});
test('each press: two seconds of travelling, the stimulus, and five more seconds for the climb after the twentieth',()=>{
 for(let i=0;i<20;i++)assert.equal(fonsDuration(i),FONS_TRAVEL+FONS_STIM+(i===19?FONS_RETURN:0));
 assert.equal(fonsDuration(3,20),FONS_TRAVEL+20);assert.equal(fonsDuration(3,6),FONS_TRAVEL+FONS_STIM,'never shorter than the stimulus');});
test('the camera leaves from where it was, arrives at the scene, drifts, and climbs to the sky after the last one',()=>{
 for(let i=0;i<20;i++){const from=fonsRest(i-1),a=fonsCamera(i,0,FONS_STIM,from);assert.ok(close(a,from,1e-6),`${i}: starts where it was`);
  for(let t=0;t<=fonsDuration(i);t+=.05){const c=fonsCamera(i,t,FONS_STIM,from),d=fonsCamera(i,t+.05,FONS_STIM,from);
   assert.ok(c.every(Number.isFinite)&&c[2]>0);assert.ok(Math.abs(Math.log(d[2]/c[2]))<.12,`${i} ${t}: no jump in the zoom`);
   assert.ok(Math.hypot(d[0]-c[0],d[1]-c[1])/Math.min(c[2],d[2])<(i===19?2.5:1),`${i} ${t}: no jump`);}
  if(i<19)assert.ok(close(fonsCamera(i,FONS_TRAVEL+FONS_STIM),fonsRest(i),1e-9),`${i}: rests where the drift ends`);}
 assert.ok(close(fonsCamera(19,fonsDuration(19)),FONS_SURF,1e-9),'back in the sky');
 assert.deepEqual(fonsRest(-1),[...FONS_SURF]);});
test('during the travelling the scene left behind is drawn and fades; the last scene fades away while the camera climbs',()=>{
 assert.deepEqual(fonsLayers(0,.5,.2,null).map(l=>l.scene),[0]);
 const L=fonsLayers(5,.6,.3,10.3);assert.deepEqual(L.map(l=>l.scene),[4,5]);assert.ok(L[0].alpha<1&&L[0].alpha>0);
 assert.deepEqual(fonsLayers(5,FONS_TRAVEL+.5,2.2,12.2).map(l=>l.scene),[5]);
 assert.equal(fonsLayers(19,FONS_TRAVEL+FONS_STIM+3,15,null).length,0);});
test('the music: recorded instruments and natural sounds only, inside the press, ordered; it ends plucked or struck',()=>{
 const struck=new Set(['harpRec','glockRec','marimbaRec','celliPizzRec','violinsPizzRec','triangleRec','woodblockRec','natureRec','selvaRec']);
 for(const dur of [12,16,20])for(let i=0;i<20;i++){const S=fonsScore(i,dur),D=fonsDuration(i,dur),end=FONS_TRAVEL+Math.max(FONS_STIM,dur);assert.ok(S.length>30,`${i}: a full piece`);
  for(let j=0;j<S.length;j++){const e=S[j];assert.ok(e.inst.endsWith('Rec'),e.inst);assert.ok(e.at>=0&&e.at+e.length<=1+1e-9);assert.ok(e.vel>0&&e.vel<=1);if(j)assert.ok(e.at>=S[j-1].at);
   // in the last two seconds of the stimulus (and in the climb) only plucked or struck notes and the sounds of the jungle
   if(e.at*D>end-2)assert.ok(struck.has(e.inst),`${i} ${dur}: ${e.inst} at ${(e.at*D).toFixed(2)}`);
   assert.ok((e.at+e.length)*D<=(i===19?D:end)+1e-6,`${i}: nothing after the stimulus`);}
  assert.ok(S.some(e=>e.at*D<FONS_TRAVEL),`${i}: the travelling sounds`);}});
test('a press: the first starts from the sky, each next one from where the last rests, after the twentieth from the sky again',()=>{
 const g=setup(),s={...defaults};
 for(let k=0;k<22;k++){const v=k%20,prev=g.variant;assert.ok(beginCause(g,s,10+k*20));assert.equal(g.variant,v);assert.equal(g.duration,fonsDuration(v,s.duration));
  assert.ok(close(g.fonsFrom,k===0||prev===19?[...FONS_SURF]:fonsRest(prev),1e-9),`press ${k}`);assert.equal(g.score.length>0,true);
  g.time=g.duration;finishCause(g,s,10+k*20+g.duration);assert.equal(g.wait.mode,'wait');}});
test('a press while a stimulus runs travels from where the camera is; a new «Durada» keeps the place in the stimulus',()=>{
 const g=setup(),s={...defaults};beginCause(g,s,10);g.time=6;const here=fonsCamera(0,6,g.fonsStim,g.fonsFrom);beginCause(g,{...s,lock:false},16);
 assert.equal(g.variant,1);assert.ok(close(g.fonsFrom,here,1e-9));assert.ok(g.fonsPrevTau>0);
 g.time=g.duration*.4;assert.ok(retimeCause(g,s,20));assert.ok(Math.abs(g.time/g.duration-.4)<1e-9);assert.equal(g.duration,fonsDuration(1,20));});
test('portrait screens: the renderer and the scenes pull back by the same amount, so each scene keeps its whole width',async()=>{
 const {readFileSync}=await import('node:fs');const gl=readFileSync(new URL('../dist/selva-gl.js',import.meta.url),'utf8');
 const fit=+gl.match(/const SG_FIT=([\d.]+);/)[1],m=FONS_GLSL.tail.match(/ASP=max\(\.5\*uR\.x\/uR\.y,([\d.]+)\)/);
 assert.ok(m,'the scenes know the narrowest width');assert.equal(+m[1],fit);assert.ok(fit<.75,'16:9 and 4:3 screens are not changed');});
test('the sounds of the jungle: every one the music asks for is in the bank, as a file, and credited',async()=>{
 const {readFileSync}=await import('node:fs');const root=new URL('../dist/assets/samples/',import.meta.url),credits=readFileSync(new URL('CREDITS.md',root),'utf8');
 const have=inst=>new Set(SAMPLE_BANK[inst].zones.map(z=>z[9]));const nature=have('natureRec'),selva=have('selvaRec');const used=new Set();
 for(let i=0;i<20;i++)for(const e of fonsScore(i))if(e.inst==='natureRec'||e.inst==='selvaRec'){assert.ok((e.inst==='natureRec'?nature:selva).has(e.variant),`${i}: ${e.inst} ${e.variant}`);used.add(e.inst+':'+e.variant);}
 for(const v of ['alba','nit','riu'])assert.ok(used.has('natureRec:'+v),v);for(const v of selva)assert.ok(used.has('selvaRec:'+v),`${v} is heard`);
 for(const z of SAMPLE_BANK.selvaRec.zones){assert.ok(existsSync(new URL(z[0],root)),z[0]);assert.ok(credits.includes(z[0]),`${z[0]} credited`);}
 assert.equal(SAMPLE_BANK.selvaRec.fallback,null);assert.equal(SAMPLE_BANK.selvaRec.strict,true);});
test('the catalogue: Selva de llum is CE35, a dive with recorded music that starts in the sky',()=>{
 assert.equal(item.code,'CE35');assert.equal(item.name,'Selva de llum');assert.ok(item.dive&&item.recorded&&item.ownPhases);assert.equal(item.variants,20);assert.equal(item.minDuration,FONS_STIM);});
// 0.34: a side view is mirrored by dividing by sdir(dir), so that a figure turning round narrows like a card instead of being stretched
// across the screen when dir passes through zero (Marc saw the capybaras «explode» sideways as they turned).
test('figures turn round without stretching across the screen (jungle and savanna)',async()=>{
  const {SABANA_GLSL}=await import('../dist/sabana-shaders.js');
  for(const [name,lib] of [['selva',FONS_GLSL],['sabana',SABANA_GLSL]]){const all=JSON.stringify(lib);
    assert.doesNotMatch(all,/f\.x\*=dir;/,`${name}: a mirror by multiplication is left`);assert.match(all,/float sdir\(float d\)/,`${name}: sdir`);}
});

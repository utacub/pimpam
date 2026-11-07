// La nova Pluja de colors (CE03, 0.52): the ink of mathematical marbling keeps its area, every drop touches the water on its note,
// the five workshops and their twenty sheets, the steps of each plan, the print and the clothesline, colours that stay visible on
// both bases, and sounds that all exist in the collection's banks.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mbInk,mbQueue,mbAdvance,mbView,mbArea,mbBusy} from '../dist/marbre-tinta.js';
import {MB_TALLERS,MB_SHEETS,MB_SCALES,MB_CONTRAST} from '../dist/marbre-tallers.js';
import {PC_CAUSE,MB_PLAN,MB_FALL,mbStart,mbPress,mbTick,mbBlocked,mbStatus,mbProgress,mbPlan} from '../dist/color-rain.js';
import {mbColours,mbContrast} from '../dist/marbre-escena.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
const run=(game,s,sec,dt=1/60)=>{for(let t=0;t<sec;t+=dt)mbTick(game,s,dt);};
const toRest=(game,s)=>{let n=0;while(game.marbre.phase!=='rest'&&n++<4000)mbTick(game,s,1/60);};
const S={mbSteps:5,mbGestures:'pintes',mbSize:'grans',mbColors:'tradicionals',mbLine:true,mbFirst:'barcelona',lock:true,sound:true,waitCue:true};
const hasZone=(bank,name)=>!!SAMPLE_BANK[bank]?.zones.some(z=>z[9]===name);
const finite=F=>F.ink.polys.every(P=>P.p.every(Number.isFinite));

test('the ink is only moved, never made or lost: a drop, a stylus and a whirlpool keep the area of the ink around them',()=>{
 const ink=mbInk(16/9);mbQueue(ink,{kind:'drop',cx:.6,cy:.5,r:.12,col:0,t0:0,dur:.5});mbAdvance(ink,0);mbAdvance(ink,.6);assert.equal(ink.polys.length,1);
 const a0=mbArea(ink.polys[0].p);assert.ok(Math.abs(a0-Math.PI*.12*.12)/a0<.003,String(a0));
 mbQueue(ink,{kind:'drop',cx:.82,cy:.52,r:.09,col:1,t0:1,dur:.5});mbAdvance(ink,1);mbAdvance(ink,1.6);
 const a1=mbArea(ink.polys[0].p);assert.ok(Math.abs(a1-a0)/a0<.01,`drop ${a0} → ${a1}`);
 mbQueue(ink,{kind:'tine',bx:-.15,by:0,mx:1,my:0,nx:0,ny:1,L:16/9+.3,soft:.09,z:.08,w:.03,t0:2,dur:1});mbAdvance(ink,2);assert.ok(mbBusy(ink,2.5));mbAdvance(ink,3.2);
 const a2=mbArea(ink.polys[0].p);assert.ok(Math.abs(a2-a0)/a0<.015,`tine ${a0} → ${a2}`);
 mbQueue(ink,{kind:'circle',cx:.7,cy:.5,r:0,z:.15,w:.15,t0:4,dur:1});mbAdvance(ink,4);mbAdvance(ink,5.2);
 const a3=mbArea(ink.polys[0].p);assert.ok(Math.abs(a3-a0)/a0<.02,`vortex ${a0} → ${a3}`);
 assert.ok(!mbBusy(ink,6));assert.equal(mbView(ink,6),ink.polys);assert.ok(ink.polys.every(P=>P.p.every(Number.isFinite)));
});

test('five workshops, four sheets each: twenty different sheets with names, scales of their own and real instruments',()=>{
 assert.equal(PC_CAUSE.id,'color-rain');assert.equal(PC_CAUSE.code,'CE03');assert.ok(PC_CAUSE.marbre&&PC_CAUSE.recorded);
 assert.deepEqual(MB_TALLERS.map(T=>T.id),['barcelona','istanbul','kyoto','paris','nuremberg']);assert.equal(MB_SHEETS.length,20);
 assert.equal(new Set(MB_SHEETS.map(x=>x.id)).size,20);assert.equal(new Set(MB_SHEETS.map(x=>x.name)).size,20);
 for(const T of MB_TALLERS){assert.equal(T.sheets.length,4,T.id);assert.ok(MB_SCALES[T.scale],T.id);assert.equal(T.prog.length,8,T.id);assert.equal(T.tune.length,8,T.id);
  for(const k of ['arp','bass','mel','spark','gliss','cad']){const b=T.inst[k];assert.ok(SAMPLE_BANK[b],`${T.id} ${k} ${b}`);assert.ok(!/organ|pad|drone/i.test(b),b);}
  assert.ok(SAMPLE_BANK[T.perc.bank],T.perc.bank);for(const [,name] of T.perc.hits)assert.ok(hasZone(T.perc.bank,name)||!SAMPLE_BANK[T.perc.bank].strict,`${T.perc.bank} ${name}`);
  assert.ok(hasZone(T.air[0],T.air[1]),T.air.join(' '));
  for(const sh of T.sheets){assert.ok(sh.name&&sh.desc&&sh.gesture?.length,sh.id);assert.ok(!/dóna/.test(sh.desc),sh.id);}}
 const text=readFileSync(new URL('../dist/marbre-tallers.js',import.meta.url),'utf8')+readFileSync(new URL('../dist/color-rain.js',import.meta.url),'utf8');
 assert.ok(!/document\.|window\./.test(text),'no DOM in the model');
});

test('every drop touches the water exactly on its note: the drops of each step and the notes that go with them',()=>{
 for(const T of MB_TALLERS)for(const gest of ['gotes','pintes','flors']){const s={...S,mbFirst:T.id,mbGestures:gest,mbSteps:7},game={};mbStart(game,s);const F=game.marbre;
  for(let k=0;k<6;k++){const before=F.ink.seq;assert.ok(mbPress(game,s));
   const drops=F.ink.ops.filter(o=>o.kind==='drop'&&o.seq>before),notes=F.events.filter(e=>!e.fx).map(e=>e.t);
   const spray=F.kind.startsWith('spray');
   // the first drop of every note lands on it; the few that fall with it follow within 45 ms, together to the eye and the ear
   // (from about 45 ms on, a sound heard before its picture starts to be noticed: ITU-R BT.1359-1, 1998)
   let exact=0;for(const o of drops){const near=notes.reduce((m,t)=>Math.min(m,Math.abs(t-o.t0)),1e9);if(near<1e-6)exact++;assert.ok(near<.046,`${T.id} ${gest} ${F.kind}: a drop ${near.toFixed(3)} s from its note`);}
   if(drops.length&&!spray)assert.ok(exact>=drops.length/4,`${T.id} ${gest} ${F.kind}: ${exact} of ${drops.length} exactly on a note`);
   for(const f of F.falls.filter(f=>f.t1>F.t)){assert.ok(Math.abs(f.t1-f.t0-MB_FALL)<1e-9||f.small,'fall time');}
   const evs=F.events.map(e=>e.t);assert.deepEqual(evs,[...evs].sort((a,b)=>a-b),'events in order');
   toRest(game,s);assert.ok(finite(F),`${T.id} ${gest} ${k}`);}}
});

test('the plans: three, five or seven steps, the last one is always the print; the steps wait for each other with «Espera que acabi»',()=>{
 for(const n of [3,5,7])for(const g of ['gotes','pintes','flors']){const p=MB_PLAN[n][g];assert.equal(p.length,n);assert.equal(p.at(-1),'print');assert.equal(p[0],'rain');}
 assert.deepEqual(mbPlan({}),MB_PLAN[5].pintes);
 const game={};mbStart(game,S);const F=game.marbre;assert.equal(F.phase,'rest');assert.match(mbStatus(game,S),/Barcelona/);
 assert.ok(mbPress(game,S));assert.equal(F.phase,'step');assert.ok(mbBlocked(game,S));assert.ok(!mbPress(game,S),'a press during a step does nothing');
 assert.ok(!mbBlocked(game,{...S,lock:false}));assert.match(mbProgress(game,S),/class="done"/);
 toRest(game,S);for(let k=1;k<4;k++){assert.ok(mbPress(game,S));toRest(game,S);}
 assert.ok(mbPress(game,S));assert.equal(F.phase,'print');assert.ok(mbBlocked(game,{...S,lock:false}),'the print always finishes');assert.match(mbStatus(game,S),/estenedor/);
 toRest(game,S);assert.equal(F.hung.length,1);assert.equal(F.j,1);assert.equal(F.step,0);assert.equal(F.ink.polys.length,0,'the bath is skimmed clean');
 assert.ok(F.hung[0].polys.length>5&&F.hung[0].polys.every(P=>P.p.every(Number.isFinite)));
});

test('twenty sheets go round the five workshops, and the second round uses the other palette',()=>{
 const s={...S,mbSteps:3},game={};mbStart(game,s);const F=game.marbre;const seen=[];
 for(let k=0;k<21;k++){seen.push(F.g*4+F.j);for(let i=0;i<3;i++){mbPress(game,s);toRest(game,s);}}
 assert.deepEqual(seen.slice(0,20),Array.from({length:20},(_,i)=>i));assert.equal(F.lap,1);assert.equal(F.hung.length,8);
 const g2={};mbStart(g2,{...s,mbFirst:'paris'});assert.equal(g2.marbre.g,3);
});

test('the inks stay visible on the water: both bases, with and without decor, traditional and high-contrast colours',()=>{
 for(let g=0;g<5;g++)for(const lap of [0,1])for(const base of ['black','white'])for(const mode of ['full','none'])for(const mbColors of ['tradicionals','contrast']){
  const C=mbColours(g,lap,{base,mbColors},{mode});assert.equal(C.cols.length,4);
  for(const col of C.cols){const k=mbContrast(col,C.water);assert.ok(k>=(mbColors==='contrast'?4.5:base==='white'?3:2.2),`${MB_TALLERS[g].id} ${lap} ${base} ${mode} ${mbColors}: ${col} on ${C.water} ${k.toFixed(2)}`);}}
 for(const k of ['dark','light'])assert.equal(MB_CONTRAST[k].length,4);
});

test('the sounds of the workshop are recordings of the banks: drops, brush, paper, pegs and the skimming of the bath',()=>{
 for(const T of MB_TALLERS){const s={...S,mbFirst:T.id,mbSteps:5},game={};mbStart(game,s);const F=game.marbre,fx=new Set();
  for(let k=0;k<5;k++){mbPress(game,s);for(const e of F.events)if(e.fx)fx.add(e.bank+'/'+e.name);toRest(game,s);}
  for(const z of fx){const [b,n]=z.split('/');assert.ok(hasZone(b,n),z);}assert.ok(fx.size>=5,[...fx].join(' '));}
});

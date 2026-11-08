// La nova Pluja de colors (CE03, 0.52 and 0.52.1): the ink of mathematical marbling keeps its area, every drop touches the water on
// its note, the five workshops and their twenty sheets (each with its own layout, gesture and palettes), the steps of each plan,
// the print and the clothesline, colours that never repeat and stay visible on both bases, and sounds that all exist in the
// collection's banks.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {mbInk,mbQueue,mbAdvance,mbView,mbArea,mbBusy} from '../dist/marbre-tinta.js';
import {MB_TALLERS,MB_SHEETS,MB_SCALES,MB_CONTRAST,mbPalette,mbContrastSet,mbTurn} from '../dist/marbre-tallers.js';
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
 // a breath on a slant only slides the ink; a line of ink laid beside a drop pushes it aside by half its width and keeps its area
 mbQueue(ink,{kind:'shear',axis:'d',mx:Math.cos(.6),my:Math.sin(.6),amp:.03,fr:30,ph:.2,t0:6,dur:1});mbAdvance(ink,6);mbAdvance(ink,7.2);
 const a4=mbArea(ink.polys[0].p);assert.ok(Math.abs(a4-a0)/a0<.025,`slant ${a0} → ${a4}`);
 const cy=ink.polys[0].cy;mbQueue(ink,{kind:'band',bx:.8,by:.12,nx:0,ny:1,d:.1,col:2,t0:8,dur:.8});mbAdvance(ink,8);mbAdvance(ink,8.4);
 assert.ok(mbView(ink,8.4).length===ink.polys.length);mbAdvance(ink,9);
 const a5=mbArea(ink.polys[0].p);assert.ok(Math.abs(a5-a4)/a4<.002,`band ${a4} → ${a5}`);assert.ok(Math.abs(ink.polys[0].cy-cy-.05)<1e-9,'pushed aside by half the stripe');
 const S=ink.polys.find(P=>P.col===2);assert.ok(S&&Math.abs(mbArea(S.p)-.1*(Math.max(...S.p.filter((_,i)=>i%2===0))-Math.min(...S.p.filter((_,i)=>i%2===0))))<1e-6,'the stripe is a band d wide');
});

test('five workshops, four sheets each: twenty different sheets with names, scales of their own and real instruments',()=>{
 assert.equal(PC_CAUSE.id,'color-rain');assert.equal(PC_CAUSE.code,'CE03');assert.ok(PC_CAUSE.marbre&&PC_CAUSE.recorded);
 assert.deepEqual(MB_TALLERS.map(T=>T.id),['barcelona','istanbul','kyoto','paris','nuremberg']);assert.equal(MB_SHEETS.length,20);
 assert.equal(new Set(MB_SHEETS.map(x=>x.id)).size,20);assert.equal(new Set(MB_SHEETS.map(x=>x.name)).size,20);
 for(const T of MB_TALLERS){assert.equal(T.sheets.length,4,T.id);assert.ok(MB_SCALES[T.scale],T.id);assert.equal(T.prog.length,8,T.id);assert.equal(T.tune.length,8,T.id);
  for(const k of ['arp','bass','mel','spark','gliss','cad']){const b=T.inst[k];assert.ok(SAMPLE_BANK[b],`${T.id} ${k} ${b}`);assert.ok(!/organ|pad|drone/i.test(b),b);}
  assert.ok(SAMPLE_BANK[T.perc.bank],T.perc.bank);for(const [,name] of T.perc.hits)assert.ok(hasZone(T.perc.bank,name)||!SAMPLE_BANK[T.perc.bank].strict,`${T.perc.bank} ${name}`);
  assert.ok(hasZone(T.air[0],T.air[1]),T.air.join(' '));
  for(const sh of T.sheets){assert.ok(sh.name&&sh.desc&&sh.gesture?.length&&sh.lay?.k&&sh.rc?.length,sh.id);assert.ok(!/dóna/.test(sh.desc),sh.id);
   assert.equal(sh.pal.length,2,sh.id);for(const p of sh.pal){assert.equal(p.water.length,2);assert.ok(p.inks.length>=3&&p.inks.length<=5,sh.id);assert.ok(sh.rc.every(c=>c<p.inks.length),sh.id);}
   if(T.rings)assert.equal(sh.lay.k,'rings',sh.id);}}
 // every sheet is its own: no two have the same layout with the same gesture
 const recipe=MB_SHEETS.map(x=>JSON.stringify([x.lay,x.rc.length,x.gesture.map(p=>p.k+(p.dir||'')+(p.f||''))]));assert.equal(new Set(recipe).size,20);
 assert.ok(new Set(MB_SHEETS.map(x=>x.lay.k)).size>=10,'at least ten layouts');assert.ok(new Set(MB_SHEETS.flatMap(x=>x.gesture.map(p=>p.k))).size>=12,'at least twelve kinds of pass');
 const text=readFileSync(new URL('../dist/marbre-tallers.js',import.meta.url),'utf8')+readFileSync(new URL('../dist/color-rain.js',import.meta.url),'utf8');
 assert.ok(!/document\.|window\./.test(text),'no DOM in the model');
});

test('every drop touches the water exactly on its note: the drops of each step and the notes that go with them',()=>{
 // every sheet with combs and with flowers (big drops); every workshop with only drops (middle-sized), and the small drops of a
 // sheet of stripes and of one of targets (the model is run in full, so the small drops are kept to a few steps)
 const runs=[...MB_SHEETS.flatMap(sh=>[[sh,'pintes','grans',6],[sh,'flors','grans',6]]),...MB_SHEETS.filter(sh=>sh.j===sh.g%4).map(sh=>[sh,'gotes','mitjanes',4]),
  ...MB_SHEETS.filter(sh=>['zigazaga','estel'].includes(sh.id)).map(sh=>[sh,'gotes','petites',3])];
 for(const [sh,gest,size,steps] of runs){const s={...S,mbFirst:MB_TALLERS[sh.g].id,mbGestures:gest,mbSteps:7,mbSize:size},game={};mbStart(game,s);const F=game.marbre;F.j=sh.j;
  for(let k=0;k<steps;k++){const before=F.ink.seq;assert.ok(mbPress(game,s));
   const drops=F.ink.ops.filter(o=>(o.kind==='drop'||o.kind==='band')&&o.seq>before),notes=F.events.filter(e=>!e.fx).map(e=>e.t);
   const spray=F.kind.startsWith('spray'),exact=[];
   // the first drop of every note lands on it; the few that fall with it follow within 45 ms, together to the eye and the ear
   // (from about 45 ms on, a sound heard before its picture starts to be noticed: ITU-R BT.1359-1, 1998)
   for(const o of drops){const near=notes.reduce((m,t)=>Math.min(m,Math.abs(t-o.t0)),1e9);assert.ok(near<.046,`${sh.id} ${gest} ${F.kind}: a drop ${near.toFixed(3)} s from its note`);if(near<1e-6)exact.push(o.t0);}
   if(!spray)for(const o of drops)assert.ok(exact.some(t=>o.t0-t>-1e-9&&o.t0-t<.046),`${sh.id} ${gest} ${F.kind}: a drop at ${o.t0.toFixed(3)} s with no drop on a note just before it`);
   for(const f of F.falls.filter(f=>f.t1>F.t)){assert.ok(Math.abs(f.t1-f.t0-MB_FALL)<1e-9||f.small,'fall time');assert.equal(f.j,sh.j);}
   const evs=F.events.map(e=>e.t);assert.deepEqual(evs,[...evs].sort((a,b)=>a-b),'events in order');
   toRest(game,s);assert.ok(finite(F),`${sh.id} ${gest} ${k}`);assert.ok(F.ink.polys.length>0,`${sh.id} ${gest} ${k}: ink on the water`);}}
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

test('twenty sheets go round the five workshops, and the second round is the second lap (its own palettes)',()=>{
 const s={...S,mbSteps:3},game={};mbStart(game,s);const F=game.marbre;const seen=[];
 for(let k=0;k<21;k++){seen.push(F.g*4+F.j);for(let i=0;i<3;i++){mbPress(game,s);toRest(game,s);}}
 assert.deepEqual(seen.slice(0,20),Array.from({length:20},(_,i)=>i));assert.equal(F.lap,1);assert.equal(F.hung.length,8);
 const g2={};mbStart(g2,{...s,mbFirst:'paris'});assert.equal(g2.marbre.g,3);
});

test('the inks stay visible on the water: both bases, with and without decor, traditional and high-contrast colours, every lap',()=>{
 for(let g=0;g<5;g++)for(let j=0;j<4;j++)for(const lap of [0,1,2,3,4])for(const base of ['black','white'])for(const mode of ['full','none'])for(const mbColors of ['tradicionals','contrast']){
  const C=mbColours(g,j,lap,{base,mbColors},{mode}),id=`${MB_TALLERS[g].sheets[j].id} ${lap} ${base} ${mode} ${mbColors}`;assert.ok(C.cols.length>=3&&C.cols.length<=5,id);assert.equal(C.rims.length,C.cols.length);
  for(const col of C.cols){assert.match(col,/^#[0-9a-f]{6}$/);const k=mbContrast(col,C.water);assert.ok(k>=(mbColors==='contrast'?4.5:base==='white'?3:2.2),`${id}: ${col} on ${C.water} ${k.toFixed(2)}`);}
  // the inks of one sheet are never alike (on light water too, where the light ones are darkened)
  for(let a=0;a<C.cols.length;a++)for(let b=a+1;b<C.cols.length;b++)assert.ok(dE(C.cols[a],C.cols[b])>=(mbColors==='contrast'?19:base==='white'?12:15),`${id}: ${C.cols[a]} and ${C.cols[b]} alike`);}
 for(const k of ['dark','light'])assert.equal(MB_CONTRAST[k].length,8);
});

// CIEDE2000 colour difference (Sharma, Wu & Dalal, 2005), from sRGB through CIELAB (D65)
function lab(h){const n=parseInt(h.slice(1),16),f=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);},r=f(n>>16&255),g=f(n>>8&255),b=f(n&255),X=(.4124564*r+.3575761*g+.1804375*b)/.95047,Y=.2126729*r+.7151522*g+.072175*b,Z=(.0193339*r+.119192*g+.9503041*b)/1.08883,c=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;return [116*c(Y)-16,500*(c(X)-c(Y)),200*(c(Y)-c(Z))];}
function de00([L1,a1,b1],[L2,a2,b2]){const d=Math.PI/180,C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cm=(C1+C2)/2,G=.5*(1-Math.sqrt(Cm**7/(Cm**7+25**7))),A1=(1+G)*a1,A2=(1+G)*a2,c1=Math.hypot(A1,b1),c2=Math.hypot(A2,b2),hh=(b,a)=>{if(!a&&!b)return 0;const x=Math.atan2(b,a)/d;return x<0?x+360:x;},h1=hh(b1,A1),h2=hh(b2,A2);
 let dh=0;if(c1*c2){dh=h2-h1;if(dh>180)dh-=360;else if(dh<-180)dh+=360;}const dH=2*Math.sqrt(c1*c2)*Math.sin(dh*d/2),Lm=(L1+L2)/2,cm=(c1+c2)/2;let hm=h1+h2;if(c1*c2)hm=Math.abs(h1-h2)<=180?(h1+h2)/2:(h1+h2+(h1+h2<360?360:-360))/2;
 const T=1-.17*Math.cos((hm-30)*d)+.24*Math.cos(2*hm*d)+.32*Math.cos((3*hm+6)*d)-.2*Math.cos((4*hm-63)*d),RC=2*Math.sqrt(cm**7/(cm**7+25**7)),SL=1+.015*(Lm-50)**2/Math.sqrt(20+(Lm-50)**2),SC=1+.045*cm,SH=1+.015*cm*T,RT=-Math.sin(2*30*Math.exp(-(((hm-275)/25)**2))*d)*RC;
 return Math.sqrt(((L2-L1)/SL)**2+((c2-c1)/SC)**2+(dH/SH)**2+RT*((c2-c1)/SC)*(dH/SH));}
const dE=(a,b)=>de00(lab(a),lab(b));
// how different two palettes look: for every ink of each, how far the nearest ink of the other is (mean of both ways)
const near=(P,Q)=>P.reduce((s,c)=>s+Math.min(...Q.map(d=>dE(c,d))),0)/P.length,palDist=(P,Q)=>(near(P,Q)+near(Q,P))/2;
// the pairs of sheets that can follow each other in play, whichever workshop comes first: within a workshop, and from the last sheet
// of one workshop to the first of the next on the same lap or on the next one
function neighbours(laps){const out=[];for(let lap=0;lap<laps;lap++)for(let g=0;g<5;g++){for(let j=0;j<3;j++)out.push([[g,j,lap],[g,j+1,lap]]);const g2=(g+1)%5;out.push([[g,3,lap],[g2,0,lap]]);if(lap+1<laps)out.push([[g,3,lap],[g2,0,lap+1]]);}return out;}

test('every sheet has colours of its own: forty palettes, no ink used twice, sheets that follow each other far apart in colour',()=>{
 // the CIEDE2000 of the published test data (Sharma, Wu & Dalal, 2005: pairs 1, 7 and 17)
 assert.ok(Math.abs(de00([50,2.6772,-79.7751],[50,0,-82.7485])-2.0425)<1e-4);assert.ok(Math.abs(de00([50,0,0],[50,-1,2])-2.3669)<1e-4);assert.ok(Math.abs(de00([50,2.5,0],[73,25,-18])-27.1492)<1e-4);
 const all=[];for(let lap=0;lap<2;lap++)for(let g=0;g<5;g++)for(let j=0;j<4;j++)all.push(mbPalette(g,j,lap));
 const inks=all.flatMap(p=>p.inks);assert.equal(new Set(inks).size,inks.length,'an ink used twice');
 for(let a=0;a<40;a++)for(let b=a+1;b<40;b++)assert.ok(palDist(all[a].inks,all[b].inks)>=9,`palettes ${a} and ${b} alike`);
 for(const [A,B] of neighbours(2)){const P=mbPalette(...A).inks,Q=mbPalette(...B).inks;assert.ok(palDist(P,Q)>=18,`${A} → ${B}: ${palDist(P,Q).toFixed(1)}`);assert.ok(dE(P[0],Q[0])>=25,`${A} → ${B}: first colours ${dE(P[0],Q[0]).toFixed(1)}`);}
 // from the third lap on the palettes are turned round the hue circle: still new, still far from their neighbours
 assert.equal(mbTurn('#2f56d0',0),'#2f56d0');
 for(const [A,B] of neighbours(6))if(B[2]>=2){const P=mbPalette(...A).inks,Q=mbPalette(...B).inks;assert.ok(palDist(P,Q)>=15,`${A} → ${B}`);assert.ok(dE(P[0],Q[0])>=20,`${A} → ${B}: first colours`);}
 for(let g=0;g<5;g++)for(let j=0;j<4;j++)for(let l1=0;l1<6;l1++)for(let l2=l1+1;l2<6;l2++)assert.ok(palDist(mbPalette(g,j,l1).inks,mbPalette(g,j,l2).inks)>=10,`${g} ${j}: lap ${l1} and ${l2} alike`);
 // the high-contrast sets: four different colours, never the two closest together, at most two shared with a sheet next to it
 // (nearly always one) and a first colour of their own
 for(let lap=0;lap<6;lap++)for(let g=0;g<5;g++)for(let j=0;j<4;j++){const S=mbContrastSet(g,j,lap);assert.equal(new Set(S).size,4);assert.ok(!(S.includes(3)&&S.includes(6)));}
 let one=0,pairs=0;for(const [A,B] of neighbours(6)){const S=mbContrastSet(...A),Q=mbContrastSet(...B),sh=S.filter(c=>Q.includes(c)).length;assert.ok(sh<=2,`${A} → ${B}`);assert.ok(!S.includes(Q[0])||!Q.includes(S[0]),`${A} → ${B}: first colours`);pairs++;if(sh<=1)one++;}
 assert.ok(one/pairs>.8,`most neighbours share at most one colour (${one} of ${pairs})`);
});

test('the sounds of the workshop are recordings of the banks: drops, brush, paper, pegs and the skimming of the bath',()=>{
 for(const T of MB_TALLERS){const s={...S,mbFirst:T.id,mbSteps:5},game={};mbStart(game,s);const F=game.marbre,fx=new Set();
  for(let k=0;k<5;k++){mbPress(game,s);for(const e of F.events)if(e.fx)fx.add(e.bank+'/'+e.name);toRest(game,s);}
  for(const z of fx){const [b,n]=z.split('/');assert.ok(hasZone(b,n),z);}assert.ok(fx.size>=5,[...fx].join(' '));}
});

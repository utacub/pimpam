// 0.27: La cassola d'en Glups (EN23), rebuilt in ancient Greece. Two turns of scanning: a magic ingredient (a feather, heads of garlic
// or a loaf of bread), which Glups tries at once, and an animal biscuit of honey from the ones that go with it. When he tastes the soup
// he becomes one of eleven mythical creatures of the Greeks, with its own comic scene and its own music, and a hiccup brings him back.
// The same recipe always gives the same creature. «Un ingredient sorpresa» shows one option per turn and a third press, on the ladle.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {GP_MAGICS,GP_ANIMALS,GP_TREE,GP_CREATURES,GP_LADLE,GP_DAYS,GP_STEP,GP_SHOW,GP_T,GP_BANDS,GP_CUES,gpCreature,gpSurprise,gpStageCount,gpOptions,gpItem,gpRecipe,gpPiece,gpScore,gpStep,gpStepScore,gpTaste} from '../dist/cassola.js';
import {myScene,MY_DUR} from '../dist/cassola-mites.js';
import {GR_INK} from '../dist/grec-art.js';
import {SCAN_ACTIVITIES,createScanState,scanContent,scanChoices,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {defaults,validateProfile} from '../dist/input.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
const DECORS=[{background:'full'},{background:'dim',opacity:30},{background:'none'},{background:'none',base:'white'},{background:'dim',base:'white',opacity:40}];
const base={...defaults},item=SCAN_ACTIVITIES.find(x=>x.id==='pot');
const RECIPES=GP_MAGICS.flatMap(m=>GP_TREE[m.id].map(animal=>({magic:m.id,animal})));

test('La cassola is EN23 of the scanning catalogue: a magic ingredient and a biscuit, eleven creatures, recorded music',()=>{
 assert.ok(item);assert.equal(item.code,'EN23');assert.equal(item.task,'creative');assert.equal(item.recorded,true);
 assert.deepEqual(GP_MAGICS.map(x=>x.id),['feather','garlic','bread']);assert.equal(GP_ANIMALS.length,6);
 const ids=[...GP_MAGICS,...GP_ANIMALS].map(x=>x.id);assert.equal(new Set([...ids,GP_LADLE.id]).size,10);
 for(const x of [...GP_MAGICS,...GP_ANIMALS,GP_LADLE])assert.equal(gpItem(x.id),x);
 // every magic ingredient and biscuit of the tree makes a creature, and every creature is made by one recipe
 assert.equal(RECIPES.length,11);assert.equal(GP_CREATURES.length,11);assert.equal(new Set(GP_CREATURES.map(x=>x.id)).size,11);
 for(const r of RECIPES){const cr=gpCreature(r.magic,r.animal);assert.ok(cr,JSON.stringify(r));assert.ok(GP_ANIMALS.some(a=>a.id===r.animal));}
 for(const cr of GP_CREATURES){assert.ok(GP_TREE[cr.magic].includes(cr.animal),cr.id);assert.ok(GP_CUES[cr.id],cr.id);}
 assert.equal(GP_DAYS.length,4);assert.equal(defaults.potPick,'choose');assert.equal(validateProfile({...defaults,potPick:'one'}).potPick,'one');assert.throws(()=>validateProfile({...defaults,potPick:'all'}));});

test('La cassola: first the magic ingredients, then the biscuits that go with the one chosen; every option comes in its turn',()=>{
 for(const n of [2,3,4]){const m=Math.min(3,n);assert.equal(gpOptions(0,n,0).length,m);
  const seen=new Set();for(let round=0;round<6;round++)gpOptions(0,n,round).forEach(id=>seen.add(id));assert.equal(seen.size,3,`${n}: all the magic ingredients`);
  for(const magic of Object.keys(GP_TREE)){const list=GP_TREE[magic],k=Math.min(Math.max(2,n),list.length),b=new Set();
   for(let round=0;round<8;round++){const o=gpOptions(1,n,round,'choose',[magic]);assert.equal(o.length,k);for(const id of o){assert.ok(list.includes(id),`${magic}: ${id}`);b.add(id);}}
   assert.equal(b.size,list.length,`${magic}: every biscuit comes`);}}
 for(const scanOptions of [2,3,4]){const s={...base,scanOptions},state=createScanState('pot',s);
  for(let stage=0;stage<2;stage++){assert.equal(state.stage,stage);const options=scanContent(state,s);
   assert.deepEqual(options.map(x=>x.value),gpOptions(stage,scanOptions,0,'choose',state.picks));for(const x of options)assert.ok(x.label&&/^\S/.test(x.label));
   const r=chooseScan(state,s,options.length-1);assert.equal(r.accepted,true);assert.equal(r.action,'effect');assert.equal(r.duration,stage===1?GP_SHOW:GP_STEP);finishScan(state,s);}
  assert.equal(state.round,1);assert.equal(state.stage,0);}});

test('La cassola with «Un ingredient sorpresa»: one option per turn, a different one each round, and the third press is the ladle',()=>{
 assert.equal(gpStageCount('one'),3);assert.equal(gpStageCount('choose'),2);
 for(let round=0;round<200;round++){const [m]=gpOptions(0,4,round,'one');assert.ok(GP_TREE[m]);if(round)assert.notEqual(m,gpOptions(0,4,round-1,'one')[0],`${round}`);
  const [a]=gpOptions(1,4,round,'one',[m]);assert.ok(GP_TREE[m].includes(a),`${m}: ${a}`);}
 const seen=new Set();for(let round=0;round<12;round++)seen.add(gpOptions(0,4,round,'one')[0]);assert.equal(seen.size,3,'every magic ingredient comes up');
 assert.deepEqual(gpOptions(2,4,5,'one',['garlic','dog']),['ladle']);
 const s={...base,potPick:'one'},state=createScanState('pot',s);
 for(let stage=0;stage<3;stage++){const options=scanContent(state,s);assert.equal(options.length,1);assert.equal(scanChoices(state,s).length,1);
  const r=chooseScan(state,s,0);assert.equal(r.duration,stage===2?GP_SHOW:GP_STEP,`${stage}`);finishScan(state,s);}
 assert.equal(state.round,1);});

test('La cassola: the same recipe always gives the same creature and the same music, and every creature its own',()=>{
 const scores=new Set();
 for(const r of RECIPES){const rec=gpRecipe([r.magic,{value:r.animal}]);assert.equal(rec.creature,gpCreature(r.magic,r.animal));
  const a=JSON.stringify(gpScore(rec));assert.equal(JSON.stringify(gpScore(gpRecipe([r.magic,r.animal]))),a);scores.add(a);}
 assert.equal(scores.size,11);
 assert.deepEqual(gpRecipe(['bread','snake','ladle']).creature.id,'medusa');assert.equal(gpRecipe(['garlic']).creature,null);assert.deepEqual(gpRecipe([]),{magic:null,animal:null,creature:null});});

test('La cassola: the moments of the show are in order, and the scene of the creature lasts as long as its drawing',()=>{
 const T=GP_T,order=['fly','glow','lift','sip','slurp','wow','swirl','poof','cross','scene','sceneEnd','back','home','cadence','rest'];
 for(let i=1;i<order.length;i++)assert.ok(T[order[i]]>=T[order[i-1]],order[i]);
 assert.ok(T.rest<GP_SHOW);assert.ok(Math.abs(T.sceneEnd-T.scene-MY_DUR)<1e-9);assert.ok(T.tryIn>T.fly&&T.tryOut<GP_STEP);});

test('La cassola: every sound is a recorded instrument or its own file, nothing is held, and the show ends in time on plucked and struck notes',()=>{
 const named=new Set();
 const check=(score,D,what)=>{for(const e of score){const b=SAMPLE_BANK[e.inst];assert.ok(b,`${what}: ${e.inst}`);assert.ok(e.at>=0&&e.at<1,`${what}: ${e.inst} at ${e.at}`);
   if(e.variant){assert.ok(b.zones.some(z=>z[9]===e.variant),`${what}: ${e.inst} ${e.variant}`);named.add(e.inst+'/'+e.variant);}
   assert.ok(e.vel>0&&e.vel<=1,`${what}: ${e.inst} ${e.vel}`);for(const m of e.midi)assert.ok(Number.isFinite(m));
   if(b.sustain)assert.ok(e.length*D<=(e.inst==='natureRec'?2.6:1)+1e-9,`${what}: ${e.inst} held ${(e.length*D).toFixed(2)} s`);
   assert.ok((e.at+e.length)*D<=GP_SHOW+1e-6,`${what}: ${e.inst} rings past the end`);}};
 for(const r of RECIPES){const rec=gpRecipe([r.magic,r.animal]);for(const ladle of [false,true]){const sc=gpScore(rec,ladle);check(sc,GP_SHOW,rec.creature.id);
   const toon=new Set(sc.filter(e=>e.inst==='toonRec').map(e=>e.variant));for(const v of ['slurp','poof','hiccup'])assert.ok(toon.has(v),v);
   assert.ok(sc.some(e=>e.inst==='toonRec'&&e.variant==='plop'&&e.at*GP_SHOW<1)!==ladle,'the plop, or the ladle');}
  // the scene has its own sounds, between the change and the hiccup; the last notes are plucked or struck
  const notes=gpPiece(rec),inScene=notes.filter(n=>n.t>=GP_T.scene&&n.t<GP_T.sceneEnd);assert.ok(inScene.length>=12,rec.creature.id);
  const last=notes.filter(n=>n.t>=GP_T.cadence);assert.ok(last.length>=3);for(const n of last)assert.equal(SAMPLE_BANK[n.inst].sustain,false,`${rec.creature.id}: ${n.inst}`);
  assert.ok(notes.every(n=>n.t+n.len<=GP_SHOW),rec.creature.id);}
 for(const f of [...named].map(x=>x.split('/'))){const z=SAMPLE_BANK[f[0]].zones.find(x=>x[9]===f[1]);assert.ok(existsSync(new URL('../dist/assets/samples/'+z[0],import.meta.url)),z[0]);}
 for(const magic of Object.keys(GP_TREE)){const sc=gpStepScore(0,magic,[]);check(sc,GP_STEP,`step ${magic}`);assert.ok(sc.some(e=>e.inst==='toonRec'&&e.variant==='plop'));
  assert.ok(gpStep(0,magic,[]).some(n=>n.t>=GP_T.tryIn&&n.t<GP_T.tryOut),`${magic}: Glups tries it`);
  for(const animal of GP_TREE[magic]){const st=gpStepScore(1,animal,[magic]);check(st,GP_STEP,`step ${animal}`);assert.ok(gpStep(1,animal,[magic]).every(n=>n.t+n.len<=GP_STEP+.2));}}});

test('La cassola: the taste of an option in the focus is short and on the band of the magic ingredient',()=>{
 const inst=notes=>new Set(notes.map(n=>n.inst));
 for(const m of GP_MAGICS){const notes=gpTaste(0,m.id,[]);assert.ok(inst(notes).has(GP_BANDS[m.id].lead),m.id);
  for(const animal of GP_TREE[m.id]){const a=gpTaste(1,animal,[m.id]);assert.ok(a.length>=2,animal);const end=Math.max(...a.map(n=>n.t+n.len));assert.ok(end<=1.6,`${animal}: ${end}`);}
  const l=gpTaste(2,'ladle',[m.id,GP_TREE[m.id][0]]);assert.equal(l.length,3);}
 for(const n of gpTaste(0,'garlic',[]))assert.ok(n.t>=0&&n.t+n.len<=1.6);});

test('La cassola: every creature has its scene, drawn with finite coordinates on every screen, in every decor and in «Moviment reduït»',()=>{
 for(const cr of GP_CREATURES)for(const [w,h] of [[1280,720],[720,1280],[1024,768]])for(const decor of [DECORS[0],DECORS[2],DECORS[4]])for(const still of [false,true])
  for(const u of [0,.6,1.5,2.4,3.3,4.2,5.1,6,6.9,7.8,8.7,9.5]){const c=ctx(),a=myScene(c,w,h,cr.id,u,{still,t:u,H:h,decor:{fade:decor.background==='none'?0:1,base:decor.base==='white'?'#fff':'#000'}});
   assert.ok(a&&[a.x,a.y,a.r].every(Number.isFinite),`${cr.id} ${u}`);assert.ok(c.calls.length>100,`${cr.id} ${u}`);}});

test('La cassola draws with finite coordinates in every decor, on every screen, in both modes, at rest, at each choice and through the show',()=>{
 for(const decor of DECORS)for(const [w,h] of [[1280,720],[1024,768],[400,700]])for(const potPick of ['choose','one'])for(const reduced of [false,true]){
  const s={...base,...decor,potPick,reduced,scanOptions:potPick==='one'?3:(w===400?2:4)},state=createScanState('pot',s);let n=0;
  while(state.round===0&&n++<6){const c=ctx();renderScanActivity(c,w,h,'pot',{item,scanState:state,time:null,duration:5.5,parts:[]},s);assert.ok(c.calls.length>50);
   const r=chooseScan(state,s,scanContent(state,s).length-1);for(const t of r.duration===GP_SHOW?[0,.4,1,1.8,2.3,2.9,3.3,3.8,5,7,9.5,11.8,13.25,13.6,14.2,15.5]:[0,.5,1.2,1.8,2.4,3])
    renderScanActivity(ctx(),w,h,'pot',{item,scanState:state,time:t,duration:r.duration,parts:[]},s);finishScan(state,s);}
  assert.equal(state.round,1);}
 // the card of the home page
 const card=ctx();assert.equal(renderScanActivity(card,320,180,'pot',{item},{...base},true),true);assert.ok(card.calls.length>50);});

test('La cassola keeps dark outlines in every decor',()=>{
 for(const decor of DECORS){const strokes=new Set(),c=ctx(),proxy=new Proxy(c,{set(o,k,v){if(k==='strokeStyle')strokes.add(v);o[k]=v;return true;},get(o,k){const v=o[k];return typeof v==='function'?v.bind(o):v;}});
  const s={...base,...decor},state=createScanState('pot',s);renderScanActivity(proxy,1280,720,'pot',{item,scanState:state,time:null,duration:5.5,parts:[]},s);
  assert.ok(strokes.has(GR_INK),`${JSON.stringify(decor)}: dark outlines`);}});

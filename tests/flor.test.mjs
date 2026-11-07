// La nova Flor de paper (CE02, 0.51): the twenty real flowers in five gardens, the presses, the light that spreads, the visitors,
// the music (recorded instruments, every note ends) and the sounds of the collection's banks.
import test from 'node:test';import assert from 'node:assert/strict';
import {FP_CAUSE,FP_ORDER,FP_ALL,FP_OPEN,FP_FINALE,FP_CHANGE,fpStart,fpPress,fpTick,fpBlocked,fpBloom,fpLayout,fpStatus,fpProgress,FP_LAYERS,fpBar,fpBarLen,fpMotif,fpShimmer,fpCadence,fpGreeting,FP_VOICE} from '../dist/flor.js';
import {FP_SPECIES,FP_GARDENS} from '../dist/flor-especies.js';
import {FP_CREATURES} from '../dist/flor-escena.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {escRange} from '../dist/escenari.js';
const S={flMode:'jardi',flCount:4,flOpen:'mitjana',flFirst:'prat',flTint:'mig',flCreatures:true,flNature:true,lock:true,sound:true,waitCue:true};
const run=(game,s,sec,dt=1/30)=>{for(let t=0;t<sec;t+=dt)fpTick(game,s,dt);};
const hasZone=(bank,name)=>!!SAMPLE_BANK[bank]?.zones.some(z=>z[9]===name);

test('the card: CE02 keeps its id, a cause-effect activity with recorded sounds',()=>{assert.equal(FP_CAUSE.id,'flower');assert.equal(FP_CAUSE.code,'CE02');assert.equal(FP_CAUSE.type,'ce');assert.ok(FP_CAUSE.flor&&FP_CAUSE.recorded);});

test('twenty real species, four in each of the five gardens, each with its paper, light, colours and a visitor that is drawn and heard (or silent)',()=>{
 assert.equal(FP_GARDENS.length,5);assert.equal(FP_ORDER.length,5);assert.equal(new Set(FP_ALL).size,20);
 for(const row of FP_ORDER)assert.equal(row.length,4);
 for(const id of FP_ALL){const sp=FP_SPECIES[id];assert.ok(sp,id);assert.ok(sp.name&&sp.name.length>2,id);assert.match(sp.light||'',/^#|^rgb/,id+' light');assert.ok(Array.isArray(sp.pool)&&sp.pool.length>=2,id+' pool');
  assert.ok(sp.creature,id+' creature');assert.equal(typeof FP_CREATURES[sp.creature],'function',sp.creature);assert.ok(sp.creature in FP_VOICE,sp.creature+' voice');}
 assert.equal(new Set(FP_ALL.map(id=>FP_SPECIES[id].name)).size,20,'twenty different names');});

test('a garden: four presses open the four flowers, a fifth plays the finale, then the garden folds and the next one comes',()=>{const game={};fpStart(game,S);const F=game.flor;assert.equal(F.g,0);
 for(let k=0;k<4;k++){assert.ok(!fpBlocked(game,S),`free before flower ${k}`);assert.ok(fpPress(game,S));assert.equal(game.count,k+1);assert.ok(fpBlocked(game,S),'the opening keeps the turn');assert.ok(!fpPress(game,S),'a press while it opens does nothing');run(game,S,FP_OPEN.mitjana+.1);assert.equal(F.phase,'rest');}
 assert.equal(game.completed,4);assert.ok(fpStatus(game,S).length>0);assert.match(fpProgress(game,S),/class="done"/);
 assert.ok(fpPress(game,S));assert.equal(F.phase,'finale');assert.ok(fpBlocked(game,S));run(game,S,FP_FINALE+.1);assert.equal(F.phase,'change');run(game,S,FP_CHANGE+.1);
 assert.equal(F.phase,'rest');assert.equal(F.g,1);assert.equal(game.count,0);assert.deepEqual(F.opened,[null,null,null,null]);
 for(let g=1;g<5;g++){for(let k=0;k<5;k++){fpPress(game,S);run(game,S,FP_OPEN.mitjana+.1);}run(game,S,FP_FINALE+FP_CHANGE);}
 assert.equal(F.g,0);assert.equal(F.lap,1,'after the fifth garden the meadow comes back, mirrored');});

test('without the lock a press during an opening finishes it at once and opens the next flower',()=>{const U={...S,lock:false},game={};fpStart(game,U);fpPress(game,U);run(game,U,1);assert.ok(!fpBlocked(game,U));
 assert.ok(fpPress(game,U));assert.equal(game.count,2);assert.equal(fpBloom(game.flor,0,U).p,1,'the first flower is open');});

test('two or three flowers a garden, and the garden it starts in',()=>{for(const n of [2,3]){const game={};fpStart(game,{...S,flCount:n,flFirst:'nit'});assert.equal(game.flor.g,3);assert.equal(fpLayout(game.flor,S,1600,900).flowers.length,n);
 for(let k=0;k<n;k++){fpPress(game,S);run(game,S,FP_OPEN.mitjana+.1);}fpPress(game,S);assert.equal(game.flor.phase,'finale');}});

test('the light spreads slowly: from the first glow to the full colour takes seconds, and never jumps',()=>{for(const flOpen of Object.keys(FP_OPEN)){const s={...S,flOpen},game={};fpStart(game,s);fpPress(game,s);
 let first=-1,full=-1,prev=0,t=0;for(;t<FP_OPEN[flOpen]+1;t+=1/30){fpTick(game,s,1/30);const b=fpBloom(game.flor,0,s);if(first<0&&b.tint>0)first=t;if(full<0&&b.tint>=.999)full=t;assert.ok(b.tint-prev<.02,`${flOpen}: step ${b.tint-prev}`);prev=b.tint;}
 assert.ok(first>0&&full-first>=3.5,`${flOpen}: ${first} → ${full}`);}});

test('one flower at a time: twenty presses show the twenty species in order, then they start again',()=>{const s={...S,flMode:'una'},game={};fpStart(game,s);const seen=[];
 for(let i=0;i<21;i++){fpPress(game,s);run(game,s,FP_OPEN.mitjana+.8);const L=fpLayout(game.flor,s,1600,900);seen.push(L.flowers[L.flowers.length-1].id);}
 assert.deepEqual(seen.slice(0,20),FP_ALL);assert.equal(seen[20],FP_ALL[0]);assert.equal(game.flor.lap,1);});

test('the layout has numbers everywhere (no NaN) in every garden, phase and size',()=>{const game={};fpStart(game,S);const check=()=>{for(const [w,h] of [[1600,900],[900,1600],[488,273]]){const L=fpLayout(game.flor,S,w,h);
  for(const f of L.flowers)for(const k of ['x','y','R','p','tint','visit','alpha','fold'])assert.ok(Number.isFinite(f[k]),`${f.id} ${k}`);}};
 for(let g=0;g<5;g++){check();for(let k=0;k<5;k++){fpPress(game,S);run(game,S,2);check();run(game,S,FP_OPEN.mitjana);}run(game,S,FP_FINALE-.5);check();run(game,S,1);check();run(game,S,FP_CHANGE);}});

const ok=new Set(Object.keys(SAMPLE_BANK));
const within=(e,label)=>{assert.ok(ok.has(e.inst),label+' '+e.inst);const [lo,hi]=escRange(e.inst);for(const m of e.midi)assert.ok(m>=lo&&m<=hi,`${label} ${e.inst} ${m} not in ${lo}–${hi}`);assert.ok(e.vel>0&&e.vel<=1,label+' vel');assert.ok(e.len>0&&e.t>=0,label+' time');};
test('the music: recorded instruments only, every note within its instrument and inside its bar, no organ, pad or choir',()=>{
 for(const G of FP_GARDENS){const L=FP_LAYERS[G.id];assert.equal(L.length,4,G.id);for(const Ly of L){assert.ok(ok.has(Ly.inst),Ly.inst);assert.doesNotMatch(Ly.inst,/organ|pad|choir|drone/i);}
  const bar=fpBarLen(G);for(let n=0;n<16;n++)for(const full of [false,true])for(const layers of [[0],[0,1],[0,1,2],[0,1,2,3]]){for(const e of fpBar(G,n,layers,{k:1,full}))
   {within(e,`${G.id} bar ${n}`);assert.ok(e.t<bar-1e-6,`${G.id} bar ${n}: starts at ${e.t} of ${bar}`);}}}});
test('each opening has its own rising phrase, timed with the petals; the shimmer, the greeting and the cadence stay in range',()=>{
 for(const G of FP_GARDENS)for(let k=0;k<4;k++)for(const D of Object.values(FP_OPEN)){const m=fpMotif(G,k,D);assert.ok(m.length>=4,`${G.id} ${k}`);m.forEach(e=>within(e,`${G.id} motif ${k}`));
  for(let i=1;i<m.length;i++){assert.ok(m[i].midi[0]>m[i-1].midi[0],`${G.id} motif ${k} rises`);assert.ok(m[i].t>m[i-1].t);}assert.ok(m[0].t>=.1*D&&m[m.length-1].t<=.7*D,`${G.id} ${k} with the petals`);
  for(const e of fpShimmer(G,k))within(e,`${G.id} shimmer`);}
 for(const G of FP_GARDENS){for(const e of fpGreeting(G))within(e,G.id+' greeting');const cad=fpCadence(G);for(const e of cad)within(e,G.id+' cadence');
  const struck=['harpRec','dsArpa','celliPizzRec','glockRec','kalimbaRec','marimbaRec','vibRec','dsPiano'];assert.ok(cad.every(e=>struck.includes(e.inst)),'the cadence is plucked and struck: it rings away');}});

test('the sounds: every garden air, paper and visitor voice is a recording of the collection',()=>{
 for(const G of FP_GARDENS)for(const [bank,name,level] of G.amb){assert.ok(hasZone(bank,name),`${G.id} ${bank} ${name}`);assert.ok(level>0&&level<1);}
 for(const name of ['paperDesplega','paperLlisca','paperAles'])assert.ok(hasZone('sabanaRec',name),name);
 for(const [k,V] of Object.entries(FP_VOICE)){if(!V)continue;assert.ok(hasZone(V[0],V[1]),`${k}: ${V[0]} ${V[1]}`);assert.ok(V[3]>=.5&&V[3]<=1.6,k+' rate');}});

test('the model works without a document (no drawing at import)',()=>{assert.equal(typeof globalThis.document,'undefined');});

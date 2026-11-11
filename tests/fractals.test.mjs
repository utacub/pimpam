import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {FR_CAUSE,FR_STIMS,FR_IDS,FR_MUSIC,FR_GROW,FR_SPAN,FR_RUN,FR_HOLD,FR_BACK,FR_BLACK,FR_AMB,FR_ACC,frGrowK,frStart,frPress,frTick,frBlocked,frRate,frStatus,frProgress,frHelp,frNumber,frEvents,frStim} from '../dist/fractals.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {SYNTH_INSTRUMENTS} from '../dist/synth.js';
import {defaults,validateProfile} from '../dist/input.js';

// Fractals a la natura (CE46, 0.74): twenty fractal forms of nature drawn with lines of coloured light on black; each press grows one
// whole form, level by level, with its music, the sound of its place and the accents of its growth; then (0.74.2) the growth plays
// backwards until the screen is black again, and the next form starts on black.
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const S={...defaults,lock:true,waitCue:true,sound:true};
const run=(g,s,secs)=>{for(let t=0;t<secs;t+=1/30)frTick(g,s,1/30);};

test('the activity: CE46, recorded, black, twenty forms with names, words for the screen reader and growth notes',()=>{
 assert.equal(FR_CAUSE.id,'fractals');assert.equal(FR_CAUSE.code,'CE46');assert.equal(FR_CAUSE.type,'ce');assert.equal(FR_CAUSE.fractals,true);assert.equal(FR_CAUSE.recorded,true);
 assert.equal(FR_STIMS.length,20);assert.equal(new Set(FR_IDS).size,20);assert.deepEqual(FR_IDS,FR_STIMS.map(x=>x.id));
 for(const M of FR_STIMS){assert.ok(M.name&&M.what,M.id);assert.ok(Array.isArray(M.acts)&&M.acts.length>=1,M.id);assert.ok(Array.isArray(M.pal)&&M.pal.length>=3,M.id);
  // the words of the growth are a whole clause (its own verb), so that «Nom, forma n de 20: …» reads well in every language
  assert.match(M.what,/^(creix|creixen|baixen|es dibuixen|s’obren|s’aixequen) /,M.id);}
});

test('the settings: the first form (any of the twenty) and the growth (fast, normal, slow), validated',()=>{
 assert.equal(defaults.frFirst,'falgueres');assert.equal(defaults.frGrow,'normal');
 for(const id of FR_IDS)assert.equal(validateProfile({...defaults,frFirst:id}).frFirst,id);
 for(const k of Object.keys(FR_GROW))assert.equal(validateProfile({...defaults,frGrow:k}).frGrow,k);
 assert.throws(()=>validateProfile({...defaults,frFirst:'mel'}));assert.throws(()=>validateProfile({...defaults,frGrow:'molt'}));
 assert.ok(FR_GROW.rapid<FR_GROW.normal&&FR_GROW.normal<FR_GROW.lent);
});

test('the arc: a press grows one whole form, a wave runs through it, it comes undone backwards to black; presses do nothing meanwhile; after twenty the first comes back in its second lap',()=>{
 const g={};frStart(g,S);const F=g.fractals;assert.equal(F.phase,'rest');assert.equal(F.S,null);
 assert.match(frStatus(g,S),/La pantalla és negra/);assert.equal((frProgress(g,S).match(/class="done"/g)||[]).length,0);
 for(let k=0;k<20;k++){const M=FR_STIMS[k],head=`${M.name}, forma ${k+1} de 20`;
  assert.ok(frPress(g,S),`press ${k+1}`);assert.equal(frStim(F).id,FR_IDS[k]);assert.equal(frNumber(F),k+1);assert.equal(F.phase,'run');
  assert.ok(F.end-F.at>=FR_RUN,'the shortest run');assert.ok(F.S.full-F.S.t<=12.5,`${M.id}: the form is whole within 12 s`);
  assert.ok(F.at<F.fullAt&&F.fullAt+FR_HOLD<=F.backAt+1e-9&&F.backAt<F.end,M.id);
  assert.ok(F.backDur>=FR_BACK[0]&&F.backDur<=FR_BACK[1],`${M.id}: ${F.backDur}`);assert.ok(Math.abs(F.end-F.backAt-F.backDur-FR_BLACK)<1e-9,M.id);
  assert.ok(frBlocked(g,S));assert.equal(frPress(g,S),false,'no press while it grows');assert.equal(frStatus(g,S),`${head}: ${M.what}.`);
  run(g,S,F.fullAt-F.t+.05);assert.equal(F.phase,'full');assert.ok(frBlocked(g,S));assert.equal(frPress(g,S),false,'no press while the wave runs');
  assert.equal(frStatus(g,S),`${head}, completa: una ona de llum la recorre.`);
  run(g,S,F.backAt-F.t+.05);assert.equal(F.phase,'back');assert.ok(F.S.back,'the way back');assert.ok(frBlocked(g,S));assert.equal(frPress(g,S),false,'no press on the way back');
  assert.equal(frStatus(g,S),`${head}: la forma es desfà al revés de com ha crescut.`);
  run(g,S,F.end-F.t+.1);assert.equal(F.phase,'rest');assert.ok(!frBlocked(g,S));
  assert.equal(frStatus(g,S),`${head}, acabada. La pantalla és negra i la pulsació següent en porta una altra.`);
  assert.equal((frProgress(g,S).match(/class="done"/g)||[]).length,k+1);}
 assert.equal(F.lap,0);frPress(g,S);assert.equal(F.lap,1);assert.equal(frStim(F).id,FR_IDS[0]);assert.equal(frNumber(F),1);assert.equal(F.old,null,'the form before is already gone');
});

test('the slower growth (0.74.2): every form takes about two seconds more than in 0.74 (one, two and a half with «Ràpid» and «Lent»)',()=>{
 for(const [grow,plus] of [['rapid',1],['normal',2],['lent',3.5]])for(const id of FR_IDS){const s={...S,frFirst:id,frGrow:grow},g={};frStart(g,s);frPress(g,s);const F=g.fractals;
  assert.ok(Math.abs(frGrowK(s,id)*FR_SPAN[id]-FR_SPAN[id]-plus)<1e-9,id);const took=F.fullAt-F.at;
  assert.ok(took>=FR_SPAN[id]+plus-.02&&took<=FR_SPAN[id]+plus+.5,`${grow} ${id}: ${took.toFixed(2)} s for ${FR_SPAN[id]}+${plus}`);}
});

test('the way back: the growth plays backwards (its events reversed, softer, without accents), a falling phrase, the place fades, then black',()=>{
 for(const id of FR_IDS){const s={...S,frFirst:id},g={};frStart(g,s);const F=g.fractals;frPress(g,s);F.cues.length=0;
  run(g,s,F.backAt-F.t-.02);for(;F.t<F.backAt+.1;){frTick(g,s,1/30);frEvents(F,()=>{},()=>{});}assert.equal(F.phase,'back');assert.ok(F.cues.includes('back'),id);
  const B=F.S.back;assert.ok(B.v>0&&B.end>B.at&&B.from>0,id);const phrase=F.notes.filter(n=>n.at>=F.backAt);assert.ok(phrase.length>=3,`${id}: ${phrase.length} notes of the phrase`);
  assert.ok(Math.max(...phrase.map(n=>n.at))<=F.end+1.5,`${id}: the phrase ends with the form`);
  const notes=[],accents=[];while(F.phase==='back'){frTick(g,s,1/30);frEvents(F,e=>notes.push(e),f=>accents.push(f));}
  assert.ok(notes.length>=1,`${id}: the reversed growth sounds`);assert.equal(accents.length,0,`${id}: no accents on the way back`);
  for(const e of notes)assert.ok(e.vel>0&&e.vel<=.21,id);assert.ok(F.cues.includes('black'),id);}
});

test('the first form can be any; «Espera que acabi cada efecte» off lets a press bring the next form at once',()=>{
 const g={},s={...S,frFirst:'nautilus',lock:false};frStart(g,s);const F=g.fractals;frPress(g,s);assert.equal(frStim(F).id,'nautilus');assert.equal(frNumber(F),1);
 run(g,s,1);assert.ok(!frBlocked(g,s));assert.ok(frPress(g,s));assert.equal(frStim(F).id,'miceli');assert.ok(F.old,'the form before goes out');
 assert.match(frHelp(S),/Mentre una forma creix i es desfà, les pulsacions no fan res/);assert.match(frHelp(S),/es desfà al revés de com ha crescut, fins que la pantalla torna a ser negra/);assert.match(frHelp(s),/Pots prémer mentre una forma creix/);
});

test('the wait: once a form is whole its time slows down to a drift (15 %), never to a stop; without «Senyal de torn» it keeps its pace',()=>{
 const g={};frStart(g,S);const F=g.fractals;frPress(g,S);assert.equal(frRate(F,S),1);run(g,S,F.end-F.t+4);assert.equal(F.phase,'rest');
 assert.ok(Math.abs(frRate(F,S)-.15)<1e-9,String(frRate(F,S)));assert.equal(frRate(F,{...S,waitCue:false}),1);
});

test('the growth: every form gives growth events over its first seconds, each played as a note of the chord or an accent of its own',()=>{
 for(const id of FR_IDS){const g={},s={...S,frFirst:id};frStart(g,s);const F=g.fractals;frPress(g,s);const notes=[],accents=[];
  for(let t=0;t<9;t+=1/30){frTick(g,s,1/30);frEvents(F,e=>notes.push(e),f=>accents.push(f));}
  assert.ok(notes.length>=3,`${id}: ${notes.length} notes`);assert.ok(accents.length>=1,`${id}: ${accents.length} accents`);
  for(const e of notes){assert.ok(e.midi.every(m=>m>=24&&m<=108),id);assert.ok(e.vel>0&&e.vel<=.3,id);}}
});

test('the music and the sound: every form has its key, metre and plucked or struck instruments, a place and accents that exist',()=>{
 const bank=SAMPLE_BANK.fractalsRec,names=new Set(bank.zones.map(z=>z[9]));assert.equal(bank.fallback,null);assert.equal(bank.strict,true);assert.equal(bank.pitched,false);
 assert.equal(bank.zones.length,40);assert.equal(names.size,40);
 const known=x=>SYNTH_INSTRUMENTS.includes(x)||!!SAMPLE_BANK[x];
 for(const id of FR_IDS){const U=FR_MUSIC[id];assert.ok(U,id);
  for(const k of ['lead','mid','bass','spark'])assert.ok(known(U[k]),`${id}: ${k} ${U[k]}`);
  assert.ok(['lydian','major','dorian','mixo','minor'].includes(U.mode),id);assert.ok(['34','68','44'].includes(U.meter),id);
  for(const [type,n] of Object.entries(U.ev)){assert.ok(['tronc','branca','fulla'].includes(type),id);assert.ok(known(n[0]),`${id}: ${n[0]}`);}
  assert.deepEqual(U.amb,['fractalsRec',id+'Amb',FR_AMB]);
  for(const f of Object.values(U.fx)){assert.equal(f[0],'fractalsRec');assert.equal(f[1],id+'Acc');assert.ok(f[2]>=FR_ACC&&f[2]<=FR_ACC*1.4+1e-9,id);assert.ok(f[3]>=.5,id);}
  assert.ok(names.has(id+'Amb')&&names.has(id+'Acc'),id);}
 const root=new URL('../dist/assets/samples/',import.meta.url),credits=read('../dist/assets/samples/CREDITS.md');let bytes=0;
 assert.match(credits,/## Fractals a la natura \(CE46, 0\.74\)/);assert.match(credits,/ElevenLabs/);
 for(const z of bank.zones){const f=new URL(z[0],root);assert.ok(fs.existsSync(f),z[0]);bytes+=fs.statSync(f).size;assert.ok(credits.includes('`'+z[0]+'`'),z[0]);assert.ok(z[3]>.2&&z[3]<=6.1,z[0]);}
 assert.ok(bytes<2e6,`${bytes} bytes of fractals recordings`);
});

test('in the app: the folder «Formes, llum i música» after the Laboratori de matèria, the black floor, the loading, the sound, the drawing, the build and the dictionaries',()=>{
 const app=read('../dist/app.js'),art=read('../dist/art.js'),build=read('../build_standalone.py');
 assert.match(app,/ids:\['flower','pluja-colors','bubbles','fractals','kaleido'/);assert.match(app,/BB_CAUSE,FR_CAUSE\]\.sort\(/);
 assert.match(app,/item\.pluja\|\|item\.bombolles\|\|item\.fractals\?\{background:'full',base:'black'\}/);assert.match(app,/'bubbles','fractals',\.\.\.LOAD_DIVES\]/);
 assert.match(app,/if\(item\.fractals\)steps\.push\(\{w:2,share:\(\)=>\{try\{return frLoad\(\);\}catch\{return 1;\}\}\}\);/);
 assert.match(app,/if\(item\.fractals\)frStart\(game,settings\);/);assert.match(app,/game\?\.fractals\?frBlocked\(game,settings\):/);assert.match(app,/bbSilence\(\);frSilence\(\);/);
 assert.match(app,/if\(game\.fractals\)\{frTick\(game,settings,Math\.min\(dt,100\)\/1000\);frAudio\(game,settings,audio,master,/);
 assert.match(app,/if\(game\.fractals\)\{if\(frPress\(game,settings\)\)/);assert.match(app,/if\(game\.fractals\)return frStatus\(game,settings\);/);
 assert.match(app,/if\(id==='fractals'\)out\.push\(frFields\(\)\);/);assert.match(app,/selField\('frGrow',/);assert.match(app,/selField\('frFirst','Primera forma',FR_STIMS\.map/);
 assert.match(app,/if\(game\?\.fractals&&key==='frFirst'\)\{frSilence\(\);frStart\(game,settings\);\}/);assert.match(app,/try\{frPrewarm\(\);\}catch\{\}/);
 assert.match(art,/if\(id==='fractals'\)\{frDraw\(c,w,h,game,s,preview\);return;\}/);
 const order=['fractals-shaders.js','fractals-motor.js','fractals-formes.js','fractals-traces.js','fractals-formes1.js','fractals-formes2.js','fractals-formes3.js','fractals-formes4.js','fractals.js','fractals-escena.js'];
 let at=build.indexOf("'bombolles-escena.js'");assert.ok(at>0);for(const f of order){const i=build.indexOf(`'${f}'`);assert.ok(i>at,f);at=i;}assert.ok(at<build.indexOf("'art.js'"));
 // every text of the activity has its translation in the five other languages
 const texts=[FR_CAUSE.name,FR_CAUSE.desc,FR_CAUSE.tag,'Creixement de cada forma','Primera forma','Ràpid','Lent','La pantalla és negra i espera la primera pulsació. Cada pulsació fa créixer una forma de la natura.',
  'Mentre una forma creix i es desfà, les pulsacions no fan res.','Com més lent, millor es veu com cada nivell de la forma surt de l’anterior.','Pots prémer mentre una forma creix: ve la següent.',...FR_STIMS.map(x=>x.name),...FR_STIMS.map(x=>x.what)];
 const help=frHelp(S).match(/<strong>(.*?)<\/strong>/)[1];texts.push(help);
 for(const l of ['es','eu','gl','en','fr']){const d=JSON.parse(read(`../dist/i18n/${l}.json`));for(const x of texts)assert.ok(d.s[x],`${l}: ${x}`);
  for(const p of ['{x}, forma {n} de {n2}: {y}.','{x}, forma {n} de {n2}, completa: una ona de llum la recorre.','{x}, forma {n} de {n2}: la forma es desfà al revés de com ha crescut.','{x}, forma {n} de {n2}, acabada. La pantalla és negra i la pulsació següent en porta una altra.'])assert.ok(d.p.some(([ca])=>ca===p),`${l}: ${p}`);}
});

test('the drawing outside the browser: black, and nothing to wait for',async()=>{
 const {frDraw,frLoad,frGlFailed}=await import('../dist/fractals-escena.js');assert.equal(frLoad(),1);assert.equal(frGlFailed(),false);
 const calls=[],c={canvas:{width:320,height:180},save(){},restore(){},setTransform(){},fillRect(...a){calls.push(a);}};frDraw(c,320,180,{fractals:null},{});assert.deepEqual(calls,[[0,0,320,180]]);
});

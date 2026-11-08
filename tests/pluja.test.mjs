// La nova Pluja de colors (CE45, 0.55): every drop is one note and no note sounds without a drop; the note is scheduled for the moment
// its drop touches the floor; a scene fills, dilutes and gives way to the next; ten scenes with their own inks, melody, instrument and
// pulse; settings; the old marbling activity keeps its id as «Gotes de pintura».
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {PJ_CAUSE,PJ_FALL,PJ_GROW,PJ_FILL,PJ_DILUTE,PJ_CHANGE,PJ_AV,pjStart,pjPress,pjTick,pjBlocked,pjStatus,pjProgress,pjPhrase,pjPhraseIndex,pjAudio,pjScene,pjLead} from '../dist/pluja-colors.js';
import {PJ_SCENES,PJ_SCALES,pjParse,pjNote} from '../dist/pluja-escenes.js';
import {PC_CAUSE} from '../dist/color-rain.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {escRange} from '../dist/escenari.js';
import {defaults,validateProfile} from '../dist/input.js';
const read=f=>readFileSync(new URL(f,import.meta.url),'utf8');
const S={pjDrops:'curta',pjPresses:10,pjFirst:'llum',lock:true,sound:true,waitCue:true};
const run=(game,s,sec,dt=1/60)=>{for(let t=0;t<sec;t+=dt)pjTick(game,s,dt);};
// a fake audio: what the activity gives to the instruments and to the drop sound, with its delay
function fakeAudio(){const notes=[],fx=[];const ctx={state:'running',currentTime:0,outputLatency:.02,createGain:()=>({gain:{value:1},connect(){},disconnect(){}}),createBufferSource:()=>({buffer:null,playbackRate:{value:1},connect(){},disconnect(){},start(t,o){fx.push({t});},stop(){}}),createStereoPanner:()=>({pan:{value:0},connect(){},disconnect(){}})};return {ctx,out:{},notes,fx};}
const placeAll=F=>{for(const d of F.drops)if(!d.placed){d.placed=true;d.sx=.5;}};

test('the card: a new cause-effect activity CE45 with recorded sounds; Gotes de pintura keeps CE03 and its id',()=>{
 assert.equal(PJ_CAUSE.id,'pluja-colors');assert.equal(PJ_CAUSE.code,'CE45');assert.equal(PJ_CAUSE.type,'ce');assert.equal(PJ_CAUSE.name,'Pluja de colors');assert.ok(PJ_CAUSE.pluja&&PJ_CAUSE.recorded);
 assert.equal(PC_CAUSE.id,'color-rain');assert.equal(PC_CAUSE.code,'CE03');assert.equal(PC_CAUSE.name,'Gotes de pintura');});

test('ten scenes, each with seven inks and a lace ink, a real plucked or struck instrument, a key and mode, a pulse and ten phrases that close on the keynote',()=>{
 assert.equal(PJ_SCENES.length,10);assert.equal(new Set(PJ_SCENES.map(x=>x.id)).size,10);assert.equal(new Set(PJ_SCENES.map(x=>x.name)).size,10);
 assert.deepEqual(PJ_SCENES.map(x=>x.name),['Primera llum','Mar endins','Jardí de nit','Foc lent','Pluja d’estiu','Aurora','Caramel','Tempesta suau','Fruites','Pols d’estrelles']);
 const sustained=['fluteRec','oboeRec','clarinetRec','violinsRec','celliRec','trumpetRec','hornRec','tromboneRec','tubaRec'];
 for(const sc of PJ_SCENES){assert.equal(sc.pal.length,8,sc.id);for(const c of sc.pal)assert.match(c,/^#[0-9a-f]{6}$/,sc.id);assert.equal(new Set(sc.pal).size,8,sc.id+' eight different inks');
  for(const inst of [sc.inst,sc.bass]){assert.ok(SAMPLE_BANK[inst],inst);assert.equal(SAMPLE_BANK[inst].sustain,false,inst+': every note ends');assert.ok(!sustained.includes(inst));}
  assert.ok(PJ_SCALES[sc.mode],sc.mode);assert.ok(sc.beat>=.18&&sc.beat<=.45,sc.id+' pulse');assert.equal(sc.phrases.length,10,sc.id);
  for(const p of sc.phrases){const n=pjParse(p);assert.ok(n[0].bass&&n[0].beat===0);assert.ok(n.length>=4&&n.length<=6,sc.id+' '+p);for(let i=2;i<n.length;i++)assert.ok(n[i].beat>n[i-1].beat,sc.id+' '+p+': the drops come one after another');
   const [lo,hi]=escRange(sc.inst);for(const x of n.slice(1)){const m=pjNote(sc,x.deg);assert.ok(m>=lo&&m<=hi,`${sc.id} ${p}: ${m} in ${lo}–${hi}`);}
   const [blo,bhi]=escRange(sc.bass),b=pjNote(sc,n[0].deg,sc.bassOct);assert.ok(b>=blo&&b<=bhi,`${sc.id} bass ${b}`);}
  const last=pjParse(sc.phrases[9]);assert.equal(last[0].deg,0,sc.id+': the last chord is the keynote');assert.equal(((last[last.length-1].deg%7)+7)%7,0,sc.id+': the melody ends on the keynote');}
 // the scenes are different: no two share their inks, their melody or their instrument and pulse together
 for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){const a=PJ_SCENES[i],b=PJ_SCENES[j];assert.notDeepEqual(a.pal,b.pal);assert.notDeepEqual(a.phrases,b.phrases);assert.ok(a.inst!==b.inst||a.beat!==b.beat||a.key!==b.key,a.id+' '+b.id);}});

test('the phrase of a press: one drop, the phrase (low note first, then the melody) or the phrase and its echo; low notes are big drops',()=>{const sc=PJ_SCENES[0];
 for(let k=0;k<10;k++){const una=pjPhrase(sc,k,10,'una'),curta=pjPhrase(sc,k,10,'curta'),llarga=pjPhrase(sc,k,10,'llarga');assert.equal(una.length,1);assert.ok(curta.length>=4&&curta.length<=6);assert.equal(llarga.length,curta.length*2-1);
  assert.ok(curta[0].bass&&curta[0].w===Math.max(...curta.map(n=>n.w)),'the low note is the biggest drop');for(const n of curta.slice(1))assert.equal(n.inst,sc.inst);assert.equal(curta[0].inst,sc.bass);
  for(const n of llarga.filter(n=>n.echo)){const [lo,hi]=escRange(sc.inst);assert.ok(n.midi>=lo&&n.midi<=hi);}}
 assert.deepEqual([0,1,2,3,4,5].map(k=>pjPhraseIndex(k,6)),[0,1,2,3,4,9],'six presses: the last one closes');
 assert.deepEqual(Array.from({length:16},(_,k)=>pjPhraseIndex(k,16)),[0,1,2,3,4,5,6,7,8,0,1,2,3,4,5,9]);});

test('a scene: the presses drop their phrases, the last one fills the floor, then it dilutes to black and the next scene begins',()=>{const game={};pjStart(game,S);const F=game.pluja;
 assert.equal(F.phase,'rest');assert.equal(pjScene(F).id,'llum');assert.match(pjStatus(game,S),/Primera llum: el terra és negre/);
 for(let k=0;k<10;k++){assert.ok(!pjBlocked(game,S));assert.ok(pjPress(game,S),'press '+k);assert.equal(game.count,k+1);assert.equal(F.phase,'phrase');
  assert.ok(pjBlocked(game,S),'locked while the drops fall');assert.ok(!pjPress(game,S));const mine=F.drops.filter(d=>d.ph===F.phrases[F.phrases.length-1].id);
  assert.equal(Math.min(...mine.map(d=>d.t0)),F.t+PJ_FALL+.05,'the first drop lands after its fall');run(game,S,F.end-F.t+.05);}
 assert.equal(F.phase,'fill');assert.ok(F.fill);assert.ok(pjBlocked(game,S));assert.match(pjProgress(game,S),/^(<span class="done"><\/span>){10}$/);
 run(game,S,PJ_FILL);assert.equal(F.phase,'dilute');assert.match(pjStatus(game,S),/dilueix/);run(game,S,PJ_DILUTE);assert.equal(F.phase,'change');run(game,S,PJ_CHANGE+.05);
 assert.equal(F.phase,'rest');assert.equal(pjScene(F).id,'mar');assert.equal(game.count,0);assert.equal(F.drops.length,0);assert.equal(F.scene,2);
 for(let i=0;i<9;i++){F.sc=(F.sc+1)%10;}assert.equal(pjScene(F).id,'llum');});

test('six or sixteen presses, one drop or the long phrase; unlocked, a press leaves out the drops not yet in the air',()=>{
 for(const P of [6,16]){const s={...S,pjPresses:P},game={};pjStart(game,s);for(let k=0;k<P;k++){assert.ok(pjPress(game,s));run(game,s,4);}assert.equal(game.pluja.phase,'dilute'===game.pluja.phase?'dilute':game.pluja.phase);assert.notEqual(game.pluja.phase,'rest');assert.equal(game.pluja.k,P);}
 const s={...S,pjDrops:'una'},g1={};pjStart(g1,s);pjPress(g1,s);assert.equal(g1.pluja.drops.length,1);
 const u={...S,lock:false},g2={};pjStart(g2,u);pjPress(g2,u);const n1=g2.pluja.drops.length;run(g2,u,.2);assert.ok(!pjBlocked(g2,u));assert.ok(pjPress(g2,u));
 const F=g2.pluja,first=F.phrases[0].id;assert.ok(F.drops.filter(d=>d.ph===first).length<n1,'the first phrase is cut');assert.ok(F.drops.filter(d=>d.ph===first).every(d=>d.t0<=F.t+pjLead(u)),'only the drops already in the air stay');});

test('every drop has its note and every note its drop, scheduled for the moment the drop touches the floor (less the output latency, plus 30 ms for the picture)',()=>{
 const game={};pjStart(game,S);const F=game.pluja,A=fakeAudio(),played=[];const play=(e,d,l)=>played.push({e,d,at:F.t});
 for(let k=0;k<3;k++){pjPress(game,S);for(let i=0;i<180;i++){placeAll(F);pjAudio(game,S,A.ctx,A.out,play);pjTick(game,S,1/60);}}
 const drops=F.drops;assert.equal(played.length,drops.length,'one note per drop');
 for(const p of played){const d=drops.find(x=>x.midi===p.e.midi[0]&&Math.abs(x.t0-(p.at+p.d+.02-PJ_AV))<1e-6);assert.ok(d,'a note without its drop');assert.equal(p.e.midi.length,1,'one note');}
 assert.equal(new Set(played.map(p=>p.at+p.d)).size,played.length);
 // without sound nothing is played, and the notes of the past are not played later
 const g2={};pjStart(g2,{...S,sound:false});pjPress(g2,{...S,sound:false});const n=[];for(let i=0;i<60;i++){pjAudio(g2,{...S,sound:false},A.ctx,A.out,(e)=>n.push(e));pjTick(g2,S,1/60);}assert.equal(n.length,0);
 for(let i=0;i<60;i++){pjAudio(g2,S,A.ctx,A.out,(e)=>n.push(e));pjTick(g2,S,1/60);}assert.equal(n.length,0,'no late notes');});

test('the settings: defaults, validation, and the activity in the app (folder, cover, no background choice, the build)',()=>{
 assert.equal(defaults.pjDrops,'curta');assert.equal(defaults.pjPresses,10);assert.equal(defaults.pjView,'perspectiva');assert.equal(defaults.pjFlow,'lent');assert.equal(defaults.pjFirst,'llum');
 for(const id of PJ_SCENES.map(x=>x.id))assert.equal(validateProfile({...defaults,pjFirst:id}).pjFirst,id);
 assert.throws(()=>validateProfile({...defaults,pjPresses:12}));assert.throws(()=>validateProfile({...defaults,pjDrops:'molt'}));
 const app=read('../dist/app.js'),art=read('../dist/art.js'),build=read('../build_standalone.py');
 assert.match(app,/ids:\['flower','pluja-colors','kaleido','vitrall','natura','piro','drawings','toys','kitchen','color-rain'\]/,'after Flor de paper; Gotes de pintura stays last');
 assert.match(app,/item\.pluja\?\{background:'full',base:'black'\}/,'always the same black floor');assert.match(app,/const pluja=page==='game'&&game\?\.item\?\.id==='pluja-colors';return `\$\{pluja\?'<h3>El fons<\/h3>/,'no background choice inside it');
 assert.match(app,/if\(item\.pluja\)steps\.push\(\{w:2,share:\(\)=>\{try\{return pjLoad\(\);\}catch\{return 1;\}\}\}\);/,'the cover waits for its programs');
 assert.match(art,/if\(id==='pluja-colors'\)\{pjDraw\(c,w,h,game,s,preview\);return;\}/);
 assert.match(build,/'color-rain\.js','marbre-escena\.js','pluja-escenes\.js','pluja-colors\.js','pluja-shaders\.js','pluja-gl\.js','pluja-escena\.js',/);});

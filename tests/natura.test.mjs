import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NEW_CAUSES,beginCause,finishCause,causeBusy,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {KALEIDO_MAX_TURN,kaleidoPhase,kaleidoTimeline,kaleidoGrid} from '../dist/kaleido-base.js';
import {kaleidoScore} from '../dist/kaleido.js';
import {vitrallScore} from '../dist/vitrall.js';
import {NATURA_ART} from '../dist/natura-art.js';
import {NATURA_PATTERNS,NATURA_MIN_DURATION,NATURA_MOTIFS,NATURA_MUSIC,naturaEvents,naturaScore,drawNatura,naturaAdaptive,naturaMeasure,naturaQuality} from '../dist/natura.js';
import {MUSIC_TRANSPOSE,musicNote} from '../dist/kaleido-music.js';
import {SYNTH_INSTRUMENTS,SYNTH_SUSTAINED} from '../dist/synth.js';
import {SAMPLE_BANK,SAMPLE_INSTRUMENTS,sampleZone,sampleShift,sampleOnset,loadSamples,samplesReady} from '../dist/sampler.js';
import {Ptorn,Pleaf,Ppetal,Pring,Pland,Punfold} from '../dist/paper.js';
import {defaults} from '../dist/input.js';
const settings={...defaults};
const natura=NEW_CAUSES.find(x=>x.id==='natura'),N=NATURA_PATTERNS.length,DURATIONS=[10,12,15];
const setup=()=>({item:natura,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x==='number')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
// The melody of a piece as the composer reads it: notes in beats, degrees above the tonic.
function melodyNotes(spec){let s=0;const notes=[];for(const [name,shift=0] of spec.melody.phrases){const mot=spec.motifs[name];mot.n.forEach((d,j)=>{notes.push({s,d:d+shift});s+=mot.r[j];});}return {notes,beats:s};}
const range=inst=>{const z=SAMPLE_BANK[inst].zones.map(x=>x[1]);return [Math.min(...z),Math.max(...z)];};

test('Natura is CE23 with twenty forms of nature, each with its own name, and lasts at least ten seconds',()=>{assert.equal(natura.code,'CE23');assert.equal(natura.ownPhases,true);assert.equal(N,20);assert.equal(NATURA_ART.length,20);assert.equal(NATURA_MUSIC.length,20);assert.equal(natura.variants,20);
 assert.deepEqual(NATURA_PATTERNS.map(p=>p.plan),Array.from({length:20},(_,i)=>i+1));assert.equal(new Set(NATURA_PATTERNS.map(p=>p.name)).size,20);assert.equal(NATURA_MIN_DURATION,10);
 for(const duration of [2,6,8,10,12,15]){const g=setup();beginCause(g,{...settings,duration});assert.equal(g.duration,Math.max(10,duration));}});
test('each press presents the next form, rejects input while busy and loops after the twentieth',()=>{const g=setup();for(let i=0;i<N*2+1;i++){assert.equal(beginCause(g,settings),true);assert.equal(g.variant,i%N);assert.equal(causeBusy(g,settings),true);assert.equal(beginCause(g,settings),false);finishCause(g,settings);assert.equal(g.time,null);assert.equal(g.count,0);}});
test('every form turns far below the safety ceiling of one turn every four seconds',()=>{for(const [i,art] of NATURA_ART.entries())assert.ok(art.turn>=0&&art.turn<=.06&&art.turn<KALEIDO_MAX_TURN/20,`form ${i+1}: ${art.turn} rad/s`);});
test('visual events fall on the step grid inside the evolution, in order',()=>{for(let i=0;i<N;i++)for(const D of DURATIONS){const art=NATURA_ART[i],L=kaleidoTimeline(D),times=naturaEvents(i,D);assert.equal(times.length,art.hits.length);
 for(let k=0;k<times.length;k++){assert.ok(Number.isInteger(art.hits[k])&&art.hits[k]>=0&&art.hits[k]<art.steps);assert.ok(times[k]>=L.appear-1e-9&&times[k]<L.settleAt);if(k)assert.ok(times[k]>times[k-1]);}}});
test('every visual event has its note at the same instant, the score fits inside the effect, and every note is a recorded instrument',()=>{const known=new Set(SYNTH_INSTRUMENTS),recorded=new Set(SAMPLE_INSTRUMENTS);
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const score=naturaScore(index,D,seed);assert.equal(score[0].at,0,'a sound answers the press');
  for(let i=1;i<score.length;i++)assert.ok(score[i].at>=score[i-1].at);
  for(const e of score){assert.ok(e.at>=0&&e.at<1);assert.ok(e.length>0&&e.at+e.length<=1+1e-9);assert.ok(e.midi.length&&e.midi.every(m=>Number.isFinite(m)&&m>20&&m<110));assert.ok(known.has(e.inst),e.inst);assert.ok(recorded.has(e.inst),`form ${index+1}: ${e.inst} is not a recorded instrument`);assert.ok(e.vel>0&&e.vel<=1);}
  for(const time of naturaEvents(index,D))assert.ok(score.some(e=>Math.abs(e.at*D-time)<1e-9&&SAMPLE_BANK[e.inst].pitched),`form ${index+1}, ${D} s: note at ${time.toFixed(3)} s`);}});
test('the style of the collection: a melody from the family, harp or plucked strings, many instruments, and a bounded number of simultaneous notes',()=>{
 for(let index=0;index<N;index++)for(const D of [10,15]){const spec=NATURA_MUSIC[index],score=naturaScore(index,D),insts=new Set(score.map(e=>e.inst));
  assert.ok(insts.has(spec.melody.inst),'melody');assert.ok(insts.has('harpRec'),'the harp answers the press');assert.ok(insts.size>=5,`form ${index+1}: ${insts.size} instruments`);assert.ok(score.length>=35,`form ${index+1}: ${score.length} events`);
  // A sustained or damped note stops with its release, a struck or plucked one rings on for its ring time or the length of its recording.
  const tail=e=>{const b=SAMPLE_BANK[e.inst];return b.sustain||b.damp?b.release*1.3:b.ring?b.ring+b.release*1.3:3.5;};
  let busiest=0;for(let t=0;t<D;t+=.05){let n=0;for(const e of score){const s=e.at*D,end=s+e.length*D+tail(e);if(t>=s&&t<end)n+=e.midi.length;}busiest=Math.max(busiest,n);}
  assert.ok(busiest<=56,`form ${index+1}, ${D} s: ${busiest} notes at once`);}});
test('the twenty melodies are one family: made of the shared calls, consonant on the strong beats, inside the recorded range of their instrument, and over before the dissolve',()=>{
 for(const [i,spec] of NATURA_MUSIC.entries()){assert.equal(spec.motifs,NATURA_MOTIFS);assert.equal(spec.meter,4);const {notes,beats}=melodyNotes(spec),starts=spec.prog.map((_,k)=>k*16/spec.prog.length);
  for(const [name] of spec.melody.phrases)assert.ok(NATURA_MOTIFS[name],`form ${i+1}: unknown call ${name}`);
  for(const x of notes){if(x.s%2!==0)continue;let k=0;starts.forEach((s0,j)=>{if(x.s>=s0-1e-9)k=j;});const rel=((x.d-spec.prog[k])%7+7)%7;assert.ok([0,2,4].includes(rel),`form ${i+1}, beat ${x.s}: degree ${x.d} over chord ${spec.prog[k]}`);}
  // In every round (a tone up or a minor third down) the melody stays within four semitones of the instrument's recorded notes.
  const [lo,hi]=range(spec.melody.inst);for(const shift of MUSIC_TRANSPOSE){const midi=notes.map(x=>musicNote(spec.key,spec.mode,x.d)+12*spec.melody.oct+shift);assert.ok(Math.min(...midi)>=lo-4&&Math.max(...midi)<=hi+4,`form ${i+1}: melody from ${Math.min(...midi)} to ${Math.max(...midi)} on ${spec.melody.inst}`);}
  assert.equal(beats,NATURA_ART[i].steps,`form ${i+1}: ${beats} beats`);}
 const used=new Set(NATURA_MUSIC.flatMap(s=>s.melody.phrases.map(p=>p[0])));assert.deepEqual([...used].sort(),Object.keys(NATURA_MOTIFS).sort());
 assert.ok(NATURA_MUSIC.every(s=>['K','Q'].includes(s.melody.phrases.at(-1)[0])&&s.prog.at(-1)===0),'every melody ends on a cadence over the tonic');});
test('the music changes key from one round to the next and is the same for the same round',()=>{for(let index=0;index<N;index++){const a=naturaScore(index,10,0),b=naturaScore(index,10,1);assert.deepEqual(naturaScore(index,10,0),a);assert.deepEqual(naturaScore(index,10,3),a,'three-round cycle');
 const shift=MUSIC_TRANSPOSE[1]-MUSIC_TRANSPOSE[0];assert.equal(a.length,b.length);a.forEach((e,i)=>{assert.equal(b[i].inst,e.inst);assert.deepEqual(b[i].midi,e.midi.map(m=>m+shift));});}});
test('a harp chord answers the press, and long forms keep a steady pace',()=>{for(let index=0;index<N;index++){const a=kaleidoGrid(10,NATURA_ART[index].steps),b=kaleidoGrid(15,NATURA_ART[index].steps);assert.ok(a.step>.25&&a.step<.5);assert.ok(b.step>.25&&b.step<.5);assert.ok(naturaScore(index,10).filter(e=>e.at===0).some(e=>e.inst==='harpRec'&&e.midi.length>=3));}});
test('the recorded instruments: every file is in the folder, notes are retuned at most four semitones in any round, and each has a built-in fallback',()=>{
 const root=new URL('../dist/assets/samples/',import.meta.url);let bytes=0;
 // The nature and firework sounds have no fallback: they are checked on their own.
 for(const [name,b] of Object.entries(SAMPLE_BANK)){if(b.fallback===null)continue;assert.ok(SYNTH_INSTRUMENTS.includes(b.fallback)&&!SAMPLE_BANK[b.fallback],`${name}: fallback ${b.fallback}`);assert.equal(b.send.length,2);
  for(const z of b.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);bytes+=fs.statSync(new URL(z[0],root)).size;if(b.sustain)assert.ok(z[7]>z[2]&&z[8]>z[7]&&z[8]<=z[3],`${z[0]}: loop inside the note`);}
  if(b.pitched){const m=b.zones.map(z=>z[1]);assert.deepEqual(m,[...m].sort((x,y)=>x-y),`${name}: zones in order`);}else assert.ok(b.zones.every(z=>z[9]),`${name}: variants`);}
 assert.ok(bytes<4.2e6,`${bytes} bytes of recordings`);assert.ok(fs.readFileSync(new URL('CREDITS.md',root),'utf8').includes('CC0'));
 for(let index=0;index<N;index++)for(const seed of [0,1,2])for(const e of naturaScore(index,12,seed)){const b=SAMPLE_BANK[e.inst];if(!b.pitched)continue;for(const m of e.midi){const near=Math.min(...b.zones.map(z=>Math.abs(z[1]-m)));assert.ok(near<=4,`form ${index+1}: ${e.inst} ${m} is ${near} semitones from a recording`);}}
 assert.ok(SYNTH_SUSTAINED.includes('violinsRec')&&SYNTH_SUSTAINED.includes('celliRec'),'held strings come back after a pause');});
test('nature sounds: every form has one, a recording when the collection has it and an acoustic imitation otherwise',()=>{
 const root=new URL('../dist/assets/samples/',import.meta.url),b=SAMPLE_BANK.natureRec,names=b.zones.map(z=>z[9]);let bytes=0;
 // The recordings: seamless loops with a guard on each side, never replaced by another sound, credited.
 assert.equal(b.fallback,null);assert.equal(b.pitched,false);assert.equal(b.strict,true);assert.ok(b.sustain&&b.attack>=.5,'a soft entry');
 assert.equal(new Set(names).size,names.length,'one recording per sound');const credits=fs.readFileSync(new URL('CREDITS.md',root),'utf8');
 for(const z of b.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);bytes+=fs.statSync(new URL(z[0],root)).size;assert.ok(z[7]>=.25&&z[8]>z[7]+8&&z[3]-z[8]>=.25,`${z[0]}: a loop of at least 8 s with a guard`);assert.ok(credits.includes(z[0].split('/').pop()),`${z[0]} credited`);}
 // 0.31: the twelve ambiences of El pou del temps (16 s loops, about 1.6 MB) raised the budget from 4 MB; 0.38: the four ambiences of Pinta el món (cicadas, torrent, windmill, pigeons, about 0.55 MB) raised it to 6.2 MB.
 // 0.73: 6.5 MB, with the two loops of El vestidor fantàstic (the audience behind the wall, the creaking ship, 0.2 MB)
 assert.ok(bytes<6.5e6,`${bytes} bytes of nature recordings`);
 const key=e=>JSON.stringify(e),extra=(score,plain)=>{const left=new Map();for(const e of plain)left.set(key(e),(left.get(key(e))||0)+1);
  const added=score.filter(e=>{const k=key(e),c=left.get(k);if(c){left.set(k,c-1);return false;}return true;});return {added,unchanged:[...left.values()].every(c=>c===0)};};
 for(let index=0;index<N;index++){const spec=NATURA_MUSIC[index],a=spec.ambience,wanted=[].concat(a.sound);
  // Every form names its sounds and an imitation for when they are missing; it plays the recordings exactly when all of them are here.
  assert.ok(wanted.length&&a.mimic?.length,`form ${index+1}: sounds and an imitation`);assert.equal(!!spec.nature,wanted.every(s=>names.includes(s)),`form ${index+1}`);assert.ok(!!spec.nature!==!!spec.mimic);
  const saved={nature:spec.nature,mimic:spec.mimic};
  for(const D of DURATIONS)for(const seed of [0,1,2]){const L=kaleidoTimeline(D);
   Object.assign(spec,{nature:undefined,mimic:undefined});const plain=naturaScore(index,D,seed);
   // The recordings: two voices of each under the whole piece, from different points of the loop and panned apart; the music is untouched.
   if(saved.nature){spec.nature=saved.nature;const {added,unchanged}=extra(naturaScore(index,D,seed),plain);spec.nature=undefined;assert.ok(unchanged,`form ${index+1}: the music is unchanged`);
    assert.equal(added.length,2*saved.nature.length);for(const e of added){assert.equal(e.inst,'natureRec');assert.equal(e.at,0);assert.ok(Math.abs(e.length-1)<1e-9,'under the whole piece');assert.ok(wanted.includes(e.variant));}
    for(let k=0;k<added.length;k+=2)assert.ok(added[k].start!==added[k+1].start&&added[k].pan===-added[k+1].pan,'two voices from different points of the loop, panned apart');}
   // The imitation (played instead when a recording is missing) only adds soft, short notes between the first appearance and the dissolve.
   spec.mimic=a.mimic;const {added,unchanged}=extra(naturaScore(index,D,seed),plain);spec.mimic=undefined;
   assert.ok(unchanged,`form ${index+1}: the music is unchanged`);assert.ok(added.length>=4,`form ${index+1}: ${added.length} imitation notes`);
   for(const e of added){assert.ok(e.at*D>=L.appear-1e-6&&e.at*D<L.fadeAt,`form ${index+1}: imitation at ${e.at*D}`);assert.ok(e.vel<=.5&&e.length*D<=.5,`form ${index+1}: softer than the melody, and short`);assert.ok(SAMPLE_BANK[e.inst]&&e.inst!=='natureRec',e.inst);}}
  Object.assign(spec,saved);}
 // A sound that is missing is silent: never another recording in its place.
 assert.equal(sampleZone('natureRec',60,'nightingale'),null);});
test('the sampler finds the attack in every browser, and without decoded samples it hands each note to the fallback',async()=>{
 assert.equal(sampleShift(3.11,3.11,.01,.01),0,'a decoder that removes the priming');assert.ok(Math.abs(sampleShift(3.135,3.11,.035,.01)-1105/44100)<1e-9);assert.ok(Math.abs(sampleShift(3.161,3.11,.061,.01)-2257/44100)<1e-9);
 const rate=44100,x=new Float32Array(rate);for(let i=2205;i<rate;i++)x[i]=Math.sin(i*.05)*Math.exp(-(i-2205)/8000);assert.ok(Math.abs(sampleOnset(x,rate)-.05)<.003,'onset at 50 ms');
 assert.equal(sampleZone('harpRec',60),null);assert.equal(await loadSamples(),0,'no audio decoding outside the browser');assert.equal(samplesReady(),0);});
test('the paper: torn edges and cut shapes are closed, finite outlines, and every piece lands and unfolds to rest',()=>{
 for(const pts of [Ptorn([[0,0],[1,0],[1,1],[0,1]],.02,3),Pleaf(1,.3,.4,20),Ppetal(.1,.8,1,.2,12,.3),Pring(.4,.6,40)]){assert.ok(pts.length>=12);for(const p of pts)assert.ok(p.every(Number.isFinite));}
 const torn=Ptorn([[0,0],[1,0],[1,1],[0,1]],.02,3);assert.ok(torn.every(([x,y])=>x>-.05&&x<1.05&&y>-.05&&y<1.05),'a torn edge stays close to its cut');
 assert.deepEqual(Pland(0,1,.5),{v:0,z:1,s:1.12});assert.deepEqual(Pland(2,1,.5),{v:1,z:0,s:1});assert.equal(Punfold(0,1),0);assert.equal(Punfold(3,1),1);
 for(let t=1;t<1.5;t+=.01){const a=Pland(t,1,.5),b=Pland(t+.01,1,.5);assert.ok(b.v>=a.v-1e-12&&b.z<=a.z+1e-12);}});
test('all forms render every phase with finite geometry in both bases, both motion modes and every decor',()=>{for(let v=0;v<N;v++)for(const u of [0,.004,.05,.3,.6,.85,.97,1])for(const reduced of [false,true])for(const [base,background] of [['black','none'],['black','full'],['white','none'],['white','dim']]){const s={...settings,reduced,base,background},g=setup();g.nextVariant=v;g.completed=v%3;beginCause(g,s);g.time=g.duration*u;renderExtraCause(ctx(),1024,768,'natura',g,s);}});
test('the first frame already answers the press, and rest is empty before the first press and after each form ends',()=>{for(let v=0;v<N;v++){const g=setup();g.nextVariant=v;const c=ctx();renderExtraCause(c,1024,768,'natura',g,settings);assert.equal(c.calls.length,0);beginCause(g,settings);g.time=1/60;const first=ctx();renderExtraCause(first,1024,768,'natura',g,settings);assert.ok(first.calls.some(x=>x[0]==='arc'),'a glow answers the press');assert.ok(kaleidoPhase(1/60,g.duration).alpha>=.35);
 g.time=6;const live=ctx();renderExtraCause(live,1024,768,'natura',g,settings);assert.ok(live.calls.length>60,`form ${v+1} draws`);finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,'natura',g,settings);assert.equal(after.calls.length,0);}});
test('the same round draws the same frame, and a new round changes the colours',()=>{for(let v=0;v<N;v++){const frame=completed=>{const g=setup();g.completed=completed;g.nextVariant=v;beginCause(g,settings);g.time=6;const c=ctx();const fills=[];const proxy=new Proxy(c,{set(o,k,val){if(k==='fillStyle'&&typeof val==='string')fills.push(val);o[k]=val;return true;}});renderExtraCause(proxy,800,600,'natura',g,settings);return JSON.stringify([c.calls,fills]);};assert.equal(frame(0),frame(0));assert.notEqual(frame(0),frame(1),`form ${v+1}`);}});
test('changing the duration mid-form recomposes the music and continues from the same moment',()=>{const g=setup();g.nextVariant=7;beginCause(g,settings);g.time=4;const before=g.time/g.duration;retimeCause(g,{...settings,duration:15},15);assert.equal(g.duration,15);assert.deepEqual(g.score,naturaScore(7,15,0));assert.ok(Math.abs(g.time/15-before)<1e-9);const next=g.score[g.soundEvent];assert.ok(next.at>before&&(g.soundEvent===0||g.score[g.soundEvent-1].at<=before+1e-6));});
test('on a slow device the soft shadows give way to light ones, and they do not keep coming and going',()=>{
 const run=(n,cost)=>{let changes=0,prev=naturaQuality().low;for(let i=0;i<n;i++){naturaMeasure(cost(naturaQuality().level));const low=naturaQuality().low;if(low!==prev)changes++;prev=low;}return changes;};
 const blurred=()=>{let n=0;const c=ctx(),proxy=new Proxy(c,{set(o,k,val){if(k==='shadowBlur'&&val>0)n++;o[k]=val;return true;}});drawNatura(proxy,800,600,{index:0,t:8,duration:12,seed:0});return n;};
 try{assert.equal(naturaQuality().on,false,'off outside the browser, so the other tests draw identical frames');assert.ok(blurred()>0,'soft shadows at full quality');
  naturaAdaptive(true);assert.equal(run(600,()=>6),0);assert.equal(naturaQuality().level,1);
  assert.equal(run(120,()=>54),1);assert.equal(naturaQuality().level,0);assert.equal(blurred(),0,'hard, light shadows on a slow device');
  assert.equal(run(300,()=>6),0,'the low quality is held for a while');assert.equal(run(600,()=>6),1);assert.equal(naturaQuality().level,1);
  naturaAdaptive(true);assert.equal(run(60*600,lv=>9+15*lv),5,'near the limit: three drops and two returns in ten minutes');assert.equal(naturaQuality().level,0);}
 finally{naturaAdaptive(false);}});
test('the shared composer still writes exactly the same Caleidoscopi and Vitralls music as in 0.8 (as written, before the recorded orchestration)',()=>{
 const print=(score,durations)=>{let all='';for(let i=0;i<20;i++)for(const D of durations)for(const s of [0,1,2])all+=JSON.stringify(score(i,D,s));return crypto.createHash('sha256').update(all).digest('hex');};
 assert.equal(print((i,D,s)=>kaleidoScore(i,D,s,{builtIn:true}),[8,10,12,15]),'22420debafb6bd9e61e5c7216912eba9614ad96eac87932a3ca27f1ff4af7856');
 assert.equal(print((i,D,s)=>vitrallScore(i,D,s,{builtIn:true}),[10,12,15,20]),'953b8318311c8275a02d8590e837ff53035d2927c8196d4701d1e35e5f40dc6e');});

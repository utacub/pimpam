import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {NEW_CAUSES,beginCause,finishCause,causeBusy,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {KALEIDO_MAX_TURN,kaleidoPhase,kaleidoTimeline,kaleidoGrid} from '../dist/kaleido-base.js';
import {kaleidoScore} from '../dist/kaleido.js';
import {vitrallScore} from '../dist/vitrall.js';
import {naturaScore} from '../dist/natura.js';
import {PIRO_ART} from '../dist/piro-art.js';
import {PIRO_PATTERNS,PIRO_MIN_DURATION,PIRO_MOTIFS,PIRO_MUSIC,piroEvents,piroScore,drawPiro,piroAdaptive,piroMeasure,piroQuality} from '../dist/piro.js';
import {FW_KINDS,FW_MAX_TURN,FwPlan,FwTime,FwFlashes,FwSounds} from '../dist/firework.js';
import {MUSIC_TRANSPOSE,musicNote} from '../dist/kaleido-music.js';
import {SYNTH_INSTRUMENTS,SYNTH_SUSTAINED} from '../dist/synth.js';
import {SAMPLE_BANK,SAMPLE_INSTRUMENTS,sampleZone} from '../dist/sampler.js';
import {defaults} from '../dist/input.js';
const settings={...defaults};
const piro=NEW_CAUSES.find(x=>x.id==='piro'),N=PIRO_PATTERNS.length,DURATIONS=[10,12,15];
const setup=()=>({item:piro,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x==='number')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
// The melody of a piece as the composer reads it: notes in beats, degrees above the tonic.
function melodyNotes(spec){let s=0;const notes=[];for(const [name,shift=0] of spec.melody.phrases){const mot=spec.motifs[name];mot.n.forEach((d,j)=>{notes.push({s,d:d+shift});s+=mot.r[j];});}return {notes,beats:s};}
const range=inst=>{const z=SAMPLE_BANK[inst].zones.map(x=>x[1]);return [Math.min(...z),Math.max(...z)];};
const FIRE=['fireRec','fizzRec'];

test('Piromusical is CE24 with twenty shows, each with its own name, and lasts at least ten seconds',()=>{assert.equal(piro.code,'CE24');assert.equal(piro.name,'Piromusical');assert.equal(piro.ownPhases,true);assert.equal(N,20);assert.equal(PIRO_ART.length,20);assert.equal(PIRO_MUSIC.length,20);assert.equal(piro.variants,20);
 assert.deepEqual(PIRO_PATTERNS.map(p=>p.plan),Array.from({length:20},(_,i)=>i+1));assert.equal(new Set(PIRO_PATTERNS.map(p=>p.name)).size,20);assert.equal(PIRO_MIN_DURATION,10);
 assert.ok(!NEW_CAUSES.some(x=>x.id!=='piro'&&x.name===piro.name),'a name of its own, not the one of Focs artificials (CE04)');
 for(const duration of [2,6,8,10,12,15]){const g=setup();beginCause(g,{...settings,duration});assert.equal(g.duration,Math.max(10,duration));}});
test('each press presents the next show, rejects input while busy and loops after the twentieth',()=>{const g=setup();for(let i=0;i<N*2+1;i++){assert.equal(beginCause(g,settings),true);assert.equal(g.variant,i%N);assert.equal(causeBusy(g,settings),true);assert.equal(beginCause(g,settings),false);finishCause(g,settings);assert.equal(g.time,null);assert.equal(g.count,0);}});
test('nothing turns faster than one turn every four seconds: spiral stars and Catherine wheels',()=>{assert.equal(FW_MAX_TURN,KALEIDO_MAX_TURN);
 for(const [i,art] of PIRO_ART.entries())for(const s of FwPlan(art)){if(s.twist)assert.ok(s.twist*s.drag<=FW_MAX_TURN,`show ${i+1}: spiral turns at ${s.twist*s.drag} rad/s`);if(s.kind==='wheel')assert.ok(2*Math.PI*s.spin<=FW_MAX_TURN,`show ${i+1}: wheel at ${s.spin} turns/s`);}});
test('big glows open only on visual events and never more than twice in any second',()=>{
 for(const [i,art] of PIRO_ART.entries())for(const D of DURATIONS){const H=piroEvents(i,D),glows=FwFlashes(art,H);assert.ok(glows.length>=1,`show ${i+1}: no glow`);
  for(const t of glows)assert.ok(H.some(h=>Math.abs(h-t)<1e-9),`show ${i+1}: a glow at ${t.toFixed(3)} s is not on a visual event`);
  for(const t of glows)assert.ok(glows.filter(u=>u>=t&&u<t+1).length<=2,`show ${i+1}, ${D} s: more than two glows in the second after ${t.toFixed(2)} s`);}});
test('the shells use the kinds of the engine, at known places, and their colours have no saturated red',()=>{
 for(const [i,art] of PIRO_ART.entries()){assert.equal(art.pal.length,3,`show ${i+1}: three palettes, one per round`);
  for(const s of art.shells){assert.ok(FW_KINDS[s.kind],`show ${i+1}: ${s.kind}`);assert.ok(Number.isInteger(s.at)&&s.at>=0&&s.at<art.hits.length,`show ${i+1}: event ${s.at}`);assert.ok(Math.abs(s.x??0)<=.8,`show ${i+1}: x ${s.x}`);}
  for(const pal of art.pal)for(const col of pal){const [r,g,b]=[1,3,5].map(k=>parseInt(col.slice(k,k+2),16));assert.ok(r/(r+g+b)<.8,`show ${i+1}: ${col} is a saturated red`);}}});
test('visual events fall on the step grid inside the evolution, in order',()=>{for(let i=0;i<N;i++)for(const D of DURATIONS){const art=PIRO_ART[i],L=kaleidoTimeline(D),times=piroEvents(i,D);assert.equal(times.length,art.hits.length);assert.equal(art.hits[0],0,'the first event comes with the appearance');
 for(let k=0;k<times.length;k++){assert.ok(Number.isInteger(art.hits[k])&&art.hits[k]>=0&&art.hits[k]<16);assert.ok(times[k]>=L.appear-1e-9&&times[k]<L.settleAt);if(k)assert.ok(times[k]>times[k-1]);}}});
test('every visual event has its note at the same instant, the score fits inside the effect, and every note is a recorded instrument',()=>{const known=new Set(SYNTH_INSTRUMENTS),recorded=new Set(SAMPLE_INSTRUMENTS);
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const score=piroScore(index,D,seed);assert.equal(score[0].at,0,'a sound answers the press');
  for(let i=1;i<score.length;i++)assert.ok(score[i].at>=score[i-1].at);
  for(const e of score){assert.ok(e.at>=0&&e.at<1);assert.ok(e.length>0&&e.at+e.length<=1+1e-9);assert.ok(e.midi.length&&e.midi.every(m=>Number.isFinite(m)&&m>20&&m<110));assert.ok(known.has(e.inst),e.inst);assert.ok(recorded.has(e.inst),`show ${index+1}: ${e.inst} is not a recorded instrument`);assert.ok(e.vel>0&&e.vel<=1);}
  for(const time of piroEvents(index,D))assert.ok(score.some(e=>Math.abs(e.at*D-time)<1e-9&&SAMPLE_BANK[e.inst].pitched),`show ${index+1}, ${D} s: note at ${time.toFixed(3)} s`);}});
test('the style of the collection: a festival band (tuba, brass, drums, timpani), a harp chord on the press, many instruments, and a bounded number of simultaneous notes',()=>{
 // Trumpets, horns or trombones play in most shows; the lightest ones (a violin, flute or glockenspiel tune) keep only the tuba.
 const brassy=new Set();
 for(let index=0;index<N;index++)for(const D of [10,15]){const spec=PIRO_MUSIC[index],score=piroScore(index,D),insts=new Set(score.map(e=>e.inst));
  assert.ok(insts.has(spec.melody.inst),'melody');assert.ok(insts.has('tubaRec'),'the tuba plays the bass');assert.ok(insts.has('timpaniRec'),'timpani under the press and the big shells');
  if(['trumpetRec','hornRec','tromboneRec'].some(x=>insts.has(x)))brassy.add(index);assert.ok(['snareRec','bassdrumRec','triangleRec'].some(x=>insts.has(x)),'a light beat');assert.ok(insts.has('cymbalRec'),'a cymbal closes the show');
  assert.ok(score.filter(e=>e.at===0).some(e=>e.inst==='harpRec'&&e.midi.length>=3),'a harp chord answers the press');
  assert.ok(insts.size>=8,`show ${index+1}: ${insts.size} instruments`);assert.ok(score.length>=60,`show ${index+1}: ${score.length} events`);
  // A sustained or damped note stops with its release, a struck or plucked one rings on for its ring time or the length of its recording.
  const tail=e=>{const b=SAMPLE_BANK[e.inst];return b.sustain||b.damp?b.release*1.3:b.ring?b.ring+b.release*1.3:3.5;};
  let busiest=0,loudest=0;for(let t=0;t<D;t+=.05){let n=0,f=0;for(const e of score){const s=e.at*D,end=s+e.length*D+tail(e);if(t>=s&&t<end){if(FIRE.includes(e.inst))f++;else n+=e.midi.length;}}busiest=Math.max(busiest,n);loudest=Math.max(loudest,f);}
  assert.ok(busiest<=56,`show ${index+1}, ${D} s: ${busiest} notes at once`);assert.ok(loudest<=12,`show ${index+1}, ${D} s: ${loudest} firework sounds at once`);}
 assert.ok(brassy.size>=15,`${brassy.size} shows with trumpets, horns or trombones`);});
test('the twenty melodies are one family: made of the band calls, consonant on the strong beats, inside the recorded range of their instrument, and over before the dissolve',()=>{
 for(const [i,spec] of PIRO_MUSIC.entries()){assert.equal(spec.motifs,PIRO_MOTIFS);assert.equal(spec.meter,4);const {notes,beats}=melodyNotes(spec),starts=spec.prog.map((_,k)=>k*16/spec.prog.length);
  for(const [name] of spec.melody.phrases)assert.ok(PIRO_MOTIFS[name],`show ${i+1}: unknown call ${name}`);
  for(const x of notes){if(x.s%2!==0)continue;let k=0;starts.forEach((s0,j)=>{if(x.s>=s0-1e-9)k=j;});const rel=((x.d-spec.prog[k])%7+7)%7;assert.ok([0,2,4].includes(rel),`show ${i+1}, beat ${x.s}: degree ${x.d} over chord ${spec.prog[k]}`);}
  // In every round (a tone up or a minor third down) the melody stays within four semitones of the instrument's recorded notes.
  const [lo,hi]=range(spec.melody.inst);for(const shift of MUSIC_TRANSPOSE){const midi=notes.map(x=>musicNote(spec.key,spec.mode,x.d)+12*spec.melody.oct+shift);assert.ok(Math.min(...midi)>=lo-4&&Math.max(...midi)<=hi+4,`show ${i+1}: melody from ${Math.min(...midi)} to ${Math.max(...midi)} on ${spec.melody.inst}`);}
  assert.equal(beats,16,`show ${i+1}: ${beats} beats`);}
 const used=new Set(PIRO_MUSIC.flatMap(s=>s.melody.phrases.map(p=>p[0])));assert.deepEqual([...used].sort(),Object.keys(PIRO_MOTIFS).sort());
 assert.ok(PIRO_MUSIC.every(s=>['K','Q','F'].includes(s.melody.phrases.at(-1)[0])&&s.prog.at(-1)===0),'every melody ends on a cadence or the closing fanfare over the tonic');});
test('the music changes key from one round to the next, exactly, and is the same for the same round',()=>{for(let index=0;index<N;index++){const a=piroScore(index,10,0),b=piroScore(index,10,1);assert.deepEqual(piroScore(index,10,0),a);assert.deepEqual(piroScore(index,10,3),a,'three-round cycle');
 const shift=MUSIC_TRANSPOSE[1]-MUSIC_TRANSPOSE[0];assert.equal(a.length,b.length);a.forEach((e,i)=>{assert.equal(b[i].inst,e.inst);if(SAMPLE_BANK[e.inst].pitched)assert.deepEqual(b[i].midi,e.midi.map(m=>m+shift),`show ${index+1}: ${e.inst}`);});}});
test('each show closes on plucked and struck sounds: a rolled harp chord on the settle, no horn chord, and nothing held more than 1.2 s after it',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS){const score=piroScore(index,D),L=kaleidoTimeline(D),settle=score.filter(e=>Math.abs(e.at*D-L.settleAt)<1e-6);
  assert.ok(settle.some(e=>e.inst==='harpRec'&&e.midi.length>=4&&e.strum>0),`show ${index+1}: a harp chord on the settle`);assert.ok(!score.some(e=>e.inst==='hornRec'&&e.at*D>=L.settleAt-1e-6),`show ${index+1}: a horn chord in the settle`);
  for(const e of score)if(SAMPLE_BANK[e.inst].sustain&&!FIRE.includes(e.inst))assert.ok((e.at+e.length)*D<=L.settleAt+1.2+1e-9,`show ${index+1}, ${D} s: ${e.inst} held until ${((e.at+e.length)*D).toFixed(2)} s`);}});
test('every pitched note is retuned at most four semitones from a recording, in every round and duration',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2])for(const e of piroScore(index,D,seed)){const b=SAMPLE_BANK[e.inst];if(!b.pitched)continue;for(const m of e.midi){const near=Math.min(...b.zones.map(z=>Math.abs(z[1]-m)));assert.ok(near<=4,`show ${index+1}, ${D} s, round ${seed}: ${e.inst} ${m} is ${near} semitones from a recording`);}}});
test('the band: every recording is in the folder, in order, with a built-in fallback (none for the horns, rather than an organ) and credited',()=>{const root=new URL('../dist/assets/samples/',import.meta.url),credits=fs.readFileSync(new URL('CREDITS.md',root),'utf8');
 for(const name of ['trumpetRec','hornRec','tromboneRec','tubaRec','timpaniRec','cymbalRec','bassdrumRec','snareRec','snareRollRec']){const b=SAMPLE_BANK[name];assert.ok(b,name);if(['hornRec','tromboneRec'].includes(name))assert.equal(b.fallback,null,name);else assert.ok(SYNTH_INSTRUMENTS.includes(b.fallback)&&!SAMPLE_BANK[b.fallback]&&b.fallback!=='organ',`${name}: fallback ${b.fallback}`);
  for(const z of b.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);if(b.sustain)assert.ok(z[7]>z[2]&&z[8]>z[7]&&z[8]<=z[3],`${z[0]}: loop inside the note`);}
  if(b.pitched){const m=b.zones.map(z=>z[1]);assert.deepEqual(m,[...m].sort((x,y)=>x-y),`${name}: zones in order`);}else assert.ok(b.zones.every(z=>z[9]),`${name}: variants`);
  assert.ok(credits.includes('`'+b.zones[0][0].split('/')[0]+'`'),`${name}: credited`);}
 assert.ok(SYNTH_SUSTAINED.includes('tubaRec')&&SYNTH_SUSTAINED.includes('hornRec'),'held brass comes back after a pause');});
test('the firework sounds are soft, come with the shells, and are silent when a recording is missing',()=>{const root=new URL('../dist/assets/samples/',import.meta.url),credits=fs.readFileSync(new URL('CREDITS.md',root),'utf8');let bytes=0;
 for(const name of FIRE){const b=SAMPLE_BANK[name];assert.equal(b.fallback,null,`${name}: never another sound in its place`);assert.equal(b.pitched,false);assert.equal(b.strict,true);
  for(const z of b.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);bytes+=fs.statSync(new URL(z[0],root)).size;assert.ok(z[9],`${z[0]}: a variant`);assert.ok(credits.includes(z[0].split('/').pop()),`${z[0]} credited`);}}
 assert.ok(bytes<400e3,`${bytes} bytes of firework sounds`);assert.equal(sampleZone('fireRec',60,'boom'),null,'silent before (or without) decoding');
 const variants=new Set(SAMPLE_BANK.fireRec.zones.map(z=>z[9]));
 for(let index=0;index<N;index++)for(const D of DURATIONS){const H=piroEvents(index,D),fx=FwSounds(PIRO_ART[index],H),score=piroScore(index,D);
  const bursts=fx.filter(e=>['boom','bloom'].includes(e.variant));assert.ok(bursts.length>=3,`show ${index+1}: ${bursts.length} bursts heard`);
  for(const e of fx){assert.ok(e.vel<=.55,`show ${index+1}: ${e.variant} at ${e.vel}`);assert.ok(FIRE.includes(e.inst));if(e.inst==='fireRec')assert.ok(variants.has(e.variant),e.variant);}
  // Each big glow is heard: a soft boom or bloom at the same instant.
  for(const t of FwFlashes(PIRO_ART[index],H))assert.ok(bursts.some(e=>Math.abs(e.time-t)<.13),`show ${index+1}: the glow at ${t.toFixed(2)} s is silent`);
  const heard=score.filter(e=>FIRE.includes(e.inst));assert.ok(heard.length>=bursts.length,`show ${index+1}: the sounds are in the score`);for(const e of heard)assert.ok(e.vel<=.55);}});
test('all shows render every phase with finite geometry in both bases, both motion modes and every decor',()=>{for(let v=0;v<N;v++)for(const u of [0,.004,.05,.2,.4,.6,.85,.97,1])for(const reduced of [false,true])for(const [base,background] of [['black','none'],['black','full'],['white','none'],['white','dim']]){const s={...settings,reduced,base,background},g=setup();g.nextVariant=v;g.completed=v%3;beginCause(g,s);g.time=g.duration*u;renderExtraCause(ctx(),1024,768,'piro',g,s);}});
test('the first frame already answers the press, and rest is empty before the first press and after each show ends',()=>{for(let v=0;v<N;v++){const g=setup();g.nextVariant=v;const c=ctx();renderExtraCause(c,1024,768,'piro',g,settings);assert.equal(c.calls.length,0);beginCause(g,settings);g.time=1/60;const first=ctx();renderExtraCause(first,1024,768,'piro',g,settings);assert.ok(first.calls.some(x=>x[0]==='arc'),'a glow answers the press');assert.ok(kaleidoPhase(1/60,g.duration).alpha>=.35);
 g.time=5;const live=ctx();renderExtraCause(live,1024,768,'piro',g,settings);assert.ok(live.calls.length>200,`show ${v+1} draws`);finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,'piro',g,settings);assert.equal(after.calls.length,0);}});
test('with reduced motion no rocket rises: the shells open in place',()=>{for(let v=0;v<N;v++){const art=PIRO_ART[v],H=piroEvents(v,10),first=Math.min(...FwPlan(art).map(s=>FwTime(s,H)));
 // Strokes are trails and sparks (and the ripples of a lake, the same in every frame): before the first shell opens, only rockets make them.
 const strokes=(t,reduced)=>{const c=ctx();drawPiro(c,1024,768,{index:v,t,duration:10,seed:0,reduced});return c.calls.filter(x=>x[0]==='stroke').length;};
 if(FwPlan(art).some(s=>s.at===0&&(s.rise??0)>0))assert.ok(strokes(first-.15,false)>strokes(.01,false),`show ${v+1}: rockets rise`);
 assert.equal(strokes(first-.15,true),strokes(.01,true),`show ${v+1}: nothing flies before the first shell opens`);}});
test('the same round draws the same frame, and a new round changes the colours',()=>{for(let v=0;v<N;v++){const frame=completed=>{const g=setup();g.completed=completed;g.nextVariant=v;beginCause(g,settings);g.time=5;const c=ctx();const fills=[];const proxy=new Proxy(c,{set(o,k,val){if((k==='fillStyle'||k==='strokeStyle')&&typeof val==='string')fills.push(val);o[k]=val;return true;}});renderExtraCause(proxy,800,600,'piro',g,settings);return JSON.stringify([c.calls,fills]);};assert.equal(frame(0),frame(0));assert.notEqual(frame(0),frame(1),`show ${v+1}`);}});
test('changing the duration mid-show recomposes the music and continues from the same moment',()=>{const g=setup();g.nextVariant=7;beginCause(g,settings);g.time=4;const before=g.time/g.duration;retimeCause(g,{...settings,duration:15},15);assert.equal(g.duration,15);assert.deepEqual(g.score,piroScore(7,15,0));assert.ok(Math.abs(g.time/15-before)<1e-9);const next=g.score[g.soundEvent];assert.ok(next.at>before&&(g.soundEvent===0||g.score[g.soundEvent-1].at<=before+1e-6));});
test('on a slow device the trails get shorter, and the quality does not keep coming and going',()=>{
 const run=(n,cost)=>{let changes=0,prev=piroQuality().low;for(let i=0;i<n;i++){piroMeasure(cost(piroQuality().level));const low=piroQuality().low;if(low!==prev)changes++;prev=low;}return changes;};
 const strokes=()=>{const c=ctx();drawPiro(c,800,600,{index:3,t:5,duration:10,seed:0});return c.calls.filter(x=>x[0]==='lineTo').length;};
 try{assert.equal(piroQuality().on,false,'off outside the browser, so the other tests draw identical frames');const full=strokes();
  piroAdaptive(true);assert.equal(run(600,()=>6),0);assert.equal(piroQuality().level,1);
  assert.equal(run(120,()=>54),1);assert.equal(piroQuality().level,0);const light=strokes();assert.ok(light<full*.6,`${light} strokes on a slow device, ${full} at full quality`);
  assert.equal(run(300,()=>6),0,'the low quality is held for a while');assert.equal(run(600,()=>6),1);assert.equal(piroQuality().level,1);
  piroAdaptive(true);assert.equal(run(60*600,lv=>9+15*lv),5,'near the limit: three drops and two returns in ten minutes');assert.equal(piroQuality().level,0);}
 finally{piroAdaptive(false);}});
test('the shared composer still writes exactly the same Caleidoscopi and Vitralls music (as written) and Natura music as before',()=>{
 const print=(score,durations)=>{let all='';for(let i=0;i<20;i++)for(const D of durations)for(const s of [0,1,2])all+=JSON.stringify(score(i,D,s));return crypto.createHash('sha256').update(all).digest('hex');};
 assert.equal(print((i,D,s)=>kaleidoScore(i,D,s,{builtIn:true}),[8,10,12,15]),'22420debafb6bd9e61e5c7216912eba9614ad96eac87932a3ca27f1ff4af7856');
 assert.equal(print((i,D,s)=>vitrallScore(i,D,s,{builtIn:true}),[10,12,15,20]),'953b8318311c8275a02d8590e837ff53035d2927c8196d4701d1e35e5f40dc6e');
 assert.equal(print(naturaScore,[10,12,15]),'c77359cc1490da1a2d84a83527ebe14385cd626a13f31c0aec892b40c0c523f5');});

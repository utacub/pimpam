import test from 'node:test';
import assert from 'node:assert/strict';
import {NEW_CAUSES,beginCause,finishCause,causeBusy,retimeCause} from '../dist/cause-catalog.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {KALEIDO_MAX_TURN,kaleidoPhase,kaleidoTimeline,kaleidoGrid} from '../dist/kaleido-base.js';
import {VITRALL_ART} from '../dist/vitrall-art.js';
import {VITRALL_PATTERNS,VITRALL_MIN_DURATION,VITRALL_MOTIFS,VITRALL_MUSIC,vitrallEvents,vitrallScore,drawVitrall,vitrallAdaptive,vitrallMeasure,vitrallQuality} from '../dist/vitrall.js';
import {MUSIC_TRANSPOSE,musicNote} from '../dist/kaleido-music.js';
import {SYNTH_INSTRUMENTS} from '../dist/synth.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {Gvoronoi,Gintersect,Garch,Gcircle,Gcentroid} from '../dist/glass.js';
import {defaults} from '../dist/input.js';
const settings={...defaults};
const vitrall=NEW_CAUSES.find(x=>x.id==='vitrall'),N=VITRALL_PATTERNS.length,DURATIONS=[10,12,15];
const setup=()=>({item:vitrall,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x==='number')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
// The melody of a piece as the composer reads it: notes in beats, degrees above the tonic.
function melodyNotes(spec){let s=0;const notes=[];for(const [name,shift=0,flags=''] of spec.melody.phrases){const mot=spec.motifs[name];let ds=mot.n.slice(),rs=mot.r.slice();if(flags.includes('i'))ds=ds.map(x=>2*ds[0]-x);if(flags.includes('r')){ds.reverse();rs.reverse();}const k=flags.includes('a')?2:flags.includes('h')?.5:1;ds.forEach((d,j)=>{notes.push({s,d:d+shift});s+=rs[j]*k;});}return {notes,beats:s};}

test('Vitralls is CE22 with twenty windows, each with its own name, and lasts at least ten seconds',()=>{assert.equal(vitrall.code,'CE22');assert.equal(vitrall.ownPhases,true);assert.equal(N,20);assert.equal(VITRALL_ART.length,20);assert.equal(VITRALL_MUSIC.length,20);assert.equal(vitrall.variants,20);
 assert.deepEqual(VITRALL_PATTERNS.map(p=>p.plan),Array.from({length:20},(_,i)=>i+1));assert.equal(new Set(VITRALL_PATTERNS.map(p=>p.name)).size,20);assert.equal(VITRALL_MIN_DURATION,10);
 for(const duration of [2,6,8,10,12,15]){const g=setup();beginCause(g,{...settings,duration});assert.equal(g.duration,Math.max(10,duration));}});
test('each press presents the next window, rejects input while busy and loops after the twentieth',()=>{const g=setup();for(let i=0;i<N*2+1;i++){assert.equal(beginCause(g,settings),true);assert.equal(g.variant,i%N);assert.equal(causeBusy(g,settings),true);assert.equal(beginCause(g,settings),false);finishCause(g,settings);assert.equal(g.time,null);assert.equal(g.count,0);}});
test('every window turns far below the safety ceiling of one turn every four seconds',()=>{for(const [i,art] of VITRALL_ART.entries())assert.ok(art.turn>=0&&art.turn<=.06&&art.turn<KALEIDO_MAX_TURN/20,`window ${i+1}: ${art.turn} rad/s`);});
test('visual events fall on the step grid inside the evolution, in order',()=>{for(let i=0;i<N;i++)for(const D of DURATIONS){const art=VITRALL_ART[i],L=kaleidoTimeline(D),times=vitrallEvents(i,D);assert.equal(times.length,art.hits.length);
 for(let k=0;k<times.length;k++){assert.ok(Number.isInteger(art.hits[k])&&art.hits[k]>=0&&art.hits[k]<art.steps);assert.ok(times[k]>=L.appear-1e-9&&times[k]<L.settleAt);if(k)assert.ok(times[k]>times[k-1]);}}});
test('every visual event has its note at the same instant, the score fits inside the effect, and every note is a recorded instrument',()=>{const known=new Set(SYNTH_INSTRUMENTS);
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const score=vitrallScore(index,D,seed);assert.equal(score[0].at,0,'a sound answers the press');
  for(let i=1;i<score.length;i++)assert.ok(score[i].at>=score[i-1].at);
  for(const e of score){assert.ok(e.at>=0&&e.at<1);assert.ok(e.length>0&&e.at+e.length<=1+1e-9);assert.ok(e.midi.length&&e.midi.every(m=>Number.isFinite(m)&&m>20&&m<110));assert.ok(known.has(e.inst),e.inst);assert.ok(SAMPLE_BANK[e.inst],`window ${index+1}: ${e.inst} is not a recorded instrument`);assert.ok(e.vel>0&&e.vel<=1);}
  for(const time of vitrallEvents(index,D))assert.ok(score.some(e=>Math.abs(e.at*D-time)<1e-9&&SAMPLE_BANK[e.inst].pitched),`window ${index+1}, ${D} s: note at ${time.toFixed(3)} s`);}});
test('the style of the collection: a bourdon bowed by the cellos on each bar, a melody from the family, dance percussion and many instruments, with a bounded number of simultaneous notes',()=>{
 // A sustained or damped note stops with its release, a struck or plucked one rings on for its ring time or the length of its recording.
 const tail=e=>{const b=SAMPLE_BANK[e.inst];return b.sustain||b.damp?b.release*1.3:b.ring?b.ring+b.release*1.3:3.5;};
 const MELODY={recorder:'fluteRec',flute:'fluteRec',dulcimer:'violinsPizzRec',carillon:'marimbaRec'};
 for(let index=0;index<N;index++)for(const D of [10,15,20]){const spec=VITRALL_MUSIC[index],score=vitrallScore(index,D),insts=new Set(score.map(e=>e.inst)),L=kaleidoTimeline(D);
  // The open fifth (a whole chord in the last window) is bowed again at least three times, never longer than a bow, and stops at the settle.
  const bourdon=score.filter(e=>e.inst==='celliRec'&&e.midi.length>=2);assert.ok(bourdon.length>=3,`window ${index+1}: ${bourdon.length} strokes`);
  assert.ok(bourdon.every(e=>e.length*D<=2.7&&(e.at+e.length)*D<=L.settleAt+1e-6),`window ${index+1}, ${D} s: a bourdon note held too long`);
  assert.ok(insts.has(MELODY[spec.melody.inst]),'melody');assert.ok(insts.has('bassdrumRec'),'the tabor, on a soft bass drum');assert.ok(insts.size>=6,`window ${index+1}: ${insts.size} instruments`);assert.ok(score.length>=35,`window ${index+1}: ${score.length} events`);
  let busiest=0;for(let t=0;t<D;t+=.05){let n=0;for(const e of score){const s=e.at*D,end=s+e.length*D+tail(e);if(t>=s&&t<end)n+=e.midi.length;}busiest=Math.max(busiest,n);}
  assert.ok(busiest<=52,`window ${index+1}, ${D} s: ${busiest} notes at once`);}});
// The pitch classes of a chord.
const classes=midi=>[...new Set(midi.map(m=>((m%12)+12)%12))].sort((a,b)=>a-b).join();
test('the recorded instruments play the piece as written: every note at the same instant, the same notes in some octave, and only the bourdon\'s new bow strokes added',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const written=vitrallScore(index,D,seed,{builtIn:true}),played=vitrallScore(index,D,seed),L=kaleidoTimeline(D),at=e=>e.at*D;
  // A written note and a played one match at the same instant: percussion on an unpitched recording, the rest on a pitched one with the same notes.
  const match=(w,p)=>Math.abs(at(w)-at(p))<1e-6&&(['tabor','jingle','thump'].includes(w.inst)?!SAMPLE_BANK[p.inst].pitched:SAMPLE_BANK[p.inst].pitched&&classes(w.midi)===classes(p.midi));
  // The shimmer has no recording and is left out; the strings let go after the settle.
  for(const e of written){if(e.inst==='shimmer'||e.inst==='choir'&&at(e)>L.settleAt+1e-6)continue;assert.ok(played.some(r=>match(e,r)),`window ${index+1}, ${D} s, round ${seed}: ${e.inst} ${e.midi} at ${at(e).toFixed(3)} s is not played`);}
  const drone=written.find(e=>e.inst==='organ'&&e.midi.length>=2);
  for(const r of played){if(r.inst==='celliRec'&&classes(r.midi)===classes(drone.midi)||r.inst==='celliPizzRec'&&Math.abs(at(r)-L.settleAt)<1e-6)continue;assert.ok(written.some(e=>match(e,r)),`window ${index+1}, ${D} s, round ${seed}: ${r.inst} ${r.midi} at ${at(r).toFixed(3)} s is not in the piece`);}}});
test('every pitched note is retuned at most four semitones from a recording, in every round and duration',()=>{
 for(let index=0;index<N;index++)for(const D of [...DURATIONS,20])for(const seed of [0,1,2])for(const e of vitrallScore(index,D,seed)){const b=SAMPLE_BANK[e.inst];if(!b.pitched)continue;for(const m of [...e.midi,...(e.glide===undefined?[]:[e.glide])]){const near=Math.min(...b.zones.map(z=>Math.abs(z[1]-m)));assert.ok(near<=4,`window ${index+1}, ${D} s, round ${seed}: ${e.inst} ${m} is ${near} semitones from a recording`);}}});
test('each window ends on plucked and struck sounds: a rolled harp chord and a plucked bass note on the settle, and nothing held more than 1.2 s after it',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS){const score=vitrallScore(index,D),L=kaleidoTimeline(D),settle=score.filter(e=>Math.abs(e.at*D-L.settleAt)<1e-6);
  assert.ok(settle.some(e=>e.inst==='harpRec'&&e.midi.length>=3&&e.strum>0),`window ${index+1}: a harp chord on the settle`);assert.ok(settle.some(e=>e.inst==='celliPizzRec'),`window ${index+1}: a plucked bass on the settle`);
  for(const e of score)if(SAMPLE_BANK[e.inst].sustain)assert.ok((e.at+e.length)*D<=L.settleAt+1.2+1e-9,`window ${index+1}, ${D} s: ${e.inst} held until ${((e.at+e.length)*D).toFixed(2)} s`);}});
test('the twenty melodies are one family: made of the shared cells, consonant on the strong beats, sung where the instrument sounds well, and over before the dissolve',()=>{
 for(const [i,spec] of VITRALL_MUSIC.entries()){assert.equal(spec.motifs,VITRALL_MOTIFS);const {notes,beats}=melodyNotes(spec),meter=spec.meter,starts=spec.changes||spec.prog.map((_,k)=>k*16/spec.prog.length);
  for(const [name] of spec.melody.phrases)assert.ok(VITRALL_MOTIFS[name],`window ${i+1}: unknown cell ${name}`);assert.ok([3,4,6].includes(meter));
  for(const x of notes){const strong=meter===4?x.s%2===0:x.s%3===0;if(!strong)continue;let k=0;starts.forEach((s0,j)=>{if(x.s>=s0-1e-9)k=j;});const rel=((x.d-spec.prog[k])%7+7)%7;assert.ok([0,2,4].includes(rel),`window ${i+1}, beat ${x.s}: degree ${x.d} over chord ${spec.prog[k]}`);}
  const midi=notes.map(x=>musicNote(spec.key,spec.mode,x.d)+12*spec.melody.oct);assert.ok(Math.min(...midi)>=60&&Math.max(...midi)<=95,`window ${i+1}: melody from ${Math.min(...midi)} to ${Math.max(...midi)}`);
  assert.ok(beats>=15&&beats<=VITRALL_ART[i].steps,`window ${i+1}: ${beats} beats`);}
 // The family shares its cells: every cell is used, and most pieces end on one of the two cadences.
 const used=new Set(VITRALL_MUSIC.flatMap(s=>s.melody.phrases.map(p=>p[0])));assert.deepEqual([...used].sort(),Object.keys(VITRALL_MOTIFS).sort());
 assert.ok(VITRALL_MUSIC.every(s=>['K','Q'].includes(s.melody.phrases.at(-1)[0])),'every melody ends on a cadence');});
test('the music changes key from one round to the next and is the same for the same round',()=>{for(let index=0;index<N;index++){const a=vitrallScore(index,10,0),b=vitrallScore(index,10,1);assert.deepEqual(vitrallScore(index,10,0),a);assert.deepEqual(vitrallScore(index,10,3),a,'three-round cycle');
 const shift=MUSIC_TRANSPOSE[1]-MUSIC_TRANSPOSE[0];assert.equal(a.length,b.length);a.forEach((e,i)=>{assert.equal(b[i].inst,e.inst);assert.deepEqual(b[i].midi,e.midi.map(m=>m+shift));});}});
test('a chord answers the press, and long windows keep a steady pace',()=>{for(let index=0;index<N;index++){const a=kaleidoGrid(10,VITRALL_ART[index].steps),b=kaleidoGrid(15,VITRALL_ART[index].steps);assert.ok(a.step>.25&&a.step<.5);assert.ok(b.step>.25&&b.step<.5);assert.ok(vitrallScore(index,10).filter(e=>e.at===0).some(e=>e.midi.length>=2));}});
test('the glass geometry: Voronoi pieces tile their window without gaps or overlaps, and clipped quarries stay inside the arch',()=>{
 const area=pts=>Math.abs(pts.reduce((a,p,i)=>{const q=pts[(i+1)%pts.length];return a+p[0]*q[1]-q[0]*p[1];},0))/2,circle=Gcircle(0,0,1,48),sites=Array.from({length:60},(_,i)=>[Math.cos(i*2.4)*Math.sqrt(i/60)*.95,Math.sin(i*2.4)*Math.sqrt(i/60)*.95]);
 const cells=Gvoronoi(sites,circle,2);assert.equal(cells.length,60);assert.ok(Math.abs(cells.reduce((a,c)=>a+area(c.pts),0)-area(circle))<1e-6,'the pieces fill the window exactly');
 const arch=Garch(-.3,.3,.95,-.36);for(let k=0;k<40;k++){const x=-.4+k*.02,q=Gintersect([[x,0],[x+.2,.1],[x,.2],[x-.2,.1]],arch);for(const [px,py] of q)assert.ok(px>=-.3-1e-9&&px<=.3+1e-9&&py<=.95+1e-9);}
 const [cx,cy]=Gcentroid([[0,0],[2,0],[2,2],[0,2]]);assert.deepEqual([cx,cy],[1,1]);});
test('all windows render every phase with finite geometry in both bases, both motion modes and every decor',()=>{for(let v=0;v<N;v++)for(const u of [0,.004,.05,.3,.6,.85,.97,1])for(const reduced of [false,true])for(const [base,background] of [['black','none'],['black','full'],['white','none'],['white','dim']]){const s={...settings,reduced,base,background},g=setup();g.nextVariant=v;g.completed=v%3;beginCause(g,s);g.time=g.duration*u;renderExtraCause(ctx(),1024,768,'vitrall',g,s);}});
test('the first frame already answers the press, and rest is empty before the first press and after each window ends',()=>{for(let v=0;v<N;v++){const g=setup();g.nextVariant=v;const c=ctx();renderExtraCause(c,1024,768,'vitrall',g,settings);assert.equal(c.calls.length,0);beginCause(g,settings);g.time=1/60;const first=ctx();renderExtraCause(first,1024,768,'vitrall',g,settings);assert.ok(first.calls.some(x=>x[0]==='arc'),'a glow answers the press');assert.ok(kaleidoPhase(1/60,g.duration).alpha>=.35);
 g.time=6;const live=ctx();renderExtraCause(live,1024,768,'vitrall',g,settings);assert.ok(live.calls.length>60,`window ${v+1} draws`);finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,'vitrall',g,settings);assert.equal(after.calls.length,0);}});
test('the same round draws the same frame, and a new round changes the colours',()=>{for(let v=0;v<N;v++){const frame=completed=>{const g=setup();g.completed=completed;g.nextVariant=v;beginCause(g,settings);g.time=6;const c=ctx();const fills=[];const proxy=new Proxy(c,{set(o,k,val){if(k==='fillStyle'&&typeof val==='string')fills.push(val);o[k]=val;return true;}});renderExtraCause(proxy,800,600,'vitrall',g,settings);return JSON.stringify([c.calls,fills]);};assert.equal(frame(0),frame(0));assert.notEqual(frame(0),frame(1),`window ${v+1}`);}});
test('changing the duration mid-window recomposes the music and continues from the same moment',()=>{const g=setup();g.nextVariant=7;beginCause(g,settings);g.time=4;const before=g.time/g.duration;retimeCause(g,{...settings,duration:15},15);assert.equal(g.duration,15);assert.deepEqual(g.score,vitrallScore(7,15,0));assert.ok(Math.abs(g.time/15-before)<1e-9);const next=g.score[g.soundEvent];assert.ok(next.at>before&&(g.soundEvent===0||g.score[g.soundEvent-1].at<=before+1e-6));});
test('on a slow device the texture and the shadow along the lead fade out, and they do not keep coming and going',()=>{
 const run=(n,cost)=>{let changes=0,prev=vitrallQuality().low;for(let i=0;i<n;i++){vitrallMeasure(cost(vitrallQuality().level));const low=vitrallQuality().low;if(low!==prev)changes++;prev=low;}return changes;};
 const strokes=()=>{const c=ctx();drawVitrall(c,800,600,{index:0,t:6,duration:10,seed:0});return c.calls.filter(x=>x[0]==='stroke').length;};
 try{assert.equal(vitrallQuality().on,false,'off outside the browser, so the other tests draw identical frames');const full=strokes();
  vitrallAdaptive(true);assert.equal(run(600,()=>6),0);assert.equal(vitrallQuality().level,1);
  assert.equal(run(120,()=>54),1);assert.equal(vitrallQuality().level,0);assert.ok(strokes()<full,'the shadow along the lead is left out');
  assert.equal(run(300,()=>6),0,'the low quality is held for a while');assert.equal(run(600,()=>6),1);assert.equal(vitrallQuality().level,1);
  vitrallAdaptive(true);assert.equal(run(60*600,lv=>9+15*lv),5,'near the limit: three drops and two returns in ten minutes');assert.equal(vitrallQuality().level,0);}
 finally{vitrallAdaptive(false);}});

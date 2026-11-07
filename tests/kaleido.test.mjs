import test from 'node:test';
import assert from 'node:assert/strict';
import {EXTRA_CAUSES,NEW_CAUSES,beginCause,finishCause,causeBusy,retimeCause} from '../dist/cause-catalog.js';
import {PC_CAUSE} from '../dist/color-rain.js';
import {renderExtraCause} from '../dist/cause-art.js';
import {KALEIDO_MAX_TURN,KALEIDO_MIN_DURATION,kaleidoPhase,kaleidoTimeline,kaleidoGrid} from '../dist/kaleido-base.js';
import {KALEIDO_ART,KALEIDO_SPEEDS,threadMultiplier,mandalaRing,auroraOmega,auroraRibbon,tunnelRings,waveRings} from '../dist/kaleido-art.js';
import {KALEIDO_PATTERNS,kaleidoEvents,kaleidoScore} from '../dist/kaleido.js';
import {MUSIC_TRANSPOSE} from '../dist/kaleido-music.js';
import {createSynth,SYNTH_INSTRUMENTS,SYNTH_SUSTAINED} from '../dist/synth.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import fs from 'node:fs';
import {defaults} from '../dist/input.js';
const settings={...defaults};
const kaleido=NEW_CAUSES.find(x=>x.id==='kaleido'),N=KALEIDO_PATTERNS.length,DURATIONS=[8,10,12,15];
const setup=()=>({item:kaleido,time:null,count:0,completed:0,nextVariant:0,control:'effect',releaseTime:null});
function ctx(){const calls=[],gradient={addColorStop(){}};return new Proxy({calls},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push([k,...args.filter(x=>typeof x==='number')]);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}
// The moments the drawing uses, rebuilt from the public timeline (the same rule as kaleido.js).
const moments=(index,D)=>{const art=KALEIDO_ART[index],grid=kaleidoGrid(D,art.steps),hitT=art.hits.map(s=>grid.time(s*grid.m));return {hitT,hitE:art.hits.map(s=>s/art.steps),hitC:hitT.map(t=>kaleidoPhase(t,D).clock),step:grid.step*grid.m};};

test('Caleidoscopi is CE21 with the twenty patterns of the plan, in its order, and the codes of causa-efecte are all different',()=>{const codes=['CE02','CE13',...EXTRA_CAUSES.map(x=>x.code),PC_CAUSE.code,...NEW_CAUSES.map(x=>x.code)];assert.equal(new Set(codes).size,codes.length);assert.ok(NEW_CAUSES.some(x=>x.id==='kaleido'&&x.code==='CE21'));assert.ok(codes.length>=22);
 assert.equal(N,20);assert.equal(KALEIDO_ART.length,20);assert.equal(kaleido.variants,20);assert.deepEqual(KALEIDO_PATTERNS.map(p=>p.plan),Array.from({length:20},(_,i)=>i+1));
 assert.deepEqual([1,7,8].map(n=>KALEIDO_PATTERNS[n-1].name),['Mandala que respira','Constel·lació de fils','Corrent d’aurora'],'the three prototype patterns keep their names and places');assert.equal(new Set(KALEIDO_PATTERNS.map(p=>p.name)).size,20);});
test('each press presents the next pattern, rejects input while busy and loops after the twentieth',()=>{const g=setup();for(let i=0;i<N*2+1;i++){assert.equal(beginCause(g,settings),true);assert.equal(g.variant,i%N);assert.equal(causeBusy(g,settings),true);assert.equal(beginCause(g,settings),false);finishCause(g,settings);assert.equal(g.time,null);assert.equal(g.count,0);}});
test('patterns last at least the minimum and follow longer configured durations',()=>{for(const duration of [2,6,8,12,15]){const g=setup();beginCause(g,{...settings,duration});assert.equal(g.duration,Math.max(KALEIDO_MIN_DURATION,duration));}});
test('the first frame already answers the press and the last frame returns to black',()=>{for(const reduced of [false,true])for(const D of [8,12,15]){const L=kaleidoTimeline(D),first=kaleidoPhase(1/60,D,reduced);assert.ok(first.alpha>=.35,'visible from the first frame');assert.ok(kaleidoPhase(L.appear,D,reduced).grow>first.grow);assert.equal(kaleidoPhase(D,D,reduced).alpha,0);assert.equal(kaleidoPhase(L.appear,D,reduced).evolve,0);assert.equal(kaleidoPhase(L.settleAt,D,reduced).evolve,1);assert.ok(L.settle>=1.5&&L.dissolve>=.8,'stable pose before a gentle dissolve');}});
test('the motion clock never runs backwards and slows to a quarter during the settle',()=>{const D=10,L=kaleidoTimeline(D);let last=-1;for(let t=0;t<=D;t+=.01){const m=kaleidoPhase(t,D).motion;assert.ok(m>=last-1e-9);last=m;}const speed=t=>(kaleidoPhase(t+.01,D).motion-kaleidoPhase(t,D).motion)/.01;assert.ok(Math.abs(speed(1)-1)<1e-6);assert.ok(Math.abs(speed(L.settleAt+1)-.25)<1e-6);for(let t=0;t<=D;t+=.5)assert.equal(kaleidoPhase(t,D,true).motion,0);});
test('every global rotation stays below the safety ceiling of one turn every four seconds',()=>{for(const [i,art] of KALEIDO_ART.entries())assert.ok(art.turn>0&&art.turn<KALEIDO_MAX_TURN,`pattern ${i+1}: ${art.turn.toFixed(3)} rad/s`);assert.ok(KALEIDO_SPEEDS.mandalaBreath>=2,'breathing slower than 0.5 Hz');
 for(const D of [KALEIDO_MIN_DURATION,15])for(let k=0;k<8;k++)for(let t=0;t<D;t+=.005){const a=mandalaRing(k,kaleidoPhase(t,D),8).spin,b=mandalaRing(k,kaleidoPhase(t+.005,D),8).spin;assert.ok(Math.abs(b-a)/.005<KALEIDO_MAX_TURN,`ring ${k} at ${t.toFixed(2)} s`);}
 for(let r=.1;r<=.4;r+=.01)assert.ok(auroraOmega(r)<=KALEIDO_ART[7].turn+1e-12&&auroraOmega(r)>0);});
test('the aurora moves without jumps: every ribbon point travels a small, steady distance from one frame to the next at 60 fps',()=>{
 // Displacements in units of the short side of the screen. A jump would show as a frame step far larger than its neighbours.
 for(const reduced of [false,true])for(const D of [8,15]){const o={seed:1,reduced,hitE:KALEIDO_ART[7].hits.map(s=>s/12)},dt=1/60;let worst=0,worstJerk=0;
  const swell=ph=>o.hitE.reduce((m,e)=>Math.max(m,Math.exp(-Math.pow((ph.evolve-e)/.09,2))),0),at=(j,t)=>{const ph=kaleidoPhase(t,D,reduced);return auroraRibbon(j,ph,o,swell(ph)).pts.map(([x,y])=>[x*ph.grow,y*ph.grow]);};
  for(let j=0;j<160;j+=7){let prev=at(j,0),prevStep=null;for(let t=dt;t<D;t+=dt){const cur=at(j,t),step=Math.max(...cur.map((p,i)=>Math.hypot(p[0]-prev[i][0],p[1]-prev[i][1])));if(t>.7){worst=Math.max(worst,step);if(prevStep!==null)worstJerk=Math.max(worstJerk,Math.abs(step-prevStep));}prevStep=step;prev=cur;}}
  assert.ok(worst<.006,`largest move per frame ${worst.toFixed(4)} of the short side`);assert.ok(worstJerk<.0015,`largest change of speed between frames ${worstJerk.toFixed(5)}`);}});
test('visual events fall on the step grid inside the evolution, in order',()=>{for(let i=0;i<N;i++)for(const D of DURATIONS){const art=KALEIDO_ART[i],L=kaleidoTimeline(D),times=kaleidoEvents(i,D);assert.equal(times.length,art.hits.length);
 for(let k=0;k<times.length;k++){assert.ok(Number.isInteger(art.hits[k])&&art.hits[k]>=0&&art.hits[k]<art.steps);assert.ok(times[k]>=L.appear-1e-9&&times[k]<L.settleAt);if(k)assert.ok(times[k]>times[k-1]);}}});
test('every visual event has its note at the same instant, the score fits inside the effect, and every note is a recorded instrument',()=>{const known=new Set(SYNTH_INSTRUMENTS);
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const score=kaleidoScore(index,D,seed);assert.equal(score[0].at,0,'a sound answers the press');
  for(let i=1;i<score.length;i++)assert.ok(score[i].at>=score[i-1].at);
  for(const e of score){assert.ok(e.at>=0&&e.at<1);assert.ok(e.length>0&&e.at+e.length<=1+1e-9);assert.ok(e.midi.length&&e.midi.every(m=>Number.isFinite(m)&&m>20&&m<110));assert.ok(known.has(e.inst),e.inst);assert.ok(SAMPLE_BANK[e.inst],`pattern ${index+1}: ${e.inst} is not a recorded instrument`);assert.ok(e.vel>0&&e.vel<=1);}
  for(const time of kaleidoEvents(index,D))assert.ok(score.some(e=>Math.abs(e.at*D-time)<1e-9&&SAMPLE_BANK[e.inst].pitched),`pattern ${index+1}, ${D} s: note at ${time.toFixed(3)} s`);}});
test('each piece is layered: strings for the harmony, cellos for the bass, a melodic voice and several instruments, with a bounded number of simultaneous notes (counting each note’s natural decay)',()=>{
 // A sustained or damped note stops with its release, a struck or plucked one rings on for its ring time or the length of its recording.
 const tail=e=>{const b=SAMPLE_BANK[e.inst];return b.sustain||b.damp?b.release*1.3:b.ring?b.ring+b.release*1.3:3.5;};
 for(let index=0;index<N;index++)for(const D of [8,15]){const score=kaleidoScore(index,D),insts=new Set(score.map(e=>e.inst));
  assert.ok(insts.has('violinsRec'),'strings for the harmony');assert.ok(insts.has('celliPizzRec')||insts.has('celliRec'),'cellos for the bass');assert.ok(insts.size>=6,`pattern ${index+1}: ${insts.size} instruments`);assert.ok(score.length>=25,`pattern ${index+1}: ${score.length} events`);
  let busiest=0;for(let t=0;t<D;t+=.05){let n=0;for(const e of score){const s=e.at*D,end=s+e.length*D+tail(e);if(t>=s&&t<end)n+=e.midi.length;}busiest=Math.max(busiest,n);}
  assert.ok(busiest<=60,`pattern ${index+1}, ${D} s: ${busiest} notes at once`);}});
// The pitch classes of a chord (fractions of a semitone kept, for the beating pairs).
const classes=midi=>[...new Set(midi.map(m=>((m%12)+12)%12))].sort((a,b)=>a-b).join();
test('the recorded instruments play the piece as written: every note at the same instant, the same notes in some octave, and nothing added',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2]){const written=kaleidoScore(index,D,seed,{builtIn:true}),played=kaleidoScore(index,D,seed),L=kaleidoTimeline(D),at=e=>e.at*D;
  // A written note and a played one match at the same instant: percussion on an unpitched recording, the rest on a pitched one with the same notes.
  const match=(w,p)=>Math.abs(at(w)-at(p))<1e-6&&(['shaker','tick','thump','swell'].includes(w.inst)?!SAMPLE_BANK[p.inst].pitched:SAMPLE_BANK[p.inst].pitched&&classes(w.midi)===classes(p.midi));
  // The shimmer has no recording and is left out; the strings and the flute let go after the settle (the notes they would start later are dropped).
  for(const e of written){if(e.inst==='shimmer'||['pad','choir','flute'].includes(e.inst)&&at(e)>L.settleAt+1e-6)continue;assert.ok(played.some(r=>match(e,r)),`pattern ${index+1}, ${D} s, round ${seed}: ${e.inst} ${e.midi} at ${at(e).toFixed(3)} s is not played`);}
  for(const r of played)assert.ok(written.some(e=>match(e,r)),`pattern ${index+1}, ${D} s, round ${seed}: ${r.inst} ${r.midi} at ${at(r).toFixed(3)} s is not in the piece`);}});
test('every pitched note is retuned at most four semitones from a recording, in every round and duration',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS)for(const seed of [0,1,2])for(const e of kaleidoScore(index,D,seed)){const b=SAMPLE_BANK[e.inst];if(!b.pitched)continue;for(const m of [...e.midi,...(e.glide===undefined?[]:[e.glide])]){const near=Math.min(...b.zones.map(z=>Math.abs(z[1]-m)));assert.ok(near<=4,`pattern ${index+1}, ${D} s, round ${seed}: ${e.inst} ${m} is ${near} semitones from a recording`);}}});
test('each piece ends on plucked and struck sounds: a rolled harp chord on the settle, and nothing held more than 1.2 s after it',()=>{
 for(let index=0;index<N;index++)for(const D of DURATIONS){const score=kaleidoScore(index,D),L=kaleidoTimeline(D);
  assert.ok(score.some(e=>Math.abs(e.at*D-L.settleAt)<1e-6&&e.inst==='harpRec'&&e.midi.length>=3&&e.strum>0),`pattern ${index+1}: a harp chord on the settle`);
  for(const e of score)if(SAMPLE_BANK[e.inst].sustain)assert.ok((e.at+e.length)*D<=L.settleAt+1.2+1e-9,`pattern ${index+1}, ${D} s: ${e.inst} held until ${((e.at+e.length)*D).toFixed(2)} s`);}});
test('the four collections with recorded instruments say so, and opening one starts decoding the recordings',()=>{
 assert.deepEqual(NEW_CAUSES.filter(x=>x.recorded).map(x=>x.id),['kaleido','vitrall','natura','piro','drawings','toys','kitchen']);
 const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');assert.match(app,/if\(item\.recorded\)loadSamples\(\);/);assert.doesNotMatch(app,/id==='natura'\)loadSamples/);});
test('the music changes key from one round to the next and is the same for the same round',()=>{for(let index=0;index<N;index++){const a=kaleidoScore(index,8,0),b=kaleidoScore(index,8,1);assert.deepEqual(kaleidoScore(index,8,0),a);assert.deepEqual(kaleidoScore(index,8,3),a,'three-round cycle');
 const shift=MUSIC_TRANSPOSE[1]-MUSIC_TRANSPOSE[0];assert.equal(a.length,b.length);a.forEach((e,i)=>{assert.equal(b[i].inst,e.inst);assert.deepEqual(b[i].midi,e.midi.map(m=>m+shift),'the same piece, voicings included, in another key');});}});
test('the string figure rests on whole multipliers exactly at its three visual events and morphs one step at a time',()=>{const holds=KALEIDO_ART[6].hits.map(s=>s/12);assert.deepEqual(holds,[3/12,7/12,11/12]);
 for(const seed of [0,1,2]){for(const e of [0,...holds,1])assert.ok(Math.abs(threadMultiplier(e,seed)-Math.round(threadMultiplier(e,seed)))<1e-9);for(let e=0;e<1;e+=.01)assert.ok(Math.abs(threadMultiplier(e+.01,seed)-threadMultiplier(e,seed))<=.07,'continuous morph: at most 0.07 per 1% of the evolution (a jump would be a whole step)');}
 assert.deepEqual([0,...holds].map(e=>threadMultiplier(e,0)),[2,3,4,5]);});
test('ring patterns keep a low spatial frequency: never more than five rings of the tunnel or of each wave source',()=>{for(const D of [8,10,15])for(const reduced of [false,true])for(const seed of [0,1,2]){const t16=moments(16,D),t14=moments(14,D);
 for(let t=0;t<=D;t+=.02){const ph=kaleidoPhase(t,D,reduced);assert.ok(tunnelRings(ph,{...t16,reduced,seed},500).length<=5,`tunnel at ${t.toFixed(2)} s`);const rings=waveRings(ph,{...t14,reduced,seed},500);for(const s of [0,1])assert.ok(rings.filter(r=>r.source===s).length<=5);}}});
test('all patterns render every phase with finite geometry in both bases, both motion modes and every decor',()=>{for(let v=0;v<N;v++)for(const u of [0,.004,.05,.3,.6,.85,.97,1])for(const reduced of [false,true])for(const [base,background] of [['black','none'],['black','full'],['white','none'],['white','dim']]){const s={...settings,reduced,base,background},g=setup();g.nextVariant=v;g.completed=v%3;beginCause(g,s);g.time=g.duration*u;renderExtraCause(ctx(),1024,768,'kaleido',g,s);}});
test('rest is empty before the first press and after each pattern ends',()=>{for(let v=0;v<N;v++){const g=setup();g.nextVariant=v;const c=ctx();renderExtraCause(c,1024,768,'kaleido',g,settings);assert.equal(c.calls.length,0);beginCause(g,settings);g.time=4;const live=ctx();renderExtraCause(live,1024,768,'kaleido',g,settings);assert.ok(live.calls.length>40,`pattern ${v+1} draws`);finishCause(g,settings);const after=ctx();renderExtraCause(after,1024,768,'kaleido',g,settings);assert.equal(after.calls.length,0);}});
test('the same round draws the same frame, and a new round changes the details',()=>{for(let v=0;v<N;v++){const frame=completed=>{const g=setup();g.completed=completed;g.nextVariant=v;beginCause(g,settings);g.time=5;const c=ctx();renderExtraCause(c,800,600,'kaleido',g,settings);return JSON.stringify(c.calls);};assert.equal(frame(0),frame(0));assert.notEqual(frame(0),frame(1),`pattern ${v+1}`);}});
test('changing the duration mid-pattern recomposes the music and continues from the same moment',()=>{const g=setup();g.nextVariant=4;beginCause(g,settings);g.time=3;const before=g.time/g.duration;retimeCause(g,{...settings,duration:12},12);assert.equal(g.duration,12);assert.deepEqual(g.score,kaleidoScore(4,12,0));assert.ok(Math.abs(g.time/12-before)<1e-9);const next=g.score[g.soundEvent];assert.ok(next.at>before&&(g.soundEvent===0||g.score[g.soundEvent-1].at<=before+1e-6));});

// A minimal Web Audio stand-in that checks what the synthesiser asks for.
function mockAudio(){const nodes=[],problems=[];let id=0;
 const param=(name,v=0)=>({value:v,events:[],setValueAtTime(x,t){this.check(x,t,name);this.events.push(['set',x,t]);},linearRampToValueAtTime(x,t){this.check(x,t,name);this.events.push(['lin',x,t]);},exponentialRampToValueAtTime(x,t){this.check(x,t,name);if(!(x>0))problems.push(`${name}: exponential ramp to ${x}`);this.events.push(['exp',x,t]);},setTargetAtTime(x,t,c){this.check(x,t,name);if(!(c>0))problems.push(`${name}: time constant ${c}`);},cancelScheduledValues(){},check(x,t){if(!Number.isFinite(x)||!Number.isFinite(t)||t<0)problems.push(`${name}: ${x} at ${t}`);}});
 const node=(type,params=[])=>{const n={type,id:id++,out:new Set(),connect(d){if(!d)problems.push(type+': connect to nothing');this.out.add(d);return d;},disconnect(){this.out.clear();}};for(const p of params)n[p]=param(type+'.'+p,p==='gain'?1:0);nodes.push(n);return n;};
 const source=(type,params)=>{const n=node(type,params);n.start=t=>{if(!Number.isFinite(t))problems.push(type+' start '+t);n.t0=t;};n.stop=t=>{if(!Number.isFinite(t))problems.push(type+' stop '+t);if(n.t0!==undefined&&t<n.t0-1e-9&&!n.stopped)problems.push(`${type} stops before it starts`);n.stopped=true;};return n;};
 const ctx={sampleRate:48000,currentTime:0,destination:node('destination'),
  createGain:()=>node('gain',['gain']),createOscillator:()=>Object.assign(source('osc',['frequency','detune']),{type:'sine',setPeriodicWave(w){if(!w||!w.periodic)problems.push('osc: invalid periodic wave');}}),createPeriodicWave:(re,im,opts)=>{if(re.length!==im.length||!(re.length>1))problems.push('periodic wave: bad arrays');return {periodic:true,opts};},createBiquadFilter:()=>node('biquad',['frequency','Q','gain']),createStereoPanner:()=>node('panner',['pan']),createDelay:()=>node('delay',['delayTime']),createConvolver:()=>node('convolver'),
  createDynamicsCompressor:()=>node('compressor',['threshold','knee','ratio','attack','release']),createBufferSource:()=>source('buffer',['playbackRate']),
  createBuffer:(ch,len,rate)=>{const data=Array.from({length:ch},()=>new Float32Array(len));return {length:len,duration:len/rate,sampleRate:rate,numberOfChannels:ch,getChannelData:i=>data[i]};}};
 return {ctx,nodes,problems};}
test('the synthesiser plays every instrument with valid automation, and a stop fades the whole group',()=>{const {ctx,nodes,problems}=mockAudio(),master=ctx.createGain(),syn=createSynth(ctx,master);
 // Every instrument but the nature, firework and cartoon recordings and the horns, which are silent until decoded (checked below).
 // Detectius de sons (0.48): its twenty recorded instruments (ds…) are strict too.
 const SILENT=[...SYNTH_INSTRUMENTS.filter(x=>x.startsWith('ds')),'cincRec','natureRec','fireRec','fizzRec','toonRec','selvaRec','sabanaRec','tamborRec','pouRec','pouPerc','ggRec','uduRec','escletxaRec','crestaRec','hornRec','tromboneRec','pintaRec','masiaRec','vgRec','tocRec'];
 for(const [i,inst] of SYNTH_INSTRUMENTS.filter(x=>!SILENT.includes(x)).entries()){const n=syn.play({inst,midi:[48+i,55+i,62+i],vel:.6,pan:.2,spread:.5,strum:.03,glide:inst==='flute'?67:undefined,vowel:'o',cut:[400,2000]},.1*i,1.2);assert.equal(n,3,inst);}
 assert.equal(syn.play({inst:'theremin',midi:[60]},0,1),0,'unknown instruments are ignored');assert.equal(syn.play({inst:'bell',midi:[60]},0,0),0,'empty notes are ignored');
 assert.ok(syn.active()>0);const out=nodes.find(n=>n.type==='gain'&&n.out.has(master));assert.ok(out,'the group feeds the master volume');syn.stop(.03);assert.equal(syn.active(),0,'a new group starts empty');assert.ok(out.gain.events.some(e=>e[0]==='lin'&&e[1]===0),'fade to silence');
 // Sustained layers can come back after a pause with a fade-in.
 for(const inst of SYNTH_SUSTAINED.filter(x=>!SILENT.includes(x)))assert.ok(syn.play({inst,midi:[50],vel:.5},0,2,{fadeIn:.4})>0);
 // A nature, firework or cartoon recording has no built-in equivalent: until it is decoded it is silent.
 assert.equal(syn.play({inst:'natureRec',midi:[60],vel:.5,variant:'brook'},0,2,{fadeIn:.4}),0);
 assert.equal(syn.play({inst:'fireRec',midi:[60],vel:.4,variant:'boom'},0,2),0);
 assert.equal(syn.play({inst:'toonRec',midi:[60],vel:.4,variant:'boing'},0,2),0);
 assert.equal(syn.play({inst:'selvaRec',midi:[60],vel:.4,variant:'tuca'},0,2),0);
 assert.equal(syn.play({inst:'sabanaRec',midi:[60],vel:.4,variant:'zebra'},0,2),0);assert.equal(syn.play({inst:'tamborRec',midi:[60],vel:.4,variant:'baix'},0,2),0);
 for(const [inst,variant] of [['pouRec','mamut'],['pouPerc','pedra'],['uduRec',undefined],['escletxaRec',undefined],['crestaRec',undefined]])assert.equal(syn.play({inst,midi:[50],vel:.4,variant},0,2),0,inst);
 // Nor do the horns have one: an organ would stand in for them, so they wait for their recordings.
 for(const inst of ['hornRec','tromboneRec'])assert.equal(syn.play({inst,midi:[50,53,57],vel:.5},0,2),0,inst);assert.equal(syn.play({inst:'fizzRec',midi:[60],vel:.3,variant:'fizz'},0,2,{fadeIn:.4}),0);
 // Pads and choirs share one voice per chord: far fewer nodes than one per note.
 const before=nodes.length;syn.play({inst:'pad',midi:[50,54,57,61,64],vel:.5},0,2);assert.ok(nodes.length-before<=24,`${nodes.length-before} nodes for a five-note pad`);
 assert.deepEqual(problems,[]);});
test('a chord answers the press, and long pieces keep a steady pace',()=>{for(let index=0;index<N;index++){const a=kaleidoGrid(8,KALEIDO_ART[index].steps),b=kaleidoGrid(15,KALEIDO_ART[index].steps);assert.ok(a.step>.25&&a.step<.5);assert.ok(b.step>.25&&b.step<.5,'longer effects get more steps, not slower ones');const first=kaleidoScore(index,8).filter(e=>e.at===0);assert.ok(first.some(e=>e.midi.length>=2),'a chord answers the press');}});

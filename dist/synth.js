// Instruments for Caleidoscopi, Vitralls and Natura. The built-in ones are made only from Web Audio nodes; Natura's recorded instruments
// (sampler.js) play notes of real instruments. Shared by the app and by tools/render-review.mjs.
// Each press gets its own group (reverb, echo and a gentle compressor) so a pause or a new press can silence it at once.
import {SAMPLE_BANK,SAMPLE_INSTRUMENTS,sampleZone} from './sampler.js';
export const SYNTH_INSTRUMENTS=Object.freeze(['pad','choir','bell','chime','glass','celesta','kalimba','marimba','pluck','harp','flute','bass','sub','shimmer','shaker','tick','thump','swell',
 'organ','recorder','lute','dulcimer','carillon','tabor','jingle',...SAMPLE_INSTRUMENTS]);
export const SYNTH_SUSTAINED=Object.freeze(['pad','choir','sub','shimmer','bass','organ','violinsRec','celliRec','natureRec','trumpetRec','hornRec','tromboneRec','tubaRec','snareRollRec','fizzRec']);
// Level of the recorded instruments against the built-in ones (the recordings are loudness-matched to each other).
const SAMPLE_LEVEL=1.4;
// Pads, choirs and the organ play a whole chord as one voice (shared filters, panners and envelope), which keeps the node count low.
const SYN_CHORDAL=['pad','choir','organ'];
const SYN_SEND={pad:[.35,0],choir:[.45,0],bell:[.4,.18],chime:[.45,.2],glass:[.5,.15],celesta:[.35,.2],kalimba:[.3,.22],marimba:[.25,.12],pluck:[.3,.2],harp:[.4,.15],flute:[.35,.12],bass:[.08,0],sub:[.05,0],shimmer:[.8,.1],shaker:[.2,0],tick:[.25,.1],thump:[.1,0],swell:[.5,0],
 organ:[.42,.04],recorder:[.35,.14],lute:[.28,.14],dulcimer:[.34,.18],carillon:[.45,.2],tabor:[.12,0],jingle:[.2,.06]};
const SYN_VOWELS={a:[800,1150,2900],o:[450,800,2830],u:[325,700,2530],e:[400,1600,2700]};
const synFreq=m=>440*2**((m-69)/12);
const synClamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const SYN_CACHE=new WeakMap();
function synStore(ctx){let s=SYN_CACHE.get(ctx);if(!s){s={pluck:new Map()};SYN_CACHE.set(ctx,s);}return s;}
// Room reverb: 2.4 s of stereo noise with an exponential decay that also darkens over time.
function synImpulse(ctx){const s=synStore(ctx);if(s.ir)return s.ir;const rate=ctx.sampleRate,n=Math.floor(rate*2.4),buf=ctx.createBuffer(2,n,rate);let seed=12345;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1;};
 for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);let lp=0;for(let i=0;i<n;i++){const x=i/n,a=.15+.8*x;lp=lp*a+rnd()*(1-a);d[i]=lp*Math.pow(1-x,2.4)*(i<rate*.015?i/(rate*.015):1)*1.6;}}
 return s.ir=buf;}
// Harmonic tones in a single oscillator: a periodic wave with the given amplitudes of partials 1, 2, 3..., computed once per context.
function synWave(ctx,key,amps){if(!ctx.createPeriodicWave)return null;const s=synStore(ctx);s.waves??=new Map();if(s.waves.has(key))return s.waves.get(key);
 const real=new Float32Array(amps.length+1),imag=new Float32Array(amps.length+1);amps.forEach((a,i)=>{imag[i+1]=a;});const w=ctx.createPeriodicWave(real,imag,{disableNormalization:true});s.waves.set(key,w);return w;}
function synNoise(ctx){const s=synStore(ctx);if(s.noise)return s.noise;const n=ctx.sampleRate*2,buf=ctx.createBuffer(1,n,ctx.sampleRate),d=buf.getChannelData(0);let seed=777;for(let i=0;i<n;i++){seed=(seed*16807)%2147483647;d[i]=seed/2147483647*2-1;}return s.noise=buf;}
// Plucked string (Karplus–Strong), computed once per pitch and context. The playback rate corrects the integer delay.
// Per kind: how bright the excitation is, the damping of each pass and the length of the buffer (s).
const SYN_STRINGS={pluck:[1,.9965,2.4],harp:[.45,.9985,3.2],lute:[.7,.9972,2.2]};
function synPluck(ctx,midi,kind){const s=synStore(ctx),key=midi+kind;if(s.pluck.has(key))return s.pluck.get(key);const [mix,damp,secs]=SYN_STRINGS[kind],rate=ctx.sampleRate,f=synFreq(midi),N=Math.max(2,Math.floor(rate/f)),len=Math.floor(rate*secs),buf=ctx.createBuffer(1,len,rate),d=buf.getChannelData(0);let seed=midi*7919+1,lp=0;
 for(let i=0;i<N;i++){seed=(seed*16807)%2147483647;const w=seed/2147483647*2-1;lp=lp*(1-mix)+w*mix;d[i]=lp;}
 let peak=0;for(let i=N;i<len;i++){d[i]=damp*.5*(d[i-N]+d[i>N?i-N-1:N-1]);}for(let i=0;i<len;i++)peak=Math.max(peak,Math.abs(d[i]));for(let i=0;i<len;i++)d[i]/=peak||1;
 const v={buf,rate:f*(N+.5)/rate};s.pluck.set(key,v);return v;}
export function createSynth(ctx,destination){
 let group=null;
 function open(){if(group)return group;const t=ctx.currentTime,out=ctx.createGain(),comp=ctx.createDynamicsCompressor(),bus=ctx.createGain(),rev=ctx.createGain(),dly=ctx.createGain(),conv=ctx.createConvolver();
  comp.threshold.value=-16;comp.knee.value=14;comp.ratio.value=3;comp.attack.value=.012;comp.release.value=.35;out.gain.setValueAtTime(1,t);
  bus.connect(comp);conv.buffer=synImpulse(ctx);rev.connect(conv);const wet=ctx.createGain();wet.gain.value=.7;conv.connect(wet);wet.connect(comp);
  // Echo: two delay lines a fifth apart in time, panned left and right, each darkening on every repeat.
  for(const [time,side] of [[.36,-.6],[.54,.6]]){const d=ctx.createDelay(1),fb=ctx.createGain(),lp=ctx.createBiquadFilter(),g=ctx.createGain();d.delayTime.value=time;fb.gain.value=.33;lp.type='lowpass';lp.frequency.value=2600;g.gain.value=.5;dly.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=side;lp.connect(p);p.connect(g);}else lp.connect(g);g.connect(comp);}
  comp.connect(out);out.connect(destination);return group={out,bus,rev,dly,sources:new Set(),sends:new Map()};}
 // Each voice disconnects its output once all its sources have ended, so finished notes cost nothing.
 let current=null;
 function src(g,node,t,end,offset=0){if(offset>0)node.start(t,offset);else node.start(t);node.stop(end);g.sources.add(node);const v=current;if(v)v.live++;node.onended=()=>{g.sources.delete(node);if(v&&--v.live===0){try{v.out.disconnect();}catch{}}};return node;}
 // Reverb and echo sends are shared by every voice with the same levels.
 function send(g,rv,dl){const key=rv+'|'+dl;let n=g.sends.get(key);if(!n){n=gain(1);if(rv>0){const r=gain(rv);n.connect(r);r.connect(g.rev);}if(dl>0){const d=gain(dl);n.connect(d);d.connect(g.dly);}g.sends.set(key,n);}return n;}
 function osc(g,type,freq,t,end,detune=0){const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t);if(detune)o.detune.setValueAtTime(detune,t);return src(g,o,t,end);}
 // An oscillator with a periodic wave (a plain sine where periodic waves are not available).
 function wave(g,key,amps,freq,t,end,detune=0){const o=osc(g,'sine',freq,t,end,detune),w=synWave(ctx,key,amps);if(w&&o.setPeriodicWave)o.setPeriodicWave(w);return o;}
 function gain(v=0){const n=ctx.createGain();n.gain.value=v;return n;}
 // Attack, decay to a sustain level, hold until the note ends, then release.
 function adsr(p,t,len,peak,a,d,s,r){p.setValueAtTime(0,t);p.linearRampToValueAtTime(peak,t+a);p.setTargetAtTime(peak*s,t+a,Math.max(.01,d/3));p.setTargetAtTime(0,t+Math.max(a,len),Math.max(.01,r/3));return t+Math.max(a,len)+r*1.6;}
 function strike(p,t,peak,decay,a=.004){p.setValueAtTime(0,t);p.linearRampToValueAtTime(peak,t+a);p.exponentialRampToValueAtTime(.0001,t+a+Math.max(.02,decay));return t+a+decay+.05;}
 function voice(g,inst,midi,t,len,vel,pan,e,fadeIn){
  // A recorded instrument whose samples are not decoded yet hands the note to its built-in fallback.
  // A recording with no built-in equivalent (a nature sound) is simply left out until it is decoded.
  const rec=SAMPLE_BANK[inst],zone=rec?sampleZone(inst,[].concat(midi)[0],e.variant):null;if(rec&&!zone){if(!rec.fallback)return null;inst=rec.fallback;}
  const notes=[].concat(midi),f=synFreq(notes[0]),amp=gain(0);let out=amp;if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=synClamp(pan,-1,1);amp.connect(p);out=p;}out.connect(g.bus);
  const [rv,dl]=zone?rec.send:SYN_SEND[inst]||[.3,0];out.connect(send(g,e.rev??rv,e.dly??dl));current={live:0,out};
  const A=x=>fadeIn>0?Math.max(x,fadeIn):x;let end;
  if(zone)end=recorded(g,rec,zone,notes[0],t,len,vel,amp,e,fadeIn);
  else if(inst==='pad'){end=adsr(amp.gain,t,len,.12*vel,A(.6),.8,.85,.9);const c0=e.cut?.[0]??500,c1=e.cut?.[1]??2200,tri=gain(.3);
   // One detuned saw per side through its own filter and panner: a wide pad with two filters per chord, not per note.
   const sides=[[-9,-.7],[9,.7]].map(([det,side])=>{const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=.7;lp.frequency.setValueAtTime(c0,t);lp.frequency.exponentialRampToValueAtTime(c1,t+Math.max(.1,len*.7));let o2=lp;if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=side;lp.connect(p);o2=p;}o2.connect(amp);tri.connect(lp);return [det,lp];});
   for(const m of notes){const fm=synFreq(m);for(const [det,lp] of sides)osc(g,'sawtooth',fm,t,end,det).connect(lp);osc(g,'triangle',fm*.5,t,end).connect(tri);}}
  else if(inst==='choir'){const mix=gain(.5),[f1,f2,f3]=SYN_VOWELS[e.vowel||'a'];end=adsr(amp.gain,t,len,.5*vel,A(.7),.6,.9,1);const lfo=osc(g,'sine',5.1,t,end),depth=gain(7);lfo.connect(depth);
   // Two slightly detuned voices per note; the whole chord shares one vibrato and one set of three formant filters (a sung vowel).
   for(const m of notes)for(const det of [-7,6]){const o=osc(g,'sawtooth',synFreq(m),t,end,det);depth.connect(o.detune);o.connect(mix);}for(const [ff,gg] of [[f1,1],[f2,.55],[f3,.22]]){const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=ff;bp.Q.value=7;const n=gain(gg);mix.connect(bp);bp.connect(n);n.connect(amp);}}
  else if(inst==='bell'||inst==='chime'){const ratio=e.ratio??(inst==='bell'?3.5:1.41),decay=Math.min(inst==='bell'?3.4:2,len+1.2);end=strike(amp.gain,t,(inst==='bell'?.2:.16)*vel,decay);const mod=osc(g,'sine',f*ratio,t,end),idx=gain(0);idx.gain.setValueAtTime(f*(inst==='bell'?4:2.2)*vel,t);idx.gain.exponentialRampToValueAtTime(f*.15,t+decay*.6);mod.connect(idx);const car=osc(g,'sine',f,t,end);idx.connect(car.frequency);car.connect(amp);}
  else if(inst==='glass'||inst==='celesta'||inst==='kalimba'||inst==='marimba'){const parts={glass:[[1,1,2.6],[2.76,.36,1.1]],celesta:[[1,1,1.4],[4,.32,.3]],kalimba:[[1,1,1.1],[5.95,.22,.14]],marimba:[[1,1,.8],[4,.42,.13]]}[inst],peak={glass:.17,celesta:.2,kalimba:.24,marimba:.26}[inst];amp.gain.value=1;end=t;
   for(const [mul,g0,dec] of parts){const n=gain(0),e2=strike(n.gain,t,peak*g0*vel,Math.min(dec*(inst==='glass'?1.3:1),len+dec));end=Math.max(end,e2);const o=osc(g,'sine',f*mul,t,e2);if(inst==='kalimba'&&mul===1){o.frequency.setValueAtTime(f*1.025,t);o.frequency.exponentialRampToValueAtTime(f,t+.03);}o.connect(n);n.connect(amp);}}
  else if(inst==='pluck'||inst==='harp'){const soft=inst==='harp',{buf,rate}=synPluck(ctx,midi,inst),b=ctx.createBufferSource(),lp=ctx.createBiquadFilter();b.buffer=buf;b.playbackRate.value=rate;lp.type='lowpass';lp.frequency.value=soft?2400:4200;b.connect(lp);lp.connect(amp);const hold=Math.min(len,buf.duration/rate);end=adsr(amp.gain,t,hold,(soft?.36:.32)*vel,.003,.01,1,.35);src(g,b,t,end);}
  else if(inst==='flute'){end=adsr(amp.gain,t,len,.16*vel,A(.09),.25,.85,.25);const o=osc(g,'sine',f,t,end),tri=osc(g,'triangle',f,t,end),tg=gain(.22),vib=osc(g,'sine',4.8,t,end),vd=gain(0);vd.gain.setValueAtTime(0,t);vd.gain.linearRampToValueAtTime(9,t+Math.min(.6,len));vib.connect(vd);vd.connect(o.detune);vd.connect(tri.detune);
   if(e.glide!==undefined){const target=synFreq(e.glide);for(const x of [o,tri]){x.frequency.setValueAtTime(f,t+len*.15);x.frequency.exponentialRampToValueAtTime(target,t+len*.85);}}
   o.connect(amp);tri.connect(tg);tg.connect(amp);const nb=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=gain(.05);nb.buffer=synNoise(ctx);nb.loop=true;bp.type='bandpass';bp.frequency.value=f*2;bp.Q.value=2;nb.connect(bp);bp.connect(ng);ng.connect(amp);src(g,nb,t,end);}
  else if(inst==='bass'){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.connect(amp);end=adsr(amp.gain,t,len,.3*vel,A(.025),.4,.7,.3);osc(g,'triangle',f,t,end).connect(lp);const n=gain(.7);osc(g,'sine',f,t,end).connect(n);n.connect(lp);}
  else if(inst==='sub'){end=adsr(amp.gain,t,len,.26*vel,A(.5),.5,1,.7);osc(g,'sine',f,t,end).connect(amp);const n=gain(.25);osc(g,'triangle',f*2,t,end,3).connect(n);n.connect(amp);}
  else if(inst==='shimmer'){const trem=gain(.7),lfo=osc(g,'sine',5.5,t,t+len+1.2),depth=gain(.3);lfo.connect(depth);depth.connect(trem.gain);trem.connect(amp);end=adsr(amp.gain,t,len,.06*vel,A(.5),.5,.9,.8);for(const [mul,det] of [[1,0],[2,5],[3,-4]])osc(g,'sine',f*mul,t,end,det).connect(trem);}
  else if(inst==='shaker'||inst==='tick'||inst==='swell'){const nb=ctx.createBufferSource(),flt=ctx.createBiquadFilter();nb.buffer=synNoise(ctx);nb.loop=true;nb.connect(flt);flt.connect(amp);
   if(inst==='shaker'){flt.type='bandpass';flt.frequency.value=7200;flt.Q.value=1.4;end=strike(amp.gain,t,.11*vel,.09,.006);}
   else if(inst==='tick'){flt.type='highpass';flt.frequency.value=2500;end=strike(amp.gain,t,.07*vel,.03,.002);const n=gain(0),e2=strike(n.gain,t,.1*vel,.06,.002);const o=osc(g,'sine',f,t,e2);o.frequency.exponentialRampToValueAtTime(f*.7,t+.05);o.connect(n);n.connect(amp);end=Math.max(end,e2);}
   else {flt.type='bandpass';flt.Q.value=1.3;flt.frequency.setValueAtTime(320,t);flt.frequency.exponentialRampToValueAtTime(4200,t+len*.9);amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(.07*vel,t+len*.85);amp.gain.linearRampToValueAtTime(0,t+len+.25);end=t+len+.3;}
   src(g,nb,t,end);}
  else if(inst==='thump'){end=strike(amp.gain,t,.38*vel,.4,.004);const o=osc(g,'sine',f,t,end);o.frequency.exponentialRampToValueAtTime(Math.max(30,f*.45),t+.22);o.connect(amp);}
  // Portative organ: four drawbar partials per note (shared partial levels), a light tremulant and a soft attack.
  else if(inst==='organ'){end=adsr(amp.gain,t,len,.125*vel,A(.07),.3,.9,.4);const trem=gain(.88),lfo=osc(g,'sine',5.6,t,end),depth=gain(.1);lfo.connect(depth);depth.connect(trem.gain);trem.connect(amp);
   // One oscillator per note carries the four flue partials (8', 4', 2 2/3' and 2'); the tremulant moves the whole chord.
   for(const m of notes)wave(g,'organ',[1,.5,.26,.18],synFreq(m),t,end).connect(trem);}
  // Recorder: a pure tone with a little second harmonic, a breathy chiff at the start and a late, narrow vibrato.
  else if(inst==='recorder'){end=adsr(amp.gain,t,len,.22*vel,A(.035),.2,.9,.12);const o=wave(g,'recorder',[1,.15,.01,0,.003],f,t,end),vib=osc(g,'sine',4.6,t,end),vd=gain(0);vd.gain.setValueAtTime(0,t+Math.min(.35,len*.5));vd.gain.linearRampToValueAtTime(6,t+Math.min(.8,len));vib.connect(vd);vd.connect(o.detune);
   if(e.glide!==undefined){o.frequency.setValueAtTime(f,t+len*.2);o.frequency.exponentialRampToValueAtTime(synFreq(e.glide),t+len*.85);}
   o.connect(amp);const nb=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=gain(0);nb.buffer=synNoise(ctx);nb.loop=true;bp.type='bandpass';bp.frequency.value=Math.min(9000,f*3);bp.Q.value=3;strike(ng.gain,t,.5*vel,.05,.004);nb.connect(bp);bp.connect(ng);ng.connect(amp);src(g,nb,t,t+.12);}
  // Lute: a plucked string with a mellower attack than the bright pluck.
  else if(inst==='lute'){const {buf,rate}=synPluck(ctx,midi,'lute'),b=ctx.createBufferSource(),lp=ctx.createBiquadFilter();b.buffer=buf;b.playbackRate.value=rate;lp.type='lowpass';lp.frequency.value=3000;b.connect(lp);lp.connect(amp);const hold=Math.min(len,buf.duration/rate);end=adsr(amp.gain,t,hold,.46*vel,.004,.01,1,.3);src(g,b,t,end);}
  // Hammered dulcimer: two bright strings a few cents apart, struck together.
  else if(inst==='dulcimer'){const {buf,rate}=synPluck(ctx,midi,'pluck'),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;lp.connect(amp);const hold=Math.min(len,buf.duration/rate);end=adsr(amp.gain,t,hold,.28*vel,.002,.01,1,.4);
   for(const cents of [-5,5]){const b=ctx.createBufferSource();b.buffer=buf;b.playbackRate.value=rate*2**(cents/1200);b.connect(lp);src(g,b,t,end);}}
  // Carillon: bell partials with their own decays: the hum, the prime with its nominal and upper partial, and a faint tierce.
  else if(inst==='carillon'){amp.gain.value=1;end=t;for(const [mul,amps,lv,dec] of [[.5,null,.3,3],[1,[1,.38,.08],1,2.3],[1.2,null,.1,1.5]]){const n=gain(0),e2=strike(n.gain,t,.18*lv*vel,Math.min(dec,len+dec));end=Math.max(end,e2);(amps?wave(g,'carillon',amps,f*mul,t,e2):osc(g,'sine',f*mul,t,e2)).connect(n);n.connect(amp);}}
  // Tabor: a small frame drum, a falling low tone with a short skin noise.
  else if(inst==='tabor'){end=strike(amp.gain,t,.44*vel,.3,.003);const o=osc(g,'sine',140,t,end);o.frequency.exponentialRampToValueAtTime(72,t+.18);o.connect(amp);const nb=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),ng=gain(0);nb.buffer=synNoise(ctx);bp.type='bandpass';bp.frequency.value=900;bp.Q.value=.8;strike(ng.gain,t,.5,.06,.002);nb.connect(bp);bp.connect(ng);ng.connect(amp);src(g,nb,t,t+.1);}
  // Jingle: three quick high noise bursts, like the jingles of a tambourine.
  else if(inst==='jingle'){const nb=ctx.createBufferSource(),hp=ctx.createBiquadFilter();nb.buffer=synNoise(ctx);nb.loop=true;hp.type='highpass';hp.frequency.value=6500;nb.connect(hp);amp.gain.value=1;end=t;for(const [dt,lv] of [[0,1],[.019,.6],[.036,.4]]){const n=gain(0);end=Math.max(end,strike(n.gain,t+dt,.12*lv*vel,.08,.002));hp.connect(n);n.connect(amp);}src(g,nb,t,end);}
  else {current=null;return null;}
  current=null;return end;}
 // Recorded note: the nearest sample, retuned by its playback rate. Sustained instruments loop the steady part of the note when it has to
 // last longer than the recording; plucked and struck ones ring on for a while (ring) or as recorded, and damped ones (pizzicato) stop with the note.
 function recorded(g,rec,z,m,t,len,vel,amp,e,fadeIn){const b=ctx.createBufferSource(),rate=rec.pitched?2**((m-z.midi-(z.tune||0)/100)/12):1,rel=rec.release;
  // A long loop (a nature sound) can start anywhere inside it, so two voices of one recording do not sound alike.
  const off=(z.offset||0)+z.shift+(e.start&&z.loopEnd?(e.start%(z.loopEnd-z.loopStart)):0);
  b.buffer=z.buffer;b.playbackRate.value=rate;b.connect(amp);
  if(e.glide!==undefined&&rec.pitched){b.playbackRate.setValueAtTime(rate,t+len*.15);b.playbackRate.exponentialRampToValueAtTime(rate*2**((e.glide-m)/12),t+len*.85);}
  // Velocity is quadratic, as with real players: half the velocity is a quarter of the level.
  const level=SAMPLE_LEVEL*rec.gain*(z.gain||1)*vel*vel,attack=rec.sustain?Math.max(rec.attack||.025,fadeIn):.002;amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(level,t+attack);
  const natural=t+(z.buffer.duration-off)/rate;let end=natural;
  if(rec.sustain||rec.damp||rec.ring){if(rec.sustain&&z.loopEnd&&len+rel>(z.loopEnd-z.offset)/rate-.02){b.loop=true;b.loopStart=z.loopStart+z.shift;b.loopEnd=z.loopEnd+z.shift;}
   const ra=t+Math.max(len,attack*2)+(rec.ring||0);amp.gain.setTargetAtTime(0,ra,rel/5);end=b.loop?ra+rel*1.3:Math.min(natural,ra+rel*1.3);}
  src(g,b,t,end+.02,off);return end+.02;}
 return {
  // e: {inst, midi:[...], vel, pan, spread, strum, rev, dly, glide, vowel, ratio, cut}
  play(e,when,length,{fadeIn=0}={}){if(!SYNTH_INSTRUMENTS.includes(e.inst)||!(length>0))return 0;const g=open(),n=e.midi.length;let count=0;
   if(SYN_CHORDAL.includes(e.inst))return voice(g,e.inst,e.midi,when,length,synClamp(e.vel??.6,0,1),e.pan||0,e,fadeIn)?n:0;
   e.midi.forEach((m,j)=>{const pan=(e.pan||0)+(n>1?(j/(n-1)-.5)*2*(e.spread||0):0);if(voice(g,e.inst,m,when+(e.strum||0)*j,length,synClamp(e.vel??.6,0,1),pan,e,fadeIn))count++;});return count;},
  // Fades the current group out (pause, new press or the end of an effect) and lets a fresh group take the next notes.
  stop(fade=.03,at=ctx.currentTime){if(!group)return;const g=group,t=at;group=null;g.out.gain.cancelScheduledValues(t);g.out.gain.setValueAtTime(g.out.gain.value,t);g.out.gain.linearRampToValueAtTime(0,t+fade);
   for(const s of g.sources){try{s.stop(t+fade+.02);}catch{}}const timer=ctx.createBufferSource();timer.buffer=ctx.createBuffer(1,1,ctx.sampleRate);timer.onended=()=>{try{g.out.disconnect();}catch{}};timer.start(t+fade+.1);},
  active:()=>group?group.sources.size:0
 };
}

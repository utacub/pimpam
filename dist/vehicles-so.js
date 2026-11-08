// El taller de vehicles (EN07, 0.53): the sound. Every sound comes from the banks the suite already has (sampler.js): the small jazz band of
// the room (piano, double bass, brushes on the snare, clarinet) for the music, and the wooden and toy foley of the other activities (the
// claves and the drum for the «clac» of a piece, the toy sounds of Toc toc, the house sounds of the masia) for the gags. Each piece put on
// adds a layer to the music: with the body only the bass walks with the brushes, with the wheels the piano comes in, with the accessory
// the clarinet; the finished vehicle waits on a soft piano vamp, and when it starts the whole band plays until it parks, with a plucked
// cadence at the garage. Nothing was generated anew.
import {SAMPLE_BANK} from './sampler.js';
import {VH_SNAP,VH_GO,VH_GAG,vhTimeline,vhPicks,vhColorOf} from './vehicles.js';
export const VH_LOUD=1,VH_GAG_LOUD=.85;
const vhFit=(inst,m)=>{const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;};
export const vhNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>vhFit(inst,m)),t,len,vel:Math.min(1,vel*VH_LOUD),...x});
// The piece of each corner: key, scale, tempo, beats per bar, the chords by bar (scale degrees), the instruments of the four layers and
// the melody (bars of degrees on a grid of half beats; null is a rest). The room: a light swing in F major.
export const VH_PIECE=Object.freeze({
 habitacio:{root:65,mode:[0,2,4,5,7,9,11],bpm:112,beats:4,grid:2,chords:[0,0,3,3,0,5,1,4],bass:'dsBaix',harm:'dsPiano',mel:'dsClarinet',
  tune:[[4,null,2,4,7,null,4,null],[2,null,null,null,0,null,null,null],[5,null,3,5,9,null,7,5],[4,null,null,null,null,null,2,4],[7,null,9,7,4,null,2,null],[5,null,4,2,0,null,null,null],[1,null,2,4,5,null,4,2],[0,null,null,null,null,null,null,null]]}});
export const vhDeg=(P,d,oct=0)=>P.root+P.mode[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
// The brushes: a soft snare on two and four with a swung tick, and a shaker; fuller for the ride.
function vhPerc(bar,beats,full){const out=[];const H=(inst,variant,t,vel)=>out.push({inst,variant,t,vel});
 H('snareRec','hit',1,.2);H('snareRec','hit',3,.22);H('tamborRec','sonall',0,.16);H('tamborRec','sonall',2,.14);H('tamborRec','sonall',2.67,.1);if(full){H('tamborRec','vora',.67,.14);H('tamborRec','vora',3.67,.12);H('snareRec','hit',bar%2?2.67:1.67,.12);}
 return out.filter(e=>e.t<beats);}
// The walking bass: the root, the third, the fifth and a step to the next chord, swung.
function vhBass(P,ch,next,beats){const walk=[0,2,4,(next-ch+7)%7>3?5:6];return walk.map((d,i)=>({midi:vhDeg(P,ch+d,-2),t:i,len:.85,vel:.5-(i%2)*.06})).filter(e=>e.t<beats);}
// The piano comping: a chord on the «and» of one and on four, with an extra pluck on three in the full band.
function vhHarm(P,ch,beats,bar,full){const out=[];const n=(d,t,len,vel,x={})=>out.push({midi:[].concat(d).map(k=>vhDeg(P,ch+k,0)),t,len,vel,...x});
 n([0,2,4,6],.67,.5,.3,{strum:.02});n([0,2,4,6],3,.45,.27,{strum:.02});if(full)n([2,4,6],1.67,.3,.2,{strum:.02});if(full&&bar%2)n([0,2,4],3.67,.3,.18,{strum:.02});return out.filter(e=>e.t<beats);}
function vhMel(P,bar,beats){const line=P.tune[bar%P.tune.length],out=[];line.forEach((d,i)=>{if(d===null)return;let len=1;for(let k=i+1;k<line.length&&line[k]===null;k++)len++;const t=i/P.grid+((i%2)?.08:0);out.push({midi:vhDeg(P,d,0),t,len:Math.min(len/P.grid,beats-t)*.9,vel:.4+(i===0?.06:0)});});return out;}
const vhSwing=(P,t)=>{const beat=Math.floor(t),f=t-beat;return beat+(f>.6&&f<.73?.67:f);};
// Bars of the band between two moments (seconds), with the layers of k (1 bass and brushes, 2 and the piano, 3 and the clarinet):
// in the wait only the piano vamps softly; in the ride everything plays, fuller.
function vhBand(P,k,from,to,vel=1,{wait=false,full=false,bar0=0}={}){const beat=60/P.bpm,barLen=beat*P.beats,out=[];let bar=bar0;
 for(let tb=from;tb+beat*.5<to;tb+=barLen,bar++){const ch=P.chords[bar%P.chords.length],next=P.chords[(bar+1)%P.chords.length],end=Math.min(to,tb+barLen);
  if(wait){for(const e of vhHarm(P,ch,P.beats,bar,false)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(P.harm,e.midi,t,e.len*beat,e.vel*.55*vel,{strum:.025}));}continue;}
  if(k>=1){for(const e of vhPerc(bar,P.beats,full)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(e.inst,[0],t,.25,e.vel*vel,{variant:e.variant}));}
   for(const e of vhBass(P,ch,next,P.beats)){const t=tb+e.t*beat;if(t<end)out.push(vhNote(P.bass,e.midi,t,e.len*beat,e.vel*vel));}}
  if(k>=2)for(const e of vhHarm(P,ch,P.beats,bar,full)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(P.harm,e.midi,t,e.len*beat,e.vel*vel,e.strum?{strum:e.strum}:{}));}
  if(k>=3)for(const e of vhMel(P,bar,P.beats)){const t=tb+e.t*beat;if(t<end)out.push(vhNote(P.mel,e.midi,t,Math.min(e.len*beat,end-t),e.vel*vel));}}
 return out;}
// The cadence: a plucked bass note and two piano chords (the dominant and the tonic), never a held wind note.
function vhCadence(P,at,vel=1){const beat=60/P.bpm;return [vhNote(P.bass,vhDeg(P,4,-2),at,.9,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0),vhDeg(P,1,1),vhDeg(P,3,1)],at,.8,.3*vel,{strum:.03}),vhNote(P.bass,vhDeg(P,0,-2),at+beat*1.5,1.6,.52*vel),vhNote(P.harm,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0),vhDeg(P,7,0)],at+beat*1.5,1.8,.34*vel,{strum:.04})];}
// The «clac» of a piece that clicks on the chassis: the claves and the rim of the drum together.
export const VH_CLAC=Object.freeze([{inst:'woodblockRec',variant:'claves',vel:.5,dt:0},{inst:'tamborRec',variant:'vora',vel:.38,dt:.012}]);
const vhClac=(at,vel=1)=>VH_CLAC.map(e=>vhNote(e.inst,[0],at+e.dt,.25,e.vel*vel,{variant:e.variant}));
// The step of a pick (not the last): the piece lands with its «clac» at VH_SNAP*.62 and the band plays one bar with its new layer.
export function vhStepScore(corner,k,round=0){const P=VH_PIECE[corner]||VH_PIECE.habitacio,land=VH_SNAP*.62;return [...vhClac(land),...vhBand(P,k,land+.05,VH_SNAP+1.2,.9,{bar0:(round*2+k)%P.chords.length})].filter(e=>e.t<VH_SNAP-.05);}
// The final pick: the «clac», the soft vamp of the wait, the two claves that start the engine, the band for the whole ride, the sounds of
// the wheels and of the gag of the accessory, and the cadence and the «clac» of the garage. go is the moment of the press (null: alone).
export function vhFinalScore(corner,picks,s,go=null,round=0){const P=VH_PIECE[corner]||VH_PIECE.habitacio,TL=vhTimeline(s,go),land=VH_SNAP*.62,out=[...vhClac(land)];
 const k=picks.top?3:2;out.push(...vhBand(P,k,land+.05,Math.min(TL.start-.3,land+2.4),.9,{bar0:(round*2+k)%P.chords.length}));
 if(TL.start-.3>land+2.6)out.push(...vhBand(P,1,land+2.6,TL.start-.35,1,{wait:true}));
 out.push(vhNote('woodblockRec',[0],TL.start-.42,.2,.42,{variant:'claves'}),vhNote('woodblockRec',[0],TL.start-.21,.2,.5,{variant:'claves'}));
 out.push(...vhBand(P,3,TL.start,TL.rideEnd-.2,1,{full:true}));
 out.push(...vhWheelSounds(picks.wheels,TL),...vhGagSounds(picks.top,TL));
 out.push(...vhCadence(P,TL.rideEnd+.1),...vhClac(TL.rideEnd+.75,.8));if(TL.park>2)out.push(vhNote('pintaRec',[0],TL.rideEnd+1.6,.6,.35,{variant:'campana'}));
 return out.filter(e=>e.t<TL.end-.05).sort((a,b)=>a.t-b.t);}
// The wheels on the floor: the knobbly ones thump softly on every bounce; the wooden ones clack with every turn; the racing ones hiss once at
// the start. All of it quiet, under the band, and only on the floor (after the ramp, the first fifth of the ride).
function vhWheelSounds(kind,TL){const out=[],t0=TL.start+TL.ride*.2,t1=TL.rideEnd-.4;
 if(kind==='fusta')for(let t=t0;t<t1;t+=.46)out.push(vhNote('woodblockRec',[0],t,.12,.13,{variant:'claves'}));
 else if(kind==='tacs')for(let t=t0;t<t1;t+=.62)out.push(vhNote('tamborRec',[0],t,.2,.12,{variant:'baix'}));
 else if(kind==='amples')for(let t=t0;t<t1;t+=.7)out.push(vhNote('toonRec',[0],t,.3,.1,{variant:'boing'}));
 else if(kind==='radis')for(let t=t0;t<t1;t+=.3)out.push(vhNote('woodblockRec',[0],t,.1,.08,{variant:'claves'}));
 else if(kind==='tapacubs')out.push(vhNote('masiaRec',[0],TL.start+.3,.6,.25,{variant:'rafega'}));
 else out.push(vhNote('masiaRec',[0],TL.start+.3,.5,.3,{variant:'whoosh'}),vhNote('masiaRec',[0],TL.start+TL.ride*.55,.5,.22,{variant:'whoosh'}));
 // the ramp: a soft rumble of the drum as the vehicle rolls down
 out.push(vhNote('tamborRec',[0],TL.start+TL.ride*.08,.3,.2,{variant:'mig'}),vhNote('tamborRec',[0],TL.start+TL.ride*.14,.3,.24,{variant:'baix'}));return out;}
// The gag of the accessory: the lid and the three balls; the blocks of the trailer hopping into a tower; the banner and its little bell.
function vhGagSounds(kind,TL){const out=[],G=VH_GAG[kind];if(!G)return out;const tt=u=>TL.start+TL.ride*u;
 if(kind==='baca'){out.push(vhNote('toonRec',[0],tt(G.at),.4,.4,{variant:'doorOpen'}));[0,.03,.06].forEach((d,i)=>{out.push(vhNote('toonRec',[0],tt(G.at+.04+d),.3,.38-i*.05,{variant:'boing'}),vhNote('toonRec',[0],tt(G.at+.12+d*1.3),.3,.26,{variant:'knock'}));});}
 else if(kind==='remolc'){[.08,.22,.36].forEach((u,i)=>{out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*u,.3,.34,{variant:'boing'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*(u+.11),.3,.4,{variant:'knock'}));});}
 else if(kind==='sirena'){const P=VH_PIECE.habitacio;for(let i=0;i<4;i++)out.push(vhNote('dsClarinet',[vhDeg(P,i%2?2:4,0)],tt(G.at)+i*.38,.34,.3));}
 else if(kind==='escala'){[.08,.2,.32].forEach(u=>out.push(vhNote('woodblockRec',[0],TL.rideEnd+TL.park*u,.12,.3,{variant:'claves'})));out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.34,.6,.34,{variant:'stretch'}));}
 else if(kind==='globus'){const P=VH_PIECE.habitacio;out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.12,.6,.35,{variant:'telainfla'}));[0,2,4].forEach((d,i)=>out.push(vhNote('dsPiano',[vhDeg(P,d,1)],TL.rideEnd+TL.park*(.2+i*.07),.5,.3)));out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.7,.5,.3,{variant:'campaneta'}));}
 else{out.push(vhNote('masiaRec',[0],tt(G.at-.12),.6,.4,{variant:'telainfla'}),vhNote('pintaRec',[0],tt(G.at-.02),.6,.4,{variant:'campana'}));}
 return out.map(e=>({...e,vel:Math.min(1,e.vel*VH_GAG_LOUD)}));}
// From seconds to the fractions of the effect that app.js plays (at and length over its duration).
export const vhPattern=(events,D)=>events.filter(e=>e.t<D-.02).map(e=>({inst:e.inst,midi:e.midi,at:e.t/D,length:Math.max(.01,Math.min(e.len,D-e.t))/D,vel:e.vel,...(e.variant?{variant:e.variant}:{}),...(e.strum?{strum:e.strum}:{})}));
// The taste of a piece in focus: a short sound of its own (under 1.2 s).
export function vhTaste(kind,id){const P=VH_PIECE.habitacio;
 if(kind==='body'){const d={familiar:0,autobus:2,furgoneta:3,curses:4,camioneta:1,escarabat:5}[id]||0;return [vhNote('dsPiano',[vhDeg(P,d,0),vhDeg(P,d+2,0),vhDeg(P,d+4,0)],0,.7,.34,{strum:.03})];}
 if(kind==='wheels')return id==='fusta'?[vhNote('woodblockRec',[0],0,.15,.4,{variant:'claves'}),vhNote('woodblockRec',[0],.22,.15,.34,{variant:'claves'})]:id==='primes'?[vhNote('masiaRec',[0],0,.5,.36,{variant:'whoosh'})]:id==='amples'?[vhNote('toonRec',[0],0,.4,.3,{variant:'blub'}),vhNote('toonRec',[0],.3,.4,.26,{variant:'blub'})]:id==='radis'?[0,.14,.28].map(t=>vhNote('woodblockRec',[0],t,.1,.3,{variant:'claves'})):id==='tapacubs'?[vhNote('masiaRec',[0],0,.6,.3,{variant:'rafega'})]:[vhNote('toonRec',[0],0,.4,.38,{variant:'boing'})];
 if(kind==='top')return id==='baca'?[vhNote('toonRec',[0],0,.4,.36,{variant:'clink'})]:id==='remolc'?[vhNote('toonRec',[0],0,.4,.32,{variant:'clatter'})]:id==='sirena'?[vhNote('dsClarinet',[vhDeg(P,4,0)],0,.3,.3),vhNote('dsClarinet',[vhDeg(P,2,0)],.34,.3,.3)]:id==='escala'?[vhNote('woodblockRec',[0],0,.12,.34,{variant:'claves'}),vhNote('toonRec',[0],.2,.5,.3,{variant:'stretch'})]:id==='globus'?[vhNote('toonRec',[0],0,.6,.34,{variant:'inflate'})]:[vhNote('masiaRec',[0],0,.5,.36,{variant:'telainfla'})];
 const d={blau:0,corall:2,groc:4,verd:5,lila:1,taronja:3}[id]||0;return [vhNote('dsPiano',vhDeg(P,d,1),0,.6,.36)];}
// The air of the room by its light: birds through the window in the morning, the meadow in the afternoon, crickets at dusk and at night.
export function vhAmbience(corner,light){const A=(name,level,lowpass=7000)=>({name,level,lowpass});
 if(light==='mati')return [A('blackbird',.12,6000)];if(light==='tarda')return [A('meadow',.1,5500)];if(light==='capvespre')return [A('crickets',.09,5000)];return [A('crickets',.11,4000)];}

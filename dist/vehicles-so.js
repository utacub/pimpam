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
// the melody (bars of degrees on a grid of half beats; null is a rest). The room: a light swing in F major. The living room (0.56): a brass
// march in B flat, straight (no swing), the tuba on one and three, the horn on two and four, the trumpet with the tune and a glockenspiel bell.
// The yard (0.57): a work song in D dorian at 100, the claves hammering, the cello plucked, the bassoon answering on the off-beats and the marimba.
// The hallway (0.58): a train song in G at 126, the brush chugging in eighths, the bass walking in quarters, short violin chords off the beat,
// the harp with the tune and a triangle on the fourth beat.
export const VH_PIECE=Object.freeze({
 habitacio:{root:65,mode:[0,2,4,5,7,9,11],bpm:112,beats:4,grid:2,chords:[0,0,3,3,0,5,1,4],bass:'dsBaix',harm:'dsPiano',mel:'dsClarinet',
  tune:[[4,null,2,4,7,null,4,null],[2,null,null,null,0,null,null,null],[5,null,3,5,9,null,7,5],[4,null,null,null,null,null,2,4],[7,null,9,7,4,null,2,null],[5,null,4,2,0,null,null,null],[1,null,2,4,5,null,4,2],[0,null,null,null,null,null,null,null]]},
 sala:{root:70,mode:[0,2,4,5,7,9,11],bpm:116,beats:4,grid:2,style:'marxa',chords:[0,0,3,4,0,3,4,0],bass:'dsTuba',harm:'dsTrompa',mel:'dsTrompeta',bell:'dsGlock',
  tune:[[0,null,0,null,4,null,4,null],[7,null,null,null,4,null,null,null],[5,null,3,null,4,null,2,null],[1,null,null,null,null,null,null,null],[0,null,2,null,4,null,7,null],[6,null,5,null,4,null,null,null],[2,null,4,null,1,null,3,null],[0,null,null,null,null,null,null,null]]},
 pati:{root:62,mode:[0,2,3,5,7,9,10],bpm:100,beats:4,grid:2,style:'obres',chords:[0,0,3,0,6,0,3,4],bass:'dsCello',harm:'dsFagot',mel:'dsMarimba',
  tune:[[0,null,2,null,4,null,2,null],[0,null,null,null,6,null,null,null],[2,null,3,null,4,null,6,null],[4,null,null,null,null,null,null,null],[7,null,6,null,4,null,2,null],[3,null,2,null,0,null,null,null],[2,null,4,null,3,null,1,null],[0,null,null,null,null,null,null,null]]},
 passadis:{root:67,mode:[0,2,4,5,7,9,11],bpm:126,beats:4,grid:2,style:'tren',chords:[0,0,3,4,0,5,3,4],bass:'dsBaix',harm:'dsVioli',mel:'dsArpa',bell:'dsTriangle',
  tune:[[4,4,5,4,7,null,4,null],[2,null,4,2,0,null,null,null],[5,5,6,5,9,null,7,null],[4,null,2,4,5,null,null,null],[7,7,9,7,11,null,9,null],[6,null,4,6,7,null,null,null],[2,2,4,5,4,null,2,null],[0,null,null,null,null,null,null,null]]},
 // the bathroom (0.59): a barcarolle in 6/8 (the grid is the quaver: six a bar at 252, a dotted crotchet at 84), E flat major, marimba
 // bass on one and four, harp arpeggios on every quaver, glockenspiel tune, a long flute note every other bar
 bany:{root:63,mode:[0,2,4,5,7,9,11],bpm:252,beats:6,grid:1,style:'aigua',chords:[0,0,3,4,0,5,3,4],bass:'dsMarimba',harm:'dsArpa',mel:'dsGlock',bell:'dsFlauta',
  tune:[[2,null,null,4,null,2],[1,null,null,null,null,null],[3,null,null,5,null,3],[4,null,null,null,null,null],[7,null,null,6,null,4],[5,null,null,4,null,2],[3,null,null,1,null,3],[1,null,null,null,null,null]]}});
export const vhDeg=(P,d,oct=0)=>P.root+P.mode[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
// The brushes: a soft snare on two and four with a swung tick, and a shaker; fuller for the ride.
function vhPerc(bar,beats,full,P){const out=[];const H=(inst,variant,t,vel)=>out.push({inst,variant,t,vel});
 if(P?.style==='aigua'){H('tamborRec','sonall',0,.14);H('tamborRec','sonall',3,.12);if(full){H('tamborRec','vora',2,.07);H('tamborRec','vora',5,.07);}return out.filter(e=>e.t<beats);}
 if(P?.style==='tren'){for(let t=0;t<4;t+=.5)H('tamborRec','vora',t,t%1?.1:.2);H('tamborRec','mig',1,.16);H('tamborRec','mig',3,.16);if(full){H('woodblockRec','claves',2.5,.12);H('snareRec','hit',bar%2?3.5:1.5,.1);}return out.filter(e=>e.t<beats);}
 if(P?.style==='obres'){H('woodblockRec','claves',0,.3);H('tamborRec','mig',1,.22);H('woodblockRec','claves',2,.26);H('woodblockRec','claves',2.5,.18);H('tamborRec','mig',3,.22);if(full){H('tamborRec','baix',0,.2);H('woodblockRec','claves',3.5,.14);H('tamborRec','vora',bar%2?1.5:3.75,.12);}return out.filter(e=>e.t<beats);}
 if(P?.style==='marxa'){H('snareRec','hit',0,.26);H('tamborRec','baix',0,.3);H('snareRec','hit',2,.22);H('tamborRec','baix',2,.26);H('snareRec','hit',1.5,.1);H('snareRec','hit',3.5,.12);if(full){H('snareRec','hit',1,.14);H('snareRec','hit',3,.14);H('tamborRec','vora',bar%2?3.75:2.5,.12);}return out.filter(e=>e.t<beats);}
 H('snareRec','hit',1,.2);H('snareRec','hit',3,.22);H('tamborRec','sonall',0,.16);H('tamborRec','sonall',2,.14);H('tamborRec','sonall',2.67,.1);if(full){H('tamborRec','vora',.67,.14);H('tamborRec','vora',3.67,.12);H('snareRec','hit',bar%2?2.67:1.67,.12);}
 return out.filter(e=>e.t<beats);}
// The walking bass: the root, the third, the fifth and a step to the next chord, swung.
function vhBass(P,ch,next,beats){if(P.style==='aigua')return [{midi:vhDeg(P,ch,-1),t:0,len:1.5,vel:.46},{midi:vhDeg(P,ch+4,-1),t:3,len:1.5,vel:.4}].filter(e=>e.t<beats);if(P.style==='tren'){const walk=[0,4,2,(next-ch+7)%7>3?5:6];return walk.map((d,i)=>({midi:vhDeg(P,ch+d,-2),t:i,len:.5,vel:.5-(i%2)*.08})).filter(e=>e.t<beats);}if(P.style==='obres')return [{midi:vhDeg(P,ch,-2),t:0,len:.6,vel:.5},{midi:vhDeg(P,ch+4,-2),t:2,len:.6,vel:.44},{midi:vhDeg(P,(next-ch+7)%7>3?ch+5:ch+6,-2),t:3.5,len:.4,vel:.4}].filter(e=>e.t<beats);if(P.style==='marxa')return [{midi:vhDeg(P,ch,-2),t:0,len:.5,vel:.52},{midi:vhDeg(P,ch+4,-2),t:2,len:.5,vel:.46}].filter(e=>e.t<beats);const walk=[0,2,4,(next-ch+7)%7>3?5:6];return walk.map((d,i)=>({midi:vhDeg(P,ch+d,-2),t:i,len:.85,vel:.5-(i%2)*.06})).filter(e=>e.t<beats);}
// The piano comping: a chord on the «and» of one and on four, with an extra pluck on three in the full band.
function vhHarm(P,ch,beats,bar,full){const out=[];const n=(d,t,len,vel,x={})=>out.push({midi:[].concat(d).map(k=>vhDeg(P,ch+k,0)),t,len,vel,...x});
 if(P.style==='aigua'){[0,2,4,7,4,2].forEach((d,i)=>n([d],i,.9,.24-(i%3?.04:0)));if(full&&bar%2)n([6],5.5,.4,.14);return out.filter(e=>e.t<beats);}
 if(P.style==='tren'){n([0,2,4],.5,.2,.26);n([0,2,4],1.5,.2,.22);n([2,4],2.5,.2,.24);n([0,2,4],3.5,.2,.22);if(full&&bar%2)n([4,6],3,.2,.16);return out.filter(e=>e.t<beats);}
 if(P.style==='obres'){n([0,4],1.5,.4,.26);n([2,4],3.5,.4,.24);if(full&&bar%2)n([4],2.5,.3,.18);return out.filter(e=>e.t<beats);}
 if(P.style==='marxa'){n([0,2,4],1,.4,.3);n([0,2,4],3,.4,.28);if(full){n([2,4],1.5,.22,.15);n([2,4],3.5,.22,.15);}return out.filter(e=>e.t<beats);}
 n([0,2,4,6],.67,.5,.3,{strum:.02});n([0,2,4,6],3,.45,.27,{strum:.02});if(full)n([2,4,6],1.67,.3,.2,{strum:.02});if(full&&bar%2)n([0,2,4],3.67,.3,.18,{strum:.02});return out.filter(e=>e.t<beats);}
function vhMel(P,bar,beats){const line=P.tune[bar%P.tune.length],out=[];line.forEach((d,i)=>{if(d===null)return;let len=1;for(let k=i+1;k<line.length&&line[k]===null;k++)len++;const t=i/P.grid+((i%2)&&!P.style?.08:0);out.push({midi:vhDeg(P,d,0),t,len:Math.min(len/P.grid,beats-t)*.9,vel:.4+(i===0?.06:0)});});return out;}
const vhSwing=(P,t)=>{if(P.style)return t;const beat=Math.floor(t),f=t-beat;return beat+(f>.6&&f<.73?.67:f);};
// Bars of the band between two moments (seconds), with the layers of k (1 bass and brushes, 2 and the piano, 3 and the clarinet):
// in the wait only the piano vamps softly; in the ride everything plays, fuller.
function vhBand(P,k,from,to,vel=1,{wait=false,full=false,bar0=0}={}){const beat=60/P.bpm,barLen=beat*P.beats,out=[];let bar=bar0;
 for(let tb=from;tb+beat*.5<to;tb+=barLen,bar++){const ch=P.chords[bar%P.chords.length],next=P.chords[(bar+1)%P.chords.length],end=Math.min(to,tb+barLen);
  if(wait){for(const e of vhHarm(P,ch,P.beats,bar,false)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(P.harm,e.midi,t,e.len*beat,e.vel*.55*vel,{strum:.025}));}continue;}
  if(k>=1){for(const e of vhPerc(bar,P.beats,full,P)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(e.inst,[0],t,.25,e.vel*vel,{variant:e.variant}));}
   for(const e of vhBass(P,ch,next,P.beats)){const t=tb+e.t*beat;if(t<end)out.push(vhNote(P.bass,e.midi,t,e.len*beat,e.vel*vel));}}
  if(k>=2)for(const e of vhHarm(P,ch,P.beats,bar,full)){const t=tb+vhSwing(P,e.t)*beat;if(t<end)out.push(vhNote(P.harm,e.midi,t,e.len*beat,e.vel*vel,e.strum?{strum:e.strum}:{}));}
  if(k>=3)for(const e of vhMel(P,bar,P.beats)){const t=tb+e.t*beat;if(t<end){out.push(vhNote(P.mel,e.midi,t,Math.min(e.len*beat,end-t),e.vel*vel));if(P.bell&&full&&e.t===0&&P.style!=='aigua')out.push(P.style==='tren'?vhNote(P.bell,[0],tb+beat*3,.4,.2*vel,{variant:'petit'}):vhNote(P.bell,e.midi+12,t,.5,.22*vel));}}
  if(k>=3&&P.style==='aigua'&&P.bell&&full&&bar%2&&tb<end)out.push(vhNote(P.bell,vhDeg(P,ch+4,0),tb,Math.min(barLen*.85,end-tb),.18*vel));}
 return out;}
// The cadence: a plucked bass note and two piano chords (the dominant and the tonic), never a held wind note.
function vhCadence(P,at,vel=1){const beat=60/P.bpm;if(P.style==='aigua')return [vhNote(P.bass,vhDeg(P,4,-1),at,.5,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0),vhDeg(P,8,0)],at,.6,.26*vel,{strum:.08}),vhNote(P.bass,vhDeg(P,0,-1),at+beat*3,1.6,.52*vel),vhNote(P.harm,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0),vhDeg(P,7,0)],at+beat*3,1.6,.3*vel,{strum:.1}),vhNote(P.mel,[vhDeg(P,0,1),vhDeg(P,2,1),vhDeg(P,4,1),vhDeg(P,7,1)],at+beat*3,1.4,.3*vel,{strum:.08}),vhNote(P.bell,vhDeg(P,0,1),at+beat*3,1.6,.2*vel)];if(P.style==='tren')return [vhNote(P.bass,vhDeg(P,4,-2),at,.4,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0),vhDeg(P,8,0)],at,.3,.26*vel),vhNote(P.bass,vhDeg(P,0,-2),at+beat,1.2,.52*vel),vhNote(P.mel,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0),vhDeg(P,7,0)],at+beat,1.4,.34*vel,{strum:.07}),vhNote(P.bell,[0],at+beat,.8,.26*vel,{variant:'gran'}),vhNote('tamborRec',[0],at+beat*1.5,.3,.2,{variant:'vora'})];if(P.style==='obres')return [vhNote(P.bass,vhDeg(P,4,-2),at,.6,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0)],at,.5,.28*vel),vhNote(P.bass,vhDeg(P,0,-2),at+beat,1.4,.54*vel),vhNote(P.mel,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0)],at+beat,1.2,.34*vel,{strum:.05}),vhNote('woodblockRec',[0],at+beat,.2,.4,{variant:'claves'}),vhNote('woodblockRec',[0],at+beat*1.5,.2,.34,{variant:'claves'})];if(P.style==='marxa')return [vhNote(P.bass,vhDeg(P,4,-2),at,.5,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0),vhDeg(P,1,1)],at+beat*.5,.4,.3*vel),vhNote(P.bass,vhDeg(P,0,-2),at+beat,1.2,.54*vel),vhNote(P.harm,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0)],at+beat,1,.32*vel),...[0,2,4,7].map((d,i)=>vhNote(P.bell,vhDeg(P,d,1),at+beat*(1+i*.25),.5,.22*vel))];return [vhNote(P.bass,vhDeg(P,4,-2),at,.9,.5*vel),vhNote(P.harm,[vhDeg(P,4,0),vhDeg(P,6,0),vhDeg(P,1,1),vhDeg(P,3,1)],at,.8,.3*vel,{strum:.03}),vhNote(P.bass,vhDeg(P,0,-2),at+beat*1.5,1.6,.52*vel),vhNote(P.harm,[vhDeg(P,0,0),vhDeg(P,2,0),vhDeg(P,4,0),vhDeg(P,7,0)],at+beat*1.5,1.8,.34*vel,{strum:.04})];}
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
 out.push(...vhWheelSounds(picks.wheels,TL),...vhGagSounds(picks.top,TL,P));
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
 // the living room (0.56): the twin tyres drum softly, the tracks crunch, the balloon tyres bounce like jelly, the iron wheels ring on the tiles
 else if(kind==='bessones')for(let t=t0;t<t1;t+=.5)out.push(vhNote('tamborRec',[0],t,.2,.1,{variant:'baix'}));
 else if(kind==='erugues')for(let t=t0;t<t1;t+=.55)out.push(vhNote('masiaRec',[0],t,.3,.12,{variant:'terracruix'}));
 else if(kind==='balons')for(let t=t0;t<t1;t+=.8)out.push(vhNote('toonRec',[0],t,.35,.11,{variant:'jelly'}));
 else if(kind==='ferro')for(let t=t0;t<t1;t+=.42)out.push(vhNote('masiaRec',[0],t,.2,.09,{variant:'plat'}));
 // the yard (0.57): the rollers rumble slowly, the big rear wheels thump, the solid wheels tick fast, the giant knobbly ones bounce
 else if(kind==='corrons')for(let t=t0;t<t1;t+=.9)out.push(vhNote('tamborRec',[0],t,.5,.12,{variant:'baix'}));
 else if(kind==='grans')for(let t=t0;t<t1;t+=.66)out.push(vhNote('tamborRec',[0],t,.25,.12,{variant:'mig'}));
 else if(kind==='massisses')for(let t=t0;t<t1;t+=.26)out.push(vhNote('woodblockRec',[0],t,.1,.08,{variant:'claves'}));
 else if(kind==='gegants')for(let t=t0;t<t1;t+=.95)out.push(vhNote('toonRec',[0],t,.35,.12,{variant:'boing'}));
 // the hallway (0.58): the flanged wheels go clickety-clack in pairs, the rods chug, the mine-cart wheels squeak, the tram skirt hums softly
 else if(kind==='pestanya')for(let t=t0;t<t1;t+=.5){out.push(vhNote('woodblockRec',[0],t,.1,.1,{variant:'claves'}),vhNote('woodblockRec',[0],t+.11,.1,.08,{variant:'claves'}));}
 else if(kind==='bieles')for(let t=t0;t<t1;t+=.3)out.push(vhNote('tamborRec',[0],t,.2,.1,{variant:'vora'}));
 else if(kind==='vagoneta')for(let t=t0;t<t1;t+=.9)out.push(vhNote('masiaRec',[0],t,.4,.07,{variant:'gratar'}));
 else if(kind==='faldons')for(let t=t0;t<t1;t+=.5)out.push(vhNote('tamborRec',[0],t,.3,.06,{variant:'sonall'}));
 // the bathroom (0.59): the floats swish through the air, the paddles splash, the life rings bounce, the buoys plop
 else if(kind==='flotadors')for(let t=t0;t<t1;t+=.8)out.push(vhNote('masiaRec',[0],t,.5,.09,{variant:'whoosh'}));
 else if(kind==='pales')for(let t=t0;t<t1;t+=.45)out.push(vhNote('masiaRec',[0],t,.3,.1,{variant:'esquitxpetit'}));
 else if(kind==='salvavides')for(let t=t0;t<t1;t+=.55)out.push(vhNote('toonRec',[0],t,.3,.1,{variant:'boing'}));
 else if(kind==='boies')for(let t=t0;t<t1;t+=.5)out.push(vhNote('toonRec',[0],t,.3,.1,{variant:'plop'}));
 else out.push(vhNote('masiaRec',[0],TL.start+.3,.5,.3,{variant:'whoosh'}),vhNote('masiaRec',[0],TL.start+TL.ride*.55,.5,.22,{variant:'whoosh'}));
 // the ramp: a soft rumble of the drum as the vehicle rolls down
 out.push(vhNote('tamborRec',[0],TL.start+TL.ride*.08,.3,.2,{variant:'mig'}),vhNote('tamborRec',[0],TL.start+TL.ride*.14,.3,.24,{variant:'baix'}));return out;}
// The gag of the accessory: the lid and the three balls; the blocks of the trailer hopping into a tower; the banner and its little bell.
function vhGagSounds(kind,TL,P=VH_PIECE.habitacio){const out=[],G=VH_GAG[kind];if(!G)return out;const tt=u=>TL.start+TL.ride*u;
 if(kind==='baca'){out.push(vhNote('toonRec',[0],tt(G.at),.4,.4,{variant:'doorOpen'}));[0,.03,.06].forEach((d,i)=>{out.push(vhNote('toonRec',[0],tt(G.at+.04+d),.3,.38-i*.05,{variant:'boing'}),vhNote('toonRec',[0],tt(G.at+.12+d*1.3),.3,.26,{variant:'knock'}));});}
 else if(kind==='remolc'){[.08,.22,.36].forEach((u,i)=>{out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*u,.3,.34,{variant:'boing'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*(u+.11),.3,.4,{variant:'knock'}));});}
 else if(kind==='sirena'){for(let i=0;i<4;i++)out.push(vhNote(P.mel,[vhDeg(P,i%2?2:4,0)],tt(G.at)+i*.38,.34,.3));}
 // the living room (0.56): the crane's cable, hook and block; the three squirts of the cannon, the splash and the bell of the flower; the
 // bell swinging four times; the reel and the hose sliding to the floor
 else if(kind==='brac'){out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.08,.5,.34,{variant:'yank'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.3,.4,.3,{variant:'clink'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.52,.6,.34,{variant:'stretch'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.8,.3,.3,{variant:'knock'}));}
 else if(kind==='cano'){[0,.1,.2].forEach((d,i)=>out.push(vhNote('toonRec',[0],tt(G.at)+d,.3,.36-i*.04,{variant:'squirt'})));out.push(vhNote('masiaRec',[0],tt(G.at)+.5,.5,.3,{variant:'esquitxpetit'}));[0,2,4].forEach((d,i)=>out.push(vhNote(P.bell||'dsGlock',[vhDeg(P,d,1)],tt(G.at)+.8+i*.12,.4,.26)));}
 else if(kind==='campana'){for(let i=0;i<4;i++)out.push(vhNote('pintaRec',[0],tt(G.at)+i*.45,.6,.34-i*.03,{variant:'campana'}));}
 // the yard (0.57): the scrape and crunch of the digging bucket; the tipping box and its three lumps; the drum turning and the blob; the cones knocking
 else if(kind==='pala'){out.push(vhNote('masiaRec',[0],tt(G.at+.02),.6,.36,{variant:'gratar'}),vhNote('masiaRec',[0],tt(G.at+.06),.4,.3,{variant:'terracruix'}),vhNote('masiaRec',[0],tt(G.at+.15),.4,.28,{variant:'terracruix'}),vhNote('toonRec',[0],tt(G.at+.17),.3,.26,{variant:'plop'}));}
 else if(kind==='caixa'){out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.08,.6,.32,{variant:'slideUp'}));[.2,.28,.36].forEach((u,i)=>out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*u,.3,.3-i*.03,{variant:'terracruix'})));}
 else if(kind==='tambor'){for(let u=.12;u<.95;u+=.12)out.push(vhNote('toonRec',[0],tt(u),.3,.1,{variant:'blub'}));out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.1,.5,.3,{variant:'sacsejada'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.4,.4,.3,{variant:'plop'}));}
 // the hallway (0.58): the chimney puffs softly all the way; the whistle blows twice at the bridge; the lantern clinks on; the logs knock down
 else if(kind==='xemeneia'){for(let u=G.at;u<.95;u+=.11)out.push(vhNote('toonRec',[0],tt(u),.3,.07,{variant:'poof'}));}
 else if(kind==='xiulet'){out.push(vhNote('dsFlauta',[P.root+19,P.root+22],tt(G.at),.35,.3),vhNote('dsFlauta',[P.root+19,P.root+22],tt(G.at+.045),.7,.32));}
 else if(kind==='fanal'){out.push(vhNote('toonRec',[0],tt(G.at+.02),.3,.3,{variant:'clink'}));}
 else if(kind==='troncs'){[.1,.2,.3].forEach((u,i)=>out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*u,.4,.32-i*.03,{variant:'branca'})));out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.42,.4,.26,{variant:'clatter'}));}
 // the bathroom (0.59): the propeller's gust and soft whirr, the periscope's slide up, click and slide down, the anchor's swing, chain
 // and clatter at the garage, the bubbles' blubs all the way
 else if(kind==='helix'){out.push(vhNote('masiaRec',[0],tt(G.at),.6,.3,{variant:'rafega'}));for(let t=tt(G.at)+.5;t<TL.rideEnd-.3;t+=.5)out.push(vhNote('masiaRec',[0],t,.3,.05,{variant:'whoosh'}));}
 else if(kind==='periscopi'){out.push(vhNote('toonRec',[0],tt(G.at),.5,.3,{variant:'slideUp'}),vhNote('toonRec',[0],tt(G.at+.07),.3,.24,{variant:'clink'}),vhNote('toonRec',[0],tt(G.at+.25),.5,.28,{variant:'slideDown'}));}
 else if(kind==='ancora'){out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.06,.5,.26,{variant:'whoosh'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.3,.6,.3,{variant:'yank'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.6,.4,.3,{variant:'clatter'}));}
 else if(kind==='bombolles'){for(let t=tt(G.at);t<TL.rideEnd-.2;t+=.2)out.push(vhNote('toonRec',[0],t,.25,.08,{variant:'blub'}));}
 else if(kind==='cons'){[0,.22,.4].forEach((d,i)=>out.push(vhNote('toonRec',[0],tt(G.at+d),.3,.34,{variant:'knock'}),vhNote('woodblockRec',[0],tt(G.at+d)+.09,.15,.22,{variant:'claves'})));}
 else if(kind==='manega'){out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.1,.6,.32,{variant:'slideDown'}),vhNote('masiaRec',[0],TL.rideEnd+TL.park*.35,.5,.26,{variant:'fil'}),vhNote('toonRec',[0],TL.rideEnd+TL.park*.62,.4,.3,{variant:'plop'}));}
 else if(kind==='escala'){[.08,.2,.32].forEach(u=>out.push(vhNote('woodblockRec',[0],TL.rideEnd+TL.park*u,.12,.3,{variant:'claves'})));out.push(vhNote('toonRec',[0],TL.rideEnd+TL.park*.34,.6,.34,{variant:'stretch'}));}
 else if(kind==='globus'){out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.12,.6,.35,{variant:'telainfla'}));[0,2,4].forEach((d,i)=>out.push(vhNote(P.harm,[vhDeg(P,d,1)],TL.rideEnd+TL.park*(.2+i*.07),.5,.3)));out.push(vhNote('masiaRec',[0],TL.rideEnd+TL.park*.7,.5,.3,{variant:'campaneta'}));}
 else{out.push(vhNote('masiaRec',[0],tt(G.at-.12),.6,.4,{variant:'telainfla'}),vhNote('pintaRec',[0],tt(G.at-.02),.6,.4,{variant:'campana'}));}
 return out.map(e=>({...e,vel:Math.min(1,e.vel*VH_GAG_LOUD)}));}
// From seconds to the fractions of the effect that app.js plays (at and length over its duration).
export const vhPattern=(events,D)=>events.filter(e=>e.t<D-.02).map(e=>({inst:e.inst,midi:e.midi,at:e.t/D,length:Math.max(.01,Math.min(e.len,D-e.t))/D,vel:e.vel,...(e.variant?{variant:e.variant}:{}),...(e.strum?{strum:e.strum}:{})}));
// The taste of a piece in focus: a short sound of its own (under 1.2 s).
export function vhTaste(kind,id,corner='habitacio'){const P=VH_PIECE[corner]||VH_PIECE.habitacio;
 if(kind==='body'){const d={familiar:0,autobus:2,furgoneta:3,curses:4,camioneta:1,escarabat:5,bombers:0,ambulancia:2,plataforma:3,totterreny:4,policia:1,furgo:5}[id]||0;const d2={bolquet:0,excavadora:2,buldozer:3,piconadora:4,carreto:1,tractor:5,locomotora:0,vago:2,tramvia:4,mercaderies:3,maniobres:1,cua:5,hidroavio:0,barca:2,submari:3,helicopter:4,avioneta:1,vapor:5}[id];const dd=d2??d;return [vhNote(P.style==='marxa'||P.style==='aigua'?P.harm:P.style==='obres'||P.style==='tren'?P.mel:'dsPiano',[vhDeg(P,dd,0),vhDeg(P,dd+2,0),vhDeg(P,dd+4,0)],0,.7,P.style==='marxa'?.3:.34,{strum:P.style==='tren'?.06:P.style==='aigua'?.08:.03})];}
 if(kind==='wheels'&&id==='pestanya')return [0,.3].flatMap(t=>[vhNote('woodblockRec',[0],t,.1,.3,{variant:'claves'}),vhNote('woodblockRec',[0],t+.11,.1,.24,{variant:'claves'})]);if(kind==='wheels'&&id==='bieles')return [0,.2,.4,.6].map(t=>vhNote('tamborRec',[0],t,.2,.3,{variant:'vora'}));if(kind==='wheels'&&id==='vagoneta')return [vhNote('masiaRec',[0],0,.5,.28,{variant:'gratar'})];if(kind==='wheels'&&id==='faldons')return [vhNote('tamborRec',[0],0,.4,.26,{variant:'sonall'}),vhNote('tamborRec',[0],.35,.4,.22,{variant:'sonall'})];
 if(kind==='top'&&id==='xemeneia')return [vhNote('toonRec',[0],0,.3,.3,{variant:'poof'}),vhNote('toonRec',[0],.3,.3,.26,{variant:'poof'})];if(kind==='top'&&id==='xiulet')return [vhNote('dsFlauta',[P.root+19,P.root+22],0,.3,.3),vhNote('dsFlauta',[P.root+19,P.root+22],.35,.6,.3)];if(kind==='top'&&id==='fanal')return [vhNote('toonRec',[0],0,.3,.3,{variant:'clink'})];if(kind==='top'&&id==='troncs')return [vhNote('masiaRec',[0],0,.4,.3,{variant:'branca'}),vhNote('masiaRec',[0],.3,.4,.26,{variant:'branca'})];
 if(kind==='wheels'&&id==='flotadors')return [vhNote('masiaRec',[0],0,.5,.3,{variant:'whoosh'})];if(kind==='wheels'&&id==='pales')return [0,.25,.5].map(t=>vhNote('masiaRec',[0],t,.3,.3,{variant:'esquitxpetit'}));if(kind==='wheels'&&id==='salvavides')return [vhNote('toonRec',[0],0,.3,.3,{variant:'boing'}),vhNote('toonRec',[0],.3,.3,.26,{variant:'boing'})];if(kind==='wheels'&&id==='boies')return [vhNote('toonRec',[0],0,.3,.3,{variant:'plop'}),vhNote('toonRec',[0],.3,.3,.26,{variant:'plop'})];
 if(kind==='top'&&id==='helix')return [vhNote('masiaRec',[0],0,.5,.3,{variant:'rafega'})];if(kind==='top'&&id==='periscopi')return [vhNote('toonRec',[0],0,.4,.3,{variant:'slideUp'}),vhNote('toonRec',[0],.4,.3,.26,{variant:'clink'})];if(kind==='top'&&id==='ancora')return [vhNote('toonRec',[0],0,.4,.3,{variant:'yank'}),vhNote('toonRec',[0],.35,.3,.28,{variant:'clatter'})];if(kind==='top'&&id==='bombolles')return [0,.15,.3,.45].map((t,i)=>vhNote('toonRec',[0],t,.3,.3-i*.03,{variant:'blub'}));
 if(kind==='wheels'&&id==='corrons')return [vhNote('tamborRec',[0],0,.5,.32,{variant:'baix'})];if(kind==='wheels'&&id==='grans')return [vhNote('tamborRec',[0],0,.25,.32,{variant:'mig'}),vhNote('tamborRec',[0],.3,.25,.28,{variant:'mig'})];if(kind==='wheels'&&id==='massisses')return [0,.12,.24,.36].map(t=>vhNote('woodblockRec',[0],t,.1,.28,{variant:'claves'}));if(kind==='wheels'&&id==='gegants')return [vhNote('toonRec',[0],0,.4,.34,{variant:'boing'}),vhNote('toonRec',[0],.4,.4,.28,{variant:'boing'})];
 if(kind==='top'&&id==='pala')return [vhNote('masiaRec',[0],0,.5,.34,{variant:'gratar'}),vhNote('masiaRec',[0],.4,.4,.28,{variant:'terracruix'})];if(kind==='top'&&id==='caixa')return [vhNote('toonRec',[0],0,.5,.32,{variant:'slideUp'}),vhNote('masiaRec',[0],.45,.3,.28,{variant:'terracruix'})];if(kind==='top'&&id==='tambor')return [vhNote('toonRec',[0],0,.3,.3,{variant:'blub'}),vhNote('toonRec',[0],.25,.3,.3,{variant:'blub'})];if(kind==='top'&&id==='cons')return [vhNote('toonRec',[0],0,.3,.34,{variant:'knock'}),vhNote('woodblockRec',[0],.1,.15,.24,{variant:'claves'})];
 if(kind==='wheels'&&id==='bessones')return [vhNote('tamborRec',[0],0,.2,.34,{variant:'baix'}),vhNote('tamborRec',[0],.26,.2,.3,{variant:'baix'})];if(kind==='wheels'&&id==='erugues')return [0,.2,.4].map(t=>vhNote('masiaRec',[0],t,.3,.3,{variant:'terracruix'}));if(kind==='wheels'&&id==='balons')return [vhNote('toonRec',[0],0,.4,.34,{variant:'jelly'})];if(kind==='wheels'&&id==='ferro')return [vhNote('masiaRec',[0],0,.3,.3,{variant:'plat'}),vhNote('masiaRec',[0],.3,.3,.26,{variant:'plat'})];
 if(kind==='top'&&id==='brac')return [vhNote('toonRec',[0],0,.5,.34,{variant:'yank'}),vhNote('toonRec',[0],.4,.3,.3,{variant:'clink'})];if(kind==='top'&&id==='cano')return [vhNote('toonRec',[0],0,.3,.36,{variant:'squirt'}),vhNote('toonRec',[0],.18,.3,.32,{variant:'squirt'})];if(kind==='top'&&id==='campana')return [vhNote('pintaRec',[0],0,.7,.36,{variant:'campana'})];if(kind==='top'&&id==='manega')return [vhNote('toonRec',[0],0,.6,.32,{variant:'slideDown'})];
 if(kind==='wheels')return id==='fusta'?[vhNote('woodblockRec',[0],0,.15,.4,{variant:'claves'}),vhNote('woodblockRec',[0],.22,.15,.34,{variant:'claves'})]:id==='primes'?[vhNote('masiaRec',[0],0,.5,.36,{variant:'whoosh'})]:id==='amples'?[vhNote('toonRec',[0],0,.4,.3,{variant:'blub'}),vhNote('toonRec',[0],.3,.4,.26,{variant:'blub'})]:id==='radis'?[0,.14,.28].map(t=>vhNote('woodblockRec',[0],t,.1,.3,{variant:'claves'})):id==='tapacubs'?[vhNote('masiaRec',[0],0,.6,.3,{variant:'rafega'})]:[vhNote('toonRec',[0],0,.4,.38,{variant:'boing'})];
 if(kind==='top')return id==='baca'?[vhNote('toonRec',[0],0,.4,.36,{variant:'clink'})]:id==='remolc'?[vhNote('toonRec',[0],0,.4,.32,{variant:'clatter'})]:id==='sirena'?[vhNote(P.mel,[vhDeg(P,4,0)],0,.3,.3),vhNote(P.mel,[vhDeg(P,2,0)],.34,.3,.3)]:id==='escala'?[vhNote('woodblockRec',[0],0,.12,.34,{variant:'claves'}),vhNote('toonRec',[0],.2,.5,.3,{variant:'stretch'})]:id==='globus'?[vhNote('toonRec',[0],0,.6,.34,{variant:'inflate'})]:[vhNote('masiaRec',[0],0,.5,.36,{variant:'telainfla'})];
 const d={blau:0,corall:2,groc:4,verd:5,lila:1,taronja:3}[id]||0;return [vhNote('dsPiano',vhDeg(P,d,1),0,.6,.36)];}
// The air of the room by its light: birds through the window in the morning, the meadow in the afternoon, crickets at dusk and at night.
// The living room (0.56) looks onto the street: a blackbird far off in the morning, pigeons in the afternoon, crickets at dusk, the night.
export function vhAmbience(corner,light){const A=(name,level,lowpass=7000)=>({name,level,lowpass});
// The yard (0.57) is outdoors: a blackbird in the morning, cicadas in the afternoon, crickets at dusk, the night.
// The hallway (0.58) hears the outside through the window: dawn birds, a soft wind, frogs at dusk, the night.
// The bathroom (0.59) is all water: drips in the morning, bubbles in the afternoon, drops at dusk, the night.
 if(corner==='bany'){if(light==='mati')return [A('drips',.1,5000)];if(light==='tarda')return [A('bubbles',.09,5000)];if(light==='capvespre')return [A('drops',.08,4500)];return [A('nit',.09,4000)];}
 if(corner==='passadis'){if(light==='mati')return [A('dawn',.08,5000)];if(light==='tarda')return [A('wind',.07,1800)];if(light==='capvespre')return [A('frogs',.08,4500)];return [A('nit',.09,4000)];}
 if(corner==='pati'){if(light==='mati')return [A('blackbird',.11,6000)];if(light==='tarda')return [A('ptCigales',.1,6000)];if(light==='capvespre')return [A('crickets',.09,5000)];return [A('nit',.1,4000)];}
 if(corner==='sala'){if(light==='mati')return [A('blackbird',.09,5000)];if(light==='tarda')return [A('ptColoms',.1,5500)];if(light==='capvespre')return [A('crickets',.08,5000)];return [A('nit',.1,4000)];}
 if(light==='mati')return [A('blackbird',.12,6000)];if(light==='tarda')return [A('meadow',.1,5500)];if(light==='capvespre')return [A('crickets',.09,5000)];return [A('crickets',.11,4000)];}

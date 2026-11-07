// Piromusical (CE24): twenty firework shows with the music of a festival band. Each visual event and its note come from the same step
// grid, as in the other collections, and the firework sounds (soft booms, crackles, whooshes) come from the same plan as the shells.
import {kaleidoPhase,kaleidoGrid} from './kaleido-base.js';
import {PIRO_ART} from './piro-art.js';
import {FwShow,FwPlan,FwTime,FwSounds} from './firework.js';
import {composeKaleido,musicNote,MUSIC_TRANSPOSE} from './kaleido-music.js';
import {SAMPLE_BANK} from './sampler.js';
export const PIRO_MIN_DURATION=10;
export const PIRO_PATTERNS=Object.freeze([
 ['Palmeres de llum','palmeres de llum s’obren en ventall i cauen, les mines responen des de terra i un gran salze tanca l’espectacle'],
 ['Peònies de colors','peònies rodones de tots els colors s’obren d’esquerra a dreta, i al final una peònia doble amb un anell'],
 ['Crisantems','crisantems de cues llargues amb estrelles que canvien de color mentre cauen'],
 ['Salzes de colors','salzes de tots els colors amb cues d’or pengen del cel, i corones que espurnegen'],
 ['Planetes i anells','anells de totes les inclinacions, planetes amb el seu anell i dos anells creuats'],
 ['Cors i estrelles','focs que dibuixen cors, estrelles, flors i trèvols al cel'],
 ['Cascada de llum','una cortina de llum que cau s’obre des del mig, amb peònies i anells a sobre i una cortina d’or a sota'],
 ['Rodes de foc','rodes de foc giren a poc a poc sobre el poble i llancen espurnes de tres colors'],
 ['Fonts que ballen','set fonts s’encenen del mig cap enfora i pugen i baixen com aigua que balla'],
 ['Candeles romanes','quatre candeles romanes disparen boles de colors en ventall que acaben en petits esclats d’estrelles'],
 ['Creuetes','creuetes que parteixen les estrelles en quatre, i dues cometes que creuen el cel'],
 ['Arc de Sant Martí','set peònies lentes, una de cada color de l’arc de Sant Martí, dibuixen un arc; al final s’obren set anells un dins de l’altre'],
 ['Peixets de llum','sobre un llac, focs amb estrelles que neden com peixets i es reflecteixen a l’aigua'],
 ['Dàlies','dàlies d’estrelles grosses que canvien de color, amb pistils i purpurina'],
 ['Ram de flors','cometes verdes pugen com tiges i s’obren en flors fins que el cel és un ram'],
 ['Pluja d’estrelles','brocats i corones fan caure sobre el poble una pluja lenta d’estrelles que espurnegen'],
 ['Espirals','focs amb estrelles que surten per braços corbats i giren a poc a poc, sobre una roda'],
 ['Mines i cometes','cons d’estrelles surten de terra i cometes creuen el cel i s’obren en estrelles'],
 ['Reflexos al llac','peònies, salzes i anells sobre un llac que els reflecteix'],
 ['Gran final','tot alhora, cada cop més: fonts, palmeres, anells, creuetes, crisantems, brocats, estrelles i una gran corona d’or']
].map(([name,movement],i)=>Object.freeze({id:'piro-'+String(i+1).padStart(2,'0'),plan:i+1,name,movement})));
const Pwrap=index=>((index%PIRO_ART.length)+PIRO_ART.length)%PIRO_ART.length;
const PIRO_STEPS=16;
function Pmoments(index,duration){const art=PIRO_ART[Pwrap(index)],grid=kaleidoGrid(duration,PIRO_STEPS),times=art.hits.map(s=>grid.time(s*grid.m));return {art,grid,times};}
export function piroEvents(index,duration){return Pmoments(index,duration).times;}
// Piromusical's melody family: the calls and marches of a festival band (a fanfare call, a rocket's run up the scale, sparks falling
// down the chord, a palm's arch, a reveille, a march, a wheel turning, bells, a leap, glitter, and three cadences) on recorded
// instruments only (sampler.js): trumpets, horns, trombones and tuba, with timpani, cymbals and drums, harp, glockenspiel and woodwind.
// Every call lasts four beats, so four calls fill the sixteen beats of a piece and end on the settle.
export const PIRO_MOTIFS=Object.freeze({
 A:{n:[0,0,4,7],r:[.5,.5,1,2]},                         // avís: a fanfare call
 C:{n:[0,1,2,3,4,5,6,7],r:[.25,.25,.25,.25,.25,.25,.5,2]}, // coet: a rocket's run up to the octave
 E:{n:[7,4,2,0],r:[1,.5,.5,2]},                         // esclat: sparks falling down the chord
 P:{n:[4,5,7,5,4],r:[.5,.5,2,.5,.5]},                   // palmera: an arch
 D:{n:[0,4,7,4],r:[.75,.25,2,1]},                       // diana: a dotted reveille
 M:{n:[4,4,5,6,7],r:[.5,.5,.5,.5,2]},                   // marxa: a march step up
 G:{n:[2,4,2,0,2],r:[.5,.5,.5,.5,2]},                   // girandola: a wheel turning
 R:{n:[7,4,7,4,7],r:[.5,.5,.5,.5,2]},                   // repic: bells
 S:{n:[0,7,4,2],r:[1,1,1,1]},                           // saltiró: a leap and back
 L:{n:[9,7,6,4],r:[.5,.5,1,2]},                         // lluïssor: glitter coming down
 K:{n:[2,1,0],r:[1,1,2]},                               // cadència: home
 Q:{n:[4,2,1,0],r:[.5,.5,1,2]},                         // cadència cantada: home with a turn
 F:{n:[4,4,4,7],r:[.5,.25,.25,3]}                       // fanfara final: the closing call
});
// The octave (or the shift by octaves) that keeps a set of notes, in every round, within four semitones of the instrument's recorded
// notes, as near as possible to where the instrument sounds best.
const P_TARGET={trumpetRec:72,fluteRec:79,clarinetRec:68,oboeRec:74,violinsRec:74,marimbaRec:76,glockRec:88,tubaRec:42,timpaniRec:48,hornRec:54,tromboneRec:50};
function Pfit(notes,inst){const zones=SAMPLE_BANK[inst].zones.map(z=>z[1]),lo=Math.min(...zones)-4-Math.min(...MUSIC_TRANSPOSE),hi=Math.max(...zones)+4-Math.max(...MUSIC_TRANSPOSE),mean=notes.reduce((a,b)=>a+b,0)/notes.length;
 const fits=o=>Math.min(...notes)+12*o>=lo&&Math.max(...notes)+12*o<=hi,far=o=>Math.abs(mean+12*o-(P_TARGET[inst]??64));let best=null;for(let o=-2;o<5;o++)if(fits(o)&&(best===null||far(o)<far(best)))best=o;return best??0;}
// The range in which a note can be placed by octaves so that it stays, in every round, within four semitones of a recording.
function Pwindow(inst){const zones=SAMPLE_BANK[inst].zones.map(z=>z[1]);return [Math.min(...zones)-4-Math.min(...MUSIC_TRANSPOSE),Math.max(...zones)+4-Math.max(...MUSIC_TRANSPOSE)];}
const Pmelody=(key,mode,phrases,shift=0)=>phrases.flatMap(([name,s=0])=>PIRO_MOTIFS[name].n.map(d=>musicNote(key,mode,d+s+shift)));
// Light percussion of the band: one character per beat, a capital letter for the accented beat.
const P_SNARE=(pat,vel=.36)=>({inst:'snareRec',variant:'hit',pat,vel,pan:.25,from:2,len:.3});
const P_DRUM=(pat,vel=.5)=>({inst:'bassdrumRec',variant:'soft',pat,vel,pan:-.1,from:2,len:.9});
const P_TRIANGLE=(pat,vel=.36)=>({inst:'triangleRec',variant:'hit',pat,vel,pan:-.35,from:4,len:.6});
// A piece of the collection: the collection's defaults (a march: tuba on the strong beats, horns on the off-beats, snare and bass
// drum), which each piece can change. The show closes on plucked and struck sounds that fade by themselves: a rolled harp chord,
// a short last note of the tuba, the glockenspiel and the cymbal, with the violins letting go soon after the settle (held brass
// chords sounded like an organ).
function Ppiece(p){const deg=d=>musicNote(p.key,p.mode,d),roots=[...new Set([...p.prog,0])];
 const melody={inst:'trumpetRec',vel:.58,...p.melody};melody.oct=Pfit(Pmelody(p.key,p.mode,melody.phrases),melody.inst);
 if(melody.par){const par={inst:'clarinetRec',vel:.38,...melody.par};par.oct??=Pfit(Pmelody(p.key,p.mode,melody.phrases,par.shift),par.inst);melody.par=par;}
 const bass=p.bass===false?undefined:{inst:'tubaRec',rhythm:[0,2],notes:[0,-3],vel:.56,end:'tubaRec',endLen:1.2,...p.bass};
 if(bass)bass.oct=Pfit(roots.flatMap(c=>bass.notes.map(n=>deg(c+n-14))),bass.inst);
 return {key:p.key,mode:p.mode,meter:4,prog:p.prog,motifs:PIRO_MOTIFS,melody,bass,
  comp:p.comp===false?undefined:{inst:'hornRec',pat:'.x.x',center:54,size:3,len:.5,vel:.3,from:2,...p.comp},
  arp:p.arp?{inst:'harpRec',shape:'up',per:2,center:72,vel:.34,pan:.45,hold:2,...p.arp}:undefined,
  pad:p.pad?{inst:'violinsRec',center:66,vel:.34,tail:1.2,...p.pad}:undefined,counter:p.counter,
  lead:{inst:'glockRec',line:[7],oct:2,chord:2,len:3,vel:.4,...p.lead},
  beats:p.beats??[P_SNARE('.x.x'),P_DRUM('x...')],
  onset:{inst:'harpRec',center:70,vel:.68,strum:.04,low:'timpaniRec',lowFold:Pwindow('timpaniRec'),lowVel:.55,...p.onset},
  final:{inst:'harpRec',center:70,size:5,strum:.07,vel:.64,...p.final},sparkle:'glockRec',sparkleDeg:14,finale:p.finale??['soft'],fxLevel:p.fxLevel??1};}
export const PIRO_MUSIC=Object.freeze([
 Ppiece({key:55,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['A',0],['P',3],['M',4],['F',0]]},arp:{shape:'up'}}),
 Ppiece({key:57,mode:'ionian',prog:[0,5,3,0],melody:{inst:'fluteRec',vel:.6,phrases:[['D',0],['G',5],['E',3],['Q',0]],par:{shift:-2,from:4}},arp:{inst:'marimbaRec',shape:'broken',center:72,vel:.36},beats:[P_SNARE('.x.x',.3),P_TRIANGLE('x...')]}),
 Ppiece({key:53,mode:'lydian',prog:[0,1,4,0],melody:{inst:'clarinetRec',vel:.6,phrases:[['S',0],['R',1],['C',4],['K',0]]},arp:{shape:'broken'},pad:{},finale:['swell']}),
 Ppiece({key:50,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'violinsRec',vel:.62,phrases:[['L',0],['P',6],['G',3],['Q',0]]},arp:{shape:'wave',center:74},comp:false,bass:{rhythm:[0],vel:.5},beats:[P_TRIANGLE('x.x.',.3)],finale:['swell']}),
 Ppiece({key:52,mode:'lydian',prog:[0,1,4,0],melody:{inst:'oboeRec',vel:.6,phrases:[['G',0],['L',1],['D',4],['K',0]]},arp:{shape:'random',center:76,vel:.32},pad:{center:68},comp:{vel:.24},beats:[P_TRIANGLE('x...'),P_DRUM('x...',.4)]}),
 Ppiece({key:55,mode:'ionian',prog:[0,3,4,0],melody:{inst:'fluteRec',vel:.6,phrases:[['A',0],['G',3],['P',4],['Q',0]],par:{inst:'oboeRec',shift:-2,from:3}},arp:{inst:'marimbaRec',shape:'updown',center:70,vel:.36},beats:[P_SNARE('.x.x',.28),P_DRUM('x...',.44)]}),
 Ppiece({key:58,mode:'ionian',prog:[0,5,3,0],melody:{phrases:[['E',0],['E',5],['M',3],['F',0]]},arp:{shape:'down',center:76},finale:['swell','soft']}),
 Ppiece({key:57,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'clarinetRec',vel:.62,phrases:[['G',0],['R',-1],['S',3],['K',0]]},arp:{inst:'violinsPizzRec',shape:'updown',center:68,vel:.38}}),
 Ppiece({key:53,mode:'ionian',prog:[0,4,5,0],melody:{inst:'marimbaRec',vel:.66,phrases:[['M',0],['A',4],['G',5],['Q',0]]},arp:{shape:'wave',center:70},finale:['roll','soft']}),
 Ppiece({key:55,mode:'mixolydian',prog:[0,6,3,0],melody:{phrases:[['D',0],['C',-1],['P',3],['F',0]],par:{inst:'clarinetRec',shift:-2,from:6}},arp:{inst:'glockRec',shape:'random',center:88,vel:.28},beats:[P_SNARE('x.x.',.32),P_DRUM('x...')]}),
 Ppiece({key:52,mode:'ionian',prog:[0,3,4,0],melody:{inst:'oboeRec',vel:.6,phrases:[['S',0],['E',3],['R',4],['K',0]]},arp:{inst:'violinsPizzRec',shape:'broken',center:70,vel:.38}}),
 Ppiece({key:55,mode:'ionian',prog:[0,3,4,0],melody:{inst:'fluteRec',vel:.6,phrases:[['C',0],['A',3],['L',4],['Q',0]]},arp:{shape:'up',climb:12,center:66},lead:{line:[0,1,2,3,4,5,6,7],chord:0,oct:2,vel:.44},finale:['swell']}),
 Ppiece({key:57,mode:'lydian',prog:[0,1,4,0],melody:{inst:'clarinetRec',vel:.6,phrases:[['P',0],['G',1],['M',4],['Q',0]]},arp:{inst:'marimbaRec',shape:'wave',center:72,vel:.36},beats:[P_TRIANGLE('x.x.',.3),P_DRUM('x...',.4)],comp:{vel:.24}}),
 Ppiece({key:53,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'violinsRec',vel:.64,phrases:[['A',0],['D',-1],['E',3],['K',0]]},arp:{shape:'broken',center:72},pad:{center:64,vel:.28}}),
 Ppiece({key:58,mode:'ionian',prog:[0,5,3,0],melody:{inst:'violinsRec',vel:.62,phrases:[['L',0],['S',5],['P',3],['Q',0]],par:{inst:'fluteRec',shift:2,from:2,vel:.34}},arp:{shape:'updown',center:70},beats:[P_TRIANGLE('x...'),P_SNARE('..x.',.26)],finale:['swell','soft']}),
 Ppiece({key:56,mode:'lydian',prog:[0,1,4,0],melody:{inst:'glockRec',vel:.56,phrases:[['R',0],['L',1],['G',4],['K',0]]},arp:{shape:'random',center:80,vel:.3},pad:{center:68,vel:.3},comp:false,bass:{rhythm:[0],vel:.48},beats:[P_TRIANGLE('x.x.',.28)],lead:{inst:'harpRec',oct:1,chord:3,strum:.04,vel:.44},finale:['swell']}),
 Ppiece({key:55,mode:'lydian',prog:[0,1,4,0],melody:{inst:'oboeRec',vel:.6,phrases:[['G',0],['C',1],['E',4],['Q',0]]},arp:{inst:'violinsPizzRec',shape:'updown',center:70,vel:.38}}),
 Ppiece({key:50,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['D',0],['M',3],['A',4],['F',0]]},arp:{shape:'up',center:70},beats:[P_SNARE('.x.x',.4),P_DRUM('x.x.',.5)],finale:['roll','soft']}),
 Ppiece({key:53,mode:'ionian',prog:[0,5,3,0],melody:{inst:'fluteRec',vel:.6,phrases:[['P',0],['D',5],['L',3],['K',0]]},arp:{shape:'wave',center:72},pad:{center:66,vel:.3},comp:false,bass:{rhythm:[0],vel:.48},beats:[P_TRIANGLE('x...',.3)],finale:['swell']}),
 Ppiece({key:55,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['A',0],['C',3],['M',4],['F',0]],par:{inst:'clarinetRec',shift:-2,from:4}},arp:{shape:'up',climb:12,center:66},counter:{inst:'tromboneRec',oct:0,notes:[[-7,4],[-4,4],[-3,4],[-7,4]],vel:.34,from:0},beats:[P_SNARE('.x.x',.38),P_DRUM('x.x.',.5)],finale:['swell','roll','soft']})
]);
// The extras of each round: timpani under the big shells, the firework sounds, and the close of the show (a cymbal that swells into the
// last event, a snare roll before it, a soft cymbal on it).
function Pextras(spec,art,times){const plan=FwPlan(art),accents=[],last=times.at(-1);
 times.forEach((t,k)=>{const big=plan.filter(s=>s.at===k&&!s.dt&&s.r>=.16&&s.stars).reduce((m,s)=>Math.max(m,s.r),0);if(big)accents.push({time:t,inst:'timpaniRec',fold:Pwindow('timpaniRec'),vel:Math.min(.5,.3+.7*(big-.16)),len:1.6});});
 const fx=FwSounds(art,times).map(e=>({...e,vel:e.vel*spec.fxLevel}));
 for(const f of spec.finale){if(f==='soft')fx.push({time:last,len:3,inst:'cymbalRec',variant:'soft',vel:.3,pan:.2});
  if(f==='swell'&&last-3.22>.3)fx.push({time:last-3.22,len:3.4,inst:'cymbalRec',variant:'swell',vel:.3,pan:-.2});
  if(f==='roll'&&last-1.1>.3)fx.push({time:last-1.1,len:1.1,inst:'snareRollRec',variant:'roll',vel:.26,pan:.15});}
 return {accents,fx};}
export function piroScore(index,duration,seed=0){const {grid,times,art}=Pmoments(index,duration),spec=PIRO_MUSIC[Pwrap(index)];
 return composeKaleido({...spec,...Pextras(spec,art,times)},{D:grid.L.D,L:grid.L,n:grid.n,m:grid.m,step:grid.step,time:grid.time,hits:times.map((time,i)=>({time,step:art.hits[i]*grid.m})),seed:Math.abs(Math.floor(seed||0))});}
// Adaptive quality, as in Vitralls and Natura: on a slow device the stars lose their glow, the trails get shorter, and the embers and
// the reflections are left out.
const P_QUALITY={ms:0,level:1,low:false,hold:0,drops:0,on:typeof document!=='undefined'};
export function piroQuality(){return {...P_QUALITY};}
export function piroAdaptive(on){Object.assign(P_QUALITY,{ms:0,level:1,low:false,hold:0,drops:0,on:!!on});}
export function piroMeasure(ms){const q=P_QUALITY;q.ms=q.ms*.92+ms*.08;if(q.hold>0)q.hold--;
 if(!q.low&&q.ms>22){q.low=true;q.hold=600*2**Math.min(q.drops,4);q.drops++;}else if(q.low&&q.hold<=0&&q.drops<3&&q.ms<11)q.low=false;
 q.level=q.low?0:1;}
export function drawPiro(c,w,h,o){const ph=kaleidoPhase(o.t,o.duration,o.reduced);if(ph.alpha<=0)return false;const {art,times}=Pmoments(o.index,o.duration);
 const seed=Math.abs(Math.floor(o.seed||0)),adaptive=P_QUALITY.on&&o.adaptive!==false&&typeof performance!=='undefined',t0=adaptive?performance.now():0;
 FwShow(c,w,h,{...o,seed,quality:adaptive?P_QUALITY.level:1},ph,art,times);if(adaptive)piroMeasure(performance.now()-t0);return true;}

// Dibuixos que ballen (CE32, 0.25): a press brings one big drawing of a single thick line on black. It draws itself, dances on
// itself to its own music for the length of «Durada dels efectes» and stops. The movements are counted in beats of the music, so
// every moment of the drawing (a wheel spoke at the top, a stick on the drum) falls on a note.
import {Kclamp,Ksmooth,K_TAU} from './kaleido-base.js';
import {DW_ART,dwDraw,dwPrepare,dwEnv} from './dibuixos-art.js';
import {musicNote,MUSIC_TRANSPOSE} from './kaleido-music.js';
import {SAMPLE_BANK} from './sampler.js';
export const DB_MIN_DURATION=10;
const dbWrap=(index,n)=>((index%n)+n)%n;
// ── The music ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each drawing dances to its own tune, on recorded acoustic instruments only (sampler.js), and the tune ends on struck and plucked
// notes. A tune has eight bars: A (four bars, repeated as long as the effect lasts) and B (four bars, always the last ones, with
// the cadence). Notation: one bar after another, separated by |; each note is degree:beats (degree 0 is the tonic, 7 the tonic an
// octave up; r is a rest). prog: the chord of each bar (a degree of the scale).
// bass, comp: [beat in the bar, step above the chord's root] and beats; arp: notes of the chord on every `every` beats; perc: unpitched
// instruments on beats of the bar (every `every` bars, from bar `at`); pulse: the note of the drawing's moments (a spoke at the top, a stick on the skin...), one every
// `pulse` beats of the drawing (dibuixos-art.js), as the chord's root (or a step above it, deg) near a centre.
const DB_POLKA={bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.62},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.4}};
const DB_WALTZ={bass:{inst:'celliPizzRec',pat:[[0,0]],center:45,vel:.6},comp:{inst:'harpRec',pat:[1,2],center:64,size:3,vel:.36}};
export const DB_MUSIC=Object.freeze([
 // Tramvia: a polka; the springs bounce on the bass of every beat, the bell rings every four bars.
 {bpm:132,meter:2,key:53,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'4:.5 4:.5 5:.5 4:.5|2:1 0:1|1:.5 2:.5 3:.5 4:.5|2:2|5:.5 5:.5 6:.5 5:.5|4:1 2:1|1:.5 3:.5 4:.5 1:.5|0:2',
  mel:{inst:'clarinetRec',target:70,vel:.6},par:{inst:'marimbaRec',shift:7,target:82,vel:.34},...DB_POLKA,
  perc:[{inst:'triangleRec',variant:'hit',pat:[0],every:4,vel:.42}],pulse:{inst:'celliPizzRec',center:43,vel:.62,bass:true}},
 // Timbal: a march; every beat a stick strikes the skin.
 {bpm:112,meter:2,key:58,mode:'ionian',prog:[0,0,0,4,0,3,4,0],tune:'0:.75 0:.25 2:.5 4:.5|7:1.5 4:.5|5:.5 4:.5 2:.5 0:.5|1:2|2:.75 2:.25 3:.5 4:.5|5:1.5 4:.5|3:.5 2:.5 1:.5 -1:.5|0:2',
  mel:{inst:'trumpetRec',target:70,vel:.62},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.55,len:.5},comp:{inst:'hornRec',pat:[.5,1.5],center:55,size:3,vel:.34,len:.3},
  perc:[{inst:'bassdrumRec',variant:'soft',pat:[0],vel:.5}],pulse:{inst:'snareRec',variant:'hit',vel:.5,accent:2}},
 // Ballarina: a waltz; she rises on her toes on the first beat of every bar, where the glockenspiel sparkles.
 {bpm:150,meter:3,key:57,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'4:2 2:1|4:2 7:1|6:2 5:1|4:3|5:2 3:1|2:2 0:1|1:1 2:1 3:1|0:3',
  mel:{inst:'violinsRec',target:76,vel:.5},...DB_WALTZ,pulse:{inst:'glockRec',center:88,deg:2,vel:.3}},
 // Veler: a barcarolle (two long beats a bar, each of three quavers); the sails fill on the first beat of every bar.
 {bpm:84,meter:2,key:62,mode:'ionian',prog:[0,0,4,0,0,3,4,0],tune:'4:.667 5:.333 4:.667 2:.333|4:2|3:.667 4:.333 5:.667 3:.333|2:2|7:.667 6:.333 5:.667 4:.333|5:1 4:1|3:.667 2:.333 1:.667 4:.333|0:2',
  mel:{inst:'fluteRec',target:79,vel:.58},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:45,vel:.55},arp:{inst:'harpRec',every:1/3,center:62,vel:.34},pulse:{inst:'harpRec',center:50,vel:.5}},
 // Trompeta: a fanfare in six-eight; a piston goes down on every beat, marked by the timpani (the tonic and the fifth in turn).
 {bpm:104,meter:2,key:60,mode:'ionian',prog:[0,0,4,4,3,0,4,0],tune:'0:.333 2:.333 4:.333 7:.667 4:.333|5:.667 4:.333 2:.667 0:.333|1:.333 2:.333 3:.333 4:.667 1:.333|4:1.667 r:.333|7:.667 6:.333 5:.667 4:.333|5:.333 4:.333 3:.333 2:1|1:.333 2:.333 3:.333 4:.333 6:.333 1:.333|0:2',
  mel:{inst:'trumpetRec',target:72,vel:.6},par:{inst:'hornRec',shift:-2,target:57,vel:.36},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.55},comp:{inst:'violinsPizzRec',pat:[.667,1.667],center:66,size:3,vel:.34},
  pulse:{inst:'timpaniRec',center:48,alt:[0,4],vel:.42}},
 // Malabarista: a circus galop; a throw on every beat, with the claves.
 {bpm:152,meter:2,key:55,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:.5 7:.5 4:.5 2:.5|3:.5 5:.5 3:.5 1:.5|4:.5 7:.5 9:.5 7:.5|8:1 4:1|5:.5 7:.5 5:.5 3:.5|4:.5 7:.5 4:.5 2:.5|1:.5 3:.5 4:.5 6:.5|7:1.5 r:.5',
  mel:{inst:'fluteRec',target:84,vel:.55},par:{inst:'marimbaRec',shift:0,target:72,vel:.38},...DB_POLKA,perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.2}],
  pulse:{inst:'woodblockRec',variant:'claves',vel:.46,accent:2}},
 // Globus aeri: a slow waltz in thirds; the burner puffs on the first beat of every bar (a low marimba note).
 {bpm:108,meter:3,key:50,mode:'ionian',prog:[0,0,4,0,3,4,4,0],tune:'2:2 4:1|7:2 6:1|5:1 4:1 3:1|2:3|5:2 7:1|6:2 4:1|4:1 2:1 1:1|0:3',
  mel:{inst:'fluteRec',target:79,vel:.52},par:{inst:'clarinetRec',shift:-2,target:68,vel:.36},...DB_WALTZ,pulse:{inst:'marimbaRec',center:57,vel:.44}},
 // Violí: a minuet; the bow turns on every beat, where the violin plays each note of the tune.
 {bpm:120,meter:3,key:55,mode:'ionian',prog:[0,3,4,0,3,0,4,0],tune:'4:1 2:1 4:1|7:1 6:1 5:1|4:1 5:1 3:1|2:1 1:1 0:1|5:1 7:1 5:1|4:1 2:1 4:1|1:1 3:1 6:1|7:1 4:1 0:1',
  mel:{inst:'violinsRec',target:76,vel:.52,pulse:true},...DB_WALTZ,comp:{inst:'harpRec',pat:[1,2],center:62,size:3,vel:.3}},
 // Gegant: a dance of giants in six-eight on the oboe (the nearest we have to a gralla) over the drum; he sways on every beat.
 {bpm:92,meter:2,key:55,mode:'mixolydian',prog:[0,0,6,0,3,0,6,0],tune:'4:.667 4:.333 5:.667 4:.333|2:1 0:1|1:.333 2:.333 3:.333 4:.667 3:.333|2:2|7:.667 6:.333 5:.667 4:.333|5:.333 4:.333 3:.333 2:1|1:.333 2:.333 3:.333 1:.667 -1:.333|0:2',
  mel:{inst:'oboeRec',target:74,vel:.58},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.58},comp:{inst:'violinsPizzRec',pat:[.667,1.667],center:64,size:3,vel:.3},
  pulse:{inst:'snareRec',variant:'hit',vel:.42,accent:2}},
 // Bicicleta: a light galop on the marimba, with the glockenspiel an octave up; a pizzicato each time a spoke reaches the top.
 {bpm:112,meter:2,key:63,mode:'ionian',prog:[0,4,4,0,3,0,4,0],tune:'0:.5 2:.5 4:.5 2:.5|1:.5 3:.5 4:1|4:.5 6:.5 8:.5 6:.5|7:2|5:.5 7:.5 9:.5 7:.5|4:.5 2:.5 4:1|1:.5 3:.5 6:.5 8:.5|7:2',
  mel:{inst:'marimbaRec',target:76,vel:.6},par:{inst:'glockRec',shift:0,target:91,vel:.22},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.55},
  pulse:{inst:'violinsPizzRec',center:67,alt:[0,2,4,2],vel:.42}},
 // Arpa: a lullaby in three; the harp plays each note of the tune on a string, over the violins and the plucked cellos.
 {bpm:104,meter:3,key:51,mode:'ionian',prog:[0,5,3,4,0,3,4,0],tune:'2:1 4:1 7:1|5:1 4:1 2:1|3:1 5:1 7:1|6:1 4:1 1:1|2:1 4:1 7:1|8:1 7:1 5:1|4:1 6:1 1:1|0:3',
  mel:{inst:'harpRec',target:74,vel:.62,pulse:true},bass:{inst:'celliPizzRec',pat:[[0,0]],center:43,vel:.55},pad:{inst:'violinsRec',center:62,vel:.26}},
 // Sardanistes: a dance in six-eight on the flute and the oboe in thirds; a foot taps on every beat, with the small drum.
 {bpm:88,meter:2,key:55,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:.667 5:.333 4:.667 2:.333|1:.667 2:.333 3:1|4:.667 7:.333 6:.667 5:.333|4:2|5:.667 6:.333 7:.667 5:.333|4:.667 5:.333 2:1|1:.667 2:.333 3:.667 1:.333|0:2',
  mel:{inst:'fluteRec',target:81,vel:.54},par:{inst:'oboeRec',shift:-2,target:72,vel:.34},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.55},arp:{inst:'harpRec',every:1/3,center:62,vel:.24},
  pulse:{inst:'snareRec',variant:'hit',vel:.3,accent:2}},
 // Tren de vapor: a quick two-four on the horn and the clarinet; the chimney puffs on every beat (a woodblock), the brushes of the
 // snare drum go between.
 {bpm:120,meter:2,key:50,mode:'ionian',prog:[0,0,4,4,3,0,4,0],tune:'0:.5 2:.5 4:.5 4:.5|5:.5 4:.5 2:1|1:.5 3:.5 4:.5 4:.5|6:.5 4:.5 1:1|7:.5 7:.5 5:.5 5:.5|4:.5 2:.5 0:1|1:.5 2:.5 3:.5 4:.5|0:1.5 r:.5',
  mel:{inst:'clarinetRec',target:68,vel:.58},par:{inst:'hornRec',shift:-7,target:52,vel:.3},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.5,len:.45},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.32},
  perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.16}],pulse:{inst:'woodblockRec',vel:.5,accent:2}},
 // Xilòfon: a two-four on the marimba, one note on every beat, where a mallet strikes a bar.
 {bpm:108,meter:2,key:60,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'0:1 2:1|4:1 7:1|5:1 4:1|2:1 0:1|1:1 3:1|5:1 6:1|4:1 2:1|1:1 0:1',
  mel:{inst:'marimbaRec',target:74,vel:.66,pulse:true},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.52},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:66,size:3,vel:.3},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[.5,1.5],vel:.24}]},
 // Director d'orquestra: a march for the whole orchestra; the baton comes down on every beat, with the bass.
 {bpm:104,meter:2,key:58,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'4:1 4:.5 5:.5|4:.5 2:.5 0:1|1:.5 2:.5 3:.5 1:.5|4:2|5:1 5:.5 6:.5|7:.5 5:.5 4:1|3:.5 2:.5 1:.5 6:.5|7:2',
  mel:{inst:'violinsRec',target:77,vel:.5},par:{inst:'hornRec',shift:-2,target:57,vel:.34},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.6},comp:{inst:'harpRec',pat:[.5,1.5],center:66,size:3,vel:.3},
  perc:[{inst:'timpaniRec',pitched:true,pat:[0],every:2,vel:.36}],pulse:{inst:'celliPizzRec',center:43,vel:.6,bass:true}},
 // Cotxe antic: a two-four of the 1920s on the clarinet over the tuba; the car hops every two beats, on the tuba.
 {bpm:116,meter:2,key:53,mode:'ionian',prog:[0,1,4,0,3,0,1,0],tune:'4:.75 2:.25 4:.5 5:.5|3:.75 1:.25 3:1|2:.5 4:.5 6:.5 5:.5|4:2|5:.75 7:.25 5:.5 4:.5|2:.5 4:.5 2:.5 0:.5|1:.5 3:.5 5:.5 3:.5|0:1.5 r:.5',
  mel:{inst:'clarinetRec',target:70,vel:.6},bass:{inst:'tubaRec',pat:[[0,0]],center:41,vel:.58,len:.6},comp:{inst:'violinsPizzRec',pat:[1],center:64,size:3,vel:.34},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[.5,1.5],vel:.22},{inst:'cymbalRec',variant:'soft',pat:[1],every:4,vel:.16}],pulse:{inst:'tubaRec',center:41,vel:.58,bass:true}},
 // Gralla: a tune for the gralla and the timbal, on the oboe (the nearest recorded instrument to a gralla) with the clarinet a third
 // under it; the small drum on every beat, where the bell lifts.
 {bpm:108,meter:2,key:62,mode:'mixolydian',prog:[0,0,0,4,0,6,4,0],tune:'4:.5 5:.25 4:.25 3:.5 2:.5|1:.5 2:.5 0:1|4:.5 5:.25 4:.25 3:.5 4:.5|5:.5 6:.5 7:1|7:.5 6:.25 5:.25 4:.5 5:.5|4:.5 3:.5 2:1|1:.5 2:.25 3:.25 4:.5 1:.5|0:1.5 r:.5',
  mel:{inst:'oboeRec',target:74,vel:.56},par:{inst:'clarinetRec',shift:-2,target:66,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.5},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.24},
  perc:[{inst:'bassdrumRec',variant:'soft',pat:[0],vel:.34}],pulse:{inst:'snareRec',variant:'hit',vel:.36,accent:2}},
 // Home orquestra: a polka on the trumpet; the plucked strings do the accordion's off-beats, and every stamp of the foot is a stroke
 // of the bass drum.
 {bpm:120,meter:2,key:53,mode:'ionian',prog:[0,4,4,4,0,3,4,0],tune:'0:.5 2:.5 4:.5 7:.5|6:.5 4:.5 5:1|3:.5 5:.5 4:.5 2:.5|1:.5 2:.5 3:1|4:.5 4:.25 5:.25 6:.5 4:.5|7:.5 6:.5 5:1|4:.5 3:.5 2:.5 1:.5|0:1.5 r:.5',
  mel:{inst:'trumpetRec',target:70,vel:.56},par:{inst:'clarinetRec',shift:-2,target:62,vel:.26},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.5,len:.45},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.3},
  perc:[{inst:'cymbalRec',variant:'soft',pat:[0],vel:.16},{inst:'triangleRec',variant:'hit',pat:[1.5],every:2,vel:.14}],pulse:{inst:'bassdrumRec',variant:'soft',vel:.56,accent:2}},
 // Avioneta: a breezy tune on the flute with the violins a third under it and a harp; the plane dips at the start of every bar, on
 // the plucked bass.
 {bpm:88,meter:2,key:62,mode:'ionian',prog:[0,0,4,0,3,1,4,0],tune:'4:1 5:.5 7:.5|9:1.5 7:.5|6:.5 5:.5 4:.5 2:.5|4:2|5:1 6:.5 7:.5|8:1 7:.5 5:.5|4:.5 2:.5 1:.5 2:.5|0:2',
  mel:{inst:'fluteRec',target:79,vel:.54},par:{inst:'violinsRec',shift:-2,target:72,vel:.28},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.56},arp:{inst:'harpRec',every:.5,center:64,vel:.24},
  perc:[{inst:'triangleRec',variant:'hit',pat:[0],every:4,vel:.2}],pulse:{inst:'celliPizzRec',center:43,vel:.56,bass:true}},
 // Tuba: oom-pah. The tuba plays every beat (oom) and the plucked strings the off-beats (pah); the trumpet sings the tune.
 {bpm:112,meter:2,key:58,mode:'ionian',prog:[0,0,3,3,0,4,4,0],tune:'4:.5 2:.5 4:.5 2:.5|4:1 r:1|5:.5 3:.5 5:.5 3:.5|5:1 r:1|7:.5 6:.5 5:.5 4:.5|3:.5 2:.5 1:1|2:.5 4:.5 1:.5 3:.5|0:1.5 r:.5',
  mel:{inst:'trumpetRec',target:70,vel:.54},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.64,len:.5},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.32},
  perc:[{inst:'cymbalRec',variant:'soft',pat:[0],every:4,vel:.16}],pulse:{inst:'tubaRec',center:41,vel:.64,bass:true}}
]);
// The level of each piece, in dB, so that the twenty sound about equally loud (measured offline as the app plays them, 0.25: from
// −23.9…−27.7 LUFS to about −24.5 in the review copy, next to Natura's −23.3…−25.1). Velocity is quadratic (synth.js), so dB/40.
const DB_LOUD=Object.freeze([-0.4,2.0,2.0,0.5,1.3,-0.6,0.9,2.9,1.2,0.8,2.5,1.4,2.5,1.1,1.7,2.6,1.9,3.2,1.4,2.3]);
// A collection of dancing drawings (0.26): its drawings, the music of each and its level. Joguines que ballen (joguines.js) and La
// cuina que balla (cuina.js) are collections like this one, danced, drawn and composed by the same functions.
export const DB_SET=Object.freeze({id:'drawings',art:DW_ART,music:DB_MUSIC,loud:DB_LOUD});
// The timeline: the drawing draws itself (draw s), dances a whole number of bars, slows down to a stop with the closing
// chord (settleAt) and fades away (fadeAt). «Lenta» makes the beat 1.3 times longer.
export function dbTimeline(index,duration,speed='normal',set=DB_SET){const i=dbWrap(index,set.art.length),dance=set.music[i],slow=speed==='slow',D=Math.max(.5,duration),beat=60/dance.bpm*(slow?1.3:1),meter=dance.meter,bar=beat*meter,draw=slow?1.8:1.4,fade=Math.min(.9,D*.12);
 const room=D-fade-1.7-draw,bars=Math.max(2,Math.floor(Math.max(0,room)/bar)),settleAt=Math.min(D-fade-.6,draw+bars*bar);
 return {D,i,beat,meter,bar,bars,draw,settleAt,stop:Math.min(1.4,Math.max(.4,D-fade-settleAt)),fade,fadeAt:D-fade};}
// The moment t: how much of the drawing is drawn (u), the motion clock in beats (b: it slows down smoothly to a stop after the dance)
// and the strength of the dance (e).
export function dbMoment(t,L,o={}){const u=Kclamp(t/L.draw),b=(t-L.draw)/L.beat,bs=(L.settleAt-L.draw)/L.beat,x=Kclamp((t-L.settleAt)/L.stop);
 const mb=t<L.draw?0:t<L.settleAt?b:bs+L.stop/L.beat*(x-x**3+x**4/2),e=(t<L.draw?0:Ksmooth(b))*(1-Ksmooth(x))*(o.reduced?.2:o.speed==='slow'?.8:1);
 return {u,b:mb,e,still:!!o.still};}
// The colour of the line («Color de la línia»): each drawing's own colours, or one colour for the whole drawing. On white, white
// becomes a dark line.
export const DB_COLORS=Object.freeze({yellow:'#ffd400',red:'#ff3b30',white:'#ffffff'});
export function dbColors(art,mode,white){if(mode==='own'||!DB_COLORS[mode])return art.colors.map(c=>white&&c==='#ffffff'?'#2a2433':c);const c=white&&mode==='white'?'#2a2433':DB_COLORS[mode];return [c,c];}
// Where the drawing goes: as big as the screen allows, with room for its movement, a little above the middle.
export function dbFit(art,w,h){const [x0,y0,x1,y1]=dwPrepare(art).box,bw=(x1-x0)*1.16,bh=(y1-y0)*1.12,S=Math.min(h*.84/bh,w*.92/bw);return {S,cx:w/2-S*(x0+x1)/2,cy:h*.5-S*(y0+y1)/2,lw:Math.max(4,S*26)};}
export function drawDibuixos(c,w,h,o){const set=o.set||DB_SET,L=dbTimeline(o.index,o.duration,o.speed,set),t=o.t;if(!(t>=0)||t>=L.D)return false;const art=set.art[L.i],white=o.base==='white';
 const m=dbMoment(t,L,o),fit=dbFit(art,w,h),alpha=1-Ksmooth((t-L.fadeAt)/L.fade);
 // The surroundings, with the decor only: complete, or veiled as much as «Visibilitat del decorat» says.
 const decor=o.preview?1:o.background==='full'?1:o.background==='dim'?Kclamp((o.opacity??25)/100):0;
 if(decor>0&&art.env){c.save();c.globalAlpha*=alpha*decor;dwEnv(c,art.env,{w,h,...fit,gy:fit.cy+art.ground*fit.S,b:m.b,e:m.e,color:white?'#aab2c4':'#465474',art,box:dwPrepare(art).box});c.restore();}
 dwDraw(c,art,{...fit,m,still:!!o.still,colors:dbColors(art,o.color||'own',white),white,edge:'#1d1824',alpha});return true;}

// ── Composing ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The bars of the tune: B always ends the dance; before it, as many bars of A as there is room for (a short dance keeps only the
// end of B).
export function dbBars(bars){const out=[];for(let j=0;j<bars-4;j++)out.push(j%4);for(let j=Math.max(0,4-bars);j<4;j++)out.push(4+j);return out;}
export function dbTune(spec){return spec.tune.split('|').map(bar=>bar.trim().split(/\s+/).map(x=>{const [d,len]=x.split(':');return {d:d==='r'?null:+d,len:+len};}));}
const dbNear=(m,center)=>{while(m<center-6)m+=12;while(m>center+6)m-=12;return m;};
function dbChord(spec,deg,center,size=3){const out=[];for(let i=0;i<size;i++)out.push(dbNear(musicNote(spec.key,spec.mode,deg+2*i),center));return [...new Set(out)].sort((a,b)=>a-b);}
// The octave that keeps a voice near the centre of its instrument and, in every round, within four semitones of its recorded notes.
function dbOctave(notes,inst,target){const zones=SAMPLE_BANK[inst].zones.map(z=>z[1]),lo=Math.min(...zones)-4-Math.min(...MUSIC_TRANSPOSE),hi=Math.max(...zones)+4-Math.max(...MUSIC_TRANSPOSE),mean=notes.reduce((a,b)=>a+b,0)/notes.length;
 let best=0,far=Infinity;for(let o=-3;o<=3;o++){if(Math.min(...notes)+12*o<lo||Math.max(...notes)+12*o>hi)continue;const f=Math.abs(mean+12*o-target);if(f<far){far=f;best=o;}}return 12*best;}
// The moments of a drawing: one every `pulse` beats, from the first beat of the dance to its last.
export function dbPulses(index,duration,speed='normal',set=DB_SET){const L=dbTimeline(index,duration,speed,set),every=set.art[L.i].pulse,out=[];for(let k=0;k*every<L.bars*L.meter-1e-9;k++)out.push(L.draw+k*every*L.beat);return out;}
export function dbScore(index,duration,seed=0,speed='normal',set=DB_SET){const L=dbTimeline(index,duration,speed,set),spec=set.music[L.i],D=L.D,shift=MUSIC_TRANSPOSE[Math.abs(Math.floor(seed||0))%3],tune=dbTune(spec),plan=dbBars(L.bars),out=[];
 const deg=d=>musicNote(spec.key,spec.mode,d),T=beat=>L.draw+beat*L.beat,end=L.settleAt;
 const add=(time,length,inst,midi,o={})=>{if(time>=D-.02||time<0)return;const len=Math.min(length,D-time);if(len<=.01)return;out.push({time,length:len,inst,midi:midi.slice(),...o});};
 // The melody, and its second voice, each in the octave that suits its instrument.
 const notes=[];plan.forEach((q,j)=>{let x=0;for(const n of tune[q]){if(n.d!==null)notes.push({beat:j*L.meter+x,len:n.len,d:n.d});x+=n.len;}});
 const mel=spec.mel,mo=dbOctave(notes.map(n=>deg(n.d)),mel.inst,mel.target);
 const every=set.art[L.i].pulse;for(const n of notes){const t=T(n.beat),len=Math.min(n.len*L.beat*.92,end-t),on=Math.abs(n.beat/every-Math.round(n.beat/every))<1e-6;add(t,len,mel.inst,[deg(n.d)+mo],{vel:mel.vel*(Number.isInteger(n.beat/L.meter)?1:.85),pan:0,...(mel.pulse&&on?{pulse:true}:{})});}
 if(mel.pulse)for(const t of dbPulses(index,duration,speed,set))if(!out.some(e=>e.pulse&&Math.abs(e.time-t)<1e-6)){const beat=(t-L.draw)/L.beat,q=plan[Math.min(plan.length-1,Math.floor(beat/L.meter))];add(t,L.beat*.9,mel.inst,[dbNear(deg(spec.prog[q]+2),mel.target-5)],{vel:mel.vel*.6,pan:.15,pulse:true});}
 if(spec.par){const p=spec.par,po=dbOctave(notes.map(n=>deg(n.d+p.shift)),p.inst,p.target);for(const n of notes)add(T(n.beat),Math.min(n.len*L.beat*.9,end-T(n.beat)),p.inst,[deg(n.d+p.shift)+po],{vel:p.vel,pan:-.28});}
 // The accompaniment, bar by bar on the chord of the bar.
 plan.forEach((q,j)=>{const ch=spec.prog[q],b0=j*L.meter;
  if(spec.bass){const b=spec.bass;for(const [x,step] of b.pat)add(T(b0+x),L.beat*(b.len||.9),b.inst,[dbNear(deg(ch+step),b.center)],{vel:b.vel*(x===0?1:.82),pan:-.12,...(spec.pulse?.bass&&(b0+x)%every===0?{pulse:true}:{})});}
  if(spec.comp){const k=spec.comp;for(const x of k.pat)add(T(b0+x),L.beat*(k.len||.45),k.inst,dbChord(spec,ch,k.center,k.size),{vel:k.vel,pan:.26,spread:.3});}
  if(spec.pad){const p=spec.pad;add(T(b0),Math.min(2.4,L.bar*.94),p.inst,dbChord(spec,ch,p.center,3),{vel:p.vel,pan:.2,spread:.5});}
  if(spec.arp){const a=spec.arp,tones=dbChord(spec,ch,a.center,3);const run=[...tones,tones[0]+12,...tones.slice(1).reverse()].slice(0,Math.round(L.meter/a.every));run.forEach((m,i)=>add(T(b0+i*a.every),L.beat*a.every*1.6,a.inst,[m],{vel:a.vel*(i%3===0?1:.78),pan:Math.sin(i*1.3)*.4}));}
  for(const p of spec.perc||[])if((j-(p.at||0))%(p.every||1)===0)for(const x of p.pat)add(T(b0+x),SAMPLE_BANK[p.inst].pitched?L.beat*.9:.4,p.inst,SAMPLE_BANK[p.inst].pitched?[dbNear(deg(ch),48)]:[60],{vel:p.vel,variant:p.variant,pan:p.pan||.2});});
 // The drawing's moments: a note on each (unless the bass already plays them).
 const pu=spec.pulse;if(pu&&!pu.bass&&!spec.mel.pulse)dbPulses(index,duration,speed,set).forEach((t,k)=>{const beat=(t-L.draw)/L.beat,q=plan[Math.min(plan.length-1,Math.floor(beat/L.meter))],ch=spec.prog[q];
  const pitched=SAMPLE_BANK[pu.inst].pitched;add(t,L.beat*.8,pu.inst,pitched?[dbNear(deg(ch+(pu.alt?pu.alt[k%pu.alt.length]:pu.deg||0)),pu.center)]:[60],{vel:pu.vel*(pu.accent&&k%pu.accent?.72:1),variant:pu.variant,pan:pu.pan||0,pulse:true});});
 // The press is answered at once: a harp chord over a low plucked note, and a harp run that climbs while the line draws itself.
 add(0,1.5,'harpRec',dbChord(spec,0,72,4),{vel:.66,strum:.04,spread:.5});add(0,1.2,'celliPizzRec',[dbNear(deg(0),41)],{vel:.6,pan:-.1});
 const run=[];for(let d=0;d<8;d++)run.push(dbNear(deg(d),66+d*1.6));run.forEach((m,i)=>add(.16+i*(L.draw-.3)/8,.5,'harpRec',[m],{vel:.3+.03*i,pan:-.4+i*.1}));
 // The end: the chord of the tonic, struck and plucked (harp, plucked cellos and a glockenspiel), when the dancing stops.
 add(end,Math.min(3,D-end),'harpRec',dbChord(spec,0,70,4),{vel:.62,strum:.06,spread:.5});add(end,1.6,'celliPizzRec',[dbNear(deg(0),41)],{vel:.62,pan:-.1});add(end+.06,1.8,'glockRec',[dbNear(deg(7),91)],{vel:.34,pan:.3});
 const loud=10**(set.loud[L.i]/40);
 return out.sort((a,b)=>a.time-b.time).map(({time,length,...e})=>({at:time/D,length:length/D,...e,vel:Math.min(1,(e.vel??.6)*loud),midi:SAMPLE_BANK[e.inst].pitched?e.midi.map(x=>x+shift):e.midi}));}

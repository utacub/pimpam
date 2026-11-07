// Natura (CE23): twenty geometric forms of nature cut from coloured paper. Each visual event and its note come from the same step
// grid, as in Caleidoscopi and Vitralls, so the sound lands on the change it accompanies.
import {Kclamp,Ksmooth,KeaseOut,Kmix,Krgba,K_TAU,kaleidoPhase,kaleidoGrid} from './kaleido-base.js';
import {NATURA_ART} from './natura-art.js';
import {composeKaleido,musicNote,MUSIC_TRANSPOSE} from './kaleido-music.js';
import {SAMPLE_BANK} from './sampler.js';
export const NATURA_MIN_DURATION=10;
export const NATURA_PATTERNS=Object.freeze([
 ['Gira-sol','les llavors arriben seguint l’angle d’or i dues corones de pètals s’obren al voltant'],
 ['Espiral de nautilus','les cambres d’una espiral d’or es posen una darrere l’altra, del centre cap enfora'],
 ['Floc de neu','un floc de neu de paper s’obre braç a braç i s’hi posen les branques i els cristalls'],
 ['Falguera','tres brots enrotllats es desenrotllen i obren les fulles; als peus esperen brots nous'],
 ['Dent de lleó','una esfera de llavors s’obre des del centre i algunes llavors s’envolen'],
 ['Bresca','les cel·les de cera apareixen anell a anell i s’omplen de mel i de pol·len de colors'],
 ['Romanesco','flors en forma de con creixen en espirals de Fibonacci que s’il·luminen per famílies'],
 ['Rodanxes de cítrics','rodanxes de taronja, llimona, llima i aranja es posen i giren a poc a poc'],
 ['Nervis d’una fulla','una fulla gran es posa i els nervis hi creixen des del pecíol fins a la punta'],
 ['Arbre en flor','un arbre creix branca a branca, dividint-se en dos, i floreix a cada punta'],
 ['Gotes a l’estany','gotes que cauen entre nenúfars dibuixen anells a l’aigua; al final s’obre una flor'],
 ['Dunes al capvespre','franges de cel, un sol que s’aixeca i onades de dunes de paper esquinçat'],
 ['Branca d’ametller','les flors s’obren una darrere l’altra al llarg d’una branca i alguns pètals cauen'],
 ['Dàlia','corones de pètals punxeguts s’obren de fora cap a dins, cada una d’un color'],
 ['Cactus en flor','tretze costelles, fileres d’arèoles i una corona de flors al centre'],
 ['Bombolles d’escuma','bombolles de sabó s’agrupen en una escuma, amb vores irisades'],
 ['Geoda de cristalls','franges d’àgata es tanquen cap al buit i hi creixen cristalls'],
 ['Anells d’un tronc','els anells de creixement apareixen del cor cap enfora, cada any d’un color'],
 ['Onada','una gran onada s’aixeca i s’enrotlla en tres franges de blau, amb escuma a la cresta'],
 ['Jardí mandala','corones de fulles, pètals, llavors i flors es posen del centre cap enfora']
].map(([name,movement],i)=>Object.freeze({id:'nat-'+String(i+1).padStart(2,'0'),plan:i+1,name,movement})));
const Nwrap=index=>((index%NATURA_ART.length)+NATURA_ART.length)%NATURA_ART.length;
function Nmoments(index,duration){const art=NATURA_ART[Nwrap(index)],grid=kaleidoGrid(duration,art.steps),times=art.hits.map(s=>grid.time(s*grid.m));return {art,grid,times};}
export function naturaEvents(index,duration){return Nmoments(index,duration).times;}
// Natura's melody family: short calls in the manner of birdsong (rising calls, repeated notes, trills, a cuckoo's falling third) on
// acoustic instruments only, recorded (sampler.js): flute, oboe, clarinet, harp, marimba, glockenspiel, strings, triangle and claves.
// Every motif lasts four beats, so four motifs fill the sixteen beats of a piece and end on the settle.
export const NATURA_MOTIFS=Object.freeze({
 A:{n:[0,2,4,7],r:[.5,.5,1,2]},          // alba: a call that rises to the octave
 B:{n:[4,5,7,5,4],r:[.5,.5,1.5,.5,1]},   // merla: a turn round the sixth
 C:{n:[4,2,4,2],r:[1,1,1,1]},            // cucut: the falling third, twice
 D:{n:[7,7,7,5,4],r:[.5,.5,.5,.5,2]},    // pit-roig: repeated notes that fall
 E:{n:[7,5,4,2,4],r:[.5,.5,.5,.5,2]},    // rierol: a brook running down
 F:{n:[2,4,5,4],r:[1,.5,.5,2]},          // brot: a bud opening
 G:{n:[7,4,5],r:[1,.5,2.5]},             // gota: a drop and its ring
 H:{n:[2,4,5,7,4],r:[1,.5,.5,1,1]},      // brisa: a breeze up and back
 N:{n:[4,2,0,2],r:[1,.5,.5,2]},          // niu: down to the nest
 T:{n:[4,5,4,5,4,2],r:[.25,.25,.25,.25,1,2]}, // refila: a trill
 K:{n:[2,1,0],r:[1,1,2]},                // repòs: home
 Q:{n:[4,2,1,0],r:[.5,.5,1,2]}           // repòs cantat: home with a turn
});
const N_TARGET={fluteRec:79,oboeRec:74,clarinetRec:68,violinsRec:74,marimbaRec:76,glockRec:88,harpRec:74};
// The octave that centres the melody where its instrument sounds best and keeps it, in every round, within four semitones of
// the instrument's recorded notes (a recording retuned further than that loses its character).
function Noctave(key,mode,phrases,inst){const mid=phrases.flatMap(([name,shift=0])=>NATURA_MOTIFS[name].n.map(d=>musicNote(key,mode,d+shift))),mean=mid.reduce((a,b)=>a+b,0)/mid.length,zones=SAMPLE_BANK[inst].zones.map(z=>z[1]);
 const lo=Math.min(...zones)-4-Math.min(...MUSIC_TRANSPOSE),hi=Math.max(...zones)+4-Math.max(...MUSIC_TRANSPOSE),fits=o=>Math.min(...mid)+12*o>=lo&&Math.max(...mid)+12*o<=hi,far=o=>Math.abs(mean+12*o-(N_TARGET[inst]||76));
 let best=null;for(let o=-1;o<4;o++)if(fits(o)&&(best===null||far(o)<far(best)))best=o;return best??0;}
// Nature sounds. Each form names the sounds it calls for (sounds of SAMPLE_BANK.natureRec), heard under the whole piece.
// If one of them is not in the collection, the form imitates its nature on the acoustic instruments instead (composeKaleido, mimic).
const N_HAS=sound=>SAMPLE_BANK.natureRec.zones.some(z=>z[9]===sound);
// Levels, measured against the music: steady beds (rain, crickets, a meadow) a little lower, and sparse drops lower still, since
// each drop is as loud as a note.
const N_LEVEL={rain:.45,crickets:.42,meadow:.45,drops:.4,bubbles:.4,drips:.42};
function Nambience(a){if(!a)return {};const sounds=[].concat(a.sound);
 return {ambience:a,...(sounds.every(N_HAS)?{nature:sounds.map(sound=>({sound,vel:a.vel??N_LEVEL[sound]??.5}))}:{mimic:a.mimic})};}
const N_BIRDS=(salt=0,every=2.4)=>({kind:'calls',range:[84,95],every,vel:.5,width:.85,salt});
const N_RAIN={kind:'drops',inst:'violinsPizzRec',range:[74,88],every:.32,vel:.36,width:.9};
const N_POND={kind:'drops',inst:'marimbaRec',range:[74,88],every:1,vel:.4,penta:true};
const N_FROGS={kind:'frogs',every:2.3,vel:.36,width:.8};
const N_WAVES={kind:'waves',range:[55,86],count:9,every:3.8,vel:.42,width:.7};
const N_ICE={kind:'drops',inst:'glockRec',range:[86,100],every:1.3,vel:.42,penta:true,rev:.6};
const N_DRIPS={kind:'drops',inst:'glockRec',range:[84,98],every:1.5,vel:.45,penta:true,rev:.75};
const N_BUBBLES={kind:'bubbles',range:[72,88],every:.95,vel:.35,count:4,penta:true};
const N_CRICKETS=(salt=0,every=1.15)=>({kind:'crickets',every,vel:.36,width:.7,salt});
// A piece of the collection: the collection's defaults, which each piece can change. The bass and the bourdon sit an octave higher than
// in the other collections, inside the range of the cellos.
function Npiece(p){const melody={inst:'fluteRec',vel:.66,grace:true,...p.melody};melody.oct=Noctave(p.key,p.mode,melody.phrases,melody.inst);
 // The second voice (a third below, mostly) finds the octave of its own instrument.
 if(melody.par){const par={inst:'clarinetRec',vel:.42,...melody.par};par.oct??=Noctave(p.key,p.mode,melody.phrases.map(([name,shift=0])=>[name,shift+par.shift]),par.inst);melody.par=par;}
 return {key:p.key,mode:p.mode,meter:4,prog:p.prog,motifs:NATURA_MOTIFS,melody,
  arp:p.arp===false?undefined:{inst:'harpRec',shape:'updown',per:2,center:64,vel:.46,pan:.45,hold:2,...p.arp},
  bass:p.bass===false?undefined:{inst:'celliPizzRec',rhythm:[0,2],notes:[0,4],oct:1,vel:.62,end:'celliRec',...p.bass},
  drone:p.drone?{inst:'celliRec',notes:[0,4],oct:-1,vel:.3,...p.drone}:undefined,
  pad:p.pad?{inst:'violinsRec',center:66,vel:.42,...p.pad}:undefined,
  lead:p.lead===false?undefined:{inst:'glockRec',line:[7],oct:2,chord:2,len:4,vel:.46,...p.lead},
  beats:p.beats,onset:{inst:'harpRec',center:70,vel:.74,strum:.045,low:'celliPizzRec',lowOct:1,lowVel:.7,...p.onset},
  final:{inst:'harpRec',center:72,size:4,strum:.07,vel:.66,...p.final},sparkle:p.sparkle||'glockRec',sparkleDeg:p.sparkleDeg??14,...Nambience(p.ambience)};}
const N_CLAVES=(pat,vel=.42)=>({inst:'woodblockRec',variant:'claves',pat,vel,pan:.3,from:2});
const N_TRIANGLE=(pat,vel=.4)=>({inst:'triangleRec',variant:'muted',pat,vel,pan:-.35,from:4});
export const NATURA_MUSIC=Object.freeze([
 Npiece({key:55,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['A',0],['B',-1],['C',2],['K',0]]},beats:[N_CLAVES('x.x.')],ambience:{sound:'meadow',mimic:[N_BIRDS(0)]}}),
 Npiece({key:53,mode:'lydian',prog:[0,1,4,0],melody:{inst:'clarinetRec',phrases:[['H',0],['E',1],['G',-1],['Q',0]]},arp:{shape:'up',climb:12},pad:{},bass:{rhythm:[0]},ambience:{sound:'waves',mimic:[N_WAVES]}}),
 Npiece({key:57,mode:'lydian',prog:[0,1,4,0],melody:{inst:'glockRec',grace:false,vel:.6,phrases:[['D',0],['T',1],['G',-1],['K',0]]},arp:{shape:'random',center:72,vel:.38},pad:{center:72,vel:.36},lead:{inst:'harpRec',oct:1,chord:3,strum:.04,vel:.5},bass:false,drone:{vel:.26},sparkle:'triangleRec',ambience:{sound:'wind',mimic:[N_ICE]}}),
 Npiece({key:50,mode:'dorian',prog:[0,3,6,0],melody:{inst:'oboeRec',phrases:[['F',0],['B',-1],['E',-1],['K',0]]},arp:{inst:'marimbaRec',shape:'broken',center:66,vel:.42},drone:{},ambience:{sound:'brook',mimic:[N_POND]}}),
 Npiece({key:58,mode:'ionian',prog:[0,5,3,0],melody:{phrases:[['A',0],['D',5],['G',3],['Q',0]]},arp:{inst:'violinsPizzRec',shape:'random',center:72,vel:.44},pad:{},bass:{rhythm:[0]},sparkle:'triangleRec',ambience:{sound:'wind',mimic:[N_BIRDS(1,2.8)]}}),
 Npiece({key:55,mode:'ionian',prog:[0,4,5,0],melody:{inst:'marimbaRec',grace:false,vel:.7,phrases:[['D',0],['T',2],['E',-2],['K',0]]},beats:[N_CLAVES('x.xx')],ambience:{sound:'meadow',mimic:[N_BIRDS(2)]}}),
 Npiece({key:52,mode:'mixolydian',prog:[0,6,3,0],melody:{phrases:[['H',0],['C',2],['B',1],['Q',0]],par:{shift:-2,from:6}},arp:{shape:'wave'},ambience:{sound:'dawn',mimic:[N_BIRDS(3,2)]}}),
 Npiece({key:57,mode:'ionian',prog:[0,3,4,0],melody:{inst:'oboeRec',phrases:[['N',0],['A',3],['D',-3],['K',0]]},arp:{inst:'violinsPizzRec',shape:'up',center:70,vel:.44},beats:[N_CLAVES('X.x.')],ambience:{sound:'blackbird',mimic:[N_BIRDS(4)]}}),
 Npiece({key:53,mode:'dorian',prog:[0,3,4,0],melody:{inst:'clarinetRec',phrases:[['F',0],['F',1],['E',4],['K',0]]},arp:{shape:'up'},pad:{},drone:{},bass:false,ambience:{sound:'rain',mimic:[N_RAIN]}}),
 Npiece({key:50,mode:'ionian',prog:[0,5,3,0],melody:{phrases:[['A',0],['H',0],['B',3],['Q',0]],par:{shift:-2,from:5}},arp:{shape:'up',climb:7},ambience:{sound:'blackbird',mimic:[N_BIRDS(5,2.2)]}}),
 Npiece({key:55,mode:'lydian',prog:[0,1,4,0],melody:{phrases:[['G',0],['G',1],['C',0],['K',0]]},arp:{inst:'violinsPizzRec',shape:'random',center:72,vel:.42,mask:'x.xx'},pad:{},lead:{inst:'marimbaRec',oct:1,chord:2,vel:.5},bass:{inst:'celliRec',rhythm:[0],vel:.5},ambience:{sound:['drops','frogs'],mimic:[N_POND,N_FROGS]}}),
 Npiece({key:50,mode:'dorian',prog:[0,6,3,0],melody:{inst:'oboeRec',phrases:[['F',0],['E',-1],['H',-2],['Q',0]]},arp:{per:1,center:62,vel:.42},pad:{center:62},drone:{},bass:false,ambience:{sound:'crickets',mimic:[N_CRICKETS(0),N_CRICKETS(3,1.6)]}}),
 Npiece({key:58,mode:'ionian',prog:[0,5,3,0],melody:{phrases:[['C',0],['D',-2],['N',1],['K',0]]},arp:{shape:'random',penta:true,center:72,vel:.42},lead:{vel:.42},bass:{rhythm:[0]},ambience:{sound:'dawn',mimic:[N_BIRDS(6,2)]}}),
 Npiece({key:52,mode:'lydian',prog:[0,1,4,0],melody:{inst:'violinsRec',grace:false,vel:.6,phrases:[['A',0],['B',1],['G',1],['Q',0]]},arp:{shape:'broken'},ambience:{sound:'meadow',mimic:[N_BIRDS(7)]}}),
 Npiece({key:57,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'marimbaRec',grace:false,vel:.7,phrases:[['N',0],['T',4],['E',3],['K',0]]},arp:{inst:'violinsPizzRec',shape:'updown',center:66,vel:.42},beats:[N_CLAVES('X.xX')],lead:{inst:'harpRec',oct:1,chord:2,vel:.48},ambience:{sound:'crickets',mimic:[N_CRICKETS(1,1.3)]}}),
 Npiece({key:56,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['T',0],['T',3],['D',4],['Q',0]]},arp:{inst:'violinsPizzRec',shape:'random',center:74,vel:.42},lead:{inst:'marimbaRec',oct:1,chord:2,vel:.5},beats:[N_TRIANGLE('x...')],bass:{rhythm:[0,3]},ambience:{sound:'bubbles',mimic:[N_BUBBLES]}}),
 Npiece({key:53,mode:'aeolian',prog:[0,5,6,0],melody:{inst:'clarinetRec',phrases:[['H',0],['G',-2],['F',4],['K',0]]},arp:{inst:'glockRec',shape:'up',center:86,vel:.34},lead:{inst:'harpRec',oct:1,chord:3,strum:.05,vel:.48},pad:{},drone:{},bass:false,ambience:{sound:'drips',mimic:[N_DRIPS]}}),
 Npiece({key:52,mode:'dorian',prog:[0,3,6,0],melody:{inst:'oboeRec',phrases:[['F',0],['N',1],['B',-1],['K',0]]},arp:{inst:'marimbaRec',shape:'updown',center:64,vel:.44},drone:{},beats:[N_CLAVES('..x.')],ambience:{sound:'wind',mimic:[N_BIRDS(8,2.6)]}}),
 Npiece({key:55,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'violinsRec',grace:false,vel:.74,phrases:[['H',0],['E',-1],['H',3],['Q',0]]},arp:{shape:'wave',climb:7},drone:{},bass:false,ambience:{sound:'waves',vel:.42,mimic:[{...N_WAVES,vel:.34}]}}),
 Npiece({key:57,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['A',0],['B',1],['D',4],['Q',0]],par:{shift:-2,from:4}},arp:{shape:'broken'},lead:{chord:3},beats:[N_CLAVES('X.x.'),N_TRIANGLE('...x')],final:{size:5},ambience:{sound:'dawn',mimic:[N_BIRDS(9,2)]}})
]);
export function naturaScore(index,duration,seed=0){const {grid,times,art}=Nmoments(index,duration),spec=NATURA_MUSIC[Nwrap(index)];
 return composeKaleido(spec,{D:grid.L.D,L:grid.L,n:grid.n,m:grid.m,step:grid.step,time:grid.time,hits:times.map((time,i)=>({time,step:art.hits[i]*grid.m})),seed:Math.abs(Math.floor(seed||0))});}
// Adaptive quality, as in Vitralls: on a slow device the paper grain and the soft shadows give way to lighter versions.
const N_QUALITY={ms:0,level:1,low:false,hold:0,drops:0,on:typeof document!=='undefined'};
export function naturaQuality(){return {...N_QUALITY};}
export function naturaAdaptive(on){Object.assign(N_QUALITY,{ms:0,level:1,low:false,hold:0,drops:0,on:!!on});}
export function naturaMeasure(ms){const q=N_QUALITY;q.ms=q.ms*.92+ms*.08;if(q.hold>0)q.hold--;
 if(!q.low&&q.ms>22){q.low=true;q.hold=600*2**Math.min(q.drops,4);q.drops++;}else if(q.low&&q.hold<=0&&q.drops<3&&q.ms<11)q.low=false;
 const target=q.low?0:1;q.level+=(target-q.level)*.04;if(Math.abs(q.level-target)<.01)q.level=target;}
// Onset: a soft warm light answers the press in the very first frame, while the paper is still landing.
function Nbloom(c,w,h,ph,o,color){const x=Kclamp(ph.t/.8);if(x>=1)return;const S=Math.min(w,h),r=S*(.08+(o.reduced?.14:.3)*KeaseOut(x)),g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,r),white=o.base==='white';
 g.addColorStop(0,Krgba(white?color:Kmix(color,'#ffffff',.3),.6*(1-Ksmooth(x))));g.addColorStop(.6,Krgba(color,.22*(1-Ksmooth(x))));g.addColorStop(1,Krgba(color,0));c.save();c.globalCompositeOperation=white?'source-over':'lighter';c.fillStyle=g;c.beginPath();c.arc(w/2,h/2,r,0,K_TAU);c.fill();c.restore();}
export function drawNatura(c,w,h,o){const ph=kaleidoPhase(o.t,o.duration,o.reduced);if(ph.alpha<=0)return false;const {art,grid,times}=Nmoments(o.index,o.duration);
 const seed=Math.abs(Math.floor(o.seed||0)),adaptive=N_QUALITY.on&&o.adaptive!==false&&typeof performance!=='undefined';
 const opts={...o,seed,hitT:times,hitE:art.hits.map(s=>s/art.steps),step:grid.step*grid.m,quality:adaptive?N_QUALITY.level:1};
 Nbloom(c,w,h,ph,opts,art.accent[seed%3]);const t0=adaptive?performance.now():0;c.save();c.globalAlpha*=ph.alpha;art.draw(c,w,h,ph,opts);c.restore();if(adaptive)naturaMeasure(performance.now()-t0);return true;}

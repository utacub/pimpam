// Vitralls (CE22): twenty stained-glass windows full of colour, without text, lit from behind. Each visual event and its
// note come from the same step grid, as in Caleidoscopi, so the sound lands on the change it accompanies.
import {Kclamp,Ksmooth,KeaseOut,Kmix,Krgba,K_TAU,kaleidoPhase,kaleidoGrid} from './kaleido-base.js';
import {VITRALL_ART} from './vitrall-art.js';
import {composeKaleido,musicNote,musicKit} from './kaleido-music.js';
import {RECORDED_FOLD} from './kaleido.js';
// The windows last two seconds longer than the kaleidoscope patterns, so the music has time for a whole dance phrase.
export const VITRALL_MIN_DURATION=10;
// Musical style of the collection: early dance music (branle, galliard, saltarello). A bourdon on the organ, a recorder melody
// with ornaments, a lute or dulcimer accompaniment, tabor and jingles, and a carillon on each visual event. The pieces are written
// for these built-in instruments and played by recorded ones (see V_KIT below).
// The melodies of all twenty pieces are made of the same short cells, in degrees above the root of the chord they are sung over,
// with durations in beats: binary cells of four beats and ternary cells of three. Pieces vary them (moved to another chord,
// inverted, played backwards, slower or faster), so the collection sounds like one family of tunes.
export const VITRALL_MOTIFS=Object.freeze({
 A:{n:[0,1,2,4],r:[1,.5,.5,2]},        // entrada: steps up to the fifth
 B:{n:[4,3,2,4,2],r:[1,.5,.5,1,1]},    // branle: falls and turns back
 C:{n:[4,5,4,3,4],r:[.5,.5,.5,.5,2]},  // volta: a turn round the fifth
 D:{n:[7,4,2,4],r:[1,1,1,1]},          // baixada: down the chord and back
 S:{n:[0,4,7,4],r:[1,1,1,1]},          // salt: leaps to the octave
 R:{n:[4,4,2,4,7],r:[1,.5,.5,1,1]},    // repic: a peal of the fifth
 K:{n:[2,1,-1,0],r:[1,.5,.5,2]},       // cadència: home through the leading note
 T:{n:[0,2,4],r:[1.5,.5,1]},           // gallarda: long, short, long
 U:{n:[4,5,4,2],r:[1,.5,.5,1]},        // saltarello: a quick neighbour
 W:{n:[7,4,2,4],r:[1,.5,.5,1]},        // roda: down the chord in three
 X:{n:[0,4,2,7],r:[1,.5,.5,1]},        // brinc: a jump up and over
 Q:{n:[2,1,-1,0],r:[.5,.5,.5,1.5]}     // cadència en tres
});
const V_PERC={3:{tabor:'X.x',jingle:'.x.'},4:{tabor:'X.x.',jingle:'..x.'},6:{tabor:'X.xX.x',jingle:'.x..x.'}};
const V_TARGET={recorder:77,flute:77,dulcimer:72,carillon:72};
// The octave that centres the melody where its instrument sounds best (and never above B6).
function Voctave(key,mode,phrases,inst){const ds=phrases.flatMap(([name,shift=0])=>VITRALL_MOTIFS[name].n.map(d=>d+shift)),mid=ds.map(d=>musicNote(key,mode,d));
 const mean=mid.reduce((a,b)=>a+b,0)/mid.length,top=Math.max(...mid);let best=0;for(let o=0;o<4;o++)if(top+12*o<=95&&Math.abs(mean+12*o-(V_TARGET[inst]||76))<Math.abs(mean+12*best-(V_TARGET[inst]||76)))best=o;return best;}
// A piece of the collection: everything the composer needs, with the collection's defaults.
function Vpiece(p){const meter=p.meter||4,melody={inst:'recorder',vel:.7,grace:true,...p.melody},inst=melody.inst;melody.oct=Voctave(p.key,p.mode,melody.phrases,inst);
 if(melody.par)melody.par={oct:melody.oct,...melody.par};
 return {key:p.key,mode:p.mode,meter,prog:p.prog,changes:meter===4?undefined:p.prog.map((_,i)=>i*3),motifs:VITRALL_MOTIFS,melody,
  drone:{inst:'organ',notes:[0,4],oct:-1,vel:.34,...p.drone},
  arp:p.arp===false?undefined:{inst:'lute',shape:'updown',per:2,center:64,vel:.32,pan:.45,...p.arp},
  perc:p.perc===false?undefined:{...V_PERC[meter],from:2,level:.75,...p.perc},
  pad:p.pad,lead:{inst:'carillon',line:[7],oct:1,chord:2,len:4,vel:.5,...p.lead},
  onset:{inst:'harp',center:70,vel:.7,...p.onset},final:{inst:'carillon',center:76,size:4,strum:.08,vel:.62,...p.final},sparkle:p.sparkle||'carillon',shimmer:p.shimmer};}
export const VITRALL_MUSIC=Object.freeze([
 Vpiece({key:50,mode:'mixolydian',prog:[0,6,3,0],melody:{phrases:[['A',0],['A',-1],['B',3],['K',0]],par:{shift:-2,from:4,vel:.34}},arp:{mask:'xx.x'}}),
 Vpiece({key:57,mode:'ionian',meter:3,prog:[0,4,5,3,0],melody:{phrases:[['T',0],['U',4],['W',-2],['X',3],['Q',0]]},arp:{inst:'dulcimer',shape:'up',center:66},shimmer:true}),
 Vpiece({key:52,mode:'dorian',prog:[0,3,6,0],melody:{phrases:[['S',0],['C',3],['R',-1],['K',0]]},arp:{inst:'dulcimer',shape:'random'},lead:{inst:'glass',oct:1}}),
 Vpiece({key:55,mode:'ionian',meter:6,prog:[0,3,4,5,0],melody:{inst:'dulcimer',vel:.78,grace:false,phrases:[['X',0],['T',3],['W',4],['U',5],['Q',0]]},arp:{shape:'broken'},lead:{len:3}}),
 Vpiece({key:53,mode:'dorian',prog:[0,6,3,0],melody:{inst:'flute',grace:false,glide:true,vel:.65,phrases:[['A',0],['D',-1],['C',3],['K',0]]},arp:{inst:'dulcimer',shape:'broken'},perc:{tabor:'X.xx',jingle:'.x.x'},drone:{vel:.39}}),
 Vpiece({key:48,mode:'ionian',meter:3,prog:[0,5,3,4,0],melody:{phrases:[['T',0],['W',-2],['X',3],['U',4],['Q',0]],par:{shift:-2,from:3,vel:.34}},arp:{inst:'harp'},shimmer:true}),
 Vpiece({key:58,mode:'lydian',meter:6,prog:[0,1,0,4,0],melody:{phrases:[['X',0],['U',1],['T',0],['W',4],['Q',0]]},arp:{shape:'up'}}),
 Vpiece({key:51,mode:'ionian',prog:[0,5,4,0],melody:{phrases:[['S',0],['A',5],['C',4],['K',0]],par:{inst:'organ',shift:-4,vel:.26}},pad:{inst:'choir',vowel:'o',center:62,vel:.34},perc:{tabor:'X..x',jingle:''}}),
 Vpiece({key:55,mode:'mixolydian',meter:3,prog:[0,6,3,6,0],melody:{phrases:[['X',0],['W',-1],['U',3],['T',-1],['Q',0]]},arp:{inst:'dulcimer',shape:'random'},perc:{jingle:'.xx'}}),
 Vpiece({key:53,mode:'ionian',meter:3,prog:[0,3,5,4,0],melody:{inst:'carillon',grace:false,vel:.65,phrases:[['T',0],['X',3],['W',-2],['U',4],['Q',0]]},arp:false,lead:{inst:'harp',chord:3,strum:.05,vel:.52},pad:{inst:'choir',vowel:'a',center:62,vel:.31},drone:{vel:.42},perc:{tabor:'X..',jingle:''}}),
 Vpiece({key:57,mode:'mixolydian',meter:3,prog:[0,4,6,3,4,0],melody:{phrases:[['T',0],['U',4],['W',-1],['X',3],['W',4],['Q',0]],par:{shift:2,from:9,vel:.34}},arp:{inst:'harp'},lead:{len:3}}),
 Vpiece({key:52,mode:'mixolydian',prog:[0,6,3,0],melody:{inst:'dulcimer',vel:.78,grace:false,phrases:[['R',0],['S',-1],['C',3],['K',0]]},arp:{inst:'harp',shape:'wave'},lead:{inst:'glass'},perc:{jingle:'x.x.'}}),
 Vpiece({key:55,mode:'lydian',prog:[0,1,4,0],melody:{phrases:[['A',0],['A',1],['D',4],['K',0]],par:{shift:-2,from:4,vel:.34}},arp:{inst:'harp',shape:'up',climb:12},shimmer:true}),
 Vpiece({key:51,mode:'ionian',meter:6,prog:[0,3,0,4,5,0],melody:{phrases:[['X',0],['T',3],['U',0],['W',4],['T',-2],['Q',0]]},arp:{shape:'broken'}}),
 Vpiece({key:58,mode:'mixolydian',prog:[0,4,6,0],melody:{inst:'flute',grace:false,glide:true,vel:.65,phrases:[['S',0],['D',4],['A',-1],['K',0]]},arp:{inst:'dulcimer'}}),
 Vpiece({key:50,mode:'dorian',meter:3,prog:[0,3,6,3,0],melody:{phrases:[['T',0],['X',3],['W',-1],['U',3],['Q',0]],par:{inst:'dulcimer',shift:2,vel:.39}},arp:{shape:'up'}}),
 Vpiece({key:53,mode:'lydian',meter:3,prog:[0,1,4,5,0],melody:{inst:'flute',grace:false,glide:true,vel:.65,phrases:[['T',0],['U',1],['W',4],['X',-2],['Q',0]]},arp:{inst:'harp',shape:'wave'},lead:{inst:'glass'},perc:{tabor:'X..',jingle:'..x'},shimmer:true}),
 Vpiece({key:55,mode:'ionian',meter:6,prog:[0,5,3,4,0],melody:{phrases:[['X',0],['T',-2],['U',3],['W',4],['Q',0]],par:{shift:-2,from:3,vel:.34}}}),
 Vpiece({key:52,mode:'ionian',meter:6,prog:[0,3,0,4,0],melody:{phrases:[['T',0],['U',3],['X',0],['W',4],['Q',0]]},arp:{inst:'harp',shape:'wave'},lead:{inst:'dulcimer'}}),
 Vpiece({key:50,mode:'ionian',prog:[0,3,4,0],melody:{phrases:[['S',0],['B',3],['C',4],['K',0]],par:{inst:'organ',shift:-4,vel:.26}},drone:{notes:[0,4,7]},perc:{tabor:'X.xx',jingle:'x.x.'},lead:{len:3},final:{size:5},shimmer:true})
]);
// Recorded orchestration (since 0.10.1), as in Caleidoscopi: the same pieces on recordings of real instruments. The recorder and the
// flute become a flute (two flutes where the melody has a second voice: a recorder consort), the lute and the harp a harp, the dulcimer
// pizzicato violins, the carillon and the glass a glockenspiel, the tabor a soft bass drum and the jingles a triangle. The organ
// bourdon, which sounded synthetic, becomes the cellos bowing the open fifth once a bar, as a player would, until the settle, where a
// plucked note closes it; the organ's second voice becomes a clarinet, and a carillon melody a marimba (the glockenspiel would take it
// two octaves up). amp: measured as in Caleidoscopi (the tabor 2.5 dB under its measure, the most the soft bass drum gives on the accents
// before its velocity would reach the top); a name with a colon is one part of a built-in instrument with a recording of its own.
const V_KIT=musicKit({harp:['harpRec',.6],lute:['harpRec',.56],dulcimer:['violinsPizzRec',.51],recorder:['fluteRec',.91],flute:['fluteRec',.72],carillon:['glockRec',.97],glass:['glockRec',.99],
 choir:['violinsRec',.47],organ:['celliRec',.57],'organ:par':['clarinetRec',.68],bass:['celliPizzRec',1.4],tabor:['bassdrumRec',1.33,'soft'],jingle:['triangleRec',.38,'hit'],thump:['bassdrumRec',1.35,'soft'],shimmer:null,
 'carillon:melody':['marimbaRec',.65],'carillon:sparkle':['glockRec',1.15]});
function Vrecorded(s){const me=s.melody,melody={...me,inst:me.inst==='carillon'?'carillon:melody':me.inst};if(me.par)melody.par={...me.par,inst:me.par.inst==='organ'?'organ:par':me.par.inst??melody.inst};
 return {...s,kit:V_KIT,fold:RECORDED_FOLD,melody,sparkle:s.sparkle+':sparkle',
 drone:{...s.drone,every:s.meter,maxBow:2.4,stop:true,end:'bass',endVel:.6},final:{...s.final,inst:'harp',center:70},pad:s.pad&&{...s.pad,tail:1.2}};}
export const VITRALL_RECORDED=Object.freeze(VITRALL_MUSIC.map(Vrecorded));
export const VITRALL_PATTERNS=Object.freeze([
 ['Rosassa gòtica','una rosassa de dotze pètals que s’encén anell a anell; els anells giren a poc a poc en sentits oposats'],
 ['Sol del Palau','un sol daurat de vidre entre anells de gotes blaves, amb ones de llum que surten del centre'],
 ['Mosaic de colors','una quadrícula de vidres irregulars que canvien de color en onades diagonals'],
 ['Composició','línies de plom que creixen i divideixen el vitrall en camps de vermell, groc i blau'],
 ['Estrella de vuit puntes','una rosassa d’estrella de vuit puntes amb colors que circulen pels anells'],
 ['Flors de Tiffany','tres flors de vidre opalescent que s’obren una darrere l’altra sobre un prat de vidre clar'],
 ['Ventall de sol','un sol que s’obre com un ventall i s’encén franja a franja'],
 ['Tres lancetes','tres finestres gòtiques de rombes on la llum puja, coronades per un medalló que gira'],
 ['Trencadís','trossos de vidre que arriben de tots costats i formen una espiral de color'],
 ['Columnes de llum','dues finestres altes de cel·les de vidre amb colors que flueixen de freds a càlids'],
 ['Medallons','nou medallons rodons que apareixen en espiral i giren suaument'],
 ['Culs d’ampolla','vidres rodons dins d’un rusc de vidre de colors, travessats per onades de llum'],
 ['Arc de Sant Martí','un arc de colors que es pinta franja a franja sobre un cel amb un sol que s’aixeca'],
 ['Fulles de llum','tres plafons on creixen fulles grans de vidre de colors que es gronxen'],
 ['Rosa dels vents','una rosa dels vents de setze puntes que creixen del centre i gira a poc a poc'],
 ['Entrellaçat','un nus i un anell de cintes de vidre que passen l’una per sobre i per sota de l’altra'],
 ['Llum projectada','una finestra que s’encén i projecta els seus colors a terra'],
 ['Paisatge de vidre','turons, un riu i un prat de vidre que apareixen mentre surt el sol'],
 ['Onades de vidre','onades blaves i turqueses sota un sol d’estiu; el plom es mou amb l’aigua'],
 ['Gran rosassa de festa','una rosassa de setze pètals que es construeix capa a capa i acaba amb una onada de llum']
].map(([name,movement],i)=>Object.freeze({id:'vit-'+String(i+1).padStart(2,'0'),plan:i+1,name,movement})));
const Vwrap=index=>((index%VITRALL_ART.length)+VITRALL_ART.length)%VITRALL_ART.length;
// Visual events of a window, in seconds from the press.
function Vmoments(index,duration){const art=VITRALL_ART[Vwrap(index)],grid=kaleidoGrid(duration,art.steps),times=art.hits.map(s=>grid.time(s*grid.m));return {art,grid,times};}
export function vitrallEvents(index,duration){return Vmoments(index,duration).times;}
// builtIn: the piece as written, on the built-in instruments (kept for the tests that check the composition has not changed).
export function vitrallScore(index,duration,seed=0,{builtIn=false}={}){const {grid,times,art}=Vmoments(index,duration);return composeKaleido((builtIn?VITRALL_MUSIC:VITRALL_RECORDED)[Vwrap(index)],{D:grid.L.D,L:grid.L,n:grid.n,m:grid.m,step:grid.step,time:grid.time,hits:times.map((time,i)=>({time,step:art.hits[i]*grid.m})),seed:Math.abs(Math.floor(seed||0))});}
// Onset bloom: warm light behind the glass answers the press in the very first frame.
function Vbloom(c,w,h,ph,o,color){const x=Kclamp(ph.t/.8);if(x>=1)return;const S=Math.min(w,h),r=S*(.08+(o.reduced?.14:.32)*KeaseOut(x)),g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,r);
 g.addColorStop(0,Krgba(o.lit?Kmix(color,'#ffffff',.4):color,.7*(1-Ksmooth(x))));g.addColorStop(.5,Krgba(color,.3*(1-Ksmooth(x))));g.addColorStop(1,Krgba(color,0));c.save();c.globalCompositeOperation=o.lit?'lighter':'source-over';c.fillStyle=g;c.beginPath();c.arc(w/2,h/2,r,0,K_TAU);c.fill();c.restore();}
// Adaptive quality: when the drawing takes too long on this device, the glass texture and the soft shadow along the lead fade out over about fifty frames.
// They return only after a hold that doubles with each drop, and after a third drop they stay off, so on a device near the limit the texture does not keep coming and going.
// It is on in the browser; tools and tests that need identical frames turn it off.
const V_QUALITY={ms:0,level:1,low:false,hold:0,drops:0,on:typeof document!=='undefined'};
export function vitrallQuality(){return {...V_QUALITY};}
export function vitrallAdaptive(on){Object.assign(V_QUALITY,{ms:0,level:1,low:false,hold:0,drops:0,on:!!on});}
export function vitrallMeasure(ms){const q=V_QUALITY;q.ms=q.ms*.92+ms*.08;if(q.hold>0)q.hold--;
 if(!q.low&&q.ms>22){q.low=true;q.hold=600*2**Math.min(q.drops,4);q.drops++;}else if(q.low&&q.hold<=0&&q.drops<3&&q.ms<11)q.low=false;
 const target=q.low?0:1;q.level+=(target-q.level)*.04;if(Math.abs(q.level-target)<.01)q.level=target;}
export function drawVitrall(c,w,h,o){const ph=kaleidoPhase(o.t,o.duration,o.reduced);if(ph.alpha<=0)return false;const {art,grid,times}=Vmoments(o.index,o.duration);
 const lit=o.base!=='white'||o.background==='full'||(o.background==='dim'&&o.opacity>=60),seed=Math.abs(Math.floor(o.seed||0)),adaptive=V_QUALITY.on&&o.adaptive!==false&&typeof performance!=='undefined';
 const opts={...o,lit,seed,hitT:times,hitE:art.hits.map(s=>s/art.steps),step:grid.step*grid.m,quality:adaptive?V_QUALITY.level:1};
 Vbloom(c,w,h,ph,opts,art.accent[seed%3]);const t0=adaptive?performance.now():0;c.save();c.globalAlpha*=ph.alpha;art.draw(c,w,h,ph,opts);c.restore();if(adaptive)vitrallMeasure(performance.now()-t0);return true;
}

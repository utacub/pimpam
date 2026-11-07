// Caleidoscopi (CE21): luminous abstract patterns on black, without text. The twenty patterns of the plan, in its order.
// Each visual event and its note come from the same step grid, so the sound lands on the change it accompanies.
import {Kclamp,Ksmooth,KeaseOut,KeaseBack,Kmix,Krgba,K_TAU,kaleidoPhase,kaleidoGrid} from './kaleido-base.js';
import {KALEIDO_ART} from './kaleido-art.js';
import {composeKaleido,musicWindow,musicKit} from './kaleido-music.js';
import {SAMPLE_BANK} from './sampler.js';
// Music: key (MIDI of the tonic, octave 3), mode, chord progression (scale degrees) and the layers of each piece.
// The pieces are written for the built-in instruments of synth.js and played by recorded ones (see K_KIT below). Keys move around the circle of fifths so consecutive patterns sound related but different.
const KALEIDO_MUSIC=[
 {key:50,mode:'lydian',prog:[0,1,5,4],pad:{inst:'pad',center:64,vel:.5},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},arp:{inst:'kalimba',shape:'updown',per:2,vel:.32,center:74},lead:{inst:'bell',line:[0,2,4,6,7,9,11,13],oct:1,len:4},counter:{inst:'choir',vowel:'o',from:6,notes:[[4,3],[5,3],[4,4]],vel:.4},onset:{inst:'harp'},final:{inst:'bell'},swell:true,shimmer:true},
 {key:57,mode:'ionian',prog:[0,3,5,4],pad:{inst:'pad',center:62,vel:.42},bass:{inst:'bass',rhythm:[0,2,3],notes:[0,4,7]},arp:{inst:'marimba',shape:'up',per:2,penta:true,vel:.36,center:66,climb:14},lead:{inst:'pluck',line:[0,1,2,3,4,5,6,7],penta:true,oct:1,len:2},counter:{inst:'flute',from:8,notes:[[4,2],[3,2],[2,4]],oct:1,glide:true,vel:.38},perc:{shaker:.35,from:4},onset:{inst:'pluck',center:72},final:{inst:'harp'}},
 {key:52,mode:'lydian',prog:[0,5,1,4],pad:{inst:'choir',vowel:'u',center:64,vel:.45},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'glass',shape:'down',per:2,from:2,vel:.28,center:80},lead:{inst:'chime',line:[7,9,11,8,12,14],oct:1,len:4,vel:.7},onset:{inst:'glass',center:80},final:{inst:'chime'},shimmer:true,sparkle:'glass'},
 {key:55,mode:'lydian',prog:[0,1,4],pad:{inst:'pad',center:62,vel:.45},bass:{inst:'bass',rhythm:[0,3],notes:[0,4]},arp:{inst:'harp',shape:'wave',per:1,vel:.32,center:70},lead:{inst:'chime',line:[4,6,9],oct:1,len:4,chord:3,strum:.05},counter:{inst:'flute',from:0,notes:[[4,2],[6,2],[5,2],[7,2],[9,2],[8,2]],oct:1,glide:true,vel:.42},onset:{inst:'harp',center:76},final:{inst:'glass'}},
 {key:53,mode:'dorian',prog:[0,3,0,6],pad:{inst:'choir',vowel:'o',center:58,vel:.5},bass:{inst:'sub',rhythm:[0,2],notes:[0,0]},arp:{inst:'kalimba',shape:'broken',per:1,from:4,vel:.26,center:68},lead:{inst:'marimba',line:[0,4,2,6,4,7],oct:0,len:4,vel:.85,harm:true},perc:{thump:true},onset:{inst:'marimba',center:62},final:{inst:'bell',center:72},swell:true},
 {key:48,mode:'ionian',prog:[0,4,5,3],pad:{inst:'pad',center:64,vel:.42},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},lead:{inst:'pluck',line:[0,2,4, 2,4,5,7,9, 4,5,7,9,11,12,14],oct:1,len:2,vel:.7},counter:{inst:'flute',from:8,notes:[[9,4],[7,4]],oct:1,vel:.36},perc:{tick:'x...',from:4},onset:{inst:'harp',center:72},final:{inst:'celesta'}},
 {key:57,mode:'aeolian',prog:[0,5,6,2],changes:[0,3,7,11],settle:0,pad:{inst:'choir',vowel:'a',center:64,vel:.45},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},arp:{inst:'pluck',shape:'updown',per:2,vel:.26,center:72},lead:{inst:'harp',line:[4,4,4],oct:1,chord:4,strum:.11,len:4,vel:.8},perc:{shaker:.25,from:3},onset:{inst:'harp',center:76},final:{inst:'glass'}},
 {key:50,mode:'ionian',prog:[0,3,5,4],changes:[0,2,6,10],pad:{inst:'pad',center:62,vel:.55},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'harp',shape:'wave',per:1,from:2,vel:.24,center:74},lead:{inst:'glass',line:[4,6,7],oct:1,chord:3,strum:.16,len:5,vel:.7},counter:{inst:'choir',vowel:'a',from:2,notes:[[4,4],[5,4],[4,4]],vel:.38},onset:{inst:'flute',center:74,size:2},final:{inst:'bell'},swell:true,shimmer:true},
 {key:51,mode:'ionian',prog:[0,3,4,0],pad:{inst:'pad',center:62,vel:.4},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},lead:{inst:'marimba',line:[0],oct:1,len:1},phrases:[{at:0,inst:'marimba',line:[0,2,4,2,5,4,6,7],oct:1,vel:.7,pan:-.4},{at:1,inst:'kalimba',line:[0,2,4,2,5,4,6,7],oct:1,vel:.65,pan:.4},{at:2,inst:'celesta',line:[0,2,4,2,5,4,6,7],oct:2,vel:.55}],perc:{tick:'x.x.',from:2},onset:{inst:'harp'},final:{inst:'harp'}},
 {key:64,mode:'ionian',prog:[0,5,3,4],pad:{inst:'choir',vowel:'e',center:64,vel:.38},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'glass',shape:'down',per:2,vel:.22,center:84},lead:{inst:'celesta',line:[7,9,11,12,14,16],oct:0,len:3,vel:.75,harm:true},perc:{tick:'..x.',from:2},onset:{inst:'celesta',center:84},final:{inst:'chime',center:84},shimmer:true,sparkle:'glass'},
 {key:49,mode:'dorian',prog:[0,0,3,0],pad:{inst:'choir',vowel:'u',center:61,vel:.5},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'celesta',shape:'wave',per:1,from:4,vel:.18,center:80},lead:{inst:'chime',line:[11,9,14,12,16,13,18],penta:true,oct:0,len:4,vel:.65},counter:{inst:'flute',from:6,notes:[[4,4],[3,4],[2,6]],oct:1,vel:.32,glide:true},onset:{inst:'bell',center:73},final:{inst:'bell'},swell:true,shimmer:true},
 {key:55,mode:'ionian',prog:[0,4,5,3],pad:{inst:'pad',center:62,vel:.4},bass:{inst:'bass',rhythm:[0,1.5],notes:[0,4]},lead:{inst:'marimba',line:[0,1,2,3,4,5,2,3,4,5,6,7],oct:1,len:2,vel:.8,harm:true,harmFrom:6},perc:{shaker:.4,tick:'x..x..x.',thump:true},onset:{inst:'marimba',center:67},final:{inst:'harp'}},
 {key:58,mode:'lydian',prog:[0,1,0,4],pad:{inst:'pad',center:62,vel:.45},bass:{inst:'bass',rhythm:[0,3],notes:[0,4]},arp:{inst:'harp',shape:'wave',per:2,vel:.24,center:72},lead:{inst:'bell',line:[4,6,9],oct:1,len:4,vel:.65},counter:{inst:'flute',from:1,notes:[[2,3],[4,3],[6,2],[4,3],[7,3]],oct:1,glide:true,vel:.42},onset:{inst:'harp',center:74},final:{inst:'glass'}},
 {key:53,mode:'ionian',prog:[0,3,4,0],pad:{inst:'pad',center:62,vel:.4},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},lead:{inst:'harp',line:[0,2,4,7,9,11,14,9,11,14,16,18,21,14],oct:0,len:3,vel:.75,alt:{from:7,inst:'celesta',oct:0}},perc:{shaker:.25,from:2},onset:{inst:'harp',center:72},final:{inst:'chime'}},
 {key:57,mode:'mixolydian',prog:[0,6,3,0],pad:{inst:'choir',vowel:'o',center:62,vel:.42},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'kalimba',shape:'updown',per:1,from:2,vel:.22,center:72},lead:{inst:'glass',line:[4,0,4,0,4,0],oct:1,len:4,vel:.7,beat:.07,pan:.5},onset:{inst:'glass',center:76},final:{inst:'bell'},swell:true},
 {key:50,mode:'dorian',prog:[0,3,6,0],pad:{inst:'pad',center:62,vel:.42},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},lead:{inst:'marimba',line:[0,1,2,3,4,5,6],oct:0,len:2,vel:.8,until:7},phrases:[{at:7,inst:'celesta',line:[14,11,9,7,4,2],every:.5,oct:0,vel:.6,pan:-.3},{at:8,inst:'harp',line:[16,14,11,9,7,4,2,0],every:.5,oct:0,vel:.7,pan:.3}],counter:{inst:'flute',from:7,notes:[[7,3],[9,4]],oct:1,vel:.34},onset:{inst:'harp',center:70},final:{inst:'bell'}},
 {key:48,mode:'lydian',prog:[0,1,0,4],pad:{inst:'pad',center:62,vel:.55,open:true},bass:{inst:'bass',rhythm:[0,1,2],notes:[0,0,7]},arp:{inst:'pluck',shape:'up',per:2,from:4,vel:.22,center:72},lead:{inst:'chime',line:[0,4,7,11,14,18],oct:1,len:4,vel:.65},onset:{inst:'chime',center:72},final:{inst:'glass'},swell:true},
 {key:55,mode:'ionian',prog:[0,4,5,3],pad:{inst:'pad',center:62,vel:.4},bass:{inst:'bass',rhythm:[0,1.5],notes:[0,4]},arp:{inst:'kalimba',shape:'random',per:2,penta:true,vel:.28,center:76},lead:{inst:'bell',line:[5,7,9,10],cluster:3,oct:0,strum:.05,len:4,vel:.6},perc:{shaker:.35,tick:'x..',thump:true},onset:{inst:'bell',center:79},final:{inst:'celesta'}},
 {key:52,mode:'dorian',prog:[0,3,5],changes:[0,4,8],pad:{inst:'choir',vowel:'o',center:62,vel:.5},bass:{inst:'sub',rhythm:[0],notes:[0]},arp:{inst:'harp',shape:'wave',per:1,vel:.18,center:70},lead:{inst:'harp',line:[4,5,7],oct:0,len:4,vel:.55,chord:3,strum:.09},breath:true,onset:{inst:'harp',center:70},final:{inst:'chime'}},
 {key:50,mode:'ionian',prog:[0,5,4],changes:[0,4,8],pad:{inst:'pad',center:62,vel:.5},bass:{inst:'bass',rhythm:[0,2],notes:[0,4]},arp:{inst:'harp',shape:'up',per:2,vel:.24,center:74},lead:{inst:'bell',line:[7,9,11],oct:0,chord:3,strum:.06,len:4,vel:.75},counter:{inst:'choir',vowel:'a',from:4,notes:[[4,4],[2,4]],vel:.38},perc:{thump:true},onset:{inst:'bell',center:76},final:{inst:'bell',size:5},swell:true,shimmer:true}
];
export const KALEIDO_PATTERNS=Object.freeze([
 ['Mandala que respira','vuit corones de pètals que s’obren del centre, giren en sentits oposats i respiren'],
 ['Gira-sol de punts','punts col·locats amb l’angle d’or que creixen en espiral cap enfora, amb onades de llum'],
 ['Caleidoscopi de vidre','fragments translúcids reflectits en simetria de sis que es desplacen a poc a poc entre els miralls'],
 ['Fil de llum','figures de Lissajous de llum recorregudes per tres impulsos que canvien de forma a cada esdeveniment'],
 ['Metaboles','gotes lluminoses que brollen d’una massa central, s’estiren, se separen i es tornen a unir'],
 ['Rosa matemàtica','tres corbes de rosa de 3, 5 i 7 pètals que es dibuixen pètal a pètal'],
 ['Constel·lació de fils','fils de llum entre punts d’un cercle que es transformen en cardioide, nefroide i figures de més puntes'],
 ['Corrent d’aurora','cintes de llum que giren al voltant del centre i ondulen com una aurora'],
 ['Espiròraf','tres corbes d’espiròraf que es dibuixen amb cinc plomes alhora i entren una darrere l’altra'],
 ['Floc cristal·lí','un cristall hexagonal que creix branca a branca'],
 ['Galàxia','braços espirals d’estrelles al voltant d’un nucli càlid, amb estrelles que s’encenen suaument'],
 ['Mosaic d’abella','cel·les hexagonals que s’encenen en dues onades des del centre'],
 ['Cinta infinita','tres cintes en forma de vuit, torçades com una banda de Möbius'],
 ['Flor de cercles','cercles que apareixen un a un i s’entrellacen fins a formar una flor geomètrica'],
 ['Ones que es troben','dues fonts que emeten anells de color suaus; on es creuen, s’encén una llum càlida'],
 ['Arbre de llum','branques de llum que creixen nivell a nivell i floreixen en dues onades'],
 ['Túnel suau','polígons suaus que neixen al centre i s’allunyen girant, mai més de cinc alhora'],
 ['Pluja de confeti radial','esclats de confeti que surten del centre, s’aturen i formen anells'],
 ['Medusa de seda','una forma radial de seda que es contrau suaument mentre els filaments onegen'],
 ['Supernova tranquil·la','tres esclats suaus que deixen anells de tots els colors al voltant d’una llum estable']
].map(([name,movement],i)=>Object.freeze({id:'kal-'+String(i+1).padStart(2,'0'),plan:i+1,name,movement})));
const Kwrap=index=>((index%KALEIDO_ART.length)+KALEIDO_ART.length)%KALEIDO_ART.length;
// Visual events of a pattern, in seconds from the press, and the clock value at each one (for patterns whose rings travel on the motion clock).
function Kmoments(index,duration){const art=KALEIDO_ART[Kwrap(index)],grid=kaleidoGrid(duration,art.steps),times=art.hits.map(s=>grid.time(s*grid.m));return {art,grid,times,hitE:art.hits.map(s=>s/art.steps),hitC:times.map(t=>kaleidoPhase(t,duration).clock)};}
export function kaleidoEvents(index,duration){return Kmoments(index,duration).times;}
// Recorded orchestration (since 0.10.1): the same pieces, played by recordings of real instruments instead of the built-in sounds,
// which sounded synthetic (the pads, choirs and held low notes most of all). Each built-in instrument names the recording that takes
// its part and the level that matches it (amp, measured on the notes it plays); the shimmer has no acoustic equivalent and is left out.
// The pieces now end on plucked and struck sounds that fade by themselves: a rolled harp chord over a short plucked bass note and the
// glockenspiel, with the strings and the flute letting go soon after the settle.
export const RECORDED_FOLD=Object.freeze(Object.fromEntries(Object.entries(SAMPLE_BANK).filter(([,b])=>b.pitched).map(([name,b])=>[name,musicWindow(b.zones.map(z=>z[1]))])));
// amp: the median over the pieces of the loudness of each instrument's notes (EBU R128) on the built-in sound against its recording.
// A name with a colon is one part of a built-in instrument (the last sparkle) played by a recording of its own, in its own octave.
const K_KIT=musicKit({harp:['harpRec',.6],kalimba:['marimbaRec',.56],marimba:['marimbaRec',.48],pluck:['violinsPizzRec',.38],glass:['glockRec',1.08],celesta:['glockRec',.89],chime:['glockRec',.72],bell:['glockRec',1.12],
 flute:['fluteRec',.66],pad:['violinsRec',.62],choir:['violinsRec',.4],bass:['celliPizzRec',1.19],sub:['celliRec',.86],shaker:['triangleRec',.09,'muted'],tick:['woodblockRec',.08,'claves'],thump:['bassdrumRec',1.23,'soft'],
 swell:['cymbalRec',.42,'swell'],shimmer:null,'celesta:sparkle':['glockRec',.89],'glass:sparkle':['glockRec',1.08]});
function Krecorded(s){return {...s,kit:K_KIT,fold:RECORDED_FOLD,sparkle:(s.sparkle||'celesta')+':sparkle',final:{...s.final,inst:'harp',center:Math.min(s.final?.center||79,72),strum:.07},pad:s.pad&&{...s.pad,tail:1.2},counter:s.counter&&{...s.counter,tail:1.2},bass:s.bass&&{...s.bass,end:'bass',endLen:1.5}};}
export const KALEIDO_RECORDED=Object.freeze(KALEIDO_MUSIC.map(Krecorded));
// builtIn: the piece as written, on the built-in instruments (kept for the tests that check the composition has not changed).
export function kaleidoScore(index,duration,seed=0,{builtIn=false}={}){const {grid,times,art}=Kmoments(index,duration);return composeKaleido((builtIn?KALEIDO_MUSIC:KALEIDO_RECORDED)[Kwrap(index)],{D:grid.L.D,L:grid.L,n:grid.n,m:grid.m,step:grid.step,time:grid.time,hits:times.map((time,i)=>({time,step:art.hits[i]*grid.m})),seed:Math.abs(Math.floor(seed||0))});}
// Onset bloom: a soft glow that answers the press in the very first frame, then gives way to the pattern.
function Kbloom(c,w,h,ph,o,color){const x=Kclamp(ph.t/.7);if(x>=1)return;const S=Math.min(w,h),r=S*(.05+(o.reduced?.12:.26)*KeaseOut(x)),g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,r);
 g.addColorStop(0,Krgba(o.lit?Kmix(color,'#ffffff',.35):color,.75*(1-Ksmooth(x))));g.addColorStop(.5,Krgba(color,.35*(1-Ksmooth(x))));g.addColorStop(1,Krgba(color,0));c.save();c.globalCompositeOperation=o.lit?'lighter':'source-over';c.fillStyle=g;c.beginPath();c.arc(w/2,h/2,r,0,K_TAU);c.fill();c.restore();}
// «Contrast alt» (0.25): the plain version of every pattern, for children who see simple forms better. One colour on black and one
// big form in the middle that does not fill the screen: rings, petals, polygons, a star or a ring of dots. It builds itself on the
// moments of the music (the same music), breathes a little at each one (it grows, it never flashes) and turns at most once every
// sixteen seconds. Never more than five pairs of light and dark stripes (Harding et al., 2005). The ground is always plain black (art.js).
export const KALEIDO_CONTRAST_COLORS=Object.freeze({yellow:'#ffd400',white:'#ffffff',orange:'#ff9a1f',red:'#ff3b30',pink:'#ff4fd8',green:'#2fd36b',blue:'#3d8bff'});
export const KALEIDO_CONTRAST_FORMS=Object.freeze(['rings','petals','polygon','star','dots']);
// The form of a pattern: its family and how many elements it has (each element is one stripe pair at most).
export function kaleidoContrastForm(index){const i=Kwrap(index),kind=KALEIDO_CONTRAST_FORMS[i%5],v=Math.floor(i/5)%4;
 return kind==='rings'?{kind,n:[3,4,5,4][v]}:kind==='petals'?{kind,n:[3,4,5,5][v],width:[.34,.32,.28,.24][v]}:kind==='polygon'?{kind,n:[1,2,3,2][v],sides:[3,4,5,6][v]}:kind==='star'?{kind,n:2,points:[4,5,5,4][v],inner:[.42,.4,.5,.5][v]}:{kind,n:1+[3,4,5,5][v],dots:[3,4,5,5][v]};}
export function kaleidoBreaths(times){const out=[];for(const t of times)if(!out.length||t-out[out.length-1]>=.7)out.push(t);return out;}
function Kcontrast(c,w,h,ph,o,times,index){const f=kaleidoContrastForm(index),H=times.length,k=times.filter(x=>ph.t>=x).length,R=Math.min(w,h)*.36*ph.grow,color=o.contrast;
 // Each element grows in at its own moment, and the form breathes out a little (5 % bigger) on the moments that are at least 0.7 s
 // apart, so that it never pulses more than about once a second and a half.
 const last=kaleidoBreaths(times).filter(x=>ph.t>=x).pop()??-9,breath=1+.05*Math.exp(-(((ph.t-last)/.2)**2))*(o.reduced?.3:1),turn=ph.motion*K_TAU/16*(index%2?-1:1);
 const shown=j=>{const at=j===0?0:times[Math.min(H-1,Math.max(0,Math.round(j*H/f.n)-1))]??0;return j===0?1:ph.t<at?0:KeaseBack((ph.t-at)/.35);};
 c.save();c.translate(w/2,h/2);c.rotate(turn);c.scale(breath,breath);c.fillStyle=color;c.strokeStyle=color;c.lineCap='round';c.lineJoin='round';
 if(f.kind==='rings'){c.lineWidth=R*.5/f.n;for(let j=0;j<f.n;j++){const g=shown(j);if(g<=0)continue;c.beginPath();c.arc(0,0,Math.max(.1,R*(j+.75)/f.n*g),0,K_TAU);c.stroke();}}
 else if(f.kind==='petals'){for(let j=0;j<f.n;j++){const g=shown(j);if(g<=0)continue;c.save();c.rotate(j*K_TAU/f.n);c.beginPath();c.ellipse(0,-R*.55*g,R*f.width*g,R*.45*g,0,0,K_TAU);c.fill();c.restore();}
  c.beginPath();c.arc(0,0,R*.12,0,K_TAU);c.fill();}
 else if(f.kind==='polygon'){c.lineWidth=R*.13;for(let j=0;j<f.n;j++){const g=shown(j);if(g<=0)continue;const r=R*(1-j*.34)*g;c.beginPath();for(let i=0;i<=f.sides;i++){const a=-Math.PI/2+i*K_TAU/f.sides+(j%2?Math.PI/f.sides:0);i?c.lineTo(Math.cos(a)*r,Math.sin(a)*r):c.moveTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.stroke();}}
 else if(f.kind==='star'){const g=shown(0),r=R*.8*g;c.beginPath();for(let i=0;i<2*f.points;i++){const a=-Math.PI/2+i*Math.PI/f.points,rr=i%2?r*f.inner:r;i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();
  const g2=shown(1);if(g2>0){c.lineWidth=R*.07;c.beginPath();c.arc(0,0,R*.97*g2,0,K_TAU);c.stroke();}}
 else{const g=shown(0);c.beginPath();c.arc(0,0,R*.24*g,0,K_TAU);c.fill();for(let j=0;j<f.dots;j++){const g2=shown(j+1);if(g2<=0)continue;const a=-Math.PI/2+j*K_TAU/f.dots;c.beginPath();c.arc(Math.cos(a)*R*.68,Math.sin(a)*R*.68,R*.2*g2,0,K_TAU);c.fill();}}
 c.restore();}
// o: {index, t, duration, reduced, base, background, opacity, seed, contrast (the colour of «Contrast alt», or nothing)}. Additive
// light on dark grounds; plain layering on a white ground.
export function drawKaleido(c,w,h,o){const ph=kaleidoPhase(o.t,o.duration,o.reduced);if(ph.alpha<=0)return false;const {art,grid,times,hitE,hitC}=Kmoments(o.index,o.duration);
 if(o.contrast){c.save();c.globalAlpha*=ph.alpha;Kcontrast(c,w,h,ph,o,times,o.index);c.restore();return true;}
 const lit=o.base!=='white'||o.background==='full'||(o.background==='dim'&&o.opacity>=60),tone=hex=>lit?hex:Kmix(hex,'#1d2a55',.25),seed=Math.abs(Math.floor(o.seed||0));
 const opts={...o,lit,tone,seed,hitT:times,hitE,hitC,step:grid.step*grid.m};
 Kbloom(c,w,h,ph,opts,tone(art.accent[seed%3]));c.save();c.globalAlpha*=ph.alpha;art.draw(c,w,h,ph,opts);c.restore();return true;
}

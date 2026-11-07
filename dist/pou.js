import {escScore} from './escenari.js';
/* El pou del temps · CE37 · Pim Pam 0.31 (after Sabana de paper, 0.30): a well through the rock, back in time. Before the first press the
 * camera rests in a garden of today; each press goes down the rock to an older layer, where the fossil of an animal wakes: a window of
 * life opens in the rock around it and its flesh grows out from its bones. From the Ice Age (mammoths) down to the first dinosaurs
 * (Eoraptor, about 230 million years ago); after the twentieth the camera climbs back to the garden, where a robin sings (birds are
 * living dinosaurs). Same rules as fons.js, selva.js and sabana.js: each press, a travelling of POU_TRAVEL s to the next scene, then the
 * stimulus; at its end the scene slows to a stop and darkens until the next press.
 */
export const POU_TRAVEL=2,POU_STIM=12,POU_RETURN=7,POU_N=20;
// The climb after the twentieth: how long the camera takes to reach the garden (the rest of POU_RETURN is the robin's song).
export const POU_CLIMB=5;
export const pouDuration=(i,duration=POU_STIM)=>POU_TRAVEL+Math.max(POU_STIM,duration)+(i===POU_N-1?POU_RETURN:0);
// World: x across, y up; the scenes go down the well 2.2 apart, with a longer stretch of rock (the 66 million years from the end of the
// Cretaceous to the Ice Age) between the fourth and the fifth. The garden of today: its ground at y 2.1 (rock.glsl).
const PY=i=>-2.2*i-(i>=4?1.6:0);
export const POU_START=Object.freeze([0,2.4,1]);
// [x, y, height, pull back in the middle of the travelling (log of the zoom), drift during the stimulus: dx, dy, change of height]
export const POU_POSES=Object.freeze([
 [0,PY(0),1,.20,.03,0,-.04],   // 1 the woolly mammoths: down from the garden through the soil and the silts of the Ice Age
 [0,PY(1),1,.15,-.03,0,-.04],  // 2 the sabre-toothed cats at La Brea
 [0,PY(2),1,.15,.03,0,-.04],   // 3 the woolly rhinoceros and the giant deer
 [0,PY(3),1,.15,-.03,0,-.04],  // 4 the ground sloth and the glyptodont
 [0,PY(4),1,.35,.03,0,-.04],   // 5 the tyrannosaurs: the long way down, through the end of the Cretaceous
 [0,PY(5),1,.15,-.03,0,-.04],  // 6 the triceratops
 [0,PY(6),1,.15,.03,0,-.04],   // 7 the ankylosaur
 [0,PY(7),1,.15,-.03,0,-.04],  // 8 Abditosaurus, the titanosaur of the Pyrenees
 [0,PY(8),1,.15,.03,0,-.04],   // 9 the velociraptor
 [0,PY(9),1,.15,-.03,0,-.04],  // 10 the citipati on its nest
 [0,PY(10),1,.15,.03,0,-.04],  // 11 the parasaurolophus
 [0,PY(11),1,.15,-.03,0,-.04], // 12 the pteranodon and the plesiosaur
 [0,PY(12),1,.15,.03,0,-.04],  // 13 the spinosaurus
 [0,PY(13),1,.15,-.03,0,-.04], // 14 Yutyrannus and Sinosauropteryx
 [0,PY(14),1,.15,.03,0,-.04],  // 15 the iguanodons
 [0,PY(15),1,.15,-.03,0,-.04], // 16 Archaeopteryx
 [0,PY(16),1,.15,.03,0,-.04],  // 17 the stegosaurus
 [0,PY(17),1,.15,0,.30,.06],   // 18 the brachiosaurus and the diplodocus: up the neck to the crown of the tree
 [0,PY(18),1,.15,-.03,0,-.04], // 19 the ichthyosaurs
 [0,PY(19),1,.15,-.03,0,.05]   // 20 Eoraptor; then the climb back to the garden
].map(Object.freeze));
export const POU_NAMES=Object.freeze(['Els mamuts llanuts','Els esmilòdons','El rinoceront llanut i el cérvol gegant','El megateri i el gliptodont','Els tiranosaures',
 'Els triceratops','L’anquilosaure','L’abditosaure del Pirineu','El velociraptor','El citipati i el niu','Els parasaurolophus','El pteranodon i el plesiosaure',
 'L’espinosaure','El yutyrannus i el sinosauropteryx','Els iguanodons','L’arqueòpterix','L’estegosaure','El braquiosaure i el diplodoc','Els ictiosaures','L’eoraptor']);
// The garden of today is drawn by the shader after the twenty (scene index POU_N).
export const POU_GARDEN=POU_N;
const PUclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const PUsmooth=x=>{x=PUclamp(x);return x*x*(3-2*x);};
const PUsmoother=x=>{x=PUclamp(x);return x*x*x*(x*(x*6-15)+10);};
export function pouRest(i){if(i<0||i>=POU_N)return POU_START;const p=POU_POSES[i];return [p[0]+p[4]*p[2],p[1]+p[5]*p[2],p[2]*(1+p[6])];}
function pouDrift(i,t,stim){const p=POU_POSES[i],u=PUsmooth((t-POU_TRAVEL)/stim);return [p[0]+p[4]*p[2]*u,p[1]+p[5]*p[2]*u,p[2]*(1+p[6]*u)];}
function pouTravel(a,b,u,bump){const e=PUsmoother(u),lz=Math.log(a[2])+(Math.log(b[2])-Math.log(a[2]))*e+bump*Math.sin(Math.PI*e);
 return [a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e,Math.exp(lz)];}
// The camera: down to the scene, then a slow drift; after the twentieth, the climb back up the whole well to the garden.
export function pouCamera(i,t,stim=POU_STIM,from=pouRest(i-1)){stim=Math.max(POU_STIM,stim);
 if(t<POU_TRAVEL)return pouTravel(from,pouDrift(i,POU_TRAVEL,stim),t/POU_TRAVEL,POU_POSES[i][3]);
 if(i===POU_N-1&&t>POU_TRAVEL+stim)return pouTravel(pouRest(i),POU_START,(t-POU_TRAVEL-stim)/POU_CLIMB,1.1);
 return pouDrift(i,Math.min(t,POU_TRAVEL+stim),stim);}
// How fast the camera goes (0 .. 1), for the dust of the travelling.
export function pouMove(i,t,stim=POU_STIM,from){if(t===null||t===undefined||i<0)return 0;const a=pouCamera(i,Math.max(0,t-.05),stim,from),b=pouCamera(i,t+.05,stim,from);
 return PUclamp(Math.hypot(b[0]-a[0],b[1]-a[1])/.1/(1.6*Math.min(a[2],b[2])));}
// The life of a scene for its clock (0 stone .. 1 alive): it wakes as the camera arrives.
export const pouLife=tau=>PUsmooth((tau-1.3)/2.2);
// The layers drawn at a moment of the press of scene i: the scene left behind turns back to stone while the camera leaves it (the garden,
// for the first); this scene wakes; after the twentieth it turns to stone again and the garden comes back at the top of the climb.
// The garden's clock: seconds since the climb started (its robin sings when the camera arrives); large at rest.
export const POU_IDLE=100;
export function pouLayers(i,t,tau,prevTau,stim=POU_STIM){const out=[];if(i<0)return out;stim=Math.max(POU_STIM,stim);const T0=POU_TRAVEL+stim;
 if(t<POU_TRAVEL+.2){if(i===0)out.push({scene:POU_GARDEN,tau:prevTau!==null&&prevTau!==undefined?Math.max(POU_RETURN,prevTau-T0):POU_IDLE,life:1});
  else if(prevTau!==null&&prevTau!==undefined)out.push({scene:i-1,tau:prevTau,life:1-PUsmooth((t-.1)/1)});}
 const back=i===POU_N-1?PUsmooth((t-T0)/1):0;
 // The scene wakes with the camera: its clock (tau) follows the wall clock, the camera the activity's own clock, which falls behind when
 // frames are very slow (a software renderer, a long first frame); the earlier of the two keeps the fossil stone until the camera arrives.
 if(back<1)out.push({scene:i,tau,life:pouLife(Math.min(tau,t-.3))*(1-back)});
 if(i===POU_N-1&&t>T0)out.push({scene:POU_GARDEN,tau:t-T0,life:1});
 return out;}
// The layers at rest: the scene, still; before the first press and after the climb, the garden.
export const pouRestLayers=(v,tau,done)=>v>=0&&!done?[{scene:v,tau,life:1}]:[{scene:POU_GARDEN,tau:done?Math.max(POU_IDLE,tau):POU_IDLE,life:1}];

/* The music of the well. Each era has its own acoustic instruments, and every piece ends on plucked or struck notes (sampler.js).
 * The flute, harp, marimba, glockenspiel, plucked cellos and violins and the timpani are recordings (VSCO-2); the udu, the slit drum, the
 * vibraphone, the rain stick, the river stones, the frame drum and the log are generated with ElevenLabs (CREDITS.md). The Ice Age a
 * flute (an echo of the bone and ivory flutes of more than 35,000 years ago), the harp, plucked cellos and river stones; the end of the
 * Cretaceous the marimba, the harp and a clay pot drum (udu); the middle Cretaceous a vibraphone without motor; the Jurassic the
 * glockenspiel, plucked cellos and soft timpani for the giants, the vibraphone in the sea; the Triassic a wooden slit drum and a rain
 * stick; today the harp and the glockenspiel, and a robin. Every scene has its ambience (natureRec) and the animals and their gestures
 * sound at the moments they happen (pouRec, POU_CUES): closed-mouth booms, coos, chirps, breaths, steps, splashes. No roar, no held
 * synthetic sound.
 */
const PO_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
// root, mode, tempo, the melody and its answer, the plucked figure, the bass, the bell, the four chords (degrees), the melody ([degree,
// beats]), the figure (degrees over the chord, one bar), the octaves of the figure and of the melody, one bar of percussion in eighths
// (U udu low, u udu high, S slit drum, K timpani, P p stones, F frame drum, T log, t triangle) and the ambience.
const PO_P=(root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct,perc,amb)=>Object.freeze({root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct,perc,amb});
const F='fluteRec',H='harpRec',M='marimbaRec',G='glockRec',CP='celliPizzRec',VP='violinsPizzRec',V='vibRec',HN='hornRec',CL='clarinetRec',SL='escletxaRec';
const POU_PIECES=Object.freeze([
 // the Ice Age
 PO_P(62,'dorian',66,F,M,H,CP,G,[0,3,6,4],[[4,1],[7,1],[6,1],[4,2],[3,.5],[2,.5],[0,2]],[0,4,7,4,9,4],0,0,'F.......','pouEstepa'),
 PO_P(57,'mixolydian',72,F,H,H,CP,G,[0,3,4,0],[[4,.5],[5,.5],[7,1],[9,1],[7,.5],[4,.5],[2,2]],[0,4,7,4,2,4],0,1,'F...p...','pouPrada'),
 PO_P(65,'lydian',63,F,M,H,CP,G,[0,1,4,0],[[4,1.5],[6,.5],[7,1],[4,1],[2,2]],[0,4,7,11,7,4],0,0,'F.....P.','pouEstepa'),
 PO_P(62,'major',76,F,M,H,CP,G,[0,3,4,0],[[2,.5],[4,.5],[5,1],[4,1],[2,1],[0,2]],[0,4,2,4,7,4],0,1,'T...p.p.','pouPampa'),
 // the end of the Cretaceous
 PO_P(60,'major',60,M,VP,H,M,G,[0,3,0,4],[[4,1],[7,1],[9,1],[7,2],[4,1],[2,2]],[0,4,7,4],0,0,'U.......','pouAiguamoll'),
 PO_P(67,'mixolydian',84,M,H,H,CP,G,[0,6,3,0],[[4,.5],[2,.5],[4,1],[7,1],[6,.5],[4,.5],[2,1]],[0,4,7,4,9,4,7,4],0,0,'U...u...','pouPlana'),
 PO_P(58,'major',70,M,CL,H,CP,G,[0,3,4,0],[[7,1],[9,.5],[7,.5],[4,1],[2,1],[0,2]],[0,4,7,4,2,4],0,0,'U..T....','pouBosc'),
 PO_P(62,'lydian',58,M,HN,H,CP,G,[0,1,4,0],[[4,2],[6,1],[7,1],[9,2],[7,2]],[0,4,7,11,9,7],-1,0,'K.......','pouRiu'),
 PO_P(65,'dorian',92,M,VP,H,CP,G,[0,3,4,0],[[0,.5],[2,.5],[4,.5],[5,.5],[4,1],[2,1],[0,2]],[0,2,4,7,4,2,4,7],0,1,'u.u.U.u.','pouDesert'),
 PO_P(60,'lydian',66,H,G,H,CP,G,[0,1,5,4],[[4,1],[6,.5],[7,.5],[11,1],[9,1],[7,2]],[0,4,7,4,9,4],0,1,'U.......','pouDesert'),
 PO_P(63,'major',72,M,H,H,CP,G,[0,3,4,0],[[4,1.5],[5,.5],[7,1],[4,1],[2,2]],[0,4,7,9,7,4],0,0,'U...u...','pouBosc'),
 PO_P(57,'lydian',76,H,M,H,CP,G,[0,1,4,0],[[7,1],[9,.5],[11,.5],[9,1],[7,1],[4,2]],[0,4,7,9,11,9,7,4],0,1,'K.......','pouMar'),
 // the middle and early Cretaceous
 PO_P(62,'mixolydian',80,V,H,H,CP,G,[0,6,3,4],[[4,1],[5,.5],[4,.5],[2,1],[0,1],[2,2]],[0,4,7,4,2,4],0,0,'U...u...','pouRiu'),
 PO_P(64,'dorian',70,V,G,H,CP,G,[0,3,6,4],[[0,1],[2,1],[4,2],[5,1],[4,1],[2,2]],[0,4,7,4,9,4],0,0,'F.......','pouBosc'),
 PO_P(65,'major',84,V,M,H,CP,G,[0,3,4,0],[[4,.5],[5,.5],[7,.5],[9,.5],[7,1],[4,1],[2,2]],[0,4,2,4,7,4,2,4],0,0,'U...u.u.','pouAiguamoll'),
 // the Jurassic
 PO_P(69,'major',100,G,H,H,CP,G,[0,4,5,3],[[7,.5],[9,.5],[11,.5],[9,.5],[7,1],[4,1],[7,2]],[0,4,7,4,9,4,7,4],0,0,'t.......','pouLlacuna'),
 PO_P(60,'mixolydian',76,M,H,H,CP,G,[0,6,3,0],[[4,1],[5,.5],[4,.5],[2,1],[0,1],[2,2]],[0,4,7,4,2,4],0,0,'K...T...','pouPlana'),
 PO_P(55,'lydian',56,M,HN,H,CP,G,[0,1,4,0],[[4,2],[6,1],[7,1],[11,2],[9,2]],[0,4,7,11,7,4],-1,0,'K.......','pouPampa'),
 PO_P(62,'lydian',70,V,H,H,CP,G,[0,1,5,4],[[4,1],[6,1],[7,1],[9,1],[7,2],[4,2]],[0,4,7,9,7,4],0,0,'........','pouSotaAigua'),
 // the Triassic
 PO_P(57,'dorian',88,M,SL,H,CP,G,[0,3,4,0],[[0,.5],[2,.5],[4,1],[7,1],[5,.5],[4,.5],[2,1]],[0,4,7,4,2,4],-1,0,'S..s.S..','pouPlana')]);
const PO_RANGE=Object.freeze({crestaRec:[50,66],vibRec:[58,80],uduRec:[36,57],escletxaRec:[50,68],timpaniRec:[38,58],celliPizzRec:[36,62],marimbaRec:[45,90],harpRec:[36,96],
 glockRec:[79,103],fluteRec:[60,93],hornRec:[45,67],violinsPizzRec:[55,88],clarinetRec:[50,82]});
const poFit=(inst,m)=>{const r=PO_RANGE[inst];if(!r)return m;while(m<r[0])m+=12;while(m>r[1])m-=12;return m;};
// The instrument of the era that runs down the rock in each travelling (the next scene's).
const poRun=i=>i<4?F:i<12?M:i<15?V:i===15?G:i===18?V:i<19?M:SL;
export const POU_LOUD=2.43;
// The level of each press, measured (tools/pou-audio.mjs) and set to −29.6 LUFS on the review copy (gain ∝ trim²).
const POU_TRIM=Object.freeze([0.923,0.928,0.939,0.912,1.065,1.012,1.053,1.135,1.017,1.072,1.006,1.017,0.944,1.012,0.966,1.035,1.0,1.128,1.017,1.072]);
// The gestures of each scene at their moments (seconds after the press; the scene clock follows the press directly). n: notes (degrees
// of the piece's scale); fx: an animal, a gesture or the water (pouRec); pc: the percussion of the era (pouPerc).
const PR='pouRec';
// The cues are written on the scene's own clock (the shaders' uTau): after a press from rest it wakes over 0.6 s and then runs 0.3 s
// behind the seconds since the press, so the sounds are scheduled 0.3 s later than written.
const POU_LAG=.3;
// The scenes whose cues were timed in seconds after the press already (measured on the frames of the review tool).
const POU_PRESS_TIMED=Object.freeze([1,2,3]);
const POU_CUES=Object.freeze([
 // 1 · the woolly mammoths: the calf pushes its trunk into the snow three times; the mother trumpets softly and shakes the snow off her
 // coat; the calf answers
 (n,fx,pc)=>{for(const t of [2.85,3.45,4.05])fx('neuTrompa',t,.10,.2);fx('mamut',5.0,.13,-.15);pc('pedra',5.0,.06);fx('llana',6.1,.10,-.15);
  [[4,.55],[7,.55],[6,.5],[4,.9]].reduce((u,[d,l])=>{n(u,l,F,[d],.16,0);return u+.55;},7.4);fx('mamutCria',9.5,.11,.2);n(10.05,1.2,M,[7],.12,0);n(10.3,1.2,M,[11],.10,0);
  [[3,.5],[2,.5],[0,.9]].reduce((u,[d,l])=>{n(u,l,F,[d],.14,0);return u+.5;},10.55);},
 // 2 · the sabre-toothed cats: the mother yawns while a cub pounces on its sibling; they bat each other in the grass; one bounds to her
 // short tail, which flicks away; she chuffs softly and licks them
 (n,fx,pc)=>{fx('smilBadall',4.55,.12,-.1);n(5.2,2.2,'celliPizzRec',[0],.08,-1);fx('smilCries',4.65,.06,.3);fx('herba',4.9,.06,.2);fx('herba',6.0,.045,.25);
  fx('passesLleugeres',8.3,.04,.35,.8);fx('cuaEscombra',9.2,.05,.4);fx('herba',9.35,.035,.35,1.2);fx('smilCries',9.55,.04,.35,.7);n(9.35,1,M,[4],.08,0);n(9.55,1,M,[2],.07,0);
  fx('rino',10.25,.05,-.1);n(10.3,1.4,M,[7],.10,0);n(10.55,1.4,M,[11],.08,0);fx('herba',12.4,.03,.2);},
 // 3 · the woolly rhinoceros and the giant deer: the rhino sweeps the snow off the grass with its horn (a marimba on each sweep); the
 // stag shakes the snow off its antlers and it cascades down; they graze; the stag bellows softly and the rhino snorts
 (n,fx,pc)=>{fx('banyaNeu',4.8,.09,-.25);fx('banyaNeu',6.3,.07,-.25);[4.86,5.48,6.10,6.72,7.34].forEach((t,k)=>n(t,.9,M,[[4,2,4,2,0][k]],.07,0,{pan:k%2?-.1:-.35}));
  fx('llana',5.75,.08,.3);fx('cascadaNeu',5.95,.07,.3);fx('passesNeu',7.7,.07,-.2);fx('mastega',8.2,.05,-.2);
  fx('cervol',9.9,.10,.3);n(10.0,1.4,F,[4],.12,0);n(10.45,1.4,F,[2],.10,0);fx('rino',10.6,.08,-.25);fx('mastega',11.2,.04,-.2);},
 // 4 · the ground sloth and the glyptodont: the sloth rises onto its hind legs and tail, hooks a branch with its claws, pulls it down
 // and eats; the branch springs back and it comes down onto its knuckles; the glyptodont plods past, stops and blinks
 (n,fx,pc)=>{fx('closca',4.0,.05,-.3);fx('megateri',4.45,.09,0);[[4,.5],[7,.5],[9,.9]].reduce((u,[d,l])=>{n(u,l,F,[d],.13,0);return u+.45;},4.7);
  pc('tronc',5.75,.05);fx('branca',5.75,.08,-.2);fx('mastega',6.2,.07,-.1);n(6.3,1.4,M,[4],.08,0);n(6.55,1.4,M,[2],.07,0);fx('mastega',7.6,.05,-.1);
  fx('falgueres',9.3,.05,-.25);pc('pluja',9.4,.035);fx('megateri',9.5,.05,0,1.2);pc('marc',10.9,.05);pc('marc',11.15,.045);
  fx('closca',5.3,.035,-.4,1.2);n(10.6,1.6,G,[7],.05,0);fx('closca',11.1,.04,-.2);fx('mastega',11.4,.04,-.1);},
 // 5 · the tyrannosaurs: three closed-mouth booms that ripple the water; the chicks peep and come out from behind the mother
 (n,fx,pc)=>{[4.9,5.9,6.9].forEach((t,k)=>{fx('rex',t,.14-k*.012,-.1);fx('tollOnes',t+.15,.07,-.1);});n(4.9,1.6,'timpaniRec',[0],.10,-1);
  fx('criesPiulen',9.4,.10,.25);for(let j=0;j<3;j++)n(9.6+j*.35,.6,VP,[[0,2,4][j]],.12,1);for(let j=0;j<3;j++)n(11.2+j*.35,.6,VP,[[4,2,0][j]],.10,1);},
 // 6 · the triceratops: the mother lifts her head, steps and shakes her frill (the udu answers each swing); the calf copies her with
 // quicker, smaller swings and two stamps; she rumbles with her mouth shut and the calf answers higher
 (n,fx,pc)=>{fx('mastega',2.5,.05,-.1);fx('falgueres',3.75,.05,-.15);fx('passesGegant',3.4,.06,-.15);
  [4.5,4.83,5.16,5.49].forEach((t,k)=>{fx('alaCop',t-.55,.06+(k===1||k===2?.015:0),k%2?.3:-.3);n(t,.9,'uduRec',[[0,4,0,4][k]],.13,-1);});
  [6.05,6.33,6.61,6.89].forEach((t,k)=>{fx('alaCop',t-.55,.03,k%2?.45:.15);n(t,.6,'uduRec',[[7,9,7,9][k]],.08,-1);});n(6.35,.6,'uduRec',[4],.06,-2);n(6.85,.6,'uduRec',[4],.06,-2);
  fx('trike',9.45,.14,-.15);n(9.5,2,'timpaniRec',[0],.07,-1);fx('trikeCria',9.8,.11,.35);n(10.0,1.2,M,[4],.08,0);n(10.25,1.2,M,[7],.07,0);
  fx('falgueres',10.9,.04,-.15);fx('mastega',12.2,.045,-.1);},
 // 7 · the ankylosaur: it lifts its head, swings its tail club and knocks a hollow log (a log drum and the slit drum); leaves and dust
 // fall from the log; it bobs its head, pleased, and coos twice with its mouth shut
 (n,fx,pc)=>{fx('mastega',2.4,.05,-.2);fx('falgueres',3.75,.05,-.2);fx('passesGegant',3.55,.05,-.2);fx('cuaEscombra',4.75,.07,.25);
  pc('tronc',5.15,.18);n(5.15,1.4,SL,[0],.14,-1);n(5.5,1.3,SL,[4],.08,-1);fx('branca',5.25,.05,.35);pc('pluja',5.6,.05);fx('cuaEscombra',5.65,.04,.25);
  fx('anquilo',9.72,.12,-.2);n(9.8,1.2,M,[4],.08,0);n(10.2,1.2,M,[2],.07,0);fx('falgueres',10.9,.04,-.2);fx('mastega',12.0,.045,-.2);},
 // 8 · Abditosaurus: it breathes in the mist, lifts its neck and rumbles (rings on the water); four slow steps send a wave over the
 // buried nest, which uncovers the eggs (a little harp); it drinks; drops fall from its chin
 (n,fx,pc)=>{fx('gegantRespira',3.35,.11,-.1);fx('sauropode',5.85,.15,-.1);n(5.9,2,'timpaniRec',[0],.07,-1);
  [6.05,6.41,6.77].forEach((t,k)=>fx('tollOnes',t,.05-k*.01,-.15));fx('gotes',6.95,.04,-.2,1.2);
  [[7.85,.11,-.2],[8.30,.09,-.2],[8.85,.07,-.1],[9.30,.06,-.1]].forEach(([t,v,p])=>fx('pasAigua',t-.04,v,p));
  fx('onada',8.65,.09,.3);for(let j=0;j<5;j++)n(9.7+j*.19,1.4,H,[[4,6,7,9,11][j]],.10-j*.008,0);n(10.75,1.8,G,[9],.05,0);
  fx('beure',11.4,.10,-.25);[13.75,14.08,14.41].forEach(t=>fx('gotes',t-.02,.035,-.25,.4));},
 // 9 · the velociraptor: it opens its feathered arms and tail (a harp rises), folds them, lies down and bathes in the sand with three
 // flicks of its wings; it stands up and shakes the sand off
 (n,fx,pc)=>{fx('plomes',4.2,.12,0);fx('plomes',4.42,.06,.2);for(let j=0;j<6;j++)n(4.22+j*.1,1.2,H,[[0,2,4,6,7,9][j]],.09+j*.006,0);
  fx('plomes',5.3,.05,0);for(let j=0;j<4;j++)n(5.35+j*.12,1,H,[[7,4,2,0][j]],.08,0);fx('passesLleugeres',6.2,.06,-.05,.6);
  fx('banySorra',6.75,.09,.05);fx('banySorra',8.6,.07,.1);[7.04,7.88,8.72].forEach((t,k)=>fx('alesPetites',t-.02,.07-k*.008,.05));pc('pluja',7.5,.05);
  fx('sacsejaSorra',10.15,.12,.05);n(10.25,1.2,M,[4],.09,0);n(10.45,1.2,M,[7],.08,0);fx('plomes',11.2,.05,.05);fx('passesLleugeres',11.7,.05,.05,.6);},
 // 10 · the citipati on its nest: a tap inside an egg; she rises, three eggs crack and three chicks come out (a little bell rises with
 // each shell top); she coos; the chicks peep; she sits down again and spreads her wings over them
 (n,fx,pc)=>{fx('becClic',3.8,.035,0);fx('plomes',4.0,.05,0);fx('banySorra',4.3,.035,0,1.2);
  [5.5,5.95,6.45].forEach((t,k)=>fx('ou',t,.07-k*.008,[-.2,.05,.25][k]));[6.05,6.5,7.0].forEach((t,k)=>n(t,1.6,G,[[4,7,9][k]],.05,0));
  fx('citipati',6.15,.09,0);fx('citipati',7.75,.07,0,1.0);fx('pollets',7.6,.06,.15);fx('pollets',9.9,.05,.1,1.4);fx('pollets',12.2,.04,.1,1.2);
  fx('banySorra',8.9,.035,0,1.4);fx('plomes',9.8,.07,0);fx('plomes',10.9,.035,0);fx('citipati',10.55,.05,0,.9);n(10.6,1.6,H,[0,4,7],.08,0,{strum:.12});},
 // 11 · the parasaurolophus herd in the misty swamp: the caller steps onto the bank, lifts its head and sounds its crest; three others
 // answer, each softer, higher and farther away (the four calls rise through the chord); a drinker sips and lifts its dripping bill
 (n,fx,pc)=>{[3.1,6.25,9.4].forEach(t=>fx('beure',t-.2,.03,-.35,.6));fx('pasAigua',3.85,.05,-.1);fx('pasAigua',4.3,.07,-.1);
  n(4.8,1.6,'crestaRec',[0],.17,-1,{pan:-.1});n(4.85,2.4,H,[0,4],.07,-1);n(7.2,1.1,'crestaRec',[2],.11,-1,{pan:.3,rev:.5});
  n(8.6,1.1,'crestaRec',[4],.085,-1,{pan:.45,rev:.6});n(10.0,1.1,'crestaRec',[7],.065,-1,{pan:.5,rev:.7});n(10.1,2,G,[7],.04,0);
  fx('gotes',11.0,.035,-.35,1.4);fx('tollOnes',12.2,.025,-.35);},
 // 12 · the pteranodon and the plesiosaur at sunset: a wave breaks; the pteranodon vaults off its arms (sand thrown back) and climbs
 // with three slow flaps (a harp rises with it); far out, a plesiosaur lifts its neck out of the sea, breathes and slides back under
 (n,fx,pc)=>{fx('onada',1.45,.07,-.2);fx('sacsejaSorra',4.5,.08,-.3);for(let j=0;j<7;j++)n(4.6+j*.09,1.4,H,[[0,2,4,6,7,9,11][j]],.08+j*.006,0);
  [5.04,5.99,6.94].forEach((t,k)=>fx('alaCop',t-.55,.12-k*.025,-.2+k*.2));fx('onada',7.95,.06,-.1);
  fx('collSurt',8.6,.08,.35);n(8.75,2,G,[4],.05,0);n(9.15,2,G,[7],.045,0);fx('ictioRespira',9.9,.07,.35);fx('capbussa',10.8,.07,.35);fx('bombolles',11.4,.04,.35);},
 // 13 · the spinosaurus: it wades along the river; it lifts its head, its sail flushes and it hums with its mouth shut (a vibraphone
 // glows with the sail); the fish dart away; it dips its snout to drink and shakes the water off its head
 (n,fx,pc)=>{fx('passesAigua',2.5,.035,-.1);fx('passesAigua',5.2,.03,.05);[2.95,4.75,6.55].forEach((t,k)=>fx('pasAigua',t-.05,.07,-.25+k*.2));
  [3.85,5.65,7.45].forEach((t,k)=>fx('pasAigua',t-.05,.04,-.15+k*.2));fx('gegantRespira',3.65,.05,0);n(4.85,2.6,V,[0,4,7],.08,0,{strum:.18});n(5.6,2.4,V,[9],.05,0);
  fx('peixos',5.45,.06,.25);fx('sauropode2',5.55,.10,.1);n(5.6,2,'timpaniRec',[0],.06,-1);fx('beure',8.7,.08,.3);
  fx('sacseja',9.45,.11,.3);fx('peixos',9.5,.05,.4);fx('gotes',9.9,.04,.3);fx('gotes',11.6,.03,.3,1.6);n(9.6,1.2,M,[4],.08,0);n(9.95,1.2,M,[2],.07,0);},
 // 14 · Yutyrannus and Sinosauropteryx after the rain: a drop falls on the big feathered tyrannosaur's head; it snorts and shakes the
 // water off like a wet dog, head to tail, and fluffs up; the little Sinosauropteryx runs past (a marimba runs with it)
 (n,fx,pc)=>{fx('gotes',1.5,.03,-.1,1.2);fx('gotes',3.85,.05,-.15,.35);fx('rino',3.95,.05,-.15);fx('sacseja',4.6,.12,-.1);fx('sacseja',5.15,.06,.2);
  fx('gotes',5.1,.045,0,1.6);fx('plomes',6.3,.05,-.05);fx('pasAigua',6.8,.045,-.1);n(6.35,1.2,G,[7],.05,0);
  fx('passesLleugeres',8.6,.06,.45);fx('passesLleugeres',9.35,.05,-.3);for(let j=0;j<10;j++)n(8.62+j*.155,.6,M,[[11,9,7,9,7,4,7,4,2,0][j]],.07,0,{pan:.45-j*.09});},
 // 15 · the iguanodons by the pool: the adult rises onto its hind legs (a frame drum for its weight), pulls a conifer branch, snaps a
 // twig and chews; it comes down onto its hands; the young looks up
 (n,fx,pc)=>{fx('mastega',2.0,.03,.3,.8);fx('gotes',4.75,.03,.35,.4);n(4.8,1.6,G,[4],.04,0);pc('marc',4.55,.07);fx('megateri',4.6,.07,-.2);
  fx('branca',5.55,.07,.1);fx('ou',6.42,.05,.15,.4);n(6.45,.8,VP,[7],.08,1);fx('falgueres',6.5,.045,.15);fx('mastega',6.6,.07,.05);
  fx('megateri',8.0,.04,-.2,1.2);pc('marc',9.0,.055);pc('marc',9.18,.045);fx('gotes',9.45,.03,.35,.4);n(9.6,1.6,G,[7],.045,0);n(9.85,1.6,G,[9],.04,0);fx('mastega',11.4,.03,.3,.8);},
 // 16 · Archaeopteryx at the Solnhofen lagoon: it crouches on a branch, jumps, beats its wings and glides low over the water (a harp
 // rises, a glockenspiel glides down), lands on another branch, folds its wings and preens
 (n,fx,pc)=>{fx('aterraBranca',3.7,.03,-.3,.6);fx('alesPetites',4.45,.08,-.3);for(let j=0;j<6;j++)n(4.6+j*.08,1.2,H,[[0,2,4,6,7,9][j]],.07+j*.005,0);
  fx('alesPetites',5.12,.045,-.15);for(let j=0;j<6;j++)n(5.5+j*.27,1.6,G,[[11,9,7,6,4,2][j]],.045,-1,{pan:-.15+j*.08});
  fx('plomes',7.05,.05,.3);fx('aterraBranca',7.35,.07,.35);fx('plomes',8.4,.03,.35);fx('plomes',8.95,.03,.35);n(7.45,1.4,H,[0,4,7],.07,0,{strum:.08});
  fx('plomes',9.8,.04,.35);fx('becClic',10.05,.025,.35);fx('plomes',10.6,.035,.35);},
 // 17 · the stegosaurus: it lifts its head and steps (a frame drum); its plates flush slowly (a harp climbs with them); it rumbles
 // softly, swings its tail and its spikes brush a cycad, which rustles and sways back
 (n,fx,pc)=>{fx('mastega',2.2,.045,-.15);pc('marc',4.0,.06);pc('marc',4.4,.07);pc('marc',4.6,.035);pc('marc',4.9,.03);
  for(let j=0;j<7;j++)n(4.2+j*.4,1.6,H,[[0,2,4,6,7,9,11][j]],.055+j*.005,0);fx('rex',6.2,.06,-.1);fx('mastega',7.9,.04,-.15);
  fx('cuaEscombra',8.4,.06,.3);fx('escombra',9.1,.08,.4);pc('pluja',9.3,.035);fx('cuaEscombra',9.3,.035,.3);n(9.25,1.2,M,[4],.08,0);n(9.5,1.2,M,[2],.07,0);fx('mastega',12.0,.04,-.15);},
 // 18 · the brachiosaurus and the diplodocus: the brachiosaurus lifts its neck to the araucaria and strips a branch of its shoots; the
 // branch springs back and needles fall (a glockenspiel falls with them); the diplodocus walks below (a frame drum for each foot); the
 // brachiosaurus rumbles with its mouth shut, the diplodocus swishes its whip tail, and the brachiosaurus browses high in the crown
 (n,fx,pc)=>{fx('gegantRespira',3.05,.07,-.15);fx('branca',5.0,.09,.15);fx('falgueres',5.95,.05,.2);pc('pluja',6.0,.04);
  for(let j=0;j<6;j++)n(6.05+j*.3,1.6,G,[[11,9,7,4,2,0][j]],.045-j*.003,-1,{pan:.2});fx('mastega',6.0,.04,.15);
  [4.5,5.15,5.8,6.45,7.1,7.75,8.4,9.05].forEach((t,k)=>pc('marc',t,k%4<2?.035:.025));fx('falgueres',4.2,.03,.45);
  fx('sauropode',9.35,.13,-.1);n(9.4,2,'timpaniRec',[0],.06,-1);fx('cuaEscombra',9.6,.05,.45);n(9.7,1.4,M,[4],.07,0);n(10.1,1.4,M,[2],.06,0);
  fx('gegantRespira',9.9,.04,-.15);fx('branca',12.0,.05,.15);},
 // 19 · the ichthyosaurs of Holzmaden: three swim up together and leap one after another like dolphins, each taking a breath at the
 // surface (a vibraphone rises with the three); a fourth comes close, slows, looks at us with its big eye and swims on
 (n,fx,pc)=>{fx('bombolles',3.6,.03,.2);[[4.60,5.60,.09],[5.61,6.69,.075],[6.62,7.78,.06]].forEach(([u,d,v],k)=>{fx('saltIctio',u-.05,v,.15+k*.1);
   fx('ictioRespira',u+.02,v*.7,.15+k*.1);fx('capbussa',d-.05,v*.8,.2+k*.1);n(u,1.6,V,[[4,7,9][k]],.08,0,{pan:.15+k*.1});});
  fx('bombolles',5.75,.04,.25);fx('bombolles',7.9,.035,.35);fx('bombolles',9.1,.03,-.3);[9.45,9.6,9.7].forEach((t,k)=>n(t,.8,G,[[11,9,11][k]],.03,0,{pan:-.4+k*.1}));
  n(10.0,2.4,H,[0,4,7,11],.08,0,{strum:.12});n(10.3,2,V,[4],.05,0);fx('bombolles',10.8,.04,.1);},
 // 20 · Eoraptor, one of the first dinosaurs: its head peeks out of the ferns and looks round; it crouches and leaps onto a rock (a
 // harp rises with the leap), lands softly and stands looking out over the immense valley under the ash of the volcano
 (n,fx,pc)=>{fx('falgueres',3.8,.05,.2);[4.22,4.62,4.98].forEach((t,k)=>n(t,1,M,[[4,7,9][k]],.06,0,{pan:.2}));fx('falgueres',5.55,.03,.15);
  fx('saltRoca',5.85,.07,-.1);fx('falgueres',5.9,.04,.15);for(let j=0;j<5;j++)n(5.86+j*.08,1.2,H,[[0,2,4,6,7][j]],.07+j*.006,0);
  n(6.27,1,CP,[0],.12,-1);fx('roca',6.3,.03,-.15,1);fx('passesLleugeres',6.75,.025,-.15,.4);
  n(7.75,1.8,G,[7],.05,0,{pan:-.2});n(9.25,1.8,G,[9],.045,0,{pan:.1});n(10.15,1.8,G,[11],.045,0,{pan:-.2});n(10.6,2.2,H,[0,4,7],.07,0,{strum:.1});}]);
export function pouScore(i,duration=POU_STIM){i=((i%POU_N)+POU_N)%POU_N;const S=Math.max(POU_STIM,duration),D=pouDuration(i,duration),P=POU_PIECES[i],sc=PO_SCALES[P.mode],E=escScore(D),T0=POU_TRAVEL,L=POU_LOUD*POU_TRIM[i];
 const deg=(d,o=0)=>P.root+12*(o+Math.floor(d/7))+sc[((d%7)+7)%7];
 const n=(t,len,inst,ds,vel,o=0,x={})=>E.add(t,len,inst,[...new Set([].concat(ds).map(d=>poFit(inst,deg(d,o))))],vel*L,x);
 const fx=(variant,t,vel,pan=0,len=4,inst=PR)=>E.add(t,len,inst,[60],vel*L,{variant,pan});
 const pc=(variant,t,vel)=>E.add(t,variant==='pluja'?3.6:1.2,'pouPerc',[60],vel*L,{variant});
 // the travelling: sand and grit trickle down the rock; the next era's instrument runs down (a longer run through the 66 million years
 // between the Ice Age and the end of the Cretaceous); then the fossil wakes: a harp rises and two bells ring
 fx('roca',0,.08);if(i===4){fx('roca',.9,.06);n(1.3,1.6,'timpaniRec',[0],.08,-1);}
 const run=poRun(i),steps=i===4?14:9;for(let j=0;j<steps;j++)n(.08+j*(1.7/steps),.9,run,[14-j],.13-j*.003,run===G?-1:0);
 for(let j=0;j<6;j++)n(1.75+j*.17,1.6,H,[[0,4,7,9,11,14][j]],.15,-1);n(2.9,1.6,G,[7],.07,0);n(3.3,1.6,G,[11],.06,0);
 if(P.amb)fx(P.amb,1.4,.07,0,S*.92,'natureRec');
 const beat=60/P.bpm,B=4*beat,bars=Math.max(2,Math.floor((S-1.6)/B)),t1=T0+1.6,cad=T0+S-B*.75;
 for(let k=0;k<bars-1;k++){const t=t1+k*B,r=P.chords[k%P.chords.length];if(t>=cad)break;
  n(t,B*.5,P.bass,[r],.26,P.bass===M?-1:-2);n(t+2*beat,B*.4,P.bass,[r+4],.18,P.bass===M?-1:-2);
  P.figure.forEach((f,j)=>{const u=t+j*B/P.figure.length;if((j+k)%7===6||u>=cad)return;n(u,beat*1.4,P.arp,[r+f],j%4===0?.15:.11,P.arpOct);});
  if(k%2===0)n(t+.02,1.6,P.spark,[r+7],.07,1);
  [...P.perc].forEach((c,j)=>{const u=t+j*B/8;if(c==='.'||u>=cad)return;
   if(c==='U')n(u,1.4,'uduRec',[r],.16,-2);else if(c==='u')n(u,.9,'uduRec',[r+4],.10,-1);else if(c==='S')n(u,1.3,SL,[r],.15,-1);else if(c==='s')n(u,1.3,SL,[r+4],.10,-1);
   else if(c==='K')n(u,1.6,'timpaniRec',[r],.10,-2);else if(c==='t')E.add(u,1,'triangleRec',[60],.05*L,{variant:'hit'});
   else pc({P:'pedra',p:'pedra2',F:'marc',T:'tronc'}[c],u,c==='F'?.10:.07);});}
 const phrase=(t0,inst,shift,vel,oct)=>{let u=t0;for(const [d,bt] of P.motif){if(u>=cad-.2)break;if(d!==null)n(u,Math.min(bt*beat*1.15,cad-u),inst,[d+shift],vel,oct);u+=bt*beat;}};
 phrase(t1+B*.5,P.lead,0,.22,P.leadOct);if(bars>3)phrase(t1+B*2.5,P.answer,-2,.17,P.answer===G?0:P.leadOct);
 const lag=POU_PRESS_TIMED.includes(i)?0:POU_LAG;POU_CUES[i]((t,...a)=>n(t+lag,...a),(v,t,...a)=>fx(v,t+lag,...a),(v,t,...a)=>pc(v,t+lag,...a),S);
 // the end: a plucked chord on the harp and the era's instrument, a bell, the bass, all dying away
 n(cad,2.6,H,[0,4,7,9,14],.2,0,{strum:.07});n(cad+.05,1.6,P.lead===F||P.lead===HN?M:P.lead,[0,4,7],.15,0,{strum:.05});n(cad+.35,2.2,G,[7],.09,1);n(cad,1.2,P.bass===M?CP:P.bass,[0],.24,-2);
 // after the twentieth, the climb back to today: each era sounds once on the way up (the slit drum, the glockenspiel, the vibraphone,
 // the marimba, the harp of the Ice Age), the soil, the garden; the harp and the bells; the robin sings
 if(i===POU_N-1){const c0=T0+S;fx('roca',c0,.07);fx('roca',c0+1.6,.05);
  [[SL,-1],[G,-1],[V,0],[M,0],[H,1]].forEach(([inst,o],k)=>{for(let j=0;j<3;j++)n(c0+.3+k*.75+j*.16,1,inst,[k*2+j*2],.11,o);});
  fx('pouJardi',c0+3.4,.06,0,3.6,'natureRec');n(c0+4.0,2.4,H,[0,4,7,9,14],.15,0,{strum:.08});n(c0+4.1,2,G,[7,11],.07,0,{strum:.1});fx('pitroig',c0+4.3,.13,.15,2.4);}
 return E.done();}

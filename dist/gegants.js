import {escScore} from './escenari.js';
/* Gegants del blau · CE38 · Pim Pam 0.36 (after El pou del temps, 0.31): a journey across the oceans, from the Arctic to the Southern
 * Ocean, in twenty scenes. Each press: a travelling of GG_TRAVEL s through open water to the next place; there a great fish or a whale
 * swims into the frame, makes its most striking gesture with life round it, and swims out; at the end the empty scene slows to a stop
 * and darkens until the next press. After the twentieth the camera climbs with the blue whale to the surface, where it blows against the
 * sunset (the surface scene, GG_SURF). Before the first press the same sea rests, empty.
 * The camera is a tuple [scene, x, y, view height], in the world of that scene (units of 10 m, the surface at y 0).
 */
export const GG_TRAVEL=2,GG_STIM=12,GG_RETURN=10.5,GG_N=20,GG_SURF=20;
// The whale shark (15) and the blue whale (20) take 2 s more.
const GG_LONG=Object.freeze([14,19]);
export const ggStim=(i,duration=GG_STIM)=>Math.max(GG_LONG.includes(i)?GG_STIM+2:GG_STIM,duration);
export const ggDuration=(i,duration=GG_STIM)=>GG_TRAVEL+ggStim(i,duration)+(i===GG_N-1?GG_RETURN:0);
export const GG_NAMES=Object.freeze(['Els narvals','Les belugues','La balena de Groenlàndia','El tauró pelegrí','Les iubartes i la xarxa de bombolles',
 'Les tonyines vermelles','Els catxalots','El rorqual comú','El peix lluna','Els dofins i el veler','El salt de la iubarta','Els taurons martell',
 'El peix rem','Els dofins rotadors','El tauró balena','Les mantes','El dugong','La balena franca i la seva cria','Les orques','La balena blava']);
// The ocean of each scene: a new ocean makes the travel longer.
const GG_OCEAN=Object.freeze([0,0,0,1,1,1,2,2,2,2,3,3,3,3,4,4,4,5,5,5]);
// The shots: for each scene, keys [t (seconds after the press), x, y, view height]; the camera passes through them smoothly (a
// monotone cubic of each value, the height in its logarithm). The first key is where the travel arrives (t = GG_TRAVEL).
// GG_SHOTS[GG_SURF]: the climb after the twentieth (t: seconds since the climb started) and, at its end, the rest of the surface.
const GGK=(...k)=>Object.freeze(k.map(Object.freeze));
const GG_SHOTS=Object.freeze([
 GGK([2,-.25,-.50,1.05],[6.2,.30,-.40,.95],[9.5,.58,-.40,.95],[14,.80,-.48,1.05]),   // 1 the narwhals: under the ice, the lead at the top
 GGK([2,.40,-.20,.80],[8,.08,-.21,.78],[14,-.28,-.20,.82]),   // 2 the belugas: low over the pebbles, travelling left with them
 GGK([2,-.30,-.40,.95],[4.4,-.02,-.22,.95],[5.5,.12,.05,1.0],[8.7,.16,.05,1.0],[10.4,.40,-.60,1.8],[14,.85,-.80,2.5]),   // 3 the bowhead: close under the ice, up to the waterline for the break and the blow, back under and away
 GGK([2,-.45,-.24,.50],[4.5,-.10,-.22,.55],[7.5,.10,-.16,1.05],[10,.05,-.14,1.25],[14,-.05,-.14,1.25]),   // 4 the basking shark: close on the head, back to show all of it
 GGK([2,0,-.72,1.55],[6,0,-.62,1.5],[9,0,-.58,1.45],[14,.02,-.70,1.55]),   // 5 the humpbacks' bubble net: from below, the surface above
 GGK([2,-.15,-.55,.92],[14,1.25,-.57,.92]),   // 6 the bluefin tuna: panning with the school
 GGK([2,-.05,-1.52,1.55],[8,.05,-1.52,1.50],[14,.45,-1.55,1.60]),   // 7 the sperm whales: deep, the whole group
 GGK([2,2.30,-.50,1.30],[6,.95,-.45,1.30],[7.8,.45,-.10,1.25],[8.6,.35,.08,1.25],[10,.35,.05,1.30],[11.5,.55,-.35,1.40],[14,.80,-.45,1.45]),   // 8 the fin whale: panning with it, up to the waterline for the blow
 GGK([2,-.08,-.72,1.10],[5.2,-.02,-.30,.72],[9.6,.0,-.25,.64],[11.5,-.04,-.36,.80],[14,-.06,-.40,.90]),   // 9 the sunfish: up with it from the blue, close under the surface while it basks
 GGK([2,.12,-.05,.66],[6,.16,-.04,.62],[7.4,.22,.02,.66],[9.6,.30,.02,.70],[11.5,.32,-.04,.70],[14,.38,-.06,.74]),   // 10 the dolphins at the bow: at the waterline beside the bow
 // 11 the humpback: it rises from the deep, singing (the camera follows it up from a little above it), then the camera rises to the
 // waterline for the breach and dips under again as it swims away
 GGK([2,.55,-2.45,1.75],[3,.76,-2.08,1.75],[4,.73,-1.51,1.75],[5.2,.42,-.92,1.75],[6.4,.18,.36,1.62],[9.7,.18,.36,1.62],[10.8,.75,-1.02,2.1],[14,.80,-1.05,2.1]),
 GGK([2,0,-.60,1.0],[8,.06,-.58,.96],[14,.14,-.55,1.0]),   // 12 the hammerheads: looking up at the school against the light
 GGK([2,.05,-1.38,.50],[5,.05,-1.52,.42],[7.6,.06,-1.66,.46],[9.6,.07,-1.80,.72],[11.2,.15,-1.85,.86],[14,.30,-1.85,.95]),   // 13 the oarfish: close on its head and crest, down its length, back to the whole ribbon
 GGK([2,0,-.05,.76],[5.5,.05,.02,.74],[8,.12,.08,.78],[10.5,.20,.0,.80],[14,.30,-.05,.82]),   // 14 the spinner dolphins: at the waterline, rising a little for the leap
 GGK([2,.80,-.22,.62],[4.5,.62,-.24,.70],[8,.30,-.30,1.05],[11,.00,-.32,1.15],[16,-.25,-.40,1.25]),   // 15 the whale shark: close on the open mouth, back to the whole fish
 GGK([2,0,-1.2,1.0],[14,.05,-1.2,1.0]),   // 16 the mantas: looking down at a slant over the reef
 GGK([2,.32,-.23,.58],[8,.12,-.23,.58],[11,-.04,-.19,.60],[14,-.20,-.22,.62]),   // 17 the dugong: low over the meadow, up with it to breathe
 GGK([2,.70,-.30,1.10],[6,.45,-.30,1.10],[9.5,.25,-.32,1.15],[11.5,.20,-.40,1.35],[14,.05,-.55,1.40]),   // 18 the southern right whale and her calf: alongside, then back for the dive
 GGK([2,.00,-.26,.85],[8,.20,-.24,.85],[14,.45,-.28,.90]),   // 19 the orcas: a slow travel right with the pod under the ice
 // 20 the blue whale: close on its eye as its head comes in from the right, then the camera pulls back to the whole body and the krill
 GGK([2,.40,-.97,.62],[3.3,.62,-.97,.62],[4.6,.93,-.98,.62],[5.2,.86,-.99,.66],[7.8,-.20,-1.22,1.95],[11,-.36,-1.22,1.95],[16,-.40,-1.26,1.98]),
 // the climb: up with the blue whale to the waterline, the sky of the sunset over the sea
 GGK([0,-.6,-1.7,2.2],[4.4,.05,.30,1.9],[10,.10,.30,1.9])]);
export const GG_IDLE=100;
// The moment each scene shows when it is drawn still («Reducció de moviment»): the animal in the middle of its gesture.
export const GG_STILL=Object.freeze([7,7.6,7.4,7,8.4,7.2,5.5,9.3,8.0,7.6,7.6,7.6,8.0,7.8,8.5,7.6,7.6,7.0,7.0,10.4]);
// «Moviment de càmera: suau» (setting ggCamera): the shots stay nearer their mean framing, a little wider, and the travels are shorter.
let GG_SOFT=false;
export const ggSetSoft=v=>{GG_SOFT=!!v;};
const GGclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const GGsmooth=x=>{x=GGclamp(x);return x*x*(3-2*x);};
// A monotone cubic through the keys (Fritsch–Carlson), still at the first and the last.
function ggCurve(ts,vs,t){const n=ts.length;if(t<=ts[0])return vs[0];if(t>=ts[n-1])return vs[n-1];let k=0;while(k<n-2&&t>ts[k+1])k++;
 const d=[];for(let j=0;j<n-1;j++)d.push((vs[j+1]-vs[j])/(ts[j+1]-ts[j]));
 const m=vs.map((_,j)=>j===0||j===n-1?0:d[j-1]*d[j]<=0?0:(d[j-1]+d[j])/2);
 for(let j=0;j<n-1;j++){if(d[j]===0){m[j]=0;m[j+1]=0;continue;}const a=m[j]/d[j],b=m[j+1]/d[j],s=a*a+b*b;if(s>9){const r=3/Math.sqrt(s);m[j]=r*a*d[j];m[j+1]=r*b*d[j];}}
 const h=ts[k+1]-ts[k],u=(t-ts[k])/h,u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*vs[k]+(u3-2*u2+u)*h*m[k]+(-2*u3+3*u2)*vs[k+1]+(u3-u2)*h*m[k+1];}
const GG_CURVES=GG_SHOTS.map(keys=>{const ts=keys.map(k=>k[0]),ch=[1,2].map(c=>keys.map(k=>k[c])),lz=keys.map(k=>Math.log(k[3]));
 const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;return {ts,x:ch[0],y:ch[1],lz,mx:mean(ch[0]),my:mean(ch[1]),mz:mean(lz)};});
// The camera inside scene i at its clock t.
export function ggShot(i,t){const C=GG_CURVES[i];let x=ggCurve(C.ts,C.x,t),y=ggCurve(C.ts,C.y,t),lz=ggCurve(C.ts,C.lz,t);
 if(GG_SOFT){x=C.mx+(x-C.mx)*.45;y=C.my+(y-C.my)*.45;lz=C.mz+(lz-C.mz)*.4+Math.log(1.15);}
 return [i,x,y,Math.exp(lz)];}
export const ggRest=i=>i<0||i>=GG_N?ggShot(GG_SURF,1e9):ggShot(i,1e9);
export const GG_START=Object.freeze(ggShot(GG_SURF,1e9));
// How far the travel to scene i goes, in screen heights: further between oceans and from the surface.
const ggReach=i=>(i===0?1.8:GG_OCEAN[i]!==GG_OCEAN[i-1]?2.4:1.4)*(GG_SOFT?.5:1);
// The travel to scene i at u (0 .. 1): the camera left behind speeds away to the right (and down, from the surface) while its scene veils
// into its own water; the new one comes out of its water as the camera slows into its first framing. Speed in screen heights per second.
function ggTravel(i,u,from){const D=ggReach(i),k0=ggShot(i,GG_TRAVEL),old=[from[0],from[1]+D*from[3]*u*u,from[2]-(from[0]===GG_SURF?.9*from[3]*u*u:0),from[3]*(1+.3*u)];
 const neu=[i,k0[1]-D*k0[3]*(1-u)*(1-u),k0[2],k0[3]*(1+.3*(1-u))];
 return {old,neu,move:2*D*Math.min(u,1-u)/GG_TRAVEL,veilOld:GGsmooth((u-.05)/.45),veilNew:1-GGsmooth((u-.5)/.45),mix:GGsmooth((u-.38)/.24)};}
// The camera at t seconds after the press of scene i (the travel's new camera while it travels; the climb's after the twentieth).
export function ggCamera(i,t,stim=GG_STIM,from=ggRest(i-1)){const S=ggStim(i,stim);
 if(t<GG_TRAVEL)return ggTravel(i,GGclamp(t/GG_TRAVEL),from).neu;
 if(i===GG_N-1&&t>GG_TRAVEL+S)return ggShot(GG_SURF,t-GG_TRAVEL-S);
 return ggShot(i,t);}
// The layers drawn at a moment of the press of scene i: [{scene, cam, tau, veil, mix, move}]. tau: the scene's clock; prevTau: the clock
// of the scene left behind (null before the first press: the surface, at rest).
export function ggLayers(i,t,tau,prevTau,stim=GG_STIM,from=ggRest(i-1)){const out=[];if(i<0)return out;const S=ggStim(i,stim),T0=GG_TRAVEL+S;
 if(t<GG_TRAVEL){const u=GGclamp(t/GG_TRAVEL),tr=ggTravel(i,u,from);
  const pt=from[0]===GG_SURF?GG_IDLE+t:prevTau??GG_IDLE;
  if(tr.mix<1)out.push({scene:from[0],cam:tr.old,tau:pt,veil:tr.veilOld,mix:1,move:tr.move});
  out.push({scene:i,cam:tr.neu,tau,veil:tr.veilNew,mix:tr.mix,move:tr.move});return out;}
 // the scene runs on its own clock (tau); after the twentieth, the climb dissolves it into the surface
 if(i===GG_N-1&&t>T0){const c=t-T0,u=GGclamp(c/1.6),cam=ggShot(i,tau);
  if(u<1)out.push({scene:i,cam:[i,cam[1],cam[2]+.8*cam[3]*u*u,cam[3]],tau,veil:GGsmooth(u/.6),mix:1,move:u*.6});
  out.push({scene:GG_SURF,cam:ggShot(GG_SURF,c),tau:c,veil:1-GGsmooth((u-.45)/.55),mix:GGsmooth((u-.3)/.3),move:(1-u)*.6});return out;}
 out.push({scene:i,cam:ggShot(i,tau),tau,veil:0,mix:1,move:0});return out;}
// The layers at rest: the scene, still, its camera at its clock; before the first press and after the climb, the surface.
export const ggRestLayers=(v,tau,done)=>v>=0&&!done?[{scene:v,cam:ggShot(v,tau),tau,veil:0,mix:1,move:0}]:[{scene:GG_SURF,cam:ggShot(GG_SURF,1e9),tau:done?Math.max(GG_IDLE,tau):GG_IDLE,veil:0,mix:1,move:0}];

/* The music and the sounds. Each ocean has its own acoustic instruments, and every piece ends on plucked or struck notes (sampler.js):
 * the Arctic the harp and the glockenspiel; the North Atlantic the marimba, the harp, plucked cellos and soft timpani; the Mediterranean
 * the marimba, the harp and a frame drum; the Caribbean and the Pacific the marimba, the kalimba and a clay pot drum (udu); the Indian
 * Ocean the vibraphone without motor, the kalimba and a wooden slit drum; the Southern Ocean the vibraphone, the harp and the timpani.
 * Every scene has the sound of the water round it (natureRec) and the animals and their gestures sound at the moments they happen
 * (GG_CUES): breaths and blows, splashes, bubbles, clicks, the ice, the pebbles, the sand. No held synthetic sound.
 * The gestures are named (GG_FX) and played from the banks that already have a fitting sound; the whales' and the dolphins' own voices
 * (GG_FX entries without a sound yet) stay silent until their recordings are added.
 */
const GG_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10]});
// root, mode, tempo, the melody and its answer, the plucked figure, the bass, the bell, the chords (degrees), the melody ([degree,
// beats]), the figure (degrees over the chord, one bar), the octaves of the figure and of the melody, one bar of percussion in eighths
// (K timpani, F frame drum, U udu low, u udu high, S slit drum, s slit drum high, t triangle) and the sound of the water.
const GG_P=(root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct,perc,amb)=>Object.freeze({root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct,perc,amb});
const gH='harpRec',gM='marimbaRec',gG='glockRec',gCP='celliPizzRec',gVP='violinsPizzRec',gV='vibRec',gKA='kalimbaRec',gTI='timpaniRec',gSL='escletxaRec';
const gSOTA='pouSotaAigua',gMAR='pouMar';
const GG_PIECES=Object.freeze([
 // the Arctic
 GG_P(62,'lydian',63,gH,gG,gH,gCP,gG,[0,1,4,0],[[4,1],[6,.5],[7,.5],[11,1],[9,1],[7,2]],[0,4,7,11,7,4],0,1,'t.......',gSOTA),
 GG_P(62,'lydian',70,gG,gH,gH,gCP,gG,[0,3,1,0],[[7,.5],[9,.5],[11,1],[9,.5],[7,.5],[4,2]],[0,4,7,4,9,4],0,0,'t...t...',gSOTA),
 GG_P(57,'lydian',56,gH,gG,gH,gCP,gG,[0,1,4,0],[[4,2],[6,1],[7,1],[9,2],[7,2]],[0,4,7,11,9,7],-1,0,'K.......',gSOTA),
 // the North Atlantic
 GG_P(57,'dorian',60,gM,gH,gH,gCP,gG,[0,3,6,4],[[0,1],[2,1],[4,2],[5,1],[4,1],[2,2]],[0,4,7,4,9,4],0,0,'K.......',gSOTA),
 GG_P(57,'dorian',66,gH,gM,gH,gCP,gG,[0,3,4,0],[[4,1],[7,1],[9,1],[7,2],[4,1],[2,2]],[0,4,7,9,7,4],0,0,'K.......','bubbles'),
 GG_P(64,'dorian',88,gM,gVP,gH,gCP,gG,[0,3,4,0],[[0,.5],[2,.5],[4,.5],[5,.5],[4,1],[2,1],[0,2]],[0,2,4,7,4,2,4,7],0,1,'K...K...',gSOTA),
 // the Mediterranean
 GG_P(55,'mixolydian',56,gH,gM,gH,gCP,gG,[0,6,3,0],[[4,2],[5,1],[4,1],[2,2],[0,2]],[0,4,7,4,2,4],-1,0,'F.......',gSOTA),
 GG_P(67,'mixolydian',76,gM,gH,gH,gCP,gG,[0,3,4,0],[[4,.5],[5,.5],[7,1],[9,1],[7,.5],[4,.5],[2,2]],[0,4,7,4,2,4],0,0,'F...F...',gMAR),
 GG_P(62,'mixolydian',70,gM,gVP,gH,gCP,gG,[0,3,4,0],[[7,1],[9,.5],[7,.5],[4,1],[2,1],[0,2]],[0,4,7,4,9,4],0,0,'F.......',gSOTA),
 GG_P(67,'major',92,gM,gH,gH,gCP,gG,[0,3,4,0],[[4,.5],[5,.5],[7,.5],[9,.5],[7,1],[4,1],[2,2]],[0,4,2,4,7,4,2,4],0,0,'F..F....','waves'),
 // the Caribbean and the Pacific
 GG_P(65,'major',66,gM,gKA,gH,gCP,gG,[0,3,4,0],[[4,1],[7,1],[9,1],[7,2],[4,1],[2,2]],[0,4,7,4,9,4],0,0,'U.......',gMAR),
 GG_P(60,'dorian',72,gKA,gM,gH,gCP,gG,[0,3,6,4],[[0,1],[2,.5],[4,.5],[5,1],[4,1],[2,2]],[0,4,7,4,9,4],0,0,'U...u...',gSOTA),
 GG_P(58,'lydian',54,gKA,gG,gH,gCP,gG,[0,1,4,0],[[4,2],[6,1],[7,1],[11,2],[9,2]],[0,4,7,11,7,4],-1,0,'U.......',gSOTA),
 GG_P(65,'major',84,gM,gKA,gH,gCP,gG,[0,3,4,0],[[4,.5],[5,.5],[7,.5],[9,.5],[7,1],[4,1],[2,2]],[0,4,2,4,7,4,2,4],0,0,'U...u.u.','waves'),
 // the Indian Ocean
 GG_P(64,'mixolydian',60,gV,gKA,gH,gCP,gG,[0,6,3,4],[[4,1],[5,.5],[4,.5],[2,1],[0,1],[2,2]],[0,4,7,4,2,4],0,0,'S.......',gSOTA),
 GG_P(64,'lydian',66,gKA,gV,gH,gCP,gG,[0,1,5,4],[[4,1],[6,.5],[7,.5],[11,1],[9,1],[7,2]],[0,4,7,9,7,4],0,0,'S...s...',gSOTA),
 GG_P(59,'mixolydian',72,gKA,gM,gH,gCP,gG,[0,3,4,0],[[4,.5],[5,.5],[7,1],[4,1],[2,1],[0,2]],[0,4,7,4,2,4],0,0,'S..s....',gSOTA),
 // the Southern Ocean
 GG_P(60,'lydian',60,gV,gH,gH,gCP,gG,[0,1,4,0],[[4,1],[6,.5],[7,.5],[9,1],[7,1],[4,2]],[0,4,7,11,7,4],0,0,'K.......',gSOTA),
 GG_P(57,'dorian',72,gV,gH,gH,gCP,gG,[0,3,6,4],[[0,1],[2,.5],[4,.5],[7,1],[5,1],[4,2]],[0,4,7,4,9,4],0,0,'K...K...',gSOTA),
 GG_P(60,'lydian',52,gH,gV,gH,gCP,gG,[0,1,4,0],[[4,2],[6,1],[7,1],[11,2],[9,2]],[0,4,7,11,9,7],-1,0,'K.......',gSOTA)]);
const GG_RANGE=Object.freeze({vibRec:[58,80],kalimbaRec:[50,81],uduRec:[36,57],escletxaRec:[50,68],timpaniRec:[38,58],celliPizzRec:[36,62],marimbaRec:[45,90],
 harpRec:[36,96],glockRec:[79,103],violinsPizzRec:[55,88]});
const ggFit=(inst,m)=>{const r=GG_RANGE[inst];if(!r)return m;while(m<r[0])m+=12;while(m>r[1])m-=12;return m;};
// The instrument of each ocean, which runs through the water in each travelling (the next scene's).
const GG_RUN=Object.freeze([gG,gM,gH,gKA,gV,gH]);
// The gestures and the voices: [bank, sound]. The voices, the big blow and the dugong's breath are Gegants del blau's own (ggRec).
const GG_FX=Object.freeze({
 bufada:['ggRec','bufada'],respira:['pouRec','ictioRespira'],capbussa:['pouRec','capbussa'],salt:['pouRec','saltIctio'],
 esquitx:['sabanaRec','esquitx'],caiguda:['sabanaRec','capbussada'],capbussada:['selvaRec','capbussada'],bombolles:['pouRec','bombolles'],
 onada:['pouRec','onada'],anelles:['pouRec','tollOnes'],gotes:['pouRec','gotes'],peixos:['pouRec','peixos'],glop:['selvaRec','glup'],
 dofi:['ggRec','dofins'],respiraDugong:['ggRec','dugongRespira'],catxalot:['ggRec','catxalot'],rorqual:['ggRec','rorqual'],gel:['pouRec','closca'],trenca:['pouRec','branca'],codols:['pouRec','roca'],sorra:['pouRec','banySorra'],
 mastega:['pouRec','mastega'],aleta:['pouRec','cuaEscombra'],
 narval:['ggRec','narval'],beluga:['ggRec','beluga'],groenlandia:['ggRec','groenlandia'],iubarta:['ggRec','iubarta'],orca:['ggRec','orques'],
 franca:['ggRec','franca'],blava:['ggRec','blava']});
export const GG_LOUD=2.4;
// The level of each press, measured (tools/gegants-audio.mjs) and set to −29.6 LUFS on the review copy (gain ∝ trim²).
const GG_TRIM=Object.freeze([1.195,1.162,1.154,1.155,1.168,1.135,1.189,1.122,1.116,1.096,1.181,1.103,1.182,1.122,1.078,1.109,1.096,1.122,1.084,1.281]);
// The cues are written on the scene's own clock (the shaders' T): it runs 0.3 s behind the seconds since the press.
const GG_LAG=.3;
// The gestures of each scene at their moments. n: notes (degrees of the piece's scale); fx: a gesture or a voice (GG_FX).
const GG_CUES=Object.freeze([
 // 1 · the narwhals: they come in under the ice; one after another they rise into the lead and breathe (a bell rises with each), roll
 // down and go on under the far floe
 (n,fx)=>{fx('gel',2.6,.04,-.3);fx('narval',3.2,.08,-.4);[7.0,8.1,9.1].forEach((t,k)=>{const p=-.1+k*.12;fx('respira',t,.08-k*.01,p,1);fx('anelles',t+.1,.04,p);
   n(t,1.6,gG,[[4,7,9][k]],.06,0,{pan:p});fx('capbussa',t+.7,.035,p+.1);});n(9.9,2.2,gH,[0,4,7,11],.08,0,{strum:.1});fx('bombolles',10.3,.035,.35);fx('gel',11.4,.03,.3);},
 // 2 · the belugas: they come in chirping; one after another they roll over and rub on the pebbles (the stones, the silt, a harp turns
 // with each roll); they rise and swim away
 (n,fx)=>{fx('beluga',2.8,.08,.4);for(let j=0;j<3;j++)n(3.0+j*.14,.8,gG,[[9,11,9][j]],.035,0,{pan:.4});
  [[6.2,.2],[7.1,.05],[8.1,-.1]].forEach(([t,p],k)=>{fx('codols',t,.06-k*.01,p);fx('sorra',t+.35,.05-k*.008,p);for(let j=0;j<4;j++)n(t+j*.22,1.2,gH,[[7,4,2,0][j]+(k===2?2:0)],.06,0,{pan:p});});
  fx('beluga',9.6,.06,-.2);n(9.7,1.4,gM,[4],.07,0);n(9.95,1.4,gM,[7],.06,0);fx('aleta',10.4,.04,-.3);fx('bombolles',11.0,.03,-.35);},
 // 3 · the bowhead: it rises under the thin ice (soft timpani); its crown cracks the sheet (the plates slide off, a bell falls with
 // them); the V-shaped blow; it sinks back, the plates fall back and it glides away
 (n,fx)=>{n(3.0,2,gTI,[0],.06,-1);fx('groenlandia',3.0,.10,0,4.6);fx('gel',4.7,.05,0);fx('trenca',5.2,.12,0);fx('gel',5.35,.08,.1);n(5.2,2,gTI,[0],.10,-1);
  fx('esquitx',5.6,.06,-.1);fx('onada',5.8,.05,0);for(let j=0;j<6;j++)n(5.4+j*.11,1.4,gG,[[11,9,7,4,2,0][j]],.05,-1);
  fx('bufada',6.9,.13,0);n(7.0,2.2,gH,[0,4,7,11],.09,0,{strum:.12});fx('gotes',7.6,.04,0,1.6);
  fx('esquitx',8.9,.04,.15);fx('esquitx',9.3,.035,-.15);fx('capbussa',9.6,.06,0);fx('bombolles',10.0,.05,0);n(10.2,1.6,gM,[4],.07,0);n(10.5,1.6,gM,[2],.06,0);fx('aleta',11.2,.04,-.2);},
 // 4 · the basking shark: its mouth opens wide (a harp opens with it); the plankton streams in (a bell glitters); it closes its mouth
 // and swims out
 (n,fx)=>{fx('bombolles',2.6,.03,-.3);for(let j=0;j<7;j++)n(4.2+j*.15,1.4,gH,[[0,2,4,5,7,9,11][j]],.06+j*.005,-1);fx('onada',4.5,.04,-.1);
  for(let j=0;j<8;j++)n(5.4+j*.3,1.2,gG,[[11,9,11,7,9,4,7,2][j]],.03,-1,{pan:-.2+j*.03});fx('peixos',6.2,.03,.2);
  n(8.5,1.2,gM,[4],.08,0);n(8.8,1.2,gM,[0],.08,0);n(8.5,1.4,gCP,[0],.10,-1);fx('aleta',9.6,.05,.3);fx('aleta',10.6,.04,.4);fx('bombolles',11.2,.03,.4);},
 // 5 · the bubble net: the spiral of bubbles rises (the marimba goes round with it); the three humpbacks rise through it (timpani, a
 // harp climbs), break the surface with their mouths open and close them on the krill
 (n,fx)=>{for(let j=0;j<8;j++){const p=-.5+j*.14;fx('bombolles',2.2+j*.33,.05,p);n(2.3+j*.33,1,gM,[[0,2,4,7,9,7,4,2][j]],.06,0,{pan:p});}fx('iubarta',3.6,.10,0);
  n(4.8,2.4,gTI,[0],.08,-1);for(let j=0;j<6;j++)n(5.0+j*.5,1.6,gH,[[0,2,4,7,9,11][j]],.06+j*.006,-1);fx('bombolles',5.5,.05,0);
  fx('caiguda',8.1,.10,0);fx('onada',8.2,.06,0);n(8.2,2.2,gH,[0,4,7,9,14],.09,0,{strum:.08});fx('glop',9.0,.07,-.1);fx('glop',9.25,.05,.15);
  fx('gotes',8.8,.03,0,1.4);fx('bombolles',9.6,.04,0);n(10.2,1.6,gG,[7],.04,0);n(10.8,1.6,gG,[4],.035,0);},
 // 6 · the bluefin tuna: the river of fish streams past; the whole school turns at once (a bell runs from the front to the back) and
 // swims on
 (n,fx)=>{[2.4,3.3,4.2,5.1,6.0].forEach((t,k)=>fx('aleta',t,.035,-.5+k*.15));fx('peixos',2.8,.04,-.4);
  for(let j=0;j<10;j++)n(6.8+j*.08,1,gG,[j],.04,-1,{pan:-.4+j*.09});fx('peixos',6.9,.07,0);fx('aleta',7.0,.06,0);fx('peixos',7.3,.05,.2);
  n(7.6,1.4,gM,[4],.08,0);n(7.85,1.4,gM,[7],.07,0);fx('aleta',9.5,.04,.4);fx('aleta',10.6,.03,.5);},
 // 7 · the sleeping sperm whales: they hang still (a harp, a bell); one after another they wake, turn level and swim off clicking
 (n,fx)=>{fx('bombolles',3.0,.025,-.1);n(3.4,2.4,gH,[0,4],.05,-1);n(4.8,1.8,gG,[7],.03,0);
  [6.3,6.9,7.5,8.1].forEach((t,k)=>{n(t,1.6,gCP,[[0,4,2,0][k]],.09,-1);n(t+.05,1.6,gM,[[4,7,9,11][k]],.06,0);
});fx('catxalot',6.7,.10,-.05,4.8);fx('catxalot',7.9,.07,.3,4.8);fx('aleta',8.9,.04,.3);fx('bombolles',10.2,.03,.4);},
 // 8 · the fin whale: it comes in fast (three soft timpani, like its low pulses), rolls onto its side (a harp turns) and rises; its
 // head breaks the surface and it blows; it dives and goes
 (n,fx)=>{fx('aleta',2.2,.05,.4);fx('bombolles',2.6,.035,.3);fx('rorqual',2.4,.09,.3);[2.6,3.4,4.2].forEach(t=>n(t,1.4,gTI,[0],.05,-1));
  for(let j=0;j<8;j++)n(3.7+j*.36,1.4,gH,[[0,2,4,7,9,7,4,2][j]],.06,0);fx('aleta',5.0,.035,.1);
  fx('onada',8.4,.05,0);fx('bufada',8.6,.14,0);n(8.7,2.2,gH,[0,4,7,9,14],.09,0,{strum:.08});fx('gotes',9.3,.035,0,1.4);
  fx('capbussa',10.2,.06,-.2);fx('aleta',10.8,.05,-.4);fx('bombolles',11.3,.03,-.4);},
 // 9 · the ocean sunfish: it rises beating its fins (the marimba with each beat), lies on its side under the surface (its fin tip
 // sends rings; the little fish scatter and come back) and sinks away
 (n,fx)=>{[2.4,3.2,4.0,4.8].forEach((t,k)=>{fx('aleta',t,.03,0);n(t,.9,gM,[k%2?2:4],.05,0);});
  for(let j=0;j<5;j++)n(5.4+j*.24,1.4,gH,[[7,4,2,0,-3][j]],.06,0);fx('esquitx',6.6,.04,.1);fx('anelles',6.8,.05,.1);fx('anelles',7.9,.04,.1);fx('peixos',7.0,.05,-.2);
  for(let j=0;j<4;j++)n(7.1+j*.1,.8,gG,[[11,9,7,9][j]],.03,0,{pan:-.2});fx('peixos',8.4,.035,.25);fx('anelles',9.0,.03,.1);
  for(let j=0;j<5;j++)n(9.7+j*.22,1.4,gM,[[0,2,4,7,4][j]],.05,0);fx('bombolles',10.4,.035,0);},
 // 10 · the striped dolphins at the bow: they come up whistling into the bow wave; one turns its eye up to the boat (a bell); a pair
 // leaps twice (the marimba leaps with them); they peel away
 (n,fx)=>{fx('onada',2.0,.05,.2);fx('dofi',2.6,.06,-.3,3.2);fx('bombolles',3.0,.04,-.2);
  n(5.8,1.4,gG,[4],.04,0);n(6.1,1.4,gG,[7],.035,0);fx('onada',6.0,.04,.2);
  [7.0,9.0].forEach((t,k)=>{const p=.1-k*.2;fx('salt',t-.1,.07,p);fx('salt',t,.05,p+.1);for(let j=0;j<4;j++)n(t+j*.1,1,gM,[[4,7,9,11][j]],.06,0,{pan:p});
   fx('esquitx',t+.9,.06,p);fx('capbussa',t+1.0,.045,p+.1);});fx('dofi',10.8,.05,.35,2.6);fx('aleta',11.1,.04,.4);},
 // 11 · the humpback breach: it rises singing; it bursts out of the water (timpani, a harp climbs, the water pours off), falls and
 // crashes (timpani and a harp chord); under the water, its cloud of bubbles
 (n,fx)=>{fx('iubarta',2.6,.10,0);fx('bombolles',3.4,.03,0);fx('onada',5.4,.04,0);
  fx('esquitx',6.4,.10,0);fx('onada',6.5,.06,0);n(6.4,2,gTI,[0],.10,-1);for(let j=0;j<8;j++)n(6.45+j*.1,1.6,gH,[[0,2,4,5,7,9,11,14][j]],.07+j*.005,-1);fx('gotes',7.3,.06,0,1.8);
  n(8.2,1.2,gM,[9],.06,0);n(8.6,1.2,gM,[7],.06,0);n(9.0,1.2,gM,[4],.06,0);
  fx('caiguda',9.3,.14,0);fx('capbussada',9.35,.09,0);fx('onada',9.5,.07,0);n(9.3,2.4,gTI,[0],.12,-1);n(9.35,2.4,gH,[0,4,7,9,14],.10,0,{strum:.06});
  fx('bombolles',9.8,.07,0);fx('bombolles',10.6,.05,.1);fx('iubarta',11.4,.06,-.2);},
 // 12 · the scalloped hammerheads: the school streams across; one shakes its head from side to side (the marimba from side to side);
 // one passes close below; the school rises toward the light (a bell rises)
 (n,fx)=>{[2.2,3.0,3.8,4.6,5.4].forEach((t,k)=>fx('aleta',t,.035,-.5+k*.2));fx('peixos',3.2,.03,-.2);
  [6.7,7.0,7.3,7.6,7.9,8.2].forEach((t,k)=>{const p=k%2?-.2:.2;n(t,.8,gM,[k%2?2:4],.06,0,{pan:p});fx('aleta',t,.025,p,.8);});
  fx('aleta',8.6,.07,-.1);fx('bombolles',8.9,.04,0);n(8.8,1.4,gCP,[0],.09,-1);
  for(let j=0;j<6;j++)n(9.6+j*.35,1.4,gG,[[0,2,4,7,9,11][j]],.035,-1,{pan:.1+j*.08});fx('aleta',11.0,.03,.5);},
 // 13 · the oarfish: the long ribbon comes down (a harp comes down slowly); waves run down its fin (the kalimba runs down three
 // times); specks of living light wink (a bell here and there); it glides away
 (n,fx)=>{for(let j=0;j<6;j++)n(2.3+j*.6,1.8,gH,[[11,9,7,6,4,2][j]],.05,0);
  [6.0,7.2,8.4].forEach((t,k)=>{for(let j=0;j<5;j++)n(t+j*.16,1,gKA,[[7,6,4,2,0][j]],.05-k*.005,0,{pan:-.1+j*.06});});
  [6.5,7.7,8.9,10.3,11.6].forEach((t,k)=>n(t,1.6,gG,[[11,9,14,11,9][k]],.025,-1,{pan:[-.4,.3,-.2,.4,-.3][k]}));
  fx('bombolles',9.8,.025,.2);for(let j=0;j<4;j++)n(9.8+j*.3,1.4,gM,[[4,2,0,-1][j]],.05,0);},
 // 14 · the spinner dolphins: the pod comes in, one leaping low; one bursts out spinning: the picture slows and a harp turns slowly
 // round it; it falls back in a splash; the pod goes on
 (n,fx)=>{fx('dofi',2.4,.05,-.4,3.2);fx('salt',3.3,.05,-.3);fx('capbussa',3.9,.04,-.2);
  fx('esquitx',5.15,.10,0);fx('salt',5.2,.07,0);n(5.2,1.6,gTI,[0],.07,-1);
  for(let j=0;j<8;j++)n(5.8+j*.5,1.8,gH,[[0,4,7,11,14,11,7,4][j]],.06,0,{pan:Math.sin(j*.785)*.3});n(6.0,2,gG,[7],.03,0);n(8.0,2,gG,[9],.03,0);
  fx('capbussada',9.6,.10,0);fx('esquitx',9.65,.06,.1);fx('bombolles',9.9,.05,0);n(9.7,2,gM,[4,7],.07,0,{strum:.08});fx('dofi',10.8,.045,.3,2.6);fx('salt',11.4,.035,.4);},
 // 15 · the whale shark: its open mouth comes in out of the blue (the plankton streams in: a bell glitters); the starry body glides
 // past (the vibraphone, one star at a time), the fin cuts the surface; the mouth closes; it tips down and glides away
 (n,fx)=>{fx('bombolles',2.4,.04,.4);for(let j=0;j<8;j++)n(2.6+j*.32,1.2,gG,[[11,9,11,9,7,9,7,4][j]],.03,-1,{pan:.4-j*.05});fx('peixos',3.4,.04,.3);
  [5.2,6.4,7.6,8.8].forEach((t,k)=>n(t,1.8,gV,[[4,7,9,11][k]],.05,0,{pan:.2-k*.1}));[5.5,6.8,8.1].forEach(t=>fx('bombolles',t,.03,0));fx('esquitx',7.2,.03,.1);fx('anelles',7.4,.03,.1);
  n(10.0,1.6,gCP,[0],.10,-1);n(10.3,1.4,gKA,[4],.07,0);n(10.6,1.4,gKA,[2],.06,0);fx('peixos',10.5,.03,-.1);
  [11.6,12.9,14.2].forEach((t,k)=>fx('aleta',t,.045-k*.008,-.1-k*.1));fx('bombolles',12.4,.03,-.2);},
 // 16 · the reef mantas: one hovers at the cleaning station (slow wing beats; the little wrasse pick at it: a kalimba plinks); the
 // second turns a slow backward somersault (the vibraphone goes up and over and back down); the first passes below us
 (n,fx)=>{[2.4,3.4,4.4].forEach(t=>fx('aleta',t,.03,.1,1));[3.0,3.25,3.6,3.85,4.2].forEach((t,k)=>n(t,.6,gKA,[[9,11,9,12,11][k]],.03,1,{pan:.1}));fx('peixos',3.3,.03,.15);
  for(let j=0;j<9;j++)n(5.2+j*.5,1.8,gV,[[0,2,4,7,9,7,4,2,0][j]],.05,0,{pan:-.1+.3*Math.sin(j*.7)});fx('aleta',6.5,.03,-.1);fx('aleta',8.2,.03,-.1);
  fx('peixos',6.0,.025,.2);fx('aleta',9.8,.06,0);fx('bombolles',10.3,.035,0);n(10.0,1.6,gH,[0,4,7],.07,0,{strum:.1});fx('aleta',11.6,.03,-.4);},
 // 17 · the dugong: it grazes along the meadow (the sand puffs at each bob of its snout, it chews; a kalimba note with each); it rises
 // (a harp rises), breathes at the surface (rings) and glides away with a beat of its tail
 (n,fx)=>{[2.6,3.9,5.2,6.5,7.8].forEach((t,k)=>{const p=.4-k*.1;fx('sorra',t,.04,p,1.4);fx('mastega',t+.2,.035,p,1);n(t,1,gKA,[[4,2,4,2,0][k]],.05,0,{pan:p});});fx('peixos',4.6,.03,.3);
  for(let j=0;j<5;j++)n(8.5+j*.42,1.4,gH,[[0,2,4,7,9][j]],.05+j*.006,0);fx('respiraDugong',10.75,.09,-.15,1.9);fx('anelles',10.85,.05,-.15);n(10.8,1.6,gG,[7],.04,0);
  fx('aleta',11.5,.05,-.3);fx('bombolles',11.9,.03,-.35);},
 // 18 · the southern right whale and her calf: she glides in; the calf rolls right round beside her (the vibraphone turns with it) and
 // touches the surface; she tips down, her tail rises through the surface, the water pours off it, and slips back under
 (n,fx)=>{fx('franca',3.0,.10,.3);n(3.2,2,gTI,[0],.05,-1);
  for(let j=0;j<9;j++)n(5.5+j*.5,1.6,gV,[[0,2,4,7,9,7,4,2,0][j]],.045,0,{pan:.2*Math.sin(j*.8)});fx('respira',7.6,.05,0,1);fx('anelles',7.7,.04,0);n(7.6,1.6,gG,[9],.035,0);
  fx('franca',9.0,.06,.1);for(let j=0;j<5;j++)n(9.7+j*.3,1.4,gH,[[7,4,2,0,-3][j]],.06,0);fx('onada',10.4,.05,-.1);fx('esquitx',10.6,.05,-.1);fx('gotes',10.9,.05,-.1,2.2);
  fx('bombolles',11.1,.05,-.1);fx('capbussa',12.3,.07,-.1);fx('bombolles',12.5,.05,-.15);n(12.4,1.6,gH,[0,4,7],.06,0,{strum:.1});},
 // 19 · the orcas: the family comes up out of the deep calling; one after another they arch over at the surface and breathe (the
 // vibraphone, one note each; the big male last and loudest); they glide away, the male close past us
 (n,fx)=>{fx('orca',2.8,.08,-.3,3.6);fx('bombolles',4.8,.03,-.2);
  [[6.2,.06,-.2],[6.8,.065,.15],[7.3,.07,-.15],[7.5,.045,-.2],[7.9,.09,.1]].forEach(([t,v,p],k)=>{fx(k===4?'bufada':'respira',t-.1,v,p,k===4?2.6:1);fx('anelles',t+.1,.03,p);
   n(t,1.6,gV,[[0,2,4,7,4][k]],.05,0,{pan:p});});fx('esquitx',7.95,.04,.1);fx('capbussa',8.6,.05,.1);n(8.8,2.2,gH,[0,4,7,11],.08,0,{strum:.1});
  fx('aleta',10.6,.06,.3);fx('bombolles',11.2,.04,.4);fx('orca',11.6,.05,.3,2.4);},
 // 20 · the blue whale: its head and eye come in close (soft timpani); the krill cloud glitters; it speeds up, opens its mouth and its
 // throat fills (the water rushes in, a harp climbs); it closes on the krill; the pouch empties slowly as it glides away
 (n,fx)=>{fx('blava',3.0,.12,.2,6);n(2.6,2.4,gTI,[0],.07,-1);n(3.0,2,gH,[0,4],.05,-1);
  for(let j=0;j<8;j++)n(5.2+j*.3,1.2,gG,[[9,11,9,7,9,11,14,11][j]],.025,-1,{pan:-.4+j*.06});
  fx('aleta',7.6,.07,.1);n(7.6,1.4,gTI,[0],.07,-1);n(8.0,1.4,gTI,[4],.06,-1);
  fx('onada',8.5,.08,0);fx('bombolles',8.7,.06,0);for(let j=0;j<8;j++)n(8.5+j*.25,1.8,gH,[[0,2,4,6,7,9,11,14][j]],.06+j*.006,-1);
  fx('glop',10.6,.12,0);n(10.5,2,gCP,[0],.12,-1);n(10.5,2,gTI,[0],.09,-1);
  [11.8,12.8,13.8,14.8].forEach((t,k)=>{fx('bombolles',t,.035-k*.005,-.1-k*.1);n(t+.1,1.6,gV,[[7,4,2,0][k]],.04,0,{pan:-.1-k*.1});});fx('aleta',13.2,.05,-.3);}]);
export function ggScore(i,duration=GG_STIM){i=((i%GG_N)+GG_N)%GG_N;const S=ggStim(i,duration),D=ggDuration(i,duration),P=GG_PIECES[i],sc=GG_SCALES[P.mode],E=escScore(D),T0=GG_TRAVEL,L=GG_LOUD*GG_TRIM[i];
 const deg=(d,o=0)=>P.root+12*(o+Math.floor(d/7))+sc[((d%7)+7)%7];
 const n=(t,len,inst,ds,vel,o=0,x={})=>E.add(t,len,inst,[...new Set([].concat(ds).map(d=>ggFit(inst,deg(d,o))))],vel*L,x);
 const fx=(name,t,vel,pan=0,len=4)=>{const f=GG_FX[name];if(f)E.add(t,len,f[0],[60],vel*L,{variant:f[1],pan});};
 // the travelling: bubbles stream past; the next ocean's instrument runs through the water (longer into a new ocean, with a soft
 // timpani); then the place: a harp rises and two bells ring
 const fresh=i===0||GG_OCEAN[i]!==GG_OCEAN[i-1],run=GG_RUN[GG_OCEAN[i]],steps=fresh?14:9;
 fx('bombolles',0,.06,-.2,2);if(fresh){fx('bombolles',.7,.05,.25,2);n(1.2,1.6,gTI,[0],.07,-1);}
 for(let j=0;j<steps;j++)n(.08+j*(1.7/steps),.9,run,[14-j],.12-j*.003,run===gG?-1:0,{pan:-.4+.8*j/steps});
 for(let j=0;j<6;j++)n(1.75+j*.17,1.6,gH,[[0,4,7,9,11,14][j]],.14,-1);n(2.9,1.6,gG,[7],.06,0);n(3.3,1.6,gG,[11],.05,0);
 if(P.amb)E.add(1.4,S*.92,'natureRec',[60],.07*L,{variant:P.amb});
 // the music: the bass and the plucked figure bar by bar, the bell, the percussion, the melody and its answer; the cadence
 const beat=60/P.bpm,B=4*beat,t1=T0+1.6,cad=T0+S-B*.75,bars=Math.ceil((cad-t1)/B);
 for(let k=0;k<bars;k++){const t=t1+k*B,r=P.chords[k%P.chords.length];if(t>=cad-.4)break;
  n(t,B*.5,P.bass,[r],.24,-2);n(t+2*beat,B*.4,P.bass,[r+4],.16,-2);
  P.figure.forEach((f,j)=>{const u=t+j*B/P.figure.length;if((j+k)%7===6||u>=cad)return;n(u,beat*1.4,P.arp,[r+f],j%4===0?.13:.10,P.arpOct);});
  if(k%2===0)n(t+.02,1.6,P.spark,[r+7],.06,1);
  [...P.perc].forEach((c,j)=>{const u=t+j*B/8;if(c==='.'||u>=cad)return;
   if(c==='U')n(u,1.4,'uduRec',[r],.15,-2);else if(c==='u')n(u,.9,'uduRec',[r+4],.09,-1);else if(c==='S')n(u,1.3,gSL,[r],.14,-1);else if(c==='s')n(u,1.3,gSL,[r+4],.09,-1);
   else if(c==='K')n(u,1.6,gTI,[r],.09,-2);else if(c==='t')E.add(u,1,'triangleRec',[60],.045*L,{variant:'hit'});
   else if(c==='F')E.add(u,1.2,'pouPerc',[60],.09*L,{variant:'marc'});});}
 const phrase=(t0,inst,shift,vel,oct)=>{let u=t0;for(const [d,bt] of P.motif){if(u>=cad-.2)break;n(u,Math.min(bt*beat*1.15,cad-u),inst,[d+shift],vel,oct);u+=bt*beat;}};
 phrase(t1+B*.5,P.lead,0,.20,P.leadOct);if(t1+B*2.5<cad-2)phrase(t1+B*2.5,P.answer,-2,.15,P.answer===gG?0:P.leadOct);
 GG_CUES[i]((t,...a)=>n(t+GG_LAG,...a),(v,t,...a)=>fx(v,t+GG_LAG,...a));
 // the end: a plucked chord on the harp and the ocean's instrument, a bell, the bass, all dying away
 n(cad,2.6,gH,[0,4,7,9,14],.18,0,{strum:.07});n(cad+.05,1.6,P.lead===gH?gM:P.lead,[0,4,7],.13,0,{strum:.05});n(cad+.35,2.2,gG,[7],.08,1);n(cad,1.2,P.bass,[0],.22,-2);
 // after the twentieth, the climb to the surface: each ocean sounds once on the way up, the sea at sunset; the blue whale's head breaks
 // the surface and it blows (a harp chord and the bells); it dives and the sea rests
 if(i===GG_N-1){const c0=T0+S;fx('bombolles',c0,.06,0,2);fx('bombolles',c0+1.8,.05,.1,2);
  GG_RUN.forEach((inst,k)=>{for(let j=0;j<3;j++)n(c0+.2+k*.6+j*.15,1,inst,[k+j*2],.10,inst===gG?-1:0);});
  E.add(c0+3.6,6.4,'natureRec',[60],.06*L,{variant:'waves'});fx('onada',c0+4.3,.07,0);fx('esquitx',c0+4.35,.05,0);fx('blava',c0+3.8,.08,0);
  fx('bufada',c0+4.6,.15,0);n(c0+4.7,2.6,gH,[0,4,7,9,14],.15,0,{strum:.08});n(c0+4.85,2,gG,[7,11],.07,0,{strum:.1});
  fx('capbussa',c0+7.8,.06,0);n(c0+8.3,2,gH,[0,4,7],.08,-1,{strum:.12});}
 return E.done();}

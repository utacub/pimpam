// El far (CE28), 0.20: a night sea printed as a Japanese woodblock. The beam of the lighthouse sweeps the sea back and forth, slowly,
// and makes a pool of light on the water. Out at sea there are one, two or three fishing boats in the dark. A press while the light is on
// a boat lights its lanterns, and the beam guides it back to port while a harp and a flute play; at the jetty a small band plays it in.
// A press at another moment only makes the water shimmer where the light is, with a soft note: nothing is lost and the light goes on.
// Three boats home make a night: at the third the band plays longer, and then the night changes (the sky, the moon, the mist, the
// coast), with new boats at sea. The adult sets how fast the light moves, how long a boat stays reachable, and how many boats there are
// (settings farSpeed, farWindow and farBoats); nothing gets harder by itself.
// The hit test is in time, not in distance: a boat can be reached during farWindow seconds around the moment the middle of the pool is
// on it, the same at every place of the sea and at every speed. The boat glows softly during those seconds, so that what the pupil sees
// and what the press does always agree.
// Music (original): the way home is a barcarolle in 6/8, a harp rocking under a flute; at the jetty a town band (tuba, horns, trombone
// and a soft trumpet) plays two or four bars of a waltz. Every note is plucked, struck or short, and every piece ends on a harp chord.
import {escFit,escInto,escNote,escScore} from './escenari.js';

export const FAR_SPEEDS=Object.freeze({slow:16,medium:11,fast:7});
export const FAR_WINDOWS=Object.freeze({wide:3,medium:1.8,narrow:1});
// Seconds: the way home, a step (boat home and band), the final of a night (longer band and the change of night, which takes the last
// FAR_NIGHT seconds), the shimmer of a press that does not reach a boat, and the arrival of a new boat out of the mist.
export const FAR_SAIL=6.5,FAR_STEP=11,FAR_FINAL=16,FAR_NIGHT=3.2,FAR_MISS=1.6,FAR_ARRIVE=3;
// The level of the sea (the waves recording, as the wind of El vent del bosc: the gain is 2.24 × FAR_SEA).
export const FAR_SEA=.26;
// Boats home in a night (berths at the jetty).
export const FAR_BERTHS=3;
export const FAR_NIGHTS=20;
export const farPeriod=s=>FAR_SPEEDS[s?.farSpeed]||FAR_SPEEDS.slow;
export const farWindow=s=>FAR_WINDOWS[s?.farWindow]||FAR_WINDOWS.wide;
export const farCount=s=>Math.max(1,Math.min(3,Math.round(s?.farBoats||1)));
// Where the pool is along its track (0 out at sea by the horizon, 1 near the port) at a phase of the sweep (one cycle there and back).
export const farPool=phase=>.5-.5*Math.cos(2*Math.PI*phase);
// Seconds between now and the nearest moment the middle of the pool is on track position t (the sweep crosses it twice a cycle).
export function farGap(phase,t,P){const a=Math.acos(Math.max(-1,Math.min(1,1-2*t)))/(2*Math.PI);let best=1;
 for(const c of [a,1-a]){let d=(((phase-c)%1)+1)%1;if(d>.5)d=1-d;best=Math.min(best,d);}return best*P;}
// How much a boat glows (0 to 1): from the edge of its window to the middle.
export const farNear=(phase,t,P,W)=>Math.max(0,1-farGap(phase,t,P)/(W/2));
const farHash=(a,b,c)=>{let h=(a*374761393+b*668265263+c*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
// The lanes of the boats along the track, for one, two or three boats; each new boat takes a place of its own in its lane.
const FAR_LANES=Object.freeze({1:[[.34,.74]],2:[[.26,.45],[.6,.82]],3:[[.22,.36],[.46,.6],[.7,.86]]});
export const FAR_LOOKS=8;
export function farBoat(night,slot,n,arrival,born){const [lo,hi]=FAR_LANES[n][slot]||FAR_LANES[1][0];
 return {slot,t:lo+(hi-lo)*farHash(night+1,slot+1,arrival+7),look:(arrival*3+night)%FAR_LOOKS,flip:farHash(night,slot,arrival)<.5?1:-1,born};}
// The state of the sea, kept in the game: the sweep (farBeam, in cycles), a clock of its own (farNow, seconds), the boats at sea, the
// boats home tonight, the boat on its way home (farRet) and the last shimmer (farMiss). The night is game.variant.
export function farEnsure(game,s){const n=farCount(s);
 if(game.farBeam===undefined){game.farBeam=.5;game.farNow=0;game.farHome=0;game.farDocked=[];game.farArrivals=0;game.farSea=[];game.farRet=null;game.farMiss=null;if(game.variant===undefined)game.variant=0;}
 if(game.farSea.length!==n){const old=game.farSea;game.farSea=Array.from({length:n},(_,j)=>{const keep=old.find(b=>b.slot===j&&n===old.length);return keep||farBoat(game.variant,j,n,game.farArrivals++,game.farNow);});
  if(game.farRet&&game.farRet.slot>=n)game.farRet={...game.farRet,slot:-1};}
 return game;}
// A frame: the clock runs, and the light sweeps unless it is guiding a boat home.
export function farTick(game,s,dt){farEnsure(game,s);game.farNow+=dt;if(!game.farRet)game.farBeam+=dt/farPeriod(s);}
// A press: the nearest boat whose window is open goes home; otherwise the water shimmers. Returns 'home', 'final' or 'miss'.
export function farPress(game,s){farEnsure(game,s);const P=farPeriod(s),W=farWindow(s);let best=-1,gap=Infinity;
 game.farSea.forEach((b,j)=>{if(game.farNow-b.born<FAR_ARRIVE*.6)return;const g=farGap(game.farBeam,b.t,P);if(g<=W/2&&g<gap){gap=g;best=j;}});
 if(best<0){game.farMiss={p:farPool(game.farBeam),at:game.farNow};return 'miss';}
 const b=game.farSea[best],final=game.farHome+1>=FAR_BERTHS;
 game.farRet={slot:best,boat:{...b},berth:game.farHome,final,at:game.farNow,tune:((game.variant||0)*FAR_BERTHS+game.farHome)%20};game.farMiss=null;return final?'final':'home';}
// The end of a press: a boat that was going home is at its berth, a new boat comes out of the mist in its place, and the light starts
// again from the port. After the third boat the night has changed.
export function farDock(game,s){farEnsure(game,s);const r=game.farRet;if(!r)return false;const n=farCount(s);
 game.farDocked.push(r.boat.look);game.farHome++;if(r.slot>=0&&r.slot<n)game.farSea[r.slot]=farBoat(game.variant,r.slot,n,game.farArrivals++,game.farNow);
 if(r.final){game.farFrom=game.variant;game.variant=((game.variant||0)+1)%FAR_NIGHTS;game.farHome=0;game.farDocked=[];game.completed=(game.completed||0)+1;}
 game.farBeam=Math.floor(game.farBeam)+.5;game.farRet=null;return true;}

// ── The music ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Twenty tunes for the way home: a contour of eight degrees and a key; the flute plays them in a dotted 6/8.
const FAR_CONTOURS=Object.freeze([[4,5,4,2,0,2,4,7],[0,2,4,5,7,5,4,4],[7,6,4,2,4,5,4,0],[2,4,5,7,9,7,5,4],[4,2,0,-1,0,2,4,2]]);
const FAR_KEYS=Object.freeze([62,57,60,65,64]);
const FAR_MODES=Object.freeze(['major','major','dorian','major','mixolydian']);
export const farTune=v=>{const i=((v%20)+20)%20,c=i%5;return {contour:FAR_CONTOURS[c],key:FAR_KEYS[(c+2*Math.floor(i/5))%5],mode:FAR_MODES[(c+Math.floor(i/5))%5]};};
// Loudness against the other activities (EBU R 128 on the review video; velocity is quadratic).
export const FAR_LOUD=1.55;
// kind: 'home' or 'final' (tune: which tune), or 'miss' (p: where the pool was, 0 far to 1 near).
export function farScore(kind,tune,p,duration){const D=Math.max(.5,duration||(kind==='miss'?FAR_MISS:kind==='final'?FAR_FINAL:FAR_STEP)),sc=escScore(D);
 const put=(t,len,inst,midi,vel,x={})=>sc.add(t,len,inst,midi,Math.min(1,vel*FAR_LOUD),x);
 if(kind==='miss'){
  // The shimmer: a high glockenspiel and a harp an octave down, higher when the light is far out.
  const deg=[14,12,9,7,4,2,0][Math.max(0,Math.min(6,Math.round((p??.5)*6)))],m=escNote(67,'major',0)+[0,2,4,7,9][deg%5]+12*Math.floor(deg/5);
  put(.02,1.4,'glockRec',[escInto(m+12,'glockRec')],.2,{pan:.15});put(.05,1.3,'harpRec',[escInto(m,'harpRec')],.17,{pan:-.1});
  return sc.done();}
 const T=farTune(tune||0),deg=d=>escNote(T.key,T.mode,d),fit=(ds,inst,c)=>escFit(ds.map(deg),inst,c),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const shH=fit([0,7],'harpRec',62),shF=fit(T.contour,'fluteRec',79),shG=fit([0,7],'glockRec'),shC=fit([0,4],'celliPizzRec',45);
 // The lanterns light: two notes of the glockenspiel and the triangle.
 put(.08,1.6,'glockRec',[into(4,'glockRec',shG)],.3,{pan:.2});put(.3,1.8,'glockRec',[into(7,'glockRec',shG)],.26,{pan:.2});put(.1,1.4,'triangleRec',[],.12,{variant:'hit',pan:.3});
 // The barcarolle: four bars of 6/8, the harp rocking on the eighths, a plucked cello on the first beat, the flute on top.
 const e=.25,bar=6*e,t0=.55,chords=[0,3,4,0],shape=[0,4,7,9,7,4];
 for(let b=0;b<4;b++){const t=t0+b*bar,ch=chords[b];put(t,bar*.9,'celliPizzRec',[into(ch,'celliPizzRec',shC)],.32,{pan:.12});
  shape.forEach((x,k)=>put(t+k*e,e*2.2,'harpRec',[into(ch+(x===0?0:x===4?2:x===7?4:7),'harpRec',shH)],.2+(k===0?.06:0),{pan:-.2}));}
 const rhythm=[[0,3],[3,1],[4,2],[6,3],[9,1],[10,2],[12,6],[18,5]];
 T.contour.forEach((d,i)=>{const [at,len]=rhythm[i];put(t0+at*e,len*e*.9,'fluteRec',[into(d,'fluteRec',shF)],.3,{pan:-.32});});
 // At the jetty (FAR_SAIL): the town band, a waltz of short notes; two bars for a boat, four at the end of the night.
 const beat=.45,band=FAR_SAIL+.1,bars=kind==='final'?4:2,shT=fit([0,4],'tubaRec',38),shK=fit([0,2,4],'hornRec',55),shB=fit([0,2,4],'tromboneRec',50),shP=fit(T.contour.slice(0,4),'trumpetRec',70);
 const waltz=[0,4,0,4,3,4,0,0];
 for(let b=0;b<bars;b++){const t=band+b*3*beat,ch=waltz[b%waltz.length];put(t,beat*.7,'tubaRec',[into(ch,'tubaRec',shT)],.36,{pan:.1});
  for(const q of [1,2]){put(t+q*beat,beat*.45,'hornRec',[into(ch+2,'hornRec',shK)],.2,{pan:-.15});put(t+q*beat,beat*.45,'tromboneRec',[into(ch+4,'tromboneRec',shB)],.18,{pan:.2});}}
 const line=kind==='final'?[...T.contour.slice(0,4),...T.contour.slice(4,7),0]:T.contour.slice(0,4);
 line.forEach((d,i)=>{const t=band+i*1.5*beat;put(t,beat*1.1,'trumpetRec',[into(d,'trumpetRec',shP)],.26,{pan:.05});put(t,beat*1.4,'glockRec',[into(d,'glockRec',shG)],.14,{pan:-.1});});
 const close=band+bars*3*beat;
 put(close,1.8,'harpRec',[0,2,4,7].map(x=>into(x,'harpRec',shH)),.36,{strum:.05,pan:-.2});put(close,1.4,'celliPizzRec',[into(0,'celliPizzRec',shC)],.36,{pan:.12});
 put(close,1.6,'glockRec',[into(7,'glockRec',shG)],.22,{pan:.2});
 // The night changes: a few harp notes going up, very soft, while the new sky comes in.
 if(kind==='final'){const tn=D-FAR_NIGHT+.2;[0,2,4,7,9,11].forEach((x,i)=>put(tn+i*.32,1.6,'harpRec',[into(x+7,'harpRec',shH)],.16+i*.01,{pan:-.2+i*.08}));put(tn+1.9,1.6,'glockRec',[into(7,'glockRec',shG)],.14,{pan:.2});}
 return sc.done();}

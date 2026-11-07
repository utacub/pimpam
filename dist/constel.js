// El cel de les constel·lacions (CE10), 0.14: a night sky over a landscape. Each press lights a big star, joins it to the stars before
// with a thread of light and makes something happen in the landscape (windows light up, the lighthouse turns, the moon comes out,
// fireflies rise, lanterns float up...). At the last press the stars draw a figure (a kite, a sailing boat, a bicycle, a balloon or an
// umbrella) that fills with colour, comes alive, crosses the sky and breaks up into shooting stars. Each round changes the figure,
// the landscape (a coast, mountains, fields, a village), the season and the events.
// Music: one note for each star (glockenspiel and harp), which together make the round's tune; after each new star a music box plays
// the tune so far, the event has its own sound, a recorded nature sound of the season plays underneath, and the final plays the
// whole tune with harp, pizzicato strings and flute. Every piece ends on plucked and struck notes.
import {Krand} from './kaleido-base.js';
import {escGroups,escNote,escFit,escInto,escScore} from './escenari.js';

export const SK_STEP_MIN=7.5,SK_FINAL_MIN=13;
export const SK_FIGURES=Object.freeze(['estel','veler','bicicleta','globus','paraigua']);
export const SK_LANDS=Object.freeze(['costa','muntanya','camp','poble']);
export const SK_SEASONS=Object.freeze(['primavera','estiu','tardor','hivern']);
// The events of the landscape, with where and when they can happen (any landscape or season when not said).
export const SK_EVENTS=Object.freeze({
 finestres:{},far:{lands:[0]},lluna:{},estelFugac:{},cuques:{seasons:[0,1]},neu:{seasons:[3]},fulles:{seasons:[2]},fanalets:{},
 aurora:{seasons:[2,3]},barques:{lands:[0,1]},viaLactia:{seasons:[0,1]},cometa:{},tren:{lands:[1,2]},boira:{seasons:[0,2],lands:[1,2]}
});
// The tune of each figure: one scale degree for each of its seven stars, mostly rising.
const SK_TUNES=Object.freeze([[0,2,4,2,5,7,9],[4,2,0,2,4,7,9],[0,4,2,5,4,7,11],[0,2,4,7,9,11,14],[7,4,5,2,4,7,9]]);
const SK_KEYS=Object.freeze([[67,'major'],[60,'major'],[62,'dorian'],[65,'major']]);
const SK_NATURE=Object.freeze(['frogs','crickets','wind','wind']);
// A round: its figure, landscape and season, and the six events of the round, in the order the stars bring them.
export function skRound(variant){const v=((Math.round(variant||0)%20)+20)%20,figure=v%5,land=v%4,season=Math.floor(v/5)%4;
 const pool=Object.entries(SK_EVENTS).filter(([,e])=>(!e.lands||e.lands.includes(land))&&(!e.seasons||e.seasons.includes(season))).map(([id])=>id);
 // A shuffle of its own for each round; the events that only some places and seasons have come first, so each round shows them.
 const own=pool.filter(id=>SK_EVENTS[id].lands||SK_EVENTS[id].seasons),rest=pool.filter(id=>!own.includes(id)),mix=a=>a.map((id,i)=>[Krand(i*13+v*7,29),id]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
 const events=[...mix(own).slice(0,3),...mix(rest)].slice(0,6);for(let i=events.length-1;i>0;i--){const j=Math.floor(Krand(i+v*11,31)*(i+1));[events[i],events[j]]=[events[j],events[i]];}
 return {v,figure,land,season,events,tune:SK_TUNES[figure],key:SK_KEYS[season][0]+[0,2,-1,1,-2][figure],mode:SK_KEYS[season][1],nature:SK_NATURE[season]};}

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
// The plan of one press: which stars light up and when, which events start and when, the notes of the music box (each one tied to its
// star, so the star sparkles with its note) and the times of the final (fill, alive, dissolve, close).
const SK_CACHE=new Map();
export const SK_STAGGER=.9;
// The instruments of the sky (harp, glockenspiel, flute, strings, marimba, triangle, woodblock) are lighter than a whole orchestra:
// their velocities are raised a little (+4 dB, as velocity is quadratic) so that the sky sounds about as loud as Dia rere dia and the
// orchestra. The nature sound is left as it is.
const SK_LOUD=1.26;
export function skPlan(variant,count,steps,duration){const D=Math.max(1,duration||SK_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(SK_CACHE.has(id))return SK_CACHE.get(id);
 const round=skRound(variant),groups=escGroups(steps),press=Math.max(1,Math.min(count||1,groups.length)),final=press===groups.length,moments=groups[press-1],deg=d=>escNote(round.key,round.mode,d);
 const sc=escScore(D),pulses=[],put=(time,length,inst,midi,vel,x={})=>sc.add(time,length,inst,midi,inst==='natureRec'?vel:vel*SK_LOUD,x);
 const fit=(inst,ds)=>{const sh=escFit(ds.map(deg),inst);return d=>escInto(deg(d)+sh,inst);},glock=fit('glockRec',round.tune),harp=fit('harpRec',round.tune.map(d=>d-7)),pizz=d=>escInto(deg(d)-24,'celliPizzRec');
 // The new stars: a glockenspiel note doubled by the harp, with a touch of triangle.
 const stars=moments.map((k,j)=>({k,at:.05+j*SK_STAGGER}));for(const s of stars){const d=round.tune[s.k];put(s.at,2,'glockRec',[glock(d)],.48);put(s.at,1.8,'harpRec',[harp(d)],.38);put(s.at,1.4,'triangleRec',[],.1,{variant:'hit'});pulses.push({time:s.at,star:s.k,vel:1});}
 const nature=(len,vel=.34)=>{for(const [side,start] of [[-1,0],[1,5.3]])put(0,len,'natureRec',[60],vel,{pan:side*.5,variant:round.nature,start:start+round.v%4*1.3});};
 const events=[];let close;
 if(!final){
  // The music box: the tune so far on the harp, each note answering its star, over a plucked bass; the new star's note on the glockenspiel.
  // It comes after the sound of the event, so that the two do not cover each other.
  const last=moments[moments.length-1],r0=stars[stars.length-1].at+2,dt=Math.max(.18,Math.min(.3,(D-2.4-r0)/(last+1))),box=fit('harpRec',round.tune.map(d=>d+3));
  for(let j=0;j<=last;j++){const t=r0+j*dt,d=round.tune[j];put(t,1.3,'harpRec',[box(d)],j===last?.44:.3);pulses.push({time:t,star:j,vel:j===last?.9:.5});if(j%2===0)put(t,1.2,'celliPizzRec',[pizz(j%4?4:0)],.3);}
  put(r0+last*dt,1.6,'glockRec',[glock(round.tune[last])],.3);
  // The events, one after each new star, each with its own sound.
  moments.forEach((k,j)=>{const ev=round.events[k],t0=stars[j].at+.55;events.push({k,id:ev,at:t0});for(const [t,l,inst,midi,vel,x] of skCue(ev,deg))put(t0+t,l,inst,midi,vel,x);});
  close=Math.min(D-1.9,Math.max(r0+(last+1)*dt+.4,events.reduce((m,e)=>Math.max(m,e.at+3.2),0)));
  const ch=fit('harpRec',[0,4,7,9]);put(close,2.2,'harpRec',[0,2,4,7,9].map(c=>ch(c)),.4,{strum:.05});put(close,1.8,'glockRec',[glock(round.tune[last])],.24);put(close,1.4,'celliPizzRec',[pizz(0)],.36);
  nature(D-.4);
 }else{
  // The final: the figure fills with colour (a rising harp), comes alive and crosses the sky to the whole tune (flute, harp and
  // pizzicato), breaks up into shooting stars (harp glissandos and glockenspiel), and one last chord rings out.
  const fillAt=1.1,aliveAt=3,beat=Math.min(.46,Math.max(.36,(D-7.6)/16)),dur=[1,1,1,1,1,1,2],phrase=8*beat;
  const ar=fit('harpRec',[0,14]);for(let i=0;i<12;i++)put(fillAt+i*.15,1.4,'harpRec',[ar([0,2,4,7,9,11,14,11,9,7,9,14][i])],.26+.012*i);
  put(fillAt,.8,'violinsPizzRec',[0,2,4].map(c=>escInto(deg(c)+escFit([deg(0),deg(4)],'violinsPizzRec'),'violinsPizzRec')),.3,{strum:.05});
  const fl=fit('fluteRec',round.tune),prog=[0,3,4,0];
  for(let r=0;r<2;r++){let t=aliveAt+r*phrase;round.tune.forEach((d,j)=>{put(t,dur[j]*beat*.92,'fluteRec',[fl(d)],r?.42:.38);if(r)put(t,1.2,'glockRec',[glock(d)],.2);pulses.push({time:t,star:j,vel:.8});t+=dur[j]*beat;});
   for(let b=0;b<8;b++){const t=aliveAt+r*phrase+b*beat,root=prog[Math.floor(b/2)];put(t,1.2,'harpRec',[ar(root+[0,4,2,7][b%4])],.22);if(b%2===0)put(t,1.2,'celliPizzRec',[pizz(root)],.34);else put(t,.6,'violinsPizzRec',[2,4].map(c=>escInto(deg(root+c)+escFit([deg(2),deg(4)],'violinsPizzRec'),'violinsPizzRec')),.2,{strum:.02});}}
  const dissolveAt=aliveAt+2*phrase+.2;for(let k=0;k<3;k++)for(let i=0;i<9;i++)put(dissolveAt+k*.42+i*.05,1.4,'harpRec',[ar(14-i*1.5|0)],.24);
  for(let i=0;i<6;i++)put(dissolveAt+.2+i*.22,1.4,'glockRec',[glock([14,11,9,7,4,2][i])],.2);
  close=Math.min(D-2.2,dissolveAt+1.6);const ch=fit('harpRec',[0,4,7,9]);put(close,2.6,'harpRec',[0,2,4,7,9,11].map(c=>ch(c)),.46,{strum:.05});put(close,2.2,'glockRec',[glock(7)],.3);put(close,1.8,'celliPizzRec',[pizz(0)],.42);put(close,2,'triangleRec',[],.16,{variant:'hit'});
  nature(D-.4,.3);
  const plan={D,round,final,press,moments,stars,events,pulses,fillAt,aliveAt,dissolveAt,close,score:sc.done()};SK_CACHE.set(id,plan);if(SK_CACHE.size>48)SK_CACHE.delete(SK_CACHE.keys().next().value);return plan;}
 const plan={D,round,final,press,moments,stars,events,pulses,close,score:sc.done()};SK_CACHE.set(id,plan);if(SK_CACHE.size>48)SK_CACHE.delete(SK_CACHE.keys().next().value);return plan;}
export const skScore=(variant,count,steps,duration)=>skPlan(variant,count,steps,duration).score;
// The sound of each event, in seconds from its start: [time, length, instrument, midi, velocity, extra].
function skCue(id,deg){const out=[],a=(t,l,inst,midi,vel,x={})=>out.push([t,l,inst,midi,vel,x]),run=(t0,dt,inst,ds,vel,centre)=>{const sh=escFit(ds.map(deg),inst,centre);ds.forEach((d,i)=>a(t0+i*dt,1.2,inst,[escInto(deg(d)+sh,inst)],vel));};
 switch(id){
  case 'finestres':run(.2,.26,'marimbaRec',[0,2,4,7,4,9],.32);break;
  case 'far':run(.3,1.1,'fluteRec',[4,2,4],.28);run(.3,1.1,'harpRec',[0,-3,0],.26,50);break;
  case 'lluna':run(.4,.8,'violinsRec',[0,4,7],.24);a(.4,1.6,'harpRec',[escInto(deg(0)+escFit([deg(0)],'harpRec',55),'harpRec')],.3);break;
  case 'estelFugac':run(.3,.06,'harpRec',[14,12,11,9,7,5,4,2,0],.3,72);a(.3,1.4,'triangleRec',[],.12,{variant:'hit'});break;
  case 'cuques':for(let i=0;i<9;i++)a(.2+Krand(i,71)*3,1.2,'glockRec',[escInto(deg([7,9,11,14][i%4])+escFit([deg(7),deg(14)],'glockRec'),'glockRec')],.16);break;
  case 'neu':run(.3,.6,'glockRec',[7,4,9,7,11],.18);a(.3,1.4,'triangleRec',[],.1,{variant:'hit'});break;
  case 'fulles':run(.3,.32,'harpRec',[11,9,7,5,4,2],.28,66);a(0,4,'natureRec',[60],.24,{variant:'wind',pan:.3});break;
  case 'fanalets':run(.3,.4,'fluteRec',[0,2,4,5,7],.3);break;
  case 'aurora':run(.3,.75,'violinsRec',[4,5,7,9],.2);run(.3,.75,'glockRec',[11,9],.14);break;
  case 'barques':run(.3,.42,'marimbaRec',[4,2,0,2,4],.28);a(0,4,'natureRec',[60],.26,{variant:'drops',pan:-.2});break;
  case 'viaLactia':run(.3,.1,'harpRec',[0,2,4,7,9,11,14,16,18],.28,64);break;
  case 'cometa':run(.3,.45,'glockRec',[14,11,9,7],.2);run(.3,.45,'harpRec',[7,4,2,0],.24,60);break;
  case 'tren':for(let i=0;i<12;i++)a(.2+i*.25,.2,'woodblockRec',[],i%2?.16:.24);run(.4,.5,'fluteRec',[4,2],.3);break;
  case 'boira':run(.4,.7,'fluteRec',[4,2,0],.24);break;
 }
 return out;}

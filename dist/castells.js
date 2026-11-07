// Fem castells (CE25), 0.15: a human tower in a town square during the festa major. Each press brings a level of the castell: the pinya
// and the baixos, then the segons, terços and quarts, then the pom de dalt (the dosos, the acotxador and the enxaneta). At the last press
// the enxaneta climbs to the top and raises a hand (the aleta); the square celebrates and the castell comes down level by level,
// calmly, without ever falling. Something else happens in the square at each step (bunting, hangings on the balconies, people waving,
// the sun coming out, flags), and each round changes the castell (a tres, a torre or a quatre de set), the square, the time of day,
// the colour of the colla's shirts and the order of the events.
// Music (0.45.8): a real toc de castells, recorded at a diada, a piece for each press (FEM_TOC); until 0.45.7 it was an original
// piece for oboe, snare, harp and other recorded instruments.
import {Krand} from './kaleido-base.js';
import {escScore} from './escenari.js';

export const FEM_STEP_MIN=8,FEM_FINAL_MIN=15;
// People on each level of the trunk (the four lower levels); the pom de dalt is the same in all three.
export const FEM_TYPES=Object.freeze([3,2,4]);
export const FEM_PLACES=Object.freeze(['porxos','campanar','mar','muntanya']);
export const FEM_TIMES=Object.freeze(['migdia','tarda','posta']);
// Shirt colours chosen for their contrast with the sky and the façades; they do not stand for any real colla. By day the colla wears
// one of the first six (blue and teal would fade into the sky); at sunset, when the sky is pink and orange, green, blue or teal.
export const FEM_SHIRTS=Object.freeze(['#e0393f','#f08a24','#8e4fd0','#2f9e52','#e5b322','#e0458f','#2f6fd1','#14a0a6']);
// What happens in the square with the first five moments, in the order of the round; the acotxador brings the hands of the pinya up
// (mans) and the enxaneta the confetti.
export const FEM_EVENTS=Object.freeze(['banderoles','domassos','balcons','sol','banderes']);
const FEM_KEYS=Object.freeze([[62,'mixolydian'],[60,'major'],[64,'mixolydian'],[65,'major']]);
// The twenty rounds: [castell (FEM_TYPES), square (FEM_PLACES), time of day (FEM_TIMES), shirt (FEM_SHIRTS)]. No two rounds share
// castell, square and time; two rounds in a row (the twentieth and the first too) differ in all four, and two rounds apart in the
// square and the shirt.
const FEM_ROUNDS=Object.freeze([[0,0,0,0],[1,1,1,2],[0,2,2,6],[2,0,0,4],[1,3,1,1],[2,1,2,7],[1,0,1,5],[2,2,0,1],[1,1,2,6],[2,3,1,2],[1,0,0,3],[0,2,1,1],[2,1,0,5],[0,3,2,6],[2,2,1,0],[0,1,0,3],[1,3,2,6],[0,0,1,2],[1,2,0,5],[2,3,2,7]]);
// A round: the castell, the square, the time of day, the colla and the order of the events. own: a shirt colour the adult fixed in
// the settings (0.45.6, «Color de la camisa a Fem castells»); without it, each round brings its own.
export function femRound(variant,own){const v=((Math.round(variant||0)%20)+20)%20,[type,place,time,si]=FEM_ROUNDS[v],shirt=/^#[0-9a-f]{6}$/i.test(own||'')?own:FEM_SHIRTS[si];
 const events=FEM_EVENTS.map((e,i)=>[Krand(i*17+v*5,43),e]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
 const [key,mode]=FEM_KEYS[Math.floor(v/3)%4];return {v,type,per:FEM_TYPES[type],place,time,shirt,events,key,mode};}
// The event a moment brings (0 to 6).
export const femEvent=(round,k)=>k<5?round.events[k]:k===5?'mans':'confeti';

// ── Timing of a press ────────────────────────────────────────────────────────────────────────────────────────────────────
// A casteller takes FEM_CLIMB seconds to climb to their place. When a press brings several moments (3 or 5 steps), they start one after
// another (stagger). The final: the enxaneta climbs, raises a hand at FEM_ALETA, and from FEM_DOWN the castell comes down, one level
// every FEM_DOWN_GAP seconds, from the top; then the pinya opens and the colla leaves the square. 0.45.9 (Marc): the enxaneta holds the
// aleta two seconds longer (the castell comes down from 8 s, not 6), and the levels follow one another faster (0.6 s, not 0.9).
export const FEM_CLIMB=2.4,FEM_ALETA=3,FEM_DOWN=8,FEM_DOWN_GAP=.6,FEM_DOWN_LEN=1.3;
// 0.45.8 (Marc): one press for each level of the castell, whatever «Passos de les construccions i històries» says: the first press
// makes the pinya with the baixos, then the segons, the terços, the quarts, the dosos, the aixecador, and the seventh the enxaneta
// with the aleta.
export const FEM_PRESSES=7;
export const femStagger=()=>0;
// Seconds since each part came in (−1 before it): the pinya, and the seven levels (moments 0 to 6, the baixos to the enxaneta); the
// pinya and the baixos come in with the first press. The current press counts t, the previous one the time it had run when it was cut
// short (held) plus t, older ones are long settled.
export function femAges(count,t,held){const n=Math.max(0,Math.min(count||0,FEM_PRESSES)),age=p=>p>n?-1:p===n?t:p===n-1?(held??1e3)+t:1e4;
 return {pinya:age(1),levels:Array.from({length:7},(_,L)=>age(L+1))};}
// When the colla leaves at the end of the final, and how long it takes.
export const femLeave=D=>({at:Math.min(FEM_DOWN+7*FEM_DOWN_GAP+.6,D-2.6),len:2});

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
const FEM_CACHE=new Map();
// 0.45.8: the music of every press is a piece of one real toc de castells, played by the grallers and the timbal of a diada while the
// castell rises: «Primer 5 de 8 descarregat pels Marrecs de Salt» (JordiGran, 2015, Wikimedia Commons, CC BY-SA 4.0; CREDITS.md of
// the samples folder). tools/make_toc.py cuts it: each of the first six pieces ends between two notes; the seventh starts at 3:20 of the
// recording (Marc): the last phrase of the gralles as the enxaneta climbs and makes the aleta (FEM_ALETA), then the applause of the
// square while the castell comes down. Their lengths (s):
export const FEM_TOC=Object.freeze([7.25,6.7,7.35,7.1,7.05,7,14.5]),FEM_TOC_AT=.05;
export function femPlan(variant,count,steps,duration){const D=Math.max(1,duration||FEM_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(FEM_CACHE.has(id))return FEM_CACHE.get(id);
 const round=femRound(variant),press=Math.max(1,Math.min(count||1,FEM_PRESSES)),moments=[press-1],final=press===FEM_PRESSES,top=press-1;
 // 0.45.8 (Marc): a real toc de castells, played on, a piece at each press and paused in between (FEM_TOC).
 const sc=escScore(D),len=Math.min(FEM_TOC[press-1],D-.4),s0=FEM_TOC_AT,beat=0,beats=[],close=s0+len;
 sc.add(s0,len,'tocRec',[],1,{variant:`toc${press}`});
 const plan={D,round,press,moments,final,top,beat,s0,close,beats,stagger:0,score:sc.done()};
 if(FEM_CACHE.size>48)FEM_CACHE.delete(FEM_CACHE.keys().next().value);FEM_CACHE.set(id,plan);return plan;}
export const femScore=(variant,count,steps,duration)=>femPlan(variant,count,steps,duration).score;

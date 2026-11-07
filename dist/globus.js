// Festa de globus (CE27), 0.20: a festa major square sewn in felt. Each press sends up one more balloon from the bottom of the screen to
// its place in the sky, and each balloon sings one note of the tune of the round; the tune grows note by note over a waltz of plucked
// strings. At the last press the last balloon goes up, and then all of them rise together and leave the sky, while the whole tune is
// played. The balloons never burst. A story of seven moments (escenari.js): six balloons and the final, shared out between 3, 5 or 7
// presses. Each round changes the square (a church square, the seafront, a mountain village), the time of day (morning, afternoon,
// evening with lights), the colours and the shape of the balloons, where each one stops, and the tune and its key.
// Music (original): the balloons on the marimba, doubled by the glockenspiel from the fourth one; a waltz of plucked cellos and violins;
// the flute answers from the third balloon; at the flight a harp glissando, a soft cymbal and the whole tune. Every note is plucked or
// struck, or short (the flute), and every step ends on notes that fade by themselves.
import {escGroups,escNote,escFit,escInto,escScore} from './escenari.js';

export const GB_STEP_MIN=6,GB_FINAL_MIN=12;
// Seconds: a balloon takes GB_RISE to go up to its place; several balloons of one press start GB_STAGGER apart; at GB_LIFT of the final
// all the balloons start to rise together and take GB_FLY to leave the sky.
export const GB_RISE=2.6,GB_STAGGER=.9,GB_LIFT=3.2,GB_FLY=5;
export const GB_PLACES=Object.freeze(['placa','mar','muntanya']);
export const GB_TIMES=Object.freeze(['mati','tarda','vespre']);
export const GB_SHAPES=Object.freeze(['rodo','llarg','cor']);
// Felt colours of the balloons, in four sets that stand out against every sky of the rounds (no pale blue by day, no violet at dusk).
export const GB_SETS=Object.freeze([
 ['#e8433f','#f6b93b','#2e8fd6','#5fb544','#e86fb0','#ff8a3d','#8e6ad1'],
 ['#d93b6a','#ffcf3f','#1fa5a0','#f0703a','#6b8be8','#9ccc3c','#c2448f'],
 ['#ff6f3c','#2f9e6b','#f2c230','#d63c4f','#3d7fd9','#e77fc1','#7bc043'],
 ['#c9402b','#f7a531','#3b9ed1','#e95b8b','#58ad4f','#b36ad8','#f4d03f']]);
// The tunes: seven degrees of the major scale, one for each balloon (the last one is the highest or the home note).
const GB_TUNES=Object.freeze([[4,2,4,5,7,9,7],[0,4,2,5,4,8,7],[2,4,7,6,4,5,7],[7,5,4,2,4,6,7],[4,7,6,4,5,9,11]]);
const GB_KEYS=Object.freeze([60,62,65,57,64]);
// Where the seven balloons stop: x from 0 to 1 across, y from 0 at the top (in the sky, above the roofs), in five layouts.
const GB_SPOTS=Object.freeze([
 [[.2,.34],[.5,.24],[.78,.33],[.35,.14],[.66,.12],[.1,.16],[.9,.15]],
 [[.5,.3],[.22,.22],[.78,.2],[.36,.36],[.64,.36],[.12,.34],[.88,.33]],
 [[.3,.24],[.7,.26],[.5,.12],[.15,.36],[.85,.36],[.4,.38],[.6,.16]],
 [[.78,.3],[.24,.3],[.52,.18],[.9,.14],[.1,.14],[.38,.1],[.66,.38]],
 [[.4,.28],[.62,.2],[.18,.2],[.82,.26],[.5,.4],[.3,.08],[.72,.06]]]);
// The twenty rounds: [square, time of day, colour set, shape, tune]. Two rounds in a row differ in square, time and shape; each tune
// comes back four times, each time in another key.
const GB_ROUNDS=Object.freeze([[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,3,1,3],[1,2,0,2,4],[2,0,1,0,0],[0,2,2,1,1],[1,0,3,2,2],[2,1,0,0,3],[1,2,1,1,4],
 [0,0,2,2,0],[2,1,3,0,1],[1,2,0,1,2],[0,0,1,2,3],[2,2,2,1,4],[1,1,3,0,0],[0,2,0,2,1],[2,0,1,1,2],[1,1,2,0,3],[2,2,3,2,4]]);
const gbV=variant=>((Math.round(variant||0)%20)+20)%20;
export function gbRound(variant){const v=gbV(variant),[place,time,set,shape,tune]=GB_ROUNDS[v];
 return {v,place:GB_PLACES[place],time:GB_TIMES[time],colors:GB_SETS[set],shape:GB_SHAPES[shape],tune:GB_TUNES[tune],key:GB_KEYS[(tune+2*Math.floor(v/5))%5],spots:GB_SPOTS[(v*3+1)%5]};}
// The seconds between the balloons of one press (3 or 5 presses bring two or three balloons at a time).
export const gbStagger=(steps,count)=>{const g=escGroups(steps)[Math.max(0,(count||1)-1)]||[0];return g.length>1?GB_STAGGER:0;};

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
const GB_CACHE=new Map();
// Loudness against the other stories (measured on the review video, EBU R 128; velocity is quadratic).
export const GB_LOUD=1.13;
export function gbPlan(variant,count,steps,duration){const D=Math.max(1,duration||GB_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(GB_CACHE.has(id))return GB_CACHE.get(id);
 const round=gbRound(variant),groups=escGroups(steps),press=Math.max(1,Math.min(count||1,groups.length)),moments=groups[press-1],final=press===groups.length,top=moments[moments.length-1];
 const deg=d=>escNote(round.key,'major',d),sc=escScore(D),put=(t,len,inst,midi,vel,x={})=>sc.add(t,len,inst,midi,Math.min(1,vel*GB_LOUD),x);
 const fit=(ds,inst,centre)=>escFit(ds.map(deg),inst,centre),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const beat=.42,bar=3*beat,stagger=moments.length>1?GB_STAGGER:0,chords=[0,3,4,0,5,3,4,0];
 const shM=fit([0,11],'marimbaRec',72),shG=fit([4,11],'glockRec'),shB=fit([0,4],'celliPizzRec',45),shV=fit([2,4,7],'violinsPizzRec',67),shF=fit([4,11],'fluteRec',79),shH=fit([0,11],'harpRec',64);
 // The waltz: a plucked root on the first beat, two violins plucked on the second and third, one bar after another.
 const waltz=(t0,bars,first,full)=>{for(let b=0;b<bars;b++){const t=t0+b*bar,ch=chords[(first+b)%chords.length];
  put(t,bar*.9,'celliPizzRec',[into(ch+(b%2?4:0),'celliPizzRec',shB)],.42,{pan:.12});
  for(const q of [1,2])put(t+q*beat,beat*.8,'violinsPizzRec',[into(ch+2,'violinsPizzRec',shV),into(ch+4,'violinsPizzRec',shV)],.26+(full?.04:0),{pan:-.16});}};
 // A balloon: its note on the marimba as it leaves, two softer echoes as it floats up, and the glockenspiel an octave up from the fourth.
 const balloon=(k,t)=>{const d=round.tune[k];put(t,1.2,'marimbaRec',[into(d,'marimbaRec',shM)],.6,{pan:.2});
  put(t+beat*2,.8,'marimbaRec',[into(d,'marimbaRec',shM)],.32,{pan:.24});put(t+beat*3.5,.7,'marimbaRec',[into(d+2,'marimbaRec',shM)],.24,{pan:.28});
  if(k>=3)put(t,1.6,'glockRec',[into(d,'glockRec',shG)],.3,{pan:-.1});};
 let close;
 if(!final){
  const t0=.25,n=moments.length,bars=Math.max(2,Math.floor((D-t0-1.9)/bar));
  moments.forEach((k,j)=>balloon(k,t0+j*stagger));
  waltz(t0,bars,top,false);
  // The flute answers the newest balloon from the third one: three short notes going down to it.
  if(top>=2){const d=round.tune[top],ta=t0+bar*Math.max(1,bars-1);[d+4,d+2,d].forEach((x,i)=>put(ta+i*beat,beat*.7,'fluteRec',[into(x,'fluteRec',shF)],.3,{pan:-.3}));}
  close=t0+bars*bar;
  put(close,2,'harpRec',[0,2,4,7].map(x=>into(chords[0]+x,'harpRec',shH)),.36,{strum:.05,pan:-.25});
  put(close,1.4,'celliPizzRec',[into(0,'celliPizzRec',shB)],.38,{pan:.12});
  if(top>=4)put(close,1.6,'glockRec',[into(round.tune[top],'glockRec',shG)],.22,{pan:-.1});
 }else{
  // The final: the last balloon, then the flight: a harp glissando, a soft cymbal and the triangle as all of them rise; the whole tune
  // on marimba and glockenspiel over the waltz, the flute in the last bars, and a closing chord as the sky clears.
  balloon(6,.25);waltz(.25,2,6,false);
  for(let i=0;i<15;i++)put(GB_LIFT-.4+i*.05,1.6,'harpRec',[into(i,'harpRec',shH)],.22+.012*i,{pan:-.25});
  put(GB_LIFT+.35,3,'cymbalRec',[],.22,{variant:'soft'});put(GB_LIFT+.35,1.6,'triangleRec',[],.18,{variant:'hit',pan:.3});
  const tt=GB_LIFT+.6,bars=Math.max(2,Math.floor((D-tt-2.2)/bar));waltz(tt,bars,0,true);
  const tune=round.tune,step=Math.min(beat*1.5,(bars*bar-beat)/tune.length);tune.forEach((d,i)=>{const t=tt+i*step;put(t,step*1.6,'marimbaRec',[into(d,'marimbaRec',shM)],.5,{pan:.2});put(t,step*1.6,'glockRec',[into(d,'glockRec',shG)],.24,{pan:-.1});});
  [4,2,0].forEach((x,i)=>put(tt+bars*bar-3*beat+i*beat,beat*.7,'fluteRec',[into(tune[6]+x,'fluteRec',shF)],.28,{pan:-.3}));
  close=tt+bars*bar;
  put(close,2.2,'harpRec',[0,2,4,7,9].map(x=>into(x,'harpRec',shH)),.4,{strum:.05,pan:-.25});put(close,1.8,'glockRec',[into(7,'glockRec',shG)],.26,{pan:-.1});
  put(close,1.5,'celliPizzRec',[into(0,'celliPizzRec',shB)],.4,{pan:.12});put(close,1.2,'marimbaRec',[into(0,'marimbaRec',shM),into(4,'marimbaRec',shM)],.36,{pan:.2});
 }
 const plan={D,round,press,moments,final,top,beat,close,stagger,score:sc.done()};
 if(GB_CACHE.size>48)GB_CACHE.delete(GB_CACHE.keys().next().value);GB_CACHE.set(id,plan);return plan;}
export const gbScore=(variant,count,steps,duration)=>gbPlan(variant,count,steps,duration).score;

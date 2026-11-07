// El cambrer equilibrista (CE31), 0.23: a picture book of the 1960s, in gouache with a brush line. A waiter (or a waitress on roller
// skates, a chef or a baker) stands in the middle of a summer place with a tray held up on one hand. At each press the kitchen door
// swings open and something flies out onto the tray: a pile of plates, a cup, a cake, a teapot, a watermelon, a bowl of fruit. The pile
// grows, sways more and more, and the waiter keeps it up with bigger and bigger feats of balance. At the last press a jelly lands on
// top, the waiter is very proud of it, and then a small mishap (a sneeze, a banana skin or the hiccups) brings it all down in slow
// motion: every thing lands somewhere safe, nothing breaks, the jelly lands on the waiter's head, and the waiter laughs and bows.
// 3, 5 or 7 presses: 2, 4 or 6 things and the final. Each round changes the order of the things, the waiter, the place, the mishap
// and the key of the music.
// Music (original): a café waltz on plucked strings (cellos and violins), with flute, clarinet, marimba, harp and glockenspiel, all
// recorded (VSCO-2 CE). Each thing that lands rings one marimba note higher than the one before, so that the pile can be counted
// going up. Cartoon sounds generated with ElevenLabs. Every step ends on plucked or struck notes.
import {escNote,escFit,escInto,escScore} from './escenari.js';

export const CB_STEP_MIN=7.5,CB_FINAL_MIN=13.5;
export const CB_ITEMS=Object.freeze(['plates','cup','cake','teapot','melon','fruit']);
export const CB_HEROES=Object.freeze(['waiter','skater','chef','baker']);
export const CB_PLACES=Object.freeze(['terrace','beach','garden','train','square']);
export const CB_SLIPS=Object.freeze(['sneeze','banana','hiccup']);
// The moments of a press, in seconds. The picture (cambrer-art.js) and the music follow the same times. step: the kitchen door opens,
// the thing is thrown and lands on top of the pile, the pile sways and the waiter keeps it up, steadies it and is proud of it.
// final: the jelly lands the same way; the waiter is proud; the mishap (each one has its own moments, all ending at go); the pile
// comes down in slow motion (each thing lands between fall and landed); the jelly lands on the waiter's head; the waiter sits, notices
// the jelly, laughs, gets up and bows.
export const CB_T=Object.freeze({
 step:Object.freeze({door:0,toss:.2,land:1.2,steady:4.2,proud:4.6,settle:5.5,end:6}),
 final:Object.freeze({door:0,toss:.2,land:1.2,proud:2.4,slip:3.3,go:4.45,sit:5.1,fall:4.5,landed:7.1,jelly:7.4,notice:8.4,laugh:8.9,up:9.5,bow:10.5,end:12}),
 sneeze:Object.freeze({tickle:3.3,ah1:3.65,ah2:4.05,go:4.45}),
 banana:Object.freeze({step:3.3,slip:3.95,go:4.45}),
 hiccup:Object.freeze({hic1:3.3,hic2:3.85,go:4.45})});
// When each thing lands at the final (seconds after CB_T.final.fall, in slow motion): the thing at the bottom of the pile first, and
// each one higher up CB_FALL_GAP later, because it falls from higher.
export const CB_FALL=1.5,CB_FALL_GAP=.2;
// The twenty rounds: the order of the six things (indices into CB_ITEMS). Two rounds in a row (and the last with the first) never share
// their first two things and share at most one of their first three, so three presses always show something new.
const CB_ORDERS=Object.freeze([[0,1,4,2,3,5],[4,2,3,0,1,5],[0,3,1,5,4,2],[5,4,0,3,1,2],[2,0,1,5,4,3],[3,1,4,0,2,5],[5,0,4,2,1,3],[1,2,3,5,4,0],
 [0,4,5,3,2,1],[1,3,0,5,4,2],[4,5,1,0,3,2],[1,0,2,3,4,5],[5,3,2,4,0,1],[4,1,3,5,2,0],[0,3,5,4,2,1],[1,4,3,2,0,5],[2,0,3,4,5,1],[3,4,1,5,0,2],
 [2,0,5,1,4,3],[3,5,4,0,1,2]].map(o=>Object.freeze(o)));
// Keys of a café waltz: F, G, C, B flat and D.
const CB_KEYS=Object.freeze([65,67,60,58,62]);
const cbV=variant=>((Math.round(variant||0)%20)+20)%20;
// Waiter (4) and place (5): every pair once in twenty rounds, and two rounds in a row change both, and the mishap.
export function cbRound(variant){const v=cbV(variant),hero=v%4,place=(hero+Math.floor(v/4))%5;
 return {v,order:CB_ORDERS[v],hero,place,slip:v%3,key:CB_KEYS[(v*3)%5]};}
// What a press shows: one thing (item, an index into CB_ITEMS) or the final; done lists the things already on the tray.
export function cbStep(variant,count,steps){const r=cbRound(variant),n=Math.max(1,Math.min(6,Math.round(steps||7)-1)),p=Math.max(1,Math.min(count||1,n+1)),final=p>n;
 return {final,item:final?-1:r.order[p-1],done:r.order.slice(0,Math.min(p-1,n)),items:r.order.slice(0,n),index:p-1};}
// How much the pile sways once a thing has landed: more with each thing (count: things on the tray).
export const cbSway=count=>.035+.022*Math.max(0,count-1);

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
const CB_CACHE=new Map();
// Loudness against the other stories (measured on the review video, EBU R 128; velocity is quadratic).
export const CB_LOUD=1.48;
export function cbPlan(variant,count,steps,duration){const D=Math.max(1,duration||CB_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(CB_CACHE.has(id))return CB_CACHE.get(id);
 const round=cbRound(variant),step=cbStep(variant,count,steps),final=step.final,T=final?CB_T.final:CB_T.step,S=final?CB_T[CB_SLIPS[round.slip]]:null;
 const deg=d=>escNote(round.key,'major',d),sc=escScore(D),put=(t,len,inst,midi,vel,x={})=>sc.add(t,len,inst,midi,Math.min(1,vel*CB_LOUD),x);
 const fit=(ds,inst,centre)=>escFit(ds.map(deg),inst,centre),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const shC=fit([0,4],'celliPizzRec'),shP=fit([0,2,4,7],'violinsPizzRec'),shF=fit([0,4,7,9],'fluteRec'),shK=fit([0,4,7],'clarinetRec');
 const shM=fit([0,7,14],'marimbaRec'),shH=fit([0,7],'harpRec'),shG=fit([0,7],'glockRec'),shX=fit([0],'timpaniRec'),shR=fit([0,4,7],'trumpetRec',72),shB=fit([0,4],'tromboneRec');
 // the cartoon sounds sit a little under the loudest moments of the music
 const sfx=(t,v,vel,len=1.4)=>put(t,len,'toonRec',[],vel*.8,{variant:v});
 // The waltz: the cellos on the first beat, the violins on the second and third; a chord every bar.
 const B=.42,CH=[0,3,4,0,0,3,4,4];
 const waltz=(t0,t1,vel=1,first=0)=>{for(let i=0,t=t0;t<t1-.05;i++,t+=B){const ch=CH[(first+Math.floor(i/3))%CH.length];
  if(i%3===0)put(t,B*.9,'celliPizzRec',[into(ch,'celliPizzRec',shC)],.42*vel,{pan:.12});
  else put(t,B*.6,'violinsPizzRec',[ch+2,ch+4,ch+7].map(x=>into(x,'violinsPizzRec',shP)),.24*vel,{pan:-.15,strum:.012});}};
 // The kitchen door: two knocks of the claves as it swings; the throw: a quick flute run up.
 const door=t=>{put(t,.2,'woodblockRec',[],.22,{variant:'claves',pan:-.4});put(t+.14,.2,'woodblockRec',[],.16,{variant:'claves',pan:-.4});};
 const toss=(t,vel=.3)=>[0,2,4,7].forEach((d,i)=>put(t+i*.07,i===3?.3:.1,'fluteRec',[into(d+7,'fluteRec',shF)],vel*(i===3?1:.8),{pan:-.3+.1*i}));
 // The thing lands: one marimba note, one step higher for each thing on the tray, and the glockenspiel an octave above, softly.
 const landNote=k=>into(k,'marimbaRec',shM);
 const land=(t,k)=>{put(t,1,'marimbaRec',[landNote(k)],.42,{pan:.1});put(t+.01,1.2,'glockRec',[into(k,'glockRec',shG)],.14,{pan:.1});};
 // The sway: the clarinet goes from side to side with the pile, wider and slower as it grows.
 const wobble=(t0,t1,amp)=>{let i=0;for(let t=t0;t<t1-.1;t+=.3,i++){const d=(i%2?-1:1)*Math.min(3,1+Math.round(amp*20));put(t,.24,'clarinetRec',[into(4,'clarinetRec',shK)+d],.2+.06*Math.min(1,amp*6),{pan:(i%2?.25:-.25)});}};
 // Proud: two trumpet notes, soft; the close of a step: a plucked chord on the tonic (harp, cellos) and the marimba, a little under the
 // landings (it rings longer and all together, so at the same velocity it would be the loudest moment of the press).
 const proud=(t,vel=.3)=>{put(t,.2,'trumpetRec',[into(4,'trumpetRec',shR)],vel,{pan:.15});put(t+.22,.6,'trumpetRec',[into(7,'trumpetRec',shR)],vel*1.08,{pan:.15});};
 const cadence=(t,vel=.7)=>{put(t,1.8,'harpRec',[0,2,4,7].map(x=>into(x,'harpRec',shH)),.32*vel,{strum:.04,pan:-.2});put(t,1.2,'celliPizzRec',[into(0,'celliPizzRec',shC)],.4*vel,{pan:.12});
  put(t,1,'marimbaRec',[into(2,'marimbaRec',shM),into(4,'marimbaRec',shM)],.26*vel,{pan:.2});};
 const close=Math.min(D-1.5,final?T.bow+.5:T.end);
 const k=step.index;
 if(!final){
  door(T.door);toss(T.toss);sfx(T.land-.02,'clink',.5,.8);land(T.land,k);
  const amp=cbSway(k+1);waltz(T.land+.2,T.steady,.8+.04*k,k);wobble(T.land+.35,T.steady,amp);
  // a little roll of the snare drum while the waiter fights for balance, longer with a higher pile
  if(k>=2)put(T.land+.6,Math.min(1.6,.5+.2*k),'snareRollRec',[],.12+.02*k,{variant:'roll'});
  proud(T.proud);waltz(T.proud+.4,close,.7,k+1);
 }else{
  door(T.door);toss(T.toss,.34);land(T.land,7);sfx(T.land,'jelly',.55,1.2);
  waltz(T.land+.3,T.proud,.8);proud(T.proud,.36);put(T.proud+.22,1.2,'glockRec',[into(7,'glockRec',shG)],.2,{pan:-.1});
  const slip=CB_SLIPS[round.slip];
  if(slip==='sneeze'){
   // ah... ah... (the slide whistle goes up twice) and the sneeze: a low trombone and the bass drum
   sfx(S.tickle,'slideUp',.36,1);put(S.ah1,.3,'fluteRec',[into(7,'fluteRec',shF)],.22,{pan:-.2});put(S.ah2,.3,'fluteRec',[into(9,'fluteRec',shF)],.24,{pan:-.2});
   put(S.go,.34,'tromboneRec',[into(0,'tromboneRec',shB)],.48,{pan:.1});put(S.go,1.2,'bassdrumRec',[],.34,{variant:'soft'});
  }else if(slip==='banana'){
   // one proud step (two plucked notes), the foot on the skin, and the slide whistle going down as the feet go up
   put(S.step,.3,'celliPizzRec',[into(4,'celliPizzRec',shC)],.36,{pan:.1});put(S.step+.3,.3,'celliPizzRec',[into(0,'celliPizzRec',shC)],.36,{pan:.1});
   sfx(S.slip,'slideDown',.5,1.2);put(S.go,1.2,'bassdrumRec',[],.32,{variant:'soft'});
  }else{
   // hic! hic! HIC!: short clarinet squeaks, each with a clave
   [[S.hic1,.26],[S.hic2,.3],[S.go,.4]].forEach(([t,v],i)=>{put(t,.12,'clarinetRec',[into(7+i,'clarinetRec',shK)],v,{pan:-.2});put(t,.2,'woodblockRec',[],.2+.06*i,{variant:'claves',pan:.2});});
   put(S.go,1.2,'bassdrumRec',[],.3,{variant:'soft'});
  }
  // the waiter sits down on the floor with a soft thump
  put(T.sit+.3,.8,'bassdrumRec',[],.22,{variant:'soft'});put(T.sit+.3,.4,'celliPizzRec',[into(-3,'celliPizzRec',shC)],.3,{pan:.1});
  // The slow fall: the harp glides down over the whole fall, the timpani slides, and each thing rings its own marimba note as it lands,
  // from the bottom of the pile up (the same notes as when the pile was built); the dishes clatter softly (nothing breaks).
  put(T.fall,.9,'timpaniRec',[into(4,'timpaniRec',shX)],.3,{glide:into(4,'timpaniRec',shX)-5});
  for(let i=0;i<12;i++)put(T.fall+.15+i*.2,1.4,'harpRec',[into(11-i,'harpRec',shH)],.2-.006*i,{pan:.3-.05*i});
  const n=step.items.length;for(let i=0;i<n;i++){const at=T.fall+CB_FALL+i*CB_FALL_GAP;put(at,.8,'marimbaRec',[landNote(i)],.32,{pan:-.2+.08*i});}
  sfx(T.fall+CB_FALL+.05,'clatter',.55,1.6);put(T.fall+CB_FALL+.05,2,'cymbalRec',[],.12,{variant:'soft'});
  // the jelly on the head: the boing and a glockenspiel note
  sfx(T.jelly,'jelly',.6,1.2);sfx(T.jelly+.05,'boing',.34,1);put(T.jelly+.05,1.2,'glockRec',[into(9,'glockRec',shG)],.2,{pan:.1});
  // the waiter notices (two flute notes), laughs (the clarinet up), gets up and bows to the waltz
  put(T.notice,.3,'fluteRec',[into(4,'fluteRec',shF)],.2,{pan:-.2});put(T.notice+.34,.4,'fluteRec',[into(2,'fluteRec',shF)],.2,{pan:-.2});
  [4,5,6,7,9].forEach((d,i)=>put(T.laugh+i*.1,.1,'clarinetRec',[into(d,'clarinetRec',shK)],.26,{pan:-.2}));
  waltz(T.up,T.bow+.4,.85);proud(T.bow-.1,.38);
  cadence(close,.8);put(close,1.6,'glockRec',[into(7,'glockRec',shG)],.22,{pan:-.1});put(close,2.2,'cymbalRec',[],.12,{variant:'soft'});
 }
 if(!final)cadence(close);
 const plan={D,round,step,final,T,S,close,score:sc.done()};
 if(CB_CACHE.size>48)CB_CACHE.delete(CB_CACHE.keys().next().value);CB_CACHE.set(id,plan);return plan;}
export const cbScore=(variant,count,steps,duration)=>cbPlan(variant,count,steps,duration).score;

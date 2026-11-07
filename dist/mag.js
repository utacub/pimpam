// El mag desastrós (CE29), 0.21: a cartoon of the 1930s, in ink and paint, on a small painted stage. Each press is one trick of a
// clumsy magician, and each trick goes wrong in its own way: the scarf that never ends, the flower that squirts, the wand that goes
// limp and ties itself in a bow, the hat that bursts into feathers, the deck of cards that springs out of his hands, and the
// tablecloth trick. Nobody is ever hurt, and what falls stays on the stage. At the last press he walks into the magic cabinet: the door
// opens on his shoes alone, his hat grows giant, he springs out of it in his socks, all the mess vanishes and he bows.
// 3, 5 or 7 presses: 2, 4 or 6 tricks and the final. Each round changes the order of the tricks, the colours of the curtain, the
// painted backdrop, the magician's tailcoat and the key of the music.
// Music (original): a vaudeville two-step (tuba and plucked violins) that stops dead at the moment of each mishap, as in the cartoons;
// clarinet, trumpet, trombone, glockenspiel, marimba, harp, snare drum and claves, all recorded (VSCO-2 CE); seven short cartoon sounds
// generated with ElevenLabs (a puff, a squirt, cards, a cloth yanked away, two slide whistles and a boing). Every step ends on plucked
// or struck notes.
import {escNote,escFit,escInto,escScore} from './escenari.js';

export const MG_STEP_MIN=8,MG_FINAL_MIN=13.5;
// At the final, what each trick left vanishes in a sparkle, one trick every MG_VANISH seconds.
export const MG_VANISH=.34;
export const MG_GAGS=Object.freeze(['scarf','flower','wand','feathers','cards','cloth']);
// The moments of each trick, in seconds from the press. The picture (mag-art.js) and the music follow the same times.
export const MG_T=Object.freeze({
 scarf:Object.freeze({hop:0,wave:.55,out:1.15,full:2.4,wrap:3,shake:4,free:4.8,back:5.7,end:6.4}),
 flower:Object.freeze({reach:0,pull:.55,bloom:.8,show:1.3,smell:2.2,squirt:2.85,drip:3.5,puddle:4.4,end:6.3}),
 wand:Object.freeze({pull:0,up:.5,wave:.7,limp:1.9,knot:3,drop:4,land:4.45,end:6.3}),
 feathers:Object.freeze({hop:0,tap:.7,shake:1.65,poof:2.3,tickle:3.7,sneeze:4.45,back:5.5,end:6.4}),
 cards:Object.freeze({fan:0,shuffle:.6,squeeze:1.85,burst:2.4,ear:4.2,end:6.3}),
 cloth:Object.freeze({reach:0,grab:.7,yank:2,hatLand:2.95,goblet:3.25,tada:4,drop:5,end:6.4}),
 final:Object.freeze({turn:0,walk:.6,enter:2,shut:2.6,shake:2.7,open:5,grow:6.2,tara:7.2,clean:8.2,shrink:10,bow:11.3,end:12.8})});
// The twenty rounds: the order of the six tricks (indices into MG_GAGS). Two rounds in a row (and the last with the first) never share
// their first two tricks, so three presses (two tricks) always show something new; every trick comes first three or four times.
const MG_ORDERS=Object.freeze([[2,4,5,3,0,1],[3,5,0,1,2,4],[1,2,4,3,5,0],[3,0,4,1,2,5],[5,4,3,1,2,0],[1,3,2,0,5,4],[2,5,0,3,4,1],[0,1,3,4,5,2],
 [5,2,1,0,3,4],[4,3,2,0,5,1],[2,0,1,4,3,5],[1,4,2,5,0,3],[0,2,5,3,4,1],[3,1,5,0,4,2],[0,5,2,3,1,4],[4,3,5,2,1,0],[0,1,5,3,2,4],[3,5,4,2,0,1],
 [4,0,1,2,5,3],[5,1,2,4,3,0]].map(o=>Object.freeze(o)));
// Keys that suit a small brass band: F, B flat, E flat, C and G.
const MG_KEYS=Object.freeze([65,58,63,60,67]);
const mgV=variant=>((Math.round(variant||0)%20)+20)%20;
// Curtain (4) and backdrop (5): every pair once in twenty rounds, and two rounds in a row always change the curtain.
export function mgRound(variant){const v=mgV(variant),curtain=v%4,back=(curtain+Math.floor(v/4))%5;
 return {v,order:MG_ORDERS[v],curtain,back,coat:(v*2+Math.floor(v/5))%5,key:MG_KEYS[(v*3)%5]};}
// What a press shows: one trick (gag, an index into MG_GAGS) or the final; done lists the tricks already played in this round.
export function mgStep(variant,count,steps){const r=mgRound(variant),n=Math.max(1,Math.min(6,Math.round(steps||7)-1)),p=Math.max(1,Math.min(count||1,n+1)),final=p>n;
 return {final,gag:final?-1:r.order[p-1],done:r.order.slice(0,p-1),tricks:r.order.slice(0,n)};}

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
const MG_CACHE=new Map();
// Loudness against the other stories (measured on the review video, EBU R 128; velocity is quadratic): about −30 LUFS on the review
// copy, like Festa de globus; the cartoon sounds peak about 0.6 LU under the music.
export const MG_LOUD=1.25;
export function mgPlan(variant,count,steps,duration){const D=Math.max(1,duration||MG_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(MG_CACHE.has(id))return MG_CACHE.get(id);
 const round=mgRound(variant),step=mgStep(variant,count,steps),name=step.final?'final':MG_GAGS[step.gag],T=MG_T[name];
 const deg=d=>escNote(round.key,'major',d),sc=escScore(D),put=(t,len,inst,midi,vel,x={})=>sc.add(t,len,inst,midi,Math.min(1,vel*MG_LOUD),x);
 const fit=(ds,inst,centre)=>escFit(ds.map(deg),inst,centre),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const shT=fit([0,4],'tubaRec'),shP=fit([0,2,4,7],'violinsPizzRec'),shC=fit([0,4,7,9],'clarinetRec'),shR=fit([0,4,7],'trumpetRec',72),shB=fit([0,4],'tromboneRec');
 const shG=fit([0,7],'glockRec'),shM=fit([0,7,9],'marimbaRec'),shH=fit([0,7],'harpRec'),shK=fit([0,4],'celliPizzRec'),shX=fit([0],'timpaniRec');
 // The cartoon sounds sit a little under the loudest moments of the music: a surprise, never a fright.
 const sfx=(t,v,vel,len=1.5)=>put(t,len,'toonRec',[],vel*.84,{variant:v});
 const B=.36,CH=[0,0,4,4,0,0,3,4];
 // The two-step: the tuba on the beat (root, then fifth), the plucked violins and a soft clave off it; a chord every bar of two beats.
 const bed=(t0,t1,first=0,vel=1)=>{for(let i=0,t=t0;t<t1-.05;i++,t+=B){const ch=CH[(first+Math.floor(i/2))%CH.length];
  if(i%2===0)put(t,B*.7,'tubaRec',[into(ch+(i%4?4:0),'tubaRec',shT)],.5*vel,{pan:.08});
  else{put(t,B*.6,'violinsPizzRec',[ch+2,ch+4,ch+7].map(x=>into(x,'violinsPizzRec',shP)),.3*vel,{pan:-.15,strum:.012});put(t,.2,'woodblockRec',[],.14*vel,{variant:'claves',pan:.3});}}};
 // A pick-up on the clarinet: three quick notes going up to the tonic.
 const pickup=(t,vel=.38)=>[4,5,6,7].forEach((d,i)=>put(t+i*.11,i===3?.32:.1,'clarinetRec',[into(d,'clarinetRec',shC)],vel*(i===3?1:.8),{pan:-.2}));
 // The sad trombone: three notes falling by semitones and a long fourth that slides down a whole tone.
 const sad=(t,vel=.42)=>{const m=into(4,'tromboneRec',shB);[0,-1,-2].forEach((x,i)=>put(t+i*.44,.36,'tromboneRec',[m+x],vel,{pan:.1}));put(t+1.32,1.1,'tromboneRec',[m-3],vel,{pan:.1,glide:m-5});};
 // A sparkle of magic: a quick glockenspiel run.
 // The glockenspiel stays within its recorded bars (up to G7), so that no note is a shifted, shriller copy of the top one.
 // A run moves down as a whole, so that it keeps its shape.
 const glRun=ds=>{const ms=ds.map(d=>deg(d)+shG);while(Math.max(...ms)>103)ms.forEach((m,i)=>ms[i]=m-12);while(Math.min(...ms)<79&&Math.max(...ms)+12<=103)ms.forEach((m,i)=>ms[i]=m+12);return ms;},gl=d=>glRun([d])[0];
 const sparkle=(t,vel=.24,up=true)=>glRun([0,2,4,7,9].map(d=>(up?d:9-d)+7)).forEach((m,i)=>put(t+i*.06,.6,'glockRec',[m],vel,{pan:-.1+.05*i}));
 // The close of a step: a plucked chord on the tonic (harp, cellos, violins) and the marimba, after a little pause.
 const cadence=(t,vel=1)=>{put(t,1.8,'harpRec',[0,2,4,7].map(x=>into(x,'harpRec',shH)),.34*vel,{strum:.04,pan:-.2});put(t,1.2,'celliPizzRec',[into(0,'celliPizzRec',shK)],.42*vel,{pan:.12});
  put(t,1,'marimbaRec',[into(4,'marimbaRec',shM),into(7,'marimbaRec',shM)],.3*vel,{pan:.2});put(t+.02,.2,'woodblockRec',[],.16*vel,{variant:'claves',pan:.3});};
 // The closing chord comes as the trick (or the bow) ends, and has at least a second and a half to ring before the scene waits.
 const close=Math.min(D-1.5,name==='final'?T.bow+.4:T.end);
 if(name==='scarf'){
  pickup(0);bed(.45,T.wrap,0);put(.42,.2,'woodblockRec',[],.2,{variant:'claves'});sparkle(T.wave);
  // The scarves: a marimba run that keeps going up, octave after octave, as if it would never end.
  for(let i=0,t=T.out;t<T.wrap+.9;i++,t+=.13)put(t,.5,'marimbaRec',[into(i%7,'marimbaRec',shM)+(Math.floor(i/7)%2)*12],.24+.08*Math.min(1,i/14),{pan:.25-(i%7)*.07});
  // Wrapped up: the clarinet trills; he wriggles on the snare drum; the bands fall off with the slide whistle.
  for(let i=0;i<7;i++)put(T.wrap+.1+i*.12,.1,'clarinetRec',[into(i%2?5:4,'clarinetRec',shC)],.3,{pan:-.2});
  [0,.18,.36,.54].forEach(x=>put(T.shake+x,.2,'snareRec',[],.24,{variant:'hit',pan:.1}));
  sfx(T.free,'slideDown',.62);put(T.back+.3,.2,'woodblockRec',[],.2,{variant:'claves'});
  bed(T.back-.2,close,0,.8);
 }else if(name==='flower'){
  pickup(0);bed(.45,T.smell,0);
  // The flowers open with three plucked notes; he sniffs on two soft flute notes; the squirt; the drips on the plucked violins.
  [0,2,4].forEach((d,i)=>put(T.bloom+i*.16,1,'harpRec',[into(d+7,'harpRec',shH)],.36,{pan:.2}));sparkle(T.show,.2);
  put(T.smell,.4,'fluteRec',[into(7,'fluteRec',0)],.22,{pan:-.2});put(T.smell+.42,.4,'fluteRec',[into(9,'fluteRec',0)],.22,{pan:-.2});
  sfx(T.squirt,'squirt',.7);
  [11,9,7,9,4,7,2,4,0].forEach((d,i)=>put(T.drip+.15+i*.22+(i%3)*.03,.3,'violinsPizzRec',[into(d+7,'violinsPizzRec',shP)],.24,{pan:-.3+.07*i}));
  sad(T.drip+.4,.36);
 }else if(name==='wand'){
  put(0,.75,'snareRollRec',[],.2,{variant:'roll'});put(T.up,.4,'trumpetRec',[into(7,'trumpetRec',shR)],.34,{pan:.15});bed(T.wave,T.limp,0);
  sparkle(T.wave+.1);sparkle(T.wave+.65,.2,false);
  // It goes limp: the sad trombone. It ties itself: the clarinet winds up and down. It falls: the boing.
  sad(T.limp,.44);
  [0,1,2,3,4,3,2,1,0,1,2].forEach((x,i)=>put(T.knot+.05+i*.085,.08,'clarinetRec',[into(4,'clarinetRec',shC)+x],.24,{pan:-.2}));
  sfx(T.land,'boing',.6);bed(T.land+.7,close,0,.8);
 }else if(name==='feathers'){
  pickup(0);put(.42,.2,'woodblockRec',[],.2,{variant:'claves'});bed(.45,T.tap,0,.9);
  // Three knocks on the hat, a drum roll while it trembles, the puff and a rain of feathers on the harp.
  [0,.3,.6].forEach(x=>put(T.tap+x,.2,'woodblockRec',[],.34,{variant:'claves',pan:-.1}));
  put(T.shake,T.poof-T.shake+.05,'snareRollRec',[],.22,{variant:'roll'});
  sfx(T.poof,'poof',.75);sparkle(T.poof+.05,.18,false);
  for(let i=0;i<9;i++)put(T.poof+.5+i*.2,1.2,'harpRec',[into(11-i,'harpRec',shH)],.2,{pan:.3-.07*i});
  // The tickle: the slide whistle goes up (ah... ah...); the sneeze: a low trombone and the bass drum.
  sfx(T.tickle,'slideUp',.5);put(T.sneeze,.3,'tromboneRec',[into(0,'tromboneRec',shB)],.5,{pan:.1});
  put(T.sneeze,1.2,'bassdrumRec',[],.36,{variant:'soft'});put(T.sneeze+.02,2,'cymbalRec',[],.14,{variant:'soft'});
  bed(T.back,close,0,.8);
 }else if(name==='cards'){
  pickup(0);bed(.45,T.squeeze,0);
  // The shuffle: plucked violins up and down; the squeeze on the snare; the burst; the cards flutter down on the marimba.
  [0,2,4,7,9,7,4,2,0,2,4,7].forEach((d,i)=>put(T.shuffle+i*.1,.15,'violinsPizzRec',[into(d+7,'violinsPizzRec',shP)],.26,{pan:-.3+.05*i}));
  put(T.squeeze,T.burst-T.squeeze+.05,'snareRollRec',[],.24,{variant:'roll'});
  sfx(T.burst,'cards',.7,2);sfx(T.burst,'slideUp',.36,1);sparkle(T.burst+.05,.2);
  for(let i=0;i<10;i++)put(T.burst+.6+i*.17,.6,'marimbaRec',[into(9-i+7,'marimbaRec',shM)],.22,{pan:.3-.06*i});
  // The last card lands behind his ear: a clave and a low tuba that sags.
  const tu=into(0,'tubaRec',shT);put(T.ear,.2,'woodblockRec',[],.3,{variant:'claves',pan:-.1});put(T.ear+.35,.8,'tubaRec',[tu],.5,{pan:.08,glide:tu-4});
  bed(T.ear+1.3,close,4,.7);
 }else if(name==='cloth'){
  pickup(0);bed(.45,T.grab,0);
  // He stretches his arm: a drum roll grows; the yank, the slide whistle as things fly; the hat lands, the goblet rings on his head;
  // a little fanfare: he is quite proud of it.
  put(T.grab,T.yank-T.grab+.05,'snareRollRec',[],.26,{variant:'roll'});
  sfx(T.yank,'yank',.7,.6);put(T.yank,2,'cymbalRec',[],.16,{variant:'soft'});sfx(T.yank+.05,'slideUp',.42,1);
  put(T.hatLand,.2,'woodblockRec',[],.32,{variant:'claves'});
  put(T.goblet,1.6,'glockRec',[gl(14)],.34,{pan:-.1});put(T.goblet,1.4,'triangleRec',[],.2,{variant:'hit',pan:.2});
  put(T.tada,.34,'trumpetRec',[into(4,'trumpetRec',shR)],.4,{pan:.15});put(T.tada+.36,.7,'trumpetRec',[into(7,'trumpetRec',shR)],.42,{pan:.15});put(T.tada+.36,1,'bassdrumRec',[],.26,{variant:'soft'});
  bed(T.tada+1.2,close,0,.8);
 }else{
  // The final. A flourish; the walk to the cabinet on tuba and plucked violins; the door; a long drum roll while the cabinet shakes;
  // the door opens on the shoes alone (the slide whistle goes down); the hat grows (timpani and harp going up); TA-RA! (the trumpet,
  // the cymbal, the boing); the mess vanishes in sparkles; a last chorus of the two-step and the bow, on plucked and struck notes.
  pickup(0,.4);sparkle(.3,.18);bed(T.walk,T.enter+.4,0);
  put(T.shut,.2,'woodblockRec',[],.36,{variant:'claves'});put(T.shut+.16,.2,'woodblockRec',[],.26,{variant:'claves'});
  put(T.shake,T.open-T.shake,'snareRollRec',[],.26,{variant:'roll'});
  [0,.6,1.2,1.8].forEach((x,i)=>put(T.shake+x,.5,'timpaniRec',[into(i%2?4:0,'timpaniRec',shX)],.26+.05*i,{pan:0}));
  put(T.open,2.4,'cymbalRec',[],.2,{variant:'soft'});sfx(T.open+.15,'slideDown',.62);
  put(T.grow,1,'timpaniRec',[into(0,'timpaniRec',shX)],.36,{glide:into(0,'timpaniRec',shX)+5});
  for(let i=0;i<10;i++)put(T.grow+.1+i*.08,1.2,'harpRec',[into(i,'harpRec',shH)],.18+.015*i,{pan:-.2});
  sfx(T.tara-.05,'boing',.5);
  [[0,0,.18],[.18,4,.18],[.36,7,.7]].forEach(([x,d,l])=>put(T.tara+x,l,'trumpetRec',[into(d,'trumpetRec',shR),into(d+2,'trumpetRec',shR)],.46,{pan:.15}));
  put(T.tara+.36,3,'cymbalRec',[],.26,{variant:'soft'});put(T.tara+.36,1.2,'bassdrumRec',[],.38,{variant:'soft'});
  // one glockenspiel note as each trick's mess vanishes (mag-art.js), and the top note after the last
  glRun([0,2,4,5,7,9,11].slice(0,step.tricks.length+1).map(d=>d+7)).forEach((m,i)=>put(T.clean+.05+i*MG_VANISH,1.2,'glockRec',[m],.26,{pan:-.3+.1*i}));
  bed(T.clean,T.bow,0,.9);
  // the hat shrinks around him (the timpani slides down) and he hops out of it
  const tm=into(4,'timpaniRec',shX);put(T.shrink,.8,'timpaniRec',[tm],.3,{glide:tm-5});sfx(T.shrink+.4,'slideUp',.34,1);put(T.shrink+.8,.2,'woodblockRec',[],.3,{variant:'claves'});
  [4,5,6,7].forEach((d,i)=>put(T.shrink+.9+i*.18,.16,'clarinetRec',[into(d,'clarinetRec',shC)],.3,{pan:-.2}));
  const end=close;
  [[0,4],[.24,5],[.48,7]].forEach(([x,d])=>put(T.bow-.6+x,.2,'trumpetRec',[into(d,'trumpetRec',shR)],.36,{pan:.15}));
  cadence(end,1.1);put(end,1.6,'glockRec',[gl(7)],.24,{pan:-.1});put(end,2.4,'cymbalRec',[],.14,{variant:'soft'});
 }
 if(name!=='final')cadence(close);
 const plan={D,round,step,name,T,close,score:sc.done()};
 if(MG_CACHE.size>48)MG_CACHE.delete(MG_CACHE.keys().next().value);MG_CACHE.set(id,plan);return plan;}
export const mgScore=(variant,count,steps,duration)=>mgPlan(variant,count,steps,duration).score;

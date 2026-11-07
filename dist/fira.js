// La fira de llauna (CE44), 0.47: a fair of printed tin toys where every launch waits for the same signal. Three glass bulbs light
// one after another on the arch of the stall (no numbers, no words: light, a rising note and the pose of the tin figure together);
// when the third one lights, the press launches: the bitllot at the bitlles catalanes, the human cannonball, the wind-up rocket, the
// strength tester or the wind-up horse race. Each launch ends in a gag of its own and a tin medal hung on the stall; after 3, 5 or 7
// launches (the steps setting) comes the finale of the attraction, and the tin stage turns to the next one.
// Ready, steady, go: the moment to press is always announced in the same way, so the pupil can wait for it (Bean, 2011: the stage of
// one-switch timing). The calm before the bulbs lasts a different time at each launch, so that pressing in rhythm does not work. A
// press before the third bulb does nothing by default; the adult can make it restart the bulbs or launch slowly instead. After the
// third bulb the figure waits as long as it takes, or (fiPress) the bulbs go out after a while and the count starts again. Nothing
// gets harder by itself, and nothing falls on anybody.
// Five attractions × four lights (morning, afternoon, sunset, night with bulbs): twenty rounds. The music is a fair band of recorded
// instruments (VSCO-2 CE), a polka, a pasodoble, a waltz, a march and a galop, with foley from the banks of the suite; no organ.
import {escNote,escFit,escInto,escScore} from './escenari.js';

export const FI_ATTRS=Object.freeze(['bitlles','cano','coet','forca','cavallets']);
export const FI_LIGHTS=Object.freeze(['mati','tarda','posta','nit']);
export const FI_ROUNDS=20,FI_GAGS=6,FI_FINAL_GAG=6;
// Seconds: a launch with its gag, the finale, the tin stage turning to the next attraction, the first look at the fair, how long the
// third bulb rings before the ticking starts, and the bulbs going out (a restart or a timeout).
export const FI_SHOT=7.5,FI_FINAL=12,FI_TURN=2.4,FI_FIRST=1.5,FI_RING=.45,FI_OFF=.6;
// A press before the third bulb with «surt a poc a poc»: the launch goes at this speed.
export const FI_SLOW=.8;
// The settings: seconds between bulbs, the calm before them (a range), the early press, how long the figure waits after the third bulb.
export const FI_RHYTHMS=Object.freeze({lent:1.6,normal:1.1,rapid:.8});
export const FI_CALMS=Object.freeze({curta:Object.freeze([1.5,2.5]),variable:Object.freeze([1.5,4]),llarga:Object.freeze([3,6])});
export const FI_EARLY=Object.freeze(['res','reinicia','lent']);
export const FI_WAITS=Object.freeze({never:0,long:10,medium:6,short:3});
// The gags (six per attraction and the finale) and the moments the picture and the music share, in seconds from the press.
// Every launch: the release (rel), the flight, the impact (hit), the reaction, and back to the start before the end.
export const FI_GAG_NAMES=Object.freeze({
 bitlles:Object.freeze(['domino','bitlla','fanal','gos','coto','tornen','rotllana']),
 cano:Object.freeze(['xarxa','timbal','palla','trampoli','elefant','paraigua','cadira']),
 coet:Object.freeze(['paracaigudes','lluna','estrella','fum','tirabuixo','capsa','pluja']),
 forca:Object.freeze(['mitja','campana','acordio','niu','gronxa','fluix','llums']),
 cavallets:Object.freeze(['nas','flor','empat','salt','enrere','corda','carrussel'])});
export const FI_T=Object.freeze({
 bitlles:Object.freeze({rel:.3,hit:1.25,cheer:2.7,reset:6.5,
  domino:Object.freeze({fall:.26}),bitlla:Object.freeze({wobble:1.4,still:4}),fanal:Object.freeze({lamp:1.15,catch:2.6}),
  gos:Object.freeze({land:1.1,run:1.6,grab:2.4,out:3.2,back:4.2,drop:5.4}),coto:Object.freeze({roll:1.4,stick:3}),
  tornen:Object.freeze({up:2.6,gap:.45}),rotllana:Object.freeze({rise:2.6,dance:3.2,bow:9.5})}),
 cano:Object.freeze({rel:.25,hit:1.5,cheer:3,reset:6.6,
  xarxa:Object.freeze({b1:1.5,b2:2.15,b3:2.65,stand:3.1}),timbal:Object.freeze({b1:1.5,b2:2.1,b3:2.6,stand:3.1}),palla:Object.freeze({out:3.2}),
  trampoli:Object.freeze({back:2.9,inside:2.9,dizzy:3.4}),elefant:Object.freeze({catch:1.35,down:3.4}),paraigua:Object.freeze({open:2.3,land:4.6}),
  cadira:Object.freeze({wobble:2.2,still:5.2,bow:8})}),
 coet:Object.freeze({rel:.2,hit:1.6,cheer:3,reset:6.6,
  paracaigudes:Object.freeze({top:1.2,open:1.5,land:4.4}),lluna:Object.freeze({moon:1.6,down:4,land:5}),estrella:Object.freeze({out:1.2,back:2.6,land:4}),
  fum:Object.freeze({loop:1.2,land:5.9}),tirabuixo:Object.freeze({top:2.4,land:4.6}),capsa:Object.freeze({top:1.4,into:3,shut:3.1,open:4.6,hop:4.8}),
  pluja:Object.freeze({moon:2.2,lid:3,rain:3.4,back:7.4,land:8.8,bow:9.4})}),
 forca:Object.freeze({rel:.2,hit:.35,cheer:2.4,reset:6.6,
  mitja:Object.freeze({top:1.2,down:1.6,shrug:3.6}),campana:Object.freeze({ring:1.25}),acordio:Object.freeze({grow:.9,ring:1.9,back:3.2}),
  niu:Object.freeze({out:1.3,back:2.8,nest:3.6}),gronxa:Object.freeze({ring:1.25,swing:1.35}),fluix:Object.freeze({hop:.55,land:1.5,creep:2}),
  llums:Object.freeze({ring:1.25,lights:1.6,melody:3.2,bow:9})}),
 cavallets:Object.freeze({rel:.25,hit:4.4,cheer:4.6,reset:6.4,
  nas:Object.freeze({}),flor:Object.freeze({stop:1.4,go:3}),empat:Object.freeze({}),salt:Object.freeze({jump:2,land:2.8}),
  enrere:Object.freeze({turn:4.6,home:6}),corda:Object.freeze({slow:1.6,stop:2.4,push:2.9}),carrussel:Object.freeze({turn:4.8,ride:5.8,bow:10})})});
// Keys of the fair band: B flat, C, D, E flat and F, one per attraction, moved up or down a step with the light of the round.
const FI_KEYS=Object.freeze([58,60,62,63,65]);
const fiV=variant=>((Math.round(variant||0)%FI_ROUNDS)+FI_ROUNDS)%FI_ROUNDS;
const fiHash=(a,b,c)=>{let h=(a*374761393+b*668265263+c*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
// The order of the six gags of an attraction: a fixed shuffle of its own, turned and reversed in each of its four rounds, so that the
// four rounds of the same attraction start with four different gags.
function fiBase(a){const o=[0,1,2,3,4,5];for(let i=5;i>0;i--){const j=Math.floor(fiHash(a+11,i,5)*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}
const FI_TURNS=Object.freeze([0,2,4,3]);
// The round: attraction (5) and light (4); every pair once in twenty rounds, and two rounds in a row change both.
export function fiRound(variant){const v=fiV(variant),a=v%5,light=v%4,k=Math.floor(v/5),b=fiBase(a),o=b.map((_,i)=>b[(i+FI_TURNS[k])%6]);if(k%2)o.reverse();
 return {v,attr:a,name:FI_ATTRS[a],light,lightName:FI_LIGHTS[light],order:o,key:FI_KEYS[a]+[0,2,-1,-3][light]};}
export const fiSteps=s=>Math.max(1,Math.min(7,Math.round(s?.steps||5)));
export const fiRhythm=s=>FI_RHYTHMS[s?.fiRhythm]||FI_RHYTHMS.normal;
export const fiCalmRange=s=>FI_CALMS[s?.fiCalm]||FI_CALMS.variable;
export const fiEarly=s=>FI_EARLY.includes(s?.fiEarly)?s.fiEarly:'res';
export const fiWaitLimit=s=>FI_WAITS[s?.fiPress]||0;
// The round the fair starts with: the first attraction of the setting (or one at random), in the morning light.
export function fiStart(s){const f=s?.fiFirst;const a=FI_ATTRS.indexOf(f);return a>=0?a:Math.floor(Math.random()*5);}
// The calm before the bulbs, different at each launch and each restart.
export function fiCalm(s,variant,slot,again=0){const [a,b]=fiCalmRange(s);return a+(b-a)*fiHash(fiV(variant)+1,slot+3,again+7);}
// The gag of a launch: the slot-th of the round; the last launch of the round is the finale.
export function fiGagOf(variant,slot,steps){if(slot+1>=steps)return FI_FINAL_GAG;return fiRound(variant).order[slot%6];}

// ── The fair, kept in the game ───────────────────────────────────────────────────────────────────────────────────────────
// fiNow: a clock of its own (seconds). fiPhase: 'calm' (the figure plays, the bulbs are off), 'count' (the bulbs light one after
// another), 'go' (the three are lit: the figure waits for the press), 'launch' (the gag). fiAt: when the phase began; fiCalmEnd: when
// the count will start; fiOut: the gags already done in this round (their medals hang on the stall); fiShot: the launch under way;
// fiAgain: restarts and timeouts since the last launch; fiOff: when the bulbs went out (they fade); fiFrom: the round being left
// (the tin stage turns from it to the new one); fiLooped: the ticking has started.
export function fiEnsure(game,s){if(game.fiNow===undefined){game.fiNow=0;game.fiOut=[];game.fiAgain=0;game.fiShot=null;game.fiFrom=null;game.fiOff=null;game.fiLit=0;
 if(game.variant===undefined)game.variant=fiStart(s);fiRest(game,s,FI_FIRST);}return game;}
function fiRest(game,s,extra=0){game.fiPhase='calm';game.fiAt=game.fiNow;game.fiLooped=false;game.fiCalmEnd=game.fiNow+extra+fiCalm(s,game.variant,game.fiOut.length,game.fiAgain);}
// How many bulbs are lit now (0 to 3), and how far the newest has lit (0 to 1, a fade of a quarter of a second).
export function fiBulbs(game,s){if(!game||game.fiPhase===undefined)return {n:0,u:0,off:0};const I=fiRhythm(s),pt=game.fiNow-game.fiAt;
 if(game.fiPhase==='count'){const n=Math.min(3,1+Math.floor(pt/I));return {n,u:Math.min(1,(pt-(n-1)*I)/.25),off:0};}
 if(game.fiPhase==='go')return {n:3,u:1,off:0};
 if(game.fiPhase==='launch')return {n:3,u:1,off:Math.min(1,(game.fiNow-game.fiAt)/1.2)};
 const off=game.fiOff?Math.min(1,(game.fiNow-game.fiOff.at)/FI_OFF):1;return {n:game.fiOff?game.fiOff.n:0,u:1,off};}
// A frame: returns 'count' when the bulbs start, 'loop' when the ticking starts after the third bulb, 'rest' when the bulbs go out
// because nobody pressed (fiPress), or null.
export function fiTick(game,s,dt){fiEnsure(game,s);game.fiNow+=dt;const I=fiRhythm(s);
 if(game.fiPhase==='calm'&&game.fiNow>=game.fiCalmEnd){game.fiPhase='count';game.fiAt=game.fiNow;game.fiOff=null;return 'count';}
 if(game.fiPhase==='count'&&game.fiNow-game.fiAt>=2*I){game.fiPhase='go';game.fiAt=game.fiNow;return null;}
 if(game.fiPhase==='go'){const pt=game.fiNow-game.fiAt;if(!game.fiLooped&&pt>=FI_RING){game.fiLooped=true;return 'loop';}
  const L=fiWaitLimit(s);if(L>0&&pt>=L){game.fiOff={at:game.fiNow,n:3};game.fiAgain++;fiRest(game,s);return 'rest';}}
 return null;}
// A press. In 'go': the launch (its gag). Before the third bulb: nothing (null), the bulbs out and the calm again ('restart'), or the
// same launch, slower ('lent'). During a launch: nothing.
export function fiPress(game,s){fiEnsure(game,s);const ph=game.fiPhase;if(ph==='launch')return null;
 let slow=false;if(ph!=='go'){const e=fiEarly(s);if(e==='res')return null;if(e==='reinicia'){if(ph==='count'){game.fiOff={at:game.fiNow,n:fiBulbs(game,s).n};game.fiAgain++;fiRest(game,s);return 'restart';}return null;}slow=true;}
 const k=game.fiOut.length,steps=fiSteps(s),gag=fiGagOf(game.variant,k,steps),final=gag===FI_FINAL_GAG;
 game.fiShot={gag,slot:k,final,slow,at:game.fiNow,speed:slow?FI_SLOW:1};game.fiPhase='launch';game.fiAt=game.fiNow;game.fiAgain=0;game.fiOff=null;return game.fiShot;}
// How long a launch lasts (a slow one, longer).
export const fiSpan=shot=>(shot?.final?FI_FINAL:FI_SHOT)/(shot?.speed||1);
// The end of a launch: its medal hangs on the stall. After the finale the next round is another attraction in another light.
export function fiDone(game,s){fiEnsure(game,s);const v=game.fiShot;if(!v)return false;game.fiOut.push(v.gag);game.fiShot=null;
 if(v.final){game.fiFrom={variant:game.variant,out:game.fiOut.slice(),at:game.fiNow};game.variant=(fiV(game.variant)+1)%FI_ROUNDS;game.fiOut=[];game.completed=(game.completed||0)+1;fiRest(game,s,FI_TURN);}
 else fiRest(game,s);
 return true;}

// ── The music ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Loudness against the other stories (velocity is quadratic in the sampler).
export const FI_LOUD=1.5;
const FI_CACHE=new Map();
// The five bands, levelled to one another (measured with tools/fira-audio.mjs: every launch near −31 LUFS).
const FI_GAIN=Object.freeze({bitlles:1,cano:1.1,coet:1.05,forca:1.03,cavallets:1.17});
const fiDeg=(key,d)=>escNote(key,'major',d);
// The count: one note on the marimba for each bulb, going up a third each time (the same three notes in the whole activity, moved to
// the key of the round); the third is doubled by a soft timpani. D: seconds until the ticking takes over.
export function fiCountScore(variant,s){const r=fiRound(variant),I=fiRhythm(s),D=2*I+1,sc=escScore(D),sh=escFit([0,2,4].map(d=>fiDeg(r.key,d)),'marimbaRec',72);
 [0,2,4].forEach((d,i)=>sc.add(i*I,.9,'marimbaRec',[escInto(fiDeg(r.key,d)+sh,'marimbaRec')],Math.min(1,(.24+.04*i)*FI_LOUD*1.22),{pan:.1}));
 sc.add(2*I,.8,'timpaniRec',[escInto(fiDeg(r.key,0),'timpaniRec')],.22*FI_LOUD*1.22);
 return {score:sc.done(),D};}
// The wait after the third bulb: the ticking of the clockwork, very soft (claves, tic and tac), every FI_TICK seconds.
export const FI_TICK=1.2;
export function fiTickScore(){const sc=escScore(FI_TICK);sc.add(0,.2,'woodblockRec',[],.1,{variant:'claves',pan:-.2});sc.add(FI_TICK/2,.2,'woodblockRec',[],.078,{variant:'claves',pan:.2});return sc.done();}
// The band of each attraction: its dance and the instruments that carry the tune.
const FI_DANCE=Object.freeze({
 bitlles:Object.freeze({beat:.27,meter:2,tune:[4,2,0,2,4,4,4,-1,2,2,2,-1,4,7,7,-1],lead:'clarinetRec',bass:'tubaRec',off:'violinsPizzRec'}),
 cano:Object.freeze({beat:.3,meter:2,tune:[0,4,7,7,9,7,4,-1,5,4,2,4,0,-1,0,-1],lead:'trumpetRec',bass:'tubaRec',off:'snareRec'}),
 coet:Object.freeze({beat:.32,meter:3,tune:[4,-1,7,9,-1,7,4,-1,2,0,-1,-1],lead:'fluteRec',bass:'celliPizzRec',off:'violinsPizzRec'}),
 forca:Object.freeze({beat:.3,meter:2,tune:[0,-1,4,-1,7,-1,4,2,0,-1,4,-1,2,-1,-1,-1],lead:'hornRec',bass:'tubaRec',off:'bassdrumRec'}),
 cavallets:Object.freeze({beat:.2,meter:2,tune:[7,4,7,4,9,7,4,2,4,2,4,2,0,-1,0,-1],lead:'clarinetRec',bass:'tubaRec',off:'woodblockRec'})});
// A launch: the release, the gag's own sounds, a phrase of the attraction's dance from the reaction on, and a plucked cadence.
// The finale: the whole dance and the bow. Times are divided by the speed (a slow launch).
export function fiPlan(variant,gag,speed=1){const final=gag===FI_FINAL_GAG,D=(final?FI_FINAL:FI_SHOT)/speed,id=`${fiV(variant)}|${gag}|${speed}`;if(FI_CACHE.has(id))return FI_CACHE.get(id);
 const r=fiRound(variant),A=r.name,T=FI_T[A],name=FI_GAG_NAMES[A][gag],G=T[name]||{},deg=d=>fiDeg(r.key,d),sc=escScore(D),sp=speed;
 const gain=FI_GAIN[A],put=(t,len,inst,midi,vel,x={})=>sc.add(t/sp,len,inst,midi,Math.min(1,vel*FI_LOUD*gain),x);
 const fx=(t,inst,v,vel,len=1.4,x={})=>put(t,len,inst,[],vel*.7,{variant:v,...x});
 const fit=(ds,inst,c)=>escFit(ds.map(deg),inst,c),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const sh={ma:fit([0,4,7],'marimbaRec'),gl:fit([0,7],'glockRec'),ha:fit([0,7],'harpRec'),ce:fit([0,4],'celliPizzRec'),pz:fit([0,4,7],'violinsPizzRec'),cl:fit([0,4,7],'clarinetRec'),
  tr:fit([0,4,7],'trumpetRec',72),fl:fit([0,4,7],'fluteRec',79),ho:fit([0,4],'hornRec',57),tu:fit([0,4],'tubaRec'),ti:fit([0],'timpaniRec')};
 const lead=(inst,d,t,len,vel,x={})=>put(t,len,inst,[into(d,inst,sh[{clarinetRec:'cl',trumpetRec:'tr',fluteRec:'fl',hornRec:'ho'}[inst]]??0)],vel,x);
 const glRun=(t,ds,vel=.18,step=.07)=>{const ms=ds.map(d=>deg(d)+sh.gl);while(Math.max(...ms)>103)ms.forEach((m,i)=>ms[i]=m-12);ms.forEach((m,i)=>put(t+i*step,.7,'glockRec',[m],vel,{pan:-.15+.06*i}));};
 const harpRun=(t,up=true,vel=.2)=>[0,2,4,7,9].map(d=>up?d:9-d).forEach((d,i)=>put(t+i*.06,1,'harpRec',[into(d+7,'harpRec',sh.ha)],vel,{pan:-.1}));
 const cadence=(t,vel=1)=>{put(t,1.6,'harpRec',[0,2,4,7].map(x=>into(x,'harpRec',sh.ha)),.3*vel,{strum:.04,pan:-.2});put(t,1.1,'celliPizzRec',[into(0,'celliPizzRec',sh.ce)],.4*vel,{pan:.12});put(t,.9,'marimbaRec',[into(4,'marimbaRec',sh.ma),into(7,'marimbaRec',sh.ma)],.26*vel,{pan:.2});};
 // The dance of the attraction from t0 to t1 (seconds before the speed), the tune entering after a bar.
 const dance=(t0,t1,vel=1,from=0)=>{const Dn=FI_DANCE[A],B=Dn.beat,M=Dn.meter;let i=0;for(let t=t0;t<t1-.05;t+=B,i++){const beat=i%M,bar=Math.floor(i/M),ch=[0,0,4,4,0,3,4,0][bar%8];
   if(beat===0)put(t,B*.85,Dn.bass,[into(ch+(bar%2?4:0),Dn.bass,Dn.bass==='tubaRec'?sh.tu:sh.ce)],.36*vel,{pan:.06});
   else if(Dn.off==='violinsPizzRec')put(t,B*.6,'violinsPizzRec',[ch+2,ch+4,ch+7].map(x=>into(x,'violinsPizzRec',sh.pz)),.2*vel,{pan:-.15,strum:.01});
   else if(Dn.off==='snareRec')put(t,.2,'snareRec',[],.09*vel,{variant:'hit',pan:.2});
   else if(Dn.off==='bassdrumRec')put(t,.3,'bassdrumRec',[],.14*vel,{pan:0});
   else if(Dn.off==='woodblockRec')put(t,.2,'woodblockRec',[],.12*vel,{variant:'claves',pan:.2});
   if(Dn.off==='woodblockRec'&&beat===0)put(t+B/2,.2,'woodblockRec',[],.09*vel,{variant:'claves',pan:-.2});
   const k=(i+from)%Dn.tune.length,d=Dn.tune[k];if(i>=M&&d>=0)lead(Dn.lead,d,t,B*.9,.24*vel,{pan:-.2});}};
 const rel=T.rel,hit=T.hit,cheer=T.cheer;
 // the press: the fourth note of the count, an octave over the first (preparats, llestos... ja!)
 put(0,.8,'marimbaRec',[into(7,'marimbaRec',sh.ma)],.3,{pan:.1});
 if(A==='bitlles'){
  fx(rel,'masiaRec','whoosh',.5,1);
  if(name==='fanal'){fx(G.lamp,'toonRec','clink',.6);glRun(G.lamp+.02,[7,9]);fx(G.lamp+.1,'masiaRec','whoosh',.35,1);fx(G.catch,'woodblockRec','claves',.4,.3);fx(G.catch+.4,'masiaRec','riallagrup',.4,1.8);}
  else if(name==='gos'){fx(G.land,'masiaRec','aterratge',.4);fx(G.run,'vgRec','lladruc',.45,1);fx(G.run+.1,'masiaRec','passescorrent',.4,1.5);fx(G.back,'masiaRec','passescorrent',.4,1.5);fx(G.drop,'woodblockRec','claves',.35,.3);fx(G.drop+.3,'vgRec','lladruc',.35,1);}
  else{fx(hit,'toonRec','clatter',.7,1.6);
   if(name==='domino')for(let i=0;i<6;i++)put(hit+i*G.fall,.25,'woodblockRec',[],.22,{variant:'claves',pan:-.2+.08*i});
   if(name==='bitlla'){for(let i=0;i<9;i++)put(G.wobble+i*.28,.2,'woodblockRec',[],.2*(1-i/10),{variant:'claves',pan:i%2?.2:-.2});glRun(G.still,[0,4,7,11]);fx(G.still+.2,'masiaRec','riallagrup',.45,1.8);}
   if(name==='coto'){fx(G.roll,'masiaRec','relliscada',.35,1.4);fx(G.stick,'toonRec','plop',.6);fx(G.stick+.3,'masiaRec','riallagrup',.4,1.8);}
   if(name==='tornen')for(let i=0;i<6;i++){fx(G.up+i*G.gap,'toonRec','boing',.42,.6);put(G.up+i*G.gap,.4,'marimbaRec',[into(i,'marimbaRec',sh.ma)],.2);}
   if(name==='rotllana'){harpRun(G.rise);fx(G.rise,'toonRec','boing',.4,.6);}}
 }else if(A==='cano'){
  put(0,.5,'timpaniRec',[into(0,'timpaniRec',sh.ti)],.2);fx(.08,'fireRec','boom',.45,1.2);fx(.1,'toonRec','poof',.6);fx(rel+.05,'masiaRec','whoosh',.45,1);
  if(name==='xarxa'||name==='timbal'){for(const [i,t] of [G.b1,G.b2,G.b3].entries()){if(name==='xarxa')fx(t,'toonRec','boing',.5-.1*i,.7);else{put(t,.4,'bassdrumRec',[],.4-.08*i);put(t,.4,'tubaRec',[into(0,'tubaRec',sh.tu)],.3-.06*i);}}}
  if(name==='palla'){fx(hit,'masiaRec','poffpalla',.65,1.4);fx(G.out,'toonRec','yank',.4,.6);fx(G.out+.4,'masiaRec','riallagrup',.4,1.8);}
  if(name==='trampoli'){fx(hit,'toonRec','boing',.55,.7);fx(hit+.1,'toonRec','slideDown',.4,1.4);fx(G.inside,'masiaRec','bonk',.4);[9,7,9,7].forEach((d,i)=>put(G.dizzy+i*.18,.6,'glockRec',[deg(d)+sh.gl],.1));}
  if(name==='elefant'){[0,4,7].forEach((d,i)=>put(G.catch-.2+i*.15,i===2?.6:.15,'hornRec',[into(d,'hornRec',sh.ho)],.3,{pan:.2}));fx(G.down,'masiaRec','aterratge',.35);}
  if(name==='paraigua'){fx(G.open,'toonRec','inflate',.5,1);[9,7,5,4,2,0].forEach((d,i)=>put(G.open+.4+i*.32,.4,'fluteRec',[into(d,'fluteRec',sh.fl)],.2,{pan:-.2}));fx(G.land,'toonRec','boing',.35,.6);}
  if(name==='cadira'){put(G.wobble,2.8,'snareRollRec',[],.12,{variant:'roll'});put(G.still,.6,'cymbalRec',[],.18,{variant:'soft'});[0,4,7].forEach((d,i)=>put(G.still+i*.16,i===2?.6:.14,'trumpetRec',[into(d,'trumpetRec',sh.tr)],.28));}
 }else if(A==='coet'){
  fx(rel,'fireRec','launch',.5,1.2);
  if(name==='paracaigudes'){fx(G.open,'toonRec','inflate',.45,1);harpRun(G.open+.3,false,.16);fx(G.land,'masiaRec','aterratge',.3);}
  if(name==='lluna'){glRun(G.moon,[0,2,4,7,9,11],.16,.18);fx(G.land,'toonRec','boing',.35,.6);}
  if(name==='estrella'){put(G.back,.8,'triangleRec',[],.16,{variant:'hit'});fx(G.back+.05,'toonRec','clink',.4);glRun(G.back+.1,[7,11,14]);fx(G.land,'toonRec','boing',.35,.6);}
  if(name==='fum'){for(let i=0;i<6;i++)fx(G.loop+i*.55,'toonRec','poof',.22,.8);fx(G.land,'toonRec','boing',.35,.6);}
  if(name==='tirabuixo'){fx(.6,'toonRec','slideUp',.4,1);fx(G.top,'toonRec','slideDown',.4,1.4);fx(G.land,'toonRec','boing',.35,.6);}
  if(name==='capsa'){fx(G.into,'toonRec','slideDown',.35,1);fx(G.shut,'masiaRec','tamboret',.4);fx(G.open,'woodblockRec','claves',.35,.3);fx(G.hop,'toonRec','boing',.45,.6);}
  if(name==='pluja'){glRun(G.moon,[0,2,4,7],.16,.12);fx(G.lid,'woodblockRec','claves',.35,.3);fx(G.rain,'fireRec','shimmer',.3,2.5);for(let i=0;i<10;i++)put(G.rain+.3+i*.33,.8,'glockRec',[deg([7,9,11,14,11,9,7,4,7,11][i])+sh.gl],.12,{pan:-.3+.06*i});fx(G.land,'toonRec','boing',.35,.6);}
 }else if(A==='forca'){
  fx(hit,'masiaRec','bonk',.6);put(hit,.5,'timpaniRec',[into(0,'timpaniRec',sh.ti)],.24);
  if(name==='mitja'){fx(hit+.05,'toonRec','slideUp',.35,1);fx(G.down,'toonRec','slideDown',.35,1.4);[2,1].forEach((d,i)=>put(G.shrug+i*.25,.35,'clarinetRec',[into(d,'clarinetRec',sh.cl)],.2));}
  if(['campana','gronxa','llums'].includes(name)){fx(hit+.05,'toonRec','slideUp',.4,1);fx(G.ring,'masiaRec','campaneta',.6,1.7);glRun(G.ring+.02,[7,11,14]);}
  if(name==='gronxa')for(let i=1;i<3;i++)fx(G.swing+i*.8,'masiaRec','campaneta',.4-.08*i,1.7);
  if(name==='acordio'){fx(G.grow,'toonRec','stretch',.45,1);fx(G.ring,'masiaRec','campaneta',.6,1.7);fx(G.back,'toonRec','boing',.45,.6);}
  if(name==='niu'){fx(hit+.05,'toonRec','slideUp',.45,1);fx(G.back,'toonRec','slideDown',.35,1.4);fx(G.nest,'masiaRec','pop',.4);[11,14,11,14].forEach((d,i)=>put(G.nest+.3+i*.14,.25,'fluteRec',[into(d,'fluteRec',sh.fl)],.14,{pan:.25}));}
  if(name==='fluix'){fx(G.hop,'toonRec','boing',.5,.6);fx(G.land,'masiaRec','aterratge',.35);fx(G.creep,'toonRec','stretch',.25,1);}
  if(name==='llums'){for(let i=0;i<8;i++)put(G.lights+i*.18,.6,'glockRec',[deg(i)+sh.gl],.12,{pan:-.2+.05*i});const mel=[4,4,5,7,7,5,4,2,0,0,2,4,4,2,2];mel.forEach((d,i)=>put(G.melody+i*.3,.5,'glockRec',[deg(d+7)+sh.gl],.16));}
 }else{
  fx(0,'woodblockRec','claves',.35,.3);fx(rel,'toonRec','yank',.35,.6);
  const trotEnd=name==='enrere'?G.home:hit;for(let t=rel+.1;t<trotEnd-.2;t+=1.6)fx(t,'masiaRec','trot',.32,1.9);
  if(name==='flor'){fx(G.stop,'masiaRec','mastegar',.4,1.2);}
  if(name==='salt'){fx(G.jump,'toonRec','slideUp',.4,1);fx(G.land,'toonRec','boing',.4,.6);}
  if(name==='enrere'){fx(G.turn,'toonRec','slideDown',.35,1);}
  if(name==='corda'){fx(G.slow,'toonRec','stretch',.3,1);fx(G.push,'toonRec','boing',.35,.6);}
  put(hit,.8,'triangleRec',[],.16,{variant:'hit'});[0,4,7].forEach((d,i)=>put(hit+.02+i*.14,i===2?.5:.12,'trumpetRec',[into(d,'trumpetRec',sh.tr)],.24));
  if(name==='carrussel')harpRun(G.turn,true,.2);
 }
 // The band: a phrase of the dance during the flight and the reaction (only in the finale, also under the gag).
 if(final){dance(A==='cavallets'?G.ride:hit+.6,(D*sp)-1.8,1,0);glRun(T.cheer+2,[0,4,7,11],.14);}
 else dance(cheer-.2,D*sp-1.7,.85,gag*4);
 cadence(D*sp-1.6,.8);
 const plan={name,score:sc.done(),D};FI_CACHE.set(id,plan);if(FI_CACHE.size>200)FI_CACHE.delete(FI_CACHE.keys().next().value);return plan;}
export const fiScore=(variant,gag,speed=1)=>fiPlan(variant,gag,speed).score;

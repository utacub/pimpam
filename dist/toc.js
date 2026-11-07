// Toc, toc! Qui hi ha? (CE30), 0.22: a street from a humour comic of the 1950s, in pen line and flat colours. A front door stands in
// the middle of a house. After a while somebody knocks at it three times: the door shakes, light comes from under it and the shadow
// of two feet shows. The knocking comes back every few seconds until the pupil presses; then the door opens and a visitor comes out
// and does something funny (the giant who hardly fits through the door, the big-headed figure stuck in the frame, a band that never
// ends, the snowman who melts in the warmth of the house, the astronaut who floats out, the cook whose cake grows and sags, the
// dancer who spins until she is dizzy), and stays in the street. A press before the knock does nothing at all: no sound, no mark, no
// word. 3, 5 or 7 visits (the steps setting) make a round; at the last one all the visitors dance together in the street and bow, and
// the next round is another house at another time of day. The adult sets how long the wait before the knock is (tcWait) and whether
// the visitor waits at the door until the press (the default) or goes away after a while and knocks again later (tcLeave); nothing
// gets harder by itself.
// Wait, then press (stage 4 of the switch progression road map): the cue waits for the pupil, unlike El far, where the moment passes.
// Music (original): each visitor has a short tune of their own on recorded instruments (VSCO-2 CE), with the knock, the door and a
// few cartoon sounds generated with ElevenLabs; the party is a polka for the whole street. Every piece ends on plucked or struck
// notes.
import {escNote,escFit,escInto,escScore} from './escenari.js';

export const TC_VISITORS=Object.freeze(['giant','bighead','band','snowman','astronaut','cook','dancer']);
export const TC_ROUNDS=20,TC_HOUSES=5,TC_TIMES=4;
// Seconds: a visit, the last visit with the party, how often the knocking comes back, the knocks inside the knocking sound, the
// moment the house is shown before the first wait (on opening, and when a round changes the house) and the visitor walking away.
export const TC_VISIT=8.5,TC_FINAL=15,TC_KNOCK_EVERY=4,TC_FIRST=1.5,TC_LEAVING=1.4;
export const TC_KNOCKS=Object.freeze([.15,.35,.55]);
// The wait before the knock (a range in seconds; tcWait), and how long the visitor waits at the door before going away (tcLeave;
// 0: until the press).
export const TC_WAITS=Object.freeze({short:Object.freeze([2,4]),medium:Object.freeze([4,7]),long:Object.freeze([7,10])});
export const TC_LEAVES=Object.freeze({never:0,long:10,medium:6,short:3});
// The moments of a visit, in seconds from the press. The picture (toc-art.js) and the music follow the same times. door: what every
// visit shares (the door opens; the visitor walks to a place in the street; the door shuts). Then the gag of each visitor, and the
// party of the last visit.
export const TC_T=Object.freeze({
 door:Object.freeze({open:0,wide:.45,walk:5.8,placed:6.9,shut:7,closed:7.35}),
 giant:Object.freeze({foot:.55,stomp:1.05,stomp2:1.6,squeeze:2.15,pop:3.15,rise:3.3,tall:4.3,bow:4.7,up:5.4}),
 bighead:Object.freeze({out:.55,stuck:1.15,tug:1.9,pop:3,spin:3.05,set:3.95,hop:4.5}),
 band:Object.freeze({m1:.55,m2:1.25,m3:1.95,m4:2.65,stuck:3.1,turn:3.7,through:4.2,play:4.6}),
 snowman:Object.freeze({glide:.55,warm:1.6,melt:2.1,puddle:3.3,shiver:3.55,freeze:4.2,proud:4.85}),
 astronaut:Object.freeze({float:.55,flip:2.3,land:3.9,wave:4.5}),
 cook:Object.freeze({out:.55,grow:1.45,wobble:2.55,sag:3.35,splat:3.85,lick:4.6}),
 dancer:Object.freeze({twirl:.55,dizzy:2.65,sit:4,up:4.7}),
 final:Object.freeze({party:7.4,bow:12.6,end:13.5})});
// The twenty rounds: the order of the seven visitors (indices into TC_VISITORS). Two rounds in a row (and the last with the first)
// never share any of their first three visitors, so three presses always bring new faces; every visitor comes first two or three
// times.
const TC_ORDERS=Object.freeze([[0,1,3,4,2,5,6],[5,2,4,1,6,3,0],[3,6,1,0,4,2,5],[5,0,4,3,2,6,1],[1,6,2,3,0,5,4],[4,3,5,6,1,0,2],[2,1,0,6,4,5,3],
 [6,4,3,1,5,0,2],[0,1,2,6,3,5,4],[6,4,3,0,5,1,2],[1,0,2,3,6,4,5],[3,4,6,5,2,0,1],[1,5,2,3,4,6,0],[4,0,6,2,5,3,1],[2,5,1,4,6,3,0],[0,4,6,3,5,2,1],
 [3,1,5,2,0,4,6],[2,0,4,1,6,5,3],[5,3,1,6,2,0,4],[4,6,2,1,5,0,3]].map(o=>Object.freeze(o)));
// Keys of a street band: C, F, G, D and B flat.
const TC_KEYS=Object.freeze([60,65,67,62,58]);
const tcV=variant=>((Math.round(variant||0)%TC_ROUNDS)+TC_ROUNDS)%TC_ROUNDS;
// House (5) and time of day (4: morning, noon, sunset, night): every pair once in twenty rounds, and two rounds in a row change both.
export function tcRound(variant){const v=tcV(variant);return {v,order:TC_ORDERS[v],house:v%TC_HOUSES,time:v%TC_TIMES,key:TC_KEYS[(v*3)%5]};}
export const tcSteps=s=>Math.max(1,Math.min(7,Math.round(s?.steps||5)));
export const tcWaitRange=s=>TC_WAITS[s?.tcWait]||TC_WAITS.short;
export const tcLeave=s=>TC_LEAVES[s?.tcLeave]||0;
const tcHash=(a,b,c)=>{let h=(a*374761393+b*668265263+c*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
// The wait before a knock, in seconds: different at each visit and each time the visitor comes back, within the range of tcWait.
export function tcWait(s,variant,visit,again=0){const [a,b]=tcWaitRange(s);return a+(b-a)*tcHash(tcV(variant)+1,visit+1,again+3);}

// ── The street, kept in the game ─────────────────────────────────────────────────────────────────────────────────────────
// tcNow: a clock of its own (seconds), running every frame, also between presses. tcPhase: 'wait' (the door is shut, nobody is
// there), 'knock' (somebody knocks and waits), 'leave' (they walk away; tcLeave), 'visit' (the door is open). tcAt: when the phase
// began; tcCue: when the knocking will begin; tcOut: the visitors already in the street; tcVisit: the visit under way; tcAgain: how
// many times the visitor has gone away without being let in; tcFrom: the round being left, which fades away while the new house shows.
export function tcEnsure(game,s){if(game.tcNow===undefined){game.tcNow=0;game.tcOut=[];game.tcAgain=0;game.tcVisit=null;game.tcFrom=null;if(game.variant===undefined)game.variant=0;tcRest(game,s,TC_FIRST);}return game;}
function tcRest(game,s,extra=0){game.tcPhase='wait';game.tcAt=game.tcNow;game.tcCue=game.tcNow+extra+tcWait(s,game.variant,game.tcOut.length,game.tcAgain);}
// A frame: returns 'knock' when the knocking begins, 'leave' when the visitor gives up and goes, 'rest' when the door is quiet again.
export function tcTick(game,s,dt){tcEnsure(game,s);game.tcNow+=dt;
 if(game.tcPhase==='wait'&&game.tcNow>=game.tcCue){game.tcPhase='knock';game.tcAt=game.tcNow;return 'knock';}
 if(game.tcPhase==='knock'){const L=tcLeave(s);if(L>0&&game.tcNow-game.tcAt>=L){game.tcPhase='leave';game.tcAt=game.tcNow;game.tcAgain++;return 'leave';}}
 if(game.tcPhase==='leave'&&game.tcNow-game.tcAt>=TC_LEAVING){tcRest(game,s);return 'rest';}
 return null;}
// A press: if somebody is knocking, the door opens and the next visitor of the round comes out; at any other moment nothing happens
// (null). The last visit of the round (the steps setting) is the party.
export function tcPress(game,s){tcEnsure(game,s);if(game.tcPhase!=='knock')return null;const r=tcRound(game.variant),k=game.tcOut.length;
 game.tcVisit={who:r.order[k%7],slot:k,final:k+1>=tcSteps(s),at:game.tcNow};game.tcPhase='visit';game.tcAt=game.tcNow;game.tcAgain=0;return game.tcVisit;}
// The end of a visit: the visitor stays in the street. After the party, the next round is another house and the street is empty.
export function tcDone(game,s){tcEnsure(game,s);const v=game.tcVisit;if(!v)return false;game.tcOut.push(v.who);game.tcVisit=null;
 if(v.final){game.tcFrom={variant:game.variant,out:game.tcOut.slice(),at:game.tcNow};game.variant=(tcV(game.variant)+1)%TC_ROUNDS;game.tcOut=[];game.completed=(game.completed||0)+1;tcRest(game,s,TC_FIRST);}
 else tcRest(game,s);
 return true;}

// ── The music ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Loudness against the other stories (EBU R 128 on the review video; velocity is quadratic).
export const TC_LOUD=1.6;
const TC_CACHE=new Map();
// The knocking: the three knocks, and after them a little question on the marimba (two notes going up), every TC_KNOCK_EVERY seconds.
export function tcKnockScore(variant){const r=tcRound(variant),D=TC_KNOCK_EVERY,sc=escScore(D),deg=d=>escNote(r.key,'major',d),sh=escFit([0,4].map(deg),'marimbaRec');
 sc.add(0,.9,'toonRec',[],Math.min(1,.62*TC_LOUD),{variant:'knock'});
 sc.add(1.05,.8,'marimbaRec',[escInto(deg(0)+sh,'marimbaRec')],.2*TC_LOUD,{pan:.15});sc.add(1.32,1.1,'marimbaRec',[escInto(deg(4)+sh,'marimbaRec')],.22*TC_LOUD,{pan:.15});
 return sc.done();}
// A visit: the door opens, the visitor's tune and gag, a few plucked steps to the place in the street, the door shuts, and a plucked
// chord. The last visit goes on with the party and the bow.
export function tcPlan(variant,who,final,duration){const D=Math.max(1,duration||(final?TC_FINAL:TC_VISIT)),name=TC_VISITORS[who]||TC_VISITORS[0],id=`${tcV(variant)}|${name}|${final?1:0}|${D.toFixed(3)}`;
 if(TC_CACHE.has(id))return TC_CACHE.get(id);
 const r=tcRound(variant),T=TC_T[name],Td=TC_T.door,Tf=TC_T.final,deg=d=>escNote(r.key,'major',d),sc=escScore(D);
 const put=(t,len,inst,midi,vel,x={})=>sc.add(t,len,inst,midi,Math.min(1,vel*TC_LOUD),x);
 const fit=(ds,inst,centre)=>escFit(ds.map(deg),inst,centre),into=(d,inst,sh)=>escInto(deg(d)+sh,inst);
 const sh={tuba:fit([0,4],'tubaRec'),pz:fit([0,2,4,7],'violinsPizzRec'),cl:fit([0,4,7,9],'clarinetRec'),tr:fit([0,4,7],'trumpetRec',72),tb:fit([0,4],'tromboneRec'),
  gl:fit([0,7],'glockRec'),ma:fit([0,7,9],'marimbaRec'),ha:fit([0,7],'harpRec'),ce:fit([0,4],'celliPizzRec'),fl:fit([0,4,7],'fluteRec',79),ob:fit([0,4,7],'oboeRec',74),ti:fit([0],'timpaniRec')};
 const sfx=(t,v,vel,len=1.4)=>put(t,len,'toonRec',[],vel*.66,{variant:v});
 const hit=(t,inst,vel,x={})=>put(t,.3,inst,[],vel,x);
 // The glockenspiel stays within its recorded bars (up to G7); a run moves down as a whole, so that it keeps its shape.
 const glRun=ds=>{const ms=ds.map(d=>deg(d)+sh.gl);while(Math.max(...ms)>103)ms.forEach((m,i)=>ms[i]=m-12);while(Math.min(...ms)<79&&Math.max(...ms)+12<=103)ms.forEach((m,i)=>ms[i]=m+12);return ms;};
 const sparkle=(t,vel=.22,up=true)=>glRun([0,2,4,7,9].map(d=>(up?d:9-d)+7)).forEach((m,i)=>put(t+i*.07,.7,'glockRec',[m],vel,{pan:-.1+.05*i}));
 const cadence=(t,vel=1)=>{put(t,1.8,'harpRec',[0,2,4,7].map(x=>into(x,'harpRec',sh.ha)),.34*vel,{strum:.04,pan:-.2});put(t,1.2,'celliPizzRec',[into(0,'celliPizzRec',sh.ce)],.42*vel,{pan:.12});
  put(t,1,'marimbaRec',[into(4,'marimbaRec',sh.ma),into(7,'marimbaRec',sh.ma)],.3*vel,{pan:.2});};
 // The door opens with a run on the harp; the walk to the street is four plucked steps; the door shuts.
 sfx(Td.open,'doorOpen',.62);[0,2,4,7,9].forEach((d,i)=>put(.06+i*.07,1,'harpRec',[into(d+7,'harpRec',sh.ha)],.2,{pan:-.15}));
 [0,4,2,4].forEach((d,i)=>put(Td.walk+i*.27,.25,'violinsPizzRec',[into(d,'violinsPizzRec',sh.pz)],.24,{pan:.1-.07*i}));
 sfx(Td.shut+.05,'doorClose',.3);
 if(name==='giant'){
  // The giant: big steps on the bass drum and the tuba, a wriggle on the clarinet, the pop out of the door, the slide whistle as he
  // unfolds, a short fanfare, and a deep bow.
  for(const t of [T.foot,T.stomp,T.stomp2]){hit(t,'bassdrumRec',.42,{pan:0});put(t,.4,'tubaRec',[into(t===T.stomp?4:0,'tubaRec',sh.tuba)],.42,{pan:.05});}
  for(let i=0;i<6;i++)put(T.squeeze+.1+i*.15,.13,'clarinetRec',[into(i%2?3:2,'clarinetRec',sh.cl)],.24,{pan:-.2});
  sfx(T.pop,'yank',.5);sfx(T.rise,'slideUp',.55);
  [0,4,7].forEach((d,i)=>put(T.tall+i*.16,i===2?.6:.14,'trumpetRec',[into(d,'trumpetRec',sh.tr)],.3,{pan:.05}));hit(T.tall+.32,'cymbalRec',.16,{variant:'soft'});
  put(T.bow,.6,'tubaRec',[into(-3,'tubaRec',sh.tuba)],.4);put(T.bow+.02,.6,'timpaniRec',[into(0,'timpaniRec',sh.ti)],.3);
  [7,4,2,0].forEach((d,i)=>put(T.up+i*.1,.2,'oboeRec',[into(d,'oboeRec',sh.ob)],.2,{pan:-.1}));
 }else if(name==='bighead'){
  // The big-headed figure: a jaunty clarinet; stuck in the frame (claves and snare as he wriggles, three tugs on the trombone); the
  // pop; the head spins on a falling marimba; the boing as it sits right; a hop.
  [0,2,4,2,4,7].forEach((d,i)=>put(T.out+i*.12,.11,'clarinetRec',[into(d,'clarinetRec',sh.cl)],.26,{pan:-.2}));
  for(let i=0;i<8;i++)hit(T.stuck+i*.21,i%2?'woodblockRec':'snareRec',.16,{variant:i%2?'claves':'hit',pan:.15});
  [0,1,2].forEach(i=>put(T.tug+i*.4,.3,'tromboneRec',[into(-i,'tromboneRec',sh.tb)],.32,{pan:.1}));
  sfx(T.pop,'poof',.55);[9,7,5,4,2,0].forEach((d,i)=>put(T.spin+i*.13,.4,'marimbaRec',[into(d,'marimbaRec',sh.ma)],.24,{pan:.25-.08*i}));
  sfx(T.set,'boing',.5);[4,7].forEach((d,i)=>put(T.hop+i*.18,.3,'violinsPizzRec',[into(d,'violinsPizzRec',sh.pz)],.28));
 }else if(name==='band'){
  // The band: each musician comes out on a note of their own (trumpet, clarinet, flute); the tuba gets stuck in the doorway, turns
  // with a slide whistle and squeezes through; then the four of them play.
  put(T.m1,.3,'trumpetRec',[into(0,'trumpetRec',sh.tr)],.28,{pan:.1});put(T.m2,.3,'clarinetRec',[into(2,'clarinetRec',sh.cl)],.28,{pan:-.15});put(T.m3,.3,'fluteRec',[into(4,'fluteRec',sh.fl)],.26,{pan:-.25});
  put(T.m4,.35,'tubaRec',[into(0,'tubaRec',sh.tuba)],.4);put(T.stuck,.3,'tubaRec',[into(-1,'tubaRec',sh.tuba)],.36);put(T.stuck+.35,.3,'tubaRec',[into(-2,'tubaRec',sh.tuba)],.36);hit(T.stuck+.2,'snareRec',.18,{variant:'hit'});
  sfx(T.turn,'slideUp',.48);sfx(T.through,'boing',.42);
  const B=.27,mel=[4,4,5,7,7,5,4,2];
  mel.forEach((d,i)=>{const t=T.play+i*B;put(t,B*.85,'trumpetRec',[into(d,'trumpetRec',sh.tr)],.26,{pan:.1});put(t,B*.85,'clarinetRec',[into(d-2,'clarinetRec',sh.cl)],.18,{pan:-.15});
   if(i%2===0)put(t,B*.9,'tubaRec',[into(i%4?4:0,'tubaRec',sh.tuba)],.36);else put(t,B*.6,'fluteRec',[into(d+2,'fluteRec',sh.fl)],.14,{pan:-.25});});
 }else if(name==='snowman'){
  // The snowman: he glides out on the harp; the warmth of the house (two soft flute notes); he melts on the slide whistle and falling
  // drops; he shivers on the snare; he freezes again in a sparkle; a proud little fanfare.
  [0,2,4,7,9,11].forEach((d,i)=>put(T.glide+i*.11,1.2,'harpRec',[into(d,'harpRec',sh.ha)],.22,{pan:-.2}));
  put(T.warm,.5,'fluteRec',[into(4,'fluteRec',sh.fl)],.2,{pan:-.2});put(T.warm+.3,.6,'fluteRec',[into(3,'fluteRec',sh.fl)],.2,{pan:-.2});
  sfx(T.melt,'slideDown',.5);[9,7,6,4,2,1,0].forEach((d,i)=>put(T.melt+.4+i*.12,.3,'violinsPizzRec',[into(d,'violinsPizzRec',sh.pz)],.2,{pan:.2-.05*i}));
  for(let i=0;i<6;i++)hit(T.shiver+i*.1,'snareRec',.1,{variant:'hit',pan:.1});
  sparkle(T.freeze,.22);put(T.proud,.25,'trumpetRec',[into(4,'trumpetRec',sh.tr)],.24);put(T.proud+.22,.6,'trumpetRec',[into(7,'trumpetRec',sh.tr)],.26);hit(T.proud+.22,'triangleRec',.12,{variant:'hit'});
 }else if(name==='astronaut'){
  // The astronaut floats out on slow harp chords and glockenspiel bells, turns over on rising plucked violins, lands with a boing
  // and a soft timpani, and waves.
  [0,4,7,11].forEach((d,i)=>{put(T.float+i*.45,1.6,'harpRec',[into(d,'harpRec',sh.ha),into(d+4,'harpRec',sh.ha)],.2,{strum:.06,pan:-.2});put(T.float+.2+i*.45,1.4,'glockRec',[glRun([d+7])[0]],.13,{pan:.2});});
  [0,1,2,3,4,5,6,7].forEach((d,i)=>put(T.flip+i*.16,.25,'violinsPizzRec',[into(d,'violinsPizzRec',sh.pz)],.2,{pan:-.2+.05*i}));
  sfx(T.land,'boing',.46);put(T.land+.02,.6,'timpaniRec',[into(0,'timpaniRec',sh.ti)],.22);
  put(T.wave,.8,'glockRec',[glRun([11])[0]],.16);put(T.wave+.25,1,'marimbaRec',[into(7,'marimbaRec',sh.ma)],.2);
 }else if(name==='cook'){
  // The cook: a little march; the cake grows on a marimba going up and up; it wobbles on the clarinet; it sags on the slide whistle;
  // the cream lands on his nose; he licks it, happy, on the flute.
  [0,4,0,4].forEach((d,i)=>{put(T.out+i*.22,.2,'tubaRec',[into(d,'tubaRec',sh.tuba)],.32);put(T.out+.11+i*.22,.15,'violinsPizzRec',[into(d+2,'violinsPizzRec',sh.pz),into(d+4,'violinsPizzRec',sh.pz)],.18);});
  for(let i=0;i<9;i++)put(T.grow+i*.12,.4,'marimbaRec',[into(i,'marimbaRec',sh.ma)],.2+.02*i,{pan:.2});
  for(let i=0;i<6;i++)put(T.wobble+i*.12,.11,'clarinetRec',[into(i%2?8:7,'clarinetRec',sh.cl)],.2,{pan:-.2});
  sfx(T.sag,'slideDown',.48);sfx(T.splat,'squirt',.5);
  [4,5,7].forEach((d,i)=>put(T.lick+i*.16,i===2?.5:.15,'fluteRec',[into(d,'fluteRec',sh.fl)],.22,{pan:-.2}));put(T.lick+.32,.3,'violinsPizzRec',[into(0,'violinsPizzRec',sh.pz),into(4,'violinsPizzRec',sh.pz)],.22);
 }else{
  // The dancer: a waltz on the flute over the harp while she twirls; dizzy on a wobbly clarinet and little bells; she sits down with a
  // bump; she springs up on a run of the harp and a triangle.
  const B=.35,mel=[4,7,9,7,4,2,4,0];
  mel.forEach((d,i)=>{const t=T.twirl+i*B*.75;put(t,B*.7,'fluteRec',[into(d,'fluteRec',sh.fl)],.22,{pan:-.2});if(i%3===0)put(t,1,'harpRec',[into(0,'harpRec',sh.ha),into(4,'harpRec',sh.ha)],.18,{strum:.03,pan:.15});});
  for(let i=0;i<5;i++){put(T.dizzy+i*.26,.22,'clarinetRec',[into(i%2?3:4,'clarinetRec',sh.cl)-(i%2?1:0)],.18,{pan:-.2});put(T.dizzy+.13+i*.26,.6,'glockRec',[glRun([i%2?9:7])[0]],.1,{pan:.25});}
  hit(T.sit,'bassdrumRec',.28);put(T.sit+.02,.4,'celliPizzRec',[into(0,'celliPizzRec',sh.ce)],.3);
  [0,2,4,7,9].forEach((d,i)=>put(T.up+i*.07,1,'harpRec',[into(d+7,'harpRec',sh.ha)],.22,{pan:-.15}));hit(T.up+.35,'triangleRec',.12,{variant:'hit'});
 }
 if(final){
  // The party: a polka for the whole street (tuba on the beat, plucked violins off it, the clarinet tune and the trumpet answering,
  // a soft snare), then the bow.
  const B=.3,t0=Tf.party,CH=[0,0,4,4,0,0,3,4,0,0,4,4,0,3,4,0],tune=[4,2,0,2,4,4,4,4,2,2,2,2,4,7,7,7];
  for(let i=0,t=t0;t<Tf.bow-.1;i++,t+=B){const ch=CH[Math.floor(i/2)%CH.length];
   if(i%2===0)put(t,B*.7,'tubaRec',[into(ch+(i%4?4:0),'tubaRec',sh.tuba)],.42,{pan:.08});
   else{put(t,B*.6,'violinsPizzRec',[ch+2,ch+4,ch+7].map(x=>into(x,'violinsPizzRec',sh.pz)),.26,{pan:-.15,strum:.012});hit(t,'snareRec',.08,{variant:'hit',pan:.2});}
   const k=i%32;if(k<16)put(t,B*.8,'clarinetRec',[into(tune[k],'clarinetRec',sh.cl)],.24,{pan:-.2});else put(t,B*.8,'trumpetRec',[into(tune[k-16]+2,'trumpetRec',sh.tr)],.22,{pan:.15});}
  sparkle(Tf.bow-.4,.2);
 }
 const close=Math.min(D-1.5,final?Tf.bow+.4:Td.shut-.05);
 cadence(close,.72);
 const plan={name,score:sc.done()};TC_CACHE.set(id,plan);return plan;}
// The score of a press (for the catalogue): a visit, or the last visit with the party.
export const tcScore=(variant,who,final,duration)=>tcPlan(variant,who,final,duration).score;

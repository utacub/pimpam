// L'orquestra que es desperta (CE12), 0.14: a festive stage at nightfall with empty chairs and music stands. Each press wakes a section
// of the orchestra, which joins the same piece; at the last press all of them play together. Each round changes the piece (a dance, a
// waltz, a march, a lullaby, a polka), the place (a town square, a theatre, a garden, a harbour) and the order in which the sections wake.
// The music is played by recorded instruments only (VSCO-2 CE, CC0, in sampler.js): the newest section that can carry a tune takes it,
// the earlier ones move to the accompaniment, and every step closes on plucked and struck notes that fade by themselves.
import {escGroups,escNote,escFit,escInto,escScore} from './escenari.js';

export const OQ_STEP_MIN=8.5,OQ_FINAL_MIN=13;
// The six sections, in their places on the stage from left to right.
export const OQ_SECTIONS=Object.freeze(['arpa','corda','fusta','metall','percussio','marimba']);
export const OQ_PLACES=Object.freeze(['plaça','teatre','jardí','port']);
const OQ_PAN=Object.freeze([-.55,-.32,-.12,.12,.32,.55]);
// Meters: ticks per bar, strong ticks, bass ticks ([tick, 0 for the root or 4 for the fifth]), off-beat ticks, the harp's broken chord
// and the marimba's figure (degrees above the root of the bar).
const OQ_METERS=Object.freeze({
 '68':{T:6,strong:[0,3],bass:[[0,0],[3,4]],off:[2,5],arp:[0,2,4,7,4,2],ost:[0,4,7,4,2,4]},
 '34':{T:3,strong:[0],bass:[[0,0]],off:[1,2],arp:[0,4,7],ost:[0,4,7]},
 '24':{T:4,strong:[0,2],bass:[[0,0],[2,4]],off:[1,3],arp:[0,2,4,7],ost:[0,4,2,4]},
 'bressol':{T:6,strong:[0,3],bass:[[0,0]],off:[3],arp:[0,4,7,9,7,4],ost:[0,4,7,9,7,4]}
});
// The five pieces (original tunes): key, mode, meter, the length of a tick in seconds, the chord of each bar (the scale degree of its
// root) and the tune as [scale degree, ticks]. Each tune fills its bars exactly and ends on a note of the last chord.
export const OQ_PIECES=Object.freeze([
 {name:'dansa',key:62,mode:'major',meter:'68',tick:.19,prog:[0,3,4,0],tune:[[4,2],[2,1],[0,2],[2,1],[3,2],[5,1],[7,2],[5,1],[4,2],[6,1],[8,2],[6,1],[7,2],[4,1],[0,3]]},
 {name:'vals',key:65,mode:'major',meter:'34',tick:.42,prog:[0,5,1,4],tune:[[4,2],[2,1],[5,2],[2,1],[3,1],[5,1],[8,1],[8,2],[6,1]]},
 {name:'marxa',key:58,mode:'major',meter:'24',tick:.3,prog:[0,3,0,4],tune:[[0,1],[2,1],[4,2],[5,1],[3,1],[5,2],[4,1],[2,1],[0,1],[2,1],[1,2],[4,2]]},
 {name:'bressol',key:67,mode:'major',meter:'bressol',tick:.25,prog:[0,3,0,4],tune:[[4,3],[2,3],[5,2],[4,1],[3,3],[2,2],[4,1],[7,3],[6,2],[5,1],[4,3]]},
 {name:'polca',key:60,mode:'major',meter:'24',tick:.21,prog:[0,0,4,4,3,4],tune:[[4,1],[4,1],[2,1],[4,1],[7,2],[4,2],[8,1],[8,1],[6,1],[8,1],[11,2],[8,2],[10,1],[9,1],[7,1],[5,1],[6,2],[4,2]]}
]);
export const oqTicks=p=>OQ_METERS[p.meter].T*p.prog.length;
// The order in which the sections wake, one for each of the twenty rounds: a round always starts with a plucked or struck section
// (harp, strings or marimba) and the percussion never comes in first or second, so every step has a tune and ends on notes that ring.
export const OQ_ORDERS=Object.freeze(['031254','520134','120453','034512','132450','530124','521403','012543','123540','134025','132045','524301','052431','102435','532140','032451','521340','102354','512430','531420'].map(s=>Object.freeze([...s].map(Number))));
// A round: its place, its piece (transposed a little in each group of five rounds) and its order of entry.
export function oqRound(variant){const v=((Math.round(variant||0)%20)+20)%20;return {v,place:v%4,piece:OQ_PIECES[v%5],order:OQ_ORDERS[v],shift:[0,2,-2,1][Math.floor(v/5)%4]};}

// ── The music of a press ─────────────────────────────────────────────────────────────────────────────────────────────────
// The plan of one press: who is awake, who comes in now, who has the tune, the grid of the piece, every note (with the section that
// plays it, so the stage can move with the music) and the times the stage needs (phrase, close).
const OQ_CACHE=new Map();
export function oqPlan(variant,count,steps,duration){const D=Math.max(1,duration||OQ_STEP_MIN),id=`${variant}|${count}|${steps}|${D.toFixed(3)}`;if(OQ_CACHE.has(id))return OQ_CACHE.get(id);
 const round=oqRound(variant),groups=escGroups(steps),press=Math.max(1,Math.min(count||1,groups.length)),final=press===groups.length;
 const awake=groups.slice(0,press).flat().filter(k=>k<6).map(k=>round.order[k]),entering=final?[]:groups[press-1].map(k=>round.order[k]);
 const melodic=awake.filter(s=>s!==4),lead=final?-1:melodic[melodic.length-1];
 const P=round.piece,M=OQ_METERS[P.meter],T=M.T,B=P.prog.length,ticks=T*B,key=P.key+round.shift,deg=d=>escNote(key,P.mode,d);
 const enterAt=entering.map((s,j)=>.05+.45*j),s0=final?1.3:Math.max(1,.65+.45*entering.length),tail=final?4.2:1.9,room=D-s0-tail;
 const reps=Math.max(1,Math.floor(room/(ticks*P.tick*.9))),dt=Math.max(P.tick*.8,Math.min(P.tick*1.12,room/(reps*ticks)));
 const sc=escScore(D),hits=OQ_SECTIONS.map(()=>[]),soft=P.name==='bressol'?.72:1;
 const put=(sec,time,length,inst,midi,vel,x={})=>{const n=sc.out.length;sc.add(time,length,inst,midi,vel*soft,{pan:OQ_PAN[sec],...x});if(sc.out.length>n)hits[sec].push({time,midi:midi[0]??60,vel,inst});};
 const tune=[];{let p=0;for(const [d,len] of P.tune){tune.push({p,d,len,strong:M.strong.includes(p%T)});p+=len;}}
 const rootAt=p=>P.prog[Math.floor(p/T)%B],at=(r,p)=>s0+(r*ticks+p)*dt,boost=sec=>entering.includes(sec)?1.15:1;
 // A part: notes given as [tick, ticks long, scale degree] for one round of the phrase, placed by octaves for its instrument.
 const part=(sec,inst,notes,vel,{legato=.92,len=null,x={},chord=null,centre}={})=>{const ms=notes.flatMap(n=>(chord||[0]).map(c=>deg(n[2]+c)));if(!ms.length)return;const sh=escFit(ms,inst,centre);
  for(let r=0;r<reps;r++)for(const [p,l,d,v=1] of notes)put(sec,at(r,p),len??l*dt*legato,inst,(chord||[0]).map(c=>escInto(deg(d+c)+sh,inst)),vel*v*boost(sec),chord&&chord.length>1?{strum:.012,spread:.25,...x}:x);};
 const melodyNotes=(f=()=>true,shift=0)=>tune.filter(f).map(n=>[n.p,n.len,n.d+shift,n.strong?1:.88]);
 const bassNotes=(only=null)=>{const out=[];for(let b=0;b<B;b++)M.bass.forEach(([k,f],j)=>{if(only===null||j===only)out.push([b*T+k,T/M.bass.length,P.prog[b]+f,j?.85:1]);});return out;};
 const perTick=(pattern,strongBoost=1.15)=>Array.from({length:ticks},(_,p)=>[p,1,rootAt(p)+pattern[p%pattern.length],M.strong.includes(p%T)?strongBoost:1]);
 const offs=()=>{const out=[];for(let b=0;b<B;b++)for(const k of M.off)out.push([b*T+k,1,P.prog[b]]);return out;};
 const bars=(f=2)=>Array.from({length:B},(_,b)=>[b*T,T,P.prog[b]+f]);
 // What each section plays, as the tune (lead) or as accompaniment.
 const LEAD=[
  sec=>{part(sec,'harpRec',melodyNotes(),.5);part(sec,'harpRec',bars(0),.3,{len:dt*2,centre:48});},
  sec=>{part(sec,'violinsRec',melodyNotes(),.42,{legato:.96});part(sec,'celliPizzRec',bassNotes(),.42);},
  sec=>{part(sec,'fluteRec',melodyNotes(),.44,{legato:.9});part(sec,'clarinetRec',melodyNotes(n=>n.len>=2,-2),.26,{legato:.9});},
  sec=>{part(sec,'trumpetRec',melodyNotes(),.4,{legato:.85});part(sec,'hornRec',melodyNotes(n=>n.strong,-2),.24,{len:dt*1.6});part(sec,'tubaRec',bassNotes(0),.3,{len:dt*1.5});},
  null,
  sec=>{part(sec,'marimbaRec',melodyNotes(),.52);part(sec,'marimbaRec',tune.filter(n=>n.len>=3).map(n=>[n.p+n.len/2,n.len/2,n.d,.6]),.5);}
 ];
 const ACC=[
  sec=>part(sec,'harpRec',perTick(M.arp),.21,{centre:60}),
  sec=>{part(sec,'celliPizzRec',bassNotes(),.4);part(sec,'violinsPizzRec',offs(),.22,{chord:[2,4]});},
  sec=>{part(sec,'clarinetRec',bars(2),.16,{legato:.9});part(sec,'fluteRec',melodyNotes(n=>n.strong,7),.13,{legato:.8});},
  sec=>{part(sec,'tubaRec',bassNotes(awake.includes(1)?0:null),.28,{len:dt*1.5});part(sec,'hornRec',offs(),.15,{len:dt*.7,chord:[2,4]});},
  sec=>{part(sec,'timpaniRec',Array.from({length:B},(_,b)=>[b*T,T,P.prog[b]+(b%2?4:0)]),.36,{len:dt*T});
   if(T===4)part(sec,'timpaniRec',Array.from({length:B},(_,b)=>[b*T+2,2,P.prog[b]+4,.55]),.36,{len:dt*2});
   part(sec,'glockRec',melodyNotes(n=>n.strong,7),.2);
   for(let r=0;r<reps;r++)for(let b=0;b<B;b++){if(P.name==='marxa'||P.name==='polca'){put(sec,at(r,b*T),.6,'bassdrumRec',[],.24,{variant:'soft'});for(const k of M.off)put(sec,at(r,b*T+k),.3,'snareRec',[],.1,{variant:'hit'});}
    else if(T===3){for(const k of M.off)put(sec,at(r,b*T+k),.4,'triangleRec',[],.09,{variant:'muted'});}
    else if(b%2===0)put(sec,at(r,b*T),1.2,'triangleRec',[],.14,{variant:'hit'});}},
  sec=>part(sec,'marimbaRec',perTick(M.ost),.19)
 ];
 // The entry of a section: a short gesture of its own on the press, before the phrase starts.
 const ENTRY=[
  t=>{const sh=escFit([deg(-7),deg(5)],'harpRec',60);for(let i=0;i<13;i++)put(0,t+i*.055,1.4,'harpRec',[escInto(deg(i-7)+sh,'harpRec')],.26+.016*i);},
  t=>{put(1,t,1.2,'celliPizzRec',[escInto(deg(0)-24,'celliPizzRec')],.46);const sh=escFit([deg(0),deg(4)],'violinsPizzRec');put(1,t+.02,.8,'violinsPizzRec',[0,2,4].map(c=>escInto(deg(c)+sh,'violinsPizzRec')),.34,{strum:.06});put(1,t+.34,.8,'violinsPizzRec',[2,4,7].map(c=>escInto(deg(c)+sh,'violinsPizzRec')),.36,{strum:.06});},
  t=>{const sh=escFit([deg(0),deg(7)],'fluteRec');[0,1,2,3,4].forEach((d,i)=>put(2,t+i*.075,.12,'fluteRec',[escInto(deg(d)+sh,'fluteRec')],.34));put(2,t+.38,.5,'fluteRec',[escInto(deg(7)+sh,'fluteRec')],.4);put(2,t+.38,.5,'clarinetRec',[escInto(deg(2)+escFit([deg(2)],'clarinetRec'),'clarinetRec')],.26);},
  t=>{const sh=escFit([deg(4),deg(7)],'trumpetRec');put(3,t,.12,'trumpetRec',[escInto(deg(4)+sh,'trumpetRec')],.34);put(3,t+.14,.12,'trumpetRec',[escInto(deg(4)+sh,'trumpetRec')],.34);put(3,t+.28,.45,'trumpetRec',[escInto(deg(7)+sh,'trumpetRec')],.4);
   put(3,t+.28,.45,'hornRec',[escInto(deg(4)+escFit([deg(4)],'hornRec'),'hornRec')],.26);put(3,t+.28,.35,'tubaRec',[escInto(deg(0)+escFit([deg(0)],'tubaRec'),'tubaRec')],.3);},
  t=>{const r=escInto(deg(0)+escFit([deg(0)],'timpaniRec'),'timpaniRec');for(let i=0;i<5;i++)put(4,t+i*.09,.6,'timpaniRec',[r],.18+.06*i);put(4,t+.46,1.4,'triangleRec',[],.16,{variant:'hit'});put(4,t+.46,1.2,'glockRec',[escInto(deg(7)+escFit([deg(7)],'glockRec'),'glockRec')],.26);},
  t=>{const sh=escFit([deg(0),deg(11)],'marimbaRec');[0,2,4,7,9,11].forEach((d,i)=>put(5,t+i*.06,.8,'marimbaRec',[escInto(deg(d)+sh,'marimbaRec')],.3+.03*i));}
 ];
 const phraseEnd=at(reps,0);let close=phraseEnd;
 if(!final){
  entering.forEach((s,j)=>ENTRY[s](enterAt[j]));
  for(const s of awake){if(s===lead)LEAD[s](s);else ACC[s](s);}
  // The close: one chord on the tonic, plucked and struck by the sections that are awake, with short notes from the winds.
  const c0=[0,2,4,7];if(awake.includes(0))put(0,close,2,'harpRec',[...c0,9].map(c=>escInto(deg(c)+escFit([deg(0),deg(9)],'harpRec',62),'harpRec')),.42,{strum:.045});
  if(awake.includes(1)){put(1,close,1.4,'celliPizzRec',[escInto(deg(0)-24,'celliPizzRec')],.44);put(1,close+.02,.8,'violinsPizzRec',[2,4,7].map(c=>escInto(deg(c)+escFit([deg(2),deg(7)],'violinsPizzRec'),'violinsPizzRec')),.3,{strum:.03});}
  if(awake.includes(5))put(5,close,1.2,'marimbaRec',[0,4,7].map(c=>escInto(deg(c)+escFit([deg(0),deg(7)],'marimbaRec'),'marimbaRec')),.34,{strum:.02});
  if(awake.includes(4)){put(4,close,1.6,'timpaniRec',[escInto(deg(0)+escFit([deg(0)],'timpaniRec'),'timpaniRec')],.34);put(4,close,1.6,'glockRec',[escInto(deg(7)+escFit([deg(7)],'glockRec'),'glockRec')],.24);}
  if(awake.includes(2))put(2,close,.32,'fluteRec',[escInto(deg(7)+escFit([deg(7)],'fluteRec'),'fluteRec')],.3);
  if(awake.includes(3)){put(3,close,.3,'trumpetRec',[escInto(deg(0)+escFit([deg(0)],'trumpetRec'),'trumpetRec')],.28);put(3,close,.35,'tubaRec',[escInto(deg(0)+escFit([deg(0)],'tubaRec'),'tubaRec')],.26);}
 }else{
  // The final: a timpani roll wakes everyone, the whole orchestra plays the piece, a harp glissando runs up, and a soft cymbal and one
  // last chord ring out.
  const r=escInto(deg(0)+escFit([deg(0)],'timpaniRec'),'timpaniRec');for(let i=0;i<10;i++)put(4,.08+i*.1,.5,'timpaniRec',[i%2?r:escInto(r+7,'timpaniRec')],.14+.032*i);
  put(0,.9,1,'harpRec',[0,2,4,7].map(c=>escInto(deg(c)+escFit([deg(0),deg(7)],'harpRec',64),'harpRec')),.36,{strum:.05});
  const tunes=P.name==='marxa'||P.name==='polca'?[[3,'trumpetRec',.36,.85],[2,'fluteRec',.3,.9]]:[[2,'fluteRec',.38,.9],[1,'violinsRec',.32,.96]];
  for(const [sec,inst,vel,legato] of tunes)part(sec,inst,melodyNotes(),vel,{legato});
  part(2,'clarinetRec',melodyNotes(n=>n.len>=2,-2),.2,{legato:.9});
  ACC[0](0);part(1,'celliPizzRec',bassNotes(),.4);part(1,'violinsPizzRec',offs(),.2,{chord:[2,4]});part(3,'tubaRec',bassNotes(0),.26,{len:dt*1.5});part(3,'hornRec',offs(),.14,{len:dt*.7,chord:[2,4]});ACC[4](4);ACC[5](5);
  const sh=escFit([deg(0),deg(14)],'harpRec',66);for(let i=0;i<15;i++)put(0,phraseEnd+i*.05,1.6,'harpRec',[escInto(deg(i)+sh,'harpRec')],.3+.013*i);
  close=phraseEnd+.85;
  put(4,close,3.5,'cymbalRec',[],.3,{variant:'soft'});put(4,close,2.2,'timpaniRec',[r],.42);put(4,close,2,'glockRec',[escInto(deg(7)+escFit([deg(7)],'glockRec'),'glockRec')],.3);put(4,close,2,'triangleRec',[],.18,{variant:'hit'});
  put(0,close,2.6,'harpRec',[0,2,4,7,9,11].map(c=>escInto(deg(c)+escFit([deg(0),deg(11)],'harpRec',62),'harpRec')),.48,{strum:.05});
  put(1,close,1.6,'celliPizzRec',[escInto(deg(0)-24,'celliPizzRec')],.48);put(1,close+.02,.9,'violinsPizzRec',[2,4,7].map(c=>escInto(deg(c)+escFit([deg(2),deg(7)],'violinsPizzRec'),'violinsPizzRec')),.32,{strum:.03});
  put(5,close,1.4,'marimbaRec',[0,4,7].map(c=>escInto(deg(c)+escFit([deg(0),deg(7)],'marimbaRec'),'marimbaRec')),.36,{strum:.02});
  put(2,close,.4,'fluteRec',[escInto(deg(7)+escFit([deg(7)],'fluteRec'),'fluteRec')],.28);put(3,close,.35,'trumpetRec',[escInto(deg(4)+escFit([deg(4)],'trumpetRec'),'trumpetRec')],.26);
 }
 const beats=[];for(let r=0;r<reps;r++)for(let p=0;p<ticks;p++)if(M.strong.includes(p%T))beats.push(at(r,p));
 for(const h of hits)h.sort((a,b)=>a.time-b.time);
 const plan={D,round,piece:P,final,press,awake,entering,enterAt,lead,s0,dt,T,B,ticks,reps,phraseEnd,close,beats,hits,score:sc.done()};
 if(OQ_CACHE.size>48)OQ_CACHE.delete(OQ_CACHE.keys().next().value);OQ_CACHE.set(id,plan);return plan;}
export const oqScore=(variant,count,steps,duration)=>oqPlan(variant,count,steps,duration).score;

// Laboratori de matèria, until 0.69 «Bombolles sense pes» (CE05, id 'bubbles', 0.63) · the model: seven kinds of weightless matter in turn, the presses of each one, its
// way out to black, and its music. It takes the place of the old «Bombolles de sabó» (Marc, 10 November 2026: «publicat tot directament
// a Pim Pam, substituint l'activitat Bombolles de sabó»). The pictures are the engine of the style trial (bombolles-motor.js and one
// module for each matter), approved stimulus by stimulus on 9 November 2026.
// The arc of each matter (bmbRole, bombolles-sabo.js), with P presses (setting «Pulsacions de cada matèria»: 4, 8 or 12): the first
// presses bring the matter in from an edge, the next ones make it grow, press P − 1 fills the screen and press P sends everything out
// through the edges. While it goes out the presses do nothing; once the screen is black, the next matter waits for its first press.
// After the last matter the first one comes back with its second palette.
// Each press plays a phrase of the music of its matter (recorded instruments, plucked or struck, sampler.js): a few notes as the matter
// comes in, the melody with its chords while it grows, three bars with every layer at the full moment, and a falling line that ends on
// the tonic as it leaves. The events of the matter (a bubble that bursts, two drops that merge, a smoke ring that comes in…) add a soft
// note of the chord and, for some, the recorded sound of the matter itself. No pads, organs or held notes: every note dies away.
import {escWaitTurn,escWaitClock,escRange,ESC_WAIT_START} from './escenari.js';
import {sampleZone,SAMPLE_BANK} from './sampler.js';
import {bmbRole,sboNew,sboPress,sboStep,sboDraw,sboEmptyNow} from './bombolles-sabo.js';
import {plaNew,plaPress,plaStep,plaDraw,plaEmptyNow} from './bombolles-plasma.js';
import {aigNew,aigPress,aigStep,aigDraw,aigEmptyNow} from './bombolles-aigua.js';
import {fumNew,fumPress,fumStep,fumDraw,fumEmptyNow} from './bombolles-fum.js';
import {lavNew,lavPress,lavStep,lavDraw,lavEmptyNow} from './bombolles-lava.js';
import {ferNew,ferPress,ferStep,ferDraw,ferEmptyNow} from './bombolles-ferro.js';
import {oliNew,oliPress,oliStep,oliDraw,oliEmptyNow} from './bombolles-oli.js';
import {nebNew,nebPress,nebStep,nebDraw,nebEmptyNow} from './bombolles-nebulosa.js';

// The name: «Bombolles sense pes» from 0.63 to 0.69, «Laboratori de matèria» since 0.70 (Marc, 10 November 2026: «Canvia el nom de
// l’activitat per un que et sembli que encaixa millor… Ara hi ha moltes més coses que bombolles»). The id and the code stay.
export const BB_CAUSE=Object.freeze({id:'bubbles',code:'CE05',type:'ce',level:'01 · Descobrir',name:'Laboratori de matèria',desc:'Vuit matèries simulades amb les lleis de la física apareixen sobre negre, creixen fins a omplir la pantalla i se’n van: bombolles de sabó, plasma, aigua, fum, una làmpada de lava, ferrofluid, oli i aigua i una nebulosa, cadascuna amb la seva música.',tag:'8 matèries · una música per a cadascuna',time:'Al teu ritme',bombolles:true,recorded:true});

// The eight matters, in this order (Mel i caramel taken out in 0.63.2: Marc, 10 November 2026, «irrecuperable»; the lava lamp added
// in 0.64 at his request, the only one with weight). what: the words of the status for a screen reader.
export const BB_STIMS=Object.freeze([
 {id:'sabo',name:'Bombolles de sabó',what:'bombolles iridescents',nou:sboNew,prem:sboPress,pas:sboStep,pinta:sboDraw,buit:sboEmptyNow},
 {id:'plasma',name:'Plasma',what:'descàrregues elèctriques entre punts de llum',nou:plaNew,prem:plaPress,pas:plaStep,pinta:plaDraw,buit:plaEmptyNow},
 {id:'aigua',name:'Esferes d’aigua',what:'boles d’aigua amb tinta de colors',nou:aigNew,prem:aigPress,pas:aigStep,pinta:aigDraw,buit:aigEmptyNow},
 {id:'fum',name:'Anells de fum',what:'anells de fum de colors',nou:fumNew,prem:fumPress,pas:fumStep,pinta:fumDraw,buit:fumEmptyNow},
 {id:'lava',name:'Làmpada de lava',what:'bombolles de cera de colors',nou:lavNew,prem:lavPress,pas:lavStep,pinta:lavDraw,buit:lavEmptyNow},
 {id:'ferro',name:'Ferrofluid',what:'punxes d’un líquid magnètic',nou:ferNew,prem:ferPress,pas:ferStep,pinta:ferDraw,buit:ferEmptyNow},
 {id:'oli',name:'Oli i aigua',what:'dits d’aigua de colors dins l’oli',nou:oliNew,prem:oliPress,pas:oliStep,pinta:oliDraw,buit:oliEmptyNow},
 {id:'nebulosa',name:'Nebulosa',what:'bombolles de gas encès al voltant d’estels nous',nou:nebNew,prem:nebPress,pas:nebStep,pinta:nebDraw,buit:nebEmptyNow}]);
export const BB_IDS=Object.freeze(BB_STIMS.map(x=>x.id));
export const BB_PRESSES=Object.freeze([4,8,12]);
export const bbPresses=s=>BB_PRESSES.includes(+s?.bbPresses)?+s.bbPresses:8;
export const bbStim=F=>BB_STIMS[((F.i%BB_STIMS.length)+BB_STIMS.length)%BB_STIMS.length];
// times (s): the shortest step after a press, the shortest full moment, the black between two matters, the longest way out. No way out
// may be long (Marc, 10 November 2026: a simulation sometimes takes too long to empty): whatever is still on the screen BB_OUT_FADE
// seconds after the last press fades to black, and at BB_OUT_MAX the next matter is on its way, about as long as the full moment
export const BB_STEP=2.2,BB_FULL=6.5,BB_BLACK=1.2,BB_OUT_FADE=4.5,BB_OUT_MAX=7;
// how dark the picture is made over the matter (0 none, 1 black): the fade of a long way out, and the black between two matters
export function bbFade(F){if(!F)return 0;if(F.phase==='black')return 1;if(F.phase!=='out')return 0;const u=Math.max(0,Math.min(1,(F.t-F.at-BB_OUT_FADE)/(BB_OUT_MAX-BB_OUT_FADE)));return u*u*(3-2*u);}

export function bbNew(s){const first=Math.max(0,BB_IDS.indexOf(s?.bbFirst));
 return {t:0,i:first,first,lap:0,k:0,P:bbPresses(s),S:null,AR:16/9,phase:'rest',at:0,end:0,wait:null,seed:Math.floor(Math.random()*1e6),notes:[],chord:0,uid:0,done:0,matters:0,lastEv:-9,lastFx:{},cues:['matter']};}
export function bbStart(game,s){game.bombolles=bbNew(s);game.count=0;game.completed=0;return game.bombolles;}
// while the matter goes out (and in the black after it) a press does nothing; with «Espera que acabi cada efecte», neither during a phrase
export function bbBlocked(game,s){const F=game?.bombolles;if(!F)return false;if(F.phase==='out'||F.phase==='black')return true;if(F.phase==='run')return s?.lock!==false;return false;}

// A press: the next step of the matter, and its phrase of music.
export function bbPress(game,s){const F=game?.bombolles;if(!F)return false;if(F.phase==='out'||F.phase==='black')return false;
 if(F.phase==='run'){if(s?.lock!==false)return false;F.notes=F.notes.filter(n=>n.sent);}
 const M=bbStim(F);
 if(F.k===0||!F.S){F.P=bbPresses(s);F.S=M.nou({seed:(F.seed+F.i*7919+F.lap*104729)%2147483647||7,lap:F.lap,AR:F.AR||16/9,presses:F.P});F.k=0;}
 F.k++;M.prem(F.S,F.k,F.P);const role=bmbRole(F.k,F.P),U=BB_MUSIC[M.id],ph=bbPhrase(U,role,F.k,F.P,F.lap),t0=F.t+.05;
 F.chord=ph.chord;for(const n of ph.notes)F.notes.push({id:++F.uid,at:t0+n.beat*U.unit,ev:n,sent:false});
 const len=ph.length*U.unit;game.count=F.k;F.at=F.t;
 if(role==='surt'){F.phase='out';F.end=F.t+len;F.wait=escWaitTurn(F.wait,'run',F.t);F.cues.push('out');return true;}
 F.phase='run';F.end=F.t+Math.max(len,role==='ple'?BB_FULL:BB_STEP);F.wait=escWaitTurn(F.wait,'run',F.t);return true;}

// The time of the matter runs at the pace of the wait: while it waits for a press it slows down to a drift (15 %) and darkens a
// little (as in the other activities, «Senyal de torn»); while it goes out it always runs at full pace.
export function bbRate(F,s){if(F.phase==='out'||F.phase==='black'||s?.waitCue===false)return 1;return Math.max(.15,escWaitClock(F.wait||ESC_WAIT_START,F.t).rate);}
export function bbTick(game,s,dt){const F=game?.bombolles;if(!F)return;F.t+=dt;
 if(F.S){const M=bbStim(F);let r=dt*bbRate(F,s);while(r>1e-6){const h=Math.min(r,1/60);M.pas(F.S,h);r-=h;}}
 if(F.phase==='run'&&F.t>=F.end){F.phase='rest';F.done++;game.completed=F.done;F.wait=escWaitTurn(F.wait,'wait',F.t);}
 if(F.phase==='out'&&(F.t-F.at>=BB_OUT_MAX||(F.t>=F.end&&(!F.S||bbStim(F).buit(F.S))))){F.phase='black';F.at=F.t;F.done++;game.completed=F.done;F.cues.push('black');}
 if(F.phase==='black'&&F.t-F.at>=BB_BLACK){F.i=(F.i+1)%BB_STIMS.length;if(F.i===F.first)F.lap++;F.k=0;game.count=0;F.S=null;F.P=bbPresses(s);F.matters++;F.phase='rest';F.at=F.t;F.notes=F.notes.filter(n=>!n.sent);F.cues.push('matter');
  F.wait=escWaitTurn({mode:'run',at:F.t,idle:0,rate:1,dark:0},'wait',F.t+.01);}
 if(F.notes.length>160)F.notes=F.notes.filter(n=>!n.sent||n.at>F.t-2);}

// The words for a screen reader (no words are ever drawn in the scene).
export function bbStatus(game,s){const F=game?.bombolles;if(!F)return '';const M=bbStim(F);
 if(F.phase==='out')return `${M.name}: tot surt per les vores i la pantalla torna a ser negra.`;
 if(F.phase==='black')return `Ara ve ${BB_STIMS[(F.i+1)%BB_STIMS.length].name}.`;
 if(F.k===0)return `${M.name}: la pantalla és negra i espera la primera pulsació. Vindran ${M.what}.`;
 const role=bmbRole(F.k,F.P);
 if(F.phase==='run')return role==='arriba'?`${M.name}: ${M.what} entren per una vora.`:role==='ple'?`${M.name}: ${M.what} omplen tota la pantalla, amb tota la música.`:`${M.name}: ${M.what} creixen. Pulsació ${F.k} de ${F.P}.`;
 return F.k>=F.P-1?`${M.name}: la pantalla és plena. La pulsació següent ho fa sortir tot.`:`${M.name}: espera la pulsació següent. Pulsació ${F.k} de ${F.P}.`;}
export function bbProgress(game,s){const F=game?.bombolles;if(!F)return '';const done=F.phase==='out'||F.phase==='black'?F.P:F.k;return Array.from({length:F.P},(_,i)=>`<span class="${i<done?'done':''}"></span>`).join('');}
export function bbHelp(s){const P=bbPresses(s);return `<strong>Cada pulsació fa entrar i créixer una matèria, amb la seva música. A la pulsació ${P-1} omple la pantalla, i a la ${P} se’n va fins que tot torna a ser negre. Després ve la matèria següent: ${BB_STIMS.map(x=>x.name.toLowerCase()).join(', ').replace(/, ([^,]*)$/,' i $1')}.</strong><br>${s?.lock!==false?'Espera que acabi cada frase de música abans de tornar a prémer.':'Pots tornar a prémer abans que acabi la música.'} Mentre la matèria surt, les pulsacions no fan res.`;}

// ── The music ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each matter has its key, its mode, its metre and its instruments (criteria of design, after the plan of 9 November 2026: the soap
// bubbles bright and high in E lydian, the plasma quick in B lydian (a vibraphone note and a soft recorded crackle for each arc), the water in D dorian and 6/8, the smoke in F with a flute and a
// clarinet that follows it in canon, the lava lamp slow in B flat dorian with a clarinet over a vibraphone (a lamp makes no sound of its
// own: no recorded effects), the ferrofluid in E flat minor with two instruments that take
// turns (a drop that comes off a spike rings a glockenspiel, and drips when it falls back), the oil in G mixolydian and 6/8 (water pushed into oil between plates is silent: no recorded effects), the nebula slow in D flat, a glockenspiel note for each star that lights up and a harp for each group of supernovae: space carries no sound, so no recorded effects). unit: the seconds of an eighth note; M: eighths in a bar.
// prog: the degree of the chord of each press; cont: melodic shapes (steps of the scale above the root of the chord); snap: the
// pitch classes the melody keeps to (a pentatonic over the chords); trem: the middle voice in tremolo; canon: a second voice that
// follows the melody; sync: a second voice on the off-beats; gong: a gong at the full moment.
export const BB_MODES=Object.freeze({lydian:[0,2,4,6,7,9,11],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],mixo:[0,2,4,5,7,9,10],minor:[0,2,3,5,7,8,10]});
export const BB_RHYTHMS=Object.freeze({'34':[[0,2,4],[0,2,3,4],[0,1,2,4],[0,3,4,5]],'68':[[0,2,3,5],[0,1,2,3,5],[0,3,4,5],[0,2,3,4]],'44':[[0,2,4,6],[0,2,3,4,6],[0,3,4,6],[0,1,2,4,6]]});
const BB_CONT=[[4,2,4,7],[7,6,4,2],[2,4,5,4,2],[0,2,4,6,7],[7,4,2,0],[4,5,7,9,7]];
export const BB_MUSIC=Object.freeze({
 sabo:{key:64,mode:'lydian',meter:'34',unit:.4,M:6,lead:'dsGlock',mid:'harpRec',bass:'celliPizzRec',spark:'vibRec',prog:[0,1,0,4,5,1,4,0],cont:[0,1,3,5],
  ev:{esclat:['harpRec',1,.16],fusio:['vibRec',0,.14]},fx:{esclat:['cincRec','berta-pop-v1',.1,.25],toc:['toonRec','plop',.025,.45],entra:['masiaRec','bombolles',.05,.8]}},
 plasma:{key:71,mode:'lydian',meter:'44',unit:.227,M:8,lead:'vibRec',mid:'guitarRec',bass:'dsArpa',spark:'dsTriangle',trem:true,prog:[0,1,0,1,4,5,1,0],cont:[3,0,5,2],
  ev:{pol:['vibRec',0,.14],arc:['vibRec',1,.15]},fx:{arc:['fireRec','crackle',.03,.7],ple:['fizzRec','fizz',.025,4]}},
 aigua:{key:62,mode:'dorian',meter:'68',unit:.333,M:6,lead:'kalimbaRec',mid:'dsMarimba',bass:'uduRec',spark:'glockRec',prog:[0,3,0,6,0,3,4,0],cont:[1,4,2,5],
  ev:{fusio:['kalimbaRec',0,.18],tinta:['glockRec',1,.1],trenca:['glockRec',2,.08]},fx:{entra:['pouRec','bombolles',.06,1],tinta:['masiaRec','degoteig',.05,.6],fusio:['pintaRec','gota',.06,.35]}},
 fum:{key:65,mode:'major',meter:'44',unit:.48,M:8,lead:'dsFlauta',mid:'harpRec',bass:'celliPizzRec',spark:'harpRec',canon:'clarinetRec',snap:[0,2,4,7,9],prog:[0,3,5,4,0,5,3,4],cont:[0,2,4,3],
  ev:{anell:['harpRec',0,.15]},fx:{anell:['masiaRec','whoosh',.04,.9]}},
 lava:{key:58,mode:'dorian',meter:'44',unit:.42,M:8,lead:'clarinetRec',mid:'vibRec',bass:'celliPizzRec',spark:'kalimbaRec',snap:[0,3,5,7,10],prog:[0,3,0,4,5,3,4,0],cont:[2,0,4,1],
  ev:{trenca:['vibRec',0,.13],fusio:['kalimbaRec',0,.13]},fx:{}},
 ferro:{key:63,mode:'minor',meter:'44',unit:.3,M:8,lead:'kalimbaRec',mid:'vibRec',bass:'dsMarimba',spark:'dsGlock',sync:true,gong:true,snap:[0,3,5,7,10],prog:[0,5,6,0,3,5,6,0],cont:[3,1,5,0],
  ev:{trenca:['dsGlock',0,.12],camp:['vibRec',0,.13]},fx:{fusio:['pintaRec','gota',.04,.5]}},
 oli:{key:67,mode:'mixo',meter:'68',unit:.3,M:6,lead:'guitarRec',mid:'harpRec',bass:'celliPizzRec',spark:'kalimbaRec',prog:[0,6,3,0,6,3,4,0],cont:[2,5,0,4],
  ev:{fusio:['kalimbaRec',0,.15],raig:['harpRec',2,.1]},fx:{}},
 nebulosa:{key:61,mode:'major',meter:'34',unit:.5,M:6,lead:'dsPiano',mid:'dsArpa',bass:'celliPizzRec',spark:'dsGlock',gong:true,prog:[0,3,5,4,0,3,1,4],cont:[4,0,2,5],
  ev:{estel:['dsGlock',1,.11],nova:['dsArpa',0,.15]},fx:{}}});
const BB_UNPITCHED=new Set(['dsTriangle','dsGong','triangleRec','cymbalRec']);
// a degree of the scale (any integer: it wraps into the octaves) as a MIDI note
export function bbMidi(U,deg,oct=0){const m=BB_MODES[U.mode],n=m.length,o=Math.floor(deg/n);return U.key+12*(o+oct)+m[((deg%n)+n)%n];}
// into the range of the instrument's recordings (escRange: four semitones beyond its lowest and highest zone), by octaves
export function bbFit(inst,midi){if(BB_UNPITCHED.has(inst)||!SAMPLE_BANK[inst])return midi;const [lo,hi]=escRange(inst);while(midi<lo)midi+=12;while(midi>hi)midi-=12;return midi;}
// the nearest pitch class of the pentatonic (snap), the lower one on a tie
function bbSnap(U,midi){if(!U.snap)return midi;const pc=((midi-U.key)%12+12)%12;let best=0,bd=99;for(const p of U.snap){const d=Math.min(Math.abs(p-pc),12-Math.abs(p-pc));if(d<bd){bd=d;best=p;}}
 let out=midi-pc+best;if(out-midi>6)out-=12;if(midi-out>6)out+=12;return out;}
// The phrase of press k of P: {notes:[{beat (eighths), inst, midi:[n], vel, len (s), pan}], length (eighths), chord (degree)}.
export function bbPhrase(U,role,k,P,lap=0){const notes=[],M=U.M,rhs=BB_RHYTHMS[U.meter],ci=((k-1+lap*3)%U.prog.length+U.prog.length)%U.prog.length,root=U.prog[ci];
 const cont=BB_CONT[U.cont[(k+lap)%U.cont.length]],rh=rhs[(k+lap*2)%rhs.length];
 const N=(inst,deg,oct,beat,vel,len,pan=0,melody=false)=>{if(!inst)return;let m=bbMidi(U,deg,oct);if(melody)m=bbSnap(U,m);notes.push({beat,inst,midi:[bbFit(inst,m)],vel,len,pan});};
 const lead=(deg,beat,vel,len,pan)=>{N(U.lead,deg,1,beat,vel,len,pan,true);
  if(U.canon)N(U.canon,deg-2,0,beat+2,vel*.7,len,-pan,true);
  if(U.sync)N(U.spark,deg+2,1,beat+1,vel*.55,.9,-pan,true);};
 const mid=(deg,beat,vel,len)=>{N(U.mid,deg,0,beat,vel,len,0);if(U.trem)for(let r=1;r<4;r++)N(U.mid,deg,0,beat+r*.5,vel*(1-r*.2),len*.5,0);};
 const tri=d=>[d,d+2,d+4];
 if(role==='arriba'){
  N(U.bass,root,-2,0,.42,2.6);
  rh.slice(0,3).forEach((b,j)=>lead(root+cont[j],b,.32+.03*j,1.5,(j-1)*.3));
  if(k>=2)tri(root).forEach((d,j)=>mid(d,j*2+1,.22,1.6));
  return {notes,length:M+2,chord:root};}
 if(role==='creix'){const g=Math.min(1,(k-2)/Math.max(1,P-4));
  N(U.bass,root,-2,0,.45,2.4);if(M===8)N(U.bass,root+4,-2,4,.3,1.8);else N(U.bass,root+4,-2,3,.28,1.6);
  const pat=M===6?[0,1,2,1,2,1]:[0,1,2,3,2,1,2,3],T=[0,2,4,7];pat.forEach((p,j)=>mid(root+T[p],j,.2+.06*g,1.4));
  rh.forEach((b,j)=>lead(root+cont[j%cont.length],b,.36+.08*g,1.5,((j%3)-1)*.35));
  if(g>.3)N(U.spark,root+cont[(rh.length-1)%cont.length]+7,1,M+.5,.2,1.6,.3,true);
  return {notes,length:M+2,chord:root};}
 if(role==='ple'){// three bars (two in the slow bars of eight), every layer: the chord of the press, the next one, the tonic
  const B=M===8&&U.unit>=.35?2:3,ch=B===3?[root,U.prog[(ci+1)%U.prog.length],0]:[root,0],end=(B-1)*M;
  ch.forEach((c,b)=>{const o=b*M;N(U.bass,c,-2,o,.5,2.8);N(U.bass,c+4,-2,o+M/2,.32,1.8);
   [0,2,4,7,9,11].slice(0,M===8?6:5).forEach((d,j)=>mid(c+d,o+j*(M===8?1.25:1.1),.26,1.8));});
  rh.forEach((b,j)=>lead(root+cont[j%cont.length],b,.42,1.6,((j%3)-1)*.35));
  if(B===3)rh.forEach((b,j)=>lead(ch[1]+cont[j%cont.length]+1,M+b,.42,1.6,((j%3)-1)*-.35));
  N(U.lead,2,1,end,.4,1.2,0,true);N(U.lead,1,1,end+1,.38,1.2,0,true);N(U.lead,0,1,end+2,.44,3,0,true);
  for(let j=0;j<6;j++)N(U.spark,ch[B-2]+[11,9,7,4,2,0][j],1,(B-2)*M+j*(M/6),.2-.015*j,1.6,(j%2?.4:-.4),true);
  if(U.gong)N('dsGong',0,0,end,.28,5);
  return {notes,length:B*M+3,chord:0};}
 // the way out: a falling line that ends on the tonic, the bass and the chord of the tonic, struck once
 N(U.bass,root,-2,0,.4,2.4);
 for(let j=0;j<M;j++)N(U.lead,M-1-j,1,j,.34-.012*j,1.3,(j%2?.3:-.3),true);
 N(U.lead,0,1,M,.38,3.2,0,true);tri(0).forEach(d=>N(U.mid,d,0,M,.24,3.2));N(U.bass,0,-2,M,.45,3.6);N(U.spark,7,1,M+1,.16,2.4,.2,true);
 return {notes,length:2*M+2,chord:0};}

// ── Sounds ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
class BbSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.active=new Set();}
 one(bank,name,level=1,pan=0,when=0,rate=1){const z=sampleZone(bank,0,name);if(!z||!z.buffer)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift,z.duration||undefined);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();}}
let BB_BUS=null;
const bbBus=(ctx,out)=>{if(!ctx||!out)return null;if(!BB_BUS||BB_BUS.context!==ctx)BB_BUS=new BbSound(ctx,out);return BB_BUS;};
export function bbSilence(){BB_BUS?.stop();}
// The events of the matter since the last frame: for each, at most one note of the chord (no closer than 0.22 s to the one before) and
// its recorded sound (no closer than its own gap to the one before). Returned for the tests; play(e, delay, length) sounds a note.
export function bbEvents(F,play,fx){const S=F.S;if(!S||!S.ev?.length)return [];const M=bbStim(F),U=BB_MUSIC[M.id],out=[];
 for(const e of S.ev){const pan=e.x!=null?Math.max(-.7,Math.min(.7,(e.x-.5)*1.4)):0,n=U.ev[e.type],f=U.fx[e.type];
  if(n&&F.t-F.lastEv>=.22){F.lastEv=F.t;const tones=[0,2,4],d=F.chord+tones[(F.uid++)%3],ev={inst:n[0],midi:[bbFit(n[0],bbMidi(U,d,n[1]))],vel:n[2],len:1.4,pan};out.push(['note',ev]);play?.(ev,0,1.4);}
  if(f&&F.t-(F.lastFx[f[1]]??-9)>=f[3]){F.lastFx[f[1]]=F.t;out.push(['fx',f]);fx?.(f,pan);}}
 S.ev.length=0;return out;}
// Each frame: the notes of the phrases that fall within half a second are given to the audio at their exact delay (less the output
// latency of the device), and the events of the matter sound.
export function bbAudio(game,s,ctx,out,play){const F=game?.bombolles;if(!F)return;F.cues.splice(0);
 if(!s.sound||ctx?.state!=='running'){for(const n of F.notes)if(!n.sent&&n.at<F.t+.5)n.sent=true;if(F.S?.ev)F.S.ev.length=0;return;}
 const bus=bbBus(ctx,out),lat=Math.min(.1,Math.max(0,ctx.outputLatency||ctx.baseLatency||0));
 for(const n of F.notes){if(n.sent||n.at>F.t+.5)continue;n.sent=true;if(n.at<F.t-.12)continue;play(n.ev,Math.max(0,n.at-F.t-lat),n.ev.len);}
 bbEvents(F,play,(f,pan)=>bus?.one(f[0],f[1],f[2],pan,0,.92+.16*Math.random()));}

// Fractals a la natura (CE46, 0.73) · the model: twenty fractal forms of nature in turn, drawn with lines of coloured light on black;
// the presses of each one, its way out to black, and its music.
// Marc, 11 November 2026: «una nova activitat basada en estímuls de línies de colors sobre fons negre, que sigui ben espectacular i que
// la temàtica sigui Fractals a la natura… 20 estímuls diferents per una activitat de causa efecte».
// Each form comes out of a published model of growth (the references are in the comments of each stimulus, fractals-formes.js and the
// modules after it), never out of a drawing: the shapes appear because the rule of growth makes them.
// The arc (Marc, 11 November 2026, 16:13: «Cada pulsació mostrarà l'escena completa, 20 estímuls, 20 pulsacions i després es torna a
// començar»): each press grows one whole form, all its acts one after the other in a few seconds, and a wave of light runs through it
// from the root to the tips. It then stays, breathing slowly, until the next press: its lines are gathered back from the tips to the
// root while the next form begins to grow. After the twentieth the first one comes back with its second palette and other seeds.
// And (16:14): «En cada estímul s'hi ha d'apreciar molt bé la fractalitat i la seva bellesa»: the same shape at several scales, readable.
import {escWaitTurn,escWaitClock,ESC_WAIT_START} from './escenari.js';
import {sampleZone} from './sampler.js';
import {bbPhrase,bbMidi,bbFit} from './bombolles.js';
import {frStore,frRandom,frGrownAt} from './fractals-motor.js';
import {FR_FALGUERES,FR_FLOCS,FR_GIRASOL,FR_LLAMPS,FR_ARBRE} from './fractals-formes1.js';
import {FR_RIU,FR_CORALL,FR_ROMANESCO} from './fractals-formes2.js';

export const FR_CAUSE=Object.freeze({id:'fractals',code:'CE46',type:'ce',level:'01 · Descobrir',name:'Fractals a la natura',desc:'Vint formes de la natura que es repeteixen dins seu creixen amb línies de llum de colors sobre negre: falgueres, gira-sols, flocs de neu, arbres, llamps, rius, corals, neurones… cadascuna amb la seva música.',tag:'20 formes · una a cada pulsació',time:'Al teu ritme',fractals:true,recorded:true});

// The twenty forms, in this order (alternating plants, water and stone, light and animals, so that two forms in a row never look alike).
export const FR_STIMS=Object.freeze([FR_FALGUERES,FR_FLOCS,FR_GIRASOL,FR_LLAMPS,FR_ARBRE,FR_RIU,FR_CORALL,FR_ROMANESCO]);
export const FR_IDS=Object.freeze(FR_STIMS.map(x=>x.id));
export const frStim=F=>FR_STIMS[((F.i%FR_STIMS.length)+FR_STIMS.length)%FR_STIMS.length];
// How long a form takes to grow (setting «Creixement»): the acts begin over FR_SPREAD seconds, and the wave of light comes after them.
export const FR_GROW=Object.freeze({rapid:.7,normal:1,lent:1.45});
export const frGrowK=s=>FR_GROW[s?.frGrow]||1;
// times (s): the acts of a form begin over FR_SPREAD; the shortest run of a press; the way out of the form before
export const FR_SPREAD=3.4,FR_RUN=7.5,FR_OUT=2.6;
export function frNew(s){const first=Math.max(0,FR_IDS.indexOf(s?.frFirst));
 return {t:0,i:first-1,first,lap:0,k:0,S:null,old:null,AR:16/9,phase:'rest',at:0,end:0,wait:null,seed:Math.floor(Math.random()*1e6),notes:[],chord:0,uid:0,done:0,forms:0,lastEv:-9,lastFx:{},cues:['start']};}
export function frStart(game,s){game.fractals=frNew(s);game.count=0;game.completed=0;return game.fractals;}
// while a form grows, a press does nothing with «Espera que acabi cada efecte»
export function frBlocked(game,s){const F=game?.fractals;if(!F)return false;return F.phase==='run'&&s?.lock!==false;}
// The state of a form: its clock, its segments, its seed and its acts.
export function frForm(M,seed,lap,AR){const S={id:M.id,t:0,st:frStore(8192),AR,rnd:frRandom(seed),seed,lap,pulses:[],exit:-1,ev:[],evq:[],live:[],wake:[],acts:M.acts,full:-1};M.init?.(S);return S;}
// The whole form: its acts one after the other over FR_SPREAD·k seconds, a pulse of light at the start and a wave when it is grown.
export function frGrowForm(S,k=1){const n=S.acts.length,t0=S.t+.05;S.k=k;S.acts.forEach((act,j)=>act(S,t0+(n>1?j/(n-1):0)*FR_SPREAD*k,j));S.pulses=[t0];
 const g=Math.max(t0+FR_SPREAD*k+1,Math.min(frGrownAt(S.st),t0+FR_SPREAD*k+5));S.full=g;S.pulses.push(g,g+1.7);return g-S.t;}
// the clock of a form: live models step, waiting ones start, events come due
export function frStepForm(S,dt){S.t+=dt;
 for(let i=S.wake.length-1;i>=0;i--)if(S.wake[i].at<=S.t){S.wake[i].go();S.wake.splice(i,1);}
 for(let i=S.live.length-1;i>=0;i--)if(S.live[i].live(dt))S.live.splice(i,1);
 if(S.evq.length){S.evq.sort((a,b)=>a.at-b.at);while(S.evq.length&&S.evq[0].at<=S.t)S.ev.push(S.evq.shift());if(S.ev.length>24)S.ev.splice(0,S.ev.length-24);}}
export const frEmpty=S=>S.exit>=0&&S.t-S.exit>=FR_OUT;

// A press: the form on the screen goes back to its roots, and the next one grows whole, with its phrase of music.
export function frPress(game,s){const F=game?.fractals;if(!F)return false;if(frBlocked(game,s))return false;
 if(F.phase==='run')F.notes=F.notes.filter(n=>n.sent);
 if(F.S){F.S.exit=F.S.t;F.S.live.length=0;F.S.wake.length=0;F.S.evq.length=0;F.old=F.S;}
 F.i++;if(F.i>=F.first+FR_STIMS.length){F.i-=FR_STIMS.length;F.lap++;}
 const M=frStim(F);F.S=frForm(M,(F.seed+F.i*7919+F.lap*104729)%2147483647||7,F.lap,F.AR||16/9);
 const grown=frGrowForm(F.S,frGrowK(s));F.k++;F.forms++;game.count=F.k;
 const U=FR_MUSIC[M.id]||FR_MUSIC.falgueres,ph=bbPhrase(U,'ple',3+F.lap,8,F.lap),t0=F.t+.05;
 F.chord=ph.chord;for(const n of ph.notes)F.notes.push({id:++F.uid,at:t0+n.beat*U.unit,ev:n,sent:false});
 F.at=F.t;F.phase='run';F.end=F.t+Math.max(ph.length*U.unit,FR_RUN,Math.min(grown,12));F.wait=escWaitTurn(F.wait,'run',F.t);F.cues.push('form');return true;}

// The time of the form runs at the pace of the wait: while it waits for a press it slows down to a drift (15 %) and darkens a little
// («Senyal de torn», as in the other activities); while it goes out it always runs at full pace.
export function frRate(F,s){if(F.phase==='run'||s?.waitCue===false)return 1;return Math.max(.15,escWaitClock(F.wait||ESC_WAIT_START,F.t).rate);}
export function frTick(game,s,dt){const F=game?.fractals;if(!F)return;F.t+=dt;
 if(F.S){let r=dt*frRate(F,s);while(r>1e-6){const h=Math.min(r,1/30);frStepForm(F.S,h);r-=h;}}
 // the form before goes out at full pace, whatever the wait
 if(F.old){let r=dt;while(r>1e-6){const h=Math.min(r,1/30);frStepForm(F.old,h);r-=h;}if(frEmpty(F.old))F.old=null;}
 if(F.phase==='run'&&F.t>=F.end){F.phase='rest';F.done++;game.completed=F.done;F.wait=escWaitTurn(F.wait,'wait',F.t);}
 if(F.notes.length>200)F.notes=F.notes.filter(n=>!n.sent||n.at>F.t-2);}

// The words for a screen reader (no words are ever drawn in the scene).
export const frNumber=F=>((F.i-F.first)%FR_STIMS.length+FR_STIMS.length)%FR_STIMS.length+1;
export function frStatus(game,s){const F=game?.fractals;if(!F)return '';
 if(!F.S)return 'La pantalla és negra i espera la primera pulsació. Cada pulsació fa créixer una forma de la natura.';
 const M=frStim(F),n=frNumber(F);
 if(F.phase==='run')return `${M.name}, ${n} de ${FR_STIMS.length}: creixen ${M.what}.`;
 return `${M.name}, ${n} de ${FR_STIMS.length}: la forma és completa. La pulsació següent en porta una altra.`;}
export function frProgress(game,s){const F=game?.fractals;if(!F)return '';const n=F.S?frNumber(F):0;return Array.from({length:FR_STIMS.length},(_,i)=>`<span class="${i<n?'done':''}"></span>`).join('');}
export function frHelp(s){return `<strong>Cada pulsació fa créixer sencera una forma de la natura amb línies de llum de colors, i una ona de llum la recorre. La pulsació següent la recull cap a l’arrel i en fa créixer una altra: n’hi ha vint, i després tornen a començar amb uns altres colors.</strong><br>${s?.lock!==false?'Mentre una forma creix, les pulsacions no fan res.':'Pots prémer mentre una forma creix: ve la següent.'}`;}

// ── The music ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each form has its key, mode, metre and recorded instruments (plucked or struck, as in the rest of Pim Pam: no pads, no organs, every
// note dies away); the phrases are made by the phrase maker of the Laboratori de matèria (bbPhrase). The events of the growth (a new
// frond, a new crystal, a spiral that lights up) add a note of the chord, and some a recorded sound of their own.
export const FR_MUSIC=Object.freeze({
 falgueres:{key:62,mode:'mixo',meter:'68',unit:.36,M:6,lead:'kalimbaRec',mid:'guitarRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,6,3,0,4,6,3,0],cont:[2,4,0,5],ev:{neix:['harpRec',0,.16]},fx:{}},
 girasol:{key:67,mode:'major',meter:'34',unit:.42,M:6,lead:'dsGlock',mid:'harpRec',bass:'celliPizzRec',spark:'vibRec',prog:[0,4,5,3,0,1,4,0],cont:[0,3,1,5],ev:{neix:['vibRec',0,.15],espiral:['harpRec',1,.14]},fx:{}},
 flocs:{key:64,mode:'lydian',meter:'34',unit:.45,M:6,lead:'dsPiano',mid:'dsArpa',bass:'celliPizzRec',spark:'dsGlock',prog:[0,1,0,4,5,1,4,0],cont:[4,0,2,5],ev:{neix:['dsGlock',1,.12],gel:['glockRec',1,.06]},fx:{}},
 arbre:{key:65,mode:'major',meter:'44',unit:.4,M:8,lead:'dsFlauta',mid:'guitarRec',bass:'celliPizzRec',spark:'kalimbaRec',canon:'clarinetRec',snap:[0,2,4,7,9],prog:[0,3,5,4,0,5,3,4],cont:[0,2,4,3],ev:{neix:['harpRec',0,.14],flor:['glockRec',1,.1]},fx:{}}});

// ── Sounds ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
class FrSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.active=new Set();}
 one(bank,name,level=1,pan=0,when=0,rate=1){const z=sampleZone(bank,0,name);if(!z||!z.buffer)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift,z.duration||undefined);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();}}
let FR_BUS=null;
const frBus=(ctx,out)=>{if(!ctx||!out)return null;if(!FR_BUS||FR_BUS.context!==ctx)FR_BUS=new FrSound(ctx,out);return FR_BUS;};
export function frSilence(){FR_BUS?.stop();}
// The events of the growth since the last frame: for each, at most one note of the chord (no closer than 0.22 s to the one before) and
// its recorded sound (no closer than its own gap). Returned for the tests; play(e, delay, length) sounds a note.
export function frEvents(F,play,fx){const S=F.S;if(F.old)F.old.ev.length=0;if(!S||!S.ev.length)return [];const M=frStim(F),U=FR_MUSIC[M.id]||FR_MUSIC.falgueres,out=[];
 for(const e of S.ev){const pan=Math.max(-.7,Math.min(.7,(e.x-.5)*1.4)),n=U.ev[e.type],f=U.fx[e.type];
  if(n&&F.t-F.lastEv>=.22){F.lastEv=F.t;const tones=[0,2,4],d=F.chord+tones[(F.uid++)%3],ev={inst:n[0],midi:[bbFit(n[0],bbMidi(U,d,n[1]))],vel:n[2],len:1.4,pan};out.push(['note',ev]);play?.(ev,0,1.4);}
  if(f&&F.t-(F.lastFx[f[1]]??-9)>=f[3]){F.lastFx[f[1]]=F.t;out.push(['fx',f]);fx?.(f,pan);}}
 S.ev.length=0;return out;}
export function frAudio(game,s,ctx,out,play){const F=game?.fractals;if(!F)return;F.cues.splice(0);
 if(!s.sound||ctx?.state!=='running'){for(const n of F.notes)if(!n.sent&&n.at<F.t+.5)n.sent=true;if(F.S)F.S.ev.length=0;return;}
 const bus=frBus(ctx,out),lat=Math.min(.1,Math.max(0,ctx.outputLatency||ctx.baseLatency||0));
 for(const n of F.notes){if(n.sent||n.at>F.t+.5)continue;n.sent=true;if(n.at<F.t-.12)continue;play(n.ev,Math.max(0,n.at-F.t-lat),n.ev.len);}
 frEvents(F,play,(f,pan)=>bus?.one(f[0],f[1],f[2],pan,0,.94+.12*Math.random()));}

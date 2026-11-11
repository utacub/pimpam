// Fractals a la natura (CE46, 0.74) · the model: twenty fractal forms of nature in turn, drawn with lines of coloured light on black;
// the presses of each one, its way out to black, and its music.
// Marc, 11 November 2026: «una nova activitat basada en estímuls de línies de colors sobre fons negre, que sigui ben espectacular i que
// la temàtica sigui Fractals a la natura… 20 estímuls diferents per una activitat de causa efecte».
// Thirteen forms come out of a published model of growth (the references are in the comments of each stimulus, fractals-formes.js and
// the modules after it): their shapes appear because the rule of growth makes them. The other seven (micel·li, fang, ploma de paó,
// serralades, arrels, petxina, dent de lleó) follow the network traced from their concept picture (tools/fractals-traca.py), grown
// level by level from the root to the tips, so that they look as close as possible to it (Marc: «un resultat idèntic al del concept art»).
// The arc (Marc, 11 November 2026, 16:13: «Cada pulsació mostrarà l'escena completa, 20 estímuls, 20 pulsacions i després es torna a
// començar»): each press grows one whole form, all its acts one after the other in a few seconds, and a wave of light runs through it
// from the root to the tips. It then stays, breathing slowly, until the next press: its lines are gathered back from the tips to the
// root while the next form begins to grow. After the twentieth the first one comes back with its second palette and other seeds.
// 0.74.2 (Marc, 11 November 2026, 21:10: «allargues cada estímul per fer marxa enrere en la crescuda de l'estímul fins que la pantalla
// torni a quedar en negre, i així el següent estímul comença sobre la pantalla negra. El creixement fractal també hauria de ser més lent,
// durar un parell de segons més»): each press now grows its form more slowly (×1.45), shows it whole with its waves of light, and then
// plays its growth backwards, the last lines first, until the screen is black again; the next press starts on black.
// And (16:14): «En cada estímul s'hi ha d'apreciar molt bé la fractalitat i la seva bellesa»: the same shape at several scales, readable.
import {escWaitTurn,escWaitClock,ESC_WAIT_START} from './escenari.js';
import {sampleZone} from './sampler.js';
import {bbPhrase,bbMidi,bbFit} from './bombolles.js';
import {frStore,frRandom,frGrownAt,FR_STRIDE} from './fractals-motor.js';
import {FR_FALGUERES,FR_FLOCS,FR_GIRASOL,FR_LLAMPS,FR_ARBRE} from './fractals-formes1.js';
import {FR_RIU,FR_CORALL,FR_ROMANESCO,FR_NEURONES,FR_COSTA} from './fractals-formes2.js';
import {FR_FULLA,FR_GEL,FR_NAUTILUS,FR_MICELI,FR_FANG} from './fractals-formes3.js';
import {FR_PAO,FR_SERRA,FR_ARRELS,FR_PETXINA,FR_DENT} from './fractals-formes4.js';

export const FR_CAUSE=Object.freeze({id:'fractals',code:'CE46',type:'ce',level:'01 · Descobrir',name:'Fractals a la natura',desc:'Vint formes de la natura que es repeteixen dins seu, fetes de línies de llum de colors sobre negre: falgueres, flocs de neu, gira-sols, llamps, arbres, rius, corals, neurones… Cada pulsació en fa créixer una, amb la seva música.',tag:'20 formes · una a cada pulsació',time:'Al teu ritme',fractals:true,recorded:true});

// The twenty forms, in this order (alternating plants, water and stone, light and animals, so that two forms in a row never look alike).
export const FR_STIMS=Object.freeze([FR_FALGUERES,FR_FLOCS,FR_GIRASOL,FR_LLAMPS,FR_ARBRE,FR_RIU,FR_CORALL,FR_ROMANESCO,FR_NEURONES,FR_COSTA,FR_FULLA,FR_GEL,FR_NAUTILUS,FR_MICELI,FR_FANG,FR_PAO,FR_SERRA,FR_ARRELS,FR_PETXINA,FR_DENT]);
export const FR_IDS=Object.freeze(FR_STIMS.map(x=>x.id));
export const frStim=F=>FR_STIMS[((F.i%FR_STIMS.length)+FR_STIMS.length)%FR_STIMS.length];
// How long a form takes to grow (setting «Creixement de cada forma»). FR_SPAN: the seconds each form took to grow in 0.74, from its first
// line to its last (measured with the live models; tests/fractals.test.mjs checks them). 0.74.2 (Marc: «El creixement fractal també
// hauria de ser més lent, durar un parell de segons més»): each form grows FR_GROW seconds longer than that, 2 with «Normal», by
// stretching its whole clock (its acts and every line in them) by the same factor.
export const FR_SPAN=Object.freeze({falgueres:3.51,flocs:3.39,girasol:3.78,llamps:3.49,arbre:4.2,riu:3.4,corall:4.11,romanesco:3.31,neurones:4.39,costa:3.73,
 fulla:3.32,gel:2.27,nautilus:2.22,miceli:3.05,fang:4.27,pao:4.93,serra:5.69,arrels:4.8,petxina:4.27,dent:6.78});
export const FR_GROW=Object.freeze({rapid:1,normal:2,lent:3.5});
export const frGrowK=(s,id)=>{const span=FR_SPAN[id]||3.5;return (span+(FR_GROW[s?.frGrow]??FR_GROW.normal))/span;};
// times (s): the acts of a form begin over FR_SPREAD; the shortest run of a press; the way out of the form before
export const FR_SPREAD=3.4,FR_RUN=7.5,FR_OUT=2.6;
// 0.74.2: the whole form stays FR_HOLD seconds (its two waves of light run through it) before it goes backwards; the way back lasts the
// growth over FR_BACKV, between FR_BACK[0] and FR_BACK[1] seconds; the screen is black FR_BLACK seconds later.
export const FR_HOLD=3.2,FR_BACKV=1.4,FR_BACK=[3.6,6.5],FR_BLACK=.35;
// the moment the first line of a store is born (the way back ends there)
export function frBornAt(st){let m=Infinity;for(let i=0;i<st.n;i++){const t=st.seg[i*FR_STRIDE+4];if(t<m)m=t;}return Number.isFinite(m)?m:0;}
export function frNew(s){const first=Math.max(0,FR_IDS.indexOf(s?.frFirst));
 return {t:0,i:first-1,first,lap:0,k:0,S:null,old:null,AR:16/9,phase:'rest',at:0,end:0,wait:null,seed:Math.floor(Math.random()*1e6),notes:[],chord:0,uid:0,done:0,forms:0,lastEv:-9,lastFx:{},cues:['start'],fullAt:0,backAt:0,backDur:0};}
export function frStart(game,s){game.fractals=frNew(s);game.count=0;game.completed=0;return game.fractals;}
// while a form grows, stays whole and goes back to black, a press does nothing with «Espera que acabi cada efecte»
export const frBusy=F=>F.phase==='run'||F.phase==='full'||F.phase==='back';
export function frBlocked(game,s){const F=game?.fractals;if(!F)return false;return frBusy(F)&&s?.lock!==false;}
// The state of a form: its clock, its segments, its seed and its acts.
export function frForm(M,seed,lap,AR){const S={id:M.id,t:0,st:frStore(8192),AR,rnd:frRandom(seed),seed,lap,pulses:[],exit:-1,ev:[],evq:[],evLog:[],live:[],wake:[],acts:M.acts,full:-1,back:null,flow:!!M.flow};M.init?.(S);return S;}
// The whole form: its acts one after the other over FR_SPREAD·k seconds, a pulse of light at the start and a wave when it is grown.
export function frGrowForm(S,k=1){const n=S.acts.length,t0=S.t+.05;S.k=k;S.acts.forEach((act,j)=>act(S,t0+(n>1?j/(n-1):0)*FR_SPREAD*k,j));S.pulses=[t0];
 // whole when its last line has grown: known now for the drawn forms; for the live ones (the snow crystals grow frame by frame) from FR_SPAN
 const span=FR_SPAN[S.id],g=Math.max(t0+1,Math.min(t0+12,Math.max(frGrownAt(S.st),span?t0+span*k:t0+FR_SPREAD*k+1)));S.full=g;S.pulses.push(g,g+1.7);return g-S.t;}
// the clock of a form: live models step, waiting ones start, events come due
export function frStepForm(S,dt){S.t+=dt;
 for(let i=S.wake.length-1;i>=0;i--)if(S.wake[i].at<=S.t){S.wake[i].go();S.wake.splice(i,1);}
 for(let i=S.live.length-1;i>=0;i--)if(S.live[i].live(dt))S.live.splice(i,1);
 if(S.evq.length){S.evq.sort((a,b)=>a.at-b.at);while(S.evq.length&&S.evq[0].at<=S.t){const e=S.evq.shift();S.ev.push(e);if(!e.rev)S.evLog.push(e);}if(S.ev.length>24)S.ev.splice(0,S.ev.length-24);}}
// 0.74.2: the way back. The clock of the lines runs backwards from the moment the form was whole (from), v times faster than it grew,
// so the last lines to be born are the first to go and the root goes last; the events of the growth come back in reverse order.
// A form that flows (the river, 0.75.3) does not go back: it drains the way it grew, each line going from its first end to its last
// (the water keeps running down to the mouth), in the order the lines were born, and its events come back in the same order.
export function frGoBack(S,dur){const from=frGrownAt(S.st),born=Math.min(from,frBornAt(S.st)),v=Math.max(.2,(from-born)/Math.max(.5,dur)),drain=S.flow;
 S.back={at:S.t,from,born,v,end:S.t+(from-born)/v,drain};S.live.length=0;S.wake.length=0;S.evq.length=0;S.ev.length=0;
 for(const e of S.evLog)if(e.at>=born)S.evq.push({type:e.type,x:e.x,at:S.t+(drain?e.at-born:from-e.at)/v,rev:true});return S.back;}
export const frEmpty=S=>S.exit>=0&&S.t-S.exit>=FR_OUT;

// A press: the form on the screen goes back to its roots, and the next one grows whole, with its phrase of music.
export function frPress(game,s){const F=game?.fractals;if(!F)return false;if(frBlocked(game,s))return false;
 if(frBusy(F))F.notes=F.notes.filter(n=>n.sent);
 // a form that has gone back to black leaves nothing on the screen; one cut short (with free presses) goes out while the next grows
 if(F.S&&F.phase==='rest'&&F.S.back)F.old=null;else if(F.S){F.S.exit=F.S.t;F.S.live.length=0;F.S.wake.length=0;F.S.evq.length=0;F.old=F.S;}
 F.i++;if(F.i>=F.first+FR_STIMS.length){F.i-=FR_STIMS.length;F.lap++;}
 const M=frStim(F);F.S=frForm(M,(F.seed+F.i*7919+F.lap*104729)%2147483647||7,F.lap,F.AR||16/9);
 const grown=frGrowForm(F.S,frGrowK(s,M.id));F.k++;F.forms++;game.count=F.k;
 const U=FR_MUSIC[M.id]||FR_MUSIC.falgueres,ph=bbPhrase(U,'ple',3+F.lap,8,F.lap),t0=F.t+.05;
 F.chord=ph.chord;for(const n of ph.notes)F.notes.push({id:++F.uid,at:t0+n.beat*U.unit,ev:n,sent:false});
 F.at=F.t;F.phase='run';F.fullAt=F.t+Math.min(grown,12);
 // the way back begins once the whole form has been seen with its waves of light and the phrase of the press has been played
 F.backAt=Math.max(F.fullAt+FR_HOLD,t0+(ph.length-1.5)*U.unit,F.t+FR_RUN);F.backDur=Math.min(FR_BACK[1],Math.max(FR_BACK[0],grown/FR_BACKV));
 F.end=F.backAt+F.backDur+FR_BLACK;F.wait=escWaitTurn(F.wait,'run',F.t);F.cues.push('form');return true;}

// The time of the form runs at the pace of the wait: while it waits for a press it slows down to a drift (15 %) and darkens a little
// («Senyal de torn», as in the other activities); while it goes out it always runs at full pace.
export function frRate(F,s){if(frBusy(F)||s?.waitCue===false)return 1;return Math.max(.15,escWaitClock(F.wait||ESC_WAIT_START,F.t).rate);}
export function frTick(game,s,dt){const F=game?.fractals;if(!F)return;F.t+=dt;
 if(F.S){let r=dt*frRate(F,s);while(r>1e-6){const h=Math.min(r,1/30);frStepForm(F.S,h);r-=h;}}
 // the form before goes out at full pace, whatever the wait
 if(F.old){let r=dt;while(r>1e-6){const h=Math.min(r,1/30);frStepForm(F.old,h);r-=h;}if(frEmpty(F.old))F.old=null;}
 if(F.phase==='run'&&F.t>=F.fullAt)F.phase='full';
 // the way back: its music (the falling line of the way out, slowed down to last as long as the way back, ending on the tonic as the
 // last line goes) and the events of the growth in reverse
 if(F.phase==='full'&&F.t>=F.backAt&&F.S){F.phase='back';frGoBack(F.S,F.backDur);const U=FR_MUSIC[frStim(F).id]||FR_MUSIC.falgueres,ph=bbPhrase(U,'surt',3+F.lap,8,F.lap),u=Math.max(U.unit,F.backDur/(U.M+.5)),t0=F.t+.03;
  F.chord=ph.chord;for(const n of ph.notes)F.notes.push({id:++F.uid,at:t0+n.beat*u,ev:n,sent:false});F.cues.push('back');}
 if(F.phase==='back'&&F.t>=F.end){F.phase='rest';F.done++;game.completed=F.done;F.wait=escWaitTurn(F.wait,'wait',F.t);F.cues.push('black');}
 if(F.notes.length>200)F.notes=F.notes.filter(n=>!n.sent||n.at>F.t-2);}

// The words for a screen reader (no words are ever drawn in the scene).
export const frNumber=F=>((F.i-F.first)%FR_STIMS.length+FR_STIMS.length)%FR_STIMS.length+1;
export function frStatus(game,s){const F=game?.fractals;if(!F)return '';
 if(!F.S)return 'La pantalla és negra i espera la primera pulsació. Cada pulsació fa créixer una forma de la natura.';
 const M=frStim(F),n=frNumber(F);
 if(F.phase==='run')return `${M.name}, forma ${n} de ${FR_STIMS.length}: ${M.what}.`;
 if(F.phase==='full')return `${M.name}, forma ${n} de ${FR_STIMS.length}, completa: una ona de llum la recorre.`;
 if(F.phase==='back')return `${M.name}, forma ${n} de ${FR_STIMS.length}: ${M.back||'la forma es desfà al revés de com ha crescut'}.`;
 return `${M.name}, forma ${n} de ${FR_STIMS.length}, acabada. La pantalla és negra i la pulsació següent en porta una altra.`;}
export function frProgress(game,s){const F=game?.fractals;if(!F)return '';const n=F.S?frNumber(F):0;return Array.from({length:FR_STIMS.length},(_,i)=>`<span class="${i<n?'done':''}"></span>`).join('');}
export function frHelp(s){return `<strong>Cada pulsació fa créixer sencera una forma de la natura amb línies de llum de colors, i una ona de llum la recorre. Després la forma es desfà al revés de com ha crescut, fins que la pantalla torna a ser negra. N’hi ha vint, i després tornen a començar amb uns altres colors.</strong><br>${s?.lock!==false?'Mentre una forma creix i es desfà, les pulsacions no fan res.':'Pots prémer mentre una forma creix: ve la següent.'}`;}

// ── The music ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each form has its key, mode, metre and recorded instruments (plucked or struck, as in the rest of Pim Pam: no pads, no organs, every
// note dies away); the phrases are made by the phrase maker of the Laboratori de matèria (bbPhrase). The events of the growth (a new
// frond, a new crystal, a spiral that lights up) add a note of the chord, and some a recorded sound of their own.
// The sound of the place of each form (amb: six seconds under the growth) and its accent (fx, on the new branches and tips, no closer than
// the gap): their levels, set by measurement against the music (tools/fractals-audio.mjs): the place some 10 LU under the music, the
// accents some 6–9 dB under its loudest moment (the short, sharp ones a little higher, 1.4×).
export const FR_AMB=.95,FR_ACC=.65;
export const FR_MUSIC=Object.freeze({
 falgueres:{key:62,mode:'mixo',meter:'68',unit:.36,M:6,lead:'kalimbaRec',mid:'guitarRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,6,3,0,4,6,3,0],cont:[2,4,0,5],
  ev:{tronc:['guitarRec',0,.15],branca:['harpRec',0,.14],fulla:['kalimbaRec',1,.13]},amb:['fractalsRec','falgueresAmb',FR_AMB],fx:{branca:['fractalsRec','falgueresAcc',FR_ACC,1.1],fulla:['fractalsRec','falgueresAcc',FR_ACC,1.1]}},
 flocs:{key:64,mode:'lydian',meter:'34',unit:.45,M:6,lead:'glockRec',mid:'harpRec',bass:'celliPizzRec',spark:'vibRec',prog:[0,1,0,4,5,1,4,0],cont:[4,0,2,5],
  ev:{tronc:['vibRec',0,.12],branca:['glockRec',1,.08],fulla:['glockRec',2,.06]},amb:['fractalsRec','flocsAmb',FR_AMB],fx:{tronc:['fractalsRec','flocsAcc',FR_ACC,1.1],branca:['fractalsRec','flocsAcc',FR_ACC,1.1]}},
 girasol:{key:67,mode:'major',meter:'34',unit:.42,M:6,lead:'vibRec',mid:'harpRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,4,5,3,0,1,4,0],cont:[0,3,1,5],
  ev:{tronc:['harpRec',0,.15],branca:['vibRec',0,.14],fulla:['glockRec',1,.1]},amb:['fractalsRec','girasolAmb',FR_AMB],fx:{branca:['fractalsRec','girasolAcc',FR_ACC,1.1],fulla:['fractalsRec','girasolAcc',FR_ACC,1.1]}},
 llamps:{key:59,mode:'dorian',meter:'44',unit:.3,M:8,lead:'marimbaRec',mid:'vibRec',bass:'celliPizzRec',spark:'glockRec',sync:true,snap:[0,3,5,7,10],prog:[0,3,0,4,5,3,4,0],cont:[3,1,5,0],
  ev:{tronc:['timpaniRec',-1,.2],branca:['vibRec',0,.14],fulla:['glockRec',1,.1]},amb:['fractalsRec','llampsAmb',FR_AMB],fx:{branca:['fractalsRec','llampsAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','llampsAcc',FR_ACC*1.4,1.1]}},
 arbre:{key:65,mode:'major',meter:'44',unit:.4,M:8,lead:'fluteRec',mid:'guitarRec',bass:'celliPizzRec',spark:'kalimbaRec',canon:'clarinetRec',snap:[0,2,4,7,9],prog:[0,3,5,4,0,5,3,4],cont:[0,2,4,3],
  ev:{tronc:['guitarRec',0,.15],branca:['harpRec',0,.14],fulla:['glockRec',1,.1]},amb:['fractalsRec','arbreAmb',FR_AMB],fx:{branca:['fractalsRec','arbreAcc',FR_ACC,1.1],fulla:['fractalsRec','arbreAcc',FR_ACC,1.1]}},
 riu:{key:62,mode:'dorian',meter:'68',unit:.34,M:6,lead:'harpRec',mid:'marimbaRec',bass:'celliPizzRec',spark:'kalimbaRec',prog:[0,3,0,6,0,3,4,0],cont:[1,4,2,5],
  ev:{tronc:['marimbaRec',0,.15],branca:['harpRec',0,.14],fulla:['kalimbaRec',1,.12]},amb:['fractalsRec','riuAmb',FR_AMB],fx:{branca:['fractalsRec','riuAcc',FR_ACC,1.1],fulla:['fractalsRec','riuAcc',FR_ACC,1.1]}},
 corall:{key:60,mode:'lydian',meter:'68',unit:.38,M:6,lead:'vibRec',mid:'harpRec',bass:'uduRec',spark:'glockRec',prog:[0,1,4,0,5,1,4,0],cont:[0,5,3,1],
  ev:{tronc:['uduRec',0,.2],branca:['vibRec',0,.13],fulla:['glockRec',1,.09]},amb:['fractalsRec','corallAmb',FR_AMB],fx:{branca:['fractalsRec','corallAcc',FR_ACC,1.1],fulla:['fractalsRec','corallAcc',FR_ACC,1.1]}},
 romanesco:{key:69,mode:'major',meter:'44',unit:.33,M:8,lead:'marimbaRec',mid:'guitarRec',bass:'celliPizzRec',spark:'vibRec',prog:[0,5,3,4,0,3,4,0],cont:[3,0,4,2],
  ev:{tronc:['marimbaRec',-1,.16],branca:['marimbaRec',0,.14],fulla:['vibRec',1,.11]},amb:['fractalsRec','romanescoAmb',FR_AMB],fx:{branca:['fractalsRec','romanescoAcc',FR_ACC,1.1],fulla:['fractalsRec','romanescoAcc',FR_ACC,1.1]}},
 neurones:{key:61,mode:'dorian',meter:'44',unit:.3,M:8,lead:'vibRec',mid:'kalimbaRec',bass:'marimbaRec',spark:'glockRec',sync:true,snap:[0,3,5,7,10],prog:[0,5,6,0,3,5,6,0],cont:[3,1,5,0],
  ev:{tronc:['vibRec',-1,.14],branca:['kalimbaRec',0,.13],fulla:['glockRec',1,.08]},amb:['fractalsRec','neuronesAmb',FR_AMB],fx:{branca:['fractalsRec','neuronesAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','neuronesAcc',FR_ACC*1.4,1.1]}},
 costa:{key:64,mode:'mixo',meter:'68',unit:.4,M:6,lead:'guitarRec',mid:'harpRec',bass:'celliPizzRec',spark:'vibRec',prog:[0,6,3,0,4,6,3,0],cont:[4,2,0,5],
  ev:{tronc:['celliPizzRec',0,.2],branca:['harpRec',0,.13],fulla:['vibRec',1,.1]},amb:['fractalsRec','costaAmb',FR_AMB],fx:{branca:['fractalsRec','costaAcc',FR_ACC,1.1],fulla:['fractalsRec','costaAcc',FR_ACC,1.1]}},
 fulla:{key:63,mode:'major',meter:'34',unit:.44,M:6,lead:'harpRec',mid:'guitarRec',bass:'celliPizzRec',spark:'kalimbaRec',prog:[0,3,4,0,5,3,4,0],cont:[2,0,5,3],
  ev:{tronc:['guitarRec',0,.14],branca:['harpRec',0,.14],fulla:['kalimbaRec',1,.12]},amb:['fractalsRec','fullaAmb',FR_AMB],fx:{branca:['fractalsRec','fullaAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','fullaAcc',FR_ACC*1.4,1.1]}},
 gel:{key:71,mode:'lydian',meter:'34',unit:.46,M:6,lead:'glockRec',mid:'vibRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,1,0,4,5,1,4,0],cont:[1,4,0,2],
  ev:{tronc:['vibRec',-1,.12],branca:['glockRec',0,.08],fulla:['glockRec',1,.06]},amb:['fractalsRec','gelAmb',FR_AMB],fx:{branca:['fractalsRec','gelAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','gelAcc',FR_ACC*1.4,1.1]}},
 nautilus:{key:58,mode:'dorian',meter:'68',unit:.42,M:6,lead:'harpRec',mid:'vibRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,3,0,6,0,3,4,0],cont:[0,3,5,1],
  ev:{tronc:['harpRec',-1,.16],branca:['vibRec',0,.13],fulla:['glockRec',1,.08]},amb:['fractalsRec','nautilusAmb',FR_AMB],fx:{branca:['fractalsRec','nautilusAcc',FR_ACC,1.1],fulla:['fractalsRec','nautilusAcc',FR_ACC,1.1]}},
 miceli:{key:57,mode:'minor',meter:'44',unit:.36,M:8,lead:'kalimbaRec',mid:'marimbaRec',bass:'uduRec',spark:'vibRec',snap:[0,3,5,7,10],prog:[0,3,0,4,5,3,4,0],cont:[2,0,4,1],
  ev:{tronc:['uduRec',0,.2],branca:['marimbaRec',0,.13],fulla:['kalimbaRec',1,.12]},amb:['fractalsRec','miceliAmb',FR_AMB],fx:{branca:['fractalsRec','miceliAcc',FR_ACC,1.1],fulla:['fractalsRec','miceliAcc',FR_ACC,1.1]}},
 fang:{key:62,mode:'mixo',meter:'44',unit:.32,M:8,lead:'guitarRec',mid:'marimbaRec',bass:'celliPizzRec',spark:'kalimbaRec',prog:[0,6,3,0,4,6,3,0],cont:[3,1,5,0],
  ev:{tronc:['marimbaRec',-1,.16],branca:['guitarRec',0,.13],fulla:['kalimbaRec',1,.12]},amb:['fractalsRec','fangAmb',FR_AMB],fx:{branca:['fractalsRec','fangAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','fangAcc',FR_ACC*1.4,1.1]}},
 pao:{key:67,mode:'lydian',meter:'68',unit:.36,M:6,lead:'vibRec',mid:'harpRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,1,4,0,5,1,4,0],cont:[5,2,0,4],
  ev:{tronc:['harpRec',-1,.15],branca:['vibRec',0,.13],fulla:['glockRec',1,.09]},amb:['fractalsRec','paoAmb',FR_AMB],fx:{branca:['fractalsRec','paoAcc',FR_ACC,1.1],fulla:['fractalsRec','paoAcc',FR_ACC,1.1]}},
 serra:{key:60,mode:'dorian',meter:'44',unit:.4,M:8,lead:'marimbaRec',mid:'guitarRec',bass:'celliPizzRec',spark:'vibRec',canon:'clarinetRec',snap:[0,2,3,7,9],prog:[0,3,5,4,0,5,3,4],cont:[0,2,4,3],
  ev:{tronc:['timpaniRec',-1,.2],branca:['guitarRec',0,.14],fulla:['vibRec',1,.11]},amb:['fractalsRec','serraAmb',FR_AMB],fx:{branca:['fractalsRec','serraAcc',FR_ACC*1.4,1.1],fulla:['fractalsRec','serraAcc',FR_ACC*1.4,1.1]}},
 arrels:{key:55,mode:'minor',meter:'68',unit:.4,M:6,lead:'marimbaRec',mid:'harpRec',bass:'uduRec',spark:'kalimbaRec',snap:[0,3,5,7,10],prog:[0,5,6,0,3,5,6,0],cont:[1,4,2,5],
  ev:{tronc:['uduRec',0,.2],branca:['marimbaRec',0,.14],fulla:['kalimbaRec',1,.12]},amb:['fractalsRec','arrelsAmb',FR_AMB],fx:{branca:['fractalsRec','arrelsAcc',FR_ACC,1.1],fulla:['fractalsRec','arrelsAcc',FR_ACC,1.1]}},
 petxina:{key:64,mode:'major',meter:'34',unit:.45,M:6,lead:'harpRec',mid:'vibRec',bass:'celliPizzRec',spark:'glockRec',prog:[0,4,5,3,0,1,4,0],cont:[0,5,3,1],
  ev:{tronc:['harpRec',-1,.14],branca:['vibRec',0,.12],fulla:['glockRec',1,.08]},amb:['fractalsRec','petxinaAmb',FR_AMB],fx:{branca:['fractalsRec','petxinaAcc',FR_ACC,1.1],fulla:['fractalsRec','petxinaAcc',FR_ACC,1.1]}},
 dent:{key:65,mode:'major',meter:'68',unit:.38,M:6,lead:'kalimbaRec',mid:'guitarRec',bass:'celliPizzRec',spark:'glockRec',sync:true,prog:[0,3,4,0,5,3,4,0],cont:[4,0,2,5],
  ev:{tronc:['guitarRec',-1,.15],branca:['kalimbaRec',0,.13],fulla:['glockRec',2,.07]},amb:['fractalsRec','dentAmb',FR_AMB],fx:{branca:['fractalsRec','dentAcc',FR_ACC,1.1],fulla:['fractalsRec','dentAcc',FR_ACC,1.1]}}});

// ── Sounds ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
class FrSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.active=new Set();}
 one(bank,name,level=1,pan=0,when=0,rate=1){const z=sampleZone(bank,0,name);if(!z||!z.buffer)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift,z.duration||undefined);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 // the sound of the place: one at a time, the one before fades out in half a second
 amb(bank,name,level=1){const z=sampleZone(bank,0,name);this.hush(.5);if(!z||!z.buffer)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),t=c.currentTime;o.buffer=z.buffer;g.gain.value=level;
  o.connect(g);g.connect(this.input);o.start(t,(z.offset||0)+z.shift,z.duration||undefined);this.place={o,g};this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();if(this.place?.o===o)this.place=null;};}
 hush(fade){const p=this.place;if(!p)return;this.place=null;const t=this.context.currentTime;try{p.g.gain.cancelScheduledValues(t);p.g.gain.setValueAtTime(p.g.gain.value,t);p.g.gain.linearRampToValueAtTime(0,t+fade);p.o.stop(t+fade+.05);}catch{}}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();this.place=null;}}
let FR_BUS=null;
const frBus=(ctx,out)=>{if(!ctx||!out)return null;if(!FR_BUS||FR_BUS.context!==ctx)FR_BUS=new FrSound(ctx,out);return FR_BUS;};
export function frSilence(){FR_BUS?.stop();}
// The events of the growth since the last frame: for each, at most one note of the chord (no closer than 0.22 s to the one before) and
// its recorded sound (no closer than its own gap). Returned for the tests; play(e, delay, length) sounds a note.
export function frEvents(F,play,fx){const S=F.S;if(F.old)F.old.ev.length=0;if(!S||!S.ev.length)return [];const M=frStim(F),U=FR_MUSIC[M.id]||FR_MUSIC.falgueres,out=[];
 for(const e of S.ev){const pan=Math.max(-.7,Math.min(.7,(e.x-.5)*1.4)),n=U.ev[e.type],f=U.fx[e.type];
  if(n&&F.t-F.lastEv>=(e.rev?.3:.22)){F.lastEv=F.t;const tones=e.rev?[4,2,0]:[0,2,4],d=F.chord+tones[(F.uid++)%3],ev={inst:n[0],midi:[bbFit(n[0],bbMidi(U,d,n[1]))],vel:n[2]*(e.rev?.7:1),len:1.4,pan};out.push(['note',ev]);play?.(ev,0,1.4);}
  if(f&&!e.rev&&F.t-(F.lastFx[f[1]]??-9)>=f[3]){F.lastFx[f[1]]=F.t;out.push(['fx',f]);fx?.(f,pan);}}
 S.ev.length=0;return out;}
export function frAudio(game,s,ctx,out,play){const F=game?.fractals;if(!F)return;const cues=F.cues.splice(0);
 if(!s.sound||ctx?.state!=='running'){for(const n of F.notes)if(!n.sent&&n.at<F.t+.5)n.sent=true;if(F.S)F.S.ev.length=0;return;}
 const bus=frBus(ctx,out),lat=Math.min(.1,Math.max(0,ctx.outputLatency||ctx.baseLatency||0));
 if(cues.includes('form')){const a=(FR_MUSIC[frStim(F).id]||{}).amb;if(a)bus?.amb(a[0],a[1],a[2]);}
 // 0.74.2: the sound of the place comes back, softer, while the form goes back, and fades with the black
 if(cues.includes('back')){const a=(FR_MUSIC[frStim(F).id]||{}).amb;if(a)bus?.amb(a[0],a[1],a[2]*.8);}
 if(cues.includes('black'))bus?.hush(1.4);
 for(const n of F.notes){if(n.sent||n.at>F.t+.5)continue;n.sent=true;if(n.at<F.t-.12)continue;play(n.ev,Math.max(0,n.at-F.t-lat),n.ev.len);}
 frEvents(F,play,(f,pan)=>bus?.one(f[0],f[1],f[2],pan,0,.94+.12*Math.random()));}

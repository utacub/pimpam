// La nova Pluja de colors (CE45, 0.55) · the model: scenes, presses, the phrase of drops of each press (each drop is one note, and
// no note sounds without a drop), the paint that fills the floor, the dilution to black and the next scene; and the sounds.
// Marc, 8 November 2026: «pantalla negra, gotes de colors que cauen primer al centre i el color s'escampa i es barreja a poc a poc fins
// que tota la pantalla és plena… cada gota és una nota i cap nota no sona sense gota… al final tot el color es dilueix fins al negre i
// comença una nova melodia, una nova combinació de colors i un nou ritme de gotes». And: «la nota ha de sonar quan cada gota toca el
// terra». The old marbling activity (CE03, 'color-rain') is now «Gotes de pintura» and keeps its id.
// A scene is a number of presses (setting «Pulsacions per omplir la pantalla»: 6, 10 or 16). Each press drops a phrase of its melody:
// the low note of the chord as a big drop, then the melody as smaller drops (setting «Gotes de cada pulsació»: one drop, the phrase,
// or the phrase and its echo an octave higher). Where the drops fall is chosen by the picture (pluja-escena.js), from the paint that
// really lies on the floor. After the last press the paint flows into the black that is left, then it dilutes to black, and the next
// scene begins. The time of every impact is fixed at the press, so its note is scheduled ahead and sounds as the drop touches the floor.
import {escWaitTurn,escWaitClock,escRange} from './escenari.js';
import {sampleZone} from './sampler.js';
import {PJ_SCENES,PJ_IDS,pjParse,pjNote} from './pluja-escenes.js';
export const PJ_CAUSE=Object.freeze({id:'pluja-colors',code:'CE45',type:'ce',level:'01 · Descobrir',name:'Pluja de colors',desc:'Gotes de colors que cauen sobre un terra negre i líquid: cada gota és una nota, i el color s’escampa i es barreja fins que omple la pantalla.',tag:'10 escenes · una nota a cada gota',time:'Al teu ritme',pluja:true,recorded:true});
// times (s): the fall of a drop through the air (the same as the engine's), the spreading of a drop, the paint flowing into the last
// black, the dilution, the black between two scenes
export const PJ_FALL=.33,PJ_GROW=.9,PJ_FILL=4,PJ_DILUTE=5.5,PJ_CHANGE=1;
export const PJ_PRESSES=Object.freeze([6,10,16]);
export const pjPresses=s=>PJ_PRESSES.includes(+s?.pjPresses)?+s.pjPresses:10;
export const pjDropsMode=s=>['una','curta','llarga'].includes(s?.pjDrops)?s.pjDrops:'curta';
export const pjScene=F=>PJ_SCENES[((F.sc%PJ_SCENES.length)+PJ_SCENES.length)%PJ_SCENES.length];
// the delay between a press and the first impact: the drop falls first (none falls with «Moviment reduït»: it appears where it lands)
export const pjLead=s=>s?.reduced?.12:PJ_FALL+.05;

export function pjNew(s){const first=Math.max(0,PJ_IDS.indexOf(s?.pjFirst));
 return {t:0,sc:first,first,lap:0,k:0,P:pjPresses(s),phase:'rest',at:0,end:0,drops:[],phrases:[],uid:0,scene:1,seed:Math.floor(Math.random()*1e6),rot:Math.random()*6.2832,fill:false,wait:null,cues:['scene'],done:0,presses:0};}
export function pjStart(game,s){game.pluja=pjNew(s);game.count=0;game.completed=0;return game.pluja;}
export function pjBlocked(game,s){const F=game?.pluja;if(!F)return false;if(F.phase==='fill'||F.phase==='dilute'||F.phase==='change')return true;if(F.phase==='phrase')return s?.lock!==false;return false;}

// which phrase of the melody press k of P plays: the last press always closes the melody
export function pjPhraseIndex(k,P){return k>=P-1?9:k%9;}
// the notes of a press: [{beat, deg, midi, inst, bass, echo, w}] (w: the drop's share of the paint of the press)
export function pjPhrase(S,k,P,mode){const ix=pjPhraseIndex(k,P),all=pjParse(S.phrases[ix]),mel=all.filter(n=>!n.bass),[lo,hi]=escRange(S.inst);
 const note=(n,echo=false)=>{if(n.bass)return {...n,midi:pjNote(S,n.deg,S.bassOct),inst:S.bass,echo:false};let m=pjNote(S,n.deg+(echo?7:0));if(echo&&m>hi)m-=12;while(m<lo)m+=12;while(m>hi)m-=12;return {...n,midi:m,inst:S.inst,echo};};
 let out;
 if(mode==='una')out=[{...note(mel[0]),beat:0}];
 else{out=all.map(n=>note(n));if(mode==='llarga'){const last=mel[mel.length-1].beat+1;for(const n of mel)out.push({...note(n,true),beat:last+n.beat-mel[0].beat});}}
 // the size follows the pitch: a low note is a big drop, a high note a small one (and the echo smaller still)
 for(const n of out){const p=Math.pow(2,-(n.midi-S.key)/12);n.w=n.bass?2.2:Math.min(1.4,Math.max(.45,p))*(n.echo?.6:1);}
 return out;}

// A press: the next phrase of the melody begins to fall at once (the first drop is in the air from this frame on).
export function pjPress(game,s){const F=game?.pluja;if(!F)return false;if(F.phase==='fill'||F.phase==='dilute'||F.phase==='change')return false;
 if(F.phase==='phrase'){if(s?.lock!==false)return false;
  // presses not locked: the drops not yet in the air are left out (with their notes), and the new phrase begins
  const keep=F.t+pjLead(s)-.02;F.drops=F.drops.filter(d=>d.t0<=keep);}
 if(F.k===0)F.P=pjPresses(s);
 const S=pjScene(F),notes=pjPhrase(S,F.k,F.P,pjDropsMode(s)),t0=F.t+pjLead(s),ph={id:++F.uid,k:F.k,P:F.P,first:F.k===0,last:F.k>=F.P-1,scene:F.scene,placed:false,n:notes.length};
 notes.forEach((n,i)=>F.drops.push({id:++F.uid,ph:ph.id,i,t0:t0+n.beat*S.beat,deg:n.deg,ink:((n.deg%7)+7)%7,midi:n.midi,inst:n.inst,bass:n.bass,echo:n.echo,w:n.w,
  vel:n.bass?.5:n.echo?.3:i===1?.52:.44,len:n.bass?2.2:1.8,placed:false,heard:false,x:.5,y:.5,sx:.5,scene:F.scene}));
 F.phrases.push(ph);if(F.phrases.length>24)F.phrases.shift();
 // the last press: its drops fall into the holes while the paint begins to flow into the black that is left
 if(ph.last)F.fill=true;
 F.end=Math.max(...F.drops.filter(d=>d.ph===ph.id).map(d=>d.t0))+PJ_GROW;F.k++;F.presses++;game.count=F.k;F.phase='phrase';F.at=F.t;F.wait=escWaitTurn(F.wait,'run',F.t);return true;}

export function pjTick(game,s,dt){const F=game?.pluja;if(!F)return;F.t+=dt;
 if(F.phase==='phrase'&&F.t>=F.end){F.done++;game.completed=F.done;if(F.k>=F.P){F.phase='fill';F.at=F.t;F.fill=true;F.cues.push('fill');}else{F.phase='rest';F.wait=escWaitTurn(F.wait,'wait',F.t);}}
 if(F.phase==='fill'&&F.t-F.at>=PJ_FILL){F.phase='dilute';F.at=F.t;F.cues.push('dilute');}
 if(F.phase==='dilute'&&F.t-F.at>=PJ_DILUTE){F.phase='change';F.at=F.t;F.cues.push('change');}
 if(F.phase==='change'&&F.t-F.at>=PJ_CHANGE){F.sc=(F.sc+1)%PJ_SCENES.length;if(F.sc===F.first)F.lap++;F.k=0;game.count=0;F.P=pjPresses(s);F.drops=[];F.phrases=[];F.fill=false;F.scene++;F.rot=Math.random()*6.2832;F.phase='rest';F.at=F.t;F.cues.push('scene');
  F.wait=escWaitTurn({mode:'run',at:F.t,idle:F.wait?escWaitTurn(F.wait,'run',F.t).idle:F.t,rate:1,dark:0},'wait',F.t+.01);}
 if(F.drops.length>80)F.drops=F.drops.filter(d=>d.t0>F.t-3);}

// The words for a screen reader (no words are ever drawn in the scene).
export function pjStatus(game,s){const F=game?.pluja;if(!F)return '';const S=pjScene(F);
 if(F.phase==='phrase'){const n=F.phrases[F.phrases.length-1]?.n||1;return n>1?`${S.name}: cauen gotes de colors, i cada gota sona quan toca el terra.`:`${S.name}: cau una gota de color, i sona quan toca el terra.`;}
 if(F.phase==='fill')return `${S.name}: el color acaba d’omplir tota la pantalla.`;
 if(F.phase==='dilute')return 'El color es dilueix fins que el terra torna a ser negre.';
 if(F.phase==='change')return `Ara ve ${PJ_SCENES[(F.sc+1)%PJ_SCENES.length].name}.`;
 if(F.k===0)return `${S.name}: el terra és negre i espera la primera gota. Colors: ${S.what}.`;
 return `${S.name}: el color s’escampa pel terra. Pulsació ${F.k} de ${F.P}.`;}
export function pjProgress(game,s){const F=game?.pluja;if(!F)return '';const done=F.phase==='fill'||F.phase==='dilute'||F.phase==='change'?F.P:F.k;return Array.from({length:F.P},(_,i)=>`<span class="${i<done?'done':''}"></span>`).join('');}
export function pjHelp(s){return `<strong>Cada pulsació fa caure gotes de colors sobre el terra negre, i cada gota sona quan toca el terra. Quan la pantalla és plena, el color es dilueix i comença una escena nova, amb una altra melodia.</strong><br>${s?.lock!==false?'Espera que caiguin totes les gotes abans de tornar a prémer.':'Pots tornar a prémer abans que caiguin totes les gotes: les que encara no han sortit no cauen.'}`;}

// ── Sounds ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Only the drops sound: each drop its note (a recording of a real instrument, plucked or struck, sampler.js) and, very soft, the
// plic of a drop of paint (pintaRec 'gota', the drop of 0.52), tuned a little with the note. Nothing else: no music without drops.
class PjSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.active=new Set();}
 one(bank,name,level=1,pan=0,when=0,rate=1){const z=sampleZone(bank,0,name);if(!z||!z.buffer)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift);this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();}}
let PJ_BUS=null;
const pjBus=(ctx,out)=>{if(!ctx||!out)return null;if(!PJ_BUS||PJ_BUS.context!==ctx)PJ_BUS=new PjSound(ctx,out);return PJ_BUS;};
export function pjSilence(){PJ_BUS?.stop();}
// The picture reaches the screen a frame or two after it is drawn; a sound heard before its picture is noticed sooner than one heard
// after it (ITU-R BT.1359-1: about 45 ms ahead against 125 ms behind), so the notes are given these 30 ms.
export const PJ_AV=.03;
// Each frame: the notes whose drops land within half a second are given to the audio at their exact delay (less the output latency of
// the device). A drop not yet placed by the picture waits until 0.14 s before it lands (its place gives its pan).
export function pjAudio(game,s,ctx,out,play){const F=game?.pluja;if(!F)return;F.cues.splice(0);
 if(!s.sound||ctx?.state!=='running'){for(const d of F.drops)if(!d.heard&&d.t0<F.t+.5)d.heard=true;return;}
 const bus=pjBus(ctx,out);if(!bus)return;const lat=Math.min(.1,Math.max(0,ctx.outputLatency||ctx.baseLatency||0));
 for(const d of F.drops){if(d.heard||d.t0>F.t+.5)continue;if(!d.placed&&d.t0-F.t>.14)continue;d.heard=true;if(d.t0<F.t-.12)continue;
  const delay=Math.max(0,d.t0-F.t-lat+PJ_AV),pan=Math.max(-.7,Math.min(.7,(d.sx-.5)*1.3));
  play({inst:d.inst,midi:[d.midi],vel:d.vel,len:d.len,pan},delay,d.len);
  bus.one('pintaRec','gota',d.bass?.09:.06,pan,delay,Math.min(1.5,Math.max(.75,Math.pow(2,(d.midi-72)/24))));}}

// for the tests: every drop and its note (the same time)
export const pjDropTimes=F=>F.drops.map(d=>d.t0);

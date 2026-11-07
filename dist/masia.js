// Estiu a la masia (EN26), 0.39: the logic of the board. Five characters of the farm, each picked once per round; a pick plays the
// episode of that character (a camera push-in, 14 s of story, a dissolve back) and the hour of the day advances from the morning to
// the dusk. The fifth pick ends with the dinner under the fig tree. Music: one piece in G major whose voices are the characters.
// Names start with ms. Everything here is pure (no canvas, no audio): the art, the episodes and the app call it.
import {SAMPLE_BANK} from './sampler.js';
export const MS_CHARS=Object.freeze(['avia','avi','nina','pol','cabra']);
export const MS_NAMES=Object.freeze({avia:'Pepa',avi:'Tomàs',nina:'Nina',pol:'Pol',cabra:'Nata'});   // one word each: the spoken option
export const MS_FULL=Object.freeze({avia:'L’àvia Pepa',avi:'L’avi Tomàs',nina:'La Nina',pol:'En Pol',cabra:'La cabra Nata'});
export const MS_PUSH=1.5,MS_EP=14,MS_BACK=1,MS_SOPAR=20;
export const MS_STEP=MS_PUSH+MS_EP+MS_BACK;          // 16.5 s
export const MS_FINAL=MS_PUSH+MS_EP+MS_SOPAR-.5;      // 35 s: the fifth episode dissolves into the dinner
// The order of the characters in a round rotates (like the pages of Pinta el món), so the first offered is not always the same.
export function msOrder(round){const r=Math.max(0,round|0),start=(r*2+Math.floor(r/5))%5,dir=r%2?-1:1;return Array.from({length:5},(_,i)=>MS_CHARS[((start+i*dir)%5+5)%5]);}
// The characters offered: all those not yet picked this round, in the order of the round (0.44.3, Marc: the scanning goes over
// every character from the start, not three at a time; the «Opcions de contingut» setting does not apply here).
// 0.45.2 (Marc): the focus always goes from left to right across the scene, whatever the round: the characters by the x of their
// place on the board (MD.spots: avi 180, cabra 524, pol 662, avia 905, nina 1010; a test keeps the two in step).
export const MS_LTR=Object.freeze(['avi','cabra','pol','avia','nina']);
export function msOptions(state,n){const picked=new Set((state?.picks||[]).map(p=>p?.value??p?.id??p));return MS_LTR.filter(z=>!picked.has(z));}
export const msWord=id=>MS_NAMES[id]||id;
// The hour of the day: 0 at the first morning, 1 at dusk, advanced by the picks of the round; during the effect of a pick the hour
// moves on through the episode (so the board comes back a little later in the day).
export function msHour(picks,time=null,final=false){const n=Math.min(5,picks|0);const base=n/5;if(time==null)return Math.min(1,base);
 const u=Math.max(0,Math.min(1,(time-MS_PUSH)/MS_EP));return Math.min(1,base+u/5);}
// The variant of an episode: the first time the plain gag, from the second round on the twist (the pupil knows the story).
export const msVariant=round=>Math.min(1,Math.max(0,round|0)>0?1:0);
// The phase of the effect at time T: the push-in, the episode, the way back (or the dinner after the fifth).
export function msPhase(T,final){if(T<MS_PUSH)return {phase:'push',u:T/MS_PUSH,t:0};if(T<MS_PUSH+MS_EP)return {phase:'ep',u:(T-MS_PUSH)/MS_EP,t:T-MS_PUSH};
 if(final){const t=T-MS_PUSH-MS_EP;return {phase:'sopar',u:Math.max(0,Math.min(1,t/MS_SOPAR)),t};}const t=T-MS_PUSH-MS_EP;return {phase:'back',u:Math.max(0,Math.min(1,t/MS_BACK)),t};}
// ── Small animation helpers (pure functions of time) ──────────────────────────────────────────────────────────────────────────────
export const msClamp=(v,a=0,b=1)=>v<a?a:v>b?b:v;
export const msEase=u=>{u=msClamp(u);return u*u*(3-2*u);};
export const msEaseOut=u=>{u=msClamp(u);return 1-(1-u)*(1-u);};
export const msEaseIn=u=>{u=msClamp(u);return u*u;};
export const msBack=u=>{u=msClamp(u);const s=1.7;return 1+(s+1)*Math.pow(u-1,3)+s*Math.pow(u-1,2);};  // overshoot at the end
export const msBounce=u=>{u=msClamp(u);if(u<1/2.75)return 7.5625*u*u;if(u<2/2.75)return 7.5625*(u-=1.5/2.75)*u+.75;if(u<2.5/2.75)return 7.5625*(u-=2.25/2.75)*u+.9375;return 7.5625*(u-=2.625/2.75)*u+.984375;};
// A keyframe track: [[t,value],...] with the easing between keys (default smooth); values are numbers or arrays of numbers.
export function msTrack(keys,t,ease=msEase){if(!keys.length)return 0;if(t<=keys[0][0])return keys[0][1];const last=keys[keys.length-1];if(t>=last[0])return last[1];
 let i=0;while(i<keys.length-2&&keys[i+1][0]<=t)i++;const [t0,a,e0]=keys[i],[t1,b]=keys[i+1];const u=(e0||ease)((t-t0)/Math.max(1e-6,t1-t0));
 if(Array.isArray(a))return a.map((v,k)=>v+(b[k]-v)*u);return a+(b-a)*u;}
// The response of a spring to an impulse at time 0: a damped sine (hair, cloth, a tail, a bell), 0 before the impulse.
export function msSpring(t,amp=1,freq=3,damp=2.2){if(t<0)return 0;return amp*Math.sin(t*freq*Math.PI*2)*Math.exp(-t*damp);}
// Breathing, a slow sway and a blink that closes for 0.12 s every few seconds (seed shifts the rhythm per character).
export const msBreath=(t,seed=0)=>Math.sin((t+seed)*2.1)*.5+.5;
export function msBlink(t,seed=0){const p=3.2+((seed*7)%2.3);const u=((t+seed*1.3)%p)/p;return u>.93&&u<.97?1:0;}
// ── The idle life of the five on the board ────────────────────────────────────────────────────────────────────────────────────────
// k is the focus of the scanning (0 dim .. 1 in focus): the character reacts to being pointed at. Returns {pose, expr, props}.
export function msIdle(id,t,k=0){const br=msBreath(t,MS_CHARS.indexOf(id));const blink=msBlink(t,MS_CHARS.indexOf(id));const kk=msEase(k);
 if(id==='avia'){const wave=kk*Math.sin(t*7)*.5;return {pose:{facing:1,lean:.08+br*.02,headTilt:-.08*kk+Math.sin(t*1.3)*.03,shL:.85+kk*1.5+wave,elL:.75+kk*.2,shR:.8,elR:.72,bob:-br*1.2,scale:.78},expr:{eyes:kk>.5?'happy':'open',mouth:kk>.5?'grin':'smile',brows:.2+kk*.4,blink,blush:.4+kk*.2,look:[-.2,.3]},props:{spoon:kk>.3}};}
 if(id==='avi'){const snore=Math.sin(t*1.9);return {pose:{facing:1,crouch:1,lean:.3+snore*.03,headTilt:.55+snore*.08-kk*.3,shL:.75,elL:1.25,shR:.6,elR:1.2,hipL:.8,kneeL:-.4,hipR:.74,kneeR:-.46,scale:.75,bob:-br*.8,seat:29},expr:{eyes:kk>.6&&Math.sin(t*5)>0?'sleepy':'closed',mouth:kk>.6?'o':'sleep',brows:-.2+kk*.6,blush:.2},props:{rod:true,zzz:1-kk*.5,rodDip:kk*Math.max(0,Math.sin(t*3))}};}
 if(id==='nina'){const hop=kk*Math.max(0,Math.sin(t*6));return {pose:{facing:-1,lean:.12-kk*.1,shL:.9+kk*1.6+Math.sin(t*2.4)*.1,elL:.8-kk*.5,shR:.2+kk*.3,elR:.3,lift:hop*14,hipL:.1+hop*.5,kneeL:hop*.9,hipR:-.1-hop*.2,scale:.95,bob:-br*.6},expr:{eyes:kk>.5?'happy':'open',mouth:'grin',brows:.3+kk*.4,blink,look:[-.4+kk*.4,.3-kk*.3]},props:{can:true,water:1-kk*.7}};}
 if(id==='pol'){const hop=Math.max(0,Math.sin(t*4.2+1));const slip=kk*.6;return {pose:{facing:1,shL:2.3+Math.sin(t*4.2)*.15,elL:.4,shR:-.4+kk*2.4,elR:.3,lift:hop*(6+kk*14),hipL:.1,kneeL:hop*.5,scale:.9,bob:0},expr:{eyes:kk>.5?'wide':'open',mouth:kk>.5?'open':'o',brows:.4+kk*.5,blink,look:[0,-.6]},props:{pin:true,capSlip:slip}};}
 const chew=(Math.sin(t*5)*.5+.5)*(1-kk);const rear=kk*(.7+Math.sin(t*4)*.1);return {pose:{facing:1,chew,rear,neck:kk*.3,head:Math.sin(t*1.1)*.2-kk*.2,legs:[.1+rear*-.5,-.1+rear*-.8,.1+rear*.2,-.15+rear*.1],tail:Math.sin(t*6)*.5+.5,ears:Math.max(0,Math.sin(t*2.7))*.6+kk*.4,eyes:'open',mouth:kk>.6?'open':'smile',scale:.9},expr:{},props:{bell:kk}};}
// ── Music ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const MS_PIECE=Object.freeze({name:'Estiu a la masia',root:67,mode:[0,2,4,5,7,9,11],bpm:92,beats:4,chords:[0,3,4,0,5,3,4,0,0,5,3,4]}); // G major, 4/4
export const MS_LOUD=1,MS_GAG_LOUD=.8;   // the band a little under the foley and the voices (0.39: whole effect about −29.5 LUFS, like the other activities)
const msFit=(inst,m)=>{const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;};
export const msDeg=(d,oct=0)=>MS_PIECE.root+MS_PIECE.mode[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
export const msNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>msFit(inst,m)),t,len,vel:Math.min(1,vel*MS_LOUD),...x});
const MS_INST={avia:'clarinetRec',avi:'hornRec',nina:'fluteRec',pol:'glockRec',cabra:'marimbaRec'};
// The leitmotif of each character over a chord (degree ch), one bar from tb; half-beat grid. Each ends on a struck or plucked note
// when it is the last voice (the phrases of the suite end plucked or struck, never on a held wind note).
function msVoice(id,bar,ch,tb,beat,out,lead){const half=beat/2,oct=0;
 if(id==='avia'){const mel=[0,null,2,4,null,2,null,0];mel.forEach((d,i)=>{if(d===null)return;out.push(msNote('clarinetRec',msDeg(ch+d,0),tb+i*half,i===7?.6:.42,.4+(i===0?.08:0)));});if(bar%2===1)out.push(msNote('clarinetRec',msDeg(ch+4,0),tb+beat*3.5,.5,.36));}
 else if(id==='avi'){if(bar%2===0){out.push(msNote('hornRec',msDeg(ch+4,-1),tb,beat*1.5,.32));out.push(msNote('hornRec',msDeg(ch+2,-1),tb+beat*1.5,beat*1.2,.3));out.push(msNote('hornRec',msDeg(ch,-1),tb+beat*2.75,beat*1.2,.3));}else out.push(msNote('hornRec',msDeg(ch,-1),tb+beat,beat*2,.28));}
 else if(id==='nina'){const mel=bar%2?[0,2,4,7,null,4,null,null]:[4,null,7,null,9,7,4,null];mel.forEach((d,i)=>{if(d===null)return;out.push(msNote('fluteRec',msDeg(ch+d,1),tb+i*half,.3,.42+(i===0?.06:0)));});}
 else if(id==='pol'){const mel=[4,null,4,7,null,4,null,2];mel.forEach((d,i)=>{if(d===null)return;out.push(msNote('glockRec',msDeg(ch+d,1),tb+i*half,.5,.34));});for(let b=0;b<4;b++)if(b%2===1)out.push(msNote('violinsPizzRec',msDeg(ch+(b===1?0:4),0),tb+b*beat,.4,.4));}
 else if(id==='cabra'){const mel=[0,0,null,3,null,0,null,null];mel.forEach((d,i)=>{if(d===null)return;out.push(msNote('marimbaRec',msDeg(ch+d,1),tb+i*half,.3,.44));});out.push(msNote('woodblockRec',[0],tb+beat*3,.2,.3,{variant:'claves'}));if(bar%2===1)out.push(msNote('woodblockRec',[0],tb+beat*3.5,.2,.26,{variant:'claves'}));}}
// The accompaniment: a guitar strum on 1 and 3 with a cello pizz bass, light and steady (the family band).
function msBand(bar,ch,tb,beat,out,soft){out.push(msNote('celliPizzRec',msDeg(ch,-2),tb,1,soft?.4:.5));out.push(msNote('celliPizzRec',msDeg(ch+4,-2),tb+beat*2,.9,soft?.34:.42));
 out.push(msNote('guitarRec',[msDeg(ch,-1),msDeg(ch+2,-1),msDeg(ch+4,-1)],tb+beat*.5,.9,.28,{strum:.04}));out.push(msNote('guitarRec',[msDeg(ch+2,-1),msDeg(ch+4,-1),msDeg(ch+7,-1)],tb+beat*2.5,.8,.26,{strum:.04}));}
// The family theme (the dinner): flute and clarinet in thirds over the band, two bars.
function msTheme(bar,ch,tb,beat,out){const half=beat/2;const mel=bar%2?[4,null,5,4,null,2,null,0]:[0,2,4,null,7,null,4,null];mel.forEach((d,i)=>{if(d===null)return;out.push(msNote('fluteRec',msDeg(ch+d,1),tb+i*half,.36,.4));out.push(msNote('clarinetRec',msDeg(ch+d-2,1),tb+i*half,.38,.3));});}
// The score of a pick: the band from the push-in, the voice of the character through the episode with the voices already picked
// as counter-lines, and a plucked cadence at the end. The final adds the dinner: the family theme over all the voices.
export function msScore(id,voices,final,round=0){const beat=60/MS_PIECE.bpm,barLen=beat*4,out=[],t0=.4;const all=[...new Set([...voices,id])];
 const epBars=Math.floor((MS_PUSH+MS_EP-t0-.4)/barLen);
 for(let bar=0;bar<epBars;bar++){const tb=t0+bar*barLen,ch=MS_PIECE.chords[(bar+round*3)%12];msBand(bar,ch,tb,beat,out,true);msVoice(id,bar,ch,tb,beat,out,true);
  all.filter(v=>v!==id).forEach((v,i)=>{if((bar+i)%2===0)msVoice(v,bar,ch,tb,beat,out,false);});}
 let end=t0+epBars*barLen+.05;
 if(final){const s0=MS_PUSH+MS_EP+.6;const bars=Math.floor((MS_SOPAR-1.6)/barLen);for(let bar=0;bar<bars;bar++){const tb=s0+bar*barLen,ch=MS_PIECE.chords[bar%12];msBand(bar,ch,tb,beat,out,false);msTheme(bar,ch,tb,beat,out);all.forEach((v,i)=>{if((bar+i)%3===0)msVoice(v,bar,ch,tb,beat,out,false);});}end=s0+bars*barLen+.05;}
 [0,2,4,7].forEach((d,i)=>out.push(msNote('harpRec',msDeg(d,-1),end+i*.07,2,.44)));out.push(msNote('celliPizzRec',msDeg(0,-2),end,1.4,.5));out.push(msNote('glockRec',msDeg(4,2),end+.25,1.8,.3));
 return out.sort((a,b)=>a.t-b.t);}
export function msPatternScore(id,voices,final,round=0){const D=final?MS_FINAL:MS_STEP;return msScore(id,voices,final,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/D,length:n.len/D,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})})).filter(e=>e.at<1);}
// The taste of a character in the focus: its motif, short (the character also moves on the board).
export function msTaste(id){const beat=60/MS_PIECE.bpm,out=[];const inst=MS_INST[id]||'harpRec';
 const mel={avia:[[0,0],[2,.5],[4,1]],avi:[[4,0],[2,.6],[0,1.2]],nina:[[0,0],[2,.25],[4,.5],[7,.75]],pol:[[4,0],[4,.3],[7,.6]],cabra:[[0,0],[0,.25],[3,.6]]}[id]||[[0,0],[4,.5]];
 const oct={avia:0,avi:-1,nina:1,pol:1,cabra:1}[id]||0;for(const [d,t] of mel)out.push(msNote(inst,msDeg(d,oct),t*beat,inst==='hornRec'?.7:inst==='fluteRec'?.3:.5,.42));
 if(id==='cabra')out.push(msNote('woodblockRec',[0],.9*beat,.2,.3,{variant:'claves'}));if(id==='pol')out.push(msNote('violinsPizzRec',msDeg(0,0),.9*beat,.4,.4));return out;}

// The sounds of the episodes (0.39): the foley and the voices of the family generated with ElevenLabs (masiaRec), placed on the choreography of
// masia-episodis.js (episode seconds; the push-in of MS_PUSH comes first, the dinner after the fifth episode). A gag: name, time, gain
// (quadratic, as every velocity), the bank when it is not masiaRec (a drop and a hen of Pinta el món, pintaRec), and a length in seconds
// when the recording has to stop before its end (a strain that ends with the pop, a snore under the sheet).
const msG=(name,t,gain,x={})=>({name,at:t+MS_PUSH,gain,...x});
const MS_GAGS={
 avia:v=>[msG('focllar',0,.4),msG('paella',.1,.5),msG('sacsejada',.6,.5),msG('sacsejada',1.6,.45),msG('aviaHup',3.05,.7),msG('whoosh',3.3,.5),msG('splat',4.22,.7),msG('aviaOh',4.6,.7),
  msG('picapeus',5.9,.5),msG('gota',6.9,v?.4:.5,{inst:'pintaRec'}),msG('mosca',7.4,.35),msG('plat',9.4,.55),msG('picapeus',10.7,.4),msG('desenganxar',10.4,.6),msG('whoosh',11.05,.4),
  ...(v?[msG('splat',11.81,.45),msG('gatxiscle',11.85,.7),msG('aviaAi',12.2,.6),msG('aviaRialla',13.3,.5)]:[msG('flop',11.81,.7),msG('aviaRialla',12.9,.6)])],
 avi:v=>[msG('aviRonc',0,.55,{length:3.0}),msG('granota',1.3,.4),msG('bombolles',2.0,.35),msG('bombolles',2.7,.35),msG('fil',3.2,.6),msG('aviEh',3.3,.7),msG('canya',3.6,.55),msG('tamboret',4.5,.45),
  msG('canya',4.9,.45),msG('esquitxpetit',5.2,.5),msG('esquitxpetit',6.1,.5),msG('canya',6.2,.4),msG('esquitxgran',7.0,.7),msG('whoosh',7.3,.35),msG('carpacua',8.3,.6),msG('degoteig',8.6,.45),
  ...(v?[msG('bota',8.8,.6),msG('degoteig',9.6,.4),msG('aviEh',10.0,.5),msG('carpacua',11.0,.6),msG('whoosh',11.1,.3),msG('flop',12.6,.5),msG('aviRialla',12.8,.6),msG('esquitxgran',13.9,.6)]
   :[msG('carpacua',9.5,.55),msG('carpacua',10.5,.55),msG('aviRialla',11.3,.6),msG('whoosh',12.5,.35),msG('esquitxgran',13.3,.6),msG('bombolles',13.8,.35)])],
 nina:v=>[msG('ninaEsforc',1.4,.7,{length:1.5}),msG('terracruix',1.6,.45),msG('terracruix',2.5,.4),msG('pop',3.3,.7),msG('caigudafulles',3.6,.6),msG('ninaEsbufec',4.0,.6),msG('whoosh',5.0,.35),
  msG('gallina',6.3,.5,{inst:'pintaRec'}),msG('ninaEsforc',6.8,.6,{length:.3}),msG('terracruix',7.0,.45),msG('terraobre',7.3,.7),msG('boing',7.45,.8),msG('gallines',7.5,.6),msG('ninaUuuh',7.7,.7),
  msG('ninaRialla',10.5,.65),msG('relliscada',12.5,.6),msG('aterratge',13.5,.6),...(v?[msG('gallines',12.1,.5)]:[])],
 pol:v=>[msG('rafega',.6,.4),msG('gorra',1.0,.35),msG('polUep',1.05,.6),msG('rafega',2.3,.55),msG('gorra',2.7,.6),msG('llencol',2.9,.4),msG('rafega',4.2,.65),msG('pinces',4.6,.7),msG('telainfla',4.7,.7),
  msG('polIiih',4.9,.7),msG('llencol',6.6,.45),msG('whoosh',8.0,.35),msG('poffpalla',8.6,.7),msG('llencol',9.5,.35),msG('polRialla',9.6,.6),
  ...(v?[msG('campaneta',10.7,.5),msG('polRialla',11.6,.6),msG('campaneta',12.4,.45)]:[msG('aviRonc',10.6,.5,{length:2.6}),msG('polRialla',12.0,.55)])],
 cabra:v=>[msG('abelles',.3,.3),msG('campaneta',.9,.45),msG('gratar',3.2,.55),msG('trot',3.5,.5),msG('bonk',3.85,.8),msG('branca',4.0,.6),msG('figues',4.3,.55),msG('figacap',5.0,.6),
  ...(v?[msG('gallina',4.3,.5,{inst:'pintaRec'}),msG('caigudafulles',4.9,.4)]:[]),msG('mossegada',5.95,.55),msG('tro',6.9,.5),msG('pluja',7.3,.55),msG('pluja',8.3,.5),msG('sacsejadapel',8.5,.6),
  msG('campaneta',8.6,.5),msG('trot',11.0,.5),msG('campaneta',11.8,.4),msG('gronxador',12.4,.5)]};
// The dinner (after the fifth episode): the family comes to the table, the toast, the goat and the tablecloth.
const MS_SOPAR_GAGS=[['passescorrent',.1,.5],['ninaRialla',.5,.5],['passescorrent',1.3,.45],['polRialla',1.7,.5],['plats',3.0,.55],['tamboret',3.6,.35],['tamboret',4.0,.3],['campaneta',5.6,.45],['trot',5.6,.45],
 ['gerro',7.3,.6],['gatsalt',7.6,.5],['aviaRialla',8.2,.45],['brindis',10.4,.65],['riallagrup',10.8,.5],['mastegar',12.0,.45],['estovalles',14.0,.65],['aviaAi',14.3,.65],['polRialla',14.6,.6],['mossegada',15.2,.5],['riallagrup',16.4,.55]];
// The gags of an episode (and of the dinner when it is the final one): Pol's twist (the ghost goat) only while the goat is still on the board.
export function msGagEvents(id,variant,final,picks=[]){const v=id==='pol'?(variant&&!picks.includes('cabra')?1:0):variant|0;const out=(MS_GAGS[id]||MS_GAGS.avia)(v);
 if(final)for(const [name,t,gain] of MS_SOPAR_GAGS)out.push({name,at:MS_PUSH+MS_EP+t,gain:gain*.92});return out.sort((a,b)=>a.at-b.at);}
// The same gags as pattern events (time and length as fractions of the effect), like the music of msPatternScore.
export function msGagPattern(id,variant,final,picks=[]){const D=final?MS_FINAL:MS_STEP;return msGagEvents(id,variant,final,picks).filter(e=>e.at<D-.3).map(e=>({inst:e.inst||'masiaRec',midi:[0],at:e.at/D,length:Math.min(e.length??D*.5,D-e.at)/D,vel:e.gain*MS_GAG_LOUD,variant:e.name}));}
// The air of the board by the hour (0 morning … 0.8 dusk): the dawn chorus, a blackbird over the meadow, the cicadas of noon, the crickets and
// the frogs of the evening (loops of Natura and Pinta el món, natureRec), one or two at a time, like the air of Pinta el món.
export function msAmbience(hour){const A=(name,level,lowpass=9000)=>({name,level,lowpass});
 if(hour<.15)return [A('dawn',.3)];if(hour<.35)return [A('blackbird',.28),A('meadow',.24,8000)];if(hour<.55)return [A('ptCigales',.3,7000)];
 if(hour<.75)return [A('ptCigales',.24,6000),A('meadow',.24,7000)];return [A('crickets',.26,8000),A('frogs',.18,6000)];}
// A touch of the character's own sound with its motif when the focus reaches it: the pan, a snore, a giggle, a «uep!», the bell.
const MS_FOCUS={avia:['sacsejada',.4,1.3],avi:['aviRonc',.45,1.2],nina:['ninaRialla',.4,1.9],pol:['polUep',.45,.6],cabra:['campaneta',.45,1.7]};
export function msFocusSound(id){const f=MS_FOCUS[id];return f?{inst:'masiaRec',midi:[0],t:0,len:f[2],vel:f[1],variant:f[0]}:null;}

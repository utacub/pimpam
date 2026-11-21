// Sis activitats de Mira i Juga 2 (0.78, Marc, 21 November 2026): «Munta el teu robot», «Igual que el plànol», «Tria el teu conte»,
// «Escolta i tria», «El camí dels nenúfars» i «Segueix l'ou». Each one is a mode of a Mira i Juga 2 scene (github.com/utacub/miraijuga2),
// which runs whole inside an iframe (dist/mj2/, written by tools/mj2-import.py): its art, 3D models, sounds, voices and music are those
// of Mira i Juga 2. What changes is the access and the management: nothing is triggered by gaze, mouse or touch inside the scene; Pim
// Pam asks the bridge (dist/mj2/pont.js) which things can be chosen at this moment, runs its own scanning focus over them (one switch,
// automatic; two switches, step by step), and chooses one. The settings live in the «Aquesta activitat» tab, and the header, pause,
// information and exit are those of Pim Pam. While the scene plays (the crane carries a piece, the frog jumps, the eggs are shuffled)
// there is nothing to choose and no focus: the focus comes back, on the first option, when the scene asks again.
import {tlRing} from './tauler.js';
import {scanRing} from './input.js';

const mjItem=(id,code,name,desc,task,act)=>Object.freeze({id,code,name,desc,type:'scan',mira:act,scene:id,task,recorded:false,
 level:task==='guided'?'05 · Relacionar':'04 · Triar',tag:task==='guided'?'Model i selecció':'Totes les tries són bones',time:'1 o 2 commutadors'});
export const MJ_ITEMS=Object.freeze([
 mjItem('mj-robot','EN27','Munta el teu robot','El taller d’en Biel, el castor enginyer: tria les potes, el cos, els braços i el cap del robot entre peces fetes d’objectes reciclats. La grua porta cada peça i la cargola; amb el robot complet, la palanca l’encén i cada peça fa la seva gràcia. Cada tres robots, foto de grup.','creative','robots'),
 mjItem('mj-conte','EN28','Tria el teu conte','Un llibre desplegable de quatre pàgines: en Lluc, el camaleó, pregunta qui surt al conte, on va, què troba i com acaba, i cada solapa triada aixeca la seva escena de paper. Al final, en Lluc llegeix tot el conte que s’ha triat.','creative','conte'),
 mjItem('mj-nenufars','EN29','El camí dels nenúfars','Una granota ha de travessar l’estany fins a la riba on l’espera la seva família: a cada salt, tria a quin dels nenúfars que té a l’abast salta. Alguns nenúfars amaguen sorpreses; cada tres granotes que arriben, festa.','creative','granotes'),
 mjItem('mj-planol','EN30','Igual que el plànol','Al taller d’en Biel, un plànol blau mostra el robot que cal copiar: tria la peça que hi ha dibuixada. La que no hi va, la grua la gronxa i la torna al prestatge, sense so d’error; quan el robot és igual que el plànol, s’encén sol.','guided','robots'),
 mjItem('mj-escolta','EN31','Escolta i tria','El llibre desplegable d’en Lluc: ell diu quin personatge, quin lloc, quin objecte o quin final cal triar, i cal trobar la solapa que ho mostra. Si no és aquella, la solapa es plega i en Lluc ho torna a dir.','guided','conte'),
 mjItem('mj-ou','EN32','Segueix l’ou','Una cria de dinosaure crida des d’un dels ous; després els ous es barregen i cal seguir el de la cria i triar-lo quan s’aturen. Si no és aquell, l’ou diu que no i la cria torna a cridar des del bo.','guided','ous')]);
export const MJ_IDS=Object.freeze(MJ_ITEMS.map(x=>x.id));
export const mjIs=id=>MJ_IDS.includes(id);
// the card pictures: a still of each activity taken from the scene itself (tools/mj2-cartes.mjs)
export const MJ_CARD=Object.freeze(Object.fromEntries(MJ_IDS.map(id=>[id,`./mj2/cartes/${id}.webp`])));

const MJ_SPEED={lenta:.6,normal:1,rapida:1.4};
let MJ=null;
// What the scene receives from the settings: speed, music, sound and volume. The size is always Mira i Juga 2's «petita» (the most
// options to choose from): with scanning, a size setting makes no sense (Marc, 21 November 2026, 0.78.1). At the default volume of Pim Pam (40 %) the scene sounds as loud as in Mira i Juga 2 (its own volume, 0.8).
function mjCfg(s,lang){const total=s.sound?.8*(s.volume??40)/40:0,vol=Math.min(1,total);
 return {lang,boost:vol>0?total/vol:1,cfg:{size:2,speed:MJ_SPEED[s.mjSpeed]??1,music:s.mjMusic!==false,sound:!!s.sound&&total>0,vol:vol||0,mvol:.35}};}
export function mjStart(game,s,stage,lang,host){mjStop();if(!stage)return;const f=document.createElement('iframe');
 f.className='mj-frame';f.src='./mj2/index.html';f.title=game.item.name;f.tabIndex=-1;f.setAttribute('aria-hidden','true');
 f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;background:#000';
 stage.insertBefore(f,stage.firstChild);
 const M=MJ={f,id:game.item.id,opened:false,targets:[],sig:'',cfgSig:'',paused:false,lang,picks:0};game.mira=M;
 window.__mjAudio=host.audio;window.__mjOut=host.out;
 f.addEventListener('load',()=>{if(MJ!==M)return;const PP=f.contentWindow?.PP;if(!PP)return;const c=mjCfg(s,lang);M.cfgSig=JSON.stringify(c);M.opened=PP.open(M.id,c);PP.pause(M.paused);M.sent=true;});}
export function mjStop(){if(!MJ)return;try{MJ.f.contentWindow?.PP?.close();}catch{}MJ.f.remove();MJ=null;}
const mjPP=()=>MJ?.opened?MJ.f.contentWindow?.PP:null;
// the loading cover waits for the 3D scene
export function mjLoad(){if(!MJ)return 1;try{return mjPP()?.ready()?1:0;}catch{return 1;}}
// the scene stops (and is silent) while the loading cover, the pause, a dialog or another tab is in front
export function mjPause(p){if(!MJ)return;p=!!p;const P=mjPP();if(MJ.paused===p&&MJ.sent===!!P)return;MJ.paused=p;MJ.sent=!!P;try{P?.pause(p);}catch{}}
// Every frame: the settings that changed, and the options of the moment. Returns true when they changed (the focus goes back to the
// first one).
export function mjTick(game,s,lang){const P=mjPP();if(!P)return false;const c=mjCfg(s,lang),cs=JSON.stringify(c);if(cs!==MJ.cfgSig){MJ.cfgSig=cs;try{P.cfg(c);}catch{}}
 let t=[];try{t=P.targets()||[];}catch{t=[];}const sig=t.map(x=>x.id).join(',');MJ.targets=t;if(sig===MJ.sig)return false;MJ.sig=sig;return true;}
export const mjCount=()=>MJ?.targets.length||0;
export function mjPick(i){const P=mjPP(),t=MJ?.targets[i];if(!P||!t)return false;let ok=false;try{ok=P.pick(t.id);}catch{}if(ok){MJ.picks++;MJ.targets=[];MJ.sig='';}return ok;}
// The focus: the frame and the colour layer of the scanning settings, drawn around the option on the canvas laid over the scene.
function mjShape(t){const {x,y,w,h}=t,P=[];
 if(t.shape==='ellipse'){for(let i=0;i<48;i++){const a=-Math.PI/2+i/48*Math.PI*2;P.push([x+w/2+Math.cos(a)*w/2,y+h/2+Math.sin(a)*h/2]);}return P;}
 const r=Math.min(26,w*.16,h*.16);for(const [cx,cy,a0] of [[x+w-r,y+r,-Math.PI/2],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI/2],[x+r,y+r,Math.PI]])for(let i=0;i<=6;i++){const a=a0+i/6*Math.PI/2;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
 return P;}
export function mjDraw(c,w,h,s,index,progress){c.clearRect(0,0,w,h);const t=MJ?.targets[index];if(!t||MJ.paused)return;
 const fw=MJ.f.clientWidth||w,fh=MJ.f.clientHeight||h,kx=w/fw,ky=h/fh,pad=Math.max(6,(s.scanWidth||10)*.6);
 tlRing(c,mjShape({...t,x:t.x*kx-pad,y:t.y*ky-pad,w:t.w*kx+pad*2,h:t.h*ky+pad*2}),progress,1,Math.max(.6,Math.min(1.2,w/1280)),scanRing(s));}
// The settings of the «Aquesta activitat» tab (the same two for the six activities).
export function mjFields(s,sel,checkbox){
 return `<div class="form-grid">${sel('mjSpeed','Velocitat de l’escena',[['lenta','Lenta'],['normal','Normal'],['rapida','Ràpida']],'Com es mouen els personatges; als ous, com de ràpid es barregen.')}</div>${checkbox('mjMusic','Música de fons','La música de cada escena de Mira i Juga 2. Els sons i les veus sonen sempre que el so estigui activat.')}`;}

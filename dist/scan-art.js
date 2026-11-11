import {cincToken} from './cinc.js';
import {scanDefinition,scanDisplayPicks,scanContent} from './scan-catalog.js';
import {TL_DIM,tlBoard,tlLayout,tlSheet} from './tauler.js';
import {ET_TRIP} from './estacio.js';
import {etBoard,etResult,etTrip} from './estacio-art.js';
import {TM_PIECE} from './templet.js';
import {tmBoard,tmResult} from './templet-art.js';
import {ogBoard,ogResult} from './origen-art.js';
import {gxBoard,gxResult} from './guix-art.js';
import {gpBoard,gpResult} from './cassola-art.js';
import {ptBoard,ptResult,ptLayout} from './pinta-art.js';
import {maBoard,maResult,maLayout} from './masia-art.js';
import {exBoard,exResult,exLayout} from './encaix-art.js';
import {vhBoard,vhResult,vhLayout} from './vehicles-art.js';
import {vsBoard,vsResult,vsLayout} from './vestidor-art.js';
import {Cellipse,Cround,Cgrad,Cstroke,Cshape,Cwheel,Cscene,CshapeAt,Cmix} from './cause-art.js';
import {drawPaperFlower} from './visual-patterns.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
import {scanRing} from './input.js';
const S_TAU=Math.PI*2,S_PI=Math.PI;
const Sclamp=x=>Math.max(0,Math.min(1,x));
const Ssmooth=x=>{x=Sclamp(x);return x*x*(3-2*x)};
const Srand=i=>{const n=Math.sin(i*91.37+17.3)*42751.83;return n-Math.floor(n)};
const S_palette=['#09b8c8','#fa568c','#ffd046','#8762e8'];
function Sprop(c,kind,color=S_palette[0],value=0){const p=S_palette;
 if(kind==='hat'){Cellipse(c,0,27,87,16,p[2]);Cround(c,-48,-66,96,91,18,Cgrad(c,-48,-66,96,91,p[2]));Cround(c,-49,0,98,22,5,p[1]);return;}
 if(kind==='bag'){Cround(c,-63,-62,126,156,24,Cgrad(c,-63,-62,126,156,p[2]),'#a48d6b');Cround(c,-45,17,90,57,14,p[1]);Cstroke(c,()=>{c.moveTo(-30,-61);c.quadraticCurveTo(0,-118,30,-61);},'#bca378',8);return;}
 Cshape(c,0,64,color);
}
export function drawScanToken(c,w,h,option,state=null,phase=0){const kind=option.kind,value=option.value;if(kind==='cinc-base'||kind==='cinc-power'){cincToken(c,w,h,option);return;}c.save();c.translate(w*.5,h*.49);const scale=Math.min(w/280,h/280);c.scale(scale,scale);
 Sprop(c,kind,option.color||S_palette[(typeof value==='number'?value:0)%4],value);
 c.restore();
}
// The decor of the scanning scenes (0.17, setting «Presentació del decorat»): the pale background and the platform. Atenuat, they are
// drawn under a veil of the base colour; without the decor they are left out. What the pupil chooses (the vehicle, the piece)
// is always drawn whole. S_DECOR is set by renderScanActivity for the frame being drawn.
let S_DECOR=escDecor({});
function Sdecor(c,draw){if(S_DECOR.fade<=0)return;c.save();c.globalAlpha*=S_DECOR.fade;draw();c.restore();}
// The scanning boards of 0.16 (On anem? and Detectius de sons): the scene fills the stage and the options are zones of it (tauler.js).
// app.js keeps on game.board the focus, the light of each zone, the time left and what sounds; without it (the card of the home page,
// the tests) the board is drawn at rest, fully lit.
function Sboard(c,w,h,id,game,s,preview){const state=game.scanState||{id,stage:0,picks:[],round:0,status:'choose',pending:null,hint:true,armed:true},b=preview?{}:game.board||{},content=scanContent(state.status==='done'?{...state,status:'choose'}:state,s),zones=id==='pinta'?ptLayout(state,content,w,h):id==='masia'?maLayout(state,content,w,h):id==='encaix'?exLayout(state,content,w,h):id==='vehicles'?vhLayout(state,content,w,h):id==='vestidor'?vsLayout(state,content,w,h):tlLayout(id,content.length,w,h);
 const view={decor:escDecor({background:s.background,base:s.base,opacity:s.opacity,preview}),ring:scanRing(s),options:content,zones,lights:b.lights&&b.lights.length===zones.length?b.lights:zones.map(()=>b.focus===undefined?1:TL_DIM),focus:b.focus??-1,progress:b.progress??null,waiting:!preview&&!state.armed&&state.status!=='done'&&s.waitCue!==false,wait:preview?0:(b.wait??(!state.armed&&state.status!=='done'&&s.waitCue!==false?1:0)),clock:b.clock??0,cue:b.cue||0,sounding:b.sounding??-1,soundLevel:b.soundLevel||0,trip:game.boardTrip??state.round};
 const pending=state.pending,chosen=pending?Math.max(0,content.findIndex(x=>x.id===pending.option?.id)):-1;
 if(id==='destinations'){if(game.time!==null&&game.time!==undefined&&pending){etResult(c,w,h,state,game,s,{...view,chosen,place:pending.option?.value||'sea'},game.time);return true;}
  // the end of the trip stays on screen: it does not move any more, so it is painted once
  if(state.status==='done'){const place=state.picks[state.picks.length-1]?.value||'sea';tlSheet(c,['et-end',w,h,place,state.round||0,view.trip,!!s.plainScene,!!s.reduced].join('|')+escDecorKey(view.decor)+(view.decor.fade>0?'':'|none'+view.decor.base),x=>etTrip(x,0,0,w,h,place,state.round||0,ET_TRIP,s,view.trip,view.decor));return true;}
  etBoard(c,w,h,state,game,s,view);return true;}
 // D'on ve aquest so? and El meu espectacle de llum (0.18): a round ends with the result, so there is no end to keep on screen.
 if(id==='sources'){if(game.time!==null&&game.time!==undefined&&pending){ogResult(c,w,h,state,game,s,{...view,chosen,correct:!!pending.correct,picked:pending.option?.value},game.time);return true;}ogBoard(c,w,h,state,game,s,view);return true;}
 if(id==='lights'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){gxResult(c,w,h,state,game,s,{...view,chosen,picks:[...picks,pending.option?.value],final:!!pending.final},game.time);return true;}gxBoard(c,w,h,state,game,s,{...view,picks});return true;}
 // Pinta el món (0.38): the wash of the chosen zone and its life; the sixth one ends with the finale of the season and the page turn.
 if(id==='pinta'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){ptResult(c,w,h,state,game,s,{...view,chosen,picks,pendingZone:pending.option?.value,final:!!pending.final},game.time);return true;}ptBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 // Estiu a la masia (0.39): the episode of the chosen character (the push-in, the story, the way back), the dinner after the fifth.
 if(id==='masia'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){maResult(c,w,h,state,game,s,{...view,chosen,picks,pendingChar:pending.option?.value,final:!!pending.final},game.time);return true;}maBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 // Encaixos de fusta (0.45): the flight of the piece to its hole and its life, the try of a piece that does not fit, the party and the change of board.
 if(id==='encaix'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){exResult(c,w,h,state,game,s,{...view,chosen,picks,pendingId:pending.option?.value,correct:!!pending.correct,final:!!pending.final},game.time);return true;}exBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 // El taller de vehicles (0.53): the piece that clicks on the chassis; the last one, the wait for the press, the ride round the room and the garage.
 if(id==='vehicles'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){vhResult(c,w,h,state,game,s,{...view,chosen,picks,pendingId:pending.option?.value,correct:true,final:!!pending.final},game.time);return true;}vhBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 // El vestidor fantàstic (rebuilt in 0.73): the piece flies onto the artist with its gag; the last one, the number on the stage.
 if(id==='vestidor'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){vsResult(c,w,h,state,game,s,{...view,chosen,picks,pendingId:pending.option?.value,final:!!pending.final,made:game.vsMade},game.time);return true;}vsBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 // La cassola d’en Glups (0.24; 0.27): the plop of each ingredient, and at the end the tasting and the creature.
 if(id==='pot'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){gpResult(c,w,h,state,game,s,{...view,chosen,picks:[...picks,pending.option?.value],final:!!pending.final},game.time);return true;}gpBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 if(game.time!==null&&game.time!==undefined&&pending){tmResult(c,w,h,state,game,s,{...view,chosen,correct:!!pending.correct,picked:pending.option?.value},game.time);return true;}
 if(state.status==='done'){const last=state.picks[state.picks.length-1];tmResult(c,w,h,state,game,s,{...view,chosen:Math.max(0,content.findIndex(x=>x.id===last?.id)),correct:true,picked:last?.value},TM_PIECE);return true;}
 tmBoard(c,w,h,state,game,s,view);return true;}
export function renderScanActivity(c,w,h,id,game,s,preview=false){const def=scanDefinition(id);if(!def)return false;if(tlBoard(id))return Sboard(c,w,h,id,game,s,preview);let state=game.scanState;if(!state){state={id,stage:0,picks:[],round:0,status:'choose',pending:null,hint:true,armed:true};}
 const zoneH=h*.72,t=s.reduced?0:game.time??0,u=game.time!==null?Math.min(1,game.time/(game.duration||5.5)):.6;
 S_DECOR=escDecor({background:s.background,base:s.base,opacity:s.opacity,preview});
 if(S_DECOR.fade>0){const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,def.task==='guided'?'#f0f4ff':'#eef6ff');bg.addColorStop(1,def.task==='groups'?'#e1f8ee':'#e0f4ff');c.fillStyle=bg;c.fillRect(0,0,w,h);escVeil(c,S_DECOR,0,0,w,h);}else{c.fillStyle=S_DECOR.base;c.fillRect(0,0,w,h);}
return true;
}

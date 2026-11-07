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
import {Cellipse,Cround,Cgrad,Cstroke,Cshape,Cwheel,Cscene,CshapeAt,Cmix} from './cause-art.js';
import {drawPaperFlower} from './visual-patterns.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
import {scanRing} from './input.js';
const S_TAU=Math.PI*2,S_PI=Math.PI;
const Sclamp=x=>Math.max(0,Math.min(1,x));
const Ssmooth=x=>{x=Sclamp(x);return x*x*(3-2*x)};
const Srand=i=>{const n=Math.sin(i*91.37+17.3)*42751.83;return n-Math.floor(n)};
const S_palette=['#09b8c8','#fa568c','#ffd046','#8762e8'];
function Srobot(c,pose=0,palette=S_palette,dress=null){const t=pose;c.save();if(dress?.[1]?.value===0){c.fillStyle=Cgrad(c,-118,-61,236,227,palette[1]);c.beginPath();c.moveTo(-45,-61);c.lineTo(-118,127);c.quadraticCurveTo(0,166,118,127);c.lineTo(45,-61);c.closePath();c.fill();}Cround(c,-67,-57,134,153,28,Cgrad(c,-67,-57,134,153,palette[0]),'#5d7b86');for(let side of [-1,1]){c.save();c.translate(side*63,-24);c.rotate(side*(.2+Math.sin(t*3+side)*.2));Cround(c,-12,0,24,78,12,Cgrad(c,-12,0,24,78,palette[2]));Cellipse(c,0,75,17,20,'#cddbd3');c.restore();Cround(c,side*31-16,88,32,58,12,Cgrad(c,0,88,32,58,palette[0]));Cround(c,side*31-26,133,52,20,8,'#bccfcd');}Cround(c,-50,-30,100,74,15,'#355260');for(let j=0;j<5;j++)Cround(c,-35+j*16,-8+Math.sin(t*3+j)*6,8,29,4,palette[(j+1)%4]);
 c.save();c.translate(0,-108);c.rotate(Math.sin(t*2)*.05);Cround(c,-73,-61,146,111,29,Cgrad(c,-73,-61,146,111,palette[3]),'#68848e');Cround(c,-57,-41,114,54,19,'#334f60');for(let side of [-1,1]){Cellipse(c,side*26,-14,11,13,palette[0]);Cellipse(c,side*24,-18,3,4,'#fff7da');}Cstroke(c,()=>{c.moveTo(-18,30);c.quadraticCurveTo(0,39,18,30);},'#6a7180',3);Cstroke(c,()=>{c.moveTo(0,-63);c.lineTo(0,-91);},'#8ea9ac',5);Cellipse(c,0,-96,10,10,palette[2]);
 if(dress?.length){const hat=dress[0]?.value||0;c.save();c.translate(0,-61);if(hat===0){Cround(c,-43,-72,86,65,9,Cgrad(c,-43,-72,86,65,palette[1]));Cellipse(c,0,0,66,12,palette[1]);}else if(hat===1){Cellipse(c,0,-10,61,34,palette[0]);Cround(c,-4,-10,80,18,9,palette[0]);}else{c.fillStyle=Cgrad(c,-53,-55,106,55,palette[2]);c.beginPath();c.moveTo(-53,0);c.lineTo(-60,-47);c.lineTo(-25,-24);c.lineTo(0,-64);c.lineTo(27,-24);c.lineTo(60,-47);c.lineTo(53,0);c.closePath();c.fill();for(let j=0;j<3;j++)Cellipse(c,(j-1)*32,-15,5,7,palette[1]);}c.restore();}
 if(dress?.length>2){const access=dress[2].value;if(access===0){for(let side of [-1,1]){c.beginPath();c.ellipse(side*26,-14,24,23,0,0,S_TAU);c.strokeStyle=palette[2];c.lineWidth=5;c.stroke();}Cstroke(c,()=>{c.moveTo(-4,-14);c.lineTo(4,-14);},palette[2],4);}else if(access===1){c.fillStyle=palette[1];c.beginPath();c.moveTo(0,43);c.lineTo(-31,25);c.lineTo(-31,61);c.closePath();c.fill();c.beginPath();c.moveTo(0,43);c.lineTo(31,25);c.lineTo(31,61);c.closePath();c.fill();}}
 c.restore();if(dress?.length>1){const clothes=dress[1].value;if(clothes===0){/* Cape was drawn behind the body. */}else if(clothes===1){Cround(c,-58,-41,116,117,18,Cgrad(c,-58,-41,116,117,palette[1]));Cstroke(c,()=>{c.moveTo(0,-41);c.lineTo(0,76);},palette[2],4);for(let j=0;j<4;j++)Cellipse(c,15,-20+j*25,3,3,palette[2]);}else{Cround(c,-70,-66,140,24,11,palette[1]);Cround(c,28,-51,24,84,9,Cgrad(c,28,-51,24,84,palette[1]));}}
 if(dress?.[2]?.value===2){Cround(c,54,10,55,81,13,Cgrad(c,54,10,55,81,palette[2]),'#a28c6a');Cround(c,65,43,33,31,7,palette[1]);}c.restore();}
function Svehicle(c,picks=[],time=0,small=false){const body=picks[0]?.value||0,wheels=picks[1]?.value||0,top=picks[2]?.value||0,p=S_palette;c.save();if(body===0){Cround(c,-147,-62,294,115,32,Cgrad(c,-147,-62,294,115,p[0]),'#5a7884');c.fillStyle=Cgrad(c,-88,-140,176,90,p[1]);c.beginPath();c.moveTo(-107,-57);c.lineTo(-74,-130);c.quadraticCurveTo(0,-166,74,-130);c.lineTo(107,-57);c.fill();Cround(c,-66,-125,132,65,16,'#b7d9db');}else if(body===1){Cround(c,-159,-133,318,186,25,Cgrad(c,-159,-133,318,186,p[2]),'#8d897e');Cround(c,13,-111,110,69,13,'#aed0d7');Cround(c,-131,-109,118,62,12,'#b7d9dc');Cround(c,-108,-20,106,16,6,p[1]);}else{c.fillStyle=Cgrad(c,-166,-76,330,130,p[3]);c.beginPath();c.moveTo(-156,-57);c.quadraticCurveTo(-20,-154,162,-15);c.lineTo(107,52);c.lineTo(-150,52);c.closePath();c.fill();Cellipse(c,5,-53,43,42,'#b4d4d9');Cround(c,-190,-16,44,48,7,p[2]);}
 for(let side of [-1,1]){const r=wheels===0?46:wheels===1?32:42;if(wheels===2){c.save();c.translate(side*99,54);c.rotate(time*2);Cshape(c,0,r,p[1]);c.restore();}else Cwheel(c,side*99,54,r,time*2,p[3]);}Cellipse(c,144,0,12,12,'#f4dc9f');Cellipse(c,-148,0,7,10,p[1]);
 if(picks.length>2){c.save();c.translate(body===1?0:-10,body===1?-137:-150);if(top===0){Cstroke(c,()=>{c.moveTo(0,0);c.lineTo(0,-75);},'#8f927a',4);c.fillStyle=p[1];c.beginPath();c.moveTo(0,-75);c.lineTo(61,-56);c.lineTo(0,-39);c.fill();}else if(top===1){c.save();c.translate(-100,-165);drawPaperFlower(c,200,200,3,6,1,false,'black');c.restore();}else{c.save();c.rotate(time*4);Cellipse(c,-24,-28,35,10,p[1]);Cellipse(c,24,-28,35,10,p[2]);Cellipse(c,0,-28,8,8,'#eef0d6');c.restore();}c.restore();}c.restore();}
function Sprop(c,kind,color=S_palette[0],value=0){const p=S_palette;
 if(kind==='hat'){Cellipse(c,0,27,87,16,p[2]);Cround(c,-48,-66,96,91,18,Cgrad(c,-48,-66,96,91,p[2]));Cround(c,-49,0,98,22,5,p[1]);return;}
 if(kind==='bag'){Cround(c,-63,-62,126,156,24,Cgrad(c,-63,-62,126,156,p[2]),'#a48d6b');Cround(c,-45,17,90,57,14,p[1]);Cstroke(c,()=>{c.moveTo(-30,-61);c.quadraticCurveTo(0,-118,30,-61);},'#bca378',8);return;}
 Cshape(c,0,64,color);
}
export function drawScanToken(c,w,h,option,state=null,phase=0){const kind=option.kind,value=option.value;if(kind==='cinc-base'||kind==='cinc-power'){cincToken(c,w,h,option);return;}c.save();c.translate(w*.5,h*.49);const scale=Math.min(w/280,h/280);c.scale(scale,scale);
 if(kind==='vehicle-body'||kind==='vehicle-wheels'||kind==='vehicle-top'){c.scale(.74,.74);Svehicle(c,[{value:kind==='vehicle-body'?value:0},{value:kind==='vehicle-wheels'?value:0},...(kind==='vehicle-top'?[{value}]:[])],0);}
 else if(kind==='hat-choice'){const v=value;if(v===0)Sprop(c,'hat');else if(v===1){Cellipse(c,0,5,73,45,Cgrad(c,-73,-40,146,90,S_palette[0]));Cround(c,-10,16,100,21,10,S_palette[0]);}else{c.fillStyle=Cgrad(c,-81,-70,162,140,S_palette[2]);c.beginPath();c.moveTo(-71,59);c.lineTo(-81,-49);c.lineTo(-36,-16);c.lineTo(0,-75);c.lineTo(36,-16);c.lineTo(81,-49);c.lineTo(71,59);c.closePath();c.fill();}}
 else if(kind==='clothes'){if(value===2){Cround(c,-70,-35,140,36,14,S_palette[1]);Cround(c,13,-3,33,104,10,Cgrad(c,13,-3,33,104,S_palette[1]));}else{c.fillStyle=Cgrad(c,-85,-78,170,170,S_palette[value===0?1:0]);c.beginPath();c.moveTo(-32,-76);c.lineTo(-94,76);c.quadraticCurveTo(0,106,94,76);c.lineTo(32,-76);c.closePath();c.fill();}}
 else if(kind==='accessory'){if(value===0){for(let side of [-1,1]){c.beginPath();c.ellipse(side*43,0,35,33,0,0,S_TAU);c.strokeStyle=S_palette[2];c.lineWidth=9;c.stroke();}Cstroke(c,()=>{c.moveTo(-8,0);c.lineTo(8,0);},S_palette[2],6);}else if(value===2)Sprop(c,'bag');else{c.fillStyle=S_palette[1];c.beginPath();c.moveTo(0,0);c.lineTo(-70,-43);c.lineTo(-70,43);c.closePath();c.fill();c.beginPath();c.moveTo(0,0);c.lineTo(70,-43);c.lineTo(70,43);c.closePath();c.fill();}}
 else Sprop(c,kind,option.color||S_palette[(typeof value==='number'?value:0)%4],value);
 c.restore();
}
function Ssparkles(c,t=1,color=S_palette){for(let j=0;j<20;j++){const a=j*2.399,rr=(150+Srand(j)*140)*Math.sin(Sclamp(t)*S_PI*.85);CshapeAt(c,500+Math.cos(a)*rr,320+Math.sin(a)*rr*.66,4+Srand(j+20)*5,color[j%4],0);}}
// The decor of the scanning scenes (0.17, setting «Presentació del decorat»): the pale background and the platform. Atenuat, they are
// drawn under a veil of the base colour; without the decor they are left out. What the pupil chooses (the robot's clothes, the vehicle,
// the piece) is always drawn whole. S_DECOR is set by renderScanActivity for the frame being drawn.
let S_DECOR=escDecor({});
function Sdecor(c,draw){if(S_DECOR.fade<=0)return;c.save();c.globalAlpha*=S_DECOR.fade;draw();c.restore();}
function Sstage(c){Sdecor(c,()=>{Cround(c,150,555,700,24,10,Cgrad(c,150,555,700,24,'#91b8ef'));Cstroke(c,()=>{c.moveTo(180,579);c.lineTo(180,604);c.moveTo(820,579);c.lineTo(820,604);},'#4f78bf',7);});}
function Screative(c,id,state,game,s,t,u){const picks=scanDisplayPicks(state),final=state.status==='done'||state.pending?.final;
 if(id==='dress'){Sstage(c);c.save();c.translate(500,362);c.scale(1.25,1.25);Srobot(c,final?t*.6:t*.14,S_palette,picks);c.restore();if(final&&game.time!==null)Ssparkles(c,Ssmooth(u/.5));return;}
 if(id==='vehicles'){Sstage(c);const drive=final&&game.time!==null?Math.sin(Sclamp(u)*S_PI)*220:0;c.save();c.translate(500+drive,400);c.scale(1.3,1.3);Svehicle(c,picks,final?t:0);c.restore();return;}
}
// The scanning boards of 0.16 (On anem? and Detectius de sons): the scene fills the stage and the options are zones of it (tauler.js).
// app.js keeps on game.board the focus, the light of each zone, the time left and what sounds; without it (the card of the home page,
// the tests) the board is drawn at rest, fully lit.
function Sboard(c,w,h,id,game,s,preview){const state=game.scanState||{id,stage:0,picks:[],round:0,status:'choose',pending:null,hint:true,armed:true},b=preview?{}:game.board||{},content=scanContent(state.status==='done'?{...state,status:'choose'}:state,s),zones=id==='pinta'?ptLayout(state,content,w,h):id==='masia'?maLayout(state,content,w,h):id==='encaix'?exLayout(state,content,w,h):tlLayout(id,content.length,w,h);
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
 // La cassola d’en Glups (0.24; 0.27): the plop of each ingredient, and at the end the tasting and the creature.
 if(id==='pot'){const picks=(state.picks||[]).map(p=>p?.value??p);if(game.time!==null&&game.time!==undefined&&pending){gpResult(c,w,h,state,game,s,{...view,chosen,picks:[...picks,pending.option?.value],final:!!pending.final},game.time);return true;}gpBoard(c,w,h,state,game,s,{...view,picks,preview});return true;}
 if(game.time!==null&&game.time!==undefined&&pending){tmResult(c,w,h,state,game,s,{...view,chosen,correct:!!pending.correct,picked:pending.option?.value},game.time);return true;}
 if(state.status==='done'){const last=state.picks[state.picks.length-1];tmResult(c,w,h,state,game,s,{...view,chosen:Math.max(0,content.findIndex(x=>x.id===last?.id)),correct:true,picked:last?.value},TM_PIECE);return true;}
 tmBoard(c,w,h,state,game,s,view);return true;}
export function renderScanActivity(c,w,h,id,game,s,preview=false){const def=scanDefinition(id);if(!def)return false;if(tlBoard(id))return Sboard(c,w,h,id,game,s,preview);let state=game.scanState;if(!state){state={id,stage:0,picks:[],round:0,status:'choose',pending:null,hint:true,armed:true};}
 if(preview){const previewPicks={dress:[{value:2},{value:2},{value:0}],vehicles:[{value:1},{value:0},{value:2}]};if(previewPicks[id])state={...state,picks:previewPicks[id],status:'done'};}
 const zoneH=h*.72,t=s.reduced?0:game.time??0,u=game.time!==null?Math.min(1,game.time/(game.duration||5.5)):.6;
 S_DECOR=escDecor({background:s.background,base:s.base,opacity:s.opacity,preview});
 if(S_DECOR.fade>0){const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,def.task==='guided'?'#f0f4ff':'#eef6ff');bg.addColorStop(1,def.task==='groups'?'#e1f8ee':'#e0f4ff');c.fillStyle=bg;c.fillRect(0,0,w,h);escVeil(c,S_DECOR,0,0,w,h);}else{c.fillStyle=S_DECOR.base;c.fillRect(0,0,w,h);}
 Cscene(c,w,zoneH,()=>{
  Screative(c,id,state,game,s,t,u);
 });return true;
}

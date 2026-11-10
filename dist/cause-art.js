import {KALEIDO_CONTRAST_COLORS,drawKaleido} from './kaleido.js';
import {drawVitrall} from './vitrall.js';
import {drawNatura} from './natura.js';
import {DB_SET,drawDibuixos} from './dibuixos.js';
import {JG_SET} from './joguines.js';
import {CN_SET} from './cuina.js';
import {drawPiro} from './piro.js';
import {drawDia} from './dia-art.js';
import {drawOrquestra} from './orquestra-art.js';
import {drawConstel} from './constel-art.js';
import {drawCastells,fmStamp} from './castells-art.js';
import {FEM_PRESSES} from './castells.js';
import {FEM_SHIRT_COLORS} from './input.js';
import {drawGlobus} from './globus-art.js';
import {drawMag} from './mag-art.js';
import {drawCambrer} from './cambrer-art.js';
import {drawFar} from './far-art.js';
import {drawToc} from './toc-art.js';
import {drawFira} from './fira-art.js';
import {farCount,farPeriod,farWindow} from './far.js';
import {diaPhase,diaStart,diaStops} from './dia.js';
import {ESC_WAIT,ESC_WAIT_START,escWaitClock} from './escenari.js';
import {FONS_N,FONS_STIM} from './fons.js';
import {drawFons,fonsPrewarm,fonsLoad} from './fons-gl.js';
import {vdOn,vdDraw,vdKey} from './video-dives.js';
import {SELVA_N,SELVA_STIM} from './selva.js';
import {drawSelva,selvaPrewarm,selvaLoad} from './selva-gl.js';
import {SABANA_N,SABANA_STIM} from './sabana.js';
import {drawSabana,sabanaPrewarm,sabanaLoad} from './sabana-gl.js';
import {POU_N,POU_STIM} from './pou.js';
import {drawPou,pouPrewarm,pouLoad} from './pou-gl.js';
import {GG_STILL,GG_STIM,ggSetSoft} from './gegants.js';
import {drawGegants,gegantsPrewarm,gegantsLoad} from './gegants-gl.js';
import {drawVent,vtStamp} from './vent-art.js';

import {Cocean} from './ocean.js';
import {causeClock,causeDefinition,causePalette,fonsTau} from './cause-catalog.js';

const C_PI=Math.PI,C_TAU=Math.PI*2;
const Cclamp=x=>Math.min(1,Math.max(0,x));
const Csmooth=x=>{x=Cclamp(x);return x*x*(3-2*x)};
const Crand=i=>{const x=Math.sin(i*127.1+31.13)*43197.234;return x-Math.floor(x)};
const Cmix=(hex,target,n)=>'#'+[0,2,4].map(i=>Math.round(parseInt(hex.slice(i+1,i+3),16)*(1-n)+parseInt(target.slice(i+1,i+3),16)*n).toString(16).padStart(2,'0')).join('');
function Cellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,C_TAU);c.fillStyle=color;c.fill();}
function Cround(c,x,y,w,h,r,fill,stroke=null){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
function Cgrad(c,x,y,w,h,color){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,Cmix(color,'#ffffff',.32));g.addColorStop(.45,color);g.addColorStop(1,Cmix(color,'#182951',.26));return g;}
function Cstroke(c,fn,color,width=2){c.beginPath();fn();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function Cstar(c,x,y,r,color,n=5,inner=.43){c.beginPath();for(let j=0;j<n*2;j++){const a=j*C_PI/n-C_PI/2,rr=j%2?r*inner:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fillStyle=color;c.fill();}
function Cshape(c,kind,size,color,t=0){const g=Cgrad(c,-size,-size,size*2,size*2,color);c.fillStyle=g;
 if(kind%6===0){Cstar(c,0,0,size,g,5+(kind%3));Cstroke(c,()=>{c.moveTo(0,-size*.75);c.lineTo(0,0);c.lineTo(size*.5,size*.25);},'#fff5df70',Math.max(1,size*.025));}
 else if(kind%6===1){Cellipse(c,0,0,size,size,g);Cellipse(c,-size*.28,-size*.28,size*.27,size*.17,'#ffffff55');}
 else if(kind%6===2){Cround(c,-size,-size,size*2,size*2,size*.2,g);c.fillStyle='#ffffff28';c.beginPath();c.moveTo(-size,-size);c.lineTo(size,-size);c.lineTo(-size,size);c.closePath();c.fill();}
 else if(kind%6===3){for(let j=0;j<5;j++){c.save();c.rotate(j*C_TAU/5+t*.15);c.fillStyle=j%2?Cmix(color,'#fff4d2',.2):g;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-size*.5,-size*.2,0,-size);c.quadraticCurveTo(size*.7,-size*.5,0,0);c.fill();c.restore();}Cellipse(c,0,0,size*.12,size*.12,'#f8e7b6');}
 else if(kind%6===4){c.beginPath();c.moveTo(0,-size);c.bezierCurveTo(size*1.4,-size*.05,size,size,0,size);c.bezierCurveTo(-size,size,-size*1.4,-size*.05,0,-size);c.fill();Cellipse(c,-size*.25,size*.12,size*.15,size*.35,'#fff8e74a');}
 else {Cstroke(c,()=>{for(let j=0;j<100;j++){const a=j/99*C_TAU*2.4,rr=size*j/99;if(j)c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);else c.moveTo(0,0);}},g,Math.max(2,size*.09));}
}
function Cdaynight(c,w,h,g,s,p,clock,card){const moments=s.dayMoments||8,preview=card||g.diaTarget===undefined&&clock.running,target=preview?12:g.diaTarget??diaStart(moments),from=g.diaFrom??target,t=clock.running?clock.t:1e3;
 Cwaiting(c,w,h,'daynight',g,s,preview,idle=>drawDia(c,w,h,{phi:clock.running&&!preview?diaPhase(from,target,t):target,target,t,prev:preview?undefined:g.diaPrev,held:g.diaHeld,stops:diaStops(moments),idle,reduced:s.reduced,adaptive:!preview,preview:!!card,background:s.background,base:s.base,opacity:s.opacity}));}
// The stage stories (0.14 and 0.15) draw the whole screen, at rest too: the stage waits with its chairs, the sky with its landscape, the
// square with its pinya. stamp: what else the still waiting picture depends on (Fem castells: the mosaics made so far).
const Cstage=(id,draw,stamp)=>(c,w,h,g,s,p,clock,preview)=>Cwaiting(c,w,h,id,g,s,preview,idle=>draw(c,w,h,{variant:g.variant??g.nextVariant??0,count:g.count||0,steps:id==='castells'?FEM_PRESSES:s.steps,t:clock.running?clock.t:1e3,duration:g.duration,held:preview?undefined:g.stageHeld,from:preview?undefined:g.stageFrom,idle,reduced:s.reduced,preview,plain:!!s.plainScene,background:s.background,base:s.base,opacity:s.opacity,shirt:id==='castells'?FEM_SHIRT_COLORS[s.femShirt]:undefined}),stamp);
// El vent del bosc (CE26): the painted place, at rest too. Once the place has had fifteen seconds of wind, the next one is painted in
// the background, so that the change of place can sweep it in at once. The card shows the strong wind.
function Cwind(c,w,h,g,s,p,clock,preview){const t=clock.running&&!preview?g.time:1e3,blown=g.time===null?0:Math.min(g.time,g.releaseTime??g.time);
 Cwaiting(c,w,h,'wind',g,s,preview,idle=>drawVent(c,w,h,{variant:preview?0:g.variant??g.nextVariant??0,press:g.ventPress||0,t,release:g.releaseTime??null,offset:g.ventOffset||0,change:!!g.ventChange,from:g.ventFrom,next:!preview&&(g.ventTotal||0)+blown>=15?g.nextVariant:undefined,idle,reduced:s.reduced,preview,background:s.background,base:s.base,opacity:s.opacity}),vtStamp);}
// Waiting for the next press (0.14.1, setting waitCue, on by default). In the step-by-step stories, when a step has ended the scene
// slows down to a stop and darkens until the next press (escWaitClock in escenari.js), so that it is clear when to press again.
// Without the setting, the ambient clock is real time and the scene goes on moving at rest, as in 0.14. Once the waiting picture is
// still, it is kept and copied instead of being drawn again, until something changes (a press, the size of the screen, a setting).
const C_WAIT_SHEET={key:'',sheet:null};
function Cwaiting(c,w,h,id,g,s,preview,draw,stamp,ownDark=false){const now=typeof performance!=='undefined'?performance.now()/1000:0,k=preview||s.waitCue===false?null:escWaitClock(g.wait||ESC_WAIT_START,now);
 const cv=c.canvas,key=k?.still&&cv&&typeof document!=='undefined'?[id,cv.width,cv.height,w,h,g.wait?.at??'start',g.count,g.variant,g.nextVariant,g.diaTarget,s.steps,s.dayMoments,s.reduced,s.background,s.base,s.opacity,s.plainScene,id==='castells'?s.femShirt:'',stamp?stamp():''].join('|'):'';
 if(key&&C_WAIT_SHEET.key===key){c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.drawImage(C_WAIT_SHEET.sheet,0,0);c.restore();return;}
 draw(s.reduced?0:preview?4:k?k.idle:now,k);
 if(k&&k.dark>.002&&!ownDark){c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle=`rgba(3,5,14,${k.dark.toFixed(3)})`;c.fillRect(0,0,w,h);c.restore();}
 if(key){const old=C_WAIT_SHEET.sheet,sheet=old&&old.width===cv.width&&old.height===cv.height?old:Object.assign(document.createElement('canvas'),{width:cv.width,height:cv.height}),x=sheet.getContext('2d');
  x.clearRect(0,0,sheet.width,sheet.height);x.drawImage(cv,0,0);C_WAIT_SHEET.key=key;C_WAIT_SHEET.sheet=sheet;}}
// 0.49 · The dives played as videos (video-dives.js): the frame of the scene's video, darkened while it waits for the next press, as the
// live drawing was (down to 15 % of the light).
function Cvideo(c,w,h,id,g,s){Cwaiting(c,w,h,id,g,s,false,(idle,k)=>{vdDraw(c,w,h,!!s.reduced,k?k.dark/ESC_WAIT.dark*.85:0);},()=>'vd:'+vdKey(),true);}
// Fons marí de vidre (CE06, 0.28): the dive, drawn with WebGL2 (fons-gl.js), at rest too: the surface before the first press, each
// scene stopped and dark after its stimulus, the surface again after the climb that follows the twentieth. The darkening is done by
// the renderer itself (down to 15 % of the light, more than the stories), with «Avís d'espera»; «Reducció de moviment» shows each
// scene still, without travellings. Where WebGL2 cannot be used, the older picture of each animal (ocean.js) while it runs. The card:
// the moon jellies.
function Cfons(c,w,h,g,s,p,clock,preview){
 if(preview){if(!drawFons(c,w,h,{variant:1,t:FONS_STIM*.5,tau:FONS_STIM*.5-.3,prevTau:null,stim:FONS_STIM,sea:30,dark:0,background:s.background,opacity:s.opacity,base:s.base,scale:1}))Cocean(c,w,h,g,s,p,clock);return;}
 if(vdOn('jelly')){Cvideo(c,w,h,'jelly',g,s);return;}
 const v=g.variant??-1,running=g.time!==null&&v>=0;
 Cwaiting(c,w,h,'jelly',g,s,false,(idle,k)=>{const tau=v<0?0:s.reduced?FONS_STIM*.5:Math.max(0,fonsTau(g,s));
  const ok=drawFons(c,w,h,{variant:v,t:running&&!s.reduced?g.time:null,tau,prevTau:g.fonsPrevTau!=null?g.fonsPrevTau+tau:null,from:g.fonsFrom,stim:g.fonsStim||FONS_STIM,sea:s.reduced?0:idle,
   dark:k?k.dark/ESC_WAIT.dark*.85:0,background:s.background,opacity:s.opacity,base:s.base,done:v===FONS_N-1&&!running});
  if(!ok)Cocean(c,w,h,g,s,p,clock);},()=>[g.fonsIdle0,g.time===null?'rest':'run'].join(':'),true);}
// Selva de llum (CE35, 0.29): the jungle dive, drawn like the sea (selva-gl.js): the sky over the canopy before the first press, each
// scene stopped and dark after its stimulus, the sky again after the climb that follows the twentieth. Where WebGL2 cannot be used, the
// light of each scene, still (CselvaPlain). The card: the toucans.
// Without WebGL2, while a scene runs: the light of each scene (its sky, leaves, floor or water; not with «Sense decorat») and a few
// soft spots of light, still.
const C_SELVA_LIGHT=Object.freeze([['#f3c89a','#5f8f9c'],['#e8b98c','#3f6f6a'],['#d9c08e','#2f5f45'],['#9fbf6a','#1f4a2c'],['#8fb060','#1a3f26'],['#a8c870','#16402a'],['#7fa85a','#123a22'],['#6f9c58','#0f3220'],['#4f7f5a','#0c2a1e'],['#3f7058','#0a261c'],['#36604a','#082218'],['#2f5640','#071d14'],['#2a2350','#0b0a1c'],['#241f48','#090818'],['#1c2450','#0a0c1c'],['#1a2448','#0a1018'],['#2a2414','#100c06'],['#221c10','#0c0905'],['#2a2214','#100c06'],['#262012','#0e0a05']]);
function CselvaPlain(c,w,h,s,v=-1){const [a,b]=C_SELVA_LIGHT[Math.max(0,v)%20],g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);
 c.save();c.globalAlpha=s.background==='dim'?.5:1;if(s.background!=='none'){c.fillStyle=g;c.fillRect(0,0,w,h);}
 for(let i=0;i<6;i++){const r=x=>{const t=Math.sin((v+1)*91.7+i*13.1+x)*43758.5;return t-Math.floor(t);},x=r(1)*w,y=r(2)*h*.8,R=(.03+.05*r(3))*Math.min(w,h);c.fillStyle=v>11&&v<16?'rgba(190,255,120,.18)':'rgba(255,240,200,.14)';c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.fill();}
 c.restore();}
function Cselva(c,w,h,g,s,p,clock,preview){
 if(preview){if(!drawSelva(c,w,h,{variant:2,t:SELVA_STIM*.5,tau:SELVA_STIM*.5-.3,prevTau:null,stim:SELVA_STIM,sea:30,dark:0,background:s.background,opacity:s.opacity,base:s.base,scale:1}))CselvaPlain(c,w,h,s,2);return;}
 if(vdOn('jungle')){Cvideo(c,w,h,'jungle',g,s);return;}
 const v=g.variant??-1,running=g.time!==null&&v>=0;
 Cwaiting(c,w,h,'jungle',g,s,false,(idle,k)=>{const tau=v<0?0:s.reduced?SELVA_STIM*.5:Math.max(0,fonsTau(g,s));
  const ok=drawSelva(c,w,h,{variant:v,t:running&&!s.reduced?g.time:null,tau,prevTau:g.fonsPrevTau!=null?g.fonsPrevTau+tau:null,from:g.fonsFrom,stim:g.fonsStim||SELVA_STIM,sea:s.reduced?0:idle,
   dark:k?k.dark/ESC_WAIT.dark*.85:0,background:s.background,opacity:s.opacity,base:s.base,done:v===SELVA_N-1&&!running});
  if(!ok&&running)CselvaPlain(c,w,h,s,v);},()=>[g.fonsIdle0,g.time===null?'rest':'run'].join(':'),true);}
// Sabana de paper (CE36, 0.30): the day on the savanna, drawn like the other dives (sabana-gl.js): the sky over the sea of clouds at the
// end of the night before the first press, each scene stopped and dark after its stimulus, the sky again after the climb that follows
// the twentieth. Where WebGL2 cannot be used, the light of the hour of each scene, still (CsabanaPlain). The card: the giraffes.
const C_SABANA_LIGHT=Object.freeze([['#f2c6b0','#6b5a8a'],['#f4d2b4','#8a8f9a'],['#f6dcb8','#9aa070'],['#cfe3ee','#c9a860'],['#cde4f0','#b89a58'],['#d2e6f0','#c8a85a'],['#d6e8f0','#c9aa5c'],['#d8e6ec','#b8984f'],['#d4e2ea','#8c8a5a'],['#cfe0e6','#5a7a6a'],['#d0e2ea','#6f8a60'],['#dce4e0','#a88f58'],['#e0c49a','#7a4a2c'],['#e8dcc0','#b07a48'],['#eadcb8','#8a9a50'],['#f0d2a0','#b8904a'],['#f0b080','#8a5a3a'],['#c890a0','#4a3a5a'],['#2a2e6a','#3a3448'],['#20265a','#2e2a40']]);
function CsabanaPlain(c,w,h,s,v=-1){const [a,b]=C_SABANA_LIGHT[Math.max(0,v)%20],g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(.62,a);g.addColorStop(.64,b);g.addColorStop(1,b);
 c.save();c.globalAlpha=s.background==='dim'?.5:1;if(s.background!=='none'){c.fillStyle=g;c.fillRect(0,0,w,h);}
 for(let i=0;i<6;i++){const r=x=>{const t=Math.sin((v+1)*77.3+i*17.9+x)*43758.5;return t-Math.floor(t);},x=r(1)*w,y=r(2)*h*.55,R=(v>17?.006:.03+.04*r(3))*Math.min(w,h);c.fillStyle=v>17?'rgba(255,250,230,.5)':'rgba(255,248,225,.16)';c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.fill();}
 c.restore();}
function Csabana(c,w,h,g,s,p,clock,preview){
 if(preview){if(!drawSabana(c,w,h,{variant:3,t:SABANA_STIM*.5,tau:SABANA_STIM*.5-.3,prevTau:null,stim:SABANA_STIM,sea:30,dark:0,background:s.background,opacity:s.opacity,base:s.base,scale:1}))CsabanaPlain(c,w,h,s,3);return;}
 if(vdOn('savanna')){Cvideo(c,w,h,'savanna',g,s);return;}
 const v=g.variant??-1,running=g.time!==null&&v>=0;
 Cwaiting(c,w,h,'savanna',g,s,false,(idle,k)=>{const tau=v<0?0:s.reduced?SABANA_STIM*.5:Math.max(0,fonsTau(g,s));
  const ok=drawSabana(c,w,h,{variant:v,t:running&&!s.reduced?g.time:null,tau,prevTau:g.fonsPrevTau!=null?g.fonsPrevTau+tau:null,from:g.fonsFrom,stim:g.fonsStim||SABANA_STIM,sea:s.reduced?0:idle,
   dark:k?k.dark/ESC_WAIT.dark*.85:0,background:s.background,opacity:s.opacity,base:s.base,done:v===SABANA_N-1&&!running});
  if(!ok&&running)CsabanaPlain(c,w,h,s,v);},()=>[g.fonsIdle0,g.time===null?'rest':'run'].join(':'),true);}
// El pou del temps (CE37, 0.31): the descent through the rock, drawn like the other dives (pou-gl.js): the garden of today before the
// first press, each scene stopped and dark after its stimulus, the garden again after the climb that follows the twentieth. Where WebGL2
// cannot be used, the light of each scene over the colour of its ground and a few soft spots of light, still (CpouPlain). The card: the triceratops.
const C_POU_LIGHT=Object.freeze([['#dfe8ee','#e8eef0'],['#efd9a8','#c8a060'],['#d8e2ea','#e6ecee'],['#e6dcb4','#b89a60'],['#cfd8c8','#5a6a4a'],['#e8d6b0','#8a7a50'],['#e6d0a0','#9a7a48'],['#e4e0d0','#7aa8a0'],['#f0d8a8','#d8a060'],['#f0c8a0','#c88a58'],
 ['#cfdcd8','#4a6a50'],['#d0e2ea','#4a7a8a'],['#f0dcb0','#7a8a6a'],['#c8d4d8','#4a5a50'],['#d8e4dc','#5a7a5a'],['#e8eadc','#c8c4a8'],['#e8dcc0','#8a7a58'],['#dce8ec','#7a8a5a'],['#b8d4e0','#1e4a60'],['#ecd2a8','#a8704a']]);
function CpouPlain(c,w,h,s,v=-1){const [a,b]=C_POU_LIGHT[Math.max(0,v)%20],g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(.58,a);g.addColorStop(.62,b);g.addColorStop(1,b);
 c.save();c.globalAlpha=s.background==='dim'?.5:1;if(s.background!=='none'){c.fillStyle=g;c.fillRect(0,0,w,h);}
 for(let i=0;i<5;i++){const r=x=>{const t=Math.sin((v+1)*63.1+i*21.7+x)*43758.5;return t-Math.floor(t);},x=r(1)*w,y=r(2)*h*.6,R=(.025+.035*r(3))*Math.min(w,h);c.fillStyle='rgba(255,246,225,.15)';c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.fill();}
 c.restore();}
function Cpou(c,w,h,g,s,p,clock,preview){
 if(preview){if(!drawPou(c,w,h,{variant:5,t:POU_STIM*.5,tau:POU_STIM*.5,prevTau:null,stim:POU_STIM,sea:30,dark:0,background:s.background,opacity:s.opacity,base:s.base,scale:1}))CpouPlain(c,w,h,s,5);return;}
 if(vdOn('well')){Cvideo(c,w,h,'well',g,s);return;}
 const v=g.variant??-1,running=g.time!==null&&v>=0;
 Cwaiting(c,w,h,'well',g,s,false,(idle,k)=>{const tau=v<0?0:s.reduced?POU_STIM*.5:Math.max(0,fonsTau(g,s));
  const ok=drawPou(c,w,h,{variant:v,t:running&&!s.reduced?g.time:null,tau,prevTau:g.fonsPrevTau!=null?g.fonsPrevTau+tau:null,from:g.fonsFrom,stim:g.fonsStim||POU_STIM,sea:s.reduced?0:idle,
   dark:k?k.dark/ESC_WAIT.dark*.85:0,background:s.background,opacity:s.opacity,base:s.base,done:v===POU_N-1&&!running});
  if(!ok&&running)CpouPlain(c,w,h,s,v);},()=>[g.fonsIdle0,g.time===null?'rest':'run'].join(':'),true);}
// Gegants del blau (CE38, 0.36): the journey across the oceans, drawn like the other dives (gegants-gl.js): the sea at sunset before the
// first press, each scene stopped and dark after its stimulus (the animal has swum out), the sea at sunset again after the climb that
// follows the twentieth. «Reducció de moviment» shows each scene still, in the middle of its gesture; «Moviment de càmera: suau» keeps
// the camera nearer its mean framing. Where WebGL2 cannot be used, the light of each scene, still (CgegantsPlain). The card: the humpback.
const C_GG_LIGHT=Object.freeze([['#b8d0dc','#1c4a58'],['#a8c4b8','#2a4a40'],['#c8dce4','#1c4458'],['#8fb0b8','#183a48'],['#9fc4d4','#163e58'],['#9cc8e0','#124a78'],['#3a5a78','#081828'],['#8cc0e0','#10406a'],['#a8d4ec','#1a5a8a'],['#a8d0f0','#1c6aa0'],
 ['#b0dcf4','#1a78a8'],['#5a9ab8','#0c3a58'],['#284a68','#060e1c'],['#b8e0f4','#1a80b0'],['#a8e0e8','#1a7890'],['#a0e0e8','#1a8090'],['#c8e4d0','#3a8070'],['#a8c8d8','#1a4a68'],['#c8dce8','#1a3a58'],['#7aa8c8','#0c2a4a']]);
function CgegantsPlain(c,w,h,s,v=-1){const [a,b]=v<0?['#e8a070','#1a3048']:C_GG_LIGHT[v%20],g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,a);g.addColorStop(1,b);
 c.save();c.globalAlpha=s.background==='dim'?.5:1;if(s.background!=='none'){c.fillStyle=g;c.fillRect(0,0,w,h);}
 for(let i=0;i<5;i++){const r=x=>{const t=Math.sin((v+1)*57.3+i*29.1+x)*43758.5;return t-Math.floor(t);},x=r(1)*w,y=r(2)*h*.5,R=(.03+.04*r(3))*Math.min(w,h);c.fillStyle='rgba(235,250,255,.13)';c.beginPath();c.arc(x,y,R,0,Math.PI*2);c.fill();}
 c.restore();}
function Cgegants(c,w,h,g,s,p,clock,preview){ggSetSoft(s.ggCamera==='soft');
 if(preview){if(!drawGegants(c,w,h,{variant:10,t:7.6,tau:7.6,prevTau:null,stim:GG_STIM,sea:30,dark:0,background:s.background,opacity:s.opacity,base:s.base,scale:1}))CgegantsPlain(c,w,h,s,10);return;}
 if(vdOn('giants')){Cvideo(c,w,h,'giants',g,s);return;}
 const v=g.variant??-1,running=g.time!==null&&v>=0;
 Cwaiting(c,w,h,'giants',g,s,false,(idle,k)=>{const tau=v<0?0:s.reduced?GG_STILL[v]:Math.max(0,fonsTau(g,s));
  const ok=drawGegants(c,w,h,{variant:v,t:running&&!s.reduced?g.time:null,tau,prevTau:g.fonsPrevTau!=null?g.fonsPrevTau+tau:null,from:g.fonsFrom,stim:g.fonsStim||GG_STIM,sea:s.reduced?0:idle,
   dark:k?k.dark/ESC_WAIT.dark*.85:0,background:s.background,opacity:s.opacity,base:s.base,done:v===19&&!running});
  if(!ok&&running)CgegantsPlain(c,w,h,s,v);},()=>[g.fonsIdle0,g.time===null?'rest':'run',s.ggCamera].join(':'),true);}
function Cscene(c,w,h,draw){const scale=Math.min(w/1000,h/700);c.save();c.translate((w-1000*scale)/2,(h-700*scale)/2);c.scale(scale,scale);draw();c.restore();}
function CshapeAt(c,x,y,size,color,kind=0){c.save();c.translate(x,y);Cshape(c,kind,size,color,0);c.restore();}
function Cwheel(c,x,y,r,angle,color){Cellipse(c,x,y,r,r,'#3a4b56');Cellipse(c,x,y,r*.77,r*.77,Cgrad(c,x-r,y-r,r*2,r*2,color));for(let j=0;j<8;j++){const a=j*C_TAU/8+angle;Cstroke(c,()=>{c.moveTo(x,y);c.lineTo(x+Math.cos(a)*r*.68,y+Math.sin(a)*r*.68);},'#e5d9bb',2);}Cellipse(c,x,y,r*.16,r*.16,'#e9d7aa');}

// Caleidoscopi, Vitralls, Natura and Piromusical manage their own appear, settle and dissolve phases; a new round reseeds the details.
function Ckaleido(c,w,h,g,s,p,clock){if(clock.running)drawKaleido(c,w,h,{index:g.variant||0,t:clock.t,duration:g.duration,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,seed:g.completed||0,contrast:s.kaleidoContrast?KALEIDO_CONTRAST_COLORS[s.kaleidoColor]||KALEIDO_CONTRAST_COLORS.yellow:null});}
function Cvitrall(c,w,h,g,s,p,clock){if(clock.running)drawVitrall(c,w,h,{index:g.variant||0,t:clock.t,duration:g.duration,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,seed:g.completed||0});}
function Cnatura(c,w,h,g,s,p,clock){if(clock.running)drawNatura(c,w,h,{index:g.variant||0,t:clock.t,duration:g.duration,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,seed:g.completed||0});}
function Cpiro(c,w,h,g,s,p,clock,preview){if(clock.running)drawPiro(c,w,h,{index:g.variant||0,t:clock.t,duration:g.duration,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,seed:g.completed||0,preview:!!preview});}
// Dibuixos que ballen, Joguines que ballen and La cuina que balla: the drawing of the press from its collection, with the line colour,
// the speed (kept from the press) and «Sense desplaçament».
const Cdibuixos=set=>(c,w,h,g,s,p,clock,preview)=>{if(clock.running)drawDibuixos(c,w,h,{index:g.variant||0,t:clock.t,duration:g.duration,speed:preview?'normal':g.dbSpeed,still:!!s.dbStill,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,color:s.dbColor,preview:!!preview,set});};
// El far draws the sea and its light at every moment, also between presses (no waiting veil: the light must be seen moving).
function Cfar(c,w,h,g,s,p,clock,preview){drawFar(c,w,h,{game:g,t:clock.running?clock.t:null,duration:g.duration,period:farPeriod(s),window:farWindow(s),boats:farCount(s),reduced:s.reduced,preview:!!preview,background:s.background,base:s.base,opacity:s.opacity});}
function Cfira(c,w,h,g,s,p,clock,preview){drawFira(c,w,h,{game:g,settings:s,reduced:s.reduced,preview:!!preview,background:s.background,base:s.base,opacity:s.opacity});}
function Ctoc(c,w,h,g,s,p,clock,preview){drawToc(c,w,h,{game:g,t:clock.running?clock.t:null,duration:g.duration,reduced:s.reduced,preview:!!preview,background:s.background,base:s.base,opacity:s.opacity});}
function renderExtraCause(c,w,h,id,game,s,preview=false){const item=causeDefinition(id);if(!item)return false;
 const g=preview?{...game,item,variant:game.variant||0,count:item.kind==='sequence'?Math.min(4,s.steps):1,day:true,time:item.preview?.time??3,duration:item.preview?.duration??6,audioDuration:item.preview?.duration??6,control:'effect',releaseTime:null}:game;
 const clock=causeClock(g,s),p=causePalette(id,g.variant||0).map(color=>s.base==='white'&&item.kind==='burst'?Cmix(color,'#2c4256',.2):color);if(!clock.running&&!g.count&&item.kind!=='cycle'&&!item.stage&&!item.wind&&!item.beam&&!item.knock&&!item.ready&&!item.dive)return true;
 c.save();if(item.kind==='burst'&&!item.ownPhases)c.globalAlpha*=clock.envelope;if(item.kind==='sequence'&&!item.stage&&g.count>=s.steps&&clock.running)c.globalAlpha*=1-Csmooth((clock.u-.87)/.13);
 const drawers={jelly:Cfons,jungle:Cselva,savanna:Csabana,well:Cpou,giants:Cgegants,daynight:Cdaynight,constellations:Cstage('constellations',drawConstel),orchestra:Cstage('orchestra',drawOrquestra),castells:Cstage('castells',drawCastells,fmStamp),balloons:Cstage('balloons',drawGlobus),magician:Cstage('magician',drawMag),waiter:Cstage('waiter',drawCambrer),lighthouse:Cfar,door:Ctoc,fira:Cfira,wind:Cwind,kaleido:Ckaleido,drawings:Cdibuixos(DB_SET),toys:Cdibuixos(JG_SET),kitchen:Cdibuixos(CN_SET),vitrall:Cvitrall,natura:Cnatura,piro:Cpiro};drawers[id](c,w,h,g,s,p,clock,preview);c.restore();return true;
}

export {Cellipse,Cgrad,Cmix,Cround,Cscene,Cshape,CshapeAt,Cstar,Cstroke,Cwheel,renderExtraCause};
// The five dives prepare their first shaders in the background, one every 400 ms, while the menu is open (0.35).
// The loading cover (0.40): the share of the programs a dive needs at its start that is ready (1 for any other activity).
const DIVE_LOAD={jelly:fonsLoad,jungle:selvaLoad,savanna:sabanaLoad,well:pouLoad,giants:gegantsLoad};
export function diveLoad(id){const f=DIVE_LOAD[id];if(!f)return 1;try{return f();}catch{return 1;}}
export function prewarmDives(){const list=[fonsPrewarm,selvaPrewarm,sabanaPrewarm,pouPrewarm,gegantsPrewarm];list.forEach((f,i)=>setTimeout(()=>{try{f();}catch{}},400*i));}

// Estiu a la masia (EN26), 0.39: the six episodes. Each is a pure function of its time t (0..14 s, the dinner 0..20 s) that paints a
// whole frame: the set (the panorama through the episode's camera, or the kitchen, cached as a sheet at the frozen hour of the pick)
// and the life on it (the character, the props, the gag, the weather), in world coordinates under the camera. Animation principles
// of the hand-drawn film: anticipation before an action, overshoot and settle after it, follow-through on hair, cloth, tails and
// bells (springs), secondary action on the animals around, holds on the funny poses. Names start with me.
import {MS_SHEET,mpHour,mpRgb,mpMix,mpLight,mpDark,mpLit,mpShade,mpCol,mpClamp,mpRng,mpSmooth,mpPath,mpRect,mpEllipsePts,mpTone,mpSoft,mpGroundShadow,mpCastShadow,mpSheet,mpCam,mpCamBoard,MP_TAU} from './masia-pinzell.js';
import {MN_PAL,mnHaystack,mnPlanks,mnCarrotTops,mnGrass} from './masia-natura.js';
import {MD,MD_CUINA,mdPanorama,mdCuina,mdSwing,mdFig} from './masia-decorats.js';
import {MC_CHARS,MC_LINE,mcDrawHuman,mcSolve,mcDrawGoat,mcDrawCat,mcDrawHen,mcDrawSwallow,mcCap,mcShape,mcStroke,mcDot,mcEllipse,mcLimb} from './masia-personatges.js';
import {MS_EP,MS_SOPAR,msIdle,msClamp,msEase,msEaseOut,msEaseIn,msBack,msBounce,msTrack,msSpring,msBlink,msBreath} from './masia.js';
import {mfSmoke,mfSwallows,mfWater,mfRings,mfSplash,mfDust,mfStars,mfSnore,mfFigs,mfRain,mfRainbow,mfFireflies,mfGlow,mfSpeed,mfSweat,mfLeaves,mfWind} from './masia-efectes.js';
const ME_W=MS_SHEET[0],ME_H=MS_SHEET[1],ME_TAU=MP_TAU,ME_PI=Math.PI;const meSin=Math.sin,meCos=Math.cos;
// The camera of each episode: world point at the centre of the screen and the zoom over the board's cover-fit. The grandmother's
// pushes in on her window and cross-fades into the kitchen.
export const ME_CAM=Object.freeze({avia:{x:905,y:470,z:2.4},avi:{x:260,y:580,z:2.7},nina:{x:960,y:600,z:2.1},pol:{x:450,y:500,z:1.5},cabra:{x:540,y:450,z:2.3},sopar:{x:740,y:510,z:1.4}});
// ── Sets ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const meHourOf=ctx=>Math.min(1,(ctx.picks?.length||0)/5+.1);
const meDecorKey=d=>`${d?.mode||'full'}|${d?.base||'#000'}`;
// A set sheet at the screen size: the base colour, the paint (which sets its own camera), the dim veil of the decor setting.
function meSetSheet(c,w,h,ctx,key,paint){const decor=ctx.decor||{mode:'full',base:'#000'};
 return mpSheet(c,`me|${key}|${meDecorKey(decor)}`,(x,SW,SH)=>{x.setTransform(1,0,0,1,0,0);x.fillStyle=decor.base||'#000';x.fillRect(0,0,SW,SH);if(decor.mode==='none')return;paint(x);x.setTransform(1,0,0,1,0,0);if(decor.mode==='dim'){x.fillStyle=decor.base||'#000';x.globalAlpha=.5;x.fillRect(0,0,SW,SH);x.globalAlpha=1;}},{w,h});}
// The panorama through a camera at the frozen hour of the pick, drawn as the background of the frame. Returns the light.
export function meSet(id,c,w,h,ctx,cam,o={}){const hour=o.hour??meHourOf(ctx);const L=mpHour(hour);const n=ctx.picks?.length||0;const base=o.base||cam;
 const sheet=meSetSheet(c,w,h,ctx,`${id}|${n}|${o.key||''}`,x=>{x.setTransform(base.k,0,0,base.k,base.ox,base.oy);if(o.paint)o.paint(x,L);else mdPanorama(x,L,{fore:false,vignette:false,wave:.35,lights:o.lights,fig:o.fig!==false});});
 c.save();c.setTransform(1,0,0,1,0,0);if(!sheet){c.fillStyle=ctx.decor?.base||'#000';c.fillRect(0,0,w,h);}else if(base===cam)c.drawImage(sheet,0,0);else{const k=cam.k/base.k;c.setTransform(k,0,0,k,cam.ox-base.ox*k,cam.oy-base.oy*k);c.drawImage(sheet,0,0);}c.restore();return L;}
// A transparent sheet of one thing painted through the camera (the fig tree that shakes), drawn later with its own transform.
function meThingSheet(c,w,h,ctx,key,cam,paint){return mpSheet(c,`me-thing|${key}|${meDecorKey(ctx.decor)}`,(x,SW,SH)=>{x.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);paint(x);},{w,h});}
const meLive=(c,cam,fn)=>{c.save();c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);fn();c.restore();};
const meBare=ctx=>ctx.decor?.mode==='none';
// ── Animation helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A track of pose keys [[t,{fields},ease?],...]: numbers and arrays blend between keys, strings hold until the next key.
export function meTrack(keys,t){const n=keys.length;if(t<=keys[0][0])return {...keys[0][1]};if(t>=keys[n-1][0])return {...keys[n-1][1]};let i=0;while(i<n-2&&keys[i+1][0]<=t)i++;const [t0,A,e]=keys[i],[t1,B]=keys[i+1];const u=(e||msEase)((t-t0)/Math.max(1e-6,t1-t0));const out={...A};
 for(const k in B){const a=A[k],b=B[k];if(typeof b==='number'&&typeof a==='number')out[k]=a+(b-a)*u;else if(Array.isArray(b)&&Array.isArray(a))out[k]=a.map((v,j)=>v+(b[j]-v)*u);else if(!(k in A))out[k]=b;}return out;}
// The walk cycle at phase ph (one stride = 2π): the legs swing, the knee bends while the leg swings forward, the body bobs twice a
// stride, the arms swing against the legs. amp .5 is a walk, 1 a run (with a flight moment).
export function meWalk(ph,amp=.5){const s=meSin(ph);const kneeOf=p=>Math.max(0,meCos(p+.5))*amp*1.3;return {hipL:amp*s,kneeL:kneeOf(ph),hipR:-amp*s,kneeR:kneeOf(ph+ME_PI),shL:.15-amp*.6*s,shR:-.15+amp*.6*s,elL:.3+amp*.3,elR:.3+amp*.3,bob:-amp*4*(.5+.5*meCos(2*ph))};}
export function meRun(ph){return {...meWalk(ph,1),lean:.28,lift:Math.max(0,meSin(2*ph+1))*6,elL:1.1,elR:1.1};}
// A character drawn in the world with its rig (MC_CHARS) and a pose; costume/expression overrides allowed.
function meHuman(c,id,pose,expr,o={}){const ch=MC_CHARS[id];return mcDrawHuman(c,ch.rig,pose,o.costume||ch.costume,{...ch.expr,...expr},{lw:o.lw??1.3,L:o.L||null,shadow:o.shadow!==false,hairSpring:o.hairSpring||[0,0],clothSpring:o.clothSpring||[0,0]});}
const meHandAngle=(J,near=true)=>near?Math.atan2(J.hdL[1]-J.elL[1],J.hdL[0]-J.elL[0]):Math.atan2(J.hdR[1]-J.elR[1],J.hdR[0]-J.elR[0]);
// A parabola from (x0,y0) at t0 landing at (x1,y1) at t1 (gravity g): the position at t, and the flight angle.
function meArc(x0,y0,x1,y1,t0,t1,t,g=900){const T=Math.max(1e-6,t1-t0),u=msClamp((t-t0)/T);const vy=((y1-y0)-.5*g*T*T)/T;const tt=u*T;return [x0+(x1-x0)*u,y0+vy*tt+.5*g*tt*tt,Math.atan2(vy+g*tt,(x1-x0)/T)];}
// ── Props ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const ME_TRUITA=[242,196,84],ME_TRUITA_RIM=[210,146,56];
// The omelette: a thick golden disc; rot is the flip angle (its apparent thickness follows), k the squash when it lands.
function meTruita(c,x,y,rot=0,o={}){const {rx=30,ry=9,lw=1.4,alpha=1}=o;const k=Math.abs(meCos(rot));c.save();c.globalAlpha=alpha;c.translate(x,y);
 const ryy=4+(ry-4)*k;mcEllipse(c,0,2,rx,ryy,0,ME_TRUITA_RIM,{lw,noLine:true});mcEllipse(c,0,0,rx,ryy,0,ME_TRUITA,{lw,shadeK:.08});
 c.fillStyle=mpRgb(ME_TRUITA_RIM,.55);for(const [dx,dy,r] of [[-12,-2,3.2],[6,-4,2.6],[14,2,2.2],[-3,3,2]])c.beginPath(),c.ellipse(dx*rx/30,dy*ryy/9,r,r*ryy/9,0,0,ME_TAU),c.fill();
 c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(-rx*.3,-ryy*.35,rx*.3,ryy*.3,0,0,ME_TAU);c.fill();c.restore();}
// The frying pan in a hand: the handle along the forearm, the black disc at its end; with the omelette (jiggle j) or empty.
function mePan(c,hx,hy,ang,o={}){const {omelette=true,j=0,lw=1.4,tilt=0}=o;c.save();c.translate(hx,hy);c.rotate(ang);const len=36;c.strokeStyle=mpRgb([70,60,56]);c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(-4,0);c.lineTo(len,0);c.stroke();c.strokeStyle=mpRgb([120,110,100]);c.lineWidth=2;c.beginPath();c.moveTo(0,-1.5);c.lineTo(len-6,-1.5);c.stroke();
 c.translate(len+34,0);c.rotate(-ang+tilt);mcEllipse(c,0,3,38,12,0,[40,38,42],{lw,noLine:true});mcEllipse(c,0,0,38,11,0,[64,62,68],{lw,shadeK:.1});c.fillStyle='rgba(255,255,255,.14)';c.beginPath();c.ellipse(-8,-3,20,4,0,0,ME_TAU);c.fill();
 if(omelette)meTruita(c,j*1.5,-3-Math.abs(j)*2,0,{rx:28,ry:8,lw});c.restore();}
// A white plate (seen from the angle a: 0 flat, 1 facing the viewer).
function mePlat(c,x,y,a=0,o={}){const {r=27,lw=1.3,tilt=0}=o;c.save();c.translate(x,y);c.rotate(tilt);const ry=r*(.26+.74*a);mcEllipse(c,0,1.5,r,ry,0,[200,205,215],{lw,noLine:true});mcEllipse(c,0,0,r,ry,0,[250,250,252],{lw,shadeK:.05});mcEllipse(c,0,0,r*.72,ry*.72,0,[244,246,250],{lw:lw*.6,line:[200,205,215],shadeK:0});c.restore();}
// The straw hat of the grandfather, drawn apart (so it can jump, tilt and carry a fish): at the head top of J with an offset.
function meBarret(c,J,R,dx,dy,rot,o={}){const {lw=1.4,squash=0}=o;const by=J.head[1]-R*.78;c.save();c.translate(J.head[0]+dx,by+dy);c.rotate(rot);c.scale(1+squash*.2,1-squash*.4);
 mcEllipse(c,0,R*.12,R*1.85,R*.36,0,[226,196,110],{lw});mcShape(c,mpSmooth([[-R*.95,R*.08],[-R*.8,-R*.55],[R*.8,-R*.55],[R*.95,R*.08]],2,true),[232,204,120],{lw});mcStroke(c,[[-R*.88,-R*.02],[R*.88,-R*.02]],[150,60,50],lw*2.2);c.restore();}
// The red cap of Pol apart from his head (it flies, it lands backwards): big is his cap size.
// Pol's cap on its own (slipping, flying, on the haystack, on backwards): the cap of the costume (mcCap); y is the old top-of-crown origin.
function meGorra(c,x,y,rot,facing,o={}){const {lw=1.3,R=15,back=false}=o;mcCap(c,x,y+R*.23,rot,back?-facing:facing,R,[210,60,50],{lw});}
// A carp: orange, plump, the tail wagging (tail -1..1), the mouth open (o). Facing f, rotated by rot.
function meCarpa(c,x,y,rot,f,o={}){const {s=1,tail=0,lw=1.3,mouth=0,eye='open'}=o;const col=[236,146,70],dark=[200,100,50],light=[250,190,120];c.save();c.translate(x,y);c.rotate(rot);c.scale(s*f,s);
 // the tail fin, then the body, the dorsal fin, the pectoral fin, the scales, the eye and the mouth
 const ta=tail*.5;mcShape(c,[[-18,0],[-30+meSin(ta)*4,-11+meCos(ta)*2],[-26,0],[-30-meSin(ta)*4,11-meCos(ta)*2]],dark,{lw});
 mcShape(c,mpSmooth([[20,0],[12,-9],[0,-11],[-14,-7],[-20,0],[-14,7],[0,11],[12,9]],3,true),col,{lw,shade:[[-30,2],[30,2],[30,20],[-30,20]],shadeK:.18});
 mcShape(c,[[-10,-9],[-4,-17],[6,-15],[8,-9]],dark,{lw});mcShape(c,[[2,3],[-6,10],[6,8]],dark,{lw:lw*.8});
 c.strokeStyle=mpRgb(dark,.5);c.lineWidth=lw*.6;for(let i=0;i<3;i++)for(let j=0;j<3;j++){c.beginPath();c.arc(-8+i*7,-5+j*5,3,ME_PI*.1,ME_PI*.9);c.stroke();}
 c.fillStyle=mpRgb(light,.5);c.beginPath();c.ellipse(2,-5,8,3,0,0,ME_TAU);c.fill();
 if(eye==='closed'){c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.beginPath();c.moveTo(11,-4);c.quadraticCurveTo(13,-1.5,15,-4);c.stroke();}else{mcDot(c,13,-3,3.4,[250,250,250],{lw:lw*.9});mcDot(c,13.8,-3,1.8,[40,30,30]);}
 c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.beginPath();if(mouth>0){c.ellipse(19,2,2.5+mouth*2,2+mouth*2.5,0,0,ME_TAU);c.fillStyle=mpRgb([150,60,60]);c.fill();c.stroke();}else{c.moveTo(16,3);c.quadraticCurveTo(19,4,21,2);c.stroke();}c.restore();}
// An old boot (the variant of the fishing): brown, worn, with a sole and a loose lace.
function meBota(c,x,y,rot,f,o={}){const {s=1,lw=1.3}=o;const col=[120,84,56],dark=[80,56,40];c.save();c.translate(x,y);c.rotate(rot);c.scale(s*f,s);
 mcShape(c,mpSmooth([[-12,-26],[8,-26],[10,-4],[22,4],[24,12],[-14,12],[-14,0]],2,true),col,{lw,shade:[[-20,-30],[-2,-30],[2,14],[-20,14]],shadeK:.16});mcShape(c,[[-14,10],[24,10],[26,16],[-16,16]],dark,{lw});
 c.strokeStyle=mpRgb(dark);c.lineWidth=lw;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-6,-20+i*6);c.lineTo(6,-18+i*6);c.stroke();}c.strokeStyle=mpRgb([230,220,200]);c.lineWidth=lw;c.beginPath();c.moveTo(6,-14);c.quadraticCurveTo(14,-8,10,2);c.stroke();c.restore();}
// A carrot standing out of the ground at (x,gy) up to height h: the crown (wide, with the leaves) at the top, the root narrowing
// into the earth; swaying by sw about the ground. Rings across the root. Exported: the board draws the trace of the episode with it.
export function mePastanaga(c,x,gy,h,o={}){const {sw=0,lw=1.3,leaves=true,scale=1,crown=1}=o;const col=[240,132,40],dark=[205,92,30],green=[90,160,70],greenD=[60,120,50];c.save();c.translate(x,gy);c.rotate(sw);
 const w=Math.max(4,h*.22)*crown;const pts=mpSmooth([[-w*.35,4],[w*.35,4],[w*.9,-h*.45],[w,-h*.9],[w*.8,-h],[-w*.8,-h],[-w,-h*.9],[-w*.9,-h*.45]],2,true);
 mcShape(c,pts,col,{lw,shade:[[-w*1.3,-h*1.1],[-w*.15,-h*1.1],[-w*.25,10],[-w*1.3,10]],shadeK:.16});
 c.strokeStyle=mpRgb(dark,.8);c.lineWidth=lw*.9;c.lineCap='round';for(let i=1;i<=5;i++){const yy=-h*(i*.16);const ww=w*(.35+.65*(i*.16));c.beginPath();c.moveTo(-ww*.85,yy);c.quadraticCurveTo(0,yy+3,ww*.85,yy);c.stroke();}
 c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.ellipse(-w*.4,-h*.6,w*.18,h*.3,0,0,ME_TAU);c.fill();
 if(leaves){const n=7;for(let i=0;i<n;i++){const a=-ME_PI/2+(i-(n-1)/2)*.3;const len=Math.max(12,h*.42)*(1-(Math.abs(i-(n-1)/2)/n)*.6);const ex=meCos(a)*len,ey=-h+meSin(a)*len;c.strokeStyle=mpRgb(i%2?green:greenD);c.lineWidth=lw*1.8;c.beginPath();c.moveTo(0,-h+2);c.quadraticCurveTo(ex*.5,-h+(ey+h)*.6-6,ex,ey);c.stroke();
   c.fillStyle=mpRgb(i%2?green:greenD);for(let k=1;k<=3;k++){const u=k/3.5;c.beginPath();c.ellipse(ex*u,-h+(ey+h)*u-2,Math.max(3,len*.12)+u*2,Math.max(1.6,len*.06),a+ME_PI/2,0,ME_TAU);c.fill();}}}
 c.restore();}
// Two-bone IK for an arm: the shoulder and elbow angles (the solver's convention, from vertical-down towards the facing side) so
// that the hand reaches T from the shoulder S; bend +1 keeps the elbow on the facing side, -1 behind.
export function meIK(S,T,l1,l2,f,bend=1){const dx=(T[0]-S[0])*f,dy=T[1]-S[1];const d=Math.min(Math.hypot(dx,dy),l1+l2-.01);const base=Math.atan2(dx,dy);const A=Math.acos(msClamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),B=Math.acos(msClamp((l1*l1+l2*l2-d*d)/(2*l1*l2),-1,1));return {sh:base+bend*A,el:-bend*(ME_PI-B)};}
// The pose with the arms reaching two world targets (null keeps the arm as it is).
export function meReach(rig,pose,TL,TR,bendL=1,bendR=1){const J=mcSolve(rig,pose);const H=J.H;const l1=rig.upperArm*H,l2=rig.foreArm*H+rig.hand*H*.3;const out={...pose};
 if(TL){const a=meIK(J.shL,TL,l1,l2,J.f,bendL);out.shL=a.sh;out.elL=a.el;}if(TR){const a=meIK(J.shR,TR,l1,l2,J.f,bendR);out.shR=a.sh;out.elR=a.el;}return out;}
// Flames at the hearth, moving (n tongues on a base at (x,y)); drawn every frame over the set's logs.
function meFlames(c,x,y,t,o={}){const {n=5,h=46,w=14,lw=0}=o;c.save();for(let i=0;i<n;i++){const fx=x+(i-(n-1)/2)*w*1.1;const hh=h*(.7+.3*meSin(t*9+i*1.7)+.15*meSin(t*23+i*.9));const lean=meSin(t*5+i)*4;c.fillStyle=mpRgb(i%2?[255,205,80]:[250,140,50],.92);c.beginPath();c.moveTo(fx-w*.6,y);c.quadraticCurveTo(fx-w*.7+lean,y-hh*.55,fx+lean*1.6,y-hh);c.quadraticCurveTo(fx+w*.7+lean,y-hh*.55,fx+w*.6,y);c.closePath();c.fill();
  c.fillStyle=mpRgb([255,240,150],.85);c.beginPath();c.moveTo(fx-w*.3,y);c.quadraticCurveTo(fx-w*.3+lean*.5,y-hh*.3,fx+lean*.8,y-hh*.5);c.quadraticCurveTo(fx+w*.3+lean*.5,y-hh*.3,fx+w*.3,y);c.closePath();c.fill();}c.restore();}
// Steam puffs rising from (x,y): soft white rings, strength 0..1.
function meVapor(c,x,y,t,strength=1,o={}){if(strength<=0)return;const {n=4,rise=40,drift=0}=o;c.save();for(let i=0;i<n;i++){const u=((t*.5+i/n)%1);const px=x+drift*u+meSin(t*2+i*2)*4*u,py=y-u*rise;c.globalAlpha=strength*(1-u)*Math.min(1,u*4)*.7;c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.ellipse(px,py,3+u*7,2.5+u*5,0,0,ME_TAU);c.fill();}c.restore();}
// Dust motes drifting in a beam of light (the window), screen composite.
function meMotes(c,x,y,w,h,t,seed=9){const r=mpRng(seed);c.save();c.globalCompositeOperation='screen';for(let i=0;i<14;i++){const px=x+r()*w+meSin(t*.4+i)*8,py=y+((r()+t*.012+i*.03)%1)*h;c.fillStyle=`rgba(255,245,210,${.25+.2*meSin(t*2+i)})`;c.beginPath();c.arc(px,py,1.2+r()*1.2,0,ME_TAU);c.fill();}c.restore();}
// ── E1 · La truita al sostre ──────────────────────────────────────────────────────────────────────────────────────────────────────
// The grandmother flips the omelette so high that it sticks to a beam. She waits under it, taps her foot, gets a drip on her glasses,
// has an idea: a plate on her head. The omelette peels off and lands on the plate; she bows. Variant: it lands on the cat, who was
// sleeping on the stove, and she laughs.
const E1={beam:870,beamY:108,launch:3.25,drip:6.0,detach:11.0};
function meAvia(c,w,h,t,ctx){const K=MD_CUINA;const L=mpHour(meHourOf(ctx));const v=ctx.variant|0;const cam=mpCam(w,h,760,400,1.3);const bare=meBare(ctx);
 meSet('avia',c,w,h,ctx,cam,{paint:(x,LL)=>mdCuina(x,LL),key:'cuina'});c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);
 const lw=1.5,S=2.3,ch=MC_CHARS.avia,Hh=ch.rig.H*S,R=Hh*.5;const xHome=v?800:850;
 // ── the body: a track of key poses, the walk blended over it, the foot tap, the springs
 const hold={lean:.06,crouch:0,lift:0,headTilt:0,headTurn:0,shL:.95,elL:.35,shR:.35,elR:1.5,hipL:.06,kneeL:0,hipR:-.06,kneeR:0,facing:1,x:786};
 const hips={shL:-.3,elL:1.6,shR:-.35,elR:1.55};
 const keys=[[0,{...hold}],[2.4,{...hold}],[3.0,{...hold,crouch:.28,lean:.14,shL:.55,elL:.8,headTilt:.1}],
  [E1.launch,{...hold,lift:12,lean:-.12,shL:2.35,elL:.05,shR:.9,elR:.4,headTilt:-.25},msEaseIn],[3.55,{...hold,crouch:.12,lean:-.05,shL:2.1,elL:.2,shR:.7,elR:.6,headTilt:-.35},msEaseOut],
  [4.3,{...hold,shL:1.1,elL:.3,headTilt:-.42}],[4.6,{...hold,headTilt:-.4}],[5.6,{...hold,x:xHome,headTilt:-.38}],[5.9,{...hold,...hips,x:xHome,headTilt:-.42,hipL:.22}],
  [7.0,{...hold,...hips,x:xHome,headTilt:-.42,hipL:.22}],[7.25,{...hold,...hips,x:xHome,headTilt:.05,hipL:.1,shL:2.5,elL:1.15}],[7.9,{...hold,...hips,x:xHome,headTilt:.05,hipL:.1,shL:2.5,elL:1.15}],
  [8.3,{...hold,...hips,x:xHome,headTilt:-.3,hipL:.22}],[8.5,{...hold,...hips,x:xHome,headTilt:-.1}],[8.75,{...hold,...hips,x:xHome,lift:9,headTilt:-.15},msEaseOut],[9.0,{...hold,...hips,x:xHome,lift:0,facing:-1},msEaseIn],
  [9.4,{...hold,x:xHome,facing:-1,shL:2.55,elL:.25,shR:.3,elR:1.2,headTilt:-.2}],[9.9,{...hold,x:xHome,facing:-1,shL:2.75,elL:1.15,shR:.3,elR:1.2,headTilt:0}],[10.3,{...hold,...hips,x:xHome,facing:1,headTilt:-.1}],
  [10.6,{...hold,...hips,x:xHome,headTilt:-.42,hipL:.22}],[11.9,{...hold,...hips,x:xHome,headTilt:-.42,hipL:.22}],[12.1,{...hold,...hips,x:xHome,headTilt:-.1}],
  [12.5,{...hold,x:xHome,shL:2.6,elL:1.1,shR:2.4,elR:1.25,headTilt:0}],[12.9,{...hold,x:xHome,shL:2.6,elL:1.1,shR:2.4,elR:1.25}],[13.25,{...hold,x:xHome,shL:1.35,elL:.95,shR:1.15,elR:1.05,headTilt:0}],
  [13.7,{...hold,x:xHome,shL:1.45,elL:.95,shR:1.25,elR:1.05,lean:.5,headTilt:.25}],[14,{...hold,x:xHome,shL:1.35,elL:.95,shR:1.15,elR:1.05,lean:.12,headTilt:0}]];
 const P=meTrack(keys,t);P.y=690;P.scale=S;
 if(t<2.4){P.elL+=meSin(t*31)*.09;P.headTilt+=meSin(t*31)*.01;}            // the pan shaken
 if(t>4.6&&t<5.6){const wk=meWalk((t-4.6)*ME_TAU,.45);Object.assign(P,{hipL:wk.hipL,kneeL:wk.kneeL,hipR:wk.hipR,kneeR:wk.kneeR,bob:wk.bob});P.shL=wk.shL+.5;P.shR=wk.shR-.2;}
 if((t>5.9&&t<7.0)||(t>10.6&&t<11.9)){P.kneeL=.45*(.5+.5*meSin((t-5.9)*ME_TAU*2.2));}   // the foot tapping
 P.lean+=msSpring(t-3.55,.06,2.4,3)+msSpring(t-11.81,.1,2.6,3)+(t>12.6&&v?meSin((t-12.6)*ME_TAU*1.3)*.08:0);
 const hs=[msSpring(t-E1.launch,6,2.2,2.6)+msSpring(t-9.0,4,2.5,3),msSpring(t-3.55,4,3,3)];
 // ── the expression
 const blink=msBlink(t,0);let E={eyes:'open',mouth:'smile',brows:.2,blush:.4,look:[0,.1],blink};
 if(t>1.8&&t<2.15)E={...E,eyes:'wink',mouth:'grin'};else if(t>=2.4&&t<E1.launch)E={...E,eyes:'open',mouth:'o',brows:.6,look:[.2,.2]};
 else if(t>=E1.launch&&t<4.22)E={...E,eyes:'wide',mouth:'o',brows:.8,look:[0,-.9]};else if(t>=4.22&&t<5.6)E={...E,eyes:'wide',mouth:'o',brows:.9,look:[0,-1]};
 else if(t>=5.6&&t<6.9)E={...E,eyes:'open',mouth:'line',brows:-.3,look:[.1,-1]};else if(t>=6.9&&t<7.95)E={...E,eyes:'closed',mouth:'line',brows:-.4};
 else if(t>=7.95&&t<8.5)E={...E,eyes:'open',mouth:'line',brows:-.2,look:[0,-.8]};else if(t>=8.5&&t<9.4)E={...E,eyes:'wide',mouth:'open',brows:.95,look:[-.3,-.3]};
 else if(t>=9.4&&t<10.3)E={...E,eyes:'open',mouth:'smile',brows:.5,look:[-.5,-.6]};else if(t>=10.3&&t<11.81)E={...E,eyes:'open',mouth:'o',brows:.4,look:[.1,-1]};
 else if(t>=11.81&&t<12.5)E={...E,eyes:v?'wide':'happy',mouth:v?'o':'grin',brows:.7,look:[.6,-.2]};else if(t>=12.5)E={...E,eyes:'happy',mouth:'grin',brows:.5,blush:.6};
 if(t>13.75)E={...E,eyes:'wink'};
 // ── the fire, the pot steam, the motes, the cat
 const hh=K.hearth;meFlames(c,hh.x,hh.y-34,t,{n:5,h:48,w:15});mfGlow(c,hh.x,hh.y-50,150,t,[255,170,80],.22);meVapor(c,hh.x+10,hh.y-96,t,.8,{rise:50});
 const wd=K.window;meMotes(c,wd.x,wd.y+wd.h,wd.w+120,220,t);
 const stick=t>=4.22;const catPose=v?{x:895,y:460,facing:-1,state:'sit',eyes:stick?'open':'closed',ear:stick?-2:0,tail:t*1.6,scale:1.4}:{x:K.chair.x,y:K.chair.y-52,facing:1,state:'sit',eyes:'open',ear:stick?-1.5:0,tail:t*1.3,scale:1.3};
 if(v&&t>=11.81){// the omelette sits on the cat like a hat
  mcDrawCat(c,{...catPose,ear:-3,eyes:'open',bob:msSpring(t-11.81,3,4,4)},{lw:1.5});meTruita(c,catPose.x-4,catPose.y-56+msSpring(t-11.81,3,4,4),0,{rx:30,ry:9,lw:1.5});mfStars(c,catPose.x,catPose.y-70,t,11.81,5,1.6);meVapor(c,catPose.x,catPose.y-62,t,msClamp(1-(t-11.81)/2.2),{rise:40});}
 else mcDrawCat(c,catPose,{lw:1.5});
 // ── behind her: the plate on its hook on the wall, the pan once it rests on the stove top
 const inHand=t<9.4;// the pan until she reaches for the plate (she puts it on the stove)
 const hook=[K.stove.x-84,K.stove.y-K.stove.h-80];
 if(t<9.3){c.save();c.fillStyle=mpRgb([90,80,70]);c.fillRect(hook[0]-2,hook[1]-14,4,6);c.restore();mePlat(c,hook[0],hook[1]+10,1,{r:24,lw:1.4});}
 if(!inHand)mePan(c,K.stove.x-64,K.stove.y-K.stove.h-16,-.1,{omelette:false,lw:1.5,tilt:.1});
 // ── the grandmother, and the pan or the plate in her hands
 const J=meHuman(c,'avia',P,E,{lw,L,hairSpring:hs,shadow:true});
 if(inHand){const a=meHandAngle(J,true);mePan(c,J.hdL[0],J.hdL[1],a,{omelette:t<E1.launch,j:t<2.4?meSin(t*31+1):0,lw:1.5,tilt:a*.6});}
 // the plate: in her hand, on her head, in her hands
 if(t>=9.3&&t<9.9)mePlat(c,J.hdL[0],J.hdL[1]-4,.5,{r:26,lw:1.4,tilt:-.3});
 else if(t>=9.9&&t<12.5){const top=J.head[1]-R*1.03;mePlat(c,J.head[0]+hs[0]*.2,top-3,0,{r:27,lw:1.4,tilt:msSpring(t-11.81,.22,3,3)+P.headTilt*.5});
  if(t>=11.81&&!v){meTruita(c,J.head[0]+hs[0]*.2,top-8,0,{rx:30,ry:9,lw:1.5});meVapor(c,J.head[0],top-14,t,msClamp(1-(t-11.81)/2.4),{rise:46});}}
 else if(t>=12.5){const a=meHandAngle(J,true);const px=(J.hdL[0]+J.hdR[0])/2+8,py=(J.hdL[1]+J.hdR[1])/2-6;const face=msTrack([[12.9,0],[13.25,.55]],t);mePlat(c,px,py,.2+face*.7,{r:27,lw:1.4,tilt:0});if(!v)meTruita(c,px,py-4,0,{rx:30,ry:4+5*(1-face)+4*face,lw:1.5});}
 // ── the omelette in the air, on the beam, falling
 if(t>=E1.launch&&t<4.22){const tau=t-E1.launch;const J0=mcSolve(ch.rig,{...meTrack(keys,E1.launch),y:690,scale:S});const a0=meHandAngle(J0,true);const x0=J0.hdL[0]+meCos(a0)*70,y0=J0.hdL[1]+meSin(a0)*70-6;
  const vy=-((E1.beamY+6-y0)*-1*2/0.97/0.97*.5)*0;const g=700,T=.97;const vy0=((E1.beamY+8-y0)-.5*g*T*T)/T;const y=y0+vy0*tau+.5*g*tau*tau,x=x0+(E1.beam-x0)*(tau/T);meTruita(c,x,y,tau/T*ME_PI*2.5,{lw:1.5});}
 if(t>=4.22&&t<E1.detach){const peel=msClamp((t-10.4)/.6);const sq=1-msSpring(t-4.22,.25,4,4);c.save();c.translate(E1.beam-28,E1.beamY+2);c.rotate(peel*.75);c.translate(28,0);c.scale(1,sq);meTruita(c,0,4,0,{rx:31,ry:7,lw:1.5});c.restore();
  mfStars(c,E1.beam,E1.beamY+4,t,4.22,6,1.6);
  // the drip: a drop grows under the omelette, then falls on her glasses (or on the floor, in the variant)
  const dt=t-E1.drip;if(t>4.9&&t<E1.drip){const u=msClamp((t-4.9)/1.1);c.fillStyle=mpRgb([240,200,90]);c.beginPath();c.ellipse(E1.beam+6,E1.beamY+12+u*5,2.5+u*1.5,3+u*3.5,0,0,ME_TAU);c.fill();}
  else if(dt>=0&&dt<.9){const y=E1.beamY+16+450*dt*dt;c.fillStyle=mpRgb([240,200,90]);c.beginPath();c.ellipse(E1.beam+6,y,3,5,0,0,ME_TAU);c.fill();}
  else if(dt>=.9&&dt<1.6){const x=E1.beam+6,y=v?K.floor+110:J.head[1]-R*.1;const u=(dt-.9)/.7;c.fillStyle=mpRgb([240,200,90],1-u);c.beginPath();c.ellipse(x,y,6+u*6,2.5,0,0,ME_TAU);c.fill();if(!v){c.fillStyle=mpRgb([240,200,90],.9*(1-u));for(let i=0;i<4;i++){c.beginPath();c.arc(x-9+i*6,y-2+u*14*(i%2?1:.6),1.8,0,ME_TAU);c.fill();}}}}
 if(t>=E1.detach&&t<11.81){const tau=t-E1.detach;const yT=v?catPose.y-56:J.head[1]-R*1.03-8;const y=Math.min(yT,E1.beamY+8+450*tau*tau);meTruita(c,E1.beam+(v?(catPose.x-4-E1.beam):(J.head[0]-E1.beam))*msClamp(tau/.8),y,tau/.81*ME_PI,{lw:1.5});}}
export function meWashing(c,L,t,W,gone){const ln=MD.line;c.save();c.strokeStyle='rgba(70,60,60,.9)';c.lineWidth=1.2;c.beginPath();c.moveTo(ln.x0,ln.y0);c.quadraticCurveTo((ln.x0+ln.x1)/2,ln.y0+10,ln.x1,ln.y1);c.stroke();
 const items=[[.14,[246,246,240],30,46,0],[.5,[120,160,220],22,30,1],[.82,[250,220,220],24,40,2]];for(const [u,col,w,h,i] of items){if(gone&&i===0)continue;const x=ln.x0+(ln.x1-ln.x0)*u,y=ln.y0+(ln.y1-ln.y0)*u+10*4*u*(1-u);const sway=W*(14+i*4)*(1+.3*Math.sin(t*3+i));const flap=Math.sin(t*5+i*2)*W*6;
  mcShape(c,[[x-w/2,y],[x+w/2,y],[x+w/2+6+sway+flap,y+h],[x-w/2+3+sway,y+h]],col,{lw:1.2,shade:[[x-w/2-10,y],[x+w/2-w*.4,y],[x+w/2-w*.4+6+sway,y+h],[x-w/2-10,y+h]],shadeK:.14});c.fillStyle='rgba(180,140,90,1)';c.fillRect(x-w/2+2,y-3,3,6);c.fillRect(x+w/2-5,y-3,3,6);}
 c.restore();}
export function mePondLife(c,L,t){c.save();c.globalCompositeOperation='screen';for(let i=0;i<10;i++){const x=120+i*28+Math.sin(t*.7+i)*8,y=640+((i*37)%90)+Math.sin(t*1.1+i*2)*3;const a=.25+.35*Math.max(0,Math.sin(t*2.3+i*1.7));c.fillStyle=`rgba(255,250,220,${a})`;c.beginPath();c.ellipse(x,y,6+(i%3)*3,1,0,0,MP_TAU);c.fill();}c.restore();}
// ── The five on the board ───────────────────────────────────────────────────────────────────────────────────────────────────────
// One character on the board: the idle life (msIdle) drawn with its props, and its trace after its episode.
export function meCharacter(c,id,L,t,k,o={}){const {lw=1.5,picked=false,wind=.2,pose:over=null,expr:overE=null,hairSpring=null}=o;const sp=MD.spots[id];const idle=msIdle(id,t,k);const pose={...idle.pose,...(over||{})},expr={...idle.expr,...(overE||{})},props=idle.props||{};
 const hs=hairSpring||[wind*3*Math.sin(t*2.2+id.length),0];
 if(id==='cabra'){if(picked)return;mcDrawGoat(c,{...pose,x:sp[0],y:sp[1]},{lw:lw/(pose.scale||1),L,hairSpring:hs});return;}
 const ch=MC_CHARS[id];
 if(id==='avia'){const w=MD.house.window;c.save();c.beginPath();c.rect(w.x-w.w/2-6,w.y-w.h/2-16,w.w+12,w.h+16);c.clip();const J=mcDrawHuman(c,ch.rig,{...pose,x:w.x-6,y:w.y+w.h/2+48},ch.costume,expr,{lw,L,shadow:false,hairSpring:hs});
  if(props.spoon){c.save();c.strokeStyle=mpRgb([150,110,70]);c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(J.hdL[0],J.hdL[1]);c.lineTo(J.hdL[0]+6,J.hdL[1]-22);c.stroke();c.fillStyle=mpRgb([170,130,80]);c.beginPath();c.ellipse(J.hdL[0]+7,J.hdL[1]-25,4,5.5,.3,0,MP_TAU);c.fill();c.restore();}
  c.restore();c.fillStyle=mpRgb(mpLit(mpCol(MN_PAL.stoneWarm[2],L,.5),L,.25));c.fillRect(w.x-w.w/2-6,w.y+w.h/2,w.w+12,5);
  if(picked){// the trace: the plate with the tortilla on the sill
   c.fillStyle='rgba(250,250,250,1)';c.beginPath();c.ellipse(w.x+20,w.y+w.h/2+1,11,3.5,0,0,MP_TAU);c.fill();c.fillStyle=mpRgb([236,190,80]);c.beginPath();c.ellipse(w.x+20,w.y+w.h/2-1,8,3,0,0,MP_TAU);c.fill();c.strokeStyle='rgba(60,40,30,.8)';c.lineWidth=1;c.stroke();}
  return;}
 if(id==='avi'){const stool=[sp[0],sp[1]];meStool(c,stool[0],stool[1],0,L);
  const sit=meSitPose(ch.rig,pose.scale||.75,pose.seat||29);const J=mcDrawHuman(c,ch.rig,{...pose,lift:sit.lift,x:stool[0]-4,y:stool[1]},ch.costume,expr,{lw,L,hairSpring:hs,shadow:false});
  // the rod, the line and the bobber (dipping when he is pointed at)
  const dip=props.rodDip||0;c.save();c.strokeStyle='rgba(90,70,50,1)';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(J.hdL[0],J.hdL[1]);c.quadraticCurveTo(J.hdL[0]+50,J.hdL[1]-30-dip*6,J.hdL[0]+84,J.hdL[1]-38+dip*10);c.stroke();c.strokeStyle='rgba(60,60,70,.6)';c.lineWidth=1;c.beginPath();c.moveTo(J.hdL[0]+84,J.hdL[1]-38+dip*10);c.lineTo(J.hdL[0]+88,J.hdL[1]+60+dip*6);c.stroke();
  mcDot(c,J.hdL[0]+88,J.hdL[1]+60+dip*6,3,[230,60,50],{lw:1});c.restore();mfRings(c,J.hdL[0]+88,J.hdL[1]+62,t,Math.floor(t/2.6)*2.6,{k:2,speed:14,life:1.6});
  if(props.zzz>0)mfSnore(c,J.head[0]+10,J.head[1]-16,t,props.zzz,1);
  if(picked){// the trace: the carp on the hat
   const hx=J.head[0],hy=J.head[1]-ch.rig.head*ch.rig.H*.5*pose.scale*1.3;c.save();c.translate(hx,hy);c.rotate(-.25);mcEllipse(c,0,0,14,6,0,[230,150,80],{lw:1.2});mcShape(c,[[-12,0],[-20,-6],[-19,6]],[230,150,80],{lw:1.2});mcDot(c,7,-1.5,1.6,[40,30,30]);c.restore();}
  return;}
 if(id==='nina'){const J=mcDrawHuman(c,ch.rig,{...pose,x:sp[0],y:sp[1]},ch.costume,expr,{lw,L,hairSpring:hs});
  if(props.can){// the watering can in the near hand, pouring
   const hx=J.hdL[0],hy=J.hdL[1];c.save();c.translate(hx,hy);c.rotate(-.5+(props.water||0)*.4);mcShape(c,[[-10,-4],[10,-4],[12,10],[-12,10]],[90,150,110],{lw:1.2});mcStroke(c,[[10,-2],[24,-14]],[90,150,110],3.5);mcDot(c,24,-14,3.2,[90,150,110],{lw:1});mcStroke(c,[[-6,-4],[0,-13],[6,-4]],[90,150,110],2.4);c.restore();
   mfWater(c,hx-22,hy-12,-1,0,t,props.water||0,4);}
  if(picked){// the trace: the giant carrot standing in the garden
   mePastanaga(c,E3.B[0],E3.B[1]+2,200,{sw:.02,lw:1.1});}
  return;}
 if(id==='pol'){const slip=props.capSlip||0;const J=mcDrawHuman(c,ch.rig,{...pose,x:sp[0],y:sp[1]},ch.costume,{...expr,eyes:slip>.4?'closed':expr.eyes},{lw,L,hairSpring:hs});
  if(props.pin){c.save();c.fillStyle='rgba(180,140,90,1)';c.fillRect(J.hdL[0]-1.5,J.hdL[1]-9,3,8);c.restore();}
  if(picked){// the trace: hay in the cap and on the shoulders
   c.save();c.strokeStyle=mpRgb([226,190,96]);c.lineWidth=1.4;c.lineCap='round';for(let i=0;i<9;i++){const a=i*.8;c.beginPath();c.moveTo(J.head[0]+Math.cos(a)*10,J.head[1]-18+Math.sin(a)*4);c.lineTo(J.head[0]+Math.cos(a)*18,J.head[1]-24+Math.sin(a)*8);c.stroke();}c.restore();}
  return;}}
// ── The dispatch ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const ME={avia:meAvia,avi:meAvi,nina:meNina,pol:mePol,cabra:meCabra,sopar:meSopar};
export function meDraw(id,c,w,h,t,ctx){const fn=ME[id];if(!fn)return;c.save();fn(c,w,h,Math.max(0,t),ctx);c.restore();}
// ── E2 · La pesca ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The grandfather sleeps on his stool with the rod. The bobber dips, a tug wakes him, a tug-of-war, and the carp leaps out of the
// pond and lands on his hat. Its tail slaps his nose; he tries to grab it; it jumps back into the water. Variant: an old boot comes
// out first and pours water on his face; then the carp leaps by itself, knocks the boot off, and dives back.
const E2={tug:3.2,leap:7.0,land:8.3,slap1:9.5,slap2:10.5,grab:11.0,dive:12.5,splash:13.3,exit:[330,640]};
function meRotJ(J,cx,cy,a){if(!a)return J;const co=meCos(a),si=meSin(a),R={...J};for(const k in J){const v=J[k];if(Array.isArray(v)&&v.length===2&&typeof v[0]==='number'){const dx=v[0]-cx,dy=v[1]-cy;R[k]=[cx+dx*co-dy*si,cy+dx*si+dy*co];}}R.headA=(J.headA||0)+a;return R;}
function meStool(c,x,y,rot,L){c.save();c.translate(x-8,y);c.rotate(rot);c.translate(-(x-8),-y);mpGroundShadow(c,x,y+2,16,4,L,.25,2);c.fillStyle='rgba(96,74,52,1)';c.fillRect(x-11,y-26,22,4);c.fillRect(x-9,y-22,3,22);c.fillRect(x+6,y-22,3,22);c.fillStyle='rgba(70,52,36,1)';c.fillRect(x-11,y-23,22,1.5);c.restore();}
function meLibel(c,x,y,t){c.save();c.translate(x,y);const wb=meSin(t*60);c.fillStyle='rgba(200,230,250,.5)';for(const s of [-1,1]){c.beginPath();c.ellipse(s*7,-2,7,2.2,s*.3*wb,0,ME_TAU);c.fill();c.beginPath();c.ellipse(s*6,1,6,1.8,-s*.3*wb,0,ME_TAU);c.fill();}
 c.strokeStyle='rgba(60,90,130,1)';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(-10,2);c.lineTo(6,-1);c.stroke();mcDot(c,7,-1.5,2.2,[70,110,150]);c.restore();}
function meAvi(c,w,h,t,ctx){const v=ctx.variant|0;const cam=mpCam(w,h,ME_CAM.avi.x,ME_CAM.avi.y,ME_CAM.avi.z);const L=meSet('avi',c,w,h,ctx,cam);c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);
 const lw=.9,S=.75,ch=MC_CHARS.avi,Hh=ch.rig.H*S,R=Hh*.5,sp=MD.spots.avi;
 // seated (0.41): hips on the seat, thighs level, shins down to the grass; braced, the feet push forward; the body tips with the stool
 const L0=meSitPose(ch.rig,S,29).lift;
 const sleep={crouch:1,lean:.3,headTilt:.55,shL:.75,elL:1.25,shR:.6,elR:1.2,hipL:.8,kneeL:-.4,hipR:.74,kneeR:-.46,lift:L0,facing:1,x:sp[0]-4};
 const grip={...sleep,shL:.55,elL:1.25,shR:.45,elR:1.2,hipL:.72,kneeL:-.78,hipR:.66,kneeR:-.82};
 const keys=[[0,sleep],[E2.tug,sleep],[E2.tug+.12,{...sleep,headTilt:-.2,lean:.05,shL:.6,elL:1.1,shR:.5,elR:1.1},msEaseOut],[3.6,{...grip,lean:-.1,headTilt:-.1}],[4.5,{...grip,lean:-.35,headTilt:-.05}],
  [E2.leap,{...grip,lean:-.3}],[E2.leap+.4,{...grip,lean:-.55,headTilt:-.3,hipL:1.15,kneeL:-.05,hipR:1.08,kneeR:-.1},msEaseOut],[8.0,{...grip,lean:.05,headTilt:-.45,shL:.8,elL:1.1,shR:.6,elR:1.1}],
  [E2.land,{...grip,lean:.05,headTilt:-.4,shL:.8,elL:1.1,shR:.6,elR:1.1}],[E2.land+.15,{...grip,lean:.15,headTilt:.1,lift:L0-5,crouch:1.05},msEaseIn],[E2.land+.6,{...grip,lean:.05,headTilt:-.2,lift:L0,crouch:1},msEaseOut],
  [E2.grab,{...grip,lean:.05,headTilt:-.2}],[E2.grab+.35,{...grip,headTilt:-.1,shL:2.6,elL:1.0,shR:2.5,elR:1.05},msEaseOut],[E2.grab+.9,{...grip,headTilt:-.05,shL:2.55,elL:1.1,shR:2.45,elR:1.15}],[E2.grab+1.3,{...grip,headTilt:.1,shL:1.2,elL:1.2,shR:1.0,elR:1.2}],
  [E2.dive,{...grip,headTilt:.1,shL:1.2,elL:1.2,shR:1.0,elR:1.2}],[E2.splash,{...grip,headTilt:.35,shL:1.0,elL:1.3,shR:.9,elR:1.3}],[13.6,{...grip,headTilt:.1,shL:1.5,elL:1.5,shR:1.4,elR:1.5,lift:L0-3}],[14,{...grip,headTilt:.05,shL:1.5,elL:1.5,shR:1.4,elR:1.5,lift:L0-3}]];
 const P=meTrack(keys,t);P.y=sp[1];P.scale=S;
 if(t<E2.tug){const sn=meSin(t*1.9);P.lean+=sn*.03;P.headTilt+=sn*.08;}
 let pull=0;if(t>4.5&&t<E2.leap){pull=.5+.5*meSin((t-4.5)*ME_TAU*1.5);P.lean+=-.12*pull+.1;P.headTilt+=.15*pull;}
 P.headTilt+=msSpring(t-E2.slap1,.3,3,4)+msSpring(t-E2.slap2,.3,3,4)+msSpring(t-E2.land,.15,3,3);P.lean+=msSpring(t-E2.tug,.08,3,3);
 const stoolRot=msTrack([[0,0],[3.6,0],[4.5,-.22],[E2.leap,-.22],[E2.leap+.4,-.5],[8.0,0]],t)-.08*pull+msSpring(t-E2.land,.1,4,4);
 const hs=[msSpring(t-E2.tug,3,3,3)+msSpring(t-E2.land,3,3,3),0];
 // ── the expression
 const blink=msBlink(t,1);let E={eyes:'closed',mouth:'sleep',brows:0,blush:.2,look:[0,0],blink:0};
 if(t>=E2.tug&&t<3.6)E={eyes:'wide',mouth:'o',brows:1,blush:.2,look:[.6,.4]};else if(t>=3.6&&t<E2.leap)E={eyes:pull>.6?'closed':'open',mouth:pull>.6?'line':'o',brows:-.5,blush:.4,look:[.7,.5]};
 else if(t>=E2.leap&&t<E2.land)E={eyes:'wide',mouth:'o',brows:.9,blush:.3,look:[.3,-1]};else if(t>=E2.land&&t<E2.grab)E={eyes:(t-E2.slap1>0&&t-E2.slap1<.35)||(t-E2.slap2>0&&t-E2.slap2<.35)?'closed':'wide',mouth:'o',brows:.6,blush:.5,look:[0,-1],blink};
 else if(t>=E2.grab&&t<E2.dive)E={eyes:'open',mouth:'line',brows:-.3,blush:.4,look:[0,-1],blink};else if(t>=E2.dive&&t<13.6)E={eyes:'open',mouth:'sad',brows:-.2,blush:.3,look:[.8,.6],blink};else E={eyes:'happy',mouth:'smile',brows:.6,blush:.4,look:[0,.2]};
 // ── the pond life: the dragonfly (it flees at the leap), the rings of the bobber, the fight under water
 const flee=msClamp((t-E2.leap)/.6);meLibel(c,250+meSin(t*.9)*40+flee*260,560+meSin(t*2.3)*12-flee*120,t);
 mpGroundShadow(c,sp[0]+16,sp[1]+2,24,4,L,.22,3);meStool(c,sp[0],sp[1],stoolRot,L);
 c.save();c.translate(sp[0]-8,sp[1]);c.rotate(stoolRot);c.translate(-(sp[0]-8),-sp[1]);const J0=meHuman(c,'avi',P,E,{lw,L,hairSpring:hs,costume:{...ch.costume,hat:null},shadow:false});c.restore();
 const J=meRotJ(J0,sp[0]-8,sp[1],stoolRot);
 // ── the rod, the line, the bobber or the fish
 const hand=J.hdL;const bend=t<E2.tug?0:t<E2.leap?.5+.5*pull:t<E2.leap+.3?1-(t-E2.leap)/.3:0;const tip=[hand[0]+84-bend*26,hand[1]-38+bend*52];const ctl=[hand[0]+50,hand[1]-30+bend*30];
 c.save();c.strokeStyle='rgba(96,74,52,1)';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(hand[0],hand[1]);c.quadraticCurveTo(ctl[0],ctl[1],tip[0],tip[1]);c.stroke();c.restore();
 const waterY=y=>y;const bob=[E2.exit[0]-30,E2.exit[1]-26];const dip=(t>2.0&&t<2.25)||(t>2.7&&t<2.95)?6:0;
 let lineEnd=null,thing=null;// thing: {kind:'carp'|'boot',x,y,rot,f}
 const hatBase=[J.head[0]+hs[0]*.2,J.head[1]-R*.78];const onHat=[hatBase[0],hatBase[1]-R*.62];
 if(t<E2.tug){lineEnd=[bob[0],bob[1]+dip];mcDot(c,bob[0],bob[1]+dip-3,3.2,[236,60,50],{lw:1});mcDot(c,bob[0],bob[1]+dip+1.5,2.4,[250,250,250],{lw:.8});if(dip)mfRings(c,bob[0],bob[1],t,t>2.7?2.7:2.0,{k:2,speed:16,life:1});else mfRings(c,bob[0],bob[1],t,Math.floor(t/2.6)*2.6,{k:2,speed:12,life:1.6});}
 else if(t<E2.leap){const fx=E2.exit[0]+meSin((t-E2.tug)*5)*22,fy=E2.exit[1]+4;lineEnd=[fx,fy];mfRings(c,fx,fy,t,Math.floor(t/.9)*.9,{k:2,speed:30,life:.9});if(Math.floor(t/.9)!==Math.floor((t-.05)/.9))mfSplash(c,fx,fy,t,Math.floor(t/.9)*.9,.5,7);mfSplash(c,fx,fy,t,5.2,.7,8);mfSplash(c,fx,fy,t,6.1,.7,9);}
 const kind=v?'boot':'carp';
 if(t>=E2.leap&&t<E2.land){const [x,y,a]=meArc(E2.exit[0],E2.exit[1],onHat[0],onHat[1],E2.leap,E2.land,t,520);thing={kind,x,y,rot:kind==='carp'?a-.4:a*.5+t*6,f:-1};lineEnd=[x,y];}
 else if(t>=E2.land&&t<(v?11.8:E2.dive)){const sq=msSpring(t-E2.land,.5,4,4);const hop=v?0:(t>E2.grab+.2&&t<E2.grab+.55?meSin((t-E2.grab-.2)/.35*ME_PI)*16:0);thing={kind,x:onHat[0]-2,y:onHat[1]-hop,rot:-.15+msSpring(t-E2.slap1,.2,4,3)+msSpring(t-E2.slap2,.2,4,3),f:-1,sq};lineEnd=[onHat[0]-10,onHat[1]];}
 if(v){// the variant: the boot pours, the carp leaps by itself, knocks the boot off, dives back
  if(t>8.8&&t<10.3)mfWater(c,onHat[0]-12,onHat[1]+4,-.3,1,t,msClamp((t-8.8)/.3)*msClamp((10.3-t)/.4),21);
  if(t>=E2.grab&&t<11.8){const [x,y,a]=meArc(E2.exit[0]-20,E2.exit[1],onHat[0]+4,onHat[1]-6,E2.grab,11.8,t,520);meCarpa(c,x,y,a-.4,-1,{s:.78,tail:meSin(t*22),lw,mouth:.6});}
  else if(t>=11.8&&t<13.2){const [x,y,a]=meArc(onHat[0]-6,onHat[1]-8,onHat[0]-120,sp[1]+6,11.8,12.6,t,900);if(t<12.6)meBota(c,x,y,a+t*5,-1,{s:.8,lw});else{meBota(c,onHat[0]-120,sp[1]+4,.9,-1,{s:.8,lw});mfDust(c,onHat[0]-120,sp[1]+4,t,12.6,.8);}
   const hop=t>12.2&&t<12.5?meSin((t-12.2)/.3*ME_PI)*10:0;thing={kind:'carp',x:onHat[0]-2,y:onHat[1]-hop,rot:-.15+msSpring(t-12.2,.25,4,3),f:-1};}
  else if(t>=13.2&&t<13.9){const [x,y,a]=meArc(onHat[0]-2,onHat[1],E2.exit[0],E2.exit[1],13.2,13.9,t,700);thing={kind:'carp',x,y,rot:a+.3,f:1};}
  if(t>=13.9){mfSplash(c,E2.exit[0],E2.exit[1],t,13.9,1.3,11);mfRings(c,E2.exit[0],E2.exit[1],t,13.9,{k:3,speed:40,life:1.8});}}
 else{if(t>=E2.dive&&t<E2.splash){const [x,y,a]=meArc(onHat[0]-2,onHat[1],E2.exit[0],E2.exit[1],E2.dive,E2.splash,t,700);thing={kind:'carp',x,y,rot:a+.3,f:1};lineEnd=[x,y];}
  if(t>=E2.splash){mfSplash(c,E2.exit[0],E2.exit[1],t,E2.splash,1.3,11);mfRings(c,E2.exit[0],E2.exit[1],t,E2.splash,{k:3,speed:40,life:1.8});lineEnd=[E2.exit[0]-10,E2.exit[1]+2];}}
 if(lineEnd){c.save();c.strokeStyle='rgba(60,60,70,.7)';c.lineWidth=.8;c.beginPath();c.moveTo(tip[0],tip[1]);c.lineTo(lineEnd[0],lineEnd[1]);c.stroke();c.restore();}
 if(t>=E2.leap&&t<E2.land)mfSplash(c,E2.exit[0],E2.exit[1],t,E2.leap,1.4,10);
 // ── the hat, the thing on it, the stars of the landing, the drops after the dive
 const squash=t>=E2.land?msClamp(msSpring(t-E2.land,.6,3.5,4)):0;meBarret(c,J,R,hs[0]*.2,0,P.headTilt*.5+stoolRot+msSpring(t-E2.land,.12,3,3),{lw,squash:Math.max(0,squash)});
 if(thing){if(thing.kind==='carp')meCarpa(c,thing.x,thing.y,thing.rot,thing.f,{s:.78,tail:t<E2.land||t>E2.dive?meSin(t*22):msSpring(t-E2.slap1,2,5,3)+msSpring(t-E2.slap2,2,5,3)+meSin(t*3)*.3,lw,mouth:t<E2.land?.6:.1});else meBota(c,thing.x,thing.y,thing.rot,thing.f,{s:.8,lw});}
 mfStars(c,onHat[0],onHat[1]-6,t,E2.land,5,1.2);if(t<E2.tug)mfSnore(c,J.head[0]+10,J.head[1]-14,t,1,1);
 if(t>E2.splash+.2){for(let i=0;i<3;i++){const age=((t-E2.splash-.2)*1.2+i*.37)%1;c.fillStyle='rgba(190,225,250,.9)';c.beginPath();c.ellipse(hatBase[0]-R*1.5+i*R*1.4,hatBase[1]+R*.3+age*40,1.6,2.8,0,0,ME_TAU);c.fill();}}
 mfSweat(c,J.head[0]+R*.9,J.head[1]-R*.3,t,5.0,1);mfSweat(c,J.head[0]-R*.9,J.head[1]-R*.2,t,6.0,-1);
 mfSwallows(c,ctx.t,3,12,{x0:60,x1:560,y0:430,y1:520,scale:.6});}
// ── E3 · La pastanaga gegant ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Nina pulls a carrot top with all her might: a tiny carrot comes out and she falls on her bottom. Unimpressed, she tosses it to the
// hens, spits on her hands and pulls the next one: the earth rises in a mound and a giant carrot bursts out, lifting her into the air.
// She climbs on top, waves, slides down and stands proudly beside it. Variant: the hens were perched on the leaves and ride up too.
const E3={pop:3.3,sit:3.6,toss:5.0,up:5.6,grab2:6.3,burst:7.4,climb:9.5,slide:12.5,land:13.5,A:[955,700],B:[930,712]};
const ME_HENS=[[200,140,80],[240,236,220],[120,80,60]];
function meNina(c,w,h,t,ctx){const v=ctx.variant|0;const cam=mpCam(w,h,ME_CAM.nina.x,ME_CAM.nina.y,ME_CAM.nina.z);const L=meSet('nina',c,w,h,ctx,cam);c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);
 const lw=.85,S=.95,ch=MC_CHARS.nina,rig=ch.rig,Hh=rig.H*S,R=Hh*.5,legLen=(rig.thigh+rig.shin)*Hh;const A=E3.A,B=E3.B;
 // ── the carrot B: height, sway, the mound before it
 const burst=t>=E3.burst;const hB=!burst?0:t<E3.burst+.55?200*msBack((t-E3.burst)/.55):200+msSpring(t-E3.burst-.55,16,1.6,2);const swB=burst?msSpring(t-E3.burst-.55,.07,1.2,1.4)+meSin(t*.9)*.01:0;
 const mound=msClamp((t-6.6)/(E3.burst-6.6));const top=B[1]-hB;
 // ── Nina: the key poses
 const stand={lean:.1,crouch:0,lift:0,headTilt:0,shL:.3,elL:.5,shR:.2,elR:.4,hipL:.06,kneeL:0,hipR:-.06,kneeR:0,facing:-1,x:1000};
 const bent={...stand,crouch:.5,lean:.55,headTilt:.1};const sitL=-(legLen*.615-8);const sit={...stand,crouch:1.1,lift:sitL,lean:-.1,hipL:.75,kneeL:-1.9,hipR:.7,kneeR:-1.9,x:1046};
 const hang={...stand,lean:.05,crouch:0,shL:3.0,elL:-.05,shR:3.05,elR:-.05,hipL:.25,kneeL:.55,hipR:-.15,kneeR:.45,x:B[0]+14};
 const astride={...stand,crouch:.3,hipL:.39,kneeL:-.07,hipR:.3,kneeR:-.1,lean:.05,x:B[0]+10};const slide={...stand,crouch:.4,hipL:.9,kneeL:.9,hipR:.7,kneeR:.8,shL:2.6,elL:.3,shR:2.6,elR:.3,x:B[0]+12};
 const proud={...stand,x:978,lean:.05,shR:-.3,elR:1.6};
 const keys=[[0,stand],[.8,stand],[1.4,bent],[E3.pop,{...bent,lean:.25}],[E3.pop+.18,{...stand,x:1030,lift:22,lean:-.45,hipL:.6,kneeL:.9,hipR:.4,kneeR:.7},msEaseOut],[E3.sit,sit,msEaseIn],
  [E3.toss,sit],[E3.toss+.25,{...sit,shL:-2.3,elL:-.2,lean:-.2},msEaseOut],[E3.up,{...sit,shL:-1.2,elL:.2}],[E3.up+.3,{...stand,x:1030,crouch:.45,lean:.3},msEaseOut],[E3.up+.55,{...stand,x:1020,lift:6},msEaseOut],[E3.up+.7,{...stand,x:1012}],
  [E3.grab2,{...stand,x:1005}],[E3.grab2+.5,{...bent,x:1000}],[E3.burst,{...bent,x:1000,lean:.2}],[E3.burst+.45,hang,msEaseOut],[E3.climb,hang],[E3.climb+.7,astride],[E3.slide,astride],[E3.slide+.3,slide],[E3.land,slide],
  [E3.land+.2,{...slide,crouch:.6,lean:.2,x:B[0]+20},msEaseOut],[E3.land+.6,proud],[14,proud]];
 const P=meTrack(keys,t);P.scale=S;
 let y=684;// the ground under her, unless she hangs, sits astride or slides
 if(t>=E3.burst&&t<E3.climb+.7){const u=msClamp((t-E3.climb)/.7);const yHang=Math.min(684,top+4.53*Hh);const yAst=top-4+.895*legLen;y=yHang+(yAst-yHang)*msEase(u);}
 else if(t>=E3.climb+.7&&t<E3.slide+.3){y=top-4+.895*legLen;}
 else if(t>=E3.slide+.3&&t<E3.land){const u=msEaseIn((t-E3.slide-.3)/(E3.land-E3.slide-.3));y=(top-4+.895*legLen)+(690-(top-4+.895*legLen))*u;}
 else if(t>=E3.land)y=684+6*msClamp(1-(t-E3.land)/.3);
 P.y=y;
 // pulling: the lean rocks back with each heave, the feet brace, the carrot top tilts
 let heave=0;if(t>1.4&&t<E3.pop){heave=.5+.5*meSin((t-1.4)*ME_TAU*1.3);P.lean-=heave*.35;P.hipL=.5+heave*.3;P.kneeL=.3;P.hipR=-.4;}
 if(t>E3.grab2+.5&&t<E3.burst){heave=.5+.5*meSin((t-E3.grab2-.5)*ME_TAU*1.8);P.lean-=heave*.45;P.hipL=.55+heave*.35;P.kneeL=.35;P.hipR=-.45;P.lift=heave*2;}
 if(t>=E3.burst+.45&&t<E3.climb){const k=meSin(t*7);P.hipL=.25+k*.4;P.hipR=-.15-k*.4;P.kneeL=.55+Math.max(0,k)*.4;P.kneeR=.45+Math.max(0,-k)*.4;P.lean=swB*2;}
 if(t>=E3.climb+.7&&t<E3.slide){P.lean=.05+swB*1.5;if(t>10.5&&t<11.5){P.shL=2.3+meSin((t-10.5)*ME_TAU*2.2)*.35;P.elL=.2;}}
 if(t>E3.up-.3&&t<E3.up+.3){// she rubs her hands
  P.shL=1.0+meSin(t*40)*.08;P.elL=.9;P.shR=1.0-meSin(t*40)*.08;P.elR=.9;}
 P.lean+=msSpring(t-E3.sit,.12,3,3)+msSpring(t-E3.land,.1,3,3);
 const hs=[msSpring(t-E3.pop,6,2.5,2.5)+msSpring(t-E3.burst,-5,2,2)+(burst?swB*30:0),msSpring(t-E3.sit,5,3,3)+msSpring(t-E3.land,5,3,3)];
 // the hands: on the carrot tops when pulling, on the leaves when hanging / astride, one on the carrot when proud
 let pose=P;const topA=[A[0],A[1]-6],topB=[B[0],B[1]-8];
 if(t>=1.4&&t<E3.pop)pose=meReach(rig,P,[topA[0]-4,topA[1]],[topA[0]+6,topA[1]+2],1,1);
 else if(t>=E3.grab2+.5&&t<E3.burst+.45){const k=msClamp((t-E3.burst)/.45);const T=[topB[0]-4,topB[1]-hB*k];pose=meReach(rig,P,[T[0]-2,T[1]],[T[0]+8,T[1]+2],1,1);if(k>0){const hg=meTrack([[0,{...P}],[1,{...P,shL:3.0,elL:-.05,shR:3.05,elR:-.05}]],k);if(k>.6)pose={...pose,shL:hg.shL,elL:hg.elL,shR:hg.shR,elR:hg.elR};}}
 else if(t>=E3.climb+.7&&t<E3.slide){const T=[B[0]-2,top-10];pose=meReach(rig,P,[T[0]-6,T[1]+2],[T[0]+8,T[1]+2],1,1);if(t>10.5&&t<11.5){pose.shL=P.shL;pose.elL=P.elL;}}
 else if(t>=E3.land+.6)pose=meReach(rig,P,[B[0]+26,top+60],null,1,1);
 if(t>=E3.sit&&t<E3.toss){// the tiny carrot held in front of her face
  pose=meReach(rig,P,[P.x-18,y-legLen*.6-Hh*1.9],null,1,1);}
 // ── the expression
 const blink=msBlink(t,2);let E={eyes:'open',mouth:'smile',brows:.3,blush:.4,look:[-.5,.4],blink};
 if(t>=1.4&&t<E3.pop)E={eyes:heave>.6?'closed':'open',mouth:heave>.6?'line':'grin',brows:-.5,blush:.6,look:[-.6,.6]};else if(t>=E3.pop&&t<E3.sit)E={eyes:'wide',mouth:'o',brows:1,blush:.5,look:[0,-.5]};
 else if(t>=E3.sit&&t<E3.toss)E={eyes:'open',mouth:'line',brows:-.6,blush:.4,look:[-.6,.5],blink:t>4.5&&t<4.62||t>4.75&&t<4.87?1:0};else if(t>=E3.toss&&t<E3.grab2)E={eyes:'open',mouth:'line',brows:.4,blush:.4,look:[-.3,.2],blink};
 else if(t>=E3.grab2&&t<E3.burst)E={eyes:heave>.5?'closed':'open',mouth:'line',brows:-.7,blush:.7,look:[-.5,.6]};else if(t>=E3.burst&&t<E3.climb)E={eyes:'wide',mouth:'open',brows:1,blush:.5,look:[0,.9]};
 else if(t>=E3.climb&&t<E3.slide)E={eyes:t>10.5&&t<11.5?'happy':'open',mouth:'grin',brows:.7,blush:.5,look:[0,.6],blink};else if(t>=E3.slide&&t<E3.land)E={eyes:'happy',mouth:'open',brows:.6,blush:.6,look:[0,.3]};
 else E={eyes:'happy',mouth:'grin',brows:.6,blush:.6,look:[.2,.1],blink};
 // ── the garden: the mound, the hole, the carrot tops, the giant carrot (behind her), the clumps of earth
 const earth=mpCol(MN_PAL.earth,L,.7);
 if(t<E3.pop)mnCarrotTops(c,A[0],A[1],14+heave*2,L,31,1);
 if(mound>0&&!burst){c.save();c.fillStyle=mpRgb(earth);c.beginPath();c.ellipse(B[0],B[1]+2,48*mound,18*mound,0,0,ME_TAU);c.fill();c.strokeStyle=mpRgb(mpDark(earth,.4),.8);c.lineWidth=1.2;for(let i=0;i<6;i++){const a=ME_PI+i/5*ME_PI;const r1=10*mound,r2=(30+(i%2)*14)*mound;c.beginPath();c.moveTo(B[0]+meCos(a)*r1,B[1]+2+meSin(a)*r1*.35);c.lineTo(B[0]+meCos(a)*r2,B[1]+2+meSin(a)*r2*.35);c.stroke();}c.restore();}
 if(burst){c.save();c.fillStyle=mpRgb(mpDark(earth,.45));c.beginPath();c.ellipse(B[0],B[1]+3,30,10,0,0,ME_TAU);c.fill();c.fillStyle=mpRgb(earth);c.beginPath();c.ellipse(B[0]-36,B[1]+8,16,6,0,0,ME_TAU);c.ellipse(B[0]+38,B[1]+6,14,5,0,0,ME_TAU);c.fill();c.restore();}
 if(!burst)mnCarrotTops(c,B[0],B[1]-mound*10,16+mound*8+heave*2,L,32,1);
 if(burst)mePastanaga(c,B[0],B[1]+2,hB,{sw:swB,lw:1.1,crown:1});
 if(burst){const r=mpRng(44);for(let i=0;i<10;i++){const vx=(r()-.5)*220,vy=-(120+r()*200),rot=r()*6;const age=t-E3.burst;const fall=(-vy+Math.sqrt(vy*vy+2*900*(r()*20)))/900;if(age>fall+1.2)continue;const a=Math.min(age,fall);const x=B[0]+vx*a,yy=B[1]+vy*a+450*a*a;c.save();c.globalAlpha=age>fall?1-(age-fall)/1.2:1;c.fillStyle=mpRgb(mpDark(earth,.2));c.translate(x,yy);c.rotate(rot+age*5);c.beginPath();c.ellipse(0,0,5+r()*3,3.5,0,0,ME_TAU);c.fill();c.restore();}
  mfDust(c,B[0],B[1]+2,t,E3.burst,2.2,mpLight(earth,.2));mfDust(c,B[0]-20,B[1]+6,t,E3.burst+.15,1.6,mpLight(earth,.2));}
 // ── the tiny carrot: popping out, in her hand, tossed, on the ground by the hens
 let tiny=null;if(t>=E3.pop&&t<E3.toss+.25){tiny='hand';}else if(t>=E3.toss+.25&&t<6.0){const [x,yy,a]=meArc(1030,600,1140,598,E3.toss+.25,6.0,t,600);mePastanaga(c,x,yy,14,{sw:a+1.2,lw:1,crown:1.3});}else if(t>=6.0){mePastanaga(c,1140,600,14,{sw:1.4,lw:1,crown:1.3});}
 // ── the hens: behind the fence, scattering at the burst, coming to look; in the variant on the leaves
 for(let i=0;i<3;i++){const bx=1120+i*34,by=588+(i%2)*8;let hx=bx,hy=by,f=-1,flap=0,step=Math.abs(meSin(t*3+i*2.1)),peck=i===1&&t>6.3&&t<6.9?Math.abs(meSin((t-6.3)*ME_TAU*2.5)):0;
  if(v&&t>=E3.grab2){// perched on the leaves, lifted with the carrot, fluttering down at the end
   const lx=B[0]+(i-1)*24,ly=(burst?top-10:B[1]-mound*10-14);const d=12.0+i*.35;if(t<d){hx=lx;hy=ly;f=i===1?1:-1;flap=burst&&t<E3.burst+.9?1:.2+.2*meSin(t*6+i);step=0;}
   else if(t<d+.8){const [x,yy]=meArc(lx,ly,900+i*30,730,d,d+.8,t,300);hx=x;hy=yy;flap=1;f=i===1?1:-1;}else{hx=900+i*30;hy=730;flap=0;f=i===1?1:-1;}}
  else{if(t>=E3.burst&&t<8.6){const u=msEaseOut((t-E3.burst)/1.2);hx=bx+90*u;f=1;flap=1;step=Math.abs(meSin(t*12+i));}else if(t>=8.6&&t<10.5){hx=bx+90;f=-1;}
   else if(t>=10.5&&t<11.5){const u=msEase((t-10.5)/1);hx=bx+90+((905+i*26)-(bx+90))*u;hy=by+((728)-by)*u;f=-1;}else if(t>=11.5){hx=905+i*26;hy=728;f=-1;if(t>E3.land&&t<E3.land+.8){hx+=40*msEaseOut((t-E3.land)/.8);flap=1;f=1;}}}
  mcDrawHen(c,{x:hx,y:hy,facing:f,peck,step,flap,col:ME_HENS[i],scale:.75},{lw:.9});}
 // ── Nina
 const J=meHuman(c,'nina',pose,E,{lw,L,hairSpring:hs,shadow:!(t>=E3.burst+.45&&t<E3.land)});
 if(t>=E3.burst+.45&&t<E3.land)mpGroundShadow(c,pose.x,686,Hh*.6,Hh*.12,L,.22,3);
 if(tiny==='hand'){const a=meHandAngle(J,true);mePastanaga(c,J.hdL[0]+meCos(a)*4,J.hdL[1]+meSin(a)*4+6,14,{sw:a+.3,lw:1,crown:1.3});}
 mfDust(c,1046,688,t,E3.sit,1.3);mfDust(c,B[0]+20,688,t,E3.land,1.4);mfStars(c,1046,620,t,E3.sit,4,.9);
 mfSweat(c,J.head[0]-R*.9,J.head[1]-R*.3,t,2.6,-1);mfSweat(c,J.head[0]-R*.9,J.head[1]-R*.3,t,6.8,-1);mfSweat(c,J.head[0]+R*.9,J.head[1]-R*.2,t,7.2,1);
 if(t>=E3.up&&t<E3.up+.3)for(let i=0;i<2;i++){c.fillStyle='rgba(190,225,250,.8)';c.beginPath();c.ellipse(J.hdL[0]-4+i*8,J.hdL[1]-10-(t-E3.up)*30,1.8,2.6,0,0,ME_TAU);c.fill();}
 mfSwallows(c,ctx.t,2,13,{x0:720,x1:1200,y0:450,y1:520,scale:.6});}
// ── E4 · Vent a l'estenedor ───────────────────────────────────────────────────────────────────────────────────────────────────────
// Pol, on tiptoe, pins the washing. A gust takes his cap; a bigger one lifts the sheet with him hanging from it. He floats over the
// yard and lands in the haystack, legs out; he pops up with hay in his hair and the cap on backwards. The sheet floats down and
// covers the sleeping grandfather, who snores on under it like a ghost. Variant: it covers the goat, who walks about as a ghost.
const E4={slip:1.0,fix:1.4,gust1:2.6,cap:2.7,gust2:4.5,pins:4.6,lift:4.7,land:8.6,up:9.5,top:10.3,drape:10.5};
function meSheetPoly(c,pts,L,o={}){const {lw=1.1,alpha=1}=o;mcShape(c,pts,[248,247,240],{lw,alpha,shade:[[pts[0][0]-10,pts[0][1]-10],[pts[0][0]+8,pts[0][1]-10],[pts[3][0]+6,pts[3][1]+10],[pts[3][0]-30,pts[3][1]+10]],shadeK:.12});}
function mePol(c,w,h,t,ctx){const picks=ctx.picks||[];const v=(ctx.variant|0)&&!picks.includes('cabra')?1:0;
 const base=mpCam(w,h,ME_CAM.pol.x,ME_CAM.pol.y,ME_CAM.pol.z);const cz=msTrack([[4.5,2.3],[6.5,1.5]],t),cx=msTrack([[4.5,595],[6.5,450]],t),cy=msTrack([[4.5,460],[6.5,500]],t);const cam=mpCam(w,h,cx,cy,cz);
 const L=meSet('pol',c,w,h,ctx,cam,{base});c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);
 const lw=1.0,S=.9,ch=MC_CHARS.pol,rig=ch.rig,Hh=rig.H*S,R=Hh*.5,sp=MD.spots.pol,ln=MD.line,hay=MD.haystack;
 const W=mfWind(t,.25,[[E4.gust1,.9,1.4],[E4.gust2,1.7,2.6],[9.5,.5,2]]);
 // ── the others in the frame: the grandfather asleep (or the goat) under the sheet later, the goat watching, the cat, the swing
 meWashing(c,L,t,W,true);const f=MD.fig;mdSwing(c,f.swing.x,f.swing.y,f.swing.len,meSin(t*.9)*.05+W*.12,L);
 mcDrawCat(c,{x:MD.bench.x,y:MD.bench.y-20,facing:-1,state:'sleep',scale:.7,tail:t*1.3,ear:Math.max(0,meSin(t*.7))*2},{lw:1.2});
 const polX=msTrack([[E4.lift,sp[0]],[5.6,590],[7.0,380],[8.2,200],[E4.land,hay.x]],t),polY=msTrack([[E4.lift,sp[1]],[5.3,430],[5.6,400],[7.0,372],[8.2,418],[E4.land,445]],t);
 const flying=t>=E4.lift&&t<E4.land;
 // the goat: watching him fly (in the variant she grazes near the haystack and gets the sheet)
 if(!picks.includes('cabra')){const gx=v?msTrack([[0,MD.spots.cabra[0]],[3.0,300]],t):MD.spots.cabra[0],gy=v?msTrack([[0,MD.spots.cabra[1]],[3.0,562]],t):MD.spots.cabra[1];const toward=polX<gx?-1:1;const up=flying?msClamp((gy-polY)/200):0;
  const walk=v&&t<3.0?meSin(t*8):0;const ghostWalk=v&&t>=11&&t<14?meSin(t*7):0;const gxx=v&&t>=11?msTrack([[11,300],[14,420]],t):gx;
  if(!(v&&t>=E4.drape))mcDrawGoat(c,{x:gxx,y:gy,facing:flying?toward:1,neck:up*.7,head:-up*.6,chew:flying?0:(meSin(t*5)*.5+.5),ears:Math.max(0,meSin(t*2.7))*.6+up*.5,legs:[walk*.4,-walk*.4,-walk*.4,walk*.4],tail:meSin(t*6)*.5+.5,eyes:'open',mouth:flying&&up>.5?'open':'smile',scale:.9,bob:-Math.abs(walk)*2},{lw:1.1,L});
  else{// the ghost goat: the sheet over her, the legs and the bell below, walking
   const gy2=gy-Math.abs(ghostWalk)*2;c.save();for(let i=0;i<4;i++){const lx=gxx+(i<2?18:-16)*.9+(i%2?-6:6),a=(i%2?1:-1)*ghostWalk*.4;mcLimb(c,[lx,gy2-20],[lx+meSin(a)*14,gy2-6],7,5.5,[246,242,232],{lw});mcEllipse(c,lx+meSin(a)*14,gy2-4,4,2.6,0,[70,60,60],{lw});}
   const pts=mpSmooth([[gxx-38,gy2-14],[gxx-34,gy2-44],[gxx-10,gy2-58],[gxx+20,gy2-62],[gxx+40,gy2-44],[gxx+44,gy2-14],[gxx+30,gy2-10],[gxx+10,gy2-16],[gxx-12,gy2-9],[gxx-28,gy2-16]],2,true);meSheetPoly(c,pts,L,{lw});
   mcDot(c,gxx+24+meSin(t*9)*2,gy2-18,3.4,[230,190,80],{lw:lw*.9});for(const s of [-1,1])mcDot(c,gxx+16+s*7,gy2-44,2.6,[40,30,30]);c.restore();}}
 // the grandfather, asleep on his stool (the sheet drapes over him in the plain version)
 // 0.44.3 (Marc): the sheet comes down open onto his head and then slides down over him from the top (it used to rise from the ground)
 const draped=!v&&t>=E4.drape;const avi=MD.spots.avi;
 const drawAvi=()=>{meCharacter(c,'avi',L,ctx.t,0,{lw:1.1,picked:picks.includes('avi'),wind:W});
  if(draped){const x=avi[0]+13;const k=msEase(msClamp((t-E4.drape)/.7));const yt=avi[1]-130,yb=yt+34+(avi[1]+4-yt-34)*k;const sn=meSin(ctx.t*1.9)*3*k;const wf=1+.45*(1-k);const fl=meSin(t*9)*5*(1-k);
   const pts=mpSmooth([[x-36*wf,yb+fl],[x-34*(1+.2*(1-k)),yt+52*k+14],[x-16,yt+10+sn],[x+12,yt+sn],[x+36*(1+.2*(1-k)),yt+40*k+12],[x+40*wf,yb-fl],[x+22*wf,yb-6],[x+6,yb+2+fl*.5],[x-10*wf,yb-5],[x-24*wf,yb+3]],2,true);meSheetPoly(c,pts,L,{lw});
   if(k>=.98){for(const s of [-1,1])mcDot(c,x-2+s*8,yt+30,2.8,[40,30,30]);mfSnore(c,x+16,yt+22,ctx.t,1,1);}}};
 drawAvi();
 // ── Pol: the key poses
 const stand={lean:.08,crouch:0,lift:4,headTilt:-.2,shL:2.7,elL:.1,shR:2.5,elR:.2,hipL:.06,kneeL:0,hipR:-.06,kneeR:0,facing:1,x:sp[0]};
 const hang={...stand,lift:0,lean:.1,headTilt:-.1,shL:2.9,elL:-.1,shR:2.9,elR:-.1,hipL:.3,kneeL:.6,hipR:-.2,kneeR:.5};
 const inHay={...stand,lift:0,headTilt:.1,shL:.6,elL:1.2,shR:.5,elR:1.2,x:hay.x};const sit={...stand,lift:0,lean:.05,headTilt:0,crouch:1,hipL:.8,kneeL:-.4,hipR:.75,kneeR:-.45,shL:.4,elL:.6,shR:.3,elR:.5,x:hay.x+6};
 const keys=[[0,stand],[E4.lift,{...stand,lift:2}],[E4.lift+.4,hang,msEaseOut],[E4.land,{...hang,x:hay.x}],[E4.up,inHay],[E4.top,inHay],[E4.top+.25,{...inHay,lift:30,shL:1.2,elL:.4,shR:1.0,elR:.4},msEaseOut],[E4.top+.5,sit,msEaseIn],[14,sit]];
 let P=meTrack(keys,t);P.scale=S;
 if(t<E4.lift){P.lift=4+Math.max(0,meSin(t*ME_TAU*1.1))*10;if(t>E4.gust1)P.lean=-.18*msClamp((t-E4.gust1)/.3);}
 if(flying){const k=meSin(t*8);P.hipL=.3+k*.45;P.hipR=-.2-k*.45;P.kneeL=.6+Math.max(0,k)*.4;P.kneeR=.5+Math.max(0,-k)*.4;}
 if(t>=11&&t<13){P.lean+=meSin((t-11)*ME_TAU*2)*.12;P.headTilt+=meSin((t-11)*ME_TAU*2)*.1;}if(t>=E4.top+.5){const k=meSin(t*5);P.hipL=.8+k*.15;P.kneeL=-.4+Math.max(0,k)*.5;P.hipR=.75-k*.15;P.kneeR=-.45+Math.max(0,-k)*.5;}
 if(flying){P.x=polX;P.y=polY;}else if(t<E4.lift){P.y=sp[1];}else if(t<E4.up){P.y=hay.y-hay.h+60;}else if(t<E4.top){P.y=msTrack([[E4.up,hay.y-hay.h+60],[E4.up+.5,hay.y-hay.h+42]],t);}else P.y=hay.y-hay.h+6;
 // the cap: on his head (slipping), flying to the haystack, on the haystack, on his head backwards
 const slip=msTrack([[E4.slip,0],[E4.slip+.2,1],[E4.fix+.3,1],[E4.fix+.5,0]],t);
 // the hands: on the line, on the cap, on the sheet's corners
 const sheetOnLine=t<E4.pins;const sx=ln.x0+(ln.x1-ln.x0)*.14,sy=ln.y0+(ln.y1-ln.y0)*.14+10*4*.14*.86,sw=30,sh=46;const sway=W*14*(1+.3*meSin(t*3)),flap=meSin(t*5)*W*6;
 const cornerL=[sx-sw/2+3+sway,sy+sh],cornerR=[sx+sw/2+6+sway+flap,sy+sh];
 if(t<E4.lift){if(t>=E4.fix&&t<E4.fix+.5){const J0=mcSolve(rig,P);P=meReach(rig,P,[J0.head[0]+R*.6,J0.head[1]-R*1.2],[cornerR[0]-4,cornerR[1]],1,1);}
  else if(t<E4.cap)P=meReach(rig,P,[cornerL[0]+4,cornerL[1]-2],[cornerR[0]-4,cornerR[1]],1,1);else P=meReach(rig,P,[cornerL[0]+2,cornerL[1]+2],[cornerR[0]-2,cornerR[1]+2],1,1);}
 const hs=[-W*10+msSpring(t-E4.gust1,-5,2.5,2)+msSpring(t-E4.land,4,3,3),msSpring(t-E4.land,5,3,3)];
 const blink=msBlink(t,3);let E={eyes:'open',mouth:'o',brows:.3,blush:.5,look:[.2,-.8],blink};
 if(slip>.4)E={eyes:'closed',mouth:'line',brows:.2,blush:.5};else if(t>=E4.gust1&&t<E4.lift)E={eyes:'wide',mouth:'open',brows:.9,blush:.5,look:[-.6,-.4]};else if(flying)E={eyes:'wide',mouth:'open',brows:1,blush:.6,look:[0,1]};
 else if(t>=E4.land&&t<E4.up)E={eyes:'closed',mouth:'o',brows:0,blush:.5};else if(t>=E4.up&&t<E4.top)E={eyes:'sleepy',mouth:'o',brows:.2,blush:.6,look:[.3,0]};else E={eyes:'happy',mouth:'grin',brows:.6,blush:.6,look:[.2,.2],blink};
 // ── the sheet: on the line, flying with him, floating down, draped
 const pinA=[sx-sw/2+3,sy-1],pinB=[sx+sw/2-3,sy-1];
 if(sheetOnLine){const pts=[[sx-sw/2,sy],[sx+sw/2,sy],cornerR,cornerL];meSheetPoly(c,pts,L,{lw});c.fillStyle='rgba(180,140,90,1)';c.fillRect(pinA[0]-1.5,pinA[1]-3,3,7);c.fillRect(pinB[0]-1.5,pinB[1]-3,3,7);}
 else{for(const [i,pin] of [pinA,pinB].entries()){const age=t-E4.pins;if(age<1.2){const x=pin[0]+(i?40:-30)*age,y=pin[1]-60*age+300*age*age;c.save();c.translate(x,y);c.rotate(age*9);c.fillStyle='rgba(180,140,90,1)';c.fillRect(-1.5,-4,3,8);c.restore();}}}
 // Pol, in the frame order: behind the haystack while inside it, in front once on top
 const drawPol=()=>{c.save();if(flying){const rot=msTrack([[E4.lift,0],[5.6,-.45],[7.0,-.3],[8.2,-.1],[E4.land,0]],t);c.translate(P.x,P.y-40);c.rotate(rot);c.translate(-P.x,-P.y+40);}
  const J=meHuman(c,'pol',P,E,{lw,L,hairSpring:hs,shadow:!flying&&t<E4.land,costume:{...ch.costume,cap:null}});
  if(t<E4.cap)meGorra(c,J.head[0]+hs[0]*.2,J.head[1]-R*.45+slip*R*.55,slip*.2,1,{lw,R,back:false});
  if(t>=E4.up){meGorra(c,J.head[0]+hs[0]*.2,J.head[1]-R*.5,-.08,1,{lw,R,back:true});c.save();c.strokeStyle=mpRgb([226,190,96]);c.lineWidth=1.3;c.lineCap='round';for(let i=0;i<9;i++){const a=i*.8;c.beginPath();c.moveTo(J.head[0]+meCos(a)*9,J.head[1]-16+meSin(a)*4);c.lineTo(J.head[0]+meCos(a)*17,J.head[1]-22+meSin(a)*8);c.stroke();}c.restore();}
  if(t>=12.4&&t<14){// he points at the ghost
   const tx=v?330:avi[0];const Jp=meReach(rig,P,[P.x+(tx<P.x?-1:1)*40,P.y-70],null,1,1);}
  c.restore();return J;};
 let J=null;if(t<E4.land||t>=E4.top)J=drawPol();
 if(t>=E4.land&&t<E4.top){// inside the haystack: him behind, the haystack over, the legs out of the top
  if(t>=E4.up)J=drawPol();c.save();c.beginPath();c.rect(hay.x-hay.w*.62,hay.y-hay.h-14,hay.w*1.24,hay.h+16);c.clip();mnHaystack(c,hay.x,hay.y,hay.w,hay.h,L,177);c.restore();drawAvi();
  if(t<E4.up){const k=meSin(t*9);for(const s of [-1,1]){const a=s*.35*k-.1*s;const kx=hay.x+s*9,ky=hay.y-hay.h+8;const fx=kx+meSin(a)*22,fy=ky-meCos(a)*22;mcLimb(c,[kx,ky],[fx,fy],8,6.5,ch.costume.skin,{lw});mcEllipse(c,fx,fy-4,7,4.5,0,ch.costume.shoes.col,{lw});}}}
 if(t>=E4.land)mfDust(c,hay.x,hay.y-hay.h+6,t,E4.land,2,[226,196,110]);
 if(t>=E4.land&&t<E4.land+1.2){const r=mpRng(51);for(let i=0;i<10;i++){const age=t-E4.land;const vx=(r()-.5)*160,vy=-(60+r()*120);const x=hay.x+vx*age,y=hay.y-hay.h+vy*age+300*age*age;c.save();c.globalAlpha=1-age/1.2;c.strokeStyle=mpRgb([230,200,110]);c.lineWidth=1.4;c.translate(x,y);c.rotate(r()*6+age*4);c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.stroke();c.restore();}}
 // the cap flying and on the haystack
 if(t>=E4.cap&&t<E4.up){if(t<3.6){const [x,y,a]=meArc(sp[0]+4,sp[1]-Hh*3.2,hay.x+10,hay.y-hay.h+2,E4.cap,3.6,t,260);meGorra(c,x,y,(t-E4.cap)*7,1,{lw,R});}else if(t<E4.land)meGorra(c,hay.x+10,hay.y-hay.h+2,.35,1,{lw,R});}
 // the sheet in the air: from his hands, then free, then draped
 if(t>=E4.pins&&J&&t<E4.land){const hl=[J.hdL[0],J.hdL[1]],hr=[J.hdR[0],J.hdR[1]];const bil=W*40;const fl=meSin(t*9)*8,fl2=meSin(t*7+1)*8;
  const bl=[hl[0]-14,hl[1]+2],br=[hr[0]+14,hr[1]+2];const top1=[hl[0]-74-bil*.6,hl[1]-112+fl],top2=[hr[0]+70-bil*.6,hr[1]-122+fl2];const mid=[(top1[0]+top2[0])/2-bil*.3,(top1[1]+top2[1])/2-34];
  const pts=mpSmooth([bl,[bl[0]-24-bil*.3,bl[1]-56],top1,mid,top2,[br[0]+22-bil*.3,br[1]-60],br,[(bl[0]+br[0])/2,(bl[1]+br[1])/2+8]],2,true);meSheetPoly(c,pts,L,{lw});}
 if(t>=E4.land&&t<E4.drape){const u=msClamp((t-E4.land)/(E4.drape-E4.land));const tx=v?300:avi[0]+13,ty=v?480:avi[1]-118;const x=msTrack([[E4.land,hay.x+40],[9.3,300],[10.0,tx+30],[E4.drape,tx]],t),y=msTrack([[E4.land,hay.y-hay.h-50],[9.3,380],[10.0,ty-40],[E4.drape,ty]],t);
  const open=msEase(msClamp((t-9.9)/(E4.drape-9.9)));const rot=meSin(u*ME_PI*3)*.3*(1-open);c.save();c.translate(x,y);c.rotate(rot);c.scale(1+.25*open,1-.35*open);const fl=meSin(t*6)*8*(1-.6*open);
  const pts=mpSmooth([[-40,-20+fl],[0,-34],[42,-16-fl],[36,20+fl*.5],[-2,30],[-44,18]],2,true);meSheetPoly(c,pts,L,{lw});c.restore();}
 mfSwallows(c,ctx.t,4,14,{x0:60,x1:860,y0:250,y1:380,scale:.8});}
// ── E5 · La pluja de figues ───────────────────────────────────────────────────────────────────────────────────────────────────────
// Nata the goat wants the figs. She rears, cannot reach, backs up, paws the ground and charges: BONK against the trunk. The tree
// shakes and it rains figs; one lands between her horns, one falls straight into her mouth. A sun shower comes; she shakes herself
// dry; a rainbow appears. She trots to the swing, hops on and swings. Variant: a hen asleep in the crown falls onto her back and rides.
const E5={reach:1.0,back:2.0,backEnd:3.2,charge:3.5,bonk:3.85,figs:4.1,hat:5.0,bite:5.9,cloud:6.8,rain:7.3,shake:8.5,rainEnd:9.4,bow:9.5,trot:11.0,hop:11.8,swing:12.3};
function meGoatWalk(ph,amp=.5){const s=meSin(ph);return {legs:[amp*s,-amp*s,-amp*s,amp*s],bob:-Math.abs(s)*2.5*amp*2};}
function meCabra(c,w,h,t,ctx){const picks=ctx.picks||[];const v=ctx.variant|0;const cam=mpCam(w,h,ME_CAM.cabra.x,ME_CAM.cabra.y,ME_CAM.cabra.z);const n=picks.length;
 const L=meSet('cabra',c,w,h,ctx,cam,{fig:false,key:'nofig'});const f=MD.fig;const bare=meBare(ctx);
 // the tree on its own sheet, shaken by the bonk (a spring about the base of the trunk), swaying a little in the wind
 const shake=msSpring(t-E5.bonk,.05,2.4,1.6)+meSin(t*.8)*.005;
 if(!bare){const tree=meThingSheet(c,w,h,ctx,`fig|${n}`,cam,x=>mdFig(x,L,{swing:false}));if(tree){c.save();c.setTransform(1,0,0,1,0,0);const bx=f.x*cam.k+cam.ox,by=f.y*cam.k+cam.oy;c.translate(bx,by);c.rotate(shake);c.translate(-bx,-by);c.drawImage(tree,0,0);c.restore();}}
 c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);
 // the light of the shower: a cloud shadow comes and goes
 const cloud=msTrack([[E5.cloud,0],[E5.rain,1],[9.1,1],[E5.rainEnd+.2,0]],t);const rain=msTrack([[E5.rain,0],[8.0,1],[9.0,1],[E5.rainEnd,0]],t);
 // the swing hangs from the shaken branch
 const sa=[f.swing.x,f.swing.y];const rot=p=>{const dx=p[0]-f.x,dy=p[1]-f.y;return [f.x+dx*meCos(shake)-dy*meSin(shake),f.y+dx*meSin(shake)+dy*meCos(shake)];};const anc=rot(sa);
 const swAng=t<E5.swing?meSin(t*.9)*.04+shake*2:meSin((t-E5.swing)*ME_TAU*.55)*(.05+.22*msClamp((t-E5.swing)/1.5));
 mdSwing(c,anc[0],anc[1],f.swing.len,swAng,L);const seat=[anc[0]+meSin(swAng)*f.swing.len,anc[1]+meCos(swAng)*f.swing.len];
 // the others in the frame: Pol at the line, the washing, the cat
 const W=mfWind(t,.2);meWashing(c,L,ctx.t,W,picks.includes('pol'));meCharacter(c,'pol',L,ctx.t,0,{lw:1.0,picked:picks.includes('pol'),wind:W});
 mcDrawCat(c,{x:MD.bench.x,y:MD.bench.y-20,facing:-1,state:t>E5.bonk&&t<E5.bonk+3?'sit':'sleep',eyes:t>E5.bonk?'open':'closed',scale:.7,tail:t*1.3,ear:Math.max(0,meSin(t*.7))*2},{lw:1.1});
 // ── the goat: position, gait and pose
 const gx=msTrack([[0,530],[E5.back,530],[E5.backEnd,400],[E5.charge,400],[E5.bonk,492,msEaseIn],[E5.bonk+.5,470,msEaseOut],[E5.trot,470],[E5.hop,604],[E5.swing,seat[0]-4]],t);
 let pose={x:gx,y:546,facing:1,rear:0,neck:0,head:0,legs:[.1,-.1,.1,-.15],tail:meSin(t*6)*.5+.5,chew:0,ears:Math.max(0,meSin(t*2.7))*.6,eyes:'open',mouth:'smile',scale:.9,bob:0};
 const S=.9;let squash=1;
 if(t<E5.reach){pose.neck=.6*msClamp(t/.6);pose.head=-.5*msClamp(t/.6);pose.ears=.6;}
 else if(t<E5.back){const u=msClamp((t-E5.reach)/.3);const d=msClamp((t-1.6)/.3);const r=.65*msEase(u)*(1-msEase(d));pose.rear=r;pose.neck=.6;pose.head=-.5;pose.legs=[-.8*r,-1.0*r,.2*r,.1*r];pose.mouth=r>.4?'open':'smile';pose.ears=.6+r*.4;if(t>1.6){pose.head+=meSin((t-1.6)*ME_TAU*5)*.3*(1-d);pose.ears=Math.max(0,meSin((t-1.6)*ME_TAU*5))*.9;}}
 else if(t<E5.backEnd){const wk=meGoatWalk(-(t-E5.back)*ME_TAU*1.6,.5);pose.legs=wk.legs;pose.bob=wk.bob;pose.neck=.3;pose.head=-.1;}
 else if(t<E5.charge){const k=meSin((t-E5.backEnd)*ME_TAU*3);pose.legs=[Math.min(0,-.6+k*.6),-.2,.1,-.1];pose.neck=-.3;pose.head=.5;pose.ears=0;if(k>0)mfDust(c,gx+34,548,t,E5.backEnd+Math.floor((t-E5.backEnd)*3)/3,.5);}
 else if(t<E5.bonk){const wk=meGoatWalk((t-E5.charge)*ME_TAU*6,1);pose.legs=wk.legs;pose.bob=wk.bob*.6;pose.neck=-.25;pose.head=.35;pose.ears=0;pose.mouth='open';mfSpeed(c,gx-40,520,-1,0,t,1,36);}
 else if(t<E5.bonk+.6){const u=(t-E5.bonk)/.6;squash=1-.2*Math.max(0,meSin(u*ME_PI*2.2))*(1-u);pose.neck=-.1;pose.head=meSin(t*11)*.4*(1-u);pose.eyes=u<.7?'closed':'open';pose.ears=.9;pose.legs=[.3,-.3,.3,-.2];}
 else if(t<E5.rain){pose.neck=.1;pose.head=-.1;if(t>5.4&&t<6.3){pose.neck=.7;pose.head=-.7;pose.mouth=t<6.05?'open':'smile';}if(t>=6.05&&t<7.1){pose.chew=.5+.5*meSin((t-6.05)*ME_TAU*3);pose.eyes='closed';}}
 else if(t<E5.shake){pose.neck=.5*rain;pose.head=-.5*rain;pose.ears=0;pose.eyes=rain>.6?'closed':'open';pose.mouth='line';}
 else if(t<E5.shake+.8){pose.neck=.1;pose.ears=Math.abs(meSin(t*40));}
 else if(t<E5.trot){pose.neck=.5*msClamp((t-E5.bow)/.5);pose.head=-.6*msClamp((t-E5.bow)/.5);pose.mouth=t>E5.bow+.5?'open':'smile';pose.ears=.7;}
 else if(t<E5.hop){const wk=meGoatWalk((t-E5.trot)*ME_TAU*1.8,.6);pose.legs=wk.legs;pose.bob=wk.bob;pose.neck=.2;pose.head=-.2;}
 else if(t<E5.swing){const u=(t-E5.hop)/(E5.swing-E5.hop);const arc=-meSin(u*ME_PI)*40;pose.y=546+(seat[1]-2-546)*msEase(u)+arc;pose.scale=.9+(.72-.9)*u;pose.legs=[.9*u,.9*u,-.6*u,-.6*u];pose.neck=.3;pose.head=-.2;pose.ears=.6;}
 else{pose.y=seat[1]-2;pose.scale=.72;pose.legs=[.9,.9,-.6,-.6];pose.neck=.2;pose.head=-.2+swAng*.5;pose.ears=.5+Math.abs(meCos((t-E5.swing)*ME_TAU*.55))*.5;pose.mouth='open';pose.eyes='happy'===pose.eyes?'open':'open';pose.tail=meSin(t*5);}
 const bell=msSpring(t-E5.bonk,5,5,3)+msSpring(t-E5.shake,3,8,2)+(t>=E5.swing?-meCos((t-E5.swing)*ME_TAU*.55)*3:0);
 // ── the figs raining, the leaves, the one in her mouth, the one on her head
 if(t>=E5.figs){mfLeaves(c,f.x-f.rx,f.y-f.h*.62-f.ry,f.rx*2,f.ry*2+120,t-E5.figs,msClamp(1-(t-E5.figs)/3),17,L);mfFigs(c,f.x-8,f.y-f.h*.62-f.ry*.3,f.rx*.9,f.ry*.8,546,t,E5.figs,14,19,L,{size:.85});}
 // the goat, squashed at the bonk
 c.save();if(squash<1){c.translate(gx+40,546);c.scale(squash,1/squash);c.translate(-gx-40,-546);}
 if(t>=E5.shake&&t<E5.shake+.7){const a=meSin((t-E5.shake)*ME_TAU*12)*.1*(1-(t-E5.shake)/.7);c.translate(gx,520);c.rotate(a);c.translate(-gx,-520);}
 mcDrawGoat(c,pose,{lw:1.0/(pose.scale/.9),L,hairSpring:[bell,0]});
 // the head top (approximate) for the fig hat and the hen
 const nAng=1+pose.neck;const sc=pose.scale/.9;const headC=[pose.x+(24+meCos(nAng)*14+6)*sc,pose.y-36+pose.bob-7-meSin(nAng)*17*sc-8*sc];
 if(t>=E5.hat&&t<E5.trot){c.save();c.translate(headC[0]-4*sc,headC[1]-14*sc);c.rotate(pose.head*.6);c.fillStyle=mpRgb([96,60,110]);c.beginPath();c.ellipse(0,0,5,6,0,0,ME_TAU);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(-1.6,-2,1.6,0,ME_TAU);c.fill();c.strokeStyle='rgba(60,80,40,1)';c.lineWidth=1;c.beginPath();c.moveTo(0,-6);c.lineTo(1,-9);c.stroke();c.restore();}
 if(t>=E5.hat-.6&&t<E5.hat){const u=(t-E5.hat+.6)/.6;const y0=f.y-f.h*.62-20;c.fillStyle=mpRgb([96,60,110]);c.beginPath();c.ellipse(headC[0]-4*sc,y0+(headC[1]-14-y0)*u*u,5,6,0,0,ME_TAU);c.fill();}
 if(t>=E5.bite-.7&&t<E5.bite+.1){const u=(t-E5.bite+.7)/.7;const mouth=[headC[0]+16,headC[1]-6];const y0=f.y-f.h*.62-10;c.fillStyle=mpRgb([96,60,110]);c.beginPath();c.ellipse(mouth[0]+6*(1-u),y0+(mouth[1]-y0)*u*u,5,6,0,0,ME_TAU);c.fill();}
 c.restore();
 mfStars(c,gx+56,506,t,E5.bonk,6,1.1);if(t>=E5.bonk&&t<E5.bonk+.4)mfDust(c,gx+30,548,t,E5.bonk,1.2);
 // the variant: the hen falls from the crown onto her back and rides her
 if(v){const d=E5.bonk+.45;if(t>=d&&t<4.9){const [x,y]=meArc(600,330,gx-6,510,d,4.9,t,260);mcDrawHen(c,{x,y,facing:-1,flap:1,step:Math.abs(meSin(t*20)),col:ME_HENS[1],scale:.7},{lw:.9});}
  else if(t>=4.9){const flap=t>E5.shake&&t<E5.shake+.8?1:t>=E5.hop?.6:.1+.1*meSin(t*7);mcDrawHen(c,{x:pose.x-8*sc,y:pose.y-36*sc+pose.bob+2,facing:-1,flap,step:0,col:ME_HENS[1],scale:.7*sc},{lw:.9});}}
 // ── the shower: the drops, the splashes on the ground, the goat's shake, the cloud light, the rainbow
 if(t>=E5.shake&&t<E5.shake+.7){for(let i=0;i<6;i++){const a=i/6*ME_TAU;mfWater(c,gx+meCos(a)*24,520+meSin(a)*12,meCos(a)*1.4,meSin(a)*.6-.4,t,1-(t-E5.shake)/.7,60+i);}}
 if(rain>0){mfRain(c,250,260,600,380,t,rain,5,L);const r=mpRng(23);for(let i=0;i<16;i++){const ph=r(),x=270+r()*590,y=530+r()*90;const u=((t*2.2+ph)%1);c.fillStyle=`rgba(255,255,255,${.5*rain*(1-u)})`;c.beginPath();c.ellipse(x,y,3+u*6,1+u*2,0,0,ME_TAU);c.fill();}}
 if(cloud>0)mpTone(c,mpRect(230,250,680,400),[120,130,170],.16*cloud,'multiply');
 const bowA=msTrack([[E5.bow,0],[10.5,.55]],t);if(bowA>0){c.save();c.globalAlpha=1;mfRainbow(c,560,600,330,bowA,26);c.restore();}
 mfSwallows(c,ctx.t,3,15,{x0:260,x1:860,y0:255,y1:330,scale:.7});}
// ── El sopar a la fresca ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// Dusk. A table under the fig tree with lanterns. The grandmother brings the omelette; the children run in; the grandfather walks
// in, the carp still on his hat (it flops into the jug). They sit, the goat arrives, they toast and eat; the goat pulls the
// tablecloth; night falls with stars and fireflies, the lanterns glow. 20 s.
const ES={plate:3.0,sitN:3.6,sitP:4.0,sitA:5.0,sitAv:5.5,goat:5.5,carp:7.0,cat:7.5,toast:9.0,clink:10.4,drink:10.6,eat:12,pull:14,night:16};
const ES_T={x0:590,x1:770,y:586,front:602};
function meTaula(c,L,o={}){const T=ES_T;const {pull=0,lw=1.1}=o;const cloth=[250,248,240];
 // the trestles, the top, the cloth hanging in front (the front-left corner pulled towards the goat)
 for(const x of [T.x0+22,T.x1-22]){mnPlanks(c,mpRect(x-5,T.y+10,10,52),MN_PAL.wood,L,91,{n:1,dir:'v',shade:.3});}
 const fl=[T.x0-6+pull*30,T.front+36+pull*8];const pts=[[T.x0-8,T.y-2],[T.x1+8,T.y-2],[T.x1+10,T.front],[T.x1+6,T.front+34],[T.x0+120,T.front+40],fl,[T.x0-8,T.front]];
 mcShape(c,mpSmooth(pts,2,true),cloth,{lw,shade:[[T.x0-20,T.front],[T.x1+20,T.front],[T.x1+20,T.front+60],[T.x0-20,T.front+60]],shadeK:.14});
 c.save();c.strokeStyle='rgba(200,70,70,.7)';c.lineWidth=2;c.beginPath();c.moveTo(T.x0-6,T.front+14);c.lineTo(T.x1+8,T.front+12);c.stroke();c.restore();}
function meLanterns(c,t,k){const ls=[[598,448,[255,170,80]],[652,436,[250,200,90]],[708,446,[255,150,70]]];for(const [x,y,col] of ls){const sw=meSin(t*1.1+x)*.04;const px=x+meSin(sw)*30,py=y+meCos(sw)*30;c.save();c.strokeStyle='rgba(60,50,40,.9)';c.lineWidth=1;c.beginPath();c.moveTo(x,y-30);c.lineTo(px,py-14);c.stroke();
  mfGlow(c,px,py,34+k*26,t,col,.22+k*.2);mcEllipse(c,px,py,9,12,0,col,{lw:1,shadeK:.1});c.strokeStyle='rgba(120,60,30,.6)';c.lineWidth=1;for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(px,py+i*5,8.5,2.5,0,0,ME_TAU);c.stroke();}c.restore();}}
function meSitPose(rig,S,seat=30){const legLen=(rig.thigh+rig.shin)*rig.H*S;return {crouch:1,lift:seat-legLen*.65,hipL:.8,kneeL:-.4,hipR:.75,kneeR:-.45,lean:.05};}
function meSopar(c,w,h,t,ctx){const picks=ctx.picks||[];const base=mpCam(w,h,740,510,1.4);const cam=mpCam(w,h,msTrack([[0,740],[20,700]],t,msClamp),msTrack([[0,510],[20,540]],t,msClamp),msTrack([[0,1.4],[20,1.65]],t,msClamp));
 const L=meSet('sopar',c,w,h,ctx,cam,{base,hour:1,lights:1,key:'dusk'});c.setTransform(cam.k,0,0,cam.k,cam.ox,cam.oy);const T=ES_T;const night=msClamp((t-ES.night)/4);
 const lw=.95;const C={avia:MC_CHARS.avia,avi:MC_CHARS.avi,nina:MC_CHARS.nina,pol:MC_CHARS.pol};const SC={avia:.78,avi:.75,nina:.95,pol:.9};
 // ── the kids behind the table (drawn first), the table, the adults at the ends, the goat in front
 const sitN=meSitPose(C.nina.rig,SC.nina),sitP=meSitPose(C.pol.rig,SC.pol),sitA=meSitPose(C.avia.rig,SC.avia),sitAv=meSitPose(C.avi.rig,SC.avi);
 const stand={lean:.08,crouch:0,lift:0,headTilt:0,shL:.3,elL:.5,shR:.2,elR:.4,hipL:.06,kneeL:0,hipR:-.06,kneeR:0};
 const eat=(ph,amp=1)=>{const k=.5+.5*meSin(ph);return {shL:.6+k*1.6*amp,elL:1.2-k*.2*amp};};
 const toast=(rig,P,x,y,f,up)=>meReach(rig,P,[x+f*26,y-(rig.thigh+rig.shin)*rig.H*P.scale*.65+(up?-38:-10)],null,1,1);
 const who=(id,x,y,f,sitT,P0,E)=>{const rig=C[id].rig,S=SC[id];let P={...stand,...P0,x,y,facing:f,scale:S};const sat=t>=sitT;if(sat){const sit=id==='nina'?sitN:id==='pol'?sitP:id==='avia'?sitA:sitAv;const u=msClamp((t-sitT)/.5);P=meTrack([[0,P],[1,{...P,...sit}]],u);}
  return {rig,P,E};};
 // Nina runs in from the garden, Pol from the haystack; they sit on the bench behind the table
 const nx=msTrack([[0,1010],[1.5,900],[3.0,630]],t),ny=msTrack([[0,684],[1.5,644],[3.0,622]],t);const px=msTrack([[.4,300],[3.5,735]],t),py=msTrack([[.4,560],[3.5,622]],t);
 const drawKid=(id,x,y,f,sitT,ph)=>{const run=t<sitT-.5?meRun(t*ME_TAU*1.9+ph):{};let {rig,P,E}=who(id,x,y,f,sitT,run,{});const sat=t>=sitT+.5;
  if(sat){if(t>=ES.toast&&t<ES.drink)P=toast(rig,P,x,y,f,t>ES.toast+.6&&t<ES.clink+.5);else if(t>=ES.drink&&t<ES.eat){const e=eat((t-ES.drink)*ME_TAU*.6+ph,.7);P.shL=e.shL;P.elL=e.elL;}else if(t>=ES.eat){const e=eat((t-ES.eat)*ME_TAU*.8+ph);P.shL=e.shL;P.elL=e.elL;}}
  if(id==='pol'&&t>=ES.pull+.4&&t<ES.pull+2.4){P.lean+=meSin((t-ES.pull-.4)*ME_TAU*2.2)*.12;}
  const blink=msBlink(t,id==='nina'?2:3);const E2={eyes:t>=ES.clink&&t<ES.clink+.6?'happy':'open',mouth:t>=ES.eat&&meSin((t-ES.eat)*ME_TAU*.8+ph)>.6?'open':'grin',brows:.4,blush:.5,look:[f*.4,.2],blink};
  if(id==='pol'&&t>=ES.pull+.4&&t<ES.pull+2.4)E2.eyes='happy';meHuman(c,id,P,E2,{lw,L,shadow:!sat});};
 mnPlanks(c,mpRect(600,592,170,8),MN_PAL.wood,L,92,{n:1});drawKid('nina',nx,ny,1,ES.sitN,0);drawKid('pol',px,py,-1,ES.sitP,2);
 // the table (its cloth over the children's legs), the plates, the bread, the jug, the glasses
 const pull=msTrack([[ES.pull,0],[ES.pull+.5,1],[ES.pull+1.0,.9],[ES.pull+1.05,0]],t)+msSpring(t-ES.pull-1.05,.15,3,4);meTaula(c,L,{pull,lw});
 const slide=pull*6;for(const x of [622,664,706,746])mePlat(c,x-slide,T.y+8,.35,{r:13,lw:.9});
 c.save();c.fillStyle=mpRgb([214,160,90]);c.beginPath();c.ellipse(690-slide,T.y+2,16,6,0,0,ME_TAU);c.fill();c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.ellipse(686-slide,T.y,8,2.5,0,0,ME_TAU);c.fill();c.restore();
 // the jug (the carp lands in it)
 const jug=[640-slide,T.y+2];c.save();mcShape(c,mpSmooth([[jug[0]-8,jug[1]],[jug[0]-10,jug[1]-14],[jug[0]-6,jug[1]-24],[jug[0]+6,jug[1]-24],[jug[0]+10,jug[1]-14],[jug[0]+8,jug[1]]],2,true),[200,120,80],{lw:.9,shadeK:.15});c.restore();
 if(t>=ES.carp+.6)mfSplash(c,jug[0],jug[1]-24,t,ES.carp+.6,.5,13);
 for(const x of [612,676,716,758]){const up=t>=ES.toast+.6&&t<ES.clink+.5;if(!up){c.save();c.fillStyle='rgba(220,235,245,.8)';c.fillRect(x-3-slide,T.y-4,6,10);c.strokeStyle='rgba(60,60,80,.7)';c.lineWidth=.8;c.strokeRect(x-3-slide,T.y-4,6,10);c.restore();}}
 if(t>=ES.plate+.5){mePlat(c,790-slide*.5,T.y+6,.35,{r:16,lw:.9});meTruita(c,790-slide*.5,T.y+2,0,{rx:14,ry:4,lw:.9});meVapor(c,790,T.y-8,t,msClamp(1-(t-ES.plate)/8),{rise:30,n:3});}
 // the grandmother from the door with the plate, then seated at the right end; the grandfather from the pond to the left end
 const ax=msTrack([[0,790],[2.8,805]],t),ay=msTrack([[0,556],[2.8,612]],t);
 {let {rig,P,E}=who('avia',ax,ay,-1,ES.sitAv,t<2.8?meWalk(t*ME_TAU*1.3,.45):{},{});const sat=t>=ES.sitAv+.5;
  if(t<ES.plate){P=meReach(rig,P,[ax-30,ay-rig.H*SC.avia*2.0],[ax-24,ay-rig.H*SC.avia*2.0+4],1,1);}else if(t<ES.plate+.5){const u=(t-ES.plate)/.5;P=meReach(rig,P,[ax-30+(790-ax+30)*u*0-20*u,ay-rig.H*SC.avia*2.0+(T.y-ay+rig.H*SC.avia*2.0)*u],null,1,1);}
  if(sat){if(t>=ES.toast&&t<ES.drink)P=toast(rig,P,ax,ay,-1,t>ES.toast+.6&&t<ES.clink+.5);else if(t>=ES.eat&&t<ES.pull+.4){const e=eat((t-ES.eat)*ME_TAU*.7+1);P.shL=e.shL;P.elL=e.elL;}else if(t>=ES.pull+.4&&t<ES.pull+1.6)P=meReach(rig,P,[792,T.y+4],[786,T.y+2],1,1);}
  if(sat){c.save();mnPlanks(c,mpRect(ax+2,ay-54,8,54),MN_PAL.wood,L,93,{n:1,dir:'v',shade:.2});mnPlanks(c,mpRect(ax-14,ay-30,26,5),MN_PAL.wood,L,94,{n:1});c.restore();}
  const grab=t>=ES.pull+.4&&t<ES.pull+1.6;meHuman(c,'avia',P,{eyes:grab?'wide':t>=ES.clink&&t<ES.clink+.8?'happy':'open',mouth:grab?'o':'smile',brows:grab?.9:.3,blush:.4,look:[-.4,.2],blink:msBlink(t,0)},{lw,L,shadow:!sat});
  if(t<ES.plate){const J=mcSolve(rig,P);mePlat(c,(J.hdL[0]+J.hdR[0])/2-6,(J.hdL[1]+J.hdR[1])/2-4,.4,{r:16,lw:.9});meTruita(c,(J.hdL[0]+J.hdR[0])/2-6,(J.hdL[1]+J.hdR[1])/2-8,0,{rx:14,ry:4,lw:.9});meVapor(c,(J.hdL[0]+J.hdR[0])/2-6,(J.hdL[1]+J.hdR[1])/2-14,t,1,{rise:30,n:3});}
}
 const vx=msTrack([[0,230],[ES.sitA,560]],t,msClamp),vy=msTrack([[0,586],[ES.sitA,612]],t,msClamp);
 {let {rig,P,E}=who('avi',vx,vy,1,ES.sitA,t<ES.sitA?meWalk(t*ME_TAU*1.1,.4):{},{});const sat=t>=ES.sitA+.5;
  if(t>1.2&&t<2.6){const u=meSin(msClamp((t-1.2)/1.4)*ME_PI);P.shL=.3+2.5*u;P.elL=.4-.3*u;P.shR=.2+2.4*u;P.elR=.4-.3*u;P.headTilt=-.3*u;}
  if(sat){if(t>=ES.toast&&t<ES.drink)P=toast(rig,P,vx,vy,1,t>ES.toast+.6&&t<ES.clink+.5);else if(t>=ES.eat&&t<18.5){const e=eat((t-ES.eat)*ME_TAU*.6+2);P.shL=e.shL;P.elL=e.elL;}else if(t>=18.5&&t<19.6){// the yawn: both arms stretch up and out, in a V beside his hat (the hand covered his face)
   const u=meSin(msClamp((t-18.5)/1.1)*ME_PI);const J0=mcSolve(rig,P),Rr=rig.H*SC.avi*.5;P=meTrack([[0,P],[1,meReach(rig,P,[J0.head[0]+36,J0.head[1]-Rr*2.3],[J0.head[0]-30,J0.head[1]-Rr*2.2],1,1)]],u);P.headTilt=-.2*u;}}
  meStool(c,vx,vy,0,L);const yawn=t>=18.5&&t<19.6;const J=meHuman(c,'avi',P,{eyes:t>1.2&&t<2.6||yawn?'closed':t>=ES.carp&&t<ES.carp+1?'wide':'open',mouth:t>1.2&&t<2.6||yawn?'open':t>=ES.carp&&t<ES.carp+1?'o':'smile',brows:t>=ES.carp&&t<ES.carp+1?.9:.2,blush:.3,look:[.4,.1],blink:msBlink(t,1)},{lw,L,shadow:!sat,costume:{...C.avi.costume,hat:null}});
  const R=rig.H*SC.avi*.5;meBarret(c,J,R,0,0,P.headTilt*.5,{lw});
  if(t<ES.carp){const hx=J.head[0],hy=J.head[1]-R*1.3;meCarpa(c,hx,hy,-.25+meSin(t*3)*.05,1,{s:.6,tail:meSin(t*4)*.4,lw,eye:t<ES.carp-.6?'closed':'open'});}
  else if(t<ES.carp+.6){const [x,y,a]=meArc(J.head[0],J.head[1]-R*1.3,jug[0],jug[1]-26,ES.carp,ES.carp+.6,t,700);meCarpa(c,x,y,a+.4,-1,{s:.6,tail:meSin(t*30),lw,mouth:.5});}
  // the cat on his lap
  if(t>=ES.cat&&t<ES.cat+.5){const [x,y]=meArc(vx+40,vy,vx+14,vy-28,ES.cat,ES.cat+.5,t,500);mcDrawCat(c,{x,y,facing:-1,state:'sit',eyes:'open',scale:.6},{lw:1});}else if(t>=ES.cat+.5)mcDrawCat(c,{x:vx+16,y:vy-28,facing:-1,state:'sleep',eyes:'closed',scale:.6,tail:t*1.2},{lw:1});
  else if(t<ES.cat)mcDrawCat(c,{x:vx+40,y:vy,facing:1,state:t<ES.sitA?'sit':'sit',eyes:'open',scale:.6},{lw:1});}
 // the goat trots in and pulls the cloth
 {const gx=msTrack([[ES.goat,520],[ES.goat+1.5,600]],t,msClamp),gy=msTrack([[ES.goat,830],[ES.goat+1.5,652]],t,msClamp);// 0.44.3: up the path from below, clear of the pond (she came out of the water)
 const wk=t<ES.goat+1.5?meGoatWalk((t-ES.goat)*ME_TAU*1.8,.6):{legs:[.1,-.1,.1,-.15],bob:0};const pulling=t>=ES.pull&&t<ES.pull+1.05;
  mcDrawGoat(c,{x:gx,y:gy,facing:1,rear:pulling?.12:0,neck:pulling?-.3:t>=ES.pull+1.05&&t<ES.pull+2.5?.1:.1,head:pulling?.4:0,legs:wk.legs,bob:wk.bob,chew:t>=ES.pull+1.05&&t<ES.pull+2.5?.5+.5*meSin(t*ME_TAU*3):0,ears:pulling?.9:Math.max(0,meSin(t*2.7))*.6,eyes:t>=ES.pull+1.05&&t<ES.pull+2.5?'closed':'open',mouth:pulling?'open':'smile',tail:meSin(t*6)*.5+.5,scale:.9},{lw:1,L,hairSpring:[msSpring(t-ES.pull,4,5,3),0]});}
 // the lanterns and the night: the sky darkens, the stars come out, fireflies in the garden, the house windows glow
 // the blue of the night first, then the lanterns, the stars and the fireflies over it, so their light stays warm
 if(night>0){c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='multiply';c.fillStyle=mpRgb([60,68,135],.58*night);c.fillRect(0,0,w,h);c.restore();}
 meLanterns(c,t,night);
 if(night>0){const r=mpRng(77);c.save();for(let i=0;i<70;i++){const x=160+r()*1140,y=250+r()*140;const tw=.5+.5*meSin(t*2+i);c.fillStyle=`rgba(255,250,230,${(.4+.5*tw)*night})`;c.beginPath();c.arc(x,y,.9+r()*.9,0,ME_TAU);c.fill();}c.restore();
  mfFireflies(c,840,560,320,160,t,14,31,night);mfFireflies(c,300,600,260,120,t,8,32,night*.7);}
 if(t>=ES.clink&&t<ES.clink+.7)mfStars(c,684,540,t,ES.clink,5,.8);}

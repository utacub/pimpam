// Estiu a la masia (EN26), 0.39: the characters. Cel style (flat colours, one shade tone, a thin dark line) over the painted sets.
// A human is a small skeleton (mcSolve) dressed by a costume; the goat, the cat and the hens have their own rigs. Names start with mc.
// Every drawing is a pure function of a pose and an expression, so the animation engine only has to produce poses over time.
import {MP_TAU,mpRng,mpClamp,mpLerp,mpEase,mpRgb,mpMix,mpLight,mpDark,mpPath,mpSmooth,mpGroundShadow,mpCol} from './masia-pinzell.js';
export const MC_LINE=[54,38,34];
const MC_TAU=MP_TAU,cos=Math.cos,sin=Math.sin;
// ── Cel primitives ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Line width scales with the drawing scale (o.lw): about 1.6 px on the board, 2.4 px in an episode.
export function mcShape(c,pts,col,o={}){const {lw=1.6,line=MC_LINE,shade=null,shadeK=.2,sd=1,close=true,alpha=1,noLine=false}=o;c.save();c.globalAlpha*=alpha;mpPath(c,pts,close);c.fillStyle=mpRgb(col);c.fill();
 if(shade){c.save();mpPath(c,pts,close);c.clip();mpPath(c,shade,true);c.fillStyle=mpRgb(mpDark(mpMix(col,[90,70,120],.25),.22),shadeK*2.2);c.fill();c.restore();}
 if(!noLine){c.strokeStyle=mpRgb(line);c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';mpPath(c,pts,close);c.stroke();}c.restore();}
// A tapered limb from a to b: a capsule of widths w0 → w1, with the shade on the side away from the light.
export function mcLimb(c,a,b,w0,w1,col,o={}){const {lw=1.6,sd=1,shadeK=.2,line=MC_LINE,noLine=false}=o;const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;const ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
 const P=[];for(let i=0;i<=7;i++){const t=i/7*Math.PI;P.push([a[0]+(nx*cos(t)-ux*sin(t))*w0/2,a[1]+(ny*cos(t)-uy*sin(t))*w0/2]);}
 for(let i=0;i<=7;i++){const t=Math.PI+i/7*Math.PI;P.push([b[0]+(nx*cos(t)-ux*sin(t))*w1/2,b[1]+(ny*cos(t)-uy*sin(t))*w1/2]);}
 c.save();mpPath(c,P);c.fillStyle=mpRgb(col);c.fill();
 if(shadeK>0){c.save();mpPath(c,P);c.clip();const side=(nx*sd>0)?-1:1;c.fillStyle=mpRgb(mpDark(mpMix(col,[90,70,120],.25),.22),shadeK*2.2);c.beginPath();c.moveTo(a[0]+nx*w0*.55*side-ux*w0*.5,a[1]+ny*w0*.55*side-uy*w0*.5);c.lineTo(b[0]+nx*w1*.55*side+ux*w1*.5,b[1]+ny*w1*.55*side+uy*w1*.5);c.lineTo(b[0]+nx*w1*.1*side+ux*w1*.5,b[1]+ny*w1*.1*side+uy*w1*.5);c.lineTo(a[0]+nx*w0*.1*side-ux*w0*.5,a[1]+ny*w0*.1*side-uy*w0*.5);c.closePath();c.fill();c.restore();}
 if(!noLine){c.strokeStyle=mpRgb(line);c.lineWidth=lw;c.lineJoin='round';mpPath(c,P);c.stroke();}c.restore();return P;}
export function mcDot(c,x,y,r,col,o={}){c.save();c.fillStyle=mpRgb(col);c.beginPath();c.arc(x,y,r,0,MC_TAU);c.fill();if(o.lw){c.strokeStyle=mpRgb(o.line||MC_LINE);c.lineWidth=o.lw;c.stroke();}c.restore();}
export function mcEllipse(c,x,y,rx,ry,rot,col,o={}){const pts=[];for(let i=0;i<24;i++){const a=i/24*MC_TAU;const px=cos(a)*rx,py=sin(a)*ry;pts.push([x+px*cos(rot)-py*sin(rot),y+px*sin(rot)+py*cos(rot)]);}mcShape(c,pts,col,o);return pts;}
export function mcStroke(c,pts,col,w,o={}){c.save();c.strokeStyle=mpRgb(col);c.lineWidth=w;c.lineCap='round';c.lineJoin='round';mpPath(c,pts,o.close||false);c.stroke();c.restore();}
// ── The human skeleton ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A rig: segment lengths in units of the head height (H). Proportions: a child is 4–5 heads, an adult 6–7.
export function mcHuman(o={}){return {H:o.H||40,head:o.head||1,neck:o.neck||.18,torso:o.torso||1.5,shoulder:o.shoulder||.62,hip:o.hip||.5,upperArm:o.upperArm||.95,foreArm:o.foreArm||.85,hand:o.hand||.3,thigh:o.thigh||1.1,shin:o.shin||1,foot:o.foot||.45,
 armW:o.armW||.3,legW:o.legW||.38,belly:o.belly||0,...o};}
// The default standing pose; angles in radians: limbs from the vertical (positive = towards the facing side), lean = torso from vertical.
export const MC_STAND=Object.freeze({x:0,y:0,facing:1,lean:0,crouch:0,lift:0,headTilt:0,headTurn:0,shL:.18,elL:.1,shR:-.18,elR:.1,hipL:.06,kneeL:0,hipR:-.06,kneeR:0,footL:0,footR:0,wristL:0,wristR:0,scale:1,bob:0});
// Solves the joints of a pose (world coordinates). The feet stand on y; the facing side limbs are "near" (drawn last).
export function mcSolve(rig,pose){const p={...MC_STAND,...pose};const H=rig.H*p.scale,f=p.facing;const seg=(a,b,len,ang)=>[a[0]+sin(ang)*len*f,a[1]+cos(ang)*len];
 const legLen=(rig.thigh+rig.shin)*H;const hipY=p.y-legLen*(1-p.crouch*.35)-p.lift+p.bob;const hip=[p.x,hipY];
 const chest=[hip[0]+sin(p.lean)*rig.torso*H*f,hip[1]-cos(p.lean)*rig.torso*H];const neck=[chest[0]+sin(p.lean)*rig.neck*H*f,chest[1]-cos(p.lean)*rig.neck*H];
 const headA=p.lean+p.headTilt;const head=[neck[0]+sin(headA)*rig.head*H*.5*f,neck[1]-cos(headA)*rig.head*H*.5];
 const sw=rig.shoulder*H,hw=rig.hip*H;
 // near side is the facing side (x +f), far side the other. L = near, R = far.
 const shL=[chest[0]+f*sw*.5*.55,chest[1]+H*.1],shR=[chest[0]-f*sw*.5*.75,chest[1]+H*.12];
 const elL=seg(shL,0,rig.upperArm*H,p.shL),hdL=seg(elL,0,rig.foreArm*H,p.shL+p.elL);
 const elR=seg(shR,0,rig.upperArm*H,p.shR),hdR=seg(elR,0,rig.foreArm*H,p.shR+p.elR);
 const hpL=[hip[0]+f*hw*.5*.5,hip[1]],hpR=[hip[0]-f*hw*.5*.6,hip[1]+2];
 const knL=seg(hpL,0,rig.thigh*H,p.hipL+p.crouch*.7),ftL=seg(knL,0,rig.shin*H,p.hipL-p.kneeL-p.crouch*1.2);
 const knR=seg(hpR,0,rig.thigh*H,p.hipR+p.crouch*.7),ftR=seg(knR,0,rig.shin*H,p.hipR-p.kneeR-p.crouch*1.2);
 return {p,H,f,hip,chest,neck,head,headA,shL,elL,hdL,shR,elR,hdR,hpL,knL,ftL,hpR,knR,ftR,sw,hw};}
// ── Faces ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// expr: {eyes:'open'|'closed'|'happy'|'wide'|'wink'|'sleepy', mouth:'smile'|'open'|'o'|'grin'|'line'|'sad'|'sleep', brows:-1..1 (down..up), blush:0..1, look:[x,y] -1..1, blink:0..1}
export function mcFace(c,J,R,skin,expr,o={}){const {lw=1.6,glasses=false,freckles=false,moustache=null,beard=null,wrinkles=false}=o;const e={eyes:'open',mouth:'smile',brows:0,blush:.3,look:[0,0],blink:0,...expr};const f=J.f;const turn=J.p.headTurn;
 const cx=J.head[0]+f*R*.12*(1-turn),cy=J.head[1];const ex=R*.38,ey=-R*.02;const eyeR=R*(o.eyeK||.17);const look=e.look;
 const eye=(x,y,near)=>{const open=e.eyes==='closed'||e.blink>.6?0:e.eyes==='sleepy'?.4:e.eyes==='wide'?1.35:1;const w=eyeR*(near?1:.85),h=eyeR*open*1.15;
  if(e.eyes==='happy'||(e.eyes==='wink'&&!near)){c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*1.1;c.lineCap='round';c.beginPath();c.arc(x,y+h*.3,w,Math.PI*1.15,Math.PI*1.85);c.stroke();c.restore();return;}
  if(open<=0.05){c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*1.1;c.lineCap='round';c.beginPath();c.moveTo(x-w,y);c.quadraticCurveTo(x,y+w*.5,x+w,y);c.stroke();c.restore();return;}
  c.save();c.fillStyle=mpRgb([255,255,255]);c.beginPath();c.ellipse(x,y,w,h,0,0,MC_TAU);c.fill();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*.9;c.stroke();c.clip();
  const ir=w*.68;const ix=x+look[0]*w*.3+f*w*.08,iy=y+look[1]*h*.3+h*.08;c.fillStyle=mpRgb(o.iris||[60,40,30]);c.beginPath();c.ellipse(ix,iy,ir,ir*1.15,0,0,MC_TAU);c.fill();c.fillStyle=mpRgb([20,14,14]);c.beginPath();c.ellipse(ix,iy+ir*.1,ir*.5,ir*.6,0,0,MC_TAU);c.fill();c.fillStyle=mpRgb([255,255,255],.95);c.beginPath();c.arc(ix-ir*.35,iy-ir*.45,ir*.32,0,MC_TAU);c.fill();c.beginPath();c.arc(ix+ir*.3,iy+ir*.35,ir*.14,0,MC_TAU);c.fill();
  // the lid
  if(open<1){c.fillStyle=mpRgb(skin);c.beginPath();c.rect(x-w-1,y-h-1,w*2+2,h*(1-open)*1.6);c.fill();}c.restore();
  // lashes/lid line on top
  c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*1.2;c.lineCap='round';c.beginPath();c.arc(x,y,w,Math.PI*1.1,Math.PI*1.9);c.stroke();c.restore();};
 // blush
 if(e.blush>0){c.save();c.fillStyle=mpRgb([255,120,110],e.blush*.35);c.beginPath();c.ellipse(cx-ex*1.1,cy+R*.3,R*.2,R*.1,0,0,MC_TAU);c.ellipse(cx+ex*1.1,cy+R*.3,R*.2,R*.1,0,0,MC_TAU);c.fill();c.restore();}
 if(freckles){c.save();c.fillStyle=mpRgb([190,120,90],.6);for(let i=0;i<8;i++){const a=i*2.4;c.beginPath();c.arc(cx+(i%2?-1:1)*ex*(.6+(i%4)*.18),cy+R*.22+sin(a)*R*.06,R*.025,0,MC_TAU);c.fill();}c.restore();}
 eye(cx-ex*(1-turn*.5),cy+ey,f<0);eye(cx+ex*(1-turn*.5),cy+ey,f>0);
 // brows
 c.save();c.strokeStyle=mpRgb(o.brow||MC_LINE);c.lineWidth=lw*1.6;c.lineCap='round';for(const s of [-1,1]){const bx=cx+s*ex,by=cy+ey-eyeR*1.7-e.brows*R*.08;c.beginPath();c.moveTo(bx-eyeR*1.1,by+(s*f<0?e.brows*R*.03:0)+R*.02);c.quadraticCurveTo(bx,by-R*.04-Math.max(0,e.brows)*R*.03,bx+eyeR*1.1,by+R*.02-e.brows*R*.02*(s*f>0?1:0));c.stroke();}c.restore();
 if(glasses){c.save();c.strokeStyle=mpRgb([90,70,60]);c.lineWidth=lw;c.beginPath();c.arc(cx-ex,cy+ey+R*.02,eyeR*1.7,0,MC_TAU);c.moveTo(cx+ex+eyeR*1.7,cy+ey+R*.02);c.arc(cx+ex,cy+ey+R*.02,eyeR*1.7,0,MC_TAU);c.moveTo(cx-ex+eyeR*1.7,cy+ey);c.lineTo(cx+ex-eyeR*1.7,cy+ey);c.stroke();c.fillStyle=mpRgb([200,230,255],.25);c.beginPath();c.arc(cx-ex,cy+ey+R*.02,eyeR*1.6,0,MC_TAU);c.arc(cx+ex,cy+ey+R*.02,eyeR*1.6,0,MC_TAU);c.fill();c.restore();}
 // nose: a small curve on the facing side
 c.save();c.strokeStyle=mpRgb(MC_LINE,.8);c.lineWidth=lw*.9;c.lineCap='round';c.beginPath();c.moveTo(cx+f*R*.14,cy+R*.2);c.quadraticCurveTo(cx+f*R*.2,cy+R*.3,cx+f*R*.1,cy+R*.32);c.stroke();c.restore();
 // mouth
 const my=cy+R*.55,mw=R*.24;c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*1.1;c.lineCap='round';
 if(e.mouth==='smile'){c.beginPath();c.moveTo(cx-mw,my-R*.03);c.quadraticCurveTo(cx+f*R*.04,my+R*.14,cx+mw,my-R*.05);c.stroke();}
 else if(e.mouth==='grin'){c.fillStyle=mpRgb([120,40,50]);c.beginPath();c.moveTo(cx-mw*1.2,my-R*.04);c.quadraticCurveTo(cx,my+R*.26,cx+mw*1.2,my-R*.04);c.closePath();c.fill();c.stroke();c.fillStyle=mpRgb([255,255,255]);c.beginPath();c.rect(cx-mw*.9,my-R*.03,mw*1.8,R*.06);c.fill();}
 else if(e.mouth==='open'){c.fillStyle=mpRgb([120,40,50]);c.beginPath();c.ellipse(cx,my+R*.03,mw*.75,R*.14,0,0,MC_TAU);c.fill();c.stroke();c.fillStyle=mpRgb([240,110,120]);c.beginPath();c.ellipse(cx,my+R*.12,mw*.45,R*.06,0,0,MC_TAU);c.fill();}
 else if(e.mouth==='o'){c.fillStyle=mpRgb([120,40,50]);c.beginPath();c.ellipse(cx+f*R*.02,my+R*.02,mw*.42,R*.1,0,0,MC_TAU);c.fill();c.stroke();}
 else if(e.mouth==='line'){c.beginPath();c.moveTo(cx-mw*.8,my);c.lineTo(cx+mw*.8,my);c.stroke();}
 else if(e.mouth==='sad'){c.beginPath();c.moveTo(cx-mw,my+R*.06);c.quadraticCurveTo(cx,my-R*.08,cx+mw,my+R*.06);c.stroke();}
 else if(e.mouth==='sleep'){c.beginPath();c.ellipse(cx+f*R*.02,my+R*.02,mw*.3,R*.07,0,0,MC_TAU);c.fillStyle=mpRgb([120,40,50]);c.fill();c.stroke();}
 c.restore();
 if(moustache){c.save();c.fillStyle=mpRgb(moustache);c.beginPath();c.moveTo(cx,my-R*.1);c.quadraticCurveTo(cx-mw*1.4,my-R*.3,cx-mw*1.9,my+R*.02);c.quadraticCurveTo(cx-mw*1.2,my+R*.02,cx,my+R*.0);c.quadraticCurveTo(cx+mw*1.2,my+R*.02,cx+mw*1.9,my+R*.02);c.quadraticCurveTo(cx+mw*1.4,my-R*.3,cx,my-R*.1);c.closePath();c.fill();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw*.8;c.stroke();c.restore();}
 if(wrinkles){c.save();c.strokeStyle=mpRgb(MC_LINE,.45);c.lineWidth=lw*.7;c.lineCap='round';for(const s of [-1,1]){c.beginPath();c.moveTo(cx+s*ex*1.5,cy+ey);c.lineTo(cx+s*ex*1.75,cy+ey-R*.04);c.moveTo(cx+s*ex*1.5,cy+ey+R*.08);c.lineTo(cx+s*ex*1.75,cy+ey+R*.1);c.stroke();}c.restore();}}
// ── A dressed human ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// costume: {skin, hair:{col,style:'bun'|'braids'|'short'|'cap'|'bald'}, top:{col,sleeve:'short'|'long'}, bottom:{col,kind:'trousers'|'shorts'|'skirt'|'dress'|'overalls'}, shoes:{col}, apron, hat, glasses, freckles, moustache, suspenders, cap:{col}}
// hairSpring [dx,dy] moves hair and loose cloth (secondary motion); props: {rod, can, spoon, pins, basket...} drawn by the caller with the joints.
export function mcDrawHuman(c,rig,pose,costume,expr,o={}){const J=mcSolve(rig,pose);const {lw=1.6,sd=1,hairSpring=[0,0],clothSpring=[0,0],shadow=true,L=null}=o;const f=J.f,H=J.H;const K=costume;
 const skin=K.skin,R=rig.head*H*.5;const armW=rig.armW*H,legW=rig.legW*H;const lo={lw,sd};
 if(shadow)mpGroundShadow(c,J.p.x,J.p.y+2,H*.8,H*.18,L||{shadeTint:[110,120,180],shadowK:.9},.3,3);
 const sleeveCol=K.top.col,sleeveLong=K.top.sleeve==='long';const legCol=K.bottom.kind==='trousers'||K.bottom.kind==='overalls'?K.bottom.col:skin;
 const drawArm=(sh,el,hd,near)=>{mcLimb(c,sh,el,armW*1.05,armW*.85,sleeveLong?sleeveCol:(K.top.sleeve==='short'?sleeveCol:skin),lo);
  // short sleeve: the upper third is cloth, the rest skin
  if(K.top.sleeve==='short'){const m=[sh[0]+(el[0]-sh[0])*.45,sh[1]+(el[1]-sh[1])*.45];mcLimb(c,m,el,armW*.9,armW*.8,skin,lo);mcLimb(c,sh,m,armW*1.1,armW*1.05,sleeveCol,lo);}
  mcLimb(c,el,hd,armW*(sleeveLong?.85:.78),armW*.6,sleeveLong?sleeveCol:skin,lo);const ha=Math.atan2(hd[1]-el[1],hd[0]-el[0]);mcEllipse(c,hd[0]+Math.cos(ha)*rig.hand*H*.3,hd[1]+Math.sin(ha)*rig.hand*H*.3,rig.hand*H*.5,rig.hand*H*.36,ha,skin,{...lo,shadeK:.1});};
 const drawLeg=(hp,kn,ft,near)=>{const shortK=K.bottom.kind==='shorts'||K.bottom.kind==='skirt'||K.bottom.kind==='dress';mcLimb(c,hp,kn,legW*1.1,legW*.9,shortK?skin:legCol,lo);if(shortK){const m=[hp[0]+(kn[0]-hp[0])*.5,hp[1]+(kn[1]-hp[1])*.5];mcLimb(c,hp,m,legW*1.15,legW*1.05,K.bottom.col,lo);}
  mcLimb(c,kn,ft,legW*.9,legW*.72,shortK||K.bottom.kind==='trousers'&&K.bottom.rolled?skin:legCol,lo);
  // the foot/shoe
  const fx=ft[0]+f*rig.foot*H*.5,fy=ft[1];mcEllipse(c,fx-f*rig.foot*H*.05,fy-legW*.1,rig.foot*H*.55,legW*.38,0,K.shoes.col,lo);};
 // far limbs (and the near leg too under a dress or a skirt, so the cloth covers both)
 const legsUnder=K.bottom.kind==='dress'||K.bottom.kind==='skirt';drawArm(J.shR,J.elR,J.hdR,false);drawLeg(J.hpR,J.knR,J.ftR,false);if(legsUnder)drawLeg(J.hpL,J.knL,J.ftL,true);
 // the torso: a shape from the hips to the shoulders; dress/skirt widen below the hips
 const t=J;const torsoPts=[];const sh=rig.shoulder*H*.5,hpw=rig.hip*H*.5;const bellyK=rig.belly;
 const kind=K.bottom.kind;const bodyCol=K.top.col;
 if(kind==='dress'){const hem=J.p.y-H*(rig.thigh*.75);const spread=hpw*1.9+clothSpring[0]*0;const pts=[[t.chest[0]-sh*.95,t.chest[1]+H*.05],[t.chest[0]+sh*.95,t.chest[1]+H*.05],[t.hip[0]+spread+clothSpring[0],hem+clothSpring[1]],[t.hip[0]-spread+clothSpring[0],hem+clothSpring[1]]];mcShape(c,mpSmooth([pts[0],[t.chest[0]+sh*1.05+bellyK*H*.3,t.hip[1]-H*.2],pts[1],[t.hip[0]+spread*1.02,hem],[t.hip[0],hem+H*.05],[t.hip[0]-spread*1.02,hem],[t.chest[0]-sh*1.05-bellyK*H*.3,t.hip[1]-H*.2]].slice(0),2,true),K.bottom.col,lo);
  // the bodice
  mcShape(c,[[t.chest[0]-sh*.95,t.chest[1]+H*.05],[t.chest[0]+sh*.95,t.chest[1]+H*.05],[t.hip[0]+hpw*1.15+bellyK*H*.35,t.hip[1]-H*.1],[t.hip[0]-hpw*1.15-bellyK*H*.35,t.hip[1]-H*.1]],bodyCol,lo);}
 else{const pts=mpSmooth([[t.chest[0]-sh,t.chest[1]+H*.02],[t.chest[0]+sh,t.chest[1]+H*.02],[t.hip[0]+hpw*1.05+bellyK*H*.3,t.hip[1]+H*.05],[t.hip[0]-hpw*1.05-bellyK*H*.3,t.hip[1]+H*.05]],2,true);mcShape(c,pts,bodyCol,lo);
  // the waistband / shorts top
  if(kind==='shorts'||kind==='trousers'){mcShape(c,[[t.hip[0]-hpw*1.1,t.hip[1]-H*.2],[t.hip[0]+hpw*1.1,t.hip[1]-H*.2],[t.hip[0]+hpw*1.2,t.hip[1]+H*.25],[t.hip[0]-hpw*1.2,t.hip[1]+H*.25]],K.bottom.col,lo);}
  if(kind==='skirt'){const hem=t.hip[1]+H*.9;mcShape(c,[[t.hip[0]-hpw*1.05,t.hip[1]-H*.15],[t.hip[0]+hpw*1.05,t.hip[1]-H*.15],[t.hip[0]+hpw*1.9+clothSpring[0],hem+clothSpring[1]],[t.hip[0]-hpw*1.9+clothSpring[0],hem+clothSpring[1]]],K.bottom.col,lo);}
  if(kind==='overalls'){mcShape(c,[[t.hip[0]-hpw*1.1,t.hip[1]-H*.2],[t.hip[0]+hpw*1.1,t.hip[1]-H*.2],[t.hip[0]+hpw*1.2,t.hip[1]+H*.25],[t.hip[0]-hpw*1.2,t.hip[1]+H*.25]],K.bottom.col,lo);mcShape(c,[[t.chest[0]-sh*.45,t.chest[1]+H*.1],[t.chest[0]+sh*.45,t.chest[1]+H*.1],[t.hip[0]+hpw*.9,t.hip[1]-H*.15],[t.hip[0]-hpw*.9,t.hip[1]-H*.15]],K.bottom.col,lo);mcStroke(c,[[t.chest[0]-sh*.4,t.chest[1]+H*.1],[t.chest[0]-sh*.5,t.chest[1]-H*.02]],K.bottom.col,lw*2.4);mcStroke(c,[[t.chest[0]+sh*.4,t.chest[1]+H*.1],[t.chest[0]+sh*.5,t.chest[1]-H*.02]],K.bottom.col,lw*2.4);}
  if(K.suspenders){for(const s of [-1,1]){mcStroke(c,[[t.chest[0]+s*sh*.45,t.chest[1]+H*.02],[t.hip[0]+s*hpw*.7,t.hip[1]-H*.15]],K.suspenders,lw*2.2);}}
  if(K.stripes){c.save();mpPath(c,pts);c.clip();c.strokeStyle=mpRgb(K.stripes);c.lineWidth=H*.07;for(let i=0;i<6;i++){const y=t.chest[1]+H*.1+i*H*.2;c.beginPath();c.moveTo(t.chest[0]-sh*1.3,y);c.lineTo(t.chest[0]+sh*1.3,y+ (t.hip[0]-t.chest[0])*0);c.stroke();}c.restore();}}
 if(K.apron){const hem=J.p.y-H*(rig.thigh*.95);mcShape(c,mpSmooth([[t.chest[0]-sh*.5,t.chest[1]+H*.3],[t.chest[0]+sh*.5,t.chest[1]+H*.3],[t.hip[0]+hpw*1.5+clothSpring[0]*.6,hem+clothSpring[1]],[t.hip[0]-hpw*1.5+clothSpring[0]*.6,hem+clothSpring[1]]],2,true),K.apron.col,lo);
  if(K.apron.dots){c.save();c.fillStyle=mpRgb(K.apron.dots);for(let i=0;i<9;i++){c.beginPath();c.arc(t.hip[0]-hpw+(i%3)*hpw+hpw*.05*(i%2),t.chest[1]+H*.5+Math.floor(i/3)*H*.32,H*.035,0,MC_TAU);c.fill();}c.restore();}}
 // the neck and the head
 mcLimb(c,J.chest,J.neck,H*.26,H*.24,skin,{...lo,noLine:true});
 // hair back layer (behind the head)
 const hx=J.head[0]+hairSpring[0]*.5,hy=J.head[1]+hairSpring[1]*.5;
 if(K.hair.style==='braids'){for(const s of [-1,1]){const bx=J.head[0]+s*R*.9,by=J.head[1]+R*.45;const pts=[[bx,by],[bx+s*R*.25+hairSpring[0],by+R*.9+hairSpring[1]],[bx+s*R*.1+hairSpring[0]*1.4,by+R*1.6+hairSpring[1]*1.4]];mcStroke(c,mpSmooth(pts,4),MC_LINE,R*.36+lw);mcStroke(c,mpSmooth(pts,4),K.hair.col,R*.36);mcDot(c,pts[2][0],pts[2][1],R*.14,K.hair.tie||[220,60,60],{lw:lw*.8});}}
 if(K.hair.style==='bun'){mcDot(c,J.head[0]-f*R*.55+hairSpring[0]*.3,J.head[1]-R*.75+hairSpring[1]*.3,R*.42,K.hair.col,{lw});}
 const headPts=mcEllipse(c,J.head[0],J.head[1],R,R*1.05,0,skin,{...lo,shadeK:.15});
 // the ears
 mcDot(c,J.head[0]-f*R*.95,J.head[1]+R*.1,R*.16,skin,{lw});
 mcFace(c,J,R,skin,expr,{lw,glasses:K.glasses,freckles:K.freckles,moustache:K.moustache,wrinkles:K.wrinkles,iris:K.iris,brow:K.hair.style==='bald'?MC_LINE:K.hair.col&&K.hair.col[0]<120?K.hair.col:MC_LINE});
 // hair front layer: a cap over the top of the head, with a fringe line across the forehead
 const hc=K.hair.col;
 if(K.hair.style==='bun'||K.hair.style==='short'||K.hair.style==='braids'){const pts=[];const fy=J.head[1]-R*.38;pts.push([J.head[0]-R*1.1,J.head[1]+R*.15]);for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;const k=1.1+(K.hair.style==='short'&&i%2?.05:0);pts.push([J.head[0]+cos(a)*R*k+hairSpring[0]*(.2+Math.abs(cos(a))*.3)*(1-Math.abs(cos(a))),J.head[1]+R*.1+sin(a)*R*1.18*k+hairSpring[1]*.3]);}
  pts.push([J.head[0]+R*1.1,J.head[1]+R*.15]);const nf=5;for(let i=0;i<=nf;i++){const u=i/nf;const x=J.head[0]+R*1.0-u*R*2.0;const bump=(i%2?R*.14:0)+(K.hair.style==='braids'?R*.05:0);pts.push([x+hairSpring[0]*.15,fy+bump+(u-.5)*(u-.5)*R*.3*f]);}
  mcShape(c,mpSmooth(pts,2,true),hc,lo);}
 if(K.hair.style==='bald'){mcShape(c,mpSmooth([[J.head[0]-R*1.02,J.head[1]+R*.15],[J.head[0]-R*.95,J.head[1]-R*.25],[J.head[0]-R*.7,J.head[1]-R*.1],[J.head[0]-R*.75,J.head[1]+R*.5]],2,true),hc,lo);mcShape(c,mpSmooth([[J.head[0]+R*1.02,J.head[1]+R*.15],[J.head[0]+R*.95,J.head[1]-R*.25],[J.head[0]+R*.7,J.head[1]-R*.1],[J.head[0]+R*.75,J.head[1]+R*.5]],2,true),hc,lo);}
 if(K.hat==='straw'){const by=J.head[1]-R*.78;mcEllipse(c,J.head[0]+hairSpring[0]*.3,by+R*.12,R*1.85,R*.36,0,[226,196,110],lo);mcShape(c,mpSmooth([[J.head[0]-R*.95,by+R*.08],[J.head[0]-R*.8,by-R*.55],[J.head[0]+R*.8,by-R*.55],[J.head[0]+R*.95,by+R*.08]],2,true),[232,204,120],lo);mcStroke(c,[[J.head[0]-R*.88,by-R*.02],[J.head[0]+R*.88,by-R*.02]],[150,60,50],lw*2.2);}
 if(K.cap)mcCap(c,J.head[0],J.head[1]-R*.22,0,f,R,K.cap.col,{lw});
 // near limbs
 if(!legsUnder)drawLeg(J.hpL,J.knL,J.ftL,true);drawArm(J.shL,J.elL,J.hdL,true);
 return J;}
// ── The five characters: rigs and costumes ────────────────────────────────────────────────────────────────────────────────────────
export const MC_CHARS={
 avia:{rig:mcHuman({H:36,torso:1.1,upperArm:.7,foreArm:.62,thigh:.72,shin:.66,shoulder:.78,hip:.72,belly:.5,armW:.34,legW:.4,hand:.34}),
  costume:{skin:[246,212,186],hair:{col:[214,214,214],style:'bun'},top:{col:[214,90,96],sleeve:'short'},bottom:{col:[110,70,130],kind:'dress'},shoes:{col:[90,60,50]},apron:{col:[104,150,200],dots:[240,248,255]},glasses:true,wrinkles:true,iris:[80,60,40]},
  expr:{eyes:'open',mouth:'smile',brows:.2,blush:.4}},
 avi:{rig:mcHuman({H:38,torso:1.5,upperArm:.9,foreArm:.8,thigh:1.1,shin:1,shoulder:.62,hip:.46,belly:.15,armW:.26,legW:.32,hand:.32}),
  costume:{skin:[236,196,160],hair:{col:[210,210,205],style:'bald'},top:{col:[232,226,206],sleeve:'long'},bottom:{col:[90,100,130],kind:'trousers',rolled:true},shoes:{col:[70,50,40]},hat:'straw',moustache:[210,210,205],suspenders:[110,70,60],wrinkles:true,iris:[70,90,110]},
  expr:{eyes:'closed',mouth:'sleep',brows:0,blush:.2}},
 nina:{rig:mcHuman({H:32,torso:1.2,upperArm:.78,foreArm:.7,thigh:.92,shin:.85,shoulder:.6,hip:.5,armW:.26,legW:.3,hand:.3}),
  costume:{skin:[240,200,170],hair:{col:[120,70,40],style:'braids',tie:[220,70,70]},top:{col:[250,214,70],sleeve:'short'},bottom:{col:[70,140,100],kind:'shorts'},shoes:{col:[210,60,60]},freckles:true,iris:[70,110,70]},
  expr:{eyes:'open',mouth:'grin',brows:.4,blush:.4}},
 pol:{rig:mcHuman({H:30,torso:.95,upperArm:.62,foreArm:.55,thigh:.66,shin:.6,shoulder:.64,hip:.56,belly:.2,armW:.32,legW:.38,hand:.32}),
  costume:{skin:[244,206,176],hair:{col:[60,40,30],style:'short'},top:{col:[240,240,240],sleeve:'short'},bottom:{col:[60,90,160],kind:'shorts'},shoes:{col:[120,90,60]},stripes:[80,120,200],cap:{col:[210,60,50],big:1.45},iris:[60,50,40]},
  expr:{eyes:'open',mouth:'o',brows:.3,blush:.5}}};
// ── The goat ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// pose: {x,y (ground), facing, rear 0..1 (standing on the hind legs), neck (angle, 0 = level), head (nod), legs:[fl,fr,bl,br] angles, tail, chew 0..1, ears 0..1 (flap), eyes, mouth}
export function mcDrawGoat(c,pose,o={}){const p={x:0,y:0,facing:1,rear:0,neck:0,head:0,legs:[0,0,0,0],tail:0,chew:0,ears:0,eyes:'open',mouth:'smile',scale:1,bob:0,...pose};const {lw=1.6,L=null,hairSpring=[0,0]}=o;const f=p.facing,S=p.scale;
 const white=[246,242,232],shadeW=[220,214,204],pink=[230,170,170],horn=[150,120,90];const lo={lw,sd:1};
 mpGroundShadow(c,p.x,p.y+2,44*S,8*S,L||{shadeTint:[110,120,180],shadowK:.9},.3,3);
 c.save();c.translate(p.x,p.y);c.scale(S,S);
 // the body pivots about the hips when rearing
 const rear=p.rear;c.translate(-f*16,-36+p.bob);c.rotate(-f*rear*1.1);c.translate(f*16,0);
 const legLen=30;const leg=(bx,by,ang,near,front)=>{const kx=bx+sin(ang)*legLen*.5*f,ky=by+cos(ang)*legLen*.5;const fx=kx+sin(ang*.4)*legLen*.5*f,fy=ky+cos(ang*.4)*legLen*.5;mcLimb(c,[bx,by],[kx,ky],7,5.5,near?white:shadeW,lo);mcLimb(c,[kx,ky],[fx,fy],5.5,4.5,near?white:shadeW,lo);mcEllipse(c,fx+f*1,fy+1,4,2.6,0,[70,60,60],lo);};
 // far legs
 leg(f*20,6,p.legs[1],false,true);leg(-f*18,6,p.legs[3],false,false);
 // the body: a plump ellipse, bigger at the back
 const body=[];for(let i=0;i<28;i++){const a=i/28*MC_TAU;const rx=30,ry=17;const k=1+.12*cos(a-Math.PI*(f>0?1:0))*0;body.push([cos(a)*rx*(1+.08*(cos(a)*-f)),sin(a)*ry*(1+.1*sin(a))]);}
 mcShape(c,body,white,{...lo,shade:[[-30,2],[30,2],[30,20],[-30,20]],shadeK:.16});
 // the udder hint and the tail
 mcShape(c,[[-f*24,0],[-f*30+hairSpring[0]*.3,-10-p.tail*6+hairSpring[1]*.3],[-f*27,-2]],white,lo);
 // near legs
 leg(f*18,8,p.legs[0],true,true);leg(-f*14,8,p.legs[2],true,false);
 // the neck and the head: the neck rises from the front of the body; the head hangs at its top, muzzle forward
 const nb=[f*24,-7];const nAng=1+p.neck;const neckTop=[nb[0]+f*cos(nAng)*14,nb[1]-sin(nAng)*17];
 mcLimb(c,nb,neckTop,12,9,white,lo);
 // the red collar round the middle of the neck, across it (0.44.3: it followed the neck base and floated off when the neck moved)
 const nL=Math.hypot(neckTop[0]-nb[0],neckTop[1]-nb[1])||1,ux=(neckTop[0]-nb[0])/nL,uy=(neckTop[1]-nb[1])/nL;let nx=-uy,ny=ux;if(ny<0){nx=-nx;ny=-ny;}
 const cu=.5,cw=(12-3*cu)/2+.4,cP=[nb[0]+(neckTop[0]-nb[0])*cu,nb[1]+(neckTop[1]-nb[1])*cu];const cA=[cP[0]-nx*cw,cP[1]-ny*cw],cB=[cP[0]+nx*cw,cP[1]+ny*cw];
 const band=mpSmooth([cA,[cP[0]-ux*1.8,cP[1]-uy*1.8],cB],3);mcStroke(c,band,MC_LINE,3.4+lw);mcStroke(c,band,[200,50,50],3.4);
 c.save();c.translate(neckTop[0],neckTop[1]);c.rotate(f*(p.head*.6+.15));c.scale(.9,.9);
 // horns, far ear, head, near ear, beard, bell
 for(const s of [-1,1]){const pts=[[-f*2+s*2,-6],[-f*4+s*4,-16],[-f*7+s*7,-22]];mcStroke(c,mpSmooth(pts,3),MC_LINE,4.2+lw);mcStroke(c,mpSmooth(pts,3),horn,4.2);}
 mcEllipse(c,-f*8,-1+p.ears*3,8,3.6,f*(.55+p.ears*.6),shadeW,lo);
 const head=[[-f*4,-8],[f*4,-9],[f*12,-6],[f*18,1],[f*17,7+p.chew*1.5],[f*9,9+p.chew*2],[-f*2,7],[-f*7,1]];mcShape(c,mpSmooth(head,3,true),white,lo);
 mcEllipse(c,-f*2,-3+p.ears*3,8.5,3.8,f*(.3-p.ears*.5),white,lo);mcEllipse(c,-f*2,-3+p.ears*3,5.5,2.2,f*(.3-p.ears*.5),pink,{...lo,noLine:true});
 mcShape(c,[[f*9,8+p.chew*2],[f*14,7+p.chew*2],[f*12+hairSpring[0]*.4,15+p.chew*2+hairSpring[1]*.4]],white,lo);
 mcDot(c,f*17,3,1.8,[90,70,70]);c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.lineCap='round';c.beginPath();if(p.mouth==='open'){c.ellipse(f*13,6,3,2.4,0,0,MC_TAU);c.fillStyle=mpRgb([120,40,50]);c.fill();c.stroke();}else{c.moveTo(f*16,5);c.quadraticCurveTo(f*14,7+p.chew*1.5,f*10,6+p.chew*1.5);c.stroke();}c.restore();
 const ex=f*8,ey=-2;if(p.eyes==='closed'){c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.beginPath();c.moveTo(ex-2.5,ey);c.quadraticCurveTo(ex,ey+1.8,ex+2.5,ey);c.stroke();c.restore();}
 else{mcEllipse(c,ex,ey,3.2,2.8,0,[250,240,120],{lw:lw*.9});c.save();c.fillStyle=mpRgb([40,30,30]);c.beginPath();c.ellipse(ex+f*.4,ey,2.1,.9,0,0,MC_TAU);c.fill();c.restore();}
 c.restore();
 // the bell on a red collar
 const bx=cB[0]+hairSpring[0]*.3,by=cB[1]+3.6+hairSpring[1]*.3;mcStroke(c,[cB,[bx,by]],MC_LINE,1.2);mcDot(c,bx,by,3.4,[230,190,80],{lw:lw*.9});
 c.restore();}
// A baseball cap seen from the side (0.44.3, Marc: the old dome and bar did not read as a cap): a round crown hugging the head with
// two seams and a button, a band at the base and a stiff curved visor forward (f), with a darker underside. Origin: the base of the
// crown at the forehead line; R the head radius.
export function mcCap(c,x,y,rot,f,R,col,o={}){const {lw=1.3}=o;const hw=R*1.14,ch=R*1.06,dk=mpDark(col,.3);c.save();c.translate(x,y);c.rotate(rot);
 // the visor's underside (behind the visor top), then the crown, the visor top over the crown's front
 mcShape(c,mpSmooth([[f*hw*.55,R*.02],[f*hw*1.35,R*.18],[f*hw*1.72,R*.34],[f*hw*1.6,R*.48],[f*hw*.7,R*.34]],2,true),mpDark(col,.45),{lw});
 const crown=mpSmooth([[-f*hw,R*.16],[-f*hw*.98,-ch*.4],[-f*hw*.62,-ch*.86],[f*hw*.05,-ch],[f*hw*.66,-ch*.82],[f*hw*.98,-ch*.36],[f*hw*1.0,R*.14],[0,R*.24]],3,true);
 mcShape(c,crown,col,{lw});
 c.save();mpPath(c,crown,true);c.clip();c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(-f*hw*.3,-ch*.62,hw*.42,ch*.16,-f*.45,0,MC_TAU);c.fill();
 c.fillStyle=mpRgb(mpDark(col,.18));c.beginPath();c.ellipse(f*hw*.25,R*.3,hw*1.3,R*.3,0,0,MC_TAU);c.fill();c.restore();
 c.save();c.strokeStyle=mpRgb(dk);c.lineWidth=lw*.9;c.lineCap='round';c.beginPath();c.moveTo(f*hw*.05,-ch);c.quadraticCurveTo(-f*hw*.42,-ch*.55,-f*hw*.46,R*.18);c.moveTo(f*hw*.05,-ch);c.quadraticCurveTo(f*hw*.5,-ch*.5,f*hw*.5,R*.2);c.stroke();
 c.lineWidth=lw*1.6;c.beginPath();c.moveTo(-f*hw*.96,R*.08);c.quadraticCurveTo(0,R*.3,f*hw*.98,R*.06);c.stroke();c.restore();
 mcDot(c,f*hw*.05,-ch,R*.11,mpDark(col,.1),{lw:lw*.8});
 mcShape(c,mpSmooth([[f*hw*.6,-R*.04],[f*hw*1.2,-R*.02],[f*hw*1.66,R*.16],[f*hw*1.75,R*.3],[f*hw*1.3,R*.26],[f*hw*.7,R*.2]],2,true),mpDark(col,.1),{lw});
 c.restore();}
// ── The cat ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// pose: {x,y,facing,state:'sleep'|'sit'|'stretch', tail (angle), ear, eyes, scale}
export function mcDrawCat(c,pose,o={}){const p={x:0,y:0,facing:1,state:'sleep',tail:0,ear:0,eyes:'closed',scale:1,bob:0,...pose};const {lw=1.4}=o;const f=p.facing,S=p.scale;const grey=[150,150,160],dark=[110,110,122],lo={lw,sd:1};
 c.save();c.translate(p.x,p.y+p.bob);c.scale(S,S);
 if(p.state==='sleep'){// a curled ball with the tail wrapped
  mcEllipse(c,0,-8,18,9,0,grey,{...lo,shade:[[-20,-6],[20,-6],[20,4],[-20,4]],shadeK:.15});const tail=[[f*14,-4],[f*4+Math.sin(p.tail)*3,2],[-f*12,-1],[-f*18,-6+Math.sin(p.tail)*4]];mcStroke(c,mpSmooth(tail,4),MC_LINE,5+lw);mcStroke(c,mpSmooth(tail,4),dark,5);
  mcEllipse(c,f*11,-10,8,7,0,grey,lo);for(const s of [-1,1]){mcShape(c,[[f*11+s*5,-14],[f*11+s*7,-20+p.ear],[f*11+s*1.5,-16]],grey,lo);}
  c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.lineCap='round';c.beginPath();c.moveTo(f*8,-10);c.quadraticCurveTo(f*10,-8.5,f*12,-10);c.moveTo(f*14,-10);c.quadraticCurveTo(f*16,-8.5,f*18,-10);c.stroke();c.restore();mcDot(c,f*15,-6.5,1.2,[230,150,160]);
  for(let i=0;i<3;i++){c.save();c.strokeStyle=mpRgb([240,240,240],.9);c.lineWidth=.9;c.beginPath();c.moveTo(f*17,-6+i);c.lineTo(f*24,-9+i*2.5);c.stroke();c.restore();}}
 else{// sitting upright
  mcEllipse(c,0,-14,11,15,0,grey,{...lo,shade:[[-12,-14],[12,-14],[12,2],[-12,2]],shadeK:.15});const tail=[[-f*6,-2],[-f*14+Math.sin(p.tail)*4,-6],[-f*18,-14+Math.sin(p.tail*1.3)*6]];mcStroke(c,mpSmooth(tail,4),MC_LINE,5+lw);mcStroke(c,mpSmooth(tail,4),dark,5);
  mcEllipse(c,f*3,-32,9,8,0,grey,lo);for(const s of [-1,1]){mcShape(c,[[f*3+s*5,-37],[f*3+s*7.5,-45+p.ear],[f*3+s*1.5,-39]],grey,lo);}
  if(p.eyes==='closed'){c.save();c.strokeStyle=mpRgb(MC_LINE);c.lineWidth=lw;c.beginPath();c.moveTo(f*0,-33);c.quadraticCurveTo(f*2,-31.5,f*4,-33);c.moveTo(f*6,-33);c.quadraticCurveTo(f*8,-31.5,f*10,-33);c.stroke();c.restore();}
  else{for(const s of [0,1]){const ex=f*(1+s*6),ey=-33;mcEllipse(c,ex,ey,2.4,2.6,0,[240,220,90],{lw:lw*.8});c.save();c.fillStyle=mpRgb([30,30,30]);c.beginPath();c.ellipse(ex,ey,.8,2.2,0,0,MC_TAU);c.fill();c.restore();}}
  mcDot(c,f*7,-29,1.2,[230,150,160]);mcEllipse(c,-f*4,-2,6,3,0,grey,lo);mcEllipse(c,f*4,-1,6,3,0,grey,lo);}
 c.restore();}
// ── The hens ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// pose: {x,y,facing,peck 0..1 (head down), step 0..1, flap 0..1, col, scale}
export function mcDrawHen(c,pose,o={}){const p={x:0,y:0,facing:1,peck:0,step:0,flap:0,col:[200,140,80],scale:1,...pose};const {lw=1.3}=o;const f=p.facing,S=p.scale;const col=p.col,lo={lw,sd:1};
 c.save();c.translate(p.x,p.y);c.scale(S,S);
 // legs
 c.save();c.strokeStyle=mpRgb([220,170,60]);c.lineWidth=1.6;c.lineCap='round';for(const s of [-1,1]){const lx=s*3,lift=s*f>0?p.step*4:0;c.beginPath();c.moveTo(lx,-8);c.lineTo(lx+f*1,-lift);c.moveTo(lx+f*1-3,-lift);c.lineTo(lx+f*1+3,-lift);c.stroke();}c.restore();
 // body, tail, wing
 mcEllipse(c,0,-13,11,8,f*-.15,col,{...lo,shade:[[-12,-12],[12,-12],[12,0],[-12,0]],shadeK:.15});mcShape(c,[[-f*8,-16],[-f*15,-24],[-f*12,-14]],mpDark(col,.2),lo);mcEllipse(c,-f*1,-13+p.flap*-3,6,3.5,f*(.2-p.flap*.8),mpDark(col,.1),lo);
 // neck and head (peck lowers it)
 const hx=f*(10+p.peck*4),hy=-20+p.peck*14;mcLimb(c,[f*6,-16],[hx,hy],6,5,col,lo);mcDot(c,hx,hy,4.2,col,{lw});
 mcShape(c,[[hx+f*3,hy-1],[hx+f*8,hy+1],[hx+f*3,hy+2]],[240,190,60],lo);mcShape(c,[[hx-f*1,hy-4],[hx+f*1,hy-7],[hx+f*3,hy-4]],[220,50,50],lo);mcDot(c,hx+f*1.5,hy-1,.9,[30,30,30]);
 c.restore();}
// ── Swallows ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mcDrawSwallow(c,x,y,s,flap,col=[40,36,50]){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=mpRgb(col);c.strokeStyle=mpRgb(col);c.lineWidth=1.2;c.lineCap='round';const w=1-flap*1.6;c.beginPath();c.moveTo(-9,-3*w);c.quadraticCurveTo(-4,-1,0,0);c.quadraticCurveTo(4,-1,9,-3*w);c.stroke();c.beginPath();c.moveTo(-1,0);c.lineTo(1,0);c.lineTo(3,3);c.lineTo(0,2);c.lineTo(-3,3);c.closePath();c.fill();c.restore();}

// La nova Flor de paper (CE02), 0.51 · the flowers: whorls of paper petals opening on their axis, their centres, stems and leaves.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,Krand,Kmix,Krgb,Krgba} from './kaleido-base.js';
import {fpAdd,fpSc,fpDot,fpNorm,fpBasis,fpAxis,fpShade,fpLit,fpPetal,fpPaintPetal,fpPattern,fpTexture,FP_TECH,FP_N,fpPath2D} from './flor-paper.js';

const fpLerp=(a,b,t)=>a+(b-a)*t;
const fpPair=(v,t)=>Array.isArray(v)?fpLerp(v[0],v[1],t):(v??0);
// A soft overshoot at the end of an opening: paper has a little spring.
const fpSpring=q=>q>=1?1:q+.07*Math.sin(Math.PI*q)*q;

// The species with the colours of the lap applied (var = the real colour form of the second lap).
export function fpLook(sp,alt){if(!alt||!sp.var)return sp;const V=sp.var,out={...sp,light:V.light||sp.light,pool:V.pool||sp.pool};
 if(sp.whorls&&V.col)out.whorls=sp.whorls.map((w,i)=>V.col[i]?{...w,col:V.col[i],back:V.col[i].map(x=>fpShade(x,1.1))}:w);
 if(sp.bell&&V.bellCol)out.bell={...sp.bell,col:V.bellCol,back:V.bellCol.map(x=>fpShade(x,.9))};if(V.center)out.center={...sp.center,...V.center};if(V.spathe)out.spathe=V.spathe;if(V.sepals)out.sepals=V.sepals;return out;}

// ── A radial flower ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// st: {x, y, R (pixels of the open head), p (opening 0..1), wake (0..1), t (seconds, for breathing), breath (0..1), yaw, dim (0..1),
// rim (colour of the light thread on the dark bud), white, glow, seed, alpha}
export function fpFlower(c,sp,st){if(sp.k==='spike'){fpSpike(c,sp,st);return;}if(sp.k==='cluster'){fpCluster(c,sp,st);return;}if(sp.k==='bird'){fpBird(c,sp,st);return;}if(sp.k==='funnel'){fpFunnel(c,sp,st);return;}
 const p=Kclamp(st.p),wake=Kclamp(st.wake??(p>0?1:0)),budTilt=sp.nod||.22,upright=fpLerp(budTilt,Math.min(sp.tilt,sp.up??.32),Ksmooth(wake)),tilt=fpLerp(upright,sp.tilt,Ksmooth(Kclamp((p-.28)/.6))),br=(st.breath||0)*Math.sin((st.t||0)*1.35+(st.seed||0));
 const B=fpBasis(fpAxis(tilt,(st.yaw||0)+(sp.yaw||0))),scale=fpLerp(.62,1,Ksmooth(Kclamp(p*1.4)))*(1+.015*br),o0={x:st.x,y:st.y,R:st.R*scale};
 const parts=[],seed=st.seed||0;
 sp.whorls.forEach((w,wi)=>{for(let j=0;j<w.n;j++){const oi=w.order==='spiral'?((j*.618034)%1)*w.n:w.order?w.order[j]:j,start=(w.delay||0)+oi*(w.stagger||0),q=Ksmooth(Kclamp((p-start)/(w.dur||.5))),qs=fpSpring(q);
  const jit=Krand(wi*31+j,seed+3)-.5,th=(w.dirs?w.dirs[j]*Math.PI/180:(w.th0||0)+j*K_TAU/w.n)+jit*(w.jit??.06)+fpPair(w.spin,q);
  let phi=fpPair(w.phi,qs)+br*.025*q,lift=w.lift||0,fall=0;
  if(w.fall){fall=Kclamp((p-.34)/.3);if(fall>=1)continue;phi+=fall*1.4;}
  const q3={th,phi,curl:fpPair(w.curl,q),cup:fpPair(w.cup,q),twist:fpPair(w.twist,q),len:w.len*fpPair(w.grow||[1,1],Ksmooth(Kclamp(p*1.15-start*.5)))*(1+jit*.08),wid:w.wid*(1+jit*.06),
   prof:w.prof,r0:w.r0||0,lift,rf:w.rf?.grow?{...w.rf,a:w.rf.a*Ksmooth(q)}:w.rf,seed:wi*7+j*3.1+seed,crumple:w.rf?.crumple?(1-q):0};
  const g=fpPetal(B,q3),mid=g.sp[Math.round(FP_N*.5)],tipP=g.sp[FP_N],ax=fpDot(mid,B.A),zr=mid[2]-B.A[2]*ax,rise=fpDot(tipP,B.A),wall=sp.center?.wall??((sp.center?.lift||0)+(sp.center?.r||0)*.6);
  parts.push({k:'petal',z:mid[2]+(w.sepal?-.3:0),near:zr>.06&&(rise>wall||!sp.center),g,w,fall,q,cup:q3.cup});}});
 // the centre goes over every petal that is not on the near side of the flower
 const C=sp.center;parts.sort((a,b)=>a.z-b.z);
 const draw=pt=>{const w=pt.w,o={...o0,cup:pt.cup,crumple:w.rf?.crumple?(1-pt.q)*w.rf.crumple*2:0,col:w.col,back:w.back,tech:w.tech||sp.tech,marks:w.marks,glow:(st.glow??1)*Ksmooth(pt.q),dim:st.dim||0,rim:st.rim,white:st.white,line:st.line};
  if(pt.fall){c.save();c.globalAlpha*=1-pt.fall;c.translate(0,pt.fall*pt.fall*st.R*.9);fpPaintPetal(c,o,pt.g);c.restore();}else fpPaintPetal(c,o,pt.g);};
 c.save();if(st.alpha!==undefined)c.globalAlpha*=st.alpha;
 for(const pt of parts)if(!pt.near)draw(pt);
 if(C)fpCentre(c,C,B,o0,p,st);
 for(const pt of parts)if(pt.near)draw(pt);
 c.restore();}

// ── Centres ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Drawn in the plane of the flower (an ellipse on the screen), at the height lift along the axis; seen from behind, not at all.
function fpCentre(c,C,B,o,p,st){const {A,e1,e2}=B;if(A[2]<-.05)return;const vis=Ksmooth(Kclamp((p-.15)/.5));if(vis<=0&&C.k!=='disc'&&C.k!=='fib')return;
 const R=o.R,base=fpSc(A,C.lift||0),cx=o.x+R*base[0],cy=o.y+R*base[1],dim=st.dim||0,k=1-dim*.8;
 if(C.k==='spadix'||C.k==='lily'||C.k==='column'&&C.hib){fpCentre3D(c,C,B,o,vis,k);return;}
 c.save();c.translate(cx,cy);c.transform(e1[0]*R,e1[1]*R,e2[0]*R,e2[1]*R,0,0);const r=C.r*(.55+.45*Ksmooth(Kclamp(p*1.3))),px=1/R;
 const sh=x=>fpShade(x,k);
 switch(C.k){
 case 'poppy':{// black stamens around the capsule, the capsule with its stigma disc of rays
  const n=40;c.lineCap='round';for(let i=0;i<n;i++){const a=i*K_TAU/n+Krand(i,4)*.2,l=r*(.55+.35*Krand(i,5))*vis;c.strokeStyle=Krgba(sh('#1b1418'),.9);c.lineWidth=px*Math.max(.7,R*.006);
   c.beginPath();c.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);c.lineTo(Math.cos(a)*(r*.3+l),Math.sin(a)*(r*.3+l));c.stroke();c.fillStyle=sh(i%3?'#2a1c2e':'#3c2a4a');c.beginPath();c.arc(Math.cos(a)*(r*.3+l),Math.sin(a)*(r*.3+l),r*.065,0,K_TAU);c.fill();}
  const g=c.createRadialGradient(-r*.1,-r*.1,0,0,0,r*.36);g.addColorStop(0,sh('#bfd38a'));g.addColorStop(1,sh('#5d7a34'));c.fillStyle=g;c.beginPath();c.arc(0,0,r*.34,0,K_TAU);c.fill();
  c.strokeStyle=sh('#2a1a30');c.lineWidth=r*.035;for(let i=0;i<9;i++){const a=i*K_TAU/9;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);c.stroke();}
  c.fillStyle=sh('#3a2240');c.beginPath();c.arc(0,0,r*.07,0,K_TAU);c.fill();break;}
 case 'stamens':{// a crown of yellow stamens with lighter tips around a small disc
  const n=C.n||40;c.fillStyle=sh(Kmix(C.col,'#4a6a20',.4));c.beginPath();c.arc(0,0,r*.42,0,K_TAU);c.fill();c.lineCap='round';
  for(let ring=0;ring<2;ring++)for(let i=0;i<n;i++){const a=i*K_TAU/n+ring*.07+Krand(i+ring*99,8)*.12,r0=r*(.38+ring*.12),l=r*(.45-ring*.12)*vis*(.8+.4*Krand(i,9));
   c.strokeStyle=sh(C.col);c.lineWidth=r*.07;c.beginPath();c.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);c.lineTo(Math.cos(a)*(r0+l),Math.sin(a)*(r0+l));c.stroke();
   c.fillStyle=sh(C.tip||C.col);c.beginPath();c.arc(Math.cos(a)*(r0+l),Math.sin(a)*(r0+l),r*.05,0,K_TAU);c.fill();}
  c.fillStyle=sh('#e8d070');c.beginPath();c.arc(0,0,r*.2,0,K_TAU);c.fill();c.strokeStyle=sh('#b09030');c.lineWidth=r*.03;for(let i=0;i<10;i++){const a=i*K_TAU/10;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*r*.18,Math.sin(a)*r*.18);c.stroke();}break;}
 case 'column':{// the column of the orchid, small and white, over a dark throat
  c.fillStyle=sh('#5e0838');c.beginPath();c.ellipse(0,r*.15,r*.55,r*.4,0,0,K_TAU);c.fill();const g=c.createLinearGradient(0,-r,0,r);g.addColorStop(0,sh('#ffffff'));g.addColorStop(1,sh(C.col||'#f4dce8'));c.fillStyle=g;
  c.beginPath();c.ellipse(0,0,r*.36,r*.6,0,0,K_TAU);c.fill();c.fillStyle=sh('#f0c020');c.beginPath();c.arc(0,-r*.4,r*.13,0,K_TAU);c.fill();break;}
 case 'fib':case 'disc':{// florets in Fibonacci spirals (golden angle), outer ones open first
  const n=C.n||160,ga=Math.PI*(3-Math.sqrt(5));c.fillStyle=sh(C.ring||'#3a2410');c.beginPath();c.arc(0,0,r,0,K_TAU);c.fill();
  for(let i=0;i<n;i++){const f=Math.sqrt((i+.5)/n),a=i*ga,x=Math.cos(a)*r*f*.96,y=Math.sin(a)*r*f*.96,open=Kclamp(vis*1.6-(1-f)*.8),col=Kmix(C.inner||'#4a2a10',C.col||'#c08020',open);
   c.fillStyle=sh(col);c.beginPath();c.arc(x,y,r*.055*(1-.35*(1-f)),0,K_TAU);c.fill();if(open>.5&&f>.55){c.fillStyle=sh(C.pollen||'#ffd040');c.beginPath();c.arc(x,y,r*.022,0,K_TAU);c.fill();}}
  break;}
 case 'receptacle':{// the lotus: a ring of yellow stamens, then the flat-topped green cone with its seed holes
  const n=C.n||40;c.lineCap='round';for(let i=0;i<n;i++){const a=i*K_TAU/n+Krand(i,12)*.1,r0=r*.62,l=r*.62*vis*(.75+.5*Krand(i,13));c.strokeStyle=sh(i%2?'#f2d050':'#e0b838');c.lineWidth=r*.05;
   c.beginPath();c.moveTo(Math.cos(a)*r0,Math.sin(a)*r0);c.lineTo(Math.cos(a)*(r0+l),Math.sin(a)*(r0+l));c.stroke();c.fillStyle=sh(C.tip||'#ffe060');c.beginPath();c.arc(Math.cos(a)*(r0+l),Math.sin(a)*(r0+l),r*.06,0,K_TAU);c.fill();}
  // the side of the cone, stacked towards the viewer (the plane is seen at an angle, so a few shifted discs read as a short drum)
  for(let i=0;i<6;i++){const f=i/5;c.fillStyle=sh(Kmix('#8aa040','#c8d468',f));c.beginPath();c.arc(0,0,r*.66*(1-.08*(1-f)),0,K_TAU);c.fill();}
  const g=c.createRadialGradient(-r*.15,-r*.15,0,0,0,r*.66);g.addColorStop(0,sh('#e8ec9a'));g.addColorStop(1,sh(C.col||'#c8cc60'));c.fillStyle=g;c.beginPath();c.arc(0,0,r*.6,0,K_TAU);c.fill();
  c.strokeStyle=sh('#7a8a30');c.lineWidth=r*.025;c.stroke();for(let i=0;i<13;i++){const f=i?Math.sqrt(i/13)*.48:0,a=i*2.4,x=Math.cos(a)*r*f,y=Math.sin(a)*r*f;c.fillStyle=sh('#6a7a28');c.beginPath();c.arc(x,y,r*.065,0,K_TAU);c.fill();c.fillStyle=sh('#3a4a18');c.beginPath();c.arc(x+r*.012,y+r*.012,r*.04,0,K_TAU);c.fill();}break;}
 case 'eye':{// a small mouth: the dark (or golden) heart of the cyclamen and the violet
  const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,sh(C.col));g.addColorStop(.6,Krgba(sh(C.col),.7));g.addColorStop(1,Krgba(sh(C.col),0));c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,K_TAU);c.fill();
  c.fillStyle=sh(fpShade(C.col,.6));c.beginPath();c.arc(0,0,r*.35,0,K_TAU);c.fill();break;}
 case 'tube':{// the throat of a funnel: green-white deep inside, five pale bands like the folds of the moonflower
  const g=c.createRadialGradient(0,0,0,0,0,r*1.6);g.addColorStop(0,sh('#4a6a3a'));g.addColorStop(.3,sh(C.col||'#c8dca0'));g.addColorStop(1,Krgba(sh('#f4f8ec'),0));c.fillStyle=g;c.beginPath();c.arc(0,0,r*1.6,0,K_TAU);c.fill();
  c.strokeStyle=Krgba(sh('#e6f0d4'),.6*vis);c.lineWidth=r*.08;for(let i=0;i<5;i++){const a=i*K_TAU/5-Math.PI/2;c.beginPath();c.moveTo(Math.cos(a)*r*.3,Math.sin(a)*r*.3);c.lineTo(Math.cos(a)*r*2.6,Math.sin(a)*r*2.6);c.stroke();}
  c.fillStyle=sh('#f0e8a0');for(let i=0;i<5;i++){const a=i*K_TAU/5+.3;c.beginPath();c.arc(Math.cos(a)*r*.22,Math.sin(a)*r*.22,r*.08,0,K_TAU);c.fill();}break;}
 case 'corona':{// the passion flower: banded filaments (purple, white, blue) radiating flat, a short inner fringe, the column in 3D after
  const n=C.n||96,white=!!C.white;c.lineCap='round';
  for(let i=0;i<n;i++){const a=i*K_TAU/n+Krand(i,14)*.03,l=r*(.85+.15*Krand(i,15))*vis,wv=Math.sin(i*.9)*r*.03,seg=[[.18,.34,white?'#f4f0f6':'#4a1458'],[.34,.56,white?'#ffffff':'#f6f2f8'],[.56,1,white?'#f8f6fa':'#4c70d8']];
   c.lineWidth=Math.max(px*.8,r*.018);for(const [u0,u1,col] of seg){if(l<r*u0)continue;const e=Math.min(l,r*u1);c.strokeStyle=sh(col);c.beginPath();c.moveTo(Math.cos(a)*r*u0,Math.sin(a)*r*u0);c.lineTo(Math.cos(a)*e+Math.sin(a)*wv,Math.sin(a)*e-Math.cos(a)*wv);c.stroke();}}
  for(let i=0;i<60;i++){const a=i*K_TAU/60;c.strokeStyle=sh(white?'#e8e0f0':'#7a2a8a');c.lineWidth=r*.012;c.beginPath();c.moveTo(Math.cos(a)*r*.08,Math.sin(a)*r*.08);c.lineTo(Math.cos(a)*r*.17,Math.sin(a)*r*.17);c.stroke();}
  c.fillStyle=sh('#c8d8a8');c.beginPath();c.arc(0,0,r*.09,0,K_TAU);c.fill();break;}
 }
 c.restore();
 if(C.k==='corona'&&vis>.1)fpPassionColumn(c,B,o,vis,k);}

// The centres that stand out of the flower along its axis: the spadix of the calla, the stamens of the lily, the column of the hibiscus.
const fpP=(o,v)=>[o.x+o.R*v[0],o.y+o.R*v[1]];
function fpCentre3D(c,C,B,o,vis,k){const {A,e1,e2}=B,R=o.R,sh=x=>fpShade(x,k);c.save();c.lineCap='round';
 if(C.k==='spadix'){const L=C.len*(.4+.6*vis),b=fpP(o,fpSc(A,.05)),t=fpP(o,fpSc(A,L)),wd=Math.max(1.5,C.r*R*2);
  c.strokeStyle=sh('#8a6a08');c.lineWidth=wd+2;c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();
  const g=c.createLinearGradient(b[0]-wd,b[1],b[0]+wd,b[1]);g.addColorStop(0,sh('#ffe36a'));g.addColorStop(1,sh(C.col||'#f2c41a'));c.strokeStyle=g;c.lineWidth=wd;c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();
  c.fillStyle=sh('#fff2a0');for(let i=0;i<22;i++){const f=.1+.85*Krand(i,16),x=fpL0(b[0],t[0],f)+(Krand(i,17)-.5)*wd*.6,y=fpL0(b[1],t[1],f)+(Krand(i,18)-.5)*wd*.3;c.beginPath();c.arc(x,y,Math.max(.6,wd*.09),0,K_TAU);c.fill();}}
 else if(C.k==='lily'){const parts=[];for(let i=0;i<7;i++){const pist=i===6,th=i*K_TAU/6+.26,spr=pist?.04:.32,dir=fpNorm(fpAdd(fpSc(A,Math.cos(spr)),fpSc(fpAdd(fpSc(e1,Math.cos(th)),fpSc(e2,Math.sin(th))),Math.sin(spr)))),L=C.len*(pist?1.08:(.86+.1*Krand(i,19)))*(.3+.7*vis);
   const tip=fpSc(dir,L),mid=fpAdd(fpSc(dir,L*.55),fpSc(A,L*.05));parts.push({pist,tip,mid,z:tip[2]});}
  parts.sort((a,b)=>a.z-b.z);const b0=fpP(o,[0,0,0]);
  for(const q of parts){const t=fpP(o,q.tip),m=fpP(o,q.mid);c.strokeStyle=sh(q.pist?'#cfe0a0':'#e8f0d0');c.lineWidth=Math.max(1,R*(q.pist?.014:.009));c.beginPath();c.moveTo(b0[0],b0[1]);c.quadraticCurveTo(m[0],m[1],t[0],t[1]);c.stroke();
   if(vis>.3){const a=Math.atan2(t[1]-m[1],t[0]-m[0])+Math.PI/2;c.save();c.translate(t[0],t[1]);c.rotate(a);if(q.pist){c.fillStyle=sh('#b8d070');for(let j=0;j<3;j++){c.beginPath();c.arc((j-1)*R*.014,0,R*.016,0,K_TAU);c.fill();}}
    else{c.fillStyle=sh('#8a4a08');c.beginPath();c.ellipse(R*.004,R*.004,R*.05,R*.016,0,0,K_TAU);c.fill();c.fillStyle=sh(C.col||'#e8a020');c.beginPath();c.ellipse(0,0,R*.05,R*.015,0,0,K_TAU);c.fill();}c.restore();}}}
 else{// the hibiscus column: it leaves the throat along the axis and bends a little down; stamens along the upper part, five red pads at the end
  const L=C.len*(.25+.75*vis),gdn=[0,.18*L,0],t=fpAdd(fpSc(A,L),gdn),m=fpAdd(fpSc(A,L*.55),fpSc(gdn,.25)),P0=fpP(o,fpSc(A,.02)),Pm=fpP(o,m),Pt=fpP(o,t),wd=Math.max(1.5,C.r*R);
  c.strokeStyle=sh('#7a1020');c.lineWidth=wd+2;c.beginPath();c.moveTo(P0[0],P0[1]);c.quadraticCurveTo(Pm[0],Pm[1],Pt[0],Pt[1]);c.stroke();c.strokeStyle=sh(C.col||'#ff4a4a');c.lineWidth=wd;c.stroke();
  const at=f=>[(1-f)*(1-f)*P0[0]+2*f*(1-f)*Pm[0]+f*f*Pt[0],(1-f)*(1-f)*P0[1]+2*f*(1-f)*Pm[1]+f*f*Pt[1]];
  if(vis>.2)for(let i=0;i<26;i++){const f=.5+.42*i/26,[x,y]=at(f),a=Krand(i,20)*K_TAU,l=wd*(1+.8*Krand(i,21));c.strokeStyle=sh('#ffd8a0');c.lineWidth=Math.max(.6,wd*.25);c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();c.fillStyle=sh(C.pollen||'#ffd02a');c.beginPath();c.arc(x+Math.cos(a)*l,y+Math.sin(a)*l,Math.max(.8,wd*.35),0,K_TAU);c.fill();}
  if(vis>.4){const [ex,ey]=at(1);for(let j=0;j<5;j++){const a=j*K_TAU/5,x=ex+Math.cos(a)*wd*1.3,y=ey+Math.sin(a)*wd*1.3;c.strokeStyle=sh('#d02030');c.lineWidth=Math.max(.6,wd*.3);c.beginPath();c.moveTo(ex,ey);c.lineTo(x,y);c.stroke();c.fillStyle=sh('#a8001a');c.beginPath();c.arc(x,y,Math.max(1,wd*.55),0,K_TAU);c.fill();}}}
 c.restore();}
const fpL0=(a,b,t)=>a+(b-a)*t;
// The column of the passion flower: green, short, with five flat anthers and three stigmas above them.
function fpPassionColumn(c,B,o,vis,k){const {A,e1,e2}=B,R=o.R,sh=x=>fpShade(x,k),top=fpSc(A,.24*vis),b=fpP(o,fpSc(A,.03)),t=fpP(o,top);c.save();c.lineCap='round';
 c.strokeStyle=sh('#5a7a3a');c.lineWidth=Math.max(1.5,R*.05);c.beginPath();c.moveTo(b[0],b[1]);c.lineTo(t[0],t[1]);c.stroke();c.strokeStyle=sh('#b8d088');c.lineWidth=Math.max(1,R*.03);c.stroke();
 for(let j=0;j<5;j++){const a=j*K_TAU/5,d=fpAdd(top,fpAdd(fpSc(e1,Math.cos(a)*.16),fpSc(e2,Math.sin(a)*.16))),p=fpP(o,fpAdd(d,fpSc(A,-.04)));c.strokeStyle=sh('#9ab868');c.lineWidth=Math.max(.7,R*.01);c.beginPath();c.moveTo(t[0],t[1]);c.lineTo(p[0],p[1]);c.stroke();
  c.save();c.translate(p[0],p[1]);c.rotate(a+Math.PI/2);c.fillStyle=sh('#d8c840');c.beginPath();c.ellipse(0,0,R*.05,R*.022,0,0,K_TAU);c.fill();c.strokeStyle=sh('#7a6a10');c.lineWidth=Math.max(.5,R*.004);c.stroke();c.restore();}
 const top2=fpSc(A,.32*vis);for(let j=0;j<3;j++){const a=j*K_TAU/3+.5,d=fpAdd(top2,fpAdd(fpSc(e1,Math.cos(a)*.1),fpSc(e2,Math.sin(a)*.1))),p=fpP(o,d);c.strokeStyle=sh('#6a3a2a');c.lineWidth=Math.max(.8,R*.012);c.beginPath();c.moveTo(t[0],t[1]);c.lineTo(p[0],p[1]);c.stroke();c.fillStyle=sh('#4a2418');c.beginPath();c.arc(p[0],p[1],Math.max(1,R*.022),0,K_TAU);c.fill();}
 c.restore();}

// ── A spike of bells (the foxglove) ─────────────────────────────────────────────────────────────────────────────────────────
// The bells hang on one side of the spike and open from the bottom up; each one is a folded-card tube seen from the side, with its
// mouth turned down and out, and the spotted floor of the mouth showing.
function fpSpike(c,sp,st){const p=Kclamp(st.p),R=st.R,n=sp.bells,S=sp.spike,dim=st.dim||0,lean=S.lean*(st.lean??1),sway=(st.sway||0);
 const top=[st.x+lean*R+sway*R*.15,st.y-S.len*R*.62],bot=[st.x,st.y+S.len*R*.38];
 const at=f=>[fpLerp(bot[0],top[0],f*f)+Math.sin(f*Math.PI)*R*.04,fpLerp(bot[1],top[1],f)];
 c.save();if(st.alpha!==undefined)c.globalAlpha*=st.alpha;
 c.strokeStyle=fpShade(sp.stem.col,.9*(1-dim*.7));c.lineWidth=Math.max(1.5,R*.032);c.lineCap='round';c.beginPath();for(let i=0;i<=24;i++){const q=at(i/24);i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]);}c.stroke();
 const items=[];for(let i=0;i<n;i++){const f=.08+.8*i/(n-1),start=i/n*.7,q=Ksmooth(Kclamp((p-start)/.32)),sz=fpLerp(1,.5,i/(n-1)),side=i%3===2?-1:1;items.push({f,q,sz,side,i});}
 // buds at the very top, then the bells from the top down (the lower ones are nearer and larger)
 for(let k=0;k<5;k++){const [x,y]=at(.9+k*.025);c.fillStyle=fpShade(Kmix('#5b7a3a',sp.bell.col[0],.3),.8*(1-dim*.7));c.beginPath();c.ellipse(x+(k%2?1:-1)*R*.025,y,R*.022*(1-k*.12),R*.035*(1-k*.12),0,0,K_TAU);c.fill();}
 for(let i=items.length-1;i>=0;i--){const b=items[i],[x,y]=at(b.f),hx=x+b.side*R*.07*b.sz,hy=y+R*.02;
  c.strokeStyle=fpShade(sp.stem.col,.75*(1-dim*.7));c.lineWidth=Math.max(1,R*.012);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+b.side*R*.06*b.sz,y-R*.03,hx,hy);c.stroke();
  fpBell(c,sp,hx,hy,R*sp.bell.len*b.sz*fpLerp(.45,1,b.q),b.side*(.55+.25*b.q)+sway*.1,b.q,dim,st);}
 c.restore();}
function fpBell(c,sp,x,y,L,ang,q,dim,st){const B=sp.bell,cols=B.col,k=1-dim*.82,open=Ksmooth(Kclamp((q-.25)/.75)),w0=L*.15,w1=L*fpLerp(.18,.42,open),lip=L*.12*open;
 c.save();c.translate(x,y);c.rotate(ang);
 const body=fpPath2D();body.moveTo(-w0,0);body.bezierCurveTo(-w0*1.4,L*.4,-w1*.9,L*.7,-w1,L);body.quadraticCurveTo(0,L+lip*.5,w1,L+lip);body.bezierCurveTo(w1*.95,L*.7,w0*1.4,L*.4,w0,0);body.closePath();
 const col=x=>fpShade(Kmix('#4f6e34',x,Ksmooth(Kclamp(q*1.5))),k);
 c.fillStyle='rgba(8,2,10,.22)';c.save();c.translate(L*.04,L*.06);c.fill(body);c.restore();
 const g=c.createLinearGradient(-w1,0,w1,0);g.addColorStop(0,col(cols[2]));g.addColorStop(.48,col(cols[1]));g.addColorStop(.52,col(fpShade(cols[1],.82)));g.addColorStop(1,col(cols[0]));c.fillStyle=g;c.fill(body);
 const pat=fpPattern(c,'card',ang,.5);if(pat){c.save();c.globalCompositeOperation='overlay';c.globalAlpha=.4*(1-dim*.6);c.fillStyle=pat;c.fill(body);c.restore();}
 // the mouth: the dark inside and the spotted lower lip
 if(open>.05){c.save();c.translate(0,L+lip*.5);c.rotate(-.18);c.beginPath();c.ellipse(0,0,w1*.96,w1*.42*open+L*.02,0,0,K_TAU);const gm=c.createRadialGradient(0,-w1*.2,0,0,0,w1);gm.addColorStop(0,fpShade('#2a0a26',k));gm.addColorStop(1,fpShade(cols[0],k*.8));c.fillStyle=gm;c.fill();
  c.clip();c.fillStyle=fpShade('#e8b8dc',k);c.beginPath();c.ellipse(0,w1*.26,w1*.8,w1*.3*open,0,0,K_TAU);c.fill();
  for(let i=0;i<16;i++){const sx=(Krand(i,71)-.5)*w1*1.4,sy=w1*(.1+.26*Krand(i,72)),r=Math.max(.6,w1*.045);c.fillStyle=fpShade('#f4dcee',k);c.beginPath();c.arc(sx,sy,r*1.5,0,K_TAU);c.fill();c.fillStyle=fpShade('#6a1a5a',k);c.beginPath();c.arc(sx,sy,r,0,K_TAU);c.fill();}
  c.restore();}
 c.strokeStyle=Krgba(fpShade(cols[0],.35),.8);c.lineWidth=Math.max(.7,L*.02);c.stroke(body);
 if(st.rim&&dim>.05){c.strokeStyle=Krgba(st.rim,.5*dim);c.stroke(body);}
 c.restore();}
// ── A sprig of small stars (the jasmine) ───────────────────────────────────────────────────────────────────────────────────
// A twig with three little cymes; each star is a small radial flower of five petals that opens after the one before.
function fpCluster(c,sp,st){const p=Kclamp(st.p),R=st.R,n=sp.stars,dim=st.dim||0,sway=st.sway||0,k=1-dim*.75,seed=st.seed||0;c.save();if(st.alpha!==undefined)c.globalAlpha*=st.alpha;
 const base=[st.x,st.y+R*.05],tips=[[-.55,-.35],[.1,-.62],[.6,-.2]].map(([dx,dy])=>[st.x+dx*R+sway*R*.08,st.y+dy*R]);
 c.lineCap='round';c.strokeStyle=fpShade(sp.stem.col,.85*k);c.lineWidth=Math.max(1,R*.018);for(const t of tips){c.beginPath();c.moveTo(base[0],base[1]);c.quadraticCurveTo((base[0]+t[0])/2,base[1]-R*.05,t[0],t[1]);c.stroke();}
 const items=[];for(let i=0;i<n;i++){const cy=i%3,t=tips[cy],a=(i/3|0)*2.1+cy+Krand(i,seed+5),d=R*(.16+.12*Krand(i,seed+6)),x=t[0]+Math.cos(a)*d,y=t[1]+Math.sin(a)*d*.8,start=(i/n)*.62,q=Kclamp((p-start)/.38);
  items.push({x,y,q,i,t,tilt:.75+.65*Krand(i,seed+7),yaw:(Krand(i,seed+8)-.5)*1.6,z:Krand(i,seed+9)});}
 items.sort((a,b)=>b.z-a.z);
 for(const it of items){c.strokeStyle=fpShade(sp.stem.col,.8*k);c.lineWidth=Math.max(.8,R*.01);c.beginPath();c.moveTo(it.t[0],it.t[1]);c.lineTo(it.x,it.y);c.stroke();}
 for(const it of items){const star={name:sp.name,tech:sp.tech,tilt:it.tilt,nod:.25,whorls:[{...sp.star,n:5,th0:it.i*.7,delay:0,stagger:0,dur:1}],center:{k:'tube',r:.12,lift:0,col:'#e8dca0'}};
  fpFlower(c,star,{x:it.x,y:it.y,R:R*.3,p:it.q,wake:st.wake,t:st.t,breath:st.breath,yaw:it.yaw,dim,rim:st.rim,white:st.white,glow:st.glow,seed:it.i+seed});}
 c.restore();}

// ── The bird of paradise ────────────────────────────────────────────────────────────────────────────────────────────────────
// Seen from the side: the green beak (the spathe) points to one side; out of it rise the orange sepals one after another, and the
// blue arrow of the petals between them.
function fpSheet(c,pts,b,t,cols,k,o={}){const P=fpPath2D(),n=pts.length,m=i=>{const a=pts[i%n],z=pts[(i+1)%n];return [(a[0]+z[0])/2,(a[1]+z[1])/2];};let q=m(0);P.moveTo(q[0],q[1]);for(let i=1;i<=n;i++){const a=pts[i%n],e=m(i);P.quadraticCurveTo(a[0],a[1],e[0],e[1]);}P.closePath();
 const sz=Math.hypot(t[0]-b[0],t[1]-b[1]);c.fillStyle='rgba(6,2,8,.2)';c.save();c.translate(sz*.03,sz*.05);c.fill(P);c.restore();
 const g=c.createLinearGradient(b[0],b[1],t[0],t[1]);g.addColorStop(0,fpShade(cols[0],k));g.addColorStop(.5,fpShade(cols[1],k));g.addColorStop(1,fpShade(cols[2],k));c.fillStyle=g;c.fill(P);
 if(o.fold){c.save();c.clip(P);c.fillStyle='rgba(10,4,12,.18)';c.beginPath();c.moveTo(b[0],b[1]);for(const v of o.fold)c.lineTo(v[0],v[1]);c.lineTo(t[0],t[1]);c.closePath();c.fill();c.restore();}
 const pat=fpPattern(c,o.tech||'water',Math.atan2(t[1]-b[1],t[0]-b[0]),.7);if(pat){const T=FP_TECH[o.tech||'water'];c.save();c.globalCompositeOperation=T.op;c.globalAlpha=T.a;c.fillStyle=pat;c.fill(P);c.restore();}
 c.lineJoin='round';c.strokeStyle=Krgba(fpShade(cols[0],.35),.8);c.lineWidth=Math.max(.7,sz*.012);c.stroke(P);return P;}
function fpBird(c,sp,st){const p=Kclamp(st.p),R=st.R*1.3,dim=st.dim||0,k=1-dim*.8,dir=st.dir||1,wake=Ksmooth(Kclamp(st.wake??(p>0?1:0)));c.save();if(st.alpha!==undefined)c.globalAlpha*=st.alpha;
 const J=[st.x-dir*R*.45,st.y+R*.32],X=(u,v)=>[J[0]+dir*u*R,J[1]+v*R],lift=fpLerp(.12,0,wake);
 // the beak, a boat with a pointed bow
 const beak=[X(-.08,.03),X(.25,.17+lift*.2),X(.7,.14),X(1.15,.01-lift),X(1.24,-.06-lift),X(.8,-.06),X(.35,-.11),X(.05,-.1)];
 const opened=[];for(let i=0;i<3;i++){const q=Ksmooth(Kclamp((p-.06-i*.2)/.36));opened.push(q);}
 const E=X(.42,-.07);
 // the sepals and the arrow behind the near edge of the beak: drawn first, the beak's near lip over their bases
 const sep=(i,q)=>{if(q<=0)return;const L=R*[1.02,.9,.8][i]*fpLerp(.35,1,q),ang=fpLerp(-.08,[1.25,.95,.62][i],fpSpring(q)),dx=Math.cos(ang)*dir,dy=-Math.sin(ang),nx=-dy,ny=dx*1,w=R*.12*(1-.1*i);
  const pt=f=>{const s=Math.sin(Math.PI*Math.pow(f,.7));return s;},pts=[];const bend=R*.06*(i===0?1:.6);
  for(let j=0;j<=10;j++){const f=j/10,cx=E[0]+dx*L*f-nx*bend*f*f*dir,cy=E[1]+dy*L*f-ny*bend*f*f*dir,hw=w*pt(f);pts.push([cx+nx*hw,cy+ny*hw]);}
  for(let j=10;j>=0;j--){const f=j/10,cx=E[0]+dx*L*f-nx*bend*f*f*dir,cy=E[1]+dy*L*f-ny*bend*f*f*dir,hw=w*pt(f)*.85;pts.push([cx-nx*hw,cy-ny*hw]);}
  const tip=[E[0]+dx*L,E[1]+dy*L];fpSheet(c,pts,E,tip,sp.sepals,k*(.9+.1*i),{tech:sp.tech,fold:pts.slice(0,11)});};
 const tongue=q=>{if(q<=0)return;const L=R*.82*fpLerp(.3,1,q),ang=fpLerp(.1,.78,fpSpring(q)),dx=Math.cos(ang)*dir,dy=-Math.sin(ang),nx=-dy,ny=dx,w=R*.05,pts=[];
  for(let j=0;j<=12;j++){const f=j/12,lobe=f>.18&&f<.42?R*.06*Math.sin((f-.18)/.24*Math.PI):0,hw=w*(1-Math.pow(f,1.6))+lobe;pts.push([E[0]+dx*L*f+nx*hw,E[1]+dy*L*f+ny*hw]);}
  for(let j=12;j>=0;j--){const f=j/12,hw=w*.7*(1-Math.pow(f,1.6));pts.push([E[0]+dx*L*f-nx*hw,E[1]+dy*L*f-ny*hw]);}fpSheet(c,pts,E,[E[0]+dx*L,E[1]+dy*L],sp.tongue,k,{tech:sp.tech});};
 sep(2,opened[2]);sep(1,opened[1]);tongue(Ksmooth(Kclamp((p-.18)/.4)));sep(0,opened[0]);
 const bk=fpSheet(c,beak,X(0,0),X(1.2,-.02),[sp.beak[0],sp.beak[1],sp.beak[1]],k,{tech:'card'});
 c.save();c.clip(bk);const gl=c.createLinearGradient(J[0],J[1]-R*.05,J[0],J[1]+R*.16);gl.addColorStop(0,'rgba(0,0,0,0)');gl.addColorStop(1,Krgba(fpShade(sp.beak[2],k),.85));c.fillStyle=gl;c.fill(bk);c.restore();
 if(st.rim&&dim>.05){c.strokeStyle=Krgba(st.rim,.5*dim);c.lineWidth=Math.max(.8,R*.006);c.stroke(bk);}
 c.restore();}

// ── The calla ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// One white spathe rolled into a funnel round the yellow spadix. Seen from the front: the inner face (the back wall of the funnel, up
// to the pointed tip that turns back), the spadix, and the front lip that rolls outwards and closes the funnel at its foot. In the
// bud it is a tall, tightly rolled cone; it unrolls, the mouth widens and the tip bends back.
function fpFunnel(c,sp,st){const p=Kclamp(st.p),R=st.R,dim=st.dim||0,k=1-dim*.8,o=Ksmooth(Kclamp((p-.05)/.85)),sway=(st.sway||0)*R*.05,br=(st.breath||0)*Math.sin((st.t||0)*1.35+(st.seed||0))*.015;
 const sc=fpLerp(.7,1,Ksmooth(Kclamp(p*1.4)))*(1+br),Rs=R*sc,cx=st.x+sway,base=[cx,st.y+Rs*.62],cols=sp.spathe,sh=x=>fpShade(x,k);
 const mw=Rs*fpLerp(.16,.72,o),my=st.y-Rs*fpLerp(.1,.18,o),tip=[cx+Rs*fpLerp(.02,.16,o),st.y-Rs*fpLerp(.95,.98,o)],lipY=st.y+Rs*fpLerp(-.2,.12,o);
 c.save();if(st.alpha!==undefined)c.globalAlpha*=st.alpha;
 // the back wall
 const back=fpPath2D();back.moveTo(base[0]-Rs*.07,base[1]);back.bezierCurveTo(cx-Rs*.2,st.y+Rs*.25,cx-mw*1.05,my+Rs*.25,cx-mw,my);back.bezierCurveTo(cx-mw*.85,my-Rs*.45,tip[0]-Rs*.25,tip[1]+Rs*.2,tip[0],tip[1]);
 back.bezierCurveTo(tip[0]+Rs*.18,tip[1]+Rs*.25,cx+mw*.95,my-Rs*.4,cx+mw,my);back.bezierCurveTo(cx+mw*1.05,my+Rs*.25,cx+Rs*.2,st.y+Rs*.25,base[0]+Rs*.07,base[1]);back.closePath();
 c.fillStyle='rgba(6,4,6,.22)';c.save();c.translate(Rs*.03,Rs*.05);c.fill(back);c.restore();
 const g=c.createLinearGradient(cx,base[1],cx,tip[1]);g.addColorStop(0,sh(sp.throat));g.addColorStop(.3,sh(cols[1]));g.addColorStop(1,sh(cols[2]));c.fillStyle=g;c.fill(back);
 const gi=c.createRadialGradient(cx,st.y+Rs*.15,0,cx,st.y+Rs*.15,Rs*.6);gi.addColorStop(0,'rgba(40,60,30,.28)');gi.addColorStop(1,'rgba(40,60,30,0)');c.fillStyle=gi;c.fill(back);
 const pat=fpPattern(c,sp.tech,0,.9*Math.max(.5,R/220),cx,base[1]);if(pat){const T=FP_TECH[sp.tech];c.save();c.globalCompositeOperation=T.op;c.globalAlpha=T.a;c.fillStyle=pat;c.fill(back);c.restore();}
 c.save();c.clip(back);c.strokeStyle=Krgba(sh('#c8d8b8'),.45);c.lineWidth=Math.max(.6,Rs*.006);for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(cx+i*Rs*.02,base[1]);c.quadraticCurveTo(cx+i*mw*.3,my,fpLerp(cx,tip[0],.5+i*.05)+i*mw*.18,tip[1]+Rs*.25);c.stroke();}
 // the tip turns back: a darker sliver of the outer face
 if(o>.3){c.fillStyle=Krgba(sh(cols[0]),.5*(o-.3));c.beginPath();c.moveTo(tip[0],tip[1]);c.quadraticCurveTo(tip[0]+Rs*.12,tip[1]+Rs*.14,tip[0]+Rs*.2,tip[1]+Rs*.3);c.quadraticCurveTo(tip[0]+Rs*.05,tip[1]+Rs*.18,tip[0]-Rs*.04,tip[1]+Rs*.06);c.closePath();c.fill();}c.restore();
 c.lineJoin='round';c.strokeStyle=Krgba(sh(cols[0]),.8);c.lineWidth=Math.max(.7,Rs*.008);c.stroke(back);
 // the spadix
 const sl=Rs*fpLerp(.3,.62,o),sx=cx+Rs*.01,sy0=st.y+Rs*.32,sw=Math.max(2,Rs*.075);if(o>.02){c.lineCap='round';c.strokeStyle=sh('#8a6a08');c.lineWidth=sw+2;c.beginPath();c.moveTo(sx,sy0);c.lineTo(sx+Rs*.02,sy0-sl);c.stroke();
  const gs=c.createLinearGradient(sx-sw,0,sx+sw,0);gs.addColorStop(0,sh('#fff090'));gs.addColorStop(1,sh(sp.spadix));c.strokeStyle=gs;c.lineWidth=sw;c.stroke();
  c.fillStyle=sh('#fff6c0');for(let i=0;i<18;i++){const f=Krand(i,23),x=sx+Rs*.02*f+(Krand(i,24)-.5)*sw*.6,y=sy0-sl*f;c.beginPath();c.arc(x,y,Math.max(.6,sw*.1),0,K_TAU);c.fill();}}
 // the front lip: the outer face below, and the rolled edge
 const lip=fpPath2D(),lw=mw*1.02;lip.moveTo(base[0]-Rs*.08,base[1]);lip.bezierCurveTo(cx-Rs*.16,st.y+Rs*.3,cx-lw*.95,my+Rs*.28,cx-lw,my+Rs*.05);
 lip.bezierCurveTo(cx-lw*.6,lipY-Rs*.02,cx+lw*.3,lipY+Rs*.04,cx+lw,my+Rs*.12);lip.bezierCurveTo(cx+lw*.9,my+Rs*.32,cx+Rs*.16,st.y+Rs*.32,base[0]+Rs*.08,base[1]);lip.closePath();
 c.fillStyle='rgba(6,4,6,.25)';c.save();c.translate(0,-Rs*.02);c.fill(lip);c.restore();
 const gl=c.createLinearGradient(cx-lw,0,cx+lw,0);gl.addColorStop(0,sh(cols[2]));gl.addColorStop(.55,sh(cols[1]));gl.addColorStop(1,sh(fpShade(cols[1],.8)));c.fillStyle=gl;c.fill(lip);
 const gb=c.createLinearGradient(cx,lipY,cx,base[1]);gb.addColorStop(0,'rgba(0,0,0,0)');gb.addColorStop(1,Krgba(sh(cols[0]),.85));c.fillStyle=gb;c.fill(lip);
 if(pat){const T=FP_TECH[sp.tech];c.save();c.globalCompositeOperation=T.op;c.globalAlpha=T.a;c.fillStyle=pat;c.fill(lip);c.restore();}
 c.strokeStyle=Krgba(sh(cols[0]),.85);c.lineWidth=Math.max(.7,Rs*.008);c.stroke(lip);
 c.strokeStyle=Krgba('#ffffff',.55*k);c.lineWidth=Math.max(1,Rs*.012);c.beginPath();c.moveTo(cx-lw*.95,my+Rs*.07);c.bezierCurveTo(cx-lw*.6,lipY,cx+lw*.3,lipY+Rs*.06,cx+lw*.95,my+Rs*.13);c.stroke();
 if(st.rim&&dim>.05){c.strokeStyle=Krgba(st.rim,.5*dim);c.lineWidth=Math.max(.8,R*.006);c.stroke(back);c.stroke(lip);}
 if(st.glow&&sp.tech==='tissue'&&p>.3){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.18*p;c.strokeStyle=cols[2];c.lineWidth=Math.max(1,R*.012);c.stroke(back);c.restore();}
 c.restore();}

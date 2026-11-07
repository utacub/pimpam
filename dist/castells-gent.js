// Fem castells, 0.45.7: the castellers as people. Each one is an articulated body (pelvis, chest, neck, head, shoulders, elbows, hands,
// hips, knees and feet) whose legs and arms reach their holds by two-bone inverse kinematics, so that a casteller can stand on the
// shoulders of the one below, grab the faixa of the one in front while climbing, hold the neighbours by the shoulders, squat as the
// aixecador or raise an open hand as the enxaneta. The look follows the real dress: a shirt of the colla's colour with collar and
// rolled-up sleeves, white trousers, a black faixa wound round the waist with its fringed end, bare feet (castellers climb barefoot;
// Castell, 2026), red mocadors with white spots on the head, at the neck or on the wrist, and a helmet for the children of the pom de
// dalt. Still the smooth glazed ceramic of 0.15: flat colours with a soft glaze, a highlight and a dark contour.
// facing: −1 seen from behind (the castellers of the trunk face the inside of the castell, so those at the front show their backs), 1
// seen from the front; turn (0.45–1) narrows the shoulders and hips for those standing at an angle.
import {Kclamp,Kmix,Krand} from './kaleido-base.js';

const FG_INK='#1b1424',FG_TROUSERS='#f4f0e6',FG_SASH='#211d26',FG_MOC='#c8242c';
const FG_SKINS=['#f2cba3','#e9b88d','#dda274','#c58659','#a56b45','#f6d8bb','#8a5636'];
const FG_HAIRS=['#2a1d17','#3d2a1e','#5a3a22','#1c1a1d','#7a4a26','#b47c3e','#d8b06a','#8f8a86','#4a2a1a'];
// What a casteller looks like, from a seed: skin, hair and its style, where the mocador goes, and how broad the body is.
export function fgLook(seed,o={}){const r=i=>Krand(seed*7.31+i,41);const kid=!!o.kid;
 const hairStyle=Math.floor(r(3)*6),moc=o.noMoc?null:r(4)<.12?'head':r(4)<.3?'neck':r(4)<.42?'wrist':null;
 return {seed,kid,shirt:o.shirt||'#2f9e52',skin:FG_SKINS[Math.floor(r(1)*FG_SKINS.length)],hair:FG_HAIRS[Math.floor(r(2)*(kid?6:FG_HAIRS.length))],
  hairStyle:kid&&hairStyle===5?1:hairStyle,moc:o.helmet?(moc==='head'?'neck':moc):moc,mocCol:o.mocCol||FG_MOC,broad:o.broad??(.94+r(5)*.14),helmet:!!o.helmet,helmetCol:o.helmetCol||'#f3f1ea'};}

// ── The skeleton ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Proportions as fractions of the standing height H (feet to the top of the head); a child has a bigger head and a shorter trunk.
export const fgDims=(H,kid,broad=1)=>kid?{thigh:.235*H,shin:.24*H,uarm:.165*H,farm:.14*H,hand:.07*H,torso:.29*H,neck:.03*H,hr:.095*H,sw:.095*H*broad,hw:.06*H*broad,stand:.5*H}
 :{thigh:.24*H,shin:.245*H,uarm:.17*H,farm:.145*H,hand:.065*H,torso:.305*H,neck:.026*H,hr:.078*H,sw:.122*H*broad,hw:.068*H*broad,stand:.52*H};
const fgV=(x,y)=>[x,y],fgAdd=(a,b,s=1)=>[a[0]+b[0]*s,a[1]+b[1]*s],fgLerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
export const fgMix=fgLerp;
// Two bones from A towards T: the joint and the end (the end stops short when T is out of reach). pick chooses between the two bends.
function fgIK(A,T,l1,l2,pick){let dx=T[0]-A[0],dy=T[1]-A[1],d=Math.hypot(dx,dy);if(!(d>1e-6)){dx=0;dy=1;d=1e-6;}
 const ux=dx/d,uy=dy/d,dd=Kclamp(d,Math.abs(l1-l2)+1e-3,l1+l2-1e-3),a=Math.acos(Kclamp((l1*l1+dd*dd-l2*l2)/(2*l1*dd),-1,1)),b=Math.atan2(uy,ux);
 const J1=[A[0]+Math.cos(b+a)*l1,A[1]+Math.sin(b+a)*l1],J2=[A[0]+Math.cos(b-a)*l1,A[1]+Math.sin(b-a)*l1],E=[A[0]+ux*dd,A[1]+uy*dd];
 return [pick(J1)>=pick(J2)?J1:J2,E];}
// The joints of a pose. p: H, kid, broad, pelvis [x,y], lean (radians, + to the right), feet [[x,y],[x,y]] (screen left, right),
// hands [[x,y],[x,y]], turn (0.45–1), headTilt, elbowUp (arms raised: the elbows go out and up, not down).
export function fgRig(p){const D=fgDims(p.H,p.kid,p.broad),lean=p.lean||0,turn=p.turn??1,up=[Math.sin(lean),-Math.cos(lean)],rt=[Math.cos(lean),Math.sin(lean)];
 const P=p.pelvis,N=fgAdd(P,up,D.torso*(p.torsoK??1)),sw=D.sw*turn,hw=D.hw*turn;
 const S=[fgAdd(fgAdd(N,rt,-sw),up,-.025*p.H),fgAdd(fgAdd(N,rt,sw),up,-.025*p.H)],Hp=[fgAdd(P,rt,-hw),fgAdd(P,rt,hw)];
 const ht=lean+(p.headTilt||0),hu=[Math.sin(ht),-Math.cos(ht)],neckTop=fgAdd(N,up,D.neck),head=fgAdd(neckTop,hu,D.hr*.92);
 const legs=[0,1].map(i=>{const s=i?1:-1,f=p.feet?.[i]||[Hp[i][0]+s*.02*p.H,P[1]+D.stand];const r=fgIK(Hp[i],f,D.thigh,D.shin,J=>s*(J[0]-Hp[i][0]));
  // kneesFwd: the knees bend towards the castell (away from or towards the viewer), so the thigh and shin look foreshortened
  if(p.kneesFwd){const t=Kclamp(((r[0][0]-Hp[i][0])*(r[1][0]-Hp[i][0])+(r[0][1]-Hp[i][1])*(r[1][1]-Hp[i][1]))/Math.max(1e-6,(r[1][0]-Hp[i][0])**2+(r[1][1]-Hp[i][1])**2)),m=fgLerp(Hp[i],r[1],t);r[0]=fgLerp(m,r[0],.22);}
  return r;});
 const arms=[0,1].map(i=>{const s=i?1:-1,h=p.hands?.[i]||[S[i][0]+s*.05*p.H,S[i][1]+.3*p.H];return fgIK(S[i],h,D.uarm,D.farm,J=>p.elbowUp?s*(J[0]-S[i][0])-(J[1]-S[i][1])*.3:(J[1]-S[i][1])+s*(J[0]-S[i][0])*.6);});
 return {p,D,P,N,S,Hp,up,rt,head,neckTop,ht,legs,arms,turn};}

// ── Drawing ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
let FG_LW=1.4;
function fgInk(c,w=FG_LW){c.lineJoin='round';c.lineCap='round';c.strokeStyle=FG_INK;c.lineWidth=w;c.stroke();}
// A glazed fill: the colour, light from the upper left and shade to the lower right across the shape, then the contour.
function fgGlaze(c,path,col,ax,ay,bx,by,light=.32,dark=.34,ink=true){path();c.fillStyle=col;c.fill();
 if(c.createLinearGradient){const g=c.createLinearGradient(ax,ay,bx,by);if(g){g.addColorStop(0,`rgba(255,250,238,${light})`);g.addColorStop(.48,'rgba(255,250,238,0)');g.addColorStop(1,`rgba(35,18,32,${dark})`);c.fillStyle=g;path();c.fill();}}
 if(ink){path();fgInk(c);}}
// A tapered limb from A (radius ra) to B (radius rb), with rounded ends.
function fgLimbPath(c,A,B,ra,rb){const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.max(1e-3,Math.hypot(dx,dy)),a=Math.atan2(dy,dx),s=Kclamp((ra-rb)/d,-.95,.95),off=Math.acos(s);
 c.beginPath();c.arc(A[0],A[1],ra,a+off,a+2*Math.PI-off);c.arc(B[0],B[1],rb,a-off,a+off);c.closePath();}
function fgLimb(c,A,B,ra,rb,col,light=.3,dark=.36){const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.max(1e-3,Math.hypot(dx,dy)),nx=-dy/d,ny=dx/d,s=nx<0||(nx===0&&ny<0)?-1:1,m=Math.max(ra,rb);
 const cx=(A[0]+B[0])/2,cy=(A[1]+B[1])/2;fgGlaze(c,()=>fgLimbPath(c,A,B,ra,rb),col,cx-s*nx*m,cy-s*ny*m,cx+s*nx*m,cy+s*ny*m,light,dark);}
// Limbs as tubes: every segment's contour first, then the fills over them, so that the joints merge into one smooth limb; then a
// highlight along the upper left side and a shade along the lower right, as on glazed ceramic.
function fgTubes(c,segs){c.lineCap='round';c.lineJoin='round';
 for(const [A,B,w] of segs){c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.strokeStyle=FG_INK;c.lineWidth=w+2*FG_LW;c.stroke();}
 for(const [A,B,w,col] of segs){c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.strokeStyle=col;c.lineWidth=w;c.stroke();}
 for(const [A,B,w,col] of segs){const dx=B[0]-A[0],dy=B[1]-A[1],d=Math.max(1e-3,Math.hypot(dx,dy));let nx=-dy/d,ny=dx/d;if(nx+ny>0){nx=-nx;ny=-ny;}
  const o=w*.24;c.beginPath();c.moveTo(A[0]+nx*o,A[1]+ny*o);c.lineTo(B[0]+nx*o,B[1]+ny*o);c.strokeStyle=Kmix(col,'#ffffff',.42);c.globalAlpha=.55;c.lineWidth=w*.26;c.stroke();
  c.beginPath();c.moveTo(A[0]-nx*o*1.1,A[1]-ny*o*1.1);c.lineTo(B[0]-nx*o*1.1,B[1]-ny*o*1.1);c.strokeStyle=Kmix(col,'#24122a',.45);c.globalAlpha=.4;c.lineWidth=w*.22;c.stroke();c.globalAlpha=1;}}
function fgLine(c,pts,w,col,alpha=1){c.save();c.globalAlpha*=alpha;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.lineCap='round';c.lineJoin='round';c.strokeStyle=col;c.lineWidth=w;c.stroke();c.restore();}
function fgDisc(c,x,y,r,col,ink=true){c.beginPath();c.ellipse(x,y,Math.max(.01,r),Math.max(.01,r),0,0,Math.PI*2);c.fillStyle=col;c.fill();if(ink)fgInk(c);}
// The red mocador with white spots, as a shape filled and dotted.
function fgSpots(c,path,x0,y0,w,h,r){c.save();path();c.clip();c.fillStyle='rgba(255,250,240,.9)';const n=Math.max(2,Math.round(w/(r*4.5)));for(let i=0;i<=n;i++)for(let j=0;j<=Math.round(h/(r*4.5));j++){c.beginPath();c.arc(x0+(i+(j%2)*.5)*w/n,y0+j*r*4.5,r,0,Math.PI*2);c.fill();}c.restore();}

// The legs, in white trousers, and the bare feet.
function fgLegs(c,R,L,facing){const {D,Hp,legs,p}=R,H=p.H;
 legs.forEach(([K,A],i)=>{const s=i?1:-1;fgTubes(c,[[Hp[i],K,H*.125,FG_TROUSERS],[K,fgLerp(K,A,.97),H*.095,FG_TROUSERS]]);
  // a crease down the trouser
  fgLine(c,[fgLerp(Hp[i],K,.3),K,fgLerp(K,A,.9)],Math.max(.6,H*.004),'rgba(80,70,90,.3)');
  // the bare foot: seen from behind the heel and the sole, from the front the toes
  const fx=A[0]+s*H*.006,fy=A[1]+H*.012;c.save();c.translate(fx,fy);c.rotate(s*.12);
  fgGlaze(c,()=>{c.beginPath();c.ellipse(0,0,H*.03,H*.022,0,0,Math.PI*2);},L.skin,-H*.03,-H*.02,H*.03,H*.02,.3,.3);
  if(facing>0){c.fillStyle='rgba(60,30,30,.35)';for(let t=-1;t<=1;t++){c.beginPath();c.arc(t*H*.011,H*.012,H*.004,0,Math.PI*2);c.fill();}}
  c.restore();});}
// The torso: the shirt from the shoulders to the waist, with its folds; the collar and placket from the front, the yoke from behind.
function fgTorso(c,R,L,facing){const {D,P,N,S,up,rt,p}=R,H=p.H,W=R.turn;
 const waist=fgAdd(P,up,.12*H),wl=fgAdd(waist,rt,-D.sw*.84*W),wr=fgAdd(waist,rt,D.sw*.84*W),arm=fgAdd(N,up,-.12*H);
 const al=fgAdd(arm,rt,-D.sw*1.0*W),ar=fgAdd(arm,rt,D.sw*1.0*W),nl=fgAdd(N,rt,-.04*H*W),nr=fgAdd(N,rt,.04*H*W);
 const path=()=>{c.beginPath();c.moveTo(wl[0],wl[1]);c.lineTo(al[0],al[1]);c.quadraticCurveTo(S[0][0]-rt[0]*.03*H,S[0][1]-.005*H,(S[0][0]+nl[0])/2,(S[0][1]+nl[1])/2-.012*H);
  c.quadraticCurveTo(nl[0],nl[1],N[0],N[1]+(facing>0?.03*H:.004*H));c.quadraticCurveTo(nr[0],nr[1],(S[1][0]+nr[0])/2,(S[1][1]+nr[1])/2-.012*H);
  c.quadraticCurveTo(S[1][0]+rt[0]*.03*H,S[1][1]-.005*H,ar[0],ar[1]);c.lineTo(wr[0],wr[1]);c.closePath();};
 fgGlaze(c,path,L.shirt,al[0],S[0][1],wr[0],wr[1]+.04*H,.3,.3);
 c.save();path();c.clip();const fold='rgba(30,15,35,.22)',lw=Math.max(.7,H*.005);
 if(facing<0){// the yoke across the shoulders and the folds pulled towards the faixa
  fgLine(c,[fgAdd(al,up,.035*H),fgAdd(N,up,-.065*H),fgAdd(ar,up,.035*H)],lw,fold);
  fgLine(c,[fgAdd(fgAdd(N,up,-.1*H),rt,-.03*H),fgAdd(fgAdd(waist,rt,-.04*H),up,.01*H)],lw,fold,.8);fgLine(c,[fgAdd(fgAdd(N,up,-.13*H),rt,.05*H),fgAdd(fgAdd(waist,rt,.03*H),up,.01*H)],lw,fold,.7);}
 else{// the placket with its buttons, and a fold at each side
  fgLine(c,[fgAdd(N,up,-.02*H),fgAdd(waist,up,.01*H)],lw,fold);for(let b=1;b<=3;b++){const q=fgLerp(fgAdd(N,up,-.04*H),waist,b/4);fgDisc(c,q[0]+.006*H,q[1],H*.004,'rgba(250,245,235,.8)',false);}
  fgLine(c,[fgAdd(al,rt,.03*H),fgAdd(wl,rt,.04*H)],lw,fold,.6);fgLine(c,[fgAdd(ar,rt,-.03*H),fgAdd(wr,rt,-.04*H)],lw,fold,.6);}
 c.restore();
 if(facing>0){// the collar: two points over the neck
  const cl=Kmix(L.shirt,'#ffffff',.12);for(const s of [-1,1]){const a=fgAdd(N,rt,s*.045*H*W),b=fgAdd(fgAdd(N,up,-.05*H),rt,s*.012*H),q=fgAdd(fgAdd(N,up,-.012*H),rt,s*.06*H*W);
   fgGlaze(c,()=>{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(q[0],q[1]);c.lineTo(b[0],b[1]);c.closePath();},cl,a[0],a[1],b[0],b[1],.25,.2);}}
 else{const a=fgAdd(N,rt,-.05*H*W),b=fgAdd(N,rt,.05*H*W);fgLine(c,[a,fgAdd(N,up,.006*H),b],Math.max(1,H*.012),Kmix(L.shirt,'#ffffff',.1));}}
// The faixa: a wide black band wound several times, with the wraps showing; from behind, its end hangs with a fringe.
function fgSash(c,R,L,facing){const {D,P,up,rt,p}=R,H=p.H,W=R.turn,top=fgAdd(P,up,.15*H),bot=fgAdd(P,up,.02*H),w1=D.sw*.9*W,w2=D.hw*1.25;
 const path=()=>{c.beginPath();const a=fgAdd(top,rt,-w1),b=fgAdd(top,rt,w1),d=fgAdd(bot,rt,w2),e=fgAdd(bot,rt,-w2);c.moveTo(a[0],a[1]);c.quadraticCurveTo(top[0]+up[0]*.012*H,top[1]+.012*H,b[0],b[1]);c.lineTo(d[0],d[1]);c.quadraticCurveTo(bot[0],bot[1]+.016*H,e[0],e[1]);c.closePath();};
 fgGlaze(c,path,FG_SASH,top[0]-w1,top[1],top[0]+w1,bot[1],.22,.2);
 c.save();path();c.clip();for(let k=1;k<=3;k++){const y=k/4,a=fgAdd(fgLerp(top,bot,y),rt,-w1*1.1),b=fgAdd(fgLerp(top,bot,y),rt,w1*1.1),m=fgAdd(fgLerp(top,bot,y),up,-.012*H*(facing<0?1:-.5));
  c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(m[0],m[1],b[0],b[1]);c.strokeStyle='rgba(120,112,130,.55)';c.lineWidth=Math.max(.7,H*.005);c.stroke();}c.restore();
 if(facing<0&&!L.kid){// the end, tucked in at one side, hanging with its fringe
  const s=L.seed%2?1:-1,a=fgAdd(fgLerp(top,bot,.4),rt,s*w1*.55),len=.075*H,b=fgAdd(a,up,-len);
  fgGlaze(c,()=>{c.beginPath();c.moveTo(a[0]-.018*H,a[1]);c.lineTo(a[0]+.018*H,a[1]);c.lineTo(b[0]+.02*H,b[1]);c.lineTo(b[0]-.02*H,b[1]);c.closePath();},FG_SASH,a[0],a[1],b[0],b[1],.2,.2);
  for(let f=-2;f<=2;f++)fgLine(c,[[b[0]+f*.008*H,b[1]],[b[0]+f*.009*H,b[1]+.022*H]],Math.max(.6,H*.0045),FG_SASH);}
 if(L.moc==='wrist')return;}
// An arm: the sleeve rolled up below the elbow, the forearm and the hand (open with spread fingers when aleta).
function fgArm(c,R,L,i,open){const {D,S,arms,p}=R,H=p.H,[E,Wr]=arms[i];const roll=fgLerp(E,Wr,.38),sc=L.shirt;
 fgTubes(c,[[S[i],E,H*.092,sc],[E,roll,H*.078,sc]]);
 fgTubes(c,[[fgLerp(E,Wr,.36),Wr,H*.054,L.skin]]);
 // the rolled cuff
 fgTubes(c,[[fgLerp(E,Wr,.3),fgLerp(E,Wr,.42),H*.082,Kmix(sc,'#000000',.1)]]);
 if(L.moc==='wrist'&&i===1){const q=fgLerp(roll,Wr,.75);fgLimb(c,fgLerp(q,Wr,-.2),fgLerp(q,Wr,.25),H*.03,H*.028,L.mocCol,.25,.3);}
 const dx=Wr[0]-E[0],dy=Wr[1]-E[1],a=Math.atan2(dy,dx);c.save();c.translate(Wr[0],Wr[1]);c.rotate(a);
 if(open){// the aleta: an open hand, four fingers spread
  fgTubes(c,[0,1,2,3].map(f=>{const fa=(f-1.5)*.24;return [[H*.02,0],[H*.02+Math.cos(fa)*H*.06,Math.sin(fa)*H*.06],H*.017,L.skin];}).concat([[[H*.01,H*.012],[H*.03,H*.045],H*.018,L.skin]]));fgDisc(c,H*.02,0,H*.027,L.skin);}
 else{fgGlaze(c,()=>{c.beginPath();c.ellipse(H*.03,0,H*.036,H*.027,0,0,Math.PI*2);},L.skin,0,-H*.025,H*.04,H*.025,.3,.3);
  fgTubes(c,[[[H*.012,H*.014],[H*.036,H*.03],H*.017,L.skin]]);}
 c.restore();}
// The head: hair and ears from behind; hair, a simple face and ears from the front; the mocador or the helmet.
function fgHead(c,R,L,facing){const {D,head,neckTop,N,p}=R,H=p.H,hr=D.hr,W=R.turn,[x,y]=head,tilt=R.ht;
 fgLimb(c,N,neckTop,H*.03,H*.028,L.skin,.25,.3);
 c.save();c.translate(x,y);c.rotate(tilt);
 const ear=s=>fgGlaze(c,()=>{c.beginPath();c.ellipse(s*hr*.92*W,hr*.08,hr*.17,hr*.25,0,0,Math.PI*2);},L.skin,0,-hr,0,hr,.25,.3);
 ear(-1);ear(1);
 fgGlaze(c,()=>{c.beginPath();c.ellipse(0,0,hr*.94*Math.max(.82,W),hr,0,0,Math.PI*2);},L.skin,-hr*.6,-hr*.8,hr*.7,hr*.9,.3,.32);
 const hairCol=L.hair,st=L.hairStyle;
 if(!L.helmet){
  if(facing<0){// from behind: the hair covers the head down to the nape
   const nape=st===4?.25:st===5?.05:.55;fgGlaze(c,()=>{c.beginPath();c.ellipse(0,-hr*.04,hr*.97*Math.max(.82,W),hr*1.0,0,Math.PI*1.02,Math.PI*1.98);c.quadraticCurveTo(hr*.9,hr*nape,0,hr*(nape+.18));c.quadraticCurveTo(-hr*.9,hr*nape,-hr*.97,0);c.closePath();},hairCol,-hr,-hr,hr,hr,.22,.3);
   if(st===3){for(let k=0;k<7;k++){const a=Math.PI*(1.05+k*.13);fgDisc(c,Math.cos(a)*hr*.88,Math.sin(a)*hr*.88+hr*.05,hr*.2,hairCol,false);}}
   if(st===1){fgLimb(c,[0,hr*.45],[hr*.06,hr*1.25],hr*.2,hr*.14,hairCol,.2,.3);fgDisc(c,0,hr*.45,hr*.12,L.mocCol,false);}
   if(st===2)fgDisc(c,0,-hr*.15,hr*.34,hairCol);
   c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=Math.max(.6,hr*.06);for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(k*hr*.3,-hr*.8);c.quadraticCurveTo(k*hr*.45,0,k*hr*.25,hr*.4);c.stroke();}}
  else{// from the front: the hair over the forehead
   fgGlaze(c,()=>{c.beginPath();c.ellipse(0,-hr*.1,hr*.98*Math.max(.82,W),hr*.95,0,Math.PI,Math.PI*2);c.quadraticCurveTo(hr*.55,-hr*.42,hr*.1,-hr*.5);c.quadraticCurveTo(-hr*.5,-hr*.2,-hr*.98,-hr*.05);c.closePath();},hairCol,-hr,-hr,hr,0,.22,.3);
   if(st===1||st===2){fgLimb(c,[-hr*.92,0],[-hr*.95,hr*.7],hr*.16,hr*.1,hairCol,.2,.3);}}}
 if(facing>0){// the face: eyes, brows and a mouth set in effort (only on people)
  const ex=hr*.34*W,ey=hr*.02,fx=(1-W)*hr*.5;c.fillStyle='#2a1a22';for(const s of [-1,1]){c.beginPath();c.ellipse(fx+s*ex,ey,hr*.075,hr*.1,0,0,Math.PI*2);c.fill();}
  c.strokeStyle='rgba(60,30,30,.75)';c.lineWidth=Math.max(.6,hr*.07);c.lineCap='round';for(const s of [-1,1]){c.beginPath();c.moveTo(fx+s*ex-hr*.14,ey-hr*.2+(s>0?.02:0));c.lineTo(fx+s*ex+hr*.14,ey-hr*.22);c.stroke();}
  c.beginPath();c.moveTo(fx-hr*.16,hr*.48);c.quadraticCurveTo(fx,hr*.44,fx+hr*.16,hr*.48);c.stroke();
  c.fillStyle='rgba(230,110,100,.22)';for(const s of [-1,1]){c.beginPath();c.ellipse(fx+s*hr*.52*W,hr*.32,hr*.16,hr*.1,0,0,Math.PI*2);c.fill();}
  c.strokeStyle='rgba(120,60,40,.5)';c.beginPath();c.moveTo(fx+hr*.02,hr*.12);c.quadraticCurveTo(fx+hr*.1,hr*.28,fx-hr*.02,hr*.3);c.stroke();}
 if(L.helmet){// the helmet of the canalla: a padded shell with its stripes and the strap under the chin
  const sh=()=>{c.beginPath();c.ellipse(0,-hr*.08,hr*1.08*Math.max(.85,W),hr*1.0,0,Math.PI*1.0,Math.PI*2.0);c.quadraticCurveTo(hr*1.1,hr*.18,hr*.8,hr*.2);c.lineTo(-hr*.8,hr*.2);c.quadraticCurveTo(-hr*1.1,hr*.18,-hr*1.08,-hr*.08);c.closePath();};
  fgGlaze(c,sh,L.helmetCol,-hr,-hr,hr,hr*.2,.4,.3);c.save();sh();c.clip();for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(k*hr*.38,-hr*1.2);c.quadraticCurveTo(k*hr*.5,-hr*.3,k*hr*.42,hr*.3);c.strokeStyle='rgba(40,30,50,.25)';c.lineWidth=Math.max(.6,hr*.07);c.stroke();}c.restore();
  fgLine(c,[[-hr*.8,hr*.15],[-hr*.55,hr*.85],[hr*.55,hr*.85],[hr*.8,hr*.15]],Math.max(.7,hr*.08),'rgba(30,25,35,.8)');}
 else if(L.moc==='head'){// the mocador tied over the head, knotted behind with its two ends
  const mp=()=>{c.beginPath();c.ellipse(0,-hr*.12,hr*1.02*Math.max(.82,W),hr*.95,0,Math.PI*1.0,Math.PI*2.0);c.quadraticCurveTo(hr*.6,-hr*.02,0,hr*(facing<0?.08:-.3));c.quadraticCurveTo(-hr*.6,-hr*.02,-hr*1.02,-hr*.12);c.closePath();};
  fgGlaze(c,mp,L.mocCol,-hr,-hr,hr,0,.28,.3);fgSpots(c,mp,-hr,-hr*1.1,hr*2,hr*1.1,hr*.07);mp();fgInk(c);
  if(facing<0){fgDisc(c,0,hr*.05,hr*.14,L.mocCol);fgLimb(c,[0,hr*.1],[-hr*.18,hr*.55],hr*.1,hr*.06,L.mocCol,.2,.3);fgLimb(c,[0,hr*.1],[hr*.16,hr*.5],hr*.1,hr*.06,L.mocCol,.2,.3);}}
 c.restore();
 if(L.moc==='neck'){// the mocador round the neck
  const {rt,up}=R,a=fgAdd(N,rt,-.05*H*W),b=fgAdd(N,rt,.05*H*W),m=fgAdd(N,up,facing>0?-.04*H:-.01*H);
  const mp=()=>{c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(N[0],N[1]+.03*H,b[0],b[1]);c.lineTo(m[0]+(b[0]-m[0])*.3,m[1]+.015*H);c.lineTo(m[0],m[1]+.03*H);c.lineTo(m[0]-(m[0]-a[0])*.3,m[1]+.015*H);c.closePath();};
  fgGlaze(c,mp,L.mocCol,a[0],a[1],b[0],m[1]+.03*H,.25,.3);fgSpots(c,mp,a[0],a[1]-.02*H,b[0]-a[0],.06*H,H*.005);mp();fgInk(c);}}

// A whole casteller. p: the pose for fgRig, plus facing (−1 from behind, 1 from the front), open (the aleta hand: 0 none, 1 left, 2
// right), noLegs (the pinya: only the upper body shows), armsBehind (the arms go behind the body).
export function fgPerson(c,p,L){const R=fgRig(p),facing=p.facing||-1;FG_LW=Math.max(1.1,p.H*.011);
 const arms=()=>{for(let i=0;i<2;i++)fgArm(c,R,L,i,p.open===i+1);};
 if(p.armsBehind)arms();
 if(!p.noLegs)fgLegs(c,R,L,facing);
 fgTorso(c,R,L,facing);fgSash(c,R,L,facing);
 if(!p.armsBehind)arms();
 fgHead(c,R,L,facing);
 return R;}
// Where the shoulders, the faixa and the head of a pose are, for those who stand on them, grab them or climb them.
export function fgPoints(p){const R=fgRig(p);return {S:R.S,waist:fgAdd(R.P,R.up,.09*p.H),head:R.head,hr:R.D.hr,N:R.N,P:R.P};}

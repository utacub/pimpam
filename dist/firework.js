// Piromusical (CE24): the light engine of the fireworks. Every spark is a closed-form function of time: a flight slowed by the air
// (drag k) and pulled down by gravity (g), p(τ) = p0 + R·d·(1−e^(−kτ)) − (g/k)·(τ − (1−e^(−kτ))/k). Any moment can be drawn directly,
// the same round always draws the same frame, and the music is written from the same plan (piro.js): each burst has its note and its
// soft sound at the instant it opens.
// Safety (design criteria, not clinical thresholds): a burst opens with a soft bloom and never lights the whole screen; big glows open
// at most twice a second (FwFlashes, tested); stars twinkle slowly and never strobe; nothing turns faster than one turn every four seconds.
import {K_TAU,Kclamp,Ksmooth,Krand,Kmix,Krgba,KALEIDO_MAX_TURN} from './kaleido-base.js';
import {escDecor,escVeil} from './escenari.js';

export const FW_MAX_TURN=KALEIDO_MAX_TURN;
// Each kind of shell: radius (scene units: 1 is about the height of the sky), stars, drag (1/s), gravity (units/s²), life (s), trail
// (s), size of the stars, and its traits: a glow as it opens (halo), slow twinkling, a crackle, a spiral, swimming stars, a split.
export const FW_KINDS=Object.freeze({
 peony:{r:.2,n:72,drag:2.2,grav:.22,life:2.1,trail:.14,size:1,halo:true},
 chrys:{r:.22,n:64,drag:2,grav:.22,life:2.3,trail:.42,size:.9,halo:true},
 dahlia:{r:.22,n:26,drag:1.9,grav:.25,life:2.4,trail:.36,size:1.6,halo:true},
 willow:{r:.24,n:56,drag:3,grav:.5,life:3.6,trail:.9,size:.75,halo:true,gold:true},
 kamuro:{r:.24,n:60,drag:2.8,grav:.42,life:3.8,trail:.7,size:.7,halo:true,gold:true,twinkle:1},
 brocade:{r:.22,n:70,drag:2.4,grav:.3,life:3,trail:.5,size:.75,halo:true,twinkle:1,crackle:true},
 palm:{r:.24,n:10,drag:1.5,grav:.42,life:2.5,trail:.5,size:1.7,halo:true,embers:true},
 ring:{r:.2,n:46,drag:2.3,grav:.16,life:2,trail:.1,size:1,halo:true},
 saturn:{r:.22,n:76,drag:2.2,grav:.16,life:2.2,trail:.12,size:1,halo:true},
 shape:{r:.2,n:56,drag:2.6,grav:.1,life:2.1,trail:.08,size:1,halo:true},
 crossette:{r:.16,n:10,drag:1.6,grav:.3,life:2.2,trail:.3,size:1.4,halo:true,split:.55},
 spiral:{r:.22,n:45,drag:2,grav:.2,life:2.2,trail:.3,size:.95,halo:true,twist:.6},
 fish:{r:.2,n:30,drag:2,grav:.2,life:2.4,trail:.3,size:.9,halo:true,wiggle:.022},
 small:{r:.08,n:24,drag:2.6,grav:.2,life:1.4,trail:.1,size:.8,halo:false},
 comet:{r:0,size:1.4,life:.4,trail:.45,rise:1.1,halo:false,embers:true},
 fountain:{dur:3,h:.3,spread:.3,rate:46,life:1.1,size:.55},
 cascade:{dur:3.5,y:.82,x0:-.62,x1:.62,cols:15,rate:11,life:1.7,size:.5},
 wheel:{dur:3.5,R:.05,jets:3,rate:26,spin:.2,life:.9,size:.55},
 candle:{shots:5,every:.42,fan:.22,h:.55,size:1.2,life:1.5},
 mine:{n:26,spread:.5,h:.5,drag:1.5,grav:.45,life:1.7,trail:.3,size:.85}
});
const FW_BURSTS=new Set(['peony','chrys','dahlia','willow','kamuro','brocade','palm','ring','saturn','shape','crossette','spiral','fish','small']);
const FW_GOLD='#ffc861',FW_EMBER='#ffd9a0';
const FW_GOLDEN=Math.PI*(3-Math.sqrt(5));
// A sphere of stars seen from the side: directions in the plane of the screen, denser towards the middle, as in a real shell.
function Fwsphere(n,salt){const out=[];for(let i=0;i<n;i++){const z=1-2*(i+.5)/n,r=Math.sqrt(1-z*z),a=i*FW_GOLDEN+salt;out.push([Math.cos(a)*r,Math.sin(a)*r]);}return out;}
// Pattern shells: n stars spread evenly along an outline, the farthest at distance 1.
function Fwoutline(shape,n){const dense=[];for(let i=0;i<=400;i++){const t=i/400*K_TAU;let x,y;
  if(shape==='heart'){x=16*Math.sin(t)**3/17;y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17+.12;}
  else if(shape==='star'){const k=t/K_TAU*10,j=Math.floor(k)%10,f=k-Math.floor(k),r0=j%2?.42:1,r1=j%2?1:.42,a0=Math.PI/2+j*Math.PI/5,a1=a0+Math.PI/5;x=(1-f)*r0*Math.cos(a0)+f*r1*Math.cos(a1);y=(1-f)*r0*Math.sin(a0)+f*r1*Math.sin(a1);}
  else if(shape==='clover'){const r=.3+.7*Math.abs(Math.cos(2*t));x=r*Math.cos(t+Math.PI/4);y=r*Math.sin(t+Math.PI/4);}
  else {const r=.38+.62*Math.abs(Math.cos(2.5*t));x=r*Math.cos(t+Math.PI/2);y=r*Math.sin(t+Math.PI/2);}
  dense.push([x,y]);}
 const len=[0];for(let i=1;i<dense.length;i++)len.push(len[i-1]+Math.hypot(dense[i][0]-dense[i-1][0],dense[i][1]-dense[i-1][1]));
 const out=[];let j=0;for(let i=0;i<n;i++){const want=i/n*len.at(-1);while(len[j+1]<want)j++;const f=(want-len[j])/Math.max(1e-9,len[j+1]-len[j]);out.push([dense[j][0]+f*(dense[j+1][0]-dense[j][0]),dense[j][1]+f*(dense[j+1][1]-dense[j][1])]);}
 const far=Math.max(...out.map(p=>Math.hypot(p[0],p[1])));return out.map(([x,y])=>[x/far,y/far]);}
// The stars of a shell: direction, speed (a fraction of the radius), colour slot, phase and a life a little longer or shorter.
function Fwstars(s){const R=(i,k)=>Krand(i*7.31+k,s.salt),slots=[].concat(s.c??0),slot=i=>slots[i%slots.length],out=[];
 const push=(dx,dy,sp,sl,i)=>out.push({dx,dy,sp,slot:sl,ph:R(i,2)*K_TAU,lm:.85+.3*R(i,3)});
 const turn=(x,y,a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
 if(s.kind==='ring'||s.kind==='saturn'){const ring=s.kind==='saturn'?Math.round(s.n*.5):s.n,ct=Math.cos(s.tilt??0);
  if(s.kind==='saturn')Fwsphere(s.n-ring,s.salt).forEach(([x,y],i)=>push(x,y,.5+.06*R(i,1),slots[0],i));
  for(let i=0;i<ring;i++){const a=i/ring*K_TAU,[x,y]=turn(Math.cos(a),Math.sin(a)*ct,s.rot??0);push(x,y,1,s.kind==='saturn'?(s.ringC??slots[1%slots.length]):slot(i),i+300);}}
 else if(s.kind==='shape')Fwoutline(s.shape,s.n).forEach(([x,y],i)=>{const [a,b]=turn(x,y,s.rot??0);push(a,b,1,slot(i),i);});
 else if(s.kind==='palm')for(let i=0;i<s.n;i++){const a=(i+.4*R(i,4))/s.n*K_TAU,x=Math.cos(a),y=Math.sin(a)*.85+.25,l=Math.hypot(x,y);push(x/l,y/l,.9+.16*R(i,1),slot(i),i);}
 else if(s.kind==='spiral'){const arms=s.arms||5,m=Math.round(s.n/arms);for(let a=0;a<arms;a++)for(let j=0;j<m;j++){const ang=a*K_TAU/arms+j*(s.curl??.2);push(Math.cos(ang),Math.sin(ang),.28+.72*j/(m-1),slots[a%slots.length],a*m+j);}}
 else if(s.kind==='crossette')for(let i=0;i<s.n;i++){const a=(i+.5)/s.n*K_TAU+(s.rot??0);push(Math.cos(a),Math.sin(a),1,slot(i),i);}
 else Fwsphere(s.n,s.salt).forEach(([x,y],i)=>push(x,y,.94+.12*R(i,1),slot(i),i));
 // A pistil: a smaller sphere of another colour inside the shell.
 if(s.pistil!==undefined)Fwsphere(Math.round(s.n*.4),s.salt+3).forEach(([x,y],i)=>push(x,y,.42+.06*R(i+500,1),s.pistil,i+500));
 return out;}
// The plan of a show: each shell with the defaults of its kind and its stars, computed once.
const FW_PLANS=new WeakMap();
export function FwPlan(design){let plan=FW_PLANS.get(design);if(plan)return plan;
 plan=design.shells.map((s,i)=>{const x={...FW_KINDS[s.kind],...s,salt:s.salt??i*13.7+1};if(FW_BURSTS.has(x.kind))x.stars=Fwstars(x);
  // A comet can end in a little star of its own colour.
  if(x.kind==='comet'&&x.split){const b={kind:'crossette',x:x.x,y:x.y,r:x.splitR??.09,n:x.split,drag:2.2,grav:.25,life:1.3,trail:.22,size:.9,halo:false,c:x.c,salt:x.salt+5,rot:x.rot??0};b.stars=Fwstars(b);x.burst=Object.freeze(b);}
  return Object.freeze(x);});
 FW_PLANS.set(design,plan);return plan;}
// When each shell opens (or each fountain, wheel or candle starts): its visual event plus a small delay.
export const FwTime=(s,H)=>H[s.at]+(s.dt||0);
const FwLaunch=(s,H)=>Math.max(0,FwTime(s,H)-(s.rise??0));
// How long a ground piece burns: its own duration, or until a later visual event (until) plus a little.
export const FwDur=(s,H)=>s.until===undefined?s.dur:Math.max(.5,H.at(s.until)+(s.dur??.6)-FwTime(s,H));
// The big glows of a show, merged when they open together: the times the screen grows brighter over a wide area. Only a big shell that
// opens exactly on a visual event glows, so glows never come closer together than the events themselves.
const FwGlows=s=>FW_BURSTS.has(s.kind)&&s.halo&&s.r>=.12&&!s.dt;
export function FwFlashes(design,H){const out=[];for(const s of FwPlan(design))if(FwGlows(s)){const t=FwTime(s,H);if(!out.some(x=>Math.abs(x-t)<.1))out.push(t);}return out.sort((a,b)=>a-b);}

// The screen: scene x runs across from the middle, y up from the ground; one unit is about the height of the sky.
function Fwview(w,h,design){const lake=design.land==='lake',gy0=h*(lake?.7:.955),U=Math.min(gy0/1.02,w/1.62),gy=Math.min(gy0,U*1.12+h*.05);return {w,h,U,gy,cx:w/2};}
// Flight of a star of shell s at time τ after the burst; writes the scene position into out.
function Fwpos(s,st,tau,red,out){const k=s.drag,E0=1-Math.exp(-k*tau),E=red?.72+.28*E0:E0,g=s.grav*(red?.35:1);let dx=st.dx,dy=st.dy;
 // Spiral shells: the stars turn as they fly out, at most twist·drag rad/s at the start (kept under one turn every four seconds).
 if(s.twist){const a=s.twist*E0*(red?.3:1),ca=Math.cos(a),sa=Math.sin(a),x=dx*ca-dy*sa;dy=dx*sa+dy*ca;dx=x;}
 let x=s.x+dx*st.sp*s.r*E,y=s.y+dy*st.sp*s.r*E+g/k*(E0/k-tau);
 // Swimming stars ("fish"): a sideways wave of 1.8 Hz along the flight.
 if(s.wiggle&&!red){const w=s.wiggle*Math.sin(K_TAU*1.8*tau+st.ph)*Ksmooth(tau/.3);x-=dy*w;y+=dx*w;}
 out[0]=x;out[1]=y;}
// A crossette's star splits in four at s.split seconds; each piece flies on from where the star was.
const FW_CROSS=[Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4];
function Fwchild(s,st,q,tau,red,out){Fwpos(s,st,s.split,red,out);const k2=2.6,u=tau-s.split,E0=1-Math.exp(-k2*u),E=red?.7+.3*E0:E0,a=Math.atan2(st.dy,st.dx)+FW_CROSS[q],r2=s.r*.42,g=s.grav*(red?.35:1);
 out[0]+=Math.cos(a)*r2*E;out[1]+=Math.sin(a)*r2*E+g/k2*(E0/k2-u);}

// Batches: the strokes, dots and stars of a frame are gathered by colour and drawn together.
const FwA=a=>Math.round(Kclamp(a)*6)/6;
function Fwseg(F,col,a,wd,x0,y0,x1,y1){a=FwA(a);if(a<=0)return;const key=col+'|'+a+'|'+wd.toFixed(1);let b=F.segs.get(key);if(!b)F.segs.set(key,b={col,a,wd,pts:[]});b.pts.push(F.cx+x0*F.U,F.gy-y0*F.U,F.cx+x1*F.U,F.gy-y1*F.U);}
function Fwdot(F,col,a,r,x,y){a=FwA(a);if(a<=0)return;const key=col+'|'+a+'|'+r.toFixed(1);let b=F.dots.get(key);if(!b)F.dots.set(key,b={col,a,r,pts:[]});b.pts.push(F.cx+x*F.U,F.gy-y*F.U);}
function Fwhead(F,col,a,r,x,y){if(a>.01)F.heads.push(col,a,r,F.cx+x*F.U,F.gy-y*F.U);}
// The glowing star: a small picture per colour (a white-hot core in its colour on black, a solid core on white), drawn once.
const FW_SPRITES=new Map();
function Fwsprite(col,white){const key=col+(white?'w':'');if(FW_SPRITES.has(key))return FW_SPRITES.get(key);let cv=null;
 try{if(typeof document!=='undefined'&&document.createElement){cv=document.createElement('canvas');cv.width=cv.height=48;const g=cv.getContext('2d'),gr=g.createRadialGradient(24,24,0,24,24,24);
  if(white){gr.addColorStop(0,col);gr.addColorStop(.35,Krgba(col,.75));gr.addColorStop(1,Krgba(col,0));}else{gr.addColorStop(0,'#ffffff');gr.addColorStop(.16,Kmix(col,'#ffffff',.55));gr.addColorStop(.4,Krgba(col,.62));gr.addColorStop(1,Krgba(col,0));}
  g.fillStyle=gr;g.fillRect(0,0,48,48);}}catch{cv=null;}
 FW_SPRITES.set(key,cv);return cv;}
// On a white background the colours are a little deeper, so the sparks stay visible.
const FW_INK=new Map();
function Fwink(F,col){if(!F.white)return col;let v=FW_INK.get(col);if(!v)FW_INK.set(col,v=Kmix(col,'#1d1846',.22));return v;}
function Fwflush(F){const c=F.c,A=F.A;c.save();c.globalCompositeOperation=F.white?'source-over':'lighter';c.lineCap='round';
 for(const [x,y,r,col,a] of F.halos){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,Krgba(col,a));g.addColorStop(.45,Krgba(col,a*.45));g.addColorStop(1,Krgba(col,0));c.fillStyle=g;c.globalAlpha=A;c.beginPath();c.arc(x,y,r,0,K_TAU);c.fill();}
 for(const b of F.segs.values()){c.globalAlpha=A*b.a;c.strokeStyle=b.col;c.lineWidth=b.wd;c.beginPath();const p=b.pts;for(let i=0;i<p.length;i+=4){c.moveTo(p[i],p[i+1]);c.lineTo(p[i+2],p[i+3]);}c.stroke();}
 for(const b of F.dots.values()){c.globalAlpha=A*b.a;c.fillStyle=b.col;c.beginPath();const p=b.pts;for(let i=0;i<p.length;i+=2){c.moveTo(p[i]+b.r,p[i+1]);c.arc(p[i],p[i+1],b.r,0,K_TAU);}c.fill();}
 // On a slow device the stars are plain dots: the glowing pictures are the dearest part of a frame.
 const H=F.heads,sprites=!F.plain&&!F.low;
 if(sprites)for(let i=0;i<H.length;i+=5){const sp=Fwsprite(H[i],F.white);if(!sp){F.plain=true;break;}const r=H[i+2]*2.7;c.globalAlpha=A*Kclamp(H[i+1]);c.drawImage(sp,H[i+3]-r,H[i+4]-r,2*r,2*r);}
 if(!sprites||F.plain){const groups=new Map();for(let i=0;i<H.length;i+=5){const key=H[i]+'|'+FwA(H[i+1]);let g=groups.get(key);if(!g)groups.set(key,g={col:H[i],a:FwA(H[i+1]),pts:[]});g.pts.push(H[i+3],H[i+4],H[i+2]);}
  for(const g of groups.values()){c.globalAlpha=A*g.a;c.fillStyle=g.col;c.beginPath();for(let i=0;i<g.pts.length;i+=3){c.moveTo(g.pts[i]+g.pts[i+2],g.pts[i+1]);c.arc(g.pts[i],g.pts[i+1],g.pts[i+2],0,K_TAU);}c.fill();}}
 c.restore();}

// A trail: from the star back along its own path, in three fading pieces (one on a slow device).
function Fwtrail(F,col,a,wd,at,tau,len,from=0){if(len<=0||a<=0)return;const p=F.p,q=F.q;const n=F.low?1:3,step=len/(F.low?2:3);at(tau,p);
 for(let j=1;j<=n;j++){const back=Math.max(from,tau-step*j);at(back,q);Fwseg(F,col,a*[.6,.34,.14][j-1]*(F.low?.75:1),wd*[1,.72,.45][j-1],p[0],p[1],q[0],q[1]);p[0]=q[0];p[1]=q[1];if(back<=from)break;}}
// A burst: soft glow, then the stars with their trails, embers, twinkles, colour changes, splits and crackles.
// Shells that open together at one place share one glow (the largest, at the strongest), so stacked shells never add up their light.
function Fwhalo(F,x,y,r,col,a){const h=F.halos.find(h=>Math.abs(h[0]-x)+Math.abs(h[1]-y)<F.U*.04);if(!h){F.halos.push([x,y,r,col,a]);return;}if(r>h[2]){h[2]=r;h[3]=col;}h[4]=Math.max(h[4],a);}
function Fwburst(F,s,tau,pal){const life=s.life,inT=F.red?.35:.13,shellIn=Ksmooth(tau/inT),red=F.red,rpx=F.U*.0085*s.size,p=F.p;
 if(tau>life*1.15+1)return;const slots=[].concat(s.c??0);
 if(FwGlows(s)){const a=.15*Ksmooth(tau/.16)*Math.exp(-Math.max(0,tau-.16)/.6);if(a>.004){const col=Kmix(pal[slots[0]%pal.length],'#fff1d6',.5),E=1-Math.exp(-s.drag*tau);Fwhalo(F,F.cx+s.x*F.U,F.gy-s.y*F.U,s.r*F.U*(.7+.6*E),F.white?Fwink(F,pal[slots[0]%pal.length]):col,F.white?a*.5:a);F.light=Math.max(F.light,a);}}
 for(const st of s.stars){const lm=st.lm*life,base=shellIn*(1-Ksmooth((tau-.45*lm)/(.55*lm)));if(base<=.01)continue;let a=base;
  if(s.twinkle&&!red&&tau>.4)a*=1-.55*s.twinkle*(.5+.5*Math.sin(K_TAU*2.2*tau+st.ph));
  const col=Fwink(F,pal[st.slot%pal.length]),trailCol=s.gold?Fwink(F,FW_GOLD):col;
  if(s.split&&tau>=s.split){const fade=Ksmooth((tau-s.split)/.06);if(fade<1){Fwpos(s,st,tau,red,p);Fwhead(F,col,a*(1-fade),rpx,p[0],p[1]);}
   for(let q=0;q<4;q++){const at=(t,o)=>t>=s.split?Fwchild(s,st,q,t,red,o):Fwpos(s,st,t,red,o);Fwtrail(F,trailCol,a*fade,rpx*.8,at,tau,s.trail*.8,0);at(tau,p);Fwhead(F,col,a*fade,rpx*.75,p[0],p[1]);}continue;}
  const at=(t,o)=>Fwpos(s,st,t,red,o);Fwtrail(F,trailCol,a,rpx*(s.gold?.6:.8),at,tau,s.trail);at(tau,p);
  // Colour-changing stars cross-fade to their second colour half-way through their life.
  if(s.change!==undefined){const x=Ksmooth((tau-.45*life)/.3);if(x<1)Fwhead(F,col,a*(1-x),rpx,p[0],p[1]);if(x>0)Fwhead(F,Fwink(F,pal[s.change%pal.length]),a*x,rpx,p[0],p[1]);}
  else Fwhead(F,col,a,rpx*(st.sp<.5?.8:1),p[0],p[1]);
  // Palms shed embers that fall and fade behind each frond.
  if(s.embers&&!F.low)for(let e=1;e<=8;e++){const te=tau-e*.06;if(te<0)break;const age=tau-te;at(te,F.q);Fwdot(F,Fwink(F,FW_EMBER),a*.55*(1-age/.5),rpx*.32,F.q[0],F.q[1]-.25*age*age);}
  // Brocade: tiny crackling sparkles appear and fade around each star (each lasts about a third of a second).
  if(s.crackle&&!F.low&&tau>.5){for(let k=0;k<2;k++){const cyc=tau*3+st.ph+k*.5,ci=Math.floor(cyc),u=cyc-ci,r1=Krand(ci*3.1+k,st.ph),r2=Krand(ci*5.7+k,st.ph+1);Fwdot(F,Fwink(F,'#fff4dc'),a*.8*Math.sin(Math.PI*u),rpx*.3,p[0]+(r1-.5)*.035,p[1]+(r2-.5)*.035);}}}}
// A rocket rises from the ground to where its shell will open, with a short trail and falling embers; with reduced motion it is only a
// soft glow that gathers where the shell will open.
function Fwrocket(F,s,t,tb,pal){const tl=Math.max(0,tb-(s.rise??0)),rise=tb-tl;if(rise<=0||t<tl||t>tb+.5)return;const L=[s.lx??s.x*.85,0],B=[s.x,s.y],comet=s.kind==='comet';
 const path=(u,o)=>{u=Kclamp(u);const e=1-(1-u)**2;o[0]=L[0]+(B[0]-L[0])*e;o[1]=L[1]+(B[1]-L[1])*e;},u=(t-tl)/rise,col=comet?Fwink(F,pal[[].concat(s.c??0)[0]%pal.length]):Fwink(F,FW_EMBER),rpx=F.U*.0085*(comet?s.size:.65);
 if(F.red){if(t>=tb)return;if(comet){path(u,F.p);Fwhead(F,col,Ksmooth(u*3),rpx,F.p[0],F.p[1]);}else{const a=.35*Ksmooth((t-(tb-.4))/.4);if(a>0)Fwhead(F,Fwink(F,FW_EMBER),a,rpx*1.4,B[0],B[1]);}return;}
 if(t<tb){const tail=comet?s.trail/rise:.2;Fwtrail(F,col,.9,rpx*.7,path,u,tail);path(u,F.p);Fwhead(F,col,1,rpx,F.p[0],F.p[1]);}
 // A comet without a star of its own fades where it stops.
 else if(comet&&!s.split&&t<tb+.3)Fwhead(F,col,1-Ksmooth((t-tb)/.3),rpx,B[0],B[1]);
 if(!F.low)for(let e=0;;e++){const te=tl+e*.035;if(te>Math.min(t,tb))break;const age=t-te;if(age>.45)continue;path((te-tl)/rise,F.q);Fwdot(F,Fwink(F,comet?col:FW_EMBER),.5*(1-age/.45),rpx*.32,F.q[0],F.q[1]-.35*age*age);}}
// Ground pieces: fountains, cascades, wheels, Roman candles and mines. Their sparks are emitted at a steady rate, each with its own
// fixed random values, so every frame finds the same sparks in the same places.
// A tall fountain keeps its sparks until they have passed the top of their flight, so it shows its whole height.
function Fwfountain(F,s,t,t0,pal){const slots=[].concat(s.c??0),g=1.2*(F.red?.5:1),v0=Math.sqrt(2*g*s.h),rate=s.rate,rpx=F.U*.0085*s.size,L=Math.max(s.life,1.5*v0/g);
 const iA=Math.max(0,Math.ceil((t-L*1.2-t0)*rate)),iB=Math.floor((Math.min(t,t0+s.dur)-t0)*rate);
 for(let i=iA;i<=iB;i++){const te=t0+i/rate,tau=t-te,r1=Krand(i,s.salt),r2=Krand(i+.5,s.salt),r3=Krand(i+.25,s.salt),life=L*(.8+.4*r2);if(tau<0||tau>life)continue;
  const env=Ksmooth((te-t0)/.35)*(1-Ksmooth((te-t0-s.dur+.45)/.45));if(r3>env*1.05)continue;
  // A dancing fountain rises and falls in a slow wave (0.45 Hz), out of step with its neighbours.
  const dance=s.dance?1+s.dance*Math.sin(K_TAU*.45*(te-t0)+s.x*4):1;
  const ang=Math.PI/2+(r1-.5)*s.spread,v=v0*(.8+.3*r2)*(.65+.35*env)*dance,vx=Math.cos(ang)*v,vy=Math.sin(ang)*v,X=x=>s.x+vx*x,Y=x=>vy*x-.5*g*x*x;if(Y(tau)<0)continue;
  const col=Fwink(F,pal[slots[i%slots.length]%pal.length]),a=1-Ksmooth((tau/life-.3)/.7),b=Math.max(0,tau-.05);Fwseg(F,col,a*.8,rpx*.7,X(tau),Y(tau),X(b),Y(b));if(i%3===0)Fwhead(F,col,a,rpx*.8,X(tau),Y(tau));}
 if(t>=t0&&t<t0+s.dur+.3)Fwhead(F,Fwink(F,FW_EMBER),.6*Ksmooth((t-t0)/.3)*(1-Ksmooth((t-t0-s.dur)/.3)),rpx*1.3,s.x,0);}
function Fwcascade(F,s,t,t0,pal){const slots=[].concat(s.c??0),g=.32*(F.red?.5:1),rpx=F.U*.0085*s.size,mid=(s.x0+s.x1)/2;
 for(let e=0;e<s.cols;e++){const xe=s.x0+(s.x1-s.x0)*e/(s.cols-1),start=t0+Math.abs(xe-mid)/(s.x1-s.x0)*.8,end=t0+s.dur,col=Fwink(F,pal[slots[e%slots.length]%pal.length]);if(t<start)continue;
  const iA=Math.max(0,Math.ceil((t-s.life*1.2-start)*s.rate)),iB=Math.floor((Math.min(t,end)-start)*s.rate);
  for(let i=iA;i<=iB;i++){const te=start+i/s.rate,tau=t-te,r1=Krand(i+e*97,s.salt),r2=Krand(i+e*97+.5,s.salt),life=s.life*(.85+.3*r2);if(tau<0||tau>life)continue;
   const vx=(r1-.5)*.06,X=x=>xe+vx*x,Y=x=>s.y-.02*x-.5*g*x*x,a=(1-Ksmooth(tau/life))*Ksmooth((end+.4-te)/.4),b=Math.max(0,tau-.06);Fwseg(F,col,a*.85,rpx*.7,X(tau),Y(tau),X(b),Y(b));if(i%4===0)Fwhead(F,col,a*.9,rpx*.7,X(tau),Y(tau));}
  if(t<end+.2)Fwhead(F,col,.7*Ksmooth((t-start)/.25)*(1-Ksmooth((t-end)/.2)),rpx*1.1,xe,s.y);}}
function Fwwheel(F,s,t,t0,pal){const slots=[].concat(s.c??0),rpx=F.U*.0085*s.size,k=1.6,g=.3*(F.red?.5:1),dir=s.dir??1,spin=F.red?0:s.spin;
 for(let j=0;j<s.jets;j++){const col=Fwink(F,pal[slots[j%slots.length]%pal.length]),iA=Math.max(0,Math.ceil((t-s.life*1.2-t0)*s.rate)),iB=Math.floor((Math.min(t,t0+s.dur)-t0)*s.rate);
  for(let i=iA;i<=iB;i++){const te=t0+i/s.rate,tau=t-te,r1=Krand(i+j*131,s.salt),life=s.life*(.8+.4*r1);if(tau<0||tau>life)continue;
   const th=j*K_TAU/s.jets+dir*K_TAU*spin*(te-t0),ex=s.x+s.R*Math.cos(th),ey=s.y+s.R*Math.sin(th),vx=-Math.sin(th)*dir*.38+Math.cos(th)*.1,vy=Math.cos(th)*dir*.38+Math.sin(th)*.1;
   const P=x=>{const E=(1-Math.exp(-k*x))/k;return [ex+vx*E,ey+vy*E+g/k*(E-x)];},a=1-Ksmooth(tau/life),[x1,y1]=P(tau),[x0,y0]=P(Math.max(0,tau-.05));Fwseg(F,col,a*.85,rpx*.75,x1,y1,x0,y0);if(i%3===0)Fwhead(F,col,a,rpx*.75,x1,y1);}}
 if(t>=t0&&t<t0+s.dur+.3){const a=Ksmooth((t-t0)/.3)*(1-Ksmooth((t-t0-s.dur)/.3));Fwhead(F,Fwink(F,pal[slots[0]%pal.length]),.8*a,rpx*1.8,s.x,s.y);Fwhead(F,Fwink(F,FW_EMBER),a,rpx,s.x,s.y);}}
const FW_FAN=[0,-1,1,-.5,.5,-1.5,1.5,0];
function Fwcandle(F,s,t,t0,pal){const slots=[].concat(s.c??0),rpx=F.U*.0085*s.size,k=1.5,g=.5*(F.red?.4:1),p=F.p;
 for(let j=0;j<s.shots;j++){const tj=t0+j*s.every,tau=t-tj;if(tau<0||tau>s.life+.8)continue;const th=Math.PI/2+s.fan*FW_FAN[j%FW_FAN.length],col=Fwink(F,pal[slots[j%slots.length]%pal.length]);
  const at=(x,o)=>{const E0=1-Math.exp(-k*x),E=F.red?.6+.4*E0:E0;o[0]=s.x+Math.cos(th)*s.h*1.15*E;o[1]=Math.sin(th)*s.h*1.15*E+g/k*(E0/k-x);};
  const pop=s.life*.65;
  if(tau<pop){const a=Ksmooth(tau/.08);Fwtrail(F,col,a,rpx*.7,at,tau,.25);at(tau,p);Fwhead(F,col,a,rpx,p[0],p[1]);}
  // Each ball ends in a little puff of stars.
  else{at(pop,p);const u=tau-pop,E=1-Math.exp(-3*u),a=1-Ksmooth(u/.8);for(let q=0;q<12;q++){const ang=q/12*K_TAU+j;Fwhead(F,col,a,rpx*.6,p[0]+Math.cos(ang)*.06*E,p[1]+Math.sin(ang)*.06*E-.1*u*u);}}}}
function Fwmine(F,s,t,t0,pal){const tau=t-t0;if(tau<0||tau>s.life*1.2)return;const slots=[].concat(s.c??0),rpx=F.U*.0085*s.size,p=F.p;
 for(let i=0;i<s.n;i++){const r1=Krand(i,s.salt),r2=Krand(i+.5,s.salt),ang=Math.PI/2+(r1-.5)*2*s.spread,st={dx:Math.cos(ang),dy:Math.sin(ang),sp:.6+.4*r2,ph:0},lm=s.life*(.85+.3*Krand(i+.25,s.salt));
  const m={x:s.x,y:0,r:s.h,drag:s.drag,grav:s.grav},out=st.sp*s.h*(1-Math.exp(-s.drag*tau));
  // A star lights up as it leaves the mouth of the mortar and spreads, so the stars never pile up into one bright clump.
  const a=Ksmooth((out-.02)/.2)*(1-Ksmooth((tau-.4*lm)/(.6*lm)));if(a<=.01)continue;const at=(x,o)=>Fwpos(m,st,x,F.red,o),col=Fwink(F,pal[slots[i%slots.length]%pal.length]);
  Fwtrail(F,col,a,rpx*.8,at,tau,s.trail);at(tau,p);Fwhead(F,col,a,rpx,p[0],p[1]);}}

// The night: a deep blue sky with a few faint stars that twinkle slowly, a moon if the show has one, and the land.
function Fwsky(F,design,t){if(F.white)return;const c=F.c,sky=design.sky||['#04031a','#141c55'],top=Math.max(0,F.gy-1.25*F.U);c.save();c.globalAlpha=F.A;
 const g=c.createLinearGradient(0,top,0,F.gy);g.addColorStop(0,sky[0]);g.addColorStop(1,sky[1]);c.fillStyle=sky[0];c.fillRect(0,0,F.w,top+1);c.fillStyle=g;c.fillRect(0,top,F.w,F.gy-top+1);
 c.fillStyle='#ffffff';for(let i=0;i<70;i++){const x=Krand(i,3.3)*F.w,y=Krand(i,7.7)*F.gy*.85,a=.18+.3*Krand(i,9.1);c.globalAlpha=F.A*a*(.75+.25*Math.sin(t*.6+i));c.fillRect(x,y,1.2+Krand(i,5.5),1.2+Krand(i,5.5));}
 if(design.moon){const [mx,my,mr]=design.moon,x=F.cx+mx*F.U,y=F.gy-my*F.U,r=mr*F.U;c.globalAlpha=F.A*.9;c.fillStyle='#fff4d6';c.beginPath();c.arc(x,y,r,-Math.PI*.62,Math.PI*.62,false);c.arc(x+r*.42,y,r*.84,Math.PI*.56,-Math.PI*.56,true);c.closePath();c.fill();}
 c.restore();}
const FW_LAND={black:{far:'#0b1238',near:'#060a26',water:['#0b1546','#03061a'],window:'#ffd27a'},white:{far:'#dde5f7',near:'#c9d5ef',water:['#e4ecfb','#cfdcf4'],window:'#ffb84d'}};
function Fwland(F,design,t){const land=design.land;if(!land||land==='none')return;const c=F.c,P=FW_LAND[F.white?'white':'black'],X=x=>F.cx+x*F.U,Y=y=>F.gy-y*F.U;c.save();c.globalAlpha=F.A;
 const hills=(amp,base,col,salt)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,F.h);for(let i=0;i<=48;i++){const x=i/48*F.w,u=(x-F.cx)/F.U;c.lineTo(x,Y(base+amp*(.5+.3*Math.sin(u*2.3+salt)+.2*Math.sin(u*5.1+salt*2))));}c.lineTo(F.w,F.h);c.closePath();c.fill();};
 if(land==='lake'){const g=c.createLinearGradient(0,F.gy,0,F.h);g.addColorStop(0,P.water[0]);g.addColorStop(1,P.water[1]);c.fillStyle=g;c.fillRect(0,F.gy,F.w,F.h-F.gy);
  c.fillStyle=P.near;c.beginPath();c.moveTo(0,F.gy+1);for(let i=0;i<=48;i++){const x=i/48*F.w,u=(x-F.cx)/F.U;c.lineTo(x,Y(.035+.025*Math.sin(u*3.1)+.012*Math.sin(u*9.7)));}c.lineTo(F.w,F.gy+1);c.closePath();c.fill();}
 else{hills(.09,.0,P.far,1.3);if(land==='town'){c.fillStyle=P.near;const roofs=[[-.95,.14],[-.82,.2],[-.7,.12],[-.6,.24],[-.5,.16],[-.38,.1],[.36,.12],[.47,.2],[.58,.15],[.66,.3],[.74,.17],[.86,.22],[.97,.13]];
   for(const [x,hh] of roofs){c.fillRect(X(x-.045),Y(hh),.09*F.U,hh*F.U+F.h);c.beginPath();c.moveTo(X(x-.055),Y(hh));c.lineTo(X(x),Y(hh+.05));c.lineTo(X(x+.055),Y(hh));c.fill();}
   c.fillStyle=P.window;for(const [k,[x,hh]] of roofs.entries())for(let j=0;j<3;j++){if(Krand(k*3+j,4.4)<.45)continue;c.globalAlpha=F.A*.75;c.fillRect(X(x-.025+.03*(j%2)),Y(hh-.035-.045*j),.014*F.U,.018*F.U);}c.globalAlpha=F.A;}
  hills(.05,-.01,P.near,4.1);}
 c.restore();}
// A lake mirrors the show: the same frame again, upside down and squashed, faint, below the shore.
function Fwreflect(F){const c=F.c;c.save();c.beginPath();c.rect(0,F.gy,F.w,F.h-F.gy);c.clip();c.translate(0,F.gy);c.scale(1,-.55);c.translate(0,-F.gy);const A=F.A;F.A=A*.32;Fwflush(F);F.A=A;c.restore();
 c.save();c.globalAlpha=F.A*.12;c.strokeStyle=F.white?'#9fb2db':'#7f95d9';c.lineWidth=1;c.beginPath();for(let i=0;i<14;i++){const y=F.gy+(F.h-F.gy)*(i+.5)/14,x=((Krand(i,2.2)*F.w+F.t*.02*F.U*(i%2?1:-1))%F.w+F.w)%F.w;c.moveTo(x-F.U*.12,y);c.lineTo(x+F.U*.12,y);}c.stroke();c.restore();}

// A whole show at time t (seconds since the press): H are the times of its visual events, pal its colours for this round.
export function FwShow(c,w,h,o,ph,design,H){const pal=design.pal[o.seed%design.pal.length],view=Fwview(w,h,design),t=ph.t;
 // A white ground under a strong dark background is drawn as on black, as in the other collections.
 // The decor (escDecor, 0.17) is the night sky and the land (or the lake): atenuat, under a veil; without it, the fireworks go up from
 // the base colour (the cards of the home page always show the sky).
 const d=escDecor(o),white=d.white&&!(d.full||(d.mode==='dim'&&d.fade>=.6));
 const F={c,...view,t,A:ph.alpha,white,red:!!o.reduced,low:(o.quality??1)<.5,segs:new Map(),dots:new Map(),heads:[],halos:[],light:0,p:[0,0],q:[0,0]};
 if(d.fade>0){Fwsky(F,design,t);Fwland(F,design,t);escVeil(c,d,0,0,w,h);}
 // The press is answered at once: a warm glow where the first rockets leave the ground.
 // The glow keeps its strength while the scene fades in, so the very first frame already shows it.
 if(t<.8)for(const s of FwPlan(design))if(s.at===0&&!s.dt){const a=Math.min(1,.6*(1-Ksmooth(t/.8))/Math.max(.35,F.A));Fwhead(F,Fwink(F,FW_EMBER),a,F.U*.05,s.lx??(s.x*.85),0);}
 for(const s of FwPlan(design)){const tb=FwTime(s,H);if(t<FwLaunch(s,H))continue;
  if(FW_BURSTS.has(s.kind)){if(s.rise)Fwrocket(F,s,t,tb,pal);if(t>=tb)Fwburst(F,s,t-tb,pal);}
  else if(s.kind==='comet'){Fwrocket(F,s,t,tb,pal);if(t>=tb&&s.burst)Fwburst(F,s.burst,t-tb,pal);}
  else if(['fountain','cascade','wheel'].includes(s.kind)){const e=s.until===undefined?s:{...s,dur:FwDur(s,H)};if(s.kind==='fountain')Fwfountain(F,e,t,tb,pal);else if(s.kind==='cascade')Fwcascade(F,e,t,tb,pal);else Fwwheel(F,e,t,tb,pal);}
  else if(s.kind==='candle')Fwcandle(F,s,t,tb,pal);
  else if(s.kind==='mine')Fwmine(F,s,t,tb,pal);}
 Fwflush(F);if(design.land==='lake'&&!F.low&&d.fade>0)Fwreflect(F);
 return F.heads.length/5;}

// The sounds of a show, from the same plan: a soft boom where a big shell opens (a bloom with a sizzle for smaller ones), a crackle
// for brocade, the shimmer of falling sparks for willows, the whoosh of the first rocket of each event, and the hiss of fountains,
// cascades and wheels while they burn. Pan follows the place on the screen; bursts that open together sound once.
export function FwSounds(design,H){const out=[],pan=x=>Kclamp(x*.8,-.7,.7);
 for(const s of FwPlan(design)){const tb=FwTime(s,H);
  if(FW_BURSTS.has(s.kind)&&s.kind!=='small'){const big=s.r>=.19,near=out.find(e=>e.variant===(big?'boom':'bloom')&&Math.abs(e.time-tb)<.12);
   const vel=Kclamp(.26+.9*(s.r-.08),.26,.5);if(near)near.vel=Math.min(.55,Math.max(near.vel,vel)+.04);else out.push({time:tb,len:big?2.2:2.4,variant:big?'boom':'bloom',vel,pan:pan(s.x)});
   // Crackles and showers of shells that open together sound once, a little louder, from the middle of them.
   const once=(time,len,variant,vel)=>{const e=out.find(e=>e.variant===variant&&Math.abs(e.time-time)<.12);if(e){e.vel=Math.min(.45,e.vel+.03);e.pan*=.5;}else out.push({time,len,variant,vel,pan:pan(s.x)});};
   if(s.crackle)once(tb+.45,2.8,'crackle',.36);
   if(s.gold)once(tb+.25,3.2,'shimmer',.34);}
  if((s.rise??0)>=.4&&(FW_BURSTS.has(s.kind)||s.kind==='comet')){const tl=FwLaunch(s,H);if(!out.some(e=>e.variant==='launch'&&Math.abs(e.time-tl)<.25))out.push({time:tl,len:Math.min(1.1,tb-tl+.15),variant:'launch',vel:.24,pan:pan(s.lx??s.x*.85)});}
  // One hiss for the pieces that burn on the ground: a piece lit while another hisses makes it only a little louder.
  if(['fountain','cascade','wheel'].includes(s.kind)){const len=FwDur(s,H),on=out.find(e=>e.inst==='fizzRec'&&e.time<=tb+.3&&e.time+e.len>tb);
   if(on){on.vel=Math.min(.38,on.vel+.02);on.len=Math.max(on.len,tb+len-on.time);on.pan*=.5;}else out.push({time:tb,len,inst:'fizzRec',variant:'fizz',vel:.3,pan:pan(s.x??0)});}
  if(s.kind==='mine'){const e=out.find(e=>e.variant==='bloom'&&Math.abs(e.time-tb)<.12);if(e){e.vel=Math.min(.55,e.vel+.03);e.pan*=.5;}else out.push({time:tb,len:2.4,variant:'bloom',vel:.3,pan:pan(s.x)});}}
 return out.map(e=>({inst:'fireRec',...e})).sort((a,b)=>a.time-b.time);}

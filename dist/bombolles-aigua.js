// Bombolles sense pes · stimulus 4, «Esferes d'aigua»: balls of clear water with ink inside.
// The matter: water without weight gathers into spheres. Each sphere is a lens (a bright rim, a dark ring just inside it, the window
// of the room reflected on it), it trembles when something touches it (the oscillations of a drop that Rayleigh described in 1879:
// the bigger the drop, the slower) and two spheres that touch flow into one through a neck. Each press drops ink of a new colour
// into the big sphere, where it unfolds in slow clouds. At the end the sphere breaks into drops that leave by every edge.
// The water is one field worked out for every point of the screen (up to 16 balls that melt into each other where they are close).
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_FULL,BMB_GLSL_NOISE} from './bombolles-shaders.js';
import {bmbKind,bmbField,bmbBodies,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
const AIG_MAX=16;
// uBall = x, y, radius, seed · uWob = the two oscillations (size, angle, size, angle) · uInk = how much ink, how many colours, –, –
bmbKind('aigua',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform float uAR,uT,uN,uPass,uPx;uniform vec4 uBall[${AIG_MAX}],uWob[${AIG_MAX}],uInk[${AIG_MAX}];uniform vec3 uPal[5];out vec4 o;
${BMB_GLSL_NOISE}
float aigWindow(vec3 r,vec3 L,float sz){float k=dot(r,L);if(k<=.05)return 0.;vec3 tx=normalize(cross(vec3(0.,1.,0.),L)),ty=cross(L,tx);float a=dot(r,tx)/k,b=dot(r,ty)/k;a+=b*.22;
 float e=.1*sz,box=smoothstep(sz+e,sz-e,abs(a))*smoothstep(sz*.78+e,sz*.78-e,abs(b));return box*smoothstep(.015*sz,.07*sz,abs(a+.1*sz))*(.55+.45*smoothstep(sz,-sz,b));}
vec3 aigPal(float x){x=mod(x,5.);float i=floor(x),f=x-i;f=f*f*(3.-2.*f);vec3 a=uPal[int(i)],b=uPal[int(mod(i+1.,5.))];return mix(a,b,f);}
void main(){vec2 p=vec2(vUv.x*uAR,1.-vUv.y);float d=1e3,R=.1,seed=0.;vec2 g=vec2(0.,1.),ctr=p,ink=vec2(0.);bool first=true;
 for(int i=0;i<${AIG_MAX};i++){if(float(i)>=uN)break;vec4 b=uBall[i];if(b.z<=1e-4)continue;vec2 v=p-b.xy;float l=length(v)+1e-5,th=atan(v.y,v.x);vec4 w=uWob[i];
  float rr=b.z*(1.+w.x*cos(2.*th-w.y)+w.z*cos(3.*th-w.w)),di=l-rr;
  if(first){first=false;d=di;R=rr;g=v/l;ctr=b.xy;ink=uInk[i].xy;seed=b.w;}
  else{float k=min(.05,.7*min(R,rr)),h=clamp(.5+.5*(d-di)/k,0.,1.);d=mix(d,di,h)-k*h*(1.-h);g=mix(g,v/l,h);R=mix(R,rr,h);ctr=mix(ctr,b.xy,h);ink=mix(ink,uInk[i].xy,h);seed=mix(seed,b.w,h);}}
 float aa=1.2/uPx;if(d>aa){discard;}float ed=1.-smoothstep(-aa,aa,d),dd=clamp(-d,0.,R),nz=sqrt(max(0.,dd*(2.*R-dd)))/R;g=normalize(g);vec3 n=normalize(vec3(g*(1.-dd/R),nz+1e-4));
 // the ink: clouds that fold slowly inside the ball, seen through its lens
 vec2 ip=(p-ctr)/R,il=ip*(.82+.18*nz)*(1.+2.2*R)+seed*17.;float tt=uT*.04;vec2 w1=vec2(bmbFbm(il*.8+vec2(0.,tt)),bmbFbm(il*.8+vec2(5.2,-tt)+3.1))-.5;
 vec2 w2=vec2(bmbFbm(il*1.9+w1*2.2+vec2(tt,1.7)),bmbFbm(il*1.9+w1*2.2+vec2(8.3,-tt)))-.5;
 vec2 iq=il*1.3+w2*1.7+w1*.8;float D0=bmbFbm(iq),M=ink.x*(1.-smoothstep(.15,1.,length(ip+w1*1.1+w2*.5)/(.42+.8*ink.x))),v=(D0-.5)*2.7+M*1.15-.55,inside=smoothstep(.04,.42,nz);
 float D=smoothstep(-.05,.6,v)*inside*smoothstep(0.,.12,M);float rimw=1.-nz,band=smoothstep(.5,.82,rimw)*(1.-smoothstep(.88,1.,rimw));
 if(uPass<.5){o=vec4(mix(vec3(1.),vec3(.9,.96,1.)*(1.-.5*band)*(1.-.9*D),ed),1.);return;}
 float vl=(bmbFbm(iq+vec2(-.085,-.11))-.5)*2.7+M*1.15-.55,lit=clamp(.8+(v-vl)*1.5,.3,1.45)*(.6+.5*smoothstep(.0,.6,v));
 vec3 ic=aigPal(1.2+ink.y*.8+(bmbFbm(il*.45+w1*.9+9.)-.5)*(5.+2.5*ink.y)+v*.7);vec3 col=ic*D*lit*1.7;
 // the water itself: the thin bright rim, the light gathered on the far side, the window and the sky of the room on its skin
 float fr=pow(rimw,3.),an=atan(n.y,n.x);vec3 rimc=mix(vec3(.2,.85,1.),vec3(.55,.42,1.),.5+.5*sin(an*2.+seed*6.+1.));col+=rimc*(fr*.8+pow(rimw,10.)*2.6);
 float ca=smoothstep(.15,.9,dot(g,vec2(.6,.78)))*smoothstep(.3,.75,rimw)*(1.-smoothstep(.8,.98,rimw));col+=vec3(.25,.8,1.)*ca*.55;
 vec3 rf=vec3(2.*nz*n.xy,2.*nz*nz-1.);float w0=aigWindow(rf,normalize(vec3(-.58,-.64,.5)),mix(.3,.15,smoothstep(.15,.6,R))),tl=dot(g,vec2(-.62,-.78));
 float arc=smoothstep(.7,.78,rimw)*(1.-smoothstep(.84,.9,rimw))*smoothstep(.55,.9,tl+.25*(bmbN4(vec2(an*3.,seed*9.)).g-.5)),arc2=smoothstep(.6,.66,rimw)*(1.-smoothstep(.7,.76,rimw))*smoothstep(.75,.95,-tl);
 col+=vec3(.95,1.,1.)*w0*1.2+vec3(.8,.97,1.)*arc*1.3+vec3(.4,.6,1.)*arc2*.5+vec3(.006,.02,.035)*nz;
 // a few bubbles of air caught in the water
 if(R>.05){vec2 q=ip*7.+vec2(seed*9.,-uT*.06),id=floor(q);float hb=bmbN4(id+.5).b;if(hb>.9){vec2 c=id+.5+(bmbN4(id+3.7).rg-.5)*.5,dv=q-c;float rb=.1+.14*bmbN4(id+9.1).a,db=length(dv)/rb;
   if(db<1.){col+=(vec3(.6,.9,1.)*smoothstep(.6,1.,db)*.6+vec3(1.)*smoothstep(.9,.97,dot(normalize(vec3(dv/rb,sqrt(1.-db*db))),normalize(vec3(-.4,-.5,.76))))*1.2)*inside;}}}
 o=vec4(col*ed,0.);}`);
// the inks of the two laps (five each)
export const AIG_PALS=Object.freeze([['#1f5bff','#b23cff','#ff3fd0','#19d9e6','#7dff3a'],['#ff7a1a','#ff4f9e','#8dff3a','#ffb02e','#b25cff']]);
export function aigNew(o={}){const rnd=bmbRandom(o.seed||11);return {kind:'aigua',AR:o.AR||16/9,lap:o.lap||0,rnd,t:0,b:[],dots:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),main:null,post:{spread:.5,bloom:.14,exp:1}};}
function aigOutside(S,x,y,m){const AR=S.AR,d=[x,y,AR-x,1-y];let e=0;for(let i=1;i<4;i++)if(d[i]<d[e])e=i;return e===0?[-m,y]:e===2?[AR+m,y]:e===1?[x,-m]:[x,1+m];}
function aigAdd(S,o){const r=S.rnd,s=o.from||aigOutside(S,o.tx,o.ty,o.R*1.15+.03),b={x:s[0],y:s[1],vx:0,vy:0,tx:o.tx,ty:o.ty,r:o.r??o.R,R:o.R,seed:r(),a2:.05*r(),v2:0,p2:r()*6.28,a3:.02*r(),v3:0,p3:r()*6.28,ink:o.ink||0,INK:o.ink||0,hue:o.hue||0,ph:r()*40,into:null,out:false,gone:false,stiff:o.stiff||1};S.b.push(b);return b;}
function aigDots(S,x,y,n,sp){const r=S.rnd;for(let i=0;i<n;i++){const a=r()*6.283,q=.02+sp*r();S.dots.push({x:x+Math.cos(a)*q,y:y+Math.sin(a)*q,vx:Math.cos(a)*.01*r(),vy:Math.sin(a)*.01*r(),r:.004+.009*r()*r(),ph:r()*30});}}
function aigEdgeSpot(S,R){const AR=S.AR,r=S.rnd,M=S.main;let best=null;for(let i=0;i<24;i++){const e=Math.floor(r()*4),u=.15+.7*r(),m=R*.9+.04,x=e===0?m:e===2?AR-m:u*AR,y=e===1?m:e===3?1-m:u;let c=9;for(const b of S.b){if(b.gone)continue;const d=Math.hypot(x-b.tx,y-b.ty)-b.R-R;if(d<c)c=d;}if(!best||c>best.c)best={c,x,y};}return best;}
export function aigPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P),cx=AR/2,cy=.5;S.k=k;S.P=P;S.role=role;
 if(role==='arriba'){if(!S.main){const e=S.e0,u=.35+.3*r(),R=.2,t=e===0?[.13,u]:e===2?[AR-.13,u]:e===1?[u*AR,.13]:[u*AR,.87];S.main=aigAdd(S,{tx:t[0],ty:t[1],R});aigDots(S,t[0],t[1],4,.3);S.ev.push({t:S.t,type:'entra',R});}
  else{const M=S.main;M.R=.25;M.tx+=(cx-M.tx)*.3;M.ty+=(cy-M.ty)*.3;M.INK=.38;M.v2+=.5;const f=aigEdgeSpot(S,.11);aigAdd(S,{tx:f.x,ty:f.y,R:.1+.03*r()});S.ev.push({t:S.t,type:'tinta',hue:0});}return;}
 const M=S.main;if(!M)return;
 if(role==='creix'){const free=S.b.filter(b=>b!==M&&!b.into&&!b.gone&&!b.out).sort((a,b)=>Math.hypot(a.tx-M.tx,a.ty-M.ty)-Math.hypot(b.tx-M.tx,b.ty-M.ty));if(free.length)free[0].into=M;
  M.tx+=(cx-M.tx)*.35;M.ty+=(cy-M.ty)*.35;M.R=Math.min(.46,M.R*1.13);M.INK=Math.min(.9,M.INK+.17);M.hue+=.6;
  for(let i=0;i<2;i++){const R=.08+.06*r(),f=aigEdgeSpot(S,R);aigAdd(S,{tx:f.x,ty:f.y,R});}aigDots(S,M.tx,M.ty,3,M.R+.2);S.ev.push({t:S.t,type:'tinta',hue:M.hue});return;}
 if(role==='ple'){for(const b of S.b)if(b!==M&&!b.gone)b.into=M;M.tx=cx;M.ty=cy;M.R=.63;M.INK=1;M.hue+=1;M.v2+=.6;
  for(let i=0;i<3;i++){const a=.6+i*2.1+r()*.8,R=.12+.08*r();aigAdd(S,{tx:cx+Math.cos(a)*(.63+R*.45)*1.12,ty:cy+Math.sin(a)*(.63+R*.45)*.8,R,ink:.3*r()});}aigDots(S,cx,cy,8,.75);S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the big ball breaks into drops, and every drop leaves by the edge in front of it
 const n=6,a0=r()*6.283;for(let i=0;i<n;i++){const a=a0+i/n*6.283+(r()-.5)*.4,R=M.r*(.36+.1*r()),c=aigAdd(S,{from:[M.x+Math.cos(a)*M.r*.42,M.y+Math.sin(a)*M.r*.42],tx:0,ty:0,R,r:R*.2,ink:M.ink*(.5+.4*r()),hue:M.hue});c.out=true;c.ox=Math.cos(a);c.oy=Math.sin(a)*.8;c.wait=.5+.25*i*r();c.acc=.1+.05*r();}
 M.R=0;M.dying=true;for(const b of S.b){if(b===M||b.out)continue;b.into=null;const dx=b.x-cx,dy=b.y-cy,l=Math.hypot(dx,dy)||1;b.out=true;b.ox=dx/l;b.oy=dy/l;b.wait=.3*r();b.acc=.1;}
 for(const d of S.dots){const dx=d.x-cx,dy=d.y-cy,l=Math.hypot(dx,dy)||1;d.ox=dx/l;d.oy=dy/l;}S.out=true;S.ev.push({t:S.t,type:'surt'});}
export function aigStep(S,dt){const AR=S.AR,t=S.t+dt;S.t=t;
 for(const b of S.b){b.r+=(b.R-b.r)*(1-Math.exp(-dt/(b.dying?.5:.9)));b.ink+=(b.INK-b.ink)*(1-Math.exp(-dt/2.2));
  if(b.out){b.wait-=dt;if(b.wait<=0){b.vx+=b.ox*b.acc*dt;b.vy+=b.oy*b.acc*dt;}else{b.vx+=b.ox*.02*dt;b.vy+=b.oy*.02*dt;}}
  else if(b.into){const M=b.into,dx=M.x-b.x,dy=M.y-b.y,l=Math.hypot(dx,dy)||1;b.vx+=(dx/l*.35-b.vx*1.6)*dt;b.vy+=(dy/l*.35-b.vy*1.6)*dt;
   if(l<M.r+b.r*.2&&!b.fused){b.fused=true;M.R=Math.min(.7,Math.sqrt(M.R*M.R+b.R*b.R*.6));b.R=0;M.v2+=1.1*Math.min(1,b.r/M.r*3);M.p2=Math.atan2(-dy,-dx)*2;M.v3+=.5;S.ev.push({t,type:'fusio',R:b.r,x:b.x/AR});}
   if(b.fused&&b.r<.004)b.gone=true;}
  else{const wx=Math.sin(t*.19+b.ph)*.02+Math.sin(t*.08+b.ph*2.3)*.015,wy=Math.cos(t*.15+b.ph*1.7)*.02+Math.sin(t*.1+b.ph*.7)*.012;b.vx+=((b.tx+wx-b.x)*.9-b.vx*1.9)*dt;b.vy+=((b.ty+wy-b.y)*.9-b.vy*1.9)*dt;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;const w2=Math.min(9,Math.max(1.3,.22*Math.pow(Math.max(b.r,.01),-1.5)*.5)),w3=w2*1.9;b.v2+=(-w2*w2*b.a2-.9*b.v2)*dt;b.a2+=b.v2*dt;b.v3+=(-w3*w3*b.a3-1.4*b.v3)*dt;b.a3+=b.v3*dt;b.a2=Math.max(-.09,Math.min(.09,b.a2));b.a3=Math.max(-.05,Math.min(.05,b.a3));
  if(b.dying&&b.r<.004)b.gone=true;if(b.out&&(b.x<-b.r-.08||b.x>AR+b.r+.08||b.y<-b.r-.08||b.y>1+b.r+.08))b.gone=true;}
 for(const d of S.dots){if(S.out){d.vx+=d.ox*.08*dt;d.vy+=d.oy*.08*dt;}else{d.vx+=(Math.sin(t*.3+d.ph)*.004-d.vx*.5)*dt;d.vy+=(Math.cos(t*.26+d.ph*1.3)*.004-d.vy*.5)*dt;}d.x+=d.vx*dt;d.y+=d.vy*dt;}
 if(S.out)S.dots=S.dots.filter(d=>d.x>-.05&&d.x<AR+.05&&d.y>-.05&&d.y<1.05);
 if(S.b.some(b=>b.gone)){S.b=S.b.filter(b=>!b.gone);if(S.main&&S.main.gone)S.main=null;}if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
export function aigCover(S){const G=48,H=27;let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,y=(j+.5)/H;for(const b of S.b){const dx=x-b.x,dy=y-b.y;if(dx*dx+dy*dy<b.r*b.r){n++;break;}}}return n/(G*H);}
export const aigEmptyNow=S=>!S.b.length&&!S.dots.length;
const AIG_B=new Float32Array(AIG_MAX*4),AIG_W=new Float32Array(AIG_MAX*4),AIG_I=new Float32Array(AIG_MAX*4),AIG_D=new Float32Array(64*20),AIG_P=new Float32Array(15);
export function aigDraw(S){const L=S.b.slice().sort((a,b)=>b.r-a.r).slice(0,AIG_MAX),n=L.length;if(n){L.forEach((b,i)=>{const k=i*4;AIG_B[k]=b.x;AIG_B[k+1]=b.y;AIG_B[k+2]=b.r;AIG_B[k+3]=b.seed;AIG_W[k]=b.a2;AIG_W[k+1]=b.p2;AIG_W[k+2]=b.a3;AIG_W[k+3]=b.p3;AIG_I[k]=b.ink;AIG_I[k+1]=b.hue;});
  AIG_PALS[S.lap%2].forEach((h,i)=>AIG_P.set(bmbLin(h),i*3));bmbField('aigua',{uN:n,uBall:{arr:AIG_B,size:4},uWob:{arr:AIG_W,size:4},uInk:{arr:AIG_I,size:4},uPal:{arr:AIG_P,size:3},uT:S.t},'liquid');}
 let m=0;const d=AIG_D;for(const o of S.dots){if(m>=64)break;const k=m*20;d.fill(0,k,k+20);d[k]=o.x;d[k+1]=o.y;d[k+2]=o.r;d[k+4]=.35;d[k+5]=.8;d[k+6]=1;d[k+7]=1;m++;}if(m)bmbBodies('dot',d,m,{},true,1.2);}

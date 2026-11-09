// Bombolles sense pes · stimulus 5, «Anells de fum»: rings of coloured smoke.
// The matter: smoke that turns on itself in rings (vortex rings). A ring travels along its own axis, the smaller the faster, and two
// rings on the same axis play leapfrog: the one behind shrinks, speeds up and passes through the one in front, which widens and
// slows, and then they swap (Shariff & Leonard, 1992). Each ring is seen at an angle (an ellipse) and its smoke boils slowly.
// Nothing is simulated as a fluid: each ring is one drawing whose density is worked out from its shape and a slow noise. The rings
// are drawn at half the size of the picture (smoke is soft) and laid over the black.
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_SPRITE} from './bombolles-shaders.js';
import {bmbKind,bmbBodies,bmbLayer,bmbLayerEnd,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
// A = x, y, half the size of the drawing, seed · B = radius of the ring, radius of its tube, how flat it is seen (1 = a circle), angle ·
// C = colour (linear), how much of it is there · D = second colour, how far its smoke has turned · E = how unruly, time offset
bmbKind('fum',BMB_VS_SPRITE,`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uT,uPx;uniform sampler2D uNoise;out vec4 o;
// noise that comes back to the same value after M steps along the ring
float fumN(vec2 p,float M){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float y=(i.y+f.y+.5)/256.;return mix(texture(uNoise,vec2((mod(i.x,M)+.5)/256.,y)).r,texture(uNoise,vec2((mod(i.x+1.,M)+.5)/256.,y)).r,f.x);}
float fumFbm(vec2 p,float M){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*fumN(p,M);p=p*2.+vec2(0.,13.7);M*=2.;a*=.5;}return s/.9375;}
// two noises at once (billows), read from the picture of random numbers without the repeat
vec2 fumBil(vec2 p){vec2 s=vec2(0.);float a=.5;for(int i=0;i<5;i++){vec2 j=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 n=texture(uNoise,(j+f+.5)/256.).rg;float m=2.*n.x-1.;s+=a*vec2(.2*abs(m)+1.1*m*m,n.y);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(17.3,9.1);a*=.5;}return s/.96875;}
void main(){vec2 q=vQ*vA.z;float ca=cos(vB.w),sa=sin(vB.w);vec2 l=vec2(ca*q.x+sa*q.y,-sa*q.x+ca*q.y);float sq=max(vB.z,.12),R=vB.x,a=vB.y,t=uT*.1+vE.y,sd=vA.w*40.,M,ur;vec2 nc,er,toL=vec2(-.55,-.83);
 if(vE.z<.5){vec2 pr=vec2(l.x,l.y/sq);float rho=length(pr),th=atan(pr.y,pr.x),ct=cos(th),st=sin(th),sc=sqrt(ct*ct+st*st*sq*sq);ur=(rho-R)*sc/a;if(abs(ur)>3.6){discard;}
  M=max(4.,floor(6.2832*R/a*.7+.5));nc=vec2((th/6.2832+.5)*M,ur*.4);er=vec2(ca*ct-sa*st*sq,sa*ct+ca*st*sq)/sc;}
 else{vec2 c=l/a;ur=length(c);if(ur>3.6){discard;}M=256.;nc=c*.5+sd;er=normalize(q+1e-5);}
 // the tube wanders (a slow noise along the ring) and its smoke boils (two noises that slide through it)
 vec2 n0=nc+vec2(0.,vD.w*.2+sd+t*.4);float w=fumN(n0,M)*.7+fumN(n0*2.+vec2(0.,3.3),M*2.)*.3-.5,w2=fumN(nc*2.+vec2(0.,5.-vD.w*.2+sd-t*.3),M*2.)-.5,uu=ur+vE.x*(2.2*w+.45*w2);
 vec2 nb=l*(3.5+.4/a)+sd*3.+vec2(w,w2)*.35,lo=vec2(ca*toL.x+sa*toL.y,-sa*toL.x+ca*toL.y)*.5,v1=vec2(.3,-.5)*vD.w*.25,v2=vec2(-.6,.2)*vD.w*.25;float du=dot(er,toL)*.55;
 vec2 b1=fumBil(nb+v1),b2=fumBil((nb+lo)+v1),c1=fumBil(nb*2.1+v2+9.).rg,c2=fumBil((nb+lo)*2.1+v2+9.).rg;
 float rho=exp(-uu*uu*1.05)*(.3+1.25*b1.x+.55*c1.x),rhol=exp(-(uu+du)*(uu+du)*1.05)*(.3+1.25*b2.x+.55*c2.x);
 float al=min(1.,smoothstep(.16,.58,rho)*.93+.22*smoothstep(.06,.3,rho))*vC.a,shade=clamp(.55+1.5*(rho-rhol)+.45*smoothstep(.3,1.,rho)+.1*clamp(uu,-1.2,1.2)*dot(er,toL)+.25*(c1.y-.5),.1,1.6);
 vec3 base=mix(vC.rgb,vD.rgb,.38*(.5+.5*sin(nc.x/M*6.2832+vA.w*6.283)+.6*(b1.y-.5))),col=base*(.2+.6*shade);col=max(vec3(0.),mix(vec3(dot(col,vec3(.3,.5,.2))),col,1.3))+vec3(1.,.96,.9)*pow(max(0.,shade-1.1),2.)*.3;
 o=vec4(col*al,al);}`);
export const FUM_PALS=Object.freeze([['#ff7a12','#ff2f8e','#8a3cff','#22d877','#ffa51e','#d92bff'],['#2a8cff','#ffcf24','#ff6a4a','#a05cff','#22d8c4','#ff4f9e']]);
export function fumNew(o={}){const rnd=bmbRandom(o.seed||11);return {kind:'fum',AR:o.AR||16/9,lap:o.lap||0,rnd,t:0,b:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),ci:Math.floor(rnd()*6),post:{spread:.6,bloom:.16,exp:1.05}};}
function fumAdd(S,o){const r=S.rnd,pal=FUM_PALS[S.lap%2],c1=bmbLin(pal[S.ci%pal.length]),c2=bmbLin(pal[(S.ci+1+Math.floor(r()*2))%pal.length]);S.ci++;
 const g={x:o.x,y:o.y,tx:o.tx,ty:o.ty,vx:0,vy:0,ax:o.ax,ay:o.ay,sq:o.sq??(.45+.3*r()),R:o.R*.6,RR:o.R,a:o.a*.7,AA:o.a,c1,c2,spin:r()*9,seed:r(),al:o.al??1,A:o.al??1,turb:o.turb??.45,TURB:o.turb??.45,ph:r()*40,pair:null,lead:false,phi:0,out:false,gone:false,puff:!!o.puff};S.b.push(g);return g;}
// a ring that comes in through the edge nearest to its place, travelling along its axis
function fumRing(S,tx,ty,R,a){const AR=S.AR,r=S.rnd,d=[tx,ty,AR-tx,1-ty];let e=0;for(let i=1;i<4;i++)if(d[i]<d[e])e=i;const ang=[0,Math.PI/2,Math.PI,-Math.PI/2][e]+(r()-.5)*.7,ax=Math.cos(ang),ay=Math.sin(ang),m=d[e]+R+a*3+.05;
 const g=fumAdd(S,{x:tx-ax*m,y:ty-ay*m,tx,ty,ax,ay,R,a});S.ev.push({t:S.t,type:'anell',R,x:tx/AR});return g;}
function fumEmpty(S){const AR=S.AR,r=S.rnd;let best=null;for(let j=0;j<7;j++)for(let i=0;i<12;i++){const x=(i+.5)/12*AR,y=(j+.5)/7;let c=9;for(const b of S.b){const d=Math.abs(Math.hypot(x-b.tx,y-b.ty)-b.RR*.8)-b.AA;if(d<c)c=d;}
  c=Math.min(c,1.6*Math.min(x,y,AR-x,1-y)+.1)+.04*r();if(!best||c>best.c)best={c,x,y};}return best;}
export function fumPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;
 if(role==='arriba'){if(!S.b.length){const e=S.e0,u=.35+.3*r(),t=e===0?[.34,u]:e===2?[AR-.34,u]:e===1?[u*AR,.36]:[u*AR,.64];fumRing(S,t[0],t[1],.16,.055);}
  else{const A=S.b[0],B=fumAdd(S,{x:A.tx-A.ax*(Math.max(AR,1)*.5+.3),y:A.ty-A.ay*(Math.max(AR,1)*.5+.3),tx:A.tx,ty:A.ty,ax:A.ax,ay:A.ay,sq:A.sq,R:.15,a:.05});A.pair=B;B.pair=A;A.lead=true;A.RR=.18;S.ev.push({t:S.t,type:'anell',R:.12,x:A.tx/AR});}return;}
 if(role==='creix'){for(const b of S.b){b.RR*=1.1;b.AA*=1.14;}const f=fumEmpty(S),R=.17+.07*r(),g=fumRing(S,f.x,f.y,R,.058+.015*r());
  const f2=fumEmpty(S);fumAdd(S,{x:f2.x+(f2.x<AR/2?-1:1)*(Math.min(f2.x,AR-f2.x)+.3),y:f2.y,tx:f2.x,ty:f2.y,ax:1,ay:0,sq:.8,puff:true,R:.0,a:.07+.03*r(),turb:.8,al:.85});
  if(k%2===0){const B=fumAdd(S,{x:g.x-g.ax*.5,y:g.y-g.ay*.5,tx:g.tx,ty:g.ty,ax:g.ax,ay:g.ay,sq:g.sq,R:R*.85,a:.045});g.pair=B;B.pair=g;g.lead=true;}return;}
 if(role==='ple'){for(const b of S.b){b.RR*=1.25;b.AA*=1.18;b.TURB=Math.min(1,b.TURB+.15);}
  for(let i=0;i<7;i++){const f=fumEmpty(S);if(f.c<(i<2?.05:.13))break;fumRing(S,f.x,f.y,.2+.1*r(),.07).TURB=.6;}
  for(let i=0;i<6;i++){const f=fumEmpty(S);if(f.c<(i<3?.05:.1))break;fumAdd(S,{x:f.x+(f.x<AR/2?-1:1)*(Math.min(f.x,AR-f.x)+.35),y:f.y,tx:f.x,ty:f.y,ax:1,ay:0,sq:.8,puff:true,R:.0,a:.06+.025*r(),turb:.7,al:.85});}
  S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: every ring drifts away from the middle, widening and thinning as it goes
 for(const b of S.b){let dx=b.x-AR/2,dy=(b.y-.5)*1.4;const l=Math.hypot(dx,dy)||1,a=Math.atan2(dy/l,dx/l)+(r()-.5)*.4;b.out=true;b.ox=Math.cos(a);b.oy=Math.sin(a);b.wait=.3*r()+Math.max(0,.7-l)*.7;b.pair=null;b.RR*=1.5;b.A=.75;}
 S.ev.push({t:S.t,type:'surt'});}
export function fumStep(S,dt){const AR=S.AR,t=S.t+dt;S.t=t;
 for(const b of S.b){const k=1-Math.exp(-dt/(b.out?5:1.6));b.R+=(b.RR-b.R)*k;b.a+=(b.AA-b.a)*(1-Math.exp(-dt/1.6));b.turb+=(b.TURB-b.turb)*(1-Math.exp(-dt/2));b.al+=(b.A-b.al)*(1-Math.exp(-dt/3));b.spin+=dt*.07/Math.max(.03,b.a);
  // leapfrog: the pair turns around the place they share; the one that is behind is the smaller one
  let ox=0,oy=0;b.leap=0;if(b.pair&&!b.out){const A=b.lead?b:b.pair;A.phi+=dt*.25;const s=b.lead?1:-1,S0=.5*Math.min(.16,A.RR*.9);ox=b.ax*s*S0*Math.cos(A.phi);oy=b.ay*s*S0*Math.cos(A.phi);b.leap=s*.24*Math.sin(A.phi);}
  if(b.out){b.wait-=dt;if(b.wait<=0){b.vx+=b.ox*.07*dt;b.vy+=b.oy*.07*dt;}}
  else{const wx=Math.sin(t*.13+b.ph)*.02,wy=Math.cos(t*.11+b.ph*1.7)*.018;b.vx+=((b.tx+ox+wx-b.x)*.55-b.vx*1.5)*dt;b.vy+=((b.ty+oy+wy-b.y)*.55-b.vy*1.5)*dt;}
  b.x+=b.vx*dt;b.y+=b.vy*dt;const m=b.R+b.a*3.2;if(b.out&&(b.x<-m||b.x>AR+m||b.y<-m||b.y>1+m))b.gone=true;}
 if(S.b.some(b=>b.gone))S.b=S.b.filter(b=>!b.gone);if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
export function fumCover(S){const G=48,H=27;let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,y=(j+.5)/H;for(const b of S.b){const dx=x-b.x,dy=y-b.y,ca=Math.cos(b.rot||0),sa=Math.sin(b.rot||0),lx=ca*dx+sa*dy,ly=(-sa*dx+ca*dy)/b.sq;
    if(Math.abs(Math.hypot(lx,ly)-b.R)<b.a*1.3){n++;break;}}}return n/(G*H);}
export const fumEmptyNow=S=>!S.b.length;
const FUM_BUF=new Float32Array(48*20);
export function fumDraw(S){const d=FUM_BUF;let n=0;const L=S.b.slice().sort((a,b)=>(b.R*(1+(b.leap||0)))-(a.R*(1+(a.leap||0))));
 for(const b of L){if(n>=48)break;const k=n*20,R=b.R*(1+(b.leap||0)),a=b.a;b.rot=Math.atan2(-b.ax,b.ay);d[k]=b.x;d[k+1]=b.y;d[k+2]=R+a*3.5;d[k+3]=b.seed;d[k+4]=R;d[k+5]=a;d[k+6]=b.sq;d[k+7]=b.rot;
  d[k+8]=b.c1[0];d[k+9]=b.c1[1];d[k+10]=b.c1[2];d[k+11]=b.al;d[k+12]=b.c2[0];d[k+13]=b.c2[1];d[k+14]=b.c2[2];d[k+15]=b.spin;d[k+16]=b.turb;d[k+17]=b.ph;d[k+18]=b.puff?1:0;d[k+19]=0;n++;}
 if(!n)return;bmbLayer();bmbBodies('fum',d,n,{uT:S.t},false,1);bmbLayerEnd(false);}

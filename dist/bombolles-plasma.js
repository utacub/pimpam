// Bombolles sense pes · stimulus 3, «Plasma»: threads of light between points that glow.
// The matter: a few points of light (poles), half of them of one sign and half of the other, and the lines of the field they make
// together, which leave every pole as a wheel of threads and join it to its neighbours of the other sign (the lines of a field of
// point charges in a plane: the level lines of the sum of the angles around each pole, turned into a spiral by a term in log r). The
// threads waver with a slow noise, so they read as silk more than as a diagram. Nothing blinks: each press makes the threads reach
// further and brings new poles, and the light grows by its shape, not by flashes.
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_FULL,BMB_GLSL_NOISE} from './bombolles-shaders.js';
import {bmbKind,bmbField,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
const PLA_MAX=12;
// uNode = x, y, reach of its light, how much of it is there · uCol = colour (linear), sign (+1 or −1)
bmbKind('plasma',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform float uAR,uT,uGain,uPhase,uN;uniform vec4 uNode[${PLA_MAX}],uCol[${PLA_MAX}];out vec4 o;
${BMB_GLSL_NOISE}
void main(){vec2 p=vec2(vUv.x*uAR,1.-vUv.y);
 vec4 n1=bmbN4(p*1.6+vec2(uT*.045,-uT*.035)),n2=bmbN4(p*3.7+vec2(-uT*.06,uT*.05)+11.3),n3=bmbN4(p*8.+vec2(uT*.08,uT*.07)+5.7);
 vec2 q=p+(n1.rg-.5)*.2+(n2.rg-.5)*.07+(n3.rg-.5)*.02;float psi=uPhase,env=0.,core=0.,wsum=0.;vec3 tint=vec3(0.),hot=vec3(0.);
 for(int i=0;i<${PLA_MAX};i++){if(float(i)>=uN)break;vec4 nd=uNode[i],c=uCol[i];vec2 d=q-nd.xy;float r=length(d)+1e-4;psi+=c.a*(atan(d.y,d.x)+.8*log(r));
  float e=nd.w*exp(-pow(r/max(nd.z,1e-3),1.25));env+=e;tint+=c.rgb*e*e;wsum+=e*e;vec2 d0=mix(p,q,.35)-nd.xy;float s=.006+.035*nd.z,k=nd.w*s*s/(dot(d0,d0)+s*s);core+=k;hot+=c.rgb*k;}
 // threads at three finenesses: broad veils, strands and hairs; each fades in and out along its way
 float f=pow(.5+.5*cos(psi*3.+n1.b*6.),3.)*.5+pow(.5+.5*cos(psi*7.+n2.b*6.+1.7),6.)*.85+pow(.5+.5*cos(psi*17.+n3.b*5.+n1.a*6.),12.)*.55,gap=smoothstep(.3,.62,bmbN4(p*1.3+vec2(uT*.02,3.)).g*.55+n1.a*.55);
 f=max(0.,f-.06)*(.06+2.1*n2.a*(.25+.75*n1.a))*(.12+.88*gap);vec3 base=tint/max(wsum,1e-5);base=max(vec3(0.),mix(vec3(dot(base,vec3(.3,.5,.2))),base,1.5));float en=1.-exp(-env*1.4);
 vec3 col=base*f*en*uGain*1.5+base*en*en*.012+(hot*1.3+vec3(core)*.8)*1.3;o=vec4(col,0.);}`);
export const PLA_PALS=Object.freeze([['#1f4dff','#e01fff','#5a2bff','#18b8ff','#ff2fb8','#3a3cff'],['#27f07a','#ffd03a','#2ee6d0','#b7ff3a','#ffb02e','#35c8ff']]);
export function plaNew(o={}){const rnd=bmbRandom(o.seed||11);return {kind:'plasma',AR:o.AR||16/9,lap:o.lap||0,rnd,t:0,n:[],ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*4),gain:1,G:1,ph:rnd()*6,sg:1,ci:Math.floor(rnd()*6),post:{spread:.5,bloom:.24,exp:1}};}
// the point just outside the screen nearest to (x, y)
function plaOutside(S,x,y,m=.14){const AR=S.AR,d=[x,y,AR-x,1-y];let e=0;for(let i=1;i<4;i++)if(d[i]<d[e])e=i;return e===0?[-m,y]:e===2?[AR+m,y]:e===1?[x,-m]:[x,1+m];}
function plaEmpty(S){const AR=S.AR,r=S.rnd;let best=null;for(let j=0;j<7;j++)for(let i=0;i<12;i++){const x=(i+.5)/12*AR,y=(j+.5)/7;let c=9;for(const n of S.n){const d=Math.hypot(x-n.tx,y-n.ty);if(d<c)c=d;}
  c=Math.min(c,2.2*Math.min(x,y,AR-x,1-y)+.12)+.04*r();if(!best||c>best.c)best={c,x,y};}return best;}
function plaAdd(S,tx,ty,R,from){if(S.n.length>=PLA_MAX)return null;const r=S.rnd,pal=PLA_PALS[S.lap%2],s=from||plaOutside(S,tx,ty),n={x:s[0],y:s[1],tx,ty,vx:0,vy:0,r:R*.3,R,a:0,A:1,sg:S.sg,c:bmbLin(pal[S.ci++%pal.length]),ph:r()*40,out:false};
 S.sg=-S.sg;S.n.push(n);S.ev.push({t:S.t,type:'pol',x:tx/S.AR,R});return n;}
export function plaPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;
 if(role==='arriba'){if(!S.n.length){const e=S.e0,u=.3+.4*r(),t=e===0?[.2,u]:e===2?[AR-.2,u]:e===1?[u*AR,.2]:[u*AR,.8];plaAdd(S,t[0],t[1],.1);}
  else{const a=S.n[0];a.R=.16;const ang=Math.atan2(.5-a.ty,AR/2-a.tx)+(r()-.5)*.9;plaAdd(S,a.tx+Math.cos(ang)*.34,a.ty+Math.sin(ang)*.3,.11);}return;}
 if(role==='creix'){for(const n of S.n)n.R=Math.min(.27,n.R*1.25);for(let i=0;i<2;i++){const f=plaEmpty(S);plaAdd(S,f.x,f.y,.1+.04*r());}S.ev.push({t:S.t,type:'creix'});return;}
 if(role==='ple'){for(let i=0;i<4&&S.n.length<10;i++){const f=plaEmpty(S);if(f.c<.2)break;plaAdd(S,f.x,f.y,.2);}for(const n of S.n)n.R=Math.max(n.R,.24)*1.25;S.G=1.12;S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: every pole leaves by the edge it is nearest to, and its threads go with it
 S.G=1;for(const n of S.n){let dx=n.x-AR/2,dy=(n.y-.5)*1.5;const l=Math.hypot(dx,dy)||1;const a=Math.atan2(dy/l,dx/l)+(r()-.5)*.4;n.out=true;n.ox=Math.cos(a);n.oy=Math.sin(a);n.wait=.2*r()+Math.max(0,.8-l)*.8;n.R*=.6;}
 S.ev.push({t:S.t,type:'surt'});}
export function plaStep(S,dt){const AR=S.AR,t=S.t+dt;S.t=t;S.ph+=dt*.1;S.gain+=(S.G-S.gain)*(1-Math.exp(-dt/1.5));
 for(const n of S.n){n.r+=(n.R-n.r)*(1-Math.exp(-dt/1.3));
  if(n.out){n.wait-=dt;if(n.wait<=0){n.vx+=n.ox*.09*dt;n.vy+=n.oy*.09*dt;}const o=Math.max(-n.x,-n.y,n.x-AR,n.y-1);n.A=o<=0?1:Math.max(0,1-o/.3);n.a+=(n.A-n.a)*(1-Math.exp(-dt/.25));if(o>.32)n.gone=true;}
  else{const wx=Math.sin(t*.21+n.ph)*.02+Math.sin(t*.09+n.ph*2.1)*.02,wy=Math.cos(t*.17+n.ph*1.3)*.02+Math.sin(t*.11+n.ph*.6)*.015;n.vx+=((n.tx+wx-n.x)*1.1-n.vx*2.1)*dt;n.vy+=((n.ty+wy-n.y)*1.1-n.vy*2.1)*dt;n.a+=(n.A-n.a)*(1-Math.exp(-dt/.9));}
  n.x+=n.vx*dt;n.y+=n.vy*dt;}
 if(S.n.some(n=>n.gone))S.n=S.n.filter(n=>!n.gone);if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
export function plaCover(S){const G=32,H=18;let c=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const x=(i+.5)/G*S.AR,y=(j+.5)/H;let e=0;for(const n of S.n)e+=n.a*Math.exp(-Math.hypot(x-n.x,y-n.y)/Math.max(n.r,1e-3));if(e>.12)c++;}return c/(G*H);}
export const plaEmptyNow=S=>!S.n.length;
const PLA_NODE=new Float32Array(PLA_MAX*4),PLA_COL=new Float32Array(PLA_MAX*4);
export function plaDraw(S){const n=Math.min(PLA_MAX,S.n.length);if(!n)return;for(let i=0;i<n;i++){const o=S.n[i],k=i*4;PLA_NODE[k]=o.x;PLA_NODE[k+1]=o.y;PLA_NODE[k+2]=o.r;PLA_NODE[k+3]=o.a;PLA_COL[k]=o.c[0];PLA_COL[k+1]=o.c[1];PLA_COL[k+2]=o.c[2];PLA_COL[k+3]=o.sg;}
 bmbField('plasma',{uN:n,uNode:{arr:PLA_NODE,size:4},uCol:{arr:PLA_COL,size:4},uGain:S.gain,uPhase:S.ph,uT:S.t});}

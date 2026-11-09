// Bombolles sense pes · stimulus 7, «Oli i aigua»: two liquids that do not mix.
// The matter: a band of oil and a band of water side by side, clear and thick like glass. Where they meet, the surface that keeps
// them apart waves slowly, and fingers of the one push into the other (the fingers of the instability of Rayleigh and Taylor, when
// the heavier liquid lies on the lighter one), swell at the tip and let go a drop. This is the one stimulus with a little weight: a
// weak pull across the band, which is what makes the fingers grow. At the end the two liquids come apart and each leaves by its side.
// The two liquids are one field worked out for every point of the screen: the band along x′, its thickness and its fingers across.
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
import {BMB_VS_FULL,BMB_GLSL_NOISE} from './bombolles-shaders.js';
import {bmbKind,bmbField,bmbRandom} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
const OLI_F=6,OLI_D=24;
// uFing = place along the band, length, radius, lean · uDrop = x, y, radius (more than 0: oil; less: water), –
bmbKind('oli',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform float uAR,uT,uPx,uAng,uTo,uTw,uHead,uGap,uAmp,uNF,uND;uniform vec2 uC;uniform vec4 uFing[${OLI_F}],uDrop[${OLI_D}];uniform vec3 uGlowO,uSigO,uGlowW1,uGlowW2,uSigW;out vec4 o;
${BMB_GLSL_NOISE}
float oliMid(float x){return uAmp*(sin(x*2.1+uT*.22)*.06+sin(x*4.7-uT*.31+1.3)*.03+sin(x*9.1+uT*.45)*.012);}
float oliCap(vec2 p,vec2 a,vec2 b,float r){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float oliSmin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
void main(){vec2 p=vec2(vUv.x*uAR,1.-vUv.y);float ca=cos(uAng),sa=sin(uAng);vec2 v=p-uC,q=vec2(ca*v.x+sa*v.y,-sa*v.x+ca*v.y);
 float m=oliMid(q.x),tau=clamp((uHead-q.x)/.24,0.,1.),kk=sqrt(tau*(2.-tau));
 float to=uTo*kk*(1.+.25*sin(q.x*1.7+uT*.2+2.)+.12*sin(q.x*5.3-uT*.4)),tw=uTw*kk*(1.+.25*sin(q.x*1.4-uT*.17+.5)+.1*sin(q.x*4.1+uT*.3));
 float dO=to<.003?1e3:max(m-uGap-to-q.y,q.y-(m-uGap)),dW=tw<.003?1e3:max(m+uGap-q.y,q.y-(m+uGap+tw));
 for(int i=0;i<${OLI_F};i++){if(float(i)>=uNF)break;vec4 f=uFing[i];if(f.y<=.002)continue;float fm=oliMid(f.x)-uGap;vec2 a=vec2(f.x,fm-.02),b=vec2(f.x+f.w,fm+f.y);dO=oliSmin(dO,oliSmin(oliCap(q,a,b,f.z*.8),length(q-b)-f.z*1.3,.03),.075);}
 float dOd=1e3,dWd=1e3;for(int i=0;i<${OLI_D};i++){if(float(i)>=uND)break;vec4 b=uDrop[i];float dd=length(p-b.xy)-abs(b.z);if(b.z>0.)dOd=min(dOd,dd);else dWd=min(dWd,dd);}
 float dOa=min(dO,dOd),dOf=max(dOa,-dWd),dWf=min(max(dW,-dOa),dWd),d;bool oil=dOf<dWf;d=oil?dOf:dWf;float aa=1.2/uPx;if(d>aa){discard;}float ed=1.-smoothstep(-aa,aa,d);
 // the liquid is thick: its edge is rounded (a bevel as wide as wB) and its skin waves slowly
 float wB=oil?.05:.055,tb=clamp(-d/wB,0.,1.),z=sqrt(1.-(1.-tb)*(1.-tb));vec2 g=vec2(dFdx(d),-dFdy(d));g/=max(length(g),1e-6);float fl=oil?1.:-.7;
 vec4 nz=bmbN4(vec2(q.x*1.2-uT*.06*fl,q.y*3.4+(oil?0.:7.))),n2=bmbN4(vec2(q.x*3.1-uT*.1*fl,q.y*8.+3.));vec3 n=normalize(vec3(g*(1.-tb)*1.1+((nz.rg-.5)*.6+(n2.rg-.5)*.22)*tb,z*.9+.2));
 float dep=clamp((q.y-(m+uGap))/.32,0.,1.);vec3 glow=oil?uGlowO:mix(uGlowW1,uGlowW2,smoothstep(0.,1.,dep)),sig=oil?uSigO:uSigW;
 float s1=bmbN4(vec2(q.x*.9-uT*.05*fl,q.y*5.+1.)).b,s2=bmbN4(vec2(q.x*2.3-uT*.09*fl,q.y*11.)).a;float th=bmbN4(vec2(q.x*.7-uT*.03*fl,q.y*1.6+(oil?3.:9.))).r,sh=bmbN4(vec2(q.x*.8-uT*.04*fl+nz.r*.6,q.y*3.2+5.+nz.g*.5)).g,sheen=smoothstep(.6,.615,sh)*(1.-smoothstep(.64,.665,sh))*smoothstep(.35,.6,n2.b);
 vec3 col=glow*exp(-sig*(.25+.75*z)*(.7+2.4*th))*(.3+1.*s1*s2+.25*s1)+(vec3(1.,.97,.95)*sheen*.9+glow*.3*smoothstep(.55,.62,sh)*(1.-smoothstep(.66,.8,sh)))*tb;
 vec3 L=normalize(vec3(-.5,-.65,.58)),H=normalize(L+vec3(0.,0.,1.));float nh=max(0.,dot(n,H)),sp=smoothstep(.97,.985,nh)*2.2+pow(nh,22.)*.3,rim=pow(1.-z,3.);
 col+=glow*rim*.6+vec3(1.,.97,.92)*sp+glow*.6*smoothstep(.1,.9,dot(g,vec2(.55,.8)))*(1.-tb)*tb*3.;o=vec4(col*ed,0.);}`);
// the liquids of the two laps: the light of the oil and what it absorbs, the water near the oil and far from it, what the water absorbs
export const OLI_PALS=Object.freeze([{glowO:[2.4,1.05,.1],sigO:[.12,.95,2.2],glowW1:[1.15,.3,2.4],glowW2:[.12,.38,2.6],sigW:[1.5,1.15,.12]},{glowO:[.75,2.3,.12],sigO:[1.3,.1,2.1],glowW1:[2.4,.3,1.15],glowW2:[.1,.32,2.6],sigW:[.8,1.4,.25]}]);
export function oliNew(o={}){const rnd=bmbRandom(o.seed||11),AR=o.AR||16/9;return {kind:'oli',AR,lap:o.lap||0,rnd,t:0,ang:(rnd()<.5?0:Math.PI)+(rnd()-.5)*.7,to:0,TO:0,tw:0,TW:0,head:-1.5,HEAD:-1.5,gap:0,gv:0,amp:1,AMP:1,f:[],d:[],ev:[],role:'buit',k:0,P:o.presses||8,out:false,gone:true,post:{spread:.55,bloom:.2,exp:1}};}
const oliMidJS=(S,x)=>S.amp*(Math.sin(x*2.1+S.t*.22)*.06+Math.sin(x*4.7-S.t*.31+1.3)*.03+Math.sin(x*9.1+S.t*.45)*.012);
// from the band (x′ along, y′ across) to the screen
function oliOut(S,x,y){const c=Math.cos(S.ang),s=Math.sin(S.ang);return [S.AR/2+c*x-s*y,.5+s*x+c*y];}
function oliDrop(S,x,y,r,kind,vy=0){const q=oliOut(S,x,y);if(S.d.length>=OLI_D)S.d.shift();S.d.push({x:q[0],y:q[1],r,kind,vx:0,vy:0,dr:vy,ph:S.rnd()*40,a:0});S.ev.push({t:S.t,type:'gota',R:r,kind});}
function oliFinger(S){if(S.f.length>=OLI_F)return;const r=S.rnd,hi=Math.min(S.HEAD-.3,.85);let x=0;for(let i=0;i<12;i++){x=-.85+r()*(hi+.85);if(S.f.every(f=>Math.abs(f.x-x)>.22))break;}S.f.push({x,len:0,LEN:Math.min(S.TW*.75,.11+.1*r()),r:.034+.018*r(),lean:(r()-.5)*.12,re:0});}
export function oliPress(S,k,P=S.P){const r=S.rnd,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;S.gone=false;
 if(role==='arriba'){if(!S.TO){S.TO=.095;S.HEAD=-.2;oliDrop(S,-.2,-.12,.02,1);S.ev.push({t:S.t,type:'entra'});}else{S.TO=.1;S.TW=.09;S.HEAD=.1;oliDrop(S,.25,.02,.028,1);oliDrop(S,.4,-.1,.016,-1);S.ev.push({t:S.t,type:'aigua'});}return;}
 if(role==='creix'){S.HEAD=1.7;S.TO=Math.min(.34,S.TO+.05);S.TW=Math.min(.36,Math.max(.13,S.TW+.055));
  // the fingers that were already long let their tip go as a drop, and grow again
  for(const f of S.f){if(f.len>.07){const m=oliMidJS(S,f.x);oliDrop(S,f.x+f.lean,m+f.len,f.r*1.3,1,.012);f.LEN=.02;f.re=S.t+2.4;}}oliFinger(S);oliFinger(S);
  oliDrop(S,-.7+1.4*r(),-S.TO*(.3+.4*r()),.014+.02*r(),-1);oliDrop(S,-.7+1.4*r(),S.TW*(.5+.4*r()),.014+.022*r(),1);S.ev.push({t:S.t,type:'creix'});return;}
 if(role==='ple'){S.HEAD=1.9;S.TO=.5;S.TW=.52;S.AMP=2.4;for(const f of S.f){if(f.len>.07){const m=oliMidJS(S,f.x);oliDrop(S,f.x+f.lean,m+f.len,f.r*1.3,1,.012);f.LEN=.02;f.re=S.t+2;}}while(S.f.length<5)oliFinger(S);for(const f of S.f)if(!f.re)f.LEN=.14+.12*r();
  for(let i=0;i<5;i++){oliDrop(S,-.85+1.7*r(),-.08-.38*r(),.014+.03*r(),-1);oliDrop(S,-.85+1.7*r(),.1+.36*r(),.014+.035*r(),1);}S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the oil and the water come apart, and each leaves by its own side with its drops
 S.out=true;S.gv=.01;for(const f of S.f){f.LEN=0;f.re=0;}const c=Math.cos(S.ang),s=Math.sin(S.ang);for(const d of S.d){const y=-s*(d.x-S.AR/2)+c*(d.y-.5),sd=y<oliMidJS(S,0)?-1:1;d.ox=-s*sd;d.oy=c*sd;}S.ev.push({t:S.t,type:'surt'});}
export function oliStep(S,dt){const t=S.t+dt;S.t=t;if(S.gone)return;const e=x=>1-Math.exp(-dt/x);S.to+=(S.TO-S.to)*e(2);S.tw+=(S.TW-S.tw)*e(2);S.head+=(S.HEAD-S.head)*e(2.2);S.amp+=(S.AMP-S.amp)*e(2.5);
 if(S.out){S.gv+=.045*dt;S.gap+=S.gv*dt;if(S.gap>1.45){S.gone=true;S.d=[];S.f=[];S.TO=S.TW=S.to=S.tw=0;}}
 for(const f of S.f){if(f.re&&t>f.re){f.re=0;f.LEN=Math.min(S.TW*.75,.12+.1*S.rnd());}f.len+=(f.LEN-f.len)*e(f.LEN<f.len?.7:2.6);}
 const c=Math.cos(S.ang),s=Math.sin(S.ang);for(const d of S.d){d.a=Math.min(1,d.a+dt/.8);if(S.out){d.vx+=d.ox*S.gv*1.1*dt*8;d.vy+=d.oy*S.gv*1.1*dt*8;const sp=Math.hypot(d.vx,d.vy),mx=S.gv*1.05;if(sp>mx){d.vx*=mx/sp;d.vy*=mx/sp;}}
  else{const wx=Math.sin(t*.23+d.ph)*.006,wy=Math.cos(t*.19+d.ph*1.7)*.006;d.vx+=((c*.008*d.kind-s*d.dr+wx)-d.vx)*dt;d.vy+=((s*.008*d.kind+c*d.dr+wy)-d.vy)*dt;d.dr*=Math.exp(-dt/6);}d.x+=d.vx*dt;d.y+=d.vy*dt;}
 if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
export function oliCover(S){if(S.gone)return 0;const G=48,H=27,c=Math.cos(S.ang),s=Math.sin(S.ang);let n=0;for(let j=0;j<H;j++)for(let i=0;i<G;i++){const vx=(i+.5)/G*S.AR-S.AR/2,vy=(j+.5)/H-.5,x=c*vx+s*vy,y=-s*vx+c*vy,tau=Math.max(0,Math.min(1,(S.head-x)/.24)),kk=Math.sqrt(tau*(2-tau));
   if((y<-S.gap&&y>-S.gap-S.to*kk)||(y>S.gap&&y<S.gap+S.tw*kk))n++;}return n/(G*H);}
export const oliEmptyNow=S=>S.gone;
const OLI_FB=new Float32Array(OLI_F*4),OLI_DB=new Float32Array(OLI_D*4);
export function oliDraw(S){if(S.gone)return;const P=OLI_PALS[S.lap%2];S.f.forEach((f,i)=>{const k=i*4;OLI_FB[k]=f.x;OLI_FB[k+1]=f.len;OLI_FB[k+2]=f.r;OLI_FB[k+3]=f.lean;});S.d.forEach((d,i)=>{const k=i*4;OLI_DB[k]=d.x;OLI_DB[k+1]=d.y;OLI_DB[k+2]=d.r*d.a*d.kind;OLI_DB[k+3]=0;});
 bmbField('oli',{uT:S.t,uAng:S.ang,uC:[S.AR/2,.5],uTo:S.to,uTw:S.tw,uHead:S.head,uGap:S.gap,uAmp:S.amp,uNF:S.f.length,uND:S.d.length,uFing:{arr:OLI_FB,size:4},uDrop:{arr:OLI_DB,size:4},uGlowO:P.glowO,uSigO:P.sigO,uGlowW1:P.glowW1,uGlowW2:P.glowW2,uSigW:P.sigW});}

// Bombolles sense pes · «Esferes d'aigua» (rebuilt in 0.64 as a simulation): water without weight, squirted into the air of a cabin.
// The motion is not drawn: it is the liquid solver (bombolles-lbm.js), water and air with surface tension (Navier–Stokes with a
// phase field, Fakhari et al., 2017). A press only opens nozzles outside the screen (water comes out for a while at a speed that
// slows down, and the nozzle is then cut), pushes a little ink through a syringe into a drop, or fires the thruster of the cabin.
// What the water does then comes from the equations: a squirt gathers into a ball (surface tension), two balls that meet merge and
// wobble (the bigger, the slower), a fast collision throws small drops, the ink is carried in mushrooms by the flow inside the drop,
// and when the cabin accelerates everything falls out through one side, bent by the air that holds it back.
// Momentum is the rule of the choreography: each press aims its water so that the total momentum given stays near zero (two
// squirts that meet head on stop), which keeps the water on the screen without any invisible spring.
// Scales (one choice, stated): the screen is about 40 cm high (180 cells, 2.2 mm each); surface tension and density give one step of
// about 1.3 ms, and the solver runs 600 steps a second, a little slower than real time. The water is about 25 times more viscous
// than real water and 10 times denser than the air (instead of 830): the lattice cannot go lower and stay stable.
// The picture: the 2D section is the cut through the middle of the drops; the thickness for the light is the «inflated» section
// (a round drop gets the profile of a sphere). The drop reflects and bends the lights of the cabin; the inks are fluorescent.
import {BMB_VS_FULL} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {lbmU,lbmDyeTex,lbmInflateTex} from './bombolles-lbm.js';
import {lqBox,lqCell,lqScrX,lqNozzle,lqSyringe,lqBig,lqGap,lqEdge,lqThrustStart,lqThrust,lqRun,lqStep,lqMake} from './bombolles-liquids.js';
// the box: cells per screen height, the margin around the screen (cells), the liquids, steps a second, the most steps in a frame
// (not frozen: the review tool makes the box smaller; nozzle sizes follow Hs)
export const AIG_PHYS={Hs:180,margin:24,rhoL:.1,rhoH:1,tauL:.03,tauH:.03,sigma:.012,xi:4,tauPhi:.3,sps:600,maxSteps:14,chunk:2};
// two palettes: the three fluorescent inks (fluorescein, rhodamine, a blue coumarin · an orange, a cyan, a violet), the lights of the cabin
export const AIG_PALS=Object.freeze([{ink:['#7dff3a','#ff2f9a','#3a8bff'],lights:['#fff1dc','#5fd8ff','#ff7ad0','#ffd27a']},
 {ink:['#ff8a1f','#22f0ff','#a35cff'],lights:['#e8f4ff','#ffb35c','#7affc8','#c58cff']}]);
// the cabin: two small lamps in front (the highlights), two behind the water (seen bent through it: the lens), direction (x, y up,
// z towards the viewer) and size (rad); and a faint band of light all round the horizon that gives the thin bright rim
const AIG_LIGHTS=[[-.45,.55,.7,.075],[.62,.35,.7,.06],[.35,-.5,-.79,.16],[-.55,-.2,-.81,.12]];
bmbKind('aigua2',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uU,uQ,uD;uniform vec2 uN,uM,uSc,uDN;uniform float uPxc,uXi,uGlow;uniform vec3 uInk[3],uL[4];uniform vec4 uLd[4];out vec4 o;
vec4 bil(sampler2D t,vec2 q,vec2 N){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),ivec2(N)-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
float hAt(vec2 c){return sqrt(max(bil(uQ,c,uN).x,0.));}
uniform vec3 uRim;
vec3 env(vec3 d){vec3 c=vec3(.0015,.002,.004)*(1.+.6*d.y)+uRim*exp(-d.z*d.z*18.);for(int i=0;i<4;i++){float k=dot(d,normalize(uLd[i].xyz));c+=uL[i]*smoothstep(cos(uLd[i].w),cos(uLd[i].w*.4),k);}return c;}
void main(){vec2 c=uM+vUv*uSc;float phi=bil(uU,c,uN).w;if(phi<.02){o=vec4(0.);return;}
 // the edge: the distance to the middle of the interface (tanh profile of width ξ), one pixel soft
 float p=clamp(phi,.001,.999),d=.25*uXi*log(p/(1.-p)),a=clamp(d*uPxc+.5,0.,1.);if(a<=0.){o=vec4(0.);return;}
 float h=hAt(c),e=.7,hx=hAt(c+vec2(e,0.))-hAt(c-vec2(e,0.)),hy=hAt(c+vec2(0.,e))-hAt(c-vec2(0.,e));vec3 n=normalize(vec3(-hx/(2.*e),-hy/(2.*e),1.));
 vec3 v=vec3(0.,0.,1.);float F=.02+.98*pow(1.-max(n.z,0.),5.);vec3 refl=env(reflect(-v,n));
 vec3 t=refract(-v,n,.75),out1=normalize(vec3(t.xy*2.2,t.z));vec3 back=env(out1);
 float T=2.*h;vec3 ink=max(bil(uD,c*uDN/uN,uDN).rgb,vec3(0.));
 vec3 absorb=exp(-T*(vec3(.0016,.0007,.0003)+.02*(ink.r+ink.g+ink.b)));
 vec3 glow=(uInk[0]*ink.r+uInk[1]*ink.g+uInk[2]*ink.b)*(1.-exp(-.035*T))*uGlow;
 vec3 col=F*refl+(1.-F)*(back*absorb)+glow;o=vec4(col*a,a);}`);
export function aigNew(o={}){const rnd=bmbRandom(o.seed||41),AR=o.AR||16/9;
 return {kind:'aigua',AR,lap:o.lap||0,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*2),...lqBox(AIG_PHYS,AR),post:{bloom:.32,spread:.62,exp:1}};}
const INK=[[1,0,0,1],[0,1,0,1],[0,0,1,1]];
export function aigPress(S,k,P=S.P){const r=S.rnd,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;const c=(x,y)=>lqCell(S,x,y),AR=S.AR,big=lqBig(S),lap=S.lap;
 if(role==='arriba'){// two squirts from opposite edges that meet: one ball at rest (the first one left of the middle, the second right)
  const p=k===1?[AR*(.36+.06*r()),.45+.12*r()]:[AR*(.66+.05*r()),.4+.2*r()],T=c(...p);
  if((k+lap+S.e0)%2===0){lqNozzle(S,0,p[1],T,{dur:2.6+.4*r()});lqNozzle(S,2,p[1]+(r()-.5)*.1,T,{dur:2.6+.4*r()});}
  else{lqNozzle(S,1,p[0]/AR,T,{dur:2.4+.4*r(),r:12});lqNozzle(S,3,p[0]/AR+(r()-.5)*.1,T,{dur:2.4+.4*r(),r:12});}
  S.ev.push({t:S.t,type:'entra',x:p[0]/AR});return;}
 if(role==='creix'){
  // ink into the biggest drops (a syringe: a little water with ink, pushed in), and more water: aimed at the emptiest place (or, one
  // press in three, at the biggest drop), from the edge that brings the total momentum back towards zero
  const ink=big.slice(0,1+(k%2));ink.forEach((b,i)=>lqSyringe(S,b,INK[(k+i+lap)%3]));if(ink.length)S.ev.push({t:S.t,type:'tinta',x:lqScrX(S,ink[0].x)});
  const tgt=(k%3===2&&big.length)?[big[0].x,big[0].y]:(()=>{const g=lqGap(S);return [g.x,g.y];})();
  const e=lqEdge(S),u=e===0||e===2?1-(tgt[1]-S.my)/S.Hs:(tgt[0]-S.mx)/S.Ws;
  lqNozzle(S,e,Math.min(.9,Math.max(.1,u+(r()-.5)*.15)),tgt,{dur:1.3+1.1*r(),r:8+4*r(),U:.06+.02*r()});
  // and, now and then, a fast thin squirt across: it breaks into small drops when it hits
  if(k%3===0)lqNozzle(S,(e+2)%4,.25+.5*r(),tgt,{dur:1.2,r:5,U:.085,delay:.4});
  S.ev.push({t:S.t,type:'entra',x:lqScrX(S,tgt[0])});return;}
 if(role==='ple'){// squirts from the four edges at once, at the biggest drops and at the emptiest places: they crash and merge, plus ink
  for(let e=0;e<4;e++){const b=big[e%Math.max(1,Math.min(3,big.length))],g=lqGap(S),T=e<2&&b?[b.x,b.y]:[g.x,g.y];lqNozzle(S,e,.25+.5*r(),T,{dur:2.2+.8*r(),r:10+4*r(),U:.07+.015*r(),delay:.2*e});}
  const g=lqGap(S);lqNozzle(S,(S.e0+1)%4,.5,[g.x,g.y],{dur:2,r:9,delay:1.2});
  big.slice(0,3).forEach((b,i)=>lqSyringe(S,b,INK[i]));S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the cabin accelerates (a thruster), so in the cabin everything falls towards one side, faster and faster, and leaves
 // the screen through it, bent by the air that holds it back
 lqThrustStart(S,(S.e0+lap+1)%4,AIG_PHYS,8);S.ev.push({t:S.t,type:'surt'});}
export const aigStep=lqStep;
export function aigDraw(S){const gl=BMB.gl;if(!gl)return;const P=AIG_PHYS;
 const sim=lqRun(S,P,()=>lqMake(gl,S,P),(S,sim)=>{sim.acc=lqThrust(S,P);});
 bmbRebind();
 const pal=AIG_PALS[S.lap%2],L=new Float32Array(12),Ld=new Float32Array(16),I=new Float32Array(9);
 pal.lights.forEach((h,i)=>{const c=bmbLin(h),g=[9,6,2.2,1.6][i];L.set([c[0]*g,c[1]*g,c[2]*g],i*3);Ld.set(AIG_LIGHTS[i],i*4);});pal.ink.forEach((h,i)=>I.set(bmbLin(h).map(x=>x*1.6),i*3));
 bmbField('aigua2',{uU:{tex:lbmU(sim),unit:0},uQ:{tex:lbmInflateTex(sim),unit:1},uD:{tex:lbmDyeTex(sim),unit:3},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uDN:[sim.dye.w,sim.dye.h],
  uPxc:BMB.view.H/S.Hs,uXi:P.xi,uGlow:1,uRim:bmbLin(pal.lights[1]).map(x=>x*.22),uInk:{arr:I,size:3},uL:{arr:L,size:3},uLd:{arr:Ld,size:4}},false);}
// empty: on the way out, no water left on the screen (or, without a graphics card, some seconds after the thruster starts)
export function aigEmptyNow(S){if(S.role!=='surt')return false;if(!S.sim)return S.outT!=null&&S.t-S.outT>6;return S.simT-S.thrust.t0>2&&S.vis<30;}
export const aigCover=S=>S.cover;

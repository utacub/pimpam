// Bombolles sense pes · «Oli i aigua» (rebuilt in 0.65 as a simulation): coloured water pushed into oil between two glass plates.
// The cell is a Hele-Shaw cell, two plates of glass very close together, full of oil and lit from behind. A press opens a hole in the
// plate and pushes water with a fluorescent ink into the oil. Between close plates each liquid moves as Darcy's law says (the speed
// is the push of the pressure over its friction with the glass, which grows with its viscosity), and the boundary between them has
// a surface tension. When the thin liquid (water) pushes the thick one (oil), its front is unstable: any bulge goes faster than its
// neighbours and grows into a finger, the fingers split at the tip and branch (Saffman & Taylor, 1958; Paterson, 1981). None of
// this is drawn: it is the liquid solver (bombolles-lbm.js; Fakhari et al., 2017) with the friction of the plates (−ρ α u, α = 12ν/b²
// for each liquid), and a gap that is not quite even (glass is never flat), which decides where the first fingers start.
// The way out: the top plate is lifted a little (the friction falls) and a current of oil from one side carries the water away.
// Scales (one choice, stated): 160 cells per screen height; the oil has about 130 times the friction of the water; the surface tension is
// low, so the narrowest fingers are a few cells wide, which is what the lattice can draw.
import {BMB_VS_FULL} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {lbmU,lbmDyeTex} from './bombolles-lbm.js';
import {lqBox,lqCell,lqScrX,lqHole,lqBig,lqGap,lqRun,lqStep,lqMake} from './bombolles-liquids.js';
// the box (cells), the liquids (φ = 0 the oil, which is also the room outside the box; φ = 1 the water), the friction of the plates
// (oil, water), how uneven the gap is, the push of a hole (pressure p*), steps a second; not frozen: the review tool makes it smaller
export const OLI_PHYS={Hs:160,margin:20,rhoL:1,rhoH:1,tauL:.1,tauH:.1,sigma:1e-4,xi:3,tauPhi:.15,darcy:[.04,3e-4],rough:.3,p:.2,
 lift:[8e-4,4e-4],wash:.07,sps:600,maxSteps:14,chunk:1};
// two palettes: three fluorescent inks, the oil (its colour seen against the light behind), the light behind
export const OLI_PALS=Object.freeze([{ink:['#ff3d7a','#3dffb4','#4d84ff'],oil:'#ff9a2a',back:'#fff4e0'},
 {ink:['#ffd23d','#ff4fd8','#38e4ff'],oil:'#ffb347',back:'#f4f8ff'}]);
bmbKind('oli2',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uU,uD;uniform vec2 uN,uM,uSc,uDN;uniform float uPxc,uXi,uLight;uniform vec3 uInk[3],uOil,uBack;out vec4 o;
vec4 bil(sampler2D t,vec2 q,vec2 N){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),ivec2(N)-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
void main(){vec2 c=uM+vUv*uSc;float phi=bil(uU,c,uN).w;
 // the light behind the cell, a little brighter in the middle
 vec2 q=vUv-.5;vec3 back=uBack*uLight*(1.-.35*dot(q,q)*2.);
 // the oil: a thick amber layer that lets little light through
 vec3 oil=back*uOil*.009;
 if(phi<.02){o=vec4(oil,1.);return;}
 float p=clamp(phi,.001,.999),d=.25*uXi*log(p/(1.-p)),dp=d*uPxc,a=clamp(dp+.5,0.,1.);
 // the water and its ink, seen against the light
 vec4 w=max(bil(uD,c*uDN/uN,uDN),vec4(0.));float A=max(w.a,1e-3);vec3 ink=(w.r*uInk[0]+w.g*uInk[1]+w.b*uInk[2])/A;ink=mix(vec3(.6),ink,smoothstep(.05,.3,w.a));
 vec3 water=back*ink*.55;
 // the meniscus between the plates bends the light away: a dark line along the edge, with a thin bright line just inside it
 float px=1./max(uPxc,1e-3),line=exp(-pow(dp/1.6,2.)),inner=exp(-pow((dp-2.6)/1.1,2.));
 vec3 col=mix(oil,water,a);col*=1.-.75*line;col+=back*ink*.25*inner*a;
 o=vec4(col,1.);}`);
export function oliNew(o={}){const rnd=bmbRandom(o.seed||61),AR=o.AR||16/9;
 return {kind:'oli',AR,lap:o.lap||0,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,ink:0,light:0,...lqBox(OLI_PHYS,AR),post:{bloom:.22,spread:.55,exp:1}};}
const OLI_INK=[[1,0,0,1],[0,1,0,1],[0,0,1,1]];
// a place for a new hole: the emptiest one, kept off the edges. The holes of the last seconds count as water already there (the
// small picture read back from the card is a little late), so that two holes are never opened in the same place
function oliSpot(S){const keep=S.blobs,R=45*S.Hs/160;S.blobs=[...keep,...S.acts.filter(a=>a.kind==='hole'&&S.simT-a.t0<5).map(a=>({x:a.x,y:a.y,A:Math.PI*R*R,vis:true}))];
 const g=lqGap(S);S.blobs=keep;const mx=S.mx+S.Ws*.18,Mx=S.mx+S.Ws*.82,my=S.my+S.Hs*.2,My=S.my+S.Hs*.8;return [Math.min(Mx,Math.max(mx,g.x)),Math.min(My,Math.max(my,g.y))];}
export function oliPress(S,k,P=S.P){const r=S.rnd,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;const ph=OLI_PHYS;
 if(role==='arriba'){// one hole, a little off the middle, then a second one on the other side
  const p=k===1?lqCell(S,S.AR*(.38+.06*r()),.42+.16*r()):oliSpot(S);lqHole(S,p[0],p[1],OLI_INK[(S.ink++ +S.lap)%3],{dur:3,p:ph.p});
  S.ev.push({t:S.t,type:'entra',x:lqScrX(S,p[0])});return;}
 if(role==='creix'){// a new hole in the emptiest place; one press in three, the first hole again
  const b=lqBig(S)[0],p=(k%3===0&&b)?oliNear(S,b):oliSpot(S);lqHole(S,p[0],p[1],OLI_INK[(S.ink++ +S.lap)%3],{dur:2.2+.8*r(),p:ph.p});
  S.ev.push({t:S.t,type:'entra',x:lqScrX(S,p[0])});return;}
 if(role==='ple'){// three holes at once, a little harder, with the three inks
  for(let i=0;i<3;i++){const p=oliSpot(S);lqHole(S,p[0],p[1],OLI_INK[(S.ink++ +S.lap)%3],{dur:3.4,p:ph.p*1.15,delay:.3*i});}S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the top plate is lifted a little, and a current of oil from one side carries the water away
 S.acts=S.acts.filter(a=>a.kind!=='hole');S.outT=S.t;S.outSim=S.simT;S.washSide=(S.lap+S.k)%2?0:1;S.ev.push({t:S.t,type:'surt'});}
// a point of the biggest patch of water, as hole (its middle)
function oliNear(S,b){return [b.x,b.y];}
export function oliStep(S,dt){lqStep(S,dt);
 // the light behind the cell comes on with the first press and stays
 const want=S.role==='buit'?0:1;S.light+=(want-S.light)*(1-Math.exp(-dt/.5));}
export function oliDraw(S){const gl=BMB.gl;if(!gl)return;const ph=OLI_PHYS;
 const sim=lqRun(S,ph,()=>{const m=lqMake(gl,S,ph,{inflate:false,darcy:ph.darcy});m.rough=ph.rough;return m;},(S,sim)=>{
  if(S.role!=='surt'){sim.darcy=ph.darcy;sim.side=[0,0,0,0];return;}
  // lifting the plate: the friction falls in a second; then oil comes in through one side at the speed `wash` and leaves through
  // the other
  const t=S.simT-S.outSim,f=Math.min(1,t/1),u=ph.wash*Math.min(1,Math.max(0,t-.4)/1.5);
  sim.darcy=[ph.darcy[0]+(ph.lift[0]-ph.darcy[0])*f,ph.darcy[1]+(ph.lift[1]-ph.darcy[1])*f];sim.rough=ph.rough*(1-f);
  sim.side=S.washSide?[u,-u,0,0]:[-u,u,0,0];});
 bmbRebind();
 const pal=OLI_PALS[S.lap%2],I=new Float32Array(9);pal.ink.forEach((h,i)=>I.set(bmbLin(h).map(x=>x*1.5),i*3));
 bmbField('oli2',{uU:{tex:lbmU(sim),unit:0},uD:{tex:lbmDyeTex(sim),unit:3},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uDN:[sim.dye.w,sim.dye.h],
  uPxc:BMB.view.H/S.Hs,uXi:ph.xi,uLight:S.light,uInk:{arr:I,size:3},uOil:bmbLin(pal.oil),uBack:bmbLin(pal.back)},false);}
// empty: on the way out, no water left on the screen (or, without a graphics card, some seconds after the current starts)
export function oliEmptyNow(S){if(S.role!=='surt')return false;if(!S.sim)return S.outT!=null&&S.t-S.outT>7;return S.simT-S.outSim>2&&S.vis<30;}
export const oliCover=S=>S.cover;

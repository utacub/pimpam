// Bombolles sense pes · «Anells de fum» (rebuilt in 0.66 as a simulation): puffs of coloured smoke in still air.
// A press is a puff: a piston pushes the air through a slot outside the screen for half a second, with smoke in it. Nothing else is
// drawn or steered. The air is the fluid solver (bombolles-lbm.js, here one fluid: the incompressible Navier–Stokes equations at a
// low viscosity), and the smoke is a dye carried by it. The edges of the slot shed vorticity that rolls up into a pair of vortices
// turning opposite ways (the section of a smoke ring through its middle), which carries its smoke with it and travels on by itself,
// slowing down as viscosity spreads it (Saffman, 1992; Gharib, Rambod & Shariff, 1998). Two pairs that meet head on swap partners and
// fly off sideways; a pair that catches up with another one passes through it; the smoke shows all of it as spirals.
// The way out: a window is opened on one side and the draught carries the smoke away.
// Scales (one choice, stated): the screen is about one metre high (160 cells of 6 mm, 1200 steps a second, so a ring goes at some
// 15 cm a second and crosses the screen in about ten seconds); the air is about 30 times more viscous than real air (the lattice
// cannot go much lower and stay stable), so the rings are broader than real ones and slow down sooner.
import {BMB_VS_FULL} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {lbmU,lbmDyeTex} from './bombolles-lbm.js';
import {lqBox,lqCell,lqPuff,lqRun,lqStep,lqMake} from './bombolles-liquids.js';
// the box (cells), one fluid (the same on both sides of φ, which stays 0), steps a second, the draught at the end (lattice speed), the
// piston of a puff (its top speed, lattice units, and how long it pushes, seconds)
export const FUM_PHYS={Hs:160,margin:22,rhoL:1,rhoH:1,tauL:.03,tauH:.03,sigma:0,xi:4,tauPhi:.2,sps:1200,maxSteps:24,chunk:2,wash:.06,dyeFade:.9997,puffU:.17,puffDur:.6};
// two palettes of three smokes (dye channels r, g, b), and the colour of the light that falls on them
export const FUM_PALS=Object.freeze([{smoke:['#ff7a1f','#ff2f8e','#8a4cff'],light:'#fff2e0'},{smoke:['#2a9cff','#ffd02a','#ff5a4a'],light:'#eef6ff'}]);
bmbKind('fum2',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uD;uniform vec2 uN,uM,uSc;uniform vec3 uSm[3],uLight;out vec4 o;
vec4 dyeAt(vec2 c){return max(texture(uD,c/uN),vec4(0.));}
void main(){vec2 c=uM+vUv*uSc;vec4 d=dyeAt(c);float rho=d.a;if(rho<.004){o=vec4(0.);return;}
 vec3 col=(d.r*uSm[0]+d.g*uSm[1]+d.b*uSm[2])/max(d.r+d.g+d.b,1e-3);
 // the light comes from the top left: the smoke between it and this point shades it (a few samples towards the light)
 vec2 L=normalize(vec2(-.6,.8));float sh=0.;for(int i=1;i<=8;i++)sh+=dyeAt(c+L*float(i)*2.5).a;
 float lit=exp(-.55*sh),dens=1.-exp(-2.4*rho);
 vec3 c3=col*uLight*dens*(.18+.95*lit);
 o=vec4(c3,0.);}`);
export function fumNew(o={}){const rnd=bmbRandom(o.seed||11),AR=o.AR||16/9;
 return {kind:'fum',AR,lap:o.lap||0,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,e0:Math.floor(rnd()*2),ci:0,...lqBox(FUM_PHYS,AR),post:{bloom:.2,spread:.6,exp:1}};}
const FUM_SMOKE=[[1,0,0,1],[0,1,0,1],[0,0,1,1]];
// a puff from edge e at u along it, aimed at the scene point (x, y); o.f: a harder (or softer) push, o.delay
function fumPuff(S,e,u,x,y,o={}){lqPuff(S,e,u,lqCell(S,x,y),{col:FUM_SMOKE[(S.ci++ +S.lap)%3],U:FUM_PHYS.puffU*(o.f||1),dur:FUM_PHYS.puffDur,delay:o.delay||0});}
export function fumPress(S,k,P=S.P){const r=S.rnd,AR=S.AR,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;const side=(S.e0+k+S.lap)%2;
 if(role==='arriba'){// one ring across the screen; the second one from the other side, a little off its line: they meet
  const y=k===1?.42+.12*r():.5+.1*(r()-.5);fumPuff(S,side?2:0,y,side?0:AR,y);S.ev.push({t:S.t,type:'entra'});return;}
 if(role==='creix'){const pick=k%3;
  // two rings one after the other from the same slot: the second one catches up with the first and goes through it
  if(pick===0){const e=side?2:0,y=.3+.4*r();fumPuff(S,e,y,e?0:AR,y);fumPuff(S,e,y,e?0:AR,y,{delay:.9,f:1.15});}
  // a ring from above or below
  else if(pick===1){const e=side?1:3,x=.25+.5*r();fumPuff(S,e,x,x*AR,e===1?1:0,{f:1.05});}
  // two rings head on, a little off each other's line
  else{const y=.35+.3*r(),dy=.06*(r()<.5?1:-1);fumPuff(S,0,y,AR,y);fumPuff(S,2,y+dy,0,y+dy);}
  S.ev.push({t:S.t,type:'entra'});return;}
 if(role==='ple'){// rings from the four sides at once, and a pair that follows
  fumPuff(S,0,.35+.1*r(),AR,.4);fumPuff(S,2,.55+.1*r(),0,.6);fumPuff(S,1,.3+.1*r(),.35*AR,1,{delay:.25});fumPuff(S,3,.6+.1*r(),.65*AR,0,{delay:.25});
  fumPuff(S,side?2:0,.45,side?0:AR,.45,{delay:1.1,f:1.15});S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: a window opens on one side and the draught carries the smoke away
 S.outT=S.t;S.outSim=S.simT;S.wind=side;S.ev.push({t:S.t,type:'surt'});}
export const fumStep=lqStep;
export function fumDraw(S){const gl=BMB.gl;if(!gl)return;const ph=FUM_PHYS;
 const sim=lqRun(S,ph,()=>lqMake(gl,S,ph,{inflate:false}),(S,sim)=>{
  if(S.role!=='surt'){sim.side=[0,0,0,0];return;}
  const u=ph.wash*Math.min(1,(S.simT-S.outSim)/1.2);sim.side=S.wind?[u,-u,0,0]:[-u,u,0,0];});
 bmbRebind();
 const pal=FUM_PALS[S.lap%2],C=new Float32Array(9);pal.smoke.forEach((h,i)=>C.set(bmbLin(h).map(x=>x*1.4),i*3));
 bmbField('fum2',{uD:{tex:lbmDyeTex(sim),unit:3},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uSm:{arr:C,size:3},uLight:bmbLin(pal.light)},true);}
// empty: the draught has blown long enough to carry everything across the box (or, without a graphics card, some seconds after)
export function fumEmptyNow(S){if(S.role!=='surt')return false;const ph=FUM_PHYS;return S.t-S.outT>Math.min(9,1.6+S.W/(ph.wash*ph.sps));}
export const fumCover=S=>null;

// Bombolles sense pes · «Ferrofluid» (rebuilt in 0.67 as a simulation): a black magnetic liquid in a dish, in the field of a coil.
// The matter: a liquid full of tiny magnets (a ferrofluid), heavier than the air above it, with a surface tension. It lies in a pool at the
// bottom of a dish, just under the screen. Around the dish there is a coil; each press sends more current through it, and its field
// goes up through the liquid. The liquid is magnetised by the field (μ = 1 + χ) and changes it: where the surface bulges, the field
// crowds into the bulge and pulls it further out. Over a certain field the flat surface is no longer stable and rises in a row of
// spikes, as far apart as the equations say (the normal-field instability: Cowley & Rosensweig, 1967); a stronger field makes them
// taller and sharper. None of this is drawn: the liquid is the solver (bombolles-lbm.js: Navier–Stokes with surface tension; Fakhari
// et al., 2017) with gravity and the magnetic force −½ H² ∇μ on the surface (Korteweg–Helmholtz, for a fluid magnetised in proportion
// to the field; Rosensweig, 1985), and the field is worked out at every step from ∇·(μ∇ψ) = 0 for the liquid as it is at that moment.
// Where the first spikes come up is decided by the small unevenness of the surface (a few random bumps of a cell when it is poured).
// The way out: the coil is switched off, the spikes fall back into the pool, under the screen.
// Scales (one choice, stated): 110 cells per screen height; the liquid is 10 times denser than the air (a real one, 1000 times), its
// susceptibility χ = 2 (a strong ferrofluid); the capillary length is about 7 cells, so that the spikes are some 45 cells apart (four
// across the screen); the field goes up to about twice the threshold of the instability. Checked: tools/bombolles-lbm-proves.mjs
// (the field of a cylinder, within 1.5 %; the threshold of the instability, between 0.9 and 1.0 times the theoretical value).
import {BMB_VS_FULL} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {lbmU,lbmInflateTex,lbmPaint,lbmMagnet} from './bombolles-lbm.js';
import {lqBox,lqRun,lqStep,lqMake} from './bombolles-liquids.js';
// the box (cells; margins left, right, bottom (the pool), top), the two fluids (φ = 1 the ferrofluid), gravity, the susceptibility,
// the surface of the pool at rest (cells from the floor), the field of the coil at each press (times the critical field), the rounds
// of the field solver per chunk of steps; not frozen: the review tool makes it smaller
export const FER_PHYS={Hs:110,margin:[8,8,44,10],rhoL:.1,rhoH:1,tauL:.06,tauH:.15,sigma:.02,xi:3,tauPhi:.2,grav:4.3e-4,chi:2,pool:34,
 field:[1.3,1.45,1.6,1.7,1.8],full:1.85,sps:600,maxSteps:14,chunk:2,sweeps:3,omega:1.9,thr:.4};
// the critical field of the flat surface (Cowley & Rosensweig, 1967; μ0 = 1): M_c² = 2 (1 + 1/μ) √(Δρ g σ), M = χ H inside, H0 = μ H inside
export function ferHc(ph=FER_PHYS){const mu=1+ph.chi,Mc=Math.sqrt(2*(1+1/mu)*Math.sqrt((ph.rhoH-ph.rhoL)*ph.grav*ph.sigma));return Mc/ph.chi*mu;}
// the lamps of the room mirrored in the liquid (two laps): left behind, right behind, in front, below
export const FER_PALS=Object.freeze([['#ff2fd0','#2a9cff','#ffb02e','#7a4cff'],['#ff9a1e','#19e0c8','#ff3fb0','#9a5cff']]);
bmbKind('ferro2',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uU,uQ;uniform vec2 uN,uM,uSc;uniform float uPxc,uXi;uniform vec3 uL1,uL2,uL3,uL4;out vec4 o;
vec4 bil(sampler2D t,vec2 q,vec2 N){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),ivec2(N)-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
float hAt(vec2 c){return sqrt(max(bil(uQ,c,uN).x,0.));}
// the lamps of the room, seen in the direction r: two long coloured ones behind (left and right), a small warm one in front, a dim one below
vec3 env(vec3 r){float a=dot(r,normalize(vec3(-.78,-.3,-.55))),b=dot(r,normalize(vec3(.8,-.2,-.52))),c=dot(r,normalize(vec3(.3,-.62,.72))),d=dot(r,normalize(vec3(.1,.55,-.8))),e=dot(r,normalize(vec3(-.2,-.9,-.35)));
 float g=dot(r,normalize(vec3(-.55,-.1,.83))),k=dot(r,normalize(vec3(.6,-.55,.58)));
 return uL1*(pow(max(a,0.),6.)*1.5+pow(max(a,0.),28.)*1.6)+uL2*(pow(max(b,0.),6.)*1.5+pow(max(b,0.),28.)*1.5)+uL3*(pow(max(c,0.),16.)*.7+pow(max(c,0.),90.)*1.2+pow(max(g,0.),10.)*.55)+vec3(1.)*pow(max(k,0.),60.)*.7
  +uL4*(pow(max(d,0.),2.)*.05+pow(max(e,0.),7.)*.2);}
void main(){vec2 c=uM+vUv*uSc;float phi=bil(uU,c,uN).w;if(phi<.02){o=vec4(0.,0.,0.,1.);return;}
 float p=clamp(phi,.001,.999),d=.25*uXi*log(p/(1.-p)),a=clamp(d*uPxc+.5,0.,1.);
 // the surface: the section of the liquid «inflated» into a body (a spike is a cone, a mound a dome), its normal from the thickness
 float e=.8,hx=hAt(c+vec2(e,0.))-hAt(c-vec2(e,0.)),hy=hAt(c+vec2(0.,e))-hAt(c-vec2(0.,e));vec3 n=normalize(vec3(-hx/(2.*e),-hy/(2.*e),1.));
 // a black mirror: only what it reflects, more of it at a grazing angle (Fresnel)
 vec3 I=normalize(vec3(0.,.3,-1.)),r=reflect(I,n);float fr=.3+.7*pow(1.-max(0.,dot(n,-I)),2.5);
 o=vec4(env(r)*fr*a*1.7,1.);}`);
export function ferNew(o={}){const rnd=bmbRandom(o.seed||67),AR=o.AR||16/9,lap=o.lap||0;
 return {kind:'ferro',AR,lap,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,n:0,want:0,I:0,...lqBox(FER_PHYS,AR),post:{bloom:.22,spread:.55,exp:1}};}
export function ferPress(S,k,P=S.P){const role=bmbRole(k,P),ph=FER_PHYS;S.k=k;S.P=P;S.role=role;
 // more current through the coil: the next step of the field
 if(role==='arriba'||role==='creix'){S.want=ph.field[Math.min(S.n++,ph.field.length-1)];S.ev.push({t:S.t,type:'camp',f:S.want});S.ev.push({t:S.t,type:'entra'});return;}
 if(role==='ple'){S.want=ph.full;S.ev.push({t:S.t,type:'camp',f:S.want});S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the coil is switched off
 S.want=0;S.outT=S.t;S.outSim=S.simT;S.ev.push({t:S.t,type:'surt'});}
// the current of the coil follows its switch (a coil takes a moment), in the time of the simulation: a slow graphics card runs the
// liquid slower, and the field keeps pace with it
function ferCoil(S,dt){S.I+=(S.want-S.I)*(1-Math.exp(-dt/(S.want>S.I?.4:.25)));if(!S.want&&S.I<1e-3)S.I=0;}
export function ferStep(S,dt){lqStep(S,dt);if(!S.sim)ferCoil(S,dt);}
// the box: closed, the pool at the bottom with a few bumps of a cell or so (the liquid was poured: its surface is never quite flat)
function ferMake(gl,S,ph){const sim=lqMake(gl,S,ph,{wall:15});sim.grav=ph.grav;const r=bmbRandom(91+S.lap*7);
 lbmPaint(sim,[{x:S.W/2,y:ph.pool-600,rx:S.W*40,ry:600,phi:1,soft:3}]);
 lbmPaint(sim,Array.from({length:8},()=>({x:S.W*(.05+.9*r()),y:ph.pool,rx:6+8*r(),ry:.8+1.2*r(),phi:r()<.5?1:0,soft:2})));return sim;}
export function ferDraw(S){const gl=BMB.gl;if(!gl)return;const ph=FER_PHYS;
 const sim=lqRun(S,ph,()=>ferMake(gl,S,ph),(S,sim,k)=>{
  // the field of the coil: uniform and upwards, as strong as its current
  ferCoil(S,k/ph.sps);if(S.I>1e-3)lbmMagnet(sim,[],{H:[0,S.I*ferHc(ph)],chi:ph.chi,sweeps:ph.sweeps,omega:ph.omega});else sim.F=null;});
 bmbRebind();
 const L=FER_PALS[S.lap%2].map(bmbLin);
 bmbField('ferro2',{uU:{tex:lbmU(sim),unit:0},uQ:{tex:lbmInflateTex(sim),unit:1},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uPxc:BMB.view.H/S.Hs,uXi:ph.xi,
  uL1:L[0],uL2:L[1],uL3:L[2],uL4:L[3]},false);}
// empty: the coil is off and no liquid is left on the screen (no block of the small picture half full, and less than a small drop in
// all; the air keeps a trace of φ of a thousandth or so), or, without a graphics card, some seconds after
export function ferEmptyNow(S){if(S.role!=='surt')return false;if(!S.sim)return S.outT!=null&&S.t-S.outT>6;return S.simT-S.outSim>1.5&&S.cover<.002&&S.vis<80;}
export const ferCover=S=>S.cover;

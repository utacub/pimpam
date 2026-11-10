// Bombolles sense pes · «Làmpada de lava» (0.64): wax of several colours in a closed lamp, heated from below. The only matter of the
// activity with weight. The motion is not drawn: it is the liquid solver (bombolles-lbm.js) with two immiscible liquids (wax and the
// liquid of the lamp, Navier–Stokes with surface tension; Fakhari et al., 2017), gravity, and a temperature field carried by the flow,
// conducted and cooled, that makes each liquid lighter when it is hot (Boussinesq: ρ(T) = ρ0 (1 − βT)). Cold, the wax is a little
// denser than the liquid and lies in a pool at the bottom, under the screen. A press lights one of the bulbs under the pool: its light
// comes on at once, and its heat warms the wax above it; the warm wax expands, becomes lighter than the liquid, rises in a plume that
// pinches off into a blob, cools near the top of the lamp, becomes denser again and sinks. What the blobs do (their shapes, necks,
// pinching off, merging, the slow currents of the liquid) comes from the equations. The colours are dyes in the wax, carried by the
// flow: two blobs of different colours that merge mix their colours little by little.
// The way out: the lamp is switched off. Its light dies away in some seconds (the bulbs are its only light), while the wax, cooling,
// stops, turns and starts to sink back towards the pool.
// Scales (one choice, stated): 128 cells per screen height; the wax is 4 % denser than the liquid when cold and 3 times more viscous;
// a blob crosses the screen in some seconds, a few times faster than in a real lamp, and the lamp warms and cools in seconds, not
// in an hour (the heat is put straight into the wax above a bulb, as its light and heat would be absorbed there).
import {BMB_VS_FULL} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {lbmU,lbmDyeTex,lbmInflateTex,lbmPaint,lbmDye,lbmTemp} from './bombolles-lbm.js';
import {lqBox,lqRun,lqStep,lqMake} from './bombolles-liquids.js';
// the box (cells; margins left, right, bottom: the pool under the screen, top: the cool top of the lamp), the liquids, gravity and
// expansion (wax, liquid), heat (conduction, cooling everywhere, cooling at the top), steps a second (not frozen: the review tool)
export const LAV_PHYS={Hs:128,margin:[6,6,40,14],rhoL:1,rhoH:1.04,tauL:.2,tauH:.9,sigma:.02,xi:4,tauPhi:.3,grav:3e-3,beta:[.08,.02],
 kappa:.02,cool:1e-4,coolTop:1.6e-3,coolOff:1.4e-3,pool:32,sps:600,maxSteps:14,chunk:2,thr:.4};
// two palettes: four colours of wax (dye channels r, g, b and «none of them»), the liquid of the lamp, the light of the bulbs
export const LAV_PALS=Object.freeze([{wax:['#ff2d7a','#ffb01f','#3dff8a','#9b4dff'],liq:'#1d3cff',bulb:'#ffd9a0'},
 {wax:['#26d4ff','#ff3b30','#ffe04d','#ff4dd2'],liq:'#7a2dff',bulb:'#fff0d0'}]);
// five bulbs along the bottom (share of the width), the order they are lit in
const LAV_BULBS=[.1,.3,.5,.7,.9],LAV_ORDER=[2,1,3,0,4];
bmbKind('lava',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uU,uQ,uD;uniform vec2 uN,uM,uSc,uDN;uniform float uPxc,uXi,uBulbY,uFall;uniform vec3 uWax[4],uLiq,uBulbC;uniform vec4 uBulb[5];out vec4 o;
vec4 bil(sampler2D t,vec2 q,vec2 N){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),ivec2(N)-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
float hAt(vec2 c){return sqrt(max(bil(uQ,c,uN).x,0.));}
// the light of the bulbs at a point (cells), and where it comes from
float light(vec2 c,out vec2 dir){float L=0.;dir=vec2(0.);for(int i=0;i<5;i++){vec2 d=c-vec2(uBulb[i].x,uBulbY);float r=length(d),l=uBulb[i].y/(1.+r*r/(uFall*uFall));L+=l;dir+=l*d/max(r,1.);}dir=L>0.?dir/L:vec2(0.,1.);return L;}
void main(){vec2 c=uM+vUv*uSc,ld2;float L=light(c,ld2);
 // the liquid of the lamp, lit by the bulbs below (a little cloudy: it scatters some of their light)
 vec3 liq=uLiq*L*.07*(.2+.8*exp(-(c.y-uM.y)/(uSc.y*.45)));
 float phi=bil(uU,c,uN).w;if(phi<.02){o=vec4(liq,1.);return;}
 float p=clamp(phi,.001,.999),d=.25*uXi*log(p/(1.-p)),a=clamp(d*uPxc+.5,0.,1.);
 float e=.8,hx=hAt(c+vec2(e,0.))-hAt(c-vec2(e,0.)),hy=hAt(c+vec2(0.,e))-hAt(c-vec2(0.,e));vec3 n=normalize(vec3(-hx/(2.*e),-hy/(2.*e),1.));
 // the colour of the wax: the mix of its dyes (the fourth colour is the share of none of the other three)
 vec4 w=max(bil(uD,c*uDN/uN,uDN),vec4(0.));float A=max(w.a,1e-3);vec3 col=(w.r*uWax[0]+w.g*uWax[1]+w.b*uWax[2]+max(w.a-w.r-w.g-w.b,0.)*uWax[3])/A;col=mix(uWax[3],col,smoothstep(.03,.25,w.a));
 // translucent wax lit from below: the side that faces the bulbs brighter, light scattered inside, a soft highlight of the room
 vec3 ld=normalize(vec3(-ld2,.5));float diff=.35+.65*max(dot(n,ld),0.),h=hAt(c),through=1.-exp(-.05*h);
 // (all of it the light of the bulbs: with the lamp off, everything is dark)
 vec3 wax=col*L*(.06+.5*diff+.35*(1.-through))*uBulbC;
 float spec=pow(max(dot(reflect(vec3(0.,0.,-1.),n),normalize(vec3(-.35,.55,.76))),0.),24.)*.06*L;
 o=vec4(mix(liq,wax+spec,a),1.);}`);
export function lavNew(o={}){const rnd=bmbRandom(o.seed||53),AR=o.AR||16/9;
 return {kind:'lava',AR,lap:o.lap||0,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,lit:0,bulbs:LAV_BULBS.map(()=>({on:0,burst:-9,P:0})),...lqBox(LAV_PHYS,AR),post:{bloom:.28,spread:.6,exp:1}};}
// a bulb: on (its steady power) and a burst of more power for a moment (the press)
function lavLight(S,i,burst=1.5){const b=S.bulbs[i];b.on=1;b.burst=S.simT;b.peak=burst;S.ev.push({t:S.t,type:'llum',x:LAV_BULBS[i]});}
export function lavPress(S,k,P=S.P){const role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;
 if(role==='arriba'||role==='creix'){
  // the next bulb in order; when all are lit, a burst at the one lit longest ago
  if(S.lit<LAV_BULBS.length)lavLight(S,LAV_ORDER[S.lit++]);
  else{let j=0;S.bulbs.forEach((b,i)=>{if(b.burst<S.bulbs[j].burst)j=i;});lavLight(S,j);}
  S.ev.push({t:S.t,type:'entra'});return;}
 if(role==='ple'){S.bulbs.forEach((b,i)=>{b.on=1;b.burst=S.simT+.25*i;b.peak=1.8;});S.lit=LAV_BULBS.length;S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the lamp is switched off
 S.bulbs.forEach(b=>{b.on=0;b.burst=-9;});S.outT=S.t;S.outSim=S.simT;S.ev.push({t:S.t,type:'surt'});}
// the power of a bulb now: its steady power, more during a burst (2.5 s), nothing when off
const lavPower=(S,b)=>!b.on?0:1.15+((S.simT-b.burst)<2.5&&S.simT>=b.burst?(b.peak||1.6)-1:0);
export function lavStep(S,dt){lqStep(S,dt);
 // the light of each bulb follows its power (a filament takes a moment to light and to go dark)
 for(const b of S.bulbs){const want=lavPower(S,b);b.P+=(want-b.P)*(1-Math.exp(-dt/(want>b.P?.25:S.role==='surt'?1:.6)));}}
// the box: closed (walls on every side), the cold wax pool at the bottom, its colours side by side
function lavMake(gl,S,ph){const sim=lqMake(gl,S,ph,{temp:true,wall:15});sim.grav=ph.grav;sim.beta=ph.beta;
 const top=ph.pool,W=S.W;lbmPaint(sim,[{x:W/2,y:top-420,rx:W*4,ry:420,phi:1,soft:4}]);
 // the colours: four bands side by side (r, g, b, none), the order turned each lap
 const D=[[1,0,0,1],[0,1,0,1],[0,0,1,1],[0,0,0,1]],z=[];for(let i=0;i<5;i++){const cx=S.mx+(i+.5)/5*S.Ws;z.push({x:cx,y:top/2,rx:S.Ws/10+(i===0||i===4?S.mx+4:3),ry:top*1.4,k:1,soft:3,dye:D[(i+S.lap)%4]});}
 lbmDye(sim,0,1,z);return sim;}
export function lavDraw(S){const gl=BMB.gl;if(!gl)return;const ph=LAV_PHYS,out=S.role==='surt';
 const sim=lqRun(S,ph,()=>lavMake(gl,S,ph),(S,sim,k)=>{
  // heat: each lit bulb warms the wax (and the liquid) above it towards its power; cooling everywhere, more at the top, much more
  // once the lamp is off
  const heat=[];S.bulbs.forEach((b,i)=>{const w=lavPower(S,b);if(w>0)heat.push({x:S.mx+LAV_BULBS[i]*S.Ws,y:4,rx:S.Ws*.075,ry:ph.pool*.9,phi:w,k:.012*k,soft:6});});
  lbmTemp(sim,k,{kappa:ph.kappa,cool:out?ph.coolOff:ph.cool,top:[S.my+S.Hs*.7,S.H,ph.coolTop,0]},heat);});
 bmbRebind();
 const pal=LAV_PALS[S.lap%2],Wx=new Float32Array(12),B=new Float32Array(20);pal.wax.forEach((h,i)=>Wx.set(bmbLin(h),i*3));
 S.bulbs.forEach((b,i)=>B.set([S.mx+LAV_BULBS[i]*S.Ws,b.P,0,0],i*4));
 bmbField('lava',{uU:{tex:lbmU(sim),unit:0},uQ:{tex:lbmInflateTex(sim),unit:1},uD:{tex:lbmDyeTex(sim),unit:3},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uDN:[sim.dye.w,sim.dye.h],
  uPxc:BMB.view.H/S.Hs,uXi:ph.xi,uBulbY:-S.Hs*.12,uFall:S.Hs*.55,uWax:{arr:Wx,size:3},uLiq:bmbLin(pal.liq),uBulbC:bmbLin(pal.bulb).map(x=>x*1.6),uBulb:{arr:B,size:4}},false);}
// empty: the lamp is off and its light is gone (with or without a graphics card: the light of the bulbs is kept here)
export function lavEmptyNow(S){return S.role==='surt'&&S.outT!=null&&S.t-S.outT>2.5&&S.bulbs.every(b=>b.P<.02);}
export const lavCover=S=>S.cover;

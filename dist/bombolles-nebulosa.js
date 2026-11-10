// Bombolles sense pes · «Nebulosa» (rebuilt in 0.68 as a simulation): a dark cloud of gas where stars are born, and its light.
// The matter: a cold cloud of hydrogen, clumpy (its density spread as in a turbulent cloud, with a few dense cores), dark and still on a
// black screen. Each press switches on a massive star inside it. Its ultraviolet light ionises the gas as far as its photons reach (a
// Strömgren region), which shines; the ionised gas, a hundred times hotter than the cloud, pushes the cloud away in a shell, and the
// bubble grows. Where the light meets a dense core, the core casts a shadow and is eaten away from the side of the star: a pillar that
// points at the star, with a bright rim (the mechanism of the pillars of M16: Hester et al., 1996; Williams, Ward-Thompson & Whitworth,
// 2001; Mellema et al., 2006). The full moment: a cluster of bright stars lights up the rest. The way out: the stars, massive ones, end
// as supernovae (one after another in three groups: time runs fast here), and their blast waves sweep the gas out of the screen; the
// gas left recombines and goes dark.
// None of this is drawn: the gas is the solver (bombolles-gas.js: the Euler equations, the light of each star along straight rays,
// heating, cooling, recombination). The stars are the only things placed by hand (where the cloud is not too dense and far from the
// bubbles there are), and their light and supernovae are the only inputs.
// The colour of the light (a choice, stated): the gas shines in proportion to (x ρ)² α(T) (recombination lines), shown with an asinh
// stretch (Lupton et al., 2004), and it is tinted as the emission lines of real nebulae are mapped: gas lit strongly for its density
// (a high ionisation parameter, thin gas near the stars: doubly ionised oxygen), the bulk (hydrogen), the ionisation fronts (ionised
// sulphur and nitrogen), the gas heated by shocks and the ejecta of the supernovae, each a colour of the palette of the lap (which
// lines come from where: Osterbrock & Ferland, 2006).
// Scales (one choice, stated): 150 cells per screen height; the ionised gas is 100 times hotter than the cloud at its mean density (in
// a real one, about 1000 times); a star ionises at first a disc of radius 8 cells in gas of the mean density, and the sound of the
// ionised gas runs at about 5 cells a second, so a bubble grows to a radius of some 25 to 35 cells in 5 s (a real one, at about
// 10 km/s, takes about a hundred thousand years to grow by a parsec). Checked: tools/bombolles-gas-proves.mjs (Sod's tube, the
// Strömgren radius, the Sedov blast, the growth of an ionised region against the law of Spitzer).
import {BMB_VS_FULL,BMB_VS_SPRITE} from './bombolles-shaders.js';
import {BMB,bmbKind,bmbField,bmbBodies,bmbLayer,bmbLayerEnd,bmbRandom,bmbLin,bmbRebind} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
import {gasCreate,gasDestroy,gasStep,gasLightUp,gasInject,gasDownAsk,gasDownGet,gasU,gasX,gasLight,gasMaxDt} from './bombolles-gas.js';
// the box (cells), the gas (γ, the temperature of ionised gas, the pressure of the cloud, recombination), the cloud (spread of the
// logarithm of its density, dense cores), a star (its first ionised radius in gas of density 1, the range of its brightness), the
// supernovae (energy, radius and mass put in), the steps; not frozen: the review tool makes it smaller
export const NEB_PHYS={Hs:150,margin:10,gam:5/3,Ti:26,p0:.26,alpha:3,tauH:.02,tauC:.15,Tmax:3e5,sigma:1,cores:24,Rs:8,q:[.8,1.4],qCluster:[2,3],
 snE:1.5e7,snR:8,snM:8,snGap:.7,kX:.2,cfl:.4,maxSteps:60,block:8,maxStars:16};
// the lines of the gas, two laps: the stars' own light, the fronts, the bulk, near the stars, shocked gas and ejecta
export const NEB_PALS=Object.freeze([['#ffd9a0','#ff6a4a','#ff2fb4','#22c8ff','#5a3cff'],['#ffe0f0','#ff5fc0','#3cff9a','#2a8cff','#7a3cff']]);
bmbKind('nebgas',BMB_VS_FULL,`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uU,uX,uL;uniform vec2 uN,uM,uSc;uniform float uGam,uTi,uF,uSoft,uWhite,uGain,uKX;uniform vec3 uC1,uC2,uC3,uC4;out vec4 o;
vec4 bil(sampler2D t,vec2 q,vec2 N){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),ivec2(N)-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
void main(){vec2 c=uM+vUv*uSc;vec4 U=bil(uU,c,uN),X=bil(uX,c,uN),L=bil(uL,c,uN);float r=max(U.x,1e-5);vec2 v=U.yz/r;float T=max((uGam-1.)*(U.w-.5*r*dot(v,v))/r,1e-6);
 // visible light: recombination, (x ρ)² α(T); X-rays of gas heated by shocks (free–free, ρ² √T), shown in the colour of hot gas as in
 // composite pictures of supernova remnants
 float th=T/uTi,xi=clamp(X.y/r,0.,1.),ej=clamp(X.x/r,0.,1.),e=xi*xi*r*r*pow(max(th,1.),-.7),ex=uKX*r*r*sqrt(th)*smoothstep(3.,10.,th);if(e+ex<1e-7){o=vec4(0.);return;}
 // the lines: where the light is strong for the density of the gas (a high ionisation parameter: thin gas near the stars), the bulk,
 // the fronts (partly ionised gas), shocked gas and ejecta
 float hi=smoothstep(.3,3.,L.y/(uF*max(r,.05))),fr=clamp(4.*xi*(1.-xi),0.,1.),hot=smoothstep(2.,10.,T/uTi);
 vec3 col=mix(uC2,uC3,hi);col=mix(col,uC1,fr);col=mix(col,uC4,max(hot*.75,ej*.85));col=mix(col,uC4,ex/(e+ex));
 o=vec4(col*asinh((e+ex)/uSoft)/asinh(uWhite/uSoft)*uGain,0.);}`);
// a star: A = x, y, radius · B = colour (linear), how much it shines
bmbKind('estel',BMB_VS_SPRITE,`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;out vec4 o;void main(){float r2=dot(vQ,vQ);if(r2>1.){discard;}float g=exp(-r2*9.)+.25*exp(-r2*2.5)*(1.-r2);o=vec4(vB.rgb*vB.a*g,0.);}`);
// the cloud: the logarithm of the density is a sum of smooth random fields (four octaves), so the density is log-normal with mean 1
// (as in a turbulent cloud), plus a few dense cores where it was already densest
function nebCloud(W,H,seed,ph){const r=bmbRandom(seed),g=new Float32Array(W*H);
 for(const [s,a] of [[26,1],[13,.55],[6.5,.3],[3.2,.16]]){const nx=Math.ceil(W/s)+2,ny=Math.ceil(H/s)+2,L=Float32Array.from({length:nx*ny},()=>r()*2-1),sm=t=>t*t*(3-2*t);
  for(let j=0;j<H;j++){const y=j/s,j0=Math.floor(y),fy=sm(y-j0);for(let i=0;i<W;i++){const x=i/s,i0=Math.floor(x),fx=sm(x-i0),k=j0*nx+i0;
   g[j*W+i]+=a*((L[k]*(1-fx)+L[k+1]*fx)*(1-fy)+(L[k+nx]*(1-fx)+L[k+nx+1]*fx)*fy);}}}
 let m=0,v=0;for(const x of g)m+=x;m/=g.length;for(const x of g)v+=(x-m)**2;const sd=Math.sqrt(v/g.length)||1,rho=new Float32Array(W*H);
 for(let i=0;i<W*H;i++)rho[i]=Math.exp(ph.sigma*(g[i]-m)/sd-ph.sigma*ph.sigma/2);
 for(let c=0;c<ph.cores;c++){let best=null;for(let n=0;n<12;n++){const i=Math.floor(r()*W),j=Math.floor(r()*H);if(!best||rho[j*W+i]>best[2])best=[i,j,rho[j*W+i]];}
  const [ci,cj]=best,rc=3+4*r(),pk=6+14*r();for(let j=Math.max(0,cj-3*rc|0);j<Math.min(H,cj+3*rc);j++)for(let i=Math.max(0,ci-3*rc|0);i<Math.min(W,ci+3*rc);i++)rho[j*W+i]+=pk*Math.exp(-((i-ci)**2+(j-cj)**2)/(rc*rc));}
 return rho;}
export function nebNew(o={}){const rnd=bmbRandom(o.seed||11),AR=o.AR||16/9,lap=o.lap||0,ph=NEB_PHYS,Hs=ph.Hs,Ws=Math.round(Hs*AR),m=ph.margin,W=Ws+2*m,H=Hs+2*m;
 return {kind:'nebulosa',AR,lap,rnd,t:0,simT:0,due:0,ev:[],role:'buit',k:0,P:o.presses||8,Hs,Ws,mx:m,my:m,W,H,rho0:nebCloud(W,H,(o.seed||11)*7+lap*131,ph),side:rnd()<.5?.3:.7,
  stars:[],acts:[],gas:null,smax:0,floors:[],cover:0,vis:0,ask:0,outT:null,outSim:null,lastSN:null,gone:false,post:{spread:.6,bloom:.42,exp:1}};}
// the density of the cloud as it started, around a cell
function nebRho(S,x,y){let s=0,n=0;for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){const a=Math.round(x)+i,b=Math.round(y)+j;if(a<0||b<0||a>=S.W||b>=S.H)continue;s+=S.rho0[b*S.W+a];n++;}return n?s/n:1;}
// how far the bubble of a star has got (the estimate of the law of Spitzer in this plane: enough to keep new stars out of it)
function nebReach(S,s){const ph=NEB_PHYS,Rs=Math.sqrt(2*s.B/ph.alpha)/Math.max(s.rho,.2),ci=Math.sqrt(ph.Ti),t=Math.max(0,S.simT-s.t0);return Rs*(1+1.5*ci*t/Rs)**(2/3);}
// where a new star is born: inside the screen, in gas a little denser than the mean (stars form where the cloud is dense) but not in
// a core, as far as can be from the bubbles there are (the first one on a side chosen at random)
function nebSpot(S){const r=S.rnd;let best=null;
 for(let n=0;n<70;n++){const x=S.mx+S.Ws*(.1+.8*r()),y=S.my+S.Hs*(.15+.7*r()),rho=nebRho(S,x,y);let d=1e9;
  for(const s of S.stars)if(s.on>0||s.t0>S.simT-1)d=Math.min(d,Math.hypot(x-s.x,y-s.y)-nebReach(S,s));
  if(d===1e9)d=80-Math.abs(x-(S.mx+S.Ws*S.side));const sc=d+14*r()-30*Math.max(0,rho-2.2)-40*Math.max(0,1-rho);if(!best||sc>best.sc)best={x,y,rho,sc};}
 return best;}
// a star switched on at (x, y) with brightness q (times a star of the first ionised radius Rs), its light rising over 0.6 s
function nebStar(S,p,q,delay=0){const ph=NEB_PHYS;if(S.stars.length>=ph.maxStars)return null;const s={x:p.x,y:p.y,rho:p.rho,q,B:q*ph.alpha*ph.Rs*ph.Rs/2,t0:S.simT+delay,on:0,sn:null,ev:false};S.stars.push(s);return s;}
const nebScrX=(S,x)=>Math.max(0,Math.min(1,(x-S.mx)/S.Ws));
export function nebPress(S,k,P=S.P){const role=bmbRole(k,P),ph=NEB_PHYS,r=S.rnd,q=()=>ph.q[0]+(ph.q[1]-ph.q[0])*r();S.k=k;S.P=P;S.role=role;
 if(role==='arriba'){nebStar(S,nebSpot(S),q());return;}
 // growth: one more star, and on every other press a second one somewhere else
 if(role==='creix'){nebStar(S,nebSpot(S),q());if(k%2===0)nebStar(S,nebSpot(S),q(),.5);S.ev.push({t:S.t,type:'creix'});return;}
 // the full moment: a small cluster of bright stars where it is darkest
 if(role==='ple'){const p=nebSpot(S);for(let i=0;i<3;i++){const a=i*2.1+r(),d=i?6+5*r():0;nebStar(S,{x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d,rho:p.rho},ph.qCluster[0]+(ph.qCluster[1]-ph.qCluster[0])*r(),i*.35);}S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the supernovae, the brightest stars first, in three groups
 S.outT=S.t;S.outSim=S.simT;S.ev.push({t:S.t,type:'surt'});const list=[...S.stars].sort((a,b)=>b.q-a.q),n=Math.ceil(list.length/3);
 for(let g=0;g<3;g++){const grp=list.slice(g*n,(g+1)*n);if(grp.length)S.acts.push({at:S.simT+.2+g*ph.snGap,stars:grp,done:false});}}
// what happens at a time of the simulation: stars that come on (an event each), supernovae
function nebActs(S){const ph=NEB_PHYS,inj=[];
 for(const s of S.stars){if(!s.ev&&S.simT>=s.t0){s.ev=true;S.ev.push({t:S.t,type:'estel',x:nebScrX(S,s.x)});}if(s.sn==null)s.on=Math.max(0,Math.min(1,(S.simT-s.t0)/.6));}
 for(const a of S.acts){if(a.done||S.simT<a.at)continue;a.done=true;S.lastSN=S.simT;let sx=0;
  for(const s of a.stars){s.sn=S.simT;s.on=0;sx+=s.x;inj.push({x:s.x,y:s.y,r:ph.snR,E:ph.snE*Math.sqrt(s.q),M:ph.snM,ej:1});}
  S.ev.push({t:S.t,type:'nova',x:nebScrX(S,sx/a.stars.length)});
  // the fastest the gas can now move: the hot gas of the smallest supernova of the group, at its centre
  const w=1/(Math.PI*ph.snR*ph.snR),T=(ph.gam-1)*ph.snE*w/(ph.snM*w+.15);S.floors.push({at:S.simT,s:Math.min(2200,2.5*Math.sqrt(ph.gam*Math.min(T,ph.Tmax)))});}
 if(S.ev.length>60)S.ev.splice(0,S.ev.length-60);return inj;}
// the clock: with a graphics card the gas runs inside the drawing (S.due); without one, what happens still happens in time
export function nebStep(S,dt){S.t+=dt;if(S.gas)S.due=Math.min(S.due+dt,.25);else{S.simT+=dt;nebActs(S);}}
// the small picture: the fastest signal (for the step), the light on the screen (coverage, amount)
function nebRead(S,D){const {w,h,bw,bh,data}=D;let sm=0,cov=0,tot=0,vis=0;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4,x=(i+.5)*bw,y=(j+.5)*bh;sm=Math.max(sm,data[k]);if(x<S.mx||x>S.mx+S.Ws||y<S.my||y>S.my+S.Hs)continue;tot++;if(data[k+1]>.02)cov++;vis+=data[k+1]*bw*bh;}
 S.smax=Number.isFinite(sm)?sm:Math.max(S.smax,200);S.cover=tot?cov/tot:0;S.vis=vis;}
function nebStable(S){const ph=NEB_PHYS,ci=Math.sqrt(ph.gam*ph.Ti);let f=S.stars.some(s=>s.on>0)?4*ci:4*Math.sqrt(ph.gam*ph.Ti*.3);
 for(const x of S.floors)f=Math.max(f,x.s*Math.sqrt(.05/(.05+S.simT-x.at)));S.floors=S.floors.filter(x=>S.simT-x.at<3);const dt=gasMaxDt(Math.max(S.smax*1.25,f),ph.cfl);return Number.isFinite(dt)&&dt>0?dt:1e-3;}
export function nebDraw(S){const gl=BMB.gl;if(!gl||S.gone)return;const ph=NEB_PHYS;
 if(S.gas&&(S.gas.dead||S.gas.gl!==gl))S.gas=null;
 if(!S.gas){S.gas=gasCreate(gl,{slot:'bombolles-gas',W:S.W,H:S.H,rho:S.rho0,gam:ph.gam,Ti:ph.Ti,p0:ph.p0,alpha:ph.alpha,tauH:ph.tauH,tauC:ph.tauC,Tmax:ph.Tmax,kX:ph.kX});S.due=0;}
 const G=S.gas;let n=0;
 // the light of the stars once a frame, then the steps the elapsed time asks for (at most maxSteps: a slow card runs the gas slower)
 const inj=nebActs(S);if(inj.length)gasInject(G,inj);gasLightUp(G,S.stars);
 while(S.due>1e-6&&n<ph.maxSteps){const dt=Math.min(nebStable(S),S.due);gasStep(G,dt);S.due-=dt;S.simT+=dt;n++;if(n%8===0){const more=nebActs(S);if(more.length)gasInject(G,more);}}
 if(n>=ph.maxSteps)S.due=0;
 if(S.t-S.ask>.1){const D=gasDownGet(G);if(D)nebRead(S,D);if(gasDownAsk(G,ph.block,ph.block))S.ask=S.t;}
 bmbRebind();const C=NEB_PALS[S.lap%2].map(bmbLin);
 bmbLayer();bmbField('nebgas',{uU:{tex:gasU(G),unit:0},uX:{tex:gasX(G),unit:1},uL:{tex:gasLight(G),unit:3},uN:[S.W,S.H],uM:[S.mx,S.my],uSc:[S.Ws,S.Hs],uGam:ph.gam,uTi:ph.Ti,
  uF:ph.alpha*ph.Rs*ph.Rs/24,uSoft:.3,uWhite:4,uGain:2,uKX:ph.kX,uC1:C[1],uC2:C[2],uC3:C[3],uC4:C[4]});bmbLayerEnd(true);
 // the stars, and the flash of each supernova: a point that brightens in 0.15 s and fades in about a second (the bloom of the picture
 // gives it its halo; never a blink)
 const d=NEB_STAR,warm=C[0].map(v=>v/Math.max(...C[0]));let k=0;for(const s of S.stars){let a=s.on,rad=.0035+.0035*Math.sqrt(s.q);const c=s.q>1.6?[.75,.85,1]:warm;
  if(s.sn!=null){const t=S.simT-s.sn;a=(t<.15?t/.15:Math.exp(-(t-.15)/.45))*4;rad*=1.6;}if(a<.01)continue;
  const o=k*20;d.fill(0,o,o+20);d[o]=(s.x-S.mx)/S.Hs;d[o+1]=1-(s.y-S.my)/S.Hs;d[o+2]=rad*2.2;d[o+4]=c[0];d[o+5]=c[1];d[o+6]=c[2];d[o+7]=a*1.6;k++;}
 if(k)bmbBodies('estel',d,k,{},true,1);
 if(nebEmptyNow(S)){S.gone=true;gasDestroy(S.gas);S.gas=null;}}
const NEB_STAR=new Float32Array(16*20);
// empty: the last supernova went off over 2.5 s ago and no light is left on the screen, or 12 s after the way out began; without a
// graphics card, 7 s after
export function nebEmptyNow(S){if(S.role!=='surt'||S.outT==null)return false;if(S.gone)return true;const done=S.acts.length>0&&S.acts.every(a=>a.done);
 if(!S.gas)return S.t-S.outT>7;return S.t-S.outT>12||(done&&S.simT-S.lastSN>2.5&&S.cover<.004&&S.vis<40);}
export const nebCover=S=>S.cover;

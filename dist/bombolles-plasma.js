// Bombolles sense pes · stimulus 3, «Plasma» (0.69): electric discharges through a gas, simulated with the dielectric breakdown model.
// The physics. Between electrodes at a high voltage a gas is an insulator until the field is strong enough to tear electrons off its
// atoms: thin ionised channels grow from the electrodes and branch, and when a channel from one electrode touches a conductor at
// another potential the gap is bridged and the arc carries the current that empties the electrodes (Raizer, 1991). The dielectric
// breakdown model (Niemeyer, Pietronero & Wiesmann, 1984) gives the shapes of these discharges (Lichtenberg figures): the electric
// potential φ obeys Laplace's equation ∇²φ = 0 in the gas (no space charge), the electrodes and the channels grown from them are
// conductors at the potential of their electrode minus a small drop along the channel (an internal field Es: Wiesmann & Zeller,
// 1986), and the box around the screen is grounded (φ = 0). A new piece of channel grows from a channel cell to one of its eight
// neighbours with a probability proportional to the field across that bond, E = Δφ / length, raised to η (η = 1), and only where E is
// above the breakdown field Ec (Wiesmann & Zeller, 1986). Laplace's equation is solved by red-black successive over-relaxation (Press
// et al., 2007), started each frame from the field of the frame before; a few bonds are added between two solutions (a stated
// approximation: the model adds one bond for each solution; adding several favours the tips a little, and the figures come out a
// little sparser, see the checks).
// Checks (tools/bombolles-plasma-proves.mjs): the solver against the field of a coaxial line, φ(r) = ln(r/R) / ln(r0/R); the fractal
// dimension of a radial discharge grown with η = 1, by its mass against its radius (Niemeyer et al., 1984, found D ≈ 1.75). Results
// (0.69): the field within 0.013 of the coaxial one; D = 1.70 in five discharges with one bond for each solution (1.53 to 1.85), and
// 1.59 with ten bonds for each solution (the fastest moments of the stimulus).
// What is not physics: the time. A real discharge crosses a gap in microseconds and its light dies in milliseconds; here a channel
// takes about a second to cross and its light a second more to die, so that the shape can be seen (slowed about a million times).
// Positive and negative channels grow alike (in air, positive streamers start more easily). The light of a channel follows the
// current it carries: the current into a branch feeds every tip beyond it, so the light grows with the number of cells beyond (to the
// power .42, a criterion); the arc, that carries the charge of both electrodes, is the brightest and the whitest (more current, a
// hotter gas, more lines and a continuum).
// Colour: the gas of the box, one for each lap (PLA_GASES): neon with argon (violet channels and pink arcs, as in a plasma globe) and
// xenon (blue). The colours are design criteria after the colour the eye sees in a lamp of each gas, not computed from spectra.
// The arc of presses. arriba: two electrodes (+, −) appear, the voltage rises, and channels grow from both until one bridges the gap;
// creix: one more electrode at each press and a higher voltage; each press is a pulse of a few seconds in which the electrodes that
// have emptied charge again and can fire again; ple: the highest voltage on all of them and three more electrodes: a storm of discharges, also
// to the grounded edges, for as long as the moment lasts; surt: the supply is cut, the channels go dark and the electrodes fade.
// Nothing blinks: an arc lights up in a quarter of a second and fades in about a second, and two arcs are at least PLA_PHYS.gapArc
// seconds apart.
// Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top. The grid: Hs cells over the height of the screen, and a margin around it.
import {BMB_VS_SPRITE} from './bombolles-shaders.js';
import {bmbKind,bmbBodies,bmbRandom,bmbLin} from './bombolles-motor.js';
import {bmbRole} from './bombolles-sabo.js';
export const PLA_PHYS={Hs:96,margin:10,eta:1,omega:1.9,sweepsPerS:720,Ec:.045,Es:.003,rate:30,maxPick:40,rE:2.3,dV:.3,
 V:[1,1.3],Vple:1.55,maxE:11,tauUp:.4,tauDown:.12,pulse:[2.6,4.2],pulseMax:7,recharge:1,gapArc:.5,rise:.25,tauArc:.9,tauDie:.35,tauDiePle:.8,appear:.6,delay:.5};
// the gas of each lap: the colour of thin channels (low current), of thick ones, of the arc, of the glow on the electrodes
export const PLA_GASES=Object.freeze([
 {name:'neó i argó',low:'#5b2cff',high:'#e03cc8',arc:'#ffc9e6',pol:'#ff7a3a'},
 {name:'xenó',low:'#2a46ff',high:'#7d6dff',arc:'#dfe6ff',pol:'#9ab8ff'}]);
export const PLA_PALS=Object.freeze(PLA_GASES.map(g=>[g.low,g.high,g.arc,g.pol]));
// a piece of channel: A = its two ends (x, y, x, y) · B = half its width, its light, how white it is · C = its colour
bmbKind('plalinia',`#version 300 es
layout(location=0) in vec2 aQ;layout(location=1) in vec4 aA;layout(location=2) in vec4 aB;layout(location=3) in vec4 aC;
uniform float uAR,uPx;out vec2 vP;flat out vec4 vA,vB,vC;
void main(){vec2 a=aA.xy,b=aA.zw,t=b-a;float l=length(t);t=l>1e-6?t/l:vec2(1.,0.);vec2 n=vec2(-t.y,t.x);float hw=max(aB.x,.6/uPx),R=hw*5.;
 vec2 p=mix(a-t*R,b,aQ.x*.5+.5)+n*aQ.y*R;vP=p;vA=aA;vB=vec4(hw,aB.y*min(1.,aB.x/hw),aB.zw);vC=aC;gl_Position=vec4(p.x/uAR*2.-1.,1.-p.y*2.,0.,1.);}`,
`#version 300 es
precision highp float;in vec2 vP;flat in vec4 vA,vB,vC;out vec4 o;
void main(){vec2 a=vA.xy,ab=vA.zw-a;float L2=dot(ab,ab),h=L2>1e-12?dot(vP-a,ab)/L2:0.;if(h>1.)discard;h=max(h,0.);
 // the round end is drawn only at the start of each piece: where two pieces meet, one round end and not two
 float d=length(vP-a-ab*h),hw=vB.x,q=d*d/(hw*hw),core=exp(-q),halo=.16/(1.+q*.35)*(1.-smoothstep(9.,25.,q));float e=vB.y*(core+halo);
 o=vec4(mix(vC.rgb,vec3(1.),vB.z*core)*e,0.);}`);
// an electrode, or the head of a growing channel: A = x, y, radius · B = colour, light · C = how white its core is, its glow
bmbKind('plapol',BMB_VS_SPRITE,`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC;out vec4 o;
void main(){float r=length(vQ),core=smoothstep(1.,.55,r),glow=vC.y*exp(-r*r*.45)*(1.-smoothstep(3.,4.,r));o=vec4((mix(vB.rgb,vec3(1.),vC.x*core)*core*1.3+vB.rgb*glow)*vB.w,0.);}`);
const PLA_SQ2=Math.SQRT2;
// ── The field and the growth (no drawing here: the tests use them in Node) ──────────────────────────────────────────────────────
// a grid NX × NY: kind 0 gas, 1 electrode, 2 channel, 3 ground (its edge); phi the potential
export function plaGrid(NX,NY){const n=NX*NY,g={NX,NY,phi:new Float32Array(n),kind:new Uint8Array(n),own:new Int16Array(n).fill(-1),par:new Int32Array(n).fill(-1),
 s:new Float32Array(n),desc:new Int32Array(n),kids:new Uint8Array(n),seg:new Int32Array(n).fill(-1),jx:new Float32Array(n),jy:new Float32Array(n),
 off:[1,-1,NX,-NX,NX+1,NX-1,-NX+1,-NX-1],inv:[1,1,1,1,1/PLA_SQ2,1/PLA_SQ2,1/PLA_SQ2,1/PLA_SQ2]};
 for(let i=0;i<NX;i++){g.kind[i]=3;g.kind[(NY-1)*NX+i]=3;}for(let j=0;j<NY;j++){g.kind[j*NX]=3;g.kind[j*NX+NX-1]=3;}
 // where each cell is drawn: its centre moved by a fixed random amount (the lattice is not seen in the channels)
 const r=bmbRandom(977);for(let k=0;k<n;k++){g.jx[k]=(r()-.5)*.7;g.jy[k]=(r()-.5)*.7;}return g;}
// red-black successive over-relaxation of Laplace's equation over the gas cells (the others keep their potential)
export function plaSolve(g,sweeps,w=PLA_PHYS.omega){const {NX,NY,phi,kind}=g;
 for(let s=0;s<sweeps*2;s++){const p=s&1;for(let j=1;j<NY-1;j++){let i=1+((j+p)&1),k=j*NX+i;for(;i<NX-1;i+=2,k+=2){if(kind[k])continue;phi[k]+=w*((phi[k-1]+phi[k+1]+phi[k-NX]+phi[k+NX])*.25-phi[k]);}}}}
// the potential of a cell of the channel of tree e: its electrode's minus the drop along the channel, never past zero
const plaChanPhi=(e,s,Es)=>e.sign*Math.max(0,Math.abs(e.V)-Es*s);
// a tree: the electrode (its disc of cells) and the channels grown from it. An electrode: {id, sign, V, cx, cy (cells), r (cells)}
export function plaTree(g,e){const {NX,NY}=g,R=Math.ceil(e.r)+1;e.disc=[];e.cells=[];e.act=[];
 for(let j=Math.max(1,Math.floor(e.cy)-R);j<=Math.min(NY-2,Math.floor(e.cy)+R);j++)for(let i=Math.max(1,Math.floor(e.cx)-R);i<=Math.min(NX-2,Math.floor(e.cx)+R);i++){
  if(Math.hypot(i+.5-e.cx,j+.5-e.cy)>e.r)continue;const k=j*NX+i;if(g.kind[k])continue;g.kind[k]=1;g.own[k]=e.id;g.s[k]=0;g.phi[k]=e.V;e.disc.push(k);}
 if(!e.disc.length){const k=Math.floor(e.cy)*NX+Math.floor(e.cx);g.kind[k]=1;g.own[k]=e.id;g.phi[k]=e.V;e.disc.push(k);}
 e.act=e.disc.slice();return e;}
// the potentials of a tree's cells, after its electrode's voltage changed
export function plaHold(g,e,Es){for(const k of e.disc)g.phi[k]=e.V;for(const k of e.cells)g.phi[k]=plaChanPhi(e,g.s[k],Es);}
// the trees go back to gas (their cells forget them); the electrode stays
export function plaClearTree(g,e){for(const k of e.cells){g.kind[k]=0;g.own[k]=-1;g.par[k]=-1;g.desc[k]=0;g.kids[k]=0;g.seg[k]=-1;g.s[k]=0;}
 for(const k of e.disc)g.kids[k]=0;e.cells=[];e.act=e.disc.slice();}
// the bonds that can grow now, from the trees that are allowed to, with their weights E^η (E above Ec): {n, to, from, tree, cum}
const PLA_POOL={to:new Int32Array(65536),from:new Int32Array(65536),tree:new Int16Array(65536),cum:new Float64Array(65536),n:0};
export function plaPool(g,trees,ph){const P=PLA_POOL,{phi,kind,off,inv}=g,Ec=ph.Ec,eta=ph.eta;let n=0,W=0;
 for(const e of trees){if(!e.grow)continue;const act=e.act,sg=e.sign;let keep=0;
  for(let a=0;a<act.length;a++){const c=act[a],pc=phi[c];let free=0;
   for(let d=0;d<8;d++){const t=c+off[d];if(kind[t])continue;free++;const E=sg*(pc-phi[t])*inv[d];if(E<=Ec||n>=P.to.length)continue;
    W+=eta===1?E:Math.pow(E,eta);P.to[n]=t;P.from[n]=c;P.tree[n]=e.id;P.cum[n]=W;n++;}
   if(free)act[keep++]=c;}
  act.length=keep;}
 P.n=n;P.W=W;return P;}
// one pick from the pool, by its weight
export function plaPick(P,u){let lo=0,hi=P.n-1;const x=u*P.W;while(lo<hi){const m=(lo+hi)>>1;if(P.cum[m]<x)lo=m+1;else hi=m;}return lo;}
// a channel cell grows into t from c (tree e). Returns what t touches: null, or {k (the cell touched), other (its tree id, or −1 for the
// ground)} when t is next to a conductor at a potential more than dV away
export function plaAdd(g,e,c,t,ph,len){g.kind[t]=2;g.own[t]=e.id;g.par[t]=c;g.s[t]=g.s[c]+len;g.phi[t]=plaChanPhi(e,g.s[t],ph.Es);g.kids[c]=Math.min(255,g.kids[c]+1);
 for(let p=c;g.kind[p]===2;p=g.par[p])g.desc[p]++;e.cells.push(t);e.act.push(t);
 const pt=g.phi[t];for(let d=0;d<8;d++){const k=t+g.off[d],kd=g.kind[k];if(!kd)continue;
  if(kd===3){if(Math.abs(pt)>ph.dV)return {k,other:-1};continue;}if(g.own[k]!==e.id&&Math.abs(pt-g.phi[k])>ph.dV)return {k,other:g.own[k]};}
 return null;}
// ── The stimulus ────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function plaNew(o={}){const ph=PLA_PHYS,AR=o.AR||16/9,W=Math.round(AR*ph.Hs),m=ph.margin,rnd=bmbRandom(o.seed||11),lap=o.lap||0,gas=PLA_GASES[lap%PLA_GASES.length];
 const S={kind:'plasma',AR,lap,rnd,t:0,ev:[],role:'buit',k:0,P:o.presses||8,G:plaGrid(W+2*m,ph.Hs+2*m),W,m,E:[],L:[],pend:[],lastArc:-9,pulse:null,Vref:1,cover:0,coverAt:0,out:false,outT:0,
  col:{low:bmbLin(gas.low),high:bmbLin(gas.high),arc:bmbLin(gas.arc),pol:bmbLin(gas.pol)},e0:Math.floor(rnd()*4),post:{spread:.55,bloom:.3,exp:1}};return S;}
// scene ↔ grid
const plaCX=(S,x)=>x*PLA_PHYS.Hs+S.m,plaCY=(S,y)=>y*PLA_PHYS.Hs+S.m;
const plaX=(S,k)=>((k%S.G.NX)-S.m+.5+S.G.jx[k])/PLA_PHYS.Hs,plaY=(S,k)=>(Math.floor(k/S.G.NX)-S.m+.5+S.G.jy[k])/PLA_PHYS.Hs;
// a place for a new electrode: the farthest from the others and from the edges, at most `far` from the nearest one
function plaSpot(S,far=.62){const AR=S.AR,r=S.rnd;let best=null;
 for(let j=0;j<9;j++)for(let i=0;i<16;i++){const x=(.1+.8*(i+.5)/16)*AR,y=.14+.72*(j+.5)/9;let c=9;for(const e of S.E)c=Math.min(c,Math.hypot(x-e.x,y-e.y));
  if(S.E.length&&c>far)continue;const sc=Math.min(c,1.4*Math.min(x,AR-x,y,1-y)+.1)+.05*r();if(!best||sc>best.sc)best={sc,x,y,c};}return best;}
function plaElectrode(S,x,y,sign){const ph=PLA_PHYS,e={id:S.E.length,x,y,cx:plaCX(S,x),cy:plaCY(S,y),r:ph.rE,sign,V:0,Vt:0,a:0,grow:false,offAt:-9,shot:0,frozen:false,born:S.t};
 plaTree(S.G,e);S.E.push(e);S.ev.push({t:S.t,type:'pol',x:x/S.AR});return e;}
// the sign of a new electrode: the opposite of its nearest one
function plaSign(S,x,y){let best=null,bd=9;for(const e of S.E){const d=Math.hypot(x-e.x,y-e.y);if(d<bd){bd=d;best=e;}}return best?-best.sign:1;}
function plaAddElectrodes(S,n){for(let i=0;i<n&&S.E.length<PLA_PHYS.maxE;i++){const f=plaSpot(S);if(!f||f.c<.2)break;plaElectrode(S,f.x,f.y,plaSign(S,f.x,f.y));}}
// a pulse: every electrode charges to ±V for T seconds (Infinity: until the way out)
function plaPulse(S,V,T,at){S.pulse={id:(S.pulse?.id||0)+1,t0:at,t1:at+T,tmax:at+Math.max(T,PLA_PHYS.pulseMax),V};S.Vref=V;}
export function plaPress(S,k,P=S.P){const ph=PLA_PHYS,r=S.rnd,AR=S.AR,role=bmbRole(k,P);S.k=k;S.P=P;S.role=role;
 const pk=Math.max(1,P-2),g=Math.min(1,(k-1)/Math.max(1,pk-1)),V=ph.V[0]+(ph.V[1]-ph.V[0])*g,T=ph.pulse[0]+(ph.pulse[1]-ph.pulse[0])*g;
 if(role==='arriba'||role==='creix'){
  if(!S.E.length){const e=S.e0,u=.35+.3*r(),a=e===0?[.3*AR,u]:e===2?[.7*AR,u]:e===1?[(.3+.4*u)*AR,.32]:[(.3+.4*u)*AR,.68];const e1=plaElectrode(S,a[0],a[1],1);
   const ang=Math.atan2(.5-a[1],AR/2-a[0])+(r()-.5)*.7,d=.42+.08*r();plaElectrode(S,Math.max(.12*AR,Math.min(.88*AR,a[0]+Math.cos(ang)*d)),Math.max(.16,Math.min(.84,a[1]+Math.sin(ang)*d)),-e1.sign);}
  else plaAddElectrodes(S,1);
  plaPulse(S,V,T,S.t+ph.delay);if(role==='creix')S.ev.push({t:S.t,type:'creix'});return;}
 if(role==='ple'){plaAddElectrodes(S,3);plaPulse(S,ph.Vple,Infinity,S.t+ph.delay*.6);S.ev.push({t:S.t,type:'ple'});return;}
 // the way out: the supply is cut
 S.pulse=S.pulse&&{...S.pulse,t1:S.t,tmax:S.t};S.out=true;S.outT=S.t;for(const e of S.E){e.Vt=0;e.grow=false;e.frozen=false;}S.pend.length=0;S.ev.push({t:S.t,type:'surt'});}
// the light of a growing channel, from the cells beyond it (the current it carries)
const plaBright=n=>Math.min(1.5,.22*Math.pow(1+n,.42));
function plaLiveLight(S,L){const e=S.E[L.e],v=Math.min(1.3,Math.abs(e.V)/Math.max(.2,S.Vref));return Math.min(1,(S.t-L.b)/.12)*plaBright(S.G.desc[L.c])*v;}
const plaHalf=(S,n)=>(.1+.075*Math.log2(1+n))/PLA_PHYS.Hs;
// a tree goes dark: each of its pieces keeps the light it had and fades (or, on the arc's path, lights up as the arc)
function plaDark(S,e,arcSet){const g=S.G;for(const k of e.cells){const i=g.seg[k];if(i<0)continue;const L=S.L[i];if(L.st!=='live')continue;
  if(arcSet&&arcSet.has(k)){L.st='arc';L.tA=S.t;L.w=.42/PLA_PHYS.Hs;}else{L.st='die';L.tA=S.t;L.L0=plaLiveLight(S,L);L.w=plaHalf(S,g.desc[k]);L.tau=S.role==='ple'?PLA_PHYS.tauDiePle:PLA_PHYS.tauDie;}}
 plaClearTree(g,e);}
// the path from a channel cell back to its electrode
function plaPath(g,k,set){for(let p=k;p>=0&&g.kind[p]===2;p=g.par[p])set.add(p);}
const plaStill=(S,a)=>{const g=S.G;return g.kind[a.t]===2&&g.own[a.t]===a.e&&(a.other<0?g.kind[a.k]===3:g.kind[a.k]>0&&g.own[a.k]===a.other&&Math.abs(g.phi[a.t]-g.phi[a.k])>PLA_PHYS.dV);};
function plaArc(S,a){const g=S.G,ph=PLA_PHYS,e=S.E[a.e],o=a.other>=0?S.E[a.other]:null,set=new Set();plaPath(g,a.t,set);if(o&&g.kind[a.k]===2)plaPath(g,a.k,set);
 // the piece that bridges the gap
 S.L.push({x0:plaX(S,a.t),y0:plaY(S,a.t),x1:plaX(S,a.k),y1:plaY(S,a.k),e:e.id,c:-1,b:S.t,st:'arc',tA:S.t,L0:0,w:.42/ph.Hs});
 let sx=0,n=0;for(const k of set){sx+=plaX(S,k);n++;}
 plaDark(S,e,set);if(o)plaDark(S,o,set);
 for(const x of o?[e,o]:[e]){x.V*=.15;x.Vt=0;x.grow=false;x.frozen=false;x.offAt=S.t;x.shot=S.pulse?.id??x.shot;}
 S.lastArc=S.t;S.ev.push({t:S.t,type:'arc',x:n?sx/n/S.AR:e.x/S.AR,ground:!o});}
export function plaStep(S,dt){const ph=PLA_PHYS,g=S.G;dt=Math.min(dt,.05);S.t+=dt;const t=S.t,r=S.rnd;
 // the electrodes: they appear, and charge or empty. In a pulse an electrode charges until it has fired once (at most until tmax);
 // after that it charges again, a while after each arc, until t1
 const P=S.pulse;
 for(const e of S.E){e.a=S.out?e.a*Math.exp(-dt/.7):Math.min(1,e.a+dt/ph.appear);
  if(!e.frozen){let on=false;if(P&&!S.out&&t>=P.t0&&e.a>.6)on=e.shot<P.id?t<P.tmax:(t<P.t1-1&&t-e.offAt>ph.recharge)||(Math.abs(e.Vt)>0&&t<P.t1);e.Vt=on?e.sign*P.V:0;}
  const up=Math.abs(e.Vt)>Math.abs(e.V);e.V+=(e.Vt-e.V)*(1-Math.exp(-dt/(up?ph.tauUp:ph.tauDown)));
  e.grow=!S.out&&!e.frozen&&Math.abs(e.Vt)>0&&Math.abs(e.V)>.6*Math.abs(e.Vt);
  // a tree whose electrode has emptied without an arc goes dark
  if(!e.grow&&!e.frozen&&Math.abs(e.V)<.05*S.Vref&&e.cells.length)plaDark(S,e,null);
  plaHold(g,e,ph.Es);}
 // the field
 if(S.E.length)plaSolve(g,Math.max(6,Math.min(24,Math.round(ph.sweepsPerS*dt))),ph.omega);
 // the arcs that wait for the one before to be far enough
 // the arcs that wait for the one before to be far enough: still an arc if both ends are still there (a tree the wait belonged to may
 // have fired with another one meanwhile); the trees waiting are held as they are
 while(S.pend.length&&t-S.lastArc>=ph.gapArc){const a=S.pend.shift();if(plaStill(S,a)){plaArc(S,a);break;}}
 for(const e of S.E)e.frozen=S.pend.some(a=>a.e===e.id||a.other===e.id);
 // the growth: as many new bonds as the field asks for (rate × sum of the weights × dt), picked by their weights
 const pool=plaPool(g,S.E,ph);if(pool.n){let want=ph.rate*pool.W*dt,K=Math.floor(want);if(r()<want-K)K++;K=Math.min(K,ph.maxPick);const used=new Set();
  for(let q=0;q<K;q++){const i=plaPick(pool,r()),tk=pool.to[i],c=pool.from[i],e=S.E[pool.tree[i]];if(used.has(tk)||g.kind[tk]||!e.grow)continue;used.add(tk);
   const d=tk-c,len=(d===1||d===-1||d===g.NX||d===-g.NX)?1:PLA_SQ2,hit=plaAdd(g,e,c,tk,ph,len);
   const i0=g.kind[c]===1?null:g.seg[c],x0=i0==null?e.x+(plaX(S,tk)-e.x)*ph.rE/ph.Hs/Math.max(1e-6,Math.hypot(plaX(S,tk)-e.x,plaY(S,tk)-e.y)):plaX(S,c),y0=i0==null?e.y+(plaY(S,tk)-e.y)*ph.rE/ph.Hs/Math.max(1e-6,Math.hypot(plaX(S,tk)-e.x,plaY(S,tk)-e.y)):plaY(S,c);
   g.seg[tk]=S.L.length;S.L.push({x0,y0,x1:plaX(S,tk),y1:plaY(S,tk),e:e.id,c:tk,b:t,st:'live',tA:0,L0:0,w:0});
   if(hit){const o=hit.other>=0?S.E[hit.other]:null;e.grow=false;e.frozen=true;if(o){o.grow=false;o.frozen=true;}S.pend.push({e:e.id,t:tk,k:hit.k,other:hit.other});
    if(t-S.lastArc>=ph.gapArc&&S.pend.length===1)plaArc(S,S.pend.shift());}}}
 // the light that is gone
 let dead=0;for(const L of S.L){if(L.st==='die'&&t-L.tA>(L.tau||ph.tauDie)*7)L.st='gone';else if(L.st==='arc'&&t-L.tA>ph.rise+ph.tauArc*7)L.st='gone';if(L.st==='gone')dead++;}
 if(dead>200||dead>S.L.length/2){const g2=S.G,keep=[];for(const L of S.L)if(L.st!=='gone'){if(L.st==='live')g2.seg[L.c]=keep.length;keep.push(L);}S.L=keep;}
 if(t-S.coverAt>.25){S.coverAt=t;S.cover=plaCoverNow(S);}
 if(S.ev.length>200)S.ev.splice(0,S.ev.length-200);}
// the light of a piece now
function plaLight(S,L){const ph=PLA_PHYS,t=S.t;if(L.st==='live')return plaLiveLight(S,L);if(L.st==='die')return L.L0*Math.exp(-(t-L.tA)/(L.tau||ph.tauDie));
 if(L.st==='arc'){const u=t-L.tA;return 2.4*(u<ph.rise?Math.pow(u/ph.rise,1.5):Math.exp(-(u-ph.rise)/ph.tauArc));}return 0;}
// how much of the screen is lit: blocks of a 32 × 18 grid with light in them (or next to them)
function plaCoverNow(S){const G=32,H=18,m=new Uint8Array(G*H);let c=0;
 for(const L of S.L){if(L.st==='gone'||plaLight(S,L)<.08)continue;const i=Math.floor(L.x1/S.AR*G),j=Math.floor(L.y1*H);if(i<0||j<0||i>=G||j>=H)continue;if(!m[j*G+i]){m[j*G+i]=1;c++;}}
 return c/(G*H);}
export const plaCover=S=>S.cover;
export const plaEmptyNow=S=>S.out&&S.E.every(e=>e.a<.01&&!e.cells.length)&&S.L.every(L=>L.st==='gone'||plaLight(S,L)<.01);
let PLA_DATA=new Float32Array(4096*20);const PLA_SPR=new Float32Array(1536*20);
export function plaDraw(S){const ph=PLA_PHYS,C=S.col;let n=0;
 if(PLA_DATA.length<S.L.length*20)PLA_DATA=new Float32Array(S.L.length*40);const D=PLA_DATA;
 for(const L of S.L){if(L.st==='gone')continue;const l=plaLight(S,L);if(l<.004)continue;const k=n*20;D[k]=L.x0;D[k+1]=L.y0;D[k+2]=L.x1;D[k+3]=L.y1;
  let w,white,c;if(L.st==='arc'){w=L.w;const h=Math.min(1,l/2);white=.55*h;c=[C.high[0]+(C.arc[0]-C.high[0])*h,C.high[1]+(C.arc[1]-C.high[1])*h,C.high[2]+(C.arc[2]-C.high[2])*h];}else{const desc=L.st==='live'?S.G.desc[L.c]:0;w=L.st==='live'?plaHalf(S,desc):L.w;const h=Math.min(1,l/1.1);white=.08*h;c=[C.low[0]+(C.high[0]-C.low[0])*h,C.low[1]+(C.high[1]-C.low[1])*h,C.low[2]+(C.high[2]-C.low[2])*h];}
  D[k+4]=w;D[k+5]=l;D[k+6]=white;D[k+7]=0;D[k+8]=c[0];D[k+9]=c[1];D[k+10]=c[2];D[k+11]=0;for(let q=12;q<20;q++)D[k+q]=0;n++;}
 for(let o=0;o<n;o+=1536)bmbBodies('plalinia',D.subarray(o*20,(o+Math.min(1536,n-o))*20),Math.min(1536,n-o),{},true,1);
 // the electrodes, with the glow of the voltage on them; the heads of the growing channels
 let m=0;const Sp=PLA_SPR;
 for(const e of S.E){if(e.a<.01||m>=1536)continue;const v=Math.min(1.2,Math.abs(e.V)/Math.max(.2,S.Vref)),k=m*20;Sp.fill(0,k,k+20);Sp[k]=e.x;Sp[k+1]=e.y;Sp[k+2]=ph.rE*1.15/ph.Hs;
  Sp[k+4]=C.pol[0];Sp[k+5]=C.pol[1];Sp[k+6]=C.pol[2];Sp[k+7]=e.a*(.45+.75*v);Sp[k+8]=.5;Sp[k+9]=.25+.5*v;m++;}
 const g=S.G;for(const L of S.L){if(m>=1536)break;if(L.st!=='live'||g.kids[L.c])continue;const l=plaLiveLight(S,L);if(l<.05)continue;const k=m*20;Sp.fill(0,k,k+20);
  Sp[k]=L.x1;Sp[k+1]=L.y1;Sp[k+2]=.4/ph.Hs;Sp[k+4]=C.high[0];Sp[k+5]=C.high[1];Sp[k+6]=C.high[2];Sp[k+7]=Math.min(.7,l*1.4);Sp[k+8]=.25;Sp[k+9]=.3;m++;}
 if(m)bmbBodies('plapol',Sp,m,{},true,4);}

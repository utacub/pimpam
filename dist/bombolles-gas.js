// Bombolles sense pes · the gas solver (0.68): a thin gas that moves faster than its own sound, heated and lit by stars, on the graphics card.
// The physics: the compressible Euler equations of an ideal gas (γ = 5/3), solved by finite volumes: MUSCL–Hancock (slopes of the
// primitive variables limited with the monotonised-central limiter, a half step in time, then fluxes) with the HLLC Riemann solver,
// and the plain HLL one at strong shocks, where HLLC can grow the «carbuncle» (Toro, 2009, chapters 10, 14 and 16). What is conserved
// (mass, momentum, energy) is kept to the rounding of the card: each face flux is worked out the same way by the two cells that share it.
// The light of the stars: the ionising photons of a star reach a point if the recombinations along the straight line from the star do
// not use them all first (the Strömgren condition along each ray, on-the-spot approximation): ∫ α(T) ρ² r dr < Q / 2π in this plane
// (Strömgren, 1939; Spitzer, 1978). Each star is taken alone (where two light the same gas each counts all of its recombinations: the
// ionised zones come out slightly smaller than with the photons shared). Gas reached by the light is ionised (x → 1) and heated to the
// temperature of ionised hydrogen, Ti; away from it the ions recombine at the rate α(T) ρ x (α ∝ T^−0.7). Neutral gas cools to the
// temperature that keeps it at the pressure of the cloud (a cold dense phase and a warm thin one in pressure balance; Field, Goldsmith &
// Habing, 1969); gas heated above Ti by shocks cools by radiation (∝ ρ² Λ(T): fast in dense gas at 10⁵ K, slow in thin gas at 10⁷ K,
// with the shape of the cooling function of Sutherland & Dopita, 1993). Very hot gas is
// ionised by collisions. Boundaries: the box sits inside more of the same cloud, at rest (uEdge 1: outside each side, gas of density
// ρg at pressure pg; gas crosses a side as the Riemann problem between the two says), or open with zero gradient (uEdge 0, the tests).
// Units: one cell = 1, times in seconds, the density of the cloud ≈ 1; the «temperature» T = p / ρ (the square of the isothermal sound
// speed, cells² / s²). Textures RGBA32F: U = (ρ, ρu, ρv, E), X = (ρ · ejecta share, ρ · x, 0, 0).
const GAS_HEAD=`#version 300 es
precision highp float;precision highp int;precision highp sampler2D;
uniform ivec2 uN;uniform float uGam;uniform int uEdge;uniform vec4 uGW;
vec4 at(sampler2D t,ivec2 p){return texelFetch(t,clamp(p,ivec2(0),uN-1),0);}
// outside the box: the still cloud (uEdge 1), given as primitive variables uGW = (ρg, 0, 0, pg)
bool out_(ivec2 p){return uEdge==1&&(p.x<0||p.y<0||p.x>=uN.x||p.y>=uN.y);}
// conserved (ρ, ρu, ρv, E) ↔ primitive (ρ, u, v, p)
vec4 prim(vec4 U){float r=max(U.x,1e-6);vec2 u=U.yz/r;return vec4(r,u,max((uGam-1.)*(U.w-.5*r*dot(u,u)),1e-9));}
vec4 cons(vec4 W){return vec4(W.x,W.x*W.yz,W.w/(uGam-1.)+.5*W.x*dot(W.yz,W.yz));}
`;
const GAS_VS=`#version 300 es
layout(location=0) in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
// 1 · the slopes (monotonised central, of the primitive variables) and the state half a step later; where a face would come out with
// no mass or no pressure, the cell goes first order. The shock sensor: the largest jump of pressure around the cell.
const GAS_FS_PRED=GAS_HEAD+`uniform sampler2D uU;uniform float uDt;
layout(location=0) out vec4 oW;layout(location=1) out vec4 oX;layout(location=2) out vec4 oY;layout(location=3) out vec4 oS;
vec4 mc(vec4 a,vec4 b){return sign(a)*min(min(2.*abs(a),2.*abs(b)),.5*abs(a+b))*step(0.,a*b);}
vec4 nb(ivec2 p){return out_(p)?uGW:prim(at(uU,p));}
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec4 W=prim(at(uU,x)),L=nb(x-ivec2(1,0)),R=nb(x+ivec2(1,0)),D=nb(x-ivec2(0,1)),T=nb(x+ivec2(0,1));
 vec4 sx=mc(W-L,R-W),sy=mc(W-D,T-W);float r=W.x,u=W.y,v=W.z,p=W.w,g=uGam;
 vec4 dW=vec4(u*sx.x+r*sx.y+v*sy.x+r*sy.z,u*sx.y+sx.w/r+v*sy.y,u*sx.z+v*sy.z+sy.w/r,u*sx.w+g*p*sx.y+v*sy.w+g*p*sy.z),Wh=W-.5*uDt*dW;
 vec4 lo=min(Wh-.5*abs(sx),Wh-.5*abs(sy));if(lo.x<=0.||lo.w<=0.){Wh=W;sx=vec4(0.);sy=vec4(0.);}
 float pm=max(max(L.w,R.w),max(D.w,T.w)),pn=min(min(L.w,R.w),min(D.w,T.w));
 oW=Wh;oX=sx;oY=sy;oS=vec4(max(pm,p)/min(pn,p),0.,0.,0.);}`;
// 2 · the fluxes through the four faces (HLLC; HLL where the sensor of either cell sees a strong shock), the update, the tracers carried
// with the mass that crosses each face (taken from the cell it comes from), and then what the light and the cooling do to the gas
const GAS_FS_UPD=GAS_HEAD+`uniform sampler2D uU,uX,uW,uSx,uSy,uS,uI;uniform float uDt,uTi,uP0,uTnMin,uAlpha,uTauH,uTauC,uTmax,uRmin,uShock;
layout(location=0) out vec4 oU;layout(location=1) out vec4 oX;
// the cooling time of gas hotter than Ti, in units of uTauC / ρ, for θ = T / Ti: t ∝ θ / Λ(θ), with the shape of the cooling function
// of ionised gas of solar metals (Sutherland & Dopita, 1993), simplified: Λ rises a hundredfold up to the peak of the lines at 10 Ti
// (10⁵ K), falls some thirtyfold to 1000 Ti (10⁷ K), and rises again as √T (free–free) beyond
float tcool(float th){float l=log(th)/2.302585,L=th<10.?2.*l:th<1000.?2.-.75*(l-1.):.5+.5*(l-3.);return th/pow(10.,max(L,0.));}
vec4 flx(vec4 W){float E=W.w/(uGam-1.)+.5*W.x*(W.y*W.y+W.z*W.z);return vec4(W.x*W.y,W.x*W.y*W.y+W.w,W.x*W.y*W.z,W.y*(E+W.w));}
vec4 cnN(vec4 W){return vec4(W.x,W.x*W.y,W.x*W.z,W.w/(uGam-1.)+.5*W.x*(W.y*W.y+W.z*W.z));}
// l, r: (ρ, normal speed, tangential speed, p)
vec4 riem(vec4 l,vec4 r,bool hll){l.x=max(l.x,1e-6);r.x=max(r.x,1e-6);l.w=max(l.w,1e-9);r.w=max(r.w,1e-9);
 float cl=sqrt(uGam*l.w/l.x),cr=sqrt(uGam*r.w/r.x),sl=min(l.y-cl,r.y-cr),sr=max(l.y+cl,r.y+cr);vec4 Fl=flx(l),Fr=flx(r);
 if(sl>=0.)return Fl;if(sr<=0.)return Fr;vec4 Ul=cnN(l),Ur=cnN(r);if(hll)return (sr*Fl-sl*Fr+sl*sr*(Ur-Ul))/(sr-sl);
 float ss=(r.w-l.w+l.x*l.y*(sl-l.y)-r.x*r.y*(sr-r.y))/(l.x*(sl-l.y)-r.x*(sr-r.y));
 if(ss>=0.){float k=l.x*(sl-l.y)/(sl-ss);return Fl+sl*(k*vec4(1.,ss,l.z,Ul.w/l.x+(ss-l.y)*(ss+l.w/(l.x*(sl-l.y))))-Ul);}
 float k=r.x*(sr-r.y)/(sr-ss);return Fr+sr*(k*vec4(1.,ss,r.z,Ur.w/r.x+(ss-r.y)*(ss+r.w/(r.x*(sr-r.y))))-Ur);}
vec4 fX(vec4 l,vec4 r,bool h){return riem(l,r,h);}
vec4 fY(vec4 l,vec4 r,bool h){vec4 f=riem(l.xzyw,r.xzyw,h);return f.xzyw;}
// the half-step state, slopes and sensor of a cell (outside the box: the still cloud, no slopes)
vec4 hW(ivec2 p){return out_(p)?uGW:at(uW,p);}
vec4 hX(ivec2 p){return out_(p)?vec4(0.):at(uSx,p);}
vec4 hY(ivec2 p){return out_(p)?vec4(0.):at(uSy,p);}
float hS(ivec2 p){return out_(p)?1.:at(uS,p).x;}
// the share of a tracer in the cell the mass comes from (the cloud outside carries none)
vec2 up(float m,ivec2 a,ivec2 b){ivec2 c=m>0.?a:b;if(out_(c))return vec2(0.);float r=max(at(uU,c).x,1e-6);return m*clamp(at(uX,c).xy/r,0.,1.);}
void main(){ivec2 x=ivec2(gl_FragCoord.xy),xl=x-ivec2(1,0),xr=x+ivec2(1,0),yd=x-ivec2(0,1),yu=x+ivec2(0,1);
 vec4 W=at(uW,x),sx=at(uSx,x),sy=at(uSy,x);float s=at(uS,x).x;
 vec4 Fr=fX(W+.5*sx,hW(xr)-.5*hX(xr),max(s,hS(xr))>uShock),Fl=fX(hW(xl)+.5*hX(xl),W-.5*sx,max(s,hS(xl))>uShock);
 vec4 Gu=fY(W+.5*sy,hW(yu)-.5*hY(yu),max(s,hS(yu))>uShock),Gd=fY(hW(yd)+.5*hY(yd),W-.5*sy,max(s,hS(yd))>uShock);
 vec4 U=at(uU,x)-uDt*(Fr-Fl+Gu-Gd);
 vec2 Xn=at(uX,x).xy-uDt*(up(Fr.x,x,xr)-up(Fl.x,xl,x)+up(Gu.x,x,yu)-up(Gd.x,yd,x));
 // a cell that went wrong (never seen in the tests; one bad cell must not spread) becomes thin gas at rest
 if(!(U.x>0.)||!(abs(U.y)+abs(U.z)+abs(U.w)<1e30)){U=cons(vec4(uRmin,0.,0.,uRmin*uTi));Xn=vec2(0.);}
 U.x=max(U.x,uRmin);vec4 P=prim(U);float r=P.x,T=P.w/r,ej=clamp(Xn.x/r,0.,1.),xi=clamp(Xn.y/r,0.,1.);
 // ionisation: by the light (pass 3) or by collisions in very hot gas; recombination where neither keeps it
 float lit=at(uI,x).x,xt=max(lit,smoothstep(1.5,4.,T/uTi));
 if(xt>xi)xi=xt+(xi-xt)*exp(-uDt/.02);else xi=max(xt,xi/(1.+uAlpha*pow(max(T/uTi,1.),-.7)*r*xi*uDt));
 // heating by the light up to Ti, cooling of neutral gas to the pressure of the cloud and of shocked gas back towards Ti; gas in the
 // light and not much hotter than Ti is held at Ti both ways (photoionisation equilibrium: thin gas flowing out of a bubble would
 // otherwise keep the heat that the rounding of a fast flow gives it)
 float Tn=clamp(uP0/r,uTnMin,.3*uTi),Te=mix(Tn,uTi,xi),tau=T<Te||(lit>.5&&T<10.*uTi)?uTauH:uTauC/r*(T>uTi?tcool(T/uTi):1.);
 T=min(Te+(T-Te)*exp(-uDt/tau),uTmax);P.w=r*T;oU=cons(P);oX=vec4(ej*r,xi*r,0.,0.);}`;
// 3 · the light of the stars (uStar: x, y (cells), Q / 2π, on 0–1): the ionised share of each cell (x), and the ionising flux that
// reaches it (y, for the colour of the light)
const GAS_FS_ION=GAS_HEAD+`uniform sampler2D uU;uniform int uNS;uniform vec4 uStar[16];uniform float uAlpha,uTi;out vec4 o;
float rec(vec4 U){vec4 P=prim(U);return uAlpha*pow(max(P.w/P.x/uTi,1.),-.7)*P.x*P.x;}
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec2 c=vec2(x)+.5;float X=0.,F=0.,own=rec(at(uU,x));
 for(int s=0;s<16;s++){if(s>=uNS)break;vec4 st=uStar[s];if(st.w<=0.)continue;float B=st.z*st.w;vec2 d=c-st.xy;float L=length(d);
  if(L<.75){X=1.;F+=B;continue;}vec2 e=d/L;float acc=0.,r=.5;bool ok=true;
  for(int k=0;k<800;k++){if(r>=L-.5)break;acc+=rec(at(uU,ivec2(floor(st.xy+e*r))))*r;if(acc>=B){ok=false;break;}r+=1.;}
  if(!ok)continue;float f=clamp((B-acc)/max(own*L,1e-9),0.,1.);X=max(X,f);F+=(B-acc)/L*f;}
 o=vec4(X,F,0.,0.);}`;
// 4 · energy and mass put into discs (supernovae): uJ = x, y, radius, energy · uK = mass, ejecta share; Gaussian, normalised
const GAS_FS_INJ=GAS_HEAD+`uniform sampler2D uU,uX;uniform int uNJ;uniform vec4 uJ[4],uK[4];layout(location=0) out vec4 oU;layout(location=1) out vec4 oX;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec2 c=vec2(x)+.5;vec4 U=at(uU,x),X=at(uX,x);
 for(int i=0;i<4;i++){if(i>=uNJ)break;vec4 J=uJ[i];float w=exp(-dot(c-J.xy,c-J.xy)/(J.z*J.z))/(3.14159265*J.z*J.z);U.x+=uK[i].x*w;U.w+=J.w*w;X.x+=uK[i].x*uK[i].y*w;X.y+=uK[i].x*w;}
 oU=U;oX=X;}`;
// 5 · a small picture (bw × bh cells per texel): the largest signal speed |u| + |v| + 2c, the mean light (x ρ)² α(T)/α plus the
// X-rays of hot gas uKX ρ² √θ (as the nebula draws them), the largest
// ionised share, the mean density
const GAS_FS_DOWN=GAS_HEAD+`uniform sampler2D uU,uX;uniform ivec2 uB;uniform float uTi,uKX;out vec4 o;
void main(){ivec2 b=ivec2(gl_FragCoord.xy)*uB;float sm=0.,e=0.,xm=0.,rm=0.,n=0.;
 for(int j=0;j<16;j++){if(j>=uB.y)break;for(int i=0;i<16;i++){if(i>=uB.x)break;ivec2 p=b+ivec2(i,j);if(p.x>=uN.x||p.y>=uN.y)continue;
  vec4 P=prim(texelFetch(uU,p,0));float c=sqrt(uGam*P.w/P.x),xi=clamp(texelFetch(uX,p,0).y/P.x,0.,1.);
  sm=max(sm,abs(P.y)+abs(P.z)+2.*c);float th=P.w/P.x/uTi;e+=xi*xi*P.x*P.x*pow(max(th,1.),-.7)+uKX*P.x*P.x*sqrt(max(th,0.))*smoothstep(3.,10.,th);xm=max(xm,xi);rm+=P.x;n+=1.;}}
 o=vec4(sm,e/max(n,1.),xm,rm/max(n,1.));}`;
const GAS_PROG=new WeakMap();
function gasCompile(gl){let P=GAS_PROG.get(gl);if(P)return P;P={};const mk=(fs,name)=>{const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;};const v=sh(gl.VERTEX_SHADER,GAS_VS),f=sh(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);return {p,v,f,name,U:{},ok:null};};
 P.pred=mk(GAS_FS_PRED,'gas-predict');P.upd=mk(GAS_FS_UPD,'gas-update');P.ion=mk(GAS_FS_ION,'gas-light');P.inj=mk(GAS_FS_INJ,'gas-inject');P.down=mk(GAS_FS_DOWN,'gas-down');
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
 P.vao=vao;GAS_PROG.set(gl,P);return P;}
// the programs, for a loading cover (compiled together, KHR_parallel_shader_compile)
export function gasProgramsList(gl){const P=gasCompile(gl);return ['pred','upd','ion','inj','down'].map(k=>P[k]);}
function gasOk(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('gas shader',o.name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}return o.ok;}
function gasSet(gl,o,u){for(const n in u){const v=u[n];let l=o.U[n];if(l===undefined)l=o.U[n]=gl.getUniformLocation(o.p,n);if(l===null)continue;
  if(v&&v.tex!==undefined){gl.activeTexture(gl.TEXTURE0+v.unit);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform1i(l,v.unit);}
  else if(v&&v.i!==undefined){if(Array.isArray(v.i))gl['uniform'+v.i.length+'i'](l,...v.i);else gl.uniform1i(l,v.i);}
  else if(v&&v.arr){gl['uniform'+v.size+'fv'](l,v.arr);}
  else if(typeof v==='number')gl.uniform1f(l,v);else gl['uniform'+v.length+'fv'](l,v);}}
function gasTex(gl,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA32F,w,h);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);return t;}
function gasFbo(gl,texs){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);texs.forEach((t,i)=>gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0+i,gl.TEXTURE_2D,t,0));gl.drawBuffers(texs.map((_,i)=>gl.COLOR_ATTACHMENT0+i));return f;}
// A box of W × H cells. o: gam, Ti, p0 (the pressure of the cloud), alpha (recombination), tauH, tauC (heating, cooling times, s),
// Tmax, edge (1: the still cloud outside, ghost = [ρg, pg]; 0: open), rho (Float32Array W·H: the starting density; the gas starts at rest at pressure p0) or U (Float32Array W·H·4: the starting
// conserved state, for the tests). One live box per slot (o.slot).
const GAS_SLOTS=new Map();
export function gasCreate(gl,o={}){if(o.slot){const old=GAS_SLOTS.get(o.slot);if(old&&!old.dead)gasDestroy(old);}const P=gasCompile(gl),W=o.W|0,H=o.H|0,T=()=>gasTex(gl,W,H);
 const G={gl,P,W,H,steps:0,t:0,par:{gam:o.gam??5/3,Ti:o.Ti??70,p0:o.p0??.7,alpha:o.alpha??3,tauH:o.tauH??.02,tauC:o.tauC??.15,Tmax:o.Tmax??1e7,TnMin:o.TnMin??.01,rmin:o.rmin??1e-4,shock:o.shock??5,kX:o.kX??0},edge:o.edge??1,ghost:o.ghost||[1,o.p0??.7]};
 G.U=[T(),T()];G.X=[T(),T()];G.cur=0;G.f=[0,1].map(i=>gasFbo(gl,[G.U[i],G.X[i]]));G.Wp=[T(),T(),T(),T()];G.fW=gasFbo(gl,G.Wp);G.I=T();G.fI=gasFbo(gl,[G.I]);
 let d=o.U;if(!d){d=new Float32Array(W*H*4);const e=G.par.p0/(G.par.gam-1);for(let i=0;i<W*H;i++){d[i*4]=o.rho?o.rho[i]:1;d[i*4+3]=e;}}
 gl.bindTexture(gl.TEXTURE_2D,G.U[0]);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,W,H,gl.RGBA,gl.FLOAT,d);
 for(const f of [...G.f,G.fW,G.fI]){gl.bindFramebuffer(gl.FRAMEBUFFER,f);const n=f===G.fW?4:f===G.fI?1:2;for(let i=0;i<n;i++)if(!(f===G.f[0]&&i===0))gl.clearBufferfv(gl.COLOR,i,[0,0,0,0]);}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);if(o.slot)GAS_SLOTS.set(o.slot,G);return G;}
export function gasDestroy(G){if(!G||G.dead)return;G.dead=true;const gl=G.gl;[...G.U,...G.X,...G.Wp,G.I].forEach(t=>gl.deleteTexture(t));[...G.f,G.fW,G.fI].forEach(f=>gl.deleteFramebuffer(f));
 if(G.down){gl.deleteTexture(G.down.t);gl.deleteFramebuffer(G.down.f);gl.deleteBuffer(G.down.pbo);if(G.down.sync)gl.deleteSync(G.down.sync);}}
export const gasU=G=>G.U[G.cur],gasX=G=>G.X[G.cur],gasLight=G=>G.I;
const gbase=G=>({uN:{i:[G.W,G.H]},uGam:G.par.gam,uEdge:{i:G.edge},uGW:[G.ghost[0],0,0,G.ghost[1]]});
function gdraw(gl,G,f,w=G.W,h=G.H){gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.viewport(0,0,w,h);gl.drawArrays(gl.TRIANGLES,0,3);}
// one step of dt seconds (keep dt (|u| + |v| + 2c)max under ½: gasMaxDt)
export function gasStep(G,dt){const gl=G.gl,P=G.P,p=G.par;if(!gasOk(gl,P.pred)||!gasOk(gl,P.upd))return false;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);const a=G.cur,b=1-a;
 gl.useProgram(P.pred.p);gasSet(gl,P.pred,{...gbase(G),uU:{tex:G.U[a],unit:0},uDt:dt});gdraw(gl,G,G.fW);
 gl.useProgram(P.upd.p);gasSet(gl,P.upd,{...gbase(G),uU:{tex:G.U[a],unit:0},uX:{tex:G.X[a],unit:1},uW:{tex:G.Wp[0],unit:2},uSx:{tex:G.Wp[1],unit:3},uSy:{tex:G.Wp[2],unit:4},uS:{tex:G.Wp[3],unit:5},uI:{tex:G.I,unit:6},
  uDt:dt,uTi:p.Ti,uP0:p.p0,uTnMin:p.TnMin,uAlpha:p.alpha,uTauH:p.tauH,uTauC:p.tauC,uTmax:p.Tmax,uRmin:p.rmin,uShock:p.shock});gdraw(gl,G,G.f[b]);
 G.cur=b;G.steps++;G.t+=dt;gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
// the light of the stars [{x, y (cells), B (= Q / 2π: recombinations a radian of the plane can pay for), on (0–1)}], up to 16
const GAS_STAR=new Float32Array(64);
export function gasLightUp(G,stars){const gl=G.gl,P=G.P;if(!gasOk(gl,P.ion))return false;GAS_STAR.fill(0);const n=Math.min(16,stars.length);for(let i=0;i<n;i++){const s=stars[i];GAS_STAR.set([s.x,s.y,s.B,s.on],i*4);}
 gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);gl.useProgram(P.ion.p);gasSet(gl,P.ion,{...gbase(G),uU:{tex:G.U[G.cur],unit:0},uNS:{i:n},uStar:{arr:GAS_STAR,size:4},uAlpha:G.par.alpha,uTi:G.par.Ti});gdraw(gl,G,G.fI);
 gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
// energy E and mass M (a share ej of it ejecta) put into discs of radius r around (x, y): [{x, y, r, E, M, ej}], up to 4
export function gasInject(G,list){const gl=G.gl,P=G.P;if(!list.length||!gasOk(gl,P.inj))return false;const J=new Float32Array(16),K=new Float32Array(16),n=Math.min(4,list.length);
 for(let i=0;i<n;i++){const j=list[i];J.set([j.x,j.y,j.r,j.E],i*4);K.set([j.M||0,j.ej??1,0,0],i*4);}
 gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);gl.useProgram(P.inj.p);gasSet(gl,P.inj,{...gbase(G),uU:{tex:G.U[G.cur],unit:0},uX:{tex:G.X[G.cur],unit:1},uNJ:{i:n},uJ:{arr:J,size:4},uK:{arr:K,size:4}});
 gdraw(gl,G,G.f[1-G.cur]);G.cur=1-G.cur;gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
// the small picture, read without stalling the card (as lbmDownAsk / lbmDownGet): ask now, get it a frame or more later
export function gasDownAsk(G,bw=8,bh=8){const gl=G.gl,P=G.P;if(!gasOk(gl,P.down))return false;const w=Math.ceil(G.W/bw),h=Math.ceil(G.H/bh);
 if(!G.down){const t=gasTex(gl,w,h);G.down={w,h,bw,bh,t,f:gasFbo(gl,[t]),pbo:gl.createBuffer(),sync:null,data:new Float32Array(w*h*4)};gl.bindBuffer(gl.PIXEL_PACK_BUFFER,G.down.pbo);gl.bufferData(gl.PIXEL_PACK_BUFFER,w*h*16,gl.STREAM_READ);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);}
 const D=G.down;if(D.sync)return false;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);gl.useProgram(P.down.p);gasSet(gl,P.down,{...gbase(G),uU:{tex:G.U[G.cur],unit:0},uX:{tex:G.X[G.cur],unit:1},uB:{i:[D.bw,D.bh]},uTi:G.par.Ti,uKX:G.par.kX});
 gdraw(gl,G,D.f,D.w,D.h);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,D.pbo);gl.readPixels(0,0,D.w,D.h,gl.RGBA,gl.FLOAT,0);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
 D.sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
export function gasDownGet(G){const gl=G.gl,D=G.down;if(!D||!D.sync)return null;if(gl.clientWaitSync(D.sync,0,0)===gl.TIMEOUT_EXPIRED)return null;gl.deleteSync(D.sync);D.sync=null;
 gl.bindBuffer(gl.PIXEL_PACK_BUFFER,D.pbo);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,D.data);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);return {w:D.w,h:D.h,bw:D.bw,bh:D.bh,data:D.data};}
// reads (synchronously) U, X or the light: for the tests and the review tools
export function gasRead(G,which='U'){const gl=G.gl,out=new Float32Array(G.W*G.H*4),t=which==='U'?G.U[G.cur]:which==='X'?G.X[G.cur]:G.I,f=gl.createFramebuffer();
 gl.bindFramebuffer(gl.FRAMEBUFFER,f);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);gl.readPixels(0,0,G.W,G.H,gl.RGBA,gl.FLOAT,out);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.deleteFramebuffer(f);return out;}
// the longest stable step for a largest signal speed (|u| + |v| + 2c) smax
export const gasMaxDt=(smax,cfl=.45)=>cfl/Math.max(smax,1e-6);

// Bombolles sense pes · the liquid solver (0.64): two immiscible fluids, or one, on the graphics card.
// The physics: the incompressible Navier–Stokes equations with surface tension, solved with the lattice Boltzmann method (D2Q9) in
// the velocity-based, conservative phase-field form of Fakhari, Mitchell, Leonardi and Bolster (2017, Physical Review E 96, 053301).
// Two sets of nine populations per cell: g carries the pressure and the velocity, h carries the phase φ (0 = the light fluid, 1 = the
// heavy one), which moves with the flow by the conservative Allen–Cahn equation, so the amount of each fluid is kept. Forces on the
// fluid: surface tension μφ∇φ (with the chemical potential μφ = 4βφ(φ−1)(φ−½) − κ∇²φ, β = 12σ/ξ, κ = 3σξ/2), the pressure term
// −p*cs²∇ρ of the velocity-based form, the viscous term of two viscosities, a body force ρa and any extra force field (magnetic…).
// Lattice units: one cell = 1, one step = 1, cs² = 1/3. ν = τ/3 (each fluid its τ); the mobility of the phase is M = τφ/3.
// Shapes, speeds and times of the matter are not drawn here: they come out of these equations. The stimuli only add or take matter,
// momentum or force (lbmPaint), as a nozzle, a puff or a magnet would.
// Boundaries: each side of the box is open to a still room of the light fluid at pressure 0 (what reaches a side leaves through it),
// or periodic (the tests), or a solid wall (o.wall bits: 1 left, 2 right, 4 bottom, 8 top; bounce-back: the lava lamp). Textures: RGBA32F (EXT_color_buffer_float), read with texelFetch only.
const LBM_HEAD=`#version 300 es
precision highp float;precision highp int;precision highp sampler2D;
const ivec2 E[9]=ivec2[9](ivec2(0,0),ivec2(1,0),ivec2(0,1),ivec2(-1,0),ivec2(0,-1),ivec2(1,1),ivec2(-1,1),ivec2(-1,-1),ivec2(1,-1));
const float Wt[9]=float[9](4./9.,1./9.,1./9.,1./9.,1./9.,1./36.,1./36.,1./36.,1./36.);
uniform ivec2 uN;uniform int uPer,uWall;uniform vec4 uSide;
const int OPP[9]=int[9](0,3,4,1,2,7,8,5,6);
// a solid wall on that side (bits: 1 left, 2 right, 4 bottom, 8 top): what goes out comes back (bounce-back)
bool wallAt(ivec2 p){return (p.x<0&&(uWall&1)!=0)||(p.x>=uN.x&&(uWall&2)!=0)||(p.y<0&&(uWall&4)!=0)||(p.y>=uN.y&&(uWall&8)!=0);}
// the cell p, wrapped if the box is periodic that way; false when it is outside the box
bool inBox(inout ivec2 p){if((uPer&1)!=0)p.x=(p.x+uN.x)%uN.x;if((uPer&2)!=0)p.y=(p.y+uN.y)%uN.y;return p.x>=0&&p.y>=0&&p.x<uN.x&&p.y<uN.y;}
float gam(int a,vec2 u){float eu=dot(vec2(E[a]),u);return Wt[a]*(1.+3.*eu+4.5*eu*eu-1.5*dot(u,u));}
float pop(sampler2D t0,sampler2D t1,sampler2D t2,int a,ivec2 p){if(a<4)return texelFetch(t0,p,0)[a];if(a<8)return texelFetch(t1,p,0)[a-4];return texelFetch(t2,p,0).x;}
`;
const LBM_VS=`#version 300 es
layout(location=0) in vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
// 1 · the phase after streaming: φ = Σ h(x − e)
const LBM_FS_PHI=LBM_HEAD+`uniform sampler2D uH0,uH1,uH2;out vec4 o;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);float s=0.;for(int a=0;a<9;a++){ivec2 p=x-E[a];if(inBox(p))s+=pop(uH0,uH1,uH2,a,p);else if(wallAt(p))s+=pop(uH0,uH1,uH2,OPP[a],x);}o=vec4(s,0.,0.,0.);}`;
// the gradient (isotropic stencil) and the Laplacian of φ around x; outside the box φ = 0
const LBM_GRAD=`uniform sampler2D uPhi;
float phiAt(ivec2 p){if(inBox(p))return texelFetch(uPhi,p,0).x;return wallAt(p)?texelFetch(uPhi,clamp(p,ivec2(0),uN-1),0).x:0.;}
void gradLap(ivec2 x,float phi,out vec2 gp,out float lap){gp=vec2(0.);lap=0.;for(int a=1;a<9;a++){float q=phiAt(x+E[a]);gp+=Wt[a]*vec2(E[a])*q;lap+=Wt[a]*(q-phi);}gp*=3.;lap*=6.;}
`;
// 2 · pressure and velocity: stream g, forces, collide. Out: g (three textures) and U = (ux, uy, p*, φ)
const LBM_FS_G=LBM_HEAD+LBM_GRAD+`uniform sampler2D uG0,uG1,uG2,uU,uF,uTemp;uniform float uRhoL,uRhoH,uTauL,uTauH,uSig,uXi,uHasF,uHasT,uGrav;uniform vec2 uAcc,uBeta,uDarcy;uniform float uRough;
// the gap between the plates is not quite even (glass is never flat): a frozen random field, smooth over some cells
float hsh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float rough(vec2 x){x/=7.;vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hsh(i),hsh(i+vec2(1.,0.)),f.x),mix(hsh(i+vec2(0.,1.)),hsh(i+1.),f.x),f.y)*2.-1.;}
layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;layout(location=2) out vec4 o2;layout(location=3) out vec4 o3;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec2 ub=texelFetch(uU,x,0).xy;float g[9];
 for(int a=0;a<9;a++){ivec2 p=x-E[a];if(inBox(p))g[a]=pop(uG0,uG1,uG2,a,p);else if(wallAt(p))g[a]=pop(uG0,uG1,uG2,OPP[a],x);else{
  // from outside: the light fluid at rest and at pressure 0, a big still room (or the air a side blows in, uSide). (Taking the speed of
  // the cell at the side instead fed back on itself and blew up where a nozzle sucked in.)
  vec2 v=vec2(0.);if(p.x<0&&uSide.x!=0.)v=vec2(uSide.x,0.);if(p.x>=uN.x&&uSide.y!=0.)v=vec2(-uSide.y,0.);if(p.y<0&&uSide.z!=0.)v=vec2(0.,uSide.z);if(p.y>=uN.y&&uSide.w!=0.)v=vec2(0.,-uSide.w);
  g[a]=gam(a,v)-Wt[a];}}
 float phi=texelFetch(uPhi,x,0).x;vec2 gp;float lap;gradLap(x,phi,gp,lap);
 float rho=uRhoL+phi*(uRhoH-uRhoL);vec2 grho=(uRhoH-uRhoL)*gp;float beta=12.*uSig/uXi,kap=1.5*uSig*uXi;
 float mu=4.*beta*phi*(phi-1.)*(phi-.5)-kap*lap;
 float ps=0.;vec2 u0=vec2(0.);for(int a=0;a<9;a++){ps+=g[a];u0+=g[a]*vec2(E[a]);}
 float tau=uTauL+phi*(uTauH-uTauL);
 // the viscous term where the density changes, from the non-equilibrium stress (local, as the BGK form allows)
 mat2 Pi=mat2(0.);for(int a=0;a<9;a++){vec2 e=vec2(E[a]);float geq=ps*Wt[a]+gam(a,u0)-Wt[a];Pi+=(g[a]-geq)*outerProduct(e,e);}
 vec2 F=mu*gp-ps*(1./3.)*grho-tau*(Pi*grho)+rho*uAcc;if(uHasF>0.)F+=texelFetch(uF,x,0).xy;
 // weight (the lava lamp): gravity uGrav downwards on the difference from the light fluid, and the expansion of each fluid when hot
 if(uHasT>0.){float T=texelFetch(uTemp,x,0).x;F.y+=-uGrav*(rho-uRhoL)+uGrav*rho*(uBeta.x*phi+uBeta.y*(1.-phi))*T;}
 // the drag of two close plates (a Hele-Shaw cell: Darcy, −ρ α u with α = 12ν/b² for each fluid), taken implicitly in u
 float al=(uDarcy.x*(1.-phi)+uDarcy.y*phi)*(uRough>0.?1.+uRough*rough(vec2(x)):1.);vec2 u=(u0+F/(2.*rho))/(1.+.5*al);F-=rho*al*u;float om=1./(tau+.5);float go[9];
 for(int a=0;a<9;a++){float Fa=3.*Wt[a]*dot(vec2(E[a]),F)/rho;float geq=ps*Wt[a]+gam(a,u)-Wt[a]-.5*Fa;go[a]=g[a]-om*(g[a]-geq)+Fa;}
 o0=vec4(go[0],go[1],go[2],go[3]);o1=vec4(go[4],go[5],go[6],go[7]);o2=vec4(go[8],mu,0.,0.);o3=vec4(u,ps,phi);}`;
// 3 · the phase: stream h, collide towards φΓ(u) with the term that keeps the interface sharp (conservative Allen–Cahn)
const LBM_FS_H=LBM_HEAD+LBM_GRAD+`uniform sampler2D uH0,uH1,uH2,uU,uUo;uniform float uTauPhi,uXi;
layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;layout(location=2) out vec4 o2;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);float h[9];float phi=0.;for(int a=0;a<9;a++){ivec2 p=x-E[a];h[a]=inBox(p)?pop(uH0,uH1,uH2,a,p):wallAt(p)?pop(uH0,uH1,uH2,OPP[a],x):0.;phi+=h[a];}
 vec2 gp;float lap;gradLap(x,texelFetch(uPhi,x,0).x,gp,lap);// the normal, faded out where φ hardly changes (inside a fluid a tiny ripple of φ would otherwise be «sharpened» into a speck)
 float l=length(gp);vec2 n=gp/max(l,.1/uXi);
 vec2 u=texelFetch(uU,x,0).xy;float om=1./(uTauPhi+.5),k=4.*phi*(1.-phi)/uXi;float ho[9];
 // the lattice fluid is slightly compressible (∂p*/∂t = −∇·u): where it swells, the phase would be thinned as if the liquid had
 // become less of itself. The liquids are incompressible, so the phase is carried as it is: + φ ∇·u (∇·u from the change of p*)
 float dv=texelFetch(uUo,x,0).z-texelFetch(uU,x,0).z;
 for(int a=0;a<9;a++){float Fa=k*Wt[a]*dot(vec2(E[a]),n);float heq=phi*gam(a,u)-.5*Fa;ho[a]=h[a]-om*(h[a]-heq)+Fa+Wt[a]*phi*dv;}
 o0=vec4(ho[0],ho[1],ho[2],ho[3]);o1=vec4(ho[4],ho[5],ho[6],ho[7]);o2=vec4(ho[8],0.,0.,0.);}`;
// what a stimulus does to the matter: up to 8 soft shapes (ellipses in cells) that bring the phase towards a value and/or the
// velocity towards a value (a nozzle that pours, a puff, a stirring paddle). Shape i: uA[i] = (cx, cy, rx, ry),
// uB[i] = (angle, φ target or −1 to keep it, ux, uy), uC[i] = (strength 0–1 per step, edge softness in cells, velocity: 0 keep, 1 set, 2 add,
// pressure p* target or 0 to keep it: a hole that pushes liquid in or draws it out)
const LBM_SHAPES=`uniform int uNS;uniform vec4 uA[8],uB[8],uC[8];
float shapeM(int i,vec2 x){vec4 A=uA[i],B=uB[i],C=uC[i];vec2 d=x-A.xy;float c=cos(B.x),s=sin(B.x);d=vec2(c*d.x+s*d.y,-s*d.x+c*d.y);
 float r=length(d/A.zw),edge=max(C.y,.5)/min(A.z,A.w);return C.x*clamp((1.-r)/edge+.5,0.,1.);}
void shapes(vec2 x,inout float phi,inout vec2 u){for(int i=0;i<8;i++){if(i>=uNS)break;vec4 A=uA[i],B=uB[i],C=uC[i];vec2 d=x-A.xy;float c=cos(B.x),s=sin(B.x);d=vec2(c*d.x+s*d.y,-s*d.x+c*d.y);
  float r=length(d/A.zw),edge=max(C.y,.5)/min(A.z,A.w),m=C.x*clamp((1.-r)/edge+.5,0.,1.);if(m<=0.)continue;
  if(B.y>=0.)phi=mix(phi,B.y,m);if(C.z==1.)u=mix(u,B.zw,m);else if(C.z==2.)u+=B.zw*m;}}
`;
const LBM_FS_PAINT_G=LBM_HEAD+LBM_SHAPES+`uniform sampler2D uG0,uG1,uG2,uU;
layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;layout(location=2) out vec4 o2;layout(location=3) out vec4 o3;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec4 a=texelFetch(uG0,x,0),b=texelFetch(uG1,x,0),c=texelFetch(uG2,x,0),U=texelFetch(uU,x,0);
 float g[9]=float[9](a.x,a.y,a.z,a.w,b.x,b.y,b.z,b.w,c.x);float phi=U.w;vec2 u=U.xy,u1=u;shapes(vec2(x)+.5,phi,u1);
 if(u1!=u){for(int i=0;i<9;i++)g[i]+=gam(i,u1)-gam(i,u);}
 // pressure: g_eq grows by Wt·Δp*
 float p0=U.z,p1=p0;for(int i=0;i<8;i++){if(i>=uNS)break;if(uC[i].w==0.)continue;float m=shapeM(i,vec2(x)+.5);if(m>0.)p1=mix(p1,uC[i].w,m);}
 if(p1!=p0){for(int i=0;i<9;i++)g[i]+=Wt[i]*(p1-p0);}
 o0=vec4(g[0],g[1],g[2],g[3]);o1=vec4(g[4],g[5],g[6],g[7]);o2=vec4(g[8],c.yzw);o3=vec4(u1,p1,phi);}`;
const LBM_FS_PAINT_H=LBM_HEAD+LBM_SHAPES+`uniform sampler2D uH0,uH1,uH2,uU;
layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;layout(location=2) out vec4 o2;
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec4 a=texelFetch(uH0,x,0),b=texelFetch(uH1,x,0),c=texelFetch(uH2,x,0),U=texelFetch(uU,x,0);
 float h[9]=float[9](a.x,a.y,a.z,a.w,b.x,b.y,b.z,b.w,c.x);float phi=0.;for(int i=0;i<9;i++)phi+=h[i];float p1=phi;vec2 u=U.xy,u1=u;shapes(vec2(x)+.5,p1,u1);
 if(p1!=phi||u1!=u){for(int i=0;i<9;i++)h[i]+=p1*gam(i,u1)-phi*gam(i,u);}
 o0=vec4(h[0],h[1],h[2],h[3]);o1=vec4(h[4],h[5],h[6],h[7]);o2=vec4(h[8],0.,0.,0.);}`;
// dyes (up to four, RGBA16F, any size): carried by the flow (semi-Lagrangian, bilinear in U), fading by uFade per call, and painted
const LBM_FS_DYE=LBM_HEAD+LBM_SHAPES+`uniform sampler2D uD,uU;uniform vec2 uDN;uniform float uDt,uFade;uniform vec4 uDyeC[8];
vec2 vel(vec2 q){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec2 r=vec2(0.);for(int k=0;k<4;k++){ivec2 o=ivec2(k&1,k>>1),p=i+o;p=clamp(p,ivec2(0),uN-1);r+=texelFetch(uU,p,0).xy*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
out vec4 o;void main(){vec2 x=gl_FragCoord.xy,s=vec2(uN)/uDN,c=x*s;vec2 u=vel(c);vec2 b=(c-uDt*u)/s;
 vec4 d=texture(uD,b/uDN);d*=uFade;
 for(int i=0;i<8;i++){if(i>=uNS)break;vec4 A=uA[i],B=uB[i],C=uC[i];vec2 q=c-A.xy;float cs=cos(B.x),sn=sin(B.x);q=vec2(cs*q.x+sn*q.y,-sn*q.x+cs*q.y);
  float r=length(q/A.zw),edge=max(C.y,.5)/min(A.z,A.w),m=C.x*clamp((1.-r)/edge+.5,0.,1.);if(m>0.)d=mix(d,uDyeC[i],m*uDyeC[i].a>0.?m:0.);}
 o=d;}`;
// a small copy of U for the stimuli (coverage, how much liquid is where): each texel the mean of a block
const LBM_FS_DOWN=LBM_HEAD+`uniform sampler2D uU;uniform ivec2 uB;out vec4 o;
void main(){ivec2 x=ivec2(gl_FragCoord.xy)*uB;vec4 s=vec4(0.);for(int j=0;j<16;j++){if(j>=uB.y)break;for(int i=0;i<16;i++){if(i>=uB.x)break;ivec2 p=min(x+ivec2(i,j),uN-1);vec4 U=texelFetch(uU,p,0);s+=vec4(U.w,length(U.xy),U.z,U.w>.5?1.:0.);}}o=s/float(uB.x*uB.y);}`;
// the thickness of the liquid seen from the front, for the light (not for the motion): the 2D section is «inflated» by solving
// ∇²q = −4 inside the liquid with q = 0 outside, so a round drop of radius R gets q = R² − r² and the half-thickness √q of a sphere.
// q is carried by the flow between frames and relaxed a few Jacobi sweeps each frame.
const LBM_FS_INF_ADV=LBM_HEAD+`uniform sampler2D uQ,uU;uniform float uDt;out vec4 o;
vec4 bil(sampler2D t,vec2 q){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));vec4 r=vec4(0.);for(int k=0;k<4;k++){ivec2 d=ivec2(k&1,k>>1),p=clamp(i+d,ivec2(0),uN-1);r+=texelFetch(t,p,0)*((k&1)==1?f.x:1.-f.x)*((k>>1)==1?f.y:1.-f.y);}return r;}
void main(){vec2 x=gl_FragCoord.xy;vec2 u=texelFetch(uU,ivec2(x),0).xy;o=vec4(bil(uQ,x-uDt*u).x,0.,0.,0.);}`;
const LBM_FS_INF_JAC=LBM_HEAD+`uniform sampler2D uQ,uU;out vec4 o;
float q(ivec2 p){return (p.x<0||p.y<0||p.x>=uN.x||p.y>=uN.y)?0.:texelFetch(uQ,p,0).x;}
void main(){ivec2 x=ivec2(gl_FragCoord.xy);float m=smoothstep(.3,.7,texelFetch(uU,x,0).w);
 o=vec4(m*(.25*(q(x+ivec2(1,0))+q(x-ivec2(1,0))+q(x+ivec2(0,1))+q(x-ivec2(0,1)))+1.),0.,0.,0.);}`;
const LBM_FS_TEMP=LBM_HEAD+LBM_SHAPES+`uniform sampler2D uT,uU;uniform float uDt,uKap,uCool;uniform vec4 uTop;out vec4 o;
float tAt(ivec2 p){p=clamp(p,ivec2(0),uN-1);return texelFetch(uT,p,0).x;}
float bilT(vec2 q){q=q-.5;vec2 f=fract(q);ivec2 i=ivec2(floor(q));return mix(mix(tAt(i),tAt(i+ivec2(1,0)),f.x),mix(tAt(i+ivec2(0,1)),tAt(i+ivec2(1,1)),f.x),f.y);}
void main(){ivec2 x=ivec2(gl_FragCoord.xy);vec2 u=texelFetch(uU,x,0).xy;float T=bilT(gl_FragCoord.xy-uDt*u);
 float l=tAt(x+ivec2(1,0))+tAt(x-ivec2(1,0))+tAt(x+ivec2(0,1))+tAt(x-ivec2(0,1))-4.*tAt(x);T+=min(uKap*uDt,.24)*l;
 // losing heat: everywhere a little (the glass), more in the band at the top (uTop: from y, to y, rate)
 float c=uCool+uTop.z*smoothstep(uTop.x,uTop.y,gl_FragCoord.y);T*=exp(-c*uDt);
 vec2 dummy=vec2(0.);shapes(gl_FragCoord.xy,T,dummy);o=vec4(T,0.,0.,0.);}`;
const LBM_PROG=new WeakMap();
function lbmCompile(gl){let P=LBM_PROG.get(gl);if(P)return P;P={};const mk=(fs,name)=>{const sh=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;};const v=sh(gl.VERTEX_SHADER,LBM_VS),f=sh(gl.FRAGMENT_SHADER,fs),p=gl.createProgram();
  gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);return {p,v,f,name,U:{},ok:null};};
 P.phi=mk(LBM_FS_PHI,'phi');P.g=mk(LBM_FS_G,'g');P.h=mk(LBM_FS_H,'h');P.pg=mk(LBM_FS_PAINT_G,'paint-g');P.ph=mk(LBM_FS_PAINT_H,'paint-h');P.dye=mk(LBM_FS_DYE,'dye');P.down=mk(LBM_FS_DOWN,'down');P.iadv=mk(LBM_FS_INF_ADV,'inflate-advect');P.temp=mk(LBM_FS_TEMP,'temperature');P.ijac=mk(LBM_FS_INF_JAC,'inflate-jacobi');
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindVertexArray(null);
 P.vao=vao;LBM_PROG.set(gl,P);return P;}
// the programs, for a loading cover (compiled together, KHR_parallel_shader_compile)
export function lbmProgramsList(gl){const P=lbmCompile(gl);return ['phi','g','h','pg','ph','dye','down','iadv','ijac','temp'].map(k=>P[k]);}
function lbmOk(gl,o){if(o.ok===null){o.ok=!!gl.getProgramParameter(o.p,gl.LINK_STATUS);if(!o.ok&&typeof console!=='undefined')console.warn('LBM shader',o.name,gl.getShaderInfoLog(o.v)||'',gl.getShaderInfoLog(o.f)||'',gl.getProgramInfoLog(o.p));}return o.ok;}
function lbmSet(gl,o,u){for(const n in u){const v=u[n];let l=o.U[n];if(l===undefined)l=o.U[n]=gl.getUniformLocation(o.p,n);if(l===null)continue;
  if(v&&v.tex!==undefined){gl.activeTexture(gl.TEXTURE0+v.unit);gl.bindTexture(gl.TEXTURE_2D,v.tex);gl.uniform1i(l,v.unit);}
  else if(v&&v.i!==undefined){if(Array.isArray(v.i))gl['uniform'+v.i.length+'i'](l,...v.i);else gl.uniform1i(l,v.i);}
  else if(v&&v.arr){gl['uniform'+v.size+'fv'](l,v.arr);}
  else if(typeof v==='number')gl.uniform1f(l,v);else gl['uniform'+v.length+'fv'](l,v);}}
function lbmTex(gl,w,h,fmt='RGBA32F',filter){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,gl[fmt],w,h);const f=filter?gl.LINEAR:gl.NEAREST;
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,f);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function lbmFbo(gl,texs){const f=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,f);texs.forEach((t,i)=>gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0+i,gl.TEXTURE_2D,t,0));gl.drawBuffers(texs.map((_,i)=>gl.COLOR_ATTACHMENT0+i));return f;}
function lbmClear(gl,f,n){gl.bindFramebuffer(gl.FRAMEBUFFER,f);for(let i=0;i<n;i++)gl.clearBufferfv(gl.COLOR,i,[0,0,0,0]);}
// A box of W × H cells. o: rhoL, rhoH (densities), tauL, tauH (ν = τ/3), sigma, xi (interface width, cells), tauPhi (mobility τφ/3),
// per (1 = periodic in x, 2 = in y), dye (false or {w, h}: the size of the dye picture, RGBA16F).
// one live box per slot (o.slot): a new box of the same slot frees the old one (the textures of a matter that has gone)
const LBM_SLOTS=new Map();
export function lbmCreate(gl,o={}){if(o.slot){const old=LBM_SLOTS.get(o.slot);if(old&&!old.dead)lbmDestroy(old);}const P=lbmCompile(gl),W=o.W|0,H=o.H|0,T=()=>lbmTex(gl,W,H);
 const S={gl,P,W,H,per:o.per|0,wall:o.wall|0,darcy:o.darcy||null,side:[0,0,0,0],acc:[0,0],steps:0,par:{rhoL:o.rhoL??.05,rhoH:o.rhoH??1,tauL:o.tauL??.02,tauH:o.tauH??.02,sigma:o.sigma??.004,xi:o.xi??4,tauPhi:o.tauPhi??.2},F:null};
 const mk=()=>{const g=[T(),T(),T(),T()],h=[T(),T(),T()];return {g,h,fg:lbmFbo(gl,g),fh:lbmFbo(gl,h)};};S.A=mk();S.B=mk();S.phi=T();S.fphi=lbmFbo(gl,[S.phi]);
 for(const X of [S.A,S.B]){lbmClear(gl,X.fg,4);lbmClear(gl,X.fh,3);}lbmClear(gl,S.fphi,1);
 if(o.temp){S.temp={t:[T(),T()],cur:0};S.temp.f=S.temp.t.map(t=>lbmFbo(gl,[t]));for(const f of S.temp.f)lbmClear(gl,f,1);}
 if(o.inflate){S.inf={t:[T(),T()],cur:0};S.inf.f=S.inf.t.map(t=>lbmFbo(gl,[t]));for(const f of S.inf.f)lbmClear(gl,f,1);}
 if(o.dye){const dw=o.dye.w|0||W,dh=o.dye.h|0||H;S.dye={w:dw,h:dh,t:[lbmTex(gl,dw,dh,'RGBA16F',true),lbmTex(gl,dw,dh,'RGBA16F',true)],cur:0};S.dye.f=S.dye.t.map(t=>lbmFbo(gl,[t]));for(const f of S.dye.f)lbmClear(gl,f,1);}
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);if(o.slot)LBM_SLOTS.set(o.slot,S);return S;}
export function lbmDestroy(S){if(S.dead)return;S.dead=true;const gl=S.gl;for(const X of [S.A,S.B]){for(const t of [...X.g,...X.h])gl.deleteTexture(t);gl.deleteFramebuffer(X.fg);gl.deleteFramebuffer(X.fh);}gl.deleteTexture(S.phi);gl.deleteFramebuffer(S.fphi);
 if(S.temp){S.temp.t.forEach(t=>gl.deleteTexture(t));S.temp.f.forEach(f=>gl.deleteFramebuffer(f));}
 if(S.inf){S.inf.t.forEach(t=>gl.deleteTexture(t));S.inf.f.forEach(f=>gl.deleteFramebuffer(f));}
 if(S.dye){S.dye.t.forEach(t=>gl.deleteTexture(t));S.dye.f.forEach(f=>gl.deleteFramebuffer(f));}if(S.down){gl.deleteTexture(S.down.t);gl.deleteFramebuffer(S.down.f);}}
// the current textures: U = (ux, uy, p*, φ) of the last step, the dye picture
export const lbmU=S=>S.A.g[3];
export const lbmDyeTex=S=>S.dye?S.dye.t[S.dye.cur]:null;
export const lbmInflateTex=S=>S.inf?S.inf.t[S.inf.cur]:null;
// an extra force field (a texture with (Fx, Fy) per cell, e.g. the magnetic force), or null
export function lbmForce(S,tex){S.F=tex||null;}
const base=S=>({uN:{i:[S.W,S.H]},uPer:{i:S.per},uWall:{i:S.wall|0},uSide:S.side});
function draw(gl,S,fbo){gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,S.W,S.H);gl.drawArrays(gl.TRIANGLES,0,3);}
// n steps of the fluid
export function lbmStep(S,n=1){const gl=S.gl,P=S.P,p=S.par;if(![P.phi,P.g,P.h].every(o=>lbmOk(gl,o)))return false;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);
 for(let k=0;k<n;k++){const A=S.A,B=S.B;
  gl.useProgram(P.phi.p);lbmSet(gl,P.phi,{...base(S),uH0:{tex:A.h[0],unit:0},uH1:{tex:A.h[1],unit:1},uH2:{tex:A.h[2],unit:2}});draw(gl,S,S.fphi);
  gl.useProgram(P.g.p);lbmSet(gl,P.g,{...base(S),uG0:{tex:A.g[0],unit:0},uG1:{tex:A.g[1],unit:1},uG2:{tex:A.g[2],unit:2},uU:{tex:A.g[3],unit:3},uPhi:{tex:S.phi,unit:4},uF:{tex:S.F||S.phi,unit:5},uHasF:S.F?1:0,uTemp:{tex:S.temp?S.temp.t[S.temp.cur]:S.phi,unit:6},uHasT:S.temp?1:0,uGrav:S.grav||0,uBeta:S.beta||[0,0],
   uRhoL:p.rhoL,uRhoH:p.rhoH,uTauL:p.tauL,uTauH:p.tauH,uSig:p.sigma,uXi:p.xi,uAcc:S.acc,uDarcy:S.darcy||[0,0],uRough:S.rough||0});draw(gl,S,B.fg);
  gl.useProgram(P.h.p);lbmSet(gl,P.h,{...base(S),uH0:{tex:A.h[0],unit:0},uH1:{tex:A.h[1],unit:1},uH2:{tex:A.h[2],unit:2},uU:{tex:B.g[3],unit:3},uUo:{tex:A.g[3],unit:5},uPhi:{tex:S.phi,unit:4},uTauPhi:p.tauPhi,uXi:p.xi});draw(gl,S,B.fh);
  S.A=B;S.B=A;S.steps++;}
 gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
function shapeU(list){const A=new Float32Array(32),B=new Float32Array(32),C=new Float32Array(32),D=new Float32Array(32);let n=0;
 for(const s of list){if(n>=8)break;const k=n*4;A.set([s.x,s.y,s.rx??s.r,s.ry??s.r],k);B.set([s.angle||0,s.phi??-1,s.ux||0,s.uy||0],k);C.set([s.k??1,s.soft??1.5,s.vel==='set'?1:s.vel==='add'?2:0,s.p||0],k);if(s.dye)D.set(s.dye,k);n++;}
 return {uNS:{i:n},uA:{arr:A,size:4},uB:{arr:B,size:4},uC:{arr:C,size:4},uDyeC:{arr:D,size:4}};}
// shapes (cells): {x, y, r | rx, ry, angle, phi (target, omitted: kept), ux, uy, vel: 'set' | 'add', p (pressure p* target), k (0–1), soft (cells), dye: [r,g,b,a]}
export function lbmPaint(S,list){if(!list.length)return;const gl=S.gl,P=S.P;if(!lbmOk(gl,P.pg)||!lbmOk(gl,P.ph))return;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);const A=S.A,B=S.B,u=shapeU(list);
 gl.useProgram(P.ph.p);lbmSet(gl,P.ph,{...base(S),...u,uH0:{tex:A.h[0],unit:0},uH1:{tex:A.h[1],unit:1},uH2:{tex:A.h[2],unit:2},uU:{tex:A.g[3],unit:3}});draw(gl,S,B.fh);
 gl.useProgram(P.pg.p);lbmSet(gl,P.pg,{...base(S),...u,uG0:{tex:A.g[0],unit:0},uG1:{tex:A.g[1],unit:1},uG2:{tex:A.g[2],unit:2},uU:{tex:A.g[3],unit:3}});draw(gl,S,B.fg);
 // the h of the painted cells now sits in B: copy U's φ there too (paint-g wrote it); swap
 S.A=B;S.B=A;gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
// the dyes: carried by the flow over `dt` steps, times `fade`, and painted with the shapes that carry a dye colour
export function lbmDye(S,dt,fade=1,list=[]){if(!S.dye)return;const gl=S.gl,P=S.P;if(!lbmOk(gl,P.dye))return;const D=S.dye,src=D.t[D.cur],dst=1-D.cur;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);
 gl.useProgram(P.dye.p);lbmSet(gl,P.dye,{...base(S),...shapeU(list.filter(s=>s.dye)),uD:{tex:src,unit:0},uU:{tex:S.A.g[3],unit:1},uDN:[D.w,D.h],uDt:dt,uFade:fade});
 gl.bindFramebuffer(gl.FRAMEBUFFER,D.f[dst]);gl.viewport(0,0,D.w,D.h);gl.drawArrays(gl.TRIANGLES,0,3);D.cur=dst;gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
// the inflated thickness: carried over `dt` steps, then `iters` Jacobi sweeps
export function lbmInflate(S,dt,iters=24){if(!S.inf)return;const gl=S.gl,P=S.P;if(!lbmOk(gl,P.iadv)||!lbmOk(gl,P.ijac))return;const I=S.inf;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);
 const pass=(o,u)=>{gl.useProgram(o.p);lbmSet(gl,o,{...base(S),uQ:{tex:I.t[I.cur],unit:0},uU:{tex:S.A.g[3],unit:1},...u});draw(gl,S,I.f[1-I.cur]);I.cur=1-I.cur;};
 if(dt>0)pass(P.iadv,{uDt:dt});for(let i=0;i<iters;i++)pass(P.ijac,{});gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
// the temperature over `dt` steps: carried, conducted (kappa, cells²/step), cooled (cool per step everywhere; top = [from y, to y, rate]
// for the band at the top), and set by shapes (phi = the temperature they bring, k how fast)
export function lbmTemp(S,dt,o={},list=[]){if(!S.temp)return;const gl=S.gl,P=S.P;if(!lbmOk(gl,P.temp))return;const D=S.temp;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);gl.useProgram(P.temp.p);
 lbmSet(gl,P.temp,{...base(S),...shapeU(list),uT:{tex:D.t[D.cur],unit:0},uU:{tex:S.A.g[3],unit:1},uDt:dt,uKap:o.kappa??.01,uCool:o.cool??0,uTop:o.top||[0,0,0,0]});
 draw(gl,S,D.f[1-D.cur]);D.cur=1-D.cur;gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
export const lbmTempTex=S=>S.temp?S.temp.t[S.temp.cur]:null;
// reads (synchronously) the whole U = (ux, uy, p*, φ): for the tests and the review tools
export function lbmRead(S){const gl=S.gl,out=new Float32Array(S.W*S.H*4);gl.bindFramebuffer(gl.FRAMEBUFFER,S.A.fg);gl.readBuffer(gl.COLOR_ATTACHMENT3);gl.readPixels(0,0,S.W,S.H,gl.RGBA,gl.FLOAT,out);gl.readBuffer(gl.COLOR_ATTACHMENT0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return out;}
// a small picture of the box (bw × bh cells per texel): (mean φ, mean speed, mean p*, share of cells with φ > ½). Read without
// stalling the card: lbmDownAsk starts the copy, lbmDownGet returns it a frame or more later (or null while it is not ready)
export function lbmDownAsk(S,bw=8,bh=8){const gl=S.gl,P=S.P;if(!lbmOk(gl,P.down))return false;const w=Math.ceil(S.W/bw),h=Math.ceil(S.H/bh);
 if(!S.down||S.down.w!==w||S.down.h!==h){if(S.down){gl.deleteTexture(S.down.t);gl.deleteFramebuffer(S.down.f);gl.deleteBuffer(S.down.pbo);}const t=lbmTex(gl,w,h);S.down={w,h,t,f:lbmFbo(gl,[t]),pbo:gl.createBuffer(),sync:null,data:new Float32Array(w*h*4)};
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER,S.down.pbo);gl.bufferData(gl.PIXEL_PACK_BUFFER,w*h*16,gl.STREAM_READ);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);}
 const D=S.down;if(D.sync)return false;gl.disable(gl.BLEND);gl.bindVertexArray(P.vao);gl.useProgram(P.down.p);lbmSet(gl,P.down,{...base(S),uU:{tex:S.A.g[3],unit:0},uB:{i:[bw,bh]}});
 gl.bindFramebuffer(gl.FRAMEBUFFER,D.f);gl.viewport(0,0,w,h);gl.drawArrays(gl.TRIANGLES,0,3);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,D.pbo);gl.readPixels(0,0,w,h,gl.RGBA,gl.FLOAT,0);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
 D.sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();gl.bindVertexArray(null);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return true;}
export function lbmDownGet(S){const gl=S.gl,D=S.down;if(!D||!D.sync)return null;const st=gl.clientWaitSync(D.sync,0,0);if(st===gl.TIMEOUT_EXPIRED)return null;gl.deleteSync(D.sync);D.sync=null;
 gl.bindBuffer(gl.PIXEL_PACK_BUFFER,D.pbo);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,D.data);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);return {w:D.w,h:D.h,data:D.data};}
// the physical numbers of the box (lattice units): surface tension, the two kinematic viscosities, the densities
export function lbmPhysics(S){const p=S.par;return {sigma:p.sigma,nuL:p.tauL/3,nuH:p.tauH/3,rhoL:p.rhoL,rhoH:p.rhoH,xi:p.xi,M:p.tauPhi/3};}

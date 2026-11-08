// La nova Pluja de colors (0.53, phase 1: the style trial) · the GPU programs of the engine (pluja-gl.js).
// The floor is a thick liquid simulated on a grid (stable fluids: Stam, 1999; on the GPU as Harris, 2004), with vorticity confinement
// (Fedkiw et al., 2001) and a very slow curl-noise current (Bridson et al., 2007). The ink is up to eight colours, kept as amounts
// (two RGBA textures), moved by the liquid. A drop pushes the ink around it outward with the exact marbling drop (Lu et al., 2012):
// the ink at distance d from the centre moves to √(d² + Δ), where Δ is how much r² grew this frame, so nothing is lost; the new ink
// fills the small disc in the middle. The cells of poured paint (a Rayleigh–Taylor instability: Zetina et al., 2015) are imitated:
// the new ink carries round cells of the colour below it, drawn where that ink will end up when the drop has finished growing.
// All the programs are shared by every scene (0.44.6: per-scene shader code made the compilation slow on Windows with Chrome).
export const PLJ_VS=`#version 300 es
layout(location=0) in vec2 a;out vec2 vUv;void main(){vUv=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
const PLJ_HEAD=`#version 300 es
precision highp float;precision highp sampler2D;in vec2 vUv;`;
// the velocity, moved along itself and slowed (the liquid is thick: it settles in a couple of seconds)
export const PLJ_FS_ADVECT=PLJ_HEAD+`out vec4 o;uniform sampler2D uVel;uniform float uDt,uAR,uDamp;
void main(){vec2 v=texture(uVel,vUv).xy;vec2 b=vUv-uDt*vec2(v.x/uAR,v.y);o=vec4(texture(uVel,b).xy*uDamp,0.,1.);}`;
export const PLJ_FS_CURL=PLJ_HEAD+`out vec4 o;uniform sampler2D uVel;uniform vec2 uTx;
void main(){float h=uTx.y;float L=texture(uVel,vUv-vec2(uTx.x,0.)).y,R=texture(uVel,vUv+vec2(uTx.x,0.)).y,B=texture(uVel,vUv-vec2(0.,uTx.y)).x,T=texture(uVel,vUv+vec2(0.,uTx.y)).x;
 o=vec4(((R-L)-(T-B))/(2.*h),0.,0.,1.);}`;
// forces: vorticity confinement, the slow current and the swirl of each drop (a main vortex and three small ones around its rim,
// of alternating turn, which bend the rings into waves)
export const PLJ_FS_FORCE=PLJ_HEAD+`out vec4 o;uniform sampler2D uVel,uCurl;uniform vec2 uTx;uniform float uAR,uDt,uEps,uT,uDrift;
uniform int uN;uniform vec4 uS[8];uniform vec4 uS2[8];
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float psi(vec2 p){return vn(p*1.7+vec2(uT*.031,-uT*.023))+.5*vn(p*3.4+vec2(-uT*.047,uT*.037)+9.);}
void main(){vec2 f=vec2(vUv.x*uAR,vUv.y),v=texture(uVel,vUv).xy;float h=uTx.y;
 float c=texture(uCurl,vUv).x,cL=abs(texture(uCurl,vUv-vec2(uTx.x,0.)).x),cR=abs(texture(uCurl,vUv+vec2(uTx.x,0.)).x),cB=abs(texture(uCurl,vUv-vec2(0.,uTx.y)).x),cT=abs(texture(uCurl,vUv+vec2(0.,uTx.y)).x);
 vec2 g=vec2(cR-cL,cT-cB)/(2.*h);g/=length(g)+1e-5;v+=uDt*uEps*vec2(g.y,-g.x)*c;
 float e=.012;vec2 d0=vec2((psi(f+vec2(0.,e))-psi(f-vec2(0.,e)))/(2.*e),-(psi(f+vec2(e,0.))-psi(f-vec2(e,0.)))/(2.*e));v+=uDt*uDrift*d0;
 for(int i=0;i<8;i++){if(i>=uN)break;vec2 d=f-uS[i].xy;float R=uS[i].z;float w=exp(-dot(d,d)/(R*R));v+=uDt*uS[i].w*vec2(-d.y,d.x)/R*w;
  for(int k=0;k<3;k++){float a=uS2[i].x*6.2832+float(k)*2.0944;vec2 cc=uS[i].xy+1.1*R*vec2(cos(a),sin(a)),dd=f-cc;float r2=.5*R;float ww=exp(-dot(dd,dd)/(r2*r2));
   v+=uDt*uS2[i].y*(k==1?-1.:1.)*vec2(-dd.y,dd.x)/r2*ww;}}
 o=vec4(v,0.,1.);}`;
export const PLJ_FS_DIV=PLJ_HEAD+`out vec4 o;uniform sampler2D uVel;uniform vec2 uTx;
void main(){float h=uTx.y;float L=texture(uVel,vUv-vec2(uTx.x,0.)).x,R=texture(uVel,vUv+vec2(uTx.x,0.)).x,B=texture(uVel,vUv-vec2(0.,uTx.y)).y,T=texture(uVel,vUv+vec2(0.,uTx.y)).y;
 o=vec4(((R-L)+(T-B))/(2.*h),0.,0.,1.);}`;
export const PLJ_FS_JACOBI=PLJ_HEAD+`out vec4 o;uniform sampler2D uP,uDiv;uniform vec2 uTx;
void main(){float h=uTx.y;float L=texture(uP,vUv-vec2(uTx.x,0.)).x,R=texture(uP,vUv+vec2(uTx.x,0.)).x,B=texture(uP,vUv-vec2(0.,uTx.y)).x,T=texture(uP,vUv+vec2(0.,uTx.y)).x;
 o=vec4((L+R+B+T-h*h*texture(uDiv,vUv).x)*.25,0.,0.,1.);}`;
export const PLJ_FS_GRAD=PLJ_HEAD+`out vec4 o;uniform sampler2D uVel,uP;uniform vec2 uTx;
void main(){float h=uTx.y;float L=texture(uP,vUv-vec2(uTx.x,0.)).x,R=texture(uP,vUv+vec2(uTx.x,0.)).x,B=texture(uP,vUv-vec2(0.,uTx.y)).x,T=texture(uP,vUv+vec2(0.,uTx.y)).x;
 vec2 v=texture(uVel,vUv).xy-vec2(R-L,T-B)/(2.*h);
 // the edges of the screen are walls: the liquid slides along them but does not cross them (no black flows in, no paint smears)
 vec2 w=clamp(vec2(min(vUv.x,1.-vUv.x)/uTx.x,min(vUv.y,1.-vUv.y)/uTx.y)/2.,0.,1.);o=vec4(v*w,0.,1.);}`;
// the ink: traced back through the liquid and through every drop that is growing (newest last), read with a five-tap Catmull–Rom
// filter (sharper than bilinear, so the edges stay crisp for minutes); new ink, with its cells, where the trace lands inside a drop
export const PLJ_FS_DYE=PLJ_HEAD+`layout(location=0) out vec4 o0;layout(location=1) out vec4 o1;
uniform sampler2D uD0,uD1,uVel;uniform vec2 uDS;uniform float uAR,uDt,uKeep,uCell,uRing,uStreak,uLevel,uGap,uFill;
uniform int uN;uniform vec4 uP[8];uniform vec4 uQ[8];uniform vec4 uQ2[8];
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
vec4 cr(sampler2D t,vec2 uv){vec2 sp=uv*uDS,tp=floor(sp-.5)+.5,f=sp-tp;
 vec2 w0=f*(-.5+f*(1.-.5*f)),w1=1.+f*f*(-2.5+1.5*f),w2=f*(.5+f*(2.-1.5*f)),w3=f*f*(-.5+.5*f),w12=w1+w2,o12=w2/w12;
 vec2 t0=(tp-1.)/uDS,t3=(tp+2.)/uDS,t12=(tp+o12)/uDS;
 vec4 r=textureLod(t,vec2(t12.x,t0.y),0.)*w12.x*w0.y+textureLod(t,vec2(t0.x,t12.y),0.)*w0.x*w12.y+textureLod(t,t12,0.)*w12.x*w12.y+textureLod(t,vec2(t3.x,t12.y),0.)*w3.x*w12.y+textureLod(t,vec2(t12.x,t3.y),0.)*w12.x*w3.y;
 return r/(w12.x*w0.y+w0.x*w12.y+w12.x*w12.y+w3.x*w12.y+w12.x*w3.y);}
float cells(vec2 p,float dens,float sd){vec2 ip=floor(p),fp=fract(p);float best=1e9;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 g=vec2(i,j),q=ip+g+sd;if(h1(q*1.37)>=dens)continue;vec2 c=g+.15+.7*h2(q);float r=mix(.16,.44,h1(q*2.71));best=min(best,length(c-fp)-r);}
 return best;}
void put(int k,float a,inout vec4 A,inout vec4 B){if(k<0)return;if(k<4)A[k]+=a;else B[k-4]+=a;}
void main(){vec2 f=vec2(vUv.x*uAR,vUv.y),pos=f-uDt*texture(uVel,vUv).xy;
 for(int i=uN-1;i>=0;i--){vec2 d=pos-uP[i].xy;float d2=dot(d,d),dA=uP[i].z;
  if(d2<=dA){float F=d2+(uQ[i].x-uP[i].w),R2=uQ[i].x;vec2 fin=uP[i].xy+(d2>1e-12?d/sqrt(d2):vec2(1,0))*sqrt(F);
   float u=F/R2,band=smoothstep(.2,.5,u)*(1.-smoothstep(.92,1.,u)),clu=smoothstep(.2,.7,vn(fin*9.+uQ[i].w)),dens=band*uQ2[i].x*(.35+.65*clu);
   vec2 cp=fin/uCell;float s=min(cells(cp,dens,uQ[i].w),cells(cp*2.1+5.3,dens*.85,uQ[i].w+3.)/2.1);
   int k=int(uQ[i].y),ku=int(uQ[i].z);vec4 A=vec4(0),B=vec4(0);
   if(s<0.&&ku>=0){float pl=.18+.32*clamp(-s/.3,0.,1.);put(ku,1.-pl,A,B);put(7,pl,A,B);}
   else if(s<uRing&&ku>=0){put(7,.6,A,B);put(k,.4,A,B);}
   else{float rr=sqrt(F)*uStreak+1.3*vn(fin*11.+uQ[i].w),st=smoothstep(.55,.92,vn(vec2(rr,uQ[i].w*7.)))*.3;put(k,1.-st,A,B);put(7,st,A,B);}
   o0=A;o1=B;return;}
  pos=uP[i].xy+d*sqrt(1.-dA/d2);}
 // beyond the edge of the screen the floor is like its edge (no black flows in from outside)
 vec2 uv=clamp(vec2(pos.x/uAR,pos.y),.5/uDS,1.-.5/uDS);
 vec4 A=clamp(cr(uD0,uv),0.,1.),B=clamp(cr(uD1,uv),0.,1.);float s=dot(A,vec4(1))+dot(B,vec4(1));if(s>1.){A/=s;B/=s;s=1.;}
 // the paint levels out: a thin black gap between paint on both sides closes slowly (an open edge does not grow); after the
 // last drop of a scene (uFill) every edge flows on until the floor is full
 if(uLevel>0.&&s<.98){vec4 nA=vec4(0),nB=vec4(0);float nt=0.;
  for(int k=0;k<4;k++){vec2 o=(k==0?vec2(1.,0.):k==1?vec2(0.,1.):k==2?vec2(.7071,.7071):vec2(.7071,-.7071))*uGap;o.x/=uAR;
   vec4 a1=textureLod(uD0,uv+o,0.),b1=textureLod(uD1,uv+o,0.),a2=textureLod(uD0,uv-o,0.),b2=textureLod(uD1,uv-o,0.);
   float t1=dot(a1,vec4(1))+dot(b1,vec4(1)),t2=dot(a2,vec4(1))+dot(b2,vec4(1));
   if(t1>.5&&t2>.5&&t1+t2>nt){nt=t1+t2;nA=a1+a2;nB=b1+b2;}
   if(uFill>0.){if(t1>.5&&t1*2.>nt){nt=t1*2.;nA=a1*2.;nB=b1*2.;}if(t2>.5&&t2*2.>nt){nt=t2*2.;nA=a2*2.;nB=b2*2.;}}}
  if(nt>0.){float g=max(uLevel,uFill)*(1.-s)/nt;A+=nA*g;B+=nB*g;}}
 o0=A*uKeep;o1=B*uKeep;}`;
// the relief of the liquid: rings from each impact (a damped wave equation, several steps a frame)
export const PLJ_FS_RIPPLE=PLJ_HEAD+`out vec4 o;uniform sampler2D uH;uniform vec2 uTx;uniform float uC,uDamp,uAR,uF,uTau;uniform int uN;uniform vec4 uI[8];uniform float uAge[8];
void main(){vec2 s=texture(uH,vUv).xy;vec2 nb=texture(uH,vUv+vec2(uTx.x,0.)).xy+texture(uH,vUv-vec2(uTx.x,0.)).xy+texture(uH,vUv+vec2(0.,uTx.y)).xy+texture(uH,vUv-vec2(0.,uTx.y)).xy,lap=nb-4.*s;
 // a little viscosity damps the waves as short as the grid (they shimmer); the real rings are much longer and keep going
 float hn=(2.*s.x-s.y+uC*lap.x+.08*(lap.x-lap.y))*uDamp;vec2 f=vec2(vUv.x*uAR,vUv.y);
 for(int i=0;i<8;i++){if(i>=uN)break;vec2 d=f-uI[i].xy;float g=uAge[i];hn+=uI[i].w*cos(6.2832*uF*g)*exp(-g/uTau)*exp(-dot(d,d)/(uI[i].z*uI[i].z));}
 o=vec4(hn,s.x,0.,1.);}`;
// the picture: each pixel of the screen finds its point of the floor (in perspective or from above), mixes its inks in OKLab keeping
// the chroma (two colours meet in a soft step without turning brown: Ottosson, 2020), lights the relief (paint thickness + rings) with
// two soft window lights and a wet gloss, and fades into black far away
export const PLJ_FS_RENDER=PLJ_HEAD+`out vec4 o;uniform sampler2D uD0,uD1,uH;uniform vec2 uRes,uDS,uRS;uniform float uAR,uTop,uT,uBump,uRip,uSpec,uFloor,uSoft,uSharp,uGloss,uGlint,uLvl;
uniform vec3 uCam,uFwd,uRight,uUp;uniform vec2 uTan,uFog;uniform vec4 uRect;uniform vec3 uLab[8];uniform float uHgt[8];
vec3 lab2lin(vec3 c){float l=c.x+.3963377774*c.y+.2158037573*c.z,m=c.x-.1055613458*c.y-.0638541728*c.z,s=c.x-.0894841775*c.y-1.291485548*c.z;l=l*l*l;m=m*m*m;s=s*s*s;
 return vec3(4.0767416621*l-3.3077115913*m+.2309699292*s,-1.2684380046*l+2.6097574011*m-.3413193965*s,-.0041960863*l-.7034186147*m+1.707614701*s);}
float thick(vec2 uv,float lod){vec4 a=textureLod(uD0,uv,lod),b=textureLod(uD1,uv,lod);float t=dot(a,vec4(1))+dot(b,vec4(1));
 float h=(dot(a,vec4(uHgt[0],uHgt[1],uHgt[2],uHgt[3]))+dot(b,vec4(uHgt[4],uHgt[5],uHgt[6],uHgt[7])))/max(t,1e-4);
 return smoothstep(.2*uLvl,.8*uLvl,t)*(.65+.35*h);}
float box(vec3 R,vec3 L,vec3 Lr,vec3 Lu,vec2 sz){float c=dot(R,L);if(c<=0.)return 0.;vec2 q=vec2(dot(R,Lr),dot(R,Lu))/c/sz;return smoothstep(1.,.55,abs(q.x))*smoothstep(1.,.55,abs(q.y));}
vec3 env(vec3 R){vec3 c=vec3(.006,.006,.008)*(.4+.6*max(R.y,0.));
 c+=vec3(1.,.97,.92)*2.2*box(R,normalize(vec3(-.45,.72,.55)),normalize(vec3(.78,.0,.62)),normalize(vec3(.32,.69,-.65)),vec2(.42,.2));
 c+=vec3(.85,.9,1.)*1.4*box(R,normalize(vec3(.55,.62,.75)),normalize(vec3(.8,0.,-.6)),normalize(vec3(-.4,.78,-.48)),vec2(.3,.14));return c;}
void main(){vec2 sc=vUv*2.-1.;vec2 uv;vec3 P,V;float dist=1.;
 if(uTop>.5){uv=vUv;P=vec3(uv.x*uAR,0.,uv.y);V=normalize(vec3(.0,1.,-.08));}
 else{vec3 dir=normalize(uFwd+sc.x*uTan.x*uRight+sc.y*uTan.y*uUp);if(dir.y>=-1e-4){o=vec4(0,0,0,1);return;}float t=-uCam.y/dir.y;P=uCam+t*dir;dist=t;
  uv=vec2((P.x-uRect.x)/uRect.z,(P.z-uRect.y)/uRect.w);V=-dir;}
 vec2 fw=fwidth(uv)*uDS;float lod=max(0.,log2(max(max(fw.x,fw.y),1e-3)));
 float inside=step(0.,uv.x)*step(0.,uv.y)*step(uv.x,1.)*step(uv.y,1.);
 // the colour: read a little blurred (lod + uSoft) and sharpened again, like surface tension: round smooth outlines, crisp borders
 float br=(uSoft+(1.-uLvl)*1.5)*exp2(lod);vec2 bo=br/uDS;vec4 a=vec4(0),b=vec4(0);
 for(int k=0;k<4;k++){vec2 o=bo*(k==0?vec2(.38,.92):k==1?vec2(-.92,.38):k==2?vec2(-.38,-.92):vec2(.92,-.38));a+=textureLod(uD0,uv+o,lod);b+=textureLod(uD1,uv+o,lod);}
 a*=.25;b*=.25;float lc=lod+log2(1.+br);float tot=dot(a,vec4(1))+dot(b,vec4(1));
 vec3 lab=vec3(0);float chr=0.,ws=0.;
 for(int i=0;i<8;i++){float w=pow(clamp((i<4?a[i]:b[i-4])/max(tot,1e-4),0.,1.),uSharp);lab+=w*uLab[i];chr+=w*length(uLab[i].yz);ws+=w;}
 lab/=max(ws,1e-6);chr/=max(ws,1e-6);float cl=length(lab.yz);if(cl>1e-4)lab.yz*=chr/cl;
 vec3 ink=max(lab2lin(lab),0.);float thr=.5*uLvl,cov=clamp((tot-thr)/max(fwidth(tot)*1.6,.03*uLvl)+.5,0.,1.)*inside;
 // the relief: paint thickness (rounded at its edge) + the rings of the impacts
 float lh=lc+.7;vec2 e=exp2(lh)/uDS;
 float hx=(thick(uv+vec2(e.x,0.),lh)-thick(uv-vec2(e.x,0.),lh))/(2.*e.x*uAR),hz=(thick(uv+vec2(0.,e.y),lh)-thick(uv-vec2(0.,e.y),lh))/(2.*e.y);
 vec2 er=1./uRS;float rx=(texture(uH,uv+vec2(er.x,0.)).x-texture(uH,uv-vec2(er.x,0.)).x)/(2.*er.x*uAR),rz=(texture(uH,uv+vec2(0.,er.y)).x-texture(uH,uv-vec2(0.,er.y)).x)/(2.*er.y);
 vec2 gI=vec2(hx,hz)*uBump,gR=vec2(rx,rz)*uRip;
 vec3 N=normalize(vec3(-gI.x-gR.x,1.,-gI.y-gR.y));vec3 R=reflect(-V,N);
 float fr=.04+.96*pow(1.-max(dot(N,V),0.),5.);
 vec3 L=normalize(vec3(-.35,.85,.4)),Hh=normalize(L+V);
 vec3 spec=env(R)*fr+vec3(1.)*pow(max(dot(N,Hh),0.),140.)*.45;
 float gl=max(0.,dot(-gR,normalize(vec2(-.45,.55))));
 vec3 fl=vec3(uFloor)+env(R)*fr*uGloss+vec3(.9,.93,1.)*uGlint*gl*gl/(.02+gl);
 float dk=pow(uLvl,1.6);vec3 col=mix(fl,(ink*(.8+.3*max(dot(N,L),0.))+spec*uSpec)*dk,cov);
 col*=inside;
 if(uTop<.5){float fog=smoothstep(uFog.x,uFog.y,dist);col*=1.-fog;}
 col*=1.-.28*pow(clamp(length(sc*vec2(.8,1.))*.75,0.,1.),2.4);
 col=col/(1.+.12*col);
 o=vec4(pow(clamp(col,0.,1.),vec3(1./2.2)),1.);}`;
// drops in the air, the droplets of each splash and the thin thread above a falling drop: shaded sprites over the picture
export const PLJ_VS_SPRITE=`#version 300 es
layout(location=0) in vec2 a;layout(location=1) in vec4 iPos;layout(location=2) in vec4 iCol;layout(location=3) in vec4 iExt;uniform float uAsp;out vec2 q;out vec4 col;out vec4 ext;flat out float kind;
void main(){q=a;col=iCol;ext=iExt;kind=iPos.w;float r=iPos.z;vec2 s,c=iPos.xy;
 if(kind>2.5){float e=iExt.x,h=iExt.y,hy=e+h*.5+.1;s=vec2(1.35*r/uAsp,r*hy);c+=vec2(0.,r*h*.5);q=vec2(a.x*1.35,a.y*hy+h*.5);}
 else{s=kind>1.5?vec2(r*.35/uAsp,r*16.):kind>.5?vec2(r/uAsp,r*2.):vec2(r/uAsp,r);c+=kind>1.5?vec2(0.,s.y):kind>.5?vec2(0.,s.y*.35):vec2(0.);}
 gl_Position=vec4(c+a*s,0.,1.);}`;
export const PLJ_FS_SPRITE=`#version 300 es
precision highp float;in vec2 q;in vec4 col;in vec4 ext;flat in float kind;out vec4 o;
// the crown: two walls of a thin sheet standing on an ellipse (the near one in front), with points on its top edge
float crownWall(vec2 p,float side,float e,float h,float sd,out float c,out float u){c=p.x;u=-1.;
 for(int k=0;k<2;k++){if(abs(c)>1.)return 0.;float sn=side*sqrt(1.-c*c),th=atan(sn,c),g=abs(fract(th*1.75+sd)-.5)*2.,hh=h*(.32+.68*pow(1.-g,2.2));
  u=(p.y-e*sn)/hh;c=p.x/(1.+.35*clamp(u,0.,1.));}
 return (u>=0.&&u<=1.)?1.:0.;}
void main(){vec3 L=normalize(vec3(-.4,.6,.7));float al;vec3 n;
 if(kind>2.5){float e=ext.x,h=ext.y,sd=ext.z,cf,uf,cb,ub;float f=crownWall(q,-1.,e,h,sd,cf,uf),b=crownWall(q,1.,e,h,sd,cb,ub);
  vec3 c;if(f>.5){c=col.rgb*(.75+.5*pow(abs(cf),3.))+vec3(1.)*(.45*smoothstep(.8,1.,uf)+.3*pow(abs(cf),8.));al=.55+.4*smoothstep(.5,1.,uf)+.3*pow(abs(cf),4.);}
  else if(b>.5){c=col.rgb*(.45+.35*ub)+vec3(1.)*.2*smoothstep(.85,1.,ub);al=.5+.35*smoothstep(.6,1.,ub);}else discard;al=min(al,1.);
  al*=col.a;o=vec4(pow(clamp(c,0.,1.),vec3(1./2.2))*al,al);return;}
 if(kind>1.5){float w=1.-smoothstep(.0,1.,abs(q.x)*2.2);al=w*(.25+.55*(1.-q.y)*.5)*col.a;o=vec4(col.rgb*al,al);return;}
 if(kind>.5){float y=q.y;float hw=y<-.25?sqrt(max(0.,1.-pow((y+.25)/.75,2.))):pow(max(0.,1.-(y+.25)/1.25),1.4);float x=q.x/max(hw,1e-3);if(abs(x)>1.){discard;}
  al=smoothstep(1.,.8,abs(x))*col.a;n=normalize(vec3(x*.9,.25,sqrt(max(0.,1.-x*x))));}
 else{float r2=dot(q,q);if(r2>1.)discard;al=smoothstep(1.,.82,sqrt(r2))*col.a;n=vec3(q,sqrt(1.-r2));}
 vec3 c=col.rgb*(.35+.75*max(dot(n,L),0.))+vec3(1.)*pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),24.)*.9+col.rgb*.25*pow(1.-n.z,2.);
 o=vec4(pow(clamp(c,0.,1.),vec3(1./2.2))*al,al);}`;

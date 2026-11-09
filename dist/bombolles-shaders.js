// Bombolles sense pes (CE06 'bubbles', made again in November 2026) · the shaders of the common engine (bombolles-motor.js).
// Every stimulus is matter floating on black: the engine draws bodies (instanced quads: soap bubbles, the wall two bubbles share,
// beads and droplets) and ropes (strips: honey streams, coils and threads) into a half-float picture in linear light, and a last
// pass adds a soft glow and brings the picture to the screen. Scene units: x ∈ [0, AR], y ∈ [0, 1] from the top.
// Soap film: the colour is the interference of light in a film of water of changing thickness (three wavelengths, the classic
// sin² of the phase difference; a simplification of Belcour & Barla, 2017), on a thickness that swirls over the sphere.
// Honey: light absorbed along the thickness (Beer–Lambert), a bright focus opposite the light and two long lights reflected.
export const BMB_VS_FULL=`#version 300 es
layout(location=0) in vec2 aP;out vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}`;
export const BMB_VS_SPRITE=`#version 300 es
layout(location=0) in vec2 aQ;layout(location=1) in vec4 aA;layout(location=2) in vec4 aB;layout(location=3) in vec4 aC;layout(location=4) in vec4 aD;layout(location=5) in vec4 aE;
uniform float uAR,uPad;out vec2 vQ;flat out vec4 vA,vB,vC,vD,vE;
void main(){vQ=aQ*uPad;vA=aA;vB=aB;vC=aC;vD=aD;vE=aE;vec2 p=aA.xy+vQ*aA.z;gl_Position=vec4(p.x/uAR*2.-1.,1.-p.y*2.,0.,1.);}`;
// the thickness of the film and the light it catches, swirling: a few turns of folding the point of the sphere over itself
const BMB_GLSL_FILM=`
vec2 bmbMarble(vec3 P,float seed,float t){vec3 p=P*uFreq+vec3(seed*13.1,seed*7.7,seed*3.3);float a=1.;
 for(int i=0;i<7;i++){p+=(.56/pow(a,.8))*sin(p.yzx*(1.25*a)+vec3(t*.23,t*.19,-t*.15)*sqrt(a)+seed*6.283);a*=1.55;}
 float ph=(p.x*1.1+p.y*.8+p.z*1.3)*uBands,h=abs(fract(ph*.159155)*2.-1.);
 float m=.5+.5*sin(p.y*1.5-p.z*1.2+p.x*.4+1.7+seed*9.);m*=.8+.2*sin(ph*5.+p.z*3.);m+=.1*pow(.5+.5*sin(ph*9.+p.y*4.),4.);
 return vec2(h,m);}
// (where only the red wavelength is reflected, part of it is given to the green: gold instead of a saturated red)
vec3 bmbThin(float d,float c){vec3 ph=8.3566*d*c/vec3(650.,510.,475.);vec3 s=sin(ph);s*=s;s.g+=.55*s.r*(1.-s.b)*(1.-s.b)*(1.-s.g);return s;}
vec3 bmbVivid(vec3 c,float k){float l=dot(c,vec3(.3,.5,.2));return max(vec3(0.),mix(vec3(l),c,k));}
vec3 bmbTurn(vec3 p,float a,float b){float c=cos(a),s=sin(a);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);c=cos(b);s=sin(b);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
// the colour of the film at a point of the sphere: n = normal, cz = cosine of the angle of view, k = how much of it is there (0–1)
vec3 bmbFilm(vec3 n,float cz,float seed,float t,float lit){vec2 m=bmbMarble(bmbTurn(n,t*.11+seed*5.,seed*3.+t*.07),seed,t);
 float ct=mix(1.,sqrt(1.-(1.-cz*cz)/1.769),.55),d=mix(mix(uThick.x,uThick.y,m.x/uThick2.z),mix(uThick2.x,uThick2.y,(m.x-uThick2.z)/max(1e-3,1.-uThick2.z)),smoothstep(uThick2.z-.012,uThick2.z+.012,m.x))+(seed-.5)*uThick.z;
 vec3 c=bmbVivid(bmbThin(d,ct),uSat);float band=smoothstep(uBand.x,uBand.y,m.y),fr=uF0+(1.-uF0)*pow(1.-cz,2.6);
 return c*fr*(.035+1.3*band)*lit;}`;
// A soap bubble. A = x, y, radius, seed · B = wobble (a2, φ2, a3, φ3) · C = alpha, hole angle (a burst opening), hole direction,
// film time offset · D, E = planes that cut it where it shares a wall with another bubble (nx, ny, nz, distance / radius; w ≥ 9: none)
export const BMB_FS_BUBBLE=`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uT,uPx,uFreq,uSat,uF0,uGain;uniform vec3 uThick,uThick2;uniform vec2 uBand;uniform float uBands;out vec4 o;
${BMB_GLSL_FILM}
float bmbWindow(vec3 r,vec3 L,float sz){float k=dot(r,L);if(k<=.05)return 0.;vec3 tx=normalize(cross(vec3(0.,1.,0.),L)),ty=cross(L,tx);float a=dot(r,tx)/k,b=dot(r,ty)/k;a+=b*.22;
 float e=.1*sz,box=smoothstep(sz+e,sz-e,abs(a))*smoothstep(sz*.78+e,sz*.78-e,abs(b));return box*smoothstep(.015*sz,.07*sz,abs(a+.1*sz))*(.55+.45*smoothstep(sz,-sz,b));}
void main(){float R=vA.z,seed=vA.w;vec2 q=vQ;float th=atan(q.y,q.x),rr=1.+vB.x*cos(2.*th-vB.y)+vB.z*cos(3.*th-vB.w);q/=rr;float r2=dot(q,q),aa=1.5/(R*uPx);
 if(r2>1.+2.*aa){discard;}float r=sqrt(r2),edge=1.-smoothstep(1.-aa,1.+aa,r),z=sqrt(max(0.,1.-r2));vec3 nf=vec3(q,z),nb=vec3(q,-z);float kf=1.,kb=1.,sw=max(.012,2.*aa);
 if(vD.w<9.){kf*=1.-smoothstep(-sw,sw,dot(nf,vD.xyz)-vD.w);kb*=1.-smoothstep(-sw,sw,dot(nb,vD.xyz)-vD.w);}
 if(vE.w<9.){kf*=1.-smoothstep(-sw,sw,dot(nf,vE.xyz)-vE.w);kb*=1.-smoothstep(-sw,sw,dot(nb,vE.xyz)-vE.w);}
 float hole=0.;if(vC.y>0.){vec3 b=normalize(vec3(cos(vC.z)*.62,sin(vC.z)*.62,.5));float af=acos(clamp(dot(nf,b),-1.,1.)),ab=acos(clamp(dot(nb,b),-1.,1.));
  hole=kf*exp(-pow((af-vC.y)/.045,2.))+.6*kb*exp(-pow((ab-vC.y)/.045,2.));kf*=smoothstep(vC.y-.02,vC.y+.02,af);kb*=smoothstep(vC.y-.02,vC.y+.02,ab);}
 float t=uT+vC.w;vec3 L=normalize(vec3(-.5,-.62,.6));
 // the front film and the back film seen through it; each catches more light on the side it turns to the lamp
 vec3 rf=vec3(2.*z*q,2.*z*z-1.),rb=vec3(-2.*z*q,2.*z*z-1.);float lf=.55+.75*max(0.,dot(rf,L)),lb=.5+.8*max(0.,dot(rb,L));
 vec3 cf=bmbFilm(nf,z,seed,t,lf),cb=bmbFilm(nb,z,seed+.37,t,lb);vec3 col=cf*kf+cb*kb*.72;
 // the rim, where the film is seen edge-on, and the two reflections of the window (the back one smaller and upside down)
 float rim=smoothstep(.93,.995,r);col+=(cf+cb+vec3(.06))*rim*rim*1.1*max(kf,kb);
 vec3 W=normalize(vec3(.62,-.66,.42));float w1=bmbWindow(rf,W,.44)*kf,w2=bmbWindow(rb,W,.3)*kb;
 col+=(vec3(1.,.88,.96)+cf*1.5)*w1*.95+(vec3(.9,.85,1.)+cb)*w2*.3;col+=vec3(1.,.95,.9)*hole*2.2;
 o=vec4(col*uGain*vC.x*edge,0.);}`;
// The wall two joined bubbles share: a disc seen at an angle. A = x, y, radius, seed · B = normal (x, y, z), alpha · C = film time offset
export const BMB_FS_WALL=`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uT,uPx,uFreq,uSat,uF0,uGain;uniform vec3 uThick,uThick2;uniform vec2 uBand;uniform float uBands;out vec4 o;
${BMB_GLSL_FILM}
void main(){vec3 m=vB.xyz;float mz=max(.08,abs(m.z));vec2 d=vQ;float zz=-(m.x*d.x+m.y*d.y)/(m.z>=0.?mz:-mz);vec3 P=vec3(d,zz);float r=length(P),aa=1.5/(vA.z*uPx)/mz;if(r>1.+2.*aa){discard;}
 float edge=1.-smoothstep(1.-aa,1.+aa,r);vec3 c=bmbFilm(normalize(P+m*.6),mz,vA.w,uT+vC.x,1.);float ring=smoothstep(.8,.985,r);
 o=vec4((c*(.35+.9*(1.-mz))+(c+vec3(.08))*ring*ring*1.9)*uGain*vB.w*edge,0.);}`;
// A droplet or a spark: A = x, y, radius · B = colour (linear), alpha
export const BMB_FS_DOT=`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uPx;out vec4 o;
void main(){float r=length(vQ),aa=1.5/(vA.z*uPx);if(r>1.+aa){discard;}float e=1.-smoothstep(1.-aa,1.+aa,r),z=sqrt(max(0.,1.-r*r));
 float sp=pow(max(0.,dot(normalize(vec3(vQ,z)),normalize(vec3(-.45,-.55,.7)))),24.);o=vec4((vB.rgb*(.25+.9*smoothstep(.55,1.,r))+vec3(1.)*sp*1.5)*vB.a*e,0.);}`;
// Honey, caramel and syrup: the same matter for the ropes and the beads.
// n = normal (z to the eye), tk = thickness along the view (0–1), st = (across, along) for the streaks inside, sh = 0 deep in a pile …
// 1 on top, T = direction of the rope (0 for a bead): the lights stretch along it.
const BMB_GLSL_HONEY=`
uniform vec3 uSig,uGlow,uSpecCol;uniform float uT,uDepth,uOpac,uPass;
// A liquid is drawn twice: first it filters what is under it (uPass 0: each colour passes through the thickness as it does through
// the liquid itself, so what is seen through a rope is deeper and redder, and thin edges filter almost nothing), then it adds its own light
// (uPass 1).
vec3 bmbThrough(float tk,float sh,float tint){return .97*exp(-(uSig*mix(1.15,.8,tint)+.16)*tk*uDepth*mix(1.7,1.,sh)*uOpac);}
float bmbH21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float bmbVn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(bmbH21(i),bmbH21(i+vec2(1.,0.)),f.x),mix(bmbH21(i+vec2(0.,1.)),bmbH21(i+vec2(1.,1.)),f.x),f.y);}
vec3 bmbAlong(vec3 v,vec3 T){return normalize(v-T*dot(v,T));}
vec3 bmbHoney(vec3 n,float tk,vec2 st,float sh,vec3 T,float tint){
 vec3 Lk=normalize(vec3(-.5,-.62,.6)),Lr=normalize(vec3(.7,.45,.55)),V=vec3(0.,0.,1.);float rope=step(.5,dot(T,T));
 // what is seen through the liquid: a rope of liquid is a lens, and the lamps behind it show on its far side, bent and broken
 // into streaks that travel with the flow; the rest of the inside is the dim light that wanders in the liquid
 float s1=bmbVn(vec2(st.y*.22,st.x*1.6+3.)),s2=bmbVn(vec2(st.y*.9+7.,st.x*4.)),wv=s1*s2-.25,lens=mix(.8,2.3,bmbVn(vec2(st.y*.11+tint*7.,5.3)));
 float si=min(length(n.xy),.999),dl=min(2.6,2.*(asin(si)-asin(si/1.45))*lens);vec2 nh=n.xy/max(si,1e-4);vec3 E=vec3(-nh*sin(dl),-cos(dl));
 vec3 B1=normalize(vec3(-.62,-.7,-.35)),B2=normalize(vec3(.75,.5,-.42));B1=normalize(mix(B1,bmbAlong(B1,T),.55*rope));B2=normalize(mix(B2,bmbAlong(B2,T),.55*rope));
 float f1=dot(E,B1)+.3*wv,f2=dot(E,B2)+.25*wv,light=.08+.1*s1+.32*smoothstep(.2,.95,f1)+3.*smoothstep(.85,.95,f1)*(.55+.9*s2)+1.*smoothstep(.87,.96,f2);
 // the colour: pale where the liquid is thin, deep where it is thick or lies under other turns
 vec3 sig=uSig*mix(1.15,.8,tint);float dens=uDepth*mix(1.7,1.,sh);vec3 col=uGlow*exp(-sig*tk*dens)*light*mix(.3,1.,sh);
 // a darker line just inside the edge (the black around, bent by the liquid) and the bright thin edge itself
 float fr=pow(1.-n.z,3.);float dkb=smoothstep(.3,.72,1.-n.z)*(1.-smoothstep(.78,.96,1.-n.z));col*=1.-dkb*vec3(.28,.58,.75);col+=uGlow*vec3(.5,.3,.3)*fr*.55;
 // small bubbles of air caught in the liquid, carried by the flow (a few: each is a tiny lens with its own glint)
 if(rope>.5){vec2 g=vec2(st.y*.4,st.x*1.05+.37*floor(st.y*.4)+tint*5.),id=floor(g);float hb=bmbH21(id+tint*31.+.5);
  if(hb>.8){float rb=.09+.11*bmbH21(id+11.3);vec2 cb=id+.5+(vec2(bmbH21(id+3.1),bmbH21(id+7.7))-.5)*.5,dv=(g-cb)/vec2(.4,1.05);float cu=(cb.y-.37*id.x-tint*5.)/1.05,db=length(dv)/rb;
   if(db<1.&&abs(cu)+rb<.72){float zb=sqrt(1.-db*db);vec2 nb=dv/rb;col=col*(1.+.9*zb*zb)*(1.-.55*smoothstep(.72,.98,db))+uGlow*vec3(.6,.5,.4)*.35*smoothstep(.75,1.,db)*max(0.,dot(nb,vec2(.6,.7)))+uSpecCol*1.6*smoothstep(.93,.98,dot(normalize(vec3(nb,zb)),normalize(vec3(-.35,-.45,.82))));}}}
 // the lamps seen on the surface: a window with clean edges that runs along the rope and breaks where the rope turns towards
 // the lamp, a soft sheen around it, and a small warm lamp from below
 vec3 Hk=bmbAlong(normalize(Lk+V),T),Hr=bmbAlong(normalize(Lr+V),T);float dk=max(0.,dot(n,Hk)),dr=max(0.,dot(n,Hr));
 float al=abs(dot(T.xy,normalize(Lk.xy))),o1=smoothstep(.3,.6,bmbVn(vec2(st.y*.17+tint*17.,2.7)))*(1.-smoothstep(.3,.85,al));o1=mix(1.,o1,rope);
 float ar=abs(dot(T.xy,normalize(Lr.xy))),o2=mix(1.,smoothstep(.4,.7,bmbVn(vec2(st.y*.23+5.,9.1+tint*11.)))*(1.-smoothstep(.3,.85,ar)),rope),occ=smoothstep(.2,.62,sh);
 float d2=max(0.,dot(n,bmbAlong(normalize(vec3(-.2,-.75,.66)+V),T)));
 col+=uSpecCol*((smoothstep(.9955,.998,dk)*3.+pow(dk,120.)*.3)*o1+smoothstep(.9965,.9985,d2)*1.6*o1*o2)*occ;
 col+=uSpecCol*vec3(1.,.82,.55)*(smoothstep(.993,.997,dr)*1.1*o2+pow(dr,40.)*.06)*occ;
 return col;}`;
// A rope: the engine cuts it into pieces, one four-sided piece between each two points of its line. A = the two sides at the first
// point (x, y of one side, x, y of the other) · B = the same at the second point · C = how far across the rope each of those four
// corners is (±1 at the edge of the liquid, more in the soft shadow around it; less where a tight bend cuts the inner side short) ·
// D = along the rope (in radii, travelling with the flow) at both points, the radius at both · E = height in the pile at both, tint,
// shadow. The place of each pixel inside its piece is worked out exactly (the piece is not a rectangle), so nothing jumps from one
// piece to the next.
export const BMB_VS_SEG=`#version 300 es
layout(location=0) in vec2 aQ;layout(location=1) in vec4 aA;layout(location=2) in vec4 aB;layout(location=3) in vec4 aC;layout(location=4) in vec4 aD;layout(location=5) in vec4 aE;
uniform float uAR;out vec2 vP;flat out vec4 vA,vB,vC,vD,vE;
void main(){vec2 q=aQ*.5+.5,p=mix(mix(aA.xy,aA.zw,q.x),mix(aB.xy,aB.zw,q.x),q.y);vP=p;vA=aA;vB=aB;vC=aC;vD=aD;vE=aE;gl_Position=vec4(p.x/uAR*2.-1.,1.-p.y*2.,0.,1.);}`;
export const BMB_FS_ROPE=`#version 300 es
precision highp float;in vec2 vP;flat in vec4 vA,vB,vC,vD,vE;uniform float uPx,uSkirt;out vec4 o;
${BMB_GLSL_HONEY}
float bmbX(vec2 a,vec2 b){return a.x*b.y-a.y*b.x;}
void main(){vec2 a=vA.xy,b=vA.zw,d=vB.xy,c=vB.zw,e=b-a,f=d-a,g=a-b+c-d,h=vP-a;float k2=bmbX(g,f),k1=bmbX(e,f)+bmbX(h,g),k0=bmbX(h,e),t;
 if(abs(k2)<=1e-7*abs(k1)){t=abs(k1)>0.?-k0/k1:0.;}else{float w=sqrt(max(0.,k1*k1-4.*k0*k2)),q=-.5*(k1+(k1<0.?-w:w)),t1=abs(q)>0.?k0/q:0.,t2=q/k2;t=(t1>-.02&&t1<1.02)?t1:t2;}
 t=clamp(t,0.,1.);vec2 A=mix(a,d,t),AB=mix(b,c,t)-A;float l2=max(dot(AB,AB),1e-12),s=clamp(dot(vP-A,AB)/l2,0.,1.);
 float u=mix(mix(vC.x,vC.z,t),mix(vC.y,vC.w,t),s),au=abs(u),W=mix(vD.z,vD.w,t),aa=1.2/max(1.,W*uPx);
 if(au>1.){float k=clamp(1.-(au-1.)/(uSkirt-1.),0.,1.);o=uPass<.5?vec4(vec3(1.-.5*k*k*vE.w),1.):vec4(0.);return;}
 vec2 N=AB/sqrt(l2);float z=sqrt(max(0.,1.-u*u));vec3 n=normalize(vec3(N*u,z)),T=vec3(-N.y,N.x,0.);
 float ed=1.-smoothstep(1.-aa,1.,au),sh=mix(vE.x,vE.y,t);if(uPass<.5){o=vec4(mix(vec3(1.),bmbThrough(z,sh,vE.z),ed),1.);return;}
 o=vec4(bmbHoney(n,z,vec2(u,mix(vD.x,vD.y,t)),sh,T,vE.z)*ed,0.);}`;
// A bead of honey: A = x, y, radius, seed · B = alpha, height in the pile (shade), tint, direction of its tail · C = how long the tail is
export const BMB_FS_BEAD=`#version 300 es
precision highp float;in vec2 vQ;flat in vec4 vA,vB,vC,vD,vE;uniform float uPx;out vec4 o;
${BMB_GLSL_HONEY}
void main(){vec2 q=vQ;float c=cos(vB.w),s=sin(vB.w);vec2 l=vec2(c*q.x+s*q.y,-s*q.x+c*q.y);float tl=vC.x,aa=1.5/(vA.z*uPx),rr,tk;vec3 nl;
 // a round drop, or a drop with a tail (the half that looks back narrows to a point)
 if(l.x<=0.||tl<=0.){float r2=dot(l,l);rr=sqrt(r2);tk=sqrt(max(0.,1.-r2));nl=vec3(l,tk);}
 else{float sx=l.x/(1.+tl),w=max(1e-3,sqrt(max(0.,1.-sx*sx))*mix(1.,1.-sx,min(1.,tl))),ey=l.y/w;rr=sx>=1.?2.:1.+(abs(ey)-1.)*w;float zc=sqrt(max(0.,1.-ey*ey));tk=zc*w;nl=normalize(vec3(.35*sx,ey,zc));}
 if(rr>1.+2.*aa){discard;}vec3 n=normalize(vec3(c*nl.x-s*nl.y,s*nl.x+c*nl.y,nl.z));
 float ed=(1.-smoothstep(1.-aa,1.+aa,rr))*vB.x;if(uPass<.5){o=vec4(mix(vec3(1.),bmbThrough(tk,vB.y,vB.z),ed),1.);return;}
 o=vec4(bmbHoney(n,tk,vec2(q.x*2.+vA.w*9.,q.y*2.+uT*.3),vB.y,vec3(0.),vB.z)*ed,0.);}`;
// noise for the stimuli: smooth random values read from the engine's picture of random numbers (four at a time), and their sum
// at five sizes
export const BMB_GLSL_NOISE=`
uniform sampler2D uNoise;
vec4 bmbN4(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return texture(uNoise,(i+f+.5)/256.);}
float bmbFbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*bmbN4(p).r;p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(17.3,9.1);a*=.5;}return s/.96875;}`;
export const BMB_FS_COPY=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS;out vec4 o;void main(){o=texture(uS,vUv);}`;
// the glow: the picture made smaller and softer five times, then added back
export const BMB_FS_DOWN=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS;uniform vec2 uTx;out vec4 o;
void main(){vec3 c=texture(uS,vUv+uTx*vec2(-1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(-1.,1.)).rgb+texture(uS,vUv+uTx*vec2(1.,1.)).rgb;o=vec4(c*.25,1.);}`;
export const BMB_FS_UP=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS,uB;uniform vec2 uTx;uniform float uMix;out vec4 o;
void main(){vec3 c=texture(uS,vUv+uTx*vec2(-1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(1.,-1.)).rgb+texture(uS,vUv+uTx*vec2(-1.,1.)).rgb+texture(uS,vUv+uTx*vec2(1.,1.)).rgb;
 o=vec4(mix(texture(uB,vUv).rgb,c*.25,uMix),1.);}`;
// to the screen: glow added, light pressed into the range of the screen (each channel 1 − e^−x), dimmed while waiting, sRGB
export const BMB_FS_FINAL=`#version 300 es
precision highp float;in vec2 vUv;uniform sampler2D uS,uB;uniform float uBloom,uExp,uDim;out vec4 o;
void main(){vec3 c=texture(uS,vUv).rgb+texture(uB,vUv).rgb*uBloom;c=1.-exp(-max(c,vec3(0.))*uExp);c*=uDim;
 o=vec4(pow(c,vec3(1./2.2)),1.);}`;

#version 300 es
precision highp float;
// El pou del temps (CE37, 0.31): shared pieces of every shader. A column of rock that the camera goes down, back in time: each press
// opens a deeper, older layer, and there the fossil wakes (a window of life opens in the rock around the animal and its flesh grows out
// from the bones). Style «diorama de museu viu»: a painted backdrop and modelled animals with relief, rim light and a dark contour.
// Screen p: y in [-.5,.5]. World: x across, y up (deeper is older); a pixel at p sees L = camera + p · Z (Z: the screen height in world
// units). A scene is drawn in its own frame q = (L - its centre) / its height (screen units when the camera rests on it).
uniform vec2 uR;      // size in pixels
uniform vec3 uCam;    // camera centre (x, y) and height (the screen height in world units)
uniform float uG;     // clock of the world (dust, idle motion)
uniform float uDecor,uOpacity,uBase; // decor 0 full, 1 dim, 2 none; opacity of the dim decor; base 0 black, 1 white
uniform float uMove;  // how fast the camera is travelling (0 .. 1): the dust of the travelling
out vec4 OF;
#define TAU 6.2831853
#define PI 3.1415927
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h11(float x){return h21(vec2(x,x*1.37+.5));}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.3));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s/.9375;}
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<2;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s/.75;}
float ss(float a,float b,float x){return smoothstep(a,b,x);}
// rot(a) turns a point by -a (so rot(a)*(p - c) is p seen from a frame turned by +a).
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sat(float x){return clamp(x,0.,1.);}
vec2 pScreen(){return (gl_FragCoord.xy-.5*uR)/uR.y;}
float sdEll(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=sat(dot(pa,ba)/dot(ba,ba));return length(pa-ba*h);}
float segU(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return sat(dot(pa,ba)/dot(ba,ba));}
// A tapered segment: radius ra at a, rb at b.
float sdCap(vec2 p,vec2 a,vec2 b,float ra,float rb){float u=segU(p,a,b);return length(p-mix(a,b,u))-mix(ra,rb,u);}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
// A quadratic Bézier tube from a to c (control b), radius ra at a and rb at c, as 10 segments; tt: its parameter at the nearest point.
float sdTube(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rb,out float tt){float d=1e5;tt=0.;vec2 o=a;
 for(int i=1;i<=10;i++){float t=float(i)/10.;vec2 n=mix(mix(a,b,t),mix(b,c,t),t);float u=segU(p,o,n),tu=(float(i-1)+u)/10.;
  float e=length(p-mix(o,n,u))-mix(ra,rb,tu);if(e<d){d=e;tt=tu;}o=n;}return d;}
// The nearest two distances to random points of a grid (cell size 1): F1, F2, and the id of the nearest cell.
vec3 voro(vec2 p,out vec2 cid){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;cid=i;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=g+.15+.7*h22(i+g)-f;float d=dot(o,o);if(d<a){b=a;a=d;cid=i+g;}else if(d<b)b=d;}
 return vec3(sqrt(a),sqrt(b),0.);}
// Locks of hair (or rows of feathers), in the frame pd = (along the hair, across it): two staggered layers of locks, each tapering to a
// point at its tip. Returns: x the shading across the top lock (0 at its edges, 1 in its middle), y an id, z how far along it (0 root,
// 1 tip), w how much of the darker under-coat shows (between locks).
vec4 locks(vec2 pd,float across,float along){vec4 r=vec4(0.,0.,0.,1.);
 for(int L=0;L<2;L++){float fl=float(L);float cy=pd.y*across+fl*.5;float ci=floor(cy);float cx=pd.x*along+h11(ci*1.3+fl*7.)*4.;float cj=floor(cx),fx=fract(cx);
  float fc=fract(cy)-.5-.18*fx*sin(ci*2.1+cj);float w=.5*(1.-.8*fx*fx);float ins=ss(w,w-.14,abs(fc));
  if(ins>.001){float pr=sat(1.-abs(fc)/max(w,.01));r=mix(r,vec4(pr,h21(vec2(ci,cj)+fl*3.),fx,0.),ins);}}
 return r;}
// The clock of a scene as its fossil wakes: it starts slowly and then runs at the normal speed (t - .3 after .6 s).
float wake(float t){float u=sat(t/.6);return t<.6?.6*(u*u*u-u*u*u*u/2.):t-.3;}

// ---- The picture so far, and the frame of the pixel ----
// F: what this shader has drawn so far, premultiplied. PX: the size of a pixel in the units of the frame being drawn. P: the screen point.
vec4 F=vec4(0.);float PX;vec2 P;
// The light of the scene being drawn: direction towards it (z: towards the viewer), its colour, the ambient light, and BACK: how much
// the sun is behind the subject (0 .. 1), which lights thin things from behind (membranes, ears, the fringe of fur).
vec3 SUNL=vec3(-.45,.55,.70),SUNC=vec3(1.05,1.,.92),AMBC=vec3(.55,.55,.58);float BACK=0.;
vec3 baseCol(){return uBase>.5?vec3(.86,.85,.82):vec3(0.);}
float cov(float d){return ss(PX,-PX,d);}
const vec3 INK=vec3(.075,.062,.055);
// Kinds of surface (each has its own painted texture in styleA).
const int K_SKY=0,K_FAR=1,K_SNOW=2,K_GRASS=3,K_ROCK=4,K_FOSSIL=5,K_BONE=6,K_SKIN=7,K_WOOL=8,K_SCALE=9,K_FUZZ=10,K_IVORY=11,K_PLANT=12,
 K_WATER=13,K_MUD=14,K_EYE=15,K_FUR=16,K_FEATHER=17,K_MEMBRANE=18,K_HORN=19,K_PLATE=20,K_SHELL=21,K_LEAF=22,K_BARK=23,K_SAND=24,K_SMOOTH=25,K_FLAT=26;
// The normal of a rounded piece seen from the front: a dome of radius R from its edge (d: its distance, negative inside; g: the screen
// gradient of d). The tilt is capped so that coarse gradients do not make steps along the edges.
vec3 nrm(float d,vec2 g,float R){vec2 n2=g/max(length(g),1e-9);float t=.82*sat(1.+d/max(R,1e-4));return normalize(vec3(n2*t,sqrt(max(1.-t*t,0.))+.04));}
float lambert(vec3 n){return sat((dot(n,SUNL)+.3)/1.3);}
// A black base under a dimmed or absent decor: the darks of the animals are lifted and their contour is light.
bool DARKBASE(){return uBase<.5&&uDecor>.5;}
// How much of a texture of a given frequency (features per unit of u) can be shown at this pixel: fine textures fade into their tone
// when their features get smaller than about two pixels (no shimmer, no moiré).
float LODU=0.;
float lodk(float freq){return ss(.55,.18,LODU*freq);}
// An anisotropic highlight along a direction (hair, feathers, horn): strong where the fibre is across the half vector.
float aniso(vec2 dir,float pw){vec3 T=normalize(vec3(dir,.15)),H=normalize(SUNL+vec3(0,0,1));float th=dot(T,H);return pow(sqrt(max(0.,1.-th*th)),pw);}

// ---- Style A: a painted diorama. Modelled light on every piece, fine painted textures, a dark painted contour. ----
// d: distance (negative inside), n: normal, alb: colour, k: kind, u: texture coordinates that move with the piece, dir: the direction
// of its hair, feathers or fibres, line: how much contour.
vec3 styleA(float d,vec3 n,vec3 alb,int k,vec2 u,vec2 dir,float line){
 vec2 pp=vec2(-dir.y,dir.x);vec2 pd=vec2(dot(u,dir),dot(u,pp));vec3 spec=vec3(0.);float trans=0.;
 if(k==K_SKY||k==K_FAR){float b=fbm(rot(.25)*u*vec2(2.2,11.))-.5,b2=vn(rot(-.2)*u*vec2(6.,40.))-.5;vec3 c=alb*(1.+b*.10+b2*.04*lodk(40.));
  if(k==K_FAR)c*=.97+.06*fbm(u*9.);return c;}
 if(k==K_FLAT){return alb*(AMBC*.6+SUNC*.5);}
 if(k==K_WOOL){float l=lodk(70.);vec2 pw=pd+.03*vec2(fbm2(u*5.)-.5,fbm2(u*5.+5.)-.5);vec4 L=locks(pw,70.,5.);L=mix(vec4(.6,.5,.4,.2),L,l);
  float st=vn(vec2(pw.x*30.,pw.y*900.)),st2=vn(vec2(pw.x*60.,pw.y*1700.)+4.);float lf=lodk(900.);st=mix(.5,st,lf);st2=mix(.5,st2,lf);float big=fbm2(u*6.);
  vec3 lk=alb*(.84+.26*L.x)*(.90+.20*L.y)*(.88+.24*mix(st,st2,.5))*(.85+.3*big);lk=mix(lk,alb*1.55+.02,ss(.6,1.,L.z)*.30*L.x);
  alb=mix(lk,alb*.66*(.85+.3*big),L.w*.8);
  spec=SUNC*aniso(dir,50.)*.12*L.x*(1.-L.w)*st;trans=.35;
  n=normalize(n+vec3(pp*(L.x-.5)*.35,0.)*(1.-L.w)*l);}
 else if(k==K_FUR){float l=lodk(500.);float s1=vn(vec2(pd.x*35.,pd.y*520.)),s2=vn(vec2(pd.x*70.,pd.y*1100.)+3.);float big=fbm2(u*7.);
  alb*=(.80+.30*mix(.5,mix(s1,s2,.5),l))*(.88+.24*big);spec=SUNC*aniso(dir,40.)*.10*mix(.5,s1,l);trans=.30;}
 else if(k==K_FEATHER){float l=lodk(40.);vec2 pw=pd+.015*vec2(fbm2(u*6.)-.5,0.);vec4 L=locks(pw,40.,7.);L=mix(vec4(.6,.5,.4,.15),L,l);
  float barb=.5+.5*sin((pw.y*40.*TAU*6.)+L.x*9.+(1.-L.z)*14.);float lb=lodk(1200.);
  float rach=ss(.10,.0,abs(L.x-1.))*l;alb*=(.82+.22*L.x)*(.92+.14*L.y)*mix(1.,.86+.2*barb,lb);alb=mix(alb,alb*.62,L.w*.7);alb=mix(alb,alb*1.25+.02,rach*.5);
  spec=SUNC*aniso(dir,60.)*.16*L.x*(1.-L.w);trans=.25;n=normalize(n+vec3(pp*(L.x-.5)*.25,0.)*(1.-L.w)*l);}
 else if(k==K_SCALE){float l=lodk(1.);vec2 id;vec3 v=voro(u,id);float e=v.y-v.x,hh=h21(id);alb*=mix(1.,.78+.34*hh,l);
  float dome=sat(1.-v.x*1.6);n=normalize(n+vec3((h22(id)-.5)*.18,0.)*dome*l);alb*=mix(1.,mix(.66,1.,ss(.0,.14,e)),l);alb*=mix(1.,.90+.18*dome,l);}
 else if(k==K_PLATE){float l=lodk(1.);vec2 id;vec3 v=voro(u,id);float e=v.y-v.x,hh=h21(id);float ring=.5+.5*sin(v.x*38.);
  alb*=mix(1.,(.80+.30*hh)*(.92+.10*ring*lodk(12.)),l);alb*=mix(1.,mix(.55,1.,ss(.0,.10,e)),l);alb=mix(alb,alb*1.18,ss(.10,.02,e)*l*.6);
  float dome=sat(1.-v.x*1.2);n=normalize(n+vec3((h22(id)-.5)*.30,0.)*dome*l);}
 else if(k==K_SKIN){float w=vn(vec2(pd.x*110.,pd.y*14.)),w2=vn(u*60.);float l=lodk(110.);alb*=.80+.28*mix(.5,w2,lodk(60.));alb*=mix(1.,mix(.62,1.,ss(.08,.3,abs(w-.5))),l);}
 else if(k==K_SMOOTH){float w=fbm(u*8.);alb*=.92+.14*w;spec=SUNC*pow(sat(dot(reflect(-SUNL,n),vec3(0,0,1))),24.)*.22;}
 else if(k==K_FUZZ){float l=lodk(240.);float f=fbm(u*240.),f2=vn(u*700.);alb*=mix(1.,.70+.5*f+.15*f2*lodk(700.),l);trans=.45;}
 else if(k==K_MEMBRANE){float l=lodk(60.);float v=vn(vec2(pd.x*6.,pd.y*60.));float fib=vn(vec2(pd.x*200.,pd.y*12.));
  alb*=.88+.16*mix(.5,fib,lodk(200.));alb*=mix(1.,mix(.80,1.,ss(.04,.12,abs(v-.5))),l);trans=.9;}
 else if(k==K_HORN||k==K_IVORY){float f=vn(vec2(pd.x*8.,pd.y*180.)),f2=sin(pd.x*90.+vn(u*30.)*3.);alb*=(.88+.16*mix(.5,f,lodk(180.)))*(.96+.05*f2);
  spec=SUNC*aniso(dir,30.)*.18;}
 else if(k==K_SHELL){float b=vn(u*160.),b2=vn(u*420.);float l=lodk(160.);alb*=.92+.10*mix(.5,b,l)+.05*mix(.5,b2,lodk(420.));
  n=normalize(n+vec3(vec2(vn(u*160.+3.)-.5,vn(u*160.+9.)-.5)*.25*l,0.));spec=SUNC*pow(sat(dot(reflect(-SUNL,n),vec3(0,0,1))),18.)*.10;}
 else if(k==K_BONE||k==K_FOSSIL){float po=vn(u*300.),cr=abs(vn(u*24.)-.5);alb*=.86+.22*mix(.5,po,lodk(300.));alb*=mix(.7,1.,ss(.0,.04,cr));}
 else if(k==K_SNOW){float s=fbm(u*14.);alb*=.92+.12*s;float gl=step(.996,h21(floor(u*900.)))*lodk(900.);spec=SUNC*gl*.25*lambert(n);}
 else if(k==K_GRASS){float s=vn(vec2(u.x*260.,u.y*16.));alb*=.62+.62*mix(.5,s,lodk(260.));}
 else if(k==K_PLANT){float s=vn(vec2(pd.x*30.,pd.y*120.));alb*=.8+.3*mix(.5,s,lodk(120.));trans=.4;}
 else if(k==K_LEAF){float vein=abs(fract(pd.y*14.+abs(pd.x)*4.)-.5);float mid=ss(.012,.0,abs(pd.y));alb*=.86+.14*vn(u*40.);alb=mix(alb,alb*1.25,(ss(.06,.0,vein)*.35*lodk(28.)+mid*.4));
  spec=SUNC*pow(sat(dot(reflect(-SUNL,n),vec3(0,0,1))),16.)*.10;trans=.5;}
 else if(k==K_BARK){float f=vn(vec2(pd.x*10.,pd.y*90.)),f2=fbm(u*30.);alb*=.70+.38*mix(.5,f,lodk(90.))*(.7+.6*f2);}
 else if(k==K_SAND){float g=vn(u*500.),g2=fbm(u*20.);alb*=.88+.14*g2+.10*(mix(.5,g,lodk(500.))-.5);}
 else if(k==K_ROCK){float g1=fbm(u*38.),g2=vn(u*420.);alb*=.80+.28*g1+.12*(mix(.5,g2,lodk(420.))-.5);}
 else if(k==K_MUD){alb*=.78+.35*fbm(u*30.);}
 else if(k==K_WATER){alb*=.95+.08*mix(.5,vn(vec2(u.x*20.,u.y*160.)),lodk(160.));}
 float lam=lambert(n);vec3 c=alb*(AMBC*(.55+.45*n.z)+SUNC*lam*.85)+spec;
 if(k==K_WATER||k==K_EYE)c=alb*(AMBC*.5+SUNC*.6);
 // light through thin things when the sun is behind (membranes, fringes of fur, leaves, ears)
 c+=SUNC*alb*trans*BACK*.55*(.5+.5*(1.-n.z));
 // light that comes round the edge when the sun is low behind
 float rim=pow(sat(1.-n.z),3.)*sat(dot(normalize(n.xy+1e-6),normalize(SUNL.xy+1e-6)));c+=SUNC*alb*rim*.55*(k==K_WOOL||k==K_FUZZ||k==K_FUR||k==K_FEATHER?1.4:.8);
 // the contour: dark; on a black base without the full decor, a light line instead, so dark animals do not vanish
 c=mix(c,DARKBASE()?alb*.45+vec3(.16,.15,.14):alb*.16,line*ss(-PX*2.6,-PX*.6,d));
 return c;}
// One piece: d its distance (negative inside), g its screen gradient, alb its colour, k its kind, u coordinates that move with it (for
// its texture), dir the direction of its hair or fibres, R its roundness (how far in from the edge the relief rises), line how much dark
// contour, dec 1 if it is decor (the decor setting dims it towards the base, or leaves it out).
void piece(float d,vec2 g,vec3 alb,int k,vec2 u,vec2 dir,float R,float line,float dec){
 if(!(d<=PX*4.))return;if(dec>.5&&uDecor>1.5)return; // (written so that a distance that is not a number is also skipped)
 LODU=length(fwidth(u));
 vec3 n=nrm(d,g,R);vec3 c=styleA(d,n,alb,k,u,dir,line);float a=cov(d);
 if(dec>.5&&uDecor>.5)c=mix(baseCol(),c,uOpacity);
 if(dec<.5&&DARKBASE())c=max(c,alb*.30+.025);
 a=sat(a);F=vec4(c,1.)*a+F*(1.-a);}
#define PIECE(d,alb,k,u,dir,R,line,dec) {float d_=(d);piece(d_,vec2(dFdx(d_),dFdy(d_)),alb,k,u,dir,R,line,dec);}
// Something soft over the picture (vapour, mist, dust, spray): mixes towards c by a.
void veil(vec3 c,float a,float dec){if(a<=.001)return;if(dec>.5&&uDecor>1.5)return;if(dec>.5&&uDecor>.5){c=mix(baseCol(),c,uOpacity);}a=sat(a);F=vec4(c,1.)*a+F*(1.-a);}
// A shadow that darkens what is already there (dec: it falls on decor, so it fades with it).
void shadow(float a,vec3 tint,float dec){if(a<=.001)return;if(dec>.5){if(uDecor>1.5)return;if(uDecor>.5)a*=uOpacity;}F.rgb*=mix(vec3(1.),tint,sat(a));}
// Light added (a glint, a glow of amber): it fades with the decor when dec is 1.
void glow(vec3 e,float dec){if(dec>.5){if(uDecor>1.5)return;if(uDecor>.5)e*=uOpacity;}F.rgb+=e*F.a;}

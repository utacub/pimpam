#version 300 es
precision highp float;
// El pou del temps (CE37), style tests: one picture of a column of rock that the camera goes down, back in time. Each scene is a window
// in the rock: on arrival the fossil wakes (a wave of life opens the rock around the animal, then flesh grows out from the bones);
// on leaving it turns back to stone. Three styles of the same drawing: 0 A «diorama de museu viu» (painted backdrop, modelled
// animals), 1 B «làmina de naturalista» (ink and watercolour on cream paper), 2 C «tapís brodat» (stitches on linen).
// Screen p: y in [-.5,.5]. World W = p + (0, camera y). Scene k sits at world y = -2.2 k; its own frame q = W - (0, -2.2 k).
uniform vec2 uR;        // size in pixels
uniform float uCamY;    // camera y in the world
uniform vec2 uTau;      // the clock of scene 0 (mammoths) and scene 1 (tyrannosaurs), seconds since its press
uniform vec2 uLife;     // the life of each scene: 0 stone .. 1 alive
uniform float uStyle;   // 0 A, 1 B, 2 C
uniform float uDecor,uOpacity,uBase; // decor 0 full, 1 dim, 2 none; opacity of the dim decor; base 0 black, 1 white
uniform float uDark;    // the darkening while waiting (0 .. .85)
uniform float uMove;    // how fast the camera is going (0 .. 1), for the dust of the travelling
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
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sat(float x){return clamp(x,0.,1.);}
float sdEll(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=sat(dot(pa,ba)/dot(ba,ba));return length(pa-ba*h);}
float segU(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return sat(dot(pa,ba)/dot(ba,ba));}
float sdCap(vec2 p,vec2 a,vec2 b,float ra,float rb){float u=segU(p,a,b);return length(p-mix(a,b,u))-mix(ra,rb,u);}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
// A quadratic Bézier tube from a to c (control b), radius ra at a and rb at c, sampled as 6 segments; its parameter at the nearest point.
float sdTube(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rb,out float tt){float d=1e5;tt=0.;vec2 o=a;
 for(int i=1;i<=10;i++){float t=float(i)/10.;vec2 n=mix(mix(a,b,t),mix(b,c,t),t);float u=segU(p,o,n),tu=(float(i-1)+u)/10.;
  float e=length(p-mix(o,n,u))-mix(ra,rb,tu);if(e<d){d=e;tt=tu;}o=n;}return d;}
// The nearest two distances to random points of a grid (cell size 1): F1, F2 and the id of the nearest cell.
vec3 voro(vec2 p,out vec2 cid){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;cid=i;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=g+.15+.7*h22(i+g)-f;float d=dot(o,o);if(d<a){b=a;a=d;cid=i+g;}else if(d<b)b=d;}
 return vec3(sqrt(a),sqrt(b),0.);}
// Locks of hair, in the frame pd = (along the hair, across it): two staggered layers of locks, each tapering to a point at its tip.
// Returns: x the shading across the top lock (0 at its edges, 1 in its middle), y an id, z how far along it (0 root, 1 tip), w how
// much of the darker under-coat shows (between locks).
vec4 locks(vec2 pd,float across,float along){vec4 r=vec4(0.,0.,0.,1.);
 for(int L=0;L<2;L++){float fl=float(L);float cy=pd.y*across+fl*.5;float ci=floor(cy);float cx=pd.x*along+h11(ci*1.3+fl*7.)*4.;float cj=floor(cx),fx=fract(cx);
  float fc=fract(cy)-.5-.18*fx*sin(ci*2.1+cj);float w=.5*(1.-.8*fx*fx);float ins=ss(w,w-.14,abs(fc));
  if(ins>.001){float pr=sat(1.-abs(fc)/max(w,.01));r=mix(r,vec4(pr,h21(vec2(ci,cj)+fl*3.),fx,0.),ins);}}
 return r;}
float wake(float t){float u=sat(t/.6);return t<.6?.6*(u*u*u-u*u*u*u/2.):t-.3;}

// ---- The picture so far, and the frame of the pixel ----
// F: what this pass has drawn so far, premultiplied (the passes are blended over each other).
vec4 F=vec4(0.);float PX;vec2 P;const int ST=STYLE;
// the light of the scene being drawn: direction towards it, its colour, the ambient light
vec3 SUNL=vec3(0.,0.,1.),SUNC=vec3(1.),AMBC=vec3(.5);
vec3 baseCol(){return uBase>.5?vec3(.86,.85,.82):vec3(0.);}
float cov(float d){return ss(PX,-PX,d);}
const vec3 INK=vec3(.075,.062,.055);
// kinds of surface
const int K_SKY=0,K_FAR=1,K_SNOW=2,K_GRASS=3,K_ROCK=4,K_FOSSIL=5,K_BONE=6,K_SKIN=7,K_WOOL=8,K_SCALE=9,K_FUZZ=10,K_IVORY=11,K_PLANT=12,K_WATER=13,K_MUD=14,K_EYE=15;

// The normal of a rounded piece seen from the front: a dome of radius R from its edge (d: its distance, negative inside; g: the
// screen gradient of d).
vec3 nrm(float d,vec2 g,float R){vec2 n2=g/max(length(g),1e-9);float t=.82*sat(1.+d/max(R,1e-4));return normalize(vec3(n2*t,sqrt(max(1.-t*t,0.))+.04));}
float lambert(vec3 n){return sat((dot(n,SUNL)+.3)/1.3);}

#if STYLE==0
// ---- Style A: a painted diorama. Modelled light on every piece, fine painted textures, a dark painted contour. ----
vec3 styleA(float d,vec3 n,vec3 alb,int k,vec2 u,vec2 dir,float line){
 vec2 pp=vec2(-dir.y,dir.x);vec2 pd=vec2(dot(u,dir),dot(u,pp));vec3 spec=vec3(0.);
 if(k==K_SKY||k==K_FAR){float b=fbm(rot(.25)*u*vec2(2.2,11.))-.5,b2=vn(rot(-.2)*u*vec2(6.,40.))-.5;vec3 c=alb*(1.+b*.10+b2*.04);
  if(k==K_FAR)c*=.97+.06*fbm(u*9.);return c;}
 if(k==K_WOOL){vec2 pw=pd+.03*vec2(fbm2(u*5.)-.5,fbm2(u*5.+5.)-.5);vec4 L=locks(pw,70.,5.);
  float st=vn(vec2(pw.x*30.,pw.y*900.)),st2=vn(vec2(pw.x*60.,pw.y*1700.)+4.);float big=fbm2(u*6.);
  vec3 lk=alb*(.84+.26*L.x)*(.90+.20*L.y)*(.88+.24*mix(st,st2,.5))*(.85+.3*big);lk=mix(lk,alb*1.55+.02,ss(.6,1.,L.z)*.30*L.x);
  alb=mix(lk,alb*.66*(.85+.3*big),L.w*.8);
  vec3 T=normalize(vec3(dir,.2)),H=normalize(SUNL+vec3(0,0,1));float th=dot(T,H);spec=SUNC*pow(sqrt(max(0.,1.-th*th)),50.)*.12*L.x*(1.-L.w)*st;
  n=normalize(n+vec3(pp*(L.x-.5)*.35,0.)*(1.-L.w));}
 else if(k==K_SCALE){vec2 id;vec3 v=voro(u,id);float e=v.y-v.x,hh=h21(id);alb*=.78+.34*hh;
  float dome=sat(1.-v.x*1.6);n=normalize(n+vec3((h22(id)-.5)*.18,0.)*dome);alb*=mix(.66,1.,ss(.0,.14,e));alb*=.90+.18*dome;}
 else if(k==K_SKIN){float w=vn(vec2(pd.x*110.,pd.y*14.)),w2=vn(u*60.);alb*=.80+.28*w2;alb*=mix(.62,1.,ss(.08,.3,abs(w-.5)));}
 else if(k==K_FUZZ){float f=fbm(u*240.),f2=vn(u*700.);alb*=.70+.5*f+.15*f2;}
 else if(k==K_IVORY){alb*=.93+.07*sin(pd.x*90.+vn(u*30.)*3.);float th=dot(normalize(vec3(dir,0.)),normalize(SUNL+vec3(0,0,1)));spec=SUNC*pow(sqrt(max(0.,1.-th*th)),30.)*.18;}
 else if(k==K_BONE||k==K_FOSSIL){float po=vn(u*300.),cr=abs(vn(u*24.)-.5);alb*=.86+.22*po;alb*=mix(.7,1.,ss(.0,.04,cr));}
 else if(k==K_SNOW){float s=fbm(u*14.);alb*=.92+.12*s;float gl=step(.996,h21(floor(u*900.)));spec=SUNC*gl*.25*lambert(n);}
 else if(k==K_GRASS){float s=vn(vec2(u.x*260.,u.y*16.));alb*=.62+.62*s;}
 else if(k==K_PLANT){float s=vn(vec2(pd.x*30.,pd.y*120.));alb*=.8+.3*s;}
 else if(k==K_ROCK){float g1=fbm(u*38.),g2=vn(u*420.);alb*=.80+.28*g1+.12*(g2-.5);}
 else if(k==K_MUD){alb*=.78+.35*fbm(u*30.);}
 else if(k==K_WATER){alb*=.95+.08*vn(vec2(u.x*20.,u.y*160.));}
 float lam=lambert(n);vec3 c=alb*(AMBC*(.55+.45*n.z)+SUNC*lam*.85)+spec;
 if(k==K_WATER||k==K_EYE)c=alb*(AMBC*.5+SUNC*.6);
 // light that comes round the edge when the sun is low behind
 float rim=pow(sat(1.-n.z),3.)*sat(dot(normalize(n.xy+1e-6),normalize(SUNL.xy+1e-6)));c+=SUNC*alb*rim*.55*(k==K_WOOL||k==K_FUZZ?1.4:.8);
 c=mix(c,alb*.16,line*ss(-PX*2.6,-PX*.6,d));
 return c;}

#endif
#if STYLE==1
// ---- Style B: a naturalist's plate. Cream paper; washes of watercolour that pool at their edges and granulate; an ink line that
// swells and thins; ink hatching in the shadows; ink strokes for hair and fine circles for scales. ----
vec3 paperB(vec2 u){float f=(vn(u*vec2(170.,150.))-.5)*.6+(vn(u*vec2(520.,470.))-.5)*.4;return vec3(.975,.945,.875)*(1.+f*.05)*(1.-.04*fbm2(u*3.));}
float hatch(float s,vec2 dirH,float fr){float v=abs(fract(dot(P,dirH)*fr)-.5)*2.;return ss(.42*s+.05,.42*s-.05,v)*ss(.0,.1,s);}
vec3 styleB(float d,vec3 n,vec3 alb,int k,vec2 u,vec2 dir,float line,out float a){
 vec3 pap=paperB(P+vec2(0.,uCamY));float lam=lambert(n);
 vec2 pp=vec2(-dir.y,dir.x);vec2 pd=vec2(dot(u,dir),dot(u,pp));
 // the wash does not quite follow the ink line
 float dw=d+.0045*(fbm2(u*22.)-.55)*2.;
 float bl=fbm(u*3.5+alb.r*7.);float kd=(k==K_SKY?.26:k==K_FAR?.36:.55)+.30*(bl-.5);kd+=.10*ss(.02,.0,abs(bl-.55));
 kd+=.38*ss(-.014,0.,dw);                      // the pigment pools at the edge of the wet patch
 kd*=.84+.32*vn(u*380.+3.);                     // granulation
 float sh=1.-lam;if(k!=K_SKY&&k!=K_FAR)kd+=sh*.55; // a second, darker glaze in the shade
 vec3 pig=pow(max(alb,vec3(.001)),vec3(.85));
 if(k==K_SNOW){kd=.18+.45*sh;pig=vec3(.70,.78,.92);}
 if(k==K_WATER){kd+=.1;}
 vec3 c=pap*mix(vec3(1.),pig,sat(kd));
 a=ss(PX*1.2,-PX*1.2,dw);
 if(k==K_SKY){a=1.;return c;}
 if(k==K_FAR){float wl=PX*(.6+1.2*vn(u*8.));c=mix(c,mix(INK,pig*.4,.5),ss(wl+PX*.8,wl-PX*.3,abs(d+wl))*line*3.);a=max(a,ss(PX*1.2,-PX*1.2,dw));return c;}
 // ink: the contour
 float ink=0.;
 float wl=PX*(.45+1.5*vn(u*6.+3.)+.9*sh)*max(line,.4);
 ink=max(ink,ss(wl+PX*.8,wl-PX*.3,abs(d+wl*.6))*step(.05,line));
 // hatching in the shade (one direction; a second across it in the deepest shade)
 if(k!=K_SNOW&&k!=K_WATER&&k!=K_EYE){ink=max(ink,hatch(ss(.42,.95,sh)*.55,vec2(.70,.71),150.)*.85*line*ss(.0,-.004,d));
  ink=max(ink,hatch(ss(.70,1.,sh)*.45,vec2(-.70,.71),150.)*.7*line*ss(.0,-.004,d));}
 if(k==K_WOOL){vec2 pw=pd+.012*vec2(fbm2(u*7.)-.5,fbm2(u*7.+5.)-.5);vec4 L=locks(pw,40.,6.);
  float edge=ss(.30,.0,L.x)*(1.-L.w)*step(.30-.25*sh,h21(vec2(L.y,3.)));float tipl=ss(.75,.95,L.z)*ss(.5,.2,L.x);
  ink=max(ink,max(edge,tipl)*(.45+.5*sh));kd+=L.w*.25;c=pap*mix(vec3(1.),pig,sat(kd));}
 if(k==K_SCALE){vec2 id;vec3 v=voro(u,id);float e=(v.y-v.x)/length(fwidth(u))*PX;ink=max(ink,ss(PX*.9,PX*.2,e)*(.25+.65*sh)*step(.25,h21(id+5.)));}
 if(k==K_FUZZ){float s=step(.80-.3*sh,h21(floor(u*260.)));ink=max(ink,s*.6);}
 if(k==K_SKIN){float w=vn(vec2(pd.x*100.,pd.y*12.));ink=max(ink,ss(.035,.0,abs(w-.5))*.55*(.3+.7*sh));}
 if(k==K_FOSSIL||k==K_BONE){float s=step(.93-.12*sh,h21(floor(u*300.)));ink=max(ink,s*.55);}
 if(k==K_ROCK){float s=step(.994-.012*sh,h21(floor((P+vec2(0.,uCamY))*uR.y*.5)));ink=max(ink,s*.40);}
 if(k==K_EYE)c=INK;
 c=mix(c,INK,ink);
 a=max(a,ss(wl+PX*.8,wl-PX*.3,abs(d+wl*.6))*step(.05,line));
 return c;}

#endif
#if STYLE==2
// ---- Style C: an embroidered tapestry. Linen behind; rows of long-and-short stitches that follow the hair or the shape, each a
// twisted thread with its own sheen and its own shade of thread (shading by changing thread, in steps); French knots for snow and
// down; little satin patches for scales; a dark stem-stitch outline. ----
vec3 linen(vec2 w){vec2 f=w*uR.y/2.6;float wx=abs(fract(f.x)-.5),wy=abs(fract(f.y)-.5);float ch=mod(floor(f.x)+floor(f.y),2.);
 float t=mix(ss(.5,.2,wx),ss(.5,.2,wy),ch);vec3 c=vec3(.80,.74,.61)*(.86+.18*t)*(.95+.1*vn(w*30.));return c;}
vec3 linenW(){return linen(P+vec2(0.,uCamY));}
// One stitch area: rows of stitches along sd (rows per unit), each stitch of length len with slanted ends, every row offset; the thread
// is a little cylinder (lighter in its middle) with a fine twist; its colour is one of a few shades of thread (the shading of
// embroidery goes in steps, by changing thread).
vec3 stitches(vec2 uu,vec2 sd,float rows,float len,vec3 alb,float lam,float var){vec2 sp=vec2(-sd.y,sd.x);vec2 pd=vec2(dot(uu,sd),dot(uu,sp));
 float ry=pd.y*rows,row=floor(ry),fy=fract(ry);float sx=pd.x/len+fy*.45+h11(row*1.37)*7.,sid=floor(sx),fx=fract(sx);
 float id=h21(vec2(row,sid));float prof=.60+.40*sin(PI*fy);float gap=ss(0.,.09,fx)*ss(1.,.91,fx);
 float qs=floor(sat(lam)*3.6+id*.75)/3.;vec3 tc=alb*mix(.64,1.16,qs)*(1.+var*(id-.5));
 float tw=.5+.5*sin((fx*len*rows*.9+fy*1.6)*PI);
 vec3 c=tc*(.66+.42*prof)*(.95+.07*tw)+SUNC*.05*pow(prof,6.)*alb.g;
 return mix(c*.80,c,gap);}
vec3 styleC(float d,vec3 n,vec3 alb,int k,vec2 u,vec2 dir,float line,out float a){
 float lam=lambert(n);vec2 W=P+vec2(0.,uCamY);vec3 c;a=cov(d);
 if(k==K_SKY){vec2 sd=normalize(vec2(1.,.30+.35*(fbm2(W*vec2(1.2,3.))-.5)));c=stitches(W,sd,92.,.085,alb,.62,.05);}
 else if(k==K_FAR||k==K_SNOW||k==K_MUD||k==K_ROCK||k==K_WATER){vec2 sd=normalize(vec2(1.,.18*(fbm2(W*3.)-.5)+(k==K_FAR?.12:-.06)));
  c=stitches(W,sd,k==K_ROCK?80.:115.,k==K_WATER?.10:.05,alb,k==K_ROCK?lam:.55+.45*lam,.06);
  if(k==K_SNOW){vec2 g=W*vec2(60.,70.),ci=floor(g),f=fract(g)-.5-(h22(ci)-.5)*.4;float r=length(f);float kn=ss(.36,.26,r)*step(.78,h21(ci));
   vec3 kc=vec3(.97,.98,1.)*(.75+.35*sat(dot(normalize(vec3(f*2.,.6)),SUNL)));c=mix(c,kc,kn);}}
 else if(k==K_FUZZ){vec2 g=u*210.,ci=floor(g),f=fract(g)-.5-(h22(ci)-.5)*.3;float r=length(f);float kn=ss(.50,.36,r);float sp=.5+.5*sin(atan(f.y,f.x)*3.+r*18.);
  vec3 kn3=normalize(vec3(f*2.,.6));float l2=sat(dot(kn3,SUNL)*.5+.5)*lam;vec3 tc=alb*mix(.62,1.18,floor(l2*3.6+h21(ci)*.7)/3.);c=mix(alb*.45,tc*(.7+.3*sp),kn);}
 else if(k==K_SCALE){vec2 id;vec3 v=voro(u*.42,id);float e=v.y-v.x;vec2 sd=rot(h21(id)*3.14)*vec2(1,0);c=stitches(u*.42/55.,sd,55.*1.6,.5,alb,lam,.10);c=mix(c*.55,c,ss(.0,.12,e));}
 else if(k==K_WOOL){vec2 pd=vec2(dot(u,dir),dot(u,vec2(-dir.y,dir.x)));vec4 L=locks(pd+.02*vec2(fbm2(u*5.)-.5,0.),60.,5.);
  c=stitches(u,dir,150.,.045,alb*(.9+.2*L.y),lam*(.75+.3*L.x),.10);c=mix(c,c*.62,L.w*.7);}
 else if(k==K_EYE){c=stitches(u,vec2(1,0),300.,.02,alb,.5,.0);}
 else if(k==K_PLANT||k==K_GRASS){c=stitches(u*vec2(.2,1.),dir,140.,.06,alb,lam,.12);}
 else{c=stitches(u,dir,140.,.04,alb,lam,.08);}
 // the padding of a satin piece: a little relief
 if(k!=K_SKY&&k!=K_FAR&&k!=K_SNOW&&k!=K_MUD&&k!=K_WATER)c*=.84+.26*lam;
 // stem-stitch outline
 if(line>.05){vec2 g=vec2(dFdx(d),dFdy(d));vec2 tg=normalize(vec2(-g.y,g.x)+1e-7);float w=PX*(1.3+1.2*line);float band=ss(w+PX,w-PX*.2,abs(d+w));
  float al=dot(P*uR.y,tg)/4.5+(d+w)/w*.7;float st=sin(PI*fract(al));vec3 oc=mix(alb*.25,INK*1.8,.6)*(.6+.55*st);c=mix(c,oc,band*line);a=max(a,band*line);}
 return c;}
#endif
// One piece: d its distance (negative inside), g its screen gradient, alb its colour, k its kind, u coordinates that move with it
// (for its texture), dir the direction of its hair or stitches, R its roundness, line how much contour, dec 1 if it is decor (the
// decor setting dims it towards the base, or leaves it out).
void piece(float d,vec2 g,vec3 alb,int k,vec2 u,vec2 dir,float R,float line,float dec){
 if(d>PX*4.)return;if(dec>.5&&uDecor>1.5)return;
 vec3 n=nrm(d,g,R);vec3 c;float a=cov(d);
#if STYLE==0
 c=styleA(d,n,alb,k,u,dir,line);
#elif STYLE==1
 c=styleB(d,n,alb,k,u,dir,line,a);
#else
 c=styleC(d,n,alb,k,u,dir,line,a);
#endif
 if(dec>.5&&uDecor>.5)c=mix(baseCol(),c,uOpacity);
 a=sat(a);F=vec4(c,1.)*a+F*(1.-a);}
#define PIECE(d,alb,k,u,dir,R,line,dec) {float d_=(d);piece(d_,vec2(dFdx(d_),dFdy(d_)),alb,k,u,dir,R,line,dec);}
// Something soft over the picture (vapour, mist, a shadow): mixes towards c by a.
void veil(vec3 c,float a,float dec){if(a<=.001)return;if(dec>.5&&uDecor>1.5)return;if(dec>.5&&uDecor>.5){c=mix(baseCol(),c,uOpacity);}a=sat(a);F=vec4(c,1.)*a+F*(1.-a);}
// A shadow that darkens what is already there (dec: it falls on decor, so it fades with it).
void shadow(float a,vec3 tint,float dec){if(a<=.001)return;if(dec>.5){if(uDecor>1.5)return;if(uDecor>.5)a*=uOpacity;}F.rgb*=mix(vec3(1.),tint,sat(a));}

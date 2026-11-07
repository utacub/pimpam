#version 300 es
precision highp float;
// Gegants del blau (CE38, 0.36): shared pieces of every shader. Style C «documental pintat»: physical light under the water (red goes
// first, caustics, shafts, marine snow, haze), modelled animals with a rim light and a soft dark edge.
// Screen P: y in [-.5,.5]. World units are 10 m, local to the scene; the sea surface is y = 0, depth is -y. A pixel at P sees the world
// point CAM + P · VH (VH: the height of the screen in world units). Two layers: BG (decor: the water, the sky, the floor, the light) and
// FG (the figures: the animals and what takes part in their gesture), premultiplied.
uniform vec2 uR;       // size in pixels
uniform vec3 uCam;     // the camera: centre (x, y) and view height, in the scene's world
uniform float uTau;    // the scene's clock: seconds since its press (it slows to a stop while waiting for the next press)
uniform float uVeil;   // 0 .. 1: the open water of the travel over the scene
uniform float uMove;   // how fast the camera travels (screen heights per second): the marine snow streaks
uniform float uMix;    // the opacity of this layer (the dissolve of the travel)
uniform float uDecor,uOpacity,uBase; // decor 0 full, 1 dim, 2 none; opacity of the dim decor; base 0 black, 1 white
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
// rot(a) turns a point by -a (rot(a)*(p - c) is p seen from a frame turned by +a).
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sat(float x){return clamp(x,0.,1.);}
vec3 sat3(vec3 x){return clamp(x,0.,1.);}
float sdEll(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=sat(dot(pa,ba)/dot(ba,ba));return length(pa-ba*h);}
float segU(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return sat(dot(pa,ba)/dot(ba,ba));}
// A tapered segment: radius ra at a, rb at b.
float sdCap(vec2 p,vec2 a,vec2 b,float ra,float rb){float u=segU(p,a,b);return length(p-mix(a,b,u))-mix(ra,rb,u);}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float ease(float x){x=sat(x);return x*x*(3.-2.*x);}
float ease3(float x){x=sat(x);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
// A pulse: 0 before a, up to 1 between a and b, back to 0 between c and d.
float pulse(float a,float b,float c,float d,float x){return ss(a,b,x)*(1.-ss(c,d,x));}

// ---- The frame of the pixel ----
vec2 P;float PX;               // screen position, one pixel in screen units
vec2 CAM=vec2(0.);float VH=1.; // camera centre (world) and view height (world units)
float WPX;                     // one pixel in world units
vec2 toW(vec2 p){return CAM+p*VH;}
vec4 FG=vec4(0.);vec3 BG=vec3(0.);
// paint colour c with coverage a over the figure layer
void putF(vec3 c,float a){a=sat(a);FG=vec4(FG.rgb*(1.-a)+c*a,FG.a*(1.-a)+a);}
float covW(float d){return ss(WPX,-WPX,d);}           // coverage of a world-space distance
float covWs(float d,float soft){return ss(WPX+soft,-WPX-soft,d);}
// How far the subject plane is from the camera (world units): the haze grows with the view.
float camDist(){return .15+.42*VH;}

// ---- Light in the sea ----
// Water takes red light first, then green; blue goes furthest (Pope & Fry, 1997). KD: daylight going down; KH: a view through water.
vec3 KD=vec3(2.7,.60,.28);
vec3 KH=vec3(2.2,.70,.40);
vec3 SUNC=vec3(1.,.96,.88);    // sunlight above the water
vec3 SKYC=vec3(.45,.62,.85);   // the sky's light
vec3 WAT0=vec3(.035,.30,.42);  // the colour of the water just under the surface (light scattered back to the eye)
vec2 SUND=normalize(vec2(.25,1.)); // where the sunlight comes from, in the plane of the picture
vec3 VEIL=vec3(-1.);           // the colour of the scene's open water for the travel (unset: the water at the camera's depth)
vec3 waterCol(float z){z=max(z,0.);return WAT0*exp(-KD*z*.85);}
vec3 lightAt(float z){return SUNC*exp(-KD*max(z,0.));}
vec3 fogW(vec3 c,float dist,float z){vec3 T=exp(-KH*max(dist,0.));return c*T+waterCol(z)*(1.-T);}

// A network of light (caustics): edges of a moving Voronoi pattern, two layers. p in cells.
float voroE(vec2 p,float t){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y);vec2 h=h22(i+g);vec2 o=g+.5+.38*sin(t*vec2(.71,.53)+TAU*h)-f;float d=dot(o,o);if(d<a){b=a;a=d;}else if(d<b)b=d;}
 return sqrt(b)-sqrt(a);}
float caust(vec2 p,float t){vec2 q=p+.35*vec2(vn(p*.9+t*.21),vn(p*.9+7.3-t*.17));
 float e1=voroE(q,t),e2=voroE(q*1.37+3.1,t*1.1+2.);return .65*exp(-e1*9.)+.45*exp(-e2*11.);}
// Light shafts from the surface, slanting with the sun; a slow pattern across them. w world.
float shafts(vec2 w,float t){float a=(w.x-w.y*SUND.x/SUND.y);float r=vn(vec2(a*3.1,t*.10))*.65+vn(vec2(a*7.3+4.,t*.16))*.35;
 return pow(r,2.2)*exp(-.75*max(-w.y,0.));}
// Marine snow: three layers of drifting specks at different distances (parallax with the camera), streaking along the travel.
float snow(vec2 p,float t){float s=0.;float st=min(uMove*5.,7.);
 for(int L=0;L<3;L++){float fl=float(L),sc=28.+fl*22.,par=.55+fl*.35;vec2 q=(p+CAM/VH*par*.5)*sc+vec2(t*(.3+fl*.12),t*(-.25-fl*.1));
  vec2 i=floor(q),f=fract(q);vec2 o=h22(i+fl*13.);float r=.06+.05*h21(i+3.);vec2 dq=f-.15-.7*o;dq.x/=1.+st*(1.+fl*.5)*.12;
  float d=length(dq);s+=ss(r,r*.2,d)*(.25+.75*h21(i+7.))*(1.-fl*.25)*step(.55,h21(i+19.))/(1.+st*.15);}
 return s;}
// The open water seen from inside: deeper and darker below, the glow of the sky through the surface above, shafts and snow.
// glow: how much of the sky's light shows from above; sh: the shafts.
vec3 openWater(vec2 w,float T,float glow,float sh){float z=-w.y;vec3 wc=waterCol(z)*(.55+.95*ss(-.75,.62,P.y));
 wc+=WAT0*.40*glow*ss(.0,.7,P.y);
 wc+=lightAt(z)*vec3(.70,.72,.64)*.45*sh*shafts(w*vec2(.8,1.),T)*ss(-.8,.6,P.y);
 wc+=lightAt(z+.2)*.30*snow(P,T);return wc;}

// A horizontal plane (a sea floor at height yp, or the underside of the ice) seen in perspective: the eye at the camera's height, the
// horizon at screen height hz; D: the distance of the picture plane, where the plane and the world of the figures agree. Returns
// (x across, distance, 1 where the plane is seen).
vec3 planeAt(float yp,float hz,float D){float sy0=(yp-CAM.y)/VH-hz;float py=P.y-hz;if(py*sy0<=0.)return vec3(0.,1e5,0.);float dd=D*sy0/py;return vec3(CAM.x+P.x*VH*dd/D,dd,1.);}
// ---- The surface ----
float waves(float x,float T,float k){return k*(.012*sin(x*6.+T*1.4)+.007*sin(x*13.-T*2.2)+.004*sin(x*29.+T*3.1));}
// The sky over the sea at the waterline sy (world), with soft clouds; SKYTOP, SKYHOR its colours; the sun at SUNP (screen) with SUNR.
vec3 SKYTOP=vec3(.10,.27,.62),SKYHOR=vec3(.42,.60,.80),CLOUDC=vec3(.82,.83,.84);vec2 SUNP=vec2(-1.2,.8);float SUNK=.25,CLOUDK=.9;
vec3 skyAt(vec2 w,float hy,float T){vec3 sky=mix(SKYHOR,SKYTOP,ss(.0,1.4,hy));
 float cl=fbm(vec2(w.x*.55+T*.01,hy*1.6)*1.6);float cm=ss(.55,.78,cl)*ss(.05,.5,hy)*ss(1.6,.6,hy);
 sky=mix(sky,CLOUDC*(.80+.25*ss(.4,.9,fbm(w*3.+1.))),cm*CLOUDK);
 sky+=SUNC*SUNK*exp(-length(P-SUNP)*2.8);return sky;}
// The far sea from above, up to the horizon (hy < 0 below the horizon), with glints under the sun.
vec3 FARSEA=vec3(.05,.22,.36),NEARSEA=vec3(.16,.40,.55);
vec3 seaAbove(vec2 w,float hy,float T,float horiz){vec3 sea=mix(FARSEA,NEARSEA,ss(horiz,.0,hy+horiz));
 sea=mix(sea,SKYHOR*.85,ss(-.5*horiz,.0,hy)*.6);   // near the horizon the sea mirrors the sky (grazing light)
 float gl=pow(vn(vec2(w.x*30.,hy*260.)+vec2(T*.4,0.)),7.)*ss(-.02,.0,-(hy));sea+=SUNC*gl*.35*(.4+.6*exp(-abs(P.x-SUNP.x)*1.2));return sea;}
// The underside of the surface near the waterline: a bright, rippled mirror band.
vec3 mirrorBand(vec3 wc,vec2 w,float sy,float T){float band=ss(.07*VH,.0,sy-w.y);return mix(wc,WAT0*vec3(1.,1.6,1.5)*(.70+.6*vn(vec2(w.x*14.+T*.7,w.y*40.)))*2.,band*.45);}

// ---- Bodies: a flexible spine from the snout (s = 0) to the end of the tail stock (s = 1) ----
const int NS=18;
vec2 SP[NS+1];float BL;float BFLIP; // spine points (world), body length, 1 if the back is on the left of the direction of travel
// head: snout position; ang: direction of travel; amp, ph: the swimming wave (in the picture plane); bend: a steady curve.
void spine(vec2 head,float ang,float L,float flip,float amp,float ph,float bend){BL=L;BFLIP=flip;vec2 p=head;SP[0]=p;
 for(int i=1;i<=NS;i++){float s=(float(i)-.5)/float(NS);float th=ang+flip*(amp*s*s*sin(TAU*(.85*s)-ph)+bend*s);p-=L/float(NS)*vec2(cos(th),sin(th));SP[i]=p;}}
// The same with a bend that grows along the body as s^2 (a turn of the head and the whole body following).
void spine2(vec2 head,float ang,float L,float flip,float amp,float ph,float bend,float bend2){BL=L;BFLIP=flip;vec2 p=head;SP[0]=p;
 for(int i=1;i<=NS;i++){float s=(float(i)-.5)/float(NS);float th=ang+flip*(amp*s*s*sin(TAU*(.85*s)-ph)+bend*s+bend2*s*s);p-=L/float(NS)*vec2(cos(th),sin(th));SP[i]=p;}}
// ---- Paths: an animal swims along a path and its body follows it (each point of the spine where the snout passed) ----
// The path: from PP0 heading PTH0, up to 6 pieces of constant curvature: lengths PL, curvatures PK (1/radius; + turns left).
// Before its start and after its end it goes straight on.
float PL[6]=float[6](0.,0.,0.,0.,0.,0.),PK[6]=float[6](0.,0.,0.,0.,0.,0.);vec2 PP0=vec2(0.);float PTH0=0.;
void pathSet(vec2 p0,float th0){PP0=p0;PTH0=th0;for(int i=0;i<6;i++){PL[i]=0.;PK[i]=0.;}}
vec3 pathStep(vec3 q,float k,float st){if(abs(k)<1e-4)q.xy+=st*vec2(cos(q.z),sin(q.z));else q.xy+=vec2(sin(q.z+k*st)-sin(q.z),cos(q.z)-cos(q.z+k*st))/k;q.z+=k*st;return q;}
// position (xy) and heading (z) at arc length a
vec3 pathAt(float a){vec3 q=vec3(PP0,PTH0);if(a<0.)return pathStep(q,0.,a);
 for(int i=0;i<6;i++){float l=min(a,PL[i]);q=pathStep(q,PK[i],l);a-=l;if(a<=0.)return q;}
 return pathStep(q,0.,a);}
float pathLen(){float l=0.;for(int i=0;i<6;i++)l+=PL[i];return l;}
// The spine along the path, the snout at arc length a; the swimming wave across it (amp: of the tail, in body lengths; ph its phase).
void spinePath(float a,float L,float flip,float amp,float ph){BL=L;BFLIP=flip;float ds=L/float(NS);float at=a-L;vec3 q=pathAt(at);
 int seg=6;float rem=1e9;if(at<0.){seg=-1;rem=-at;}else{float acc=0.;for(int i=0;i<6;i++){if(at<acc+PL[i]){seg=i;rem=acc+PL[i]-at;break;}acc+=PL[i];}}
 for(int i=NS;i>=0;i--){float s=float(i)/float(NS);vec2 n=flip*vec2(-sin(q.z),cos(q.z));SP[i]=q.xy+n*(amp*L*s*s*sin(TAU*.85*s-ph));if(i==0)break;
  float left=ds;for(int g=0;g<4;g++){if(left<=1e-7)break;float k=(seg>=0&&seg<6)?PK[seg]:0.;float st=min(left,rem);q=pathStep(q,k,st);left-=st;rem-=st;
   if(rem<=1e-6){seg++;rem=seg<6?PL[seg]:1e9;}}}}
// The body frame of w: x = s along (unclamped past the ends), y = v across in world units (back +), z: the tangent angle there.
vec3 bodyF(vec2 w){float best=1e9;vec3 r=vec3(0.);
 for(int i=0;i<NS;i++){vec2 a=SP[i],b=SP[i+1],ba=b-a;float h=dot(w-a,ba)/dot(ba,ba);float hc=(i==0)?min(h,1.):(i==NS-1)?max(h,0.):sat(h);
  vec2 q=w-a-ba*sat(h);float d=dot(q,q);if(d<best){best=d;vec2 t=-ba/length(ba);vec2 n=BFLIP*vec2(-t.y,t.x);r=vec3((float(i)+hc)/float(NS),dot(w-a-ba*hc,n),atan(t.y,t.x));}}
 return r;}
// A rough distance from w to the spine, cheap, to skip the body where it cannot be.
float spineNear(vec2 w){float d=1e9;for(int i=0;i<NS;i+=3){d=min(d,sdSeg(w,SP[i],SP[min(i+3,NS)]));}return d;}
vec2 bodyDir(float s){int i=int(clamp(s*float(NS),0.,float(NS-1)));return normalize(SP[i]-SP[i+1]);}
vec2 bodyNrm(float s){vec2 d=bodyDir(s);return BFLIP*vec2(-d.y,d.x);}
vec2 bodyPt(float s,float v){float x=clamp(s,0.,1.)*float(NS);int i=int(min(floor(x),float(NS-1)));vec2 a=SP[i],b=SP[i+1];vec2 t=normalize(a-b);vec2 n=BFLIP*vec2(-t.y,t.x);return mix(a,b,x-float(i))+n*v;}
// Profiles: 11 samples (s = 0, .1 .. 1), smooth (Catmull-Rom) between them, in units of the body length.
float cr(float a,float b,float c,float d,float t){return .5*((2.*b)+(-a+c)*t+(2.*a-5.*b+4.*c-d)*t*t+(-a+3.*b-3.*c+d)*t*t*t);}
float prof(float s,float k[11]){float x=clamp(s,0.,1.)*10.;int i=int(min(floor(x),9.));float t=x-float(i);
 return cr(k[max(i-1,0)],k[i],k[i+1],k[min(i+2,10)],t);}
// The distance to a body of top and bottom profiles (frame f from bodyF), rounded at the snout, cut at the tail stock.
float profSide(vec2 f,float k[11],float sgn){float e=.012;float t=prof(f.x,k)*BL;float dt=(prof(f.x+e,k)-prof(f.x-e,k))/(2.*e);return (sgn*f.y-t)/sqrt(1.+dt*dt);}
float bodyD(vec2 f,float top[11],float bot[11]){float d=max(profSide(f,top,1.),profSide(f,bot,-1.));d=smax(d,-f.x*BL,.016*BL);return max(d,(f.x-1.02)*BL);}
// Across the body: u from -1 (belly) to 1 (back), and a tube normal (screen, z towards the eye).
float bodyU(vec2 f,float top[11],float bot[11]){float tt=prof(f.x,top)*BL,bb=prof(f.x,bot)*BL;return clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);}
vec3 tubeN(vec2 f,float u){vec2 nd=bodyNrm(f.x);return normalize(vec3(nd*u*.92,sqrt(max(1.-u*u*.85,0.))));}

// Distance to a triangle (negative inside): fins.
float sdTri(vec2 p,vec2 p0,vec2 p1,vec2 p2){vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2;vec2 v0=p-p0,v1=p-p1,v2=p-p2;
 vec2 q0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),q1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),q2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));
 float sg=sign(e0.x*e2.y-e0.y*e2.x);vec2 d=min(min(vec2(dot(q0,q0),sg*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(q1,q1),sg*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(q2,q2),sg*(v2.x*e2.y-v2.y*e2.x)));
 return -sqrt(d.x)*sign(d.y);}
// Distance to a polygon of 16 vertices (negative inside).
float sdPoly16(vec2 p,vec2 v[16]){float d=dot(p-v[0],p-v[0]);float sg=1.;
 for(int i=0,j=15;i<16;j=i,i++){vec2 e=v[j]-v[i],q=p-v[i];vec2 b=q-e*sat(dot(q,e)/dot(e,e));d=min(d,dot(b,b));
  bool c1=p.y>=v[i].y,c2=p.y<v[j].y,c3=e.x*q.y>e.y*q.x;if((c1&&c2&&c3)||(!c1&&!c2&&!c3))sg=-sg;}
 return sg*sqrt(d);}

// A flipper: a long curved blade from a (base) through m to b (tip), widest a third of the way; knobs (k > 0, humpbacks) along the
// leading edge (the side ln). Returns the distance; uu: how far along it.
float flipD(vec2 w,vec2 a,vec2 m,vec2 b,vec2 ln,float wd,float k,out float uu){
 float u1=segU(w,a,m),u2=segU(w,m,b);vec2 q1=w-mix(a,m,u1),q2=w-mix(m,b,u2);float d1=dot(q1,q1),d2=dot(q2,q2);
 float u=d1<d2?u1*.45:.45+u2*.55;vec2 q=d1<d2?q1:q2;uu=u;float side=dot(q,ln);
 float r=wd*(.75+.55*sin(PI*min(u*1.4,1.))*(1.-u*.5))*mix(1.,.15,ss(.6,1.,u))+(side>0.?k*wd*.16*ss(.05,.15,u)*ss(.95,.8,u)*(.5+.5*sin(u*60.)):0.);
 return length(q)-r;}
// Flukes seen at an angle: the planform (half-span S, swept, notched) squeezed across by k (0 edge-on, 1 flat); sc: the scallops of the
// trailing edge (humpbacks). q: frame with x back from the tail stock, y across.
float flukeD(vec2 q,float S,float k,float sc){k=max(k,.06);vec2 p=vec2(q.x,q.y/k);float y=abs(p.y);
 float le=.38*y,te=le+S*.42*(1.-pow(y/S,1.6))*(.75+.25*ss(.0,.25*S,y))+sc*S*.02*sin(y/S*25.)*ss(.3*S,S,y)-S*.05*ss(.12*S,.0,y);
 float d=max(max(le-p.x,p.x-te),y-S);return d*k;}

// ---- The colour of a figure ----
// alb: albedo; n: normal (screen, z to the eye); E: light reaching it; amb: ambient light; wet: shine; rim: the light from behind
// round its edge (the water's glow).
vec3 lit(vec3 alb,vec3 n,vec3 E,vec3 amb,float wet){vec3 L=normalize(vec3(SUND*.9,.45));float dl=dot(n,L);
 float df=sat((dl+.25)/1.25);vec3 c=alb*(E*df+amb);vec3 H=normalize(L+vec3(0,0,1));float sp=pow(sat(dot(n,H)),40.)*wet;
 return c+E*sp;}
vec3 rimL(vec3 n,vec3 E,float k){float r=pow(1.-sat(n.z),3.)*sat(.35+.65*dot(normalize(n.xy+1e-5),SUND));return E*r*k;}
// The soft dark edge of a figure (d: its distance, world), inside it.
float edgeK(float d){return ss(-3.2*WPX,-.4*WPX,d);}
// A small round eye of a whale or a fish at e, radius r: a dark rim, the dark eye, a soft highlight towards the light.
vec3 eyeC(vec3 c,vec2 w,vec2 e,float r,vec3 E,vec3 iris){float de=length(w-e);
 c=mix(c,c*.62,ss(r*2.2,r*1.3,de));c=mix(c,iris,ss(r,r*.75,de));c=mix(c,vec3(.015),ss(r*.62,r*.45,de));
 return c+E*.22*ss(r*.32,r*.12,length(w-e-SUND*r*.38));}

// ---- Water thrown up and bubbles ----
// White water thrown up round x0 from the surface sy: thin streaky sheets (brighter at their edges), a foam ring at the base, mist
// and drops above. wd: half-width at the base; ht: height; t: its own clock; k: strength.
void splash(vec2 w,float sy,float x0,float wd,float ht,float t,float k){if(k<=.001||w.y<sy-.02)return;
 float y=w.y-sy;float dx=w.x-x0;float h=max(ht,.01);float yn=y/h;
 float xs=dx/(wd*(1.+.55*sat(yn)));float env=ss(1.05,.55,abs(xs))*ss(1.15,.25,yn+.25*(fbm(vec2(w.x*7.,t*.6))-.5));
 float streak=vn(vec2(xs*9.+t*.4,y*6.-t*2.2))*.55+vn(vec2(xs*23.,y*15.-t*3.))*.30+fbm(vec2(xs*5.,y*4.-t))*.15;
 float sheet=env*ss(.38,.75,streak)*(.45+.55*ss(.0,.4,abs(xs)));
 float ring=ss(.05,.0,abs(y-.012))*ss(1.25,.7,abs(dx/wd))*(.55+.45*fbm(vec2(w.x*20.,t)));
 float mist=env*.22*fbm(vec2(w.x*3.,y*3.-t*.4));
 vec2 dq=vec2(w.x*34.,(y+t*t*.12)*34.);vec2 di=floor(dq);float drop=ss(.20,.06,length(fract(dq)-.2-.6*h22(di)))*step(.88,h21(di+2.))*ss(1.7,.6,abs(xs))*ss(1.6,.8,yn)*ss(.0,.1,y);
 float a=sat(sheet*.75+ring*.85+mist+drop*.85)*k;
 putF(SUNC*vec3(.95,.97,.98)*(.86+.18*streak),a);}
// A cloud of bubbles round c (radii r), drifting up: a pale haze with distinct bubbles in it. k: strength; t: its clock.
void bubbleCloud(vec2 w,vec2 c,vec2 r,float t,float k,float dist){if(k<=.001)return;vec2 q=(w-c)/r;float bd=length(q)-1.+.5*(fbm(w*3./max(r.x,.05)+t*.3)-.5);
 float hz=ss(.3,-.5,bd);if(hz<=.001)return;vec2 sq=vec2(w.x,w.y-t*.12)*45.;vec2 si=floor(sq);float br=.08+.16*h21(si+8.);
 float sb=ss(br,br*.45,length(fract(sq)-.25-.5*h22(si)))*step(.70,h21(si+5.));float z=max(-w.y,0.);
 putF(fogW(lightAt(z)*1.3+waterCol(z)*.8,dist,z),hz*(.15+.55*sb)*k);}
// A rising stream of bubbles from b: they wobble and grow a little as they rise. k: strength; sz: their size (world).
void bubbleStream(vec2 w,vec2 b,float t,float k,float sz,float dist){if(k<=.001)return;float dy=w.y-b.y;if(dy<0.)return;
 float g=1.+dy*.6;vec2 bq=vec2((w.x-b.x-.02*sin(dy*8.+t*2.))/(sz*g*2.),(dy-t*.45)/(sz*g*2.));vec2 bi=floor(bq);vec2 bf=fract(bq)-.5;
 float on=step(.55,h21(vec2(0.,bi.y)+b));float d=length(bf-vec2(.3*(h21(bi+3.)-.5),0.));float rim=ss(.42,.30,d)*(.45+.55*ss(.18,.36,d));
 float z=max(-w.y,0.);putF(fogW(lightAt(z)*1.5+.05,dist,z),rim*on*k*ss(.6,.0,abs(bi.x))*ss(.0,.04,dy));}

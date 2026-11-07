#version 300 es
precision highp float;
// Gegants del blau (CE38), style tests. One scene per program (#define SCENE), one style per program (#define STYLE: 0 A «llum de
// Sorolla», oil paint; 1 B «làmina de naturalista», ink and watercolour on cream paper; 2 C «documental pintat», physical light).
// Screen p: y in [-.5,.5]. World units are 10 m; the sea surface is world y = 0, depth is -y. The camera (centre, view height) is a
// function of the scene time in each scene file. Two layers: BG (the water, the sky, the light: decor) and FG (the animals, the
// splash, the bubbles: never decor), premultiplied.
uniform vec2 uR;        // size in pixels
uniform float uT;       // the scene time, seconds since the press (the travelling is 0..2)
uniform float uDecor,uOpacity,uBase; // decor 0 full, 1 dim, 2 none; opacity of the dim decor; base 0 black, 1 white
uniform float uDark;    // the darkening while waiting (0 .. .85)
uniform vec3 uView;     // review only: if z > 0, the camera centre (xy) and view height (z)
out vec4 OF;
#define TAU 6.2831853
#define PI 3.1415927
const int ST=STYLE;
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
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
float ease(float x){x=sat(x);return x*x*(3.-2.*x);}
float ease3(float x){x=sat(x);return x<.5?4.*x*x*x:1.-pow(-2.*x+2.,3.)/2.;}
float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
vec3 sat3(vec3 x){return clamp(x,0.,1.);}

// ---- Frame of the pixel ----
vec2 P;float PX;      // screen position, one pixel in screen units
vec2 CAM=vec2(0.);float VH=1.; // camera centre (world) and view height (world units)
float WPX;            // one pixel in world units
vec2 toW(vec2 p){return CAM+p*VH;}
vec4 FG=vec4(0.);vec3 BG=vec3(0.);
float INKD=1e5,SHADE=0.; // style B: distance to the nearest ink line (world), shadow amount for hatching
void ink(float d){INKD=min(INKD,abs(d));}
// paint colour c with coverage a over the figure layer
void putF(vec3 c,float a){a=sat(a);FG=vec4(FG.rgb*(1.-a)+c*a,FG.a*(1.-a)+a);}
float covW(float d){return ss(WPX,-WPX,d);}           // coverage of a world-space distance
float covWs(float d,float soft){return ss(WPX+soft,-WPX-soft,d);}

// ---- Light in the sea (world units of 10 m) ----
// Water takes red light first, then green; blue goes furthest (Pope & Fry, 1997). KD: daylight going down; KH: a view through water.
const vec3 KD=vec3(2.7,.60,.28);
const vec3 KH=vec3(2.2,.70,.40);
vec3 SUNC=vec3(1.,.96,.88);   // sunlight above the water
vec3 SKYC=vec3(.45,.62,.85);  // the sky's light
vec3 WAT0=vec3(.035,.30,.42); // the colour of the water just under the surface (light scattered back to the eye)
vec2 SUND=normalize(vec2(.25,1.)); // where the sun light comes from, in the plane of the picture (from above, a little to the right)
vec3 waterCol(float z){z=max(z,0.);return WAT0*exp(-KD*z*.85);}
vec3 lightAt(float z){return SUNC*exp(-KD*max(z,0.));}
vec3 fogW(vec3 c,float dist,float z){vec3 T=exp(-KH*dist);return c*T+waterCol(z)*(1.-T);}

// A network of light (caustics): edges of a moving Voronoi pattern, two layers. p in cells.
float voroE(vec2 p,float t){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y);vec2 h=h22(i+g);vec2 o=g+.5+.38*sin(t*vec2(.71,.53)+TAU*h)-f;float d=dot(o,o);if(d<a){b=a;a=d;}else if(d<b)b=d;}
 return sqrt(b)-sqrt(a);}
float caust(vec2 p,float t){vec2 q=p+.35*vec2(vn(p*.9+t*.21),vn(p*.9+7.3-t*.17));
 float e1=voroE(q,t),e2=voroE(q*1.37+3.1,t*1.1+2.);return .65*exp(-e1*9.)+.45*exp(-e2*11.);}
// Light shafts from the surface, slanting with the sun; a slow pattern across them. w world.
float shafts(vec2 w,float t){float a=(w.x-w.y*SUND.x/SUND.y);float r=vn(vec2(a*3.1,t*.10))*.65+vn(vec2(a*7.3+4.,t*.16))*.35;
 return pow(r,2.2)*exp(-.75*max(-w.y,0.));}
// Marine snow: three layers of drifting specks (screen p, world camera for parallax), returns light.
float snow(vec2 p,float t){float s=0.;
 for(int L=0;L<3;L++){float fl=float(L),sc=28.+fl*22.,par=.35+fl*.3;vec2 q=(p+CAM*par/VH*.25)*sc+vec2(t*(.3+fl*.12),t*(-.25-fl*.1));
  vec2 i=floor(q),f=fract(q);vec2 o=h22(i+fl*13.);float r=.06+.05*h21(i+3.);float d=length(f-.15-.7*o);
  s+=ss(r,r*.2,d)*(.25+.75*h21(i+7.))*(1.-fl*.25)*step(.55,h21(i+19.));}
 return s;}

// ---- Bodies: a flexible spine from the snout (s = 0) to the end of the tail stock (s = 1) ----
const int NS=18;
vec2 SP[NS+1];float BL;float BFLIP; // spine points (world), body length, 1 if the back is on the left of the direction of travel
// head: snout position; ang: direction of travel; amp, ph: the swimming wave (cetaceans: up and down, that is in the picture plane
// for a side view); bend: a steady curve of the whole body.
void spine(vec2 head,float ang,float L,float flip,float amp,float ph,float bend){BL=L;BFLIP=flip;vec2 p=head;SP[0]=p;
 for(int i=1;i<=NS;i++){float s=(float(i)-.5)/float(NS);float th=ang+flip*(amp*s*s*sin(TAU*(.85*s)-ph)+bend*s);p-=L/float(NS)*vec2(cos(th),sin(th));SP[i]=p;}}
// The body frame of w: x = s along (unclamped past the ends), y = v across in world units (back +), z: the tangent angle there.
vec3 bodyF(vec2 w){float best=1e9;vec3 r=vec3(0.);
 for(int i=0;i<NS;i++){vec2 a=SP[i],b=SP[i+1],ba=b-a;float h=dot(w-a,ba)/dot(ba,ba);float hc=(i==0)?min(h,1.):(i==NS-1)?max(h,0.):sat(h);
  vec2 q=w-a-ba*sat(h);float d=dot(q,q);if(d<best){best=d;vec2 t=-ba/length(ba);vec2 n=BFLIP*vec2(-t.y,t.x);r=vec3((float(i)+hc)/float(NS),dot(w-a-ba*hc,n),atan(t.y,t.x));}}
 return r;}
vec2 bodyDir(float s){int i=int(clamp(s*float(NS),0.,float(NS-1)));return normalize(SP[i]-SP[i+1]);}
vec2 bodyPt(float s,float v){float x=clamp(s,0.,1.)*float(NS);int i=int(min(floor(x),float(NS-1)));vec2 a=SP[i],b=SP[i+1];vec2 t=normalize(a-b);vec2 n=BFLIP*vec2(-t.y,t.x);return mix(a,b,x-float(i))+n*v;}
// Profiles: 11 samples (s = 0, .1 .. 1), smooth (Catmull-Rom) between them, in units of the body length.
float cr(float a,float b,float c,float d,float t){return .5*((2.*b)+(-a+c)*t+(2.*a-5.*b+4.*c-d)*t*t+(-a+3.*b-3.*c+d)*t*t*t);}
float prof(float s,float k[11]){float x=clamp(s,0.,1.)*10.;int i=int(min(floor(x),9.));float t=x-float(i);
 return cr(k[max(i-1,0)],k[i],k[i+1],k[min(i+2,10)],t);}

// Distance to a polygon of 10 vertices (negative inside), and to a polyline of 8 points.
float sdPoly16(vec2 p,vec2 v[16]){float d=dot(p-v[0],p-v[0]);float sg=1.;
 for(int i=0,j=15;i<16;j=i,i++){vec2 e=v[j]-v[i],q=p-v[i];vec2 b=q-e*sat(dot(q,e)/dot(e,e));d=min(d,dot(b,b));
  bool c1=p.y>=v[i].y,c2=p.y<v[j].y,c3=e.x*q.y>e.y*q.x;if((c1&&c2&&c3)||(!c1&&!c2&&!c3))sg=-sg;}
 return sg*sqrt(d);}
float sdPoly10(vec2 p,vec2 v[10]){float d=dot(p-v[0],p-v[0]);float sg=1.;
 for(int i=0,j=9;i<10;j=i,i++){vec2 e=v[j]-v[i],q=p-v[i];vec2 b=q-e*sat(dot(q,e)/dot(e,e));d=min(d,dot(b,b));
  bool c1=p.y>=v[i].y,c2=p.y<v[j].y,c3=e.x*q.y>e.y*q.x;if((c1&&c2&&c3)||(!c1&&!c2&&!c3))sg=-sg;}
 return sg*sqrt(d);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}

// ---- Styles ----
#if STYLE==1
vec3 paperB(vec2 u){float f=(vn(u*vec2(170.,150.))-.5)*.6+(vn(u*vec2(520.,470.))-.5)*.4;return vec3(.972,.944,.876)*(1.+f*.05)*(1.-.04*fbm2(u*3.));}
const vec3 INK=vec3(.08,.07,.075);
float hatch(vec2 p,float a,float fr,float s){float v=abs(fract(dot(p,vec2(cos(a),sin(a)))*fr)-.5)*2.;return ss(.42*s+.06,.42*s-.06,v)*ss(.02,.12,s);}
#endif
// The colour of the figure under a light, for each style. alb: albedo; n: normal (screen, z to the eye); E: light reaching the piece;
// amb: ambient light; wet: shine. Style B returns a watercolour wash: flat with two tones, hatching added by the caller.
vec3 lit(vec3 alb,vec3 n,vec3 E,vec3 amb,float wet){vec3 L=normalize(vec3(SUND*.9,.45));float dl=dot(n,L);
#if STYLE==1
 float t=ss(-.1,.25,dl);return alb*(.70+.30*t);
#else
 float df=sat((dl+.25)/1.25);vec3 c=alb*(E*df+amb);vec3 H=normalize(L+vec3(0,0,1));float sp=pow(sat(dot(n,H)),40.)*wet;
#if STYLE==0
 // Sorolla: warm lights, coloured (violet-blue) shadows
 c=mix(c*vec3(.86,.88,1.08),c*vec3(1.08,1.0,.90),ss(.2,.8,df));
#endif
 return c+E*sp;
#endif
}

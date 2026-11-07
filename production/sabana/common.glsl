#version 300 es
precision highp float;
// Sabana de paper (CE36, 0.30): shared pieces of every shader. A diorama of paper seen by a camera that travels through it. Screen p:
// y in [-.5,.5]. World: x along the day's route (period SB_PERIOD: the backdrop repeats, so the climb after the twentieth scene ends
// where the first press starts; the clouds do not, and the renderer dissolves the end of the climb into the start), y up, the ground at y=0. A sheet of paper at depth z behind the plane of the scene is seen at
// L = camera + (p - HOR)(Z + z) + HOR·Z, where Z is the camera's distance (the screen height at the plane of the scene): the horizon of
// the plain sits at p = HOR, below the middle of the screen, so there is a big sky.
uniform vec2 uR;      // size in pixels
uniform vec3 uCam;    // camera centre (x, y) and distance (screen height in world units at the plane of the scene)
uniform float uG;     // clock of the world (clouds, water, grass)
uniform float uHour;  // the hour: 0 the end of the night, .04 sunrise, .48 noon, .75 sunset, .92 night, 1 = 0 again
uniform float uDecor,uOpacity,uBase; // decor 0 full, 1 dim, 2 none; opacity of the dim decor; base 0 black, 1 white
#define TAU 6.2831853
#define PI 3.1415927
const float SB_PERIOD=46.;
const vec2 HOR=vec2(0.,-.07);
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h11(float x){return h21(vec2(x,x*1.37+.5));}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.3));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s;}
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<2;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s/.75;}
float ss(float a,float b,float x){return smoothstep(a,b,x);}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
// The mirror of a side view (0.34): dir 1 faces right, -1 faces left. In between, the figure narrows like a card turning round (never
// thinner than .18 of its width) and then widens facing the other way. Multiplying by dir instead stretched the figure across the whole
// screen at the middle of a turn.
float sdir(float d){return (d<0.?-1.:1.)*max(abs(d),.18);}
float sat(float x){return clamp(x,0.,1.);}
vec2 pScreen(){return (gl_FragCoord.xy-.5*uR)/uR.y;}
float sdEll(vec2 p,vec2 r){return (length(p/r)-1.)*min(r.x,r.y);}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=sat(dot(pa,ba)/dot(ba,ba));return length(pa-ba*h);}
float segU(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return sat(dot(pa,ba)/dot(ba,ba));}
float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
// A tapered segment: radius ra at a, rb at b.
float sdCap(vec2 p,vec2 a,vec2 b,float ra,float rb){float u=segU(p,a,b);return length(p-mix(a,b,u))-mix(ra,rb,u);}
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float smax(float a,float b,float k){return -smin(-a,-b,k);}
// A water caustic network (after the well-known iterative water shader).
float caustic(vec2 uv,float t){vec2 p=mod(uv*TAU,TAU)-250.;vec2 i=p;float c=1.,inten=.005;
 for(int n=0;n<3;n++){float tt=t*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
  c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}
 c/=3.;c=1.17-pow(c,1.4);return pow(abs(c),8.);}
// Noise that repeats along x with the period of the world: x is wrapped onto a circle (f: features per unit of x).
vec2 ring(float x,float f){float a=x*TAU/SB_PERIOD,r=SB_PERIOD*f/TAU;return vec2(cos(a),sin(a))*r;}
float pfbm(float x,float f,float y){return fbm2(ring(x,f)+vec2(y*7.1,y*3.3));}
float wrapX(float x){return mod(x+3.,SB_PERIOD)-3.;}

// ---- The light of the hour: one sun (or the moon) for the whole picture, its colour and direction, the sky and the ambient light. ----
// SUN: direction towards the light (x right, y up, z towards the camera: negative when it is behind the paper, at dawn and sunset, so
// the thin papers glow). SUNP: where it is on the screen, from the horizon. SHD: the screen offset of a shadow per unit of lift.
vec3 SUN,SUNC,AMB,SKYT,SKYH,SKYM;vec2 SUNP,SHD;const vec2 MOONP=vec2(.34,.34);float NIGHT,DAY,GLOW;
const int NK=10;
const float HK[10]=float[](0.,.04,.12,.30,.48,.64,.75,.83,.92,1.);
const vec3 KT[10]=vec3[](vec3(.016,.020,.085),vec3(.07,.06,.22),vec3(.11,.21,.58),vec3(.10,.31,.80),vec3(.10,.35,.84),vec3(.20,.40,.82),vec3(.17,.14,.40),vec3(.035,.04,.17),vec3(.012,.016,.07),vec3(.016,.020,.085));
const vec3 KM[10]=vec3[](vec3(.05,.05,.20),vec3(.55,.30,.48),vec3(.50,.55,.82),vec3(.32,.56,.92),vec3(.34,.60,.94),vec3(.62,.62,.80),vec3(.70,.30,.40),vec3(.16,.09,.26),vec3(.025,.035,.12),vec3(.05,.05,.20));
const vec3 KH[10]=vec3[](vec3(.40,.17,.26),vec3(1.05,.52,.32),vec3(1.0,.80,.58),vec3(.80,.88,.96),vec3(.80,.88,.97),vec3(1.0,.82,.56),vec3(1.15,.45,.17),vec3(.55,.20,.30),vec3(.06,.07,.17),vec3(.40,.17,.26));
const vec3 KS[10]=vec3[](vec3(.20,.10,.14),vec3(1.30,.62,.38),vec3(1.55,1.10,.72),vec3(1.70,1.52,1.22),vec3(1.80,1.74,1.58),vec3(1.80,1.36,.86),vec3(1.55,.62,.26),vec3(.40,.20,.20),vec3(.26,.32,.48),vec3(.20,.10,.14));
const vec3 KA[10]=vec3[](vec3(.10,.09,.20),vec3(.34,.25,.36),vec3(.42,.42,.52),vec3(.46,.52,.64),vec3(.56,.60,.68),vec3(.50,.45,.48),vec3(.40,.27,.38),vec3(.20,.16,.32),vec3(.13,.15,.27),vec3(.10,.09,.20));
const vec3 KD[10]=vec3[](vec3(-.85,-.08,-.50),vec3(-.86,.12,-.50),vec3(-.74,.36,.45),vec3(-.52,.62,.56),vec3(-.12,.88,.45),vec3(.58,.52,.52),vec3(.86,.12,-.50),vec3(.90,-.05,-.42),vec3(.40,.68,.55),vec3(-.85,-.08,-.50));
const vec2 KP[10]=vec2[](vec2(-.62,-.08),vec2(-.58,.035),vec2(-.50,.14),vec2(-.42,.42),vec2(-.10,.95),vec2(.40,.38),vec2(.56,.045),vec2(.62,-.09),vec2(.70,-.30),vec2(-.62,-.08));
void hourLight(){float h=fract(uHour);int i=0;for(int k=0;k<NK-1;k++)if(h>=HK[k])i=k;float u=ss(HK[i],HK[i+1],h);
 SKYT=mix(KT[i],KT[i+1],u);SKYM=mix(KM[i],KM[i+1],u);SKYH=mix(KH[i],KH[i+1],u);SUNC=mix(KS[i],KS[i+1],u);AMB=mix(KA[i],KA[i+1],u);SUN=normalize(mix(KD[i],KD[i+1],u));SUNP=mix(KP[i],KP[i+1],u);
 // at night the light is the moon's (MOONP), high on the right; the sun goes on below the horizon
 NIGHT=ss(.80,.88,h)+ss(.04,0.,h)*.85;DAY=ss(.02,.10,h)*ss(.80,.72,h);GLOW=ss(.05,0.,h)+ss(.68,.76,h)*ss(.86,.78,h);
 vec2 sd=-SUN.xy;float l=length(sd);SHD=l>1e-3?sd/l*min(1.5,l/max(.3,abs(SUN.z)))*mix(.45,1.,step(0.,SUN.z)):vec2(0.,-.3);}

// ---- Paper ----
// The fibres of the paper at u (in its own units): two scales of fine noise around 0.
float fibre(vec2 u){return (vn(u*vec2(170.,150.))-.5)*.6+(vn(u*vec2(520.,470.))-.5)*.4;}
// A torn edge: the distance d pushed in and out by noise along the edge (amp, at fr features per unit).
float torn(float d,vec2 u,float amp,float fr){return d+amp*((fbm2(u*fr)-.5)*1.6+(vn(u*fr*6.3)-.5)*.5);}
// The light on a sheet seen from the front (no fold): ambient, the sun from in front, the glow of the sun through a thin paper when
// the sun is behind it (trans: how thin).
vec3 litFlat(vec3 alb,float trans){return alb*(AMB+SUNC*(max(0.,SUN.z)*.85+max(0.,-SUN.z)*trans*.9));}
vec3 litN(vec3 alb,vec3 n,float trans){return alb*(AMB*(.75+.25*n.z)+SUNC*(max(0.,dot(n,SUN))*.85+max(0.,-SUN.z)*trans*.9));}
// The colour of the grass along the route: olive by the lake, straw on the plain, olive by the river, gold in the afternoon, and back
// to olive towards the start (so the loop has no seam).
vec3 grassAlb(float x,float k){x=wrapX(x);float n=pfbm(x,.35,k);
 vec3 straw=mix(vec3(.42,.28,.085),vec3(.50,.35,.12),n),olive=mix(vec3(.27,.29,.085),vec3(.35,.35,.11),n),gold=mix(vec3(.60,.32,.075),vec3(.68,.41,.11),n);
 vec3 c=mix(olive,straw,ss(8.,11.,x));c=mix(c,olive*1.08,ss(15.5,18.,x)*ss(25.5,23.,x));c=mix(c,gold,ss(25.,30.,x));c=mix(c,olive,ss(37.,42.8,x));return c;}
// The base the decor fades to (black or white card).
vec3 baseCol(){return uBase>.5?vec3(.86,.85,.82):vec3(0.);}

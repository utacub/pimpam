#version 300 es
precision highp float;
// Selva de llum (CE35, 0.29, after the Fons marí de vidre of 0.28): shared pieces of every shader. Screen p: y in [-.5,.5]; world w = camera centre + p × zoom.
uniform vec2 uR;      // size in pixels
uniform vec3 uCam;    // camera centre (x, y) and zoom (screen height in world units)
uniform float uG;     // clock of the sea
#define TAU 6.2831853
#define PI 3.1415927
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float h11(float x){return h21(vec2(x,x*1.37+.5));}
vec2 h22(vec2 p){float n=h21(p);return vec2(n,h21(p+n+17.3));}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s;}
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<2;i++){s+=a*vn(p);p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2);a*=.5;}return s/.75;}
vec3 pal(float t){return .5+.5*cos(TAU*(t+vec3(0.,.33,.67)));}
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
// A water caustic network (after the well-known iterative water shader).
float caustic(vec2 uv,float t){vec2 p=mod(uv*TAU,TAU)-250.;vec2 i=p;float c=1.,inten=.005;
 for(int n=0;n<4;n++){float tt=t*(1.-(3.5/float(n+1)));i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x));
  c+=1./length(vec2(p.x/(sin(i.x+tt)/inten),p.y/(cos(i.y+tt)/inten)));}
 c/=4.;c=1.17-pow(c,1.4);return pow(abs(c),8.);}
float sdTri(vec2 p,vec2 p0,vec2 p1,vec2 p2){vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
 vec2 pq0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),pq1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),pq2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));float s=sign(e0.x*e2.y-e0.y*e2.x);
 vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));return -sqrt(d.x)*sign(d.y);}
// A leaf from its base along +x, length 1, half width wd (pointed at the tip, rounded at the base): distance (negative inside, in leaf
// units) and v, the position across it (−1 at one edge, 1 at the other).
float leafD(vec2 l,float wd,out float v){float u=sat(l.x);float hw=wd*pow(sin(PI*pow(u,.7)),.85);v=l.y/max(hw,1e-3);return max(abs(l.y)-hw,max(-l.x,l.x-1.))*.7;}
// Overlapping domes on a jittered grid (crowns of trees, clumps of leaves): the highest dome at u wins. Returns its height (0 at its
// edge), and n, its normal (x, y across the grid, z out of it).
float domes(vec2 u,float seed,out vec3 n,out vec2 cell){vec2 id=floor(u),f=fract(u);float best=-1.;vec2 bc=vec2(0.);float br=1.;cell=id;
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(i,j),h=h22(id+o+seed);vec2 c=f-o-.25-.5*h;float r=.40+.25*h.x,hg=1.-dot(c,c)/(r*r);hg=hg*r+.12*h.y;
  if(hg>best){best=hg;bc=c;br=r;cell=id+o;}}
 n=normalize(vec3(bc/br,sqrt(max(.02,1.-dot(bc,bc)/(br*br)))));return best;}

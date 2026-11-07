// The creatures of one scene, in the scene's own frame q (screen units around its pose), premultiplied over the sea drawn by
// bg.glsl, which is seen through the glass bodies, bent (uBg).
uniform vec3 uScene;  // the scene's pose: centre (x, y) and height
uniform float uTau;   // the scene's clock
uniform float uAlpha; // fades the scene left behind
uniform sampler2D uBg;
out vec4 OF;
vec4 F=vec4(0.);float PX;vec2 UV;float ASP;
// SC: the size of the local frame a creature is being drawn in (enter/leave), so that refraction offsets stay in scene units.
float SC=1.,PX0=0.;
void enter(float r){PX0=PX;PX=PX/r;SC=r;}
void leave(){PX=PX0;SC=1.;}
vec3 bgAt(vec2 offq){vec2 o=offq*(uScene.z/uCam.z)*vec2(uR.y/uR.x,1.);return vec3(textureLod(uBg,UV+o,0.).r,textureLod(uBg,UV+o*1.1,0.).g,textureLod(uBg,UV+o*1.22,0.).b);}
// A transparent part: e its own light, a how much of the sea behind it replaces (seen through it, tinted by T and bent by off).
void put(vec3 e,float a,vec3 T,vec2 off){vec3 bg=a>0.?bgAt(off):vec3(0.);F.rgb=e+a*T*bg+F.rgb*(1.-a);F.a=a+F.a*(1.-a);}
void glow(vec3 e){F.rgb+=e;}
void solid(vec3 col,float a){F.rgb=col*a+F.rgb*(1.-a);F.a=a+F.a*(1.-a);}
float cov(float d){return ss(PX,-PX,d);}
// A line of light of width w that never becomes thinner than a pixel (it gets dimmer instead).
float ln(float d,float w){float ww=max(w,PX*.7);return exp(-d/ww)*min(1.,w/(PX*.7));}
// A glass body from its signed distance d (negative inside) and the screen gradient g of d (dFdx, dFdy taken in uniform flow):
// bright rim, slight body, rainbow at the rim (iri), the sea seen through it bent towards the edges.
void glassN(float d,vec2 n,float th,vec3 tint,vec3 rimc,float iri,float seed,float opa){
 float c=cov(d),edge=ln(abs(d),.0032/SC);if(c<=0.&&edge<.003)return;
 float h=sat(-d/th),rim=pow(1.-h,2.5);vec2 off=n*(1.-sqrt(h))*th*.22*SC;
 vec3 e=c*(rimc*rim*.5+tint*.03+pal(h*1.1+seed+uG*.02)*rim*iri*.4)+rimc*edge*.4;put(e,c*opa,tint,off);}
void glass(float d,vec2 g,float th,vec3 tint,vec3 rimc,float iri,float seed,float opa){glassN(d,g/max(length(g),1e-7),th,tint,rimc,iri,seed,opa);}
#define GLASS(d,th,tint,rimc,iri,seed,opa) glass(d,vec2(dFdx(d),dFdy(d)),th,tint,rimc,iri,seed,opa)
// Hanging threads (tentacles) under a root line: n threads between x0 and x1 at height y0, length L, waving; drag: how much the
// tips lag behind the motion (dx per unit of length); returns light.
float threads(vec2 q,float x0,float x1,float y0,float L,int n,float t,float seed,float wav,float drag,float w){
 float dy=y0-q.y;if(dy<0.||dy>L*1.6)return 0.;float s=0.;
 for(int i=0;i<64;i++){if(i>=n)break;float fi=float(i),u=fi/max(1.,float(n-1)),Li=L*(.6+.7*h11(fi+seed));if(dy>Li)continue;float k=dy/Li;
  float x=mix(x0,x1,u)*(1.-.15*k)+drag*dy*dy+wav*dy*sin(dy*7.-t*1.6+fi*.9+seed)+.25*wav*dy*sin(dy*17.+t*.9+fi);
  s+=ln(abs(q.x-x),w*(1.-.5*k))*(1.-k)*(.55+.45*h11(fi*3.1+seed));}
 return s;}
// The beat of a swimming bell or fin: a quick closing and a slow opening; period P, phase o; 0 open .. 1 closed.
float beat(float t,float P,float o){float ph=fract(t/P+o);return ph<.28?ss(0.,.28,ph):1.-ss(.28,1.,ph);}
// How far something that swims by beats has gone after t seconds: one step per beat, taken while the bell closes.
float jet(float t,float P,float o){float n=t/P+o;return floor(n)+ss(.02,.55,fract(n));}
// Wraps a coordinate into [a, b): creatures that leave on one side come back on the other, out of sight.
float wrap(float x,float a,float b){return a+mod(x-a,b-a);}
// A dome (bell) of radius r and height h above y=0, cut a little below; distance negative inside.
float sdDome(vec2 l,float r,float h,float cut){return max(sdEll(l,vec2(r,h)),-l.y-cut);}

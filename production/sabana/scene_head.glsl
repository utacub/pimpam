// The animals and the near scenery of one scene, in the scene's own frame q (screen units around its pose), premultiplied over the
// backdrop drawn by bg.glsl (uBg, read back for the shadows, which darken what is already there).
uniform vec3 uScene;  // the scene's pose: centre (x, y) and height
uniform float uTau;   // the scene's clock
uniform float uAlpha; // fades the scene left behind
uniform sampler2D uBg;
out vec4 OF;
vec4 F=vec4(0.);float PX;vec2 P;float ASP,G0;
// AL: a factor on the coverage of everything drawn (for parts under water, or fading in); 1 normally.
float AL=1.;
vec3 bgHere(){return texelFetch(uBg,ivec2(gl_FragCoord.xy),0).rgb;}
void solid(vec3 col,float a){a*=AL;F.rgb=col*a+F.rgb*(1.-a);F.a=a+F.a*(1.-a);}
// Multiplies everything already there (the backdrop and what this scene has drawn) by mix(1, M, s): shadows and thin coloured paper.
void shade(float s,vec3 M){if(s<=.002)return;vec3 below=F.rgb+(1.-F.a)*bgHere();vec3 k=s*(vec3(1.)-M);float a=max(k.r,max(k.g,k.b));if(a<=.002)return;
 solid(below*(a-k)/a,a);}
void glow(vec3 e){F.rgb+=e;}
float cov(float d){return ss(PX,-PX,d);}
// The frame of a sheet at depth z behind the plane of the scene (negative: in front), in scene units, and its pixel size.
vec2 at(float z){vec2 L=uCam.xy+(P-HOR)*(uCam.z+z)+HOR*uCam.z;return (L-uScene.xy)/uScene.z;}
float pxAt(float z){return (uCam.z+z)/(uScene.z*uR.y);}
// Decor pieces of the scene (ground, water, trees, rocks) follow the decor setting: dimmed towards the base, or not drawn.
float DEC(){return uDecor>1.5?0.:1.;}
vec3 decCol(vec3 c){return uDecor>.5&&uDecor<1.5?mix(baseCol(),c,uOpacity):c;}
// ---- Pieces of paper ----
// A soft shadow of a piece whose distance at the shadow's place is ds, lifted lift above what is under it: the farther the lift, the
// softer and farther the shadow (the offset itself is applied by the caller: evaluate the shape at q - SHD*lift). Blue in the day.
void dropShadow(float ds,float lift,float k){float soft=PX*1.5+lift*.55;float s=ss(soft,-soft,ds)*k*mix(.50,.30,NIGHT);
 shade(s,mix(vec3(.50,.52,.70),vec3(.45,.40,.62),GLOW));}
// A piece cut from coloured card: flat colour with the fibre of the paper; a soft bevel where the paper bends near its edge (lit on the
// sun side); the white core of the card at the cut edge, brighter towards the light; trans: how much light passes through it from behind.
// d: distance (scene units, negative inside); g: its screen gradient (dFdx, dFdy) for the bevel; u: coordinates for the fibre.
void cutN(float d,vec2 g,vec3 alb,vec2 u,float trans,float bev){float c=cov(d);if(c<=0.)return;
 vec2 n2=g/max(length(g),1e-7);float e=1.-sat(-d/max(bev,1e-4));vec3 n=normalize(vec3(n2*e*.55,1.));
 vec3 col=litN(alb,n,trans)*(1.+fibre(u)*.45);
 float core=ss(-PX*2.2,-PX*.4,d)*(.35+.45*sat(dot(n2,normalize(SUN.xy+vec2(1e-4)))*.5+.5));
 col=mix(col,litFlat(mix(alb,vec3(.95,.93,.88),.75),.3)*1.05,core*.8);
 solid(col,c);}
#define CUT(d,alb,u,trans,bev) cutN(d,vec2(dFdx(d),dFdy(d)),alb,u,trans,bev)
// A piece of torn paper (landscape): a ragged fringe of lighter fibres along the edge, glowing when the sun is low behind it.
void tornN(float d,vec3 alb,vec2 u,float trans,float fringe){float c=cov(d);if(c<=0.)return;
 vec3 col=litFlat(alb,trans)*(1.+fibre(u)*.5);float r=ss(-fringe,-PX*.3,d);col=mix(col,col*1.2+SUNC*(.08+.3*GLOW),r*.55);solid(decCol(col),c*DEC());}
// Thin paper (tissue) lit from behind: it tints what is behind it and adds a little of its own light; edges a little denser.
void tissue(float d,vec3 tint,float a,vec3 own){float c=cov(d)*a;if(c<=0.)return;float r=ss(-PX*3.,-PX*.3,d);shade(c*(1.+.3*r),tint);glow(own*c);}
// An eye of a paper animal: a dark disc with a white glint; blink: 0 open .. 1 shut.
void eye(vec2 q,vec2 c,float r,float blink){vec2 l=q-c;l.y/=max(.08,1.-blink);float d=length(l)-r;if(d>PX*2.)return;
 solid(vec3(.015,.012,.010),cov(d));solid(vec3(.95),cov(length(q-c-vec2(-.3,.35)*r)-r*.32)*(1.-blink));}
// The smooth blinks of an eye: shut briefly every few seconds.
float blinkAt(float t,float seed){float ph=fract(t/4.1+seed);return ss(.0,.03,ph)*ss(.08,.05,ph);}
// The slow grass and stage floor of a scene: a strip of torn paper with its top cut into blades at height top (scene units).
float grassEdge(float x,float top,float hgt,float seed){float a=0.;for(int i=0;i<2;i++){float fi=float(i),u=x*(38.+fi*21.)+seed+fi*.3,id=floor(u),tri=1.-2.*abs(fract(u)-.5),h=h11(id+seed+fi*7.);
  a=max(a,pow(tri,2.+2.5*h)*(.3+.7*h));}return top+hgt*a*(.5+.5*ss(.3,.7,vn(vec2(x*4.+seed,1.))));}
// ---- The frame of a sheet at another depth, in screen-like units (at rest it matches the screen; during a travelling it moves with
// the right parallax): z behind the plane of the scene (negative: in front). Its pixel size.
vec2 atS(float z){float k=uScene.z/(uScene.z+z);return (at(z)-HOR)*k+HOR;}
float pxS(float z){return pxAt(z)*uScene.z/(uScene.z+z);}
// ---- Puppets ----
// The knee of a limb of two bones (l1, l2) from a to b, bending to the side bs (1: the knee towards +x when the limb hangs down).
vec2 knee(vec2 a,vec2 b,float l1,float l2,float bs){vec2 d=b-a;float L=clamp(length(d),1e-4,l1+l2-1e-4);vec2 u=d/max(length(d),1e-5);
 float x=(L*L+l1*l1-l2*l2)/(2.*L);float h=sqrt(max(0.,l1*l1-x*x));return a+u*x+vec2(-u.y,u.x)*bs*h;}
// The small brass fastener that joins two pieces of a paper puppet.
void brad(vec2 q,vec2 c,float r){float d=length(q-c)-r;if(d>PX*2.)return;vec3 g=litFlat(vec3(.78,.60,.30),.0);
 solid(mix(g*.7,g*1.25,ss(r,-r,dot(q-c,normalize(SUN.xy+vec2(1e-4)))*1.4)),cov(d));}
// The shadow of a piece of a puppet on the piece under it (ds: the piece's distance at q - SHD*lift).
void under(float ds,float lift){shade(ss(PX*1.5+lift*.4,-PX,ds)*(.38-.18*NIGHT),vec3(.42,.42,.62));}
// A soft dark place on the ground where a foot or a body touches it.
void contact(vec2 q,vec2 c,float w){float d=length((q-c)/vec2(w,w*.22));shade(ss(1.,.2,d)*(.40-.15*NIGHT),vec3(.40,.40,.58));}
// The floor of the scene: a strip of torn paper at depth z (screen-like units, atS) whose top, at height top, is cut into grass; it casts
// its shadow on what is behind. alb: its colour (grassAlb of the place, usually).
float floorD(vec2 u,float top,float hgt,float seed){return u.y-grassEdge(u.x,top,hgt,seed);}
void floorStrip(float z,float top,float hgt,vec3 alb,float seed){if(uDecor>1.5)return;vec2 u=atS(z);float px=pxS(z);
 vec2 us=u-SHD*.035;float ds=floorD(us,top,hgt,seed);shade(ss(px*2.+.012,-px,ds)*(.50-.25*NIGHT)*(uDecor>.5?uOpacity:1.),vec3(.50,.52,.76));
 float d=torn(floorD(u,top,hgt,seed),u,.003,30.);float c=ss(px,-px,d);if(c<=0.)return;
 vec3 col=litFlat(alb,.3)*(1.+fibre(u*1.3)*.4);col=mix(col,col*1.25+SUNC*(.06+.3*GLOW),ss(-px*3.,-px*.3,d)*.5);col*=1.-.18*ss(0.,-.25,u.y-top);
 solid(decCol(col),c);}
// The hour and its lights, for a scene: the sun is low (dawn, sunset), it is night.
float LOW(){return GLOW;}

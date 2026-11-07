// ---- One scene: its fossil in the rock, and its window of life. The scene file (scene_NN.glsl) gives:
//   const vec2 WIN_C       the centre of the window of life (scene units), on the body of the main animal: the window opens from there;
//   void fossil(vec2 q)    the skeleton(s) in the rock, drawn while the scene is stone (PIECE with K_FOSSIL, dec 0);
//   void life(vec2 q,float t)  the living scene at its clock t (seconds after its press): its light, the backdrop (dec 1), the plants,
//                          the animals (dec 0) whose flesh grows from their bones while GROW is small (flesh(), BONES()).
// The frame q: screen units when the camera rests on the scene (y up, -.5 .. .5 the screen height; x ± ASP, about ±.89 on 16:9).
uniform vec3 uScene;  // the scene's pose: centre (x, y) and height, in the world
uniform float uTau;   // the scene's clock: seconds since its press (it slows to a stop while waiting for the next press)
uniform float uLife;  // 0 stone .. 1 alive (the window of life opens, then the flesh grows from the bones)
vec2 Q;float ASP,RFULL,GROW=1.;
vec2 at(vec2 p){return (uCam.xy+p*uCam.z-uScene.xy)/uScene.z;}
// ---- Bodies ----
// The body where its flesh has grown out from its bones: d the body, dB the bones (both distances). With GROW large it is the body.
float flesh(float d,float dB){return max(d,dB-GROW);}
// The bones still show while the flesh is growing (draw them under the body with K_BONE while this is true).
bool BONES(){return GROW<.5;}
// The knee of a limb of two bones (l1, l2) from a to b, bending to the side bs (1: the knee towards +x when the limb hangs down).
vec2 knee(vec2 a,vec2 b,float l1,float l2,float bs){vec2 d=b-a;float L=clamp(length(d),1e-4,l1+l2-1e-4);vec2 u=d/max(length(d),1e-5);
 float x=(L*L+l1*l1-l2*l2)/(2.*L);float h=sqrt(max(0.,l1*l1-x*x));return a+u*x+vec2(-u.y,u.x)*bs*h;}
// A step cycle: for phase ph (0..1), the foot's lift (0 on the ground) and how far it is along its stride (-.5 .. .5).
vec2 stepCycle(float ph,float duty){ph=fract(ph);if(ph<duty){return vec2(0.,.5-ph/duty);}float u=(ph-duty)/(1.-duty);return vec2(sin(PI*u),-.5+u);}
// The smooth blinks of an eye: shut briefly every few seconds (0 open .. 1 shut).
float blinkAt(float t,float seed){float ph=fract(t/4.3+seed);return ss(.0,.025,ph)*ss(.075,.05,ph);}
// A modelled animal eye at c, radius r: a dark rim, the iris (its colour) with a darker edge and a lighter lower half, the pupil (slit:
// 0 round, 1 a vertical slit), a wet highlight towards the light, a lid of the skin's colour that closes with blink and casts a shadow.
void eyeA(vec2 q,vec2 c,float r,vec3 iris,vec3 lid,float blink,float slit){vec2 l=q-c;float d=length(l)-r;if(d>PX*4.)return;
 float a=cov(d);vec3 col=iris*(.55+.55*ss(r*.2,-r*.9,l.y))*mix(.55,1.,ss(r,r*.55,length(l)));
 float pd=slit>.5?length(l*vec2(1./.32,1.))-r*.62:length(l)-r*.42;col=mix(col,vec3(.012),ss(PX*.8,-PX*.8,pd));
 col=mix(col,vec3(1.),ss(r*.28,r*.10,length(l-vec2(-.32,.36)*r))*.9);col=mix(col,col*.35,ss(r*.25,r,l.y)*.6);
 col=mix(col,vec3(.02),ss(-PX*1.6,0.,d));
 float lidY=mix(r*1.05,-r*1.05,blink);float ld=l.y-lidY;col=mix(col,lid*(.55+.45*ss(-r,r,l.y)),ss(-PX,PX,ld));
 col=mix(col,col*.5,ss(r*.35,0.,abs(ld))*(1.-step(0.,ld))*.6*(1.-blink));
 F=vec4(col,1.)*a+F*(1.-a);}
// A soft dark place on the ground under a foot or a body (always drawn: the plan's «ombra de contacte»).
void contact(vec2 q,vec2 c,float w,float k){float d=length((q-c)/vec2(w,w*.22));shadow(ss(1.,.15,d)*k,vec3(.30,.30,.40),0.);}
// ---- Backdrops (decor) ----
// A painted sky from hor (at the horizon y) to top, with visible soft strokes.
void sky(vec2 q,vec3 top,vec3 hor,float horY){vec3 c=mix(hor,top,ss(horY,horY+.65,q.y));PIECE(-1.,c,K_SKY,q,vec2(1,0),.1,0.,1.);}
// A sun (or a bright patch of sky) at c: a soft disc and its glow over the sky (decor).
void sunDisc(vec2 q,vec2 c,float r,vec3 col,float k){float d=length(q-c);glow(col*k*(ss(r*1.1,r*.9,d)*.9+.35*exp(-d/(r*4.))),1.);}
// The silhouette of a far range: its top at height base + amp · (noise of x), at a depth z (0 near .. 1 far): bluer and paler with z.
float ridge(float x,float base,float amp,float freq,float seed){return base+amp*(fbm(vec2(x*freq+seed,seed))*1.2-.35);}
void range(vec2 q,float base,float amp,float freq,float seed,vec3 col,vec3 skyCol,float z){float top=ridge(q.x,base,amp,freq,seed);
 PIECE(q.y-top,mix(col,skyCol,z*.7),K_FAR,q*vec2(1.,1.)+seed,vec2(1,0),.08,.15*(1.-z),1.);}

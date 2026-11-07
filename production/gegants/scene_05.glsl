// ---- Scene 6: the bluefin tuna (the Strait of Gibraltar, clear blue water) ----
// 2.3–7 s a river of great tuna, 2.5 m each, streams in from the left, the camera panning with it; about 7 s the whole school turns at
// once, a wave running from the front to the back: each fish dips and rolls its silver flank to the light, a flash of silver passing
// through the school; then they swim on and out to the right. (Atlantic bluefin pass through the strait between the Atlantic and their
// spawning grounds in the Mediterranean; Block et al., 2005.)
// The school is laid out on the screen (each fish at its own distance m, smaller and hazier further off).
const float LT=.25;
const int NF=40;
// fish i: how far behind the front, its height, its distance, its own phase
vec4 fishI(int i){float fi=float(i);float h1=h11(fi*1.73+.3),h2=h11(fi*2.91+1.7),h3=h11(fi*.77+4.1);
 float m=1.90-1.18*fi/float(NF-1);           // the farthest first
 return vec4(1.40*h1,.36*(h2-.5)*2.+.05*(m-1.),m,h3);}
float frontX(float T){return -1.05+.30*(T-2.3);}
float turnT(vec4 F){return 6.9+.32*F.x/1.40+.10*F.w;}
// The tuna in its own frame (x from the snout back, y up; world units): spindle body, sickle fins, finlets, crescent tail
float tunaD(vec2 q,float beat,out float u){float s=q.x/LT;
 float h=LT*(.125*pow(ss(.0,.40,s),.55)*pow(1.-ss(.40,.93,s),.85)+.013*ss(.6,.9,s));float c=LT*.010*ss(.0,.3,s)*(1.-ss(.5,.9,s));
 float d=abs(q.y-c)-h;d=max(d,-q.x+.004*LT);d=max(d,q.x-.97*LT);u=clamp((q.y-c)/max(h,1e-4),-1.,1.);
 // second dorsal and anal: tall sickles
 d=min(d,sdTri(q,vec2(.52*LT,.090*LT),vec2(.63*LT,.200*LT),vec2(.60*LT,.060*LT))-.002);
 d=min(d,sdTri(q,vec2(.55*LT,-.085*LT),vec2(.66*LT,-.185*LT),vec2(.63*LT,-.055*LT))-.002);
 // finlets: a row of small points above and below the tail stock
 float fx=(s-.68)/.04;if(s>.66&&s<.90){float fl=fract(fx)-.5;float hh=h+LT*.018;d=min(d,max(abs(fl)*.04*LT-.0025*LT,abs(abs(q.y-c)-hh+.004*LT)-.006*LT)-.001);}
 // the crescent tail, narrowing and widening with the beat as it swings across
 vec2 t=q-vec2(.93*LT,0.);float sw=.55+.45*abs(cos(beat));
 float lu=sdCap(t,vec2(0.,.004*LT),vec2(.15*LT*sw+.02*LT,.19*LT),.030*LT,.004*LT),ll=sdCap(t,vec2(0.,-.004*LT),vec2(.15*LT*sw+.02*LT,-.19*LT),.030*LT,.004*LT);
 float tail=min(lu,ll);tail=max(tail,-sdCap(t,vec2(.26*LT*sw+.06*LT,.0),vec2(.26*LT*sw+.06*LT,.0),.17*LT,.17*LT));d=min(d,tail);
 // the pectoral fin: short, swept back
 return d;}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.15,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.020,.170,.330);
 KD=vec3(2.7,.60,.28);KH=vec3(2.3,.62,.36);VEIL=vec3(.015,.10,.20);
 BG=openWater(w,T,1.2,1.2);
 float wpx0=WPX;
 for(int i=0;i<NF;i++){vec4 F=fishI(i);float m=F.z;
  float tt=turnT(F);float u=sat((T-tt+.65)/1.3);float dive=-.08*ss(.0,1.,u);float th=-.40*sin(PI*u);
  vec2 ps=vec2(frontX(T)-F.x,F.y+dive+.012*sin(T*1.1+F.w*9.));
  float len=LT/(VH*m);if(abs(P.x-ps.x+len*.45)>len*.75||abs(P.y-ps.y)>len*.40)continue;
  // into the fish's frame, in world units
  vec2 q=rot(-th)*(P-ps)*VH*m;q=vec2(-q.x,q.y);   // swimming to the right: x back from the snout
  WPX=wpx0*m;float beat=TAU*1.6*T+F.w*TAU;
  float uu;float d=tunaD(q,beat,uu);float a=covW(d);if(a<.002)continue;
  float wy=CAM.y+ps.y*VH*m;float zz=max(-wy,0.);
  vec3 E=lightAt(zz)*1.8;vec3 amb=waterCol(zz)*1.4+vec3(.01,.02,.03);
  // the roll and the flash: the silver flank turned up to the light as it turns
  float fl=exp(-pow((T-tt)/.24,2.));
  float s=q.x/LT;bool body=abs(uu)<.999&&s>.0&&s<.93;
  vec3 n=normalize(vec3(0.,uu*.9,sqrt(max(1.-uu*uu*.8,.05))));
  vec3 back=vec3(.012,.024,.065),flank=vec3(.42,.47,.53),belly=vec3(.70,.72,.75);
  vec3 alb=mix(belly,flank,ss(-.75,-.20,uu));alb=mix(alb,back,ss(-.05,.25,uu+.05*sin(s*60.)));
  alb=mix(alb,alb*.80,ss(.6,.9,vn(vec2(s*40.,uu*3.)))*ss(.3,-.3,uu)*.5);     // faint bars on the flank
  vec3 c=lit(alb,n,E,amb,.30)+rimL(n,E,.20);
  // the silver: a mirror of the bright water above, strongest as it rolls
  float mir=ss(-.80,-.40,uu)*(1.-ss(-.10,.15,uu));c+=lightAt(zz)*vec3(.75,.88,1.)*(.15+2.2*fl)*mir;
  if(!body){vec3 fc=back*1.4+vec3(.03);if(s>.64&&s<.92&&abs(uu)>.9)fc=vec3(.42,.36,.08);c=lit(fc,vec3(0.,.3,.95),E,amb,.3);}
  // the eye
  if(body)c=eyeC(c,P*VH*m,(ps+rot(th)*vec2(-.075*LT,.020*LT)/(VH*m))*VH*m,.013*LT,E,vec3(.05,.05,.04));
  c*=1.-.30*edgeK(d);
  c=fogW(c,.06+.22*VH*m+.15*(m-1.),zz);
  putF(c,a);}
 WPX=wpx0;
}

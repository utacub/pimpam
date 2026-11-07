// ---- Scene 18: the southern right whale and her calf (Península Valdés, Argentina; shallow green water near the surface) ----
// 2–5.4 s a southern right whale, 14 m, black, without a dorsal fin, the pale rough callosities on her head, glides in from the
// right below the surface; her calf swims over her head. 5.4–9.8 the calf rolls right round once beside her, its pale belly and
// its flippers turning up to the light, and rises to touch the surface (rings spread on it) before it comes back down to her.
// 9.6–11.6 the mother tips her head down: her back arches, her tail rises up through the surface (white water and bubbles where
// it goes out), and she slides away down into the green; 12.3 the tail slips back under in a cloud of bubbles; the calf follows.
// The whale is drawn on its spine; the calf's roll moves its pattern, callosities and flippers round its body (angle g, 0 = back).
const float LRW=1.30,LRC=.50;
float TOPR[11]=float[11](.014,.062,.094,.112,.124,.126,.116,.094,.064,.034,.016);
float BOTR[11]=float[11](.024,.092,.126,.142,.142,.132,.112,.084,.054,.028,.016);
// the mouth line (the narrow arched upper jaw over the great lower lips), from the axis, in body lengths
float mouthR(float s){return -.012+.060*sin(PI*sat(s/.31));}
// ---- the mother: along at first, then the pitch round a point a third of the way back, then the slide down ----
float rmAng(float T){return T<9.6?PI+.025*sin(T*.6):PI+1.10*ss(9.6,11.4,T);}
vec2 rmHead(float T){
 if(T<9.6)return vec2(1.65-.19*(T-2.),-.42+.02*sin(T*.5));
 vec2 h0=vec2(1.65-.19*7.6,-.42+.02*sin(4.8));vec2 pv=h0+vec2(.38*LRW,0.)+vec2(-.10,-.06)*ss(9.6,11.6,T);
 float a=rmAng(T);vec2 dv=vec2(cos(a),sin(a));vec2 h=pv+dv*.38*LRW;
 float v=max(T-11.6,0.);return h+dv*(.30*v+.16*v*v);}
// where her axis meets the surface while her tail is up (she slides along her own axis, so it stays put)
// (found on her spine, which must be set: the last point where it comes up through y = 0, from the head back)
float XCR=0.;
void rmCrossSet(){XCR=SP[NS].x;for(int i=0;i<NS;i++){vec2 a=SP[i],b=SP[i+1];if(a.y<0.&&b.y>=0.){XCR=mix(a.x,b.x,-a.y/(b.y-a.y));break;}}}
// ---- the calf: over her head, the roll and the rise to the surface, then down after her ----
float rcRoll(float T){return TAU*ss(5.4,9.8,T);}
vec2 rcHead(float T){
 float up=.30+.12*ss(5.6,7.6,T)*(1.-ss(7.9,9.4,T));
 vec2 h=vec2(rmHead(min(T,9.6)).x-.08-.03*sin(T*.7),rmHead(min(T,9.6)).y+up+.01*sin(T*1.3));
 if(T>9.6){float v=T-9.6;float a=PI+.85*ss(9.8,11.4,T);h+=vec2(-.12*v,0.)+vec2(cos(a)+1.,sin(a))*(.10*v+.10*v*v);}
 return h;}
float rcAng(float T){return PI-.30*ss(5.8,7.0,T)*(1.-ss(7.4,8.2,T))+.22*ss(7.8,8.6,T)*(1.-ss(9.0,9.8,T))+.85*ss(9.8,11.4,T)+.02*sin(T*.9);}
// One right whale on the current spine: far flipper, body, near flipper. roll: about its long axis (0: back up); kind 0 mother, 1 calf.
void rwDraw(vec2 w,float T,float L,float beat,float roll,float kind,float fogX){
 if(spineNear(w)>.34*L)return;
 vec3 f=bodyF(w);float s=f.x;float dB=bodyD(f.xy,TOPR,BOTR);
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);
 float dK=flukeD(tq,.17*L,.08+.18*abs(sin(beat-1.))+.55*abs(sin(roll)),0.);
 float dS=min(dB,dK);
 // the flippers: broad paddles from the lower flanks (g = +-2.3 round the body), turned with the roll
 float tt3=prof(.30,TOPR)*L,bb3=prof(.30,BOTR)*L;float c0=(tt3-bb3)*.5,R3=(tt3+bb3)*.5;vec2 dv=bodyDir(.30),nr=bodyNrm(.30);
 float dFn=1e5,dFf=1e5;
 for(int i=0;i<2;i++){float g=(i==0?2.3:-2.3)+roll;float vr=c0+R3*.80*cos(g);vec2 fa=bodyPt(.30,vr);
  float ou=cos(g);float flap=.10*sin(T*1.6+float(i))*kind;vec2 ft=fa-dv*(.080+.03*kind)*L+nr*(.165*L)*(ou+flap)-nr*.02*L*sin(g)*sin(g);
  vec2 fd=ft-fa;float fl=length(fd);vec2 lq=rot(atan(fd.y,fd.x))*(w-fa);
  float d=max(sdEll(lq-vec2(fl*.55,0.),vec2(max(fl*.56,.035*L),(.026+.016*abs(sin(g)))*L)),-lq.x);
  d=min(d,sdCap(w,fa,mix(fa,ft,.3),.020*L,.026*L));
  if(sin(g)>0.)dFn=min(dFn,d);else dFf=min(dFf,d);}
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.45;vec3 amb=waterCol(zz)*.95+vec3(.004,.008,.008);
 float surf=ss(.004,-.002,w.y);
 float fogD=.08+.13*VH+.9*max(zz-.45,0.)+fogX;
 vec3 base=kind>.5?vec3(.055,.060,.064):vec3(.020,.020,.023);
 // the far flipper (behind the body)
 {float a=covW(dFf)*surf;if(a>.002){vec3 c=lit(base*1.1,vec3(0.,0.,1.),E*.7,amb,.10)*(1.-.35*edgeK(dFf));putF(fogW(c,fogD+.02,zz),a);}}
 // the body
 {float a=covW(dS)*surf;if(a>.002){
  float u=bodyU(f.xy,TOPR,BOTR);vec3 n=tubeN(f.xy,u);
  float g=acos(clamp(u,-1.,1.))-roll;g=abs(mod(g+PI,TAU)-PI);       // round the body from the back (0) to the belly (PI), both sides alike
  vec2 q=vec2(s*L*10.,f.y*25.);float m=fbm(q);
  vec3 alb=base*(.85+.35*m);
  // the white belly blaze (and the calf's paler belly)
  float bl=ss(.55,.90,-cos(g)+.25*(fbm(q*.5+7.)-.5))*ss(.34,.40,s+.04*(fbm(q*.7)-.5))*ss(.56,.48,s+.05*(fbm(q*.6+3.)-.5));
  alb=mix(alb,vec3(.66,.68,.68),bl*(kind>.5?.85:.55));
  // the callosities: rough pale patches on the crown of the head, above the eye, along the lower lips and on the chin
  float tt=prof(s,TOPR)*L,bb=prof(s,BOTR)*L;float cc=(tt-bb)*.5,RR=max((tt+bb)*.5,1e-4);
  float gm=acos(clamp((mouthR(s)*L-cc)/RR,-1.,1.));                  // the mouth line's angle round the body here
  float cal=0.;vec2 ga=vec2(s,g);
  cal=max(cal,ss(1.,.6,length((ga-vec2(.030,.15))/vec2(.030,.60))));
  cal=max(cal,ss(1.,.5,length((ga-vec2(.085,.22))/vec2(.012,.30))));
  cal=max(cal,ss(1.,.5,length((ga-vec2(.125,.28))/vec2(.011,.28))));
  cal=max(cal,ss(1.,.5,length((ga-vec2(.165,.20))/vec2(.010,.25))));
  cal=max(cal,ss(1.,.5,length((ga-vec2(.290,gm-.30))/vec2(.012,.22))));
  cal=max(cal,ss(.10,.0,abs(g-gm-.20-.06*sin(s*90.))-.08)*ss(.05,.08,s)*ss(.23,.19,s)*ss(.35,.55,vn(vec2(s*L*40.,3.))));
  cal=max(cal,ss(1.,.5,length((ga-vec2(.040,2.55))/vec2(.016,.30))));
  float rough=fbm(vec2(s*L*90.,g*14.));cal=ss(.35,.65,cal+.45*(fbm(vec2(s*L*45.,g*7.)+5.)-.5));cal*=kind>.5?.55:1.;
  alb=mix(alb,vec3(.50,.42,.30)*(.55+.55*rough)*(1.-.45*ss(.62,.72,vn(vec2(s*L*220.,g*30.)))),cal);
  vec3 c=lit(alb,n,E,amb,.08)+rimL(n,E,.14);
  // the light through the surface plays on the back
  c+=E*.10*caust(w*3.+vec2(T*.03,0.),T*.6)*sat(n.y*.8+.3)*exp(-zz*2.);
  
  // the bowed mouth line, the eye just above its corner (the near-side one while it shows)
  float gl=abs(g-gm)*RR*max(sin(acos(clamp(u,-1.,1.))),.25);c*=1.-.70*ss(.004*L,.0015*L,gl)*ss(.31,.28,s)*ss(.0,.02,s);
  for(int i=0;i<2;i++){float ge=(i==0?1.:-1.)*(gm-.18)+roll;if(sin(ge)<.15)continue;
   float te=prof(.33,TOPR)*L,be=prof(.33,BOTR)*L;vec2 ep=bodyPt(.33,(te-be)*.5+(te+be)*.5*cos(ge));
   c=mix(c,c*.6,ss(.012*L,.008*L,length(w-ep)));c=eyeC(c,w,ep,.0055*L,E,vec3(.02));}
  // the twin blowholes on the crown
  vec2 bh=bodyPt(.24,prof(.24,TOPR)*L*.92*cos(roll));if(cos(roll)>.3)c*=1.-.55*ss(.008*L,.004*L,length((w-bh)*vec2(1.,1.8)));
  c*=1.-.35*edgeK(dS);
  putF(fogW(c,fogD,zz),a);}}
 // the near flipper
 {float a=covW(dFn)*surf;if(a>.002){vec3 c=lit(base*1.3+vec3(.02)*kind,vec3(-nr*.25,.95),E*.9,amb,.12)*(1.-.35*edgeK(dFn));putF(fogW(c,fogD,zz),a);}}
}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.30,1.));SUNC=vec3(1.0,.98,.88);WAT0=vec3(.020,.140,.125);
 KD=vec3(2.3,.52,.66);KH=vec3(2.0,.62,.80);VEIL=vec3(.015,.11,.10);
 // the mother's spine first: where her body meets the surface (for the white water)
 float bm=TAU*.22*T;float ar=ss(9.6,11.4,T)*(1.-ss(11.6,12.8,T));
 spine2(rmHead(T),rmAng(T),LRW,-1.,.035+.02*ss(11.6,12.4,T),bm,-.10*ar,-.30*ar);rmCrossSet();
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.45+.95*ss(-.7,.55,P.y));
 wc+=lightAt(z)*vec3(.70,.85,.65)*.32*shafts(w*vec2(.9,1.),T*.7)*ss(-.7,.5,P.y);wc+=lightAt(z*.7+.1)*.28*snow(P,T);
 // the surface overhead: rings where the calf touches it, white water where the mother's tail goes out and back in
 float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.10,1.);vec3 c=wc;
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*5.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.6);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  float ring=0.;vec2 rq=vec2(X-rcHead(7.6).x+.03,(dd-1.)*1.2*VH);float rr=length(rq);
  for(int i=0;i<3;i++){float age=sat((T-7.5-float(i)*.30)/1.8);ring+=(1.-age)*step(.001,age)*exp(-pow((rr-.01-.28*age)/(.006+.012*age),2.));}
  // the tail: out through the surface 10.6–12.3, back under at 12.3
  float xc=XCR;
  vec2 tq=vec2((X-xc)/.26,(dd-1.)*1.2*VH/.22);float tr=length(tq);
  float wh=ss(10.5,11.0,T)*(1.-ss(12.8,13.8,T))*ss(1.,.3,tr+.5*(fbm(q*3.+T*.4)-.5));
  float ring2=0.;for(int i=0;i<2;i++){float age=sat((T-12.3-float(i)*.35)/1.8);ring2+=(1.-age)*step(.001,age)*exp(-pow((length(tq*vec2(.30,.16))-.03-.32*age)/(.008+.014*age),2.));}
  vec3 sc=WAT0*vec3(1.2,1.4,1.3)*(1.1+1.3*ov)+SUNC*vec3(.80,.92,.90)*(.05+.40*ov)*(.45+.55*gl+1.5*ring+1.5*ring2);
  sc=mix(sc,SUNC*vec3(.86,.94,.92)*1.05,wh*.92);
  vec3 tf=exp(-KH*camDist()*1.4*max(dd-.25,0.));c=sc*tf+wc*(1.-tf);}
 BG=c;
 // ---- the mother ----
 spine2(rmHead(T),rmAng(T),LRW,-1.,.035+.02*ss(11.6,12.4,T),bm,-.10*ar,-.30*ar);
 rwDraw(w,T,LRW,bm,0.,0.,2.4*ss(12.4,14.5,T)*ss(12.4,14.5,T));
 // the bubbles from the tail going back under
 {float tb=T-11.0;if(tb>0.&&tb<3.5&&w.y<0.){float xc=XCR;float k=ss(.0,.4,tb)*(1.-ss(2.,3.5,tb));
  bubbleCloud(w,vec2(xc-.03*tb,-.06-.06*tb),vec2(.07+.04*tb,.05+.05*tb),tb,k*.85,.10+.13*VH);}}
 // the white water where her body goes out through the surface: a skirt of foam round it, streaming bubbles
 {float k=ss(10.4,10.9,T)*(1.-ss(12.3,13.2,T));if(k>.001&&w.y<.004){float xc=XCR;
  vec2 q=vec2((w.x-xc)/.20,(w.y+.010)/.040);float e=length(q)+.55*(fbm(w*vec2(22.,30.)+vec2(0.,-T*1.5))-.5);
  float fo=ss(1.,.45,e)*ss(.004,-.002,w.y);float str=ss(.40,.70,fbm(vec2(w.x*40.,w.y*14.-T*2.5)));
  putF(lightAt(.02)*vec3(.80,.92,.90)*(.75+.35*str),fo*k*(.55+.40*str));}}
 // ---- the calf ----
 float bc=TAU*.34*T;
 spine2(rcHead(T),rcAng(T),LRC,-1.,.06,bc,.06*sin(T*.8),0.);
 rwDraw(w,T,LRC,bc,rcRoll(T),1.,1.6*ss(12.6,14.5,T)*ss(12.6,14.5,T));
 // a few small bubbles from the calf's blowholes as it comes back down from the surface
 {float tb=T-7.9;if(tb>0.&&tb<2.){vec2 b0=bodyPt(.24,.10*LRC);
  for(int i=0;i<6;i++){float fi=float(i);float ti=tb-fi*.12;if(ti<0.)continue;vec2 bp=b0+vec2(.02*sin(ti*9.+fi),.12*ti+.02*fi);
   float r=.005+.002*h11(fi);float dB=length(w-bp)-r;float a=covW(dB)*(1.-ss(1.2,2.,tb))*ss(.0,-.005,bp.y);
   if(a>.002){float zz=max(-w.y,0.);putF(lightAt(zz)*vec3(.90,.98,.96)*(.7+.6*ss(r,.0,length(w-bp-vec2(-.3,.4)*r))),a*.8);}}}}
}

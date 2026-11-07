// ---- Scene 19 (El pou del temps, CE37): Stenopterygius quadriscissus, ichthyosaurs of the Posidonia Shale sea (Early Jurassic,
// Toarcian, about 182 million years ago, south-west Germany). An over-under view: the camera sits at the surface of a warm, clear
// epicontinental sea, the waterline across the picture; above it a hazy summer sky and a low far coast, below it the blue-green water
// with shafts of light from the surface, slow caustics, drifting particles, ammonites (Harpoceras, Dactylioceras), a far school of
// small fish, and a drifting log with a colony of the sea lily Seirocrinus hanging under it. Story: a group of three ichthyosaurs
// cruises slowly at mid-depth, side by side in a loose echelon; 3.8-4.8 s they swim up together; from 4.6 s one after another
// they leap out of the water like porpoising dolphins (each breathes as it leaves the water: a soft puff; leaps topping at 5.1,
// 6.15 and 7.2 s) and go back in (5.6, 6.7, 7.8 s), trailing clouds of bubbles while they glide back down, the leader deepest. 9.4-11.0 s (the echo) a fourth passes close to the camera, slows, turns its big eye on us and swims on;
// the ammonites in its way jet gently aside. No predation. .17/.15/.13 screen units per metre for the group, .36 for the near one. ----

const float IC_WL=.10;                        // the waterline (screen y)
const float IC_HZ=.138;                       // the far horizon, a little above it
const float IC_L=2.6;                         // the length of a Stenopterygius (m)
const float IC_S[4]=float[](.17,.15,.13,.36); // screen units per metre: the group (near to far) and the one that passes close
const float IC_TM[3]=float[](5.10,6.15,7.20);  // the top of each leap
const float IC_X0[3]=float[](-.60,-.54,-.48);  // x of its centre of mass at rest
const float IC_YR[3]=float[](-.06,-.21,-.36); // its depth at rest
const float IC_YE[3]=float[](-.36,-.20,-.06); // its depth at the end
const float IC_TK[4]=float[](.18,.30,.40,.05);// how much water lies between it and us (the tint)
const vec2 WIN_C=vec2(-.50,-.19);

// ---- Shared ----
vec2 icDir(float a){return vec2(cos(a),sin(a));}
float icTri(vec2 p,vec2 p0,vec2 p1,vec2 p2){vec2 e0=p1-p0,e1=p2-p1,e2=p0-p2,v0=p-p0,v1=p-p1,v2=p-p2;
 vec2 a=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),b=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),c=v2-e2*sat(dot(v2,e2)/dot(e2,e2));float s=sign(e0.x*e2.y-e0.y*e2.x);
 vec2 d=min(min(vec2(dot(a,a),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(b,b),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(c,c),s*(v2.x*e2.y-v2.y*e2.x)));return -sqrt(d.x)*sign(d.y);}
// the integral of a smoothstep from a to b (a speed that rises smoothly from 0 to 1 gives this distance)
float icR(float t,float a,float b){float u=sat((t-a)/(b-a));return t<b?(b-a)*(u*u*u-.5*u*u*u*u):(b-a)*.5+(t-b);}

// ---- Where each one is: the path of its centre of mass (cheap smooth functions only: this runs for every pixel) ----
const float IC_W[3]=float[](.580,.618,.663);  // the half-width in time of each leap (.58 sqrt(.17/scale): at the top it falls at about g)
float icBump(float x){float u=max(1.-x*x/3.,0.);return u*u*u;}   // like exp(-x*x) near its top, and exactly 0 beyond |x| = 1.73
vec2 icPath(int i,float t){
 if(i==3)return vec2(-.80+.70*(t-9.6)-.40*icR(t,9.85,10.35)+.70*icR(t,10.75,11.45),-.10-.08*ss(9.0,10.6,t)+.008*sin(t*.9));
 float s=IC_S[i],tm=IC_TM[i],Ls=IC_L*s,fi=float(i),k=s/.17;
 // forward: a slow cruise (slowing over the minutes); faster as it climbs (from 3.6 s), fastest through the leap, then gliding down
 float x=IC_X0[i]+.20*t/(t+12.)+.16*k*(icR(t,3.6,4.4)-icR(t,tm+.5,tm+1.4))+.08*k*(icR(t,tm+.5,tm+1.4)-icR(t,tm+3.5,tm+5.0))
  +.324*k*ss(-1.5,1.5,(t-tm)/.45)+.006*sin(t*.45+fi*2.);
 // its cruising depth: at rest; up towards the surface from 3.8 s; down again after its leap
 float ySh=IC_WL-.30*Ls;
 float yc=mix(IC_YR[i],ySh,ss(3.8,tm-.5,t));yc=mix(yc,IC_YE[i],ss(tm+.3,tm+2.6,t))+.006*sin(t*.6+fi*2.1);
 // the leap: the top of the arc about g, the body clearing the water there
 return vec2(x,yc+(IC_WL+.42*Ls-yc)*icBump((t-tm)/IC_W[i]));}
// the leap's envelope (1 at its top)
float icG(int i,float t){return i==3?0.:icBump((t-IC_TM[i])/IC_W[i]);}

// ---- Its pose: the spine as an arc through the centre of mass (snout at +.40 of the length, tail end at -.60) ----
vec2 icCm,icF,icN;float icLs,icKb,icPh,icAmp,icLk,icSp;
void icPose(int i,float t){
 icLs=IC_L*IC_S[i];float e=.035;float fi=float(i);
 vec2 pm=icPath(i,t-e),p0=icPath(i,t),pp=icPath(i,t+e);icCm=p0;
 vec2 v=(pp-pm)/(2.*e),ac=(pp-2.*p0+pm)/(e*e);float vv=dot(v,v),vl=sqrt(vv);icSp=vl/icLs;   // body lengths a second
 float k=(v.x*ac.y-v.y*ac.x)/max(vv*vl,1e-6);                                                // the curvature of the path
 // its heading: along its path when it swims, level (a slight slow pitch) when it hangs in the water
 icF=normalize(mix(normalize(vec2(1.,.05*sin(t*.5+fi*1.7))),v/max(vl,1e-6),ss(.05,.25,icSp)));icN=vec2(-icF.y,icF.x);
 // a slight arch over the top of a leap (the spine an arc of this curvature); straight otherwise
 icKb=clamp(k*.30,-.45/icLs,.45/icLs)*ss(.3,.8,icSp);
 // the tail beat (side to side: seen from the side the fin turns edge-on and back): slow at rest, faster as they climb and after
 if(i<3){float tm=IC_TM[i];icPh=TAU*(.6*t+.9*icR(t,3.6,4.3)-.5*icR(t,tm+.9,tm+2.2))+fi*1.9;icAmp=1.-icG(i,t);icLk=0.;}
 else{icPh=TAU*(.85*t-.45*icR(t,9.85,10.35)+.55*icR(t,10.75,11.45));icAmp=1.-.6*ss(9.95,10.3,t)*ss(10.9,10.6,t);
  icLk=ss(9.95,10.35,t)*ss(11.05,10.65,t);}
}
// the body's frame at q: U along it from the snout (0) to the tail end (1), V towards the back, in body lengths; tg towards the
// tail and n towards the back there (the spine is an arc through the centre of mass, which is at U = .40)
vec2 icLocal(vec2 q,out vec2 tg,out vec2 n){
 if(abs(icKb)<1e-3){tg=-icF;n=icN;vec2 w=q-icCm;return vec2(.40-dot(w,icF)/icLs,dot(w,icN)/icLs);}
 float sg=sign(icKb);vec2 r=q-icCm-icN/icKb;float s=atan(sg*dot(r,icF),-sg*dot(r,icN))/icKb;
 vec2 fs=cos(icKb*s)*icF+sin(icKb*s)*icN;tg=-fs;n=vec2(-fs.y,fs.x);
 return vec2(.40-s/icLs,sg*(1./abs(icKb)-length(r))/icLs);}
// a point of the body (U, V in body lengths) on the screen
vec2 icAt(float U,float V){float s=(.40-U)*icLs;if(abs(icKb)<1e-3)return icCm+icF*s+icN*V*icLs;
 float c=cos(icKb*s),sn=sin(icKb*s);return icCm+(sn*icF+(1.-c)*icN)/icKb+(-sn*icF+c*icN)*V*icLs;}

// ---- The body (in body lengths: U from the snout tip, V towards the back) ----
float icHD(float U){return .014+.098*ss(.02,.33,U)*ss(1.0,.45,U);}   // about half its depth there
float icBodyD(vec2 l,float fz){
 float hd=1e5;
 if(l.x<.32){float ro=sdCap(l,vec2(.012,-.004),vec2(.118,.010),.0058,.023);       // the slender snout
  float cr=sdEll(l-vec2(.160,.014),vec2(.064,.058));                   // the skull, with the big orbit
  float jw=sdEll(l-vec2(.145,-.020),vec2(.078,.042));                  // the lower jaw and the throat
  hd=smin(smin(ro,cr,.03),jw,.02);}
 float tr=sdEll(l-vec2(.370,.004),vec2(.240,.112));                   // the trunk, deepest behind the front paddles
 float sh=sdEll(l-vec2(.240,.0),vec2(.110,.086));
 float tl=l.x>.45?sdCap(l,vec2(.56,.006),vec2(.945,.000),.070,.018):1e5;   // the tail stock
 float b=smin(smin(tr,sh,.05),tl,.06);b=smin(hd,b,.035);
 // the dorsal fin: triangular, its trailing edge hollowed
 if(l.y>.03&&l.x>.36&&l.x<.62){float df=icTri(l,vec2(.395,.092),vec2(.500,.182),vec2(.545,.078));df=max(df,-(length(l-vec2(.596,.172))-.066));
  b=smin(b,df,.016);}
 if(l.x<.80)return b;
 // the crescent tail fin (the lower lobe carries the end of the backbone): turned edge-on and back by the beat
 vec2 f=vec2((l.x-.925)/fz,l.y+.004);f.y*=f.y<0.?.93:1.;
 float cf=max(length(f-vec2(.060,0.))-.150,-(length(f-vec2(.112,0.))-.142));
 return smin(b,cf*min(fz,1.),.016);}
// a paddle (in body lengths): from its root r, along the angle a (from the backward direction, down), of length ln and width wd
float icPad(vec2 l,vec2 r,float a,float ln,float wd){vec2 p=l-r;vec2 ax=vec2(cos(a),-sin(a));vec2 pa=vec2(dot(p,ax),dot(p,vec2(-ax.y,ax.x)));
 float w=wd*.5*(1.-.55*ss(.15,1.,pa.x/ln))*(1.+.25*ss(.3,.0,pa.x/ln));return sdEll(vec2(pa.x-ln*.5,pa.y*(.5*wd)/max(w,1e-4)),vec2(ln*.5,wd*.5));}

// ---- The skeleton (in body lengths), for the fossil and while the flesh grows: the long snout with its jaws, the skull with the
// ring of plates in the eye, the backbone of short disc-like vertebrae bending down into the lower lobe of the tail, the ribs, the
// shoulder girdle, the paddles as a mosaic of small bones, the small pelvis ----
float icBones(vec2 l){float d=1e5;
 // the skull
 if(l.x<.26){d=min(d,sdCap(l,vec2(.006,.002),vec2(.20,.030),.0030,.010));d=min(d,sdCap(l,vec2(.010,-.006),vec2(.21,-.022),.0030,.011));
  d=min(d,abs(sdEll(l-vec2(.185,.012),vec2(.060,.046)))-.0045);
  vec2 e=l-vec2(.150,.026);float r=length(e),an=atan(e.y,e.x);d=min(d,max(abs(r-.0150)-.0042,(abs(fract(an*14./TAU)-.5)-.40)*.006));}
 // the backbone: the vertebrae along the back, then down into the lower lobe of the tail
 if(l.x>.18&&l.x<.88){float k=floor((l.x-.20)/.016+.5);for(int j=-1;j<=1;j++){float kk=k+float(j);if(kk<0.||kk>41.)continue;float u=.20+kk*.016;
   float hh=mix(.011,.006,ss(.5,.86,u));vec2 c=vec2(u,.012-.010*ss(.75,.88,u));d=min(d,sdBox(l-c,vec2(.0058,hh))-.0012);
   if(u<.80)d=min(d,sdSeg(l,c+vec2(0.,hh),c+vec2(-.004,hh+.022*(1.-u)))-.0020);
   if(u>.56)d=min(d,sdSeg(l,c-vec2(0.,hh),c-vec2(.004,hh+.015))-.0016);}}
 if(l.x>.84){vec2 f=vec2(l.x-.925,l.y);vec2 A=vec2(-.045,.002),B=vec2(.080,-.150);float tt=segU(f,A,B);float dl=length(f-mix(A,B,tt));
  float k=floor(tt*10.+.5);float cv=abs(tt-k/10.)*.19;d=min(d,max(dl-.0045*(1.-.5*tt),.0062-cv-.0042));}
 // the ribs
 if(l.x>.20&&l.x<.62&&l.y<.03){float k=floor((l.x-.22)/.022+.5);for(int j=-1;j<=1;j++){float kk=k+float(j);if(kk<0.||kk>16.)continue;float u=.22+kk*.022;
   float dep=.070*ss(.0,.06,u-.20)*ss(.62,.42,u);vec2 a=vec2(u,.010),m=vec2(u+.022,-.020-.4*dep),b=vec2(u+.035,.010-dep);
   d=min(d,min(sdSeg(l,a,m)-.0026,sdSeg(l,m,b)-.0018));}}
 // the shoulder girdle and the small pelvis
 d=min(d,sdCap(l,vec2(.212,.030),vec2(.238,-.045),.0050,.0080));d=min(d,sdEll(l-vec2(.232,-.052),vec2(.022,.010)));
 d=min(d,sdCap(l,vec2(.548,.004),vec2(.566,-.034),.0030,.0040));
 // the paddles: a short broad humerus, then rows of small polygonal bones
 for(int s=0;s<2;s++){vec2 r=s==0?vec2(.225,-.062):vec2(.565,-.040);float a=s==0?.55:.45,ln=s==0?.140:.066,wd=s==0?.040:.022;
  float pd=icPad(l,r,a,ln,wd);if(pd>.01)continue;vec2 p=l-r;vec2 ax=vec2(cos(a),-sin(a));vec2 pa=vec2(dot(p,ax),dot(p,vec2(-ax.y,ax.x)));
  float cl=s==0?.0115:.0085;vec2 g=pa/vec2(cl,cl*.85);vec2 gi=floor(g);vec2 gf=fract(g)-.5;
  float bn=sdBox(gf*vec2(cl,cl*.85),vec2(cl*.36,cl*.30))-cl*.06;bn=pa.x<cl*1.5?sdEll(pa-vec2(cl*.9,0.),vec2(cl*1.1,wd*.42)):bn;
  d=min(d,max(bn,pd+.002));}
 return d;}

// ---- The waterline: small waves, and the rings sent out by each leap where it leaves and where it goes back in ----
// when and where each one leaves the water (kind 0) and goes back in (1), sorted by time: the time, x, kind, which one, and where its
// head is just after it leaves (for its breath). Computed once from icPath (recompute them if the paths change).
const float IC_ET[6]=float[](4.595,5.605,5.611,6.622,6.689,7.778);
const float IC_EX[6]=float[](-0.386,0.069,-0.207,-0.047,0.214,0.338);
const int IC_EK[6]=int[](0,1,0,0,1,1),IC_EI[6]=int[](0,0,1,2,1,2);
const float IC_TX[3]=float[](4.595,5.611,6.622);   // when each leaves the water
const vec2 IC_EH[6]=vec2[](vec2(-0.276,0.304),vec2(0.000,0.000),vec2(-0.113,0.274),vec2(0.033,0.252),vec2(0.000,0.000),vec2(0.000,0.000));
// the events under way at t: IC_E0 to IC_E1 (loops over just these run only while they are needed)
int icE0=6,icE1=-1;
void icActive(float t){icE0=6;icE1=-1;for(int e=0;e<6;e++){float a=t-IC_ET[e];if(a>-.05&&a<3.6){icE0=min(icE0,e);icE1=max(icE1,e);}}}
float icWL(float x,float t){float w=IC_WL+.0040*sin(x*7.-t*1.1)+.0026*sin(x*15.3+t*1.6+1.)+.0012*sin(x*37.-t*2.4+2.);
 for(int e=icE0;e<=icE1;e++){float a=t-IC_ET[e];if(a<0.)continue;float dx=x-IC_EX[e];float sp=.025+.11*a;
  w+=.0065*exp(-a*1.1)*cos(dx*55.-a*7.)*exp(-dx*dx/(sp*sp))*(IC_EK[e]==0?.7:1.)+.010*exp(-dx*dx/.0012)*ss(.0,.06,a)*ss(.45,.1,a);}
 return w;}

// a backdrop colour covering the pixel (decor: dimmed with the decor setting, left out without it)
void icBase(vec3 c){if(uDecor>1.5)return;if(uDecor>.5)c=mix(baseCol(),c,uOpacity);F=vec4(c,1.);}
// ---- Above the water: a hazy summer sky, fair-weather clouds, a low far coast, the sea going away to the horizon ----
void icAbove(vec2 q,float t,float wl){
 vec3 c=mix(vec3(.86,.90,.87),vec3(.40,.60,.84),ss(IC_HZ,IC_HZ+.70,q.y));
 c=mix(c,vec3(1.,.97,.88),ss(.95,.0,length((q-vec2(-.62,.80))*vec2(1.,1.3)))*.42);    // the glow of the high sun, up on the left
 icBase(c*(1.+.07*(vn(rot(.25)*q*vec2(5.,26.)+vec2(t*.004,0.))-.5)));
 // fair-weather cumulus over the horizon, lit from the upper left, flat grey bases; high thin streaks
 if(q.y>IC_HZ&&q.y<IC_HZ+.16){float yb=IC_HZ+.045+.02*vn(vec2(q.x*.8,4.));float h=fbm2(vec2(q.x*4.2+t*.006,1.7));float H=.085*pow(ss(.48,.80,h),.9)*(.70+.30*vn(vec2(q.x*14.+t*.01,3.)));
  // the top a row of rounded turrets (cauliflower), each a half disc
  float bx=q.x*26.+t*.15+.6*vn(vec2(q.x*5.,7.));float bu=fract(bx)*2.-1.;float arc=sqrt(max(1.-bu*bu,0.));
  float top=yb+H*(.80+.20*arc);
  if(q.y<top+.02){float cd=max(yb-q.y,q.y-top)+.008*(fbm2(q*vec2(16.,20.)+vec2(t*.01,0.))-.5);
   float lit=ss(yb,top,q.y)*(.75+.25*ss(.2,-.5,q.x))*(.86+.14*ss(.6,-.6,bu)*ss(yb+.3*H,top,q.y));
   veil(mix(vec3(.74,.78,.84),vec3(1.,.98,.94),lit),ss(.012,-.010,cd)*.85*ss(IC_HZ,IC_HZ+.03,q.y),1.);}}
 if(q.y>.25){float ci=fbm(vec2(q.x*1.3+t*.004,q.y*11.+5.))*ss(.25,.40,q.y)*ss(1.4,.6,q.y);veil(vec3(.97,.97,.98),ss(.58,.78,ci)*.40,1.);}
 // a low far coast in the haze on the right (the land to the south-east of the sea)
 {float x=q.x;float hc=IC_HZ+.012*ss(.30,.55,x)*(.55+.45*fbm(vec2(x*4.,2.)))+.008*ss(.62,.72,x)*ss(1.10,.90,x);
  if(q.y<hc+.004&&q.y>IC_HZ-.01)PIECE(q.y-hc,mix(vec3(.60,.68,.74),vec3(.70,.76,.80),ss(.3,1.2,x)),K_FAR,q*vec2(3.,30.),vec2(1,0),.006,0.,1.);}
 // the sea from the horizon down to the waterline: darker nearer, wave strokes, soft slow glints under the sun
 if(q.y<IC_HZ+.003){float z=sat((q.y-wl)/(IC_HZ-wl));vec3 sc=mix(vec3(.14,.34,.44),vec3(.50,.64,.70),pow(z,.7));
  float fr=mix(60.,260.,z);float wv=vn(vec2(q.x*fr*.25+t*.15,q.y*fr*3.));sc*=.90+.20*wv;
  float gl=ss(.62,.92,vn(vec2(q.x*120.+t*.22,q.y*900.)))*ss(.45,.0,abs(q.x+.62))*ss(.0,.6,z)*(.6+.4*sin(t*.7+q.x*30.));
  sc+=vec3(.55,.52,.45)*gl*.6;
  PIECE(q.y-IC_HZ,sc,K_FAR,q*vec2(2.,40.),vec2(1,0),.004,0.,1.);}
}

// ---- Below the water: blue-green, brighter near the surface and towards the sun; shafts of light; a far school of small fish;
// slowly drifting particles ----
vec3 icWater(vec2 q){float d=IC_WL-q.y;vec3 c=mix(vec3(.30,.62,.62),vec3(.11,.40,.46),ss(.0,.32,d));c=mix(c,vec3(.04,.20,.28),ss(.28,.78,d));
 c=mix(c,vec3(.02,.09,.15),ss(.75,1.5,d));return c*(1.+.12*ss(.6,-.9,q.x)*ss(.7,.0,d));}
void icBelow(vec2 q,float t,float wl){
 icBase(icWater(q)*(1.+.07*(vn(rot(.2)*q*vec2(4.,18.)+vec2(t*.004,0.))-.5)));
 // shafts of light from the surface, fanning down from the sun's side, drifting slowly
 {vec2 o=vec2(-.80,1.70);vec2 r=q-o;float an=atan(r.x,-r.y);
  float n1=vn(vec2(an*34.+t*.035,3.)),n2=vn(vec2(an*71.-t*.025,7.));float s=ss(.45,.85,n1*.65+n2*.45);
  veil(vec3(.72,.95,.90),s*.20*ss(-.85,wl,q.y)*ss(wl+.01,wl-.05,q.y),1.);}
 // the far school of small fish (Leptolepis), silver slivers turning slowly together
 {vec2 sc=vec2(.62+.03*sin(t*.21),-.34+.02*sin(t*.27));vec2 l=(q-sc)/vec2(.17,.075);float e=dot(l,l);
  if(e<1.3){vec2 cs=vec2(.010,.0075);vec2 g=(q-sc+vec2(t*.010,0.))/cs;vec2 gi=floor(g);float best=1e5;float hb=0.;
   for(int j=0;j<2;j++)for(int i=0;i<2;i++){vec2 c=gi+vec2(i,j);vec2 cc=(c+.3+.4*h22(c))*cs-vec2(t*.010,0.)+sc;
    if(h21(c+.4)>ss(1.1,.2,dot((cc-sc)/vec2(.17,.075),(cc-sc)/vec2(.17,.075)))*ss(.42,.62,fbm(cc*7.+vec2(t*.03,0.)))*.8)continue;
    float an=.25*sin(t*.4+c.x*.3)+(h21(c)-.5)*.3;vec2 fl=rot(an)*(q-cc);float d=sdEll(fl,vec2(.0042,.0011));if(d<best){best=d;hb=h21(c+2.);}}
   veil(mix(vec3(.30,.55,.60),vec3(.66,.82,.84),hb),ss(.0008,-.0005,best)*.75,1.);}}
 // particles drifting in the water, small and far, and a few bigger nearer
 for(int L=0;L<2;L++){float cs=L==0?.045:.11;vec2 g=(q+vec2(t*.006*(1.+float(L)),t*.004))/cs;vec2 gi=floor(g),gf=fract(g);vec2 o=.2+.6*h22(gi+float(L)*7.);
  float r=(L==0?.0011:.0024)/cs;float dd=length(gf-o)/r;veil(vec3(.80,.92,.88),ss(1.,.2,dd)*(L==0?.35:.25)*ss(.4,.9,h21(gi+3.)),1.);}
 // the surface seen from just below: a silvery band with ripples
 {float dd=wl-q.y;if(dd<.035){float rip=vn(vec2(q.x*55.+t*.45,dd*500.));veil(vec3(.68,.86,.86),ss(.035,.0,dd)*(.30+.25*rip),1.);}}
}

// ---- The drifting log at the surface (on the left) and the colony of sea lilies (Seirocrinus) hanging under it: long stalks, the
// feathery crowns trailing below ----
void icLog(vec2 q,float t,float wl,bool un){
 if(q.x>-.33||q.y<-.52||q.y>IC_WL+.08)return;
 float bob=.003*sin(t*.8);vec2 A=vec2(-1.45,IC_WL+.004+bob),B=vec2(-.52,IC_WL-.008+bob*.6);
 // the stalks and crowns
 if(q.y<IC_WL){float best=1e5,bc=1e5;float hc=0.;
  for(int k=0;k<7;k++){float fk=float(k);float x0=-1.30+.115*fk+.03*(h11(fk*3.1)-.5);if(abs(q.x-x0)>.16)continue;
   float y0=mix(A.y,B.y,(x0-A.x)/(B.x-A.x))-.020;float yc=-.06-.20*h11(fk*5.7+1.)-.04*fk/6.;
   vec2 C=vec2(x0-.05+.012*sin(t*.30+fk),yc+.006*sin(t*.4+fk*1.3));
   // the stalk: hanging from the log, curving back towards the crown (as a curve x(y))
   float v=sat((y0-q.y)/(y0-C.y));float xs=mix(x0,C.x,v*v)+.010*sin(v*PI)*sin(t*.25+fk*.7);
   float st=max(abs(q.x-xs)*.97-.0016,max(q.y-y0,C.y-q.y));best=min(best,st);
   // the crown: the cup, then many feathery arms spreading and trailing below
   vec2 l=q-C;if(length(l)<.135){float cr=sdEll(l-vec2(0.,-.005),vec2(.0075,.0110));
    for(int a=0;a<10;a++){float fa=float(a);float an=-PI*.5+(fa-4.5)*.17+.05*sin(t*.5+fa+fk);float ln=.082+.038*h11(fa+fk*9.);
     vec2 e=icDir(an)*ln+vec2(-.020,.004);float ta=segU(l,vec2(0.,-.010),e);float ad=length(l-mix(vec2(0.,-.010),e,ta))-mix(.0024,.0009,ta);
     float pin=abs(fract(ta*36.)-.5)-.20;ad=min(ad,max(ad-.0060*(1.-.6*ta),pin*.004));cr=min(cr,ad);}
    if(cr<bc){bc=cr;hc=h11(fk);}}}
  float dd=min(best,bc);
  if(dd<.006){vec3 col=mix(vec3(.60,.54,.40),vec3(.70,.62,.44),hc);col=mix(col,icWater(q),.35+.25*ss(-.1,-.4,q.y));
   PIECE(dd,col,K_PLANT,q*vec2(120.,60.),vec2(0,1),.002,.25,1.);}}
 // the log: weathered grey above the water, dark and filmed with growth below; a broken branch stub
 float u=segU(q,A,B);float r=mix(.038,.024,u)*(1.+.06*sin(u*40.)+.05*sin(u*11.+1.));vec2 ax=mix(A,B,u);float dl=length(q-ax)-r;if(dl<.01)dl+=.003*(fbm2(q*vec2(60.,200.))-.5);
 dl=min(dl,sdCap(q,vec2(-.86,IC_WL+.016),vec2(-.80,IC_WL+.060),.0070,.0035));
 dl=max(dl,-(length(q-B-vec2(.012,.004))-.016));
 if(dl<.005){vec3 col=un?mix(vec3(.22,.24,.19),vec3(.32,.33,.26),ss(-.03,.0,q.y-IC_WL)):mix(vec3(.42,.38,.32),vec3(.66,.61,.53),ss(IC_WL,IC_WL+.035,q.y));
  float vy=(q.y-ax.y)/r;                                                                         // across the log, -1 below .. 1 on top
  col*=.86+.14*ss(.85,.0,abs(abs(fract(vy*2.3+.15*sin(u*23.))-.5)-.25)*4.);                         // long splits in the weathered wood
  if(!un)col*=mix(.62,1.,ss(.0,.012,q.y-IC_WL));                                                   // the wet band at the waterline
  else col=mix(col*mix(.75,1.,ss(-1.,.2,vy)),vec3(.30,.36,.22),.30*ss(.4,-.6,vy));                   // a green film of growth below
  if(un)col=mix(col,icWater(q),.22);
  PIECE(dl,col,K_BARK,vec2(u*60.,(q.y-ax.y)*200.),vec2(1,0),.026,.4,1.);}
}

// ---- An ammonite: a coiled shell (kind 0 Harpoceras, involute, keeled, with sickle-shaped ribs; 1 Dactylioceras, evolute, with dense
// straight ribs), its aperture at local +x facing up, a few short arms; c its centre, R its radius, a its turn ----
void icAmmo(vec2 q,vec2 c,float R,float a,int kd,float tk,float t){
 vec2 l=rot(a)*(q-c);if(dot(l,l)>R*R*2.6)return;
 float W=kd==0?2.4:1.75;float th=atan(l.y,l.x);float ph=fract(-th/TAU);float Ro=R*pow(W,-ph);float r=length(l);
 float d=r-Ro;
 // its arms, from the aperture, short and soft
 float am=1e5;for(int k=0;k<5;k++){float fk=float(k);vec2 b=vec2(R*mix(.55,.95,fk/4.),0.);vec2 e=b+vec2(-.10+.05*fk+.04*sin(t*1.3+fk),1.)*R*(.30+.06*sin(t*.9+fk*2.));
  am=min(am,sdCap(l,b,e,R*.060,R*.025));}
 if(min(d,am)>PX*4.)return;
 vec3 sh=kd==0?vec3(.64,.56,.44):vec3(.58,.50,.40);
 float wl=log(max(Ro/max(r,1e-5),1.))/log(W);float wi=floor(wl),wf=fract(wl);   // which whorl, and where across it
 float rib=kd==0?sin(th*26.+5.*pow(wf,1.4)-wi*.3):sin(th*46.-wi*.4);
 vec3 alb=sh*(.90+.10*rib*(1.-.6*ss(.5,1.,wi)));
 alb*=mix(1.,.72,ss(.10,.0,wf)*step(.5,wl)*(kd==0?ss(.35,.6,1.-r/R):1.));                 // the seam with the inner whorl
 if(kd==0)alb*=1.+.12*ss(.08,.0,wl)*ss(.0,.04,wl);                                            // the keel catching the light
 alb*=mix(1.,.55,ss(R*(kd==0?.20:.12),.0,r));                                                 // the deep centre of the coil
 alb=mix(alb,icWater(q),tk);
 PIECE(am,mix(vec3(.46,.33,.30),icWater(q),tk),K_SKIN,l/R*8.,vec2(0,1),R*.06,.5,0.);
 piece(d,(rot(-a)*l)/max(r,1e-5),alb,K_SHELL,l/R*3.,vec2(1,0),R*.5,mix(.8,.3,tk),0.);
 shadow(ss(.0,-R*.15,d)*ss(R*.04,.0,abs(th))*step(.0,l.x)*.6,vec3(.3,.25,.25),0.);           // the dark aperture
}

// ---- An ichthyosaur ----
// Skin smooth and countershaded (Lindgren et al. 2018): dark slate above, pale cream below, a soft wavy boundary on the flank.
void icAnimal(int i,vec2 q,float t,float wl,bool un){
 if(i==3&&(t<8.8||t>13.2))return;
 if(length(q-icPath(i,t))>.68*IC_L*IC_S[i])return;   // far from its centre of mass
 icPose(i,t);
 float tk=un?IC_TK[i]:0.;vec3 wc=icWater(q);
 vec2 tg,n;vec2 l=icLocal(q,tg,n);if(abs(l.y)>.24||l.x<-.03||l.x>1.06)return;
 float fz=mix(1.,.45+.55*abs(cos(icPh)),icAmp*.8);
 float dB=1e5;bool needB=GROW<.62&&i<3;
 for(int z=0;z<(needB?1:0);z++){dB=icBones(l)*icLs;if(BONES())PIECE(dB,mix(vec3(.88,.84,.75),wc,tk*.5),K_BONE,l*40.,vec2(1,0),.002,.7,0.);}
 float sw=.10*sin(icPh*.5+1.)*icAmp;float pa=mix(.55,.30,1.-icAmp)+sw;
 vec3 back=vec3(.14,.16,.18),belly=vec3(.80,.79,.72);
 // the far paddles, in the shade under the body
 bool padF=l.y<0.&&l.x>.17&&l.x<.43,padH=l.y<0.&&l.x>.52&&l.x<.69;
 {float fp=min(padF?icPad(l,vec2(.237,-.066),pa+.10,.140,.040):1e5,padH?icPad(l,vec2(.575,-.044),pa+.05,.066,.022):1e5)*icLs;if(needB)fp=flesh(fp,dB);
  if(fp<PX*4.)PIECE(fp,mix(back*.8,wc,tk),K_SMOOTH,l*6.,vec2(1,0),.012*icLs,mix(1.,.4,tk),0.);}
 float d=icBodyD(l,fz)*icLs;if(needB)d=flesh(d,dB);
 if(d<PX*4.){
  float hd=icHD(l.x);float side=clamp(l.y/hd,-1.4,1.4);
  float edge=-.12+.05*sin(l.x*30.)+.03*sin(l.x*77.+1.);
  vec3 alb=mix(belly,back,ss(edge-.25,edge+.25,side));
  alb=mix(alb,back,ss(.38,.46,l.x)*ss(.02,.09,l.y)*(1.-ss(.56,.60,l.x)));                      // the dorsal fin, dark
  alb=mix(alb,back*.95,ss(.88,.93,l.x));                                                         // the tail fin
  alb*=.94+.10*vn(l*vec2(30.,60.));
  // the closed mouth along the snout, and the nostril before the eye (painted, a pixel or two wide)
  if(l.x<.25){float pl=PX/icLs;float ml=max(abs(l.y+.006+.010*ss(.10,.19,l.x)-.004*l.x)-.0012,max(.018-l.x,l.x-.195));
   ml=min(ml,sdEll(rot(-.15)*(l-vec2(.115,.031)),vec2(.010,.0028)));alb=mix(alb,back*.30,ss(pl,-pl*.5,ml)*.9);}
  alb=mix(alb,wc,tk);
  // the light: rounded across the body, the back towards the surface
  vec2 g=n*side+tg*(ss(.06,.0,l.x)*-1.+ss(.90,1.,l.x));
  piece(d,g,alb,K_SMOOTH,l*vec2(9.,9.),tg,hd*icLs*1.2,mix(1.,.45,tk),0.);
  // caustics playing on the back under the water, and a soft light from the surface along it
  if(un&&GROW>.3){float c1=vn(q*vec2(46.,34.)/icLs*.17+vec2(t*.20,t*.12)),c2=vn(q*vec2(38.,50.)/icLs*.17-vec2(t*.15,-t*.10)+3.);
   float ca=ss(.82,.97,1.-abs(c1-c2))*ss(-.2,.8,side)*ss(-.55,wl-.02,q.y)*cov(d);glow(vec3(.20,.30,.26)*ca*(1.-tk),0.);
   glow(vec3(.10,.16,.15)*ss(.6,1.2,side)*ss(-.012*icLs*6.,0.,d)*cov(d)*(1.-tk),0.);}
  // out of the water: wet, water sheeting off it for a moment after it leaves
  if(!un&&i<3){float a=t-IC_TX[i];glow(vec3(.30,.32,.32)*ss(.03,.0,q.y-wl)*ss(.0,.05,a)*ss(.45,.15,a)*cov(d),1.);}
  // the near paddles
  float np=min(padF?icPad(l,vec2(.225,-.062),pa,.140,.040):1e5,padH?icPad(l,vec2(.565,-.040),pa-.05,.066,.022):1e5)*icLs;if(needB)np=flesh(np,dB);
  if(np<PX*4.){vec3 pc=mix(mix(back*1.1,belly*.8,ss(.0,-.08,l.y+.07)),wc,tk);PIECE(np,pc,K_SMOOTH,l*8.,tg,.010*icLs,mix(1.,.45,tk),0.);}
  // the big eye with its rim of skin
  if(l.x<.25&&GROW>.3){
   vec2 ec=icAt(.150,.026);float er=(i==3?.020:.018)*icLs;
   shadow(ss(er*1.55,er*1.05,length(q-ec))*.35,vec3(.40,.42,.44),0.);
   float bl=i==3?blinkAt(t,.31)*(1.-ss(9.9,10.0,t)*ss(11.1,11.0,t)):blinkAt(t,.17+.29*float(i));
   // the pupil: towards the front as it looks ahead, round and centred when it turns its eye on us
   vec2 l2=q-ec;float dd=length(l2)-er;
   if(dd<PX*4.){vec2 fw=-tg;vec2 po=fw*er*.30*(1.-icLk);vec2 lp=l2-po;vec2 lf=vec2(dot(lp,fw)/mix(.72,1.,icLk),dot(lp,vec2(-fw.y,fw.x)));
    float pdd=length(lf)-er*mix(.48,.56,icLk);
    vec3 ir=mix(vec3(.30,.27,.15),vec3(.42,.36,.18),icLk);vec3 col=ir*(.55+.55*ss(er*.2,-er*.9,l2.y))*mix(.5,1.,ss(er,er*.5,length(l2)));
    col=mix(col,vec3(.012),ss(PX*.8,-PX*.8,pdd));
    col=mix(col,vec3(.95,1.,1.),ss(er*.26,er*.08,length(l2-vec2(-.30,.40)*er))*.85);
    col=mix(col,vec3(.02),ss(-PX*1.6,0.,dd));
    float lidY=mix(er*1.05,-er*1.05,bl);float ld=l2.y-lidY;col=mix(col,back*1.4*(.55+.45*ss(-er,er,l2.y)),ss(-PX,PX,ld));
    col=mix(col,wc,tk*.8);float a=cov(dd);F=vec4(col,1.)*a+F*(1.-a);}}
 }
}

// ---- Splashes, the breath, bubbles: where each one leaves the water and goes back in ----
void icSplash(vec2 q,float t,float wl,bool un){
 for(int e=icE0;e<=icE1;e++){float a=t-IC_ET[e];float xe=IC_EX[e];int i=IC_EI[e];int k=IC_EK[e];float s=IC_S[i];float fi=float(i),fk=float(k);
  if(abs(q.x-xe)>.14)continue;
  if(!un){
   // drops thrown up and falling back (the loop runs only while they fly)
   int nd=a<1.1?8:0;
   for(int j=0;j<nd;j++){float fj=float(j);float hj=h11(fj*3.7+fi*11.+fk*5.);float aj=a-.06*hj;if(aj<0.)continue;
    vec2 v=vec2((hj-.5)*.34+(k==0?.10:.05),.32+.34*h11(fj*1.9+fi));vec2 p=vec2(xe+(hj-.5)*.05,wl)+v*aj-vec2(0.,4.9*s*aj*aj);
    if(p.y<wl-.005)continue;float rr=.0022+.0018*h11(fj*5.3);veil(vec3(.94,.98,.99),ss(rr,rr*.3,length(q-p))*.9,1.);}
   // a crown of white water
   if(a<.9){float cr=sdEll(q-vec2(xe,wl),vec2(.030+.06*a,(k==0?.020:.032)*ss(.0,.10,a)*ss(.8,.2,a)));
    veil(vec3(.90,.95,.96),ss(.004,-.008,cr)*(.50+.30*vn(q*vec2(160.,90.)))*ss(.9,.3,a),1.);}
   // the breath: a soft puff of spray from the nostrils as the head comes out
   if(k==0&&a>.0&&a<1.3){vec2 c=IC_EH[e]+vec2(.02,.03)*a+vec2(0.,.012);float rr=.008+.03*sqrt(a);
    veil(vec3(.95,.97,.98),ss(1.,.2,length(q-c)/rr)*.40*ss(.0,.08,a)*ss(1.3,.4,a)*(.7+.3*vn(q*120.)),1.);}
  }else{
   // a cloud of bubbles along the dive, rising back to the surface and thinning out
   if(q.y<wl-.22)continue;
   vec2 cs=vec2(.016,.014);vec2 g=(q-vec2(xe,0.)-vec2(0.,.045*a))/cs;vec2 gi=floor(g),gf=fract(g)-.5;vec2 cc=(gi+.5)*cs+vec2(xe,.045*a);
   float hb=h21(gi+fi*13.+fk*7.);
   float yb=cc.y-.045*a;                                     // where the bubble was born
   float den=(k==0?.35:.85)*ss(-.20,-.02,yb-wl)*ss(.07,.0,abs(cc.x-xe-.02))*ss(3.6,1.8,a)*ss(.0,.15,a);
   if(hb<den&&cc.y<wl-.004){float rr=(.0016+.0040*h21(gi+3.3))/cs.x;vec2 o=(h22(gi+5.)-.5)*(.8-2.*rr)+vec2(.10*sin(a*5.+hb*20.),0.);
    vec2 lp=(gf-o)*cs;float R=rr*cs.x;float dd=length(lp)-R;
    float rim=ss(PX*1.3,0.,abs(dd))*.75+ss(.0,-R,dd)*.15+ss(R*.5,.0,length(lp-vec2(-.3,.4)*R))*.6;
    veil(vec3(.85,.97,.97),rim,1.);}
  }}}

// ---- The fossil: the three of the group as they lie at the start, the bones over the dark film of their skin (as in the Holzmaden
// slabs, where the outline of the body, the dorsal fin and the tail fin are kept) ----
float icWinD(vec2 q){float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+3.)-.5)+.02*(vn(q*24.)-.5);}
void fossil(vec2 q){if(uLife>.001&&icWinD(q)<-.004)return;
 for(int i=(uLife<.999?2:-1);i>=0;i--){icPose(i,0.);if(length(q-icCm)>.70*icLs)continue;
  vec2 tg,n;vec2 l=icLocal(q,tg,n);
  float df=icBodyD(l,1.)*icLs;if(df<PX*4.)PIECE(df,vec3(.15,.13,.12),K_FOSSIL,l*30.,vec2(1,0),.004,.2,0.);
  float db=icBones(l)*icLs;if(db<PX*4.)PIECE(db,vec3(.80,.74,.62),K_FOSSIL,l*50.,vec2(1,0),.002,.6,0.);}}

void life(vec2 q,float t){
 if(uLife<.999&&icWinD(q)>.012)return;   // nothing of the living scene is seen outside the opening window
 icActive(t);float wl=icWL(q.x,t);bool un=q.y<wl;
 if(un){SUNL=normalize(vec3(-.30,.85,.45));SUNC=vec3(.62,.92,.90);AMBC=vec3(.20,.40,.44);BACK=.25;}
 else{SUNL=normalize(vec3(-.55,.55,.62));SUNC=vec3(1.30,1.20,1.02);AMBC=vec3(.48,.56,.68);BACK=.10;}
 if(un)icBelow(q,t,wl);else icAbove(q,t,wl);
 icLog(q,t,wl,un);
 // the ammonites (behind the group); those in the way of the near one jet aside, shell first, in three soft pulses
 if(un)for(int k=0;k<6;k++){
  // (placed clear of the group's lanes; those in the near one's way jet away from its path, down-left or up-left)
  vec2 c0=k==0?vec2(-.03,-.26):k==1?vec2(-.20,-.25):k==2?vec2(-.10,-.05):k==3?vec2(.775,-.28):k==4?vec2(-.20,-.45):vec2(.05,-.44);
  float R=k==0?.030:k==1?.014:k==2?.011:k==3?.040:k==4?.020:.012;float a0=k==0?-.45:k==1?-.55:k==2?3.5:k==3?-.40:k==4?.4:-.3;
  float tj=k==0?9.70:k==1?9.45:k==2?9.60:k==3?11.20:99.;int kd=k==1||k==2||k==5?1:0;float fk=float(k);
  float J=0.;for(int p=0;p<3;p++){float tp=tj+.42*float(p);J+=ss(tp,tp+.22,t)*(.55-.12*float(p));}
  vec2 jd=normalize(rot(-a0)*vec2(.15,-1.));
  vec2 c=c0+jd*J*(R*2.2+.02)+vec2(.004*sin(t*.5+fk),.003*sin(t*.7+fk*2.));
  icAmmo(q,c,R,a0+.10*sin(t*.6+fk)-.12*ss(tj,tj+.3,t)*ss(tj+1.6,tj+.9,t),kd,k==3?.20:k>3?.45:.28,t);}
 // the group (far to near), then the one that passes close
 int na=t>8.8&&t<13.2?4:3;for(int j=0;j<na;j++)icAnimal(j<3?2-j:3,q,t,wl,un);
 icSplash(q,t,wl,un);
 if(un){
  // a few big soft particles close to the camera
  {vec2 g=(q+vec2(t*.012,t*.006))/.24;vec2 gi=floor(g),gf=fract(g);vec2 o=.2+.6*h22(gi+9.);float dd=length(gf-o)*.24;
   veil(vec3(.75,.90,.88),ss(.010,.0,dd)*.12*ss(.5,.85,h21(gi+1.)),1.);}
 }
 // the waterline itself, across the picture: a thin dark line and a light one under it
 {float dd=q.y-wl;veil(vec3(.10,.22,.26),ss(.0022,.0,abs(dd+.0006))*.55,1.);veil(vec3(.85,.95,.95),ss(.004,.0,abs(dd+.004))*.35,1.);}
}

// ---- Scene 8 (El pou del temps, CE37): Abditosaurus kuehnei, the titanosaur of the Pyrenees (Orcau-1, Tremp basin, Pallars Jussà; about
// 70.5 million years ago: Vila et al., 2022), about 17.5 m long, standing in the shallows of a turquoise river of the delta on a misty
// morning, the red clays of Tremp on the banks. Story: 4.2–6.8 s it lifts its long neck slowly out of the river mist; 6.0 s a deep
// closed-mouth rumble (the key: its throat swells, rings tremble on the water at its feet); 7.0–9.2 s it takes four slow steps forward and
// the push of the water sends a small wave to the near bank; 8.8–10.8 s the wave runs up the sand over a buried nest and, as it draws back,
// uncovers round white eggs with a nodular shell (Megaloolithus); 10.5–11.6 s the titanosaur lowers its head and drinks.
// Scale: .070 screen units per metre (shoulders ~4.3 m, the raised head ~9.6 m over the river bed), the whole animal in the frame. ----
const float AS=.070;               // screen units per metre on the titanosaur's plane
const vec2 AO=vec2(.10,-.29);      // the river bed under its near hind foot at rest: the origin of its frame (metres from there, y up)
const float AWD=.55;               // the depth of the water where it stands (metres)
const float AWY=-.29+.55*.070;     // the water surface at its depth (screen)
const float AFB=-.075;             // the waterline under the far bank (screen)
const vec2 AB_N0=vec2(-4.45,4.25); // the base of the neck (body frame, metres)
const vec2 AB_SUN=vec2(-.60,.22);  // the morning sun, low on the left, behind a thin veil of mist
// the feet at rest (metres, near hind, near fore, far hind, far fore: the far ones further back, so a little higher on the screen) and the
// start of each one's step (a slow lateral sequence: hind, fore, hind, fore)
const vec2 AB_FT[4]=vec2[](vec2(.15,0.),vec2(-4.05,0.),vec2(.70,.24),vec2(-3.50,.24));
const float AB_ST[4]=float[](7.0,7.45,8.0,8.45);
const float AB_STEP=1.1;           // how far it walks (metres)
// the eggs of the nest (screen: back row first), and their radii
const vec3 AB_EGG[5]=vec3[](vec3(-.556,-.418,.0180),vec3(-.511,-.416,.0178),vec3(-.578,-.438,.0205),vec3(-.533,-.442,.0208),vec3(-.488,-.437,.0202));

// ---- The pose at the clock t (computed once per pixel) ----
float abOX,abBob,abBr,abRum,abHA,abSip,abUp;vec3 abWC;vec2 abC,abE,abTC,abTE;
vec2 abTop[4],abJ1[4],abJ2[4],abFB[4],abFW[4];float abLift[4];
vec2 abBez(vec2 a,vec2 b,vec2 c,float u){return mix(mix(a,b,u),mix(b,c,u),u);}
// A smooth tapered tube along a quadratic Bézier (exact distance to the curve, after Quílez): the shared sdTube is a polyline of 10
// segments whose corners show as bands in the light on a strongly bent neck. tt: the parameter of the nearest point.
float abTube(vec2 pos,vec2 A,vec2 B,vec2 C,float ra,float rb,out float tt){B+=vec2(1e-4,-1e-4);
 vec2 a=B-A,b=A-2.*B+C,c=a*2.,d=A-pos;float kk=1./dot(b,b),kx=kk*dot(a,b),ky=kk*(2.*dot(a,a)+dot(d,b))/3.,kz=kk*dot(d,a);
 float p=ky-kx*kx,p3=p*p*p,q=kx*(2.*kx*kx-3.*ky)+kz,h=q*q+4.*p3,res;
 if(h>=0.){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.;vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));tt=sat(uv.x+uv.y-kx);vec2 e=d+(c+b*tt)*tt;res=dot(e,e);}
 else{float z=sqrt(-p),v=acos(q/(p*z*2.))/3.,m=cos(v),n=sin(v)*1.732050808;vec3 t3=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);
  vec2 e1=d+(c+b*t3.x)*t3.x,e2=d+(c+b*t3.y)*t3.y;float r1=dot(e1,e1),r2=dot(e2,e2);if(r1<r2){res=r1;tt=t3.x;}else{res=r2;tt=t3.y;}}
 return sqrt(res)-mix(ra,rb,tt);}
void abPose(float t){
 float w=ss(6.9,9.4,t);abOX=-AB_STEP*w;float lifts=0.;
 for(int i=0;i<4;i++){float u=sat((t-AB_ST[i])/.85);float e=u*u*(3.-2.*u);float lf=sin(PI*u);
  abFW[i]=vec2(AB_FT[i].x-AB_STEP*e,AB_FT[i].y+.48*lf*(1.-.25*u));abLift[i]=lf;lifts+=lf;}
 abBr=sin(t*.78);
 abBob=-.07*lifts+.025*abBr;
 // the rumble (closed mouth): the throat swells for about a second
 abRum=ss(5.85,6.2,t)*ss(7.25,6.55,t);
 // the neck: rest (the head low in the mist) -> raised high (4.2–6.8, the head leads, the neck follows) -> relaxed while it walks -> down to
 // drink (10.5–11.6); afterwards it sips now and then (the head comes up a little, drips fall, it drinks again)
 float uE=ss(4.2,6.55,t),uC=ss(4.45,6.85,t),mE=ss(7.5,9.6,t),mC=ss(7.7,9.8,t),dE=ss(10.5,11.55,t),dC=ss(10.65,11.7,t);
 float ph=t-12.6,sp=0.;if(ph>0.){float c=mod(ph,5.2);sp=ss(0.,.9,c)*ss(2.6,1.5,c);}abSip=sp;
 vec2 Cr=vec2(-6.50,5.32)+vec2(.05,.10)*abBr,Er=vec2(-8.40,4.82)+vec2(.0,.14)*abBr+vec2(.10,.06)*sin(t*.37);
 vec2 Cu=vec2(-5.45,7.20),Eu=vec2(-6.15,9.45)+vec2(.05,.06)*sin(t*.5);
 vec2 Cm=vec2(-6.05,6.70),Em=vec2(-7.25,8.20);abUp=uE*(1.-dE);
 vec2 Cd=vec2(-7.35,5.45),Ed=vec2(-8.45,1.42)+vec2(.10,.75)*sp;
 abE=mix(mix(mix(Er,Eu,uE),Em,mE),Ed,dE);abC=mix(mix(mix(Cr,Cu,uC),Cm,mC),Cd,dC);
 // the head: how far its snout points down from the horizontal; a small nod at the rumble
 abHA=mix(mix(mix(.30,.10,uE),.22,mE),1.22-.35*sp,dE)+.07*abRum*sin(t*9.);
 // the tail: a slow sway, and it follows the walk with a delay
 float lag=ss(6.9,9.4,t)-ss(7.3,9.9,t);
 abTC=vec2(3.85,3.90+.10*sin(t*.45));abTE=vec2(5.95+1.1*lag,2.05+.22*sin(t*.45-.9)+.15*sin(t*.23));
 // the legs: shoulders and hips move with the body; the feet stay where they are planted (2-bone IK)
 vec2 bo=vec2(abOX,abBob);
 abTop[0]=vec2(.05,2.72);abTop[1]=vec2(-3.88,3.30);abTop[2]=vec2(.47,2.86);abTop[3]=vec2(-3.46,3.46);
 for(int i=0;i<4;i++){vec2 f=abFW[i]-bo;abFB[i]=f;
  if(i==1||i==3){abJ2[i]=f+vec2(.02,.48);abJ1[i]=knee(abTop[i],abJ2[i],1.50,1.38,1.);}
  else{abJ2[i]=f+vec2(.10,.42);abJ1[i]=knee(abTop[i],abJ2[i],1.36,1.05,-1.);}}
}
// the head frame: x along the snout (forward), y up; origin at the back of the skull (the end of the neck)
const float AB_HK=1.3; // the head a little larger than life, so that it reads at this size
vec2 abHeadF(vec2 b,out vec2 hf,out vec2 hu){hf=vec2(-cos(abHA),-sin(abHA));hu=vec2(hf.y,-hf.x);vec2 p=b-abE;return vec2(dot(p,hf),dot(p,hu))/AB_HK;}
// A titanosaur head (after Tapuiasaurus and Sarmientosaurus): a rounded skull, a long low squarish muzzle, the nostrils set back on top.
float abHeadD(vec2 h){float cr=sdEll(h-vec2(.15,.05),vec2(.26,.21));float sn=sdBox(h-vec2(.46,-.005),vec2(.20,.085))-.065;
 float jw=sdCap(h,vec2(.08,-.10),vec2(.60,-.085),.11,.075);float nb=sdEll(h-vec2(.32,.12),vec2(.15,.075));
 return smin(smin(smin(cr,sn,.09),jw,.05),nb,.06)*AB_HK;}
// One leg (body frame): i 0 near hind, 1 near fore, 2 far hind, 3 far fore. Forelimbs: straight pillars ending in a round pad (titanosaurs
// had no fingers to speak of); hind limbs: a heavy thigh, the shin, a short foot with three claws.
float abLegD(vec2 b,int i){vec2 tp=abTop[i],j1=abJ1[i],j2=abJ2[i],f=abFB[i];
 if(b.y>tp.y+1.4||abs(b.x-mix(tp.x,f.x,.5))>2.4)return 1e5;
 if(i==1||i==3){float d=sdCap(b,tp+vec2(-.05,.45),j1,.80,.54);d=smin(d,sdCap(b,j1,j2,.54,.43),.22);d=smin(d,sdCap(b,j2,f+vec2(0.,.18),.44,.50),.14);
  return smin(d,sdEll(b-f-vec2(0.,.15),vec2(.52,.18)),.10);}
 float d=sdEll(rot(-.22)*(b-mix(tp,j1,.40)-vec2(.10,.15)),vec2(1.0,1.30));d=smin(d,sdCap(b,j1,j2,.60,.44),.30);
 d=smin(d,sdCap(b,j2,f+vec2(-.20,.16),.44,.36),.14);return smin(d,sdEll(b-f-vec2(-.24,.15),vec2(.62,.18)),.10);}
// The bones (body frame, metres): the skull, the vertebrae of the neck along its curve, the back with low spines, ribs, the shoulder
// blade, the pelvis, the near legs, the tail.
float abBones(vec2 b){float d=1e5,tt;
 if(length(b-abE)<1.5){vec2 hf,hu;vec2 h=abHeadF(b,hf,hu);
  float sk=smin(sdEll(h-vec2(.15,.05),vec2(.22,.17)),sdBox(h-vec2(.44,0.),vec2(.19,.06))-.05,.06);
  sk=max(sk,-sdEll(h-vec2(.17,.09),vec2(.075,.07)));sk=max(sk,-sdEll(h-vec2(.36,.10),vec2(.08,.045)));
  sk=min(sk,sdCap(h,vec2(.05,-.09),vec2(.58,-.08),.06,.045));d=min(d,sk*AB_HK);}
 if(b.x<-3.6&&b.y>2.5)for(int i=0;i<10;i++){float u=(float(i)+.5)/10.;vec2 p=abBez(AB_N0,abC,abE,u),p2=abBez(AB_N0,abC,abE,u+.07);
  d=min(d,sdCap(b,p,p2,mix(.26,.12,u),mix(.24,.11,u)));}
 if(b.y>3.3&&b.x<1.2&&b.x>-4.9){d=min(d,sdTube(b,AB_N0,vec2(-2.3,4.15),vec2(.55,3.95),.20,.20,tt));
  if(b.y>3.9)for(int i=0;i<8;i++){float x=-3.9+float(i)*.58;d=min(d,sdSeg(b,vec2(x,4.08),vec2(x+.06,4.32))-.07);}}
 if(b.x>.3)d=min(d,sdTube(b,vec2(.55,3.95),abTC,abTE,.19,.04,tt));
 if(b.x>-3.9&&b.x<.9&&b.y>1.5&&b.y<4.3)for(int i=0;i<7;i++){float x=-3.55+float(i)*.52;if(abs(b.x-x-.45)>.9)continue;vec2 a=vec2(x,4.10),c=vec2(x+.30,1.70+.12*float(i));d=min(d,sdTube(b,a,vec2(x+.85,3.15),c,.095,.07,tt));}
 if(b.x<-2.2&&b.x>-4.6&&b.y>2.4)d=min(d,sdEll(rot(.62)*(b-vec2(-3.45,3.45)),vec2(1.0,.27)));
 if(b.x>-1.2&&b.x<1.6&&b.y>1.9&&b.y<4.3){d=min(d,sdEll(b-vec2(.20,3.75),vec2(1.15,.42)));d=min(d,sdCap(b,vec2(-.05,3.35),vec2(-.75,2.20),.15,.22));d=min(d,sdCap(b,vec2(.50,3.30),vec2(1.25,2.35),.14,.10));}
 if(b.y<3.6)for(int k=0;k<2;k++){int i=k;vec2 tp=abTop[i],j1=abJ1[i],j2=abJ2[i],f=abFB[i];if(abs(b.x-j1.x)>1.4)continue;
  if(i==1){d=min(d,sdCap(b,tp+vec2(0.,.15),j1,.25,.18));d=min(d,length(b-j1)-.22);d=min(d,sdCap(b,j1,j2,.17,.15));d=min(d,sdBox(b-mix(j2,f,.5),vec2(.22,length(j2-f)*.5))-.04);}
  else{d=min(d,sdCap(b,tp+vec2(-.05,.1),j1,.29,.20));d=min(d,length(b-j1)-.23);d=min(d,sdCap(b,j1,j2,.18,.15));d=min(d,sdCap(b,j2,f+vec2(-.25,.08),.14,.09));
   if(b.y<.6)for(int c=0;c<3;c++){float fc=float(c);d=min(d,sdCap(b,f+vec2(-.30-.05*fc,.10-.02*fc),f+vec2(-.66-.04*fc,.04-.03*fc),.07,.03));}}}
 return d;}

// ---- The titanosaur ----
// Skin: polygonal scales, bigger on the body and smaller along the neck to the head; countershaded (warm dark grey-brown above, pale sand
// below), soft darker saddles, a few low osteoderms along the back (titanosaurs had them: Saltasaurus; Ampelosaurus on the same island).
void abTitan(vec2 q,float t,float grow,out float dLN,out float dLF){dLN=1e5;dLF=1e5;
 vec2 b=(q-AO)/AS-vec2(abOX,abBob);
 if(b.x<-11.8||b.x>8.2||b.y<-.8||b.y>11.)return;
 bool needB=grow<.6;float dB=needB?abBones(b)*AS:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.75),K_BONE,b*.21,vec2(1,0),.012,.8,0.);
 vec3 back=vec3(.37,.34,.31),belly=vec3(.64,.57,.48);
 // the scales' own coordinates: bigger on the body, finer along the neck towards the head
 vec2 uS=(b-AB_N0)*(11.5+6.0*ss(.6,6.5,length(b-AB_N0))*ss(-3.6,-5.0,b.x));
 // the far legs, in shade
 for(int i=2;i<4;i++){float dl=abLegD(b,i)*AS;if(dl>.05)continue;if(needB)dl=max(dl,dB-G);dLF=min(dLF,dl);
  vec3 la=mix(belly,back,ss(.5,2.6,b.y))*.44*mix(.78,1.,ss(.5,1.4,b.y));PIECE(dl,la,K_SCALE,uS+7.,vec2(1,0),.05,1.,0.);}
 // the body: chest, belly, hips, tail, neck, head and the near legs as one
 float tt=0.,tn=0.;
 float dTail=b.x>-.5?abTube(b,vec2(1.0,3.55),abTC,abTE,.95,.07,tt):1e5;
 float dCh=sdEll(b-vec2(-3.45,3.48),vec2(1.62,1.46+.035*abBr));
 float dBe=sdEll(rot(-.07)*(b-vec2(-1.70,3.02)),vec2(2.75,1.40+.05*abBr));
 float dHi=sdEll(b-vec2(.25,3.18),vec2(1.52,1.10));
 float dNk=b.x<-2.8&&b.y>1.?abTube(b,AB_N0,abC,abE,1.10,.30,tn):1e5;
 vec2 hf,hu;vec2 h=abHeadF(b,hf,hu);float dHd=length(b-abE)<1.6?abHeadD(h):1e5;
 // the throat at the base of the neck swells at the rumble
 float dTh=sdEll(b-vec2(-5.05,3.45)-.12*vec2(-1.,1.)*abRum,vec2(.78+.20*abRum,.58+.30*abRum));
 float dBody=smin(smin(dBe,dCh,.8),dHi,.8);dBody=smin(dBody,dTail,.55);dBody=smin(dBody,dNk,.5);dBody=smin(dBody,dTh,.35);dBody=smin(dBody,dHd,.14);
 float dL0=abLegD(b,0),dL1=abLegD(b,1);float dNear=min(dL0,dL1);
 float d=smin(dBody,dNear,.22);
 float dq=d*AS;if(needB)dq=max(dq,dB-G);
 dLN=needB?max(dNear*AS,dB-G):dNear*AS;
 if(dq<.01){
  // countershading from each part's own axis (smooth: +1 on top, -1 underneath)
  float dTo=min(min(dBe,dCh),dHi);float dm=min(min(dTo,dTail),min(dNk,dHd));
  float wTo=exp(-3.*(dTo-dm)),wTl=exp(-3.*(dTail-dm)),wNk=exp(-3.*(dNk-dm)),wHd=exp(-3.*(dHd-dm));
  vec2 vN=b-abBez(AB_N0,abC,abE,tn),vT=b-abBez(vec2(1.0,3.55),abTC,abTE,tt);
  float side=(wTo*clamp((b.y-3.10+.08*(b.x+1.7))/1.45,-1.,1.)+wTl*vT.y/max(length(vT),.30)+wNk*vN.y/max(length(vN),.35)+wHd*clamp(h.y/.22,-1.,1.))/(wTo+wTl+wNk+wHd);
  float gy=side;
  vec3 alb=mix(belly,back,ss(-.55,.45,gy));
  // the underside in its own shade (the belly and the throat turn away from the light)
  alb*=mix(.66,1.,ss(-.90,-.10,gy));
  // soft darker saddles over the back, a warmer face
  alb*=1.-.15*ss(.50,.72,fbm(b*vec2(.50,.85)+3.))*ss(-.3,.4,gy);
  alb*=.94+.10*fbm(b*1.7);
  alb=mix(alb,alb*vec3(1.07,.97,.90),ss(1.5,.0,dHd)*.6);
  // the legs: lighter on the front, darker and wet low down (they have been in the river)
  float wl=ss(.06,-.06,dNear);vec3 la=mix(belly,back,ss(.3,3.4,b.y))*mix(.70,1.,ss(.55,1.5,b.y+abBob));alb=mix(alb,la,wl*.85);
  // the direction of the surface for the light, smooth (from each part's own axis): the screen derivatives step in 2×2 blocks on the
  // thin neck. In front, the near legs (their own derivatives are fine: they are wide).
  vec2 hg=(h-vec2(.30,0.))/vec2(.16,.04);vec2 nH=hf*hg.x+hu*hg.y;
  vec2 gB=wTo*normalize((b-vec2(-1.7,3.20))/vec2(8.4,2.1))+wTl*vT/max(length(vT),1e-4)+wNk*vN/max(length(vN),1e-4)+wHd*nH/max(length(nH),1e-4);
  vec2 gL=vec2(0.,1.);{float best=1e5;for(int i=0;i<2;i++){vec2 P0=abTop[i]+vec2(0.,.4),P1=abJ1[i],P2=abJ2[i],P3=abFB[i]+vec2(0.,.15);
    for(int k=0;k<3;k++){vec2 a=k==0?P0:k==1?P1:P2,c=k==0?P1:k==1?P2:P3;float u=segU(b,a,c);vec2 v=b-mix(a,c,u);float l=length(v);if(l<best){best=l;gL=v;}}}
    gL=mix(vec2(-.35,1.),gL/max(best,1e-4),ss(.0,.42,best));}
  float lin=ss(.05,-.12,dNear);
  vec2 gA=mix(gB/max(length(gB),1e-4),gL/max(length(gL),1e-4),lin);
  piece(dq,gA,alb,K_SCALE,uS,vec2(1,0),.14,1.,0.);
  if(G>.3){
   // a warm rim of the low sun along the top edges on its side, and the turquoise light bounced from the river under the belly and the neck
   vec2 nd=gA/max(length(gA),1e-4);float band=ss(-.018,-.004,dq)*ss(.0,-.0025,dq);
   float rw=sat(dot(nd,vec2(-.80,.60)));glow(vec3(1.0,.70,.40)*band*rw*rw*.34,0.);
   float bw=sat(-nd.y)*ss(-.035,-.004,dq)*ss(.0,-.0025,dq)*(1.-lin*.5);glow(vec3(.03,.12,.12)*bw,0.);
   // soft folds: behind the shoulder, behind the elbow, in front of the hip
   {vec2 c1=abTop[1]+vec2(.15,.25);float f1=abs(length(b-c1)-1.15);float m1=ss(.1,.6,dot(normalize(b-c1),vec2(.75,.45)));
    vec2 c2=abJ1[1];float f2=min(abs(length(b-c2)-.36),abs(length(b-c2)-.55));float m2=ss(.2,.7,dot(normalize(b-c2),vec2(.85,.3)));
    vec2 c3=mix(abTop[0],abJ1[0],.4)+vec2(.10,.15);float f3=abs(length(b-c3)-1.30);float m3=ss(.1,.6,dot(normalize(b-c3),vec2(-.85,.25)));
    float fl=max(max(ss(.09,.0,f1)*m1,ss(.06,.0,f2)*m2*.8),ss(.09,.0,f3)*m3)*ss(.0,-.1,d);
    shadow(fl*.16,vec3(.55,.47,.42),0.);}
   // the near legs stand in front of the body: a soft shade on the body along their edge
   shadow(ss(.0,.08,dNear)*ss(.40,.08,dNear)*ss(.0,-.15,dBody)*.30,vec3(.55,.47,.42),0.);
   // osteoderms: a sparse double row of low oval bosses along the upper flank
   if(b.y>3.0&&b.y<4.5&&b.x>-3.8&&b.x<1.9){float od=1e5;for(int i=0;i<7;i++){float fi=float(i);vec2 c=vec2(-3.45+fi*.82+.18*sin(fi*2.7),3.72+.28*mod(fi,2.)-.10*sin(fi));
     od=min(od,sdEll(rot(.15*sin(fi*1.3))*(b-c),vec2(.17,.10)));}
    if(od<.15)PIECE(od*AS,alb*1.03,K_PLATE,b*9.,vec2(1,0),.0025,0.,0.);}
   // folds of skin where the neck meets the chest, behind the shoulder, over the knee and the wrist
   if(dNk<.0&&tn<.25){float fo=1e5;for(int i=0;i<3;i++)fo=min(fo,abs(tn-.07-.055*float(i)));shadow(ss(.012,.0,fo)*ss(.0,-.15,dNk)*ss(.3,-.6,side)*.25,vec3(.55,.48,.42),0.);}
   // the face: the mouth line (closed), the nostril, the eye
   if(dHd<.4){
    float ml=abs(h.y+.042+.03*(h.x-.4)+.012*sin(h.x*14.))-.010;ml=max(ml,abs(h.x-.39)-.27);PIECE(ml*AS*AB_HK,back*.30,K_SKIN,h,vec2(1,0),.001,0.,0.);
    PIECE(sdEll(h-vec2(.40,.150),vec2(.050,.028))*AS*AB_HK,vec3(.10,.08,.07),K_EYE,h,vec2(1,0),.001,0.,0.);
    vec2 ec=AO+(abE+(hf*.17+hu*.085)*AB_HK+vec2(abOX,abBob))*AS;
    shadow(ss(.014,.0,length(q-ec-vec2(0.,.002)))*.30,vec3(.5,.42,.38),0.);
    eyeA(q,ec,.0068,vec3(.42,.27,.12),back*1.08,blinkAt(t,.31),0.);}
  }
 }
}
// Its reflection in the river (mirrored about the water at its depth): a soft dark likeness, broken by slow ripples.
void abRefl(vec2 q,float t){if(q.y>AWY||uDecor>1.5)return;
 vec2 qm=vec2(q.x+.0035*sin(q.y*190.+t*1.1)+.002*sin(q.y*83.-t*.7+q.x*14.),2.*AWY-q.y);
 vec2 b=(qm-AO)/AS-vec2(abOX,abBob);if(b.x<-11.||b.x>7.5||b.y>10.5)return;
 float d=sdEll(b-vec2(-1.7,3.10),vec2(3.6,1.45));
 vec2 m=abBez(AB_N0,abC,abE,.5);d=min(d,sdCap(b,AB_N0,m,1.0,.55));d=min(d,sdCap(b,m,abE,.55,.30));
 vec2 hf=vec2(-cos(abHA),-sin(abHA));d=min(d,sdCap(b,abE,abE+hf*.80,.30,.20));
 d=min(d,sdCap(b,vec2(1.,3.5),abTC,.85,.5));d=min(d,sdCap(b,abTC,abTE,.5,.08));
 for(int i=0;i<4;i++)d=min(d,sdCap(b,abTop[i],abFB[i],.62,.48));
 float a=ss(.25,-.25,d)*.55*(1.-.30*ss(.0,.25,AWY-q.y));
 veil(vec3(.10,.14,.15),a,1.);}

// ---- The backdrop: a morning sky, the hills of the rising Pyrenees, a grove of palms and conifers on the red clay bank, river mist ----
vec3 abSkyCol(vec2 q){float ds=length(q-AB_SUN);vec3 c=mix(vec3(.97,.88,.74),vec3(.56,.69,.84),ss(.0,.62,q.y));return mix(c,vec3(1.,.94,.82),ss(.55,.0,ds)*.6);}
float abBankTop(float x){return -.048+.011*fbm2(vec2(x*4.5,1.3))+.006*sin(x*2.3+1.)+.055*ss(-.10,.60,x)*(.8+.4*vn(vec2(x*6.,4.)));}
// One tree of the far bank (l: from its foot, h: its height): tp<.33 a narrow conifer, <.66 a fan palm (Sabalites, known from the Tremp
// Formation), otherwise a round broadleaf crown.
float abTree(vec2 l,float h,float tp,float sd,float t){
 if(tp<.30){float y=l.y/h;float w=h*.13*(1.-y)*(.40+.60*sat(y*6.))*(.70+.6*vn(vec2(l.y*240.,sd)));return max(abs(l.x)-w,max(-l.y,l.y-h));}
 if(tp<.62){vec2 cc=vec2(h*.14*(h11(sd)-.5)+.002*sin(t*.5+sd),h*.84);float tr=sdSeg(l,vec2(0.),cc)-.0013;float R=h*.25;vec2 lc=l-cc;float dc=length(lc)-R*1.25;
  if(dc<.004){dc=1e5;for(int k=0;k<6;k++){float an=mix(-.35,PI+.35,float(k)/5.)+.15*sin(sd*3.+float(k)*2.);vec2 dir=vec2(cos(an),sin(an));
    vec2 c=dir*R*.50-vec2(0.,R*.22*(1.-dir.y));dc=min(dc,sdEll(rot(an)*(lc-c),vec2(R*.56,R*.16)));}}
  return min(tr,dc);}
 float d=sdEll(l-vec2(0.,h*.55),vec2(h*.36,h*.30));d=smin(d,sdEll(l-vec2(-h*.24,h*.40),vec2(h*.24,h*.19)),h*.07);d=smin(d,sdEll(l-vec2(h*.25,h*.43),vec2(h*.25,h*.21)),h*.07);
 d+=h*.07*(vn(l*70./h+sd)-.5)+h*.03*(vn(l*200./h)-.5);return min(d,sdSeg(l,vec2(0.),vec2(0.,h*.35))-.0018);}
void abGrove(vec2 q,float t,float fr,float hgt,float seed,vec3 col,float near){
 float x=q.x*fr+seed,ci=floor(x);float dm=1e5,hm=0.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);if(h11(cj*5.3+seed)<.10)continue;float cx=(cj+.5+(h11(cj*1.7)-.5)*.6-seed)/fr;
  float base=near>.5?abBankTop(cx)-.004:-.040;float hh=hgt*(.55+.6*h11(cj+seed));float tp=h11(cj*3.1+seed);
  float dd=abTree(q-vec2(cx,base),hh,tp,cj,t);if(dd<dm){dm=dd;hm=h11(cj*7.7);}}
 if(dm>.01)return;
 PIECE(dm,col*(.88+.24*hm),K_FAR,q*3.+seed,vec2(1,0),.012,.10+.12*near,1.);}
void abBackdrop(vec2 q,float t){
 PIECE(-1.,abSkyCol(q),K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
 // high thin clouds, drifting
 float cl=fbm(vec2(q.x*1.2+t*.004,q.y*7.+3.))*ss(.14,.30,q.y)*ss(.95,.45,q.y);veil(mix(vec3(1.,.95,.86),vec3(.86,.88,.92),ss(.2,.6,q.y)),ss(.55,.78,cl)*.6,1.);
 float ds=length(q-AB_SUN);veil(vec3(1.,.97,.86),ss(.036,.028,ds)*.85,1.);veil(vec3(1.,.94,.80),ss(.20,.0,ds)*.22,1.);
 if(q.y>.25)return;
 // the rising Pyrenees, far to the north, and nearer low hills
 range(q,.045,.085,1.3,5.,vec3(.56,.60,.70),vec3(.86,.86,.86),.85);
 range(q,.005,.055,2.4,11.,vec3(.52,.56,.56),vec3(.86,.86,.84),.65);
 veil(vec3(.95,.92,.86),ss(.08,-.06,q.y)*.30,1.);
 if(q.y>.17||q.y<AFB-.01)return;
 // the far grove, then the grove on the far bank, and the red clay of the bank
 abGrove(q,t,26.,.075,3.,vec3(.62,.66,.60),0.);
 veil(vec3(.94,.92,.86),.30*ss(.17,.06,q.y),1.);
 abGrove(q,t,15.,.125,9.,vec3(.38,.46,.36),1.);
 float bt=abBankTop(q.x);
 if(q.y<bt+.04){float bed=fbm2(vec2(q.x*3.+q.y*8.,q.y*90.));vec3 rc=mix(vec3(.74,.43,.30),vec3(.60,.33,.25),ss(.35,.65,bed));
  rc=mix(rc,vec3(.80,.62,.44),ss(.70,.80,fbm2(vec2(q.x*2.,q.y*140.)+9.))*.5); // a paler ochre bed
  rc=mix(rc,vec3(.64,.60,.52),ss(.62,.75,fbm2(vec2(q.x*14.,q.y*30.)+4.))*.5); // grey-green mottles of the old soils
  rc=mix(rc,vec3(.30,.36,.24),ss(-.008,.0,q.y-bt)*.9);
  rc=mix(rc,vec3(.93,.90,.85),.14);PIECE(q.y-bt,rc,K_FAR,q*vec2(2.,6.),vec2(1,0),.01,.12,1.);
  // the low ferns and shrubs along the top of the bank
  float sh=bt+.010+.016*fbm2(vec2(q.x*30.,2.))+.006*vn(vec2(q.x*230.,5.));
  PIECE(max(q.y-sh,bt-.004-.004*vn(vec2(q.x*60.,7.))-q.y),vec3(.33,.42,.28)*(.9+.2*vn(vec2(q.x*40.,1.))),K_PLANT,q*vec2(8.,2.),vec2(0,1),.004,.10,1.);}
}
// The mist over the river: soft banks that drift slowly, thicker low over the water and on the left (dec: it is decor).
float abMistA(vec2 q,float t){
 float band=ss(AFB-.05,AFB+.01,q.y)*ss(.175,.03,q.y);if(band<=0.)return 0.;
 float n=fbm(vec2(q.x*2.2-t*.018,q.y*8.+t*.01));float n2=fbm2(vec2(q.x*5.-t*.03,q.y*14.)+7.);
 return band*(.30+.70*ss(.28,.72,n*.75+n2*.35))*mix(.22,1.,ss(.25,-.45,q.x));}

// ---- The river ----
float abShore(float x){return -.47+.17*ss(-.15,-.85,x)+.10*ss(.30,.85,x)+.010*sin(x*7.+1.)+.006*(vn(vec2(x*14.,3.))-.5);}
// the small wave pushed by the steps: from where the fore feet go into the water, towards the near bank
const vec2 AB_WV=vec2(-.21,AWY);const float AB_WT=7.55,AB_WS=.48;
float abWaveR(vec2 p){return length((p-AB_WV)/vec2(1.,.25));}
// slow soft caustics on the sandy bottom of the shallows
float abCaus(vec2 p,float t){vec2 id;vec3 a=voro(p+vec2(t*.06,t*.045),id);vec3 c=voro(p*1.37+vec2(-t*.05,t*.06)+3.7,id);
 return ss(.24,.02,a.y-a.x)*.6+ss(.24,.02,c.y-c.x)*.45;}
// a ring on the water at c, of age a (seconds)
float abRing(vec2 q,vec2 c,float a,float sp,float life){if(a<0.||a>life)return 0.;float r=.006+a*sp;float e=length((q-c)/vec2(1.,.26))-r;
 return (ss(.007,.0,abs(e-.002))-.6*ss(.009,.0,abs(e+.007)))*(1.-a/life)*(1.-a/life);}
void abWater(vec2 q,float t){
 float sh=abShore(q.x);if(q.y>AFB+.004||q.y<sh-.03)return;
 float dw=max(AFB-q.y,0.),Z=1./(dw+.03),X=q.x*Z;
 float r=vn(vec2(X*.7,Z*2.0-t*.16))+.55*vn(vec2(X*1.7+5.,Z*4.8+t*.11));
 // what the water reflects: the far bank (red clay and its grove, softened by the mist) and the sky
 vec2 m=vec2(q.x+(r-.78)*.010*(.3+dw*3.),2.*AFB-q.y+(r-.78)*.006);
 float bt=abBankTop(m.x);vec3 refl=abSkyCol(m);
 float vt=bt+.022+.045*fbm2(vec2(m.x*9.,.5))+.03*ss(.6,.9,vn(vec2(m.x*15.,2.)));
 refl=mix(refl,mix(vec3(.46,.52,.44),refl,.45),ss(.004,-.004,m.y-vt));
 refl=mix(refl,mix(vec3(.64,.40,.30),refl,.30),ss(.003,-.003,m.y-bt));
 float fr=mix(.82,.28,ss(.0,.30,dw));
 vec3 wb=mix(vec3(.30,.66,.64),vec3(.13,.44,.47),ss(.02,.33,dw));
 vec3 col=mix(wb,refl,fr);col*=.95+.09*(r-.78);
 // the sun's path: soft, wide and slow
 float sw=.03+.32*dw;float sg=exp(-pow((q.x-AB_SUN.x-(r-.78)*.03)/sw,2.))*ss(.0,.02,dw)*(1.-.7*ss(.04,.35,dw));
 col+=vec3(1.,.90,.72)*sg*(.10+.20*ss(.75,1.25,r));
 // the shallows near our bank: the sand of the bottom shows through, with soft slow caustics
 float sd=q.y-sh;float shl=ss(.085,.0,sd);
 if(shl>0.){float ca=abCaus(vec2(X*1.1,Z*3.2),t);vec3 bot=vec3(.58,.62,.48)*(.88+.30*ca);col=mix(col,bot,shl*.58);}
 // the turquoise is mixed with what the light does (K_WATER multiplies it by the light: undo that)
 vec3 lw=AMBC*.5+SUNC*.6;
 PIECE(q.y-AFB,col/lw,K_WATER,vec2(X*.3,Z*.4),vec2(1,0),.02,0.,1.);
 // the mist touches the far water
 veil(vec3(.94,.93,.88),ss(.05,.0,dw)*.35,1.);
 if(uDecor>1.5)return;
 abRefl(q,t);
 // rings: the rumble at the feet (6.0 s), each foot coming down, the mouth drinking, the drips
 float rg=0.;
 for(int i=0;i<4;i++){vec2 c=AO+(AB_FT[i]+vec2(0.,AWD))*AS+vec2(.0,.0);vec2 c2=AO+(AB_FT[i]+vec2(-AB_STEP,AWD))*AS;
  if(i<2)for(int k=0;k<3;k++)rg+=abRing(q,c,t-6.05-float(k)*.36,.045,1.8)*.8;
  rg+=abRing(q,c2,t-AB_ST[i]-.80,.06,2.4)*1.2;
  rg+=abRing(q,c2,t-AB_ST[i]-1.25,.05,2.0)*.6;}
 vec2 mo=AO+(vec2(-8.685,AWD)+vec2(-AB_STEP,0.))*AS;
 rg+=abRing(q,mo,t-11.45,.04,2.6);rg+=abRing(q,mo,t-11.95,.035,2.2)*.6;
 if(t>12.6){float c=mod(t-12.6,5.2);rg+=abRing(q,mo,c-2.35,.035,2.)*.8;rg+=abRing(q,mo+vec2(.004,0.),c-1.1,.03,1.2)*.5;rg+=abRing(q,mo-vec2(.003,0.),c-1.45,.03,1.2)*.4;}
 // the wave: a soft crest that spreads to the near bank
 float wa=t-AB_WT;if(wa>0.&&wa<3.){float Rw=abWaveR(q);float e=Rw-wa*AB_WS;float dir=ss(.1,.8,(AB_WV.y-q.y)/.25/max(Rw,1e-3));
  rg+=(ss(.045,.0,abs(e))*.75-ss(.06,.0,abs(e+.05))*.40)*(1.-wa/3.)*dir*(.65+.35*vn(q*vec2(30.,60.)+t*.3));}
 if(rg>0.)glow(vec3(.30,.32,.30)*rg*.55,1.);else shadow(-rg*.28,vec3(.55,.70,.72),1.);
}
// The near bank: pale sand on the left, the red clay of Tremp on the right; the nest of the titanosaurs under the sand.
float abSwash(float x,float t,out float reach){
 // the wave arrives along the bank in the order of its distance; it runs up the sand and draws back
 float sh=abShore(x);float R=abWaveR(vec2(x,sh));float ta=AB_WT+R/AB_WS;float a=t-ta;
 float amp=.072*exp(-max(R-.58,0.)*2.6)*(.7+.3*ss(-.2,-.5,x));
 reach=sh-amp*ss(0.,.55,a);
 return sh-amp*ss(0.,.55,a)*(1.-ss(.75,2.0,a));}
void abBeach(vec2 q,float t){
 float sh=abShore(q.x);if(q.y>sh+.006)return;
 float reach;float ys=abSwash(q.x,t,reach);
 vec3 sand=mix(vec3(.82,.72,.56),vec3(.70,.42,.30),ss(-.05,.42,q.x));
 sand=mix(sand,vec3(.64,.58,.50),ss(.6,.8,fbm2(q*vec2(9.,22.)+2.))*.35*ss(.0,.3,q.x)); // grey-green mottles in the clay
 float wet=max(ss(.020,.0,sh-q.y),ss(-.002,.004,q.y-reach)*(1.-.55*ss(11.,26.,t)));
 sand*=mix(1.,.74,wet);
 // ripple marks in the sand, parallel to the water
 sand*=1.+.05*sin((sh-q.y)*520.+3.*vn(q*vec2(20.,40.)))*ss(.0,.015,sh-q.y)*ss(.12,.03,sh-q.y)*(1.-ss(-.1,.3,q.x));
 PIECE(q.y-sh,sand,K_SAND,q*vec2(1.2,3.),vec2(1,0),.02,0.,1.);
 // pebbles of the river
 if(q.y<sh-.035){vec2 g=q*vec2(12.,24.);vec2 ci=floor(g);vec2 f=fract(g)-.5-(h22(ci)-.5)*.5;float on=step(.90,h21(ci+3.));float pd=(length(f*vec2(1.,1.6))-.20*on*(.6+.6*h21(ci+5.)))/24.;
  if(on>.5){shadow(ss(.004,-.002,pd-.002)*.20,vec3(.6,.55,.5),1.);PIECE(pd,mix(vec3(.72,.70,.64),vec3(.76,.56,.44),h21(ci)),K_ROCK,q*4.,vec2(1,0),.008,.0,1.);}}
 // the nest: a low mound of sand over the eggs, washed down by the wave
 float rv=ss(9.45,10.9,t);
 float me=length((q-vec2(-.532,-.433))/vec2(.105,.011+mix(.022,.006,rv)));
 if(me<1.2){float top=ss(-.006,.010,q.y+.437);veil(sand*1.10,ss(1.,.35,me)*.45*top,1.);shadow(ss(1.08,.80,me)*(1.-top)*.22,vec3(.70,.62,.55),1.);}
 // the eggs (they are the story's: not decor): only what the sand no longer covers shows
 if(abs(q.x+.532)<.085&&abs(q.y+.43)<.05)for(int i=0;i<5;i++){vec3 e=AB_EGG[i];vec2 c=e.xy;float r=e.z;
  float ri=ss(9.45+.18*float(i==3?0:i==1?3:i+1),10.85,t);
  float xr=(q.x-c.x)/r;float yS=mix(c.y+1.20*r,c.y-.50*r,ri)+.30*r*xr*xr*ri+.0008*sin(q.x*900.+float(i));
  float de=max(length(q-c)-r,yS-q.y);if(de>.01)continue;
  vec2 id;vec3 v=voro((q-c)*vec2(230.,250.),id);float nod=ss(.55,.05,v.x);
  vec3 ea=vec3(.92,.89,.82)*(.86+.16*nod)*mix(1.,.86,ss(9.2,9.7,t)*(1.-.6*ss(11.,20.,t)));
  PIECE(de,ea,K_SHELL,(q-c)*1.6,vec2(1,0),r*.9,.35,0.);
  shadow(ss(.004,-.002,abs(q.y-yS)-.0012)*ss(.0,-.003,length(q-c)-r)*.30,vec3(.6,.55,.5),0.);}
 // the wave on the sand: a thin sheet of water, its foam edge, then the lace of foam it leaves as it draws back
 if(q.y>reach-.01){
  float sheet=ss(-.002,.003,q.y-ys)*ss(.002,-.004,q.y-sh);
  veil(vec3(.55,.78,.76),sheet*.42,1.);
  float fo=ss(.006,.0,abs(q.y-ys-.002))*(.55+.45*vn(vec2(q.x*120.,t*1.5)))*ss(.0,.004,sh-ys);
  float lace=ss(.62,.72,vn(q*vec2(160.,320.)+3.))*ss(-.002,.004,q.y-reach)*ss(.0,.01,q.y-ys)*ss(10.,9.4,t)*ss(9.0,9.5,t);
  veil(vec3(.97,.97,.94),fo*.7+lace*.45,1.);}
 // the edge of the river laps softly
 float lp=sh+.003+.003*sin(t*1.1+q.x*5.);veil(vec3(.95,.96,.93),ss(.004,.0,abs(q.y-lp))*.45*(.6+.4*vn(vec2(q.x*90.,t*.8))),1.);
}
// A fern (decor): fronds with comb-like leaflets from b, of length sc.
void abFern(vec2 q,vec2 b0,float sc,float t,float sd){if(abs(q.x-b0.x)>sc*1.1||q.y<b0.y-.01||q.y>b0.y+sc*1.05)return;float dd=1e5;vec2 fu0=vec2(0.);
 float tilt=(h11(sd*1.9)-.5)*.6;vec3 fcol=mix(vec3(.26,.38,.18),vec3(.34,.40,.16),h11(sd*2.7));int nf=5+int(h11(sd)*2.);
 for(int i=0;i<7;i++){if(i>=nf)break;float fi=float(i);float ang=tilt-1.0+fi*2.0/float(nf-1)*.8+.035*sin(t*.7+fi+sd);vec2 l=rot(ang)*(q-b0);float len=sc*(.75+.3*h11(fi+sd));
  float x=l.y/len;float y=l.x-.30*sign(ang+.2)*x*x*len;float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*18.);
  float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));float d=max(abs(y)-w,pin*len/18.);d=min(d,abs(y)-.0012);d=max(d,max(-l.y,l.y-len));
  if(d<dd){dd=d;fu0=vec2(x,fi);}}
 PIECE(dd,fcol*(.85+.3*h11(fu0.y+sd)),K_PLANT,fu0*vec2(1.,6.),vec2(0,1),.004,.6,1.);}
// Horsetails (Equisetum) at the bottom right and ferns at the bottom left (foreground decor).
void abFore(vec2 q,float t){
 if(q.x>.52&&q.y<-.18){float dd=1e5;float nd=0.;
  for(int i=0;i<7;i++){float fi=float(i);vec2 b=vec2(.60+fi*.05+.02*sin(fi*3.1),-.56-.02*h11(fi));float hgt=.20+.14*h11(fi*2.3);
   vec2 tp=b+vec2(.03*sin(fi*1.7)+.012*sin(t*.8+fi*1.3),hgt);if(q.y>tp.y+.03)continue;
   float d=sdCap(q,b,tp,.0055,.0025);
   float u=segU(q,b,tp);float s=u*hgt;float k=floor(s/.028);vec2 nd0=mix(b,tp,(k*.028)/hgt);
   for(int j=0;j<2;j++){float sg=float(j)*2.-1.;float bl=.028*(1.-u*.7);d=min(d,sdSeg(q,nd0,nd0+vec2(sg*bl,bl*.65))-.0010);}
   if(d<dd){dd=d;nd=fract(s/.028);}}
  PIECE(dd,vec3(.30,.40,.22)*(.8+.4*ss(.0,.2,nd))*mix(1.,.6,ss(.1,.0,nd)),K_PLANT,q*vec2(30.,4.),vec2(0,1),.003,.6,1.);}
 if(q.x<-.55&&q.y<-.25)abFern(q,vec2(-.88,-.60),.30,t,0.);
 // further down (seen on tall screens): more clumps of ferns and horsetails on the bank
 if(q.y<-.52){float rw=floor((-q.y-.52)/.26);for(int k=0;k<2;k++){float r=rw+float(k)-.5;if(r<0.)continue;float y0=-.62-r*.26;float cw=.42;float ci=floor(q.x/cw+r*.37);
   for(int j=0;j<2;j++){float c=ci+float(j);if(h11(c*3.7+r)<.55)continue;vec2 bs=vec2((c+.5+(h11(c+r*5.)-.5)*.5-r*.37)*cw,y0+(h11(c*1.3+r)-.5)*.06);
    abFern(q,bs,.16+.16*h11(c+r*2.),t,c+r*7.);}}}
}
// Drops: from the feet as they come out of the water, the splash as they go back in, from the chin after it drinks.
void abDrops(vec2 q,float t){if(uDecor>1.5)return;
 for(int i=0;i<2;i++){float t0=AB_ST[i];float a=t-t0;if(a<.15||a>1.6)continue;vec2 fq=AO+(abFW[i]+vec2(0.,.15))*AS;
  if(abs(q.x-fq.x)>.06||abs(q.y-fq.y)>.08)continue;
  for(int j=0;j<6;j++){float fj=float(j);float ta=.15+.5*h11(fj+float(i)*9.);float ag=a-ta;if(ag<0.||ag>.6)continue;
   vec2 c=AO+(vec2(abFW[i].x,max(abFW[i].y,AWD-.1))+vec2((h11(fj*3.)-.5)*.7,.1))*AS+vec2(0.,-.35*ag*ag);if(c.y<AWY+.002*fj-.004)continue;
   veil(vec3(.92,.97,.98),ss(.0028,.001,length((q-c)*vec2(1.,.7)))*.8,1.);}}
 for(int i=0;i<4;i++){float a=t-AB_ST[i]-.80;if(a<0.||a>.9)continue;vec2 c0=AO+(AB_FT[i]+vec2(-AB_STEP,AWD))*AS;if(abs(q.x-c0.x)>.07||abs(q.y-c0.y)>.07)continue;
  for(int j=0;j<7;j++){float fj=float(j);vec2 v=vec2((h11(fj+float(i)*5.)-.5)*.11,.05+.06*h11(fj*2.1+float(i)));vec2 c=c0+v*a+vec2(0.,-.30*a*a);if(c.y<c0.y-.004)continue;
   veil(vec3(.94,.98,.98),ss(.0026,.0008,length(q-c))*(1.-a/.9)*.85,1.);}}
 // drips from the chin while it sips
 if(t>11.3){vec2 hf=vec2(-cos(abHA),-sin(abHA)),hu=vec2(hf.y,-hf.x);vec2 ch=AO+(abE+hf*.80+hu*(-.10)+vec2(abOX,abBob))*AS;
  if(abs(q.x-ch.x)<.02&&q.y<ch.y+.01&&q.y>AWY-.01){float c=mod(t-12.6,5.2);
   for(int j=0;j<3;j++){float fj=float(j);float ag=c-1.15-fj*.33;if(t<12.6||ag<0.||ag>.6)continue;vec2 p=ch+vec2(.002*fj-.002,-.5*.9*ag*ag);if(p.y<AWY-.004)continue;
    veil(vec3(.90,.96,.98),ss(.0024,.0008,length((q-p)*vec2(1.,.75)))*.85,1.);}}}
}
// Two dragonflies over the water (decor).
void abFlies(vec2 q,float t){for(int i=0;i<2;i++){float fi=float(i);vec2 c=vec2(-.30+.20*sin(t*.31+fi*2.5)+fi*.25,-.16+.035*sin(t*.53+fi*4.));
 if(abs(q.x-c.x)>.03||abs(q.y-c.y)>.02)continue;float dd=sdCap(q,c-vec2(.015,0.),c+vec2(.016,0.),.0022,.0013);
 float fl=sin(t*40.+fi)*.3;float dw=min(sdEll(rot(.3+fl)*(q-c-vec2(-.003,.006)),vec2(.011,.0035)),sdEll(rot(-.3-fl)*(q-c-vec2(-.003,-.006)),vec2(.011,.0035)));
 veil(vec3(.88,.94,.96),ss(.002,-.001,dw)*.40,1.);PIECE(dd,vec3(.12,.34,.40),K_SKIN,q*200.,vec2(1,0),.002,.5,1.);}}

void sceneAbdito(vec2 q,float t,float grow){
 SUNL=normalize(vec3(-.70,.40,.60));SUNC=vec3(1.30,1.14,.90);AMBC=vec3(.50,.56,.64);BACK=.10;
 abPose(t);
 abBackdrop(q,t);
 // the mist behind the titanosaur, over the far water and the bank
 float mist=uDecor<1.5?abMistA(q,t):0.;veil(vec3(.95,.93,.88),mist*.80,1.);
 abWater(q,t);abWC=F.rgb;
 // contact: the feet on the river bed
 for(int i=0;i<4;i++){vec2 f=AO+abFW[i]*AS;contact(q,f+vec2(-.004,.002),.035,.30*(1.-abLift[i]));}
 float dLN,dLF;abTitan(q,t,grow,dLN,dLF);
 // the legs under the water: seen through it; a collar of foam where they go in
 if(q.y<AWY+.03&&uDecor<1.5){for(int i=0;i<4;i++){vec2 f=AO+abFW[i]*AS;float wy=AWY+(AB_FT[i].y)*AS;float wb=wy+.0015*sin(t*1.7+q.x*90.+float(i));
   if(abs(q.x-f.x)>.06)continue;float lc=i<2?cov(dLN):cov(dLF)*cov(-dLN);float un=ss(.0012,-.0012,q.y-wb)*lc;F.rgb=mix(F.rgb,abWC*vec3(.90,.97,1.),un*.74);
   float col=length((q-vec2(f.x-.003,wb))/vec2(1.,.24))-.034-.002*sin(t*2.+float(i));veil(vec3(.92,.96,.94),ss(.0045,.0,abs(col))*mix(.10,.38,step(q.y,wb))*lc*(1.-abLift[i]*.8),1.);}}
 abDrops(q,t);
 // the mist in front: the head rests in it, and comes up out of it
 veil(vec3(.96,.94,.90),mist*max(ss(AWY+.05,AWY-.005,q.y)*.55,ss(-.27,-.37,q.x+abOX*AS)*ss(-.06,.0,q.y)*(1.-abUp)*.70),1.);
 abBeach(q,t);
 abFore(q,t);
}
void fossilAbdito(vec2 q){abPose(0.);
 // fossil eggs of the nest (Megaloolithus, as they are found in the red beds of the Pyrenees)
 if(abs(q.x+.532)<.085&&abs(q.y+.43)<.05)for(int i=0;i<5;i++){vec3 e=AB_EGG[i];float de=length(q-e.xy)-e.z;if(de<.01)PIECE(de,vec3(.80,.74,.64),K_FOSSIL,q*3.,vec2(1,0),e.z,.6,0.);}
 vec2 b=(q-AO)/AS-vec2(abOX,abBob);if(b.x<-11.||b.x>7.6||b.y<-.6||b.y>8.)return;
 float d=abBones(b)*AS;PIECE(d,vec3(.82,.76,.64),K_FOSSIL,b*.21,vec2(1,0),.012,.6,0.);}

const vec2 WIN_C=vec2(-.02,-.08);
void fossil(vec2 q){fossilAbdito(q);}
void life(vec2 q,float t){sceneAbdito(q,t,GROW);}

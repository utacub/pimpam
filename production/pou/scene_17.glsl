// ---- Scene 18 (El pou del temps, CE37): Brachiosaurus altithorax and Diplodocus on the Morrison plain (Late Jurassic, about 152
// million years ago, the western interior of North America). A warm late afternoon over a fern savanna: low ferns and cycads on dry
// ochre ground, scattered araucarias, far mesas in the haze. Story: a brachiosaurus stands by a tall araucaria, its neck forward and a
// little down; 3.6–5.0 s it lifts its neck to the lowest branch; 5.0–7.0 s (the key) it grips the tip of the branch, strips the leafy
// shoots off by pulling its head back (the branch springs back, needles fall) and works them in with three cropping bites (sauropods did not chew); 7.0–8.2 s a swallow goes down its neck.
// From 3.6 s, further back, a diplodocus walks slowly to the left, sweeping its head low over the ferns, each step raising a little dust. 9.4–10.6 s
// (the echo): the brachiosaurus gives a soft deep rumble and looks down; the diplodocus lifts its head and answers with a slow swish of
// its whip tail. 10.6–12.6 s the brachiosaurus raises its neck high into the crown and browses there (the camera drifts up with it).
// .058 screen units per metre on the brachiosaurus's plane (about 20 m long, 13.5 m with its neck raised), .032 on the diplodocus's. ----
const float BS=.058;const vec2 BO=vec2(-.44,-.17);   // the brachiosaurus: scale, and the ground under its hip (screen)
const float DS=.032;const float DY=-.07;              // the diplodocus, further back: scale, and its ground (screen)
const vec2 TRF=vec2(.40,-.05);                        // the foot of the araucaria (screen), between them in depth
const vec2 MO_SUN=vec2(-1.10,.62);                    // the sun, out of the picture on the left
const vec2 BR_N0=vec2(5.40,6.10);                     // the base of the brachiosaurus's neck (body frame, metres: x forward, y up)
const float BR_HK=1.25;                               // its head a little larger than life, so that it reads at this size
const float BR_SN=.80;                                // the tip of its snout in the head frame
const vec2 BR_TIP=vec2(.175,.492);                    // the tip of the branch it strips (screen, at rest)
const float DP_HK=1.45;
const vec2 DP_FT[4]=vec2[](vec2(.20,0.),vec2(3.85,0.),vec2(-.40,0.),vec2(3.30,0.)); // the diplodocus's feet at the start: near hind, near fore, far hind, far fore
const float DP_ST[4]=float[](3.6,4.25,4.9,5.55);      // the start of each foot's first step; the second comes 2.6 s later
const float DP_SL=1.6;                                // its step (metres)
// ---- Shared ----
float brTube(vec2 pos,vec2 A,vec2 B,vec2 C,float ra,float rb,out float tt){B+=vec2(1e-4,-1e-4);
 vec2 a=B-A,b=A-2.*B+C,c=a*2.,d=A-pos;float kk=1./dot(b,b),kx=kk*dot(a,b),ky=kk*(2.*dot(a,a)+dot(d,b))/3.,kz=kk*dot(d,a);
 float p=ky-kx*kx,p3=p*p*p,q=kx*(2.*kx*kx-3.*ky)+kz,h=q*q+4.*p3,res;
 if(h>=0.){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.;vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));tt=sat(uv.x+uv.y-kx);vec2 e=d+(c+b*tt)*tt;res=dot(e,e);}
 else{float z=sqrt(-p),v=acos(q/(p*z*2.))/3.,m=cos(v),n=sin(v)*1.732050808;vec3 t3=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);
  vec2 e1=d+(c+b*t3.x)*t3.x,e2=d+(c+b*t3.y)*t3.y;float r1=dot(e1,e1),r2=dot(e2,e2);if(r1<r2){res=r1;tt=t3.x;}else{res=r2;tt=t3.y;}}
 return sqrt(res)-mix(ra,rb,tt);}
vec2 brBez(vec2 a,vec2 b,vec2 c,float u){return mix(mix(a,b,u),mix(b,c,u),u);}
vec2 brDir(float a){return vec2(cos(a),sin(a));}

// ---- The branch it strips: pulled towards it while it strips, then springing back (a damped swing), its outer shoots gone ----
vec2 brBend(float t){vec2 pull=vec2(-.034,-.013);float s=ss(5.45,5.95,t);float a=t-5.95;
 vec2 b=pull*s*(1.-step(5.95,t));if(a>0.)b=pull*exp(-2.6*a)*cos(TAU*1.25*a);
 return b+vec2(.0025*sin(t*.9),.0015*sin(t*1.3+1.));}
float brStripped(float t){return ss(5.80,5.98,t);}

// ---- The brachiosaurus's pose at the clock t ----
float brBr,brJaw,brRum,brSwP,brSwA,brHA,brLf;vec2 brC,brE,brTC,brTE;
void brPose(float t){
 brBr=sin(t*.75);
 vec2 tipB=(BR_TIP+brBend(t)-BO)/BS;     // the branch's tip in its frame
 // rest: the neck forward, the head a little down, looking about
 vec2 E=vec2(9.20,10.30)+vec2(.10*sin(t*.41),.08*sin(t*.53+1.)+.05*brBr);float HA=-.62+.06*sin(t*.37);
 // 3.6–5.0 up to the branch, the mouth just before its tip; 4.9–5.35 it takes the tip in its mouth; 5.45–5.95 it pulls back, stripping
 float aR=.06;vec2 Ea=tipB-brDir(aR)*(BR_SN*BR_HK+.30),Eg=tipB-brDir(aR-.05*ss(5.45,5.95,t))*BR_SN*BR_HK;
 float uA=ss(3.6,5.0,t),uG=ss(4.95,5.35,t);E=mix(E,mix(Ea,Eg,uG),uA);HA=mix(HA,aR-.05*ss(5.45,5.95,t),uA);
 // the shoots tear off: it draws its head back and down a little, and crops them in (6.0–7.0)
 float uC=ss(5.95,6.55,t);E=mix(E,vec2(9.65,10.85)+vec2(0.,.04)*sin(t*.6),uC);HA=mix(HA,-.16,uC);
 // 8.2–9.4 it rests; 9.4–10.6 it rumbles and looks down towards the diplodocus
 float uR=ss(8.0,9.2,t),uL=ss(9.45,10.0,t)*(1.-ss(10.5,11.0,t));E=mix(E,vec2(9.45,10.75)+vec2(.06,.04)*sin(t*.45),uR);HA=mix(HA,-.28,uR);
 E=mix(E,vec2(9.75,10.45),uL);HA=mix(HA,-.62,uL);
 // 10.6–12.6 up into the crown, and it browses there
 float uH=ss(10.6,12.6,t);E=mix(E,vec2(10.0,13.85)+vec2(.08*sin(t*.7),.06*sin(t*.9+1.)),uH);HA=mix(HA,.10+.06*sin(t*.8),uH);
 brE=E;brHA=HA;brC=vec2(6.70,9.20)+(E-vec2(9.2,10.3))*.35;
 // the jaw: sauropods did not chew; it works the shoots in with three cropping bites (6.05, 6.45, 6.85) and swallows them whole;
 // in the crown it crops a shoot about once a second (from 12.6)
 brJaw=0.;for(int k=0;k<3;k++){float tk=6.05+.40*float(k);brJaw+=.75*ss(tk-.12,tk,t)*ss(tk+.22,tk+.08,t);}
 brJaw+=(.5-.5*cos(TAU*1.1*(t-12.6)))*ss(12.6,12.9,t)*.5;
 brLf=ss(5.92,6.02,t)*(1.-.30*ss(6.05,6.20,t)-.30*ss(6.45,6.60,t)-.40*ss(6.85,7.0,t));
 // the swallow: a bulge goes down the neck from the head to the chest (7.0–8.2); the rumble swells the throat (9.4–10.6)
 brSwA=ss(6.95,7.15,t)*ss(8.35,8.05,t);brSwP=1.-ss(7.0,8.2,t);
 brRum=ss(9.4,9.75,t)*ss(10.65,10.05,t);
 brTC=vec2(-3.30,4.40+.10*sin(t*.45));brTE=vec2(-5.70+.20*sin(t*.31),2.70+.25*sin(t*.45-.9));
}
// the head frame: x along the snout from the back of the skull, y up
vec2 brHeadF(vec2 b,out vec2 hf,out vec2 hu){hf=brDir(brHA);hu=vec2(-hf.y,hf.x);vec2 p=b-brE;return vec2(dot(p,hf),dot(p,hu))/BR_HK;}
// A brachiosaur head (after the Felch Quarry skull referred to Brachiosaurus, and Giraffatitan): a rounded braincase, a raised arch over
// the nose before the eyes, a broad muzzle, the lower jaw (it drops a little as it bites).
float brHeadD(vec2 h){float cr=sdEll(h-vec2(.16,.03),vec2(.20,.19));float ar=sdEll(h-vec2(.35,.16),vec2(.17,.115));
 float mz=sdBox(h-vec2(.55,.0),vec2(.19,.07))-.055;vec2 hj=rot(.16*brJaw)*(h-vec2(.10,-.06))+vec2(.10,-.06);float jw=sdCap(hj,vec2(.06,-.11),vec2(.72,-.085),.085,.062);
 return smin(smin(smin(cr,ar,.08),mz,.07),jw,.05);}
// its legs (body frame): pillars; i 0 near hind, 1 near fore, 2 far hind, 3 far fore
void brLegJ(int i,out vec2 tp,out vec2 j1,out vec2 j2,out vec2 f){
 if(i==0){tp=vec2(.05,3.95);j1=vec2(.32,2.05);j2=vec2(.0,.55);f=vec2(.12,0.);}
 else if(i==1){tp=vec2(5.15,5.45);j1=vec2(4.98,3.30);j2=vec2(5.25,1.00);f=vec2(5.28,0.);}
 else if(i==2){tp=vec2(-.30,4.00);j1=vec2(-.15,2.10);j2=vec2(-.55,.55);f=vec2(-.45,0.);}
 else{tp=vec2(4.70,5.50);j1=vec2(4.55,3.35);j2=vec2(4.70,1.00);f=vec2(4.68,0.);}}
float brLegD(vec2 b,int i){vec2 tp,j1,j2,f;brLegJ(i,tp,j1,j2,f);if(abs(b.x-j1.x)>2.2||b.y>tp.y+1.2)return 1e5;
 if(i==1||i==3){float d=sdCap(b,tp,j1,.82,.58);d=smin(d,sdCap(b,j1,j2,.56,.45),.22);d=smin(d,sdCap(b,j2,f+vec2(0.,.22),.45,.52),.12);
  return smin(d,sdEll(b-f-vec2(.02,.18),vec2(.58,.20)),.10);}
 float d=sdEll(rot(.12)*(b-mix(tp,j1,.45)),vec2(1.05,1.45));d=smin(d,sdCap(b,j1,j2,.64,.48),.28);d=smin(d,sdCap(b,j2,f+vec2(-.05,.18),.48,.46),.12);
 return smin(d,sdEll(b-f-vec2(.05,.17),vec2(.68,.20)),.10);}
float brTrunk(vec2 b){float m=sdEll(rot(.18)*(b-vec2(2.45,4.15)),vec2(3.45,1.75+.04*brBr));float c=sdEll(b-vec2(4.65,4.55),vec2(1.40,1.85+.04*brBr));
 float h=sdEll(b-vec2(.0,4.05),vec2(1.25,1.05));return smin(smin(m,c,.8),h,.7);}
// The bones (body frame, metres): the skull, the vertebrae of the neck with their long cervical ribs, the back, the ribs, the shoulder
// blade, the pelvis, the near legs, the tail with its chevrons.
float brBones(vec2 b){float d=1e5,tt;
 if(length(b-brE)<1.6){vec2 hf,hu;vec2 h=brHeadF(b,hf,hu);float sk=brHeadD(h)+.02;
  sk=max(sk,-sdEll(h-vec2(.22,.10),vec2(.07,.065)));sk=max(sk,-sdEll(h-vec2(.40,.17),vec2(.10,.06)));sk=max(sk,-sdEll(h-vec2(.52,.03),vec2(.12,.035)));
  sk=max(sk,.008-abs(h.y+.06));d=min(d,sk*BR_HK);}
 vec2 lo=min(min(BR_N0,brC),brE)-.6,hi=max(max(BR_N0,brC),brE)+.6;
 if(b.x>lo.x&&b.y>lo.y&&b.x<hi.x&&b.y<hi.y){for(int i=0;i<12;i++){float u=(float(i)+.5)/12.;vec2 p=brBez(BR_N0,brC,brE,u),p2=brBez(BR_N0,brC,brE,u+.06);
   d=min(d,sdCap(b,p,p2,mix(.30,.12,u),mix(.27,.11,u)));
   vec2 tg=normalize(p2-p);d=min(d,sdSeg(b,p-tg*.1-vec2(-tg.y,tg.x)*.18,p-tg*1.2-vec2(-tg.y,tg.x)*.22)-.035);}}
 if(b.y>3.6&&b.x>-1.2&&b.x<6.2){d=min(d,sdCap(b,vec2(-.7,4.55),BR_N0+vec2(-.2,-.1),.22,.25));
  for(int i=0;i<10;i++){float x=-.5+float(i)*.58;vec2 p=mix(vec2(-.7,4.55),BR_N0,(x+.7)/6.0);if(abs(b.x-x)>.5)continue;d=min(d,sdSeg(b,p,p+vec2(.05,.45))-.08);}}
 if(b.x>.4&&b.x<5.4&&b.y>2.4&&b.y<5.8)for(int i=0;i<8;i++){float x=.8+float(i)*.55;if(abs(b.x-x-.3)>1.0)continue;vec2 a=vec2(x,4.55+.17*float(i)),c=vec2(x+.45,2.85+.05*float(i));d=min(d,brTube(b,a,vec2(x+1.0,3.9+.1*float(i)),c,.09,.07,tt));}
 if(b.x>3.9&&b.x<5.8&&b.y>3.6)d=min(d,sdEll(rot(-1.15)*(b-vec2(4.75,4.75)),vec2(1.15,.28)));
 if(b.x>-1.5&&b.x<1.6&&b.y>2.6&&b.y<5.0){d=min(d,sdEll(b-vec2(.05,4.35),vec2(1.10,.40)));d=min(d,sdCap(b,vec2(.25,3.95),vec2(.95,2.80),.15,.20));d=min(d,sdCap(b,vec2(-.20,3.95),vec2(-.95,3.05),.14,.10));}
 for(int k=0;k<2;k++){vec2 tp,j1,j2,f;brLegJ(k,tp,j1,j2,f);if(abs(b.x-j1.x)>1.4)continue;
  d=min(d,sdCap(b,tp,j1,.26,.20));d=min(d,length(b-j1)-.24);d=min(d,sdCap(b,j1,j2,.18,.15));d=min(d,sdBox(b-mix(j2,f+vec2(0.,.12),.5),vec2(.24,length(j2-f)*.5))-.04);}
 if(b.x<.0){d=min(d,brTube(b,vec2(-.7,4.45),brTC,brTE,.20,.05,tt));
  for(int i=0;i<9;i++){float u=.08+float(i)*.10;vec2 p=brBez(vec2(-.7,4.45),brTC,brTE,u);if(length(b-p)>1.2)continue;d=min(d,min(sdSeg(b,p,p+vec2(-.1,.42*(1.-u))),sdSeg(b,p,p+vec2(-.2,-.50*(1.-u))))-.05);}}
 return d;}

// ---- The brachiosaurus ----
// Skin: small polygonal scales; countershaded (a warm grey-brown above, pale buff below), soft darker blotches; the lower legs dusty.
void brAnimal(vec2 q,float t,float grow){
 vec2 b=(q-BO)/BS;if(b.x<-7.2||b.x>12.6||b.y<-.6||b.y>15.4)return;
 bool needB=grow<.12;float dB=needB?brBones(b)*BS:-1.;
 if(needB&&grow<.5)PIECE(dB,vec3(.88,.84,.75),K_BONE,b*.2,vec2(1,0),.010,.8,0.);
 vec3 back=vec3(.42,.39,.35),belly=vec3(.70,.64,.54),dust=vec3(.66,.55,.42);
 vec2 uS=b*(5.5+3.5*ss(6.5,10.,b.y)*ss(4.,6.5,b.x));float uLo=ss(.55,.18,length(fwidth(uS)));
 // the far legs, in the shade of the body
 for(int i=2;i<4;i++){float dl=brLegD(b,i)*BS;if(dl>.03)continue;if(needB)dl=max(dl,dB-grow);
  vec3 la=mix(mix(belly,back,ss(.5,3.,b.y)),dust,ss(1.2,.2,b.y)*.5)*.50;PIECE(dl,la,K_SCALE,uS+7.,vec2(1,0),.04,1.,0.);}
 // the body: trunk, tail, neck, throat, head and the near legs as one
 float tn=0.,tt=0.;float dTr=brTrunk(b);
 vec2 nlo=min(min(BR_N0,brC),brE)-1.3,nhi=max(max(BR_N0,brC),brE)+1.3;
 float dNk=(b.x>nlo.x&&b.y>nlo.y&&b.x<nhi.x&&b.y<nhi.y)?brTube(b,BR_N0,brC,brE,1.02,.33,tn):1e5;
 dNk-=.17*brSwA*exp(-pow((tn-brSwP)/.05,2.))*step(dNk,1.);                    // the swallow going down
 float dTh=sdEll(b-vec2(5.70,5.15)-vec2(.15,-.08)*brRum,vec2(.85+.18*brRum,.80+.26*brRum));      // the throat at the base of the neck
 float dTl=b.x<1.2?brTube(b,vec2(-.70,4.45),brTC,brTE,1.10,.12,tt):1e5;
 vec2 hf,hu;vec2 h=brHeadF(b,hf,hu);float dHd=length(b-brE)<1.9?brHeadD(h)*BR_HK:1e5;
 float dBody=smin(dTr,dTl,.6);dBody=smin(dBody,dNk,.6);dBody=smin(dBody,dTh,.35);dBody=smin(dBody,dHd,.14);
 float dL0=brLegD(b,0),dL1=brLegD(b,1);float dNear=min(dL0,dL1);
 float d=smin(dBody,dNear,.22);float dq=d*BS;if(needB)dq=max(dq,dB-grow);
 if(dq<PX*4.){
  // countershading from each part's own axis (smooth: +1 on its upper side, -1 underneath)
  float dm=min(min(dTr,dTl),min(dNk,dHd));
  float wTr=exp(-3.*(dTr-dm)),wTl=exp(-3.*(dTl-dm)),wNk=exp(-3.*(dNk-dm)),wHd=exp(-4.*(dHd-dm));float ws=wTr+wTl+wNk+wHd;
  vec2 tg=normalize(mix(brC-BR_N0,brE-brC,tn));vec2 dn=vec2(-tg.y,tg.x);
  vec2 vN=b-brBez(BR_N0,brC,brE,tn),vT=b-brBez(vec2(-.70,4.45),brTC,brTE,tt);
  float side=(wTr*clamp((b.y-4.15-.20*(b.x-2.5))/1.45,-1.,1.)+wTl*vT.y/max(length(vT),.3)+wNk*dot(vN,dn)/max(length(vN),.35)+wHd*clamp(h.y/.2,-1.,1.))/ws;
  vec3 alb=mix(belly,back,ss(-.55,.45,side));
  alb*=mix(.64,1.,ss(-.90,-.10,side));                                       // the underside turns away from the light
  alb*=1.-.13*ss(.52,.74,fbm(b*vec2(.55,.75)+3.))*ss(-.3,.4,side);            // soft darker blotches
  alb*=.94+.10*fbm(b*1.6);
  alb=mix(alb,alb*vec3(1.06,.98,.92),ss(1.5,.0,dHd)*.6);                       // a warmer face
  {vec2 sid;vec3 sv=voro(uS,sid);alb*=mix(1.,1./mix(.66,1.,ss(.0,.14,sv.y-sv.x)),.55*uLo)*mix(1.,1./(.78+.34*h21(sid)),.45*uLo);}  // softer scale borders
  // the legs: lighter on the front, dusty low down
  float wl=ss(.06,-.06,dNear);vec3 la=mix(belly,back,ss(.4,4.,b.y));la=mix(la,dust,ss(1.4,.15,b.y)*.55);alb=mix(alb,la,wl*.85);
  // the direction of the surface for the light, from each part's own axis
  vec2 hg=(h-vec2(.40,.02))/vec2(.24,.10);vec2 nH=hf*hg.x+hu*hg.y;
  vec2 gB=wTr*normalize((b-vec2(2.6,4.3))/vec2(10.,2.6))+wTl*vT/max(length(vT),1e-4)+wNk*vN/max(length(vN),1e-4)+wHd*nH/max(length(nH),1e-4);
  vec2 gL=vec2(0.,1.);{float best=1e5;for(int i=0;i<2;i++){vec2 P0,P1,P2,P3;brLegJ(i,P0,P1,P2,P3);P3+=vec2(0.,.2);
    for(int k=0;k<3;k++){vec2 a=k==0?P0:k==1?P1:P2,c=k==0?P1:k==1?P2:P3;float u=segU(b,a,c);vec2 v=b-mix(a,c,u);float l=length(v);if(l<best){best=l;gL=v;}}}
    gL=mix(vec2(-.35,1.),gL/max(best,1e-4),ss(.0,.40,best));}
  float lin=ss(.05,-.12,dNear);vec2 gA=mix(gB/max(length(gB),1e-4),gL/max(length(gL),1e-4),lin);
  piece(dq,gA,alb,K_SCALE,uS,vec2(1,0),.13,1.,0.);
  if(grow>.3){
   // the warm rim of the low sun along its edges on the left, and warm light bounced from the dry ground under the belly
   vec2 nd=gA/max(length(gA),1e-4);float band=ss(-.010,-.003,dq)*ss(.0,-.0020,dq);
   float rw=sat(dot(nd,vec2(-.85,.53)));glow(vec3(1.0,.74,.46)*band*rw*rw*.30,0.);
   float bw=sat(-nd.y)*ss(-.030,-.004,dq)*ss(.0,-.0022,dq)*(1.-lin*.5);glow(vec3(.12,.08,.04)*bw,0.);
   // soft folds: at the base of the neck, behind the shoulder, behind the elbow, in front of the thigh
   {float f1=abs(length((b-vec2(4.70,4.40))/vec2(1.45,1.9))-1.);float m1=ss(.0,.5,dot(normalize(b-vec2(4.7,4.4)),vec2(-.8,.2)));
    float f2=abs(length(b-vec2(4.98,3.30))-.50);float m2=ss(.2,.7,dot(normalize(b-vec2(4.98,3.30)),vec2(-.9,.2)));
    float f3=abs(length((b-vec2(.30,3.30))/vec2(1.2,1.4))-1.);float m3=ss(.0,.6,dot(normalize(b-vec2(.30,3.30)),vec2(.85,.3)));
    float fl=max(max(ss(.07,.0,f1)*m1,ss(.06,.0,f2)*m2*.8),ss(.07,.0,f3)*m3)*ss(.0,-.1,d)*(1.-wNk*.7);
    shadow(fl*.16,vec3(.55,.47,.42),0.);}
   if(dNk<.0&&tn<.22){float fo=1e5;for(int i=0;i<3;i++)fo=min(fo,abs(tn-.06-.05*float(i)));shadow(ss(.010,.0,fo)*ss(.0,-.15,dNk)*ss(.3,-.6,dot(vN,dn))*.25,vec3(.55,.48,.42),0.);}
   // the near legs stand in front of the body: a soft shade on the body along their edge
   shadow(ss(.0,.08,dNear)*ss(.40,.08,dNear)*ss(.0,-.15,dBody)*.30,vec3(.55,.47,.42),0.);
   // the face: the mouth (it opens a little as it bites), the nostril low on the muzzle, the eye
   if(dHd<.5){
    vec2 hj=rot(.16*brJaw)*(h-vec2(.10,-.06))+vec2(.10,-.06);float my=-.040;
    float ml=max(h.y-my-.004,my-.004-(hj.y+.008*(1.-brJaw)))-.002;ml=max(ml,max(.12-h.x,h.x-.80));ml=min(ml,max(abs(h.y-my)-.007,max(.14-h.x,h.x-.79)));
    PIECE(ml*BS*BR_HK,mix(back*.30,vec3(.22,.10,.09),brJaw),K_SKIN,h,vec2(1,0),.001,0.,0.);
    PIECE(sdEll(h-vec2(.70,.055),vec2(.035,.020))*BS*BR_HK,vec3(.12,.10,.09),K_SKIN,h,vec2(1,0),.001,0.,0.);
    vec2 ec=BO+(brE+(hf*.22+hu*.10)*BR_HK)*BS;
    shadow(ss(.012,.0,length(q-ec-vec2(0.,.0015)))*.28,vec3(.5,.42,.38),0.);
    eyeA(q,ec,.0052,vec3(.45,.30,.13),back*1.08,blinkAt(t,.47),0.);}
  }
 }
 // shoots of the branch hanging from its mouth while it works them in
 if(brLf>.01&&length(b-brE)<2.){float ds=1e5;for(int i=0;i<5;i++){float fi=float(i);vec2 a=vec2(.76,-.03-.012*fi),c=a+vec2(.10+.08*h11(fi*3.1),-.14-.10*h11(fi*1.7))*brLf;
   ds=min(ds,sdSeg(h,a,c)-.010);}
  PIECE(ds*BS*BR_HK,vec3(.20,.30,.14),K_PLANT,h*40.,vec2(1,0),.001,.5,0.);}
}

// ---- The diplodocus (further back): long and low, the neck held out, the tail a long whip ----
float dpOX,dpBob,dpHA;vec2 dpC,dpE,dpTC,dpTE,dpWC,dpWE;vec2 dpFB[4];float dpLift[4];
float dpWalk(float t){return 2.*DP_SL*ss(3.6,9.05,t);}
float dpHipX(float t){return .62-dpWalk(t)*DS;}
void dpPose(float t){
 dpOX=dpWalk(t);float lifts=0.;
 for(int i=0;i<4;i++){float n=0.,lf=0.;for(int k=0;k<2;k++){float u=sat((t-DP_ST[i]-2.6*float(k))/.9);n+=u*u*(3.-2.*u);lf+=sin(PI*u);}
  dpFB[i]=vec2(DP_FT[i].x+DP_SL*n-dpOX,.35*lf);dpLift[i]=lf;lifts+=lf;}
 dpBob=-.05*lifts+.03*sin(t*.8);
 // the head sweeps low over the ferns from side to side (seen from the side: forward and back, a little up and down)
 float sw=sin(t*.52);vec2 E=vec2(9.30+.45*sw,1.05+.20*sin(t*.52+1.3));float HA=-1.05+.18*sw;
 // 9.4–10.6 it lifts its head and swishes its tail
 float uU=ss(9.3,9.8,t)*(1.-ss(10.8,11.6,t));E=mix(E,vec2(8.9,2.6),uU);HA=mix(HA,-.45,uU);
 dpE=E;dpHA=HA;dpC=vec2(7.0,3.35)+(E-vec2(9.3,1.05))*.30;
 // the tail: a thick base held up, then the long whip; it sways slowly, and at 9.6–10.8 the whip swings round towards us and back
 float s=sin(PI*ss(9.55,10.75,t)),s2=sin(PI*ss(9.75,10.95,t));
 dpTC=vec2(-4.2,4.45+.10*sin(t*.5));dpTE=vec2(-7.4,3.05+.15*sin(t*.5-.8))+vec2(.5,-.4)*s;
 dpWC=vec2(-9.9,2.05+.20*sin(t*.5-1.5))+vec2(1.6,-1.1)*s2;dpWE=vec2(-11.0+.3*sin(t*.37),1.25+.25*sin(t*.5-2.2))+vec2(3.4,-.8)*s2;
}
// the legs (body frame: x forward, which is to the left on the screen): i 0 near hind, 1 near fore, 2 far hind, 3 far fore
void dpLegJ(int i,out vec2 tp,out vec2 j1,out vec2 f){vec2 T[4]=vec2[](vec2(0.,3.35),vec2(3.75,2.95),vec2(-.25,3.40),vec2(3.55,3.00));
 tp=T[i];f=dpFB[i]+vec2(0.,.15);bool hind=i==0||i==2;j1=knee(tp,f,hind?1.75:1.45,hind?1.55:1.40,hind?1.:-1.);}
float dpLegD(vec2 b,int i){vec2 tp,j1,f;dpLegJ(i,tp,j1,f);if(abs(b.x-j1.x)>1.6||b.y>tp.y+.9)return 1e5;
 float d=sdCap(b,tp,j1,.55,.38);d=smin(d,sdCap(b,j1,f,.36,.30),.15);return smin(d,sdEll(b-f+vec2(0.,.02),vec2(.40,.16)),.08);}
float dpTrunk(vec2 b){float m=sdEll(rot(-.10)*(b-vec2(1.85,3.05)),vec2(2.60,1.32));float hp=sdEll(b-vec2(-.05,3.50),vec2(1.05,.98));float ch=sdEll(b-vec2(3.45,2.85),vec2(.95,1.0));
 return smin(smin(m,hp,.6),ch,.6);}
// the head: long and low, the muzzle square, the nostrils high between the eyes
float dpHeadD(vec2 h){float cr=sdEll(h-vec2(.12,.03),vec2(.15,.12));float mz=sdBox(h-vec2(.36,-.01),vec2(.18,.048))-.035;float jw=sdCap(h,vec2(.05,-.07),vec2(.55,-.06),.05,.042);
 return smin(smin(cr,mz,.06),jw,.03);}
void dpAnimal(vec2 q,float t){
 float hx=dpHipX(t);vec2 b=vec2(-(q.x-hx)/DS,(q.y-DY)/DS-dpBob);if(b.x<-14.5||b.x>11.5||b.y<-.6||b.y>6.)return;
 vec3 back=vec3(.45,.35,.28),belly=vec3(.74,.65,.53);vec3 haze=vec3(.84,.78,.68);
 vec2 uS=b*9.;
 for(int i=2;i<4;i++){float dl=dpLegD(b,i)*DS;if(dl>.02)continue;PIECE(dl,mix(mix(belly,back,.6)*.50,haze,.16),K_SCALE,uS+5.,vec2(1,0),.02,1.,0.);}
 float tn=0.,tt=0.,tw=0.;float dTr=dpTrunk(b);
 float dNk=b.x>3.&&b.y<5.?brTube(b,vec2(4.2,3.15),dpC,dpE,.80,.25,tn):1e5;
 float dTl=b.x<.6&&b.x>-9.5?brTube(b,vec2(-.8,3.85),dpTC,dpTE,.88,.21,tt):1e5;
 float dW=1e5;if(b.x<-7.){float ax=brTube(b,dpTE,dpWC,dpWE,0.,0.,tw);dW=(ax*DS-max(mix(.21,.03,tw)*DS,PX*.65))/DS;} // the whip keeps a hair's width
 vec2 hf=brDir(dpHA),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(b-dpE,hf),dot(b-dpE,hu))/DP_HK;float dHd=length(b-dpE)<1.5?dpHeadD(h)*DP_HK:1e5;
 float dBody=smin(smin(dTr,dTl,.5),dNk,.45);dBody=smin(dBody,dHd,.10);dBody=min(dBody,dW);
 float dNear=min(dpLegD(b,0),dpLegD(b,1));float d=smin(dBody,dNear,.18);float dq=d*DS;
 if(dq<PX*4.){
  float dm=min(min(dTr,dTl),min(dNk,dHd));
  float wTr=exp(-3.*(dTr-dm)),wTl=exp(-3.*(dTl-dm)),wNk=exp(-3.*(dNk-dm)),wHd=exp(-4.*(dHd-dm));float ws=wTr+wTl+wNk+wHd+1e-4;
  vec2 vN=b-brBez(vec2(4.2,3.15),dpC,dpE,tn),vT=b-brBez(vec2(-.8,3.85),dpTC,dpTE,tt);
  float side=(wTr*clamp((b.y-3.05)/1.1,-1.,1.)+wTl*vT.y/max(length(vT),.3)+wNk*vN.y/max(length(vN),.3)+wHd*clamp(h.y/.1,-1.,1.))/ws;
  vec3 alb=mix(belly,back,ss(-.55,.45,side))*mix(.64,1.,ss(-.9,-.1,side));
  alb*=1.-.20*ss(.45,.85,sin(b.x*1.7+.6*fbm(b*.8))*.5+.5)*ss(-.2,.5,side)*ss(5.5,3.5,b.x);   // dark bands across the back and the tail
  alb=mix(alb,mix(belly,back,ss(.3,2.8,b.y))*vec3(.98,.93,.86),ss(.06,-.06,dNear)*.8);
  alb=mix(alb,haze,.20);
  vec2 g=vec2(-1.,1.)*(wTr*normalize((b-vec2(1.85,3.1))/vec2(6.5,1.2))+wTl*vT/max(length(vT),1e-4)+wNk*vN/max(length(vN),1e-4)+wHd*normalize(h-vec2(.3,0.)+1e-4))/ws;
  piece(dq,g,alb,K_SCALE,uS,vec2(1,0),.05,1.,0.);
  vec2 nd=normalize(g+1e-5);float band=ss(-.010,-.003,dq)*ss(.0,-.0016,dq);glow(vec3(1.,.72,.42)*band*sat(dot(nd,vec2(-.85,.53)))*.35,0.);
  if(dHd<.3){vec2 ec=vec2(hx,DY+dpBob*DS)+vec2(-1.,1.)*(dpE+(hf*.17+hu*.07)*DP_HK)*DS;eyeA(q,ec,.0028,vec3(.40,.28,.12),back,blinkAt(t,.71),0.);}
 }
}

// ---- The backdrop: a warm late-afternoon sky, far mesas in the haze, the fern savanna with scattered araucarias ----
vec3 moSkyCol(vec2 q){float ds=length((q-MO_SUN)*vec2(1.,1.3));vec3 c=mix(vec3(.98,.86,.66),vec3(.50,.64,.84),ss(.0,.95,q.y));
 return mix(c,vec3(1.,.90,.70),ss(1.3,.2,ds)*.55);}
// a far araucaria or conifer (l: from its foot, h: its height): an umbrella crown on a bare trunk, or a narrow cone
float moFarTree(vec2 l,float h,float tp,float sd){
 if(tp<.55){float tr=max(abs(l.x)-h*.018,max(-l.y,l.y-h*.8));vec2 c=l-vec2(0.,h*.84);float cr=sdEll(c,vec2(h*.30,h*.13))+h*.03*(fbm2(l*22./h+sd)-.5);
  cr=min(cr,sdEll(c-vec2(h*.04,h*.10),vec2(h*.17,h*.08)));return min(tr,cr);}
 float y=l.y/h;float w=h*.16*(1.-y)*(.5+.5*sat(y*5.))*(.75+.5*vn(vec2(l.y*200./h,sd)));return min(max(abs(l.x)-w,max(-l.y+h*.08,l.y-h)),max(abs(l.x)-h*.012,max(-l.y,l.y-h*.2)));}
void moTrees(vec2 q,float fr,float hgt,float seed,float base,vec3 col,float dens){
 float x=q.x*fr+seed,ci=floor(x);float dm=1e5,hm=0.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);if(h11(cj*5.3+seed)>dens)continue;float cx=(cj+.5+(h11(cj*1.7)-.5)*.6-seed)/fr;
  float hh=hgt*(.6+.6*h11(cj+seed));float dd=moFarTree(q-vec2(cx,base),hh,h11(cj*3.1+seed),cj);if(dd<dm){dm=dd;hm=h11(cj*7.7);}}
 if(dm>.01)return;PIECE(dm,col*(.90+.20*hm),K_FAR,q*3.+seed,vec2(1,0),.010,.08,1.);}
// the ground: dry ochre soil with patches of low ferns, hazier and bluer into the distance
const float MO_HZ=.045;   // the far edge of the plain
float moPatch(vec2 q){float dz=MO_HZ-q.y;float Z=1./(dz+.02);return fbm2(vec2(q.x*Z*.9,Z*1.6)*vec2(.55,.35)+3.);}
vec3 moGroundCol(vec2 q){float dz=MO_HZ-q.y;float Z=1./(dz+.02);vec2 p=vec2(q.x*Z*.9,Z*1.6);
 float fp=moPatch(q);float f2=vn(p*vec2(2.2,1.5)),f3=vn(p*vec2(9.,5.));
 vec3 soil=mix(vec3(.76,.63,.47),vec3(.66,.53,.40),f2)*(.94+.10*f3),fern=mix(vec3(.28,.32,.17),vec3(.40,.41,.22),f2)*(.72+.45*vn(p*vec2(26.,7.)));
 vec3 c=mix(soil,fern,ss(.44,.58,fp)*.92);
 return mix(c,vec3(.80,.76,.70),ss(.25,.0,dz)*.75);}
void moBackdrop(vec2 q,float t){
 PIECE(-1.,moSkyCol(q),K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
 // high thin streaks of cloud, lit warm from below on the left
 float cl=fbm(vec2(q.x*1.1+t*.004,q.y*9.+2.))*ss(.25,.45,q.y)*ss(1.3,.6,q.y);veil(mix(vec3(1.,.90,.76),vec3(.90,.90,.94),ss(-.6,.6,q.x)),ss(.56,.78,cl)*.55,1.);
 if(q.y>.30)return;
 // far mesas, flat-topped, in the haze
 float mt=MO_HZ+.035+.030*ss(.45,.55,fbm(vec2(q.x*1.6,1.)))+.010*fbm(vec2(q.x*9.,3.));
 if(q.y<mt+.004)PIECE(q.y-mt,mix(vec3(.66,.66,.74),vec3(.80,.76,.74),ss(MO_HZ,mt,q.y)),K_FAR,q*vec2(2.,9.),vec2(1,0),.01,.0,1.);
 if(q.y<MO_HZ+.004)PIECE(q.y-MO_HZ,moGroundCol(q),K_FAR,q*vec2(2.,12.),vec2(1,0),.01,.0,1.);
 // scattered far trees on the plain
 if(q.y<.20&&q.y>MO_HZ-.02)moTrees(q,7.,.11,3.,MO_HZ-.004,vec3(.56,.62,.60),.42);
 if(q.y<.26&&q.y>MO_HZ-.04)moTrees(q,3.2,.19,8.,MO_HZ-.016,vec3(.44,.50,.44),.30);
 // a warm haze low over the plain, thicker towards the sun
 veil(vec3(.98,.90,.76),ss(.12,-.02,q.y)*ss(-.15,.05,q.y)*(.22+.18*ss(.5,-.9,q.x)),1.);
}
// a fern (decor): fronds with comb-like leaflets from b0, of length sc; sd varies its shape, colour and number of fronds
void moFern(vec2 q,vec2 b0,float sc,float t,float sd){if(abs(q.x-b0.x)>sc*1.15||q.y<b0.y-.01||q.y>b0.y+sc*1.05)return;float dd=1e5;vec2 fu0=vec2(0.);
 float tilt=(h11(sd*1.9)-.5)*.7;vec3 fcol=mix(mix(vec3(.30,.40,.18),vec3(.42,.44,.20),h11(sd*2.7)),vec3(.52,.46,.26),ss(.75,.95,h11(sd*4.1)));int nf=4+int(h11(sd)*4.);
 float spread=.65+.35*h11(sd*5.3),droop=.20+.25*h11(sd*6.1);
 for(int i=0;i<8;i++){if(i>=nf)break;float fi=float(i);float ang=tilt-1.0*spread+fi*2.0*spread/float(nf-1)+.035*sin(t*.7+fi+sd);vec2 l=rot(ang)*(q-b0);float len=sc*(.70+.35*h11(fi+sd));
  float x=l.y/len;float y=l.x-droop*sign(ang+.1)*x*x*len;float w=.28*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*(15.+5.*h11(sd*8.)));
  float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));float d=max(abs(y)-w,pin*len/18.);d=min(d,abs(y)-.0011);d=max(d,max(-l.y,l.y-len));
  if(d<dd){dd=d;fu0=vec2(x,fi);}}
 PIECE(dd,fcol*(.82+.3*h11(fu0.y+sd))*mix(.75,1.,fu0.x),K_PLANT,fu0*vec2(1.,6.),vec2(0,1),.004,.55,1.);}
// a cycad (a bennettitalean or cycad of the Morrison): a stout scaly trunk and a crown of stiff arching fronds
void moCycad(vec2 q,vec2 b0,float sc,float t,float sd){if(abs(q.x-b0.x)>sc*1.3||q.y<b0.y-.01||q.y>b0.y+sc*1.4)return;
 float tr=sdBox(q-b0-vec2(0.,sc*.22),vec2(sc*.11,sc*.22))-sc*.02;
 if(tr<.004)PIECE(tr,vec3(.42,.35,.26)*(.8+.3*ss(.4,.6,fract((q.y-b0.y)/(sc*.06)+.5*fract((q.x-b0.x)/(sc*.05))))),K_BARK,q*40.,vec2(0,1),.008,.6,1.);
 vec2 c=b0+vec2(0.,sc*.46);float dd=1e5;
 for(int i=0;i<7;i++){float fi=float(i);float an=mix(.25,PI-.25,fi/6.)+.04*sin(t*.6+fi);vec2 dir=brDir(an);float L=sc*(.75+.25*h11(fi+sd));
  vec2 e=c+dir*L+vec2(0.,-L*.35*abs(dir.x));vec2 m=c+dir*L*.55+vec2(0.,L*.12);float tt;float ax=brTube(q,c,m,e,0.,0.,tt);
  float w=sc*.07*sin(PI*sat(tt*.95+.05));float pin=abs(fract(tt*22.)-.5)-.25;float d=max(ax-w,pin*sc*.02);dd=min(dd,min(d,ax-sc*.006));}
 if(dd<.006)PIECE(dd,mix(vec3(.28,.38,.18),vec3(.36,.42,.20),h11(sd)),K_PLANT,q*30.,vec2(0,1),.004,.6,1.);}
// The araucaria (decor): its tall straight trunk, the crown of whorled branches on its upper part (each drooping and then turned up at
// its end, the dense rope-like shoots hanging along its outer part), a domed top. Its lowest branch on the left is the one the
// brachiosaurus strips: pulled, springing back, its outer shoots gone.
float moTx(float y,float t){return TRF.x+.006*sin(y*2.)+.004*sin(t*.35)*ss(.3,.9,y);}
const float AR_B=.40,AR_T=.83;
// the crown's half width at the height y: a broad dome, rounded at the top
float moCrownW(float y){float u=(y-AR_B)/(AR_T-AR_B);if(u<-.05||u>1.)return 0.;float v=(u-.40)/(u<.40?.56:.60);return .25*sqrt(sat(1.-v*v));}
void moAraucaria(vec2 q,float t){
 if(abs(q.x-TRF.x)>.32||q.y<TRF.y-.01||q.y>AR_T+.03)return;
 float tx=moTx(q.y,t);float u=sat((q.y-TRF.y)/(AR_T-TRF.y));float w=mix(.0150,.0045,u)+.010*ss(.05,.0,q.y-TRF.y);
 float dT=max(abs(q.x-tx)-w,q.y-AR_T+.04);
 // a few dead stubs low on the trunk
 for(int i=0;i<3;i++){float fi=float(i);float y0=.12+fi*.09;float sg=mod(fi,2.)<.5?-1.:1.;dT=min(dT,sdCap(q,vec2(moTx(y0,t),y0),vec2(moTx(y0,t)+sg*(.025+.01*fi),y0+.012),.0028,.0012));}
 if(dT<.004){float lt=ss(w,-w,q.x-tx);PIECE(dT,mix(vec3(.30,.24,.20),vec3(.52,.42,.33),lt*.8),K_BARK,vec2((q.x-tx)*60.,q.y*14.),vec2(0,1),w*.9,.5,1.);}
 if(q.y<.36)return;
 float n=fbm2(q*vec2(150.,120.));float nb=fbm2(q*vec2(46.,38.)+7.);
 // the branch pads: in irregular tiers, to each side and towards us (foreshortened), each a flat mass of rope-like shoots hanging
 // from a limb that rises a little and droops at its end; one union for the outline, the nearest pad for the light
 float dC=1e5,bst=1e5,dL=1e5;vec2 bl=vec2(0.,1.);float yk=AR_B+.020;
 for(int k=0;k<12;k++){float fk=float(k);float hk=h11(fk*4.7+1.3);
  if(k>0)yk+=.032+.028*hk;
  if(yk>AR_T-.035)break;
  if(abs(q.y-yk)>.07)continue;
  float W=moCrownW(yk+.012);
  for(int j=0;j<3;j++){float hs=h11(fk*7.1+float(j)*3.3+.5);if(j==1&&hs<.25)continue;
   float sg=j==0?-1.:j==2?1.:(hs-.6)*.8;
   float L=W*(j==1?.50+.25*hs:.50+.62*hs*hs+.12*h11(fk*2.3+float(j)));
   vec2 c=vec2(moTx(yk,t)+sg*L*.58,yk-.012*abs(sg)*hs);
   vec2 r=vec2(L*(j==1?.60:.50),.019+.011*hs);
   vec2 l=rot(-sg*(.08+.14*hs))*(q-c);float ax=sat(abs(l.x)/r.x);
   vec2 lq=vec2(l.x,l.y/(1.-.45*ax*ax)*(l.y<0.?.82:1.12));
   float dd=sdEll(lq,r)+.0060*(nb-.5)+.010*ss(.55,1.,ax)*(vn(vec2(q.y*90.,fk*3.+float(j)))-.45);
   dC=smin(dC,dd,.008);if(dd<bst){bst=dd;bl=lq/r;}
   dL=min(dL,sdCap(q,vec2(moTx(yk-.01,t),yk-.01),c+vec2(sg*r.x*.55,-.004),.0030*(1.-.05*fk),.0012));}}
 // the top of the dome
 {vec2 c=vec2(moTx(AR_T,t)+.004,AR_T-.040);vec2 r=vec2(.075,.038);vec2 lq=q-c;lq.y*=lq.y<0.?.85:1.;float dd=sdEll(lq,r)+.006*(nb-.5);dC=smin(dC,dd,.010);if(dd<bst){bst=dd;bl=lq/r;}}
 // the ragged edge: tufts of shoots
 dC+=.0040*(n-.5)-.0020*vn(q*vec2(320.,110.));
 float best=min(dC,dL);float isF=dC<dL?1.:0.;
 // the low branch on the left (the one it strips): clumps of shoots along its outer part
 vec2 fl=bl;float ao=0.;
 {vec2 S=vec2(moTx(.44,t),.44),E=BR_TIP+brBend(t);vec2 M=mix(S,E,.55)+vec2(0.,-.018);
  if(q.x<S.x+.02&&q.x>E.x-.04&&abs(q.y-.47)<.06){float u1=segU(q,S,M),u2=segU(q,M,E);vec2 P1=mix(S,M,u1),P2=mix(M,E,u2);bool a1=length(q-P1)<length(q-P2);float uu=a1?u1*.55:.55+u2*.45;
   float wood=length(q-(a1?P1:P2))-mix(.0040,.0014,uu);if(wood<best){best=wood;isF=0.;}
   // its shoots: a hanging mass along the outer part, ragged; stripped, only the inner part and a tuft at the tip are left
   float stp=brStripped(t);
   float hm=.0175*pow(sin(PI*ss(.22,1.04,uu)),.6)*(.85+.30*nb);hm*=mix(1.,max(ss(.66,.58,uu),.45*ss(.90,.97,uu)),stp);
   vec2 Pa=a1?P1:P2;float dy=q.y-Pa.y;
   float fol=(dy>0.?dy*1.6:-dy*.85)-hm+.0050*(n-.5)+.004*(vn(vec2(q.x*260.,q.y*40.))-.5)*ss(.0,-.01,dy);
   fol=max(fol,max(.20-uu,uu-1.02)*.06);
   if(hm>.001&&fol<best){best=fol;isF=1.;fl=vec2(-.3,dy/max(hm,.004));ao=.2;}}}
 if(best>.005)return;
 // the light: each pad lit on its upper side and towards the sun on the left, in its own shade underneath; deeper in the mass darker
 float sunF=dot(normalize(fl+vec2(0.,.35)),normalize(vec2(-.60,.80)));
 float lt=sat(.50+.50*sunF)*ss(-1.05,.10,fl.y)*(.60+.55*n)*(.80+.30*nb);
 float deep=ss(.0,-.035,dC)*(1.-ao);
 vec3 lit=mix(vec3(.30,.37,.14),vec3(.45,.48,.19),ss(.1,-.2,q.x-TRF.x));
 vec3 col=isF>.5?mix(vec3(.07,.11,.06),lit,lt)*mix(1.,.72,deep):vec3(.28,.23,.19);
 col*=isF>.5?.88+.22*vn(vec2(q.x*210.,q.y*55.)):1.;    // the hanging shoots
 PIECE(best,col,isF>.5?K_PLANT:K_BARK,q*vec2(90.,60.),vec2(0,1),isF>.5?.010:.002,.30,1.);
 if(isF>.5)glow(vec3(.30,.22,.08)*ss(.004,-.006,dC)*ss(.0,-.004,dC+.008)*sat(-fl.x*.8+fl.y*.5)*ss(.05,-.20,q.x-TRF.x)*.8,1.);  // the sun through the shoots at its edge on the left
}
// shoots and needles falling from the stripped branch
void moNeedles(vec2 q,float t){if(t<5.55||t>9.5||uDecor>1.5)return;vec2 tp=BR_TIP;if(abs(q.x-tp.x-.04)>.12||q.y>tp.y+.03||q.y<tp.y-.42)return;
 for(int i=0;i<22;i++){float fi=float(i);float t0=5.62+.40*h11(fi*1.3)+(fi<6.?0.:.30);float a=t-t0;if(a<0.||a>3.)continue;
  vec2 p0=tp+vec2(.005+.075*h11(fi*2.7),-.005-.012*h11(fi*3.9));
  vec2 p=p0+vec2(.010*a+.010*sin(a*3.+fi),-.07*a-.012*a*a);float an=a*(2.+2.*h11(fi))+fi;vec2 l=rot(an)*(q-p);
  float dd=sdEll(l,vec2(.0040+.0025*h11(fi*5.),.0010));veil(mix(vec3(.22,.30,.13),vec3(.40,.42,.20),h11(fi*7.)),ss(.0008,-.0006,dd)*.9*ss(3.,2.2,a),1.);}}
// dust raised by the diplodocus's feet
void moDust(vec2 q,float t){if(t<3.8||uDecor>1.5||q.y>DY+.08||q.y<DY-.04)return;
 for(int i=0;i<4;i++)for(int k=0;k<2;k++){float tl=DP_ST[i]+2.6*float(k)+.9;float a=t-tl;if(a<0.||a>2.4)continue;
  vec2 f=vec2(.62-(DP_FT[i].x+DP_SL*float(k+1))*DS,DY+(i>1?.004:0.));vec2 c=f+vec2(.010*a,.003+.007*a);float r=.005+.013*sqrt(a);
  float dd=length((q-c)/vec2(1.,.55))/r;float tex=.6+.4*fbm2(q*vec2(260.,300.)-vec2(t*.5,0.));
  veil(vec3(.86,.74,.58),ss(1.,.3,dd)*tex*.40*ss(.0,.12,a)*pow(1.-a/2.4,1.6)*(i>1?.7:1.),1.);}}
// low ferns over the ground, in rows going back (ylo..yhi: the rows to draw now, so that they fall in front of or behind the animals)
void moGroundFerns(vec2 q,float t,float ylo,float yhi){if(q.y>yhi+.02||uDecor>1.5)return;
 float r0=floor(max(0.,(-q.y-.03)/.050));
 for(int j=-1;j<=2;j++){float r=r0+float(j);if(r<0.||r>26.)continue;float yr=-.03-.050*r;if(yr<=ylo||yr>yhi)continue;
  float sc=.022+.10*(-yr-.03);float cw=sc*1.45;float ci=floor((q.x+r*.37)/cw);
  for(int c=-1;c<=1;c++){float cc=ci+float(c);vec2 b0=vec2((cc+.5+(h11(cc+r*5.)-.5)*.6)*cw-r*.37,yr+(h11(cc*1.3+r)-.5)*.044);
   // in clumps: many in the patches of fern, few on the bare soil
   float pt=ss(.44,.58,moPatch(b0));float pr=mix(.05,.97,pt);if(h11(cc*3.7+r*1.9)>pr)continue;moFern(q,b0,sc*mix(.5+.4*h11(cc*2.2+r),.95+.40*h11(cc*2.2+r),pt),t,cc+r*7.);}}}
// the foreground: big ferns in the bottom corners, a cycad on the right
void moFore(vec2 q,float t){if(uDecor>1.5)return;
 if(q.x<-.45&&q.y<-.20)moFern(q,vec2(-.80,-.56),.32,t,3.);
 if(q.x<-.30&&q.x>-.75&&q.y<-.34)moFern(q,vec2(-.56,-.58),.20,t,11.);
 if(q.x>.40&&q.y<-.14)moCycad(q,vec2(.70,-.32),.15,t,5.);
 if(q.x>.55&&q.y<-.30)moFern(q,vec2(.86,-.60),.28,t,17.);
}
void moShadows(vec2 q){
 // under the brachiosaurus: its body's shadow thrown to the right by the low sun, and its feet
 shadow(ss(1.,.2,length((q-BO-vec2(.30,-.012))/vec2(.36,.030)))*.30,vec3(.42,.38,.46),0.);
 for(int i=0;i<4;i++){vec2 tp,j1,j2,f;brLegJ(i,tp,j1,j2,f);contact(q,BO+f*BS+vec2(.006,.001),.040,i<2?.45:.35);}
 // under the diplodocus
 float hx=dpHipX(uTau);shadow(ss(1.,.2,length((q-vec2(hx-.06,DY-.006))/vec2(.17,.012)))*.24,vec3(.42,.38,.46),0.);
 for(int i=0;i<4;i++)contact(q,vec2(hx-dpFB[i].x*DS+.003,DY+.001),.020,.35*(1.-.7*dpLift[i]));}

// ---- The fossil: the brachiosaurus's skeleton in the rock as it stands at the start ----
const vec2 WIN_C=vec2(-.30,.07);
float moWinD(vec2 q){float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+3.)-.5)+.02*(vn(q*24.)-.5);}
void fossil(vec2 q){if(uLife>.001&&moWinD(q)<-.004)return;
 brPose(0.);vec2 b=(q-BO)/BS;if(b.x<-7.||b.x>12.4||b.y<-.5||b.y>13.)return;
 PIECE(brBones(b)*BS,vec3(.82,.76,.64),K_FOSSIL,b*.2,vec2(1,0),.010,.6,0.);}
void life(vec2 q,float t){
 if(uLife<.999&&moWinD(q)>.012)return;   // nothing of the living scene is seen outside the opening window
 SUNL=normalize(vec3(-.75,.45,.38));SUNC=vec3(1.38,1.16,.86);AMBC=vec3(.48,.52,.60);BACK=.20;
 brPose(t);dpPose(t);
 moBackdrop(q,t);
 moAraucaria(q,t);
 moGroundFerns(q,t,DY,0.);
 moShadows(q);
 dpAnimal(q,t);
 moDust(q,t);
 moGroundFerns(q,t,BO.y,DY);
 moNeedles(q,t);
 brAnimal(q,t,GROW);
 moGroundFerns(q,t,-9.,BO.y);
 moFore(q,t);
}

// ---- Scene 9 (El pou del temps, CE37): Velociraptor mongoliensis among the dunes of the Gobi (Djadochta Formation, Mongolia, about 75
// million years ago). Strong low light from the upper left, orange sand, lilac shadows, sand blowing off the crests against the light.
// A feathered dromaeosaurid (quill knobs on the ulna: Turner et al., 2007): pennaceous flight feathers on the arms, a frond of tail
// feathers, a coat of body feathers; lips cover the teeth; the second toe holds its big claw off the ground. About 2 m with the tail
// and a turkey-sized body: .62 screen units per metre. 4.2–5.8 s the display (the arms rise, the wings open, the tail fans); 6.4–9.6
// a sand bath (it lowers its body, wriggles, the wings flick sand that flies soft and slow against the light); 10.2–11.2 it stands and
// shakes off the sand (the feathers fluff out, then settle). ----
const float VG=-.31,VS=.70;
const vec2 WIN_C=vec2(-.03,-.04);
// While the window of life opens, the pixels well outside it show only stone: life() skips them (the tail masks them anyway), and
// fossil() skips the pixels well inside it (the window covers them).
bool outWin(vec2 q,float mg){if(uLife>=.999)return false;float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))>R+mg;}
const vec2 V0=vec2(-.03,VG); // the ground under its hip, in the scene
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
// texture coordinates for feathers laid along dir: ka rows of feathers along it, kc across it (per metre)
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
// A damped wobble after an event at t0 (feathers settling): 0 before, rings down in about .6 s.
float settle(float t,float t0){float a=t-t0;return a<0.?0.:exp(-a*5.5)*sin(a*19.);}

// ---- The pose at time t (metres, facing -x; x along the ground, y up from it) ----
struct VP{vec2 hip;float ba;vec2 nb,nc,hd;float ha;vec2 kN,aN,bN,kF,aF,bF;vec2 sh,e,w,f;vec2 tb,tc,tt;
 float disp,tf,bath,wrig,fluff,shk,flick,crest,wob,look;};
vec2 armMix(vec2 rest,vec2 dsp,vec2 bth,vec2 flk,float d,float b,float fl){return mix(mix(mix(rest,dsp,d),bth,b),flk,fl);}
VP vPose(float t){VP p;
 float br=sin(t*2.2);
 p.look=ss(3.7,4.1,t)*(1.-ss(4.3,4.7,t));                         // first beat: alert, the head comes up
 p.disp=ss(4.2,4.8,t)*(1.-ss(5.3,5.85,t));                         // the wings open and close
 p.tf=ss(4.34,4.98,t)*(1.-ss(5.45,6.05,t));                        // the tail fans (a little later)
 p.bath=ss(6.4,7.15,t)*(1.-ss(9.35,10.1,t));                       // down on the sand
 p.wrig=ss(6.95,7.35,t)*(1.-ss(9.1,9.5,t));                        // wriggling
 p.shk=ss(10.15,10.3,t)*(1.-ss(10.95,11.25,t));                    // the shake
 float fl=ss(10.0,10.4,t)*(1.-ss(10.95,12.1,t));
 p.fluff=max(fl,.75*p.bath);
 p.wob=settle(t,5.85)*.6+settle(t,11.25);                          // the feathers settle after the wings close and after the shake
 p.crest=max(p.look*.6,p.disp)+.5*fl;
 float wq=sin(t*12.)*.7+sin(t*7.3+1.)*.3;                          // the rocking of the bath, irregular
 p.flick=p.wrig*pow(sat(sin(t*7.5)),2.);   // three flicks of the wings: 7.04, 7.88, 8.72 s
 float lean=ss(5.95,6.35,t)*(1.-ss(6.55,7.,t));                     // the weight goes forward before it lowers itself
 float rise=ss(9.4,9.8,t)*(1.-ss(9.8,10.2,t));                     // and before it stands up again
 // the shake travels from the head (10.15) to the body (+.12 s) and the tail (+.25 s)
 float shB=ss(10.27,10.42,t)*(1.-ss(10.95,11.2,t)),shT=ss(10.4,10.55,t)*(1.-ss(11.05,11.3,t));
 vec2 hip=vec2(.0,.44+.003*br);
 hip+=vec2(-.006,.014)*p.disp;
 hip.x-=.025*lean+.02*rise;
 hip=mix(hip,vec2(.03,.19+.004*br),p.bath);
 hip.y+=.010*p.wrig*abs(wq);
 hip+=vec2(.006*sin(t*TAU*4.6-1.),.004*sin(t*TAU*9.2))*shB;
 float ba=-.03*p.look-.12*p.disp+.10*lean+.12*rise+.07*p.bath+.06*p.wrig*wq+.035*shB*sin(t*TAU*4.6-1.3)+.03*sin(t*.9)*(1.-p.bath)*.3;
 p.hip=hip;p.ba=ba;
 p.nb=hip+R2(vec2(-.28,.05),ba);
 // the head: idle saccades (it turns quickly to a new angle and holds, like a bird), alert, raised in the display, down in the bath
 float sc=t/1.9,si=floor(sc);float sa=mix(h11(si+.3)-.5,h11(si+1.3)-.5,ss(.0,.10,fract(sc)));
 float hs=ss(10.1,10.2,t)*(1.-ss(10.62,10.85,t));
 vec2 hr=vec2(-.15,.13)+vec2(.012*sa,.01*sin(t*1.3))*(1.-p.bath);
 hr+=vec2(-.025,.02)*p.look;
 hr=mix(hr,vec2(-.10,.22),p.disp);
 hr=mix(hr,vec2(-.25,.05),p.bath);
 hr+=vec2(.018*sin(t*6.),.010*sin(t*12.+.5))*p.wrig;
 hr+=vec2(.004,.012*sin(t*TAU*5.2))*hs;
 hr+=vec2(-.03,-.02)*lean;
 p.hd=p.nb+hr;
 p.nc=p.nb+mix(vec2(-.04,.12),vec2(-.07,.18),p.bath)+vec2(.01,.02)*p.disp;
 p.ha=.10+.14*sa*(1.-p.disp)*(1.-p.bath)-.12*p.look-.22*p.disp+.50*p.bath+.12*p.wrig*sin(t*6.+1.)+.24*hs*sin(t*TAU*5.2+.8)+.15*lean;
 // the feet: planted, with two small steps as it settles into the bath and two as it stands back
 float sN=ss(6.22,6.48,t)-ss(11.5,11.78,t),sF=ss(6.0,6.26,t)-ss(11.75,12.03,t);
 float lN=.035*(sin(PI*sat((t-6.22)/.26))+sin(PI*sat((t-11.5)/.28))),lF=.03*(sin(PI*sat((t-6.0)/.26))+sin(PI*sat((t-11.75)/.28)));
 p.bN=vec2(-.05-.04*sN,.012+lN);p.bF=vec2(.06-.035*sF,.012+lF);
 float thN=mix(.33,1.30,p.bath)-lN*3.,thF=mix(.33,1.26,p.bath)-lF*3.;
 p.aN=p.bN+.118*vec2(sin(thN),cos(thN));p.aF=p.bF+.118*vec2(sin(thF),cos(thF));
 p.kN=knee(hip,p.aN,.19,.22,-1.);p.kF=knee(hip+vec2(.01,.0),p.aF,.19,.22,-1.);
 // the arm (shoulder, elbow, wrist, the tip of the long finger): folded, raised for the display, spread low in the bath
 p.sh=hip+R2(vec2(-.215,.035),ba);
 float half_=.25*p.shk+.3*fl*(1.-p.shk);
 vec2 H=armMix(vec2(.115,-.05),vec2(.035,.11),vec2(.06,-.05),vec2(.07,.0),p.disp,p.bath,p.flick*.8);
 vec2 U=armMix(vec2(-.145,.04),vec2(.0,.125),vec2(.03,-.06),vec2(.05,.035),p.disp,p.bath,p.flick*.8);
 vec2 K=armMix(vec2(.035,-.07),vec2(-.045,.09),vec2(.07,-.03),vec2(.07,.03),p.disp,p.bath,p.flick*.8);
 H=mix(H,vec2(.04,.02),half_);U=mix(U,vec2(-.06,.05),half_);K=mix(K,vec2(-.08,.0),half_);
 H+=vec2(.0,.008*sin(t*TAU*4.6))*p.shk;
 p.e=p.sh+R2(H,ba);p.w=p.e+R2(U,ba);p.f=p.w+R2(K,ba);
 // the stiff tail: from the hips, raised in the display, along the sand in the bath; a wave in the shake
 float tl=-.04+.025*sin(t*.8)+.20*p.disp+.13*p.bath+.035*p.wrig*sin(t*12.+1.2)+.05*shT*sin(t*TAU*4.6-2.4)-.10*lean+.05*p.wob;
 p.tb=hip+R2(vec2(.05,.035),ba);
 float A=ba+tl;vec2 td=vec2(cos(A),sin(A)),tn=vec2(-td.y,td.x);
 float sag=-.03+.02*p.disp-.03*p.bath+.012*sin(t*.8+1.);
 p.tc=p.tb+td*.46+tn*sag;p.tt=p.tb+td*.95+tn*(sag*.6+.02*shT*sin(t*TAU*4.6-3.2));
 return p;}

// ---- The bones (fossil, and under the growing flesh) ----
float vBones(vec2 m,VP p){float d=1e5;float tt;
 // a cheap bound first: far from the skeleton, a lower bound of the distance is enough
 {vec2 b0=R2(m-p.hip,-p.ba);float c=sdCap(m,p.hd,p.hd+R2(vec2(-.23,0.),p.ha),.04,.02);c=min(c,sdCap(m,p.nb,p.hd,.03,.03));c=min(c,sdEll(b0-vec2(-.12,-.04),vec2(.20,.13)));
  c=min(c,sdCap(m,p.tb,p.tt,.04,.02));c=min(c,sdCap(m,p.tc,p.tt,.04,.02));c=min(c,sdCap(m,p.hip,p.kN,.02,.02));c=min(c,sdCap(m,p.kN,p.aN,.02,.02));c=min(c,sdCap(m,p.aN,p.bN+vec2(-.08,0.),.02,.06));
  c=min(c,sdCap(m,p.hip,p.kF,.02,.02));c=min(c,sdCap(m,p.kF,p.aF,.02,.02));c=min(c,sdCap(m,p.aF,p.bF+vec2(-.08,0.),.02,.06));c=min(c,sdCap(m,p.sh,p.e,.02,.02));c=min(c,sdCap(m,p.e,p.w,.02,.02));c=min(c,sdCap(m,p.w,p.f,.02,.05));
  if(c>.03)return c-.02;}
 // skull: long and low, with the big openings; the jaw
 vec2 h=R2(m-p.hd,-p.ha);
 if(length(h-vec2(-.11,0.))<.16){
  float sk=smin(sdEll(h-vec2(-.05,.0),vec2(.05,.035)),sdCap(h,vec2(-.07,.0),vec2(-.225,-.002),.025,.012),.02);
  sk=max(sk,-sdEll(h-vec2(-.085,.010),vec2(.017,.016)));sk=max(sk,-sdEll(h-vec2(-.138,.0),vec2(.032,.011)));
  sk=max(sk,-sdEll(h-vec2(-.205,.005),vec2(.011,.005)));sk=max(sk,-sdEll(h-vec2(-.035,-.006),vec2(.011,.013)));
  d=min(d,sk);float jw=sdCap(h,vec2(-.015,-.028),vec2(-.215,-.016),.011,.006);jw=max(jw,-sdEll(h-vec2(-.065,-.027),vec2(.022,.004)));d=min(d,jw);}
 // neck vertebrae
 for(int i=0;i<7;i++){float s0=(float(i)+.08)/7.,s1=(float(i)+.86)/7.;d=min(d,sdCap(m,bez(p.nb,p.nc,p.hd,s0),bez(p.nb,p.nc,p.hd,s1),.011,.010));}
 vec2 b=R2(m-p.hip,-p.ba);
 if(b.x>-.34&&b.x<.16&&b.y>-.24&&b.y<.12){
  for(int i=0;i<8;i++){float x=-.26+float(i)*.035;vec2 c=vec2(x,.055);d=min(d,sdEll(b-c,vec2(.014,.010)));d=min(d,sdSeg(b,c,c+vec2(.005,.022))-.0035);}
  for(int i=0;i<7;i++){float x=-.24+float(i)*.034;vec2 a=vec2(x,.045);d=min(d,sdTube(b,a,a+vec2(.05,-.05),vec2(x+.02,-.075+float(i)*.006),.004,.003,tt));}
  for(int i=0;i<5;i++){float x=-.21+float(i)*.036;d=min(d,sdSeg(b,vec2(x,-.085+float(i)*.005),vec2(x+.03,-.088+float(i)*.006))-.0024);}
  d=min(d,sdCap(b,vec2(-.16,.055),vec2(-.245,-.005),.008,.011));d=min(d,sdCap(b,vec2(-.25,-.01),vec2(-.27,-.05),.009,.007));
  d=min(d,sdTube(b,vec2(-.28,-.02),vec2(-.27,-.07),vec2(-.24,-.075),.004,.003,tt));   // the wishbone
  d=min(d,sdEll(b-vec2(.0,.035),vec2(.085,.026)));
  d=min(d,sdCap(b,vec2(-.005,.0),vec2(.07,-.165),.009,.011));d=min(d,sdEll(b-vec2(.075,-.17),vec2(.018,.010)));
  d=min(d,sdCap(b,vec2(.03,.0),vec2(.085,-.055),.008,.005));}
 // tail: vertebrae and the long bony rods that stiffen it
 for(int i=0;i<10;i++){float s0=float(i)/10.,s1=s0+.075;d=min(d,sdCap(m,bez(p.tb,p.tc,p.tt,s0),bez(p.tb,p.tc,p.tt,s1),.010-.0007*float(i),.009-.0007*float(i)));}
 {vec2 o=vec2(0.,.010);float e=sdTube(m,p.tb+vec2(.1,.01),p.tc+o,p.tt+o,.0022,.0015,tt);e=min(e,sdTube(m,p.tb+vec2(.1,-.02),p.tc-o*1.4,p.tt-o,.0022,.0015,tt));d=min(d,e);}
 // arm: humerus, the two forearm bones, the hand with three clawed fingers
 d=min(d,sdCap(m,p.sh,p.e,.009,.008));d=min(d,sdCap(m,p.e,p.w,.005,.0045));
 {vec2 n=normalize(p.w-p.e);n=vec2(-n.y,n.x)*.007;d=min(d,sdCap(m,p.e+n,p.w+n,.004,.004));}
 vec2 K=p.f-p.w;vec2 kn=normalize(vec2(-K.y,K.x));
 d=min(d,sdCap(m,p.w,p.f,.005,.004));d=min(d,sdCap(m,p.w,p.w+K*.45+kn*.012,.005,.004));d=min(d,sdCap(m,p.w,p.w+K*.85-kn*.012,.0045,.0035));
 d=min(d,sdTube(m,p.f,p.f+K*.18+kn*.01,p.f+K*.2-kn*.02,.004,.001,tt));
 // legs (near; the far a little behind): femur, tibia, metatarsus, toes, the sickle claw up
 for(int L=0;L<2;L++){vec2 H=p.hip,Kn=L==0?p.kN:p.kF,A=L==0?p.aN:p.aF,B=L==0?p.bN:p.bF;
  d=min(d,sdCap(m,H,Kn,.012,.010));d=min(d,sdCap(m,Kn,A,.010,.007));d=min(d,sdCap(m,A,B,.007,.006));d=min(d,length(m-Kn)-.013);
  d=min(d,sdCap(m,B,B+vec2(-.075,-.008),.004,.003));d=min(d,sdCap(m,B,B+vec2(-.032,.03),.005,.004));
  d=min(d,sdTube(m,B+vec2(-.032,.03),B+vec2(-.075,.05),B+vec2(-.075,.012),.005,.0012,tt));}
 return d;}

// ---- Feathers ----
// One flight feather: root o, angle a, length L, half width w; u along it (0 root .. 1 tip), v across (-1 .. 1).
float vFeather(vec2 m,vec2 o,float a,float L,float w,out float u,out float v){vec2 dv=vec2(cos(a),sin(a));vec2 l=m-o;float al=dot(l,dv),ac=dot(l,vec2(-dv.y,dv.x));
 u=sat(al/L);float r=w*(.40+.60*ss(.0,.25,u))*(1.-.45*ss(.55,1.,u)*ss(.55,1.,u));v=ac/max(r,1e-4);return length(vec2(al-clamp(al,0.,L),ac))-r;}
// The painted vane of a flight feather: a gradient across it (the narrow outer vane lighter, the inner vane darker towards the trailing
// edge), faint oblique barbs, a pale tapering shaft (rachis), and the shadow of the feather that lies over it.
vec3 vVane(vec3 c,float u,float v,float under,float te,float L){
 c*=mix(1.08,.84,ss(-1.,1.,v))*(.92+.10*sqrt(sat(1.-v*v)))*(1.05-.08*u);
 float barb=.5+.5*sin(u*L*520.-abs(v)*18.);c*=.94+.08*barb*ss(.0,.2,u);
 float rw=mix(.16,.05,u);c=mix(c,min(c*1.8+.14,vec3(.95,.92,.85)),ss(rw,rw*.35,abs(v+.30))*ss(.98,.86,u)*.75);
 c*=1.-.45*under*ss(-.010,-.0005,te);
 return c;}
// The angle of flight feather s (0 the innermost secondary .. 1 the outermost primary) for the pose (m frame, 0 = backwards).
float vWingA(float s,VP p,float far){
 float aR=mix(-.10,-.06,s),aD=mix(-.70,1.22,pow(s,1.1)),aB=mix(-1.30,-.25,s),aF=mix(-.70,.55,s);
 float a=mix(mix(mix(aR,aD,p.disp),aB,p.bath),aF,p.flick*.9);
 a=mix(a,mix(-.3,.45,s),.25*p.shk);
 return a+p.ba+far*(.10+.18*p.disp)+.10*p.wob*s;}
// A wing: 11 flight feathers (5 secondaries on the forearm, 6 primaries on the hand); over their roots two rows of coverts (the greater,
// then the shorter median ones) and the small marginal coverts along the arm; the fingers with their claws at the leading edge.
void vWing(vec2 m,VP p,float far,float dB,float G,float t){
 vec2 lo=min(min(p.e,p.w),p.f)-.29,hi=max(max(p.e,p.w),p.f)+.29;if(m.x<lo.x||m.y<lo.y||m.x>hi.x||m.y>hi.y)return;
 float dU=1e5,tu=0.,tv=0.,tk=0.,und=0.,te=0.,tL=.2;vec2 tdir=vec2(1,0),to=vec2(0.);
 float gU=1e5,gu=0.,gv=0.,gund=0.,ge=0.;float mU=1e5,mu=0.,mv=0.,mund=0.,me=0.;
 for(int i=10;i>=0;i--){float k=float(i),s=k/10.;
  vec2 o=i<5?mix(p.e,p.w,(k+.5)/5.):mix(p.w,p.f,(k-4.6)/6.);
  float a=vWingA(s,p,far);float L=i<5?.155+.008*k:.235+.035*sin((k-4.5)/6.*2.4)-.02*ss(8.5,10.,k);vec2 dv=vec2(cos(a),sin(a));
  float u,v;float ei=vFeather(m,o,a,L,.030,u,v);
  if(ei<0.){und=dU<0.?1.:0.;tu=u;tv=v;tk=k;te=ei;tdir=dv;to=o;tL=L;}
  dU=min(dU,ei);
  ei=vFeather(m,o-dv*.006,a+.04,L*(i<5?.42:.34),.028,u,v);if(ei<0.){gund=gU<0.?1.:0.;gu=u;gv=v;ge=ei;}gU=min(gU,ei);
  ei=vFeather(m,o-dv*.010,a+.08,L*(i<5?.25:.20),.026,u,v);if(ei<0.){mund=mU<0.?1.:0.;mu=u;mv=v;me=ei;}mU=min(mU,ei);}
 float dC=min(sdCap(m,p.e,p.w,.022,.018),sdCap(m,p.w,mix(p.w,p.f,.75),.018,.012));dC=smin(dC,sdCap(m,p.sh,p.e,.034,.026),.02);
 float dk=far>.5?.50:1.;
 if(G<.6){float gg=dB-G/VS;dU=max(dU,gg);gU=max(gU,gg);mU=max(mU,gg);dC=max(dC,gg);}
 if(p.bath>.01){float gc=.004-m.y;dU=max(dU,gc);gU=max(gU,gc);mU=max(mU,gc);}   // in the bath the feather tips press into the sand
 vec2 cd=-tdir;
 // the fingers with their claws, out at the leading edge
 vec2 K=p.f-p.w;float lk=length(K);vec2 kd=K/max(lk,1e-4),kn=vec2(-kd.y,kd.x);float tt;
 vec2 f1=p.w+kd*.035+kn*.020,f2=p.f+kd*.012+kn*.006,f3=p.w+kd*lk*.85+kn*.016;
 float dg=min(sdCap(m,p.w+kn*.012,f1,.0075,.006),min(sdCap(m,mix(p.w,p.f,.5)+kn*.01,f2,.0075,.0055),sdCap(m,mix(p.w,p.f,.45)+kn*.014,f3,.007,.005)));
 float cl=min(sdCap(m,f1,f1+kd*.018-kn*.006,.0062,.0012),min(sdCap(m,f2,f2+kd*.022-kn*.008,.0066,.0012),sdCap(m,f3,f3+kd*.020-kn*.007,.0062,.0012)));
 if(G<.6){float gg=dB-G/VS;dg=max(dg,gg);cl=max(cl,gg);}
 vec2 l=R2(m-p.e,-p.ba);float dd=dC-.003*(vn(l*vec2(60.,90.))-.4);
 // all the layers in one piece: the flight feathers, the greater and the median coverts, the marginal coverts, the fingers and claws;
 // each layer over the one below with a soft step of value and a fine shadow line at its edge
 vec3 c=mix(vec3(.32,.23,.16),vec3(.19,.14,.11),ss(4.,7.,tk));
 c=mix(c,vec3(.72,.37,.17),ss(.62,.25,tu)*ss(8.,3.,tk)*.85);   // a rufous patch at the base (it shows when the wing opens)
 c=mix(c,vec3(.92,.86,.72),ss(.82,.93,tu)*.85);                  // pale tips
 c*=1.-.35*ss(.06,.0,abs(tu-.74));                               // a dark bar before them
 c=vVane(c,tu,tv,und,te,tL);
 {vec3 g=mix(vec3(.56,.40,.26),vec3(.40,.28,.19),gu);g=mix(g,vec3(.84,.72,.54),ss(.78,.95,gu)*.7);g=vVane(g,gu,gv,gund,ge,.08);
  c=mix(c*(1.-.30*ss(PX*2.5,0.,abs(gU*VS))),g,cov(gU*VS));}
 {vec3 g=mix(vec3(.62,.46,.30),vec3(.46,.33,.22),mu);g=mix(g,vec3(.86,.74,.56),ss(.75,.95,mu)*.6);g=vVane(g,mu,mv,mund,me,.05);
  c=mix(c*(1.-.30*ss(PX*2.5,0.,abs(mU*VS))),g,cov(mU*VS));}
 {vec3 g=mix(vec3(.62,.46,.30),vec3(.44,.31,.21),ss(.45,.75,fbm2(l*22.)));c=mix(c*(1.-.25*ss(PX*2.5,0.,abs(dd*VS))),g,cov(dd*VS));}
 c=mix(c*(1.-.4*ss(PX*2.,0.,abs(dg*VS))),vec3(.48,.38,.30),cov(dg*VS));
 c=mix(c,vec3(.14,.11,.09),cov(cl*VS));
 float dW=min(min(min(dU,gU),min(mU,dd)),min(dg,cl));
 PIECE(dW*VS,c*dk,K_FEATHER,FU(m-to,tdir,2.2,9.),cd,.006,1.,0.);}
// The tail feathers: a frond along the last half of the tail, both sides spread in the picture; it fans out in the display.
void vTailFan(vec2 m,VP p,float dB,float G,float t){
 vec2 lo=min(p.tc,p.tt)-.28,hi=max(p.tc,p.tt)+.28;if(m.x<lo.x||m.y<lo.y||m.x>hi.x||m.y>hi.y)return;
 float dU=1e5,tu=0.,tv=0.,und=0.,te=0.,tL=.15,tk=0.;vec2 tdir=vec2(1,0),to=vec2(0.);
 for(int i=0;i<15;i++){float k=float(i);float side=i<7?1.:i<14?-1.:0.;float j=mod(k,7.);float s=i<14?.52+.46*j/6.:.99;
  vec2 c=bez(p.tb,p.tc,p.tt,s);vec2 tg=normalize(bez(p.tb,p.tc,p.tt,min(s+.02,1.))-bez(p.tb,p.tc,p.tt,s-.02));
  float spread=mix(mix(.20,.05,s),mix(1.15,.42,s),p.tf)+.10*p.fluff+.10*p.wob;
  float a=atan(tg.y,tg.x)+side*spread;float L=i<14?mix(.10,.23,j/6.):.24;
  float u,v;float ei=vFeather(m,c+vec2(-tg.y,tg.x)*side*.006,a,L,.030,u,v);
  if(ei<0.){und=dU<0.?1.:0.;tu=u;tv=v;te=ei;tdir=vec2(cos(a),sin(a));to=c;tL=L;tk=j;}
  dU=min(dU,ei);}
 if(dU>.02)return;if(G<.6)dU=max(dU,dB-G/VS);
 vec3 c=mix(vec3(.62,.45,.28),vec3(.44,.31,.20),ss(.3,.8,tu));
 c=mix(c,vec3(.72,.40,.20),ss(.6,.2,tu)*.5);
 c=mix(c,vec3(.22,.15,.11),ss(.08,.0,abs(tu-.75))*(.45+.45*p.tf));   // a dark band near the tips: one ring of the fanned tail
 c=mix(c,vec3(.90,.84,.72),ss(.85,.95,tu)*(.35+.55*p.tf));
 c=vVane(c,tu,tv,und,te,tL);
 PIECE(dU*VS,c,K_FEATHER,FU(m-to,tdir,2.2,9.),-tdir,.006,1.,0.);}

// ---- The animal ----
float vLegLow(vec2 m,vec2 K,vec2 A,vec2 B,float dB,float G,float lift,out vec3 col){
 // the scaly metatarsus and toes (III and IV on the ground, II with the sickle claw held up), the claws
 vec2 T3=B+vec2(-.078,-.009+lift*.3),T4=B+vec2(-.062,-.010+lift*.2);
 float d=sdCap(m,A,B,.016,.012);d=smin(d,sdCap(m,B,T3,.009,.006),.006);d=min(d,sdCap(m,B+vec2(.0,.002),T4,.008,.006));
 vec2 j2=B+vec2(-.030,.028);d=smin(d,sdCap(m,B,j2,.009,.007),.006);
 float cl=min(sdCap(m,j2,j2+vec2(-.040,.012),.0068,.004),sdCap(m,j2+vec2(-.040,.012),j2+vec2(-.050,-.014),.004,.0012));
 cl=min(cl,min(sdCap(m,T3,T3+vec2(-.018,-.005),.0045,.001),sdCap(m,T4,T4+vec2(-.016,-.005),.004,.001)));
 col=mix(vec3(.50,.40,.31),vec3(.15,.12,.10),cov(cl*VS));
 d=min(d,cl);if(G<.6)d=max(d,dB-G/VS);return d;}
// The near leg: the feathered thigh and shank in one piece (the drumstick), the scaly foot. dF: the body (for the contour).
void vLegNear(vec2 m,VP p,float dB,float G,float dF){bool needB=G<.6;vec2 thA=p.hip+R2(vec2(-.005,-.015),p.ba);
 float dt2=sdEll(R2(m-mix(thA,p.kN,.55),-atan(p.kN.y-thA.y,p.kN.x-thA.x)),vec2(.5*length(p.kN-thA)+.05,.068));
  dt2=smin(dt2,sdCap(m,p.kN,p.aN,.042,.017),.03);
  dt2-=.008*p.fluff+.004*(vn(m*vec2(50.,30.))-.4);if(needB)dt2=max(dt2,dB-G/VS);
  vec2 ld=normalize(p.aN-p.kN+vec2(.0,-.08));
  vec3 fc;float dl=vLegLow(m,p.kN,p.aN,p.bN,dB,G,p.bN.y-.012,fc);
  float behind=step(.5,p.bath);dt2=max(dt2,-dF*behind-1e5*(1.-behind));dl=max(dl,-dF*behind-1e5*(1.-behind));
  {float line=max(ss(-.02,.004,dt2-dF),behind);
   vec3 lc=mix(vec3(.66,.49,.31),vec3(.50,.37,.25),ss(.0,.10,m.y-p.kN.y));lc=mix(lc,vec3(.58,.46,.34),ss(.0,-.08,m.y-p.kN.y));
   PIECE(dt2*VS,lc,K_FEATHER,FU(m-p.kN,ld,2.2,1.2),-ld,.05,max(line,ss(.0,-.06,m.y-p.kN.y)),0.);
   shadow(ss(.012,.0,abs(dt2+.004))*ss(-.02,.02,m.x-p.kN.x)*.25*ss(.06,.0,dt2-dF)*(1.-behind),vec3(.5,.4,.4),0.);}
  PIECE(dl*VS,fc,K_SCALE,m*vec2(260.,300.),vec2(0,1),.008,1.,0.);}
void raptor(vec2 q,VP p,float t,float G){
 vec2 m=(q-V0)/VS;
 if(m.x<-.85||m.x>1.32||m.y<-.05||m.y>1.25)return;
 float px0=PX;
 bool needB=G<.6;float dB=needB?vBones(m,p):-1.;
 if(needB&&G<.5)PIECE(dB*VS,vec3(.88,.84,.74),K_BONE,m*3.,vec2(1,0),.006,.8,0.);
 // the far leg and the far wing, darker
 {float d=sdCap(m,p.hip+vec2(.0,-.02),p.kF,.06,.035);d=smin(d,sdCap(m,p.kF,p.aF,.034,.016),.015);if(needB)d=max(d,dB-G/VS);
  vec3 fc;float dl=vLegLow(m,p.kF,p.aF,p.bF,dB,G,p.bF.y-.012,fc);
  PIECE(min(d,dl)*VS,dl<d?fc*.62:vec3(.40,.30,.21),K_FEATHER,FU(m-p.kF,normalize(p.aF-p.kF),2.4,1.2),-normalize(p.aF-p.kF),.03,1.,0.);}
 {VP f=p;vec2 o=R2(vec2(.035,.045),p.ba);f.sh+=o;f.e+=o+R2(vec2(-.02,.03),p.ba)*p.disp;f.w+=o+R2(vec2(-.05,.04),p.ba)*p.disp;f.f+=o+R2(vec2(-.07,.03),p.ba)*p.disp;vWing(m,f,1.,dB,G,t);}
 vTailFan(m,p,dB,G,t);
 // body, neck and tail as one piece of feathers
 vec2 b=R2(m-p.hip,-p.ba);
 float dTor=sdEll(R2(b-vec2(-.13,-.025),.06),vec2(.24,.13));
 float dCh=sdEll(b-vec2(-.25,-.03),vec2(.11,.125));
 float dHp=sdEll(b-vec2(.0,.0),vec2(.13,.10));
 float tn;float dNk=sdTube(m,p.nb,p.nc,p.hd+R2(vec2(-.035,-.012),p.ha),.068,.040,tn);
 float tq;float dTl=sdTube(m,p.tb,p.tc,p.tt,.075,.011,tq);
 vec2 thA=p.hip+R2(vec2(-.005,-.015),p.ba),thB=mix(thA,p.kN,.8);
 float dTh=sdCap(m,thA,thB,.085,.055);
 float d=smin(smin(dTor,dCh,.05),dHp,.05);
 d=smin(d,sdEll(b-vec2(-.13,-.02),vec2(.25,.16))+.25*(1.-p.bath),.06);if(p.bath>.01)d=max(d,.006-m.y);
 float wNk=ss(.02,-.03,dNk-d);d=smin(d,dNk,.045);d=smin(d,dTl,.05);
 // the direction of the feathers: back and down on the body, down the neck towards it, back along the tail
 vec2 dirB=normalize(vec2(1.,-.25-.5*ss(.0,-.09,b.y)));
 vec2 nT=2.*(1.-tn)*(p.nc-p.nb)+2.*tn*(p.hd-p.nc);vec2 dirN=R2(normalize(-nT+vec2(.4,-.3)),-p.ba);
 dirB=normalize(mix(dirB,dirN,wNk));
 vec2 dir=R2(dirB,p.ba);
 vec2 u=R2(FU(b,dirB,1.8,1.0),p.ba);
 // fluffed feathers stand out: a bigger, ragged outline
 float rag=vn(u*vec2(5.,9.)+3.)-.35;
 float dF=d-.020*p.fluff-.006*rag*(.35+2.2*p.fluff)-.0025*sin(t*TAU*4.6+u.x*3.)*p.shk;
 if(needB)dF=max(dF,dB-G/VS);
 if(dF<.03){
  float cs=ss(-.075,.06,b.y);if(dTl<d+.01)cs=mix(cs,ss(-.035,.03,dot(m-bez(p.tb,p.tc,p.tt,tq),R2(vec2(0,1),p.ba))),.8);
  vec3 alb=mix(vec3(.88,.79,.62),vec3(.66,.48,.30),ss(.0,.5,cs));alb=mix(alb,vec3(.40,.28,.19),ss(.55,1.,cs));
  alb=mix(alb,vec3(.62,.48,.34),wNk*.5*ss(.0,.06,cs));
  alb*=1.-.26*ss(.56,.76,fbm2(b*vec2(11.,15.)+2.))*ss(.25,.7,cs);  // dark mottles on the back
  alb*=mix(.66,1.,ss(-.15,-.02,b.y+.03*p.bath));                   // the underside in its own shade
  alb*=1.-.22*p.fluff*vn(u*12.);alb=mix(alb,vec3(.86,.70,.50),.12*p.bath*ss(.3,.9,vn(b*30.)));  // sand caught in the plumage
  vec2 dj=normalize(dir+.9*p.fluff*vec2(vn(u*3.)-.5,vn(u*3.+7.)-.5));
  PIECE(dF*VS,alb,K_FEATHER,u,-dj,.09,1.,0.);
  {vec2 gq=vec2(dFdx(dF),dFdy(dF));float face=sat(dot(gq/max(length(gq),1e-9),normalize(SUNL.xy)));
   glow(vec3(1.,.80,.52)*(.20+.25*p.fluff)*face*face*ss(-.010-.010*p.fluff,-.001,dF)*ss(.004,-.001,dF),0.);}
  }
 vLegNear(m,p,dB,G,dF);
 // the head: feathered, the snout with small scales, lips over the teeth, a long low skull with a concave top
 vec2 h=R2(m-p.hd,-p.ha);
 if(length(h-vec2(-.11,0.))<.20){
  float tt;
  // a small crest of feathers at the back of the head, raised in the display
  float dCr=1e5;float cu=0.,cv=0.;for(int i=0;i<5;i++){float fi=float(i);float uu,vv;float a=-.22+fi*.07+p.crest*(.55+.10*fi)+.08*p.wob;
   float e=vFeather(h,vec2(-.045+fi*.009,.030-fi*.006),a,.030+.004*fi+.022*p.crest,.010,uu,vv);if(e<dCr){dCr=e;cu=uu;cv=vv;}}
  if(needB)dCr=max(dCr,dB-G/VS);
  float dCra=sdEll(h-vec2(-.045,.0),vec2(.066,.050));
  float dSn=sdTube(h,vec2(-.07,.004),vec2(-.15,-.008),vec2(-.232,-.008),.034,.016,tt);
  float dJw=sdCap(h,vec2(-.03,-.032),vec2(-.215,-.022),.021,.010);
  float dH=smin(smin(dCra,dSn,.03),dJw,.012);
  dH-=.004*p.fluff*ss(-.08,-.02,h.x);
  if(needB)dH=max(dH,dB-G/VS);
  float line=1.-ss(.012,-.008,dNk+.01)*ss(-.06,.0,h.x);
  vec3 ha=mix(vec3(.80,.70,.55),vec3(.58,.43,.29),ss(-.035,.012,h.y));ha=mix(ha,vec3(.38,.27,.18),ss(.02,.045,h.y)*ss(-.13,-.04,h.x));
  ha=mix(ha,vec3(.30,.22,.16),ss(.008,.0,abs(h.y-.006+.012*(h.x+.06)))*ss(-.11,-.06,h.x)*ss(.02,-.06,h.x)*.6);  // a dark stripe back from the eye
  float bare=ss(-.17,-.20,h.x+.008*sin(h.y*200.));ha=mix(ha,vec3(.46,.37,.30),bare*.85);
  // the mouth: closed, the lips over the teeth; the nostril
  float PXm=PX/VS;
  float ml=abs(h.y+.019-.0007*sin(h.x*60.)-.06*(h.x+.12)*(h.x+.12))-.0009;ml=max(ml,abs(h.x+.125)-.10);
  ha=mix(ha,vec3(.20,.14,.10),ss(PXm*1.2,0.,ml)*step(.3,G));
  ha=mix(ha,vec3(.08,.06,.05),ss(PXm,-PXm,sdEll(h-vec2(-.215,.007),vec2(.0085,.0045)))*step(.3,G));
  vec3 cc=mix(vec3(.46,.33,.22),vec3(.66,.44,.26),cu);
  float dHd=min(dH,dCr);
  PIECE(dHd*VS,mix(cc,ha,cov(dH*VS)),K_FEATHER,R2(FU(h,vec2(1.,-.1),5.,2.6),p.ha),-R2(vec2(1.,-.1),p.ha),.025,mix(.6,line,cov(dH*VS)),0.);
  if(G>.3){
   shadow(ss(.006,-.004,sdCap(h,vec2(-.04,-.024),vec2(-.21,-.016),.006,.004))*.18,vec3(.6,.55,.5),0.);
   vec2 ec=p.hd+R2(vec2(-.088,.012),p.ha);
   shadow(ss(.02,.0,length(h-vec2(-.088,.016)))*.25,vec3(.45,.35,.3),0.);
   PX=px0;eyeA(q,V0+ec*VS,.0135*VS,vec3(.86,.58,.18),vec3(.46,.34,.24),blinkAt(t,.21),0.);}}
 // the near wing
 vWing(m,p,0.,dB,G,t);
 PX=px0;}

// ---- The Gobi ----
// A layer of dunes: each crest with a gentle sunlit windward slope on the left and a steep slip face in lilac shadow on the right (its
// brink runs down to the right from the crest), and sand streaming off the crest to the right, lit from behind.
void dunes(vec2 q,float base,float hgt,float W,float seed,vec3 lit,vec3 shd,float plume,float t){
 if(q.y>base+hgt+.07)return;
 float cx=q.x/W+seed;float i=floor(cx),f=fract(cx);
 float hc=hgt*(.55+.45*h11(i+seed*3.1));float pk=.56+.24*h11(i*1.7+seed);
 float y;if(f<pk){float u=f/pk;y=hc*pow(sin(u*PI*.5),1.3);}else{float u=(f-pk)/(1.-pk);y=hc*pow(1.-u,1.25);}
 y+=base+.004*(fbm2(vec2(q.x*9.,seed))-.5);
 float d=q.y-y;
 if(d<PX*4.){
  float yr=q.y-base;float e=sat((hc-yr)/max(hc,.01));float xb=pk*W+hc*(1.1*sin(PI*min(e,1.)*.8)+.15*e)+.004*sin(yr*70.+i*3.);
  float sh=ss(-.002,.002,f*W-xb)*ss(-.003,.003,yr+.004);float hr=sat(yr/max(hc,.01));
  vec3 c=mix(lit*(.86+.18*hr),shd*(1.04-.08*hr),sh);
  c*=1.+.035*(vn(vec2(q.x*40.+q.y*70.,q.y*220.))-.5)*(1.-sh);
  veil(c*(.97+.06*vn(q*vec2(14.,40.)+seed)),cov(d),1.);
  veil(lit*1.1+.05,ss(.005,.0,abs(d+.002))*(1.-sh)*.45,1.);}
 if(plume>0.){float dx=(f-pk)*W,dy=q.y-(base+hc);
  if(dx>-.01&&dx<.32&&abs(dy)<.09){float sp=.004+.09*dx;float a=ss(sp,0.,abs(dy+.10*dx-.003))*ss(-.008,.02,dx)*ss(.32,.04,dx);
   a*=ss(.35,.75,fbm(vec2(dx*16.-t*1.3,dy*50.+i)))*plume*sat(hc/hgt-.2);veil(vec3(1.,.90,.70),a*.6,1.);}}}
// A low dry shrub with small grey-green leaves, its lilac shadow on the sand (to the right, away from the sun).
void shrub(vec2 q,vec2 b,float s,float t,float seed){vec2 l=(q-b)/s;if(abs(l.x-.3)>1.9||l.y<-.3||l.y>1.25)return;
 shadow(ss(1.,.2,length((l-vec2(.85,.02))/vec2(1.25,.14)))*.45,vec3(.66,.56,.78),1.);
 float sw=.04*sin(t*1.7+seed)+.02*sin(t*3.1+seed*2.);
 float tt;float dt=1e5;for(int i=0;i<5;i++){float fi=float(i)-2.;vec2 tip=vec2(fi*.32+sw*(.5+.2*fi),.75+.25*h11(fi+seed));dt=min(dt,sdTube(l,vec2(fi*.05,0.),vec2(fi*.18,.35),tip,.035,.012,tt));}
 PIECE(dt*s,vec3(.36,.28,.22),K_BARK,l*2.,vec2(0,1),.004,.6,1.);
 float dl=1e5;for(int i=0;i<5;i++){float fi=float(i);vec2 c=vec2((fi-2.)*.30+sw*(.6+.1*fi),.62+.22*h11(fi*2.+seed));dl=min(dl,sdEll(l-c,vec2(.30,.20)));}
 dl+=.10*(fbm2(l*7.+seed+vec2(t*.2,0.))-.5);
 vec3 lc=mix(vec3(.40,.44,.30),vec3(.55,.56,.38),ss(.4,1.,l.y));
 PIECE(dl*s,lc,K_PLANT,l*vec2(3.,6.),vec2(0,1),.02*s,.7,1.);}
void gobi(vec2 q,float t){
 SUNL=normalize(vec3(-.62,.48,.38));SUNC=vec3(1.38,1.14,.86);AMBC=vec3(.50,.47,.60);BACK=.35;
 vec2 sp=vec2(-.60,.31);float ds=length(q-sp);
 vec3 sky=mix(vec3(.99,.86,.66),vec3(.44,.60,.84),ss(-.04,.60,q.y));sky=mix(sky,vec3(1.,.94,.78),ss(.60,.0,ds)*.6);
 if(q.y>-.115){
 PIECE(-1.,sky,K_SKY,q+vec2(t*.003,0.),vec2(1,0),.1,0.,1.);
 if(q.y>.05){float cl=fbm(vec2(q.x*1.3-t*.006,q.y*8.+.3))*ss(.10,.30,q.y);veil(vec3(1.,.95,.86),ss(.56,.80,cl)*.40,1.);}
 veil(vec3(1.,.98,.88),ss(.040,.029,ds),1.);veil(vec3(1.,.92,.74),ss(.28,.0,ds)*.32,1.);
 // far mesas of red sandstone, pale with the distance
 if(q.y<.08&&q.y>-.04){float ry=min(ridge(q.x,.0,.07,1.2,4.),.026+.004*vn(vec2(q.x*20.,2.)));veil(vec3(.88,.74,.70)*(.97+.05*vn(q*vec2(30.,60.))),cov(q.y-ry),1.);}
 // two layers of dunes, with haze between
 if(q.y>-.11)dunes(q,-.03,.085,.62,2.,vec3(1.,.80,.60),vec3(.90,.77,.82),.5,t);
 veil(vec3(.99,.87,.70),ss(.05,-.06,q.y+.03)*.20,1.);
 dunes(q,-.104,.15,1.02,7.,vec3(.99,.69,.41),vec3(.80,.63,.72),1.,t);}
 // the flat between the dunes: orange sand with low ripples, seen from a little above
 if(q.y<-.06){float gt=-.100+.005*(fbm2(vec2(q.x*5.,1.))-.5);float dg=q.y-gt;
  float Y=max(.008,-.06-q.y);float z=.12/Y;vec2 g=vec2(q.x*z,z);
  float ph=g.y*300.+g.x*40.+6.*fbm2(g*vec2(.8,1.2))+2.*sin(g.x*3.+g.y*5.);float rp=sin(ph);float lr=ss(1.2,.4,fwidth(ph))*ss(.75,.30,Y);
  vec3 ga=mix(vec3(.98,.70,.44),vec3(.90,.57,.33),ss(-.12,-.55,q.y));
  ga*=1.+.07*(fbm2(vec2(g.x*1.5,g.y*2.))-.5);
  ga=mix(ga,ga*vec3(.90,.86,.96),ss(-.1,-.9,rp)*.6*lr);ga*=1.+.03*ss(.5,1.,rp)*lr;
  PIECE(dg,ga,K_SAND,vec2(q.x,q.y*3.),vec2(1,0),.2,0.,1.);}
 // sparse shrubs
 {vec3 sb=vec3(-.50,-.165,.04);float sd=1.;
  vec3 c2=vec3(-.30,-.122,.022);float e=length((q-c2.xy)/c2.z);float e0=length((q-sb.xy)/sb.z);if(e<e0){sb=c2;e0=e;sd=2.;}
  c2=vec3(.47,-.140,.03);e=length((q-c2.xy)/c2.z);if(e<e0){sb=c2;e0=e;sd=3.;}
  c2=vec3(1.05,-.16,.04);e=length((q-c2.xy)/c2.z);if(e<e0){sb=c2;e0=e;sd=5.;}
  c2=vec3(.84,-.43,.085);e=length((q-c2.xy)/c2.z);if(e<e0){sb=c2;e0=e;sd=4.;}
  shrub(q,sb.xy,sb.z,t,sd);}
}
// Sand that the wind carries low over the ground, glowing against the light.
void drift(vec2 q,float t,float k){if(q.y>-.10||q.y<-.62)return;float y=q.y+.30;
 float a=fbm(vec2(q.x*4.-t*.9,q.y*26.+sin(q.x*3.+t*.5)))*ss(-.24,-.02,-abs(y+.02))*k;veil(vec3(1.,.88,.66),ss(.55,.85,a)*.30,1.);}
// The sand of the bath and of the shake: at each flick of the wings a soft warm plume of sand rises, drifts right with the wind and
// settles; only a few grains catch the light. In the shake, a puff off the body.
void plume(vec2 m,vec2 o,float ag,float life,float k,float t){if(ag<0.||ag>life)return;float u=ag/life;
 vec2 c=o+vec2(.10*ag,.22*(1.-exp(-ag*1.4))-.03*ag*ag);vec2 rr=vec2(.10+.16*u,.07+.10*u);vec2 l=(m-c)/rr;float r=length(l);if(r>1.6)return;
 float n=fbm(m*6.+vec2(-t*.25,-t*.12)+o*7.);float a=ss(1.,.15,r+.5*(n-.5))*ss(.0,.10,u)*ss(1.,.35,u)*k*(.6+.4*n);
 veil(vec3(1.,.90,.72),a,1.);}
void sandBath(vec2 q,VP p,float t){
 vec2 m=(q-V0)/VS;if(m.x<-.8||m.x>1.5||m.y>1.1||t<6.8||t>13.5)return;
 vec2 o=p.hip+R2(vec2(-.08,.02),p.ba);
 for(int j=0;j<3;j++){float tj=7.04+.838*float(j);plume(m,o+vec2(.03*float(j),.04),t-tj,3.,.70,t);
  float ag0=t-tj;if(ag0<0.||ag0>2.2)continue;
  for(int i=0;i<5;i++){float fi=float(i)+float(j)*7.;float ag=ag0-.1*h11(fi*1.9);if(ag<0.)continue;
   float an=1.1+.9*h11(fi*2.3);vec2 v=vec2(cos(an),sin(an))*(.40+.30*h11(fi*3.7));float dr=1.-exp(-ag*1.6);
   vec2 c=o+v*dr/1.6+vec2(.08*ag,-.12*ag*ag);if(c.y<.0)continue;
   float d=length(q-(V0+c*VS));veil(vec3(1.,.92,.74),ss(.0035*VS,.0008*VS,d)*.55*ss(.0,.12,ag)*ss(2.2,1.2,ag),1.);}}
 plume(m,p.hip+vec2(-.12,.10),t-10.3,2.6,.42,t);plume(m,p.hip+vec2(.08,.06),t-10.5,2.4,.30,t);
 // a low haze over the sand around it while it bathes
 float act=ss(7.,7.5,t)*(1.-ss(9.4,10.5,t));if(act>.01){vec2 l=(m-p.hip-vec2(.0,-.08))/vec2(.65,.16);
  float n=fbm(m*5.+vec2(-t*.3,0.));veil(vec3(.96,.82,.62),ss(1.,.2,length(l)+.4*(n-.5))*act*.22,1.);}}
void life(vec2 q,float t){if(outWin(q,.12))return;
 gobi(q,t);
 VP p=vPose(t);
 // the shadow on the sand: lilac, to the right of the feet (the sun is low on the left)
 {vec2 m=(q-V0)/VS;float L=mix(.55,.45,p.bath);vec2 c=vec2(p.hip.x+.22,.0);float e=length((m-c)/vec2(L,.055));
  float tail=sdCap(m,vec2(p.hip.x+.3,.0),vec2(p.tt.x+.15,.01),.03,.012);
  shadow(max(ss(1.,.35,e),ss(.02,-.02,tail)*.7)*.42,vec3(.68,.58,.82),1.);}
 contact(q,V0+p.bN*VS+vec2(-.02,-.004),.05,.55);contact(q,V0+p.bF*VS+vec2(-.02,-.004),.05,.45);
 contact(q,V0+vec2(p.hip.x-.08,.005)*VS,.24*p.bath+.001,.95*p.bath);
 drift(q,t,.8);
 raptor(q,p,t,GROW);
 sandBath(q,p,t);
 drift(q,t+30.,.35);}
void fossil(vec2 q){if(uLife>.001&&!outWin(q,-.12))return;vec2 m=(q-V0)/VS;if(m.x<-.85||m.x>1.32||m.y<-.05||m.y>1.25)return;VP p=vPose(0.);
 float d=vBones(m,p);PIECE(d*VS,vec3(.90,.84,.72),K_FOSSIL,m*3.,vec2(1,0),.004,.8,0.);}

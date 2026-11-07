// ---- Scene 20 (El pou del temps, CE37): Eoraptor lunensis in the valley of Ischigualasto (San Juan, Argentina), Late Triassic, about
// 231 million years ago (Sereno et al., 1993, 2013). Dawn: a lilac haze of volcanic ash, the low sun on the left beside a far volcano with
// a calm plume, badlands of grey-green beds and red cliffs, a river on the valley floor; ferns, horsetails and the seed fern Dicroidium.
// A small light biped (about 1 m) with fine scales, a long tail and grasping hands. 3.8–5.0 s its head peeks out of the ferns and it
// looks round; 5.6–6.4 it crouches and leaps up onto a rock; 7.0–11.0 it stands on the rock and looks out across the valley; then calm.
// Scale: .60 screen units per metre. The animal faces left: its own frame (metres, facing +x) is mirrored onto the screen. ----
const float ES=.60;              // screen units per metre
const vec2 EO=vec2(.02,-.30);    // the animal's world on the screen: screen = EO + (-x, y)·ES
const float RT=.36;              // the top of the rock (m)
const float EX0=-.50,EX1=.42;    // the hip over the ferns, and over the rock (m)
const vec2 WIN_C=vec2(.25,-.18);
// While the window of life opens, the pixels well outside it show only stone: life() skips them, fossil() skips the ones inside.
bool outWin(vec2 q,float mg){if(uLife>=.999)return false;float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))>R+mg;}
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
float gWob(float a,float w,float k){return a<0.?0.:exp(-a*k)*sin(a*w);}
vec2 eW(vec2 q){return vec2(EO.x-q.x,q.y-EO.y)/ES;}   // screen → the animal's world (m)
vec2 eS(vec2 m){return EO+vec2(-m.x,m.y)*ES;}        // the animal's world → screen
// The rock: a block of sandstone on the terrace, its top a little uneven (m, in the animal's world)
float eTop(float x){return RT+.010*sin(x*11.+1.)+.004*sin(x*29.);}
float eStand(float x){return eTop(x)-.018;}   // where the feet stand on the top of the rock (its middle, seen from above)

// ---- The pose at time t (in the animal's world: metres, x forward, y up from the ground under the ferns) ----
struct EP{vec2 hip;float ba;vec2 nb,nc,hd;float ha,yaw;vec2 kN,aN,bN,kF,aF,bF;vec2 sh,e,w,f;vec2 tb,tc,tt;float air,gaze,dp;};
float eAir(float t){return sat((t-5.88)/(6.26-5.88));}
// the body's pitch (front up +): nose down among the ferns, up as it peeks, coiled, launched, level in the air, landing, standing tall
float eBa(float t){float br=.012*sin(t*2.6);
 if(t<5.88){float pk=ss(3.8,4.25,t),cr=ss(5.55,5.82,t),pu=ss(5.78,5.88,t);return mix(mix(mix(-.10,.04,pk),-.20,cr),.22,pu)+br;}
 if(t<6.26){float u=eAir(t);return mix(.22,.04,ss(0.,.55,u))+.12*ss(.55,1.,u);}
 float dp=ss(6.26,6.34,t)*(1.-ss(6.38,6.9,t)),st=ss(6.9,7.6,t);
 return mix(.16,-.16,dp)*(1.-ss(6.5,7.0,t))+.12*st+br*ss(7.,8.,t);}
vec2 eHip(float t){float br=.004*sin(t*2.6);
 if(t<5.88){float pk=ss(3.8,4.25,t),cr=ss(5.55,5.82,t),pu=ss(5.78,5.88,t);
  return vec2(EX0+.03*cr+.03*pu,mix(mix(mix(.20,.22,pk),.15,cr),.28,pu)+br*(1.-pu));}
 if(t<6.26){float u=eAir(t);return vec2(mix(EX0+.06,EX1,u),mix(.28,RT+.27,u)+.17*4.*u*(1.-u));}
 float dp=ss(6.26,6.34,t)*(1.-ss(6.38,6.9,t)),st=ss(6.9,7.6,t);
 return vec2(EX1+.03*ss(6.26,6.6,t),RT+.27-.10*dp+.04*st+br*st);}
EP ePose(float t){EP p;
 p.hip=eHip(t);p.ba=eBa(t);float ba=p.ba;
 float u=eAir(t);p.air=ss(5.86,5.90,t)*(1.-ss(6.24,6.27,t));
 float pk=ss(3.8,4.25,t)*(1.-ss(5.5,5.8,t));      // peeking out of the ferns
 float cr=ss(5.55,5.82,t)*(1.-ss(5.86,5.92,t));   // coiled before the leap
 float onR=step(6.26,t);                            // on the rock
 float dp=ss(6.26,6.34,t)*(1.-ss(6.38,6.9,t));p.dp=dp;   // the landing taken in the knees
 float st=ss(6.9,7.6,t);                            // standing tall on the rock
 p.gaze=ss(7.1,7.9,t);                              // looking out across the valley
 // the neck and the head (the head leads, the body follows)
 p.nb=p.hip+R2(vec2(.265,.035),ba);
 vec2 hr=vec2(.075,-.115)+vec2(.008*sin(t*1.9),.010*sin(t*2.7));float ha=-.80+.10*sin(t*1.9+.5);float yaw=0.;
 // peeking: it lifts its head out of the ferns and looks round: back over its shoulder towards us, up, then at the rock
 float s1=ss(4.22,4.32,t)*(1.-ss(4.56,4.66,t)),s2=ss(4.62,4.72,t)*(1.-ss(4.92,5.02,t)),s3=ss(4.98,5.08,t);
 vec2 hrP=vec2(.06,.155)+vec2(-.012,.010)*s1+vec2(.0,.012)*s2+vec2(.03,-.02)*s3;
 float haP=.02+.08*s1+.30*s2-.12*s3,yawP=-.50*s1+.20*s2;
 hr=mix(hr,hrP,pk);ha=mix(ha,haP,pk);yaw=mix(yaw,yawP,pk);
 // coiled, in the air, landing: the neck forward, the head level, its eyes on the rock
 hr=mix(hr,vec2(.13,.03),cr);ha=mix(ha,-.15,cr);
 float fl=sat(p.air+onR*(1.-st));hr=mix(hr,vec2(.13,.05),fl);ha=mix(ha,-.06,fl);
 hr=mix(hr,vec2(.12,.03),dp);
 // standing on the rock: the neck up, the head turned towards the far valley, small tilts; it follows the plume a little
 // it looks out: first along the valley to the left (the sun, the volcano), then turns its head away from us into the far valley,
 // back to the plume, out again; small tilts of the head; from 11.2 it settles, half turned, calm
 float g1=ss(7.7,8.3,t)*(1.-ss(9.2,9.8,t)),g2=ss(10.1,10.7,t)*(1.-ss(11.2,12.2,t));
 float tl=.07*ss(8.45,8.65,t)*(1.-ss(9.0,9.2,t))+.05*ss(9.6,9.8,t)*(1.-ss(10.0,10.2,t))-.06*ss(10.75,10.95,t)*(1.-ss(11.3,11.5,t));
 vec2 hrS=vec2(.085,.135)+vec2(.006*sin(t*.7),.004*sin(t*1.1))+vec2(-.008,.010)*ss(9.4,9.9,t)*(1.-ss(10.1,10.6,t));
 float haS=.02+tl+.015*sin(t*.6)+.10*ss(9.4,9.9,t)*(1.-ss(10.1,10.6,t))-.04*ss(11.2,12.2,t);
 float yawS=.15*p.gaze+.95*g1+.85*g2+.30*ss(11.4,12.4,t);
 hr=mix(hr,hrS,st);ha=mix(ha,haS,st);yaw=mix(yaw,yawS,st);
 p.hd=p.nb+hr;p.ha=ha;p.yaw=yaw;
 p.nc=mix(p.nb,p.hd,.5)+vec2(-.035,.012)*ss(.0,.15,hr.y)+vec2(.0,.035)*ss(.0,-.10,hr.y);
 // the feet: planted among the ferns; tucked, then reaching forward in the leap; planted on the rock (one small step to settle)
 vec2 bN0=vec2(EX0+.07,0.),bF0=vec2(EX0-.03,0.);
 float fs=ss(6.55,6.80,t),fsl=.03*sin(PI*sat((t-6.55)/.25));
 vec2 bN1=vec2(EX1+.08,eStand(EX1+.08)),bF1=vec2(EX1-.03+.05*fs,eStand(EX1-.03+.05*fs)+fsl);
 vec2 h0=eHip(5.88),h1=eHip(6.26);vec2 tuck=vec2(-.05,-.17);
 vec2 relN=mix(mix(bN0-h0,tuck,ss(0.,.30,u)),bN1-h1,ss(.40,.90,u));
 vec2 relF=mix(mix(bF0-h0,tuck+vec2(-.03,.01),ss(0.,.30,u)),vec2(EX1-.03,eStand(EX1-.03))-h1,ss(.45,.95,u));
 if(t<5.88){p.bN=bN0;p.bF=bF0;}else if(t<6.26){p.bN=p.hip+relN;p.bF=p.hip+relF;}else{p.bN=bN1;p.bF=bF1;}
 // the metatarsus (from the vertical, leaning back): low when crouched, up on its toes to push off, folded in the air
 float th=mix(mix(.85,.60,pk),.95,cr);th=mix(th,.25,ss(5.78,5.88,t));
 if(t>=5.88&&t<6.26)th=mix(mix(.25,1.2,ss(0.,.30,u)),.40,ss(.40,.90,u));
 if(t>=6.26)th=mix(mix(.40,.95,dp),.50,st);
 float thF=th+.5*fsl/.03;
 p.aN=p.bN+.085*vec2(-sin(th),cos(th));p.aF=p.bF+.085*vec2(-sin(thF),cos(thF));
 p.kN=knee(p.hip,p.aN,.15,.16,1.);p.kF=knee(p.hip+vec2(-.01,.005),p.aF,.15,.16,1.);
 // the arms: folded, the hands half closed; up and ready as it peeks; tucked in the leap
 p.sh=p.hip+R2(vec2(.235,-.022),ba);
 vec2 H=vec2(-.012,-.062),U=vec2(.050,-.008),K=vec2(.028,-.030);
 H=mix(H,vec2(.005,-.060),pk);U=mix(U,vec2(.048,.008),pk);K=mix(K,vec2(.030,-.022),pk);
 H=mix(H,vec2(-.030,-.045),p.air);U=mix(U,vec2(.045,.020),p.air);K=mix(K,vec2(.020,-.026),p.air);
 p.e=p.sh+R2(H,ba*.5);p.w=p.e+R2(U,ba*.5);p.f=p.w+R2(K,ba*.5);
 // the long tail balances: it follows the body a little late, swings in the leap and after the landing, sways at rest
 p.tb=p.hip+R2(vec2(-.075,.022),ba);
 float bl=eBa(t-.12);
 float el=.06-.55*bl-.25*ba+.10*cr-.14*(1.-ss(5.5,5.9,t))+.03*sin(t*.9)*(1.-p.air)-.12*gWob(t-6.30,11.,3.2)+.06*gWob(t-5.90,10.,3.);
 float A=PI-el;vec2 td=vec2(cos(A),sin(A)),tn=vec2(-td.y,td.x);
 float sag=.040+.012*sin(t*.9+1.)+.05*gWob(t-6.30,12.,3.5)-.02*p.air;
 p.tc=p.tb+td*.24+tn*sag;p.tt=p.tb+td*.49+tn*(sag*.2+.02*sin(t*1.3+2.));
 return p;}

// ---- The bones (in the rock, and under the growing flesh) ----
float eBones(vec2 m,EP p){float d=1e5;
 {vec2 b0=R2(m-p.hip,-p.ba);float c=sdEll(b0-vec2(.11,-.01),vec2(.20,.10));c=min(c,sdCap(m,p.nb,p.hd,.03,.03));c=min(c,length(m-p.hd-R2(vec2(.06,0.),p.ha))-.08);
  c=min(c,sdCap(m,p.tb,p.tc,.04,.03));c=min(c,sdCap(m,p.tc,p.tt,.03,.02));c=min(c,sdCap(m,p.hip,p.kN,.03,.03));c=min(c,sdCap(m,p.kN,p.aN,.03,.03));c=min(c,sdCap(m,p.aN,p.bN+vec2(.04,0.),.02,.03));
  c=min(c,sdCap(m,p.hip,p.kF,.03,.03));c=min(c,sdCap(m,p.kF,p.aF,.03,.03));c=min(c,sdCap(m,p.aF,p.bF+vec2(.04,0.),.02,.03));c=min(c,sdCap(m,p.sh,p.e,.02,.02));c=min(c,sdCap(m,p.e,p.f,.02,.02));
  if(c>.02)return c-.01;}
 // the skull: light, with its big openings (the nostril, the antorbital opening, the orbit, the temporal opening); the jaw
 vec2 h=R2(m-p.hd,-p.ha);
 float sk=smin(sdEll(h-vec2(.030,.004),vec2(.034,.024)),sdCap(h,vec2(.040,.002),vec2(.116,-.010),.019,.007),.012);
 sk=max(sk,-sdEll(h-vec2(.040,.008),vec2(.011,.011)));sk=max(sk,-sdEll(h-vec2(.070,.000),vec2(.016,.007)));
 sk=max(sk,-sdEll(h-vec2(.104,-.004),vec2(.005,.003)));sk=max(sk,-sdEll(h-vec2(.016,.000),vec2(.007,.009)));
 d=min(d,sk);float jw=sdCap(h,vec2(.012,-.018),vec2(.112,-.016),.0065,.0035);jw=max(jw,-sdEll(h-vec2(.040,-.018),vec2(.012,.0025)));d=min(d,jw);
 // the neck vertebrae
 for(int i=0;i<8;i++){float s0=(float(i)+.08)/8.,s1=(float(i)+.86)/8.;d=min(d,sdCap(m,bez(p.nb,p.nc,p.hd,s0),bez(p.nb,p.nc,p.hd,s1),.0065,.006));}
 vec2 b=R2(m-p.hip,-p.ba);
 if(b.x>-.10&&b.x<.30&&b.y>-.20&&b.y<.08){
  // the back: vertebrae with their spines, the ribs; the pelvis; the shoulder blade
  for(int i=0;i<8;i++){float x=.015+float(i)*.030;vec2 c=vec2(x,.030);d=min(d,sdEll(b-c,vec2(.012,.008)));d=min(d,sdSeg(b,c,c+vec2(-.004,.020))-.0025);}
  for(int i=0;i<7;i++){float x=.06+float(i)*.027;vec2 a=vec2(x,.026);float tt;d=min(d,sdTube(b,a,a+vec2(.02,-.04),vec2(x+.005,-.068+float(i)*.004),.0025,.0018,tt));}
  d=min(d,sdEll(b-vec2(-.005,.020),vec2(.050,.018)));                                    // the ilium
  d=min(d,sdCap(b,vec2(.005,.0),vec2(.050,-.095),.006,.008));d=min(d,sdCap(b,vec2(-.015,.0),vec2(-.050,-.080),.006,.005));   // pubis, ischium
  d=min(d,sdCap(b,vec2(.215,.030),vec2(.245,-.035),.006,.008));}                          // the shoulder blade
 // the arm and the hand: three long clawed fingers, the fourth and fifth small
 d=min(d,sdCap(m,p.sh,p.e,.0055,.005));d=min(d,sdCap(m,p.e,p.w,.004,.0035));
 {vec2 K=p.f-p.w;vec2 kn=normalize(vec2(-K.y,K.x));float tt;
  d=min(d,sdTube(m,p.w,p.w+K*.6+kn*.006,p.f,.003,.0012,tt));d=min(d,sdTube(m,p.w,p.w+K*.5-kn*.002,p.f-kn*.010,.0028,.0012,tt));d=min(d,sdCap(m,p.w,p.w+K*.55+kn*.016,.0026,.0012));}
 // the legs: femur, tibia, metatarsus, the toes
 for(int L=0;L<2;L++){vec2 Kn=L==0?p.kN:p.kF,A=L==0?p.aN:p.aF,B=L==0?p.bN:p.bF;
  d=min(d,sdCap(m,p.hip,Kn,.008,.0065));d=min(d,sdCap(m,Kn,A,.006,.0045));d=min(d,sdCap(m,A,B,.004,.0035));d=min(d,length(m-Kn)-.008);
  d=min(d,sdCap(m,B,B+vec2(.045,-.004),.0028,.0018));d=min(d,sdCap(m,B,B+vec2(.032,.006),.0026,.0016));d=min(d,sdCap(m,B,B+vec2(-.014,.006),.002,.0012));}
 // the tail: its vertebrae, smaller and smaller
 for(int i=0;i<14;i++){float s0=float(i)/14.,s1=s0+.055;d=min(d,sdCap(m,bez(p.tb,p.tc,p.tt,s0),bez(p.tb,p.tc,p.tt,s1),.0075-.0004*float(i),.007-.0004*float(i)));}
 return d;}

// ---- The animal ----
float EDB=-1.,EDF=1e5;   // the bones at this pixel while the flesh grows; the body (for the contours of what lies on it)
// a limb in one piece: the leg (thigh, shank, the slim foot and its toes and claws) and the arm (the hand with its claws); col: its colour
float eLimbs(vec2 m,EP p,bool near,out vec3 col){
 vec2 Kn=near?p.kN:p.kF,A=near?p.aN:p.aF,B=near?p.bN:p.bF;vec2 hp=near?p.hip:p.hip+vec2(-.01,.005);
 float dT=sdEll(R2(m-mix(hp,Kn,.50),-atan(Kn.y-hp.y,Kn.x-hp.x)),vec2(.5*length(Kn-hp)+.030,.040));   // the thigh
 dT=smin(dT,sdCap(m,Kn,A,.022,.011),.015);
 float dF=sdCap(m,A,B,.010,.008);
 vec2 T3=B+vec2(.050,-.004),T2=B+vec2(.036,.004),T4=B+vec2(.040,-.008);
 dF=min(dF,min(sdCap(m,B,T3,.0065,.004),min(sdCap(m,B,T2,.006,.004),sdCap(m,B,T4,.006,.004))));
 dF=min(dF,sdCap(m,B,B+vec2(-.012,.010),.005,.003));
 float cl=min(sdCap(m,T3,T3+vec2(.012,-.004),.0035,.0008),min(sdCap(m,T2,T2+vec2(.011,-.002),.0033,.0008),sdCap(m,T4,T4+vec2(.010,-.006),.0033,.0008)));
 float dA=sdCap(m,p.sh,p.e,.016,.012);dA=smin(dA,sdCap(m,p.e,p.w,.011,.008),.008);
 vec2 K=p.f-p.w;vec2 kn=normalize(vec2(-K.y,K.x));float tt;
 float dH=min(sdTube(m,p.w,p.w+K*.6+kn*.006,p.f,.0065,.003,tt),min(sdTube(m,p.w,p.w+K*.5-kn*.002,p.f-kn*.010,.006,.003,tt),sdCap(m,p.w,p.w+K*.5+kn*.014,.005,.003)));
 vec2 Kd=normalize(K);float hc=min(sdCap(m,p.f,p.f+Kd*.009-kn*.005,.0032,.0007),sdCap(m,p.f-kn*.010,p.f-kn*.010+Kd*.008-kn*.005,.0030,.0007));
 if(!near){vec2 o=R2(vec2(-.012,.010),p.ba);dA=sdCap(m,p.sh+o,p.e+o,.018,.013);dA=smin(dA,sdCap(m,p.e+o,p.w+o,.012,.009),.008);dH=1e5;hc=1e5;}
 float d=min(min(dT,dF),min(dA,min(dH,min(cl,hc))));
 vec3 sk=vec3(.60,.44,.30);
 col=mix(vec3(.52,.40,.30),sk*mix(.85,1.,ss(.0,.10,m.y-Kn.y)),ss(.004,-.004,dT-dF));
 col=mix(col,vec3(.64,.50,.36),cov((min(dA,dH)-min(dT,dF))*ES));
 col=mix(col,vec3(.14,.11,.09),cov(min(cl,hc)*ES));
 return d;}
void eoraptor(vec2 q,EP p,float t,float G){
 vec2 m=eW(q);
 if(m.x<-1.20||m.x>1.25||m.y<-.06||m.y>1.15)return;   // (in the ferns the hip is at -.50 and the tail reaches back to about -1.1)
 bool needB=G<.6;float dB=EDB;
 if(needB&&G<.5)PIECE(dB*ES,vec3(.88,.84,.74),K_BONE,m*30.,vec2(1,0),.004,.8,0.);
 if(needB&&(dB-G*.12)*ES>PX*4.)return;   // the flesh has not grown this far from the bones yet
 // the far legs and arm, darker, behind the body
 {vec3 c;float d=eLimbs(m,p,false,c);if(needB)d=max(d,dB-G*.12);
  if(d<.02)PIECE(d*ES,c*.66,K_SCALE,m*100.,vec2(1,0),.010,1.,0.);}
 // the body, the neck, the tail and the head: one piece of fine scales
 vec2 b=R2(m-p.hip,-p.ba);
 float dTo=sdEll(R2(b-vec2(.110,-.012),-.05),vec2(.155,.066));
 dTo=smin(dTo,sdEll(b-vec2(.205,-.016),vec2(.062,.058)),.03);
 dTo=smin(dTo,sdEll(b-vec2(-.010,.008),vec2(.072,.052)),.03);
 float tn;float dNk=sdTube(m,p.nb,p.nc,p.hd,.034,.021,tn);
 float tq;float dTl=sdTube(m,p.tb,p.tc,p.tt,.042,.0035,tq);
 vec2 h=R2(m-p.hd,-p.ha);float cy=max(cos(p.yaw),.55);vec2 hy=vec2(h.x/cy,h.y);   // turned, the head looks shorter
 float tt;
 float dCr=sdEll(hy-vec2(.028,.004),vec2(.036,.026));
 float dSn=sdTube(hy,vec2(.040,.003),vec2(.080,-.002),vec2(.118,-.010),.020,.0075,tt);
 float dJw=sdCap(hy,vec2(.016,-.017),vec2(.110,-.016),.0115,.0045);
 float dH=smin(smin(dCr,dSn,.016),dJw,.008);
 float d=smin(dTo,dNk,.03);d=smin(d,dTl,.035);d=smin(d,dH,.012);
 if(needB)d=max(d,dB-G*.12);
 EDF=d;
 if(d<.02){
  // colours: a warm ochre-brown back with soft darker bands, paler flanks, a cream belly and throat; a dark stripe through the eye
  // which side: the back (1) or the belly (0), blended where the body, the tail and the neck meet
  float cs=ss(-.050,.040,b.y);
  vec2 tg=normalize(bez(p.tb,p.tc,p.tt,min(tq+.02,1.))-bez(p.tb,p.tc,p.tt,max(tq-.02,0.)));
  float csT=ss(-.65,.45,dot(m-bez(p.tb,p.tc,p.tt,tq),vec2(-tg.y,tg.x))*sign(-tg.x+1e-4)/mix(.042,.0035,tq));
  cs=mix(cs,csT,ss(.025,-.025,dTl-dTo));
  vec2 nT=normalize(bez(p.nb,p.nc,p.hd,min(tn+.02,1.))-bez(p.nb,p.nc,p.hd,max(tn-.02,0.)));
  float csN=ss(-.55,.45,dot(m-bez(p.nb,p.nc,p.hd,tn),vec2(-nT.y,nT.x))/mix(.034,.021,tn));
  cs=mix(cs,csN,ss(.02,-.02,dNk-dTo));
  cs=mix(cs,ss(-.012,.006,hy.y),ss(.008,-.008,dH-min(dNk,dTo)));
  vec3 alb=mix(vec3(.86,.78,.62),vec3(.72,.56,.38),ss(.0,.45,cs));alb=mix(alb,vec3(.55,.39,.25),ss(.45,1.,cs));
  // the soft bands across the back and the tail (low contrast)
  float al=dTl<dTo?-.08-tq*.52:b.x;
  alb*=1.-.16*ss(.25,.75,sin(al*36.+1.))*ss(.35,.8,cs)*ss(.36,.10,al)*(dH<min(dNk,dTo)?0.:1.);
  alb*=.94+.10*fbm2(m*vec2(40.,50.));
  // the head: a reddish snout, the dark stripe through the eye, the pale jaw; the mouth closed (lips over the teeth), the nostril
  if(dH<.02){float hw=ss(.008,-.004,dH-min(dNk,dTo)+.006);
   vec3 hc=mix(vec3(.84,.74,.58),vec3(.62,.44,.30),ss(-.010,.004,hy.y));hc=mix(hc,vec3(.66,.38,.26),ss(.07,.11,hy.x)*ss(-.006,.004,hy.y)*.5);
   hc=mix(hc,vec3(.30,.22,.17),ss(.005,.0,abs(hy.y-.007+.06*(hy.x-.04)))*ss(.00,.025,hy.x)*ss(.10,.06,hy.x)*.65);
   float PXm=PX/ES;
   float ml=abs(hy.y+.0105+.03*(hy.x-.06)*(hy.x-.06)*10.)-.0007;ml=max(ml,abs(hy.x-.068)-.048);
   hc=mix(hc,vec3(.22,.15,.11),ss(PXm*1.2,0.,ml)*step(.3,G));
   hc=mix(hc,vec3(.10,.07,.06),ss(PXm,-PXm,sdEll(hy-vec2(.108,-.002),vec2(.005,.0028)))*step(.3,G));
   alb=mix(alb,hc,hw);}
  vec2 dd=R2(vec2(-1.,0.),p.ba);vec2 uu=m*100.;
  if(dH<min(dNk,dTo)){uu=h*140.;}
  PIECE(d*ES,alb,K_SCALE,uu,dd,.040,1.,0.);
  // the eye: big, amber; turned, it moves along the head
  if(G>.3){vec2 ec=p.hd+R2(vec2(.040*cy+.010*sin(p.yaw),.009),p.ha);
   shadow(ss(.016,.0,length(hy-vec2(.040,.011)))*.22,vec3(.5,.4,.35),0.);
   eyeA(q,eS(ec),.0105*ES,vec3(.80,.58,.22),vec3(.50,.36,.26),blinkAt(t,.27),0.);}}
 // the near leg and arm
 {vec3 c;float dl=eLimbs(m,p,true,c);if(needB)dl=max(dl,dB-G*.12);
  if(dl<.02){float line=ss(-.02,.03,EDF);line=max(line,ss(.0,-.10,m.y-p.kN.y));
   PIECE(dl*ES,c,K_SCALE,m*100.,vec2(1,0),.016,line,0.);}}}

// ---- The valley of Ischigualasto at dawn ----
const float EH=.075;   // the horizon (screen)
vec3 hazeC(float y){return mix(vec3(.96,.80,.72),vec3(.80,.70,.84),ss(EH-.10,EH+.12,y));}   // the colour of the ash haze low in the sky
void eSky(vec2 q,float t){
 vec3 top=vec3(.36,.37,.64),mid=vec3(.70,.60,.78),hor=vec3(.99,.81,.66);
 vec3 c=mix(hor,mid,ss(EH-.02,EH+.24,q.y));c=mix(c,top,ss(EH+.20,EH+.90,q.y));
 // the dawn glow round the sun, low on the left
 float ds=length((q-vec2(-.80,EH+.045))*vec2(1.,1.5));c=mix(c,vec3(1.,.88,.66),.60*exp(-ds*3.4));
 PIECE(-1.,c,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
 if(uDecor>1.5)return;
 // the sun, pale through the ash, just risen
 sunDisc(q,vec2(-.80,EH+.045),.026,vec3(1.,.80,.55),.55);
 // long bands of volcanic ash, lit pink from below, drifting very slowly
 if(q.y>EH+.05){float n=fbm(vec2((q.x-t*.004)*1.3,q.y*8.)+vec2(3.,0.));float a=ss(.50,.76,n)*ss(EH+.05,EH+.20,q.y)*(1.-ss(.55,1.2,q.y));
  veil(mix(vec3(1.,.78,.70),vec3(.78,.66,.84),ss(EH+.1,EH+.45,q.y)),a*.42,1.);}}
// the far volcano on the left and its plume
void eVolcano(vec2 q,float t){
 if(uDecor>1.5)return;
 vec2 V=vec2(-.62,EH+.170);   // the crater
 float x=q.x-V.x;float hgt=V.y-EH;
 if(abs(x)<.52&&q.y<V.y+.01){float prof=V.y-hgt*pow(sat((abs(x)-.020)/.46),.70)+.004*(fbm2(vec2(q.x*30.,2.))-.5);float d=q.y-prof;
  vec3 c=mix(vec3(.60,.53,.72),vec3(.90,.70,.66),ss(.05,-.08,x)*.60);   // lit on the sun's side
  c*=.93+.09*ss(.0,.4,abs(fract(x*13.+q.y*5.)-.5))*ss(-.08,.0,q.y-V.y);  // gullies down the cone
  veil(mix(c,hazeC(q.y),.30+.35*ss(V.y-.04,EH,q.y)),cov(d),1.);}
 // the plume: a calm column of steam and ash that rises, bends and drifts to the right, widening; lit pink from below, slowly churning
 if(q.y>V.y-.02&&q.y<V.y+.30&&q.x>V.x-.12&&q.x<V.x+.95){
  vec2 C=V+vec2(.015,.17),E=V+vec2(.80,.15+.01*sin(t*.05));float tt;float dP=sdTube(q,V,C,E,.012,.11,tt);
  float rad=mix(.012,.11,tt);float r=dP/rad+1.;
  if(r<1.6){float n=fbm(vec2((q.x-t*.006)*8.,(q.y-t*.002)*10.)-vec2(tt*2.,0.));
   vec2 cp=bez(V,C,E,tt);float a=ss(1.25,.35,r+.55*(n-.5))*ss(1.,.40,tt)*ss(-.002,.012,q.y-V.y);
   float lit=ss(.5,-.9,(q.y-cp.y)/rad+(1.-tt)*.6*(q.x-cp.x)/rad);
   veil(mix(vec3(.64,.58,.76),vec3(1.,.82,.74),lit*.85),a*.85,1.);}}}
// the floor of the valley seen from the terrace: (screen) → (across, depth)
vec2 eFloor(vec2 q){float z=1./max(EH-q.y,.004);return vec2(q.x*z,z);}
// rounded badland domes: the height of a row of them at x (cells of width 1/fr)
float eDomes(float x,float fr,float sd){float xc=x*fr,i0=floor(xc),hm=0.;
 for(int k=-1;k<=1;k++){float i=i0+float(k);float c=i+.5+.30*(h11(i+sd)-.5),r=.55+.35*h11(i*1.7+sd),hh=.35+.65*h11(i*2.9+sd);
  float e=(xc-c)/r;hm=max(hm,hh*sqrt(max(1.-e*e,0.))*(1.-.15*e*e));}
 return hm;}
// a butte or a mesa out on the plain: banded, lit on the left
void eButte(vec2 q,vec2 b,float w,float h,float red){
 vec2 l=(q-b)/vec2(w,h);if(abs(l.x)>1.2||l.y<0.||l.y>1.1)return;
 float top=1.-.10*l.x*l.x-.06*sin(l.x*9.)*step(.5,red);float side=1.-pow(abs(l.x),3.)*.9;float prof=min(top,side*1.6)*ss(1.08,.80,abs(l.x));
 float d=(l.y-prof)*h;
 float bed=sin(l.y*14.+1.5*sin(l.x*3.));
 vec3 c=mix(mix(vec3(.62,.66,.58),vec3(.78,.76,.70),.5+.4*bed),mix(vec3(.74,.42,.32),vec3(.84,.58,.44),.5+.4*bed),red);
 c*=mix(1.10,.82,ss(-.4,.5,l.x));
 veil(mix(c,hazeC(q.y),.35),cov(d),1.);}
// the far ranges, the red cliffs, the grey-green badlands, the plain of the valley and its river
void eValley(vec2 q,float t){
 if(uDecor>1.5||q.y>EH+.20)return;
 // the far range (the Valle Fértil), violet in the haze
 float h0=EH+.030+.030*(fbm2(vec2(q.x*1.5+5.,1.))-.5)+.014*sin(q.x*1.2+.5);
 veil(mix(vec3(.62,.54,.72),hazeC(q.y),.40),cov(q.y-h0),1.);
 // the red cliffs (the Los Colorados beds): a long wall across the right with mesas on top, in beds; buttresses lit from the left
 {float x=q.x;float top=EH+.022+.060*ss(-.40,.55,x)+.016*ss(.45,.55,fract(x*2.3+.2))*ss(.95,.85,fract(x*2.3+.2))+.004*(vn(vec2(x*40.,1.))-.5);
  if(q.y<top+.01&&x>-.50){float yb=q.y+.004*sin(x*20.);float bed=sin(yb*190.);
   vec3 c=mix(vec3(.70,.38,.32),vec3(.82,.52,.40),.5+.30*bed);
   c=mix(c,vec3(.82,.70,.60),ss(.85,.97,sin(yb*80.+1.))*.40);                  // a pale bed or two
   float bx=fract(x*9.+.6*fbm2(vec2(x*4.,q.y*20.)));c*=mix(1.05,.88,ss(.35,.75,bx));   // buttresses lit from the left, soft clefts
   c=mix(c,vec3(1.,.74,.56),ss(top-.008,top,q.y)*.40);
   veil(mix(c,hazeC(q.y),.30+.30*ss(.4,-.5,x)),cov(q.y-top)*ss(-.50,-.30,x),1.);}}
 // the grey-green badlands of the Ischigualasto beyond the plain: rounded domes in pale beds, lit on their left flanks
 {float x=q.x;float hm=.65*eDomes(x,3.4,3.)+.35*fbm2(vec2(x*6.,2.)),top=EH-.050+.075*hm+.003*sin(x*30.);
  if(q.y<top+.01){float dh=.65*eDomes(x+.004,3.4,3.)+.35*fbm2(vec2((x+.004)*6.,2.))-hm;float bed=sin((q.y-.3*dh)*170.+1.5*fbm2(vec2(x*4.,1.)));
   vec3 c=mix(vec3(.63,.67,.59),vec3(.76,.76,.70),.5+.25*bed);c=mix(c,vec3(.66,.56,.62),ss(.6,.9,sin(q.y*90.+2.))*.35);
   c*=mix(1.08,.80,ss(-.025,.025,dh));                                          // the slopes facing the sun lit, the others lilac
   c=mix(c,vec3(.78,.50,.42),ss(top-.020,top-.012,q.y)*step(.6,h11(floor(x*3.4)+1.))*.6);   // a red cap on some
   c=mix(c,vec3(.98,.82,.72),ss(top-.005,top,q.y)*.30);
   veil(mix(c,hazeC(q.y),.16),cov(q.y-top),1.);}}
 // the plain: flats and sandbars stretched by the distance, a river winding across it with the dawn sky on it, groves; buttes;
 // mist low over it
 {float top=EH-.052+.003*sin(q.x*5.);
  if(q.y<top+.01){vec2 f=eFloor(q);float k=sat((top-q.y)/.25);
   vec3 c=mix(vec3(.76,.66,.58),vec3(.70,.58,.46),k);
   c*=.95+.08*vn(vec2(f.x*.9,f.y*2.4));                                          // flats and bars, long across
   float rx=.9-7.4*(f.y-4.)/11.+.55*sin(f.y*.9+.5);float rw=.20;float dr=abs(f.x-rx)-rw;
   float veg=ss(.45,.75,fbm2(vec2(f.x*.35,f.y*.9)+4.));veg=max(veg,ss(1.2,.2,dr)*.9);  // green along the river and in broad patches
   c=mix(c,mix(vec3(.50,.54,.38),vec3(.40,.46,.32),ss(.6,1.,veg)),veg*.75);
   float px=PX*f.y*f.y*1.5;
   c=mix(c,vec3(.80,.72,.60),ss(.12,.02,dr)*.5);                               // sandbars along it
   c=mix(c,vec3(.36,.34,.30),ss(px*3.,0.,abs(dr+px*2.))*.35);                  // the bank
   c=mix(c,mix(vec3(.66,.66,.88),vec3(.88,.78,.86),ss(5.,15.,f.y))*(.94+.08*vn(vec2(f.x*6.,f.y*20.))),ss(px,-px,dr)*.92);   // the water, with the sky on it
   // groves of small trees near the river: dark dots, smaller far away
   {vec2 g=vec2(f.x*2.2,f.y*1.1);vec2 id=floor(g),fr=fract(g)-.5;float hh=h21(id+7.);
    vec2 o=(fr-(h22(id)-.5)*.5)*vec2(1.,1.8);float e=length(o)-.30*hh;float on=ss(.05,-.05,e)*step(.70-.25*veg,hh)*step(.0,dr-.04);
    c=mix(c,mix(vec3(.28,.34,.25),vec3(.46,.50,.32),ss(.0,-.25,o.x+o.y*.6)),on*.85);}
   veil(mix(c,hazeC(q.y),.15+.35*ss(6.,17.,f.y)),cov(q.y-top),1.);
   eButte(q,vec2(.22,-.040),.050,.040,1.);eButte(q,vec2(.47,-.012),.040,.022,0.);eButte(q,vec2(-.70,-.030),.090,.032,0.);
   veil(vec3(.96,.88,.88),(.14+.16*fbm2(vec2(q.x*3.-t*.01,q.y*20.)))*ss(.04,.0,top-q.y),1.);}}}
// the terrace in front: grey-ochre silt and sand, pebbles, its edge over the valley lit by the dawn
float eEdge(float x){return -.19+.012*sin(x*3.+1.)+.008*(fbm2(vec2(x*10.,7.))-.5);}
void eGround(vec2 q,float t){
 float ye=eEdge(q.x);float d=q.y-ye;if(d>PX*4.)return;
 float k=sat((ye-q.y)/.32);   // how near
 vec3 c=mix(vec3(.72,.62,.52),vec3(.58,.49,.40),ss(.0,1.,k));
 c*=.90+.14*fbm2(q*vec2(8.,20.));
 float mp=ss(.50,.75,fbm2(q*vec2(4.,11.)+4.));c=mix(c,vec3(.56,.55,.47),mp*.40);   // grey-green patches of mudstone
 if(mp>.05){vec2 cid;vec3 v=voro(vec2(q.x*7.,q.y*17.)/(.35+k),cid);c*=1.-.22*ss(.06,.0,v.y-v.x)*mp;}   // dried and cracked
 c=mix(c,vec3(1.,.82,.64),ss(.012,.0,abs(q.y-ye+.004))*.40);           // the edge catching the dawn
 // pebbles, larger nearer
 {vec2 g=vec2(q.x*(26./(.4+k)),q.y*(70./(.4+k)));vec2 id=floor(g),f=fract(g)-.5;float hh=h21(id);
  float e=length((f-(h22(id)-.5)*.4)*vec2(1.,1.6))-.18*hh;c=mix(c,c*vec3(.72,.66,.62),ss(.03,-.03,e)*step(.78,hh)*.8);}
 PIECE(d,c,K_SAND,q*vec2(4.,10.),vec2(1,0),.03,.0,1.);
 // the long shadow of the rock, to the right on the sand (the sun low on the left)
 if(q.x>-.10&&q.x<.45&&q.y>-.36&&q.y<-.27)shadow(ss(1.,.3,length((q-vec2(.14,-.305))/vec2(.24,.022)))*.35,vec3(.62,.58,.78),1.);}

// ---- Plants: ferns, horsetails, the seed fern Dicroidium ----
float eFern(vec2 q,vec2 b,float ang,float len,float bend){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;
 float w=.34*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012);return max(d,max(-l.y,l.y-len));}
// clumps of ferns: the nearest frond of the clumps here. front: the clumps in front of the animal (else those behind)
void eFerns(vec2 q,float t,bool front){
 if(uDecor>1.5)return;
 float d=1e5,id=0.;
 for(int c=0;c<7;c++){if(!front&&c>4)break;vec3 C=front?(c==0?vec3(.07,-.37,.25):c==1?vec3(.33,-.40,.19):c==2?vec3(.52,-.37,.25):c==3?vec3(.70,-.36,.20):c==4?vec3(-.74,-.43,.18):c==5?vec3(-.22,-.46,.09):vec3(.86,-.47,.10))
                                  :(c==0?vec3(.19,-.31,.21):c==1?vec3(.42,-.315,.22):c==2?vec3(.62,-.32,.19):c==3?vec3(-.02,-.305,.13):vec3(-.60,-.27,.10));
  if(abs(q.x-C.x)>C.z*1.05||q.y<C.y-.02||q.y>C.y+C.z*1.08)continue;
  float sd=float(c)*3.7+(front?1.:7.);
  // the clumps by the animal: they part a little as its head comes up, and swing back and forth after the leap
  float nr=ss(.30,.08,abs(C.x-.24));float kick=nr*(.05*gWob(t-3.82,8.,3.5)+.10*gWob(t-5.80,9.,2.8)+.03*ss(5.5,5.8,t)*(1.-ss(5.8,5.9,t)));
  for(int i=0;i<7;i++){float fi=float(i);float ang=(-1.15+2.3*fi/6.)+.05*sin(t*.9+fi+sd)+.025*sin(t*1.7+fi*2.)+kick*(fi<3.?-1.:1.)*(.6+.4*h11(fi+sd));
   float len=C.z*(.78+.32*h11(fi+sd));float e=eFern(q,C.xy,ang,len,.33*sign(ang));if(e<d){d=e;id=fi+sd;}}}
 if(d>PX*4.)return;
 vec3 col=mix(vec3(.30,.43,.20),vec3(.50,.50,.24),step(.82,h11(id*2.1)))*(.82+.3*h11(id*3.));
 PIECE(d,col*(front?.92:.78),K_PLANT,q*vec2(60.,140.),vec2(0,1),.004,.5,1.);}
// horsetails (Neocalamites): clumps of straight jointed stems with whorls of thin leaves at the joints and a small cone at the tip
void eHorsetails(vec2 q,float t){
 if(uDecor>1.5)return;
 float d=1e5,dn=1e5,dl=1e5;
 for(int c=0;c<2;c++){vec2 B=c==0?vec2(.80,-.39):vec2(-.82,-.47);float h=c==0?.36:.46;
  vec2 l=(q-B)/h;if(abs(l.x)>.55||l.y<-.02||l.y>1.08)continue;
  for(int i=0;i<8;i++){float fi=float(i)+float(c)*9.;float x0=(h11(fi)-.5)*.75;float ht=.50+.50*h11(fi*1.9);float lean=(h11(fi*3.1)-.5)*.22+.010*sin(t*.8+fi);
   float y=l.y;float x=l.x-x0-lean*y;if(abs(x)>.14)continue;
   float e=max(abs(x)-.011*(1.-.35*y/ht),max(-y,y-ht));d=min(d,e*h);
   dn=min(dn,max(abs(x)-.016,abs(fract(y*11.)-.5)-.47)*h+(y>ht||y<.05?1.:0.));   // the joints
   dn=min(dn,sdEll(vec2(x,y-ht-.03),vec2(.016,.040))*h);                          // the cone
   // the whorl of thin leaves at the joint below, slanting up
   float j=floor(y*11.)/11.;if(j>.12&&j<ht-.04){float L=.05+.07*(1.-j/ht);
    for(int s=0;s<2;s++){float sg=s==0?-1.:1.;dl=min(dl,(sdSeg(vec2(x,y),vec2(0.,j),vec2(sg*L,j+.55*L))-.0045)*h);}}}}
 float dd=min(d,min(dn,dl));if(dd>PX*4.)return;
 vec3 col=mix(vec3(.46,.52,.30),vec3(.38,.46,.26),cov(d));col=mix(col,vec3(.26,.30,.18),cov(dn)*.8);
 PIECE(dd,col,K_PLANT,q*vec2(80.,30.),vec2(0,1),.004,.45,1.);}
// Dicroidium: a seed fern tree whose fronds fork in two, with small rounded leaflets; it stands behind the ferns on the right
float eFork(vec2 q,vec2 b,float ang,float len){
 // the stalk, then two arching arms with leaflets
 vec2 f=b+vec2(sin(ang),cos(ang))*len*.28;float d=sdSeg(q,b,f)-.0018;
 for(int k=0;k<2;k++){float a=ang+(k==0?-.45:.45);vec2 dir=vec2(sin(a),cos(a));vec2 l=q-f;float L=len*.72;
  float al=dot(l,dir),ac=dot(l,vec2(-dir.y,dir.x));float x=al/L;ac+=.16*L*x*x*sign(dir.x+1e-3);   // the arm droops outward
  float w=.15*L*(1.-.55*x);float pr=fract(x*10.);float pin=length(vec2((pr-.5)*L/10.,max(abs(ac)-w*.55,0.)))-w*.45;   // rounded leaflets
  float e=min(pin,abs(ac)-.0012);e=max(e,max(-al,al-L));d=min(d,e);}
 return d;}
void eDicroidium(vec2 q,float t){
 if(uDecor>1.5)return;
 vec2 B=vec2(.70,-.31);if(abs(q.x-B.x)>.36||q.y<B.y-.02||q.y>.42)return;
 // the trunk and its branches
 float sw=.005*sin(t*.7);vec2 T=B+vec2(.012,.36);
 float d=sdCap(q,B,T,.017,.010);
 vec2 b1=T+vec2(-.13,.13+sw),b2=T+vec2(.15,.10+sw),b3=T+vec2(.01,.20+sw),b4=B+vec2(.004,.24);vec2 b4e=b4+vec2(-.16,.06+sw);
 d=min(d,min(sdCap(q,T,b1,.009,.004),min(sdCap(q,T,b2,.009,.004),min(sdCap(q,T,b3,.008,.004),sdCap(q,b4,b4e,.007,.003)))));
 float dF=1e5;
 for(int i=0;i<14;i++){float fi=float(i);float s=.55+.45*h11(fi*5.3);
  vec2 o=i<4?mix(T,b1,s):i<8?mix(T,b2,s):i<11?mix(T,b3,s):mix(b4,b4e,s);
  if(length(q-o)>.20)continue;
  float side=i<4?-1.:i<8?1.:i<11?(h11(fi)-.5)*2.:-1.;
  float a=side*(.5+.9*h11(fi*1.7))+.04*sin(t*.9+fi);float len=.12+.06*h11(fi*2.3);
  dF=min(dF,eFork(q,o,a,len));}
 float dA=min(d,dF);if(dA>PX*4.)return;
 vec3 c=dF<d?mix(vec3(.28,.40,.22),vec3(.42,.48,.24),step(.7,vn(q*30.)))*(.85+.25*vn(q*60.)):vec3(.38,.31,.26);
 PIECE(dA,c,K_PLANT,q*vec2(60.,140.),vec2(0,1),.006,.45,1.);}
// the rock: a weathered block of red and buff sandstone in beds of uneven thickness, a few standing out a little; its top lit, the face
// to the sun warm, the other in lilac shade, cracks and joints, darker at its foot
float eBed(vec2 m){float y=m.y*11.+.45*m.x+.10*sin(m.x*4.+1.)+.20*fbm2(m*vec2(2.,6.));return y+.25*sin(y*1.7);}
float eLay(vec2 m){float b=eBed(m),f=fract(b),i=floor(b);return (.005+.007*h11(i*3.7))*(ss(.0,.20,f)-.6);}
float rockD(vec2 m){float top=eTop(m.x);
 float dR=dot(m-vec2(.10,0.),normalize(vec2(-.36,.10)))-eLay(m),dL=dot(m-vec2(.88,0.),normalize(vec2(.36,.13)))-eLay(m+vec2(0.,.03));
 float d=smax(m.y-top,smax(dR,dL,.012),.014);
 d=smax(d,dot(m-vec2(.235,RT-.035),normalize(vec2(-.6,.8))),.012);           // the corner broken off on the right
 d=smax(d,-sdEll(m-vec2(.66,RT+.012),vec2(.040,.022)),.008);                  // a chip out of the top edge
 d+=.004*(fbm2(m*vec2(9.,14.))-.5);
 return max(d,-m.y-.03);}
void eRock(vec2 q,float t,EP p){
 vec2 m=eW(q);if(m.x<.0||m.x>.98||m.y>RT+.04||m.y<-.05)return;
 float d=rockD(m);if(d*ES>PX*4.)return;
 float dR=-(dot(m-vec2(.10,0.),normalize(vec2(-.36,.10)))-eLay(m)),dL=-(dot(m-vec2(.88,0.),normalize(vec2(.36,.13)))-eLay(m+vec2(0.,.03)));
 float b=eBed(m),f=fract(b),bi=floor(b);float hb=h11(bi*2.3+1.);
 // beds of red-brown, buff and pale grey sandstone; fine cross-bedding inside them
 vec3 c=hb<.40?vec3(.62,.44,.36):hb<.75?vec3(.68,.55,.45):vec3(.66,.60,.53);
 c*=.92+.12*fbm2(m*vec2(4.,22.));c*=1.+.05*sin((m.x*.7+f*.25*sign(hb-.5))*70.)*ss(.15,.35,f)*ss(.95,.75,f);
 c=mix(c,c*vec3(1.06,.90,.84),ss(.5,.8,fbm2(m*7.+3.))*.45);       // iron stains
 // relief: a dark undercut under a bed that stands out, a lit lip just above
 float out_=step(.35,h11(bi*5.3))*ss(.35,.6,vn(vec2(m.x*5.,bi*1.3)));
 c*=1.-.30*ss(.06,.0,f)*out_;c*=1.+.12*ss(.04,.08,f)*ss(.14,.08,f)*out_;
 float yF=eTop(m.x)-.046-.006*sin(m.x*7.);float top=ss(-.003,.003,m.y-yF);
 // the face towards us and the sun, the face to the right in lilac shade (we see it: the rock stands left of us), the top
 float shd=ss(.125,.117,dR+.03*(m.y/RT));
 c=mix(c,c*vec3(1.10,1.02,.92),ss(.03,.01,dL)*(1.-top));         // the sunlit rim on the left
 c=mix(c,c*vec3(.60,.58,.78),shd*(1.-top));
 c=mix(c,vec3(.68,.58,.50)*(.90+.14*fbm2(m*vec2(4.,14.))),top);  // the top, in the light of the sky
 c=mix(c,c*1.18,ss(.006,.0,abs(m.y-yF-.004))*.7*(1.-shd));      // its front edge catching the light
 c=mix(c,c*.62,ss(.006,.0,abs(m.y-yF+.006))*.6);                 // and the shadow just under it
 c=mix(c,c*.70,ss(.007,.0,abs(dR+.03*(m.y/RT)-.12))*(1.-top)*.6);  // the edge between the two faces
 c*=1.-.12*ss(.2,.8,vn(vec2(m.x*30.,m.y*3.)))*ss(yF-.12,yF,m.y)*(1.-top);   // dark streaks run down from the top
 // two fractures across the face, each with a lit lip
 {vec2 w=m+vec2(.010*sin(m.y*40.),0.);float f1=sdSeg(w,vec2(.40,-.01),vec2(.47,.20)),f2=sdSeg(w,vec2(.72,.05),vec2(.64,yF+.002));
  float fr=min(f1,f2);c*=1.-.45*ss(.006,.002,fr)*(1.-top);c*=1.+.10*ss(.012,.006,fr)*step(.004,w.x-.0)*(1.-top);}
 c*=mix(.74,1.,ss(.0,.10,m.y));                         // sand and damp at its foot
 PIECE(d*ES,c,K_ROCK,m*vec2(6.,9.),vec2(1,0),.010,.45,1.);}

void life(vec2 q,float t){if(outWin(q,.12))return;
 SUNL=normalize(vec3(-.80,.26,.50));SUNC=vec3(1.30,1.00,.82);AMBC=vec3(.52,.50,.64);BACK=.22;
 EP p=ePose(t);
 if(q.y>eEdge(q.x)-.01){eSky(q,t);eVolcano(q,t);eValley(q,t);}
 eGround(q,t);
 eDicroidium(q,t);
 eHorsetails(q,t);
 eFerns(q,t,false);
 eRock(q,t,p);
 // the animal's soft shadows: under its feet, and its long shadow on the rock or among the ferns (the sun low on the left)
 {vec2 m=eW(q);
  if(p.air<.5){contact(q,eS(p.bN)+vec2(0.,-.004),.035,.30);contact(q,eS(p.bF)+vec2(0.,-.004),.035,.22);}
  else{float yg=t<6.1?0.:eTop(p.hip.x);float hgt=p.hip.y-yg;contact(q,eS(vec2(p.hip.x+.05,yg)),.10/(1.+hgt*3.),.25/(1.+hgt*4.));}
  if(t>6.2&&abs(m.x-p.hip.x+.25)<.40&&m.y>RT-.07&&m.y<RT+.03){float e=m.y-eTop(m.x);float onTop=ss(-.044,-.036,e)*ss(.002,-.004,e);
   shadow(ss(1.,.35,length((m-vec2(p.hip.x-.24,eTop(m.x)-.020))/vec2(.30,.018)))*onTop*.32*ss(6.25,6.45,t),vec3(.62,.56,.80),1.);}}
 EDB=GROW<.6?eBones(eW(q),p):-1.;
 eoraptor(q,p,t,GROW);
 eFerns(q,t,true);}
void fossil(vec2 q){if(uLife>.001&&!outWin(q,-.12))return;EP p=ePose(0.);vec2 m=eW(q);if(m.x<-1.20||m.x>.30||m.y<-.06||m.y>.50)return;
 float d=eBones(m,p)-.0015;
 PIECE(d*ES,vec3(.86,.80,.70),K_FOSSIL,m*30.,vec2(1,0),.004,.8,0.);}

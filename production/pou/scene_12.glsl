// ---- Scene 13 (El pou del temps, CE37): Spinosaurus aegyptiacus wading in a river of the Kem Kem (south-east Morocco, Cenomanian,
// about 95 million years ago). Late morning: the sun comes through the leaves of the gallery forest and dapples the green-brown water
// and the animal. Story: it stands in the river, the water at its thighs, peering at the water; 2.5–8.0 s it wades slowly to the right
// (rings at each step, a bow wave at its chest, a wake behind; its head held still like a heron's while the body moves on under it);
// 4.7–7.1 s it raises its head and its sail flushes a dull red (a display, with a low closed-mouth hum 5.6–7.0 s); 8.2–9.4 s it lowers
// its snout to the river and drinks; small fish dart away (5.5 s from its chest, 9.5 s from its snout; it never catches any); 9.4–10.4 s
// it shakes the water off its head, spray flying. Then calm: drips, rings, breathing, the dappled light moving. .112 screen units per
// metre (about 14 m long, the tail turning a little away from us). ----
const float SW=-.14;       // the river's surface where the animal stands (screen y)
const float SS=.112;       // screen units per metre
const float SBK=.075;      // the far bank's waterline: the river's horizon
const float HIPW=.95;      // the hip above the water (metres)
const float HS=1.15;       // the head drawn a little larger than life, so that it reads at this size
const float SNL=1.15;      // the tip of the snout in the head frame
const vec2 SPK0=vec2(2.42,.26);                       // the base of the neck (body frame, metres from the hip: x forward, y up)
const vec2 HB_DRINK=vec2(4.20,.02);const float HA_DRINK=-.86; // the head while it drinks
vec2 spH,spHB,spK1,spKm,spK2;float spT,spWk,spPh,spFl,spThr,spHA,spTs,spBr,spWL,spNA,spFA,spRl,spSh;
float spTube(vec2 pos,vec2 A,vec2 B,vec2 C,float ra,float rb,out float tt){B+=vec2(1e-4,-1e-4);
 vec2 a=B-A,b=A-2.*B+C,c=a*2.,d=A-pos;float kk=1./dot(b,b),kx=kk*dot(a,b),ky=kk*(2.*dot(a,a)+dot(d,b))/3.,kz=kk*dot(d,a);
 float p=ky-kx*kx,p3=p*p*p,q=kx*(2.*kx*kx-3.*ky)+kz,h=q*q+4.*p3,res;
 if(h>=0.){h=sqrt(h);vec2 x=(vec2(h,-h)-q)/2.;vec2 uv=sign(x)*pow(abs(x),vec2(1./3.));tt=sat(uv.x+uv.y-kx);vec2 e=d+(c+b*tt)*tt;res=dot(e,e);}
 else{float z=sqrt(-p),v=acos(q/(p*z*2.))/3.,m=cos(v),n=sin(v)*1.732050808;vec3 t3=clamp(vec3(m+m,-n-m,n-m)*z-kx,0.,1.);
  vec2 e1=d+(c+b*t3.x)*t3.x,e2=d+(c+b*t3.y)*t3.y;float r1=dot(e1,e1),r2=dot(e2,e2);if(r1<r2){res=r1;tt=t3.x;}else{res=r2;tt=t3.y;}}
 return sqrt(res)-mix(ra,rb,tt);}
vec2 spBez(vec2 a,vec2 b,vec2 c,float u){return mix(mix(a,b,u),mix(b,c,u),u);}
// where its hip is (screen x) at the clock t: it wades to the right from 2.5 to 8.0 s
float spHipX(float t){return -.12+.12*ss(2.5,8.0,t);}
// ---- The pose at the clock t ----
void spPose(float t){spT=t;
 spWk=ss(2.4,3.0,t)*ss(8.3,7.6,t);spPh=TAU*(t-2.5)/1.8;spBr=sin(t*1.3);
 // the body dips a little just after each footfall (the near foot comes down at 2.95, 4.75, 6.55 s, the far at 3.85, 5.65, 7.45 s)
 // and rolls from side to side with the steps; the shoulders swing the arms a little
 float bob=-.06*pow(abs(sin(spPh-.3)),3.)*spWk+.012*spBr;
 spRl=sin(spPh-.5)*spWk;spSh=.6*sin(spPh+.8)*spWk+.3*spBr;
 spH=vec2(spHipX(t),SW+(HIPW+bob)*SS);
 spWL=(SW-spH.y)/SS; // the water's level in the body frame
 // the thighs swing as it wades (the feet are hidden in the murky water)
 spNA=.30*sin(spPh)*spWk;spFA=-spNA;
 // the head: peering at the water ahead; raised for the display; down to drink; shaking the water off
 float eD=ss(4.7,5.6,t)*(1.-ss(7.1,8.0,t)),eK=ss(8.15,8.75,t)*(1.-ss(9.25,9.55,t)),eS=ss(9.35,9.6,t)*(1.-ss(10.4,11.4,t));
 spHB=vec2(4.05,1.10)+vec2(.05*sin(t*.5),.04*sin(t*.37+1.));spHA=-.38+.04*sin(t*.37);
 spHB=mix(spHB,vec2(3.80,1.62),eD);spHA=mix(spHA,-.08,eD);
 // like a heron's, the head is held still while the body wades on under it, then it glides forward to catch up, once a step; it
 // does not bob with the body
 float P=.9,k=floor((t-2.5)/P),f=fract((t-2.5)/P);float th=2.5+P*(k+ss(.55,.95,f));
 spHB.x+=(spHipX(th)-spHipX(t))/SS;spHB.y-=bob;
 spHB=mix(spHB,HB_DRINK,eK);spHA=mix(spHA,HA_DRINK,eK);
 float osc=sin(TAU*2.6*(t-9.45))*ss(9.42,9.6,t)*ss(10.45,9.9,t);
 spHB=mix(spHB,vec2(3.80,1.58)+vec2(0.,.07)*osc,eS);spHA=mix(spHA,-.20+.28*osc,eS);
 float oscN=sin(TAU*2.6*(t-9.53))*ss(9.5,9.68,t)*ss(10.53,9.98,t); // the neck follows the head a little later
 // the neck: a thick S, up from the shoulders and then forward into the back of the skull (a cubic, drawn as two quadratics)
 float L=length(spHB-SPK0);vec2 P1=SPK0+.50*L*vec2(cos(.55),sin(.55)),e=vec2(cos(spHA+.22),sin(spHA+.22)),P2=spHB-.42*L*e+vec2(0.,.10)*oscN*eS;
 vec2 A1=(SPK0+P1)*.5,A2=(SPK0+2.*P1+P2)*.25,M=(SPK0+3.*P1+3.*P2+spHB)*.125,B1=(P1+2.*P2+spHB)*.25,B2=(P2+spHB)*.5;
 spK1=(3.*(A1+A2)-(SPK0+M))*.25;spKm=M;spK2=(3.*(B1+B2)-(M+spHB))*.25;
 spThr=ss(5.6,6.0,t)*ss(7.0,6.5,t);
 spFl=ss(4.8,6.4,t)*(1.-ss(7.2,9.0,t));
 spTs=.14*sin(t*.85)+.10*sin(spPh+1.)*spWk;
}
vec2 spScr(vec2 b){return spH+SS*b;}
// ---- Its shapes (body frame, metres: x forward, y up, origin at the hip) ----
// the head (head frame, metres before HS: x along the snout from the back of the skull, y up): a long, low, crocodile-like skull; the
// deep back of the skull; a small crest on the snout before the eyes and a brow over them; the narrow snout ending in a slightly
// expanded rosette (its front teeth, covered by the lips); the shallower lower jaw with its own small rosette
float spHeadD(vec2 h){
 float cr=sdEll(h-vec2(.17,-.01),vec2(.25,.20));
 float up=sdCap(h,vec2(.30,.03),vec2(1.00,-.035),.13,.050);
 float ro=sdEll(h-vec2(1.06,-.055),vec2(.11,.075));
 float jw=sdCap(h,vec2(.02,-.14),vec2(1.00,-.105),.085,.036);
 float jr=sdEll(h-vec2(1.05,-.112),vec2(.09,.048));
 float cs=sdEll(h-vec2(.50,.135),vec2(.15,.058));
 float bw=sdEll(h-vec2(.23,.14),vec2(.09,.045));
 float d=smin(cr,up,.10);d=smin(d,ro,.05);d=smin(d,smin(jw,jr,.035),.035);return smin(d,smin(cs,bw,.04),.05);}
// the trunk, the deep chest and the hips
float spTorso(vec2 b){float m=sdEll(b-vec2(1.15,-.26),vec2(1.55,.64));float c=sdEll(b-vec2(2.30,-.34),vec2(.72,.70));float p=sdEll(b-vec2(-.10,-.02),vec2(.72,.50));
 return smin(smin(m,c,.30),p,.30);}
// the neck: its distance, the place along it (0 at the shoulders, 1 at the head), its axis, the side away from the throat, its radius
float spNeckD(vec2 b,out float s,out vec2 ax,out vec2 up,out float r){float t1,t2;
 float d1=spTube(b,SPK0,spK1,spKm,0.,0.,t1),d2=spTube(b,spKm,spK2,spHB,0.,0.,t2);vec2 tg;float d0;
 if(d1<d2){d0=d1;s=t1*.5;ax=spBez(SPK0,spK1,spKm,t1);tg=mix(spK1-SPK0,spKm-spK1,t1);}
 else{d0=d2;s=.5+t2*.5;ax=spBez(spKm,spK2,spHB,t2);tg=mix(spK2-spKm,spHB-spK2,t2);}
 tg=normalize(tg);up=vec2(-tg.y,tg.x);float sd=dot(b-ax,up)/max(d0,1e-3);
 // thick and muscular: deep at the shoulders, the muscles of its upper side bulging; the throat swells a little as it hums
 float rd=mix(.48,.18,pow(s,1.2))+.05*sin(PI*s),rv=mix(.54,.20,s)+.07*spThr*ss(.45,.85,s);
 r=mix(rv,rd,ss(-.35,.35,sd));return d0-r;}
// the sail: tall neural spines under a thick skin, highest over the rear of the trunk, low over the shoulders, sloping back over the
// hips into the fin of the tail; its top a little irregular, sagging between the tips of the spines
float spSailTop(float x){float u=x-.60;float f=u>0.?1.-pow(u/2.15,2.):1.-pow(-u/3.1,1.6);float s=fract((x+1.55)/.25);
 return .36+1.66*max(f,0.)+.07*(vn(vec2(x*2.2,3.))-.5)-.035*sin(PI*s);}
float spSail(vec2 b){float d=max(b.y-spSailTop(b.x),.15-b.y);d=max(d,max(-1.9-b.x,b.x-2.62));return d*.6;}
// the tail: a deep paddle, flattened from side to side (Ibrahim et al. 2020): tall spines above and long chevrons below make a fin over
// and under its muscular core; it rises a little from the hips and then goes back into the water
vec2 spTA(){return vec2(-.25,.12);}vec2 spTB(){return vec2(-3.0,.50+spTs*.25);}vec2 spTC(){return vec2(-5.7,-1.5+spTs*.35);}
float spTailAx(vec2 b,out float tt,out float s,out vec2 ax){float d0=spTube(b,spTA(),spTB(),spTC(),0.,0.,tt);ax=spBez(spTA(),spTB(),spTC(),tt);
 vec2 tg=normalize(mix(spTB()-spTA(),spTC()-spTB(),tt));s=dot(b-ax,vec2(tg.y,-tg.x));return d0;}
float spTCore(float tt){return mix(.44,.07,pow(tt,.85));}
void spTFin(float tt,out float hT,out float hB){hT=.46*(1.-.25*tt)*(1.-pow(tt,6.))*ss(.04,.34,tt)*(1.+.25*sin(PI*tt))-.025*sin(PI*fract(tt*24.))*ss(.2,.4,tt);hB=.38*(1.-.20*tt)*(1.-pow(tt,4.))*(1.+.40*sin(PI*tt));}
float spTailFull(float d0,float tt,float s){float c=spTCore(tt),hT,hB;spTFin(tt,hT,hB);return d0-c-mix(hB,hT,ss(-.25,.25,s/max(d0,1e-3)));}
// the hind legs: the big thigh and the knee in the water, the shin and foot hidden in the murky river
void spLegs(float a,out vec2 K,out vec2 A,out vec2 F){K=rot(-a)*vec2(.42,-1.02);A=K+rot(-a*.5)*vec2(-.38,-.86);F=A+vec2(.55,-.12);}
float spThigh(vec2 b,float a){vec2 K,A,F;spLegs(a,K,A,F);vec2 c=rot(-a)*vec2(.10,-.42);
 return smin(sdEll(rot(a)*(b-c),vec2(.44,.60)),sdCap(b,vec2(.05,-.20),K,.34,.22),.12);}
float spLowLeg(vec2 b,float a){vec2 K,A,F;spLegs(a,K,A,F);return min(sdCap(b,K,A,.22,.13),sdCap(b,A,F,.12,.06));}
// the arms: robust, held folded above the water; the hand with its big curved thumb claw, the other claws folded under
void spArmJ(float sh,out vec2 S,out vec2 E,out vec2 W){S=vec2(2.68,-.30);E=vec2(2.56,-.78)+vec2(-.02,.03)*sh;W=vec2(3.02,-.56)+vec2(.02,.03)*sh;}
float spArm(vec2 b,float sh){vec2 S,E,W;spArmJ(sh,S,E,W);float d=smin(sdCap(b,S,E,.20,.14),sdCap(b,E,W,.14,.10),.06);
 return smin(d,sdEll(rot(.35)*(b-W-vec2(.10,-.04)),vec2(.15,.085)),.05);}
float spClaw(vec2 b,float sh){vec2 S,E,W;spArmJ(sh,S,E,W);float tt;
 float d=spTube(b,W+vec2(.16,-.02),W+vec2(.33,-.04),W+vec2(.34,-.21),.048,.010,tt);
 d=min(d,spTube(b,W+vec2(.20,-.10),W+vec2(.29,-.13),W+vec2(.26,-.21),.028,.007,tt));
 return min(d,spTube(b,W+vec2(.13,-.12),W+vec2(.21,-.16),W+vec2(.17,-.23),.025,.006,tt));}
// the bones (for the fossil and while the flesh grows)
float spBones(vec2 b){float d=1e5,tt;
 vec2 hf=vec2(cos(spHA),sin(spHA)),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(b-spHB,hf),dot(b-spHB,hu))/HS;
 if(length(h-vec2(.55,-.03))<.85){float sk=spHeadD(h)+.012;
  sk=max(sk,-sdEll(h-vec2(.235,.065),vec2(.055,.05)));                   // the orbit
  sk=max(sk,-sdEll(h-vec2(.42,.025),vec2(.11,.038)));                    // the antorbital opening
  sk=max(sk,-sdEll(h-vec2(.64,.07),vec2(.05,.017)));                     // the nostril, set far back
  sk=max(sk,-sdEll(h-vec2(.07,.0),vec2(.065,.06)));                      // the temporal opening
  sk=max(sk,-sdEll(h-vec2(.30,-.13),vec2(.12,.022)));                    // the opening in the lower jaw
  sk=max(sk,.006-abs(h.y+.085+.015*ss(.98,1.08,h.x)));                   // the gap between the jaws
  d=min(d,sk*HS);}
 vec2 nlo=min(min(SPK0,spK1),min(spKm,min(spK2,spHB)))-.3,nhi=max(max(SPK0,spK1),max(spKm,max(spK2,spHB)))+.3;
 if(b.x>nlo.x&&b.y>nlo.y&&b.x<nhi.x&&b.y<nhi.y){float t1,t2;float n1=spTube(b,SPK0,spK1,spKm,0.,0.,t1),n2=spTube(b,spKm,spK2,spHB,0.,0.,t2);
  d=min(d,min(n1-.075-.02*abs(cos(t1*PI*4.)),n2-.062-.02*abs(cos(t2*PI*4.))));}       // the neck
 d=min(d,sdCap(b,vec2(-.3,.26),SPK0+vec2(-.1,.05),.085,.08));                          // the back
 if(b.y>.15&&b.y<2.2&&b.x>-1.9&&b.x<2.6)for(int i=0;i<17;i++){float x=-1.55+float(i)*.25;if(x>2.45)break;if(abs(b.x-x)>.35)continue;float tp=spSailTop(x-.10)-.05;    // the tall spines of the sail
  d=min(d,sdCap(b,vec2(x,.30),vec2(x-.10*(tp-.3)/1.7,tp),.045,.025));}
 if(b.x<.3){d=min(d,spTube(b,spTA(),spTB(),spTC(),.085,.025,tt));                       // the tail: vertebrae, tall spines, long chevrons
 for(int i=0;i<14;i++){float u=.10+float(i)*.064;vec2 ax=spBez(spTA(),spTB(),spTC(),u);if(length(b-ax)>1.1)continue;vec2 tg=normalize(mix(spTB()-spTA(),spTC()-spTB(),u));vec2 up=vec2(tg.y,-tg.x);
  float c=spTCore(u),hT,hB;spTFin(u,hT,hB);d=min(d,min(sdSeg(b,ax,ax+up*(c*.6+hT)+tg*.12),sdSeg(b,ax,ax-up*(c*.6+hB)+tg*.15))-.025);}}
 if(b.x>.1&&b.x<2.9&&b.y<.4&&b.y>-1.1)for(int i=0;i<9;i++){float x=.25+float(i)*.27;if(abs(b.x-x-.15)>.5)continue;float yb=-.70-.25*sin(PI*float(i)/9.);                // the ribs
  d=min(d,min(sdSeg(b,vec2(x,.25),vec2(x+.28,-.25)),sdSeg(b,vec2(x+.28,-.25),vec2(x+.14,yb)))-.028);}
 d=min(d,sdEll(b-vec2(-.05,.12),vec2(.50,.15)));d=min(d,sdCap(b,vec2(.05,-.05),vec2(.32,-.68),.06,.07));d=min(d,sdCap(b,vec2(-.10,-.05),vec2(-.48,-.55),.05,.04)); // the hips
 d=min(d,sdCap(b,vec2(2.35,.20),vec2(2.70,-.30),.07,.06));                             // the shoulder blade
 vec2 K,A,F;spLegs(spNA,K,A,F);d=min(d,min(sdCap(b,vec2(0.,0.),K,.085,.07),min(sdCap(b,K,A,.07,.05),sdCap(b,A,F,.045,.03))));
 vec2 S,E,W;spArmJ(0.,S,E,W);d=min(d,min(min(sdCap(b,S,E,.07,.06),sdCap(b,E,W,.055,.05)),spClaw(b,0.)));
 return d;}
// a simple outline of it (for its reflection in the river); isS 1 on the sail and the fins
float spSil(vec2 b,out float isS){float dS=spSail(b);float d=min(spTorso(b),min(sdCap(b,SPK0,spKm,.58,.42),sdCap(b,spKm,spHB,.42,.24)));
 vec2 hf=vec2(cos(spHA),sin(spHA));d=min(d,sdCap(b,spHB+hf*.15,spHB+hf*SNL*HS,.20,.07));
 vec2 tm=spBez(spTA(),spTB(),spTC(),.5);float dt=min(sdCap(b,spTA(),tm,.40,.25),sdCap(b,tm,spTC(),.25,.06));
 dS=min(dS,min(sdCap(b,spTA()+vec2(0.,.3),tm+vec2(0.,.2),.75,.72),sdCap(b,tm+vec2(0.,.15),spTC(),.72,.05)));
 d=min(d,min(dt,spThigh(b,spNA)));isS=step(dS,d-.02);return min(d,dS);}

// ---- Drawing it: warm olive-brown, darker along the back, a pale belly; lit by the high sun from the left, its back and the top of its
// head catching the light, its underside in shade with a little green light thrown up from the river ----
vec3 spSkinCol(float side){return mix(mix(vec3(.66,.61,.49),vec3(.55,.49,.37),ss(-.75,-.1,side)),vec3(.36,.32,.24),ss(.20,.95,side));}
// the dappled light: 1 where the sun comes through the leaves, 0 in their shade
float spDapA(vec2 q,float t){return ss(.40,.60,fbm2(q*vec2(6.,5.)+vec2(.30*sin(t*.31),.22*sin(t*.23))));}
void spAnimal(vec2 q,float t,float grow){
 vec2 lo=spH+SS*vec2(-6.0,-2.2),hi=spH+SS*vec2(5.5,2.75);if(q.x<lo.x||q.x>hi.x||q.y<lo.y||q.y>hi.y)return;
 vec2 b=(q-spH)/SS;float wl=spWL+.020*sin(b.x*3.+t*2.)+.012*sin(b.x*7.-t*2.6),hw=b.y-wl;
 bool needB=grow<.08;float dB=needB?spBones(b)*SS:-1.; // once the flesh is more than its depth from the bones, they are hidden
 if(needB&&grow<.5)PIECE(dB,vec3(.88,.84,.75),K_BONE,b*.5,vec2(1,0),.004,.8,0.);
 bool dp=uDecor<1.5;float dap=dp?spDapA(q,t):1.;
 // under the water, seen dimly through the murky river: bent by the refraction (they look shallower), darker, broken by the ripples
 if(b.y<wl+.02&&b.y>wl-1.7){float da=max(wl-b.y,0.);
  float wa=uDecor>1.5?0.:1.; // with no decor there is no water to look through: the legs simply fade out downwards
  vec2 br=vec2(b.x+wa*.12*(vn(vec2(b.x*1.3,b.y*9.-t*1.1))-.5)*ss(.0,.20,da),wl-da*mix(1.,1.33,wa));
  float dn=min(spThigh(br,spNA),spLowLeg(br,spNA)),df=min(spThigh(br,spFA),spLowLeg(br,spFA));
  vec2 tm=spBez(spTA(),spTB(),spTC(),.72);float du=min(min(dn,df),min(spTorso(br),sdCap(br,tm,spTC(),.55,.10)))*SS;if(needB)du=max(du,dB-grow);
  float a=ss(.006,-.006,du)*exp(-da*1.4)*ss(wl+.02,wl-.03,b.y)*mix(1.,.82+.18*sin(b.y*38.-t*2.6+b.x*3.),wa);
  veil(mix(mix(vec3(.13,.14,.09),vec3(.24,.24,.16),ss(.0,-.02,dn*SS)*ss(-.6,-.1,b.y-wl)),spSkinCol(-.3)*.55,1.-wa),a*.85,0.);}
 // the far thigh and arm: in the shade of the body
 float dF=min(spThigh(b,spFA),spArm(b-vec2(-.22,.10),-spSh))*SS;dF=max(dF,(wl-b.y)*SS);if(needB)dF=max(dF,dB-grow);
 if(dF<PX*4.)PIECE(dF,spSkinCol(.2)*.55,K_SCALE,b*vec2(12.,16.),vec2(1,0),.30*SS,.8,0.);
 // the tail: its axis, the place along it and the offset across it
 float tt,ts;vec2 tax;float d0=spTailAx(b,tt,ts,tax);float dTf=spTailFull(d0,tt,ts);
 // ---- the sail: thick skin over the tall spines; the spines show as relief ridges under the skin, the thin upper part glows a little
 // where the sun comes through it; it flushes a dull red, most along its spines ----
 float dSl=spSail(b);float dsF=max(dSl*SS,(wl-b.y)*SS);if(needB)dsF=max(dsF,dB-grow);
 if(dsF<PX*4.){float top=spSailTop(b.x);float k=sat((b.y-.40)/(top-.40));float thin=ss(.35,.0,top-b.y);
  float sx=(b.x+1.55+.10*k)/.25+.30*(vn(vec2(b.x*1.7,b.y*.8))-.5);
  float sp=fract(sx)-.5;float ridge=ss(.22,.0,abs(sp)),lit=ridge*ss(.08,-.14,sp),grv=ss(.08,.22,sp)*ss(.42,.26,sp);
  vec3 sc=mix(vec3(.52,.46,.37),vec3(.44,.40,.32),k*.7)*(.94+.10*lit-.07*grv)*(1.-.10*ss(.55,.80,vn(b*vec2(2.6,1.6))));
  sc*=1.+.05*spRl*k;
  float fl=spFl*ss(.05,.55,k)*(.70+.30*ridge)*(1.-.25*ss(.86,1.,k))*ss(-1.5,-.7,b.x);
  sc=mix(sc,vec3(.54,.37,.32)*(.94+.10*k),fl);
  sc*=1.-.18*ss(.82,1.,k);sc*=.80+.20*ss(.0,.30,k); // the darker skin along its edge; the shade at its foot
  piece(dsF,vec2(0.,1.),sc,K_SKIN,vec2(b.x*3.,b.y*.6),vec2(0,1),.05*SS,.6,0.);
  glow(mix(vec3(1.,.66,.42),vec3(1.,.48,.36),fl)*.12*thin*(1.-.6*ridge)*dap*cov(dsF),0.);
  glow(vec3(1.,.88,.66)*.16*ss(-.10,-.01,dSl)*ss(.5,.95,k)*cov(dsF),0.);
  if(dp)shadow((1.-dap)*.36*cov(dsF),vec3(.50,.58,.68),1.);}
 // ---- the body: trunk, neck, head and the deep paddle of the tail in one skin of small scales in rows along the body, countershaded,
 // lit along its back; where the sail rises from it, a soft fold instead of a contour ----
 float sN,rN;vec2 nax,nup;float dN=spNeckD(b,sN,nax,nup,rN),dT=spTorso(b);
 vec2 hf=vec2(cos(spHA),sin(spHA)),hu=vec2(-hf.y,hf.x);vec2 h=vec2(dot(b-spHB,hf),dot(b-spHB,hu))/HS;float dH=length(h-vec2(.55,-.03))<.9?spHeadD(h)*HS:1.;
 float d=smin(smin(dT,dN,.35),dTf,.30);d=smin(d,dH,.08);
 float ds=d*SS,dsW=ds;ds=max(ds,(wl-b.y)*SS);if(needB)ds=max(ds,dB-grow);
 if(ds<PX*4.){
  // its parts, blended where they meet: each gives a side (-1 underneath .. 1 on top), a direction for the light and a roundness
  float dm=min(min(dT,dN),min(dTf,dH));float hT,hB;spTFin(tt,hT,hB);float tc=spTCore(tt);
  float wT=pow(sat(1.-(dT-dm)/.30),2.),wN=pow(sat(1.-(dN-dm)/.30),2.),wL=pow(sat(1.-(dTf-dm)/.30),2.),wH=pow(sat(1.-(dH-dm)/.12),2.);
  vec2 et=(b-vec2(1.15,-.26))/vec2(1.55,.64);float sdT=et.y;vec2 gT=et/vec2(1.55,.64);
  float sdN=dot(b-nax,nup)/max(rN,.1);vec2 gN=b-nax;
  float sdL=.75*ts/max(tc+(ts>0.?hT:hB),.05);vec2 gL=b-tax;
  float yax=mix(-.01,-.07,sat((h.x-.1)/1.0));vec2 gh=vec2(h.x-clamp(h.x,.15,1.05),h.y-yax);float sdH=(h.y-yax)/.15;vec2 gH=hf*gh.x+hu*gh.y;
  float ws=wT+wN+wL+wH;float side=(wT*sdT+wN*sdN+wL*sdL+wH*sdH)/ws;
  vec2 g=wT*normalize(gT+1e-5)+wN*normalize(gN+1e-5)+wL*normalize(gL+1e-5)+wH*normalize(gH+1e-5);
  float R=(wT*.62+wN*rN+wL*.24+wH*.14)/ws*SS;
  // scales in rows along each part: smaller on the head and neck
  vec2 u=wH>.5?h*44.:(wN>max(wT,wL)?vec2(sN*46.,sdN*rN*30.):(wL>wT?vec2(tt*105.,ts*26.):vec2(b.x*16.,b.y*22.)));
  vec3 col=spSkinCol(side);
  col*=mix(.52,1.,ss(-.95,.25,side));                                                   // the underside in shade
  col*=1.-.10*ss(.55,.78,vn(b*vec2(1.6,2.2)+3.))*ss(.9,-.2,side);                     // faint mottling on the flanks
  float bw=b.x*1.9+.8*vn(b*vec2(1.3,2.))+.6*side;col*=1.-.17*ss(.55,.85,sin(bw*PI)*.5+.5)*ss(-.3,.6,side)*ss(2.7,1.7,b.x)*(1.-wH); // darker saddles
  // the tall spines and the long chevrons show through the skin of the paddle as soft ridges
  {float kf=ss(tc+.04,tc+.24,abs(ts))*wL*ss(.12,.30,tt);float sx=tt*19.+.5*sat((abs(ts)-tc)/.4)*sign(ts)+.30*(vn(vec2(tt*9.,ts*2.))-.5);float sp=fract(sx)-.5;
   col*=1.-.10*ss(.07,.0,abs(abs(ts)-tc-.02))*wL*ss(.15,.32,tt);                      // where the muscle of the tail gives way to the fin
   col*=1.+.06*kf;
   col*=1.+kf*(.08*ss(.22,.0,abs(sp))*ss(.08,-.14,sp)-.07*ss(.08,.22,sp)*ss(.42,.26,sp));}
  // soft folds: behind the jaw and across the throat, at the base of the neck, behind the shoulder, in front of the thigh
  col*=1.-.16*ss(.025,.0,abs(fract(sN*16.)-.5)-.44)*ss(.70,.80,sN)*ss(.95,.85,sN)*ss(.3,-.4,sdN)*wN;
  col*=1.-.12*ss(.10,.0,abs(length((b-vec2(2.75,.05))/vec2(.55,.75))-1.))*ss(.5,-.2,side)
   -.10*ss(.08,.0,abs(length((b-vec2(2.05,-.30))/vec2(.55,.62))-1.))*ss(.3,-.4,side)*ss(1.6,2.3,b.x)
   -.09*ss(.08,.0,abs(length((b-vec2(.20,-.30))/vec2(.66,.72))-1.))*ss(.3,-.3,b.x);
  if(wH>.05){float cr1=abs(length((h-vec2(.19,-.01))/vec2(.27,.22))-1.);col*=1.-.20*wH*ss(.05,.0,cr1)*ss(.12,.0,h.x);  // the back of the skull
   float ja=abs(length((h-vec2(.16,-.06))/vec2(.17,.13))-1.);col*=1.-.18*wH*ss(.06,.0,ja)*ss(.0,-.06,h.y+.08)*ss(.22,.10,h.x); // the angle of the jaw
   col*=1.-.12*wH*ss(.0,.05,-h.y-.12)*ss(.3,.6,h.x);                                                        // the underside of the jaw
   col*=1.-.22*wH*ss(.025,.0,abs(length((h-vec2(.235,.065))/vec2(1.,.8))-.085))*ss(.06,.10,h.y);}          // the brow over the eye
  // wet and darker just above the water; the contact where it meets the water is deeper still
  col*=1.-.30*ss(.36,.0,hw);col*=1.-.30*ss(.09,.0,hw);
  // where the sail or the paddle rises from the back, a soft crease
  float finA=ss(.0,-.03,dSl);col*=1.-.18*finA*ss(-.16,.0,d);
  piece(ds,g,col,K_SCALE,u,vec2(1,0),R,.55*(1.-.85*finA),0.);
  float cv=cov(ds);
  // the light of the high sun along its back and the top of its head; green light thrown up from the river under the belly
  float rimw=max(.05,PX/SS*2.2);glow(vec3(1.,.88,.64)*.30*ss(-rimw,-.005,d)*ss(.2,.9,side)*(1.-finA)*cv,0.);
  glow(vec3(.05,.09,.06)*ss(-.1,-.9,side)*ss(.8,.0,hw)*cv,0.);
  glow(vec3(.95,.85,.62)*.10*ss(.30,.80,side)*ss(1.15,.70,side)*cv,0.);               // a soft sheen of the sun along the upper flank
  // the wet skin low down shines, and the light thrown up by the ripples plays on it
  float cs=pow(sat(sin(b.x*8.+2.2*sin(b.y*6.+t*1.3)+t*1.7)*.5+.5),8.)+pow(sat(sin(b.x*5.3-1.7*sin(b.y*9.-t*1.1)-t*1.2)*.5+.5),10.);
  glow(vec3(.80,.88,.78)*(.05+.07*cs)*ss(.45,.0,hw)*ss(-.03,.0,hw)*cv*dap,0.);
  if(grow>.3&&wH>.5){
   // the mouth: the lips close over the teeth; the line rises at the notch behind the rosette and dips along it; the nostril far back
   // on the snout
   float ly=-.085+.016*ss(.84,.93,h.x)*ss(1.0,.95,h.x)-.022*ss(.97,1.05,h.x)-.012*ss(.30,.10,h.x);float ml=abs(h.y-ly)-.007;ml=max(ml,max(.08-h.x,h.x-1.15));
   float no=length((h-vec2(.65,.078))/vec2(1.,.42))-.038;ml=min(ml,no);
   PIECE(ml*SS*HS,vec3(.17,.15,.12),K_SKIN,h,vec2(1,0),.001,0.,0.);
   float brw=sdEll(h-vec2(.23,.115),vec2(.10,.03));shadow(ss(.01,-.01,brw)*.25*cv,vec3(.4,.38,.32),0.);
   vec2 es=spScr(spHB+(hf*.235+hu*.065)*HS);eyeA(q,es,.050*HS*SS,vec3(.66,.52,.22),spSkinCol(.6)*.85,blinkAt(t,.31),0.);}
  // the dappled light falls on it too
  if(dp)shadow((1.-dap)*.36*cv,vec3(.50,.58,.68),1.);}
 // where it goes into the water: the meniscus of light at the waterline, small wavelets lapping out from it, and the water piled up at
 // its chest as it wades (the bow wave)
 if(dp&&b.y<wl+.03&&b.y>wl-.40){float e=dsW/SS;
  if(e<.0&&e>-.6)glow(vec3(.70,.74,.64)*.30*ss(.035,.0,abs(hw+.012))*(.6+.4*sin(b.x*9.+t*3.)),1.);
  if(e>.0&&e<.7){float wv=ss(.10,.0,abs(fract(e*4.-t*.7)-.5)-.30)*ss(.7,.05,e)*ss(.20,.0,abs(hw+.04));veil(vec3(.62,.66,.56),wv*.30,1.);}}
 if(spWk>.01&&dp&&dsW>-.004){float xb=b.x-2.80-.03*sin(t*3.1);float yc=wl+.055*spWk*exp(-xb*xb/.045)*(.85+.15*sin(spPh*2.));
  float m=ss(.004,-.004,(b.y-yc)*SS)*ss(-.03,.0,b.y-wl+.03);veil(vec3(.50,.55,.46),m*.80,1.);glow(vec3(.30,.32,.26)*ss(.02,.0,abs(b.y-yc+.008))*ss(.25,.05,abs(xb))*spWk,1.);}
 // the near thigh: its big muscle over the hip, into the water at the knee
 float dTh=spThigh(b,spNA)*SS;float dTw=dTh;dTh=max(dTh,(wl-b.y)*SS);if(needB)dTh=max(dTh,dB-grow);
 if(dTh<PX*4.){vec2 K,A,F;spLegs(spNA,K,A,F);vec2 c=rot(-spNA)*vec2(.10,-.42);vec2 gt=(b-c)/vec2(.44,.60);float side=.15+.7*gt.y-.2*gt.x;
  vec3 col=spSkinCol(side)*mix(.62,1.,ss(-.9,.4,side));col*=1.-.30*ss(.36,.0,hw);col*=1.-.30*ss(.09,.0,hw);
  piece(dTh,gt,col,K_SCALE,b*vec2(16.,22.),vec2(1,0),.45*SS,.45*ss(-.05,-.40,b.y),0.);
  float cv=cov(dTh);glow(vec3(1.,.88,.64)*.12*ss(-.08,-.005,spThigh(b,spNA))*ss(.3,.9,side)*ss(.0,-.30,b.y)*cv,0.);
  glow(vec3(.80,.88,.78)*.07*ss(.40,.0,hw)*cv*dap,0.);if(dp)shadow((1.-dap)*.36*cv,vec3(.50,.58,.68),1.);}
 // the near arm (folded, the hand above the water); its claws pale horn, darker at the tips
 float da=spArm(b,spSh)*SS,dc=spClaw(b,spSh)*SS;if(needB){da=max(da,dB-grow);dc=max(dc,dB-grow);}
 float dA=min(da,dc);
 if(dA<PX*4.){vec2 S,E,W;spArmJ(spSh,S,E,W);float u1=segU(b,S,E),u2=segU(b,E,W);vec2 a1=mix(S,E,u1),a2=mix(E,W,u2);vec2 ga=length(b-a1)<length(b-a2)?b-a1:b-a2;
  float side=sat(ga.y/.18)-.2;vec3 col=dc<da?mix(vec3(.70,.64,.52),vec3(.30,.27,.22),ss(.05,.25,length(b-W-vec2(.34,-.21))<.2?.25-length(b-W-vec2(.34,-.21)):.0)):spSkinCol(side*.6)*mix(.60,1.,ss(-.8,.4,side));
  piece(dA,dc<da?vec2(dFdx(dc),dFdy(dc)):ga,col,dc<da?K_HORN:K_SCALE,b*vec2(20.,26.),vec2(1,0),(dc<da?.03:.14)*SS,.7,0.);
  if(dp)shadow((1.-dap)*.30*cov(dA),vec3(.50,.58,.68),1.);}
}
// The ripples break the reflections into horizontal bands that drift slowly towards us: a sideways shift, a little up and down, and
// how much the band faces the sky
vec3 spRip(vec2 q,float t){float dz=max(SBK-q.y,0.),Z=1./(dz+.012);
 float b1=vn(vec2(q.x*2.5,Z*1.15-t*.35)),b2=vn(vec2(q.x*5.,Z*2.3-t*.55)+7.);
 return vec3(vec2((b1-.5)*.040+(b2-.5)*.018,(b2-.5)*.006)*(.30+dz*2.2),ss(.62,.90,b2));}
// Its reflection in the river, blurred and broken by the ripples like the forest's: the body dark olive, the sail warmer (and red
// while it flushes).
void spRefl(vec2 q,float t){if(q.y>SW||q.y<SW-SS*3.2)return;vec2 lo=spH+SS*vec2(-6.0,0.),hi=spH+SS*vec2(5.6,0.);if(q.x<lo.x||q.x>hi.x)return;
 vec3 rp=spRip(q,t);vec2 r=vec2(q.x+rp.x,2.*SW-q.y+rp.y);vec2 b=(r-spH)/SS;if(b.y<spWL)return;
 float isS;float d=spSil(b,isS)*SS;float bl=.005+.03*(SW-q.y);float a=ss(bl,-bl,d)*.48*ss(-SS*3.2,-SS*.2,q.y-SW);
 vec3 c=isS>.5?mix(vec3(.33,.30,.23),vec3(.38,.28,.23),spFl*ss(.8,1.6,b.y)*step(-1.2,b.x)):vec3(.25,.24,.17);c=mix(c,c*1.25+.03,rp.z*.5);veil(c,a,1.);}

// ---- The backdrop: the far bank and its gallery forest, the sky above ----
// what the river mirrors (for the reflections), softened by bl: the sky, the far trees in the haze, the outline of the gallery forest
// on the far bank (the same crowns as above), the bank; nearer to us the leaves overhead
vec3 spReflCol(vec2 p,float bl){
 vec3 c=mix(vec3(.84,.86,.80),vec3(.58,.70,.82),ss(.22,.85,p.y));
 float f1=SBK+.22+.05*fbm(vec2(p.x*2.4,1.3));c=mix(c,vec3(.58,.66,.58),ss(f1+bl,f1-bl,p.y));
 float cw=.085,ci=floor(p.x/cw);float dd=p.y-(SBK+.15+.015*sin(p.x*23.)),lt=0.;
 for(int k=-1;k<=1;k++){float cc=ci+float(k);vec2 ce=vec2((cc+.5+(h11(cc*2.1)-.5)*.5)*cw,SBK+.12+.11*h11(cc*1.37));float r=.045+.035*h11(cc*2.91);
  float dk=min(length((p-ce)/vec2(1.,.88))-r,max(abs(p.x-ce.x)-r*1.05,p.y-ce.y));if(dk<dd){dd=dk;lt=ss(ce.y-r*.4,ce.y+r*.9,p.y)*(.5+.5*h11(cc*5.7));}}
 vec3 tree=mix(vec3(.08,.11,.05),vec3(.27,.35,.13),lt);
 c=mix(c,mix(tree,vec3(.52,.60,.52),.14),ss(bl,-bl,dd));
 c=mix(c,vec3(.45,.41,.31),ss(SBK+.012+bl*.5,SBK+.006,p.y));
 float m=fbm(p*vec2(2.2,1.7)+1.3)+(p.y-.72)*.9+.22*ss(.2,.9,abs(p.x));
 return mix(c,vec3(.10,.14,.07),ss(.47-bl*3.,.55+bl*3.,m));}
void spBack(vec2 q,float t){
 if(q.y<SBK-.004)return;
 vec3 sk=mix(vec3(.88,.89,.80),vec3(.58,.72,.86),ss(.22,.85,q.y));
 if(q.y>SBK+.18)PIECE(-1.,sk,K_SKY,q,vec2(1,0),.1,0.,1.);
 // far trees in the haze
 float f1=SBK+.22+.05*fbm(vec2(q.x*2.4,1.3))+.018*sqrt(abs(sin(q.x*21.+1.3*sin(q.x*5.))));
 if(q.y<f1+.01)PIECE(q.y-f1,mix(vec3(.58,.66,.58),vec3(.66,.72,.64),ss(SBK,f1,q.y)),K_FAR,q*vec2(3.,5.),vec2(1,0),.03,.0,1.);
 // the gallery forest on the far bank: a wall of billowing crowns of flowering trees, leafy at their edges, sunlit on top and from the
 // left, dark underneath; trunks in the shade of the understorey
 if(q.y<SBK+.36){float cw=.085;float ci=floor(q.x/cw);float lf=fbm2(q*vec2(70.,80.));
  float d=q.y-(SBK+.085+.012*sin(q.x*29.)+.008*sin(q.x*71.))-.010*(lf-.5);vec2 g=vec2(0.,1.);float R=.01;vec3 tc=vec3(.07,.10,.05);
  for(int k=-1;k<=1;k++){float c=ci+float(k);float h1=h11(c*1.37),h2=h11(c*2.91);vec2 cc=vec2((c+.5+(h11(c*2.1)-.5)*.5)*cw,SBK+.12+.11*h1);float r=.045+.035*h2;
   float dk=length((q-cc)/vec2(1.,.88))-r;float dk2=length(q-cc-vec2(r*.75,-r*.40))-r*.72;float dk3=length(q-cc-vec2(-r*.7,-r*.45))-r*.66;
   float dd=min(min(dk,dk2),dk3)-.016*(lf-.45)*ss(-.03,.0,min(min(dk,dk2),dk3));
   float tr=max(abs(q.x-cc.x-.004*sin(q.y*60.))-.0035,q.y-cc.y+r*.4);
   if(dd<d){d=dd;g=q-cc+vec2(.0,.3*r);R=r*.55;float lit=ss(-.6,.9,dot(normalize(q-cc+1e-5),vec2(-.45,.89)));
    tc=mix(vec3(.07,.11,.05),mix(vec3(.22,.31,.11),vec3(.34,.42,.15),h11(c*5.7)),lit*lit)*(.80+.40*lf);}
   if(tr<d&&q.y>SBK+.03){d=tr;g=vec2(1.,0.);R=.004;tc=vec3(.10,.10,.08);}}
  tc=mix(tc,vec3(.52,.60,.52),.14);
  if(d<.012)piece(d,g,tc,K_PLANT,q*vec2(22.,30.),vec2(0,1),R,.15,1.);}
 // the sandy bank at the water, its wet edge darker
 float bk=SBK+.008+.003*sin(q.x*13.)+.003*ss(.5,.8,vn(vec2(q.x*30.,0.)));
 if(q.y<bk+.002)PIECE(q.y-bk,mix(vec3(.34,.31,.23),vec3(.52,.47,.36),ss(SBK,SBK+.006,q.y)*ss(.35,.65,vn(vec2(q.x*9.,1.))))*(.90+.18*vn(q*vec2(80.,30.))),K_SAND,q*3.,vec2(1,0),.004,.0,1.);
 // soft shafts of sunlight in the warm haze under the trees (behind the animal), slanting down from the left
 float sh=ss(.62,.92,sin((q.x+q.y*.62)*8.5+1.3+.25*sin(t*.17))*.5+.5)*ss(SBK,.30,q.y)*ss(.62,.25,q.y);veil(vec3(1.,.97,.86),sh*.11,1.);
}
// the canopy overhead: leafy branches from the top corners, swaying a little; the leaves against the light glow yellow-green
float spLeafField(vec2 q,float t,out vec3 lc){float d=1e5;lc=vec3(.18,.26,.10);
 vec2 cs=vec2(.034,.03);vec2 ci=floor(q/cs);
 for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 c=ci+vec2(i,j);vec2 cc=(c+.5)*cs;
  float yl=mix(.86,.45,sat((cc.x+1.6)/1.55))-.10*sin(PI*sat((cc.x+1.6)/1.55)),yr=mix(.84,.48,sat((1.6-cc.x)/1.30))-.07*sin(PI*sat((1.6-cc.x)/1.30));
  float bl=cc.x<-.05?yl:9.,br=cc.x>.30?yr:9.;
  float den=ss(.16+.08*vn(vec2(cc.x*9.,5.)),.02,min(bl,br)-cc.y)*step(0.,min(bl,br)-cc.y+.02);
  den*=ss(.22,.55,vn(cc*4.5+3.))*1.35;if(h21(c)>den)continue;
  vec2 o=cc+(h22(c)-.5)*cs*.9+vec2(.003*sin(t*1.1+c.x),.002*sin(t*.9+c.y));float a=-1.57+1.1*(h21(c+3.)-.5)+.10*sin(t*.8+c.x*.7);
  float ln=.014+.024*h21(c+11.)*h21(c+12.);vec2 l=rot(a)*(q-o);float dl=sdEll(l-vec2(ln,0.),vec2(ln,ln*.38));
  if(dl<d){d=dl;float hh=h21(c+7.);lc=mix(vec3(.08,.14,.05),vec3(.30,.42,.12),hh*hh)*(1.+1.1*ss(.78,.95,h21(c+9.)))+vec3(.06,.05,.0)*ss(.9,1.,h21(c+13.));}}
 return d;}
void spCanopy(vec2 q,float t){if(q.y<.34)return;
 // on a tall screen, the mass of the canopy above: dark foliage with sky through its gaps, the leaves at its edges lit through
 if(q.y>.52){float m=fbm(q*vec2(4.,3.2)+vec2(.04*sin(t*.3),0.))+(q.y-.80)*1.1+.14*(fbm2(rot(.55)*q*34.+vec2(t*.03,0.))-.5);
  float a=ss(.46,.50,m);if(a>.001){float l=fbm2(rot(-.7)*q*16.+5.);veil(mix(vec3(.07,.11,.05),vec3(.26,.36,.11),l*l)*(1.+.8*ss(.53,.47,m)),a,1.);}}
 float tt;float db=min(spTube(q,vec2(-1.6,.92),vec2(-.70,.42),vec2(-.04,.47),.014,.004,tt),spTube(q,vec2(1.6,.90),vec2(.85,.46),vec2(.30,.50),.013,.004,tt));
 float bl=max(PX*1.5,.0025); // close to us, a little out of focus
 veil(vec3(.10,.09,.07),ss(bl,-bl,db),1.);
 vec3 lc;float dl=spLeafField(q,t,lc);if(dl<.01){veil(lc,ss(bl,-bl,dl)*.97,1.);glow(vec3(.10,.12,.02)*ss(-.002,-.010,dl)*ss(.2,.5,lc.g),1.);}}

// ---- The river ----
float spRing(vec2 q,vec2 c,float a,float sp,float life){if(a<0.||a>life)return 0.;float sq=.20+.8*ss(SBK,-.6,c.y);float r=.003+a*sp;float e=length((q-c)/vec2(1.,sq))-r;
 float f=1.-a/life;return (ss(.0035,.0,abs(e-.001))-.5*ss(.005,.0,abs(e+.0035)))*f*f;}
vec2 spTipDrink(){return HB_DRINK+vec2(cos(HA_DRINK),sin(HA_DRINK))*SNL*HS;}
void spWater(vec2 q,float t){if(q.y>SBK)return;
 float dz=max(SBK-q.y,0.),Z=1./(dz+.012),X=q.x*Z;
 float wn=vn(vec2(X*.6,Z*1.4-t*.25));float w=sin(Z*3.0-t*.9+wn*2.)*.5+sin(Z*5.3+X*.2-t*1.3)*.5;
 // it mirrors the far bank, the sky over it and nearer to us the leaves overhead: a softened copy, blurrier as it comes nearer, broken
 // into drifting bands by the ripples; the murky green-brown water shows through more near us
 vec3 rp=spRip(q,t);float bl=.006+.05*dz;
 vec3 rc=spReflCol(vec2(q.x+rp.x,2.*SBK-q.y+rp.y+w*.002*(.3+dz*3.)),bl);
 rc=mix(rc*.88,vec3(.72,.78,.78),.22*rp.z*ss(.0,.06,dz));
 float fr=mix(.92,.45,ss(.0,.45,dz));vec3 murk=mix(vec3(.24,.25,.14),vec3(.13,.15,.08),ss(.1,.6,dz));
 vec3 col=mix(murk,rc,fr);
 col+=vec3(.05,.06,.05)*ss(.6,.95,w*.5+.5)*ss(.0,.05,dz)*(1.-ss(.25,.7,dz)); // the sky glinting softly on the ripples
 PIECE(q.y-SBK,col/(AMBC*.5+SUNC*.6),K_WATER,vec2(X*.05,Z*.3),vec2(1,0),.02,0.,1.);
 if(uDecor>1.5)return;
 // its reflection
 spRefl(q,t);
 // the dappled light on the water: the sun through the leaves lights up the murky water (warm patches); elsewhere the shade of the
 // canopy, deeper near us
 {float l=ss(.42,.66,fbm2(vec2(X*.32,Z*.9)+vec2(.25*sin(t*.21),.18*sin(t*.17))));float sh=ss(-.02,-.40,q.y);
  shadow((1.-l)*(.24+.42*sh),vec3(.58,.66,.68),1.);glow(vec3(.11,.10,.05)*l*(.4+.6*sh)*ss(.0,.05,dz),1.);}
 // fallen leaves drifting on the current
 {vec2 g=vec2((q.x+t*.010)/.15,q.y/.065);vec2 ci=floor(g);if(h21(ci+.3)>.86&&q.y<SW-.025){vec2 c=vec2((ci.x+.5)*.15-t*.010,(ci.y+.5)*.065)+(h22(ci)-.5)*vec2(.09,.035);
   vec2 l=rot(h21(ci)*6.+.2*sin(t*.3+ci.x))*(q-c);float sq=.35+.65*ss(SBK,-.6,c.y);float sz=.8+.6*h21(ci+2.);float dl=sdEll(l/vec2(1.,sq),vec2(.011,.005)*sz);
   PIECE(dl,mix(vec3(.52,.40,.18),vec3(.36,.40,.16),h21(ci+5.)),K_LEAF,l*80.,vec2(1,0),.003,.4,1.);}}
 // rings: each step (where its thighs go into the water), its snout going in and out, drips, the fish darting; the wake of its chest
 float rg=0.;
 for(int k=0;k<3;k++){float fk=float(k);float tn=2.95+1.8*fk,tf=3.85+1.8*fk;
  rg+=spRing(q,vec2(spHipX(tn)+SS*.50,SW-.006),t-tn,.028,1.8)*.9;rg+=spRing(q,vec2(spHipX(tf)+SS*.40,SW+.004),t-tf,.026,1.8)*.6;}
 vec2 sn=vec2(spHipX(8.75)+SS*spTipDrink().x,SW-.003);
 rg+=spRing(q,sn,t-8.75,.032,2.2)*1.1+spRing(q,sn,t-9.36,.038,2.4)+spRing(q,sn+vec2(-.012,.002),t-9.55,.03,1.6)*.8+spRing(q,sn+vec2(-.025,-.006),t-9.7,.03,1.6)*.6;
 for(int k=0;k<6;k++){float fk=float(k);float td=10.5+fk*.55+.2*h11(fk);rg+=spRing(q,sn+vec2(-.035*h11(fk*3.),-.008*h11(fk*5.)),t-td,.022,1.3)*.5;}
 rg+=spRing(q,vec2(spHipX(5.5)+SS*3.0,SW-.03),t-5.55,.03,1.5)*.6+spRing(q,sn+vec2(.02,-.02),t-9.55,.03,1.5)*.5;
 // the ripples where the tail goes into the water, as it sways
 {vec2 te=vec2(spH.x+SS*(-5.15),SW+.002);rg+=.35*ss(.006,.0,abs(length((q-te)/vec2(1.,.22))-.012-.006*fract(t*.6)))*(1.-fract(t*.6));}
 // the bow wave and the wake while it wades
 {vec2 p0=vec2(spH.x+SS*2.80,SW-.002);float dx=p0.x-q.x,dy=(q.y-p0.y)/(.22+.6*ss(SBK,-.6,q.y));
  float arm=abs(abs(dy)-.36*dx-.004);float wk=ss(.008,.0,arm)*ss(.0,.03,dx)*ss(.45,.05,dx)*spWk*(.5+.5*sin(dx*160.-t*6.))*ss(.25,.7,vn(vec2(dx*40.,dy*30.+t*.4)))*.7;
  float bow=ss(.035,.0,length(vec2(dx+.012,dy*1.5)))*spWk;rg+=wk*.7+bow*.5;}
 if(rg>0.)glow(vec3(.58,.62,.50)*rg*.42,1.);else shadow(-rg*.30,vec3(.55,.60,.50),1.);
}
// small fish under the surface: a shoal near its chest that darts away at 5.5 s, another near its snout that darts away at 9.5 s
void spFish(vec2 q,float t){if(q.y>SW+.005||q.y<SW-.10||uDecor>1.5)return;
 for(int s=0;s<2;s++){float t0=s==0?5.5:9.5;vec2 c0=s==0?vec2(spHipX(5.5)+SS*3.05,SW-.045):vec2(spHipX(8.75)+SS*(spTipDrink().x-.30),SW-.030);float a=t-t0;
  if(a>2.2||(s==1&&t<7.4))continue;if(abs(q.x-c0.x)>.30||abs(q.y-c0.y)>.07)continue;
  for(int i=0;i<6;i++){float fi=float(i),fs=float(s);vec2 o=c0+vec2((h11(fi*4.+fs)-.5)*.08,(h11(fi*7.+fs)-.5)*.025);
   o+=vec2(.006*sin(t*1.3+fi*2.),.003*sin(t*1.7+fi));float dir=h11(fi*11.+fs)>.4?1.:-1.;
   float dart=a>0.?(1.-exp(-a*3.5))*(.09+.06*h11(fi*13.)):0.;o+=vec2(dir*dart,-.25*dart);
   float vis=(s==1?ss(7.4,8.2,t):1.)*(1.-ss(.6,1.6,a));if(vis<.01)continue;
   vec2 l=q-o;l.x*=-dir*(a>0.?1.:(mod(fi,2.)<.5?1.:-1.));float d=min(sdEll(l,vec2(.013,.0036)),sdEll(rot(.6)*(l-vec2(.014,.002)),vec2(.0045,.0018)));
   d=min(d,sdEll(rot(-.6)*(l-vec2(.014,-.002)),vec2(.0045,.0018)));
   veil(vec3(.13,.15,.10),ss(.0015,-.0015,d)*.60*vis,1.);glow(vec3(.22,.24,.18)*ss(.0012,-.0012,length(l-vec2(-.004,.001))-.002)*vis*(a>0.?.5:.2),1.);}}}
// spray thrown from its head as it shakes it, and drops falling from its jaws afterwards
void spSpray(vec2 q,float t){if(t<9.25||t>13.5)return;
 vec2 hf=vec2(cos(spHA),sin(spHA)),hu=vec2(-hf.y,hf.x);vec2 tip=spScr(spHB+hf*SNL*HS);if(abs(q.x-tip.x)>.20||q.y<SW-.01||q.y>tip.y+.14)return;
 for(int i=0;i<30;i++){float fi=float(i);float t0=9.45+fi*.026;float a=t-t0;if(a<0.||a>1.)continue;
  float side=mod(fi,2.)<.5?1.:-1.;vec2 v=vec2(side*(.16+.14*h11(fi*3.)),.10+.14*h11(fi*5.));
  vec2 p0=spScr(spHB+(hf*(.25+.85*h11(fi*7.))+hu*(.10+.08*h11(fi*9.)))*HS);
  vec2 p=p0+v*(a+.06)+vec2(0.,-.45*a*a);if(p.y<SW)continue;float dd=length((q-p)*vec2(1.,.8))-.0016-.0014*h11(fi);
  veil(vec3(.94,.96,.90),ss(.0012,-.0008,dd)*.85*(1.-a)*ss(.0,.05,a),1.);}
 // a fine veil of spray around the head while it shakes
 float sh=ss(9.42,9.6,t)*ss(10.6,10.1,t);if(sh>.01){vec2 hc=spScr(spHB+hf*.6*HS);veil(vec3(.88,.92,.86),ss(.10,.0,length((q-hc)*vec2(.8,1.2)))*.16*sh*(.6+.4*vn(q*90.+t*3.)),1.);}
 // drops falling from the tip of the snout
 for(int i=0;i<3;i++){float fi=float(i);float per=.9+.2*fi;float a=mod(t-10.4-fi*.31,per);if(t<10.4+fi*.31||t>13.)continue;
  vec2 p=tip+vec2(-.004*fi,-.002-1.6*a*a);if(p.y<SW)continue;veil(vec3(.90,.94,.86),ss(.0016,.0004,length((q-p)*vec2(1.,.7)))*.8,1.);}
}

// ---- The fossil: the skeleton lying in the rock as the animal stands at the start ----
const vec2 WIN_C=vec2(.01,-.06);
// the edge of the window of life (as the frame draws it): inside it the rock is not seen, so the fossil need not be drawn there
float spWinD(vec2 q){float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))-R+.06*(fbm2(q*5.+3.)-.5)+.02*(vn(q*24.)-.5);}
void fossil(vec2 q){if(uLife>.001&&spWinD(q)<-.004)return;
 spPose(0.);vec2 lo=spH+SS*vec2(-6.0,-2.3),hi=spH+SS*vec2(5.4,2.6);if(q.x<lo.x||q.x>hi.x||q.y<lo.y||q.y>hi.y)return;
 vec2 b=(q-spH)/SS;PIECE(spBones(b)*SS,vec3(.55,.46,.36),K_FOSSIL,b*.3,vec2(1,0),.006,.6,0.);}
void life(vec2 q,float t){
 // while the window of life opens, nothing of the living scene is seen outside it (the frame shows the rock there)
 if(uLife<.999&&spWinD(q)>.012)return;
 SUNL=normalize(vec3(-.40,.72,.55));SUNC=vec3(1.45,1.30,1.02);AMBC=vec3(.40,.46,.48);BACK=.15;
 spPose(t);
 spBack(q,t);
 spWater(q,t);
 spFish(q,t);
 spAnimal(q,t,GROW);
 spSpray(q,t);
 spCanopy(q,t);
}

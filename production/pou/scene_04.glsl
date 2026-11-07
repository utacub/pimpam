// ---- Scene 5 (El pou del temps, CE37): Tyrannosaurus rex on the Hell Creek floodplain, a mother and two chicks by a pool, in a warm hazy morning. Key
// moment 4–7 s: she lowers her head and gives three closed-mouth booms (the throat swells, the pool trembles, the chicks put their
// heads up out of the ferns); 9–11 s the chicks chirp back and she turns her head down towards them. Lips cover the teeth.
// Scale: about .114 screen units per metre (hips ~.42 above the ground, ~12 m from snout to tail, the tail leaving the screen). ----
const float TG=-.30;
const vec2 HIP=vec2(.20,.10),HP=vec2(-.20,.085);
// the near leg: hip, knee forward, ankle back, the long foot, the toes forward
const vec2 LK=vec2(.13,-.075),LA=vec2(.215,-.215),LB=vec2(.185,-.292),LT=vec2(.105,-.300);
const vec2 FK=vec2(.20,-.07),FA=vec2(.29,-.20),FB=vec2(.27,-.292),FT=vec2(.19,-.300); // far leg (a step behind)
// The head frame: origin at the back of the skull, forward is -x; a is how far it is turned down.
vec2 headF(vec2 r,float a){return rot(a)*(r-HP);}
float trexBones(vec2 r,float a){float d=1e5;float tt;
 vec2 h=headF(r,a);
 float sk=smin(sdEll(h-vec2(-.045,.012),vec2(.06,.045)),sdCap(h,vec2(-.07,.008),vec2(-.18,-.006),.036,.024),.02);
 sk=max(sk,-sdEll(h-vec2(-.115,.008),vec2(.03,.014)));sk=max(sk,-sdEll(h-vec2(-.055,.026),vec2(.014,.017)));sk=max(sk,-sdEll(h-vec2(-.012,.012),vec2(.018,.022)));
 d=min(d,sk);float jw=sdCap(h,vec2(-.01,-.038),vec2(-.17,-.030),.022,.012);jw=max(jw,-sdEll(h-vec2(-.03,-.04),vec2(.022,.008)));d=min(d,jw);
 // the spine: neck (S), back, tail, with short spines
 d=min(d,sdTube(r,HP+vec2(.015,.01),vec2(-.15,.16),vec2(-.06,.13),.010,.012,tt));
 d=min(d,sdTube(r,vec2(-.06,.13),vec2(.08,.17),vec2(.22,.16),.012,.012,tt));
 d=min(d,sdTube(r,vec2(.22,.16),vec2(.55,.14),vec2(.97,.02),.012,.004,tt));
 for(int i=0;i<9;i++){float x=-.04+float(i)*.035;float y=mix(.13,.165,sat((x+.06)/.2));d=min(d,sdSeg(r,vec2(x,y),vec2(x+.008,y+.026))-.0045);}
 for(int i=0;i<7;i++){float x=-.05+float(i)*.034;float y=mix(.13,.165,sat((x+.06)/.2));d=min(d,sdTube(r,vec2(x,y-.01),vec2(x+.04,y-.09),vec2(x+.012,-.035),.0065,.005,tt));}
 for(int i=0;i<6;i++){float x=-.06+float(i)*.033;d=min(d,sdSeg(r,vec2(x,-.045+float(i)*.002),vec2(x+.026,-.05+float(i)*.003))-.004);}
 // shoulder blade, the tiny arm with two fingers
 d=min(d,sdCap(r,vec2(-.02,.12),vec2(-.07,.04),.013,.009));d=min(d,sdCap(r,vec2(-.07,.03),vec2(-.06,-.015),.007,.006));d=min(d,sdCap(r,vec2(-.06,-.015),vec2(-.085,-.03),.005,.004));
 // pelvis: ilium, pubis with its boot, ischium
 d=min(d,sdEll(r-vec2(.21,.135),vec2(.095,.032)));d=min(d,sdCap(r,vec2(.18,.11),vec2(.12,-.04),.011,.011));d=min(d,sdEll(r-vec2(.125,-.05),vec2(.045,.014)));
 d=min(d,sdCap(r,vec2(.25,.11),vec2(.29,.02),.010,.006));
 // the near leg
 d=min(d,sdCap(r,HIP,LK,.017,.014));d=min(d,sdCap(r,LK,LA,.013,.011));d=min(d,sdCap(r,LA,LB,.010,.008));d=min(d,sdCap(r,LB,LT,.007,.004));
 return d;}
float chickBones(vec2 l){float d=sdEll(l-vec2(.06,.06),vec2(.022,.013));d=min(d,sdSeg(l,vec2(.045,.055),vec2(-.10,.02))-.003);
 for(int i=0;i<3;i++)d=min(d,sdSeg(l,vec2(-.005+float(i)*.012,.03),vec2(.0+float(i)*.012,.01))-.0025);
 d=min(d,sdSeg(l,vec2(0.,.02),vec2(.012,-.02))-.0025);d=min(d,sdSeg(l,vec2(.012,-.02),vec2(.0,-.055))-.002);return d;}
struct Rex{float boom,turn,lower;};
void trex(vec2 q,float t,Rex a,float grow,float boomPulse){
 vec2 r=q;
 r.y-=sin(t*1.1)*.0025*ss(.0,.25,r.y+.3);
 float ha=.10*a.lower+.16*a.turn+.03*sin(t*.7)*(1.-a.boom)*(1.-a.turn);
 bool needB=grow<.6;float dB=needB?trexBones(r,ha):-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.86,.82,.72),K_BONE,r*3.,vec2(1,0),.01,.8,0.);
 vec3 back=vec3(.30,.27,.17),belly=vec3(.70,.60,.43),headC=vec3(.46,.33,.21);
 float tt;
 // the far leg, darker and a step behind
 {float d=sdEll(rot(.45)*(r-vec2(.215,.02)),vec2(.07,.115));d=smin(d,sdCap(r,FK,FA,.042,.03),.02);d=smin(d,sdCap(r,FA,FB,.026,.021),.01);d=smin(d,sdCap(r,FB+vec2(0.,-.004),FT,.017,.011),.01);
  if(needB)d=max(d,dB-G);PIECE(d,back*.58,K_SCALE,r*160.,vec2(1,0),.06,1.,0.);}
 // the far arm
 {float d=sdCap(r,vec2(-.05,.02),vec2(-.04,-.025),.012,.009);d=min(d,sdCap(r,vec2(-.04,-.025),vec2(-.062,-.04),.005,.004));if(needB)d=max(d,dB-G);PIECE(d,back*.6,K_SCALE,r*90.,vec2(1,0),.01,1.,0.);}
 // tail, body, neck, head as one: the back high over the hips, the belly hanging a little, the S of the neck
 float sw=.010*sin(t*.8);
 float dT=sdTube(r,vec2(.24,.13),vec2(.56,.15+sw),vec2(.99,.03+sw*2.),.072,.010,tt);
 float dTor=sdEll(rot(.18)*(r-vec2(.06,.065)),vec2(.20,.105));
 float dHip=sdEll(r-vec2(.21,.11),vec2(.11,.075));
 vec2 h=headF(r,ha);
 vec2 neckEnd=HP+rot(-ha)*vec2(.005,-.01);
 float dNeck=sdTube(r,vec2(-.05,.10),vec2(-.15,.155),neckEnd,.068,.052,tt);
 float dCr=sdEll(h-vec2(-.045,.012),vec2(.068,.052)),dSn=sdCap(h,vec2(-.07,.008),vec2(-.185,-.006),.042,.028),dJw=sdCap(h,vec2(-.01,-.036),vec2(-.172,-.028),.030,.017);
 float dHead=smin(smin(dCr,dSn,.03),dJw,.015);
 // the throat swells at each boom
 float dTh=sdEll(h-vec2(-.03,-.062-.006*boomPulse),vec2(.055+.012*boomPulse,.026+.02*boomPulse));
 float d=smin(smin(smin(dTor,dHip,.06),dT,.05),dNeck,.05);d=smin(d,dHead,.025);d=smin(d,dTh,.025);
 if(needB)d=max(d,dB-G);
 // countershading: dark above, pale below; a warmer head; dark mottles along the back (no stripes)
 float cs=ss(-.02,.12,r.y-.0);vec3 alb=mix(belly,back,cs);alb=mix(alb,headC,ss(-.14,-.24,r.x)*.55);
 alb=mix(alb,belly*1.06,ss(.02,-.03,dTh)*ss(-.10,-.16,r.x)*.8);
 alb*=1.-.28*ss(.55,.75,fbm(r*vec2(9.,14.)+3.))*ss(.06,.14,r.y);
 alb*=.94+.12*fbm(r*14.);
 // scales: larger on the back and hips, finer on the head and throat
 float sc=mix(230.,150.,ss(-.12,.05,r.x));
 PIECE(d,alb,K_SCALE,r*sc,vec2(1,0),.10,1.,0.);
 // the face: brow over the eye, the bosses in front of it, the lips (closed mouth, no teeth), the nostril, the eye
 if(G>.3){
  float br=sdEll(h-vec2(-.058,.05),vec2(.026,.011));PIECE(br,headC*.8,K_SCALE,h*150.,vec2(1,0),.008,.7,0.);
  float bo=sdEll(h-vec2(-.10,.045),vec2(.016,.008));PIECE(bo,headC*.85,K_SCALE,h*150.,vec2(1,0),.006,.6,0.);
  float ml=abs(h.y+.013-.004*sin(h.x*95.)+.05*(h.x+.09)*(h.x+.09))-.0017;ml=max(ml,abs(h.x+.095)-.085);
  PIECE(ml,headC*.30,K_SKIN,h*60.,vec2(1,0),.003,0.,0.);
  float lip=sdCap(h,vec2(-.012,-.016),vec2(-.18,-.009),.008,.006);shadow(ss(.004,-.004,lip)*.25*ss(.0,.02,-h.y-.002),vec3(.6,.55,.5),0.);
  PIECE(sdEll(h-vec2(-.175,.016),vec2(.008,.0045)),vec3(.08,.06,.05),K_EYE,h,vec2(1,0),.003,0.,0.);
  vec2 ec=vec2(-.056,.033);float bl=ss(.0,.03,fract(t/5.1+.3))*ss(.09,.05,fract(t/5.1+.3));vec2 el=h-ec;el.y/=max(.1,1.-bl);
  PIECE(length(el)-.0105,vec3(.60,.40,.12),K_EYE,h,vec2(1,0),.004,.8,0.);
  if(bl<.5){PIECE(length(el*vec2(1.6,1.))-.0055,vec3(.02),K_EYE,h,vec2(1,0),.003,0.,0.);veil(vec3(.95),cov(length(h-ec-vec2(-.003,.004))-.0026),0.);}}
 // the near arm (two fingers)
 {float d2=sdCap(r,vec2(-.075,.03),vec2(-.065,-.02),.014,.010);d2=min(d2,sdCap(r,vec2(-.065,-.02),vec2(-.09,-.035),.006,.004));d2=min(d2,sdCap(r,vec2(-.065,-.02),vec2(-.085,-.045),.005,.0035));
  if(needB)d2=max(d2,dB-G);PIECE(d2,mix(belly,back,.45),K_SCALE,r*130.,vec2(1,0),.012,1.,0.);}
 // the near leg: the big thigh, the shin, the long foot, the toes with dark claws
 {float d3=sdEll(rot(.42)*(r-vec2(.17,.02)),vec2(.085,.13));d3=smin(d3,sdCap(r,LK,LA,.046,.032),.02);
  d3=smin(d3,sdCap(r,LA,LB,.028,.022),.01);d3=smin(d3,sdCap(r,LB+vec2(0.,-.004),LT,.018,.012),.01);
  if(needB)d3=max(d3,dB-G);vec3 la=mix(belly,back,ss(-.2,.1,r.y))*.97;PIECE(d3,la,K_SCALE,r*vec2(150.,175.),vec2(1,0),.06,1.,0.);
  float cl=sdCap(r,LT+vec2(.006,0.),LT+vec2(-.016,-.006),.007,.0015);if(needB)cl=max(cl,dB-G);PIECE(cl,vec3(.12,.10,.09),K_IVORY,r*3.,vec2(1,0),.004,.6,0.);}
}
// A tyrannosaur chick, facing +x towards its mother: long tail, big head, long legs, a coat of down (criteria: down in young
// tyrannosaurs is a hypothesis). up: the neck up out of the ferns; chirp: the mouth open a little.
void chick(vec2 q,vec2 pos,float t,float up,float chirp,float seed,float grow){vec2 l=q-pos;
 float bob=.003*sin(t*4.+seed)*(1.-up*.5);
 bool needB=grow<.6;float dB=needB?chickBones(l):-1.;float G=grow*.25;
 if(needB&&grow<.5)PIECE(dB,vec3(.86,.82,.72),K_BONE,l*3.,vec2(1,0),.004,.8,0.);
 vec3 c=vec3(.66,.54,.36);float tt0;
 vec2 hc=vec2(.058,.052+.022*up+bob);
 float dl=min(sdCap(l,vec2(.0,.02),vec2(.014,-.022),.007,.004),sdCap(l,vec2(.014,-.022),vec2(.002,-.058),.004,.003));
 float dl2=min(sdCap(l,vec2(-.012,.02),vec2(-.004,-.02),.007,.004),sdCap(l,vec2(-.004,-.02),vec2(-.016,-.057),.004,.003));
 if(needB){dl=max(dl,dB-G);dl2=max(dl2,dB-G);}
 PIECE(dl2,vec3(.30,.24,.18),K_SKIN,l*40.,vec2(0,1),.004,1.,0.);
 float d=sdEll(rot(-.15)*(l-vec2(-.005,.025)),vec2(.036,.022));
 d=smin(d,sdTube(l,vec2(-.03,.028),vec2(-.07,.035),vec2(-.115,.03+.005*sin(t*2.+seed)),.012,.003,tt0),.01);
 d=smin(d,sdCap(l,vec2(.02,.03),hc-vec2(.01,.006),.012,.010),.01);
 float dh=smin(sdEll(l-hc,vec2(.018,.016)),sdCap(l,hc+vec2(.005,-.002),hc+vec2(.030,-.006),.010,.006),.008);d=smin(d,dh,.006);
 if(needB)d=max(d,dB-G);
 float dd=d-.0022*(vn(l*320.)-.4);PIECE(dd,c,K_FUZZ,l,vec2(1,0),.025,1.,0.);
 PIECE(dl,vec3(.36,.29,.22),K_SKIN,l*40.,vec2(0,1),.004,1.,0.);
 if(grow>.4){vec2 ec=hc+vec2(.003,.005);PIECE(length(l-ec)-.0042,vec3(.03),K_EYE,l,vec2(1,0),.002,0.,0.);veil(vec3(.95),cov(length(l-ec-vec2(.001,.0014))-.0014),0.);
  float mo=abs(l.y-(hc.y-.0075+.004*(l.x-hc.x)))-.0010-.0035*chirp*ss(.004,.026,l.x-hc.x);mo=max(mo,abs(l.x-hc.x-.019)-.014);PIECE(mo,vec3(.20,.12,.08),K_EYE,l,vec2(1,0),.002,0.,0.);}}
// A fern frond: an arching rachis with comb-like leaflets that get shorter towards the tip. b: base, ang: direction (0 up), len, bend.
float fernD(vec2 q,vec2 b,float ang,float len,float bend,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012);return max(d,max(-l.y,l.y-len));}
void ferns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float dec){for(int i=0;i<7;i++){if(float(i)>=n)break;float fi=float(i);
 float ang=(-1.15+2.3*fi/(n-1.))+.04*sin(t*.9+fi+seed);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;float d=fernD(q,base,ang,len,.35*sign(ang),fu);
 PIECE(d,col*(.85+.3*h11(fi*3.+seed)),K_PLANT,fu*vec2(1.,6.),vec2(0,1),.004,.6,dec);}}
// A layer of far forest seen through the haze: tall narrow conifers and round crowns of broadleaf trees.
void forest(vec2 q,float base,float hgt,float fr,vec3 c,float k,float seed){
 float x=q.x*fr+seed,ci=floor(x),fx=fract(x);float top=-1.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);float hh=h11(cj+seed);float cx=float(j)+.5+(h11(cj*1.7)-.5)*.5;
  float tall=hgt*(.55+.6*hh);float con=step(.5,h11(cj+9.));
  float yy=con>.5?base+tall-abs(fx-cx)/fr*5.5*(1.+.25*sin((fx-cx)*60.)):base+tall*.75*sqrt(max(0.,1.-pow((fx-cx)/.8,2.)))+.012*vn(vec2(q.x*60.,cj));top=max(top,yy);}
 top+=.004*(vn(vec2(q.x*120.,1.))-.5);
 PIECE(q.y-top,c,K_FAR,q*k,vec2(1,0),.05,.12,1.);}
void hellCreek(vec2 q,float t){
 SUNL=normalize(vec3(-.55,.55,.62));SUNC=vec3(1.30,1.08,.78);AMBC=vec3(.50,.50,.46);
 vec2 sp=vec2(-.50,.30);float ds=length(q-sp);
 vec3 sky=mix(vec3(.98,.86,.62),vec3(.60,.70,.74),ss(.0,.5,q.y));sky=mix(sky,vec3(1.,.95,.80),ss(.5,.0,ds)*.6);
 PIECE(-1.,sky,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
 veil(vec3(1.,.97,.85),ss(.045,.032,ds)*.9,1.);veil(vec3(1.,.93,.75),ss(.22,.0,ds)*.3,1.);
 forest(q,-.02,.20,5.,vec3(.80,.79,.64),2.,1.);
 veil(vec3(.96,.89,.72),.25,1.);
 forest(q,-.05,.16,7.5,vec3(.55,.58,.42),3.,7.);
 veil(vec3(.93,.87,.70),ss(.0,-.08,q.y)*.25,1.);
 // the ground: mud and low ferns
 float dg=q.y-(-.075+.008*fbm2(vec2(q.x*6.,3.)));vec3 ga=mix(vec3(.42,.42,.25),vec3(.36,.32,.21),ss(-.1,-.45,q.y));
 PIECE(dg,ga,K_MUD,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);
 for(int r=0;r<3;r++){float fr=float(r);float y0=-.085-fr*.06;float sc=.035+fr*.03;float cw=sc*2.2;float x=q.x/cw+fr*3.1;float ci=floor(x);
  float on=step(.42,h11(ci+fr*5.));vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.4-fr*3.1)*cw,y0+(h11(ci+7.)-.5)*.02);
  if(on>.5)ferns(q,b,sc*1.5,t,5.,ci,vec3(.36,.44,.20)*(1.-fr*.08),1.);}
 // the pool on the left, reflecting the sky
 float dp=sdEll(q-vec2(-.52,-.385),vec2(.40,.075));
 vec3 wc=mix(vec3(.84,.80,.64),vec3(.52,.60,.60),ss(-.36,-.46,q.y));
 PIECE(dp,wc,K_WATER,q*vec2(1.,4.),vec2(1,0),.02,.2,1.);
}
void sceneRex(vec2 q,float t,float grow){
 hellCreek(q,t);
 // the booms (three, closed mouth), the head lowered for them; then turned down towards the chicks
 float bp=0.;for(int i=0;i<3;i++){float tb=4.6+float(i);bp=max(bp,ss(tb-.15,tb+.12,t)*ss(tb+.62,tb+.25,t));}
 Rex a=Rex(ss(4.2,4.6,t)*(1.-ss(7.,7.5,t)),ss(9.0,9.8,t)*(1.-ss(11.4,12.2,t)),ss(3.9,4.5,t)*(1.-ss(7.,7.8,t)));
 // rings on the pool at each boom (criteria: an artistic sign of the low sound)
 float dp=sdEll(q-vec2(-.52,-.385),vec2(.40,.075));
 if(dp<0.&&uDecor<1.5){for(int i=0;i<3;i++){float ag=t-4.62-float(i);if(ag<0.||ag>1.6)continue;vec2 l=(q-vec2(-.40,-.39))/vec2(1.,.19);float rr=length(l);float ri=abs(rr-ag*.16)-.003;
   veil(vec3(.96,.93,.82),ss(.004,.0,ri)*(1.-ag/1.6)*.6,1.);}}
 shadow(ss(1.,.3,length((q-vec2(.17,TG+.002))/vec2(.20,.022))),vec3(.62,.60,.70),1.);
 trex(q,t,a,grow,bp);
 // the chicks, partly behind the ferns: they come up at the booms and chirp back
 float up=ss(4.75,5.3,t)*(1.-ss(11.5,12.3,t));float ch1=ss(9.2,9.35,t)*ss(9.75,9.6,t)+ss(10.2,10.35,t)*ss(10.75,10.6,t);float ch2=ss(9.6,9.75,t)*ss(10.15,10.0,t)+ss(10.6,10.75,t)*ss(11.1,10.95,t);
 shadow(ss(1.,.3,length((q-vec2(-.60,TG+.003))/vec2(.07,.010))),vec3(.6,.6,.7),1.);shadow(ss(1.,.3,length((q-vec2(-.74,TG+.008))/vec2(.07,.010))),vec3(.6,.6,.7),1.);
 chick(q,vec2(-.60,TG+.058),t,up,ch1,0.,grow);chick(q,vec2(-.74,TG+.064),t+.5,ss(5.0,5.6,t)*(1.-ss(11.6,12.4,t)),ch2,2.,grow);
 ferns(q,vec2(-.66,TG-.035),.11,t,6.,3.,vec3(.30,.42,.17),1.);
 // dragonflies over the pool
 for(int i=0;i<2;i++){float fi=float(i);vec2 c=vec2(-.30+.22*sin(t*.35+fi*2.)+fi*.10,-.15+.04*sin(t*.6+fi*4.));float dd=sdCap(q,c-vec2(.018,0.),c+vec2(.018,0.),.0025,.0015);
  float dw=min(sdEll(rot(.3)*(q-c-vec2(-.004,.008)),vec2(.013,.004)),sdEll(rot(-.3)*(q-c-vec2(-.004,-.008)),vec2(.013,.004)));
  veil(vec3(.85,.92,.95),ss(.002,-.001,dw)*.45,1.);PIECE(dd,vec3(.10,.30,.40),K_SKIN,q*200.,vec2(1,0),.002,.5,1.);}
 // ferns in front, at the bottom corners
 ferns(q,vec2(.74,-.58),.27,t,6.,9.,vec3(.24,.34,.14),1.);ferns(q,vec2(-.22,-.60),.18,t,5.,5.,vec3(.27,.37,.15),1.);
}
void fossilRex(vec2 q){float d=trexBones(q,0.);PIECE(d,vec3(.64,.60,.52),K_FOSSIL,q*3.,vec2(1,0),.012,.6,0.);
 float dc=min(chickBones(q-vec2(-.60,TG+.058)),chickBones(q-vec2(-.74,TG+.064)));PIECE(dc,vec3(.64,.60,.52),K_FOSSIL,q*3.,vec2(1,0),.004,.6,0.);}

const vec2 WIN_C=vec2(.02,0.);
void fossil(vec2 q){fossilRex(q);}
void life(vec2 q,float t){sceneRex(q,t,GROW);}

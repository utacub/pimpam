#if PASS==1||PASS==3
// ---- Scene 1: woolly mammoths on the mammoth steppe in winter (a mother and her calf). Low sun on the right. Key moment 4–7 s:
// the mother raises her trunk and trumpets softly, then shakes, and the snow falls from her wool; 9–11 s the calf answers and the two
// trunks touch. Before that, 2–4 s, the calf plays with its trunk in the snow. ----
const float MG=-.30; // the ground under their feet
// The trunk: six segments from the base, each at an angle th from straight down (towards the front: the mammoth faces -x).
const float TL[6]=float[](.060,.058,.055,.052,.048,.044);
const float TR_REST[6]=float[](.30,.22,.12,.02,-.12,-.35);
const float TR_UP[6]=float[](1.35,1.75,2.15,2.45,2.65,2.80);
const float TR_TOUCH[6]=float[](.80,1.00,1.15,1.25,1.30,1.35);
const float TR_PLAY[6]=float[](.42,.30,.16,.06,.02,.0);
// distance to the trunk, its parameter along (0 base .. 1 tip), and the tip
float trunkD(vec2 m,vec2 base,float kUp,float kTouch,float kPlay,float t,float sd,out float tu,out vec2 tip){
 vec2 o=base;float d=1e5;tu=0.;float acc=0.;
 for(int i=0;i<6;i++){float fi=float(i);float th=TR_REST[i]+.07*sin(t*1.1+fi*.6+sd)*(1.-kUp);
  th=mix(th,TR_PLAY[i]+.18*sin(t*6.5+fi*.9)*fi/5.,kPlay);th=mix(th,TR_TOUCH[i],kTouch);th=mix(th,TR_UP[i]+.05*sin(t*3.+fi),kUp);
  vec2 n=o+vec2(-sin(th),-cos(th))*TL[i];float u=segU(m,o,n);float r=mix(.044,.013,pow((acc+u*TL[i])/.317,.8));float e=length(m-mix(o,n,u))-r;
  if(e<d){d=e;tu=(acc+u*TL[i])/.317;}acc+=TL[i];o=n;}
 tip=o;return d;}
// The bones of a mammoth in its own frame (facing -x): skull, jaw, tusks, spine with tall spines over the shoulders, ribs, shoulder
// blade, pelvis, legs, tail.
float mamBones(vec2 m,float calf){float d=1e5;
 // a calf's skeleton sits lower in its body: squeeze what is above its belly
 if(calf>.5){m.y=m.y>-.15?-.15+(m.y+.15)*1.2:m.y;m.x*=1.1;}
 float sk=sdEll(m-vec2(-.13,.06),vec2(.08,.10));sk=smin(sk,sdEll(m-vec2(-.10,.13),vec2(.055,.05)),.02);sk=max(sk,-sdEll(m-vec2(-.155,.07),vec2(.022,.020)));
 sk=max(sk,-sdEll(m-vec2(-.12,.13),vec2(.025,.025)));d=min(d,sk);
 d=min(d,sdCap(m,vec2(-.09,-.04),vec2(-.17,-.05),.024,.016));
 if(calf<.5){float tt;d=min(d,sdTube(m,vec2(-.185,-.015),vec2(-.43,-.27),vec2(-.34,.005),.022,.007,tt));}
 // spine
 d=min(d,sdSeg(m,vec2(-.06,.11),vec2(.04,.15))-.012);d=min(d,sdSeg(m,vec2(.04,.15),vec2(.22,.12))-.012);d=min(d,sdSeg(m,vec2(.22,.12),vec2(.38,.03))-.011);
 d=min(d,sdSeg(m,vec2(.38,.03),vec2(.45,-.06))-.007);
 for(int i=0;i<6;i++){float x=-.03+float(i)*.035;float y0=mix(.12,.15,sat((x+.06)/.1));d=min(d,sdSeg(m,vec2(x,y0),vec2(x-.012,y0+.045-float(i)*.006))-.006);}
 for(int i=0;i<8;i++){float x=-.01+float(i)*.04;float y0=x<.04?mix(.11,.15,(x+.06)/.1):mix(.15,.06,(x-.04)/.34);
  vec2 a=vec2(x,y0-.01),b=vec2(x+.035,y0-.10),c=vec2(x+.015,-.13);float tt;d=min(d,sdTube(m,a,b,c,.008,.006,tt));}
 d=min(d,sdEll(rot(-.25)*(m-vec2(.02,.04)),vec2(.035,.075)));
 float pv=sdEll(m-vec2(.33,.04),vec2(.055,.06));pv=max(pv,-sdEll(m-vec2(.335,.035),vec2(.02,.022)));d=min(d,pv);
 // legs (near pair; the far pair a little behind)
 for(int i=0;i<2;i++){float x0=i==0?.0:.30;vec2 hip=vec2(x0,i==0?.0:.03);vec2 kn=vec2(x0+.005,-.15);vec2 ft=vec2(x0,-.285);
  d=min(d,sdCap(m,hip,kn,.024,.018));d=min(d,sdCap(m,kn,ft,.018,.016));d=min(d,length(m-kn)-.024);d=min(d,sdEll(m-ft-vec2(0.,.008),vec2(.04,.012)));}
 return d;}

#if PASS==3
// One mammoth: pos and size s in the scene; flip -1 if it faces +x; calf 1 for the calf (no tusks, a bigger head, shorter legs, a
// lighter and fluffier coat). grow: how far the flesh has grown out from the bones (large: all of it).
// Profile (after the frozen carcasses and cave art): a high domed head, a dip at the neck, a hump over the shoulders, a back that
// slopes down to a low rump, a short tail, small ears, a long outer coat that hangs like a skirt to the knees.
struct Mam{float kUp,kTouch,kPlay,shake,snow;};
const vec2 TK0=vec2(-.185,-.015),TK1=vec2(-.43,-.27),TK2=vec2(-.34,.005); // the tusk (a Bézier)
void mammoth(vec2 q,vec2 pos,float s,float flip,float calf,float t,Mam a,float grow,out vec2 tipW){
 vec2 m=(q-pos)/s;m.x*=flip;float px0=PX;
 // breathing and the shake (the coat swings more than the body)
 float br=sin(t*1.25+calf*2.);m.y-=br*.0025*ss(-.2,.1,m.y);
 float shk=a.shake*sin(t*TAU*3.);m.x-=shk*.008*ss(-.25,.1,m.y);
 bool needB=grow<.6;float dB=needB?mamBones(m,calf):-1.;float G=grow;
 vec3 wool=mix(vec3(.34,.22,.14),vec3(.46,.31,.20),calf),skin=mix(vec3(.42,.36,.31),vec3(.46,.39,.33),calf);
 vec2 uw=m*mix(1.,.62,calf); // the coat's own coordinates: a calf's locks are not smaller than its mother's
 // the bones, while the flesh has not yet covered them
 if(needB&&G<.5)PIECE(dB*s,vec3(.88,.84,.74),K_BONE,m*3.,vec2(1,0),.01,.8,0.);
 float lh=mix(-.075,-.11,calf); // where the legs start
 // the far legs: shaggy to the ankle, darker, a little higher on the screen (further away)
 for(int i=0;i<2;i++){float x0=i==0?.065:.255;if(calf>.5)x0=i==0?.06:.20;float d=sdCap(m,vec2(x0,lh),vec2(x0+.004,-.27),.050,.046);
  float df=sdBox(m-vec2(x0+.004,-.272),vec2(.044,.016))-.008;
  float yf=-.235-.022*pow(abs(sin(m.x*70.+float(i)*2.)),.6);float dh=max(d-.008,yf-m.y);
  if(needB){df=max(df,dB-G);dh=max(dh,dB-G);}
  PIECE(df*s,skin*.6,K_SKIN,m*vec2(1.,.6),vec2(0,-1),.03,1.,0.);PIECE(dh*s,wool*.55,K_WOOL,uw+3.,vec2(0,-1),.05,1.,0.);}
 // the far tusk (behind the head), the tail
 float tt;
 if(calf<.5){float d=sdTube(m-vec2(.018,.008),TK0,TK1,TK2,.024,.007,tt);if(needB)d=max(d,dB-G);PIECE(d*s,vec3(.62,.55,.44),K_IVORY,m*3.,vec2(-.4,-.9),.02,1.,0.);}
 {vec2 ta=mix(vec2(.385,.05),vec2(.30,.03),calf),tb=mix(vec2(.43,-.05),vec2(.33,-.03),calf);float d=sdCap(m,ta,tb,.014,.008);d=smin(d,sdEll(m-tb-vec2(.005,-.02),vec2(.013,.028)),.01);if(needB)d=max(d,dB-G);PIECE(d*s,wool*.85,K_WOOL,uw,normalize(vec2(.35,-1.)),.02,1.,0.);}
 // the coat: head, hump, body, the skirt of long hair and the near legs, all one piece of wool with one outline
 float dHead=sdEll(m-mix(vec2(-.125,.075),vec2(-.115,.06),calf),mix(vec2(.095,.115),vec2(.115,.12),calf));
 float dHump=sdEll(m-mix(vec2(.05,.06),vec2(.04,.04),calf),mix(vec2(.15,.115),vec2(.14,.10),calf));
 float dBody=sdEll(m-mix(vec2(.17,-.01),vec2(.13,-.03),calf),mix(vec2(.24,.15),vec2(.20,.13),calf));
 float d=smin(smin(dBody,dHump,.05),dHead,.04);
 // the skirt: ends in pointed locks of different lengths, swinging with the shake
 float lx=m.x*mix(42.,30.,calf)+.3*sin(t*.7);float li=floor(lx),lf=fract(lx);
 float yb=mix(-.20,-.19,calf)-.032*h11(li)*(1.-abs(2.*lf-1.))-.008*h11(li+3.)+shk*.006*ss(-.1,.2,m.x);
 float dSk=max(sdBox(m-mix(vec2(.155,-.10),vec2(.12,-.10),calf),mix(vec2(.215,.09),vec2(.17,.07),calf))-.045,yb-m.y);
 d=smin(d,dSk,.02);
 // the near legs: shaggy to the ankle
 float dl=1e5;for(int i=0;i<2;i++){float x0=i==0?-.005:.305;if(calf>.5)x0=i==0?.0:.24;float e=sdCap(m,vec2(x0,lh),vec2(x0+.004,-.262),.056,.050);
  float yf=-.240-.020*pow(abs(sin(m.x*70.+float(i)*2.+1.)),.6);dl=min(dl,max(e,yf-m.y));}
 d=smin(d,dl,.015);
 // a ragged edge where the outer hair sticks out
 float dW=d-.0035*(vn(uw*vec2(60.,25.))-.35);
 if(needB)dW=max(dW,dB-G);
 // the direction of the hair: down and back on the body, down on the legs and the skirt, forward-down on the face
 vec2 dir=normalize(mix(vec2(.38,-1.),vec2(.05,-1.),ss(-.08,-.16,m.y)));dir=normalize(mix(dir,vec2(-.25,-1.),ss(-.03,-.10,m.x)*ss(-.02,.08,m.y)));
 PIECE(dW*s,wool,K_WOOL,uw,dir,mix(.13,.12,calf),1.,0.);
 // the near legs and the skirt in shade where they hang in front of the body (a soft shadow line, not an outline)
 shadow(ss(.012,-.004,dW)*ss(.02,.0,abs(dl-.004))*ss(-.10,-.14,m.y)*.35,vec3(.4,.35,.35),0.);
 // the feet: round, wrinkled, with nails, under the hair
 for(int i=0;i<2;i++){float x0=i==0?-.005:.305;if(calf>.5)x0=i==0?.0:.24;float df=smin(sdEll(m-vec2(x0+.004,-.268),vec2(.054,.022)),sdBox(m-vec2(x0+.004,-.276),vec2(.05,.010)),.01);
  if(needB)df=max(df,dB-G);PIECE(df*s,skin,K_SKIN,m*vec2(1.,.6),vec2(1,0),.02,1.,0.);
  for(int k=0;k<3;k++){float nk=sdEll(m-vec2(x0-.034+float(k)*.016,-.279),vec2(.0075,.0055));if(needB)nk=max(nk,dB-G);shadow(ss(.002,-.002,nk)*.25,vec3(1.25,1.2,1.1),0.);}
  // the hair falls over the top of the foot
  float yf=-.240-.020*pow(abs(sin(m.x*70.+float(i)*2.+1.)),.6);float dh=max(sdCap(m,vec2(x0,-.2),vec2(x0+.004,-.262),.058,.052),yf-m.y);if(needB)dh=max(dh,dB-G);
  PIECE(dh*s,wool*.95,K_WOOL,uw+5.,vec2(.05,-1.),.04,.0,0.);}
 // the frost and snow on the top of the back and head
 if(a.snow>.01){float gy=dFdy(d)/max(length(vec2(dFdx(d),dFdy(d))),1e-9);float sn=ss(.45,.95,gy)*ss(-.030-.025*vn(m*28.),-.004,d)*ss(.0,-.004,dW)*a.snow;
  if(sn>.01)PIECE((.5-sn)*.008,vec3(.92,.94,.98),K_SNOW,m*2.,vec2(1,0),.02,0.,0.);}
 // the ear: small and furry, only a darker patch with a soft shadow under it
 {float de=sdEll(m-mix(vec2(-.045,.085),vec2(-.03,.08),calf),vec2(.03,.042));shadow(ss(.006,-.012,de)*.35,vec3(.45,.4,.38),0.);shadow(ss(.004,-.004,de-.002)*ss(.0,.02,-(m.y-.07))*.25,vec3(.3,.25,.25),0.);}
 // the trunk (wrinkled skin with a little hair)
 float tu;vec2 tip;float dt=trunkD(m,vec2(-.205,.025),a.kUp,a.kTouch,a.kPlay,t,calf*3.,tu,tip);
 tipW=pos+vec2(tip.x*flip,tip.y)*s;
 if(needB)dt=max(dt,dB-G);
 PIECE(dt*s,mix(wool*.9,skin,.5+.3*tu),K_SKIN,m*vec2(1.,1.),vec2(0,-1),.03,1.,0.);
 // the near tusk, the eye
 if(calf<.5){float d2=sdTube(m,TK0,TK1,TK2,.025,.007,tt);if(needB)d2=max(d2,dB-G);PIECE(d2*s,vec3(.87,.81,.68),K_IVORY,m*3.,normalize(vec2(-.4,-.9)),.02,1.,0.);}
 if(G>.3){vec2 ec=mix(vec2(-.165,.085),vec2(-.15,.10),calf);float bl=ss(.0,.03,fract(t/4.3+calf*.4))*ss(.08,.05,fract(t/4.3+calf*.4));
  shadow(ss(.02,.0,length(m-ec))*.3,vec3(.5,.42,.4),0.);
  vec2 el=m-ec;el.y/=max(.1,1.-bl);float de=length(el)-mix(.0085,.011,calf);
  PIECE(de*s,vec3(.03,.02,.015),K_EYE,m,vec2(1,0),.005,0.,0.);
  if(bl<.5)veil(vec3(.9),cov((length(m-ec-vec2(-.003,.003))-.003)*s),0.);}
 PX=px0;}
// The breath of a mammoth: a puff of vapour from the tip of the trunk, at times (fades as it grows).
void breath(vec2 q,vec2 tip,float age,float big){if(age<0.||age>2.2)return;vec2 c=tip+vec2(-.03,.04)*age*(1.+big);float r=.02+.05*age*(.6+.6*big);
 float n=fbm(q*30.-vec2(0.,age*.5));float a=ss(r,r*.2,length(q-c)+.02*(n-.5))*(1.-age/2.2)*(.35+.25*big);
 if(ST==2){vec2 g=q*230.,ci=floor(g),f=fract(g)-.5;a*=ss(.45,.3,length(f))*1.4;}
 veil(vec3(.94,.95,.98),a,1.);}

// The steppe: sky with a low sun on the right, far snowy mountains, a herd far away, the snow with dry grass.
void steppe(vec2 q,float t){
 SUNL=normalize(vec3(.75,.25,.55));SUNC=vec3(1.45,1.20,.92);AMBC=vec3(.40,.46,.60);
 vec2 sp=vec2(.62,.10);float ds=length(q-sp);
 vec3 sky=mix(vec3(.93,.83,.70),vec3(.48,.60,.78),ss(-.05,.45,q.y));sky=mix(sky,vec3(1.,.93,.78),ss(.45,.0,ds)*.55);
 PIECE(-1.,sky,K_SKY,q+vec2(t*.003,0.),vec2(1,0),.1,0.,1.);
 // thin long clouds
 float cl=fbm(vec2(q.x*1.6+t*.006,q.y*9.))*ss(.10,.25,q.y)*ss(.48,.30,q.y);veil(mix(vec3(.96,.92,.88),vec3(.80,.82,.88),ss(.2,.4,q.y)),ss(.55,.75,cl)*.7,1.);
 // the sun, soft
 veil(vec3(1.,.97,.86),ss(.040,.030,ds),1.);veil(vec3(1.,.95,.82),ss(.16,.0,ds)*.25,1.);
 // far mountains with snow
 float mh=.035+.075*fbm2(vec2(q.x*2.4+3.,.5))+.02*abs(sin(q.x*7.));float dm=q.y-mh+.04;
 vec3 mc=mix(vec3(.66,.72,.84),vec3(.88,.90,.95),ss(.0,.04,q.y-mh+.06));
 PIECE(dm,mc,K_FAR,q*2.,vec2(1,0),.1,.15,1.);
 // rolling snowy hills
 float hh=-.025+.022*fbm2(vec2(q.x*4.+11.,.2));float dh=q.y-hh;
 PIECE(dh,vec3(.84,.87,.93),K_FAR,q*3.,vec2(1,0),.1,.2,1.);
 // a herd far away (small, pale with the distance), on the right
 for(int i=0;i<3;i++){float fi=float(i);vec2 c=vec2(.50+fi*.11+.03*sin(fi*3.),-.022-fi*.004);float sc=.055-.006*fi;vec2 l=(q-c)/sc;
  float dd=smin(sdEll(l-vec2(.1,0.),vec2(.38,.26)),sdEll(l-vec2(-.28,.05),vec2(.17,.2)),.1);dd=min(dd,sdBox(l-vec2(.1,-.32),vec2(.3,.12)));
  dd=min(dd,sdCap(l,vec2(-.40,-.02),vec2(-.45,-.40),.06,.04));
  PIECE(dd*sc,mix(vec3(.45,.40,.42),vec3(.72,.74,.82),.55),K_FAR,q*4.,vec2(1,0),.01,.25,1.);}
 // the snow: a plane seen from a little above
 float gy=q.y-(-.035);float dg=gy;
 vec2 gu=vec2(q.x/max(.06,-q.y+.02),1./max(.012,-q.y-.03));
 vec3 sn=mix(vec3(.80,.84,.93),vec3(.95,.95,.97),ss(-.05,-.5,q.y));float drift=fbm2(vec2(q.x*3.,q.y*16.+.2/max(.05,-q.y)));sn*=mix(vec3(.84,.88,1.),vec3(1.03,1.02,1.),ss(.35,.65,drift));
 PIECE(dg,sn,K_SNOW,vec2(q.x,q.y*3.),vec2(1,0),.2,0.,1.);
 // tufts of dry grass and sedge through the snow: rows in depth (nearer rows bigger), each tuft a fan of thin curved blades
 for(int r=0;r<5;r++){float fr=float(r);float y0=-.055-fr*fr*.02-fr*.022;float sc=.22+fr*.32;float cw=sc/7.;float x=q.x/cw+fr*7.3;float ci=floor(x);
  if(h11(ci+fr*19.)<.45)continue;float cx=(ci+.5+(h11(ci*2.3)-.5)*.5-fr*7.3)*cw;float yb=y0+(h11(ci+5.)-.5)*.012*sc;float hgt=(.014+.022*h11(ci+3.))*sc*(1.+fr*.2);
  if(abs(q.x-cx)>hgt*1.2||q.y<yb-.004||q.y>yb+hgt*1.1)continue;
  float dd=1e5;for(int b=0;b<5;b++){float fb=float(b)-2.;float hb=hgt*(.55+.45*h11(fb+ci*3.));vec2 tip=vec2(cx+fb*hgt*.22+hb*.25*sin(t*1.2+ci+fb*.3)*.4,yb+hb);
   vec2 mid=vec2(cx+fb*hgt*.06,yb+hb*.55);float tb;float e=sdTube(q,vec2(cx+fb*hgt*.04,yb),mid,tip,.0012*sc*2.,.0002,tb);dd=min(dd,e);}
  vec3 ga=mix(vec3(.55,.44,.25),vec3(.80,.68,.44),h11(ci+8.));PIECE(dd,ga,K_GRASS,vec2(q.x*3.,q.y),vec2(0,1),.002,.2,1.);}
 // footprints in the snow behind the two mammoths
 for(int i=0;i<7;i++){float fi=float(i);vec2 c=vec2(.48+fi*.075+.012*sin(fi*2.),-.29+fi*.012+(mod(fi,2.)-.5)*.012);float e=length((q-c)/vec2(.026-.002*fi,.007-.0006*fi))-1.;
  shadow(ss(.3,-.4,e)*.25,vec3(.55,.62,.86),1.);}
}
void flakes(vec2 q,float t){for(int i=0;i<3;i++){float fi=float(i);vec2 w=q+vec2(sin(t*.4+fi*2.+q.y*3.)*.02,t*(.030+fi*.018));
  vec2 g=w*(22.-fi*6.)+fi*7.,ci=floor(g),f=fract(g)-.5-(h22(ci)-.5)*.6;float rr=.025+.022*fi;float r=length(f)-rr;
  float on=step(.62,h21(ci+fi));float a=on*ss(.035,-.01,r)*(.45+.25*fi);
  veil(vec3(.97,.98,1.),a,1.);}}
void sceneMamut(vec2 q,float t,float grow){
 steppe(q,t);
 // the play of the calf in the snow, the trumpet of the mother, the shake, the answer, the touch
 Mam mo=Mam(ss(4.,4.55,t)*(1.-ss(5.55,6.1,t)),ss(9.3,10.1,t)*(1.-ss(11.1,11.9,t)),0.,ss(5.8,6.0,t)*(1.-ss(6.8,7.1,t)),1.-.85*ss(5.9,6.9,t));
 Mam ca=Mam(ss(8.9,9.4,t)*(1.-ss(10.6,11.3,t)),0.,ss(1.7,2.2,t)*(1.-ss(3.9,4.5,t)),0.,1.);
 // soft shadows on the snow
 shadow(ss(1.,.3,length((q-vec2(.16,MG+.005))/vec2(.36,.035))),vec3(.62,.66,.84),1.);
 shadow(ss(1.,.3,length((q-vec2(-.55,MG+.005))/vec2(.15,.02))),vec3(.62,.66,.84),1.);
 vec2 tipM,tipC;
 mammoth(q,vec2(0.),1.,1.,0.,t,mo,grow,tipM);
 mammoth(q,vec2(-.60,-.175),.44,-1.,1.,t+1.3,ca,grow,tipC);
 // vapour of the breath: the mother at the trumpet and every few seconds; the calf when it answers; puffs of snow when it plays
 breath(q,tipM,t-4.75,1.);breath(q,tipM,mod(t+1.5,3.6)-.2,0.);breath(q,tipC,t-9.25,.6);
 for(int i=0;i<3;i++){float t0=2.55+float(i)*.6,ag=t-t0;if(ag<0.||ag>1.4)continue;
  for(int j=0;j<6;j++){float fj=float(j);vec2 v=vec2((h11(fj+float(i)*7.)-.5)*.12,.10+.08*h11(fj*3.1));vec2 c=vec2(-.49,MG+.01)+v*ag+vec2(0.,-.18*ag*ag);
   veil(vec3(.95,.96,.99),ss(.008,.002,length(q-c))*(1.-ag/1.4),1.);}}
 // the snow shaken off the mother's back
 if(t>5.8&&t<8.5)for(int j=0;j<22;j++){float fj=float(j);float x0=-.08+.44*h11(fj*1.7);float y0=.15-.10*ss(.0,.36,abs(x0-.04));float t0=5.85+.6*h11(fj*2.3);float ag=t-t0;
  if(ag<0.)continue;vec2 c=vec2(x0+(h11(fj)-.5)*.10*ag,y0+.05*ag-.5*.55*ag*ag);if(c.y<MG-.01)continue;veil(vec3(.95,.97,1.),ss(.006,.0015,length(q-c)),1.);}
 flakes(q,t);
 // a drift of snow in front, at the bottom
 float df=q.y-(-.43+.03*fbm2(vec2(q.x*3.,.7))+.02*sin(q.x*2.));PIECE(df,vec3(.93,.94,.97),K_SNOW,q*1.6,vec2(1,0),.04,0.,1.);
}
#else
// The fossil of the scene, in the rock.
void fossilMamut(vec2 q){vec2 m=q;float d=mamBones(m,0.);PIECE(d,vec3(.70,.60,.46),K_FOSSIL,m*3.,vec2(1,0),.012,.6,0.);
 vec2 mc=(q-vec2(-.60,-.175))/.44;mc.x*=-1.;float dc=mamBones(mc,1.)*.44;PIECE(dc,vec3(.70,.60,.46),K_FOSSIL,mc*1.3,vec2(1,0),.006,.6,0.);}
#endif
#endif

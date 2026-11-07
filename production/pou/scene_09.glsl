// ---- Scene 10 (El pou del temps, CE37): Citipati osmolskae brooding at Ukhaa Tolgod (Djadochta Formation, Gobi, about 75 million
// years ago). An oviraptorid: a short deep skull with a toothless beak (horn) and a tall crest, a long neck, feathered arms and a fan of
// feathers at the end of a short tail. It broods like a bird: it sits in the open middle of a tight ring of elongated blue-green eggs,
// laid in pairs, sloping inwards and half buried in a low mound of sand, with its feathered arms spread back over them (the brooding
// specimen IGM 100/979, Norell et al. 1995; egg colour: Wiemann et al. 2017, 2018). Early morning: a warm low sun on the left, a hazy
// pale sky, buttes of red sandstone in the middle distance, long shadows on the rippled sand. 4.0–5.2 s the mother rises (the eggs
// show); 5.5–8.0 three eggs crack and three fluffy chicks come out; 9.0–11.0 she settles again and spreads her wings over them.
// Scale: .45 screen units per metre. ----
const float CG=-.31,CS=.45;
const vec2 WIN_C=vec2(-.05,-.12);
// While the window of life opens, the pixels well outside it show only stone: life() skips them (the tail masks them anyway), and
// fossil() skips the pixels well inside it (the window covers them).
bool outWin(vec2 q,float mg){if(uLife>=.999)return false;float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))>R+mg;}
const vec2 C0=vec2(.06,CG);  // the centre of the nest, on the ground
const float NR=.46,NK=.28;   // the radius of the ring of eggs (m); how much a step towards us moves down on the screen (the view from above)
const vec3 HAZE=vec3(.98,.86,.72);
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
float settle(float t,float t0){float a=t-t0;return a<0.?0.:exp(-a*5.5)*sin(a*19.);}
// One feather: root o, angle a, length L, half width w; u along it (0 root .. 1 tip), v across (-1 .. 1).
float vFeather(vec2 m,vec2 o,float a,float L,float w,out float u,out float v){vec2 dv=vec2(cos(a),sin(a));vec2 l=m-o;float al=dot(l,dv),ac=dot(l,vec2(-dv.y,dv.x));
 u=sat(al/L);float r=w*(.45+.55*ss(.0,.22,u))*(1.-.40*ss(.60,1.,u)*ss(.60,1.,u));v=ac/max(r,1e-4);return length(vec2(al-clamp(al,0.,L),ac))-r;}
// The vane of a feather: the narrow outer vane a little lighter, faint oblique barbs, a pale shaft, a lighter free edge, and the soft
// shadow of the feather that lies over it (sh: the distance to that feather's edge, m).
vec3 vVane(vec3 c,float u,float v,float te,float sh,float L){
 c*=mix(1.07,.92,ss(-1.,1.,v))*(.93+.09*sqrt(sat(1.-v*v)));
 float barb=.5+.5*sin(u*L*380.-abs(v)*16.);c*=.96+.06*barb*ss(.0,.2,u);
 c=mix(c,c*1.25+.03,ss(.14,.0,abs(v+.22))*ss(.95,.55,u)*.35);
 c=mix(c,c*1.28+.05,ss(-.012,-.002,te)*.55);
 c*=1.-.24*ss(.026,.0,sh);
 return c;}

// ---- The mother's pose (metres, facing -x; x along the ground, y up; the nest centre at the origin) ----
struct CP{vec2 hip;float ba;vec2 nb,nc,hd;float ha;vec2 kN,aN,bN,kF,aF,bF;vec2 sh,e,w,f;vec2 tb,tc,tt;float up,fold,coo,wob,tf;};
// where she looks while the eggs hatch: the egg that is hatching, then the chick that comes out of it
float citLookX(float t){float x=-.10;x=mix(x,-.23,ss(5.3,5.8,t));x=mix(x,-.45,ss(6.6,7.1,t));x=mix(x,.09,ss(7.3,7.8,t));x=mix(x,-.15,ss(8.4,9.,t));return x;}
CP cPose(float t){CP p;
 float br=sin(t*1.6);
 p.up=ss(4.25,5.2,t)*(1.-ss(9.0,10.1,t));                     // standing (0 brooding)
 p.fold=ss(4.0,4.55,t)*(1.-ss(9.8,10.9,t));                   // the wings folded at her sides (0 spread back over the nest)
 // soft coos: the throat swells (closed beak)
 p.coo=ss(6.15,6.35,t)*ss(6.85,6.55,t)+ss(7.75,7.95,t)*ss(8.45,8.15,t)+.8*ss(10.55,10.75,t)*ss(11.3,11.0,t);
 p.wob=settle(t,4.55)*.5+settle(t,10.9)*.7;
 p.tf=.3+.25*ss(4.3,4.9,t)*(1.-ss(5.2,5.8,t));
 vec2 hip=mix(vec2(.12,.36+.006*br),vec2(.13,.72+.004*br),p.up);
 float lean=ss(4.0,4.4,t)*(1.-ss(4.6,5.1,t))+ss(8.9,9.3,t)*(1.-ss(9.6,10.1,t));   // the weight forward before rising and before sitting
 hip.x-=.06*lean;
 float ba=mix(.10,.18,p.up)+.10*lean+.01*sin(t*.7);
 p.hip=hip;p.ba=ba;
 p.nb=hip+R2(vec2(-.47,.12),ba);
 // the head: upright on an S of neck while brooding; down towards the eggs while they hatch, following the one that is hatching
 float sc=t/2.3,si=floor(sc);float sa=mix(h11(si+.7)-.5,h11(si+1.7)-.5,ss(.0,.12,fract(sc)));
 vec2 hr=vec2(-.16,.44)+vec2(.02*sa,.012*sin(t*.9));
 float dn=ss(4.6,5.4,t)*(1.-ss(9.0,9.8,t));
 vec2 down=vec2(min(citLookX(t)-.20,-.60),.37+.03*sin(t*1.1))-p.nb;
 hr=mix(hr,vec2(-.22,.30),ss(3.75,4.2,t)*(1.-ss(4.3,4.9,t)));      // first beat: she looks down (something taps in an egg)
 hr=mix(hr,down,dn);
 hr+=vec2(.0,-.04)*lean;
 p.hd=p.nb+hr;
 p.nc=p.nb+mix(vec2(-.02,.30),vec2(-.24,.12),dn);
 p.ha=.05+.10*sa*(1.-p.up)+.55*dn+.25*ss(3.75,4.2,t)*(1.-ss(4.3,4.9,t))-.06*p.coo;
 // legs: folded under her while brooding (hidden), standing in the middle of the ring
 p.bN=vec2(-.16,.015);p.bF=vec2(.02,.03);
 float th=mix(1.38,.36,p.up);p.aN=p.bN+.21*vec2(sin(th),cos(th));p.aF=p.bF+.21*vec2(sin(th-.05),cos(th-.05));
 p.kN=knee(hip,p.aN,.38,.45,-1.);p.kF=knee(hip+vec2(.02,0.),p.aF,.38,.45,-1.);
 // arms (three bones of fixed length): spread back and down over the ring of eggs while brooding (the hands reach round its sides),
 // folded at the sides while standing (the wrist forward, the hand back, as in a bird)
 p.sh=hip+R2(vec2(-.37,.0),ba);
 float fo=p.fold;
 float aH=mix(-.78,-.55,fo),aU=mix(-.05+.02*br,2.94,fo),aK=mix(-.16,-.75,fo);
 p.e=p.sh+R2(.20*vec2(cos(aH),sin(aH)),ba);p.w=p.e+R2(.19*vec2(cos(aU),sin(aU)),ba);p.f=p.w+R2(.20*vec2(cos(aK),sin(aK)),ba);
 // the short tail with its fan: down to the sand while brooding
 float tl=mix(-.55,-.62,p.up)+.03*sin(t*.8)+.06*p.wob;
 p.tb=hip+R2(vec2(.14,.05),ba);float A=ba+tl;vec2 td=vec2(cos(A),sin(A)),tn=vec2(-td.y,td.x);
 p.tc=p.tb+td*.28+tn*.04;p.tt=p.tb+td*.55+tn*.02;
 return p;}

// ---- Bones ----
float cBones(vec2 m,CP p){float d=1e5;float tt;
 {vec2 b0=R2(m-p.hip,-p.ba);float c=sdCap(m,p.hd,p.hd+R2(vec2(-.2,0.),p.ha),.10,.06);c=min(c,sdCap(m,p.nb,p.hd,.05,.05));c=min(c,sdEll(b0-vec2(-.22,-.03),vec2(.36,.22)));
  c=min(c,sdCap(m,p.tb,p.tt,.05,.04));c=min(c,sdCap(m,p.hip,p.kN,.04,.04));c=min(c,sdCap(m,p.kN,p.aN,.04,.04));c=min(c,sdCap(m,p.aN,p.bN+vec2(-.14,0.),.03,.07));
  c=min(c,sdCap(m,p.hip,p.kF,.04,.04));c=min(c,sdCap(m,p.kF,p.aF,.04,.04));c=min(c,sdCap(m,p.aF,p.bF+vec2(-.14,0.),.03,.07));
  c=min(c,sdCap(m,p.sh,p.e,.03,.03));c=min(c,sdCap(m,p.e,p.w,.03,.03));c=min(c,sdCap(m,p.w,p.f,.03,.06));if(c>.05)return c-.04;}
 // skull: short and deep, the crest, the toothless jaws
 vec2 h=R2(m-p.hd,-p.ha);
 if(length(h-vec2(-.10,.03))<.22){
  float sk=smin(sdEll(h-vec2(-.05,.01),vec2(.065,.05)),sdEll(h-vec2(-.14,-.005),vec2(.065,.04)),.03);
  sk=smin(sk,sdEll(R2(h-vec2(-.12,.085),-.25),vec2(.035,.07)),.02);
  sk=max(sk,-sdEll(h-vec2(-.07,.03),vec2(.022,.022)));sk=max(sk,-sdEll(h-vec2(-.12,.02),vec2(.02,.015)));sk=max(sk,-sdEll(h-vec2(-.125,.09),vec2(.014,.04)));
  sk=max(sk,-sdEll(h-vec2(-.02,.0),vec2(.016,.02)));d=min(d,sk);
  float jw=sdCap(h,vec2(-.02,-.045),vec2(-.17,-.05),.018,.01);jw=max(jw,-sdEll(h-vec2(-.07,-.045),vec2(.025,.007)));d=min(d,jw);}
 for(int i=0;i<8;i++){float s0=(float(i)+.08)/8.,s1=(float(i)+.85)/8.;d=min(d,sdCap(m,bez(p.nb,p.nc,p.hd,s0),bez(p.nb,p.nc,p.hd,s1),.022,.020));}
 vec2 b=R2(m-p.hip,-p.ba);
 if(b.x>-.62&&b.x<.30&&b.y>-.40&&b.y<.20){
  for(int i=0;i<9;i++){float x=-.52+float(i)*.065;vec2 c=vec2(x,.10);d=min(d,sdEll(b-c,vec2(.026,.019)));d=min(d,sdSeg(b,c,c+vec2(.008,.045))-.007);}
  for(int i=0;i<8;i++){float x=-.50+float(i)*.06;vec2 a=vec2(x,.09);d=min(d,sdTube(b,a,a+vec2(.09,-.10),vec2(x+.04,-.17+float(i)*.012),.008,.006,tt));}
  d=min(d,sdCap(b,vec2(-.33,.10),vec2(-.47,-.02),.016,.02));
  d=min(d,sdEll(b-vec2(.0,.07),vec2(.16,.05)));d=min(d,sdCap(b,vec2(-.02,.0),vec2(.04,-.30),.016,.02));d=min(d,sdEll(b-vec2(.04,-.31),vec2(.04,.02)));
  d=min(d,sdCap(b,vec2(.06,.0),vec2(.15,-.10),.014,.01));}
 for(int i=0;i<8;i++){float s0=float(i)/8.,s1=s0+.10;d=min(d,sdCap(m,bez(p.tb,p.tc,p.tt,s0),bez(p.tb,p.tc,p.tt,s1),.020-.0015*float(i),.018-.0015*float(i)));}
 d=min(d,sdCap(m,p.sh,p.e,.016,.014));d=min(d,sdCap(m,p.e,p.w,.010,.009));{vec2 n=normalize(p.w-p.e);n=vec2(-n.y,n.x)*.013;d=min(d,sdCap(m,p.e+n,p.w+n,.007,.007));}
 vec2 K=p.f-p.w;vec2 kn=normalize(vec2(-K.y,K.x));
 d=min(d,sdCap(m,p.w,p.f,.009,.007));d=min(d,sdCap(m,p.w,p.w+K*.5+kn*.02,.008,.006));d=min(d,sdCap(m,p.w,p.w+K*.85-kn*.02,.008,.006));
 for(int L=0;L<2;L++){vec2 H=p.hip,Kn=L==0?p.kN:p.kF,A=L==0?p.aN:p.aF,B=L==0?p.bN:p.bF;
  d=min(d,sdCap(m,H,Kn,.022,.018));d=min(d,sdCap(m,Kn,A,.018,.013));d=min(d,sdCap(m,A,B,.012,.011));d=min(d,length(m-Kn)-.024);
  d=min(d,sdCap(m,B,B+vec2(-.13,-.012),.007,.005));d=min(d,sdCap(m,B,B+vec2(-.10,.0),.006,.005));}
 return d;}

// ---- The mother ----
// distances at this pixel (m) shared by the parts: the bones while the flesh grows, the coat of the body (for the contours of the
// parts that lie on it), the near wing (for the chicks under it)
float CDB=-1.,CDF=1e5,CWD=1e5;
// The angle of flight feather s (0 the innermost secondary .. 1 the outermost primary): hanging down and back over the eggs while she
// broods, along her side when folded.
float cWingA(float s,CP p){
 float aB=mix(-1.52,-.62,pow(s,1.1)),aF=mix(-.20,-.06,s);
 return mix(aB,aF,p.fold)+p.ba+.10*p.wob*s;}
// The near wing, one piece: 11 flight feathers (5 secondaries on the forearm, 6 primaries on the hand), over their roots a row of greater
// coverts and a row of shorter median coverts, the small marginal coverts along the arm. Each feather over the one below with a lighter
// free edge and a soft shadow on the one below. The dark contour only where the wing stands out of the body's outline.
void cWing(vec2 m,CP p,float dB,float G){
 vec2 lo=min(min(p.e,p.w),p.f)-.40,hi=max(max(p.e,p.w),p.f)+.40;if(m.x<lo.x||m.y<lo.y||m.x>hi.x||m.y>hi.y)return;
 float dU=1e5,tu=0.,tv=0.,tk=0.,te=0.,tL=.3,sh=1e5;vec2 tdir=vec2(1,0),to=vec2(0.);
 float gU=1e5,gu=0.,gv=0.,ge=0.,gsh=1e5;float mU=1e5,mu=0.,mv=0.,me=0.;
 for(int i=10;i>=0;i--){float k=float(i),s=k/10.;
  vec2 o=i<5?mix(p.e,p.w,(k+.5)/5.):mix(p.w,p.f,(k-4.4)/6.);
  float a=cWingA(s,p);float L=i<5?.31+.010*k:.41-.016*abs(k-7.);vec2 dv=vec2(cos(a),sin(a));
  float u,v;float ei=vFeather(m,o,a,L,.046,u,v);
  if(ei<0.){tu=u;tv=v;tk=k;te=ei;tdir=dv;to=o;tL=L;sh=1e5;}else if(dU<0.)sh=min(sh,ei);
  dU=min(dU,ei);
  ei=vFeather(m,o-dv*.008,a+.06,L*(i<5?.46:.38),.034,u,v);if(ei<0.){gu=u;gv=v;ge=ei;gsh=1e5;}else if(gU<0.)gsh=min(gsh,ei);gU=min(gU,ei);
  ei=vFeather(m,o-dv*.012,a+.10,L*(i<5?.27:.22),.030,u,v);if(ei<0.){mu=u;mv=v;me=ei;}mU=min(mU,ei);}
 // (the upper arm stays hidden in the plumage of the body: the wing comes out of it at the elbow)
 float dC=min(sdCap(m,p.e,p.w,.036,.030),sdCap(m,p.w,mix(p.w,p.f,.7),.030,.020));
 vec2 l=R2(m-p.e,-p.ba);dC-=.004*(vn(l*vec2(40.,60.))-.4);
 // while she broods, the tips of the flight feathers rest on the eggs and the sand
 if(p.fold<.5){float gy=-.155+.006*sin(m.x*23.);dU=max(dU,gy-m.y);gU=max(gU,gy-m.y);}
 if(G<.6){float gg=dB-G/CS;dU=max(dU,gg);gU=max(gU,gg);mU=max(mU,gg);dC=max(dC,gg);}
 float dW=min(min(dU,gU),min(mU,dC));CWD=dW;
 if(dW>.03)return;
 // flight feathers: grey-brown, the primaries a little darker, each feather a slightly different value, pale-edged tips
 vec3 c=mix(vec3(.42,.37,.32),vec3(.33,.29,.25),ss(4.,8.,tk))*(.94+.10*h11(tk*3.1+.5));
 c=mix(c,vec3(.66,.60,.52),ss(.86,.98,tu)*.45);
 c=vVane(c,tu,tv,te,sh,tL);
 // greater coverts, then median coverts, then the marginal coverts on the arm: each row lighter, with buff fringes
 {vec3 g=mix(vec3(.54,.48,.41),vec3(.46,.40,.34),gu);g=mix(g,vec3(.74,.67,.57),ss(.80,.97,gu)*.6);
  g=vVane(g,gu,gv,ge,gsh,.10);c=mix(c*(1.-.22*ss(.028,.0,gU)),g,cov(gU*CS));}
 {vec3 g=mix(vec3(.60,.53,.45),vec3(.52,.46,.39),mu);g=mix(g,vec3(.76,.69,.59),ss(.75,.97,mu)*.55);g=vVane(g,mu,mv,me,1e5,.06);
  c=mix(c*(1.-.20*ss(.024,.0,mU)),g,cov(mU*CS));}
 {vec3 g=mix(vec3(.58,.50,.42),vec3(.50,.43,.36),ss(.45,.75,fbm2(l*14.)));c=mix(c*(1.-.20*ss(.024,.0,dC)),g,cov(dC*CS));}
 // the wing's shadow on what lies under it (away from the sun)
 {vec2 gq=vec2(dFdx(dW),dFdy(dW));float aw=sat(dot(gq/max(length(gq),1e-9),-normalize(SUNL.xy)));
  shadow(ss(.05,.0,dW)*step(0.,dW)*aw*.35,vec3(.62,.54,.58),0.);}
 float line=ss(-.02,.03,CDF);
 PIECE(dW*CS,c,K_FEATHER,FU(m-to,tdir,1.6,6.),-tdir,.010,line,0.);}
void citipati(vec2 q,CP p,float t,float G){
 vec2 m=(q-C0)/CS;
 if(m.x<-1.25||m.x>1.25||m.y<-.20||m.y>1.75)return;
 bool needB=G<.6;float dB=needB?CDB:-1.;
 if(needB&&G<.5)PIECE(dB*CS,vec3(.88,.84,.74),K_BONE,m*3.,vec2(1,0),.006,.8,0.);
 // the far leg while she stands: darker, the feathered drumstick and the scaly foot in one piece
 if(p.up>.02){float d=sdCap(m,p.hip+vec2(.02,-.04),p.kF,.10,.065);d=smin(d,sdCap(m,p.kF,p.aF,.06,.03),.03);
  vec2 B=p.bF;float df=sdCap(m,p.aF,B,.028,.022);df=smin(df,sdCap(m,B,B+vec2(-.13,-.012),.016,.010),.01);df=min(df,sdCap(m,B+vec2(.0,.006),B+vec2(-.09,.0),.013,.010));
  float dl=min(d,df);if(needB)dl=max(dl,dB-G/CS);
  vec2 ld=normalize(p.aF-p.kF);
  PIECE(dl*CS,df<d?vec3(.30,.27,.23):vec3(.34,.29,.24),K_FEATHER,FU(m-p.kF,ld,.8,.5),-ld,.04,1.,0.);}
 // body, neck, tail, the feathered head and the tail fan: one coat of feathers
 vec2 b=R2(m-p.hip,-p.ba);
 float dTor=sdEll(R2(b-vec2(-.17,-.02),.05),vec2(.37,.26));
 float dCh=sdEll(b-vec2(-.40,-.02),vec2(.19,.23));
 float dHp=sdEll(b-vec2(.04,.02),vec2(.20,.18));
 float tn;float dNk=sdTube(m,p.nb,p.nc,p.hd+R2(vec2(-.04,-.02),p.ha),.12,.068,tn);
 float tq;float dTl=sdTube(m,p.tb,p.tc,p.tt,.12,.05,tq);
 float dTo=smin(smin(dTor,dCh,.08),dHp,.08);
 float wNk=ss(.05,-.05,dNk-dTo);
 float d=smin(dTo,dNk,.07);d=smin(d,dTl,.06);
 // the throat swells a little with each coo
 vec2 h=R2(m-p.hd,-p.ha);vec2 hh=h/1.15;float HS=1.15*CS;float tt;
 float dTh=sdEll(h-vec2(-.005,-.062-.008*p.coo),vec2(.046+.006*p.coo,.034+.014*p.coo));d=smin(d,dTh,.04);
 float dCra=sdEll(hh-vec2(-.045,.012),vec2(.072,.062));
 float dUp=sdTube(hh,vec2(-.085,.035),vec2(-.19,.025),vec2(-.205,-.05),.046,.007,tt);
 float dHf=smin(dCra,dUp+.012,.03)*1.15;
 float wHd=ss(.015,-.015,dHf-d);d=smin(d,dHf,.02);
 vec2 dirB=normalize(vec2(1.,-.30));
 vec2 nT=2.*(1.-tn)*(p.nc-p.nb)+2.*tn*(p.hd-p.nc);vec2 nTn=normalize(nT);vec2 nD=vec2(nTn.y,-nTn.x);
 float sn=dot(m-bez(p.nb,p.nc,p.hd,tn),nD)/mix(.12,.068,tn);
 vec2 dir=R2(dirB,p.ba);vec2 u=R2(FU(b,dirB,1.2,.65),p.ba);
 // on the neck the feathers run down it towards the body: coordinates along and across it
 if(wNk>.5){vec2 nd=normalize(-nTn+nD*.25);dir=nd;float al=tn*.75+dot(m-bez(p.nb,p.nc,p.hd,tn),nTn);u=nd*(-al*1.2)+vec2(-nd.y,nd.x)*(sn*mix(.12,.068,tn)*.65);}
 float dF=d-.006*(vn(m*vec2(14.,20.)+3.)-.35);
 if(needB)dF=max(dF,dB-G/CS);
 CDF=dF;
 // the tail fan (under the end of the tail)
 float fU=1e5,fu=0.,fv=0.,fe=0.,fsh=1e5,fL=.3;vec2 fdir=vec2(1,0),fo=vec2(0.);
 {vec2 lo=p.tt-.45,hi=p.tt+.45;if(m.x>lo.x&&m.y>lo.y&&m.x<hi.x&&m.y<hi.y){vec2 tg=normalize(p.tt-p.tc);float a0=atan(tg.y,tg.x);
  for(int i=0;i<9;i++){float k=float(i)-4.;float a=a0+k*(.20*p.tf+.06)+.06*p.wob*k;float L=.30-.012*abs(k);
   vec2 o=p.tt-tg*.06+vec2(-tg.y,tg.x)*k*.008;float uu,vv;float ei=vFeather(m,o,a,L,.045,uu,vv);
   if(ei<0.){fu=uu;fv=vv;fe=ei;fdir=vec2(cos(a),sin(a));fo=o;fL=L;fsh=1e5;}else if(fU<0.)fsh=min(fsh,ei);fU=min(fU,ei);}
  if(needB)fU=max(fU,dB-G/CS);}}
 float dAll=min(dF,fU);
 if(dAll<.03){
  // countershading: dark above, pale below; on the neck from its own midline (the nape dark, the throat pale), whatever its pose
  float cs=ss(-.16,.12,b.y);if(dTl<dTo+.02)cs=mix(cs,ss(-.05,.06,dot(m-bez(p.tb,p.tc,p.tt,tq),R2(vec2(0,1),p.ba))),.8);
  cs=mix(cs,mix(.18,.80,ss(-.9,.8,sn)),wNk*(1.-wHd));
  vec3 alb=mix(vec3(.80,.74,.62),vec3(.56,.48,.39),ss(.0,.5,cs));alb=mix(alb,vec3(.38,.32,.27),ss(.55,1.,cs));
  alb*=1.-.16*ss(.56,.76,fbm2(b*vec2(7.,10.)+2.))*ss(.3,.8,cs)*(1.-wNk);
  // the head: pale grey-buff feathers, bare blue-grey skin round the eye
  vec3 hc=mix(vec3(.74,.68,.58),vec3(.50,.43,.36),ss(-.04,.05,hh.y));
  hc=mix(hc,vec3(.46,.52,.58),cov(sdEll(hh-vec2(-.072,.028),vec2(.040,.030))*HS));
  alb=mix(alb,hc,wHd);
  vec2 uu=u,dd=-dir;
  // the fan: grey-brown with pale tips, under the body
  float wF=step(fU,dF)*ss(-.004,.004,dF);
  if(wF>0.){vec3 fc=mix(vec3(.46,.40,.34),vec3(.38,.33,.28),ss(.3,.8,fu));fc=mix(fc,vec3(.76,.72,.64),ss(.80,.95,fu)*.6);
   fc=vVane(fc,fu,fv,fe,fsh,fL);alb=mix(alb,fc,wF);if(wF>.5){uu=FU(m-fo,fdir,1.6,6.);dd=-fdir;}}
  PIECE(dAll*CS,alb,K_FEATHER,uu,dd,.16,1.,0.);}
 // the crest, the upper beak and the lower jaw: one piece of horn. The crest warm orange-red (a display colour, not saturated), the beak
 // dark, the jaw grey towards the back where the cheek feathers cover it; the nostril.
 if(length(hh-vec2(-.10,.04))<.30){
  float dLo=sdTube(hh,vec2(-.030,-.020),vec2(-.12,-.022),vec2(-.182,-.032),.034,.012,tt);dLo=max(dLo,-dHf/1.15);
  float dCr=sdEll(R2(hh-vec2(-.122,.085),.22),vec2(.040,.090));dCr=smin(dCr,dUp+.004,.03);
  float dHn=min(dLo,dCr);if(needB)dHn=max(dHn,dB-G/HS);
  vec3 cc=mix(vec3(.26,.24,.23),vec3(.62,.32,.20),ss(.0,.06,hh.y+.25*(hh.x+.12)));cc=mix(cc,vec3(.80,.52,.32),ss(.10,.17,hh.y)*.7);
  cc=mix(cc,mix(vec3(.24,.22,.21),vec3(.44,.45,.47),ss(-.13,-.06,hh.x)),step(dLo,dCr));
  cc=mix(cc,vec3(.08,.07,.06),cov(sdEll(hh-vec2(-.150,.028),vec2(.008,.005))*HS)*step(dCr,dLo));
  PIECE(dHn*HS,cc,K_HORN,hh*14.,R2(vec2(.25,1.),p.ha),.016,1.,0.);
  if(G>.3){vec2 ec=p.hd+R2(vec2(-.072,.03)*1.15,p.ha);
   eyeA(q,C0+ec*CS,.019*HS,vec3(.80,.50,.16),vec3(.42,.47,.52),blinkAt(t,.55),0.);}}
 // the near leg while she stands: the feathered drumstick modelled by its light (no contour inside the body), the scaly foot, the claws
 if(p.up>.02){vec2 thA=p.hip+R2(vec2(-.01,-.03),p.ba);
  float dt2=sdEll(R2(m-mix(thA,p.kN,.55),-atan(p.kN.y-thA.y,p.kN.x-thA.x)),vec2(.5*length(p.kN-thA)+.10,.14));
  dt2=smin(dt2,sdCap(m,p.kN,p.aN,.085,.036),.05);dt2-=.006*(vn(m*vec2(30.,18.))-.4);
  vec2 B=p.bN,T3=B+vec2(-.14,-.012),T4=B+vec2(-.105,-.008),T2=B+vec2(-.09,.004);
  float df=sdCap(m,p.aN,B,.030,.024);df=smin(df,sdCap(m,B,T3,.018,.011),.012);df=min(df,sdCap(m,B+vec2(.0,.004),T4,.016,.011));df=min(df,sdCap(m,B+vec2(.0,.008),T2,.015,.011));
  float cl=sdTube(m,T3,T3+vec2(-.022,.006),T3+vec2(-.032,-.012),.009,.0015,tt);cl=min(cl,sdTube(m,T2,T2+vec2(-.02,.006),T2+vec2(-.03,-.010),.008,.0015,tt));
  cl=min(cl,sdTube(m,T4,T4+vec2(-.02,.004),T4+vec2(-.028,-.012),.008,.0015,tt));
  float dLg=min(min(dt2,df),cl);if(needB)dLg=max(dLg,dB-G/CS);
  vec2 ld=normalize(p.aN-p.kN+vec2(.0,-.1));
  // its shadow on the body below and behind it
  {vec2 gq=vec2(dFdx(dt2),dFdy(dt2));float aw=sat(dot(gq/max(length(gq),1e-9),-normalize(SUNL.xy)));
   shadow(ss(.06,.0,dt2)*step(0.,dt2)*aw*.30*ss(.02,-.02,CDF),vec3(.62,.54,.58),0.);}
  vec3 lc=mix(vec3(.62,.54,.45),vec3(.42,.36,.30),ss(-.05,.12,dot(m-p.kN,normalize(vec2(1.,-.6)))));   // lit on the sun's side
  lc=mix(lc,vec3(.36,.31,.26),ss(.0,-.12,m.y-p.kN.y)*.6);
  vec3 fc=vec3(.46,.40,.34)*(.92+.12*ss(.3,.0,abs(fract(dot(m-B,normalize(p.aN-B))*55.)-.5)));
  vec3 col=dt2<min(df,cl)?lc:cl<df?vec3(.17,.14,.12):fc;
  float line=max(ss(-.03,.03,CDF),step(df,dt2));
  PIECE(dLg*CS,col,K_FEATHER,FU(m-p.kN,ld,.8,.5),-ld,.06,line,0.);}}
void citNearWing(vec2 q,CP p,float G){vec2 m=(q-C0)/CS;if(m.x<-1.25||m.x>1.25||m.y<-.20||m.y>1.75)return;cWing(m,p,G<.6?CDB:-1.,G);}

// ---- Eggs and chicks ----
// 16 eggs in 8 pairs round the ring; egg i of pair i/2. Front eggs (towards us) have sin(phi)>0.
float eggPhi(int i){float k=float(i/2),sd=float(i%2);return (k+.5)/8.*TAU+.25+(sd-.5)*.19+.05*sin(k*2.7);}
void eggGeo(int i,out vec2 c,out vec2 ax,out vec2 r){float ph=eggPhi(i);vec2 rad=vec2(cos(ph),sin(ph));
 // the long axis: from the buried outer end up to the inner end, about 35 degrees up and towards the middle
 vec3 a3=vec3(-rad.x*.966,.26,-rad.y*.966);
 vec2 pr=vec2(a3.x,a3.y-a3.z*NK);float pl=length(pr);ax=pr/max(pl,1e-4);r=vec2(.100*max(pl,.5),.040);
 c=vec2(NR*rad.x,-NR*rad.y*NK+.040);}
// The hatching: which egg (index) and when it cracks
const int HATCH[3]=int[](4,6,2);
const float HT[3]=float[](5.5,5.95,6.45);
float hatchOf(int i){float h=-1.;for(int k=0;k<3;k++)if(HATCH[k]==i)h=HT[k];return h;}
// The shell of egg i at m: its frame (e: x along the long axis, up and in), the sand line it is half buried to; the bottom part only
// once its top has come off.
float eggShell(vec2 m,int i,float t,float hatch,out vec2 e,out vec2 c,out vec2 ax,out vec2 r,out float sandY,out float jag,out float pop,out float crack){
 eggGeo(i,c,ax,r);crack=0.;pop=0.;if(hatch>=0.){crack=ss(hatch,hatch+.5,t);pop=ss(hatch+.55,hatch+.85,t);}
 float jig=hatch>=0.?.08*sin(t*31.+float(i))*crack*(1.-pop)*ss(.0,.4,fract(t*1.3)):0.;
 e=R2(m-c,-atan(ax.y,ax.x)-jig);
 sandY=c.y-.030+.003*sin(m.x*80.+float(i)*1.7);
 jag=.40*r.x+.008*sin(e.y*260.)+.005*sin(e.y*530.+1.);
 float d=sdEll(e,r);if(pop>.01)d=max(d,e.x-jag);return d;}
// An egg: blue-green, matt, a few speckles, its lower half in the sand; cracks; its top comes off and tips over onto the rim of the nest
// beside it, where it stays; the open bottom stays in the sand. shd: the mother's shadow over it.
void egg(vec2 q,int i,float t,float hatch,float shd){vec2 m=(q-C0)/CS;
 vec2 e,c,ax,r;float sandY,jag,pop,crack;float d=eggShell(m,i,t,hatch,e,c,ax,r,sandY,jag,pop,crack);
 if(length(m-c)>.17)return;
 float dE=max(d,sandY-m.y);
 float sg=c.x<-.1?-1.:1.;float an=atan(ax.y,ax.x);
 vec2 off=vec2(.080*sg,-.030)*pop+vec2(0.,.035)*sin(pop*PI);
 vec2 ec=R2(R2(m-c-off,-an)-vec2(jag,0.),-1.5*pop*sg);
 float dCap=pop>.01?max(sdEll(ec+vec2(jag,0.),r),-ec.x):1e5;
 float dd=min(dE,dCap);
 if(uDecor<1.5){vec2 sl=(m-c-vec2(.05,-.022))/vec2(.11,.026);shadow(ss(1.,.3,length(sl))*.30*step(m.y,sandY+.01),vec3(.70,.58,.70),1.);
  veil(vec3(1.,.88,.74),ss(.012,.0,abs(m.y-sandY+.004))*ss(r.y*1.6,r.y*.8,abs(R2(m-c,-atan(ax.y,ax.x)).y))*ss(.006,-.004,d)*.0+ss(.010,.002,abs(m.y-sandY+.003))*ss(.03,.0,max(abs(m.x-c.x)-r.y*1.3,0.))*.55,1.);}
 vec3 shell=vec3(.44,.62,.60)*(.95+.1*h11(float(i)));
 bool onCap=dCap<dE;vec2 ee=onCap?ec:e;
 vec3 col=mix(shell,shell*.72,ss(.55,.75,vn(ee*90.+float(i)*3.))*.35);
 if(!onCap){
  // the inside of the open shell, pale and in shade; the cracks before it opens; darker just above the sand where it sinks in
  if(pop>.01)col=mix(col,vec3(.50,.54,.47),cov(sdEll(e-vec2(jag-.010,0.),vec2(.014,r.y*.82))*CS));
  if(crack>.01&&pop<.01){float cl=abs(e.x-jag)-.0018;cl=max(cl,abs(e.y)-r.y*1.2*crack);
   float c2=abs(e.y-.01-.3*(e.x-.6*r.x))-.0015;c2=max(c2,abs(e.x-.6*r.x-.008)-.012*crack);cl=min(cl,c2);
   col=mix(col,vec3(.14,.20,.18),cov(cl*CS));}
  col*=1.-.32*ss(.020,.0,m.y-sandY);}
 col*=1.-.40*shd;
 float line=onCap?.7:.7*ss(.002,.012,m.y-sandY);
 PIECE(dd*CS,col,K_SHELL,ee*14.,ax,.012,line,0.);}
// A chick: a fluffball with a big head, a short beak, big eyes, little wings; wet just after it hatches (darker, slicker), then fluffy.
// at: its place (m), ov: 0 in the egg .. 1 out and sitting; peep: the beak opens a little; wet: 1 just hatched. under: under the
// mother's wing (only the head shows in front of the feathers); clip: > 0 where it is hidden (inside its shell, under the sand).
void chick(vec2 q,vec2 at,float s,float t,float ov,float peep,float wet,float seed,float under,float clip){
 vec2 m=(q-C0)/CS;vec2 l=(m-at)/s;if(abs(l.x)>.16||l.y<-.08||l.y>.22)return;
 float bob=.004*sin(t*5.+seed)+.006*sin(t*2.3+seed*2.);
 vec2 hc=vec2(-.045+.01*sin(t*.9+seed),.105+bob+.015*ov);float hr=.038;
 float dh=length(l-hc)-hr;
 float db=sdEll(l-vec2(.0,.045),vec2(.062,.050));db=smin(db,sdEll(l-vec2(.045,.04),vec2(.03,.03)),.02);
 float dfe=min(sdCap(l,vec2(-.01,.0),vec2(-.04,-.006),.008,.006),sdCap(l,vec2(.02,.0),vec2(-.01,-.008),.008,.006));
 vec2 bk=l-hc-vec2(-hr*.95,-.006);
 float du=sdCap(bk,vec2(.006,.006),vec2(-.022,-.004-.004*peep),.008,.002),dlo=sdCap(bk,vec2(.006,-.004),vec2(-.018,-.010-.010*peep),.006,.002);
 float dBk=min(du,dlo);
 float dBo=min(smin(db,dh,.02),dfe);
 float d=min(min(dBo,dh),dBk);d=max(d,clip/s);if(under>.5)d=max(d,-CWD/s);
 vec3 down=mix(vec3(.70,.64,.54),vec3(.46,.40,.34),wet*.7);
 vec3 col=dh<db?mix(down*1.1,down*.85,ss(.08,.14,l.y)):mix(down*1.12,down*.82,ss(.0,.08,l.y));
 col*=1.-.30*ss(.008,.0,abs(sdEll(R2(l-vec2(.02,.045),.4),vec2(.03,.016))))*step(.5,1.-step(dh,db));   // the little wing
 col=mix(col,vec3(.60,.52,.46),step(dfe,min(db,dh)));
 col=mix(col,vec3(.80,.74,.62),step(dBk,min(min(db,dh),dfe)));
 if(peep>.05)col=mix(col,vec3(.55,.30,.28),cov(max(sdEll(bk-vec2(-.006,-.008-.004*peep),vec2(.012,.004*peep)),-dBk)*s*CS));
 PIECE(d*s*CS,col,K_FUZZ,l*1.5,vec2(1,0),.03*s,1.,0.);
 if(under<.5||CWD>0.)eyeA(q,C0+(at+(hc+vec2(-.012,.012))*s)*CS,.0115*s*CS,vec3(.10,.08,.06),down*.9,blinkAt(t,seed*.37),0.);}
// The three chicks: their egg, when they come out, where they sit
void chickState(int k,float t,out vec2 at,out float ov,out float wet,out float peep,out float emerge){
 int i=HATCH[k];vec2 c,ax,r;eggGeo(i,c,ax,r);float h0=HT[k];
 emerge=ss(h0+.75,h0+1.3,t);ov=ss(h0+1.3,h0+1.9,t);
 vec2 sitP=c+vec2((float(k)-1.)*.04-.02+(k==1?-.06:(k==0?.03:0.)),-.12);   // far enough apart not to overlap
 at=mix(c+ax*r.x*.10-vec2(0.,.085),mix(c+ax*r.x*.5,sitP,ss(.0,1.,ov)),emerge);
 // when she settles again, the chicks shuffle in under her, each to its own place (they never cross): one stays in front of her
 // breast, one under the front edge of her wing with its head out, one right under the wing
 vec2 fin=k==1?vec2(-.27,-.17):k==0?vec2(-.05,-.15):vec2(.17,-.07);
 at=mix(at,fin,ss(9.4,10.6,t));
 wet=1.-ss(h0+1.8,h0+3.2,t);
 float pt=t+float(k)*1.37;float pp=fract(pt/1.15);peep=ss(.0,.05,pp)*ss(.20,.12,pp)*ss(h0+1.0,h0+1.3,t);
 peep*=step(.45,h11(floor(pt/1.15)+float(k)*7.))*(1.-.6*ss(13.,15.,t));}
// The long shadow of the mother on the sand (the sun low on the left and a little in front: the shadow runs right and a little back).
float castShadow(vec2 m,CP p){if(m.y>.16||m.y<-.30||m.x<-.9)return 0.;
 const float SX=1.65,SY=-.06;
 vec2 T=p.hip+R2(vec2(-.17,-.02),p.ba);
 float d=sdEll(m-vec2(T.x+T.y*SX,-T.y*SY-.01),vec2(.37+.26*SX*.8,.06));
 vec2 a=vec2(p.nb.x+p.nb.y*SX,-p.nb.y*SY),cc=vec2(p.nc.x+p.nc.y*SX,-p.nc.y*SY),hb=vec2(p.hd.x+p.hd.y*SX,-p.hd.y*SY);
 float tt;d=min(d,sdTube(m,a,cc,hb,.04,.03,tt));d=min(d,length((m-hb-vec2(.02,.0))/vec2(1.,.45))-.07);
 d=min(d,sdCap(m,vec2(p.tb.x+p.tb.y*SX,-p.tb.y*SY),vec2(p.tt.x+p.tt.y*SX,-p.tt.y*SY),.045,.05));
 if(p.up>.02){vec2 h0=vec2(p.hip.x+p.hip.y*SX,-p.hip.y*SY);d=min(d,sdCap(m,vec2(p.bN.x,0.),h0,.010,.03));d=min(d,sdCap(m,vec2(p.bF.x,0.),h0+vec2(.04,0.),.010,.03));}
 float bl=.015+.035*sat((m.x-p.hip.x)/1.5);
 return ss(bl,-bl,d);}

// ---- Ukhaa Tolgod ----
// Buttes and cliffs of red Djadochta sandstone: flat tops, steep faces (lit on the left, in shade on the right), soft gullies, faint
// beds, talus at their feet; hz: how much haze (the distance).
void cliffs(vec2 q,float base,float W,float hgt,float seed,float hz){
 if(q.y>base+hgt*1.2+.02||q.y<base-.005)return;
 float cx=q.x/W+seed;float i=floor(cx),f=fract(cx);
 float c0=.30+.40*h11(i*3.7+seed),w=.10+.18*h11(i*2.1+seed),H=hgt*(.45+.55*h11(i*5.3+seed))*step(.22,h11(i*1.9+seed));
 float dx=abs(f-c0)/w;
 float top=H*(ss(1.12,.98,dx)*.58+.42*ss(2.0,1.08,dx));
 top=max(top,hgt*.20*ss(.35,.75,fbm2(vec2(q.x*3.+seed,seed))));   // a low broken escarpment between them
 top+=.0025*(vn(vec2(q.x*70.,seed))-.5)+.003*ss(.2,.0,abs(dx-1.))*H/max(hgt,1e-3);
 float y=q.y-base;float d=y-top;if(d>PX*3.)return;
 float side=f<c0?-1.:1.;
 vec3 lit=vec3(.94,.56,.36),mid=vec3(.80,.45,.31),shd=vec3(.56,.33,.32);
 float flank=ss(.90,1.02,dx)*step(.001,H);
 vec3 c=mix(mid,side<0.?lit:shd,flank*.85);
 c=mix(c,(side<0.?lit:shd)*1.06+.03,ss(1.10,1.30,dx)*.5*step(.001,H));                    // the talus, paler
 c*=.92+.10*vn(vec2(q.x*95.+seed*7.,y*5.));                                                 // gullies
 c=mix(c,c*1.10+.03,ss(.22,.0,abs(fract(y/max(hgt,1e-3)*3.2+.15*vn(vec2(q.x*6.,seed)))-.5)-.28)*.35);   // pale beds
 c=mix(c,lit*1.08,ss(.004,.0,abs(d+.002))*.45*(1.-flank));                                  // the lit rim of the top
 c=mix(c,HAZE,hz);
 veil(c,cov(d),1.);}
// A low dune: a long lit side on the left, a short slip face in lilac shade on the right.
void dune(vec2 q,float base,float W,float hgt,float seed){
 if(q.y>base+hgt+.01||q.y<base-.03)return;
 float cx=q.x/W+seed;float i=floor(cx),f=fract(cx);float hc=hgt*(.5+.5*h11(i+seed*3.1));float pk=.62+.2*h11(i*1.7+seed);
 float y=f<pk?hc*pow(sin(f/pk*PI*.5),1.5):hc*pow(1.-(f-pk)/(1.-pk),1.4);
 float d=q.y-base-y;if(d>PX*3.)return;
 vec3 c=mix(vec3(.98,.76,.58),vec3(.80,.62,.66),ss(-.002,.002,f-pk)*ss(-.02,.0,q.y-base+.01));
 c=mix(c,HAZE,.25);
 veil(c,cov(d)*ss(base-.03,base,q.y),1.);}
// A clump of low dry shrubs (one piece: the twigs and the small grey-green leaves), their long shadows on the sand to the right.
void shrubs(vec2 q,vec2 b,float s,float t,float seed){vec2 l=(q-b)/s;if(l.x<-1.3||l.x>3.6||l.y<-.3||l.y>1.3)return;
 shadow(ss(1.,.2,length((l-vec2(1.5,.04))/vec2(2.0,.16)))*.38,vec3(.70,.60,.72),1.);
 float sw=.04*sin(t*1.5+seed)+.02*sin(t*2.9+seed*2.);
 float dt=1e5,dl=1e5;float tt;
 for(int j=0;j<3;j++){float fj=float(j);vec2 o=vec2(fj*1.0-.35*fj*fj,-.03*fj+.02*fj*fj);float k=1.-.30*fj;
  for(int i=0;i<4;i++){float fi=float(i)-1.5;vec2 tip=o+k*vec2(fi*.34+sw*(.5+.2*fi),.72+.25*h11(fi+seed+fj));dt=min(dt,sdTube(l,o+k*vec2(fi*.05,0.),o+k*vec2(fi*.18,.35),tip,.035*k,.012,tt));
   vec2 c=o+k*vec2(fi*.32+sw*(.6+.1*fi),.62+.22*h11(fi*2.+seed+fj*3.));dl=min(dl,sdEll(l-c,k*vec2(.30,.20)));}}
 dl+=.10*(fbm2(l*7.+seed+vec2(t*.2,0.))-.5);
 float d=min(dt,dl);
 vec3 c=dl<dt?mix(vec3(.40,.44,.30),vec3(.58,.58,.40),ss(.4,1.,l.y)):vec3(.40,.31,.24);
 PIECE(d*s,c,K_PLANT,l*vec2(3.,6.),vec2(0,1),.02*s,.6,1.);}
void ukhaa(vec2 q,float t){
 SUNL=normalize(vec3(-.74,.40,.30));SUNC=vec3(1.30,1.06,.82);AMBC=vec3(.50,.50,.62);BACK=.25;
 if(q.y>-.10){
  // a hazy pale sky, warm towards the horizon; the sun low on the left, soft in the haze
  vec2 sp=vec2(-.80,.17);float ds=length(q-sp);
  vec3 sky=mix(HAZE,vec3(.72,.78,.86),ss(-.03,.48,q.y));sky=mix(sky,vec3(1.,.94,.82),ss(.60,.0,ds)*.55);
  PIECE(-1.,sky,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
  veil(vec3(1.,.97,.88),ss(.034,.027,ds)*.85,1.);
  if(q.y>.05){float cl=fbm(vec2(q.x*1.1-t*.004,q.y*9.+.3))*ss(.06,.30,q.y);veil(vec3(1.,.95,.88),ss(.58,.84,cl)*.28,1.);}
  // far mesas, pale with the distance
  {float ry=-.030+.030*ss(.35,.60,fbm(vec2(q.x*1.5+3.,1.)))+.004*vn(vec2(q.x*30.,4.));veil(mix(vec3(.86,.66,.62),HAZE,.55),cov(q.y-ry),1.);}
  // buttes and cliffs of red sandstone in the middle distance
  cliffs(q,-.048,.80,.060,2.,.48);
  veil(HAZE,ss(.02,-.05,q.y+.05)*.18,1.);
  cliffs(q,-.074,1.15,.110,7.,.22);
  dune(q,-.098,.95,.030,4.);}
 // the sand: pale orange-red, with ripples (a long lit side and a short shaded lee side), seen from a little above
 if(q.y<-.06){float gt=-.080+.003*(fbm2(vec2(q.x*5.,1.))-.5);float dg=q.y-gt;
  float Y=max(.006,-.07-q.y);float z=.12/Y;vec2 g=vec2(q.x*z,z);
  vec3 ga=mix(vec3(.96,.72,.54),vec3(.90,.62,.45),ss(-.12,-.50,q.y));ga=mix(ga,HAZE,ss(-.16,-.08,q.y)*.35);
  ga*=1.+.07*(fbm2(vec2(g.x*1.5,g.y*2.))-.5);
  float ph=g.y*200.+g.x*24.+6.*fbm2(g*vec2(.8,1.2))+2.*sin(g.x*3.+g.y*5.);float r=fract(ph/TAU);float lr=ss(.9,.3,fwidth(ph))*ss(.75,.25,Y);
  ga*=1.+.08*ss(.45,.72,r)*ss(.80,.73,r)*lr;ga=mix(ga,ga*vec3(.82,.76,.86),ss(.73,.80,r)*ss(1.,.94,r)*.50*lr);
  vec2 pc;vec3 pv=voro(g*vec2(40.,30.),pc);float peb=ss(.12,.07,pv.x)*step(.88,h21(pc))*ss(.5,.15,fwidth(g.x*40.))*ss(-.56,-.36,q.y);ga=mix(ga,ga*vec3(.72,.62,.58),peb);
  PIECE(dg,ga,K_SAND,vec2(q.x,q.y*3.),vec2(1,0),.2,0.,1.);}
 // sparse clumps of low shrubs: only the nearest clump at each pixel
 {vec3 sb=vec3(-.66,-.140,.042);float sd=1.;float e0=length((q-sb.xy)/sb.z-vec2(.6,.4));
  vec3 c2=vec3(.50,-.118,.028);float e=length((q-c2.xy)/c2.z-vec2(.6,.4));if(e<e0){sb=c2;e0=e;sd=2.;}
  c2=vec3(.98,-.150,.050);e=length((q-c2.xy)/c2.z-vec2(.6,.4));if(e<e0){sb=c2;e0=e;sd=3.;}
  c2=vec3(-1.02,-.40,.075);e=length((q-c2.xy)/c2.z-vec2(.6,.4));if(e<e0){sb=c2;e0=e;sd=4.;}
  c2=vec3(-.20,-.104,.020);e=length((q-c2.xy)/c2.z-vec2(.6,.4));if(e<e0){sb=c2;e0=e;sd=5.;}
  shrubs(q,sb.xy,sb.z,t,sd);}}
// The nest: a low mound of sand under the ring of eggs, lit on the side towards the sun, an open hollow in the middle.
void nestMound(vec2 m){if(uDecor>1.5||abs(m.x)>NR+.50||m.y>.24||m.y<-.34)return;
 vec2 g=vec2(m.x,-m.y/NK);float rr=length(g);float u=(rr-NR)/.20;float hg=exp(-u*u);
 vec2 tilt=-(-2.*u*hg)*g/max(rr,1e-4);float lit=dot(tilt,vec2(-.80,.45));
 veil(vec3(1.,.88,.72),sat(lit)*.45,1.);shadow(sat(-lit)*.45,vec3(.80,.66,.74),1.);
 veil(vec3(1.,.86,.70),hg*.40,1.);shadow(ss(.12,.0,abs(rr-NR-.26))*ss(-.2,.3,g.x-g.y*.5)*.25,vec3(.82,.70,.76),1.);
 shadow(ss(NR*.85,NR*.35,rr)*.14,vec3(.82,.72,.72),1.);}

void life(vec2 q,float t){if(outWin(q,.12))return;
 ukhaa(q,t);
 CP p=cPose(t);
 vec2 m=(q-C0)/CS;
 nestMound(m);
 // per pixel only the nearest egg of the back half and of the front half are drawn (they do not overlap)
 int ib=0,iF=0;float dbk=1e5,dfr=1e5;
 for(int i=0;i<16;i++){vec2 c,ax,r;eggGeo(i,c,ax,r);float dd=length(m-c);if(sin(eggPhi(i))<0.){if(dd<dbk){dbk=dd;ib=i;}}else if(dd<dfr){dfr=dd;iF=i;}}
 if(dbk<.17)egg(q,ib,t,-1.,0.);
 float SH=castShadow(m,p);
 shadow(SH*.55,vec3(.60,.50,.68),1.);
 contact(q,C0+vec2(-.02,.01),.26*(1.-p.up)+.001,.40*(1.-p.up));
 contact(q,C0+p.bN*CS+vec2(-.025,-.003),.06*p.up+.001,.5*p.up);contact(q,C0+p.bF*CS+vec2(-.025,-.003),.05*p.up+.001,.4*p.up);
 CDB=GROW<.6?cBones(m,p):-1.;
 citipati(q,p,t,GROW);
 if(dfr<.17)egg(q,iF,t,hatchOf(iF),uDecor<.5?SH:0.);
 citNearWing(q,p,GROW);
 // the three chicks, the farthest first, each drawn whole (they may stand close); in its egg only what is out of the opening shows;
 // behind the near wing wherever the wing covers them
 vec2 cA[3];float cO[3],cW[3],cP[3],cE[3];
 for(int k=0;k<3;k++)chickState(k,t,cA[k],cO[k],cW[k],cP[k],cE[k]);
 int o0=0,o1=1,o2=2;
 if(cA[o1].y>cA[o0].y){int x=o0;o0=o1;o1=x;}
 if(cA[o2].y>cA[o1].y){int x=o1;o1=o2;o2=x;}
 if(cA[o1].y>cA[o0].y){int x=o0;o0=o1;o1=x;}
 for(int j=0;j<3;j++){int k=j==0?o0:(j==1?o1:o2);
  if(cE[k]<=.001||length(m-cA[k]-vec2(0.,.08))>.3)continue;
  float clip=-1e5;
  if(cO[k]<.5){vec2 e,c,ax,r;float sY,jg,pop,cr;float ds=eggShell(m,HATCH[k],t,HT[k],e,c,ax,r,sY,jg,pop,cr);clip=max(-ds,sY-m.y);}
  chick(q,cA[k],mix(1.1,1.3,ss(.3,.7,cO[k])),t,cO[k],cP[k],cW[k],float(k)*2.1,1.,clip);}}
void fossil(vec2 q){if(uLife>.001&&!outWin(q,-.12))return;vec2 m=(q-C0)/CS;if(m.x<-1.25||m.x>1.25||m.y<-.2||m.y>1.75)return;CP p=cPose(0.);
 float d=cBones(m,p);
 // the eggs: only the nearest one at each pixel (they do not touch)
 int ie=0;float dn=1e5;for(int i=0;i<16;i++){vec2 c,ax,r;eggGeo(i,c,ax,r);float dd=length(m-c);if(dd<dn){dn=dd;ie=i;}}
 float de=1e5;if(dn<.2){vec2 c,ax,r;eggGeo(ie,c,ax,r);de=sdEll(R2(m-c,-atan(ax.y,ax.x)),r);}
 PIECE(min(d,de)*CS,de<d?vec3(.62,.66,.60):vec3(.86,.80,.68),K_FOSSIL,m*3.,vec2(1,0),.005,.8,0.);}

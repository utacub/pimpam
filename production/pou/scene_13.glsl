// ---- Scene 14 (El pou del temps, CE37): Yutyrannus huali and Sinosauropteryx prima, Yixian Formation, Liaoning, China (Early
// Cretaceous, about 125 million years ago). A forest of conifers and ginkgos by a lake just after the rain: wet greens, pearl-grey
// light, mist on the water, drops falling from the leaves. A 9 m tyrannosauroid covered with long filaments (Xu et al., 2012), soaked
// so that its coat hangs in clumps, shakes the rain off like a dog (4.6–6.4 s): the shake runs from the head to the tail and the drops
// fly; then its coat fluffs up and settles (6.4–8.0). A little Sinosauropteryx (chestnut, pale belly, a dark mask through the eye, a
// tail with low-contrast rings; Zhang et al., 2010; Smithwick et al., 2017) runs across the shore (8.6–10.2) and the big one turns its
// head to look after it (10.5–11.5). Lips cover the teeth. Scale: .14 screen units per metre (the little one .20, nearer). ----
const float YG=-.36,YS=.14;
const vec2 WIN_C=vec2(-.14,-.11);
// While the window of life opens, the pixels well outside it show only stone: life() skips them (the tail masks them anyway), and
// fossil() skips the pixels well inside it (the window covers them).
bool outWin(vec2 q,float mg){if(uLife>=.999)return false;float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))>R+mg;}
const vec2 Y0=vec2(-.05,YG);   // the Yutyrannus: its origin on the ground (metres from here, x towards its tail, y up)
const float SG=-.46,SSC=.24;   // the Sinosauropteryx: its ground line and scale
const float HZ=.015;           // the far shore of the lake (the horizon)
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
vec2 bezT(vec2 a,vec2 b,vec2 c,float t){return normalize(2.*(1.-t)*(b-a)+2.*t*(c-b)+1e-6);}
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
float settle(float t,float t0){float a=t-t0;return a<0.?0.:exp(-a*5.5)*sin(a*19.);}

// ---- The Yutyrannus: its pose (metres, facing -x; the ground at y 0) ----
struct YP{vec2 hip;float ba;vec2 nb,nc,hd;float ha;vec2 kN,aN,bN,kF,aF,bF;vec2 sh,e,w,f;vec2 tb,tc,tt;float sH,sB,eB,eT,wet,fluff,flare,look;};
YP yPose(float t){YP p;
 float br=sin(t*1.05);                                              // slow breathing
 // the shake, about 2.4 a second: a wave from the head (4.6) to the body (4.85) and the tail (5.15)
 float wv=TAU*2.4;
 float eH=ss(4.6,4.78,t)*(1.-ss(5.2,5.45,t)),eB=ss(4.85,5.05,t)*(1.-ss(5.7,5.95,t)),eT=ss(5.15,5.35,t)*(1.-ss(6.0,6.4,t));
 p.sH=eH*sin(wv*(t-4.6));p.sB=eB*sin(wv*(t-4.85));p.eB=eB;p.eT=eT;
 p.flare=max(eB,.6*max(eH,eT));
 p.wet=1.-.82*ss(4.75,6.3,t);                                       // the shake throws most of the water off
 p.fluff=ss(6.3,6.9,t)-.5*ss(7.0,8.0,t)+.25*settle(t,7.3);           // the coat fluffs up, then settles
 float brace=ss(4.25,4.6,t)*(1.-ss(6.1,6.7,t));                     // it braces itself (the knees bend a little)
 float flinch=ss(3.88,3.98,t)*(1.-ss(4.05,4.5,t));                  // a drop falls on its head (first beat)
 p.look=ss(10.5,11.3,t)*(1.-ss(12.2,13.0,t));                       // it turns its head to look after the little one
 vec2 hip=vec2(0.,2.25+.012*br-.07*brace);hip.y+=.045*p.sB;hip.x+=.015*sin(wv*(t-4.95))*eB;
 float ba=-.02+.008*br-.025*brace+.03*p.sB*.5;
 p.hip=hip;p.ba=ba;
 p.nb=hip+R2(vec2(-1.90,.18),ba);
 float sc=t/2.6,si=floor(sc);float sa=mix(h11(si+.4)-.5,h11(si+1.4)-.5,ss(.0,.15,fract(sc)));   // slow glances
 float sH2=eH*sin(wv*(t-4.6)-1.1);                                  // the head leads, the neck follows
 vec2 hr=vec2(-.78,.78)+vec2(.03*sa,.02*sin(t*.8));
 hr+=vec2(.02,-.07)*flinch+vec2(-.04,-.06)*brace;
 hr+=vec2(.06*sH2,.16*p.sH);
 hr=mix(hr,vec2(-1.02,.36),p.look);
 p.hd=p.nb+hr;
 p.nc=p.nb+mix(vec2(-.30,.55),vec2(-.55,.48),p.look)+vec2(.03*sH2,.09*sH2);
 p.ha=.10+.06*sa+.14*flinch+.20*p.sH+.42*p.look;
 // legs: planted; one small step to steady itself after the shake (6.45–6.85)
 float st=ss(6.45,6.85,t);float lift=.10*sin(PI*sat((t-6.45)/.40));
 p.bN=vec2(-.30-.14*st,.07+lift);p.bF=vec2(.32,.08);
 float thN=.40-lift*1.5,thF=.40;
 p.aN=p.bN+.52*vec2(sin(thN),cos(thN));p.aF=p.bF+.52*vec2(sin(thF),cos(thF));
 p.kN=knee(hip+R2(vec2(-.05,-.10),ba),p.aN,.95,.90,-1.);p.kF=knee(hip+R2(vec2(.05,-.10),ba),p.aF,.95,.90,-1.);
 // arms (shoulder, elbow, wrist, finger tips): hanging, swinging with the shake
 p.sh=hip+R2(vec2(-1.72,-.44),ba);vec2 sw=vec2(.02*p.sB,.06*p.sB);
 p.e=p.sh+vec2(.10,-.42)+sw;p.w=p.e+vec2(-.32,-.06)+sw*1.6;p.f=p.w+vec2(-.17,-.12)+sw*2.2;
 // the tail: a wave runs along it in the shake (the tip a little later)
 float tl=-.11+.03*sin(t*.6)-.02*brace;
 p.tb=hip+R2(vec2(.45,.12),ba);float A=ba+tl;vec2 td=vec2(cos(A),sin(A)),tn=vec2(-td.y,td.x);
 p.tc=p.tb+td*2.1+tn*(.05+.20*eT*sin(wv*(t-5.25))+.02*sin(t*.7));
 p.tt=p.tb+td*4.2+tn*(-.12+.48*eT*sin(wv*(t-5.42))+.04*sin(t*.7-.6));
 return p;}

// ---- The bones (fossil, and under the growing flesh) ----
float yBones(vec2 m,YP p,float lim){float d=1e5;
 // a cheap bound first: far from the skeleton, a lower bound of the distance is enough
 {vec2 b0=R2(m-p.hip,-p.ba);float c=sdEll(b0-vec2(-.95,-.20),vec2(1.40,.85));
  c=min(c,sdCap(m,p.nb,p.hd,.35,.35));c=min(c,sdCap(m,p.hd,p.hd+R2(vec2(-.95,0.),p.ha),.36,.26));
  c=min(c,sdCap(m,p.tb,p.tc,.25,.15));c=min(c,sdCap(m,p.tc,p.tt,.15,.08));
  c=min(c,sdCap(m,p.hip,p.kN,.15,.12));c=min(c,sdCap(m,p.kN,p.aN,.12,.10));c=min(c,sdCap(m,p.aN,p.bN+vec2(-.4,0.),.10,.12));
  c=min(c,sdCap(m,p.hip,p.kF,.15,.12));c=min(c,sdCap(m,p.kF,p.aF,.12,.10));c=min(c,sdCap(m,p.aF,p.bF+vec2(-.4,0.),.10,.12));
  c=min(c,sdCap(m,p.sh,p.e,.10,.08));c=min(c,sdCap(m,p.e,p.w,.08,.08));c=min(c,sdCap(m,p.w,p.f,.08,.12));
  if(c>lim)return c;}   // the hull holds every bone: c is a lower bound, and past lim the flesh does not reach
 // the skull: long and deep, a low crest along the snout, the big openings; the lower jaw
 {vec2 h=R2(m-p.hd,-p.ha)/1.2;
  float sk=smin(sdEll(h-vec2(-.12,.03),vec2(.22,.19)),sdCap(h,vec2(-.28,.03),vec2(-.84,-.03),.14,.075),.06);
  sk=smin(sk,sdEll(R2(h-vec2(-.52,.12),.07),vec2(.26,.035)),.02);
  sk=max(sk,-sdEll(h-vec2(-.27,.07),vec2(.05,.06)));sk=max(sk,-sdEll(h-vec2(-.47,.01),vec2(.13,.055)));sk=max(sk,-sdEll(h-vec2(-.06,.02),vec2(.06,.085)));
  float jw=sdCap(h,vec2(-.02,-.14),vec2(-.82,-.11),.075,.035);jw=max(jw,-sdEll(h-vec2(-.18,-.14),vec2(.08,.025)));d=min(d,min(sk,jw)*1.2);}
 // neck vertebrae
 for(int i=0;i<5;i++){float s0=(float(i)+.08)/5.,s1=(float(i)+.86)/5.;d=min(d,sdCap(m,bez(p.nb,p.nc,p.hd,s0),bez(p.nb,p.nc,p.hd,s1),.08,.075));}
 vec2 b=R2(m-p.hip,-p.ba);
 // back vertebrae with their spines, ribs, the shoulder blade, the hip bone, the pubis with its boot, the ischium
 for(int i=0;i<6;i++){float fi=float(i);float x=-2.0+fi*.32;vec2 c=vec2(x,.18);d=min(d,sdEll(b-c,vec2(.13,.06)));d=min(d,sdSeg(b,c,c+vec2(.03,.22))-.03);
  float bot=-.40-.32*sin(PI*(fi+.5)/6.);d=min(d,sdCap(b,vec2(x+.05,.14),vec2(x+.24,bot),.03,.016));}
 d=min(d,sdCap(b,vec2(-1.78,-.05),vec2(-1.50,.40),.045,.07));
 d=min(d,sdEll(b-vec2(.05,.12),vec2(.55,.17)));
 d=min(d,sdCap(b,vec2(-.05,-.05),vec2(-.30,-.95),.06,.05));d=min(d,sdEll(b-vec2(-.30,-1.0),vec2(.25,.06)));
 d=min(d,sdCap(b,vec2(.20,-.05),vec2(.50,-.60),.05,.025));
 // tail vertebrae
 for(int i=0;i<8;i++){float s0=float(i)/8.,s1=s0+.10;float r=.10-.009*float(i);d=min(d,sdCap(m,bez(p.tb,p.tc,p.tt,s0),bez(p.tb,p.tc,p.tt,s1),r,r*.9));}
 // arms: humerus, forearm, the hand
 d=min(d,sdCap(m,p.sh,p.e,.045,.04));d=min(d,sdCap(m,p.e,p.w,.032,.028));d=min(d,sdCap(m,p.w,p.f,.02,.015));
 // legs: femur, tibia, metatarsus, toes
 for(int L=0;L<2;L++){vec2 Hh=p.hip+R2(vec2(L==0?-.05:.05,-.1),p.ba),Kn=L==0?p.kN:p.kF,A=L==0?p.aN:p.aF,B=L==0?p.bN:p.bF;
  d=min(d,sdCap(m,Hh,Kn,.085,.07));d=min(d,length(m-Kn)-.09);d=min(d,sdCap(m,Kn,A,.07,.05));d=min(d,sdCap(m,A,B,.045,.04));
  d=min(d,sdCap(m,B,B+vec2(-.34,-.04),.035,.02));}
 return d;}
// the bones at this pixel, worked out once per pixel in life() while the flesh grows
float YDB=-1.;

// ---- The coat of long filaments ----
// The locks that hang from an underside: wet, the filaments stick together in long pointed clumps; dry, shorter softer tufts.
// x: a coordinate along the edge (m). In the shake the locks fly out and swing.
float yLocks(float x,float wet,float flare,float t,float seed){
 float L=0.;
 for(int k=0;k<2;k++){float fk=float(k);float sp=mix(.075,.15,wet)*(1.-.28*fk);
  float lx=x/sp+fk*.37+seed;float li=floor(lx);float sw=.30*flare*sin(t*15.1+li*1.9);lx+=sw*ss(.0,.3,fract(lx));
  float lf=fract(lx);float hh=h11(li*1.7+fk*13.+seed);
  float c=1.-abs(2.*lf-1.);float len=mix(.045,.15,wet)*(.30+.70*hh*hh)*(1.-.40*fk);
  L=max(L,len*pow(c,mix(.75,1.5,wet)));}
 return L*(1.+.6*flare);}
// The outline of the coat over a smooth shape d (m): its pile, the locks (sY: -1 the underside .. 1 the top; x: along the edge), a
// ragged fringe that fluffs out when dry.
float yCoatD(float d,float sY,float x,vec2 m,YP p,float t,float seed){
 float dn=ss(-.25,-.85,sY);
 float L=yLocks(x,p.wet,p.flare,t,seed)*(.30+.70*dn);
 float pile=mix(.045,.015,p.wet)+.07*p.fluff+.03*p.flare;
 float fz=(.010+.030*p.fluff+.02*p.flare)*(vn(m*16.+seed)-.45);
 return d-pile-L-fz;}
// The filaments of the coat. They hang down and a little back (long filaments, soaked, then drying), in locks: clumps that taper to
// a point, with darker partings between them, and fine strands along each lock that gather towards its tip. The flow waves gently
// (a domain warp, so that no rows or grid show) and the shake swings the locks.
const vec2 YFL=vec2(.287,-.958);   // the flow: down and a little towards the tail
// Locks: long ribbons of filaments side by side along the flow (no rows, so no grid), each swelling and narrowing to a point at its own
// places, in two staggered layers (the second over the first). pd.x along the flow, pd.y across; tight: 1 soaked (narrow clumps, wide
// partings) .. 0 dry. x: the place across the lock (-1 .. 1), y: its id, z: how pointed it is here (0 full .. 1 a tip), w: how much of
// a lock covers here (0 in a parting).
vec4 yLock(vec2 pd,float across,float along,float tight){vec4 r=vec4(0.);
 for(int L=0;L<2;L++){float fl=float(L);float cy=pd.y*across+fl*.5;float ci=floor(cy);
  float wv=ss(.12,.88,vn(vec2(ci*3.7+fl*11.,pd.x*along+fl*5.3)));
  float w=.5*mix(mix(.45,.20,tight),1.,wv);
  float fc=fract(cy)-.5-.13*sin(pd.x*along*2.6+ci*2.1);float ins=ss(w,w-.10,abs(fc));
  r=mix(r,vec4(fc/max(w,.01),h21(vec2(ci,fl*3.)),1.-wv,1.),ins);}
 return r;}
// The coat at m (metres): the lock (as yLock) and st, the strands (0 .. 1; .5 where they are too fine to show at this size).
vec4 yHair(vec2 m,YP p,float t,out float st){
 float s=dot(m,YFL),n=dot(m,vec2(-YFL.y,YFL.x));
 n+=.32*(vn(vec2(n*.55,s*.45)+4.)-.5)+.05*(vn(vec2(n*2.,s*1.6)+9.)-.5);   // the flow waves
 float sw=p.flare*(.07*sin(t*15.1+s*4.5+n*1.3)+.03*sin(t*9.7+n*6.));n+=sw;  // the shake swings the locks
 float dry=sat(1.-p.wet+.5*p.fluff);
 float acr=mix(7.5,4.6,dry),alo=mix(1.5,1.1,dry);   // soaked: narrow clumps; dry and fluffed: broad soft locks
 vec4 L=yLock(vec2(s,n),acr,alo,1.-dry);
 // the strands: about three across a soaked clump, five across a dry lock, each about 3 px wide at 960×540; they follow the lock and
 // gather where it narrows; each its own shade along its length, a fine dark line between them. Faded where under two pixels.
 float k=mix(3.,5.,dry);float pxm=PX/YS;
 float sxL=L.x*k*.5+.30*vn(vec2(L.x*2.,s*3.)+L.y*40.)+floor(L.y*50.)*7.;
 float sxP=n*acr*k+.8*sin(s*1.7+n*5.);                                   // loose strands in a parting
 float sx=mix(sxP,sxL,L.w);
 float lw=mix(1.,mix(1.,mix(.45,.20,1.-dry),L.z),L.w);                      // the lock's width here (of its cell)
 float wpx=lw/(acr*k)/pxm;                                                   // a strand's width in pixels
 float sp=1.-abs(fract(sx)-.5)*2.;float hb=vn(vec2(floor(sx)*7.3,s*1.4));
 st=mix(.5,(.25+.75*hb)*(.62+.38*ss(.0,.45,sp)),ss(1.4,2.6,wpx));
 return L;}
// The colour of the coat over its base colour c: lit along the middle of each lock and on its side towards the sun, dark partings,
// the strands; wet, darker and cooler with deep partings; dry, the tips lighter.
vec3 yCoatCol(vec3 c,vec4 L,float st,YP p){
 float dry=sat(1.-p.wet+.5*p.fluff);
 float pr=1.-L.x*L.x;
 c*=mix(1.,.84+.20*pr-.10*L.x,L.w);
 c*=mix(mix(.74,.58,p.wet),1.,L.w);
 c*=mix(1.,.80+.40*st,mix(.6,1.,dry));
 c=mix(c,c*1.18+.02,L.z*dry*.35*L.w);
 return c*mix(vec3(1.),vec3(.60,.61,.66),p.wet);}
// The wet sheen: a cool light of the sky along the middle of the soaked clumps on the upper parts.
void ySheen(float dc,float sY,vec4 L,float st,YP p){if(p.wet<.05)return;
 glow(vec3(.62,.68,.74)*.20*p.wet*ss(-.1,.8,sY)*(1.-L.x*L.x)*L.w*(.5+.5*st)*cov(dc*YS)*ss(-.30,-.03,dc),0.);}
// One piece of the coat: d its outline (with the locks), dS the smooth body under it, whose gradient gives the light (so the locks of
// the outline do not stripe the shading).
void yFurPiece(float d,float dS,vec3 col,vec2 m,vec2 dir,float R,float line){
 piece(d,vec2(dFdx(dS),dFdy(dS)),col,K_FUR,m*.15,dir,R,line,0.);}

// ---- The Yutyrannus ----
void yut(vec2 q,YP p,float t,float G){
 vec2 m=(q-Y0)/YS;
 if(m.x<-4.6||m.x>5.4||m.y<-.15||m.y>4.1)return;
 bool needB=G<.6;float gc=YDB-G/YS;float PXm=PX/YS;
 if(needB&&G<.5)PIECE(YDB*YS,vec3(.88,.85,.76),K_BONE,m*.4,vec2(1,0),.006,.8,0.);
 if(needB&&gc*YS>PX*4.)return;   // the flesh has not grown this far from the bones yet: nothing more to draw here
 vec3 cBack=vec3(.34,.26,.19),cSide=vec3(.52,.40,.29),cBelly=vec3(.76,.68,.55);
 // the far limbs (leg, foot, arm), in shade: one piece
 {vec2 Hh=p.hip+R2(vec2(.05,-.10),p.ba);vec2 ax=normalize(p.kF-Hh);vec2 pn=vec2(-ax.y,ax.x);if(pn.y<0.)pn=-pn;
  vec2 cm=mix(Hh,p.kF,.5);float dt=sdEll(R2(m-cm,-atan(ax.y,ax.x)),vec2(.5*length(p.kF-Hh)+.16,.33));
  dt=smin(dt,sdCap(m,p.kF,p.aF,.20,.11),.10);
  float dcL=yCoatD(dt,dot(m-cm,pn)/.34,m.x+7.3,m,p,t,2.);
  float dl=sdCap(m,p.sh+vec2(.10,.04),p.e+vec2(.12,.05),.12,.09);dl=min(dl,sdCap(m,p.e+vec2(.12,.05),p.w+vec2(.14,.05),.09,.07));
  float dcA=yCoatD(dl,(m.y-p.e.y-.05)/.12,m.x+3.1,m,p,t,5.);
  float df=sdCap(m,p.aF,p.bF,.095,.07);df=min(df,sdCap(m,p.bF,p.bF+vec2(-.33,-.03),.05,.025));
  float dc=min(dcL,dcA);float d=min(dc,df);if(needB)d=max(d,gc);
  if(d*YS<PX*4.){float st=.5;vec4 L=vec4(0.);if(dc<=df)L=yHair(m+vec2(5.3,.9),p,t,st);
   vec3 c=df<dc?vec3(.24,.22,.20):yCoatCol(cSide*.55,L,st,p);
   yFurPiece(d*YS,min(min(dt,dl),df)*YS,c,m,YFL,.05,1.);}}
 // the body: trunk, neck and tail
 vec2 b=R2(m-p.hip,-p.ba);
 float dTo=sdEll(b-vec2(-.95,-.10+.04*p.sB),vec2(1.15,.58));
 float dCh=sdEll(b-vec2(-1.70,-.26+.05*p.sB),vec2(.52,.60));
 float dHp=sdEll(b-vec2(.0,.02),vec2(.60,.50));
 float dBo=smin(smin(dTo,dCh,.25),dHp,.25);
 float tn;vec2 hE=p.hd+R2(vec2(.20,-.06),p.ha);float dNk=sdTube(m,p.nb,p.nc,hE,.42,.23,tn);
 float tq;float dTl=sdTube(m,p.tb,p.tc,p.tt,.44,.05,tq);
 float dBody=smin(smin(dBo,dNk,.18),dTl,.20);float dOut=dBody;
 // the head: a deep tyrannosauroid skull (about a metre long) in skin, a low ridged crest along the snout, a heavy brow; the lips
 // cover the teeth (the closed mouth is a gently scalloped line); the back of the head and the cheeks are feathered (with the body)
 vec2 h=R2(m-p.hd,-p.ha);
 float dSk=smin(smin(sdEll(h-vec2(-.20,.05),vec2(.30,.25)),sdCap(h,vec2(-.40,.05),vec2(-.93,-.005),.20,.105),.10),sdCap(h,vec2(-.15,-.16),vec2(-.95,-.10),.13,.055),.06);
 dSk=smin(dSk,sdEll(h-vec2(-.05,-.06),vec2(.19,.17)),.06);
 dSk=smin(dSk,sdCap(h,vec2(-.86,.145),vec2(-.40,.262),.022,.030)-.007*(.5+.5*sin(h.x*70.)),.03);
 dSk=smin(dSk,sdEll(h-vec2(-.38,.225),vec2(.09,.042)),.03);
 {float yl=mix(-.062,-.130,ss(-.97,-.12,h.x))+.005*sin(h.x*28.);
  vec3 sc=mix(vec3(.53,.46,.41),vec3(.43,.37,.33),ss(-.60,-.95,h.x));
  sc=mix(sc,vec3(.62,.47,.39),ss(.12,.19,h.y)*ss(-.95,-.30,h.x)*.75);
  sc=mix(sc,vec3(.64,.57,.51),ss(-.10,-.20,h.y)*.6);
  sc=mix(sc,vec3(.66,.54,.50),ss(.035,.0,abs(h.y-yl))*ss(-.97,-.85,h.x)*.5);
  sc*=mix(vec3(1.),vec3(.76,.76,.80),p.wet);
  float ml=ss(PXm*1.3,0.,abs(h.y-yl)-.004)*ss(-.97,-.93,h.x)*ss(-.10,-.16,h.x);sc=mix(sc,vec3(.16,.12,.11),ml*.9);
  float dno=sdEll(R2(h-vec2(-.89,.08),-.35),vec2(.034,.016));sc=mix(sc,vec3(.12,.10,.09),ss(PXm,-PXm,dno));
  float d=dSk;if(needB)d=max(d,gc);
  PIECE(d*YS,sc,K_SKIN,h*9.,vec2(1,0),.03,1.,0.);
  shadow(ss(.03,.0,abs(h.y-yl+.025))*ss(-.95,-.75,h.x)*ss(-.10,-.30,h.x)*.18*step(0.,-dSk),vec3(.7,.66,.66),0.);}
 // the coat of the body and of the back of the head: one piece
 {float wN=ss(.15,-.10,dNk-dBo),wT=ss(.15,-.10,dTl-dBo);
  float sYb=(b.y+.10)/.58;
  vec2 cn=bez(p.nb,p.nc,hE,tn),Tn=bezT(p.nb,p.nc,hE,tn);vec2 Nn=vec2(-Tn.y,Tn.x);if(Nn.y<0.)Nn=-Nn;float sYn=dot(m-cn,Nn)/mix(.42,.23,tn);
  vec2 ct=bez(p.tb,p.tc,p.tt,tq),Tt=bezT(p.tb,p.tc,p.tt,tq);vec2 Nt=vec2(-Tt.y,Tt.x);if(Nt.y<0.)Nt=-Nt;float sYt=dot(m-ct,Nt)/mix(.44,.05,tq);
  float sY=mix(mix(sYb,sYn,wN),sYt,wT);
  vec2 dir=R2(normalize(mix(vec2(1.,-.55),vec2(.25,-1.),ss(-.2,-.8,sYb))),p.ba);
  dir=normalize(mix(dir,normalize(-Tn+vec2(0.,-.6)),wN));dir=normalize(mix(dir,normalize(Tt+vec2(0.,-.35)),wT));
  float dcB=yCoatD(dBody,sY,m.x,m,p,t,0.);dOut=dcB;
  float xb=-.01+.35*max(0.,.05-h.y)+.05*(vn(vec2(h.y*18.,3.))-.5);
  float sYh=(h.y+.02)/.24;
  float dcH=yCoatD(max(dSk-.040,xb-h.x),sYh,h.x+9.,m,p,t,9.);
  if(dcH<dcB){sY=sYh;dir=R2(normalize(vec2(1.,-.7)),p.ha);}
  float dc=min(dcB,dcH);if(needB)dc=max(dc,gc);
  vec3 col=mix(cBelly,cSide,ss(-.75,-.15,sY));col=mix(col,cBack,ss(.15,.75,sY));
  col*=.92+.14*fbm2(m*vec2(1.2,2.)+3.);col=mix(col,col*.80,ss(.55,.75,vn(m*vec2(2.2,3.)+7.))*ss(.0,.6,sY));
  if(dc*YS<PX*4.){float st;vec4 L=yHair(m,p,t,st);
   yFurPiece(dc*YS,min(dBody,max(dSk-.040,xb-h.x))*YS,yCoatCol(col,L,st,p),m,YFL,.07,1.);
   ySheen(dc,sY,L,st,p);}}
 // the eye: gold, under the heavy brow
 if(G>.3){vec2 ec=p.hd+R2(vec2(-.365,.12),p.ha);eyeA(q,Y0+ec*YS,.060*YS,vec3(.78,.58,.24),vec3(.40,.34,.30),max(blinkAt(t,.31),ss(3.9,3.96,t)*ss(4.25,4.1,t)),0.);
  float dbr=sdEll(R2(h-vec2(-.37,.18),-.12),vec2(.085,.024));shadow(ss(.02,-.01,dbr)*.25,vec3(.6,.55,.55),0.);}
 // the near limbs: the big feathered thigh and shank, the scaly foot, the feathered arm and its three fingers: one piece. Its dark
 // contour only where it stands against the background, inside the body only a soft shade and the run of the filaments.
 {vec2 Hh=p.hip+R2(vec2(-.05,-.10),p.ba);vec2 ax=normalize(p.kN-Hh);vec2 pn=vec2(-ax.y,ax.x);if(pn.y<0.)pn=-pn;
  vec2 cm=mix(Hh,p.kN,.5);float dt=sdEll(R2(m-cm,-atan(ax.y,ax.x)),vec2(.5*length(p.kN-Hh)+.18,.35));
  dt=smin(dt,sdCap(m,p.kN,p.aN,.21,.115),.10);
  float sYl=dot(m-cm,pn)/.36;float dcL=yCoatD(dt,sYl,m.x+11.7,m,p,t,4.);
  float dl=sdCap(m,p.sh,p.e,.13,.10);dl=smin(dl,sdCap(m,p.e,p.w,.10,.075),.04);
  float sYa=(m.y-mix(p.e.y,p.w.y,.5))/.12;float dcA=yCoatD(dl,sYa,m.x+5.3,m,p,t,6.);
  float df=sdCap(m,p.aN,p.bN,.10,.075);df=smin(df,sdCap(m,p.bN,p.bN+vec2(-.33,-.04),.055,.026),.02);df=smin(df,sdCap(m,p.bN,p.bN+vec2(-.27,.02),.05,.024),.02);
  vec2 K=p.f-p.w;vec2 kn=normalize(vec2(-K.y,K.x));float dfi=1e5,dcl=1e5;
  for(int k=0;k<3;k++){float fk=float(k)-1.;vec2 a=p.w+kn*.03*fk,e=p.f+kn*.05*fk+K*.1*(1.-abs(fk));dfi=min(dfi,sdCap(m,a,e,.028,.018));
   vec2 cd=normalize(e-a);dcl=min(dcl,sdCap(m,e,e+cd*.045+vec2(0.,-.035),.016,.003));}
  for(int k=0;k<2;k++){vec2 tip=p.bN+(k==0?vec2(-.36,-.045):vec2(-.30,.015));dcl=min(dcl,sdCap(m,tip,tip+vec2(-.07,-.035),.022,.004));}
  float dsk=min(df,dfi);float dc=min(dcL,dcA);float d=min(dc,dsk);if(needB)d=max(d,gc);
  vec2 dir=normalize(vec2(.33,-1.));
  vec3 col=dcA<dcL?mix(cSide*.92,cBelly*.9,ss(.2,-.8,sYa)):mix(cBelly,cSide,ss(-.9,-.2,sYl))*(.95+.1*fbm2(m*2.))*.95;
  if(dsk<dc){col=df<dfi?vec3(.42,.38,.33)*mix(1.,.75,p.wet):vec3(.40,.35,.31);dir=df<dfi?normalize(p.bN-p.aN):normalize(K);}
  float st=.5;vec4 L=vec4(0.);if(dsk>=dc&&d*YS<PX*4.){L=yHair(m+vec2(3.1,1.7),p,t,st);col=yCoatCol(col,L,st,p);}
  float lw=ss(-.03,.04,dOut);
  yFurPiece(d*YS,min(min(dt,dl),dsk)*YS,col,m,dsk<dc?dir:YFL,.06,max(lw,step(dsk,dc)));
  shadow(ss(.0,-.05,d)*ss(-.12,-.03,d)*(1.-lw)*.30,vec3(.62,.58,.56),0.);
  ySheen(d,max(sYl,sYa),L,st,p);
  if(needB)dcl=max(dcl,gc);veil(vec3(.13,.11,.10),cov(dcl*YS),0.);}}

// Drops of the shake: they fly off the head, then the body, then the tail, and fall; a fine spray about the body (decor).
void ySpray(vec2 q,YP p,float t){
 if(t<4.6||t>7.8)return;
 vec2 m=(q-Y0)/YS;if(m.x<-5.8||m.x>6.5||m.y<-.2||m.y>5.2)return;
 float a=0.,gl=0.;
 for(int i=0;i<24;i++){float fi=float(i);float r1=h11(fi*3.1+.7),r2=h11(fi*5.3+1.9),r3=h11(fi*7.7+2.3),r4=h11(fi*1.3+4.1);
  float t0=i<6?4.66:(i<16?4.9:5.2),dur=i<6?.55:(i<16?.85:.95);
  float te=t0+dur*r1;float ag=t-te;
  float up=r2<.55?1.:-1.;
  vec2 P0=i<6?p.hd+vec2(-.5+.9*r3,.12*up-.05):(i<16?p.hip+R2(vec2(-2.2+2.8*r3,up>0.?.40:-.75),p.ba):bez(p.tb,p.tc,p.tt,.15+.85*r3)+vec2(0.,mix(.40,.08,r3)*up));
  vec2 v=vec2((r4-.5)*2.4,up*(2.2+3.2*h11(fi*9.1)));
  vec2 P=P0+v*ag+vec2(0.,-4.9)*ag*ag;vec2 vv=v+vec2(0.,-9.8)*ag;
  float live=step(0.,ag)*ss(1.3,.8,ag)*step(.02,P.y);
  float sz=.038+.020*r4;float dd=sdSeg(m,P,P-vv*.030)-sz;
  a=max(a,ss(.03,-.01,dd)*live);gl=max(gl,ss(.014,-.004,length(m-P)-sz*.5)*live);}
 // the spray: a soft mist round the part that shakes, full of fine droplets
 float hz=0.;
 {float e1=ss(4.6,4.8,t)*ss(5.9,5.3,t);hz=max(hz,e1*ss(1.,.3,length((m-p.hd-vec2(-.3,0.))/vec2(1.0,.75))));
  float e2=p.eB+ss(5.9,5.95,t)*ss(6.6,6.0,t)*.6;hz=max(hz,e2*ss(1.,.35,length((R2(m-p.hip,-p.ba)-vec2(-.9,-.1))/vec2(2.0,1.25))));
  float e3=p.eT+ss(6.3,6.35,t)*ss(7.0,6.4,t)*.6;hz=max(hz,e3*ss(1.,.3,length((m-p.tc-vec2(.4,0.))/vec2(2.2,.8))));}
 float msk=ss(.05,.5,hz);
 hz*=.14+.16*fbm2(m*1.5+vec2(-t*.6,t*.3));
 {float yc=p.hip.y-.1;float sg=m.y>yc?1.:-1.;vec2 g=vec2(m.x*4.5,(m.y-yc)*4.5-sg*t*10.);vec2 ci=floor(g),f=fract(g)-.5;
  float on=step(.45,h21(ci+sg*7.))*msk;vec2 c=(h22(ci)-.5)*.6;a=max(a,ss(.04,-.04,length((f-c)*vec2(1.,.40))-.075)*on);gl=max(gl,ss(.05,-.02,length(f-c)-.03)*on);}
 veil(vec3(.88,.91,.93),hz,1.);
 // a drop: a little darker than what is behind it (it bends the light), with a bright core
 shadow(a*.30,vec3(.62,.68,.74),1.);veil(vec3(.90,.94,.97),gl*.80,1.);}

// Water dripping from the tips of the wet locks (decor): fewer drips once the coat has been shaken.
void yDrips(vec2 q,YP p,float t){vec2 m=(q-Y0)/YS;if(m.x<-3.8||m.x>3.5||m.y<-.05||m.y>2.6)return;float a=0.;
 for(int i=0;i<6;i++){float fi=float(i);
  vec2 s=i<3?p.hip+R2(vec2(-1.65+.6*fi,-.18-.62*sqrt(max(0.,1.-pow((-.65+.6*fi)/1.22,2.)))-.18),p.ba):(i==3?bez(p.nb,p.nc,p.hd,.55)+vec2(0.,-.55):(i==4?p.e+vec2(-.05,-.22):bez(p.tb,p.tc,p.tt,.25)+vec2(0.,-.55)));
  float per=mix(2.6,1.15,p.wet)+.4*h11(fi);float ph=(t+h11(fi*2.3)*per)/per;float ci=floor(ph),f=fract(ph)*per;
  float on=step(h11(ci+fi*7.),p.wet*.8+.15);
  float fall=max(0.,f-.55);vec2 P=s+vec2(0.,-4.9*fall*fall);on*=step(.03,P.y);
  float r=mix(.012,.028,ss(.0,.55,f));float dd=sdSeg(m,P,P+vec2(0.,.02+9.8*fall*.03))-r;a=max(a,ss(.012,-.006,dd)*on);}
 veil(vec3(.80,.86,.90),a*.55*ss(.30,.50,GROW),1.);}

// The first beat: a big drop falls from the canopy on its head (3.55–3.9) and splashes.
void yDrop(vec2 q,YP p,float t){if(t<3.4||t>4.4)return;
 vec2 tgt=Y0+(p.hd+R2(vec2(-.30,.20),p.ha))*YS;
 float ag=t-3.9;float a=0.;
 {float y=tgt.y+1.4*ag*ag+.55*(-ag);vec2 c=vec2(tgt.x,y);a=ss(PX,-PX,length((q-c)/vec2(1.,1.6))-.0035)*step(ag,0.);}
 for(int i=0;i<6;i++){float fi=float(i);float an=PI*(.15+.7*fi/5.);vec2 v=vec2(cos(an),sin(an))*(.10+.05*h11(fi));
  vec2 c=tgt+v*ag+vec2(0.,-.45)*ag*ag;a=max(a,ss(.0016,.0006,length(q-c))*ss(.45,.2,ag)*step(0.,ag));}
 veil(vec3(.86,.92,.96),a*.75,1.);}

// ---- The Sinosauropteryx: a little feathered theropod with a very long tail, running ----
struct SP{vec2 hip;float ba;vec2 nb,hd;float ha;vec2 kN,aN,bN,kF,aF,bF;vec2 sh,w;vec2 tb,tc,tt;};
float sinoX(float t){return mix(1.02,-1.04,sat((t-8.6)/1.6));}
SP sPose(float t){SP p;float ph=(t-8.6)*5.2;
 float bob=.014*cos(ph*TAU*2.);
 p.hip=vec2(0.,.27+bob);p.ba=-.10+.02*sin(ph*TAU*2.+.5);
 p.nb=p.hip+R2(vec2(-.21,.05),p.ba);p.hd=p.nb+vec2(-.10,.10+.6*bob);p.ha=.08-.04*sin(ph*TAU*2.);
 for(int L=0;L<2;L++){vec2 c=stepCycle(ph+(L==0?0.:.5),.40);vec2 bb=vec2(-.36*c.y-.03,.012+.07*c.x);float th=.55+.6*c.x;
  vec2 a=bb+.085*vec2(sin(th),cos(th));vec2 k=knee(p.hip,a,.12,.14,-1.);
  if(L==0){p.bN=bb;p.aN=a;p.kN=k;}else{p.bF=bb;p.aF=a;p.kF=k;}}
 p.sh=p.hip+R2(vec2(-.18,-.03),p.ba);p.w=p.sh+vec2(-.035,-.06);
 p.tb=p.hip+R2(vec2(.05,.02),p.ba);p.tc=p.tb+vec2(.32,.06+.015*sin(ph*TAU-.5));p.tt=p.tb+vec2(.64,.05+.035*sin(ph*TAU-1.4));
 return p;}
void sino(vec2 q,float t){
 if(t<8.5||t>10.4)return;float xr=sinoX(t);vec2 o=vec2(xr,SG);
 vec2 m=(q-o)/SSC;if(m.x<-.65||m.x>.80||m.y<-.06||m.y>.55)return;
 SP p=sPose(t);float PXm=PX/SSC;
 vec3 cBack=vec3(.56,.32,.19),cBelly=vec3(.86,.80,.70);
 // the far leg and foot (in the coat's piece below)
 float dFL=sdCap(m,p.hip,p.kF,.045,.03);dFL=smin(dFL,sdCap(m,p.kF,p.aF,.025,.014),.01);
 float dFF=sdCap(m,p.aF,p.bF,.011,.009);dFF=min(dFF,sdCap(m,p.bF,p.bF+vec2(-.055,-.005),.008,.004));float dFar=min(dFL,dFF);
 // body, neck, head and tail: one coat of fine filaments; a dark mask through the eye, rings on the tail
 vec2 b=R2(m-p.hip,-p.ba);vec2 h=R2(m-p.hd,-p.ha);
 float dB=sdEll(b-vec2(-.09,.0),vec2(.16,.075));
 float dN=sdCap(m,p.nb,p.hd,.036,.024);
 float tq;float dT=sdTube(m,p.tb,p.tc,p.tt,.045,.008,tq);
 float dh=smin(sdEll(h,vec2(.038,.031)),sdCap(h,vec2(-.02,-.004),vec2(-.090,-.012),.021,.009),.015);
 float dS=smin(smin(smin(dB,dN,.03),dT,.03),dh,.012);
 {float d=dS-.006*(vn(m*90.)-.4)*ss(.0,-.03,dh-dS);
  float sY=b.y/.075;float wT=ss(.04,-.03,dT-dB);float wH=ss(.02,-.01,dh-min(dB,dN));
  vec3 col=mix(cBelly,cBack,ss(-.55,.15,sY));
  float band=ss(-.35,.35,sin(tq*TAU*9.5));vec3 tc=mix(vec3(.52,.31,.20),vec3(.70,.54,.38),band);tc=mix(tc,cBelly*.9,ss(.0,-.9,dot(m-bez(p.tb,p.tc,p.tt,tq),vec2(0.,1.))/.03)*.5);
  col=mix(col,tc,wT);
  vec3 hc=mix(cBelly,cBack,ss(-.012,.008,h.y));
  float mask=ss(.010,.004,abs(h.y-(.004+.10*(h.x+.01))))*ss(-.075,-.05,h.x)*ss(.035,.02,h.x);hc=mix(hc,vec3(.20,.13,.10),mask);
  hc=mix(hc,vec3(.15,.11,.09),ss(PXm*1.2,0.,abs(h.y+.011-.04*(h.x+.03))-.0012)*ss(-.088,-.08,h.x)*ss(.014,.006,h.x));
  col=mix(col,hc,wH);
  vec2 dir=normalize(mix(mix(vec2(1.,-.15),bezT(p.tb,p.tc,p.tt,tq),wT),vec2(1.,0.),wH));
  if(dFar<d){col=dFF<dFL?vec3(.28,.25,.22):cBack*.55;dir=normalize(p.aF-p.kF);}else col=mix(col,col*.25,ss(PXm*1.6,PXm*.4,-d)*step(dFar,0.));
  PIECE(min(d,dFar)*SSC,col,K_FUR,dFar<d?m*2.:FU(m-p.hip,dir,1.2,4.),dir,dFar<d?.006:.012,1.,0.);}   // texture scales above two pixels (no shimmer)
 eyeA(q,o+(p.hd+R2(vec2(-.012,.006),p.ha))*SSC,.0034,vec3(.62,.44,.18),vec3(.25,.16,.12),blinkAt(t,.7),0.);
 // the near arm (short), leg and foot: one piece
 {float da=sdCap(m,p.sh,p.w,.018,.012);
  float dl=sdCap(m,p.hip,p.kN,.05,.032);dl=smin(dl,sdCap(m,p.kN,p.aN,.026,.014),.01);
  float df=sdCap(m,p.aN,p.bN,.012,.010);df=min(df,sdCap(m,p.bN,p.bN+vec2(-.06,-.006),.009,.004));
  float d=min(min(da,dl),df);
  vec3 c=df<min(da,dl)?vec3(.40,.35,.30):(da<dl?cBack*.95:mix(cBack,cBelly,.25));
  PIECE(d*SSC,c,K_FUR,m*2.,normalize(p.aN-p.kN),.006,max(ss(-.01,.01,dS),step(df,dl)),0.);}}
// its little fossil, curled in the rock (the classic pose: the neck thrown back, the long tail)
float sinoFossilD(vec2 q){vec2 o=vec2(.40,-.42);vec2 m=(q-o)/SSC;float d=1e5;
 d=min(d,sdEll(m-vec2(-.05,0.),vec2(.13,.05)));for(int i=0;i<6;i++){float fi=float(i);float x=-.15+fi*.05;d=min(d,sdSeg(m,vec2(x,.03),vec2(x+.02,-.06))-.006);}
 d=min(d,sdCap(m,vec2(-.16,.03),vec2(-.26,.20),.014,.011));d=min(d,sdCap(m,vec2(-.26,.20),vec2(-.13,.30),.011,.010));d=min(d,sdEll(m-vec2(-.08,.31),vec2(.045,.022)));
 d=min(d,sdCap(m,vec2(.08,.0),vec2(.40,.04),.016,.010));d=min(d,sdCap(m,vec2(.40,.04),vec2(.68,-.10),.010,.006));
 d=min(d,sdCap(m,vec2(.0,-.02),vec2(-.02,-.14),.012,.01));d=min(d,sdCap(m,vec2(-.02,-.14),vec2(.08,-.20),.01,.008));d=min(d,sdCap(m,vec2(.08,-.20),vec2(.02,-.22),.007,.005));
 return d*SSC;}

// ---- Liaoning: the lake, the forest, the mist ----
float yShore(float x){return -.165+.010*sin(x*3.1+.5)+.006*sin(x*9.+1.)+.03*ss(.15,.7,x);}
// A conifer: a narrow cone of whorls of branches that droop towards their tips, bare at the foot. Returns the distance of its foliage
// (q units); tr: of its trunk; sh: its shading (light on the upper side of each whorl and towards the sun).
float coniferD(vec2 q,vec2 b,float h,float w,float seed,float t,out float tr,out float sh){
 vec2 l=(q-b)/h;float wr=w/h;
 if(abs(l.x)>wr*1.55+.04||l.y<-.05||l.y>1.05){tr=1e5;sh=0.;return 1e5;}   // far from this tree
 l.x-=.006*sin(t*.6+seed)*l.y*l.y;
 float u=l.y,ax=abs(l.x);
 float env=wr*pow(sat(1.-u),.95)*ss(.10,.24,u);
 float u2=u+.10*ax/max(wr,.01)+.03*(vn(vec2(l.x*24.,seed))-.5);
 float tu=u2*10.+h11(seed)*.7;float tier=fract(tu);float tw=.70+.45*h11(floor(tu)+seed*3.);
 float fol=ss(.0,.10,tier)*ss(.90,.35,tier);
 float nz=fbm2(vec2(l.x*36.,u*60.)+seed);
 float df=(ax-env*tw*(.25+.75*fol)*(.80+.45*nz))*h*.8;df=max(df,(u-1.)*h*.5);df=max(df,-l.y*h);
 sh=ss(.6,.0,tier)*ss(.3,.7,nz)*(.75+.25*ss(.0,-1.,l.x/max(env,.001)))*(.6+.4*ss(.2,.9,ax/max(env,.001)));
 tr=max((ax-.010*(1.-u*.6))*h,max((u-.92)*h,-l.y*h));
 return df;}
// A ginkgo: a straight trunk with a few rising branches, a light, uneven crown of clusters of fan leaves.
float ginkgoD(vec2 q,vec2 b,float h,float seed,float t,out float tr,out float sh){
 vec2 l=(q-b)/h;
 if(abs(l.x)>.55||l.y<-.05||l.y>1.18){tr=1e5;sh=0.;return 1e5;}   // far from this tree
 float dt=sdCap(l,vec2(0.),vec2(.02,.84),.030,.012);dt=min(dt,sdCap(l,vec2(.01,.40),vec2(.22,.70),.012,.005));dt=min(dt,sdCap(l,vec2(.015,.52),vec2(-.20,.78),.010,.005));
 tr=dt*h;
 float dc=1e5;for(int i=0;i<8;i++){float fi=float(i);vec2 c=vec2(-.26+.52*h11(fi+seed),.52+.44*h11(fi*2.3+seed))+vec2(.004*sin(t*.5+fi),0.);
  dc=min(dc,sdEll(l-c,vec2(.15,.11)*(.75+.5*h11(fi*3.7+seed))));}
 float nz=fbm2(l*22.+seed);dc+=.05*(nz-.5);
 sh=ss(.35,.70,nz)*ss(.45,1.,l.y-.3*l.x)*(1.-.3*ss(.62,.80,vn(l*26.+seed)));
 return dc*h;}
// A fern frond (after the finished scene of the tyrannosaurs) and clumps of ferns: the nearest clump only, one piece.
float yFern(vec2 q,vec2 b,float ang,float len,float bend){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012);return max(d,max(-l.y,l.y-len));}
// A clump of ferns: the distance to its nearest frond, and that frond's shade (sh).
float yFernsD(vec2 q,vec2 base,float sc,float t,float n,float seed,out float sh){
 float d=1e5,id=0.;
 for(int i=0;i<6;i++){float fi=float(i);if(fi>=n)break;
  float ang=(-1.15+2.3*fi/(n-1.))+.04*sin(t*.9+fi+seed);float len=sc*(.75+.35*h11(fi+seed));float e=yFern(q,base,ang,len,.35*sign(ang));if(e<d){d=e;id=fi;}}
 sh=.85+.3*h11(id*3.+seed);return d;}
// A clump of horsetails: straight jointed stems with whorls of thin branches (the distance, in screen units).
float horsetailsD(vec2 q,vec2 b,float h,float seed,float t){vec2 l=(q-b)/h;
 float d=1e5;
 for(int i=0;i<5;i++){float fi=float(i);float x0=(h11(fi+seed)-.5)*.6;float ht=.55+.45*h11(fi*1.9+seed);float lean=(h11(fi*3.1+seed)-.5)*.25+.01*sin(t*.8+fi);
  float y=l.y;float x=l.x-x0-lean*y;
  float e=max(abs(x)-.014,max(-y,y-ht));
  float jy=fract(y*14.);float wh=abs(x)-.07*(1.-y/ht)*ss(.25,.0,jy)*step(.2,y);e=min(e,.5*max(max(wh,abs(jy-.08)-.06),max(-y,y-ht+.02)));d=min(d,e);}
 return d*h;}
// Ferns in front of horsetails (or the other way round, front=false), one piece: the nearer one shows where they overlap.
void yPlants(vec2 q,float t,float dH,vec2 bH,float hH,vec3 cH,float dF,float shF,vec2 bF,float scF,vec3 cF,bool fernsFront){
 if(min(dH,dF)>PX*4.)return;
 bool f=fernsFront?dF<PX*.5||dF<dH:!(dH<PX*.5||dH<dF);
 float d=min(dH,dF);vec3 c=f?cF*shF:cH;vec2 u=f?(q-bF)*vec2(20.,60.)/scF:((q-bH)/hH)*vec2(30.,90.);
 PIECE(d,c,K_PLANT,u,vec2(0,1),f?.004:.003,f?.6:.4,1.);}

// The backdrop: the pearl-grey sky, the volcanic hills in mist, the lake, the far shore, the muddy shore with puddles.
void liaoning(vec2 q,float t){
 SUNL=normalize(vec3(-.40,.72,.56));SUNC=vec3(.92,.92,.88);AMBC=vec3(.56,.61,.65);BACK=.15;
 vec3 hor=vec3(.86,.87,.85),top=vec3(.64,.69,.73);
 float ysh=yShore(q.x);
 // the sky (one piece), soft clouds; the sun behind thin cloud
 {vec3 c=mix(hor,top,ss(HZ,HZ+.70,q.y));
  float sd=length((q-vec2(.32,.40))/vec2(1.,.8));c=mix(c,vec3(.96,.95,.90),ss(.45,.0,sd)*.35);
  PIECE(-1.,c,K_SKY,q+vec2(-t*.004,0.),vec2(1,0),.1,0.,1.);
  float cl=fbm(vec2(q.x*1.4-t*.010,q.y*4.5+.3));veil(vec3(.74,.77,.80),ss(.45,.78,cl)*ss(.06,.30,q.y)*.30,1.);
  veil(vec3(.95,.95,.93),ss(.55,.80,fbm2(vec2(q.x*2.2-t*.016,q.y*7.+2.)))*ss(.10,.35,q.y)*.25,1.);}
 // far hills in the haze (painted flat): a volcanic cone, the ridges, the far shore's forest, mist on it
 veil(mix(vec3(.66,.70,.72),hor,.62),cov(q.y-ridge(q.x,HZ+.065,.07,1.1,3.)),1.);
 {float cx=-.42;float tp=HZ+.155-1.5*abs(q.x-cx)+.6*(q.x-cx)*(q.x-cx);tp=min(tp,HZ+.13+.01*vn(vec2(q.x*40.,2.)));tp=max(tp,HZ+.03);
  veil(mix(vec3(.60,.65,.68),hor,.62)*(.97+.06*vn(q*vec2(30.,8.))),cov(q.y-tp),1.);}
 veil(mix(vec3(.55,.61,.62),hor,.50),cov(q.y-ridge(q.x,HZ+.035,.035,2.4,7.)),1.);
 veil(hor,ss(HZ+.10,HZ,q.y)*.35,1.);
 {float tp=HZ+.004+.020*fbm(vec2(q.x*9.,1.3))+.010*vn(vec2(q.x*40.,2.));
  float x=q.x*11.;float ci=floor(x),f=fract(x);float hh=h11(ci*1.3);tp=max(tp,HZ+.02+.03*hh-abs(f-.5)/11.*4.-step(hh,.55));
  veil(mix(vec3(.48,.55,.55),hor,.50)*(.95+.1*vn(q*vec2(60.,20.))),cov(q.y-tp),1.);}
 veil(vec3(.90,.91,.90),ss(HZ+.06,HZ+.01,q.y)*ss(.3,.75,fbm2(vec2(q.x*3.-t*.02,q.y*30.)))*.55,1.);
 // the lake: the sky and the far shore in it, low ripples, rings where drops fall, mist drifting (painted)
 {float dz=(HZ-q.y);vec3 c=mix(vec3(.78,.81,.81),vec3(.50,.58,.60),ss(.0,.20,dz));
  c=mix(c,vec3(.56,.62,.62),ss(.020,.004,dz)*.6);
  float z=.10/max(dz,.008);vec2 g=vec2(q.x*z,z);
  c*=.97+.05*vn(vec2(g.x*1.5+t*.05,g.y*14.));c=mix(c,vec3(.88,.90,.90),ss(.62,.80,vn(vec2(g.x*2.+t*.15,g.y*1.5)))*.10*ss(.0,.06,dz));
  vec2 gc=g*vec2(.6,1.2);vec2 ci=floor(gc);vec2 fc=fract(gc)-.5;float hh=h21(ci);float per=2.2+1.5*hh;float ag=fract(t/per+hh)*per;
  float rr=length(fc-(h22(ci)-.5)*.5)-ag*.25;c=mix(c,vec3(.92,.94,.94),ss(.03,.0,abs(rr))*ss(1.6,.2,ag)*step(.4,hh)*.25);
  c=mix(c,vec3(.88,.90,.90),ss(.35,.80,fbm2(vec2(q.x*2.5-t*.03,q.y*18.+3.)))*.35*ss(-.12,-.02,q.y-HZ+.1));
  veil(c,cov(q.y-HZ)*step(ysh-.03,q.y),1.);}
 // the shore and the forest floor: wet mud, moss, fallen leaves, puddles of sky
 {float dg=q.y-ysh;
  float z=.12/max(HZ-q.y,.01);vec2 g=vec2(q.x*z,z);
  vec3 c=mix(vec3(.40,.38,.31),vec3(.27,.24,.19),ss(-.18,-.55,q.y));
  c=mix(c,vec3(.30,.36,.22),ss(.55,.75,fbm2(g*vec2(1.5,2.)+4.))*.6);
  if(dg<PX*2.)veil(c*(.78+.35*fbm(g*vec2(6.,9.)*30.))*(AMBC+SUNC*.85*lambert(vec3(0,0,1))),cov(dg),1.);
  veil(vec3(.70,.72,.70),ss(.010,.0,abs(dg+.004))*.45,1.);
  float pz=fbm2(g*vec2(3.,5.)+vec2(1.3,.2));float pud=ss(.61,.64,pz)*ss(-.24,-.30,q.y);
  vec3 pc=mix(vec3(.70,.74,.75),vec3(.52,.58,.60),ss(-.2,-.5,q.y));
  vec2 gc=g*vec2(1.3,2.6);vec2 ci=floor(gc);vec2 fc=fract(gc)-.5;float hh=h21(ci+3.);float per=1.6+1.2*hh;float ag=fract(t/per+hh)*per;
  pc=mix(pc,vec3(.94,.95,.95),ss(.04,.0,abs(length(fc-(h22(ci)-.5)*.4)-ag*.28))*ss(1.2,.1,ag)*.40);
  veil(pc,pud*.80,1.);
  veil(vec3(.26,.24,.20),ss(.605,.612,pz)*ss(.62,.613,pz)*.35*ss(-.24,-.30,q.y),1.);
  vec2 cid;vec3 v=voro(g*vec2(16.,30.),cid);vec2 lo=g*vec2(16.,30.)-cid-.5;
  veil(mix(vec3(.50,.50,.26),vec3(.58,.48,.24),h21(cid)),step(.55,h21(cid+.7))*step(dg,-.02)*ss(.13,.08,v.x)*ss(-.6,.2,lo.y)*.45,1.);}}
// The forest beside the lake: a far layer of conifers and ginkgos painted in the haze, mist, a near layer (one piece for the foliage,
// one for the trunks); horsetails and ferns on the shore.
void forest(vec2 q,float t){
 vec3 mist=vec3(.80,.84,.84);float tr,sh;
 // far layer (painted flat)
 {float d=1e5,s=0.,dtr=1e5;
  for(int i=0;i<6;i++){float fi=float(i);float x=-1.55+.62*fi+.2*h11(fi*3.3);x+=step(-.25,x)*step(x,.10)*.40;
   float e=coniferD(q,vec2(x,yShore(x)+.05+.01*h11(fi)),.36+.16*h11(fi*1.7),.06,fi*2.1+1.,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);}
  float e=coniferD(q,vec2(.30,-.115),.62,.075,4.2,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);
  e=coniferD(q,vec2(1.18,-.13),.75,.09,5.5,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);
  e=ginkgoD(q,vec2(.58,-.12),.46,7.1,t,tr,sh);dtr=min(dtr,tr);
  veil(mix(vec3(.28,.25,.21),mist,.6),cov(dtr),1.);
  veil(mix(mix(vec3(.12,.20,.15),vec3(.26,.38,.24),s),mist,.55),cov(d),1.);
  veil(mix(mix(vec3(.24,.38,.17),vec3(.46,.60,.28),sh),mist,.45),cov(e),1.);}
 veil(vec3(.84,.87,.86),ss(.32,.75,fbm2(vec2(q.x*2.-t*.025,q.y*7.)))*.35*ss(.40,-.05,q.y),1.);
 // near layer: three conifers and two ginkgos
 {float d=1e5,s=0.,dtr=1e5,gk=0.;
  float e=coniferD(q,vec2(.47,-.155),.95,.11,8.3,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);
  e=coniferD(q,vec2(1.45,-.17),1.05,.12,9.7,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);
  e=coniferD(q,vec2(-1.30,-.16),.90,.11,3.9,t,tr,sh);if(e<d){d=e;s=sh;}dtr=min(dtr,tr);
  e=ginkgoD(q,vec2(.86,-.165),.66,2.4,t,tr,sh);if(e<d){d=e;s=sh;gk=1.;}dtr=min(dtr,tr);
  e=ginkgoD(q,vec2(-.98,-.16),.55,5.2,t,tr,sh);if(e<d){d=e;s=sh;gk=1.;}dtr=min(dtr,tr);
  if(dtr<PX*2.){vec3 bc=mix(vec3(.26,.21,.18),mist,.25)*(AMBC*.95+SUNC*.55)*(.80+.30*vn(q*vec2(60.,6.)));veil(bc*.85,cov(dtr),1.);}
  vec3 fc=gk>.5?mix(vec3(.24,.38,.17),vec3(.46,.60,.28),s):mix(vec3(.09,.16,.12),vec3(.26,.38,.22),s);
  PIECE(d,mix(fc,mist,.25),K_PLANT,q*vec2(50.,90.),vec2(0,1),.010,.18,1.);}
 veil(vec3(.86,.88,.87),ss(.40,.80,fbm2(vec2(q.x*3.+t*.02,q.y*16.+1.)))*.40*ss(.06,-.10,q.y)*ss(-.24,-.14,q.y),1.);
 // horsetails and ferns along the shore: the nearest clump
 {float x=q.x;vec2 b=x<-.56?vec2(-.80,-.20):(x<-.05?vec2(-.33,-.20):(x<.45?vec2(.20,-.19):vec2(.70,-.22)));float hs=x<-.56?.10:(x<-.05?.07:(x<.45?.08:.13));
  float dH=q.y<b.y+hs*1.05+.01?horsetailsD(q,b,hs,floor(b.x*10.),t):1e5;
  vec2 bf=q.x<.2?vec2(-.62,-.22):vec2(.95,-.26);float scf=q.x<.2?.07:.09;float shf=1.;float dF=q.y<bf.y+scf*1.15+.01&&abs(q.x-bf.x)<scf*1.2?yFernsD(q,bf,scf,t,q.x<.2?5.:6.,q.x<.2?2.:5.,shf):1e5;
  yPlants(q,t,dH,b,hs,vec3(.32,.42,.24),dF,shf,bf,scf,vec3(.30,.42,.20),true);}}
// The foreground (decor): a ginkgo branch hanging in from the top left, its fan leaves dripping; horsetails and ferns at the bottom.
void foreground(vec2 q,float t){
 // the branch and its leaves (one piece)
 if(q.x<-.18&&q.y>.28&&q.y<.72){float tt;float sw=.004*sin(t*.7)+.002*sin(t*1.9+1.);
  vec2 A=vec2(-1.05,.60),B=vec2(-.70,.47+sw),C=vec2(-.34,.40+2.*sw);
  float db=sdTube(q,A,B,C,.010,.0035,tt);
  float best=1e5;vec2 bu=vec2(0.);float bi=0.;
  for(int i=0;i<12;i++){float fi=float(i);float s=.10+.078*fi;vec2 c=bez(A,B,C,s)+vec2(0.,-.004);float ang=PI+(h11(fi)-.5)*2.0+.06*sin(t*1.1+fi*1.7);
   float sz=.036+.016*h11(fi*2.3);
   vec2 l=R2(q-c,-ang)/sz;l.x/=.55+.45*h11(fi*6.1);float r=length(l);float a=atan(l.x,l.y);
   float d=max(r-1.+.025*sin(a*9.+fi),abs(a)-.78);d=max(d,.30-r);d=max(d,-(max(abs(l.x)-.035*r,.80-r)));
   d=min(d,max(abs(l.x)-.04,max(-l.y,l.y-.32)));
   d*=sz;if(d<best){best=d;bu=l;bi=fi;}}
  vec3 lc=mix(vec3(.30,.48,.22),vec3(.52,.62,.28),h11(bi*5.1))*(.85+.25*ss(.3,1.,length(bu)));
  if(db<best)lc=vec3(.34,.27,.22);
  PIECE(min(best,db),lc,K_LEAF,db<best?q*vec2(40.,6.):vec2(atan(bu.x,bu.y)*.9,length(bu)*.3),vec2(1,0),.006,.8,1.);}
 // drops falling from the leaves (they swell at a leaf tip, then fall)
 {float a=0.,g=0.;for(int i=0;i<4;i++){float fi=float(i);vec2 tip=vec2(-.90+.17*fi+.03*h11(fi),.44-.03*fi-.035);
   float per=1.8+.9*h11(fi*1.7);float ph=fract(t/per+h11(fi*4.1));float ag=ph*per;
   float sw=ss(.0,1.2,ag);float fall=max(0.,ag-1.25);vec2 c=tip+vec2(0.,-2.0*fall*fall-.002*sw);
   float r=mix(.0015,.0042,sw);float d=length((q-c)/vec2(1.,1.+fall*5.))-r;
   a=max(a,ss(PX,-PX,d));g=max(g,ss(r*.6,0.,length(q-c-vec2(-.3,.35)*r)));}
  veil(vec3(.80,.86,.90),a*.55,1.);glow(vec3(.30,.32,.32)*g,1.);}
 // at the bottom: ferns on the left, horsetails on the right
 {float shf=1.;float dF=q.x<.0&&q.y<-.31?yFernsD(q,vec2(-.80,-.56),.20,t,6.,8.,shf):1e5;float dH=q.x>.4&&q.y<-.26?horsetailsD(q,vec2(.86,-.58),.30,9.,t):1e5;
  yPlants(q,t,dH,vec2(.86,-.58),.30,vec3(.24,.34,.18),dF,shf,vec2(-.80,-.56),.20,vec3(.24,.36,.16),false);}}
// Drops from the canopy: a few thin falling streaks over the picture (decor).
void canopyDrops(vec2 q,float t){float x=q.x*14.;float ci=floor(x);float fx=fract(x)-.5;
 float hh=h11(ci*1.7+.3);float per=1.6+1.4*hh;float ph=fract(t/per+h11(ci*3.1))*per;
 float y=.60-1.6*ph*ph;float dx=fx-(h11(ci*5.)-.5)*.6;float d=length(vec2(dx/14.,max(0.,abs(q.y-y-.012)-.012)))-.0011;
 veil(vec3(.86,.90,.92),ss(PX,-PX,d)*.45*ss(-.55,-.35,y)*step(.45,hh),1.);}

void life(vec2 q,float t){if(outWin(q,.12))return;
 liaoning(q,t);
 forest(q,t);
 YP p=yPose(t);
 // the shadows under the animals: soft (overcast)
 {vec2 m=(q-Y0)/YS;shadow(ss(1.,.15,length((m-vec2(-.6,0.))/vec2(2.9,.32)))*.45,vec3(.55,.56,.62),1.);}
 contact(q,Y0+p.bN*YS+vec2(-.02,0.),.05,.45);contact(q,Y0+p.bF*YS+vec2(-.02,0.),.045,.35);
 contact(q,vec2(sinoX(t)-.01,SG),.05,.35*step(8.5,t)*step(t,10.4));
 YDB=GROW<.6?yBones((q-Y0)/YS,p,clamp(GROW/YS+.02,.12,.75)):-1.;
 yut(q,p,t,GROW);
 yDrips(q,p,t);
 yDrop(q,p,t);
 ySpray(q,p,t);
 sino(q,t);
 canopyDrops(q,t);
 foreground(q,t);}
void fossil(vec2 q){if(uLife>.001&&!outWin(q,-.12))return;vec2 m=(q-Y0)/YS;
 float d=min(yBones(m,yPose(0.),.12)*YS,sinoFossilD(q));
 PIECE(d,vec3(.86,.82,.72),K_FOSSIL,q*2.4,vec2(1,0),.004,.8,0.);}

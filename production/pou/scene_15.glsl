// ---- Scene 16 (El pou del temps, CE37): Archaeopteryx in the lagoon of Solnhofen (Late Jurassic, about 150 million years ago). Midday:
// a shallow turquoise lagoon between low islands of white limestone with low shrubs of the conifer Brachyphyllum. A black-feathered
// Archaeopteryx (the colour of its feathers: Carney et al. 2012, 2020) perches on a branch at the left. 3.6–4.5 s it crouches; 4.6 it
// jumps and opens its black wings, one beat, and glides out low over the water (its reflection below it) in a swoop away from us and
// back; 7.4–8.2 it lands on a branch at the right, balancing; 8.4–9.4 it folds its wings; 9.8–10.6 it fluffs up and preens briefly.
// Scale: 1.05 screen units per metre at the depth of the two perches (the bird is about half a metre long). ----
const float AH=.12;   // the horizon (screen y)
const float AYC=.55;  // the camera's height over the water (m)
const float AS0=1.05; // screen units per metre at the depth of the perches
const vec2 WIN_C=vec2(-.40,.05);
// While the window of life opens, the pixels well outside it show only stone: life() skips them (the tail masks them anyway), and
// fossil() skips the pixels well inside it (the window covers them).
bool outWin(vec2 q,float mg){if(uLife>=.999)return false;float R=RFULL*ss(0.,.62,uLife);return length((q-WIN_C)*vec2(1.,1.15))>R+mg;}
const vec2 PL=vec2(-.42,-.060),PR=vec2(.42,-.090);  // where the feet grip the two branches (screen)
vec2 R2(vec2 v,float a){float c=cos(a),s=sin(a);return vec2(c*v.x-s*v.y,s*v.x+c*v.y);}
vec2 bez(vec2 a,vec2 b,vec2 c,float t){return mix(mix(a,b,t),mix(b,c,t),t);}
vec2 FU(vec2 p,vec2 dir,float ka,float kc){vec2 pp=vec2(-dir.y,dir.x);return dir*dot(p,dir)*ka+pp*dot(p,pp)*kc;}
float settle(float t,float t0){float a=t-t0;return a<0.?0.:exp(-a*5.5)*sin(a*19.);}
// One feather: root o, angle a, length L, half width w; u along it (0 root .. 1 tip), v across (-1 .. 1).
float aFeather(vec2 m,vec2 o,float a,float L,float w,out float u,out float v){vec2 dv=vec2(cos(a),sin(a));vec2 l=m-o;float al=dot(l,dv),ac=dot(l,vec2(-dv.y,dv.x));
 u=sat(al/L);float r=w*(.45+.55*ss(.0,.22,u))*(1.-.42*ss(.60,1.,u)*ss(.60,1.,u));v=ac/max(r,1e-4);return length(vec2(al-clamp(al,0.,L),ac))-r;}
// The vane of a black feather: the narrow outer vane a touch lighter, faint barbs, a dull shaft, a lighter free edge (the sheen of its
// rim) and the soft shadow of the feather over it (sh: the distance to that feather's edge, m).
vec3 aVane(vec3 c,float u,float v,float te,float sh,float L){
 c*=mix(1.12,.92,ss(-1.,1.,v));
 float barb=.5+.5*sin(u*L*900.-abs(v)*14.);c*=.94+.10*barb*ss(.0,.2,u);
 c=mix(c,c*1.5+.03,ss(.12,.0,abs(v+.22))*ss(.95,.5,u)*.4);
 c=mix(c,c*1.7+.05,ss(-.006,-.001,te)*.6);
 c*=1.-.35*ss(.010,.0,sh);
 return c;}

// ---- The bird's pose: in its own frame (metres, facing +x, the origin at the hip joint, y up), placed at P (screen) with scale S ----
struct AP{vec2 P;float S,ba;vec2 nb,hd;float ha;vec2 kN,aN,bN,kF,aF,bF;float air;vec2 sh;float eN,eF,sp;vec2 tb,tc,tt;float tf,fluff,preen,wob,crest;};
// the flight: from the left perch out over the lagoon, away from us and back, to the right perch (u: 0 .. 1 from 4.6 to 7.4 s)
const float HIPH=.095;   // the hip over the feet when it perches
vec3 aPath(float u){   // screen position of the hip and the scale
 vec2 pl=PL+vec2(.005,HIPH)*AS0,pr=PR+vec2(.005,HIPH)*AS0;
 float XL=pl.x/AS0,XR=pr.x/AS0,YL=AYC+(pl.y-AH)/AS0,YR=AYC+(pr.y-AH)/AS0;
 float k=1./(1.+1.6*pow(sin(PI*u),1.3));
 float X=mix(XL,XR,ss(.0,1.,u))+.15*sin(PI*u);
 float Y=mix(YL,YR,ss(.0,1.,u))+.06*ss(.0,.07,u)*ss(.30,.07,u)-.34*pow(sin(PI*min(u*1.06,1.)),1.4);
 return vec3(X*AS0*k,AH+(Y-AYC)*AS0*k,AS0*k);}
// how the two branches spring (screen units): the left one under its weight and when it jumps off, the right one when it lands
float dipL(float t){float a=max(t-4.66,0.);return -.004*(1.-ss(4.55,4.66,t))-.004*ss(3.7,4.4,t)*(1.-ss(4.55,4.66,t))+.010*ss(4.6,4.7,t)*exp(-a*3.2)*sin(a*17.);}
float dipR(float t){float a=max(t-7.42,0.);return -.004*ss(7.38,7.6,t)-.012*ss(7.36,7.44,t)*exp(-a*3.2)*cos(a*15.);}
AP aPose(float t){AP p;
 float br=sin(t*2.4);
 float cr=ss(3.6,4.4,t)*(1.-ss(4.56,4.66,t));                 // the crouch before the jump
 float push=ss(4.56,4.68,t)*(1.-ss(4.70,4.80,t));             // the legs straighten
 p.air=ss(4.62,4.72,t)*(1.-ss(7.34,7.44,t));                  // in the air (the legs tucked)
 float land=ss(7.36,7.44,t);                                    // on the right branch
 float u=sat((t-4.62)/(7.40-4.62));
 // where it is
 vec3 fp=aPath(u);
 float hipH=HIPH-.028*cr+.030*push;
 vec2 Pl=PL+vec2(.005,hipH)*AS0+vec2(0.,dipL(t)),Pr=PR+vec2(.005,HIPH)*AS0+vec2(0.,dipR(t));
 // after landing, the body swings forward over the branch and back (it balances)
 float sw=land*exp(-max(t-7.44,0.)*2.6)*sin(max(t-7.44,0.)*9.);
 p.P=t<4.62?Pl:t<7.40?fp.xy:Pr;p.S=t<4.62||t>=7.40?AS0:fp.z;
 if(t>4.62&&t<4.75)p.P=mix(Pl,fp.xy,ss(4.62,4.75,t));
 // the body's pitch: forward in the crouch, along the path in the air, up as it brakes (flare), swinging after landing
 vec3 fq=aPath(min(u+.02,1.));vec2 vel=fq.xy-fp.xy;
 float pa=clamp(atan(vel.y,max(vel.x,1e-3)),-.5,.5)*.7;
 float flare=ss(7.05,7.32,t)*(1.-ss(7.40,7.60,t));
 p.ba=mix(.10+.01*br,-.18,cr)+.08*push;
 p.ba=mix(p.ba,pa+.55*flare,p.air);
 p.ba+=-.30*sw+.04*land*(1.-ss(7.4,8.,t));
 p.fluff=ss(9.8,10.1,t)*(1.-ss(10.65,11.2,t))+.25*settle(t,10.65);
 p.preen=ss(9.95,10.15,t)*(1.-ss(10.45,10.62,t));
 p.wob=settle(t,7.44)*.8+settle(t,9.4)*.5+settle(t,10.62)*.6;
 p.crest=.0;
 // neck and head (the head leads: it moves a little before the body)
 p.nb=R2(vec2(.066,.040),p.ba);
 float sc=t/1.9,si=floor(sc);float sa=mix(h11(si+.3)-.5,h11(si+1.3)-.5,ss(.0,.10,fract(sc)));   // quick bird-like head turns
 vec2 hr=vec2(.032,.050)+vec2(.006*sa,.004*sin(t*1.3));
 hr=mix(hr,vec2(.050,.026),cr);                                   // crouched: the head low and forward, looking across
 hr=mix(hr,vec2(.062,.012),p.air);                                 // in the air: the neck stretched forward
 hr=mix(hr,vec2(.030,.040),flare);
 hr=mix(hr,vec2(.016,-.006),p.preen);                              // preening: the head down to the bend of the wing
 p.hd=p.nb+R2(hr,p.ba*.5);
 p.ha=.05*sa*(1.-p.air)-.12*cr-.08*p.air+.15*flare-1.75*p.preen+.10*sin(t*TAU*3.)*p.preen*ss(10.1,10.2,t);
 // legs (the feet grip the branch while it perches; tucked back under the tail in the air; reaching forward to land)
 p.bN=vec2(-.005,-hipH);p.bF=p.bN+vec2(.010,.004);
 vec2 tuckA=R2(vec2(-.040,-.046),p.ba*.6),reach=vec2(.030,-.108);
 float rch=ss(7.12,7.36,t)*(1.-land);
 p.bN=mix(p.bN,mix(tuckA+vec2(-.044,-.010),reach,rch),p.air);p.bF=mix(p.bF,mix(tuckA+vec2(-.036,-.004),reach+vec2(.01,.004),rch),p.air);
 p.aN=p.bN+mix(vec2(-.014,.040),vec2(.040,.010),p.air*(1.-rch));p.aF=p.bF+mix(vec2(-.014,.040),vec2(.040,.010),p.air*(1.-rch));
 p.kN=knee(vec2(0.),p.aN,.052,.072,1.);p.kF=knee(vec2(.004,.004),p.aF,.052,.072,1.);
 // wings: elevation (+ up, - down) of each and how far they are spread
 float e=1.25,sp=0.;
 float op=ss(4.52,4.72,t);sp=op;
 float eN=1.25,eF=1.35;
 // one deep beat after the jump, then the glide (banked a little towards us: the near wing lower, the far wing higher)
 float b1=ss(4.80,4.96,t),b2=ss(4.96,5.16,t),b3=ss(5.16,5.38,t);
 eN=mix(eN,-1.05,b1);eF=mix(eF,-.85,b1);eN=mix(eN,1.05,b2);eF=mix(eF,1.15,b2);eN=mix(eN,-.70,b3);eF=mix(eF,.80,b3);
 sp*=1.-.30*b2*(1.-b3);
 eN+=.05*sin(t*3.1)*b3;eF+=.05*sin(t*3.1+.5)*b3;
 // it brakes with its wings up and forward, lands, balances with two small beats, holds them half raised, then folds them in two steps
 eN=mix(eN,1.30,flare);eF=mix(eF,1.40,flare);
 float bal=ss(7.40,7.50,t)*(1.-ss(7.85,8.0,t));float bw=.5+.5*cos((t-7.40)*TAU/.22);
 eN=mix(eN,mix(.55,1.25,bw),bal);eF=mix(eF,mix(.65,1.35,bw),bal);
 float f1=ss(8.40,8.80,t),f2=ss(8.95,9.40,t);
 sp=mix(sp,.45,f1);eN=mix(eN,.55,f1);eF=mix(eF,.65,f1);sp=mix(sp,0.,f2);
 // while it preens, the near wing lifts a little from the body
 sp=max(sp,.18*p.preen);eN=mix(eN,.40,p.preen*(1.-sp));
 p.eN=eN;p.eF=eF;p.sp=sp;
 p.sh=R2(vec2(.050,.030),p.ba);
 // the long tail: hanging down and back while it perches; straight back in the air, its frond spread; up when it brakes
 p.tf=min(.15+.70*p.air+.30*flare*(1.-land)+.25*bal,1.);
 float tA=p.ba+PI+mix(.42+.03*sin(t*1.1),.04,p.air)-.25*cr-.40*flare+.10*sw+.05*p.wob;
 p.tb=R2(vec2(-.052,.006),p.ba);vec2 td=vec2(cos(tA),sin(tA)),tn=vec2(-td.y,td.x);
 p.tt=p.tb+td*.205;p.tc=p.tb+td*.10+tn*(.010+.012*(1.-p.air));
 return p;}

// ---- Bones (in the bird's frame): the skull with its teeth set in the jaws, the neck, the furcula and the ribs, the wing (three clawed
// fingers), the legs, and the long bony tail. ----
float aBones(vec2 m,AP p){float d=1e5;
 {float c=min(sdEll(R2(m-vec2(.03,.015),-p.ba),vec2(.09,.06)),length(m-p.hd)-.05);c=min(c,sdCap(m,p.tb,p.tt,.03,.02));
  c=min(c,sdCap(m,vec2(0.),p.bN,.03,.03));if(c>.03)return c-.02;}
 vec2 h=R2(m-p.hd,-p.ha);
 float sk=sdEll(h-vec2(.000,.003),vec2(.022,.017));sk=smin(sk,sdCap(h,vec2(.012,.0),vec2(.048,-.008),.009,.004),.008);
 sk=max(sk,-sdEll(h-vec2(.003,.006),vec2(.008,.008)));sk=max(sk,-sdEll(h-vec2(.025,.001),vec2(.008,.004)));d=min(d,sk);
 d=min(d,sdCap(h,vec2(-.006,-.012),vec2(.046,-.013),.004,.003));
 for(int i=0;i<6;i++){float s0=(float(i)+.1)/6.,s1=(float(i)+.85)/6.;d=min(d,sdCap(m,mix(p.nb,p.hd,s0),mix(p.nb,p.hd,s1),.0045,.004));}
 vec2 b=R2(m,-p.ba);
 float tb2;for(int i=0;i<6;i++){float x=-.035+float(i)*.016;d=min(d,sdTube(b,vec2(x,.032),vec2(x+.016,.0),vec2(x+.006,-.026),.0022,.0018,tb2));}
 d=min(d,sdCap(b,vec2(.060,.032),vec2(.064,-.010),.003,.003));d=min(d,sdEll(b-vec2(-.020,.010),vec2(.026,.012)));
 d=min(d,sdCap(b,vec2(-.008,.0),vec2(.010,-.030),.003,.002));
 // the folded wing: humerus, ulna and radius, the hand with its fingers and claws
 vec2 el=p.sh+R2(vec2(-.050,-.024),p.ba),wr=el+R2(vec2(.046,.018),p.ba),tp=wr+R2(vec2(-.060,-.010),p.ba);
 d=min(d,sdCap(m,p.sh,el,.004,.0035));d=min(d,sdCap(m,el,wr,.003,.003));d=min(d,sdCap(m,wr,tp,.0028,.002));
 d=min(d,sdCap(m,wr,wr+R2(vec2(.016,.006),p.ba),.0025,.0015));
 // legs and feet
 for(int L=0;L<2;L++){vec2 K=L==0?p.kN:p.kF,A=L==0?p.aN:p.aF,B=L==0?p.bN:p.bF;vec2 hp=L==0?vec2(0.):vec2(.004,.004);
  d=min(d,sdCap(m,hp,K,.0045,.0040));d=min(d,sdCap(m,K,A,.0040,.0032));d=min(d,sdCap(m,A,B,.0030,.0028));
  d=min(d,sdCap(m,B,B+vec2(.030,-.006),.0022,.0016));d=min(d,sdCap(m,B,B+vec2(-.014,-.004),.002,.0015));}
 // the tail: 21 vertebrae
 for(int i=0;i<12;i++){float s0=float(i)/12.,s1=s0+.07;d=min(d,sdCap(m,bez(p.tb,p.tc,p.tt,s0),bez(p.tb,p.tc,p.tt,s1),.0045-.0002*float(i),.004-.0002*float(i)));}
 return d;}

// ---- The bird ----
float ADB=-1.,ADF=1e5;   // the bones at this pixel while the flesh grows; the body's coat (for the contours of what lies on it)
// The arm of a wing (elevation e, spread sp): the elbow, the wrist and the tip of the hand. Spread, it rises or falls from the shoulder
// (seen from the side its length shortens when it points at us); folded, it lies along the side in a Z (wrist forward).
void aArm(AP p,float e,float sp,vec2 sh,out vec2 el,out vec2 wr,out vec2 tp){float se=sin(e);
 vec2 h=mix(vec2(-.050,-.024),vec2(-.016,.058*se),sp),f=mix(vec2(.046,.018),vec2(-.010,.054*se),sp),k=mix(vec2(-.060,-.010),vec2(-.012-.006*abs(se),.070*se),sp);
 el=sh+R2(h,p.ba);wr=el+R2(f,p.ba);tp=wr+R2(k,p.ba);}
// A wing in one piece: 13 flight feathers (6 secondaries on the forearm, 7 primaries on the hand), a row of greater coverts over their
// roots, the small coverts along the arm, and the three free fingers with their claws at the leading edge. far: the far wing (darker,
// behind the body). Black, with a soft grey sheen on the edges of the feathers.
void aWing(vec2 m,AP p,float e,float sp,float far,float dB,float G){
 vec2 sh=p.sh+(far>.5?R2(vec2(.006,.006),p.ba):vec2(0.));vec2 el,wr,tp;aArm(p,e,sp,sh,el,wr,tp);
 vec2 lo=min(min(sh,el),min(wr,tp))-.17,hi=max(max(sh,el),max(wr,tp))+.17;if(m.x<lo.x||m.y<lo.y||m.x>hi.x||m.y>hi.y)return;
 float se=sin(e);
 float dU=1e5,tu=0.,tv=0.,tk=0.,te=0.,tL=.1,sh2=1e5;vec2 tdir=vec2(1,0),to=vec2(0.);
 float gU=1e5,gu=0.,gv=0.,ge=0.,gsh=1e5;
 for(int i=12;i>=0;i--){float k=float(i),s=k/12.;
  vec2 o=i<6?mix(el,wr,(k+.5)/6.):mix(wr,tp,(k-5.3)/7.);
  float a=mix(PI-.04+.03*s,PI-se*(.10+.55*s*s),sp)+p.ba+.10*p.wob*s*sp;
  float L=i<6?.082+.002*k:.098+.040*sin(sat((k-5.)/7.)*2.4);
  vec2 dv=vec2(cos(a),sin(a));
  float u,v;float ei=aFeather(m,o,a,L,.017,u,v);
  if(ei<0.){tu=u;tv=v;tk=k;te=ei;tdir=dv;to=o;tL=L;sh2=1e5;}else if(dU<0.)sh2=min(sh2,ei);
  dU=min(dU,ei);
  ei=aFeather(m,o-dv*.003,a+.05*sign(se+.001)*sp,L*.42,.015,u,v);if(ei<0.){gu=u;gv=v;ge=ei;gsh=1e5;}else if(gU<0.)gsh=min(gsh,ei);gU=min(gU,ei);}
 float dC=min(sdCap(m,sh,el,.009,.007),min(sdCap(m,el,wr,.007,.006),sdCap(m,wr,mix(wr,tp,.6),.006,.004)));
 // the three fingers with their claws, free at the leading edge of the hand
 vec2 K=tp-wr;float lk=max(length(K),1e-4);vec2 kd=K/lk,kn=vec2(-kd.y,kd.x)*sign(se+.001);
 vec2 f1=wr+kd*.018+kn*.007,f2=wr+kd*.032+kn*.006,f3=wr+kd*.042+kn*.004;
 float fg=min(sdCap(m,wr,f1,.0035,.0028),min(sdCap(m,wr,f2,.0032,.0026),sdCap(m,wr,f3,.003,.0024)));
 float tt;float cl=min(sdTube(m,f1,f1+kd*.006+kn*.004,f1+kd*.004+kn*.010,.0028,.0006,tt),min(sdTube(m,f2,f2+kd*.007+kn*.004,f2+kd*.005+kn*.011,.0028,.0006,tt),sdTube(m,f3,f3+kd*.007+kn*.003,f3+kd*.005+kn*.010,.0026,.0006,tt)));
 float dW=min(min(dU,gU),min(dC,min(fg,cl)));
 if(G<.6)dW=max(dW,dB-G*.12);
 if(dW>.02)return;
 float dk=far>.5?.62:1.;
 vec3 c=vec3(.085,.085,.095)*(.92+.14*h11(tk*2.3+.5));
 c=aVane(c,tu,tv,te,sh2,tL);
 {vec3 g=vec3(.10,.10,.11);g=aVane(g,gu,gv,ge,gsh,.04);c=mix(c*(1.-.35*ss(.010,.0,gU)),g,cov(gU*p.S));}
 c=mix(c*(1.-.20*ss(.006,.0,dC)),vec3(.10,.10,.11)*(.9+.2*vn(m*900.)),cov(dC*p.S));
 c=mix(c,vec3(.20,.18,.18),cov(fg*p.S));c=mix(c,vec3(.05,.045,.045),cov(cl*p.S));
 float line=far>.5?1.:max(ss(-.006,.010,ADF),step(.5,p.air));
 PIECE(dW*p.S,c*dk,K_FEATHER,FU(m-to,tdir,6.,24.),-tdir,.004,line,0.);}
// A leg: the feathered «trousers» on the thigh and the shank (longer feathers behind), the scaly foot gripping the branch (three toes
// forward, the first toe behind), the claws.
void aLeg(vec2 m,AP p,vec2 hp,vec2 K,vec2 A,vec2 B,float far,float dB,float G){
 vec2 lo=min(min(hp,K),min(A,B))-.06,hi=max(max(hp,K),max(A,B))+.06;if(m.x<lo.x||m.y<lo.y||m.x>hi.x||m.y>hi.y)return;
 float tt;
 vec2 kd=normalize(A-K),kp=vec2(kd.y,-kd.x);
 float dT=sdCap(m,hp+vec2(-.004,-.004),K,.026,.018);dT=smin(dT,sdCap(m,K,mix(K,A,.80),.017,.009),.010);
 dT=min(dT,sdTube(m,K+kp*.006,mix(K,A,.5)+kp*.016,mix(K,A,.85)+kp*.010,.010,.003,tt));   // the fringe of longer feathers behind the shank
 dT-=.002*(vn(m*vec2(300.,180.))-.4)+.006*p.fluff;
 // the foot: the toes wrap the branch while it perches, trail behind in the air
 float g=1.-p.air;
 vec2 t3=B+mix(vec2(-.030,-.004),vec2(.028,-.004),g),t2=B+mix(vec2(-.026,.000),vec2(.022,.002),g),t1=B+mix(vec2(-.012,-.010),vec2(-.014,-.003),g);
 float dF=sdCap(m,A,B,.0042,.0036);dF=min(dF,sdTube(m,B,mix(B,t3,.6)+vec2(.0,.002),t3+vec2(.0,-.006*g),.0034,.0024,tt));dF=min(dF,sdCap(m,B,t2,.0032,.0024));dF=min(dF,sdCap(m,B,t1,.0030,.0022));
 float cl=min(sdTube(m,t3+vec2(.0,-.006*g),t3+vec2(.004,-.009*g-.002),t3+vec2(.0,-.013*g-.003),.0026,.0006,tt),sdCap(m,t1,t1+vec2(-.006,-.004),.0024,.0006));
 float d=min(min(dT,dF),cl);if(G<.6)d=max(d,dB-G*.12);
 if(d>.02)return;
 float dk=far>.5?.62:1.;
 vec3 col=dT<min(dF,cl)?vec3(.095,.09,.10):cl<dF?vec3(.05,.045,.045):vec3(.22,.20,.20)*(.9+.12*ss(.3,.0,abs(fract(dot(m-B,kd)*260.)-.5)));
 float line=far>.5?1.:max(ss(-.006,.010,ADF),step(dF,dT));
 PIECE(d*p.S,col*dk,K_FEATHER,FU(m-K,kd,6.,3.),-kd,.006,line,0.);}
void archaeopteryx(vec2 q,AP p,float t,float G){
 vec2 m=(q-p.P)/p.S;
 if(m.x<-.42||m.x>.30||m.y<-.20||m.y>.26)return;
 bool needB=G<.6;float dB=needB?ADB:-1.;
 if(needB&&G<.5)PIECE(dB*p.S,vec3(.88,.84,.74),K_BONE,m*20.,vec2(1,0),.003,.8,0.);
 // the far wing and the far leg (darker, behind)
 aWing(m,p,p.eF,p.sp,1.,dB,G);
 aLeg(m,p,vec2(.004,.004),p.kF,p.aF,p.bF,1.,dB,G);
 // the body, the neck, the head and the long tail with its frond of feathers: one coat of black feathers; the bare snout with lips
 vec2 b=R2(m,-p.ba);
 float dTo=sdEll(b-vec2(.026,.016),vec2(.062+.008*p.fluff,.041+.008*p.fluff));dTo=smin(dTo,sdEll(b-vec2(.060,.022),vec2(.030,.034)),.02);
 float tn;float dNk=sdTube(m,p.nb,mix(p.nb,p.hd,.5)+R2(vec2(-.006,.004),p.ba),p.hd,.022+.004*p.fluff,.015,tn);
 float tq;float dTl=sdTube(m,p.tb,p.tc,p.tt,.017,.006,tq);
 vec2 h=R2(m-p.hd,-p.ha);float tt;
 float dCr=sdEll(h-vec2(-.001,.003),vec2(.022,.019));
 float dSn=sdTube(h,vec2(.010,.002),vec2(.030,-.002),vec2(.050,-.008),.011,.0045,tt);
 float dJw=sdCap(h,vec2(.004,-.010),vec2(.046,-.011),.007,.003);
 float dHd=smin(smin(dCr,dSn,.010),dJw,.006);
 float d=smin(dTo,dNk,.015);d=smin(d,dTl,.012);d=smin(d,dHd,.008);
 float dF=d-.0015*(vn(m*vec2(260.,200.))-.4)*(1.+3.*p.fluff);
 if(needB)dF=max(dF,dB-G*.12);
 ADF=dF;
 // the frond: pairs of feathers along the last two thirds of the tail, spread wide in the air (shown in the picture's plane)
 float fU=1e5,fu=0.,fv=0.,fe=0.,fsh=1e5,fL=.06;vec2 fdir=vec2(1,0),fo=vec2(0.);
 {vec2 lo=min(p.tb,p.tt)-.10,hi=max(p.tb,p.tt)+.10;if(m.x>lo.x&&m.y>lo.y&&m.x<hi.x&&m.y<hi.y){
  for(int i=0;i<17;i++){float k=float(i);float side=i<8?1.:i<16?-1.:0.;float j=mod(k,8.);float s=i<16?.34+.62*j/7.:1.;
   vec2 c=bez(p.tb,p.tc,p.tt,s);vec2 tg=normalize(bez(p.tb,p.tc,p.tt,min(s+.02,1.))-bez(p.tb,p.tc,p.tt,s-.02));
   float spd=mix(.14,.55,p.tf)*mix(1.,.55,s)+.05*p.wob+.12*p.fluff;
   float a=atan(tg.y,tg.x)+side*spd;float L=i<16?mix(.048,.078,j/7.):.080;
   float uu,vv;float ei=aFeather(m,c+vec2(-tg.y,tg.x)*side*.002,a,L,.014,uu,vv);
   if(ei<0.){fu=uu;fv=vv;fe=ei;fdir=vec2(cos(a),sin(a));fo=c;fL=L;fsh=1e5;}else if(fU<0.)fsh=min(fsh,ei);fU=min(fU,ei);}
  if(needB)fU=max(fU,dB-G*.12);}}
 float dAll=min(dF,fU);
 if(dAll<.02){
  // black plumage: a little lighter (charcoal) on the belly and the throat; the bare grey snout, the lips closed over the teeth
  vec3 alb=mix(vec3(.13,.125,.13),vec3(.085,.082,.09),ss(-.03,.03,b.y));
  float sn=ss(.012,.022,h.x);
  vec3 skin=vec3(.30,.27,.26);
  alb=mix(alb,skin,sn*step(dHd,d+.002));
  float ml=abs(h.y+.0075-.10*max(h.x-.03,0.)*max(h.x-.03,0.)*10.-.0015*(h.x-.02)*0.)-.0006;ml=max(ml,abs(h.x-.030)-.018);
  alb=mix(alb,vec3(.08,.07,.07),ss(PX/p.S,0.,ml)*sn);
  alb=mix(alb,vec3(.05,.045,.045),cov(sdEll(h-vec2(.042,.000),vec2(.0035,.0018))*p.S)*sn);
  float wF=step(fU,dF)*ss(-.003,.003,dF);
  vec2 uu=R2(FU(b,vec2(1.,-.15),6.,3.4),p.ba),dd=-R2(normalize(vec2(1.,-.15)),p.ba);
  if(dNk<dTo&&dNk<dHd){vec2 nd=normalize(p.nb-p.hd);uu=FU(m-p.hd,nd,6.,3.4);dd=nd;}
  if(dHd<min(dNk,dTo)){uu=R2(FU(h,vec2(1.,0.),8.,4.),p.ha);dd=-R2(vec2(1.,0.),p.ha);}
  if(dTl<dTo-.004&&wF<.5){vec2 tg=normalize(p.tt-p.tb);uu=FU(m-p.tb,tg,6.,3.4);dd=tg;}
  if(wF>0.){vec3 fc=vec3(.085,.082,.09)*(1.+.12*ss(.85,1.,fu));fc=aVane(fc,fu,fv,fe,fsh,fL);alb=mix(alb,fc,wF);if(wF>.5){uu=FU(m-fo,fdir,6.,24.);dd=-fdir;}}
  PIECE(dAll*p.S,alb,K_FEATHER,uu,dd,.012,1.,0.);
  // a soft sheen along the top of the plumage, where the midday sun catches the feathers
  {vec2 gq=vec2(dFdx(dAll),dFdy(dAll));float face=sat(dot(gq/max(length(gq),1e-9),normalize(SUNL.xy)));
   glow(vec3(.30,.32,.36)*face*face*ss(-.010,-.001,dAll)*ss(.002,-.001,dAll)*(1.-sn),0.);}
  if(G>.3)eyeA(q,p.P+(p.hd+R2(vec2(.003,.005),p.ha))*p.S,.0078*p.S,vec3(.62,.44,.20),vec3(.12,.11,.12),blinkAt(t,.31),0.);}
 // the near leg and the near wing
 aLeg(m,p,vec2(0.),p.kN,p.aN,p.bN,0.,dB,G);
 aWing(m,p,p.eN,p.sp,0.,dB,G);}
// The bird's silhouette, roughly (for its reflection in the water).
float aSil(vec2 m,AP p){vec2 b=R2(m,-p.ba);float d=sdEll(b-vec2(.026,.016),vec2(.064,.043));
 d=min(d,sdCap(m,p.nb,p.hd,.020,.016));d=min(d,sdCap(m,p.hd,p.hd+R2(vec2(.05,-.008),p.ha),.016,.004));
 d=min(d,sdCap(m,p.tb,p.tt,.016+.030*p.tf,.020+.030*p.tf));
 for(int w=0;w<2;w++){float e=w==0?p.eN:p.eF;vec2 el,wr,tp;aArm(p,e,p.sp,p.sh,el,wr,tp);
  d=min(d,sdCap(m,mix(el,tp,.5)+R2(vec2(-.045,0.),p.ba)*p.sp,mix(el,tp,.5),.03+.025*abs(sin(e))*p.sp,.02));d=min(d,sdCap(m,el,tp,.012,.008));}
 return d;}

// ---- The lagoon ----
// The low islets of white limestone in front, at the depth of the perches (screen): an uneven top of weathered slabs, rounded ends that
// slope into the water; they run on past the edges of the picture. A boulder in the water on the right.
float rocksD(vec2 q){
 float wl=AH-AYC*AS0;
 float xa=-q.x;   // the left islet ends at x = -.56, the right one at .60
 float ta=-.305+.016*(fbm2(vec2(q.x*4.,1.))-.5)+.010*ss(-.95,-.75,q.x)*ss(-.62,-.80,q.x);
 float ya=mix(wl-.03,ta,ss(-.50,-.66,q.x)*ss(-.50,-.58,q.x+.02*sin(q.y*30.)));
 float tb=-.325+.016*(fbm2(vec2(q.x*4.,7.))-.5)+.012*ss(.70,.90,q.x)*ss(1.15,.95,q.x);
 float yb=mix(wl-.03,tb,ss(.56,.72,q.x)*ss(.56,.64,q.x-.02*sin(q.y*30.)));
 float d=q.x<0.?q.y-ya:q.y-yb;d*=.7;
 d=min(d,sdEll(q-vec2(.47,wl+.008),vec2(.050,.026))+.006*(vn(q*80.)-.5));
 return d;}
// the waterline at the depth of the perches
float aWL(float x,float t){return AH-AYC*AS0+.004*sin(x*22.-t*1.6)+.003*sin(x*37.+t*1.1);}
// Brachyphyllum: low shrubs of a conifer with thick cord-like shoots covered in scale leaves, on the islets. Gnarled stems; the perch: a
// bare branch that reaches out over the water (it bends where the bird stands, and springs).
float aBranches(vec2 q,float t){
 float tt;float d=1e5;
 for(int i=0;i<2;i++){float sg=i==0?-1.:1.;vec2 pc=i==0?PL:PR;float dip=i==0?dipL(t):dipR(t);
  vec2 k1=vec2(sg*.76,-.20);
  d=min(d,sdTube(q,vec2(sg*.84,-.31),vec2(sg*.82,-.25),k1,.014,.011,tt));
  // the perch: a crooked bare branch out of the shrub over the water, two short twigs
  float bx=(q.x-k1.x)*(-sg);float L=abs(pc.x-k1.x)+.10;float w=sat(bx/L);
  float yb=k1.y+(pc.y-.0075-k1.y)*ss(.0,.55,w)+dip*w*w*1.3+.005*sin(w*8.+float(i)*2.)+.008*w*(w-.70)*ss(.70,1.,w);
  float dp=max(abs(q.y-yb)-mix(.012,.0045,w)*(1.+.12*sin(bx*90.)),max(-bx,bx-L));
  d=min(d,dp);
  vec2 tw=vec2(k1.x-sg*L*.45,0.);tw.y=k1.y+(pc.y-.0075-k1.y)*ss(.0,.55,.45)+dip*.26;d=min(d,sdCap(q,tw,tw+vec2(-sg*.026,.036),.004,.0018));
  tw=vec2(k1.x-sg*L*.93,0.);tw.y=pc.y-.0075+dip*1.12+.003;d=min(d,sdCap(q,tw,tw+vec2(-sg*.022,-.016),.0035,.0015));}
 return d;}
float aFoliage(vec2 q,float t,out vec2 fl){
 float d=1e5;fl=vec2(0.);
 for(int i=0;i<2;i++){float sg=i==0?-1.:1.;
  // one low spreading mass on the islet, in a few lobes, swaying a little
  vec2 c=vec2(sg*.92,-.315);vec2 sw=vec2(.003*sin(t*1.1+float(i)*2.),.0015*sin(t*1.6+float(i)));
  vec2 l=(q-c-sw*ss(-.30,.0,q.y))/vec2(.24,.21);
  float e=length(l*vec2(1.,1.))-1.;e=max(e,-l.y-.05);
  e=smin(e,length((l-vec2(-sg*.35,.55))/vec2(.55,.50))-1.,.25);e=smin(e,length((l-vec2(sg*.50,.30))/vec2(.50,.45))-1.,.25);
  e*=.14;if(e<d){d=e;fl=l;}
}
 // the edge: many small tufts of cord-like shoots
 d+=.026*(fbm2(q*vec2(20.,24.)+vec2(t*.10,0.))-.5)+.010*(vn(q*vec2(90.,70.))-.5);
 return d;}
void lagoon(vec2 q,float t,AP p){
 SUNL=normalize(vec3(-.30,.82,.48));SUNC=vec3(1.24,1.18,1.06);AMBC=vec3(.52,.60,.70);BACK=.12;
 if(q.y>AH-.01){
  vec3 sky=mix(vec3(.80,.89,.94),vec3(.34,.56,.86),ss(AH,AH+.55,q.y));
  PIECE(-1.,sky,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
  // a few small fair-weather clouds, drifting
  if(q.y>AH+.05){float cl=fbm(vec2(q.x*2.2-t*.008,q.y*9.))*ss(AH+.05,AH+.22,q.y)*ss(.50,.30,q.y);veil(vec3(1.,1.,.98),ss(.60,.78,cl)*.65,1.);}
  // low islands far away: white limestone, dark scrub on top, pale with the distance
  {float ix=q.x*1.3+.4;float isl=ss(.42,.55,fbm2(vec2(ix*2.2,3.)))*(.012+.014*vn(vec2(ix*7.,1.)));
   float dI=q.y-AH-isl;veil(mix(vec3(.84,.86,.82),vec3(.80,.86,.90),.5),cov(dI)*step(.001,isl),1.);
   veil(mix(vec3(.34,.44,.38),vec3(.72,.82,.88),.55),cov(dI)*ss(isl*.45,isl*.75,q.y-AH),1.);}
  // a low island further out on the right
  {float dI=sdEll(q-vec2(.30,AH),vec2(.34,.030))+.006*(fbm2(vec2(q.x*20.,4.))-.5);dI=max(dI,AH-q.y);
   veil(mix(vec3(.90,.88,.82),vec3(.78,.84,.88),.30),cov(dI),1.);veil(mix(vec3(.26,.38,.30),vec3(.70,.80,.86),.35),cov(dI)*ss(AH+.012,AH+.020,q.y+.006*vn(vec2(q.x*40.,2.))),1.);}}
 if(q.y<AH){
  // the water: turquoise over the white floor of the lagoon, deeper blue-green further away, the sky on it towards the horizon
  float k=(AH-q.y)/(AYC*AS0);vec2 g=vec2(q.x/max(k,.02)/AS0,1./max(k,.02));
  float w1=sin(g.x*6.+g.y*9.-t*1.3)+.6*sin(g.x*-9.+g.y*13.-t*1.7)+.4*sin(g.x*15.+g.y*4.+t*1.1);
  float lw=ss(.9,.2,fwidth(g.y*9.))*ss(.025,.07,k);
  vec3 deep=mix(vec3(.16,.50,.60),vec3(.22,.62,.66),ss(.0,.9,k));
  vec3 wa=mix(vec3(.30,.76,.74),deep,ss(1.4,.5,k));
  float fres=ss(.25,.0,k);wa=mix(wa,vec3(.76,.86,.92),fres*.75);
  wa*=1.+.06*w1*lw*(1.-fres*.6);
  // the bright floor shows through in the shallows near the islets
  wa=mix(wa,vec3(.46,.86,.80),ss(.30,.0,rocksD(vec2(q.x,q.y+.03)))*.45);
  PIECE(-1.,wa,K_WATER,vec2(g.x*.3,g.y*.6),vec2(1,0),.1,0.,1.);
  // soft slow glints of the sun on the ripples
  {vec2 gc=g*vec2(3.,5.)+vec2(t*.05,0.);vec2 id=floor(gc);vec2 f=fract(gc)-.5;float h=h21(id);
   float tw=.5+.5*sin(t*1.6+h*TAU);float gl=ss(.10,.0,length(f*vec2(1.,2.5)))*step(.80,h)*tw*ss(.0,.5,k)*lw;
   veil(vec3(1.,1.,.94),gl*.35,1.);}
  // a low islet in the middle distance (the bird glides in front of it)
  if(q.y<AH+.05&&q.y>AH-.20){float km=.34;float wm=AH-AYC*AS0*km;float xm=(q.x-.12)/.36;
  float tp=wm+.022*sat(1.-xm*xm)*(.8+.4*vn(vec2(q.x*30.,5.)))+.004;float dm=max(q.y-tp,wm-.002-q.y);
  if(abs(xm)<1.1){veil(mix(vec3(.90,.90,.86),vec3(.66,.74,.78),ss(tp-.004,wm,q.y)*.6),cov(dm),1.);
   float ds=q.y-tp-.014*sat(1.-xm*xm*1.4)*(.6+.6*fbm2(vec2(q.x*40.,3.)));veil(vec3(.20,.32,.26)*1.2,cov(ds)*step(tp-.003,q.y)*step(abs(xm),.85),1.);}
 }
  // the islets and their shrubs reflected
  {vec2 qr=vec2(q.x+.004*sin(q.y*90.+t*2.),2.*aWL(q.x,t)-q.y);if(q.y<aWL(q.x,t)){float dr=rocksD(qr);vec2 fl;float df=aFoliage(qr,t,fl);
   veil(vec3(.56,.78,.76),cov(dr)*.45*ss(.0,.03,aWL(q.x,t)-q.y+.01),1.);veil(vec3(.10,.24,.22),cov(df)*.40,1.);}}
  // the bird: its reflection under it, its shadow on the floor of the lagoon (the sun is high)
  {float kb=p.S/AS0;float yw=AH-AYC*AS0*kb;
   if(q.y<yw+.01){vec2 qr=vec2(q.x+.006*sin(q.y*120.+t*3.)*kb,2.*yw-q.y);float ds=aSil((qr-p.P)/p.S,p)*p.S;
    veil(vec3(.04,.12,.13),cov(ds-PX)*.62*ss(.0,.02,yw-q.y+.004)*p.air,1.);}
   vec2 sc=vec2(p.P.x-.02*kb,yw-.012*kb);shadow(ss(1.,.3,length((q-sc)/(vec2(.16,.018)*kb)))*.14*step(.5,p.air),vec3(.50,.70,.72),1.);}}}
void islets(vec2 q,float t){
 // the limestone: white slabs, thin beds, weathered grey on top, wet and darker at the waterline; lapping water and foam
 if(q.y<-.26&&abs(q.x)>.40){float wl=aWL(q.x,t);float rd=rocksD(q);float d=max(rd,wl-q.y);
  if(d<.02){vec3 c=vec3(.93,.91,.85);c*=1.-.07*ss(.004,.0,abs(fract(q.y*30.+.2*vn(vec2(q.x*5.,1.)))-.5)-.46);
   c=mix(c,c*vec3(.80,.82,.84),ss(.45,.75,fbm2(q*vec2(10.,16.))));
   // the top of the slabs white in the high sun, the faces below it in a soft blue-grey shade, crevices
   float top=ss(-.030,-.006,rd);c=mix(c*vec3(.72,.77,.84),c,top);c*=1.-.22*ss(-.006,.006,abs(fract(q.x*7.+.3*vn(vec2(q.y*20.,2.)))-.5)-.47)*(1.-top);
   c=mix(c,vec3(.56,.64,.60),ss(.030,.0,q.y-wl)*.65);
   PIECE(d,c,K_ROCK,q*vec2(5.,9.),vec2(1,0),.04,.25,1.);}
  if(rd<.03)veil(vec3(.94,.99,.97),ss(.006,.0,abs(q.y-wl-.003))*ss(.03,.0,rd)*.8,1.);}
 // the shrubs: their foliage (dull blue-green cords, lighter tips), the woody stems and the perches
 float db=aBranches(q,t);
 if(db<.02)PIECE(db,mix(vec3(.36,.31,.27),vec3(.55,.50,.44),ss(-.012,.010,q.y-.0+.0)*.0+.5),K_BARK,q*vec2(30.,8.),vec2(1,0),.008,.6,1.);
 vec2 fl;float df=aFoliage(q,t,fl);
 if(df<.02){float cl=fbm2(q*vec2(16.,20.)+3.);vec3 c=mix(vec3(.13,.22,.18),vec3(.34,.46,.32),sat(ss(-.6,1.,fl.y-.4*fl.x)*.7+.6*ss(.35,.75,cl)-.25));
  c*=.80+.40*ss(.25,.75,vn(R2(q,.5)*vec2(150.,40.)));c=mix(c,c*.70,ss(.0,-.035,df)*.3);
  PIECE(df,c,K_PLANT,R2(q,.5)*vec2(40.,12.),normalize(vec2(.4,1.)),.03,.35,1.);}}

void life(vec2 q,float t){if(outWin(q,.12))return;
 AP p=aPose(t);
 lagoon(q,t,p);
 islets(q,t);
 // a soft contact under the feet on the branch
 if(p.air<.5){vec2 ft=p.P+p.bN*p.S;contact(q,ft+vec2(.0,-.008),.04,.30);}
 ADB=GROW<.6?aBones((q-p.P)/p.S,p):-1.;
 archaeopteryx(q,p,t,GROW);}
void fossil(vec2 q){if(uLife>.001&&!outWin(q,-.12))return;AP p=aPose(0.);vec2 m=(q-p.P)/p.S;if(m.x<-.42||m.x>.30||m.y<-.20||m.y>.26)return;
 float d=aBones(m,p);
 // the famous imprints of the feathers round the bones: the wing and the tail frond, faint
 vec2 el,wr,tp;aArm(p,0.,0.,p.sh,el,wr,tp);
 float fw=sdCap(m,wr,el+R2(vec2(-.12,-.012),p.ba),.018,.010);float ft=sdCap(m,mix(p.tb,p.tt,.3),p.tt+R2(vec2(-.02,0.),atan(p.tt.y-p.tb.y,p.tt.x-p.tb.x)),.012,.030);
 float di=min(fw,ft);di+=.002*sin(dot(m,vec2(600.,200.)));
 PIECE(min(d,di)*p.S,d<di?vec3(.86,.80,.68):vec3(.72,.68,.60),K_FOSSIL,m*20.,vec2(1,0),.004,d<di?.8:.2,0.);}

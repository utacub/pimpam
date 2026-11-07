// ---- Scene 4 (El pou del temps, CE37): Megatherium americanum and a Glyptodon on the Pampa, Late Pleistocene, an autumn afternoon:
// golden light, the low sun on the left behind an algarrobo (Prosopis) with ripe pods, golden dust in the air. The giant ground sloth
// stands on all fours by the tree; 4.2–5.4 it rises on its hind legs, its thick tail pressed to the ground as a tripod; 5.4–6.4 the
// KEY: it hooks a branch with its claws and pulls it down, the leaves fall, it strips them with its lips and chews; 9.0–11.0 the echo:
// it lets the branch go (it springs back) and lowers itself to all fours, on the sides of its hands. Meanwhile a Glyptodon crosses in
// front from left to right (3.5–12), stops at 10 and blinks. Scales: the sloth .14 screen units per metre, the Glyptodon .19 (nearer). ----
const float MT_S=.14,GL_S=.19,GL_Y=-.39,PM_HZ=.02;
const vec2 MT_P=vec2(-.06,-.28);   // the sloth: the ground under its hips (it faces -x)
const vec2 PM_SUN=vec2(-.80,.13);
const vec2 PM_TR=vec2(-.64,-.255); // the foot of the algarrobo's trunk
const vec2 BR_A=vec2(-.47,.30);   // where the branch it pulls leaves the tree's limb

// ---- Light: the low sun on the left, a little behind the animals; the warm light of the grass from below ----
void pmLight(){SUNL=normalize(vec3(-.86,.38,-.16));SUNC=vec3(1.62,1.26,.82);AMBC=vec3(.50,.53,.66);BACK=.6;}
// The land keeps a light more from the front, so the plain is lit as the eye expects under a low sun.
void pmLightG(){SUNL=normalize(vec3(-.78,.42,.40));SUNC=vec3(1.30,1.04,.70);AMBC=vec3(.56,.56,.62);BACK=.6;}
vec3 pmLit(vec3 n){return AMBC*(.55+.45*n.z)+SUNC*sat(dot(n,SUNL))*.85+vec3(.42,.32,.16)*sat(-n.y)*.32;}
vec3 pmRel(vec3 n){return pmLit(n)/pmLit(vec3(0.,0.,1.));}
// The relief of a body as overlapping ellipsoid masses: each adds its normal, weighted towards the nearest surface.
void pmBump(inout vec4 acc,vec2 p,vec2 c,float ang,vec2 r,float rz,float z0,float K){
 vec2 u=rot(ang)*(p-c)/r;float s=1.-dot(u,u);float sq=sqrt(max(s,1e-4));
 vec3 n=normalize(vec3(u.x/r.x*rz,u.y/r.y*rz,sq));n.xy=rot(-ang)*n.xy;
 acc+=ss(0.,.25,s)*exp(K*(rz*sq+z0))*vec4(n,1.);}
vec3 pmN(vec4 acc){return acc.w>0.?normalize(mix(acc.xyz/acc.w,vec3(0.,0.,1.),.12)):vec3(0.,0.,1.);}
// The contour of a figure: dark, thinner and broken where the sun catches the edge.
float pmLine(vec2 g,vec2 p,float k){vec2 n=g/max(length(g),1e-9);return k*(1.-.85*sat(dot(n,normalize(SUNL.xy))*1.5))*(.55+.55*vn(p));}
// A rim of low sun just inside the sunward edge of a piece.
void pmRim(float d,vec2 g,float w,float k){if(d>PX||d<-w)return;vec2 n=g/max(length(g),1e-9);
 float f=ss(-w,-PX*2.,d)*(1.-ss(-PX*1.2,PX,d))*pow(sat(dot(n,normalize(SUNL.xy))),1.5);glow(SUNC*vec3(1.,.84,.58)*f*k,0.);}
// Coarse hair painted in locks (as in scene 3): pointed locks along dir in overlapping layers, staggered, each tilted and of its own
// length; lighter or darker each; the hair underneath in shade. sc: locks per metre across and along.
float pmLocks(vec2 m,vec2 dir,vec2 sc,int nl){vec2 pp=vec2(-dir.y,dir.x);vec2 r=vec2(dot(m,pp),dot(m,dir))*sc;r.x+=.9*(vn(vec2(r.y*.35,r.x*.15))-.5);float v=.80;
 for(int k=0;k<nl;k++){float fk=float(k);vec2 g=r+fk*vec2(.37,.29);float cx=floor(g.x);g.y+=h11(cx*3.7+fk*1.3)*1.7;vec2 ci=vec2(cx,floor(g.y));
  float hh=h21(ci*1.7+fk*5.);vec2 f=fract(g)-.5;float tp=sat((f.y+.5)*(.75+.45*h11(ci.x*2.9+ci.y*1.1+fk)));
  f.x+=.10*sin(tp*3.+ci.x*1.7)-(h11(ci.x*5.1+ci.y*2.3+fk)-.5)*.30-(hh-.5)*.40*tp;
  float w=.50*(1.-pow(tp,1.5))*(.70+.45*h11(ci.y*4.1+ci.x+fk));float ax=abs(f.x)/max(w,.01);float on=ss(1.,.45,ax)*ss(.0,.40,tp)*step(tp,.999);
  float sh=(.88+.24*hh)*(.92+.14*tp)*(1.-.12*ss(.2,1.,ax))*(.94+.06*sin(ax*9.+ci.x*2.));
  v=mix(v,sh,on);}
 return v;}
vec2 pmBez(vec2 a,vec2 b,vec2 c,float s){return mix(mix(a,b,s),mix(b,c,s),s);}
// The distance to a quadratic curve a→b→c with radii r0..r1 (sampled as capsules); along: 0..1 where the nearest point lies.
float pmCurve(vec2 p,vec2 a,vec2 b,vec2 c,float r0,float r1,out float along){float d=1e5;along=0.;vec2 o=a;
 for(int i=1;i<=6;i++){float u=float(i)/6.;vec2 e=pmBez(a,b,c,u);float u0=u-1./6.;float k=segU(p,o,e);float dd=length(p-mix(o,e,k))-mix(r0,r1,mix(u0,u,k));
  if(dd<d){d=dd;along=mix(u0,u,k);}o=e;}
 return d;}
float pmSoft(float t,float a){float x=(t-a)/.15;return x>8.?t-a:.15*log(1.+exp(x));}

// ---- The branch it pulls: from BR_A through C to its tip T (screen units); it bends down as it is pulled, springs back when let go ----
void pmBranch(float t,out vec2 C,out vec2 T){float pull=ss(5.45,6.25,t)*(1.-ss(9.0,9.18,t));
 float rel=t-9.12;float sw=rel>0.?exp(-rel*2.0)*sin(rel*8.5)*.022:0.;
 float wind=.004*sin(t*1.1)+.002*sin(t*2.7+1.);
 C=vec2(-.34,.40)+vec2(.02,-.09)*pull+vec2(0.,sw*.6+wind);T=vec2(-.19,.40)+vec2(-.04,-.12)*pull+vec2(.003*sw,sw+wind*1.6);}

// ---- The sloth's motion ----
struct Mt{float up,ang,ant,br,jaw,hd,chew,ear,tail,reachN,reachF,sniff;vec2 H;};
Mt mtRig(float t){Mt a;
 a.br=sin(t*1.1);
 a.ant=ss(3.8,4.2,t)*(1.-ss(4.3,4.9,t));                 // the weight goes back onto the hind legs before it rises
 a.up=ss(4.2,5.4,t)*(1.-ss(9.0,11.0,t));
 a.ang=1.18*a.up;
 a.H=vec2(.10,1.75)+vec2(.12,-.10)*a.up+vec2(.05,-.08)*a.ant;
 a.reachN=ss(4.75,5.45,t)*(1.-ss(9.0,9.7,t));a.reachF=ss(4.95,5.6,t)*(1.-ss(9.05,9.8,t));
 a.chew=ss(6.15,6.4,t)*(1.-ss(9.0,9.3,t))+ss(11.0,11.3,t)*(1.-ss(12.6,13.2,t));
 a.jaw=a.chew*(.5+.5*sin(t*6.3))*.55+.45*ss(5.85,6.05,t)*(1.-ss(6.12,6.35,t));
 a.sniff=ss(3.8,4.1,t)*(1.-ss(4.4,4.7,t));
 a.hd=.06*sin(t*.6)*(1.-a.up)-.22*a.sniff+.18*a.up+.06*sin(t*1.7)*a.chew*a.up;
 float ef=fract(t/3.7+.2);a.ear=ss(.0,.04,ef)*ss(.15,.08,ef);
 a.tail=.03*sin(t*.8);
 return a;}
// From the world (sloth metres) into the body's rest frame, and back.
vec2 mtR(vec2 m,Mt a){return vec2(.10,1.75)+rot(-a.ang)*(m-a.H);}
vec2 mtW(vec2 r,Mt a){return a.H+rot(a.ang)*(r-vec2(.10,1.75));}
// The head (its own frame: origin at the back of the skull, the snout towards -x): a small skull, a long snout with a mobile,
// grasping upper lip, a very deep lower jaw.
float mtHead(vec2 h,float jaw,out float dEar,float ear){
 float sk=sdEll(h-vec2(-.20,.02),vec2(.30,.21));
 float sn=sdCap(h,vec2(-.30,.0),vec2(-.62,-.06),.17,.11);
 float lp=sdEll(rot(.25)*(h-vec2(-.70,-.06)),vec2(.10,.07));
 float jw=sdEll(rot(-.45*jaw)*(h-vec2(-.10,-.10))-vec2(-.26,-.10),vec2(.30,.15));
 vec2 e=rot(-.25-ear*.35)*(h-vec2(-.02,.17));dEar=sdEll(e-vec2(0.,.03),vec2(.05,.055));
 float d=smin(sk,sn,.08);d=smin(d,lp,.04);d=smin(d,jw,.07);return smin(d,dEar,.02);}
// The body in its rest frame: the massive hips and belly, the barrel, the shoulders, the neck.
float mtBody(vec2 r,Mt a){
 float pv=sdEll(r-vec2(.12,1.55),vec2(.92,.80+.01*a.br));
 float ba=sdEll(r-vec2(-.70,1.50),vec2(1.10,.70+.012*a.br));
 float sh=sdEll(r-vec2(-1.50,1.62),vec2(.50,.56));
 float d=smin(smin(pv,ba,.30),sh,.25);
 return smin(d,sdCap(r,vec2(-1.80,1.82),vec2(-2.30,1.70),.36,.25),.15);}
// The head's place and angle (in the rest frame): its back at hb, turned by hd (+: snout down).
const vec2 MT_HB=vec2(-2.30,1.70);
// The tail: thick, from the rump down to the ground behind; pressed flat to the ground as a prop while it stands.
vec2 mtTB(Mt a){return mtW(vec2(.90,1.20),a);}vec2 mtTC(Mt a){return mix(vec2(1.62,.62),vec2(1.30,.24),a.up)+vec2(0.,a.tail);}vec2 mtTE(Mt a){return mix(vec2(2.02,.14),vec2(2.05,.10),a.up);}
float mtTail(vec2 m,Mt a,out float al){return pmCurve(m,mtTB(a),mtTC(a),mtTE(a),.42,.12,al);}
// The forelimb from the shoulder s to the wrist w (the elbow behind and below), the hand from the wrist towards hd: a heavy hand
// and three great curved claws (the middle one largest) that hook towards the palm side ps.
float mtArm(vec2 m,vec2 s,vec2 w,float r0){vec2 e=knee(s,w,.74,.74,1.);return smin(sdCap(m,s,e,r0,r0*.66),sdCap(m,e,w,r0*.66,r0*.46),.06);}
float mtHand(vec2 m,vec2 w,vec2 hd,vec2 ps,out float dCl,out float clA){
 float d=smin(sdCap(m,w,w+hd*.26,.15,.14),sdEll(m-w-hd*.16-ps*.04,vec2(.16,.16)),.05);dCl=1e5;clA=0.;
 for(int i=0;i<3;i++){float fi=float(i);float L=i==1?1.:.80;vec2 b=w+hd*.30+ps*(.06-.07*fi)+vec2(-ps.y,ps.x)*.0;
  vec2 c1=b+hd*.20*L-ps*.02;vec2 c2=c1+hd*.05*L+ps*.17*L;float al;float dc=pmCurve(m,b,c1,c2,.055*L,.010,al);if(dc<dCl){dCl=dc;clA=al;}}
 return d;}
// The bones: the skull with its deep jaw, the spine, the ribs, the huge pelvis, the legs, the arms, the claws, the tail.
float mtBones(vec2 m,Mt a,vec2 sN,vec2 wN,vec2 sF,vec2 wF){vec2 r=mtR(m,a);float d=1e5,tt;
 vec2 h=rot(a.hd)*(r-MT_HB);
 d=min(d,smin(sdEll(h-vec2(-.25,.02),vec2(.30,.14)),sdEll(h-vec2(-.22,-.16),vec2(.22,.10)),.04));d=max(d,-sdEll(h-vec2(-.30,.03),vec2(.05,.04)));
 d=min(d,sdTube(r,vec2(-2.25,1.72),vec2(-1.80,1.95),vec2(-1.00,2.05),.06,.07,tt));d=min(d,sdTube(r,vec2(-1.0,1.95),vec2(.0,2.20),vec2(.95,1.65),.07,.06,tt));
 for(int i=0;i<8;i++){float fi=float(i);float x=-1.55+fi*.24;d=min(d,sdTube(r,vec2(x,2.05+.02*fi),vec2(x+.25,1.65),vec2(x+.12,1.05+.03*fi),.04,.03,tt));}
 d=min(d,sdEll(rot(-.4)*(r-vec2(.25,1.75)),vec2(.42,.26)));
 d=min(d,sdEll(rot(.5)*(r-vec2(-1.45,1.80)),vec2(.14,.34)));
 vec2 hj=mtW(vec2(.05,1.55),a);vec2 k=knee(hj,vec2(.22,.30),.85,.75,-1.);d=min(d,sdCap(m,hj,k,.12,.10));d=min(d,sdCap(m,k,vec2(.22,.30),.09,.08));d=min(d,sdEll(m-vec2(.25,.12),vec2(.32,.08)));
 vec2 e=knee(sN,wN,.74,.74,1.);d=min(d,sdCap(m,sN,e,.09,.07));d=min(d,sdCap(m,e,wN,.07,.06));
 vec2 tb=mtTB(a),tc=mtTC(a),te=mtTE(a);
 for(int i=0;i<7;i++){float u=float(i)/7.;vec2 p=pmBez(tb,tc,te,u);d=min(d,length(m-p)-.12*(1.-u*.7));}
 return d;}
// Where the hands are: on the ground on their sides (all fours), hanging (standing), or on the branch (reaching).
void mtHands(float t,Mt a,out vec2 sN,out vec2 wN,out vec2 hdN,out vec2 sF,out vec2 wF,out vec2 hdF,out vec2 bpN){
 vec2 C,T;pmBranch(t,C,T);vec2 bq=pmBez(BR_A,C,T,.60),bqF=pmBez(BR_A,C,T,.50);
 bpN=(bq-MT_P)/MT_S;vec2 bpF=(bqF-MT_P)/MT_S;
 sN=mtW(vec2(-1.45,1.58),a);sF=mtW(vec2(-1.30,1.64),a);
 vec2 gN=vec2(-1.62,.38),gF=vec2(-1.34,.40);
 vec2 fN=sN+vec2(-.40,-1.10),fF=sF+vec2(-.34,-1.12);
 vec2 rN=bpN-normalize(bpN-sN)*.42,rF=bpF-normalize(bpF-sF)*.42;
 wN=mix(mix(gN,fN,ss(.0,.35,a.up)),rN,a.reachN);wF=mix(mix(gF,fF,ss(.0,.35,a.up)),rF,a.reachF);
 hdN=normalize(mix(mix(vec2(-.15,-1.),vec2(-.35,-1.),a.up),bpN-wN,a.reachN));hdF=normalize(mix(mix(vec2(-.15,-1.),vec2(-.35,-1.),a.up),bpF-wF,a.reachF));}
void sloth(vec2 q,float t,Mt a,float grow){
 vec2 m=(q-MT_P)/MT_S;
 if(m.x<-3.4||m.x>3.0||m.y<-.15||m.y>5.8)return;
 vec2 sN,wN,hdN,sF,wF,hdF,bpN;mtHands(t,a,sN,wN,hdN,sF,wF,hdF,bpN);
 bool needB=grow<.6;float dB=needB?mtBones(m,a,sN,wN,sF,wF)*MT_S:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.74),K_BONE,m*.6,vec2(1,0),.01,.8,0.);
 vec2 r=mtR(m,a);
 // the palm side of each hand: back (+x) on the ground, towards the body when it holds the branch
 vec2 psN=normalize(mix(vec2(1.,.1),vec2(hdN.y,-hdN.x),a.reachN)),psF=normalize(mix(vec2(1.,.1),vec2(hdF.y,-hdF.x),a.reachF));
 // ---- the far limbs, in shade ----
 {vec2 o=vec2(.16,.06);vec2 hjF=mtW(vec2(.20,1.60),a);vec2 kF=knee(hjF,vec2(.48,.32),.85,.75,-1.);
  float d=smin(sdCap(m,hjF,kF,.38,.25),sdCap(m,kF,vec2(.48,.32),.25,.19),.08);d=smin(d,sdEll(rot(-.10)*(m-vec2(.50,.13)),vec2(.40,.13)),.06);
  float dc,ca;float da=mtArm(m,sF,wF,.30);da=smin(da,mtHand(m,wF,hdF,psF,dc,ca),.05);d=min(d,da);
  float dd=d*MT_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  vec3 c=vec3(.30,.20,.13)*vec3(.86,.92,1.06)*pmLocks(m,vec2(0,-1),vec2(10.,4.),2);
  piece(dd,g,c,K_FUR,m*.25,vec2(0,-1),.03,pmLine(g,m*9.,.8),0.);
  if(G>.3){float e=dc*MT_S;if(needB)e=max(e,dB-G);vec3 cc=mix(vec3(.20,.17,.15),vec3(.40,.36,.30),ca);PIECE(e,cc,K_HORN,m*4.,hdF,.004,.6,0.);}}
 // ---- the body, the neck, the head, the tail and the near hind leg: one piece of coarse long hair ----
 vec2 h=rot(a.hd)*(r-MT_HB);float dEar;float dHd=mtHead(h,a.jaw,dEar,a.ear);
 float bd=mtBody(r,a);
 float tal;float dT=mtTail(m,a,tal);
 vec2 hj=mtW(vec2(.02,1.58),a);vec2 kn=knee(hj,vec2(.20,.30),.85,.75,-1.);
 float dL=smin(sdCap(m,hj,kn,.46,.28),sdCap(m,kn,vec2(.20,.30),.28,.20),.10);dL=smin(dL,sdEll(rot(-.10)*(m-vec2(.24,.13)),vec2(.42,.14)),.08);
 float d=smin(smin(bd,dHd,.10),dT,.12);d=smin(d,dL,.12);
 // ragged edges of coarse hair, longer along the back, the belly and the backs of the legs
 float dW=d-.020*(vn(vec2(r.x*14.,r.y*5.))-.40)-.030*(vn(vec2(r.x*7.,r.y*2.))-.5)*ss(1.5,2.0,r.y);
 if(needB)dW=max(dW,dB/MT_S-G/MT_S);
 float head=ss(.06,-.06,dHd-min(bd,dL));float leg=ss(.02,-.08,dL-bd)*ss(1.1,.7,m.y);float tl=ss(.02,-.08,dT-min(bd,dL));
 // the hair: down from the spine, back along the hips and the tail, down the legs; short and along the face
 float L=pmLocks(r,normalize(vec2(.20,-1.)),vec2(11.,2.1),3);
 L=mix(L,pmLocks(m+vec2(3.1,.7),vec2(.08,-1.),vec2(13.,3.4),2),leg);
 L=mix(L,pmLocks(m+vec2(1.3,2.1),normalize(vec2(1.,-.55)),vec2(12.,2.6),2),tl);
 L=mix(L,mix(1.,pmLocks(h,vec2(1.,-.10),vec2(12.,18.),2),.7),head);
 vec2 dir=normalize(mix(rot(a.ang)*normalize(vec2(.20,-1.)),vec2(.08,-1.),leg));dir=normalize(mix(dir,normalize(vec2(1.,-.55)),tl));dir=normalize(mix(dir,rot(a.ang)*rot(-a.hd)*vec2(1.,-.1),head));
 // a warm brown coat, paler and greyer at the tips along the back, darker on the legs and below; the face paler, the snout darker
 float lk=vn(vec2(r.x*4.5+.8*r.y,r.y*1.3)),lk2=vn(vec2(r.x*11.,r.y*2.)+4.);
 vec3 c=mix(vec3(.30,.19,.12),vec3(.56,.40,.25),ss(.9,2.2,r.y));c*=.72+.42*lk+.18*(lk2-.5);
 c=mix(c,vec3(.66,.54,.40),ss(1.9,2.5,r.y)*(.4+.6*lk2)*.6);
 c=mix(c,vec3(.24,.16,.10),leg*.75);c=mix(c,vec3(.40,.28,.18),tl*.5);
 vec3 hc=mix(vec3(.52,.40,.29),vec3(.34,.26,.20),ss(-.35,-.62,h.x));hc=mix(hc,vec3(.40,.30,.22),ss(-.05,-.18,h.y)*.6);
 c=mix(c,hc,head);
 // the relief: the hips, the barrel, the shoulders, the thigh, the tail, the head
 vec4 A=vec4(0.);const float K=6.;
 {vec4 B=vec4(0.);pmBump(B,r,vec2(.12,1.55),0.,vec2(.92,.80),.55,.04,K);pmBump(B,r,vec2(-.70,1.50),0.,vec2(1.10,.70),.55,0.,K);
  pmBump(B,r,vec2(-1.50,1.62),0.,vec2(.50,.56),.45,.02,K);pmBump(B,r,vec2(-2.05,1.76),-.2,vec2(.40,.30),.25,.02,K);
  pmBump(B,h,vec2(-.20,.02),0.,vec2(.30,.21),.18,.10,K);pmBump(B,h,vec2(-.45,-.03),0.,vec2(.28,.15),.12,.12,K);
  B.xy=rot(a.ang)*B.xy;A+=B;}
 pmBump(A,m,(hj+kn)*.5,0.,vec2(.45,.55),.35,.10,K);pmBump(A,m,pmBez(mtTB(a),mtTC(a),mtTE(a),.3),0.,vec2(.42,.40),.30,.0,K);
 vec3 n=pmN(A);c*=mix(vec3(1.),pmRel(n),.55);
 c*=L;
 float dd=dW*MT_S;vec2 g=vec2(dFdx(dd),dFdy(dd));
 piece(dd,g,c,K_FUR,m*.25,dir,.06*MT_S,pmLine(g,m*9.,.85),0.);
 pmRim(dd,g,.012,.85);
 // ---- the near arm and hand, in front ----
 float dcN,caN;
 {float da=mtArm(m,sN,wN,.27);float dh=mtHand(m,wN,hdN,psN,dcN,caN);da=smin(da,dh,.05);
  float de=da*MT_S-.002*(vn(m*14.)-.4);if(needB)de=max(de,dB-G);vec2 g2=vec2(dFdx(de),dFdy(de));
  vec2 ad=normalize(wN-sN);vec3 ca=mix(vec3(.46,.32,.20),vec3(.28,.18,.12),ss(.3,1.,dot(m-sN,ad)/max(length(wN-sN),.1)));
  vec4 B=vec4(0.);pmBump(B,m,mix(sN,wN,.3),-atan(ad.x,-ad.y),vec2(.30,.55),.25,.0,K);ca*=mix(vec3(1.),pmRel(pmN(B)),.45);
  ca*=pmLocks(m+vec2(5.,1.),ad,vec2(13.,3.2),2);
  float inB=ss(.04,-.10,min(bd,dL));                 // where the arm lies over the body: no contour, the colours of the coat
  shadow(ss(.10,.0,da)*ss(-.0,.02,da)*inB*.30,vec3(.45,.36,.34),0.);
  piece(de,g2,ca,K_FUR,m*.25,ad,.03*MT_S,pmLine(g2,m*9.,.85)*(1.-inB),0.);pmRim(de,g2,.008,.7*(1.-inB));}
 if(G<.3)return;
 // the claws: dark horn, paler towards the tips
 {float e=dcN*MT_S;if(needB)e=max(e,dB-G);vec3 cc=mix(vec3(.24,.20,.17),vec3(.62,.56,.46),ss(.2,1.,caN));
  vec2 g3=vec2(dFdx(e),dFdy(e));piece(e,g3,cc,K_HORN,m*4.,hdN,.003,pmLine(g3,m*20.,.7),0.);pmRim(e,g3,.004,.6);}
 // the ear, the eye, the nostril, the line of the mouth; a sprig of leaves in the mouth while it chews them
 {shadow(ss(.012,-.02,dEar)*ss(-.03,.0,dEar+.03)*.40,vec3(.45,.38,.36),0.);
  vec2 ec=vec2(-.34,.07);vec2 eq=MT_P+MT_S*mtW(MT_HB+rot(-a.hd)*ec,a);
  shadow(ss(.06,.0,length(h-ec))*.30,vec3(.50,.42,.40),0.);
  eyeA(q,eq,.032*MT_S,vec3(.30,.19,.11),vec3(.42,.31,.22),blinkAt(t,.15),0.);
  float nn=sdEll(rot(.4)*(h-vec2(-.72,-.02)),vec2(.030+.010*a.sniff,.016));shadow(ss(.008,-.004,nn)*.85,vec3(.10,.08,.07),0.);
  float ml=sdSeg(h,vec2(-.72,-.12-.05*a.jaw),vec2(-.40,-.13-.06*a.jaw))-.010;shadow(ss(.012,-.004,ml)*.55,vec3(.24,.17,.13),0.);
  float lf=ss(6.0,6.25,t)*(1.-ss(8.6,9.0,t));
  if(lf>.01){float gw=1e5;for(int i=0;i<4;i++){float fi=float(i);vec2 b=vec2(-.70,-.10);vec2 tp=b+vec2(-.10-.04*fi,.04-.06*fi+.02*sin(t*6.+fi));gw=min(gw,sdEll(rot(.6+fi*.3)*(h-mix(b,tp,.6)),vec2(.07,.025)));}
   veil(vec3(.62,.62,.30),ss(.008,-.004,gw)*lf,0.);}}
}
// The sloth's shadow on the ground: long, cast to the right and a little towards us (its outline seen from the sun).
float mtSil(vec2 m,Mt a){vec2 r=mtR(m,a);float d=sdEll(r-vec2(-.40,1.58),vec2(1.6,.80));d=min(d,sdCap(r,vec2(-1.8,1.80),vec2(-2.9,1.50),.30,.14));
 d=min(d,sdCap(m,mtTB(a),mtTE(a),.38,.10));d=min(d,sdCap(m,vec2(.10,1.4),vec2(.22,.0),.35,.2));return d;}
void mtCast(vec2 q,float t,Mt a){float dy=(MT_P.y-q.y)/MT_S;if(dy<-.05||dy>1.1)return;float H=max(dy,0.)/.22;
 vec2 ms=vec2((q.x-MT_P.x)/MT_S-2.2*H,H);
 vec2 sN,wN,hdN,sF,wF,hdF,bpN;mtHands(t,a,sN,wN,hdN,sF,wF,hdF,bpN);
 float d=min(mtSil(ms,a),mtArm(ms,sN,wN,.30));
 float s=ss(.20,-.20,d)*ss(-.05,.03,dy)*(1.-.45*ss(1.,4.,H));shadow(s*.50,vec3(.62,.52,.58),1.);}

// ---- The Glyptodon ----
struct Gl{float x,d,mv,hd,lk,br;};
Gl glRig(float t){Gl a;
 // how far it has walked (screen units), easing in and out of its stop. It comes in from the left and stops in front of the tree
 // before the sloth rises, so that it never hides the sloth while it is up; it grazes there; at 10 it lifts its head, looks out and
 // blinks; once the sloth is down on all fours it walks on across the front.
 a.d=.17*(pmSoft(t,3.6)-pmSoft(t,5.65))+.176*pmSoft(t,10.8);
 a.x=-.95+a.d;
 a.mv=ss(3.4,3.8,t)*(1.-ss(5.45,5.75,t))+ss(10.6,10.95,t);
 float gz=ss(6.2,6.6,t)*(1.-ss(9.3,9.7,t));
 a.lk=ss(9.85,10.15,t)*(1.-ss(10.55,10.85,t));
 a.hd=.10*sin(a.d/GL_S*PI*2.)*a.mv+gz*(.20+.05*sin(t*4.))-.12*a.lk;
 a.br=sin(t*1.3);
 return a;}
// The shell seen from the side (its frame: metres, the ground at 0, facing +x): a high dome, its lower margin scalloped by the edge
// osteoderms; it rises and falls a little with the steps.
// The nearest cell: x its distance, y the second's, zw the offset from here to its point.
vec4 glVoro(vec2 p,out vec2 cid){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;vec2 oa=vec2(0.);cid=i;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=g+.15+.7*h22(i+g)-f;float d=dot(o,o);if(d<a){b=a;a=d;cid=i+g;oa=o;}else if(d<b)b=d;}
 return vec4(sqrt(a),sqrt(b),oa);}
float glShell(vec2 p){float e=sdEll(p-vec2(-.05,.88),vec2(1.10,.74));float yb=.27+.035*abs(sin(p.x*13.))+.06*ss(.6,1.05,abs(p.x));return max(e,yb-p.y);}
float glHead(vec2 p,float hd,out float dCap){vec2 h=rot(-hd)*(p-vec2(.92,.50));
 float sk=sdEll(h-vec2(.22,.03),vec2(.25,.21));float sn=sdCap(h,vec2(.26,.0),vec2(.44,-.06),.15,.11);float jw=sdEll(h-vec2(.25,-.13),vec2(.22,.14));
 dCap=max(sdEll(h-vec2(.22,.10),vec2(.24,.14)),sk-.005);
 return smin(smin(sk,sn,.06),jw,.06);}
float glTail(vec2 p,out float al){return pmCurve(p,vec2(-1.00,.50),vec2(-1.45,.44),vec2(-1.90,.32),.24,.10,al);}
vec4 glLeg(float ph,float bx,float stride){vec2 s=stepCycle(ph,.66);return vec4(bx+stride*s.y,s.x*.10,0.,0.);}
float glBones(vec2 p,float hd){float d=1e5;float dc;
 d=min(d,abs(glShell(p))-.04);d=min(d,glHead(p,hd,dc)+.03);
 for(int i=0;i<2;i++){float x=i==0?.62:-.55;d=min(d,sdCap(p,vec2(x,.62),vec2(x+.02,.08),.07,.06));}
 float al;d=min(d,abs(glTail(p,al))-.03);return d;}
void glypto(vec2 q,float t,Gl a,float grow){
 vec2 p=(q-vec2(a.x,GL_Y))/GL_S;
 if(p.x<-2.2||p.x>1.7||p.y<-.15||p.y>1.8)return;
 float ph=a.d/(GL_S*1.05);float bob=.012*sin(ph*TAU*2.)*a.mv;p.y-=bob;
 bool needB=grow<.6;float dB=needB?glBones(p,a.hd)*GL_S:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.74),K_BONE,p*.6,vec2(1,0),.006,.8,0.);
 // the far legs, darker
 vec4 lFF=glLeg(ph+.75,.70,.42),lFH=glLeg(ph+.25,-.45,.42),lNF=glLeg(ph+.50,.58,.42),lNH=glLeg(ph,-.58,.42);
 lFF.y*=a.mv;lFH.y*=a.mv;lNF.y*=a.mv;lNH.y*=a.mv;
 {float d=min(sdCap(p,vec2(.70,.50),vec2(lFF.x,lFF.y+.12),.20,.17),sdCap(p,vec2(-.45,.50),vec2(lFH.x,lFH.y+.12),.22,.18));
  d=min(d,min(sdEll(p-vec2(lFF.x+.03,lFF.y+.06),vec2(.19,.08)),sdEll(p-vec2(lFH.x+.03,lFH.y+.06),vec2(.20,.08))));
  float dd=d*GL_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,vec3(.34,.28,.23)*vec3(.88,.94,1.06),K_SKIN,p*.8,vec2(0,1),.02*GL_S,pmLine(g,p*12.,.8),0.);}
 // the tail: rings of thick conical scutes
 {float al;float dt=glTail(p,al);float ring=fract(al*7.);float knob=ss(.25,.0,abs(ring-.5))*.035;dt-=knob;
  float dd=dt*GL_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  vec3 c=vec3(.62,.50,.35)*(.80+.30*ss(.1,.5,ring)*ss(.9,.5,ring));
  vec4 B=vec4(0.);pmBump(B,p,pmBez(vec2(-1.00,.50),vec2(-1.45,.44),vec2(-1.90,.32),al),0.,vec2(.30,.22),.30,0.,8.);c*=mix(vec3(1.),pmRel(pmN(B)),.6);
  piece(dd,g,c,K_SHELL,p*3.,vec2(1,0),.02*GL_S,pmLine(g,p*12.,.85),0.);pmRim(dd,g,.005,.6);}
 // the near legs: short, stout, broad round feet
 {float d=min(sdCap(p,vec2(.58,.50),vec2(lNF.x,lNF.y+.12),.22,.18),sdCap(p,vec2(-.58,.50),vec2(lNH.x,lNH.y+.12),.24,.19));
  d=min(d,min(sdEll(p-vec2(lNF.x+.03,lNF.y+.06),vec2(.20,.08)),sdEll(p-vec2(lNH.x+.03,lNH.y+.06),vec2(.21,.08))));
  float dd=d*GL_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  vec3 c=vec3(.46,.38,.30)*(.85+.25*vn(p*vec2(8.,20.)));
  piece(dd,g,c,K_SKIN,p*.8,vec2(0,1),.03*GL_S,pmLine(g,p*12.,.85),0.);}
 // the head: a deep snout, the bony cap on top
 float dCap;float dh=glHead(p,a.hd,dCap);
 {float dd=dh*GL_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));vec2 hh=rot(-a.hd)*(p-vec2(.92,.50));
  vec3 c=vec3(.52,.42,.32);c=mix(c,vec3(.38,.30,.25),ss(.30,.46,hh.x));
  vec4 B=vec4(0.);pmBump(B,hh,vec2(.22,.03),0.,vec2(.25,.21),.20,0.,8.);pmBump(B,hh,vec2(.38,-.04),0.,vec2(.14,.12),.10,.06,8.);B.xy=rot(a.hd)*B.xy;c*=mix(vec3(1.),pmRel(pmN(B)),.6);
  piece(dd,g,c,K_SKIN,p*1.5,vec2(1,0),.02*GL_S,pmLine(g,p*12.,.85),0.);pmRim(dd,g,.005,.6);
  if(G>.3){float e=dCap*GL_S;PIECE(e,vec3(.50,.42,.31),K_PLATE,hh*14.,vec2(1,0),.003,.25,0.);
   vec2 ec=vec2(.17,.06);vec2 eq=vec2(a.x,GL_Y+bob*GL_S)+GL_S*(vec2(.92,.50)+rot(a.hd)*ec);
   float bl=max(blinkAt(t,.30),ss(10.25,10.32,t)*ss(10.48,10.40,t));
   eyeA(q,eq,.030*GL_S,vec3(.26,.17,.10),vec3(.40,.33,.27),bl,0.);
   float nn=sdEll(hh-vec2(.52,-.03),vec2(.025,.018));shadow(ss(.008,-.004,nn)*.8,vec3(.12,.10,.09),0.);
   float ml=sdSeg(hh,vec2(.50,-.15),vec2(.30,-.19))-.008;shadow(ss(.01,-.003,ml)*.5,vec3(.25,.20,.17),0.);}}
 // the shell: a dome of rosettes of bone (osteoderms), drawn as curving over the dome; the margin of larger scutes
 {float ds=glShell(p);float dd=ds*GL_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  vec2 sp=(p-vec2(-.05,.88))/vec2(1.10,.74);vec2 u=vec2(asin(clamp(sp.x,-.97,.97))*1.15,asin(clamp(sp.y,-.97,.97)))*vec2(8.,5.6);
  vec3 c=vec3(.72,.53,.32)*(.88+.22*vn(sp*3.+2.));c=mix(c,vec3(.44,.35,.25),ss(.36,.30,p.y+.04*sin(p.x*13.))*.6);
  vec4 B=vec4(0.);pmBump(B,p,vec2(-.05,.88),0.,vec2(1.10,.74),.70,0.,6.);vec3 n=pmN(B);c*=mix(vec3(1.),pmRel(n),.85);c*=1.-.25*ss(-.2,.9,sp.x-sp.y*.6);
  vec2 id;vec4 v=glVoro(u,id);float e=v.y-v.x;float hh=h21(id);vec2 od=-v.zw/max(v.x,1e-4);float sl=dot(od,vec2(-.91,.40));
  float rad=ss(.40,.47,abs(fract(atan(od.y,od.x)/TAU*7.+hh)-.5))*ss(.28,.34,v.x)*ss(.0,.10,e);
  c*=(.88+.20*hh)*(1.-.30*ss(.09,.0,e))*(1.-.16*ss(.045,.0,abs(v.x-.26)))*(1.-.14*rad)*(1.+.16*sl*ss(.10,.24,v.x)*ss(.27,.24,v.x))*(1.+.10*sl*ss(.14,.0,e));
  piece(dd,g,c,K_SHELL,u*.2,vec2(1,0),.05*GL_S,pmLine(g,p*12.,.9),0.);pmRim(dd,g,.008,.75);}
}
float glSil(vec2 p){float d=sdEll(p-vec2(-.05,.95),vec2(1.08,.70));d=min(d,sdEll(p-vec2(1.15,.62),vec2(.32,.22)));d=min(d,sdCap(p,vec2(-1.,.55),vec2(-1.9,.36),.22,.10));
 d=min(d,sdCap(p,vec2(.6,.6),vec2(.6,0.),.17,.17));d=min(d,sdCap(p,vec2(-.55,.6),vec2(-.55,0.),.19,.19));return d;}
void glCast(vec2 q,Gl a){float dy=(GL_Y-q.y)/GL_S;if(dy<-.05||dy>.70)return;float H=max(dy,0.)/.30;
 vec2 ps=vec2((q.x-a.x)/GL_S-2.2*H,H);float s=ss(.16,-.16,glSil(ps))*ss(-.05,.03,dy)*(1.-.4*ss(.6,1.8,H));shadow(s*.50,vec3(.62,.52,.58),1.);}

// ---- Leaves falling from the branch, and golden dust in the air ----
void pmLeaves(vec2 q,float t){
 for(int j=0;j<18;j++){float fj=float(j);float t0=(j<12?5.55+.9*h11(fj*1.7):9.05+.7*h11(fj*2.3));float ag=t-t0;if(ag<0.||ag>3.2)continue;
  vec2 C,T;pmBranch(t0,C,T);vec2 o=pmBez(BR_A,C,T,.55+.45*h11(fj*3.1));
  vec2 c=o+vec2(.010*ag+.018*sin(ag*2.6+fj),-.075*ag+.006*sin(ag*5.+fj*2.));if(c.y<-.30)continue;
  vec2 l=rot(ag*2.+fj)*(q-c);float e=sdEll(l,vec2(.0065,.0026));
  float fl=.5+.5*sin(ag*7.+fj);vec3 col=mix(vec3(.52,.56,.22),vec3(.86,.74,.30),h11(fj*5.));col*=.7+.5*fl;
  veil(col,ss(PX,-PX,e)*(1.-ss(2.6,3.2,ag)),0.);}}
void pmDust(vec2 q,float t){vec2 w=q*11.+vec2(t*.05,-t*.02+.04*sin(t*.3+q.x*3.));vec2 ci=floor(w),f=fract(w)-.5-(h22(ci)-.5)*.6;
 float on=step(.72,h21(ci+5.))*ss(.36,.05,q.y);float tw=.5+.5*sin(t*.9+h21(ci)*30.);float a=on*ss(.06,.012,length(f))*(.30+.55*tw);
 float sun=.25+1.2*exp(-length((q-PM_SUN)*vec2(.6,1.))*1.6);
 glow(vec3(1.,.74,.36)*a*.34*sun,1.);
 // and a faint warm haze, thicker towards the sun and low over the plain
 veil(vec3(1.,.86,.58),.14*exp(-length((q-PM_SUN)*vec2(.5,1.2))*2.)*ss(.5,-.1,q.y),1.);}

// ---- The Pampa ----
float pmRowY(int i){return PM_HZ-.008*(pow(1.22,float(i))-1.)/.22;}
float pmK(float y){return 1.96*(PM_HZ-y);}
vec3 PM_G=vec3(.8);
vec3 pmGround(vec2 q){float pz=max(.02,PM_HZ+.09-q.y);
 vec3 g=mix(vec3(.86,.76,.52),vec3(.82,.66,.40),ss(PM_HZ,-.15,q.y));g=mix(g,vec3(.74,.58,.34),ss(-.18,-.70,q.y));
 g*=.92+.16*fbm2(vec2(q.x*2.5/pz,q.y*7.+1./pz));
 g=mix(g,g*vec3(.86,.96,.78),ss(.55,.75,fbm2(vec2(q.x*1.6/pz,q.y*4.)+7.))*.55);
 float zb=15./pz,b=floor(zb),fz=fract(zb),fx=55.*(b+.5)/15.;float sw=vn(vec2(q.x*fx+b*7.13,b*.37));
 float zb2=zb+.5,b2=floor(zb2),fz2=fract(zb2),fx2=55.*(b2+.5)/15.;float sw2=vn(vec2(q.x*fx2*1.6+b2*3.7,b2*.71));
 float w1=sin(PI*fz),w2=sin(PI*fz2);
 g*=1.+(.32*(sw-.5)*w1+.08*sw*(1.-fz)*w1+.22*(sw2-.5)*w2+.05*sw2*(1.-fz2)*w2)*ss(300.,120.,fx)*mix(1.,.40,ss(-.42,-.75,q.y));
 return g;}
vec2 pmGU(vec2 q){float pz=max(.02,PM_HZ+.09-q.y);return vec2(q.x*.28/pz,q.y*2.5);}
// Bunchgrass of the Pampa in rows back to front, golden in autumn, some clumps still green at their feet; seed heads that the low
// sun lights from behind; slow waves of wind.
vec4 pmTuft(vec2 q,int i,out float ci){float y0=pmRowY(i),k=pmK(y0),sd=float(i)*7.31;float wc=k*.60;
 ci=floor(q.x/wc+sd);float cx=(ci+.5+(h11(ci*1.7+sd)-.5)*.16-sd)*wc;float yb=y0-h11(ci+3.1+sd)*.4*.008*pow(1.22,float(i));
 float dens=.55+.45*vn(vec2(cx*4.+sd,sd));float on=step(h11(ci+sd*1.3),dens);
 float hr=(.18+.32*h11(ci*2.3+sd))*(.75+.5*vn(vec2(cx*3.,sd+5.)));
 // trodden short where the sloth stands and the Glyptodon walks
 float clr=ss(.55,.40,abs(cx+.02))*ss(-.24,-.27,y0)*ss(-.33,-.30,y0);hr=mix(hr,.06,clr);
 hr*=1.+.5*ss(-.32,-.55,y0)*ss(.40,.75,abs(cx));
 float H=hr*k;return vec4(cx,yb,H*.36,H*on);}
bool pmRowHit(vec2 q,int i){float ci;vec4 tf=pmTuft(q,i,ci);return tf.w>0.&&abs(q.x-tf.x)<tf.z+tf.w*.10+PX*3.&&q.y>=tf.y-PX*3.&&q.y<=tf.y+tf.w*1.12;}
void pmRow(vec2 q,float t,int i){float ci;vec4 tf=pmTuft(q,i,ci);float sd=float(i)*7.31+ci*.37;
 float cx=tf.x,yb=tf.y,tw=tf.z,Ht=max(tf.w,1e-4);float yy=(q.y-yb)/Ht;
 float wave=.5+.5*sin(t*.55-q.x*1.8-yb*5.+float(i));float lean=.16*(wave-.5)+.04*sin(t*1.3+cx*9.);
 float x=q.x-cx-lean*Ht*yy*yy;float bw=tw*.28,wy=bw+(tw-bw)*sqrt(sat(yy)),a=x/wy;
 float x1=a*4.5+sd,c1=floor(x1),f1=fract(x1)-.5-(h11(c1+1.)-.5)*.3,ac=(c1+.5-sd)/4.5;
 float hb1=(.50+.50*h11(c1*1.3))*(1.-.50*ac*ac);bool s1=h11(c1+7.)>.68&&hb1>.60;if(s1)hb1*=1.06;
 float wb1=.30*(1.-sat(yy/hb1));float sh=s1?ss(hb1*.86,hb1*.90,yy)*(1.-ss(hb1*.97,hb1,yy)):0.;wb1=max(wb1,.09*sh);
 float d1=max((abs(f1)-wb1)*wy/4.5,(yy-hb1)*Ht);
 float x2=a*3.5+sd*1.7+.37,c2=floor(x2),f2=fract(x2)-.5-(h11(c2+4.)-.5)*.3,a2=(c2+.5-sd*1.7-.37)/3.5;
 float hb2=(.40+.45*h11(c2*1.9+3.))*(1.-.45*a2*a2);float d2=max((abs(f2)-.30*(1.-sat(yy/hb2)))*wy/3.5,(yy-hb2)*Ht);
 float d=max(min(d1,d2),max((abs(a)-1.)*wy,yb-PX-q.y));
 bool fr=d1<d2+PX*.5;float yt=sat(yy/(fr?hb1:hb2));
 vec3 c=PM_G*mix(.66,1.16,ss(.0,.85,yt))*(.90+.20*h11(ci+9.))*(1.+.08*wave*yt)*(fr?1.:.84);
 c=mix(c,c*vec3(.84,1.,.74),step(.70,h11(ci*3.3))*(1.-yt)*.8);     // green still at the feet of some clumps
 c=mix(c,vec3(1.,.92,.72),fr?sh*.6:0.);
 shadow(ss(1.,.25,length((q-vec2(cx+tw*.5,yb-Ht*.01))/vec2(tw*1.2,Ht*.06+PX*2.)))*.30,vec3(.62,.52,.56),1.);
 piece(d,vec2(0.,1.),c,K_GRASS,pmGU(vec2(x,q.y)),vec2(0,1),Ht*.03+1e-4,.10,1.);
 glow(SUNC*vec3(1.,.78,.45)*(ss(.55,1.,yt)*.08+(fr?sh:0.)*.25)*BACK*cov(d),1.);}
void pmRows(vec2 q,float t,int i0,int i1){int idx[6];int n=0;
 for(int i=i0;i<i1;i++)if(n<6&&pmRowHit(q,i)){idx[n]=i;n++;}
 for(int j=0;j<n;j++)pmRow(q,t,idx[j]);}
// Pampas grass (Cortaderia): a fountain of long leaves and tall feathery plumes, silvery cream, glowing against the light.
void pmPlumes(vec2 q,float t,vec2 b,float s){vec2 l=(q-b)/s;if(abs(l.x)>1.4||l.y<-.05||l.y>2.6)return;
 float sw=.06*sin(t*.7+b.x*5.)+.025*sin(t*1.9+b.x*11.);
 // the leaves
 float a=l.x/(.15+1.05*sat(l.y/.8));a-=.25*sign(a)*sat(l.y-.4);float lv=vn(vec2(a*7.+b.x*30.,l.y*.8));float top=.70+.35*vn(vec2(a*3.,2.));
 float dl=max(abs(a)-1.,l.y-top*(1.-.45*a*a));float den=ss(.30,.65,lv)*ss(.0,-.05,dl);
 veil(mix(vec3(.46,.42,.24),vec3(.80,.70,.42),sat(l.y/top))*mix(.85,1.1,lv),den*.95,1.);
 // the plumes on their stems
 for(int i=0;i<5;i++){float fi=float(i);float x0=(fi-2.)*.16+.05*sin(fi*3.);float hgt=1.7+.6*h11(fi+b.x*9.);float lean=(fi-2.)*.12+sw*(1.+.3*fi);
  vec2 tp=vec2(x0+lean*hgt,hgt);float st=sdSeg(l,vec2(x0*.4,.2),tp)-.012;
  vec2 pc=mix(vec2(x0*.4,.2),tp,.86);vec2 pd=normalize(tp-vec2(x0*.4,.2));vec2 pl=vec2(dot(l-pc,vec2(pd.y,-pd.x)),dot(l-pc,pd));
  float pe=length(pl/vec2(.10*(1.-.35*ss(-.1,.36,pl.y))+.015*sin(pl.y*20.+fi),.40))-1.+.30*(fbm2(l*14.+fi)-.5);float fil=vn(vec2(pl.x*90.,pl.y*9.)+fi*7.);
  veil(vec3(.62,.54,.34),ss(.01,-.005,st)*.9,1.);
  float pa=ss(.15,-.35,pe)*(.62+.38*fil);veil(mix(vec3(.74,.64,.52),vec3(.98,.90,.76),ss(-.1,.25,-pl.x*SUNL.x)+.3*fil),pa*.85,1.);
  glow(SUNC*vec3(1.,.82,.55)*pa*ss(-.5,.0,pe)*.18*BACK,1.);}}
// The algarrobo (Prosopis): a short, gnarled, leaning trunk forking into spreading limbs; a broad, airy, flat-topped crown of fine
// feathery leaves (yellowing in autumn, the light coming through them), with bunches of long curved yellow pods.
// Feathery Prosopis foliage: short drooping sprays of tiny leaflets (cs: their size), crisp, in three overlapping layers. Returns the
// cover, how lit it is (towards the sun at its top) and a per-spray tone.
vec3 pmFronds(vec2 q,float cs){float cv=0.,lt=.5,tn=.5;
 for(int k=0;k<3;k++){float fk=float(k);vec2 g=q/cs+fk*vec2(.37,.61);vec2 ci=floor(g);vec2 hh=h22(ci+fk*13.);vec2 f=fract(g)-.5-(hh-.5)*.45;
  float an=-.55+.9*(hh.x-.5)+(hh.y>.5?.0:2.6);vec2 l=rot(an)*f;
  float w=.13*(.55+.45*abs(sin(l.x*26.+hh.y*6.)))*(1.-ss(.25,.48,abs(l.x)));
  float e=(abs(l.y+.10*l.x*l.x)-w)*cs;e=max(e,(abs(l.x)-.48)*cs);float c=ss(PX*1.6,-PX*1.6,e);
  cv=max(cv,c);lt=mix(lt,ss(-.10,.10,l.y)*.6+.4*hh.x,c);tn=mix(tn,h21(ci*3.1+fk),c);}
 return vec3(cv,lt,tn);}
// The colour of a mass of foliage: d its smooth outline distance; fr the fine sprays (pmFronds). Out: the colour, the warm rim, the glow
// of the sun behind.
// Clumps of leaves filling a mass (dc: its distance, nb: its normal): domes of about cs in two staggered layers, the nearest-to-us one
// in front; a few missing. Out: the normal there (the clump's curve on the mass's). Returns the distance to that clump's edge (<0 in).
float pmClumps(vec2 q,float dc,vec3 nb,float cs,out vec3 n){float best=-9.;float br=cs;vec2 od=normalize(nb.xy+1e-5);vec3 ns=vec3(0.,0.,1e-3);
 for(int L=0;L<2;L++){vec2 off=float(L)*vec2(.5,.37);vec2 g=q/cs+off;vec2 b0=floor(g-.5);
  for(int k=0;k<4;k++){vec2 ci=b0+vec2(float(k%2),float(k/2));vec2 hh=h22(ci+float(L)*17.);
   vec2 c=(ci+.5+(hh-.5)*.5-off)*cs;float r=cs*(.60+.24*hh.x);
   if(dc+dot(od,c-q)>-.022||hh.y<.05)continue;
   vec2 l=(q-c)/r;float s1=1.-dot(l,l);if(s1>best){best=s1;br=r;}
   ns+=exp(6.*clamp(s1,-2.,1.))*(.85+.3*hh.y)*vec3(l,sqrt(max(s1,0.))+.05);}}
 n=normalize(mix(nb,normalize(ns),.40));
 return (sqrt(max(1.-best,0.))-1.)*br;}
// The colour of foliage with normal n (fr: the fine sprays): soft light of the sky from the front, in shade beneath, a warm rim where
// the sun behind comes through the edges, patches yellowing. Out also: the rim, the glow of the sun close behind.
void pmFoliage(vec2 q,vec3 n,vec3 fr,out vec3 c,out float key,out float sg){
 float fill=.5+.5*dot(n,normalize(vec3(-.55,.55,.62)));float sh=max(fill*(1.-.35*sat(-n.y)),.30*(1.-n.z));
 c=mix(vec3(.11,.15,.06),vec3(.42,.44,.19),sh);
 c=mix(c,c*vec3(1.35,1.06,.58),ss(.52,.72,vn(q*vec2(9.,12.)+3.))*.65);
 c*=.84+.28*mix(.45,fr.y,fr.x);
 key=pow(sat(dot(normalize(n.xy+1e-5),vec2(-.88,.47))),1.5)*(1.-n.z);
 c=mix(c,vec3(.96,.80,.42),sat(key*1.1));
 sg=exp(-length((q-PM_SUN)*vec2(1.,1.3))*6.);c=mix(c,vec3(.86,.80,.40),sg*.40);}
float pmLimbs(vec2 q,out float al){float d=1e5,a;al=0.;
 float t1=pmCurve(q,PM_TR,PM_TR+vec2(-.05,.15),vec2(-.60,.04),.036,.026,a);d=t1;al=a*.3;
 float l1=pmCurve(q,vec2(-.60,.04),vec2(-.70,.14),vec2(-.86,.24),.022,.010,a);if(l1<d){d=l1;al=.3+a*.7;}d=smin(d,l1,.01);
 float l2=pmCurve(q,vec2(-.60,.04),vec2(-.54,.20),BR_A,.024,.013,a);d=smin(d,l2,.01);
 float l3=pmCurve(q,vec2(-.61,.10),vec2(-.62,.26),vec2(-.70,.40),.016,.008,a);d=smin(d,l3,.008);
 float l4=pmCurve(q,vec2(-.54,.20),vec2(-.50,.33),vec2(-.56,.47),.012,.006,a);d=min(d,l4);
 float l5=pmCurve(q,vec2(-.80,.20),vec2(-.92,.24),vec2(-1.05,.27),.010,.005,a);d=min(d,l5);
 return d;}
float pmCrownD(vec2 q,float t,out float dens,out vec3 nrm){float sw=.004*sin(t*.9+q.x*4.);vec2 p=q+vec2(sw,0.);float d=1e5;dens=0.;vec3 na=vec3(0.);
 for(int i=0;i<10;i++){vec2 c=i==0?vec2(-.98,.24):i==1?vec2(-.80,.29):i==2?vec2(-.64,.42):i==3?vec2(-.44,.47):i==4?vec2(-.74,.17):i==5?vec2(-1.14,.20):i==6?vec2(-.86,.41):i==7?vec2(-.60,.30):i==8?vec2(-.94,.13):vec2(-1.06,.34);
  vec2 r=i==2||i==3?vec2(.18,.08):i==7?vec2(.12,.06):vec2(.16,.07);float e=sdEll(p-c,r);d=smin(d,e,.05);vec2 u=(p-c)/r;float s1=1.-dot(u,u);float w=exp(5.*clamp(s1,-3.,1.));na+=w*vec3(u,sqrt(max(s1,0.))+.05);}
 float n=fbm(p*vec2(22.,28.)+3.);dens=n;nrm=normalize(na);
 return d-.03*(n-.5);}
void pmTree(vec2 q,float t){if(q.x>-.05||q.y<-.30)return;
 // the trunk and limbs: dark, fissured, twisted bark, lit along their sunward side
 float al;float dl=pmLimbs(q,al)-.004*(vn(q*vec2(90.,40.))-.5);
 if(dl<.02){vec3 bc=vec3(.22,.17,.13)*(.75+.45*vn(q*vec2(160.,30.)))*(.85+.3*vn(q*vec2(20.,6.)));vec2 g=vec2(dFdx(dl),dFdy(dl));
  piece(dl,g,bc,K_BARK,q*vec2(20.,8.),vec2(0,1),.008,.4,1.);pmRim(dl,g,.004,.6);}
 // the crown over them: soft masses of fine feathery leaves, each lit through from behind along its sunward edge (a warm rim), in
 // soft shade beneath, lit softly from the sky in front; patches yellowing; a few soft gaps where the sky shows through
 float dens;vec3 nrm;float dc=pmCrownD(q,t,dens,nrm);
 if(dc<.03){vec3 fr=pmFronds(q+vec2(.003*sin(t*.9+q.y*30.),0.),.014);
  vec3 n;float ed=pmClumps(q,dc+.07*ss(.27,.17,dens),nrm,.050,n)-.006*(fr.x-.4);
  vec3 c;float key,sg;pmFoliage(q,n,fr,c,key,sg);
  float cov=ss(PX*1.8,-PX*1.8,ed);
  veil(c,cov*.97,1.);glow(SUNC*vec3(1.,.82,.48)*cov*(key*.12+sg*.22)*BACK,1.);}
 // pods hanging in bunches
 for(int i=0;i<5;i++){float fi=float(i);vec2 b=i==0?vec2(-.78,.22):i==1?vec2(-.97,.19):i==2?vec2(-.60,.30):i==3?vec2(-.72,.34):vec2(-.88,.26);
  for(int k=0;k<3;k++){float fk=float(k);float sw=.003*sin(t*1.2+fi+fk);vec2 a0=b+vec2(fk*.006,0.);vec2 a1=a0+vec2(-.003+.004*fk+sw,-.020);vec2 a2=a1+vec2(.007-.003*fk+sw,-.008);float al2;
   float pd=pmCurve(q,a0,a1,a2,.0024,.0016,al2);veil(mix(vec3(.70,.58,.26),vec3(.92,.80,.40),vn(q*90.)),ss(PX,-PX,pd),1.);}}}
// The branch it pulls (drawn with the animals: it is part of the action): its leaves, its pods.
void pmHeldBranch(vec2 q,float t){vec2 C,T;pmBranch(t,C,T);if(q.x<-.50||q.x>-.02||q.y<.18||q.y>.56)return;
 float al;float d=pmCurve(q,BR_A,C,T,.011,.004,al);
 // the leaves: feathery sprays along its outer two thirds, hanging a little below it
 vec2 bd=normalize(T-BR_A);float lf=1e5;vec3 na=vec3(0.);
 for(int k=0;k<4;k++){float fk=float(k);vec2 pc=pmBez(BR_A,C,T,.38+.19*fk)+vec2(0.,-.008);vec2 lq=q-pc;lq=vec2(dot(lq,bd),dot(lq,vec2(-bd.y,bd.x)));
  vec2 rr=vec2(.075,.046)*(1.-.12*fk);lf=smin(lf,sdEll(lq-vec2(0.,-.006),rr),.02);vec2 u=(lq-vec2(0.,-.006))/rr;float s1=1.-dot(u,u);float w=exp(5.*clamp(s1,-3.,1.));
  na+=w*vec3(bd*u.x+vec2(-bd.y,bd.x)*u.y,sqrt(max(s1,0.))+.05);}
 vec3 fr=pmFronds(q-pmBez(BR_A,C,T,.6)+vec2(3.1,1.7),.014);
 if(lf<.03){vec3 n;float ed=pmClumps(q+vec2(1.3,.7),lf+.006*(vn(q*vec2(30.,45.))-.5),normalize(na),.040,n)-.007*(fr.x-.4);
  vec3 c;float key,sg;pmFoliage(q,n,fr,c,key,sg);float cov=ss(PX*1.8,-PX*1.8,ed);
  veil(c,cov*.97,0.);glow(SUNC*vec3(1.,.82,.48)*cov*key*.12*BACK,0.);}
 vec2 g=vec2(dFdx(d),dFdy(d));piece(d,g,vec3(.26,.20,.15),K_BARK,q*vec2(8.,4.),normalize(T-BR_A),.004,.4,0.);
 for(int k=0;k<4;k++){float fk=float(k);vec2 a0=pmBez(BR_A,C,T,.55+.12*fk);float sw=.004*sin(t*1.6+fk*2.)+.01*(T.y-.44);
  vec2 a1=a0+vec2(-.003+.004*fk+sw,-.022);vec2 a2=a1+vec2(.007+sw,-.008);float al2;float pd=pmCurve(q,a0,a1,a2,.0026,.0017,al2);
  veil(mix(vec3(.72,.60,.26),vec3(.94,.82,.42),vn(q*90.)),ss(PX,-PX,pd),0.);}}
// The land: the sky of a golden afternoon, the far low sierras, the plain with a shallow lagoon and far groves, the bunchgrass.
void pmLand(vec2 q,float t){
 pmLightG();
 float ds=length((q-PM_SUN)*vec2(.8,1.2));
 if(q.y>PM_HZ-.03){
  vec3 sk=mix(vec3(1.,.82,.54),vec3(.70,.78,.80),ss(PM_HZ,.45,q.y));sk=mix(sk,vec3(.46,.62,.78),ss(.40,1.3,q.y));
  sk=mix(sk,vec3(1.,.90,.66),exp(-ds*3.)*.65);
  PIECE(-1.,sk,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
  float cl=fbm(vec2(q.x*1.1+t*.004,q.y*7.)+5.)*ss(.22,.32,q.y)*ss(1.,.55,q.y);
  veil(mix(vec3(1.,.84,.62),vec3(.92,.84,.82),ss(.3,.7,q.y)),ss(.52,.76,cl)*.50,1.);
  veil(vec3(1.,.96,.82),ss(.032,.024,length(q-PM_SUN)),1.);veil(vec3(1.,.88,.62),exp(-ds*6.)*.35,1.);
  if(q.y<.14){
   // the far sierras, low and blue in the haze (Tandilia)
   float ax=.035*ss(-.3,.5,q.x);float y=PM_HZ+.004+ax*(.6*fbm2(vec2(q.x*5.+3.,.5))+.4*vn(vec2(q.x*16.,2.)));
   PIECE(q.y-y,mix(vec3(.62,.62,.70),vec3(.86,.80,.74),.45+.2*ss(.0,.03,y-q.y)),K_FAR,q*vec2(3.,6.),vec2(1,0),.01,0.,1.);
   veil(vec3(1.,.88,.66),ss(.06,PM_HZ,q.y)*.25,1.);}
 }
 vec3 g=pmGround(q);PM_G=g;
 PIECE(q.y-PM_HZ,g,K_GRASS,pmGU(q),vec2(0,1),.05,0.,1.);
 // far groves of tala and algarrobo on the horizon
 if(abs(q.y-PM_HZ-.008)<.02){float cb=floor(q.x/.07);float d=1e5;for(int k=0;k<2;k++){float ci=cb+float(k);if(h11(ci*2.7)<.45)continue;
   for(int j=0;j<2;j++){float fj=float(j);vec2 c=vec2((ci+.25+.5*h11(ci+fj*5.))*.07,PM_HZ+.002+.004*h11(ci*3.+fj));vec2 rr=vec2(.012,.006)*(.7+.6*h11(ci+fj));
    d=min(d,sdEll(q-c-vec2(0.,rr.y),rr)+.0015*(vn(q*600.)-.5));}}
  PIECE(d,mix(vec3(.30,.32,.20),vec3(.74,.68,.58),.45),K_PLANT,q*40.,vec2(0,1),.003,0.,1.);}
 // a shallow lagoon in the middle distance: the sky and the glow of the sun in it, reeds at its edge
 {vec2 lc=vec2(.40,PM_HZ-.022);vec2 l=(q-lc)/vec2(.40,.016);float e=length(l)+.25*(vn(vec2(q.x*20.,1.))-.5);
  if(e<1.3){float w=ss(1.,.95,e);vec3 rc=mix(vec3(.92,.82,.62),vec3(.72,.76,.80),ss(-.1,.4,q.x));rc*=.92+.10*vn(vec2(q.x*8.,q.y*600.+t*.3));
   veil(rc,w*.95,1.);
   float rd=ss(1.,1.12,e)*ss(1.3,1.12,e)*ss(.45,.7,vn(vec2(q.x*300.,1.)));veil(vec3(.42,.38,.22),rd*.8,1.);}}
 pmRows(q,t,2,9);}
// ---- The scene ----
void sceneP(vec2 q,float t,float grow){
 pmLand(q,t);
 Mt a=mtRig(t);Gl b=glRig(t);
 // the tree behind the sloth, its shadow on the plain; the far pampas grass
 pmLightG();
 {float dt=sdEll(q-vec2(-.42,-.30),vec2(.30,.035));float n=fbm(q*vec2(20.,60.));shadow(ss(.0,-.06,dt+.03*(n-.5))*ss(.30,.55,n)*.30,vec3(.62,.54,.56),1.);}
 pmPlumes(q,t,vec2(.72,-.17),.055);pmPlumes(q,t,vec2(-.95,-.14),.05);
 pmTree(q,t);
 pmRows(q,t,9,12);
 // the sloth, its shadow, the branch it holds, the leaves
 pmLight();
 mtCast(q,t,a);
 contact(q,MT_P+vec2(.01,.004),.28,.40);contact(q,MT_P+vec2(-.21,.006),.10,.35*(1.-a.up));
 pmHeldBranch(q,t);             // behind the head: the snout and the hands in front of the leaves
 sloth(q,t,a,grow);
 pmLeaves(q,t);
 // the grass between them; the Glyptodon, its shadow
 pmLightG();pmRows(q,t,12,14);
 pmLight();
 glCast(q,b);contact(q,vec2(b.x+.0,GL_Y+.004),.22,.40);
 glypto(q,t,b,grow);
 // the nearest grass, a tall pampas plume at the corner, the golden dust in the air
 pmLightG();pmRows(q,t,14,19);
 pmPlumes(q,t,vec2(.86,-.50),.12);
 pmDust(q,t);
}
void fossilP(vec2 q){Mt a=mtRig(0.);vec2 m=(q-MT_P)/MT_S;
 if(m.x>-3.4&&m.x<3.0&&m.y>-.15&&m.y<3.0){vec2 sN,wN,hdN,sF,wF,hdF,bpN;mtHands(0.,a,sN,wN,hdN,sF,wF,hdF,bpN);
  PIECE(mtBones(m,a,sN,wN,sF,wF)*MT_S,vec3(.70,.60,.46),K_FOSSIL,m*.6,vec2(1,0),.012,.6,0.);}
 Gl b=glRig(0.);vec2 p=(q-vec2(b.x,GL_Y))/GL_S;
 if(p.x>-2.2&&p.x<1.7&&p.y>-.15&&p.y<1.8)PIECE(glBones(p,b.hd)*GL_S,vec3(.70,.60,.46),K_FOSSIL,p*.6,vec2(1,0),.008,.6,0.);}

const vec2 WIN_C=vec2(-.10,-.10);
void fossil(vec2 q){fossilP(q);}
void life(vec2 q,float t){sceneP(q,t,GROW);}

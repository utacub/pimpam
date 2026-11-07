// ---- Scene 15 (El pou del temps, CE37): Iguanodon bernissartensis, an adult (about 10 m) and its young (about a third of its length) at
// the edge of a still pool in the Bernissart basin (Belgium, about 126–122 million years ago), under a grey-green overcast light: still
// water with reflections, horsetails, tree ferns, conifers, low ferns. No grass.
// Times on the scene clock (uTau): 4.25–4.55 the adult steps its near hind foot forward (it lands 4.55); 4.55–6.0 it rises from four legs
// to two (its hands leave the ground about 4.6–5.0) and reaches into a low conifer branch; 6.0–7.3 it plucks a sprig (the tug 6.25, the
// twig breaks 6.45 and the branch springs back) and chews; 8.0–9.2 it comes back down onto its hands (they land 9.0 and 9.18) and shifts
// its weight forward. The young nibbles low ferns all along and looks up at the adult at 9.5–11.0.
// Rig frame (metres): facing +x, the ground at y 0; flip -1 faces left on screen. Scale: .105 screen units per metre for the adult.

// the animals: the ground under the hip at rest, scale, facing
const vec4 IG_A[2]=vec4[](vec4(-.12,-.30,.105,1.),vec4(.36,-.415,.040,-1.));
// body frame (metres, from the hip, along the back): the shoulder, the base of the neck, the base of the tail
const vec2 IG_SB=vec2(2.10,-.70),IG_N0=vec2(2.35,-.10),IG_TB=vec2(-.70,.05);
const vec2 IG_T1=vec2(-2.50,-.10),IG_T2=vec2(-4.15,-.42),IG_T3=vec2(-6.00,-.98);
const vec3 IG_TREE=vec3(.56,-.262,.034);   // the conifer the adult feeds from: the base of its trunk, its width
const vec4 IG_TFERN[3]=vec4[](vec4(-.56,.012,.20,.45),vec4(.84,.014,.18,.45),vec4(-.80,-.255,.56,0.)); // tree ferns: base, height, haze
const vec4 IG_CONIF[3]=vec4[](vec4(-.30,.016,.46,.08),vec4(.20,.014,.36,.065),vec4(-.98,.012,.56,.10));
const vec3 IG_HORSE[6]=vec3[](vec3(-.42,-.215,.10),vec3(.06,-.205,.08),vec3(.70,-.225,.12),vec3(-.95,-.58,.24),vec3(.95,-.64,.22),vec3(.40,.012,.045));
const vec4 IG_FFERN[5]=vec4[](vec4(-.50,-.47,.13,6.),vec4(.72,-.50,.15,6.),vec4(-.18,-1.0,.30,6.),vec4(.45,-1.08,.32,6.),vec4(-.70,-.38,.10,5.));
struct IgPose{vec2 H,C,Nc,Wn,Tn,Wf,Tf,Fn,Ff;float th,ha,jaw,blink,tl,sprig;};

// A cheap curved tube through the midpoint of the quadratic Bézier a, b, c (radius ra at a, rc at c); uv along and across.
float igBend(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc,out vec2 uv){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);
 float u1=segU(p,a,m),u2=segU(p,m,c);vec2 p1=mix(a,m,u1),p2=mix(m,c,u2);float r1=mix(ra,rm,u1),r2=mix(rm,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;bool f=d1<d2;vec2 o=p-(f?p1:p2);vec2 dir=f?m-a:c-m;
 uv=vec2(f?u1*.5:.5+u2*.5,(dir.x*o.y-dir.y*o.x)/length(dir)/max(f?r1:r2,1e-3));return smin(d1,d2,rm*.25);}
// Small pebbly scales painted by the light; su: one scale per unit.
float igScales(vec2 su,float fl,float cp){
 vec2 i=floor(su-.5);float a=8.,b=8.;vec2 oa=vec2(0.),ia=i;
 for(int k=0;k<4;k++){vec2 c=i+vec2(float(k&1),float(k>>1));vec2 o=su-(c+.22+.56*h22(c));float d=dot(o,o);
  if(d<a){b=a;a=d;ia=c;oa=o;}else if(d<b)b=d;}
 float r=sqrt(a),e=sqrt(b)-r;float hh=h21(ia);oa.x*=fl;
 float ew=max(.09,1.6/cp),ek=.09/ew;   // the seam: never thinner than about a pixel and a half (cp: one scale in pixels), as dark on the whole
 float dome=ss(.70,.10,r)*ss(.0,.25,e+.19-ew);float lit=dot(oa,normalize(SUNL.xy))/max(r,.05)*ss(.0,.35,r)*dome;
 return 1.+(.16+.06*step(.86,hh))*lit-.08*ss(ew,.0,e)*ek+.06*(hh-.5);}
vec2 igW(IgPose p,vec2 b){return p.H+rot(-p.th)*b;}   // body frame to rig frame

// ---- The poses ----
IgPose igPose(int i,float t){
 IgPose p;float fi=float(i);float br=sin(t*.9+fi*2.);
 p.blink=blinkAt(t,fi*.31+.1);p.tl=.035*sin(t*.55+fi*2.);p.sprig=0.;
 p.Ff=vec2(-.25,0.);
 if(i==0){
  float r=ss(4.55,5.70,t)*(1.-ss(8.0,9.0,t)),rf=ss(4.70,5.85,t)*(1.-ss(8.18,9.18,t));   // the rise (the far hand a little later)
  float pre=ss(4.25,4.55,t)*(1.-ss(5.0,5.6,t));                                          // the hips settle back before it
  float sh=ss(8.95,9.30,t)*(1.-ss(9.4,10.2,t));                                          // the weight shift after the hands land
  float reach=ss(5.55,6.0,t)*(1.-ss(6.25,6.55,t)),tug=ss(6.22,6.42,t)*(1.-ss(6.5,7.1,t));
  float chew=ss(6.55,6.8,t)*(1.-ss(7.55,7.9,t));
  p.H=mix(vec2(0.,2.65),vec2(-.30,2.45),r)+vec2(-.08,-.06)*pre+vec2(.16,-.03)*sh+vec2(0.,.012*br);
  p.th=mix(-.05,.70,r)-.04*sh;
  vec2 cb=mix(vec2(3.40,.50),vec2(3.30,.62),r)+vec2(.30,.10)*reach-vec2(.22,.14)*tug+vec2(.05*sin(t*.4),.04*sin(t*.53));
  p.C=igW(p,cb);
  p.ha=mix(-.32+.05*sin(t*.5),-.10,r)-.28*tug+.06*chew*sin(t*TAU*1.1);
  p.jaw=.55*ss(5.80,6.0,t)*(1.-ss(6.18,6.26,t))+.40*chew*(.5+.5*sin(t*TAU*2.2));
  p.sprig=ss(6.4,6.5,t)*(1.-ss(7.0,7.5,t));
  // the near hind foot steps forward to brace (lands 4.55)
  p.Fn=vec2(mix(.05,.30,ss(4.25,4.55,t)),.14*sin(PI*sat((t-4.25)/.30)));
  vec2 S=igW(p,IG_SB);float ln=ss(0.,.32,r),lf=ss(0.,.32,rf);
  p.Wn=mix(vec2(2.20,.40),S+vec2(.48,-1.12)+vec2(.04,.03)*sin(t*1.3),ln)+vec2(0.,.22*sin(PI*ln));
  p.Tn=mix(vec2(2.38,.05),S+vec2(.66,-1.40)+vec2(.05,.03)*sin(t*1.3),ln)+vec2(0.,.22*sin(PI*ln));
  vec2 S2=S+vec2(-.10,.08);
  p.Wf=mix(vec2(1.92,.40),S2+vec2(.40,-1.08),lf)+vec2(0.,.20*sin(PI*lf));
  p.Tf=mix(vec2(2.10,.05),S2+vec2(.60,-1.36),lf)+vec2(0.,.20*sin(PI*lf));
 }else{
  // the young: head down in the low ferns, nibbling; it looks up at the adult (9.5–11.0)
  float look=ss(9.5,9.95,t)*(1.-ss(10.6,11.1,t));
  p.H=vec2(0.,2.60+.015*br);p.th=-.10;
  p.C=mix(vec2(3.00,1.05)+vec2(.04,.06)*sin(t*2.9),p.H+vec2(3.25,.65),look);
  p.ha=mix(-1.05+.10*sin(t*2.9),.30+.05*sin(t*1.7),look);
  p.jaw=.30*(.5+.5*sin(t*TAU*2.6))*(1.-look);
  p.Fn=vec2(.30,0.);
  p.Wn=vec2(2.20,.40);p.Tn=vec2(2.38,.05);p.Wf=vec2(1.92,.40);p.Tf=vec2(2.10,.05);
 }
 vec2 N0=igW(p,IG_N0);p.Nc=.5*(N0+p.C)+vec2(-.22,.34);
 return p;}

// ---- The head, in its own frame h (metres, forward +x, the joint at 0): the long, deep, horse-like snout, the toothless beak, the big
// nostril, the lower jaw (jaw opens it), the cheek ----
void igHead(vec2 h,float jaw,out float dFace,out float dBeak){
 float cr=sdEll(h-vec2(.10,.06),vec2(.28,.22));float sn=sdCap(h,vec2(.30,.05),vec2(.86,-.03),.19,.13);
 vec2 j=rot(-.22*jaw)*(h-vec2(.05,-.06))+vec2(.05,-.06);
 float jw=sdCap(j,vec2(.02,-.13),vec2(.84,-.16),.11,.06);
 dFace=smin(smin(cr,sn,.10),jw,.05);dFace=smin(dFace,sdEll(h-vec2(.38,-.10),vec2(.24,.12)),.05);
 dBeak=min(sdEll(h-vec2(.95,-.05),vec2(.09,.095)),sdEll(j-vec2(.90,-.17),vec2(.075,.05)));}

// ---- The bones: the skull, the neck, back and tail with their spines and chevrons, the ossified tendons along the back, the ribs, the
// pelvis, the shoulder blade, the limbs ----
float igBones(vec2 m,IgPose p,float sk,vec2 K,vec2 A,vec2 E){
 float d=sk;vec2 uv;vec2 b=rot(p.th)*(m-p.H);vec2 tf=IG_TB+rot(-1.15*p.th+p.tl)*(b-IG_TB);
 vec2 N0=igW(p,IG_N0);d=min(d,igBend(m,p.C,p.Nc,N0,.07,.09,uv));
 d=min(d,igBend(b,IG_N0,vec2(1.,.38),IG_TB,.09,.10,uv));
 d=min(d,igBend(tf,IG_TB,vec2(-3.2,-.10),IG_T3,.09,.03,uv));
 for(int k=0;k<9;k++){float x=2.0-float(k)*.30;d=min(d,sdSeg(b,vec2(x,.30+.06*ss(2.,0.,x)),vec2(x-.04,.62+.08*ss(2.,0.,x)))-.05);}
 for(int k=0;k<8;k++){float x=-1.0-float(k)*.52;float y=-.05+.17*(x+.70);vec2 a=vec2(x,y);d=min(d,min(sdSeg(tf,a,a+vec2(-.08,.42-float(k)*.04)),sdSeg(tf,a,a+vec2(-.12,-.55+float(k)*.05)))-.045);}
 for(int k=0;k<7;k++){float x=1.95-float(k)*.30;vec2 a=vec2(x,.28),c=vec2(x-.30,-.85+.12*float(k)*float(k)/36.),e=vec2(x-.10,-1.40+.35*float(k)/6.);d=min(d,min(sdSeg(b,a,c),sdSeg(b,c,e))-.045);}
 d=min(d,abs(sdEll(b-vec2(.20,.58),vec2(1.9,.09)))-.018);   // the bundle of ossified tendons along the back
 d=min(d,sdEll(b-vec2(0.,.12),vec2(.80,.22)));d=min(d,sdCap(b,vec2(.30,-.10),vec2(1.10,-.85),.06,.08));d=min(d,sdCap(b,vec2(-.25,-.10),vec2(-1.0,-1.0),.07,.05));
 d=min(d,sdCap(b,vec2(1.70,.20),IG_SB,.10,.12));
 d=min(d,sdCap(m,p.H,K,.14,.11));d=min(d,sdCap(m,K,A,.11,.09));d=min(d,sdCap(m,A,p.Fn+vec2(.15,.10),.08,.06));d=min(d,sdCap(m,p.Fn+vec2(.10,.08),p.Fn+vec2(.50,.04),.05,.035));
 vec2 S=igW(p,IG_SB);d=min(d,sdCap(m,S,E,.10,.08));d=min(d,sdCap(m,E,p.Wn,.07,.06));d=min(d,sdCap(m,p.Wn,p.Tn,.06,.04));
 return d;}

// How a rounded form under the skin (the barrel of the trunk, a thigh, a shoulder) turns to the light: a smooth low dome over the ellipse
// ax (in the frame M, v from its centre), against a flat surface. Its slope fades to nothing at the rim: no line, no terminator edge.
float igDome(vec2 v,mat2 M,vec2 ax,float fl){vec2 l=M*v/ax;float r2=dot(l,l);if(r2>1.)return 0.;
 vec2 g=(-1.2*(1.-r2)*l/ax)*M;g.x*=fl;return lambert(normalize(vec3(-g,1.)))-lambert(vec3(0.,0.,1.));}
// How a limb segment (a to b, radii ra, rb) turns to the light, as a round tube: its light (shade and sun) against a flat surface's.
float igTube(vec2 p,vec2 a,vec2 b,float ra,float rb,float fl){vec2 ab=b-a;float u=sat(dot(p-a,ab)/dot(ab,ab));vec2 o=(p-a-ab*u)/mix(ra,rb,u);
 o/=max(1.,length(o));o.x*=fl;vec3 n=normalize(vec3(o*.85,sqrt(max(1.-dot(o,o)*.72,0.))));
 return (.5*(.55+.45*n.z)+.94*lambert(n))/(.5+.94*lambert(vec3(0.,0.,1.)));}

// ---- One Iguanodon: A (position, scale, facing), yg 0 adult .. 1 young (the same build, a bigger head and eyes) ----
void igSaur(vec2 q,vec4 Ai,float t,IgPose p,float grow,float yg){
 float s=Ai.z,fl=Ai.w;vec2 m=(q-Ai.xy)/s;m.x*=fl;
 if(m.x<-7.6||m.x>5.3||m.y<-.3||m.y>6.6)return;
 float br=sin(t*.9+yg*2.);float hs=mix(1.15,1.45,yg);
 vec2 b=rot(p.th)*(m-p.H);vec2 tf=IG_TB+rot(-1.15*p.th+p.tl)*(b-IG_TB);
 vec2 h=rot(p.ha)*(m-p.C)/hs;
 // the limbs: near and far (the far ones a little higher on the screen, darker)
 vec2 S=igW(p,IG_SB);
 vec2 An=p.Fn+vec2(-.20,.52),Kn=knee(p.H,An,1.15,1.05,1.),En=knee(S,p.Wn,.82,.76,-1.);
 vec2 dy=vec2(0.,.12);vec2 H2=p.H+vec2(-.10,.06),S2=S+vec2(-.10,.08),F2=p.Ff+dy,W2=p.Wf+dy,T2=p.Tf+dy;
 vec2 A2=F2+vec2(-.20,.52),K2=knee(H2,A2,1.15,1.05,1.),E2=knee(S2,W2,.82,.76,-1.);
 float G=grow/s;bool needB=G<1.1;float inPX=4.*PX/s,cover=-2.*PX/s;
 // ---- distances ----
 float dFar;{vec2 hk=normalize(K2-H2);float e=sdEll(mat2(hk.y,hk.x,-hk.x,hk.y)*(m-mix(H2,K2,.45)),vec2(.66,.90));
  e=smin(e,sdCap(m,K2,A2,.34,.19),.12);e=smin(e,sdCap(m,A2,F2+vec2(.12,.12),.19,.14),.05);e=smin(e,sdEll(m-F2-vec2(.24,.09),vec2(.36,.10)),.05);
  float a=smin(smin(sdCap(m,S2,E2,.34,.23),sdCap(m,E2,W2,.23,.17),.06),sdCap(m,W2,T2,.16,.13),.04);dFar=min(e,a);}
 // the body: a deep, bulky barrel; the deep chest; the thick neck; the thick, deep tail (a counterweight)
 float dHp=sdEll(b,vec2(1.15,.95)),dTo=sdEll(rot(.06)*(b-vec2(1.10,-.45)),vec2(1.80,1.12+.015*br)),dCh=sdEll(b-vec2(2.0,-.72),vec2(.80,.90));
 float dBd=smin(smin(dHp,dTo,.35),dCh,.30);
 vec2 uv;vec2 N0=igW(p,IG_N0);float dN=igBend(m,N0,p.Nc,p.C,.60,.28,uv);
 float dT=smin(smin(sdCap(tf,IG_TB,IG_T1,1.0,.72),sdCap(tf,IG_T1,IG_T2,.70,.42),.10),sdCap(tf,IG_T2,IG_T3,.42,.07),.08);
 float dCore=smin(smin(dBd,dN,.25),dT,.30);
 // the near hind limb: the massive thigh, the shin with its calf, the steep metatarsus, the broad three-toed hoofed foot
 vec2 hk=normalize(Kn-p.H),ka=normalize(An-Kn);mat2 MT=mat2(hk.y,hk.x,-hk.x,hk.y);vec2 cT=mix(p.H,Kn,.45);
 float dThg=sdEll(MT*(m-cT),vec2(.72,.96));
 float dLg=smin(sdCap(m,Kn,An,.36,.20),sdEll(mat2(ka.y,ka.x,-ka.x,ka.y)*(m-mix(Kn,An,.32)+vec2(.10,0.)),vec2(.24,.44)),.06);
 dLg=smin(dLg,sdCap(m,An,p.Fn+vec2(.12,.12),.20,.15),.05);dLg=smin(dLg,sdEll(m-p.Fn-vec2(.24,.09),vec2(.38,.10)),.05);
 // the massive near arm: the upper arm (part of the body), the forearm and the hand (in front of the body, set off from it by light
 // and shade, not by a line), the hand's three middle fingers bound in a hoof-like pad, the conical thumb spike
 float dUA=sdCap(m,S+vec2(-.05,.10),En,.38,.25);
 float dFA0=smin(sdCap(m,En,p.Wn,.25,.18),sdCap(m,p.Wn,p.Tn,.17,.14),.04);
 vec2 ax=normalize(p.Tn-p.Wn),pf=vec2(-ax.y,ax.x);vec2 sb=mix(p.Wn,p.Tn,.18)+pf*.10,sdr=normalize(pf*.85-ax*.55);
 float dSpk=sdCap(m,sb,sb+sdr*.32,.10,.016);float dFA=smin(dFA0,dSpk,.03);
 // the head and the sprig of conifer held in the beak after the pluck (it shortens as it is eaten)
 float dFace=9.,dBeak=9.;
 bool nearH=h.x>-.5&&h.x<1.35&&h.y>-.6&&h.y<.6;
 if(nearH){igHead(h,p.jaw,dFace,dBeak);dFace*=hs;dBeak*=hs;}
 float dSp=9.;if(p.sprig>0.){vec2 a=vec2(.98,-.10);float L=.30*p.sprig;dSp=min(min(sdCap(h,a,a+vec2(.06,-L),.035,.03),sdCap(h,a,a+vec2(.16,-L*.8),.03,.025)),sdCap(h,a,a+vec2(-.03,-L*.7),.03,.025));
  dSp=(dSp-.012*(.5+.5*sin(h.y*160.)))*hs;}
 float dHd=min(dFace,dBeak);
 // the whole near side but the forearm as one smooth body, so its dark contour is the outer silhouette only
 float dIn=smin(dCore,dThg,.15);dIn=smin(dIn,dLg,.08);dIn=smin(dIn,dUA,.12);dIn=smin(dIn,dHd,.10);float d=smin(dIn,dFA,.04);
 float dB=-1.;
 if(needB&&min(d,dFar)>.05)needB=false;
 if(needB){float sk=nearH?max(dHd,-sdEll(h-vec2(.16,.08),vec2(.07,.07))*hs):9.;dB=igBones(m,p,sk,Kn,An,En);}
 if(needB){dFar=max(dFar,dB-G);d=max(d,dB-G);}
 // ---- painting, back to front ----
 if(needB&&grow<.5)PIECE(dB*s,vec3(.86,.82,.72),K_BONE,m*.4,vec2(1,0),.06*s,.55,0.);
 // living colours: dark grey-olive along the back, warm ochre-brown flanks, pale cream below (countershading); the young paler, its
 // pattern a little bolder
 vec3 back=mix(vec3(.27,.29,.24),vec3(.40,.39,.31),yg),flank=mix(vec3(.48,.40,.29),vec3(.58,.50,.37),yg),belly=mix(vec3(.78,.72,.57),vec3(.86,.80,.65),yg);
 // the scale pattern: bigger on the body, smaller on the neck, the limbs and the end of the tail, the head's own following its turns
 // (fixed sizes cross-faded, so the cells never shear)
 float lm=ss(.05,-.10,min(dLg,dUA)-dCore),nk=ss(.15,-.15,dN-dBd);
 float wh=nearH?ss(.05,-.03,dHd):0.,wf=(1.-wh)*sat(max(max(lm,nk),max(ss(-3.6,-5.0,tf.x),ss(.03,-.03,dFA))));
 float scl=0.;
 for(int k=0;k<3;k++){float w=k==0?(1.-wh)*(1.-wf):k==1?wf:wh;if(w<.01)continue;
  float r=k==0?8.5:k==1?13.:15./hs;vec2 su=k==0?m*vec2(7.,8.5):k==1?m*13.:h*15.;
  float cp=s/r/PX;scl+=w*mix(1.,igScales(su,fl,cp),ss(3.,6.,cp));}
// (0.44.7) The skin's own fine texture (K_SKIN) used to be turned off by giving it coordinates at ×900, so that its features were far
// finer than a pixel and faded out. On an NVIDIA card under Windows that fade did not happen: the hash of such large numbers broke
// into lines along the axes over the whole animal (Marc's screen, 0.31–0.44.6; the emulated cards here never showed it). Now the
// pieces take K_SMOOTH with constant coordinates: no texture at all, and a soft satin sheen of the skin.
 if(dFar<inPX&&d>cover)PIECE(dFar*s,mix(flank,back,.5)*.60*scl,K_SMOOTH,vec2(0.),vec2(1,0),.12*s,1.,0.);
 if(d<inPX){
  float neckK=nk*ss(.0,-.25,dN);
  float tx=sat(-(tf.x+.70)/5.3);
  float cs=mix(ss(-.75,.35,b.y+.30),ss(-.75,.35,(tf.y-.05-.195*(tf.x+.70))/mix(1.0,.08,tx)),ss(-.5,-1.3,b.x));cs=mix(cs,ss(-.6,.5,uv.y),neckK);
  vec3 alb=cs<.5?mix(belly,flank,cs*2.):mix(flank,back,cs*2.-1.);
  // the pattern, at low contrast: darker bars across the back and the tail fading down the flanks; soft mottles
  float xs=b.x>-.7?b.x:tf.x;
  alb*=1.-mix(.15,.22,yg)*ss(.35,.80,.5+.5*sin(xs*2.6+.8*vn(m*1.2+yg*3.)))*cs*(1.-.5*neckK);
  alb*=.90+.16*vn(m*2.0+yg*5.);
  // the limbs mid-toned, darker towards the feet; the hooves
  alb=mix(alb,mix(flank,back,.40)*.95,lm);alb*=mix(.74,1.,ss(.0,.9,m.y));
  alb=mix(alb,vec3(.26,.24,.21),ss(.14,.07,m.y)*ss(.36,.48,m.x-p.Fn.x)*step(m.x-p.Fn.x,.66)*lm);
  // the forearm and the hand, in front of the body: limb-toned, the hoof-like pad, the pale conical thumb spike; where they lie over
  // the body they are set off from it by their own roundness and a soft shadow beside them (not by a line); none at the elbow
  float wF=ss(.02,-.02,dFA),inB=ss(.02,-.12,dIn)*ss(.20,.50,length(m-En));
  {vec3 al=mix(flank,back,.40)*.95*mix(.74,1.,ss(.0,.9,m.y));
   al=mix(al,vec3(.30,.28,.24),ss(.0,-.05,sdCap(m,p.Tn-ax*.06,p.Tn+ax*.2,.17,.17))*.85);
   al=mix(al,mix(vec3(.70,.66,.56),vec3(.36,.33,.29),ss(.4,1.,dot(m-sb,sdr)/.30)),ss(.01,-.01,dSpk-dFA0+.005));
   alb=mix(alb,al,wF);
   float tb=sdCap(m,En,p.Wn,.25,.18)<sdCap(m,p.Wn,p.Tn,.17,.14)?igTube(m,En,p.Wn,.25,.18,fl):igTube(m,p.Wn,p.Tn,.17,.14,fl);
   alb*=mix(1.,tb,wF*inB);
   alb*=1.-.38*ss(.16,.0,dFA)*(1.-wF)*inB;}
  // the head: a darker crown and top of the snout, the jaw and cheek paler; the dark keratin beak; the sprig
  float hd=ss(.10,-.10,dHd-min(dN,dBd));
  alb=mix(alb,mix(belly,mix(flank,back,.6),ss(-.12,.10,h.y)),hd*.7);
  alb=mix(alb,vec3(.28,.27,.24),ss(.02,-.02,dBeak-dFace+.01)*hd);
  // skin folds: at the base of the neck, behind the elbow, in front of the thigh
  float fo=ss(.05,.0,abs(uv.x-.10-.02*sin(uv.y*2.5)))*ss(.95,.5,abs(uv.y))*neckK;
  fo+=ss(.05,.0,abs(uv.x-.20-.02*sin(uv.y*2.+1.)))*ss(.9,.4,abs(uv.y))*neckK*.7;
  vec2 lT=MT*(m-cT);fo+=ss(.05,.0,abs(dThg+.05))*ss(-.30,-.50,lT.x)*ss(.0,.25,lT.y)*ss(.75,.45,lT.y);   // a short crease at the groin
  {vec2 ua=normalize(En-S),pu=vec2(-ua.y,ua.x);fo+=ss(.035,.0,sdSeg(m,En-pu*.30-ua*.28,En-pu*.24+ua*.02))*.8;}   // behind the elbow
  alb*=1.-.22*sat(fo)*ss(.0,-.08,d);
  // the forms under the skin: the round barrel of the trunk, the thigh, the shoulder; the belly a little in its own shade
  alb*=1.+.80*igDome(m-igW(p,vec2(1.0,-.40)),rot(p.th),vec2(2.7,1.30),fl)+1.1*igDome(m-cT,MT,vec2(.72,.96),fl)+.9*igDome(m-mix(S,En,.30),mat2(1.),vec2(.42,.56),fl);
  alb*=mix(.86,1.,ss(.0,.25,cs));
  // light on the silhouette: a warm rim along the top, a brighter edge towards the sun
  vec2 gD=vec2(dFdx(d),dFdy(d));gD/=max(length(gD),1e-6);
  float rk=(1.-lm)*(1.-hd)*(1.-wF);
  alb=mix(alb,alb*1.40+vec3(.05,.04,.02),ss(-.22,.0,d)*sat(gD.y*1.3-.2)*.5*rk);
  alb=mix(alb,alb*1.3+.03,ss(-.30,0.,d)*sat(dot(gD,normalize(SUNL.xy)))*.30*rk);
  alb*=scl;
  // roundness: about the local half-thickness everywhere (a larger one would split a thin part along its axis)
  float tr=tf.x>-2.5?mix(1.0,.72,(-.70-tf.x)/1.8):tf.x>-4.15?mix(.72,.42,(-2.5-tf.x)/1.65):mix(.42,.07,(-4.15-tf.x)/1.85);
  float Rb=mix(.75,.9*mix(.60,.28,sat(uv.x)),nk);Rb=mix(Rb,.16*hs,hd);if(b.x<-.7)Rb=min(Rb,max(.85*tr,.05));
  Rb=mix(Rb,mix(mix(.14,.30,ss(.05,-.15,dThg)),.24,ss(-.05,.05,dLg-dUA)),ss(.05,-.10,min(min(dLg,dUA),dThg)-dCore));
  Rb=mix(Rb,.13,wF*ss(-.10,.05,dIn));
  PIECE(d*s,alb,K_SMOOTH,vec2(0.),vec2(1,0),Rb*s,1.,0.);
  // the line of the beak, the nostril
  if(nearH)shadow((ss(.012,.0,abs(h.y+.11+.02*h.x))*step(.42,h.x)*step(h.x,.98)+ss(.03,.0,sdEll(h-vec2(.80,.03),vec2(.07,.035))))*.55*step(d,0.),vec3(.25,.24,.22),0.);}
 // the sprig in the beak (a story prop)
 if(dSp<inPX)PIECE(dSp*s,vec3(.19,.27,.16)*(.8+.4*vn(h*90.)),K_PLANT,h*40.,vec2(0,1),.02*s,.6,0.);
 if(grow>.3&&nearH){vec2 ec=vec2(.16,.08);vec2 ecL=p.C+rot(-p.ha)*ec*hs;
  eyeA(q,Ai.xy+vec2(ecL.x*fl,ecL.y)*s,mix(.050,.068,yg)*hs*s,vec3(.40,.28,.14),back,p.blink,0.);}
}

// A simple silhouette of one animal, for its shadow on the bank.
float igSil(vec2 m,IgPose p){vec2 b=rot(p.th)*(m-p.H);vec2 tf=IG_TB+rot(-1.15*p.th+p.tl)*(b-IG_TB);
 float d=sdEll(rot(.06)*(b-vec2(.90,-.40)),vec2(2.10,1.15));
 d=min(d,sdCap(tf,IG_TB,IG_T2,.95,.40));d=min(d,sdCap(tf,IG_T2,IG_T3,.40,.07));
 vec2 N0=igW(p,IG_N0);d=min(d,sdCap(m,N0,p.C,.50,.28));d=min(d,sdCap(m,p.C,p.C+rot(-p.ha)*vec2(.95,-.05),.26,.15));
 d=min(d,sdCap(m,p.H,p.Fn+vec2(.15,.10),.45,.18));vec2 S=igW(p,IG_SB);d=min(d,sdCap(m,S,p.Tn,.32,.14));return d;}

// ---- The bank and the pool (decor) ----
float igFernD(vec2 q,vec2 b,float ang,float len,float bend,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012*len/.1);return max(d,max(-l.y,l.y-len));}
// A fan of fronds from base (spread: the half angle; droop: how much they arch over); dec 0 for the young's ferns (a story prop).
void igFerns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float hz,float spread,float dec){
 if(abs(q.x-base.x)>sc*1.5||q.y<base.y-sc*.8||q.y>base.y+sc*1.15)return;
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<9;i++){if(float(i)>=n)break;float fi=float(i);
  float ang=(-spread+2.*spread*fi/(n-1.))+.05*sin(t*.9+fi+seed)+.02*sin(t*2.3+fi*2.);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;
  float e=igFernD(q,base,ang,len,(.35+.25*step(1.2,spread))*sign(ang+.01),fu);
  if(e<d){d=e;u=fu;ci=fi;}}
 if(d>PX*4.)return;
 vec3 c=col*(.82+.34*h11(ci*3.+seed))*(.85+.25*u.x);
 PIECE(d,mix(c,vec3(.70,.74,.70),hz),K_PLANT,u*vec2(1.,6.),vec2(0,1),.004,.5,dec);}
// Horsetails: jointed stems with dark nodes and whorls of thin branches.
void igHorse(vec2 q,vec2 b,float h,float t,float seed,float haze){
 if(abs(q.x-b.x)>h*.40||q.y<b.y-.005||q.y>b.y+h*1.05)return;
 float ds=9.,us=0.,hs=0.,si=0.;
 for(int i=0;i<8;i++){float fi=float(i);float x0=b.x+(h11(fi+seed)-.5)*h*.55;float hi=h*(.50+.50*h11(fi*3.+seed));float lean=(h11(fi*5.+seed)-.5)*.30+.03*sin(t*1.1+fi+seed);
  vec2 top=vec2(x0+lean*hi,b.y+hi);float d=sdCap(q,vec2(x0,b.y),top,h*.017,h*.010);
  float u=segU(q,vec2(x0,b.y),top);float nd=fract(u*hi/(h*.08));float wh=abs(q.x-mix(x0,top.x,u))-h*.07*(1.-u)*ss(.25,.5,u);
  d=min(d,max(wh,abs(nd-.5)*h*.08-.0015*h/.1));
  if(d<ds){ds=d;us=u;hs=hi;si=fi;}}
 if(ds>PX*4.)return;
 float node=ss(.10,.0,abs(fract(us*hs/(h*.08))-.5)-.40);
 vec3 c=mix(vec3(.34,.44,.22)*(.85+.3*h11(si+seed)),vec3(.16,.14,.10),node*.7);
 PIECE(ds,mix(c,vec3(.70,.74,.70),haze),K_PLANT,vec2(us*20.,0.),vec2(0,1),h*.01,.45,1.);}
// A conifer of tiers of drooping sprays (from the fraction lo of its height up); haze for the misty far ones.
void igConifer(vec2 q,vec2 b,float h,float w,float seed,float t,float haze,float lo){
 if(abs(q.x-b.x)>w*1.4||q.y<b.y+h*(lo-.08)||q.y>b.y+h*1.03)return;
 float y=(q.y-b.y)/h;float x=q.x-b.x;float sg=x<0.?-1.:1.;
 float d=9.,ft=0.;
 for(int j=0;j<3;j++){float ti=floor(y*13.+(sg>0.?.5:0.))+float(j)-1.;float yc=(ti+(sg>0.?.5:0.))/13.;if(yc<lo||yc>.97)continue;
  float hh=h11(ti*2.+sg+seed*7.);float wi=w*(pow(sat(1.-yc),.7)*(.55+.6*hh)+.12);float sw=.006*h*yc*sin(t*.7+ti*1.3+seed+sg);
  vec2 a=vec2(0.,yc*h),tip=vec2(sg*wi+sw,yc*h-(.06+.05*hh)*h*(1.-.4*yc));vec2 mid=mix(a,tip,.5)+vec2(0.,.02*h);
  vec2 p=vec2(x,y*h);float th=.050*h*(1.-.45*yc);vec2 uv;
  float e=igBend(p,a,mid,tip,th,.012*h,uv)-.012*h*(vn(vec2(x*120./h,ti+sg))-.4)-.006*h*(vn(vec2(x*400./h,y*300.))-.5);
  if(e<d){d=e;ft=(p.y-mix(a.y,tip.y,sat(abs(x)/wi)))/th;}}
 d=min(d,max(abs(x)-h*.012,y-1.02));
 if(d>PX*4.)return;
 vec3 c=vec3(.18,.25,.17)*(.85+.3*vn(vec2(x*160./h,y*90.)));c*=mix(.70,1.10,ss(-.8,.8,ft));
 c=mix(c,vec3(.68,.73,.70),haze*(1.-.25*y));
 PIECE(d,c,K_PLANT,vec2(x*80.,y*30.),vec2(0,-1),.003,.10,1.);}
// A tree fern: a fibrous trunk with old leaf bases, a crown of long arching fronds.
void igTreeFern(vec2 q,vec4 f,float t,float seed){
 vec2 b=f.xy;float h=f.z;if(abs(q.x-b.x)>h*.75||q.y<b.y-.01||q.y>b.y+h*1.25)return;
 vec2 top=b+vec2(.04*h*sin(seed),h*.82);
 float tr=sdCap(q,b,top,h*.045,h*.032);
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<9;i++){float fi=float(i);float ang=-2.25+4.5*fi/8.+.12*(h11(fi+seed)-.5)+.04*sin(t*.8+fi+seed);vec2 fu;
  float e=igFernD(q,top,ang,h*(.52+.12*h11(fi*3.+seed)),.55*sign(ang+.01)*ss(.2,1.2,abs(ang)),fu);if(e<d){d=e;u=fu;ci=fi;}}
 float dd=min(d,tr);if(dd>PX*4.)return;
 vec3 c=vec3(.24,.36,.18)*(.80+.34*h11(ci*3.+seed))*(.80+.30*u.x);
 if(tr<d)c=vec3(.26,.20,.15)*(.75+.5*ss(.3,.7,fract((q.y-b.y)/h*14.)));
 PIECE(dd,mix(c,vec3(.68,.73,.70),f.w),K_PLANT,tr<d?vec2(q.x*300.,q.y*40.):u*vec2(1.,6.),vec2(0,1),.004,.45,1.);}
float igForestTop(float qx,float base,float hgt,float fr,float seed){
 float x=qx*fr+seed,ci=floor(x),fx=fract(x);float top=-1.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);float hh=h11(cj+seed);float cx=float(j)+.5+(h11(cj*1.7)-.5)*.5;
  float tall=hgt*(.55+.6*hh);float con=step(.45,h11(cj+9.));
  float yy=con>.5?base+tall-abs(fx-cx)/fr*3.4*(1.+.25*sin((fx-cx)*60.)):base+tall*.75*sqrt(max(0.,1.-pow((fx-cx)/.8,2.)))+.010*vn(vec2(qx*60.,cj));top=max(top,yy);}
 return top+.004*(vn(vec2(qx*120.,1.))-.5);}
float igEdge(float x){return -.215+.016*sin(x*2.7+.3)+.008*sin(x*7.1+2.)+.005*(vn(vec2(x*20.,4.))-.5);}

// The conifer the adult feeds from (a story prop: dec 0): its trunk and its low branch, clad in hanging shoots of small scale leaves.
// tug pulls the branch's tip towards the head; after the twig breaks the branch springs back and shakes.
void igBranch(vec2 q,float t){
 vec3 tr=IG_TREE;
 float tug=ss(6.22,6.42,t)*(1.-ss(6.44,6.47,t));float sp=t>6.45?exp(-(t-6.45)*2.6)*cos((t-6.45)*TAU*1.5):0.;
 vec2 disp=vec2(-.010,-.028)*tug+vec2(.004,.030)*sp*ss(6.44,6.47,t);
 float shake=abs(sp)+tug;
 vec2 B0=vec2(tr.x-.01,.30),B2=vec2(.135,.215)+disp,B1=vec2(.34,.315)+disp*.4;
 if(q.x<B2.x-.07||q.x>tr.x+.06||q.y<-.30||q.y>1.40)return;
 vec2 uv;
 float dt=sdCap(q,tr.xy+vec2(0.,-.03),vec2(tr.x+.010,1.40),tr.z+.008*ss(.05,-.02,q.y-tr.y),tr.z*.45);dt=smin(dt,sdCap(q,tr.xy+vec2(0.,.01),tr.xy+vec2(-.05,-.005),.012,.004),.01);
 dt=max(dt,tr.y-.004-q.y);   // standing on the bank, its foot a little flared
 float db=igBend(q,B0,B1,B2,.011,.004,uv);
 // hanging shoots along the branch and a dense spray at its tip
 float df=9.;float fu=0.;
 for(int k=0;k<17;k++){float fk=float(k);float hk=h11(fk*3.7);float u=.08+fk*.055+.03*hk;vec2 a=mix(mix(B0,B1,u),mix(B1,B2,u),u);
  float sw=.004*sin(t*1.1+fk*1.7)+.012*shake*sin(t*13.+fk*2.3);float L=.028+.075*hk*hk+.030*step(.80,u);
  float sd=(h11(fk*1.3)-.6)*.020;vec2 c=a+vec2(sd+sw,-L),mm=mix(a,c,.5)+vec2(.006-sd*.3,.004);
  vec2 uv;float e=igBend(q,a,mm,c,.0055+.0025*hk,.0042,uv);e-=.0022*(.5+.5*sin(uv.x*L*900.+abs(uv.y)*2.));
  if(e<df){df=e;fu=uv.x;}}
 float d=min(min(dt,db),df);if(d>PX*4.)return;
 vec3 c=vec3(.19,.27,.16)*(.85+.3*vn(q*500.))*(1.12-.30*fu);
 if(min(dt,db)<df)c=vec3(.33,.27,.22)*(.80+.30*vn(vec2(q.x*600.,q.y*60.)));
 PIECE(d,c,min(dt,db)<df?K_BARK:K_PLANT,q*vec2(300.,60.),vec2(0,1),.006,.35,0.);
 // the shoots that fall when the branch springs back (6.45–7.9)
 for(int k=0;k<4;k++){float fk=float(k);float tt=t-6.47-fk*.12;if(tt<0.||tt>1.5)continue;
  vec2 p0=mix(B1,B2,.55+.12*fk)+vec2(.008*sin(tt*7.+fk),0.)-vec2(.010*tt,.12*tt*tt+.05*tt);
  veil(vec3(.22,.31,.18),ss(.006,.002,length((q-p0)*vec2(1.,1.8)))*ss(1.5,1.2,tt)*.9,0.);}}

void igBackdrop(vec2 q,float t){
 float topF=igForestTop(q.x,.014,.17,9.,5.),topN=igForestTop(q.x,.012,.10,15.,13.);
 if(q.y>-.01){
  // a grey-green overcast, the far forest and the nearer one in mist, the low dark far shore: one piece, its colour layered
  vec3 sk=mix(vec3(.78,.81,.76),vec3(.58,.64,.62),ss(.05,.75,q.y));sk=mix(sk,vec3(.50,.56,.56),ss(.7,1.3,q.y));
  float sg=exp(-length((q-vec2(-.80,.46))*vec2(1.,1.4))*2.6);sk=mix(sk,vec3(.97,.95,.86),sg*.55);   // the sun's glow through thin cloud
  float cl=fbm2(vec2(q.x*1.4+t*.003,q.y*5.));sk=mix(sk,vec3(.86,.88,.82),ss(.45,.75,cl)*ss(.08,.25,q.y)*.5);sk*=1.-.06*ss(.5,.8,fbm2(q*vec2(2.,6.)+5.))*ss(.15,.4,q.y);
  sk=mix(sk,mix(vec3(.60,.66,.62),vec3(.72,.76,.72),ss(.05,.20,q.y)),ss(PX,-PX,q.y-topF));
  sk=mix(sk,vec3(.42,.49,.42)*(1.-.10*ss(.4,.6,vn(vec2(q.x*80.,2.)))*ss(.04,.0,q.y-topN+.04)),ss(PX,-PX,q.y-topN));
  sk=mix(sk,vec3(.32,.37,.28),ss(.022,.012,q.y));
  PIECE(-1.,sk,K_SKY,q*2.+vec2(t*.004,0.),vec2(1,0),.1,0.,1.);
  veil(vec3(.78,.82,.78),ss(.10,.0,q.y)*.30,1.);
  for(int i=0;i<3;i++){vec4 cf=IG_CONIF[i];igConifer(q,cf.xy,cf.z,cf.w,float(i)+1.,t,.42+.08*float(i),.12);}
  for(int i=0;i<2;i++)igTreeFern(q,IG_TFERN[i],t,float(i)*3.+1.);}
 // the pool: the sky and the forest mirrored, darker towards us; slow rings
 float ye=igEdge(q.x);
 if(q.y<.025&&q.y>ye-.01){
  float wy=.012-(q.y-.012);vec2 rq=vec2(q.x+.002*sin(q.y*160.+t*1.1)*ss(.0,-.10,q.y),wy);
  float rF=igForestTop(rq.x,.014,.17,9.,5.),rN=igForestTop(rq.x,.012,.10,15.,13.);
  vec3 wc=mix(vec3(.72,.76,.72),vec3(.56,.62,.62),ss(.0,.5,rq.y));wc=mix(wc,vec3(.93,.91,.83),exp(-length((rq-vec2(-.80,.46))*vec2(1.,1.4))*2.6)*.45);
  wc=mix(wc,vec3(.58,.64,.60),ss(.004,-.004,rq.y-rF));wc=mix(wc,vec3(.38,.44,.37),ss(.004,-.004,rq.y-rN));
  for(int i=0;i<3;i++){vec4 cf=IG_CONIF[i];float dx=abs(rq.x-cf.x);wc=mix(wc,vec3(.40,.46,.40),ss(cf.w*.55,cf.w*.15,dx+.25*cf.w*max(0.,(rq.y-cf.y)/cf.z-.2))*step(rq.y,cf.y+cf.z)*.55);}
  for(int i=0;i<2;i++){vec4 f=IG_TFERN[i];float dx=abs(rq.x-f.x);wc=mix(wc,vec3(.40,.46,.38),ss(f.z*.5,f.z*.1,dx)*ss(f.y+f.z*1.15,f.y+f.z*.6,rq.y)*.5);}
  // the feeding tree's trunk, mirrored where the pool reaches it
  wc=mix(wc,vec3(.34,.33,.30),ss(.012,.004,abs(rq.x-IG_TREE.x))*.6);
  wc*=mix(1.,.74,ss(-.03,-.22,q.y));
  float rip=vn(vec2(q.x*30.,q.y*420.+t*.5));wc*=.97+.05*rip*ss(.0,-.15,q.y);
  {vec2 l=(q-vec2(-.30,-.11))/vec2(.09,.016);float u=fract(t*.21);wc*=1.+.07*ss(.12,.0,abs(length(l)-u*2.4))*(1.-u);}
  float dw=q.y-ye;
  PIECE(max(-dw,q.y-.012),wc,K_WATER,q*vec2(1.,10.)+vec2(t*.01,0.),vec2(1,0),.003,0.,1.);
  veil(vec3(.78,.82,.78),ss(-.12,.02,q.y)*.22*ss(-.05,.0,-dw),1.);}
 // the near bank: dark wet earth at the water's edge, fern litter and moss, three-toed prints
 float dg=q.y-ye;
 if(dg<.01){vec3 ga=mix(vec3(.27,.25,.21),vec3(.40,.37,.30),ss(-.02,-.22,dg));ga=mix(ga,vec3(.36,.34,.27),ss(-.3,-.9,q.y));
  float mo=fbm2(q*vec2(3.,8.)+2.);ga*=.90+.18*mo;ga=mix(ga,vec3(.30,.36,.21),ss(.55,.75,mo)*.45);
  ga=mix(ga,vec3(.42,.34,.24),ss(.62,.8,vn(q*vec2(40.,110.)))*.35);   // fern litter
  for(int i=0;i<5;i++){float fi=float(i);vec2 c=vec2(-.70+fi*.13+.02*sin(fi*2.),-.33-.03*mod(fi,2.));vec2 l=(q-c)/vec2(.036,.012);
   float pr=min(min(length(l)-.45,sdCap(l,vec2(0.),vec2(.9,.25),.18,.12)),min(sdCap(l,vec2(0.),vec2(1.,0.),.18,.12),sdCap(l,vec2(0.),vec2(.9,-.25),.18,.12)));
   ga*=1.-.28*ss(.12,-.05,pr)*ss(-.6,-.1,pr+.3);}
  PIECE(dg,ga,K_MUD,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);}
 for(int i=0;i<6;i++){vec3 c=IG_HORSE[i];igHorse(q,c.xy,c.z,t,float(i)*3.+1.,c.y>-.05?.45:0.);}
 // the low ferns of the far shore
 for(int r=0;r<2;r++){float fr=float(r);float y0=.008-fr*.006;float sc=.020+fr*.006;float cw=sc*2.4;float x=q.x/cw+fr*3.1;float ci=floor(x);
  if(h11(ci+fr*5.)<.45)continue;vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.4-fr*3.1)*cw,y0+(h11(ci+7.)-.5)*.008);
  igFerns(q,b,sc*1.5,t,5.,ci,vec3(.28,.40,.20),.45,1.15,1.);}
 igTreeFern(q,IG_TFERN[2],t,7.);
}

void igScene(vec2 q,float t,float grow){
 // one key light: a pale sun through thin cloud, high on the left and a little in front (the sky is brightest there); warm sunlit
 // planes, cool shade
 SUNL=normalize(vec3(-.45,.60,.62));SUNC=vec3(1.22,1.10,.90);AMBC=vec3(.44,.52,.55);BACK=0.;
 igBackdrop(q,t);
 IgPose pp[2];pp[0]=igPose(0,t);pp[1]=igPose(1,t);
 // their soft shadows on the bank, cast back and to the right (the ground seen at a low angle)
 if(q.y<igEdge(q.x)+.01)for(int i=0;i<2;i++){vec4 a=IG_A[i];vec2 l=(q-a.xy)/a.z;if(l.y<-.4||l.y>1.4||l.x<-8.||l.x>12.)continue;
  float hg=max(l.y,0.)/.16;float sd=igSil(vec2(a.w*(l.x-.70*hg),hg),pp[i]);
  shadow(ss(.40,-.40,sd)*ss(-.30,.05,l.y)*.50*ss(.01,-.01,q.y-igEdge(q.x)),vec3(.52,.56,.64),0.);}
 igBranch(q,t);
 igConifer(q,vec2(IG_TREE.x,-.40),1.75,.30,4.,t,0.,.45);   // the feeding tree's crown above the branch (decor)
 contact(q,IG_A[0].xy+vec2(.11,.0),.30,.45);contact(q,IG_TREE.xy+vec2(-.005,-.002),.07,.55);contact(q,IG_A[1].xy+vec2(-.04,.0),.12,.40);
 // the young's ferns (it nibbles them; a story prop)
 igFerns(q,vec2(.215,-.43),.065,t,7.,5.,vec3(.27,.40,.18),0.,1.25,0.);
 for(int i=0;i<2;i++)igSaur(q,IG_A[i],t,pp[i],grow,float(i));
 igFerns(q,vec2(.265,-.445),.045,t,6.,9.,vec3(.29,.42,.19),0.,1.1,0.);
 for(int i=0;i<5;i++){vec4 f=IG_FFERN[i];igFerns(q,f.xy,f.z,t,f.w,float(i)*4.+3.,vec3(.24,.37,.17),0.,1.15,1.);}
}
void igFossil(vec2 q){
 for(int i=0;i<2;i++){vec4 a=IG_A[i];float s=a.z;vec2 m=(q-a.xy)/s;m.x*=a.w;if(m.x<-7.6||m.x>5.3||m.y<-.3||m.y>6.6)continue;
  IgPose p=igPose(i,0.);vec2 S=igW(p,IG_SB);vec2 An=p.Fn+vec2(-.20,.50),Kn=knee(p.H,An,1.15,1.05,1.),En=knee(S,p.Wn,.82,.76,-1.);
  float hs=mix(1.15,1.50,float(i));vec2 h=rot(p.ha)*(m-p.C)/hs;float sk=9.;
  if(h.x>-.5&&h.x<1.35&&h.y>-.6&&h.y<.6){float f,bk;igHead(h,0.,f,bk);sk=max(min(f,bk),-sdEll(h-vec2(.16,.08),vec2(.07,.07)))*hs;}
  float d=igBones(m,p,sk,Kn,An,En);PIECE(d*s,vec3(.66,.60,.50),K_FOSSIL,m*.4,vec2(1,0),.05*s,.6,0.);}}

const vec2 WIN_C=vec2(.02,-.10);
float igWin(vec2 q){return length((q-WIN_C)*vec2(1.,1.15))-RFULL*ss(0.,.62,uLife);}
void fossil(vec2 q){if(uLife>.001&&igWin(q)<-.09)return;igFossil(q);}
void life(vec2 q,float t){if(uLife<.999&&igWin(q)>.09)return;igScene(q,t,GROW);}

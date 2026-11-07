// ---- Scene 7 (El pou del temps, CE37): Ankylosaurus magniventris at the edge of a forest clearing at Hell Creek (Montana, about 66.5
// million years ago), late in the afternoon: the sun low on the left behind the trees, shafts of light, ferns, cycads, a magnolia-like
// shrub in flower. The ankylosaur (about 7.5 m, facing left) browses low ferns; a hollow fallen log lies beside its tail, nearer to us.
// Times on the scene clock (uTau): 3.8–4.8 it turns its head towards the log (towards us); 4.8–5.3 its tail swings, and at 5.15 (the
// key) the club knocks the log: a hollow «bong»; 5.15–6.5 the log shivers, dry leaves slip off it, dust puffs out of its hollow end and
// settles; 6.5–8 it blinks and bobs its head; 9.6–10.4 the echo: a soft bird-like coo, the mouth shut, the throat pulsing twice
// (as the bird-like larynx of Pinacosaurus suggests). It never strikes another animal.
// Scale: .125 screen units per metre. Rig frame (metres): facing -x, the ground at y 0; on the screen it faces left.
const float AKS=.145,AK_HS=1.15;
const vec2 AK_POS=vec2(-.12,-.29);
const vec2 AK_C=vec2(-2.02,.98),AK_S=vec2(-1.08,.98),AK_H=vec2(.80,1.12),AK_R0=vec2(1.38,1.34); // head joint, shoulder, hip, tail root
// the tail club: at rest, wound up (away from us), on the log (swung towards us)
const vec2 AK_ER=vec2(3.85,.90),AK_EW=vec2(3.30,1.40),AK_ES=vec2(3.61,-.05);
// the log (screen): far end and near end (its hollow face towards us), with their radii
const vec3 AK_LF=vec3(.320,-.345,.044),AK_LN=vec3(.560,-.425,.060);
const vec4 AK_TRUNK[3]=vec4[](vec4(-.84,-.13,.060,0.),vec4(.86,-.12,.050,.05),vec4(-1.25,-.10,.045,.15)); // x, base, half width, haze
const vec4 AK_CONIF[2]=vec4[](vec4(-.20,-.075,.50,.085),vec4(.60,-.08,.58,.10));
const vec3 AK_CYCAD[3]=vec3[](vec3(.27,-.085,.085),vec3(-1.00,-.15,.15),vec3(.73,-.095,.13));
const vec4 AK_FFERN[8]=vec4[](vec4(-.80,-.40,.13,6.),vec4(-.40,-.37,.08,5.),vec4(.86,-.50,.22,6.),vec4(.09,-.58,.17,5.),vec4(-.84,-.56,.24,6.),
 vec4(.50,-.358,.05,4.),vec4(-.45,-1.05,.30,6.),vec4(.35,-1.15,.32,6.));
struct AkPose{float yaw,pitch,throat,chew,blink,bx,by,hx,hy,hl,hf,fl,ff,zc;vec2 E,M;};

float akTri3(vec2 p,vec2 a,vec2 b,vec2 c){vec2 e0=b-a,e1=c-b,e2=a-c,v0=p-a,v1=p-b,v2=p-c;
 vec2 pq0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),pq1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),pq2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));float sg=sign(e0.x*e2.y-e0.y*e2.x);
 vec2 d=min(min(vec2(dot(pq0,pq0),sg*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),sg*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),sg*(v2.x*e2.y-v2.y*e2.x)));
 return -sqrt(d.x)*sign(d.y);}
// A cheap curved tube: two tapered segments through the midpoint of the quadratic Bézier a, b, c; uv: along (0..1), across (-1..1).
float akBend(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc,out vec2 uv){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);
 float u1=segU(p,a,m),u2=segU(p,m,c);vec2 p1=mix(a,m,u1),p2=mix(m,c,u2);float r1=mix(ra,rm,u1),r2=mix(rm,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;bool f=d1<d2;vec2 pp=f?p1:p2;vec2 dir=f?m-a:c-m;float r=f?r1:r2;
 vec2 o=p-pp;uv=vec2(f?u1*.5:.5+u2*.5,(dir.x*o.y-dir.y*o.x)/length(dir)/max(r,1e-3));return smin(d1,d2,rm*.25);}
// Small rounded scales painted by the light (low contrast between them); su: one scale per unit.
float akScales(vec2 su){
 vec2 i=floor(su-.5);float a=8.,b=8.;vec2 oa=vec2(0.),ia=i;
 for(int k=0;k<4;k++){vec2 c=i+vec2(float(k&1),float(k>>1));vec2 o=su-(c+.22+.56*h22(c));float d=dot(o,o);
  if(d<a){b=a;a=d;ia=c;oa=o;}else if(d<b)b=d;}
 float r=sqrt(a),e=sqrt(b)-r;float hh=h21(ia);
 float dome=ss(.70,.10,r)*ss(.0,.25,e+.1);float lit=dot(oa,normalize(SUNL.xy))/max(r,.05)*ss(.0,.35,r)*dome;
 return 1.+.15*lit-.09*ss(.09,.0,e)+.05*(hh-.5);}
// The top line of the back (rig frame): the low dome of the body and the hips.
float akTop(float x){return max(1.23+.62*sqrt(max(0.,1.-pow((x+.10)/1.60,2.))),1.24+.48*sqrt(max(0.,1.-pow((x-.85)/.72,2.))));}
// The armour of the back, painted: transverse bands of oval osteoderms with a low keel along the body, smaller down the flank, and
// little ossicles between them. x: along the body (m); v: below the top line (m). plate: 1 on an osteoderm. Returns the shade.
float akOst(float x,float v,out float plate){
 float sp=.34;float fi=max(floor((x+1.40)/sp+.5),0.);float xc=-1.40+fi*sp;float off=mod(fi,2.)*.10;
 float vj=max(floor((v-.10-off)/.22+.5),0.);float vc=.10+off+vj*.22;float sz=1.-.12*vj;
 if(x<-1.33){xc=x<-1.61?-1.74:-1.48;sz=1.15;vj=max(floor((v-.12)/.26+.5),0.);vc=.12+vj*.26;} // the two half-rings over the neck
 vec2 o=vec2(x-xc,v-vc)/(vec2(.155,.10)*sz);float r=length(o);
 plate=ss(1.05,.85,r)*ss(1.2,.9,v);
 vec2 os=vec2(o.x,-o.y);float lit=dot(os/max(r,.05),normalize(SUNL.xy))*ss(.0,.7,r);
 float keel=ss(.30,.0,abs(o.y+.05))*ss(1.,.3,abs(o.x));
 float sh=1.+plate*(.13*lit+.12*keel-.08*ss(.1,.6,o.y))-.17*ss(.80,1.0,r)*ss(1.25,1.0,r)*(.5+.5*sat(o.y+.3))*ss(1.2,.9,v);
 sh*=1.+plate*.22*(h21(vec2(fi,vj)+3.)-.5);
 return sh*mix(akScales(vec2(x,v)*16.)*1.06,1.,plate);}
// How a rounded form under the skin (the barrel of the trunk, a thigh, a shoulder) turns to the light: a smooth low dome over the ellipse
// ax (in the frame M, v from its centre), against a flat surface. Its slope fades to nothing at the rim: no line, no terminator edge.
float akDome(vec2 v,mat2 M,vec2 ax){vec2 l=M*v/ax;float r2=dot(l,l);if(r2>1.)return 0.;
 vec2 g=(-1.2*(1.-r2)*l/ax)*M;return lambert(normalize(vec3(-g,1.)))-lambert(vec3(0.,0.,1.));}
// ---- The head, in its own frame h (metres, forward -x, the head joint at 0) ----
void akHead(vec2 h,float chew,float throat,out float dFace,out float dArm,out float dTh){
 float d=min(akTri3(h,vec2(.02,.22),vec2(-.60,.08),vec2(-.70,-.14)),akTri3(h,vec2(.02,.22),vec2(-.70,-.14),vec2(-.04,-.20)))-.06; // the flat armoured roof of the skull, sloping down to the snout
 vec2 jh=h-vec2(0.,-.02*chew);float jaw=sdCap(jh,vec2(-.10,-.17),vec2(-.56,-.19),.11,.08);
 dFace=smin(d,jaw,.06);
 dTh=sdEll(h-vec2(.02,-.28-.10*throat),vec2(.27+.06*throat,.11+.14*throat));
 // the horns at the back corners of the skull (squamosal: back and up; quadratojugal: down and back), the armour over the eye, the
 // short broad beak
 float hn=akTri3(h,vec2(-.10,.17),vec2(.04,.22),vec2(.18,.21))-.025;
 dArm=hn;dFace=smin(dFace,akTri3(h,vec2(-.20,-.12),vec2(-.02,-.08),vec2(.07,-.27))-.03,.03);}
float akSkull(vec2 h){if(h.x<-.95||h.x>.45||h.y<-.55||h.y>.5)return 9.;float a,b,c;akHead(h,0.,0.,a,b,c);
 a=max(a,-sdEll(h-vec2(-.36,.06),vec2(.08,.07)));a=max(a,-sdEll(h-vec2(-.62,-.01),vec2(.06,.045)));a=max(a,-sdEll(h-vec2(-.12,-.02),vec2(.07,.09)));
 return min(a,b);}
// The bones in the rig frame: skull, spine, ribs, shoulder blade, the long low ilium, the limbs, the tail with its stiff handle and the
// knob of the club; and the osteoderms lying in place over the back (as in the best skeletons).
float akBones(vec2 m,float sk,vec2 S,vec2 E,vec2 W,vec2 Ff,vec2 H,vec2 K,vec2 A,vec2 Fh,vec2 C,vec2 M,vec2 Ec){
 float d=sk;vec2 uv;
 d=min(d,akBend(m,C+vec2(.12,.04),vec2(-1.5,1.32),vec2(-.9,1.58),.08,.08,uv));
 d=min(d,akBend(m,vec2(-.9,1.58),vec2(.0,1.78),vec2(.9,1.64),.09,.09,uv));
 d=min(d,akBend(m,vec2(.9,1.64),M,Ec,.08,.04,uv));
 for(int i=0;i<8;i++){float x=-.8+float(i)*.24;float y=mix(1.58,1.74,ss(-.9,0.,x));d=min(d,sdSeg(m,vec2(x,y),vec2(x+.03,y+.13))-.03);}
 for(int i=0;i<7;i++){float x=-.95+float(i)*.27;float y=mix(1.55,1.72,ss(-.9,0.,x));vec2 a=vec2(x,y-.05),b=vec2(x-.28,y-.50),c=vec2(x-.12,.80);
  d=min(d,min(sdSeg(m,a,b),sdSeg(m,b,c))-.045);}
 d=min(d,sdCap(m,vec2(-.72,1.45),S+vec2(.05,.05),.13,.10));
 d=min(d,sdEll(m-vec2(.72,1.58),vec2(.78,.15)));d=min(d,sdCap(m,vec2(.82,1.42),vec2(1.12,.90),.07,.05));
 d=min(d,sdEll(m-Ec,vec2(.24,.17)));
 // the osteoderms, in their bands
 if(m.x>-1.95&&m.x<1.75&&m.y>.75){float yt=akTop(m.x);
  if(m.x<-1.33)yt=mix(1.36,1.62,sat((m.x+2.02)/.75));float pl;akOst(m.x,yt-m.y,pl);d=min(d,(.9-pl)*.12);}
 d=min(d,sdCap(m,H,K,.13,.10));d=min(d,sdCap(m,K,A,.10,.08));d=min(d,sdCap(m,A,Fh+vec2(-.20,.05),.07,.05));
 d=min(d,sdCap(m,S,E,.12,.09));d=min(d,sdCap(m,E,W,.09,.07));d=min(d,sdCap(m,W,Ff+vec2(-.16,.05),.06,.05));
 return d;}

// ---- The ankylosaur ----
void akAnk(vec2 q,float t,AkPose p,float grow){
 float s=AKS;vec2 m=(q-AK_POS)/s;
 if(m.x<-3.4||m.x>5.4||m.y<-.75||m.y>2.25)return;
 float br=sin(t*1.1);
 vec2 offF=vec2(p.bx,p.by),offH=vec2(p.hx,p.hy);
 vec2 S=AK_S+offF,H=AK_H+offH,C=AK_C+offF+vec2(0.,.010*br),R0=AK_R0+offH;
 // the head frame: turned down by pitch, then towards us by yaw (the head looks shorter, its snout a little lower)
 vec2 h=rot(p.pitch)*(m-C)/AK_HS;float cy=cos(p.yaw);h.x/=cy;h.y-=.30*sin(p.yaw)*h.x;
 bool nearH=h.x>-.95&&h.x<.45&&h.y>-.62&&h.y<.5;
 // feet planted (IK legs); the far feet a step apart and a little higher (further away)
 vec2 Ff=vec2(AK_S.x-.12-p.ff,p.fl),Fh=vec2(AK_H.x+.02-p.hf,p.hl);
 vec2 W=Ff+vec2(.0,.26),A=Fh+vec2(.06,.27);
 vec2 E=knee(S,W,.44,.40,1.),K=knee(H,A,.56,.50,-1.);
 vec2 dy=vec2(0.,.10);vec2 Ff2=vec2(AK_S.x+.22,0.)+dy,Fh2=vec2(AK_H.x-.28,0.)+dy;vec2 W2=Ff2+vec2(.0,.26),A2=Fh2+vec2(.06,.27);
 vec2 S2=S+vec2(.12,.08),H2=H+vec2(.10,.06);vec2 E2=knee(S2,W2,.44,.40,1.),K2=knee(H2,A2,.56,.50,-1.);
 float G=grow/s;bool needB=G<1.1;
 float inPX=4.*PX/s,cover=-2.*PX/s;
 // ---- distances ----
 float dFar=smin(sdCap(m,S2,E2,.28,.21),sdCap(m,E2,W2,.21,.16),.06);dFar=smin(dFar,sdBox(m-Ff2-vec2(-.03,.12),vec2(.13,.09))-.06,.06);
 {float e=smin(sdCap(m,H2+vec2(-.04,-.12),K2,.40,.25),sdCap(m,K2,A2,.25,.18),.08);e=smin(e,sdBox(m-Fh2-vec2(-.04,.12),vec2(.16,.09))-.07,.06);dFar=min(dFar,e);}
 vec2 mb=m-mix(offH,offF,ss(1.2,-1.0,m.x));
 float dTor=sdEll(mb-vec2(-.10,1.23),vec2(1.60,.62+.012*br)),dHip=sdEll(mb-vec2(.85,1.24),vec2(.72,.48)),dCh=sdEll(mb-vec2(-1.20,1.04),vec2(.55,.48));
 float d0=smin(smin(dTor,dHip,.25),dCh,.25);
 // the top line, for the armour; the osteoderms stand out along it
 float yt=akTop(mb.x);
 float xr=mb.x+1.40;float bump=.06*pow(max(0.,1.-pow((fract(xr/.34+.5)-.5)*.34/.15,2.)),.7);
 d0-=bump*ss(.30,.0,yt-mb.y)*step(-1.35,mb.x)*step(mb.x,1.60);
 // the short thick neck with its two half-rings of armour
 float dN=sdCap(m,S+vec2(-.30,.22),C+vec2(.05,.0),.52,.42);
 {float nx=m.x-C.x;float nb=.07*max(max(0.,1.-pow((m.x-(C.x+.28))/.12,2.)),max(0.,1.-pow((m.x-(C.x+.54))/.12,2.)));dN-=nb*ss(-.1,.3,m.y-C.y-.25)*step(0.,nx);}
 d0=smin(d0,dN,.20);
 // the tail: thick at the root, the stiff narrow handle, the club (nearer and bigger when it swings towards us)
 vec2 tuv;float dT=akBend(m,R0,p.M,p.E,.46,.15*p.zc,tuv);float dBody=d0;d0=smin(d0,dT,.25);
 float dThg=smin(sdEll(rot(-.20)*(m-mix(H,K,.42)-vec2(.04,.0)),vec2(.46,.64)),sdCap(m,H,K,.44,.30),.10);
 float dUa=smin(sdEll(rot(.25)*(m-S-vec2(.04,-.08)),vec2(.34,.44)),sdCap(m,S,E,.32,.24),.10);
 float dFace=9.,dArm=9.,dTh=9.;
 if(nearH){akHead(h,p.chew,p.throat,dFace,dArm,dTh);float hk=cy*AK_HS;dFace*=hk;dArm*=hk;dTh*=hk;}
 // the club: the big lateral knob towards us, the far one, the small knobs at the tip
 vec2 tg=normalize(p.E-p.M);vec2 cl=m-p.E;float z=p.zc;
 float dClub=sdEll(vec2(dot(cl,tg),dot(cl,vec2(-tg.y,tg.x))),vec2(.34,.24)*z);
 float kn=length(cl-vec2(.02,-.03)*z)-.22*z,kf=length(cl-(-tg*.07+vec2(0.,.11))*z)-.17*z,kt=length(cl-tg*.29*z)-.11*z;
 dClub=smin(min(dClub,min(kn,kf)),kt,.04);
 // the armour that stands out: the keeled lateral osteoderms along the lower flank and the neck, and down the sides of the tail
 float dSp=9.;vec2 spl=vec2(0.);
 if(m.y>.30&&m.y<1.45&&m.x>-2.1&&m.x<1.6){for(int i=0;i<10;i++){float fi=float(i);float x=i<2?C.x+.30+.26*fi:-1.30+(fi-2.)*.38;
   float y=i<2?C.y-.12:.86-.10*pow(x/1.7,2.)+(x>.5?offH.y:offF.y);float sz=i<2?1.15:mix(1.,.80,abs(fi-5.)/4.);vec2 b=vec2(x+(i<2?0.:mix(offF.x,offH.x,ss(-1.,1.,x))),y);
   float e=akTri3(m,b+vec2(-.12,.04)*sz,b+vec2(.11,.04)*sz,b+vec2(.07,-.17)*sz)-.025;if(e<dSp){dSp=e;spl=(m-b)/sz;}}}
 if(dT<.3){for(int i=0;i<6;i++){float u=.20+.11*float(i);vec2 a=mix(mix(R0,p.M,u),mix(p.M,p.E,u),u),tn=normalize(mix(p.M-R0,p.E-p.M,u));vec2 nn=vec2(tn.y,-tn.x);
   float sz=mix(.9,.55,u)*mix(1.,p.zc,u);vec2 b=a+nn*mix(.30,.13,u)*.55;float e=akTri3(m,b-tn*.11*sz,b+tn*.09*sz,b+(tn*.16+nn*.12)*sz)-.015;if(e<dSp){dSp=e;spl=vec2(dot(m-b,tn),dot(m-b,-nn))/sz;}}}
 float dB=-1.;
 float dHind0=sdCap(m,K,A,.30,.25),dFore0=sdCap(m,E,W,.26,.22);
 if(needB&&min(min(min(d0,dThg),min(dUa,dFar)),min(min(dHind0,dFore0),min(dFace,min(dArm,dClub))))>.05)needB=false;
 if(needB)dB=akBones(m,nearH?akSkull(h)*cy*AK_HS:9.,S,E,W,Ff,H,K,A,Fh,C,p.M,p.E);
 float dUp=smin(smin(d0,dThg,.10),dUa,.10);
 float dHind=smin(dHind0,sdBox(m-Fh-vec2(-.04,.12),vec2(.17,.09))-.07,.06);
 float dFore=smin(dFore0,sdBox(m-Ff-vec2(-.03,.12),vec2(.14,.09))-.06,.06);
 // the whole body with the near legs as one smooth piece: its dark contour is the outer silhouette only
 float d=smin(dUp,dTh,.10);d=smin(d,dHind,.06);d=smin(d,dFore,.06);
 if(needB){dFar=max(dFar,dB-G);d=max(d,dB-G);dFace=max(dFace,dB-G);dArm=max(dArm,dB-G);dClub=max(dClub,dB-G);dSp=max(dSp,dB-G);}
 float front=min(dFace,dArm);
 vec2 gD=vec2(dFdx(d),dFdy(d));gD/=max(length(gD),1e-6);
 // ---- painting, back to front ----
 if(needB&&grow<.5)PIECE(dB*s,vec3(.86,.82,.72),K_BONE,m*.4,vec2(1,0),.06*s,.8,0.);
 // living colours: a dark reddish brown along the back, warm tan flanks, pale buff below (countershading, as in Borealopelta); the
 // armour sheathed in darker keratin
 vec3 back=vec3(.38,.28,.20),flank=vec3(.56,.42,.29),belly=vec3(.72,.63,.49),ker=vec3(.30,.26,.22);
 float lm=ss(.05,-.10,min(dHind,dFore)-dUp);
// (0.44.7) The skin's own fine texture (K_SKIN) used to be turned off by giving it coordinates at ×900, so that its features were far
// finer than a pixel and faded out. On an NVIDIA card under Windows that fade did not happen: the hash of such large numbers broke
// into lines along the axes over the whole animal (Marc's screen, 0.31–0.44.6; the emulated cards here never showed it). Now the
// pieces take K_SMOOTH with constant coordinates: no texture at all, and a soft satin sheen of the skin.
 if(dFar<inPX&&min(d,front)>cover)PIECE(dFar*s,mix(flank,back,.5)*.55*akScales(m*16.),K_SMOOTH,vec2(0.),vec2(1,0),.18*s,1.,0.);
 if(d<inPX&&front>cover){
  float cs=ss(.75,1.55,mb.y+.20*ss(.5,-1.5,mb.x));vec3 alb=cs<.5?mix(belly,flank,cs*2.):mix(flank,back,cs*2.-1.);
  // the skin: the armour of the back; bigger scales on the lower flank, smaller on the limbs (cross-faded); the tail its own
  // (each pattern cross-faded into the next: the tail's into the body's, the neck's half-rings into the back's bands, the armour into
  // the scales of the lower flank and the limbs)
  float pl=0.,sh=0.,wt=ss(.08,-.08,dT-dBody);
  if(wt>.01){ // the tail: a row of small keeled plates along its top, small scales below
   float r=tuv.x;vec2 o=vec2(fract(r*9.)-.5,(tuv.y-.62)*2.2);float rr=length(o*vec2(2.,1.));float pt=ss(1.,.8,rr);
   sh+=wt*((1.+pt*(.18*dot(normalize(vec2(o.x,-o.y)+1e-4),normalize(SUNL.xy))+.15*ss(.3,.0,abs(o.y))))*mix(akScales(vec2(r*40.,tuv.y*3.)),1.,pt)-.2*ss(.8,1.,rr)*ss(1.3,1.,rr));pl+=wt*pt;}
  if(wt<.99){float wa=ss(.62,.80,mb.y)*(1.-lm),wn=ss(.62,.78,m.x-C.x);
   for(int k=0;k<2;k++){float w=wa*(1.-wt)*(k==0?1.-wn:wn);if(w<.01)continue;
    float ox=k==0?m.x-C.x+AK_C.x:mb.x,ov=k==0?mix(1.36,1.62,sat((m.x-C.x)/.75))+C.y-AK_C.y-m.y:yt-mb.y;float pa;sh+=w*akOst(ox,ov,pa);pl+=pa*w;}
   if(wa<.99)sh+=(1.-wa)*(1.-wt)*akScales(m*mix(11.,16.,lm));}
  alb=mix(alb,mix(ker,ker*1.5,ss(-.2,.5,mb.y-yt+.4)),pl*.55)*sh;
  // the limbs mid-toned, darker towards the feet; the belly and the underside in their shade
  alb=mix(alb,mix(flank,back,.45)*.95*sh,lm);alb*=mix(.80,1.,ss(.0,.7,m.y));
  alb*=mix(.76,1.,max(ss(.55,1.10,mb.y),lm));
  alb=mix(alb,mix(belly,back,.25)*1.06,ss(.04,-.06,dTh)*p.throat*.7); // the throat swells, its stretched skin a little paler
  // skin folds: where the neck meets the shoulder, at the groin, behind the elbow; the head's soft shadow on the neck
  alb*=1.-.15*ss(.5,.9,sin(length(m-C)*22.))*ss(1.1,.5,length(m-C))*step(C.x+.1,m.x)*step(m.y,C.y+.3);
  vec2 cT=mix(H,K,.42)+vec2(.04,0.);vec2 lT=rot(-.20)*(m-cT);
  float fo=ss(.05,.0,abs(sdEll(lT,vec2(.46,.64))+.04))*ss(-.22,-.38,lT.x)*ss(-.05,-.22,lT.y)*ss(-.66,-.45,lT.y);
  {vec2 ua=normalize(E-S),pu=vec2(-ua.y,ua.x);fo+=ss(.035,.0,sdSeg(m,E+pu*.24-ua*.18,E+pu*.20+ua*.02))*.8;}
  alb*=1.-.22*sat(fo)*ss(.0,-.06,d);
  // the forms under the skin: the low barrel of the trunk, the thigh, the shoulder
  alb*=1.+.60*akDome(mb-vec2(-.10,1.15),mat2(1.),vec2(1.75,.70))+.9*akDome(m-cT,rot(-.20),vec2(.50,.68))+.6*akDome(m-S-vec2(.04,-.08),rot(.25),vec2(.38,.48));
  // the warm rim where the body turns towards the low sun, a softer warm line along the top
  float rk=(1.-lm)*ss(-.10,.08,dTh-dUp);
  float rimk=ss(-.25,0.,d)*sat(dot(gD,normalize(SUNL.xy)));alb=mix(alb,alb*1.45+vec3(.05,.03,0.),rimk*.45*rk);
  alb=mix(alb,alb*1.25+vec3(.04,.03,.01),ss(-.18,.0,d)*sat(gD.y*1.3-.2)*.30*rk);
  // roundness: about the local half-thickness (the low body, the tapering tail, the short thick legs, the throat)
  float Rb=mix(.60,max(.85*mix(.46,.15*p.zc,sat(tuv.x)),.06),ss(.10,-.10,dT-dBody));
  float Rl=mix(.20,.32,ss(.05,-.15,dThg)*ss(-.05,.05,dHind-dThg));Rl=mix(Rl,.26,ss(.05,-.15,dUa)*ss(-.05,.05,dFore-dUa));
  Rb=mix(Rb,Rl,ss(.05,-.10,min(min(dHind,dFore),min(dUa,dThg))-d0));Rb=mix(Rb,.12,ss(.08,-.08,dTh-dUp));
  PIECE(d*s,alb,K_SMOOTH,vec2(0.),vec2(1,0),Rb*s,1.,0.);}
 // the keeled lateral osteoderms
 if(dSp<inPX&&front>cover){float kl=ss(.06,.0,abs(spl.x*.95+spl.y*.30-.0))*ss(-.25,.0,spl.y);vec3 sc=mix(back,ker,.25)*(1.05+.40*kl)*mix(1.,.72,ss(.0,-.15,spl.y));
  PIECE(dSp*s,sc,K_PLATE,m*.3,vec2(0,-1),.07*s,.5,0.);}
 // the club
 if(dClub<inPX){float side=step(kn,min(kf,kt));vec2 kc=(cl-vec2(.02,-.03)*z)/(.22*z);vec3 cc=mix(back,ker,.4)*mix(.85,1.05,side);
  cc*=1.+side*(.30*sat(dot(kc,normalize(SUNL.xy)))-.15*ss(.80,1.,length(kc)))-.08*ss(.03,.0,min(abs(kf),abs(kt)));
  PIECE(dClub*s,cc,K_PLATE,(m-p.E)*1.6,vec2(1,0),.14*s*p.zc,1.,0.);}
 // the blunt hoof-like nails of the near feet
 if(m.y<.25){float nails=9.;for(int i=0;i<3;i++){float fi=float(i);nails=min(nails,min(sdEll(rot(.25-.18*fi)*(m-Fh-vec2(-.27+fi*.10,.045)),vec2(.075,.050)),sdEll(rot(.25-.18*fi)*(m-Ff-vec2(-.22+fi*.085,.045)),vec2(.065,.045))));}
  if(needB)nails=max(nails,dB-G);PIECE(nails*s,vec3(.30,.26,.22),K_HORN,m*6.,vec2(0,1),.035*s,.6,0.);}
 if(!nearH)return;
 // the head: its roof of small polygonal armour plates (caputegulae), its cheeks in small scales; the horns and the beak (keratin)
 if(dFace<inPX&&dArm>cover){vec3 fa=mix(back,mix(back,belly,.45),ss(-.10,-.30,h.y));fa=mix(fa,ker,ss(.06,.20,h.y)*.45);
  fa*=mix(akScales(h*16.),akScales(h*9.+3.)*1.04,ss(.02,.12,h.y));
  fa=mix(fa,ker*.85,ss(-.58,-.68,h.x)*.8);                                  // the broad keratin beak
  fa*=1.-.30*ss(.025,.0,abs(h.y+.135))*step(h.x,-.20);                         // the line of the closed mouth
  fa*=1.+.18*ss(.35,.0,abs(length((h-vec2(-.35,.10))/vec2(.13,.07))-1.))*step(.10,h.y)-.15*ss(.10,.02,length((h-vec2(-.36,.04))/vec2(1.,.8))); // the armoured brow over the eye, the eye's socket
  PIECE(dFace*s,fa,K_SMOOTH,vec2(0.),vec2(1,0),.30*s,1.,0.);}
 if(dArm<inPX){vec3 ac=mix(back*.72,ker*.62,ss(.0,.20,length(h-vec2(-.07,.0))-.12));
  PIECE(dArm*s,ac,K_HORN,h*5.,normalize(vec2(.7,.5)),.04*s,1.,0.);}
 if(grow>.3){
  // the nostril (big, at the side of the snout), the eye in the shade of its armoured brow
  vec2 ec=vec2(-.36,.06);
  shadow(ss(.02,-.02,sdEll(h-vec2(-.60,.0),vec2(.06,.04))*cy)*.6,vec3(.30,.25,.22),0.);
  shadow(ss(.16,.0,length((h-ec-vec2(.0,.04))/vec2(1.,.6)))*.35,vec3(.55,.45,.40),0.);
  vec2 ecS=vec2(ec.x*cy,ec.y+.30*sin(p.yaw)*ec.x)*AK_HS;vec2 ecL=C+rot(-p.pitch)*ecS;
  eyeA(q,AK_POS+ecL*s,.065*s,vec3(.40,.26,.12),mix(back,ker,.4),p.blink,0.);}
}

// A simple silhouette of the ankylosaur (rig frame), for its shadow on the ground.
float akSil(vec2 m,AkPose p){vec2 S=AK_S+vec2(p.bx,p.by),H=AK_H+vec2(p.hx,p.hy),C=AK_C+vec2(p.bx,p.by);
 float d=smin(sdEll(m-vec2(-.10,1.23),vec2(1.65,.66)),sdEll(m-vec2(.85,1.24),vec2(.72,.50)),.25);vec2 uv;
 d=min(d,akBend(m,AK_R0,p.M,p.E,.46,.20,uv));d=min(d,sdCap(m,S+vec2(-.30,.22),C+vec2(-.30,-.05),.50,.38));
 d=min(d,min(sdCap(m,H,vec2(AK_H.x,0.),.38,.24),sdCap(m,S,vec2(AK_S.x-.12,0.),.30,.22)));return d;}

// ---- The forest edge at Hell Creek, late afternoon (decor) ----
float akFernD(vec2 q,vec2 b,float ang,float len,float bend,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012*len/.1);return max(d,max(-l.y,l.y-len));}
void akFerns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float lit){
 if(abs(q.x-base.x)>sc*1.3||q.y<base.y-.01||q.y>base.y+sc*1.15)return;
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<7;i++){if(float(i)>=n)break;float fi=float(i);
  float ang=(-1.15+2.3*fi/(n-1.))+.05*sin(t*.9+fi+seed)+.02*sin(t*2.3+fi*2.);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;float e=akFernD(q,base,ang,len,.35*sign(ang+.01),fu);
  if(e<d){d=e;u=fu;ci=fi;}}
 if(d>PX*4.)return;
 vec3 c=col*(.82+.34*h11(ci*3.+seed));c=mix(c,c*vec3(1.30,1.22,.80),lit*ss(.2,1.,u.x)); // the tips catch the low sun
 PIECE(d,c,K_PLANT,u*vec2(1.,6.),vec2(0,1),.004,.5,1.);}
void akCycad(vec2 q,vec2 b,float sc,float t,float seed,float haze){
 if(abs(q.x-b.x)>sc*1.3||q.y<b.y-.01||q.y>b.y+sc*1.45)return;
 vec3 hz=vec3(.80,.74,.56);
 float th=sc*.50;float dT=sdCap(q,b,b+vec2(0.,th),sc*.15,sc*.12);
 float rings=ss(.3,.0,abs(fract((q.y-b.y)/sc*14.)-.5))*.25;
 PIECE(dT,mix(vec3(.34,.27,.19)*(1.-rings),hz,haze),K_BARK,(q-b)/sc*vec2(3.,1.),vec2(0,1),sc*.08,.6,1.);
 vec2 top=b+vec2(0.,th);float dl=9.;vec2 lu=vec2(0.);float li=0.;
 for(int i=0;i<9;i++){float fi=float(i);float a=-1.45+2.9*fi/8.+.035*sin(t*.8+fi*1.3+seed);float len=sc*(.60+.22*h11(fi+seed))*(1.-.25*abs(fi-4.)/4.);
  vec2 l=rot(a)*(q-top);float x=l.y/len;if(x<-.05||x>1.05)continue;float y=l.x-.55*sign(a+.01)*x*x*len*abs(a)/1.45;
  float w=.17*len*sin(PI*sat(x*.95+.05))*(1.-.35*x);float pin=abs(fract(x*14.)-.5)-.38;
  float d=max(abs(y)-w,pin*len/14.);d=min(d,abs(y)-.0012);d=max(d,max(-l.y,l.y-len));
  if(d<dl){dl=d;lu=vec2(x,y/len*6.);li=fi;}}
 if(dl<PX*4.){vec3 c=vec3(.24,.34,.14)*(.85+.3*h11(li*2.+seed));c=mix(c,c*vec3(1.3,1.22,.8),lu.x*.45*step(0.,-sign(lu.y))+.15);
  PIECE(dl,mix(c,hz,haze),K_PLANT,lu,vec2(0,1),.003,.5,1.);}
 PIECE(sdEll(q-top-vec2(0.,sc*.04),vec2(sc*.10,sc*.08)),mix(vec3(.55,.42,.22),hz,haze),K_PLANT,(q-top)*40.,vec2(0,1),.004,.5,1.);}
// A magnolia-like shrub (the early flowering trees and shrubs of Hell Creek): a mound of big glossy leaves with large cream flowers.
void akMagnolia(vec2 q,vec2 b,float sc,float t){
 if(abs(q.x-b.x)>sc*1.3||q.y<b.y-.01||q.y>b.y+sc*1.5)return;
 vec2 l=(q-b)/sc;
 float d=9.;for(int i=0;i<6;i++){float fi=float(i);float sw=.02*sin(t*.8+fi*1.7);vec2 c=vec2(-.72+.29*fi+sw,.42+.48*h11(fi+4.)*(1.-abs(fi-2.5)/3.));
  d=smin(d,length(l-c)-.32-.12*h11(fi*3.+1.),.12);}
 d=max(d,-l.y-.02);
 // the edge broken into big pointed leaves
 vec2 id;vec3 v=voro(l*vec2(5.,6.)+2.,id);d+=.06*ss(.0,.5,v.x)-.03;
 if(d*sc>PX*4.)return;
 vec3 c=vec3(.18,.28,.12)*(.78+.45*h21(id));c*=mix(.78,1.,ss(.0,.10,v.y-v.x))*mix(.85,1.08,ss(.6,.0,v.x));
 c*=mix(.60,1.25,ss(.1,1.1,l.y-.3*l.x));c=mix(c,vec3(.58,.56,.28),ss(-.10,.0,d)*ss(.2,.9,l.y)*ss(.3,-.6,l.x)*.45); // lit on top and towards the sun
 PIECE(d*sc,c,K_LEAF,l*2.,normalize(h22(id)-.5),sc*.30,.35,1.);
 // the flowers: big cream cups of thick tepals with a faint pink flush at the base, opening and closing slowly
 vec2 fg=l*vec2(1.9,2.1)+3.;vec2 fid=floor(fg);vec2 fc=fract(fg)-.5-(h22(fid)-.5)*.30;
 if(h21(fid*1.3)>.50&&d<-.08){float op=.85+.15*sin(t*.35+h21(fid)*6.);float r=.30*op;
  float fd=min(sdEll(rot(.45)*(fc-vec2(-.08,.05)),vec2(r*.42,r)),sdEll(rot(-.45)*(fc-vec2(.08,.05)),vec2(r*.42,r)));fd=min(fd,sdEll(fc-vec2(0.,.08),vec2(r*.40,r*.95)));
  vec3 fcol=mix(vec3(.97,.93,.84),vec3(.88,.70,.66),ss(.05,-.12,fc.y)*.5);fcol*=1.-.12*ss(.0,.05,abs(fc.x)-.02)*ss(.0,.2,fc.y);
  PIECE(fd*sc/1.9,fcol,K_SMOOTH,fc*3.,vec2(0,1),.004,.15,1.);}}
// A far forest seen through the haze: tall conifers and round crowns.
float akForestTop(float qx,float base,float hgt,float fr,float seed){
 float x=qx*fr+seed,ci=floor(x),fx=fract(x);float top=-1.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);float hh=h11(cj+seed);float cx=float(j)+.5+(h11(cj*1.7)-.5)*.5;
  float tall=hgt*(.55+.6*hh);float con=step(.50,h11(cj+9.));
  float yy=con>.5?base+tall-abs(fx-cx)/fr*4.5*(1.+.25*sin((fx-cx)*60.)):base+tall*.75*sqrt(max(0.,1.-pow((fx-cx)/.8,2.)))+.012*vn(vec2(qx*60.,cj));top=max(top,yy);}
 return top+.004*(vn(vec2(qx*120.,1.))-.5);}
// A tall conifer (like the dawn redwoods and swamp cypresses of Hell Creek): drooping sprays, lit on top, sky between them.
void akConifer(vec2 q,vec2 b,float h,float w,float seed,float t,float haze){
 if(abs(q.x-b.x)>w*1.4||q.y<b.y-.01||q.y>b.y+h*1.03)return;
 vec3 hz=vec3(.84,.76,.56);
 float y=(q.y-b.y)/h;float x=q.x-b.x;float sg=x<0.?-1.:1.;
 float tr=abs(x-.004*h*y*sin(t*.4+seed))-h*.010*(1.3-y);tr=max(tr,q.y-b.y-h*.97);
 float d=9.,ft=0.;
 for(int j=0;j<3;j++){float ti=floor(y*14.+(sg>0.?.5:0.))+float(j)-1.;float yc=(ti+(sg>0.?.5:0.))/14.;if(yc<.10||yc>.97)continue;
  float hh=h11(ti*2.+sg+seed*7.);float wi=w*(pow(sat(1.-yc),.8)*(.55+.6*hh)+.12);float sw=.006*h*yc*sin(t*.7+ti*1.3+seed+sg);
  vec2 a=vec2(0.,yc*h),tip=vec2(sg*wi+sw,yc*h-(.05+.05*hh)*h*(1.-.4*yc));vec2 mid=mix(a,tip,.5)+vec2(0.,.02*h);
  vec2 p=vec2(x,y*h);float th=.052*h*(1.-.45*yc);vec2 uv;
  float e=akBend(p,a,mid,tip,th,.012*h,uv)-.012*h*(vn(vec2(x*120./h,ti+sg))-.4)-.006*h*(vn(vec2(x*400./h,y*300.))-.5);
  if(e<d){d=e;ft=(p.y-mix(a.y,tip.y,sat(abs(x)/wi)))/th;}}
 d=min(d,max(abs(x)-h*.012,y-1.02));
 float dd=min(d,tr);if(dd>PX*4.)return;
 vec3 c=vec3(.16,.22,.12)*(.85+.3*vn(vec2(x*160./h,y*90.)));
 c*=mix(.65,1.15,ss(-.8,.8,ft));c=mix(c,vec3(.60,.52,.26),ss(-.008,.0,d)*ss(.2,-.6,x/w)*.45);
 c=mix(c,vec3(.24,.18,.14),step(tr,d));
 PIECE(dd,mix(c,hz,haze),K_PLANT,vec2(x*80.,y*30.),vec2(0,-1),.003,.10,1.);}
// The canopy overhead: clumps of foliage hanging into the top corners (and over the whole top in portrait), lit at their edges, with
// holes of sky; they move slowly in the wind.
void akCanopy(vec2 q,float t){
 float yb=.62-.30*ss(.30,.95,abs(q.x+.05));
 if(q.y<yb-.10)return;
 vec2 w=q+vec2(.004*sin(t*.5+q.y*9.),.003*sin(t*.6+q.x*7.));
 // the crowns: a ragged leafy lower edge, holes of sky, sprays of small leaves; lit at their edges towards the low sun
 float e1=fbm2(w*vec2(7.,9.)+3.);
 float d=yb-w.y-.07*(e1-.5)-.022*(vn(w*38.)-.5)-.008*(vn(w*120.)-.5);
 float ho=fbm2(w*vec2(8.,11.)+7.)+.10*vn(w*60.);d=max(d,(ho-.66)*.08*ss(yb-.02,yb+.15,w.y));
 if(d>PX*4.)return;
 float lv=vn(w*130.)*.6+vn(w*48.)*.4;
 vec3 c=mix(vec3(.08,.11,.06),vec3(.20,.27,.13),lv)*mix(1.,.75,ss(.0,.25,w.y-yb));
 float edge=ss(-.030,.0,d);c=mix(c,vec3(.48,.48,.24)*(.7+.5*lv),edge*.55*ss(.2,-.6,w.x));   // the lit fringe towards the sun
 c=mix(c,vec3(.30,.34,.20),edge*.25);
 PIECE(d,c,K_LEAF,w*30.,vec2(1,0),.015,.10,1.);}
void akBackdrop(vec2 q,float t){
 vec2 sp=vec2(-.62,.20); // the sun, low behind the trees on the left
 float topF=akForestTop(q.x,-.07,.17,13.,3.),topN=akForestTop(q.x,-.075,.11,19.,11.);
 if(q.y>topN-.01){
  if(q.y>topF-.01){
   float ds=length(q-sp);
   vec3 sk=mix(vec3(1.,.82,.56),vec3(.62,.70,.78),ss(.0,.70,q.y));sk=mix(sk,vec3(1.,.92,.70),ss(.70,.0,ds)*.65);
   PIECE(-1.,sk,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
   if(q.y>.12){float c2=fbm2(vec2(q.x*1.4+t*.004,q.y*7.));veil(vec3(1.,.88,.68),ss(.55,.78,c2)*ss(.12,.28,q.y)*.5,1.);}
   veil(vec3(1.,.96,.82),ss(.30,.0,ds)*.45,1.);}
  // the far forest wall across the clearing, golden in the haze, then a nearer, greener one
  PIECE(q.y-topF,mix(vec3(.80,.72,.54),vec3(.66,.62,.46),ss(.0,.3,q.y)),K_SKY,q*2.,vec2(1,0),.05,.08,1.);
  veil(vec3(.98,.84,.62),.25*ss(.25,-.05,q.y),1.);}
 PIECE(q.y-topN,vec3(.48,.50,.34)*(1.-.10*ss(.4,.6,vn(vec2(q.x*70.,2.)))*ss(.10,-.05,q.y-topN+.10)),K_SKY,q*3.,vec2(1,0),.05,.10,1.);
 veil(vec3(.96,.84,.62),ss(.10,-.08,q.y)*.30,1.);
 // tall conifers and trunks of the forest edge (the near ones frame the clearing)
 for(int i=0;i<2;i++){vec4 cf=AK_CONIF[i];akConifer(q,cf.xy,cf.z,cf.w,float(i)+2.,t,.30+.10*float(i));}
 {float dt=9.;vec4 tk=vec4(0.);for(int i=0;i<3;i++){vec4 k=AK_TRUNK[i];float y=q.y-k.y;if(y<-.01)continue;
   float w=k.z*(1.+.9*ss(.10*k.z/.06,.0,y))*(1.-.10*y);float e=abs(q.x-k.x-.02*y*(k.x>0.?1.:-1.))-w;if(e<dt){dt=e;tk=vec4(k.xy,w,k.w);}}
  if(dt<PX*4.){float lx=(q.x-tk.x)/tk.z;vec3 bc=vec3(.36,.24,.17)*mix(.55,1.20,ss(.9,-.9,lx));bc=mix(bc,vec3(.80,.62,.40),ss(-.6,-1.,lx)*.5); // lit on its sunny side
   PIECE(dt,mix(bc,vec3(.80,.72,.54),tk.w),K_BARK,vec2((q.x-tk.x)/tk.z*2.,q.y*6.),vec2(0,1),tk.z*.6,.5,1.);}}
 // shafts of the low sun slanting through the trees
 {vec2 sd=normalize(vec2(.80,-.60));float acr=dot(q-sp,vec2(-sd.y,sd.x));float al=dot(q-sp,sd);
  float ray=vn(vec2(acr*11.+t*.03,2.))*vn(vec2(acr*23.-t*.02,5.));veil(vec3(1.,.90,.66),ray*ss(.0,.3,al)*ss(1.6,.5,al)*ss(-.45,.0,q.y)*.20,1.);}
 // the forest floor: litter of leaves and needles, moss, warm flecks of sun; shadows long towards the right
 float dg=q.y-(-.075+.005*fbm2(vec2(q.x*6.,3.)));
 if(dg<.01){vec3 ga=mix(vec3(.55,.44,.30),vec3(.42,.33,.22),ss(-.1,-.5,q.y));ga=mix(ga,vec3(.30,.24,.17),ss(-.5,-1.2,q.y));
  float mo=fbm2(q*vec2(3.,9.)+2.);ga=mix(ga,vec3(.32,.36,.17),ss(.55,.75,mo)*.5);
  float gy=max(.02,-q.y-.06);vec2 gu=vec2(q.x/gy,1./gy);float lt=vn(gu*vec2(3.,2.2));ga*=1.-.14*ss(.55,.8,lt);ga=mix(ga,vec3(.62,.46,.28),ss(.6,.85,vn(gu*vec2(7.,5.)+3.))*.25);
  float fl=ss(.55,.75,vn(vec2(q.x*4.-q.y*3.,q.y*14.)+1.))*ss(-.6,-.1,q.y);ga=mix(ga,ga*1.40+vec3(.06,.03,0.),fl*.6); // flecks of sun
  PIECE(dg,ga,K_MUD,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);}
 // the understory: cycads, the magnolia, rows of ferns (nearer rows bigger)
 if(q.y>-.22){for(int i=0;i<3;i++){vec3 c=AK_CYCAD[i];akCycad(q,c.xy,c.z,t,float(i)*3.+2.,.20-.05*float(i));}
  akMagnolia(q,vec2(-.66,-.17),.16,t);}
 for(int r=0;r<3;r++){float fr=float(r);float y0=-.085-fr*.06;float sc=.032+fr*.026;float cw=sc*2.3;float x=q.x/cw+fr*3.1;float ci=floor(x);
  if(h11(ci+fr*5.)<.35)continue;vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.4-fr*3.1)*cw,y0+(h11(ci+7.)-.5)*.02);
  akFerns(q,b,sc*1.5,t,5.,ci,vec3(.30,.40,.17)*(1.-fr*.06),.7);}
 akCanopy(q,t);
}
// ---- The hollow log, and what the knock does to it (not decor: the story needs it) ----
void akLog(vec2 q,float t){
 if(q.x<.22||q.x>.72||q.y<-.52||q.y>-.25)return;
 float u=t-5.15;float wob=u>0.?exp(-u*3.2)*sin(TAU*7.*u):0.;
 vec2 o=vec2(.0012,.0030)*wob;vec2 a=AK_LF.xy+o*.5,b=AK_LN.xy+o;float ra=AK_LF.z,rb=AK_LN.z;
 vec2 ax=normalize(b-a),pp=vec2(-ax.y,ax.x);
 // the trunk: a little bent and uneven, cut off at its broken near end
 vec2 luv;float dl=akBend(q,a,mix(a,b,.5)+pp*.010,b,ra,rb,luv);dl+=.004*(vn(vec2(luv.x*11.,3.))-.5);
 dl=max(dl,dot(q-b,ax)-.004);
 // the broken end, slanting towards us: a ragged rim of pale wood with splinters, the hollow inside it
 vec2 le=vec2(dot(q-b,ax),dot(q-b,pp));float th=atan(le.y,le.x*1.6);
 float rim=1.+.10*(vn(vec2(th*2.2,7.))-.5);float de=(length(le/vec2(rb*.62,rb))-rim)*rb*.62;
 for(int i=0;i<4;i++){float fi=float(i);float an=-.9+fi*.75+.2*h11(fi);vec2 rp=vec2(cos(an)*rb*.62,sin(an)*rb)*rim*.92;
  float sl=.018+.018*h11(fi+3.);de=min(de,akTri3(le,rp-vec2(.004,.009),rp+vec2(-.004,.009),rp+vec2(sl,.004*sign(rp.y)+.006*(h11(fi+7.)-.5)))-.001);}
 dl=min(dl,de);if(dl>PX*4.)return;
 float side=luv.y; // -1 below .. 1 on top
 vec3 bc=vec3(.34,.27,.20)*(.75+.35*ss(-.6,.8,side));
 bc=mix(bc,vec3(.30,.38,.16),ss(.35,.75,side+.30*(vn(q*90.)-.5)+.25*(vn(q*30.)-.5))*.85);   // moss on its top, in patches
 bc=mix(bc,bc*.55,ss(-.4,-.9,side));                                                        // its shaded underside
 bc*=1.-.25*ss(.25,.45,abs(fract(side*3.4+.18*sin(luv.x*40.)+.3*vn(vec2(luv.x*6.,side*2.)))-.5))*ss(.95,.3,abs(side)); // deep furrows of the bark
 bc*=1.-.18*ss(.6,.8,vn(vec2(luv.x*28.,side*5.)));                                            // flakes of bark
 if(de<.001){float rr=length(le/vec2(rb*.62,rb))/rim;
  vec3 ec=vec3(.64,.55,.40)*(.88+.18*vn(vec2(th*8.,rr*6.)));ec*=1.-.25*ss(.6,.9,vn(vec2(th*14.,rr*2.)));   // weathered wood with cracks
  ec=mix(ec,vec3(.28,.22,.16),ss(.86,.98,rr)*step(rr,1.02));                                          // the bark at the rim
  float hr=.56+.08*(vn(vec2(th*1.7,2.))-.5);float hol=ss(hr+.03,hr-.01,rr);
  vec3 hc=mix(vec3(.05,.04,.03),vec3(.24,.17,.11),ss(-.3,-.95,le.y/rb)*ss(.55,.2,rr)); ec=mix(ec,hc,hol);  // the dark hollow
  bc=mix(bc,ec,ss(PX*.5,-PX*.5,de));}
 PIECE(dl,bc,K_BARK,vec2(luv.x*14.,side*3.),vec2(1,0),.03,.6,0.);}
// Dry leaves on the log slip off at the knock and drift down; dust puffs out of the hollow and off the bark, then settles.
void akLogFx(vec2 q,float t){
 if(q.x<.20||q.x>.88||q.y<-.56||q.y>-.17)return;
 float u=t-5.15;
 float dl=9.;vec2 lu=vec2(0.);float li=0.;
 for(int i=0;i<7;i++){float fi=float(i);float k=.12+.13*fi;float rk=mix(AK_LF.z,AK_LN.z,k);vec2 p0=mix(AK_LF.xy,AK_LN.xy,k)+vec2(.004*sin(fi*5.),rk*.90);
  float g=mix(AK_LF.y,AK_LN.y,k)-rk-.012-.025*h11(fi+2.);vec2 p=p0;float ang=(h11(fi*3.)-.5)*.6;float fl=0.;
  if(u>0.){float uu=max(u-.04*fi,0.);float fall=.10*(uu-(1.-exp(-uu*4.))/4.);fl=step(fall,p0.y-g);fall=min(fall,p0.y-g);
   p=p0+vec2((.020+.010*fi)*(h11(fi+5.)>.45?1.:-.7)*(1.-exp(-uu*1.5))+.010*sin(uu*4.5+fi)*ss(.0,.3,uu)*fl,.016*sin(PI*sat(uu/.30))-fall);
   ang+=(uu*2.2+.5*sin(uu*5.+fi))*fl+(1.-fl)*fi;}
  float fly=u>0.?ss(.0,.12,u-.04*fi)*fl:0.;vec2 lsz=vec2(.016,mix(.0035,.0075,fly));
  vec2 l=rot(ang)*(q-p);float e=sdEll(l,lsz);
  if(e<dl){dl=e;lu=l/lsz;li=fi+10.*fly;}}
 if(dl<PX*4.){float fly=step(9.,li);li=mod(li,10.);vec3 c=mix(vec3(.66,.46,.22),vec3(.58,.52,.24),h11(li+1.))*mix(.62,1.,fly);c*=1.-.30*ss(.12,.0,abs(lu.y))*ss(1.,.6,abs(lu.x));c*=1.+.15*lu.y;
  PIECE(dl,c,K_LEAF,lu*2.,vec2(1,0),.004,.45,0.);}
 if(u>0.&&u<2.8){
  // a puff of dust out of the hollow end (towards us), and a burst where the club hit; they drift, thin out and settle
  vec2 c0=AK_LN.xy+vec2(.012,-.004)+vec2(.050,-.012)*(1.-exp(-u*2.));float rd=.016+.060*(1.-exp(-u*2.));
  float n=fbm2((q-c0)*35.+vec2(0.,-u*.8));float a=ss(1.,.25,length((q-c0)/vec2(rd*1.25,rd*.85))+.5*(n-.5))*exp(-u*1.3)*.75;
  float k=.35;vec2 c1=mix(AK_LF.xy,AK_LN.xy,k)+vec2(0.,mix(AK_LF.z,AK_LN.z,k)+.010+.030*(1.-exp(-u*3.))-.012*u);
  float a1=ss(1.,.2,length((q-c1)/vec2(.040+.040*u,.016+.012*u))+.6*(fbm2(q*45.+u*.7)-.5))*exp(-u*1.5)*.60;
  veil(vec3(.86,.78,.62),a+a1,0.);}}
void akInsects(vec2 q,float t){
 if(q.x>-.65&&q.x<-.05&&q.y>-.05&&q.y<.30)for(int i=0;i<9;i++){float fi=float(i);vec2 c=vec2(-.60+.50*h11(fi),.0+.26*h11(fi+3.))+vec2(.03*sin(t*(1.3+h11(fi+5.))+fi*2.),.02*sin(t*(1.9+h11(fi+8.))+fi));
  float tw=.5+.5*sin(t*3.+fi*1.7);glow(vec3(1.,.92,.70)*ss(.004,.0,length(q-c))*(.30+.30*tw),1.);}}

AkPose akPose(float t){
 AkPose p;
 float up=ss(3.75,4.35,t)*(1.-ss(10.9,11.9,t));
 p.yaw=.72*ss(3.8,4.65,t)*(1.-ss(6.15,6.9,t));
 float bob=ss(6.55,6.75,t)*(1.-ss(7.6,7.95,t));float coo=ss(9.55,9.70,t)*(1.-ss(10.30,10.50,t));
 p.pitch=mix(.30+.03*sin(t*.9),.06,up)+.11*sin(TAU*(t-6.6)/.62)*bob-.07*coo+.04*ss(4.95,5.15,t)*(1.-ss(5.3,5.9,t));
 p.throat=ss(9.6,9.72,t)*(1.-ss(10.28,10.4,t))*(.55+.45*sin(TAU*(t-9.6)/.40-1.57));
 p.chew=(1.-up)*(.5+.5*sin(t*4.));
 float b2=ss(6.60,6.66,t)*ss(6.80,6.72,t),b3=ss(7.10,7.16,t)*ss(7.30,7.22,t);p.blink=max(blinkAt(t,.3),max(b2,b3));
 // the tail: wound up away from us (4.75–4.97), then swung hard towards us onto the log (the knock at 5.15), a little rebound, a
 // moment on the log, and back to rest (5.65–6.45); otherwise a slow sway
 float a=ss(4.75,4.97,t),sl=sat((t-4.97)/.18);sl*=sl;float ret=ss(5.65,6.45,t);float rb=sin(PI*sat((t-5.15)/.30))*(1.-ret);
 vec2 E=AK_ER+(AK_EW-AK_ER)*a*(1.-sl)+(AK_ES-AK_ER)*sl*(1.-ret)+vec2(-.04,.26)*rb;
 E+=vec2(.05*sin(t*.55),.06*sin(t*.55+1.2))*(1.-a+ret*a)*(1.-ss(4.5,4.75,t)*(1.-ret));
 p.E=E;
 vec2 M0=mix(AK_R0,E,.5)+vec2(.10,.22);
 p.M=M0+(AK_EW-AK_ES)*.16*sin(PI*sl)*a+(AK_ER-AK_EW)*.12*sin(PI*a)*(1.-sl);
 p.zc=1.+.14*sat((AK_ER.y-E.y)/(AK_ER.y-AK_ES.y))-.10*sat((E.y-AK_ER.y)/.7);
 // the body braces: the forequarters lower a little, the hips swing against the tail; a jolt at the knock
 p.bx=.04*ss(4.6,4.9,t)*(1.-ss(5.6,6.3,t));p.by=-.04*ss(4.5,4.9,t)*(1.-ss(5.6,6.4,t))+.02*rb;
 p.hx=-.05*a*(1.-sl)+.06*sl*(1.-ret);p.hy=.03*a*(1.-sl)-.02*sl*(1.-ret);
 // steps: the near hind foot braces before the swing (lands 4.45); the near fore foot settles after the bob (lands 7.35)
 p.hl=.14*sin(PI*sat((t-4.0)/.45));p.hf=.14*ss(4.0,4.45,t);
 p.fl=.12*sin(PI*sat((t-6.95)/.40));p.ff=.10*ss(6.95,7.35,t);
 return p;}

void akScene(vec2 q,float t,float grow){
 SUNL=normalize(vec3(-.62,.40,.60));SUNC=vec3(1.38,1.06,.72);AMBC=vec3(.40,.45,.52);BACK=.18;
 float tp=t; // the story is timed on the scene clock (the sound adds the 0.3 s by which it lags the press)
 akBackdrop(q,t);
 AkPose p=akPose(tp);
 // its long soft shadow, cast low along the ground towards the right (the sun low on the left), the contact shadows under the feet
 {vec2 l=(q-AK_POS)/AKS;if(l.y>-.6&&l.y<.3&&l.x>-4.&&l.x<9.){float hg=max(-l.y,0.)/.05;float sd=akSil(vec2(l.x-1.55*hg,hg),p);
  shadow(ss(.40,-.40,sd)*ss(.30,-.05,l.y)*.50*(1.-.4*ss(.0,2.5,hg)),vec3(.50,.50,.62),0.);}}
 contact(q,AK_POS+vec2(.0,.0),.30,.55);
 akInsects(q,t);
 akAnk(q,t,p,grow);
 akLog(q,tp);
 akLogFx(q,tp);
 for(int i=0;i<8;i++){vec4 f=AK_FFERN[i];akFerns(q,f.xy,f.z,t,f.w,float(i)*4.+3.,vec3(.26,.36,.15)*(1.+.08*float(i<2)),.55);}
}
void akFossil(vec2 q){
 float s=AKS;vec2 m=(q-AK_POS)/s;if(m.x<-3.4||m.x>5.4||m.y<-.5||m.y>2.2)return;
 AkPose p=akPose(0.);
 vec2 S=AK_S,H=AK_H,C=AK_C;vec2 Ff=vec2(AK_S.x-.12,0.),Fh=vec2(AK_H.x+.02,0.);vec2 W=Ff+vec2(.06,.24),A=Fh+vec2(.12,.26);
 vec2 E=knee(S,W,.44,.40,1.),K=knee(H,A,.56,.50,-1.);
 float d=akBones(m,akSkull(rot(p.pitch)*(m-C)/AK_HS)*AK_HS,S,E,W,Ff,H,K,A,Fh,C,p.M,p.E);PIECE(d*s,vec3(.66,.60,.50),K_FOSSIL,m*.4,vec2(1,0),.05*s,.6,0.);}

const vec2 WIN_C=vec2(.02,-.12);
// While the window opens, the fossil is only drawn outside it and the life only inside it (the rest would be hidden).
float akWin(vec2 q){return length((q-WIN_C)*vec2(1.,1.15))-RFULL*ss(0.,.62,uLife);}
void fossil(vec2 q){if(uLife>.001&&akWin(q)<-.09)return;akFossil(q);}
void life(vec2 q,float t){if(uLife<.999&&akWin(q)>.09)return;akScene(q,t,GROW);}

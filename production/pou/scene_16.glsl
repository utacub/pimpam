// ---- Scene 17 (El pou del temps, CE37): Stegosaurus stenops on the Morrison floodplain (Colorado–Wyoming, about 155–150 million years
// ago), in a warm high light under a wide sky: dry silty ground and dust, cycads, low ferns, distant araucarias. No grass.
// Times on the scene clock (uTau): 3.8–4.4 it lifts its head from browsing and steps forward (the near fore foot lands 4.0, the near
// hind foot 4.4); 4.0–7.0 (the key) its plates flush slowly to a low-saturated rose (the rise over 3 s), and it gives a soft rumble
// (6.2–6.9); 7.2–7.9 it lowers its head to browse again; 8.4–9.6 (the echo) its tail swings in a slow arc and brushes a cycad (its
// leaves shake from 9.2); 9.6–11.0 the cycad sways back and the plates fade. Rig frame (metres): facing +x, the ground at y 0; on screen
// it faces left (flip -1). Scale: .150 screen units per metre (about 6.5 m long).
const vec4 ST_A=vec4(0.,-.30,.150,-1.);
const vec2 ST_H=vec2(0.,2.10),ST_S=vec2(1.95,1.25),ST_N0=vec2(2.20,1.55),ST_TB=vec2(-.65,2.25);
const vec3 ST_CYC=vec3(.67,-.245,.26);    // the cycad the tail brushes: base, height
const vec4 ST_CYCS[4]=vec4[](vec4(-.70,-.33,.20,0.),vec4(-.24,-.075,.10,.30),vec4(.40,-.07,.09,.32),vec4(-.98,-.12,.16,.15)); // other cycads
const vec4 ST_ARAU[6]=vec4[](vec4(-.80,-.045,.40,.34),vec4(.86,-.045,.36,.36),vec4(-.42,-.035,.24,.52),vec4(.30,-.035,.20,.58),vec4(-1.30,-.04,.34,.42),vec4(1.32,-.04,.36,.42));
const vec4 ST_FFERN[5]=vec4[](vec4(-.56,-.36,.10,6.),vec4(.40,-.40,.11,6.),vec4(-.10,-.52,.13,6.),vec4(-.30,-1.0,.30,6.),vec4(.50,-1.1,.32,6.));
struct StPose{vec2 C,Nc,Fn,Ff,Hn,Hf,T1,T2;float ha,jaw,blink,throat,flush,bx;};

float stBend(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc,out vec2 uv){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);
 float u1=segU(p,a,m),u2=segU(p,m,c);vec2 p1=mix(a,m,u1),p2=mix(m,c,u2);float r1=mix(ra,rm,u1),r2=mix(rm,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;bool f=d1<d2;vec2 o=p-(f?p1:p2);vec2 dir=f?m-a:c-m;
 uv=vec2(f?u1*.5:.5+u2*.5,(dir.x*o.y-dir.y*o.x)/length(dir)/max(f?r1:r2,1e-3));return smin(d1,d2,rm*.25);}
vec2 stQB(vec2 a,vec2 b,vec2 c,float u){return mix(mix(a,b,u),mix(b,c,u),u);}
// Small pebbly scales painted by the light, a few larger ones; su: one scale per unit.
float stScales(vec2 su,float fl,float cp){
 vec2 i=floor(su-.5);float a=8.,b=8.;vec2 oa=vec2(0.),ia=i;
 for(int k=0;k<4;k++){vec2 c=i+vec2(float(k&1),float(k>>1));vec2 o=su-(c+.22+.56*h22(c));float d=dot(o,o);
  if(d<a){b=a;a=d;ia=c;oa=o;}else if(d<b)b=d;}
 float r=sqrt(a),e=sqrt(b)-r;float hh=h21(ia);oa.x*=fl;
 float ew=max(.09,1.6/cp),ek=.09/ew;   // the seam: never thinner than about a pixel and a half (cp: one scale in pixels), as dark on the whole
 float dome=ss(.70,.10,r)*ss(.0,.25,e+.19-ew);float lit=dot(oa,normalize(SUNL.xy))/max(r,.05)*ss(.0,.35,r)*dome;
 return 1.+(.15+.06*step(.85,hh))*lit-.08*ss(ew,.0,e)*ek+.06*(hh-.5);}

// ---- The pose ----
StPose stPose(float t){
 StPose p;
 float up=ss(3.8,4.3,t)*(1.-ss(7.2,7.9,t));                 // the head lifted from browsing
 float rum=ss(6.2,6.45,t)*(1.-ss(6.7,6.95,t));
 p.flush=ss(4.0,7.0,t)*(1.-ss(9.6,11.0,t));
 p.throat=rum*(.8+.2*sin(t*TAU*3.));
 float br=sin(t*.85);
 vec2 Cb=vec2(3.05,.62)+vec2(.05,.05)*sin(t*2.6)*(1.-up),Cu=vec2(3.10,1.12)+vec2(.04*sin(t*.5),.03*sin(t*.7));
 p.C=mix(Cb,Cu,up)+vec2(0.,-.04*rum);
 p.Nc=mix(vec2(2.80,1.30),vec2(2.70,1.50),up);
 p.ha=mix(-1.0+.10*sin(t*2.6),-.35+.06*sin(t*.6),up)-.08*rum;
 float chew=1.-ss(3.7,3.9,t)*(1.-ss(7.6,7.9,t));
 p.jaw=chew*.35*(.5+.5*sin(t*TAU*1.8));
 p.blink=blinkAt(t,.27);
 // the step forward (the fore foot lands 4.0, the hind 4.4); the body follows
 float sf=ss(3.75,4.0,t),sh=ss(4.15,4.4,t);
 p.bx=.20*ss(3.8,4.5,t);
 p.Fn=vec2(1.95+.30*sf,.12*sin(PI*sat((t-3.75)/.25)));p.Ff=vec2(1.70,0.);
 p.Hn=vec2(.10+.30*sh,.12*sin(PI*sat((t-4.15)/.25)));p.Hf=vec2(-.25,0.);
 // the tail: at rest it droops and sways a little; 8.4–9.6 it straightens and lifts in a slow arc (the spikes reach the cycad at 9.2)
 float sw=ss(8.4,9.15,t)*(1.-ss(9.25,9.9,t));
 p.T1=mix(vec2(-2.00,1.92),vec2(-2.18,2.08),sw)+vec2(0.,.03*br);
 p.T2=mix(vec2(-3.30,1.10),vec2(-3.95,1.72),sw)+vec2(.04*sin(t*.6),.06*sin(t*.6+.5))*(1.-sw);
 return p;}

// ---- The head (its frame h: metres, forward +x, the joint at 0): a small, long, low skull, the beak, the jaw ----
float stHead(vec2 h,float jaw,out float dBeak){
 vec2 j=rot(-.20*jaw)*(h-vec2(.02,-.04))+vec2(.02,-.04);
 float d=smin(sdEll(h-vec2(.14,.02),vec2(.21,.115)),sdCap(h,vec2(.22,.0),vec2(.46,-.045),.095,.055),.05);
 d=smin(d,sdCap(j,vec2(.02,-.07),vec2(.44,-.08),.06,.03),.03);
 dBeak=min(sdEll(h-vec2(.48,-.050),vec2(.045,.042)),sdEll(j-vec2(.44,-.085),vec2(.04,.025)));
 return d;}

// One plate in its frame l (x along the back, y up from its base): a large, thin, rounded plate, height h, width w: a broad rounded
// body with a softly pointed apex, narrowing a little into its embedded base.
float stPlate(vec2 l,float h,float w){
 float e=sdEll(l-vec2(0.,h*.47),vec2(w*.50,h*.56));
 float tip=(abs(l.x)*h*.50+(l.y-h*1.05)*w*.50)/length(vec2(h*.50,w*.50));
 return smax(e,tip,.24*h);}
// The plates along the back: 17 in two alternating, staggered rows (k even near, odd far), the biggest (about .6 m showing) over the
// hips and the base of the tail, smaller towards the neck and the end of the tail. Returns the distance to the near row (x) and the
// far row (y), and in o, of the nearest plate's frame (xy) and height (z) in each row.
vec2 stPlates(vec2 m,StPose p,out vec3 o,out vec3 of){
 vec2 P0=ST_N0+vec2(.10,.30),P1=vec2(.25,3.35),P2=mix(p.T1,p.T2,.30)+vec2(0.,.36);
 float dn=9.,df=9.;o=vec3(0.,0.,1.);of=o;
 for(int k=0;k<17;k++){float fk=float(k);float u=.03+fk*.058;bool far=(k&1)==1;
  vec2 a=stQB(P0,P1,P2,u),tg=normalize(mix(P1-P0,P2-P1,u));
  float h=.20+.62*exp(-pow((u-.58)/.25,2.));float w=1.10*h+.12;
  vec2 nn=vec2(tg.y,-tg.x);if(nn.y<0.)nn=-nn;nn=normalize(nn-tg*.18);
  vec2 l=vec2(dot(m-a,-tg),dot(m-a,nn));if(far){l.y-=.04;}
  float d=stPlate(l,h,w);
  if(far){if(d<df){df=d;of=vec3(l,h);}}else if(d<dn){dn=d;o=vec3(l,h);}}
 return vec2(dn,df);}

float stBones(vec2 m,StPose p,float sk,vec2 K,vec2 A,vec2 E,vec2 W,float dPl){
 float d=min(sk,dPl);vec2 uv;
 d=min(d,stBend(m,p.C,p.Nc,ST_N0,.05,.07,uv));
 d=min(d,stBend(m,ST_N0,vec2(.5,2.70),ST_TB,.08,.10,uv));
 d=min(d,stBend(m,ST_TB,p.T1,p.T2,.09,.03,uv));
 for(int k=0;k<8;k++){float x=1.75-float(k)*.30;vec2 a=vec2(x,1.78+.75*ss(1.8,.0,x)-.10*ss(.2,-.6,x)),c=vec2(x-.25,.95+.10*ss(1.8,.6,x));d=min(d,sdSeg(m,a,c)-.045);}
 d=min(d,sdEll(m-vec2(-.05,2.25),vec2(.85,.20)));d=min(d,sdCap(m,vec2(.20,2.0),vec2(.90,1.35),.06,.07));d=min(d,sdCap(m,vec2(-.30,2.0),vec2(-.90,1.40),.07,.05));
 d=min(d,sdCap(m,vec2(1.55,1.95),ST_S+vec2(.0,.05),.10,.12));
 d=min(d,sdCap(m,ST_H,K,.14,.11));d=min(d,sdCap(m,K,A,.11,.09));d=min(d,sdCap(m,A,p.Hn+vec2(.15,.06),.08,.06));
 d=min(d,sdCap(m,ST_S,E,.11,.09));d=min(d,sdCap(m,E,W,.09,.08));d=min(d,sdCap(m,W,p.Fn+vec2(.05,.05),.08,.07));
 return d;}

// How a rounded form under the skin (the barrel of the trunk, a thigh, a shoulder) turns to the light: a smooth low dome over the ellipse
// ax (in the frame M, v from its centre), against a flat surface. Its slope fades to nothing at the rim: no line, no terminator edge.
float stDome(vec2 v,mat2 M,vec2 ax,float fl){vec2 l=M*v/ax;float r2=dot(l,l);if(r2>1.)return 0.;
 vec2 g=(-1.2*(1.-r2)*l/ax)*M;g.x*=fl;return lambert(normalize(vec3(-g,1.)))-lambert(vec3(0.,0.,1.));}

// ---- The Stegosaurus ----
void stSaur(vec2 q,float t,StPose p,float grow){
 float s=ST_A.z,fl=ST_A.w;vec2 m=(q-ST_A.xy)/s;m.x*=fl;m.x-=p.bx;
 if(m.x<-5.1||m.x>4.2||m.y<-.3||m.y>4.0)return;
 float br=sin(t*.85);
 vec2 H=ST_H+vec2(0.,.012*br),S=ST_S+vec2(0.,.010*br);
 vec2 h=rot(p.ha)*(m-p.C);
 // limbs: the hind legs long and pillar-like (short metatarsals), the forelegs short and columnar with the elbows a little out
 vec2 Hn=p.Hn-vec2(p.bx,0.),Hf=p.Hf-vec2(p.bx,0.)+vec2(.20*ss(4.4,4.9,t),.10*sin(PI*sat((t-4.4)/.5))),Fn=p.Fn-vec2(p.bx,0.),Ff=p.Ff-vec2(p.bx,0.)+vec2(.25*ss(4.1,4.6,t),.10*sin(PI*sat((t-4.1)/.5)));
 vec2 An=Hn+vec2(-.12,.42),Kn=knee(H,An,1.05,.80,1.),Wn=Fn+vec2(0.,.26),En=knee(S,Wn,.62,.52,-1.);
 vec2 dy=vec2(0.,.10);vec2 H2=H+vec2(-.08,.05),S2=S+vec2(-.08,.06),Af=Hf+dy+vec2(-.12,.42),Kf=knee(H2,Af,1.05,.80,1.),Wf=Ff+dy+vec2(0.,.26),Ef=knee(S2,Wf,.62,.52,-1.);
 float G=grow/s;bool needB=G<1.1;float inPX=4.*PX/s,cover=-2.*PX/s;
 // ---- distances ----
 float dFar;{vec2 hk=normalize(Kf-H2);float e=sdEll(mat2(hk.y,hk.x,-hk.x,hk.y)*(m-mix(H2,Kf,.45)),vec2(.52,.70));
  e=smin(e,sdCap(m,Kf,Af,.28,.19),.10);e=smin(e,sdCap(m,Af,Hf+dy+vec2(.10,.10),.19,.18),.05);e=smin(e,sdEll(m-Hf-dy-vec2(.12,.07),vec2(.26,.08)),.05);
  float a=smin(smin(sdCap(m,S2,Ef,.26,.18),sdCap(m,Ef,Wf,.18,.15),.05),sdCap(m,Wf,Ff+dy+vec2(.04,.06),.15,.16),.04);a=smin(a,sdEll(m-Ff-dy-vec2(.05,.06),vec2(.18,.07)),.04);dFar=min(e,a);}
 // the body: the back arched highest over the hips, sloping down to the low shoulders; the short neck; the deep tail
 float dBd=smin(sdEll(m-vec2(-.05,2.18),vec2(1.0,.66)),sdEll(rot(-.32)*(m-vec2(.85,1.72)),vec2(1.45,.88+.015*br)),.35);
 dBd=smin(dBd,sdEll(m-vec2(1.80,1.32),vec2(.62,.62)),.30);
 vec2 uv;float dN=stBend(m,ST_N0,p.Nc,p.C,.42,.17+.05*p.throat,uv);
 vec2 tuv;float dT=stBend(m,ST_TB,p.T1,p.T2,.58,.08,tuv);
 float dCore=smin(smin(dBd,dN,.18),dT,.25);
 float dBeak=9.;float dFace=9.;bool nearH=h.x>-.3&&h.x<.7&&h.y>-.3&&h.y<.3;
 if(nearH)dFace=stHead(h,p.jaw,dBeak);
 float dHd=min(dFace,dBeak);
 // the near limbs: the big thigh, the shin, the short foot; the short, columnar foreleg
 vec2 hk=normalize(Kn-H);mat2 MT=mat2(hk.y,hk.x,-hk.x,hk.y);vec2 cT=mix(H,Kn,.45);
 float dThg=sdEll(MT*(m-cT),vec2(.54,.72));
 float dLg=smin(sdCap(m,Kn,An,.28,.20),sdCap(m,An,Hn+vec2(.10,.10),.20,.19),.05);dLg=smin(dLg,sdEll(m-Hn-vec2(.12,.07),vec2(.28,.08)),.05);
 float dUA=sdCap(m,S+vec2(-.05,.08),En,.28,.19);
 float dAr=smin(sdCap(m,En,Wn,.19,.16),sdCap(m,Wn,Fn+vec2(.04,.06),.16,.17),.04);dAr=smin(dAr,sdEll(m-Fn-vec2(.05,.06),vec2(.19,.07)),.04);
 float d=smin(dCore,dThg,.15);d=smin(d,dLg,.08);d=smin(d,dUA,.10);d=smin(d,dAr,.06);d=smin(d,dHd,.06);
 // the plates (two rows) and the thagomizer: two pairs of long spikes angled out, up and back (the near spike of each pair in front of
 // the tail, the far one behind it)
 vec3 o,of;vec2 pl=stPlates(m,p,o,of);
 vec2 mm=.25*ST_TB+.5*p.T1+.25*p.T2;vec2 tg=normalize(p.T2-mm);vec2 nt=vec2(-tg.y,tg.x);if(nt.y<0.)nt=-nt;
 float dSn=9.,dSf=9.;vec2 sbn=vec2(0.),sbf=vec2(0.);
 for(int k=0;k<4;k++){float pr=float(k>>1),fs=float(k&1);vec2 a=mix(mm,p.T2,.56+.22*pr)+nt*.05;float ang=mix(1.05,.70,pr)+.12*fs;
  vec2 dir=normalize(tg*cos(ang)+nt*sin(ang));float L=(.88-.08*pr)*mix(.86,.96,fs);float e=sdCap(m,a,a+dir*L,.11,.012);float sx=dot(m-a,dir)/L;
  if(fs<.5){if(e<dSn){dSn=e;sbn=vec2(sx,0.);}}else if(e<dSf){dSf=e;sbf=vec2(sx,1.);}}
 float dB=-1.;
 if(needB&&min(min(d,dFar),min(min(pl.x,pl.y),min(dSn,dSf)))>.05)needB=false;
 if(needB){float sk=nearH?max(dHd,-sdEll(h-vec2(.12,.04),vec2(.04,.04))):9.;dB=stBones(m,p,sk,Kn,An,En,Wn,min(min(pl.x,pl.y),min(dSn,dSf)));}
 if(needB){dFar=max(dFar,dB-G);d=max(d,dB-G);pl=max(pl,vec2(dB-G));dSn=max(dSn,dB-G);dSf=max(dSf,dB-G);}
 // ---- painting, back to front ----
 if(needB&&grow<.5)PIECE(dB*s,vec3(.86,.82,.72),K_BONE,m*.4,vec2(1,0),.06*s,.55,0.);
 // the plates and spikes. The plates: a dusky grey-olive, with radiating vascular grooves; they flush to a low-saturated rose that rises
 // from the base along the grooves; their thin upper edges glow where the high sun comes through them. The far row is in the shade of
 // the near one. The spikes: pale horn, darker towards the tips.
 for(int r=0;r<2;r++){bool fr=r==0;float dp=fr?min(pl.y,dSf):pl.x;if(dp>inPX||(!fr&&dp>-.0&&pl.x>inPX))continue;
  bool sp=fr&&dSf<pl.y;vec3 lo=fr?of:o;
  float rr=length(lo.xy-vec2(0.,-.30*lo.z))/lo.z,ang=atan(lo.x,lo.y+.30*lo.z);
  vec3 pc=vec3(.50,.48,.40)*(.90+.15*vn(lo.xy*9.));
  float gr=ss(.50,.95,abs(sin(ang*11.+.5*sin(rr*7.))));                               // the grooves
  float front=.30+1.10*p.flush;float fm=ss(front+.04,front-.22,rr)*p.flush;            // the flush rises from the base
  pc=mix(pc,vec3(.70,.52,.50),fm*mix(.65,1.,gr)*ss(1.40,1.05,rr));
  pc*=1.-.13*gr*ss(.25,.6,rr);
  vec2 gP=vec2(dFdx(dp),dFdy(dp));gP/=max(length(gP),1e-6);
  float edge=ss(-.10,-.01,dp)*sat(dot(gP,normalize(SUNL.xy))*1.2+.1);
  pc=mix(pc,vec3(.98,.80,.62)*mix(1.,1.15,fm),edge*.55);                               // the thin edge, lit through
  if(fr)pc*=.74;
  if(sp)pc=mix(vec3(.58,.54,.45),vec3(.32,.29,.25),ss(.25,1.,sbf.x))*.85;
  PIECE(dp*s,pc,sp?K_HORN:K_SMOOTH,sp?m*3.:vec2(ang*7.,rr*.45),sp?normalize(p.T2-mm):vec2(sin(ang),cos(ang)),.05*s,1.,0.);}
 vec3 back=vec3(.36,.32,.24),flank=vec3(.56,.46,.30),belly=vec3(.78,.71,.55);
 // the scale pattern: bigger on the body, smaller on the neck, the limbs, the head and the end of the tail (fixed sizes cross-faded)
 float lm=ss(.05,-.10,min(min(dLg,dUA),dAr)-dCore),nk=ss(.15,-.15,dN-dBd);
 float wh=nearH?ss(.04,-.02,dHd):0.,wf=(1.-wh)*sat(max(max(lm,nk),ss(.40,.70,tuv.x)));
 float scl=0.;
 for(int k=0;k<3;k++){float w=k==0?(1.-wh)*(1.-wf):k==1?wf:wh;if(w<.01)continue;
  float rt=k==0?9.5:k==1?15.:22.;vec2 su=k==0?m*vec2(8.,9.5):k==1?m*15.:h*22.;
  float cp=s/rt/PX;scl+=w*mix(1.,stScales(su,fl,cp),ss(3.,6.,cp));}
// (0.44.7) The skin's own fine texture (K_SKIN) used to be turned off by giving it coordinates at ×900, so that its features were far
// finer than a pixel and faded out. On an NVIDIA card under Windows that fade did not happen: the hash of such large numbers broke
// into lines along the axes over the whole animal (Marc's screen, 0.31–0.44.6; the emulated cards here never showed it). Now the
// pieces take K_SMOOTH with constant coordinates: no texture at all, and a soft satin sheen of the skin.
 if(dFar<inPX&&d>cover)PIECE(dFar*s,mix(flank,back,.5)*.60*scl,K_SMOOTH,vec2(0.),vec2(1,0),.12*s,1.,0.);
 if(d<inPX){
  float neckK=nk*ss(.0,-.20,dN);
  float cs=mix(ss(1.05,2.1,m.y),.55+.45*ss(.9,-.6,tuv.y),ss(-.6,-1.3,m.x));cs=mix(cs,ss(-.5,.5,uv.y),neckK);
  vec3 alb=cs<.5?mix(belly,flank,cs*2.):mix(flank,back,cs*2.-1.);
  // the pattern, at low contrast: darker irregular blotches along the back and flanks, soft mottles
  alb*=1.-.17*ss(.52,.72,vn(m*vec2(1.7,2.5)+4.))*ss(.25,.6,cs);
  alb*=.90+.16*vn(m*2.2+1.);
  // the limbs mid-toned, darker towards the feet; the hooves
  alb=mix(alb,mix(flank,back,.45),lm);alb*=mix(.80,1.,ss(.0,.8,m.y));
  alb=mix(alb,vec3(.30,.27,.22),ss(.12,.06,m.y)*sat(ss(.10,.20,m.x-Hn.x)*step(m.x-Hn.x,.42)+ss(.08,.16,m.x-Fn.x)*step(m.x-Fn.x,.26))*lm);
  // the head: a darker crown, a paler jaw; the dark beak; the throat's small bony ossicles
  float hd=ss(.06,-.06,dHd-min(dN,dBd));
  alb=mix(alb,mix(belly,mix(flank,back,.6),ss(-.06,.04,h.y)),hd*.7);
  alb=mix(alb,vec3(.30,.27,.24),ss(.01,-.01,dBeak-dFace+.005)*hd);
  alb*=1.-.12*ss(.5,.9,vn(vec2(m.x*30.,m.y*30.)))*ss(.9,.5,m.y-mix(.3,.6,ss(2.6,3.,m.x)))*step(2.3,m.x)*(1.-hd);
  // skin folds: at the base of the neck, behind the elbow, at the groin
  float fo=ss(.04,.0,abs(uv.x-.12-.02*sin(uv.y*2.5)))*ss(.95,.5,abs(uv.y))*neckK;
  fo+=ss(.04,.0,abs(uv.x-.24-.02*sin(uv.y*2.+1.)))*ss(.9,.4,abs(uv.y))*neckK*.7;
  vec2 lT=MT*(m-cT);fo+=ss(.04,.0,abs(dThg+.04))*ss(-.24,-.40,lT.x)*ss(.0,.20,lT.y)*ss(.60,.36,lT.y);
  {vec2 ua=normalize(En-S),pu=vec2(-ua.y,ua.x);fo+=ss(.03,.0,sdSeg(m,En-pu*.22-ua*.20,En-pu*.18+ua*.02))*.8;}
  alb*=1.-.22*sat(fo)*ss(.0,-.06,d);
  // the forms under the skin: the round barrel of the trunk, the thigh, the shoulder; the belly a little in its own shade
  alb*=1.+.80*stDome(m-vec2(.45,1.85),rot(.18),vec2(2.10,1.05),fl)+1.0*stDome(m-cT,MT,vec2(.54,.72),fl)+.45*stDome(m-mix(S,En,.30),mat2(1.),vec2(.32,.44),fl);
  alb*=mix(.86,1.,ss(.0,.25,cs));
  // light on the silhouette: a warm rim along the top, a brighter edge towards the sun
  vec2 gD=vec2(dFdx(d),dFdy(d));gD/=max(length(gD),1e-6);float rk=(1.-lm)*(1.-hd);
  alb=mix(alb,alb*1.40+vec3(.05,.04,.02),ss(-.20,.0,d)*sat(gD.y*1.3-.2)*.5*rk);
  alb=mix(alb,alb*1.3+.03,ss(-.26,0.,d)*sat(dot(gD,normalize(SUNL.xy)))*.30*rk);
  alb*=scl;
  // roundness: about the local half-thickness everywhere
  float Rb=mix(.58,.9*mix(.42,.20,sat(uv.x)),nk);Rb=mix(Rb,.08,hd);Rb=mix(Rb,max(.85*mix(.58,.08,sat(tuv.x)),.05),ss(-.5,-1.0,m.x));
  Rb=mix(Rb,mix(mix(.14,.26,ss(.05,-.15,dThg)),.17,ss(-.05,.05,dLg-min(dUA,dAr))),ss(.05,-.10,min(min(min(dLg,dUA),dAr),dThg)-dCore));
  PIECE(d*s,alb,K_SMOOTH,vec2(0.),vec2(1,0),Rb*s,1.,0.);
  if(nearH)shadow(ss(.008,.0,abs(h.y+.055+.02*h.x))*step(.20,h.x)*step(h.x,.49)*.5*step(d,0.),vec3(.25,.22,.20),0.);}
 // the near spikes, in front of the tail
 if(dSn<inPX){vec3 sc=mix(vec3(.60,.56,.47),vec3(.32,.29,.25),ss(.25,1.,sbn.x));
  PIECE(dSn*s,sc,K_HORN,m*3.,normalize(p.T2-mm),.05*s,1.,0.);}
 if(grow>.3&&nearH){vec2 ec=vec2(.12,.04);vec2 ecL=p.C+rot(-p.ha)*ec+vec2(p.bx,0.);
  eyeA(q,ST_A.xy+vec2(ecL.x*fl,ecL.y)*s,.036*s,vec3(.40,.28,.12),back,p.blink,0.);}
}

// A simple silhouette of the animal, for its shadow on the ground.
float stSil(vec2 m,StPose p){float d=smin(sdEll(m-vec2(-.05,2.18),vec2(1.0,.66)),sdEll(rot(-.32)*(m-vec2(.85,1.72)),vec2(1.45,.88)),.35);
 d=min(d,sdEll(m-vec2(.10,2.75),vec2(1.9,.55)));vec2 uv;d=min(d,stBend(m,ST_TB,p.T1,p.T2,.55,.08,uv));d=min(d,sdCap(m,ST_N0,p.C,.35,.15));
 d=min(d,min(sdCap(m,ST_H,p.Hn-vec2(p.bx,0.),.32,.20),sdCap(m,ST_S,p.Fn-vec2(p.bx,0.),.24,.18)));return d;}

// ---- The floodplain (decor) ----
float stFernD(vec2 q,vec2 b,float ang,float len,float bend,float pw,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=pw*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.45*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0013*len/.1);return max(d,max(-l.y,l.y-len));}
void stFerns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float hz){
 if(abs(q.x-base.x)>sc*1.3||q.y<base.y-.01||q.y>base.y+sc*1.15)return;
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<7;i++){if(float(i)>=n)break;float fi=float(i);
  float ang=(-1.15+2.3*fi/(n-1.))+.05*sin(t*.9+fi+seed)+.02*sin(t*2.3+fi*2.);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;
  float e=stFernD(q,base,ang,len,.35*sign(ang+.01),.30,fu);if(e<d){d=e;u=fu;ci=fi;}}
 if(d>PX*4.)return;
 vec3 c=col*(.82+.34*h11(ci*3.+seed))*(.85+.25*u.x);
 PIECE(d,mix(c,vec3(.80,.78,.74),hz),K_PLANT,u*vec2(1.,6.),vec2(0,1),.004,.5,1.);}
// A cycad: a stout trunk patterned with old leaf bases, a crown of stiff pinnate fronds; shake: how hard its fronds shake (0..1),
// lean: the crown swaying; dec 0 for the one the tail brushes.
void stCycad(vec2 q,vec2 b,float h,float t,float seed,float hz,float shake,float lean,float dec){
 if(abs(q.x-b.x)>h*.95||q.y<b.y-.01||q.y>b.y+h*1.25)return;
 vec2 top=b+vec2(lean*h*.10,h*.42);
 float tr=sdCap(q,b,top,h*.13,h*.10);
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<9;i++){float fi=float(i);float ang=-1.75+3.5*fi/8.+.10*(h11(fi+seed)-.5)+.03*sin(t*.8+fi+seed)+lean*.25+shake*.12*sin(t*17.+fi*2.1);vec2 fu;
  float e=stFernD(q,top+vec2(0.,h*.03),ang,h*(.62+.14*h11(fi*3.+seed)),.30*sign(ang+.01)*ss(.2,1.2,abs(ang)),.16,fu);if(e<d){d=e;u=fu;ci=fi;}}
 float dd=min(d,tr);if(dd>PX*4.)return;
 vec3 c=vec3(.26,.36,.17)*(.85+.30*h11(ci*3.+seed))*(.80+.30*u.x);
 if(tr<d){vec2 l=(q-b)/h;float sc=ss(.25,.05,abs(fract(l.y*14.+.5*sin(l.x*40.))-.5))*.25;c=vec3(.42,.34,.24)*(1.-sc);}
 PIECE(dd,mix(c,vec3(.80,.78,.74),hz),K_PLANT,tr<d?(q-b)/h*vec2(30.,10.):u*vec2(1.,6.),vec2(0,1),.004,.5,dec);}
// A distant araucaria: a tall straight trunk, branches only near the top in a flat-topped crown.
void stArau(vec2 q,vec4 a,float t,float seed){
 vec2 b=a.xy;float h=a.z;if(abs(q.x-b.x)>h*.32||q.y<b.y-.01||q.y>b.y+h*1.05)return;
 float x=q.x-b.x,y=(q.y-b.y)/h;
 float tr=max(abs(x)-h*(.012-.004*y),q.y-b.y-h*.92);
 // a flat-topped crown (a broad dome over two lower tiers of spreading branches)
 float cn=sdEll(q-b-vec2(0.,h*.90),vec2(h*.24,h*.075))-h*.018*(fbm2(q*60./h*vec2(1.,1.6)+seed)-.5);
 for(int k=0;k<2;k++){float fk=float(k);float yk=.80-.09*fk;float wk=(.20+.04*fk)*(.8+.4*h11(fk+seed));
  cn=min(cn,sdEll(q-b-vec2((h11(fk*3.+seed)-.5)*.06*h,h*yk),vec2(h*wk,h*.035))-h*.012*(vn(q*90./h+fk)-.5));}
 float d=min(tr,cn);if(d>PX*4.)return;
 vec3 c=tr<cn?vec3(.40,.34,.30):vec3(.30,.36,.24)*(.85+.30*vn(q*200./h));
 c=mix(c,vec3(.74,.76,.78),a.w);
 PIECE(d,c,K_FAR,q*4.,vec2(1,0),.003,.15,1.);}

void stBackdrop(vec2 q,float t){
 float hor=-.03;
 if(q.y>hor-.02){
  // a wide sky: blue above, a warm pale haze towards the horizon, slow soft clouds; a far low line of scrub on the horizon
  vec3 sk=mix(vec3(.92,.86,.74),vec3(.56,.70,.86),ss(-.02,.55,q.y));sk=mix(sk,vec3(.40,.56,.78),ss(.5,1.3,q.y));
  float cl=fbm2(vec2(q.x*1.1+t*.004,q.y*3.2)+3.);float cm=ss(.52,.70,cl)*ss(.06,.22,q.y)*ss(.75,.40,q.y);
  sk=mix(sk,mix(vec3(1.,.98,.94),vec3(.80,.80,.84),ss(.70,.55,cl)),cm*.85);
  float far=hor+.012+.010*fbm2(vec2(q.x*9.,1.))+.006*vn(vec2(q.x*60.,3.));
  sk=mix(sk,vec3(.66,.64,.62),ss(PX,-PX,q.y-far));
  PIECE(-1.,sk,K_SKY,q*2.+vec2(t*.004,0.),vec2(1,0),.1,0.,1.);
  // two pterosaurs gliding far off, high in the sky, with a slow wingbeat now and then
  for(int k=0;k<2;k++){float fk=float(k);vec2 c=vec2(-1.05+2.1*fract(t*.008+.35*fk+.25),.30+.07*fk+.012*sin(t*.4+fk*2.));float w=.020-.006*fk;
   float fl=.35*sin(t*3.2+fk)*ss(.6,.9,sin(t*.5+fk*1.7));vec2 l=(q-c)/w;l.x=abs(l.x);
   float d=min(sdCap(l,vec2(0.,-.02),vec2(.48,.14+fl),.17,.09),sdCap(l,vec2(.48,.14+fl),vec2(1.05,-.06+fl*.6),.09,.02));d=min(d,sdEll(l-vec2(0.,-.06),vec2(.10,.12)));
   veil(mix(vec3(.38,.36,.40),sk,.35+.15*fk),ss(.06,.0,d),1.);}
  for(int i=0;i<6;i++)stArau(q,ST_ARAU[i],t,float(i)*1.7+.3);}
 // the dry floodplain: pale silt, darker patches of moss and old leaves, a few cracks; a dry channel far off
 if(q.y<hor+.01){vec3 ga=mix(vec3(.74,.64,.50),vec3(.66,.56,.42),ss(hor,-.6,q.y));
  float mo=fbm2(q*vec2(2.5,7.)+1.);ga*=.90+.16*mo;ga=mix(ga,vec3(.50,.48,.32),ss(.62,.80,mo)*.40*ss(-.08,-.3,q.y));
  ga=mix(ga,vec3(.80,.72,.58),ss(.012,.0,abs(q.y+.085+.010*sin(q.x*3.)))*ss(.3,.0,abs(q.x+.30))*.6);
  float ck=abs(vn(q*vec2(14.,40.))-.5);ga*=1.-.14*ss(.035,.0,ck)*ss(-.12,-.4,q.y);
  // footprints of the hind feet in the silt, behind the animal
  for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(.12+fi*.16,-.325-.02*mod(fi,2.));vec2 l=(q-c)/vec2(.030,.010);
   float pr=min(min(length(l)-.5,sdCap(l,vec2(0.),vec2(-.9,.28),.20,.14)),min(sdCap(l,vec2(0.),vec2(-1.,0.),.20,.14),sdCap(l,vec2(0.),vec2(-.9,-.28),.20,.14)));
   ga*=1.-.22*ss(.12,-.05,pr)*ss(-.6,-.1,pr+.3);}
  PIECE(q.y-hor,ga,K_SAND,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);
  // dust haze over the far ground
  veil(vec3(.88,.80,.66),ss(-.25,hor,q.y)*.35+.10*ss(.55,.8,fbm2(q*vec2(2.5,9.)+vec2(t*.06,0.)))*ss(-.6,-.1,q.y),1.);}   // dust haze, and drifting wisps
 // low ferns scattered over the middle distance
 for(int r=0;r<2;r++){float fr=float(r);float y0=-.072-fr*.075;float sc=.022+fr*.014;float cw=sc*3.;float x=q.x/cw+fr*2.3;float ci=floor(x);
  if(h11(ci+fr*5.)<.55)continue;vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.5-fr*2.3)*cw,y0+(h11(ci+7.)-.5)*.02);
  stFerns(q,b,sc,t,5.,ci,vec3(.32,.40,.20),.35-.15*fr);}
 for(int i=0;i<4;i++){vec4 c=ST_CYCS[i];stCycad(q,c.xy,c.z,t,float(i)*2.3+1.,c.w,0.,0.,1.);}
}

void stScene(vec2 q,float t,float grow){
 // one key light: a warm, high sun on the left, a little in front; the shade cool with the light of the wide sky
 SUNL=normalize(vec3(-.30,.88,.20));SUNC=vec3(1.20,1.08,.90);AMBC=vec3(.52,.57,.68);BACK=0.;
 stBackdrop(q,t);
 // the cycad the tail brushes (a story prop): it shakes from 9.2, sways back and settles by 11
 float hit=t-9.2;float shake=hit>0.?exp(-hit*1.6):0.;float lean=hit>0.?.9*exp(-hit*1.4)*sin(hit*TAU*.75+.3):0.;
 stCycad(q,ST_CYC.xy,ST_CYC.z,t,7.,0.,shake*ss(9.15,9.25,t),lean,0.);
 StPose p=stPose(t);
 // its soft shadow on the ground, cast mostly under it and a little to the right (the sun high on the left)
 {vec2 l=(q-ST_A.xy)/ST_A.z;if(l.y>-.4&&l.y<.6&&l.x>-6.&&l.x<7.){float hg=max(l.y,0.)/.07;float sd=stSil(vec2(ST_A.w*(l.x-.34*hg)-p.bx,hg),p);
  shadow(ss(.40,-.40,sd)*ss(-.30,.05,l.y)*.45,vec3(.56,.58,.70),0.);}}
 contact(q,ST_A.xy+vec2(-.10,.0),.34,.45);
 stSaur(q,t,p,grow);
 // dust: puffs where the feet land (4.0, 4.4) and where the tail brushes the cycad (9.2); motes drifting in the light
 for(int k=0;k<2;k++){float t0=k==0?4.0:4.4;vec2 c=k==0?vec2(-.34,-.30):vec2(-.07,-.30);float a=t-t0;if(a<0.||a>2.5)continue;
  vec2 l=(q-c-vec2(-.02*a,.03*a))/vec2(.05+.05*a,.020+.025*a);veil(vec3(.86,.78,.64),ss(1.,.2,length(l))*ss(2.5,.3,a)*ss(0.,.1,a)*.30*(.7+.3*fbm2(l+t)),0.);}
 {vec2 g=q*vec2(26.,30.)+vec2(t*.20,sin(t*.3)*.5);vec2 gi=floor(g);vec2 o=fract(g)-.5-(h22(gi)-.5)*.6;float on=step(.85,h21(gi+3.));
  veil(vec3(1.,.95,.82),ss(.08,.0,length(o))*on*.35*ss(-.30,.0,q.y)*ss(.25,.0,q.y),1.);}
 for(int i=0;i<5;i++){vec4 f=ST_FFERN[i];stFerns(q,f.xy,f.z,t,f.w,float(i)*4.+3.,vec3(.26,.36,.17),0.);}
}
void stFossil(vec2 q){
 float s=ST_A.z;vec2 m=(q-ST_A.xy)/s;m.x*=ST_A.w;if(m.x<-4.9||m.x>4.2||m.y<-.3||m.y>4.0)return;
 StPose p=stPose(0.);vec2 Hn=p.Hn,Fn=p.Fn;
 vec2 An=Hn+vec2(-.12,.42),Kn=knee(ST_H,An,1.05,.80,1.),Wn=Fn+vec2(0.,.26),En=knee(ST_S,Wn,.62,.52,-1.);
 vec2 h=rot(p.ha)*(m-p.C);float sk=9.;if(h.x>-.3&&h.x<.7&&h.y>-.3&&h.y<.3){float bk;sk=max(min(stHead(h,0.,bk),bk),-sdEll(h-vec2(.12,.04),vec2(.04,.04)));}
 vec3 o,of;vec2 pl=stPlates(m,p,o,of);
 float d=stBones(m,p,sk,Kn,An,En,Wn,min(pl.x,pl.y)+.02);PIECE(d*s,vec3(.66,.60,.50),K_FOSSIL,m*.4,vec2(1,0),.05*s,.6,0.);}

const vec2 WIN_C=vec2(.02,-.10);
float stWin(vec2 q){return length((q-WIN_C)*vec2(1.,1.15))-RFULL*ss(0.,.62,uLife);}
void fossil(vec2 q){if(uLife>.001&&stWin(q)<-.09)return;stFossil(q);}
void life(vec2 q,float t){if(uLife<.999&&stWin(q)>.09)return;stScene(q,t,GROW);}

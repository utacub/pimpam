// ---- Scene 3 (El pou del temps, CE37): a woolly rhinoceros (Coelodonta antiquitatis) and a giant deer stag (Megaloceros giganteus)
// on the glacial steppe of Eurasia, a winter morning: a pale turquoise sky, the low sun on the left, long blue shadows on the snow.
// 4.0–7.0 the rhino sweeps the snow from side to side with its long front horn, uncovering the grass, and the snow sprays; then it
// steps forward and grazes. 5.5–6.5 the KEY: the stag, in the middle distance, shakes its head and a cascade of snow falls from its
// palmate antlers. 9.5–10.5 the echo: the stag gives a soft bellow in a cloud of breath; 10.0–10.6 the rhino lifts its head, chewing,
// and snorts. Calm after. Scales: the rhino .19 screen units per metre, the stag .13 (further away). ----
const float RH_S=.19,MG_S=.13,RH_HS=1.20;
const vec2 RH_P=vec2(-.12,-.36);   // the rhino: the ground under the middle of its body (it faces -x)
const vec2 MG_P=vec2(.46,-.22);    // the stag: the ground under the middle of its body (its body faces -x, its head turns to us)
const float WH_HZ=.06;            // the horizon

// ---- Light: the low sun of the morning on the left, a little behind the animals; the blue of the sky in the shadows ----
void whLight(){SUNL=normalize(vec3(-.88,.32,-.14));SUNC=vec3(1.58,1.30,1.00);AMBC=vec3(.50,.58,.72);BACK=.55;}
// The landscape keeps a light more from the front, so the snow is lit as the eye expects under a low sun.
void whLightG(){SUNL=normalize(vec3(-.80,.30,.42));SUNC=vec3(1.50,1.26,1.00);AMBC=vec3(.46,.56,.70);BACK=.2;}
vec3 whLit(vec3 n){return AMBC*(.55+.45*n.z)+SUNC*lambert(n)*.85+vec3(.30,.32,.36)*sat(-n.y)*.35;}
vec3 whRel(vec3 n){return whLit(n)/whLit(vec3(0.,0.,1.));}
// The relief of a body as overlapping ellipsoid masses (see scene 2): each adds its normal, weighted towards the nearest surface.
void whBump(inout vec4 acc,vec2 p,vec2 c,float ang,vec2 r,float rz,float z0,float K){
 vec2 u=rot(ang)*(p-c)/r;float s=1.-dot(u,u);float sq=sqrt(max(s,1e-4));
 vec3 n=normalize(vec3(u.x/r.x*rz,u.y/r.y*rz,sq));n.xy=rot(-ang)*n.xy;
 acc+=ss(0.,.25,s)*exp(K*(rz*sq+z0))*vec4(n,1.);}
vec3 whN(vec4 acc){return acc.w>0.?normalize(mix(acc.xyz/acc.w,vec3(0.,0.,1.),.12)):vec3(0.,0.,1.);}
// The contour of a figure: dark, thinner and broken where the sun catches the edge.
float whLine(vec2 g,vec2 p,float k){vec2 n=g/max(length(g),1e-9);return k*(1.-.85*sat(dot(n,normalize(SUNL.xy))*1.5))*(.55+.55*vn(p));}
// A thin rim of low sun just inside the sunward edge of a piece.
void whRim(float d,vec2 g,float w,float k){if(d>PX||d<-w)return;vec2 n=g/max(length(g),1e-9);
 float f=ss(-w,-PX*2.,d)*(1.-ss(-PX*1.2,PX,d))*pow(sat(dot(n,normalize(SUNL.xy))),1.5);glow(SUNC*vec3(1.,.85,.62)*f*k,0.);}
// A capsule chain a→b→c with its radii, and where the pixel lies across it (-1 one edge .. 1 the other; side>0 towards the left of
// the direction of travel turned clockwise).
float whCurve(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rb,float rc,out float side,out float along){
 float u1=segU(p,a,b),u2=segU(p,b,c);vec2 p1=mix(a,b,u1),p2=mix(b,c,u2);float r1=mix(ra,rb,u1),r2=mix(rb,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;vec2 t1=normalize(b-a),t2=normalize(c-b);
 side=d1<d2?dot(p-p1,vec2(t1.y,-t1.x))/r1:dot(p-p2,vec2(t2.y,-t2.x))/max(r2,1e-3);along=d1<d2?u1*.5:.5+u2*.5;
 return smin(d1,d2,min(ra,rc)*.6+.005);}

// Long hair painted in locks: long pointed locks hanging along dir, in overlapping layers (nl), staggered so their tips do not line
// up, each tilted and of its own length, gently wavy; each a little lighter or darker, lit along its middle, darker towards its tip;
// the hair underneath in shade. sc: locks per metre across and along.
float whLocks(vec2 m,vec2 dir,vec2 sc,int nl){vec2 pp=vec2(-dir.y,dir.x);vec2 r=vec2(dot(m,pp),dot(m,dir))*sc;r.x+=.9*(vn(vec2(r.y*.35,r.x*.15))-.5);float v=.72;
 for(int k=0;k<nl;k++){float fk=float(k);vec2 g=r+fk*vec2(.37,.29);float cx=floor(g.x);g.y+=h11(cx*3.7+fk*1.3)*1.7;vec2 ci=vec2(cx,floor(g.y));
  float hh=h21(ci*1.7+fk*5.);vec2 f=fract(g)-.5;float tp=sat((f.y+.5)*(.75+.45*h11(ci.x*2.9+ci.y*1.1+fk)));
  f.x+=.10*sin(tp*3.+ci.x*1.7)-(h11(ci.x*5.1+ci.y*2.3+fk)-.5)*.30-(hh-.5)*.40*tp;
  float w=.50*(1.-pow(tp,1.5))*(.70+.45*h11(ci.y*4.1+ci.x+fk));float on=ss(w,w*.45,abs(f.x))*ss(.0,.06,tp)*step(tp,.999);
  float sh=(.84+.32*hh)*(1.06-.24*tp*tp)*(1.-.14*ss(.2,1.,abs(f.x)/max(w,.01)));
  v=mix(v,sh,on);}
 return v;}

// ---- The rhino's motion ----
struct Rh{vec2 hp;float ha,hy,jaw,ear,br,tail,bx,fN,fF,hN,hF,snort,sweep,grz;};
// The sweeps: five strokes of the horn through the snow, one every 0.62 s from 4.25 (alternately towards us and away).
float rhSweepEnv(float t){return ss(4.0,4.3,t)*(1.-ss(6.85,7.15,t));}
Rh rhRig(float t){Rh a;
 a.br=sin(t*1.35);
 a.sweep=rhSweepEnv(t);float ph=(t-4.25)/.62;float cs=cos(PI*ph);
 a.grz=ss(7.2,7.65,t)*(1.-ss(9.85,10.15,t));
 float lf=ss(10.0,10.55,t)*(1.-ss(12.1,12.9,t));
 a.snort=ss(10.32,10.38,t)*(1.-ss(10.42,10.62,t));
 float pull=0.;for(int i=0;i<3;i++){float tp=7.85+float(i)*.78;pull+=ss(tp,tp+.08,t)*(1.-ss(tp+.12,tp+.34,t));}
 a.hp=vec2(-.86,1.08)+vec2(.0,.012*a.br)+vec2(-.10,-.03)*a.sweep+vec2(-.06,-.04)*a.grz*(1.-a.sweep)+vec2(.05,.10)*lf+vec2(0.,.05)*pull*a.grz;
 a.ha=.98+.02*sin(t*.5)+a.sweep*(.36-.08*cs*cs)+.40*a.grz*(1.-a.sweep)-.12*pull*a.grz-.45*lf-.06*a.snort;
 a.hy=.46*cs*a.sweep;
 a.jaw=max(a.grz*(.5+.5*sin(t*8.6)),lf*(.5+.5*sin(t*7.2)))*.8;
 float ef=fract(t/3.3+.3);a.ear=ss(.0,.04,ef)*ss(.16,.08,ef)+.4*a.snort;
 a.tail=.25*sin(t*1.7)+.5*ss(.0,.1,fract(t/5.1))*ss(.4,.2,fract(t/5.1))*sin(t*9.);
 // it steps forward to the uncovered grass: the near forefoot (7.05–7.5), then the far one (7.35–7.85); the body follows
 a.bx=-.45*ss(7.0,8.0,t);a.hp.x+=a.bx;a.fN=ss(7.05,7.45,t);a.hN=ss(7.25,7.70,t);a.fF=ss(7.35,7.80,t);a.hF=ss(7.60,8.05,t);
 return a;}
// The near and far forefeet (on the ground, in the rhino's frame) and their lift.
vec3 rhFoot(float k,float x0){float lift=sin(PI*k)*.15;return vec3(x0-.45*ss(.0,1.,k),lift,0.);}

// ---- The rhino's shapes (its own frame: metres, the ground at y 0, facing -x) ----
// The head (frame h: origin at the back of the skull, facing -x): a long head carried low, a broad square upper lip for grazing.
float rhHead(vec2 h,float jaw,out float dEar,float ear){
 float cr=sdEll(h-vec2(-.15,.01),vec2(.28,.21));
 float fc=sdCap(h,vec2(-.25,-.02),vec2(-.63,-.08),.19,.14);
 float lp=sdEll(h-vec2(-.72,-.12),vec2(.12,.11));
 float jw=sdEll(rot(-.10*jaw)*(h-vec2(-.15,-.12))-vec2(-.28,-.06),vec2(.30,.085));
 vec2 e=rot(-.35-ear*.45)*(h-vec2(-.03,.13));dEar=sdEll(e-vec2(0.,.085),vec2(.048,.10));
 float d=smin(cr,fc,.07);d=smin(d,lp,.04);d=smin(d,jw,.05);d=smin(d,dEar,.02);return d;}
// The front horn: long, flattened from side to side (so we see its broad face), curving forward and up from the nose; and the short
// second horn on the forehead. side: across it; along: from the base to the tip.
float whBlade(vec2 p,vec2 a,vec2 b,vec2 c,float r0,float r1,out float side,out float along){float d=1e5;side=0.;along=0.;vec2 o=a;
 for(int i=1;i<=6;i++){float u=float(i)/6.;vec2 e=mix(mix(a,b,u),mix(b,c,u),u);float u0=(float(i)-1.)/6.;float ra=mix(r0,r1,pow(u0,.8)),rb=mix(r0,r1,pow(u,.8));
  float k=segU(p,o,e);float dd=length(p-mix(o,e,k))-mix(ra,rb,k);if(dd<d){d=dd;vec2 tg=normalize(e-o);side=dot(p-mix(o,e,k),vec2(tg.y,-tg.x))/max(mix(ra,rb,k),1e-3);along=mix(u0,u,k);}o=e;}
 return d;}
float rhHorn1(vec2 h,out float side,out float along){return whBlade(h,vec2(-.62,.03),vec2(-.92,.62),vec2(-.68,1.04),.115,.010,side,along);}
float rhHorn2(vec2 h,out float side,out float along){return whBlade(h,vec2(-.36,.12),vec2(-.43,.33),vec2(-.33,.46),.075,.010,side,along);}
// The body: a high hump of muscle over the shoulders (it carries the heavy head), a deep chest, a long barrel, a rounded rump; a short
// thick neck; a fringe of long hair under the belly and the throat.
float rhBody(vec2 m,Rh a,out float dSk){
 float hu=sdEll(rot(.30)*(m-vec2(-.50,1.56)),vec2(.64,.46));        // the hump of fat and hair over the shoulders
 float ch=sdEll(m-vec2(-.44,1.04),vec2(.52,.50));                    // the deep chest
 float ba=sdEll(m-vec2(.38,1.08),vec2(1.00,.50+.010*a.br));           // the barrel, its belly sagging a little between the legs
 float ru=sdEll(m-vec2(1.16,1.15),vec2(.50,.46));                     // the rounded rump
 float tg=sdEll(rot(.22)*(m-vec2(1.10,.86)),vec2(.36,.46));           // the thigh
 float sh=sdEll(m-vec2(-.40,.82),vec2(.30,.40));                      // the shoulder and the upper foreleg
 float d=smin(smin(hu,ch,.20),ba,.25);d=smin(d,ru,.22);d=smin(d,tg,.10);d=smin(d,sh,.10);
 // the neck: short and thick, from the hump down to the back of the head
 vec2 nE=a.hp-vec2(a.bx,0.)+rot(-a.ha)*vec2(.06,-.06);d=smin(d,sdCap(m,vec2(-.70,1.36),nE,.42,.32),.16);
 // the belly fringe: long pointed locks of different lengths, longest between the legs
 float lx=m.x*6.+.3*m.y;float li=floor(lx),tr=1.-abs(2.*fract(lx)-1.);float lx2=m.x*15.+.7;float l2=floor(lx2),tr2=1.-abs(2.*fract(lx2)-1.);
 float bell=ss(-.45,.10,m.x)*ss(1.15,.55,m.x);
 float yb=.60-.12*bell-.20*h11(li)*pow(tr,1.4)*(.5+.5*bell)-.08*h11(l2)*pow(tr2,1.2);
 dSk=max(sdBox(m-vec2(.35,.76),vec2(.78,.34))-.08,yb-m.y);
 // the throat fringe, the longest hair of all
 float lt=m.x*11.;float th=max(sdEll(m-vec2(-.82,1.02),vec2(.26,.38)),.66-.16*h11(floor(lt))*(1.-abs(2.*fract(lt)-1.))-m.y);
 return smin(smin(d,dSk,.06),th,.08);}
// A leg from its top a to its foot f (IK, knee towards bs), radii; and the foot: broad, three hoofed toes.
float rhLeg(vec2 m,vec2 a,vec2 f,float l1,float l2,float bs,float r0,float r1,float r2){vec2 k=knee(a,f+vec2(0.,.12),l1,l2,bs);
 float d=smin(sdCap(m,a,k,r0,r1),sdCap(m,k,f+vec2(0.,.12),r1,r2),.06);
 return smin(d,sdEll(m-f-vec2(-.03,.085),vec2(.18,.095)),.05);}
float rhTail(vec2 m,Rh a){vec2 b=vec2(1.62,1.32),tp=b+vec2(.12+.05*a.tail,-.36+.03*a.tail);return smin(sdCap(m,b,tp,.055,.04),sdEll(rot(-.2-.3*a.tail)*(m-tp-vec2(.02,-.07)),vec2(.055,.11)),.03);}
// The bones (fossil, and under the growing flesh): the long skull with the rough boss under the horn, the jaw, the tall spines over the
// shoulders, the ribs, the shoulder blade, the pelvis, the legs.
float rhBones(vec2 m,Rh a){vec2 h=rot(a.ha)*(m-a.hp)/RH_HS;float d=1e5,tt;
 float sk=smin(sdEll(h-vec2(-.30,-.02),vec2(.40,.13)),sdEll(h-vec2(-.05,.07),vec2(.10,.08)),.05);sk=max(sk,-sdEll(h-vec2(-.33,.0),vec2(.035,.03)));
 sk=smin(sk,sdEll(h-vec2(-.60,.04),vec2(.09,.05)),.03);d=min(d,sk);
 d=min(d,sdCap(h,vec2(-.08,-.12),vec2(-.62,-.17),.045,.035));d=min(d,sdCap(h,vec2(-.08,-.12),vec2(-.04,-.02),.035,.03));
 d=min(d,sdTube(m,a.hp+rot(-a.ha)*vec2(.05,-.02),vec2(-.62,1.38),vec2(-.40,1.50),.05,.06,tt));
 d=min(d,sdTube(m,vec2(-.40,1.50),vec2(.50,1.50),vec2(1.60,1.32),.06,.05,tt));
 for(int i=0;i<6;i++){float x=-.62+float(i)*.12;float y=1.50+.02*float(i);d=min(d,sdSeg(m,vec2(x,y),vec2(x+.05,y+.36-float(i)*.04))-.022);}
 for(int i=0;i<9;i++){float fi=float(i);float x=-.30+fi*.17;float y0=1.48-.01*fi;d=min(d,sdTube(m,vec2(x,y0),vec2(x+.22,y0-.35),vec2(x+.10,.78+.02*fi),.025,.018,tt));}
 d=min(d,sdEll(rot(.45)*(m-vec2(-.42,1.18)),vec2(.13,.30)));
 float pv=sdEll(rot(-.3)*(m-vec2(1.25,1.25)),vec2(.30,.12));d=min(d,pv);
 d=min(d,sdCap(m,vec2(-.40,1.0),vec2(-.30,.62),.07,.06));d=min(d,sdCap(m,vec2(-.30,.62),vec2(-.32,.14),.06,.05));
 d=min(d,sdCap(m,vec2(1.20,1.15),vec2(1.12,.62),.08,.06));d=min(d,sdCap(m,vec2(1.12,.62),vec2(1.22,.14),.055,.05));
 for(int i=0;i<2;i++){float x0=i==0?-.33:1.18;d=min(d,sdEll(m-vec2(x0,.07),vec2(.14,.05)));}
 return d;}
// The rhino: far legs, then one piece of long wool for the body, head and near legs, the horns, the details.
void rhino(vec2 q,float t,Rh a,float grow){
 vec2 m=(q-RH_P)/RH_S;
 if(m.x<-3.2||m.x>2.1||m.y<-.15||m.y>2.5)return;   // wide enough for the horn when the head reaches forward and the body has stepped
 bool needB=grow<.6;float dB=needB?rhBones(m,a)*RH_S:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.74),K_BONE,m*.6,vec2(1,0),.01,.8,0.);
 vec2 mb=m-vec2(a.bx,0.);   // the body moves forward as it steps
 vec3 fN=rhFoot(a.fN,-.36),fF=rhFoot(a.fF,-.26),hN=rhFoot(a.hN,1.16),hF=rhFoot(a.hF,1.24);
 vec2 uw=m*RH_S*1.6;        // the coat's locks: a little finer than the mammoth's
 // the far legs, in the blue shade
 {vec2 o=vec2(.10,.06);
  float d=rhLeg(m-o,vec2(-.34+a.bx,.98),fF.xy,.48,.46,-1.,.22,.17,.14);
  d=min(d,rhLeg(m-o,vec2(1.14+a.bx,1.02),hF.xy,.50,.48,1.,.27,.18,.14));
  float dd=d*RH_S;if(needB)dd=max(dd,dB-G);
  vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,vec3(.17,.12,.09)*vec3(.88,.94,1.08)*whLocks(m,vec2(0,-1),vec2(16.,6.),2),K_FUR,m*.25,vec2(0,-1),.03,whLine(g,m*9.,.8),0.);}
 // the head, its yaw as it sweeps (foreshortened as it turns towards us or away)
 vec2 h=rot(a.ha)*(m-a.hp)/RH_HS;float cy=max(cos(a.hy),.5);h.x/=cy;
 float dEar;float dHd=rhHead(h,a.jaw,dEar,a.ear)*cy*RH_HS;
 // the coat: body, neck, head, fringe, tail and the near legs: one piece of long wool, darker on the legs and the belly, the long hair
 // of the hump and the neck paler (bleached), the head with shorter hair
 float dSk;float bd=rhBody(mb,a,dSk);
 float dL=min(rhLeg(m,vec2(-.34+a.bx,.98),fN.xy,.48,.46,-1.,.24,.18,.15),rhLeg(m,vec2(1.14+a.bx,1.02),hN.xy,.50,.48,1.,.30,.19,.15));
 float dT=rhTail(mb,a);
 float d=smin(smin(bd,dHd,.10),dL,.06);d=min(d,dT);
 // the silhouette: lock tips everywhere; along the hump and the back they lie backwards in tufts that the low sun catches
 float tuft=fract(mb.x*6.5+.6*vn(vec2(mb.x*2.,3.)));float top=ss(1.25,1.65,m.y)*(1.-ss(-.06,.0,dHd-bd));
 float dW=d-.012*(vn(uw*vec2(60.,25.))-.35)-.055*tuft*tuft*top-.02*(vn(vec2(mb.x*13.,mb.y*4.))-.5);
 if(needB)dW=max(dW,dB/RH_S-G/RH_S);
 float head=ss(.05,-.06,dHd-min(bd,dL));
 float leg=ss(.02,-.06,dL-min(bd,dSk))*ss(.80,.55,m.y);
 // the regions of the coat, each with its own flow: the hump and the neck (long, down and back), the throat (longest, down), the barrel
 // and the belly fringe (down), the rump (back and down round it), the legs (short), the face (short, along it)
 float wH=ss(.15,-.35,mb.x)*ss(1.10,1.45,m.y),wT=ss(-.60,-.85,mb.x)*ss(1.25,.95,m.y),wR=ss(.75,1.15,mb.x)*ss(.75,1.0,m.y);
 float L=whLocks(mb,normalize(vec2(.16,-1.)),vec2(8.,2.2),3);
 L=mix(L,whLocks(mb+vec2(2.3,.7),normalize(vec2(.42,-1.)),vec2(7.,1.9),3),wH);
 L=mix(L,whLocks(mb+vec2(1.1,2.9),normalize(vec2(.75,-1.)),vec2(8.,2.4),2),wR);
 L=mix(L,whLocks(mb+vec2(4.1,.3),normalize(vec2(-.10,-1.)),vec2(8.,1.6),2),wT);
 L=mix(L,whLocks(m+vec2(.7,1.9),vec2(.05,-1.),vec2(16.,6.),2),leg);
 L=mix(L,mix(1.,whLocks(h,vec2(1.,-.12),vec2(10.,20.),2),.7),head);
 vec2 dir=normalize(vec2(.16,-1.));dir=normalize(mix(dir,vec2(.50,-1.),wH));dir=normalize(mix(dir,vec2(.85,-1.),wR));dir=normalize(mix(dir,vec2(-.10,-1.),wT));
 dir=normalize(mix(dir,rot(-a.ha)*vec2(1.,-.12),head));
 // a warm red-brown coat in clumps of lighter and darker locks, darker below and on the legs; the long hair of the hump and the neck
 // bleached paler; the face with shorter hair, the muzzle bare and grey-brown
 float lk=vn(vec2(mb.x*4.5+.8*mb.y,mb.y*1.3)),lk2=vn(vec2(mb.x*11.+.9*mb.y,mb.y*2.)+4.);
 vec3 c=mix(vec3(.24,.15,.10),vec3(.50,.34,.21),ss(.45,1.50,m.y));c*=.70+.44*lk+.20*(lk2-.5);
 c=mix(c,vec3(.68,.52,.34),ss(1.25,2.0,m.y)*ss(.6,-.4,mb.x)*(.45+.55*lk));
 c=mix(c,vec3(.56,.42,.28),wT*.5);
 c=mix(c,vec3(.19,.12,.09),leg*.8);
 vec3 hcol=mix(vec3(.44,.31,.20),vec3(.38,.29,.23),ss(-.42,-.70,h.x));hcol=mix(hcol,vec3(.27,.20,.15),ss(-.05,.12,h.y)*ss(-.20,.02,h.x)*.5);
 c=mix(c,hcol,head);
 // the relief: hump, chest, barrel, rump, thigh, shoulder, the head
 vec4 A=vec4(0.);const float K=6.;
 whBump(A,mb,vec2(-.50,1.56),.30,vec2(.64,.46),.45,.0,K);whBump(A,mb,vec2(-.44,1.04),0.,vec2(.52,.50),.50,0.,K);
 whBump(A,mb,vec2(.38,1.08),0.,vec2(1.0,.50),.55,0.,K);whBump(A,mb,vec2(1.16,1.15),0.,vec2(.50,.46),.48,.04,K);
 whBump(A,mb,vec2(1.10,.86),.22,vec2(.36,.46),.28,.10,K);whBump(A,mb,vec2(-.40,.82),0.,vec2(.30,.40),.22,.10,K);
 vec4 B=vec4(0.);whBump(B,h,vec2(-.15,.01),0.,vec2(.28,.21),.20,.10,K);whBump(B,h,vec2(-.45,-.05),0.,vec2(.30,.17),.15,.12,K);whBump(B,h,vec2(-.72,-.12),0.,vec2(.12,.11),.10,.14,K);
 B.xy=rot(-a.ha)*B.xy;A+=B*head;
 vec3 n=whN(A);c*=mix(vec3(1.),whRel(n),.55);
 c*=L;
 // hoar frost on the long hair of the back
 c=mix(c,vec3(.86,.88,.94),ss(.5,.9,n.y)*ss(1.55,1.85,m.y)*ss(.45,.75,lk2)*.25);
 float dd=dW*RH_S;vec2 g=vec2(dFdx(dd),dFdy(dd));
 piece(dd,g,c,K_FUR,m*.25,dir,.06*RH_S,whLine(g,m*9.,.85),0.);
 whRim(dd,g,mix(.010,.020,top),mix(.70,1.0,top));
 if(G<.3)return;
 // the shade under the overhanging hair of the belly and the throat on the legs
 shadow(ss(.25,.55,m.y)*ss(.75,.5,m.y)*ss(.0,-.04,dL)*ss(.03,-.02,dW)*ss(.0,.05,bd)*.35,vec3(.45,.42,.50),0.);
 // the toes: three hoofed toes at the front of each near foot
 for(int i=0;i<2;i++){vec2 f=i==0?fN.xy:hN.xy;float tc=1e5;for(int k=0;k<2;k++){float x=f.x-.17+float(k)*.10;tc=min(tc,sdSeg(m,vec2(x,f.y+.02),vec2(x+.01,f.y+.10)));}
  shadow(ss(.025,.0,tc)*ss(.0,-.03,dL)*.45,vec3(.35,.30,.30),0.);}
 // the ear: a darker rim, a paler inside, a tuft at its tip
 shadow(ss(.012,-.02,dEar)*ss(-.03,.0,dEar+.03)*.40,vec3(.45,.38,.36),0.);veil(vec3(.58,.47,.37),ss(-.025,-.045,dEar)*.45,0.);
 // the horns: keratin, flattened from side to side (a broad blade from the side), almost black at the base, browner towards the tip; a
 // fibrous grain along them; the front edge paler and smoothed where it is worn by sweeping the snow
 {float s1,a1,s2,a2;float d1=rhHorn1(h,s1,a1)*cy*RH_HS,d2=rhHorn2(h,s2,a2)*cy*RH_HS;float dh=min(d1,d2);if(needB)dh=max(dh,dB/RH_S-G/RH_S);
  bool h1=d1<d2;float sd=h1?s1:s2,al=h1?a1:a2;
  vec3 hc=mix(vec3(.26,.20,.15),vec3(.48,.39,.29),ss(.05,.70,al));hc=mix(hc,vec3(.56,.48,.38),ss(.70,1.,al));
  hc*=.88+.24*vn(vec2(sd*3.,al*40.));                                                          // the grain
  hc=mix(hc,vec3(.72,.66,.57),ss(-.35,-.85,sd)*ss(.10,.40,al)*(h1?.9:.4));                     // the worn front edge
  hc=mix(hc,hc*.70,ss(.35,.95,sd)*.5);
  float e=dh*RH_S;vec2 g2=vec2(dFdx(e),dFdy(e));
  piece(e,g2,hc,K_HORN,h*6.,rot(-a.ha)*normalize(vec2(-.2,1.)),.004,whLine(g2,h*20.,.8)*ss(.04,.18,al),0.);
  whRim(e,g2,.005,.60);
  // the base grows out of the hair of the nose
  veil(hcol*.85,ss(.14,.02,al)*ss(PX,-PX,e)*.85,0.);}
 // the eye (small, far back behind the horns, in a ring of wrinkled skin), the nostril, the line of the lips
 {vec2 ec=vec2(-.36,.035);vec2 eq=RH_P+RH_S*(a.hp+rot(-a.ha)*vec2(ec.x*cy,ec.y)*RH_HS);
  shadow(ss(.075,.02,length(h-ec))*.35,vec3(.50,.42,.40),0.);veil(vec3(.48,.40,.33),ss(.055,.040,length(h-ec))*ss(.032,.044,length(h-ec))*.5,0.);
  eyeA(q,eq,.034*RH_S,vec3(.30,.19,.11),vec3(.30,.23,.18),blinkAt(t,.3),0.);
  float nn=sdEll(rot(.5)*(h-vec2(-.79,-.06)),vec2(.035+.012*a.snort,.016+.008*a.snort));shadow(ss(.008,-.004,nn)*.9,vec3(.10,.08,.07),0.);
  float ml=sdSeg(h,vec2(-.80,-.175-.03*a.jaw),vec2(-.52,-.20-.02*a.jaw))-.010;shadow(ss(.01,-.004,ml)*.6,vec3(.22,.17,.14),0.);}
 // a wisp of grass in the mouth while it chews with its head up
 {float lf=ss(10.0,10.55,t)*(1.-ss(11.6,12.2,t));if(lf>.01){float gw=1e5;for(int i=0;i<3;i++){float fi=float(i);vec2 b=vec2(-.74,-.18);vec2 tp=b+vec2(-.12-.03*fi,-.10+.05*fi+.02*sin(t*7.+fi));gw=min(gw,sdSeg(h,b,tp));}
  veil(vec3(.78,.68,.42),ss(.022,.004,gw)*lf,0.);}}
}
// The rhino's shadow on the snow: long and blue, cast to the right and a little towards us by the low sun (its outline seen from the sun).
float rhSil(vec2 m,Rh a){vec2 mb=m-vec2(a.bx,0.);float d=sdEll(mb-vec2(.45,1.15),vec2(1.15,.55));d=min(d,sdEll(mb-vec2(-.42,1.45),vec2(.58,.48)));d=min(d,sdCap(m,vec2(-.6+a.bx,1.3),a.hp,.4,.3));
 d=min(d,sdCap(m,a.hp,a.hp+rot(-a.ha)*vec2(-.92,-.1),.26,.16));d=min(d,sdCap(m,a.hp+rot(-a.ha)*vec2(-.75,.05),a.hp+rot(-a.ha)*vec2(-.90,1.18),.14,.02));
 d=min(d,sdCap(mb,vec2(-.3,.9),vec2(-.33,0.),.2,.15));d=min(d,sdCap(mb,vec2(1.2,.9),vec2(1.18,0.),.25,.15));return d;}
void rhCast(vec2 q,Rh a){float dy=(RH_P.y-q.y)/RH_S;if(dy<-.05||dy>.80)return;float H=max(dy,0.)/.30;
 vec2 ms=vec2((q.x-RH_P.x)/RH_S-2.6*H,H);
 float s=ss(.16,-.16,rhSil(ms,a))*ss(-.05,.03,dy)*(1.-.45*ss(.8,2.4,H));shadow(s*.55,vec3(.56,.64,.88),1.);}

// ---- The stag ----
struct Mg{float roll,up,snow,ear,mouth,br,step,look;};
Mg mgRig(float t){Mg a;
 a.br=sin(t*1.15+1.);
 float sh=ss(5.45,5.62,t)*(1.-ss(6.25,6.6,t));
 a.roll=sh*(.26*sin(TAU*3.1*(t-5.5)))+.03*sin(t*.45);
 a.snow=1.-.85*ss(5.62,6.3,t);
 a.up=ss(9.35,9.8,t)*(1.-ss(10.45,10.95,t));
 a.mouth=ss(9.6,9.75,t)*(1.-ss(10.25,10.45,t));
 float ef=fract(t/2.9+.6);a.ear=ss(.0,.04,ef)*ss(.14,.07,ef)+.5*sh;
 a.step=ss(7.6,8.15,t);
 a.look=.04*sin(t*.37);
 return a;}
// The stag's head, seen from the front (frame f: metres, origin between the antlers' bases, x to the right of the screen, y up): a long
// narrow face with a dark muzzle, ears to the sides; the bellow lifts the muzzle (the face foreshortens) and opens the mouth.
float mgHead(vec2 f,Mg a,out float dEar){vec2 g=f;g.y/=g.y<0.?mix(1.,.72,a.up):1.;
 float fo=sdEll(g-vec2(0.,-.10),vec2(.135,.12));
 float fc=sdCap(g,vec2(0.,-.12),vec2(0.,-.40),.105,.072);
 float mz=sdEll(g-vec2(0.,-.43),vec2(.082,.068));
 float ck=sdEll(g-vec2(0.,-.22),vec2(.12,.10));
 vec2 fe=vec2(abs(f.x),f.y);vec2 e=rot(.40+a.ear*.3)*(fe-vec2(.14,-.05));dEar=sdEll(e-vec2(.10,0.),vec2(.11,.045));
 return smin(smin(smin(fo,fc,.05),mz,.03),smin(ck,dEar,.02),.04);}
// The antlers (frame f, mirrored): a short beam, a brow tine forward (towards us, so it points down here), a broad palm sweeping out and
// up with tines along its upper edge. side>0: the upper part of the palm (where the snow lies); palm: inside the palm (not a tine).
float mgAntler(vec2 f,out float up,out float palm){vec2 p=vec2(abs(f.x),f.y);
 float bm=sdCap(p,vec2(.05,.02),vec2(.32,.15),.050,.040);
 float br=sdCap(p,vec2(.16,.08),vec2(.24,-.10),.030,.008);
 vec2 pc=vec2(1.0,.33);float ang=.26;vec2 pl=rot(ang)*(p-pc);
 float dp=sdEll(pl-vec2(0.,.02),vec2(.76,.21-.08*ss(.25,.76,pl.x)-.04*ss(-.3,-.76,pl.x)))+.012*(vn(p*30.)-.5);
 float dt=1e5;for(int i=0;i<6;i++){float fi=float(i);float u=-.52+fi*.235+.05*(h11(fi*5.1)-.5);float L=.08+.22*h11(fi*3.7)+.06*fi/5.;vec2 b=vec2(u,.12-.04*fi/5.);
  vec2 tp=b+vec2(.03+.12*fi/5.+.06*(h11(fi*2.3)-.5),L);vec2 mdp=mix(b,tp,.5)+vec2(.025,0.);dt=min(dt,smin(sdCap(pl,b,mdp,.065,.032),sdCap(pl,mdp,tp,.032,.010),.02));}
 dt=min(dt,sdCap(pl,vec2(.66,.0),vec2(.86,.06),.04,.006));dt=min(dt,sdCap(pl,vec2(.62,-.04),vec2(.80,-.10),.035,.006));
 up=dp;palm=ss(.004,-.004,dp)*step(.0,pl.y);
 return smin(smin(min(bm,br),dp,.04),dt,.025);}
float mgBones(vec2 s,vec2 f){float d=1e5,tt;
 float sk=sdEll(f-vec2(0.,-.20),vec2(.10,.24));sk=max(sk,-sdEll(vec2(abs(f.x),f.y)-vec2(.07,-.12),vec2(.03,.03)));d=min(d,sk);
 float up,pa;d=min(d,mgAntler(f,up,pa));
 d=min(d,sdTube(s,vec2(-.96,2.0),vec2(-.80,1.70),vec2(-.55,1.62),.04,.05,tt));
 d=min(d,sdTube(s,vec2(-.55,1.62),vec2(.30,1.60),vec2(1.15,1.50),.05,.04,tt));
 for(int i=0;i<6;i++){float x=-.62+float(i)*.11;d=min(d,sdSeg(s,vec2(x,1.62),vec2(x+.05,1.98-float(i)*.05))-.018);}
 for(int i=0;i<8;i++){float fi=float(i);float x=-.45+fi*.15;d=min(d,sdTube(s,vec2(x,1.60),vec2(x+.18,1.30),vec2(x+.08,1.08),.02,.014,tt));}
 d=min(d,sdEll(rot(.4)*(s-vec2(-.52,1.40)),vec2(.10,.24)));d=min(d,sdEll(rot(-.3)*(s-vec2(.85,1.45)),vec2(.24,.10)));
 d=min(d,sdCap(s,vec2(-.52,1.25),vec2(-.55,.55),.05,.04));d=min(d,sdCap(s,vec2(-.55,.55),vec2(-.56,.05),.035,.03));
 d=min(d,sdCap(s,vec2(.82,1.35),vec2(1.0,.62),.06,.04));d=min(d,sdCap(s,vec2(1.0,.62),vec2(.93,.05),.035,.03));
 return d;}
vec2 mgHeadAt(Mg a){return vec2(-1.00,2.22)+vec2(.0,.10)*a.up+vec2(0.,.01*a.br);}
void stag(vec2 q,float t,Mg a,float grow){
 vec2 s=(q-MG_P)/MG_S;
 if(s.x<-2.9||s.x>1.6||s.y<-.15||s.y>3.3)return;
 vec2 hp=mgHeadAt(a);vec2 f=rot(a.roll)*(s-hp);
 bool needB=grow<.6;float dB=needB?mgBones(s,f)*MG_S:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.74),K_BONE,s*.6,vec2(1,0),.006,.8,0.);
 // the far legs, darker
 vec2 hfN=vec2(-.58-.16*a.step,0.),hfF=vec2(-.48,0.);float lift=sin(PI*a.step)*.12;
 {vec2 o=vec2(.10,.04);float d=1e5;
  vec2 k=knee(vec2(-.48,1.05),hfF+vec2(0.,.12),.50,.44,-1.);d=min(d,smin(sdCap(s-o,vec2(-.48,1.10),k,.14,.08),sdCap(s-o,k,hfF+vec2(0.,.12),.065,.055),.03));
  vec2 k2=vec2(1.06,.62);d=min(d,smin(sdCap(s-o,vec2(.85,1.22),k2,.18,.085),sdCap(s-o,k2,vec2(.98,.12),.065,.055),.03));
  d=min(d,sdEll(s-o-vec2(-.50,.05),vec2(.065,.05)));d=min(d,sdEll(s-o-vec2(.96,.05),vec2(.065,.05)));
  float dd=d*MG_S;if(needB)dd=max(dd,dB-G);vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,vec3(.36,.30,.25)*vec3(.88,.94,1.08),K_FUR,s*.2,vec2(0,-1),.006,whLine(g,s*12.,.8),0.);}
 // the body, the neck with its dark collar and mane, the hump over the withers (after the cave paintings), the near legs
 float ch=sdEll(s-vec2(-.56,1.36),vec2(.48,.48)),ba=sdEll(s-vec2(.12,1.38),vec2(.82,.40+.008*a.br)),ru=sdEll(s-vec2(.82,1.45),vec2(.38,.40));
 float hu=sdEll(rot(.20)*(s-vec2(-.47,1.80)),vec2(.46,.24));
 vec2 nTop=hp+vec2(.04,-.14);float nk=sdCap(s,vec2(-.64,1.52),nTop,.38,.22);
 float mn=max(sdEll(s-vec2(-.82,1.46),vec2(.28,.34)),1.16-.07*h11(floor(s.x*14.))-s.y);
 float bd=smin(smin(ch,ba,.15),ru,.15);bd=smin(bd,hu,.10);bd=smin(bd,nk,.10);bd=smin(bd,mn,.06);
 float tl=sdCap(s,vec2(1.15,1.62),vec2(1.22,1.40),.06,.035);
 vec2 hfN2=hfN+vec2(0.,lift);vec2 kN=knee(vec2(-.58,1.05),hfN2+vec2(0.,.12),.50,.44,-1.);
 float lg=smin(sdCap(s,vec2(-.58,1.12),kN,.16,.09),sdCap(s,kN,hfN2+vec2(0.,.12),.072,.060),.03);
 vec2 kH=vec2(1.02,.62);float lh=smin(sdCap(s,vec2(.80,1.25),kH,.21,.095),sdCap(s,kH,vec2(.92,.12),.072,.060),.03);
 lh=smin(lh,sdEll(rot(.3)*(s-vec2(.84,1.06)),vec2(.24,.32)),.05);
 float dl=min(lg,lh);
 float d=smin(bd,dl,.05);d=min(d,tl);d-=.006*(vn(s*vec2(30.,12.))-.4);
 if(needB)d=max(d,dB/MG_S-G/MG_S);
 // a warm fawn-brown coat; after the cave paintings, a dark hump over the withers, a dark band down the shoulder, a dark collar and
 // throat mane; a pale belly and rump; the coat in short clumps
 vec3 c=vec3(.54,.37,.23)*(.86+.24*vn(s*vec2(3.,6.)))*(.92+.16*vn(vec2(s.x*14.,s.y*5.)));
 c=mix(c,vec3(.82,.72,.57),ss(1.20,1.05,s.y)*ss(.02,-.03,bd-dl+.05)*(1.-ss(.0,-.05,dl)));       // the pale belly
 c=mix(c,vec3(.25,.17,.12),ss(1.60,1.84,s.y)*ss(.1,-.4,s.x));                                // the dark hump
 c=mix(c,vec3(.25,.17,.12),ss(.10,.02,abs(s.x+.66+.25*(s.y-1.5)))*ss(1.15,1.35,s.y)*.9);       // the dark band down the shoulder
 c=mix(c,vec3(.24,.17,.13),ss(.02,-.04,nk)*ss(1.50,1.70,s.y));c=mix(c,vec3(.22,.16,.12),ss(.02,-.05,mn));   // the dark collar and mane
 c=mix(c,vec3(.80,.70,.56),ss(.25,.05,length(s-vec2(1.12,1.40))));                           // the pale rump patch
 c=mix(c,vec3(.38,.27,.19),ss(.02,-.04,dl)*ss(1.05,.75,s.y));                               // the legs, darker
 c=mix(c,vec3(.24,.19,.16),ss(.03,-.01,dl)*ss(.22,.10,s.y));                                // the pasterns
 vec4 A=vec4(0.);const float K=8.;
 whBump(A,s,vec2(-.58,1.38),0.,vec2(.40,.42),.35,0.,K);whBump(A,s,vec2(.12,1.38),0.,vec2(.80,.36),.32,0.,K);whBump(A,s,vec2(.82,1.45),0.,vec2(.36,.38),.32,.02,K);
 whBump(A,s,vec2(.84,1.08),.3,vec2(.20,.28),.16,.08,K);whBump(A,s,(vec2(-.62,1.55)+nTop)*.5,-1.0,vec2(.36,.24),.22,.02,K);
 c*=mix(vec3(1.),whRel(whN(A)),.6);
 vec2 dir=normalize(mix(vec2(1.,-.25),vec2(.1,-1.),ss(.02,-.05,dl)));
 float dd=d*MG_S;vec2 g=vec2(dFdx(dd),dFdy(dd));
 piece(dd,g,c,K_FUR,s*.2,dir,.03*MG_S,whLine(g,s*12.,.85),0.);
 whRim(dd,g,.006,.5);
 // the hooves
 {float hv=min(sdEll(s-hfN2-vec2(0.,.05),vec2(.07,.05)),sdEll(s-vec2(.92,.05),vec2(.07,.05)));if(needB)hv=max(hv,dB/MG_S-G/MG_S);
  float e=hv*MG_S;PIECE(e,vec3(.20,.17,.15),K_HORN,s,vec2(0,-1),.003,.8,0.);}
 // the head, turned to us: the face, the ears
 float dEar;float dh=mgHead(f/1.18,a,dEar)*1.18;float dhh=dh;if(needB)dhh=max(dh,dB/MG_S-G/MG_S);
 {vec2 g0=f/1.18;g0.y/=g0.y<0.?mix(1.,.72,a.up):1.;
  vec3 hc=vec3(.52,.38,.26);hc=mix(hc,vec3(.30,.23,.19),ss(-.30,-.42,g0.y));hc=mix(hc,vec3(.76,.69,.58),ss(.03,-.01,sdEll(vec2(abs(g0.x),g0.y)-vec2(.07,-.15),vec2(.06,.04))));
  hc=mix(hc,vec3(.42,.34,.28),ss(.0,-.02,dEar));hc=mix(hc,vec3(.80,.74,.64),ss(-.005,-.03,dEar)*ss(.02,.10,abs(g0.x)-.14)*.6);
  vec4 B=vec4(0.);whBump(B,g0,vec2(0.,-.10),0.,vec2(.135,.12),.12,.0,12.);whBump(B,g0,vec2(0.,-.30),0.,vec2(.10,.15),.08,.04,12.);whBump(B,g0,vec2(0.,-.43),0.,vec2(.082,.068),.07,.08,12.);
  B.xy=rot(-a.roll)*B.xy;hc*=mix(vec3(1.),whRel(whN(B)),.6);
  float e=dhh*MG_S;vec2 g2=vec2(dFdx(e),dFdy(e));
  piece(e,g2,hc,K_FUR,f*.3,rot(-a.roll)*vec2(0,1),.012*MG_S,whLine(g2,f*20.,.8),0.);whRim(e,g2,.004,.4);}
 if(G>.3){
  // the eyes, at the sides of the face; the dark nose; the open mouth of the bellow
  for(int i=0;i<2;i++){float sx=i==0?-1.:1.;vec2 ec=vec2(sx*.112,-.135)*1.18;eyeA(q,MG_P+MG_S*(hp+rot(-a.roll)*ec),.024*MG_S,vec3(.30,.20,.12),vec3(.50,.41,.32),blinkAt(t,.7),0.);}
  vec2 g0=f/1.18;g0.y/=g0.y<0.?mix(1.,.72,a.up):1.;
  float ns=sdEll(g0-vec2(0.,-.455),vec2(.050,.030));shadow(ss(.008,-.004,ns)*.85,vec3(.12,.10,.09),0.);
  float mo=sdEll(g0-vec2(0.,-.50),vec2(.045,.010+.020*a.mouth));shadow(ss(.006,-.004,mo)*(.35+.6*a.mouth),vec3(.16,.10,.10),0.);}
 // the antlers: pale brown bone, darker and rougher at the base, paler tines; the snow lying on the palms
 {float up,pa;float da=mgAntler(f,up,pa);if(needB)da=max(da,dB/MG_S-G/MG_S);
  vec3 ac=mix(vec3(.42,.33,.25),vec3(.70,.60,.47),ss(.25,.7,abs(f.x)))*(.9+.2*vn(f*9.));ac=mix(ac,vec3(.80,.72,.60),ss(.15,.55,abs(f.x))*ss(.06,.20,up));
  {vec2 pl=rot(.26)*(vec2(abs(f.x),f.y)-vec2(1.,.33));ac*=.90+.14*vn(vec2(pl.x*5.,pl.y*40.));}
  vec2 pg=rot(a.roll)*vec2(0.,1.);
  float e=da*MG_S;vec2 g2=vec2(dFdx(e),dFdy(e));
  piece(e,g2,ac,K_BONE,f*.8,rot(-a.roll)*vec2(1.,.3),.006*MG_S,whLine(g2,f*20.,.8),0.);whRim(e,g2,.004,.55);
  // snow on the upper part of the palms (it slides off in the shake)
  float sn=pa*ss(-.11,-.07,up+.035*(vn(f*14.)-.5))*ss(.3,.5,abs(f.x))*ss(.0,.12,a.snow-.85*vn(f*9.+3.)*(1.-a.snow));
  if(sn>.01&&G>.3){float de=e+(1.-sn)*.004;vec3 scol=vec3(.95,.96,1.)*(.88+.14*ss(-.02,.08,up));PIECE(de,scol,K_SNOW,f*2.,vec2(1,0),.003,.0,0.);}}
}
float mgSil(vec2 s,Mg a){float d=sdEll(s-vec2(.12,1.40),vec2(1.05,.42));d=min(d,sdCap(s,vec2(-.62,1.55),mgHeadAt(a),.25,.15));
 d=min(d,sdCap(s,vec2(-.55,1.1),vec2(-.56,0.),.08,.05));d=min(d,sdCap(s,vec2(.9,1.1),vec2(.93,0.),.10,.05));
 d=min(d,sdCap(s,mgHeadAt(a)-vec2(1.6,-.35),mgHeadAt(a)+vec2(1.6,.35),.12,.12));return d;}
void mgCast(vec2 q,Mg a){float dy=(MG_P.y-q.y)/MG_S;if(dy<-.05||dy>.62)return;float H=max(dy,0.)/.174;
 vec2 ms=vec2((q.x-MG_P.x)/MG_S-2.6*H,H);float s=ss(.2,-.2,mgSil(ms,a))*ss(-.05,.03,dy)*(1.-.45*ss(1.,3.4,H));shadow(s*.50,vec3(.58,.66,.90),1.);}

// ---- Vapour, snow spray, the cascade from the antlers, diamond dust ----
// A breath of vapour leaving at o in the direction v (screen units per second), age seconds after it left, of size sz.
void whBreath(vec2 q,vec2 o,vec2 v,float age,float sz,float k){if(age<0.||age>2.4)return;vec2 c=o+v*age+vec2(0.,.012*age*age);float r=sz*(.35+age*.9);
 vec2 l=(q-c)/r;if(dot(l,l)>2.2)return;float n=fbm2(l*2.2+vec2(age*.6,-age*.4)+o*30.);float a=sat(1.3*ss(1.,.05,length(l)+.45*(n-.5))*(1.-ss(.3,2.4,age))*k);
 // lit from behind by the low sun: it glows warm white on the sun's side, cooler and bluer on the other
 float lit=ss(-.3,.8,dot(l,normalize(SUNL.xy))+.4*(n-.5));vec3 col=mix(vec3(.80,.84,.95),vec3(1.,.97,.90),lit);
 veil(col,a,0.);glow(vec3(1.,.85,.62)*a*lit*.10,0.);}
// The snow thrown by the horn: a burst at the middle of each sweep, alternately to the left and to the right, falling back.
void rhSpray(vec2 q,float t,Rh a){float k=floor((t-4.56)/.62);if(k<0.||k>4.)return;float tb=4.56+k*.62;float ag=t-tb;if(ag>1.2)return;float sg=mod(k,2.)<.5?-1.:1.;
 // from where the horn meets the snow
 vec2 o=RH_P+RH_S*(a.hp+rot(-a.ha)*vec2(-.95,.45)*RH_HS);o.y=max(o.y,RH_P.y+.004);
 for(int j=0;j<16;j++){float fj=float(j);vec2 v=vec2(sg*(.04+.12*h11(fj+k*7.))+.10*h11(fj*1.3+k)-.04,.25+.35*h11(fj*3.1+k));vec2 vel=v+vec2(0.,-1.5*ag);
  vec2 c=o+vec2(sg*.01,0.)+v*ag+vec2(0.,-.75*ag*ag);if(c.y<RH_P.y-.004)continue;
  float r=.005+.007*h11(fj*5.3);float dl=sdSeg(q,c,c-vel*.035);float kk=ss(r,r*.3,dl)*(1.-ss(.6,1.2,ag));
  float sdot=dot(normalize(q-c+1e-5),normalize(SUNL.xy));
  veil(mix(vec3(.66,.73,.90),vec3(1.,.97,.92),ss(.25,.85,sdot)*ss(r*.3,r*.85,dl)),kk*.95,0.);}
 // the powder: a cloud kicked up round the horn, settling
 vec2 pc=o+vec2(sg*.04*ag+.03*ag,.07*ag);float pr=.03+.08*ag;vec2 l=(q-pc)/vec2(pr*1.3,pr);
 if(dot(l,l)<2.){float n=fbm2(l*2.+k);float kk=ss(1.,.15,length(l)+.5*(n-.5))*(1.-ss(.3,1.2,ag))*.70;
  veil(mix(vec3(.76,.81,.94),vec3(1.,.97,.92),ss(-.3,.7,dot(l,normalize(SUNL.xy)))),kk,0.);}}
// The snow falling from the stag's antlers in the shake: clumps from along the palms, and a veil of powder.
void mgCascade(vec2 q,float t,Mg a){if(t<5.55||t>8.)return;vec2 hp=mgHeadAt(a);
 for(int j=0;j<52;j++){float fj=float(j);float side=mod(fj,2.)<.5?-1.:1.;float u=j<30?.30+.55*h11(fj*1.9):.70+1.0*h11(fj*1.9);float t0=5.58+.55*h11(fj*2.7)+.08*u;float ag=t-t0;if(ag<0.)continue;
  vec2 f0=vec2(side*u,.20+.32*ss(.4,1.6,u));vec2 s0=hp+rot(-a.roll)*f0;vec2 v=vec2(side*(j<30?.1+.4*h11(fj+3.):.4+1.0*h11(fj+3.)),.5*h11(fj*4.1));
  vec2 sp=s0+v*ag+vec2(0.,-3.2*ag*ag);if(sp.y<.03)continue;vec2 vel=v+vec2(0.,-6.4*ag);
  // the clump breaks up as it falls (smaller), leaves a short streak in the eye back along its path (never longer than about its own
  // size: long streaks read as pale bars) and is gone before it reaches the ground
  float r=MG_S*(.050+.055*h11(fj*6.1))*(1.-.45*ss(.2,1.,ag));
  vec2 c=MG_P+MG_S*sp;vec2 tl=c-normalize(vel+vec2(0.,-1e-4))*min(MG_S*length(vel)*.07,1.2*r);
  float k=ss(r,r*.3,sdSeg(q,c,tl))*(1.-ss(.65,1.05,ag));
  // the clump is lit from behind: its body in blue shade, a bright rim on the sun's side
  float dl=sdSeg(q,c,tl);float sdot=dot(normalize(q-c+1e-5),normalize(SUNL.xy));
  vec3 col=mix(vec3(.64,.71,.88),vec3(1.,.97,.92),ss(.25,.85,sdot)*ss(r*.35,r*.85,dl));
  veil(col,k*.95,0.);}
 // powder off the palms' edges, drifting out and down beside the head, faintly blue in its shade
 float ag=t-5.65;
 for(int i=0;i<2;i++){float sx=i==0?-1.:1.;vec2 c=MG_P+MG_S*(hp+rot(-a.roll)*vec2(sx*1.0,.25)+vec2(sx*.3*ag,-.9*ag));vec2 l=(q-c)/(MG_S*vec2(.80+.5*ag,.45+.8*ag));
  if(dot(l,l)<2.){float n=fbm2(l*vec2(2.5,2.)+vec2(sx*3.,ag));float k=ss(1.,.1,length(l)+.5*(n-.5))*ss(.0,.25,ag)*(1.-ss(.8,2.0,ag));
   veil(mix(vec3(.70,.76,.92),vec3(.92,.94,.99),n*ss(-.8,.6,-l.y)),k*.55,0.);}}}
// Diamond dust: tiny ice crystals drifting in the sunlight, glinting softly and slowly.
void whDust(vec2 q,float t){vec2 w=q*14.+vec2(t*.04,-t*.03+.05*sin(t*.3+q.x*2.));vec2 ci=floor(w),f=fract(w)-.5-(h22(ci)-.5)*.6;
 float on=step(.88,h21(ci+5.))*ss(.25,.05,q.y);float tw=.5+.5*sin(t*1.3+h21(ci)*30.);float a=on*ss(.05,.015,length(f))*(.25+.55*tw*tw);
 glow(vec3(1.,.96,.88)*a*.35*(.5+.8*exp(-length(q-vec2(-.66,.16))*1.2)),1.);}

// ---- The steppe in winter ----
float whRn(float x){return 1.-abs(2.*vn(vec2(x,1.7))-1.);}
float whPeaks(float x,float f){return .55*whRn(x*f)+.30*whRn(x*f*2.1+3.)+.15*whRn(x*f*4.3+7.);}
// A far range under snow: the slopes that face the sun warm white, the others blue; spurs and gullies down them; dark rock on the steep
// faces where the snow cannot lie (rk: how much); haze at the foot.
void whRange(vec2 q,float base,float amp,float f,float sd,vec3 lit,vec3 sh,float rk,float haze,vec3 hz){
 float ax=amp*mix(.35,1.15,ss(-.7,.7,q.x));float y=base+ax*whPeaks(q.x+sd,f);if(q.y>y+.01)return;
 float sl=(whPeaks(q.x+sd-.004,f)-whPeaks(q.x+sd+.004,f))*ax/.008;float v=(y-q.y)/max(ax,.01);
 vec2 w=vec2((q.x+sd)*f*7.+v*1.3,v*1.6+sd);float e=.06;float sp=vn(w-vec2(e,0.))-vn(w+vec2(e,0.));sp+=.5*(vn(w*2.1+3.-vec2(e,0.))-vn(w*2.1+3.+vec2(e,0.)));
 float L=mix(sat(sl*1.4+.3),sat(.5+sp*2.8),ss(.05,.35,v));
 vec3 c=mix(sh,lit,L);
 // rock: on the shaded flanks of the spurs, in streaks down the slope, more near the crest
 float r=ss(.15,-.25,sp)*ss(.45,.75,vn(w*vec2(1.,3.)+9.))*ss(.9,.2,v)*rk;c=mix(c,mix(sh,vec3(.30,.30,.36),.55),r);
 c=mix(c,hz,haze*(.35+.65*sat(v)));
 PIECE(q.y-y,c,K_FAR,q*vec2(3.,6.)+sd,vec2(1,0),.02,0.,1.);
 glow(SUNC*vec3(1.,.82,.62)*ss(.003,.0,y-q.y)*ss(.0,.4,sl)*.05*(1.-haze),1.);}
// The low hills of the middle distance with their woods of dark spruce, pine and bare larch (higher behind the stag), frosted.
float whHill(float x){return WH_HZ+.006+.040*ss(-.05,.25,x)*ss(1.05,.62,x)+.016*fbm2(vec2(x*3.+5.,.3))+.012*ss(-.55,-.85,x);}
void whWoods(vec2 q){float hh=whHill(q.x);if(q.y>hh+.065)return;
 // the hill: snow, a little blue in the shade of the woods
 float wm=ss(.50,.70,vn(vec2(q.x*3.1,2.)))*.8+ss(.0,.18,q.x)*ss(.88,.70,q.x);wm=sat(wm);
 if(q.y<hh+.004){vec3 hc=mix(vec3(.84,.87,.93),vec3(.93,.93,.94),ss(-.02,.0,q.y-hh));hc=mix(hc,vec3(.72,.78,.88),wm*ss(-.012,.0,q.y-hh)*.7);
  PIECE(q.y-hh,hc,K_FAR,q*4.,vec2(1,0),.03,0.,1.);}
 // two ranks of trees standing close, so their crowns make one mass with a ragged top: the far rank paler and bluer
 for(int L=0;L<2;L++){float fl=float(L);float cw=mix(.0062,.0080,fl);float sd=fl*7.3;float x=q.x/cw+sd;float c0=floor(x);
  float d=1.,yyT=0.,fxT=0.,ciT=0.;bool larT=false;
  for(int k=-1;k<=1;k++){float ci=c0+float(k);float on=step(h11(ci*2.9+sd),wm*(1.-.15*fl));if(on<.5)continue;
   float fx=x-ci-.5-(h11(ci*1.3+sd)-.5)*.6;bool lar=h11(ci*7.7+sd)>.75;
   float th=cw*(1.8+2.0*h11(ci*4.1+sd)+1.2*wm)*(1.+.35*fl);float yb=hh-.003-.004*fl;float yy=(q.y-yb)/th;
   float tier=fract(yy*(lar?6.:4.5)+h11(ci)*3.);
   float hw=cw*(.95*pow(sat(1.-yy),.9))*(lar?.70+.30*tier:.60+.40*tier)*(.85+.3*h11(ci*5.3));
   float e=max(abs(fx*cw)-hw,max(-yy*th-.004,(yy-1.)*th));
   if(e<d){d=e;yyT=yy;fxT=fx;ciT=ci;larT=lar;}}
  float tier=fract(yyT*(larT?6.:4.5)+h11(ciT)*3.);
  vec3 tc=larT?vec3(.46,.40,.38):vec3(.22,.28,.28);tc=mix(tc,vec3(.56,.62,.72),mix(.50,.22,fl));
  tc=mix(tc,vec3(.88,.90,.95),ss(.62,.95,tier)*ss(.25,.6,vn(vec2(ciT,yyT*5.)))*(larT?.25:.55));   // snow on the branches
  tc*=1.-.18*ss(-.1,.4,fxT);                                                                  // the far side of each crown in shade
  tc=mix(tc,tc*1.2+.04,ss(-.1,-.45,fxT)*.5);                                                   // the sunward side lit
  PIECE(d,tc,K_FAR,q*30.,vec2(0,1),.001,0.,1.);}}
vec3 whSnow(vec2 q){float pz=max(.02,WH_HZ+.08-q.y);
 // wind ripples (sastrugi) along the plain: their faces towards us and the sun are lit, the others blue
 vec2 W=vec2(q.x*1.6/pz,2.2/pz);float e=.08;
 float h1=vn(W*vec2(1.,3.)+vec2(0.,e))-vn(W*vec2(1.,3.)-vec2(0.,e));float h2=vn(W*vec2(2.2,6.)+vec2(3.,e))-vn(W*vec2(2.2,6.)+vec2(3.,-e));
 float fade=ss(.06,.22,pz);float L=sat(.55-(h1+.5*h2)*2.2*fade);
 vec3 c=mix(vec3(.56,.64,.80),vec3(.84,.82,.80),L);
 c=mix(c,vec3(.78,.79,.83),1.-fade*.8);
 c*=.96+.06*fbm2(vec2(q.x*2./pz,1./pz));
 return c;}
// Tussocks of dry steppe grass through the snow, in rows back to front (as in scene 2): sparse, short, straw and grey-brown.
float whRowY(int i){return WH_HZ-.008*(pow(1.24,float(i))-1.)/.24;}
float whK(float y){return .47*(WH_HZ-y)*(1.+.5*ss(-.30,-.50,y));}
vec4 whTuft(vec2 q,int i,out float ci){float y0=whRowY(i),k=whK(y0),sd=float(i)*5.17;float wc=k*.9;
 ci=floor(q.x/wc+sd);float cx=(ci+.5+(h11(ci*1.7+sd)-.5)*.2-sd)*wc;float yb=y0-h11(ci+3.1+sd)*.4*.008*pow(1.24,float(i));
 float dens=.22+.66*ss(.30,.72,vn(vec2(cx*3.+sd,sd)));float on=step(h11(ci+sd*1.3),dens);
 float hr=(.12+.26*h11(ci*2.3+sd))*(h11(ci*9.1+sd)>.90?1.35:1.);
 // none on the rhino's swept patch and under the animals' feet
 on*=1.-ss(1.,.7,length((vec2(cx,yb)-vec2(-.46,-.37))/vec2(.16,.03)));
 float H=hr*k;return vec4(cx,yb,H*.40,H*on);}
bool whRowHit(vec2 q,int i){float ci;vec4 tf=whTuft(q,i,ci);return tf.w>0.&&abs(q.x-tf.x)<tf.z+tf.w*.12+PX*3.&&q.y>=tf.y-PX*3.&&q.y<=tf.y+tf.w*1.12;}
void whRow(vec2 q,float t,int i){float ci;vec4 tf=whTuft(q,i,ci);float sd=float(i)*5.17+ci*.37;
 float cx=tf.x,yb=tf.y,tw=tf.z,Ht=max(tf.w,1e-4);float yy=(q.y-yb)/Ht;
 float lean=.10*sin(t*.7-cx*2.+float(i))+.05*sin(t*1.7+cx*7.);float x=q.x-cx-lean*Ht*yy*yy;
 float bw=tw*.30,wy=bw+(tw-bw)*sqrt(sat(yy)),a=x/wy;
 float x1=a*4.5+sd,c1=floor(x1),f1=fract(x1)-.5-(h11(c1+1.)-.5)*.3,ac=(c1+.5-sd)/4.5;float hb1=(.45+.55*h11(c1*1.3))*(1.-.45*ac*ac);
 float d1=max((abs(f1)-.32*(1.-sat(yy/hb1)))*wy/4.5,(yy-hb1)*Ht);
 float x2=a*3.2+sd*1.7+.37,c2=floor(x2),f2=fract(x2)-.5-(h11(c2+4.)-.5)*.3;float hb2=(.40+.45*h11(c2*1.9+3.));
 float d2=max((abs(f2)-.32*(1.-sat(yy/hb2)))*wy/3.2,(yy-hb2)*Ht);
 float d=max(min(d1,d2),max((abs(a)-1.)*wy,yb-PX-q.y));bool fr=d1<d2+PX*.5;float yt=sat(yy/(fr?hb1:hb2));
 bool wil=h11(ci*9.1+float(i)*5.17)>.90;   // now and then a dwarf willow: red-brown twigs
 vec3 c=wil?mix(vec3(.30,.17,.13),vec3(.58,.34,.24),ss(.0,.9,yt)):mix(vec3(.50,.40,.26),vec3(.90,.77,.50),ss(.0,.8,yt));c*=(.85+.25*h11(ci+9.))*(fr?1.:.80);
 shadow(ss(1.,.3,length((q-vec2(cx+tw*1.1,yb-Ht*.02))/vec2(tw*1.7,Ht*.07+PX*2.)))*.32,vec3(.60,.68,.90),1.);
 piece(d,vec2(0.,1.),c,K_GRASS,vec2(x,q.y)*vec2(80.,8.),vec2(0,1),Ht*.03+1e-4,.15,1.);
 // a little snow caught at the foot of the tussock
 veil(vec3(.95,.96,.99),ss(1.,.5,length((q-vec2(cx,yb+Ht*.02))/vec2(tw*.7+PX*2.,Ht*.06+PX*2.)))*.55,1.);}
void whRows(vec2 q,float t,int i0,int i1){int idx[6];int n=0;
 for(int i=i0;i<i1;i++)if(n<6&&whRowHit(q,i)){idx[n]=i;n++;}
 for(int j=0;j<n;j++)whRow(q,t,idx[j]);}
// Dwarf willow and birch scrub: low domes of dark red-brown twigs, snow on their tops, in a few places.
void whScrub(vec2 q){float d=1e5;vec2 cc=vec2(0.);float sc=1.;
 for(int i=0;i<3;i++){vec2 c=i==0?vec2(-.80,-.035):i==1?vec2(.84,-.21):vec2(.05,.035);float s=i==0?.05:i==1?.075:.022;
  float e=sdEll(q-c-vec2(0.,s*.4),vec2(s*1.2,s*.6));if(e<d){d=e;cc=c;sc=s;}}
 if(d>.04)return;
 vec2 l=(q-cc)/sc;
 shadow(ss(1.,.3,length((l-vec2(.6,0.))/vec2(1.7,.20)))*.35,vec3(.60,.68,.90),1.);
 // a fan of thin twigs from the base, their tips ragged; snow caught on the upper twigs
 float top=.85*sqrt(sat(1.-l.x*l.x/1.3))*(.75+.35*vn(vec2(l.x*6.+cc.x*40.,1.)));
 float a=l.x/(l.y+.35);float tw=vn(vec2(a*9.+cc.x*30.,l.y*2.5)),tw2=vn(vec2(a*21.+3.,l.y*5.));
 float tip=top+.14*(tw2-.5);
 float den=ss(tip,tip-.15,l.y)*ss(-.06,.04,l.y)*(.40+.60*ss(.35,.7,tw))*(.6+.4*tw2);
 veil(mix(vec3(.24,.16,.13),vec3(.44,.29,.21),tw2)*mix(.85,1.1,sat(l.y)),den*.95,1.);
 veil(vec3(.94,.95,.99),ss(tip-.12,tip-.03,l.y)*ss(tip+.02,tip-.02,l.y)*ss(.45,.7,tw)*.8,1.);}
void steppeW(vec2 q,float t){
 whLightG();
 vec2 sp=vec2(-.66,.16);float ds=length((q-sp)*vec2(.8,1.15));
 if(q.y>WH_HZ-.03){
  vec3 sk=mix(vec3(.96,.91,.82),vec3(.66,.83,.85),ss(WH_HZ,.32,q.y));sk=mix(sk,vec3(.42,.64,.73),ss(.30,1.2,q.y));
  sk=mix(sk,vec3(1.,.93,.80),exp(-ds*4.)*.55);
  PIECE(-1.,sk,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
  // thin high cloud, lit from below
  float cl=fbm(vec2(q.x*1.4+t*.004,q.y*8.)+1.)*ss(.24,.34,q.y)*ss(.9,.50,q.y);veil(mix(vec3(1.,.94,.86),vec3(.86,.90,.92),ss(.3,.6,q.y)),ss(.55,.78,cl)*.45,1.);
  veil(vec3(1.,.98,.90),ss(.034,.026,length(q-sp)),1.);veil(vec3(1.,.94,.80),exp(-ds*8.)*.30,1.);
  if(q.y<.30){
   // the far range, high and glaciated, pale in the haze; a nearer, lower range, bluer, its rock showing
   whRange(q,.055,.170,1.10,2.,vec3(.95,.90,.89),vec3(.64,.70,.86),.35,.30,vec3(.90,.89,.90));
   whRange(q,.044,.090,2.40,6.,vec3(.93,.87,.83),vec3(.52,.60,.78),.85,.14,vec3(.90,.90,.92));
   veil(vec3(.95,.92,.88),ss(.10,WH_HZ,q.y)*.22,1.);
   whWoods(q);}
 }
 // the plain of snow
 vec3 g=whSnow(q);
 PIECE(q.y-WH_HZ,g,K_SNOW,vec2(q.x,q.y*3.),vec2(1,0),.2,0.,1.);
 whRows(q,t,2,9);}

// ---- The scene ----
void sceneW(vec2 q,float t,float grow){
 steppeW(q,t);
 Mg b=mgRig(t);Rh a=rhRig(t);
 whLight();
 // the stag, its shadow, its breath and the snow of its antlers
 mgCast(q,b);
 contact(q,MG_P+vec2(-.01,.003),.15,.35);
 stag(q,t,b,grow);
 vec2 mz=MG_P+MG_S*(mgHeadAt(b)+rot(-b.roll)*vec2(0.,-.50+.12*b.up));
 whBreath(q,mz,vec2(.012,.02),mod(t+.8,3.6)-.3,.013,.55);
 whBreath(q,mz,vec2(.02,.07),t-9.65,.045,.9);whBreath(q,mz+vec2(.004,.0),vec2(.03,.08),t-10.0,.035,.75);
 mgCascade(q,t,b);
 // the grass and scrub between the stag and the rhino; the swept patch; the rhino's tracks
 whLightG();whRows(q,t,9,13);
 {vec2 pc=vec2(-.46,-.37);vec2 pl=(q-pc)/vec2(.16,.026);float gr=.35+.65*ss(4.3,7.0,t);
  float an=atan(pl.y,pl.x);float e=length(pl)*(1.+.34*(vn(vec2(an*1.6,1.))-.5)+.12*(vn(vec2(an*5.,4.))-.5))+.08*(vn(q*vec2(60.,200.))-.5);
  // the snow pushed aside in heaps round it: their tops lit, blue below, a shadow inside the far bank
  float lump=ss(.34,.0,abs(e-gr*1.10))*ss(.05,.4,gr)*(.55+.45*vn(vec2(an*7.,3.)));
  float pa=ss(gr,gr-.14,e);
  if(pa>.01){
   // the uncovered steppe grass: a mat of grey-green and straw, and blades of dry grass standing in three little rows
   vec3 gc=mix(vec3(.44,.42,.30),vec3(.66,.58,.40),vn(q*vec2(120.,300.)));veil(gc,pa*.95,1.);
   for(int r=0;r<3;r++){float fr=float(r);float yb=pc.y+.016-.013*fr;float cw=.0034;float x=q.x/cw+fr*3.7;float ci=floor(x);
    float hgt=(.006+.012*h11(ci*1.7+fr))*(1.+.3*fr);float yy=(q.y-yb)/hgt;float lean=(h11(ci*2.3+fr)-.5)*.9+.15*sin(t*.8+ci);
    float bx=(fract(x)-.5)*cw-lean*yy*hgt*.6;float bd=max(abs(bx)-cw*.22*(1.-.8*sat(yy)),max(-yy,yy-1.)*hgt);
    float on=step(.25,h11(ci*3.1+fr))*pa;vec3 bc=mix(vec3(.42,.38,.26),vec3(.90,.79,.53),sat(yy));
    veil(bc,ss(PX,-PX,bd)*on,1.);}
   veil(vec3(.94,.95,.99),pa*ss(.70,.86,vn(q*vec2(90.,260.)+7.))*.6,1.);   // crumbs of snow left on it
   shadow(pa*ss(gr*.4,gr*1.,e)*ss(.0,.9,pl.y)*.45,vec3(.55,.60,.80),1.);}
  shadow(lump*ss(.2,-.6,pl.y+.3*(vn(vec2(an*7.,3.))-.5))*.30,vec3(.60,.68,.92),1.);veil(vec3(.97,.97,1.),lump*ss(-.7,.3,pl.y)*.85,1.);}
 for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(.30+fi*.10+.01*sin(fi*3.),-.355+.004*fi+(mod(fi,2.)-.5)*.014);float e=length((q-c)/vec2(.030-.002*fi,.008-.0005*fi))-1.;
  shadow(ss(.3,-.5,e)*.30,vec3(.60,.68,.90),1.);}
 // the rhino, its long blue shadow, its breath, the snow from its horn
 rhCast(q,a);whLight();
 contact(q,RH_P+vec2(-.02+a.bx*RH_S,.004),.26,.40);
 rhino(q,t,a,grow);
 // the snow over its feet
 {float sm=0.;for(int i=0;i<4;i++){float x=i==0?rhFoot(a.fN,-.36).x:i==1?rhFoot(a.hN,1.16).x:i==2?rhFoot(a.fF,-.26).x+.10:rhFoot(a.hF,1.24).x+.10;
   float lift=i==0?a.fN:i==1?a.hN:i==2?a.fF:a.hF;lift=sin(PI*lift);vec2 c=RH_P+RH_S*vec2(x-.03,i<2?-.005:.02);
   vec2 l=(q-c)/(RH_S*vec2(.20,.05+.025*vn(vec2(q.x*90.,1.))));sm=max(sm,ss(1.,.7,length(l))*(1.-lift));}
  veil(vec3(.90,.92,.98),sm*.75,1.);}
 vec2 ns=RH_P+RH_S*(a.hp+rot(-a.ha)*vec2(-.80*max(cos(a.hy),.5),-.08)*RH_HS);
 whBreath(q,ns,vec2(-.03,-.006),mod(t+.3,3.2)-.3,.013,.55);
 whBreath(q,ns,vec2(-.035,.02),t-10.36,.060,1.);whBreath(q,ns,vec2(-.03,.03),t-10.50,.040,.8);
 rhSpray(q,t,a);
 // the nearest tussocks, then the glitter of the air
 whLightG();whRows(q,t,13,18);
 whDust(q,t);
}
void fossilW(vec2 q){Rh a=rhRig(0.);vec2 m=(q-RH_P)/RH_S;
 if(m.x>-2.2&&m.x<2.1&&m.y>-.15&&m.y<2.3)PIECE(rhBones(m,a)*RH_S,vec3(.70,.60,.46),K_FOSSIL,m*.6,vec2(1,0),.012,.6,0.);
 Mg b=mgRig(0.);vec2 s=(q-MG_P)/MG_S;
 if(s.x>-2.9&&s.x<1.6&&s.y>-.15&&s.y<3.3){vec2 f=rot(b.roll)*(s-mgHeadAt(b));PIECE(mgBones(s,f)*MG_S,vec3(.70,.60,.46),K_FOSSIL,s*.6,vec2(1,0),.006,.6,0.);}}

const vec2 WIN_C=vec2(-.12,-.18);
void fossil(vec2 q){fossilW(q);}
void life(vec2 q,float t){sceneW(q,t,GROW);}

// ---- Scene 6 (El pou del temps, CE37): Triceratops horridus, a mother and her calf on the Hell Creek floodplain (Montana, about 66.5
// million years ago), in a golden afternoon: the world of the tyrannosaurs, later in the day, the sun low on the right. The mother (left)
// faces the sun and her calf; the calf (right, nearer) faces her, lit from behind.
// 3.8–4.3 the mother lifts her head from the ferns and steps forward; 4.3–5.6 (the key) she sways and tilts her head from side to side,
// showing her frill, and a soft rose-ochre flush spreads over it (rising over 1.2 s); 6.0–7.2 the calf imitates her (its small frill
// flushes a little); 9.4–10.6 the echo: both give a soft closed-mouth rumble (their throats swell a little); then the mother goes back to
// the ferns and the calf nuzzles the plants. Scale: .135 screen units per metre (the mother about 8 m long, 2.8 m at the hips).
// Rig frame (metres, facing -x, the ground at y 0): the mother faces +x on screen (flip -1), the calf -x.
const float TCS=.135,TC_CS=.058;
const vec2 TC_MPOS=vec2(-.30,-.30),TC_CPOS=vec2(.50,-.395);
const vec2 TC_H=vec2(1.30,1.95),TC_S=vec2(-1.18,1.46),TC_C=vec2(-1.72,1.62); // hip, shoulder, occipital condyle
const vec3 TC_PALM[4]=vec3[](vec3(-.40,-.05,.17),vec3(.18,-.05,.14),vec3(.86,-.075,.20),vec3(-1.10,-.07,.22));
const vec4 TC_CONIF[3]=vec4[](vec4(-.74,-.105,.66,.10),vec4(-.585,-.10,.46,.075),vec4(1.02,-.11,.60,.10));
const vec3 TC_HORSE[3]=vec3[](vec3(-.10,-.105,.07),vec3(.42,-.10,.06),vec3(-.55,-.11,.08));
const vec3 TC_SHRUB[2]=vec3[](vec3(.30,-.125,.085),vec3(-.78,-.12,.075));
const vec3 TC_CYCAD[3]=vec3[](vec3(.05,-.12,.10),vec3(.74,-.135,.12),vec3(-.94,-.15,.13));
const vec4 TC_FFERN[7]=vec4[](vec4(-.62,-.33,.10,6.),vec4(.12,-.335,.075,5.),vec4(.80,-.62,.26,6.),vec4(-.30,-.64,.18,5.),vec4(-.86,-.60,.22,6.),vec4(-.45,-1.05,.30,6.),vec4(.35,-1.15,.32,6.));
struct TcPose{float pitch,roll,flush,throat,chew,bx,by,fl,ff,fl2,ff2,tail,blink;};
// pitch: the snout turned down (rad); roll: -1..1 the head tilted towards (+) or away from us; flush: the colour of the frill (0..1);
// throat: the rumble; chew: the jaw; bx, by: the forequarters shifted (m); fl, ff: the near front foot lifted and forward (m); fl2, ff2:
// the far one; tail: a slow swing; blink.

float tcTri3(vec2 p,vec2 a,vec2 b,vec2 c){vec2 e0=b-a,e1=c-b,e2=a-c,v0=p-a,v1=p-b,v2=p-c;
 vec2 pq0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),pq1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),pq2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));float sg=sign(e0.x*e2.y-e0.y*e2.x);
 vec2 d=min(min(vec2(dot(pq0,pq0),sg*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),sg*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),sg*(v2.x*e2.y-v2.y*e2.x)));
 return -sqrt(d.x)*sign(d.y);}
// A cheap curved tube: two tapered segments through the midpoint of the quadratic Bézier a, b, c (radius ra at a, rc at c).
float tcBend(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);return smin(sdCap(p,a,m,ra,rm),sdCap(p,m,c,rm,rc),rm*.25);}
// The same, with uv: along (0..1) and across (-1..1, through the axis).
float tcBendUV(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc,out vec2 uv){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);
 float u1=segU(p,a,m),u2=segU(p,m,c);vec2 p1=mix(a,m,u1),p2=mix(m,c,u2);float r1=mix(ra,rm,u1),r2=mix(rm,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;bool f=d1<d2;vec2 o=p-(f?p1:p2);vec2 dir=f?m-a:c-m;
 uv=vec2(f?u1*.5:.5+u2*.5,(dir.x*o.y-dir.y*o.x)/length(dir)/max(f?r1:r2,1e-3));return smin(d1,d2,rm*.25);}
// Big scales painted by the light (low contrast between them): each a low dome, brighter on its sunny side and darker on the other, a
// faint seam between them, a few bigger feature scales. su: scale coordinates (one scale per unit), fl: which way su.x runs on screen.
float tcScales(vec2 su,float fl,float cp){
 // the nearest two scale centres among four cells (centres jittered within the middle of their cells, so four are enough)
 vec2 i=floor(su-.5);float a=8.,b=8.;vec2 oa=vec2(0.),ia=i;
 for(int k=0;k<4;k++){vec2 c=i+vec2(float(k&1),float(k>>1));vec2 o=su-(c+.22+.56*h22(c));float d=dot(o,o);
  if(d<a){b=a;a=d;ia=c;oa=o;}else if(d<b)b=d;}
 float r=sqrt(a),e=sqrt(b)-r;float hh=h21(ia);oa.x*=fl;
 float ew=max(.09,1.6/cp),ek=.09/ew;   // the seam: never thinner than about a pixel and a half (cp: one scale in pixels), as dark on the whole
 float dome=ss(.70,.10,r)*ss(.0,.25,e+.19-ew);float lit=dot(oa,normalize(SUNL.xy))/max(r,.05)*ss(.0,.35,r)*dome;
 float seam=ss(ew,.0,e)*ek;float feat=step(.84,hh);
 return 1.+(.19+.08*feat)*lit-.10*seam+.05*(hh-.5)+.04*feat*dome;}
// How a rounded form under the skin (the barrel of the trunk, a thigh, a shoulder) turns to the light: a smooth low dome over the ellipse
// ax (in the frame M, v from its centre), against a flat surface. Its slope fades to nothing at the rim: no line, no terminator edge.
float tcDome(vec2 v,mat2 M,vec2 ax,float fl){vec2 l=M*v/ax;float r2=dot(l,l);if(r2>1.)return 0.;
 vec2 g=(-1.2*(1.-r2)*l/ax)*M;g.x*=fl;return lambert(normalize(vec3(-g,1.)))-lambert(vec3(0.,0.,1.));}
// ---- The head, in its own frame h (metres, forward -x, the occipital condyle at 0); juv 0 adult .. 1 calf ----
// The frill: a broad solid shield (no openings in Triceratops) rising up and back, its edge with epoccipitals (low, flattened bumps in
// the adult, little triangles in the calf); f: the frill's own frame (unit ellipse) for its colour.
float tcFrill(vec2 h,float juv,float roll,out vec2 f){
 vec2 c=mix(vec2(.34,.56),vec2(.08,.40),juv)+vec2(-.02,.07)*roll;vec2 r=mix(vec2(1.02,.64),vec2(.56,.40),juv)*vec2(1.,1.+.20*roll);
 float th=mix(.90,1.0,juv)+.12*roll;vec2 l=rot(th)*(h-c);f=l/r;
 float d=sdEll(l,r);float a=atan(f.y,f.x);
 // the epoccipitals along the free edge (not where the frill meets the skull)
 float n=mix(15.,13.,juv);float w=fract(a*n/TAU+.25);float bump=mix(pow(.5+.5*cos(w*TAU),2.),1.-abs(w*2.-1.),juv);
 float free=ss(2.3,1.6,abs(a+.25));d-=mix(.035,.06,juv)*bump*free;
 return d;}
void tcHead(vec2 h,float juv,float roll,float chew,float throat,out float dFace,out float dHorn,out float dHornF,out float dNas,out float dBeak,out float dTh,out vec2 huv){
 // the face: the cheek flaring down to the jugal, a deep narrow snout (its top line sloping from the brow to the nasal horn and on to the
 // beak), the lower jaw (the mouth stays closed: chew only rocks it a little)
 float bx=mix(-1.98,-1.50,juv),sx=bx+.40;
 float cheek=sdEll(h-vec2(-.58,-.06),mix(vec2(.50,.46),vec2(.48,.48),juv));
 float sn=smin(sdCap(h,vec2(-.80,.22),vec2(sx,.02),mix(.28,.26,juv),mix(.17,.16,juv)),sdCap(h,vec2(-.72,-.18),vec2(sx+.05,-.20),.26,.15),.18);
 vec2 jh=h-vec2(0.,-.02*chew);
 float jaw=sdCap(jh,vec2(-.32,-.38),vec2(sx-.02,-.36),.20,.11);
 dFace=smin(smin(cheek,sn,.18),jaw,.10);
 // the throat, under the cheek and the frill: it swells with the rumble
 dTh=sdEll(h-vec2(-.18,-.50-.10*throat),vec2(.38+.06*throat,.16+.13*throat));
 // the beak: the hooked rostral over the pointed predentary, sheathed in keratin
 dBeak=smin(tcBend(h,vec2(sx+.02,.04),vec2(bx+.06,.0),vec2(bx,-.33),.17,.02),tcTri3(jh,vec2(sx+.02,-.05),vec2(bx+.02,-.33),vec2(sx+.06,-.46))-.03,.06);
 // the brow horns (the near one; the far one a little behind, higher when the head tilts towards us), the nasal horn
 vec2 hb=vec2(-.72,.38),hc=mix(vec2(-1.02,.98),vec2(-.80,.64),juv),ht=mix(vec2(-1.55,1.30),vec2(-.63,.72),juv);float hr=mix(.165,.11,juv);
 vec2 o=vec2(0.,-.04*roll);dHorn=tcBendUV(h,hb+o,hc+o,ht+o,hr,mix(.020,.04,juv),huv);
 vec2 of=vec2(.10,.10+.10*roll);dHornF=tcBend(h,hb+of,hc+of,ht+of,hr*.95,mix(.018,.04,juv));
 vec2 na=mix(vec2(-1.30,.24),vec2(-1.02,.22),juv),nb=mix(vec2(-1.40,.56),vec2(-1.08,.38),juv);float rn=mix(.13,.08,juv);dNas=sdCap(h,na,nb,rn,.03);
 if(dNas<dHorn){float un=segU(h,na,nb);vec2 dn=nb-na,on=h-mix(na,nb,un);huv=vec2(un,(dn.x*on.y-dn.y*on.x)/length(dn)/mix(rn,.03,un));}}
// The bones of a Triceratops in the rig frame: skull with its frill and horn cores, the spine, ribs, shoulder blade, pelvis, the near
// limbs and the far limbs a step apart, the chevrons of the tail. j: the joints of the pose (as tcTri computes them).
// The skull from the head's distances (face a, beak g, horn b, nasal horn e, frill d with its frame f): the openings cut through.
float tcSkullOf(vec2 h,float juv,float a,float g,float b,float e,float d,vec2 f){
 float dd=smin(a,g,.04);dd=max(dd,-sdEll(h-vec2(-.80,.20),vec2(.13,.12)));dd=max(dd,-sdEll(h-vec2(mix(-1.40,-1.08,juv),.02),vec2(.15,.09)));
 dd=max(dd,-sdEll(h-vec2(-.36,-.06),vec2(.09,.15)));dd=max(dd,-sdEll(h-vec2(-.65,-.38),vec2(.22,.035)));
 d=max(d,-(length(f)-.2)*.4);d=min(min(d,dd),min(b,e));return d;}
float tcSkull(vec2 h,float juv){if(h.x<-2.15||h.x>1.2||h.y<-1.1||h.y>1.55)return 9.;vec2 f;float d=tcFrill(h,juv,0.,f);float a,b,c,e,g,k;vec2 uv;tcHead(h,juv,0.,0.,0.,a,b,c,e,g,k,uv);
 return tcSkullOf(h,juv,a,g,b,e,d,f);}
// sk: the skull's distance (rig units), as computed by the caller.
float tcBones(vec2 m,float juv,float sk,vec2 S,vec2 E,vec2 W,vec2 Ff,vec2 H,vec2 K,vec2 A,vec2 Fh,vec2 C,float k){
 float d=sk;vec2 mc=m;m.x/=k;float d1=9.;
 // spine: neck, back (rising to the hips), sacrum, tail; neural spines (in the body's frame, shorter in the calf)
 d1=min(d1,tcBend(m,C/vec2(k,1.)+vec2(.15,.05),vec2(-1.2,2.05),vec2(-.6,2.25),.10,.10));
 d1=min(d1,tcBend(m,vec2(-.6,2.25),vec2(.4,2.66),vec2(1.3,2.62),.10,.10));
 d1=min(d1,tcBend(m,vec2(1.3,2.62),vec2(2.6,2.34),vec2(3.30,1.14),.10,.035));
 for(int i=0;i<9;i++){float x=-.5+float(i)*.26;float y=x<1.3?mix(2.25,2.62,ss(-.6,1.0,x)):2.62;d1=min(d1,sdSeg(m,vec2(x,y),vec2(x+.05,y+.22))-.035);}
 // ribs
 for(int i=0;i<8;i++){float x=-.75+float(i)*.24;float y=mix(2.25,2.60,ss(-.6,1.0,x));vec2 a=vec2(x,y-.05),b=vec2(x-.18,y-.72),c=vec2(x-.05,mix(1.08,1.0,float(i)/7.));
  d1=min(d1,min(sdSeg(m,a,b),sdSeg(m,b,c))-.045);}
 // shoulder blade, pelvis (long ilium, pubis forward, ischium back)
 d1=min(d1,sdCap(m,vec2(-.55,2.12),S/vec2(k,1.)+vec2(.05,.08),.16,.12));
 d1=min(d1,sdEll(rot(-.05)*(m-vec2(1.25,2.40)),vec2(.95,.20)));d1=min(d1,sdCap(m,vec2(1.0,2.05),vec2(.45,1.60),.10,.12));d1=min(d1,sdCap(m,vec2(1.55,2.0),vec2(2.15,1.35),.09,.06));
 // chevrons
 for(int i=0;i<6;i++){float fi=float(i);float x=2.2+fi*.19;float y=mix(2.30,1.55,fi/6.);d1=min(d1,sdSeg(m,vec2(x,y-.06),vec2(x+.07,y-.30+fi*.035))-.028);}
 d=min(d,d1*k);m=mc;
 // the limbs
 d=min(d,sdCap(m,H,K,.13,.10));d=min(d,sdCap(m,K,A,.10,.08));d=min(d,sdCap(m,A,Fh+vec2(-.25,.06),.08,.05));
 d=min(d,sdCap(m,S,E,.12,.09));d=min(d,sdCap(m,E,W,.09,.07));d=min(d,sdCap(m,W,Ff+vec2(-.2,.06),.07,.05));
 return d;}

// One Triceratops: pos and scale s (screen units per metre of the rig), flip -1 to face +x, juv 0 adult .. 1 calf (a bigger head, a
// shorter body and tail, stub horns, a small frill with triangular edge bumps, big eyes).
void tcTri(vec2 q,vec2 pos,float s,float flip,float juv,float t,TcPose p,float grow){
 vec2 m=(q-pos)/s;m.x*=flip;
 if(m.x<-4.6||m.x>4.2||m.y<-.35||m.y>4.1)return;
 float hs=mix(1.18,1.45,juv),k=mix(1.,.86,juv);vec2 kx=vec2(k,1.);
 // the forequarters (shoulders, neck, head) carry the sway; the hips follow less
 vec2 offF=vec2(p.bx,p.by),offH=offF*vec2(.45,.25);
 float br=sin(t*1.15+juv*2.);
 vec2 S=TC_S*kx+offF,H=TC_H*kx+offH,C=TC_C*kx+offF+vec2(0.,.012*br);
 // a coarse test: the head zone, the body and the legs
 vec2 h=rot(p.pitch)*(m-C)/hs;bool nearH=h.x>-2.15&&h.x<1.2&&h.y>-1.1&&h.y<1.55;
 if(!nearH&&min(sdEll(m-vec2(.55*k,1.80),vec2(3.8*k,1.40)),sdBox(m-vec2(0.,.75),vec2(2.0*k,.85)))>.3)return;
 // feet planted on the ground (IK legs); the far feet a step apart and a little higher (further away)
 vec2 Ff=vec2(TC_S.x*k-.20-p.ff,p.fl),Fh=vec2(TC_H.x*k-.14,0.);
 vec2 W=Ff+vec2(.05,.30),A=Fh+vec2(.13,.38);
 vec2 E=knee(S,W,.64,.58,1.),K=knee(H,A,1.0,.95,-1.);
 vec2 dy=vec2(0.,.10);
 vec2 Ff2=vec2(TC_S.x*k+.10-p.ff2,p.fl2)+dy,Fh2=vec2(TC_H.x*k+.20,0.)+dy;vec2 W2=Ff2+vec2(.05,.30),A2=Fh2+vec2(.13,.38);
 vec2 S2=S+vec2(.10,.10),H2=H+vec2(.10,.08);vec2 E2=knee(S2,W2,.64,.58,1.),K2=knee(H2,A2,1.0,.95,-1.);
 float G=grow/s;bool needB=G<1.1; // the bones show until the flesh has grown over them (about 1 m from them)
 float inPX=4.*PX/s,cover=-2.*PX/s;
 // ---- the distances first (so that what is hidden is not painted) ----
 // the far legs
 float dFar=smin(sdCap(m,S2,E2,.36,.26),sdCap(m,E2,W2,.26,.18),.08);dFar=smin(dFar,sdEll(m-Ff2-vec2(-.03,.11),vec2(.25,.12)),.08);
 {float e=smin(sdCap(m,H2+vec2(-.05,-.15),K2,.48,.29),sdCap(m,K2,A2,.29,.20),.10);e=smin(e,sdEll(m-Fh2-vec2(-.04,.11),vec2(.30,.12)),.10);dFar=min(dFar,e);}
 // the body: chest, barrel (rising to the hips), hips, the tail, the short neck, the thigh and the upper arm; one piece
 vec2 mb=m-mix(offH,offF,ss(1.2,-1.0,m.x));vec2 mk=mb/kx;
 float tw=p.tail+.06*sin(t*.8+juv);float tt;
 float dT=tcBend(mk,vec2(1.9,2.35),vec2(2.75,2.10+tw*.5),vec2(3.35,1.10+tw),.44,.07);
 float dTor=sdEll(rot(.14)*(mk-vec2(.20,1.80)),vec2(1.55,.96+.015*br));
 float dCh=sdEll(mk-vec2(-1.0,1.60),vec2(.80,.86));float dHp=sdEll(mk-vec2(1.30,2.12),vec2(.95,.78));
 float d0=smin(smin(dTor,dCh,.30),dHp,.35);d0=smin(d0,dT,.30)*k;
 d0=smin(d0,sdCap(m,S+vec2(.15,.32),C,.62,.52),.25);
 float dThg=smin(sdEll(rot(-.22)*(m-mix(H,K,.42)-vec2(.04,.0)),vec2(.50,.80)),sdCap(m,H,K,.50,.30),.10);
 float dUa=smin(sdEll(rot(.30)*(m-S-vec2(.04,-.10)),vec2(.42,.54)),sdCap(m,S,E,.40,.31),.10);
 // the head
 float dFace=9.,dHorn=9.,dHornF=9.,dNas=9.,dBeak=9.,dTh=9.,df=9.;vec2 fl=vec2(0.),huv=vec2(0.);
 if(nearH){tcHead(h,juv,p.roll,p.chew,p.throat,dFace,dHorn,dHornF,dNas,dBeak,dTh,huv);dFace*=hs;dHorn*=hs;dHornF*=hs;dNas*=hs;dBeak*=hs;dTh*=hs;
  df=tcFrill(h,juv,p.roll,fl)*hs;}
 float dB=-1.;
 // the bones lie inside the body's outline: they are only computed there
 float dHind0=smin(sdCap(m,K,A,.31,.21),sdCap(m,A,Fh+vec2(-.10,.13),.21,.19),.08),dFore0=sdCap(m,E,W,.30,.21);
 if(needB&&min(min(min(d0,dThg),min(dUa,dFar)),min(min(dHind0,dFore0),min(df,min(dFace,dHorn))))>.05)needB=false;
 if(needB)dB=tcBones(m,juv,nearH?tcSkullOf(h,juv,dFace/hs,dBeak/hs,dHorn/hs,dNas/hs,df/hs,fl)*hs:9.,S,E,W,Ff,H,K,A,Fh,C,k);
 float dUp=smin(smin(d0,dThg,.10),dUa,.10);
 float dHind=smin(sdCap(m,K,A,.31,.21),sdCap(m,A,Fh+vec2(-.10,.13),.21,.19),.08);dHind=smin(dHind,sdEll(m-Fh-vec2(-.05,.11),vec2(.33,.12)),.08);
 float dFore=smin(sdCap(m,E,W,.30,.21),sdEll(m-Ff-vec2(-.04,.11),vec2(.26,.13)),.08);
 // the whole body with the near legs as one smooth piece: its dark contour is the outer silhouette only
 float d=smin(dUp,dTh,.12);d=smin(d,dHind,.08);d=smin(d,dFore,.08);
 // the jugal horn (a small boss at the bottom of the cheek) belongs to the face
 float dF2=min(dFace,nearH?sdCap(h,vec2(-.52,-.36),vec2(-.44,-.50),.10,.05)*hs:9.);
 // the blunt hoof-like nails of the near feet
 float nails=9.;for(int i=0;i<3;i++){float fi=float(i);nails=min(nails,min(sdEll(m-Fh-vec2(-.33+fi*.15,.05),vec2(.07,.05)),sdEll(m-Ff-vec2(-.24+fi*.11,.05),vec2(.055,.045))));}
 if(needB){dFar=max(dFar,dB-G);d=max(d,dB-G);dHind=max(dHind,dB-G);dFore=max(dFore,dB-G);df=max(df,dB-G);dF2=max(dF2,dB-G);
  dHornF=max(dHornF,dB-G);dHorn=max(dHorn,dB-G);dNas=max(dNas,dB-G);dBeak=max(dBeak,dB-G);nails=max(nails,dB-G);}
 float dFr=min(df,dHornF),dK=min(min(dHorn,dNas),min(dBeak,nails));
 float front=min(dFr,dF2);
 vec2 gD=vec2(dFdx(d),dFdy(d));gD/=max(length(gD),1e-6);vec2 gK=vec2(dFdx(dK),dFdy(dK));gK/=max(length(gK),1e-6);
 vec2 gF=vec2(dFdx(df),dFdy(df));gF/=max(length(gF),1e-6);
 // ---- painting, back to front ----
 if(needB&&grow<.5)PIECE(dB*s,vec3(.86,.82,.72),K_BONE,m*.4,vec2(1,0),.06*s,.8,0.);
 // living colours: dark olive-brown along the back, warm ochre-tan flanks, pale buff below (countershading); the calf paler, faintly
 // dappled
 vec3 back=mix(vec3(.31,.27,.19),vec3(.44,.38,.27),juv),flank=mix(vec3(.52,.40,.26),vec3(.60,.48,.33),juv),belly=mix(vec3(.72,.63,.46),vec3(.80,.71,.53),juv);
 // the scales: bigger on the body, smaller on the limbs; the face and the frill their own, following the head (fixed sizes cross-faded)
 float lm=ss(.05,-.10,min(dHind,dFore)-dUp);
 float wh=nearH?ss(.04,-.02,min(df,dF2)):0.,wf=(1.-wh)*lm;
 float scl=0.;
 for(int k=0;k<3;k++){float w=k==0?(1.-wh)*(1.-wf):k==1?wf:wh;if(w<.01)continue;
  float rt=k==0?mix(7.5,4.65,juv):k==1?mix(12.,7.,juv):(dF2<.02?mix(12.,8.,juv):mix(7.,5.,juv))/hs;
  vec2 su=k==0?m*vec2(7.5,6.5)*mix(1.,.62,juv):k==1?m*mix(12.,7.,juv):h*(dF2<.02?mix(12.,8.,juv):mix(7.,5.,juv));
  float cp=s/rt/PX;scl+=w*mix(1.,tcScales(su,flip,cp),ss(3.,6.,cp));}
// (0.44.7) The skin's own fine texture (K_SKIN) used to be turned off by giving it coordinates at ×900, so that its features were far
// finer than a pixel and faded out. On an NVIDIA card under Windows that fade did not happen: the hash of such large numbers broke
// into lines along the axes over the whole animal (Marc's screen, 0.31–0.44.6; the emulated cards here never showed it). Now the
// pieces take K_SMOOTH with constant coordinates: no texture at all, and a soft satin sheen of the skin.
 if(dFar<inPX&&min(d,front)>cover)PIECE(dFar*s,mix(flank,back,.5)*.55*scl,K_SMOOTH,vec2(0.),vec2(1,0),.20*s,1.,0.);
 if(d<inPX&&front>cover){
  float cs=ss(1.05,2.45,mb.y+.25*ss(.5,-1.5,mb.x));vec3 alb=cs<.5?mix(belly,flank,cs*2.):mix(flank,back,cs*2.-1.);
  // the pattern, at low contrast: darker mottles along the back; the calf's pale dapples
  alb*=1.-.20*ss(.52,.75,fbm2(mk*vec2(1.2,1.6)+juv*3.))*ss(1.7,2.4,mb.y);
  if(juv>.5)alb*=1.+.12*ss(.55,.75,vn(mk*4.5))*ss(1.4,2.2,mb.y);
  // the legs mid-toned, darker towards the feet; the underside in its own shade
  alb=mix(alb,mix(flank,back,.45)*.95,lm);alb*=mix(.80,1.,ss(.0,.8,m.y));
  alb*=mix(.82,1.,ss(.85,1.45,mb.y)*(1.-lm)+lm);
  // skin folds: at the groin (in front of the thigh), behind the elbow
  vec2 cT=mix(H,K,.42)+vec2(.04,0.);vec2 lT=rot(-.22)*(m-cT);
  float fo=ss(.05,.0,abs(sdEll(lT,vec2(.50,.80))+.04))*ss(-.25,-.42,lT.x)*ss(-.05,-.25,lT.y)*ss(-.80,-.55,lT.y);
  {vec2 ua=normalize(E-S),pu=vec2(-ua.y,ua.x);fo+=ss(.04,.0,sdSeg(m,E+pu*.30-ua*.25,E+pu*.26+ua*.02))*.8;}
  alb*=1.-.22*sat(fo)*ss(.0,-.08,d);
  // the forms under the skin: the round barrel of the trunk, the thigh, the shoulder
  alb*=1.+.70*tcDome(mk-vec2(.20,1.80),rot(.14),vec2(1.75,1.10),flip)+.9*tcDome(m-cT,rot(-.22),vec2(.56,.86),flip)+.6*tcDome(m-S-vec2(.04,-.10),rot(.30),vec2(.46,.58),flip);
  if(h.x<2.3&&h.y>-1.7&&h.y<2.0){
   // folds of skin on the neck, behind the cheek and under the frill; the frill's soft shadow on the shoulders
   float rn=length(m-C-vec2(.05,-.05));
   alb*=1.-.16*ss(.55,.95,sin(rn*20./hs))*ss(1.4*hs,.6*hs,rn)*ss(C.y+.4,C.y,m.y)*step(0.,df);
   vec2 dum;float dfs=tcFrill(rot(p.pitch)*(m-C-vec2(-flip*.40,-.14))/hs,juv,p.roll,dum)*hs;alb*=1.-.38*ss(.10,-.30,dfs);}
  // the warm rim where the body turns towards the low sun; a softer warm line along the top
  float rk=(1.-lm)*ss(-.10,.08,dTh-dUp);   // (not on the thin legs and throat, where the band would split along their axis)
  float rimk=ss(-.25,0.,d)*sat(dot(gD,normalize(SUNL.xy)));alb=mix(alb,alb*1.5+vec3(.05,.03,0.),rimk*.5*rk);
  alb=mix(alb,alb*1.30+vec3(.04,.03,.01),ss(-.20,.0,d)*sat(gD.y*1.3-.2)*.35*rk);
  alb*=scl;
  // roundness: about the local half-thickness (the body, the tapering tail, the thick legs)
  float Rb=min(.75,max(.85*mix(.90,.07,sqrt(sat((mk.x-1.6)/1.75))),.05));
  float Rl=mix(.20,.34,ss(.05,-.15,dThg)*ss(-.05,.05,dHind-dThg));Rl=mix(Rl,.30,ss(.05,-.15,dUa)*ss(-.05,.05,dFore-dUa));
  Rb=mix(Rb,Rl,ss(.05,-.10,min(min(dHind,dFore),min(dUa,dThg))-d0));Rb=mix(Rb,.16*hs,ss(.08,-.08,dTh-dUp));
  PIECE(d*s,alb,K_SMOOTH,vec2(0.),vec2(1,0),Rb*s,1.,0.);}
 // the frill, and behind it the far brow horn: its display colour (a pale edge, a darker band, a warm centre that flushes slowly
 // towards a soft rose-ochre)
 if(dFr<inPX&&dF2>cover){float r=length(fl);vec3 fc=mix(vec3(.44,.34,.23),vec3(.54,.44,.30),juv);
  vec3 warm=mix(vec3(.58,.46,.32),vec3(.64,.47,.40),p.flush);fc=mix(fc,warm,ss(.80,.25,r)*(.50+.30*p.flush));
  fc=mix(fc,vec3(.28,.22,.16),ss(.66,.84,r)*ss(1.,.9,r)*.70);fc*=1.+.06*sin(atan(fl.y,fl.x)*34.)*ss(.3,.8,r);
  fc=mix(fc,vec3(.72,.64,.50),ss(.93,1.04,r)*.7); // the edge bumps paler (keratin)
  fc*=scl;
  float rimf=ss(-.18,0.,df)*sat(dot(gF,normalize(SUNL.xy)));fc=mix(fc,fc*1.5+vec3(.05,.03,0.),rimf*.55);
  if(dHornF<df)fc=vec3(.30,.27,.22)*(.85+.3*ss(.0,-.05,dHornF));
  PIECE(dFr*s,fc,K_SMOOTH,vec2(0.),vec2(1,0),mix(.30,.22,juv)*s*hs,1.,0.);
  shadow(ss(.10,-.25,dFace)*ss(.2,-.1,df)*.30,vec3(.5,.42,.40),0.);}
 // the face, its armoured brow over the eye
 if(dF2<inPX&&dK>cover){vec3 fa=mix(mix(belly,back,ss(-.7,.4,h.y)),vec3(.44,.34,.24),.35)*scl;
  vec2 ec=vec2(-.80,.22);fa*=1.-.18*ss(.02,-.02,sdEll(h-ec-vec2(.02,.13),vec2(.17,.05)))+.10*ss(.03,.0,abs(sdEll(h-ec-vec2(.02,.15),vec2(.17,.05))));
  PIECE(dF2*s,fa,K_SMOOTH,vec2(0.),vec2(1,0),.30*s*hs,1.,0.);}
 // keratin: the near brow horn and the nasal horn (conical sheaths: pale at the base, darker towards the tip, faint lengthwise grooves,
 // a lit side and a shadow side), the beak, the nails
 if(dK<inPX){vec3 kc;vec2 kd=normalize(vec2(-.6,.8));
  if(nails<min(min(dHorn,dNas),dBeak)){kc=vec3(.25,.22,.19);kd=vec2(0,1);}
  else if(dBeak<min(dHorn,dNas)){kc=vec3(.27,.24,.20);kd=normalize(vec2(-.7,-.7));}
  else{kc=mix(vec3(.58,.52,.41),vec3(.30,.26,.21),ss(.10,.95,huv.x));kc*=1.-.12*ss(.4,.9,.5+.5*sin(huv.y*9.4))*ss(.95,.5,abs(huv.y));
   float sd=dot(gK,normalize(SUNL.xy))*sat(abs(huv.y));kc*=.66+.55*sat(.5+.75*sd);
   kc=mix(kc,kc*1.35+.04,ss(.55,.95,sd)*.5);}
  PIECE(dK*s,kc,K_HORN,h*4.,kd,.06*s,1.,0.);}
 if(grow>.3&&nearH){
  // the nostril, the line of the closed beak, the eye under its brow
  float bx=mix(-1.98,-1.55,juv);vec2 ec=vec2(-.80,.22);
  shadow(ss(.02,-.02,sdEll(h-vec2(bx+.52,.04),mix(vec2(.17,.09),vec2(.12,.07),juv))*hs)*.6,vec3(.30,.25,.22),0.);
  float ml=(sdSeg(h,vec2(bx+.06,-.32),vec2(-.78,-.27))-.012)*hs*s;shadow(ss(PX,-PX,ml)*.85,vec3(.14,.12,.10),0.);
  shadow(ss(.20,.0,length((h-ec-vec2(.0,.06))/vec2(1.,.6)))*.35,vec3(.55,.45,.40),0.);
  vec2 ecL=C+rot(-p.pitch)*(ec*hs);vec2 ecW=pos+vec2(ecL.x*flip,ecL.y)*s;
  eyeA(q,ecW,mix(.085,.12,juv)*hs*s,vec3(.42,.27,.12),mix(back,vec3(.52,.42,.30),.4),p.blink,0.);}
}

// A simple silhouette of one Triceratops (rig frame), for its long shadow on the ground.
float tcSil(vec2 m,float juv,TcPose p){float k=mix(1.,.86,juv);vec2 kx=vec2(k,1.);vec2 offF=vec2(p.bx,p.by);vec2 mk=(m-offF*.5)/kx;
 float d=sdEll(rot(.14)*(mk-vec2(.25,1.82)),vec2(1.95,1.0));d=min(d,tcBend(mk,vec2(1.9,2.35),vec2(2.75,2.10),vec2(3.35,1.10+p.tail),.44,.07));
 vec2 C=TC_C*kx+offF;float hs=mix(1.18,1.45,juv);d=min(d,sdEll(rot(p.pitch)*(m-C)/hs-vec2(-.45,.30),vec2(1.30,.85))*hs);
 d=min(d,min(sdCap(m,TC_H*kx,vec2(TC_H.x*k-.14,0.),.42,.22),sdCap(m,TC_S*kx+offF,vec2(TC_S.x*k-.20,0.),.36,.20)));return d;}

// ---- The Hell Creek floodplain in the afternoon (decor) ----
float tcFernD(vec2 q,vec2 b,float ang,float len,float bend,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012*len/.1);return max(d,max(-l.y,l.y-len));}
void tcFerns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float back){
 if(abs(q.x-base.x)>sc*1.3||q.y<base.y-.01||q.y>base.y+sc*1.15)return;
 // the fronds of one clump are painted as one piece (the nearest frond gives the colour)
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<7;i++){if(float(i)>=n)break;float fi=float(i);
  float ang=(-1.15+2.3*fi/(n-1.))+.05*sin(t*.9+fi+seed)+.02*sin(t*2.3+fi*2.);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;float e=tcFernD(q,base,ang,len,.35*sign(ang+.01),fu);
  if(e<d){d=e;u=fu;ci=fi;}}
 if(d>PX*4.)return;
 vec3 c=col*(.82+.34*h11(ci*3.+seed));c=mix(c,c*vec3(1.25,1.18,.80),back*ss(.0,1.,u.x)); // backlit tips glow golden
 PIECE(d,c,K_PLANT,u*vec2(1.,6.),vec2(0,1),.004,.5,1.);}
// A cycad: a stout scaly trunk and a crown of stiff, arching pinnate leaves.
void tcCycad(vec2 q,vec2 b,float sc,float t,float seed,float haze){
 if(abs(q.x-b.x)>sc*1.3||q.y<b.y-.01||q.y>b.y+sc*1.45)return;
 vec3 hz=vec3(.86,.78,.58);
 float th=sc*.50;float dT=sdCap(q,b,b+vec2(0.,th),sc*.15,sc*.12);
 vec2 top=b+vec2(0.,th);
 float dl=9.;vec2 lu=vec2(0.);float li=0.;
 for(int i=0;i<9;i++){float fi=float(i);float a=-1.45+2.9*fi/8.+.035*sin(t*.8+fi*1.3+seed);float len=sc*(.60+.22*h11(fi+seed))*(1.-.25*abs(fi-4.)/4.);
  vec2 l=rot(a)*(q-top);float x=l.y/len;if(x<-.05||x>1.05)continue;float y=l.x-.55*sign(a+.01)*x*x*len*abs(a)/1.45;
  float w=.17*len*sin(PI*sat(x*.95+.05))*(1.-.35*x);float pin=abs(fract(x*14.)-.5)-.38;
  float d=max(abs(y)-w,pin*len/14.);d=min(d,abs(y)-.0012);d=max(d,max(-l.y,l.y-len));
  if(d<dl){dl=d;lu=vec2(x,y/len*6.);li=fi;}}
 // the scaly trunk, the crown of stiff pinnate leaves, the young leaves and the cone at its centre: one piece
 float dC=sdEll(q-top-vec2(0.,sc*.04),vec2(sc*.10,sc*.08));float dd=min(min(dT,dl),dC);if(dd>PX*4.)return;
 vec3 c=vec3(.25,.35,.14)*(.85+.3*h11(li*2.+seed));c=mix(c,c*vec3(1.3,1.25,.8),BACK*lu.x*.6);
 if(dT<min(dl,dC))c=vec3(.36,.29,.20)*(1.-.25*ss(.3,.0,abs(fract((q.y-b.y)/sc*14.)-.5)));else if(dC<dl)c=vec3(.55,.42,.22);
 PIECE(dd,mix(c,hz,haze),K_PLANT,dT<dl?(q-b)/sc*vec2(3.,1.):lu,vec2(0,1),.003,.5,1.);}
// A flowering shrub (magnolia-like, the early flowering plants of Hell Creek): a lobed mound of glossy leaves with cream flowers.
void tcShrub(vec2 q,vec2 b,float sc,float t,float seed){
 if(abs(q.x-b.x)>sc*1.25||q.y<b.y-.01||q.y>b.y+sc*1.3)return;
 vec2 l=(q-b)/sc;
 float d=9.;for(int i=0;i<6;i++){float fi=float(i);float sw=.02*sin(t*.8+fi*1.7+seed);vec2 c=vec2(-.70+.28*fi+sw,.38+.40*h11(fi+seed)*(1.-abs(fi-2.5)/3.));
  d=smin(d,length(l-c)-.30-.12*h11(fi*3.+seed),.12);}
 d=max(d,-l.y-.02);d+=.10*(fbm2(l*6.+seed+vec2(t*.05,0.))-.5);
 if(d*sc>PX*4.)return;
 vec2 id;vec3 v=voro(l*vec2(8.,9.)+seed,id);
 vec3 c=vec3(.21,.31,.12)*(.70+.6*h21(id));c*=mix(.60,1.,ss(.0,.16,v.y-v.x));
 c*=mix(.62,1.25,ss(.1,1.0,l.y+.3*l.x));c=mix(c,vec3(.62,.58,.24),ss(-.10,.0,d)*ss(.2,.9,l.y)*.35); // lit on top and towards the sun
 // the flowers: cream cups with a faint blush at the base, opening and closing slowly (painted into the same piece)
 vec2 fg=l*vec2(2.6,2.8)+seed;vec2 fid=floor(fg);vec2 fc=fract(fg)-.5-(h22(fid)-.5)*.40;
 if(h21(fid*1.3)>.40&&d<-.05){float op=.80+.20*sin(t*.4+h21(fid)*6.);float r=.24*op;
  float fd=min(sdEll(fc-vec2(-.06,.03),vec2(r*.50,r)),sdEll(fc-vec2(.06,.03),vec2(r*.50,r)));fd=min(fd,sdEll(fc-vec2(0.,.06),vec2(r*.45,r*.95)));
  vec3 fcol=mix(vec3(.96,.92,.82),vec3(.86,.66,.60),ss(.04,-.10,fc.y)*.6);float fs=fd*sc/2.7;c=mix(c,fcol*(.85+.25*ss(-.01,.01,fc.y)),ss(PX,-PX,fs));c*=1.-.45*ss(1.5*PX,.0,abs(fs));}
 PIECE(d*sc,c,K_LEAF,l*2.,normalize(h22(id)-.5),sc*.30,.35,1.);}
// Horsetails (Equisetum): a clump of jointed green stems with dark rings at the nodes and small cones at the tips.
void tcHorse(vec2 q,vec2 b,float h,float t,float seed,float haze){
 if(abs(q.x-b.x)>h*.35||q.y<b.y-.005||q.y>b.y+h*1.05)return;
 vec3 hz=vec3(.86,.78,.58);
 float ds=9.,dc=9.,us=0.,hs=0.,si=0.;
 for(int i=0;i<7;i++){float fi=float(i);float x0=b.x+(h11(fi+seed)-.5)*h*.45;float hi=h*(.55+.45*h11(fi*3.+seed));float lean=(h11(fi*5.+seed)-.5)*.25+.03*sin(t*1.1+fi+seed);
  vec2 top=vec2(x0+lean*hi,b.y+hi);float d=sdCap(q,vec2(x0,b.y),top,h*.018,h*.012);
  if(d<ds){ds=d;us=segU(q,vec2(x0,b.y),top);hs=hi;si=fi;}
  dc=min(dc,sdEll(q-top-vec2(lean*h*.03,h*.03),vec2(h*.018,h*.04)));}
 if(min(ds,dc)>PX*4.)return;
 float node=ss(.10,.0,abs(fract(us*hs/(h*.09))-.5)-.40);
 vec3 c=mix(vec3(.38,.48,.22)*(.85+.3*h11(si+seed)),vec3(.16,.14,.10),node*.8);c=mix(c,vec3(.45,.36,.20),step(dc,ds));
 PIECE(min(ds,dc),mix(c,hz,haze),K_PLANT,vec2(us*20.,0.),vec2(0,1),h*.01,.5,1.);}
// A far forest seen through the haze: tall conifers (like swamp cypresses) and round crowns of broadleaf trees.
float tcForestTop(float qx,float base,float hgt,float fr,float seed){
 float x=qx*fr+seed,ci=floor(x),fx=fract(x);float top=-1.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);float hh=h11(cj+seed);float cx=float(j)+.5+(h11(cj*1.7)-.5)*.5;
  float tall=hgt*(.55+.6*hh);float con=step(.55,h11(cj+9.));
  float yy=con>.5?base+tall-abs(fx-cx)/fr*4.5*(1.+.25*sin((fx-cx)*60.)):base+tall*.75*sqrt(max(0.,1.-pow((fx-cx)/.8,2.)))+.012*vn(vec2(qx*60.,cj));top=max(top,yy);}
 return top+.004*(vn(vec2(qx*120.,1.))-.5);}
// A fan palm (Sabalites, known from Hell Creek), far: a slender trunk and a crown of drooping fan leaves.
void tcPalm(vec2 q,vec2 b,float h,float t,vec3 c){if(abs(q.x-b.x)>h*.55||q.y<b.y-.01||q.y>b.y+h*1.3)return;
 vec2 top=b+vec2(h*.10*sin(b.x*9.),h);float d=tcBend(q,b,b+vec2(0.,h*.5),top,h*.030,h*.022);
 for(int i=0;i<8;i++){float fi=float(i);float a=-.45+(PI+.9)*fi/7.+.04*sin(t*.6+fi);vec2 dir=vec2(cos(a),sin(a));float L=h*(.26+.06*h11(fi+b.x));
  vec2 c0=top+dir*L*.55-vec2(0.,L*.25*(1.-dir.y));vec2 l=rot(a-.35*dir.x*sign(dir.x))*(q-c0);
  float e=sdEll(l,vec2(L*.5,L*.20));float saw=abs(fract(atan(l.y,l.x)*2.2)-.5)*L*.12;d=min(d,e+saw*ss(.0,L*.3,l.x));}
 PIECE(d,c,K_FAR,q*6.,vec2(1,0),.01,.12,1.);}
// A tall conifer of the forest edge (like the dawn redwoods and swamp cypresses of Hell Creek): a straight trunk and drooping sprays of
// foliage, left and right in turn, longer below; each spray lit on its top and shaded below, sky between them; they sway a little.
void tcConifer(vec2 q,vec2 b,float h,float w,float seed,float t,float haze){
 if(abs(q.x-b.x)>w*1.4||q.y<b.y-.01||q.y>b.y+h*1.03)return;
 vec3 hz=vec3(.90,.80,.60);
 float y=(q.y-b.y)/h;float x=q.x-b.x;float sg=x<0.?-1.:1.;
 float tr=abs(x-.004*h*y*sin(t*.4+seed))-h*.010*(1.3-y);tr=max(tr,q.y-b.y-h*.97);
 float d=9.,ft=0.;
 for(int j=0;j<3;j++){float ti=floor(y*14.+(sg>0.?.5:0.))+float(j)-1.;float yc=(ti+(sg>0.?.5:0.))/14.;if(yc<.10||yc>.97)continue;
  float hh=h11(ti*2.+sg+seed*7.);float wi=w*(pow(sat(1.-yc),.8)*(.55+.6*hh)+.12);float sw=.006*h*yc*sin(t*.7+ti*1.3+seed+sg);
  vec2 a=vec2(0.,yc*h),tip=vec2(sg*wi+sw,yc*h-(.05+.05*hh)*h*(1.-.4*yc));vec2 mid=mix(a,tip,.5)+vec2(0.,.02*h);
  vec2 p=vec2(x,y*h);float th=.052*h*(1.-.45*yc);
  float e=tcBend(p,a,mid,tip,th,.012*h)-.012*h*(vn(vec2(x*120./h,ti+sg))-.4)-.006*h*(vn(vec2(x*400./h,y*300.))-.5);
  if(e<d){d=e;ft=(p.y-mix(a.y,tip.y,sat(abs(x)/wi)))/th;}}
 d=min(d,max(abs(x)-h*.012,y-1.02));
 float dd=min(d,tr);if(dd>PX*4.)return;
 vec3 c=vec3(.17,.23,.12)*(.85+.3*vn(vec2(x*160./h,y*90.)));
 c*=mix(.65,1.15,ss(-.8,.8,ft));                                  // lit tops, shaded undersides
 c=mix(c,vec3(.60,.54,.26),ss(-.008,.0,d)*ss(-.2,.6,x/w)*.45);    // the rim towards the sun
 c=mix(c,vec3(.24,.19,.14),step(tr,d));
 PIECE(dd,mix(c,hz,haze),K_PLANT,vec2(x*80.,y*30.),vec2(0,-1),.003,.10,1.);}
void tcBackdrop(vec2 q,float t){
 vec2 sp=vec2(.60,.24);
 if(q.y>-.125){
  float topF=tcForestTop(q.x,-.04,.15,8.,1.),topN=tcForestTop(q.x,-.075,.11,13.,7.);
  {
   // the sky, its clouds and the sun, the far forest and its mist, the nearer forest edge: one piece, its colour layered
   float ds=length(q-sp);
   vec3 sk=mix(vec3(.99,.80,.52),vec3(.55,.66,.76),ss(-.02,.62,q.y));sk=mix(sk,vec3(1.,.90,.66),ss(.62,.0,ds)*.65);
   sk=mix(sk,vec3(.42,.52,.68),ss(.6,1.3,q.y)); // deeper above (portrait)
   // long thin clouds, lit golden from below; the sun, soft, and its haze
   float cl=fbm2(vec2(q.x*1.3+t*.004,q.y*7.5));sk=mix(sk,mix(vec3(1.,.86,.62),vec3(.86,.80,.80),ss(.15,.45,q.y)),ss(.55,.78,cl)*ss(.10,.24,q.y)*ss(1.1,.40,q.y)*.65);
   sk=mix(sk,vec3(1.,.97,.84),ss(.044,.032,ds));sk=mix(sk,vec3(1.,.92,.70),ss(.30,.0,ds)*.30);
   float cF=ss(PX,-PX,q.y-topF),cN=ss(PX,-PX,q.y-topN);
   sk=mix(sk,mix(vec3(.82,.76,.60),vec3(.98,.86,.64),.28)*(1.-.08*ss(1.5*PX,.0,abs(q.y-topF))),cF);
   sk=mix(sk,vec3(.56,.56,.38)*(1.-.10*ss(1.5*PX,.0,abs(q.y-topN))),cN);
   PIECE(-1.,sk,K_SKY,q*2.+vec2(t*.004,0.),vec2(1,0),.1,0.,1.);}
  // palms and tall conifers
  for(int i=0;i<4;i++){vec3 pl=TC_PALM[i];tcPalm(q,pl.xy,pl.z,t,mix(vec3(.46,.48,.32),vec3(.74,.70,.54),i<2?.8:0.));}
  for(int i=0;i<3;i++){vec4 cf=TC_CONIF[i];tcConifer(q,cf.xy,cf.z,cf.w,float(i)+1.,t,.26+.08*float(i==1));}
  veil(vec3(.98,.86,.62),ss(.0,-.10,q.y)*.20,1.);
  // slow shafts of light through the haze
  vec2 sl=q-sp;float ang=atan(sl.y,sl.x);float ray=vn(vec2(ang*7.+t*.04,3.))*vn(vec2(ang*15.-t*.03,7.));
  veil(vec3(1.,.90,.66),ray*ss(.9,.1,length(sl))*ss(-.12,.05,q.y)*.14,1.);}
 // a backwater far off, holding the gold of the sky
 float dw=abs(q.y+.090+.004*sin(q.x*7.))-.005*(1.+sin(q.x*3.+1.));
 // the ground: sandy mud with patches of moss and litter; long shadows lie towards the left
 float dg=q.y-(-.095+.006*fbm2(vec2(q.x*6.,3.)));vec3 ga=mix(vec3(.58,.50,.32),vec3(.46,.40,.25),ss(-.1,-.50,q.y));ga=mix(ga,vec3(.36,.30,.20),ss(-.5,-1.2,q.y));
 float mo=fbm2(q*vec2(3.,9.)+2.);ga=mix(ga,vec3(.38,.40,.20),ss(.55,.75,mo)*.55);ga=mix(ga,vec3(.40,.33,.22),ss(.45,.25,mo)*.3);
 // a carpet of low growth in perspective (mosses, liverworts, fern sporelings: no grass in the Cretaceous here), in patches
 float gy=max(.02,-q.y-.085);vec2 gu=vec2(q.x/gy,1./gy);float lp=vn(gu*vec2(2.2,1.6))*ss(.35,.65,mo+.1);
 ga=mix(ga,vec3(.30,.36,.15),ss(.45,.75,lp)*.6);ga*=1.-.12*ss(.6,.9,vn(gu*vec2(9.,6.)))*ss(.3,.6,lp);
 PIECE(dg,ga,K_MUD,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);
 veil(vec3(.98,.86,.62)*(.96+.06*vn(vec2(q.x*20.+t*.2,q.y*160.))),ss(PX,-PX,dw)*.95,1.);
 // the mid-ground: horsetails, cycads, flowering shrubs, ferns (rows: nearer rows bigger)
 if(q.y>-.17){
  for(int i=0;i<3;i++){vec3 c=TC_HORSE[i];tcHorse(q,c.xy,c.z,t,float(i)*3.+1.,.33);}
  for(int i=0;i<2;i++){vec3 c=TC_SHRUB[i];tcShrub(q,c.xy,c.z,t,float(i)*3.+1.);}
  for(int i=0;i<3;i++){vec3 c=TC_CYCAD[i];tcCycad(q,c.xy,c.z,t,float(i)*3.+2.,.25-.05*float(i));}}
 for(int r=0;r<3;r++){float fr=float(r);float y0=-.105-fr*.055;float sc=.034+fr*.026;float cw=sc*2.3;float x=q.x/cw+fr*3.1;float ci=floor(x);
  if(h11(ci+fr*5.)<.40)continue;vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.4-fr*3.1)*cw,y0+(h11(ci+7.)-.5)*.02);
  tcFerns(q,b,sc*1.5,t,5.,ci,vec3(.33,.42,.18)*(1.-fr*.06),.8);}
}
// Small things in the light: gnats glinting in the low sun, two dragonflies, pollen.
void tcInsects(vec2 q,float t){
 // three small birds far off (birds lived at Hell Creek), crossing the sky slowly, flapping and gliding
 if(q.y>.12&&q.y<.45)for(int i=0;i<3;i++){float fi=float(i);float x=-1.2+mod(t*.045+fi*.21+.35,2.4);vec2 c=vec2(x,.27+.04*fi+.012*sin(t*.5+fi*2.));
  vec2 l=(q-c)/(.010-.0015*fi);if(dot(l,l)>9.)continue;float fl=sin(t*(7.+fi)+fi*3.)*ss(.2,.6,sin(t*.6+fi*1.9)*.5+.5);
  float w=min(sdCap(l,vec2(0.),vec2(-1.1,.55*fl+.15),.16,.05),sdCap(l,vec2(0.),vec2(1.1,.55*fl+.15),.16,.05));w=min(w,sdEll(l-vec2(.15,0.),vec2(.45,.16)));
  veil(vec3(.42,.40,.40),ss(.12,-.05,w)*.7,1.);}
 if(q.x>.24&&q.x<.66&&q.y>-.01&&q.y<.21)for(int i=0;i<10;i++){float fi=float(i);vec2 c=vec2(.30+.30*h11(fi),.02+.16*h11(fi+3.))+vec2(.03*sin(t*(1.3+h11(fi+5.))+fi*2.),.02*sin(t*(1.9+h11(fi+8.))+fi));
  float tw=.5+.5*sin(t*3.+fi*1.7);glow(vec3(1.,.92,.70)*ss(.004,.0,length(q-c))*(.35+.35*tw),1.);}
 // two dragonflies over the ferns on the right: a dark slender body, two pairs of glassy wings catching the light; they hover and
 // flit in quick darts from place to place
 for(int i=0;i<2;i++){float fi=float(i);float tk=t*.55+fi*1.7;float k0=floor(tk),fk=ss(.0,.22,fract(tk));
  vec2 c=mix(vec2(.42+.24*h11(k0+fi*9.),-.10+.06*h11(k0*1.3+fi)),vec2(.42+.24*h11(k0+1.+fi*9.),-.10+.06*h11((k0+1.)*1.3+fi)),fk)+vec2(.002*sin(t*7.+fi),.0015*sin(t*9.+fi));
  if(abs(q.x-c.x)>.025||abs(q.y-c.y)>.02)continue;float hd=h11(k0+1.+fi*9.)>h11(k0+fi*9.)?1.:-1.;vec2 l=(q-c)*vec2(hd,1.);
  float wb=.5+.5*sin(t*55.+fi);float dd=sdCap(l,vec2(-.012,0.),vec2(.006,.0),.0007,.0013);dd=min(dd,length(l-vec2(.007,.0))-.0017);
  float dw=9.;for(int w=0;w<2;w++){float fw=float(w);vec2 wc=vec2(.001-fw*.004,0.);float a=.15+.25*wb;
   dw=min(dw,min(sdEll(rot(a)*(l-wc-vec2(-.001,.005)),vec2(.0022,.008).yx),sdEll(rot(-a)*(l-wc-vec2(-.001,-.005)),vec2(.0022,.008).yx)));}
  veil(vec3(.96,.94,.88),ss(.0008,-.0004,dw)*.22,1.);glow(vec3(1.,.9,.7)*ss(.001,-.0005,dw)*.06*wb,1.);
  veil(vec3(.16,.20,.22),ss(PX*.8,-PX*.4,dd)*.85,1.);}}
// The poses through the story.
TcPose tcMother(float t){
 float lift=ss(3.8,4.35,t)*(1.-ss(10.9,12.2,t));float disp=ss(4.3,4.6,t)*(1.-ss(5.35,5.75,t));float u=t-4.3;
 float pitch=mix(.48+.04*sin(t*.9),.10,lift)+.14*sin(TAU*u/.66)*disp+.10*ss(5.8,6.6,t)*(1.-ss(10.8,11.8,t))+.05*ss(9.45,9.8,t)*(1.-ss(10.2,10.7,t));
 float roll=sin(TAU*u/.66+.6)*disp;
 float sway=sin(TAU*u/1.32)*disp;
 float step=sat((t-3.85)/.45);
 TcPose p;p.pitch=pitch;p.roll=roll;
 p.flush=ss(4.4,5.6,t)*(1.-ss(8.0,9.8,t));
 p.throat=ss(9.45,9.85,t)*(1.-ss(10.25,10.65,t))*(.85+.15*sin(t*TAU*3.));
 p.chew=(1.-lift)*(.5+.5*sin(t*5.));
 p.bx=-.10*ss(3.9,4.6,t)+.07*sway;p.by=.05*abs(sway)-.02*disp;
 p.ff=.24*ss(3.85,4.3,t);p.fl=.20*sin(PI*step);
 p.ff2=.0;p.fl2=0.;p.tail=.10*sin(TAU*u/1.32-1.)*disp;p.blink=blinkAt(t,.2);
 return p;}
TcPose tcCalf(float t){
 float up=ss(3.95,4.5,t)*(1.-ss(11.2,12.3,t));float disp=ss(6.0,6.25,t)*(1.-ss(6.95,7.3,t));float u=t-6.0;
 float nib=(1.-up)*(.5+.5*sin(t*3.1));
 float pitch=mix(.60+.06*nib,.15,up)+.16*sin(TAU*u/.56)*disp-.12*ss(7.3,8.0,t)*(1.-ss(9.3,10.,t))+.06*ss(9.75,10.05,t)*(1.-ss(10.4,10.8,t));
 TcPose p;p.pitch=pitch;p.roll=sin(TAU*u/.56+.4)*disp;
 p.flush=.7*ss(6.1,7.3,t)*(1.-ss(9.0,10.6,t));
 p.throat=ss(9.75,10.05,t)*(1.-ss(10.4,10.75,t))*(.85+.15*sin(t*TAU*3.6));
 p.chew=nib;
 float sway=sin(TAU*u/.56)*disp;
 p.bx=.08*sway;p.by=.06*abs(sway)-.02*(1.-up);
 // two little stamps of the front feet during the imitation
 float s1=sat((t-6.05)/.30),s2=sat((t-6.55)/.30);
 p.ff=.0;p.fl=.22*sin(PI*s1);p.ff2=0.;p.fl2=.22*sin(PI*s2);
 p.tail=.12*sin(TAU*u/.56-1.2)*disp+.05*sin(t*1.7);p.blink=blinkAt(t,.65);
 return p;}

void tcScene(vec2 q,float t,float grow){
 SUNL=normalize(vec3(.66,.40,.55));SUNC=vec3(1.40,1.10,.74);AMBC=vec3(.42,.46,.56);BACK=.30;
 tcBackdrop(q,t);
 // the story is timed on the scene clock (the sound adds the 0.3 s by which it lags the press)
 TcPose pp[2];pp[0]=tcMother(t);pp[1]=tcCalf(t);
 // their long soft shadows, cast to the left and a little back by the low sun, and the contact shadows under the feet
 for(int i=0;i<2;i++){vec2 pos=i==0?TC_MPOS:TC_CPOS;float sc=i==0?TCS:TC_CS,fl=i==0?-1.:1.;vec2 l=(q-pos)/sc;
  if(l.y<-.4||l.y>1.2||l.x<-11.||l.x>5.)continue;float hg=max(l.y,0.)/.17;float sd=tcSil(vec2(fl*(l.x+1.64*hg),hg),float(i),pp[i]);
  shadow(ss(.45,-.45,sd)*ss(-.30,.05,l.y)*.50*(1.-.45*ss(.1,.9,l.y)),vec3(.50,.52,.66),0.);}
 contact(q,TC_MPOS+vec2(.04,.0),.36,.55);contact(q,TC_CPOS+vec2(.0,.0),.17,.55);
 // the mother, then her calf (one call: the body is compiled once)
 for(int i=0;i<2;i++){float fi=float(i);
  tcTri(q,i==0?TC_MPOS:TC_CPOS,i==0?TCS:TC_CS,i==0?-1.:1.,fi,t+1.7*fi,pp[i],grow);}
 tcInsects(q,t);
 // ferns in front: at the mother's feet, and at the bottom corners
 for(int i=0;i<7;i++){vec4 f=TC_FFERN[i];tcFerns(q,f.xy,f.z,t,f.w,float(i)*4.+3.,vec3(.27,.37,.15)*(1.+.08*float(i<2)),.55);}
}
void tcFossil(vec2 q){
 for(int i=0;i<2;i++){vec2 pos=i==0?TC_MPOS:TC_CPOS;float s=i==0?TCS:TC_CS;float fl=i==0?-1.:1.;float juv=float(i);TcPose p=tcMother(0.);if(i==1)p=tcCalf(0.);
  vec2 m=(q-pos)/s;m.x*=fl;if(m.x<-4.6||m.x>4.2||m.y<-.35||m.y>4.1)continue;float hs=mix(1.18,1.45,juv),k=mix(1.,.86,juv);vec2 kx=vec2(k,1.);
  vec2 S=TC_S*kx,H=TC_H*kx,C=TC_C*kx;vec2 Ff=vec2(TC_S.x*k-.20,0.),Fh=vec2(TC_H.x*k-.14,0.);vec2 W=Ff+vec2(.05,.30),A=Fh+vec2(.13,.38);
  vec2 E=knee(S,W,.68,.60,1.),K=knee(H,A,1.0,.95,-1.);
  float d=tcBones(m,juv,tcSkull(rot(p.pitch)*(m-C)/hs,juv)*hs,S,E,W,Ff,H,K,A,Fh,C,k);PIECE(d*s,vec3(.66,.60,.50),K_FOSSIL,m*.4,vec2(1,0),.05*s,.6,0.);}}

const vec2 WIN_C=vec2(-.30,-.06);
// While the window opens, the fossil is only drawn outside it and the life only inside it (the rest would be hidden).
float tcWin(vec2 q){return length((q-WIN_C)*vec2(1.,1.15))-RFULL*ss(0.,.62,uLife);}
void fossil(vec2 q){if(uLife>.001&&tcWin(q)<-.09)return;tcFossil(q);}
void life(vec2 q,float t){if(uLife<.999&&tcWin(q)>.09)return;tcScene(q,t,GROW);}

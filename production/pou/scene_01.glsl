// ---- Scene 2 (El pou del temps, CE37): Smilodon fatalis on the grassland of La Brea (today's Los Angeles), Late Pleistocene, a warm
// late afternoon, the low sun behind on the left. A mother lies sphinx-like on a low rise; her two cubs play in front of her. 3.8–8.5
// the cubs tumble: the far cub pounces on its sibling, which rolls onto its back and bats at it; 4.2–6.6 the KEY: the mother's slow,
// sleepy yawn (the jaw opens wide and shows the sabres, the eyes squint, the ears go back), then she licks her nose; 8.6–9.4 the near
// cub, which has bounded off, pounces on her short bobbed tail and the tail flicks free; 9.6–11.2 the echo: she lifts her head, gives a
// soft chuff, lowers it and licks the other cub's head. Calm after. Scale: .45 screen units per metre. ----
const float SM_S=.45,SM_C=.52;       // screen units per metre: the mother; the cubs (nearer the camera)
const vec2 SM_P=vec2(.02,-.20);       // the mother: the ground under the middle of her body (she faces -x)
const float SM_GA=-.368,SM_GB=-.345;  // the ground under cub A (nearer, the one that pounces on the tail) and cub B (the one licked)
const float SM_HZ=.03;                // the horizon
const vec3 SM_FUR=vec3(.78,.58,.36),SM_DARK=vec3(.50,.35,.21),SM_BELLY=vec3(.91,.84,.69),SM_PALE=vec3(.96,.92,.83);

// ---- Light. The landscape is lit for its golden glow; the animals by the low sun behind them on the left: a warm rim on the back,
// the head and the ears, the near side in the blue light of the sky, a warm bounce from the grass underneath. ----
void smiLightLand(){SUNL=normalize(vec3(-.60,.42,.55));SUNC=vec3(1.40,1.12,.80);AMBC=vec3(.46,.50,.62);BACK=.5;}
void smiLightAnimals(){SUNL=normalize(vec3(-.75,.52,-.30));SUNC=vec3(1.55,1.18,.82);AMBC=vec3(.58,.65,.82);BACK=.65;}
vec3 smiLit(vec3 n){return AMBC*(.55+.45*n.z)+SUNC*sat(dot(n,SUNL))*1.1+vec3(.46,.33,.16)*sat(-n.y)*.30;}
// How much brighter (per channel) a surface turned to n is than one facing the viewer (the pieces are shaded flat inside).
vec3 smiRel(vec3 n){return smiLit(n)/smiLit(vec3(0.,0.,1.));}
// The relief of a body as overlapping ellipsoid masses seen from the front: each adds its normal, weighted towards the nearest
// surface (c centre, ang its turn, r the radii, rz its depth, z0 how far in front it sits).
void smiBump(inout vec4 acc,vec2 p,vec2 c,float ang,vec2 r,float rz,float z0,float K){
 vec2 u=rot(ang)*(p-c)/r;float s=1.-dot(u,u);float sq=sqrt(max(s,1e-4));
 vec3 n=normalize(vec3(u.x/r.x*rz,u.y/r.y*rz,sq));n.xy=rot(-ang)*n.xy;
 acc+=ss(0.,.25,s)*exp(K*(rz*sq+z0))*vec4(n,1.);}
vec3 smiN(vec4 acc){return acc.w>0.?normalize(mix(acc.xyz/acc.w,vec3(0.,0.,1.),.12)):vec3(0.,0.,1.);}

// Faint spots (cells of a jittered grid; about two cells in three hold a small soft spot).
float smiSpots(vec2 p){vec2 ci=floor(p),f=fract(p)-.5-(h22(ci)-.5)*.45;float r=.15+.09*h21(ci+7.);return step(.34,h21(ci+3.))*ss(r,r*.45,length(f*vec2(1.,1.2)));}

// ---- The mother's motion at clock t ----
struct SmiM{vec2 hp;float pit,gape,eye,ear,nose,lick,stroke,chuff,br;vec2 tTip,tCtl;};
SmiM smiMom(float t){SmiM a;
 a.br=sin(t*1.7)+.6*ss(9.98,10.04,t)*(1.-ss(10.06,10.3,t));
 float lift=ss(4.2,4.8,t)*(1.-ss(5.9,6.6,t));              // the head goes up and back for the yawn
 float gp=ss(4.6,5.45,t)*(1.-ss(5.75,6.3,t));               // the jaw opens slowly, holds, closes
 float nl=ss(6.18,6.34,t)*(1.-ss(6.46,6.64,t));             // she licks her nose
 float dz=ss(6.5,7.4,t)*(1.-ss(9.45,9.85,t));               // drowsy after the yawn
 float ch=ss(9.98,10.06,t)*(1.-ss(10.1,10.32,t));           // the chuff: a short nod
 float lw=ss(10.15,10.6,t)*(1.-ss(11.25,12.1,t));           // the head down to the cub
 float lk=ss(10.5,10.6,t)*(1.-ss(11.1,11.25,t));            // the tongue out
 float sk=lk*(.5-.5*cos(TAU*sat((t-10.55)/.32)));            // two strokes of the tongue
 a.hp=vec2(-.55,.66)+vec2(.025,.035)*lift+vec2(0.,-.045)*dz;
 a.pit=.04+.025*sin(t*.6)-.30*lift+.11*dz+.07*ch-.05*ss(9.55,9.95,t)*(1.-ss(10.2,10.6,t));
 a.hp=mix(a.hp,vec2(-.47,.43)+vec2(.012,.035)*sk,lw);a.pit=mix(a.pit,1.0-.14*sk,lw);
 a.gape=1.12*gp*(1.+.03*sin(t*9.)*gp)+.11*nl;
 a.eye=max(max(blinkAt(t,.2),.94*ss(4.5,4.95,t)*(1.-ss(5.95,6.5,t))),max(.55*dz,.55*lw));
 a.ear=max(ss(4.4,4.95,t)*(1.-ss(6.0,6.9,t)),.8*ss(8.72,8.82,t)*(1.-ss(8.98,9.3,t)));
 a.nose=nl;a.lick=lk;a.stroke=sk;a.chuff=ch;
 // the short bobtail: it rests on the ground behind the haunch; pinned by the cub (8.6–9.0), then it flicks up out of its paws and
 // settles with a few damped swings
 vec2 tip=vec2(1.05,.11)+vec2(.008*sin(t*.9),.006*sin(t*1.3));vec2 ctl=vec2(.99,.25);
 float g=ss(8.58,8.72,t)*(1.-ss(8.98,9.08,t));tip+=vec2(-.012,-.012)*g;ctl+=vec2(-.005,-.012)*g;
 float f=ss(8.98,9.16,t)*(1.-ss(9.3,9.95,t));float w=t>9.?sin((t-9.)*10.)*exp(-(t-9.)*2.2):0.;
 tip+=vec2(.05,.19)*f+vec2(.03,.02)*w;ctl+=vec2(.02,.06)*f+vec2(.010,.01)*w;
 a.tTip=tip;a.tCtl=ctl;
 return a;}
vec2 smiTailAt(SmiM a,float u){vec2 r=vec2(.86,.32);return (1.-u)*(1.-u)*r+2.*u*(1.-u)*a.tCtl+u*u*a.tTip;}

// ---- The mother's skeleton (her own frame, metres, ground y 0, facing -x): skull with its sabres, the mandible with its flange, the
// spine, ribs, shoulder blade, the robust forelimb, pelvis and hind limb, the short tail. ----
const float SM_HS=1.08; // the scale of her head (its own frame is in units of 1/SM_HS m)
float smiBonesM(vec2 m,vec2 hp,float pit){float d=1e5,tt;
 vec2 h=rot(pit)*(m-hp)/SM_HS;
 float sk=smin(sdEll(h-vec2(-.09,.025),vec2(.115,.075)),sdCap(h,vec2(-.16,.0),vec2(-.325,-.035),.055,.042),.03);
 sk=smin(sk,sdEll(h-vec2(-.01,.06),vec2(.06,.03)),.02);
 sk=max(sk,-sdEll(h-vec2(-.19,.03),vec2(.033,.030)));sk=max(sk,-sdEll(h-vec2(-.35,-.02),vec2(.013,.018)));
 sk=max(sk,-sdEll(h-vec2(-.09,-.028),vec2(.055,.020)));
 d=min(d,sk);
 d=min(d,smin(sdCap(h,vec2(-.283,-.05),vec2(-.297,-.150),.019,.011),sdCap(h,vec2(-.297,-.150),vec2(-.256,-.212),.011,.003),.004));
 float jw=smin(sdCap(h,vec2(-.06,-.085),vec2(-.295,-.112),.024,.022),sdEll(h-vec2(-.30,-.128),vec2(.03,.036)),.015);
 d=min(d,min(jw,sdCap(h,vec2(-.06,-.085),vec2(-.04,-.045),.018,.014)));d*=SM_HS;
 d=min(d,sdTube(m,hp+vec2(.04,-.03),vec2(-.40,.64),vec2(-.20,.58),.026,.032,tt));
 d=min(d,sdTube(m,vec2(-.20,.55),vec2(.15,.46),vec2(.66,.40),.030,.026,tt));
 d=min(d,smin(sdCap(m,vec2(.66,.40),vec2(.86,.32),.022,.018),sdCap(m,vec2(.86,.32),vec2(.98,.12),.018,.012),.01));
 for(int i=0;i<5;i++){float x=-.27+float(i)*.06;float y=mix(.56,.50,sat((x+.2)/.35));d=min(d,sdSeg(m,vec2(x,y),vec2(x+.02,y+.055-float(i)*.008))-.010);}
 for(int i=0;i<10;i++){float fi=float(i);float x=-.16+fi*.055;float y0=.52-.013*fi;d=min(d,sdTube(m,vec2(x,y0),vec2(x+.12,y0-.20),vec2(x+.05,.07+.005*fi),.011,.008,tt));}
 d=min(d,sdEll(rot(.40)*(m-vec2(-.24,.47)),vec2(.065,.16)));
 d=min(d,sdCap(m,vec2(-.29,.36),vec2(-.20,.11),.038,.032));d=min(d,sdCap(m,vec2(-.20,.11),vec2(-.68,.075),.032,.026));
 for(int i=0;i<4;i++)d=min(d,sdCap(m,vec2(-.68,.075),vec2(-.92,.035+.014*float(i)),.015,.011));
 d=min(d,sdEll(rot(.30)*(m-vec2(.63,.37)),vec2(.16,.045)));
 d=min(d,sdCap(m,vec2(.62,.36),vec2(.40,.14),.038,.032));d=min(d,sdCap(m,vec2(.40,.14),vec2(.85,.09),.030,.026));
 d=min(d,sdCap(m,vec2(.85,.09),vec2(.40,.055),.022,.018));for(int i=0;i<3;i++)d=min(d,sdCap(m,vec2(.40,.055),vec2(.24,.035+.014*float(i)),.012,.01));
 return d;}

// ---- Her shapes ----
// The head in its own frame h (origin at the back of the skull, facing -x, units of 1/SM_HS m); the lower jaw opens by the gape about
// SM_J (jw: the pixel in the frame of the jaw at rest). A large head: a high crown, a long deep muzzle, heavy upper lips, a deep chin;
// small rounded ears (back by eb).
const vec2 SM_J=vec2(-.06,-.075);
float smiSkull(vec2 h,float eb,out float dEar){
 float cr=sdEll(h-vec2(-.08,.03),vec2(.145,.115));
 float ck=sdEll(h-vec2(-.125,-.035),vec2(.14,.088));
 float mz=sdCap(h,vec2(-.17,-.008),vec2(-.318,-.034),.084,.066);
 float ns=sdEll(h-vec2(-.340,-.018),vec2(.041,.047));
 float fl=sdEll(h-vec2(-.268,-.088),vec2(.098,.046));
 vec2 e=rot(-eb*.75)*(h-vec2(-.015,.105));e.y/=1.-.25*eb;dEar=sdEll(e-vec2(.0,.030),vec2(.039,.042));
 float d=smin(smin(cr,ck,.05),mz,.04);d=smin(d,ns,.02);d=smin(d,fl,.02);d=smin(d,dEar,.012);return d;}
float smiJaw(vec2 jw){return smin(smin(sdCap(jw,vec2(-.07,-.090),vec2(-.305,-.117),.046,.037),sdEll(jw-vec2(-.297,-.131),vec2(.050,.045)),.02),
 sdEll(jw-vec2(-.276,-.152),vec2(.034,.040)),.02);}   // the flange at the front of the mandible, beside the sabre's tip
// The torso: a deep chest resting behind the forearms, the high withers, the back sloping down to the lower hips, the loins and the
// rump, flat on the ground; and the thick muscular neck up to the head.
float smiTorso(vec2 m,SmiM a){
 float dCh=sdEll(m-vec2(-.32,.31),vec2(.29,.31));
 float dW=sdEll(rot(.35)*(m-vec2(-.19,.52)),vec2(.18,.22));
 float dBl=sdEll(rot(-.06)*(m-vec2(.15,.25)),vec2(.48,.22+.008*a.br));
 float dRu=sdEll(m-vec2(.56,.27),vec2(.30,.25));
 float tor=smin(smin(dCh,dW,.10),dBl,.12);tor=smin(tor,dRu,.12);
 vec2 nE=a.hp+rot(-a.pit)*vec2(.03,-.05);vec2 n0=vec2(-.20,.50);vec2 nc=(n0+nE)*.5+vec2(-.02,.05)+vec2(.06,.02)*sat(a.pit-.2);
 return smin(tor,smin(sdCap(m,n0,nc,.20,.175),sdCap(m,nc,nE,.175,.15),.06),.10);}
// The near shoulder and upper arm; the elbow, the massive forearm and wrist, the broad paw with its toes, lying flat in front.
float smiShoulder(vec2 m){return smin(sdEll(rot(.30)*(m-vec2(-.26,.38)),vec2(.18,.25)),sdCap(m,vec2(-.28,.30),vec2(-.20,.13),.14,.11),.05);}
float smiFore(vec2 m){
 float el=sdEll(m-vec2(-.19,.105),vec2(.11,.09));
 float fa=sdCap(m,vec2(-.22,.09),vec2(-.66,.076),.105,.08);
 float wr=sdEll(m-vec2(-.67,.078),vec2(.08,.078));
 float pw=sdEll(m-vec2(-.82,.072),vec2(.14,.072));
 float d=smin(el,fa,.04);d=smin(d,wr,.025);d=smin(d,pw,.03);
 for(int i=0;i<4;i++){float fi=float(i);d=smin(d,length(m-vec2(-.912+fi*.037,.046-fi*.008))-.031,.012);}
 return d;}
// The near hind leg folded under her: the big haunch, the hock on the ground behind, the long hind foot along the ground, its paw.
float smiThigh(vec2 m){return sdEll(rot(.22)*(m-vec2(.56,.27)),vec2(.29,.24));}
float smiHind(vec2 m){
 float hk=sdEll(m-vec2(.86,.085),vec2(.075,.078));
 float mt=sdCap(m,vec2(.84,.07),vec2(.42,.056),.07,.06);
 float pw=sdEll(m-vec2(.31,.058),vec2(.11,.058));
 float d=smin(smiThigh(m),hk,.05);d=smin(d,mt,.04);d=smin(d,pw,.03);
 for(int i=0;i<3;i++){float fi=float(i);d=smin(d,length(m-vec2(.212+fi*.034,.04-fi*.006))-.027,.012);}
 return d;}
// The bobtail: short and thick.
float smiTail(vec2 m,SmiM a){return smin(sdCap(m,vec2(.86,.32),a.tCtl,.068,.060),sdCap(m,a.tCtl,a.tTip,.060,.050),.02);}

// Painted strokes of fur: short dashes along the hair, scattered on two staggered grids (each one lighter or darker than the coat).
float smiStrokes(vec2 m,vec2 dir){vec2 pp=vec2(-dir.y,dir.x);float s=0.;
 for(int k=0;k<2;k++){float fk=float(k);vec2 g=m*26.+fk*vec2(.5,.37);vec2 ci=floor(g);vec2 f=fract(g)-.5-(h22(ci+fk*7.)-.5)*.4;
  float a=dot(f,dir),b=dot(f,pp)+.15*a*a;s+=ss(.42,.18,abs(a))*ss(.12,.03,abs(b))*(h21(ci*1.7+fk)-.42);}
 return 1.+.20*s;}
// The coat: tawny, darker along the back, a cream belly and throat; very faint spots on the flanks; on the head a pale muzzle and chin,
// pale over the eye, a dark tear line, the dusky nose pad.
vec3 smiCoat(vec2 m,vec2 h,vec2 jw,vec2 dir,float thr,float lb){
 float bl=.66-.14*ss(-.35,.75,m.x);
 vec3 c=mix(SM_BELLY,SM_FUR,ss(.07,.20,m.y));
 // the legs: tawny on the outside, a little paler towards the paws
 c=mix(c,mix(SM_FUR*vec3(1.03,1.,.96),SM_BELLY,.30*ss(.12,.02,m.y)),lb);
 float head=ss(.02,-.08,h.x);
 c=mix(c,SM_DARK,ss(-.24,.0,m.y-bl)*(1.-head)*.85);
 c=mix(c,SM_BELLY,thr*(1.-head)*.55);
 c*=1.-.045*smiSpots(m*12.)*ss(.12,.24,m.y)*(1.-ss(-.14,-.04,m.y-bl))*(1.-head)*ss(-.1,.2,m.x);
 vec3 hc=SM_FUR*mix(1.,.80,ss(.0,.07,h.y-.02)*ss(-.04,-.16,h.x));
 hc=mix(hc,SM_PALE,ss(.025,-.02,sdEll(h-vec2(-.30,-.058),vec2(.078,.048))));
 hc=mix(hc,SM_PALE,ss(.02,-.02,sdEll(jw-vec2(-.21,-.118),vec2(.13,.040))));
 hc=mix(hc,SM_PALE*.97,ss(.012,-.01,sdEll(h-vec2(-.19,.003),vec2(.042,.016))));
 hc=mix(hc,SM_PALE*.95,ss(.03,-.03,sdEll(h-vec2(-.04,-.11),vec2(.10,.05)))*.8);
 hc=mix(hc,SM_DARK*.8,ss(.006,-.002,sdSeg(h,vec2(-.205,.020),vec2(-.235,-.022)))*.45);
 hc=mix(hc,vec3(.40,.26,.23),ss(.003,-.003,sdEll(h-vec2(-.366,-.004),vec2(.020,.017))));
 c=mix(c,hc,head);
 return c*smiStrokes(m,dir);}
// A warm rim of low sun just inside the sunward edge of a piece (d: its distance in screen units, g: its gradient, w: the width).
void smiRim(float d,vec2 g,float w,float k){if(d>PX||d<-w)return;vec2 n=g/max(length(g),1e-9);
 float f=ss(-w,-PX*2.2,d)*(1.-ss(-PX*1.2,PX,d))*pow(sat(dot(n,normalize(SUNL.xy))),1.5);glow(SUNC*vec3(1.,.80,.52)*f*k,0.);}
// A piece lit like the others but without texture (cheaper): the cubs' bones while the flesh grows.
void smiPlain(float d,vec2 g,vec3 alb,float R,float line){if(d>PX*4.)return;vec3 n=nrm(d,g,R);
 vec3 c=alb*(AMBC*.55+SUNC*.62*lambert(n)+.25);c=mix(c,c*.35,line*ss(-PX*1.6,0.,d));if(DARKBASE())c=max(c,alb*.30+.025);
 float a=cov(d);F=vec4(c,1.)*a+F*(1.-a);}
// The contour of a piece: only its outer silhouette, thin, broken where the sun catches the edge.
float smiLine(vec2 g,vec2 p,float k){vec2 n=g/max(length(g),1e-9);return k*(1.-.95*sat(dot(n,normalize(SUNL.xy))*1.6))*(.45+.65*vn(p));}

// The relief of her head (its own frame) and of her whole body: the masses of the chest, withers, barrel, haunch, shoulder, elbow,
// forearm, paws, hind foot, tail, neck; crown, cheek, muzzle, lips, brow, jaw.
void smiHeadBumps(inout vec4 A,vec2 h,float pit){vec4 B=vec4(0.);const float K=16.;
 smiBump(B,h,vec2(-.08,.03),0.,vec2(.145,.115),.13,.06,K);smiBump(B,h,vec2(-.125,-.035),0.,vec2(.14,.088),.10,.06,K);
 smiBump(B,h,vec2(-.25,-.022),.18,vec2(.11,.075),.08,.09,K);smiBump(B,h,vec2(-.268,-.088),0.,vec2(.098,.046),.05,.10,K);
 smiBump(B,h,vec2(-.17,.05),0.,vec2(.06,.04),.04,.13,K);smiBump(B,h,vec2(-.19,-.105),.1,vec2(.13,.04),.05,.08,K);
 B.xy=rot(-pit)*B.xy;A+=B;}
vec3 smiMomN(vec2 m,vec2 h,SmiM a){vec4 A=vec4(0.);const float K=16.;
 smiBump(A,m,vec2(-.32,.31),0.,vec2(.29,.31),.30,0.,K);smiBump(A,m,vec2(-.19,.52),.35,vec2(.18,.22),.16,0.,K);
 smiBump(A,m,vec2(.15,.25),-.06,vec2(.48,.22),.30,0.,K);smiBump(A,m,vec2(.56,.27),.22,vec2(.29,.24),.26,.06,K);
 smiBump(A,m,vec2(-.26,.38),.30,vec2(.18,.25),.20,.08,K);smiBump(A,m,vec2(-.20,.13),0.,vec2(.12,.12),.12,.16,K);
 smiBump(A,m,vec2(-.44,.085),-.03,vec2(.27,.09),.09,.20,K);smiBump(A,m,vec2(-.80,.07),0.,vec2(.16,.075),.07,.20,K);
 smiBump(A,m,vec2(.58,.065),-.03,vec2(.32,.07),.06,.15,K);smiBump(A,m,(vec2(.86,.32)+a.tTip)*.5,0.,vec2(.13,.10),.06,.04,K);
 vec2 nE=a.hp+rot(-a.pit)*vec2(.03,-.05);vec2 n0=vec2(-.20,.50);vec2 ax=nE-n0;
 smiBump(A,m,(n0+nE)*.5,atan(ax.y,ax.x),vec2(length(ax)*.5+.08,.19),.18,.02,K);
 smiHeadBumps(A,h,a.pit);
 return smiN(A);}
// Her shadow on the grass, cast towards the viewer and a little to the right (the sun is low behind her on the left): her outline seen
// from the sun, simplified.
float smiSil(vec2 m,SmiM a){float d=sdEll(m-vec2(-.30,.31),vec2(.29,.31));d=min(d,sdEll(m-vec2(.15,.27),vec2(.50,.25)));d=min(d,sdEll(m-vec2(.56,.27),vec2(.30,.26)));
 d=min(d,sdEll(m-vec2(-.20,.55),vec2(.17,.20)));d=min(d,sdCap(m,vec2(-.20,.50),a.hp,.17,.14));d=min(d,sdEll(m-a.hp-vec2(-.15,-.02),vec2(.22,.13)));
 d=min(d,sdCap(m,vec2(-.2,.09),vec2(-.85,.07),.10,.07));return d;}
void smiCastM(vec2 q,SmiM a){float dy=SM_P.y-q.y;if(dy<-.01||dy>.15)return;float H=max(dy,0.)/(.32*SM_S);
 vec2 ms=vec2((q.x-SM_P.x)/SM_S-.55*H,H);
 float s=ss(.07,-.07,smiSil(ms,a))*ss(-.012,.012,dy)*(1.-.45*ss(.3,1.,H));shadow(s*.45,vec3(.52,.52,.68),1.);}

// ---- The mother. While her head is lowered it is a piece of its own, in front of her chest; a second pass after cub B draws it (and
// the tongue) again over the cub while she licks it. ----
float smiCubBD=1e5;
// The sabre (head frame): a flattened blade that curves back a little and tapers, from under the upper lip to its tip beside the flange
// of the lower jaw. side: across it, -1 at its front edge .. 1 at its back edge.
float smiSabre(vec2 h,out float side){vec2 a=vec2(-.284,-.075),b=vec2(-.296,-.150),c=vec2(-.262,-.214);
 float u1=segU(h,a,b),u2=segU(h,b,c);vec2 p1=mix(a,b,u1),p2=mix(b,c,u2);float r1=mix(.021,.0135,u1),r2=mix(.0135,.003,u2);
 float d1=length(h-p1)-r1,d2=length(h-p2)-r2;vec2 t1=normalize(b-a),t2=normalize(c-b);
 side=d1<d2?dot(h-p1,vec2(-t1.y,t1.x))/r1:dot(h-p2,vec2(-t2.y,t2.x))/max(r2,.004);
 return max(smin(d1,d2,.004),h.y+.090);}   // its root is hidden under the lip
// Ivory enamel: warm off-white, the front edge lit, the back edge in soft shade, the root shaded by the lip (the colour is painted for
// the flat light of K_FLAT).
vec3 smiIvory(float side,float y){vec3 c=vec3(.96,.90,.78)*mix(1.10,.70,ss(-.55,.95,side))*mix(.74,1.,ss(-.090,-.112,y));
 c=mix(c,vec3(.88,.80,.64),ss(-.17,-.21,y)*.35);c+=vec3(.06,.05,.04)*ss(-.95,-.70,side);return c/vec3(1.12,.98,.90);}
// The tongue (head frame): short and flat; over the nose after the yawn, or out and curving down over the cub's head. side: across it,
// <0 its upper surface.
float smiTongue(vec2 h,SmiM a,out float side){bool nl=a.nose>a.lick;vec2 b=nl?vec2(-.335,-.09):vec2(-.33,-.097);vec2 c1,tp;float w0,w1;
 if(nl){c1=b+vec2(-.024,.012)*a.nose;tp=b+vec2(-.038,.042+.03*a.nose)*a.nose;w0=.0115;w1=.008;}
 else{c1=b+vec2(-.046,-.004)*a.lick;tp=b+vec2(-.068-.012*a.stroke,-.042+.018*a.stroke)*a.lick;w0=.0125;w1=.009;}
 float wm=(w0+w1)*.5;float u1=segU(h,b,c1),u2=segU(h,c1,tp);vec2 p1=mix(b,c1,u1),p2=mix(c1,tp,u2);
 float d1=length(h-p1)-mix(w0,wm,u1),d2=length(h-p2)-mix(wm,w1,u2);vec2 t1=normalize(c1-b+1e-5),t2=normalize(tp-c1+1e-5);
 side=d1<d2?dot(h-p1,vec2(-t1.y,t1.x))/w0:dot(h-p2,vec2(-t2.y,t2.x))/w1;if(nl)side=-side;
 return smin(d1,d2,.006);}
void smiTonguePiece(vec2 h,SmiM a){if(a.nose<.01&&a.lick<.01)return;float sd;float dT=smiTongue(h,a,sd)*SM_S*SM_HS;
 vec3 c=mix(vec3(1.,.74,.70),vec3(.70,.36,.38),ss(-.7,.8,-sd))/vec3(1.12,.98,.90);
 piece(dT,vec2(dFdx(dT),dFdy(dT)),c,K_FLAT,h*6.,vec2(1,0),.006,.25,0.);}
void smiMotherOver(vec2 q,SmiM a,bool onCub){
 if(a.pit<.3)return;
 if(onCub&&smiCubBD>PX*3.)return;
 vec2 m=(q-SM_P)/SM_S;if(length(m-a.hp)>.58)return;
 vec2 h=rot(a.pit)*(m-a.hp)/SM_HS;vec2 jw=SM_J+rot(a.gape)*(h-SM_J);float dEar;
 float dHd=smin(smiSkull(h,a.ear,dEar),smiJaw(jw),.025)*SM_HS;vec2 hd=normalize(rot(-a.pit)*vec2(1.,.12));
 vec4 A=vec4(0.);smiHeadBumps(A,h,a.pit);
 vec3 c=smiCoat(m,h,jw,hd,0.,0.)*smiRel(smiN(A));
 float d=dHd*SM_S;vec2 g=vec2(dFdx(d),dFdy(d));
 piece(d,g,c,K_FUR,m*.3,hd,.010,smiLine(g,m*26.,.5),0.);
 if(onCub){float sd;float sb=smiSabre(h,sd);piece(sb*SM_S*SM_HS,vec2(dFdx(sb),dFdy(sb)),smiIvory(sd,h.y),K_FLAT,h*3.,vec2(0,-1),.006,0.,0.);}
 smiTonguePiece(h,a);}
void smiMother(vec2 q,float t,SmiM a,float grow){
 vec2 m=(q-SM_P)/SM_S;
 if(m.x<-1.15||m.x>1.25||m.y<-.10||m.y>1.15)return;
 const float S=SM_S,SH=SM_S*SM_HS;
 bool needB=grow<.6;float dB=needB?smiBonesM(m,a.hp,a.pit)*S:-1.;float G=grow;
 if(needB&&G<.5)PIECE(dB,vec3(.88,.84,.74),K_BONE,m*.5,vec2(1,0),.01,.8,0.);
 vec2 h=rot(a.pit)*(m-a.hp)/SM_HS;
 vec2 jw=SM_J+rot(a.gape)*(h-SM_J);float dEar;
 float dSk=smiSkull(h,a.ear,dEar),dJw=smiJaw(jw);
 float dHd=smin(dSk,dJw,.025)*SM_HS;
 vec2 hd=normalize(rot(-a.pit)*vec2(1.,.12)); // the hair of the head, backwards from the nose
 // behind the body, in the blue shade: the far ear and the far foreleg
 {vec2 e=rot(-a.ear*.75)*(h-vec2(.025,.09));float dE=sdEll(e-vec2(.0,.030),vec2(.035,.040))*SM_HS;
  vec2 o=vec2(.07,.045);float dL=smin(sdCap(m-o,vec2(-.22,.09),vec2(-.66,.075),.092,.070),sdEll(m-o-vec2(-.80,.072),vec2(.13,.068)),.04);
  dL=smin(dL,sdEll(m-o-vec2(-.19,.10),vec2(.10,.085)),.04);
  float d=min(dE,dL);if(needB)d=max(d,dB-G);
  vec3 c=(dE<dL?SM_DARK*.75:mix(SM_BELLY,SM_FUR,.55)*.66)*vec3(.86,.92,1.08);
  float dd=d*S;vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,c*smiStrokes(m,vec2(-1.,-.1)),K_FUR,m*.3,dE<dL?vec2(0,-1):vec2(-1,-.1),.025,smiLine(g,m*26.,.45),0.);}
 // the body: one piece (the forms are modelled by the light, not outlined)
 float tor=smiTorso(m,a),dSh=smiShoulder(m),dFo=smiFore(m),dHi=smiHind(m),dTl=smiTail(m,a);
 float body=smin(tor,dSh,.04);body=smin(body,dFo,.035);body=smin(body,dHi,.05);body=smin(body,dTl,.03);body=smin(body,dHd,.06);
 body=max(body,-m.y);
 float d=body-.004*(vn(m*vec2(70.,55.))-.35);if(needB)d=max(d,dB-G);
 // the hair: back along the body, down off the shoulder, round the haunch, along the forearm and the hind foot, back from the nose
 vec2 dir=vec2(1.,-.15);dir=mix(dir,vec2(.35,-1.),ss(.30,.0,length((m-vec2(-.24,.40))*vec2(1.,.8))));
 dir=mix(dir,vec2(.8,-.55),ss(-.10,-.28,m.x)*ss(.42,.58,m.y));dir=mix(dir,vec2(.6,-.8),ss(.30,.1,length(m-vec2(.56,.28))));
 dir=mix(dir,vec2(-1.,-.06),ss(.02,-.03,dFo)*ss(.24,.12,m.y));dir=mix(dir,vec2(-1.,-.04),ss(.02,-.03,dHi)*ss(.15,.08,m.y)*ss(.15,.25,m.x));
 dir=mix(dir,normalize(a.tTip-a.tCtl+vec2(.05,0.)),ss(.02,-.03,dTl)*ss(.84,.92,m.x));
 dir=normalize(mix(dir,hd,ss(.05,-.10,h.x)*ss(.03,-.01,dHd)));
 // the throat (pale): under the neck
 vec2 nE=a.hp+rot(-a.pit)*vec2(.03,-.05);vec2 nax=normalize(nE-vec2(-.20,.50));float lb=ss(.01,-.015,min(dFo,dHi));
 float pdn=dot(m-vec2(-.20,.50),vec2(nax.y,-nax.x)*sign(nax.x));float thr=ss(.08,.16,pdn)*ss(.30,.22,pdn)*ss(-.24,-.36,m.x)*ss(.30,.40,m.y)*(1.-lb);
 // while the head is lowered to the cub (over the chest), the head's colours stop at its own outline
 float lw=ss(10.15,10.6,t)*(1.-ss(11.25,12.1,t));vec2 hc=h;hc.x=mix(hc.x,max(hc.x,.3),ss(.0,.012,dHd));
 vec3 col=smiCoat(m,hc,jw,dir,thr,lb)*smiRel(smiMomN(m,h,a));
 float dd=d*S;vec2 g=vec2(dFdx(dd),dFdy(dd));
 piece(dd,g,col,K_FUR,m*.3,dir,.010,smiLine(g,m*26.,.55),0.);
 smiRim(dd,g,.013,.45);
 smiMotherOver(q,a,false);
 if(G<.3)return;
 // the shade between the forms: under the edge of the forearm on the chest, where the hind foot meets the belly, the groove behind the
 // shoulder, the fold in front of the haunch, the toes
 float inB=ss(.0,-.015,body);
 shadow(ss(.022,.0,dFo)*ss(-.003,.004,dFo)*ss(.0,-.02,min(tor,dSh))*inB*.32,vec3(.40,.36,.44),0.);
 shadow(ss(.025,.0,dHi)*ss(-.003,.005,dHi)*ss(.0,-.02,tor)*ss(.26,.10,m.y)*inB*.26,vec3(.40,.36,.44),0.);
 shadow(ss(.05,.0,abs(dSh+.01))*ss(.0,-.05,tor)*ss(-.36,-.12,m.x)*ss(.18,.30,m.y)*inB*.13,vec3(.45,.40,.46),0.);
 shadow(ss(.035,.0,abs(smiThigh(m)))*ss(.50,.30,m.x)*ss(.12,.20,m.y)*inB*.16,vec3(.45,.40,.46),0.);
 {float tc=1e5;for(int i=0;i<3;i++){float fi=float(i);tc=min(tc,sdSeg(m,vec2(-.894+fi*.037,.012),vec2(-.891+fi*.037,.058)));}
  shadow(ss(.006,.0,tc)*ss(.0,-.01,dFo)*.30,vec3(.42,.34,.32),0.);}
 // the head lowered over the chest: its outline and a soft shadow under it
 {float e=dHd*S;shadow(lw*ss(.025,.0,e)*ss(-.001,.003,e)*.30*inB,vec3(.50,.42,.42),0.);
}
 // the ear: a darker rim, a paler centre, the low sun shining through it
 {float de=dEar;shadow(ss(.004,-.008,de)*ss(-.012,.0,de+.012)*.30,vec3(.45,.36,.30),0.);
  vec2 ee=rot(-a.ear*.75)*(h-vec2(-.015,.105));float din=sdEll(ee-vec2(-.006,.026),vec2(.017,.024));
  veil(mix(SM_FUR,SM_PALE,.6),ss(.004,-.006,din)*.35,0.);glow(SUNC*vec3(.9,.45,.25)*ss(.004,-.01,din)*.10*BACK,0.);}
 // the open mouth: a dark rose cavity with the tongue in it, between the palate and the lower jaw
 if(a.gape>.03){
  vec2 U=vec2(-.345,-.089),L=SM_J+rot(-a.gape)*(vec2(-.33,-.089)-SM_J);vec2 fd=normalize(L-U);float dF=-(fd.x*(h.y-U.y)-fd.y*(h.x-U.x));
  float cav=max(max(h.y+.084,-(jw.y+.083)),max(dF,-(length(h-SM_J)-.075)));
  vec3 cc=mix(vec3(.16,.07,.07),vec3(.42,.22,.21),ss(.08,.26,length(h-SM_J)));
  float tg=sdEll(jw-vec2(-.18,-.078),vec2(.125,.022));tg=smin(tg,sdEll(jw-vec2(-.29,-.064),vec2(.03,.016+.010*sat(a.gape-.6))),.02);tg=max(tg,cav-.002);
  cc=mix(cc,vec3(.72,.46,.45)*(.85+.15*ss(-.02,.0,jw.y+.07)),ss(.002,-.002,tg));cc=mix(cc,cc*.55,ss(.004,.0,abs(tg))*.7);
  PIECE(cav*SH,cc,K_SMOOTH,h*4.,vec2(1,0),.012,.6,0.);
  // the lower jaw again, in front of the cavity: its pale chin, the dark rim of its lip
  float cut=-(jw.y+.086);float dj=max(dJw,cut);vec3 c=mix(SM_FUR,SM_PALE,ss(-.08,-.11,jw.y))*vec3(.92,.96,1.04);
  vec2 e=vec2(.002,0.);vec2 gj=cut>dJw?vec2(0.,-1.):vec2(smiJaw(jw+e.xy)-dJw,smiJaw(jw+e.yx)-dJw);
  piece(dj*SH,gj*(rot(a.gape)*rot(a.pit)),c,K_FUR,jw*.3,rot(-a.pit+a.gape)*vec2(1.,0.),.02,.40,0.);
  float lip=abs(jw.y+.090)-.004;lip=max(lip,max(jw.x+.335,-.10-jw.x));shadow(ss(PX*.9,-PX*.6,lip*SH)*.85,vec3(.18,.10,.09),0.);
 }
 // the sabres (long flattened blades from under the upper lip, their tips by the chin) and, with the mouth open, the small teeth
 {float sd;float sb=smiSabre(h,sd);
  float lt=sdCap(jw,vec2(-.303,-.092),vec2(-.307,-.066),.010,.003);lt=min(lt,sdCap(jw,vec2(-.32,-.094),vec2(-.322,-.08),.005,.003));
  vec2 ui=h-vec2(-.337,-.090);ui.x-=.012*clamp(floor(ui.x/.012+.5),0.,2.);lt=min(lt,sdCap(ui,vec2(0.,.006),vec2(0.,-.006),.005,.004));
  float dt=min(sb,a.gape>.03?lt:1e3);vec3 tc=sb<lt+.001?smiIvory(sd,h.y):vec3(.93,.88,.76)/vec3(1.12,.98,.90);
  PIECE(dt*SH,tc,K_FLAT,h*3.,normalize(vec2(.25,-1.)),.006,.40*ss(.0,.012,dHd),0.);}
 // the lips: a dark line along the mouth when it is closed
 {float ml=abs(h.y+.094+.05*(h.x+.12)*(h.x+.345))-.0045;ml=max(ml,max(h.x+.35,-.115-h.x));if(a.gape<.05)shadow(ss(PX*.9,-PX*.6,ml*SH)*.80,vec3(.16,.10,.08),0.);}
 // the tongue: up over the nose after the yawn; out over the cub's head
 smiTonguePiece(h,a);
 // the nostril (it flares at the chuff)
 {float nn=sdEll(h-vec2(-.373,-.011),vec2(.008+.004*a.chuff,.0045+.002*a.chuff));shadow(ss(PX*.8,-PX*.8,nn*SH)*.9,vec3(.06,.04,.04),0.);}
 // whisker spots and a few pale whiskers lit by the low sun (they twitch forward at the chuff)
 {vec2 w=h-vec2(-.305,-.058);float sp=1e5;for(int i=0;i<4;i++){float fi=float(i);sp=min(sp,length(w-vec2(-.01+fi*.016,.008*sin(fi*2.)))-.0045);}
  shadow(ss(.002,-.002,sp)*.30,vec3(.5,.4,.35),0.);
  float wk=1e5;for(int i=0;i<5;i++){float fi=float(i);vec2 o=vec2(-.315+fi*.010,-.062+fi*.006);vec2 dr=normalize(vec2(-1.,-.40+fi*.14+.2*a.chuff));wk=min(wk,sdSeg(h,o,o+dr*(.16-fi*.012)+vec2(0.,-.012)));}
  veil(vec3(1.,.93,.80),ss(PX*1.2/SH,0.,wk)*.42*ss(.02,-.01,h.x+.30),0.);}
 // the eye (squints in the yawn, half shut when drowsy), with a dark rim and a soft brow above
 {vec2 ec=vec2(-.188,.036);vec2 eq=SM_P+S*(a.hp+rot(-a.pit)*ec*SM_HS);
  shadow(ss(.034,.0,length((h-ec-vec2(.005,.022))*vec2(1.,1.6)))*.25,vec3(.55,.45,.42),0.);
  shadow(ss(.004,-.002,length(h-ec)-.027)*.45,vec3(.35,.28,.25),0.);
  if(a.eye<.8)eyeA(q,eq,.022*SH,vec3(.80,.62,.25),SM_FUR*.80,a.eye/.8*.75+.12,0.);
  else{vec2 el=h-ec;float arc=abs(el.y+.010-.9*el.x*el.x/.03)-.0035;arc=max(arc,abs(el.x)-.027);shadow(ss(PX*.9,-PX*.6,arc*SH)*.85,vec3(.18,.11,.08),0.);}}
}

// ---- The cubs: a small rig (shoulder S, hip P, head H and its angle, the four paws, the hind hocks, a roll onto the back, the tail),
// in each cub's own frame (metres, ground y 0, facing +x). Kittens: a long supple body on slender legs with big paws, a round head with
// a short real muzzle, small rounded ears, blue-grey kitten eyes; a paler coat with faint spots (like lion and puma cubs: speculative);
// milk teeth only (the sabres came much later). ----
struct SmiC{vec2 S,P,H,fN,fF,hN,hF,kN,kF;float ha,roll,eye,mouth,tail,ear;};
SmiC smiCm(SmiC a,SmiC b,float k){SmiC c;c.S=mix(a.S,b.S,k);c.P=mix(a.P,b.P,k);c.H=mix(a.H,b.H,k);c.fN=mix(a.fN,b.fN,k);c.fF=mix(a.fF,b.fF,k);
 c.hN=mix(a.hN,b.hN,k);c.hF=mix(a.hF,b.hF,k);c.kN=mix(a.kN,b.kN,k);c.kF=mix(a.kF,b.kF,k);c.ha=mix(a.ha,b.ha,k);c.roll=mix(a.roll,b.roll,k);
 c.eye=mix(a.eye,b.eye,k);c.mouth=mix(a.mouth,b.mouth,k);c.tail=mix(a.tail,b.tail,k);c.ear=mix(a.ear,b.ear,k);return c;}
SmiC smiLie(){return SmiC(vec2(.09,.10),vec2(-.13,.095),vec2(.20,.19),vec2(.25,.025),vec2(.22,.035),vec2(-.03,.018),vec2(-.05,.026),vec2(-.19,.028),vec2(-.21,.036),.04,0.,0.,0.,-.15,0.);}
SmiC smiStand(){return SmiC(vec2(.10,.205),vec2(-.12,.215),vec2(.21,.285),vec2(.12,.025),vec2(.08,.025),vec2(-.09,.012),vec2(-.14,.012),vec2(-.14,.075),vec2(-.19,.075),.12,0.,0.,0.,.35,0.);}
SmiC smiCrouch(){return SmiC(vec2(.11,.13),vec2(-.11,.185),vec2(.21,.165),vec2(.19,.025),vec2(.16,.025),vec2(-.07,.012),vec2(-.11,.012),vec2(-.13,.06),vec2(-.17,.06),-.08,0.,0.,0.,.25,.2);}
SmiC smiBack(){return SmiC(vec2(.09,.10),vec2(-.13,.095),vec2(.20,.11),vec2(.14,.27),vec2(.07,.26),vec2(-.06,.27),vec2(-.13,.26),vec2(-.10,.20),vec2(-.17,.19),-.35,1.,0.,0.,-.4,.3);}
// crouched over a toy: the rump up, the head low, the forepaws forward and together (the story sets them on the tail)
SmiC smiPin(){return SmiC(vec2(.09,.125),vec2(-.12,.175),vec2(.17,.16),vec2(.27,.06),vec2(.25,.07),vec2(-.06,.012),vec2(-.10,.012),vec2(-.13,.06),vec2(-.16,.06),-.22,0.,0.,0.,.35,.15);}

float smiBonesC(vec2 l){float d=sdEll(l-vec2(.20,.195),vec2(.055,.048));d=max(d,-sdEll(l-vec2(.225,.205),vec2(.014,.013)));
 d=min(d,sdCap(l,vec2(.22,.165),vec2(.27,.168),.010,.008));
 d=min(d,sdCap(l,vec2(.15,.17),vec2(.0,.155),.009,.009));d=min(d,sdCap(l,vec2(.0,.155),vec2(-.14,.115),.009,.008));d=min(d,sdCap(l,vec2(-.14,.115),vec2(-.24,.06),.007,.004));
 for(int i=0;i<5;i++){float x=.07-float(i)*.04;d=min(d,sdCap(l,vec2(x,.15),vec2(x+.025,.06),.0045,.004));}
 d=min(d,sdCap(l,vec2(.09,.10),vec2(.11,.04),.008,.006));d=min(d,sdCap(l,vec2(.11,.04),vec2(.25,.025),.006,.005));
 d=min(d,sdEll(l-vec2(-.12,.10),vec2(.05,.02)));
 d=min(d,sdCap(l,vec2(-.12,.095),vec2(-.05,.05),.008,.006));d=min(d,sdCap(l,vec2(-.05,.05),vec2(-.19,.028),.006,.005));d=min(d,sdCap(l,vec2(-.19,.028),vec2(-.03,.018),.005,.004));
 return d;}

void smiCub(vec2 q,vec2 pos,float S,SmiC c,float t,float sd,float grow,bool isB){
 vec2 l=(q-pos)/S;
 if(l.x<-.40||l.x>.44||l.y<-.05||l.y>.62)return;
 const float HS=1.20;float cr=cos(PI*c.roll);
 bool needB=grow<.6;float dB=needB?smiBonesC(l)*S:-1.;float G=grow*.3;
 if(needB&&grow<.5)smiPlain(dB,vec2(dFdx(dB),dFdy(dB)),vec3(.88,.84,.74),.004,.8);
 vec3 coat=vec3(.84,.63,.39),belly=vec3(.94,.85,.70),dark=vec3(.55,.39,.24);
 vec2 ax=normalize(c.S-c.P),nv=vec2(-ax.y,ax.x);vec2 mid=(c.S+c.P)*.5;vec2 bl=vec2(dot(l-mid,ax),dot(l-mid,nv));
 float br=sin(t*2.6+sd);
 vec2 h=rot(-c.ha)*(l-c.H)/HS;
 // behind the body, one piece: the tail stub (darker at the tip), the far legs and the far ear, in the blue shade
 vec2 rF=c.S-nv*.040*cr,eF=knee(rF,c.fF,.095,.09,-1.);
 vec2 rH=c.P-nv*.032*cr,kH=knee(rH,c.kF,.09,.085,1.);
 {vec2 tb=c.P-ax*.075+nv*.03*cr;vec2 td=-ax*cos(c.tail)+nv*sin(c.tail);vec2 tip=tb+td*.085+nv*.012*sin(t*2.3+sd);
  float dT=sdCap(l,tb,tip,.026,.021);
  float d=smin(sdCap(l,rF,eF,.030,.023),sdCap(l,eF,c.fF,.021,.019),.015);d=smin(d,sdEll(l-c.fF-vec2(.016,-.006*cr),vec2(.040,.025)),.012);
  float e=smin(sdCap(l,rH,kH,.040,.025),sdCap(l,kH,c.kF,.019,.016),.012);e=smin(e,sdCap(l,c.kF,c.hF,.017,.015),.01);e=smin(e,sdEll(l-c.hF-vec2(.014,.0),vec2(.036,.021)),.01);
  vec2 ef=rot(c.ear*.7+.10)*(h-vec2(.012,.048));float dE=sdEll(ef-vec2(.0,.018),vec2(.021,.023))*HS;
  d=min(d,e);float dd=min(min(d,dT),dE);if(needB)dd=max(dd,dB-G);
  vec3 cc=dT<min(d,dE)?mix(coat*.92,dark*.8,ss(.05,.085,length(l-tb))):(dE<d?dark*.8:mix(belly,coat,.5)*.66)*vec3(.86,.92,1.08);
  dd*=S;vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,cc,K_FUR,l*.35,dT<d?normalize(tip-tb):vec2(0,-1),.012,smiLine(g,l*40.,.62),0.);}
 // body, neck and the round kitten head with its short muzzle: one piece, modelled by the light
 float chest=sdEll(bl-vec2(.085,-.006*cr),vec2(.105,.092)),bel=sdEll(bl-vec2(-.01,-.012*cr),vec2(.16,.082+.004*br)),hip=sdEll(bl-vec2(-.105,.0),vec2(.094,.090));
 float tor=smin(smin(chest,bel,.05),hip,.05);
 float nk=sdCap(l,c.S+ax*.02+nv*.03*cr,c.H+rot(c.ha)*vec2(-.025,-.02),.058,.048);
 float hc=sdEll(h-vec2(0.,.005),vec2(.062,.054)),hm=sdEll(rot(-.22)*(h-vec2(.054,-.014)),vec2(.046,.032)),hp=sdEll(h-vec2(.073,-.031),vec2(.026,.020));
 float hk=sdEll(h-vec2(.008,-.024),vec2(.054,.040)),hj=sdEll(h-vec2(.048,-.041-.014*c.mouth),vec2(.030,.013));
 vec2 e=rot(c.ear*.7+.18)*(h-vec2(-.020,.048));float de=sdEll(e-vec2(.0,.020),vec2(.024,.026));
 float dHd=smin(smin(hc,hm,.028),hp,.012);dHd=smin(dHd,hk,.025);dHd=smin(dHd,hj,.010);dHd=smin(dHd,de,.006);dHd*=HS;de*=HS;
 float d=smin(smin(tor,nk,.04),dHd,.025);
 float fl=.0025*(vn(l*45.+sd)-.4);
 if(isB)smiCubBD=min(smiCubBD,d*S);
 {float dd=d+fl;if(needB)dd=max(dd,dB-G);
  float yr=bl.y*cr;vec3 a=mix(belly,coat,ss(-.07,.02,yr));a=mix(a,dark,ss(.04,.09,yr)*.40);
  float hw=ss(.0,-.025,dHd-min(tor,nk));
  a*=1.-.20*smiSpots(l*24.+sd*7.)*ss(-.075,-.01,yr)*(1.-hw);
  // the face: a pale muzzle and chin, pale over the eye, the dark tear line, the pink-brown nose, faint spots on the crown, dark ear backs
  vec3 ah=coat;
  ah=mix(ah,belly*1.02,ss(.006,-.006,sdEll(h-vec2(.072,-.031),vec2(.030,.020))));
  ah=mix(ah,belly,ss(.006,-.006,sdEll(h-vec2(.046,-.044),vec2(.030,.012))));
  ah=mix(ah,belly,ss(.006,-.004,sdEll(h-vec2(.030,.026),vec2(.020,.007))));
  ah=mix(ah,dark*.7,ss(.004,.0,sdSeg(h,vec2(.046,.002),vec2(.056,-.016)))*.55);
  ah=mix(ah,vec3(.40,.26,.23),ss(.003,-.003,sdEll(h-vec2(.096,-.012),vec2(.010,.009))));
  ah*=1.-.16*smiSpots(h*48.+sd)*ss(.01,.035,h.y)*ss(.03,-.01,h.x);ah=mix(ah,mix(dark*.62,coat*.9,ss(-.004,-.014,de/HS)),ss(.004,-.004,de/HS)*ss(.0,.02,h.y-.045));
  a=mix(a,ah,hw);
  vec2 dir=normalize(mix(-ax,rot(c.ha)*vec2(-1.,.1),hw));a*=smiStrokes(l*1.4,dir);
  // the relief: chest, belly, hip; crown, cheek, muzzle
  vec4 A=vec4(0.),B=vec4(0.);const float K=55.;
  smiBump(A,bl,vec2(.085,-.006*cr),0.,vec2(.105,.092),.09,0.,K);smiBump(A,bl,vec2(-.01,-.012*cr),0.,vec2(.16,.082),.08,0.,K);smiBump(A,bl,vec2(-.105,0.),0.,vec2(.094,.090),.08,.01,K);
  A.xy=ax*A.x+nv*A.y;
  smiBump(B,h,vec2(0.,.005),0.,vec2(.062,.054),.060,.03,K);smiBump(B,h,vec2(.054,-.014),-.22,vec2(.046,.032),.030,.06,K);smiBump(B,h,vec2(.008,-.024),0.,vec2(.054,.040),.04,.04,K);
  smiBump(B,h,vec2(.073,-.031),0.,vec2(.026,.020),.016,.08,K);
  B.xy=rot(c.ha)*B.xy;A+=B;
  a*=smiRel(smiN(A));
  dd*=S;vec2 g=vec2(dFdx(dd),dFdy(dd));
  piece(dd,g,a,K_FUR,l*.35,dir,.010,smiLine(g,l*40.,.68),0.);
  smiRim(dd,g,.009,.62);}
 // the near legs, slender, with big soft paws (one piece; a seam where they cross)
 vec2 rN=c.S-nv*.05*cr+ax*.01,eN=knee(rN,c.fN,.095,.09,-1.);
 vec2 rh=c.P-nv*.04*cr+ax*.01,kh=knee(rh,c.kN,.09,.085,1.);
 {float d=smin(sdCap(l,rN,eN,.034,.026),sdCap(l,eN,c.fN,.024,.021),.02);d=smin(d,sdEll(l-c.fN-vec2(.020,-.007*cr),vec2(.049,.029)),.015);
  float e2=smin(sdCap(l,rh,kh,.042,.026),sdCap(l,kh,c.kN,.020,.017),.012);e2=smin(e2,sdCap(l,c.kN,c.hN,.019,.017),.01);e2=smin(e2,sdEll(l-c.hN-vec2(.018,.0),vec2(.045,.025)),.01);
  bool hi=e2<d+.004;float dd=min(d,e2)+fl;if(needB)dd=max(dd,dB-G);if(isB)smiCubBD=min(smiCubBD,min(d,e2)*S);
  dd*=S;vec2 g=vec2(dFdx(dd),dFdy(dd));vec2 ld=hi?normalize(c.kN-rh):normalize(c.fN-rN);
  piece(dd,g,mix(belly,coat,hi?.6:.62)*smiStrokes(l*1.4,ld),K_FUR,l*.35,ld,.016,smiLine(g,l*40.,.65),0.);
  smiRim(dd,g,.007,.50);
  shadow(ss(.006,.0,abs(e2))*ss(.002,-.004,d)*.40,vec3(.42,.34,.30),0.);
  // the toes
  vec2 fp=c.fN+vec2(.018,-.007*cr),hp2=c.hN+vec2(.016,0.);
  float tl=min(min(sdSeg(l,fp+vec2(.028,-.020*cr),fp+vec2(.024,.004*cr)),sdSeg(l,fp+vec2(.010,-.027*cr),fp+vec2(.008,-.004*cr))),sdSeg(l,hp2+vec2(.024,-.018),hp2+vec2(.020,.004)));
  shadow(ss(.004,.0,tl)*ss(.0,-.006,min(d,e2))*.4,vec3(.5,.42,.36),0.);}
 if(grow<.4)return;
 // the face: the mouth line or a small mew; the kitten's eye (blue-grey, dark-rimmed, the lids a little lowered)
 {float ml=sdSeg(h,vec2(.095,-.020),vec2(.091,-.035));ml=min(ml,sdSeg(h,vec2(.091,-.035),vec2(.066,-.040)))-.0018;shadow(ss(PX*.9,-PX*.6,ml*HS*S)*.75,vec3(.32,.20,.17),0.);
  float mo=sdEll(h-vec2(.074,-.040-.008*c.mouth),vec2(.014*c.mouth+.001,.010*c.mouth+.001));if(c.mouth>.05){veil(vec3(.36,.16,.16),cov(mo*HS*S),0.);shadow(ss(PX*1.4,0.,abs(mo*HS*S))*.5,vec3(.3,.2,.2),0.);}
  vec2 ec=c.H+rot(c.ha)*vec2(.036,.011)*HS;shadow(ss(.004,-.002,length(l-ec)-.018)*.45,vec3(.35,.28,.24),0.);
  eyeA(q,pos+S*ec,.0155*S,vec3(.56,.64,.70),coat*.82,max(max(c.eye,blinkAt(t,sd)),.16),0.);}
}

// ---- The cubs' story ----
// Cub B (the far one, licked at the end): lies by its mother's forepaws; crouches, wiggles and pounces towards its sibling (4.45), bats
// at it; lies down again and watches; looks up at its mother, is licked (eyes shut, head pushed down a little), lies with its head down.
vec2 smiPosB(float t){float u=sat((t-4.45)/.36);return vec2(-.44+.10*ss(4.45,4.81,t),SM_GB+.032*sin(PI*u));}
SmiC smiCubB(float t,SmiM a){SmiC c=smiLie();c.ha+=.08*sin(t*.7)+.05*sin(t*1.9);c.ear=.3*ss(.7,1.,sin(t*.9+2.));c.tail+=.15*sin(t*1.1);
 c=smiCm(c,smiCrouch(),ss(3.9,4.25,t));
 c.P.x+=.012*sin(t*25.)*ss(4.05,4.15,t)*(1.-ss(4.32,4.42,t));c.tail+=.4*sin(t*14.)*ss(4.0,4.1,t)*(1.-ss(4.35,4.45,t));
 // the leap: forepaws reach forward in the air, then the landing in a crouch
 float lp=sin(PI*sat((t-4.45)/.36));SmiC fly=smiStand();fly.fN=vec2(.22,.10);fly.fF=vec2(.19,.11);fly.hN=vec2(-.20,.06);fly.hF=vec2(-.22,.07);fly.kN=vec2(-.19,.11);fly.kF=vec2(-.21,.11);fly.ha=-.05;
 c=smiCm(c,smiCrouch(),ss(4.45,4.81,t));c=smiCm(c,fly,lp*.85);
 // batting at the sibling on its back (4.9–6.9): quick swipes of the near forepaw from a low crouch, the head low and following
 float pw=ss(4.85,5.0,t)*(1.-ss(6.7,6.95,t));float bf=fract((t-4.9)/.72);float sw=ss(.0,.12,bf)*ss(.5,.22,bf);
 c.fN+=vec2(.09,.07)*sw*pw;c.fF+=vec2(.03,.0)*(1.-sw)*pw;c.ha+=.20*pw;c.H+=vec2(.01,-.02)*pw;c.S.y-=.015*pw*sw;c.tail+=.3*pw*sin(t*3.);
 SmiC lie=smiLie();lie.ha-=.06;c=smiCm(c,lie,ss(6.9,7.6,t));
 // watching its sibling run, then up at its mother; licked; lies with its head down
 c.ha+=-.12*ss(8.0,8.4,t)*(1.-ss(9.3,9.7,t));
 float up=ss(9.55,9.95,t)*(1.-ss(11.2,11.7,t));c.ha+=-.36*up;c.H.y+=.05*up;c.H.x+=.01*up;
 float lk=ss(10.45,10.6,t)*(1.-ss(11.15,11.4,t));c.ha+=.18*lk+.08*a.stroke;c.H.y-=.012*a.stroke;c.H.x-=.01*lk;c.eye=max(c.eye,lk);c.ear=max(c.ear,.6*lk);
 c.mouth=ss(4.36,4.44,t)*(1.-ss(4.6,4.75,t))+.7*ss(11.4,11.5,t)*(1.-ss(11.62,11.78,t));
 c.eye=max(c.eye,.5*ss(11.5,11.9,t)*(1.-ss(12.4,12.9,t)));
 SmiC low=smiLie();low.H=vec2(.22,.12);low.ha=.25;c=smiCm(c,low,ss(12.5,13.6,t));
 return c;}
// Cub A (the near one): lies; lifts its head; rolls onto its back (4.6–5.6) and bats and kicks up at its sibling; rolls back up,
// crouches, bounds off to its mother's tail (7.7–8.5), pounces on it and pins it with its forepaws (8.55–9.0); the tail flicks free; the
// kitten rolls onto its back after it, paws up; rolls back and lies watching it; lies down.
vec2 smiPosA(float t){float u=sat((t-7.7)/.8);return mix(vec2(-.15,SM_GA),vec2(.36,-.218),ss(7.7,8.5,t))+vec2(0.,.024*abs(sin(TAU*u))*ss(7.66,7.76,t)*(1.-ss(8.42,8.52,t)));}
float smiScaleA(float t){return mix(SM_C,.457,ss(7.7,8.5,t));}
SmiC smiCubA(float t,SmiM a,vec2 pos,float S){SmiC c=smiLie();c.ha+=.06*sin(t*.8+1.);c.tail+=.2*sin(t*1.3+1.);
 c.ha+=-.25*ss(3.8,4.2,t)*(1.-ss(4.5,4.9,t));c.ear=.6*ss(3.85,3.95,t)*(1.-ss(4.1,4.3,t));
 // the roll onto its back (the paws tuck in through the middle of the roll)
 float r1=ss(4.6,5.6,t),r2=ss(6.8,7.45,t);
 c=smiCm(c,smiBack(),r1);
 float pa=ss(5.5,5.7,t)*(1.-ss(6.7,6.85,t));
 float b1=fract((t-5.6)/.62),b2=fract((t-5.91)/.62);float s1=ss(.0,.10,b1)*ss(.42,.18,b1),s2=ss(.0,.10,b2)*ss(.42,.18,b2);
 c.fN+=vec2(-.07+.06*s1,.06*s1-.04)*pa;c.fF+=vec2(-.06+.05*s2,.06*s2-.05)*pa;c.hN+=vec2(.03*sin(t*4.5+1.),.025*sin(t*4.5+2.5))*pa;c.kN+=vec2(.02*sin(t*4.5+1.),.02*sin(t*4.5+2.5))*pa;
 c.ha+=.12*sin(t*2.)*pa;
 c=smiCm(c,smiCrouch(),r2);
 float tk=.5*sin(PI*r1)+.5*sin(PI*r2);vec2 mid=(c.S+c.P)*.5;c.fN=mix(c.fN,mid+vec2(.08,0.),tk);c.fF=mix(c.fF,mid+vec2(.06,0.),tk);
 c.hN=mix(c.hN,mid+vec2(-.04,0.),tk);c.hF=mix(c.hF,mid+vec2(-.06,0.),tk);c.kN=mix(c.kN,mid+vec2(-.10,0.),tk);c.kF=mix(c.kF,mid+vec2(-.12,0.),tk);
 c.P.x+=.012*sin(t*24.)*ss(7.42,7.5,t)*(1.-ss(7.62,7.7,t));
 // the bounds
 float bw=ss(7.66,7.76,t)*(1.-ss(8.42,8.52,t));float ph=sat((t-7.7)/.8)*2.;float s=.5+.5*cos(TAU*ph);
 SmiC ext=smiStand();ext.S=vec2(.10,.20);ext.P=vec2(-.12,.19);ext.fN=vec2(.21,.08);ext.fF=vec2(.18,.09);ext.hN=vec2(-.24,.07);ext.hF=vec2(-.26,.08);ext.kN=vec2(-.19,.11);ext.kF=vec2(-.21,.12);ext.H=vec2(.22,.25);ext.ha=0.;
 SmiC gat=smiStand();gat.S=vec2(.09,.16);gat.P=vec2(-.10,.19);gat.fN=vec2(.04,.025);gat.fF=vec2(.0,.025);gat.hN=vec2(.03,.012);gat.hF=vec2(-.01,.012);gat.kN=vec2(-.05,.06);gat.kF=vec2(-.08,.06);gat.H=vec2(.20,.22);gat.ha=.1;
 c=smiCm(c,smiCm(ext,gat,s),bw);
 // the pounce on the tail: crouched, the forepaws pin it while it is held
 vec2 tl=(SM_P+SM_S*smiTailAt(a,.94)-pos)/S;
 float pn=ss(8.45,8.6,t)*(1.-ss(9.05,9.3,t));SmiC pin=smiPin();float hold=ss(8.55,8.66,t)*(1.-ss(9.0,9.08,t));
 pin.fN=mix(pin.fN,tl+vec2(-.018,-.004),hold);pin.fF=mix(pin.fF,tl+vec2(-.036,.004),hold);pin.H=mix(pin.H,tl+vec2(-.11,.03),hold*.6);
 c=smiCm(c,pin,pn);
 // after it: onto its back, paws up and batting at the swinging tail; then back onto its belly, watching it
 float rb=ss(9.05,9.35,t)*(1.-ss(9.7,10.1,t));SmiC bk=smiBack();float sb=ss(.0,.1,fract((t-9.2)/.36))*ss(.5,.2,fract((t-9.2)/.36));
 bk.fN+=vec2(.05,.05)*sb;bk.fF+=vec2(.04,.05)*(1.-sb);bk.ha=-.45;
 c=smiCm(c,bk,rb);
 SmiC wl=smiLie();wl.ha=-.18+.06*sin(t*1.1);wl.H=vec2(.21,.20);c=smiCm(c,wl,ss(9.7,10.2,t));
 c.mouth=ss(5.95,6.05,t)*(1.-ss(6.2,6.35,t))+ss(9.28,9.36,t)*(1.-ss(9.5,9.62,t));
 SmiC low=smiLie();low.H=vec2(.22,.12);low.ha=.28;low.eye=.5;c=smiCm(c,low,ss(12.1,13.2,t));
 return c;}

// ---- The grassland: the layered blue ranges, groves of oak and juniper, golden grass in clumps, the tar seep ----
float smiBlade(vec2 q,vec2 b,float h,float lean,float w){float y=(q.y-b.y)/h;float x=q.x-b.x-lean*h*y*y;
 float d=(abs(x)-w*(1.-.85*sat(y)))/sqrt(1.+4.*lean*lean*y*y);return max(d,max(b.y-q.y,q.y-b.y-h));}
// The colour of the plain at q: pale straw far away, warmer nearer, a hint of olive where green bases show under the dry grass; nearer,
// the sward shows as soft upright strokes (fading out with distance before they get finer than the pixels).
vec3 smiGround(vec2 q){float pz=max(.02,SM_HZ+.09-q.y);
 vec3 g=mix(vec3(.90,.81,.62),vec3(.87,.74,.50),ss(SM_HZ,-.12,q.y));g=mix(g,vec3(.80,.65,.40),ss(-.16,-.70,q.y));
 g*=.92+.16*fbm2(vec2(q.x*2.5/pz,q.y*7.+1./pz));
 g=mix(g,g*vec3(.88,.93,.80),ss(.55,.75,fbm2(vec2(q.x*1.6/pz,q.y*4.)+7.))*.6);
 float zb=15./pz,b=floor(zb),fz=fract(zb),fx=55.*(b+.5)/15.;float sw=vn(vec2(q.x*fx+b*7.13,b*.37));
 float zb2=zb+.5,b2=floor(zb2),fz2=fract(zb2),fx2=55.*(b2+.5)/15.;float sw2=vn(vec2(q.x*fx2*1.6+b2*3.7,b2*.71));
 float w1=sin(PI*fz),w2=sin(PI*fz2);
 g*=1.+(.20*(sw-.5)*w1+.06*sw*(1.-fz)*w1+.14*(sw2-.5)*w2+.04*sw2*(1.-fz2)*w2)*ss(300.,120.,fx);
 return g;}
vec3 SMI_G=vec3(.8);  // the plain's colour at this pixel (set by smiLand)
vec2 smiGU(vec2 q){float pz=max(.02,SM_HZ+.09-q.y);return vec2(q.x*.28/pz,q.y*2.5);}
// Clumps of bunchgrass, in rows back to front (row i lies at y0; nearer rows are further apart). Each clump is a fountain of blades of
// its own height (real heights 0.15–0.5 m, scaled by the perspective of the plain), some carrying seed heads; dense and sparse patches
// along each row; grazed short in the open ground round the animals, tall at the sides of the foreground. Slow waves of wind run through
// them; the low sun behind lights their tips and seed heads.
float smiRowY(int i){return SM_HZ-.008*(pow(1.22,float(i))-1.)/.22;}
float smiK(float y){return 1.96*(SM_HZ-y);}   // screen units per metre on the plain at the ground line y
// The clump of row i in the pixel's cell: x its centre, y its foot, z its half width at the top, w its height (0: none).
vec4 smiTuft(vec2 q,int i,out float ci){float y0=smiRowY(i),k=smiK(y0),sd=float(i)*7.31;float wc=k*.60;
 ci=floor(q.x/wc+sd);float cx=(ci+.5+(h11(ci*1.7+sd)-.5)*.16-sd)*wc;float yb=y0-h11(ci+3.1+sd)*.4*.008*pow(1.22,float(i));
 float dens=.30+.65*vn(vec2(cx*4.+sd,sd));float on=step(h11(ci+sd*1.3),dens);
 float hr=(.16+.30*h11(ci*2.3+sd))*(.75+.5*vn(vec2(cx*3.,sd+5.)));
 // grazed short round the animals and in front of them
 float clr=ss(.68,.52,abs(cx-.03))*ss(-.18,-.24,y0)*ss(-.70,-.55,y0);hr=mix(hr,.04+.04*h11(ci*4.1+sd),clr);
 hr*=1.+.5*ss(-.30,-.55,y0)*ss(.45,.75,abs(cx));
 on*=1.-ss(1.25,1.,length((vec2(cx,yb)-vec2(-.62,-.105))/vec2(.34,.05)));   // none in the seep
 float H=hr*k;return vec4(cx,yb,H*.36,H*on);}
bool smiRowHit(vec2 q,int i){float ci;vec4 tf=smiTuft(q,i,ci);return tf.w>0.&&abs(q.x-tf.x)<tf.z+tf.w*.10+PX*3.&&q.y>=tf.y-PX*3.&&q.y<=tf.y+tf.w*1.12;}
void smiRow(vec2 q,float t,int i){float ci;vec4 tf=smiTuft(q,i,ci);float sd=float(i)*7.31+ci*.37;
 float cx=tf.x,yb=tf.y,tw=tf.z,Ht=max(tf.w,1e-4);
 float yy=(q.y-yb)/Ht;
 float wave=.5+.5*sin(t*.55-q.x*1.8-yb*5.+float(i));          // a slow wave of wind through the field
 float lean=.16*(wave-.5)+.04*sin(t*1.3+cx*9.);
 float x=q.x-cx-lean*Ht*yy*yy;
 float bw=tw*.28,wy=bw+(tw-bw)*sqrt(sat(yy)),a=x/wy;          // the clump's half width at this height; a: across it, -1 to 1
 // the front blades (nine), the tallest in the middle; some with a seed head
 float x1=a*4.5+sd,c1=floor(x1),f1=fract(x1)-.5-(h11(c1+1.)-.5)*.3,ac=(c1+.5-sd)/4.5;
 float hb1=(.50+.50*h11(c1*1.3))*(1.-.50*ac*ac);bool s1=h11(c1+7.)>.70&&hb1>.60;if(s1)hb1*=1.06;
 float wb1=.30*(1.-sat(yy/hb1));float sh=s1?ss(hb1*.86,hb1*.90,yy)*(1.-ss(hb1*.97,hb1,yy)):0.;wb1=max(wb1,.09*sh);
 float d1=max((abs(f1)-wb1)*wy/4.5,(yy-hb1)*Ht);
 // the blades behind (seven), shorter and in their own shade
 float x2=a*3.5+sd*1.7+.37,c2=floor(x2),f2=fract(x2)-.5-(h11(c2+4.)-.5)*.3,a2=(c2+.5-sd*1.7-.37)/3.5;
 float hb2=(.40+.45*h11(c2*1.9+3.))*(1.-.45*a2*a2);float d2=max((abs(f2)-.30*(1.-sat(yy/hb2)))*wy/3.5,(yy-hb2)*Ht);
 float d=max(min(d1,d2),max((abs(a)-1.)*wy,yb-PX-q.y));
 bool fr=d1<d2+PX*.5;float yt=sat(yy/(fr?hb1:hb2));
 vec3 c=SMI_G*mix(.70,1.16,ss(.0,.85,yt))*(.90+.20*h11(ci+9.))*(1.+.08*wave*yt)*(fr?1.:.84);
 c=mix(c,c*vec3(.90,.98,.84),step(.72,h11(ci*3.3))*.7);         // a few greener clumps
 c=mix(c,vec3(1.,.92,.72),fr?sh*.6:0.);
 // its own shade on the ground at its foot
 shadow(ss(1.,.25,length((q-vec2(cx,yb))/vec2(tw*.9,Ht*.06+PX*2.)))*.30,vec3(.60,.55,.60),1.);
 piece(d,vec2(0.,1.),c,K_GRASS,smiGU(vec2(x,q.y)),vec2(0,1),Ht*.03+1e-4,.10,1.);
 // the low sun through the tips and the seed heads
 glow(SUNC*vec3(1.,.78,.45)*(ss(.55,1.,yt)*.08+(fr?sh:0.)*.25)*BACK*cov(d),1.);}
// The rows from i0 to i1-1 that touch this pixel (at most six), back to front.
void smiRows(vec2 q,float t,int i0,int i1){int idx[6];int n=0;
 for(int i=i0;i<i1;i++)if(n<6&&smiRowHit(q,i)){idx[n]=i;n++;}
 for(int j=0;j<n;j++)smiRow(q,t,idx[j]);}
// The far ranges: jagged ridgelines (ridged noise), lower to the left; lit on the slopes that face the low sun, gullies down them.
float smiRn(float x){return 1.-abs(2.*vn(vec2(x,3.7))-1.);}
float smiPeaks(float x,float f){return .55*smiRn(x*f)+.30*smiRn(x*f*2.1+3.)+.15*smiRn(x*f*4.3+7.);}
void smiRange(vec2 q,float base,float amp,float f,float sd,vec3 col,vec3 lit,float haze,vec3 hz){
 float ax=amp*mix(.55,1.15,ss(-.9,.7,q.x));float y=base+ax*smiPeaks(q.x+sd,f);
 if(q.y>y+.01)return;
 float dn=sat((y-q.y)/max(ax,.01));
 // the faces under the crest, then spurs and gullies running down the slopes (sheared value noise): lit where they face the sun
 float sl=(smiPeaks(q.x+sd-.004,f)-smiPeaks(q.x+sd+.004,f))*ax/.008;
 float v=(y-q.y)/max(ax,.01);vec2 w=vec2((q.x+sd)*f*7.+v*1.3,v*1.6+sd);float e=.06;
 float sp=vn(w-vec2(e,0.))-vn(w+vec2(e,0.));sp+=.5*(vn(w*2.1+3.-vec2(e,0.))-vn(w*2.1+3.+vec2(e,0.)));
 float L=mix(sat(sl*1.4+.2),sat(.45+sp*2.6),ss(.05,.35,v));
 vec3 c=mix(col,lit,L*(1.-.35*dn));c*=1.-.10*ss(.4,1.,dn);
 c=mix(c,hz,haze*(.45+.55*dn));
 PIECE(q.y-y,c,K_FAR,q*vec2(3.,6.)+sd,vec2(1,0),.02,0.,1.);
 glow(SUNC*vec3(1.,.8,.6)*ss(.003,.0,y-q.y)*ss(.0,.4,sl)*.04*(1.-haze),1.);}
// Groves of coast live oak (broad round crowns) and juniper (small dark upright ones) on the plain in the middle distance, in the shade
// of their own crowns, their sunward edges lit.
void smiGroves(vec2 q){if(q.y>SM_HZ+.06||q.y<SM_HZ-.04)return;
 float d=1e5,cid=0.;float cb=floor(q.x/.10),nb=fract(q.x/.10)<.5?-1.:1.;
 for(int k=0;k<2;k++){float ci=cb+float(k)*nb;
  if(h11(ci*1.9+2.)<.38||abs(ci*.10+.05+.62)<.18)continue;
  for(int j=0;j<3;j++){float fj=float(j);float r=h11(ci*3.+fj);float jun=step(.66,h11(ci*5.+fj*3.));
   vec2 c=vec2((ci+.2+.6*h11(ci+fj*7.))*.10,SM_HZ-.008+.011*h11(ci*2.+fj));vec2 rr=jun>.5?vec2(.006,.013)*(.8+.5*r):vec2(.017,.011)*(.7+.7*r);
   float e=sdEll(q-c-vec2(0.,rr.y*.85),rr)+.0022*(vn(q*500.+fj)-.5);e=smin(e,sdEll(q-c-vec2(rr.x*.55,rr.y*1.05),rr*.62),.003);
   e=min(e,sdCap(q,c-vec2(0.,.003),c+vec2(0.,rr.y*.5),.0012,.0010));
   if(e<d){d=e;cid=jun;}}}
 float hzk=ss(SM_HZ+.012,SM_HZ-.03,q.y);   // nearer groves stand lower and show more colour
 vec3 c=mix(vec3(.21,.24,.15),vec3(.15,.19,.14),cid);c=mix(c,vec3(.74,.68,.62),.30-.18*hzk);
 PIECE(d,c,K_PLANT,q*40.,vec2(0,1),.004,0.,1.);
 glow(SUNC*vec3(1.,.75,.45)*ss(PX,-PX,d)*ss(-PX*2.,0.,d)*.18,1.);}
// Cattails at the edge of the seep: stems, brown heads, a few long leaves.
void smiCattails(vec2 q,float t){if(abs(q.y+.08)>.07)return;
 float ds=1e5,dh=1e5;
 for(int i=0;i<5;i++){float fi=float(i);float side=i<3?-1.:1.;vec2 b=vec2(-.62+side*(.25+.025*fi+.01*sin(fi*5.)),-.112+.012*sin(fi*3.));float hb=.07+.025*h11(fi+2.);
  float ln=-.10*side+.06*sin(t*.8+fi);ds=min(ds,smiBlade(q,b,hb,ln,.0016));ds=min(ds,smiBlade(q,b+vec2(.004,0.),hb*.8,ln+.25*side,.0022));
  vec2 tp=b+vec2(ln*hb*.75,hb*.75);vec2 dr=normalize(vec2(1.5*ln,1.));dh=min(dh,sdCap(q,tp,tp+dr*.016,.0034,.0034));}
 PIECE(min(ds,dh),dh<ds?vec3(.40,.26,.15):vec3(.55,.54,.33),K_PLANT,q*vec2(4.,30.),vec2(0,1),.002,.25,1.);}
void smiLand(vec2 q,float t){
 smiLightLand();
 vec2 sp=vec2(-.66,.27);float ds=length((q-sp)*vec2(.8,1.2));
 if(q.y>SM_HZ-.03){
  vec3 sk=mix(vec3(1.,.84,.60),vec3(.62,.69,.81),ss(SM_HZ,.55,q.y));sk=mix(sk,vec3(.44,.55,.75),ss(.5,1.3,q.y));
  sk=mix(sk,vec3(1.,.92,.74),exp(-ds*3.2)*.6);
  PIECE(-1.,sk,K_SKY,q+vec2(t*.002,0.),vec2(1,0),.1,0.,1.);
  // long clouds, lit warm from below
  float cl=fbm(vec2(q.x*1.2+t*.004,q.y*6.5)+3.)*ss(.30,.40,q.y)*ss(1.,.55,q.y);
  veil(mix(vec3(1.,.86,.68),vec3(.86,.80,.84),ss(.35,.7,q.y)),ss(.52,.76,cl)*.50,1.);
  veil(vec3(1.,.97,.86),ss(.036,.026,length(q-sp)),1.);veil(vec3(1.,.90,.70),exp(-ds*7.)*.28,1.);
  // the ranges, far to near (San Gabriel-like), and the warm haze of the basin over their feet
  if(q.y<.40){
   smiRange(q,.085,.17,1.6,0.,vec3(.48,.50,.64),vec3(.76,.66,.66),.30,vec3(.88,.80,.76));
   veil(vec3(.97,.87,.72),ss(.15,SM_HZ,q.y)*.20,1.);
   smiRange(q,.060,.090,3.2,4.,vec3(.38,.38,.48),vec3(.70,.56,.46),.22,vec3(.90,.80,.68));
   veil(vec3(.98,.86,.66),ss(.10,SM_HZ,q.y)*.24,1.);
   smiRange(q,.040,.036,7.,9.,vec3(.34,.33,.26),vec3(.64,.50,.34),.14,vec3(.92,.80,.62));
   veil(vec3(.99,.88,.66),ss(.055,SM_HZ,q.y)*.22,1.);}
 }
 // the plain: golden grass far away, warmer and richer nearer; groves in the middle distance
 vec3 g=smiGround(q);SMI_G=g;
 float dk=sdEll(q-vec2(.06,-.235),vec2(.72,.065));g*=1.+.08*ss(.0,-.03,dk)*ss(.2,-.4,q.x);g*=1.-.06*ss(.0,-.03,dk)*ss(.1,.6,q.x);
 PIECE(q.y-SM_HZ,g,K_GRASS,smiGU(q),vec2(0,1),.05,0.,1.);
 smiGroves(q);
 // the tar seep: black asphalt under a glossy skin, a dark mirror of the warm sky with the low sun in it as a soft streak; a muddy
 // tar-stained rim; a few oak leaves and twigs lying on it; cattails at its edge. Calm.
 {vec2 pc=vec2(-.62,-.105);vec2 pq=q-pc;
  if(abs(pq.x)<.36&&abs(pq.y)<.07){
   float ns=vn(vec2(q.x*30.,q.y*70.));
   float dp=sdEll(pq,vec2(.26,.026))+.005*(vn(vec2(q.x*28.,1.))-.5);
   float dr=sdEll(pq,vec2(.295,.034))+.012*(ns-.5);
   shadow(ss(.010,-.004,dr)*.30,vec3(.62,.52,.42),1.);
   veil(vec3(.30,.24,.17)*(.8+.4*ns),ss(.003,-.003,dr)*ss(-.010,.002,dp)*.55,1.);
   // the mirror: the sky and the far range upside down, about half as bright (a black gloss seen at a grazing angle)
   float fr=ss(-.026,.026,pq.y);float wob=.0010*sin(q.x*40.+t*.35)+.0006*sin(q.x*73.-t*.25);
   float ry=SM_HZ+(SM_HZ-q.y)*1.6+wob*20.;vec3 sky=mix(vec3(.98,.85,.66),vec3(.62,.70,.84),ss(SM_HZ,.45,ry));
   float yr=.085+.17*mix(.55,1.15,ss(-.9,.7,q.x))*smiPeaks(q.x,1.6);sky=mix(sky,vec3(.70,.66,.72),ss(.004,-.004,ry-yr));
   vec3 rc=mix(vec3(.030,.026,.022),sky,.14+.30*fr);
   float sx=q.x+.66+wob*4.;rc+=vec3(1.,.86,.62)*exp(-sx*sx/.0010)*.30*(.88+.12*sin(t*.5+q.x*25.));
   rc+=vec3(.90,.92,1.)*.03*ss(.45,.9,vn(vec2(q.x*9.+t*.03,pq.y*90.)));
   PIECE(dp,rc,K_WATER,q*vec2(1.,6.),vec2(1,0),.006,.08,1.);
   glow(vec3(1.,.88,.66)*ss(.0012,.0,abs(dp+.001))*ss(.0,.02,pq.y)*.10,1.);
   // leaves and twigs on the tar
   float lv=1e5;for(int i=0;i<3;i++){float fi=float(i);vec2 c=vec2(-.70+fi*.085+.02*sin(fi*4.),-.109+.010*sin(fi*2.3));vec2 lq=rot(.6+fi*1.9)*(q-c);
    lv=min(lv,max(sdEll(lq,vec2(.010,.0035)),-sdEll(lq-vec2(.0,.004),vec2(.002,.0015))));}
   float tw=min(sdSeg(q,vec2(-.58,-.100),vec2(-.535,-.106)),sdSeg(q,vec2(-.66,-.116),vec2(-.632,-.112)))-.0008;
   veil(vec3(.38,.27,.15),cov(lv)*ss(.0,-.004,dp),1.);veil(vec3(.28,.21,.14),cov(tw)*ss(.0,-.004,dp),1.);
   smiCattails(q,t);
  }}
 // the grass of the plain, back to front, as far as the mother
 smiRows(q,t,2,11);}
// Butterflies (pale sulphurs and a dusky orange one) seen from the side: wings up, beating and gliding; low contrast; slow wandering
// paths away from the animals' faces. Only the nearest is drawn.
void smiButterflies(vec2 q,float t){
 vec2 c=vec2(9.);float fi=0.,best=1e5;
 for(int i=0;i<3;i++){float f=float(i);
  vec2 ci=i==0?vec2(-.66+.10*sin(t*.31),-.03+.03*sin(t*.53)):i==1?vec2(.62+.09*sin(t*.27+1.),.0+.035*sin(t*.47+2.)):vec2(.08+.18*sin(t*.21+3.),-.42+.03*sin(t*.61));
  ci.y+=.008*sin(t*2.1+f);float dd=length(q-ci);if(dd<best){best=dd;c=ci;fi=f;}}
 if(best>.03)return;
 float beat=.5+.5*sin(t*8.+fi*2.);float o=mix(beat,.25,ss(.2,.8,.5+.5*sin(t*.9+fi*1.7)));
 vec2 l=(q-c)/.013;float dir=sin(t*.31+fi*2.)>0.?1.:-1.;l.x*=dir;
 float fw=sdEll(rot(-.35)*(l-vec2(.10,.15+.55*o)),vec2(.42,.22+.30*o));float hw=sdEll(rot(.25)*(l-vec2(-.22,.10+.35*o)),vec2(.30,.16+.22*o));
 float db=sdCap(l,vec2(-.40,0.),vec2(.42,.06),.07,.05);float dw=min(fw,hw);
 vec3 wc=fi>1.5?vec3(.84,.60,.34):vec3(.95,.90,.64);wc*=.9+.15*ss(-.2,.6,l.y);
 PIECE(min(dw,db)*.013,db<dw+.02?vec3(.28,.22,.16):wc,K_MEMBRANE,l*.3,vec2(1,0),.003,.12,1.);}
// Pollen and gnats floating in the low sun: warm specks drifting slowly, glowing against the light.
void smiMotes(vec2 q,float t){vec2 w=q*9.+vec2(t*.05,-t*.02+.03*sin(t*.4+q.x*3.));vec2 ci=floor(w),f=fract(w)-.5-(h22(ci)-.5)*.6;
 float on=step(.82,h21(ci+3.));float a=on*ss(.06,.02,length(f))*(.35+.25*sin(t*.8+h21(ci)*6.));glow(vec3(1.,.86,.58)*a*.30*ss(.4,-.1,q.y)*(.6+.8*exp(-length(q-vec2(-.66,.27))*1.5)),1.);}

// ---- The scene ----
void smiScene(vec2 q,float t,float grow){
 smiLand(q,t);
 SmiM a=smiMom(t);
 smiCastM(q,a);
 smiLightAnimals();
 contact(q,SM_P+vec2(.0,.004),.40,.30);
 smiMother(q,t,a,grow);
 // the grazed grass between the mother and her cubs
 smiLightLand();smiRows(q,t,11,13);smiLightAnimals();
 vec2 pB=smiPosB(t),pA=smiPosA(t);float sA=smiScaleA(t);SmiC cB=smiCubB(t,a),cA=smiCubA(t,a,pA,sA);
 shadow(ss(1.,.2,length((q-vec2(pB.x+.045,SM_GB-.018))/vec2(.13,.022))),vec3(.55,.52,.66),1.);contact(q,vec2(pB.x,SM_GB+.002),.09,.4);
 smiCub(q,pB,SM_C,cB,t,1.3,grow,true);
 smiMotherOver(q,a,true);
 shadow(ss(1.,.2,length((q-vec2(pA.x+.045,pA.y-.018*sA/SM_C))/(vec2(.13,.022)*sA/SM_C))),vec3(.55,.52,.66),1.);contact(q,vec2(pA.x,pA.y+.002),.09*sA/SM_C,.45);
 smiCub(q,pA,sA,cA,t+.7,4.1,grow,false);
 smiLightLand();
 smiRows(q,t,13,18);
 smiButterflies(q,t);
 smiMotes(q,t);
}
void smiFossil(vec2 q){SmiM a=smiMom(0.);vec2 m=(q-SM_P)/SM_S;
 if(m.x>-1.1&&m.x<1.3&&m.y>-.1&&m.y<1.)PIECE(smiBonesM(m,a.hp,a.pit)*SM_S,vec3(.70,.60,.46),K_FOSSIL,m*.5,vec2(1,0),.012,.6,0.);
 vec2 lb=(q-vec2(-.44,SM_GB))/SM_C,la=(q-vec2(-.15,SM_GA))/SM_C;
 float dc=min(abs(lb.x)<.4&&lb.y<.4?smiBonesC(lb):1e3,abs(la.x)<.4&&la.y<.4?smiBonesC(la):1e3)*SM_C;
 PIECE(dc,vec3(.70,.60,.46),K_FOSSIL,q*1.5,vec2(1,0),.005,.6,0.);}

const vec2 WIN_C=vec2(.06,-.06);
void fossil(vec2 q){smiFossil(q);}
void life(vec2 q,float t){smiScene(q,t,GROW);}

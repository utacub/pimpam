// ---- Scene 11 (El pou del temps, CE37): a herd of Parasaurolophus walkeri in the swamps of the Dinosaur Park Formation (Alberta,
// about 76.5–75 million years ago), under a soft overcast sky: still water with reflections, horsetails, ferns, swamp conifers in mist.
// The caller stands on the muddy near bank (left, facing right); four more stand in the water at different depths.
// Times on the scene clock (uTau): 3.5–4.4 the caller steps forward in the mud; 4.8–6.3 (the key) it calls: its head lifts, the crest
// tilts back, its chest and throat swell (a low horn note); answers at 7.2, 8.6 and 10.0, each from a smaller, paler animal farther
// back; 11.0–11.6 the one drinking lifts its head. Rig frame (metres): facing -x, the ground at y 0. Scale: .094 screen units per
// metre for the caller (about 9.5 m long).
// the animals (back to front): position, scale, facing (-1: right), paleness
const vec4 PA_A[5]=vec4[](vec4(.24,-.020,.027,1.),vec4(.70,-.075,.036,1.),vec4(-.58,-.080,.036,-1.),vec4(.46,-.165,.050,1.),vec4(-.20,-.37,.094,-1.));
const float PA_HAZE[5]=float[](.45,.34,.32,.18,0.);
const vec2 PA_S=vec2(-1.35,1.70),PA_H=vec2(1.05,2.25),PA_N0=vec2(-1.55,2.20);
const float PA_HS=1.30;   // the head's scale
// each animal's own colours (back, belly): 0 grey, 1 red-brown, 2 ochre-brown, 3 grey-green, 4 (the caller) warm olive-brown
const vec3 PA_BACK[5]=vec3[](vec3(.38,.38,.33),vec3(.42,.28,.20),vec3(.42,.34,.20),vec3(.28,.33,.25),vec3(.30,.28,.17));
const vec3 PA_BELLY[5]=vec3[](vec3(.74,.73,.66),vec3(.78,.65,.52),vec3(.78,.69,.52),vec3(.68,.71,.58),vec3(.74,.67,.50));
const vec4 PA_CONIF[3]=vec4[](vec4(-.80,.015,.52,.09),vec4(.84,.012,.58,.10),vec4(-.18,.02,.40,.07));
const vec3 PA_HORSE[5]=vec3[](vec3(-.80,-.30,.17),vec3(.86,-.33,.15),vec3(-.05,.012,.05),vec3(.50,.010,.045),vec3(-.95,-.62,.24));
const vec4 PA_FFERN[5]=vec4[](vec4(-.62,-.50,.16,6.),vec4(.66,-.52,.20,6.),vec4(.10,-.58,.14,5.),vec4(-.45,-1.05,.30,6.),vec4(.35,-1.15,.32,6.));
struct PaPose{float pitch,throat,chest,tail,blink,fl,ff,hl,hf;vec2 C,Nc;};

float paBend(vec2 p,vec2 a,vec2 b,vec2 c,float ra,float rc,out vec2 uv){vec2 m=.25*a+.5*b+.25*c;float rm=mix(ra,rc,.5);
 float u1=segU(p,a,m),u2=segU(p,m,c);vec2 p1=mix(a,m,u1),p2=mix(m,c,u2);float r1=mix(ra,rm,u1),r2=mix(rm,rc,u2);
 float d1=length(p-p1)-r1,d2=length(p-p2)-r2;bool f=d1<d2;vec2 o=p-(f?p1:p2);vec2 dir=f?m-a:c-m;
 uv=vec2(f?u1*.5:.5+u2*.5,(dir.x*o.y-dir.y*o.x)/length(dir)/max(f?r1:r2,1e-3));return smin(d1,d2,rm*.25);}
// The hide (0.44.2, redesigned from scratch). Earlier hides (a grid of scales, 0.31–0.36.3; value-noise mottle, 0.41) were textures
// finer than the animal: on screen they read as dirt, smears or moiré. A hadrosaur's tubercles are millimetres to a few centimetres
// across (Bell, 2012), far below a pixel here, so the hide is painted as a naturalist would from a distance: large, clear shapes only.
// Three tones (pale belly, mid flank, dark back) with a soft but readable boundary; dark saddle bars across the back and tail, each
// with its own place, width and reach (hashed per animal, so nothing repeats); a sparse row of pale flecks along the flank; and a
// soft light of the body's own roundness (0.44.6: nothing added to common.glsl, whose every addition is compiled into all twenty scenes;
// a new surface kind there in 0.44.2 is the likely cause of scenes slow to prepare on Windows). Every feature is at least several pixels wide and fades as it gets smaller.
// ax: metres along the body axis (neck to tail tip); vy: -1 at the belly .. +1 on the spine; ppm: pixels per metre.
vec2 paBars(float ax,float vy,float ppm,float seed){
 const float SP=.66;float c=floor(ax/SP),aa=1.2/max(ppm,1.),bar=0.,fl=0.;
 for(int k=-1;k<=1;k++){float ci=c+float(k);float r1=h11(ci*1.31+seed),r2=h11(ci*2.77+seed*1.9),r3=h11(ci*4.13+seed*.7);
  float xc=(ci+.5)*SP+(r1-.5)*.26;
  float lim=.62-.80*r2;   // how far down the flank this bar reaches
  float w=(.10+.07*r3)*ss(lim-.05,lim+.45,vy);   // wider on the spine, tapering to a point down the side
  float wob=.045*(vn(vec2(ax*2.6,vy*3.1)+seed+ci)-.5);   // an organic edge (broad wobble, never finer than the bar)
  bar=max(bar,ss(w+aa,w-aa,abs(ax-xc+wob))*sat(w/aa)*step(.10,r1));
  // a pale fleck on the flank between two bars, not in every gap
  vec2 fc=vec2((ci+.5)*SP+SP*.5+(r3-.5)*.20,-.10+.30*r1);float fr=.050+.030*r2;
  fl=max(fl,step(.38,r3)*ss(fr+aa,fr-aa,length(vec2(ax,vy*.85)-fc)));}
 return vec2(bar*ss(9.,16.,SP*ppm),fl*ss(4.,7.,.08*ppm));}
// How a rounded form under the skin (a thigh, a shoulder) turns to the light: a smooth low dome over the ellipse ax (in the frame M,
// v from its centre), against a flat surface. Its slope fades to nothing at the rim, so no line and no terminator edge shows.
float paDome(vec2 v,mat2 M,vec2 ax,float fl){vec2 l=M*v/ax;float r2=dot(l,l);if(r2>1.)return 0.;
 vec2 g=(-1.2*(1.-r2)*l/ax)*M;g.x*=fl;return lambert(normalize(vec3(-g,1.)))-lambert(vec3(0.,0.,1.));}
// ---- The head, in its frame h (metres, forward -x, the head joint at 0): the long skull, the snout widening into the broad, flat duck
// bill, the lower jaw, the long tubular crest sweeping back from the forehead, the throat that swells for the call ----
void paHead(vec2 h,float throat,out float dFace,out float dCr,out float dTh,out float dBill,out vec2 cuv){
 float sk=sdEll(h-vec2(-.40,.02),vec2(.46,.22));float sn=sdCap(h,vec2(-.55,-.03),vec2(-.88,-.10),.17,.12);
 dBill=sdEll(rot(.12)*(h-vec2(-1.00,-.135)),vec2(.17,.105));float jaw=sdCap(h,vec2(-.12,-.17),vec2(-.92,-.215),.12,.07);
 dFace=smin(smin(sk,sn,.10),smin(dBill,jaw,.08),.20);   // (a soft join of the jaw: a sharp one left a ridge inside that caught the light as a jagged line)
 dCr=paBend(h,vec2(-.40,.14),vec2(.30,.52),vec2(1.05,.58),.10,.08,cuv);
 dTh=sdEll(h-vec2(.02,-.28-.06*throat),vec2(.32+.04*throat,.12+.08*throat));}
// The bones: skull with its hollow crest, the neck, back and tail with their tall spines and chevrons, ribs, the pelvis, the limbs.
float paBones(vec2 m,float sk,vec2 S,vec2 E,vec2 W,vec2 Ff,vec2 H,vec2 K,vec2 A,vec2 Fh,vec2 C,vec2 Nc,float tw){
 float d=sk;vec2 uv;
 d=min(d,paBend(m,C+vec2(.15,-.05),Nc,PA_N0+vec2(.1,.05),.07,.08,uv));
 d=min(d,paBend(m,PA_N0+vec2(.1,.05),vec2(-.2,2.55),vec2(1.0,2.62),.09,.09,uv));
 d=min(d,paBend(m,vec2(1.0,2.62),vec2(3.9,2.56+tw*.4),vec2(6.7,2.30+tw),.09,.03,uv));
 for(int i=0;i<10;i++){float x=-1.2+float(i)*.30;float y=x<1.?mix(2.35,2.62,ss(-1.2,1.,x)):2.62-(x-1.)*.03;d=min(d,sdSeg(m,vec2(x,y),vec2(x+.05,y+.36))-.05);}
 for(int i=0;i<8;i++){float x=-1.25+float(i)*.27;float y=mix(2.30,2.58,ss(-1.2,1.,x));vec2 a=vec2(x,y-.05),b=vec2(x-.25,y-.75),c=vec2(x-.05,1.30);
  d=min(d,min(sdSeg(m,a,b),sdSeg(m,b,c))-.045);}
 for(int i=0;i<7;i++){float fi=float(i);float x=2.1+fi*.42;float y=mix(2.55,2.42,fi/7.)+tw*fi/9.;d=min(d,sdSeg(m,vec2(x,y-.06),vec2(x+.10,y-.55+fi*.05))-.045);}
 d=min(d,sdCap(m,vec2(-.85,2.30),S+vec2(.05,.05),.12,.09));
 d=min(d,sdEll(m-vec2(1.05,2.42),vec2(.80,.17)));d=min(d,sdCap(m,vec2(.85,2.25),vec2(.15,1.75),.06,.08));d=min(d,sdCap(m,vec2(1.25,2.20),vec2(1.95,1.55),.07,.05));
 d=min(d,sdCap(m,H,K,.13,.10));d=min(d,sdCap(m,K,A,.10,.08));d=min(d,sdCap(m,A,Fh+vec2(-.10,.10),.07,.06));d=min(d,sdCap(m,Fh+vec2(-.10,.08),Fh+vec2(-.48,.04),.05,.035));
 d=min(d,sdCap(m,S,E,.08,.07));d=min(d,sdCap(m,E,W,.06,.05));d=min(d,sdCap(m,W,Ff+vec2(-.10,.05),.05,.04));
 return d;}

// ---- One Parasaurolophus (i: its place in PA_A), with its own colours; hz its paleness with distance (aerial perspective) ----
void paSaur(vec2 q,int i,float t,PaPose p,float grow){
 vec4 A4=PA_A[i];vec2 pos=A4.xy;float s=A4.z,flip=A4.w,hz=PA_HAZE[i],seed=float(i)*1.7,wet=i<4&&uDecor<1.5?.40:0.;
 vec2 m=(q-pos)/s;m.x*=flip;
 if(m.x<-4.5||m.x>7.0||m.y<-.3||m.y>4.9)return;
 float br=sin(t*1.0+seed);
 vec2 S=PA_S,H=PA_H,C=p.C+vec2(0.,.01*br);
 vec2 h=rot(p.pitch)*(m-C)/PA_HS;
 // the legs (IK, the feet planted); the far ones a step apart, a little higher on the screen
 vec2 Ff=vec2(PA_S.x-.20-p.ff,p.fl),Fh=vec2(PA_H.x-.10-p.hf,p.hl);
 vec2 W=Ff+vec2(.08,.42),A=Fh+vec2(.16,.50);
 vec2 E=knee(S,W,.70,.62,1.),K=knee(H,A,1.05,.95,-1.);
 vec2 dy=vec2(0.,.10);vec2 Ff2=vec2(PA_S.x+.25,0.)+dy,Fh2=vec2(PA_H.x+.35,0.)+dy;vec2 W2=Ff2+vec2(.08,.42),A2=Fh2+vec2(.16,.50);
 vec2 S2=S+vec2(.12,.08),H2=H+vec2(.10,.06);vec2 E2=knee(S2,W2,.70,.62,1.),K2=knee(H2,A2,1.05,.95,-1.);
 float G=grow/s;bool needB=G<1.1;float inPX=4.*PX/s;
 // ---- distances ----
 float dFar=smin(sdCap(m,S2,E2,.19,.12),sdCap(m,E2,W2,.11,.08),.05);dFar=smin(dFar,sdCap(m,W2,Ff2+vec2(-.10,.07),.08,.07),.04);
 {float e=smin(sdCap(m,H2+vec2(-.05,-.15),K2,.56,.27),sdCap(m,K2,A2,.29,.17),.08);e=smin(e,sdCap(m,A2,Fh2+vec2(-.10,.12),.16,.13),.05);
  e=smin(e,sdEll(m-Fh2-vec2(-.20,.075),vec2(.28,.08)),.05);dFar=min(dFar,e);}
 // the body: deepest at the hips; the thick, arched neck; the deep tail held level (stiffened by ossified tendons)
 float dHp=sdEll(m-vec2(1.0,2.22),vec2(1.10,1.0)),dTo=sdEll(rot(-.06)*(m-vec2(-.15,2.06)),vec2(1.75,.80+.015*br));
 float dCh=sdEll(m-vec2(-1.35,1.86),vec2(.60,.62)*(1.+.07*p.chest));
 float dBd=smin(smin(dTo,dHp,.35),dCh,.30);
 vec2 nuv;float dN=paBend(m,PA_N0,p.Nc,C+vec2(.10,-.04),.60,.34,nuv);
 float tw=p.tail+.06*sin(t*.7+seed);
 vec2 T1=vec2(3.3,2.40+tw*.3),T2=vec2(5.0,2.36+tw*.6),T3=vec2(6.7,2.30+tw);
 float dT=smin(smin(sdCap(m,vec2(1.7,2.40),T1,.80,.58),sdCap(m,T1,T2,.58,.36),.10),sdCap(m,T2,T3,.36,.07),.10);
 // the near limbs: the big thigh, the shin with its calf, the steep metatarsus, the three-toed hoofed foot; the slender arm, its long
 // hand ending in a hoof
 vec2 hk=normalize(K-H),ka=normalize(A-K);
 float dThg=sdEll(mat2(hk.y,hk.x,-hk.x,hk.y)*(m-mix(H,K,.45)),vec2(.62,.86));
 float dLg=smin(sdCap(m,K,A,.34,.19),sdEll(mat2(ka.y,ka.x,-ka.x,ka.y)*(m-mix(K,A,.32)-vec2(.10,0.)),vec2(.22,.42)),.06);
 dLg=smin(dLg,sdCap(m,A,Fh+vec2(-.10,.12),.18,.14),.06);dLg=smin(dLg,sdEll(m-Fh-vec2(-.22,.075),vec2(.30,.085)),.05);
 float dAr=smin(smin(sdCap(m,S+vec2(.05,.10),E,.27,.16),sdCap(m,E,W,.15,.11),.05),sdCap(m,W,Ff+vec2(-.10,.06),.10,.085),.03);
 dAr=smin(dAr,sdEll(m-Ff-vec2(-.12,.06),vec2(.12,.06)),.03);
 float dFace=9.,dCr=9.,dTh=9.,dBill=9.;vec2 cuv=vec2(0.);
 bool nearH=h.x>-1.35&&h.x<1.30&&h.y>-.80&&h.y<.85;
 if(nearH){paHead(h,p.throat,dFace,dCr,dTh,dBill,cuv);dFace*=PA_HS;dCr*=PA_HS;dTh*=PA_HS;dBill*=PA_HS;}
 // the whole near side as one smooth body, so its dark contour is the outer silhouette only
 float dCore=smin(smin(dBd,dN,.22),dT,.30);float d=smin(dCore,dThg,.15);d=smin(d,dLg,.08);d=smin(d,dAr,.06);float dL=smin(d,dTh,.45);dL=smin(dL,dFace,.35);   // (the same body with wide joins at the throat and head, only for the direction of its light: the sharp creases there turned their light in steps of two pixels)
 d=smin(d,dTh,.20);d=smin(d,dFace,.16);
 float dB=-1.;
 if(needB&&min(min(d,dFar),dCr)>.05)needB=false;
 if(needB){float sk=nearH?max(min(dFace,dCr),-sdEll(h-vec2(-.28,.05),vec2(.07,.07))*PA_HS):9.;dB=paBones(m,sk,S,E,W,Ff,H,K,A,Fh,C,p.Nc,tw);}
 if(needB){dFar=max(dFar,dB-G);d=max(d,dB-G);dCr=max(dCr,dB-G);}
 // standing in the water: what is below its surface is hidden (the water draws the ripples and the reflection)
 if(wet>0.){float wl=wet-m.y;dFar=max(dFar,wl);d=max(d,wl);if(needB)dB=max(dB,wl);}
 // ---- painting, back to front ----
 // the air between us and the far ones: their colours and their light fade into the mist (warmer towards the veiled sun)
 vec3 mist=mix(vec3(.70,.74,.76),vec3(.86,.82,.74),ss(-.4,.7,q.x));
 vec3 sc0=SUNC,ac0=AMBC;SUNC*=1.-.85*hz;AMBC=mix(AMBC,vec3(1.),.85*hz);
 if(needB&&grow<.5)PIECE(dB*s,mix(vec3(.86,.82,.72),mist,hz*.5),K_BONE,m*.4,vec2(1,0),.06*s,.55,0.);
 vec3 back=PA_BACK[i],belly=PA_BELLY[i];
 // the hide's mottling (once per pixel); on the head it follows the head's own frame, so it does not slide when the head lifts
 float lb=ss(1.45,.95,m.y)*step(m.x,2.4),nk=ss(.15,-.15,dN-dBd);
 float ppm=s/PX;
// (0.44.7) The skin's own fine texture (K_SKIN) used to be turned off by giving it coordinates at ×900, so that its features were far
// finer than a pixel and faded out. On an NVIDIA card under Windows that fade did not happen: the hash of such large numbers broke
// into lines along the axes over the whole animal (Marc's screen, 0.31–0.44.6; the emulated cards here never showed it). Now the
// pieces take K_SMOOTH with constant coordinates: no texture at all, and a soft satin sheen of the skin.
 if(dFar<inPX&&d>-2.*PX/s)PIECE(dFar*s,mix(mix(belly,back,.6)*.50,mist,hz),K_SMOOTH,vec2(0.),vec2(1,0),.08*s,1.-hz*.6,0.);
 if(d<inPX){
  // where this pixel lies on the body: ax along the axis (the neck continues it forwards), vy across it (-1 belly, +1 spine)
  float tk=ss(1.3,2.3,m.x);
  float cyT=m.x<3.3?mix(2.40,T1.y,(m.x-1.7)/1.6):m.x<5.?mix(T1.y,T2.y,(m.x-3.3)/1.7):mix(T2.y,T3.y,(m.x-5.)/1.7);
  float rT0=m.x<3.3?mix(.80,.58,(m.x-1.7)/1.6):m.x<5.?mix(.58,.36,(m.x-3.3)/1.7):mix(.36,.07,(m.x-5.)/1.7);
  float vyB=(m.y-mix(2.04,2.24,ss(-.6,1.2,m.x)))/mix(.86,1.0,ss(-.6,1.2,m.x));
  // on the neck: smooth coordinates from the straight line base→head (the bent tube's own uv jumps where its two halves meet)
  vec2 nd=C-PA_N0;float nl=length(nd);nd/=nl;float tn=sat(dot(m-PA_N0,nd)/nl);
  float vyN=dot(m-PA_N0,vec2(nd.y,-nd.x))/mix(.62,.36,tn);
  float nw=ss(.0,-.35,dN-dBd)*ss(.10,-.10,dN);   // a wide, smooth blend from the shoulders into the neck
  float vy=mix(vyB,(m.y-cyT)/max(rT0,.07),tk);vy=mix(vy,vyN,nw);vy=clamp(vy,-1.2,1.2);
  float ax=mix(m.x,PA_N0.x-tn*nl,nw);
  // three tones: the pale belly, the mid flank, the dark back (and a darker line along the spine)
  vec3 flank=mix(belly,back,.58);
  vec3 alb=mix(belly,flank,ss(-.62,-.30,vy));alb=mix(alb,back,ss(.10,.48,vy));alb*=1.-.10*ss(.72,.95,vy);
  // the pattern: saddle bars across the back and tail, pale flecks on the flank (not on the legs nor the head)
  vec2 pb=paBars(ax,vy,ppm,seed);float onB=(1.-lb)*ss(-3.75,-3.35,ax);
  alb=mix(alb,alb*.66,pb.x*onB*.85);
  alb=mix(alb,mix(belly,flank,.35)*1.04,pb.y*onB*.55*(1.-nw));
  alb=mix(alb,mix(belly,back,.55)*.92,lb);alb*=mix(.80,1.,ss(.0,.8,m.y));       // the legs mid-toned, darker towards the feet
  // the head: a darker crown, the jaw and throat paler; the throat's skin stretched paler when it swells
  float hd=ss(.10,-.10,dFace-min(dN,dBd));
  alb=mix(alb,mix(belly,back,ss(-.12,.10,h.y)),hd*.75);
  alb=mix(alb,belly*1.06,ss(.04,-.06,dTh)*p.throat*.6);
  // the duck bill: dark keratin, edged behind by paler, fleshy skin
  alb=mix(alb,vec3(.33,.29,.25),ss(.0,-.03,dBill)*hd);
  alb=mix(alb,vec3(.62,.52,.46),ss(.05,.025,dBill)*ss(-.01,.01,dBill)*step(dFace,-.01)*hd*.75);
  // two soft folds of skin at the base of the neck: a shaded crease with a lit lip in front of it
  float fx=tn*nl-.30-.04*sin(vyN*2.5);float fm=ss(.95,.45,abs(vyN))*nw*ss(25.,45.,ppm);
  alb*=1.-.13*ss(.07,.0,abs(fx))*fm+.06*ss(.05,.0,abs(fx+.07))*fm;
  // the forms under the skin: the trunk's round barrel, the thigh and the shoulder turn to the light
  alb*=1.+.5*paDome(m-vec2(.15,2.15),mat2(1.),vec2(2.5,1.10),flip)+.55*paDome(m-mix(H,K,.45),mat2(hk.y,hk.x,-hk.x,hk.y),vec2(.62,.86),flip)+.40*paDome(m-mix(S,E,.30)-vec2(.0,.06),mat2(1.),vec2(.34,.46),flip);
  // light on the silhouette: a warm rim along the top, a brighter edge towards the sun
  vec2 gD=vec2(dFdx(d),dFdy(d));gD/=max(length(gD),1e-6);
  float up=ss(1.5,2.0,m.y);   // (not on the thin legs, where the screen gradient is too coarse)
  // (narrower on the slender head, so it never reaches the crease where the jaw meets the snout, whose gradient turns abruptly)
  float rw=1.-hd;
  alb=mix(alb,alb*1.45+vec3(.05,.04,.02),ss(-.22*rw,.0,d)*sat(gD.y*1.3-.2)*(1.-hz)*.5*up);
  alb=mix(alb,alb*1.3+.03,ss(-.30*rw,0.,d)*sat(dot(gD,normalize(SUNL.xy)))*.30*up);
  // roundness: about the local half-thickness everywhere (a larger one would split a thin part along its axis): the body, the neck,
  // the head, the tapering tail, the thigh, the shin, the slender arm
  float rT=rT0;
  float Rb=mix(.62,.9*mix(.60,.34,tn),nk);Rb=mix(Rb,.16,max(hd,ss(.30,.0,min(dTh,dFace))));if(m.x>1.7)Rb=min(Rb,max(.85*rT,.05));
  Rb=mix(Rb,mix(mix(.09,.13,ss(.03,-.05,dLg)),.30,ss(.05,-.15,dThg)),ss(.05,-.10,min(min(dLg,dAr),dThg)-dCore));
  {float ds=d*s,dl=dL*s;piece(ds,mix(vec2(dFdx(ds),dFdy(ds)),vec2(dFdx(dl),dFdy(dl)),ss(.45,.10,min(dTh,dFace))),mix(alb,mist,hz),K_SMOOTH,vec2(0.),vec2(1,0),Rb*s,1.-hz*.6,0.);}
  // the line of the beak, the nostril
  if(nearH&&hz<.6)shadow((ss(.025,.0,abs(h.y+.165+.03*(h.x+.6)))*step(h.x,-.25)*step(-1.12,h.x)+ss(.02,-.01,sdEll(h-vec2(-.84,-.04),vec2(.09,.03))))*.5*step(d,0.),vec3(.28,.25,.22),0.);}
 // the crest: a curved tube of slightly lighter, coloured skin (a low-saturated rust-ochre, paler near its end), with a rim of light
 if(dCr<inPX){vec3 cc=mix(vec3(.56,.42,.31),vec3(.68,.58,.44),ss(.66,.76,cuv.x)*ss(.93,.83,cuv.x));
  cc*=(1.-.08*ss(.3,.8,.5+.5*sin(cuv.x*38.))*ss(.12,.06,fwidth(cuv.x*38.)))*mix(.80,1.06,ss(-.7,.5,cuv.y));   // its underside in its own shade
  vec2 gC=vec2(dFdx(dCr),dFdy(dCr));gC/=max(length(gC),1e-6);
  cc=mix(cc,cc*1.5+vec3(.06,.04,.02),ss(-.07,.0,dCr)*sat(dot(gC,normalize(SUNL.xy+vec2(0.,.6))))*.6*(1.-hz));
  PIECE(dCr*s,mix(cc,mist,hz),K_SMOOTH,vec2(0.),vec2(1,0),.10*PA_HS*s,1.-hz*.6,0.);}
 if(grow>.3&&nearH&&hz<.5){vec2 ecL=C+rot(-p.pitch)*vec2(-.28,.05)*PA_HS;
  eyeA(q,pos+vec2(ecL.x*flip,ecL.y)*s,.06*PA_HS*s,vec3(.36,.24,.12),PA_BACK[i],p.blink,0.);}
 SUNC=sc0;AMBC=ac0;
}

// A simple silhouette of one animal (for its reflection in the water and its shadow on the mud).
float paSil(vec2 m,PaPose p){vec2 uv;float d=smin(sdEll(m-vec2(-.15,2.06),vec2(1.75,.80)),sdEll(m-vec2(1.0,2.22),vec2(1.10,1.0)),.3);
 d=min(d,paBend(m,PA_N0,p.Nc,p.C,.50,.30,uv));d=min(d,paBend(m,vec2(1.7,2.40),vec2(4.2,2.38),vec2(6.7,2.30+p.tail),.80,.08,uv));
 vec2 h=rot(p.pitch)*(m-p.C)/PA_HS;d=min(d,min(sdEll(h-vec2(-.55,-.04),vec2(.58,.22)),sdCap(h,vec2(-.40,.14),vec2(1.05,.58),.10,.08))*PA_HS);
 d=min(d,min(sdCap(m,PA_H,vec2(1.15,0.),.32,.20),sdCap(m,PA_S,vec2(-1.55,0.),.12,.08)));return d;}

// ---- The swamp (decor) ----
float paFernD(vec2 q,vec2 b,float ang,float len,float bend,out vec2 fu){vec2 l=rot(ang)*(q-b);float x=l.y/len;float y=l.x-bend*x*x*len;fu=vec2(x,y/len);
 float w=.30*len*pow(sin(PI*sat(x*.92+.04)),.7)*(1.-.55*x);float pr=fract(x*16.);float pin=abs(pr-.5)-.30*sqrt(sat(1.-abs(y)/max(w,1e-4)));
 pin=mix(-1.,pin,ss(6.,10.,len/16./PX));   // far away the leaflets close into a solid frond (gaps finer than a pixel or two flicker)
 float d=max(abs(y)-w,pin*len/16.);d=min(d,abs(y)-.0012*len/.1);return max(d,max(-l.y,l.y-len));}
void paFerns(vec2 q,vec2 base,float sc,float t,float n,float seed,vec3 col,float hz){
 if(abs(q.x-base.x)>sc*1.3||q.y<base.y-.01||q.y>base.y+sc*1.15)return;
 float d=9.;vec2 u=vec2(0.);float ci=0.;
 for(int i=0;i<7;i++){if(float(i)>=n)break;float fi=float(i);
  float ang=(-1.15+2.3*fi/(n-1.))+.05*sin(t*.9+fi+seed)+.02*sin(t*2.3+fi*2.);float len=sc*(.75+.35*h11(fi+seed));vec2 fu;float e=paFernD(q,base,ang,len,.35*sign(ang+.01),fu);
  if(e<d){d=e;u=fu;ci=fi;}}
 if(d>PX*4.)return;
 vec3 c=col*(.82+.34*h11(ci*3.+seed))*(.85+.25*u.x);
 PIECE(d,mix(c,vec3(.72,.76,.76),hz),K_PLANT,u*vec2(1.,6.),vec2(0,1),.004,.5,1.);}
// Horsetails (Equisetum): a clump of jointed stems with dark rings at the nodes, whorls of thin branches, small cones at the tips.
void paHorse(vec2 q,vec2 b,float h,float t,float seed,float haze){
 if(abs(q.x-b.x)>h*.40||q.y<b.y-.005||q.y>b.y+h*1.05)return;
 float ds=9.,us=0.,hs=0.,si=0.;
 for(int i=0;i<8;i++){float fi=float(i);float x0=b.x+(h11(fi+seed)-.5)*h*.55;float hi=h*(.50+.50*h11(fi*3.+seed));float lean=(h11(fi*5.+seed)-.5)*.30+.03*sin(t*1.1+fi+seed);
  vec2 top=vec2(x0+lean*hi,b.y+hi);float d=sdCap(q,vec2(x0,b.y),top,h*.017,h*.010);
  // whorls of fine branches at the upper nodes
  float u=segU(q,vec2(x0,b.y),top);float nd=fract(u*hi/(h*.08));float wh=abs(q.x-mix(x0,top.x,u))-h*.07*(1.-u)*ss(.25,.5,u);
  d=min(d,max(wh,abs(nd-.5)*h*.08-.0015*h/.1));
  if(d<ds){ds=d;us=u;hs=hi;si=fi;}}
 if(ds>PX*4.)return;
 float node=ss(.10,.0,abs(fract(us*hs/(h*.08))-.5)-.40);
 vec3 c=mix(vec3(.36,.46,.22)*(.85+.3*h11(si+seed)),vec3(.16,.14,.10),node*.7);
 PIECE(ds,mix(c,vec3(.72,.76,.76),haze),K_PLANT,vec2(us*20.,0.),vec2(0,1),h*.01,.45,1.);}
// A swamp conifer (like Glyptostrobus and the swamp cypresses): a straight trunk, drooping sprays; misty.
void paConifer(vec2 q,vec2 b,float h,float w,float seed,float t,float haze){
 if(abs(q.x-b.x)>w*1.4||q.y<b.y-.01||q.y>b.y+h*1.03)return;
 float y=(q.y-b.y)/h;float x=q.x-b.x;float sg=x<0.?-1.:1.;
 float tr=abs(x-.004*h*y*sin(t*.4+seed))-h*.011*(1.3-y);tr=max(tr,q.y-b.y-h*.97);
 float d=9.,ft=0.;
 for(int j=0;j<3;j++){float ti=floor(y*13.+(sg>0.?.5:0.))+float(j)-1.;float yc=(ti+(sg>0.?.5:0.))/13.;if(yc<.12||yc>.97)continue;
  float hh=h11(ti*2.+sg+seed*7.);float wi=w*(pow(sat(1.-yc),.7)*(.55+.6*hh)+.12);float sw=.006*h*yc*sin(t*.7+ti*1.3+seed+sg);
  vec2 a=vec2(0.,yc*h),tip=vec2(sg*wi+sw,yc*h-(.06+.05*hh)*h*(1.-.4*yc));vec2 mid=mix(a,tip,.5)+vec2(0.,.02*h);
  vec2 p=vec2(x,y*h);float th=.050*h*(1.-.45*yc);vec2 uv;
  float e=paBend(p,a,mid,tip,th,.012*h,uv)-.012*h*(vn(vec2(x*120./h,ti+sg))-.4)-.006*h*(vn(vec2(x*400./h,y*300.))-.5);
  if(e<d){d=e;ft=(p.y-mix(a.y,tip.y,sat(abs(x)/wi)))/th;}}
 d=min(d,max(abs(x)-h*.012,y-1.02));
 float dd=min(d,tr);if(dd>PX*4.)return;
 vec3 c=vec3(.18,.24,.16)*(.85+.3*vn(vec2(x*160./h,y*90.)));c*=mix(.70,1.10,ss(-.8,.8,ft));c=mix(c,vec3(.26,.20,.16),step(tr,d));
 c=mix(c,vec3(.70,.74,.75),haze*(1.-.25*y));
 PIECE(dd,c,K_PLANT,vec2(x*80.,y*30.),vec2(0,-1),.003,.10,1.);}
float paForestTop(float qx,float base,float hgt,float fr,float seed){
 float x=qx*fr+seed,ci=floor(x),fx=fract(x);float top=-1.;
 for(int j=-1;j<=1;j++){float cj=ci+float(j);float hh=h11(cj+seed);float cx=float(j)+.5+(h11(cj*1.7)-.5)*.5;
  float tall=hgt*(.55+.6*hh);float con=step(.40,h11(cj+9.));
  float yy=con>.5?base+tall-abs(fx-cx)/fr*4.0*(1.+.25*sin((fx-cx)*60.)):base+tall*.75*sqrt(max(0.,1.-pow((fx-cx)/.8,2.)))+.010*vn(vec2(qx*60.,cj));top=max(top,yy);}
 return top+.004*(vn(vec2(qx*120.,1.))-.5);}
// the near edge of the water (in front of it the muddy bank)
float paEdge(float x){return -.245+.020*sin(x*3.1+.6)+.010*sin(x*7.3+2.)+.006*(vn(vec2(x*20.,4.))-.5);}
void paBackdrop(vec2 q,float t,PaPose pp[5]){
 // the sky (a soft overcast), the far forest wall and the nearer one in the mist, the far shore: one piece, its colour layered
 float topF=paForestTop(q.x,.012,.20,10.,3.),topN=paForestTop(q.x,.010,.12,16.,11.);
 if(q.y>-.01){
  vec3 sk=mix(vec3(.82,.83,.80),vec3(.58,.64,.70),ss(.05,.75,q.y));sk=mix(sk,vec3(.50,.56,.64),ss(.7,1.3,q.y));
  float cl=fbm2(vec2(q.x*1.5+t*.003,q.y*5.));sk=mix(sk,vec3(.90,.89,.85),ss(.45,.75,cl)*ss(.08,.25,q.y)*.55);sk*=1.-.06*ss(.5,.8,fbm2(q*vec2(2.,6.)+5.))*ss(.15,.4,q.y);
  // the low sun veiled by the mist: a warm glow and a pale disc
  float sg=exp(-length((q-vec2(.50,.30))*vec2(1.,1.4))*4.5);sk=mix(sk,vec3(1.,.95,.84),sg*.55);sk+=vec3(.08,.07,.04)*ss(.075,.035,length(q-vec2(.50,.30)));
  float cF=ss(PX,-PX,q.y-topF),cN=ss(PX,-PX,q.y-topN);
  sk=mix(sk,mix(vec3(.62,.67,.68),vec3(.74,.77,.77),ss(.05,.20,q.y)),cF);
  sk=mix(sk,vec3(.44,.50,.46)*(1.-.10*ss(.4,.6,vn(vec2(q.x*80.,2.)))*ss(.04,.0,q.y-topN+.04)),cN);
  sk=mix(sk,vec3(.92,.88,.80),sg*.22*(cF+cN)*.5);   // the mist over the forest lit by the veiled sun
  sk=mix(sk,vec3(.36,.40,.30),ss(.020,.010,q.y));   // the far shore, low and dark
  PIECE(-1.,sk,K_SKY,q*2.+vec2(t*.004,0.),vec2(1,0),.1,0.,1.);
  veil(vec3(.80,.83,.83),ss(.10,.0,q.y)*.30,1.);   // mist lying on the water's far side
  for(int i=0;i<3;i++){vec4 cf=PA_CONIF[i];paConifer(q,cf.xy,cf.z,cf.w,float(i)+1.,t,.42+.10*float(i==2));}}
 // the water: the sky and the forest mirrored, darker towards us, ripples; the reflections of the animals standing in it
 float ye=paEdge(q.x);
 if(q.y<.02&&q.y>ye-.01){
  float wy=.010-(q.y-.010);vec2 rq=vec2(q.x+.0025*sin(q.y*180.+t*1.2)*ss(.0,-.10,q.y),wy);
  float rF=paForestTop(rq.x,.012,.20,10.,3.),rN=paForestTop(rq.x,.010,.12,16.,11.);
  vec3 wc=mix(vec3(.74,.77,.78),vec3(.56,.62,.68),ss(.0,.5,rq.y));
  wc=mix(wc,vec3(.60,.64,.64),ss(.004,-.004,rq.y-rF));wc=mix(wc,vec3(.40,.45,.40),ss(.004,-.004,rq.y-rN));
  wc=mix(wc,vec3(.98,.92,.82),exp(-length((rq-vec2(.50,.30))*vec2(1.,1.4))*4.5)*.45);   // the veiled sun mirrored
  wc*=vec3(.92,.98,1.06);
  // the conifers mirrored, as soft dark streaks
  for(int i=0;i<3;i++){vec4 cf=PA_CONIF[i];float dx=abs(rq.x-cf.x);wc=mix(wc,vec3(.42,.47,.42),ss(cf.w*.55,cf.w*.15,dx+.25*cf.w*max(0.,(rq.y-cf.y)/cf.z-.2))*step(rq.y,cf.y+cf.z)*.55);}
  // the animals in the water, mirrored about their feet
  for(int i=0;i<4;i++){vec4 a=PA_A[i];vec2 m=vec2(q.x-a.x,2.*(a.y+.40*a.z)-q.y-a.y)/a.z;m.x*=a.w;m.x+=.03*sin(q.y*300.+t*1.5)*ss(.0,.5,m.y);
   if(m.y<-.2||m.y>4.6||abs(m.x-1.)>5.8)continue;float sd=paSil(m,pp[i]);wc=mix(wc,mix(vec3(.38,.38,.34),vec3(.62,.66,.68),PA_HAZE[i]),ss(.06,-.06,sd)*.75);}
  wc*=mix(1.,.72,ss(-.05,-.24,q.y));
  float rip=vn(vec2(q.x*30.,q.y*420.+t*.6));wc*=.97+.06*rip*ss(.0,-.15,q.y);
  // rings on the water where the legs stand and where the drinker's chin touches
  for(int i=0;i<4;i++){vec4 a=PA_A[i];vec2 l=(q-a.xy)/vec2(a.z*4.,a.z*.9);float ph=t*.5+float(i)*.3;float rr=length(l);
   wc*=1.+.06*sin(rr*14.-t*3.)*ss(1.6,.6,rr)*ss(.2,.5,rr);}
  {vec2 l=(q-vec2(-.455,-.078))/vec2(.05,.010);float u=fract(t*.32);float rr=length(l);wc*=1.+.10*ss(.15,.0,abs(rr-u*2.2))*(1.-u)*ss(1.5,1.0,pp[2].C.y-.2*u);}
  float dw=q.y-ye;
  PIECE(max(-dw,q.y-.010),wc,K_WATER,q*vec2(1.,10.)+vec2(t*.01,0.),vec2(1,0),.003,0.,1.);
  veil(vec3(.80,.83,.83),ss(-.12,.02,q.y)*.25*ss(-.05,.0,-dw),1.);}
 // the muddy near bank: wet and dark at the water's edge, drier below; the three-toed prints of the herd
 float dg=q.y-ye;
 if(dg<.01){vec3 ga=mix(vec3(.30,.28,.24),vec3(.46,.42,.34),ss(-.02,-.25,dg));ga=mix(ga,vec3(.40,.37,.30),ss(-.3,-.9,q.y));
  float mo=fbm2(q*vec2(3.,8.)+2.);ga*=.90+.18*mo;ga=mix(ga,vec3(.32,.36,.22),ss(.6,.78,mo)*.4*ss(-.06,-.2,dg));
  float sh=ss(.0,-.05,dg)*ss(-.2,-.05,dg);ga=mix(ga,ga*1.25+.04,sh*.35*ss(.5,.7,vn(q*vec2(20.,60.)))); // a wet sheen
  // footprints: three-toed, in a trail across the bank
  for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(-.62+fi*.17+.03*sin(fi*2.),-.30-.035*mod(fi,2.)-.04*fi*fi/25.);vec2 l=(q-c)/vec2(.040,.013);
   float pr=min(min(length(l-vec2(.0,.0))-.45,sdCap(l,vec2(0.),vec2(-.9,.25),.18,.12)),min(sdCap(l,vec2(0.),vec2(-1.,-.0),.18,.12),sdCap(l,vec2(0.),vec2(-.9,-.25),.18,.12)));
   ga*=1.-.30*ss(.12,-.05,pr)*ss(-.6,-.1,pr+.3);}
  PIECE(dg,ga,K_MUD,q*vec2(2.,6.),vec2(1,0),.2,0.,1.);}
 // horsetails and ferns along the shores
 for(int i=0;i<5;i++){vec3 c=PA_HORSE[i];paHorse(q,c.xy,c.z,t,float(i)*3.+1.,c.y>-.05?.45:0.);}
 for(int r=0;r<2;r++){float fr=float(r);float y0=.006-fr*.006;float sc=.020+fr*.006;float cw=sc*2.4;float x=q.x/cw+fr*3.1;float ci=floor(x);
  if(h11(ci+fr*5.)<.45)continue;vec2 b=vec2((ci+.5+(h11(ci*2.)-.5)*.4-fr*3.1)*cw,y0+(h11(ci+7.)-.5)*.008);
  paFerns(q,b,sc*1.5,t,5.,ci,vec3(.30,.40,.20),.45);}
}

// ---- The poses through the story ----
// lift: the head up on a straighter neck; tilt: the crest back (the snout up); sw: the chest and throat swell
PaPose paPose(int i,float t){
 PaPose p;float fi=float(i);
 float call=0.,lift=0.,drink=0.;
 // the answers: 7.2 the nearest of the herd, 8.6 the next, 10.0 the farthest
 float t0=i==3?7.2:(i==1?8.6:(i==0?10.0:-9.));
 if(i==4){call=ss(4.75,5.05,t)*(1.-ss(6.05,6.40,t));lift=ss(4.35,4.85,t)*(1.-ss(6.2,7.0,t));}
 else if(t0>0.){call=ss(t0-.05,t0+.20,t)*(1.-ss(t0+.75,t0+1.0,t));lift=ss(t0-.45,t0+.05,t)*(1.-ss(t0+.9,t0+1.5,t));}
 if(i==2)drink=1.-ss(11.0,11.6,t)*(1.-ss(12.2,13.0,t));
 // the others turn up their heads a little to listen while the caller calls
 float listen=i==4?ss(7.0,7.6,t)*(1.-ss(11.,12.,t)):ss(4.9,5.6,t)*(1.-.65*ss(6.6,7.4,t))*(1.-ss(11.,12.5,t));
 float bob=.04*sin(t*.8+fi*1.7);
 vec2 Crest=vec2(-2.55,2.95+bob),Cup=vec2(-2.22,3.70),Cdr=vec2(-2.85,.80);
 vec2 Nrest=vec2(-1.85,2.95),Nup=vec2(-1.65,3.30),Ndr=vec2(-2.30,2.40);
 p.C=mix(mix(Crest,Cup,max(lift,.35*listen)),Cdr,drink);p.Nc=mix(mix(Nrest,Nup,max(lift,.35*listen)),Ndr,drink);
 p.pitch=mix(mix(.30+.05*sin(t*.6+fi),-.45,call),.75,drink)-.12*listen*(1.-call);
 float pulse=.85+.15*sin(t*TAU*2.2);
 p.throat=call*pulse*(i==4?1.:.75);p.chest=call*(i==4?1.:.6);
 p.tail=.06*sin(t*.5+fi*2.)-.10*call;
 p.blink=blinkAt(t,fi*.23);
 // the caller steps forward in the mud before it calls: the near fore foot (lands 3.9), then the near hind foot (lands 4.35)
 p.fl=0.;p.ff=0.;p.hl=0.;p.hf=0.;
 if(i==4){p.fl=.20*sin(PI*sat((t-3.5)/.40));p.ff=.30*ss(3.5,3.9,t);p.hl=.24*sin(PI*sat((t-3.9)/.45));p.hf=.35*ss(3.9,4.35,t);}
 return p;}

void paScene(vec2 q,float t,float grow){
 // a soft, low sun veiled by the mist, on the right and a little in front: warm lit planes, cool shadows
 SUNL=normalize(vec3(.62,.40,.42));SUNC=vec3(1.30,1.08,.84);AMBC=vec3(.46,.52,.62);BACK=.25;
 PaPose pp[5];for(int i=0;i<5;i++)pp[i]=paPose(i,t);
 paBackdrop(q,t,pp);
 // the caller's shadow on the mud, cast to the left and a little back: its silhouette, squashed onto the ground; contact shadows
 {vec4 a=PA_A[4];vec2 l=(q-a.xy)/a.z;l.x*=a.w;PaPose c=pp[4];
  if(l.y>-.4&&l.y<1.3&&l.x>-8.&&l.x<10.){float hg=max(l.y,0.)/.17;float sd=paSil(vec2(l.x+.95*hg*a.w,hg),c);
   shadow(ss(.35,-.35,sd)*ss(-.30,.05,l.y)*.55,vec3(.58,.62,.76),0.);}
  contact(q,a.xy+vec2((PA_S.x-.30-c.ff)*a.w*a.z,.0),.035,.55);contact(q,a.xy+vec2((PA_H.x-.32-c.hf)*a.w*a.z,.0),.05,.60);
  contact(q,a.xy+vec2(.02,.0),.25,.30);}
 // the animals, back to front: at each pixel at most the two nearest in depth whose box holds it (one call: the body is compiled once)
 // each animal always in the same pass (so its screen derivatives stay whole): the first pass the three farthest (their boxes do not
 // overlap), the second the nearest answerer and the caller
 int sel[2];sel[0]=-1;sel[1]=-1;
 for(int i=0;i<5;i++){vec4 a=PA_A[i];vec2 m=(q-a.xy)/a.z;m.x*=a.w;if(m.x>-4.5&&m.x<7.0&&m.y>-.3&&m.y<4.9){if(i<3)sel[0]=i;else sel[1]=i;}}
 for(int k=0;k<2;k++){int i=sel[k];if(i<0)continue;paSaur(q,i,t,pp[i],grow);}
 for(int i=0;i<5;i++){vec4 f=PA_FFERN[i];paFerns(q,f.xy,f.z,t,f.w,float(i)*4.+3.,vec3(.26,.38,.18),0.);}
}
void paFossil(vec2 q){
 vec4 a=PA_A[4];float s=a.z;vec2 m=(q-a.xy)/s;m.x*=a.w;if(m.x<-4.7||m.x>7.0||m.y<-.3||m.y>4.9)return;
 PaPose p=paPose(4,0.);vec2 S=PA_S,H=PA_H,C=p.C;vec2 Ff=vec2(PA_S.x-.20,0.),Fh=vec2(PA_H.x-.10,0.);vec2 W=Ff+vec2(.08,.42),A=Fh+vec2(.16,.50);
 vec2 E=knee(S,W,.70,.62,1.),K=knee(H,A,1.05,.95,-1.);vec2 h=rot(p.pitch)*(m-C)/PA_HS;
 float sk=9.;if(h.x>-1.35&&h.x<1.30&&h.y>-.80&&h.y<.85){float f,c,th,bl;vec2 uv;paHead(h,0.,f,c,th,bl,uv);sk=max(min(f,c),-sdEll(h-vec2(-.28,.05),vec2(.07,.07)))*PA_HS;}
 float d=paBones(m,sk,S,E,W,Ff,H,K,A,Fh,C,p.Nc,p.tail);PIECE(d*s,vec3(.66,.60,.50),K_FOSSIL,m*.4,vec2(1,0),.05*s,.6,0.);}

const vec2 WIN_C=vec2(-.18,-.12);
float paWin(vec2 q){return length((q-WIN_C)*vec2(1.,1.15))-RFULL*ss(0.,.62,uLife);}
void fossil(vec2 q){if(uLife>.001&&paWin(q)<-.09)return;paFossil(q);}
void life(vec2 q,float t){if(uLife<.999&&paWin(q)>.09)return;paScene(q,t,GROW);}

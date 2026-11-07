// ---- Scene 20: the blue whale (Southern Ocean, the low light of the late afternoon from above) ----
// 0–2 s travelling through empty water; 2–5 the head comes in from the right, close (the eye); 5–7.5 the camera pulls back to the
// whole body and the krill cloud ahead; 7.5–8.4 the whale speeds up; 8.4–10.4 the mouth opens wide and the throat fills like a balloon
// (Goldbogen et al., 2011); 10.4–11.6 the mouth closes on the full pouch; 11.6–16 the pouch empties slowly through the baleen while
// the whale glides out on the left.
const float L20=2.5;            // 25 m
const float Y20=-1.0;           // depth of the whale's axis (10 m)
// speed keys (world units per second), integrated exactly (piecewise linear speed)
float headX(float T){const int N=7;float tk[7]=float[7](2.,7.5,8.4,9.6,11.5,14.5,16.);float vk[7]=float[7](.30,.30,.62,.10,.04,.50,.70);
 float x=1.25;if(T<2.)return x+.30*(2.-T);
 for(int i=0;i<N-1;i++){float a=tk[i],b=tk[i+1];if(T<=a)break;float u=min(T,b)-a;float va=vk[i],vb=vk[i+1];x-=u*(va+(vb-va)*u/(2.*(b-a)));}
 if(T>16.)x-=.70*(T-16.);return x;}
// after the gulp it tips its head down and glides away into the deep blue
float diveP(float T){return .42*ss(12.,14.5,T);}
float jawA(float T){return 1.0*ss(8.3,9.3,T)*(1.-ss(10.3,11.6,T));}
float pouch(float T){return .16*ss(8.6,10.3,T)*(1.-.80*ss(11.6,15.5,T));}
// The blue whale. Profiles above and below the axis, units of the body length.
float TOPB[11]=float[11](.009,.030,.049,.058,.061,.060,.055,.046,.033,.019,.010);
float BOTB[11]=float[11](.014,.037,.058,.066,.067,.062,.052,.040,.028,.017,.010);
const float HINGE=.215;
float mouthV(float s){return (-.007+.017*ss(0.,HINGE,s))*L20;}  // the mouth line, rising a little to the corner
float jawDep(float s){return (.016+.012*ss(.0,.09,s)-.010*ss(.14,HINGE,s))*L20;}  // how deep the lower jaw is below it
vec2 bz3W(vec2 a,vec2 b,vec2 c,vec2 d,float t){vec2 ab=mix(a,b,t),bc=mix(b,c,t),cd=mix(c,d,t);return mix(mix(ab,bc,t),mix(bc,cd,t),t);}
// a point of the pouch's outer curve (a cubic from the chin to the navel), never above the belly of the shut body
vec2 pouchPt(vec2 a,vec2 b,vec2 c,vec2 d,float t){vec2 p=bz3W(a,b,c,d,t);float sc=clamp(dot(p-SP[0],-bodyDir(.05))/BL,0.,1.);
 vec2 B=bodyPt(sc,-(prof(sc,BOTB)+.003)*BL);vec2 dn=-bodyNrm(sc);float dc=dot(p-B,dn);return p+dn*(smax(dc,0.,.012*BL)-dc);}
float topP(float s){return prof(s,TOPB)+.0035*exp(-pow((s-.155)/.018,2.));}  // with the low splash guard of the blowholes
float profD(vec2 f,float sgn){float e=.012;float t,dt;
 if(sgn>0.){t=topP(f.x)*BL;dt=(topP(f.x+e)-topP(f.x-e))/(2.*e);}else{t=prof(f.x,BOTB)*BL;dt=(prof(f.x+e,BOTB)-prof(f.x-e,BOTB))/(2.*e);}
 return (sgn*f.y-t)/sqrt(1.+dt*dt);}
// distance to the body with the mouth closed, frame f
float bodyClosed(vec2 f){float d=max(profD(f,1.),profD(f,-1.));d=smax(d,-f.x*BL,.016*BL);d=max(d,(f.x-1.02)*BL);
 vec2 df=vec2((f.x-.775)*BL,f.y-prof(.775,TOPB)*BL);float fin=sdCap(df,vec2(-.014*BL,-.004*BL),vec2(.011*BL,.008*BL),.0055*BL,.0012*BL);
 return smin(d,fin,.007*BL);}
vec3 skinBlue(vec2 f,float u){ // mottled blue-grey with fine paler mottles, elongated along the body; paler and a little yellowish below
 vec2 q=vec2(f.x*BL*9.,f.y*20.);q+=.5*vec2(fbm2(q*.4),fbm2(q*.4+4.));float m=fbm(q*.8);
 float sp=ss(.55,.68,fbm(q*1.6+2.));float sp2=ss(.62,.72,vn(q*4.+9.));
 vec3 top=vec3(.24,.32,.41),pale=vec3(.48,.56,.62),belly=vec3(.60,.60,.55);
 vec3 c=top*(.86+.28*m);c=mix(c,pale*(.92+.16*m),sp*.40+sp2*.22);c=mix(c,belly*(.88+.24*m),ss(.10,-.60,u));return c;}
void scene(vec2 w,float T){
 // ---- water: blue, brighter above; the low sun throws long slanting shafts; marine snow ----
 SUND=normalize(vec2(-.62,1.));SUNC=vec3(1.0,.80,.58);WAT0=vec3(.030,.225,.35);
 float z=-w.y;vec3 wc=waterCol(z)*(.55+.95*ss(-.75,.62,P.y));
 wc+=WAT0*vec3(.9,.95,1.)*.40*ss(.0,.7,P.y)*ss(-.9,.3,P.x+P.y*.6); // the glow of the sky through the surface, up and to the left
 float sh=shafts(w*vec2(.8,1.),T);wc+=lightAt(z)*vec3(.70,.70,.60)*.45*sh*ss(-.8,.6,P.y);
 wc+=lightAt(z+.2)*.30*snow(P,T);
 BG=wc;
 // ---- krill ahead of the whale: a pink cloud with drifting specks; what the mouth sweeps goes into the pouch ----
 float hx=headX(T);float gape=ss(8.5,9.3,T);
 vec2 kc=vec2(-1.55,Y20-.06);vec2 kq=(w-kc)*vec2(1.,1.6);float kn=fbm(w*1.6+vec2(T*.04,0.));float kd=length(kq)-.60+.36*(kn-.5);
 float kden=ss(.16,-.24,kd)*(.45+.55*fbm(w*3.6-vec2(0.,T*.06)));
 float sweep=gape*ss(hx+.10,hx+.45,w.x)*ss(.40,.18,abs(w.y-(Y20-.14)));kden*=1.-.95*sweep;
 if(kden>.002){
  vec3 haze=fogW(vec3(.95,.36,.30)*(lightAt(z)*1.3+vec3(.30,.07,.06)),.45+VH*.10,z);
  vec2 q=w*30.+vec2(T*.45,T*.12);vec2 i=floor(q),fq=fract(q);vec2 o=h22(i);float r=.09+.07*h21(i+4.);
  float sp=ss(max(r,.6*WPX*30.),r*.25,length(fq-.2-.6*o))*step(.40,h21(i+9.));
  vec3 spc=fogW(vec3(1.,.60,.52)*(lightAt(z)*2.6+.45),.35+VH*.10,z);
  putF(haze,kden*.62);putF(spc,sp*kden);
 }
 // ---- the whale ----
 float ph=TAU*.22*T;float amp=.15*(1.-.75*ss(8.4,9.,T)*(1.-ss(11.5,13.,T)));
 float hyD=Y20+.02*sin(T*.4)-.50*max(headX(12.)-hx,0.)*ss(12.,14.5,T);
 spine(vec2(hx,hyD),PI-.03*sin(T*.3)+diveP(T),L20,-1.,amp,ph,-.10*ss(12.,13.5,T)*(1.-ss(14.,15.5,T)));
 vec3 f=bodyF(w);
 float jaw=jawA(T),pch=pouch(T);
 vec2 dr=bodyDir(.05);vec2 nr=BFLIP*vec2(-dr.y,dr.x);  // ahead, and towards the back, at the head
 float open=ss(.0,.05,jaw);
 vec2 H=bodyPt(HINGE,mouthV(HINGE));                    // the corner of the mouth: the lower jaw turns about it
 mat2 JO=rot(BFLIP*jaw),JC=rot(-BFLIP*jaw);             // closed to open, and back
 float dC=bodyClosed(f.xy);
 float nearH=length(w-H);
 // the rostrum: the body without what lies below the mouth line in front of the corner, once the mouth opens
 float upper=dC;if(open>0.)upper=max(dC,-max(f.y-mouthV(f.x),(f.x-HINGE)*BL));
 // the lower jaw: the band under the mouth line in front of the corner (the mandible and its lip), turned down about the corner;
 // fl is the frame where the pixel would be with the mouth shut
 vec3 fl=f;float dJ=1e5,dM=1e5,dG=0.;
 if(open>0.&&nearH<.34*BL){fl=bodyF(H+JC*(w-H));
  float jt=mouthV(fl.x),jb=jt-jawDep(fl.x);
  dJ=max(max(fl.y-jt,jb-fl.y),profD(fl.xy,-1.));dJ=smax(dJ,-fl.x*BL,.012*BL);dJ=smax(dJ,(fl.x-HINGE)*BL,.010*BL);
  // the open mouth: below the rostrum, above the jaw, behind the gape between their tips
  vec2 R=bodyPt(.012,mouthV(.012)),Jt=H+JO*(R-H);vec2 g=Jt-R;vec2 gn=normalize(vec2(g.y,-g.x));if(dot(H-R,gn)>0.)gn=-gn;
  dG=dot(w-R,gn);dM=max(max(f.y-mouthV(f.x),jt-fl.y),dG);dM=max(dM,(f.x-HINGE-.02)*BL);}
 // the pouch: the throat swollen with water, from the chin to the navel; its outer curve is a cubic from the chin Jc to the navel N,
 // leaving the chin downwards and meeting the belly along it
 vec2 N=bodyPt(.56,-prof(.56,BOTB)*BL);
 vec2 Jc=H+JO*(bodyPt(.025,mouthV(.025)-.9*jawDep(.025))-H);
 float bul=(.62*pch+.012*open)*BL;
 vec2 C1=Jc+normalize(-dr-nr*(.30+5.*pch))*(.08*BL+.55*bul),C2=N+dr*.20*BL-nr*bul*1.05;
 float dP=1e5;vec2 V[16];
 if((pch>.001||open>0.)&&spineNear(w)<.45*BL){V[0]=H;for(int i=0;i<=13;i++)V[1+i]=pouchPt(Jc,C1,C2,N,float(i)/13.);V[15]=bodyPt(.36,0.);dP=sdPoly16(w,V);}
 // the nearest point of the outer curve: the roundness of the pouch and its grooves
 float dOut=1e5,tOut=0.;vec2 cOut=w;
 if(dP<.08*BL){for(int i=1;i<=13;i++){vec2 o=V[i],nn=V[i+1];float u0=segU(w,o,nn);vec2 q=mix(o,nn,u0);float e=length(w-q);
   if(e<dOut){dOut=e;tOut=(float(i-1)+u0)/13.;cOut=q;}}}
 // the flukes, seen nearly edge-on, tilting with the stroke
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);float tilt=sin(ph-TAU*.85+1.2);
 vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dFk=flukeD(tq,.12*BL,.08+.22*abs(tilt),0.);
 // the near flipper: a slender blade, a little paler below
 vec2 fa=bodyPt(.275,-prof(.275,BOTB)*BL*.45);vec2 dd=bodyDir(.275);vec2 fn=BFLIP*vec2(-dd.y,dd.x);
 float fang=.52+.08*sin(T*.7);vec2 ftip=fa-dd*(.088*BL)*cos(fang)-fn*(.088*BL)*sin(fang);
 vec2 fmid=mix(fa,ftip,.45)-dd*.006*BL;float dFl=min(sdCap(w,fa,fmid,.0085*BL,.0062*BL),sdCap(w,fmid,ftip,.0062*BL,.0012*BL));
 float dB=min(min(upper,dFk),min(dP,dJ));
 float dist=.20+VH*.40+3.2*ss(12.8,16.,T)*ss(12.8,16.,T);   // how far from the camera (the haze); it goes off into it at the end
 float a=covW(min(dB,dM)),af=covW(dFl);
 if(a>.001||af>.001){
  float zz=max(-w.y,0.);
  vec3 E=lightAt(zz)*1.50;vec3 amb=waterCol(zz)*1.0+vec3(.010,.016,.024);
  vec2 nd=BFLIP*vec2(-bodyDir(f.x).y,bodyDir(f.x).x);
  float tt=topP(f.x)*BL,bb=prof(f.x,BOTB)*BL;float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);
  vec3 n=normalize(vec3(nd*u*.92,sqrt(max(1.-u*u*.85,0.))));
  vec3 alb=skinBlue(f.xy,u);
  // throat grooves along the closed throat, from the chin to the navel
  float gz=-f.y-prof(f.x,BOTB)*BL*.10;float gl=abs(fract(gz/(.0072*BL))-.5)*2.;
  float groove=ss(.30,.0,gl)*ss(.02,.06,f.x)*ss(.60,.50,f.x)*ss(.0,.015*BL,gz)*(1.-open);
  alb=mix(alb,alb*.62,groove*.55);
  float cs=caust(w*2.2+vec2(T*.03,0.),T*.6)*sat(u*1.2+.1)*.55;
  vec3 c=lit(alb,n,E*(1.+cs),amb,.30);
  // the eye: small, dark, with a soft fold above it; just above and behind the corner of the mouth
  vec2 ep=bodyPt(.226,.0165*BL);float de=length((w-ep)*vec2(1.,1.25));
  c=mix(c,c*.72,ss(.010*BL,.006*BL,de));c=mix(c,vec3(.025,.025,.03),ss(.0042*BL,.0030*BL,de));
  c+=E*.16*ss(.0012*BL,.0004*BL,length(w-ep-vec2(.0012,.0012)*BL));
  if(open<=0.){float ml=abs(f.y-mouthV(f.x));c*=1.-.55*ss(.0020*BL,.0007*BL,ml)*ss(HINGE+.01,HINGE-.01,f.x)*ss(-.01,.01,f.x);}
  // the pouch, and the throat that swells with it (below the jaw and the line from the corner to the navel): pale, rounded
  // towards its outer curve, the grooves running from the chin to the navel and pulled apart as it fills
  float vTop=f.x<HINGE?mouthV(f.x)-jawDep(f.x):mix(mouthV(HINGE)-jawDep(HINGE),-prof(.56,BOTB)*BL,sat((f.x-HINGE)/(.56-HINGE)));
  float pK=max(ss(.0,.25,jaw),ss(.0,.03,pch));   // how much the throat has become the pouch
  float wIn=covW(dP)*pK*(upper>0.?1.:ss(.006*BL,-.012*BL,f.y-vTop)*ss(.62,.53,f.x));
  if(wIn>.001){
   float sJ=dot(Jc-bodyPt(0.,0.),-dr)/BL;float thc=(.022*BL+bul*.80)*pow(sin(PI*clamp((f.x-sJ)/(.56-sJ),.02,.98)),.6)+.010*BL;
   float kr=dOut/thc,e=1.-sat(kr);vec2 o=(cOut-w)/max(dOut,1e-6);   // outwards
   vec3 pn=normalize(vec3(o*e*.95,sqrt(max(1.-e*e*.9,0.))));float fill=ss(.0,.10,pch);
   if(dC<0.)pn=normalize(mix(n,pn,.35+.65*fill));   // inside the shut body's outline: its own roundness until the pouch fills
   float gq=(acos(e)+max(kr-1.,0.))*(8.-2.*sat(pch/.16))/(PI*.5);float gw=fwidth(gq);
   float gd=min(fract(gq),1.-fract(gq));float gl=ss(.14+gw,.02,gd)*ss(.55,.25,gw)*ss(.0,.10,kr);
   vec3 palb=skinBlue(f.xy,mix(max(u,-1.),-1.,fill))*vec3(.90,.92,.94);
   palb=mix(palb,palb*vec3(.70,.68,.72),gl*.55);
   vec3 pc=lit(palb,pn,E*(1.+cs*.6),amb*1.15,.15);
   pc+=rimL(pn,E,.10);
   c=mix(c,pc,wIn);u=mix(u,-1.,wIn);}
  // the open mouth: the black baleen hanging from the rostrum, frayed at its edge; behind it the dark of the mouth, lighter
  // towards the gape where the water comes in; the far lip a faint line above the near one
  if(dM<WPX){float hang=mouthV(f.x)-f.y;float sx=sat(f.x/HINGE);float jh=fl.y-mouthV(fl.x);
   float bLen=(.010+.020*pow(sin(PI*min(sx*1.1,1.)),.7))*BL*ss(.0,.5,jaw);
   float fr=bLen*(1.+.12*(vn(vec2(f.x*BL*70.,1.))-.5));
   float inB=ss(fr+.002*BL,fr-.002*BL,hang);
   float pq=(f.x*BL+hang*.30)/(.0030*BL);float pw=fwidth(pq);float pd=min(fract(pq),1.-fract(pq));
   float plate=ss(.20+pw,.0,pd)*ss(.45,.15,pw);
   vec3 bal=vec3(.030,.030,.034)*(1.+.7*plate)+vec3(.09,.085,.08)*ss(fr-.008*BL,fr,hang)*inB;
   // the inside: the far wall of the swollen mouth, pale in the shade; darker deep in and under the baleen, lighter towards the
   // gape where the water comes in and down towards the jaw
   float deep=ss(.0,.16*BL,nearH),front=ss(-.09*BL,.0,dG),low=ss(.07*BL,.0,jh);
   vec3 cav=vec3(.40,.31,.32)*(lightAt(zz)*(.16+.38*front+.22*low)+vec3(.010,.014,.020));
   cav*=(.40+.60*ss(.0,.035*BL,hang-bLen))*(.45+.55*deep);
   float far=ss(.0030*BL,.0010*BL,abs(jh-.014*BL))*ss(.0,.04,fl.x)*ss(HINGE,HINGE-.05,fl.x);
   cav=mix(cav,cav*.55,far*.6);
   vec3 m=mix(cav,bal*(lightAt(zz)*1.1+.25),inB);
   float am=covW(dM)*ss(-.002*BL,.003*BL,upper);c=mix(c,m,am);}
  // the lower jaw: the outer side of the mandible, dark above with the dark line of the lip, pale below
  if(dJ<WPX){float jt=mouthV(fl.x),jb=jt-jawDep(fl.x);float uj=clamp((fl.y-(jt+jb)*.5)/max((jt-jb)*.5,1e-4),-1.,1.);
   vec2 ndj=JO*bodyNrm(clamp(fl.x,0.,1.));vec3 jn=normalize(vec3(ndj*(uj*.40+.10),1.));
   vec3 jc=lit(skinBlue(fl.xy,.25+.30*uj),jn,E*(1.+cs),amb,.25);
   jc*=1.-.55*ss(.0035*BL,.0010*BL,jt-fl.y);
   float aj=covW(dJ)*(wIn>.001?mix(1.,ss(-1.,-.45,uj),ss(.0,.04,pch)):1.);c=mix(c,jc,aj);}
  c=fogW(c,dist,zz);
  vec3 fc=fogW(lit(mix(vec3(.28,.35,.43),vec3(.66,.70,.72),.30+.35*segU(w,fa,ftip)),normalize(vec3(-nd*.25,1.)),E,amb,.2),dist,zz);
  c=mix(c,fc,af);a=max(a,af);
  putF(c,a);
 }
}

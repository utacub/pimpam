// ---- Scene 20: the blue whale (oceà Austral, low sunset light from above) ----
// 0–2 s travelling through empty water; 2–5 the head comes in from the right, close (the eye); 5–7.5 the camera pulls back to the
// whole body and the krill cloud ahead; 7.5–8.4 the whale speeds up; 8.4–10.4 the mouth opens wide and the throat fills like a balloon
// (Goldbogen et al., 2011); 10.4–11.6 the mouth closes on the full pouch; 11.6–16 the pouch empties slowly through the baleen while
// the whale glides out on the left.
const float L20=2.5;            // 25 m
const float Y20=-1.0;           // depth of the whale's axis (10 m)
// speed keys (world units per second), integrated exactly (piecewise linear speed)
float headX(float T){const int N=7;float tk[7]=float[7](2.,7.5,8.4,9.6,11.5,14.5,16.);float vk[7]=float[7](.30,.30,.62,.10,.04,.30,.34);
 float x=1.25;if(T<2.)return x+.30*(2.-T);
 for(int i=0;i<N-1;i++){float a=tk[i],b=tk[i+1];if(T<=a)break;float u=min(T,b)-a;float va=vk[i],vb=vk[i+1];x-=u*(va+(vb-va)*u/(2.*(b-a)));}
 if(T>16.)x-=.34*(T-16.);return x;}
float jawA(float T){return 1.30*ss(8.3,9.3,T)*(1.-ss(10.3,11.6,T));}
float pouch(float T){return .16*ss(8.6,10.3,T)*(1.-.80*ss(11.6,15.5,T));}
vec2 eyePos(float T){return vec2(headX(T)+.215*L20,Y20+.004*L20);}
void camera(){float T=uT;
 // travelling 0–2 from the left through empty water; then close on the head as it comes in; then the camera pulls back
 vec2 c0=vec2(.40,Y20+.03);vec2 cE=eyePos(T)+vec2(-.05,.02);float k=ease3((T-2.)/2.6);
 vec2 cW=vec2(-.20,Y20-.22);float pb=ease3((T-5.)/2.8);
 vec2 cT=c0-vec2(2.2*(1.-ease3(T/2.)),0.);
 CAM=mix(mix(cT,cE,k),cW+vec2(-.30*ease((T-8.)/6.),0.),pb);
 VH=mix(.62,1.95,pb);if(T<2.)VH=mix(2.0,.62,ease3(T/2.));}
// The blue whale. Profiles above and below the axis, units of the body length.
float TOPB[11]=float[11](.009,.030,.049,.058,.061,.060,.055,.046,.033,.019,.010);
float BOTB[11]=float[11](.014,.037,.058,.066,.067,.062,.052,.040,.028,.017,.010);
const float HINGE=.215;
float mouthV(float s){return (-.007+.017*ss(0.,HINGE,s))*L20;}  // the mouth line, rising a little to the corner
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
void scene(vec2 w){float T=uT;
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
#if STYLE==1
  haze=vec3(.80,.35,.36);
#endif
  vec2 q=w*30.+vec2(T*.45,T*.12);vec2 i=floor(q),fq=fract(q);vec2 o=h22(i);float r=.09+.07*h21(i+4.);
  float sp=ss(max(r,.6*WPX*30.),r*.25,length(fq-.2-.6*o))*step(.40,h21(i+9.));
  vec3 spc=fogW(vec3(1.,.60,.52)*(lightAt(z)*2.6+.45),.35+VH*.10,z);
  putF(haze,kden*.62);putF(spc,sp*kden);
 }
 // ---- the whale ----
 float ph=TAU*.22*T;float amp=.15*(1.-.75*ss(8.4,9.,T)*(1.-ss(11.5,13.,T)));
 spine(vec2(hx,Y20+.02*sin(T*.4)),PI-.03*sin(T*.3),L20,-1.,amp,ph,.0);
 vec3 f=bodyF(w);
 float jaw=jawA(T),pch=pouch(T);
 vec2 dr=bodyDir(.05);vec2 nr=BFLIP*vec2(-dr.y,dr.x);  // ahead, and towards the back, at the head
 vec2 H=bodyPt(HINGE,mouthV(HINGE));vec2 R=bodyPt(.0,mouthV(0.));
 vec2 J0=bodyPt(-.004,mouthV(0.)-.004*BL);vec2 J=H+rot(BFLIP*jaw)*(J0-H);   // the tip of the lower jaw, turned down
 float dC=bodyClosed(f.xy);
 float open=ss(.0,.05,jaw);
 // the rostrum: the body without what lies below the mouth line in front of the hinge, once the mouth opens
 float upper=dC;if(open>0.)upper=max(dC,-max(-(f.y-mouthV(f.x)),(f.x-HINGE)*BL));
 // the pouch: from the jaw, swollen down and back to the navel; its outer curve is a Bézier from J to the navel N
 vec2 N=bodyPt(.58,-prof(.58,BOTB)*BL);vec2 down=-nr;
 vec2 Cc=mix(J,N,.45)+down*(2.0*pch*BL+.025*BL*open)-dr*.05*BL*open;
 vec2 V[16];V[0]=H;V[1]=J;for(int i=1;i<=13;i++)V[1+i]=bez(J,Cc,N,float(i)/13.);V[15]=bodyPt(.40,0.);
 float dP=(pch>.001||open>0.)?sdPoly16(w,V):1e5;
 // distance to the outer curve, for the grooves and the shading of the pouch
 float dOut=1e5,tOut=0.;if(dP<.05){vec2 o=J;for(int i=1;i<=16;i++){vec2 nn=bez(J,Cc,N,float(i)/16.);float e=sdSeg(w,o,nn);if(e<dOut){dOut=e;tOut=(float(i-1)+segU(w,o,nn))/16.;}o=nn;}}
 // the lower jaw: a long bone under the skin, from the hinge to the tip
 float dJ=open>0.?sdCap(w,H-nr*.010*BL,J,.011*BL,.007*BL):1e5;
 // the open mouth: the triangle between the rostrum, the jaw and the hinge
 float dM=1e5;if(open>0.){vec2 e0=R-H,e1=J-R,e2=H-J;vec2 v0=w-H,v1=w-R,v2=w-J;
  vec2 p0=v0-e0*sat(dot(v0,e0)/dot(e0,e0)),p1=v1-e1*sat(dot(v1,e1)/dot(e1,e1)),p2=v2-e2*sat(dot(v2,e2)/dot(e2,e2));
  float sg=sign(e0.x*e2.y-e0.y*e2.x);vec2 dd=min(min(vec2(dot(p0,p0),sg*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(p1,p1),sg*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(p2,p2),sg*(v2.x*e2.y-v2.y*e2.x)));
  dM=-sqrt(dd.x)*sign(dd.y);}
 // the flukes, seen nearly edge-on, tilting with the stroke
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);float tilt=sin(ph-TAU*.85+1.2);
 vec2 tq=rot(-atan(td.y,td.x))*(w-(tp-td*.045*BL));float dFk=sdEll(tq,vec2(.055*BL,(.006+.020*abs(tilt))*BL));
 // the near flipper: a slender blade, a little paler below
 vec2 fa=bodyPt(.275,-prof(.275,BOTB)*BL*.45);vec2 dd=bodyDir(.275);vec2 fn=BFLIP*vec2(-dd.y,dd.x);
 float fang=.52+.08*sin(T*.7);vec2 ftip=fa-dd*(.088*BL)*cos(fang)-fn*(.088*BL)*sin(fang);
 vec2 fmid=mix(fa,ftip,.45)-dd*.006*BL;float dFl=min(sdCap(w,fa,fmid,.0085*BL,.0062*BL),sdCap(w,fmid,ftip,.0062*BL,.0012*BL));
 float dB=min(min(upper,dFk),min(dP,dJ));
 float dist=.20+VH*.40;   // how far from the camera (the haze)
 float a=covW(min(dB,dM)),af=covW(dFl);
 if(a>.001||af>.001){
  float zz=max(-w.y,0.);
  vec3 E=lightAt(zz)*1.75;vec3 amb=waterCol(zz)*1.25+vec3(.012,.02,.03);
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
  // the eye: small, dark, with a soft fold above it
  vec2 ep=bodyPt(.215,.006*L20);float de=length((w-ep)*vec2(1.,1.25));
  c=mix(c,c*.72,ss(.010*BL,.006*BL,de));c=mix(c,vec3(.025,.025,.03),ss(.0042*BL,.0030*BL,de));
  c+=E*.16*ss(.0012*BL,.0004*BL,length(w-ep-vec2(.0012,.0012)*BL));
  if(open<=0.){float ml=abs(f.y-mouthV(f.x));c*=1.-.55*ss(.0020*BL,.0007*BL,ml)*ss(HINGE+.01,HINGE-.01,f.x)*ss(-.01,.01,f.x);}
  float shade=sat(.55-u*.6);
  // the pouch (where the rostrum is not): pale, the grooves stretched apart, round towards its outer curve
  if(dP<0.&&upper>0.){float th=(2.*pch*BL*.6+.035*BL)*(.35+.65*sin(PI*sat(tOut)));float k=sat(dOut/th);float up=-(1.-k);
   vec3 pn=normalize(vec3(nd*up*.85,sqrt(max(1.-up*up*.72,0.))));
   float g2=abs(fract(k*(7.+10.*pch/.16))-.5)*2.;float pg=ss(.30,.0,g2)*ss(.0,.06,k);
   vec3 palb=mix(vec3(.66,.64,.60),vec3(.90,.76,.72),ss(.02,.12,pch));palb=mix(palb,palb*vec3(.70,.66,.68),pg*.75);
   vec3 pc=lit(palb,pn,E,amb*1.6+waterCol(zz)*.7,.15);
   pc*=1.-.35*ss(.06*BL,.0,-upper)*0.;
   float pa=covW(dP);c=mix(c,pc,pa);shade=mix(shade,sat(.6+up*.5),pa);u=mix(u,up,pa);
   c*=1.-.30*ss(.012*BL,.0,abs(f.y+prof(f.x,BOTB)*BL))*pa*ss(.62,.5,f.x);}  // the seam where the pouch leaves the belly
  // the open mouth: dark, with the fringe of baleen hanging from the rostrum
  if(dM<WPX&&open>0.){float along=dot(w-H,dr);vec2 mp=bodyPt(f.x,mouthV(f.x));float hang=dot(w-mp,-nr);
   float gapeL=length(J-H)*sin(jaw);
   float comb=.5+.5*sin(along*1500./BL);float plates=ss(.30*gapeL,.0,hang)*(.55+.45*comb);
   float tips=ss(.30*gapeL,.22*gapeL,hang)*ss(.36*gapeL,.30*gapeL,hang)*(.5+.5*sin(along*3100./BL));
   vec3 m=mix(vec3(.05,.04,.045),vec3(.13,.12,.12),ss(.0,1.,hang/max(gapeL,1e-4)));
   m=mix(m,vec3(.17,.17,.18),plates*.8)+vec3(.20,.18,.15)*tips*.35;
   m*=lightAt(zz)*1.3+.10;
   float am=covW(dM)*ss(-.002*BL,.003*BL,upper);c=mix(c,m,am);shade=mix(shade,1.,am);}
  // the jaw bone over the edge of the pouch
  if(dJ<WPX){float aj=covW(dJ);float ju=clamp(dot(w-H,nd)/(.012*BL),-1.,1.);vec3 jc=lit(mix(vec3(.30,.36,.44),vec3(.55,.56,.54),.5),normalize(vec3(-dr*.4+nd*.0,1.)),E,amb*1.2,.3);c=mix(c,jc,aj);}
  c=fogW(c,dist,zz);
  vec3 fc=fogW(lit(mix(vec3(.28,.35,.43),vec3(.66,.70,.72),.30+.35*segU(w,fa,ftip)),normalize(vec3(-nd*.25,1.)),E,amb,.2),dist,zz);
  c=mix(c,fc,af);a=max(a,af);shade=mix(shade,.25,af);
  putF(c,a);
#if STYLE==1
  ink(dB);ink(dFl);if(open>0.){ink(dM);ink(dJ);}
  if(groove>.3)INKD=min(INKD,WPX*.9+gl*.002);
  SHADE=shade;
#endif
 }
}

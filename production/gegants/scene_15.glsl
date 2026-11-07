// ---- Scene 16: the reef mantas (a cleaning station in the Maldives) ----
// Looking down at a slant over the reef. 2–4.5 s a manta glides in from the blue and stops over a coral head, hovering with slow beats
// of its wings while little cleaner wrasse come up and pick it over (mantas visit cleaning stations; Barr & Abelson, 2019). 4–5 a
// second manta comes in higher up, where the plankton is thick, and 5–9.5 it turns a slow backward somersault, showing its white belly
// as it goes over (somersault feeding is part of the reef manta's repertoire; Armstrong et al., 2021). 9.5–14 the first comes toward us
// and passes out below; the second glides off to the left.
// A manta is drawn from its shape seen from above (x across the wings, y forward; units of its half-span), tilted by the view and by
// its own pitch: on the screen y = y·sin(E+θ) + z·cos(E+θ), z the lift of the wings as they beat; E the view's slant, θ the pitch.
const float EV=.62;
// the outline from above: the wing leading edge, the trailing edge, the head between the cephalic fins, the tail
float mantaPlan(vec2 p,float horn,out float part){part=0.;float ax=abs(p.x);float xn=min(ax,1.);
 float yle=.30*(1.-pow(xn,1.25))-.06*xn;float yte=-.52+.50*pow(xn,.80);
 float d=max(max(p.y-yle,yte-p.y),ax-1.);d=max(d,-1e5);
 d=smin(d,sdEll(p-vec2(0.,.06),vec2(.20,.26)),.06);
 // the cephalic fins: two lobes ahead of the mouth, unrolled (horn 1) when feeding
 float hl=mix(.10,.17,horn);float hw=mix(.025,.040,horn);float dh=sdCap(vec2(ax,p.y),vec2(.13,.24),vec2(.13+.02*horn,.24+hl),hw,hw*.8);
 if(dh<d)part=1.;d=min(d,dh);
 float dt=sdCap(p,vec2(0.,-.40),vec2(.0,-1.05),.020,.004);if(dt<d)part=2.;d=min(d,dt);
 return d;}
float flapZ(float x,float ph,float amp){float xn=min(abs(x),1.);return amp*pow(xn,1.6)*sin(ph-1.2*xn);}
// draw a manta: centre c (screen), half-span S (screen), screen heading g (0: forward is up the screen), pitch th, flap phase, amp, horn
void manta(vec2 c,float S,float g,float th,float ph,float amp,float horn,float haze,vec3 bgc){
 vec2 q=rot(-g)*(P-c)/S;float sa=sin(EV+th),ca=cos(EV+th);float sg=sa<0.?-1.:1.;float sv=sg*max(abs(sa),.10);
 float z=flapZ(q.x,ph,amp);float py=(q.y-z*ca*cos(g))/sv;
 if(abs(q.x)>1.25||abs(py)>1.4)return;
 float part;float d=mantaPlan(vec2(q.x,py),horn,part);float dsc=d*S*min(abs(sv)*1.4+.15,1.);float a=ss(PX,-PX,dsc);if(a<.002)return;
 float dz=(flapZ(q.x+.01,ph,amp)-flapZ(q.x-.01,ph,amp))/.02*sign(q.x+1e-5);
 vec3 n=normalize(vec3(-dz*sign(q.x+1e-5)*.8,.0,1.));float lam=sat(dot(n,normalize(vec3(-.3,.2,1.))));
 bool top=sa>0.;
 float zz=1.2;vec3 E=lightAt(zz)*1.45;vec3 amb=waterCol(zz)*.9+vec3(.006,.012,.018);
 vec3 alb;
 if(top){alb=vec3(.035,.038,.045);
  // the pale shoulder patches of the reef manta, behind the head on each side
  float ax=abs(q.x);float sh=ss(-.02,.08,py-(.00+.22*ax))*ss(.62,.25,ax)*ss(.12,.22,ax)*ss(.26,.12,py-(.00+.22*ax));alb=mix(alb,vec3(.58,.60,.61),sh*.85);
  alb=mix(alb,vec3(.10,.10,.11),ss(.02,-.06,py-(.30*(1.-pow(min(abs(q.x),1.),1.25))-.06*abs(q.x)))*.0);}
 else{alb=vec3(.80,.80,.78);
  // the belly: white, a few dark spots between the gill slits, the dark rim of the wings
  vec2 sq=vec2(q.x,py)*9.;float spots=ss(.20,.10,length(fract(sq)-.5-.3*(h22(floor(sq))-.5)))*step(.80,h21(floor(sq)+3.))*ss(.45,.2,abs(q.x))*ss(-.35,-.1,py);
  alb=mix(alb,vec3(.10,.10,.12),spots);alb=mix(alb,vec3(.10,.10,.12),ss(-.06,.0,d)*.7);
  float gs=ss(.012,.0,abs(fract((py+.05)/.06)-.5)*.06-.0)*ss(.22,.12,abs(abs(q.x)-.17)*4.)*ss(-.30,-.05,py)*ss(.10,-.05,py);alb*=1.-.4*gs;}
 if(part>.5)alb=top?vec3(.05,.05,.06):vec3(.70,.70,.68);
 vec3 col=alb*(E*(.30+.70*lam)*(top?1.:.55)+amb)+E*.10*pow(1.-abs(sa),2.);
 // the mouth between the cephalic fins, the eyes at the sides of the head
 if(!top||abs(sa)<.6){}
 float ey=ss(.035,.020,length(vec2(abs(q.x)-.20,py-.20)));col=mix(col,vec3(.02),ey*.8);
 col*=1.-.30*ss(-.03,.0,d);
 col=mix(col,bgc,haze);
 putF(col,a);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.10,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.012,.150,.270);
 KD=vec3(2.5,.50,.28);KH=vec3(2.0,.55,.34);VEIL=vec3(.015,.13,.21);
 // the reef below, seen from above at a slant: sand, rubble and coral, hazier with distance, the light dancing on it
 vec3 wc=waterCol(1.0)*(.70+.70*ss(-.2,.6,P.y))+vec3(.0,.01,.02);
 vec3 fp=planeAt(CAM.y-.40*VH,.78,1.);vec3 c=wc;
 if(fp.z>.5){float dd=fp.y;float X=fp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*4.;float fw=length(fwidth(q));
  float cov=ss(.45,.65,fbm(q*.6+3.));float rub=fbm(q*3.);vec3 sand=vec3(.62,.58,.48)*(.80+.25*rub);
  vec3 coral=mix(vec3(.30,.27,.24),vec3(.42,.30,.22),ss(.4,.7,fbm(q*1.3+8.)));coral=mix(coral,vec3(.22,.30,.28),ss(.5,.8,fbm(q*2.1+1.)));
  coral*=.70+.40*ss(.2,.8,fbm(q*6.))*ss(1.5,.4,fw);
  vec3 g=mix(sand,coral,cov);
  float ca=caust(vec2(X,Zw)*3.,T*.8)*ss(1.6,.4,fw);
  vec3 lc=g*(lightAt(1.4)*1.05+waterCol(1.4)*.5)+lightAt(1.4)*.10*ca;
  vec3 tf=exp(-KH*camDist()*.80*dd);c=lc*tf+wc*(1.-tf);}
 // the coral head of the cleaning station: fixed on the reef (it stands on the floor at the distance DDR; when the camera travels or
 // zooms it moves and scales with the floor under it, instead of staying put on the screen)
 {const float DDR=1.18/1.08;vec2 rc=vec2((.02*DDR-CAM.x)/(VH*DDR),-.30);vec2 PR=(P-rc)*VH+vec2(.02,-.30);
  vec2 bq=(PR-vec2(.02,-.30))/vec2(.30,.13);float bd=length(bq)-1.+.35*(fbm(PR*7.)-.5)+.10*(fbm(PR*18.)-.5);if(bq.y<0.)bd=max(bd,-.0+abs(bq.x)-1.05);
  float ba=ss(.03,-.03,bd);if(ba>0.){vec2 tq=PR*14.;float br=.5+.5*sin(tq.x*2.+3.*fbm(tq*.4));float hi=sat(.6+.6*bq.y);
   float lump=fbm(tq*.8);float lx=fbm(tq*.8+vec2(.05,0.))-lump,ly=fbm(tq*.8+vec2(0.,.05))-lump;float bump=sat(.55+6.*(ly-lx*.4));
   vec3 bc=mix(vec3(.40,.34,.27),vec3(.26,.34,.30),ss(.3,.7,fbm(tq*.3)))*(.65+.35*br);bc=mix(bc,vec3(.50,.32,.30),ss(.60,.72,fbm(tq*.5+5.))*.7);bc=mix(bc,vec3(.42,.40,.22),ss(.62,.74,fbm(tq*.45+9.))*.6);
   bc*=(.45+.55*hi)*(.70+.45*bump);bc=bc*(lightAt(1.3)*1.10+waterCol(1.3)*.5)+lightAt(1.3)*.10*caust(PR*5.,T*.8)*hi;bc=mix(bc,wc,.12);c=mix(c,bc,ba);}}
 // plankton thick in the water up where the second manta feeds
 {vec2 pq=P*vec2(70.,70.)+vec2(T*.6,T*.25);vec2 pi_=floor(pq);float pd=length(fract(pq)-.5-.3*(h22(pi_)-.5));c+=vec3(.55,.70,.65)*.25*ss(.10,.03,pd)*step(.80,h21(pi_+7.))*ss(-.1,.3,P.y);}
 BG=c;
 // the reef's place on the screen as the camera travels (the mantas swim in the same world as the coral head)
 float RX=(.02*(1.18/1.08)-CAM.x)/(VH*(1.18/1.08))-.02;
 // ---- the second manta: in, a slow backward somersault, out to the left ----
 {float tin=ss(3.0,5.0,T),tout=ss(9.6,13.6,T);vec2 cB=mix(vec2(.95,-.75),vec2(.42,.12),tin);cB=mix(cB,vec2(.62,.62),tout);
  float th=TAU*ss(5.0,9.5,T);float R=.13;cB+=vec2(RX,R*(1.-cos(th))*.85);
  float g=-.30*(1.-tin)-.06+.05*sin(T*.4);float S=mix(.26,.19,tin)*mix(1.,.40,tout);
  float ph=TAU*.24*T;manta(cB,S,g,th,ph,.22*(1.-.6*ss(5.,6.,T)*(1.-ss(8.8,9.6,T))),ss(4.4,5.2,T)*(1.-ss(9.5,10.5,T)),.20+.65*tout,BG);}
 // ---- the first manta at the station ----
 vec2 cA;float SA;{float tin=ss(1.8,4.6,T),tout=ss(9.8,13.6,T);cA=mix(vec2(.10,.40),vec2(.02,-.12),tin);SA=mix(.11,.30,tin);
  cA=mix(cA,vec2(-.05,-1.30),tout*tout);SA=mix(SA,.62,tout*tout);cA+=vec2(RX+.01*sin(T*.5),.008*sin(T*.7));
  // the cleaner wrasse round its edges (drawn under it first, some over it after)
  float ph=TAU*.22*T;float haze=.40*(1.-tin)+.05;
  for(int i=0;i<8;i++){float fi=float(i);float an=fi*.8+T*(.6+.3*h11(fi));vec2 fpos=cA+vec2(cos(an)*SA*(.55+.35*h11(fi+2.)),-.04*SA+sin(an*1.3)*SA*.20)+vec2(0.,-.02);
   vec2 fd=normalize(vec2(-sin(an),.3*cos(an*1.3)));vec2 lq=rot(-atan(fd.y,fd.x))*(P-fpos);float L=.022;
   float d=min(sdEll(lq,vec2(L*.5,L*.13)),sdTri(lq,vec2(-L*.42,0.),vec2(-L*.62,L*.10),vec2(-L*.62,-L*.10)));float aa=ss(PX,-PX,d)*ss(3.,4.5,T)*(1.-ss(9.5,10.5,T));
   if(aa>.002&&i<4){vec3 al=mix(vec3(.30,.55,.85),vec3(.85,.88,.90),ss(.0,-.4,lq.y/(L*.13)));al=mix(al,vec3(.03),ss(.20,.0,abs(lq.y/(L*.13)))*.9);
    putF(al*(lightAt(1.2)*1.3+.05),aa);}}
  manta(cA,SA,PI+.05*sin(T*.3),0.,ph,.20,0.,haze,BG);
  for(int i=4;i<8;i++){float fi=float(i);float an=fi*.8+T*(.6+.3*h11(fi));vec2 fpos=cA+vec2(cos(an)*SA*(.55+.35*h11(fi+2.)),-.04*SA+sin(an*1.3)*SA*.20)+vec2(0.,-.02);
   vec2 fd=normalize(vec2(-sin(an),.3*cos(an*1.3)));vec2 lq=rot(-atan(fd.y,fd.x))*(P-fpos);float L=.022;
   float d=min(sdEll(lq,vec2(L*.5,L*.13)),sdTri(lq,vec2(-L*.42,0.),vec2(-L*.62,L*.10),vec2(-L*.62,-L*.10)));float aa=ss(PX,-PX,d)*ss(3.,4.5,T)*(1.-ss(9.5,10.5,T));
   if(aa>.002){vec3 al=mix(vec3(.30,.55,.85),vec3(.85,.88,.90),ss(.0,-.4,lq.y/(L*.13)));al=mix(al,vec3(.03),ss(.20,.0,abs(lq.y/(L*.13)))*.9);
    putF(al*(lightAt(1.2)*1.3+.05),aa);}}}
}

// ---- Scene 11: the humpback breach (Carib, bright tropical day) ----
// 0–2 s travelling through bright water; 2–5.2 the whale rises from the deep blue below, singing; 5.2–6.4 the camera rises to the
// waterline (half sky, half sea); 6.4–8.1 the whale bursts out, flippers spread, water pouring off; 8.1–9.3 it turns back and falls;
// 9.3 the crash: a tall curtain of white water; 9.6–10.6 the camera dips under; the whale swims away through its cloud of bubbles.
const float L11=1.4;            // 14 m
// the centre of the body (s = .45) and the direction of the body, through the scene
vec2 hbC(float T){
 if(T<6.4)return mix(vec2(1.25,-2.75),vec2(.30,-.62),ease((T-2.)/4.4)*.55+.45*sat((T-2.)/4.4));
 if(T<8.1){float u=(T-6.4)/1.7;return vec2(.30-.10*u,-.62+1.02*(1.-(1.-u)*(1.-u)));}
 if(T<9.35){float u=(T-8.1)/1.25;return vec2(.20+.35*u,.40-.52*u*u);}
 float u=T-9.35;return vec2(.55+.30*u-.02*u*u,-.12-.55*(1.-exp(-u*.9))-.06*u);}
float hbA(float T){ // radians
 if(T<6.4)return mix(1.85,1.80,sat((T-2.)/4.4));
 if(T<8.1)return 1.80-.06*(T-6.4);
 if(T<9.35){float u=(T-8.1)/1.25;return 1.70-1.95*u*u*(.6+.4*u);}
 float u=T-9.35;return -.25-.30*(1.-exp(-u*1.2))+.15*ss(1.5,4.,u);}
float surfY(float x,float T){return .012*sin(x*6.+T*1.4)+.007*sin(x*13.-T*2.2)+.004*sin(x*29.+T*3.1);}
void camera(){float T=uT;
 // underwater the camera follows the rising whale from a little above it, never showing the sky
 vec2 c0=hbC(max(T,2.));vec2 cU=vec2(mix(.55,c0.x-.10,ease((T-2.)/2.)),min(c0.y+.30,-.92));
 vec2 cS=vec2(.18,.36),cD=vec2(.75,-1.02);
 float up=ease3((T-5.2)/1.2),dn=ease3((T-9.7)/1.1);
 CAM=mix(mix(cU,cS,up),cD,dn);VH=mix(mix(1.75,1.62,up),2.1,dn);
 if(T<2.){CAM=vec2(.55,-1.45)-vec2(2.4*(1.-ease3(T/2.)),0.);VH=2.0;}}
float TOPH[11]=float[11](.020,.054,.072,.082,.090,.088,.078,.060,.038,.020,.012);
float BOTH[11]=float[11](.030,.076,.098,.106,.108,.098,.081,.058,.036,.020,.012);
const float HG=.29;
float mouthH(float s){return (-.012+.020*ss(0.,HG,s)+.006*sin(PI*sat(s/HG)))*L11;}
float profH(vec2 f,float sgn){float e=.012;float t,dt;
 if(sgn>0.){t=prof(f.x,TOPH)*BL;dt=(prof(f.x+e,TOPH)-prof(f.x-e,TOPH))/(2.*e);}else{t=prof(f.x,BOTH)*BL;dt=(prof(f.x+e,BOTH)-prof(f.x-e,BOTH))/(2.*e);}
 return (sgn*f.y-t)/sqrt(1.+dt*dt);}
float humpD(vec2 f){float d=max(profH(f,1.),profH(f,-1.));d=smax(d,-f.x*BL,.018*BL);d=max(d,(f.x-1.02)*BL);
 // the small dorsal fin on its hump
 vec2 df=vec2((f.x-.645)*BL,f.y-prof(.645,TOPH)*BL);d=smin(d,sdCap(df,vec2(-.030*BL,-.006*BL),vec2(.012*BL,.018*BL),.012*BL,.003*BL),.012*BL);
 return d;}
// a flipper: a long curved blade from a (base) through m to b (tip), widest a third of the way, with knobs along its leading edge
// (the side ln); returns the distance and, in u, how far along it
float flipD(vec2 w,vec2 a,vec2 m,vec2 b,vec2 ln,float wd,out float uu){
 float u1=segU(w,a,m),u2=segU(w,m,b);vec2 q1=w-mix(a,m,u1),q2=w-mix(m,b,u2);float d1=dot(q1,q1),d2=dot(q2,q2);
 float u=d1<d2?u1*.45:.45+u2*.55;vec2 q=d1<d2?q1:q2;uu=u;float side=dot(q,ln);
 float r=wd*(.75+.55*sin(PI*min(u*1.4,1.))*(1.-u*.5))*mix(1.,.15,ss(.6,1.,u))+(side>0.?wd*.16*ss(.05,.15,u)*ss(.95,.8,u)*(.5+.5*sin(u*60.)):0.);
 return length(q)-r;}
// flukes seen at an angle: the planform (half-span S, swept, notched, scalloped trailing edge) squeezed across by k (0 edge-on, 1 flat)
float flukeD(vec2 q,float S,float k){k=max(k,.06);vec2 p=vec2(q.x,q.y/k);float y=abs(p.y);
 float le=.38*y,te=le+S*.42*(1.-pow(y/S,1.6))*(.75+.25*ss(.0,.25*S,y))+S*.02*sin(y/S*25.)*ss(.3*S,S,y);
 float d=max(max(le-p.x,p.x-te),y-S);return d*k;}
// White water thrown up round x0 from the surface sy: thin streaky sheets (brighter at their edges), a foam ring at the base, mist
// and drops above. wd: half-width at the base; ht: height; t: its own clock; k: strength.
void splash(vec2 w,float sy,float x0,float wd,float ht,float t,float k){if(k<=.001)return;
 float y=w.y-sy;float dx=w.x-x0;float h=max(ht,.01);float yn=y/h;
 // the sheets lean outwards a little as they rise
 float xs=dx/(wd*(1.+.55*sat(yn)));float env=ss(1.05,.55,abs(xs))*ss(1.15,.25,yn+.25*(fbm(vec2(w.x*7.,t*.6))-.5));
 float streak=vn(vec2(xs*18.+t*.4,y*3.5-t*2.2))*.6+vn(vec2(xs*41.,y*9.-t*3.))*.4;
 float sheet=env*ss(.38,.75,streak)*(.45+.55*ss(.0,.4,abs(xs)));
 float ring=ss(.05,.0,abs(y-.012))*ss(1.25,.7,abs(dx/wd))*(.55+.45*fbm(vec2(w.x*20.,t)));
 float mist=env*.22*fbm(vec2(w.x*3.,y*3.-t*.4));
 vec2 dq=vec2(w.x*34.,(y+t*t*.12)*34.);vec2 di=floor(dq);float drop=ss(.20,.06,length(fract(dq)-.2-.6*h22(di)))*step(.80,h21(di+2.))*ss(1.7,.6,abs(xs))*ss(1.6,.8,yn)*ss(.0,.1,y);
 float a=sat(sheet*.75+ring*.85+mist+drop*.85)*k;
 putF(vec3(.95,.97,.98)*(.86+.18*streak),a);}
void scene(vec2 w){float T=uT;
 SUND=normalize(vec2(-.30,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.03,.36,.44);
 float sy=surfY(w.x,T);
 // the water lifted round the whale where it passes the surface
 vec2 c0=hbC(T);float ang=hbA(T);
 float above=step(sy,w.y);
 // ---- the sky and the far sea above the waterline; the water below ----
 float horiz=.035*VH;   // the dome of the lens shows the horizon a little above the waterline
 if(above>.5){
  float hy=w.y-horiz;
  vec3 sky=mix(vec3(.42,.60,.80),vec3(.10,.27,.62),ss(.0,1.4,hy));
  float cl=fbm(vec2(w.x*.55+T*.01,hy*1.6)*1.6);float cm=ss(.55,.78,cl)*ss(.05,.5,hy)*ss(1.6,.6,hy);
  sky=mix(sky,vec3(.82,.83,.84)*(.80+.25*ss(.4,.9,fbm(w*3.+1.))),cm*.9);
  sky+=vec3(1.,.95,.8)*.25*exp(-length(w-CAM-vec2(-1.9,1.6))*1.4);
  vec3 sea=mix(vec3(.05,.22,.36),vec3(.16,.40,.55),ss(horiz,.0,hy+horiz));
  float gl=pow(vn(vec2(w.x*30.,hy*260.)+vec2(T*.4,0.)),7.)*ss(-.02,.0,-(hy));sea+=vec3(.9,.9,.8)*gl*.35;
  BG=hy>0.?sky:sea;
 }else{
  float z=-w.y;vec3 wc=waterCol(z)*(.70+.80*ss(-1.2,.25,w.y-CAM.y+.0));
  float sh=shafts(w*vec2(1.,1.),T);wc+=lightAt(z)*vec3(.55,.75,.70)*.40*sh;
  wc+=lightAt(z+.15)*.30*snow(P,T);
  // the underside of the surface near the waterline: a bright, rippled mirror band
  float band=ss(.07*VH,.0,sy-w.y);wc=mix(wc,vec3(.30,.62,.66)*(.70+.6*vn(vec2(w.x*14.+T*.7,w.y*40.))),band*.45);
  BG=wc;
 }
 // ---- the whale ----
 vec2 dir=vec2(cos(ang),sin(ang));
 float ph=TAU*.30*T;float amp=.10*(1.-.8*ss(6.,6.6,T)*(1.-ss(9.8,10.6,T)));
 spine(c0+dir*.45*L11,ang,L11,-1.,amp,ph,.06*ss(6.4,8.1,T)*(1.-ss(8.6,9.4,T)));
 vec3 f=bodyF(w);
 float dB=humpD(f.xy);
 vec2 dd=bodyDir(.30);vec2 nd=BFLIP*vec2(-dd.y,dd.x);
 // flippers: spread like wings in the breach, along the sides while swimming
 float spread=ss(5.8,6.8,T)*(1.-ss(9.6,10.8,T));
 vec2 fa=bodyPt(.345,-prof(.345,BOTH)*BL*.40);
 float fang=mix(.62,1.95,spread)+.10*sin(T*1.1);
 vec2 fdir=-dd*cos(fang)-nd*sin(fang),fper=vec2(-fdir.y,fdir.x);
 vec2 ftip=fa+fdir*.31*BL;vec2 fmid=fa+fdir*.14*BL+fper*.025*BL*(dot(fper,dd)>0.?-1.:1.);
 vec2 fln=normalize(dd*sin(fang)-nd*cos(fang));   // the leading edge faces forward
 float fu1,fu2;float dF=flipD(w,fa,fmid,ftip,fln,.030*BL,fu1);
 vec2 fdir2=-dd*cos(fang+.45)-nd*sin(fang+.45);vec2 fa2=fa+nd*.03*BL;
 float dF2=flipD(w,fa2,fa2+fdir2*.11*BL,fa2+fdir2*.24*BL,fln,.024*BL,fu2);
 // flukes: edge-on while swimming, more of them seen as the body turns in the fall
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);float tilt=sat(abs(sin(ph-TAU*.85+1.2))*.35+.70*ss(8.4,9.3,T)*(1.-ss(10.5,12.,T)));
 vec2 tq=rot(-atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.17*BL,tilt);
 dB=min(dB,dK);
 float a=covW(dB),af=covW(dF),af2=covW(dF2);
 vec2 dirH=bodyDir(.1);
 if(a+af+af2>.001){
  float zz=max(-w.y,0.);
  // light: full sun above the surface, the sea's light below
  vec3 E=above>.5?SUNC*2.0:lightAt(zz)*2.0;vec3 amb=above>.5?SKYC*.55+vec3(.05):waterCol(zz)*1.4+vec3(.02,.03,.03);
  float tt=prof(f.x,TOPH)*BL,bb=prof(f.x,BOTH)*BL;float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);
  vec2 ndf=BFLIP*vec2(-bodyDir(f.x).y,bodyDir(f.x).x);
  vec3 n=normalize(vec3(ndf*u*.92,sqrt(max(1.-u*u*.85,0.))));
  // skin: black above; the throat white with dark grooves (as in many North Atlantic humpbacks); a few white scars
  vec2 q=vec2(f.x*BL*14.,f.y*22.);float m=fbm(q);
  vec3 alb=vec3(.045,.05,.058)*(.85+.3*m);
  float gz=(bb+f.y);float gl=abs(fract(gz/(.0105*BL)+.5*vn(vec2(f.x*BL*3.,0.)))-.5)*2.;
  float throat=ss(.0,.05,f.x)*ss(.58,.44,f.x)*ss(-.30,-.55,u+.16*(fbm(q*.25+3.)-.5));
  vec3 wht=vec3(.84,.84,.82)*(.92+.08*m);alb=mix(alb,wht,throat);
  alb=mix(alb,vec3(.10,.10,.11),throat*ss(.32,.0,gl)*.85);
  // knobs on the rostrum and the lower jaw
  vec2 kq=vec2(f.x*BL*55.,(f.y-mouthH(f.x))*55.);vec2 ki=floor(kq);vec2 kf=fract(kq)-.5;float knob=ss(.30,.16,length(kf))*step(.55,h21(ki))*ss(.25,.08,f.x)*ss(.02,.04,f.x)*max(ss(.55,.85,u),ss(.012*BL,.0,abs(f.y-mouthH(f.x)+.010*BL)));
  alb=mix(alb,alb*1.6+.03,knob*.8);n=normalize(n+vec3(kf*.6*knob,0.));
  // white scars, barnacles on the chin
  alb=mix(alb,vec3(.70,.70,.68),ss(.78,.86,vn(q*vec2(.6,3.)+7.))*.35*ss(.2,.9,u));
  float wet=above>.5?1.:.35;
  float cs=above>.5?0.:caust(w*4.+vec2(T*.05,0.),T*.8)*sat(u*1.5+.2)*exp(-zz*1.2)*1.2;
  vec3 c=lit(alb,n,E*(1.+cs),amb,wet*.9);
  if(above>.5)c+=(SKYC*.16+vec3(.03))*pow(1.-n.z,2.5)*(.6+.4*sat(u))+SUNC*.5*pow(sat(dot(n,normalize(vec3(-.3,.6,.75)))),18.);  // the wet sheen
  // the eye above the corner of the mouth; the mouth line
  vec2 ep=bodyPt(.27,mouthH(.27)+.016*BL);float de=length(w-ep);
  c=mix(c,c*.6,ss(.016*BL,.010*BL,de));c=mix(c,vec3(.02),ss(.0065*BL,.0048*BL,de));c+=E*.10*ss(.0022*BL,.0010*BL,length(w-ep-vec2(.0016*BL)));
  float ml=abs(f.y-mouthH(f.x));c*=1.-.6*ss(.0035*BL,.0012*BL,ml)*ss(HG+.01,HG-.01,f.x)*ss(-.01,.01,f.x);
  // water pouring off the body above the surface: bright streaks running down
  if(above>.5){vec2 wq=vec2(dot(w,vec2(1.,0.))*60.,w.y*6.+T*3.);float st=ss(.7,.95,vn(wq))*ss(.0,.4,w.y-sy);c=mix(c,vec3(.92,.96,.98),st*.55*ss(6.4,6.9,T)*(1.-ss(8.6,9.,T)));}
  float shade=sat(.55-u*.6);
  if(above<.5)c=fogW(c,.12+VH*.20,zz);
  // the far flipper behind the body, the near flipper over it
  vec3 fcol=lit(vec3(.80,.81,.80),normalize(vec3(-nd*.2,1.)),E,amb,wet*.6);
  fcol*=.80+.25*fbm(w*30.);fcol*=.82+.30*ss(-1.,1.,dot(w-fa,fln)/(.03*BL));fcol=mix(fcol,vec3(.05,.055,.06)*E*.6+amb*.05,ss(.12,.02,fu1)*.8);
  if(above<.5)fcol=fogW(fcol,.12+VH*.20,zz);
  vec3 fcol2=fcol*.55;
  vec3 outc=c;float outa=a;
  // composite: far flipper, body, near flipper
  vec4 acc=vec4(0.);
  acc=vec4(fcol2*af2,af2);
  acc=vec4(c*a+acc.rgb*(1.-a),a+acc.a*(1.-a));
  acc=vec4(fcol*af+acc.rgb*(1.-af),af+acc.a*(1.-af));
  FG=vec4(FG.rgb*(1.-acc.a)+acc.rgb,FG.a*(1.-acc.a)+acc.a);
#if STYLE==1
  ink(dB);ink(dF);SHADE=mix(shade,.2,af);
#endif
 }
 // ---- white water: the collar round the body as it comes out, the crash, foam; spray; bubbles under the water ----
 // where the spine crosses the surface
 float cx=1e5;for(int i=0;i<NS;i++){vec2 a1=SP[i],b1=SP[i+1];if((a1.y-surfY(a1.x,T))*(b1.y-surfY(b1.x,T))<0.){float k=a1.y/(a1.y-b1.y);cx=mix(a1.x,b1.x,k);}}
 float col=ss(6.25,6.55,T)*(1.-ss(8.6,9.3,T));
 if(cx<1e4&&col>0.&&w.y>sy-.02){splash(w,sy,cx,.30*L11*(1.+.4*ss(6.4,7.6,T)),(.07+.20*ss(6.4,7.0,T)*(1.-ss(7.4,8.6,T)))*L11,T-6.4,col);}
 // the crash at 9.3: a tall crown of water that rises and falls back, then foam on the water
 float tc=T-9.25;
 if(tc>0.){float ix=.66;float rise=ss(.0,.5,tc)*(1.-ss(1.0,2.8,tc));
  if(w.y>sy-.02)splash(w,sy,ix,.75+.25*rise,1.05*rise+.04,tc*1.4+3.,1.);
  // foam on the surface: from above a white band, from below a bright lid
  float foam=ss(.0,.4,tc)*ss(1.3,.5,abs(w.x-ix))*(.55+.45*fbm(vec2(w.x*12.,tc)));
  putF(vec3(.92,.95,.96),foam*ss(.035,.0,abs(w.y-sy-.008))*.85);
  // the cloud of bubbles under the surface, drifting up and thinning
  if(w.y<sy){float bz=-w.y;float bc=ss(.0,.3,tc)*(1.-ss(2.5,4.5,tc));vec2 bq=w-vec2(ix+.10*tc,-.30-.10*tc);
   float bd=length(bq*vec2(.9,1.4))-.42-.25*(fbm(w*3.+tc*.3)-.5);float bub=ss(.15,-.25,bd)*bc;
   vec2 sq=vec2(w.x*45.,w.y*45.+tc*10.);vec2 si=floor(sq);float br=.08+.16*h21(si+8.);float sb=ss(br,br*.45,length(fract(sq)-.25-.5*h22(si)))*step(.70,h21(si+5.));
   putF(fogW(vec3(.85,.95,.98),.10+VH*.15,bz),bub*(.18+.50*sb));}
 }
 // bubbles from the blowholes while it rises (the song is heard; a few bubbles are seen)
 if(T>2.&&T<6.2&&w.y<sy){vec2 bh=bodyPt(.18,prof(.18,TOPH)*BL);float dy=w.y-bh.y;
  if(dy>0.){vec2 bq=vec2((w.x-bh.x-.03*sin(dy*6.+T))*50.,(dy-T*.5)*50.);vec2 bi=floor(bq);float bb=ss(.28,.12,length(fract(bq)-.5))*step(.80,h21(bi))*ss(.02,.0,abs(w.x-bh.x)-.04-dy*.04);
   putF(fogW(vec3(.85,.95,.98),.12+VH*.2,max(-w.y,0.)),bb*.7*ss(.0,.2,dy));}}
}

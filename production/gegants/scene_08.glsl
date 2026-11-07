// ---- Scene 9: the ocean sunfish (the Mediterranean, summer, clear blue) ----
// Seen from a little below. 2–5.4 s up from the deep blue comes the huge sunfish, 2 m long and 3 m from fin tip to fin tip, beating
// its tall dorsal and anal fins; 5.4–6.6 it rolls over onto its side just under the surface and lies there against the light,
// warming itself after its dive into the cold deep (Nakamura et al., 2015): it sculls slowly, the tip of its upper fin breaking the
// surface and sending rings of ripples across it, the little fish scattering and coming back; 9.6–10.6 it turns upright and sinks
// away into the blue.
float rollM(float T){return ss(5.4,6.6,T)*(1.-ss(9.6,10.6,T));}
vec2 molaC(float T){float u=sat((T-2.)/3.4);float y=-1.0+.70*(1.-(1.-u)*(1.-u));float x=-.12+.12*ss(2.,5.4,T);
 y+=.19*rollM(T)+.004*sin(T*.9);
 float v=max(T-10.,0.);y-=.10*v*v/(1.+.25*v);x-=.05*v*v/(1.+.3*v);return vec2(x+.012*sin(T*.5),y);}
float molaAng(float T){return mix(.30,0.,ss(4.,5.6,T))+mix(0.,-.35,ss(10.,11.2,T))-.06*rollM(T);}
// the squash of the body as it lies over (seen from below at a slant)
float molaSq(float T){return mix(1.,.60,rollM(T));}
// The sunfish in its frame (x forward, y up; world units of 10 m): the deep round body ending in the scalloped clavus, the tall
// blade-like dorsal and anal fins at the back, which flap (fl) toward and away from us so that they seem to shorten and flex.
float molaD(vec2 q,float fl,out float part){part=0.;
 float d=sdEll(q-vec2(.012,.0),vec2(.098,.084));
 float ca=atan(q.y,q.x+.050);float cl=sdEll(q-vec2(-.050,.0),vec2(.042,.076))-.0065*pow(1.-abs(sin(ca*4.5)),.6)*ss(-.05,-.08,q.x);
 d=smin(d,cl,.010);
 float ln=.80+.20*cos(fl);float fx=.014*sin(fl);
 vec2 tD=vec2(-.062-fx,.066+.130*ln),tA=vec2(-.062+fx,-.066-.130*ln);
 float dF=min(sdTri(q,vec2(.002,.060),vec2(-.074,.046),tD)-.005,sdCap(q,vec2(-.010,.072),tD+vec2(.004,-.012),.018,.006));
 float aF=min(sdTri(q,vec2(.002,-.060),vec2(-.074,-.046),tA)-.005,sdCap(q,vec2(-.010,-.072),tA+vec2(.004,.012),.018,.006));
 float df=min(dF,aF);part=ss(.004,-.006,df-d);d=smin(d,df,.006);
 return d;}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.15,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.020,.170,.330);
 KD=vec3(2.7,.60,.28);KH=vec3(2.3,.62,.36);VEIL=vec3(.015,.10,.20);
 BG=openWater(w,T,1.2,1.5);vec3 wc=BG;
 vec2 mc=molaC(T);float rl=rollM(T);float sq=molaSq(T);float ang=molaAng(T);
 float fl=TAU*mix(.42,.20,rl)*T+.6;
 // where the tip of the upper fin is, and whether it is out in the air
 vec2 tipL=vec2(-.060-.014*sin(fl),(.070+.128*(.80+.20*cos(fl)))*sq);vec2 tipW=mc+rot(ang)*tipL;
 // the surface overhead, receding: bright rippled silver, and the rings the fin sends out
 float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.12,1.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*7.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.6);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  vec2 rq=vec2(X-tipW.x,(dd-1.)*1.2*VH);float rd=length(rq);float rings=0.;
  for(int i=0;i<3;i++){float age=fract((T-6.2)/1.5+float(i)/3.);float born=T-age*1.5;
   float on=ss(6.2,6.8,born)*(1.-ss(9.4,9.9,born));float r=.015+.22*age;rings+=on*(1.-age)*exp(-pow((rd-r)/(.006+.010*age),2.));}
  rings*=ss(.4,.1,fw*.3);
  vec3 sc=WAT0*vec3(1.2,1.35,1.25)*(1.1+1.3*ov)+SUNC*vec3(.80,.90,.95)*(.06+.45*ov)*(.45+.55*gl+1.4*rings);
  vec3 tf=exp(-KH*camDist()*1.4*max(dd-.25,0.));BG=sc*tf+wc*(1.-tf);}
 // ---- the little fish that keep close to it: they scatter as it rolls over, then gather again ----
 float scat=ss(5.3,5.9,T)*(1.-ss(6.4,8.2,T));
 for(int i=0;i<9;i++){float fi=float(i);float an=T*(.30+.10*h11(fi))*(1.+1.2*scat)+fi*.70;float rr=(.20+.06*h11(fi+3.))*(1.+.9*scat);
  vec2 fp=mc+vec2(cos(an)*rr,.05*sin(an*1.3)-.04+.10*(h11(fi+5.)-.5));
  vec2 fd=normalize(vec2(-sin(an)*rr,.065*cos(an*1.3))+vec2(sin(an)>0.?-.02:.02,0.));
  vec2 lq=vec2(dot(w-fp,fd),dot(w-fp,vec2(-fd.y,fd.x)));
  float d=min(sdEll(lq,vec2(.015,.0055)),sdTri(lq,vec2(-.012,0.),vec2(-.022,.006),vec2(-.022,-.006)));float a=covW(d)*ss(2.,3.2,T);
  if(a>.002){float zz=max(-w.y,0.);float uu=clamp(lq.y/.0055,-1.,1.);vec3 al=mix(vec3(.70,.73,.76),vec3(.10,.16,.22),ss(-.1,.5,uu));
   vec3 c=lit(al,normalize(vec3(0.,uu*.8,.6)),lightAt(zz)*1.6,waterCol(zz)*1.2,.6);c=eyeC(c,lq,vec2(.010,.0012),.0018,lightAt(zz),vec3(.05));
   putF(fogW(c,.10+.20*VH,zz),a);}}
 // ---- the sunfish ----
 vec2 q=rot(-ang)*(w-mc);q.y/=sq;
 float part;float d=molaD(q,fl,part);float dw=d*mix(1.,sq,.85);
 // the part of the upper fin above the surface is out of sight
 float above=ss(-.004,.006,w.y);
 float a=covW(dw)*(1.-above);
 if(a>.002){float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.6*(1.-.45*rl);vec3 amb=waterCol(zz)*1.25+vec3(.008,.015,.022);
  vec2 qn=(q-vec2(.005,0.))/vec2(.105,.090);float r=length(qn);
  vec3 n=normalize(vec3(qn*(.20+.95*r*r*r),1.));
  vec2 tq=q*40.;float m=fbm(tq);float m2=fbm(tq*1.9+7.3);float sp_=ss(.66,.78,fbm(q*90.+3.));
  // dark above, silver-grey on the flank, pale low down; pale mottling; the clavus a little lighter; the fins dark
  float mf=fbm(q*85.);
  vec3 alb=mix(vec3(.30,.30,.29),vec3(.075,.078,.085),ss(-.03,.075,q.y+.020*(m-.5)));alb=mix(alb,vec3(.40,.40,.38),ss(-.03,-.08,q.y)*.7);
  alb*=.90+.18*mf;alb=mix(alb,vec3(.46,.46,.44),ss(.62,.72,m2)*.45*ss(.07,-.02,q.y));alb=mix(alb,alb*1.20,sp_*.25);
  float clv=ss(-.058,-.078,q.x)*(1.-ss(.3,.7,part));alb=mix(alb,alb*1.15+.015,clv*.6);
  if(part>.01){float fs=q.y>0.?sin(fl):-sin(fl);float al=sat((abs(q.y)-.06)/.13);
   vec3 fa=mix(vec3(.065,.068,.075),vec3(.11,.11,.12),al)*(.92+.16*mf);fa*=1.-.05*ss(.3,.0,abs(fract(q.x*120.+q.y*25.)-.5))*al;
   alb=mix(alb,fa,part);n=normalize(mix(n,vec3(.10*fs,.15*sign(q.y),.95),part));E*=1.+part*(.30*fs-.10);}
  vec3 c=lit(alb,n,E,amb,.20)+rimL(n,lightAt(zz)*1.6,.40+.55*rl);
  c+=lightAt(zz)*.22*caust(w*8.,T*.9)*sat(n.y+.4)*exp(-zz*4.)*(1.-.5*rl)*(1.-ss(.3,.7,part));
  // the lines of the clavus' lobes
  if(part<.5&&q.x<-.055){float ca=atan(q.y,q.x+.050);float lb=abs(fract(ca*4.5/PI+.5)-.5);c*=1.-.18*ss(.10,.0,lb)*ss(-.066,-.086,q.x);}
  // the pectoral fin, small and rounded, with the gill opening in front of it
  vec2 pq=rot(.45)*(q-vec2(.016,-.008));float pf=sdEll(pq-vec2(-.010,0.),vec2(.018,.009));c=mix(c,lit(vec3(.12,.12,.13),normalize(vec3(.1,.5,1.)),E,amb,.2),covW(pf*sq)*(1.-ss(.3,.7,part))*.85);
  c*=1.-.35*ss(.0025,.0,sdEll(q-vec2(.026,-.004),vec2(.0025,.005)))*(1.-ss(.3,.7,part));
  // the eye, round and dark; the small beak of a mouth
  if(part<.5){c=eyeC(c,q,vec2(.062,.022),.0105,E,vec3(.08,.08,.07));
   float mo=sdEll(q-vec2(.108,-.006),vec2(.007,.006));c=mix(c,c*1.18+.01,ss(.003,.0,mo)*ss(-.002,.002,mo+.003));c*=1.-.55*ss(.0015,-.002,mo+.0025);}
  c*=1.-.35*edgeK(dw);
  c=fogW(c,.03+.07*VH+.7*max(zz-.5,0.),zz);
  putF(c,a);}
 // where the fin cuts the surface: a little white water
 float cut=ss(-.01,.004,tipW.y)*rl;if(cut>.01){vec2 cq=(w-vec2(tipW.x,0.))/vec2(.030,.008);float fo=ss(1.,.2,length(cq))*(.5+.5*fbm(w*60.+T*2.));putF(vec3(.85,.92,.96)*SUNC,fo*cut*.55);}
}

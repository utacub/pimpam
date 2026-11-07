// ---- Scene 4: the basking shark (North Atlantic, summer: green water thick with plankton) ----
// 2–4 s close on a great pointed head coming in from the left, the mouth shut; 4.2–5.2 it opens its mouth wide: a white-rimmed cave
// ringed inside by the gill arches, the five long gill slits flaring round its head; the plankton streams in; the camera draws back to
// show all 8 m of it, the tall dorsal fin just under the surface; 8.4–9.2 it closes its mouth and swims out to the right.
// Basking sharks feed by swimming slowly with the mouth open, sieving plankton from the water through their gill rakers (Sims, 2008).
const float LK=.80;
float TOPK[11]=float[11](.008,.060,.080,.090,.092,.086,.072,.057,.042,.030,.022);
float BOTK[11]=float[11](.008,.062,.088,.094,.090,.080,.064,.049,.036,.026,.021);
float snoutK(float T){return -.55+.22*(T-2.);}
float gape(float T){return ss(4.2,5.3,T)*(1.-ss(8.4,9.2,T));}
// the lower outline of the head drops with the jaw
float botK(float s,float op){return prof(s,BOTK)+op*.075*ss(.0,.06,s)*ss(.24,.10,s);}
float sharkD(vec2 f,float op){float e=.012;float t=prof(f.x,TOPK)*BL;float dt=(prof(f.x+e,TOPK)-prof(f.x-e,TOPK))/(2.*e);
 float b=botK(f.x,op)*BL;float db=(botK(f.x+e,op)-botK(f.x-e,op))/(2.*e);
 float d=max((f.y-t)/sqrt(1.+dt*dt),(-f.y-b)/sqrt(1.+db*db));d=smax(d,-f.x*BL,.012*BL);return max(d,(f.x-1.02)*BL);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.15,1.));SUNC=vec3(1.0,.97,.88);WAT0=vec3(.040,.200,.185);
 KD=vec3(2.6,.78,.95);KH=vec3(2.4,.95,1.15);VEIL=vec3(.025,.12,.115);
 float sy=.006*sin(w.x*5.+T*1.2)+.003*sin(w.x*13.-T*1.9);
 // ---- the green water: the surface's bright underside at the top, shafts, a dense drift of plankton ----
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.55+.85*ss(-.6,.5,P.y));
 wc+=lightAt(z)*vec3(.70,.82,.62)*.45*shafts(w*vec2(1.,1.),T)*ss(-.7,.6,P.y);
 wc=mirrorBand(wc,w,sy,T);
 {vec2 q=(w+vec2(T*.010,T*.004))*55.;vec2 i=floor(q);vec2 o=h22(i);float r=.05+.06*h21(i+2.);float pk=ss(r,r*.3,length(fract(q)-.2-.6*o))*step(.62,h21(i+5.));
  wc+=lightAt(z+.1)*vec3(.85,.95,.70)*.40*pk;}
 wc+=lightAt(z+.15)*.18*snow(P,T);
 // the surface seen from below, receding: a soft rippled mirror, bright overhead, fading into the green
 BG=wc;float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.10,1.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*4.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.5);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  vec3 sc=WAT0*vec3(1.2,1.5,1.3)*(1.+1.0*ov)+SUNC*vec3(.70,.86,.70)*(.05+.35*ov)*(.45+.55*gl);
  vec3 tf=exp(-KH*camDist()*1.4*max(dd-.20,0.));BG=sc*tf+wc*(1.-tf);}
 // ---- the shark ----
 float op=gape(T);float x0=snoutK(T);
 pathSet(vec2(-3.,-.20),.0);PL[0]=10.;
 PP0.y+=.010*sin(T*.7);
 spinePath(x0+3.,LK,1.,0.,0.);
 float ph=TAU*.45*T;
 // the swish of the tail from side to side: the hind body bends a little in the picture, the tail seen narrower and wider
 for(int i=0;i<=NS;i++){float s=float(i)/float(NS);SP[i].y+=.006*s*s*sin(ph-TAU*.8*s);}
 if(spineNear(w)<.30*LK){vec3 f=bodyF(w);float dB=sharkD(f.xy,op);
  // the fins: tall first dorsal, long pectoral, small second dorsal, pelvic and anal; the crescent tail
  vec2 d1a=bodyPt(.355,prof(.355,TOPK)*LK-.006),d1t=bodyPt(.445,prof(.40,TOPK)*LK+.150*LK),d1b=bodyPt(.50,prof(.50,TOPK)*LK-.006);
  float dD1=sdTri(w,d1a,d1t,d1b)-.002;dD1=smin(dD1,sdCap(w,mix(d1a,d1t,.5),d1t,.010*LK,.002),.006);
  vec2 pa=bodyPt(.27,-prof(.27,BOTK)*LK*.55),pt=bodyPt(.40,-prof(.40,BOTK)*LK-.12*LK),pb=bodyPt(.35,-prof(.35,BOTK)*LK*.75);
  float dP=sdTri(w,pa,pt,pb)-.002;
  float dD2=sdTri(w,bodyPt(.66,prof(.66,TOPK)*LK-.004),bodyPt(.71,prof(.70,TOPK)*LK+.040*LK),bodyPt(.72,prof(.72,TOPK)*LK-.004))-.001;
  float dA=sdTri(w,bodyPt(.67,-prof(.67,BOTK)*LK+.004),bodyPt(.73,-prof(.72,BOTK)*LK-.035*LK),bodyPt(.74,-prof(.74,BOTK)*LK+.004))-.001;
  float dV=sdTri(w,bodyPt(.53,-prof(.53,BOTK)*LK+.004),bodyPt(.60,-prof(.58,BOTK)*LK-.045*LK),bodyPt(.61,-prof(.61,BOTK)*LK+.004))-.001;
  vec2 tp=bodyPt(.985,0.);vec2 td=bodyDir(.96);vec2 tn=vec2(-td.y,td.x);float sw=.62+.38*abs(cos(ph));
  // the crescent tail: two curved blades from the tail stock, the upper the longer
  vec2 cu=tp-td*.17*LK*sw+tn*.25*LK,cl=tp-td*.13*LK*sw-tn*.16*LK;
  vec2 mu=tp-td*.04*LK*sw+tn*.11*LK,ml_=tp-td*.035*LK*sw-tn*.07*LK;
  float dC=min(min(sdCap(w,tp,mu,.040*LK,.024*LK),sdCap(w,mu,cu,.024*LK,.003*LK)),min(sdCap(w,tp,ml_,.036*LK,.020*LK),sdCap(w,ml_,cl,.020*LK,.003*LK)));
  dC=max(dC,-sdCap(w,tp-td*.20*LK*sw,tp-td*.24*LK*sw,.15*LK*sw,.15*LK*sw));     // the trailing edge cut into a crescent
  float dF=min(min(min(dD1,dP),min(dD2,dA)),min(dV,dC));
  dB=smin(dB,dC,.012*LK);float dAll=min(dB,dF);float a=covW(dAll);
  if(a>.001){float zz=max(-w.y,0.);
   vec3 E=lightAt(zz)*1.7;vec3 amb=waterCol(zz)*1.3+vec3(.010,.016,.014);
   float tt=prof(f.x,TOPK)*BL,bb=botK(f.x,op)*BL;float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);vec3 n=tubeN(f.xy,u);
   vec2 q=vec2(f.x*LK*14.,f.y*30.);float m=fbm(q);
   vec3 alb=mix(vec3(.30,.30,.28),vec3(.10,.10,.09),ss(-.4,.4,u+.2*(m-.5)));alb*=.85+.30*m;
   alb=mix(alb,vec3(.40,.40,.37),ss(.62,.80,fbm(q*1.7+3.))*.30);
   vec3 c=lit(alb,n,E,amb,.30)+rimL(n,E,.35);
   c+=E*.25*caust(w*5.,T*.8)*sat(u+.3)*exp(-zz*2.5);
   // the gill slits: five long curved slits almost round the head; with the mouth open they flare and show the red-white arches
   for(int g=0;g<5;g++){float yv=f.y/LK;float sg=.190+.027*float(g)+.9*yv*yv;float gx=(f.x-sg)*LK;float wdt=(.0012+.0040*op)*LK;
    float onG=ss(.080-.004*float(g),.066-.004*float(g),abs(yv+.003));float gd=abs(gx)-wdt;
    float inG=ss(.0015,-.0008,gd)*onG;vec3 gc=mix(vec3(.04,.03,.03),vec3(.42,.20,.18)*(E*.8+amb),op*ss(-.5,.5,-gx/wdt));
    c=mix(c,gc,inG);c*=1.-.30*ss(.005,.0,gd)*ss(.0,-.002,-gd)*onG;}
   // the eye, small, above the front of the mouth
   c=eyeC(c,w,bodyPt(.065,.012*LK),.006*LK,E,vec3(.03));
   // the mouth: shut, a line under the snout; open, a great cave ringed by the gill arches
   if(op>.02){float sx=f.x;float yU=-.010*LK;float yL=-(botK(sx,op)*LK-.012*LK);float hing=.20;
    float inX=ss(.015,.035,sx)*ss(hing,hing-.03,sx);float inY=ss(yU+.002,yU-.004,f.y)*ss(yL-.002,yL+.006,f.y);
    float cav=inX*inY*ss(.0,.25,op);
    if(cav>.001){float hgt=(yU-yL);float vy=(f.y-yL)/max(hgt,1e-4);
     vec3 cv=mix(vec3(.20,.12,.11),vec3(.03,.02,.02),ss(.04,.16,sx));
     float arch=0.;for(int r=0;r<4;r++){float ax=.075+.030*float(r)+.012*(vy-.5)*(vy-.5)*4.;arch=max(arch,ss(.0045,.0,abs(sx-ax))*(1.-.18*float(r)));}
     cv=mix(cv,vec3(.82,.76,.72),arch*.9);
     float lip=ss(.035,.018,sx)+ss(.010*LK,.0,f.y-yL)*.6;cv=mix(cv,vec3(.62,.52,.50),sat(lip));
     cv*=E*.6+amb*1.6;c=mix(c,cv,cav);}}
   float ml=abs(f.y-(-.040*LK+.010*LK*ss(.03,.15,f.x)))-.0015*LK;c*=1.-.6*ss(.002,.0,ml)*ss(.17,.13,f.x)*ss(.02,.05,f.x)*(1.-op);
   // the fins: the same skin, darker at their edges
   vec3 fc=lit(vec3(.12,.12,.11)*(.85+.3*m),normalize(vec3(0.,.3,1.)),E,amb,.2)+rimL(vec3(0.,.8,.4),E,.18);
   c=mix(c,fc,covW(dF)*ss(-.002,.002,dB));
   c*=1.-.35*edgeK(dAll);
   c=fogW(c,.06+.22*VH,zz);
   putF(c,a);}}
 // ---- the plankton drawn into the open mouth: streaks converging on it ----
 if(op>.02){vec2 mcw=bodyPt(.085,-.040*LK-.040*LK*op);vec2 hd=bodyDir(.05);vec2 r=w-mcw;float rl=length(r);float fr=dot(r/max(rl,1e-4),hd);
  if(rl<.40&&fr>-.25){float an=atan(r.y,r.x);float ai=floor(an*30.);float onA=step(.62,h21(vec2(ai,3.)));
   float dash=ss(.12,.02,abs(fract(rl*11.+T*1.6+h21(vec2(ai,7.)))-.5))*ss(.25,.05,abs(fract(an*30.)-.5));
   float z=max(-w.y,0.);putF(lightAt(z+.1)*vec3(.95,1.,.80)*.9,dash*onA*op*ss(.40,.10,rl)*ss(-.25,.2,fr)*ss(.015,.05,rl)*.45);}}
}

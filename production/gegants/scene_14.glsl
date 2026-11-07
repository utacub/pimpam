// ---- Scene 15: the whale shark (Ningaloo Reef, Western Australia, autumn; clear blue-green water just under the surface) ----
// 16 s. 2–5 out of the blue on the right comes a vast flat head, its mouth wide open, feeding as it swims: a cloud of tiny plankton
// streams into it; a little school of golden trevally keeps just ahead of the mouth. 5–10 the camera draws back as the 9 m body glides
// past, spotted and striped like a starry sky, the gill slits flaring, the top of the tall dorsal fin cutting the surface; 10–10.8 the
// mouth closes. 11–16 it tips down and glides away into the blue, the great tail sweeping (whale sharks are filter feeders, the
// largest fish in the sea; Rowat & Brooks, 2012).
const float LWS=.90;
float TOPW2[11]=float[11](.064,.092,.110,.120,.120,.112,.095,.072,.050,.032,.022);
float BOTW2[11]=float[11](.056,.084,.098,.102,.098,.088,.072,.054,.038,.026,.019);
float wsV(float T){return .21+.10*ss(11.,13.5,T);}
float wsX(float T){float x=1.55-.21*(T-2.);float u=max(T-11.,0.);x-=.10*(u<2.5?u*u/5.:1.25+(u-2.5));return x;}
float wsDive(float T){return .45*ss(11.,13.5,T);}
float wsY(float T){float g=T<11.?0.:T<13.5?pow(T-11.,2.)/5.:1.25+(T-13.5);return -.165-.26*sin(.45)*g+.004*sin(T*.6);}
float wsGape(float T){return ss(1.6,2.4,T)*(1.-ss(10.,10.8,T));}
float wsProf(vec2 f,float sgn,float gp){float e=.012;float t,dt;
 if(sgn>0.){t=prof(f.x,TOPW2)*BL;dt=(prof(f.x+e,TOPW2)-prof(f.x-e,TOPW2))/(2.*e);}
 else{float jd=gp*.016*ss(.09,.0,f.x);t=prof(f.x,BOTW2)*BL+jd*BL;dt=(prof(f.x+e,BOTW2)-prof(f.x-e,BOTW2))/(2.*e);}
 return (sgn*f.y-t)/sqrt(1.+dt*dt);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.15,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.020,.200,.300);
 KD=vec3(2.6,.52,.30);KH=vec3(2.1,.58,.36);VEIL=vec3(.015,.12,.20);
 vec3 wc=openWater(w,T,1.3,1.3);BG=wc;
 // the surface overhead
 float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.12,1.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*7.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.6);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  vec3 sc=WAT0*vec3(1.2,1.35,1.25)*(1.1+1.3*ov)+SUNC*vec3(.80,.90,.95)*(.06+.40*ov)*(.45+.55*gl);
  vec3 tf=exp(-KH*camDist()*1.4*max(dd-.25,0.));BG=sc*tf+wc*(1.-tf);}
 // ---- the shark ----
 float hx=wsX(T),hy=wsY(T);float ang=PI+wsDive(T)+.02*sin(T*.3);
 float kap=(wsDive(T+.05)-wsDive(T-.05))/.10/wsV(T);
 float beat=TAU*.28*T;
 spine(vec2(hx,hy),ang,LWS,-1.,.012,beat,kap*LWS);
 vec2 snout=SP[0];vec2 dir=bodyDir(.02);
 // plankton streaming into the open mouth
 float gp=wsGape(T);
 {vec2 rel=w-snout;float ax=dot(rel,dir);vec2 nr=vec2(-dir.y,dir.x);float ay=dot(rel,nr);
  if(gp>.01&&ax>-.01&&ax<.30&&abs(ay)<.10){vec2 pq=vec2((ax+T*.18)*55.,ay*55.*(1.+ax*4.));vec2 pi_=floor(pq);float pd=length(fract(pq)-.5-.3*(h22(pi_)-.5));
   float pa=ss(.12,.04,pd)*step(.62,h21(pi_+5.))*ss(.30,.10,ax)*ss(.10*(.3+ax*2.5),.0,abs(ay))*gp;putF(vec3(.80,.85,.78)*lightAt(-w.y)*1.2,pa*.75);}}
 float dBody=1e5;float s=0.;vec3 f=vec3(0.);
 if(spineNear(w)<.30*LWS){f=bodyF(w);s=f.x;
  dBody=max(wsProf(f.xy,1.,gp),wsProf(f.xy,-1.,gp));dBody=smax(dBody,-s*BL,.008*BL);dBody=max(dBody,(s-1.02)*BL);}
 // fins in the body frame: the big first dorsal, the small second; the pectoral; the crescent tail
 float dFin=1e5;float dPec=1e5;float dTail=1e5;
 if(spineNear(w)<.40*LWS){
  vec2 q=vec2(s*BL,f.y);float tp=prof(.60,TOPW2)*BL;
  float d1=sdTri(q,vec2(.53*BL,tp-.01*BL),vec2(.68*BL,tp-.01*BL),vec2(.66*BL,tp+.115*BL))-.006*BL;
  float tp2=prof(.82,TOPW2)*BL;float d2=sdTri(q,vec2(.79*BL,tp2-.006*BL),vec2(.86*BL,tp2-.006*BL),vec2(.86*BL,tp2+.040*BL))-.003*BL;
  dFin=min(d1,d2);
  float bp=prof(.27,BOTW2)*BL;dPec=sdTri(q,vec2(.24*BL,-bp+.02*BL),vec2(.34*BL,-bp+.012*BL),vec2(.42*BL,-bp-.13*BL))-.008*BL;
  float bp2=prof(.62,BOTW2)*BL;dPec=min(dPec,sdTri(q,vec2(.60*BL,-bp2+.006*BL),vec2(.66*BL,-bp2+.004*BL),vec2(.67*BL,-bp2-.030*BL))-.003*BL);
  // the tail: the long upper lobe, the shorter lower, narrowing as it sweeps toward and away from us
  vec2 tb=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tb);float sw=.62+.38*abs(cos(beat));
  float up=sdTri(tq,vec2(-.02*BL,.012*BL),vec2(.20*BL*sw+.01*BL,.24*BL),vec2(.05*BL,-.004*BL))-.008*BL;
  float lo=sdTri(tq,vec2(-.02*BL,-.010*BL),vec2(.13*BL*sw+.01*BL,-.15*BL),vec2(.05*BL,.004*BL))-.008*BL;
  dTail=smin(up,lo,.02*BL);dTail=max(dTail,-sdEll(tq-vec2(.24*BL*sw,.0),vec2(.14*BL*sw,.10*BL)));}
 float dAll=min(min(dBody,dFin),min(dPec,dTail));
 // the top of the first dorsal fin out in the air is hidden
 float above=ss(-.003,.006,w.y);
 float a=covW(min(dBody,min(dPec,dTail)))+covW(dFin)*(1.-above);a=sat(a);
 if(a>.002){float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.55;vec3 amb=waterCol(zz)*.95+vec3(.006,.012,.018);
  float tt=prof(s,TOPW2)*BL,bb=prof(s,BOTW2)*BL;float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);
  vec3 n=tubeN(f.xy,u*.95);
  // the starry pattern: white spots in a grid broken by pale vertical stripes on the back and flanks; the head finely spotted; the belly white
  vec2 wq=vec2(s*BL,f.y);float cs=mix(.011,.018,ss(.05,.30,s));vec2 cq=wq/cs;vec2 ci=floor(cq);vec2 cf=fract(cq)-.5-.30*(h22(ci)-.5);
  float spot=ss(.22,.13,length(cf))*step(.25,h21(ci+3.));
  float strp=ss(.05,.015,abs(fract(s*BL/(cs*2.)+.25*vn(vec2(f.y*30.,s*4.)))-.5))*ss(.18,.30,s)*ss(.75,.55,s)*.6;
  vec3 back=vec3(.045,.070,.100),belly=vec3(.74,.74,.72);
  vec3 alb=mix(belly,back*(.90+.20*fbm(wq*40.)),ss(-.50,-.20,u));
  float pat=ss(-.30,-.05,u)*ss(1.2,.4,length(fwidth(cq)));alb=mix(alb,vec3(.70,.74,.76),max(spot,strp)*pat*.80);
  // three ridges along each flank
  for(int r=0;r<3;r++){float ry=mix(.75,.15,float(r)/2.);float rl=ss(.035,.0,abs(u-ry))*ss(.22,.32,s)*ss(.92,.80,s);n=normalize(n+vec3(bodyNrm(s)*rl*.25,0.));alb*=1.+.12*rl;}
  if(dFin<min(dBody,min(dPec,dTail))+.002||dTail<dBody||dPec<dBody){alb=back*(.95+.15*fbm(wq*30.));float fs=ss(-.002,.004,dBody);alb=mix(alb,mix(back,vec3(.70,.74,.76),spot*.8),.6);n=normalize(vec3(0.,.3,1.));}
  vec3 c=lit(alb,n,E,amb,.20)+rimL(n,E,.14);
  c+=E*.30*caust(w*4.+vec2(T*.05,0.),T*.8)*sat(u+.2)*exp(-zz*3.);
  // the gill slits: five long dark slits, opening a little as the water goes out through them
  if(dBody<0.){float gx=(s-.205)/.016;float gi=floor(gx);float gf=fract(gx)-.5;float op=.10+.06*gp*(.5+.5*sin(T*2.4-gi*.6));
   float slit=ss(op,op*.4,abs(gf+.12*u))*step(0.,gi)*step(gi,4.)*ss(.85,.55,abs(u+.05));c*=1.-.65*slit;}
  // the small eye behind the corner of the mouth; the open mouth: a dark oval at the front of the flat head
  c=eyeC(c,w,bodyPt(.085,.010*BL),.0065*BL,E,vec3(.03));
  if(gp>.01){vec2 mc=bodyPt(.006,-.010*BL);vec2 mq=rot(-atan(dir.y,dir.x))*(w-mc);float md=sdEll(mq,vec2(.012*BL,(.008+.036*gp)*BL));
   c=mix(c,vec3(.020,.025,.030)+lightAt(zz)*.04,ss(.003*BL,-.002*BL,md));c=mix(c,vec3(.55,.56,.55)*lightAt(zz),ss(.004*BL,.0,abs(md))*.35);}
  else{float ml=abs(f.y+.012*BL);c*=1.-.5*ss(.003*BL,.001*BL,ml)*ss(.075,.06,s);}
  // remoras on the belly
  for(int r=0;r<2;r++){vec2 rp=bodyPt(r==0?.44:.57,-prof(r==0?.44:.57,BOTW2)*BL-.004*BL);vec2 rq=rot(-atan(dir.y,dir.x))*(w-rp);float rd=sdEll(rq-vec2(.020*BL,0.),vec2(.030*BL,.0055*BL));
   c=mix(c,lit(vec3(.12,.12,.13),normalize(vec3(0.,-.3,1.)),E,amb,.2),covW(rd));}
  c*=1.-.28*edgeK(dAll);
  c=fogW(c,.04+.10*VH+2.8*ss(12.,16.,T)*ss(12.,16.,T),zz);
  putF(c,a);}
 // ---- the golden trevally just ahead of the mouth ----
 for(int i=0;i<12;i++){float fi=float(i);float h1=h11(fi*1.7),h2=h11(fi*2.9+1.),h3=h11(fi*4.3+2.);
  float ahead=.05+.17*h1+.025*sin(T*(1.1+h3)+fi);float side=(h2-.5)*.13+.02*sin(T*(1.7+h1)+fi*2.);
  vec2 fp=snout+dir*ahead+vec2(-dir.y,dir.x)*side;float dart=.30*sin(T*(1.3+h2)+fi*3.);vec2 fd=rot(dart*.4)*dir;
  vec2 lq=rot(-atan(fd.y,fd.x))*(w-fp);float L=.026*(.8+.4*h3);
  float d=min(sdEll(lq,vec2(L*.5,L*.20)),sdTri(lq,vec2(-L*.42,0.),vec2(-L*.72,L*.18),vec2(-L*.72,-L*.18)));float aa=covW(d)*ss(2.,3.,T)*(1.-ss(12.,13.5,T));
  if(aa>.002){float zz=max(-w.y,0.);float uu=clamp(lq.y/(L*.20),-1.,1.);float bars=ss(.15,.05,abs(fract(lq.x/(L*.22))-.5))*ss(.4,.1,abs(lq.x/L))*.5;
   vec3 al=mix(vec3(.85,.66,.12),vec3(.95,.86,.40),ss(.2,-.6,uu));al=mix(al,vec3(.10,.08,.04),bars*ss(-.6,.2,uu));
   vec3 c=lit(al,normalize(vec3(0.,uu*.8,.6)),lightAt(zz)*1.5,waterCol(zz)*.9,.5);c=eyeC(c,lq,vec2(L*.32,L*.03),L*.06,lightAt(zz),vec3(.05));
   putF(fogW(c,.04+.10*VH,zz),aa);}}
}

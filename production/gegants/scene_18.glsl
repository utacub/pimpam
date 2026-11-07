// ---- Scene 19: the orcas (the Southern Ocean, Antarctica; deep blue water under drifting pack ice) ----
// 2–6 s a family of orcas comes up out of the deep from the left, one behind the other at different distances: three females, a
// calf at its mother's side and, nearest, a big male with his tall dorsal fin. 6.2–8.4 one after another they rise into the open
// lead between the floes, arch over at the surface to breathe (their backs and fins go up through it, rings spread) and curve back
// down; 8.5–12.5 they glide away down to the right into the blue, the male last, close past us. Light pours down through the lead.
// Each orca has its own distance (scaled about the waterline, so the surface is the same for all) and its own path: a straight rise,
// an arc over the top at the surface, a straight dive.
const float ORA=.42;                    // the angle of the rise and of the dive
float TOPO[11]=float[11](.040,.088,.108,.116,.115,.106,.090,.068,.046,.028,.016);
float BOTO[11]=float[11](.046,.090,.110,.116,.111,.100,.082,.060,.038,.022,.013);
const vec2 LEAD=vec2(.26,.22);          // the open lead: centre x and half-width (in the ceiling plane)
// orca i (far to near): x of its apex, apex time, distance, length, kind (0 male, 1 female, 2 calf)
void orcI(int i,out float xa,out float ta,out float m,out float L,out float kind){
 if(i==0){xa=.14;ta=6.2;m=1.75;L=.31;kind=1.;}
 else if(i==1){xa=.36;ta=6.8;m=1.45;L=.32;kind=1.;}
 else if(i==2){xa=.18;ta=7.3;m=1.15;L=.33;kind=1.;}
 else if(i==3){xa=.12;ta=7.5;m=1.10;L=.19;kind=2.;}
 else{xa=.30;ta=7.9;m=.80;L=.42;kind=0.;}}
// its path: up at ORA, over the top in an arc of radius r (the top just under the surface), down at -ORA
void orcPath(float xa,float r){float l1=1.6;vec2 A=vec2(xa,-.020);vec2 A0=A-vec2(r*sin(ORA),r*(1.-cos(ORA)));
 pathSet(A0-l1*vec2(cos(ORA),sin(ORA)),ORA);PL[0]=l1;PL[1]=r*2.*ORA;PK[1]=-1./r;PL[2]=4.;}
float orcArcA(float r){return 1.6+r*ORA;}
// One orca on the current spine (world wk of its own distance)
void orcDraw(vec2 w,float T,float L,float kind,float m){
 if(spineNear(w)>.40*L)return;
 vec3 f=bodyF(w);float s=f.x;float dB=bodyD(f.xy,TOPO,BOTO);
 {vec2 hd=bodyDir(.05);vec2 hq=rot(atan(hd.y,hd.x))*(w-bodyPt(.070,-.004*L));dB=smin(dB,sdEll(hq,vec2(.072,.088)*L),.02*L);}
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.15*L,.10+.16*abs(sin(TAU*.80*T-1.)),0.);
 // the dorsal fin: tall and straight on the male, curved back on the females and the calf
 float dD;{float s0=.30,s1=kind<.5?.42:.44;vec2 b0=bodyPt(s0,prof(s0,TOPO)*L*.85),b1=bodyPt(s1,prof(s1,TOPO)*L*.85);vec2 nr=bodyNrm(.36),dv=bodyDir(.36);
  if(kind<.5){vec2 tip=bodyPt(.345,prof(.345,TOPO)*L)+nr*.21*L-dv*.015*L;dD=sdTri(w,b0,tip,b1);}
  else{float h=(kind>1.5?.08:.11)*L;vec2 tip=bodyPt(.37,prof(.37,TOPO)*L)+nr*h-dv*.075*L;dD=sdTri(w,b0,tip,b1);
   vec2 cc=mix(tip,b1,.5)-dv*.05*L+nr*.01*L;dD=max(dD,-(length(w-cc)-.048*L))-.003*L;dD=min(dD,sdCap(w,mix(b0,tip,.5),tip,.012*L,.005*L));}}
 // the paddle flipper
 vec2 dv2=bodyDir(.22),nr2=bodyNrm(.22);vec2 fa=bodyPt(.22,-prof(.22,BOTO)*L*.55);vec2 ft=fa-dv2*.10*L-nr2*(kind<.5?.13:.09)*L;
 vec2 fd=ft-fa;float fl=length(fd);vec2 lq=rot(atan(fd.y,fd.x))*(w-fa);
 float dF=max(sdEll(lq-vec2(fl*.55,0.),vec2(fl*.60,(kind<.5?.040:.030)*L)),-lq.x);
 float dS=min(min(dB,dK),dD);float a=covW(min(dS,dF))*ss(.003,-.001,w.y);
 if(a<.002)return;
 float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.50;vec3 amb=waterCol(zz)*.95+vec3(.004,.008,.014);
 float u=bodyU(f.xy,TOPO,BOTO);vec3 n=tubeN(f.xy,u);
 if(dD<dB&&dD<dK)n=normalize(vec3(bodyNrm(.36)*.15,1.));
 vec3 blk=vec3(.014,.016,.020),wht=kind>1.5?vec3(.86,.70,.52):vec3(.82,.84,.86);
 vec3 alb=blk;
 // the white chin and belly, the white flank patch reaching up and back, the eyepatch, the grey saddle behind the fin
 float bel=ss(-.30,-.42,u)*ss(.00,.05,s)*ss(.56,.48,s);
 float flk=ss(.03,-.03,u-(-.30+.62*exp(-pow((s-.64)/.075,2.))))*ss(.46,.54,s)*ss(.80,.74,s);
 vec2 eq=vec2((s-.185)/.060,(u-.30-.35*(s-.185)/.06*.15)/.13);float eye=ss(1.,.80,length(eq));
 float sad=ss(.50,.75,u)*ss(.40,.44,s)*ss(.56,.50,s)*(dB<dD?1.:0.);
 float wm=max(max(bel,flk),eye)*(dD<dB&&dD<dK?0.:1.)*(dF<dS?0.:1.);
 alb=mix(alb,wht,wm);alb=mix(alb,vec3(.30,.32,.36),sad*.8);
 vec3 c=lit(alb,n,E,amb,.30)+rimL(n,E,.16);
 if(dF<dS)c=lit(blk*1.4,normalize(vec3(-nr2*.3,1.)),E,amb,.25)*(1.-.30*edgeK(dF));
 // the small eye, just below and in front of the eyepatch
 c=eyeC(c,w,bodyPt(.120,-.006*L),.0055*L,E,vec3(.02));
 c+=E*.12*caust(w*5.+vec2(T*.05,0.),T*.8)*sat(n.y*.8+.3)*exp(-zz*4.);
 c*=1.-.35*edgeK(min(dS,dF));
 putF(fogW(c,.06+.11*VH*m+.25*(m-1.),zz),a);
}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.10,1.));SUNC=vec3(1.0,.98,.95);WAT0=vec3(.008,.060,.140);
 KD=vec3(2.6,.62,.30);KH=vec3(2.2,.66,.36);VEIL=vec3(.006,.05,.11);
 float yw=-CAM.y/VH;
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.40+1.0*ss(-.75,.50,P.y));
 // the light pouring down through the lead
 float lx=(LEAD.x-CAM.x)/VH;float beam=exp(-pow((P.x-lx+(P.y-yw)*.18)/(.30+.12*(yw-P.y)),2.));
 wc+=lightAt(z)*vec3(.60,.80,1.)*(.10+.45*shafts(w*vec2(1.4,1.),T*.7))*beam*ss(-.8,.3,P.y);
 wc+=lightAt(z*.7+.1)*.22*snow(P,T);
  wc*=1.-.35*ss(-.3,.3,P.y)*(1.-beam);
 vec3 c=wc;
 // the surface overhead: pack ice seen from below (dark, its thin edges glowing), the bright open lead, small pieces in it
 vec3 sp=planeAt(0.,yw-.08,1.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X+T*.012,Zw)*2.6;float fw=length(fwidth(q));
  float lead=ss(LEAD.y,LEAD.y-.10,abs(X-LEAD.x-.10*sin(Zw*2.2)+.05*(fbm(q*.8)-.5)));
  float fb=fbm(q*.55+3.)+.10*fbm(q*3.);float floe=ss(.34,.38,fb)*(1.-lead);float ed=ss(.34,.46,fb);
  float rid=exp(-voroE(q*1.3+.4*vec2(fbm2(q),fbm2(q+4.)),0.)*18.)*ss(.6,.2,fw)*floe;
  float brash=ss(.64,.68,fbm(q*5.+11.))*lead*ss(.9,.3,fw);
  vec2 rq=q*3.;rq+=.35*vec2(vn(rq*.8+T*.15),vn(rq*.8+5.-T*.12));float gl=exp(-voroE(rq,T*.6)*4.5)*ss(.6,.15,length(fwidth(rq)));
  float ov=ss(1.8,.30,dd);
  vec3 open=WAT0*vec3(1.4,1.6,1.4)*(1.2+1.4*ov)+SUNC*vec3(.70,.88,1.)*(.10+.42*ov)*(.45+.55*gl);
  vec3 ice=vec3(.020,.060,.105)*(.70+.50*fbm(q*3.))+vec3(.07,.06,.02)*ss(.55,.75,fbm(q*1.7+9.))*.6;
  ice=mix(ice,vec3(.012,.035,.065),rid*.6);
  ice+=vec3(.25,.50,.65)*.45*(1.-ed)*(1.-lead);              // the thin edges let the light through
  vec3 sc=mix(open,ice,floe);sc=mix(sc,vec3(.05,.10,.16),brash*.8);
  // the rings of the breaths
  float ring=0.;for(int i=0;i<5;i++){float xa,ta,m,L,kd;orcI(i,xa,ta,m,L,kd);
   float age=sat((T-ta-.15)/1.8);vec2 rr=vec2(X-xa-.02,(dd-m)*1.2*VH);float r0=length(rr);
   ring+=(1.-age)*step(.001,age)*exp(-pow((r0-.01-.22*age)/(.006+.010*age),2.))*(1.-floe);}
  sc+=SUNC*vec3(.80,.92,1.)*(.10+.40*ov)*1.6*ring;
  vec3 tf=exp(-KH*camDist()*.55*max(dd-.25,0.));c=sc*tf+wc*(1.-tf);}
 BG=c;
 // ---- the orcas, far to near ----
 float wpx0=WPX;
 for(int i=0;i<5;i++){float xa,ta,m,L,kd;orcI(i,xa,ta,m,L,kd);
  vec2 wk=vec2(CAM.x+P.x*VH*m,(P.y-yw)*VH*m);WPX=wpx0*m;
  float r=kd>1.5?.40:.60;float v=kd<.5?.30:.32;
  orcPath(xa,r);float aa=orcArcA(r)+v*(T-ta);
  spinePath(aa,L,1.,.05,TAU*(kd>1.5?1.1:.80)*T+float(i));
  orcDraw(wk,T,L,kd,m);
  // the white water where the back and the fin go up through the surface
  float k=ss(ta-.45,ta-.15,T)*(1.-ss(ta+.35,ta+.9,T));
  if(k>.001&&wk.y<.004){vec2 q=vec2((wk.x-xa-.03)/(.16*L/.33),(wk.y+.006)/.020);float e=length(q)+.5*(fbm(wk*vec2(40.,50.)+vec2(0.,-T*2.))-.5);
   putF(lightAt(.02)*vec3(.80,.90,.98)*.95,ss(1.,.4,e)*k*.75*ss(.004,-.002,wk.y));}}
 WPX=wpx0;
}

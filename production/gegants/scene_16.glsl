// ---- Scene 17: the dugong (Shark Bay, Western Australia; shallow green-blue water over a seagrass meadow) ----
// 2–8.4 s a dugong comes in from the right along the bottom, grazing: its broad down-turned snout rooting in the seagrass, small
// clouds of sand puffing up each time, the blades swaying round it, a bare furrow left behind it, golden trevally keeping by its
// head. 8.4–10.6 it lifts off and rises to the surface; 10.6–11.3 its snout touches the surface to breathe and rings spread;
// 11.3–14 it glides away down to the left with a beat of its tail. Dugongs are fully aquatic herbivores (Marsh et al., 2011).
// The meadow is drawn as rows of blades in perspective: the rows behind the dugong first, the rows in front of it after it.
const float LDG=.30;
const float FLR=-.40;
const float HZG=.12;
const int MDN=16;
float TOPD[11]=float[11](.030,.068,.096,.114,.124,.124,.114,.094,.068,.042,.022);
float BOTD[11]=float[11](.044,.066,.096,.122,.136,.132,.116,.090,.062,.038,.020);
vec2 dgHead(float T){
 if(T<8.4){float x=.82-.095*(T-2.);float ry=.010*(.5-.5*cos(TAU*(T-2.)/1.3));return vec2(x,FLR+.022+ry);}
 if(T<10.6){float u=(T-8.4)/2.2;float e=u*u*(3.-2.*u);return vec2(mix(.212,-.10,e),mix(FLR+.022,-.026,e));}
 if(T<11.3){float u=(T-10.6)/.7;return vec2(-.10-.03*u,-.026+.007*sin(PI*u));}
 float v=T-11.3;return vec2(-.13-.18*v-.06*v*v,-.026-.05*v*v/(1.+.3*v));}
float dgAng(float T){float g=PI+.32;float r=PI-.55;float l=PI+.24;
 if(T<8.2)return g+.04*sin(TAU*(T-2.)/1.3);
 if(T<9.9)return mix(g,r,ss(8.2,9.3,T));
 if(T<11.3)return mix(r,PI-.02,ss(9.9,10.6,T));
 return mix(PI-.02,l,ss(11.3,12.6,T));}
float dgPf(float s,bool top){return top?prof(s,TOPD):prof(s,BOTD);}
// the meadow's patches: 1 where the seagrass grows, 0 on the bare sand (the floor and the blades share it)
float mdGr(vec2 q){return ss(.22,.36,.65*vn(q*.6+2.)+.35*vn(q*1.4+7.));}
float mdDep(int k){return .60*pow(1.13,float(k));}
// x the dugong has grazed up to (the furrow runs from there back to the right)
float mdEat(float T){return dgHead(min(T,8.4)).x+.02;}
// one row of seagrass blades on the floor at depth dd (1 = the dugong's distance)
void mdRow(int k,float T,float sy0,vec2 hd,float graze){
 float dd=mdDep(k);float yb0=HZG+sy0/dd;
 if(P.y<yb0-.012/dd||P.y>yb0+.075/(VH*dd))return;
 float X=CAM.x+P.x*VH*dd;const float S=.0105;float pxw=WPX*dd;
 float fade=ss(1.6,3.5,S/pxw);if(fade<.01)return;
 float ci=floor(X/S);float fk=float(k);float zf=-FLR;vec3 E=lightAt(zf);vec3 amb=waterCol(zf);
 float eat=mdEat(T);
 for(int j=-2;j<=2;j++){float i=ci+float(j);
  float h1=h11(i*1.31+fk*17.7),h2=h11(i*.73+fk*5.1+3.),h3=h11(i*2.17+fk*9.3+7.);
  float xb=(i+.5+.7*(h1-.5))*S;
  float clump=.55+.90*vn(vec2(xb*13.,fk*1.7));
  float H=(.018+.026*h3)*clump*(.15+.85*mdGr(vec2(xb,dd*1.2*VH)*5.));
  // the furrow behind the grazing dugong: cropped to stubs
  float tr=ss(.18,.08,abs(dd-1.))*ss(eat-.01,eat+.05,xb);H*=1.-.85*tr;
  float yb=HZG+sy0/(dd*(1.+.08*(h2-.5)));
  float t=(P.y-yb)*VH*dd/H;if(t<0.||t>1.)continue;
  // one slow wave runs through the whole meadow, each blade flutters a little; round the snout they are pushed aside
  float sw=.30*sin(T*.9-xb*5.+fk*.3)+.12*sin(T*2.1+h1*TAU);
  float near=graze*exp(-pow((xb-hd.x+.02)/.05,2.))*ss(.25,.05,abs(dd-1.));
  sw+=near*.65*sign(xb-hd.x+.02)*(.65+.35*sin(T*4.8));
  float xc=xb+sw*H*t*t;float hw=(.0016+.0010*h1)*(1.-.80*t*t);
  float dx=abs(X-xc)/sqrt(1.+4.*sw*sw*t*t)-hw;
  float a=ss(pxw,-pxw,dx)*fade;if(a<.01)continue;
  vec3 gc=mix(vec3(.05,.10,.04),vec3(.24,.38,.13)*(.80+.40*h3),t);
  gc=gc*(E*1.15+amb*.5)+E*vec3(.50,.66,.30)*.10*t*t*t;
  // the side of the blade turned to the light is a little brighter
  gc*=1.+.20*sign(X-xc)*sign(sw+.01);
  putF(fogW(gc,camDist()*.9*dd,zf*.6),a*(.90+.10*t));}
}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.20,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.024,.170,.170);
 KD=vec3(2.4,.55,.55);KH=vec3(2.2,.70,.75);VEIL=vec3(.02,.13,.13);
 float z=max(-w.y,0.);vec3 wc=waterCol(z)*(.60+.80*ss(-.6,.6,P.y));
 wc+=lightAt(z)*vec3(.70,.80,.65)*.30*shafts(w*vec2(1.2,1.),T)*ss(-.6,.6,P.y);wc+=lightAt(z+.1)*.22*snow(P,T);
 // the surface overhead
 float yw=-CAM.y/VH;vec3 sp=planeAt(0.,yw-.10,1.);vec3 c=wc;
 vec2 brc=dgHead(10.8)+vec2(-.035,0.);
 if(sp.z>.5){float dd=sp.y;float X=sp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*8.;q+=.35*vec2(vn(q*.8+T*.15),vn(q*.8+5.-T*.12));
  float fw=length(fwidth(q));float rip=voroE(q,T*.6);float gl=exp(-rip*4.5)*ss(.6,.15,fw);float ov=ss(1.8,.30,dd);
  // the rings where the dugong breathes
  vec2 rq=vec2(X-brc.x,(dd-1.)*1.2*VH);float rr=length(rq);float ring=0.;
  for(int i=0;i<3;i++){float age=sat((T-10.75-float(i)*.30)/1.6);ring+=(1.-age)*step(.001,age)*exp(-pow((rr-.008-.20*age)/(.005+.010*age),2.));}
  float spot=ss(10.6,10.8,T)*(1.-ss(11.1,11.6,T))*exp(-rr*rr/.0004);
  vec3 sc=WAT0*vec3(1.2,1.35,1.25)*(1.1+1.3*ov)+SUNC*vec3(.80,.90,.95)*(.06+.40*ov)*(.45+.55*gl+1.6*ring+1.2*spot);
  vec3 tf=exp(-KH*camDist()*1.4*max(dd-.25,0.));c=sc*tf+wc*(1.-tf);}
 // the meadow floor: dark green, patches of pale sand, the furrow the dugong leaves
 float sy0=(FLR-CAM.y)/VH-HZG;vec3 fp=planeAt(FLR,HZG,1.);
 if(fp.z>.5){float dd=fp.y;float X=fp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*5.;float fw=length(fwidth(q));
  float gr=mdGr(q);float tr=ss(.16,.07,abs(dd-1.))*ss(mdEat(T)-.01,mdEat(T)+.05,X);
  vec3 sand=vec3(.66,.58,.42)*(.78+.30*fbm(q*3.))*(.80+.20*gr);
  vec3 grass=vec3(.09,.16,.07)*(.70+.60*fbm(q*4.+vec2(T*.3,0.))*ss(1.5,.4,fw));
  vec3 g=mix(sand,grass,gr*(1.-.85*tr));float zf=-FLR;
  vec3 lc=g*(lightAt(zf)*1.15+waterCol(zf)*.6)+lightAt(zf)*.07*(1.-gr*.6)*caust(vec2(X,Zw)*4.,T*.8)*ss(1.6,.4,fw);
  vec3 tf=exp(-KH*camDist()*.9*dd);c=lc*tf+c*(1.-tf);}
 BG=c;
 vec2 hd=dgHead(T);float graze=1.-ss(8.2,8.8,T);
 // the meadow behind the dugong
 for(int k=MDN-1;k>=4;k--)mdRow(k,T,sy0,hd,graze);
 // sand puffs where the snout roots (one at each grazing bob), spreading low and settling, behind the head
 for(int k=0;k<6;k++){float tk=2.6+1.3*float(k);float age=T-tk;if(age<0.||age>3.2||tk>8.2)continue;
  vec2 pc=dgHead(tk)+vec2(-.034+.010*age,-.016+.014*age/(1.+age));vec2 r=vec2(.022+.026*age,.012+.010*age);
  vec2 q=(w-pc)/r;float hz=ss(1.,.15,length(q)+.45*(fbm(w*22.+age*.6)-.5))*(1.-ss(.8,3.0,age))*ss(.0,.12,age);
  vec3 scl=vec3(.66,.61,.49)*(lightAt(-FLR)*1.05+.05);putF(fogW(scl,.06+.12*VH,-FLR*.6),hz*.92);}
 // ---- the dugong ----
 float ang=dgAng(T);float beat=TAU*.45*T;float amp=.04+.08*ss(8.5,9.3,T)*(1.-ss(10.,10.6,T))+.08*ss(11.3,12.,T);
 spine2(hd,ang,LDG,-1.,amp,beat,.10*ss(8.2,9.3,T)*(1.-ss(9.9,10.6,T)),-.18*(1.-ss(8.2,8.9,T)));
 if(spineNear(w)<.32*LDG){vec3 f=bodyF(w);float s=f.x;
  float e=.012;float tt=dgPf(s,true)*BL,bb=dgPf(s,false)*BL;
  float dt1=(dgPf(s+e,true)-dgPf(s-e,true))/(2.*e),dt2=(dgPf(s+e,false)-dgPf(s-e,false))/(2.*e);
  float d=max((f.y-tt)/sqrt(1.+dt1*dt1),(-f.y-bb)/sqrt(1.+dt2*dt2));d=smax(d,-s*BL,.020*BL);d=max(d,(s-1.02)*BL);
  // the snout: a broad block bent down at the front, its flat bristly disc facing the floor
  vec2 lb=vec2(s*BL,f.y)-vec2(.050,-.034)*BL;vec2 ua=normalize(vec2(1.,.42));lb=vec2(dot(lb,ua),dot(lb,vec2(-ua.y,ua.x)));
  float dsn=sdBox(lb,vec2(.044,.020)*BL)-.016*BL;d=smin(d,dsn,.018*BL);
  // the flukes, edge-on, like a whale's
  vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.21*LDG,.14+.30*abs(sin(beat-1.)),0.);
  // the paddle flipper, held back along the belly
  vec2 dv=bodyDir(.22);vec2 fn=bodyNrm(.22);vec2 fa=bodyPt(.22,-dgPf(.22,false)*BL*.45);vec2 ft=fa-dv*.070*LDG-fn*(.075+.012*sin(T*1.3))*LDG;
  float dF=min(sdCap(w,fa,ft,.016*LDG,.020*LDG),sdEll(rot(atan(ft.y-fa.y,ft.x-fa.x))*(w-mix(fa,ft,.75)),vec2(.040,.022)*LDG));
  float dB=min(d,dK);float a=covW(min(dB,dF));
  // nothing shows above the surface (from below, the surface hides it)
  a*=ss(.003,-.001,w.y);
  if(a>.002){float zz=max(-w.y,0.);vec3 E=lightAt(zz)*1.05;vec3 amb=waterCol(zz)*.95+vec3(.006,.010,.010);
   float u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);vec3 n=tubeN(f.xy,u);
   vec2 q=vec2(s*BL*30.,f.y*60.);float m=fbm(q);
   // grey-brown above, paler below
   vec3 alb=mix(vec3(.30,.27,.23),vec3(.15,.13,.115),ss(-.5,.4,u+.15*(m-.5)))*(.90+.20*m);
   alb=mix(alb,vec3(.40,.37,.32),ss(.82,.90,vn(q*vec2(.5,2.)+4.))*.30);      // pale scars
   float disc=ss(.004*BL,-.010*BL,lb.y+.010*BL)*ss(.0,-.006*BL,dsn);          // the underside of the snout
   alb=mix(alb,vec3(.15,.12,.10)*(.8+.4*h21(floor(w*900.))),disc*.75);
   vec3 col=lit(alb,n,E,amb,.12)+rimL(n,E,.13);
   col+=E*.22*caust(w*6.+vec2(T*.05,0.),T*.8)*sat(u+.3)*exp(-zz*3.);
   col=eyeC(col,w,bodyPt(.115,.028*BL),.0060*LDG,E,vec3(.03));
   // the nostrils on top of the snout
   col*=1.-.45*ss(.005*LDG,.0015*LDG,length(w-bodyPt(.022,.034*BL)));
   vec3 fc=lit(vec3(.17,.15,.13),normalize(vec3(-fn*.35,1.)),E*.75,amb,.12)*(1.-.35*edgeK(dF));col=mix(col,fc,covW(dF));
   col*=1.-.30*edgeK(min(dB,dF));
   col=fogW(col,.05+.12*VH,zz);putF(col,a);}}
 // the meadow in front of the dugong
 for(int k=3;k>=0;k--)mdRow(k,T,sy0,hd,graze);
 // golden trevally keeping by its head
 for(int i=0;i<6;i++){float fi=float(i);vec2 fp=hd+vec2(-.05-.10*h11(fi)+.02*sin(T*1.3+fi),.025+.05*h11(fi+3.)+.015*sin(T*1.7+fi*2.));fp.y=min(fp.y,-.030-.03*h11(fi+7.));
  vec2 fd=vec2(-1.,.15*sin(T*1.1+fi));vec2 lq=rot(-atan(fd.y,fd.x))*(w-fp);float L=.022;
  float d=min(sdEll(lq,vec2(L*.5,L*.25)),max(sdTri(lq,vec2(-L*.40,0.),vec2(-L*.76,L*.24),vec2(-L*.76,-L*.24)),-sdEll(lq-vec2(-L*.80,0.),vec2(L*.12,L*.10))));float aa=covW(d);
  if(aa>.002){float uu=clamp(lq.y/(L*.25),-1.,1.);vec3 al=mix(vec3(.92,.60,.06),vec3(.98,.86,.42),ss(.2,-.6,uu));al*=1.-.55*ss(.22,.08,abs(abs(lq.x/L+.05)-.16))*ss(-.9,-.3,uu);
   vec3 cc=lit(al,normalize(vec3(0.,uu*.8,.6)),lightAt(.3)*1.3,waterCol(.3)*.9,.5);putF(fogW(cc,.04+.10*VH,.3),aa);}}
}

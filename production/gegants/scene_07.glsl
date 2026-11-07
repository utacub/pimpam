// ---- Scene 8: the fin whale (the Pelagos Sanctuary, Ligurian Sea, summer) ----
// 2–4 s the long slender fin whale, 20 m, comes in fast from the right, close and low under the camera; 3.6–6.6 it rolls right over
// onto its side, showing its white belly, its grooved throat and the white of its right lower jaw (the fin whale is coloured
// asymmetrically: the right lower jaw white, the left dark; the source for this is still to be checked); it rights itself and rises; 8.6 the head
// breaks the surface and it blows, a tall narrow column; the back rolls over, the small hooked dorsal fin shows, and it goes on
// down and out to the left, fast. The camera pans with it and rises to the waterline for the blow.
const float LF=2.0;
float TOPF[11]=float[11](.010,.030,.046,.054,.057,.056,.051,.043,.031,.019,.010);
float BOTF[11]=float[11](.012,.034,.052,.060,.062,.058,.049,.038,.027,.016,.010);
float SYMF[11]=float[11](.011,.034,.050,.058,.060,.057,.050,.040,.029,.017,.010);
const vec2 F0=vec2(4.2715,-.5499);const float FAP=4.3636;
void pathF(){pathSet(F0,PI);PL[0]=2.4;PL[1]=.60;PK[1]=-.75;PL[2]=.40;PL[3]=1.5;PK[3]=.467;PL[4]=6.;}
float vIntF(float T){float tk[5]=float[5](2.,7.6,8.4,9.8,10.6);float vk[5]=float[5](.55,.55,.30,.30,.80);
 float a=0.;if(T<2.)return -.55*(2.-T);
 for(int i=0;i<4;i++){float t0=tk[i],t1=tk[i+1];if(T<=t0)break;float u=min(T,t1)-t0;a+=u*(vk[i]+(vk[i+1]-vk[i])*u/(2.*(t1-t0)));}
 if(T>10.6)a+=.80*(T-10.6);return a;}
float arcF(float T){return FAP+vIntF(T)-vIntF(8.6);}
float rollF(float T){return 1.55*ss(3.6,4.7,T)*(1.-ss(5.6,6.7,T));}
float surfY(float x,float T){return .010*sin(x*5.+T*1.3)+.006*sin(x*12.-T*2.)+.003*sin(x*27.+T*3.);}
float pfF(float s,float c,float sn,bool top){float t=prof(s,TOPF),b=prof(s,BOTF),m=prof(s,SYMF);
 float wt=max(c,0.)*max(c,0.),wb=max(-c,0.)*max(-c,0.),wm=sn*sn;return top?(t*wt+b*wb+m*wm):(b*wt+t*wb+m*wm);}
float pfSideF(vec2 f,float c,float sn,bool top){float e=.012;float t=pfF(f.x,c,sn,top)*BL;float dt=(pfF(f.x+e,c,sn,top)-pfF(f.x-e,c,sn,top))/(2.*e);
 return ((top?1.:-1.)*f.y-t)/sqrt(1.+dt*dt);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.30,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.025,.20,.36);
 KD=vec3(2.7,.58,.26);KH=vec3(2.2,.62,.34);VEIL=vec3(.015,.11,.22);
 SKYTOP=vec3(.035,.10,.30);SKYHOR=vec3(.20,.32,.50);SUNP=vec2(-1.1,.45);SUNK=.25;CLOUDC=vec3(.55,.57,.60);FARSEA=vec3(.03,.14,.30);NEARSEA=vec3(.08,.26,.44);
 float sy=surfY(w.x,T);float horiz=.03*VH;
 if(w.y>sy){float hy=w.y-sy-horiz;BG=hy>0.?skyAt(w,hy,T):seaAbove(w,hy,T,horiz);}
 else{BG=openWater(w,T,1.3,1.2);BG=mirrorBand(BG,w,sy,T);}
 // ---- the fin whale ----
 pathF();float a=arcF(T);if(a>pathLen()+LF+.5)return;
 float ph=TAU*.32*T;spinePath(a,LF,-1.,.030*(1.-ss(7.8,8.4,T)*(1.-ss(9.8,10.6,T))),ph);
 float phi=rollF(T);float c=cos(phi),sn=sin(phi);
 if(spineNear(w)<.18*LF){vec3 f=bodyF(w);
  float d=max(pfSideF(f.xy,c,sn,true),pfSideF(f.xy,c,sn,false));d=smax(d,-f.x*BL,.014*BL);d=max(d,(f.x-1.02)*BL);
  // the small hooked dorsal fin, two-thirds back (it turns away with the roll)
  float dfv=c;vec2 df=vec2((f.x-.70)*BL,f.y-pfF(.70,c,sn,true)*BL);float fin=sdCap(df,vec2(-.016*BL,-.004*BL),vec2(.010*BL,.020*BL*max(dfv,0.)),.008*BL,.0015*BL);
  if(dfv>.15)d=smin(d,fin,.008*BL);
  vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.12*LF,.10+.08*abs(sin(ph-1.))+.80*sn*sn,0.);
  // the flippers: small and slender, turning with the roll
  float dFl=1e5;for(int s=0;s<2;s++){float al=(s==0?-.95:-2.19)+phi;float z=cos(al),y=sin(al);if(z<-.05)continue;
   vec2 fa=bodyPt(.27,y*mix(prof(.27,BOTF),prof(.27,TOPF),.5+.5*y)*LF*.70);vec2 dd=bodyDir(.27),fn=bodyNrm(.27);
   vec2 ft=fa-dd*.085*LF+fn*y*.04*LF;dFl=min(dFl,min(sdCap(w,fa,mix(fa,ft,.45),.0085*LF,.0065*LF),sdCap(w,mix(fa,ft,.45),ft,.0065*LF,.0015*LF)));}
  float dB=min(d,dK);float al_=covW(min(dB,dFl));
  if(al_>.001){bool up=w.y>sy;float zz=max(-w.y,0.);
   vec3 E=up?SUNC*1.15:lightAt(zz)*1.5;vec3 amb=up?SKYC*.30+vec3(.02):waterCol(zz)*.9+vec3(.005,.01,.015);
   float u=0.;{float tt=pfF(f.x,c,sn,true)*BL,bb=pfF(f.x,c,sn,false)*BL;u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);}
   vec3 n=tubeN(f.xy,u);
   // where on its round: dors 1 the back, -1 the belly; side < 0 the right flank (away from us at first)
   float th=asin(clamp(u,-1.,1.))-phi;float dors=sin(th),side=cos(th);
   vec2 q=vec2(f.x*LF*10.,f.y*22.);float m=fbm(q);
   vec3 alb=mix(vec3(.80,.80,.78),vec3(.075,.085,.10)*(.85+.3*m),ss(-.40,-.05,dors+.12*(m-.5)));
   // the lower jaw: dark on the left, white on the right; the pale chevron behind the head on the right
   float jaw=ss(.22,.17,f.x)*ss(.05,-.25,dors);alb=mix(alb,mix(vec3(.16,.17,.19),vec3(.86,.86,.84),ss(.15,-.15,side)),jaw);
   alb=mix(alb,vec3(.55,.57,.58),ss(.15,-.25,side)*ss(.24,.30,f.x)*ss(.42,.34,f.x)*ss(-.2,.4,dors)*.6);
   // the throat grooves on the belly
   float gz=th*16.;float gl=abs(fract(gz)-.5)*2.;alb=mix(alb,alb*.70,ss(.3,.0,gl)*ss(-.2,-.6,dors)*ss(.02,.06,f.x)*ss(.52,.44,f.x));
   vec3 col=lit(alb,n,E,amb,up?0.:.12)+rimL(n,E,up?.15:.15);
   if(up){vec3 Hn=normalize(normalize(vec3(SUND*.9,.45))+vec3(0.,0.,1.));col+=E*.50*pow(sat(dot(n,Hn)),200.)+SKYC*.10*pow(1.-n.z,3.);}
   else col+=E*.25*caust(w*3.,T*.8)*sat(u+.3)*exp(-zz*2.);
   // the eye and the mouth line (seen while upright)
   float vis=ss(.6,.9,c);if(vis>.01){vec2 ep=bodyPt(.205,.002*LF);col=mix(col,eyeC(col,w,ep,.0045*LF,E,vec3(.02)),vis);
    float ml=abs(f.y-(-.006+.012*ss(.0,.20,f.x))*LF);col*=1.-.5*vis*ss(.0025*LF,.0008*LF,ml)*ss(.21,.19,f.x)*ss(.0,.01,f.x);}
   vec3 fc=lit(mix(vec3(.08,.09,.10),vec3(.80,.80,.78),.35),normalize(vec3(0.,.3,1.)),E,amb,.2);col=mix(col,fc,covW(dFl));
   col*=1.-.35*edgeK(min(dB,dFl));
   if(!up)col=fogW(col,.04+.12*VH+1.2*max(zz-.5,0.),zz);
   putF(col,al_);}}
 // ---- the water on its back as it breaks the surface; the blow: a tall narrow column ----
 float cx=1e5;for(int i=0;i<NS;i++){vec2 a1=SP[i],b1=SP[i+1];float ea=a1.y-surfY(a1.x,T),eb=b1.y-surfY(b1.x,T);if(ea*eb<0.){cx=mix(a1.x,b1.x,ea/(ea-eb));break;}}
 if(cx<1e4&&w.y>sy-.02)splash(w,sy,cx,.06*LF,.018*LF,T,ss(8.2,8.6,T)*(1.-ss(11.,12.,T))*.65);
 float tb=T-8.75;if(tb>0.&&tb<4.){vec2 bp=bodyPt(.14,prof(.14,TOPF)*LF);bp.y=max(bp.y,surfY(bp.x,T));
  float rise=1.-exp(-tb*3.4);float y=w.y-bp.y;float ht=.62*rise;float yn=sat(y/max(ht,.01));float drift=-.10*tb*yn*yn;
  float wd=.016+.050*yn*yn+.03*yn+.025*tb*yn;float xr=(w.x-bp.x-drift)/wd;
  float colm=ss(1.,.1,abs(xr))*ss(-.01,.04,y)*ss(ht+.10,ht*.62,y+.07*(fbm(vec2(w.x*6.,tb))-.5));
  float mist=colm*(.35+.65*fbm(vec2(w.x*9.,w.y*7.-tb*1.3)))*(1.-ss(.9,3.6,tb))*(.95-.35*yn);
  putF(mix(vec3(.62,.68,.76),vec3(1.,.98,.95),ss(-.8,.8,xr*.6+.3))*SUNC,mist*.85);}
}

// ---- Scene 14: the spinner dolphins (a bay in Hawai'i, morning, clear turquoise water over sand) ----
// Half above and half under the water. 2–5 s a pod of spinner dolphins comes in from the left over the sand, one leaping low on the
// way; 5.2 one rises fast from below and bursts out of the water spinning about its long axis (spinners make up to several turns in a
// leap; Fish et al., 2006): the picture slows down, as a film does, so that it turns once in four seconds, droplets hanging round it;
// 9.6 it falls back in a white splash and the picture runs at its speed again; the pod goes on and out to the right.
const float LSP=.20;
// the slowed clock: the speed falls to .28 from 5.2–5.8 and comes back 9.6–10.2
float spW(float T){float tk[4]=float[4](5.2,5.8,9.6,10.2);float vk[4]=float[4](1.,.28,.28,1.);
 if(T<5.2)return T;float a=5.2;for(int i=0;i<3;i++){float t0=tk[i],t1=tk[i+1];if(T<=t0)break;float u=min(T,t1)-t0;a+=u*(vk[i]+(vk[i+1]-vk[i])*u/(2.*(t1-t0)));}
 if(T>10.2)a+=T-10.2;return a;}
// the pod: k 0–4, and the leaper k 5. (height, delay, distance m, its low leap)
vec4 spI(int k){return k==0?vec4(-.10,0.,1.35,-100.):k==1?vec4(-.19,.5,1.15,-100.):k==2?vec4(-.08,1.0,1.60,4.1):k==3?vec4(-.26,1.4,1.02,-100.):k==4?vec4(-.14,1.9,1.25,8.6):vec4(0.,0.,.76,-100.);}
const float TWE=5.52,VYS=.62,GSP=.98;float spAir(){return 2.*VYS/GSP;}
// the snout in the dolphin's own world (x in the world of distance 1, mapped by m later), on the slowed clock tw
vec2 spPos(int k,float tw){vec4 I=spI(k);
 if(k==5){float ta=spAir();float tau=tw-TWE;
  if(tau<0.){float u=sat((tau+1.5)/1.5);return vec2(-.42+.47*u,(2.*u*u*u-3.*u*u+1.)*(-.42)+(u*u*u-u*u)*VYS*1.5);}
  if(tau<ta)return vec2(.05+.30*tau,VYS*tau-.5*GSP*tau*tau);
  float v=tau-ta;float u=min(v/1.6,1.);vec2 p=vec2(.05+.30*ta+.24*v,(u*u*u-2.*u*u+u)*(-VYS*1.6)+(-2.*u*u*u+3.*u*u)*(-.22));return p;}
 vec2 p=vec2(-.85+.28*(tw-1.6-I.y),I.x+.012*sin(tw*1.1+float(k)*2.));
 float tau=tw-I.w;float ta=2.*.40/GSP;
 if(tau>-.6&&tau<ta+1.4){float y0=I.x;if(tau<0.){float u=(tau+.6)/.6;p.y=(2.*u*u*u-3.*u*u+1.)*y0+(u*u*u-u*u)*.40*.6;}
  else if(tau<ta)p.y=.40*tau-.5*GSP*tau*tau;else{float u=min((tau-ta)/1.4,1.);p.y=(u*u*u-2.*u*u+u)*(-.40*1.4)+(-2.*u*u*u+3.*u*u)*y0;}}
 return p;}
float spTop(float s){float bk=.010+.022*s;float b=s<.42?.100*(1.-pow(1.-sat((s-.075)/.345),2.0)):.100*(1.-pow((s-.42)/.60,1.7))+.010*ss(.42,1.,s);return max(bk,b);}
float spBot(float s){float bk=.008+.018*s;float b=s<.43?.094*(1.-pow(1.-sat((s-.060)/.37),1.8)):.094*(1.-pow((s-.43)/.60,1.5))+.008*ss(.43,1.,s);return max(bk,b);}
float spPf(float s,float c,float sn,bool top){float t=spTop(s),b=spBot(s),m=.5*(t+b);
 float wt=max(c,0.)*max(c,0.),wb=max(-c,0.)*max(-c,0.),wm=sn*sn;return top?(t*wt+b*wb+m*wm):(b*wt+t*wb+m*wm);}
float spSide(vec2 f,float c,float sn,bool top){float e=.008;float t=spPf(f.x,c,sn,top)*BL;float dt=(spPf(f.x+e,c,sn,top)-spPf(f.x-e,c,sn,top))/(2.*e);
 return ((top?1.:-1.)*f.y-t)/sqrt(1.+dt*dt);}
float spSurf(float x,float tw){return waves(x,tw,.9);}
// a dolphin's splash: foam on the surface, a crown of spray and drops (t: its own clock)
void dSplash2(vec2 w,float sy,float x0,float wd,float ht,float t,float k){if(k<=.001)return;float y=w.y-sy;float dx=(w.x-x0)/wd;if(abs(dx)>1.6||y<-.02||y>ht*1.6)return;
 float foam=ss(1.2,.3,abs(dx))*ss(.016,.0,abs(y-.003))*(.45+.55*fbm(w*90.+t));
 float cr=ht*(.35+.65*ss(.0,.8,abs(dx)))*ss(1.15,.75,abs(dx));float env=ss(cr,cr*.3,y)*ss(-.002,.006,y)*ss(1.2,.5,abs(dx));
 float spray=env*ss(.42,.70,fbm(vec2(w.x*70.,(y-t*.25)*55.)));
 vec2 dq=vec2(w.x*90.,(y+t*t*.5)*90.);vec2 di=floor(dq);float drop=ss(.22,.08,length(fract(dq)-.2-.6*h22(di)))*step(.82,h21(di+2.))*ss(1.5,.7,abs(dx))*ss(ht*1.5,ht*.6,y)*ss(.0,.01,y);
 putF(SUNC*vec3(.95,.97,.98),sat(foam*.85+spray*.8+drop*.9)*k);}
void spDolphin(vec2 w,int k,float tw,float m){
 vec2 p0=spPos(k,tw-.10),p1=spPos(k,tw-.05),p2=spPos(k,tw);
 vec2 v1=(p1-p0)*vec2(m,1.)/.05,v2=(p2-p1)*vec2(m,1.)/.05;float a1=atan(v1.y,v1.x),a2=atan(v2.y,v2.x);
 float kap=(a2-a1)/(.05*max(length(v2),.05));
 vec2 head=vec2(CAM.x+(p2.x-CAM.x)*m,p2.y);
 float sy=spSurf(w.x,tw);
 // the splashes (the leaper's are big, the others' small)
 {float te,tau;float ta;if(k==5){te=TWE;ta=spAir();}else{te=spI(k).w;ta=2.*.40/GSP;}tau=tw-te;
  if(tau>-.12&&tau<ta+1.3&&w.y>sy-.03){float sx0=CAM.x+(spPos(k,te).x-CAM.x)*m,sx1=CAM.x+(spPos(k,te+ta).x-CAM.x)*m;float big=k==5?1.:.6;
   dSplash2(w,sy,sx0,.050*big,.05*big,tau,ss(-.10,.03,tau)*(1.-ss(.20,.60,tau))*.85);
   dSplash2(w,sy,sx1,.080*big,.15*big,tau-ta,ss(ta-.06,ta+.04,tau)*(1.-ss(ta+.40,ta+1.2,tau))*.95);}}
 spine(head,a2,LSP,1.,.045,TAU*1.8*tw+float(k)*1.9,clamp(-kap*LSP,-1.,1.));
 if(spineNear(w)>.22*LSP)return;
 // the roll: the leaper turns once about its long axis in the air
 float phi=.10*sin(tw*.6+float(k));if(k==5){float tau=tw-TWE;phi=TAU*ss(-.05,spAir()+.05,tau);}
 float c=cos(phi),sn=sin(phi);
 vec3 f=bodyF(w);float d=max(spSide(f.xy,c,sn,true),spSide(f.xy,c,sn,false));d=smax(d,-f.x*BL,.008*BL);d=max(d,(f.x-1.02)*BL);
 // the dorsal fin, almost triangular, on whichever side the back is
 float H=.110*BL*abs(c);if(H>.004*BL){float sg=sign(c);vec2 fq=vec2((f.x-.42)*BL,sg*f.y-spPf(.52,c,sn,c>0.)*BL+.004*BL);float yn=sat(fq.y/H);
  float xle=.075*BL*pow(yn,1.3),xte=.10*BL+.07*BL*pow(1.-yn,1.6);float dfin=max(max(xle-fq.x,fq.x-xte),max(-fq.y,fq.y-H));d=smin(d,dfin,.006*BL);}
 vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.14*LSP,min(.62+.16*abs(sin(TAU*1.8*tw-1.))+.4*sn*sn,1.),0.);   // (seen a little from above, so the flukes read: edge-on they vanished)
 vec2 dd=bodyDir(.25);vec2 fn=bodyNrm(.25);float fy=mix(-.45,.45,.5-.5*c)*spPf(.25,c,sn,false);
 vec2 fa=bodyPt(.25,fy*LSP);vec2 ft=fa-dd*.10*LSP-fn*(.045*c)*LSP;float dFl=min(sdCap(w,fa,mix(fa,ft,.4),.014*LSP,.011*LSP),sdCap(w,mix(fa,ft,.4),ft,.011*LSP,.002*LSP));
 float dB=min(d,dK);float al=covW(min(dB,dFl));if(al<.002)return;
 bool up=w.y>sy;float zz=max(-w.y,0.);
 vec3 E=up?SUNC*1.10:lightAt(zz)*1.45;vec3 amb=up?SKYC*.30+vec3(.02):waterCol(zz)*.9+vec3(.005,.01,.015);
 float u=0.;{float tt=spPf(f.x,c,sn,true)*BL,bb=spPf(f.x,c,sn,false)*BL;u=clamp((f.y-(tt-bb)*.5)/max((tt+bb)*.5,1e-4),-1.,1.);}
 vec3 n=tubeN(f.xy,u);float th=asin(u)-phi;float dors=sin(th);float s=f.x;
 // the spinner's three tones: the dark grey cape, the pale grey flank, the white belly; the dark beak tip and the stripe to the flipper
 vec3 cape=vec3(.030,.036,.048),flank=vec3(.22,.24,.27),belly=vec3(.74,.73,.71);
 float cl=.30-.12*ss(.15,.05,s)-.10*ss(.7,.95,s);
 vec3 alb=mix(belly,flank,ss(-.55,-.35,dors+.10*ss(.5,.9,s)));alb=mix(alb,cape,ss(cl-.10,cl+.05,dors));
 alb=mix(alb,cape,ss(.035,.020,s));
 float sl=mix(.0,-.30,sat((s-.12)/.14));alb=mix(alb,cape*1.4,ss(.045,.025,abs(dors-sl))*ss(.11,.14,s)*ss(.27,.23,s));
 vec3 col=lit(alb,n,E,amb,up?0.:.12)+rimL(n,E,.13);
 if(up){vec3 Hn=normalize(normalize(vec3(SUND*.9,.45))+vec3(0.,0.,1.));col+=E*.55*pow(sat(dot(n,Hn)),180.)+SKYC*.10*pow(1.-n.z,3.);}
 else col+=E*.22*caust(w*6.,tw*.8)*sat(u+.3)*exp(-zz*3.);
 float ue=sin(.10+phi),ve=cos(.10+phi);if(ve>-.05){vec2 ep=bodyPt(.155,ue*spPf(.155,c,sn,ue>0.)*LSP*.90);float vis=ss(-.05,.25,ve);
  col=mix(col,col*.55,vis*ss(.016*LSP,.009*LSP,length(w-ep)));col=mix(col,eyeC(col,w,ep,.0070*LSP,E,vec3(.03)),vis);}
 vec3 fc=lit(mix(cape,flank,.3),normalize(vec3(-fn*.2,1.)),E,amb,up?0.:.2);col=mix(col,fc,covW(dFl));
 col*=1.-.30*edgeK(min(dB,dFl));
 if(!up)col=fogW(col,.03+.08*VH*m+.8*max(zz-.4,0.),zz);
 putF(col,al);}
void scene(vec2 w,float T){
 float tw=spW(T);
 SUND=normalize(vec2(-.25,1.));SUNC=vec3(1.05,1.0,.92);WAT0=vec3(.018,.21,.33);
 KD=vec3(2.6,.55,.28);KH=vec3(2.1,.62,.36);VEIL=vec3(.02,.17,.27);
 SKYTOP=vec3(.035,.11,.32);SKYHOR=vec3(.22,.36,.52);SUNP=vec2(-1.1,.60);SUNK=.25;CLOUDC=vec3(.58,.60,.62);FARSEA=vec3(.03,.16,.30);NEARSEA=vec3(.07,.30,.44);
 float sy=spSurf(w.x,tw);float horiz=.03*VH;float yw=-CAM.y/VH;
 if(w.y>sy){float hy=w.y-sy-horiz;vec3 c=hy>0.?skyAt(w,hy,tw):seaAbove(w,hy,tw,horiz);
  // the island far off: a dark green-blue mountain in the haze, its slopes falling to the sea
  float ix=(P.x+.55)/.75;float ih=.11*VH*(1.-ix*ix)*(1.+.12*sin(ix*7.))+.012*VH*fbm(vec2(P.x*9.,0.));
  if(hy>0.&&hy<ih&&abs(ix)<1.){vec3 ic=mix(vec3(.10,.17,.20),SKYHOR*.95,.55-.35*ss(.0,ih,hy));c=mix(c,ic,ss(.0,-.004,hy-ih));}
  BG=c;}
 else{vec3 c=openWater(w,tw,1.2,1.1);
  // the sand far below, in perspective, rippled and lit by the caustics
  vec3 fp=planeAt(-.70,yw,1.);if(fp.z>.5){float dd=fp.y;float X=fp.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw)*6.;float fw=length(fwidth(q));
   float rip=.5+.5*sin(q.x*2.2+2.*vn(q*.5));float ca=caust(vec2(X,Zw)*5.,tw*.8)*ss(1.5,.3,fw);
   vec3 sc=vec3(.62,.57,.44)*(.70+.30*rip*ss(1.,.2,fw))*(lightAt(.70)*1.2+waterCol(.70)*.5)+lightAt(.70)*.22*ca*ss(.9,.3,fw);
   vec3 tf=exp(-KH*camDist()*.8*dd);c=sc*tf+c*(1.-tf);}
  c=mirrorBand(c,w,sy,tw);BG=c;}
 float wpx0=WPX;
 for(int j=0;j<6;j++){int k=j==0?2:j==1?0:j==2?4:j==3?1:j==4?3:5;float m=spI(k).z;
  vec2 wk=vec2(CAM.x+P.x*VH*m,(P.y-yw)*VH*m);WPX=wpx0*m;spDolphin(wk,k,tw,m);}
 WPX=wpx0;
 // droplets hanging round the leaper in the slowed air
 {float ta=spAir();float tau=tw-TWE;if(tau>.0&&tau<ta+.2){float m=spI(5).z;vec2 wk=vec2(CAM.x+P.x*VH*m,(P.y-yw)*VH*m);
  for(int i=0;i<14;i++){float fi=float(i);float lag=.34+.050*fi;if(tau<lag-.05)continue;vec2 pp=spPos(5,tw-lag);pp.x=CAM.x+(pp.x-CAM.x)*m;
   vec2 o=(vec2(h11(fi*3.1),h11(fi*5.7))-.5)*vec2(.07,.06)*(.4+lag);vec2 dp=pp+o-vec2(.0,.25*(lag-.3)*(lag-.3));
   if(dp.y<spSurf(dp.x,tw))continue;float r=(.0030+.0025*h11(fi*7.3))*(1.-lag*.8);float dl=length(wk-dp);
   float a=ss(r+WPX*m,r-WPX*m,dl)*ss(.0,.06,tau);vec3 dc=vec3(.80,.90,.98)*SUNC*(.75+.5*ss(r,.0,length(wk-dp-vec2(-.3,.4)*r)));
   putF(dc,a*.90);}}}
}

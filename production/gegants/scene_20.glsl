// ---- The surface at sunset: the climb after the twentieth (T: seconds since the climb started) and the rest of the journey ----
// 0–4.3 s the camera rises with the blue whale towards the light; 4.3 its head breaks the surface; 4.6–7.5 the blow, a tall narrow
// column of mist lit by the low sun; the back rolls forward, the small dorsal fin shows, and it dives, fading into the deep blue
// before 10 s, leaving a smooth patch on the water (its footprint). With a large T (at rest: before the first press and after the climb) the same sea, empty, the sun touching
// the horizon.
float surfY(float x,float T){return .007*sin(x*3.+T*1.0)+.004*sin(x*7.-T*1.5)+.0015*sin(x*17.+T*2.3);}
const float LB=2.5;
// how far along its path the snout is: .64 units a second rising, slowing to .32 at the surface
float arcB(float T){return .72*T-.36*.5*(min(max(T-3.6,0.),1.4)*min(max(T-3.6,0.),1.4)/1.4+2.*max(T-5.,0.))+.25*.5*min(max(T-6.5,0.),1.5)*min(max(T-6.5,0.),1.5)/1.5+.25*max(T-8.,0.)+.20*max(T-8.,0.)*max(T-8.,0.);}
float TOPS[11]=float[11](.009,.030,.049,.058,.061,.060,.055,.046,.033,.019,.010);
float BOTS[11]=float[11](.014,.037,.058,.066,.067,.062,.052,.040,.028,.017,.010);
float wDist(vec2 f){float d=bodyD(f,TOPS,BOTS);vec2 df=vec2((f.x-.775)*BL,f.y-prof(.775,TOPS)*BL);
 return smin(d,sdCap(df,vec2(-.014*BL,-.004*BL),vec2(.011*BL,.008*BL),.0055*BL,.0012*BL),.007*BL);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.85,.55));SUNC=vec3(1.10,.62,.32);SKYC=vec3(.40,.28,.40);WAT0=vec3(.016,.085,.13);
 SKYTOP=vec3(.05,.07,.20);SKYHOR=vec3(.95,.38,.14);CLOUDC=vec3(.55,.24,.30);SUNP=vec2(.62,-.02);SUNK=.0;CLOUDK=.0;
 FARSEA=vec3(.05,.05,.11);NEARSEA=vec3(.09,.08,.15);
 VEIL=vec3(.018,.085,.13);
 float sy=surfY(w.x,T);float horiz=.03*VH;
 bool whale=T<13.;
 if(whale){pathSet(vec2(-1.85,-1.95),.90);PL[0]=1.73;PL[1]=1.35;PK[1]=-.667;PL[2]=.45;PL[3]=1.3;PK[3]=-.72;
  spinePath(arcB(T),LB,1.,.035*(1.-ss(3.5,4.5,T)),TAU*.22*T);}
 if(w.y>sy){
  // ---- the sky of the sunset: gold at the horizon, rose, then the blue of the evening; the sun on the horizon; long clouds ----
  float hy=w.y-sy-horiz;vec2 sp=vec2(CAM.x+SUNP.x*VH,sy+horiz+.045*VH);float ds=length(w-sp)/VH;
  float hs=hy/VH;vec3 sky=mix(SKYHOR,vec3(.62,.24,.30),ss(.0,.22,hs));sky=mix(sky,vec3(.22,.14,.30),ss(.15,.45,hs));sky=mix(sky,SKYTOP,ss(.40,.80,hs));
  sky+=SUNC*(1.6*ss(.032,.026,ds)*vec3(1.,.85,.6)+.70*exp(-ds*8.)+.35*exp(-ds*2.4)*ss(.5,.0,hs));
  float cn=fbm(vec2(w.x*.30/VH*2.+T*.004,hs*7.)+3.);float cl=ss(.55,.68,cn)*ss(.08,.18,hs)*ss(.60,.30,hs);
  vec3 cc=mix(vec3(.30,.12,.20),vec3(1.10,.48,.26),ss(.55,.80,fbm(w*2.+9.))*ss(.45,.10,hs));sky=mix(sky,cc,cl*.85);
  vec3 sea=mix(vec3(.30,.16,.20),SKYHOR*.80,ss(-horiz,.0,hy))*(.85+.3*vn(vec2(w.x*40./VH,hy*400./VH)+T*.3));
  float path=exp(-abs(w.x-sp.x)/(.06*VH+.30*max(-hy,0.)))*ss(.0,-.01,hy);
  float gl=pow(vn(vec2(w.x*26.,hy*150.)+vec2(T*.5,0.)),5.);sea+=SUNC*(.35*path+1.6*path*gl);
  BG=hy>0.?sky:sea;
 }else{
  // ---- under the water: warm light near the surface, long slanting shafts of the low sun ----
  float z=-w.y;vec3 wc=waterCol(z)*(.6+.9*ss(-.9,.5,P.y));
  wc+=lightAt(z)*vec3(.9,.7,.5)*.55*shafts(w*vec2(.7,1.),T)*ss(-.8,.6,P.y);
  wc+=lightAt(z+.2)*.30*snow(P,T);
  wc=mirrorBand(wc,w,sy,T);wc+=SUNC*.20*ss(.05*VH,.0,sy-w.y)*exp(-abs(w.x-CAM.x-SUNP.x*VH)*1.5);
  BG=wc;
 }
 if(!whale)return;
 // ---- the blue whale ----
 if(spineNear(w)<.2*LB){vec3 f=bodyF(w);float d=wDist(f.xy);
  vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.09*LB,.10,0.);
  d=min(d,dK);
  vec2 fa=bodyPt(.275,-prof(.275,BOTS)*BL*.45);vec2 dd=bodyDir(.275);vec2 fn=bodyNrm(.275);vec2 ftip=fa-dd*.070*BL-fn*.040*BL;
  float dF=min(sdCap(w,fa,mix(fa,ftip,.45),.0085*BL,.006*BL),sdCap(w,mix(fa,ftip,.45),ftip,.006*BL,.0012*BL));
  float a=covW(min(d,dF));
  if(a>.001){bool up=w.y>sy;float zz=max(-w.y,0.);
   float u=bodyU(f.xy,TOPS,BOTS);vec3 n=tubeN(f.xy,u);
   vec2 q=vec2(f.x*BL*9.,f.y*20.);q+=.5*vec2(fbm2(q*.4),fbm2(q*.4+4.));float m=fbm(q*.8);
   vec3 alb=vec3(.20,.27,.36)*(.86+.28*m);alb=mix(alb,vec3(.42,.50,.56),ss(.55,.68,fbm(q*1.6+2.))*.35);alb=mix(alb,vec3(.52,.53,.50),ss(.10,-.60,u));
   vec3 E=up?SUNC*.55:lightAt(zz)*1.35;vec3 amb=up?SKYC*.22+vec3(.01):waterCol(zz)*1.2+vec3(.010,.014,.02);
   vec3 c=lit(alb,n,E,amb,up?1.:.3)+rimL(n,E,up?.30:.45);
   if(up)c+=SUNC*(.55*pow(sat(dot(n,normalize(vec3(.7,.5,.5)))),10.)+.35*pow(1.-n.z,3.)*ss(-.2,.6,u));
   c=eyeC(c,w,bodyPt(.215,.006*LB),.004*LB,E,vec3(.03));
   float bh=length((f.xy-vec2(.155,prof(.155,TOPS)*BL))*vec2(BL,1.)/vec2(.010*BL,.004*BL));c=mix(c,c*.35,ss(1.,.6,bh)*.8);
   vec3 fc=lit(vec3(.30,.37,.45),normalize(vec3(-fn*.25,1.)),E,amb,.3);
   c=mix(c,fc,covW(dF));
   c*=1.-.35*edgeK(min(d,dF));
   if(!up)c=fogW(c,.20+.18*VH+1.6*max(zz-.25,0.),zz);
   putF(c,a);}}
 // ---- the water on the whale at the surface: the sheet off its head and back, foam; the smooth footprint behind it ----
 float cx=1e5;for(int i=0;i<NS;i++){vec2 a1=SP[i],b1=SP[i+1];float ea=a1.y-surfY(a1.x,T),eb=b1.y-surfY(b1.x,T);if(ea*eb<0.){cx=mix(a1.x,b1.x,ea/(ea-eb));break;}}
 float wet=ss(4.1,4.5,T)*(1.-ss(8.,9.,T));
 if(cx<1e4&&w.y>sy-.02)splash(w,sy,cx,.08*LB,.014*LB,T,wet*.7);
 vec2 H=SP[0];float fp=ss(7.,8.5,T)*(1.-ss(10.,12.,T));
 putF(vec3(.80,.70,.66)*SUNC*.8,fp*.30*ss(.02,.0,abs(w.y-sy-.004))*ss(.45,.05,abs(w.x-(H.x-.9)))*(.5+.5*fbm(vec2(w.x*18.,T))));
 // ---- the blow: a tall narrow column of mist from the blowholes, lit by the sun from the right, drifting and fading ----
 float tb=T-4.65;if(tb>0.&&tb<4.){vec2 bp=bodyPt(.155,prof(.155,TOPS)*BL);bp.y=max(bp.y,surfY(bp.x,T));
  if(tb<.05)bp.x=bp.x;float rise=1.-exp(-tb*3.2);float y=w.y-bp.y;float ht=.85*rise;
  float yn=sat(y/max(ht,.01));float drift=.18*tb*yn*yn;float wd=.020+.075*yn*yn+.05*yn+.03*tb*yn;float xr=(w.x-bp.x-drift)/wd;
  float col=ss(1.,.1,abs(xr))*ss(-.01,.04,y)*ss(ht+.10,ht*.65,y+.08*(fbm(vec2(w.x*6.,tb))-.5));
  float mist=col*(.35+.65*fbm(vec2(w.x*8.,w.y*6.-tb*1.2)))*(1.-ss(.8,3.6,tb))*(.9-.35*yn);
  vec3 bc=mix(vec3(.45,.30,.40),SUNC*1.4,ss(-.7,.9,xr));putF(bc,mist*.80);}
}

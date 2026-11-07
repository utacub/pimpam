// ---- Scene 3: the bowhead breaks the ice (Arctic, spring, a sheet of young ice) ----
// 2–5 s under a sheet of thin new ice, bright with the light it lets through, the great bowed head of a bowhead rises towards us
// from the deep; 5.2 its crown meets the ice and lifts it: the sheet cracks into plates that tilt up and slide off the head; the
// camera rises to the waterline (half air, half water); 6.9 the twin blowholes send up the V-shaped blow of the bowhead, drifting in
// the cold air (bowheads break ice up to about 18 cm thick with their heads to breathe; George et al., 1989); 8.7–9.8 it sinks back,
// the plates fall back and float; the camera dips under and draws back: the whole whale, 16 m, glides away under the ice into the deep.
const float LW=1.6;
const float XH=.20;                          // where it comes up through the ice
const float IT=.004,IB=-.018;                // the top and the bottom of the ice at the picture plane
float TOPW[11]=float[11](.006,.042,.078,.093,.110,.118,.110,.090,.062,.033,.016);
float BOTW[11]=float[11](.018,.095,.128,.138,.128,.120,.104,.080,.052,.028,.016);
// the line of the mouth (the edge of the narrow arched upper jaw over the great lower lips), from the axis, in body lengths
float mouthW(float s){return -.012+.064*sin(PI*sat(s/.37));}
float bowD(vec2 f){float d=max(profSide(f,TOPW,1.),profSide(f,BOTW,-1.));d=smax(d,-f.x*BL,.020*BL);return max(d,(f.x-1.02)*BL);}
// how the ice is lifted (0 before the push, 1 while the head is up)
float liftI(float T){return ss(5.0,5.9,T)*(1.-ss(8.6,9.6,T));}
// One path for the whole scene: up from the deep at .78 rad, levelling to .30 as the head comes up through the ice, (the stop),
// then on over and down and away. While it rests at the top the whole path sinks with it (SINK).
const vec2 W0=vec2(-1.8693,-1.8359);const float WAP=2.95;   // the start of the path; the snout's arc length at the top
vec2 sinkW(float T){return vec2(-.03,-.45)*ss(8.6,10.3,T);}
void pathW(float T){pathSet(W0+sinkW(T),.78);PL[0]=2.4;PL[1]=.40;PK[1]=-1.2;PL[2]=.15;PL[3]=.55;PK[3]=(-.60-.30)/.55;PL[4]=5.;}
// its speed: .22 rising, slowing to a stop at the top (6.4), resting, then away faster (piecewise linear, integrated)
float vInt(float T){float k0=5.0,k1=6.4,k2=9.2,k3=10.4;float v0=.22,v3=.42;
 float a=v0*min(T,k0);if(T>k0){float t=min(T,k1)-k0;a+=v0*t-v0*t*t/(2.*(k1-k0));}
 if(T>k2){float t=min(T,k3)-k2;a+=v3*t*t/(2.*(k3-k2));}if(T>k3)a+=v3*(T-k3);return a;}
float arcW(float T){return WAP-(vInt(6.4)-vInt(T));}
void poseW(float T){pathW(T);spinePath(arcW(T),LW,1.,.045*(1.-ss(4.6,5.6,T))+.035*ss(9.8,11.,T),TAU*.30*T);}
// The ice of the picture plane: the sheet; where the head comes up two plates hinge up on either side, and two small pieces ride up
// on the head and slide off it into the water. Returns the distance to the nearest piece (negative inside); pc: the point in the
// piece's own frame (x along it, y up from its middle).
float plateBox(vec2 w,vec2 c,float hw,float a,out vec2 q){q=rot(-a)*(w-c);return sdBox(q,vec2(hw,(IT-IB)*.5))-.0008;}
const float HL=XH-.25,HR=XH+.18;             // the edges of the hole
float iceD(vec2 w,float T,out vec2 pc){float L=liftI(T);float cy=(IT+IB)*.5;float st=ss(8.8,10.5,T);vec2 q;float d=1e5;
 if(T<5.0){float bulge=.014*ss(4.6,5.0,T)*exp(-pow((w.x-XH+.03)/.18,2.));float yb=w.y-bulge;d=max(yb-IT,IB-yb);pc=vec2(w.x,yb-cy);return d;}
 // the sheet beyond the plates
 float dsl=max(max(w.y-IT,IB-w.y),min(w.x-HR,HL-w.x)+.0*L);d=dsl;pc=vec2(w.x,w.y-cy);
 // the small pieces from over the head: they ride up on it, slide off and float in the hole
 for(int j=0;j<2;j++){float fj=float(j);float sOn=.06+.10*fj;float slide=ss(6.6+.4*fj,7.8+.4*fj,T);
  vec2 onHead=bodyPt(sOn,prof(sOn,TOPW)*LW+.012);vec2 dh=bodyDir(sOn);float aHead=atan(dh.y,dh.x);
  vec2 inW=vec2(XH-.12+.16*fj+.02*st,cy+.003*sin(T*1.8+fj*3.));float aW=.06*sin(T*1.2+fj*2.)*(1.-st*.5);
  float u=ss(5.05,5.7,T);vec2 rest=vec2(XH-.12+.16*fj,cy);
  vec2 c=mix(mix(rest,onHead,u),inW,slide);float an=mix(mix(0.,aHead,u),aW,slide);
  q=rot(-an)*(w-c);float di=sdBox(q,vec2(.055-.012*fj,.016))-.002;if(di<d){d=di;pc=q;}}
 return d;}
// The ice sheet seen from below, receding: young ice, bright blue-white with the light it lets through; brine channels; the snow
// on it here and there makes it darker. Returns the colour (alpha 0 where there is none).
vec4 ceilingW(vec2 w,float T,vec3 wc,float hz){vec3 pl=planeAt(IB,hz,1.6);if(pl.z<.5)return vec4(0.);
 float dd=pl.y;float X=pl.x;float Zw=dd/1.6*1.2*VH;vec2 q=vec2(X,Zw)*3.;float fw=length(fwidth(q));
 float sn=ss(.45,.70,fbm(q*.7+2.));float br=fbm(q*2.5);float ch=exp(-voroE(q*3.+.5*vec2(fbm2(q),fbm2(q+3.)),0.)*20.)*ss(.5,.1,fw);
 vec3 ice=vec3(.52,.80,.86)*(.75+.40*br)*(1.-.55*sn)+vec3(.30,.40,.42)*ch*.35*(1.-sn);
 float fog=1.-exp(-max(dd-.6,0.)*.55);vec3 c=mix(ice*1.25,wc,fog);
 return vec4(c,ss(.0,.02,P.y-hz));}
void scene(vec2 w,float T){
 SUND=normalize(vec2(-.45,1.));SUNC=vec3(1.05,.96,.86);SKYC=vec3(.62,.74,.90);WAT0=vec3(.028,.150,.200);
 KD=vec3(2.5,.62,.40);KH=vec3(2.1,.68,.46);VEIL=vec3(.020,.10,.14);
 float sy=.0025*sin(w.x*9.+T*1.1)*step(HL,w.x)*step(w.x,HR)*ss(5.0,5.4,T);   // only the water in the hole moves
 float opened=ss(5.2,5.8,T);
 if(w.y>sy){
  // ---- the air: a pale spring sky, the sun low on the left with its halo; the snow-covered ice flat to the horizon ----
  float yw=(0.-CAM.y)/VH;float hzA=yw+.20;float hs=P.y-hzA;
  vec3 sky=mix(vec3(.40,.47,.56),vec3(.17,.28,.48),ss(.0,.25,hs));sky=mix(sky,vec3(.08,.16,.36),ss(.20,.60,hs));
  vec2 sp=vec2(-.62*1.6,hzA+.13);float ds=length(P-sp);
  sky+=SUNC*(1.1*ss(.026,.020,ds)+.30*exp(-ds*8.)+.10*exp(-ds*2.5)+.04*ss(.30,.28,ds)*ss(.24,.27,ds));
  float cl=fbm(vec2(P.x*.9+CAM.x/VH*.3+T*.004,hs*5.));sky=mix(sky,vec3(.52,.54,.60),ss(.58,.80,cl)*.40*ss(.04,.20,hs)*ss(.7,.35,hs));
  vec3 snow=sky;
  vec3 pl=planeAt(IT,hzA,1.);
  if(pl.z>.5){float dd=pl.y;float X=pl.x;float Zw=dd*1.2*VH;vec2 q=vec2(X,Zw);float fw=length(fwidth(q*8.));
   vec3 sn=vec3(.62,.66,.72)*(.88+.16*fbm(q*vec2(8.,8.)));
   sn=mix(sn,vec3(.36,.44,.58),ss(.52,.76,fbm(q*vec2(3.,5.)+3.))*.55);
   sn*=1.+.25*exp(-abs(X-CAM.x+.62*1.6*VH*dd)*.8/max(dd,.3))*.0;
   // far off, a low ridge of broken ice
   // the hole the whale has broken: open dark water with slush, raised broken edges catching the sun, cracks running out
   vec2 hq=vec2((X-XH+.03)/.25,(dd-1.15)/.40);float open=ss(5.0,5.6,T);float closeH=ss(9.5,13.,T);
   float hr=length(hq)+.25*(fbm(hq*3.+2.)-.5);float hole=ss(1.02,.95,hr/max(open,.01))*step(.01,open);
   float rimH=ss(.70,1.,hr/max(open,.01))*ss(1.18,1.0,hr/max(open,.01))*open;
   float crk=exp(-voroE(q*vec2(9.,9.)+vec2(3.,1.),0.)*28.)*ss(1.8,.9,hr)*ss(4.8,5.2,T)*ss(.5,.1,fw);
   sn=mix(sn,sn*.45,crk*.8);sn=mix(sn,vec3(.85,.88,.92),rimH*.55);
   vec3 wat=vec3(.05,.09,.13)+vec3(.40,.44,.50)*ss(.55,.75,fbm(q*14.+T*.05))*.6;  // slush and small pieces
   sn=mix(sn,mix(wat,vec3(.42,.47,.55),closeH*.6),hole);
   float fog=1.-exp(-max(dd-1.,0.)*.12);snow=mix(sn,vec3(.55,.60,.68),fog);}
  float hy=hs;
  BG=pl.z>.5?snow:sky;
 }else{
  // ---- the water under the ice: dim and blue; light pours in through the hole once it is open ----
  float z=-w.y;vec3 wc=waterCol(z)*(.45+1.0*ss(-.65,.55,P.y));
  float hole=opened*exp(-pow((w.x-XH+.03+w.y*.45)/(.18+.30*z),2.));wc+=lightAt(z)*vec3(.70,.85,.90)*.65*hole*(.6+.4*shafts(w*vec2(2.,1.),T));
  wc+=lightAt(z+.2)*.25*snow(P,T);
  float hz=min(.12,(IB-CAM.y)/VH-.10);vec4 ce=ceilingW(w,T,wc,hz);BG=mix(wc,ce.rgb,ce.a);
 }
 // ---- the bowhead ----
 poseW(T);
 if(spineNear(w)<.25*LW){vec3 f=bodyF(w);float dB=bowD(f.xy);
  vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float dK=flukeD(tq,.16*LW,.12+.10*abs(sin(TAU*.30*T-1.)),0.);
  vec2 dd=bodyDir(.42);vec2 fn=bodyNrm(.42);vec2 fa=bodyPt(.42,-prof(.42,BOTW)*LW*.55);vec2 ftip=fa-dd*.12*LW-fn*.06*LW;
  float dF=sdCap(w,fa,ftip,.030*LW,.016*LW);
  float dS=min(dB,dK);float a=covW(min(dS,dF));
  if(a>.001){bool up=w.y>sy;float zz=max(-w.y,0.);
   vec3 E=up?SUNC*1.0:lightAt(zz)*(.95+1.2*opened*exp(-pow((w.x-XH)/.35,2.))*exp(-zz*2.));
   vec3 amb=up?SKYC*.30+vec3(.02):waterCol(zz)*.9+vec3(.004,.008,.012);
   float u=bodyU(f.xy,TOPW,BOTW);vec3 n=tubeN(f.xy,u);
   vec2 q=vec2(f.x*LW*10.,f.y*25.);float m=fbm(q);
   vec3 alb=vec3(.020,.020,.024)*(.85+.35*m);
   // the white chin with its black spots; the pale eyelid; the white band before the flukes (older animals)
   float my=mouthW(f.x)*LW;float below=ss(.004*LW,-.004*LW,f.y-my);
   float chin=ss(.14,.08,f.x+.04*(fbm(q*.5)-.5))*ss(.010*LW,-.012*LW,f.y-my+.030*LW*ss(.02,.15,f.x))*ss(.005,.025,f.x);
   vec2 spq=vec2(f.x*LW*60.,f.y*60.);vec2 spi=floor(spq);float spot=ss(.30,.18,length(fract(spq)-.5-.25*(h22(spi)-.5)))*step(.45,h21(spi))*ss(.35,.9,chin)*ss(1.,.6,chin+.15*vn(spq*.3));
   alb=mix(alb,vec3(.86,.86,.84),chin*(1.-spot*.9));
   float band=ss(.82,.86,f.x)*ss(.94,.90,f.x)*ss(.40,.70,fbm(q*.8+4.));alb=mix(alb,vec3(.50,.52,.54),band*.6);
   vec3 c=lit(alb,n,E,amb,up?0.:.30)+rimL(n,E,up?.12:.35);
   if(up){vec3 Hn=normalize(normalize(vec3(SUND*.9,.45))+vec3(0.,0.,1.));c+=E*.55*pow(sat(dot(n,Hn)),220.)+SKYC*.10*pow(1.-n.z,3.)+E*.05*pow(sat(dot(n,Hn)),12.);}
   // the bowed mouth line, the eye just above its corner
   float ml=abs(f.y-my);c*=1.-.65*ss(.004*LW,.0015*LW,ml)*ss(.38,.35,f.x)*ss(.0,.02,f.x);
   vec2 ep=bodyPt(.39,.004*LW);float de=length(w-ep);c=mix(c,mix(c,vec3(.10,.10,.10)*(E+amb),.5),ss(.010*LW,.007*LW,de));c=eyeC(c,w,ep,.0055*LW,E,vec3(.02));
   // the twin blowholes on the crown
   vec2 bh=bodyPt(.25,prof(.25,TOPW)*LW*.94);c*=1.-.6*ss(.008*LW,.004*LW,length((w-bh)*vec2(1.,1.8)));
   // the water running off the head in the air
   if(up){float st=ss(.68,.95,vn(vec2(w.x*70.,w.y*7.+T*3.)))*ss(.0,.3,w.y-sy);c=mix(c,vec3(.85,.92,.96),st*.5*ss(5.4,6.0,T)*(1.-ss(7.6,8.4,T)));}
   vec3 fcol=lit(vec3(.035,.035,.04),normalize(vec3(-fn*.3,1.)),E,amb,.4);
   c=mix(c,fcol,covW(dF));
   c*=1.-.35*edgeK(min(dS,dF));
   if(!up)c=fogW(c,.08+.13*VH+1.2*max(zz-.35,0.),zz);
   putF(c,a);}}
 // ---- the ice at the picture plane: the sheet and its plates ----
 {vec2 pc;float dI=iceD(w,T,pc);float a=covW(dI);
  if(a>.001){float th=IT-IB;float yr=(pc.y+th*.5)/th;    // 0 at the bottom, 1 at the top
   bool air=w.y>sy;float zz=max(-w.y,0.);
   vec3 side=vec3(.55,.80,.86)*(.80+.30*fbm(vec2(pc.x*90.,yr*3.)));side+=vec3(.25,.30,.30)*ss(.80,.95,vn(vec2(pc.x*160.,yr*8.)))*.5;
   vec3 top=vec3(.92,.95,.98);vec3 col=mix(side,top,ss(.80,.95,yr));
   vec3 E=air?SUNC*1.15:lightAt(zz)*1.6+vec3(.10,.16,.18);col*=E*(.65+.45*yr);
   col*=1.-.30*edgeK(dI);
   if(!air)col=fogW(col,.10+.2*VH,zz);
   putF(col,a);}}
 // ---- the water thrown up as the head breaks through; the slush and small pieces in the hole afterwards ----
 if(w.y>sy-.02){float tb=T-5.2;if(tb>0.&&tb<2.5)splash(w,sy,XH-.12,.16,.05+.06*ss(.0,.4,tb),T,(1.-ss(1.,2.4,tb))*.75);
  float br=ss(5.6,6.4,T);if(br>0.&&w.x>HL&&w.x<HR){vec2 bq=vec2(w.x*70.+T*.6,(w.y-sy)*70.);vec2 bi=floor(vec2(bq.x,0.));
   float on=step(.45,h21(bi+3.));float bob=.12*sin(T*2.+bi.x);
   float piece=ss(.42,.30,abs(fract(bq.x)-.5))*ss(.20+bob*.3,.0,bq.y)*ss(-.6,-.2,bq.y)*on;putF(vec3(.85,.92,.96)*SUNC*.95,piece*br*.85);}}
 // ---- the V-shaped blow: two bushy columns from the twin blowholes, leaning apart, drifting in the cold air ----
 float tb=T-6.9;if(tb>0.&&tb<4.5){vec2 bp=bodyPt(.25,prof(.25,TOPW)*LW);bp.y=max(bp.y,.01);
  float rise=1.-exp(-tb*3.);float fade=1.-ss(1.2,4.3,tb);
  for(int s=0;s<2;s++){float lean=(s==0?-.36:.40)+.08;vec2 dv=vec2(sin(lean),cos(lean));vec2 r=w-bp-vec2(.12*tb*ss(.0,.5,w.y-bp.y),0.);
   float al=dot(r,dv),ac=dot(r,vec2(dv.y,-dv.x));float ht=.42*rise;float yn=al/max(ht,.01);
   float wd=.012+.050*yn*yn+.03*yn+.02*tb*yn;float col=ss(1.,.15,abs(ac)/max(wd,.005))*ss(-.01,.03,al)*ss(ht*1.15,ht*.6,al+.06*(fbm(vec2(ac*20.,tb))-.5));
   float mist=col*(.40+.60*fbm(vec2(ac*25.,al*12.-tb*1.4)+float(s)*5.))*fade*(.95-.40*sat(yn));
   vec3 bc=mix(vec3(.50,.56,.64),vec3(.98,.94,.88),ss(-.8,.8,-ac/max(wd,.005)*(s==0?1.:-1.)*.5+.3));putF(bc*SUNC*.9,sat(mist*1.2));}}
}

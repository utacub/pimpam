// ---- Scene 1: the narwhals at a lead in the pack ice (Arctic, Baffin Bay, spring) ----
// Under a ceiling of sea ice, green with the light it lets through and the algae on its underside, a lead (a long crack of open water)
// pours light down. 2–5 s three narwhals (two males and a female) come in from the left, in a line, under the ice; 5–10 one after another they rise into the lead,
// their heads and backs break the surface to breathe (narwhals winter in dense pack ice and breathe in its cracks; Laidre &
// Heide-Jørgensen, 2011), the tusks first; then they roll down and go on under the far floe to the right. Arctic cod hide by the ice.
const float LN=.46;       // 4.6 m without the tusk
const float LX0=.05,LX1=1.05;   // the lead: open water between the two floes
float surfY(float x,float T){return .004*sin(x*9.+T*1.3)+.002*sin(x*23.-T*2.1);}
const float YI=-.07;        // the underside of the ice
bool inLead(float x){return x>LX0&&x<LX1;}
// The ice seen from below, receding to the horizon (a little above the middle of the screen): its underside glows green-white with the
// light it lets through, darker under snow, brown where the algae grow; the lead crosses it away from us, a bright strip of sky seen
// through the water. The far ice fades into the water. Returns the colour (alpha 0 where there is no ice: below the horizon).
vec4 ceiling(vec2 w,float T,vec3 wc){float hz=.13;float D=1.6;float sy0=(YI-CAM.y)/VH-hz;float py=P.y-hz;if(py<=0.||sy0<=0.)return vec4(wc,0.);
 float dd=D*sy0/py;float X=CAM.x+P.x*VH*dd/D;
 float hw=.50+.06*sin(dd*1.7+1.)+.05*(vn(vec2(dd*5.,1.))-.5);float e=abs(X-.55-.08*sin(dd*.8))-hw;
 vec2 q=vec2(X*2.4,dd*1.1);float br=fbm(q*2.);float snowc=ss(.42,.62,fbm(q*.6+5.));float alg=ss(.55,.75,fbm(q*.8+11.));
 float cr=exp(-voroE(q*1.3+.4*vec2(fbm2(q*2.),fbm2(q*2.+3.)),0.)*34.);float lead=exp(-max(e,0.)*2.5);
 vec3 ice=vec3(.46,.74,.70)*(.62+.45*br)*(1.-.50*snowc)*(.50+.50*lead)+vec3(.20,.14,.04)*alg*.40;
 ice+=vec3(.30,.45,.45)*cr*(1.-snowc)*.30;
 ice*=1.+.7*ss(.08,.0,e)*ss(-.02,.0,e);                  // thin bright ice at the edge of the lead
 vec3 sky=vec3(.82,.95,1.)*1.6*(.85+.15*vn(vec2(X*8.+T*.4,dd*20.)));
 vec3 c=mix(ice,sky,ss(.015,-.015,e));
 float fog=1.-exp(-max(dd-D*.5,0.)*.45);c=mix(c,wc,fog);
 return vec4(c,ss(.0,.03,py));}
float TOPN[11]=float[11](.040,.085,.094,.096,.095,.088,.072,.052,.034,.022,.015);
float BOTN[11]=float[11](.048,.092,.104,.108,.106,.096,.076,.054,.034,.022,.015);
// how far along the path the snout of narwhal k is: steady swimming, slowing at the surface to breathe
float arcN(float T,float k){float u=T-3.-k*1.0;return 1.7+.55*u-.30*1.2*.886*(1.+tanh((u-4.03)));}
float breathT(float k){return 7.03+k*1.0;}
// the path: in under the left floe, up into the lead, over at the surface, down and on under the far floe
void pathN(float k){pathSet(vec2(-2.9+(k==1.?.10:k==2.?-.12:0.),-.43-.025*k),.0);PL[0]=2.45+.03*k;PL[1]=.533;PK[1]=1.5;PL[2]=.08-.02*k;PL[3]=1.033;PK[3]=-1.5;PL[4]=.30;PL[5]=.47;PK[5]=1.6;}
float nwDist(vec2 f){return bodyD(f,TOPN,BOTN);}
void scene(vec2 w,float T){
 SUND=normalize(vec2(.20,1.));SUNC=vec3(1.0,.98,.94);SKYC=vec3(.62,.72,.85);WAT0=vec3(.020,.150,.165);
 KD=vec3(2.4,.55,.42);KH=vec3(2.0,.62,.50);
 VEIL=vec3(.020,.11,.13);
 float sy=surfY(w.x,T);
 // ---- the decor: the water, lit from the lead; the ice above, receding ----
 float z=max(-w.y,0.);float dl=w.x<LX0?LX0-w.x:w.x>LX1?w.x-LX1:0.;float leadL=exp(-dl*2.2);
 vec3 wc=waterCol(z)*(.50+.70*ss(-.45,.35,P.y));
 float sh=pow(vn(vec2((w.x-.55-w.y*.10)*6.,T*.12)),2.)*ss(.70,.25,abs(w.x-.55-w.y*.10));
 wc+=lightAt(z)*vec3(.65,.92,.88)*(.10*leadL+.50*sh*exp(-z*.9))*ss(-.5,.2,P.y);
 wc+=lightAt(z+.2)*.30*snow(P,T);
 vec4 ce=ceiling(w,T,wc);BG=mix(wc,ce.rgb,ce.a);
 // ---- Arctic cod: a loose group of small fish by the ice, dark against its light ----
 {vec2 q=vec2(w.x*7.+T*.10,(w.y+.18)*16.);vec2 ci=floor(q);vec2 cf=fract(q)-.5;float on=step(.92,h21(ci+7.))*step(abs(ci.y),1.)*step(.25,abs(w.x-.55));
  vec2 o=cf-vec2(.25*sin(T*.6+ci.x*3.),.15*sin(T*.8+ci.x*5.));float fd=sdEll(o,vec2(.22,.055));float tl=sdEll(o-vec2(-.26,0.),vec2(.05,.07));
  if(on>0.)putF(fogW(vec3(.10,.13,.14),.25+.2*VH,z),ss(.03,-.02,min(fd,tl))*.85);}
 // ---- the narwhals: two males with their tusks and a female; the farther drawn first, smaller and hazier ----
 for(int j=0;j<3;j++){int k=j==0?1:j==1?2:0;float fk=float(k);float L=LN*(k==2?.86:1.)*(k==1?.84:1.);
  pathN(fk);float a=arcN(T,fk);if(a<-.2||a>pathLen()+L+.3)continue;
  spinePath(a,L,1.,.045,TAU*.55*T+fk*1.7);
  if(spineNear(w)>.30*L+(k<2?.55*L:0.))continue;
  vec3 f=bodyF(w);float d=nwDist(f.xy);
  // the tusk: from the left side of the upper jaw, straight on along the head, a left-handed spiral of grooves
  vec2 sn=SP[0],hd=normalize(SP[0]-SP[1]);vec2 tb=sn-hd*.012*L+bodyNrm(0.)*.012*L,tt=tb+hd*(k<2?.55-.10*fk:0.)*L;
  float dT=k<2?sdCap(w,tb,tt,.010*L,.003*L):1e5;
  // flippers: small, rounded, the tips turned up
  vec2 fa=bodyPt(.20,-prof(.20,BOTN)*L*.40);vec2 dd=bodyDir(.20);vec2 fn=bodyNrm(.20);float fang=.75+.15*sin(T*1.3+fk);
  vec2 ftip=fa-dd*cos(fang)*.13*L-fn*sin(fang)*.13*L;float dF=sdCap(w,fa,ftip,.022*L,.010*L);
  // flukes: seen nearly edge-on, tilting with the stroke
  vec2 tp=bodyPt(1.,0.);vec2 td=bodyDir(.97);vec2 tq=rot(atan(-td.y,-td.x))*(w-tp);float tilt=.12+.10*abs(sin(TAU*.55*T+fk*1.7-1.));float dK=flukeD(tq,.17*L,tilt,0.);
  float dB=min(d,dK);float a0=covW(min(min(dB,dF),dT));if(a0<.002)continue;
  bool up=w.y>sy;float zz=max(-w.y,0.);
  vec3 E=up?SUNC*1.4:lightAt(zz)*1.6*(.55+.45*exp(-(w.x<LX0?LX0-w.x:w.x>LX1?w.x-LX1:0.)*2.5));
  vec3 amb=up?SKYC*.35:waterCol(zz)*1.3+vec3(.01,.02,.02);
  float u=bodyU(f.xy,TOPN,BOTN);vec3 n=tubeN(f.xy,u);
  // the skin: marbled; dark grey on the back, broken into white mottles on the flanks, white on the belly; the female paler
  vec2 q=vec2(f.x*L*70.,f.y*70.);float mm=fbm(q)+.25*(vn(q*2.7)-.5);
  float th=.32+.38*ss(-.7,.7,u);
  vec3 alb=mix(vec3(.70,.71,.70),vec3(.09,.09,.10),ss(-.04,.04,th-mm+.12*(u-.2)));
  alb=mix(alb,vec3(.78,.78,.76),ss(-.25,-.65,u));if(k==2)alb=mix(alb,vec3(.62,.63,.62),.30);
  float wet=up?1.:.4;
  vec3 c=lit(alb,n,E,amb,wet)+rimL(n,E,.45);
  if(!up)c+=E*.25*caust(w*5.,T*.8)*sat(u+.3)*exp(-zz*3.)*leadL;
  c=eyeC(c,w,bodyPt(.13,.012*L),.010*L,E,vec3(.04));
  float ml=abs(f.y+.010*L);c*=1.-.45*ss(.006*L,.002*L,ml)*ss(.10,.06,f.x)*ss(-.01,.01,f.x);
  vec3 fc=lit(alb*.9,normalize(vec3(-fn*.3,1.)),E,amb,wet);
  c=mix(c,fc,covW(dF));
  if(dT<WPX*2.){float along=dot(w-tb,hd)/max(length(tt-tb),1e-4);float tc=dot(w-tb,vec2(-hd.y,hd.x))/(.010*L);
   float gr=.5+.5*sin(along*60.-tc*1.6);vec3 iv=mix(vec3(.80,.74,.60),vec3(.95,.92,.84),gr)*(1.-.25*ss(.7,1.,along));
   vec3 tcl=lit(iv,normalize(vec3(vec2(-hd.y,hd.x)*clamp(tc,-1.,1.)*.7,1.)),E,amb,.5);c=mix(c,tcl,covW(dT));}
  c*=1.-.40*edgeK(min(min(dB,dF),dT));
  if(up)c=mix(c,vec3(.10,.13,.14),.55);else c=fogW(c,.12+.26*VH+(k==1?.35:k==2?.12:0.),zz);
  putF(c,a0);
 }
 // ---- the breaths: the water stirs in the lead where a narwhal breaks the surface; a few bubbles under it ----
 if(inLead(w.x)){for(int k=0;k<3;k++){float fk=float(k);float tb=T-breathT(fk);float br=pulse(-.6,-.2,.6,1.4,tb);
   if(br>.001){float cx=.56+(k==1?.10:k==2?-.12:0.);splash(w,surfY(w.x,T),cx,.06,.035+.03*ss(-.2,.2,tb),T*2.+fk,br*.7);
    bubbleCloud(w,vec2(cx-.05,-.10),vec2(.12,.05),tb,br*.5,.2+.2*VH);}}}
}

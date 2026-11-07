// 9 · El riu dels nyus. Across a brown-green river. On the high bank at the left a line of wildebeest waits at the edge; one leaps from
// the bank into the river and makes a big splash (the key moment, ≈ 3.0–4.0 s); the others follow it one after another (≈ 4.6–8.8 s) and
// swim across with only their heads and backs above the water. On the far bank the ones that have crossed climb out and walk on, and
// their dust rises golden in the sun. No crocodiles. White-bearded wildebeest: blue-grey with darker brindled bands on the neck and the
// shoulders, a black mane, a pale beard, cow-like horns, the shoulders higher than the rump.
float WSW=0.;  // the waterline (scene units) of a swimmer being drawn; below it the animal shows faintly through the water
struct Gn{float legsN,legsF,hoof,body,neck,head,muz,horn,mane,beard,tail,tuft,ear;vec2 H,E;float ha;};
Gn gnParts(vec2 f,float ph,float walk,float leap,float swim,float nod){Gn P;
 vec2 sF=vec2(.16,.50),sB=vec2(-.18,.45);
 float a=sin(ph)*walk,b=sin(ph+PI)*walk,ca=max(0.,cos(ph))*walk,cb=max(0.,-cos(ph))*walk;
 vec2 f1=vec2(.17+.08*a,.04*ca),f2=vec2(.13+.08*b,.04*cb),h1=vec2(-.17+.08*b,.04*cb),h2=vec2(-.21+.08*a,.04*ca);
 // leaping: the forelegs folded under the chest, the hind legs stretched back; swimming: paddling under the water
 f1=mix(f1,vec2(.30,.30),leap);f2=mix(f2,vec2(.26,.26),leap);h1=mix(h1,vec2(-.48,.30),leap);h2=mix(h2,vec2(-.46,.25),leap);
 float sw=sin(ph);f1=mix(f1,vec2(.26+.07*sw,.14),swim);f2=mix(f2,vec2(.22-.07*sw,.12),swim);h1=mix(h1,vec2(-.30-.06*sw,.16),swim);h2=mix(h2,vec2(-.28+.06*sw,.14),swim);
 float l=.255,fb=leap+swim>.5?-1.:1.;
 vec2 k1=knee(sF,f1,l,l,fb),k2=knee(sF-vec2(.035,0.),f2,l,l,fb),k3=knee(sB,h1,l,l,-1.),k4=knee(sB-vec2(.035,0.),h2,l,l,-1.);
 P.legsN=min(min(sdCap(f,sF,k1,.045,.019),sdCap(f,k1,f1+vec2(0.,.01),.019,.015)),min(sdCap(f,sB,k3,.060,.021),sdCap(f,k3,h1+vec2(0.,.01),.021,.015)));
 P.legsF=min(min(sdCap(f,sF-vec2(.035,0.),k2,.043,.018),sdCap(f,k2,f2+vec2(0.,.01),.018,.014)),min(sdCap(f,sB-vec2(.035,0.),k4,.057,.020),sdCap(f,k4,h2+vec2(0.,.01),.020,.014)));
 P.hoof=min(min(length(f-f1)-.018,length(f-h1)-.018),min(length(f-f2)-.017,length(f-h2)-.017));
 // the body: deep at the shoulders, sloping down to a smaller rump
 P.body=smin(smin(sdEll(rot(.14)*(f-vec2(-.01,.53)),vec2(.25,.105)),length(f-vec2(.13,.57))-.125,.06),length(f-vec2(-.18,.50))-.095,.05);
 // the neck: thick and short; the head long, the broad square muzzle, held low (nod: a toss of the head)
 vec2 B=vec2(.20,.60),H=B+vec2(.15,-.03+.05*nod)+vec2(.03,.15)*swim;P.H=H;
 P.neck=sdCap(f,B,H,.085,.060);
 P.ha=mix(-1.05,-.55,swim)+.35*nod-.15*leap;vec2 hq=rot(P.ha)*(f-H);
 P.head=smin(sdEll(hq-vec2(.02,0.),vec2(.07,.055)),sdEll(hq-vec2(.13,-.005),vec2(.085,.040)),.03);
 P.muz=max(sdEll(hq-vec2(.20,-.005),vec2(.045,.048)),P.head+.003);
 // the horns: out to the side and down, then up and in (seen from the side: forward, down and up)
 P.horn=min(sdCap(hq,vec2(-.03,.045),vec2(.045,.085),.022,.015),sdCap(hq,vec2(.045,.085),vec2(.025,.145),.015,.005));
 P.ear=sdEll(rot(.6)*(hq-vec2(-.045,.035)),vec2(.040,.014));
 P.E=H+rot(-P.ha)*vec2(.045,.018);
 vec2 nd=normalize(H-B),pp=vec2(-nd.y,nd.x);float mu=segU(f,B-nd*.03,H);
 P.mane=max(sdSeg(f,B+pp*.07-nd*.04,H+pp*.05)-.022,-dot(f-B,pp)+.03);
 P.beard=sdSeg(f,B-pp*.065+nd*.02,H-pp*.045-nd*.02)-.030+.006*sin(dot(f,nd)*160.);
 vec2 ta=vec2(-.27,.55),tb=mix(mix(vec2(-.31,.27),vec2(-.50,.48),leap),vec2(-.40,.52),swim)+vec2(.015*sin(ph*.7),0.);P.tail=sdCap(f,ta,tb,.012,.010);
 P.tuft=sdCap(f,mix(ta,tb,.55),tb+normalize(tb-ta)*.04,.012,.030);
 return P;}
float gnUnion(Gn P){return min(min(min(P.legsN,P.legsF),min(P.body,P.neck)),min(min(P.head,P.horn),min(P.tail,P.beard)));}
void gnu(vec2 q,vec2 c,float s,float dir,float ph,float walk,float leap,float swim,float nod,float bl,float shadow,float pitch){
 vec2 f=(q-c)/s;f.x/=sdir(dir);f=rot(pitch)*(f-vec2(0.,.5))+vec2(0.,.5);if(f.y<-.05||f.y>.95||f.x<-.6||f.x>.65)return;float px=PX/s;
 float al0=AL;if(swim>0.)AL*=mix(.16,1.,ss(WSW-.004,WSW+.006,q.y));
 Gn P=gnParts(f,ph,walk,leap,swim,nod);
 if(shadow>0.){vec2 fs=f-SHD*.05/s*vec2(dir,1.);Gn S=gnParts(fs,ph,walk,leap,swim,nod);dropShadow(gnUnion(S)*s,.05,.30*shadow);}
 vec3 grey=vec3(.115,.115,.125),dark=vec3(.035,.033,.035),band=vec3(.06,.058,.064),cream=vec3(.62,.56,.44);
 solid(litFlat(grey*.62,.1),ss(px,-px,P.legsF));
 solid(litFlat(dark,.1),ss(px,-px,P.tail));solid(litFlat(dark,.1),ss(px,-px,P.tuft));
 CUT(P.legsN*s,grey*.95,f,.1,.003);solid(litFlat(dark,.1),ss(px,-px,P.hoof));
 // the brindle: a few soft darker bands, upright on the neck and the shoulders
 float br=ss(.2,.6,sin(f.x*48.+f.y*6.))*ss(-.05,.12,f.x)*ss(.40,.52,f.y);
 solid(litFlat(cream,.3),ss(px,-px,P.beard));
 under(min(P.body,P.neck)*s+.004,.012);
 CUT(min(P.body,P.neck)*s,mix(grey,band,br*.8),f*1.3,.1,.014);
 solid(litFlat(dark,.2),ss(px,-px,P.mane));
 solid(litFlat(grey*.9,.2),ss(px,-px,P.ear));
 under(P.head*s,.008);CUT(P.head*s,mix(dark*1.6,grey,.25),f*2.,.1,.008);
 CUT(P.muz*s,dark*1.4,f*2.,.1,.006);
 CUT(P.horn*s,vec3(.21,.20,.18),f*3.,.1,.004);
 eye(f,P.E,.016,bl);
 AL=al0;}
// The river: muddy olive-green water from the foot of the far bank down; slow bands drift with the current (to the right).
const float FB=-.095; // the waterline at the far bank (scene units)
void river(vec2 q,float t){if(uDecor>1.5)return;float top=FB+.003*sin(q.x*7.+t*.8);float d=q.y-top;float c=cov(d);if(c<=0.)return;
 float dep=sat((top-q.y)/.40);vec3 col=mix(vec3(.21,.24,.15),vec3(.12,.16,.11),dep);col=mix(col,mix(SKYM,SKYH,.5)*.40,.35*(1.-dep));
 float fl=q.x*1.-t*.05;float bands=sin((q.y-FB)*90.*(1.+dep)+sin(fl*5.+q.y*20.)*1.2);col*=1.+.05*ss(.5,1.,bands);
 float rip=sin(q.y*170.+sin(q.x*6.-t*.9)*2.);col+=SUNC*.05*pow(max(0.,rip),14.)*(1.-dep*.5);
 col+=SKYH*.10*ss(.012,.0,top-q.y);solid(decCol(litFlat(col,.1)*1.15*(1.+fibre(q)*.25)),c);}
// The far bank: a low cliff of red-brown earth with grass on top; small wildebeest walk along it, drawn as cut-out silhouettes (from one
// sheet, a few poses), and the dust they raise glows gold in the sun.
float tinyGnu(vec2 l,float ph){float d=sdEll(rot(.12)*(l-vec2(0.,.55)),vec2(.27,.12));d=smin(d,length(l-vec2(.14,.58))-.13,.05);
 d=min(d,sdCap(l,vec2(.20,.62),vec2(.37,.48),.07,.055));d=min(d,sdCap(l,vec2(.37,.48),vec2(.43,.37),.055,.05));
 float a=sin(ph)*.08;d=min(d,min(sdCap(l,vec2(.14,.50),vec2(.16+a,0.),.04,.025),sdCap(l,vec2(-.17,.48),vec2(-.18-a,0.),.045,.025)));
 d=min(d,min(sdCap(l,vec2(.10,.50),vec2(.10-a,0.),.04,.025),sdCap(l,vec2(-.13,.48),vec2(-.13+a,0.),.045,.025)));
 d=min(d,sdCap(l,vec2(-.27,.58),vec2(-.31,.30),.025,.02));d=min(d,sdCap(l,vec2(.35,.53),vec2(.43,.60),.025,.012));return d;}
void farBank(vec2 q,float t){if(uDecor>1.5)return;vec2 u=atS(.45);float px=pxS(.45);float k=uDecor>.5?uOpacity:1.;
 float top=FB+.050+.008*sin(u.x*3.+1.)+.004*sin(u.x*11.);float d=torn(u.y-top,u*2.,.004,22.);
 // the dust behind the walkers: thin warm tissue, rising and drifting
 float dz=fbm(vec2(u.x*3.-t*.10,u.y*6.-t*.22))*ss(top-.02,top+.015,u.y)*ss(top+.20,top+.02,u.y)*(.7+.3*sin(u.x*4.+1.));
 float dc=ss(.12,.40,dz);if(dc>0.)solid(decCol(litFlat(vec3(.60,.43,.24),.7)*(1.+.25*GLOW)),dc*.55*k);
 // the walkers on the top of the bank
 for(int i=0;i<9;i++){float fi=float(i);float x=-.85+fi*.22+mod(t*.045+fi*.13,.22)*0.+t*.03;x=mod(x+.95,1.9)-.95;float s=.075+.012*h11(fi*3.1);
  vec2 l=(u-vec2(x,top-.004-.004*h11(fi)))/s;if(abs(l.x)>.7||l.y>1.||l.y<-.1)continue;float dd=tinyGnu(l,t*TAU*1.1+fi*1.7)*s;
  solid(decCol(litFlat(vec3(.09,.09,.10),.1)),ss(px,-px,dd)*k);}
 dropShadow(torn(u.y-top+SHD.y*.02,u*2.,.004,22.),.02,.3*k);
 float c=ss(px,-px,d)*ss(px,-px,FB-.002-u.y+.0)*0.+ss(px,-px,d)*ss(-px,px,u.y-FB+.004);if(c<=0.)return;
 vec3 earth=mix(vec3(.36,.19,.09),vec3(.48,.28,.13),ss(FB,top,u.y));float strata=sin(u.y*260.+sin(u.x*9.)*2.);earth*=1.+.07*ss(.3,1.,strata);
 vec3 col=litFlat(earth,.1)*(1.+fibre(u*1.4)*.4);float gr=ss(top-.020,top-.008,u.y);col=mix(col,litFlat(grassAlb(uScene.x,3.)*.85,.3),gr);
 col=mix(col,col*1.25+SUNC*.05,ss(-px*3.,-px*.3,d)*.5);solid(decCol(col),c*DEC());}
// The near bank: a steep cliff of layered earth at the left with grass on its top, where the herd waits; the drop to the water is at x≈−.30.
const float NB=.035; // the top of the near bank (scene units)
float nearBankD(vec2 u){float edge=-.31+.05*(NB-u.y)+.012*sin(u.y*40.);float d=max(u.x-edge,u.y-NB-.004*sin(u.x*13.));return torn(d,u*2.,.004,22.);}
void nearBank(vec2 q){if(uDecor>1.5)return;vec2 u=atS(-.02);float px=pxS(-.02);float d=nearBankD(u);float c=ss(px,-px,d);if(c<=0.)return;
 float st=floor((NB-u.y)/.07+.25*sin(u.x*4.));vec3 earth=mix(vec3(.40,.22,.10),vec3(.30,.16,.08),mod(st,2.));earth=mix(earth,vec3(.22,.13,.07),ss(.0,.5,NB-u.y)*.6);
 vec3 col=litN(earth,normalize(vec3(.5*ss(.05,0.,-d),0.,1.)),.1)*(1.+fibre(u*1.2)*.45);
 float gr=ss(NB-.035,NB-.020,u.y+.012*sin(u.x*60.));col=mix(col,litFlat(grassAlb(uScene.x,3.)*.80,.3),gr);
 col=mix(col,col*1.3+SUNC*.05,ss(-px*3.,-px*.3,d)*.5);solid(decCol(col),c*DEC());}
// The splash where a wildebeest lands: a crown of torn white paper that grows and falls, drops thrown up in arcs, and rings.
void splash(vec2 q,vec2 c,float a){if(a<0.||a>2.6)return;
 // the crown: rounded tongues of torn white paper in a fan, rising and falling back
 float g=ss(0.,.16,a)*ss(1.0,.40,a);
 if(g>0.){vec2 l=(q-c)/vec2(.11,.15*g);float ang=atan(l.x,max(l.y,1e-3));float r=length(l);
  float lobes=.70+.30*pow(abs(cos(ang*3.5)),.6);float d=max(r-lobes,-l.y);d=max(d,abs(ang)-1.25);d=torn(d*.11,q*3.,.003,40.);
  float cc=ss(PX,-PX,d);solid(litFlat(vec3(.70,.76,.76),.4)*(1.+fibre(q)*.3),cc*.78);}
 // the drops: thrown up and out in arcs
 for(int i=0;i<26;i++){float fi=float(i);vec2 h=h22(vec2(fi,7.3));float vx=(h.x-.5)*.55,vy=.30+.40*h.y,tt=a*(.85+.3*h.x);
  vec2 p=c+vec2(vx*tt,vy*tt-.85*tt*tt);if(p.y<c.y-.005)continue;float r=.005+.006*h.y;float d=length((q-p)/vec2(1.,1.3))-r;
  solid(litFlat(vec3(.72,.78,.78),.5),ss(PX,-PX,d)*.85*ss(2.2,1.4,a));}
 // the rings
 vec2 l=(q-c)/vec2(1.,.22);float r=length(l);for(int k=0;k<2;k++){float R=.05+a*.10-float(k)*.05;if(R>0.)glow(SKYH*.10*ss(.007,.0,abs(r-R))*(1.-a/2.6)*step(q.y,c.y+.01));}}
// The reeds at the bottom right, in front of everything.
void reeds(vec2 q,float t){if(uDecor>1.5)return;vec2 u=atS(-.10);float px=pxS(-.10);float d=9.;
 for(int i=0;i<7;i++){float fi=float(i);float x=.55+fi*.055+.02*h11(fi);float h=.16+.12*h11(fi+3.);float sw=.012*sin(t*1.1+fi);
  d=min(d,sdCap(u,vec2(x,-.55),vec2(x+sw+.03*(h11(fi+9.)-.5),-.55+h+.2),.007,.002));}
 float c=ss(px,-px,d);if(c<=0.)return;solid(decCol(litFlat(vec3(.20,.24,.08),.5)*(1.+fibre(u)*.3)),c*DEC());}
void scene(vec2 q,float t){
 farBank(q,t);
 river(q,t);
 // the swimmers (those that have already jumped), drawn behind the bank; each has its own waterline
 float tj[4]=float[](3.0,4.6,6.2,7.8);
 for(int i=0;i<4;i++){float te=tj[i]+.85;float a=t-te;if(a<0.)continue;
  float Wy=G0+.016*a,k=(Wy-HOR.y)/(G0-HOR.y),s=.30*k,x=.10+.075*a,y=Wy-.47*s;
  WSW=Wy+.004*sin(t*3.+float(i));
  gnu(q,vec2(x,y),s,1.,t*TAU*.9+float(i),0.,0.,1.,.0,blinkAt(t,float(i)*.27),0.,-.10+.04*sin(t*2.+float(i)));
  // the wake: a white V of ripples in front of the head
  vec2 hh=vec2(x+s*.38,WSW);vec2 l=q-hh;float wk=ss(.005,.0,abs(abs(l.y)*3.2-(-l.x))-.0)*ss(-.12,-.01,l.x)*ss(.0,-.004,-l.x)*step(abs(l.y),.03);
  glow(SKYH*.10*wk*ss(0.,.6,a));}
 nearBank(q);
 // the herd on the bank: they walk up to the edge in turn; each leaps, lands in a splash and becomes a swimmer
 for(int i=0;i<4;i++){float fi=float(i);float tJ=tj[i];
  float adv=0.;for(int j=0;j<4;j++){if(j>=i)break;adv+=ss(tj[j]+.15,tj[j]+1.0,t);}
  float x=-.47-.29*fi+.29*adv;float moving=0.;for(int j=0;j<4;j++){if(j>=i)break;moving=max(moving,ss(tj[j]+.1,tj[j]+.3,t)*ss(tj[j]+1.05,tj[j]+.85,t));}
  float u=(t-tJ)/.85;
  if(u<0.){float nod=.5+.5*sin(t*2.3+fi*1.7);nod*=ss(.6,1.,sin(t*.9+fi));
   gnu(q,vec2(x,NB-.004),.30,1.,t*TAU*1.2+fi,moving,0.,0.,nod,blinkAt(t,fi*.31),1.,0.);}
  else if(u<1.){float xx=mix(-.47,.08,u),yy=mix(NB-.004,G0-.47*.30,u)+.20*4.*u*(1.-u);float pitch=mix(.20,-.45,u);
   gnu(q,vec2(xx,yy),.30,1.,0.,0.,ss(0.,.2,u),0.,0.,0.,0.,pitch);}}
 for(int i=0;i<4;i++){splash(q,vec2(.15,G0),t-tj[i]-.80);}
 reeds(q,t);
}

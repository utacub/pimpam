// 9 · La teranyina de rosada. In the green half-light of the understory, the golden web of an orb-weaver spider, full of dew. Each drop
// is a small lens: it shows the forest behind it upside down and smaller (the drops bend the backdrop, uBg). Light slides along the
// threads as the web sways. A part of the web is broken: the spider walks from the hub to it (tau ≈ 2–4 s) and spins the missing rings
// one by one, bright and new (4–8 s); when it ends (the key moment, ≈ 8.3 s) a soft wave of light runs from the hub to the edge, and
// the spider goes back to the hub. The silk of the real spider is golden (Nephila); the timing is a criterion of the design.
const float WR=.42,R0=.065,RS=.0165;const int NSP=26;
const float GAP0=-.35,GAP1=.55;   // the broken sector (angles from the right, anticlockwise)
float webSway(float t){return .006*sin(t*.7)+.003*sin(t*1.9+1.);}
// The repair: how many rings of the broken sector are back (0 to 1 along the rings 8–15).
float repair(float t){return ss(4.,8.,t);}
// The spider's place: at the hub, then out along the spoke at the edge of the gap, then to and fro along the rings it spins (four passes,
// so it ends where it began), a short rest, and straight back to the hub. 0.34: one smooth path (it used to jump from the spoke to the
// rings and from the rings to the way back).
vec2 spiderP(float t){float a0=GAP1-.05,r8=R0+8.*RS,rE=R0+15.*RS;float r=0.,aa=a0;
 if(t>2.)r=r8*ss(2.,4.,t);
 if(t>4.){float rp=repair(t);r=R0+mix(8.,15.,rp)*RS;aa=mix(a0,GAP0+.05,.5-.5*cos(rp*4.*PI));}
 if(t>8.5){r=rE*(1.-ss(8.5,10.6,t));aa=a0;}
 return vec2(cos(aa),sin(aa))*r;}
// Its heading, which turns smoothly: head down at the hub, then outwards along the spoke and while it spins (it steps sideways along
// the rings, as orb weavers do, instead of turning round at each end), round to face the hub to go back, and head down again.
vec3 spiderPos(float t){float a0=GAP1-.05;vec2 p=spiderP(t);float hd=-1.57;
 if(t>2.)hd=mix(-1.57,a0,ss(2.,2.6,t));
 if(t>4.){float rp=repair(t);hd=mix(a0,GAP0+.05,.5-.5*cos(rp*4.*PI));}
 if(t>8.5)hd=a0+PI*ss(8.5,9.2,t);
 if(t>10.)hd=mix(a0+PI,TAU-1.57,ss(10.,10.8,t));
 return vec3(p,hd);}
// A leg: from a to the tip b through a knee lifted outwards; banded black and yellow, a tuft at the knee.
void leg(vec2 l,vec2 a,vec2 b,float side,float w){vec2 m=(a+b)*.5,n=normalize(vec2(-(b-a).y,(b-a).x))*side;vec2 k=m+n*length(b-a)*.28;
 float d=min(sdSeg(l,a,k),sdSeg(l,k,b))-w;float u=length(l-a)/length(b-a);vec3 c=mix(vec3(.025,.015,.01),vec3(.55,.35,.10),step(.72,fract(u*4.)));
 solid(c,cov(d*1.7));solid(vec3(.02),cov((length(l-k)-w*2.4)*1.7)*.8);}
void spider(vec2 q,vec2 c,float hd,float t,float walk){vec2 l=rot(hd)*(q-c)/1.7;if(dot(l,l)>.03)return;
 // legs: four pairs, the front ones long, stepping in turns while it walks
 for(int i=0;i<4;i++){float fi=float(i);float ang=mix(.45,2.6,fi/3.),len=fi==0.?.115:fi==3.?.10:.075;
  for(int sd=-1;sd<=1;sd+=2){float s=float(sd),st=walk*.012*sin(t*9.+fi*1.6+s*1.57);vec2 a=vec2(.012-.008*fi,.006*s),b=vec2(cos(ang)*len+st,sin(ang)*len*s);leg(l,a,b,s,.0022);}}
 // the abdomen (long, olive and gold with pale spots) behind, the silvery head and thorax in front
 vec2 ab=l-vec2(-.045,0.);float ad=sdEll(ab,vec2(.048,.019));float sp=step(.72,vn(ab*vec2(140.,160.)));
 solid(mix(vec3(.42,.38,.10),vec3(.95,.92,.70),sp*.8)*(1.-.45*ss(.0,.019,abs(ab.y))),cov(ad*1.7));
 float ce=sdEll(l-vec2(.006,0.),vec2(.016,.013));solid(vec3(.70,.72,.74),cov(ce*1.7));solid(vec3(.02),cov((length(l-vec2(.019,.004*sign(l.y+1e-4)))-.0028)*1.7));glow(vec3(1.,.85,.5)*ln(abs(min(ad,ce))*1.7,.0012)*.4);}
void scene(vec2 q,float t){
 vec2 w=q-vec2(-.04,.03)-vec2(webSway(t),.6*webSway(t+1.3));
 float r=length(w),th=atan(w.y,w.x),wob=1.+.06*sin(th*2.+.5)+.03*sin(th*3.+2.);float R=WR*wob;
 float dth=TAU/float(NSP),k=floor(th/dth+.5),dl=th-k*dth;float ka=k*dth+.04*sin(k*7.3);dl=th-ka;
 float spec=pow(.5+.5*cos(2.*(th-t*.22)),28.)*1.4+.25,wave=exp(-pow((r-(t-8.3)*.35)/.04,2.))*ss(8.2,8.4,t)*ss(10.,9.5,t);
 float gold=0.;
 // frame threads from the edge of the web to the edges of the picture
 for(int i=0;i<5;i++){float fi=float(i),a=fi*1.26+.3;vec2 e=vec2(cos(a),sin(a))*WR*(1.+.06*sin(a*2.+.5)),o=e*4.;gold+=ln(sdSeg(w,e*.95,o),.0011)*.8;}
 // spokes
 if(r>R0*.3&&r<R*1.02)gold+=ln(abs(r*sin(dl)),.0009)*(.55+.45*spec);
 // the spiral: straight pieces between spokes (rings at R0 + n·RS); the broken sector has rings 8–15 missing until they are spun again
 float sec=floor(th/dth),ph=th-(sec+.5)*dth,ap=r*cos(ph)/cos(dth*.5);float n=floor((ap-R0)/RS+.5);
 if(n>=0.&&ap<R*.94){float rn=R0+n*RS,dd=abs(r*cos(ph)-rn*cos(dth*.5));float inGap=step(GAP0,th)*step(th,GAP1)*step(8.,n)*step(n,15.);
  float back=inGap>0.?step((n-8.)/7.,repair(t)*1.02):1.;  float newT=inGap>0.?ss(1.,.0,(t-4.-(n-8.)/7.*4.)/2.):0.;
  gold+=ln(dd,.0008)*(.5+.5*spec)*back*(1.+2.5*newT);}
 // the hub: a small dense mesh
 gold+=ln(abs(r-R0*.5),.0008)*.6+ln(abs(r-R0*.75),.0008)*.5;
 glow(vec3(1.,.80,.38)*gold*(.55+1.2*wave));
 // dew drops on the rings: small lenses showing the forest upside down, a bright point above, a caustic below
 if(n>=1.&&ap<R*.94){for(int m=-1;m<=0;m++){float nn=n+float(m),rn=R0+nn*RS;for(int j=0;j<2;j++){float fj=float(j);vec2 hh=h22(vec2(nn*3.1+fj,sec*1.7));if(hh.x>.38)continue;
   float big=step(hh.y,.09),rd=mix(.003+.004*hh.y,.016+.012*fract(hh.y*13.),big);float pa=(sec+.15+.7*fract(hh.x*7.+fj*.5))*dth;
   float inGap=step(GAP0,pa)*step(pa,GAP1)*step(8.,nn)*step(nn,15.);if(inGap>0.&&(nn-8.)/7.>repair(t)-.3)continue;
   vec2 cc=vec2(cos(pa),sin(pa))*rn*cos(dth*.5)/cos(pa-(sec+.5)*dth)-vec2(0.,rd*.35);vec2 d=w-cc;float dl2=length(d);if(dl2>rd*1.2)continue;
   float a=cov(dl2-rd);vec2 off=-d*(1.+mix(5.,3.,big))*SC;put(vec3(0.),a*.92,vec3(1.,.98,.92)*1.1,off);
   glow(vec3(1.)*exp(-length(d-rd*vec2(-.35,.38))/(rd*.12))*.9*a+vec3(1.,.9,.6)*exp(-length(d-rd*vec2(.25,-.45))/(rd*.2))*.35*a+vec3(.9,.95,1.)*ln(abs(dl2-rd),.0008)*.35);}}}
 // the spider
 vec3 sp=spiderPos(t);float walk=sat(length(spiderP(t+.06)-spiderP(t-.06))/.12/.10);spider(w,sp.xy,sp.z,t,walk);
 // the new thread coming from the spider while it spins
 if(t>4.&&t<8.4)glow(vec3(1.,.9,.6)*ln(sdSeg(w,sp.xy,sp.xy*.97),.0012)*.6);
}

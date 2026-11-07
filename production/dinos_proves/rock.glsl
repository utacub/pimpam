// ---- The rock between the scenes. World y: 0 the mammoths (Ice Age silt and permafrost with ice lenses), going down the warm
// ochre and red beds of the Cenozoic, the thin dark clay of the end of the Cretaceous at KPG, then the grey mudstones, sandstones and
// lignites of the Cretaceous with the tyrannosaurs at -2.2. Low contrast (soft beds, no hard stripes). ----
const float KPG=-1.30;
#if PASS==0
vec3 W2;// unused
vec3 rockAlb(vec2 w,out float bed){
 float y=w.y+.035*(fbm2(vec2(w.x*1.6,w.y*.7))-.5)+.012*sin(w.x*2.3+w.y);
 float b=y*7.5,bi=floor(b);bed=fract(b);float hb=h11(bi);
 vec3 ice=mix(vec3(.62,.58,.50),vec3(.52,.50,.46),hb);                 // silt of the Ice Age
 vec3 ceno=mix(mix(vec3(.62,.42,.26),vec3(.70,.52,.32),hb),vec3(.55,.34,.24),step(.7,hb)); // ochre and red
 vec3 cret=mix(mix(vec3(.50,.50,.47),vec3(.60,.58,.52),hb),vec3(.42,.38,.33),step(.88,hb)*ss(.15,.35,bed)*ss(.85,.65,bed)); // grey, sand, thin lignite
 vec3 c=mix(ice,ceno,ss(-.45,-.75,y));c=mix(c,cret,ss(KPG-.02,KPG-.05,y));
 // a thin dark clay at the boundary, with a pale line in it
 float kb=abs(y-KPG);c=mix(c,vec3(.20,.17,.15),ss(.016,.010,kb));c=mix(c,vec3(.56,.50,.42),ss(.004,.0015,abs(y-KPG+.003)));
 // the beds: soft lighter tops
 c*=.94+.08*ss(.0,.25,bed)*ss(1.,.7,bed);
 // ice lenses in the frozen silt around the mammoths
 if(y>-.5&&y<1.2){float il=fbm2(vec2(w.x*4.,w.y*40.));c=mix(c,vec3(.74,.78,.80),ss(.80,.86,il)*.6*ss(1.2,.8,y)*ss(-.5,-.2,y));}
 return c;}
// The small fossils in the rock: one in some cells of a grid (a planorbid snail, a leaf, a freshwater clam, a fern frond in the
// Cretaceous), raised a little from the rock.
float fossilD(vec2 w,out int kind,out vec2 lu){vec2 g=w/vec2(.30,.26),ci=floor(g),f=(fract(g)-.5)*vec2(.30,.26);float hh=h21(ci+11.);kind=-1;lu=f;
 if(hh<.55)return 1.;vec2 o=(h22(ci)-.5)*vec2(.14,.10);vec2 l=rot(h21(ci+4.)*6.28)*(f-o);lu=l;float s=.6+.6*h21(ci+9.);l/=s;
 float y=w.y;int t=int(floor(h21(ci+2.)*3.));
 float d;
 if(y<KPG&&t==2){ // a fern frond
  kind=3;float sp=sdSeg(l,vec2(-.05,0.),vec2(.05,0.))-.002;float px=fract((l.x+.05)*60.);float pin=abs(l.y)-(.016*(1.-abs(l.x)/.06))*(.5+.5*sin(px*PI));d=min(sp,max(pin,abs(l.x)-.055));}
 else if(t==0){ // a planorbid snail: a flat coil
  kind=0;d=length(l)-.028;} // the coil is painted in drawRock; the distance stays a true distance (a flat inside reads as all contour)
 else if(t==1){ // a leaf with its veins
  kind=1;d=sdEll(l,vec2(.045,.018));}
 else{ // a clam
  kind=2;d=sdEll(l-vec2(0.,-.004),vec2(.024,.019));d=max(d,-(l.y+.017));}
 return d*s;}
void drawRock(vec2 w){
 float bed;vec3 alb=rockAlb(w,bed);
 // the rock: decor
 PIECE(-1.,alb,K_ROCK,w,vec2(1,0),.1,0.,1.);
 // the fossils: raised (light from above-left), decor
 int fk;vec2 lu;float fd=fossilD(w,fk,lu);
 if(fd<.01&&fk>=0){vec3 fa=alb*vec3(1.10,1.04,.95);if(fk==3)fa=alb*vec3(.80,.80,.74);
  if(fk==0){float r=length(lu),an=atan(lu.y,lu.x);float sp=fract((log(max(r,1e-4))-an/TAU)*2.2);fa*=.85+.3*ss(.2,.5,sp);}
  if(fk==1){fa*=.90+.12*ss(.002,.0,abs(lu.y))+.06*ss(.003,.0,abs(fract(lu.x*90.+abs(lu.y)*60.)-.5)*.02);}
  if(fk==2){fa*=.9+.1*sin(length(lu)*600.);}
  vec3 sl=SUNL;SUNL=normalize(vec3(-.5,.6,.65));PIECE(fd,fa,K_FOSSIL,lu*3.,vec2(1,0),.012,.35,1.);SUNL=sl;}
}
// The dust in front of the camera while it travels: soft motes, nearer than the rock, so they go by faster.
void dust(vec2 p,float camY){if(uMove<.01)return;
 for(int i=0;i<2;i++){float fi=float(i),k=1.5+fi*.8;vec2 w=vec2(p.x,p.y+camY*k);vec2 g=w*vec2(9.,7.)+fi*13.,ci=floor(g),f=fract(g)-.5-(h22(ci)-.5)*.6;
  float r=length(f*vec2(1.,.6))-.05-.04*h21(ci+3.);float on=step(.6,h21(ci+7.));veil(mix(vec3(.85,.80,.70),vec3(.3,.26,.22),h21(ci)),ss(.05,-.03,r)*on*.35*uMove,1.);}}
#endif

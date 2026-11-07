// ---- The rock between the scenes (the backdrop of the whole activity). World y: the garden of today at the top (ground at 2.1), the
// soil, then each scene's own rock, older and older as the camera goes down: the silts of the Ice Age (with ice lenses, the asphalt of
// La Brea, the pink loess of the Pampa), the ochre and red beds of the Cenozoic, the thin dark clay of the end of the Cretaceous, the grey
// mudstones and lignites of Hell Creek, the red clays of Tremp, the orange sandstones of the Gobi, the white chalk of the Kansas sea, the
// laminated lake shales of Liaoning, the cream limestone of Solnhofen, the variegated mudstones of the Morrison, the black shale of the
// Jurassic sea and the grey-green and red mudstones of Ischigualasto. Beds of low contrast (no hard stripes); small fossils in the rock
// of each age. The scenes' own fossils are drawn by the scene shaders. ----
// The region of each scene: its top (world y; the region goes down to the next top), two bed colours, an accent, its feature (0 none,
// 1 ice lenses, 2 lignite seams, 3 cross-bedding, 4 flint nodules, 5 fine lamination, 6 asphalt lenses, 7 roots and pebbles, 8 pale ash
// bands, 9 variegated) and its three kinds of small fossil (0 snail, 1 leaf, 2 clam, 3 fern, 4 ammonite, 5 footprint, 6 amber,
// 7 fish, 8 belemnite, 9 pebble, -1 none).
const int NR=20;
const float RTOP[NR]=float[](9.,1.75,1.2,-1.1,-3.3,-5.5,-7.6,-9.5,-15.9,-18.1,-22.5,-24.7,-26.9,-29.1,-31.3,-33.5,-35.7,-40.1,-42.3,-60.);
const vec3 RA[NR]=vec3[](vec3(.30,.22,.15),vec3(.50,.40,.29),vec3(.62,.58,.50),vec3(.48,.44,.38),vec3(.60,.57,.50),vec3(.70,.58,.50),vec3(.66,.47,.29),vec3(.50,.50,.47),vec3(.64,.38,.29),
 vec3(.78,.52,.33),vec3(.62,.60,.52),vec3(.86,.84,.76),vec3(.62,.38,.27),vec3(.54,.56,.50),vec3(.40,.39,.37),vec3(.84,.79,.66),vec3(.56,.36,.33),vec3(.30,.29,.28),vec3(.52,.55,.50),vec3(.52,.55,.50));
const vec3 RB[NR]=vec3[](vec3(.36,.27,.18),vec3(.56,.45,.33),vec3(.52,.50,.46),vec3(.56,.52,.45),vec3(.52,.50,.46),vec3(.64,.53,.46),vec3(.72,.53,.33),vec3(.60,.58,.52),vec3(.70,.46,.35),
 vec3(.84,.60,.38),vec3(.54,.52,.46),vec3(.80,.78,.70),vec3(.70,.46,.32),vec3(.60,.62,.55),vec3(.46,.45,.42),vec3(.88,.84,.72),vec3(.50,.54,.50),vec3(.36,.35,.33),vec3(.62,.44,.36),vec3(.62,.44,.36));
const vec3 RC[NR]=vec3[](vec3(.55,.52,.48),vec3(.62,.60,.55),vec3(.74,.78,.80),vec3(.16,.14,.12),vec3(.74,.78,.80),vec3(.78,.70,.62),vec3(.55,.34,.24),vec3(.30,.27,.22),vec3(.60,.62,.60),
 vec3(.70,.44,.28),vec3(.50,.36,.26),vec3(.36,.36,.38),vec3(.52,.32,.24),vec3(.80,.80,.74),vec3(.24,.21,.18),vec3(.76,.70,.56),vec3(.52,.44,.56),vec3(.22,.21,.20),vec3(.84,.82,.78),vec3(.84,.82,.78));
const float RF[NR]=float[](7.,7.,1.,6.,1.,0.,3.,2.,0.,3.,2.,4.,3.,5.,2.,5.,9.,5.,8.,8.);
const vec3 RK[NR]=vec3[](vec3(9,9,-1),vec3(9,0,-1),vec3(0,2,9),vec3(0,2,1),vec3(0,2,9),vec3(0,1,2),vec3(0,1,2),vec3(1,3,6),vec3(1,3,2),
 vec3(5,2,-1),vec3(1,3,6),vec3(4,2,7),vec3(7,2,1),vec3(7,1,3),vec3(1,3,6),vec3(7,4,8),vec3(5,3,1),vec3(4,8,7),vec3(3,5,1),vec3(3,5,1));
// The thin dark clay at the end of the Cretaceous (world y), with a pale line in it: just above the tyrannosaurs.
const float KPG=-9.5;
int regionAt(float y){int k=0;for(int j=1;j<NR;j++)if(y<RTOP[j])k=j;return k;}
vec3 rockAlb(vec2 w,out float bed,out int reg){
 float y=w.y+.035*(fbm2(vec2(w.x*1.6,w.y*.7))-.5)+.012*sin(w.x*2.3+w.y);
 float b=y*7.5,bi=floor(b);bed=fract(b);float hb=h11(bi);
 // the colour of the beds, blended from one region to the next over a short depth
 vec3 c=mix(RA[0],RB[0],hb);reg=regionAt(y);
 for(int j=1;j<NR;j++){float k=ss(RTOP[j]+.09,RTOP[j]-.09,y);if(k>0.)c=mix(c,mix(RA[j],RB[j],hb),k);}
 float f=RF[reg];vec3 ac=RC[reg];
 if(f==1.){float il=fbm2(vec2(w.x*4.,w.y*40.));c=mix(c,ac,ss(.80,.86,il)*.6);}                                   // ice lenses
 else if(f==2.){c=mix(c,ac,step(.86,hb)*ss(.15,.35,bed)*ss(.85,.65,bed)*.8);}                                   // lignite seams
 else if(f==3.){float x=fract((w.x*.8+y*2.4)*9.+.3*vn(w*6.));c*=.95+.07*ss(.0,.5,x)*ss(1.,.5,x)*step(.5,fract(bi*.37));} // cross-bedding
 else if(f==4.){vec2 g=w*vec2(9.,14.);float n=length(fract(g)-.5-(h22(floor(g))-.5)*.4);c=mix(c,ac,ss(.24,.18,n)*step(.82,h21(floor(g)))*.8);} // flint nodules
 else if(f==5.){c*=.96+.05*sin(y*260.+vn(w*8.)*3.);}                                                           // lamination
 else if(f==6.){float al=fbm2(vec2(w.x*3.,w.y*22.));c=mix(c,ac,ss(.74,.80,al)*.85);}                             // asphalt lenses
 else if(f==7.){float r=abs(vn(vec2(w.x*30.,w.y*6.))-.5);c=mix(c,ac*.8,ss(.02,.0,r)*.35*ss(1.2,2.0,w.y));}       // roots
 else if(f==8.){c=mix(c,ac,step(.92,hb)*ss(.2,.4,bed)*ss(.8,.6,bed)*.7);}                                       // pale ash bands
 else if(f==9.){float v=fbm2(vec2(w.x*.9,y*3.));c=mix(c,ac,ss(.55,.75,v)*.5);}                                   // variegated
 // the thin dark clay of the end of the Cretaceous, with a pale line in it
 float kb=abs(y-KPG);c=mix(c,vec3(.20,.17,.15),ss(.016,.010,kb));c=mix(c,vec3(.56,.50,.42),ss(.004,.0015,abs(y-KPG+.003)));
 // the beds: soft lighter tops
 c*=.94+.08*ss(.0,.25,bed)*ss(1.,.7,bed);
 return c;}
// The small fossils in the rock: one in some cells of a grid, raised a little from the rock. True distances everywhere (a distance that
// is flat inside makes the whole shape read as contour).
float fossilD(vec2 w,int reg,out int kind,out vec2 lu){vec2 g=w/vec2(.30,.26),ci=floor(g),f=(fract(g)-.5)*vec2(.30,.26);float hh=h21(ci+11.);kind=-1;lu=f;
 if(hh<.58||w.y>1.95)return 1.;vec2 o=(h22(ci)-.5)*vec2(.14,.10);vec2 l=rot(h21(ci+4.)*6.28)*(f-o);float s=.6+.6*h21(ci+9.);
 float pick=h21(ci+2.);vec3 ks=RK[reg];float kf=pick<.45?ks.x:pick<.8?ks.y:ks.z;if(kf<0.)kf=ks.x;kind=int(kf);
 if(kind==5||kind==7){l=f-o;}                                 // footprints and fish lie level
 lu=l/s;l/=s;float d;
 if(kind==0)d=length(l)-.028;                                 // a planorbid snail (the coil is painted)
 else if(kind==1)d=sdEll(l,vec2(.045,.018));                  // a leaf
 else if(kind==2){d=sdEll(l-vec2(0.,-.004),vec2(.024,.019));d=max(d,-(l.y+.017));} // a clam
 else if(kind==3){float sp=sdSeg(l,vec2(-.05,0.),vec2(.05,0.))-.002;float ax=abs(l.x);float w=.016*sat(1.-ax/.06)+.001;float lf=sdEll(vec2((fract(l.x*55.)-.5)/55.,l.y),vec2(.0075,w));d=min(sp,max(lf,ax-.055));} // a fern frond
 else if(kind==4)d=length(l)-.034;                            // an ammonite (its coil and ribs are painted)
 else if(kind==5){d=1e5;for(int i=0;i<3;i++){float a=(float(i)-1.)*.42;vec2 tp=vec2(sin(a),cos(a))*.040;d=min(d,sdCap(l,vec2(0.,-.006),tp,.007,.004));}d=min(d,sdEll(l-vec2(0.,-.010),vec2(.012,.014)));} // a three-toed footprint (a hollow)
 else if(kind==6)d=sdEll(l-vec2(0.,-.004),vec2(.016,.020))-.002*sin(atan(l.y,l.x)*3.); // a drop of amber
 else if(kind==7){d=sdEll(l,vec2(.050,.012));d=min(d,sdEll(rot(.5)*(l-vec2(.055,.006)),vec2(.012,.006)));d=min(d,sdEll(rot(-.5)*(l-vec2(.055,-.006)),vec2(.012,.006)));} // a small fish
 else if(kind==8)d=sdCap(l,vec2(-.04,0.),vec2(.035,0.),.007,.001);       // a belemnite guard
 else d=sdEll(l,vec2(.020,.015))+.003*vn(l*200.);              // a pebble
 return d*s;}
void drawRock(vec2 w){
 float bed;int reg;vec3 alb=rockAlb(w,bed,reg);
 // the rock: decor
 PIECE(-1.,alb,K_ROCK,w,vec2(1,0),.1,0.,1.);
 // the fossils: raised (light from above-left), or hollow (footprints); amber glows a little
 int fk;vec2 lu;float fd=fossilD(w,reg,fk,lu);
 if(fd<.01&&fk>=0){vec3 fa=alb*vec3(1.10,1.04,.95);vec3 sl=SUNL;SUNL=normalize(vec3(-.5,.6,.65));
  if(fk==3)fa=alb*vec3(.80,.80,.74);
  if(fk==0){float r=length(lu),an=atan(lu.y,lu.x);float sp=fract((log(max(r,1e-4))-an/TAU)*2.2);fa*=.85+.3*ss(.2,.5,sp);}
  if(fk==1){fa*=.90+.12*ss(.002,.0,abs(lu.y))+.06*ss(.003,.0,abs(fract(lu.x*90.+abs(lu.y)*60.)-.5)*.02);}
  if(fk==2){fa*=.9+.1*sin(length(lu)*600.);}
  if(fk==4){float r=length(lu),an=atan(lu.y,lu.x);float sp=fract((log(max(r,1e-4))-an/TAU)*1.9);float rib=.5+.5*sin(an*22.+r*40.);fa*=(.80+.3*ss(.15,.5,sp))*(.92+.10*rib*ss(.012,.03,r));}
  if(fk==5){fa=alb*.72;SUNL=normalize(vec3(.5,-.6,.65));}      // a hollow: lit from the other side
  if(fk==6){fa=vec3(.85,.48,.12);}
  if(fk==7){fa*=.92+.10*ss(.002,.0,abs(lu.y))+.05*sin(lu.x*500.);}
  if(fk==8)fa=alb*vec3(1.05,.95,.82);
  if(fk==9)fa=alb*(.85+.3*h21(floor(w*9.)));
  PIECE(fd,fa,fk==6?K_FLAT:K_FOSSIL,lu*3.,vec2(1,0),.012,.35,1.);
  if(fk==6)glow(vec3(.30,.14,.02)*ss(.0,-.012,fd),1.);
  SUNL=sl;}
}
// The dust in front of the camera while it travels: soft motes, nearer than the rock, so they go by faster.
void dust(vec2 p){if(uMove<.01)return;
 for(int i=0;i<2;i++){float fi=float(i),k=1.5+fi*.8;vec2 w=vec2(p.x,p.y+uCam.y/uCam.z*k);vec2 g=w*vec2(9.,7.)+fi*13.,ci=floor(g),f=fract(g)-.5-(h22(ci)-.5)*.6;
  float r=length(f*vec2(1.,.6))-.05-.04*h21(ci+3.);float on=step(.6,h21(ci+7.));veil(mix(vec3(.85,.80,.70),vec3(.3,.26,.22),h21(ci)),ss(.05,-.03,r)*on*.35*uMove,1.);}}
void main(){P=pScreen();vec2 W=uCam.xy+P*uCam.z;PX=uCam.z/uR.y;
 F=vec4(baseCol(),1.);drawRock(W);dust(P);OF=vec4(F.rgb,1.);}

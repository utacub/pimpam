// 18 · Jardí d'esponges de vidre. On the floor of the abyss, a garden of glass sponges: Venus's flower baskets, tall lattice tubes
// of glass with a sieve on top and a tuft of fibres at the base, where a pair of small shrimps lives; glass-rope sponges sway on
// their long stalks. Glints of light climb the lattices, the current carries specks through them, and a pink swimming sea cucumber
// lifts off the floor with its veil and floats away.
float floorQ(float x){float wx=uScene.x+x*uScene.z;return (-22.95+.07*sin(wx*1.9+.4)+.035*sin(wx*4.7+1.)+.012*sin(wx*11.3)-uScene.y)/uScene.z;}
void basket(vec2 q,float x0,float H,float R,float t,float s,float dim){
 float y0=floorQ(x0);float u=(q.y-y0)/H;if(u<-.15||u>1.12)return;
 float bend=.05*H*u*u*sin(s)+.008*sin(t*.4+s)*u*u;float x=q.x-x0-bend;float r=R*(.75+.4*u);
 // the base: a tuft of glass fibres spreading into the floor
 if(u<.05){float fan=abs(x)-R*(.6-u*6.);float fib=ln(abs(fract(x/R*6.+u*3.)-.5)*R/6.,.0015)*ss(.1,-.1,u)*ss(.0,-1.,fan/R);glow(vec3(.9,.85,.7)*fib*.5*dim);}
 if(u<0.)return;
 float d=abs(x)-r;d=max(d,(u-1.)*H);
 glassN(d,vec2(sign(x),0.),r*.5,vec3(1.,.95,.8),vec3(.8,.65,.4),.8,s,.3*dim);
 float inside=cov(d);
 // the lattice: vertical and horizontal bars and diagonal ridges, seen on the cylinder
 float a=asin(clamp(x/r,-1.,1.));vec2 g=vec2(a/1.5708*4.,u*H/(R*.55));vec2 fg=abs(fract(g)-.5);float cw=cos(a);
 float lat=ln(fg.x*R*.4/max(cw,.25),.0016)+ln(fg.y*R*.55,.0016)+.5*ln(abs(fract((g.x+g.y)*.5)-.5)*R*.6,.0012);
 float glint=pow(.5+.5*sin(u*7.-t*1.6+s*3.),6.);
 glow((vec3(1.,.8,.45)*lat*(.18+.6*glint)+vec3(.35,.85,1.)*lat*glint*.5)*inside*(.5+.5*cw)*dim);
 // the sieve plate on top
 float top=length(vec2(x,(u-1.)*H*3.))-r;glow(vec3(1.,.92,.75)*ln(abs(top),.003)*.6*dim);
 // the shrimp pair inside, climbing and sinking
 for(int k=0;k<2;k++){float sy=.35+.25*sin(t*.5+float(k)*2.5+s),sx=.35*R*sin(t*.7+float(k)*1.3+s);vec2 p=vec2(x-sx,(u-sy)*H);float sd=sdEll(p,vec2(.012,.006))*1.;
  glow(vec3(1.,.5,.4)*(cov(sd)*.8+ln(abs(sd),.004)*.4)*dim+vec3(1.,.4,.3)*ln(abs(p.y+.002*sin(p.x*200.)),.0012)*ss(.03,.0,abs(p.x+.02))*.3*dim);}}
void ropeSponge(vec2 q,float x0,float H,float t,float s,float dim){
 float y0=floorQ(x0);float u=(q.y-y0)/H;if(u<0.||u>1.5)return;float uu=min(u,1.);
 float sway=.12*H*uu*uu*sin(t*.5+s)+.03*H*uu*sin(t*1.1+s*2.)+.1*H*uu*sin(s);float x=q.x-x0-sway;
 // the stalk: a rope of twisted glass fibres, with small yellow polyps along it
 if(u<1.){float st=ln(abs(x),.0025)*ss(1.,.9,u);float twist=pow(.5+.5*sin(u*60.-t*.5),4.)*ln(abs(x),.006);
  glow((vec3(.85,.9,1.)*st*.5+vec3(.6,.85,1.)*twist*.3)*dim);
  float pol=exp(-length(vec2(x,(fract(u*9.)-.5)*.08))/.006)*step(.15,u)*step(u,.85);glow(vec3(1.,.8,.25)*pol*.8*dim);}
 // the sponge on top: a glass vase leaning with the stalk, its mouth open upwards, a fine lattice in its wall
 float slope=.24*sin(t*.5+s)+.03*sin(t*1.1+s*2.)+.1*sin(s),rx=.1*H,ry=.17*H;
 vec2 b=rot(-slope)*vec2(x,(u-1.)*H)-vec2(0.,ry*.82);if(abs(b.x)>rx*2.||abs(b.y)>ry*1.6)return;
 float wr=rx*(.62+.5*ss(-ry,ry*.8,b.y));float bd=max(sdEll(b,vec2(wr,ry)),b.y-ry*.82);
 glassN(bd,normalize(b/vec2(wr,ry)),ry*.3,vec3(1.,.95,.88),vec3(.65,.78,1.),1.2,s,.4*dim);
 float inside=cov(bd);vec2 g=abs(fract(vec2(b.x/wr*2.5,b.y/ry*3.5))-.5);
 glow(vec3(.8,.9,1.)*(ln(g.x*wr*.4,.0012)+ln(g.y*ry*.3,.0012))*inside*.12*dim);
 vec2 mq=vec2(b.x/(wr*.57),(b.y-ry*.82)/(ry*.13));float mouth=length(mq)-1.;
 glow(vec3(.85,.92,1.)*ln(abs(mouth)*ry*.11,.0018)*(.75+.25*ss(0.,.6,mq.y))*dim);}
void scene(vec2 q,float t){
 // the current: specks crossing from left to right, close to the floor
 for(int i=0;i<34;i++){float fi=float(i);vec2 p=vec2(wrap(-ASP-.1+(2.*ASP+.2)*h11(fi)+.05*t*(.6+.4*h11(fi+1.)),-ASP-.1,ASP+.1),-.3+.75*h11(fi+2.)+.02*sin(t*.6+fi));
  glow(mix(vec3(.6,.75,.9),vec3(.3,.9,1.),h11(fi+3.))*exp(-length((q-p)*vec2(.5,1.))/.003)*.6);}
 ropeSponge(q,-.62,.6,t,1.,.6);ropeSponge(q,.66,.56,t,3.,.65);ropeSponge(q,.18,.45,t,5.,.45);
 basket(q,-.3,.5,.06,t,1.,1.);basket(q,.38,.62,.07,t,2.,1.);basket(q,-.78,.38,.05,t,3.,.7);basket(q,.02,.32,.04,t,4.,.6);basket(q,.8,.36,.045,t,5.,.7);
 // the swimming sea cucumber: it rises from the floor in slow strokes of its veil and drifts to the right
 float k=jet(t,3.,.3);vec2 C=vec2(-.1+.035*t,floorQ(-.1)+.08+.05*k);float b=beat(t,3.,.3);
 vec2 l=rot(.25+.1*sin(t*.4))*(q-C)/.16;if(dot(l,l)<4.){enter(.16);
  float body=sdEll(l-vec2(0.,-.1),vec2(.55,.32));float veil=sdEll(l-vec2(-.35,.25+.05*b),vec2(.35+.05*b,.22*(1.-.4*b)));float brim=sdEll(l-vec2(.45,-.3),vec2(.3,.1+.06*b));
  float d=min(min(body,veil),brim);glassN(d,normalize(l),.12,vec3(1.,.55,.7),vec3(1.,.45,.65),1.,.4,.6);
  glow(mix(vec3(.9,.2,.45),vec3(1.,.5,.6),ss(-.4,.3,l.y))*cov(d)*.22);
  vec2 g=(l-vec2(.05,-.12))/vec2(.32,.08);glow(vec3(1.,.4,.25)*exp(-dot(g,g))*.5);
  glow(vec3(1.,.7,.8)*ln(abs(fract(l.x*8.)-.5)/8.,.004)*cov(body)*.25);leave();}
}

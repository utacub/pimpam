// 20 · Pops dumbo. Near the floor of the abyss, dumbo octopuses (Grimpoteuthis): soft glass bodies, pale peach and lilac, two round
// fins like ears that flap, and a skirt of webbed arms that opens and pulses like a bell. One hovers and bounces over the floor, a
// second glides in and they turn round each other; a small one watches from far away. Then the climb back to the surface.
float floorQ(float x){float wx=uScene.x+x*uScene.z;return (-22.95+.07*sin(wx*1.9+.4)+.035*sin(wx*4.7+1.)+.012*sin(wx*11.3)-uScene.y)/uScene.z;}
void dumbo(vec2 q,vec2 c,float sz,float ang,float t,float s,vec3 col,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>1.3||l.y>1.1||l.y<-1.2)return;enter(sz);
 float b=beat(t,2.2,h11(s)),open=1.-b;float fl=sin(t*TAU*.85+s);
 // the skirt: eight webbed arms; the web edge scalloped, the arm lines and the fine cirri showing through
 vec2 p=l-vec2(0.,-.05);float pr=length(p),pa=atan(p.x,-p.y);float span=.55+.75*open;
 float edge=.75+.12*open-.08*abs(sin(pa*4./max(span,.3)*1.5708*2.));float inSk=ss(span+.05,span-.05,abs(pa))*ss(edge+.01,edge-.01,pr);
 float arms=0.;for(int i=0;i<8;i++){float a=(float(i)/7.-.5)*2.*span*.95;float da=abs(pa-a)*pr;arms+=ln(da,.012)*step(pr,edge+.05)*(1.-pr*.6);}
 float cirri=ln(abs(fract(pr*22.)-.5)/22.,.004)*arms*0.+pow(.5+.5*cos(pr*70.),6.)*arms*.4;
 put(inSk*col*.16*dim,inSk*.45*dim,mix(col,vec3(1.),.4),p/max(pr,1e-3)*.003*sz);
 glow((col*arms*.3+vec3(1.,.95,.9)*cirri*.3+col*ln(abs(pr-edge),.01)*ss(span+.05,span-.05,abs(pa))*.5)*dim);
 // the ear fins
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 f=l-vec2(sg*.3,.38);f=rot(sg*(.55+.5*fl))*f;float fd=sdEll(f-vec2(sg*.14,0.),vec2(.17,.1*(.6+.4*abs(fl))));
  glassN(fd,normalize(f),.06,mix(col,vec3(1.),.3),col,1.,s+.2,.6*dim);glow(col*cov(fd)*.1*dim);}
 // the head and mantle: one soft dome
 float d=sdEll(l-vec2(0.,.28),vec2(.38*(1.-.04*b),.42*(1.+.04*b)));
 glassN(d,normalize(l-vec2(0.,.2)),.14,mix(col,vec3(1.),.35),col,1.2,s,.68*dim);
 glow(col*cov(d)*.14*dim);vec2 g=(l-vec2(0.,.42))/vec2(.12,.16);glow(mix(col,vec3(1.,.6,.4),.5)*exp(-dot(g,g))*.25*cov(d)*dim);
 // the eyes: big and dark, with a bright point
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 e=l-vec2(sg*.17,.12);float ed=length(e)-.075;
  put(cov(ed)*vec3(.04,.04,.08)*dim,cov(ed)*.95*dim,vec3(0.),vec2(0.));glow(vec3(1.,.95,.95)*exp(-length(e-vec2(.02,.025))/.012)*.7*dim+col*ln(abs(ed),.01)*.4*dim);}
 leave();}
void scene(vec2 q,float t){
 float fl=floorQ(0.);
 // a few brittle stars and small mounds on the floor, the arms moving slowly
 for(int i=0;i<3;i++){float fi=float(i),x0=-.6+fi*.6+.1*h11(fi);vec2 c=vec2(x0,floorQ(x0)+.008);vec2 p=(q-c)*vec2(1.,3.);float r=length(p),a=atan(p.y,p.x);
  float arm=0.;for(int k=0;k<5;k++){float ak=float(k)*1.2566+fi+.15*sin(t*.5+float(k)+fi);float da=abs(sin((a-ak)*.5))*r*2.;arm+=ln(da,.004)*ss(.12,.0,r);}
  glow(vec3(1.,.6,.5)*arm*.4);}
 // the small one, far, watching and bobbing
 dumbo(q,vec2(.7-.01*t,fl+.32+.03*sin(t*.9)),.07,.1*sin(t*.5),t,5.,vec3(.85,.75,1.),.55);
 // the lilac one glides in from the right and they turn round each other
 float ph=t*.32;vec2 M=vec2(-.08,fl+.4);vec2 c1=M+vec2(.3*cos(ph+1.),.08*sin(ph+1.)+.04*sin(t*.9))+vec2(1.1*(1.-ss(0.,5.,t)),.15*(1.-ss(0.,5.,t)));
 dumbo(q,c1,.18,-.2*cos(ph+1.)+.1,t,2.,vec3(.75,.65,1.),.85);
 // the peach one: it hovers and bounces over the floor, then joins the dance
 float k=jet(t,2.2,h11(1.));vec2 c0=M+vec2(.3*cos(ph+4.1),.08*sin(ph+4.1))+vec2(0.,.02*sin(k*1.5));
 dumbo(q,c0,.26,.2*cos(ph+4.1)-.05,t,1.,vec3(1.,.62,.5),1.);
}

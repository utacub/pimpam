// 10 · Pop de vidre. A glass octopus (Vitreledonella richardi): a clear body where only the long eyes and the golden digestive gland
// can be seen; it swims like a jellyfish, opening the violet web between its eight arms and closing it to rise. A smaller one
// follows it far behind.
void glassOcto(vec2 q,vec2 c,float sz,float ang,float t,float s,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>1.4||l.y>1.05||l.y<-1.9)return;enter(sz);
 float b=beat(t,2.5,h11(s)),open=1.-b;
 // the eight arms and the web between them (the web reaches about half way down the arms)
 float arms=0.,armc=0.,webc=0.;vec2 r0=vec2(0.,-.12);vec2 p=l-r0;float pr=length(p),pa=atan(p.x,-p.y);
 float span=.35+.75*open;float aMin=1e3,aMax=-1e3;
 for(int i=0;i<8;i++){float fi=float(i),u0=(fi/7.-.5)*2.;float a=u0*span+.08*sin(t*1.3+fi);
  float L=1.35+.15*h11(fi+s);float curl=(.25+.35*b)*sign(u0+.001)*-1.;
  // along the arm: its direction bends (curl) towards the tip
  float u=sat(pr/L);float aa=a+curl*u*u+.12*sin(u*6.-t*2.+fi);float da=abs(pa-aa)*pr;
  float w=.06*(1.-.8*u);armc+=cov(da-w)*step(pr,L);arms+=ln(abs(da-w),.012)*step(pr,L)*(1.-u*.5);
  aMin=min(aMin,a);aMax=max(aMax,a);}
 float webL=.55+.15*open+.06*cos(pa*14./max(span,.3));float inWeb=ss(aMin-.05,aMin+.05,pa)*ss(aMax+.05,aMax-.05,pa)*ss(webL+.02,webL-.02,pr)*step(.1,pr);
 put(inWeb*pal(.72+pr*.4+t*.02)*vec3(.9,.7,1.)*.16*dim+ln(abs(pr-webL),.012)*inWeb*vec3(.7,.5,1.)*.0,inWeb*.35*dim,vec3(.9,.85,1.05),p/max(pr,1e-3)*.004*sz);
 glow(vec3(.8,.5,1.)*ln(abs(pr-webL),.01)*ss(aMin-.05,aMin+.05,pa)*ss(aMax+.05,aMax-.05,pa)*.35*dim);
 put(armc*vec3(.6,.75,.95)*.1*dim,min(.7,armc*.45)*dim,vec3(.9,.95,1.05),vec2(0.));glow(vec3(.55,.8,1.)*arms*.35*dim);
 // the mantle: a tall clear dome above the head
 float d=sdEll(l-vec2(0.,.4),vec2(.36*(1.+.06*b),.55*(1.-.05*b)));d=min(d,sdEll(l-vec2(0.,-.05),vec2(.3,.22)));
 glassN(d,normalize(l-vec2(0.,.3)),.14,vec3(.88,.95,1.06),vec3(.6,.85,1.),1.3,s,.6*dim);
 float inside=cov(d);
 // the golden digestive gland, a spindle standing in the mantle, and the long silver eyes at the sides of the head
 vec2 g=(l-vec2(0.,.42))/vec2(.07,.22);glow((vec3(1.,.65,.12)*exp(-dot(g,g)*1.2)*1.1+vec3(1.,.8,.3)*exp(-dot(g,g)*.2)*.15)*inside*dim);
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 e=l-vec2(.2*sg,-.04);float ed=sdEll(e,vec2(.045,.11));
  put(cov(ed)*mix(vec3(.6,.7,.8),vec3(.05,.08,.12),ss(.06,-.06,e.y))*.6*dim,cov(ed)*.9*dim,vec3(.1),vec2(0.));glow(vec3(.6,.85,1.)*ln(abs(ed),.012)*.5*dim);}
 leave();}
void scene(vec2 q,float t){
 // the small one, far behind on the right, climbing
 glassOcto(q,vec2(.62+.02*sin(t*.3),-.5+.05*jet(t,2.5,h11(4.))),.11,-.25+.08*sin(t*.4),t,4.,.5);
 // the big one: it rises in beats from below the screen and drifts to the left, the body leaning with the swim
 float k=jet(t,2.5,h11(1.));vec2 C=vec2(.12-.025*t+.04*sin(t*.35),-.55+.075*k);
 glassOcto(q,C,.3,.25*sin(t*.3)+.1,t,1.,1.);
}

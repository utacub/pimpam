// 9 · Calamar de vidre. Close to glass squids (Cranchiidae): clear barrel bodies with small round fins that paddle, big eyes with a
// crescent of blue light beneath, a silver digestive gland standing inside, and dots of colour (chromatophores) that open and close.
// The big one hovers, gathers its arms and jets away in pulses; a smaller one climbs with its fins; a third, far, rolls slowly.
// Local frame: the mantle along +x (the tail and fins at +x), the head and arms towards -x.
void squid(vec2 q,vec2 c,float sz,float ang,float t,float s,float jetk,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(l.x<-1.5||l.x>1.25||abs(l.y)>.75)return;enter(sz);
 float sq=jetk;float mw=.24*(1.-.18*sq);
 // arms and the two longer tentacles, trailing behind the head; they gather when it jets
 float arms=0.;for(int i=0;i<8;i++){float fi=float(i),u=-(l.x+.42);if(u<0.||u>.6+.15*h11(fi+s))continue;
  float spread=(fi/7.-.5)*(.34-.24*sq)*(1.+u*1.4);float y=spread+.04*sin(u*9.-t*2.2+fi)*u*2.;arms+=ln(abs(l.y-y),.016*(1.-u))*(1.-u*.8);}
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.,u=-(l.x+.42);if(u>0.&&u<1.05){float y=sg*(.06+.05*u)+.07*sin(u*5.-t*1.7+sg)*u;arms+=ln(abs(l.y-y),.01)*(1.-u*.7)*.8;}}
 glow(vec3(.6,.8,1.)*arms*.35*dim);
 // fins: two round paddles at the tail, beating
 float fl=sin(t*TAU*.9+s);
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 f=l-vec2(.88,sg*.07);f=rot(sg*(.9+.5*fl))*f;float d=sdEll(f-vec2(0.,sg*.13),vec2(.14,.16*(.6+.4*abs(fl))));
  glassN(d,normalize(f),.07,vec3(.85,.95,1.1),vec3(.55,.85,1.),1.3,s,.5*dim);}
 // the mantle: a clear barrel
 float d=sdEll(l-vec2(.33,0.),vec2(.62,mw));vec2 n=normalize((l-vec2(.33,0.))/vec2(.62,mw));
 glassN(d,n,.12,vec3(.88,.95,1.06),vec3(.6,.9,1.),1.2,s,.62*dim);
 float inside=cov(d);
 // the digestive gland: a silver spindle standing in the body; chromatophores: amber and rust dots that open and close
 vec2 g=(l-vec2(.25,0.))/vec2(.05,.16*(1.-.15*sq));glow(vec3(.75,.85,.95)*exp(-dot(g,g)*1.5)*.5*inside*dim+vec3(1.,.8,.4)*exp(-dot(g,g)*6.)*.4*inside*dim);
 vec2 cp=l*vec2(14.,16.);vec2 id=floor(cp);vec2 hh=h22(id+s);float open=.5+.5*sin(t*(.6+hh.x)+hh.y*20.);
 float dot1=length(fract(cp)-.5-.25*(hh-.5))-.08-.14*open;vec3 cc=mix(vec3(1.,.45,.1),vec3(.9,.25,.35),hh.y);
 glow(cc*cov(dot1/15.)*inside*step(.55,hh.x)*.7*dim);
 // the head and the eyes, with a blue crescent of light under each eye
 float hd=sdEll(l-vec2(-.3,0.),vec2(.16,.17*(1.-.1*sq)));glassN(hd,normalize(l-vec2(-.3,0.)),.06,vec3(.9,.95,1.05),vec3(.6,.85,1.),1.,s,.6*dim);
 vec2 e=l-vec2(-.3,.04);float eye=length(e)-.085;put(cov(eye)*vec3(.03,.05,.08),cov(eye)*.92,vec3(.05),vec2(0.));
 glow(vec3(.7,.85,1.)*ln(abs(eye),.01)*.6*dim+vec3(.9,.95,1.)*exp(-length(e-vec2(.025,.03))/.012)*.5*dim);
 float cres=abs(length(e-vec2(0.,.03))-.12)-.012;glow(vec3(.15,.65,1.)*(cov(cres)*1.2+ln(abs(cres),.03)*.6)*ss(.0,-.06,e.y)*dim);
 leave();}
void scene(vec2 q,float t){
 // far: a small one rolling slowly
 squid(q,vec2(-.7+.015*t,.32),.1,t*.15+1.,t,5.,.3,.5);
 // a medium one climbing with its fins on the right
 squid(q,vec2(.6+.01*sin(t*.5),-.55+.045*t),.17,1.35+.12*sin(t*.4),t,3.,.0,.8);
 // the big one: it hovers, gathers its arms and jets tail first in three pulses, turning between them
 float P=3.6,ph=fract(t/P),n=floor(t/P);float sq=ph<.25?ss(0.,.2,ph):1.-ss(.25,.6,ph);
 float run=n+ss(.12,.55,ph);float ang=.35-.35*sin(run*.9);vec2 dir=vec2(cos(ang),sin(ang));
 vec2 C=vec2(-.45,-.18)+vec2(.11*run,.035*run)+.015*vec2(sin(t*.7),cos(t*.6));
 squid(q,C,.36,ang,t,1.,sq,1.);
}

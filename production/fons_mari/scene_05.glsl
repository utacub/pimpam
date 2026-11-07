// 6 · Àngels de mar. Sea angels (Clione) fly through the water like small glass birds: two wings beat at the neck, an orange heart
// glows in the body; they loop in figure eights and climb in spurts. Sea butterflies (Limacina), with violet spiral shells, flutter
// up between them and sink again.
void angel(vec2 q,vec2 c,float sz,float ang,float t,float s,vec3 gut,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>1.1||abs(l.y)>1.)return;enter(sz);
 float f=t*TAU*1.15+s*2.,flap=sin(f);
 // the two wings, from the neck; they foreshorten as they turn
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.,th=.15+.75*flap;vec2 dir=vec2(sg*cos(th),sin(th)),cen=vec2(.1*sg,.3)+dir*.34;
  vec2 wl=vec2(dot(l-cen,dir),dot(l-cen,vec2(-dir.y,dir.x)));float d=sdEll(wl,vec2(.36,.2*(.55+.45*abs(cos(f)))));
  glassN(d,dir,.1,vec3(.8,.9,1.1),vec3(.55,.75,1.),1.4,s+float(k)*.3,.55*dim);
  glow(vec3(.5,.7,1.)*ln(abs(wl.y),.006)*cov(d)*.3*dim);}
 // the body: a glass drop with a round head; the heart and the orange cones of the head show through
 float w=.2*(1.-.5*ss(.05,-.6,l.y));float d=min(sdEll(l-vec2(0.,-.08),vec2(w,.48)),length(l-vec2(0.,.4))-.16);
 glassN(d,normalize(l-vec2(0.,.05)),.1,vec3(.85,.92,1.05),mix(gut,vec3(.7,.9,1.),.6),1.1,s,.7*dim);
 vec2 g=(l-vec2(0.,-.2))/vec2(.07,.13);glow(gut*(exp(-dot(g,g))*1.2+.25*exp(-dot(g,g)*.12))*cov(d)*dim);
 vec2 h=(l-vec2(0.,.47))/vec2(.06,.04);glow(gut*exp(-dot(h,h))*.6*dim);
 leave();}
void butterfly(vec2 q,vec2 c,float sz,float t,float s,float dim){
 vec2 l=(q-c)/sz;if(dot(l,l)>1.3)return;enter(sz);
 float f=t*TAU*1.9+s*3.,flap=sin(f);
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.,th=.35+.8*flap;vec2 dir=vec2(sg*cos(th),sin(th)),cen=vec2(.08*sg,.2)+dir*.3;
  vec2 wl=vec2(dot(l-cen,dir),dot(l-cen,vec2(-dir.y,dir.x)));float d=sdEll(wl,vec2(.3,.16));
  glassN(d,dir,.07,vec3(.9,.95,1.1),vec3(.75,.85,1.),1.2,s,.5*dim);}
 // the shell: a small violet spiral
 vec2 p=l-vec2(0.,-.12);float r=length(p),a=atan(p.y,p.x)+t*.2;float sp=fract(log(max(r,1e-3))/.55-a/TAU);
 float d=r-.3;glassN(d,p/max(r,1e-4),.1,vec3(.75,.55,1.),vec3(.8,.5,1.),1.,s,.7*dim);
 glow(vec3(.75,.35,1.)*ln(abs(sp-.5)*r*.55,.012)*cov(d)*.7*dim+vec3(1.,.6,.3)*exp(-r*r/.01)*.4*dim);
 leave();}
void scene(vec2 q,float t){
 // sea butterflies: they climb in spurts while they beat, and sink a little between
 for(int i=0;i<10;i++){float fi=float(i),y=wrap(-.9+fi*.17+.05*jet(t,1.3+.4*h11(fi),h11(fi+2.))-.012*t,-.62,.62);
  vec2 c=vec2(-ASP+.1+(2.*ASP-.2)*h11(fi*3.1+1.)+.05*sin(t*.7+fi),y);butterfly(q,c,.022+.014*h11(fi+4.),t,fi,.55+.45*h11(fi+8.));}
 // sea angels: figure eights of different sizes, the bodies leaning into the turns
 for(int i=0;i<6;i++){float fi=float(i),w=.55+.15*h11(fi),ph=t*w+fi*1.9;
  vec2 C=vec2(-.75+fi*.3+.1*sin(fi*2.),-.25+.35*h11(fi*1.3+5.)),A=vec2(.18+.06*h11(fi+1.),.11);
  vec2 c=C+vec2(A.x*sin(ph),A.y*sin(2.*ph))+vec2(.04*t*(h11(fi+7.)-.5),.012*t);
  vec2 v=vec2(A.x*cos(ph),2.*A.y*cos(2.*ph));float lean=-.6*v.x/(A.x+.01);
  float sz=fi==2.?.2:.1+.06*h11(fi+3.);vec3 gut=fi==1.||fi==4.?vec3(1.,.35,.55):vec3(1.,.45,.12);
  angel(q,c,sz,lean,t,fi,gut,fi==2.?1.:.7+.3*h11(fi));}
}

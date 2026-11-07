// 17 · Peixos llanterna. A school of lanternfish rises through the dark, each fish drawn in light by the rows of blue and green dots
// along its belly and a brighter lamp by its tail; silver hatchetfish hang among them and tilt; tiny copepods sparkle around.
void lantern(vec2 q,vec2 c,vec2 v,float L,float t,float s,float dim){
 vec2 f=q-c;if(dot(f,f)>L*L*1.4)return;f=rot(atan(v.y,v.x))*f/L;f.y-=.06*sin(f.x*4.-t*8.-s)*ss(.3,-.6,f.x);
 float body=sdEll(f-vec2(.05,0.),vec2(.55,.15)),tail=max(abs(f.y)-.03-.55*max(-f.x-.42,0.),abs(f.x+.6)-.14);float d=min(body,tail)*L;
 float cb=cov(d);put(cb*mix(vec3(.02,.03,.06),vec3(.12,.14,.2),ss(-.1,.1,-f.y))*.6*dim,cb*.95*dim,vec3(.05,.06,.1),vec2(0.));
 glow(vec3(.3,.4,.6)*ln(abs(d),.003)*.12*dim);
 // the photophores: two rows of dots along the belly, a lamp near the tail; the colour of each school member is its own
 vec3 pc=mix(vec3(.2,.6,1.),vec3(.3,1.,.65),h11(s+2.));float tw=.75+.25*sin(t*(1.+h11(s))+s*5.);
 float rowA=abs(f.y+.08),rowB=abs(f.y+.02-.02*f.x);float dots=pow(.5+.5*cos(f.x*TAU*5.),8.)*ss(.52,.3,abs(f.x-.05));
 glow(pc*(exp(-rowA/.025)+.7*exp(-rowB/.025))*dots*ss(.1,.0,f.y)*cb*2.2*tw*dim);
 glow(pc*exp(-length(f-vec2(-.38,.07))/.04)*1.2*tw*dim+pc*exp(-length(f-vec2(-.38,.07))/.15)*.15*dim);
 // the big eye
 vec2 e=f-vec2(.42,.03);float ed=length(e)-.08;put(cov(ed*L)*vec3(.6,.75,.9)*.5*dim,cov(ed*L)*dim,vec3(0.),vec2(0.));put(cov((length(e)-.045)*L)*vec3(.0),cov((length(e)-.045)*L)*dim,vec3(0.),vec2(0.));}
void hatchet(vec2 q,vec2 c,float L,float tilt,float t,float s){
 vec2 f=rot(tilt)*(q-c)/L;if(dot(f,f)>1.3)return;
 // a deep, flat silver body like the blade of an axe, a thin tail, tubular eyes looking up, a row of lights along the belly
 float body=sdTri(f,vec2(-.35,.22),vec2(.4,.25),vec2(.05,-.55));body=min(body,sdEll(f-vec2(.1,.05),vec2(.42,.25)))-.04;
 float tail=max(abs(f.y-.15)-.03-.4*max(-f.x-.5,0.),abs(f.x+.6)-.15);float d=min(body,tail)*L;float cb=cov(d);
 float sheen=.5+.5*sin(f.x*6.+f.y*4.+t*.6+s);put(cb*mix(vec3(.3,.36,.48),vec3(.75,.82,.95),sheen)*.4,cb*.95,vec3(.1),vec2(0.));
 glow(vec3(.5,.7,1.)*ln(abs(d),.003)*.15);
 float belly=abs(sdTri(f,vec2(-.35,.22),vec2(.4,.25),vec2(.05,-.55))+.06);glow(vec3(.2,.6,1.)*exp(-belly/.02)*pow(.5+.5*cos(f.x*30.),4.)*ss(.0,-.2,f.y)*cb*1.2);
 put(cov((length(f-vec2(.3,.3))-.08)*L)*vec3(.05),cov((length(f-vec2(.3,.3))-.08)*L),vec3(0.),vec2(0.));glow(vec3(.6,.8,1.)*exp(-length(f-vec2(.32,.33))/.02)*.6);}
void scene(vec2 q,float t){
 // copepods: tiny sparks drifting
 for(int i=0;i<30;i++){float fi=float(i);vec2 p=vec2(-ASP+2.*ASP*h11(fi+11.)+.03*sin(t*.5+fi),wrap(-.55+1.1*h11(fi+13.)+.015*t*(h11(fi)-.3),-.55,.55));
  glow(mix(vec3(.3,.7,1.),vec3(.5,1.,.8),h11(fi+1.))*exp(-length(q-p)/.003)*(.5+.5*sin(t*(1.+h11(fi+2.))+fi*3.)));}
 // the school: it rises from the bottom left to the top right, each fish weaving in and out
 vec2 S=vec2(-.55+.06*t,-.55+.07*t);
 for(int i=0;i<26;i++){float fi=float(i),ph=t*(.8+.3*h11(fi))+fi*1.3;vec2 o=(h22(vec2(fi,4.))-.5)*vec2(1.1,.8)+.05*vec2(sin(ph),cos(ph*1.3));
  vec2 c=S+o+vec2(.1*sin(t*.2+fi*.3),0.);c.y=wrap(c.y,-.75,.75);c.x=wrap(c.x,-ASP-.2,ASP+.2);vec2 v=vec2(.06,.07)+.05*vec2(cos(ph),-1.3*sin(ph*1.3));
  float L=.065+.035*h11(fi+3.);lantern(q,c,v,L,t,fi,.55+.45*h11(fi+6.));}
 // hatchetfish hanging and tilting
 for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(-.7+fi*.47+.03*sin(t*.3+fi),-.2+.35*h11(fi+20.)+.03*sin(t*.5+fi*2.));
  hatchet(q,c,.06+.03*h11(fi+21.),.25*sin(t*.4+fi*1.7),t,fi);}
}

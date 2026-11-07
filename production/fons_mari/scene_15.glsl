// 16 · Pirosomes. Pyrosomes: hollow glass tubes made of thousands of tiny animals. When one lights up, the light runs along it in
// soft blue-green waves and wakes the next tube, which answers; the tubes drift and turn slowly, the big one passes close.
float pyLight(float u,float t,float t0){float a=t-t0;if(a<0.)return 0.;float w=pow(.5+.5*sin(u*5.-a*2.4),3.);return ss(0.,1.2,a)*(.25+w)*(.75+.25*sin(a*.6));}
void pyrosome(vec2 q,vec2 c,float sz,float ang,float t,float t0,float s,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>1.25||abs(l.y)>.5)return;enter(sz);
 float R=.2+.035*(l.x+1.),R0=.206;float d=l.x<-.8?length(vec2(l.x+.8,l.y))-R0:max(abs(l.y)-R,l.x-1.);
 float lit=pyLight(l.x,t,t0);
 glassN(d,vec2(0.,sign(l.y)),.1,vec3(1.,.7,.7),vec3(1.,.6,.6),.8,s,.6*dim);
 float inside=cov(d);glow(vec3(.55,.2,.25)*inside*.12*dim);
 // the open end: a dark mouth with a rim
 float mouth=sdEll(l-vec2(1.,0.),vec2(.05,R*.9));glow(vec3(.9,.6,.6)*ln(abs(mouth),.012)*.4*dim);
 // the zooids: small bumps all over the tube, each a point of light when the wave passes
 float v=asin(clamp(l.y/R,-1.,1.));vec2 g=vec2(l.x*11.,v*3.2);g.x+=.5*mod(floor(g.y),2.);vec2 id=floor(g),f=fract(g)-.5;float cv=cos(v);
 float z=length(f*vec2(1.,1./max(cv,.2)))-.22;float zl=cov(z/11.)*inside;float hz=h21(id+s);
 vec3 lc=mix(vec3(.1,.75,1.),vec3(.35,1.,.6),hz);
 glow(vec3(1.,.65,.6)*zl*.12*dim+lc*(zl*1.2+exp(-length(f)*5.)*.25*inside)*lit*(.5+.5*hz)*dim);
 glow(lc*inside*lit*.08*dim);
 leave();}
void scene(vec2 q,float t){
 // far ones
 pyrosome(q,vec2(-.7+.012*t,.36),.12,.3+.05*t,t,6.,5.,.5);
 pyrosome(q,vec2(.8-.01*t,.3),.1,2.6-.04*t,t,8.5,6.,.45);
 pyrosome(q,vec2(.62,-.38+.01*t),.15,-.5+.03*sin(t*.3),t,4.5,3.,.7);
 pyrosome(q,vec2(-.62+.02*t,-.25),.17,.9-.03*t,t,3.2,2.,.8);
 // the big one: it comes closer as it crosses, lighting first
 float g=1.+.25*ss(0.,14.,t);pyrosome(q,vec2(.45-.06*t,.04+.02*sin(t*.4)),.34*g,-.2+.05*sin(t*.3),t,1.,1.,1.);
}

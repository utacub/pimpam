// 12 · El palau del larvaci. A giant larvacean (Bathochordaeus) inside its house of mucus: a huge, soft, clear bubble with an inner
// filter like a pair of golden ribbed wings; the small animal, an orange tadpole, beats its tail without rest and pumps the water,
// and the specks of the sea are drawn in through the two windows at the top, run down to the filter and are caught there.
vec2 lvInlet(float u,float k){float sg=k<.5?-1.:1.;vec2 a=vec2(sg*.55,.62),b=vec2(sg*.2,.33),c=vec2(sg*.06,.02);return mix(mix(a,b,u),mix(b,c,u),u);}
void scene(vec2 q,float t){
 vec2 C=vec2(.03*sin(t*.2),.02*sin(t*.27));float br=1.+.025*sin(t*.6);float spin=.06*sin(t*.15);
 vec2 l=rot(spin)*(q-C)/br;
 // the outer house: a soft bubble, its border waving, a faint net of mucus and a rainbow rim
 float bump=.035*sin(atan(l.y,l.x)*5.+t*.4)+.02*sin(atan(l.y,l.x)*9.-t*.55)+.03*(fbm2(l*3.+t*.05)-.5);
 float d=sdEll(l,vec2(.78,.52))+bump;
 glassN(d,normalize(l),.05,vec3(.9,.95,1.05),vec3(.22,.28,.5),.6,.3,.22);
 float inside=cov(d);float net=fbm2(l*3.5+vec2(t*.03,0.));float strands=ln(abs(fract(net*4.)-.5)*.05,.0015)*inside*ss(.1,.5,length(l));
 glow((vec3(.45,.55,.95)*strands*.12+vec3(.25,.3,.6)*inside*.02));
 // the two windows at the top, with their fine grids
 for(int k=0;k<2;k++){vec2 w=l-vec2(k==0?-.3:.3,.38);float wd=sdEll(rot(k==0?.5:-.5)*w,vec2(.09,.05));
  float grid=ln(abs(fract(w.x*60.)-.5)/60.,.0012)+ln(abs(fract(w.y*60.)-.5)/60.,.0012);glow(vec3(.6,.9,1.)*(ln(abs(wd),.004)*.5+grid*cov(wd)*.25));}
 // the inner filter: two ribbed wings of honey gold, breathing with the pumping
 float pump=.5+.5*sin(t*TAU*.8);
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 f=l-vec2(sg*.17,.02);f=rot(sg*(.35+.05*pump))*f;float fd=sdEll(f,vec2(.2,.11*(1.+.08*pump)));
  float ribs=ln(abs(fract(f.x*40.+f.y*8.)-.5)/40.,.0016)*cov(fd);
  glassN(fd,normalize(f),.05,vec3(1.,.9,.6),vec3(1.,.8,.4),1.,.6+float(k)*.2,.55);glow(vec3(1.,.75,.3)*(ribs*.6+cov(fd)*.06));}
 // the animal: an orange trunk and a long clear tail that beats fast
 vec2 a=l-vec2(0.,-.2);float trunk=sdEll(a-vec2(-.1,0.),vec2(.05,.035));
 float tx=a.x+.05;float tw=.03*(1.-ss(.0,.3,tx))+.004;float ty=.04*sin(tx*18.-t*TAU*2.2)*ss(0.,.1,tx);float tail=max(abs(a.y-ty)-tw,max(-tx,tx-.3));
 glassN(tail,vec2(0.,sign(a.y-ty)),.02,vec3(.95,.9,1.),vec3(.8,.85,1.),1.,.1,.5);glow(vec3(1.,.6,.3)*ln(abs(a.y-ty),.002)*step(0.,tx)*step(tx,.3)*.4);
 put(cov(trunk)*vec3(1.,.45,.12)*.8,cov(trunk)*.9,vec3(.5,.2,.1),vec2(0.));glow(vec3(1.,.5,.2)*exp(-length(a-vec2(-.1,0.))/.04)*.25);
 // the specks of the sea drawn in through the windows and down to the filter
 for(int i=0;i<36;i++){float fi=float(i),u=fract(t*(.09+.04*h11(fi))+h11(fi+3.));vec2 p=lvInlet(u,step(.5,h11(fi*7.)))+.04*(h22(vec2(fi,1.))-.5)*(1.-u);
  float r=length(l-p);glow(mix(vec3(.9,.95,1.),vec3(1.,.8,.4),u)*exp(-r/.006)*(.5+.5*ss(.0,.2,u))*ss(1.,.85,u)*.9);}
 // a second house far away, small and faint
 vec2 l2=(q-vec2(-.68+.01*t,-.38))/.18;float d2=sdEll(l2,vec2(.78,.52))+.03*sin(atan(l2.y,l2.x)*5.+t*.3);
 enter(.18);glassN(d2,normalize(l2),.08,vec3(.9,.95,1.05),vec3(.45,.5,.8),1.,.8,.2);leave();
 glow(vec3(1.,.7,.3)*exp(-length(l2-vec2(0.,.02))/.2)*.12);
}

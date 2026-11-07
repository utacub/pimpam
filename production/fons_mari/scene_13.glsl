// 14 · Atolla, la sirena blava. In the dark: Atolla, a deep red crown jelly with a ring of lappets and one very long tentacle. When it
// is touched it lights a wheel of blue light that runs round its rim (the "burglar alarm"); here the wheel turns slowly, at most one
// turn in four seconds, and leaves trails of blue sparks. Two small ones answer far away.
void atolla(vec2 q,vec2 c,float r,float tilt,float t,float s,float lit,float dim){
 vec2 l=rot(tilt)*(q-c)/r;if(abs(l.x)>2.2||l.y>.8||l.y<-3.5)return;enter(r);
 float b=beat(t,2.3,h11(s)),rr=1.-.12*b;
 // the long tentacle, trailing in lazy curves, and the ring of short ones
 float u=-l.y-.05;if(u>0.&&u<3.2){float x=.55*rr+.3*u*sin(u*1.2-t*.5+s)+.08*sin(u*4.+t*.8);glow(vec3(.7,.12,.22)*ln(abs(l.x-x),.012)*(1.-u/3.2)*.5*dim);}
 float sh=threads(l,-rr*.95,rr*.95,-.05,.45-.15*b,20,t,s,.12,0.,.01);glow(vec3(.6,.1,.18)*sh*.35*dim);
 // the bell seen a little from above: the dome, the deep groove round it and the ring of lappets
 float dome=sdEll(l-vec2(0.,.12),vec2(rr*.62,.36+.08*b));float ring=sdEll(l,vec2(rr,.32));
 float a=atan(l.y/.32,l.x/rr);float lap=ring+.03*abs(sin(a*11.));float d=min(dome,lap);
 glassN(d,normalize(l),.14,vec3(.6,.1,.18),vec3(.75,.12,.22),.4,s,.85*dim);
 float inside=cov(d);
 glow(mix(vec3(.22,.0,.04),vec3(.5,.02,.09),ss(-.2,.3,l.y))*inside*.4*dim);
 float groove=abs(sdEll(l-vec2(0.,.05),vec2(rr*.7,.24)));glow(vec3(.25,.0,.05)*ln(groove,.02)*inside*dim);
 // the wheel of blue light: two bright arcs running round the rim, turning slowly; their glow spills into the water
 float wa=atan(l.y/.32,l.x/rr);float wheel=pow(.5+.5*cos(2.*wa-t*1.5+s),6.)+.6*pow(.5+.5*cos(2.*wa-t*1.5+s+1.2),10.);
 float rimd=abs(sdEll(l,vec2(rr*.86,.27)));
 glow(vec3(.15,.5,1.)*(ln(rimd,.03)*1.3+exp(-rimd*rimd/.025)*.3)*wheel*lit*dim+vec3(.5,.85,1.)*ln(rimd,.012)*wheel*lit*.8*dim);
 leave();}
void scene(vec2 q,float t){
 // the light wakes up a moment after the scene: it comes on, stays, and breathes
 float lit=ss(.8,2.5,t)*(.75+.25*sin(t*.5));
 // two small ones far away, answering with their own wheels
 atolla(q,vec2(-.72+.01*t,.3),.07,.4,t,4.,ss(4.,6.,t),.5);
 atolla(q,vec2(.72,-.36+.01*t),.06,-.3,t,7.,ss(6.,8.,t),.45);
 // the big one: it sinks and turns slowly
 vec2 C=vec2(.05+.06*sin(t*.2),.14-.012*t+.02*sin(t*.4));float tilt=.25*sin(t*.18)+.1;
 atolla(q,C,.25,tilt,t,1.,lit,1.);
 // trails of blue sparks shed by the wheel, drifting away and fading
 for(int i=0;i<40;i++){float fi=float(i),age=fract(t*.12+h11(fi)),born=t-age/.12;
  float wa=(born*1.5-1.)/2.+(h11(fi+3.)>.5?3.1416:0.)+.3*(h11(fi+5.)-.5);vec2 dir=vec2(cos(wa),sin(wa)*.32);
  vec2 p=C+rot(-tilt)*(dir*.25*.9)+dir*age*.25+vec2(0.,-.04*age);
  glow(vec3(.2,.6,1.)*exp(-length(q-p)/.0045)*(1.-age)*ss(1.5,3.5,born)*1.1);}
}

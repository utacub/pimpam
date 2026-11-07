// 13 · El vel de seda. Deepstaria: a jellyfish like a huge veil of silk, so thin it billows like a sail; a net of golden canals runs
// through it, it opens wide like a parachute and closes like a sack, slowly, and its border waves without rest. Small blue lights of
// the deep drift around it.
// The net of canals: the edges of a slowly moving cell pattern (distance to the nearest border between two cells).
float canals(vec2 p,float t){vec2 i=floor(p),f=fract(p);float d1=8.,d2=8.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(x,y),h=h22(i+o);vec2 c=o+.5+.35*sin(h*6.28+t*.15)-f;float d=dot(c,c);
  if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
 return sqrt(d2)-sqrt(d1);}
void scene(vec2 q,float t){
 // far lights: small blue sparks drifting up around the veil
 for(int i=0;i<18;i++){float fi=float(i);vec2 p=vec2(-ASP+2.*ASP*h11(fi+1.)+.04*sin(t*.3+fi),wrap(-.6+1.2*h11(fi+5.)+.02*t,-.55,.55));
  glow(mix(vec3(.2,.6,1.),vec3(.3,1.,.8),h11(fi))*exp(-length(q-p)/.004)*(.5+.5*sin(t*(.4+.3*h11(fi))+fi))*.7);}
 // the veil: it opens (a wide parachute) and closes (a tall sack) on a slow breath; it leans and drifts
 float br=.5+.5*sin(t*.42-1.2),lean=.18*sin(t*.23);vec2 C=vec2(-.05+.12*sin(t*.12),.12-.012*t);
 vec2 l=rot(lean)*(q-C);
 float W=mix(.36,.62,br),H=mix(.44,.3,br);
 // the border: the lower edge waves, the sides billow
 float a=l.x/W;float hem=-H*mix(.95,.55,br)-.06*sin(l.x*9.-t*1.1)-.035*sin(l.x*17.+t*.8)-.05*(1.-br)*cos(a*3.);
 float side=W*(1.+.06*sin(l.y*7.+t*.9)+(1.-br)*.12*ss(.0,-.4,l.y));
 float top=sdEll(l,vec2(side,H));float d=max(top,hem-l.y);
 // the inside of the veil, seen through its near side: darker, folded
 float folds=.5+.5*sin(l.x*14.+fbm2(l*3.+t*.06)*5.-t*.35);
 vec2 n=normalize(l*vec2(1.,1.4));
 glassN(d,n,.12,vec3(.8,.75,1.),vec3(.75,.55,1.),1.6,.5,.55);
 float inside=cov(d);
 glow((vec3(.35,.18,.6)*.06+vec3(.6,.35,1.)*folds*folds*.07+vec3(.25,.4,1.)*(1.-folds)*.03)*inside);
 // the golden canals, finer near the border
 vec2 cp=l*8.+vec2(0.,t*.05);float cn=canals(cp+fbm2(l*2.+t*.04)*1.2,t);
 glow(mix(vec3(1.,.62,.15),vec3(1.,.4,.25),fbm2(l*4.))*ln(cn/8.,.0028)*inside*(.6+.4*folds)*.9);
 // the ring canal and the waving border, lit
 glow(vec3(.9,.7,1.)*ln(abs(l.y-hem),.006)*ss(side+.02,side-.08,abs(l.x))*.6);
 // the stomach: a soft amber glow at the top
 vec2 g=(l-vec2(0.,H*.55))/vec2(.12,.07);glow(vec3(1.,.55,.2)*exp(-dot(g,g))*.35*inside);
 // a small passenger: an isopod clinging inside, walking along the canals
 vec2 ip=vec2(.12*sin(t*.3),-.05+.04*sin(t*.5));vec2 il=rot(t*.3)*(l-ip);float isd=sdEll(il,vec2(.028,.018));
 float segs=ln(abs(fract(il.x*70.)-.5)/70.,.0008)*cov(isd);put(cov(isd)*vec3(.9,.75,.6)*.35+vec3(.6,.4,.3)*segs*.3,cov(isd)*.8*inside,vec3(.3),vec2(0.));
}

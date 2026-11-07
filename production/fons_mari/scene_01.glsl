// 2 · Medusa de lluna. Moon jellies (Aurelia aurita) climb through the light water in slow beats: each beat closes the bell and
// lifts it one step; the clover of four rings (the gonads: violet, pink, orange or blue, as in the sea) shines through the glass;
// a fringe of fine tentacles and four frilled oral arms trail behind. A big one rises close in front, others at every distance.
float clover(vec2 p,float spin){float k=0.;
 for(int i=0;i<4;i++){float ai=float(i)*1.5708+.785+spin;vec2 ci=vec2(cos(ai),sin(ai))*.38,d=p-ci;
  float ring=abs(length(d)-.17)-.05;float gap=dot(d/max(length(d),1e-4),-ci/.38);k=max(k,cov(ring)*ss(.85,.5,gap));}
 return k;}
float aurP(float s){return 1.9+.5*h11(s);}
float aurO(float s){return h11(s+3.);}
void aurelia(vec2 q,vec2 c,float r,float ang,float t,float s,vec3 gon,float far){
 vec2 l=rot(ang)*(q-c)/r;if(l.y>.7||l.y<-3.3||abs(l.x)>1.6)return;enter(r);
 float b=beat(t,aurP(s),aurO(s)),rr=1.-.2*b,hh=.36*(1.+.45*b),dim=1.-.55*far;
 // the fringe of fine tentacles (drawn in when the bell closes) and four frilled oral arms, behind the bell
 float ten=threads(l,-rr*.97,rr*.97,-.04,1.25-.45*b,30,t,s,.08,.03*sin(t*.4+s),.006);
 float arms=0.,armc=0.;
 for(int i=0;i<4;i++){float fi=float(i),dy=-.02-l.y;if(dy>0.&&dy<1.9){float k=dy/1.9,x=(fi-1.5)*.1*(1.+dy*.6)+.13*dy*sin(dy*3.2-t*1.2+fi*1.9);
  float w=(.06+.035*sin(dy*24.-t*2.2+fi*2.))*(1.-k*.75);float d=abs(l.x-x)-w;armc+=cov(d)*(1.-k);arms+=ln(abs(d),.008)*(1.-k);}}
 put(armc*mix(gon,vec3(.8,.85,1.),.6)*.12*dim+arms*mix(gon,vec3(1.),.5)*.25*dim,min(.5,armc*.3),vec3(.95,.9,1.),vec2(0.));
 glow(mix(vec3(.45,.75,1.),gon,.4)*ten*.4*dim);
 // the bell: a wide glass saucer; the clover and the radial canals seen through its top
 float d=sdDome(l,rr,hh,.1+.12*b);vec2 n=normalize(l-vec2(0.,-.2));
 glassN(d,n,.16,mix(vec3(.85,.92,1.05),gon,.25),mix(gon,vec3(.6,.85,1.),.45),1.3,s,.7);
 float inside=cov(d);vec2 tp=vec2(l.x/rr,(l.y-hh*.42)/(hh*.62));
 glow(gon*clover(tp*1.08,t*.05+s)*inside*(1.1+.5*b)*dim+gon*inside*.06*dim);
 float a=atan(tp.y,tp.x)*16./TAU,da=abs(fract(a)-.5)/16.*TAU*length(tp)*rr;
 glow(vec3(.55,.75,1.)*ln(da,.006)*inside*ss(.25,.85,length(tp))*.35*dim);
 glow(mix(gon,vec3(.6,.9,1.),.5)*ln(abs(d),.02)*ss(-.12,.1,l.y)*.3*dim);
 leave();}
void scene(vec2 q,float t){
 // far ones, small and dim, all over the water
 for(int i=0;i<6;i++){float fi=float(i),r=.03+.018*h11(fi+1.),s=fi+10.;
  vec2 c=vec2(-ASP+.12+fi*(2.*ASP-.24)/5.+.04*sin(t*.2+fi),wrap(-.4+.29*fi+.045*jet(t,aurP(s),aurO(s)),-.62,.7));
  aurelia(q,c,r,.3*sin(fi*2.1),t,s,pal(.55+fi*.17)*vec3(1.,.8,1.),1.);}
 // middle distance: an orange one high on the left, a blue one low on the right
 vec2 c3=vec2(-.62+.025*t,wrap(.05+.07*jet(t,aurP(3.),aurO(3.)),-.7,.85));aurelia(q,c3,.09,.25+.1*sin(t*.3),t,3.,vec3(1.,.5,.15),.3);
 vec2 c4=vec2(.72-.015*t,wrap(-.42+.06*jet(t,aurP(4.),aurO(4.)),-.65,.8));aurelia(q,c4,.075,-.3+.1*sin(t*.35),t,4.,vec3(.25,.55,1.),.3);
 // a pink one on the right, rising across
 vec2 c2=vec2(.4-.02*t+.03*sin(t*.4),wrap(-.1+.08*jet(t,aurP(2.),aurO(2.)),-.75,1.));aurelia(q,c2,.13,-.2+.12*sin(t*.3+1.),t,2.,vec3(1.,.35,.7),0.);
 // the big violet one, close, climbing from the bottom of the screen
 vec2 c1=vec2(-.28+.035*t,wrap(-.5+.085*jet(t,aurP(1.),aurO(1.)),-.85,1.25));aurelia(q,c1,.21,.15-.22*sin(t*.25),t,1.,vec3(.75,.3,1.),0.);
}

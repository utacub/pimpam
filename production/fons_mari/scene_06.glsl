// 7 · Medusa ou ferrat. Fried-egg jellies (Cotylorhiza tuberculata): a cream-yellow bell with a raised orange centre, like an egg in
// the pan, and under it a crowd of short knobbed arms with violet, blue and white tips. They beat slowly and sail to the left; a
// little group of striped young fish travels sheltered under the big one.
void cotylo(vec2 q,vec2 c,float r,float ang,float t,float s,float dim){
 vec2 l=rot(ang)*(q-c)/r;if(abs(l.x)>1.35||l.y>.75||l.y<-1.25)return;enter(r);
 float b=beat(t,2.7,h11(s)),rr=1.-.13*b,hh=.3*(1.+.35*b);
 // the arms: short, branched, swaying together, each with a tip disc
 for(int i=0;i<11;i++){float fi=float(i),x0=(fi/10.-.5)*1.15*rr,L=.55+.35*h11(fi+s);float dy=-.06-l.y;if(dy<-.05||dy>L+.12)continue;
  float x=x0*(1.-.3*b*dy)+.1*dy*sin(t*.9+fi*.7+dy*2.)+.03*sin(dy*14.+t*1.5+fi);float d=abs(l.x-x)-.045*(1.-.4*dy/L);d=max(d,dy-L);
  float tip=length(l-vec2(x,-.06-L))-(.075+.02*sin(t*1.3+fi));float hc=h11(fi*2.+s);vec3 tc=hc<.4?vec3(.65,.3,1.):hc<.75?vec3(.25,.5,1.):vec3(.9,.95,1.);
  put(cov(d)*vec3(.55,.42,.18)*.35*dim,cov(d)*.6*dim,vec3(.9,.8,.6),vec2(0.));
  put(cov(tip)*tc*.75*dim+tc*ln(abs(tip),.01)*.3*dim,cov(tip)*.8*dim,tc*.4,vec2(0.));}
 // the bell: cream glass with grooves at the margin, and the raised orange centre
 float d=sdDome(l,rr,hh,.08+.1*b);vec2 n=normalize(l-vec2(0.,-.1));
 glassN(d,n,.14,vec3(1.,.95,.75),vec3(1.,.85,.45),.8,s,.75*dim);
 float inside=cov(d),a=atan(l.y+.2,l.x);float groove=ln(abs(fract(a*30./TAU)-.5)*.2,.004)*ss(.6,.95,length(l/vec2(rr,hh)));
 glow((vec3(.85,.7,.3)*.18+vec3(1.,.85,.4)*groove*.25)*inside*dim);
 float yolk=sdEll(l-vec2(0.,hh*.55),vec2(.42*rr,hh*.8));float yc=cov(yolk);
 glow(mix(vec3(1.,.45,.08),vec3(1.,.7,.2),ss(.0,-.1,yolk))*yc*.55*dim+vec3(1.,.6,.2)*ln(abs(yolk),.012)*.4*dim);
 leave();}
void scene(vec2 q,float t){
 // far behind: two small ones going the other way
 cotylo(q,vec2(.75-.012*t,.32+.02*sin(t*.4)),.07,.2,t,7.,.5);
 cotylo(q,vec2(-.85+.02*t,.38),.05,-.15,t,9.,.4);
 // a middle one rising on the right
 cotylo(q,vec2(.55-.035*t,-.55+.035*jet(t,2.7,h11(2.))),.14,-.3+.1*sin(t*.3),t,2.,.85);
 // the big one, sailing to the left in front, leaning into its beats
 vec2 C=vec2(.55-.07*t,-.02+.04*sin(t*.35));float lean=.18*sin(t*.4)+.12;cotylo(q,C,.27,lean,t,1.,1.);
 // young jacks under the big bell, in and out of its arms
 for(int i=0;i<7;i++){float fi=float(i),ph=t*(1.1+.2*h11(fi))+fi*1.7;vec2 p=C+vec2(.16*sin(ph)+.02*fi-.06,-.2-.07*h11(fi)+.04*sin(ph*1.7));
  vec2 v=vec2(.16*cos(ph),.07*cos(ph*1.7));vec2 f=q-p;if(dot(f,f)>.004)continue;f=rot(atan(v.y,v.x))*f/.035;f.y-=.08*sin(f.x*4.-t*10.-fi);
  float d=min(sdEll(f,vec2(.55,.17)),max(abs(f.y)-.03-.6*max(-f.x-.45,0.),abs(f.x+.62)-.15))*.035;float c2=cov(d);
  float bands=step(.5,fract(f.x*2.6+.3));vec3 col=mix(vec3(.95,.85,.4),vec3(.1,.1,.15),bands*ss(.2,-.4,f.x+.0)*.8);
  put(col*c2*.6,c2,vec3(.2),vec2(0.));}
}

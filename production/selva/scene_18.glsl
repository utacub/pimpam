// 19 · Les rajades. On the sandy bed of the river, in the moonlit ripples of light. A big river stingray lies half buried in the sand,
// only its outline and the spots of its back showing. It shakes the sand off and rises in a cloud of grains (the key moment, tau ≈
// 3.0–4.4 s), then glides away, the edges of its round body waving. Later a smaller one passes far behind; little catfish peck at the
// sand in front. Potamotrygon motoro lives in the Amazon basin (Froese & Pauly, 2026); its eye spots ringed in black follow the usual
// pictures of the species (not checked in a source).
// How big things look at height y on the bed (farther up the picture is farther away).
float persp(float y){return mix(1.,.42,sat((y+.50)/.45));}
// A stingray on the bed, from above at a slant: centre c, size S, heading a (in the plane of the bed), the margin waving (wv), how much
// sand still covers it (sd), how high above the bed (hi, its shadow drawn apart).
void ray(vec2 q,vec2 c,float S,float a,float wv,float sd,float hi,float t,float s){
 vec2 p=(q-c-vec2(0.,hi))/S;p.y/=.45;p=rot(a)*p;float r=length(p),th=atan(p.y,p.x);if(r>2.8)return;
 float R=1.+.06*wv*sin(th*3.-t*4.+s)*ss(.3,1.,abs(sin(th)));float disc=(r-R)*S*.45;
 float tail=sdSeg(p,vec2(-.85,0.),vec2(-2.4,.08*sin(t*1.5+s)))-.10*(1.-segU(p,vec2(-.85,0.),vec2(-2.4,0.)))-.012;float d=min(disc,tail*S*.45);
 // its shadow on the sand, when it is off the bed
 if(hi>.003){vec2 sp=(q-c)/S;sp.y/=.45;sp=rot(a)*sp;float sh=length(sp)-1.1;solid(vec3(0.),ss(.4,-.4,sh)*.35*ss(.0,.04,hi));}
 float cv=cov(d);if(cv<=0.)return;
 vec3 col=vec3(.008,.006,.0035)*(.75+.35*fbm2(p*3.+s));
 // the spots: orange, ringed in black
 for(int i=0;i<14;i++){float fi=float(i);float ang=fi*2.4+s,rr=.15+.68*h11(fi+s);vec2 o=vec2(cos(ang),sin(ang))*rr;float dd=length(p-o);float sr=.105+.04*h11(fi+7.);
  col=mix(col,vec3(.002),ss(sr,sr*.88,dd));col=mix(col,vec3(.11,.050,.008),ss(sr*.66,sr*.54,dd));}
 col=mix(col,vec3(.008,.006,.004),ss(.85,1.,r)*.6);
 // the eyes and the breathing holes near the front
 for(int e=-1;e<=1;e+=2){vec2 ep=p-vec2(.48,float(e)*.18);col=mix(col,vec3(.02),ss(.06,.04,length(ep)));col=mix(col,vec3(.4,.5,.4),ss(.025,.01,length(ep-vec2(.01,.01))));}
 col=mix(col,vec3(.042,.032,.020)*(.8+.4*vn(q*90.)),sd*.92);
 solid(col,cv);glow(vec3(.6,.7,.6)*ln(abs(d),.0012)*.18*(1.-.8*sd));}
// A small armoured catfish on the sand, side view facing dir: grey gold with dark spots, whiskers, the tail beating.
void catfish(vec2 q,vec2 c,float S,float dir,float t,float s){vec2 f=(q-c)/S;f.x/=sdir(dir);if(dot(f,f)>3.)return;
 float body=sdEll(f-vec2(0.,.0),vec2(.50,.22-.06*f.x));float fin=sdEll(rot(-.4)*(f-vec2(.05,.24)),vec2(.14,.08));float tl=sdEll(rot(.3*sin(t*8.+s))*(f-vec2(-.62,0.)),vec2(.14,.16));
 float d=min(min(body,fin),tl);vec3 col=mix(vec3(.035,.030,.022),vec3(.070,.060,.036),ss(-.1,.15,f.y));col=mix(col,vec3(.04),step(.78,vn(f*9.+s))*ss(.2,-.1,f.y-.1));
 solid(col,cov(d*S));glow(vec3(.7,.8,.7)*ln(abs(d)*S,.0008)*.1);
 solid(vec3(.01),cov((length(f-vec2(.34,.05))-.05)*S));solid(vec3(.05,.045,.03),cov((sdSeg(f,vec2(.46,-.08),vec2(.62,-.20+.03*sin(t*6.+s)))-.012)*S));}
void scene(vec2 q,float t){
 // the big ray: buried, rises in a cloud of sand, glides off up the picture
 float up=ss(3.0,4.2,t),go=ss(4.2,11.5,t);vec2 A0=vec2(-.30,-.30);vec2 A=mix(A0,vec2(.62,-.10),go*go*(3.-2.*go));float sA=.26*persp(A.y);
 // the second, smaller ray, far behind, from the right
 {float u=ss(5.5,11.8,t);vec2 B=mix(vec2(1.1,-.06),vec2(-1.1,-.02),u);ray(q,B,.14*persp(B.y),PI-.1,1.,0.,.02*persp(B.y),t,7.);}
 ray(q,A,sA,.25-.55*go,ss(3.6,4.4,t),1.-ss(3.0,3.8,t),.035*up*persp(A.y),t,1.);
 // the cloud of sand: grains thrown up and settling
 for(int i=0;i<36;i++){float fi=float(i);float u=t-3.0-.04*h11(fi);if(u<0.||u>5.)continue;float a=h11(fi+1.)*6.28;vec2 v=vec2(cos(a)*.18,.10+.15*h11(fi+2.))*(.5+.5*h11(fi+3.));
  vec2 c=A0+vec2(0.,.0)+v*(1.-exp(-u*1.6))/1.6*vec2(1.,1.)-vec2(0.,.012*u*u*.4);float d=length(q-c);float I=(1.-ss(1.,5.,u))*ss(0.,.1,u);
  glow(vec3(.30,.24,.15)*(exp(-d/.004)*.25+exp(-d/.03)*.006)*I);}
 {vec2 cl=A0+vec2(0.,.05);float u=t-3.0;if(u>0.){float rr=.10+.14*(1.-exp(-u*1.2));float I=ss(0.,.3,u)*(1.-ss(1.5,5.5,u));glow(vec3(.20,.16,.10)*exp(-length((q-cl)*vec2(1.,1.8))/rr)*.025*I);}}
 // the little catfish in front on the right, pecking at the sand
 for(int i=0;i<3;i++){float fi=float(i);float hop=floor(t*.8+fi*.4);float px=.35+.18*fi+.04*sin(hop*2.3+fi)-.02*t*(fi-1.);vec2 c=vec2(px,-.38+.05*fi+.01*sin(hop+fi));
  float peck=.25*ss(.6,.9,fract(t*.8+fi*.4));vec2 cc=c;catfish(q,cc+vec2(0.,.004*sin(t*3.+fi)),.07*persp(c.y),fi==1.?-1.:1.,t,fi);}
 // drifting specks
 for(int i=0;i<24;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+71.)+.03*sin(t*.2+fi),-.5+fract(h11(fi+72.)+t*.006));glow(vec3(.6,.6,.5)*exp(-length(q-c)/.0025)*.2);}
}

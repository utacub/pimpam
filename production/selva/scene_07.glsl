// 8 · La granota d'ulls vermells. Close up, on a big green leaf with drops of water, a red-eyed tree frog asleep by day: all green,
// its legs folded under it, its eyes covered by the golden net of the lids. All at once it opens its eyes, red with black upright
// pupils (the key moment, tau ≈ 2.9–3.4 s, in about half a second), lifts its head and breathes. Later it rises and jumps to the leaf on
// the right (≈ 8.0–9.0 s): in the jump its blue flanks with pale bars and its orange feet show. It clings there and looks at us.
// The quick opening of the eyes and the colours shown mainly in escape follow the study cited in CANVIS (2025); the species lives in
// Central America and the north west of South America, not in the Amazon: a criterion of the design (noted).
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
// A big leaf from its base b: veins, a bright edge where the light comes through.
void bigLeaf(vec2 q,vec2 b,float ang,float len,float wd,float t,float s,vec3 c0,vec3 c1){vec2 l=rot(ang+.015*sin(t*.5+s))*(q-b)/len;if(l.x<-.05||l.x>1.05||abs(l.y)>wd*1.2)return;
 float v,d=leafD(l,wd,v)*len;float c=cov(d);if(c<=0.)return;float mid=exp(-abs(v)*18.),lat=pow(abs(sin((l.x*11.-abs(v)*1.6)*PI)),24.)*ss(.05,.25,abs(v));
 vec3 col=mix(c0,c1,sat(.55*(.5-.5*v)+.45*l.x))*(1.-.30*mid-.15*lat)*(.85+.15*fbm2(l*vec2(9.,30.)+s));solid(col,c);glow(vec3(.9,1.,.5)*ln(abs(d),.0016)*.30);}
// Toes from the end of a foot a, pointing along dir: four short toes with round pads.
float toes(vec2 g,vec2 a,vec2 dir,float sp){float d=1e5;for(int k=0;k<4;k++){float an=atan(dir.y,dir.x)+sp*(float(k)-1.5)*.45;vec2 e=a+vec2(cos(an),sin(an))*(.10+.02*float(k%2));
 d=min(d,min(sdSeg(g,a,e)-.016,length(g-e)-.030));}return d;}
// The frog, side view facing right (dir), in its own frame (belly on the leaf at the origin, unit L ≈ body length). eo: eyes open;
// ex: legs out (flanks shown); st: the stretch of the jump; lift: head up; br: breathing (the throat).
void frog(vec2 q,vec2 c,float L,float dir,float eo,float ex,float st,float lift,float br,float t){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(dot(f,f)>4.)return;
 vec3 grn=vec3(.05,.27,.03),blue=vec3(.03,.10,.48),org=vec3(.80,.20,.01),cream=vec3(.55,.58,.36);
 vec2 g=rot(.35*st)*f;g.y=(g.y-.0)/(1.+.012*sin(t*2.2));
 vec2 hip=vec2(-.30,.14),sh=vec2(.18,.12);
 // the far hind leg, in the jump only
 if(st>.01){vec2 kn=mix(vec2(.0,.07),vec2(-.58,.06),st),an=mix(vec2(-.33,.02),vec2(-.90,.16),st),tp=an+normalize(an-kn)*.05;
  float d=min(min(sdSeg(g,hip+vec2(.03,.03),kn)-.065,sdSeg(g,kn,an)-.048),sdSeg(g,an,tp)-.025);solid(mix(grn,blue,.7)*.55,cov(d*L));solid(org*.6,cov(toes(g,tp,normalize(tp-an),1.)*L));}
 // the body and the head; the back green, the flank blue with pale bars (shown when the legs are out), the belly cream
 float bd=sdEll(rot(-.12)*(g-vec2(-.05,.20)),vec2(.40,.19)),hd=sdEll(g-vec2(.30,.24+.03*lift),vec2(.21,.15));float b=smin(bd,hd,.08);
 float fl=ss(.13,.05,g.y)*ss(-.44,-.32,g.x)*ss(.20,.10,g.x);float bars=ss(.30,.18,abs(fract(g.x*5.5+.2)-.5));
 vec3 col=grn*(.75+.3*vn(g*40.))*(1.25-.5*ss(.10,.38,g.y))+vec3(.5,.5,.2)*step(.93,h21(floor(g*55.)))*.25;col=mix(col,mix(blue,cream,bars*.85),fl*(.12+.88*ex));col=mix(col,cream,ss(.06,.0,g.y)*ss(.2,.0,abs(g.x-.10))*.8);
 solid(col,cov(b*L));glow(vec3(.9,1.,.6)*ln(abs(b)*L,.0016)*.35*ss(.0,.25,g.y));
 // the throat, pale, pulsing as it breathes
 solid(cream*.8,cov(sdEll(g-vec2(.33,.11+.02*lift),vec2(.10,.035*(1.+.5*br)))*L)*ss(.05,.3,br+.2));
 // the near hind leg: folded along the side, or thrown back in the jump with the blue thigh and the orange foot
 {vec2 kn=mix(vec2(.02,.08),vec2(-.62,.04),st),an=mix(vec2(-.34,.03),vec2(-.95,.12),st),tp=mix(vec2(-.06,.0),an+normalize(an-kn)*.06,st);
  float d1=sdSeg(g,hip,kn)-.075,d2=sdSeg(g,kn,an)-.052,d3=sdSeg(g,an,tp)-.028;float d=min(min(d1,d2),d3);
  vec3 lc=mix(grn,mix(blue,org,.35),ex*ss(.0,.06,.03-g.y+.2*st));solid(mix(grn*(.9+.2*vn(g*30.)),lc,ss(.06,.0,abs(g.y-.04-(kn.y-.04)*.3))*ex+.0),cov(d*L));
  glow(vec3(.9,1.,.6)*ln(abs(d)*L,.0013)*.25);
  solid(org,cov(toes(g,tp,normalize(mix(vec2(1.,-.1),tp-an,st)),mix(.6,1.,ex))*L)*ss(.05,.4,ex));}
 // the front leg: under the chin, or reaching forward, the orange fingers spread
 {vec2 el=mix(vec2(.26,.02),vec2(.50,.12),max(st,ex*.5)),hn=mix(vec2(.14,.0),vec2(.70,.20),st)+vec2(.06,0.)*ex*(1.-st);
  float d=min(sdSeg(g,sh,el)-.042,sdSeg(g,el,hn)-.032);solid(grn*.95,cov(d*L));solid(org,cov(toes(g,hn,normalize(mix(vec2(-1.,-.2),hn-el,max(st,ex))),mix(.5,1.,ex))*L)*ss(.05,.4,max(ex,st)));}
 // the eye: on top of the head; under the lid (a golden net), red with a black upright slit
 vec2 E=g-vec2(.32,.40+.03*lift);float r=.105;float ed=length(E)-r;solid(grn,cov((ed-.018)*L));
 if(ed<.01){float ec=cov(ed*L);vec3 ir=mix(vec3(.62,.01,.01),vec3(.85,.10,.03),ss(r,.3*r,length(E)))*(.85+.15*sin(atan(E.y,E.x)*18.));
  float pu=sdEll(E,vec2(.018+.006*(1.-eo),.070));ir=mix(ir,vec3(.01),cov(pu*L));
  float lidY=r*(1.-2.*eo);float lid=ss(-.004,.004,lidY-E.y);vec3 lc=mix(vec3(.30,.40,.10),vec3(.70,.62,.22),.5+.5*sin(E.x*140.)*sin(E.y*140.));
  solid(mix(ir,lc,lid),ec);solid(vec3(1.),cov((length(E-vec2(-.03,.04))-.016)*L)*(1.-lid)*eo);glow(vec3(1.,.4,.3)*ln(abs(ed)*L,.0012)*.3*eo);}
 // the mouth, a long smile, and the nostril
 {float d=sdSeg(g,vec2(.49,.21+.03*lift),vec2(.20,.16+.02*lift));solid(vec3(.04,.12,.02),cov(d*L-.0012));solid(vec3(.03),cov((length(g-vec2(.47,.30+.03*lift))-.012)*L));}
}
void scene(vec2 q,float t){
 // soft spots of sun far behind
 for(int i=0;i<6;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+13.),-.2+.7*h11(fi+19.));float r=.04+.05*h11(fi+5.);glow(vec3(.9,1.,.5)*ss(r,r*.7,length(q-c))*.05);}
 // the leaf on the right, on its stem from the top, where the frog lands
 {vec2 a=vec2(ASP+.1,.62),e=vec2(.52,.14);float d=sdSeg(q,a,e)-.010;solid(vec3(.08,.20,.03),cov(d));}
 bigLeaf(q,vec2(.50,.13),-.30,.62,.21,t,2.,vec3(.02,.10,.03),vec3(.07,.20,.05));
 // the big leaf the frog sleeps on, across the picture
 bigLeaf(q,vec2(-ASP-.25,-.78),.40,1.75,.22,t,1.,vec3(.015,.07,.03),vec3(.05,.17,.05));
 // the frog: asleep, opens its eyes, breathes, jumps to the right leaf and clings to it
 float eo=ss(2.9,3.35,t)*(1.-ss(6.05,6.15,t)*ss(6.45,6.3,t));
 float j=ss(8.1,8.95,t),st=ss(8.0,8.25,t)*ss(9.05,8.8,t),ex=ss(7.6,8.1,t)*(1.-.55*ss(9.0,9.6,t));
 vec2 A=vec2(-.22,-.20),B=vec2(.44,.19);vec2 p=mix(A,B,j)+vec2(0.,.08*sin(PI*j))-vec2(0.,.015*ss(7.5,7.9,t)*ss(8.1,8.,t));
 float br=.5+.5*sin(t*2.6);
 frog(q,p,.44,1.,eo,ex,st,ss(3.2,3.8,t)*(1.-st),br*ss(3.,4.,t),t);
 // drops of water on the leaf: the light bent through them, a bright spot
 for(int i=0;i<11;i++){float fi=float(i);vec2 ld=vec2(cos(.40),sin(.40));vec2 dc=vec2(-ASP-.25,-.78)+ld*(.25+.11*fi+.05*h11(fi))*1.75*.5+vec2(-ld.y,ld.x)*(.13*sin(fi*2.3)-.03);if(i==3||i==4)continue;float r=.014+.020*h11(fi+7.);float d=length((q-dc)*vec2(1.,1.15))-r;float c=cov(d);
  if(c>0.){vec2 n=(q-dc)/r;put(vec3(.01)*c,c*.85,vec3(1.05,1.10,1.0),-n*r*.8);glow(vec3(1.,1.,.9)*exp(-length(q-dc-r*vec2(-.35,.40))/(r*.12))*.6*c);}
  glow(vec3(.9,1.,.7)*ln(abs(d),.0010)*.25);}
 // dark leaves in front, at the corners
 {float v;vec2 l=rot(2.4)*(q-vec2(ASP+.06,-.64))/.60;float d=leafD(l,.22,v)*.60;solid(vec3(.015,.04,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
 {float v;vec2 l=rot(.6)*(q-vec2(-ASP-.06,.66))/.55;float d=leafD(l,.22,v)*.55;solid(vec3(.015,.04,.01)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.93);}
}

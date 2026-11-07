// 16 · Victòria amazònica. Night on the river, seen half over and half under the water (bg.glsl: the moon, the far bank, the water in
// perspective and the tea-coloured water below the line). Giant round leaves float on the water, their rims turned up, red underneath;
// under the line, their ribbed undersides and their long spiny stalks. A bud opens into a white flower (tau ≈ 2.5–5 s, the key moment),
// beetles fly into it, it half closes, turns pink and opens again, and one beetle flies out. The real flower opens white one night and
// pink the next, with the beetles shut inside meanwhile (Prance and Arias, 1975); here it happens in twelve seconds. Fireflies drift over
// the water, each with its own slow pulse.
const float LINE=-.19;
// A leaf on the water seen from a low angle: an ellipse (half sizes r), the rim turned up by h; returns nothing, draws itself.
void pad(vec2 q,vec2 c,vec2 r,float h,float t,float s){vec2 d=q-c;if(abs(d.x)>r.x*1.1||d.y<-r.y-h*2.||d.y>r.y+h*2.)return;
 float e0=length(d/r)-1.,e1=length((d-vec2(0.,h))/r)-1.,band=max(abs(d.x)-r.x,max(d.y-h,-d.y));float sil=min(min(e0,e1)*r.y,band);
 // the outside of the rim: red and purple, ribbed, with a notch
 vec3 rc=mix(vec3(.07,.012,.025),vec3(.16,.03,.05),.5+.5*sin(d.x/r.x*45.+s));solid(rc,cov(sil));
 // inside the rim, then the floor of the leaf: dark green in the moonlight, a quilt of veins, a cool shine
 solid(vec3(.10,.07,.05),cov(e1*r.y));
 vec2 u=(d-vec2(0.,h*.25))/(r*vec2(.96,.82));float fl=(length(u)-1.)*r.y*.82;float fa=cov(fl);
 if(fa>0.){float a=atan(u.y,u.x),rr=length(u);float vein=ln(abs(sin(a*16.+s))*rr,.05)*.5+ln(abs(sin(rr*10.)),.2)*.3;
  vec3 tc=mix(vec3(.004,.016,.011),vec3(.010,.034,.020),rr)*(1.-.45*vein);tc+=vec3(.40,.45,.60)*pow(sat(1.-abs(u.x+.3)*1.6),5.)*.05*ss(.3,1.,rr);solid(tc,fa);}
 glow(vec3(.55,.6,.8)*ln(abs(e1*r.y),.001)*ss(-.2,.6,(d.y-h)/r.y)*.35+vec3(.5,.25,.3)*ln(abs(sil),.001)*ss(.2,-.8,d.y/r.y)*.08);}
// The flower: a bowl of petals that opens (op 0–1), white turning pink (pk); a warm glow inside.
void flower(vec2 q,vec2 c,float S,float op,float pk,float t){vec2 f=(q-c)/S;if(abs(f.x)>1.6||f.y<-.5||f.y>1.6)return;
 vec3 pet=mix(vec3(1.,.98,.95),vec3(1.,.42,.62),pk);
 // sepals (outside, spiny, brown and purple), then the petals from the outside in
 for(int ring=0;ring<3;ring++){float fr=float(ring),n=fr==0.?6.:9.,open=sat(op*(1.15-fr*.12));
  for(int i=0;i<9;i++){float fi=float(i);if(fi>=n)break;float a=((fi+.5)/n-.5)*mix(.35,2.9-fr*.5,open)+fr*.15*sin(fi);
   vec2 dir=vec2(sin(a),cos(a));float len=fr==0.?.62:.78-fr*.12;vec2 l=vec2(dot(f,vec2(dir.y,-dir.x)),dot(f,dir));
   float d=sdEll(l-vec2(0.,len*.5),vec2(.13-fr*.02,len*.5))*S;float c2=cov(d);if(c2<=0.)continue;
   vec3 col=fr==0.?mix(vec3(.18,.08,.10),vec3(.30,.12,.12),l.y/len):pet*(.75+.25*(l.y/len))*mix(.8,1.,fr/2.);
   solid(col,c2);glow(pet*ln(abs(d),.0012)*.3*step(.5,fr));}}
 // the heart of the flower, glowing warm when it is open
 glow(mix(vec3(1.,.85,.5),vec3(1.,.55,.6),pk)*exp(-length((f-vec2(0.,.25))*vec2(1.,1.4))/.25)*.25*op);}
// A beetle flying (its wings a blur) towards p.
void beetle(vec2 q,vec2 c,float S,float t,float s){vec2 d=(q-c)/S;if(dot(d,d)>9.)return;
 float body=sdEll(d,vec2(.5,.36))*S;solid(vec3(.35,.20,.07),cov(body));glow(vec3(1.,.8,.4)*ln(abs(body),.001)*.4);
 float wg=sdEll(d-vec2(-.1,.45),vec2(.65,.28+.12*sin(t*60.+s)))*S;solid(vec3(.5,.55,.6),cov(wg)*.25);}
void scene(vec2 q,float t){
 // under the line: the undersides of the leaves and their long stalks, swaying a little
 if(q.y<LINE+.002){for(int i=0;i<3;i++){float fi=float(i),x=fi==0.?-.25:fi==1.?.35:-.62;float sw=.012*sin(t*.4+fi*2.);
   float sx=x+sw*(LINE-q.y)*2.;float st=abs(q.x-sx)-.010;float spn=step(.75,vn(vec2(q.y*90.,fi*7.+sign(q.x-sx)*3.)))*ss(.010,.016,abs(q.x-sx))*ss(.024,.016,abs(q.x-sx));
   vec3 sc=vec3(.07,.025,.015)*(.7+.3*fbm2(vec2(q.y*40.,fi)));solid(sc,max(cov(st),spn*.8)*ss(-.6,LINE,q.y)*.9);glow(vec3(.3,.25,.2)*ln(abs(q.x-sx+.009),.0012)*.12);
   float uw=fi==0.?.32:fi==1.?.2:.12;float ud=max(abs(q.x-x)-uw,LINE-.015-q.y);float rib=ln(abs(sin((q.x-x)/uw*12.)),.15)*ss(LINE-.03,LINE-.01,q.y);
   solid(mix(vec3(.04,.008,.016),vec3(.12,.025,.04),rib),cov(ud)*.95);}}
 // the leaves on the water, far to near
 pad(q,vec2(-.62,-.045),vec2(.12,.012),.006,t,3.);pad(q,vec2(.72,-.055),vec2(.15,.015),.007,t,4.);
 pad(q,vec2(.35,-.085),vec2(.20,.028),.010,t,2.);
 // the flower, rising from the water by the middle leaf
 float op=ss(2.5,5.,t)*(1.-.62*ss(7.4,8.4,t))+.62*ss(9.,10.6,t)*ss(7.4,8.4,t),pk=ss(8.4,10.6,t);
 vec2 fc=vec2(.08,-.08);solid(vec3(.10,.04,.03),cov(abs(q.x-fc.x)-.008)*step(q.y,fc.y)*step(LINE,q.y));
 flower(q,fc,.16,op,pk,t);
 pad(q,vec2(-.25,-.15),vec2(.34,.045),.016,t,1.);
 // beetles: three fly in (5–7.5 s), one flies out (10.6–12.5 s)
 for(int i=0;i<3;i++){float fi=float(i),t0=5.+fi*.8,u=sat((t-t0)/1.6);if(t<t0||u>=1.)continue;vec2 a=vec2(fi==1.?-.9:.95,.20+.08*fi),b=fc+vec2(0.,.06);
  vec2 p=mix(a,b,u)+vec2(0.,.12*sin(u*PI))+.01*vec2(sin(t*7.+fi),cos(t*9.+fi));beetle(q,p,.03,t,fi);}
 if(t>10.6){float u=sat((t-10.6)/2.);vec2 p=fc+vec2(0.,.06)+vec2(.9,.35)*u*u+vec2(0.,.08*sin(u*PI));beetle(q,p,.03,t,7.);}
 // fireflies over the water: slow, each its own pulse
 for(int i=0;i<12;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+1.)+.05*sin(t*.3+fi),-.12+.40*h11(fi+2.)+.03*sin(t*.4+fi*2.));
  float pul=pow(.5+.5*sin(t*(1.2+.9*h11(fi+3.))+fi*2.3),6.);float d=length(q-c);glow(vec3(.75,1.,.35)*(exp(-d/.004)*.9+exp(-d/.03)*.12)*pul);}
}

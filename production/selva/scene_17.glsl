float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
// 18 · El dofí rosat. Under the dark water of the flooded forest, among drowned trunks and their roots, with leaves and specks floating
// in the moonlight that comes down. A pink river dolphin comes from far away between the trunks, curious: it swims closer and closer,
// stops in front of us, bends its neck to look (the key moment, tau ≈ 3.0–5.2 s) and lets out a few bubbles; then it turns and glides
// off among the roots. River dolphins swim into the flooded forest (Erbs et al., 2023); their necks bend more than those of sea dolphins.
// The dolphin, side view facing dir (unit L ≈ its length): long thin beak, round melon, small eye, broad flippers, a low ridge on the
// back, the flukes; pink on the flanks and belly, grey on the back; the body waves as it swims (sw); nk: the neck bent (looking).
void dolphin(vec2 q,vec2 c,float L,float dir,float sw,float nk,float fog,float t){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(f.x<-.75||f.x>.85||abs(f.y)>.45)return;
 float wav=.035*sin(f.x*4.-t*3.2)*ss(.25,-.4,f.x)*sw;f.y-=wav;
 // the neck: the head turns about a point behind the melon
 vec2 N=vec2(.24,.02);vec2 g=f;if(f.x>N.x-.05){float k=ss(N.x-.05,N.x+.10,f.x);g=N+rot(-nk*k)*(f-N);}
 vec3 back=vec3(.07,.06,.07),flank=vec3(.15,.065,.075),belly=vec3(.21,.10,.11),moon=vec3(.55,.70,.85),water=vec3(.020,.016,.010);
 // the far flipper
 {float d=sdEll(rot(.55)*(f-vec2(.12,-.06)),vec2(.10,.035));solid(mix(flank*.6,water,fog),cov(d*L));}
 // the body: a long spindle, the melon, the beak
 float u=sat((f.x+.55)/.91);float r=mix(.03,.135,ss(0.,.55,u))*mix(1.,.72,ss(.72,1.,u));float body=abs(f.y-.01*sin(u*3.))-r;body=max(body,max(-f.x-.55,f.x-.36));
 float melon=length(g-vec2(.32,.05))-.095;float beak=sdSeg(g,vec2(.38,.0),vec2(.66,-.03))-mix(.030,.013,segU(g,vec2(.38,.0),vec2(.66,-.03)));
 body=min(body,length(f-vec2(.30,.02))-.10);melon=smin(melon,beak,.035);
 float fl=min(sdEll(rot(-.5)*(f-vec2(-.62,.05)),vec2(.10,.028)),sdEll(rot(.5)*(f-vec2(-.62,-.05)),vec2(.10,.028)));
 float dr=sdEll(f-vec2(-.05,.105),vec2(.12,.035));
 float d=min(smin(body,melon,.06),min(fl,dr));
 float side=ss(-.12,.10,-f.y+.02);vec3 col=mix(back,mix(flank,belly,ss(.0,.10,-f.y)),side)*(.85+.25*vn(f*25.));
 col=mix(col,water,fog);solid(col,cov(d*L));
 glow(mix(moon,vec3(.9,.6,.6),.3)*ln(abs(d)*L,.0016)*.24*ss(-.05,.10,f.y)*(1.-fog)+vec3(.9,.5,.5)*ln(abs(d)*L,.001)*.08*(1.-fog));
 // the eye, the near flipper
 {vec2 e=g-vec2(.30,.015);solid(vec3(.01),cov((length(e)-.012)*L)*(1.-fog));glow(moon*exp(-length(e-vec2(.004,.004))*L/.0015)*.3*(1.-fog));}
 {float d2=sdEll(rot(.65)*(f-vec2(.14,-.10)),vec2(.12,.040));solid(mix(flank*1.1,water,fog),cov(d2*L));glow(vec3(.9,.6,.6)*ln(abs(d2)*L,.001)*.2*(1.-fog));}
}
// A drowned trunk from the top of the picture, with roots going down; dark, the moonlight on one edge.
void trunk(vec2 q,float x0,float w,float dark,float s){float x=x0+.03*sin(q.y*3.+s);float d=abs(q.x-x)-w*(1.+.4*ss(-.1,-.5,q.y));
 for(int k=0;k<4;k++){float fk=float(k);vec2 a=vec2(x0,-.20-.05*fk),b=a+vec2((fk-1.5)*.18+.05*sin(s+fk),-.45);d=min(d,sdSeg(q,a,b)-w*.35*(1.-segU(q,a,b)*.7));}
 solid(vec3(.012,.010,.007)*(.7+.5*fbm2(q*vec2(30.,5.)+s))*dark,cov(d));glow(vec3(.5,.65,.75)*ln(abs(d),.0012)*.15*dark*ss(.0,.04,q.x-x));}
void scene(vec2 q,float t){
 // moonlight coming down in slanted bands, specks floating
 {float u=dot(q,vec2(.94,.34));float b=0.;for(int i=0;i<3;i++){float fi=float(i);b+=exp(-pow((u-(-.5+.5*fi)-.03*sin(t*.2+fi))/.07,2.));}glow(vec3(.45,.55,.55)*b*.025*ss(-.5,.5,q.y));}
 for(int i=0;i<40;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+1.)+.03*sin(t*.2+fi),-.5+fract(h11(fi+2.)-t*.008*(.5+h11(fi))));float d=length(q-c);glow(vec3(.6,.6,.5)*exp(-d/.0025)*.25);}
 // far trunks, fogged
 trunk(q,-.55,.035,.6,1.);trunk(q,.62,.030,.6,2.);
 // the dolphin: far and dim, comes closer, stops and looks, bubbles, turns and glides off
 float a=ss(.3,4.0,t);vec2 p=mix(vec2(-.75,.12),vec2(.02,-.04),a);float L=mix(.30,.80,a*a);float fog=mix(.75,0.,ss(.3,3.6,t));
 float nk=.35*ss(3.0,3.6,t)*sin(min(t-3.,2.2)*2.2)*ss(5.6,5.0,t);
 float go=ss(7.6,11.5,t);float dir=ss(7.4,7.9,t)<.5?1.:-1.;p=mix(p,vec2(.95,.18),go*go);L=mix(L,.55,go);
 float sq=1.-.85*sin(PI*ss(7.4,7.9,t));vec2 qq=p+(q-p)*vec2(1./max(sq,.15),1.);
 dolphin(qq,p,L,dir,1.-.6*ss(3.6,4.,t)*ss(7.4,6.8,t),nk,fog,t);
 // bubbles from its blowhole while it looks
 for(int i=0;i<7;i++){float fi=float(i),u=t-5.0-.18*fi;if(u<0.||u>4.)continue;vec2 b0=p+vec2(.10,.12)*L;vec2 c=b0+vec2(.02*sin(u*5.+fi),u*.16);float r=.007+.008*h11(fi);
  float d=length(q-c)-r;float cv=cov(d);if(cv>0.)put(vec3(.02)*cv,cv*.5,vec3(1.1),-(q-c)*.4);glow(vec3(.7,.85,.9)*ln(abs(d),.0008)*.4);}
 // near trunks and roots, in front
 trunk(q,-.95,.06,1.,3.);trunk(q,.88,.05,1.,4.);
 // a few floating leaves at the top
 for(int i=0;i<4;i++){float fi=float(i);vec2 c=vec2(-.8+.5*fi+.03*sin(t*.3+fi),.40+.05*sin(t*.4+fi*2.));float v;vec2 l=rot(fi+.3*sin(t*.3+fi))*(q-c)/.08;float d=leafD(l+vec2(.5,0.),.25,v)*.08;
  solid(vec3(.04,.025,.010),cov(d)*.9);}
}

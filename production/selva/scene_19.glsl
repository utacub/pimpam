// 20 · L'arapaima. Just under the surface of the river at night, the moonlit ceiling of the water above. From the dark below rises a
// giant arapaima, slow and heavy, its big scales edged with red towards the tail. It reaches the surface, opens its mouth and gulps air
// (the key moment, tau ≈ 3.8–4.6 s; it breathes air and has to come up every few minutes: Brauner et al., 2004), the surface trembles
// in rings of light, a few bubbles escape from its gills, and it glides down again, its tail sweeping. After it, the climb out to the
// sky (selva.js). Red only as flecks on the rear scales, as in the species.
const float SURF=.42;
// The arapaima, head tip at h, heading a, length L: a long round body, the head flat on top with an upturned mouth (jaw open by mo),
// big scales, the dorsal and anal fins set far back near the rounded tail; dark olive in front, grey green behind with red edges.
void arapaima(vec2 q,vec2 h,float a,float L,float mo,float t){
 vec2 f=rot(a)*(q-h)/L;if(f.x<-1.15||f.x>.08||abs(f.y)>.30)return;
 float u=sat(1.+f.x);float wav=.035*sin(f.x*5.5+t*2.4)*(-f.x)*(-f.x);f.y-=wav;
 float r=mix(.035,.105,ss(.0,.35,u))*mix(1.,.78,ss(.78,1.,u));float top=r*mix(1.,.65,ss(.8,1.,u));
 float body=max(f.y>0.?f.y-top:-f.y-r,max(-f.x-.92,f.x));
 // the mouth: the lower jaw drops when it gulps
 vec2 jw=rot(-.5*mo)*(f-vec2(-.06,-.02));float jaw=sdEll(jw-vec2(.03,-.015),vec2(.05,.02));body=max(body,-(sdEll(f-vec2(.0,-.005+.02*mo),vec2(.05,.012+.025*mo))));
 // the fins far back, and the round tail
 float df=sdEll(rot(.12)*(f-vec2(-.76,.10)),vec2(.17,.045)),af=sdEll(rot(-.12)*(f-vec2(-.76,-.095)),vec2(.17,.045)),tf=sdEll(f-vec2(-.98,.0),vec2(.10,.12+.02*sin(t*2.4)));
 float fins=min(min(df,af),tf);float pf=sdEll(rot(.6)*(f-vec2(-.22,-.07)),vec2(.07,.025));
 float d=min(min(body,jaw),min(fins,pf));float c=cov(d*L)*step(q.y,SURF+.004);if(c<=0.)return;
 // the scales: staggered rows of big round scales, each one's rear edge a darker arc; towards the tail some edges are red
 vec2 sp=f/vec2(.050,.040);float row=floor(sp.y);sp.x+=.5*row;vec2 id=vec2(floor(sp.x),row);vec2 cell=fract(sp)-.5;
 float arc=abs(length((cell-vec2(.42,0.))*vec2(1.,1.25))-.70);float edge=ss(.10,.02,arc)*step(body,0.);
 vec3 front=vec3(.016,.020,.015),back=vec3(.024,.029,.022),belly=vec3(.040,.040,.032);
 vec3 col=mix(back,front,ss(.55,.80,u));col=mix(col,belly,ss(.0,-.06,f.y)*.6)*(.85+.3*h21(id));
 float red=ss(.70,.20,u)*step(.35+.4*ss(.2,.6,u),h21(id+7.));col=mix(col,col*.55,edge*.7);col=mix(col,vec3(.085,.012,.006),edge*red*.9);
 col=mix(col,vec3(.012,.014,.011),step(fins,0.)*step(.0,body));col=mix(col,vec3(.050,.010,.006),step(fins,0.)*step(.0,body)*ss(.018,.0,abs(fins+.008))*.35);
 solid(col,c);glow(vec3(.55,.70,.85)*ln(abs(d)*L,.0016)*.24*ss(-.05,.06,f.y)*step(q.y,SURF));
 // the eye, near the front, high on the head
 {vec2 e=f-vec2(-.085,.035);solid(vec3(.01),cov((length(e)-.012)*L));solid(vec3(.45,.40,.15),cov((length(e)-.008)*L));solid(vec3(.01),cov((length(e)-.004)*L));}
 // the gill cover line
 solid(vec3(.02),cov(abs(length((f-vec2(-.13,0.))*vec2(1.,.8))-.07)*L-.0012)*step(-.15,f.x)*step(body,0.)*.8);
}
void scene(vec2 q,float t){
 // the gulp: rings of light spreading on the ceiling of the water, a bright shimmer
 vec2 G=vec2(.10,SURF);float u=t-3.9;
 if(u>0.&&u<5.){for(int k=0;k<3;k++){float r=(u-.35*float(k))*.18;if(r<0.)continue;float dx=abs(abs(q.x-G.x)-r);glow(vec3(.55,.65,.75)*exp(-dx/.008)*exp(-abs(q.y-SURF+.006)/.012)*(1.-u/5.)*.35);}
  glow(vec3(.5,.6,.7)*exp(-length((q-G)*vec2(1.,3.))/.06)*ss(0.,.2,u)*(1.-ss(.3,1.6,u))*.20);}
 // the arapaima: rises, gulps at the surface, glides down and away
 float rise=ss(.3,3.85,t),d1=ss(4.5,6.6,t),d2=ss(6.4,11.8,t);vec2 h=mix(vec2(-.80,-.30),G+vec2(.0,-.010),rise*rise*(3.-2.*rise));h=mix(h,vec2(.38,-.08),d1);h=mix(h,vec2(1.45,-.36),d2*d2);
 float a=mix(mix(.50,.62,rise),.08,d1);a=mix(a,-.26,ss(6.4,7.6,t));float mo=ss(3.75,3.95,t)*ss(4.6,4.3,t);
 arapaima(q,h,a,.90,mo,t);
 // bubbles escaping from its gills as it goes down
 for(int i=0;i<10;i++){float fi=float(i),v=t-4.5-.16*fi;if(v<0.||v>4.)continue;vec2 b0=h+rot(-a)*vec2(-.14,.04)*.90;float y=b0.y+v*.17;if(y>SURF-.01)continue;vec2 c=vec2(b0.x-.04*v+.015*sin(v*6.+fi),y);
  float r=.006+.008*h11(fi);float d=length(q-c)-r;float cv=cov(d);if(cv>0.)put(vec3(.02)*cv,cv*.5,vec3(1.1),-(q-c)*.4);glow(vec3(.7,.85,.95)*ln(abs(d),.0008)*.35);}
 // specks drifting
 for(int i=0;i<30;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+81.)+.03*sin(t*.2+fi),-.5+.9*fract(h11(fi+82.)+t*.006));glow(vec3(.6,.6,.5)*exp(-length(q-c)/.0025)*.18);}
}

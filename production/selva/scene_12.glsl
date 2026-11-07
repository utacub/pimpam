// 13 · Bolets que brillen. Dusk on the forest floor, violet and dark. On a fallen mossy log and on a broken stump grow clusters of small
// mushrooms. As the night comes they light up green, one cluster after another (the key moment, tau ≈ 2.6–4.6 s, a slow brightening,
// never a flash), and their light falls on the moss. Spores drift up from them. Small insects come to the light and land among them
// (≈ 5.5–9 s): the glow of Neonothopanus gardneri follows a daily rhythm and draws insects, which may spread its spores (Oliveira et
// al., 2015).
// The light of the three clusters, lit one after another.
vec2 CL[3];float CI[3];
float shroomLight(vec2 q){float s=0.;for(int k=0;k<3;k++)s+=CI[k]*exp(-length(q-CL[k])/.16);return s;}
// A mushroom from the foot of its stem b, leaning by a, cap radius r; I: how bright it glows.
void shroom(vec2 q,vec2 b,float a,float r,float I){vec2 l=rot(a)*(q-b);if(abs(l.x)>r*1.6||l.y<-.01||l.y>r*2.8)return;float h=r*1.6;
 float st=max(abs(l.x+.10*l.y*l.y/h)-r*.16*(1.-.25*l.y/h),max(-l.y,l.y-h));vec2 cp=l-vec2(0.,h);float cap=max(sdEll(cp,vec2(r,r*.55)),-cp.y-r*.05);
 float gill=max(sdEll(cp,vec2(r*.95,r*.18)),cp.y);float d=min(st,cap);float c=cov(d);if(c<=0.&&I<.01)return;
 vec3 g=vec3(.45,1.,.30);vec3 col=mix(vec3(.035,.030,.028),g*.50,I)*(.8+.2*ss(.0,r*.5,cp.y));col=mix(col,mix(vec3(.04,.034,.03),g*.95,I),cov(gill)*step(cp.y,0.));
 solid(col,c);glow(g*ln(abs(d),.0012)*.30*I);}
void cluster(vec2 q,vec2 c,float s,float I,int n,float sc){glow(vec3(.40,1.,.28)*I*(exp(-length((q-c-vec2(0.,.03))*vec2(1.,1.4))/(.06*sc))*.09+exp(-length(q-c)/(.22*sc))*.010));if(length(q-c)>.32)return;
 for(int i=0;i<9;i++){if(i>=n)break;float fi=float(i);vec2 b=c+vec2((h11(fi+s)-.5)*.22*sc,(h11(fi+s+3.)-.5)*.03);float a=(h11(fi+s+7.)-.5)*.9+(b.x-c.x)*-2.;
  shroom(q,b,a,(.020+.022*h11(fi+s+11.))*sc,I*(.75+.25*h11(fi+s+13.)));}}
// A small flying beetle: dark, its wings a blur; it glints in the green light.
void beetle(vec2 q,vec2 c,float S,float dir,float fly,float t,float lit){vec2 f=(q-c)/S;f.x/=sdir(dir);if(dot(f,f)>4.)return;
 float b=min(sdEll(f,vec2(.42,.26)),length(f-vec2(.42,.04))-.15);solid(vec3(.03,.025,.02),cov(b*S));glow(vec3(.45,1.,.3)*ln(abs(b)*S,.0008)*lit*.5);
 if(fly>.01){float w=sdEll(rot(-.6-.4*sin(t*40.))*(f-vec2(-.05,.25)),vec2(.45,.16));put(vec3(.02,.04,.02)*cov(w*S)*fly,cov(w*S)*.4*fly,vec3(1.),vec2(0.));}
 for(int k=0;k<3;k++){float fk=float(k);solid(vec3(.03),cov((sdSeg(f,vec2(-.2+.2*fk,-.15),vec2(-.28+.25*fk,-.38+.1*fly))-.03)*S));}}
void scene(vec2 q,float t){
 CL[0]=vec2(-.50,-.04);CL[1]=vec2(.47,-.02);CL[2]=vec2(.10,-.36);
 CI[0]=ss(2.6,3.8,t);CI[1]=ss(3.2,4.4,t);CI[2]=ss(3.8,5.0,t);
 float L=shroomLight(q);vec3 G=vec3(.30,.75,.22);
 // ferns, dark, behind
 for(int k=0;k<3;k++){float fk=float(k);vec2 b=vec2(-.15+.5*fk,-.10);for(int j=0;j<5;j++){float a=.75+.42*float(j)+.03*sin(t*.4+fk);vec2 d0=vec2(cos(a),sin(a));
  float u=sat(dot(q-b,d0)/.42);vec2 cp=b+d0*u*.42+vec2(0.,-.07*u*u);float w=.04*(1.-u)*(.6+.4*abs(sin(u*40.)));solid(vec3(.008,.008,.02)+G*L*.04,cov(length(q-cp)-w));}}
 // the stump on the right: broken, jagged top, moss
 {float d=max(abs(q.x-.47)-.13-.02*q.y,q.y+.02+.05*abs(sin(q.x*40.))+.03*sin(q.x*13.));d=max(d,-q.y-.6);
  vec3 bark=vec3(.011,.009,.014)*(.7+.5*fbm2(q*vec2(30.,6.)));solid(bark+G*L*.035,cov(d));glow(vec3(.5,.4,.9)*ln(abs(d),.0012)*.15);}
 // the fallen log on the left, moss on top
 {vec2 a=vec2(-1.2,-.10),b=vec2(.10,-.22);float u=segU(q,a,b);float d=sdSeg(q,a,b)-.12;vec2 ax=normalize(b-a);d=max(d,dot(q-b,ax)+.03+.025*sin(q.y*70.)+.015*sin(q.y*23.));float top=ss(.0,.08,dot(q-mix(a,b,u),vec2(.09,1.)));
  vec3 bark=vec3(.011,.009,.014)*(.7+.5*fbm2(q*vec2(8.,30.)));vec3 moss=vec3(.008,.02,.01)*(.8+.4*vn(q*120.));solid(mix(bark,moss,top*ss(.35,.6,fbm(q*12.)))+G*L*(.025+.07*top),cov(d));
  glow(vec3(.5,.4,.9)*ln(abs(d),.0012)*.18);}
 // moss mound on the floor, in front
 {float d=q.y+.40-.06*exp(-pow((q.x-.10)/.35,2.))-.015*sin(q.x*30.)*vn(q*20.);solid(vec3(.010,.016,.013)*(.8+.4*vn(q*90.))+G*L*.07,cov(d));}
 // the clusters, lighting up one after the other
 cluster(q,vec2(-.50,-.06),1.,CI[0],8,1.);cluster(q,vec2(.47,-.025),20.,CI[1],7,1.);cluster(q,vec2(.10,-.37),40.,CI[2],6,1.3);
 // spores drifting up from them, faint green
 for(int i=0;i<24;i++){float fi=float(i);int k=i%3;vec2 c0=CL[k];float u=fract(h11(fi+5.)+t*.06*(.6+.4*h11(fi)));vec2 c=c0+vec2((h11(fi+2.)-.5)*.25+.04*sin(t*.5+fi),.03+u*.55);
  glow(vec3(.5,1.,.4)*exp(-length(q-c)/.003)*CI[k]*(1.-u)*.6);}
 // insects coming to the light and landing among the mushrooms
 for(int i=0;i<3;i++){float fi=float(i);int k=i;vec2 tgt=CL[k]+vec2(.05-.1*fi,.06);float u=t-5.5-.8*fi;if(u<0.)continue;
  float land=ss(2.6,3.4,u);vec2 from=vec2(i==1?ASP+.2:-ASP-.2,.35-.1*fi);vec2 orb=tgt+vec2(.10*cos(u*1.8+fi),.06*sin(u*2.3+fi)+.05);
  vec2 p=mix(mix(from,orb,ss(0.,1.6,u)),tgt+vec2(0.,.01),land);float dir=sign(orb.x-from.x+.001)*(1.-2.*step(.5,fract(u*.3+fi*.3))*(1.-land));
  beetle(q,p,.032,dir,1.-land,t,CI[k]);}
 // a dark leaf in front
 {float v;vec2 l=rot(2.5)*(q-vec2(ASP+.06,-.64))/.55;float d=leafD(l,.22,v)*.55;solid(vec3(.008,.008,.018)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.95);}
}

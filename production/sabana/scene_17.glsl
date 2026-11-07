// 18 · El baobab. Dusk, up in the crown of a great baobab: the thick trunk, the stubby branches like roots in the air, few leaves. Big
// white flowers hang on long stalks; one after another they open like folded paper unfolding: the petals turn back and the round tuft of
// stamens shows (the key moment, ≈ 3–6.5 s). Fruit bats come to the flowers (≈ 6.5–10 s), and a galago, all eyes, leaps from branch to
// branch. Baobab flowers open at dusk and are visited by bats: Baum (1995) (CANVIS; not verified for this species in the readable text).
// The trunk and the branches: one smooth grey-pink card, with soft folds.
float bbD(vec2 u){float tr=abs(u.x+.62+.04*sin(u.y*3.))-(.30+.06*sin(u.y*2.+1.)+.10*ss(.0,-.5,u.y));tr=max(tr,u.y-.12);
 float d=tr;d=smin(d,sdCap(u,vec2(-.62,.05),vec2(-.20,.30),.11,.07),.06);d=smin(d,sdCap(u,vec2(-.20,.30),vec2(.35,.36),.07,.05),.05);d=smin(d,sdCap(u,vec2(.35,.36),vec2(.95,.30),.05,.04),.04);
 d=smin(d,sdCap(u,vec2(-.70,.08),vec2(-.95,.40),.10,.06),.06);d=smin(d,sdCap(u,vec2(-.62,.10),vec2(-.62,.55),.09,.06),.06);
 d=min(d,sdCap(u,vec2(.05,.33),vec2(.20,.58),.04,.025));d=min(d,sdCap(u,vec2(.55,.34),vec2(.68,.56),.035,.022));d=min(d,sdCap(u,vec2(-.30,.26),vec2(-.42,.55),.05,.03));
 return d;}
void baobab(vec2 q,float t){if(uDecor>1.5)return;float d=bbD(q);dropShadow(bbD(q-SHD*.03),.03,.28*(uDecor>.5?uOpacity:1.));float c=cov(d);if(c<=0.)return;
 vec3 g=vec3(.30,.24,.24)*(1.+.10*sin(q.x*30.+sin(q.y*12.)*2.)*ss(.12,-.2,q.y))*(1.+.08*(vn(q*vec2(8.,40.))-.5));
 float cr=sin(q.x*16.+sin(q.y*3.)*1.5+vn(q*vec2(3.,8.))*2.);g*=1.-.10*ss(.85,1.,cr)*ss(.2,-.1,q.y);
 vec3 col=litN(g,normalize(vec3(.6*ss(.08,0.,-d),.0,1.)),.2)*1.15*(1.+fibre(q*1.3)*.4);col=mix(col,col*1.35+SUNC*.04+vec3(.05,.04,.08)*NIGHT,ss(-PX*4.,-PX*.3,d)*.6);
 solid(decCol(col),c*DEC());
 // a few small leaves at the tips
 float lv=9.;for(int i=0;i<14;i++){float fi=float(i);vec2 p=vec2(-.95+fi*.15,.42+.12*sin(fi*1.9))+vec2(0.,.0);if(bbD(p)>.05)continue;lv=min(lv,sdEll(rot(fi)*(q-p),vec2(.030,.012)));}
 solid(decCol(litFlat(vec3(.12,.18,.06),.4)),cov(lv)*DEC());}
// A flower on its stalk, hanging from the branch at a: a bud, then opening (op 0..1): five crinkled white petals turning back up over
// the calyx, and below them the round puff of stamens on its column.
void flower(vec2 q,vec2 a,float L,float op,float sc,float t){vec2 tip=a+vec2(.03*sin(t*.6+a.x*7.),-L);float st=sdCap(q,a,tip,.0035*sc,.003*sc);solid(litFlat(vec3(.20,.22,.12),.3),cov(st));
 vec2 l=(q-tip)/sc;if(dot(l,l)>.025)return;float px=PX/sc;
 vec3 wh=vec3(.88,.86,.80),gr=vec3(.30,.36,.18);vec3 lc=litFlat(wh,.6)+vec3(.12,.11,.14)*NIGHT;
 float bud=sdEll(l-vec2(0.,-.035),vec2(.022,.038));
 if(op<=.02){solid(litFlat(mix(gr,wh,.35),.4),ss(px,-px,bud));return;}
 // the petals: they open out and curl back up
 float pet=9.;for(int k=0;k<5;k++){float fk=float(k)-2.;float an=PI*.5+fk*mix(.12,.62,op)+PI*(1.-op)*.0;an=mix(-PI*.5+fk*.10,an,op);
  vec2 dir=vec2(cos(an),sin(an));vec2 pc=vec2(0.,-.02)+dir*mix(.02,.045,op);vec2 pl=rot(an)*(l-pc);
  pet=min(pet,sdEll(pl,vec2(mix(.03,.046,op),mix(.014,.022,op)))+.0025*sin(atan(pl.y,pl.x)*7.+fk));}
 solid(lc*(1.+.07*sin(l.x*180.+l.y*60.)),ss(px,-px,pet));
 shade(ss(px*2.,-px,pet+.004)*ss(-.004,-.0,pet)*.3,vec3(.6,.6,.7));
 // the column and the puff of stamens below
 float col=sdCap(l,vec2(0.,-.02),vec2(0.,-.06*op),.007,.007);solid(lc*.92,ss(px,-px,col));
 vec2 pp=l-vec2(0.,-.085*op);float r=length(pp),pr=.040*ss(.3,1.,op);
 if(pr>.001){float an=atan(pp.y,pp.x);float fil=.5+.5*sin(an*48.+r*40.);float puff=r-pr*(1.+.05*(vn(vec2(an*6.,t*.2))-.5));
  vec3 pc=mix(lc*.96,litFlat(vec3(.86,.80,.56),.6),ss(pr*.5,pr,r)*.5)*(1.-.14*fil*ss(pr*.2,pr*.9,r));solid(pc,ss(px,-px,puff));
  }
 solid(litFlat(gr,.3),ss(px,-px,sdEll(l-vec2(0.,-.012),vec2(.016,.013))));}
// A fruit bat seen from the side as it flies (to −x when dir = −1): brown body, a fox-like face, and the wings, leathery membranes
// with a scalloped trailing edge, up and down with the flap.
void bat(vec2 q,vec2 c,float s,float dir,float flap,float hov,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>1.)return;float px=PX/s;vec3 fur=vec3(.30,.19,.10),wing=vec3(.17,.10,.07);
 float body=sdEll(f-vec2(-.02,0.),vec2(.17,.075));vec2 H=vec2(.17,.03);float hd=sdEll(f-H,vec2(.075,.060));float sn=sdCap(f,H,H+vec2(.09,-.02),.040,.018);float ear=sdEll(f-H-vec2(-.02,.065),vec2(.018,.030));
 float wa=sin(flap);float wg=9.,wf=9.;
 for(int k=0;k<2;k++){float far=float(k);float an=mix(1.25,-1.0,.5+.5*wa)+far*.25;vec2 dir2=vec2(cos(an)*.25,sin(an));vec2 sh=vec2(.02-far*.03,.02);
  vec2 l=f-sh;float u=dot(l,dir2)/dot(dir2,dir2);vec2 pr=vec2(dot(l,normalize(dir2)),dot(l,normalize(vec2(-dir2.y,dir2.x))));
  float m=max(sdEll(pr-vec2(.24,-.0),vec2(.25,.13)),-pr.y-.0+(.025*abs(sin(pr.x*22.))-.02));m=max(m,-pr.x);
  if(k==0)wg=m;else wf=m;}
 solid(litFlat(wing*.7,.5)+vec3(.03,.015,.01)*NIGHT,ss(px,-px,wf));
 solid(litFlat(fur,.3),ss(px,-px,min(body,ear)));solid(litFlat(fur*1.1,.3),ss(px,-px,min(hd,sn)));
 solid(litFlat(wing,.5)+vec3(.04,.02,.01)*NIGHT,ss(px,-px,wg));
 eye(f,H+vec2(.035,.015),.022,bl);}
// A galago: grey-brown, round head, huge eyes, big ears, long fluffy tail; leaps with its hind legs.
void galago(vec2 q,vec2 c,float s,float dir,float leap,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>1.5)return;float px=PX/s;vec3 fur=vec3(.42,.36,.30);
 float body=sdEll(rot(-.6*leap+.5*(1.-leap))*(f-vec2(0.,.15)),vec2(.13,.20));vec2 H=vec2(.10,.38)+vec2(.08,-.10)*leap;float hd=length(f-H)-.10;
 float ears=min(sdEll(f-H-vec2(-.06,.10),vec2(.04,.06)),sdEll(f-H-vec2(.05,.11),vec2(.04,.06)));
 float legs=sdCap(f,vec2(-.04,.02),mix(vec2(.06,-.08),vec2(-.30,-.15),leap),.05,.03);
 float tail=sdCap(f,vec2(-.08,.0),vec2(-.45,-.12)+vec2(0.,.10*leap),.03,.06);
 solid(litFlat(fur*.9,.3),ss(px,-px,tail));solid(litFlat(fur,.3),ss(px,-px,min(body,legs)));solid(litFlat(fur*1.1,.3),ss(px,-px,ears));solid(litFlat(fur*1.05,.3),ss(px,-px,hd));
 vec2 E1=H+vec2(.03,.01),E2=H+vec2(.085,.0);solid(litFlat(vec3(.75,.55,.15),.3)*1.2,ss(px,-px,min(length(f-E1)-.038,length(f-E2)-.035)));eye(f,E1,.026,bl);eye(f,E2,.024,bl);}
void scene(vec2 q,float t){
 baobab(q,t);
 // the flowers: open one after another
 for(int i=0;i<8;i++){float fi=float(i);vec2 a=i==0?vec2(-.10,.30):i==1?vec2(.12,.33):i==2?vec2(.33,.355):i==3?vec2(.52,.345):i==4?vec2(.74,.325):i==5?vec2(-.38,.24):i==6?vec2(.90,.31):vec2(.23,.34);
  float L=.10+.17*h11(fi+2.);float sc=i==7?.62:.88;float ord=i==2?0.:i==0?1.:i==4?2.:i==1?3.:i==3?4.:i==5?5.:i==6?6.:7.;float op=ss(3.0+ord*.45,4.0+ord*.45,t);flower(q,a,L,op,sc,t);}
 // the bats: flying in, hovering at the flowers
 for(int i=0;i<3;i++){float fi=float(i);float ta=6.4+fi*1.1;float u=ss(ta,ta+1.6,t);vec2 tg=i==0?vec2(.33,.10):i==1?vec2(-.10,.08):vec2(.74,.10);
  vec2 from=vec2(1.3,.45-fi*.12);vec2 c=mix(from,tg+vec2(.07,-.02),u)+vec2(0.,.06*sin(PI*u))+vec2(.01*sin(t*3.+fi),.008*sin(t*5.+fi));
  if(t>ta)bat(q,c,.19,-1.,t*TAU*(u<1.?2.6:3.2)+fi,u,blinkAt(t,fi*.3));}
 // the galago: sits on a branch, leaps to another, and sits
 float gl=ss(8.0,8.9,t);vec2 g0=vec2(-.30,.30),g1=vec2(.12,.36);vec2 gc=mix(g0,g1,gl)+vec2(0.,.16*sin(PI*gl));
 galago(q,gc,.20,1.,sin(PI*gl),blinkAt(t,.5));
}

// 16 · Els guepards. Late afternoon. A cheetah mother lies on top of an old termite mound, head up, watching the plain; her long tail
// hangs down the side and its white tip twitches. Her three cubs play at the foot of the mound: dark smoky fur with a long silver-grey
// mantle along the back. One cub stalks the tail tip and pounces on it (the key moment, ≈ 3.4–4.2 s); the mother turns her head and
// chirps; the cubs tumble and then climb up beside her. The cubs' mantle and the mother calling them: Lehnert (2013); that the call is a chirp is a
// secondary source (CANVIS).
// The mother: lying like a sphinx on the mound, head up; look: the head turned to the cubs; chirp: mouth open; tw: the tail tip.
void cheetah(vec2 q,vec2 c,float s,float look,float chirp,float tw,float bl,float t){vec2 f=(q-c)/s;if(f.y<-.8||f.y>.7||f.x<-.9||f.x>.7)return;float px=PX/s;
 vec3 fur=vec3(.62,.42,.17),pale=vec3(.80,.70,.52),blk=vec3(.03,.025,.02);
 float body=smin(sdEll(f-vec2(-.05,.13),vec2(.36,.12)),sdEll(f-vec2(.22,.16),vec2(.14,.12)),.08);
 float legs=min(sdCap(f,vec2(.24,.08),vec2(.48,.02),.05,.035),sdCap(f,vec2(.20,.06),vec2(.42,.0),.045,.032));
 float hind=sdEll(f-vec2(-.28,.10),vec2(.15,.11));
 vec2 H=vec2(.36,.36)+vec2(-.02,.0)*look;float hd=sdEll(f-H,vec2(.105,.095));float muz=sdEll(f-H-vec2(mix(.08,-.08,look),-.035),vec2(.055,.040));
 float neck=sdCap(f,vec2(.25,.20),H-vec2(.0,.04),.09,.07);
 float ears=min(length(f-H-vec2(-.06,.085))-.03,length(f-H-vec2(.03,.095))-.028);
 // the tail: down the side of the mound in an S, the tip curling and twitching
 vec2 ta=vec2(-.40,.10);float tl=9.;vec2 pr=ta;float ring=0.;vec2 tip=ta;
 for(int i=1;i<=9;i++){float u=float(i)/9.;vec2 p=ta+vec2(-.10*u-.06*sin(u*3.),-.62*u)+vec2(.10*sin(u*2.5+.5)*u,0.)+vec2(.08*tw*u*u,.04*tw*u*u);float d=sdCap(f,pr,p,.032,.030);if(d<tl){tl=d;ring=u;}pr=p;tip=p;}
 // the shadow, the parts
 dropShadow(min(min(body,legs),min(hd,tl))*s,.03,.30);
 solid(litFlat(fur*.7,.2),ss(px,-px,hind+.0));
 vec3 tc=mix(fur,blk,ss(.70,.74,ring)*ss(.80,.76,ring)+ss(.84,.87,ring)*ss(.92,.89,ring));tc=mix(tc,pale*1.1,ss(.94,.97,ring));
 CUT(tl*s,tc,f*2.,.2,.006);
 CUT(legs*s,fur,f*2.,.2,.006);
 // the spots: solid black dots, small and many
 vec2 sg=f*vec2(20.,20.);vec2 id=floor(sg),fr=fract(sg)-.5;vec2 o=(h22(id)-.5)*.4;float spot=ss(.22,.15,length(fr-o))*step(.15,h21(id+3.));
 CUT(body*s,mix(mix(fur,pale,ss(.10,.04,f.y)),blk,spot*ss(.05,.12,f.y)),f*2.,.2,.012);
 CUT(neck*s,mix(fur,blk,spot*.8),f*2.,.2,.008);
 solid(litFlat(fur,.2),ss(px,-px,ears));solid(litFlat(blk,.2),ss(px,-px,ears+.012));
 CUT(hd*s,fur*1.05,f*2.,.2,.008);
 CUT(muz*s,pale,f*2.,.2,.004);
 // the black tear lines from the eyes to the mouth; the nose; the mouth open for the chirp
 float sx=mix(1.,-1.,look);vec2 E=H+vec2(.035*sx,.025);
 float tear=sdCap(f,E+vec2(.005*sx,-.01),H+vec2(.07*sx,-.065),.008,.006);solid(litFlat(blk,.1),ss(px,-px,tear));
 solid(litFlat(blk,.1),ss(px,-px,sdEll(f-H-vec2(.11*sx,-.02),vec2(.022,.016))));
 if(chirp>0.)solid(litFlat(vec3(.35,.10,.08),.1),ss(px,-px,sdEll(f-H-vec2(.08*sx,-.07),vec2(.025,.018*chirp))));
 eye(f,E,.016,bl);}
// A cub (about two months old): a big round head, a round body, thick legs; dark smoky fur, and the long silver-grey mantle of fluffy
// hair from the crown along the neck and the back to the root of the tail. pose: walk (ph), crouch (stalking), leap (pounce), roll (a
// tumble).
struct Cb{float legsN,legsF,body,head,muz,ear,tail;vec2 H;float yl;};
Cb cbParts(vec2 f,float ph,float walk,float crouch,float leap){Cb P;
 float dn=.07*crouch;vec2 sF=vec2(.12,.23-dn),sB=vec2(-.13,.25-dn*.6);
 float a=sin(ph)*walk,b=sin(ph+PI)*walk;
 vec2 f1=vec2(.15+.06*a+.06*crouch,.03*max(0.,cos(ph))*walk),f2=vec2(.11+.06*b+.06*crouch,.03*max(0.,-cos(ph))*walk);
 vec2 h1=vec2(-.13+.06*b,.03*max(0.,-cos(ph))*walk),h2=vec2(-.17+.06*a,.03*max(0.,cos(ph))*walk);
 f1=mix(f1,vec2(.40,.22),leap);f2=mix(f2,vec2(.36,.18),leap);h1=mix(h1,vec2(-.40,.14),leap);h2=mix(h2,vec2(-.37,.10),leap);
 float l=.13;
 vec2 k1=knee(sF,f1,l,l,1.),k2=knee(sF-vec2(.03,0.),f2,l,l,1.),k3=knee(sB,h1,l,l,-1.),k4=knee(sB-vec2(.03,0.),h2,l,l,-1.);
 P.legsN=min(min(sdCap(f,sF,k1,.050,.034),sdCap(f,k1,f1+vec2(0.,.024),.034,.030)),min(sdCap(f,sB,k3,.064,.036),sdCap(f,k3,h1+vec2(0.,.024),.036,.030)));
 P.legsF=min(min(sdCap(f,sF-vec2(.03,0.),k2,.048,.032),sdCap(f,k2,f2+vec2(0.,.024),.032,.028)),min(sdCap(f,sB-vec2(.03,0.),k4,.062,.034),sdCap(f,k4,h2+vec2(0.,.024),.034,.028)));
 vec2 bq=rot(-.15*leap)*(f-vec2(0.,.27-dn));
 float body=smin(smin(sdEll(bq,vec2(.20,.100)),length(bq-vec2(.12,.0))-.100,.05),length(bq-vec2(-.13,.01))-.098,.05);
 // the head: big and round, the short muzzle, round ears; the neck joins it to the chest
 P.H=vec2(.27,.37-dn*1.3+.05*leap);vec2 hq=f-P.H;
 P.head=smin(length(hq)-.112,sdEll(hq-vec2(.075,-.045),vec2(.060,.045)),.04);
 P.muz=max(sdEll(hq-vec2(.105,-.052),vec2(.050,.038)),P.head+.002);
 P.ear=min(length(hq-vec2(-.065,.090))-.038,length(hq-vec2(.020,.108))-.034);
 P.body=smin(body,sdCap(f,vec2(.13,.30-dn),P.H-vec2(.03,.03),.085,.070),.04);
 // the tail: thick and fluffy, its end curling up
 vec2 t0=vec2(-.20,.30-dn),t1=vec2(-.33,.29-dn+.03*sin(ph*.5)),t2=vec2(-.41,.37+.05*sin(ph*.5+1.));
 P.tail=min(sdCap(f,t0,t1,.034,.032),sdCap(f,t1,t2,.032,.038));
 // the lower edge of the mantle: along the middle of the flank, rising to the crown over the neck
 P.yl=mix(.325-dn,P.H.y+.055,ss(.12,.25,f.x));return P;}
void cub(vec2 q,vec2 c,float s,float dir,float ph,float walk,float crouch,float leap,float roll,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f-vec2(0.,.3),f-vec2(0.,.3))>.8)return;
 f=rot(roll)*(f-vec2(0.,.25))+vec2(0.,.25);float px=PX/s;
 vec3 fur=vec3(.14,.125,.11),mant=vec3(.58,.58,.56),pale=vec3(.36,.33,.29),blk=vec3(.025,.022,.02);
 Cb P=cbParts(f,ph,walk,crouch,leap);
 {vec2 fs=f-SHD*.03/s*vec2(dir,1.);Cb S=cbParts(fs,ph,walk,crouch,leap);dropShadow(min(min(S.body,S.head),min(S.legsN,S.tail))*s,.02,.25*(1.-leap*.5));}
 solid(litFlat(fur*.85,.2),ss(px,-px,P.tail));
 solid(litFlat(fur*.62,.1),ss(px,-px,P.legsF));
 CUT(P.legsN*s,fur,f*2.,.2,.005);
 under(P.body*s+.003,.008);CUT(P.body*s,fur,f*2.,.2,.010);
 solid(litFlat(fur*1.05,.2),ss(px,-px,P.ear));solid(litFlat(blk,.1),ss(px,-px,P.ear+.014));
 CUT(P.head*s,fur*1.08,f*2.,.2,.008);
 CUT(P.muz*s,pale,f*2.,.2,.004);
 // the mantle: the top of the silhouette, a little larger than it, with a soft ragged edge of long hairs
 float fz=.012*(vn(f*vec2(46.,30.))-.5)+.008*abs(sin(f.x*52.+f.y*11.));
 float man=max(min(P.body,P.head)-.020-fz,P.yl-f.y+fz);man=max(man,-.25-f.x);
 vec3 mc=litFlat(mant,.4)*(.80+.20*ss(P.yl,P.yl+.07,f.y))*(1.+.08*sin(f.x*80.+vn(f*18.)*4.));
 solid(mc,ss(px*1.5,-px*1.5,man)*.92);
 // the face: the black tear line from the eye, the nose, the eye
 vec2 E=P.H+vec2(.045,.018);solid(litFlat(blk,.1),ss(px,-px,sdCap(f,E+vec2(.004,-.012),P.H+vec2(.085,-.07),.007,.005)));
 solid(litFlat(blk,.1),ss(px,-px,sdEll(f-P.H-vec2(.148,-.035),vec2(.020,.015))));eye(f,E,.020,bl);}
// The old mound the mother lies on: low and rounded, with grass on its flanks.
float mound16(vec2 u){vec2 l=u-vec2(.18,G0);float d=sdEll(l-vec2(0.,.0),vec2(.42,.30));d=smin(d,sdEll(l-vec2(.10,.24),vec2(.14,.10)),.08);return max(d,-l.y)+.006*(vn(u*25.)-.5);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.18,G0+.05,.05,g*.95,16.);
 float mo=mound16(q);dropShadow(mound16(q-SHD*.03),.03,.32*(uDecor>.5?uOpacity:1.));
 if(uDecor<1.5&&cov(mo)>0.){vec3 cl=mix(vec3(.30,.17,.08),vec3(.36,.21,.11),ss(G0,G0+.3,q.y))*(1.+.08*sin(q.y*70.+vn(q*12.)*5.))*(1.+fibre(q*1.3)*.45);
  vec3 col=litFlat(cl,.1)*1.12;col=mix(col,col*1.35+SUNC*.05,ss(-PX*3.,-PX*.3,mo)*.5);
  float gr=ss(.7,.95,vn(q*vec2(60.,25.)))*ss(G0+.10,G0+.03,q.y);col=mix(col,litFlat(g*.8,.3),gr*.6);solid(decCol(col),cov(mo)*DEC());}
 // the mother
 float look=ss(4.15,4.5,t)*ss(9.5,9.0,t);float chirp=ss(4.4,4.5,t)*ss(4.75,4.6,t)+ss(5.0,5.1,t)*ss(5.35,5.2,t);
 float tw=sin(t*2.3)*.6+ss(3.95,4.05,t)*ss(4.6,4.3,t)*.8;
 cheetah(q,vec2(.14,G0+.315),.42,look,chirp,tw,blinkAt(t,.3),t);
 // the cubs: one stalks the tail tip and pounces; one plays with it; one rolls; then they climb up beside her
 float lt=sat((t-3.45)/.7);float lp=sin(PI*lt);
 vec2 tipP=vec2(.14,G0+.315)+vec2(-.48,-.58)*.42;
 vec2 c1=mix(vec2(-.62,G0-.01),tipP+vec2(-.06,-.02),ss(3.45,4.15,t))+vec2(0.,.14*lp);if(t<3.45)c1=mix(vec2(-.80,G0-.01),vec2(-.62,G0-.01),ss(2.,3.3,t));
 float cl1=ss(8.,9.4,t);c1=mix(c1,vec2(-.10,G0+.22),cl1);
 cub(q,c1,.28,1.,t*TAU*1.5,t<3.4?ss(2.,2.3,t)*ss(3.3,3.1,t):cl1*(1.-cl1)*4.,t<3.45?ss(2.8,3.1,t):0.,lp>0.?ss(0.,.3,lp):0.,0.,blinkAt(t,.1));
 float r2=ss(4.4,5.6,t)*ss(7.4,6.4,t);vec2 c2=vec2(-.40+.10*sin(t*1.1),G0-.03)+vec2(0.,.05*abs(sin(t*3.))*r2);
 cub(q,c2,.26,(sin(t*.8)>0.?1.:-1.),t*TAU*1.8,.6,0.,0.,r2*TAU*ss(4.6,5.4,t),blinkAt(t,.5));
 float cl3=ss(8.6,10.0,t);vec2 c3=mix(vec2(.12,G0-.03),vec2(.46,G0+.22),cl3);
 cub(q,c3,.25,1.,t*TAU*1.4,.5+.5*cl3,0.,0.,0.,blinkAt(t,.8));
 floorStrip(-.10,G0-.07,.05,g*.82,17.);
}

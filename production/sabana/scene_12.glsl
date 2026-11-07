// 13 · El termiter per dins. A great termite mound cut through the middle, like a diorama: as the camera comes in, its outer wall of
// paper fades and the section shows. Inside: the central chimney up to the vents, galleries branching off it, the chambers of the fungus
// gardens (brown combs with white knots), and below, at ground level, the royal cell with the big queen and the small king. Workers walk
// the galleries carrying bits of grass; soldiers with dark heads guard the openings. The key moment (≈ 4–7 s): the day warms the thin
// conduits along the wall first, so a glow of warm air rises up them (≈ 4–5.4 s), crosses over at the top and sinks down the central
// chimney to the cellar (≈ 5.6–7 s): the mound breathes in a closed loop; a softer loop again at ≈ 8.6–11.5 s. Daytime air rising in the
// outer conduits and sinking in the chimney: King et al. (2015), measured in mounds of Odontotermes obesus; showing it in an East African
// mound, and the light that shows the air, are design criteria (CANVIS).
float moundW(float y){float h=sat((y-G0)/.62);return .40*pow(1.-h,.80)+.010*sin(y*40.)+.007*sin(y*93.);}
float moundOut(vec2 u){float d=abs(u.x-.015*sin(u.y*6.))-moundW(u.y);d=max(d,u.y-(G0+.62));d=max(d,G0-.012-u.y);
 d=min(d,max(abs(u.x-.25)-.05*sat(1.-(u.y-G0)/.24),max(u.y-(G0+.24),G0-.012-u.y)));
 d=min(d,max(abs(u.x+.27)-.045*sat(1.-(u.y-G0)/.18),max(u.y-(G0+.18),G0-.012-u.y)));
 return d;}
// The galleries: the chimney (from the cellar up to the vents), the side galleries, the conduits near the wall, the vents; negative inside
// a hollow. They stay inside the mound (or under the ground).
float chimX(float y){return .012*sin(y*22.)+.006*sin(y*51.);}
float galleries(vec2 u){float d=9.;
 // the chimney
 float yy=clamp(u.y,G0-.28,G0+.58);d=abs(u.x-chimX(u.y))-mix(.026,.014,sat((u.y-G0)/.58));d=max(d,max(u.y-(G0+.58),G0-.28-u.y));
 // side galleries: out and up from the chimney, bending
 for(int i=0;i<10;i++){float fi=float(i);float y=G0+.04+fi*.052;float sx=mod(fi,2.)<.5?1.:-1.;float w=moundW(y+.04)-.06;if(w<.05)continue;
  vec2 a=vec2(chimX(y),y),b=a+vec2(sx*w*.55,.035+.02*h11(fi)),c=vec2(sx*w*(.80+.15*h11(fi+3.)),y+.07+.03*h11(fi+5.));
  d=min(d,min(sdCap(u,a,b,.012,.010),sdCap(u,b,c,.010,.008)));}
 // the conduits along the inside of the wall
 for(int k=0;k<2;k++){float sx=k==0?1.:-1.;float x=sx*(moundW(u.y)-.045);float m=max(abs(u.x-x)-.007,max(u.y-(G0+.46),G0+.03-u.y));d=min(d,m);}
 // the vents at the top
 d=min(d,sdCap(u,vec2(chimX(G0+.56),G0+.56),vec2(.035,G0+.63),.009,.007));d=min(d,sdCap(u,vec2(chimX(G0+.52),G0+.52),vec2(-.05,G0+.60),.009,.007));
 // the cellar channels under the ground
 d=min(d,sdCap(u,vec2(-.30,G0-.20),vec2(.32,G0-.22),.010,.010));d=min(d,sdCap(u,vec2(-.22,G0-.05),vec2(-.05,G0-.16),.010,.009));d=min(d,sdCap(u,vec2(.24,G0-.06),vec2(.06,G0-.15),.010,.009));
 return d;}
// The two conduits along the wall and the chimney, apart (for the light of the air that moves in them).
float conduitsD(vec2 u){float d=9.;for(int k=0;k<2;k++){float sx=k==0?1.:-1.;float x=sx*(moundW(u.y)-.045);d=min(d,max(abs(u.x-x)-.007,max(u.y-(G0+.46),G0+.03-u.y)));}return d;}
float chimneyD(vec2 u){return max(abs(u.x-chimX(u.y))-mix(.026,.014,sat((u.y-G0)/.58)),max(u.y-(G0+.58),G0-.28-u.y));}
float chambers(vec2 u){float d=9.;
 for(int i=0;i<8;i++){float fi=float(i);float sx=mod(fi,2.)<.5?1.:-1.;float row=floor(fi/2.);vec2 p=vec2(sx*(.17-.025*row),G0+.035+.075*row-(row>2.5?.30:0.));
  if(row>2.5)p=vec2(sx*.24,G0-.11);d=min(d,sdEll(u-p,vec2(.068-.008*row,.032)));}return d;}
const vec2 ROYAL=vec2(.0,-.10);
// a worker termite (cream body, brown head), or a soldier (bigger dark head, jaws); s: its length; dir: where it faces (an angle)
void termite(vec2 q,vec2 c,float s,float ang,float soldier,float ph,float carry){vec2 f=rot(ang)*(q-c)/s;if(dot(f,f)>1.6)return;float px=PX/s;
 float ab=sdEll(f-vec2(-.30,0.),vec2(.32,.18)),th=sdEll(f-vec2(.05,0.),vec2(.12,.10)),hd=soldier>.5?sdEll(f-vec2(.30,0.),vec2(.20,.14)):length(f-vec2(.26,0.))-.12;
 float lg=9.;for(int k=0;k<3;k++){float fk=float(k)-1.;float w=.06*sin(ph+fk*2.1);lg=min(lg,min(sdSeg(f,vec2(.05+fk*.08,0.),vec2(.05+fk*.12+w,.26)),sdSeg(f,vec2(.05+fk*.08,0.),vec2(.05+fk*.12-w,-.26))));}
 solid(litFlat(vec3(.30,.20,.10),.2),ss(px,-px,lg-.022));
 solid(litFlat(vec3(.78,.70,.52),.3),ss(px,-px,min(ab,th)));solid(litFlat(vec3(.62,.54,.38),.3),ss(px,-px,abs(ab+.08)-.01)*ss(.0,-.01,ab)*.5);
 vec3 hc=soldier>.5?vec3(.30,.13,.05):vec3(.45,.27,.10);solid(litFlat(hc,.3),ss(px,-px,hd));
 if(soldier>.5){float j=min(sdCap(f,vec2(.45,.05),vec2(.62,-.02),.03,.012),sdCap(f,vec2(.45,-.05),vec2(.62,.02),.03,.012));solid(litFlat(vec3(.10,.05,.02),.2),ss(px,-px,j));}
 if(carry>0.){float it=sdCap(f,vec2(.38,-.18),vec2(.55,.20),.045,.035);solid(litFlat(mix(vec3(.55,.45,.18),vec3(.25,.40,.10),step(.5,carry-.5)),.4),ss(px,-px,it));}}
// The path of a worker along the galleries: up the chimney from the nest and out along a side gallery, and back (k: which gallery)
vec2 tPath(float k,float u,out float ang){float fi=mod(k,10.);float y=G0+.04+fi*.052;float sx=mod(fi,2.)<.5?1.:-1.;float w=max(moundW(y+.04)-.06,.05);
 vec2 A=vec2(chimX(G0-.10),G0-.10),B=vec2(chimX(y),y),C=B+vec2(sx*w*.55,.035+.02*h11(fi)),D=vec2(sx*w*(.80+.15*h11(fi+3.)),y+.07+.03*h11(fi+5.));
 float l1=length(B-A),l2=length(C-B),l3=length(D-C),s=u*(l1+l2+l3);vec2 p,d;
 if(s<l1){p=mix(A,B,s/l1);p.x=chimX(p.y);d=B-A;}else if(s<l1+l2){p=mix(B,C,(s-l1)/l2);d=C-B;}else{p=mix(C,D,(s-l1-l2)/l3);d=D-C;}ang=atan(d.y,d.x);return p;}
void scene(vec2 q,float t){
 vec2 u=q;float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.20,G0+.05,.05,g*.95,14.);
 // the cut ground: earth in layers below the grass line, with roots and stones
 if(uDecor<1.5&&u.y<G0+.01){float st=floor((G0-u.y)/.05+.3*sin(u.x*5.));vec3 e=mix(vec3(.19,.105,.05),vec3(.155,.085,.04),mod(st,2.));e=mix(e,vec3(.12,.06,.03),ss(G0,-.5,u.y)*.6);
  float rt=9.;for(int i=0;i<7;i++){float fi=float(i);float x=-.90+fi*.30+.05*h11(fi);if(abs(x)<.45)continue;rt=min(rt,abs(u.x-x-.04*sin(u.y*25.+fi))-.0035*(1.+(u.y-G0)*5.));}
  e=mix(e,vec3(.34,.22,.11),ss(PX,-PX,rt)*.8);
  vec2 sg=u*vec2(16.,22.);vec2 id=floor(sg),fr=fract(sg)-.5;float stn=ss(.22,.17,length(fr*vec2(1.,1.3)))*step(.90,h21(id+9.));e=mix(e,vec3(.21,.18,.15),stn*.8);
  float top=G0+.004*sin(u.x*30.);solid(decCol(litFlat(e,.1)*1.25*(1.+fibre(u*1.2)*.4)),ss(PX,-PX,u.y-top));
  solid(decCol(litFlat(g*.85,.3)),ss(PX,-PX,abs(u.y-top+.006)-.006)*DEC());}
 // the section of the mound: clay in layers; the galleries and the chambers are hollows, dark with warm edges
 float mo=moundOut(u);
 dropShadow(moundOut(u-SHD*.03),.03,.32*(uDecor>.5?uOpacity:1.));
 if(cov(mo)>0.){float lay=sin((u.y-G0)*90.+sin(u.x*12.)*1.6);vec3 clay=mix(vec3(.30,.15,.07),vec3(.25,.12,.055),ss(-.3,.3,lay));clay*=1.+.1*(vn(u*vec2(40.,60.))-.5);
  vec3 col=litFlat(clay,.1)*1.15*(1.+fibre(u*1.4)*.45);col=mix(col,col*1.35+SUNC*.04,ss(-PX*3.,-PX*.3,mo)*.5);solid(decCol(col),cov(mo));}
 // the loop of warm air: up the conduits along the wall (rise), then down the chimney (sink); twice, the second softer
 float lp1=sat((t-4.0)/1.4),dn1=sat((t-5.6)/1.4),lp2=sat((t-8.6)/1.4),dn2=sat((t-10.1)/1.4);
 float up1=mix(G0+.0,G0+.50,lp1*lp1*(3.-2.*lp1)),sk1=mix(G0+.62,G0-.30,dn1*dn1*(3.-2.*dn1)),up2=mix(G0+.0,G0+.50,lp2*lp2*(3.-2.*lp2)),sk2=mix(G0+.62,G0-.30,dn2*dn2*(3.-2.*dn2));
 float wu1=ss(4.0,4.2,t)*ss(5.9,5.4,t),wd1=ss(5.5,5.8,t)*ss(7.3,6.8,t),wu2=(ss(8.6,8.8,t)*ss(10.4,9.9,t))*.55,wd2=(ss(10.0,10.3,t)*ss(11.8,11.3,t))*.55;
 float inside=max(mo,-(u.y-G0))<0.?1.:(u.y<G0&&abs(u.x)<.55?1.:0.);
 float ga=galleries(u),ch=chambers(u),ry=sdEll(u-ROYAL-vec2(0.,G0+.18-.18),vec2(.14,.050));ry=sdEll(u-vec2(0.,G0-.11),vec2(.14,.050));
 float hol=min(min(ga,ch),ry);float Rd=min(mo,max(u.y-G0,abs(u.x)-.55));hol=max(hol,Rd+.012);
 if(hol<PX*3.&&uDecor<1.5){float inr=sat(-hol/.025);vec3 ins=mix(vec3(.13,.06,.025),vec3(.07,.03,.015),inr);
  // a glow with a tail below it (rising) or above it (sinking), only in the conduits or only in the chimney, and a little around
  float cdM=ss(.0,-.006,conduitsD(u)),chM=ss(.0,-.008,chimneyD(u));
  float gU=wu1*ss(.16,.0,up1-u.y)*ss(-.03,.0,up1-u.y)+wu2*ss(.16,.0,up2-u.y)*ss(-.03,.0,up2-u.y);
  float gD=wd1*ss(.16,.0,u.y-sk1)*ss(-.03,.0,u.y-sk1)+wd2*ss(.16,.0,u.y-sk2)*ss(-.03,.0,u.y-sk2);
  float lite=gU*(cdM+.15)+gD*(chM+.15)*.75;
  ins+=mix(vec3(1.,.60,.24),vec3(.90,.70,.45),gD/(gU+gD+1e-4))*lite*.85;
  solid(ins,cov(hol));shade(ss(PX*1.5,-PX*3.,hol)*ss(-PX*5.,-PX*.5,hol)*.4,vec3(.35,.25,.2));}
 // the glow of the moving air spills a little onto the clay around the conduits and the chimney
 if(uDecor<1.5&&mo<0.&&(wu1+wu2+wd1+wd2)>0.){float cd=conduitsD(u),hd=chimneyD(u);
  float gU=wu1*ss(.16,.0,up1-u.y)*ss(-.03,.0,up1-u.y)+wu2*ss(.16,.0,up2-u.y)*ss(-.03,.0,up2-u.y);
  float gD=wd1*ss(.16,.0,u.y-sk1)*ss(-.03,.0,u.y-sk1)+wd2*ss(.16,.0,u.y-sk2)*ss(-.03,.0,u.y-sk2);
  float h=gU*ss(.035,.0,cd)*step(0.,cd)+gD*ss(.030,.0,hd)*step(0.,hd)*.6;solid(vec3(1.,.66,.30),h*.40);}
 // the fungus combs in the chambers: brown sponge with white knots
 if(ch<0.&&uDecor<1.5){vec2 cg=u*90.;float sp=vn(cg)*.6+vn(cg*2.3)*.4;vec3 fc=mix(vec3(.44,.30,.15),vec3(.30,.19,.09),ss(.4,.7,sp));
  vec2 id=floor(u*60.),fr=fract(u*60.)-.5;float kn=ss(.25,.15,length(fr))*step(.70,h21(id));fc=mix(fc,vec3(.88,.86,.80),kn);
  solid(litFlat(fc,.2)*1.25,ss(PX,-PX,ch+.010));}
 // the royal cell: the queen, long and swollen (cream with brown bands), the small king beside her, workers tending her
 {vec2 rq=u-vec2(0.,G0-.115);float qa=sdEll(rq-vec2(-.015,0.),vec2(.095,.030+.002*sin(t*1.5)));float bands=ss(.3,.6,sin(rq.x*130.));
  solid(litFlat(mix(vec3(.84,.78,.64),vec3(.62,.48,.30),bands*.5),.3),ss(PX,-PX,qa));
  solid(litFlat(vec3(.45,.27,.10),.3),ss(PX,-PX,length(rq-vec2(.092,.004))-.016));
  termite(q,vec2(.115,G0-.112),.026,PI,0.,t*6.,0.);termite(q,vec2(-.125,G0-.118),.026,0.,0.,t*6.+1.,0.);}
 // the workers along the galleries, carrying bits of grass; soldiers at the openings
 for(int i=0;i<12;i++){float fi=float(i);float sp=.045+.025*h11(fi+2.);float u0=fract(t*sp+h11(fi));float back=step(.5,u0);float uu=back>.5?2.-2.*u0:2.*u0;float ang;
  vec2 p=tPath(fi,uu,ang);if(back>.5)ang+=PI;termite(q,p,.026,-ang,0.,t*12.+fi,back>.5?0.:1.+step(.5,h11(fi+7.)));}
 termite(q,vec2(.035,G0+.62),.032,-1.2,1.,t*3.,0.);termite(q,vec2(-.05,G0+.595),.032,PI+1.0,1.,t*3.+1.,0.);termite(q,vec2(.30,G0-.205),.032,PI,1.,t*3.+2.,0.);
 // where the loop turns over at the top: a soft warm haze between the tops of the conduits and the top of the chimney
 float tp=ss(5.2,5.6,t)*ss(6.2,5.8,t)+(ss(9.8,10.2,t)*ss(10.8,10.4,t))*.55;
 if(tp>0.&&uDecor<1.5){vec2 v=u-vec2(.0,G0+.50);float m=ss(.0,-.02,mo)*ss(.10,.0,abs(v.y))*ss(.30,.10,abs(v.x));solid(vec3(.95,.62,.30)*.9,m*.35*tp);}
 // the outer wall of the mound: it fades as the camera comes in
 float wall=1.-ss(1.0,2.6,t);if(wall>0.){float cw=cov(mo);if(cw>0.){vec3 wc=litFlat(vec3(.31,.155,.07),.1)*1.15*(1.+.12*sin(u.y*60.+vn(u*14.)*5.))*(1.+fibre(u*1.3)*.4);solid(decCol(wc),cw*wall);}
  if(u.y<G0+.004){vec3 gc=litFlat(g*mix(.85,.70,ss(G0,-.5,u.y)),.3)*(1.+fibre(u)*.35);float bl=floor(u.x*90.);gc*=1.+.08*(h11(bl)-.5);solid(decCol(gc),wall*ss(PX,-PX,u.y-G0-.004*sin(u.x*30.)));}}
}

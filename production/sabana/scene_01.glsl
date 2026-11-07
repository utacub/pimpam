// 2 · Els flamencs. At eye level over the lake at dawn, a group of six flamingos stands in the shallow water, mirrored in it. They
// march together to the right (tau ≈ 0–3.4 s), stop, and all turn their heads at once, to the back and again forward (the key moment,
// ≈ 3.6–5 s: group marching and head-flagging are displays of flamingo groups). Two then feed with their heads upside down in the water
// (≈ 5.5–8.3 s), rings spreading where they dip; one opens its wings and shows the coral red under them and the black flight feathers
// (≈ 8.6–10.6 s); at the end one tucks a leg up and stands on the other. Puppets of cut paper: pale pink card, coral wing coverts,
// black flight feathers, the joints pinned.
const float WL=-.24; // the waterline: where the feet are
struct Fl{float body,neck,head,bill,tip,cov,prim,ln1,ln2,lf1,lf2,feet,wo,wop,eye;vec2 eyeC;};
// The parts of a flamingo in its own frame f (feet at y = 0, height ≈ 1, facing +x). legN/legF: phase of the near/far leg (stepping
// when walk > 0); hd: head turned (1 forward, −1 back); dip: the head down in the water; wing: wings open; tuck: the far leg up.
Fl flParts(vec2 f,float ph,float walk,float hd,float dip,float wing,float tuck){Fl P;
 // the legs: from the hip to the foot, the joint (the ankle) bending backwards; the far leg can be tucked up under the body
 vec2 hip=vec2(-.01,.56);
 vec2 fN=vec2(.09*sin(ph)*walk,.07*max(0.,cos(ph))*walk),fF=vec2(-.09*sin(ph)*walk,.07*max(0.,-cos(ph))*walk);
 fF=mix(fF,vec2(.02,.40),tuck);
 vec2 kN=knee(hip,fN,.29,.29,-1.),kF=knee(hip+vec2(.02,0.),fF,.29,.29,-1.);
 P.ln1=sdCap(f,hip,kN,.020,.014);P.ln2=sdCap(f,kN,fN+vec2(0.,.01),.014,.011);
 P.lf1=sdCap(f,hip+vec2(.02,0.),kF,.019,.013);P.lf2=sdCap(f,kF,fF+vec2(0.,.01),.013,.010);
 P.feet=min(sdEll(f-fN-vec2(.035,.008),vec2(.045,.012)),sdEll(f-fF-vec2(.035,.008),vec2(.045,.012))+tuck*.2);
 // the body, a little tilted, the tail end lower at the back
 vec2 bq=rot(.10-.10*dip)*(f-vec2(0.,.63));P.body=min(sdEll(bq,vec2(.20,.095)),sdEll(bq-vec2(-.17,-.03),vec2(.06,.04)));
 P.cov=max(sdEll(bq-vec2(-.03,.025),vec2(.15,.06)),P.body+.006);P.prim=max(sdEll(bq-vec2(-.14,-.030),vec2(.10,.020)),P.body+.004);
 // the neck: an S from the shoulder to the head (a curve sampled in eight short pieces); down to the water when it feeds
 vec2 B=vec2(.13,.66),H=mix(vec2(.12,.99),vec2(.33,.07),dip),C=mix(vec2(-.07,.80),vec2(.42,.80),dip);
 float nk=9.;vec2 pr=B;for(int i=1;i<=8;i++){float u=float(i)/8.;vec2 pt=mix(mix(B,C,u),mix(C,H,u),u);nk=min(nk,sdCap(f,pr,pt,mix(.034,.021,u-.125),mix(.034,.021,u)));pr=pt;}
 P.neck=nk;
 // the head and its bill, bent down in the middle; upside down when it feeds; turned (seen narrower) when it looks back
 float ang=mix(0.,-2.6,dip);vec2 hq=rot(-ang)*(f-H);float hs=sign(hd)*max(abs(hd),.18);hq.x/=hs;
 P.head=length(hq*vec2(1.,1.15))-.036;
 P.bill=min(sdCap(hq,vec2(.016,-.004),vec2(.068,-.010),.021,.017),sdCap(hq,vec2(.068,-.010),vec2(.084,-.052),.017,.007))*abs(hs);
 P.tip=max(P.bill,(.074-hq.x)*abs(hs));P.eyeC=H+rot(ang)*vec2(.006*hs,.010);P.eye=length(f-P.eyeC)-.008;
 // the wings, opened upwards: coral card, the black flight feathers along their outer edge
 P.wo=9.;P.wop=9.;
 if(wing>.01){vec2 sh=vec2(.02,.70);for(int k=0;k<2;k++){float fk=float(k),a=mix(-.15,1.35+.45*fk,wing);vec2 w=rot(a)*(f-sh-vec2(-.03*fk,0.));w.x/=.92+.08*(1.-fk);
   float tr=.012*abs(sin(w.x*55.))*ss(.12,.3,w.x);float d=sdEll(w-vec2(.25,.0),vec2(.27,.088))+tr*step(w.y,0.);
   float cv=max(d+.004,max(w.x-.34-.4*w.y,-w.y-.045));P.wo=min(P.wo,d);P.wop=min(P.wop,max(d,-cv));}}
 return P;}
float flUnion(Fl P){return min(min(min(P.body,P.neck),min(P.head,P.bill)),min(min(min(P.ln1,P.ln2),min(P.lf1,P.lf2)),min(P.feet,P.wo)));}
// One flamingo at c (its feet), size s, facing dir; refl: drawn as its reflection in the water (faded, tinted, rippled).
void flamingo(vec2 q,vec2 c,float s,float dir,float ph,float walk,float hd,float dip,float wing,float tuck,float bl,float refl,float t){
 vec2 f=(q-c)/s;f.x/=sdir(dir);
 if(refl>0.){f.y=-f.y;f.x+=.012*sin(f.y*40.+t*2.2)*(1.+f.y*.5);if(f.y<-.05||f.y>1.25||abs(f.x)>.7)return;}else if(f.y<-.08||f.y>1.3||abs(f.x)>.75)return;
 Fl P=flParts(f,ph,walk,hd,dip,wing,tuck);float px=PX/s;
 vec3 pink=vec3(1.,.63,.67),coral=vec3(.96,.30,.38),blk=vec3(.06,.05,.07),leg=vec3(.96,.50,.56),billC=vec3(1.,.84,.84);
 if(refl>0.){float d=flUnion(P);float a=ss(px,-px,d)*.38*ss(.0,.05,f.y);if(a<=0.)return;
  vec3 col=mix(pink,coral,ss(px,-px,P.wo)*.6);col=mix(col,blk,ss(px,-px,min(P.prim,P.tip))*.7);
  solid(litFlat(col,.6)*vec3(.80,.85,1.0),a);return;}
 // under the water the legs (and a head that feeds) are seen faintly
 AL=1.-.65*ss(WL+.004,WL-.012,q.y);
 // the wings open, behind the body: black flight feathers, coral coverts (the thin paper glows when the sun is low)
 if(wing>.01){solid(litFlat(blk,.4),ss(px,-px,P.wo));CUT(max(P.wo,-P.wop)*s,coral*(1.+.25*GLOW),f*2.,.9,.008);}
 // the far leg (darker: in the shadow of the body)
 solid(litFlat(leg*.72,.3),ss(px,-px,min(P.lf1,P.lf2)));
 // the near leg, its pinned joint at the hip
 CUT(min(P.ln1,P.ln2)*s,leg,f,.3,.004);
 solid(litFlat(leg*.9,.3),ss(px,-px,P.feet));
 // the body and the neck (one piece of pale pink card), the folded wing on it
 float bn=min(P.body,P.neck);under(min(P.body,P.neck)*s+.004,.01);
 CUT(min(bn,P.head)*s,pink,f*1.3,.5,.012);
 if(wing<.5){CUT(P.cov*s,coral,f*1.5,.6,.008);solid(litFlat(blk,.2),ss(px,-px,P.prim));}
 // the bill: pale pink with a black tip
 CUT(P.bill*s,billC,f*3.,.3,.004);solid(litFlat(blk,.2),ss(px,-px,P.tip));
 eye(f,P.eyeC,.0085,bl);
 // the wings open: coral, black edge (backlit at dawn: the thin paper glows)
 AL=1.;brad(q,c+vec2(-.01*dir,.56)*s,.0045);
}
// The lake at the plane of the flamingos: bands of blue paper with the colour of the dawn sky, slow ripples, glints of the low sun.
void lake(vec2 q,float t){if(uDecor>1.5)return;float d=torn(q.y-WL-.004*sin(q.x*9.+t*.7),q*2.,.003,25.);float c=cov(d);if(c<=0.)return;
 float dep=sat((WL-q.y)/.26);vec3 col=mix(SKYM,SKYT,.38+.25*dep)*.84;col=mix(col,vec3(.20,.55,.58)*(.55+.45*DAY),.35*DAY);
 float band=floor((WL-q.y)/.055+.3*sin(q.x*3.));col*=1.-.035*mod(band,2.);
 float rip=sin((q.y*140.+sin(q.x*7.+t*.5)*1.5)+t*.6);col+=SUNC*.05*pow(max(0.,rip),12.)*ss(.6,-.2,q.x);col+=mix(SKYH,vec3(1.),.3)*.10*ss(.012,.0,WL-q.y);
 solid(decCol(col*(1.+fibre(q)*.25)),c);}
// Rings of ripples where a bill touches the water (age a seconds, at x).
void ripples(vec2 q,float x,float a){if(a<0.||a>3.)return;vec2 l=(q-vec2(x,WL-.012))/vec2(1.,.22);float r=length(l),R=.02+a*.06;
 float k=ss(.006,.0,abs(r-R))+ss(.006,.0,abs(r-R*.6))*.6;glow(mix(SKYH,vec3(1.),.4)*k*.22*(1.-a/3.)*step(q.y,WL));}
void scene(vec2 q,float t){
 lake(q,t);
 // where each flamingo is, and what it does
 float stopT=3.4,walkU=ss(.0,.4,t)*ss(stopT,stopT-.5,t),xs=-.20+.058*min(t,stopT);
 float turn=ss(3.6,4.0,t)-ss(4.5,4.9,t);float hd=1.-2.*turn;
 float k=0.;
 for(int pass=0;pass<3;pass++){
  for(int j=0;j<6;j++){int i=j<3?5-2*j:4-2*(j-3);float fi=float(i);float back=mod(fi,2.);
   vec2 c=vec2(xs+(fi-2.5)*.205+.03*sin(fi*2.7),WL+back*.028-(1.-back)*.006+.008*h11(fi));
   float s=.34*(1.-.07*back)*(.97+.05*h11(fi+3.));
   float ph=t*TAU*.9+fi*1.3;
   float dip=(i==2?ss(5.5,6.3,t)*ss(8.3,7.6,t):i==5?ss(5.9,6.7,t)*ss(8.6,7.9,t):0.);
   float wing=i==3?ss(8.6,9.3,t)*ss(10.6,10.0,t):0.;
   float tuck=i==0?ss(10.8,11.6,t):0.;
   float hdi=mix(hd,1.,dip);
   float bl=blinkAt(t,fi*.17);
   if(pass==0){flamingo(q,c,s,1.,ph,walkU,hdi,dip,wing,tuck,bl,1.,t);if(i==2||i==5)ripples(q,c.x+.33*s,t-(i==2?6.3:6.7));}
   else if(pass==1){vec2 f=(q-SHD*.05-c)/s;if(f.y>-.1&&f.y<1.3&&abs(f.x)<.8){Fl P=flParts(f,ph,walkU,hdi,dip,wing,tuck);dropShadow(flUnion(P)*s,.05,.55);}}
   else flamingo(q,c,s,1.,ph,walkU,hdi,dip,wing,tuck,bl,0.,t);
  }
 }
}

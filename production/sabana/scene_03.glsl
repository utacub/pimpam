// 4 · Les girafes de l'acàcia. Mid-morning by a flat-topped umbrella thorn acacia. A Masai giraffe (cream card with jagged chestnut
// patches cut into it) stretches its neck into the crown; its long dark tongue curls round a thorny twig and pulls it in (the key
// moment, ≈ 3.3–5.6 s), and it chews. Its calf walks up to it from the left (≈ 1–6 s). Two red-billed oxpeckers hop up and down its
// neck (≈ 6–9.5 s). At the end the giraffe lowers its head, turns it and looks at us (≈ 9.6–11 s).
// The jagged patches of a Masai giraffe: cells of a Voronoi pattern with ragged borders; returns 1 inside a patchC.
float patches(vec2 u,float sc,float gap){u*=sc;u+=.18*vec2(vn(u*3.1),vn(u*3.1+7.))-.09;vec2 i=floor(u),f=fract(u);float d1=9.,d2=9.;
 for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y),o=h22(i+g)*.8+.1;float d=length(g+o-f);if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}
 return ss(gap,gap+.06,d2-d1+.10*(vn(u*9.)-.5));}
struct Gi{float legs,legsF,body,neck,head,muz,oss,tuft,ear,tail,tailT,mane,tongue;vec2 H,E;float ha,front;};
// The parts of a giraffe in its own frame f (feet at y = 0, facing +x). ph: walking phase (walk: how much); reach 0–1: the neck up into
// the tree; low 0–1: the head lowered; turn 0–1: the head turned to us (side → front); tng: the tongue out (0–1) towards T (head frame);
// young: a calf (shorter neck, bigger head).
Gi giParts(vec2 f,float ph,float walk,float reach,float low,float turn,float tng,vec2 T,float young){Gi P;
 float lg=mix(1.,1.08,young);vec2 sF=vec2(.17,.48*lg),sB=vec2(-.15,.45*lg);
 // legs: near pair and far pair (stepping in opposite phases when walking)
 float a1=sin(ph)*walk,a2=sin(ph+PI)*walk;
 vec2 fF1=vec2(.18+.07*a1,.03*max(0.,cos(ph))*walk),fB1=vec2(-.14+.07*a2,.03*max(0.,cos(ph+PI))*walk);
 vec2 fF2=vec2(.15+.07*a2,.03*max(0.,cos(ph+PI))*walk),fB2=vec2(-.17+.07*a1,.03*max(0.,cos(ph))*walk);
 float l=.245*lg;
 vec2 kF1=knee(sF,fF1,l,l,1.),kB1=knee(sB,fB1,l*.95,l*.95,-1.),kF2=knee(sF-vec2(.03,0.),fF2,l,l,1.),kB2=knee(sB-vec2(.03,0.),fB2,l*.95,l*.95,-1.);
 P.legs=min(min(sdCap(f,sF,kF1,.040,.024),sdCap(f,kF1,fF1+vec2(0.,.01),.024,.020)),min(sdCap(f,sB,kB1,.050,.024),sdCap(f,kB1,fB1+vec2(0.,.01),.024,.020)));
 P.legsF=min(min(sdCap(f,sF-vec2(.03,0.),kF2,.038,.023),sdCap(f,kF2,fF2+vec2(0.,.01),.023,.019)),min(sdCap(f,sB-vec2(.03,0.),kB2,.048,.023),sdCap(f,kB2,fB2+vec2(0.,.01),.023,.019)));
 // body: sloping back, chest and rump
 vec2 bc=vec2(.0,.53*lg);vec2 bq=rot(-.18)*(f-bc);P.body=smin(smin(sdEll(bq,vec2(.22,.10)),length(f-vec2(.16,.55*lg))-.10,.06),length(f-vec2(-.17,.49*lg))-.09,.06);
 // the neck: from the shoulders up to the head
 float nl=mix(1.,.62,young);vec2 B=vec2(.18,.61*lg);
 vec2 Hr=B+nl*vec2(.20,.40),Hu=B+nl*vec2(.27,.47),Hl=B+nl*vec2(.24,.12);
 vec2 H=mix(mix(Hr,Hu,reach),Hl,low);vec2 C=mix(B+nl*vec2(.05,.25),B+nl*vec2(.13,.30),max(reach,low*.5));
 float nk=9.;vec2 pr=B;for(int i=1;i<=6;i++){float u=float(i)/6.;vec2 pt=mix(mix(B,C,u),mix(C,H,u),u);nk=min(nk,sdCap(f,pr,pt,mix(.075,.036,(u-.17)),mix(.075,.036,u)));pr=pt;}
 P.neck=nk;
 // the mane: a dark crest along the back of the neck
 vec2 nd=normalize(H-B),pp=vec2(-nd.y,nd.x);P.mane=max(max(max(nk-.011,-nk-.003),-dot(f-B,pp)),max(-dot(f-B,nd)+.03,dot(f-H,nd)+.05));
 // the head, seen from the side (the face turned towards +x, tilted by ha) or, when turned, from the front
 float hs=mix(1.,1.25,young);P.H=H;P.ha=mix(mix(-.35,.45,reach),-.15,low);P.front=turn;
 float sx=turn<.5?1.-2.*turn:2.*turn-1.;sx=max(sx,.12);vec2 hq=rot(-P.ha)*(f-H)/hs;hq.x/=sx;
 if(turn<.5){P.head=smin(length(hq)-.050,sdEll(hq-vec2(.085,-.022),vec2(.062,.036)),.03);P.muz=max(sdEll(hq-vec2(.115,-.028),vec2(.040,.030)),P.head+.002);
  P.oss=min(sdCap(hq,vec2(-.015,.035),vec2(-.035,.105),.011,.009),sdCap(hq,vec2(.0,.035),vec2(-.012,.10),.010,.008));P.tuft=min(length(hq-vec2(-.036,.108))-.016,length(hq-vec2(-.013,.103))-.014);
  P.ear=sdEll(rot(-.5)*(hq-vec2(-.055,.035)),vec2(.050,.016));P.E=H+rot(P.ha)*vec2(.012*sx,.016)*hs;
  P.tongue=tng>.01?sdCap(hq,vec2(.15,-.04),mix(vec2(.15,-.04),T,tng),.012,.008):9.;}
 else{vec2 fq=hq;P.head=sdEll(fq-vec2(0.,-.01),vec2(.052,.085));P.muz=max(sdEll(fq-vec2(0.,-.065),vec2(.044,.038)),P.head+.002);
  P.oss=min(sdCap(fq,vec2(-.022,.06),vec2(-.032,.13),.010,.008),sdCap(fq,vec2(.022,.06),vec2(.032,.13),.010,.008));P.tuft=min(length(fq-vec2(-.033,.133))-.015,length(fq-vec2(.033,.133))-.015);
  P.ear=min(sdEll(rot(.25)*(fq-vec2(-.075,.045)),vec2(.045,.016)),sdEll(rot(-.25)*(fq-vec2(.075,.045)),vec2(.045,.016)));P.E=H;P.tongue=9.;}
 P.head*=hs*sx;P.muz*=hs*sx;P.oss*=hs*sx;P.tuft*=hs*sx;P.ear*=hs*sx;P.tongue*=hs*sx;
 // the tail with its dark tuft
 vec2 ta=vec2(-.25,.53*lg),tb=vec2(-.29+.02*sin(ph*.5),.30*lg);P.tail=sdCap(f,ta,tb,.008,.006);P.tailT=sdEll(f-tb-vec2(0.,-.02),vec2(.014,.035));
 return P;}
float giUnion(Gi P){return min(min(min(P.legs,P.legsF),min(P.body,P.neck)),min(min(P.head,P.ear),min(P.oss,P.tail)));}
void giraffe(vec2 q,vec2 c,float s,float ph,float walk,float reach,float low,float turn,float tng,vec2 T,float young,float bl,float t){
 vec2 f=(q-c)/s;if(f.y<-.05||f.y>1.35||f.x<-.45||f.x>.85)return;float px=PX/s;
 Gi P=giParts(f,ph,walk,reach,low,turn,tng,T,young);
 {vec2 fs=f-SHD*.06/s;Gi S=giParts(fs,ph,walk,reach,low,turn,tng,T,young);dropShadow(giUnion(S)*s,.06,.30);}
 vec3 cream=vec3(.86,.70,.44),patchC=vec3(.36,.18,.07),dark=vec3(.14,.08,.05);
 float pt=patches(f+vec2(young*3.),9.,.13);
 // the far legs (in shadow), the tail, the near legs
 solid(litFlat(mix(cream,patchC,pt*.8)*.62,.1),ss(px,-px,P.legsF));
 solid(litFlat(cream*.8,.1),ss(px,-px,P.tail));solid(litFlat(dark,.1),ss(px,-px,P.tailT));
 CUT(P.legs*s,mix(cream,patchC,patches(f,11.,.14)*ss(.10,.32,f.y)),f,.1,.002);
 // body and neck: one piece of cream card with chestnut patches, the dark mane
 under(min(P.body,P.neck)*s+.004,.012);
 float bn=min(P.body,P.neck);CUT(bn*s,mix(cream,patchC,pt),f*1.2,.2,.016);
 solid(litFlat(dark*1.6,.1),ss(px,-px,P.mane));
 // the head
 under(P.head*s,.01);solid(litFlat(cream*.85,.1),ss(px,-px,P.ear));
 CUT(min(P.oss,P.head)*s,mix(cream,patchC,patches(f,16.,.16)*.7*ss(.0,.02,-P.muz)),f*2.,.2,.008);
 solid(litFlat(dark,.1),ss(px,-px,P.tuft));
 CUT(P.muz*s,cream*1.05,f*3.,.2,.006);
 if(P.tongue<1.)solid(litFlat(vec3(.20,.12,.30),.3),ss(px,-px,P.tongue));
 float hs=mix(1.,1.25,young);
 if(turn<.5){float sx=max(1.-2.*turn,.12);eye(f,P.E,.015*hs,bl);vec2 hq=rot(-P.ha)*(f-P.H)/hs;hq.x/=sx;
  solid(litFlat(dark,.1),ss(px,-px,sdSeg(hq,vec2(.016,.030),vec2(.034,.040))*hs*sx-.002));solid(litFlat(dark,.1),cov((length(hq-vec2(.135,-.010))-.006)*hs*sx*s));}
 else{float sx=max(2.*turn-1.,.12);vec2 fq=rot(-P.ha)*(f-P.H)/hs;fq.x/=sx;
  eye(f,P.H+rot(P.ha)*vec2(-.036*sx,.012)*hs,.015*hs,bl);eye(f,P.H+rot(P.ha)*vec2(.036*sx,.012)*hs,.015*hs,bl);
  solid(litFlat(dark,.1),cov((min(length(fq-vec2(-.016,-.075)),length(fq-vec2(.016,-.075)))-.006)*hs*sx*s));
  solid(litFlat(dark*1.5,.1),ss(px,-px,(abs(length((fq-vec2(0.,-.07))*vec2(1.,1.6))-.028)-.003)*hs*sx+step(-.085,-fq.y)*0.+max(0.,fq.y+.07)*2.));}
 brad(q,c+vec2(.20,.48*mix(1.,1.08,young))*s,.005);brad(q,c+vec2(-.18,.45*mix(1.,1.08,young))*s,.005);}
// The acacia: a forked grey trunk, a flat crown of three tiers of tiny leaflets, white thorns on the twigs. Decor.
float crownD(vec2 u){float d=sdEll(u-vec2(.46,.27),vec2(.42,.06));d=smin(d,sdEll(u-vec2(.36,.33),vec2(.28,.045)),.05);d=smin(d,sdEll(u-vec2(.64,.20),vec2(.24,.045)),.05);
 return d+.018*(vn(u*vec2(22.,30.))-.5)+.008*(vn(u*70.)-.5);}
float trunkD(vec2 u){float d=sdCap(u,vec2(.47,G0-.02),vec2(.45,.04),.040,.028);d=min(d,sdCap(u,vec2(.45,.04),vec2(.22,.28),.026,.014));d=min(d,sdCap(u,vec2(.45,.04),vec2(.66,.25),.024,.013));
 d=min(d,sdCap(u,vec2(.45,.10),vec2(.47,.30),.018,.010));return d;}
void acacia(vec2 q,float t,vec2 tw){if(uDecor>1.5)return;
 vec2 u=atS(.06);vec2 us=u-SHD*.04;float ds=min(crownD(us),trunkD(us));shade(ss(PX*2.+.01,-PX,ds)*.20*(uDecor>.5?uOpacity:1.),vec3(.50,.52,.76));
 float dt=trunkD(u);float c=cov(dt);if(c>0.){vec3 col=litFlat(vec3(.12,.10,.09),.1)*(1.+fibre(u*2.)*.4);col=mix(col,col*1.35,ss(-.03,.03,-u.x+.46+.0)*.5);solid(decCol(col),c);}
 float dc=crownD(u);c=cov(dc);
 float top=ss(-.035,.01,u.y-.30-.06*(1.-sat(abs(u.x-.42)/.45)))*ss(.0,-.03,dc);
 vec3 col=mix(vec3(.12,.17,.05),vec3(.26,.34,.09),top);col*=1.+.25*(vn(u*vec2(90.,120.))-.5);
 col=litFlat(col,.5)*(1.+fibre(u*2.)*.3);col=mix(col,col*1.3,ss(-PX*3.,-PX*.3,dc)*.5);if(c>0.)solid(decCol(col),c);
 // the twig that the giraffe pulls: from the crown down to its tip tw
 vec2 a=vec2(tw.x+.06,.24);float tg=sdCap(u,a,tw,.008,.005);float lf=9.;for(int i=0;i<7;i++){float fi=float(i)/6.;vec2 p=mix(a,tw,fi);lf=min(lf,sdEll(rot(.6*sin(fi*7.))*(u-p-vec2(0.,-.012)),vec2(.020,.010)));}
 float th=9.;for(int i=0;i<6;i++){float fi=(float(i)+.5)/6.;vec2 p=mix(a,tw,fi);vec2 n=normalize(vec2(-(tw-a).y,(tw-a).x))*(mod(float(i),2.)*2.-1.);th=min(th,sdCap(u,p,p+n*.025,.003,.0005));}
 solid(decCol(litFlat(vec3(.90,.88,.82),.2)),cov(th));solid(decCol(litFlat(vec3(.22,.18,.15),.1)),cov(tg));
 solid(decCol(litFlat(vec3(.18,.26,.07),.5)),cov(lf));}
// A red-billed oxpecker: a small brown bird with a red bill and a yellow ring round its eye.
void oxpecker(vec2 q,vec2 c,float s,float dir,float hop,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(length(f)>1.6)return;float px=PX/s;
 f.y-=hop;float body=sdEll(rot(.4)*(f-vec2(0.,.0)),vec2(.38,.22)),head=length(f-vec2(.30,.20))-.17,tail=sdCap(f,vec2(-.25,-.10),vec2(-.62,-.30),.10,.05);
 solid(litFlat(vec3(.30,.20,.12),.2),ss(px,-px,min(min(body,head),tail)));solid(litFlat(vec3(.65,.55,.40),.2),ss(px,-px,max(body+.06,-f.y-.05)));
 solid(litFlat(vec3(.90,.10,.06),.2),ss(px,-px,sdCap(f,vec2(.42,.20),vec2(.62,.16),.06,.03)));
 solid(vec3(.95,.80,.20),cov((length(f-vec2(.34,.24))-.075)*s));eye(f*s,vec2(.34,.24)*s,.045*s,bl);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.16,G0+.05,.04,g*.95,3.);
 // the tongue: out (3.3–4.1 s), round the twig (–4.6), pulling (–5.4), back in (–5.9)
 float out_=ss(3.3,4.0,t)*ss(5.9,5.4,t),pull=ss(4.5,5.3,t)*ss(5.9,5.5,t);
 float reach=ss(.8,2.4,t)*ss(9.4,8.6,t),low=ss(9.0,10.2,t),turn=ss(9.8,10.8,t);
 vec2 mc=vec2(-.12,G0+.01);float s=.70;
 // where the head and the mouth are (as in giParts), and the tip of the twig: just beyond the mouth at full reach, pulled to it
 vec2 B=vec2(.18,.61);vec2 H=mix(mix(B+vec2(.20,.40),B+vec2(.27,.47),reach),B+vec2(.24,.12),low);float ha=mix(mix(-.35,.45,reach),-.15,low);
 vec2 Hs=mc+H*s,mouth=Hs+rot(ha)*vec2(.15,-.04)*s;
 vec2 H1=mc+(B+vec2(.27,.47))*s,m1=H1+rot(.45)*vec2(.15,-.04)*s;vec2 TW0=m1+rot(.45)*vec2(.10,-.05)*s;
 vec2 tw=mix(TW0,mouth+rot(ha)*vec2(.02,.0)*s,pull);
 acacia(q,t,tw);
 vec2 T=rot(-ha)*(tw-Hs)/s;
 giraffe(q,mc,s,0.,0.,reach,low,turn,out_,T,0.,blinkAt(t,.1)*(1.-out_),t);
 // the oxpeckers hop along the neck
 for(int i=0;i<2;i++){float fi=float(i);float u=fract(.2+fi*.37+.18*floor((t-5.8+fi*.4)/.7))*.65+.15;float vis=ss(5.6,6.2,t)*ss(9.0,8.6,t);if(vis<.01)continue;
  vec2 p=mix(mc+B*s,Hs,u)+vec2(-.030,.026);
  float hop=.6*abs(sin(PI*fract((t-5.8+fi*.4)/.7)));AL=vis;oxpecker(q,p,.026,mod(floor((t+fi)/2.1),2.)*2.-1.,hop,blinkAt(t,fi*.3));AL=1.;}
 // the calf walks up to its mother from the left, in front of her
 float cw=ss(1.,5.8,t);vec2 cc=vec2(-.80+.36*cw,G0-.012);
 giraffe(q,cc,.40,t*TAU*.55,ss(.8,1.4,t)*ss(6.,5.4,t),.25*ss(6.,7.,t),0.,0.,0.,vec2(0.),1.,blinkAt(t,.4),t);
 floorStrip(-.10,G0-.04,.05,g*.82,6.);
}

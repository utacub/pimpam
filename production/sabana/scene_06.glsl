// 7 · Els impales. A wide view of the plain with a round bush in the middle. A few impalas graze at the back. One impala comes
// bounding from the left and leaps very high over the bush, legs folded under it (the key moment, ≈ 3.3–4.3 s); three more follow, one
// after another, each leaping over the same bush (≈ 4.6–8.3 s), and run off to the right. The grazing ones lift their heads to watch.
// Impalas: reddish-brown back, tan flanks, white belly, black stripes on the rump and the tail; the males with lyre-shaped horns.
struct Im{float legsN,legsF,hoof,body,neck,head,ear,horn,tail;vec2 H,E;float ha;};
Im imParts(vec2 f,float ph,float run,float leap,float graze,float male){Im P;
 vec2 sF=vec2(.17,.47),sB=vec2(-.17,.49);
 float a=sin(ph),b=sin(ph+PI*.35);
 // running: a bounding gallop; leaping: forelegs folded under, hind legs stretched back
 vec2 f1=vec2(.18+.12*a*run,.06*max(0.,cos(ph))*run),f2=vec2(.14+.12*b*run,.06*max(0.,cos(ph+PI*.35))*run);
 vec2 h1=vec2(-.16-.12*a*run,.06*max(0.,-cos(ph))*run),h2=vec2(-.20-.12*b*run,.06*max(0.,-cos(ph+PI*.35))*run);
 f1=mix(f1,vec2(.26,.30),leap);f2=mix(f2,vec2(.22,.27),leap);h1=mix(h1,vec2(-.48,.30),leap);h2=mix(h2,vec2(-.46,.25),leap);
 float l=.24;
 vec2 k1=knee(sF,f1,l,l,mix(1.,-1.,leap)),k2=knee(sF-vec2(.03,0.),f2,l,l,mix(1.,-1.,leap)),k3=knee(sB,h1,l,l,-1.),k4=knee(sB-vec2(.03,0.),h2,l,l,-1.);
 P.legsN=min(min(sdCap(f,sF,k1,.036,.018),sdCap(f,k1,f1+vec2(0.,.01),.018,.014)),min(sdCap(f,sB,k3,.055,.020),sdCap(f,k3,h1+vec2(0.,.01),.020,.014)));
 P.legsF=min(min(sdCap(f,sF-vec2(.03,0.),k2,.034,.017),sdCap(f,k2,f2+vec2(0.,.01),.017,.013)),min(sdCap(f,sB-vec2(.03,0.),k4,.052,.019),sdCap(f,k4,h2+vec2(0.,.01),.019,.013)));
 P.hoof=min(min(length(f-f1)-.016,length(f-h1)-.016),min(length(f-f2)-.015,length(f-h2)-.015));
 P.body=smin(smin(sdEll(f-vec2(0.,.53),vec2(.24,.10)),length(f-vec2(.15,.53))-.095,.05),length(f-vec2(-.17,.55))-.10,.05);
 vec2 B=vec2(.17,.59),H=mix(mix(B+vec2(.13,.19),B+vec2(.22,.10),run*.6+leap*.4),B+vec2(.20,-.45),graze),C=mix(B+vec2(.06,.12),B+vec2(.18,0.),graze);
 float nk=9.;vec2 pr=B;for(int i=1;i<=4;i++){float u=float(i)/4.;vec2 pt=mix(mix(B,C,u),mix(C,H,u),u);nk=min(nk,sdCap(f,pr,pt,mix(.060,.034,u-.25),mix(.060,.034,u)));pr=pt;}P.neck=nk;
 P.H=H;P.ha=mix(mix(-.62,-.30,max(run,leap)),-1.40,graze);vec2 hq=rot(P.ha)*(f-H);
 P.head=smin(length(hq)-.042,sdEll(hq-vec2(.075,-.008),vec2(.065,.030)),.025);
 P.ear=sdEll(rot(-.9)*(hq-vec2(-.035,.03))-vec2(0.,.0),vec2(.022,.055));
 float hn=9.;if(male>.5){for(int k=0;k<2;k++){float fk=float(k);vec2 o=vec2(-.015-.012*fk,.035);vec2 p1=o+vec2(-.06,.07),p2=o+vec2(-.13,.12),p3=o+vec2(-.12,.19);
  hn=min(hn,min(min(sdCap(hq,o,p1,.010,.008),sdCap(hq,p1,p2,.008,.006)),sdCap(hq,p2,p3,.006,.003)));}}P.horn=hn;
 P.E=H+rot(-P.ha)*vec2(.018,.014);
 P.tail=sdCap(f,vec2(-.26,.60),vec2(-.29,.48),.020,.014);return P;}
float imUnion(Im P){return min(min(min(P.legsN,P.legsF),min(P.body,P.neck)),min(min(P.head,P.ear),P.tail));}
void impala(vec2 q,vec2 c,float s,float dir,float ph,float run,float leap,float pitch,float graze,float male,float bl,float shadow){
 vec2 f=(q-c)/s;f.x/=sdir(dir);f=rot(-pitch)*(f-vec2(0.,.5))+vec2(0.,.5);if(f.y<-.05||f.y>1.1||f.x<-.65||f.x>.7)return;float px=PX/s;
 Im P=imParts(f,ph,run,leap,graze,male);
 if(shadow>0.){vec2 fs=f-SHD*.05/s*vec2(dir,1.);Im S=imParts(fs,ph,run,leap,graze,male);dropShadow(imUnion(S)*s,.05,.30*shadow);}
 vec3 red=vec3(.40,.18,.07),tan_=vec3(.60,.37,.17),white=vec3(.86,.83,.76),blk=vec3(.05,.04,.04);
 vec3 alb=mix(white,mix(tan_,red,ss(.515,.535,f.y)),ss(.465,.48,f.y));
 solid(litFlat(tan_*.65,.1),ss(px,-px,P.legsF));
 CUT(P.legsN*s,mix(tan_,white,ss(.12,.04,f.y)*.5),f,.1,.003);solid(litFlat(blk,.1),ss(px,-px,P.hoof));
 solid(litFlat(white,.1),ss(px,-px,P.tail));solid(litFlat(blk,.1),ss(px,-px,max(P.tail,abs(f.x+.275)-.006)));
 under(min(P.body,P.neck)*s+.004,.01);
 CUT(min(P.body,P.neck)*s,alb,f*1.3,.15,.012);
 solid(litFlat(blk,.1),ss(px,-px,max(P.body,abs(f.x+.235+.015*(f.y-.55))-.007)+max(0.,.48-f.y)));
 solid(litFlat(tan_,.3),ss(px,-px,P.ear));solid(litFlat(blk,.1),ss(px,-px,max(P.ear,length(f-P.H-rot(-P.ha)*vec2(-.065,.075))-.022)));
 vec2 hq=rot(P.ha)*(f-P.H);CUT(P.head*s,mix(red,white,ss(.0,-.02,hq.y+.01)*ss(.02,.06,hq.x)*.6),f*2.,.15,.006);
 solid(litFlat(blk*2.,.1),ss(px,-px,P.horn));
 solid(litFlat(blk,.1),cov((length((hq-vec2(.135,-.005))*vec2(1.,1.5))-.010)*s));eye(f,P.E,.013,bl);}
// The bush that the impalas leap over: a round mass of small leaves of dark green card. Decor.
float bushD(vec2 u){vec2 l=u-vec2(.0,G0);float d=sdEll(l-vec2(0.,.06),vec2(.17,.10));d=smin(d,sdEll(l-vec2(-.10,.04),vec2(.10,.07)),.04);d=smin(d,sdEll(l-vec2(.11,.035),vec2(.09,.06)),.04);d=max(d,-l.y);
 return d+.010*(vn(u*vec2(40.,50.))-.5)+.006*(vn(u*120.)-.5);}
void bush(vec2 q){if(uDecor>1.5)return;vec2 u=atS(.02);dropShadow(bushD(u-SHD*.03),.03,.3*(uDecor>.5?uOpacity:1.));float d=bushD(u);float c=cov(d);if(c<=0.)return;
 vec3 col=mix(vec3(.10,.15,.05),vec3(.24,.32,.09),ss(G0+.04,G0+.16,u.y));col*=1.+.3*(vn(u*vec2(90.,110.))-.5);col=litFlat(col,.4)*(1.+fibre(u*2.)*.3);
 col=mix(col,col*1.3,ss(-PX*3.,-PX*.3,d)*.5);solid(decCol(col),c);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.20,G0+.06,.04,g*.95,6.);
 float watch=ss(3.2,3.7,t)*ss(9.,8.,t);
 impala(q,vec2(-.62,G0+.06),.27,1.,0.,0.,0.,0.,mix(.9,0.,watch),0.,blinkAt(t,.1),0.);
 impala(q,vec2(.50,G0+.07),.26,-1.,0.,0.,0.,0.,mix(.85,0.,watch*ss(3.5,4.,t)),1.,blinkAt(t,.5),0.);
 impala(q,vec2(.76,G0+.05),.28,-1.,0.,0.,0.,0.,mix(.9,0.,watch*ss(3.8,4.3,t)),0.,blinkAt(t,.3),0.);
 bush(q);
 // the jumpers: each runs in from the left, leaps over the bush (starting at x −.27), lands and runs off to the right
 for(int i=0;i<4;i++){float fi=float(i);float tL=3.3+fi*1.25,v=.62,dur=mix(1.0,.8,sat(fi/3.)),H=mix(.30,.17,sat(fi/3.));
  float x=-.27+v*(t-tL);if(x<-1.2||x>1.2)continue;float u=sat((t-tL)/dur),in_=step(0.,t-tL)*step(t-tL,dur);
  float y=G0+H*sin(PI*u)*in_+.02*abs(sin((t-tL)*TAU*1.4))*(1.-in_);float pitch=.30*cos(PI*u)*in_;
  impala(q,vec2(x,y),.30,1.,(t-tL)*TAU*1.4,1.-in_,in_*ss(0.,.15,u)*ss(1.,.85,u),pitch,0.,mod(fi,2.)<.5?1.:0.,0.,1.);}
 floorStrip(-.10,G0-.06,.05,g*.82,10.);
}

// 5 · Els elefants a la bassa. A waterhole of brown water on the plain in the morning sun. On the bank the mother drinks: her trunk
// goes down to the water and back up to her mouth (≈ 1–3.4 s). The calf stands in the water; it splashes with its trunk, then lifts it
// over its head and sprays its back: an arc of drops shines in the sun (the key moment, ≈ 3.6–5.4 s). The mother reaches out and
// touches the calf with her trunk (≈ 6.2–8 s). The big ears of thin grey paper fan slowly; against the light their veins show.
struct El{float body,head,ear,earV,legsN,legsF,trunk,tusk,tail,tuft,nails;vec2 E,tip;float tu;};
// The parts of an elephant in its own frame f (feet at y = 0, facing +x). B..T: the trunk, a curve from its base through C to its tip
// T; ear: fanning (0 against the head, 1 out); young: a calf (no tusks, rounder).
El elParts(vec2 f,vec2 C,vec2 T,float ear,float young,float ph){El P;
 vec2 hip=vec2(-.26,.46),sh=vec2(.18,.48);float sw=.04*sin(ph);
 P.legsN=min(sdCap(f,sh,vec2(.20+sw,.05),.115,.090),sdCap(f,hip,vec2(-.25-sw,.05),.12,.09));
 P.legsF=min(sdCap(f,sh-vec2(.08,0.),vec2(.12-sw,.06),.105,.085),sdCap(f,hip-vec2(.08,0.),vec2(-.33+sw,.06),.11,.085));
 P.nails=9.;for(int i=0;i<2;i++){float fi=float(i);vec2 a=vec2(.20+sw+(fi-.5)*.06,.025),b=vec2(-.25-sw+(fi-.5)*.06,.025);P.nails=min(P.nails,min(sdEll(f-a,vec2(.016,.010)),sdEll(f-b,vec2(.016,.010))));}
 float back=.80-.03*ss(.25,.0,abs(f.x+.05))*(1.-young);
 P.body=smin(smin(sdEll(f-vec2(.06,.54),vec2(.30,.27)),sdEll(f-vec2(-.24,.50),vec2(.23,.22)),.10),sdEll(f-vec2(-.06,.40),vec2(.30,.14)),.08);
 P.body=smax(P.body,-(length(f-vec2(-.06,1.02))-.22),.06)*(1.-young)+P.body*young;
 float hr=mix(.17,.19,young);vec2 hc=vec2(.43,.64+.02*young);P.head=smin(length(f-hc)-hr,sdEll(f-hc-vec2(.08,-.10),vec2(.10,.09)),.06);
 // the ear: a big leaf of thin card hinged at its front edge, fanning out (seen narrower as it turns towards us)
 vec2 hg=hc+vec2(-.05,.10);vec2 e=rot(.25*ear)*(f-hg);e.x/=1.-.35*ear;
 float es=mix(1.,.85,young);P.ear=(sdEll(e-vec2(-.16,-.14)*es,vec2(.19,.23)*es)+.012*sin(atan(e.y+.14,e.x+.16)*5.))*(1.-.35*ear);
 P.earV=abs(sin(e.x*30.+e.y*12.+sin(e.y*20.)))-.15;
 // the trunk
 vec2 B=hc+vec2(.13,-.06);float tk=9.;vec2 pr=B;for(int i=1;i<=8;i++){float u=float(i)/8.;vec2 pt=mix(mix(B,C,u),mix(C,T,u),u);tk=min(tk,sdCap(f,pr,pt,mix(.085,.034,u-.125)*mix(1.,.8,young),mix(.085,.034,u)*mix(1.,.8,young)));pr=pt;}
 P.trunk=tk;P.tip=T;
 P.tusk=young>.5?9.:sdCap(f,hc+vec2(.12,-.12),hc+vec2(.24,-.17)+vec2(.02,.03)*sin(1.),.026,.010);
 P.tail=sdCap(f,vec2(-.45,.62),vec2(-.52+.02*sin(ph*.7),.36),.012,.008);P.tuft=sdEll(f-vec2(-.52+.02*sin(ph*.7),.33),vec2(.018,.035));
 P.E=hc+vec2(.05,.04);return P;}
float elUnion(El P){return min(min(min(P.body,P.head),min(P.ear,P.legsN)),min(min(P.legsF,P.trunk),P.tail));}
void elephant(vec2 q,vec2 c,float s,float dir,vec2 C,vec2 T,float ear,float young,float ph,float bl,float wet,float t){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.05||f.y>1.15||f.x<-.65||f.x>1.15)return;float px=PX/s;
 El P=elParts(f,C,T,ear,young,ph);
 {vec2 fs=f-SHD*.05/s*vec2(dir,1.);El S=elParts(fs,C,T,ear,young,ph);dropShadow(elUnion(S)*s,.05,.35);}
 vec3 grey=mix(vec3(.17,.16,.17),vec3(.21,.19,.20),young),dark=vec3(.06,.05,.05);
 float wr=.035*sin(f.y*90.+sin(f.x*14.)*2.)*ss(.0,.5,f.y);
 solid(litFlat(grey*.62,.1),ss(px,-px,P.legsF));
 CUT(P.legsN*s,grey*(1.+wr*.5),f,.1,.01);solid(litFlat(vec3(.50,.46,.40),.1),ss(px,-px,P.nails));
 solid(litFlat(grey*.8,.1),ss(px,-px,P.tail));solid(litFlat(dark,.1),ss(px,-px,P.tuft));
 under(P.body*s,.012);
 vec3 bc=grey*(1.+wr)*(1.-.35*wet*ss(.55,.75,f.y));CUT(min(P.body,P.head)*s,bc,f*1.2,.1,.02);
 // the ear over the shoulder: thin card; against a low sun it glows warm and its veins show
 under(P.ear*s,.012);float bk=max(0.,-SUN.z)+.25*GLOW;
 CUT(P.ear*s,grey*1.1*(1.+.5*bk*vec3(1.2,.8,.7)),f*1.5,.9,.012);
 solid(litFlat(grey*.75,.4),ss(px,-px,max(P.ear+.012,P.earV))*.35);
 // the tusk, the trunk with its rings, the eye
 CUT(P.tusk*s,vec3(.92,.88,.76),f*3.,.2,.004);
 under(P.trunk*s,.008);CUT(P.trunk*s,grey*(1.+.10*sin(dot(f-P.tip,normalize(P.tip-vec2(.5,.5)))*95.)),f*1.4,.1,.012);
 eye(f,P.E,.020,bl);solid(litFlat(dark,.1),ss(px,-px,sdSeg(f,P.E+vec2(-.025,.03),P.E+vec2(.02,.035))-.003)*(1.-bl));}
// The waterhole: brown water at the plane of the calf, its ragged edge, rings where a trunk touches it.
const float WH=-.012;
void pool(vec2 q,float t,float front,vec2 r1,float a1,vec2 r2,float a2){if(uDecor>1.5)return;float top=G0+WH+.004*sin(q.x*8.+t*.6);
 float edge=sdEll(q-vec2(-.36,G0+WH-.06),vec2(.60,.17))+.02*(vn(q*vec2(8.,20.))-.5);float d=max(q.y-top,edge);d=torn(d,q*2.,.003,25.);float c=cov(d);if(c<=0.)return;
 vec3 col=mix(mix(SKYM,SKYT,.3)*.70,vec3(.34,.24,.13),.66);col*=1.-.15*ss(0.,.2,top-q.y);
 float rip=sin(q.y*160.+sin(q.x*6.+t*.5)*1.5+t*.6);col+=SUNC*.06*pow(max(0.,rip),12.);col+=SKYH*.12*ss(.010,.0,top-q.y);
 for(int i=0;i<2;i++){vec2 rc=i==0?r1:r2;float ra=i==0?a1:a2;if(ra<0.||ra>2.5)continue;vec2 l=(q-rc)/vec2(1.,.25);float R=.015+ra*.07;col+=SKYH*.18*(1.-ra/2.5)*(ss(.006,.0,abs(length(l)-R))+.6*ss(.006,.0,abs(length(l)-R*.6)));}
 solid(decCol(col*(1.+fibre(q)*.25)),c*front);}
// The spray of the calf: drops thrown from the trunk tip up and backwards, falling on its back, shining in the sun.
void spray(vec2 q,vec2 tip,float dir,float t,float t0,float t1){if(t<t0||t>t1+1.4)return;
 for(int i=0;i<72;i++){float fi=float(i),te=t0+(t1-t0)*fi/72.,a=t-te;if(a<0.||a>1.1)continue;
  float ang=1.95+.55*(h11(fi)-.5);vec2 v=vec2(cos(ang)*dir,sin(ang))*(.36+.22*h11(fi+5.));vec2 p=tip+v*a+vec2(0.,-.75)*a*a;
  float r=.008+.006*h11(fi+9.);float d=length(q-p)-r;if(d>.02)continue;
  vec3 dc=mix(SKYH,vec3(1.),.5)*.95+SUNC*.30;solid(dc,cov(d)*.9*ss(1.1,.8,a));solid(vec3(1.),cov(length(q-p-vec2(-.3,.3)*r)-r*.35)*ss(1.1,.8,a));glow(SUNC*.10*exp(-length(q-p)/.016)*ss(1.1,.7,a));}}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);vec3 mud=vec3(.36,.22,.13);
 floorStrip(.12,G0+.05,.035,g*.95,4.);
 floorStrip(.05,G0+.02,.012,mud,7.);
 // the mother on the bank (right, facing left): drinking, then reaching to touch the calf
 vec2 mc=vec2(.36,G0+.005);float ms=.58;
 float down=ss(1.0,1.6,t)*ss(2.8,2.3,t),up=ss(2.5,3.3,t)*ss(4.6,3.9,t),touch=ss(6.1,6.9,t)*ss(8.2,7.5,t);
 vec2 Tm=vec2(.62,.24),Cm=vec2(.60,.40);
 Tm=mix(Tm,vec2(.70,(G0+WH-mc.y)/ms+.01),down);Cm=mix(Cm,vec2(.66,.30),down);
 Tm=mix(Tm,vec2(.50,.42),up);Cm=mix(Cm,vec2(.76,.30),up);
 vec2 calfHead=vec2(-.26+.43*.30,G0-.035+.70*.30);vec2 tc=vec2((calfHead.x-mc.x)*-1.,calfHead.y-mc.y)/ms+vec2(.0,.06);
 Tm=mix(Tm,tc,touch);Cm=mix(Cm,vec2(.85,.55),touch);
 Tm+=vec2(.01,.015)*sin(t*1.3);
 // the calf in the water (left, facing right): splashing, then spraying its back
 float dip=ss(1.2,1.6,t)*ss(2.0,1.8,t)+ss(2.2,2.5,t)*ss(2.9,2.7,t);float lift=ss(3.4,4.0,t)*ss(5.5,5.0,t);
 vec2 Tc=vec2(.62,.20),Cc=vec2(.62,.40);Tc=mix(Tc,vec2(.66,(G0+WH-(G0-.035))/.30-.02),dip);
 Tc=mix(Tc,vec2(.20,1.10),lift);Cc=mix(Cc,vec2(.85,.95),lift);Tc+=vec2(.02,.0)*sin(t*1.7);
 float mEar=.5+.5*sin(t*2.1),cEar=.5+.5*sin(t*2.6+1.)+.4*lift;
 vec2 cc=vec2(-.26,G0-.035);float cs=.30;
 elephant(q,cc,cs,1.,Cc,Tc,min(cEar,1.),1.,0.,blinkAt(t,.5),ss(4.3,5.3,t),t);
 // the water in front of the calf's legs; rings where the trunks touch it
 vec2 tipC=cc+vec2(Tc.x,Tc.y)*cs,tipM=mc+vec2(-Tm.x,Tm.y)*ms;
 pool(q,t,1.,vec2(tipM.x,G0+WH),t-1.6,vec2(tipC.x,G0+WH),t-1.6);
 spray(q,tipC,1.,t,3.85,5.1);
 elephant(q,mc,ms,-1.,Cm,Tm,mEar,0.,0.,blinkAt(t,.2),0.,t);
 floorStrip(-.10,G0-.15,.04,g*.82,8.);
}

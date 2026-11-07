// 3 · Les grues coronades. On the grassy bank of the lake in the early morning, two grey crowned cranes face each other. One steps
// closer; the other bobs its head. Then the first one jumps with its wings wide open, white, gold and black (the key moment, ≈ 3.3–4.7
// s), and lands; both bow to each other (≈ 5.5–7.2 s); the second one hops with a half-open beat of its wings (≈ 8–9.3 s). Their crowns
// of stiff golden feathers sway. Bowing and jumping with open wings are part of the dance of crowned cranes (sources in CANVIS);
// they do not toss grass here.
struct Cr{float body,neck,head,bill,ln,lf,feet,wing,wingW,wingG,plume,cheek,red,wat;vec2 H;float ha;};
// The parts of a crane in its own frame f (feet at y = 0 when standing, facing +x). step_: the near leg forward; bob: the head down;
// bow: neck and body bowing forward; jmp: height of a jump; wg: wings open (0–1), crouch: knees bent before a jump.
Cr crParts(vec2 f,float step_,float bob,float bow,float jmp,float wg,float crouch){Cr P;
 vec2 hip=vec2(0.,.48-.08*crouch+jmp);
 vec2 fN=vec2(.06*step_,.03*sin(step_*PI))+vec2(0.,jmp*.92),fF=vec2(-.03,jmp*.88);
 if(jmp>.01){fN+=vec2(-.04,.04)*ss(.0,.06,jmp);fF+=vec2(-.06,.05)*ss(.0,.06,jmp);}
 vec2 kN=knee(hip,fN,.25,.25,-1.),kF=knee(hip,fF,.25,.25,-1.);
 P.ln=min(sdCap(f,hip,kN,.020,.013),sdCap(f,kN,fN+vec2(0.,.008),.013,.011));
 P.lf=min(sdCap(f,hip+vec2(.02,0.),kF,.019,.012),sdCap(f,kF,fF+vec2(0.,.008),.012,.010));
 P.feet=min(sdEll(f-fN-vec2(.03,.006),vec2(.045,.009)),sdEll(f-fF-vec2(.03,.006),vec2(.045,.009)));
 float tilt=-.12-.35*bow;vec2 bc=vec2(-.02,.58-.08*crouch+jmp);vec2 bq=rot(-tilt)*(f-bc);
 P.body=min(sdEll(bq,vec2(.20,.12)),sdEll(bq-vec2(-.17,-.05),vec2(.08,.05)));
 // the folded wing: a white panel, golden plumes hanging at the back
 P.wingW=max(sdEll(bq-vec2(.0,.02),vec2(.14,.065)),P.body+.006);
 float pl=9.;for(int i=0;i<6;i++){float fi=float(i);vec2 a=vec2(-.06+fi*.012,-.01),b=vec2(-.25-fi*.012,-.09-fi*.022);pl=min(pl,sdCap(bq,a,b,.013,.004)+.004*sin(segU(bq,a,b)*9.+fi));}P.plume=pl;
 // the neck and the head: upright, down when it bobs or bows
 vec2 B=bc+rot(tilt)*vec2(.15,.06);vec2 H=mix(vec2(.17,.97),vec2(.40,.66),max(bow,bob*.7))+vec2(0.,jmp-.08*crouch);vec2 C=mix(vec2(.09,.82),vec2(.33,.88),max(bow,bob*.7))+vec2(0.,jmp);
 float nk=9.;vec2 pr=B;for(int i=1;i<=6;i++){float u=float(i)/6.;vec2 pt=mix(mix(B,C,u),mix(C,H,u),u);nk=min(nk,sdCap(f,pr,pt,mix(.040,.026,u-.17),mix(.040,.026,u)));pr=pt;}P.neck=nk;
 P.H=H;P.ha=-.9*max(bow,bob*.7);vec2 hq=rot(-P.ha)*(f-H);
 P.head=sdEll(hq,vec2(.050,.043));P.bill=sdCap(hq,vec2(.04,-.006),vec2(.105,-.020),.015,.005);
 P.cheek=sdEll(hq-vec2(-.006,-.004),vec2(.028,.022));P.red=sdEll(hq-vec2(-.004,.020),vec2(.016,.007));P.wat=sdEll(hq-vec2(.030,-.050),vec2(.012,.020));
 // the wings open: white coverts, golden secondaries, black primaries; the near one raised more than the far one
 P.wing=9.;P.wingW=wg>.01?9.:P.wingW;P.wingG=9.;
 if(wg>.01){vec2 sh=bc+vec2(.03,.07);float wW=9.,wG=9.,wA=9.;
  for(int k=0;k<2;k++){float fk=float(k),a=mix(-.4,1.20+.50*fk,wg);vec2 w=rot(a)*(f-sh-vec2(-.03*fk,.0));
   float tr=.016*abs(sin(w.x*40.))*ss(.12,.35,w.x)*step(w.y,0.);float d=sdEll(w-vec2(.33,.0),vec2(.36,.12))+tr;
   wA=min(wA,d);wG=min(wG,max(d+.003,w.x-.48+.3*w.y));wW=min(wW,max(d+.006,max(w.x-.33,-w.y-.025)));}
  P.wing=wA;P.wingG=wG;P.wingW=min(P.wingW,wW);}
 return P;}
float crUnion(Cr P){return min(min(min(P.body,P.neck),min(P.head,P.bill)),min(min(P.ln,P.lf),min(P.feet,P.wing)));}
void crane(vec2 q,vec2 c,float s,float dir,float step_,float bob,float bow,float jmp,float wg,float crouch,float bl,float t,float seed){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.08||f.y>1.55||abs(f.x)>.85)return;float px=PX/s;
 Cr P=crParts(f,step_,bob,bow,jmp,wg,crouch);
 vec3 grey=vec3(.15,.155,.19),dark=vec3(.08,.08,.10),white=vec3(.96,.95,.92),gold=vec3(.58,.36,.14),straw=vec3(.92,.74,.36),red=vec3(.85,.12,.12);
 // its shadow on the bank behind
 {vec2 fs=f-SHD*.05/s*vec2(dir,1.);Cr S=crParts(fs,step_,bob,bow,jmp,wg,crouch);dropShadow(crUnion(S)*s,.05,.5);}
 // the far leg, the wings when open (black, gold, white), the near leg
 solid(litFlat(dark*1.3,.1),ss(px,-px,P.lf));
 if(wg>.01){solid(litFlat(dark,.3),ss(px,-px,P.wing));CUT(P.wingG*s,gold,f*2.,.7,.006);CUT(P.wingW*s,white,f*2.,.6,.008);}
 CUT(P.ln*s,dark*1.5,f,.1,.003);solid(litFlat(dark,.1),ss(px,-px,P.feet));
 // the body and the neck: slate grey card; the white wing panel and the golden plumes over it
 under(min(P.body,P.neck)*s+.004,.01);
 CUT(P.body*s,grey,f*1.4,.2,.012);CUT(min(P.neck,P.head)*s,grey*1.6,f*1.4,.2,.008);
 if(wg<=.01){CUT(P.wingW*s,white,f*2.,.4,.008);}
 CUT(P.plume*s,gold,f*3.,.5,.004);
 // the face: black velvet, a white cheek with a red top, the red wattle, the grey bill, a pale eye
 vec2 hq=rot(-P.ha)*(f-P.H);
 solid(litFlat(dark,.1),ss(px,-px,max(P.head,-hq.y+.0-hq.x*.6)));
 CUT(P.cheek*s,white,f*4.,.3,.004);CUT(P.red*s,red,f*4.,.4,.003);CUT(P.wat*s,red,f*4.,.4,.003);
 CUT(P.bill*s,dark*2.2,f*3.,.1,.003);
 vec2 ec=P.H+rot(P.ha)*vec2(.012,.004);solid(vec3(.80,.86,.95),cov((length(f-ec)-.011)*s));eye(f,ec,.0075,bl);
 // the crown: a spray of stiff golden feathers, each one swaying a little
 vec2 cb=P.H+rot(P.ha)*vec2(-.012,.034);float cr=9.;
 for(int i=0;i<13;i++){float fi=float(i),a=P.ha+1.15+fi*.12+.06*sin(t*2.4+fi*.9+seed),L=.10+.035*sin(fi*2.1+seed);vec2 e=cb+vec2(cos(a),sin(a))*L;cr=min(cr,sdCap(f,cb,e,.006,.0035));}
 solid(litFlat(straw,.8)*(1.+.3*GLOW),ss(px,-px,cr));solid(litFlat(dark*1.5,.2),ss(px,-px,max(cr,.088-length(f-cb))));
 brad(q,c+vec2(0.,(.48-.08*crouch+jmp))*s*vec2(1.,1.),.0045);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 // the bank: a strip of grass behind the cranes and one in front of their feet
 floorStrip(.10,G0+.035,.04,g*.95,2.);
 // the cranes: A on the left facing right, B on the right facing left
 float stepA=ss(.6,1.6,t);float xA=-.26+.05*stepA,xB=.22;
 float jmp=.17*sin(PI*sat((t-3.45)/.85));float crouch=ss(3.05,3.4,t)*ss(3.6,3.45,t)+ss(4.25,4.4,t)*ss(4.75,4.5,t)*.7;
 float wgA=ss(3.35,3.75,t)*ss(4.9,4.4,t);
 float bow=ss(5.5,6.1,t)*ss(7.2,6.6,t);
 float bobB=ss(1.6,2.0,t)*ss(2.6,2.2,t);
 float jB=.07*sin(PI*sat((t-8.2)/.6));float wgB=.55*ss(8.,8.3,t)*ss(9.3,8.8,t);float crB=ss(7.9,8.15,t)*ss(8.35,8.2,t)*.6;
 float s=.44;
 crane(q,vec2(xB,G0+.012),s*.97,-1.,0.,bobB,bow,jB,wgB,crB,blinkAt(t,.3),t,3.);
 crane(q,vec2(xA,G0+.006),s,1.,stepA,0.,bow,max(0.,jmp),wgA,crouch,blinkAt(t,.71),t,7.);
 floorStrip(-.10,G0-.055,.05,g*.82,5.);
}

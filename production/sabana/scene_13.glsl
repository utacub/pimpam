// 14 · Les mangostes i els càlaus. On top of an old termite mound, the home of a family of dwarf mongooses. One stands upright on the
// top as a sentinel; the others forage over the slopes and peep from the holes. Two yellow-billed hornbills on a thorn bush beside it
// look for the insects that the mongooses stir up. The key moment (≈ 4.4–5 s): the shadow of a bird of prey slides over the mound; the
// sentinel calls and all the mongooses dive into the holes at once. Then, one by one, the heads come out again (≈ 6.4–8.6 s), and the
// family goes back to foraging. Dwarf mongooses and hornbills foraging together and warning each other: Rasa (1983) (CANVIS). The bird
// of prey is only a shadow.
const vec2 TOP=vec2(.02,-.06);
float mound14(vec2 u){float h=sat((TOP.y-u.y)/.62);float w=.06+.62*pow(h,.75)+.012*sin(u.y*40.);float d=abs(u.x-TOP.x-.02*sin(u.y*5.))-w;d=max(d,u.y-TOP.y);
 d=min(d,max(abs(u.x+.33)-.05*sat((-.25-u.y)/.10+.2),u.y+.25));d=min(d,max(abs(u.x-.36)-.045*sat((-.30-u.y)/.10+.2),u.y+.30));return d+.004*(vn(u*30.)-.5);}
// the holes: where they are on the mound (centres)
vec2 holeP(int i){return i==0?vec2(.02,-.065):i==1?vec2(-.20,-.25):i==2?vec2(.23,-.24):i==3?vec2(-.36,-.42):vec2(.40,-.43);}
// A dwarf mongoose: slender, brown-grey, short legs, pointed snout, small round ears, long tapering tail. up: upright (the sentinel);
// ph/walk: the legs; look: head turn; sniff: snout down.
void mongoose(vec2 q,vec2 c,float s,float dir,float up,float ph,float walk,float look,float sniff,float bl,float clipY){
 vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f-vec2(0.,.4),f-vec2(0.,.4))>1.)return;float px=PX/s;float al0=AL;AL*=ss(clipY-.003,clipY+.003,q.y);if(AL<=0.){AL=al0;return;}
 vec3 fur=vec3(.20,.15,.11),dark=vec3(.10,.075,.055);
 // the body axis: horizontal (on all fours) to upright
 float ba=mix(.05,1.45,up);vec2 a=vec2(cos(ba),sin(ba)),n=vec2(-a.y,a.x);vec2 C=mix(vec2(0.,.16),vec2(-.02,.30),up);
 vec2 bq=vec2(dot(f-C,a),dot(f-C,n));float body=sdEll(bq,vec2(.26,.105));
 vec2 H=C+a*.30+n*mix(.02,-.01,up)+vec2(0.,-.06*sniff);float head=sdEll(rot(mix(-.15,-.6,sniff)+look*.0)*(f-H),vec2(.085,.060));
 vec2 sn=H+vec2(cos(-.35-.5*sniff),sin(-.35-.5*sniff))*.09;float snout=sdCap(f,H,sn,.045,.016);
 float ear=length(f-H-vec2(-.035,.055))-.022;
 vec2 T0=C-a*.25,T1=T0+mix(vec2(-.30,-.02),vec2(-.20,-.20),up)+vec2(0.,.03*sin(ph*.5));float tail=sdCap(f,T0,T1,.040,.010);
 float lg=9.;if(up<.5){float aa=sin(ph)*walk,bb=sin(ph+PI)*walk;lg=min(min(sdCap(f,C+a*.15-n*.05,vec2(.15+.04*aa,0.),.040,.026),sdCap(f,C-a*.15-n*.05,vec2(-.15+.04*bb,0.),.046,.026)),9.);}
 else{lg=min(sdCap(f,vec2(-.04,.12),vec2(.02,0.),.05,.03),sdCap(f,C+a*.18+n*.05,C+a*.12+n*.14+vec2(0.,-.03),.025,.018));}
 dropShadow(min(min(body,head),tail)*s,.02,.25);
 solid(litFlat(fur*.7,.2),ss(px,-px,lg));
 CUT(tail*s,fur*.95,f*2.,.2,.004);
 CUT(body*s,fur*(1.+.12*sin(bq.x*60.)*ss(.0,.05,bq.y)),f*2.,.2,.008);
 solid(litFlat(fur,.2),ss(px,-px,ear));
 CUT(min(head,snout)*s,fur*1.1,f*2.,.2,.006);solid(litFlat(dark,.1),ss(px,-px,length(f-sn)-.016));
 eye(f,H+vec2(.02,.012),.017,bl);
 AL=al0;}
// A yellow-billed hornbill: black and white spotted wings, white below, a big curved yellow bill, long tail.
void hornbill(vec2 q,vec2 c,float s,float dir,float hop,float peck,float crouch,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f,f)>1.2)return;float px=PX/s;
 vec3 blk=vec3(.04,.04,.045),wht=vec3(.80,.79,.76),yel=vec3(.72,.50,.04);
 f.y-=hop;vec2 C=vec2(0.,.30-.05*crouch);float body=sdEll(rot(.45-.2*crouch)*(f-C),vec2(.24,.13));
 float tail=sdCap(f,C+vec2(-.16,-.06),C+vec2(-.50,-.30+.1*crouch),.06,.07);
 vec2 H=C+vec2(.16,.17-.08*crouch)+vec2(.04,-.10)*peck;float head=length(f-H)-.085;
 float an=-.35-.6*peck;vec2 bd=vec2(cos(an),sin(an));vec2 bt=H+bd*.30+vec2(0.,-.03);
 float bill=sdCap(f,H+bd*.04,bt,.065,.012)+.02*ss(.0,.3,length(f-H));bill=min(bill,sdCap(f,H+bd*.05,mix(H,bt,.55),.075,.035));
 float legs=min(sdSeg(f,C+vec2(.02,-.10),vec2(.04,-.02)),sdSeg(f,C+vec2(-.04,-.10),vec2(-.03,-.02)))-.018;
 solid(litFlat(blk*1.5,.2),ss(px,-px,legs));
 vec2 sg=f*vec2(26.,22.);vec2 id=floor(sg),fr=fract(sg)-.5;
 CUT(tail*s,mix(blk,wht,ss(.25,.15,length(fr))*step(.5,h21(id))),f*3.,.2,.006);
 vec3 bc=mix(wht,mix(blk,wht*.9,ss(.25,.15,length(fr))*step(.45,h21(id+2.))),ss(-.02,.03,dot(f-C,vec2(-.4,.9))));
 CUT(body*s,bc,f*3.,.2,.010);
 CUT(head*s,mix(wht,blk,ss(.0,.04,f.y-H.y)*ss(-.02,.04,H.x-f.x)),f*3.,.2,.008);
 CUT(bill*s,yel,f*3.,.2,.008);
 eye(f,H+vec2(.02,.025),.020,bl);}
// The thorn bush where the hornbills sit: a few dark branches with tufts of small leaves.
void thornBush(vec2 q,float t){if(uDecor>1.5)return;float d=9.;
 d=min(d,sdCap(q,vec2(.72,-.60),vec2(.70,-.20),.018,.012));d=min(d,sdCap(q,vec2(.70,-.20),vec2(.55,-.10),.012,.008));d=min(d,sdCap(q,vec2(.70,-.22),vec2(.86,-.08),.012,.008));
 d=min(d,sdCap(q,vec2(.70,-.32),vec2(.95,-.30),.010,.006));
 dropShadow(d,.02,.25*(uDecor>.5?uOpacity:1.));solid(decCol(litFlat(vec3(.16,.11,.08),.1)*(1.+fibre(q*2.)*.4)),cov(d)*DEC());
 float lv=9.;for(int i=0;i<9;i++){float fi=float(i);vec2 p=vec2(.55+.05*fi,-.10+.025*sin(fi*2.3))+vec2(0.,-.03*step(4.,fi));lv=min(lv,sdEll(q-p,vec2(.045,.022))+.006*vn(q*80.));}
 solid(decCol(litFlat(vec3(.16,.22,.07),.4)*(1.+fibre(q)*.3)),cov(lv)*DEC());}
void scene(vec2 q,float t){
 thornBush(q,t);
 // the mound: old weathered clay, with its holes
 float mo=mound14(q);dropShadow(mound14(q-SHD*.03),.03,.32*(uDecor>.5?uOpacity:1.));
 if(uDecor<1.5&&cov(mo)>0.){vec3 cl=mix(vec3(.30,.16,.08),vec3(.36,.20,.10),ss(-.6,TOP.y,q.y))*(1.+.10*sin(q.y*80.+vn(q*12.)*5.))*(1.+fibre(q*1.3)*.45);
  vec3 col=litFlat(cl,.1)*1.15;col=mix(col,col*1.35+SUNC*.04,ss(-PX*3.,-PX*.3,mo)*.5);solid(decCol(col),cov(mo)*DEC());}
 for(int i=0;i<5;i++){vec2 hp=holeP(i);float hd=sdEll(q-hp,vec2(.050,.030));solid(decCol(vec3(.04,.025,.015)),cov(hd)*DEC());}
 // who is where: the sentinel on the top; foragers on the slopes; peepers in the holes
 float hide=ss(4.5,4.75,t);float back0=ss(6.4,6.8,t),back1=ss(6.9,7.3,t),back2=ss(7.5,7.9,t),back3=ss(8.0,8.4,t),back4=ss(8.4,8.9,t);
 // in each hole a mongoose that ducks down (the clip line is the bottom lip of the hole)
 for(int i=0;i<5;i++){vec2 hp=holeP(i);float b=i==0?back3:i==1?back0:i==2?back1:i==3?back2:back4;float out_=(1.-hide)+hide*b;
  float dir=hp.x<0.?1.:-1.;
  if(i==0){// the sentinel: upright on the top; down the hole when the shadow comes; up again
   float up=ss(8.6,9.0,t)+(1.-hide);up=min(up,1.);float rise=mix(-.20,0.,out_);
   mongoose(q,hp+vec2(0.,rise*.9-.01),.22,dir*(fract(t*.25)<.5?1.:-1.),up,0.,0.,0.,0.,blinkAt(t,.1),hp.y-.012);}
  else{float rise=mix(-.20,-.04,out_)+.012*sin(t*1.3+float(i));
   mongoose(q,hp+vec2(0.,rise-.03),.17,dir,.92,0.,0.,0.,0.,blinkAt(t,float(i)*.21),hp.y-.008);}}
 // two foragers on the slopes: they walk and sniff, then run to the nearest hole
 for(int i=0;i<2;i++){float fi=float(i);vec2 hp=holeP(i+1);float sx=i==0?-1.:1.;float wx=hp.x+sx*(.10+.05*sin(t*.5+fi));float k=ss(4.45,4.7,t)*ss(6.6,6.0,t);
  float xx=mix(wx,hp.x,k);float yy=-.06-.62*pow(sat((abs(xx-TOP.x)-.06)/.62),1./.75)+.0;yy=max(yy,-.6);
  float vis=1.-ss(4.62,4.72,t)*ss(9.2,8.8,t);if(vis<.5){xx=hp.x;}
  if(vis>.5)mongoose(q,vec2(xx,yy),.17,-sx*(k>0.?-1.:1.),0.,t*TAU*(k>0.?3.:1.),k>0.?1.:.4,0.,.6*ss(.4,1.,sin(t*2.+fi)),blinkAt(t,fi*.4),-9.);}
 // the hornbills: on the bush; they hop and look; they crouch while the shadow passes
 float cr=ss(4.4,4.6,t)*ss(6.,5.4,t);
 hornbill(q,vec2(.56,-.10),.16,-1.,.03*max(0.,sin(t*1.6)),ss(.6,1.,sin(t*.9))*(1.-cr),cr,blinkAt(t,.5));
 hornbill(q,vec2(.86,-.08),.15,-1.,.02*max(0.,sin(t*1.3+2.)),ss(.7,1.,sin(t*.7+1.))*(1.-cr),cr,blinkAt(t,.8));
 // the shadow of the bird of prey: the silhouette of a gliding eagle, wings spread, soft-edged, sliding over from left to right
 float sx=mix(-1.7,1.7,sat((t-4.25)/1.35));if(abs(sx)<1.6){vec2 l=(q-vec2(sx,-.24+.03*sin(sx*2.)))/.85;
  float ax=abs(l.x);float wy=.045*sin(min(ax/.48,1.)*PI*1.2)-.02*ax;float wing=max(abs(l.y-wy)-mix(.050,.020,sat(ax/.48)),ax-.48);
  vec2 tip=vec2(ax,l.y)-vec2(.46,wy);float fing=9.;for(int k=0;k<4;k++){float fk=float(k);fing=min(fing,sdCap(tip,vec2(-.04,.02-fk*.014),vec2(.03,.03-fk*.022),.008,.004));}
  float body=sdEll(l-vec2(0.,-.01),vec2(.040,.11));float head=length(l-vec2(0.,.10))-.030;float tail=max(sdEll(l-vec2(0.,-.14),vec2(.06,.06)),l.y+.10);
  float w=min(min(min(wing,fing),body),min(head,tail))*.80;shade(ss(.016,-.016,w)*.62,vec3(.36,.34,.50));}
}

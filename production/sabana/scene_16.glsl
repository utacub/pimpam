// 17 · Els lleons a la posta. The sun sets behind a kopje of round granite boulders. On the highest boulder lies the lion, his big mane
// lit from behind; he gives a long yawn (≈ 3.8–5.2 s, the key moment) and then a soft roar, chin up (≈ 6.4–8 s). On a lower rock the
// lioness lies and swishes her tail; two cubs bat and jump at the black tuft of its tip. Lions resting on kopjes at sunset, yawning,
// roaring: field guides (CANVIS).
// A lion lying like a sphinx; mane: 1 male, 0 lioness; yawn/roar: the mouth open (roar with the chin up); tw: the tail swish.
void lion(vec2 q,vec2 c,float s,float dir,float mane,float yawn,float roar,float tw,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(f.y<-.9||f.y>.8||f.x<-.95||f.x>.75)return;float px=PX/s;
 vec3 fur=mix(vec3(.55,.38,.18),vec3(.58,.40,.19),mane),pale=vec3(.76,.62,.42),mn=vec3(.22,.12,.05),mnE=vec3(.46,.30,.12);
 float body=smin(sdEll(f-vec2(-.08,.15),vec2(.40,.14)),sdEll(f-vec2(.20,.18),vec2(.16,.15)),.08);float hind=sdEll(f-vec2(-.32,.13),vec2(.17,.13));
 float legs=min(sdCap(f,vec2(.24,.08),vec2(.52,.02),.06,.045),sdCap(f,vec2(.20,.06),vec2(.46,0.),.055,.042));
 float up=roar*.35;vec2 H=vec2(.40,.36)+vec2(0.,.02*roar);float phi=-.18+up;
 vec2 hq=rot(phi)*(f-H);
 float head=smin(sdEll(hq,vec2(.13,.115)),sdEll(hq-vec2(.12,-.04),vec2(.09,.075)),.05);
 float op=max(yawn,roar*.75);float jawA=.55*op;vec2 J=vec2(.03,-.05);vec2 jq=rot(-jawA)*(hq-J)+J;
 float jaw=sdEll(jq-vec2(.13,-.10),vec2(.10,.042));
 float mouth=op>.02?max(max(hq.y+.06,-(jq.y+.07)),max(length(hq-J)-.22,J.x-hq.x)):9.;
 float teeth=op>.02?min(sdCap(hq,vec2(.19,-.07),vec2(.20,-.11),.012,.004),sdCap(jq,vec2(.19,-.11),vec2(.20,-.07),.012,.004)):9.;
 float mna=9.;if(mane>.5){vec2 m=hq-vec2(-.03,.0);float an=atan(m.y,m.x);mna=length(m*vec2(1.,.92))-(.25+.030*sin(an*11.)+.018*sin(an*23.));mna=min(mna,sdEll(f-vec2(.24,.20),vec2(.17,.21))+.018*sin(f.y*70.));}
 float ears=min(length(hq-vec2(-.04,.11))-.035,length(hq-vec2(.04,.115))-.03);
 // the tail: from the rump over the rock edge, swishing; a black tuft at the tip
 vec2 ta=vec2(-.46,.16);vec2 pr=ta;float tl=9.;vec2 tip=ta;for(int i=1;i<=8;i++){float u=float(i)/8.;vec2 p=ta+vec2(-.22*u,-.48*u*u)+vec2(.10*sin(u*2.+tw)*u,.05*sin(tw*1.3)*u*u);tl=min(tl,sdCap(f,pr,p,.026,.024));pr=p;tip=p;}
 float tuft=sdEll(f-tip-vec2(0.,-.03),vec2(.035,.055));
 dropShadow(min(min(body,legs),min(head,tl))*s,.03,.30);
 solid(litFlat(fur*.75,.3),ss(px,-px,hind));CUT(tl*s,fur*.95,f*2.,.3,.005);solid(litFlat(mn*.6,.2),ss(px,-px,tuft));
 CUT(legs*s,fur,f*2.,.3,.006);
 CUT(body*s,mix(fur,pale,ss(.10,.03,f.y)),f*2.,.3,.014);
 if(mane>.5){vec3 mc=mn*(1.+.10*(vn(hq*vec2(30.,30.))-.5));CUT(mna*s,mc,f*2.,.6,.016);
  float mi=mna+.045+.012*sin(atan(hq.y,hq.x)*13.);CUT(mi*s,mnE*(1.+.10*(vn(hq*40.)-.5)),f*2.,.6,.010);}
 solid(litFlat(fur,.3),ss(px,-px,ears));
 if(op>.02){solid(litFlat(mix(vec3(.50,.18,.18),vec3(.15,.04,.05),ss(.20,.05,length(hq-J))),.2),ss(px,-px,mouth));}
 CUT(jaw*s,pale,f*2.,.3,.006);
 CUT(head*s,mix(fur*1.05,pale,ss(.05,.14,hq.x)*.6),f*2.,.3,.010);
 solid(litFlat(vec3(.90,.86,.76),.3),ss(px,-px,teeth));
 vec2 hn=hq-vec2(.205,-.025);solid(litFlat(vec3(.20,.09,.07),.2),ss(px,-px,sdEll(hn,vec2(.022,.018))));
 vec2 E=H+rot(-phi)*vec2(.07,.035);eye(f,E,.016,max(bl,yawn*.85));}
// A lion cub: tawny, faint spots, round ears; it bats with a paw raised and jumps.
void lcub(vec2 q,vec2 c,float s,float dir,float jump,float bat,float bl){vec2 f=(q-c)/s;f.x/=sdir(dir);if(dot(f-vec2(0.,.3),f-vec2(0.,.3))>.8)return;float px=PX/s;
 vec3 fur=vec3(.55,.40,.22),pale=vec3(.74,.62,.45);f.y-=jump*.25;
 float body=sdEll(rot(-.4*bat)*(f-vec2(0.,.20)),vec2(.22,.11));vec2 H=vec2(.20,.30+.10*bat);float hd=length(f-H)-.11;float ears=min(length(f-H-vec2(-.05,.10))-.04,length(f-H-vec2(.05,.10))-.035);
 float legs=min(sdCap(f,vec2(.12,.16),mix(vec2(.15,0.),vec2(.32,.40),bat),.045,.035),sdCap(f,vec2(-.14,.14),vec2(-.15,0.),.05,.035));
 float tail=sdCap(f,vec2(-.20,.22),vec2(-.40,.30),.02,.02);
 dropShadow(min(body,hd)*s,.02,.25);
 solid(litFlat(fur*.8,.3),ss(px,-px,tail));CUT(legs*s,fur,f*2.,.3,.004);
 vec2 sg=f*18.;vec2 id=floor(sg),fr=fract(sg)-.5;float sp=ss(.25,.15,length(fr))*step(.6,h21(id))*.35;
 CUT(body*s,mix(fur,fur*.7,sp),f*2.,.3,.008);solid(litFlat(fur*.9,.3),ss(px,-px,ears));CUT(hd*s,mix(fur,pale,ss(.0,.08,f.x-H.x)*.5),f*2.,.3,.006);
 solid(litFlat(vec3(.2,.1,.08),.2),ss(px,-px,length(f-H-vec2(.10,-.01))-.016));eye(f,H+vec2(.05,.03),.020,bl);}
// The kopje: a few round granite boulders, each its own piece of card: lit on top, darker below, rimmed by the light of the setting sun.
vec4 rockK(int i){return i==0?vec4(.12,G0+.10,.34,.15):i==1?vec4(.30,G0+.33,.25,.17):i==2?vec4(-.34,G0+.07,.30,.10):i==3?vec4(.66,G0+.08,.18,.10):vec4(-.02,G0+.30,.10,.07);}
void kopje(vec2 q,float t){if(uDecor>1.5)return;
 for(int i=0;i<5;i++){vec4 r=rockK(i);vec2 l=q-r.xy;float d=sdEll(l,r.zw)+.004*(vn(q*30.+float(i))-.5);d=max(d,G0-.02-q.y);
  dropShadow(sdEll(l-SHD*.03,r.zw),.03,.30*(uDecor>.5?uOpacity:1.));float c=cov(d);if(c<=0.)continue;
  float v=sat(.5+.5*l.y/r.w);vec3 g=vec3(.29,.245,.205)*(1.+.14*(vn(q*vec2(14.,30.)+float(i)*3.)-.5))*(1.+.10*(vn(q*90.)-.5));
  vec3 col=litFlat(g,.2)*mix(.62,1.12,v)*(1.+fibre(q*1.5)*.4);
  col=mix(col,col*1.35+SUNC*.12*(.4+.6*v),ss(-PX*4.,-PX*.3,d)*.6);
  float sp=ss(.75,.9,vn(q*vec2(40.,25.)+float(i)*7.));col=mix(col,col*.75,sp*.5);
  solid(decCol(col),c*DEC());}}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.);
 floorStrip(.20,G0+.05,.05,g*.95,18.);
 kopje(q,t);
 float yawn=ss(3.8,4.3,t)*ss(5.2,4.8,t);float roar=ss(6.4,6.8,t)*ss(8.0,7.5,t);
 lion(q,vec2(.26,G0+.485),.40,1.,1.,yawn,roar,sin(t*.9),blinkAt(t,.4));
 // the lioness on the lower rock, her tail swishing; the cubs at its tuft
 float tw=1.2*sin(t*1.7)+.6*sin(t*2.9);
 lion(q,vec2(-.40,G0+.155),.32,-1.,0.,0.,0.,tw,blinkAt(t,.7));
 vec2 tipL=vec2(-.38,G0+.335)+vec2(.68,-.48)*.30;
 lcub(q,vec2(-.02+.03*sin(t*1.3),G0-.03),.27,-1.,max(0.,sin(t*2.2))*.6,ss(.3,.8,sin(t*3.1)),blinkAt(t,.2));
 lcub(q,vec2(-.36+.03*sin(t*1.1+1.),G0-.04),.26,1.,max(0.,sin(t*2.6+1.5))*.5,ss(.3,.8,sin(t*2.7+1.)),blinkAt(t,.6));
 floorStrip(-.10,G0-.07,.05,g*.82,19.);
}

// 19 · Els escarabats piloters. Night, at the height of the ground; the Milky Way shines over the plain. A dung beetle rolls its ball
// the way these beetles do: walking backwards, head down, the front legs on the ground and the middle and hind legs on the ball. It stops,
// turns round, climbs on top of the ball and turns slowly round on it, stopping to raise its head to the sky (the key moment, ≈ 4.5–6.6
// s): the "dance" with which it takes its bearings from the sky. Then it climbs down the other side and rolls the ball away in a straight
// line. At the start a second beetle, further back, rolls its own ball away the other way. Rolling with the hind legs, the dance on the
// ball and the straight path set by the Milky Way: Dacke et al. (2013), Baird et al. (2012) (CANVIS).
// The beetle. c: the centre of its body; s: its length; m: which way it faces (1 right, -1 left; in between it is turning round, the
// card seen nearly edge-on); pitch: the angle of the body (head up, positive); mode: 0 rolling (front legs on the ground, middle and hind
// legs on the ball), 1 standing on the ball, 2 standing on the ground; ph: its steps; look: the head raised; bc, br: the ball; gy: the
// ground.
vec2 btKnee(vec2 a,vec2 b,float l1,float l2,vec2 away){vec2 k1=knee(a,b,l1,l2,1.),k2=knee(a,b,l1,l2,-1.);return dot(k1-k2,away)>0.?k1:k2;}
void beetle(vec2 q,vec2 c,float s,float m,float pitch,float mode,float ph,float look,vec2 bc,float br,float gy,float bl){
 vec2 f=(q-c)/s;if(dot(f,f)>1.1)return;float sg=m<0.?-1.:1.,sx=max(abs(m),.18);f.x*=sg/sx;float px=PX/s/max(sx,.45);
 vec2 lb=(bc-c)/s;lb.x*=sg;float R=br/s,G=(gy-c.y)/s;
 vec3 blk=vec3(.005,.005,.008),moon=vec3(.34,.42,.66);
 // the body, in its own frame (x along it, head at +x): the domed wing cases with their grooves, the round shield behind the head, the
 // flat toothed head (a little raised when it looks up), the small fan of the antenna
 vec2 b=rot(pitch)*f;
 float ely=max(sdEll(b-vec2(-.13,.02),vec2(.31,.20)),-(b.y+.085));
 float pro=max(sdEll(b-vec2(.19,.0),vec2(.145,.135)),-(b.y+.085));
 vec2 hb=rot(-.35*look)*(b-vec2(.30,-.02))+vec2(.30,-.02);
 float hd=sdEll(hb-vec2(.39,-.035),vec2(.12,.050));hd+=.010*ss(.33,.47,hb.x)*abs(sin(atan(hb.y+.035,hb.x-.39)*9.));
 float ant=min(sdCap(hb,vec2(.36,.0),vec2(.42,.06),.009,.007),sdEll(rot(-.5)*(hb-vec2(.44,.075)),vec2(.024,.012)));
 // the legs: three on the far side (darker, behind the body) and three on the near side; each foot on the ground or on the ball
 float legF=9.,legN=9.,spk=9.;
 for(int sd=0;sd<2;sd++){float side=float(sd);
  for(int k=0;k<3;k++){float fk=float(k);
   vec2 hipB=k==0?vec2(.23,-.07):k==1?vec2(.05,-.08):vec2(-.11,-.08);hipB+=vec2(-.035,.012)*(1.-side);
   float l1=k==0?.19:k==1?.23:.26,l2=k==0?.22:k==1?.26:.31;
   vec2 hipU=rot(-pitch)*hipB,hipF=vec2(hipU.x*sx,hipU.y);
   float w=sin(ph+fk*2.1+side*PI),lift=max(0.,cos(ph+fk*2.1+side*PI));
   bool onBall=mode>.5&&mode<1.5||(mode<.5&&k>0);
   vec2 T;
   if(!onBall){float reach=k==0?.17:k==1?.0:-.16;T=vec2(hipF.x+reach+.05*w+(1.-side)*.03,G+.035*lift);}
   else{vec2 nom=k==0?vec2(.20,-.30):k==1?vec2(-.02,-.30):vec2(-.20,-.28);if(mode<.5)nom=k==1?vec2(-.26,-.12):vec2(-.34,.06);
    vec2 P0=hipF+rot(-pitch)*nom;vec2 nr=normalize(P0-lb);T=lb+nr*R+vec2(-nr.y,nr.x)*.05*w+nr*.03*lift;}
   vec2 Tu=vec2(T.x/sx,T.y);
   vec2 awayU=onBall?normalize(hipU-vec2(lb.x/sx,lb.y)):vec2(0.,1.);if(k==0&&!onBall)awayU=normalize(vec2(.4,1.));
   vec2 kn=btKnee(hipU,Tu,l1,l2,awayU);
   float d=min(sdCap(f,hipU,kn,.040,.030),sdCap(f,kn,Tu,.028,.012));
   // the front legs are broad and toothed, for digging
   if(k==0){vec2 e=Tu-kn;float el=length(e);vec2 en=e/max(el,1e-4),pp=vec2(-en.y,en.x);if(dot(pp,awayU)<0.)pp=-pp;
    for(int i=0;i<3;i++){float u=.35+.22*float(i);spk=min(spk,sdCap(f,kn+e*u,kn+e*u+pp*.045+en*.02,.014,.003));}}
   if(sd==0)legF=min(legF,d);else legN=min(legN,d);}}
 // with the decor dimmed or taken away, on the black card, a black beetle would vanish: a thin edge of moonlight all round it
 if(uDecor>.5&&uBase<.5){float sil=min(min(min(ely,pro),hd),min(min(legF,legN),min(spk,ant)));solid(moon*.42,ss(px,-px,sil-max(.03,px*3.)));}
 solid(blk*.8,ss(px,-px,legF));
 float body=min(min(ely,pro),hd);
 // black card with a cold sheen of moonlight along its back and the grooves of the wing cases
 float lv=length((b-vec2(-.13,.02))/vec2(.31,.20));
 vec3 col=blk+moon*.020*ss(.3,.9,sin(lv*28.))*ss(.0,.06,b.y+.04)*step(ely,0.);
 float rim=ss(-px*5.,-px*.5,body)*ss(-.04,.06,b.y);
 col+=moon*(.045*ss(.04,.18,b.y)*ss(-.30,-.05,b.x)*step(ely,0.)+.035*ss(.02,.12,b.y)*step(pro,0.)+.16*rim)*(.6+.4*NIGHT);
 col=mix(col,blk*.2,ss(px*1.5,0.,abs(pro-ely)-.004)*step(min(ely,pro),.008)*.8);
 solid(col,ss(px,-px,body));
 solid(blk+moon*.03,ss(px,-px,ant));
 solid(blk*1.6+moon*.012,ss(px,-px,min(legN,spk)));
 vec2 E=rot(-pitch)*(rot(.35*look)*(vec2(.355,.0)-vec2(.30,-.02))+vec2(.30,-.02));if(sx>.4)eye(f,E,.026,bl);}
vec3 moonCol(){return vec3(.30,.36,.58);}
// The dung ball: dark, rough, bits of straw in it and sticking out of it; it turns as it rolls (angle a).
void ball(vec2 q,vec2 c,float r,float a){vec2 d0=q-c;if(dot(d0,d0)>r*r*1.5)return;vec2 l=rot(a)*d0;float an=atan(l.y,l.x);
 vec2 nl=l/max(length(l),1e-5);float d=length(d0)-r-.007*(vn(nl*2.5+9.)-.5)-.003*(vn(nl*9.+3.)-.5);
 float st=9.;for(int i=0;i<3;i++){float fi=float(i),aa=fi*2.3+.4;vec2 o=vec2(cos(aa),sin(aa));st=min(st,sdCap(l,o*r*.88,o*r*1.07+vec2(-o.y,o.x)*r*.07*(fi-1.),.0022,.0012));}
 dropShadow(min(length(d0-SHD*.012)-r,9.),.012,.40);
 float cc=cov(min(d,st));if(cc<=0.)return;
 vec3 col=vec3(.066,.048,.030)*(1.+.35*(vn(l*90.)-.5))*(1.+.2*(vn(l*25.+4.)-.5));
 vec2 g=l*62.,id=floor(g),fr=fract(g)-.5;float h=h21(id),aa=h*6.283;vec2 dr=vec2(cos(aa),sin(aa));
 float fib=h21(id+7.)>.45?sdCap(fr,-dr*.36,dr*.36,.07,.07):9.;col=mix(col,vec3(.17,.135,.07),ss(.03,-.03,fib)*.6);
 col=mix(col,vec3(.17,.135,.07),ss(PX,-PX,st)*.8);
 vec3 n=normalize(vec3(d0/r,sqrt(max(0.,1.-dot(d0,d0)/(r*r)))));col=litN(col,n,.1)*1.5+moonCol()*ss(.35,1.,dot(n.xy,normalize(vec2(.6,1.))))*.10*NIGHT;
 col*=1.-.35*ss(.2,-.9,n.y);
 solid(col,cc);}
void scene(vec2 q,float t){
 float x0=uScene.x;vec3 g=grassAlb(x0,6.)*mix(vec3(1.),vec3(.58,.62,.84),NIGHT);
 floorStrip(.25,G0+.07,.05,g*.9,20.);
 // the ground: sandy soil under the moon, small stones
 float top=G0+.045+.004*sin(q.x*9.);
 if(uDecor<1.5&&q.y<top){vec3 sc=mix(vec3(.31,.25,.17),vec3(.24,.19,.13),ss(top,-.5,q.y))*(1.+.18*(vn(q*vec2(50.,90.))-.5));
  vec2 sg=q*vec2(26.,40.);vec2 id=floor(sg),fr=fract(sg)-.5;float stn=ss(.25,.18,length(fr*vec2(1.,1.4)))*step(.86,h21(id));sc=mix(sc,vec3(.36,.33,.30),stn*.7);
  sc*=1.-.25*ss(PX*2.,-.02,q.y-top);
  solid(decCol(litFlat(sc,.1)*1.2*(1.+fibre(q*1.5)*.4)),cov(q.y-top));}
 // the second beetle, further back, rolling its smaller ball away to the right (gone by the key moment); its ball is drawn turning
 // slower than it rolls, so that nothing on the screen turns faster than once in 4 s (the main ball: 4.4 s a turn)
 {float r2=.050,xb2=.34+.18*t;if(xb2<1.3){vec2 b2=vec2(xb2,G0+.030+r2);ball(q,b2,r2,-(xb2-.34)/r2*.4);
   beetle(q,b2+vec2(-.064,-.009),.075,-1.,-1.0,0.,t*TAU*2.4,0.,b2,r2,G0+.030,blinkAt(t,.7));}}
 // where the ball is: pushed to the right, still while the beetle dances, then rolled away to the left in a straight line
 float r=.090,s=.13,xb=t<7.5?-.17+.15*ss(.0,3.2,t):-.02-.13*(t-7.5);
 vec2 bc=vec2(xb,G0+r-.004);float roll=-(xb+.17)/r;
 // the track of the ball in the dust
 if(uDecor<1.5){float tr=abs(q.y-G0+.002)-.0035;float x1=t<7.5?-.20:-.02,x2=xb;float m=ss(PX,-PX,tr)*step(min(x1,x2),q.x)*step(q.x,max(x1,x2));shade(m*.35,vec3(.55,.50,.52));}
 ball(q,bc,r,roll);
 // the beetle's moves: rolling (walking backwards, facing left); it stops, levels, turns round to face the ball, climbs it; on the top
 // it turns round slowly, stops and raises its head to the sky, turns back, raises it again; it climbs down the right side, turns
 // into the rolling pose (facing right) and rolls the ball away to the left
 vec2 PUSH=vec2(.115,-.016)*s/.13;float hb=.27*s;
 vec2 c;float m=-1.,pitch=-1.0,mode=0.,ph=t*TAU*2.0,look=0.;
 if(t<3.2){c=bc+vec2(-PUSH.x,PUSH.y);}
 else if(t<3.9){float u=ss(3.2,3.5,t);vec2 c0=bc+vec2(-PUSH.x,PUSH.y),c1=bc+vec2(-(r+.12*s),-r+.004+.30*s);c=mix(c0,c1,u);pitch=mix(-1.0,0.,u);mode=u>.5?2.:0.;
  m=mix(-1.,1.,ss(3.5,3.85,t));ph=t*TAU*1.6;}
 else if(t<4.6){float u=ss(3.9,4.6,t);float a=mix(PI*.86,PI*.5,u);c=bc+vec2(cos(a),sin(a))*(r+hb);pitch=mix(0.,a-PI*.5,ss(3.9,4.05,t));m=1.;mode=1.;ph=t*TAU*1.8;}
 else if(t<6.7){c=bc+vec2(0.,r+hb);pitch=0.;mode=1.;
  // turn round (≈ 0.75 s), look up, turn back, look up again
  m=cos(PI*ss(4.75,5.5,t))*1.;m=t>5.95?cos(PI*(1.-ss(5.95,6.7,t))):m;
  look=ss(5.5,5.65,t)*ss(5.95,5.8,t)+ss(6.35,6.5,t)*(t<6.7?1.:0.);ph=(abs(m)<.98?t*TAU*2.4:0.);}
 else if(t<7.3){float u=ss(6.7,7.3,t);float a=mix(PI*.5,PI*.12,u);c=bc+vec2(cos(a),sin(a))*(r+hb);pitch=a-PI*.5;m=1.;mode=1.;ph=t*TAU*1.8;look=ss(6.85,6.7,t);}
 else{float u=ss(7.3,7.5,t);float a=PI*.12;vec2 c0=bc+vec2(cos(a),sin(a))*(r+hb),c1=bc+PUSH;c=mix(c0,c1,u);pitch=mix(a-PI*.5,-1.0,u);m=1.;mode=0.;}
 beetle(q,c,s,m,pitch,mode,ph,look,bc,r,G0,blinkAt(t,.4));
 // a few tufts of grass in the sand, at the sides
 if(uDecor<1.5){vec2 u=atS(-.10);float px=pxS(-.10);float d=9.;
  for(int j=0;j<4;j++){float fj=float(j);float x=fj<1.5?-.84+fj*.17:.58+(fj-2.)*.22;float hgt=.10+.07*h11(fj+2.);
   for(int i=0;i<6;i++){float fi=float(i)-2.5;float sw=.012*sin(t*.7+fj*2.+fi*.3);vec2 a=vec2(x+fi*.008,G0-.06),bb=vec2(x+fi*.030+sw,G0-.06+hgt*(1.-.12*abs(fi))),mm=mix(a,bb,.5)+vec2(fi*.006,.01);
    d=min(d,min(sdCap(u,a,mm,.0045,.003),sdCap(u,mm,bb,.003,.0008)));}}
  vec3 tc=litFlat(vec3(.14,.13,.07),.4);solid(decCol(tc),ss(px,-px,d)*DEC());}
}

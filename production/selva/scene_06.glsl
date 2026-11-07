// 7 · Tamarins emperador. In the middle storey, in the dappled gold of late morning, a long mossy branch with a bromeliad and a few
// lianas. Two emperor tamarins, small grey-brown monkeys with long white moustaches and rust-coloured tails (Saguinus imperator;
// south west Amazon; the long white moustache as in the usual descriptions, not checked in a primary source). The first one, on a higher branch, crouches and jumps down to the main branch (the key
// moment, tau ≈ 3.0–3.8 s), lands with the branch bouncing, and sits by the other. The other strokes its moustache with its hand
// (≈ 6–9 s; a criterion of the design, not a described behaviour) and at the end both look at us, their tails hanging and swaying.
float fuzz(float d,vec2 p,float k){return d+k*(fbm2(p*55.)-.5)+k*.6*(vn(p*170.)-.5);}
// Grizzled fur: grey brown with pale tips.
vec3 agouti(vec2 p,float k){float n=.65*vn(vec2(p.x*110.,p.y*9.))+.35*vn(vec2(p.x*45.,p.y*25.)+7.),m=fbm2(p*6.);return mix(vec3(.05,.045,.04),vec3(.19,.155,.11),.15+.75*n)*(.8+.4*m)*k;}
float branchY(float x,float b){return -.17+.05*x+.015*sin(3.*x+1.)+b*exp(-pow((x-.06)/.5,2.));}
float hiY(float x){return .17-.07*(x+.9);}
// A hanging tail from b along dir (len), swaying, with its tip curling a little; distance in the creature's units.
float tailD(vec2 f,vec2 b,vec2 dir,float len,float sw,float t,float s){float d=1e5;vec2 p0=b,nr=vec2(-dir.y,dir.x);
 for(int i=1;i<=10;i++){float u=float(i)/10.;vec2 p1=b+dir*len*u+nr*(sw*u*u*sin(t*1.2+s+u*2.5)+.12*u*u*u*u);d=min(d,sdSeg(f,p0,p1)-mix(.050,.024,u));p0=p1;}return d;}
// One white strand of the moustache, from m (k: the side), curving out and down; pull: a hand stroking it, at height py.
float strand(vec2 h,vec2 m,float k,float sp,float pull,float py){float d=1e5;vec2 p0=m;
 for(int i=1;i<=9;i++){float u=float(i)/9.;vec2 p1=m+vec2(k*sp*(.11*u+.09*sin(u*1.6))+.02*u,-.34*u+.07*u*u);p1.x+=pull*.035*ss(.1,0.,abs(p1.y-py));
  d=min(d,sdSeg(h,p0,p1)-(.019*(1.-.75*u)+.003));p0=p1;}return d;}
// An emperor tamarin, in its own frame (hips on the branch at the origin, unit L ≈ its sitting height), facing right if dir = 1. st: the
// stretch of a jump (0 sitting, 1 flying, the body forward); cr: a crouch before the jump; gr: the hand up to the moustache (gs: the
// stroke going down); lk: how much the face turns to us; bl: blink.
void tamarin(vec2 q,vec2 c,float L,float dir,float st,float cr,float gr,float gs,float lk,float bl,float t,float s){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(f.y>1.4||f.y<-1.6||abs(f.x)>1.5)return;
 vec2 g=rot(-1.25*st)*f;g.y/=1.-.12*cr;
 vec3 dark=vec3(.035,.03,.03),rust=vec3(.21,.075,.025),gold=vec3(1.,.82,.45);
 // the tail: hangs from the hips when sitting, streams behind in the jump
 vec2 tb=vec2(-.10,.06),tdir=normalize(mix(vec2(-.06,-1.),vec2(-1.,-.25),st));float tl=fuzz(tailD(f,tb,tdir,1.2,.10*(1.-st)+.04,t,s),f*.5,.03);
 float tu=sat(length(f-tb)/1.2);solid(mix(rust,rust*.5,tu)*(.75+.45*vn(f*vec2(90.,9.))),cov(tl*L));glow(gold*ln(abs(tl)*L,.0012)*.25);
 // the far arm and leg, darker, behind the body
 vec2 sh=vec2(.08,.46),hip=vec2(.0,.10);
 vec2 fh=mix(vec2(.30,.02),vec2(.18,.98),st),fe=mix(vec2(.24,.24),vec2(.15,.74),st);
 {float d=fuzz(min(sdSeg(g,sh+vec2(.03,0.),fe)-.040,sdSeg(g,fe,fh)-.030),g,.018);solid(agouti(g,.55),cov(d*L));solid(dark,cov((length(g-fh)-.035)*L));}
 // the body: grizzled grey brown, rust on the chest and the belly
 vec2 b=rot(-.25*(1.-st))*(g-vec2(.03,.30));float bd=fuzz(sdEll(b,vec2(.16,.27)),g,.022);
 vec3 bc=mix(agouti(g,1.),rust*(.8+.3*vn(vec2(g.x*90.,g.y*12.))),ss(.03,-.04,sdEll(b-vec2(.07,-.07),vec2(.08,.15))));solid(bc,cov(bd*L));
 glow(gold*ln(abs(bd)*L,.0016)*.35*ss(-.2,.2,b.y-b.x));
 // the near leg: crouched on the branch, or thrown back in the jump
 {vec2 kn=mix(vec2(.17,.15),vec2(.02,-.14),st),ft=mix(vec2(.22,-.02),vec2(-.04,-.38),st);
  float d=fuzz(min(sdSeg(g,hip,kn)-.075,sdSeg(g,kn,ft)-.042),g,.02);solid(agouti(g,.9),cov(d*L));solid(dark,cov((sdEll(g-ft-vec2(.03,0.),vec2(.06,.028)))*L));}
 // the head: dark fur, the face of black skin, round brown eyes; it turns to us (lk)
 vec2 H=vec2(.08,.67);vec2 h=g-H;float hd=fuzz(length(h*vec2(1.,1.05))-.150,g,.020);solid(agouti(g,.55),cov(hd*L));glow(gold*ln(abs(hd)*L,.0016)*.35);
 float hx=mix(.05,0.,lk);vec2 fc=h-vec2(hx,-.02);float face=sdEll(fc,vec2(mix(.075,.10,lk),.09));solid(dark,cov(face*L));
 for(int e=-1;e<=1;e+=2){float fe2=float(e);vec2 ep=fc-vec2(fe2*mix(.030,.042,lk)+(1.-lk)*.012,.025);float vis=e<0?mix(.6,1.,lk):1.;
  float r=.030*(e<0?mix(.8,1.,lk):1.);solid(vec3(.30,.15,.06),cov((length(ep)-r)*L)*vis);solid(vec3(.01),cov((length(ep)-r*.55)*L)*vis);
  solid(vec3(1.),cov((length(ep-vec2(-.008,.010))-r*.28)*L)*vis);solid(dark,cov((length(ep)-r*1.05)*L)*cov((-ep.y+r*1.1-2.2*r*bl)*L)*vis);}
 vec2 M=vec2(hx+mix(.04,0.,lk),-.065),mz=h-M;solid(vec3(.10,.08,.08),cov(sdEll(mz-vec2(0.,.012),vec2(.022,.012))*L));
 // the moustache: two long white strands from the lip, curving out and down; the white tuft of the chin
 float py=mix(.55,.38,gs)-H.y;
 float sp=mix(.55,1.,lk),ms=min(min(strand(h,M+vec2(-.015,-.005),-1.,sp,0.,py),strand(h,M+vec2(-.01,-.015),-1.,sp*.75,0.,py)),min(strand(h,M+vec2(.015,-.005),1.,sp,gr*(1.-gs*.5),py),strand(h,M+vec2(.01,-.015),1.,sp*.75,gr*(1.-gs*.5),py)));ms=fuzz(ms,g*.6,.010);
 solid(vec3(.93,.92,.88)*(.85+.15*vn(g*vec2(200.,30.))),cov(ms*L));glow(gold*ln(abs(ms)*L,.0012)*.4);
 solid(vec3(.85,.84,.80),cov(fuzz(sdEll(mz-vec2(0.,-.06),vec2(.025,.022)),g,.01)*L));
 // the near arm: the hand on the branch, up at the moustache, or reaching forward in the jump
 vec2 nh=mix(mix(vec2(.21,.03),vec2(.20+.02*lk,H.y-.16+(py+H.y-.55)*.8),gr),vec2(.10,1.02),st),ne=mix(mix(vec2(.17,.24),vec2(.30,.40),gr),vec2(.08,.80),st);
 {float d=fuzz(min(sdSeg(g,sh,ne)-.042,sdSeg(g,ne,nh)-.032),g,.018);solid(mix(agouti(g,1.),rust,.15),cov(d*L));glow(gold*ln(abs(d)*L,.0014)*.25);
  solid(dark,cov((length(g-nh)-.040)*L));}
}
void scene(vec2 q,float t){
 // the out-of-focus leaves far behind and spots of sun
 for(int i=0;i<8;i++){float fi=float(i);vec2 c=vec2(-ASP+2.*ASP*h11(fi+3.),-.35+.8*h11(fi+9.))+.01*vec2(sin(t*.2+fi),cos(t*.17+fi));float r=.025+.035*h11(fi+5.);
  glow(vec3(1.,.9,.5)*ss(r,r*.75,length(q-c))*.045);}
 // lianas hanging down
 for(int i=0;i<3;i++){float fi=float(i),x0=-.75+.62*fi+.1*h11(fi);float x=x0+.02*sin(q.y*4.+fi+t*.3);float d=abs(q.x-x)-.006;solid(vec3(.07,.09,.04),cov(d)*ss(-.6,-.4,q.y));glow(vec3(1.,.85,.4)*ln(abs(d),.001)*.2);}
 // the landing makes the main branch bounce
 float bo=-.018*ss(3.70,3.82,t)*exp(-max(t-3.82,0.)*3.5)*cos(max(t-3.82,0.)*15.);
 // the high branch, top left, with leaves at its end
 {vec2 a=vec2(-ASP-.1,hiY(-ASP-.1)),e=vec2(-.22,hiY(-.22));float u=segU(q,a,e),d=sdSeg(q,a,e)-mix(.030,.010,u);solid(vec3(.13,.09,.06)*(.7+.3*fbm2(q*vec2(30.,70.))),cov(d));glow(vec3(1.,.85,.5)*ln(abs(d),.0012)*.3);
  for(int k=0;k<4;k++){float fk=float(k),v;vec2 l=rot(-.4+.6*fk+.05*sin(t*.7+fk))*(q-e-vec2(-.06*fk,0.))/.16;float ld=leafD(l,.25,v)*.16;solid(mix(vec3(.04,.11,.02),vec3(.11,.20,.04),.5+.5*v)*(1.-.3*exp(-abs(v)*12.)),cov(ld));}}
 // the main branch: bark, moss on top, a bromeliad, small red berries
 {float y=branchY(q.x,bo),d=abs(q.y-y)-.045;vec3 bark=vec3(.14,.10,.07)*(.7+.35*fbm2(q*vec2(14.,60.)));float moss=ss(-.01,.03,q.y-y)*ss(.4,.6,fbm(q*18.));
  solid(mix(bark,vec3(.20,.32,.06)*(.8+.3*vn(q*120.)),moss),cov(d));glow(vec3(1.,.85,.5)*ln(abs(q.y-y-.045),.0014)*.35);}
 {vec2 bb=vec2(-.62,branchY(-.62,bo)+.035);for(int k=0;k<7;k++){float fk=float(k),a=-1.2+.4*fk,v;vec2 l=rot(-a)*(q-bb)/.17;float ld=leafD(l,.18,v)*.17;solid(mix(vec3(.03,.08,.02),vec3(.09,.15,.03),.5+.5*v),cov(ld));}
  solid(vec3(.60,.05,.10),cov(sdEll(q-bb-vec2(0.,.05),vec2(.016,.05))));}
 for(int k=0;k<6;k++){float fk=float(k);vec2 c=vec2(.72+.025*sin(fk*2.),branchY(.72,bo)-.06-.022*fk+.01*sin(fk*3.))+vec2(.012*sin(t*.8),0.)*fk*.2;solid(vec3(.70,.08,.08)*(1.-.2*h11(fk)),cov(length(q-c)-.014));glow(vec3(1.,.5,.4)*exp(-length(q-c-vec2(-.004,.005))/.003)*.2);}
 // the first tamarin: on the high branch, crouches, jumps down, lands by the other one, looks at it, then at us
 vec2 P0=vec2(-.58,hiY(-.58)+.012),P1=vec2(.0,branchY(.02,bo)+.04);float j=ss(3.0,3.8,t);vec2 pa=mix(P0,P1,j)+vec2(0.,.20*sin(PI*j));
 float st=ss(2.95,3.15,t)*ss(3.85,3.62,t),cr=ss(2.4,2.9,t)*ss(3.05,2.95,t)+.6*ss(3.75,3.85,t)*ss(4.3,3.95,t);
 float lk1=.25+.75*ss(9.4,10.,t)-.25*ss(6.,6.5,t)*ss(9.4,9.,t),bl1=ss(.0,.06,abs(fract(t*.21+.3)-.5)-.44);
 tamarin(q,pa,.40,1.,st,cr,0.,0.,lk1,bl1,t,1.);
 // the second tamarin: sits on the right facing left, strokes its moustache, then looks at us
 float gr=ss(5.9,6.4,t)*ss(9.2,8.7,t),gs=.5-.5*cos(max(t-6.2,0.)*TAU/1.25),lk2=.35+.65*ss(9.6,10.2,t)-.2*ss(3.4,3.9,t)*ss(5.6,5.2,t),bl2=ss(.0,.06,abs(fract(t*.17+.7)-.5)-.44);
 tamarin(q,vec2(.46,branchY(.46,bo)+.04),.37,-1.,0.,.15*ss(3.8,3.9,t)*ss(4.3,4.,t),gr,gs,lk2,bl2,t,2.);
 // dark leaves in front, at the corners
 {float v;vec2 l=rot(2.5)*(q-vec2(ASP+.06,-.60))/.70;float d=leafD(l,.22,v)*.70;solid(vec3(.02,.05,.012)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.92);}
 {float v;vec2 l=rot(-.5)*(q-vec2(-ASP-.06,-.66))/.55;float d=leafD(l,.22,v)*.55;solid(vec3(.02,.05,.012)*(1.-.4*exp(-abs(v)*10.)),cov(d)*.92);}
}

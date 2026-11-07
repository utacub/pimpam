// 3 · Els tucans. Over the sea of crowns at dawn (bg.glsl), the bare branch of an emergent tree with its epiphytes (a bromeliad, a
// hanging fern, pink orchids, lianas) and a bunch of orange fruits under it. Two toucans. The white-throated one hops along the branch
// to the fruits (tau ≈ 1–2.4 s), picks one with the tip of its bill, tosses it up and catches it (the key moment, ≈ 3.5–4.6 s) and
// swallows it. The other one, with an orange throat, turns its head, hops to a higher twig with a beat of its wings (≈ 7.4–8.2 s), and
// at the end both bow their bills. That toucans toss their food is a criterion of the design (no source checked).
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float branchY(float x){return -.06+.11*x+.018*sin(x*4.+1.);}
// The bill of a toucan from its base B along +x (length len): the upper part with a light ridge, the lower part opening by bo. Returns
// the distance; part: 1 upper, 0 lower; u: how far along.
float bill(vec2 p,float len,float bo,out float part,out float u){
 float ux=p.x/len;u=sat(ux);float cl=-.10*u*u*len;
 float top=cl+.15*len*(1.-pow(u,1.25))+.004,mid=cl-.004*len;
 float up=max(max(p.y-top,mid-p.y),max(-p.x,p.x-len));
 vec2 pl=rot(bo*.42)*p;float ul=sat(pl.x/len),cl2=-.10*ul*ul*len;float bot=cl2-.10*len*(1.-pow(ul,1.1))-.003;
 float lo=max(max(pl.y-(cl2-.002*len),bot-pl.y),max(-pl.x,pl.x-len*.97));
 part=step(up,lo);return min(up,lo);}
// A toucan perched, in its own frame (feet at y ≈ −.48, unit L), facing right if dir = 1: kind 0 white throat, 1 orange throat; hd:
// the head turned up (positive) or down; bo: bill open; sq: squash of a hop; wg: wings open (0–1); bl: blink; fr: a fruit at the bill
// tip (0–1).
void toucan(vec2 q,vec2 c,float L,float kind,float dir,float hd,float bo,float sq,float wg,float bl,float fr,float s,float t){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(f.x<-1.3||f.x>1.5||f.y<-1.45||f.y>1.2)return;
 f.y=(f.y+.48)/(1.+.012*sin(t*2.3+s)-sq)-.48;
 vec3 blk=vec3(.010,.010,.014),gold=vec3(1.,.62,.30);
 vec2 S=vec2(-.04,.14);
 // the far wing, when the wings open
 if(wg>.01){vec2 a=vec2(cos(mix(-2.3,1.9,wg)),sin(mix(-2.3,1.9,wg)));vec2 W=S+a*.40*wg;float d=sdSeg(f,S,W)-.08*wg;
  for(int i=0;i<7;i++){float u=float(i)/6.;vec2 P=mix(S+a*.06,W,u);float fa=atan(a.y,a.x)-(1.3-1.1*u);d=min(d,sdSeg(f,P,P+vec2(cos(fa),sin(fa))*mix(.24,.46,u)*wg)-.04*wg);}
  solid(blk*.7,cov(d*L));}
 // the tail, long and square, hanging behind the branch
 vec2 tq=f-vec2(-.12,-.30);vec2 ta=vec2(-.20,-.92);float tu=segU(tq,vec2(0.),ta),td=sdSeg(tq,vec2(0.),ta)-mix(.065,.058,tu);
 solid(blk,cov(td*L));
 // the body, upright, and the head turned on the neck
 vec2 bq=rot(-.22)*(f-vec2(-.02,-.08));float body=sdEll(bq,vec2(.19,.32));
 vec2 N=vec2(.03,.20),H=vec2(.08,.33);vec2 hf=rot(hd)*(f-N)+N;float head=length(hf-H)-.125;float bh=smin(body,head,.07);
 solid(blk,cov(bh*L));
 // the throat: white with a thin yellow edge, or orange with a red band below; the red under the tail
 vec2 bb=rot(.35)*(hf-vec2(.12,.17));float bib=max(sdEll(bb,vec2(.095,.13)),bh);
 vec3 bc=kind<.5?mix(vec3(1.,.96,.88),vec3(1.,.85,.30),ss(-.02,.0,bib)):vec3(1.,.60,.06)*(.85+.15*ss(-.1,.1,bb.y));
 solid(bc,cov(bib*L));
 if(kind>.5)solid(vec3(.85,.08,.05),cov(max(abs(bb.y+.135)-.018,bh+.01)*L)*ss(.1,.0,abs(bb.x)));
 else solid(vec3(.85,.08,.05),cov(max(abs(bb.y+.14)-.010,bh+.01)*L)*ss(.1,.0,abs(bb.x)));
 solid(vec3(.88,.07,.05),cov(sdEll(f-vec2(-.12,-.37),vec2(.07,.045))*L));
 // the folded wing, with a faint blue-green sheen
 if(wg<.99){vec2 wq=rot(.35)*(f-vec2(-.08,-.06));float wd=sdEll(wq,vec2(.12,.27));solid(mix(blk,vec3(.03,.06,.07),ss(.2,-.2,wq.y)),cov(wd*L)*(1.-wg));}
 // the eye in its patch of blue skin, the lid when it blinks
 vec2 E=hf-H-vec2(.04,.03);solid(kind<.5?vec3(.25,.55,1.):vec3(.30,.70,1.),cov(sdEll(E,vec2(.055,.045))*L));
 solid(vec3(.01),cov((length(E)-.020)*L));solid(vec3(1.),cov((length(E-vec2(-.007,.008))-.006)*L));
 solid(blk,cov(sdEll(E,vec2(.058,.048))*L)*cov(-E.y+.05-.10*bl));
 // the bill: black with a golden ridge and a band at the base (yellow in one, blue in the other); a thin light on its edge
 vec2 B=hf-H-vec2(.08,.03);float part,u,bd=bill(B,.66,bo,part,u);
 if(bd<.02){float cl=-.10*u*u*.66,top=cl+.15*.66*(1.-pow(u,1.25));float ridge=ss(.032,.008,top-B.y)*part;
  vec3 col=mix(vec3(.025,.018,.02),vec3(.10,.03,.03),ss(.6,.95,u)*part);col=mix(col,vec3(1.,.80,.10),ridge);
  col=mix(col,kind<.5?vec3(1.,.82,.12):vec3(.25,.6,1.),ss(.10,.06,u));col=mix(col,blk,ss(.06,.05,u)*ss(.12,.10,u)*.0);
  solid(col,cov(bd*L));glow(gold*ln(abs(bd)*L,.0010)*.35*ss(.0,.3,B.y-cl+.02));}
 // the fruit held at the tip
 if(fr>.01){vec2 tip=H+vec2(.08,.03)+vec2(.64,-.10*.66);vec2 Fp=rot(-hd)*(tip-N)+N;float fd=length(f-Fp-vec2(.0,-.02))-.05;solid(vec3(1.,.42,.06),cov(fd*L)*fr);glow(vec3(1.,.8,.4)*cov((length(f-Fp-vec2(-.012,-.003))-.012)*L)*fr*.4);}
 // the near wing, when the wings open
 if(wg>.01){vec2 a=vec2(cos(mix(-2.1,2.15,wg)),sin(mix(-2.1,2.15,wg)));vec2 W=S+a*.42*wg;float d=sdSeg(f,S,W)-.085*wg;
  for(int i=0;i<7;i++){float u=float(i)/6.;vec2 P=mix(S+a*.06,W,u);float fa=atan(a.y,a.x)+(1.3-1.1*u);d=min(d,sdSeg(f,P,P+vec2(cos(fa),sin(fa))*mix(.24,.48,u)*wg)-.042*wg);}
  solid(mix(blk,vec3(.04,.07,.08),.5),cov(d*L));glow(gold*ln(abs(d)*L,.0012)*.3);}
 // the feet on the branch
 solid(vec3(.30,.42,.60),cov(min(sdEll(f-vec2(-.02,-.47),vec2(.06,.025)),sdEll(f-vec2(.08,-.47),vec2(.05,.025)))*L));
 // the light of dawn on the edges facing the low sun (on the left of the picture)
 float lit=dir>0.?ss(.15,-.15,f.x):ss(-.15,.15,f.x);glow(gold*ln(abs(bh)*L,.0016)*(.18+.7*lit));}
// A leaf hanging from b: lit from behind, its veins darker.
void leaf(vec2 q,vec2 b,float ang,float len,float wd,float t,float s){vec2 l=rot(ang+.06*sin(t*.8+s))*(q-b)/len;if(l.x<-.05||l.x>1.05||abs(l.y)>.4)return;
 float v,d=leafD(l,wd,v)*len;float c=cov(d);if(c<=0.)return;float vein=exp(-abs(v)*8.)*.5+.3*exp(-abs(fract(l.x*6.-abs(v)*1.5)-.5)*10.)*ss(.1,.4,abs(v));
 solid(mix(vec3(.18,.30,.05),vec3(.45,.55,.10),ss(-1.,1.,-v))*(1.-.4*vein),c);glow(vec3(.9,.6,.25)*ln(abs(d),.0012)*.35);}
// The head of the first toucan: down to pick, up to toss, following the fruit, a gulp, looking around, a bow at the end.
float hd1f(float t){float pick=ss(2.5,3.0,t)*ss(3.35,3.15,t),toss=ss(3.3,3.5,t)*ss(4.6,4.2,t),gulp=ss(4.55,4.75,t)*ss(5.4,5.0,t);
 return -.38*pick+.75*toss-.25*ss(3.6,4.,t)*ss(4.6,4.3,t)+.35*gulp+.25*sin(t*.7)*ss(5.6,6.4,t)-.45*ss(9.3,9.8,t)*ss(10.6,10.1,t);}
float x1f(float t){return -.62+.22*ss(1.0,1.45,t)+.23*ss(1.75,2.25,t);}
// Where the tip of the bill of a toucan is (its frame: centre c, unit L, facing dir, head hd).
vec2 tipAt(vec2 c,float L,float dir,float hd){vec2 N=vec2(.03,.20),T=vec2(.80,.294);vec2 f=rot(-hd)*(T-N)+N;return c+vec2(f.x*dir,f.y)*L;}
void scene(vec2 q,float t){
 // a veil of mist low over the far crowns
 {vec2 m=vec2(q.x*1.6+t*.02,q.y*4.-t*.03);float den=ss(.55,.85,fbm(m))*ss(-.05,-.25,q.y)*ss(-.5,-.3,q.y);solid(mix(vec3(.6,.45,.6),vec3(1.,.72,.55),ss(.3,-.6,q.x))*.6,den*.2);}
 // lianas hanging from the branch, swaying
 for(int i=0;i<4;i++){float fi=float(i),x0=-.70+.38*fi+.05*sin(fi*3.),y0=branchY(x0);if(q.y>y0)continue;float dy=y0-q.y,len=.25+.25*h11(fi+4.);if(dy>len)continue;
  float x=x0+.015*sin(t*.6+fi)*dy*4.+.01*sin(dy*20.+fi);solid(vec3(.05,.06,.02),cov(abs(q.x-x)-.0025));
  for(int k=0;k<3;k++){float fk=float(k);float yy=y0-len*(.3+.3*fk);if(abs(q.y-yy)<.05)leaf(q,vec2(x0+.015*sin(t*.6+fi)*(y0-yy)*4.,yy),-1.2+fk*.9+fi,.045,.30,t,fi*3.+fk);}}
 // the branch: bark, moss on top, the light of dawn on its upper edge
 float xb=q.x,yb=branchY(xb),thick=mix(.045,.012,ss(-ASP,.75,xb));
 if(xb<.80){float d=abs(q.y-yb)-thick;float c=cov(d);if(c>0.){float v=(q.y-yb)/thick;vec3 bark=mix(vec3(.04,.025,.02),vec3(.13,.08,.05),.5+.5*sin(xb*80.+3.*fbm2(q*30.)));
   bark=mix(bark,vec3(.14,.22,.05)*(.7+.6*fbm2(q*60.)),ss(.25,.85,v));solid(bark,c);glow(vec3(1.,.62,.3)*ln(abs(q.y-yb-thick),.0016)*.5);}}
 // a twig going up on the right, where the second toucan goes
 {vec2 a=vec2(.50,branchY(.50)),b=vec2(.66,branchY(.50)+.16);float d=sdSeg(q,a,b)-mix(.012,.006,segU(q,a,b));solid(vec3(.10,.07,.04),cov(d));glow(vec3(1.,.62,.3)*ln(abs(d),.0012)*.25);}
 // epiphytes: a bromeliad, a fern hanging, pink orchids
 vec2 bp=vec2(-.36,branchY(-.36)+.02);for(int i=0;i<6;i++){float fi=float(i);leaf(q,bp,1.57+(fi-2.5)*.42,.10-.012*abs(fi-2.5),.13,t,fi+9.);}
 for(int i=0;i<5;i++){float fi=float(i);vec2 bb=bp+vec2(.006*sin(fi*2.),.015+.012*fi);solid(mix(vec3(.95,.15,.30),vec3(1.,.5,.2),fi/5.),cov(sdEll(q-bb,vec2(.012,.006))));}
 {vec2 fp=vec2(.20,branchY(.20)-.02);for(int k=0;k<14;k++){float fk=float(k),u=fk/13.;vec2 r=fp+vec2(.03*u+.01*sin(t*.5),-.30*u);float side=mod(fk,2.)<.5?1.:-1.;
   leaf(q,r,-1.57+side*(1.2-.3*u),.05*(1.-.5*u),.22,t,fk+20.);}
  solid(vec3(.06,.08,.02),cov(sdSeg(q,fp,fp+vec2(.03,-.30))-.002));}
 for(int i=0;i<3;i++){float fi=float(i);vec2 oc=vec2(-.62+.07*fi,branchY(-.62+.07*fi)+.045+.02*sin(fi*2.));
  for(int k=0;k<5;k++){float a=float(k)*1.2566+.3*sin(t*.5+fi);vec2 pd=rot(-a)*(q-oc);solid(vec3(1.,.55,.85),cov(sdEll(pd-vec2(0.,.012),vec2(.006,.012))));}
  solid(vec3(.95,.85,.3),cov(length(q-oc)-.004));}
 // the bunch of orange fruits under the branch
 vec2 fb=vec2(.048,branchY(.048)+.105);float eaten=step(3.1,t);
 {vec2 a=vec2(.03,branchY(.03)),b=fb+vec2(0.,.03);solid(vec3(.10,.07,.04),cov(sdSeg(q,a,b)-.004));leaf(q,b,.5,.07,.25,t,31.);leaf(q,b,2.4,.06,.25,t,32.);}
 for(int i=0;i<8;i++){float fi=float(i);if(i==0&&eaten>.5)continue;vec2 fc=fb+vec2(.028*sin(fi*2.3),-.028*fi*.5-.012*h11(fi))+vec2(.002*sin(t+fi),0.);
  float d=length(q-fc)-.017;solid(mix(vec3(.80,.16,.02),vec3(.95,.32,.05),h11(fi+2.)),cov(d));glow(vec3(1.,.85,.5)*cov(length(q-fc-vec2(-.005,.005))-.004)*.6);}
 solid(vec3(.10,.08,.03),cov(sdSeg(q,fb+vec2(0.,.03),fb+vec2(0.,-.03))-.002));
 // the white-throated toucan: two hops, it picks a fruit, tosses it, catches it, swallows it, then looks around
 float x1=x1f(t);float up1=.07*sin(PI*sat((t-1.)/.45))+.07*sin(PI*sat((t-1.75)/.5));
 float sq1=.10*(exp(-pow((t-1.0)/.08,2.))+exp(-pow((t-1.47)/.08,2.))+exp(-pow((t-1.75)/.08,2.))+exp(-pow((t-2.27)/.08,2.)));
 float gulp=ss(4.55,4.75,t)*ss(5.4,5.0,t);float hd1=hd1f(t);
 float bo1=.9*ss(2.75,2.9,t)*ss(3.1,2.95,t)+1.*ss(4.2,4.35,t)*ss(4.6,4.5,t)+.3*gulp*abs(sin(t*18.));
 float fr1=ss(3.0,3.1,t)*(1.-step(3.55,t));
 toucan(q,vec2(x1,branchY(x1)+.12+up1),.26,0.,1.,hd1,bo1,sq1,0.,ss(.0,.1,abs(fract(t*.21+.3)-.5)-.46),fr1,1.,t);
 // the fruit in the air: from the tip of the bill, up, and into the open bill
 if(t>3.55&&t<4.45){float u=(t-3.55)/.9;vec2 c0=vec2(x1,branchY(x1)+.12);vec2 a0=tipAt(c0,.26,1.,hd1f(3.55)),a1=tipAt(c0,.26,1.,hd1f(4.45));
  vec2 p=mix(a0,a1,u)+vec2(0.,.17*4.*u*(1.-u));
  solid(vec3(1.,.36,.04),cov(length(q-p)-.013));glow(vec3(1.,.95,.7)*cov(length(q-p-vec2(-.004,.004))-.004)*.6+vec3(1.,.75,.4)*exp(-length(q-p)/.02)*.12);}
 // the toucan with the orange throat: turns its head, hops to the twig with a beat of its wings, then both bow
 float j=ss(7.4,8.2,t);vec2 p2=mix(vec2(.44,branchY(.44)+.11),vec2(.63,branchY(.50)+.23),j)+vec2(0.,.10*sin(PI*j));
 float wg2=sat(sin(PI*sat((t-7.3)/1.)))*.95;float hd2=.35*sin(t*.8+1.)*(1.-j)+.15*sin(t*.6)-.45*ss(9.5,10.,t)*ss(10.8,10.3,t);
 toucan(q,p2,.23,1.,-1.,hd2,.15*ss(9.6,9.8,t)*ss(10.4,10.2,t),.08*exp(-pow((t-8.2)/.09,2.)),wg2,ss(.0,.1,abs(fract(t*.17+.6)-.5)-.46),0.,2.,t);
}

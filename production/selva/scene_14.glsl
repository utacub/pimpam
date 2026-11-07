// 15 · Capibares. Night on the river bank, under the moon. A family of capybaras rests on the grass by the water: the mother, big and
// calm, and two young ones. One of the young climbs onto its mother's back (the key moment, tau ≈ 2.6–4.2 s) and settles there; the
// mother turns her head to us; a firefly drifts in and lands on the young one's nose (≈ 8.6 s), which looks at it, and flies off.
// The other young one nibbles the grass. The cleaner birds that ride capybaras by day (Sazima & Sazima, 2010) are not here: it is
// night. That the young ride on their mother is a criterion of the design (not checked).
float smin(float a,float b,float k){float h=sat(.5+.5*(b-a)/k);return mix(b,a,h)-k*h*(1.-h);}
float bankY(float x){return -.30+.025*sin(x*2.3+.4)+.01*sin(x*7.);}
// A capybara, side view facing dir (feet on the ground at the origin, unit L ≈ body length): a barrel body of coarse reddish fur, a
// big square head with a deep muzzle, small ears, eyes high on the head. hd: head lowered (grazing, 0–1); lk: the head turned to us;
// bl: blink; k: brightness (the young ones a little lighter).
void capy(vec2 q,vec2 c,float L,float dir,float hd,float lk,float bl,float k,float t,float s){
 vec2 f=(q-c)/L;f.x/=sdir(dir);if(f.x<-.75||f.x>1.1||f.y<-.05||f.y>1.)return;
 vec3 fur=vec3(.030,.020,.017)*k,moon=vec3(.55,.65,1.);
 float br=1.+.012*sin(t*1.4+s);
 // the legs
 float lg=1e5;for(int i=0;i<4;i++){float fi=float(i);float x=i<2?.30-.08*fi:-.28-.08*(fi-2.);lg=min(lg,sdSeg(f,vec2(x,.20),vec2(x+.01,.02))-.045);}
 // the body: a barrel, rounder at the rump
 float body=smin(sdEll(f-vec2(-.02,.34),vec2(.46,.22*br)),sdEll(f-vec2(-.30,.36),vec2(.24,.24*br)),.10);body=smin(body,lg,.03);
 // the head: lowered to graze, or raised; turned to us
 vec2 H=vec2(.52,.48)+vec2(.10,-.30)*hd;vec2 h=rot(-.55*hd)*(f-H);
 float head=smin(sdEll(h,vec2(mix(.18,.15,lk),.14)),sdEll(h-vec2(mix(.16,.02,lk),-.06),vec2(mix(.12,.11,lk),.11)),.06);
 float all=smin(body,head,.08);
 vec3 col=fur*(.75+.35*vn(vec2(f.x*60.,f.y*14.)))*(.8+.4*ss(.1,.5,f.y));solid(col,cov(all*L));
 glow(moon*ln(abs(all)*L,.0016)*.32*ss(.25,.45,f.y+.15*f.x)+moon*ln(abs(all)*L,.0010)*.03);
 // the ears, the eyes, the nostrils
 for(int e=0;e<2;e++){float fe=float(e);vec2 ea=h-vec2(mix(-.06,-.10+.20*fe,lk),.14);if(e==1&&lk<.2)continue;float d=length(ea)-.035;solid(fur*.7,cov(d*L));glow(moon*ln(abs(d)*L,.0008)*.3);}
 for(int e=0;e<2;e++){float fe=float(e);if(e==1&&lk<.3)continue;vec2 ep=h-vec2(mix(.06,-.06+.12*fe,lk),.05);solid(vec3(.01),cov((sdEll(ep,vec2(.020,.020*(1.-.9*bl))))*L));
  solid(moon,cov((length(ep-vec2(.006,.008))-.006)*L)*(1.-bl));}
 vec2 np=h-vec2(mix(.26,.02,lk),-.02-.04*lk);solid(vec3(.02),cov(sdEll(np,vec2(mix(.012,.04,lk),.010))*L));
}
void scene(vec2 q,float t){
 // the bank: grass, dark, the moon on the tips of the blades
 float by=bankY(q.x);{float d=q.y-by;solid(vec3(.016,.014,.020)*(.8+.3*vn(q*40.)),cov(d));}
 // the other young one, on the left, grazing
 float gz=ss(.2,.6,sin(t*.7+1.));
 capy(q,vec2(-.62,bankY(-.62)+.01),.30,1.,gz,0.,0.,1.15,t,3.);
 // the mother: resting, then turns her head to us
 float lk=ss(4.8,5.8,t)*ss(10.6,9.8,t),blm=ss(.0,.05,abs(fract(t*.15+.2)-.5)-.45);
 vec2 M=vec2(-.12,bankY(-.12)+.01);float LM=.62;
 capy(q,M,LM,1.,0.,lk,blm,1.,t,1.);
 // the young one that climbs onto her back: from the right, a hop, settles; looks at the firefly on its nose
 vec2 Y0=vec2(.55,bankY(.55)+.01),Y1=M+vec2(-.10,.48)*LM;float cl=ss(2.6,4.2,t);vec2 yp=mix(Y0,Y1,cl)+vec2(0.,.16*sin(PI*cl));
 float ydir=1.-2.*ss(2.2,2.5,t)*(1.-ss(4.3,4.6,t));
 float fl=ss(8.4,8.7,t)*ss(10.7,10.4,t);
 capy(q,yp,.30,ydir,0.,.0,0.,1.2,t,2.);
 // the firefly: drifts in, lands on the young one's nose, pulses, flies off
 vec2 nose=yp+vec2(.30*ydir*.86,.30*.46);vec2 fp=mix(vec2(.9,.35)+vec2(.1*sin(t*.6),.06*sin(t*.9)),nose+vec2(0.,.012),ss(7.2,8.6,t));fp=mix(fp,vec2(-.5,.45),ss(10.6,12.,t));
 float I=.35+.65*exp(-pow((fract(t/2.6)-.3)/.12,2.));float d=length(q-fp);solid(vec3(.02),cov(d-.004));glow(vec3(.80,1.,.30)*(exp(-d/.006)*.9+exp(-d/.04)*.18)*I*ss(6.8,7.4,t));
 // grass blades in front, catching the moon
 for(int k=0;k<26;k++){float fk=float(k),x=-ASP+2.*ASP*h11(fk+60.);vec2 a=vec2(x,bankY(x)-.10-.08*h11(fk+61.)),b=a+vec2(.04*sin(fk*3.)+.008*sin(t*.6+fk),.14+.10*h11(fk+62.));
  float dd=sdSeg(q,a,b)-.0035*(1.-segU(q,a,b));solid(vec3(.006,.007,.009),cov(dd));glow(vec3(.55,.65,1.)*ln(abs(dd),.0006)*.10*ss(a.y,b.y,q.y));}
}

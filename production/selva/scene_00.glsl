// 1 · El riu entre la boira. Dawn over the sea of crowns (bg.glsl: the far jungle, the river, the sun). Here: veils of mist that rise
// slowly in front of the far crowns, and two scarlet macaws that cross the picture flying, long tails behind, wings beating (the key
// moment: their crossing, from tau ≈ 2.5 s), with a small flock of parrots far away.
// A scarlet macaw flying to the right, side view, in its own frame (body length ≈ 1): the wings beat up and down (seen from the side,
// a wing is long when it is up or down and thin when it passes the middle), the tail streams behind, the light of dawn on its edges.
void macawFly(vec2 q,vec2 c,float L,float ph,float amp,float s,float bank){
 vec2 f=q-c;if(dot(f,f)>L*L*2.6)return;f=f/L;f=rot(bank)*f;
 float fl=sin(ph)*amp+(1.-amp)*.2,up=fl*.62;
 // far wing (behind), darker
 vec2 w2=f-vec2(-.02,.04);float sp2=-up*.85;vec2 tip2=vec2(-.30,sp2);float u2=segU(w2,vec2(0.),tip2),d2=sdSeg(w2,vec2(0.),tip2)-mix(.13,.05,u2);
 solid(mix(vec3(.30,.02,.03),vec3(.03,.10,.35),ss(.35,.6,u2))*.75,cov(d2*L));
 // tail
 vec2 tq=f-vec2(-.28,0.);float tu=sat(-tq.x/.95),tw=mix(.07,.012,tu);float td=max(abs(tq.y+.04*tu*tu+.02*sin(s*3.+ph*.5)*tu)-tw,max(tq.x,-tq.x-.95));
 solid(mix(vec3(.85,.07,.05),vec3(.10,.25,.85),ss(.55,.9,tu)),cov(td*L));
 // body and head
 float body=sdEll(f-vec2(.02,0.),vec2(.30,.105)),head=length(f-vec2(.33,.05))-.095;float bd=min(body,head);
 vec3 bc=vec3(.92,.08,.05);solid(bc,cov(bd*L));
 // the white face, the eye, the beak (pale above, dark below)
 solid(vec3(.95,.90,.86),cov((sdEll(f-vec2(.36,.05),vec2(.05,.035)))*L));solid(vec3(.02),cov((length(f-vec2(.36,.065))-.014)*L));
 float bk=max(length(f-vec2(.40,.05))-.075,-(length(f-vec2(.39,-.03))-.06));bk=max(bk,.36-f.x);solid(vec3(.92,.86,.72),cov(bk*L));
 // near wing (in front): red at the root, a yellow band, blue feathers to the tip, the trailing edge darker
 vec2 w1=f-vec2(.0,.03);vec2 tip1=vec2(-.34,up);float u1=segU(w1,vec2(0.),tip1),d1=sdSeg(w1,vec2(0.),tip1)-mix(.15,.06,u1)*(.8+.2*abs(fl));
 vec3 wc=u1<.3?vec3(.95,.10,.05):u1<.45?vec3(1.,.78,.10):vec3(.08,.30,.95);wc=mix(wc,vec3(.03,.10,.45),ss(.4,1.,u1)*.5);
 solid(wc,cov(d1*L));
 // the light of dawn on the upper edges
 glow(vec3(1.,.6,.3)*ln(abs(bd)*L,.0015)*ss(-.05,.08,f.y)*.6+vec3(1.,.7,.4)*ln(abs(d1)*L,.0012)*.35);
 }
// A small parrot far away: a dark mark with beating wings.
void parrot(vec2 q,vec2 c,float L,float ph){vec2 f=(q-c)/L;if(dot(f,f)>4.)return;float up=sin(ph)*.7;
 float d=min(sdEll(f,vec2(.5,.16)),min(sdSeg(f,vec2(0.),vec2(-.25,up))-.1,sdSeg(f,vec2(-.4,0.),vec2(-.9,-.02))-.05));solid(vec3(.10,.05,.08),cov(d*L)*.8);}
void scene(vec2 q,float t){
 // veils of mist in two planes, rising slowly over the far crowns (lower half), lit pink and gold from the low sun on the left
 for(int k=0;k<2;k++){float fk=float(k),sc=1.+fk*.8;vec2 m=vec2(q.x*1.4*sc+t*(.015+.01*fk)+fk*3.,q.y*3.2*sc-t*(.035+.02*fk));
  float den=ss(.55,.85,fbm(m))*ss(.06,-.22,q.y+.08*fk)*ss(-.62,-.35,q.y);
  vec3 mc=mix(vec3(.55,.40,.55),vec3(1.,.70,.55),ss(.2,-.6,q.x))*(.55+.25*fk);solid(mc,den*(.30+.15*fk));}
 // a small flock of parrots crossing far away, high in the sky
 for(int i=0;i<5;i++){float fi=float(i);float x=-ASP-.2+(t-1.)*.07+fi*.035-.03*h11(fi);vec2 c=vec2(x,.27+.03*sin(fi*2.3)+.01*sin(t*.8+fi));parrot(q,c,.011,t*14.+fi*1.7);}
 // the two macaws: from the left, one a little behind and farther, gliding between beats
 for(int i=0;i<2;i++){float fi=float(i),t0=2.2+fi*.7,u=t-t0;if(u<-.5)continue;
  float x=-ASP-.3+u*(.26-.05*fi),y=-.02-.13*fi+.05*sin(u*.45+fi)-.01*u;float glide=ss(.3,.8,sin(u*.5+fi*2.)),ph=u*TAU*2.+fi*2.;
  float vy=.05*.45*cos(u*.45+fi)-.01;macawFly(q,vec2(x,y),.16-.04*fi,ph,1.-.75*glide,fi*5.,atan(vy,.24)*.6);}
}

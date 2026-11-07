// 19 · Plomes de mar i lliris. Sea pens stand on the floor like big feathers (orange, violet, coral) and sway in the current; waves
// of green light climb them, one after another. Sea lilies open their crowns of feathery arms like hands to catch food and close them
// again, and a yellow feather star swims across, beating its arms in turn.
float floorQ(float x){float wx=uScene.x+x*uScene.z;return (-22.95+.07*sin(wx*1.9+.4)+.035*sin(wx*4.7+1.)+.012*sin(wx*11.3)-uScene.y)/uScene.z;}
void seaPen(vec2 q,float x0,float H,vec3 col,float t,float s,float dim){
 float y0=floorQ(x0);float u=(q.y-y0)/H;if(u<0.||u>1.1)return;
 float sw=.15*H*u*u*sin(t*.55+s)+.03*H*u*sin(t*1.2+s);float x=q.x-x0-sw;
 // the stalk and the feather: leaves on both sides, slanting up, from a third of the height
 glow(col*ln(abs(x),.004)*.6*dim);
 float lu=(u-.3)/.7;if(lu>0.&&lu<1.){float w=H*.22*sin(lu*3.1416)*(.9+.1*sin(t+s));float side=abs(x);
  float leaf=fract((u*H-side*.9)/(.035*H/.5))-.5;float ld=abs(leaf)*.035*H/.5-.006;float on=step(side,w);
  float lit=pow(.5+.5*sin(lu*6.-t*1.5+s*2.),8.)*ss(0.,1.,t-.5-s*.6);
  put(on*cov(ld)*col*.5*dim,on*cov(ld)*.75*dim,col*.5,vec2(0.));
  glow(on*(col*ln(abs(ld),.003)*.4+vec3(.3,1.,.55)*cov(ld)*lit*1.2+vec3(.3,1.,.55)*exp(-abs(ld)/.01)*lit*.4)*dim);}}
void seaLily(vec2 q,float x0,float H,float t,float s,float dim){
 float y0=floorQ(x0);float u=(q.y-y0)/H;if(u<0.||u>1.45)return;float sw=.06*H*u*u*sin(t*.4+s);float x=q.x-x0-sw;
 if(u<1.){float seg=pow(abs(fract(u*24.)-.5)*2.,8.);glow(vec3(.95,.9,.75)*ln(abs(x),.003+.002*seg)*.55*dim);}
 // the crown: ten arms with feathery side branches; open: a wide fan; closed: a tight fist
 float open=.5+.5*sin(t*.5+s);vec2 p=vec2(x,(u-1.)*H);float pr=length(p),pa=atan(p.x,p.y);if(pr>.28*H)return;
 float arms=0.,pinn=0.;for(int i=0;i<10;i++){float a=(float(i)/9.-.5)*mix(.5,2.6,open);float uu=pr/(.25*H);if(uu>1.)continue;
  float aa=a*(1.+.3*uu)-sign(a)*(1.-open)*uu*uu*1.2;float da=abs(pa-aa)*pr;arms+=ln(da,.0025);pinn+=ln(abs(da-.012*H*(1.-uu)*abs(sin(pr*180.))),.0015)*(1.-uu);}
 glow((vec3(1.,.9,.5)*arms*.5+vec3(1.,.95,.7)*pinn*.25)*dim);}
void scene(vec2 q,float t){
 seaLily(q,-.78,.42,t,1.,.7);seaLily(q,.84,.48,t,2.3,.7);seaLily(q,-.05,.36,t,4.,.55);
 seaPen(q,-.5,.55,vec3(1.,.5,.15),t,0.,1.);seaPen(q,.28,.66,vec3(.75,.35,1.),t,1.,1.);seaPen(q,.6,.4,vec3(1.,.35,.45),t,2.,.85);
 seaPen(q,-.22,.3,vec3(1.,.7,.2),t,3.,.7);seaPen(q,.02,.48,vec3(.95,.4,.7),t,4.,.8);seaPen(q,-.92,.3,vec3(.6,.5,1.),t,5.,.6);
 // the feather star: swimming from right to left, beating its arms in turn
 vec2 C=vec2(.85-.11*t,.18+.08*sin(t*.5));vec2 l=(q-C)/.12;if(dot(l,l)<2.5){enter(.12);float arms=0.,pinn=0.;
  for(int i=0;i<10;i++){float fi=float(i),sg=mod(fi,2.)<.5?1.:-1.,ph=t*2.2+floor(fi/2.)*1.2;float a=1.5708*sg+(.9+.35*sin(ph))*sg*-.6+(fi-4.5)*.12;
   vec2 dir=vec2(sin(a),cos(a));float along=dot(l,dir),per=dot(l,vec2(-dir.y,dir.x));if(along<0.||along>1.1)continue;
   float cur=per-.25*along*along*sin(ph+1.);arms+=ln(abs(cur),.02)*(1.-along*.5);pinn+=ln(abs(abs(cur)-.06*abs(sin(along*40.))),.012)*(1.-along);}
  glow((vec3(1.,.85,.2)*arms*.6+vec3(1.,.95,.5)*pinn*.3));glow(vec3(1.,.7,.2)*exp(-length(l)/.12)*.8);leave();}
}

// 8 · Ctenòfors irisats. Comb jellies in the twilight: eight rows of beating combs on each body break the light into rainbows that
// run from end to end. Sea gooseberries (Pleurobrachia) throw out two long tentacles with fine side threads and pull them in; a pink
// Beroe opens its wide mouth and turns; lobed Bolinopsis drift with their rainbow rows.
// The comb rows of a body of half-width R(y): eight meridians turning with the body (spin); light running along them.
vec3 combRows(vec2 l,float R,float y0,float y1,float spin,float t,float s){
 if(l.y<y0||l.y>y1||R<=0.)return vec3(0.);vec3 c=vec3(0.);float v=(l.y-y0)/(y1-y0);
 for(int k=0;k<8;k++){float ph=float(k)*.7854+spin,x=R*sin(ph),front=cos(ph);
  float d=abs(l.x-x)/max(.25,abs(front));float run=pow(.5+.5*sin(v*34.-t*7.+float(k)),2.);
  c+=pal(v*.9-t*.25+float(k)*.06+s)*ln(d,.012)*(front>0.?1.:.3)*(.3+1.4*run)*ss(0.,.08,v)*ss(1.,.9,v);}
 return c;}
float gbX(float u,float sg,float cst,float L,float t,float s){return sg*.35*u*(.3+.3*cst)+.25*sin(u*1.3-t*.8+s)*u/(L+.5);}
void gooseberry(vec2 q,vec2 c,float sz,float ang,float t,float s,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(dot(l,l)>40.)return;enter(sz);
 // the two tentacles: thrown out in long curves, then pulled in, on their own clock
 float cst=.5+.5*sin(t*.45+s*2.),L=.6+4.2*cst;
 for(int k=0;k<2;k++){float sg=k==0?-1.:1.;vec2 p=l-vec2(.3*sg,.05);float u=-p.y;
  if(u>-.1&&u<L+.2){float th=u>0.&&u<L?ln(abs(p.x-gbX(u,sg,cst,L,t,s+float(k))),.012)*(1.-u/L*.6):0.;
   float uj=(floor(u*4.)+.5)/4.,tw=0.;if(uj<L){vec2 A=vec2(gbX(uj,sg,cst,L,t,s+float(k)),-uj);tw=ln(sdSeg(p,A,A+vec2(sg*(.08+.3*cst),-.14)),.008);}
   glow((vec3(.95,.75,.6)*th*.6+vec3(1.,.55,.4)*tw*.45)*dim);}}
 float R=.5*sqrt(max(0.,1.-pow(l.y/.6,2.)));float d=sdEll(l,vec2(.5,.6));
 glassN(d,normalize(l),.18,vec3(.92,.95,1.05),vec3(.7,.85,1.),1.5,s,.6*dim);
 glow(combRows(l,R*.98,-.55,.55,t*.25+s,t,s)*cov(d+.01)*dim);
 leave();}
void beroe(vec2 q,vec2 c,float sz,float ang,float t,float s,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>.75||abs(l.y)>1.1)return;enter(sz);
 // a thimble: closed above, the wide mouth below opening and closing
 float m=.5+.5*sin(t*.7+s);float hw=.42+.12*m*ss(-.2,-.9,l.y);float d=max(sdEll(l-vec2(0.,-.05),vec2(hw,.95)),l.y-.8);
 d=max(d,-(sdEll(l-vec2(0.,-.95),vec2(hw*.75,.35+.15*m))));
 glassN(d,normalize(l),.16,vec3(1.,.82,.92),vec3(1.,.55,.75),1.3,s,.65*dim);
 glow(vec3(1.,.4,.6)*cov(d)*.07*dim+combRows(l,hw*.97,-.85,.75,t*.2+s,t,s+.3)*cov(d+.01)*dim);
 leave();}
void bolinopsis(vec2 q,vec2 c,float sz,float ang,float t,float s,float dim){
 vec2 l=rot(ang)*(q-c)/sz;if(abs(l.x)>.9||abs(l.y)>1.2)return;enter(sz);
 // a body with two wide oral lobes that open like hands
 float m=.5+.5*sin(t*.6+s);float body=sdEll(l-vec2(0.,.3),vec2(.32,.5));
 float lobes=sdEll(vec2(abs(l.x)-.25-.12*m,l.y+.35),vec2(.32+.05*m,.55));float d=min(body,lobes);
 glassN(d,normalize(l-vec2(0.,.1)),.15,vec3(.9,.95,1.05),vec3(.6,1.,.85),1.3,s,.55*dim);
 glow(combRows(l-vec2(0.,.0),.3+.25*ss(.2,-.5,l.y),-.8,.75,t*.15+s,t,s+.6)*cov(d+.01)*.8*dim);
 leave();}
void scene(vec2 q,float t){
 bolinopsis(q,vec2(-.7+.02*t,.25+.03*sin(t*.4)),.16,.25+.15*sin(t*.3),t,3.,.55);
 gooseberry(q,vec2(.72-.01*t,.3+.025*sin(t*.5)),.06,.3,t,5.,.6);
 beroe(q,vec2(.5+.04*sin(t*.3)-.015*t,-.12+.02*t),.2,-.5+.6*sin(t*.22),t,1.,1.);
 bolinopsis(q,vec2(.05+.03*t,-.42+.03*sin(t*.5)),.12,-.3,t,8.,.8);
 gooseberry(q,vec2(-.32+.015*t,-.05+.03*sin(t*.4)),.11,-.15+.1*sin(t*.35),t,2.,1.);
 gooseberry(q,vec2(-.05-.01*t,.38),.05,.6,t,9.,.55);
}

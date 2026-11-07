// 5 · Cadenes de salpes. Chains of salps: glass barrels with an amber heart, each one pulsing in turn so that a wave of beats runs
// along the chain. A long chain winds down as a spiral, a wheel of salps turns slowly, and a violet chain swims across behind.
// One salp in local units (its length is 1, along x): the barrel, its muscle bands and the amber nucleus.
void salp(vec2 l,float sz,float pulse,vec3 band,vec3 heart,float s,float dim){
 if(abs(l.x)>.7||abs(l.y)>.45)return;enter(sz);
 float w=.26*(1.-.18*pulse),rad=.6*w;vec2 dd=abs(l)-vec2(.5-.06*pulse,w)+rad;float d=length(max(dd,0.))+min(max(dd.x,dd.y),0.)-rad;
 glassN(d,normalize(l+1e-4),.12,mix(vec3(.85,.95,1.05),band,.2),mix(band,vec3(.7,.95,1.),.35),.9,s,.65*dim);
 float inside=cov(d);
 // muscle bands: arcs across the barrel
 float bx=l.x*6.+.3*s;float bands=ln(abs(fract(bx)-.5)/6.,.004)*inside*ss(.48,.3,abs(l.x));
 glow(band*bands*(.25+.35*pulse)*dim);
 // the nucleus: a glowing amber drop near the back
 vec2 nu=(l-vec2(-.3,-.03))/vec2(.12,.08);glow(heart*(exp(-dot(nu,nu))*(.7+.4*pulse)+.25*exp(-dot(nu,nu)*.15))*dim);
 leave();}
void scene(vec2 q,float t){
 // far behind: a violet chain swimming across, small
 for(int i=0;i<14;i++){float fi=float(i),u=fi*.07-.95+.035*t;vec2 c=vec2(u*1.1+.1,.33+.05*sin(u*5.+t*.5));
  float ang=atan(.25*cos(u*5.+t*.5),1.);vec2 l=rot(ang)*(q-c)/.06;salp(l,.06,beat(t-fi*.12,1.6,0.),vec3(.7,.5,1.),vec3(1.,.55,.3),fi,.45);}
 // the wheel: a ring of salps joined by their bellies, turning slowly (one turn in 30 s)
 vec2 W=vec2(.42+.06*sin(t*.2),-.12+.03*t*.5);float spin=t*.21;
 if(length(q-W)<.36)for(int i=0;i<12;i++){float fi=float(i),a=fi/12.*TAU+spin;vec2 c=W+vec2(cos(a),sin(a))*.2;
  vec2 l=rot(a+1.5708)*(q-c)/.13;l=vec2(l.y,l.x);salp(l,.13,beat(t+fi/12.*1.8,1.8,0.),vec3(.4,.9,1.),vec3(1.,.6,.2),fi+20.,1.);}
 // the spiral chain: it winds down from the top left, seen from the side as a helix; the front turns are bigger and brighter
 for(int i=0;i<22;i++){float fi=float(i),u=fi*.075+.09*t-.6;float ph=u*7.+t*.2;float z=.5+.5*sin(ph);
  vec2 c=vec2(-.55+.13*cos(ph)+u*.25,.55-u*.85);if(c.y<-.75||c.y>.75)continue;float sz=.08+.05*z;
  float ang=-1.2+.4*sin(ph);vec2 l=rot(ang)*(q-c)/sz;salp(l,sz,beat(t-fi*.1,1.5,0.),vec3(.35,.85,1.),vec3(1.,.5,.15),fi+40.,.55+.45*z);}
}

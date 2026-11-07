// 4 · Cinturons de Venus. Close up: long glass ribbons (Cestum veneris) glide by in slow undulating waves; along both edges their
// comb rows break the light into rainbows that run along the body. Violet tips; a third ribbon crosses far behind.
void ribbon(vec2 q,vec2 c,float ang,float len,float wid,float t,float spd,float s,float dim){
 vec2 l=rot(ang)*(q-c);if(abs(l.x)>len*.55||abs(l.y)>.25)return;
 // the centre line: a travelling wave that the ribbon swims with
 float k=TAU*1.3/len,ph=l.x*k-t*spd*2.2+s,A=.035+.02*sin(t*.5+s);float y=A*sin(ph)+.02*sin(l.x*k*2.3+t*1.1+s);
 float dy=A*k*cos(ph),u=l.x/(len*.5);
 float w=wid*(1.-pow(abs(u),6.))*(.85+.15*sin(ph+1.));float dc=(l.y-y)/sqrt(1.+dy*dy);
 float d=abs(dc)-w;vec2 n=normalize(vec2(-dy,1.))*sign(dc);
 glassN(d,n,wid*.8,vec3(.85,.9,1.05),mix(vec3(.45,.6,1.),vec3(.9,.4,1.),ss(.3,1.,abs(u))),1.6,s,.6*dim);
 // a faint violet inner canal along the middle and violet tips
 glow(vec3(.55,.3,1.)*ln(abs(dc),.0025)*.35*dim+vec3(.7,.3,1.)*cov(d)*ss(.6,1.,abs(u))*.25*dim);
 // the comb rows: rainbows running along both edges
 float edge=ln(abs(abs(dc)-w*.9),.003);float combs=pow(.5+.5*sin(l.x*140.-t*9.+s),2.);
 glow(pal(l.x*2.2-t*.35+s+(dc>0.?0.:.3))*(edge*(.4+1.6*combs)+cov(d)*.08)*ss(1.,.9,abs(u))*dim);}
void scene(vec2 q,float t){
 // far behind: a thin one crossing upwards
 ribbon(q,vec2(.95-.06*t,-.55+.045*t),-.45,1.,.012,t,.9,4.,.45);
 // two big ribbons, close: one from the right, high, one from the left, low; they pass each other
 ribbon(q,vec2(1.25-.11*t,.14+.04*sin(t*.3)),.12*sin(t*.2),1.5,.032,t,1.,0.,1.);
 ribbon(q,vec2(-1.3+.12*t,-.16+.05*sin(t*.25+1.)),-.08+.1*sin(t*.22),1.35,.028,t,1.1,2.,1.);
 // a short young one turning slowly in the middle distance
 ribbon(q,vec2(.1+.1*sin(t*.15),.36-.02*t),.6+.25*sin(t*.3),.55,.012,t,1.3,7.,.7);
}

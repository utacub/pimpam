// ---- The frame: camera, scene, style, decor, darkening ----
// Each scene file defines: void camera() (sets CAM, VH), void scene(vec2 w) (fills BG and FG for the world point w) and, for style B,
// sets INKD (distance to the nearest ink line, world units) and SHADE (0 lit .. 1 deep shadow, for the hatching).
vec3 aces(vec3 x){return sat3((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14));}
#if STYLE==1
// A watercolour wash of colour col on paper: its hue, at a lighter value (lo .. hi), granulating a little.
vec3 wash(vec3 col,vec3 paper,float lo,float hi){float l=max(lum(col),1e-4);float L=lo+(hi-lo)*pow(sat(l*1.8),.55);
 vec3 pig=sat3(col*(L/l));pig=mix(vec3(L),pig,.70);return paper*pig/max(lum(paper),.5)*(.95+.09*vn(P*uR.y*.55));}
#endif
void main(){
 P=(gl_FragCoord.xy-.5*uR)/uR.y;PX=1./uR.y;
 camera();if(uView.z>0.){CAM=uView.xy;VH=uView.z;}WPX=PX*VH;
 vec2 p=P;
#if STYLE==0
 // oil paint: each pixel takes the colour at the centre of its brush stroke; the strokes are short, laid in rows that follow a slow
 // direction field, staggered from row to row
 float ba=PI*(fbm2(P*1.3+7.)-.5)*1.3+.12;vec2 bd=vec2(cos(ba),sin(ba)),bn=vec2(-bd.y,bd.x);vec2 bq=vec2(dot(P,bd),dot(P,bn));
 const vec2 SZ=vec2(1./50.,1./150.);float row=floor(bq.y/SZ.y);float off=h11(row*1.7)*SZ.x;float coli=floor((bq.x+off)/SZ.x);
 vec2 sid=vec2(coli,row);vec2 cc=vec2((coli+.5)*SZ.x-off,(row+.5)*SZ.y)+(h22(sid)-.5)*SZ*vec2(.4,.7);vec2 inS=(bq-cc)/SZ;
 // a second layer of strokes, a little turned and offset, laid over the first where its dab (rounded ends) covers the pixel
 vec2 bd2=rot(.35)*bd,bn2=vec2(-bd2.y,bd2.x);vec2 bq2=vec2(dot(P,bd2),dot(P,bn2))+SZ*.5;
 float row2=floor(bq2.y/SZ.y);float off2=h11(row2*2.3+5.)*SZ.x;float col2=floor((bq2.x+off2)/SZ.x);vec2 sid2=vec2(col2,row2)+31.;
 vec2 cc2=vec2((col2+.5)*SZ.x-off2,(row2+.5)*SZ.y)+(h22(sid2)-.5)*SZ*vec2(.4,.7);vec2 in2=(bq2-cc2)/SZ;
 float dab2=ss(.55,.35,length(in2*vec2(1.,.62)))*step(.45,h21(sid2));
 vec2 p1=cc.x*bd+cc.y*bn,p2=(cc2.x-SZ.x*.5)*bd2+(cc2.y-SZ.y*.5)*bn2;
 p=mix(mix(p1,p2,dab2),P,.40);if(dab2>.5){inS=in2;sid=sid2;}
#endif
 vec2 w=toW(p);
 scene(w);
 vec3 bg=BG;vec3 base=uBase>.5?vec3(.86,.85,.82):vec3(0.);
#if STYLE==1
 // the plate: cream paper; the sky and the sea as pale washes of their colours, the pigment pooling a little at random
 vec3 pap=paperB(P*1.3);
 bg=mix(pap,wash(bg,pap,.66,.94),.50+.12*fbm(P*2.5))*(1.-.05*(fbm(P*7.)-.5));
 if(uDecor>1.5)bg=base;else if(uDecor>.5)bg=mix(base,bg,uOpacity);
 vec3 under=uDecor>1.5?vec3(.95,.93,.88):pap;
 vec3 fgc=FG.a>.001?FG.rgb/FG.a:vec3(0.);vec3 fw=wash(fgc,under,.16,.86);
 float bare=ss(.62,.85,lum(fgc))*ss(.25,.05,max(max(fgc.r,fgc.g),fgc.b)-min(min(fgc.r,fgc.g),fgc.b));
 fw*=1.-.10*ss(.0,.5,FG.a*(1.-FG.a)*4.);   // darker where a wash ends
 fw=mix(fw,vec3(.99,.985,.965),bare);         // white water is the paper left bare
 vec3 c=mix(bg,fw,FG.a);
 c=mix(c,INK,ss(WPX*1.5,WPX*.35,INKD)*.85);
 float hs=sat((SHADE-.55)*2.2);c=mix(c,INK*1.4,hatch(P*uR.y/900.,.75,110.,hs)*.40*FG.a);
 c=pow(sat3(c),vec3(1./1.04));
#else
 if(uDecor>1.5)bg=base;else if(uDecor>.5)bg=mix(base,bg,uOpacity);
 vec3 c=bg*(1.-FG.a)+FG.rgb;
#if STYLE==0
 // the paint: bristle marks along each stroke, darker seams between strokes; Sorolla's light: warm lights, violet-blue shadows,
 // clean saturated colour
 float br=vn(vec2(inS.x*2.5,inS.y*7.)+sid*7.3)*.55+vn(vec2(inS.x*6.,inS.y*19.)+sid*3.1)*.45;
 c*=.90+.20*br;c*=1.-.07*ss(.32,.5,abs(inS.y));
 c=aces(c*1.35);float l=lum(c);
 c=mix(c*vec3(.86,.86,1.10),c,ss(.10,.55,l));c=mix(c,c*vec3(1.07,1.02,.90),ss(.55,.95,l));
 c=mix(vec3(lum(c)),c,1.28);c=pow(sat3(c),vec3(1./1.85));
#else
 c=aces(c*1.4);c=pow(c,vec3(1./2.0));
 c*=1.-.22*pow(length(P*vec2(.75,1.)),2.2);
#endif
#endif
 c*=1.-uDark;
 OF=vec4(c,1.);
}

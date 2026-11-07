// El viatge en globus (CE43) · proves d'estil · el globus, la nena, el gos i les figures de terra, en cel·luloide (línia i tons plans).
// Tot es dibuixa a l'origen (x, y) = centre de la base de la cistella, a escala s (1 = cistella de 110 px d'ample).
// L'estil: {line:{width,jitter,alpha,col}|null, outline:bool}. «glow» (0..1) encén el cremador i el fanal del globus (vespre i nit).
// Depèn de pinzell.js (P, rgb, mix, lighten, darken, line, fill, tone, ell, smooth, rng, path).

export const GLOBUS_PAL={env:[[214,70,58],[244,226,190],[232,160,62]],band:[64,48,70],basket:[176,122,70],basketDark:[120,78,46],rope:[90,70,52],burner:[120,120,130]};

function cel(c,pts,col,style,o={}){const {close=true,shade=null,shadeK=.22,light=null,width=1}=o;fill(c,pts,col);
 if(shade)tone(c,shade,[80,50,70],shadeK);if(light)tone(c,light,[255,255,255],.28,'screen');
 if(style.line&&style.outline!==false)line(c,pts,{...style.line,width:style.line.width*width,close});}

// La forma de l'embolcall: una gota (ampla a 2/3 de l'alçada), de la boca (y-210·s) al cim (y-600·s).
export function envelope(s,x,y){const top=y-600*s,mouth=y-212*s,pts=[];const N=36;
 for(let i=0;i<=N;i++){const u=i/N;const yy=mouth+(top-mouth)*u;const w=u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u);pts.push([x-w*s,yy]);}
 for(let i=N;i>=0;i--){const u=i/N;const yy=mouth+(top-mouth)*u;const w=u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u);pts.push([x+w*s,yy]);}
 return smooth(pts,2,true);}
export function balloon(c,x,y,s,style,o={}){const {glow=0,burn=0,sunDir=-1,night=false,pal=GLOBUS_PAL,tilt=0}=o;
 c.save();c.translate(x,y);c.rotate(tilt);c.translate(-x,-y);
 const env=envelope(s,x,y),top=y-600*s,mouth=y-212*s;
 // cordes i cistella
 const bw=110*s,bh=72*s;const basket=[P(x-bw/2,y),P(x+bw/2,y),P(x+bw*.56,y-bh),P(x-bw*.56,y-bh)];
 const ropeTop=[[x-120*s,mouth-70*s],[x-40*s,mouth-70*s],[x+40*s,mouth-70*s],[x+120*s,mouth-70*s]];
 c.save();c.strokeStyle=rgb(pal.rope);c.lineWidth=Math.max(1.2,2.2*s);c.lineCap='round';
 for(const [i,[rx,ry]] of ropeTop.entries()){const bx=i<2?x-bw*.5+i*bw*.12:x+bw*.5-(3-i)*bw*.12;c.beginPath();c.moveTo(bx,y-bh*.96);c.lineTo(rx,ry);c.stroke();}c.restore();
 // el cremador i la flama (dins la boca)
 const bx=x,by=mouth+40*s;fill(c,[P(bx-14*s,by+16*s),P(bx+14*s,by+16*s),P(bx+12*s,by-12*s),P(bx-12*s,by-12*s)],pal.burner);
 if(style.line)line(c,[P(bx-14*s,by+16*s),P(bx+14*s,by+16*s),P(bx+12*s,by-12*s),P(bx-12*s,by-12*s)],{...style.line,close:true,width:style.line.width*.8});
 if(burn>0){const fh=(70+40*burn)*s;const fl=[P(bx-16*s,by-10*s),P(bx-22*s,by-fh*.45),P(bx-8*s,by-fh*.8),P(bx,by-fh),P(bx+9*s,by-fh*.78),P(bx+22*s,by-fh*.5),P(bx+16*s,by-10*s)];
  c.save();c.filter=`blur(${2*s}px)`;fill(c,smooth(fl,3,true),[255,150,40],.95);c.filter='none';c.restore();
  fill(c,smooth(fl.map(p=>[bx+(p[0]-bx)*.5,by+(p[1]-by)*.72]),3,true),[255,230,120]);fill(c,smooth(fl.map(p=>[bx+(p[0]-bx)*.22,by+(p[1]-by)*.42]),3,true),[255,255,230]);}
 // l'embolcall: gallons alterns, retallats dins la gota
 c.save();path(c,env);c.clip();
 const cols=pal.env;const gores=9;for(let g=0;g<gores;g++){const a0=-Math.PI/2+Math.PI*g/gores,a1=-Math.PI/2+Math.PI*(g+1)/gores;const x0=x+Math.sin(a0)*150*s*1.02,x1=x+Math.sin(a1)*150*s*1.02;
  const col=cols[g%cols.length];c.fillStyle=rgb(col);c.beginPath();
  // un galló: una banda vertical de forma de gota, entre dues «meridianes» (x = sin(a)·w(u))
  const N=28;for(let i=0;i<=N;i++){const u=i/N;const yy=mouth+(top-mouth)*u;const w=(u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;c.lineTo(x+Math.sin(a0)*w,yy);}
  for(let i=N;i>=0;i--){const u=i/N;const yy=mouth+(top-mouth)*u;const w=(u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;c.lineTo(x+Math.sin(a1)*w,yy);}
  c.closePath();c.fill();if(style.line&&style.outline!==false){c.strokeStyle=rgb(style.line.col||[58,40,30],.35*style.line.alpha);c.lineWidth=style.line.width*.5;c.stroke();}}
 // la banda del mig amb rombes
 const by0=y-430*s;c.fillStyle=rgb(pal.band);c.fillRect(x-200*s,by0-16*s,400*s,32*s);c.fillStyle=rgb([236,210,150]);for(let i=0;i<9;i++){const cx=x+(i-4)*40*s;c.beginPath();c.moveTo(cx,by0-10*s);c.lineTo(cx+9*s,by0);c.lineTo(cx,by0+10*s);c.lineTo(cx-9*s,by0);c.closePath();c.fill();}
 // la boca fosca
 fill(c,[P(x-48*s,mouth+2),P(x+48*s,mouth+2),P(x+30*s,mouth-40*s),P(x-30*s,mouth-40*s)],[50,30,36],.55);
 // ombra i llum (dos tons de cel·luloide): la cara oposada al sol en ombra, una llum vora el costat del sol
 const shadeSide=sunDir>0?-1:1;const sh=[];for(let i=0;i<=24;i++){const u=i/24;const yy=mouth+(top-mouth)*u;const w=(u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;sh.push([x+shadeSide*w*(.32+.2*Math.sin(u*Math.PI)),yy]);}
 for(let i=24;i>=0;i--){const u=i/24;const yy=mouth+(top-mouth)*u;const w=(u<.02?44:Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;sh.push([x+shadeSide*w*1.05,yy]);}
 tone(c,smooth(sh,2,true),night?[20,24,60]:[90,50,90],night?.5:.26);
 const li=[];for(let i=0;i<=16;i++){const u=.2+.6*i/16;const yy=mouth+(top-mouth)*u;const w=(Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;li.push([x-shadeSide*w*.62,yy]);}
 for(let i=16;i>=0;i--){const u=.2+.6*i/16;const yy=mouth+(top-mouth)*u;const w=(Math.pow(Math.sin(Math.pow(u,.62)*Math.PI),.9)*150+14*(1-u))*s;li.push([x-shadeSide*w*.8,yy]);}
 tone(c,smooth(li,2,true),[255,255,255],.22,'screen');
 if(night)tone(c,env,[30,36,80],.42);
 // el fanal: la flama il·lumina l'embolcall des de dins (vespre i nit)
 if(glow>0){const g=c.createRadialGradient(x,mouth-120*s,10*s,x,mouth-150*s,330*s);g.addColorStop(0,`rgba(255,190,90,${.95*glow})`);g.addColorStop(.35,`rgba(255,150,60,${.55*glow})`);g.addColorStop(1,'rgba(255,120,40,0)');
  c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-200*s,top,400*s,mouth-top+10);c.restore();}
 c.restore();
 if(style.line&&style.outline!==false)line(c,env,{...style.line,close:true,width:style.line.width*1.1});
 if(glow>0){const g=c.createRadialGradient(x,mouth-150*s,120*s,x,mouth-150*s,420*s);g.addColorStop(0,`rgba(255,170,70,${.28*glow})`);g.addColorStop(1,'rgba(255,140,60,0)');c.save();c.globalCompositeOperation='screen';c.fillStyle=g;c.fillRect(x-440*s,top-100*s,880*s,mouth-top+300*s);c.restore();}
 if(o.riders)o.riders();
 // la cistella (vímet) amb la vora
 cel(c,basket,pal.basket,style,{shade:[P(x,y),P(x+bw/2,y),P(x+bw*.56,y-bh),P(x,y-bh)]});
 c.save();path(c,basket);c.clip();c.strokeStyle=rgb(pal.basketDark,.55);c.lineWidth=Math.max(1,1.3*s);for(let i=1;i<7;i++){const yy=y-bh*i/7;c.beginPath();c.moveTo(x-bw,yy);c.lineTo(x+bw,yy);c.stroke();}
 for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(x+i*bw*.09,y);c.lineTo(x+i*bw*.1,y-bh);c.stroke();}c.restore();
 fill(c,[P(x-bw*.6,y-bh-6*s),P(x+bw*.6,y-bh-6*s),P(x+bw*.6,y-bh+4*s),P(x-bw*.6,y-bh+4*s)],pal.basketDark);
 if(style.line)line(c,[P(x-bw*.6,y-bh-6*s),P(x+bw*.6,y-bh-6*s),P(x+bw*.6,y-bh+4*s),P(x-bw*.6,y-bh+4*s)],{...style.line,close:true});
 c.restore();}

// La nena: cap rodó, boina, trena, jersei de ratlles i tirants; la mà dreta assenyala. «pose»: 'point' | 'wave' | 'look'.
export function girl(c,x,y,s,style,o={}){const {pose='point',face=true,sunDir=-1}=o;const L=style.line;
 const skin=[250,218,184],hair=[70,40,28],beret=[204,52,52],jersey=[246,240,220],stripe=[200,60,60],strap=[62,92,160];
 // tors (vist per sobre de la vora de la cistella)
 const tors=[P(x-26*s,y),P(x+26*s,y),P(x+24*s,y-40*s),P(x+10*s,y-56*s),P(x-10*s,y-56*s),P(x-24*s,y-40*s)];cel(c,smooth(tors,2,true),jersey,style);
 c.save();path(c,smooth(tors,2,true));c.clip();c.fillStyle=rgb(stripe);for(let i=0;i<3;i++)c.fillRect(x-30*s,y-12*s-i*14*s,60*s,5*s);c.restore();
 for(const sx of [-1,1]){const st=[P(x+sx*12*s,y),P(x+sx*18*s,y),P(x+sx*14*s,y-52*s),P(x+sx*8*s,y-52*s)];fill(c,st,strap);if(L)line(c,st,{...L,close:true,width:L.width*.7});}
 // braços
 if(pose==='point'){const arm=[P(x+18*s,y-36*s),P(x+40*s,y-60*s),P(x+62*s,y-84*s)];line(c,arm,{col:skin,width:11*s,alpha:1});if(L)line(c,arm,{...L,width:L.width*.8+11*s,alpha:L.alpha*.9});line(c,arm,{col:skin,width:9*s});
  ell(c,x+64*s,y-86*s,7*s,6*s);c.fillStyle=rgb(skin);c.fill();if(L){c.strokeStyle=rgb(L.col||[58,40,30],L.alpha);c.lineWidth=L.width*.8;c.stroke();}
  const arm2=[P(x-18*s,y-36*s),P(x-34*s,y-20*s),P(x-40*s,y-2*s)];if(L)line(c,arm2,{...L,width:L.width*.8+10*s,alpha:L.alpha*.9});line(c,arm2,{col:skin,width:9*s});}
 else if(pose==='wave'){const arm=[P(x+18*s,y-38*s),P(x+34*s,y-70*s),P(x+30*s,y-100*s)];if(L)line(c,arm,{...L,width:L.width*.8+10*s,alpha:L.alpha*.9});line(c,arm,{col:skin,width:9*s});
  ell(c,x+30*s,y-104*s,7*s,7*s);c.fillStyle=rgb(skin);c.fill();if(L){c.strokeStyle=rgb(L.col||[58,40,30],L.alpha);c.lineWidth=L.width*.8;c.stroke();}
  const arm2=[P(x-18*s,y-36*s),P(x-34*s,y-20*s),P(x-40*s,y-2*s)];if(L)line(c,arm2,{...L,width:L.width*.8+10*s,alpha:L.alpha*.9});line(c,arm2,{col:skin,width:9*s});}
 else{for(const sx of [-1,1]){const arm=[P(x+sx*18*s,y-36*s),P(x+sx*34*s,y-20*s),P(x+sx*40*s,y-2*s)];if(L)line(c,arm,{...L,width:L.width*.8+10*s,alpha:L.alpha*.9});line(c,arm,{col:skin,width:9*s});}}
 // coll i cap
 fill(c,[P(x-7*s,y-52*s),P(x+7*s,y-52*s),P(x+7*s,y-64*s),P(x-7*s,y-64*s)],skin);
 const hx=x,hy=y-86*s,hr=24*s;const head=blob(hx,hy,hr,3,.02,24,hr*1.04);
 // la trena, darrere
 const braid=[P(x+16*s,y-80*s),P(x+30*s,y-66*s),P(x+36*s,y-44*s)];if(L)line(c,braid,{...L,width:L.width*.8+9*s});line(c,braid,{col:hair,width:8*s});fill(c,[P(x+32*s,y-48*s),P(x+42*s,y-44*s),P(x+36*s,y-36*s)],[204,52,52]);
 cel(c,head,skin,style,{shade:[P(hx+hr*.2*-sunDir,hy-hr),P(hx-sunDir*hr*1.1,hy-hr),P(hx-sunDir*hr*1.1,hy+hr),P(hx+hr*.3*-sunDir,hy+hr)],shadeK:.14});
 // cabells: serrell i costats
 const bang=[P(hx-hr*1.02,hy-hr*.1),P(hx-hr*.95,hy-hr*.7),P(hx-hr*.5,hy-hr*1.02),P(hx+hr*.3,hy-hr*1.02),P(hx+hr*.95,hy-hr*.7),P(hx+hr*1.02,hy-hr*.05),P(hx+hr*.8,hy-hr*.4),P(hx+hr*.45,hy-hr*.55),P(hx+hr*.05,hy-hr*.5),P(hx-hr*.35,hy-hr*.62),P(hx-hr*.7,hy-hr*.42),P(hx-hr*.86,hy-hr*.05)];
 cel(c,smooth(bang,2,true),hair,style);
 // la boina
 const ber=[P(hx-hr*1.12,hy-hr*.58),P(hx-hr*.9,hy-hr*1.1),P(hx-hr*.2,hy-hr*1.34),P(hx+hr*.5,hy-hr*1.3),P(hx+hr*1.05,hy-hr*1.0),P(hx+hr*1.0,hy-hr*.62),P(hx+hr*.3,hy-hr*.9),P(hx-hr*.5,hy-hr*.92)];
 cel(c,smooth(ber,2,true),beret,style,{shade:[P(hx,hy-hr*1.5),P(hx+hr*1.2,hy-hr*1.5),P(hx+hr*1.2,hy-hr*.5),P(hx,hy-hr*.8)]});
 ell(c,hx+hr*.1,hy-hr*1.3,3*s,3*s);c.fillStyle=rgb(darken(beret,.3));c.fill();
 if(face){const lc=L?L.col||[58,40,30]:[58,40,30];
  // ulls, celles, boca, galtes
  for(const sx of [-1,1]){ell(c,hx+sx*hr*.36,hy+hr*.02,hr*.085,hr*.13);c.fillStyle=rgb(lc);c.fill();ell(c,hx+sx*hr*.36-hr*.03,hy-hr*.03,hr*.03,hr*.04);c.fillStyle='#fff';c.fill();
   line(c,[P(hx+sx*hr*.52,hy-hr*.2),P(hx+sx*hr*.36,hy-hr*.26),P(hx+sx*hr*.2,hy-hr*.2)],{col:lc,width:1.6*s,alpha:.9});
   ell(c,hx+sx*hr*.5,hy+hr*.3,hr*.16,hr*.1);c.fillStyle='rgba(240,120,110,.45)';c.fill();}
  line(c,[P(hx-hr*.2,hy+hr*.38),P(hx,hy+hr*.5),P(hx+hr*.22,hy+hr*.36)],{col:lc,width:1.8*s});}}

// El gos: cap blanc amb una orella marró, potes a la vora, llengua.
export function dog(c,x,y,s,style,o={}){const L=style.line;const white=[250,246,236],brown=[150,96,56],lc=L?L.col||[58,40,30]:[58,40,30];
 // potes a la vora
 for(const sx of [-1,1]){const paw=[P(x+sx*12*s,y+2*s),P(x+sx*24*s,y+2*s),P(x+sx*22*s,y-10*s),P(x+sx*12*s,y-10*s)];cel(c,smooth(paw,2,true),white,style);}
 // cap
 const hx=x,hy=y-30*s,hr=22*s;const head=blob(hx,hy,hr*1.1,5,.03,24,hr);cel(c,head,white,style,{shade:[P(hx,hy-hr),P(hx+hr*1.3,hy-hr),P(hx+hr*1.3,hy+hr),P(hx,hy+hr)],shadeK:.12});
 // taca i orelles
 const patch=blob(hx+hr*.55,hy-hr*.3,hr*.42,8,.1,16,hr*.5);c.save();path(c,head);c.clip();fill(c,patch,brown);c.restore();
 const earL=[P(hx-hr*.95,hy-hr*.55),P(hx-hr*1.25,hy-hr*.1),P(hx-hr*1.15,hy+hr*.45),P(hx-hr*.8,hy+hr*.2),P(hx-hr*.7,hy-hr*.3)];cel(c,smooth(earL,2,true),brown,style);
 const earR=[P(hx+hr*.9,hy-hr*.6),P(hx+hr*1.3,hy-hr*.85),P(hx+hr*1.2,hy-hr*.1),P(hx+hr*.85,hy)];cel(c,smooth(earR,2,true),white,style);
 // morro, nas, ulls, llengua
 ell(c,hx,hy+hr*.45,hr*.5,hr*.32);c.fillStyle=rgb(white);c.fill();if(L){c.strokeStyle=rgb(lc,L.alpha);c.lineWidth=L.width*.8;c.stroke();}
 ell(c,hx,hy+hr*.28,hr*.17,hr*.12);c.fillStyle=rgb(lc);c.fill();
 const tongue=[P(hx-hr*.14,hy+hr*.6),P(hx+hr*.14,hy+hr*.6),P(hx+hr*.14,hy+hr*.95),P(hx,hy+hr*1.05),P(hx-hr*.14,hy+hr*.95)];cel(c,smooth(tongue,2,true),[236,110,120],style,{width:.7});
 for(const sx of [-1,1]){ell(c,hx+sx*hr*.38,hy-hr*.08,hr*.09,hr*.12);c.fillStyle=rgb(lc);c.fill();ell(c,hx+sx*hr*.38-hr*.03,hy-hr*.13,hr*.03,hr*.035);c.fillStyle='#fff';c.fill();}}

// Un tren petit sobre un viaducte de pedra: arcs, locomotora verda, tres vagons, fum.
export function viaduct(c,x0,x1,y,h,pal,style,o={}){const {arches=5,line:L=style.line}=o;const w=x1-x0,aw=w/arches;const deck=[P(x0,y-h),P(x1,y-h),P(x1,y-h+h*.14),P(x0,y-h+h*.14)];
 // la pedra amb els arcs buits (regla parell-senar), i a dins, l'ombra de la part baixa i el gra dels carreus
 const stone=()=>{c.beginPath();c.rect(x0,y-h,w,h+2);for(let i=0;i<arches;i++){const cx=x0+aw*(i+.5),r=aw*.36;c.moveTo(cx-r,y+2);c.lineTo(cx-r,y-h*.45);c.arc(cx,y-h*.45,r,Math.PI,0);c.lineTo(cx+r,y+2);c.closePath();}};
 c.save();stone();c.fillStyle=rgb(pal.stone);c.fill('evenodd');stone();c.clip('evenodd');
 tone(c,[P(x0,y-h*.5),P(x1,y-h*.5),P(x1,y+2),P(x0,y+2)],[60,50,80],.18);
 const r0=rng(17);for(let i=0;i<arches*7;i++){c.globalAlpha=.16;c.fillStyle=rgb(r0()<.5?lighten(pal.stone,.25):darken(pal.stone,.25));c.fillRect(x0+r0()*w,y-h+r0()*h,8+r0()*16,3+r0()*4);}
 c.globalAlpha=1;for(let i=0;i<arches;i++){const cx=x0+aw*(i+.5),r=aw*.36;c.save();c.filter='blur(3px)';c.strokeStyle=rgb([40,30,60],.35);c.lineWidth=aw*.08;c.beginPath();c.arc(cx,y-h*.45,r+aw*.04,Math.PI*1.05,Math.PI*1.95);c.stroke();c.restore();}
 c.restore();
 fill(c,deck,pal.deck||darken(pal.stone,.2));
 if(L){line(c,[P(x0,y-h),P(x1,y-h)],{...L,width:L.width*.9});for(let i=0;i<arches;i++){const cx=x0+aw*(i+.5),r=aw*.36;c.save();c.strokeStyle=rgb(L.col||[58,40,30],L.alpha*.8);c.lineWidth=L.width*.8;c.beginPath();c.moveTo(cx-r,y);c.lineTo(cx-r,y-h*.45);c.arc(cx,y-h*.45,r,Math.PI,0);c.lineTo(cx+r,y);c.stroke();c.restore();}}}
export function train(c,x,y,s,style,o={}){const {cars=3,smoke=true,lit=false}=o;const L=style.line;const green=[60,120,80],red=[190,60,50],cream=[240,228,190],dark=[40,36,40];
 let cx=x;const loco=[P(cx,y),P(cx+70*s,y),P(cx+70*s,y-34*s),P(cx+40*s,y-34*s),P(cx+40*s,y-48*s),P(cx+16*s,y-48*s),P(cx+16*s,y-24*s),P(cx,y-24*s)];cel(c,loco,green,style);
 fill(c,[P(cx+42*s,y-34*s),P(cx+70*s,y-34*s),P(cx+70*s,y-40*s),P(cx+42*s,y-40*s)],red);
 fill(c,[P(cx+4*s,y-24*s),P(cx+12*s,y-24*s),P(cx+12*s,y-44*s),P(cx+4*s,y-44*s)],dark);if(L)line(c,[P(cx+4*s,y-24*s),P(cx+12*s,y-24*s),P(cx+12*s,y-44*s),P(cx+4*s,y-44*s)],{...L,close:true,width:L.width*.7});
 c.fillStyle=rgb(lit?[255,220,140]:cream);c.fillRect(cx+48*s,y-32*s,14*s,10*s);
 for(const wx of [14,36,58]){ell(c,cx+wx*s,y,7*s,7*s);c.fillStyle=rgb(dark);c.fill();}
 cx+=78*s;for(let i=0;i<cars;i++){const car=[P(cx,y),P(cx+60*s,y),P(cx+60*s,y-30*s),P(cx,y-30*s)];cel(c,car,i%2?green:red,style);c.fillStyle=rgb(lit?[255,220,140]:cream);for(let k=0;k<3;k++)c.fillRect(cx+(8+k*18)*s,y-26*s,11*s,9*s);
  for(const wx of [12,48]){ell(c,cx+wx*s,y,6*s,6*s);c.fillStyle=rgb(dark);c.fill();}cx+=66*s;}
 if(smoke){const r=rng(7);for(let i=0;i<5;i++){const px=x+8*s-i*26*s-r()*10*s,py=y-56*s-i*22*s-r()*8*s,pr=(10+i*6)*s;c.save();c.filter=`blur(${1.5*s}px)`;c.fillStyle=`rgba(250,246,240,${.85-i*.14})`;c.beginPath();c.arc(px,py,pr,0,Math.PI*2);c.fill();c.restore();}}}
// Ovelles en un prat: cossos blancs rodons, cara fosca, potes.
export function sheep(c,x,y,s,style,o={}){const L=style.line;const wool=[248,244,232],face=[50,40,40];const body=blob(x,y-14*s,18*s,11,.12,18,12*s);cel(c,body,wool,style,{shade:[P(x,y-30*s),P(x+30*s,y-30*s),P(x+30*s,y),P(x,y)],shadeK:.12});
 for(const lx of [-9,-3,5,11]){c.save();c.strokeStyle=rgb(face);c.lineWidth=2.2*s;c.beginPath();c.moveTo(x+lx*s,y-6*s);c.lineTo(x+lx*s,y+2*s);c.stroke();c.restore();}
 const hx=x+(o.flip?-18:18)*s,hy=y-18*s;ell(c,hx,hy,7*s,6*s);c.fillStyle=rgb(face);c.fill();ell(c,hx+(o.flip?2:-2)*s,hy-6*s,4*s,2.5*s,.6);c.fillStyle=rgb(wool);c.fill();}
// Un pagès que saluda des del camp, petit.
export function farmer(c,x,y,s,style,o={}){const L=style.line;const skin=[240,200,160],shirt=[86,130,170],hat=[214,176,96];
 const legs=[P(x-7*s,y),P(x+7*s,y),P(x+7*s,y-18*s),P(x-7*s,y-18*s)];cel(c,legs,[80,70,90],style);const tors=[P(x-9*s,y-18*s),P(x+9*s,y-18*s),P(x+8*s,y-38*s),P(x-8*s,y-38*s)];cel(c,tors,shirt,style);
 const arm=[P(x+8*s,y-34*s),P(x+16*s,y-46*s),P(x+14*s,y-58*s)];if(L)line(c,arm,{...L,width:L.width*.6+5*s});line(c,arm,{col:skin,width:4.5*s});
 ell(c,x,y-45*s,7*s,7*s);c.fillStyle=rgb(skin);c.fill();if(L){c.strokeStyle=rgb(L.col||[58,40,30],L.alpha);c.lineWidth=L.width*.7;c.stroke();}
 const h=[P(x-11*s,y-49*s),P(x+11*s,y-49*s),P(x+6*s,y-51*s),P(x+5*s,y-58*s),P(x-5*s,y-58*s),P(x-6*s,y-51*s)];cel(c,h,hat,style,{width:.7});}

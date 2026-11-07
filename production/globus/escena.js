// El viatge en globus (CE43) · proves d'estil · l'escena: la vall vista des del globus, per moment (alba, migdia, posta, nit),
// altura (0 = sobre els arbres, 1 = entre els núvols) i estil. Es dibuixa a 1280 × 800 (el full), ampliat a la pantalla.
// Depèn de pinzell.js i globus.js.
export const MOMENTS={
 alba:{sky:[[0,[112,128,186]],[.45,[190,182,212]],[.8,[244,214,178]],[1,[252,232,200]]],haze:[[236,212,214],.55],sun:{x:1060,dy:-46,r:34,col:[255,236,190],glow:[255,200,140],gr:5},
  cloud:{shade:[170,150,186],base:[232,216,222],light:[255,242,230],rim:[255,228,190]},far:[160,150,196],far2:[134,132,178],near:[112,122,150],snow:[250,240,244],
  hills:[124,152,98],fields:[[150,170,92],[176,164,84],[126,154,90],[198,180,100],[140,160,96]],hedge:[90,110,70],meadow:[112,146,82],tree:{shade:[50,76,56],base:[76,112,70],light:[118,150,86],dab:[152,182,104],trunk:[70,50,38]},
  village:{wall:[240,228,206],roof:[182,86,64],lit:false},river:{base:[206,202,216],light:[252,240,224],bank:[120,124,112]},stone:[196,184,168],mist:[246,236,232],line:[62,44,38],sunDir:1,glow:0,night:false,birds:[70,56,56],shadowA:.1},
 migdia:{sky:[[0,[48,108,196]],[.5,[108,166,228]],[.85,[190,220,236]],[1,[214,232,240]]],haze:[[226,236,240],.4],sun:{x:980,dy:-999,y:84,r:30,col:[255,252,228],glow:[255,250,200],gr:5},
  cloud:{shade:[150,160,192],base:[240,242,246],light:[255,255,255],rim:null},far:[140,162,204],far2:[112,138,178],near:[96,124,150],snow:[252,252,255],
  hills:[96,156,78],fields:[[118,172,70],[190,176,70],[96,150,72],[224,200,96],[140,160,90],[160,186,80]],hedge:[52,96,50],meadow:[92,150,66],tree:{shade:[30,78,46],base:[58,122,56],light:[110,170,70],dab:[164,208,92],trunk:[70,50,38]},
  village:{wall:[246,238,220],roof:[198,86,60],lit:false},river:{base:[96,150,196],light:[224,242,250],bank:[60,96,70]},stone:[200,190,172],mist:[240,246,250],line:[56,40,32],sunDir:1,glow:0,night:false,birds:[56,46,46],shadowA:.14},
 posta:{sky:[[0,[84,74,140]],[.42,[196,118,118]],[.78,[252,184,112]],[1,[255,210,140]]],haze:[[255,196,140],.5],sun:{x:236,dy:6,r:40,col:[255,226,160],glow:[255,160,90],gr:6},
  cloud:{shade:[150,90,124],base:[236,150,132],light:[255,214,160],rim:[255,236,190]},far:[132,96,152],far2:[104,74,124],near:[86,62,104],snow:[255,220,200],
  hills:[128,104,86],fields:[[186,140,78],[206,160,90],[150,118,80],[166,126,96],[176,150,86]],hedge:[90,56,70],meadow:[138,110,74],tree:{shade:[40,28,52],base:[72,52,66],light:[150,98,70],dab:[200,140,90],trunk:[40,30,40]},
  village:{wall:[232,186,146],roof:[150,62,54],lit:true},river:{base:[232,160,110],light:[255,226,150],bank:[100,64,70]},stone:[176,140,120],mist:[255,210,170],line:[50,34,40],sunDir:-1,glow:.55,night:false,birds:[50,34,40],shadowA:.16},
 nit:{sky:[[0,[10,16,46]],[.5,[26,38,86]],[.85,[66,80,128]],[1,[80,94,138]]],haze:[[90,104,150],.4],sun:{x:1000,dy:-999,y:120,r:26,col:[242,242,226],glow:[180,190,230],gr:5},
  cloud:{shade:[40,50,92],base:[68,84,132],light:[108,126,172],rim:[150,170,212]},far:[38,48,90],far2:[30,38,74],near:[24,32,62],snow:[150,160,200],
  hills:[32,50,58],fields:[[34,56,60],[42,66,60],[28,46,54],[40,60,64],[36,58,66]],hedge:[16,28,32],meadow:[30,48,52],tree:{shade:[10,20,28],base:[20,36,40],light:[36,60,58],dab:[60,86,80],trunk:[16,20,26]},
  village:{wall:[64,70,100],roof:[40,36,62],lit:true},river:{base:[40,60,100],light:[130,148,196],bank:[20,30,44]},stone:[70,78,100],mist:[80,96,140],line:[18,14,26],sunDir:-1,glow:1,night:true,birds:null,shadowA:0}};
export const STYLES={
 A:{name:'Guaix i cel·luloide',line:{width:2.2,jitter:0,alpha:1},soft:2.5,grain:.6,paper:0,outline:true,bgLine:0},
 B:{name:'Llapis i aquarel·la',line:{width:1.7,jitter:.9,alpha:.86},soft:1.4,grain:1,paper:1,outline:true,bgLine:.45,wash:.86},
 C:{name:'Pintura sense línia',line:null,soft:4,grain:.9,paper:0,outline:false,bgLine:0}};
const L=(a,b,t)=>a+(b-a)*t;
// Una cresta de serralada: punts de -40 a 1320; n trams, sm suavitzat (2 = cims aguts, 5 = turons tous).
function ridge(base,amp,seed,n=14,sm=5){const pts=[];for(let i=0;i<=n;i++){const u=i/n;const x=-40+u*1360;const k=Math.pow(noise(u*4.1+seed,0,seed)*.6+noise(u*11+seed,1,seed+2)*.4,1.5);pts.push([x,base-amp*(.15+k*1.3)*(1-Math.abs(u-.5)*.3)]);}
 return smooth(pts,sm);}
const mtnPal=(col,snow,night)=>({base:col,shade:darken(col,night?.35:.3),light:lighten(col,night?.15:.4),snow});
function skyline(c,W,H,M,hz,alt,style){const S=style;
 // 1. el cel, l'astre, els estels
 sky(c,W,H,M.sky,[hz-240,hz+20,M.haze[0],M.haze[1]]);if(M.night)stars(c,W,hz-60,260,9,.95);
 const sy=M.sun.dy>-900?hz+M.sun.dy:M.sun.y;sun(c,M.sun.x,sy,M.sun.r,M.sun.col,M.sun.glow,M.sun.gr);
 // 2. núvols llunyans: pocs, de mides diferents, baixos sobre la serralada
 const r=rng(21);for(let i=0;i<4;i++){const x=120+i*330+r()*120,y=hz-70-r()*80,w=90+r()*220,h=24+r()*22;cumulus(c,x,y,w,h,30+i,{...M.cloud,rim:null},{soft:S.soft*1.2,sunDir:M.sunDir});}
 for(let i=0;i<3;i++)wisp(c,200+i*420,hz-130-r()*60,420,24,40+i,M.cloud.light,.4,16);
 // 3. les serralades amb cares d'ombra i de llum, de lluny a prop; neu només als cims alts de la primera; calitja a la base de cada una
 const amp=L(140,80,alt);const R1=ridge(hz+8,amp,3,16,3),R2=ridge(hz+30,amp*.6,8,14,4),R3=ridge(hz+60,amp*.35,13,12,5);
 mountains(c,R1,hz+60,mtnPal(M.far,M.snow,M.night),{sunDir:M.sunDir,snowAbove:hz-amp*.9,soft:S.soft*.5,haze:[M.mist,.45]});
 mountains(c,R2,hz+90,mtnPal(M.far2,M.snow,M.night),{sunDir:M.sunDir,soft:S.soft*.45,haze:[M.mist,.35]});
 mountains(c,R3,hz+120,mtnPal(M.near,M.snow,M.night),{sunDir:M.sunDir,soft:S.soft*.4,haze:[M.mist,.25],facets:false});
 treeLine(c,R3.filter((p,i)=>i%3===0),L(7,4,alt),81,{...M.tree,shade:M.near,base:mix(M.near,M.tree.base,.35),light:mix(M.near,M.tree.light,.4),dab:null},{});
 if(S.bgLine){line(c,R1,{col:M.line,width:1,alpha:S.bgLine*.6,jitter:.8,seed:11});line(c,R2,{col:M.line,width:1,alpha:S.bgLine*.5,jitter:.8,seed:12});}
 // boirina sobre la serralada propera
 c.save();const g=c.createLinearGradient(0,hz-20,0,hz+120);g.addColorStop(0,rgb(M.mist,0));g.addColorStop(1,rgb(M.mist,.5*(1-alt*.4)));c.fillStyle=g;c.fillRect(0,hz-20,W,140);c.restore();}
function land(c,W,H,M,hz,alt,style,scene){const S=style;const midH=L(250,150,alt),nearY=hz+midH;const k=L(1,.6,alt); // k: mida de les coses de terra
 // 4. la plana: turons tous i, a sobre, els camps en retalls (graella en perspectiva, tanques, solcs)
 const top=smooth([P(-40,hz+60),P(200,hz+52),P(500,hz+64),P(800,hz+50),P(1100,hz+62),P(1320,hz+56)],5);
 const plain=[...top,P(1320,nearY+40),P(-40,nearY+40)];gouache(c,plain,M.hills,{seed:9,strokes:16,soft:S.soft*.5});
 patchwork(c,[P(-40,hz+66),P(1320,hz+66),P(1320,nearY+40),P(-40,nearY+40)],M.fields,17,{rows:Math.round(L(8,6,alt)),hedge:M.hedge,vanish:.3,furrow:darken(M.hills,.35),road:[1010,M.village.wall,960]});
 // 5. el riu, del fons a la vora de sota (s'eixampla), amb bosquina a les ribes
 const axis=[P(760,hz+62),P(700,hz+110),P(640,hz+150),P(600,hz+200),P(560,nearY+10),P(500,nearY+80),P(420,H+40)];
 const rv=river(c,axis,[6*k,12*k,22*k,36*k,58*k,96*k,150*k],M.river,5);
 treeLine(c,rv.L.filter((p,i)=>i%4===0&&p[1]>hz+90&&p[1]<nearY+30),L(16,9,alt),71,M.tree,{});
 // 6. el poble: cases agrupades al voltant del campanar, de dues mides, amb una clapa de terra clara i uns arbres
 const vx=940,vy=hz+midH*.52,vs=.62*k;const r=rng(23);
 softShape(c,blob(vx+10*vs,vy+22*vs,150*vs,3,.2,24,46*vs),mix(M.hills,M.village.wall,.35),8,.7);
 const hs=[];for(let i=0;i<13;i++){const row=i<5?0:i<10?1:2;const col=row===0?i:row===1?i-5:i-10;const n=row===0?5:row===1?5:3;const hx=vx-(n-1)*34*vs+col*68*vs+(r()-.5)*22*vs+(row-1)*8*vs,hy=vy-30*vs+row*34*vs+(r()-.5)*8*vs;hs.push([hx,hy,(40+r()*22)*vs,(32+r()*16)*vs,i]);}
 hs.sort((a,b)=>a[1]-b[1]);
 for(const [hx,hy,w,h,i] of hs){if(i===6){tower(c,hx,hy,26*vs,78*vs,M.village,{lit:M.village.lit,line:S.line?{...S.line,width:S.line.width*.5}:null});continue;}
  house(c,hx,hy,w,h,{...M.village,lit:M.village.lit&&r()>.3},{line:S.line?{...S.line,width:S.line.width*.5}:null,seed:i,sunDir:M.sunDir,roofK:.36+r()*.14});
  if(i%5===2)treeMass(c,hx+w*.7,hy+4*vs,38*vs,40*vs,i+80,M.tree,{soft:S.soft*.3,lumps:3,sunDir:M.sunDir});}
 // arbres de la plana (més petits al fons)
 for(let i=0;i<16;i++){const x=(i*97+41)%1320-20,y=hz+95+((i*53)%Math.max(40,midH-70)),d=(y-hz)/midH,s=L(.32,.2,alt)*(.6+d*.9)*(.7+r()*.6);if(Math.abs(x-vx)<160*vs&&Math.abs(y-vy)<60*vs)continue;treeMass(c,x,y,70*s,60*s,i+40,M.tree,{soft:S.soft*.4,sunDir:M.sunDir,lumps:3});}
 // 7. ombres dels núvols sobre la plana, i la calitja de distància (més densa cap a l'horitzó)
 if(M.shadowA){c.save();c.globalCompositeOperation='multiply';c.filter='blur(14px)';c.fillStyle=rgb([40,40,90],M.shadowA);for(const [x,y,w] of [[260,hz+120,300],[820,hz+170,360],[1180,hz+100,240]]){c.beginPath();c.ellipse(x,y,w,w*.22,-.1,0,Math.PI*2);c.fill();}c.restore();}
 c.save();const g0=c.createLinearGradient(0,hz+50,0,nearY);g0.addColorStop(0,rgb(M.mist,.42*(1-alt*.3)));g0.addColorStop(1,rgb(M.mist,0));c.fillStyle=g0;c.fillRect(0,hz+50,W,nearY-hz-50);c.restore();
 // 8. la terra propera (només quan el globus és baix): prat, arbres grans, el viaducte i el tren, les ovelles
 if(alt<.62){const near=[P(-40,nearY-10),P(1320,nearY-30),P(1320,H+40),P(-40,H+40)];gouache(c,near,M.meadow,{seed:31,strokes:18,soft:S.soft*.6,light:.1,dark:.1,long:.6});
  const ns=L(1.5,.7,alt);
  if(scene==='tren'){viaduct(c,620,1320,nearY+150*ns*.6,110*ns*.6,{stone:M.stone},S,{arches:6});train(c,700,nearY+150*ns*.6-110*ns*.6,.72*ns*.6,S,{lit:M.night||M.village.lit});}
  if(scene==='ovelles'){for(let i=0;i<7;i++){const x=620+(i*131)%620,y=nearY+60+(i*47)%150;sheep(c,x,y,ns*(.55+(y-nearY)/150*.5),S,{flip:i%3===0});}farmer(c,980,nearY+200,ns*.95,S);}
  for(let i=0;i<7;i++){const x=-60+i*230+(i%2)*60,y=H+20-(i%3)*18,h=(150+(i*37)%90)*ns*.9;if(x>560&&x<1250&&y>nearY+40)continue;treeMass(c,x,y,h*1.1,h,i+60,M.tree,{soft:S.soft*.5,lumps:4,sunDir:M.sunDir});}
  for(const [x,h] of [[300,210],[1180,230]])poplar(c,x,H+10,34*ns,h*ns,x,M.tree,M.sunDir);}
 else{ // 8b. d'alt estant: la plana es fon en la calitja i hi ha un mar de núvols a sota
  c.save();const g=c.createLinearGradient(0,hz,0,H);g.addColorStop(0,rgb(M.mist,.1));g.addColorStop(1,rgb(M.mist,.6));c.fillStyle=g;c.fillRect(0,hz,W,H-hz);c.restore();
  const r2=rng(77);for(let i=0;i<6;i++){const x=-60+i*270+r2()*100,y=nearY+50+r2()*120,w=260+r2()*260,h=70+r2()*50;cumulus(c,x,y,w,h,90+i,M.cloud,{soft:S.soft*1.5,sunDir:M.sunDir});}}}
// L'escena sencera. o: {moment, alt, style, decor:'full'|'dim'|'none', base:'black'|'white', scene:'tren'|'ovelles', pose, burn}
export function paintScene(c,W,H,o){const {moment='migdia',alt=.5,style=STYLES.A,decor='full',base='black',scene='tren',pose='point',burn=null}=o;const M=MOMENTS[moment];const S=style;
 const hz=H*L(.40,.60,alt);const dark=decor==='none'&&base==='black';
 c.save();c.setTransform(1,0,0,1,0,0);
 if(decor==='none'){c.fillStyle=base==='white'?'#fff':'#000';c.fillRect(0,0,W,H);}
 else{skyline(c,W,H,M,hz,alt,S);land(c,W,H,M,hz,alt,S,scene);if(decor==='dim'){c.fillStyle=base==='white'?'rgba(255,255,255,.62)':'rgba(0,0,0,.62)';c.fillRect(0,0,W,H);}}
 // ocells: un estol a mitja altura, orenetes a prop dels arbres quan és baix
 const bcol=dark?[230,224,210]:M.birds;if(bcol){if(alt>.3)flock(c,800,hz-180*alt-40,9,8,5,bcol,1);else{for(let i=0;i<5;i++)bird(c,700+i*90,hz+120+(i%2)*30,7,i*1.3,bcol,1.3);}}
 // el globus amb la nena i el gos
 const s=.72,bx=430,by=575;const burning=burn===null?(M.glow>0||alt>.6):burn;
 const styleG=dark?{...S,line:S.line?{...S.line,col:[236,228,214]}:null}:S;
 balloon(c,bx,by,s,styleG,{glow:M.glow,burn:burning?1:0,sunDir:M.sunDir,night:M.night,riders:()=>{girl(c,bx-22*s/.72,by-72*s+2,s,styleG,{pose,sunDir:M.sunDir});dog(c,bx+36*s/.72,by-72*s+4,s,styleG,{});}});
 // núvols que passen per davant quan és alt
 if(decor==='full'&&alt>.6){wisp(c,W*.5,hz-120,W*1.2,60,99,M.cloud.light,.5,22);cumulus(c,1180,420,420,110,120,{...M.cloud,base:M.cloud.light,light:[255,255,255]},{soft:S.soft*2,sunDir:M.sunDir});}
 // paper (estil B)
 if(S.paper){c.save();c.globalCompositeOperation='multiply';mottle(c,0,0,W,H,.045,12,5,[120,100,70]);c.restore();c.save();c.globalCompositeOperation='screen';mottle(c,0,0,W,H,.03,14,8,[255,250,236]);c.restore();}
 c.restore();}
// La fitxa de personatges: el globus gran, la nena en tres postures i el gos, sobre paper clar.
export function paintSheet(c,W,H,style){c.save();c.setTransform(1,0,0,1,0,0);c.fillStyle='#efe8da';c.fillRect(0,0,W,H);mottle(c,0,0,W,H,.025,12,2);
 balloon(c,300,760,1.05,style,{glow:0,burn:1,sunDir:1,night:false,riders:()=>{girl(c,268,686,1.05,style,{pose:'point',sunDir:1});dog(c,352,688,1.05,style,{});}});
 girl(c,760,470,1.9,style,{pose:'wave',sunDir:1});girl(c,1000,470,1.9,style,{pose:'look',sunDir:1});dog(c,1160,470,1.9,style,{});
 for(let i=0;i<3;i++)bird(c,700+i*80,120+(i%2)*30,14,i*1.7,[60,44,38],2.2);
 train(c,620,760,1.1,style,{lit:false});c.restore();}

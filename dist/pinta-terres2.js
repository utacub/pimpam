// Pinta el món (EN25), 0.38: the ink sheets 2 «La costa» and 3 «L’alta muntanya» (see pinta-terres.js for the shape of a sheet).
import {PTK,ptWinRects} from './pinta-eines.js';
const ptZ2=(id,poly,seed,o={})=>({id,poly,seed,reserves:o.reserves||[],accents:[],sils:[],...o});
// La costa: the sea under a long horizon, a rocky headland with the lighthouse on the right, a white fishing village on its hill on
// the left, stone pines on the dune and the beach in front.
export function ptTerraCosta(){const {P,smooth,circle,blob,rev,rnd,scallop,hatch,Ink,house,church,stonePine,bush,cloud,cloudShape,boat,rowboat,lighthouse,bird}=PTK;
 const HOR=332,CLIFF=smooth([P(740,HOR),P(800,300),P(860,272),P(930,256),P(1010,248),P(1100,246),P(1190,252),P(1300,266)],6);
 const FOOT=smooth([P(760,HOR+4),P(880,348),P(1000,356),P(1120,364),P(1220,368),P(1300,372)],5);
 const SHORE=smooth([P(430,562),P(560,552),P(700,536),P(860,520),P(1020,502),P(1160,486),P(1300,472)],6);
 const HILL=smooth([P(-20,418),P(80,392),P(200,384),P(300,398),P(380,428),P(430,480),P(430,562),P(400,610),P(300,642),P(140,652),P(-20,656)],4);
 const DUNE=[P(900,610),P(950,540),P(1020,486),P(1110,462),P(1210,462),P(1300,490),P(1300,650),P(1120,668),P(960,660)];
 const CLOUDS=[[240,120,250,80,21],[640,96,170,56,22],[980,140,220,66,23],[1180,86,140,46,24]];
 const zones=[
  ptZ2('cel',[P(-20,-20),P(1300,-20),P(1300,266),...rev(CLIFF),P(740,HOR),P(-20,HOR)],P(500,120),{reserves:CLOUDS.map(([x,y,w,h,s])=>cloudShape(x,y,w,h,s))}),
  ptZ2('fons',[...CLIFF,P(1300,372),...rev(FOOT)],P(1040,300),{reserves:[[P(1050,250),P(1110,250),P(1110,160),P(1050,160)]]}),
  ptZ2('aigua',[P(-20,HOR),P(740,HOR),...FOOT,P(1300,472),...rev(SHORE),P(430,562),P(300,572),P(-20,580)],P(640,440)),
  ptZ2('arbres',DUNE,P(1120,560)),
  ptZ2('poble',HILL,P(220,520)),
  ptZ2('camp',[P(-20,656),P(140,652),P(300,642),P(400,610),P(430,562),...SHORE,P(1300,840),P(-20,840)],P(700,720))];
 const [cel,fons,aigua,arbres,poble,camp]=zones,st=Ink(),A={};
 for(const [x,y,w,h,s] of CLOUDS){cloud(st,x,y,w,h,s);cel.accents.push(scallop(blob(x,y+h*.24,w/2*.9,s+1,.1,20,h*.2),h*.04,s+1,3));}
 bird(st,560,150,10);bird(st,600,168,9);bird(st,1000,210,8);
 st([P(-20,HOR),P(740,HOR)],1.2);
 st(CLIFF,2.6);st(FOOT,1.6);for(let i=0;i<7;i++){const x=790+i*72;st(smooth([P(x,CLIFF.reduce((m,p)=>Math.abs(p[0]-x)<Math.abs(m[0]-x)?p:m)[1]+10),P(x-8+(i%2)*14,FOOT.reduce((m,p)=>Math.abs(p[0]-x)<Math.abs(m[0]-x)?p:m)[1]-6)],4),1.1,'hatch');}
 st.add(hatch([P(760,HOR+4),P(900,330),P(1300,360),P(1300,372),P(1000,356)],.1,7,31,.8,.4));
 const LH=lighthouse(st,1080,250,30,110);fons.sils.push(LH.sil);fons.accents.push(...LH.acc);
 for(let i=0;i<14;i++){const y=HOR+16+i*i*1.4+i*6,n=3+Math.floor(i/3);for(let j=0;j<n;j++){const x=-20+j*(1320/n)+(i%2)*60+(i*37)%50;if(y<560)st(smooth([P(x,y),P(x+24,y-3),P(x+48,y)],4),.9,'hatch');}}
 aigua.accents.push(smooth([P(500,HOR+40),P(700,HOR+36),P(740,HOR+46),P(520,HOR+50)],3,true));
 for(const [x,y,w] of [[560,372,26],[690,392,34],[380,384,22]]){const b=boat(st,x,y,w);aigua.sils.push(b.sil);if(b.sil2)aigua.sils.push(b.sil2);aigua.accents.push(...b.acc);}
 for(const [x,y,r] of [[1180,470,14],[1250,476,10],[560,574,12]]){const c=blob(x,y,r,x,.25,10,r*.5);st.cut(c);st([...c,c[0]],1.4);}
 st(smooth([P(640,560),P(760,540),P(900,520)],4),1.1,'hatch');
 const tree=(t,z)=>{z.accents.push(...t.acc);z.sils.push(t.sil);if(t.sil2)z.sils.push(t.sil2);return t;};
 const pines=[[1020,640,150,51,.18],[1160,650,170,52,-.12],[1270,660,130,53,-.2],[940,650,100,54,.25]].map(([x,y,h,s,l])=>tree(stonePine(st,x,y,h,s,l),arbres));
 for(const [x,y,r,s] of [[980,662,16,61],[1230,672,20,62]])arbres.sils.push(bush(st,x,y,r,s).sil);
 st(HILL.slice(0,6),1.6);
 const hs=[];const put=(r,z)=>{z.accents.push(...r.acc);z.sils.push(r.sil);hs.push(r);return r;};
 for(const [x,y,w,h,o] of [[60,430,54,40,{depth:18,seed:11}],[170,420,60,46,{depth:20,gable:true,seed:12}],[280,436,56,42,{depth:18,seed:13}],[20,478,66,48,{depth:22,seed:14,gable:true}],[220,480,70,52,{depth:24,seed:15}],[340,500,60,46,{depth:20,gable:true,seed:16}]])put(house(st,x,y,w,h,o),poble);
 const ch=put(church(st,120,470,36,104,{depth:22}),poble);
 for(const [x,y,w,h,o] of [[-10,540,80,58,{depth:28,seed:17}],[110,556,88,64,{depth:30,gable:true,seed:18}],[240,566,90,66,{depth:30,seed:19}],[30,620,96,70,{depth:34,gable:true,seed:20}],[200,636,100,72,{depth:34,seed:21}]])put(house(st,x,y,w,h,o),poble);
 st(smooth([P(-20,700),P(120,690),P(300,670),P(400,640)],4),1.3,'hatch');
 for(let i=0;i<8;i++){const y=600+i*28;st(smooth([P(440+i*20,y),P(700,y-8-i*4),P(1000,y-20-i*8),P(1300,y-30-i*10)],5),.9,'hatch');}
 const rb=rowboat(st,620,700,70);camp.sils.push(rb.sil);camp.accents.push(rb.sil);
 for(const [x,y,r] of [[500,760,10],[540,770,6],[1080,760,14]]){const c=blob(x,y,r,x,.25,10,r*.6);st.cut(c);st([...c,c[0]],1.3);}
 for(let i=0;i<10;i++){const x=460+i*80,y=780+(i%3)*12;st([P(x,y),P(x+14,y+2)],1,'hatch');}
 const R=rnd(500);camp.accents.push(...Array.from({length:12},()=>circle(440+R()*800,620+R()*160,2.5+R()*2,8)));
 A.clouds=CLOUDS.map(([x,y,w,h])=>({x,y,w,h}));A.horizon=HOR;A.skyLow=HOR;A.ridge=CLIFF;A.peaks=[[1010,248],[1100,246]];A.lighthouse={x:1080,y:250,h:110,lamp:LH.lamp};
 A.water={x0:-20,x1:1300,y0:HOR+10,y1:540};A.crowns=pines.map(p=>({x:p.crown[0],y:p.crown[1],r:46}));A.church={bell:ch.bell,top:ch.top,x:120,y:470};
 A.roofs=[{x:200,y:636,w:100,h:72},{x:30,y:620,w:96,h:70},{x:240,y:566,w:90,h:66}];A.chimneys=hs.map(h=>h.chimney).filter(Boolean);A.windows=ptWinRects(hs);
 A.umbrella={x:760,y:724};A.rocks=[[1180,470],[560,574]];A.field={x0:430,x1:1300,y0:600,y1:840};
 return {zones:zones.map(z=>({...z,polys:[z.poly,...z.sils]})),strokes:st.list,anchors:A};}
// L’alta muntanya: jagged peaks with snow, a torrent that falls from a notch and crosses the meadows, a fir forest on the left slope,
// a hamlet with its hermitage, and the meadows where the cows graze.
export function ptTerraMuntanya(){const {P,smooth,circle,blob,rev,rnd,scallop,hatch,Ink,house,church,fir,bush,cloud,cloudShape,hut,fence,bird}=PTK;
 const RIDGE=smooth([P(-20,330),P(90,282),P(170,200),P(240,236),P(330,168),P(400,214),P(470,180),P(560,240),P(660,150),P(720,196),P(820,164),P(900,226),P(980,186),P(1080,250),P(1160,214),P(1240,262),P(1300,250)],4);
 const LOW=smooth([P(-20,410),P(160,398),P(340,412),P(520,400),P(700,418),P(900,406),P(1100,420),P(1300,404)],6);
 const FOREST=[P(-20,400),P(220,394),P(420,404),P(560,420),P(600,520),P(520,604),P(300,624),P(-20,604)];
 const TOR_AXIS=[P(700,418),P(690,470),P(720,520),P(760,570),P(820,620),P(870,690),P(900,760),P(920,840)],TOR_W=[12,18,26,36,48,62,80,100];
 const ax=smooth(TOR_AXIS,8),left=[],right=[];for(let i=0;i<ax.length;i++){const u=i/(ax.length-1),k=u*(TOR_W.length-1),j=Math.min(TOR_W.length-2,Math.floor(k)),w=TOR_W[j]+(TOR_W[j+1]-TOR_W[j])*(k-j);
  const a=ax[Math.max(0,i-1)],b=ax[Math.min(ax.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;left.push([ax[i][0]+nx*w/2,ax[i][1]+ny*w/2]);right.push([ax[i][0]-nx*w/2,ax[i][1]-ny*w/2]);}
 const CLOUDS=[[420,100,200,70,31],[900,120,260,86,32],[1150,60,150,52,33]];
 const SNOW=[[170,200],[330,168],[470,180],[660,150],[820,164],[980,186],[1160,214]].map(([x,y])=>[P(x-30,y+34),P(x,y),P(x+28,y+30),P(x+14,y+44),P(x-14,y+46)]);
 const zones=[
  ptZ2('cel',[P(-20,-20),P(1300,-20),P(1300,250),...rev(RIDGE)],P(640,90),{reserves:CLOUDS.map(([x,y,w,h,s])=>cloudShape(x,y,w,h,s))}),
  ptZ2('fons',[...RIDGE,P(1300,404),...rev(LOW)],P(640,300),{reserves:SNOW}),
  ptZ2('aigua',[...left,P(980,840),P(860,840),...rev(right)],P(800,600),{layer:6}),
  ptZ2('arbres',FOREST,P(260,500)),
  ptZ2('poble',[P(-20,604),P(300,624),P(520,604),P(560,690),P(460,770),P(200,790),P(-20,780)],P(260,700)),
  ptZ2('camp',[P(560,420),P(1300,404),P(1300,840),P(-20,840),P(-20,780),P(200,790),P(460,770),P(560,690),P(520,604),P(600,520)],P(1000,620))];
 const [cel,fons,aigua,arbres,poble,camp]=zones,st=Ink(),A={};
 for(const [x,y,w,h,s] of CLOUDS){cloud(st,x,y,w,h,s);cel.accents.push(scallop(blob(x,y+h*.24,w/2*.9,s+1,.1,20,h*.2),h*.04,s+1,3));}
 bird(st,760,110,9);bird(st,790,124,8);
 st(RIDGE,2.8);for(const s of SNOW){st([...s,s[0]],1.2);}
 for(const [px,py] of [[170,200],[330,168],[470,180],[660,150],[820,164],[980,186],[1160,214]]){st.add(hatch([P(px+10,py+30),P(px+70,py+60),P(px+90,py+150),P(px+20,py+140)],1.3,9,px,.8,.5));st(smooth([P(px-6,py+40),P(px-30,py+120),P(px-50,py+210)],4),1.3);st(smooth([P(px+10,py+36),P(px+40,py+110),P(px+60,py+200)],4),1.1,'hatch');}
 st(LOW,1.6);for(let i=0;i<6;i++){const x=120+i*210;st(smooth([P(x,LOW[Math.min(LOW.length-1,Math.round(i*LOW.length/6))][1]-30),P(x+16,LOW[Math.min(LOW.length-1,Math.round(i*LOW.length/6))][1]-8)],3),.9,'hatch');}
 st(left,2.2);st(right,2.2);for(let i=1;i<7;i++){const k=Math.round(ax.length*(i/8)),a=ax[k],b=ax[Math.min(ax.length-1,k+6)];st(smooth([P(a[0]+(i%2?6:-6),a[1]),P((a[0]+b[0])/2,(a[1]+b[1])/2+4),P(b[0]-(i%2?4:-4),b[1])],4),1,'hatch');}
 for(const [x,y,r] of [[760,560,8],[840,650,11],[880,730,9],[700,440,5]]){const c=blob(x,y,r,x,.2,10,r*.6);st.cut(c);st([...c,c[0]],1.3);}
 aigua.accents.push(smooth([...ax.slice(2).map(([x,y],i)=>[x+2+i,y]),...rev(ax.slice(2).map(([x,y],i)=>[x-6-i*2,y+6]))],3,true));
 const tree=(t,z)=>{z.accents.push(...t.acc);z.sils.push(t.sil);if(t.sil2)z.sils.push(t.sil2);return t;};
 const firs=[];const R=rnd(640);for(let row=0;row<4;row++){const n=7-row,y0=430+row*52;for(let i=0;i<n;i++){const x=-10+i*(560/(n-1))*(1-row*.08)+row*30+(R()-.5)*20,h=70+row*22+(R()-.5)*20;firs.push(tree(fir(st,x,y0+row*4,h,70+row*10+i),arbres));}}
 for(const [x,y,r,s] of [[560,600,14,71],[80,610,16,72]])arbres.sils.push(bush(st,x,y,r,s).sil);
 const hs=[];const put=(r,z)=>{z.accents.push(...r.acc);z.sils.push(r.sil);hs.push(r);return r;};
 const H1=hut(st,80,700,90,52);poble.sils.push(H1.sil);poble.accents.push(...H1.acc);
 for(const [x,y,w,h,o] of [[220,690,84,58,{depth:30,gable:true,seed:41}],[360,712,92,64,{depth:32,seed:42}]])put(house(st,x,y,w,h,o),poble);
 const ch=put(church(st,440,670,34,96,{depth:20}),poble);
 fence(st,-20,760,200,770,8);st(smooth([P(-20,790),P(200,784),P(460,766)],4),1.2,'hatch');
 for(let i=0;i<9;i++){const y=470+i*i*2.2+i*10;st(smooth([P(600+Math.max(0,6-i)*30,y+10),P(800,y+6),P(1000,y),P(1200,y-4),P(1300,y-6)],5),.9,'hatch');if(i>2)for(let j=0;j<5;j++){const x=640+j*130+(i%2)*50;st([P(x,y+2),P(x+2,y-6)],.9,'hatch');}}
 for(const [x,y,r] of [[1180,760,22],[1240,790,16],[640,800,14]]){const c=blob(x,y,r,x,.25,10,r*.55);st.cut(c);st([...c,c[0]],1.4);}
 const R2=rnd(700);camp.accents.push(...Array.from({length:30},()=>circle(600+R2()*680,480+R2()*330,3+R2()*2.5,8)));
 A.clouds=CLOUDS.map(([x,y,w,h])=>({x,y,w,h}));A.horizon=404;A.skyLow=330;A.ridge=RIDGE;A.peaks=[[170,200],[330,168],[470,180],[660,150],[820,164],[980,186],[1160,214]];
 A.rocks=[[1180,738],[640,786]];A.rocks=[[560,392],[1000,398]];A.water={x0:690,x1:960,y0:430,y1:820};A.waterLine=ax.map((p,i)=>({x:p[0],y:p[1],w:TOR_W[Math.min(TOR_W.length-1,Math.floor(i/ax.length*TOR_W.length))]}));
 A.pool={x:840,y:646};A.bear={x:980,y:660};A.crowns=firs.slice(0,8).map(f=>({x:f.top[0],y:f.top[1]+40,r:36}));A.church={bell:ch.bell,top:ch.top,x:440,y:670};
 A.roofs=[{x:220,y:690,w:84,h:58},{x:360,y:712,w:92,h:64}];A.chimneys=hs.map(h=>h.chimney).filter(Boolean).concat([[112,662]]);A.windows=ptWinRects(hs);A.field={x0:620,x1:1300,y0:520,y1:800};
 return {zones:zones.map(z=>({...z,polys:[z.poly,...z.sils]})),strokes:st.list,anchors:A};}

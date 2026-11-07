// Pinta el món (EN25), 0.38: the ink sheets of the landscapes, 1 «La vall». A sheet is 1280 × 800. Each landscape is built once
// (pinta-art.js keeps it): six zones in the order of PT_ZONES (cel, fons, aigua, arbres, poble, camp), each with its polygon, the
// silhouettes of the things drawn in it (polys), its reserves (left as paper: clouds, snow) and its accents (the third wash: roofs,
// trunks, poppies), the seed of its wash and the whole ink drawing (strokes, back to front); and the anchors the life uses (gags).
import {PTK,ptWinRects} from './pinta-eines.js';
const ptZone=(id,poly,seed,o={})=>({id,poly,seed,reserves:o.reserves||[],accents:[],sils:[],...o});
export function ptTerraVall(){const {P,smooth,circle,arc,blob,rev,rnd,scallop,hatch,Ink,house,church,oak,poplar,pine,bush,cloud,cloudShape,bridge,scarecrow,haystack,fence,fountain,bird}=PTK;
 // ── master lines ──
 const RIDGE=smooth([P(-20,372),P(120,334),P(230,268),P(330,300),P(430,246),P(520,286),P(640,232),P(740,266),P(830,218),P(930,274),P(1040,246),P(1140,294),P(1300,320)],6);
 const RIDGE2=smooth([P(-20,420),P(140,398),P(300,386),P(420,402),P(560,384),P(700,404),P(860,390),P(1000,408),P(1160,396),P(1300,412)],6);
 const HILLS=smooth([P(-20,456),P(140,440),P(300,448),P(480,434),P(640,444),P(820,430),P(1000,442),P(1150,434),P(1300,448)],6);
 const RIVER_AXIS=[P(650,440),P(640,468),P(612,500),P(590,540),P(600,584),P(560,630),P(470,672),P(380,712),P(300,760),P(230,830)],RIVER_W=[14,20,30,46,64,90,124,162,206,250];
 const ax=smooth(RIVER_AXIS,8),left=[],right=[];for(let i=0;i<ax.length;i++){const u=i/(ax.length-1),k=u*(RIVER_W.length-1),j=Math.min(RIVER_W.length-2,Math.floor(k)),w=RIVER_W[j]+(RIVER_W[j+1]-RIVER_W[j])*(k-j);
  const a=ax[Math.max(0,i-1)],b=ax[Math.min(ax.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;left.push([ax[i][0]+nx*w/2,ax[i][1]+ny*w/2]);right.push([ax[i][0]-nx*w/2,ax[i][1]-ny*w/2]);}
 const CLOUDS=[[300,118,230,86,11],[520,150,150,58,12],[900,112,290,104,13],[1100,172,170,64,14],[660,88,120,44,15]];
 const FOREST_BOTTOM=smooth([P(640,520),P(720,574),P(860,606),P(1020,612),P(1180,590),P(1300,562)],5);
 const zones=[
  ptZone('cel',[P(-20,-20),P(1300,-20),P(1300,320),...rev(RIDGE)],P(640,110),{reserves:CLOUDS.map(([x,y,w,h,s])=>cloudShape(x,y,w,h,s))}),
  ptZone('fons',[...RIDGE,P(1300,448),...rev(HILLS)],P(640,330),{reserves:[[P(206,286),P(230,268),P(256,284),P(246,300),P(222,296)],[P(806,236),P(830,218),P(856,236),P(846,252),P(820,250)],[P(1020,264),P(1040,246),P(1064,262),P(1054,276),P(1030,274)]]}),
  ptZone('aigua',[...left,P(100,840),P(360,840),...rev(right)],P(600,560)),
  ptZone('arbres',[P(650,440),P(1300,448),...rev(FOREST_BOTTOM)],P(960,520)),
  ptZone('poble',[P(-20,456),...left.slice(0,9),P(300,700),P(170,740),P(-20,750)],P(260,560)),
  ptZone('camp',[...FOREST_BOTTOM,P(1300,840),P(360,840),...rev(right.slice(4)),P(300,700),P(170,740),P(-20,750),P(-20,840),P(100,840),...left.slice(9)],P(980,700))];
 const [cel,fons,aigua,arbres,poble,camp]=zones,st=Ink(),A={};
 // ── the ink, back to front ──
 for(const [x,y,w,h,s] of CLOUDS){cloud(st,x,y,w,h,s);cel.accents.push(scallop(blob(x,y+h*.24,w/2*.9,s+1,.1,20,h*.2),h*.04,s+1,3));}
 bird(st,700,186,12);bird(st,742,166,10);bird(st,774,192,9);bird(st,1180,250,8);
 st(RIDGE,2.8);
 for(const [px,py,bx] of [[230,268,330],[430,246,520],[640,232,740],[830,218,930],[1040,246,1140]]){const ry=RIDGE.reduce((m,p)=>Math.abs(p[0]-bx)<Math.abs(m[0]-bx)?p:m)[1];const shade=[P(px+6,py+10),P(bx-4,ry-2),P(bx+10,ry+60),P(px+30,py+90)];st.add(hatch(shade,1.2,8,px,.8,.5));}
 st(RIDGE2,1.5);st(HILLS,1.8);
 for(let i=0;i<5;i++){const x=180+i*230;st(smooth([P(x,400+(i%2)*8),P(x+26,424),P(x+36,438)],4),.9,'hatch');}
 st(left,2.4);st(right,2.4);
 for(let i=2;i<9;i++){const k=Math.round(ax.length*(i/10)),a=ax[k],b=ax[Math.min(ax.length-1,k+5)],off=(i%2?1:-1)*RIVER_W[i]*.2;st(smooth([P(a[0]+off,a[1]),P((a[0]+b[0])/2+off*1.3,(a[1]+b[1])/2),P(b[0]+off*.6,b[1])],4),1.1,'hatch');}
 aigua.accents.push(smooth([...ax.slice(3).map(([x,y],i)=>[x+2+i*2,y]),...rev(ax.slice(3).map(([x,y],i)=>[x-8-i*2.6,y+6]))],3,true));
 for(const [x,y,r] of [[470,690,9],[500,705,6],[330,752,11],[618,606,7]]){const c=blob(x,y,r,x,.2,10,r*.6);st.cut(c);st([...c,c[0]],1.4);}
 for(let i=0;i<9;i++){const x=240+i*22,y=790-i*5;st([P(x,y),P(x+4,y-40-(i%3)*12)],1.2);st([P(x+4,y-40-(i%3)*12),P(x+9,y-30-(i%3)*12)],1,'hatch');}
 const tree=(t,z)=>{z.accents.push(...t.acc);z.sils.push(t.sil);if(t.sil2)z.sils.push(t.sil2);return t;};
 for(const [x,y,h,s] of [[700,470,150,26],[728,478,120,27],[1050,466,170,28],[1078,480,130,29],[1250,470,140,30]])tree(poplar(st,x,y,h,s),arbres);
 for(const [x,y,r,s] of [[690,520,30,31],[800,484,28,32],[920,478,24,33],[1180,490,26,34]])tree(oak(st,x,y,r,s),arbres);
 const pines=[[1140,520,110,35],[1210,560,96,36]].map(([x,y,h,s])=>tree(pine(st,x,y,h,s),arbres));
 const oaks=[[770,586,58,21],[870,604,66,22],[990,606,60,23],[1120,598,52,24],[690,568,36,25]].map(([x,y,r,s])=>tree(oak(st,x,y,r,s),arbres));
 for(const [x,y,r,s] of [[640,536,16,41],[1040,598,18,42],[1260,576,22,43]])arbres.sils.push(bush(st,x,y,r,s).sil);
 const hs=[];const put=(r,z)=>{z.accents.push(...r.acc);z.sils.push(r.sil);hs.push(r);return r;};
 for(const [x,y,w,h,o] of [[20,480,60,42,{depth:20,seed:14}],[520,500,46,36,{depth:16,seed:10,chimney:false}],[450,520,56,42,{depth:20,seed:6}],[372,512,60,46,{depth:22,gable:true,seed:7}],[290,508,66,50,{depth:22,seed:8}],[80,540,70,52,{depth:24,gable:true,seed:9}]])put(house(st,x,y,w,h,o),poble);
 const ch=put(church(st,180,540,40,130,{depth:24}),poble);
 for(const [x,y,w,h,o] of [[400,562,70,52,{depth:26,gable:true,seed:1}],[330,576,78,60,{depth:28,seed:2}],[250,590,84,66,{depth:30,gable:true,seed:3}],[150,604,96,74,{depth:34,seed:4}],[40,612,90,70,{depth:34,gable:true,seed:5}]])put(house(st,x,y,w,h,o),poble);
 const fnt=fountain(st,400,650,30);st(smooth([P(360,700),P(420,690),P(500,676)],4),1.2,'hatch');
 const front=[[300,668,96,70,{depth:34,gable:true,seed:12}],[120,690,120,84,{depth:38,seed:13}]].map(([x,y,w,h,o])=>put(house(st,x,y,w,h,o),poble));
 st(smooth([P(-20,620),P(60,626),P(130,616)],4),1.4);st.add(hatch([P(-20,620),P(130,616),P(130,626),P(-20,632)],0,5,77,.8,.3));
 const br=bridge(st,520,690,590,-.06,{arches:2});poble.sils.push(br.sil);
 st(smooth([P(520,586),P(470,598),P(420,616),P(400,640)],4),1.3,'hatch');st(smooth([P(690,580),P(740,598),P(800,612)],4),1.3,'hatch');
 for(let i=0;i<11;i++){const y=636+i*i*2.1+i*6;st(smooth([P(560+Math.max(0,8-i)*18,y+14),P(700,y+6),P(900,y),P(1100,y-2+(i%2)*3),P(1300,y-8)],6),1,'hatch');
  if(i>3)for(let j=0;j<6;j++){const x=640+j*110+(i%2)*40;st([P(x,y+2),P(x+2,y-5-i*.5)],.9,'hatch');}}
 fence(st,560,628,840,644,10);
 const hay=[[1180,700,44,61],[1240,744,34,62]].map(([x,y,r,s])=>{const t=haystack(st,x,y,r,s);camp.sils.push(t.sil);return t;});
 st(smooth([P(700,840),P(760,760),P(800,700),P(830,660)],4),1.4);st(smooth([P(760,840),P(810,760),P(840,700),P(860,660)],4),1.4);
 const sc=scarecrow(st,1000,790,1.05);camp.accents.push(...sc.acc);camp.sils.push(sc.sil);
 const R=rnd(400);camp.accents.push(...Array.from({length:40},()=>{const x=560+R()*700,y=650+R()*170;return circle(x,y,3.5+R()*3,8);}));
 A.clouds=CLOUDS.map(([x,y,w,h])=>({x,y,w,h}));A.birds=[[700,186],[742,166],[774,192]];A.ridge=RIDGE;A.peaks=[[230,268],[430,246],[640,232],[830,218],[1040,246]];A.hills=HILLS;
 A.river=ax;A.riverW=RIVER_W;A.bridge={x:605,y:585,x0:520,x1:690};A.stones=[[470,690,9],[330,752,11]];
 A.pine=pines[0]?{x:1140,y:520,h:110}:null;A.oak={x:870,y:604,r:66};A.oaks=oaks.map(o=>({x:o.crown[0],y:o.crown[1],r:o.r}));A.forestFloor=FOREST_BOTTOM;A.crowns=A.oaks.concat([{x:700,y:390,r:30},{x:1050,y:380,r:34}]);A.waterLine=ax.map((p,i)=>({x:p[0],y:p[1],w:RIVER_W[Math.min(RIVER_W.length-1,Math.floor(i/ax.length*RIVER_W.length))]}));
 A.fountain={x:400,y:650,r:30};A.church={bell:ch.bell,top:ch.top,x:180,y:540};A.roofs=[{x:300,y:668,w:96,h:70},{x:120,y:690,w:120,h:84}];A.chimneys=hs.map(h=>h.chimney).filter(Boolean);A.windows=ptWinRects(hs);A.square={x:400,y:690};
 A.scarecrow={x:1000,y:790,s:1.05,head:sc.head,hat:sc.hat};A.hay=hay.map((h,i)=>({x:[1180,1240][i],y:[700,744][i],r:[44,34][i]}));A.field={x0:560,x1:1300,y0:640,y1:840};A.horizon=448;
 return {zones:zones.map(z=>({...z,polys:[z.poly,...z.sils]})),strokes:st.list,anchors:A};}

// Pinta el món (EN25), 0.38: the ink sheets 4 «La ciutat vora el mar» and 5 «El llac i els volcans» (see pinta-terres.js).
import {PTK,ptWinRects} from './pinta-eines.js';
const ptZ3=(id,poly,seed,o={})=>({id,poly,seed,reserves:o.reserves||[],accents:[],sils:[],...o});
// La ciutat vora el mar: hills with houses and a funicular behind, the harbour with its cranes and a ship on the left, the roofs of the
// town on the right with the tram street at their foot, the park with its plane trees and carousel, and the seaside promenade in front.
export function ptTerraCiutat(){const {P,smooth,circle,blob,rev,rnd,scallop,hatch,Ink,house,church,plane,cypress,bush,cloud,cloudShape,crane,ship,carousel,ferris,tram,stall,bird}=PTK;
 const HILLS=smooth([P(-20,320),P(140,290),P(300,300),P(460,276),P(620,296),P(780,270),P(940,286),P(1100,262),P(1300,290)],6);
 const HILLFOOT=smooth([P(-20,430),P(200,434),P(400,428),P(560,436),P(800,424),P(1000,430),P(1300,420)],5);
 const CLOUDS=[[300,110,220,76,41],[760,80,160,56,42],[1060,130,240,80,43]];
 const PORT=[P(-20,436),P(560,436),P(548,602),P(-20,612)],ROOFS=[P(520,430),P(1300,420),P(1300,640),P(900,660),P(560,620)],PARK=[P(-20,612),P(548,602),P(560,620),P(560,740),P(300,760),P(-20,750)];
 const PROM=[P(560,620),P(900,660),P(1300,640),P(1300,840),P(-20,840),P(-20,750),P(300,760),P(560,740)];
 const zones=[
  ptZ3('cel',[P(-20,-20),P(1300,-20),P(1300,290),...rev(HILLS)],P(640,110),{reserves:CLOUDS.map(([x,y,w,h,s])=>cloudShape(x,y,w,h,s))}),
  ptZ3('fons',[...HILLS,P(1300,420),...rev(HILLFOOT)],P(640,360)),
  ptZ3('aigua',PORT,P(260,520)),
  ptZ3('arbres',PARK,P(260,680)),
  ptZ3('poble',ROOFS,P(920,540)),
  ptZ3('camp',PROM,P(640,780))];
 const [cel,fons,aigua,arbres,poble,camp]=zones,st=Ink(),A={};
 for(const [x,y,w,h,s] of CLOUDS){cloud(st,x,y,w,h,s);cel.accents.push(scallop(blob(x,y+h*.24,w/2*.9,s+1,.1,20,h*.2),h*.04,s+1,3));}
 bird(st,480,170,9);bird(st,520,186,8);bird(st,900,150,9);
 st(HILLS,2.4);st(HILLFOOT,1.4);
 const hs=[];const put=(r,z)=>{z.accents.push(...r.acc);z.sils.push(r.sil);hs.push(r);return r;};
 const R=rnd(810);for(let i=0;i<16;i++){const x=20+i*80+(R()-.5)*30,y=330+(i%3)*26+R()*20,w=26+R()*14,h=20+R()*10;const r=house(st,x,y,w,h,{depth:w*.4,gable:i%2===0,seed:100+i,chimney:false});fons.accents.push(...r.acc);fons.sils.push(r.sil);}
 for(const [x,y,h] of [[160,318,34],[700,312,40],[1180,300,36]]){const t=cypress(st,x,y,h,20+x%7);fons.sils.push(t.sil);fons.accents.push(...t.acc);}
 st([P(1060,420),P(1210,286)],1.6);st([P(1068,420),P(1218,286)],1.6);for(let i=1;i<9;i++){const u=i/9;st([P(1060+150*u-3,420-134*u),P(1068+150*u+3,420-134*u)],1,'hatch');}
 st([P(-20,436),P(560,436)],1.2);for(let i=0;i<10;i++){const y=452+i*i*1.3+i*8;for(let j=0;j<4;j++){const x=-10+j*150+(i%2)*60;if(x<520)st(smooth([P(x,y),P(x+22,y-2),P(x+44,y)],4),.9,'hatch');}}
 st([P(-20,598),P(300,588),P(548,594)],2);st.add(hatch([P(-20,598),P(548,594),P(548,604),P(-20,608)],0,5,88,.8,.3));
 const cr1=crane(st,440,590,150),cr2=crane(st,520,592,120);const sh=ship(st,230,560,170);aigua.sils.push(sh.sil);if(sh.sil2)aigua.sils.push(sh.sil2);aigua.accents.push(...sh.acc);
 for(const [x,y,r] of [[60,560,8],[100,572,6]]){const c=blob(x,y,r,x,.25,10,r*.5);st.cut(c);st([...c,c[0]],1.2);}
 aigua.accents.push(smooth([P(40,470),P(200,468),P(240,480),P(60,484)],3,true));
 const tree=(t,z)=>{z.accents.push(...t.acc);z.sils.push(t.sil);if(t.sil2)z.sils.push(t.sil2);return t;};
 const planes=[[60,700,120,81],[180,712,134,82],[320,704,126,83],[460,716,118,84],[520,690,90,85]].map(([x,y,h,s])=>tree(plane(st,x,y,h,s),arbres));
 const ca=carousel(st,250,740,90,56);arbres.sils.push(ca.sil);arbres.accents.push(...ca.acc);
 for(const [x,y,r,s] of [[20,740,14,91],[400,748,16,92]])arbres.sils.push(bush(st,x,y,r,s).sil);
 st(smooth([P(-20,750),P(300,760),P(560,740)],4),1.3);
 const R2=rnd(820);for(let row=0;row<4;row++){const y=470+row*48,n=7-(row%2);for(let i=0;i<n;i++){const x=540+i*(740/n)+(row%2)*40+(R2()-.5)*16,w=58+R2()*30,h=40+row*6+R2()*14;if(x+w<1300)put(house(st,x,y,w,h,{depth:18+row*4,gable:(i+row)%2===0,seed:200+row*10+i}),poble);}}
 const ch=put(church(st,1120,560,40,120,{depth:22}),poble);
 st([P(560,622),P(900,660),P(1300,640)],2.2);st([P(560,628),P(900,666),P(1300,646)],1.2);for(let i=0;i<14;i++){const u=i/14,x=580+u*700,y=626+(x<900?(x-560)/340*38:38-(x-900)/400*20);st([P(x,y+1),P(x+8,y+1)],.9,'hatch');}
 const tr=tram(st,1000,668,96,40);
 for(let i=0;i<5;i++){const x=620+i*150;st([P(x,760),P(x,700)],2.2);for(let k=0;k<6;k++){const a=-.3+k*.42;st(smooth([P(x,700),P(x+Math.cos(a-1.6)*36,700-Math.sin(a+1.2)*34),P(x+Math.cos(a-1.6)*58,700-Math.sin(a+1.2)*44+10)],4),1.4);}}
 st(smooth([P(-20,840),P(300,800),P(640,784),P(1000,776),P(1300,770)],5),1.2,'hatch');for(let i=0;i<9;i++){const x=600+i*76;st([P(x,796+(i%2)*4),P(x+30,794+(i%2)*4)],1.3);st([P(x+4,796+(i%2)*4),P(x+4,808+(i%2)*4)],1.1);st([P(x+26,794+(i%2)*4),P(x+26,806+(i%2)*4)],1.1);}
 const fw=ferris(st,1180,820,70);const stl=stall(st,420,790,60,46);camp.sils.push(stl.sil);camp.accents.push(...stl.acc);
 A.clouds=CLOUDS.map(([x,y,w,h])=>({x,y,w,h}));A.horizon=430;A.skyLow=300;A.ridge=HILLS;A.peaks=[[460,276],[780,270],[1100,262]];A.funicular={x0:1064,y0:418,x1:1214,y1:288};
 A.water={x0:-20,x1:540,y0:446,y1:590};A.shipLane={x0:-40,x1:540,y:540};A.cranes=[cr1,cr2];A.park={x0:-20,x1:540,y0:620,y1:740};A.field2={x0:-20,x1:540,y0:620,y1:740};A.carousel={x:250,y:700,r:34};
 A.crowns=planes.map(p=>({x:p.crown[0],y:p.crown[1],r:44}));A.street={x0:560,x1:1300,y:650};A.church={bell:ch.bell,top:ch.top,x:1120,y:560};
 A.roofs=[{x:640,y:614,w:80,h:60},{x:900,y:614,w:84,h:60},{x:1200,y:614,w:80,h:60}];A.chimneys=hs.map(h=>h.chimney).filter(Boolean).slice(0,6);A.windows=ptWinRects(hs);
 A.field={x0:-20,x1:1300,y0:760,y1:840};A.ferris={hub:fw.hub,r:fw.r};
 return {zones:zones.map(z=>({...z,polys:[z.poly,...z.sils]})),strokes:st.list,anchors:A};}
// El llac i els volcans: the cones of the volcanoes on the skyline, the lake in the middle with a rowboat and reeds, the beech wood
// on the left, the farmhouses on the right, and the fields with their windmills in front.
export function ptTerraLlac(){const {P,smooth,circle,blob,rev,rnd,scallop,hatch,Ink,farmhouse,beech,poplar,bush,cloud,cloudShape,windmill,rowboat,fence,bird}=PTK;
 const SKY=smooth([P(-20,330),P(120,312),P(240,260),P(330,214),P(420,250),P(520,322),P(640,318),P(760,236),P(860,196),P(960,230),P(1060,300),P(1180,296),P(1300,316)],5);
 const FAR=smooth([P(-20,420),P(200,412),P(400,420),P(640,414),P(900,422),P(1100,414),P(1300,420)],6);
 const LAKE=smooth([P(240,436),P(400,428),P(640,426),P(880,430),P(1040,444),P(1080,500),P(1020,560),P(900,590),P(700,600),P(500,598),P(340,580),P(240,540)],4,true);
 const CLOUDS=[[500,110,200,70,51],[1000,130,230,80,52],[180,90,150,54,53]];
 const WOOD=[P(-20,400),P(220,392),P(320,420),P(340,540),P(300,660),P(100,690),P(-20,680)];
 const FARMS=[P(1040,426),P(1300,420),P(1300,640),P(1120,660),P(1040,600)];
 const FIELD=[P(-20,680),P(100,690),P(300,660),P(340,580),P(240,540),P(240,436),P(320,420),P(340,420),...LAKE.slice(8,LAKE.length-2),P(240,540),P(340,580),P(500,598),P(700,600),P(900,590),P(1020,560),P(1080,500),P(1040,600),P(1120,660),P(1300,640),P(1300,840),P(-20,840)];
 const zones=[
  ptZ3('cel',[P(-20,-20),P(1300,-20),P(1300,316),...rev(SKY)],P(640,100),{reserves:CLOUDS.map(([x,y,w,h,s])=>cloudShape(x,y,w,h,s))}),
  ptZ3('fons',[...SKY,P(1300,420),...rev(FAR)],P(640,340)),
  ptZ3('aigua',LAKE,P(660,510)),
  ptZ3('arbres',WOOD,P(160,540)),
  ptZ3('poble',FARMS,P(1170,540)),
  ptZ3('camp',[P(-20,680),P(100,690),P(300,660),P(340,580),P(500,598),P(700,600),P(900,590),P(1020,560),P(1080,500),P(1040,600),P(1120,660),P(1300,640),P(1300,840),P(-20,840)],P(640,740))];
 const [cel,fons,aigua,arbres,poble,camp]=zones,st=Ink(),A={};
 for(const [x,y,w,h,s] of CLOUDS){cloud(st,x,y,w,h,s);cel.accents.push(scallop(blob(x,y+h*.24,w/2*.9,s+1,.1,20,h*.2),h*.04,s+1,3));}
 bird(st,700,140,9);bird(st,740,156,8);
 st(SKY,2.6);for(const [x,y] of [[330,214],[860,196]]){st([P(x-14,y+2),P(x-6,y-4),P(x+6,y-4),P(x+14,y+2)],1.8);st.add(hatch([P(x+8,y+4),P(x+80,y+60),P(x+110,y+150),P(x+30,y+120)],1.2,9,x,.8,.5));st(smooth([P(x-10,y+10),P(x-40,y+80),P(x-70,y+170)],4),1.2);}
 st(FAR,1.4);for(let i=0;i<5;i++){const x=200+i*230;st(smooth([P(x,392+(i%2)*6),P(x+22,408),P(x+34,418)],4),.9,'hatch');}
 st([...LAKE,LAKE[0]],1.8);for(let i=0;i<9;i++){const y=450+i*16,x0=300+(i%2)*40+i*8;for(let j=0;j<3;j++){const x=x0+j*220;if(x<980)st(smooth([P(x,y),P(x+30,y-2),P(x+60,y)],4),.9,'hatch');}}
 aigua.accents.push(smooth([P(420,470),P(700,466),P(760,478),P(440,484)],3,true));
 const rb=rowboat(st,700,556,64);aigua.sils.push(rb.sil);
 for(let i=0;i<12;i++){const x=250+i*18,y=556-i*4;st([P(x,y),P(x+2,y-30-(i%3)*8)],1.1);st([P(x+2,y-30-(i%3)*8),P(x+5,y-24-(i%3)*8)],1,'hatch');}
 for(let i=0;i<8;i++){const x=1000+i*12,y=560+i*3;st([P(x,y),P(x+2,y-26-(i%3)*8)],1.1);}
 const tree=(t,z)=>{z.accents.push(...t.acc);z.sils.push(t.sil);if(t.sil2)z.sils.push(t.sil2);return t;};
 const beeches=[[40,470,46,61],[150,462,52,62],[260,482,44,63],[90,560,60,64],[230,590,56,65],[20,640,40,66],[160,660,34,67]].map(([x,y,r,s])=>tree(beech(st,x,y,r,s),arbres));
 for(const [x,y,r,s] of [[300,650,14,68],[60,690,12,69]])arbres.sils.push(bush(st,x,y,r,s).sil);
 const hs=[];const put=(r,z)=>{z.accents.push(...r.acc);z.sils.push(r.sil);hs.push(r);return r;};
 const F1=farmhouse(st,1100,540,120,70),F2=farmhouse(st,1210,600,110,64);for(const f of [F1,F2]){poble.sils.push(f.sil);poble.accents.push(...f.acc);}
 for(const [x,y,h,s] of [[1080,470,110,71],[1260,480,130,72]])tree(poplar(st,x,y,h,s),poble);fence(st,1050,640,1300,632,10);
 for(let i=0;i<10;i++){const y=640+i*i*1.6+i*8;st(smooth([P(-20+(i%2)*30,y+10),P(300,y+4),P(600,y),P(900,y-4+(i%2)*3),P(1300,y-8)],6),.9,'hatch');if(i>3)for(let j=0;j<6;j++){const x=100+j*200+(i%2)*60;st([P(x,y+2),P(x+2,y-6)],.9,'hatch');}}
 const ms=[[760,760,70,150],[940,740,60,130]].map(([x,y,w,h])=>{const m=windmill(st,x,y,w,h);camp.sils.push(m.sil);camp.accents.push(...m.acc);return {x,y,hub:m.hub,arm:m.arm};});
 for(const [x,y,r] of [[400,790,16],[1150,780,20]]){const c=blob(x,y,r,x,.25,10,r*.55);st.cut(c);st([...c,c[0]],1.3);}
 const R=rnd(900);camp.accents.push(...Array.from({length:30},()=>circle(-10+R()*1300,640+R()*180,3+R()*2.5,8)));
 A.clouds=CLOUDS.map(([x,y,w,h])=>({x,y,w,h}));A.horizon=420;A.skyLow=300;A.ridge=SKY;A.peaks=[[330,214],[860,196]];A.volcanoes=[{x:860,y:198},{x:330,y:216}];
 A.water={x0:280,x1:1020,y0:440,y1:580};A.boat={x:700,y:556,w:64};A.wood={x:330,y:640};A.crowns=beeches.map(b=>({x:b.crown[0],y:b.crown[1],r:b.r}));
 A.farm={x:1100,y:620,roof:[1160,470]};A.roofs=[{x:1100,y:540,w:120,h:70},{x:1210,y:600,w:110,h:64}];A.chimneys=[[1130,470],[1240,536]];A.windows=ptWinRects(hs).concat([[1120,500,10,12],[1160,500,10,12],[1232,560,10,12]]);
 A.windmills=ms;A.field={x0:-20,x1:1300,y0:640,y1:840};
 return {zones:zones.map(z=>({...z,polys:[z.poly,...z.sils]})),strokes:st.list,anchors:A};}

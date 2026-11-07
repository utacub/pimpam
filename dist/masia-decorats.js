// Estiu a la masia (EN26), 0.39: the sets. The panorama of the farm in five depth planes and the kitchen. Names start with md.
// World coordinates are the sheet 1280×800 (MS_SHEET); the camera of the activity scales and offsets each plane by its depth.
import {MS_SHEET,MP_TAU,mpRng,mpNoise,mpFbm,mpClamp,mpLerp,mpRgb,mpMix,mpLight,mpDark,mpLit,mpShade,mpCol,mpPath,mpBounds,mpBlob,mpSmooth,mpRect,mpFill,mpSoft,mpGouache,mpGrad,mpTone,mpLine,mpSky,mpSun,mpCumulus,mpWisp,mpHaze,mpShaft,mpDapple,mpGroundShadow,mpCastShadow,mpVignette,mpShift,mpEllipsePts,mpHour,mpInside,mpTreeShadow} from './masia-pinzell.js';
import {mcEllipse} from './masia-personatges.js';
import {MN_PAL,mnRidge,mnRidgePoly,mnHills,mnPatchwork,mnGround,mnGrass,mnWheat,mnEarth,mnPath,mnTrunk,mnCanopy,mnTree,mnCypress,mnBush,mnStoneWall,mnPlaster,mnRoofTiles,mnPlanks,mnPond,mnLilies,mnReeds,mnSunflower,mnTomatoPlant,mnLettuce,mnCarrotTops,mnClimber,mnGeranium,mnHaystack,mnFence} from './masia-natura.js';
const MD_W=MS_SHEET[0],MD_H=MS_SHEET[1];
// ── The layout of the farm (world coordinates) ────────────────────────────────────────────────────────────────────────────────────
export const MD={
 horizon:345,
 house:{x0:690,x1:1030,xs:1080,ground:548,groundS:554,eave:352,eaveS:368,ridge:268,wing:{x0:1072,x1:1186,ground:566,eave:462,ridge:432},colomar:{x0:704,x1:750,top:234},chimney:{x:962,y:302},door:{x:790,w:46,top:470},window:{x:905,y:452,w:66,h:54},upper:[[760,400],[900,398],[992,400]]},
 fig:{x:560,y:536,h:200,rx:138,ry:96,swing:{x:634,y:410,len:104}},
 line:{x0:612,y0:388,x1:690,y1:396},
 pond:{pts:[[40,650],[120,600],[260,586],[380,600],[430,660],[400,730],[300,776],[150,780],[60,740]]},
 garden:{pts:[[830,604],[1280,596],[1280,800],[760,800],[770,690]],fence:[[826,606],[1000,594],[1280,590]]},
 haystack:{x:150,y:512,w:124,h:92},
 henhouse:{x:1206,y:562,w:88,h:62},
 well:{x:668,y:630},
 bench:{x:736,y:572},
 path:[[640,810],[660,720],[720,640],[780,584],[800,552]],
 zones:{avia:[[856,406],[956,406],[956,498],[856,498]],avi:[[104,458],[256,458],[256,616],[104,616]],nina:[[940,540],[1080,540],[1080,700],[940,700]],pol:[[600,412],[716,412],[716,552],[600,552]],cabra:[[452,470],[600,470],[600,566],[452,566]]},
 spots:{avia:[905,470],avi:[180,585],nina:[1010,684],pol:[662,540],cabra:[524,546]},
 depth:{sky:.04,far:.16,mid:.42,house:.7,near:1,fore:1.28}};
export const MD_ORDER=['avia','avi','nina','pol','cabra'];
// ── Sky ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// o.drift moves the clouds (world px); o.sun false hides the disc.
export function mdSky(c,L,o={}){const {drift=0,sun=true}=o;const hz=MD.horizon+40;const [sx,sy]=mpSky(c,MD_W,MD_H,L,hz);
 const r0=mpRng(9);for(let i=0;i<14;i++){const x=r0()*MD_W,y=r0()*hz*.9;mpSoft(c,mpBlob(x,y,60+r0()*160,9+i,.3,12,16+r0()*40),r0()<.5?mpLight(L.sky[1][1],.12):mpDark(L.sky[0][1],.06),22,.22);}
 if(sun&&L.sunY>.08){const r=16+L.dusk*18;mpSun(c,sx,Math.min(sy+L.dusk*60,hz-20),r,L);}
 // high thin clouds
 for(let i=0;i<4;i++){const x=(i*340+drift*.3+120)%(MD_W+300)-150,y=60+i*22+Math.sin(i*2.1)*18;mpWisp(c,x,y,260+i*60,22,i+40,mpMix(L.cloud.base,L.sky[0][1],.35),.35,14);}
 // cumulus: a big one, two medium, small ones near the horizon
 const CL=[[180,150,290,105,.9],[620,118,200,78,1],[990,165,330,118,.95],[1240,230,170,62,.8],[420,236,150,46,.7],[820,250,120,36,.7],[80,262,110,34,.6]];
 for(let i=0;i<CL.length;i++){const [x,y,w,h,a]=CL[i];const px=((x+drift*(.6+i*.08))%(MD_W+w*1.4)+MD_W+w*1.4)%(MD_W+w*1.4)-w*.7;const hazeK=mpClamp((y-80)/220)*.55;const Lh={...L,cloud:{shade:mpMix(L.cloud.shade,L.haze[0],hazeK),base:mpMix(L.cloud.base,L.haze[0],hazeK*.6),light:mpMix(L.cloud.light,L.haze[0],hazeK*.4),rim:L.cloud.rim}};mpCumulus(c,px,y,w,h,i+3,Lh,{soft:1.2+hazeK*2,alpha:a});}
 mpHaze(c,MD_W,hz-170,hz+6,L.haze[0],L.haze[1]*.8);}
// ── Far ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mdFar(c,L){const r1=mnRidge(MD_W,MD.horizon-4,80,3.3,22,1.4);mnHills(c,r1,MD.horizon+40,MN_PAL.hillFar,L,5,{hazeK:.85,folds:6});
 const r2=mnRidge(MD_W,MD.horizon+16,60,7.1,26,1.2);mnHills(c,r2,MD.horizon+64,mpMix(MN_PAL.hillMid,MN_PAL.hillFar,.3),L,6,{hazeK:.6,folds:5,village:[1010,MD.horizon+8,11]});
 mnPatchwork(c,mnRidgePoly(r2,MD.horizon+64),r2,L,8,{n:11,hazeK:.6,rows:.45});
 // a far row of cypresses and some olive dots at the foot of the hills
 const r=mpRng(21);for(let i=0;i<9;i++){const x=120+i*140+(r()-.5)*60;const y=MD.horizon+34+r()*8;const h=22+r()*16;const Lf={...L,shadowK:L.shadowK*.3};mnCypress(c,x,y,h,h*.16,Lf,30+i);}
 mpHaze(c,MD_W,MD.horizon-70,MD.horizon+66,L.haze[0],L.haze[1]*.5);}
// ── Mid: the wheat hill, the olive grove and the hedges ───────────────────────────────────────────────────────────────────────────
export function mdMid(c,L,o={}){const {wave=.35}=o;const ridge=mnRidge(MD_W,MD.horizon+58,34,11.2,20,1.1);
 // a band of fields under the far hills (nearer patchwork, less hazed)
 const meadow=mnRidgePoly(ridge,MD.horizon+150);mnGround(c,meadow,MN_PAL.grass,L,13,{strokes:16});mnPatchwork(c,meadow,ridge,L,15,{n:8,hazeK:.3,rows:.4});
 // the wheat field: from the fields down to the yard, left and centre, behind the house too
 const wheat=[[-20,MD.horizon+100],[300,MD.horizon+82],[640,MD.horizon+78],[900,MD.horizon+90],[1300,MD.horizon+110],[1300,500],[1000,478],[760,500],[560,528],[380,540],[180,560],[-20,580]];
 const wp=mpSmooth(wheat,4,true);mnWheat(c,wp,L,17,{rows:18,wave,lean:4});
 // poppies in the wheat, more near the edge
 const r=mpRng(19);for(let i=0;i<70;i++){const x=r()*MD_W,y=MD.horizon+100+Math.pow(r(),.6)*(MD.horizon+100-430)*-1;if(!mpInside(wp,x,y))continue;const R=1.2+((y-430)/120)*1.6;c.fillStyle=mpRgb(mpCol([214,40,40],L,.6),.9);c.beginPath();c.arc(x,y,Math.max(1,R),0,MP_TAU);c.fill();}
 // a dark hedge separating the fields from the wheat, with some bushes
 for(let i=0;i<14;i++){const x=-10+i*98+(r()-.5)*40;const idx=Math.min(ridge.length-1,Math.floor((x+40)/(MD_W+80)*ridge.length));const y=ridge[Math.max(0,idx)][1]+58+(r()-.5)*6;mnBush(c,x,y,26+r()*22,18+r()*10,i%3?MN_PAL.leafOak:MN_PAL.leafOlive,L,40+i,{soft:1.2});}
 // the olive grove behind and right of the house
 for(let i=0;i<7;i++){const x=1040+i*48+(r()-.5)*30,y=MD.horizon+116+(i%2)*22+(r()-.5)*8;mnTree(c,x,y,{h:72+r()*16,rx:36+r()*10,ry:26+r()*6,trunk:6,pal:MN_PAL.leafOlive,kind:'olive',clusters:6,soft:1.2,branches:2,shadow:false},L,60+i);}
 // a big oak at the left edge, behind the haystack
 mnTree(c,52,MD.horizon+150,{h:150,rx:92,ry:66,trunk:14,pal:MN_PAL.leafOak,kind:'oak',clusters:10,soft:1.5,branches:3,lean:8,leafK:.7},L,71);
 // two cypresses by the house, behind it (the classic pair)
 mnCypress(c,1060,MD.horizon+128,142,13,L,80);mnCypress(c,1084,MD.horizon+131,120,11,L,81);}
// ── The house ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A masia seen a little from the left: the front facade (stone below, lime plaster above), a sliver of the right side wall in shade,
// a tiled roof with its hip, the colomar at the left end, the chimney, and a porch wing on the right with two arches.
// o.lights (0..1) lights the windows from inside (dusk).
export function mdHouse(c,L,o={}){const h=MD.house,sd=L.sunDir;const {lights=L.dusk}=o;
 const stone=MN_PAL.stoneWarm,plaster=[240,226,200];const wg=h.wing;
 // shadows of the house and the wing on the ground
 mpCastShadow(c,(h.x0+h.xs)/2,h.ground+2,h.xs-h.x0,h.ground-h.eave,L,.32,8,{d:70});mpCastShadow(c,(wg.x0+wg.x1)/2,wg.ground+2,wg.x1-wg.x0,wg.ground-wg.eave,L,.3,6,{d:40});
 // the side wall (shade side when the sun is to the left, lit when it is to the right)
 const side=[[h.x1,h.eave],[h.xs,h.eaveS],[h.xs,h.groundS],[h.x1,h.ground]];const sideShade=sd>0?.12:.45;
 mnPlaster(c,[[h.x1,h.eave],[h.xs,h.eaveS],[h.xs,h.eave+130],[h.x1,h.eave+118]],plaster,L,89,{shade:sideShade});mnStoneWall(c,[[h.x1,h.eave+118],[h.xs,h.eave+130],[h.xs,h.groundS],[h.x1,h.ground]],stone,L,90,{size:13,shade:sideShade,lightK:sd>0?.8:.3});
 // the wing: front wall with two arches, its left side joining the body
 mnStoneWall(c,mpRect(wg.x0,wg.eave,wg.x1-wg.x0,wg.ground-wg.eave),stone,L,91,{size:13});
 mnPlaster(c,[[h.xs,h.eave+130],[wg.x0,wg.eave],[wg.x0,wg.ground],[h.xs,h.groundS]],plaster,L,88,{shade:sideShade});
 for(let i=0;i<2;i++){const ax=wg.x0+12+i*52,aw=40,ay=wg.ground-4,ah=78;const pts=[[ax,ay],[ax,ay-ah+aw/2]].concat(mpEllipsePts(ax+aw/2,ay-ah+aw/2,aw/2,aw/2,16).filter(p=>p[1]<=ay-ah+aw/2+.5).sort((a,b)=>a[0]-b[0])).concat([[ax+aw,ay-ah+aw/2],[ax+aw,ay]]);
  mpFill(c,pts,mpDark(mpCol([110,90,70],L,.5),.6));c.save();mpPath(c,pts);c.clip();const g=c.createLinearGradient(ax,0,ax+aw,0);g.addColorStop(0,mpRgb(mpLit(mpCol(plaster,L,.5),L,.2),sd>0?0:.55));g.addColorStop(1,mpRgb(mpLit(mpCol(plaster,L,.5),L,.2),sd>0?.55:0));c.fillStyle=g;c.fillRect(ax,ay-ah,aw,ah);
  // inside the porch: a bench, hanging garlic, a basket
  c.fillStyle=mpRgb(mpDark(mpCol(MN_PAL.wood[1],L,.5),.3));c.fillRect(ax+5,ay-26,aw-10,4);c.fillRect(ax+7,ay-22,3,22);c.fillRect(ax+aw-10,ay-22,3,22);
  if(i===1){c.strokeStyle=mpRgb([60,50,40]);c.lineWidth=1;c.beginPath();c.moveTo(ax+aw*.5,ay-ah+aw/2-10);c.lineTo(ax+aw*.5,ay-ah+aw/2+8);c.stroke();c.fillStyle=mpRgb([226,220,200]);for(let k=0;k<4;k++){c.beginPath();c.ellipse(ax+aw*.5+(k%2?3:-3),ay-ah+aw/2+10+k*5,4,3.2,0,0,MP_TAU);c.fill();}}
  c.restore();
  c.strokeStyle=mpRgb(mpLit(mpCol(stone[2],L,.5),L,.2));c.lineWidth=6;c.beginPath();c.moveTo(ax-1,ay);c.lineTo(ax-1,ay-ah+aw/2);c.arc(ax+aw/2,ay-ah+aw/2,aw/2+1,Math.PI,0);c.lineTo(ax+aw+1,ay);c.stroke();c.strokeStyle=mpRgb(mpDark(mpCol(stone[0],L,.5),.3),.8);c.lineWidth=1.6;c.beginPath();c.moveTo(ax+2,ay);c.lineTo(ax+2,ay-ah+aw/2);c.arc(ax+aw/2,ay-ah+aw/2,aw/2-2,Math.PI,0);c.lineTo(ax+aw-2,ay);c.stroke();}
 mpTone(c,mpRect(wg.x0-4,wg.eave,wg.x1-wg.x0+8,14),[60,50,90],.32*L.shadowK,'multiply',4);
 mnRoofTiles(c,[[h.xs-2,wg.ridge],[wg.x1+8,wg.ridge],[wg.x1+16,wg.eave-6],[wg.x0-12,wg.eave-6]],L,92,{rows:6,shade:0,moss:.15});
 // the main body: lime plaster above, stone below
 const body=mpRect(h.x0,h.eave,h.x1-h.x0,h.ground-h.eave);mnPlaster(c,body,plaster,L,93,{shade:0,lightK:1});
 mnStoneWall(c,mpRect(h.x0,h.eave+118,h.x1-h.x0,h.ground-h.eave-118),stone,L,94,{size:14});
 // corner stones (quoins) at both ends
 const q=mpCol(stone[2],L,.5);for(let j=0;j<11;j++){const y=h.eave+8+j*16.6;const w=j%2?14:10;c.fillStyle=mpRgb(mpLit(q,L,.2),.9);c.fillRect(h.x0-2,y,w,13);c.fillStyle=mpRgb(mpMix(mpLit(q,L,.2),mpShade(q,L,sideShade),.5),.9);c.fillRect(h.x1-w+2,y,w,13);}
 // the eave shadow under the roof
 mpTone(c,mpRect(h.x0-4,h.eave,h.x1-h.x0+8,18),[60,50,90],.34*L.shadowK,'multiply',4);
 // the roof: the front slope, the hip to the right, the ridge tiles, the colomar at the left end
 mnRoofTiles(c,[[h.x0+30,h.ridge],[h.x1-26,h.ridge],[h.xs+18,h.eaveS-4],[h.x0-24,h.eave-4]],L,96,{rows:10,shade:0,moss:.25});
 mnRoofTiles(c,[[h.x1-26,h.ridge],[h.x1-26,h.ridge],[h.xs+44,h.eaveS+2],[h.xs+18,h.eaveS-4]],L,95,{rows:9,shade:sd>0?.15:.4,moss:0});
 c.fillStyle=mpRgb(mpLit(mpCol(MN_PAL.tile[2],L,.9),L,.25));for(let x=h.x0+30;x<h.x1-26;x+=12){c.beginPath();c.ellipse(x+6,h.ridge,6.5,3.4,0,Math.PI,MP_TAU);c.fill();}
 c.strokeStyle=mpRgb(mpLit(mpCol(MN_PAL.tile[2],L,.9),L,.2));c.lineWidth=5;c.beginPath();c.moveTo(h.x1-26,h.ridge);c.lineTo(h.xs+44,h.eaveS+2);c.stroke();
 // the eave board
 c.fillStyle=mpRgb(mpLit(mpCol(stone[2],L,.5),L,.1));c.fillRect(h.x0-24,h.eave-5,h.xs-h.x0+42,4);
 // the chimney on the front slope
 const ch=h.chimney;mnStoneWall(c,mpRect(ch.x-12,ch.y-26,24,50),stone,L,97,{size:8,shade:sd<0?0:.25});c.fillStyle=mpRgb(mpDark(mpCol(MN_PAL.tile[1],L,.9),.1));c.fillRect(ch.x-15,ch.y-32,30,7);c.fillStyle=mpRgb([40,30,30]);c.fillRect(ch.x-8,ch.y-29,16,4);
 // the colomar: a square tower at the left end, above the ridge, with pigeon holes and its own roof
 const co=h.colomar;mnPlaster(c,mpRect(co.x0,co.top,co.x1-co.x0,h.ridge-co.top+40),plaster,L,98,{lightK:1});mpTone(c,sd>0?mpRect(co.x0,co.top,12,h.ridge-co.top+40):mpRect(co.x1-12,co.top,12,h.ridge-co.top+40),[80,70,120],.3*L.shadowK,'multiply',2);
 c.fillStyle=mpRgb([48,36,34]);for(let j=0;j<2;j++)for(let i=0;i<3;i++){c.beginPath();c.arc(co.x0+10+i*13,co.top+24+j*16,3.6,0,MP_TAU);c.fill();}c.fillStyle=mpRgb(mpLit(mpCol(MN_PAL.wood[2],L,.6),L,.2));c.fillRect(co.x0+3,co.top+32,co.x1-co.x0-6,3);
 mnRoofTiles(c,[[co.x0+10,co.top-18],[co.x1-10,co.top-18],[co.x1+8,co.top+2],[co.x0-8,co.top+2]],L,99,{rows:3,moss:0});mpTone(c,mpRect(co.x0-2,co.top,co.x1-co.x0+4,8),[60,50,90],.3*L.shadowK,'multiply',2);
 // the windows of the upper floor, deep, with green shutters open
 for(const [x,y] of h.upper)mdWindow(c,x,y,36,46,L,{shutters:true,glow:lights*.7,sill:true});
 // the kitchen window (big, the grandma's): open, with geraniums on the sill
 const w=h.window;mdWindow(c,w.x,w.y,w.w,w.h,L,{shutters:true,glow:lights,sill:true,open:true});
 mnGeranium(c,w.x-w.w/2-2,w.y+w.h/2+2,15,L,120);mnGeranium(c,w.x+w.w/2+4,w.y+w.h/2+2,14,L,121);
 // the door: an arched wooden door with a stone frame and a step
 const d=h.door;const dp=[[d.x-d.w/2,h.ground],[d.x-d.w/2,d.top+d.w/2]].concat(mpEllipsePts(d.x,d.top+d.w/2,d.w/2,d.w/2,14).filter(p=>p[1]<=d.top+d.w/2+.5).sort((a,b)=>a[0]-b[0])).concat([[d.x+d.w/2,d.top+d.w/2],[d.x+d.w/2,h.ground]]);
 c.strokeStyle=mpRgb(mpLit(mpCol(stone[2],L,.5),L,.2));c.lineWidth=8;mpPath(c,dp,false);c.stroke();mnPlanks(c,dp,MN_PAL.wood,L,101,{n:5,dir:'v',shade:.25});
 c.fillStyle=mpRgb([40,30,30],.8);c.fillRect(d.x-d.w/2,d.top,d.w,4);c.fillStyle=mpRgb(mpLit([200,170,80],L,.3));c.beginPath();c.arc(d.x+10,h.ground-36,2.8,0,MP_TAU);c.fill();
 c.fillStyle=mpRgb(mpLit(mpCol(stone[1],L,.5),L,.2));c.fillRect(d.x-d.w/2-8,h.ground-3,d.w+16,7);
 // a climber over the door and along the wall, the bench, the henhouse and the well
 mnClimber(c,[[d.x+d.w/2+12,h.ground-10],[d.x+d.w/2+18,d.top+6],[d.x,d.top-28],[d.x-d.w/2-32,d.top-10],[d.x-d.w/2-46,h.ground-56]],L,102,{leaf:9,n:70,pal:MN_PAL.leafOak});
 mdBench(c,MD.bench.x,MD.bench.y,L);
 mdHenhouse(c,MD.henhouse,L);mdWell(c,MD.well.x,MD.well.y,L);}
// A window: a dark opening, a frame, optional open green shutters and a sill. glow 0..1 lights the inside warm.
export function mdWindow(c,x,y,w,h,L,o={}){const {shutters=false,glow=0,sill=false,open=false}=o;const sd=L.sunDir;
 const inside=mpMix([34,28,40],[255,190,110],glow*.85);c.fillStyle=mpRgb(inside);c.fillRect(x-w/2,y-h/2,w,h);
 if(glow>.05){const g=c.createRadialGradient(x,y,2,x,y,w*.8);g.addColorStop(0,mpRgb([255,230,170],glow*.8));g.addColorStop(1,mpRgb([255,190,110],0));c.fillStyle=g;c.fillRect(x-w/2,y-h/2,w,h);}
 // the depth of the wall: a lit inner jamb on the sun side
 c.fillStyle=mpRgb(mpLit(mpCol([226,212,186],L,.5),L,.3),.9);c.fillRect(sd>0?x+w/2-5:x-w/2,y-h/2,5,h);c.fillStyle=mpRgb(mpDark([226,212,186],.3),.6);c.fillRect(x-w/2,y-h/2,w,4);
 if(!open){c.strokeStyle=mpRgb(mpLit(mpCol([236,230,216],L,.5),L,.2));c.lineWidth=2.4;c.beginPath();c.moveTo(x,y-h/2);c.lineTo(x,y+h/2);c.moveTo(x-w/2,y);c.lineTo(x+w/2,y);c.stroke();c.fillStyle=mpRgb(mpMix(L.sky[1][1],[255,255,255],.3),.35);c.fillRect(x-w/2+2,y-h/2+2,w/2-3,h/2-3);}
 else{c.strokeStyle=mpRgb(mpLit(mpCol([236,230,216],L,.5),L,.2));c.lineWidth=2.4;c.beginPath();c.moveTo(x,y-h/2);c.lineTo(x,y+h/2);c.stroke();}
 c.strokeStyle=mpRgb(mpLit(mpCol([232,224,206],L,.5),L,.25));c.lineWidth=3;c.strokeRect(x-w/2,y-h/2,w,h);
 if(shutters){const sc=mpCol(MN_PAL.shutter,L,.6);for(const s of [-1,1]){const sx=x+s*(w/2+1);const lit=s===sd;c.fillStyle=mpRgb(lit?mpLit(sc,L,.3):mpShade(sc,L,.35));c.fillRect(s<0?sx-w*.42:sx,y-h/2-1,w*.42,h+2);c.strokeStyle=mpRgb(mpDark(sc,.35),.7);c.lineWidth=1;for(let k=1;k<5;k++){const ly=y-h/2+k*h/5;c.beginPath();c.moveTo(s<0?sx-w*.42+2:sx+2,ly);c.lineTo(s<0?sx-2:sx+w*.42-2,ly);c.stroke();}}}
 if(sill){c.fillStyle=mpRgb(mpLit(mpCol(MN_PAL.stoneWarm[2],L,.5),L,.25));c.fillRect(x-w/2-6,y+h/2,w+12,5);c.fillStyle=mpRgb(mpDark(MN_PAL.stoneWarm[0],.2),.5);c.fillRect(x-w/2-6,y+h/2+5,w+12,2);}}
export function mdBench(c,x,y,L){const stone=mpCol(MN_PAL.stoneWarm[1],L,.5);mpGroundShadow(c,x,y+4,40,6,L,.3,3);c.fillStyle=mpRgb(mpShade(stone,L,.3));c.fillRect(x-30,y-14,8,14);c.fillRect(x+22,y-14,8,14);c.fillStyle=mpRgb(mpLit(stone,L,.3));c.fillRect(x-36,y-19,72,6);c.fillStyle=mpRgb(mpShade(stone,L,.2),.7);c.fillRect(x-36,y-13,72,2);}
export function mdHenhouse(c,hh,L){const {x,y,w,h}=hh;const sd=L.sunDir;mpCastShadow(c,x,y+2,w,h,L,.28,5,{d:30});mnPlanks(c,mpRect(x-w/2,y-h,w,h),[[150,118,80],[196,166,120],[226,200,156]],L,131,{n:7,dir:'h',shade:0});
 // the gable roof (tiles) and the little door with a ramp
 mnRoofTiles(c,[[x-w/2-2,y-h-20],[x+w/2+2,y-h-20],[x+w/2+8,y-h+2],[x-w/2-8,y-h+2]],L,132,{rows:3,moss:0});
 c.fillStyle=mpRgb([44,34,30]);c.fillRect(x-10,y-34,20,30);c.fillStyle=mpRgb(mpDark(mpCol(MN_PAL.wood[1],L,.6),.1));c.beginPath();c.moveTo(x-10,y-4);c.lineTo(x+10,y-4);c.lineTo(x+30,y+14);c.lineTo(x-26,y+14);c.closePath();c.fill();c.strokeStyle=mpRgb(mpDark(MN_PAL.wood[0],.3),.5);c.lineWidth=1;for(let k=0;k<4;k++){const u=k/4;c.beginPath();c.moveTo(x-10-16*u,y-4+18*u);c.lineTo(x+10+20*u,y-4+18*u);c.stroke();}
 // wire mesh on one side
 c.strokeStyle=mpRgb([120,120,120],.5);c.lineWidth=.8;for(let i=0;i<6;i++){c.beginPath();c.moveTo(x+w/2-30+i*5,y-h+6);c.lineTo(x+w/2-30+i*5,y-6);c.stroke();}for(let j=0;j<8;j++){c.beginPath();c.moveTo(x+w/2-30,y-h+6+j*7);c.lineTo(x+w/2-5,y-h+6+j*7);c.stroke();}}
export function mdWell(c,x,y,L){const stone=MN_PAL.stone;mpCastShadow(c,x,y+2,60,80,L,.3,5,{d:18});mnStoneWall(c,mpEllipsePts(x,y-18,30,18,20).slice(10).concat([[x+30,y-18],[x+30,y],[x-30,y]]).concat(mpEllipsePts(x,y,30,10,20).filter(p=>p[1]>=y).sort((a,b)=>b[0]-a[0])),stone,L,141,{size:9});
 c.fillStyle=mpRgb([36,30,40]);c.beginPath();c.ellipse(x,y-18,26,13,0,0,MP_TAU);c.fill();c.fillStyle=mpRgb(mpLit(mpCol(stone[2],L,.5),L,.2));c.beginPath();c.ellipse(x,y-18,30,16,0,0,MP_TAU);c.ellipse(x,y-18,25,12,0,0,MP_TAU);c.fill('evenodd');
 const wood=mpCol(MN_PAL.wood[1],L,.6);c.strokeStyle=mpRgb(mpShade(wood,L,.2));c.lineWidth=4;c.beginPath();c.moveTo(x-24,y-20);c.lineTo(x-24,y-62);c.moveTo(x+24,y-20);c.lineTo(x+24,y-62);c.stroke();c.lineWidth=3;c.beginPath();c.moveTo(x-28,y-60);c.lineTo(x+28,y-60);c.stroke();
 // the little roof and the bucket
 mnRoofTiles(c,[[x-30,y-78],[x+30,y-78],[x+38,y-62],[x-38,y-62]],L,142,{rows:2,moss:0});c.strokeStyle=mpRgb([70,60,60]);c.lineWidth=1;c.beginPath();c.moveTo(x,y-60);c.lineTo(x,y-40);c.stroke();c.fillStyle=mpRgb(mpLit(mpCol([120,110,100],L,.5),L,.2));c.fillRect(x-7,y-40,14,12);c.strokeStyle=mpRgb([70,60,60]);c.beginPath();c.arc(x,y-40,7,Math.PI,0);c.stroke();}
// ── The fig tree, the laundry poles and the swing (static parts) ──────────────────────────────────────────────────────────────────
export function mdFig(c,L,o={}){const f=MD.fig;const {swing=true}=o;mpTreeShadow(c,f.x,f.y+2,f.rx*1.1,f.ry*1.1,f.h,L,.34,8);
 // the trunk: thick, grey, forked
 mnTrunk(c,f.x,f.y,f.h*.55,26,L,151,{branches:4,lean:-6,pal:MN_PAL.woodGrey});
 // a low branch towards the right (the swing's branch) and the canopy
 const wood=mpCol(MN_PAL.woodGrey[0],L,.6);c.strokeStyle=mpRgb(wood);c.lineCap='round';c.lineWidth=11;c.beginPath();c.moveTo(f.x-2,f.y-f.h*.42);c.quadraticCurveTo(f.x+50,f.y-f.h*.6,f.swing.x+30,f.swing.y-4);c.stroke();c.strokeStyle=mpRgb(mpLit(mpCol(MN_PAL.woodGrey[2],L,.6),L,.2),.8);c.lineWidth=4;c.beginPath();c.moveTo(f.x-2,f.y-f.h*.42-3);c.quadraticCurveTo(f.x+50,f.y-f.h*.6-3,f.swing.x+30,f.swing.y-7);c.stroke();
 mnCanopy(c,f.x-8,f.y-f.h*.62-f.ry*.3,f.rx,f.ry,MN_PAL.leafFig,L,152,{kind:'fig',clusters:12,soft:1.6,density:1,leafK:.6});
 // figs: small purple drops in the shade of the canopy
 const r=mpRng(153);const fig=mpCol([96,60,110],L,.5);for(let i=0;i<22;i++){const a=r()*MP_TAU,d=.3+r()*.6;const px=f.x-8+Math.cos(a)*f.rx*d*.9,py=f.y-f.h*.62-f.ry*.3+Math.sin(a)*f.ry*d*.9+6;c.fillStyle=mpRgb(r()<.5?fig:mpLight(fig,.2),.95);c.beginPath();c.ellipse(px,py,4,5.2,0,0,MP_TAU);c.fill();c.fillStyle=mpRgb(mpLight(fig,.5),.6);c.beginPath();c.arc(px-L.sunDir*1.2,py-1.5,1.3,0,MP_TAU);c.fill();}
 if(swing)mdSwing(c,f.swing.x,f.swing.y,f.swing.len,0,L);
 // the laundry poles: one by the tree, one by the house corner
 const ln=MD.line;const pole=mpCol(MN_PAL.woodGrey[1],L,.6);for(const [x,y] of [[ln.x0,ln.y0],[ln.x1,ln.y1]]){c.strokeStyle=mpRgb(mpShade(pole,L,.25));c.lineWidth=5;c.beginPath();c.moveTo(x,y+150);c.lineTo(x,y-6);c.stroke();c.strokeStyle=mpRgb(mpLit(pole,L,.3),.8);c.lineWidth=2;c.beginPath();c.moveTo(x-1,y+150);c.lineTo(x-1,y-6);c.stroke();c.fillStyle=mpRgb(mpShade(pole,L,.3));c.beginPath();c.moveTo(x-4,y-4);c.lineTo(x+4,y-4);c.lineTo(x,y-12);c.closePath();c.fill();}}
export function mdSwing(c,x,y,len,ang,L){const sx=Math.sin(ang)*len,sy=Math.cos(ang)*len;c.save();c.strokeStyle=mpRgb(mpCol([150,130,100],L,.5));c.lineWidth=2;c.beginPath();c.moveTo(x-16,y);c.lineTo(x-16+sx,y+sy);c.moveTo(x+16,y);c.lineTo(x+16+sx,y+sy);c.stroke();
 c.save();c.translate(x+sx,y+sy);c.rotate(-ang*.6);mnPlanks(c,mpRect(-22,-3,44,7),MN_PAL.wood,L,161,{n:2,dir:'h',shade:.1});c.restore();c.restore();}
// ── Near: the yard ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mdNear(c,L,o={}){const {rings=[],t=0,plants=true}=o;
 // the yard: grass from the wheat edge down to the bottom, warmer near
 const yard=[[-20,470],[200,500],[400,520],[600,528],[760,508],[1000,520],[1300,540],[1300,820],[-20,820]];mnGround(c,yard,MN_PAL.grassDry,L,171,{strokes:26,dir:.05});
 // a greener area around the pond and near the house, dry straw colour elsewhere: soft patches
 mpSoft(c,mpBlob(240,680,260,172,.2,20,150),mpCol(MN_PAL.grass[1],L,.8),30,.6);mpSoft(c,mpBlob(880,560,220,173,.2,20,60),mpCol(MN_PAL.grass[1],L,.8),24,.45);
 mnGrass(c,yard,MN_PAL.grassDry,L,174,{n:1500,len:11,flowers:70,width:1.4,patches:26});
 mnGrass(c,[[60,560],[460,560],[480,800],[0,800]],MN_PAL.grass,L,175,{n:600,len:12,flowers:30,width:1.5,patches:10});
 // the path from the bottom to the door
 mnPath(c,MD.path,54,30,L,176);
 // the haystack
 mnHaystack(c,MD.haystack.x,MD.haystack.y,MD.haystack.w,MD.haystack.h,L,177);
 // the pond: the dark reflections of the big oak and the fig tree, the reeds, the lilies
 const pp=MD.pond.pts;const pond=mpSmooth(pp,4,true);
 // the bank: a ring of darker wet earth and grass around the pond
 mpSoft(c,mpScaleBlob(pond,1.08),mpCol([120,110,70],L,.6),8,.7);
 mnPond(c,pond,L,178,{rings,t,mirror:[{pts:mpBlob(110,640,70,179,.25,16,30),col:mpCol([40,80,50],L,.4),blur:14,alpha:.35}]});
 mnLilies(c,[[110,720,11],[150,742,9],[330,700,10],[360,676,8],[90,690,8],[300,740,9]],L,181);
 mnReeds(c,392,648,16,60,L,182,{spread:40,lean:4});mnReeds(c,70,660,12,54,L,183,{spread:30,lean:3});mnReeds(c,420,700,10,46,L,184,{spread:26,lean:4});
 // the garden: a fence, dark earth in rows, and the plants
 const g=MD.garden;const gp=mpSmooth(g.pts,1,true);mnEarth(c,g.pts,L,185,{rows:7});
 if(plants){const r=mpRng(186);
  // back row: sunflowers along the fence
  for(let i=0;i<8;i++){const x=1030+i*34+(r()-.5)*14,y=606+(r()-.5)*8;mnSunflower(c,x,y,56+r()*40,L,190+i,{lean:(r()-.5)*14});}
  // tomato plants on stakes
  for(let i=0;i<5;i++){const x=900+i*60+(r()-.5)*14,y=640+(i%2)*10;mnTomatoPlant(c,x,y,56+r()*14,L,200+i);}
  // lettuces and carrot tops in the front rows
  for(let i=0;i<8;i++){const x=840+i*58+(r()-.5)*10,y=716+(r()-.5)*6;mnLettuce(c,x,y,16+r()*5,L,210+i);}
  for(let i=0;i<9;i++){const x=812+i*54+(r()-.5)*8,y=768+(r()-.5)*6;mnCarrotTops(c,x,y,20,L,220+i,2);}
  // a watering can and a basket near Nina's spot are props of the character (live)
 }
 for(let i=0;i<8;i++){const x=1030+i*34;mpGroundShadow(c,x-L.sunDir*8,610,9,3,L,.3,2);}
 mnFence(c,g.fence,26,L,230,{step:30});
 // a few hens' dust patch by the henhouse
 mpSoft(c,mpBlob(1150,590,60,231,.2,14,16),mpCol(MN_PAL.earth,L,.6),8,.5);}
export function mpScaleBlob(pts,k){const b=mpBounds(pts);return pts.map(p=>[b.cx+(p[0]-b.cx)*k,b.cy+(p[1]-b.cy)*k]);}
// ── Foreground: leaves at the top left corner and grass at the bottom ─────────────────────────────────────────────────────────────
export function mdFore(c,L){const r=mpRng(241);c.save();
 // fig leaves hanging in from the top-left corner, dark against the light
 const cols=MN_PAL.leafFig.map(p=>mpShade(mpCol(p,L,.8),L,.3));for(let i=0;i<14;i++){const x=-20+r()*300-i*4,y=-30+r()*120*(1-x/400);const s=26+r()*22;c.fillStyle=mpRgb(cols[r()<.6?0:1],.96);c.save();c.translate(x,y);c.rotate(r()*MP_TAU);c.beginPath();c.moveTo(0,-s);c.bezierCurveTo(s*.9,-s*.7,s*1.1,s*.4,0,s);c.bezierCurveTo(-s*1.1,s*.4,-s*.9,-s*.7,0,-s);c.fill();c.restore();}
 c.strokeStyle=mpRgb(mpShade(mpCol(MN_PAL.woodGrey[0],L,.6),L,.5));c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(-20,10);c.quadraticCurveTo(120,40,260,30);c.stroke();
 c.restore();
 // tall grass tufts at the bottom edge, dark
 mnGrass(c,[[-20,760],[1300,760],[1300,830],[-20,830]],MN_PAL.grass.map(p=>mpDark(p,.25)),L,242,{n:420,len:34,width:2.4,tone:.95});}
// ── The whole panorama in one sheet (stills, preview, tests) ──────────────────────────────────────────────────────────────────────
export function mdPanorama(c,L,o={}){const {fore=true,vignette=true,wave=.35,lights,fig=true,swing=false}=o;c.save();c.beginPath();c.rect(0,0,MD_W,MD_H);c.clip();mdSky(c,L,o);mdFar(c,L);mdMid(c,L,{wave});mdHouse(c,L,{lights});if(fig)mdFig(c,L,{swing});mdNear(c,L,o);
 // the light of the hour over everything: a broad warm light from the sun side, then a warm veil at dusk, a cool one in the morning
 c.save();c.globalCompositeOperation='screen';const gl=c.createRadialGradient(MD_W*(.5+L.sunDir*.35),MD_H*.15,40,MD_W*(.5+L.sunDir*.35),MD_H*.15,MD_W*.9);gl.addColorStop(0,mpRgb(L.sun,.14));gl.addColorStop(1,mpRgb(L.sun,0));c.fillStyle=gl;c.fillRect(0,0,MD_W,MD_H);c.restore();
 c.save();c.globalCompositeOperation='multiply';const gc=c.createRadialGradient(MD_W*(.5-L.sunDir*.4),MD_H*.9,80,MD_W*(.5-L.sunDir*.4),MD_H*.9,MD_W*.9);gc.addColorStop(0,mpRgb(mpMix([200,205,235],L.shadeTint,.3),.22));gc.addColorStop(1,mpRgb([255,255,255],0));c.fillStyle=gc;c.fillRect(0,0,MD_W,MD_H);c.restore();
 if(L.dusk>0)mpTone(c,mpRect(0,0,MD_W,MD_H),mpMix([255,200,140],[255,160,110],L.dusk),.12*L.dusk,'multiply');
 if(L.h<.2)mpTone(c,mpRect(0,0,MD_W,MD_H),[200,220,255],.06*(1-L.h/.2),'multiply');
 if(fore)mdFore(c,L);if(vignette)mpVignette(c,MD_W,MD_H,.14);c.restore();}
// ── The kitchen (episode 1 and the dinner's door) ─────────────────────────────────────────────────────────────────────────────────
// A whitewashed kitchen in the sheet space 1280×800: the stone floor, a big window at the back left on the yard, the beams of the
// ceiling, the hearth with its hood on the right, the table in the middle, shelves with jars, a garlic braid, the cat's basket.
export const MD_CUINA={floor:600,wall:[244,232,206],window:{x:300,y:330,w:230,h:200},beams:[150,330,510,690,870,1050],table:{x:520,y:640,w:360,h:36},hearth:{x:1060,y:600,w:260,h:230},stove:{x:850,y:600,w:130,h:130,top:470},shelf:{x:150,y:230,w:260},chair:{x:400,y:600}};
export function mdCuina(c,L,o={}){const K=MD_CUINA;const warm=mpMix(L.sun,[255,240,210],.5);const wall=mpCol(K.wall,L,.6);
 // the wall: lime, warmer near the window and the hearth, cooler in the corners
 c.fillStyle=mpRgb(wall);c.fillRect(0,0,MD_W,K.floor);mpGouache(c,mpRect(0,0,MD_W,K.floor),wall,{seed:301,strokes:46,light:.09,dark:.1,long:.5});
 const g=c.createLinearGradient(0,0,0,K.floor);g.addColorStop(0,mpRgb(mpDark(wall,.25),.5));g.addColorStop(.5,mpRgb(wall,0));g.addColorStop(1,mpRgb(mpDark(mpMix(wall,[160,140,120],.5),.2),.35));c.fillStyle=g;c.fillRect(0,0,MD_W,K.floor);
 const gc=c.createLinearGradient(0,0,MD_W,0);gc.addColorStop(0,mpRgb(mpMix(wall,[120,120,170],.5),.3));gc.addColorStop(.35,mpRgb(wall,0));gc.addColorStop(.75,mpRgb(wall,0));gc.addColorStop(1,mpRgb(mpMix(wall,[220,150,90],.4),.3));c.fillStyle=gc;c.fillRect(0,0,MD_W,K.floor);
 // the floor: big worn stone slabs in perspective
 const fl=mpCol([176,160,136],L,.5);c.fillStyle=mpRgb(fl);c.fillRect(0,K.floor,MD_W,MD_H-K.floor);const gf=c.createLinearGradient(0,K.floor,0,MD_H);gf.addColorStop(0,mpRgb(mpDark(fl,.3),.5));gf.addColorStop(.3,mpRgb(fl,0));gf.addColorStop(1,mpRgb(mpDark(fl,.2),.3));c.fillStyle=gf;c.fillRect(0,K.floor,MD_W,MD_H-K.floor);
 const r=mpRng(302);for(let i=0;i<40;i++){const x=r()*MD_W,y=K.floor+r()*(MD_H-K.floor);mpSoft(c,mpBlob(x,y,30+r()*50,310+i,.3,10,8+r()*12),r()<.5?mpDark(fl,.12):mpLight(fl,.1),10,.35);}
 c.strokeStyle=mpRgb(mpDark(fl,.35),.5);c.lineWidth=2;for(let j=0;j<5;j++){const y=K.floor+j*j*9+j*20;c.beginPath();c.moveTo(0,y);c.lineTo(MD_W,y+(r()-.5)*4);c.stroke();}
 for(let i=0;i<10;i++){const x0=i*140-60;c.beginPath();c.moveTo(x0,K.floor);c.lineTo(x0+(x0-640)*.45,MD_H);c.stroke();}
 // the skirting: a band of darker lime
 c.fillStyle=mpRgb(mpDark(mpMix(wall,[160,140,120],.5),.15),.8);c.fillRect(0,K.floor-26,MD_W,26);
 // the window: deep (the thick wall), with the yard outside (sky, the fig tree, the wheat) and open shutters inside
 const wd=K.window;c.save();c.beginPath();c.rect(wd.x,wd.y,wd.w,wd.h);c.clip();const sk=c.createLinearGradient(0,wd.y,0,wd.y+wd.h);sk.addColorStop(0,mpRgb(L.sky[0][1]));sk.addColorStop(.6,mpRgb(L.sky[2][1]));sk.addColorStop(1,mpRgb(L.sky[3][1]));c.fillStyle=sk;c.fillRect(wd.x,wd.y,wd.w,wd.h);
 mpCumulus(c,wd.x+80,wd.y+70,120,44,21,L,{soft:1.5});const ridge=mnRidge(wd.w+40,wd.y+120,22,5.5,10,1.3).map(p=>[p[0]+wd.x-20,p[1]]);mnHills(c,ridge,wd.y+150,MN_PAL.hillFar,L,7,{hazeK:.7,folds:2});
 mnWheat(c,mpRect(wd.x-10,wd.y+140,wd.w+20,wd.h-140),L,33,{rows:7,wave:.3,lean:3});mnTree(c,wd.x+170,wd.y+wd.h+10,{h:120,rx:70,ry:50,trunk:9,pal:MN_PAL.leafFig,kind:'fig',clusters:8,soft:1.2,leafK:.7},L,34);
 c.restore();
 const stone=mpCol(MN_PAL.stoneWarm[2],L,.5);c.fillStyle=mpRgb(mpLit(stone,L,.25));c.fillRect(wd.x-18,wd.y+wd.h,wd.w+36,14);c.fillStyle=mpRgb(mpShade(stone,L,.3));c.fillRect(wd.x-18,wd.y-14,18,wd.h+14);c.fillStyle=mpRgb(mpLit(stone,L,.3));c.fillRect(wd.x+wd.w,wd.y-14,18,wd.h+14);c.fillStyle=mpRgb(mpShade(stone,L,.2));c.fillRect(wd.x-18,wd.y-14,wd.w+36,14);
 c.strokeStyle=mpRgb(mpLit(mpCol([236,230,216],L,.5),L,.2));c.lineWidth=5;c.beginPath();c.moveTo(wd.x+wd.w/2,wd.y);c.lineTo(wd.x+wd.w/2,wd.y+wd.h);c.stroke();c.strokeRect(wd.x,wd.y,wd.w,wd.h);
 const sc=mpCol(MN_PAL.shutter,L,.6);mnPlanks(c,mpRect(wd.x-70,wd.y-10,52,wd.h+10),[mpDark(sc,.2),sc,mpLight(sc,.2)],L,35,{n:3,dir:'v'});mnPlanks(c,mpRect(wd.x+wd.w+18,wd.y-10,52,wd.h+10),[mpDark(sc,.2),sc,mpLight(sc,.2)],L,36,{n:3,dir:'v',shade:.2});
 mnGeranium(c,wd.x+40,wd.y+wd.h-2,22,L,37);
 // the light of the window on the floor
 c.save();c.globalCompositeOperation='screen';const lg=c.createLinearGradient(wd.x,wd.y+wd.h,wd.x+200,MD_H);lg.addColorStop(0,mpRgb(warm,.35));lg.addColorStop(1,mpRgb(warm,0));c.fillStyle=lg;c.beginPath();c.moveTo(wd.x,wd.y+wd.h+14);c.lineTo(wd.x+wd.w,wd.y+wd.h+14);c.lineTo(wd.x+wd.w+260,MD_H);c.lineTo(wd.x+60,MD_H);c.closePath();c.fill();c.restore();
 // the ceiling beams
 const wood=mpCol(MN_PAL.wood[1],L,.6);c.fillStyle=mpRgb(mpDark(wood,.35));c.fillRect(0,0,MD_W,44);for(const x of K.beams){mnPlanks(c,mpRect(x-22,0,44,96),MN_PAL.wood,L,40+x,{n:2,dir:'v',shade:.2});c.fillStyle=mpRgb(mpDark(wood,.4),.6);c.fillRect(x-22,92,44,6);}
 c.fillStyle=mpRgb(mpDark(wood,.2));c.fillRect(0,96,MD_W,10);
 // the hearth: a stone fireplace with an arched opening, the fire inside, a pot on a chain, a mantel with a candle and a jug
 const hh=K.hearth;mnStoneWall(c,mpRect(hh.x-hh.w/2,hh.y-hh.h,hh.w,hh.h),MN_PAL.stone,L,52,{size:13});
 const ax=hh.x-hh.w/2+34,aw=hh.w-68,ay=hh.y,ah=hh.h-80;const arch=[[ax,ay],[ax,ay-ah+aw/2]].concat(mpEllipsePts(ax+aw/2,ay-ah+aw/2,aw/2,aw/2,16).filter(p=>p[1]<=ay-ah+aw/2+.5).sort((a,b)=>a[0]-b[0])).concat([[ax+aw,ay-ah+aw/2],[ax+aw,ay]]);
 mpFill(c,arch,[36,26,26]);c.save();mpPath(c,arch);c.clip();const fg=c.createRadialGradient(hh.x,hh.y-30,10,hh.x,hh.y-30,aw*.6);fg.addColorStop(0,'rgba(255,190,80,.95)');fg.addColorStop(.35,'rgba(240,110,40,.6)');fg.addColorStop(1,'rgba(60,20,10,0)');c.fillStyle=fg;c.fillRect(ax,ay-ah,aw,ah);
 // the logs (the flames are drawn live by the episode)
 c.fillStyle=mpRgb([90,60,40]);c.fillRect(hh.x-50,hh.y-22,100,12);c.fillRect(hh.x-40,hh.y-34,80,12);
 c.strokeStyle=mpRgb([60,60,70]);c.lineWidth=3;c.beginPath();c.moveTo(hh.x+10,ay-ah);c.lineTo(hh.x+10,hh.y-96);c.stroke();mcPot(c,hh.x+10,hh.y-60,L);c.restore();
 c.strokeStyle=mpRgb(mpLit(stone,L,.2));c.lineWidth=8;c.beginPath();c.moveTo(ax-2,ay);c.lineTo(ax-2,ay-ah+aw/2);c.arc(ax+aw/2,ay-ah+aw/2,aw/2+2,Math.PI,0);c.lineTo(ax+aw+2,ay);c.stroke();
 mnPlanks(c,mpRect(hh.x-hh.w/2-16,hh.y-hh.h-14,hh.w+32,16),MN_PAL.wood,L,53,{n:1});c.fillStyle=mpRgb([240,230,200]);c.fillRect(hh.x-80,hh.y-hh.h-44,10,30);c.fillStyle=mpRgb([255,200,80]);c.beginPath();c.ellipse(hh.x-75,hh.y-hh.h-50,4,8,0,0,MP_TAU);c.fill();mcJug(c,hh.x+70,hh.y-hh.h-14,L);
 // the iron stove (cuina econòmica) left of the hearth: a black box with a top, a door with a grille, a pipe up to the beams
 const st=K.stove;mpGroundShadow(c,st.x+6,st.y+4,st.w*.6,9,L,.32,4);c.fillStyle=mpRgb([44,42,48]);c.fillRect(st.x-st.w/2,st.y-st.h,st.w,st.h);c.fillStyle=mpRgb([70,68,78]);c.fillRect(st.x-st.w/2-8,st.y-st.h-10,st.w+16,14);c.fillStyle=mpRgb([110,108,118]);c.fillRect(st.x-st.w/2-8,st.y-st.h-10,st.w+16,4);
 for(const [dx,dy] of [[-36,-st.h-8],[30,-st.h-8]]){c.fillStyle=mpRgb([28,26,30]);c.beginPath();c.ellipse(st.x+dx,st.y+dy+5,26,7,0,0,MP_TAU);c.fill();}
 c.fillStyle=mpRgb([28,26,30]);c.fillRect(st.x-40,st.y-st.h+30,80,50);c.fillStyle='rgba(255,160,60,.8)';for(let i=0;i<4;i++)c.fillRect(st.x-30+i*18,st.y-st.h+40,10,30);c.fillStyle=mpRgb([150,140,130]);c.fillRect(st.x+44,st.y-st.h+50,10,4);
 const px=st.x-38;c.fillStyle=mpRgb([44,42,48]);c.fillRect(px-14,0,28,st.y-st.h-10);c.fillRect(px-20,106,40,10);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(px-9,0,4,st.y-st.h-10);for(const s of [-1,1]){c.fillStyle=mpRgb([30,28,34]);c.fillRect(st.x+s*st.w/2-6*(s>0?1:0),st.y-10,6,12);}
 // the table: a thick wooden top on legs with a checked cloth, a loaf, a bowl of tomatoes, a basket of eggs; a chair
 const tb=K.table;mpGroundShadow(c,tb.x,tb.y+118,tb.w*.52,14,L,.3,6);for(const s of [-1,1]){mnPlanks(c,mpRect(tb.x+s*(tb.w/2-40)-12,tb.y+20,24,100),MN_PAL.wood,L,60,{n:1,dir:'v',shade:.3});}
 mnPlanks(c,[[tb.x-tb.w/2,tb.y],[tb.x+tb.w/2,tb.y],[tb.x+tb.w/2+20,tb.y+tb.h],[tb.x-tb.w/2-20,tb.y+tb.h]],MN_PAL.wood,L,61,{n:2,dir:'h'});
 c.save();c.beginPath();c.moveTo(tb.x-tb.w/2+10,tb.y-6);c.lineTo(tb.x+tb.w/2-10,tb.y-6);c.lineTo(tb.x+tb.w/2+8,tb.y+tb.h+30);c.lineTo(tb.x-tb.w/2-8,tb.y+tb.h+30);c.closePath();c.clip();c.fillStyle=mpRgb(mpLit([250,246,236],L,.2));c.fillRect(tb.x-tb.w/2-10,tb.y-6,tb.w+20,tb.h+40);c.strokeStyle=mpRgb([200,70,70],.7);c.lineWidth=5;for(let i=0;i<14;i++){const x=tb.x-tb.w/2+i*32;c.beginPath();c.moveTo(x,tb.y-6);c.lineTo(x+8,tb.y+tb.h+30);c.stroke();}for(let j=0;j<4;j++){const y=tb.y+j*16;c.beginPath();c.moveTo(tb.x-tb.w/2-10,y);c.lineTo(tb.x+tb.w/2+10,y);c.stroke();}c.restore();
 mcBread(c,tb.x-110,tb.y-4,L);mcBowl(c,tb.x+10,tb.y-2,L);mcEggs(c,tb.x+120,tb.y-4,L);
 const chx=K.chair.x,chy=K.chair.y;mnPlanks(c,mpRect(chx-26,chy-120,52,70),MN_PAL.wood,L,62,{n:3,dir:'v',shade:.1});mnPlanks(c,mpRect(chx-30,chy-56,60,14),MN_PAL.wood,L,63,{n:1});for(const s of [-1,1]){mnPlanks(c,mpRect(chx+s*24-5,chy-44,10,60),MN_PAL.wood,L,64,{n:1,dir:'v',shade:.2});}
 // the shelf with jars, the garlic braid, the towel on the stove rail, the basket of the cat
 const sh=K.shelf;mnPlanks(c,mpRect(sh.x-sh.w/2,sh.y,sh.w,12),MN_PAL.wood,L,70,{n:1});for(let i=0;i<5;i++){const x=sh.x-sh.w/2+30+i*50;const col=[[220,150,60],[200,80,60],[120,160,80],[240,200,100],[150,100,170]][i];c.fillStyle=mpRgb(mpLit(col,L,.2));c.fillRect(x-14,sh.y-40+(i%2)*8,28,40-(i%2)*8);c.fillStyle=mpRgb([230,220,200]);c.fillRect(x-14,sh.y-46+(i%2)*8,28,8);c.fillStyle='rgba(255,255,255,.3)';c.fillRect(x-10,sh.y-36+(i%2)*8,5,30-(i%2)*8);}
 c.strokeStyle=mpRgb(mpLit([176,140,80],L,.2));c.lineWidth=3;c.lineCap='round';c.beginPath();c.moveTo(700,104);c.lineTo(700,222);c.stroke();
 for(let i=0;i<7;i++){const gx=700+(i%2?7:-7),gy=140+i*12;const bulb=mpLit(i%3===2?[236,214,220]:[244,238,224],L,.2);mcEllipse(c,gx,gy,8.5,7.5,(i%2?.3:-.3),bulb,{lw:1.2});c.strokeStyle=mpRgb([200,150,170],.7);c.lineWidth=1;c.beginPath();c.moveTo(gx,gy-6);c.lineTo(gx,gy+6);c.stroke();c.strokeStyle=mpRgb([176,140,80]);c.lineWidth=2;c.beginPath();c.moveTo(gx,gy-7);c.lineTo(700,gy-12);c.stroke();}
 c.fillStyle=mpRgb([150,150,160]);c.fillRect(st.x-st.w/2+6,st.y-st.h+16,st.w-12,3);const tw=st.x-st.w/2+16;c.fillStyle=mpRgb(mpLit([236,236,244],L,.15));c.fillRect(tw,st.y-st.h+14,22,52);c.strokeStyle=mpRgb([120,140,200],.65);c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(tw,st.y-st.h+30+i*12);c.lineTo(tw+22,st.y-st.h+30+i*12);c.stroke();}c.strokeStyle=mpRgb([60,50,60],.6);c.lineWidth=1.2;c.strokeRect(tw,st.y-st.h+14,22,52);
 mcEllipse(c,120,700,60,22,0,[190,150,90],{lw:1.6});mcEllipse(c,120,690,48,14,0,[120,90,60],{lw:1.2});
 // the glow of the fire on the right, and a cool shade in the corners
 c.save();c.globalCompositeOperation='screen';const fgl=c.createRadialGradient(hh.x,hh.y-40,20,hh.x,hh.y-40,420);fgl.addColorStop(0,'rgba(255,170,80,.28)');fgl.addColorStop(1,'rgba(255,170,80,0)');c.fillStyle=fgl;c.fillRect(0,0,MD_W,MD_H);c.restore();
 mpTone(c,mpRect(0,K.floor-40,MD_W,MD_H-K.floor+40),[80,70,120],.1,'multiply');}
function mcEggs(c,x,y,L){c.save();c.fillStyle=mpRgb([190,150,90]);c.beginPath();c.ellipse(x,y-8,30,11,0,0,Math.PI);c.fill();for(let i=0;i<4;i++){c.fillStyle=mpRgb([246,232,200]);c.beginPath();c.ellipse(x-18+i*12,y-14-(i%2)*4,6,7.5,0,0,MP_TAU);c.fill();}c.fillStyle=mpRgb([200,160,100]);c.beginPath();c.ellipse(x,y-8,30,7,0,0,Math.PI);c.fill();c.strokeStyle=mpRgb([150,110,60]);c.lineWidth=3;c.beginPath();c.arc(x,y-10,22,Math.PI*1.1,Math.PI*1.9);c.stroke();c.restore();}
function mcPot(c,x,y,L){c.save();c.fillStyle=mpRgb([60,60,70]);c.beginPath();c.ellipse(x,y-18,34,22,0,0,MP_TAU);c.fill();c.fillStyle=mpRgb([90,90,100]);c.beginPath();c.ellipse(x,y-36,30,8,0,0,MP_TAU);c.fill();c.strokeStyle=mpRgb([60,60,70]);c.lineWidth=4;c.beginPath();c.arc(x,y-36,22,Math.PI,0);c.stroke();c.restore();}
function mcBread(c,x,y,L){c.save();c.fillStyle=mpRgb(mpLit([214,160,90],L,.2));c.beginPath();c.ellipse(x,y-8,40,13,0,0,MP_TAU);c.fill();c.strokeStyle=mpRgb([160,100,50],.7);c.lineWidth=2;for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(x+i*18-6,y-16);c.lineTo(x+i*18+6,y-10);c.stroke();}c.restore();}
function mcBowl(c,x,y,L){c.save();c.fillStyle=mpRgb([120,160,180]);c.beginPath();c.ellipse(x,y-8,36,12,0,0,Math.PI);c.fill();for(let i=0;i<4;i++){c.fillStyle=mpRgb([220,60,50]);c.beginPath();c.arc(x-24+i*16,y-12-(i%2)*4,8,0,MP_TAU);c.fill();c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.arc(x-26+i*16,y-15-(i%2)*4,2.5,0,MP_TAU);c.fill();}c.fillStyle=mpRgb([140,180,200]);c.beginPath();c.ellipse(x,y-8,36,8,0,0,Math.PI);c.fill();c.restore();}
function mcJug(c,x,y,L){c.save();c.fillStyle=mpRgb([190,110,70]);c.beginPath();c.ellipse(x,y-24,16,22,0,0,MP_TAU);c.fill();c.fillRect(x-10,y-54,20,14);c.strokeStyle=mpRgb([190,110,70]);c.lineWidth=5;c.beginPath();c.arc(x+18,y-38,10,-Math.PI*.6,Math.PI*.6);c.stroke();c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(x-6,y-28,4,12,0,0,MP_TAU);c.fill();c.restore();}

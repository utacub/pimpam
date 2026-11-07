// El viatge en globus (CE43), 0.43: the world, painted once per journey. Five strips that loop (far clouds, two mountain ranges, the
// plain, the near ground) plus the cloud deck, in the colours of the route and the season, and the sprites of the six landmarks and of
// the life that moves on them. Everything is painted in the light of noon; the light of each hour is laid over it as it is drawn.
import {VGP} from './viatge-pinzell.js';
import {cpuSheet} from './carrega.js';

export const VGM=(()=>{
const {rng,rgb,mix,lighten,darken,smooth,path,blob,ell,fill,tone,dab,line,gouache,vgrad,canvas,ctx2,cumulusSprite,treeSprite,stamp,ridge,mountains,house,tower,loopNoise,TAU}=VGP;
// The loop of every strip, in virtual pixels, and the heights of the strips.
const TW=2400;
const H={clouds:300,mt1:300,mt2:230,plain:340,near:380,deck:480};
// 0.47.1: the deck sheet has DECK_TOP of clear sky above its old top, so the tallest cumulus are never cut flat at the sheet's edge
const DECK_TOP=140;
// ── Palettes ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
const LINE=[56,40,32];
 function palette(route,season){const S=season;
 const P={line:LINE,sunDir:-1,
  far:[140,162,204],far2:[112,138,178],near:[96,124,150],snow:[252,252,255],snowLine:S===3?.7:route===2?.45:.2,mist:[226,236,242],
  hills:[96,156,78],meadow:[92,150,66],hedge:[52,96,50],furrow:[60,90,50],
  fields:[[118,172,70],[190,176,70],[96,150,72],[224,200,96],[140,160,90],[160,186,80]],
  tree:{shade:[30,78,46],base:[58,122,56],light:[110,170,70],dab:[164,208,92],trunk:[70,50,38]},
  pine:{shade:[22,58,46],base:[38,86,60],light:[70,120,74],trunk:[70,50,38]},
  water:{base:[96,150,196],light:[224,242,250],bank:[60,96,70]},sea:{deep:[40,110,170],base:[70,150,200],light:[210,240,250]},
  sand:[236,214,160],rock:[176,160,140],rockShade:[120,104,100],
  village:{wall:[246,238,220],roof:[198,86,60],win:[70,80,110]},stone:[200,190,172],
  cloud:{shade:[160,170,200],base:[240,242,246],light:[255,255,255]}};
 if(S===0){P.fields=[[126,186,84],[214,206,80],[104,166,80],[150,190,96],[230,214,96],[120,176,90]];P.tree={...P.tree,base:[78,148,66],light:[140,196,90],dab:[190,226,120]};P.meadow=[104,170,74];P.blossom=[[250,206,220],[255,246,250]];}
 if(S===1){P.fields=[[214,184,90],[230,206,110],[176,170,70],[200,160,80],[150,160,70],[236,214,130]];P.meadow=[134,160,70];P.hills=[150,160,80];P.tree={...P.tree,base:[52,116,52]};}
 if(S===2){P.fields=[[176,120,70],[200,150,80],[150,110,70],[188,96,64],[210,170,90],[130,120,70]];P.meadow=[150,150,80];P.hills=[160,140,80];P.hedge=[110,70,40];
  P.tree={shade:[110,54,30],base:[196,120,44],light:[236,180,70],dab:[250,214,110],trunk:[70,50,38]};P.tree2={shade:[100,30,30],base:[176,64,44],light:[220,110,64],dab:[240,160,90],trunk:[70,50,38]};P.mist=[236,226,214];}
 if(S===3){P.fields=[[236,240,246],[214,222,236],[244,246,250],[200,206,214],[226,232,240]];P.meadow=[226,232,240];P.hills=[214,222,232];P.hedge=[120,110,110];P.furrow=[170,180,196];
  P.tree={shade:[90,80,80],base:[120,100,90],light:[160,140,120],trunk:[80,62,52],bare:true,snow:[250,252,255]};P.pine={...P.pine,snow:[250,252,255]};P.water={base:[170,190,214],light:[240,246,252],bank:[150,160,170]};
  P.sea={deep:[60,90,130],base:[100,130,166],light:[214,226,240]};P.cloud={shade:[170,176,196],base:[232,234,240],light:[250,250,252]};}
 if(route===1){P.hills=S===3?[200,196,190]:[176,170,110];P.meadow=S===3?[214,220,226]:S===1?[176,166,96]:[150,164,86];P.tree={...P.tree,...(S===3?{}:{})};}
 if(route===2){P.far=[150,170,214];P.far2=[118,140,184];P.near=[88,112,128];P.meadow=S===3?P.meadow:S===2?[170,150,80]:[118,170,84];P.hills=S===3?P.hills:[70,120,70];}
 if(route===3){P.fields=S===0?[[150,190,214],[170,200,220],[140,186,206]]:S===1?[[120,186,80],[140,196,90],[100,170,74]]:S===2?[[214,184,100],[226,196,120],[200,170,96]]:[[180,196,214],[196,210,226],[170,186,206]];
  P.meadow=S===3?[200,206,200]:S===2?[196,176,110]:[150,180,96];P.hills=P.meadow;P.reeds=S===3?[170,160,130]:S===2?[200,170,100]:[110,150,70];}
 if(route===4){P.sea={deep:[20,120,170],base:[40,176,200],light:[214,250,250]};if(S===2)P.sea={deep:[30,70,110],base:[60,110,140],light:[190,214,230]};if(S===3)P.sea={deep:[50,90,130],base:[90,140,170],light:[220,236,246]};
  P.rock=[214,180,130];P.rockShade=[160,120,90];P.meadow=S===3?[200,196,180]:S===1?[200,176,110]:[160,170,100];P.hills=[200,170,120];}
 return P;}
// ── Sprites shared by a journey ────────────────────────────────────────────────────────────────────────────────────────────
 function treeKit(P,route,q){const t=[],pal=P.tree,pal2=P.tree2||P.tree;const bl=P.blossom;
 const sp=(kind,w,h,seed,pp)=>treeSprite(kind,w,h,seed,pp,q,P.sunDir);
 t.round=[sp('round',90,80,1,pal),sp('round',110,96,2,pal2),sp('round',80,74,3,bl?{...pal,blossom:bl[0]}:pal),sp('round',100,90,4,bl?{...pal,blossom:bl[1]}:pal2)];
 t.poplar=[sp('poplar',34,150,5,{...pal,bare:P.tree.bare}),sp('poplar',30,130,6,{...pal2,bare:P.tree.bare})];
 t.pine=[sp('pine',60,130,7,P.pine),sp('pine',54,110,8,P.pine),sp('pine',70,150,9,P.pine)];
 t.olive=[sp('olive',90,64,10,{...pal,shade:[70,90,70],base:[110,130,100],light:[160,176,140],dab:null}),sp('olive',80,58,11,{...pal,shade:[70,90,70],base:[110,130,100],light:[160,176,140],dab:null})];
 t.palm=[sp('palm',70,120,12,{shade:[40,90,50],base:[70,130,60],trunk:[120,90,60]})];
 t.small=[sp(route===2?'pine':'round',40,36,13,route===2?P.pine:pal),sp(route===2?'pine':'round',34,32,14,route===2?P.pine:pal2)];
 return t;}
 function cloudKit(P,q){const out=[];for(let i=0;i<7;i++){const w=[260,180,340,220,140,300,200][i],h=[90,64,110,80,50,100,70][i];out.push(cumulusSprite(w,h,40+i,P.cloud,q,P.sunDir));}return out;}
// ── The strips ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// far clouds: a few cumulus and long wisps; transparent between
 function paintClouds(c,P,K,seed){const r=rng(seed);for(let i=0;i<9;i++){const sp=K.clouds[i%K.clouds.length],x=i*TW/9+r()*120,y=150+r()*120,hh=sp.h*(.5+r()*.5);stamp(c,sp,x,Math.max(y,hh*sp.base/sp.h+2),hh,TW,{foot:sp.base/sp.h});}
 for(let i=0;i<6;i++)dab(c,i*TW/6+r()*200,60+r()*120,260+r()*200,10+r()*10,P.cloud.light,.35,(r()-.5)*.05);
 for(let i=0;i<6;i++){const x=i*TW/6+r()*200;dab(c,x-TW,60,1,1,P.cloud.light,0);}}
 function paintRange(c,P,h,which,route,seed){const base=h-2;
 if(route===4&&which===1){ // islands on the horizon: low humps on a sea line
  c.fillStyle=rgb(mix(P.sea.base,P.far,.5));c.fillRect(0,base-30,TW,32);const r=rng(seed);
  for(let i=0;i<7;i++){const x=i*TW/7+r()*200,w=120+r()*220,hh=24+r()*50;const pts=[];for(let k=0;k<=12;k++){const u=k/12;pts.push([x-w/2+u*w,base-30-hh*Math.pow(Math.sin(u*Math.PI),.7)*(1+(r()-.5)*.2)]);}
   const poly=[...smooth(pts,3),[x+w/2,base-28],[x-w/2,base-28]];fill(c,poly,P.far);tone(c,poly,P.far2,.3);}return;}
 const amp=which===1?(route===2?200:route===3?40:route===4?60:150):(route===2?120:route===3?20:route===1?70:80);
 const rd=ridge(TW,base-(which===1?60:30),amp,seed,which===1?36:28,which===1?1.5:1.1,which===1?3:4);
 const pal=which===1?{base:P.far,shade:darken(P.far,.3),light:lighten(P.far,.4),snow:P.snow}:{base:P.far2,shade:darken(P.far2,.3),light:lighten(P.far2,.35),snow:P.snow};
 const top=Math.min(...rd.map(p=>p[1]));
 mountains(c,rd,h+4,pal,{sunDir:P.sunDir,snowAbove:which===1||route===2||P.snowLine>.6?top+(base-top)*(which===1?P.snowLine+.25:P.snowLine):null,haze:[P.mist,which===1?.5:.4],seed});
 if(which===2){// a treeline along the foot of the near range
  for(let x=0;x<TW;x+=14){const y=h-6-8*loopNoise(x/TW,30,seed);dab(c,x,y,10,6,mix(P.far2,P.tree.base,.25),.7);}}}
// The plain: hills, fields in patches that loop, rivers and tree lines; or sea and coast; or rice paddies.
 function paintPlain(c,P,K,route,season,seed,lights){const h=H.plain,r=rng(seed);
 const top=[];for(let i=0;i<=40;i++){const u=i/40;top.push([u*TW,26+14*loopNoise(u,8,seed)]);}top[40][1]=top[0][1];
 const ground=[...smooth(top,3),[TW,h],[0,h]];
 if(route===1||route===4){// sea up to a coastline that wanders, the land in front
  vgrad(c,[[0,0],[TW,0],[TW,h],[0,h]],[[0,lighten(P.sea.base,.25)],[.5,P.sea.base],[1,P.sea.deep]]);
  for(let i=0;i<120;i++)dab(c,r()*TW,10+r()*h*.7,8+r()*26,1.2,P.sea.light,.45);
  if(route===1){const coast=[];for(let i=0;i<=48;i++){const u=i/48;coast.push([u*TW,140+70*loopNoise(u,7,seed+2)+20*loopNoise(u,23,seed+3)]);}coast[48][1]=coast[0][1];const cs=smooth(coast,3);
   const land=[...cs,[TW,h],[0,h]];c.save();path(c,land);c.fillStyle=rgb(P.sand);c.fill();c.restore();
   const land2=[...cs.map(p=>[p[0],p[1]+10]),[TW,h],[0,h]];gouache(c,land2,P.hills,{seed,strokes:30,long:.08});
   for(const p of cs)if(r()<.5)dab(c,p[0],p[1]+2,10,2,[255,255,255],.6);
   for(let i=0;i<70;i++){const x=r()*TW,y=170+r()*(h-180);stamp(c,K.trees.olive[i%2],x,y,14+y*.06,TW);}}
  else{for(let i=0;i<9;i++){const x=i*TW/9+r()*150,y=110+r()*150,w=60+r()*120,hh=10+r()*16;const pts=[];for(let k=0;k<=10;k++){const u=k/10;pts.push([x-w/2+u*w,y-hh*Math.pow(Math.sin(u*Math.PI),.6)]);}
    const poly=[...smooth(pts,3),[x+w/2,y+3],[x-w/2,y+3]];fill(c,poly,P.rock);tone(c,poly,P.rockShade,.35);dab(c,x,y+4,w*.6,3,[255,255,255],.5);if(r()<.5)house(c,x+(r()-.5)*w*.3,y-hh*.6,10,10,P.village,{flat:true,lights,chimney:false});}}
  return;}
 gouache(c,ground,P.hills,{seed,strokes:40,long:.06});
 if(route===3){// the delta: paddies as mirrors between banks, canals, a few huts
  const rows=[40,70,110,160,220,290];for(let i=0;i<rows.length-1;i++){let x=-r()*80;while(x<TW){const w=80+r()*160;const q=[[x+3,rows[i]+3],[x+w-3,rows[i]+3],[x+w-3,rows[i+1]-3],[x+3,rows[i+1]-3]];
    const col=P.fields[Math.floor(r()*P.fields.length)];fill(c,q,col);if(season===0||season===3){vgrad(c,q,[[0,lighten(col,.3),.6],[1,col,0]]);}
    else{c.save();path(c,q);c.clip();c.strokeStyle=rgb(darken(col,.15),.5);c.lineWidth=1;for(let yy=rows[i]+6;yy<rows[i+1];yy+=5){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();}c.restore();}
    if(x+w>TW){const back=q.map(p=>[p[0]-TW,p[1]]);fill(c,back,col);}x+=w;}}
  for(let i=0;i<14;i++){const x=r()*TW,y=60+r()*220;house(c,x,y,22,18,{wall:[246,240,230],roof:[200,190,150],win:[70,80,110]},{roofK:.62,chimney:false,lights});}
  return;}
 // fields in rows (perspective: thinner at the back), hedges between
 const rows=[30,48,72,104,146,200,270,350];
 for(let i=0;i<rows.length-1;i++){const y0=rows[i],y1=rows[i+1];let x=-r()*60;
  while(x<TW+60){const w=(.06+r()*.1)*TW*(.3+i*.12);const q=[[x,y0+(r()-.5)*3],[x+w,y0+(r()-.5)*3],[x+w+(r()-.5)*8,y1],[x+(r()-.5)*8,y1]];
   const col=route===2&&r()<.6?mix(P.meadow,P.hills,r()):P.fields[Math.floor(r()*P.fields.length)];fill(c,q,col);fill(c,q.map(p=>[p[0]-TW,p[1]]),col);
   if(r()<.35){c.save();path(c,q);c.clip();c.strokeStyle=rgb(P.furrow,.25);c.lineWidth=1;for(let k=1;k<6;k++){const t=k/6;c.beginPath();c.moveTo(x,y0+(y1-y0)*t);c.lineTo(x+w,y0+(y1-y0)*t);c.stroke();}c.restore();}
   if(r()<.7)line(c,[[x,y0],[x+w,y0]],{col:P.hedge,width:.8+i*.35,alpha:.5});x+=w;}}
 // a river that winds across, the same at both ends
 if(route===0||route===2){const ax=[];for(let i=0;i<=30;i++){const u=i/30;ax.push([u*TW,90+120*loopNoise(u,5,seed+11)]);}ax[30][1]=ax[0][1];const sm=smooth(ax,4);
  for(let k=0;k<2;k++){c.save();c.lineCap='round';c.lineJoin='round';c.strokeStyle=rgb(k?P.water.base:P.water.bank,k?1:.6);c.lineWidth=k?7:11;path(c,sm,false);c.stroke();c.restore();}
  for(let i=0;i<sm.length;i+=4)dab(c,sm[i][0],sm[i][1],10,1.2,P.water.light,.5);
  for(let i=0;i<sm.length;i+=3)if(r()<.6)stamp(c,K.trees.small[i%2],sm[i][0]+(r()-.5)*10,sm[i][1]-4,16+sm[i][1]*.04,TW);}
 // villages: clusters of houses with a bell tower
 for(let v=0;v<3;v++){const vx=v*TW/3+200+r()*300,vy=120+r()*120,k=.45+vy/600;for(let i=0;i<9;i++){const hx=vx+(i%5-2)*30*k+(r()-.5)*14,hy=vy+Math.floor(i/5)*22*k;
   if(i===4)tower(c,hx,hy,12*k,40*k,P.village,{lights});else house(c,hx,hy,(24+r()*10)*k,(20+r()*8)*k,P.village,{lights,sunDir:P.sunDir});}}
 // trees, smaller at the back
 const kinds=route===2?K.trees.pine:K.trees.round;
 for(let i=0;i<180;i++){const y=34+Math.pow(r(),1.3)*(h-50),x=r()*TW,s=8+y*.11;stamp(c,kinds[i%kinds.length],x,y,s,TW);}
 if(route===2)for(let i=0;i<80;i++){const y=60+r()*(h-80),x=r()*TW;stamp(c,K.trees.pine[i%3],x,y,12+y*.12,TW);}
 // haze towards the back, only over what is painted (0.47.1: it used to lie over the clear band above the ridge too, a pale strip
 // with a hard top edge across the mountains)
 c.save();c.globalCompositeOperation='source-atop';vgrad(c,[[0,0],[TW,0],[TW,h*.45],[0,h*.45]],[[0,P.mist,.32],[1,P.mist,0]]);c.restore();}
// The near ground: a meadow (or beach, rocks, reeds, sea) with big trees and bushes at the top edge, seen from just above the trees.
 function paintNear(c,P,K,route,season,seed,lights){const h=H.near,r=rng(seed);
 const crest=[];for(let i=0;i<=60;i++){const u=i/60;crest.push([u*TW,120+30*loopNoise(u,9,seed)]);}crest[60][1]=crest[0][1];const top=smooth(crest,3),ground=[...top,[TW,h],[0,h]];
 if(route===4){// the islands' sea: waves up close; the islands are the landmarks
  vgrad(c,ground,[[0,P.sea.base],[1,P.sea.deep]]);for(let i=0;i<220;i++){const x=r()*TW,y=130+r()*(h-130);dab(c,x,y,10+y*.08,1.5+y*.008,P.sea.light,.5);}
  for(let i=0;i<6;i++){const x=i*TW/6+r()*200,y=200+r()*100,w=110+r()*90,hh=34+r()*20;const pts=[[x-w/2,y],[x-w*.3,y-hh*.7],[x,y-hh],[x+w*.35,y-hh*.6],[x+w/2,y]];const poly=smooth(pts,3,true);
   fill(c,poly,P.rock);tone(c,poly,P.rockShade,.35);line(c,poly,{col:LINE,width:1.6,close:true,alpha:.7});dab(c,x,y+3,w*.6,4,[255,255,255],.6);}
  return;}
 gouache(c,ground,route===1&&season!==3?P.meadow:P.meadow,{seed,strokes:60,long:.05,light:.1,dark:.1});
 // ground texture: soft long dabs and small flowers
 for(let i=0;i<260;i++){const x=r()*TW,y=140+r()*(h-140);dab(c,x,y,20+r()*50,3+r()*4,r()<.5?lighten(P.meadow,.12):darken(P.meadow,.1),.4);}
 if(season===0)for(let i=0;i<300;i++){const x=r()*TW,y=150+r()*(h-150);c.fillStyle=rgb([[255,255,255],[250,220,90],[240,150,170]][i%3]);ell(c,x,y,1.4,1);c.fill();}
 if(route===3){// reeds along a canal at the bottom
  c.fillStyle=rgb(P.water.base);c.fillRect(0,h-70,TW,70);for(let i=0;i<80;i++)dab(c,r()*TW,h-60+r()*50,20,1.5,P.water.light,.5);
  c.strokeStyle=rgb(P.reeds);c.lineCap='round';for(let i=0;i<500;i++){const x=r()*TW,y=h-66-r()*30,L=18+r()*28;c.lineWidth=1.2;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+3,y-L*.6,x+(r()-.3)*8,y-L);c.stroke();}}
 if(route===1){// a stone wall and the edge of the cliff seen from above
  for(let x=0;x<TW;x+=16)fill(c,blob(x,h-90+6*Math.sin(x/90),9,x,.2,10,6),mix(P.stone,P.rock,.5));}
 // big trees and bushes, their crowns over the crest
 const kinds=route===2?K.trees.pine:route===1?[...K.trees.olive,...K.trees.pine.slice(0,1)]:[...K.trees.round,...K.trees.poplar];
 for(let i=0;i<22;i++){const x=i*TW/22+r()*60,y=150+r()*120,sp=kinds[i%kinds.length],sz=(sp===K.trees.poplar[0]||sp===K.trees.poplar[1]?1.6:1)*(90+r()*60)*(route===2?1.2:1);stamp(c,sp,x,y,sz,TW);}
 for(let i=0;i<40;i++){const x=r()*TW,y=h-r()*60;fill(c,blob(x,y,14+r()*16,i,.25,12,10+r()*6),darken(P.meadow,.15),.8);}}
// The cloud deck: the tops of a sea of clouds, flat below, catching the light at the top.
 function paintDeck(c,P,K,seed){const r=rng(seed),h=H.deck;c.save();c.translate(0,DECK_TOP);
 vgrad(c,[[0,120],[TW,120],[TW,h-DECK_TOP],[0,h-DECK_TOP]],[[0,P.cloud.base,0],[.25,P.cloud.base,.85],[1,P.cloud.shade,.95]]);
 for(let i=0;i<26;i++){const sp=K.clouds[i%K.clouds.length],x=i*TW/26+r()*40,y=150+r()*80,hh=sp.h*(.9+r()*.8);stamp(c,sp,x,Math.max(y,hh*sp.base/sp.h-DECK_TOP+2),hh,TW,{foot:sp.base/sp.h});}
 for(let i=0;i<14;i++){const sp=K.clouds[(i+3)%K.clouds.length],x=i*TW/14+r()*60,y=230+r()*80,hh=sp.h*(1.2+r()*.6);stamp(c,sp,x,Math.max(y,hh*sp.base/sp.h-DECK_TOP+2),hh,TW,{foot:sp.base/sp.h});}c.restore();}
// ── Landmarks ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each is painted on its own sprite, w × h virtual pixels, its ground line at «g»; «layer» says which strip carries it (near or plain)
// and «y» where its ground line sits on that strip. Life drawn over it each frame is in viatge-art.js (keyed by the landmark's id).
const MARKS={
 masia:{layer:'near',w:520,h:300,g:250,y:250,paint(c,P,K,L){farm(c,P,260,250,1.2,L);c.strokeStyle=rgb(LINE);c.lineWidth=1.4;c.beginPath();c.moveTo(380,200);c.quadraticCurveTo(440,214,500,200);c.stroke();
  for(const [x,col] of [[400,[236,90,80]],[425,[250,250,240]],[450,[90,130,200]],[475,[250,220,90]]])fill(c,[[x-9,207],[x+9,207],[x+8,226],[x-8,226]],col);stamp(c,K.trees.round[0],90,252,120);}},
 ramat:{layer:'near',w:600,h:260,g:220,y:240,paint(c,P,K){for(let i=0;i<14;i++)fill(c,blob(40+i*40,226+(i%3)*6,22,i,.3,10,8),darken(P.meadow,.08),.6);
  c.strokeStyle=rgb([120,90,60]);c.lineWidth=2;c.beginPath();for(let x=20;x<580;x+=60){c.moveTo(x,236);c.lineTo(x,214);}c.moveTo(20,220);c.lineTo(580,220);c.stroke();}},
 poble:{layer:'plain',w:640,h:300,g:240,y:200,paint(c,P,K,L){village(c,P,320,240,1.6,L,9,true);}},
 viaducte:{layer:'near',w:900,h:330,g:300,y:300,paint(c,P,K){vgrad(c,[[0,260],[900,260],[900,330],[0,330]],[[0,P.water.base],[1,darken(P.water.base,.2)]]);for(let i=0;i<20;i++)dab(c,40+i*44,290,22,1.5,P.water.light,.6);
  viaduct(c,P,40,860,280,150,7);}},
 ermita:{layer:'plain',w:420,h:260,g:220,y:150,paint(c,P,K,L){const hill=smooth([[0,220],[120,150],[210,110],[300,150],[420,220]],4);fill(c,[...hill,[420,222],[0,222]],mix(P.hills,P.meadow,.5));
  house(c,210,128,46,40,{wall:[244,236,220],roof:[176,90,64],win:[60,60,80]},{lights:L,chimney:false});tower(c,236,128,12,48,{wall:[244,236,220],roof:[176,90,64]},{lights:L});
  for(let i=0;i<5;i++)stamp(c,K.trees.small[i%2],120+i*45,170+Math.abs(i-2)*12,22);}},
 panta:{layer:'near',w:760,h:300,g:260,y:270,paint(c,P,K){const lake=blob(380,190,330,7,.12,30,74);const ice=P.water.base[2]>200&&P.water.base[0]>150;
  fill(c,lake,ice?[214,230,244]:P.water.base);vgrad(c,lake,[[0,lighten(P.water.base,.3),.5],[1,P.water.base,0]]);for(let i=0;i<16;i++)dab(c,140+i*32,170+(i%4)*14,24,1.4,P.water.light,.6);
  line(c,lake,{col:darken(P.meadow,.3),width:2,close:true,alpha:.5});c.fillStyle=rgb([170,150,130]);c.fillRect(590,200,160,8);for(let x=600;x<750;x+=24)c.fillRect(x,200,4,24);}},
 port:{layer:'near',w:800,h:320,g:280,y:290,paint(c,P,K,L){vgrad(c,[[0,170],[800,170],[800,320],[0,320]],[[0,P.sea.base],[1,P.sea.deep]]);for(let i=0;i<30;i++)dab(c,20+i*26,200+(i%5)*20,16,1.3,P.sea.light,.5);
  fill(c,[[0,140],[800,140],[800,176],[0,176]],P.stone);tone(c,[[0,166],[800,166],[800,176],[0,176]],[60,50,80],.3);line(c,[[0,176],[800,176]],{col:LINE,width:1.6});
  for(let i=0;i<9;i++)house(c,60+i*80,140,64,54,{wall:[[246,226,190],[240,200,170],[230,236,240],[250,236,200]][i%4],roof:[190,90,60],win:[60,70,90]},{lights:L,sunDir:P.sunDir,ln:{col:LINE,width:1}});
  c.strokeStyle=rgb([140,100,70]);c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(80+i*150,176);c.lineTo(80+i*150,200);c.stroke();}}},
 platja:{layer:'near',w:900,h:320,g:270,y:280,paint(c,P,K){vgrad(c,[[0,230],[900,230],[900,320],[0,320]],[[0,P.sea.base],[1,P.sea.deep]]);fill(c,smooth([[0,120],[300,110],[600,126],[900,118],[900,236],[600,244],[300,232],[0,240]],4,true),P.sand);
  for(let i=0;i<24;i++)dab(c,i*38,240,26,2,[255,255,255],.7);for(let i=0;i<5;i++){const x=120+i*160;fill(c,[[x-30,150],[x+30,150],[x,128]],[[230,80,70],[250,210,90],[90,150,210]][i%3]);c.strokeStyle=rgb(LINE);c.lineWidth=1.5;c.beginPath();c.moveTo(x,128);c.lineTo(x,176);c.stroke();}}},
 cala:{layer:'near',w:700,h:320,g:280,y:290,paint(c,P,K){vgrad(c,[[0,150],[700,150],[700,320],[0,320]],[[0,lighten(P.sea.base,.2)],[1,P.sea.deep]]);
  for(const side of [0,1]){const x0=side?700:0,dir=side?-1:1;const rock=smooth([[x0,90],[x0+dir*180,110],[x0+dir*150,200],[x0+dir*220,280],[x0,320]],4);fill(c,[...rock,[x0,320]],P.rock);tone(c,[...rock,[x0,320]],P.rockShade,.3);
   for(let i=0;i<4;i++)stamp(c,K.trees.pine[i%3],x0+dir*(30+i*36),110+i*12,60);}
  fill(c,smooth([[220,150],[350,140],[480,150],[440,176],[260,176]],3,true),P.sand);}},
 pobleblanc:{layer:'plain',w:640,h:300,g:240,y:170,paint(c,P,K,L){const hill=smooth([[0,240],[160,160],[320,120],[480,160],[640,240]],4);fill(c,[...hill,[640,242],[0,242]],P.hills);
  for(let i=0;i<22;i++){const x=150+(i%7)*55+(Math.floor(i/7)%2)*20,y=170+Math.floor(i/7)*24;house(c,x,y,42,30,{wall:[250,250,246],roof:[250,250,246],win:[60,90,130]},{flat:true,lights:L,chimney:false});}
  tower(c,330,130,16,56,{wall:[250,250,246],roof:[200,110,70]},{lights:L});}},
 illot:{layer:'plain',w:380,h:200,g:170,y:130,paint(c,P,K){const isl=smooth([[0,170],[80,120],[190,90],[300,124],[380,170]],4);fill(c,[...isl,[380,172],[0,172]],P.rock);tone(c,[...isl,[380,172],[0,172]],P.rockShade,.3);dab(c,190,172,190,5,[255,255,255],.7);
  for(let i=0;i<3;i++)stamp(c,K.trees.pine[i],140+i*50,118+Math.abs(i-1)*8,40);}},
 far:{layer:'near',w:520,h:360,g:320,y:300,paint(c,P,K,L){const cape=smooth([[0,330],[60,250],[200,220],[360,230],[520,320]],4);vgrad(c,[[0,300],[520,300],[520,360],[0,360]],[[0,P.sea.base],[1,P.sea.deep]]);
  fill(c,[...cape,[520,360],[0,360]],P.rock);tone(c,[...cape,[520,360],[0,360]],P.rockShade,.35);line(c,cape,{col:LINE,width:2,alpha:.8});
  const x=250,y=224;fill(c,[[x-22,y],[x+22,y],[x+14,y-120],[x-14,y-120]],[246,244,236]);for(let k=0;k<3;k++)fill(c,[[x-21+k*2.6,y-20-k*36],[x+21-k*2.6,y-20-k*36],[x+20-k*2.6,y-36-k*36],[x-20+k*2.6,y-36-k*36]],[204,64,54]);
  fill(c,[[x-18,y-120],[x+18,y-120],[x+18,y-146],[x-18,y-146]],[60,70,80]);fill(c,[[x-22,y-146],[x,y-164],[x+22,y-146]],[204,64,54]);line(c,[[x-22,y],[x-14,y-120],[x+14,y-120],[x+22,y]],{col:LINE,width:1.8});L.push([x,y-133,14]);
  house(c,330,232,50,36,{wall:[246,244,236],roof:[204,64,54],win:[60,70,90]},{lights:L,ln:{col:LINE,width:1.2}});}},
 refugi:{layer:'near',w:520,h:300,g:250,y:250,paint(c,P,K,L){for(let i=0;i<5;i++)stamp(c,K.trees.pine[i%3],40+i*100,200+(i%2)*30,150);
  house(c,260,250,130,90,{wall:[150,130,110],roof:[90,80,90],win:[60,60,70],chimney:[120,110,100]},{lights:L,roofK:.5,ln:{col:LINE,width:1.6}});
  c.fillStyle=rgb([120,90,60]);c.fillRect(340,236,60,6);c.fillRect(344,242,4,10);c.fillRect(392,242,4,10);}},
 estany:{layer:'near',w:760,h:320,g:270,y:270,paint(c,P,K){const lake=blob(380,200,330,4,.1,30,80);const winter=P.water.base[0]>150;fill(c,lake,winter?[220,232,246]:[70,130,170]);vgrad(c,lake,[[0,[200,226,240],.6],[1,[70,130,170],0]]);
  for(let i=0;i<14;i++)dab(c,150+i*34,180+(i%3)*16,22,1.4,[230,246,255],.6);for(let i=0;i<8;i++)fill(c,blob(80+i*90,280+(i%2)*14,20,i,.3,10,12),P.rock);tone(c,lake,[30,60,90],.15);}},
 tartera:{layer:'near',w:700,h:320,g:280,y:280,paint(c,P,K){const slope=[[0,320],[0,120],[220,60],[460,120],[700,180],[700,320]];fill(c,smooth(slope,3,true),mix(P.rock,P.meadow,.2));
  const r=rng(9);for(let i=0;i<160;i++){const x=r()*700,y=80+r()*230;fill(c,blob(x,y,4+r()*9,i,.35,8,3+r()*6),r()<.5?P.rock:P.rockShade,.9);}}},
 pontpenjant:{layer:'near',w:760,h:340,g:300,y:300,paint(c,P,K){for(const side of [0,1]){const x0=side?760:0,d=side?-1:1;fill(c,smooth([[x0,40],[x0+d*170,70],[x0+d*150,340],[x0,340]],3,true),P.rock);tone(c,smooth([[x0,40],[x0+d*170,70],[x0+d*150,340],[x0,340]],3,true),P.rockShade,.4);stamp(c,K.trees.pine[side],x0+d*80,70,90);}
  vgrad(c,[[170,200],[590,200],[590,340],[170,340]],[[0,[60,80,100],0],[1,[40,50,70],.6]]);}},
 collada:{layer:'near',w:700,h:280,g:240,y:250,paint(c,P,K){const r=rng(3);for(let i=0;i<30;i++){c.fillStyle=rgb(i%2?[250,220,80]:[240,240,250]);ell(c,r()*700,150+r()*120,2,1.5);c.fill();}
  c.strokeStyle=rgb([150,120,90]);c.lineWidth=2;c.beginPath();c.moveTo(0,250);c.quadraticCurveTo(350,200,700,240);c.stroke();}},
 telecabina:{layer:'near',w:900,h:360,g:320,y:300,paint(c,P,K){for(const x of [120,780]){fill(c,[[x-12,320],[x+12,320],[x+5,60],[x-5,60]],[110,110,120]);fill(c,[[x-30,64],[x+30,64],[x+30,54],[x-30,54]],[90,90,100]);}
  for(let i=0;i<4;i++)stamp(c,K.trees.pine[i%3],60+i*260,300,130);}},
 barraca:{layer:'near',w:480,h:300,g:250,y:250,paint(c,P,K,L){const x=240,y=250;fill(c,[[x-80,y],[x+80,y],[x+80,y-60],[x-80,y-60]],[248,244,236]);fill(c,[[x-92,y-56],[x,y-150],[x+92,y-56]],[204,184,130]);
  c.strokeStyle=rgb([150,130,90]);c.lineWidth=1.2;for(let k=0;k<9;k++){c.beginPath();c.moveTo(x-90+k*20,y-58);c.lineTo(x,y-146);c.stroke();}fill(c,[[x-14,y],[x+14,y],[x+14,y-38],[x-14,y-38]],[90,140,170]);
  line(c,[[x-80,y],[x-80,y-60],[x-92,y-56],[x,y-150],[x+92,y-56],[x+80,y-60],[x+80,y]],{col:LINE,width:1.8});fill(c,[[x+30,y-46],[x+52,y-46],[x+52,y-30],[x+30,y-30]],[70,90,110]);L.push([x+41,y-38,18]);
  for(let i=0;i<3;i++)stamp(c,K.trees.round[i],60+i*170,y+6,i===1?0:70);}},
 canal:{layer:'near',w:900,h:300,g:260,y:270,paint(c,P,K){c.fillStyle=rgb(P.water.base);c.fillRect(0,170,900,90);vgrad(c,[[0,170],[900,170],[900,260],[0,260]],[[0,lighten(P.water.base,.3),.6],[1,P.water.base,0]]);
  for(let i=0;i<30;i++)dab(c,i*30,200+(i%3)*18,18,1.3,P.water.light,.6);fill(c,[[0,160],[900,160],[900,172],[0,172]],[170,150,110]);fill(c,[[0,258],[900,258],[900,270],[0,270]],[170,150,110]);}},
 arrossars:{layer:'near',w:900,h:320,g:280,y:280,paint(c,P,K){const r=rng(5),win=P.water.base[0]>150,bank=[150,130,96];
  // terraced paddies: water that mirrors the sky in spring and winter, young rice in rows in summer, gold in autumn; soft earth banks
  const rows=[[150,206],[214,276]];for(const [y0,y1] of rows){let x=10+r()*20;while(x<880){const w=150+r()*60,q=smooth([[x,y0+3],[x+w*.5,y0+r()*4],[x+w,y0+3],[x+w-4,y1-2],[x+w*.5,y1+r()*3],[x+4,y1-2]],3,true);
   const col=P.fields[Math.floor(r()*P.fields.length)];fill(c,q,col);vgrad(c,q,[[0,lighten(col,.25),.7],[1,col,0]]);
   if(!win&&P.fields[0][1]>P.fields[0][2]){c.save();path(c,q);c.clip();c.strokeStyle=rgb(darken(col,.18),.55);c.lineWidth=1.3;for(let yy=y0+8;yy<y1;yy+=7)for(let xx=x+6;xx<x+w-4;xx+=6){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+1,yy-4);c.stroke();}c.restore();}
   else for(let k=0;k<3;k++)dab(c,x+w*(.25+k*.25),y0+(y1-y0)*.5,w*.12,1.4,[255,255,255],.5);
   line(c,q,{col:bank,width:5,close:true,alpha:.9});line(c,q,{col:darken(bank,.3),width:1.2,close:true,alpha:.6});x+=w+8;}}}},
 llacuna:{layer:'near',w:800,h:300,g:260,y:270,paint(c,P,K){const lake=blob(400,190,360,11,.08,30,80);fill(c,lake,P.water.base);vgrad(c,lake,[[0,lighten(P.water.base,.35),.7],[1,P.water.base,0]]);
  for(let i=0;i<16;i++)dab(c,120+i*36,170+(i%4)*16,24,1.4,P.water.light,.6);c.strokeStyle=rgb(P.reeds||[110,150,70]);c.lineWidth=1.3;const r=rng(2);for(let i=0;i<160;i++){const a=r()*TAU,x=400+Math.cos(a)*360,y=190+Math.sin(a)*80,L=14+r()*20;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*6,y-L);c.stroke();}}},
 dunes:{layer:'near',w:900,h:300,g:260,y:260,paint(c,P,K){for(let i=0;i<4;i++){const x=i*240,d=smooth([[x-60,280],[x+60,170+(i%2)*20],[x+200,190],[x+300,280]],4);fill(c,[...d,[x+300,300],[x-60,300]],P.sand);tone(c,[...d.slice(Math.floor(d.length/2)),[x+300,300]],[200,150,90],.25);}
  c.strokeStyle=rgb([150,170,90]);c.lineWidth=1.3;const r=rng(4);for(let i=0;i<80;i++){const x=r()*900,y=200+r()*80;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*8,y-10-r()*8);c.stroke();}}},
 gola:{layer:'near',w:900,h:320,g:280,y:290,paint(c,P,K){vgrad(c,[[0,140],[900,140],[900,320],[0,320]],[[0,P.sea.base],[1,P.sea.deep]]);fill(c,smooth([[0,150],[300,170],[560,150],[900,160],[900,186],[560,176],[300,196],[0,180]],4,true),P.sand);
  for(let i=0;i<30;i++)dab(c,i*30,220+(i%4)*20,18,1.4,P.sea.light,.5);for(let i=0;i<24;i++)dab(c,i*38,186,24,2,[255,255,255],.7);}},
 moli:{layer:'near',w:520,h:340,g:290,y:280,paint(c,P,K,L){const isl=smooth([[0,320],[60,220],[260,180],[460,220],[520,320]],4);fill(c,[...isl,[520,340],[0,340]],P.rock);tone(c,[...isl,[520,340],[0,340]],P.rockShade,.3);line(c,isl,{col:LINE,width:1.8,alpha:.8});
  const x=260,y=200;fill(c,[[x-34,y],[x+34,y],[x+26,y-110],[x-26,y-110]],[250,248,240]);fill(c,[[x-30,y-108],[x,y-140],[x+30,y-108]],[150,100,70]);line(c,[[x-34,y],[x-26,y-110],[x-30,y-108],[x,y-140],[x+30,y-108],[x+26,y-110],[x+34,y]],{col:LINE,width:1.8});
  fill(c,[[x-8,y],[x+8,y],[x+8,y-24],[x-8,y-24]],[90,120,160]);L.push([x,y-60,10]);house(c,120,232,60,40,{wall:[250,248,240],roof:[250,248,240],win:[60,90,130]},{flat:true,lights:L});}},
 cala2:{layer:'near',w:700,h:320,g:280,y:290,paint(c,P,K){MARKS.cala.paint(c,P,K);}},
 pobleenfilat:{layer:'near',w:700,h:360,g:320,y:300,paint(c,P,K,L){const isl=smooth([[0,340],[120,200],[350,90],[580,200],[700,340]],4);fill(c,[...isl,[700,360],[0,360]],P.rock);tone(c,[...isl,[700,360],[0,360]],P.rockShade,.25);line(c,isl,{col:LINE,width:1.8,alpha:.8});
  for(let i=0;i<20;i++){const row=Math.floor(i/5),x=200+(i%5)*70+row*10,y=150+row*40;if(y<110)continue;house(c,x,y,52,38,{wall:[250,250,246],roof:[250,250,246],win:[60,90,130]},{flat:true,lights:L,chimney:false,ln:{col:LINE,width:1}});}
  tower(c,350,112,16,50,{wall:[250,250,246],roof:[90,150,200]},{lights:L,ln:{col:LINE,width:1}});}},
 castell:{layer:'plain',w:600,h:320,g:280,y:200,paint(c,P,K,L){const hill=smooth([[0,280],[150,170],[300,130],[450,170],[600,280]],4);fill(c,[...hill,[600,282],[0,282]],P.rock);tone(c,[...hill,[600,282],[0,282]],P.rockShade,.3);
  const st=[226,206,170];fill(c,[[200,140],[400,140],[400,80],[200,80]],st);for(let k=0;k<8;k++)fill(c,[[200+k*25,80],[212+k*25,80],[212+k*25,70],[200+k*25,70]],st);
  for(const x of [190,410]){fill(c,[[x-20,150],[x+20,150],[x+20,40],[x-20,40]],st);fill(c,[[x-24,42],[x,10],[x+24,42]],[180,80,60]);L.push([x,90,8]);}
  tone(c,[[300,140],[400,140],[400,80],[300,80]],[90,70,80],.18);line(c,[[180,150],[180,40],[200,40],[200,80],[390,80],[390,40],[430,40],[430,150]],{col:LINE,width:1.4,alpha:.8});}},
 illadeserta:{layer:'near',w:600,h:320,g:280,y:290,paint(c,P,K){const isl=smooth([[0,300],[100,220],[300,200],[500,220],[600,300]],4);fill(c,[...isl,[600,320],[0,320]],P.sand);dab(c,300,300,300,10,[255,255,255],.6);stamp(c,K.trees.palm[0],330,220,120);stamp(c,K.trees.palm[0],380,226,90);}},
 farpetit:{layer:'near',w:460,h:320,g:280,y:290,paint(c,P,K,L){const isl=smooth([[0,300],[80,230],[230,200],[380,230],[460,300]],4);fill(c,[...isl,[460,320],[0,320]],P.rock);tone(c,[...isl,[460,320],[0,320]],P.rockShade,.3);line(c,isl,{col:LINE,width:1.8,alpha:.8});
  const x=230,y=206;fill(c,[[x-14,y],[x+14,y],[x+10,y-80],[x-10,y-80]],[250,248,240]);fill(c,[[x-12,y-80],[x+12,y-80],[x+12,y-98],[x-12,y-98]],[60,70,80]);fill(c,[[x-15,y-98],[x,y-112],[x+15,y-98]],[40,120,160]);line(c,[[x-14,y],[x-10,y-80],[x+10,y-80],[x+14,y]],{col:LINE,width:1.6});L.push([x,y-89,10]);}}};
 function farm(c,P,x,y,k,L){const wall=[236,220,190],roof=[178,84,58];fill(c,[[x-110*k,y],[x+60*k,y],[x+60*k,y-70*k],[x-110*k,y-70*k]],wall);fill(c,[[x-120*k,y-66*k],[x-25*k,y-110*k],[x+70*k,y-66*k]],roof);tone(c,[[x-25*k,y-110*k],[x+70*k,y-66*k],[x-25*k,y-66*k]],[60,30,40],.2);
 fill(c,[[x+60*k,y],[x+110*k,y],[x+110*k,y-44*k],[x+60*k,y-44*k]],darken(wall,.08));fill(c,[[x+56*k,y-42*k],[x+114*k,y-42*k],[x+110*k,y-56*k],[x+60*k,y-56*k]],roof);
 for(const wx of [-80,-40,10]){c.fillStyle=rgb([70,70,90]);c.fillRect(x+wx*k,y-48*k,14*k,16*k);L.push([x+wx*k+7*k,y-40*k,14*k]);}fill(c,[[x-12*k,y],[x+6*k,y],[x+6*k,y-30*k],[x-12*k,y-30*k]],[120,80,50]);
 line(c,[[x-110*k,y],[x-110*k,y-70*k],[x-120*k,y-66*k],[x-25*k,y-110*k],[x+70*k,y-66*k],[x+60*k,y-70*k],[x+60*k,y]],{col:LINE,width:1.8});}
 function village(c,P,x,y,k,L,n,tower1){const r=rng(n*7);for(let i=0;i<n;i++){const hx=x+(i%5-2)*40*k+(r()-.5)*12,hy=y-30*k+Math.floor(i/5)*30*k;if(tower1&&i===2){tower(c,hx,hy,16*k,60*k,P.village,{lights:L});continue;}house(c,hx,hy,(34+r()*12)*k,(28+r()*10)*k,P.village,{lights:L,sunDir:P.sunDir,ln:{col:LINE,width:.9}});}}
 function viaduct(c,P,x0,x1,y,h,arches){const w=x1-x0,aw=w/arches,stone=P.stone;
 const shape=()=>{c.beginPath();c.rect(x0,y-h,w,h+2);for(let i=0;i<arches;i++){const cx=x0+aw*(i+.5),r=aw*.36;c.moveTo(cx-r,y+2);c.lineTo(cx-r,y-h*.45);c.arc(cx,y-h*.45,r,Math.PI,0);c.lineTo(cx+r,y+2);c.closePath();}};
 c.save();shape();c.fillStyle=rgb(stone);c.fill('evenodd');shape();c.clip('evenodd');tone(c,[[x0,y-h*.5],[x1,y-h*.5],[x1,y+2],[x0,y+2]],[60,50,80],.18);const r=rng(17);
 for(let i=0;i<arches*8;i++){c.globalAlpha=.16;c.fillStyle=rgb(r()<.5?lighten(stone,.25):darken(stone,.25));c.fillRect(x0+r()*w,y-h+r()*h,8+r()*16,3+r()*4);}c.restore();
 fill(c,[[x0,y-h],[x1,y-h],[x1,y-h*.86],[x0,y-h*.86]],darken(stone,.2));line(c,[[x0,y-h],[x1,y-h]],{col:LINE,width:2});
 c.save();c.strokeStyle=rgb(LINE,.8);c.lineWidth=1.8;for(let i=0;i<arches;i++){const cx=x0+aw*(i+.5),r=aw*.36;c.beginPath();c.moveTo(cx-r,y);c.lineTo(cx-r,y-h*.45);c.arc(cx,y-h*.45,r,Math.PI,0);c.lineTo(cx+r,y);c.stroke();}c.restore();}
// ── A journey's world ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// The jobs, each one sheet, so that a load can paint one per frame behind the cover (and a new journey while the screen is dark).
 function plan(route,season,q,seed=1){const P=palette(route,season),W={route,season,q,P,TW,H,sheets:{},marks:{},lights:{plain:[],near:[]},K:null};
 const qf=Math.min(1,q*.75),jobs=[];
 jobs.push(()=>{W.K={trees:treeKit(P,route,q),clouds:cloudKit(P,qf)};});
 const sheet=(name,h,qq,paint)=>jobs.push(()=>{W.sheets[name]={img:cpuSheet(Math.ceil(TW*qq),Math.ceil(h*qq),c=>{c.scale(qq,qq);paint(c);}),q:qq,h};});
 sheet('clouds',H.clouds,qf,c=>paintClouds(c,P,W.K,seed+1));
 sheet('mt1',H.mt1,qf,c=>paintRange(c,P,H.mt1,1,route,seed+2));
 sheet('mt2',H.mt2,qf,c=>paintRange(c,P,H.mt2,2,route,seed+3));
 sheet('plain',H.plain,qf,c=>paintPlain(c,P,W.K,route,season,seed+4,W.lights.plain));
 sheet('near',H.near,q,c=>paintNear(c,P,W.K,route,season,seed+5,W.lights.near));
 sheet('deck',H.deck,qf,c=>paintDeck(c,P,W.K,seed+6));
 const ids=['masia','ramat','poble','viaducte','ermita','panta','port','platja','cala','pobleblanc','illot','far','refugi','estany','tartera','pontpenjant','collada','telecabina','barraca','canal','arrossars','llacuna','dunes','gola','moli','cala2','pobleenfilat','castell','illadeserta','farpetit'];
 for(const id of ids.slice(route*6,route*6+6))jobs.push(()=>{const M=MARKS[id],qq=M.layer==='near'?q:qf,L=[];W.marks[id]={...M,id,lights:L,img:cpuSheet(Math.ceil(M.w*qq),Math.ceil(M.h*qq),c=>{c.scale(qq,qq);M.paint(c,P,W.K,L);})};});
 return {W,jobs};}
return {TW,H,DECK_TOP,palette,plan,MARKS,LINE};
})();

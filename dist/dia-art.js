// Dia rere dia (CE09): the drawing. A village of cut paper fills the whole screen: mountains, a valley with a river and a viaduct,
// the village on its hill with the bell tower, and a meadow in front with a path, a pond and two big trees that frame the sky.
// The light of the day (sky, sun, moon, stars, the colour of every piece of paper) follows the position Φ = 8 × day + moment, which
// moves smoothly after each press. What happens at each moment is drawn large, on the meadow or in the sky, so it uses the whole frame.
// Scene units: the height of the screen goes from −1 (top) to 1 (bottom); the width from −X to X, with X = width / height.
// Photosensitivity: the sky and the light change in fades of two seconds or more; nothing flashes or flickers.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,Krand,Kmix,Krgba,Krgb} from './kaleido-base.js';
import {Ptorn,Pblob,Pleaf,paperScene} from './paper.js';
import {diaDay} from './dia.js';
import {escDecor,escVeil} from './escenari.js';

// ── Light of the day ────────────────────────────────────────────────────────────────────────────────────────────────────
// Sky (top, middle, horizon), the tint the paper takes (multiplied), how dark it is, and the warmth of the light, at each moment.
const D_SKY=[['#5d6fc0','#e9a3c6','#ffd0a0'],['#3f9df0','#8ccff8','#dff4ff'],['#2a86ee','#62bbff','#c4eaff'],['#3a8ce4','#83c5f4','#f6e7c2'],
 ['#4b4ca0','#e2708e','#ffb25a'],['#1f2766','#4d3f92','#b06aa0'],['#0c1440','#18266a','#2e3f84'],['#121c50','#2b3d82','#7864a8']];
const D_TINT=['#ffdcd0','#fff8ee','#ffffff','#fff3dc','#ffc9a4','#9a90cf','#6170b8','#7179bc'];
const D_DARK=[.15,0,0,0,.08,.55,1,.75];
const D_cyc=(arr,ph)=>{const x=((ph%8)+8)%8,i=Math.floor(x),f=Ksmooth(x-i);return typeof arr[0]==='number'?arr[i]+(arr[(i+1)%8]-arr[i])*f:Kmix(arr[i],arr[(i+1)%8],f);};
const Dmul=(col,t)=>{const a=Krgb(col);return '#'+a.map((v,i)=>Math.round(v*t[i]/255).toString(16).padStart(2,'0')).join('');};
// Season colours: meadow, fields, hills, tree crowns (three), with a smooth change at the turn of the day.
const D_SEASON=[
 {meadow:'#7fd36a',fields:['#9ee07a','#f2df4a','#6cc66a','#b6ea8a'],hill:'#79c977',valley:'#93d983',crowns:['#5fc35c','#86d965','#4daf55'],path:'#e9c98d',far:'#a8bdf0',near:'#7fb0d8',bare:false},
 {meadow:'#9bcf55',fields:['#f0c84a','#e3b23c','#8fcf5a','#f6d860'],hill:'#8cc85a',valley:'#b5d867',crowns:['#3f9e4a','#53b04f','#2f8a43'],path:'#ecc884',far:'#a9bdf2',near:'#82aedc',bare:false},
 {meadow:'#c6b25a',fields:['#c98a4b','#e0a84f','#a8743e','#d9c06a'],hill:'#b9a75a',valley:'#cfb86a',crowns:['#ef8a2c','#e0552b','#f2b33a'],path:'#dcb27c',far:'#aab3e8',near:'#8da2d0',bare:false},
 {meadow:'#9fb489',fields:['#b7bf98','#a9ae8a','#c4c6a4','#9fa883'],hill:'#93a985',valley:'#aab89a',crowns:['#7c6a58','#7c6a58','#7c6a58'],path:'#d8c4a6',far:'#b4c0ea',near:'#8fa6d2',bare:true}];
const Dseason=(a,b,f)=>{if(f<=0)return D_SEASON[a];if(f>=1)return D_SEASON[b];const A=D_SEASON[a],B=D_SEASON[b],o={};for(const k in A)if(k!=='bare')o[k]=Array.isArray(A[k])?A[k].map((x,i)=>Kmix(x,B[k][i],f)):Kmix(A[k],B[k],f);o.bare=f>.5?b===3:a===3;return o;};

// ── Static geometry (scene units), built once ─────────────────────────────────────────────────────────────────────────
let D_GEO=null;
const Dline=(x0,x1,step,f)=>{const out=[];for(let x=x0;x<=x1+1e-9;x+=step)out.push([x,f(x)]);return out;};
const Drect=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const Doval=(cx,cy,rx,ry,n=24)=>Array.from({length:n},(_,i)=>[cx+Math.cos(i*K_TAU/n)*rx,cy+Math.sin(i*K_TAU/n)*ry]);
export const diaHill=x=>.24-.27*Math.exp(-Math.pow((x+.62)/.58,2));
function Dgeo(){if(D_GEO)return D_GEO;const g={};
 const farTop=x=>-.05-.17*Math.pow(.5+.5*Math.sin(x*1.9+.4),1.6)-.07*(.5+.5*Math.sin(x*4.7+1.7))-.02*Math.sin(x*11.3);
 g.far=Ptorn([...Dline(-2.9,2.9,.03,farTop),[2.9,.6],[-2.9,.6]],.006,11,.035);
 // Snow caps on the highest peaks: small most of the year, large in winter.
 g.caps=[[],[]];{const xs=Dline(-2.9,2.9,.01,farTop);for(let i=1;i<xs.length-1;i++){const [x,y]=xs[i];if(!(y<xs[i-1][1]&&y<xs[i+1][1])||y>-.2)continue;
  [.035,.075].forEach((ch,k)=>{let a=i,b=i;while(a>0&&xs[a-1][1]<y+ch)a--;while(b<xs.length-1&&xs[b+1][1]<y+ch)b++;const top=xs.slice(a,b+1),n=Math.max(3,Math.round((top.length)/3)),bot=[];
   for(let j=n;j>=0;j--){const bx=xs[a][0]+(xs[b][0]-xs[a][0])*j/n;bot.push([bx,y+ch-(j%2?.012:0)]);}g.caps[k].push([...top,...bot]);});}}
 g.near=Ptorn([...Dline(-2.9,2.9,.05,x=>.05-.08*(.5+.5*Math.sin(x*2.9+2.2))-.04*(.5+.5*Math.sin(x*7.1+.3))),[2.9,.6],[-2.9,.6]],.006,12,.035);
 g.valley=Ptorn([...Dline(-2.9,2.9,.08,x=>.13-.025*Math.sin(x*1.7+.5)),[2.9,.8],[-2.9,.8]],.005,13,.04);
 // Fields of the valley: strips between the hill and the meadow.
 g.fields=[];for(let i=0;i<9;i++){const x0=-2.6+i*.62+Krand(i,3)*.1,x1=x0+.5+Krand(i,4)*.18,y0=.15+Krand(i,5)*.03,y1=.33;g.fields.push(Ptorn([[x0,y0],[x1,y0+.01],[x1+.06,y1],[x0-.05,y1]],.004,40+i,.03));}
 g.hill=Ptorn([...Dline(-2.2,.55,.05,diaHill),[.55,.6],[-2.2,.6]],.005,14,.03);
 // A knoll with the tunnel where the train goes in: a stone portal on its right flank, at the level of the viaduct.
 g.knollY=x=>.2-.28*Math.exp(-Math.pow((x-.02)/.3,2));g.knoll=Ptorn([...Dline(-.5,.62,.03,g.knollY),[.62,.4],[-.5,.4]],.004,15,.025);
 g.portal=Ptorn([[.16,.066],[.16,-.012],[.2,-.03],[.26,-.012],[.26,.066]],.002,151,.015);
 g.portalHole=[[.178,.066],...Dline(.178,.242,.004,x=>.012-.04*Math.sqrt(Math.max(0,1-Math.pow((x-.21)/.032,2)))),[.242,.066]];
 // River: from the far valley, under the viaduct, across the meadow into the pond.
 const river=[[.33,.13],[.4,.17],[.56,.21],[.52,.26],[.66,.31],[.86,.38],[.95,.46],[1.0,.6]],side=s=>river.map(([x,y],i)=>{const t=i/(river.length-1),wd=.008+.06*t*t,j=Math.min(i+1,river.length-1),k=Math.max(i-1,0),dx=river[j][0]-river[k][0],dy=river[j][1]-river[k][1],l=Math.hypot(dx,dy)||1;return [x-dy/l*wd*s,y+dx/l*wd*s];});
 g.river=Ptorn([...side(1),...side(-1).reverse()],.004,16,.02);
 g.pond=Ptorn(Doval(1.02,.66,.46,.1,40),.006,17,.03);g.pondRim=Ptorn(Doval(1.02,.665,.5,.12,40),.008,18,.03);
 // Viaduct: tall stone bays with round arches, from the tunnel to beyond the right edge; the valley shows through the arches.
 g.bays=[];for(let i=0;i<18;i++){const x0=.25+i*.15,x1=x0+.15,p=.017,m=(x0+x1)/2,hw=(x1-x0)/2-p;
  g.bays.push([[x0,.066],[x1,.066],[x1,.3],[x1-p,.3],[x1-p,.15],...Dline(x1-p,x0+p,-.006,x=>.15-.055*Math.sqrt(Math.max(0,1-Math.pow((x-m)/hw,2)))).slice(1,-1),[x0+p,.15],[x0+p,.3],[x0,.3]]);}
 g.deck=Drect(.24,.05,3.2,.068);
 // Village: two rows of houses on the hill, the church and its bell tower.
 g.houses=[];const spots=[];for(let i=0;i<17;i++){const x=-1.42+i*.082+(Krand(i,21)-.5)*.02;if(x>-.86&&x<-.5)continue;spots.push(x);}
 spots.forEach((x,i)=>{for(const row of [0,1]){if(row===1&&Krand(i,22)<.25)continue;const wd=.1+Krand(i*2+row,23)*.035,ht=.07+Krand(i*2+row,24)*.035,gx=x+(row?.035:0),gy=diaHill(gx)+(row?.075:.012),rh=.04+Krand(i,25)*.015;
  const walls=['#f7d9a9','#f4bba5','#fbe9c9','#eac690','#f8cdb9','#f3e1b5','#e9b9c9'],roofs=['#d9653b','#c4512f','#e07a4a','#b84a35'];
  const flat=Krand(i*3+row,26)<.3;const roof=flat?[[gx-wd/2-.008,gy-ht],[gx+wd/2+.008,gy-ht],[gx+wd/2+.008,gy-ht-.016],[gx-wd/2-.008,gy-ht-.02]]:[[gx-wd/2-.012,gy-ht],[gx+wd/2+.012,gy-ht],[gx+wd*.1,gy-ht-rh],[gx-wd*.1,gy-ht-rh]];
  const wins=[];const nw=wd>.115?2:1;for(let k=0;k<nw;k++)wins.push({x:gx+(nw===1?0:(k?.024:-.024)),y:gy-ht*.62,on:4.85+Krand(i*7+k+row*3,27)*.9,off:6.9+Krand(i*7+k+row*3,28)*1.05,hue:Math.floor(Krand(i*7+k,29)*4)});
  if(row===1)wins.push({x:gx+wd*.28,y:gy-ht*.25,door:true});
  g.houses.push({row,x:gx,y:gy,wd,ht,wall:walls[(i*3+row)%walls.length],roof:roofs[(i+row*2)%roofs.length],walls:Ptorn(Drect(gx-wd/2,gy-ht,gx+wd/2,gy+.02),.002,50+i*2+row,.02),roofPts:Ptorn(roof,.002,90+i*2+row,.02),wins,chimney:Krand(i+row*9,31)<.5?{x:gx+wd*.25,y:gy-ht-rh*.55}:null});}});
 g.houses.sort((a,b)=>a.row-b.row);
 const tx=-.61,ty=diaHill(tx);g.tower={x:tx,y:ty,body:Ptorn(Drect(tx-.036,ty-.33,tx+.036,ty+.03),.002,60,.02),roof:[[tx-.045,ty-.33],[tx+.045,ty-.33],[tx,ty-.45]],bell:{x:tx,y:ty-.27}};
 g.nave={body:Ptorn(Drect(-.82,ty-.1,tx-.036,ty+.04),.002,61,.02),roof:[[-.835,ty-.1],[tx-.03,ty-.1],[tx-.03,ty-.14],[-.835,ty-.135]]};
 // The plaza tree and the trees of the valley and the meadow: [x, ground y, crown radius].
 g.trees=[[.0,.2,.07],[-1.62,.29,.08],[1.3,.3,.07],[1.72,.31,.08],[-.98,.36,.09],[.42,.4,.09],[-2.1,.33,.08],[2.2,.32,.08]].map(([x,y,r],i)=>({x,y,r,crown:Pblob(r,22,.12,70+i),seed:70+i}));
 // Meadow (foreground) and the path to the village.
 g.meadow=Ptorn([...Dline(-2.9,2.9,.05,x=>.34+.02*Math.sin(x*3.1+.7)+.012*Math.sin(x*9.3)),[2.9,1.1],[-2.9,1.1]],.006,19,.03);
 const path=[[-.12,1.1,.3],[-.28,.86,.22],[-.4,.66,.14],[-.46,.5,.08],[-.48,.38,.04]];g.path=Ptorn([...path.map(([x,y,w])=>[x-w/2,y]),...path.reverse().map(([x,y,w])=>[x+w/2,y])],.005,20,.02);
 // A nearer fold of the meadow, a little darker, with tufts of grass along its edge.
 const bandY=x=>.7+.035*Math.sin(x*1.6+1.1)+.015*Math.sin(x*4.3);g.bandY=bandY;g.band=Ptorn([...Dline(-2.9,2.9,.05,bandY),[2.9,1.1],[-2.9,1.1]],.006,21,.03);
 g.tufts=Array.from({length:60},(_,i)=>{const x=-2.8+i*.095+Krand(i,83)*.05;return {x,y:bandY(x)+.004,h:.025+Krand(i,85)*.03,seed:i};});
 // Lamp posts along the path: [x, foot y, height], drawn in paper; their light is added after.
 g.lamps=[[-.62,.56,.13],[-.6,.78,.2],[.0,1.0,.3]].map(([x,y,hh])=>{const k=hh/.2;return {x,y,hh,k,head:[x,y-hh-.02*k],
  pieces:[Drect(x-.005*k,y-hh,x+.005*k,y),Drect(x-.012*k,y-.012*k,x+.012*k,y),[[x-.016*k,y-hh-.002*k],[x+.016*k,y-hh-.002*k],[x+.022*k,y-hh-.04*k],[x-.022*k,y-hh-.04*k]],[[x-.028*k,y-hh-.04*k],[x+.028*k,y-hh-.04*k],[x,y-hh-.062*k]]]};});
 // The two big trees that frame the sky, one on each side; points are measured inward from the screen edge (mirrored per side).
 g.frame=[-1,1].map(sd=>{const M=([x,y])=>[-sd*x,y],cl=y=>.1+.07*Math.pow((1.1-y)/1.4,2),wd=y=>.055-.025*(1.1-y)/1.4,trunk=[];
  for(let y=1.12;y>=-.32;y-=.04)trunk.push([cl(y)-wd(y),y]);for(let y=-.32;y<=1.12;y+=.04)trunk.push([cl(y)+wd(y),y]);
  const top=[cl(-.3),-.3],limb=(a,b,w0,w1)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),nx=-dy/l,ny=dx/l;return [[a[0]+nx*w0,a[1]+ny*w0],[b[0]+nx*w1,b[1]+ny*w1],[b[0]-nx*w1,b[1]-ny*w1],[a[0]-nx*w0,a[1]-ny*w0]];};
  const ends=[[.36,-.6],[.16,-.82],[.5,-.42],[.04,-.68]],limbs=ends.map(e=>limb(top,e,.022,.009)),twigs=[];
  ends.forEach((e,i)=>{for(let k=0;k<3;k++){const an=-Math.PI/2+(k-1)*.7+(i-1.5)*.25,len=.1+Krand(i*3+k,231)*.08,b=[e[0]+Math.cos(an)*len,e[1]+Math.sin(an)*len];twigs.push(limb(e,b,.008,.003));for(let j=0;j<2;j++){const a2=an+(j?.5:-.5),c2=[b[0]+Math.cos(a2)*len*.55,b[1]+Math.sin(a2)*len*.55];twigs.push(limb(b,c2,.003,.0015));}}});
  const crowns=[[.0,-.88,.22],[.2,-.84,.21],[.38,-.72,.19],[.12,-.66,.2],[.3,-.52,.15],[-.04,-.62,.16],[.52,-.54,.13],[.08,-.46,.12],[.46,-.86,.17]].map(([x,y,r],i)=>({c:M([x,y]),r,pts:Pblob(r,26,.12,210+i+(sd>0?20:0)).map(M)}));
  return {sd,trunk:Ptorn(trunk.map(M),.003,200+sd,.03),limbs:limbs.map(p=>p.map(M)),twigs:twigs.map(p=>p.map(M)),crowns,bush:[[.18,1.0,.12],[.36,1.06,.1],[.02,.96,.09]].map(([x,y,r],i)=>({pts:Pblob(r,20,.14,260+i+(sd>0?5:0)).map(M),c:M([x,y])}))};});
 // Meadow flowers.
 g.flowers=Array.from({length:70},(_,i)=>{const x=-2.6+Krand(i,81)*5.2,y=.42+Math.pow(Krand(i,82),.8)*.56;return {x,y,r:.008+.012*(y-.4),hue:i%5,seed:i};}).filter(f=>!(f.x>.5&&f.x<1.55&&f.y>.52&&f.y<.8)&&Math.abs(f.x-(-.3+(f.y-.6)*.5))>.12);
 g.stars=Array.from({length:170},(_,i)=>({x:(Krand(i,91)-.5)*5.6,y:-1+Math.pow(Krand(i,92),1.4)*1.05,r:.0025+Krand(i,93)*.004,ph:Krand(i,94)*K_TAU,sp:.4+Krand(i,95)*.6}));
 g.clouds=Array.from({length:12},(_,i)=>({x:(Krand(i,101)-.5)*5.4,y:-.82+Krand(i,102)*.45,s:.7+Krand(i,103)*.6,v:.006+Krand(i,104)*.008,parts:[Pblob(.12,18,.1,110+i,0,0),Pblob(.09,16,.1,130+i,-.11,.03),Pblob(.085,16,.1,150+i,.12,.035),Pblob(.06,14,.1,170+i,.04,-.06)]}));
 D_GEO=g;return g;}

// ── Sheets ──
// A sheet is a canvas of its own, at the resolution of the screen, where still paper is cut once (untinted). The light of the moment
// is laid on it as a multiply fill on a black ground, made again only when the light changes: that gives the tinted colour already
// weighted by the paper's own alpha, so the sheet is laid by clearing its shape from the scene (destination-out) and adding it back
// (lighter). This keeps cut edges and soft shadows exact, as if every piece had been tinted.
// A value of the paper that changes slowly (the season at the turn of the day, snow settling or melting, ice, frost) is not cut again
// at every step: the sheets of its two ends are cross-faded. Sheets not laid for a few seconds are let go.
// Without offscreen canvases (tests in Node) the pieces are drawn directly, tinted one by one.
const D_SHEETS=new Map(),Dq=(x,n)=>Math.round(x*n)/n;let D_FRAME=0;
function Dcanvas(W,H){if(typeof document!=='undefined'&&document.createElement){const cv=document.createElement('canvas');cv.width=W;cv.height=H;return cv;}if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(W,H);return null;}
function Dfree(cv){if(cv){cv.width=0;cv.height=0;}}
function Dsweep(){D_FRAME++;if(D_FRAME%60)return;for(const [id,slots] of D_SHEETS){for(let i=slots.length-1;i>=0;i--)if(D_FRAME-slots[i].used>240){Dfree(slots[i].cv);Dfree(slots[i].tv);slots.splice(i,1);}if(!slots.length)D_SHEETS.delete(id);}}
function Dsheet(slots,W,H,sx,sy,key,cut,tint){let sh=slots.find(x=>x.key===key);
 if(!sh){if(slots.length<2){const cv=Dcanvas(W,H),tv=Dcanvas(W,H);if(!cv||!tv||!cv.getContext||!cv.getContext('2d'))return null;sh={cv,tv,key:null,tkey:null,used:0};slots.push(sh);}
  else sh=slots[0].used<=slots[1].used?slots[0]:slots[1];
  const cc=sh.cv.getContext('2d');cc.setTransform(1,0,0,1,0,0);cc.globalAlpha=1;cc.globalCompositeOperation='source-over';cc.clearRect(0,0,W,H);cc.setTransform(sx,0,0,sy,0,0);cut(cc);sh.key=key;sh.tkey=null;}
 sh.used=D_FRAME;
 if(tint!=='#ffffff'&&sh.tkey!==tint){const t=sh.tv.getContext('2d');t.setTransform(1,0,0,1,0,0);t.globalAlpha=1;t.globalCompositeOperation='source-over';t.fillStyle='#000';t.fillRect(0,0,W,H);t.drawImage(sh.cv,0,0);
  t.globalCompositeOperation='multiply';t.fillStyle=tint;t.fillRect(0,0,W,H);t.globalCompositeOperation='source-over';sh.tkey=tint;}
 return sh;}
// paper: the values the sheet depends on ({} if none); keyOf(v) names the sheet of a state v; cut(ctx,v,L) draws it with the tint L.
function Dlayer(c,w,h,name,paper,keyOf,tint,alpha,cut,L){const names=Object.keys(paper),moving=names.find(k=>paper[k]>0&&paper[k]<1),base={};for(const k of names)base[k]=Dq(paper[k],10);
 const ends=moving?[[{...base,[moving]:0},1-paper[moving]],[{...base,[moving]:1},paper[moving]]]:[[base,1]];
 const m=c.getTransform?c.getTransform():null,sx=m?Math.hypot(m.a,m.b):1,sy=m?Math.hypot(m.c,m.d):1,W=Math.max(1,Math.round(w*sx)),H=Math.max(1,Math.round(h*sy)),id=`${name}|${W}x${H}`;
 let slots=D_SHEETS.get(id);if(!slots)D_SHEETS.set(id,slots=[]);
 const sheets=[];for(const [v] of ends){const sh=Dsheet(slots,W,H,sx,sy,keyOf(v),cc=>cut(cc,v,x=>x),tint);if(!sh){sheets.length=0;break;}sheets.push(sh);}
 c.save();
 if(!sheets.length){c.globalAlpha*=alpha;cut(c,ends.reduce((a,b)=>b[1]>a[1]?b:a)[0],L);}
 else if(tint==='#ffffff'&&sheets.length===1){c.globalAlpha*=alpha;c.drawImage(sheets[0].cv,0,0,w,h);}
 else{const ga=c.globalAlpha*alpha;c.globalCompositeOperation='destination-out';sheets.forEach((sh,i)=>{c.globalAlpha=ga*ends[i][1];c.drawImage(sh.cv,0,0,w,h);});
  c.globalCompositeOperation='lighter';sheets.forEach((sh,i)=>{c.globalAlpha=ga*ends[i][1];c.drawImage(tint==='#ffffff'?Dwhite(sh,W,H):sh.tv,0,0,w,h);});}
 c.restore();}
// At full light the tinted sheet is the sheet itself on black (only needed while two sheets are cross-faded).
function Dwhite(sh,W,H){if(sh.tkey!=='#ffffff'){const t=sh.tv.getContext('2d');t.setTransform(1,0,0,1,0,0);t.globalAlpha=1;t.globalCompositeOperation='source-over';t.fillStyle='#000';t.fillRect(0,0,W,H);t.drawImage(sh.cv,0,0);sh.tkey='#ffffff';}return sh.tv;}

// ── Helpers ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const Dwin=(rel,a,b,fade=.45)=>Ksmooth((rel-a)/fade)*(1-Ksmooth((rel-b)/fade));
const Dpiece=(pts,color,o={})=>({pts,color,tex:o.tex,v:o.v??1,z:o.z||0,x:o.x||0,y:o.y||0,s:o.s??1,r:o.r||0,rim:o.rim,j:o.j||0,fold:o.fold});
function Dglow(c,x,y,r,col,a){if(a<=.003||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,Krgba(col,a));g.addColorStop(.35,Krgba(col,a*.45));g.addColorStop(1,Krgba(col,0));c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
// Sun and moon follow arcs across the whole sky.
function Dsun(rel,X){const u=((rel>6?rel-8:rel)+.35)/4.7;return {x:-X*.9+u*1.8*X,y:.06-.8*Math.sin(Math.PI*Kclamp(u)),up:u>0&&u<1};}
function Dmoon(rel,X){const r=rel<1?rel+8:rel,u=(r-4.65)/3.6;return {x:-X*.85+u*1.7*X,y:.04-.72*Math.sin(Math.PI*Kclamp(u)),up:u>0&&u<1};}

// The state of the scene at a position Φ: today, its events, and how far each is.
// Dday gives the same for a neighbouring day (rel then runs past 8, or below 0), so that what lasts into the night, or begins before
// dawn, is carried across the turn of the day instead of being cut there.
function Dstate(o){return Dday(o,Math.floor(o.phi/8));}
function Dday(o,d){const only=o.stops&&o.stops.length<8?o.stops:null,fd=dd=>{const x=diaDay(dd);return only?{...x,events:x.events.map((e,m)=>only.includes(m)?e:null)}:x;};
 const phi=o.phi,rel=phi-8*d,day=fd(d),prev=fd(d-1),next=fd(d+1),tm=((o.target%8)+8)%8,td=Math.floor(o.target/8);
 // Progress of an event: 1 once its moment has passed, its own clock while it is the moment of the last press, 0 before.
 // The moment of the press before (o.prev) keeps its own clock, o.held seconds older, so what it set going carries on after the next press.
 const clk=(dd,m)=>{const x=8*dd+m;return x===o.target?o.t:x===o.prev?(o.held??1e3)+o.t:x<o.target?1e9:-1;};
 const prog=(dd,m,len=6)=>{const k=clk(dd,m);return k>=1e9?1:k<0?0:Kclamp((k-1.6)/len);};
 // Near the end of a day, the next one's season fades in.
 const turn=Ksmooth((rel-7.25)/.65),season=Dseason(day.season,next.season,turn);
 // A window of time [a,b] (in moments of the day) for days that pass a test: a window that starts before dawn begins at the end of the
 // day before, one that ends after the night carries on into the next morning.
 const across=(test,a,b,fade=.45)=>Math.min(1,(test(day)?Dwin(rel,a,b,fade):0)+(a<0&&test(next)?Dwin(rel-8,a,b,fade):0)+(b>8&&test(prev)?Dwin(rel+8,a,b,fade):0));
 return {phi,d,rel,day,prev,next,season,turn,prog,clk,has:id=>day.events.includes(id),hadPrev:id=>prev.events.includes(id),soon:id=>next.events.includes(id),
  across,win:(id,a,b,fade)=>across(x=>x.events.includes(id),a,b,fade)};}

// Adaptive quality, as in Natura: on a slow device the paper grain, the soft shadows and the number of drops give way to lighter versions.
const D_QUALITY={ms:0,level:1,low:false,hold:0,drops:0};
export function diaQuality(){return {...D_QUALITY};}
function Dmeasure(ms){const q=D_QUALITY;q.ms=q.ms*.92+ms*.08;if(q.hold>0)q.hold--;
 if(!q.low&&q.ms>22){q.low=true;q.hold=600*2**Math.min(q.drops,4);q.drops++;}else if(q.low&&q.hold<=0&&q.drops<3&&q.ms<11)q.low=false;
 const target=q.low?0:1;q.level+=(target-q.level)*.04;if(Math.abs(q.level-target)<.01)q.level=target;}
export function drawDia(c,w,h,o){const adaptive=o.adaptive&&typeof performance!=='undefined',t0=adaptive?performance.now():0;
 const r=Ddraw(c,w,h,adaptive?{...o,quality:Math.min(o.quality??1,D_QUALITY.level)}:o);if(adaptive)Dmeasure(performance.now()-t0);return r;}
// ── Drawing ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: {phi (position shown), target (position of the last press), t (seconds since it), prev and held (the position of the press
// before and how long it had been shown), stops (the moments of the chosen set: only
// their events happen), idle (seconds, for the slow breathing of the scene), reduced, quality, adaptive}.
function Ddraw(c,w,h,o){Dsweep();const g=Dgeo(),R=h/2,cx=w/2,cy=h/2,X=w/h,P=(x,y)=>[cx+x*R,cy+y*R],st=Dstate(o),{rel,day,season,prog}=st,idle=o.reduced?0:o.idle||0,q=Kclamp(o.quality??1);
 const night=D_cyc(D_DARK,rel),tint=Krgb(D_cyc(D_TINT,rel)),L=col=>Dmul(col,tint);
 // The decor (escDecor, 0.17) is the sky and the landscape: the mountains, the valley, the village, the meadow and its flowers, and the
 // big trees. Atenuat it is drawn first under a veil; without it, the base colour. What the day brings is then drawn over it at its own
 // colours (LF), without the light of the moment: the sun, the moon and the stars, the clouds, the weather and the events of the day.
 // On a white base the stars, the sun, the moon, the rain and the snow are drawn in ink.
 const d=escDecor(o),ink=d.white&&!d.full,LF=d.full?L:(col=>col);
 // Weather of the moment: clouds while it rains (morning to noon), a white sky while it snows.
 const rain=day.rain?(day.events.includes('arc')?Dwin(rel,.6,2.3,.5)*(1-prog(st.d,2,2.2)):Dwin(rel,.6,1.5,.5)):0,snowing=Math.max(st.across(x=>x.snow,.6,2.4,.5),.45*st.across(x=>x.snow,6.6,8.4,.4));
 const overcast=Math.max(rain,.7*snowing);
 // Snow settles in the morning it falls, stays through the night and melts the next morning (unless more falls).
 const snowCover=day.snow?Ksmooth((rel-.7)/1.3):st.prev.snow?1-Ksmooth(rel/1.1):0;
 // Flowers in the meadow in spring and summer: they fade at the turn into autumn, come back at the turn into spring, and hide under snow.
 const bloom=v=>v.season<2?1:0,flowerA=(bloom(day)*(1-st.turn)+bloom(st.next)*st.turn)*(1-Ksmooth((snowCover-.25)/.2));
 // ── Sky ──
 let [top,mid,hor]=[0,1,2].map(i=>D_cyc(D_SKY.map(s=>s[i]),rel));
 if(overcast>0){const grey=Kmix('#8f9fbc','#3c4670',night);top=Kmix(top,grey,overcast*.55);mid=Kmix(mid,grey,overcast*.5);hor=Kmix(hor,Kmix(grey,'#ffffff',.25),overcast*.45);}
 // The last press of the night: the horizon begins to clear, and the colour carries on into the dawn.
 {const c7=prog(st.d,7,5)*Ksmooth((rel-6.5)/.3)*(1-Ksmooth((rel-7.7)/.3));if(c7>0){hor=Kmix(hor,'#b08ac4',.55*c7);mid=Kmix(mid,'#4f5aa6',.35*c7);}}
 if(st.has('celVermell')){const a=Dwin(rel,3.5,4.85,.5)*(.4+.6*prog(st.d,4,3));mid=Kmix(mid,'#f0503c',a*.55);hor=Kmix(hor,'#ff7a2c',a*.5);}
 const skyFill=()=>{const sky=c.createLinearGradient(0,0,0,cy+.12*R);sky.addColorStop(0,top);sky.addColorStop(.55,mid);sky.addColorStop(1,hor);c.fillStyle=sky;c.fillRect(0,0,w,h);};
 const celestial=()=>{
 // Stars, with a slow and shallow twinkle.
 const starA=Kclamp(night*1.25-.25)*(1-overcast*.8)*(st.has('estrellesNeu')?1:.85);if(starA>.01){for(const s of g.stars){if(Math.abs(s.x)>X+.05)continue;const [x,y]=P(s.x,s.y),a=starA*(.7+.3*Math.sin(idle*s.sp+s.ph));c.fillStyle=Krgba(ink?'#3d4270':'#fffbe8',a);c.beginPath();c.arc(x,y,Math.max(.6,s.r*R),0,K_TAU);c.fill();}}
 // The first star of the evening, larger.
 const vesper=Dwin(rel,4.75,7.4,.4)*(1-overcast);if(vesper>.01){const [x,y]=P(-X*.32,-.55);Dglow(c,x,y,.05*R,'#fff6d0',.55*vesper);c.fillStyle=Krgba(ink?'#3d4270':'#fffdf2',vesper);c.beginPath();c.arc(x,y,.008*R,0,K_TAU);c.fill();}
 // Sun.
 const sun=Dsun(rel,X);if(sun.up){const [x,y]=P(sun.x,sun.y),low=Kclamp(1-(-sun.y)/.45),col=Kmix('#fff4c2','#ffb04a',low),a=1-overcast*.75;Dglow(c,x,y,.42*R,col,.38*a);Dglow(c,x,y,.16*R,'#fffbe6',.5*a);c.fillStyle=Krgba(ink?Kmix(col,'#ff9a1a',.6):col,a);c.beginPath();c.arc(x,y,.075*R,0,K_TAU);c.fill();if(ink){c.strokeStyle=Krgba('#c0600c',a);c.lineWidth=Math.max(1.5,.006*R);c.stroke();}}
 // Moon (larger and warmer on the night of the big moon).
 const moon=Dmoon(rel,X),big=st.has('llunaGran')?Dwin(rel,5.4,7.6,.5):0;if(moon.up){const [x,y]=P(moon.x,moon.y),r=(.055+.045*big)*R,col=Kmix('#f6f1da','#ffe2a8',big),a=1-overcast*.6;Dglow(c,x,y,r*4.5,'#cfd8ff',.22*a);c.fillStyle=Krgba(col,a);c.beginPath();c.arc(x,y,r,0,K_TAU);c.fill();if(ink){c.strokeStyle=Krgba('#8a7f5c',a);c.lineWidth=Math.max(1.5,.006*R);c.stroke();}
  c.fillStyle=Krgba('#d9d2b8',.5*a);for(const [dx,dy,rr] of [[-.3,-.2,.22],[.25,.15,.16],[-.05,.35,.12]]){c.beginPath();c.arc(x+dx*r,y+dy*r,rr*r,0,K_TAU);c.fill();}}
 // Rainbow, drawn from left to right when the rain stops.
 if(st.has('arc')){const a=Dwin(rel,1.7,2.5,.45),u=prog(st.d,2,2.6);const grow=rel>2.5?1:u;if(a*grow>.01){const [x,y]=P(.25,.62),r0=1.3*R;c.save();c.lineWidth=.048*R;const cols=['#ff5a5a','#ffa23a','#ffe14a','#5bd46a','#4aa8ff','#8a6cff'];
  cols.forEach((col,i)=>{c.strokeStyle=Krgba(col,.5*a);c.beginPath();c.arc(x,y,r0-i*.034*R,Math.PI,Math.PI+Math.PI*grow);c.stroke();});c.restore();}}
 };
 // Clouds of paper.
 // How many clouds: a cloud comes or goes by growing or shrinking (paper is never see-through, so it does not fade).
 const cloudN=Math.max(0,5-3*night+7*Math.max(overcast,st.win('nuvolsRosats',-.5,1.3),st.has('nuvolsDaurats')||st.has('celVermell')?.5*Dwin(rel,3.4,5):0));
 const cloudCol=Kmix(Kmix('#ffffff','#ffc6d8',Kclamp(1-Math.min(rel,8-rel)/.9)*((rel>4?st.soon('nuvolsRosats'):st.has('nuvolsRosats'))?1:.6)),'#ffb36a',Kclamp(1-Math.abs(rel-4)/.9)*(st.has('nuvolsDaurats')||st.has('celVermell')?1:.55));
 const clouds=[];g.clouds.slice(0,Math.ceil(cloudN)).forEach((k,i)=>{const span=2*X+1.2,x=((k.x+idle*k.v+X+.6)%span+span)%span-X-.6,dark=Kmix(cloudCol,'#9aa4bd',overcast*.6);
  const f=Ksmooth(Kclamp(cloudN-i));if(f<.03)return;for(const p of k.parts)clouds.push(Dpiece(p,LF(dark),{x,y:k.y+.12*Ksmooth((overcast-.1)/.4),s:k.s*f,tex:'washi'}));});
 // ── Landscape ──
 // The still paper (mountains, valley, viaduct, village, meadow) is cut once into a sheet of its own and kept while nothing in it changes;
 // the light of the moment is laid over it as a multiply tint, which is the same as tinting every piece (see Dsheet).
 // Ice on the pond from the afternoon it freezes to the next morning; frost on the roofs from the end of the night to mid-morning.
 const iceA=(st.has('gel')?Dwin(rel,2.6,8.6,.4)*Math.max(prog(st.d,3,3),rel>3.5?1:0):0)+(st.hadPrev('gel')?Dwin(rel+8,2.6,8.6,.4):0),frost=st.win('gebre',-.6,2,.5);
 const paper={turn:st.turn,snow:snowCover,ice:iceA,frost},vSeason=v=>Dseason(day.season,st.next.season,v.turn),vKey=v=>[v.turn===0?day.season:v.turn===1?st.next.season:`${day.season}>${st.next.season}:${v.turn}`,v.snow,v.ice,v.frost,X.toFixed(3),q>.5?1:0].join();
 const landLayers=(L,v)=>{const season=vSeason(v),snowCover=v.snow,iceA=v.ice,frost=v.frost,layers=[];
  layers.push({pieces:[Dpiece(g.far,L(season.far)),...g.caps[0].map(p=>Dpiece(p,L('#f6f8ff'))),...g.caps[1].map(p=>Dpiece(p,L('#f6f8ff'),{v:season.bare?1:snowCover}))],texA:.35,tex:'pulp',shadow:.6});
 layers.push({pieces:[Dpiece(g.near,L(season.near))],texA:.4,tex:'pulp',shadow:.7});
 layers.push({pieces:[Dpiece(g.valley,L(season.valley)),...g.fields.map((p,i)=>Dpiece(p,L(Kmix(season.fields[i%4],'#ffffff',snowCover*.85)),{j:(i%3-1)*.4,tex:'crepe'}))],texA:.45,tex:'card'});
 const water=Kmix(Kmix('#4cb6ec','#d4f1ff',iceA),'#ffffff',0);
 layers.push({pieces:[Dpiece(g.river,L(water),{tex:'washi'})],texA:.3,shadow:.4});
 // The knoll, the viaduct coming out of it, the stone portal of the tunnel, and the train (which disappears into the tunnel).
 layers.push({pieces:[Dpiece(g.knoll,L(Kmix(season.hill,'#ffffff',snowCover*.8)))],texA:.4,tex:'card'});
 layers.push({pieces:[...g.bays.map((b,i)=>Dpiece(b,L('#e9bd8f'),{j:(i%2)*.3})),Dpiece(g.deck,L('#d6a274'))],texA:.4,tex:'pulp'});
 layers.push({pieces:[Dpiece(g.portal,L('#c9a27e')),Dpiece(g.portalHole,L('#2e2838'))],texA:.4,tex:'pulp',shadow:.5});
 // Village: the hill, the church, then the back and the front row of houses (each row its own sheet, so outlines never show through).
 const roofSnow=Math.max(snowCover,frost*.7)*.85;
 layers.push({pieces:[Dpiece(g.hill,L(Kmix(season.hill,'#ffffff',snowCover*.8)),{tex:'card'}),Dpiece(g.nave.body,L('#f3dcb4')),Dpiece(g.nave.roof,L(Kmix('#c4512f','#ffffff',roofSnow))),Dpiece(g.tower.body,L('#efd2a4')),Dpiece(g.tower.roof,L(Kmix('#b84a35','#ffffff',roofSnow)))],texA:.45,tex:'pulp',shadow:.8});
 for(const row of [0,1]){const pcs=[];for(const hs of g.houses){if(hs.row!==row)continue;if(hs.chimney)pcs.push(Dpiece(Drect(hs.chimney.x-.008,hs.chimney.y-.03,hs.chimney.x+.008,hs.chimney.y+.01),L('#b95a3e')));pcs.push(Dpiece(hs.walls,L(hs.wall),{j:row?.15:-.15}),Dpiece(hs.roofPts,L(Kmix(hs.roof,'#ffffff',roofSnow))));}
  layers.push({pieces:pcs,texA:.45,tex:'pulp',shadow:.8,edge:false});}
 // Valley and meadow trees.
 const trees=[];g.trees.forEach((t,i)=>{const sway=0;trees.push(Dpiece(Drect(t.x-.008,t.y-t.r*.6,t.x+.008,t.y+.01),L('#8a5a3c')));
  if(!season.bare)trees.push(Dpiece(t.crown,L(season.crowns[i%3]),{x:t.x+sway,y:t.y-t.r*1.25,j:(i%3-1)*.3}));
  else for(const a of [-.6,0,.6])trees.push(Dpiece([[-.003,0],[.003,0],[Math.sin(a)*t.r*1.1+.0015,-t.r*1.5],[Math.sin(a)*t.r*1.1-.0015,-t.r*1.5]],L('#8a5a3c'),{x:t.x,y:t.y-t.r*.55}));
  if(season.bare&&snowCover>.1)trees.push(Dpiece(Pblob(t.r*.5,12,.2,t.seed+300),L('#ffffff'),{x:t.x,y:t.y-t.r*1.5,v:snowCover,s:1}));});
 layers.push({pieces:trees,texA:.4,tex:'card'});
 const grass=Kmix(season.meadow,'#f4f8ff',snowCover*.9),grass2=Kmix(Kmix(season.meadow,'#2f7a3a',.18),'#e8eefc',snowCover*.9),tufts=g.tufts.filter(t=>Math.abs(t.x)<X+.1).flatMap(t=>[-1,0,1].map(k=>Dpiece([[t.x+k*.012-.006,t.y],[t.x+k*.012+.006,t.y],[t.x+k*.02,t.y-t.h*(k?.75:1)]],L(Kmix(grass2,'#1f5f2f',.15)))));
 layers.push({pieces:[Dpiece(g.meadow,L(grass),{tex:'card'}),...tufts,Dpiece(g.band,L(grass2),{tex:'card'}),Dpiece(g.path,L(Kmix(season.path,'#ffffff',snowCover*.7)),{tex:'pulp'})],texA:.45});
 layers.push({pieces:[Dpiece(g.pondRim,L(Kmix(season.meadow,'#6b8f5a',.35))),Dpiece(g.pond,L(Kmix('#3fa7e6','#d9f3ff',iceA)),{tex:'washi'})],texA:.3,shadow:.3});
 layers.push({pieces:g.lamps.flatMap(lp=>lp.pieces.map((p,i)=>Dpiece(p,L(i===2?'#4a4d68':'#34364c')))),texA:.3,shadow:.7});
  return layers;};
 const view={cx,cy,R,light:.95},sheetTint='#'+tint.map(v=>Math.min(255,Math.round(v/3)*3).toString(16).padStart(2,'0')).join('');
 // What happens today: paper pieces in front of the village (actors) or in the sky (sky), and light drawn last (fx).
 const fx=[],actors=[],skyfx=[];const add=(list,more)=>{for(const x of more||[])list.push(x);};
 const ev={c,P,R,X,L:LF,idle,night,fx,sky:skyfx,snowCover,q};
 for(const s of [rel<1.5?Dday(o,st.d-1):null,st,rel>6.5?Dday(o,st.d+1):null])if(s)for(const id of s.day.events)if(id&&D_EVENTS[id])add(actors,D_EVENTS[id](s,ev));
 const cloudsDraw=()=>paperScene(c,w,h,{base:'black',quality:q},[{pieces:clouds,texA:.35,tex:'washi',shadow:.5,edge:false},{pieces:skyfx,texA:.35,tex:'washi',shadow:.5,edge:false}],view);
 const landDraw=()=>Dlayer(c,w,h,'land',paper,vKey,sheetTint,1,(cc,v,LL)=>paperScene(cc,w,h,{base:'black',quality:q},landLayers(LL,v),view),L);
 const trainDraw=()=>paperScene(c,w,h,{base:'black',quality:q},[{pieces:Dtrain(st,X,LF),texA:.3,tex:'card',shadow:.5}],view);
 // Emissive light of the village: windows (on through the night), coloured on the night of coloured lights; the bakery at dawn.
 const colored=st.has('llumsColors')?Dwin(rel,4.6,7.7,.4)*Math.max(prog(st.d,5,3),rel>5.5?1:0):0,forn=(st.has('forn')?Dwin(rel,6.6,8.35,.3)*prog(st.d,7,2):0)+(st.hadPrev('forn')?Dwin(rel+8,6.6,8.35,.3):0);
 const winOn=prog(st.d,5,4),winOff=prog(st.d,7,4);
 const villageDraw=()=>{for(const [k,hs] of g.houses.entries())for(const wn of hs.wins){if(wn.door){const [x,y]=P(wn.x-.011,wn.y-.012);c.fillStyle=L('#8a4f36');c.fillRect(x,y,.022*R,.03*R);continue;}
  // The windows light up one after another during the evening's press and go out during the dawn's press (or as the day passes them).
  const on=Math.max(Ksmooth((rel-wn.on)/.25),Ksmooth((winOn*1.3-(wn.on-4.85)/.9)/.15)*Ksmooth((rel-4.6)/.3)),off=Math.max(Ksmooth((rel-wn.off)/.25),Ksmooth((winOff*1.3-(wn.off-6.9)/1.05)/.15)*Ksmooth((rel-6.6)/.3)),lit=on*(1-off);const [x,y]=P(wn.x-.011,wn.y-.013),ww=.022*R,hh=.026*R;
  const base=Kmix('#ffd36b',['#ff6a6a','#6ad1ff','#8cf07a','#ffb0f0'][wn.hue],colored),bake=k===5&&wn===hs.wins[0]?forn:0,a=Math.max(lit,bake);
  c.fillStyle=L('#5b6f98');c.fillRect(x,y,ww,hh);if(a>.01){c.fillStyle=Krgba(bake>lit?'#ffa64a':base,a);c.fillRect(x,y,ww,hh);if(night>.3){c.save();c.globalCompositeOperation='lighter';Dglow(c,x+ww/2,y+hh/2,.05*R,bake>lit?'#ff9a3a':base,.35*a*night);c.restore();}}
  // Shutters: opened in the morning, closed when the light of the room goes out at night.
  const open=Ksmooth((rel-.75)/.5)*(1-off);c.fillStyle=L(['#2f8f6e','#3d6fb0','#a8483c','#2f8f6e'][wn.hue]);const sw=ww*.5*(1-open)+ww*.18*open;c.fillRect(x-(open*ww*.2),y,sw,hh);c.fillRect(x+ww-sw+(open*ww*.2),y,sw,hh);}};
 // Bell tower: the bell swings at noon, and soft rings spread over the sky.
 const bellDraw=()=>{const b=g.tower.bell,[x,y]=P(b.x,b.y),u=st.d===Math.floor(o.target/8)&&((o.target%8)+8)%8===2&&st.phi>o.target-.6?Kclamp((o.t-.9)/3.8):0,sw=u>0&&u<1?Math.sin(u*Math.PI*6)*.5*(1-u):0;c.save();c.fillStyle=LF('#4a3a3a');c.fillRect(x-.02*R,y-.03*R,.04*R,.05*R);c.translate(x,y-.02*R);c.rotate(sw);c.fillStyle=LF('#e0a93a');c.beginPath();c.moveTo(-.014*R,.02*R);c.quadraticCurveTo(-.012*R,-.012*R,0,-.014*R);c.quadraticCurveTo(.012*R,-.012*R,.014*R,.02*R);c.closePath();c.fill();c.restore();
  if(u>0&&u<1)for(let k=0;k<3;k++){const v=Kclamp((u*3-k*.9)/1.4);if(v<=0||v>=1)continue;c.strokeStyle=Krgba(ink?'#7a6a4a':'#ffffff',.35*(1-v));c.lineWidth=.006*R;c.beginPath();c.arc(x,y,(.06+.5*v)*R,Math.PI*1.05,Math.PI*1.95);c.stroke();}}
 // Lamp posts: lit from dusk until the sun is up again.
 // (When dawn is not one of the moments of the chosen set, they go out as the light passes it.)
 const lampOn=rel<4?1-Math.max(Ksmooth((rel-.35)/.4),!o.stops||o.stops.includes(0)?prog(st.d,0,2.5)*Ksmooth((rel+.3)/.3):Ksmooth((rel-.05)/.4)):Ksmooth((rel-4.7)/.4)*(1-(rel>6.5&&(!o.stops||o.stops.includes(0))?prog(st.d+1,0,2.5):0));
 const lampsDraw=()=>{if(lampOn>.01)for(const lp of g.lamps){const [hx,hy]=P(lp.head[0],lp.head[1]);c.save();c.globalCompositeOperation='lighter';Dglow(c,hx,hy,lp.hh*1.3*R,'#ffcf73',.42*lampOn);c.restore();c.fillStyle=Krgba('#fff1b8',lampOn);c.beginPath();c.arc(hx,hy,.011*lp.k*R,0,K_TAU);c.fill();}};
 // Meadow flowers: open in daylight, closed at night (and visibly closing at sunset on the day of the flowers).
 const flowersDraw=()=>{if(flowerA>.01){c.save();c.globalAlpha=flowerA;const closing=st.has('flors')?prog(st.d,4,4):-1;const openAll=rel<4?Ksmooth((rel-.25)/.7):1-Ksmooth((rel-4.3)/.8);
  for(const f of g.flowers){if(Math.abs(f.x)>X+.05)continue;const [x,y]=P(f.x,f.y),r=f.r*R,op=Kclamp(closing>=0&&rel>3.5&&rel<5?1-Ksmooth((closing-(f.x+X)/(2*X)*.6)/.4):openAll),col=L(['#ff5f8f','#ffd23a','#ffffff','#b07cff','#ff8a3a'][f.hue]);
   c.fillStyle=L('#3f8f3a');c.fillRect(x-.6,y,1.2,r*1.6);c.fillStyle=col;const n=5,pr=r*(.35+.65*op);for(let k=0;k<n;k++){const a=k*K_TAU/n+f.seed;c.beginPath();c.ellipse(x+Math.cos(a)*pr*.6,y+Math.sin(a)*pr*.6,pr*.55,pr*.32*(.3+.7*op),a,0,K_TAU);c.fill();}c.fillStyle=L('#ffcf3a');c.beginPath();c.arc(x,y,r*.3,0,K_TAU);c.fill();}c.restore();}};
 // ── What happens today ──
 // Big daisies of the meadow: still most of the time, so they are cut into a sheet of their own (kept while no flower opens or closes).
 const daisies=flowerA>.01?Dbigflowers(st,X,x=>x):[],late=[],smoke=Dsmoke(st,g,o,idle);
 // Snowman of yesterday, melting.
 if(st.hadPrev('ninot')&&!st.has('ninot'))add(late,Dsnowman(1,1-Ksmooth(rel/1.2),LF,X));
 if(day.events.includes('ninot'))add(late,Dsnowman(prog(st.d,2,4),Dwin(rel,1.6,9.4,.4),LF,X));
 // Every day: chimney smoke in the morning, the birds going home at sunset.
 add(late,Dbirds(st,o,X,LF,0));for(const s of [st,rel>6.5?Dday(o,st.d+1):null])if(s&&s.has('ocellsAlba'))add(late,Dbirds(s,o,X,LF,1));
 // Big trees that frame the sky (left and right): the trunk and limbs, then the crown, or bare twigs in winter; bushes at their feet.
 const frontLayers=(L,v)=>{const season=vSeason(v),snowCover=v.snow,frame=[],shade=[],crowns=[],bark=L('#7a4e33');for(const T of g.frame){const ox=T.sd*X,sway=0;
  frame.push(Dpiece(T.trunk,bark,{x:ox,j:-.25}),...T.limbs.map(p=>Dpiece(p,bark,{x:ox,j:-.15})));
  if(season.bare){frame.push(...T.twigs.map(p=>Dpiece(p,bark,{x:ox,j:-.1})));if(snowCover>.05)[...T.limbs,...T.twigs.filter((_,j)=>j%3===0)].forEach((p,i)=>{const ex=(p[1][0]+p[2][0])/2,ey=(p[1][1]+p[2][1])/2;frame.push(Dpiece(Doval(0,0,.028,.011,12),L('#ffffff'),{x:ox+ex,y:ey-.006,v:snowCover,s:.8+.4*Krand(i,241)}));});}
  else{T.crowns.forEach((k,i)=>shade.push(Dpiece(k.pts,L(Kmix(season.crowns[i%3],'#12301c',.3)),{x:ox+k.c[0]+sway*.6-.014*T.sd,y:k.c[1]+.025})));T.crowns.forEach((k,i)=>crowns.push(Dpiece(k.pts,L(season.crowns[(i+1)%3]),{x:ox+k.c[0]+sway,y:k.c[1],s:.9,j:(i%3-1)*.35})));}
  frame.push(...T.bush.map((b,i)=>Dpiece(b.pts,L(Kmix(season.bare?'#6f8a5a':season.crowns[i%3],'#ffffff',snowCover*.7)),{x:ox+b.c[0],y:b.c[1],j:(i-1)*.3})));}
  return [{pieces:frame,texA:.45,tex:'card'},{pieces:shade,texA:.4,tex:'card',edge:false},{pieces:crowns,texA:.45,tex:'crepe',edge:false,shadow:.6}];};
 const actorsDraw=()=>paperScene(c,w,h,{base:'black',quality:q},[{pieces:actors,texA:.4,tex:'card'}],view);
 const daisiesDraw=()=>{if(daisies.length)Dlayer(c,w,h,'daisies',{},()=>[daisies.key,X.toFixed(3),q>.5?1:0].join('|'),sheetTint,flowerA,(cc,v,LL)=>paperScene(cc,w,h,{base:'black',quality:q},[{pieces:LL===L?Dbigflowers(st,X,L):daisies,texA:.4,tex:'card'}],view),L);};
 // Smoke is thin and casts no shadow of its own.
 const lateDraw=()=>paperScene(c,w,h,{base:'black',quality:q},[{pieces:smoke,texA:.25,tex:'washi',shadow:0,edge:false},{pieces:late,texA:.4,tex:'card'}],view);
 const frontDraw=()=>Dlayer(c,w,h,'front',{turn:st.turn,snow:snowCover},vKey,sheetTint,1,(cc,v,LL)=>paperScene(cc,w,h,{base:'black',quality:q},frontLayers(LL,{ice:0,frost:0,...v}),view),L);
 const fxDraw=()=>{for(const f of fx)f();};
 // Weather on top: rain, snow, low mist.
 const weatherDraw=()=>{if(rain>.01)Drain(c,w,h,R,idle,rain,q,ink?'#5d7fb0':undefined);
 if(snowing>.01)Dsnow(c,w,h,R,idle,snowing,q,ink?'#8fa6c8':undefined);
 const mist=Math.max(st.has('boira')?Dwin(rel,-.7,.95,.5)*(1-.85*prog(st.d,0,5)):st.soon('boira')?Dwin(rel-8,-.7,.95,.5)*(1-.85*prog(st.d+1,0,5)):0,st.has('boiraBaixa')?Dwin(rel,6.6,8.6,.5)*(.4+.6*prog(st.d,7,3)):st.hadPrev('boiraBaixa')?Dwin(rel+8,6.6,8.6,.5):0);if(mist>.01)Dmist(c,w,h,P,R,idle,mist,L);};
 if(d.full){skyFill();celestial();cloudsDraw();landDraw();trainDraw();villageDraw();bellDraw();lampsDraw();flowersDraw();actorsDraw();daisiesDraw();lateDraw();frontDraw();fxDraw();weatherDraw();}
 else{if(d.fade>0){skyFill();landDraw();villageDraw();lampsDraw();flowersDraw();daisiesDraw();frontDraw();escVeil(c,d,0,0,w,h);}else{c.fillStyle=d.base;c.fillRect(0,0,w,h);}
  celestial();cloudsDraw();trainDraw();bellDraw();actorsDraw();lateDraw();fxDraw();weatherDraw();}
 return true;}

// ── Every day ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// The train crosses the viaduct from the right edge into the tunnel, in the afternoon.
function Dtrain(st,X,L){const u=st.prog(st.d,3,5.2);if(!(u>0&&u<1))return [];const in0=.242,head=X+.2-(X+.2-in0+4*.135)*u,out=[],cols=['#e84a5f','#3d8bfd','#ffc93c','#2ec4b6'];
 for(let k=0;k<4;k++){const x0=head+k*.135,x1=x0+.122;if(x1<=in0+.004)continue;const cx=x=>Math.max(in0,x);out.push(Dpiece(Drect(cx(x0),.006,cx(x1),.05),L(cols[k]),{j:.2}));
  if(k===0&&x0+.03>in0)out.push(Dpiece([[cx(x0),.05],[cx(x0),.02],[cx(x0+.03),.006]],L('#40384a')),Dpiece(Drect(cx(x0+.05),-.016,cx(x0+.068),.008),L('#40384a')));
  for(let j=0;j<3;j++){const wx=x0+.03+j*.03;if(wx>in0)out.push(Dpiece(Drect(wx,.016,wx+.02,.032),L('#fff2c8')));}}
 return out;}
// Big paper daisies along the front of the meadow (spring and summer): they open after sunrise and close at dusk; on the day of the
// flowers they close at sunset in a wave from left to right.
function Dbigflowers(st,X,L){const g=Dgeo();if(!g.big)g.big=Array.from({length:22},(_,i)=>({u:(i+.5)/22+(Krand(i,1101)-.5)*.03,y:.8+Krand(i,1102)*.2,r:.035+Krand(i,1103)*.02,col:['#ff5f8f','#ffd23a','#ffffff','#b07cff','#ff8a3a','#5ec8ff'][i%6],seed:i}));
 const rel=st.rel,out=[],flors=st.has('flors'),p=flors?st.prog(st.d,4,4.5):0,ops=[];
 for(const f of g.big){const x=-X+.08+f.u*(2*X-.16);if(Math.abs(x-(-.22+(f.y-.9)*.6))<.12)continue;const close=flors&&rel>3.4?Ksmooth((p*1.7-f.u*.7)/.35):Ksmooth((rel-4.9)/.6),op=Dq(Ksmooth((rel-.25)/.7)*(1-close),24),stem=f.r*2.4;ops.push(op);
  out.push(Dpiece(Drect(-.004,0,.004,stem),L('#3f8f3a'),{x,y:f.y-stem}),Dpiece(Pleaf(f.r*1.4,f.r*.35,-2.4,10),L('#4fa64a'),{x,y:f.y-stem*.4}));
  const n=9,pr=f.r*(.45+.55*op);for(let k=0;k<n;k++){const a=-Math.PI/2+(k-(n-1)/2)*(K_TAU/n)*(.18+.82*op);out.push(Dpiece(Pleaf(pr,pr*.28,a,8),L(f.col),{x,y:f.y-stem,j:k%2?.2:-.1}));}
  out.push(Dpiece(Pblob(f.r*.3*(.6+.4*op),12,.05,1110+f.seed),L('#ffbe2e'),{x,y:f.y-stem}));}
 out.key=ops.join();return out;}
function Dsmoke(st,g,o,idle){const a=Dwin(st.rel,.55,2.2,.4)+st.across(x=>x.season===3,-.5,.6,.3)+st.win('forn',6.6,8.3,.3);if(a<=.01)return [];const out=[];
 g.houses.filter(h=>h.chimney).forEach((h,i)=>{for(let k=0;k<4;k++){const u=((idle*.12+k/4+i*.13)%1),x=h.chimney.x+u*.06+Math.sin(u*6+i)*.01,y=h.chimney.y-.03-u*.22;out.push(Dpiece(Pblob(.014+u*.03,10,.2,300+i*4+k),'#f2f2f6',{x,y,v:a*.75*(1-u)*Kclamp(u*6)}));}});return out;}
function Dbirds(st,o,X,L,which){const u=which?st.prog(st.d,0,6):st.prog(st.d,4,6);if(!(u>0&&u<1))return [];const out=[],n=which?12:7;
 for(let k=0;k<n;k++){const row=Math.floor((k+1)/2),side=k%2?1:-1,x=-X-.3+u*(2*X+.6)-row*.07,y=(which?-.7:-.45)+side*row*.035+Math.sin(u*20+k)*.01,f=Math.sin(u*60+k*1.3)*.5+.5,s=.03;
  out.push(Dpiece([[-s,-s*.15*f],[0,.004],[s,-s*.15*f],[0,-.012]],L('#3a3550'),{x,y,z:.2}));}return out;}
function Drain(c,w,h,R,idle,a,q=1,col='#e6f2ff'){c.save();c.strokeStyle=Krgba(col,.6*a);c.lineWidth=Math.max(1.2,.004*R);c.lineCap='round';c.beginPath();for(let k=0,n=Math.round(140+120*q);k<n;k++){const x0=Krand(k,401)*w*1.2-w*.1,sp=.9+Krand(k,402)*.4,y=((Krand(k,403)+idle*sp*.9)%1)*h*1.1-h*.05,x=x0+(y/h)*w*.06,l=.05+.05*Krand(k,404);c.moveTo(x,y);c.lineTo(x+l*.17*R,y+l*R);}c.stroke();c.restore();}
function Dsnow(c,w,h,R,idle,a,q=1,col='#ffffff'){c.save();c.fillStyle=Krgba(col,.85*a);for(let k=0,n=Math.round(130+100*q);k<n;k++){const sp=.05+Krand(k,411)*.08,y=((Krand(k,412)+idle*sp)%1)*h*1.05,x=(Krand(k,413)*w+Math.sin(idle*.6+k)*.03*R+w)%w,r=(.004+Krand(k,414)*.006)*R;c.beginPath();c.arc(x,y,r,0,K_TAU);c.fill();}c.restore();}
function Dmist(c,w,h,P,R,idle,a,L){c.save();for(let k=0;k<4;k++){const [,y]=P(0,.12+k*.09),g=c.createLinearGradient(0,y-.08*R,0,y+.08*R),col=L('#f4f6ff');g.addColorStop(0,Krgba(col,0));g.addColorStop(.5,Krgba(col,.42*a));g.addColorStop(1,Krgba(col,0));c.fillStyle=g;c.fillRect(0,y-.08*R-(1-a)*.1*R,w,.16*R);}c.restore();}
function Dsnowman(u,v,L,X){if(v<=.01||u<=0)return [];const x=.44,y=.9,out=[],land=k=>Kclamp(u*4-k),col=L('#fbfdff');
 [[.13,0],[.095,-.2],[.068,-.35]].forEach(([r,dy],k)=>{const l=land(k);if(l>0)out.push(Dpiece(Pblob(r,26,.04,500+k),col,{x,y:y+dy-(1-KeaseOut(l))*.3,v:v*Kclamp(l*3),z:1-l,s:.6+.4*v}));});
 if(land(3)>0){const l=land(3);out.push(Dpiece(Drect(-.05,-.015,.05,0),L('#2d2a3a'),{x,y:y-.41,v:v*l}),Dpiece(Drect(-.032,-.075,.032,-.015),L('#2d2a3a'),{x,y:y-.41,v:v*l}),Dpiece(Drect(-.075,-.012,.075,.016),L('#e8434f'),{x,y:y-.29,v:v*l}),Dpiece(Drect(.03,0,.058,.08),L('#e8434f'),{x,y:y-.29,v:v*l,r:.15}),
  Dpiece([[0,0],[.16,-.07],[.165,-.06],[0,.012]],L('#7a4e33'),{x:x+.08,y:y-.2,v:v*l}),Dpiece([[0,0],[-.16,-.08],[-.165,-.07],[0,.012]],L('#7a4e33'),{x:x-.08,y:y-.2,v:v*l}),Dpiece([[0,-.008],[.05,0],[0,.008]],L('#ff8a2a'),{x:x+.03,y:y-.35,v:v*l}),
  ...[0,1,2].map(k=>Dpiece(Pblob(.01,10,0,520+k),L('#2d2a3a'),{x,y:y-.24+k*.05,v:v*l})));}
 return out;}

// ── Today's events ──────────────────────────────────────────────────────────────────────────────────────────────────────
// Each returns paper pieces (drawn with shadows, in front of the village) and may push light effects into env.fx.
const Dk=(st,m)=>st.prog(st.d,m,6);
const D_EVENTS={
 boira:()=>[],gebre:(st,e)=>{const a=Dwin(st.rel,-.6,2,.5)*(.5+.5*Dk(st,0));if(a>.01)e.fx.push(()=>Dsparkles(e,a,90,.0,.25,-1.4,.0,601));return [];},
 nuvolsRosats:()=>[],celVermell:()=>[],nuvolsDaurats:()=>[],llunaGran:()=>[],forn:()=>[],llumsColors:(st,e)=>{const a=Dwin(st.rel,4.6,7.7,.4)*Math.max(Dk(st,5),st.rel>5.5?1:0);if(a<=.01)return [];const g=Dgeo(),p=st.rel<5.5?Dk(st,5):1,cols=['#ff6b6b','#ffd166','#4cc9f0','#80ed99','#f9a8ff'];
  e.fx.push(()=>{const c=e.c;c.save();g.houses.forEach((h,i)=>{const n=Math.max(3,Math.round(h.wd/.022));for(let k=0;k<n;k++){const lit=Kclamp(p*3-(h.x+1.5)/3*1.6-k*.02);if(lit<=0)continue;const [px,py]=e.P(h.x-h.wd/2+(k+.5)*h.wd/n,h.y-h.ht+.004+.006*Math.sin(Math.PI*(k+.5)/n)),col=cols[(k+i)%5];
   c.globalCompositeOperation='lighter';Dglow(c,px,py,.045*e.R,col,.5*a*lit*(.3+.7*e.night));c.globalCompositeOperation='source-over';c.fillStyle=Krgba(col,a*lit);c.beginPath();c.arc(px,py,.0075*e.R,0,K_TAU);c.fill();}});
   const tw=g.tower;for(let k=0;k<14;k++){const u=k/13,side=k%2?1:-1,lit=Kclamp(p*3-1.2-u*.5);if(lit<=0)continue;const [px,py]=e.P(tw.x+side*(.045-.045*Math.max(0,(u-.72)/.28)),tw.y-.02-u*.42),col=cols[k%5];c.globalCompositeOperation='lighter';Dglow(c,px,py,.045*e.R,col,.5*a*lit*(.3+.7*e.night));c.globalCompositeOperation='source-over';c.fillStyle=Krgba(col,a*lit);c.beginPath();c.arc(px,py,.0075*e.R,0,K_TAU);c.fill();}
   c.restore();});return [];},gel:(st,e)=>{const a=Dwin(st.rel,2.6,8.6,.4)*Dk(st,3);if(a>.01)e.fx.push(()=>Dsparkles(e,a*.8,40,.58,.74,.6,1.45,602));return [];},
 // A hot-air balloon rises from the meadow and drifts up into the sky.
 globus:(st,e)=>{const u=Dk(st,0),a=Dwin(st.rel,-.2,1.5,.4);if(a<=.01||u<=0)return [];const x=.62-.85*KeaseOut(u)-.25*Kclamp(st.rel-.3),y=.6-1.3*Ksmooth(u)-.1*Kclamp(st.rel-.3),s=1.15+.35*u,out=[];
  const gores=['#ff5a5f','#ffd23f','#3bceac','#4d96ff','#ff8c42','#a66cff'];for(let k=0;k<6;k++){const a0=-1+k/3,a1=a0+1/3,pts=[];for(let j=0;j<=12;j++){const t=j/12,yy=-.17+t*.3,wd=Math.sin(Math.PI*Math.min(1,t*1.05+.08))*.15*(1-.45*t*t);pts.push([wd*(a0+1/6)*1.0+wd*(a0-a0),yy]);}
   const left=[],right=[];for(let j=0;j<=14;j++){const t=j/14,yy=-.17+t*.29,wd=.15*Math.sin(Math.PI*Math.min(1,.08+t*.95))*(1-.4*t*t);left.push([wd*a0,yy]);right.push([wd*a1,yy]);}out.push(Dpiece([...left,...right.reverse()],e.L(gores[k]),{x,y,s,v:a,z:.3}));void pts;}
  out.push(Dpiece(Drect(-.03,.16,.03,.2),e.L('#a8743e'),{x,y,s,v:a,z:.3}));e.fx.push(()=>{const [px,py]=e.P(x,y);e.c.strokeStyle=Krgba(e.L('#5a4a3a'),.8*a);e.c.lineWidth=1;e.c.beginPath();for(const dx of [-.028,.028]){e.c.moveTo(px+dx*s*e.R,py+.165*s*e.R);e.c.lineTo(px+dx*1.6*s*e.R,py+.11*s*e.R);}e.c.stroke();});return out;},
 ocellsAlba:()=>[],
 // Clothes lines between poles on the left of the meadow.
 roba:(st,e)=>{const a=Dwin(st.rel,.6,4.6,.4);if(a<=.01)return [];const u=st.rel<1.5?Dk(st,1):1,out=[],x0=-e.X+.42,cols=['#ff6b6b','#4dabf7','#ffd43b','#69db7c','#f783ac','#ffa94d','#9775fa'];
  out.push(Dpiece(Drect(x0-.008,.42,x0+.008,.8),e.L('#8a5a3c'),{v:a}),Dpiece(Drect(x0+.708,.42,x0+.724,.8),e.L('#8a5a3c'),{v:a}));e.fx.push(()=>{const [p0x,p0y]=e.P(x0,.44),[p1x,p1y]=e.P(x0+.716,.44);e.c.strokeStyle=Krgba(e.L('#eeeeee'),a);e.c.lineWidth=1.2;e.c.beginPath();e.c.moveTo(p0x,p0y);e.c.quadraticCurveTo((p0x+p1x)/2,p0y+.06*e.R,p1x,p1y);e.c.stroke();});
  const shapes=[[[-.05,0],[.05,0],[.07,.03],[.04,.04],[.04,.13],[-.04,.13],[-.04,.04],[-.07,.03]],Drect(-.05,0,.05,.16),[[-.035,0],[.035,0],[.035,.14],[.008,.14],[0,.05],[-.008,.14],[-.035,.14]],[[-.015,0],[.015,0],[.015,.06],[.04,.08],[.03,.095],[-.015,.07]]];
  for(let k=0;k<7;k++){const t=(k+.6)/7.6,x=x0+.716*t,y=.44+.06*4*t*(1-t),l=Kclamp(u*8-k*.9);if(l<=0)continue;out.push(Dpiece(shapes[k%4],e.L(cols[k]),{x,y,v:a*Kclamp(l*2),r:Math.sin(e.idle*1.4+k)*.08,z:.4*(1-l),s:.9+.1*l}));}return out;},
 // Bunting across the whole sky, between the two big trees, flags arriving one after the other.
 banderoles:(st,e)=>{const a=Dwin(st.rel,.6,8.5,.4);if(a<=.01)return [];const u=st.rel<1.5?Dk(st,1):1,out=[],cols=['#ff4d6d','#ffd60a','#4cc9f0','#80ed99','#f77f00','#9d4edd'];
  for(const [row,y0,sag] of [[0,-.48,.18],[1,-.34,.14]]){const n=Math.round(14*e.X/1.78)+4;for(let k=0;k<n;k++){const t=(k+.5)/n,x=-e.X+.2+(2*e.X-.4)*t,y=y0+sag*4*t*(1-t),l=Kclamp(u*(n/2)-k*.5+row);if(l<=0)continue;out.push(Dpiece([[-.03,0],[.03,0],[0,.075]],e.L(cols[(k+row*2)%6]),{x,y:y-(1-KeaseOut(l))*.2,v:a*Kclamp(l*3),r:Math.sin(e.idle*1.2+k)*.06,z:.3*(1-l)}));}
   e.fx.push(()=>{e.c.strokeStyle=Krgba(e.L('#f3efe6'),a*.9);e.c.lineWidth=1.2;e.c.beginPath();for(let k=0;k<=40;k++){const t=k/40,[px,py]=e.P(-e.X+.2+(2*e.X-.4)*t,y0+sag*4*t*(1-t));k?e.c.lineTo(px,py):e.c.moveTo(px,py);}e.c.stroke();});}return out;},
 // Rain: coloured umbrellas go along the path.
 // Rain: big coloured umbrellas go along the path, the nearest ones largest.
 pluja:(st,e)=>{const a=Dwin(st.rel,.6,1.6,.4);if(a<=.01)return [];const u=st.rel<1.5?Dk(st,1):1,out=[],cols=['#ff595e','#ffca3a','#8ac926','#1982c4','#6a4c93','#ff924c'];
  const dome=[...Array.from({length:17},(_,i)=>[Math.cos(Math.PI+i*Math.PI/16)*.07,Math.sin(Math.PI+i*Math.PI/16)*.05]),[.07,0],[.047,.012],[.023,0],[0,.012],[-.023,0],[-.047,.012]];for(let k=0;k<6;k++){const t=((u*.5+k/6+e.idle*.015)%1),x=-.1-.38*t+(k%2?.07:-.07),y=1.08-.62*t,s=2.1-1.5*t,v=a*Kclamp(u*6-k*.6);out.push(Dpiece(Drect(-.0025,0,.0025,.075),e.L('#4a3a3a'),{x,y:y-.08*s,s,v}),Dpiece(dome,e.L(cols[k]),{x,y:y-.08*s,s,v,z:.2}),Dpiece([[-.006,0],[.006,0],[0,-.018]],e.L(cols[(k+2)%6]),{x,y:y-.08*s-.05*s,s,v}));}return out;},
 neu:()=>[],
 // Blossom bursts on every tree, and petals drift.
 floracio:(st,e)=>{const a=Dwin(st.rel,1.6,8.6,.4);if(a<=.01)return [];const u=st.rel<2.5?Dk(st,2):1,g=Dgeo(),pts=[...g.trees.map(t=>[t.x,t.y-t.r*1.25,t.r]),...g.frame.flatMap(T=>T.crowns.map(k=>[T.sd*e.X+k.c[0],k.c[1],k.r*.9]))];
  e.fx.push(()=>{pts.forEach(([tx,ty,tr],i)=>{const n=Math.round(tr*260);for(let k=0;k<n;k++){const l=Kclamp(u*3-(k/n)*1.5-i*.08);if(l<=0)continue;const an=Krand(k,700+i)*K_TAU,rr=Math.sqrt(Krand(k,720+i))*tr*.95,[px,py]=e.P(tx+Math.cos(an)*rr,ty+Math.sin(an)*rr*.9);e.c.fillStyle=Krgba(e.L(k%3?'#ffb3d1':'#ffffff'),a*Kclamp(l*2));e.c.beginPath();e.c.arc(px,py,(.006+.006*Krand(k,740))*e.R*KeaseOut(l),0,K_TAU);e.c.fill();}});
   for(let k=0;k<40;k++){const t=(e.idle*.05+Krand(k,760))%1,[px,py]=e.P(-e.X+t*2*e.X,-.5+((Krand(k,761)+t*.8)%1)*1.3);e.c.fillStyle=Krgba(e.L('#ffc2dc'),a*.8*u);e.c.beginPath();e.c.ellipse(px,py,.006*e.R,.0035*e.R,t*9+k,0,K_TAU);e.c.fill();}});return [];},
 // Market stalls with striped awnings pop up along the meadow.
 mercat:(st,e)=>{const a=Dwin(st.rel,1.6,4.9,.4);if(a<=.01)return [];const u=st.rel<2.5?Dk(st,2):1,out=[],cols=[['#ff595e','#fff3e0'],['#1982c4','#fff3e0'],['#8ac926','#fff3e0'],['#ffca3a','#e85d75']],xs=[.26,-.92,.62,-1.36].filter(x=>Math.abs(x)<e.X-.22);
  xs.forEach((x0,k)=>{const l=Kclamp(u*4-k),f=KeaseOut(l);if(l<=0)return;const y=.9+(k%2)*.04,s=1.2;out.push(Dpiece(Drect(-.12,-.01,.12,.1),e.L('#c8925a'),{x:x0,y,s,v:a,fold:{a:0,f:Math.max(.05,f)}}));
   for(let j=0;j<4;j++)out.push(Dpiece([[-.14+j*.07,-.14],[-.07+j*.07,-.14],[-.065+j*.0725,-.05],[-.145+j*.0725,-.05]],e.L(cols[k%4][j%2]),{x:x0,y,s,v:a,fold:{a:Math.PI/2,f:Math.max(.05,f)}}));
   out.push(Dpiece(Drect(-.12,-.05,-.11,.0),e.L('#8a5a3c'),{x:x0,y,s,v:a*f}),Dpiece(Drect(.11,-.05,.12,.0),e.L('#8a5a3c'),{x:x0,y,s,v:a*f}));
   for(let j=0;j<6;j++)out.push(Dpiece(Pblob(.018,10,.1,800+k*6+j),e.L(['#ff6b35','#ffd23f','#7bd389','#e63946','#f4a261','#a8dadc'][(j+k)%6]),{x:x0-.08+j*.032,y:y-.025,s,v:a*Kclamp(l*2-1)}));});return out;},
 arc:()=>[],ninot:()=>[],
 // Paper kites rise from the meadow and dance high up.
 estels:(st,e)=>{const a=Dwin(st.rel,2.6,3.55,.4);if(a<=.01)return [];const u=st.rel<3.5?Dk(st,3):1,out=[],cols=[['#ff4d6d','#ffd60a'],['#4cc9f0','#f72585'],['#80ed99','#f77f00']];
  [[-.6,-.62],[.25,-.72],[.95,-.55]].forEach(([kx,ky],k)=>{if(Math.abs(kx)>e.X-.3)return;const l=KeaseOut(Kclamp(u*1.5-k*.2)),x=kx+Math.sin(e.idle*.7+k*2)*.04,y=.75+(ky-.75)*l+Math.cos(e.idle*.9+k)*.025,r=Math.sin(e.idle*.8+k)*.15;
   out.push(Dpiece([[0,-.09],[.065,0],[0,.11],[-.065,0]],e.L(cols[k][0]),{x,y,r,v:a,z:.3}),Dpiece([[0,-.09],[.065,0],[0,0]],e.L(cols[k][1]),{x,y,r,v:a,z:.3}),Dpiece([[0,0],[-.065,0],[0,.11]],e.L(cols[k][1]),{x,y,r,v:a,z:.3}));
   for(let j=1;j<=5;j++)out.push(Dpiece([[-.018,-.01],[.018,.01],[.018,-.01],[-.018,.01]],e.L(cols[k][j%2]),{x:x+Math.sin(e.idle*1.6+j*.9+k)*.03*j/5,y:y+.11+j*.05,v:a,z:.2}));
   e.fx.push(()=>{const [px,py]=e.P(x,y+.11),[gx,gy]=e.P(kx*.5-.1,.95);e.c.strokeStyle=Krgba('#ffffff',.5*a);e.c.lineWidth=1;e.c.beginPath();e.c.moveTo(px,py);e.c.quadraticCurveTo((px+gx)/2+.05*e.R,(py+gy)/2,gx,gy);e.c.stroke();});});return out;},
 // The procession: flags on tall poles and long ribbons cross the meadow.
 cercavila:(st,e)=>{const u=Dk(st,3);if(!(u>0&&u<1))return [];const out=[],cols=['#ff4d6d','#ffd60a','#4cc9f0','#80ed99','#f77f00','#9d4edd','#ff4d6d'];const a=Kclamp(u*8)*Kclamp((1-u)*8);
  for(let k=0;k<7;k++){const x=-e.X-.3+u*(2*e.X+1.2)-k*.32,y=.78+(k%2)*.07,wave=Math.sin(e.idle*3+k)*.03;if(Math.abs(x)>e.X+.3)continue;out.push(Dpiece(Drect(-.006,-.42,.006,0),e.L('#7a4e33'),{x,y,v:a}));
   const flag=[];for(let j=0;j<=10;j++){const t=j/10;flag.push([t*.16,-.42+Math.sin(t*3+e.idle*3+k)*.015]);}for(let j=10;j>=0;j--){const t=j/10;flag.push([t*.16,-.31+Math.sin(t*3+e.idle*3+k)*.015]);}out.push(Dpiece(flag,e.L(cols[k]),{x,y,v:a,r:wave,z:.15}));
   for(const r of [0,1]){const rib=[];for(let j=0;j<=12;j++){const t=j/12;rib.push([-.006-t*.22,-.42+t*.05+Math.sin(t*5-e.idle*4+k+r)*.02+r*.02]);}for(let j=12;j>=0;j--){const t=j/12;rib.push([-.006-t*.22,-.412+t*.05+Math.sin(t*5-e.idle*4+k+r)*.02+r*.02]);}out.push(Dpiece(rib,e.L(cols[(k+3+r)%7]),{x,y,v:a}));}}return out;},
 // Autumn leaves blow across the whole screen, then rest on the meadow.
 fulles:(st,e)=>{const u=Dk(st,3),a=Dwin(st.rel,2.6,8.6,.4);if(a<=.01)return [];const out=[],cols=['#ef8a2c','#e0552b','#f2b33a','#c2452d'];
  for(let k=0;k<60;k++){const t=Kclamp(u*1.4-Krand(k,901)*.4),fly=t>0&&t<1,x=fly?e.X+.2-(2*e.X+.6)*t+Math.sin(t*9+k)*.06:-e.X+Krand(k,902)*2*e.X,y=fly?-.6+Krand(k,903)*.6+t*(.7+Krand(k,904)*.3)+Math.sin(t*12+k)*.05:.45+Krand(k,905)*.5;if(!fly&&t<=0)continue;
   out.push(Dpiece(Pleaf(.045,.018,0,8),e.L(cols[k%4]),{x,y,r:fly?t*12+k:Krand(k,906)*6,v:a,z:fly?.4:0}));}return out;},
 flors:()=>[],
 // Strings of light bulbs across the sky, lit one after the other; at dawn they go out one by one.
 garlandes:(st,e)=>{const a=Dwin(st.rel,3.6,8.2,.4);if(a<=.01)return [];const on=st.rel<4.5?Dk(st,4):1,off=st.has('bombetes')?Dk(st,7):Ksmooth((st.rel-7.6)/.4),n=Math.round(16*e.X/1.78)+6;
  e.fx.push(()=>{for(const [row,y0,sag] of [[0,-.42,.2],[1,-.25,.16]]){e.c.strokeStyle=Krgba(e.L('#2d2a3a'),a);e.c.lineWidth=1.2;e.c.beginPath();for(let k=0;k<=40;k++){const t=k/40,[px,py]=e.P(-e.X+.2+(2*e.X-.4)*t,y0+sag*4*t*(1-t));k?e.c.lineTo(px,py):e.c.moveTo(px,py);}e.c.stroke();
   for(let k=0;k<n;k++){const t=(k+.5)/n,[px,py]=e.P(-e.X+.2+(2*e.X-.4)*t,y0+sag*4*t*(1-t)+.012),lit=Kclamp(on*n*.6-k*.5-row*.5)*(1-Kclamp(off*n*.7-(n-k)*.5)),col=['#ffd166','#ff6b6b','#4cc9f0','#80ed99','#f9a8ff'][(k+row)%5];
    e.c.fillStyle=Krgba(e.L('#f5efe0'),a);e.c.beginPath();e.c.arc(px,py,.009*e.R,0,K_TAU);e.c.fill();if(lit>.01){e.c.save();e.c.globalCompositeOperation='lighter';Dglow(e.c,px,py,.05*e.R,col,.5*lit*a*(.4+.6*e.night));e.c.restore();e.c.fillStyle=Krgba(col,lit*a);e.c.beginPath();e.c.arc(px,py,.009*e.R,0,K_TAU);e.c.fill();}}}});return [];},
 neuRosa:()=>[],bombetes:()=>[],
 // Fireflies over the meadow: soft lights that come and go slowly.
 cuques:(st,e)=>{const a=Dwin(st.rel,4.6,6.5,.4)*Math.max(Dk(st,5),st.rel>5.5?1:0);if(a<=.01)return [];e.fx.push(()=>{e.c.save();e.c.globalCompositeOperation='lighter';for(let k=0;k<45;k++){const x=-e.X+Krand(k,951)*2*e.X+Math.sin(e.idle*.3+k)*.05,y=.4+Krand(k,952)*.5+Math.cos(e.idle*.25+k*2)*.03,b=.5+.5*Math.sin(e.idle*1.1+k*1.7),[px,py]=e.P(x,y);Dglow(e.c,px,py,.03*e.R,'#d8ff6a',.55*a*b);}e.c.restore();});return [];},
 // A bandstand on the meadow, lit from inside, with notes rising.
 concert:(st,e)=>{const a=Dwin(st.rel,4.6,6.1,.4);if(a<=.01)return [];const u=st.rel<5.5?Dk(st,5):1,x=Math.min(e.X-.5,1.0),y=.99,out=[],f=KeaseOut(Kclamp(u*2));
  out.push(Dpiece(Drect(-.26,-.03,.26,.03),e.L('#d9b38c'),{x,y,v:a}),...[-.22,-.08,.08,.22].map(dx=>Dpiece(Drect(dx-.008,-.26,dx+.008,-.03),e.L('#f5efe6'),{x,y,v:a*f})),Dpiece([[-.3,-.26],[.3,-.26],[0,-.4]],e.L('#e63946'),{x,y,v:a,fold:{a:0,f:Math.max(.05,f)}}));
  e.fx.push(()=>{const [px,py]=e.P(x,y-.14);e.c.save();e.c.globalCompositeOperation='lighter';Dglow(e.c,px,py,.35*e.R,'#ffcf73',.4*a*f);e.c.restore();for(let k=0;k<8;k++){const t=(e.idle*.25+k/8)%1,[nx,ny]=e.P(x-.2+Krand(k,971)*.4+Math.sin(t*6+k)*.03,y-.3-t*.5);e.c.fillStyle=Krgba(['#ffd166','#ff6b6b','#4cc9f0','#80ed99'][k%4],a*f*(1-t));e.c.beginPath();e.c.ellipse(nx,ny,.012*e.R,.009*e.R,-.4,0,K_TAU);e.c.fill();e.c.fillRect(nx+.01*e.R,ny-.045*e.R,.003*e.R,.045*e.R);}});return out;},
 // Puddles on the path after the rain, reflecting the lamps in the evening.
 bassals:(st,e)=>{const a=Dwin(st.rel,1.8,7.6,.4);if(a<=.01)return [];const glow=Kclamp(Dwin(st.rel,4.7,7.6,.4)*Math.max(Dk(st,5),st.rel>5.5?1:0));
  e.fx.push(()=>{for(const [x,y,r] of [[-.3,.74,.07],[-.17,.93,.1],[-.44,.6,.05]]){const [px,py]=e.P(x,y);e.c.fillStyle=Krgba(e.L('#7fa6d6'),.8*a);e.c.beginPath();e.c.ellipse(px,py,r*e.R,r*.28*e.R,0,0,K_TAU);e.c.fill();if(glow>.01){e.c.save();e.c.globalCompositeOperation='lighter';Dglow(e.c,px,py,r*.9*e.R,'#ffcf73',.5*glow);e.c.restore();}}});return [];},
 // A shooting star.
 estelFugac:(st,e)=>{const u=Kclamp((st.clk(st.d,6)-2.7)/1.1);if(!(u>0&&u<1))return [];e.fx.push(()=>Dmeteor(e,u,-.8*e.X,-.85,.9*e.X,-.35));return [];},
 plujaEstels:(st,e)=>{const t=st.clk(st.d,6);if(t<2.2||t>7)return [];e.fx.push(()=>{for(let k=0;k<6;k++){const v=Kclamp((t-2.3-Math.floor(k/2)*1.3-(k%2)*.35)/1.0);if(v>0&&v<1){const x0=(Krand(k,981)-.5)*1.6*e.X,y0=-.95+Krand(k,982)*.2;Dmeteor(e,v,x0,y0,x0+.7,y0+.35);}}});return [];},
 // A small fireworks display over the village: soft bursts, no flash of the whole screen.
 // A small fireworks display over the village, timed with its sound: rockets rise, then peonies, a crackle, a ring and two willows.
 // No flash: each burst lights only its own sparks; the sky never brightens.
 focs:(st,e)=>{const t=st.clk(st.d,6);if(t<2||t>8.5)return [];e.fx.push(()=>Dfireworks(e,t));return [];},

 // Clouds cross in front of the moon.
 // Clouds sail slowly across the moon; their edges catch its light.
 llunaNuvols:(st,e)=>{const a=Dwin(st.rel,5.6,7.4,.4);if(a<=.01)return [];const m=Dmoon(st.rel,e.X),p=st.rel<6.5?Dk(st,6):1,out=[];for(let k=0;k<3;k++){const x=m.x-.6+1.25*KeaseOut(Kclamp(p*1.25-k*.12))-k*.16+e.idle*.004,y=m.y+.05*(k-1)+.02;
  for(const [j,dx,dy,r] of [[0,0,0,.075],[1,-.08,.02,.055],[2,.085,.025,.058],[3,.02,-.045,.05]]){e.sky.push(Dpiece(Pblob(r*1.05,18,.08,990+k*4+j),e.L('#c9d3ff'),{x:x+dx-.006,y:y+dy-.006,s:Ksmooth(a)}),Dpiece(Pblob(r,18,.08,990+k*4+j),e.L('#5d6aa6'),{x:x+dx,y:y+dy,s:Ksmooth(a),j:-.1}));}}return out;},
 estrellesNeu:(st,e)=>{const a=Dwin(st.rel,5.5,7.9,.4);if(a>.01)e.fx.push(()=>Dsparkles(e,a,70,.4,1,-e.X,e.X,1001));return [];},
 rosada:(st,e)=>{const a=Dwin(st.rel,6.6,8.5,.4)*Math.max(Dk(st,7),st.rel>7.5?1:0);if(a>.01)e.fx.push(()=>Dsparkles(e,a,80,.62,1,-e.X,e.X,1011));return [];},
 boiraBaixa:()=>[],neuFluixa:()=>[],
 // A small plane crosses the sky trailing a long ribbon of colours.
 avioneta:(st,e)=>{const u=Dk(st,1);if(!(u>0&&u<1))return [];const x=-e.X-.4+u*(2*e.X+1.2),y=-.68+Math.sin(u*5)*.04,out=[Dpiece(Doval(0,0,.08,.022,16),e.L('#e63946'),{x,y,z:.3}),Dpiece(Drect(-.025,-.05,.02,.05),e.L('#f1faee'),{x,y,z:.3}),Dpiece([[-.08,0],[-.1,-.04],[-.07,0]],e.L('#1d3557'),{x,y,z:.3})];
  const cols=['#ff4d6d','#ffd60a','#4cc9f0','#80ed99'];cols.forEach((col,k)=>{const top=[],bot=[];for(let j=0;j<=16;j++){const t=j/16,xx=-.1-t*.7,yy=Math.sin(t*6-e.idle*4)*.025+k*.012-.018;top.push([xx,yy]);bot.push([xx,yy+.012]);}out.push(Dpiece([...top,...bot.reverse()],e.L(col),{x,y,z:.25}));});return out;},
 // Butterflies over the meadow.
 papallones:(st,e)=>{const a=Dwin(st.rel,1.6,3.7,.4)*Math.max(Dk(st,2),st.rel>2.5?1:0);if(a<=.01)return [];const out=[],cols=['#ff9f1c','#ffbf69','#cbf3f0','#ff6bcb','#9b5de5'];
  for(let k=0;k<10;k++){const x=-e.X+.3+Krand(k,1021)*(2*e.X-.6)+Math.sin(e.idle*.5+k)*.12,y=.45+Krand(k,1022)*.35+Math.cos(e.idle*.7+k*2)*.06,f=.35+.65*Math.abs(Math.sin(e.idle*7+k));
   out.push(Dpiece(Doval(-.022,-.01,.022,.016,12),e.L(cols[k%5]),{x,y,v:a,s:1,fold:{a:Math.PI/2,f}}),Dpiece(Doval(.022,-.01,.022,.016,12),e.L(cols[k%5]),{x,y,v:a,fold:{a:Math.PI/2,f}}));}return out;},
 // Soap bubbles drift across the village.
 bombolles:(st,e)=>{const u=Dk(st,3),a=Dwin(st.rel,2.6,4.2,.4);if(a<=.01||u<=0)return [];e.fx.push(()=>{for(let k=0;k<26;k++){const t=Kclamp(u*1.3-Krand(k,1031)*.3);if(t<=0)continue;const x=-e.X-.1+(2*e.X+.4)*((t+Krand(k,1032)*.5)%1.2),y=.55-t*.9*Krand(k,1033)-.2+Math.sin(e.idle+k)*.03,r=(.025+Krand(k,1034)*.035)*e.R,[px,py]=e.P(x,y);
   e.c.strokeStyle=Krgba(['#9bf6ff','#ffc6ff','#fdffb6','#caffbf'][k%4],.75*a);e.c.lineWidth=Math.max(1,r*.08);e.c.beginPath();e.c.arc(px,py,r,0,K_TAU);e.c.stroke();e.c.fillStyle=Krgba('#ffffff',.2*a);e.c.beginPath();e.c.arc(px-r*.35,py-r*.35,r*.25,0,K_TAU);e.c.fill();}});return [];},
 // Paper lanterns of colours along a string over the path.
 fanalets:(st,e)=>{const a=Dwin(st.rel,4.6,7.5,.4);if(a<=.01)return [];const u=st.rel<5.5?Dk(st,5):1,out=[],cols=['#ff595e','#ffca3a','#8ac926','#1982c4','#ff924c','#c77dff'];
  const n=9;for(let k=0;k<n;k++){const t=(k+.5)/n,x=-e.X+.3+(2*e.X-.6)*t,y=-.18+.12*4*t*(1-t)+.04,l=Kclamp(u*n*.6-k*.5);out.push(Dpiece(Doval(0,0,.03,.042,14),e.L(cols[k%6]),{x,y,v:a,z:.1}));
   if(l>0)e.fx.push(()=>{const [px,py]=e.P(x,y);e.c.save();e.c.globalCompositeOperation='lighter';Dglow(e.c,px,py,.09*e.R,cols[k%6],.45*l*a*(.3+.7*e.night));e.c.restore();});}
  e.fx.push(()=>{e.c.strokeStyle=Krgba(e.L('#2d2a3a'),a);e.c.lineWidth=1;e.c.beginPath();for(let k=0;k<=30;k++){const t=k/30,[px,py]=e.P(-e.X+.3+(2*e.X-.6)*t,-.18+.12*4*t*(1-t));k?e.c.lineTo(px,py):e.c.moveTo(px,py);}e.c.stroke();});return out;}
};
const D_SHELLS=[[2.2,2.9,-.25,-.6,'#ff6b9a','#ffd166',0],[2.9,3.6,.45,-.7,'#4cc9f0','#ffffff',1],[3.0,3.65,-.85,-.5,'#80ed99','#ffd166',0],[3.4,4.1,.05,-.8,'#c77dff','#ff6b9a',0],
 [3.5,4.15,1.0,-.55,'#ffd166','#ff8a3a',2],[4.2,4.9,-.5,-.74,'#ffe9a8','#ffd166',3],[4.25,4.95,.6,-.82,'#ffe9a8','#ffffff',3],[5.0,5.6,-.05,-.62,'#ff6b9a','#4cc9f0',0]];
function Dfireworks(e,t){const c=e.c;c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
 D_SHELLS.forEach(([t0,t1,bx,by,c1,c2,kind],k)=>{const x=Math.max(-e.X+.25,Math.min(e.X-.25,bx));
  if(t>=t0&&t<t1){const u=KeaseOut((t-t0)/(t1-t0)),x0=x*.7,y0=.05,hx=x0+(x-x0)*u,hy=y0+(by-y0)*u,[px,py]=e.P(hx,hy),[qx,qy]=e.P(x0+(x-x0)*Math.max(0,u-.15),y0+(by-y0)*Math.max(0,u-.15));
   c.strokeStyle=Krgba('#ffe2a8',.55);c.lineWidth=.004*e.R;c.beginPath();c.moveTo(qx,qy);c.lineTo(px,py);c.stroke();c.fillStyle=Krgba('#fff6d8',.9);c.beginPath();c.arc(px,py,.006*e.R,0,K_TAU);c.fill();return;}
  const dur=kind===3?2.8:1.9,v=(t-t1)/dur;if(v<0||v>=1)return;const R0=(kind===2?.26:kind===3?.38:.33)*e.R,fade=1-Ksmooth((v-.35)/.65),grav=(kind===3?.3:.1)*e.R,n=kind===2?40:34,[cx,cy]=e.P(x,by);
  Dglow(c,cx,cy,R0*.55,c1,.1*fade*(1-v));
  for(const ring of kind===2?[1]:[1,.55]){const col=ring===1?c1:c2;c.strokeStyle=Krgba(col,.85*fade);c.lineWidth=(kind===3?.0035:.005)*e.R;c.beginPath();
   for(let j=0;j<n;j++){const an=j*K_TAU/n+k+ring,pos=w=>{const r=R0*ring*KeaseOut(Math.min(1,w*1.6));return [cx+Math.cos(an)*r,cy+Math.sin(an)*r*(kind===2?.45:1)+grav*w*w];},[ax,ay]=pos(v),[bx2,by2]=pos(Math.max(0,v-(kind===3?.14:.07)));c.moveTo(bx2,by2);c.lineTo(ax,ay);}c.stroke();}
  if(kind===1&&v>.3)for(let j=0;j<22;j++){const w=Kclamp((v-.3-j*.012)/.25);if(w<=0||w>=1)continue;const an=Krand(j,1201+k)*K_TAU,r=R0*(.3+.7*Krand(j,1202+k));c.fillStyle=Krgba('#ffffff',.8*(1-w));c.beginPath();c.arc(cx+Math.cos(an)*r,cy+Math.sin(an)*r+grav*v*v,.004*e.R,0,K_TAU);c.fill();}});
 c.restore();}
// Events of rainy and snowy days (added in 0.13 so those days change as much as the dry ones).
Object.assign(D_EVENTS,{
 // Snowballs fly across the meadow in arcs and burst into powder where they land.
 bolesNeu:(st,e)=>{const u=Dk(st,2);if(!(u>0&&u<1))return [];const out=[];for(let i=0;i<6;i++){const f=Kclamp((u-i*.1)/.16),x0=-e.X+.35+i*.12,x1=-.1+i*.28,y0=.98-(i%2)*.06,y1=.78+(i%3)*.06;
  if(f>0&&f<1){const x=x0+(x1-x0)*f,y=y0+(y1-y0)*f-.42*4*f*(1-f);out.push(Dpiece(Pblob(.045,14,.06,1300+i),e.L('#fbfdff'),{x,y,z:.6}));}
  else if(f>=1){const p=Kclamp((u-i*.1-.16)/.14);if(p<1)for(let k=0;k<7;k++){const an=k*K_TAU/7+i,r=.03+.12*KeaseOut(p);out.push(Dpiece(Pblob(.02*(1-p*.5),10,.1,1320+k),e.L('#ffffff'),{x:x1+Math.cos(an)*r,y:y1+Math.sin(an)*r*.5-.03*p,v:1-p}));}}}return out;},
 // Three sledges of colours slide down from the village hill across the meadow, leaving a spray of snow.
 trineus:(st,e)=>{const u=Dk(st,3);if(!(u>0&&u<1))return [];const out=[],cols=['#e63946','#1d8fe1','#ffb703'];for(let i=0;i<3;i++){const f=Ksmooth(Kclamp((u-i*.16)/.62));if(f<=0||f>=1)continue;
  const x=-1.2+i*.22+f*(1.5+i*.15),y=.46+i*.05+f*(.5-.04*i),r=.22-.05*f,s=1.7+.9*f;out.push(Dpiece([[-.07,-.026],[.06,-.026],[.075,-.04],[.085,-.03],[.07,-.008],[-.07,-.008]],e.L(cols[i]),{x,y,r,s,z:.25}),Dpiece([[-.075,0],[.08,0],[.095,-.018],[.1,-.012],[.085,.006],[-.075,.006]],e.L('#3d3348'),{x,y,r,s,z:.25}));
  for(let k=0;k<5;k++){const b=Kclamp(f*8-k*.4);out.push(Dpiece(Pblob(.012+.004*k,10,.2,1340+k+i*5),e.L('#ffffff'),{x:x-.09*s-k*.035,y:y-.01-k*.012,v:.8*(1-k/5)*b}));}}return out;},
 // Paper boats sail across the pond in the rain and stay there, rocking, until the evening.
 vaixells:(st,e)=>{const a=Dwin(st.rel,2.6,4.6,.4);if(a<=.01)return [];const u=st.rel<3.5?Dk(st,3):1,out=[],cols=['#ffffff','#ffd166','#ff8fab','#8ecae6'];
  for(let i=0;i<4;i++){const f=KeaseOut(Kclamp(u*1.4-i*.15)),x=.62+i*.06+f*(.2+i*.14),y=.63+(i%2)*.06+Math.sin(e.idle*1.3+i)*.006,r=Math.sin(e.idle*1.1+i*2)*.06,s=.9+.15*(i%2),v=a*Kclamp(f*4);
   out.push(Dpiece([[-.06,-.01],[.06,-.01],[.04,.018],[-.04,.018]],e.L(cols[i]),{x,y,r,s,v,j:-.2}),Dpiece([[-.004,-.01],[.044,-.01],[-.004,-.075]],e.L(cols[i]),{x,y,r,s,v,j:.25}),Dpiece([[-.004,-.01],[-.04,-.01],[-.004,-.06]],e.L(cols[i]),{x,y,r,s,v,j:-.05}));}return out;},
 // Snails come out on the wet path and meadow at the end of the night, very slowly.
 cargols:(st,e)=>{const a=Dwin(st.rel,6.6,8.5,.4);if(a<=.01)return [];const u=st.rel<7.5?Dk(st,7):1,out=[],cols=['#c98a4b','#e0a84f','#b5763c','#d9a066'];
  for(let i=0;i<4;i++){const x=[-.6,-.02,.5,-1.1][i]+u*.12*(i%2?1:-1),y=[.88,1.0,.93,.96][i],s=[1.5,2,1.7,1.8][i],v=a*Kclamp(u*3-i*.4),dir=i%2?1:-1;if(Math.abs(x)>e.X-.2)continue;
   out.push(Dpiece([[-.05*dir,0],[.06*dir,0],[.075*dir,-.012],[.08*dir,-.03],[.072*dir,-.032],[.062*dir,-.014],[-.05*dir,-.006]],e.L('#e8d7b8'),{x,y,s,v}),Dpiece(Pblob(.036,18,.04,1360+i),e.L(cols[i]),{x:x-.005*dir,y:y-.035*s,s,v,z:.05}));
   e.fx.push(()=>{const [px,py]=e.P(x-.005*dir,y-.035*s);e.c.strokeStyle=Krgba(e.L('#6b4423'),.8*v);e.c.lineWidth=Math.max(1,.004*e.R);e.c.beginPath();for(let k=0;k<=40;k++){const an=k*.32*dir,r=(.031-.0007*k)*s*e.R;k?e.c.lineTo(px+Math.cos(an)*r,py+Math.sin(an)*r):e.c.moveTo(px+Math.cos(an)*r,py+Math.sin(an)*r);}e.c.stroke();});}return out;}
});
function Dsparkles(e,a,n,y0,y1,x0,x1,seed){const c=e.c;c.save();c.globalCompositeOperation='lighter';for(let k=0;k<n;k++){const x=x0+Krand(k,seed)*(x1-x0),y=y0+Krand(k,seed+1)*(y1-y0),b=.5+.5*Math.sin(e.idle*.9+k*2.1),[px,py]=e.P(x,y),r=(.006+Krand(k,seed+2)*.006)*e.R;
 c.strokeStyle=Krgba('#ffffff',.7*a*b);c.lineWidth=1;c.beginPath();c.moveTo(px-r,py);c.lineTo(px+r,py);c.moveTo(px,py-r);c.lineTo(px,py+r);c.stroke();}c.restore();}
function Dmeteor(e,u,x0,y0,x1,y1){const c=e.c,[ax,ay]=e.P(x0+(x1-x0)*u,y0+(y1-y0)*u),[bx,by]=e.P(x0+(x1-x0)*Math.max(0,u-.25),y0+(y1-y0)*Math.max(0,u-.25)),g=c.createLinearGradient(bx,by,ax,ay),a=Math.sin(Math.PI*u);
 g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,Krgba('#ffffff',.9*a));c.strokeStyle=g;c.lineWidth=.006*e.R;c.lineCap='round';c.beginPath();c.moveTo(bx,by);c.lineTo(ax,ay);c.stroke();Dglow(c,ax,ay,.03*e.R,'#ffffff',.6*a);}

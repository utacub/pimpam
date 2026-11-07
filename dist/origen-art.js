// D'on ve aquest so? (EN21), 0.18: the art. A collage of hand-painted papers: every shape is a piece of paper painted with brush strokes
// in the tones of its colour, torn by hand (a fibrous pale edge) and laid on the others with a soft shadow. The landscapes hang on a
// wall of deep indigo paper, held by strips of tape; a round paper badge at the top shows when the model sounds; a paper leaf flies to
// the landscape in focus. What is quiet is painted once (tlSheet); what makes the sound moves and is drawn every frame: the water of
// the brook, the waves, the rain, the grass and its crickets, the frog and its lily pads, the blackbird, the wind and its ribbons, the
// bubbles and the drops of the cave.
import {OG_PLACES,OG_RESULT,OG_WRONG,ogRound,ogTarget,ogBeats} from './origen.js';
import {TL_DIM,TL_STRIP,TL_TAU,tlVeil,tlRing,tlSheet,tlOpenBox,tlClipOpen,tlDensify} from './tauler.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
const OG_PI=Math.PI;
const ogClamp=x=>Math.max(0,Math.min(1,x));
const ogEase=u=>{u=ogClamp(u);return u*u*(3-2*u);};
const ogHash=(i,s)=>{let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
function ogNoise(x,s){const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return ogHash(i,s)*(1-u)+ogHash(i+1,s)*u;}
function ogRng(seed){let a=seed>>>0||1;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ogHex=h=>{const n=parseInt(h.slice(1,7),16);return [n>>16&255,n>>8&255,n&255];};
// A colour made lighter (k > 0) or darker (k < 0), or mixed with another.
function ogShade(h,k){const f=x=>Math.round(Math.max(0,Math.min(255,k>0?x+(255-x)*k:x*(1+k))));return '#'+ogHex(h).map(x=>f(x).toString(16).padStart(2,'0')).join('');}
function ogMix(a,b,t){const A=ogHex(a),B=ogHex(b);return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*t).toString(16).padStart(2,'0')).join('');}
const ogRgba=(h,a)=>{const [r,g,b]=ogHex(h);return `rgba(${r},${g},${b},${a})`;};
// ── The painted paper ──
// Three tiles of brush strokes in grey (horizontal, slanted and upright strokes), laid over the colour of a piece in soft light: the
// strokes lighten and darken the colour itself, as on paper painted by hand. Outside a browser (the tests) the pieces are plain.
const OG_TILES={};
function ogTile(dir){if(typeof document==='undefined')return null;if(OG_TILES[dir])return OG_TILES[dir];const N=192,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),r=ogRng(dir==='h'?11:dir==='v'?23:37);
 g.fillStyle='#808080';g.fillRect(0,0,N,N);const ang=dir==='h'?0:dir==='v'?OG_PI/2:-.6;g.lineCap='round';
 for(let i=0;i<300;i++){const x=r()*N,y=r()*N,len=10+r()*44,a=ang+(r()-.5)*.7,v=r()<.5?40+r()*60:150+r()*80,wd=1.5+r()*7;g.strokeStyle=`rgba(${v|0},${v|0},${v|0},${.18+r()*.4})`;g.lineWidth=wd;
  for(const ox of [-N,0,N])for(const oy of [-N,0,N]){const cx=x+ox,cy=y+oy;if(cx<-60||cx>N+60||cy<-60||cy>N+60)continue;g.beginPath();g.moveTo(cx-Math.cos(a)*len/2,cy-Math.sin(a)*len/2);g.quadraticCurveTo(cx+(r()-.5)*6,cy+(r()-.5)*6,cx+Math.cos(a)*len/2,cy+Math.sin(a)*len/2);g.stroke();}}
 for(let i=0;i<2600;i++){const v=r()<.5?70:200;g.fillStyle=`rgba(${v},${v},${v},${.08+r()*.18})`;g.fillRect(r()*N,r()*N,1+(r()<.15?1:0),1);}
 return OG_TILES[dir]=cv;}
function ogTexture(c,dir,alpha=.9){const t=ogTile(dir||'h');if(!t||typeof c.createPattern!=='function')return false;const p=c.createPattern(t,'repeat');if(!p)return false;c.save();c.globalCompositeOperation='soft-light';c.globalAlpha*=alpha;c.fillStyle=p;c.fill();c.restore();return true;}
function ogPath(c,P){c.beginPath();c.moveTo(P[0][0],P[0][1]);for(let i=1;i<P.length;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();}
// The outline of a torn piece: points every few pixels pushed in and out along the normal by a smooth noise and a little grain.
function ogTorn(pts,rough,seed,step=7){const d=tlDensify(pts,step),n=d.length;if(rough<=0)return d;return d.map((p,i)=>{const a=d[(i+n-1)%n],b=d[(i+1)%n],tx=b[0]-a[0],ty=b[1]-a[1],L=Math.hypot(tx,ty)||1,k=(ogNoise(i*.42,seed)-.5)*2*rough+(ogHash(i,seed+3)-.5)*rough*.7;return [p[0]-ty/L*k,p[1]+tx/L*k];});}
const ogInset=(P,d)=>{const cx=P.reduce((m,p)=>m+p[0],0)/P.length,cy=P.reduce((m,p)=>m+p[1],0)/P.length;return P.map(([x,y])=>{const L=Math.hypot(x-cx,y-cy)||1,k=Math.min(d,L*.3)/L;return [x+(cx-x)*k,y+(cy-y)*k];});};
// A torn piece of painted paper. o: rough (how torn), dir (of the strokes), soft (a blurred shadow, only for what is painted once),
// shadow (0 for none), rim (false: no pale edge), k (scale of the shadow), accent (a second colour brushed over part of it).
function ogPaper(c,pts,col,seed,o={}){const rough=o.rough??3,k=o.k??1,P=ogTorn(pts,rough,seed,o.step||7);
 if(o.shadow!==0){c.save();if(o.soft){c.shadowColor=`rgba(28,16,6,${.34*(o.shadow??1)})`;c.shadowBlur=7*k;c.shadowOffsetX=1.5*k;c.shadowOffsetY=2.5*k;ogPath(c,P);c.fillStyle=o.rim===false?col:'#f6efdc';c.fill();}
  else{c.translate(1.4*k,2.2*k);ogPath(c,P);c.fillStyle=`rgba(28,16,6,${.24*(o.shadow??1)})`;c.fill();}c.restore();}
 if(o.rim!==false){ogPath(c,P);c.fillStyle=o.rimCol||'#f8f1df';c.fill();}
 const Q=o.rim===false?P:ogInset(ogTorn(pts,rough*.6,seed+11,o.step||7),1.6*k+rough*.25);ogPath(c,Q);c.fillStyle=col;c.fill();
 if(o.accent&&!OG_FLAT){c.save();c.clip();const r=ogRng(seed+5),xs=Q.map(p=>p[0]),ys=Q.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);c.lineCap='round';
  for(let i=0;i<9;i++){c.strokeStyle=ogRgba(o.accent,.22+r()*.22);c.lineWidth=(x1-x0+y1-y0)*(.03+r()*.05);const yy=y0+r()*(y1-y0),xx=x0+r()*(x1-x0);c.beginPath();c.moveTo(xx-(x1-x0)*.4,yy+(r()-.5)*20);c.quadraticCurveTo(xx,yy+(r()-.5)*30,xx+(x1-x0)*.4,yy+(r()-.5)*20);c.stroke();}c.restore();ogPath(c,Q);}
 if(o.tex!==false&&!OG_FLAT)ogTexture(c,o.dir,o.texAlpha??.9);return Q;}
const ogEll=(cx,cy,rx,ry,n=36,a0=0)=>Array.from({length:n},(_,i)=>[cx+Math.cos(a0+i*TL_TAU/n)*rx,cy+Math.sin(a0+i*TL_TAU/n)*ry]);
// A band across the box with a wavy top edge (hills, waves, grass) down to y1.
function ogBand(x,w,y,y1,amp,seed,ph=0,freq=4){const top=[];for(let i=0;i<=28;i++){const t=i/28;top.push([x-12+(w+24)*t,y+Math.sin(t*freq+ph)*amp*.6+(ogNoise(t*6+ph,seed)-.5)*amp*1.2]);}return [...top,[x+w+12,y1],[x-12,y1]];}
const ogBlob=(cx,cy,rx,ry,seed,wob=.18,n=34)=>{const ph=[ogHash(1,seed)*6,ogHash(2,seed)*6,ogHash(3,seed)*6];return Array.from({length:n},(_,i)=>{const a=i*TL_TAU/n,k=1+wob*(.55*Math.sin(2*a+ph[0])+.3*Math.sin(3*a+ph[1])+.15*Math.sin(5*a+ph[2]));return [cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k];});};
function ogCloud(c,cx,cy,s,col,seed,o={}){const pts=[];for(let i=0;i<=40;i++){const a=OG_PI+i*OG_PI/40,bump=1+.22*Math.abs(Math.sin(a*3+seed));pts.push([cx+Math.cos(a)*s*1.6,cy+Math.sin(a)*s*.9*bump]);}pts.push([cx+s*1.6,cy+s*.22],[cx-s*1.6,cy+s*.22]);ogPaper(c,pts,col,seed,{rough:2,dir:'h',...o});}
// The sky: a painted sheet across the box, lighter towards the horizon, with a few broad strokes of the second colour.
function ogSky(c,x,y,w,h,cols,seed,k){ogPaper(c,[[x-20,y-20],[x+w+20,y-20],[x+w+20,y+h+20],[x-20,y+h+20]],cols[0],seed,{rim:false,shadow:0,dir:'h',accent:cols[1],k});
 ogPaper(c,ogBand(x,w,y+h*.42,y+h+20,h*.05,seed+1,1,3),ogMix(cols[0],cols[1],.55),seed+2,{rim:false,shadow:0,dir:'h',k,rough:5});}
const ogStar=(cx,cy,R,a0=-OG_PI/2)=>Array.from({length:10},(_,i)=>{const a=a0+i*OG_PI/5,q=i%2?R*.45:R;return [cx+Math.cos(a)*q,cy+Math.sin(a)*q];});
// The light of the moment of the day: morning, afternoon or evening.
const OG_SKIES={mati:['#6fbdf0','#d4f0ff'],tarda:['#f3a35c','#ffe3a6'],vespre:['#46408f','#ef93a7']};
const OG_SUN={mati:'#ffd23d',tarda:'#ff8c3a',vespre:'#fff0c2'};
// ── The nine places ──
// Each place has what is quiet (the decor: the sky, the land, the walls of the cave) and what makes its sound (the water, the waves,
// the rain, the grass and the crickets, the frog, the blackbird, the wind, the bubbles, the drops). still(c,x,y,w,h,m,k) paints the first
// in the box; live(c,x,y,w,h,m,t,a,ink,beat,k) draws the second at time t, with a from 0 (at rest, as on the board) to 1 (alive);
// ink is set when there is no decor on a white base (light pieces then take a darker colour); beat (0 to 1) answers the music.
const ogSun=(c,x,y,w,h,m,k)=>{const S=Math.min(w,h);if(m==='vespre'){ogPaper(c,ogEll(x+w*.78,y+h*.15,S*.07,S*.07),'#fff3c8',71,{soft:1,k,tex:false});ogPaper(c,ogEll(x+w*.805,y+h*.135,S*.06,S*.06),OG_SKIES.vespre[0],72,{rim:false,shadow:0,k});return;}
 ogPaper(c,ogEll(x+w*(m==='mati'?.22:.76),y+h*(m==='mati'?.13:.2),S*.085,S*.085),OG_SUN[m],73,{soft:1,k,dir:'d'});};
const ogTree=(c,cx,by,s,col,seed,k)=>{ogPaper(c,[[cx-s*.07,by],[cx+s*.07,by],[cx+s*.05,by-s*.75],[cx-s*.05,by-s*.75]],'#7a4a2a',seed,{rough:1,k,dir:'v'});ogPaper(c,ogBlob(cx,by-s*.95,s*.42,s*.4,seed+1),col,seed+2,{soft:1,k,dir:'d',accent:ogShade(col,.25)});};
const ogFir=(c,cx,by,s,col,seed,k)=>{ogPaper(c,[[cx,by-s],[cx+s*.32,by-s*.1],[cx+s*.06,by-s*.1],[cx+s*.06,by],[cx-s*.06,by],[cx-s*.06,by-s*.1],[cx-s*.32,by-s*.1]],col,seed,{rough:1.2,k,dir:'v'});};
const ogSliver=(c,x0,y0,x1,y1,wd,col,alpha=1)=>{const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*wd/2,ny=dx/L*wd/2;c.globalAlpha=alpha;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2+nx,(y0+y1)/2+ny,x1,y1);c.quadraticCurveTo((x0+x1)/2-nx,(y0+y1)/2-ny,x0,y0);c.fillStyle=col;c.fill();c.globalAlpha=1;};
const ogRing=(c,cx,cy,rx,ry,col,wd,alpha)=>{if(alpha<=0)return;c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=wd;c.beginPath();c.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),0,0,TL_TAU);c.stroke();c.restore();};
// the centre line of the brook and its width at v (0 at the top, 1 at the bottom of the box)
const ogBrook=(x,w,v)=>[x+w*(.5+.09*Math.sin(v*5.4+.4)-.04*Math.sin(v*11)),w*(.02+.19*v*v+.03*v)];
const OG_LAND={mati:['#9fd36a','#6cbf4a','#3f9a43'],tarda:['#c8c45a','#8fb04a','#5a8a3a'],vespre:['#7a8a6a','#567a5a','#3a5a4a']};
const OG_MOUNT={mati:['#8a8fe0','#6a72cf'],tarda:['#b07ab8','#8a5a9f'],vespre:['#5a4a8a','#3e3570']};
const OG_PLACE_ART={
 brook:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),L=OG_LAND[m],M=OG_MOUNT[m];ogSky(c,x,y,w,h,OG_SKIES[m],101,k);ogSun(c,x,y,w,h,m,k);ogCloud(c,X(.3),Y(.12),S*.07,'#fbf8f0',102,{k});ogCloud(c,X(.62),Y(.07),S*.05,'#fbf8f0',103,{k});
  ogPaper(c,[[X(-.1),Y(.5)],[X(.3),Y(.15)],[X(.62),Y(.5)]],M[0],104,{soft:1,k,dir:'d',accent:ogShade(M[0],.3)});ogPaper(c,[[X(.22),Y(.24)],[X(.3),Y(.15)],[X(.38),Y(.24)],[X(.33),Y(.22)],[X(.3),Y(.26)],[X(.27),Y(.21)]],'#ffffff',105,{k,rough:1.5});
  ogPaper(c,[[X(.38),Y(.52)],[X(.74),Y(.09)],[X(1.12),Y(.52)]],M[1],106,{soft:1,k,dir:'d',accent:ogShade(M[1],.25)});ogPaper(c,[[X(.65),Y(.2)],[X(.74),Y(.09)],[X(.83),Y(.2)],[X(.78),Y(.18)],[X(.74),Y(.23)],[X(.7),Y(.18)]],'#ffffff',107,{k,rough:1.5});
  ogPaper(c,ogBand(x,w,Y(.42),Y(1.05),h*.03,108,0,3),L[0],109,{soft:1,k,dir:'h'});
  [[.02,.5,.3,.58,'#e8d26a'],[.66,.5,.98,.6,'#b8d860'],[.1,.62,.4,.74,'#d9e07a'],[.62,.64,.96,.78,'#9ccf58']].forEach(([a,b,cc,d,col],i)=>ogPaper(c,[[X(a),Y(b)],[X(cc),Y(b+.01)],[X(cc+.02),Y(d)],[X(a-.02),Y(d-.01)]],col,110+i,{k,rough:2,dir:i%2?'v':'d'}));
  ogPaper(c,ogBand(x,w,Y(.8),Y(1.05),h*.025,114,2,4),L[2],115,{soft:1,k,dir:'v'});
  ogFir(c,X(.16),Y(.47),S*.12,ogShade(L[2],-.2),116,k);ogFir(c,X(.22),Y(.48),S*.09,ogShade(L[2],-.1),117,k);ogTree(c,X(.84),Y(.62),S*.14,L[1],118,k);ogTree(c,X(.12),Y(.82),S*.16,ogShade(L[1],-.15),120,k);
  // the little house of the valley, and stones on the banks
  ogPaper(c,[[X(.7),Y(.5)],[X(.79),Y(.5)],[X(.79),Y(.56)],[X(.7),Y(.56)]],'#f3e3c8',122,{k,rough:1});ogPaper(c,[[X(.685),Y(.505)],[X(.745),Y(.455)],[X(.805),Y(.505)]],'#d8452e',123,{k,rough:1});
  for(let i=0;i<7;i++){const v=.62+i*.055,[cx,wd]=ogBrook(x,w,v),side=i%2?1:-1;ogPaper(c,ogBlob(cx+side*(wd/2+S*.03),Y(v),S*.025,S*.017,124+i,.25,14),i%3?'#b8b0a8':'#9a928c',130+i,{k,rough:1});}
  const r=ogRng(140);for(let i=0;i<26;i++){const fx=X(r()),fy=Y(.86+r()*.12);c.fillStyle=['#ffffff','#ffe14a','#ff6fa8','#b88cff'][i%4];c.beginPath();c.arc(fx,fy,S*(.006+r()*.006),0,TL_TAU);c.fill();}},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const S=Math.min(w,h),N=40,left=[],right=[],inner=[];for(let i=0;i<=N;i++){const v=.42+i/N*.62,[cx,wd]=ogBrook(x,w,v);left.push([cx-wd/2,y+h*v]);right.push([cx+wd/2,y+h*v]);inner.push([cx,y+h*v,wd]);}
  ogPaper(c,[...left,...right.reverse()],'#3f8fd8',151,{k,rough:2,dir:'v',step:9});ogPaper(c,inner.map(([cx,cy,wd])=>[cx-wd*.22+Math.sin(cy*.03)*wd*.05,cy]).concat(inner.slice().reverse().map(([cx,cy,wd])=>[cx+wd*.18,cy])),'#7cc4f0',152,{k,rough:1.5,rim:false,shadow:0,dir:'v',step:9});
  // flakes of foam travel down with the water; at rest they keep their places
  for(let i=0;i<34;i++){const v=.42+((ogHash(i,7)+t*.09*a)%1)*.62,[cx,wd]=ogBrook(x,w,v),[cx2]=ogBrook(x,w,v+.02),off=(ogHash(i,9)-.5)*wd*.75,len=S*(.018+.03*v);ogSliver(c,cx+off,y+h*v,cx2+off,y+h*(v+.02)+len*.4,S*(.006+.008*v),ink?'#5d8fc8':'#f4fbff',Math.min(1,(v-.42)*6)*.85);}
  for(const [v,s] of [[.7,.03],[.88,.042]]){const [cx]=ogBrook(x,w,v);ogPaper(c,ogBlob(cx+S*.02,y+h*v,S*s,S*s*.7,160+v*10,.2,16),'#8f8a86',161+v*10,{k,rough:1,shadow:.6});const p=(t*1.2*a+v)%1;ogRing(c,cx+S*.02,y+h*v+S*s*.3,S*s*(1.1+p*.8),S*s*(.5+p*.3),ink?'#5d8fc8':'#ffffff',S*.006,(1-p)*.7*Math.max(.35,a));}}},
 beach:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h);ogSky(c,x,y,w,h,OG_SKIES[m],201,k);ogSun(c,x,y,w,h,m,k);ogCloud(c,X(.36),Y(.16),S*.075,'#fbf8f0',202,{k});ogCloud(c,X(.08),Y(.08),S*.05,'#fbf8f0',203,{k});
  // the headland with its lighthouse, and an island far away
  ogPaper(c,ogBand(x+w*.6,w*.5,Y(.36),Y(.48),h*.05,204,1,2),m==='vespre'?'#4a5a8a':'#5d8a7a',205,{soft:1,k,dir:'d'});ogPaper(c,ogEll(X(.16),Y(.46),w*.08,h*.025,20),m==='vespre'?'#5a6a9a':'#7aa090',206,{k,rough:1.5,dir:'h'});
  const lx=X(.86),ly=Y(.37);ogPaper(c,[[lx-S*.012,ly],[lx+S*.012,ly],[lx+S*.008,ly-S*.07],[lx-S*.008,ly-S*.07]],'#ffffff',207,{k,rough:.5});for(let j=0;j<2;j++)ogPaper(c,[[lx-S*.0115+j*.001,ly-S*(.018+j*.03)],[lx+S*.0115-j*.001,ly-S*(.018+j*.03)],[lx+S*.011,ly-S*(.03+j*.03)],[lx-S*.011,ly-S*(.03+j*.03)]],'#e8483a',208+j,{k,rough:.3,shadow:0,rim:false});
  ogPaper(c,[[lx-S*.012,ly-S*.07],[lx,ly-S*.088],[lx+S*.012,ly-S*.07]],'#c8352a',210,{k,rough:.3});
  ogPaper(c,ogBand(x,w,Y(.73),Y(1.05),h*.02,211,0,2),m==='vespre'?'#d9a87a':'#f2cf86',212,{soft:1,k,dir:'d',accent:'#fff0c0'});ogPaper(c,ogBand(x,w,Y(.88),Y(1.05),h*.02,213,1,3),m==='vespre'?'#e3b88a':'#f7dc9c',214,{k,dir:'d'});
  // a towel, a parasol, a bucket and its spade, a little sandcastle and shells
  const tx=X(.16),ty=Y(.9);ogPaper(c,[[tx-S*.11,ty-S*.03],[tx+S*.1,ty-S*.035],[tx+S*.12,ty+S*.04],[tx-S*.1,ty+S*.045]],'#2f86c8',215,{k,rough:.8,dir:'h'});for(let j=0;j<3;j++){const v=-.02+j*.025;ogPaper(c,[[tx-S*.105,ty+S*v],[tx+S*.105,ty+S*(v-.004)],[tx+S*.107,ty+S*(v+.01)],[tx-S*.103,ty+S*(v+.014)]],'#ffffff',216+j,{k,rough:.4,shadow:0,rim:false});}
  const px=X(.74),py=Y(1.01),ph=S*.16;ogPaper(c,[[px-S*.005,py],[px+S*.005,py],[px+S*.004,py-ph],[px-S*.004,py-ph]],'#8a5a3a',220,{k,rough:.5});
  for(let i=0;i<6;i++){const a0=OG_PI+i*OG_PI/6,a1=a0+OG_PI/6,R=S*.13;ogPaper(c,[[px,py-ph-S*.02],[px+Math.cos(a0)*R,py-ph+Math.sin(a0)*R*.45+S*.03],[px+Math.cos(a1)*R,py-ph+Math.sin(a1)*R*.45+S*.03]],i%2?'#ffffff':'#e8483a',221+i,{k,rough:.8,shadow:i?0:1});}
  const bx=X(.45),by=Y(.93);ogPaper(c,[[bx-S*.025,by-S*.04],[bx+S*.025,by-S*.04],[bx+S*.018,by+S*.012],[bx-S*.018,by+S*.012]],'#ffcf3a',230,{k,rough:.6});ogPaper(c,[[bx-S*.027,by-S*.045],[bx+S*.027,by-S*.045],[bx+S*.027,by-S*.036],[bx-S*.027,by-S*.036]],'#ff8a3a',231,{k,rough:.4,shadow:0});
  ogPaper(c,[[bx+S*.04,by+S*.01],[bx+S*.046,by+S*.01],[bx+S*.07,by-S*.06],[bx+S*.064,by-S*.062]],'#e8483a',232,{k,rough:.3});
  const cx=X(.56),cy=Y(.94);ogPaper(c,[[cx-S*.05,cy+S*.01],[cx-S*.045,cy-S*.03],[cx-S*.03,cy-S*.03],[cx-S*.03,cy-S*.05],[cx+S*.03,cy-S*.05],[cx+S*.03,cy-S*.03],[cx+S*.045,cy-S*.03],[cx+S*.05,cy+S*.01]],'#e8b860',233,{k,rough:.8,dir:'v'});
  ogPaper(c,[[cx-S*.012,cy-S*.05],[cx+S*.012,cy-S*.05],[cx,cy-S*.075]],'#d8a050',234,{k,rough:.4});
  for(let i=0;i<5;i++)ogPaper(c,ogEll(X(.3+i*.15),Y(.8+(i%2)*.035),S*.012,S*.009,10),['#ffb3a0','#ffffff','#f7c8e0','#ffd8a0','#ffffff'][i],240+i,{k,rough:.5});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),cols=m==='vespre'?['#3a4f9a','#2f5fae','#2a6cba','#2f86c8']:['#1f7fd0','#1b95c8','#14a2c4','#2cb9cf'];
  const boat=Y(.455)+Math.sin(t*1.4*a)*S*.006;ogPaper(c,[[X(.3)-S*.03,boat],[X(.3)+S*.03,boat],[X(.3)+S*.02,boat+S*.014],[X(.3)-S*.02,boat+S*.014]],'#c8352a',250,{k,rough:.4,shadow:.5});ogPaper(c,[[X(.3),boat-S*.002],[X(.3),boat-S*.07],[X(.3)+S*.035,boat-S*.006]],'#ffffff',251,{k,rough:.4,shadow:.5});
  cols.forEach((col,i)=>ogPaper(c,ogBand(x,w,Y(.47+i*.062),Y(.745),h*.022,260+i,i*1.3+t*(.7+i*.15)*a,4+i),col,270+i,{k,rough:2.4,dir:'h',shadow:.8}));
  // the light of the sun on the sea, and the swash: foam runs up the sand and back
  const sx=X(m==='mati'?.22:m==='tarda'?.76:.78);for(let i=0;i<9;i++){const yy=Y(.5+i*.027),wob=Math.sin(t*1.8*a+i*1.7)*S*.012,len=S*(.05+.012*i);ogSliver(c,sx-len/2+wob,yy,sx+len/2+wob,yy+S*.002,S*.007,ink?'#c89a3a':'#fff6d0',.75);}
  const sw=Math.sin(t*.9*a)*.5+.5,top=Y(.735+.03*sw);ogPaper(c,ogBand(x,w,top,top+h*.022,h*.012,280,t*.6*a,6),ink?'#7aa6d6':'#fbfdff',281,{k,rough:2,dir:'h',shadow:.5});
  for(let i=0;i<8;i++){const fx=X(((ogHash(i,13)+t*.02*a)%1)),fy=Y(.5+ogHash(i,17)*.2);ogSliver(c,fx,fy,fx+S*.05,fy+S*.002,S*.006,ink?'#7aa6d6':'#ffffff',.7);}}},
 rain:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),sky={mati:['#8fa8c8','#d6e2ee'],tarda:['#a89ab8','#e8d6d0'],vespre:['#4f5a86','#9a8ab0']}[m],G={mati:['#5aa860','#3f8f4f','#2c7040'],tarda:['#7aa060','#5a8a4a','#3f6a3a'],vespre:['#3f6a5a','#2f5a4a','#22443a']}[m];
  ogSky(c,x,y,w,h,sky,301,k);ogPaper(c,ogBand(x,w,Y(.36),Y(1.05),h*.06,302,.5,2),ogMix(G[0],sky[0],.35),303,{soft:1,k,dir:'d'});ogPaper(c,ogBand(x,w,Y(.48),Y(1.05),h*.04,304,2,3),G[0],305,{soft:1,k,dir:'h'});
  const r=ogRng(306);for(let row=0;row<3;row++)for(let i=0;i<7;i++){const cx=X(-.04+i*.18+row*.07+r()*.04),by=Y(.5+row*.11),s=S*(.15+row*.035);ogTree(c,cx,by,s,G[Math.min(2,row)],310+row*10+i,k);}
  ogPaper(c,ogBand(x,w,Y(.8),Y(1.05),h*.02,340,1,3),G[2],341,{soft:1,k,dir:'v'});ogPaper(c,[[X(.44),Y(1.05)],[X(.48),Y(.8)],[X(.52),Y(.8)],[X(.62),Y(1.05)]],'#b89a7a',342,{k,dir:'v'});
  for(const [u,v,s] of [[.24,.9,.12],[.76,.93,.1]])ogPaper(c,ogEll(X(u),Y(v),S*s,S*s*.22,26),m==='vespre'?'#6a7aa8':'#9ab8d8',350+u*10,{k,rough:1.5,dir:'h'});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),col=m==='vespre'?'#5a5f86':'#7c849a';
  for(let i=0;i<4;i++){const cx=x+((ogHash(i,21)*w+t*S*.02*a)%(w*1.3))-w*.15;ogCloud(c,cx,Y(.06+i%2*.07),S*(.08+ogHash(i,22)*.04),i%2?col:ogShade(col,-.15),370+i,{k,rough:2});}
  // the rain: slivers of pale paper, slanted, falling all the time it rains (at rest, where they are)
  const n=Math.round(70*Math.max(.6,w*h/(500*600))),dc=ink?'#4d6fa8':'#dfeaf8';for(let i=0;i<n;i++){const fx=x+ogHash(i,31)*w,len=S*(.035+ogHash(i,32)*.03),sp=h*(1.1+ogHash(i,33)*.5),fy=y-len+((ogHash(i,34)*(h+len)+t*sp*a)%(h+len));ogSliver(c,fx,fy,fx-len*.25,fy+len,S*.005,dc,.8);}
  for(const [u,v,s] of [[.24,.9,.12],[.76,.93,.1]])for(let j=0;j<3;j++){const p=((t*.8*a+j/3+u)%1);ogRing(c,X(u+(j-1)*s*.35),Y(v),S*s*.35*p,S*s*.08*p,ink?'#4d6fa8':'#eef6ff',S*.004,(1-p)*.9);}}},
 night:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),sky={mati:['#3a3478','#a070b0'],tarda:['#121a4a','#2f3f80'],vespre:['#1a2a62','#5a6aa8']}[m];ogSky(c,x,y,w,h,sky,401,k);
  // a soft band of the milky way, stars and the moon
  c.save();c.globalAlpha=.16;ogPaper(c,[[X(-.1),Y(.36)],[X(.4),Y(.12)],[X(1.1),Y(-.05)],[X(1.1),Y(.08)],[X(.45),Y(.22)],[X(-.1),Y(.46)]],'#c8c0ff',402,{rim:false,shadow:0,k,dir:'d',rough:8});c.restore();
  const r=ogRng(403);for(let i=0;i<26;i++){const sx=X(.03+r()*.94),sy=Y(.03+r()*.4),R=S*(.006+r()*(i<8?.016:.008));ogPaper(c,ogStar(sx,sy,R,r()),i%5?'#ffeaa0':'#ffffff',404+i,{k,rough:.25,shadow:0,tex:false});}
  if(m==='vespre')ogPaper(c,ogEll(X(.72),Y(.18),S*.11,S*.11),'#fff2c4',430,{soft:1,k,dir:'d',accent:'#f0e0a8'});else{ogPaper(c,ogEll(X(.74),Y(.16),S*.08,S*.08),'#fff2c4',430,{soft:1,k,dir:'d'});ogPaper(c,ogEll(X(.768),Y(.143),S*.07,S*.07),sky[0],431,{rim:false,shadow:0,k});}
  ogPaper(c,ogBand(x,w,Y(.5),Y(1.05),h*.06,432,1,2),'#24425a',433,{soft:1,k,dir:'h'});
  for(let i=0;i<6;i++){const tx=X(.5+i*.08),ty=Y(.5+.03*Math.sin(i*1.7));ogFir(c,tx,ty,S*(.08+(i%3)*.025),'#16303f',434+i,k);}
  const hx=X(.2),hy=Y(.54);ogPaper(c,[[hx-S*.05,hy],[hx+S*.05,hy],[hx+S*.05,hy-S*.05],[hx-S*.05,hy-S*.05]],'#3a3a5a',441,{k,rough:1});ogPaper(c,[[hx-S*.065,hy-S*.045],[hx,hy-S*.095],[hx+S*.065,hy-S*.045]],'#5a3a4a',442,{k,rough:1});
  c.fillStyle='#ffd77a';c.fillRect(hx-S*.03,hy-S*.035,S*.02,S*.018);c.fillRect(hx+S*.012,hy-S*.035,S*.02,S*.018);
  ogPaper(c,ogBand(x,w,Y(.62),Y(1.05),h*.035,443,3,3),'#1d3a38',444,{soft:1,k,dir:'v'});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),bugs=[];
  // tall grass in three rows, with seed heads, swaying; the crickets sit on the blades of the middle row
  for(let layer=0;layer<3;layer++){const n=Math.round(w/(S*(.05-layer*.01))),col=['#2a5a46','#36784c','#4a9256'][layer],base=Y(1.02),seedCol=['#5a6a4a','#8a9a5a','#b0b46a'][layer];
   for(let i=0;i<n;i++){const bx=x+(i+ogHash(i,41+layer))*w/n,hh=h*(.2+ogHash(i,43+layer)*.16+layer*.05),lean=(ogHash(i,45+layer)-.5)*S*.06,sway=Math.sin(t*1.3*a+i*.7+layer)*S*.018*a,tip=[bx+lean+sway,base-hh],wd=S*(.006+layer*.002);
    c.fillStyle=ink?ogShade(col,-.15):col;c.beginPath();c.moveTo(bx-wd,base);c.quadraticCurveTo(bx+(lean+sway)*.3,base-hh*.55,tip[0],tip[1]);c.quadraticCurveTo(bx+(lean+sway)*.3+wd*.6,base-hh*.55,bx+wd,base);c.fill();
    if(i%4===layer){c.fillStyle=seedCol;c.beginPath();c.ellipse(tip[0],tip[1]+S*.012,S*.006,S*.018,(lean+sway)/hh,0,TL_TAU);c.fill();}
    if(layer===1&&i%7===3)bugs.push([bx+(lean+sway)*.62,base-hh*.6,i]);}}
  // the crickets: small and far; with each note of the music, a few marks of sound next to them
  for(const [bx,by,i] of bugs){c.save();c.translate(bx,by);c.rotate(-.55+Math.sin(t*2*a+i)*.05);const bc=ink?'#1a3a2a':'#16200f';c.fillStyle=bc;c.beginPath();c.ellipse(0,0,S*.02,S*.0075,0,0,TL_TAU);c.fill();c.beginPath();c.arc(S*.018,-S*.002,S*.006,0,TL_TAU);c.fill();
   c.strokeStyle=bc;c.lineWidth=S*.0025;c.lineCap='round';c.beginPath();c.moveTo(-S*.006,S*.004);c.lineTo(-S*.016,S*.016);c.lineTo(-S*.004,S*.02);c.moveTo(S*.004,S*.006);c.lineTo(S*.006,S*.016);c.moveTo(S*.022,-S*.006);c.quadraticCurveTo(S*.04,-S*.026,S*.052,-S*.018);c.stroke();c.restore();
   const p=Math.max(beat,.5+.5*Math.sin(t*6+i))*a;if(p>.05){c.save();c.strokeStyle=ink?`rgba(60,80,140,${(.75*p).toFixed(3)})`:`rgba(255,240,180,${(.8*p).toFixed(3)})`;c.lineWidth=S*.0035;c.lineCap='round';for(let j=1;j<3;j++){c.beginPath();c.arc(bx+S*.012,by-S*.012,S*.016*j,-1.5,-.3);c.stroke();}c.restore();}}}},
 pond:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),L=OG_LAND[m];ogSky(c,x,y,w,h,OG_SKIES[m],501,k);ogSun(c,x,y,w,h,m,k);ogCloud(c,X(.45),Y(.12),S*.06,'#fbf8f0',502,{k});
  for(let i=0;i<9;i++)ogPaper(c,ogBlob(X(-.02+i*.13),Y(.36),S*.09,S*.08,503+i),ogShade(L[2],-.2+(i%3)*.08),510+i,{soft:1,k,dir:'d'});
  ogPaper(c,ogBand(x,w,Y(.38),Y(1.05),h*.02,520,1,3),L[1],521,{soft:1,k,dir:'h'});ogPaper(c,ogEll(X(.5),Y(.66),w*.48,h*.2,48),m==='vespre'?'#3a5a9a':'#2f8fbf',522,{soft:1,k,rough:4,dir:'h',accent:'#7cc8e8'});
  ogPaper(c,ogEll(X(.44),Y(.6),w*.2,h*.025,30),m==='vespre'?'#8aa0d8':'#9fdcf0',523,{k,rough:2,rim:false,shadow:0,dir:'h'});
  for(const [u,n] of [[.07,6],[.9,5]])for(let i=0;i<n;i++){const rx=X(u+(i-n/2)*.018),ry=Y(.88),hh=S*(.2+(i%3)*.06);ogPaper(c,[[rx-S*.004,ry],[rx+S*.004,ry],[rx+S*.002,ry-hh],[rx-S*.002,ry-hh]],'#4a7a3a',530+i+u*10,{k,rough:.4,shadow:.6});if(i%2===0)ogPaper(c,ogEll(rx,ry-hh+S*.03,S*.009,S*.03,12),'#7a4a2a',540+i+u*10,{k,rough:.4,shadow:.6});}
  ogPaper(c,ogBand(x,w,Y(.9),Y(1.05),h*.015,550,2,4),L[2],551,{soft:1,k,dir:'v'});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),pads=[[.3,.7,.07],[.62,.66,.06],[.5,.78,.055],[.78,.74,.045]];
  pads.forEach(([u,v,s],i)=>{const by=Y(v)+Math.sin(t*1.1*a+i*1.7)*S*.004,R=S*s,pts=Array.from({length:26},(_,j)=>{const an=.35+j*(TL_TAU-.7)/25;return [X(u)+Math.cos(an)*R,by+Math.sin(an)*R*.42];});pts.push([X(u),by]);ogPaper(c,pts,i%2?'#4caf50':'#5ec25a',560+i,{k,rough:1,dir:'d',shadow:.7});
   const p=((t*.45*a+i*.3)%1);ogRing(c,X(u),by,R*(1.1+p*.9),R*.42*(1.1+p*.9),ink?'#3f7aa8':'#d8f4ff',S*.003,(1-p)*.6*a);});
  ogPaper(c,ogEll(X(.5)+S*.01,Y(.78)-S*.012,S*.018,S*.012,14),'#ff9ac8',570,{k,rough:.5,shadow:.6});
  // the frog: a small green silhouette on the first lily pad that hops with the music, and rings where it lands
  const hop=a*Math.max(beat,0),jump=Math.sin(Math.min(1,hop)*OG_PI)*S*.035,fx=X(.3),fy=Y(.7)-S*.012-jump+Math.sin(t*1.1*a)*S*.004;c.save();c.translate(fx,fy);const fc=ink?'#2f7a2a':'#3c9a3a';
  c.fillStyle=fc;c.beginPath();c.ellipse(0,0,S*.028,S*.018,0,0,TL_TAU);c.fill();c.beginPath();c.ellipse(-S*.018,S*.008,S*.016,S*.009,.4,0,TL_TAU);c.ellipse(S*.018,S*.008,S*.016,S*.009,-.4,0,TL_TAU);c.fill();
  c.beginPath();c.arc(-S*.011,-S*.016,S*.007,0,TL_TAU);c.arc(S*.011,-S*.016,S*.007,0,TL_TAU);c.fill();c.fillStyle=ogShade(fc,.35);c.beginPath();c.ellipse(0,S*.004,S*.016,S*.009,0,0,TL_TAU);c.fill();c.restore();}},
 garden:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),L=OG_LAND[m];ogSky(c,x,y,w,h,OG_SKIES[m],601,k);ogSun(c,x,y,w,h,m,k);ogCloud(c,X(.62),Y(.12),S*.07,'#fbf8f0',602,{k});
  ogPaper(c,[[X(-.05),Y(.5)],[X(1.05),Y(.5)],[X(1.05),Y(.64)],[X(-.05),Y(.64)]],'#c98a6a',603,{soft:1,k,dir:'h',accent:'#e8b090'});for(let row=0;row<2;row++)for(let i=0;i<9;i++){const u=i*.13-(row?.065:0);ogPaper(c,[[X(u),Y(.5+row*.045)],[X(u+.12),Y(.5+row*.045)],[X(u+.12),Y(.54+row*.045)],[X(u),Y(.54+row*.045)]],(i+row)%2?'#d89a7a':'#b87a5a',604+i+row*10,{k,rough:.8,shadow:.5});}
  // a hedge in front of the wall, the lawn, and the tulips
  for(let i=0;i<10;i++)ogPaper(c,ogBlob(X(-.05+i*.12),Y(.64),S*.08,S*.06,625+i,.2,20),ogShade(L[2],-.12+(i%3)*.07),630+i,{soft:1,k,dir:'d'});
  ogPaper(c,ogBand(x,w,Y(.66),Y(1.05),h*.015,641,1,3),L[0],642,{soft:1,k,dir:'v'});
  const r=ogRng(643);for(let i=0;i<8;i++){const fx=X(.16+i*.11),fy=Y(.82+(i%2)*.07),fs=S*.034,col=['#e8483a','#ffd23d','#ff7ab8','#ffffff','#b07aff','#ff8a3a'][i%6];ogPaper(c,[[fx-S*.004,fy+S*.16],[fx+S*.004,fy+S*.16],[fx+S*.004,fy],[fx-S*.004,fy]],'#3f8a3a',650+i,{k,rough:.3,shadow:.5});
   ogPaper(c,ogEll(fx+fs*.9,fy+S*.09,fs*.9,fs*.3,12,r()-.5),'#4f9a3a',660+i,{k,rough:.4,shadow:.4});ogPaper(c,[[fx-fs,fy-fs*1.1],[fx-fs*.5,fy-fs*.5],[fx,fy-fs*1.2],[fx+fs*.5,fy-fs*.5],[fx+fs,fy-fs*1.1],[fx+fs*.85,fy+fs*.2],[fx,fy+fs*.4],[fx-fs*.85,fy+fs*.2]],col,670+i,{k,rough:.6,dir:'v'});}
  // the tree: its trunk on the left and its crown above, with a little birdhouse
  ogPaper(c,[[X(-.04),Y(1.05)],[X(.12),Y(1.05)],[X(.1),Y(.45)],[X(.085),Y(.2)],[X(.05),Y(-.05)],[X(-.04),Y(-.05)]],'#7a4a2a',680,{soft:1,k,dir:'v',accent:'#a06a40'});
  const bhx=X(.06),bhy=Y(.5);ogPaper(c,[[bhx-S*.035,bhy],[bhx+S*.035,bhy],[bhx+S*.035,bhy-S*.06],[bhx-S*.035,bhy-S*.06]],'#ffd23d',681,{k,rough:.6});ogPaper(c,[[bhx-S*.05,bhy-S*.055],[bhx,bhy-S*.1],[bhx+S*.05,bhy-S*.055]],'#e8483a',682,{k,rough:.6});c.fillStyle='#3a2a1a';c.beginPath();c.arc(bhx,bhy-S*.032,S*.012,0,TL_TAU);c.fill();
  for(let i=0;i<6;i++)ogPaper(c,ogBlob(X(.02+i*.08),Y(.03+(i%2)*.07),S*(.13+(i%3)*.03),S*.1,683+i),ogShade(L[2],-.1+(i%3)*.08),690+i,{soft:1,k,dir:'d',accent:ogShade(L[1],.2)});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),L=OG_LAND[m];
  // the branch with its leaves, and the blackbird on it: it turns its head, hops and sings with the music
  ogPaper(c,[[X(.04),Y(.33)],[X(.45),Y(.3)],[X(.86),Y(.35)],[X(.86),Y(.372)],[X(.45),Y(.33)],[X(.04),Y(.37)]],'#6a4026',700,{k,rough:1,dir:'h',shadow:.8});
  for(let i=0;i<11;i++){const u=.12+i*.068,lx=X(u),ly=Y(.31+.025*Math.sin(u*7))+(i%2?-1:1)*S*.022,rot=(i%2?-.7:.7)+Math.sin(t*2*a+i)*.14*a;c.save();c.translate(lx,ly);c.rotate(rot);ogPaper(c,ogEll(S*.038,0,S*.038,S*.015,14),i%3?L[1]:ogShade(L[1],-.2),710+i,{k,rough:.5,dir:'h',shadow:.6});c.restore();}
  const hop=Math.sin(Math.min(1,a*beat)*OG_PI)*S*.025,bx=X(.55),by=Y(.31)-hop,tilt=Math.sin(t*1.7*a)*.2*a,B=S*1.45;c.save();c.translate(bx,by);const bc=ink?'#1a1a2a':'#2a2224';c.fillStyle=bc;
  c.beginPath();c.ellipse(0,-B*.035,B*.042,B*.028,-.15,0,TL_TAU);c.fill();c.beginPath();c.moveTo(-B*.03,-B*.03);c.lineTo(-B*.085,-B*.005+Math.sin(t*3*a)*B*.006);c.lineTo(-B*.075,-B*.022);c.closePath();c.fill();
  c.fillStyle=ogShade(bc,.18);c.beginPath();c.ellipse(-B*.008,-B*.04,B*.026,B*.014,-.3,0,TL_TAU);c.fill();c.fillStyle=bc;
  c.save();c.translate(B*.03,-B*.06);c.rotate(tilt);c.beginPath();c.arc(0,0,B*.02,0,TL_TAU);c.fill();c.fillStyle='#ffb21f';c.beginPath();c.moveTo(B*.016,-B*.004);c.lineTo(B*.042,B*.001+beat*a*B*.004);c.lineTo(B*.016,B*.007);c.fill();c.restore();
  c.strokeStyle='#d9a23a';c.lineWidth=B*.004;c.beginPath();c.moveTo(-B*.005,-B*.01);c.lineTo(-B*.008,B*.002);c.moveTo(B*.008,-B*.01);c.lineTo(B*.006,B*.002);c.stroke();c.restore();
  const p=a*beat;if(p>.05){c.save();c.strokeStyle=ink?`rgba(120,80,20,${p.toFixed(3)})`:`rgba(255,250,220,${p.toFixed(3)})`;c.lineWidth=B*.004;c.lineCap='round';for(let j=1;j<4;j++){c.beginPath();c.arc(bx+B*.075,by-B*.065,B*.016*j,-.9,.2);c.stroke();}c.restore();}}},
 summit:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),M=OG_MOUNT[m],sky=OG_SKIES[m];ogSky(c,x,y,w,h,sky,701,k);ogSun(c,x,y,w,h,m,k);
  // the far range, then the peak: a light face, a shaded face, its snow and a few rocks
  ogPaper(c,[[X(-.1),Y(.75)],[X(.12),Y(.42)],[X(.24),Y(.52)],[X(.36),Y(.4)],[X(.5),Y(.6)],[X(.7),Y(.38)],[X(.86),Y(.5)],[X(1.1),Y(.36)],[X(1.1),Y(.8)]],ogMix(M[0],sky[1],.45),702,{soft:1,k,dir:'d'});
  const rock=m==='vespre'?['#6a5a7a','#3e3352','#8a7a98']:m==='tarda'?['#b08a8a','#7a5a6a','#d0aaa0']:['#a8a0b8','#6a6288','#c8c0d8'],P=[X(.5),Y(.2)];
  ogPaper(c,[[X(-.05),Y(1.05)],[X(.18),Y(.62)],[X(.3),Y(.5)],P,[X(.56),Y(.42)],[X(.5),Y(.7)],[X(.42),Y(1.05)]],rock[0],703,{soft:1,k,dir:'d',accent:rock[2]});
  ogPaper(c,[P,[X(.66),Y(.38)],[X(.8),Y(.56)],[X(1.05),Y(.74)],[X(1.05),Y(1.05)],[X(.42),Y(1.05)],[X(.5),Y(.7)],[X(.56),Y(.42)]],rock[1],704,{soft:1,k,dir:'d'});
  ogPaper(c,[[X(.4),Y(.33)],P,[X(.6),Y(.33)],[X(.57),Y(.36)],[X(.54),Y(.32)],[X(.5),Y(.38)],[X(.47),Y(.33)],[X(.43),Y(.37)]],'#fbfdff',705,{k,rough:1.6,dir:'d'});
  for(const [u,v,s] of [[.28,.58,.04],[.68,.5,.035],[.16,.74,.05],[.82,.66,.04]])ogPaper(c,ogBlob(X(u),Y(v),S*s,S*s*.4,706+u*10,.3,18),'#fbfdff',707+u*10,{k,rough:1.5});
  ogPaper(c,ogBand(x,w,Y(.88),Y(1.05),h*.02,720,1,5),m==='vespre'?'#4a5a3a':'#7a9a4a',721,{soft:1,k,dir:'v'});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),gust=a*(.6+.4*Math.sin(t*.7));
  for(let i=0;i<3;i++){const cx=x+((ogHash(i,51)*w*1.4+t*S*.09*a*(1+i*.3))%(w*1.4))-w*.2;ogCloud(c,cx,Y(.12+i*.1),S*(.065+i*.018),'#fbf8f0',730+i,{k,rough:2});}
  // the cairn on the top and its pennant, flapping in the wind
  const cx=X(.5),cy=Y(.21);[[0,.012,.03],[.004,.042,.023],[-.003,.066,.016]].forEach(([dx,dy,s],i)=>ogPaper(c,ogBlob(cx+S*dx,cy-S*dy,S*s,S*s*.6,740+i,.25,14),['#8a7f88','#a89ea6','#7a6e78'][i],741+i,{k,rough:.6,shadow:.7}));
  const px=cx+S*.006,py=cy-S*.07,fw=S*.13;c.strokeStyle='#5a3a2a';c.lineWidth=S*.005;c.beginPath();c.moveTo(px,py);c.lineTo(px,py-S*.13);c.stroke();
  const fl=[];for(let i=0;i<=12;i++){const u=i/12;fl.push([px+u*fw,py-S*.13+u*S*.02+Math.sin(u*5-t*9*a)*S*.012*u*(.4+gust)]);}for(let i=12;i>=0;i--){const u=i/12;fl.push([px+u*fw,py-S*.13+S*.055-u*S*.03+Math.sin(u*5-t*9*a)*S*.012*u*(.4+gust)]);}
  ogPaper(c,fl,'#e8483a',750,{k,rough:.4,dir:'h',shadow:.6});
  // ribbons of wind: long pale strips that sweep across the mountain; leaves fly by; the grass bends
  for(let i=0;i<6;i++){const ph=(t*.32*a+ogHash(i,61))%1,yy=Y(.16+ogHash(i,62)*.6),len=w*(.35+ogHash(i,63)*.25),x0=x-len+ph*(w+len*1.6);const alpha=a>0?Math.sin(ph*OG_PI)*.9:.55;c.save();c.globalAlpha=alpha;c.strokeStyle=ink?'#6a7ab0':'#ffffff';c.lineCap='round';c.lineWidth=S*(.007+ogHash(i,64)*.007);c.beginPath();
   for(let j=0;j<=18;j++){const u=j/18,px2=x0+u*len,py2=yy+Math.sin(u*6+i+t*2*a)*S*.022;j?c.lineTo(px2,py2):c.moveTo(px2,py2);}c.stroke();c.restore();}
  for(let i=0;i<10;i++){const ph=(t*(.25+ogHash(i,71)*.2)*a+ogHash(i,72))%1,lx=x+ph*w*1.2-w*.1,ly=Y(.3+ogHash(i,73)*.6)+Math.sin(ph*12+i)*S*.03;c.save();c.translate(lx,ly);c.rotate(ph*14*a+i);ogPaper(c,ogEll(0,0,S*.014,S*.007,10),['#e8a23a','#d8602a','#c8b04a'][i%3],760+i,{k,rough:.3,shadow:.5,tex:false});c.restore();}
  const gn=Math.round(w/(S*.025));for(let i=0;i<gn;i++){const gx=x+(i+.5)*w/gn,gy=Y(1.01),hh=S*(.06+ogHash(i,81)*.06),bend=S*.04*gust+Math.sin(t*3*a+i)*S*.006*a;c.fillStyle=ink?'#3f6a2a':i%2?'#5a8a3a':'#6a9a42';c.beginPath();c.moveTo(gx-S*.007,gy);c.quadraticCurveTo(gx+bend*.4,gy-hh*.6,gx+bend,gy-hh);c.quadraticCurveTo(gx+bend*.4+S*.004,gy-hh*.6,gx+S*.007,gy);c.fill();}}},
 sea:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),W={mati:['#3fc0d8','#1f8fc0','#145a9a'],tarda:['#4ad0c0','#1fa0a8','#147080'],vespre:['#3a7ac8','#26509a','#182f6a']}[m];
  ogPaper(c,[[x-20,y-20],[x+w+20,y-20],[x+w+20,y+h+20],[x-20,y+h+20]],W[0],801,{rim:false,shadow:0,k,dir:'h',accent:'#9ff0f0'});ogPaper(c,ogBand(x,w,Y(.3),Y(1.05),h*.04,802,1,3),W[1],803,{rim:false,shadow:0,k,dir:'h'});ogPaper(c,ogBand(x,w,Y(.58),Y(1.05),h*.04,804,2,3),W[2],805,{rim:false,shadow:0,k,dir:'h'});
  c.save();for(let i=0;i<4;i++){const rx=X(.15+i*.24);c.fillStyle='rgba(230,255,250,.12)';c.beginPath();c.moveTo(rx-S*.03,y);c.lineTo(rx+S*.04,y);c.lineTo(rx+S*.16,y+h*.8);c.lineTo(rx+S*.02,y+h*.8);c.closePath();c.fill();}c.restore();
  ogPaper(c,ogBand(x,w,Y(.84),Y(1.05),h*.03,806,0,4),m==='vespre'?'#b89a7a':'#e8cf96',807,{soft:1,k,dir:'d'});
  for(const [u,s,col] of [[.12,.09,'#6a6a8a'],[.84,.11,'#5a5a7a'],[.66,.05,'#7a7a9a']])ogPaper(c,ogBlob(X(u),Y(.88),S*s,S*s*.6,808+u*10),col,809+u*10,{soft:1,k,dir:'d'});
  for(const [u,col] of [[.28,'#ff7a6a'],[.74,'#ffb03a']]){const bx=X(u),by=Y(.88);for(let j=0;j<5;j++){const an=-OG_PI/2+(j-2)*.42;ogPaper(c,[[bx-S*.008,by],[bx+S*.008,by],[bx+Math.cos(an)*S*.12+S*.008,by+Math.sin(an)*S*.12],[bx+Math.cos(an)*S*.12-S*.008,by+Math.sin(an)*S*.12]],col,820+j+u*10,{k,rough:1.5,dir:'v',shadow:.6});}}
  ogPaper(c,ogStar(X(.5),Y(.92),S*.035,.3),'#ff8a3a',830,{k,rough:.6});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h);
  for(const [u,n] of [[.06,3],[.4,2],[.94,3]])for(let j=0;j<n;j++){const bx=X(u+(j-1)*.03),pts=[],hh=h*(.3+ogHash(j,u*10)*.2);for(let i=0;i<=14;i++){const v=i/14;pts.push([bx+Math.sin(v*4+t*1.4*a+j)*S*.02*v-S*.008,Y(.92)-v*hh]);}for(let i=14;i>=0;i--){const v=i/14;pts.push([bx+Math.sin(v*4+t*1.4*a+j)*S*.02*v+S*.008,Y(.92)-v*hh]);}ogPaper(c,pts,['#3f9a4a','#5ab05a','#2f7a3a'][j%3],840+j+u*10,{k,rough:.8,dir:'v',shadow:.6});}
  for(let i=0;i<2;i++){const ph=(t*.05*a+i*.5)%1,fx=x+(i?1-ph:ph)*w*1.2-w*.1,fy=Y(.4+i*.18)+Math.sin(t*2*a+i)*S*.01,dir=i?-1:1;c.save();c.translate(fx,fy);c.scale(dir,1);ogPaper(c,[[S*.04,0],[S*.01,-S*.018],[-S*.02,-S*.012],[-S*.03,-S*.022],[-S*.03,S*.022],[-S*.02,S*.012],[S*.01,S*.018]],i?'#ffcf3a':'#ff7a5a',850+i,{k,rough:.5,dir:'h',shadow:.5});c.restore();}
  // the bubbles rise in three columns, wobbling, and grow a little as they rise
  for(let i=0;i<28;i++){const col=[.22,.5,.8][i%3],ph=(ogHash(i,91)+t*(.14+ogHash(i,92)*.06)*a)%1,bx=X(col+(ogHash(i,93)-.5)*.08)+Math.sin(ph*14+i)*S*.012,by=Y(.86-ph*.84),R=S*(.008+ogHash(i,94)*.018)*(.7+ph*.6);
   c.save();c.globalAlpha=Math.min(1,(1-ph)*4)*.95;c.fillStyle=ink?'rgba(40,100,170,.25)':'rgba(220,250,255,.28)';c.strokeStyle=ink?'#2f6aa8':'#e8fbff';c.lineWidth=Math.max(1,R*.18);c.beginPath();c.arc(bx,by,R,0,TL_TAU);c.fill();c.stroke();c.fillStyle=ink?'#2f6aa8':'#ffffff';c.beginPath();c.arc(bx-R*.35,by-R*.35,R*.25,0,TL_TAU);c.fill();c.restore();}}},
 cave:{still(c,x,y,w,h,m,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),out=OG_SKIES[m],L=OG_LAND[m],rock=m==='vespre'?['#241c30','#3a2e4a','#5e4e74']:m==='tarda'?['#2e201c','#4a3428','#74563e']:['#22222e','#3a3c52','#5c5e7a'];
  // the walls of the cave, and a wide mouth with a paler rim of rock, through which the light of outside comes in
  ogPaper(c,[[x-30,y-30],[x+w+30,y-30],[x+w+30,y+h+30],[x-30,y+h+30]],rock[1],901,{rim:false,shadow:0,k,dir:'d',accent:rock[2]});
  const hole=ogBlob(X(.5),Y(.5),w*.36,h*.34,902,.14,44);ogPaper(c,ogBlob(X(.5),Y(.5),w*.395,h*.38,902,.14,44),rock[2],903,{soft:1,k,dir:'d',rough:4,rim:false});
  c.save();ogPath(c,ogTorn(hole,4,904));c.clip();ogSky(c,x,y,w,h,out,905,k);ogSun(c,x,y,w,h,m,k);ogPaper(c,ogBand(x,w,Y(.5),Y(1.05),h*.05,906,1,3),ogMix(L[1],out[1],.3),907,{rim:false,shadow:0,k,dir:'h'});ogPaper(c,ogBand(x,w,Y(.6),Y(1.05),h*.03,908,2,3),L[0],909,{rim:false,shadow:0,k,dir:'h'});
  for(let i=0;i<4;i++)ogTree(c,X(.3+i*.13),Y(.6+(i%2)*.02),S*.08,ogShade(L[2],-.1),910+i,k);c.restore();
  // stalactites against the light (their roots hidden under the ceiling), stalagmites on the floor, and the pool in front, with the light
  // of the mouth on it
  const rim=ogMix(rock[2],out[1],.25);
  for(const [u,v,l,bw] of OG_CAVE_SMALL)ogPaper(c,ogDrip(X,Y,u,v,l,bw,1,u*97),ogMix(rock[0],rock[1],.5),950+u*90,{soft:1,k,rough:.8,dir:'v',rimCol:rim,accent:rock[2]});
  OG_CAVE_TIPS.forEach(([u,v,l,bw],i)=>ogPaper(c,ogDrip(X,Y,u,v,l,bw,1,i*13+3),i%2?rock[1]:ogMix(rock[0],rock[1],.4),920+i,{soft:1,k,rough:.9,dir:'v',rimCol:rim,accent:rock[2]}));
  ogPaper(c,[[x-30,y-30],[x+w+30,y-30],...ogBand(x,w,Y(.17),Y(.17),h*.04,915,0,5).slice(0,29).reverse().map(([px,py])=>[px,py])],rock[0],916,{soft:1,k,dir:'h',rough:4});
  ogPaper(c,ogBand(x,w,Y(.72),Y(1.08),h*.035,917,2,4),rock[0],918,{soft:1,k,dir:'h',rough:4,accent:rock[1]});
  for(const [u,l,s] of [[.07,.22,.06],[.15,.12,.035],[.21,.07,.025],[.8,.09,.03],[.86,.16,.045],[.95,.26,.06]])ogPaper(c,ogDrip(X,Y,u,1.06,-(l+.06),s,-1,u*71),rock[1],930+u*10,{soft:1,k,rough:.9,dir:'v',rimCol:rim,accent:rock[2]});
  ogPaper(c,ogEll(X(.5),Y(.88),w*.32,h*.065,44),m==='vespre'?'#1c3450':'#1c4a58',940,{soft:1,k,rough:3,dir:'h'});ogPaper(c,ogEll(X(.5),Y(.87),w*.17,h*.022,30),ogMix(out[0],'#ffffff',.35),941,{rim:false,shadow:0,k,rough:2,dir:'h'});},
  live(c,x,y,w,h,m,t,a,ink,beat,k){const X=u=>x+w*u,Y=v=>y+h*v,S=Math.min(w,h),pool=Y(.875),dc=ink?'#9fd0f0':'#d8f6ff',edge=ink?'#1f4f7a':'#24507a';
  // the drops: each one grows at the tip of a stalactite, falls and opens a ring on the pool; at rest, one waits at each tip
  OG_CAVE_TIPS.forEach(([u,v,l],i)=>{const period=2.1+i*.31,ph=a>0?((t+i*.53*period)%period)/period:.3,grow=.45,tx=X(u+(ogHash(1,i*13+3)-.5)*OG_CAVE_TIPS[i][3]*.5),ty=Y(v+l+.008);
   const drop=(dx,dy,rx,ry)=>{c.fillStyle=dc;c.strokeStyle=edge;c.lineWidth=Math.max(1.2,S*.003);c.beginPath();c.moveTo(dx,dy-ry*1.4);c.quadraticCurveTo(dx+rx*1.1,dy,dx,dy+ry);c.quadraticCurveTo(dx-rx*1.1,dy,dx,dy-ry*1.4);c.fill();c.stroke();};
   if(ph<grow){const R=S*.011*(.45+ph/grow*.55);drop(tx,ty+R,R*.8,R);}
   else{const f=(ph-grow)/(1-grow),fall=f*f*2.4;if(fall<1)drop(tx,ty+(pool-ty)*fall,S*.009,S*.014);else{const p=(f-Math.sqrt(1/2.4))/(1-Math.sqrt(1/2.4));for(let j=0;j<2;j++){const q=Math.max(0,p-j*.25);ogRing(c,tx,pool,S*.07*q,S*.014*q,ink?'#2f6aa8':'#bfefff',S*.0035,(1-q)*.9);}}}});
  for(let i=0;i<5;i++){const p=a*(.5+.5*Math.sin(t*1.3+i*2));c.fillStyle=ink?`rgba(47,106,168,${(.5*p).toFixed(3)})`:`rgba(220,250,255,${(.6*p).toFixed(3)})`;c.beginPath();c.ellipse(X(.3+i*.1),pool+S*.012*(i%2),S*.022,S*.003,0,0,TL_TAU);c.fill();}}}};
// The stalactites of the cave: where (u), how low their root (v), how long (l) and how wide (bw); the six that drip and some small ones
// between them that do not.
const OG_CAVE_TIPS=[[.2,.2,.16,.035],[.31,.18,.22,.03],[.43,.21,.12,.025],[.55,.17,.2,.035],[.66,.21,.14,.025],[.78,.19,.17,.03]];
const OG_CAVE_SMALL=[[.15,.18,.09,.02],[.255,.19,.1,.018],[.37,.18,.08,.016],[.49,.19,.12,.02],[.6,.18,.08,.016],[.72,.19,.1,.018],[.84,.18,.09,.02]];
// The outline of a stalactite (dir 1, hanging from v) or of a stalagmite (dir -1, rising from v): a body that narrows slowly, with the
// ripples of the stone along its sides and a round tip, a little bent.
function ogDrip(X,Y,u,v,l,bw,dir,seed){const L=[],R=[],n=14,bend=(ogHash(1,seed)-.5)*bw*.5;
 for(let i=0;i<=n;i++){const t=i/n,wd=bw*Math.pow(1-t*.94,1.25)*(1+.13*Math.sin(t*11+seed)),cx=u+bend*t*t,yy=v+(dir>0?-.08*(1-t):0)+l*t*(dir>0?1:1);
  L.push([X(cx-wd*(1+.08*Math.sin(t*7+seed*.3))),Y(yy)]);R.push([X(cx+wd*(1+.08*Math.cos(t*9+seed*.7))),Y(yy+.004*Math.sin(t*5+seed))]);}
 const tip=[X(u+bend),Y(v+l+(dir>0?.008:-.008))];return [...L,tip,...R.reverse()];}
// «Escena senzilla» (plainScene): the papers keep their colours and edges but lose the brush strokes.
let OG_FLAT=false;
// A landscape in its box: what is quiet, what sounds, or both.
export function ogLandscape(c,x,y,w,h,id,m,{t=0,a=0,ink=false,beat=0,part='both',plain=false}={}){const art=OG_PLACE_ART[id]||OG_PLACE_ART.brook,k=Math.max(.35,Math.min(w,h)/600),flat=OG_FLAT;OG_FLAT=plain;
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();if(part!=='live')art.still(c,x,y,w,h,m,k);if(part!=='still')art.live(c,x,y,w,h,m,t,a,ink,beat,k);c.restore();OG_FLAT=flat;}
// ── The board ──
// The wall: deep indigo paper with a few darker torn sheets, calm so that the landscapes stand out (the decor of the board).
function ogWall(c,w,h,d){const H=h;if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,H);return;}const k=Math.max(.5,Math.min(w,H)/700);
 ogPaper(c,[[-20,-20],[w+20,-20],[w+20,H+20],[-20,H+20]],'#2b2d63',2001,{rim:false,shadow:0,dir:'d',accent:'#3a3f86',k});
 ogPaper(c,ogBand(0,w,H*.7,H+20,H*.05,2002,1,3),'#25285a',2003,{rim:false,shadow:0,dir:'h',k,rough:6});ogPaper(c,ogBlob(w*.12,H*.18,w*.2,H*.16,2004,.25),'#31346e',2005,{rim:false,shadow:0,dir:'d',k,rough:6});ogPaper(c,ogBlob(w*.9,H*.42,w*.18,H*.2,2006,.25),'#272a5e',2007,{rim:false,shadow:0,dir:'d',k,rough:6});
 escVeil(c,d,0,0,w,H);}
// The frame of a landscape: a sheet of pale paper with torn edges, a little larger than the zone, and two strips of tape.
const ogInner=z=>{const b=Math.max(6,Math.min(z.w,z.h)*.035);return {x:z.x+b,y:z.y+b,w:z.w-2*b,h:z.h-2*b,b};};
function ogPanel(c,z,id,m,i,{t=0,a=0,beat=0,part='both',plain=false,tape=true}={}){const k=Math.max(.5,Math.min(z.w,z.h)/500),q=ogInner(z);
 if(part!=='live')ogPaper(c,[[z.x-3,z.y-3],[z.x+z.w+3,z.y-3],[z.x+z.w+3,z.y+z.h+3],[z.x-3,z.y+z.h+3]],'#fbf5e6',3001+i*7,{soft:1,k,rough:2.4,rim:false,dir:'h',texAlpha:.35});
 ogLandscape(c,q.x,q.y,q.w,q.h,id,m,{t,a,beat,part,plain});
 if(tape&&part!=='live')for(const [tx,ty,rot] of [[z.x+z.w*.12,z.y+2,-.5],[z.x+z.w*.88,z.y+2,.5]]){c.save();c.translate(tx,ty);c.rotate(rot);c.globalAlpha=.82;ogPaper(c,[[-z.w*.07,-k*9],[z.w*.07,-k*9],[z.w*.07,k*9],[-z.w*.07,k*9]],['#f7c24a','#7ac8c0','#f08aa8','#b8a0f0'][i%4],3050+i,{k,rough:1,rim:false,shadow:.4,dir:'v'});c.restore();}}
// The badge of the model: a round sheet of paper at the top with rings of sound that grow while the model plays. With the visual clue
// («Pista visual»), the landscape of the model shows inside it.
function ogBadge(c,w,top,round,hint,playing,t,still,d,m){const R=Math.max(22,Math.min(50,(top-10)/2.1)),cx=w/2,cy=Math.max(R+6,top-10-R),k=R/50;
 for(let j=0;j<3;j++){const p=playing>0&&!still?((t*.9+j/3)%1):(j+1)/4,alpha=(playing>0?.9*playing:.35)*(1-p*.8);c.save();c.globalAlpha=alpha;c.strokeStyle=d.white&&!d.full?'#3a3f86':'#ffe9b0';c.lineWidth=Math.max(2,R*.08);c.lineCap='round';
  for(const side of [-1,1]){c.beginPath();c.arc(cx,cy,R*(1.2+p*.9),side<0?OG_PI-.6:-.6,side<0?OG_PI+.6:.6);c.stroke();}c.restore();}
 ogPaper(c,ogEll(cx,cy,R,R,40),'#fbf5e6',4001,{soft:1,k,rough:2,dir:'h',texAlpha:.35});
 c.save();c.beginPath();c.arc(cx,cy,R*.84,0,TL_TAU);c.clip();
 if(hint){const id=ogTarget(round).id;ogLandscape(c,cx-R*1.3,cy-R*.95,R*2.6,R*1.9,id,m,{t,a:playing>0&&!still?1:0});}
 else{c.fillStyle='#2b2d63';c.fillRect(cx-R,cy-R,R*2,R*2);c.strokeStyle='#ffe9b0';c.lineCap='round';c.lineWidth=R*.1;for(let j=1;j<4;j++){const amp=playing>0&&!still?.5+.5*Math.sin(t*6-j):1;c.globalAlpha=.4+.6*amp;c.beginPath();c.arc(cx-R*.3,cy,R*.2*j,-.8,.8);c.stroke();}c.globalAlpha=1;c.fillStyle='#ffe9b0';c.beginPath();c.arc(cx-R*.3,cy,R*.1,0,TL_TAU);c.fill();}
 c.restore();return {x:cx,y:cy,r:R};}
// The paper leaf, the guide of the board: it flies to the landscape in focus and rests on its corner.
const OG_LEAVES=[['#f07a2a','#b84a14'],['#e8483a','#9a2418'],['#f2b830','#b07a10'],['#7cb342','#3f7a1a']];
function ogLeaf(c,x,y,s,rot,leaf,seed=901){const [col,vein]=OG_LEAVES[leaf%4];c.save();c.translate(x,y);c.rotate(rot);const pts=[];for(let i=0;i<=20;i++){const u=i/20;pts.push([-s+2*s*u,-Math.sin(OG_PI*u)*s*.46]);}for(let i=19;i>0;i--){const u=i/20;pts.push([-s+2*s*u,Math.sin(OG_PI*u)*s*.46]);}
 ogPaper(c,pts,col,seed,{rough:.8,k:s/30,dir:'d'});c.strokeStyle=vein;c.lineWidth=Math.max(1,s*.06);c.lineCap='round';c.beginPath();c.moveTo(-s*1.25,s*.08);c.lineTo(s*.9,0);for(let j=1;j<4;j++){const px=-s+j*s*.45;c.moveTo(px,0);c.lineTo(px+s*.22,-s*.26);c.moveTo(px,0);c.lineTo(px+s*.22,s*.26);}c.stroke();c.restore();}
const ogDecor=(s,view)=>view?.decor||escDecor({background:s.background,base:s.base,opacity:s.opacity});
const ogKey=d=>escDecorKey(d)+(d.fade>0?'':'|none'+d.base);
export function ogBoard(c,w,h,state,game,s,view){const r=state.round||0,R=ogRound(r,view.options.length),m=R.moment,plain=!!s.plainScene,still=!!s.reduced,ids=view.options.map(o=>o.value),zones=view.zones,t=still?0:view.clock||0,d=ogDecor(s,view),dk=ogKey(d),H=h-TL_STRIP;
 const paint=(x,part)=>{ogWall(x,w,h,d);zones.forEach((z,i)=>ogPanel(x,z,ids[i],m,i,{part,plain}));};
 tlSheet(c,['og',w,h,m,plain,ids.join()].join('|')+dk,x=>paint(x,'both'));
 const sounding=view.sounding??-1;
 if(sounding>=0&&zones[sounding]&&!still){const z=zones[sounding],q=ogInner(z);c.save();c.beginPath();c.rect(q.x,q.y,q.w,q.h);c.clip();tlSheet(c,['og-still',w,h,m,plain,ids.join()].join('|')+dk,x=>paint(x,'still'));c.restore();
  ogLandscape(c,q.x,q.y,q.w,q.h,ids[sounding],m,{t,a:Math.max(.25,view.soundLevel||0),part:'live',plain,beat:0});}
 tlVeil(c,w,H,zones,view.lights,.35*(view.wait??(view.waiting?1:0)));
 const f=view.focus;if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);
 const top=zones.length?Math.min(...zones.map(z=>z.y)):H*.17,badge=ogBadge(c,w,top,r,!!state.hint,view.cue||0,t,still,d,m);
 // the leaf goes where the light is: the corner of the landscape in focus, or next to the badge
 let sx=0,sy=0,sw=0;zones.forEach((z,i)=>{const kk=Math.max(0,((view.lights[i]??TL_DIM)-TL_DIM)/(1-TL_DIM));sx+=kk*(z.x+z.w-z.w*.1);sy+=kk*(z.y+z.h*.1);sw+=kk;});
 const s0=Math.max(16,Math.min(34,(zones[0]?.w||200)*.07)),lx=sw>.01?sx/sw:badge.x+badge.r*2.2,ly=sw>.01?sy/sw:badge.y,fl=still?0:Math.sin(t*2.2)*.12;ogLeaf(c,lx,ly+(still?0:Math.sin(t*1.6)*s0*.12),s0,-.55+fl,R.leaf);}
// The result. The right landscape opens to the whole stage and comes alive with its sound and its little piece; the leaf flies into it and
// lands. Another one: the board stays, the chosen landscape sounds and moves for a moment, with no sign of a mistake, and the model then
// plays again.
const OG_LAND_AT={brook:[.5,.86],beach:[.4,.8],rain:[.53,.9],night:[.36,.74],pond:[.62,.66],garden:[.42,.29],summit:[.5,.88],sea:[.5,.9],cave:[.45,.85]};
export function ogResult(c,w,h,state,game,s,view,T){const zones=view.zones,i=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[i],id=view.picked||view.options[i]?.value||'brook',r=state.round||0,R=ogRound(r,view.options.length),still=!!s.reduced;
 if(!view.correct){const p=Math.max(0,1-T/OG_WRONG);ogBoard(c,w,h,state,game,s,{...view,focus:-1,progress:null,lights:zones.map((_,k)=>k===i?1:TL_DIM),sounding:i,soundLevel:.5+.5*p,clock:view.clock});return;}
 const scene=()=>ogScene(c,w,h,id,R.moment,still?Math.min(T,2):T,r,s,ogDecor(s,view),R.leaf,z);
 if(T<1&&z){ogBoard(c,w,h,state,game,s,{...view,focus:-1,progress:null,lights:zones.map((_,k)=>k===i?1:TL_DIM)});const box=tlOpenBox(ogInner(z),w,h,T);c.save();tlClipOpen(c,{kind:'panel',radius:4},box);scene();c.restore();return;}
 scene();}
function ogScene(c,w,h,id,m,T,round,s,d,leaf,z){const plain=!!s.plainScene,ink=d.white&&!d.full;
 tlSheet(c,['og-res',w,h,id,m,plain].join('|')+ogKey(d),x=>{if(d.fade<=0){x.fillStyle=d.base;x.fillRect(0,0,w,h);return;}ogLandscape(x,0,0,w,h,id,m,{part:'still',plain});escVeil(x,d,0,0,w,h);});
 const beats=ogBeats(id,round);let beat=0;for(const b of beats){const dd=T-b;if(dd>=0&&dd<.45)beat=Math.max(beat,1-dd/.45);}
 ogLandscape(c,0,0,w,h,id,m,{t:T,a:ogEase(T/.8),ink,beat,part:'live',plain});
 // the leaf: from the corner of the landscape that was chosen, it floats down into it and settles
 const S=Math.min(w,h),s0=Math.max(18,S*.045),[ux,uy]=OG_LAND_AT[id]||[.5,.85],from=z?[w*.5+(z.x+z.w*.9-w*.5)*.3,h*.12]:[w*.8,h*.1],u=ogEase((T-.8)/3.2),fx=from[0]+(w*ux-from[0])*u+Math.sin(u*OG_PI*3)*S*.06*(1-u),fy=from[1]+(h*uy-from[1])*u;
 ogLeaf(c,fx,fy,s0,-.4+Math.sin(T*2.4)*.35*(1-u)+u*.2,leaf);}

// Vitralls (CE22): twenty stained-glass windows, in the order of the plan. As in Caleidoscopi, every frame is drawn from the time
// alone: each window is built from cached geometry, and light, reveal and movement are smooth functions of time.
// Each entry gives its step grid and the steps of its visual events; vitrall.js turns them into seconds for the drawing and the music.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,KeaseBack,Krand,Kmix,Krgba,Kramp,Kloop,Kbump} from './kaleido-base.js';
import {Gpoly,Gcircle,Gmove,Gscale,Grot,Gcentroid,Gsector,Gpetal,Garch,Gintersect,Gvoronoi,Gband,glassWindow,Gon,Gshade} from './glass.js';

const VCACHE=new Map();
const Vcache=(key,make)=>{let v=VCACHE.get(key);if(!v){v=make();VCACHE.set(key,v);}return v;};
// Jewel colours of the series: vivid, light and cheerful, with pale glass for skies and backgrounds.
const VJ={ruby:'#e8203a',scarlet:'#ff4d2e',orange:'#ff8a1a',amber:'#ffb21c',gold:'#ffd83a',lemon:'#fff06a',lime:'#a6e22e',emerald:'#16c172',teal:'#10b5a8',
 turq:'#22d3ee',sky:'#4cc3ff',cobalt:'#2d5bff',ultra:'#3a36d9',violet:'#8b3dff',purple:'#b03ad8',magenta:'#ff3fa4',rose:'#ff7eb3',opal:'#f3efe6',aqua:'#bff3ee',cream:'#ffe2a6',mint:'#c9f7d2',blush:'#ffd0e2',ice:'#cfe6ff'};
const V_RAINBOW=[VJ.ruby,VJ.orange,VJ.gold,VJ.lime,VJ.emerald,VJ.turq,VJ.cobalt,VJ.violet,VJ.magenta];
// Window size: half width and half height in window units; the radius in pixels keeps the whole window on screen.
function Vview(w,h,ph,o,accent,hw=1,hh=1,extra={}){const R=Math.min(w*.47/hw,h*.47/hh)*ph.grow,P=o.reduced?11:5.5,x=ph.clock/P+.37;
 return {cx:w/2,cy:h/2,R,lit:o.lit,lead:.013,glow:{color:accent,a:.14,r:1.45*Math.max(hw,hh)},sweep:{angle:-.6,pos:-1.9+3.8*(x-Math.floor(x)),a:.12,width:.32},...extra};}
// Colour cross-fade round the colour wheel (hue, saturation and lightness), so that a change from blue to gold passes
// through green and never through grey.
function Vhsl(hex){const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,d=mx-mn;if(d===0)return [0,0,l];
 const s=d/(1-Math.abs(2*l-1)),h=mx===r?((g-b)/d+6)%6:mx===g?(b-r)/d+2:(r-g)/d+4;return [h*60,s,l];}
function Vhex([h,s,l]){const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,k=Math.floor(((h%360)+360)%360/60),[r,g,b]=[[c,x,0],[x,c,0],[0,c,x],[0,x,c],[x,0,c],[c,0,x]][k];
 return '#'+[r,g,b].map(v=>Math.round(Kclamp(v+m)*255).toString(16).padStart(2,'0')).join('');}
function Vblend(a,b,x){if(x<=0)return a;if(x>=1)return b;const A=Vhsl(a),B=Vhsl(b);if(A[1]<.08||B[1]<.08)return Kmix(a,b,x);let dh=B[0]-A[0];if(dh>180)dh-=360;if(dh<-180)dh+=360;return Vhex([A[0]+dh*x,A[1]+(B[1]-A[1])*x,A[2]+(B[2]-A[2])*x]);}
// Staggered reveal of n panes from the moment t0 over spread seconds.
const Vr=(t,t0,i,n,spread=.5,len=.45)=>Gon(t,t0+spread*i/Math.max(1,n),len);
// Light chasing around the window: a soft bump in angle.
function Vchase(a,at,width=.5){let d=((a-at)%K_TAU+K_TAU)%K_TAU;if(d>Math.PI)d-=K_TAU;return Math.exp(-(d*d)/(width*width));}
// Gentle swell of light after each visual event (rises over a quarter of a second, fades over about a second).
const Vpulse=(t,hits,len=.9)=>hits.reduce((m,hh)=>Math.max(m,t>=hh?Math.exp(-(t-hh)/len)*Ksmooth((t-hh)/.25):0),0);
const Vspin=(ph,o,speed)=>ph.motion*speed;
const Vchaser=(ph,o,speed=.6)=>ph.clock*(o.reduced?speed*.4:speed);
const Vp=(pts,color,a,l,j,tex,v)=>({pts,color,a,l,j,tex,v});
// A ground of small deep-coloured pieces behind a round window, so that no gap between the figures stays empty.
function Vground(name,r,n,colors,t,t0,seed,ch=null){const cells=Vcache('ground'+name+seed%3,()=>{const sites=Array.from({length:n},(_,i)=>{const rr=r*Math.sqrt(Krand(i,seed%3+91)),a=K_TAU*Krand(i+400,seed%3+91);return [Math.cos(a)*rr,Math.sin(a)*rr];});return Gvoronoi(sites,Gcircle(0,0,r,48),1);});
 return {panes:cells.map((cell,i)=>{const [x,y]=cell.site;return Vp(cell.pts,colors[i%colors.length],Gon(t,t0+Math.hypot(x,y)*.5,.5),ch===null?0:.25*Vchase(Math.atan2(y,x),ch),Gshade(i+500,seed),'cathedral');}),lead:.009};}
const V_DEEP=['#1f35b8','#2a45d6','#3a2bb0','#1d55c8','#4a30c8'];

// 1 · Rosassa gòtica: a twelvefold rose window that lights up ring by ring; the rings turn slowly in opposite directions.
const ROSE_PAL=[[VJ.ruby,VJ.cobalt,VJ.gold,VJ.emerald,VJ.violet,VJ.sky,VJ.magenta],[VJ.cobalt,VJ.ruby,VJ.amber,VJ.turq,VJ.purple,VJ.lime,VJ.orange],[VJ.violet,VJ.gold,VJ.turq,VJ.ruby,VJ.cobalt,VJ.rose,VJ.emerald]];
function Vrose(c,w,h,ph,o){const pal=ROSE_PAL[o.seed%3],t=ph.t,H=o.hitT,ch=Vchaser(ph,o),pulse=.3*Vpulse(t,H);
 const g=Vcache('rose',()=>({center:[Gcircle(0,0,.065,24),...Array.from({length:6},(_,i)=>Gpetal(.075,.18,i*K_TAU/6,.055,.9))],petals:Array.from({length:12},(_,i)=>Gpetal(.2,.53,i*K_TAU/12,.105,.85)),
  dots:Array.from({length:12},(_,i)=>{const a=(i+.5)*K_TAU/12;return Gcircle(Math.cos(a)*.47,Math.sin(a)*.47,.05,18);}),band:Array.from({length:24},(_,i)=>Gsector(.56,.66,i*K_TAU/24,(i+1)*K_TAU/24,4)),
  rounds:Array.from({length:12},(_,i)=>{const a=i*K_TAU/12;return Gcircle(Math.cos(a)*.78,Math.sin(a)*.78,.095,24);}),tips:Array.from({length:12},(_,i)=>Gpetal(.68,.92,(i+.5)*K_TAU/12,.06,1.1)),
  rim:Array.from({length:36},(_,i)=>Gsector(.935,1,i*K_TAU/36,(i+1)*K_TAU/36,3))}));
 const ring=(list,hit,color,tex,rot,offset=0,spread=.55)=>({rot,tex,panes:list.map((pts,i)=>{const n=list.length,ang=(i+offset)*K_TAU/n+rot;return Vp(pts,color(i),Vr(t,H[hit],i,n,spread),Kclamp(.55*Vchase(ang,ch)+pulse),Gshade(i+hit*40,o.seed),tex);})});
 const s=d=>Vspin(ph,o,d);
 const layers=[Vground('rose',.935,70,V_DEEP,t,H[0],o.seed,ch),ring(g.center,0,i=>i?pal[2]:Kmix(pal[2],'#ffffff',.5),'opal',s(.03),0,.3),ring(g.petals,1,i=>i%2?pal[0]:pal[4],'cathedral',s(-.022)),ring(g.dots,2,()=>pal[2],'seedy',s(-.022),.5),
  ring(g.band,3,i=>i%2?pal[1]:pal[5],'opal',s(.026)),ring(g.rounds,4,()=>pal[3],'seedy',s(-.016)),ring(g.tips,5,()=>pal[6],'cathedral',s(-.016),.5),ring(g.rim,6,i=>[pal[1],pal[0],pal[2]][i%3],'cathedral',s(.01))];
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[2],1,1,{rays:{colors:[pal[0],pal[2],pal[1],pal[3],pal[4],pal[2]],a:.05+.04*pulse,turn:s(.02),width:.14}}));}

// 2 · Sol del Palau: a golden sun of glass among rings of blue drops (after the skylight of the Palau de la Música Catalana).
const SUN_PAL=[[VJ.gold,VJ.amber,VJ.orange,VJ.cobalt,VJ.violet,VJ.sky,VJ.rose],[VJ.lemon,VJ.gold,VJ.scarlet,VJ.ultra,VJ.turq,VJ.purple,VJ.lime],[VJ.amber,VJ.orange,VJ.magenta,VJ.teal,VJ.cobalt,VJ.sky,VJ.gold]];
function Vdrop(r0,r1,a,hw,n=12){const ux=Math.cos(a),uy=Math.sin(a),pts=[],wd=u=>hw*Math.pow(Math.sin(Math.PI*Math.pow(u,1.7)),.8);
 for(let i=0;i<=n;i++){const u=i/n,r=r0+(r1-r0)*u;pts.push([ux*r-uy*wd(u),uy*r+ux*wd(u)]);}for(let i=n-1;i>0;i--){const u=i/n,r=r0+(r1-r0)*u;pts.push([ux*r+uy*wd(u),uy*r-ux*wd(u)]);}return pts;}
function Vsun(c,w,h,ph,o){const pal=SUN_PAL[o.seed%3],t=ph.t,H=o.hitT,ch=Vchaser(ph,o,.5),s=d=>Vspin(ph,o,d);
 const g=Vcache('sun',()=>({core:Gcircle(0,0,.085,28),wedges:Array.from({length:16},(_,i)=>Gsector(.085,.3,i*K_TAU/16,(i+1)*K_TAU/16,5)),drops:Array.from({length:16},(_,i)=>Vdrop(.33,.64,(i+.5)*K_TAU/16,.095)),
  band:Array.from({length:32},(_,i)=>Gsector(.67,.77,i*K_TAU/32,(i+1)*K_TAU/32,3)),dots:Array.from({length:16},(_,i)=>{const a=i*K_TAU/16;return Gcircle(Math.cos(a)*.855,Math.sin(a)*.855,.055,18);}),rim:Array.from({length:32},(_,i)=>Gsector(.925,1,i*K_TAU/32,(i+1)*K_TAU/32,3))}));
 // Light pulses travel outwards from the core at every visual event.
 const wave=r=>H.reduce((m,hh)=>Math.max(m,t>=hh?Kbump((t-hh)*1.1,r,.18)*Math.exp(-(t-hh)*.6):0),0);
 const L=(list,hit,color,tex,rot,r,spread=.5)=>({rot,tex,panes:list.map((pts,i)=>Vp(pts,color(i),Vr(t,H[hit],i,list.length,spread),Kclamp(.6*wave(r)+.35*Vchase(i*K_TAU/list.length+rot,ch)),Gshade(i+hit*50,o.seed),tex))});
 const layers=[Vground('sun',.925,64,['#1a2f9e','#24249a','#14508f','#2c3fc0'],t,H[0],o.seed),L([g.core],0,()=>Kmix(pal[0],'#ffffff',.55),'opal',0,0),L(g.wedges,0,i=>i%2?pal[0]:pal[1],'cathedral',s(.015),.2,.4),L(g.drops,1,i=>i%2?pal[3]:pal[4],'cathedral',s(.03),.48),
  L(g.band,2,i=>i%2?pal[5]:pal[3],'opal',s(-.02),.72),L(g.dots,3,()=>pal[6],'seedy',s(-.03),.85),L(g.rim,4,i=>i%2?pal[2]:pal[1],'cathedral',s(.01),.96)];
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1,1,{glow:{color:pal[0],a:.2+.12*Vpulse(t,H),r:1.6},rays:{colors:Array.from({length:12},(_,i)=>i%2?pal[0]:pal[1]),a:.06,turn:s(.025),width:.11}}));}

// 3 · Mosaic de colors: a grid of irregular squares (after Gerhard Richter's window in Cologne); waves of new colour cross it diagonally.
const MOSAIC_SET=[VJ.ruby,VJ.scarlet,VJ.orange,VJ.amber,VJ.gold,VJ.lemon,VJ.lime,VJ.emerald,VJ.teal,VJ.turq,VJ.sky,VJ.cobalt,VJ.violet,VJ.purple,VJ.magenta,VJ.rose];
function Vmosaic(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed,N=8;
 const g=Vcache('mosaic'+seed%3,()=>{const cuts=k=>{const ws=Array.from({length:N},(_,i)=>.7+.6*Krand(i+k*17,seed%3+5)),tot=ws.reduce((a,b)=>a+b,0);let x=-.92;return [x,...ws.map(v=>x+=1.84*v/tot)];},xs=cuts(1),ys=cuts(2),cells=[];
  for(let j=0;j<N;j++)for(let i=0;i<N;i++)cells.push({pts:[[xs[i],ys[j]],[xs[i+1],ys[j]],[xs[i+1],ys[j+1]],[xs[i],ys[j+1]]],cx:(xs[i]+xs[i+1])/2,cy:(ys[j]+ys[j+1])/2,k:j*N+i});return cells;});
 const colorAt=(k,wave)=>MOSAIC_SET[Math.floor(Krand(k*7+wave*131,seed)*MOSAIC_SET.length)],spot=[.6*Math.sin(ph.clock*.31),.6*Math.cos(ph.clock*.23)];
 const panes=g.map(cell=>{let col=colorAt(cell.k,0);for(let k=1;k<H.length;k++){const d=(cell.cx+cell.cy+1.84)/3.68*.9,x=Ksmooth((t-H[k]-d)/.5);if(x<=0)break;col=Vblend(colorAt(cell.k,k-1),colorAt(cell.k,k),x);}
  const dist=Math.hypot(cell.cx,cell.cy);return Vp(cell.pts,col,Gon(t,H[0]+dist*.7,.4),.5*Math.exp(-((cell.cx-spot[0])**2+(cell.cy-spot[1])**2)/.18),Gshade(cell.k,seed),['cathedral','frost','seedy'][cell.k%3]);});
 glassWindow(c,w,h,o,[{panes,lead:.011}],Vview(w,h,ph,o,colorAt(27,0),1,1,{sweep:{angle:.4,pos:Vview(w,h,ph,o,'#fff').sweep.pos,a:.12,width:.3}}));}

// 4 · Composició: thick lead lines grow across the window and split it into fields of red, yellow and blue (after De Stijl).
const MONDRIAN=[[VJ.ruby,VJ.gold,VJ.cobalt,VJ.sky,VJ.orange,VJ.magenta,VJ.lemon,VJ.turq],[VJ.gold,VJ.cobalt,VJ.ruby,VJ.lime,VJ.turq,VJ.orange,VJ.rose,VJ.sky],[VJ.cobalt,VJ.ruby,VJ.gold,VJ.emerald,VJ.magenta,VJ.amber,VJ.sky,VJ.lemon]];
function Vmondrian(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed%3,cols=MONDRIAN[seed];
 const plan=Vcache('mondrian'+seed,()=>{const rects=[{x0:-1.15,y0:-.85,x1:1.15,y1:.85,c:VJ.cream}],splits=[];
  for(let k=1;k<8;k++){let best=0;rects.forEach((r,i)=>{if((r.x1-r.x0)*(r.y1-r.y0)>(rects[best].x1-rects[best].x0)*(rects[best].y1-rects[best].y0))best=i;});const r=rects[best],vertical=(r.x1-r.x0)>(r.y1-r.y0)*(Krand(k,seed+3)>.25?1:2),q=.36+.28*Krand(k,seed+7);
   const a={...r},b={...r};if(vertical){a.x1=b.x0=r.x0+(r.x1-r.x0)*q;}else{a.y1=b.y0=r.y0+(r.y1-r.y0)*q;}b.c=cols[k%cols.length];splits.push({k,index:best,vertical,a,b,parent:r});rects.splice(best,1,a,b);}return splits;});
 let rects=[{x0:-1.15,y0:-.85,x1:1.15,y1:.85,c:VJ.cream,born:-1}],growing=[];
 for(const sp of plan){const t0=H[sp.k];if(t0===undefined||t<t0)break;const grow=Ksmooth((t-t0)/.45);if(grow<1){growing.push({sp,grow});continue;}
  const i=rects.findIndex(r=>Math.abs(r.x0-sp.parent.x0)<1e-9&&Math.abs(r.y0-sp.parent.y0)<1e-9&&Math.abs(r.x1-sp.parent.x1)<1e-9&&Math.abs(r.y1-sp.parent.y1)<1e-9);if(i<0)continue;const old=rects[i];rects.splice(i,1,{...sp.a,c:old.c,born:old.born},{...sp.b,from:old.c,born:t0});}
 const box=r=>[[r.x0,r.y0],[r.x1,r.y0],[r.x1,r.y1],[r.x0,r.y1]],spot=[Math.sin(ph.clock*.27)*.8,Math.cos(ph.clock*.2)*.5];
 const panes=rects.map((r,i)=>{const col=r.from?Vblend(r.from,r.c,Ksmooth((t-r.born-.35)/.55)):r.c,cx=(r.x0+r.x1)/2,cy=(r.y0+r.y1)/2;return Vp(box(r),col,Gon(t,H[0],.6),.45*Math.exp(-((cx-spot[0])**2+(cy-spot[1])**2)/.35)+.3*Vpulse(t,[r.born].filter(x=>x>=0)),Gshade(i,o.seed),i%2?'cathedral':'opal');});
 const after=(cc,S,lead)=>{for(const {sp,grow} of growing){const r=sp.parent,a=sp.vertical?[sp.a.x1,r.y0]:[r.x0,sp.a.y1],b=sp.vertical?[sp.a.x1,r.y0+(r.y1-r.y0)*grow]:[r.x0+(r.x1-r.x0)*grow,sp.a.y1],A=S(a),B=S(b);
  cc.strokeStyle='#17151d';cc.lineWidth=lead;cc.lineCap='butt';cc.beginPath();cc.moveTo(A[0],A[1]);cc.lineTo(B[0],B[1]);cc.stroke();}};
 glassWindow(c,w,h,o,[{panes,lead:.032,after}],Vview(w,h,ph,o,cols[0],1.15,.85));}

// 5 · Estrella de vuit puntes: an eightfold star rosette in the manner of Islamic geometric glass; colours flow slowly round the rings.
const GIRIH_PAL=[[VJ.turq,VJ.cobalt,VJ.gold,VJ.lemon,VJ.emerald,VJ.ruby],[VJ.cobalt,VJ.gold,VJ.turq,VJ.orange,VJ.ruby,VJ.emerald],[VJ.emerald,VJ.turq,VJ.amber,VJ.lemon,VJ.cobalt,VJ.magenta]];
function Vgirih(c,w,h,ph,o){const pal=GIRIH_PAL[o.seed%3],t=ph.t,H=o.hitT,ch=Vchaser(ph,o,.5);
 const g=Vcache('girih',()=>{const at=(q,r)=>{const a=q*Math.PI/8;return [Math.cos(a)*r,Math.sin(a)*r];},b0=q=>q%2?.16:.3,b1=q=>q%2?.5:.3,b2=q=>q%2?.52:.72,b3=q=>q%2?.9:.74;
  const between=(inner,outer,q0,q1)=>{const pts=[];for(let q=q0;q<=q1;q++)pts.push(at(q,outer(q)));for(let q=q1;q>=q0;q--)pts.push(at(q,inner(q)));return pts.filter((p,i,arr)=>i===0||Math.hypot(p[0]-arr[i-1][0],p[1]-arr[i-1][1])>1e-6);};
  return {core:[Gpoly(8,.07,Math.PI/8)],star:Array.from({length:8},(_,k)=>[[0,0],at(2*k,b0(2*k)),at(2*k+1,b0(2*k+1)),at(2*k+2,b0(2*k+2))].map(p=>p)),
   kites:Array.from({length:8},(_,k)=>between(b0,b1,2*k,2*k+2)),hexes:Array.from({length:8},(_,k)=>between(b1,b2,2*k-1,2*k+1)),outer:Array.from({length:8},(_,k)=>between(b2,b3,2*k,2*k+2)),
   teeth:Array.from({length:8},(_,k)=>{const pts=[];for(let q=2*k-1;q<=2*k+1;q++)pts.push(at(q,b3(q)));for(let i=8;i>=0;i--){const a=(2*k-1+2*i/8)*Math.PI/8;pts.push([Math.cos(a)*.955,Math.sin(a)*.955]);}return pts;}),
   rim:Array.from({length:32},(_,i)=>Gsector(.97,1.02,i*K_TAU/32,(i+1)*K_TAU/32,3))};});
 const rot=Vspin(ph,o,.018),flow=ph.clock*.22,pulse=.28*Vpulse(t,H);
 // Each ring changes colour slowly with a cross-fade; alternate pieces stay half a step apart, so the star keeps its symmetry.
 const tint=(i,base)=>{const f=flow+(i%2)*.5+base*.17,k=Math.floor(f),x=Ksmooth(f-k);return Vblend(pal[(base+k)%pal.length],pal[(base+k+1)%pal.length],x);};
 const L=(list,hit,colorFn,tex,offset)=>({rot,tex,panes:list.map((pts,i)=>Vp(pts,colorFn(i),Vr(t,H[hit],i,list.length,.45),Kclamp(.5*Vchase((i+offset)*K_TAU/list.length+rot,ch)+pulse),Gshade(i+hit*30,o.seed),tex))});
 const layers=[L(g.core,0,()=>Kmix(pal[2],'#ffffff',.45),'opal',0),L(g.star,1,i=>i%2?pal[2]:Kmix(pal[2],pal[3],.4),'cathedral',.5),L(g.kites,2,i=>tint(i,0),'cathedral',.5),L(g.hexes,3,i=>tint(i,1),'opal',0),
  L(g.outer,4,i=>tint(i,4),'cathedral',.5),L(g.teeth,5,i=>i%2?pal[1]:pal[0],'seedy',0),L(g.rim,5,i=>i%2?pal[5]:pal[2],'cathedral',0)];
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1.02,1.02,{rays:{colors:[pal[0],pal[2],pal[1],pal[2]],a:.045,turn:rot,width:.12}}));}

// 6 · Flors de Tiffany: three flowers of opalescent glass open one after another over a meadow of pale glass.
const FLOWER_PAL=[[VJ.ruby,VJ.orange,VJ.magenta],[VJ.rose,VJ.violet,VJ.amber],[VJ.scarlet,VJ.gold,VJ.purple]];
function Vflowers(c,w,h,ph,o){const fp=FLOWER_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed,sway=o.reduced?0:1;
 const g=Vcache('flowers'+seed%3,()=>{const sites=Array.from({length:84},(_,i)=>[-1.18+2.36*Krand(i,seed%3+11),-.83+1.66*Krand(i+300,seed%3+11)]);return {bg:Gvoronoi(sites,[[-1.2,-.85],[1.2,-.85],[1.2,.85],[-1.2,.85]],1)};});
 const sky=[VJ.sky,VJ.ice,VJ.aqua,VJ.mint,'#d9f59a'],bg=g.bg.map((cell,i)=>Vp(cell.pts,Kramp(sky,(cell.site[1]+.85)/1.7),Gon(t,H[0]+(cell.site[1]+.85)*.45,.45),.25*Kbump(cell.site[1],-.6+.2*Math.sin(ph.clock*.3),.4),Gshade(i,seed),'opal'));
 const flowers=[{x:-.72,y:-.02,s:.36,n:7,hit:2},{x:0,y:-.28,s:.46,n:8,hit:3},{x:.74,y:.04,s:.34,n:6,hit:4}],layers=[{panes:bg,tex:'opal'}];
 flowers.forEach((f,fi)=>{const grown=Gon(t,H[1]+fi*.25,.7),bloom=KeaseBack(Ksmooth((t-H[f.hit])/.9)),wob=sway*.05*Math.sin(ph.clock*.9+fi*2);
  // Stem and two leaves grow first.
  const stem=[[-.018,0],[.018,0],[.018,.9-f.y],[-.018,.9-f.y]],leafA=Gpetal(0,.34,-Math.PI/2+.75,.085,.8),leafB=Gpetal(0,.3,-Math.PI/2-.8,.08,.8);
  layers.push({dx:f.x,dy:f.y,k:1,rot:wob*.3,panes:[Vp(stem,VJ.emerald,grown,0,0,'cathedral',grown),Vp(Gscale(Gmove(leafA,.0,.48-f.y*.3),grown,0,.48-f.y*.3),VJ.lime,grown,0,.2,'cathedral',grown),Vp(Gscale(Gmove(leafB,0,.62-f.y*.3),grown,0,.62-f.y*.3),VJ.emerald,grown,0,-.2,'cathedral',grown)]});
  if(bloom>0){const petals=Array.from({length:f.n},(_,i)=>Vp(Gpetal(.04,f.s,i*K_TAU/f.n+(f.n%2?-Math.PI/2:0),f.s*.33,.65),Kmix(fp[fi],'#ffffff',i%2?.18:0),Kclamp(bloom),.35*Vpulse(t,[H[f.hit]]),Gshade(i+fi*20,seed),'opal'));
   const centre=Vp(Gcircle(0,0,f.s*.17,20),VJ.gold,Kclamp(bloom),.4,0,'seedy');layers.push({dx:f.x,dy:f.y,k:Math.max(.05,bloom),rot:Vspin(ph,o,.02)*(fi%2?-1:1)+wob,panes:[...petals,centre]});}});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,fp[1],1.2,.85));}

// 7 · Ventall de sol: an Art Deco sunburst opens like a fan; bands of colour light up from the sun outwards.
const FAN_PAL=[[VJ.gold,VJ.amber,VJ.orange,VJ.scarlet,VJ.magenta,VJ.violet,VJ.cobalt,VJ.turq],[VJ.lemon,VJ.gold,VJ.lime,VJ.emerald,VJ.teal,VJ.sky,VJ.cobalt,VJ.violet],[VJ.amber,VJ.orange,VJ.rose,VJ.magenta,VJ.purple,VJ.violet,VJ.turq,VJ.aqua]];
function Vfan(c,w,h,ph,o){const pal=FAN_PAL[o.seed%3],t=ph.t,H=o.hitT,open=.25+.75*KeaseOut(Ksmooth((t-H[0])/1.4)),N=15,radii=[.2,.47,.75,1.03,1.3],cy=.62,flow=ph.clock*(o.reduced?.08:.25);
 const half=(Math.PI/2-.2)*open,ray=(i,r0,r1)=>{const a0=-Math.PI/2-half+2*half*i/N,a1=-Math.PI/2-half+2*half*(i+1)/N;return Gmove(Gsector(r0,r1,a0,a1,5),0,cy);};
 const layers=[{panes:[Vp(Gmove(Gsector(0,.1,Math.PI,K_TAU,14),0,cy),Kmix(pal[0],'#ffffff',.5),Gon(t,H[0],.4),.3,0,'opal'),Vp(Gmove(Gsector(.1,.2,Math.PI,K_TAU,14),0,cy),pal[0],Gon(t,H[0]+.15,.4),.3*Vpulse(t,H),.2,'cathedral')]}];
 for(let b=0;b<4;b++){const panes=[];for(let i=0;i<N;i++){const f=flow+i*.12+b*.3,k=Math.floor(f),x=Ksmooth(f-k),c0=pal[(2*b+(k+i)%2)%pal.length],c1=pal[(2*b+(k+i+1)%2)%pal.length];
   panes.push(Vp(ray(i,radii[b],radii[b+1]),Kmix(c0,c1,x),Vr(t,H[b+1],Math.abs(i-(N-1)/2),N/2,.35),.4*Vpulse(t,[H[b+1]]),Gshade(i+b*20,o.seed),b%2?'opal':'cathedral'));}layers.push({panes});}
 const frame=[];for(let i=0;i<N;i++)frame.push(Vp(ray(i,1.3,1.36),pal[(i%2)?6:7],Gon(t,H[5],.5),0,0,'cathedral'));layers.push({panes:frame});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1.36,.95,{glow:{color:pal[1],a:.16,r:1.6},rays:{colors:[pal[0],pal[2],pal[4],pal[6],pal[2]],a:.05,x:0,y:cy,turn:-Math.PI,span:Math.PI,width:.2,length:2}}));}

// 8 · Tres lancetes: three Gothic lancets of diamond-shaped panes; light rises in each one, and a roundel crowns it.
const LANCET_PAL=[[[VJ.cobalt,VJ.sky],[VJ.ruby,VJ.amber],[VJ.emerald,VJ.lime],[VJ.gold,VJ.violet]],[[VJ.violet,VJ.rose],[VJ.orange,VJ.gold],[VJ.teal,VJ.turq],[VJ.lemon,VJ.ruby]],[[VJ.turq,VJ.cobalt],[VJ.magenta,VJ.rose],[VJ.lime,VJ.gold],[VJ.amber,VJ.ultra]]];
function Vlancets(c,w,h,ph,o){const pal=LANCET_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Vcache('lancets',()=>[[-.98,-.38,-.2],[-.3,.3,-.36],[.38,.98,-.2]].map(([x0,x1,spring],li)=>{const arch=Garch(x0,x1,.95,spring),quarries=[],dx=.15,dy=.21;
  for(let j=-6;j<12;j++)for(let i=-4;i<5;i++){const x=(x0+x1)/2+i*2*dx+(j%2?dx:0),y=.95-j*dy;const q=Gintersect([[x,y-dy],[x+dx,y],[x,y+dy],[x-dx,y]],arch);if(q.length>2)quarries.push({pts:q,cy:y,k:quarries.length});}
  const cy=li===1?-.02:.1,mx=(x0+x1)/2;return {arch,quarries,roundel:[Gcircle(mx,cy,.2,32),...Array.from({length:4},(_,i)=>Gmove(Gpetal(.04,.17,i*Math.PI/2+Math.PI/4,.075,.7),mx,cy)),Gcircle(mx,cy,.045,16)],mx,cy};}));
 const layers=[];g.forEach((L,li)=>{const [ca,cb]=pal[li];layers.push({panes:L.quarries.map(q=>Vp(q.pts,(q.k%3===0)?cb:ca,Gon(t,H[li]+(.95-q.cy)/1.9*1.3,.45),.4*Kbump((.95-q.cy)/1.9,((t-H[li])/1.3)%1.6,.15),Gshade(q.k+li*60,o.seed),q.k%2?'cathedral':'seedy'))});});
 g.forEach((L,li)=>{const [ca]=pal[3],a=Vr(t,H[3],li,3,.5),spin=Vspin(ph,o,.05)*(li%2?-1:1);layers.push({dx:L.mx,dy:L.cy,rot:spin,panes:L.roundel.map((pts,i)=>Vp(Gmove(pts,-L.mx,-L.cy),i===0?pal[li][1]:i===5?VJ.opal:ca,a,.3*Vpulse(t,[H[3]]),Gshade(i,o.seed),i===0?'opal':'cathedral',a>0?Math.min(1,a*1.5):0))});});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[1][1],1,1,{rays:{colors:[pal[0][0],pal[1][0],pal[2][0]],a:.055,turn:Math.PI/2-.45,span:.9,width:.13,length:2.2,inner:.4}}));}

// 9 · Trencadís: broken glass flies in from all sides and settles into a spiral of colour (after Gaudí's trencadís).
function Vtrencadis(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed,still=o.reduced;
 const g=Vcache('trencadis'+seed%3,()=>{const sites=Array.from({length:112},(_,i)=>{const r=.97*Math.sqrt(Krand(i,seed%3+71)),a=K_TAU*Krand(i+500,seed%3+71);return [Math.cos(a)*r,Math.sin(a)*r];});
  return Gvoronoi(sites,Gcircle(0,0,1,44),1).map((cell,i)=>{const [x,y]=Gcentroid(cell.pts),r=Math.hypot(x,y),a=Math.atan2(y,x),group=Math.min(5,Math.floor((r*.85+((a/K_TAU+1)%1)*.15)*6)),out=1+.8*Krand(i,seed%3+3),turn=a+.7;
   return {pts:cell.pts.map(([px,py])=>[px-x,py-y]),x,y,r,a,group,ox:Math.cos(turn)*out,oy:Math.sin(turn)*out,spin:(Krand(i,seed%3+4)-.5)*2.4,delay:Krand(i,seed%3+5)*.35,k:i};});});
 const rot=Vspin(ph,o,.02),wave=ph.clock*.45,panes=g.map(s=>{const land=H[s.group]+s.delay,q=still?1:KeaseOut(Kclamp((t-(land-.85))/.85)),vis=still?Ksmooth((t-land+.4)/.4):Ksmooth(q*3);
  const pts=Grot(s.pts,(1-q)*s.spin).map(([x,y])=>[x+s.x+(1-q)*s.ox,y+s.y+(1-q)*s.oy]),col=Kloop(V_RAINBOW,s.a/K_TAU+s.r*.75+(seed%3)*.33);
  return Vp(pts,col,q,Kclamp(.5*Kbump(((s.a/K_TAU+s.r*.5-wave)%1+1)%1,.5,.08)+.25*Vpulse(t,[land])),Gshade(s.k,seed),['cathedral','opal','seedy'][s.k%3],vis);});
 glassWindow(c,w,h,o,[{panes,rot,lead:.012}],Vview(w,h,ph,o,Kloop(V_RAINBOW,seed*.33),1,1));}

// 10 · Columnes de llum: two tall windows of organic cells whose colours flow from cool to warm (after the Sagrada Família).
const GAUDI=[VJ.teal,VJ.emerald,VJ.lime,VJ.gold,VJ.orange,VJ.ruby,VJ.magenta,VJ.violet,VJ.cobalt,VJ.turq];
function Vcolumns(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed;
 const g=Vcache('columns'+seed%3,()=>[-.56,.56].map((mx,ci)=>{const edge=Array.from({length:48},(_,i)=>{const a=i*K_TAU/48,cs=Math.cos(a),sn=Math.sin(a);return [mx+.4*Math.sign(cs)*Math.pow(Math.abs(cs),.5),.97*Math.sign(sn)*Math.pow(Math.abs(sn),.5)];});
  const sites=Array.from({length:36},(_,i)=>[mx+(Krand(i,seed%3+ci*9+81)-.5)*.74,(Krand(i+90,seed%3+ci*9+81)-.5)*1.86]);return {edge,cells:Gvoronoi(sites,edge,2)};}));
 const flow=ph.clock*(o.reduced?.012:.035),layers=g.map((col,ci)=>({panes:col.cells.map((cell,i)=>{const [x,y]=cell.site,u=(.5-y/1.94)*.55+(ci?.35:0)-flow+.04*Math.sin(x*6+ph.clock*.4),band=Math.min(4,Math.floor((.97-y)/1.94*5));
  return Vp(cell.pts,Kloop(GAUDI,u+(seed%3)*.3),Gon(t,H[band]+(ci?.2:0)+Krand(i,seed)*.25,.5),.35*Kbump((.97-y)/1.94,((t-H[0])*.22)%1.3,.12),Gshade(i+ci*50,seed),i%3?'cathedral':'opal');})}));
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,Kloop(GAUDI,seed*.3),.98,.98,{rays:{colors:[Kloop(GAUDI,.1),Kloop(GAUDI,.4),Kloop(GAUDI,.7)],a:.05,turn:Math.PI/2-.4,span:.8,width:.15,length:2.2,inner:.3}}));}

// 11 · Medallons: nine round medallions appear one by one in a spiral and turn gently, set in pale quarries with golden knots.
const MEDAL_PAL=[[VJ.ruby,VJ.cobalt,VJ.emerald,VJ.violet,VJ.orange,VJ.turq,VJ.magenta,VJ.gold,VJ.sky],[VJ.magenta,VJ.teal,VJ.amber,VJ.cobalt,VJ.lime,VJ.ruby,VJ.violet,VJ.turq,VJ.orange],[VJ.violet,VJ.orange,VJ.turq,VJ.ruby,VJ.emerald,VJ.gold,VJ.cobalt,VJ.rose,VJ.lime]];
function Vmedallions(c,w,h,ph,o){const pal=MEDAL_PAL[o.seed%3],t=ph.t,H=o.hitT,cell=.64,order=[4,1,2,5,8,7,6,3,0];
 const bg=[];for(let j=0;j<3;j++)for(let i=0;i<3;i++){const x0=-.96+i*cell,y0=-.96+j*cell,m=[x0+cell/2,y0+cell/2],cs=[[x0,y0],[x0+cell,y0],[x0+cell,y0+cell],[x0,y0+cell]];
  for(let k=0;k<4;k++)bg.push(Vp([m,cs[k],cs[(k+1)%4]],[VJ.cream,VJ.aqua,VJ.blush,VJ.ice][(i+j+k)%4],Gon(t,H[0]+.1*(i+j),.5),.25*Kbump(Math.hypot(m[0],m[1]),(t-H[0])*.6%2,.3),Gshade(bg.length,o.seed),'frost'));}
 const layers=[{panes:bg,lead:.011}],knots=[];for(let j=1;j<3;j++)for(let i=1;i<3;i++)knots.push(Vp(Grot(Gpoly(4,.08,0,-.96+i*cell,-.96+j*cell),0,-.96+i*cell,-.96+j*cell),VJ.gold,Gon(t,H[0]+.4,.4),.3*Vpulse(t,H),0,'seedy'));
 order.forEach((idx,k)=>{const i=idx%3,j=Math.floor(idx/3),x=-.96+cell*(i+.5),y=-.96+cell*(j+.5),t0=H[k],grow=KeaseBack(Ksmooth((t-t0)/.8));if(grow<=0)return;const col=pal[k],alt=pal[(k+3)%9],n=8;
  const panes=[Vp(Gcircle(0,0,.29,36),Kmix(alt,'#ffffff',.55),1,0,0,'opal'),...Array.from({length:n},(_,p)=>Vp(Gpetal(.07,.255,p*K_TAU/n,.075,.8),p%2?col:Kmix(col,'#ffffff',.2),1,.3*Vchase(p*K_TAU/n,Vchaser(ph,o,.9)),Gshade(p+k*10,o.seed),'cathedral')),Vp(Gcircle(0,0,.065,18),VJ.gold,1,.4,0,'seedy')];
  layers.push({dx:x,dy:y,k:Math.max(.05,grow),rot:Vspin(ph,o,.06)*(k%2?-1:1)+(1-Kclamp(grow))*1.2,panes:panes.map(p=>({...p,a:Kclamp(grow)}))});});
 layers.push({panes:knots});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],.97,.97));}

// 12 · Culs d'ampolla: round panes of crown glass in a honeycomb of coloured glass; waves of light cross them.
const BOTTLE_PAL=[[VJ.amber,VJ.lime,VJ.turq,VJ.rose,VJ.gold,VJ.aqua],[VJ.gold,VJ.emerald,VJ.sky,VJ.magenta,VJ.cream,VJ.orange],[VJ.lemon,VJ.teal,VJ.blush,VJ.orange,VJ.mint,VJ.violet]];
function Vbottles(c,w,h,ph,o){const pal=BOTTLE_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed;
 const g=Vcache('bottles',()=>{const centres=[];for(let j=-5;j<=5;j++)for(let i=-5;i<=5;i++){const x=i*.27+(j%2?.135:0),y=j*.27*Math.sin(Math.PI/3);if(Math.hypot(x,y)<=.86)centres.push([x,y]);}return {centres,cells:Gvoronoi(centres,Gcircle(0,0,1,48),0)};});
 const origin=k=>{const a=k*2.1+.4;return [Math.cos(a)*1.3,Math.sin(a)*1.3];},glow=(x,y)=>H.reduce((m,hh,k)=>{if(t<hh)return m;const [ox,oy]=origin(k);return Math.max(m,Kbump(Math.hypot(x-ox,y-oy),(t-hh)*1.1,.22)*Math.exp(-(t-hh)*.35));},0);
 const deep=[VJ.cobalt,VJ.violet,VJ.teal,VJ.ultra],bg=g.cells.map((cell,i)=>Vp(cell.pts,deep[i%4],Gon(t,H[0]+Math.hypot(...cell.site)*.6,.5),.4*glow(...cell.site),Gshade(i,seed),'cathedral'));
 const sun=ph.clock*(o.reduced?.15:.4),rr=.122;
 const rounds=g.centres.map(([x,y],i)=>Vp(Gcircle(x,y,rr,26),pal[Math.floor(Krand(i,seed)*pal.length)],Gon(t,H[0]+Math.hypot(x,y)*.6+.15,.5),Kclamp(.6*glow(x,y)),Gshade(i+90,seed),'seedy'));
 const after=(cc,S,lead)=>{if(o.lit===false)return;cc.save();cc.globalCompositeOperation='lighter';for(let i=0;i<g.centres.length;i++){const [x,y]=g.centres[i],a=rounds[i].a;if(a<=.02)continue;const [X,Y]=S([x,y]),[X2]=S([x+rr,y]),r=Math.abs(X2-X);
   cc.strokeStyle=`rgba(255,255,255,${(.13*a).toFixed(3)})`;cc.lineWidth=Math.max(.6,r*.06);for(const f of [.38,.62,.84]){cc.beginPath();cc.arc(X,Y,r*f,0,K_TAU);cc.stroke();}
   cc.fillStyle=`rgba(255,255,255,${(.28*a).toFixed(3)})`;cc.beginPath();cc.arc(X,Y,r*.16,0,K_TAU);cc.fill();
   cc.strokeStyle=`rgba(255,255,255,${(.35*a).toFixed(3)})`;cc.lineWidth=Math.max(.8,r*.09);cc.beginPath();cc.arc(X,Y,r*.72,sun+i*.3-.5,sun+i*.3+.5);cc.stroke();}cc.restore();};
 glassWindow(c,w,h,o,[{panes:bg},{panes:rounds,after}],Vview(w,h,ph,o,pal[4],1,1));}

// 13 · Arc de Sant Martí: a rainbow arch painted band by band over a sky with a rising sun and soft clouds.
function Vrainbow(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed,cy=.6,bands=[VJ.ruby,VJ.orange,VJ.gold,VJ.lime,VJ.turq,VJ.cobalt,VJ.violet],chase=((ph.clock*(o.reduced?.15:.35))%1.6)-.3;
 const g=Vcache('rainbow',()=>({bands:bands.map((_,k)=>{const r0=1.18-(k+1)*.098,r1=1.18-k*.098,n=9+(6-k)*2,off=(k%2)*.5;const list=[];for(let i=0;i<n;i++){const a0=Math.PI+Math.PI*Math.max(0,(i-off)/n),a1=Math.PI+Math.PI*Math.min(1,(i+1-off)/n);if(a1-a0>.01)list.push({pts:Gmove(Gsector(r0+.004,r1-.004,a0,a1,4),0,cy),u:((a0+a1)/2-Math.PI)/Math.PI});}
   if(off){list.push({pts:Gmove(Gsector(r0+.004,r1-.004,Math.PI*(2-.5/n),K_TAU,3),0,cy),u:1});}return list;}),
  sky:Array.from({length:6},(_,i)=>Gmove(Gsector(0,.49,Math.PI+i*Math.PI/6,Math.PI+(i+1)*Math.PI/6,5),0,cy)),
  hills:[[x=>cy+.04+.05*Math.sin(x*3.2+1),x=>cy+.2+.04*Math.sin(x*2.4+2),6],[x=>cy+.2+.04*Math.sin(x*2.4+2),()=>.95,5]].flatMap(([f,g2,n],row)=>Array.from({length:n},(_,i)=>{const cut=j=>-1.25+2.5*j/n+(j>0&&j<n?(Krand(j+row*9,23)-.5)*.16:0);return {pts:Gband(f,g2,cut(i),cut(i+1),8),row,i};})),
  // Each cloud is one piece of glass with a scalloped top, so it reads as a cloud and never as a face.
  clouds:[[-.95,cy-.04,1],[.95,cy-.06,.9]].map(([x,y,k])=>{const puffs=[[-.15,0,.09],[-.05,-.07,.12],[.08,-.05,.11],[.17,0,.08]].map(([a,b,r])=>[x+a*k,y+b*k,r*k]),top=X=>Math.min(y+.06*k,...puffs.map(([a,b,r])=>Math.abs(X-a)<r?b-Math.sqrt(r*r-(X-a)**2):Infinity));
   return Gband(top,()=>y+.06*k,x-.235*k,x+.245*k,28);})}));
 const layers=[{panes:g.sky.map((pts,i)=>Vp(pts,[VJ.ice,VJ.aqua,VJ.sky][i%3],Gon(t,H[0]+i*.06,.5),.2,Gshade(i,seed),'opal'))}];
 const sunY=cy-.05-.25*KeaseOut(Ksmooth((t-H[0])/(H[6]-H[0]+.5)));layers.push({panes:[Vp(Gcircle(0,sunY,.12,28),VJ.gold,Gon(t,H[0]+.3,.5),.5+.3*Vpulse(t,H),0,'seedy'),Vp(Gcircle(0,sunY,.05,16),VJ.lemon,Gon(t,H[0]+.3,.5),.6,0,'opal')]});
 g.bands.forEach((list,k)=>{layers.push({panes:list.map((b,i)=>Vp(b.pts,bands[k],Gon(t,H[k]+b.u*.55,.3),Kclamp(.55*Kbump(b.u,chase,.12)+.2*Vpulse(t,[H[k]])),Gshade(i+k*30,seed),k%2?'cathedral':'opal'))});});
 layers.push({panes:g.hills.map((p,i)=>Vp(p.pts,[[VJ.lime,'#7ed957',VJ.emerald,'#c4ef5a'],[VJ.emerald,VJ.teal,'#3cc47a',VJ.lime]][p.row][(p.i+p.row)%4],Gon(t,H[0]+.2+p.i*.05,.6),.15*Vpulse(t,[H[6]]),Gshade(i+70,seed),p.i%2?'cathedral':'frost'))});
 g.clouds.forEach((cl,k)=>{const drift=o.reduced?0:.04*Math.sin(ph.clock*.25+k*2);layers.push({dx:drift,panes:[Vp(cl,VJ.opal,Gon(t,H[6]+k*.2,.6),.2,Gshade(k,seed),'opal',Gon(t,H[6]+k*.2,.6))]});});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,VJ.gold,1.25,.95,{rays:{colors:bands,a:.04,x:0,y:cy,turn:-Math.PI,span:Math.PI,width:.18,length:2.2,inner:.5}}));}

// 14 · Fulles de llum: three panels where large leaves of coloured glass grow along a stem and sway (after Matisse's chapel windows).
const LEAF_PAL=[[VJ.lemon,VJ.lime,VJ.gold,VJ.emerald,VJ.orange,VJ.rose],[VJ.gold,VJ.mint,VJ.lemon,VJ.lime,VJ.magenta,VJ.amber],[VJ.lemon,VJ.emerald,VJ.amber,VJ.turq,VJ.rose,VJ.lime]];
// A lobed leaf with a pointed tip, cut in two along the midrib: the lead between the halves reads as the vein.
function Vleaf(len,wd,n=18){const half=sgn=>{const pts=[[0,0]];for(let i=1;i<n;i++){const u=i/n,hw=wd*Math.sin(Math.PI*Math.pow(u,.85))*(.74+.26*Math.cos(6*Math.PI*u));pts.push([u*len,sgn*hw]);}pts.push([len,0]);return pts;};return [half(-1),half(1)];}
function Vleaves(c,w,h,ph,o){const pal=LEAF_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed,panels=[[-1.2,-.42],[-.38,.38],[.42,1.2]],sway=o.reduced?0:1;
 const layers=[];panels.forEach(([x0,x1],pi)=>{const ys=[-.92,-.55,-.15,.25,.6,.92],panes=[];for(let k=0;k<5;k++)panes.push(Vp([[x0,ys[k]],[x1,ys[k]],[x1,ys[k+1]],[x0,ys[k+1]]],['#2349d8','#3a36d9','#1f6fd6','#2a2fb8','#4a3fe0'][(k+pi*2)%5],Gon(t,H[0]+(4-k)*.12+pi*.1,.5),.2*Kbump(ys[k],.9-((t-H[0])*.5)%2.2,.4),Gshade(k+pi*7,seed),'frost'));
  const mx=(x0+x1)/2;panes.push(Vp([[mx-.02,.92],[mx+.02,.92],[mx+.02,-.84],[mx-.02,-.84]],VJ.emerald,Gon(t,H[0]+.3,.5),0,0,'cathedral'));layers.push({panes,lead:.012});});
 // Fifteen leaves, two per visual event, from the bottom of the panels to the top.
 let k=0;for(let level=0;level<5;level++)for(let pi=0;pi<3;pi++){const [x0,x1]=panels[pi],mx=(x0+x1)/2,y=.7-level*.32,side=(level+pi)%2?1:-1,hit=1+Math.floor(k/2),t0=H[Math.min(H.length-1,hit)]+(k%2)*.18,grow=KeaseBack(Ksmooth((t-t0)/.8));
  if(grow>0){const col=pal[(k*5)%pal.length],ang=(side>0?-.75:-Math.PI+.75)+sway*.07*Math.sin(ph.clock*.8+k*1.3);layers.push({dx:mx,dy:y,rot:ang,k:Math.max(.05,grow),panes:Vleaf(.44,.14).map((pts,hf)=>Vp(pts,hf?col:Kmix(col,'#ffffff',.18),Kclamp(grow),.25*Vpulse(t,[t0]),hf?-.2:.25,k%2?'cathedral':'opal'))});}k++;}
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1.2,.92));}

// 15 · Rosa dels vents: a sixteen-point compass rose whose points grow from the centre, two shades per point; it turns slowly.
const COMPASS_PAL=[[VJ.gold,VJ.turq,VJ.magenta,VJ.violet,VJ.cobalt],[VJ.amber,VJ.emerald,VJ.rose,VJ.cobalt,VJ.ultra],[VJ.lemon,VJ.sky,VJ.orange,VJ.purple,VJ.teal]];
function Vcompass(c,w,h,ph,o){const pal=COMPASS_PAL[o.seed%3],t=ph.t,H=o.hitT,rot=Vspin(ph,o,.03)-.2,ch=Vchaser(ph,o,.7);
 const point=(a,L,rs,d)=>[[[0,0],[Math.cos(a)*L,Math.sin(a)*L],[Math.cos(a-d)*rs,Math.sin(a-d)*rs]],[[0,0],[Math.cos(a)*L,Math.sin(a)*L],[Math.cos(a+d)*rs,Math.sin(a+d)*rs]]];
 const set=(count,offset,L,rs,d,col,hit)=>{const grow=KeaseBack(Ksmooth((t-H[hit])/.8)),panes=[];if(grow<=0)return {rot,panes};for(let i=0;i<count;i++){const a=offset+i*K_TAU/count,[A,B]=point(a,L*Math.max(.05,grow),rs,d);
  panes.push(Vp(A,col,Kclamp(grow),Kclamp(.5*Vchase(a+rot,ch)),.25,'cathedral'),Vp(B,Kmix(col,'#0b0a18',.35),Kclamp(grow),Kclamp(.35*Vchase(a+rot,ch)),-.1,'cathedral'));}return {rot,panes};};
 const ring={rot,panes:[...Array.from({length:32},(_,i)=>Vp(Gsector(.86,.93,i*K_TAU/32,(i+1)*K_TAU/32,3),i%2?pal[3]:pal[4],Vr(t,H[0],i,32,.6),.3*Vchase(i*K_TAU/32+rot,ch),Gshade(i,o.seed),'opal')),
  ...Array.from({length:16},(_,i)=>Vp(Gsector(.1,.17,i*K_TAU/16,(i+1)*K_TAU/16,3),i%2?pal[0]:pal[2],Gon(t,H[0]+.2,.4),0,0,'cathedral')),Vp(Gcircle(0,0,.1,24),VJ.opal,Gon(t,H[0],.4),.3+.3*Vpulse(t,H),0,'seedy')]};
 const layers=[Vground('compass',.86,46,['#8fd3ff','#bff3ee','#cfe6ff','#9fe7f5','#ffe2a6'],t,H[0],o.seed,ch),ring,set(8,Math.PI/8,.6,.15,Math.PI/11,pal[2],1),set(4,Math.PI/4,.8,.2,Math.PI/7,pal[1],2),set(4,0,1,.24,Math.PI/6,pal[0],3),{rot,panes:[Vp(Gcircle(0,0,.075,22),VJ.opal,Gon(t,H[0],.4),.4,0,'seedy')]}];
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1,1,{rays:{colors:[pal[0],pal[1],pal[0],pal[1]],a:.05,turn:rot,width:.12}}));}

// 16 · Entrellaçat: a trefoil knot and a ring of glass ribbons weave over and under each other on a deep blue ground.
const KNOT_PAL=[[VJ.gold,VJ.amber,VJ.ruby,VJ.orange],[VJ.lime,VJ.gold,VJ.turq,VJ.emerald],[VJ.rose,VJ.magenta,VJ.gold,VJ.orange]];
function Vknot(c,w,h,ph,o){const pal=KNOT_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed,rot=Vspin(ph,o,.03);
 const g=Vcache('knot'+seed%3,()=>{const sites=Array.from({length:46},(_,i)=>{const r=.96*Math.sqrt(Krand(i,seed%3+31)),a=K_TAU*Krand(i+200,seed%3+31);return [Math.cos(a)*r,Math.sin(a)*r];});
  const knot=Array.from({length:361},(_,i)=>{const s=i*K_TAU/360;return {x:(Math.sin(s)+2*Math.sin(2*s))/3.35,y:(Math.cos(s)-2*Math.cos(2*s))/3.35,z:-Math.sin(3*s),u:i/360};}),ring=Array.from({length:241},(_,i)=>{const s=i*K_TAU/240;return {x:Math.cos(s)*.8,y:Math.sin(s)*.8,z:Math.sin(3*s+.9),u:i/240};});
  return {bg:Gvoronoi(sites,Gcircle(0,0,1,44),1),knot,ring};});
 const deep=[VJ.ultra,VJ.cobalt,VJ.violet,'#2a2a8a',VJ.purple],bg=g.bg.map((cell,i)=>Vp(cell.pts,deep[i%deep.length],Gon(t,H[0]+Math.hypot(...cell.site)*.5,.5),.25*Kbump(Math.atan2(cell.site[1],cell.site[0]),Math.sin(ph.clock*.3)*3,.8),Gshade(i,seed),'cathedral'));
 // The ribbons are drawn in short pieces sorted by depth, so each crossing shows one ribbon passing over the other.
 const shown=Kclamp((t-H[1])/(H[4]-H[1])),ringShown=Kclamp((t-H[4])/.9),flow=ph.clock*.06;
 const after=(cc,S,lead)=>{const pieces=[],add=(pts,frac,width,colorAt)=>{const last=Math.floor((pts.length-1)*frac);for(let i=0;i<last;i+=6){const seg=pts.slice(i,Math.min(last,i+6)+1);if(seg.length>1)pieces.push({seg,z:seg.reduce((m,p)=>m+p.z,0)/seg.length,width,color:colorAt(seg[0].u)});}};
  add(g.knot,shown,.11,u=>Kloop(pal,u*2+flow));add(g.ring,ringShown,.075,u=>Kloop([VJ.turq,VJ.lime,VJ.aqua],u*3-flow));pieces.sort((a,b)=>a.z-b.z);
  const [ox]=S([0,0]),[ux]=S([1,0]),unit=Math.hypot(ux-ox,S([1,0])[1]-S([0,0])[1]);cc.lineJoin='round';cc.lineCap='butt';
  for(const p of pieces){cc.beginPath();const s0=S([p.seg[0].x,p.seg[0].y]);cc.moveTo(s0[0],s0[1]);for(let i=1;i<p.seg.length;i++){const q=S([p.seg[i].x,p.seg[i].y]);cc.lineTo(q[0],q[1]);}
   cc.strokeStyle='#17151d';cc.lineWidth=p.width*unit+2*lead;cc.stroke();cc.strokeStyle=o.lit===false?p.color:Kmix(p.color,'#ffffff',.1);cc.lineWidth=p.width*unit;cc.stroke();cc.strokeStyle='rgba(255,255,255,.3)';cc.lineWidth=p.width*unit*.22;cc.stroke();}};
 glassWindow(c,w,h,o,[{panes:bg,rot},{panes:[],rot,after}],Vview(w,h,ph,o,pal[0],1,1));}

// 17 · Llum projectada: a small arched window lights up and casts its colours onto the floor; the light slides as the sun moves.
const CAST_PAL=[[VJ.ruby,VJ.gold,VJ.cobalt,VJ.emerald,VJ.violet,VJ.orange],[VJ.magenta,VJ.amber,VJ.turq,VJ.lime,VJ.cobalt,VJ.rose],[VJ.orange,VJ.sky,VJ.violet,VJ.gold,VJ.teal,VJ.ruby]];
function Vcast(c,w,h,ph,o){const pal=CAST_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed;
 const g=Vcache('cast',()=>{const arch=Garch(-.42,.42,.04,-.36),panes=[];const rows=[[-.16,.04],[-.36,-.16],[-.54,-.36],[-.72,-.54],[-.9,-.72],[-1.1,-.9]];
  rows.forEach(([y0,y1],r)=>{const n=r===5?2:4;for(let i=0;i<n;i++){const x0=-.42+.84*i/n,x1=-.42+.84*(i+1)/n,q=Gintersect([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],arch);if(q.length>2)panes.push({pts:q,row:Math.floor((5-r)*2/3),k:panes.length});}});
  panes.push({pts:Gcircle(0,-.72,.11,24),row:3,k:panes.length});return panes;});
 const shear=.45*Math.sin(ph.clock*(o.reduced?.05:.13)+seed),project=([x,y])=>{const d=(.04-y)/1.13;return [x*2.1*(1+.35*d)+shear*d,.2+d*.78];};
 const panes=g.map(p=>Vp(p.pts,pal[(p.k+Math.floor(p.k/4))%pal.length],Gon(t,H[Math.min(4,p.row+1)]+.1*(p.k%4),.5),.3*Vpulse(t,[H[Math.min(4,p.row+1)]]),Gshade(p.k,seed),p.k%2?'cathedral':'seedy'));
 // On a white ground the coloured light is laid over the floor like a tint instead of being added to the dark.
 const before=(cc,S)=>{cc.save();cc.globalCompositeOperation=o.lit===false?'multiply':'lighter';for(const p of panes){if(p.a<=.01)continue;const shrunk=Gscale(p.pts,.86,...Gcentroid(p.pts)),proj=shrunk.map(project),A=proj.map(S);
   cc.fillStyle=Krgba(p.color,.5*p.a);cc.beginPath();cc.moveTo(A[0][0],A[0][1]);for(const q of A.slice(1))cc.lineTo(q[0],q[1]);cc.closePath();cc.fill();
   // A faint beam between the pane and its patch of light.
   const [wx,wy]=S(Gcentroid(p.pts)),[fx,fy]=S(Gcentroid(proj)),gr=cc.createLinearGradient(wx,wy,fx,fy);gr.addColorStop(0,Krgba(p.color,.08*p.a));gr.addColorStop(1,Krgba(p.color,.02*p.a));cc.fillStyle=gr;cc.beginPath();
   const e0=S(shrunk[0]),e1=S(shrunk[Math.floor(shrunk.length/2)]),f0=A[0],f1=A[Math.floor(A.length/2)];cc.moveTo(e0[0],e0[1]);cc.lineTo(e1[0],e1[1]);cc.lineTo(f1[0],f1[1]);cc.lineTo(f0[0],f0[1]);cc.closePath();cc.fill();}
  // Motes of dust drifting in the light.
  for(let i=0;i<34;i++){const u=(Krand(i,7)+ph.clock*.015*(1+Krand(i,8)))%1,x=(Krand(i,9)-.5)*1.4+Math.sin(ph.clock*.3+i)*.04,y=.12+u*.88,[X,Y]=S([x+shear*u,y]);cc.fillStyle=`rgba(255,244,214,${(.35*Kbump(u,.5,.35)*Gon(t,H[4],.8)).toFixed(3)})`;cc.beginPath();cc.arc(X,Y,1.6,0,K_TAU);cc.fill();}cc.restore();};
 glassWindow(c,w,h,o,[{panes:[],after:before},{panes,dy:0}],Vview(w,h,ph,o,pal[1],1.25,1.1,{glow:{color:pal[1],a:.1,r:1.2},sweep:{angle:1.2,pos:Vview(w,h,ph,o,'#fff').sweep.pos,a:.1,width:.25}}));}

// 18 · Paisatge de vidre: a landscape window in the Tiffany manner: hills, a river and a meadow appear as the sun rises.
function Vlandscape(c,w,h,ph,o){const t=ph.t,H=o.hitT,seed=o.seed,hw=1.2;
 const g=Vcache('landscape'+seed%3,()=>{const cut=(top,bottom,n,s)=>Array.from({length:n},(_,i)=>{const x0=-hw+2*hw*i/n+(i?(Krand(i,s)-.5)*.12:0),x1=-hw+2*hw*(i+1)/n+(i<n-1?(Krand(i+1,s)-.5)*.12:0);return Gband(top,bottom,x0,x1,8);});
  const sites=Array.from({length:30},(_,i)=>[-hw+2*hw*Krand(i,seed%3+3),-.85+.95*Krand(i+40,seed%3+3)]);
  return {sky:Gvoronoi(sites,[[-hw,-.85],[hw,-.85],[hw,.12],[-hw,.12]],1),far:cut(x=>.02+.1*Math.sin(x*2.1+1),()=>.42,6,5),mid:cut(x=>.2+.11*Math.sin(x*1.7+3),()=>.6,6,6),
   river:cut(x=>.47+.06*Math.sin(x*2.6),x=>.56+.06*Math.sin(x*2.6+.4),5,7),meadow:[...cut(x=>.56+.06*Math.sin(x*2.6+.4),()=>.85,7,8)],
   flowers:Array.from({length:11},(_,i)=>[-1.05+2.1*Krand(i,seed%3+9),.64+.17*Krand(i+20,seed%3+9)])};});
 const rise=KeaseOut(Ksmooth((t-H[0])/(H[4]-H[0]+.8))),sunY=.35-.72*rise,warm=Kbump(rise,.25,.35),skyCol=y=>Kmix(Kramp([VJ.sky,VJ.ice,VJ.cream,VJ.blush],(y+.85)/.97),VJ.cream,.3*warm);
 const layers=[{panes:g.sky.map((cell,i)=>Vp(cell.pts,skyCol(cell.site[1]),Gon(t,H[0]+(cell.site[1]+.85)*.3,.5),.45*Math.exp(-((cell.site[0]-.35)**2+(cell.site[1]-sunY)**2)/.12),Gshade(i,seed),'opal'))},
  {dx:.35,dy:sunY,rot:Vspin(ph,o,.04),panes:[Vp(Gcircle(0,0,.13,26),VJ.gold,Gon(t,H[0],.5),.5,0,'seedy'),...Array.from({length:10},(_,i)=>Vp(Gpetal(.16,.27,i*K_TAU/10,.035),VJ.amber,Gon(t,H[0]+.2,.5),.3,0,'cathedral'))]},
  {panes:g.far.map((pts,i)=>Vp(pts,[VJ.violet,VJ.purple,'#7a5cff'][i%3],Gon(t,H[1]+i*.08,.5),.15,Gshade(i,seed),'cathedral'))},
  {panes:g.mid.map((pts,i)=>Vp(pts,[VJ.emerald,VJ.teal,'#22a35a'][i%3],Gon(t,H[2]+i*.08,.5),.15,Gshade(i+10,seed),'cathedral'))},
  {panes:g.river.map((pts,i)=>Vp(pts,[VJ.turq,VJ.sky,VJ.aqua][i%3],Gon(t,H[3]+i*.08,.5),Kclamp(.5*Kbump((i+.5)/5,(ph.clock*.25)%1.4-.2,.15)),Gshade(i+20,seed),'seedy'))},
  {panes:g.meadow.map((pts,i)=>Vp(pts,[VJ.lime,'#7ed957',VJ.mint][i%3],Gon(t,H[3]+.3+i*.06,.5),.1,Gshade(i+30,seed),'cathedral'))}];
 const blossoms=g.flowers.map(([x,y],i)=>{const pop=KeaseBack(Ksmooth((t-H[4]-i*.06)/.5));return pop>0?Vp(Gcircle(x,y,.034*Math.max(.05,pop),12),[VJ.magenta,VJ.gold,VJ.rose,VJ.orange][i%4],1,.3,0,'opal'):null;}).filter(Boolean);layers.push({panes:blossoms,lead:.008});
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,VJ.gold,hw,.86));}

// 19 · Onades de vidre: waves of blue and turquoise glass roll under a summer sun; the lead lines move with the water.
const SEA_PAL=[[VJ.turq,VJ.teal,VJ.cobalt,VJ.ultra,VJ.sky],[VJ.sky,VJ.turq,VJ.teal,VJ.cobalt,VJ.emerald],[VJ.aqua,VJ.sky,VJ.cobalt,VJ.violet,VJ.teal]];
function Vwaves(c,w,h,ph,o){const pal=SEA_PAL[o.seed%3],t=ph.t,H=o.hitT,seed=o.seed,hw=1.2,move=o.reduced?0:1;
 const swell=H.reduce((m,hh)=>m+Kbump(t,hh+.45,.4),0),top=k=>x=>{if(k>=5)return .85;const base=-.25+k*.22,f=[2.3,2.9,2.1,3.3,2.6][k],sp=[.5,.62,.45,.7,.55][k];return base+(.05+.025*swell)*Math.sin(f*x-ph.clock*sp*move+k*1.7+seed);};
 const cuts=Vcache('waves'+seed%3,()=>Array.from({length:5},(_,k)=>{const n=6+(k%2);return Array.from({length:n+1},(_,i)=>-hw+2*hw*i/n+(i>0&&i<n?(Krand(i+k*10,seed%3+12)-.5)*.2:0));}));
 const sky={panes:[Vp([[-hw,-.86],[hw,-.86],[hw,-.55],[-hw,-.55]],VJ.ice,Gon(t,H[0],.5),.1,0,'opal'),Vp([[-hw,-.55],[hw,-.55],[hw,-.25],[-hw,-.25]],VJ.cream,Gon(t,H[0]+.1,.5),.2,0,'opal')]};
 const sun={dx:.55,dy:-.52,rot:Vspin(ph,o,.05),panes:[Vp(Gcircle(0,0,.13,26),VJ.gold,Gon(t,H[0]+.2,.5),.5+.3*Vpulse(t,H),0,'seedy'),...Array.from({length:12},(_,i)=>Vp(Gpetal(.15,.25,i*K_TAU/12,.03),VJ.amber,Gon(t,H[0]+.3,.5),.3,0,'cathedral'))]};
 const sea={panes:[]};for(let k=0;k<5;k++){const xs=cuts[k];for(let i=0;i<xs.length-1;i++){const pts=Gband(top(k),top(k+1),xs[i],xs[i+1],8),foam=k%2===0&&i%2===0;
  sea.panes.push(Vp(pts,foam?Kmix(pal[k],'#ffffff',.35):pal[k],Gon(t,H[k]+i*.05,.5),Kclamp(.45*Kbump(((xs[i]+hw)/(2*hw)),((ph.clock*.2)+k*.2)%1.3-.15,.12)+.25*Vpulse(t,[H[k+1]??H[k]])),Gshade(i+k*10,seed),foam?'opal':'cathedral'));}}
 glassWindow(c,w,h,o,[sky,sun,sea],Vview(w,h,ph,o,pal[0],hw,.87));}

// 20 · Gran rosassa de festa: a sixteenfold rose builds layer by layer; at the end a wave of light runs from the centre outwards.
const FEST_PAL=[[VJ.gold,VJ.ruby,VJ.cobalt,VJ.emerald,VJ.magenta,VJ.turq,VJ.orange,VJ.violet],[VJ.amber,VJ.violet,VJ.turq,VJ.ruby,VJ.lime,VJ.cobalt,VJ.rose,VJ.gold],[VJ.lemon,VJ.magenta,VJ.sky,VJ.orange,VJ.emerald,VJ.purple,VJ.ruby,VJ.teal]];
function Vfestival(c,w,h,ph,o){const pal=FEST_PAL[o.seed%3],t=ph.t,H=o.hitT,ch=Vchaser(ph,o,.8),s=d=>Vspin(ph,o,d),last=H[H.length-1],finale=r=>t>=last?Kbump((t-last)*.9,r,.16):0;
 const g=Vcache('festival',()=>({core:[Gcircle(0,0,.07,24)],wedges:Array.from({length:16},(_,i)=>Gsector(.07,.2,i*K_TAU/16,(i+1)*K_TAU/16,4)),petals:Array.from({length:16},(_,i)=>Gpetal(.21,.42,i*K_TAU/16,.072,.85)),
  diamonds:Array.from({length:16},(_,i)=>Gpetal(.43,.53,(i+.5)*K_TAU/16,.035,1)),band:Array.from({length:32},(_,i)=>Gsector(.555,.63,i*K_TAU/32,(i+1)*K_TAU/32,3)),big:Array.from({length:16},(_,i)=>Gpetal(.65,.93,i*K_TAU/16,.085,.85)),
  rounds:Array.from({length:16},(_,i)=>{const a=(i+.5)*K_TAU/16;return Gcircle(Math.cos(a)*.8,Math.sin(a)*.8,.045,16);}),rim:Array.from({length:48},(_,i)=>Gsector(.95,1,i*K_TAU/48,(i+1)*K_TAU/48,2))}));
 const tint=(i,base,speed)=>{const f=ph.clock*speed+i/4,k=Math.floor(f),x=Ksmooth(f-k);return Vblend(pal[(base+k)%8],pal[(base+k+1)%8],x);};
 const L=(list,hit,colorFn,tex,rot,r)=>({rot,tex,panes:list.map((pts,i)=>Vp(pts,colorFn(i),Vr(t,H[hit],i,list.length,.45),Kclamp(.45*Vchase(i*K_TAU/list.length+rot,ch)+.6*finale(r)),Gshade(i+hit*40,o.seed),tex))});
 const layers=[Vground('fest',.95,80,V_DEEP,t,H[0],o.seed,ch),L(g.core,0,()=>Kmix(pal[0],'#ffffff',.5),'opal',0,0),L(g.wedges,0,i=>i%2?pal[0]:pal[6],'cathedral',s(.02),.13),L(g.petals,1,i=>tint(i,1,.2),'cathedral',s(-.025),.32),L(g.diamonds,2,()=>pal[0],'seedy',s(-.025),.48),
  L(g.band,3,i=>i%2?pal[2]:pal[5],'opal',s(.02),.6),L(g.big,4,i=>tint(i,3,.15),'cathedral',s(-.015),.8),L(g.rounds,5,i=>i%2?pal[4]:pal[6],'seedy',s(-.015),.8),L(g.rim,6,i=>pal[(i%3)+1],'cathedral',s(.01),.97)];
 glassWindow(c,w,h,o,layers,Vview(w,h,ph,o,pal[0],1,1,{rays:{colors:V_RAINBOW,a:.045+.05*finale(.5),turn:s(.03),width:.1},glow:{color:pal[0],a:.14+.14*finale(.4),r:1.6}}));}

// steps: grid steps across the evolution; hits: the steps of the visual events; turn: fastest rotation (rad/s), for the ceiling test.
export const VITRALL_ART=Object.freeze([
 {draw:Vrose,steps:16,hits:[0,2,4,6,8,10,12],turn:.03,accent:[VJ.gold,VJ.amber,VJ.turq]},
 {draw:Vsun,steps:16,hits:[0,3,6,9,12],turn:.03,accent:[VJ.gold,VJ.lemon,VJ.amber]},
 {draw:Vmosaic,steps:16,hits:[0,3,6,9,12],turn:0,accent:[VJ.turq,VJ.magenta,VJ.gold]},
 {draw:Vmondrian,steps:16,hits:[0,2,4,6,8,10,12,14],turn:0,accent:[VJ.ruby,VJ.gold,VJ.cobalt]},
 {draw:Vgirih,steps:16,hits:[0,2,4,6,8,10],turn:.018,accent:[VJ.turq,VJ.cobalt,VJ.emerald]},
 {draw:Vflowers,steps:16,hits:[0,3,6,9,12],turn:.02,accent:[VJ.orange,VJ.violet,VJ.gold]},
 {draw:Vfan,steps:16,hits:[0,2,4,6,8,10],turn:0,accent:[VJ.amber,VJ.gold,VJ.orange]},
 {draw:Vlancets,steps:16,hits:[0,4,8,12],turn:.05,accent:[VJ.amber,VJ.gold,VJ.lime]},
 {draw:Vtrencadis,steps:16,hits:[0,2,4,6,8,10],turn:.02,accent:[VJ.ruby,VJ.gold,VJ.cobalt]},
 {draw:Vcolumns,steps:16,hits:[0,3,6,9,12],turn:0,accent:[VJ.teal,VJ.gold,VJ.magenta]},
 {draw:Vmedallions,steps:18,hits:[0,2,4,6,8,10,12,14,16],turn:.06,accent:[VJ.ruby,VJ.magenta,VJ.violet]},
 {draw:Vbottles,steps:16,hits:[0,4,8,12],turn:0,accent:[VJ.amber,VJ.cobalt,VJ.ruby]},
 {draw:Vrainbow,steps:16,hits:[0,2,4,6,8,10,12],turn:0,accent:[VJ.gold,VJ.gold,VJ.gold]},
 {draw:Vleaves,steps:18,hits:[0,2,4,6,8,10,12,14,16],turn:0,accent:[VJ.gold,VJ.lemon,VJ.amber]},
 {draw:Vcompass,steps:16,hits:[0,4,8,12],turn:.03,accent:[VJ.gold,VJ.amber,VJ.lemon]},
 {draw:Vknot,steps:16,hits:[0,3,6,9,12],turn:.03,accent:[VJ.gold,VJ.lime,VJ.rose]},
 {draw:Vcast,steps:16,hits:[0,3,6,9,12],turn:0,accent:[VJ.gold,VJ.amber,VJ.sky]},
 {draw:Vlandscape,steps:16,hits:[0,3,6,9,12],turn:.04,accent:[VJ.gold,VJ.gold,VJ.gold]},
 {draw:Vwaves,steps:16,hits:[0,2,4,6,8,10],turn:.05,accent:[VJ.turq,VJ.sky,VJ.aqua]},
 {draw:Vfestival,steps:16,hits:[0,2,4,6,8,10,12,14],turn:.03,accent:[VJ.gold,VJ.amber,VJ.lemon]}
].map(Object.freeze));

// The twenty paper scenes of Natura (CE23): geometric forms found in nature, cut from coloured paper. Each scene is a function of
// time only, built from the phases of kaleido-base.js and drawn by paper.js.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,KeaseBack,Krand,Kmix,Kbump} from './kaleido-base.js';
import {Gpoly,Gcircle,Gpetal,Gsector,Gvoronoi,Gband,Grot,Gmove,Gscale,Gcentroid} from './glass.js';
import {Pjitter,Ptorn,Pblob,Pleaf,Ppetal,Pring,Pland,Punfold,Pon,Pshadev,paperScene} from './paper.js';

// Coloured papers: bright, clean colours (no faded or brownish tones).
const NC={red:'#f2334a',coral:'#ff6b57',orange:'#ff8c1a',tang:'#ffa62b',gold:'#ffcf2e',lemon:'#fff176',lime:'#a8e04a',leaf:'#4cc95a',green:'#1fae6a',jade:'#12b39a',teal:'#0fa3b1',
 aqua:'#5fd8e8',sky:'#53b6ff',blue:'#2f6bff',cobalt:'#2346d9',indigo:'#3a2fb8',violet:'#7a45e6',purple:'#a53fd6',magenta:'#ea3f9d',pink:'#ff7fb6',blush:'#ffc2dc',
 lilac:'#c9a7ff',mint:'#b8f5d0',ice:'#d9f1ff',white:'#ffffff',navy:'#1b2a8a',plum:'#5a2a9e',forest:'#0f7a4f',sea:'#0b6fa8'};
const N_RAINBOW=[NC.red,NC.orange,NC.gold,NC.lime,NC.leaf,NC.teal,NC.sky,NC.blue,NC.violet,NC.magenta];
const N_CACHE=new Map();
function Ncache(key,make){if(!N_CACHE.has(key))N_CACHE.set(key,make());return N_CACHE.get(key);}
// Scene size: half width and half height in scene units; the scene keeps a margin on every side of the screen.
function Nview(w,h,ph,o,board,hw=1,hh=1,extra={}){const R=Math.min(w*.46/hw,h*.46/hh)*ph.grow;return {cx:w/2,cy:h/2,R,base:o.base,board,light:.95,...extra};}
// A piece of paper.
const NP=(pts,color,extra={})=>({pts,color,...extra});
// Gentle swell after each visual event (rises over a quarter of a second, fades over about a second).
const Npulse=(t,hits,len=.9)=>hits.reduce((m,hh)=>Math.max(m,t>=hh?Math.exp(-(t-hh)/len)*Ksmooth((t-hh)/.25):0),0);
// Slow sway of piece i (leaves in a breeze); smaller with reduced motion.
const Nsway=(ph,o,i,amp=.05,speed=1.1)=>Math.sin(ph.clock*speed+i*1.7)*amp*(o.reduced?.35:1);
const Nturn=(ph,speed)=>ph.motion*speed;
const Nmix=Kmix;

// 1 · Gira-sol: seeds land along the golden angle, then two rings of petals unfold around them.
const NSUN_PAL=[{disc:NC.plum,seeds:[NC.magenta,NC.red,NC.orange,NC.gold],outer:NC.orange,inner:NC.gold,board:NC.cobalt},
 {disc:NC.navy,seeds:[NC.teal,NC.aqua,NC.lime,NC.lemon],outer:NC.magenta,inner:NC.pink,board:NC.violet},
 {disc:NC.forest,seeds:[NC.red,NC.coral,NC.tang,NC.lemon],outer:NC.sky,inner:NC.ice,board:NC.indigo}];
function Nsunflower(c,w,h,ph,o){const pal=NSUN_PAL[o.seed%3],t=ph.t,H=o.hitT,golden=Math.PI*(3-Math.sqrt(5)),N=150;
 const g=Ncache('sun',()=>({seeds:Array.from({length:N},(_,i)=>{const r=.355*Math.sqrt((i+.6)/N),a=i*golden,s=.011+.012*Math.sqrt(i/N);return {x:Math.cos(a)*r,y:Math.sin(a)*r,pts:Pjitter(Gcircle(0,0,s,9),s*.12,i),r:r};}),
  disc:Pjitter(Gcircle(0,0,.39,60),.006,3),outer:Array.from({length:21},(_,i)=>Pleaf(.42,.085,0,12,.05)),inner:Array.from({length:21},(_,i)=>Pleaf(.33,.07,0,12,.05))}));
 const spin=Nturn(ph,.035),pulse=Npulse(t,H),disc=Pland(t,H[0],.55);
 const seeds=g.seeds.map((s,i)=>{const wave=i<50?1:i<100?2:3,l=Pland(t,H[wave]+.5*((i%50)/50),.45);return NP(s.pts,pal.seeds[Math.min(3,Math.floor(s.r/.36*4))],{x:s.x,y:s.y,v:l.v,z:l.z,s:l.s*(1+.15*pulse*Kbump(s.r,.36*Kclamp((t-H[3])/1.2),.06)),j:Pshadev(i,o.seed),tex:'card'});});
 const ring=(list,len,r0,t0,colorA,colorB,off,depth)=>list.map((pts,i)=>{const a=(i+off)*K_TAU/21,f=Punfold(t,t0+.6*i/21,.7),sw=Nsway(ph,o,i,.03,.9);return NP(pts,i%2?colorA:Nmix(colorA,colorB,.35),{x:Math.cos(a)*r0,y:Math.sin(a)*r0,r:a+sw,fold:{a:0,f},v:Pon(t,t0+.6*i/21-.05,.15),z:depth*(1-f),j:Pshadev(i+40,o.seed),tex:'washi',back:Nmix(colorA,'#ffffff',.45)});});
 const view=Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'});
 paperScene(c,w,h,o,[{pieces:ring(g.outer,.42,.3,H[4],pal.outer,NC.red,0,.6),rot:spin,shadow:1.2},{pieces:ring(g.inner,.33,.3,H[5],pal.inner,'#ffffff',.5,.6),rot:spin,shadow:1},
  {pieces:[NP(g.disc,pal.disc,{v:disc.v,z:disc.z,s:disc.s,tex:'pulp'})],rot:spin},{pieces:seeds,rot:spin,shadow:.7,texA:.35}],view);}

// 2 · Espiral de nautilus: chambers of a golden spiral land one after another, from the centre outwards.
const NNAUT_PAL=[{chambers:[NC.red,NC.coral,NC.orange,NC.tang,NC.gold,NC.lime,NC.leaf,NC.jade,NC.teal,NC.sky,NC.blue,NC.violet,NC.purple,NC.magenta,NC.pink],board:NC.teal,rim:NC.white},
 {chambers:[NC.indigo,NC.violet,NC.purple,NC.magenta,NC.pink,NC.coral,NC.orange,NC.tang,NC.gold,NC.lemon,NC.lime,NC.leaf,NC.jade,NC.teal,NC.aqua],board:NC.navy,rim:NC.white},
 {chambers:[NC.forest,NC.green,NC.leaf,NC.lime,NC.lemon,NC.gold,NC.tang,NC.orange,NC.coral,NC.red,NC.magenta,NC.purple,NC.violet,NC.blue,NC.sky],board:NC.plum,rim:NC.white}];
function Nnautilus(c,w,h,ph,o){const pal=NNAUT_PAL[o.seed%3],t=ph.t,H=o.hitT,K=15;
 const g=Ncache('naut',()=>{const b=Math.log(3)/K_TAU,d=K_TAU/9,T0=K_TAU*.9,r=th=>Math.exp(b*th),P=(th,rr)=>[Math.cos(th)*rr,Math.sin(th)*rr];
  // A septum: the curved wall between two chambers, bowed back towards the older chambers.
  const septum=(th,out,k=.22)=>{const r1=r(th),r0=r(th-K_TAU),pts=[];for(let i=0;i<=8;i++){const u=i/8,rr=r1+(r0-r1)*u,bow=Math.sin(Math.PI*u)*(r1-r0)*k;pts.push(P(th-bow/rr,rr));}return out?pts:pts.reverse();};
  const ch=[];for(let k=0;k<K;k++){const t0=T0+k*d,t1=t0+d,pts=[];for(let i=0;i<=10;i++){const th=t0+(t1-t0)*i/10;pts.push(P(th,r(th)));}pts.push(...septum(t1,true,k===K-1?-.05:.22).slice(1));
   for(let i=9;i>=0;i--){const th=t0+(t1-t0)*i/10;pts.push(P(th,r(th-K_TAU)));}pts.push(...septum(t0,false).slice(1,-1));ch.push(pts);}
  // The first whorl, inside everything else.
  const core=[];for(let i=0;i<=30;i++){const th=T0*i/30;core.push(P(th,r(th)));}for(let i=30;i>=0;i--){const th=T0*i/30;core.push(P(th,r(th)*.35));}
  const all=ch.flat(),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),mx=(Math.min(...xs)+Math.max(...xs))/2,my=(Math.min(...ys)+Math.max(...ys))/2,k=1.58/Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));
  const fit=p=>p.map(([x,y])=>[(x-mx)*k,(y-my)*k]);return {ch:ch.map(fit),core:fit(core)};});
 // Chambers land in groups, one group on each visual event.
 const groupOf=k=>Math.min(H.length-1,Math.floor(k*H.length/K)),spin=Nturn(ph,.03),pulse=Npulse(t,H,1.1);
 const pieces=[NP(g.core,pal.chambers[0],{...Pland(t,H[0]-.05,.5),tex:'cotton'})];
 g.ch.forEach((pts,k)=>{const gi=groupOf(k),first=g.ch.findIndex((_,j)=>groupOf(j)===gi),l=Pland(t,H[gi]+.16*(k-first),.5);pieces.push(NP(pts,pal.chambers[k],{...l,j:Pshadev(k,o.seed)*.6,tex:k%2?'cotton':'washi'}));});
 paperScene(c,w,h,o,[{pieces,rot:spin,shadow:1.1,after:(cc,S,u)=>{if(pulse<.02)return;cc.save();cc.globalAlpha=.3*pulse;cc.strokeStyle=pal.rim;cc.lineWidth=u*.01;cc.lineJoin='round';cc.beginPath();for(const p of g.ch){const q=p.map(S);cc.moveTo(q[0][0],q[0][1]);for(const x of q.slice(1,11))cc.lineTo(x[0],x[1]);}cc.stroke();cc.restore();}}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 3 · Floc de neu: a paper snowflake opens arm by arm, then its branches and crystals land on it.
const NSNOW_PAL=[{star:NC.aqua,arm:NC.white,branch:NC.magenta,tip:NC.gold,center:NC.violet,board:NC.cobalt},
 {star:NC.lilac,arm:NC.white,branch:NC.teal,tip:NC.pink,center:NC.blue,board:NC.indigo},
 {star:NC.mint,arm:NC.white,branch:NC.orange,tip:NC.sky,center:NC.magenta,board:NC.navy}];
function Nsnowflake(c,w,h,ph,o){const pal=NSNOW_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('snow',()=>{const star=[];for(let i=0;i<12;i++){const a=i*Math.PI/6-Math.PI/2,r=i%2?.32:.86;star.push([Math.cos(a)*r,Math.sin(a)*r]);}
  const diamond=(l,wd)=>[[0,0],[l*.5,-wd],[l,0],[l*.5,wd]];
  return {star,arm:diamond(.8,.05),branch:[.28,.46,.62].map((d,i)=>({d,pts:diamond(.23-.045*i,.022)})),tip:Gpoly(6,.05,0),center:Gpoly(6,.13,Math.PI/6),ring:Gpoly(6,.2,0)};});
 const spin=Nturn(ph,.03),pulse=Npulse(t,H,1),star=Punfold(t,H[0],.8);
 const back=[NP(g.star,pal.star,{fold:{a:Math.PI/2,f:star},v:Pon(t,H[0]-.05,.15),tex:'washi',back:Nmix(pal.star,'#ffffff',.4)})];
 const arms=[],branches=[],tips=[];
 for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,f=Punfold(t,H[1]+.12*i,.6),sw=Nsway(ph,o,i,.015,.8);
  arms.push(NP(g.arm,pal.arm,{r:a+sw,fold:{a:0,f},v:Pon(t,H[1]+.12*i-.05,.12),z:.6*(1-f),tex:'washi'}));
  g.branch.forEach((b,k)=>{for(const side of [-1,1]){const l=Pland(t,H[2+k]+.06*i,.45),x=Math.cos(a+sw)*b.d,y=Math.sin(a+sw)*b.d;branches.push(NP(b.pts,k===1?pal.tip:pal.branch,{x,y,r:a+sw+side*Math.PI*.28,...l,j:Pshadev(i*6+k,o.seed),tex:'card'}));}});
  const l=Pland(t,H[5]+.08*i,.5);tips.push(NP(g.tip,pal.tip,{x:Math.cos(a)*.86,y:Math.sin(a)*.86,r:a,...l,s:l.s*(1+.2*pulse),tex:'card'}));}
 const cl=Pland(t,H[0]+.1,.5),rl=Pland(t,H[4],.5);
 paperScene(c,w,h,o,[{pieces:back,rot:spin,shadow:1.2},{pieces:arms,rot:spin,shadow:1},{pieces:[NP(g.ring,pal.branch,{...rl,tex:'card'}),...branches],rot:spin,shadow:.8},
  {pieces:[NP(g.center,pal.center,{...cl,s:cl.s*(1+.15*pulse),tex:'card'}),...tips],rot:spin,shadow:.8}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 4 · Falguera: three croziers uncurl one after another and open their leaflets; small new croziers wait at the base.
const NFERN_PAL=[{stems:[NC.green,NC.leaf,NC.jade],young:NC.gold,board:NC.plum},{stems:[NC.teal,NC.jade,NC.leaf],young:NC.pink,board:NC.navy},{stems:[NC.leaf,NC.lime,NC.green],young:NC.coral,board:NC.indigo}];
// Centre line of a frond: the tip curls into a spiral while it is young (u = 0) and opens into a gentle arch (u = 1).
function NfernLine(u,L,n,side){const out=[];let x=0,y=0,a=-Math.PI/2;const ds=L/n;for(let i=0;i<=n;i++){const s=i/n;out.push([x,y,a,s]);const k=side*(.55+(1-u)*15*Math.pow(s,1.6))/L;a+=k*ds;x+=Math.cos(a)*ds;y+=Math.sin(a)*ds;}return out;}
// A strip of paper along a line: half width wd at the base, narrowing towards the tip.
function Nstrip(line,wd,tip=.25){const L=line.map(([x,y,a,s])=>[x-Math.sin(a)*wd*(1-(1-tip)*s),y+Math.cos(a)*wd*(1-(1-tip)*s)]),R=line.map(([x,y,a,s])=>[x+Math.sin(a)*wd*(1-(1-tip)*s),y-Math.cos(a)*wd*(1-(1-tip)*s)]);return L.concat(R.reverse());}
function Nfern(c,w,h,ph,o){const pal=NFERN_PAL[o.seed%3],t=ph.t,H=o.hitT,leaf=Ncache('fernleaf',()=>Pleaf(1,.3,0,10,.04)),n=16;
 const fronds=[{x:0,y:.78,rot:-.04,L:1.42,side:1,t0:H[0],col:0},{x:-.1,y:.78,rot:-.62,L:1.0,side:-1,t0:H[1],col:1},{x:.1,y:.78,rot:.62,L:1.0,side:1,t0:H[2],col:2}];
 const stems=[],leaves=[];
 fronds.forEach((f,fi)=>{const u=KeaseOut(Kclamp((t-f.t0)/2.4)),line=NfernLine(u,f.L,n,f.side),sw=Nsway(ph,o,fi,.025,.7),co=Math.cos(f.rot+sw),si=Math.sin(f.rot+sw),P=([x,y,a,s])=>[f.x+x*co-y*si,f.y+x*si+y*co,a+f.rot+sw,s],ln=line.map(P),vis=Pon(t,f.t0-.05,.2);
  const col=pal.stems[f.col];stems.push(NP(Nstrip(ln,.016),Nmix(col,'#000000',.15),{v:vis,tex:'card'}));
  for(let i=2;i<n;i++){const [x,y,a,s]=ln[i],grow=Kclamp((u-s*.55)/.45),len=.27*Math.pow(1-s,.7)*(.15+.85*KeaseBack(grow));if(len<.008)continue;
   for(const side of [-1,1])leaves.push(NP(leaf,Nmix(i%2?col:Nmix(col,'#ffffff',.18),pal.young,.55*Math.pow(s,1.5)),{x,y,r:a+side*(1.15-.35*s)+Nsway(ph,o,i+fi*7,.06,1.3),s:len,v:vis*Pon(t,f.t0+.2,.3),j:Pshadev(i*2+side+fi*40,o.seed)*.5,tex:'washi'}));}});
 // Young croziers at the base, still curled.
 const young=[-.36,.34,-.2].map((x,i)=>{const l=Pland(t,H[3+i],.5),line=NfernLine(.05,.3,10,i%2?-1:1).map(([px,py,a,s])=>[x+px,.8+py,a,s]);return NP(Nstrip(line,.02,.6),pal.young,{...l,tex:'card'});});
 paperScene(c,w,h,o,[{pieces:young,shadow:.8},{pieces:stems,shadow:.9},{pieces:leaves,shadow:.8,texA:.4}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 5 · Dent de lleó: a sphere of seeds opens from the centre; then some seeds let go and float away.
const NDAND_PAL=[{tufts:[NC.white,NC.blush,NC.ice,NC.lemon,NC.mint,NC.lilac],disc:NC.gold,stem:NC.leaf,board:NC.blue},
 {tufts:[NC.white,NC.lemon,NC.pink,NC.aqua,NC.lime,NC.blush],disc:NC.orange,stem:NC.green,board:NC.violet},
 {tufts:[NC.white,NC.ice,NC.lilac,NC.mint,NC.blush,NC.gold],disc:NC.magenta,stem:NC.jade,board:NC.sea}];
function Ndandelion(c,w,h,ph,o){const pal=NDAND_PAL[o.seed%3],t=ph.t,H=o.hitT,N=56;
 const g=Ncache('dand',()=>{const golden=Math.PI*(3-Math.sqrt(5)),tuft=[];for(let i=0;i<16;i++){const a=i*K_TAU/16,r=i%2?.02:.095;tuft.push([Math.cos(a)*r,Math.sin(a)*r]);}
  const seeds=Array.from({length:N},(_,i)=>{const z=1-2*(i+.5)/N,rr=Math.sqrt(1-z*z),a=i*golden;return {x:Math.cos(a)*rr,y:Math.sin(a)*rr,z,a};});
  return {tuft,seeds,disc:Pjitter(Gcircle(0,0,.075,20),.004,5)};});
 const cy=-.1,R0=.6,stalkCol=Nmix(pal.board,'#ffffff',.38),back=[],front=[],fly=[];
 g.seeds.forEach((sd,i)=>{const wave=1+Math.floor(i*3/N),l=Pland(t,H[wave]+.5*((i*7)%N)/N,.5),len=R0*Math.hypot(sd.x,sd.y)*(.2+.8*KeaseOut(Kclamp((t-H[wave])/.8))),ang=Math.atan2(sd.y,sd.x);
  const flying=i%5===2&&t>H[4],dt=flying?t-H[4]-.1*(i%3):0,drift=dt>0?dt:0,fx=drift*.09*(1+.3*Math.sin(i)),fy=-drift*.13,wob=Nsway(ph,o,i,.05,1.6)*Kclamp(drift);
  const tx=Math.cos(ang)*len+fx+wob,ty=cy+Math.sin(ang)*len+fy,list=sd.z<0?back:front;
  if(!flying||drift<=0)list.push(NP([[0,-.004],[len,-.0025],[len,.0025],[0,.004]],stalkCol,{y:cy,r:ang,v:l.v*.9,tex:'card'}));
  (flying?fly:list).push(NP(g.tuft,pal.tufts[i%pal.tufts.length],{x:tx,y:ty,r:ang+Nsway(ph,o,i,.15,1)+drift*.6,s:l.s*(.75+.35*(sd.z+1)/2),v:l.v*(1-Kclamp((drift-2.2)/1.2)),z:Math.max(l.z,.3*Kclamp(drift)),tex:'washi'}));});
 const stem=Nstrip([[0,cy+.05,Math.PI/2,0],[0,1.0,Math.PI/2,1]].map(([x,y,a,s])=>[x,y,a,s]),.018,.9),leafs=[[-1,.8],[1,.7]].map(([side,y],i)=>NP(Ptorn(Pleaf(.42,.09,side<0?Math.PI*1.18:-Math.PI*.18,12,.1),.012,7+i),pal.stem,{x:0,y,...Pland(t,H[0]+.1*i,.5),tex:'card'}));
 const dl=Pland(t,H[0],.5);
 paperScene(c,w,h,o,[{pieces:[NP(stem,pal.stem,{v:Pon(t,H[0]-.05,.3),tex:'card'}),...leafs],shadow:.8},{pieces:back,shadow:.6,texA:.3},{pieces:[NP(g.disc,pal.disc,{...dl,y:cy,tex:'pulp'})],shadow:.8},{pieces:front,shadow:.7,texA:.3},{pieces:fly,shadow:1.2,texA:.3}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 6 · Bresca: wax cells appear ring by ring from the centre; then they fill with honey and pollen of many colours.
const NHONEY_PAL=[{wall:NC.lemon,honey:[NC.gold,NC.tang,NC.orange,NC.tang],pollen:[NC.magenta,NC.sky,NC.lime,NC.coral],board:NC.violet},
 {wall:NC.gold,honey:[NC.orange,NC.tang,NC.coral,NC.tang],pollen:[NC.blue,NC.pink,NC.leaf,NC.lilac],board:NC.forest},
 {wall:NC.lemon,honey:[NC.tang,NC.gold,NC.orange,NC.gold],pollen:[NC.red,NC.teal,NC.purple,NC.lime],board:NC.navy}];
function Nhoney(c,w,h,ph,o){const pal=NHONEY_PAL[o.seed%3],t=ph.t,H=o.hitT,S=.112;
 const g=Ncache('honey',()=>{const cells=[];for(let q=-4;q<=4;q++)for(let r=-4;r<=4;r++){const s=-q-r;if(Math.max(Math.abs(q),Math.abs(r),Math.abs(s))>4)continue;const x=S*Math.sqrt(3)*(q+r/2),y=S*1.5*r;cells.push({x,y,ring:Math.max(Math.abs(q),Math.abs(r),Math.abs(s)),a:Math.atan2(y,x)});}
  const hex=k=>Gpoly(6,S*k,Math.PI/6),ring=[...hex(.98),hex(.98)[0],...hex(.74).concat([hex(.74)[0]]).reverse()];return {cells,ring,inner:hex(.74),cap:hex(.6)};});
 const spin=Nturn(ph,.025),pulse=Npulse(t,H),walls=[],fills=[];
 g.cells.forEach((cl,i)=>{const ring=cl.ring,t0=H[Math.min(3,Math.max(0,ring-1))]+.06*((cl.a+Math.PI)/K_TAU)*Math.max(1,ring),l=Pland(t,t0,.45);
  walls.push(NP(g.ring,Nmix(pal.wall,'#ffffff',.12*Pshadev(i,o.seed)),{x:cl.x,y:cl.y,...l,tex:'card'}));
  const isPollen=Krand(i,o.seed%3+7)<.2,col=isPollen?pal.pollen[i%pal.pollen.length]:pal.honey[i%pal.honey.length],t1=H[4]+.04*ring+.15*Krand(i,3),fl=Pland(t,t1,.5);
  fills.push(NP(Pjitter(g.inner,S*.03,i),col,{x:cl.x,y:cl.y,...fl,s:fl.s*(1+.08*pulse*(isPollen?1:0)),j:Pshadev(i+90,o.seed)*.6,tex:isPollen?'pulp':'cotton'}));
  if(!isPollen&&i%3===0){const cap=Pland(t,H[5]+.03*i%1,.45);fills.push(NP(g.cap,Nmix(col,'#ffffff',.35),{x:cl.x,y:cl.y,...cap,tex:'cotton'}));}});
 paperScene(c,w,h,o,[{pieces:fills,rot:spin,shadow:.6,texA:.45},{pieces:walls,rot:spin,shadow:.9}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 7 · Romanesco: cone-shaped florets grow along Fibonacci spirals; their colours reveal the spirals.
const NROM_PAL=[{fam:8,cols:[NC.lime,NC.leaf,NC.lemon,NC.green,NC.jade,NC.lime,NC.gold,NC.leaf],board:NC.purple},
 {fam:13,cols:[NC.aqua,NC.teal,NC.mint,NC.sky,NC.jade,NC.blue,NC.aqua,NC.lime,NC.teal,NC.mint,NC.sky,NC.jade,NC.leaf],board:NC.magenta},
 {fam:5,cols:[NC.gold,NC.orange,NC.lemon,NC.coral,NC.tang],board:NC.cobalt}];
function Nromanesco(c,w,h,ph,o){const pal=NROM_PAL[o.seed%3],t=ph.t,H=o.hitT,N=89;
 const g=Ncache('rom',()=>{const golden=Math.PI*(3-Math.sqrt(5));return Array.from({length:N},(_,i)=>{const r=.8*Math.sqrt((i+.5)/N),a=i*golden,s=.06+.1*r;return {x:Math.cos(a)*r,y:Math.sin(a)*r,s,a,r,cone:Pjitter(Gpoly(9,1,a),.05,i),mid:Pjitter(Gpoly(9,.66,a+.3),.05,i+300),top:Gpoly(7,.3,a)};}).reverse();});
 const spin=Nturn(ph,.03),pulse=Npulse(t,H),cones=[],mids=[],tops=[];
 // The spiral highlight: one family of spirals at a time catches the light after each visual event.
 const lit=Math.floor(Kclamp((t-H[3])/Math.max(.1,H[H.length-1]-H[3]+1))*pal.fam);
 g.forEach((f,k)=>{const i=N-1-k,wave=Math.min(2,Math.floor(i*3/N)),l=Pland(t,H[wave]+.7*((i%30)/30),.5),col=pal.cols[i%pal.fam],glow=t>H[3]&&i%pal.fam===lit%pal.fam?pulse:0;
  const base={x:f.x,y:f.y,...l,s:l.s*f.s*(1+.08*glow)};cones.push(NP(f.cone,Nmix(col,'#000000',.22),{...base,tex:'card'}));mids.push(NP(f.mid,Nmix(col,'#ffffff',.08+.3*glow),{...base,x:f.x-f.s*.12,y:f.y-f.s*.14,tex:'card'}));tops.push(NP(f.top,Nmix(col,'#ffffff',.45+.3*glow),{...base,x:f.x-f.s*.2,y:f.y-f.s*.24,tex:'cotton'}));});
 // Draw from the edge to the centre: the inner florets stand higher.
 const pieces=[];for(let k=0;k<N;k++)pieces.push(cones[k],mids[k],tops[k]);
 paperScene(c,w,h,o,[{pieces,rot:spin,shadow:.8,texA:.35}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 8 · Rodanxes de cítrics: slices of orange, lemon, lime and grapefruit land and turn slowly, segment by segment.
const NCIT=[{rind:NC.orange,pith:NC.white,flesh:NC.tang},{rind:NC.gold,pith:NC.white,flesh:NC.lemon},{rind:NC.leaf,pith:NC.mint,flesh:NC.lime},{rind:NC.coral,pith:NC.blush,flesh:NC.pink},{rind:NC.red,pith:NC.blush,flesh:NC.coral}];
const NCITRUS_PAL=[{order:[0,1,2,3,4],board:NC.sky},{order:[3,0,4,1,2],board:NC.teal},{order:[1,4,0,2,3],board:NC.violet}];
function Ncitrus(c,w,h,ph,o){const pal=NCITRUS_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('cit',()=>{const n=10,seg=Array.from({length:n},(_,i)=>{const a0=i*K_TAU/n+.05,a1=(i+1)*K_TAU/n-.05,pts=[];for(let j=0;j<=8;j++){const a=a0+(a1-a0)*j/8;pts.push([Math.cos(a)*.78,Math.sin(a)*.78]);}
  // Rounded inner end of each segment.
  const am=(a0+a1)/2;pts.push([Math.cos(am)*.1+Math.cos(am+Math.PI/2)*.02,Math.sin(am)*.1+Math.sin(am+Math.PI/2)*.02],[Math.cos(am)*.08,Math.sin(am)*.08],[Math.cos(am)*.1-Math.cos(am+Math.PI/2)*.02,Math.sin(am)*.1-Math.sin(am+Math.PI/2)*.02]);return pts;});
  return {rind:Pjitter(Gcircle(0,0,1,64),.008,1),pith:Gcircle(0,0,.9,64),seg,core:Gcircle(0,0,.07,16),seeds:[0,1,2].map(k=>Pleaf(.07,.025,k*K_TAU/3+.4,6,0))};});
 const slices=[{x:0,y:0,r:.46},{x:-.52,y:-.46,r:.28},{x:.52,y:-.46,r:.28},{x:-.52,y:.46,r:.28},{x:.52,y:.46,r:.28}];
 const layers=[];
 slices.forEach((sl,k)=>{const fr=NCIT[pal.order[k]],t0=H[k===0?0:k],l=Pland(t,t0,.55),turn=(k%2?-1:1)*Nturn(ph,.04)+k,pulse=Npulse(t,[H[k===0?5:k]],1),pieces=[];
  const base={x:sl.x,y:sl.y,v:l.v,z:l.z};const S=sl.r*l.s;
  pieces.push(NP(g.rind,fr.rind,{...base,s:S,r:turn,tex:'card'}),NP(g.pith,fr.pith,{...base,s:S,r:turn,tex:'cotton'}));
  g.seg.forEach((p,i)=>{const sv=Pland(t,t0+.25+.06*i,.4);pieces.push(NP(p,Nmix(fr.flesh,i%2?'#ffffff':fr.rind,.12+.12*pulse*(i%2)),{...base,v:l.v*sv.v,z:Math.max(l.z,sv.z),s:S*sv.s,r:turn,j:Pshadev(i+k*10,o.seed)*.5,tex:'pulp'}));});
  pieces.push(NP(g.core,fr.pith,{...base,s:S,r:turn,tex:'cotton'}));
  layers.push({pieces,shadow:1.1,texA:.45});});
 paperScene(c,w,h,o,layers,Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 9 · Nervis d'una fulla: a big leaf lands, its main vein grows from the stalk to the tip, then the side veins branch out pair by pair.
const NVEIN_PAL=[{leaf:NC.leaf,half:NC.green,vein:NC.lemon,drop:NC.ice,board:NC.pink},{leaf:NC.orange,half:NC.red,vein:NC.gold,drop:NC.ice,board:NC.teal},{leaf:NC.gold,half:NC.tang,vein:NC.white,drop:NC.ice,board:NC.violet}];
function Nveins(c,w,h,ph,o){const pal=NVEIN_PAL[o.seed%3],t=ph.t,H=o.hitT,A=-Math.PI/4;
 const g=Ncache('vein',()=>{const L=1.55,leafPts=(side)=>{const pts=[[0,0]];for(let i=1;i<=24;i++){const u=i/24,w=.36*Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.95)*(1+.06*Math.sin(u*40));pts.push([u*L,side*w]);}pts.push([L,0]);return pts;};
  return {L,upper:leafPts(-1),lower:leafPts(1),pairs:[.14,.26,.38,.5,.62,.74,.85].map((u,i)=>({u,len:.36*Math.sin(Math.PI*Math.pow(u,.8))*1.1}))};});
 const sw=Nsway(ph,o,0,.03,.6),rot=A+sw,ox=-.55,oy=.55,co=Math.cos(rot),si=Math.sin(rot),P=(x,y)=>[ox+x*co-y*si,oy+x*si+y*co];
 const leaf=Pland(t,H[0],.6),grow=KeaseOut(Kclamp((t-H[1])/1.2)),pieces=[NP(g.upper,pal.leaf,{x:ox,y:oy,r:rot,...leaf,tex:'cotton'}),NP(g.lower,pal.half,{x:ox,y:oy,r:rot,...leaf,tex:'cotton'})];
 const veins=[];const strip=(x0,y0,a,len,wd)=>{const c0=Math.cos(a),s0=Math.sin(a),n0=[-s0*wd,c0*wd];return [[x0+n0[0],y0+n0[1]],[x0+c0*len+n0[0]*.2,y0+s0*len+n0[1]*.2],[x0+c0*len-n0[0]*.2,y0+s0*len-n0[1]*.2],[x0-n0[0],y0-n0[1]]];};
 const stalk=Pland(t,H[0],.6);veins.push(NP(strip(-.25,0,0,.27,.02),pal.vein,{x:ox,y:oy,r:rot,v:stalk.v,tex:'card'}));
 if(grow>0)veins.push(NP(strip(0,0,0,g.L*grow,.016),pal.vein,{x:ox,y:oy,r:rot,v:Pon(t,H[1]-.05,.1),tex:'card'}));
 g.pairs.forEach((p,i)=>{const t0=H[2+Math.floor(i*4/7)]+.12*(i%2),gr=KeaseOut(Kclamp((t-t0)/.7));if(gr<=0)return;for(const side of [-1,1])veins.push(NP(strip(p.u*g.L,0,side*.75,p.len*gr,.009),pal.vein,{x:ox,y:oy,r:rot,v:Pon(t,t0-.03,.1),tex:'card'}));});
 // Dew drops on the leaf catch the light.
 const drops=[[.55,-.12,.05],[1.05,.1,.04],[.8,-.2,.03],[1.3,-.05,.035]].map(([x,y,r],i)=>{const l=Pland(t,H[5]+.15*i,.5),[px,py]=P(x,y);return [NP(Gcircle(0,0,r,20),pal.drop,{x:px,y:py,...l,tex:'cotton'}),NP(Gcircle(0,0,r*.35,10),'#ffffff',{x:px-r*.3,y:py-r*.3,v:l.v,tex:'cotton'})];}).flat();
 paperScene(c,w,h,o,[{pieces,shadow:1.2},{pieces:veins,shadow:.6,edge:false},{pieces:drops,shadow:.8}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 10 · Arbre en flor: a tree grows branch by branch (each fork splits in two) and flowers open at every tip.
const NTREE_PAL=[{wood:NC.plum,blossom:[NC.pink,NC.white,NC.magenta,NC.blush],hill:NC.leaf,hill2:NC.green,sky:NC.sky},
 {wood:NC.indigo,blossom:[NC.gold,NC.lemon,NC.orange,NC.white],hill:NC.lime,hill2:NC.leaf,sky:NC.violet},
 {wood:NC.navy,blossom:[NC.coral,NC.white,NC.pink,NC.lemon],hill:NC.jade,hill2:NC.teal,sky:NC.aqua}];
function Ntree(c,w,h,ph,o){const pal=NTREE_PAL[o.seed%3],t=ph.t,H=o.hitT,D=7;
 const g=Ncache('tree'+o.seed%3,()=>{const segs=[],tips=[];const grow=(x,y,a,len,wd,d,id)=>{const x1=x+Math.cos(a)*len,y1=y+Math.sin(a)*len;segs.push({x,y,a,len,wd,d,id});if(d===D-1){tips.push({x:x1,y:y1,a,id});return;}
   const spread=.3+.25*Krand(id,o.seed%3+5),bias=(Krand(id+50,o.seed%3+5)-.5)*.3,k1=.7+.14*Krand(id+70,o.seed%3+5),k2=.7+.14*Krand(id+90,o.seed%3+5);grow(x1,y1,a-spread+bias,len*k1,wd*.66,d+1,id*2+1);grow(x1,y1,a+spread+bias,len*k2,wd*.66,d+1,id*2+2);};
  grow(0,.66,-Math.PI/2,.4,.1,0,0);return {segs,tips,hill:Gband(x=>.55+.06*Math.sin(x*2.2),()=>1,-1.5,1.5,30),hill2:Gband(x=>.7+.05*Math.sin(x*3+1),()=>1,-1.5,1.5,30),flower:Array.from({length:5},(_,i)=>Ppetal(0,.05,i*K_TAU/5,.028,8))};});
 const level=d=>d<H.length-1?H[d]:H[H.length-2]+.45*(d-H.length+2),pieces=[],blooms=[],sway=d=>Nsway(ph,o,d,.012*d,.8);
 for(const s of g.segs){const gr=KeaseOut(Kclamp((t-level(s.d))/.7));if(gr<=0)continue;const a=s.a+sway(s.d),len=s.len*gr,c0=Math.cos(a),s0=Math.sin(a),w0=s.wd/2,w1=s.wd*.68/2;
  pieces.push(NP([[s.x-s0*w0,s.y+c0*w0],[s.x+c0*len-s0*w1,s.y+s0*len+c0*w1],[s.x+c0*len+s0*w1,s.y+s0*len-c0*w1],[s.x+s0*w0,s.y-c0*w0]],Nmix(pal.wood,'#ffffff',.06*s.d),{tex:'card'}));}
 g.tips.forEach((tp,i)=>{const t0=H[H.length-1]-.4+.9*Krand(i,o.seed%3+9)+(i%2?0:.3),l=Pland(t,Math.min(t0,ph.settleAt-.3),.45),col=pal.blossom[i%pal.blossom.length],turn=Krand(i,4)*K_TAU+Nsway(ph,o,i,.2,.7);
  for(const p of g.flower)blooms.push(NP(p,col,{x:tp.x,y:tp.y,r:turn,...l,s:l.s*(1.25+.6*Krand(i,7)),tex:'washi'}));blooms.push(NP(Gcircle(0,0,.014,8),NC.gold,{x:tp.x,y:tp.y,...l,tex:'card'}));});
 const hills=[NP(Ptorn(g.hill,.012,3,.04),pal.hill,{...Pland(t,H[0]-.1,.5),rim:.008,tex:'card'}),NP(Ptorn(g.hill2,.012,4,.04),pal.hill2,{...Pland(t,H[0]+.05,.5),rim:.008,tex:'card'})];
 paperScene(c,w,h,o,[{pieces:[hills[0]],shadow:1},{pieces,shadow:.8},{pieces:[hills[1]],shadow:1},{pieces:blooms,shadow:.7,texA:.35}],Nview(w,h,ph,o,{pts:[[-1.5,-1],[1.5,-1],[1.5,1],[-1.5,1]],color:pal.sky,tex:'pulp'},1.5,1,{clip:true}));}


// 11 · Gotes a l'estany: drops fall on a pond among lily pads and draw a few rings each; at the end a water lily opens.
const NPOND_PAL=[{water:NC.teal,ripple:NC.aqua,pads:[NC.leaf,NC.lime,NC.green,NC.jade],lily:[NC.pink,NC.blush,NC.white],heart:NC.gold},
 {water:NC.sea,ripple:NC.sky,pads:[NC.lime,NC.leaf,NC.jade,NC.green],lily:[NC.white,NC.lemon,NC.ice],heart:NC.orange},
 {water:NC.cobalt,ripple:NC.aqua,pads:[NC.jade,NC.leaf,NC.lime,NC.mint],lily:[NC.magenta,NC.pink,NC.blush],heart:NC.lemon}];
function Npond(c,w,h,ph,o){const pal=NPOND_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('pond',()=>({pads:[[-.4,.3,.32,.6],[.36,-.38,.27,2.2],[.46,.4,.22,4],[-.48,-.36,.2,1],[.02,.66,.16,5.3],[-.06,-.66,.15,3.4],[.74,0,.16,0],[-.78,-.02,.13,2.8],[.12,-.02,.1,1.7]].map(([x,y,r,a],i)=>({x,y,r,pts:Pjitter(Gsector(0,1,a+.22,a+K_TAU-.22,30),.01,i)})),
  drops:[[.1,-.1],[-.3,.05],[.3,.15],[-.05,.3],[.2,-.25]],lily:[0,1,2].map(k=>Array.from({length:8},(_,i)=>Gpetal(0,.27-.06*k,i*K_TAU/8+k*.2,.07-.01*k,1.1,8)))}));
 const pads=g.pads.map((p,i)=>{const l=Pland(t,H[0]+.09*i,.5);return NP(p.pts,pal.pads[i%4],{x:p.x,y:p.y+Nsway(ph,o,i,.01,.7),r:Nsway(ph,o,i+3,.06,.5),...l,s:l.s*p.r,j:Pshadev(i,o.seed)*.6,tex:'card'});});
 // Each drop draws two rings that widen and fade; at most four rings are on the water at once.
 const rings=[];g.drops.forEach(([x,y],k)=>{const t0=H[Math.min(H.length-2,k+1)]||H[1];for(let j=0;j<2;j++){const age=t-t0-.35*j;if(age<0||age>1.9)continue;const rr=.05+.2*age;rings.push(NP(Pring(rr-.014,rr,40),pal.ripple,{x,y,v:(1-age/1.9)*Ksmooth(age/.15),tex:'cotton'}));}
  const d=Pland(t,t0-.15,.25);if(t<t0+.5)rings.push(NP(Gcircle(0,0,.03,12),NC.white,{x,y,v:d.v*(1-Kclamp((t-t0)/.5)),z:d.z,tex:'cotton'}));});
 const lily=[];const lp=g.pads[0];g.lily.forEach((ring,k)=>ring.forEach((p,i)=>{const f=Punfold(t,H[H.length-1]+.15*k+.03*i,.6);lily.push(NP(p,pal.lily[k],{x:lp.x,y:lp.y,fold:{a:i*K_TAU/8+k*.2,f},v:Pon(t,H[H.length-1]+.15*k-.05,.1),z:.5*(1-f),tex:'washi'}));}));
 lily.push(NP(Gcircle(0,0,.045,12),pal.heart,{x:lp.x,y:lp.y,...Pland(t,H[H.length-1]+.5,.4),tex:'card'}));
 paperScene(c,w,h,o,[{pieces:rings,shadow:.4,edge:false},{pieces:pads,shadow:1},{pieces:lily,shadow:.9}],Nview(w,h,ph,o,{r:1.0,color:pal.water,tex:'washi',texA:.4}));}

// 12 · Dunes al capvespre: torn-paper bands of sky, a rising sun and waves of dunes, from the back to the front.
const NDUNE_PAL=[{sky:[NC.violet,NC.magenta,NC.coral,NC.tang],sun:NC.gold,dunes:[NC.pink,NC.coral,NC.orange,NC.red]},
 {sky:[NC.sky,NC.aqua,NC.mint,NC.lemon],sun:NC.white,dunes:[NC.gold,NC.tang,NC.orange,NC.coral]},
 {sky:[NC.indigo,NC.violet,NC.lilac,NC.blush],sun:NC.lemon,dunes:[NC.blush,NC.pink,NC.magenta,NC.purple]}];
function Ndunes(c,w,h,ph,o){const pal=NDUNE_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('dunes',()=>({sky:[0,1,2,3].map(k=>Ptorn(Gband(x=>-1+.3*k+.03*Math.sin(x*3+k),()=>.4,-1.5,1.5,20),.012,20+k,.05)),
  dunes:[0,1,2,3].map(k=>Ptorn(Gband(x=>.08+.16*k+.09*Math.sin(x*(1.6+.4*k)+k*1.3)+.05*Math.sin(x*4+k),()=>1,-1.5,1.5,40),.008,30+k,.04)),
  ripples:[0,1,2].map(k=>Gband(x=>.78+.07*k+.025*Math.sin(x*5+k),x=>.79+.07*k+.025*Math.sin(x*5+k),-1.3+.2*k,1.1-.2*k,30))}));
 const sky=g.sky.map((p,k)=>NP(p,pal.sky[k],{...Pland(t,H[0]+.12*k,.55),rim:.006,tex:'washi'}));
 const rise=KeaseOut(Kclamp((t-H[1])/3)),sun=NP(Gcircle(0,0,.26,48),pal.sun,{y:.42-.36*rise,v:Pon(t,H[1]-.1,.4),tex:'cotton'});
 const dunes=g.dunes.map((p,k)=>NP(p,pal.dunes[k],{...Pland(t,H[2+k]||H[H.length-1],.6),x:Nsway(ph,o,k,.01,.3),rim:.007,j:k*.15,tex:'cotton'}));
 const rip=g.ripples.map((p,k)=>NP(p,Nmix(pal.dunes[3],'#ffffff',.3),{v:Pon(t,(H[5]||H[H.length-1])+.15*k,.4)*.8,tex:'card'}));
 const board={pts:[[-1.5,-1],[1.5,-1],[1.5,1],[-1.5,1]],color:pal.sky[0],tex:'pulp'};
 paperScene(c,w,h,o,[{pieces:sky,shadow:.8},{pieces:[sun],shadow:.6},...dunes.map(d=>({pieces:[d],shadow:1})),{pieces:rip,shadow:.3,edge:false}],Nview(w,h,ph,o,board,1.5,1,{clip:true}));}

// 13 · Branca d'ametller: blossoms open one after another along a branch; at the end a few petals drift down.
const NALM_PAL=[{wood:NC.plum,petals:[NC.white,NC.blush,NC.pink],heart:NC.magenta,bud:NC.pink,board:NC.sky},
 {wood:NC.indigo,petals:[NC.lemon,NC.white,NC.gold],heart:NC.orange,bud:NC.tang,board:NC.teal},
 {wood:NC.navy,petals:[NC.blush,NC.lilac,NC.white],heart:NC.purple,bud:NC.lilac,board:NC.leaf}];
function Nalmond(c,w,h,ph,o){const pal=NALM_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('alm',()=>{const line=(pts)=>pts.map((p,i)=>{const q=pts[Math.min(i+1,pts.length-1)],r=pts[Math.max(i-1,0)],a=Math.atan2(q[1]-r[1],q[0]-r[0]);return [p[0],p[1],a,i/(pts.length-1)];});
  const main=line([[-1.0,.62],[-.6,.42],[-.2,.28],[.2,.05],[.55,-.18],[.85,-.42]]),tw1=line([[-.35,.33],[-.38,.05],[-.3,-.22]]),tw2=line([[.25,.02],[.42,.28],[.58,.42]]),tw3=line([[.55,-.18],[.5,-.5],[.62,-.7]]);
  return {main,tw:[tw1,tw2,tw3],petal:Ppetal(.02,.2,0,.1,10,.35),spots:[[-.62,.42],[-.36,.05],[-.28,-.24],[-.05,.18],[.2,.05],[.44,.3],[.6,.44],[.5,-.48],[.64,-.7],[.86,-.42],[.32,-.06]]};});
 const sw=Nsway(ph,o,0,.012,.5),wood=[NP(Nstrip(g.main,.055,.3),pal.wood,{r:sw,v:Pon(t,H[0]-.05,.3),tex:'card'}),...g.tw.map((tw,i)=>NP(Nstrip(tw,.022,.35),pal.wood,{r:sw,v:Pon(t,H[0]+.1*i,.3),tex:'card'}))];
 const flowers=[];g.spots.forEach(([x,y],i)=>{const t0=H[1+Math.floor(i*(H.length-1)/g.spots.length)]+.15*(i%2),col=pal.petals[i%3],co=Math.cos(sw),si=Math.sin(sw),X=x*co-y*si,Y=x*si+y*co,turn=Krand(i,8)*K_TAU;
  if(i%4===3){const l=Pland(t,t0,.4);flowers.push(NP(Pleaf(.09,.04,-Math.PI/2+turn*.2,8,0),pal.bud,{x:X,y:Y,...l,tex:'card'}));return;}
  for(let k=0;k<5;k++){const a=turn+k*K_TAU/5,f=Punfold(t,t0+.05*k,.55);flowers.push(NP(g.petal,col,{x:X,y:Y,r:a+Nsway(ph,o,i*5+k,.04,1.2),fold:{a:0,f},v:Pon(t,t0-.05,.1),z:.4*(1-f),j:Pshadev(i*5+k,o.seed)*.4,tex:'washi',back:Nmix(col,pal.heart,.2)}));}
  flowers.push(NP(Gcircle(0,0,.03,10),pal.heart,{x:X,y:Y,...Pland(t,t0+.35,.3),tex:'card'}));});
 // A few petals let go and drift down, turning, during the settle.
 const fall=[0,1,2,3].map(k=>{const t0=H[H.length-1]+.4+.5*k,age=t-t0;if(age<0)return null;const [x,y]=g.spots[(k*3+1)%g.spots.length];return NP(g.petal,pal.petals[k%3],{x:x+.12*age+.05*Math.sin(age*2+k),y:y+.16*age,r:age*1.3+k,s:.8,v:1-Kclamp((age-2.5)/1),z:.6,tex:'washi'});}).filter(Boolean);
 paperScene(c,w,h,o,[{pieces:wood,shadow:1},{pieces:flowers,shadow:.8},{pieces:fall,shadow:1.2}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 14 · Dàlia: rings of pointed petals unfold from the outside in, each ring a step along the colour wheel.
const NDAHLIA_PAL=[{rings:[NC.magenta,NC.pink,NC.coral,NC.orange,NC.tang,NC.gold,NC.lemon],heart:NC.lemon,board:NC.forest},
 {rings:[NC.indigo,NC.violet,NC.purple,NC.magenta,NC.pink,NC.blush,NC.white],heart:NC.gold,board:NC.teal},
 {rings:[NC.red,NC.coral,NC.orange,NC.gold,NC.lime,NC.leaf,NC.mint],heart:NC.white,board:NC.navy}];
function Ndahlia(c,w,h,ph,o){const pal=NDAHLIA_PAL[o.seed%3],t=ph.t,H=o.hitT,K=7;
 const g=Ncache('dahlia',()=>Array.from({length:K},(_,k)=>{const n=18-2*k,r1=.88-.11*k;return Array.from({length:n},(_,i)=>({a:i*K_TAU/n+(k%2)*Math.PI/n,pts:Gpetal(Math.max(.02,r1-.34+.02*k),r1,0,.075-.006*k,.85,10)}));}));
 const spin=Nturn(ph,.03),pulse=Npulse(t,H),layers=[];
 g.forEach((ring,k)=>{const t0=H[Math.min(H.length-1,Math.floor(k*H.length/K))]+.25*(k%2),pieces=ring.map((p,i)=>{const f=Punfold(t,t0+.4*i/ring.length,.6);return NP(p.pts,Nmix(pal.rings[k],'#ffffff',.12*(i%2)+.15*pulse*(k===K-1?1:0)),{r:p.a,fold:{a:0,f},v:Pon(t,t0+.4*i/ring.length-.05,.1),z:.5*(1-f),j:Pshadev(i+k*20,o.seed)*.5,tex:'washi',back:Nmix(pal.rings[k],'#ffffff',.4)});});
  layers.push({pieces,rot:spin*(k%2?-1:1),shadow:.9});});
 layers.push({pieces:[NP(Pjitter(Gcircle(0,0,.08,16),.005,2),pal.heart,{...Pland(t,H[H.length-1]+.3,.5),tex:'pulp'})],shadow:.8});
 paperScene(c,w,h,o,layers,Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 15 · Cactus en flor (seen from above): thirteen ribs, rows of areoles along them and a crown of flowers in the centre.
const NCACT_PAL=[{ribs:[NC.leaf,NC.green],areole:NC.white,spine:NC.lemon,flowers:[NC.magenta,NC.pink,NC.gold],board:NC.orange},
 {ribs:[NC.jade,NC.teal],areole:NC.white,spine:NC.gold,flowers:[NC.red,NC.coral,NC.lemon],board:NC.violet},
 {ribs:[NC.lime,NC.leaf],areole:NC.white,spine:NC.white,flowers:[NC.purple,NC.lilac,NC.pink],board:NC.coral}];
function Ncactus(c,w,h,ph,o){const pal=NCACT_PAL[o.seed%3],t=ph.t,H=o.hitT,N=13;
 const g=Ncache('cact',()=>{const spine=[];for(let i=0;i<10;i++){const a=i*K_TAU/10,r=i%2?.008:.04;spine.push([Math.cos(a)*r,Math.sin(a)*r]);}
  return {ribs:Array.from({length:N},(_,i)=>({a:i*K_TAU/N,pts:Gpetal(.04,.9,i*K_TAU/N,.13,.55,14)})),spine,areole:Gcircle(0,0,.018,8),flower:Array.from({length:10},(_,i)=>Gpetal(.01,.14,i*K_TAU/10,.035,1,8))};});
 const spin=Nturn(ph,.025),ribs=[],dots=[],flowers=[];
 g.ribs.forEach((rb,i)=>{const l=Pland(t,H[0]+.5*i/N,.5);ribs.push(NP(rb.pts,pal.ribs[i%2],{...l,j:Pshadev(i,o.seed)*.4,tex:'card'}));
  [.3,.45,.6,.75].forEach((r,k)=>{const t0=H[1+k]+.4*i/N,a=Pland(t,t0,.4),x=Math.cos(rb.a)*r,y=Math.sin(rb.a)*r;dots.push(NP(g.areole,pal.areole,{x,y,...a,tex:'cotton'}),NP(g.spine,pal.spine,{x,y,r:rb.a+i,...a,tex:'card'}));});});
 [0,1,2,3,4].forEach(k=>{const a=k*K_TAU/5+.3,x=Math.cos(a)*.13,y=Math.sin(a)*.13,t0=H[H.length-1]+.2*k,col=pal.flowers[k%3];
  g.flower.forEach((p,i)=>{const f=Punfold(t,t0+.03*i,.55);flowers.push(NP(p,col,{x,y,fold:{a:i*K_TAU/10,f},v:Pon(t,t0-.05,.1),z:.5*(1-f),tex:'washi'}));});flowers.push(NP(Gcircle(0,0,.025,8),NC.lemon,{x,y,...Pland(t,t0+.4,.3),tex:'card'}));});
 paperScene(c,w,h,o,[{pieces:ribs,rot:spin,shadow:1},{pieces:dots,rot:spin,shadow:.5,texA:.3},{pieces:flowers,rot:spin,shadow:.9}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 16 · Bombolles d'escuma: soap bubbles gather into a foam; each one has a thin iridescent rim and a highlight.
const NBUB_PAL=[{tints:[NC.sky,NC.mint,NC.blush,NC.lilac],tint:NC.sky,irid:[NC.pink,NC.aqua,NC.lemon,NC.lilac],board:NC.indigo},{tints:[NC.mint,NC.ice,NC.lemon,NC.aqua],tint:NC.mint,irid:[NC.magenta,NC.sky,NC.gold,NC.lime],board:NC.plum},{tints:[NC.blush,NC.lilac,NC.ice,NC.mint],tint:NC.blush,irid:[NC.violet,NC.aqua,NC.lemon,NC.coral],board:NC.sea}];
function Nbubbles(c,w,h,ph,o){const pal=NBUB_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('bub',()=>{const list=[];let k=0;while(list.length<24&&k<4000){k++;const r=.07+.17*Math.pow(Krand(k,61),1.6),d=(.9-r)*Math.sqrt(Krand(k,62)),a=K_TAU*Krand(k,63),x=Math.cos(a)*d,y=Math.sin(a)*d;
   if(list.every(b=>Math.hypot(b.x-x,b.y-y)>(b.r+r)*.86))list.push({x,y,r});}
  list.sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));return {list,arcs:[0,1,2,3].map(q=>Pring(.86,1,12,q*K_TAU/4,(q+1)*K_TAU/4+.02)),disc:Gcircle(0,0,.86,40),shine:Gpetal(.45,.8,-2.3,.13,1,8),dot:Gcircle(0,0,.1,10)};});
 const pulse=Npulse(t,H),pieces=[];
 g.list.forEach((b,i)=>{const grp=Math.min(H.length-1,Math.floor(i*H.length/g.list.length)),l=Pland(t,H[grp]+.12*(i%4),.5),pop=1+.1*Math.sin(Kclamp((t-H[grp]-.12*(i%4))/.6)*Math.PI)*(t>H[grp]?1:0);
  const x=b.x+Nsway(ph,o,i,.012,.6),y=b.y+Nsway(ph,o,i+9,.015,.5),s=b.r*l.s*pop,turn=Nturn(ph,.05)+i,base={x,y,v:l.v,z:l.z};
  pieces.push(NP(g.disc,Nmix(pal.tints[i%4],pal.board,.3+.12*(i%3)),{...base,s,tex:'washi'}));
  g.arcs.forEach((a,q)=>pieces.push(NP(a,pal.irid[(q+i)%4],{...base,s,r:turn,tex:'cotton'})));
  pieces.push(NP(g.shine,NC.white,{...base,s,v:l.v*.9,tex:'cotton'}),NP(g.dot,NC.white,{...base,x:x+s*.45,y:y+s*.35,s:s*(1+.3*pulse),tex:'cotton'}));});
 paperScene(c,w,h,o,[{pieces,shadow:.8,texA:.35}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 17 · Geoda de cristalls: bands of agate close in towards the hollow, then crystals grow from its walls towards the centre.
const NGEO_PAL=[{rim:NC.indigo,bands:[NC.violet,NC.lilac,NC.sky,NC.aqua,NC.white],hollow:NC.plum,crystals:[NC.purple,NC.lilac,NC.magenta,NC.pink],board:NC.teal},
 {rim:NC.forest,bands:[NC.jade,NC.mint,NC.lemon,NC.gold,NC.white],hollow:NC.sea,crystals:[NC.aqua,NC.sky,NC.ice,NC.mint],board:NC.magenta},
 {rim:NC.navy,bands:[NC.blue,NC.sky,NC.blush,NC.pink,NC.white],hollow:NC.indigo,crystals:[NC.gold,NC.tang,NC.lemon,NC.coral],board:NC.violet}];
function Ngeode(c,w,h,ph,o){const pal=NGEO_PAL[o.seed%3],t=ph.t,H=o.hitT,N=26;
 const g=Ncache('geo',()=>{const sx=1,sy=.8,shape=(r,seed)=>Pblob(r,64,.06,seed).map(([x,y])=>[x*sx,y*sy]);
  const bands=[.92,.84,.76,.69,.62,.56].map((r,i)=>i===0?Ptorn(shape(r,1),.012,2,.04):Pjitter(shape(r,3+i),.006,i));
  const crystals=Array.from({length:N},(_,i)=>{const a=i*K_TAU/N+.1*Krand(i,71),len=.16+.16*Krand(i,72),wd=.045+.025*Krand(i,73),R=.5,x=Math.cos(a)*R*sx,y=Math.sin(a)*R*sy,ang=Math.atan2(-y,-x);
   const c0=Math.cos(ang),s0=Math.sin(ang),P=(u,v)=>[u*c0-v*s0,u*s0+v*c0];return {x,y,left:[P(0,-wd),P(len*.78,-wd),P(len,0),P(0,0)],right:[P(0,0),P(len,0),P(len*.78,wd),P(0,wd)]};});
  return {bands,hollow:shape(.5,9),crystals};});
 const pulse=Npulse(t,H),pieces=[];
 g.bands.forEach((b,i)=>{const l=Pland(t,H[0]+.12*i,.5);pieces.push(NP(b,i===0?pal.rim:pal.bands[(i-1)%5],{...l,rim:i===0?.01:0,tex:i===0?'pulp':'cotton'}));});
 pieces.push(NP(g.hollow,pal.hollow,{...Pland(t,H[1],.5),tex:'pulp'}));
 const crystals=[];g.crystals.forEach((cr,i)=>{const t0=H[2+Math.floor(i*(H.length-2)/N)]+.2*Krand(i,74),gr=KeaseBack(Kclamp((t-t0)/.6)),col=pal.crystals[i%4],glint=.25*pulse*(i%3===0?1:0);
  if(gr<=0)return;crystals.push(NP(cr.left,Nmix(col,'#ffffff',.25+glint),{x:cr.x,y:cr.y,s:gr,tex:'cotton'}),NP(cr.right,Nmix(col,'#000000',.12),{x:cr.x,y:cr.y,s:gr,tex:'cotton'}));});
 paperScene(c,w,h,o,[{pieces,shadow:1},{pieces:crystals,shadow:.7,texA:.3}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 18 · Anells d'un tronc: the growth rings of a trunk appear from the heart outwards, each year a new colour.
const NRING_PAL=[{rings:[NC.gold,NC.tang,NC.lemon,NC.orange,NC.gold,NC.coral,NC.tang,NC.pink,NC.lemon],bark:NC.plum,leaves:[NC.leaf,NC.lime],board:NC.sky},
 {rings:[NC.aqua,NC.mint,NC.sky,NC.lime,NC.aqua,NC.lemon,NC.mint,NC.sky,NC.white],bark:NC.indigo,leaves:[NC.lime,NC.gold],board:NC.pink},
 {rings:[NC.pink,NC.blush,NC.lilac,NC.white,NC.pink,NC.lemon,NC.blush,NC.lilac,NC.white],bark:NC.purple,leaves:[NC.leaf,NC.jade],board:NC.leaf}];
function Ntrunk(c,w,h,ph,o){const pal=NRING_PAL[o.seed%3],t=ph.t,H=o.hitT,K=9;
 const g=Ncache('trunk',()=>({rings:Array.from({length:K},(_,k)=>Pblob(.1+.075*k,72,.05,k*3+1)),bark:Ptorn(Pblob(.82,90,.04,40),.014,41,.035),rays:[.3,1.9,3.6,5.1].map(a=>[[0,-.006],[.7,-.003],[.7,.003],[0,.006]].map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)])),
  leaf:Pleaf(.22,.07,0,10,.05),sprout:[[.62,-.62,-.9],[-.7,.55,2.4],[.74,.45,.6],[-.62,-.6,-2.2]]}));
 const pulse=Npulse(t,H),pieces=[];
 const bl=Pland(t,H[0]-.05,.5);pieces.push(NP(g.bark,pal.bark,{...bl,rim:.012,tex:'pulp'}));
 for(let k=K-1;k>=0;k--){const start=H[Math.min(H.length-1,Math.floor((k)*(H.length-1)/(K-1)))],gr=KeaseOut(Kclamp((t-start+.3)/.7));
  pieces.push(NP(g.rings[k],pal.rings[k],{s:.9+.1*gr,v:Ksmooth(gr*1.5),j:(k%2?-.4:.3)+.25*pulse*(k===0?1:0),tex:k%2?'cotton':'washi'}));}
 const rays=g.rays.map((p,i)=>NP(p,Nmix(pal.rings[0],'#ffffff',.5),{v:.6*Pon(t,H[H.length-1]+.2*i,.5),tex:'card'}));
 const leaves=g.sprout.flatMap(([x,y,a],i)=>[0,1,2].map(k=>{const l=Pland(t,H[2+i%3]+.15*k,.45);return NP(g.leaf,pal.leaves[(i+k)%2],{x,y,r:a+(k-1)*.6+Nsway(ph,o,i*3+k,.08,1),...l,tex:'washi'});}));
 paperScene(c,w,h,o,[{pieces,shadow:1},{pieces:rays,shadow:.2,edge:false},{pieces:leaves,shadow:.9}],Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// 19 · Onada: a great wave rises and curls over in three bands of blue, with foam along its crest.
const NWAVE_PAL=[{sky:NC.sky,sun:NC.gold,sea:[NC.cobalt,NC.blue,NC.sea],wave:[NC.cobalt,NC.blue,NC.teal,NC.aqua],foam:NC.white},
 {sky:NC.blush,sun:NC.orange,sea:[NC.indigo,NC.violet,NC.blue],wave:[NC.indigo,NC.violet,NC.sky,NC.ice],foam:NC.white},
 {sky:NC.lilac,sun:NC.coral,sea:[NC.forest,NC.jade,NC.teal],wave:[NC.sea,NC.teal,NC.jade,NC.mint],foam:NC.white}];
function Nwave(c,w,h,ph,o){const pal=NWAVE_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('wave',()=>{// Centre line: the back of the wave rises from the right, reaches the crest and rolls into a spiral.
  const pts=[[1.65,.62],[1.25,.5],[.85,.3],[.45,.02],[.12,-.3],[-.1,-.52]],C=[-.36,-.14],r0=Math.hypot(pts[5][0]-C[0],pts[5][1]-C[1]),th0=Math.atan2(pts[5][1]-C[1],pts[5][0]-C[0]);
  for(let i=1;i<=34;i++){const ph=i*.2,r=r0*Math.exp(-.3*ph);pts.push([C[0]+Math.cos(th0-ph)*r,C[1]+Math.sin(th0-ph)*r]);}
  const line=pts.map((p,i)=>{const q=pts[Math.min(i+1,pts.length-1)],r=pts[Math.max(i-1,0)];return [p[0],p[1],Math.atan2(q[1]-r[1],q[0]-r[0]),i/(pts.length-1)];});
  const crest=line.slice(4,20).map(([x,y,a],i)=>({x:x+Math.sin(a)*(.2-.008*i),y:y-Math.cos(a)*(.2-.008*i),r:.045-.0015*i}));
  return {bands:[[.24,.06],[.17,.05],[.1,.04],[.04,.03]].map(([wd,tip])=>Nstrip(line,wd,tip/wd)),crest,
   sea:[0,1,2].map(k=>Ptorn(Gband(x=>.58+.13*k+.04*Math.sin(x*4+k),()=>1,-1.5,1.5,40),.01,60+k,.04))};});
 const rise=KeaseOut(Kclamp((t-H[0])/1.4)),bob=Nsway(ph,o,0,.012,.8),dy=(1-rise)*.45+bob;
 const bands=g.bands.map((p,k)=>NP(p,pal.wave[k],{y:dy,...Pland(t,H[Math.min(k,H.length-1)],.6),tex:k%2?'washi':'cotton'}));
 const foam=g.crest.map(({x,y,r},i)=>{const l=Pland(t,H[4]+.05*i,.4);return NP(Pblob(r,12,.18,i),pal.foam,{x,y:y+dy,...l,tex:'cotton'});});
 const spray=[0,1,2,3,4,5].map(i=>{const l=Pland(t,H[5]+.1*i,.4),a=-2.2+.25*i;return NP(Gcircle(0,0,.018+.008*(i%3),8),pal.foam,{x:-.2+Math.cos(a)*.55,y:-.2+Math.sin(a)*.5+dy,...l,tex:'cotton'});});
 const sea=g.sea.map((p,k)=>NP(p,pal.sea[k],{...Pland(t,H[0]+.1*k,.5),y:Nsway(ph,o,k+4,.01,.9),rim:.006,tex:'card'}));
 const sun=NP(Gcircle(0,0,.2,40),pal.sun,{x:1.05,y:-.55,...Pland(t,H[0]+.2,.6),tex:'cotton'});
 paperScene(c,w,h,o,[{pieces:[sun],shadow:.6},{pieces:bands,shadow:1},{pieces:[...foam,...spray],shadow:.7},{pieces:sea,shadow:.9}],Nview(w,h,ph,o,{pts:[[-1.5,-1],[1.5,-1],[1.5,1],[-1.5,1]],color:pal.sky,tex:'pulp'},1.5,1,{clip:true}));}

// 20 · Jardí mandala: the closing scene. Rings of leaves, petals, seeds and small flowers land from the centre outwards.
const NMAND_PAL=[{a:NC.magenta,b:NC.leaf,c:NC.orange,d:N_RAINBOW,e:NC.sky,f:NC.lime,heart:NC.gold,board:NC.indigo},
 {a:NC.orange,b:NC.jade,c:NC.pink,d:N_RAINBOW,e:NC.lemon,f:NC.leaf,heart:NC.white,board:NC.plum},
 {a:NC.blue,b:NC.lime,c:NC.gold,d:N_RAINBOW,e:NC.pink,f:NC.jade,heart:NC.coral,board:NC.forest}];
function Nmandala(c,w,h,ph,o){const pal=NMAND_PAL[o.seed%3],t=ph.t,H=o.hitT;
 const g=Ncache('mand',()=>({center:Array.from({length:8},(_,i)=>Gpetal(.02,.17,i*K_TAU/8,.06,1,8)),leaves:Array.from({length:12},(_,i)=>Pleaf(.17,.05,i*K_TAU/12,8,0).map(([x,y])=>[x+Math.cos(i*K_TAU/12)*.16,y+Math.sin(i*K_TAU/12)*.16])),
  petals:Array.from({length:16},(_,i)=>Gpetal(.33,.52,i*K_TAU/16+Math.PI/16,.06,.9,8)),seeds:Array.from({length:24},(_,i)=>{const a=i*K_TAU/24;return Gmove(Gcircle(0,0,.03,10),Math.cos(a)*.58,Math.sin(a)*.58);}),
  flowers:Array.from({length:12},(_,i)=>{const a=i*K_TAU/12+Math.PI/12;return {x:Math.cos(a)*.7,y:Math.sin(a)*.7,petals:Array.from({length:5},(_,k)=>Ppetal(0,.06,k*K_TAU/5+a,.035,6,.3))};}),
  outer:Array.from({length:18},(_,i)=>Pleaf(.16,.05,i*K_TAU/18,8,0).map(([x,y])=>[x+Math.cos(i*K_TAU/18)*.8,y+Math.sin(i*K_TAU/18)*.8]))}));
 const pulse=Npulse(t,H),turn=Nturn(ph,.04),ring=(list,col,t0,rot,extra=()=>({}))=>({pieces:list.map((p,i)=>{const l=Pland(t,t0+.35*i/list.length,.45);return NP(p,typeof col==='function'?col(i):col,{...l,j:Pshadev(i,o.seed)*.4,tex:'washi',...extra(i,l)});}),rot,shadow:.9});
 const layers=[ring(g.outer,i=>i%2?pal.f:Nmix(pal.f,'#ffffff',.25),H[5],-turn),ring(g.petals,i=>i%2?pal.c:Nmix(pal.c,'#ffffff',.3),H[2],-turn*.7),ring(g.seeds,i=>pal.d[i%pal.d.length],H[3],turn),
  {pieces:g.flowers.flatMap((f,i)=>{const l=Pland(t,H[4]+.3*i/12,.45);return [...f.petals.map(p=>NP(p,pal.e,{x:f.x,y:f.y,...l,tex:'washi'})),NP(Gcircle(0,0,.018,8),pal.heart,{x:f.x,y:f.y,...l,tex:'card'})];}),rot:turn*.5,shadow:.8},
  ring(g.leaves,i=>i%2?pal.b:Nmix(pal.b,'#ffffff',.2),H[1],turn*.8),ring(g.center,i=>Nmix(pal.a,'#ffffff',.15*(i%2)+.2*pulse),H[0],-turn),{pieces:[NP(Gcircle(0,0,.05,14),pal.heart,{...Pland(t,H[0]+.3,.4),tex:'card'})],shadow:.6}];
 paperScene(c,w,h,o,layers,Nview(w,h,ph,o,{r:1.0,color:pal.board,tex:'pulp'}));}

// Each scene: {draw, steps (grid), hits (steps with a visual event), turn (rad/s, for the safety test), accent colours per round}.
export const NATURA_ART=Object.freeze([
 {draw:Nsunflower,steps:16,hits:[0,2,5,8,11,13],turn:.035,accent:[NC.gold,NC.pink,NC.sky]},
 {draw:Nnautilus,steps:16,hits:[0,3,6,9,12],turn:.03,accent:[NC.orange,NC.magenta,NC.lime]},
 {draw:Nsnowflake,steps:16,hits:[0,2,5,7,9,12],turn:.03,accent:[NC.aqua,NC.lilac,NC.mint]},
 {draw:Nfern,steps:16,hits:[0,2,4,7,9,12],turn:0,accent:[NC.lime,NC.teal,NC.leaf]},
 {draw:Ndandelion,steps:16,hits:[0,2,4,6,10],turn:0,accent:[NC.ice,NC.lemon,NC.lilac]},
 {draw:Nhoney,steps:16,hits:[0,2,4,6,9,12],turn:.025,accent:[NC.gold,NC.orange,NC.gold]},
 {draw:Nromanesco,steps:16,hits:[0,3,6,9,12],turn:.03,accent:[NC.lime,NC.aqua,NC.gold]},
 {draw:Ncitrus,steps:16,hits:[0,3,5,7,9,12],turn:.04,accent:[NC.orange,NC.pink,NC.lemon]},
 {draw:Nveins,steps:16,hits:[0,3,5,7,9,12],turn:0,accent:[NC.lime,NC.orange,NC.gold]},
 {draw:Ntree,steps:16,hits:[0,2,4,6,8,10,13],turn:0,accent:[NC.pink,NC.gold,NC.coral]},
 {draw:Npond,steps:16,hits:[0,3,5,7,9,13],turn:0,accent:[NC.aqua,NC.sky,NC.aqua]},
 {draw:Ndunes,steps:16,hits:[0,2,4,6,8,10,13],turn:0,accent:[NC.coral,NC.gold,NC.pink]},
 {draw:Nalmond,steps:16,hits:[0,2,4,6,9,12],turn:0,accent:[NC.pink,NC.lemon,NC.lilac]},
 {draw:Ndahlia,steps:16,hits:[0,2,4,7,10,13],turn:.03,accent:[NC.magenta,NC.violet,NC.orange]},
 {draw:Ncactus,steps:16,hits:[0,3,5,7,9,13],turn:.025,accent:[NC.magenta,NC.red,NC.purple]},
 {draw:Nbubbles,steps:16,hits:[0,3,6,9,12],turn:.05,accent:[NC.aqua,NC.pink,NC.lilac]},
 {draw:Ngeode,steps:16,hits:[0,2,5,8,11,13],turn:0,accent:[NC.lilac,NC.aqua,NC.gold]},
 {draw:Ntrunk,steps:16,hits:[0,2,4,6,8,10,13],turn:0,accent:[NC.gold,NC.aqua,NC.pink]},
 {draw:Nwave,steps:16,hits:[0,2,4,7,10,13],turn:0,accent:[NC.sky,NC.violet,NC.teal]},
 {draw:Nmandala,steps:16,hits:[0,2,5,8,11,13],turn:.04,accent:[NC.magenta,NC.orange,NC.blue]}
].map(Object.freeze));

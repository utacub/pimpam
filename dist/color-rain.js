// Gotes de pintura (CE03; «La nova Pluja de colors» until 0.52.2, renamed in 0.52.3) · the model: the steps of a sheet of marbled paper, the print, the clothesline, the change
// of workshop, the wait for the next press; and (further down) the music and the sounds, which drive the ink: every drop touches
// the water exactly on its note.
// Marc, 7 November 2026: plan «La nova Pluja de colors» approved («ja pots començar a programar la pluja de colors, una part molt
// bonica de l'activitat original era la sincronia entre les gotes i les notes, mira de mantenir-ho»).
// One press is one step of a sheet: the first rain, a second colour that makes rings, a fine spray, the stylus or the comb, and the
// print (a sheet of paper is laid on the water, lifted, shown and hung on the line). Settings: steps of a sheet (3, 5, 7), gestures
// (only drops, drops and combs, complete with flowers), size of the drops, colours, clothesline, first workshop.
// 0.52.1 (Marc, 7 November 2026: «molta més diversitat de colors i de motius… Sigues més creatiu en els colors, l'estructura per
// crear la pintura, i la diversitat de resultats»): every sheet has its own palette, its own layout for the first rain (stones,
// big and small stones, rows, a chequer, stripes, slanting or wavy rows, targets, a chain of targets, a spiral, a frame, a
// corona) and its own gesture (new: a comb on a slant, a breath on a slant, an S of the stylus, a stroke through a row of
// targets, the spokes of a star, rings drawn each the other way).
import {escWaitTurn,escWaitClock,escFit,escInto} from './escenari.js';
import {sampleZone} from './sampler.js';
import {MB_TALLERS,mbNote,mbPalette} from './marbre-tallers.js';
import {mbInk,mbQueue,mbAdvance,mbView} from './marbre-tinta.js';

// The catalogue's card: the activity keeps its id, its name and its code (CE03) and goes to «Formes, llum i música».
export const PC_CAUSE=Object.freeze({id:'color-rain',code:'CE03',type:'ce',level:'01 · Descobrir',name:'Gotes de pintura',desc:'Plou color sobre una cubeta d’aigua i es fa paper marbrejat: vint fulls de cinc tallers, amb música d’instruments reals.',tag:'20 fulls marbrejats · 5 tallers',time:'Al teu ritme',marbre:true,recorded:true});
// the bath is 16:9 in ink units (1 high); the press shows at once (the first drop starts to fall) and lands MB_LEAD later, on its note
export const MB_A=16/9,MB_FALL=.32,MB_LEAD=.38,MB_LOUD=2.6,MB_AIR=6;
export const MB_SIZE=Object.freeze({grans:{per:1,spray:3,rings:2},mitjanes:{per:2,spray:4,rings:3},petites:{per:4,spray:6,rings:4}});
// The steps of a sheet for each setting (the last one is always the print).
export const MB_PLAN=Object.freeze({3:{gotes:['rain','rings','print'],pintes:['rain','gesture','print'],flors:['rain','flower','print']},
 5:{gotes:['rain','rings','spray','rings2','print'],pintes:['rain','rings','spray','gesture','print'],flors:['rain','rings','gesture','flower','print']},
 7:{gotes:['rain','rings','spray','rain2','rings2','spray2','print'],pintes:['rain','rings','spray','gesture','gesture2','flower','print'],flors:['rain','rings','spray','gesture','flower','gesture2','print']}});
export const mbStepsN=s=>[3,5,7].includes(+s?.mbSteps)?+s.mbSteps:5;
export const mbGestures=s=>['gotes','pintes','flors'].includes(s?.mbGestures)?s.mbGestures:'pintes';
export const mbPlan=s=>MB_PLAN[mbStepsN(s)][mbGestures(s)];
export const mbTaller=F=>MB_TALLERS[F.g];
export const mbSheet=F=>MB_TALLERS[F.g].sheets[F.j];
export const mbBarLen=T=>T.subs*T.sub;
// the flowers drawn with the stylus: their centres (fractions of the bath) and size
export const MB_FLOWERS=Object.freeze({cor:{f:'cor',pts:[[.2,.5],[.5,.5],[.8,.5]],R:.17},tulipa:{f:'tulipa',pts:[[.5,.55]],R:.28},tulipa2:{f:'tulipa',pts:[[.26,.5],[.74,.56]],R:.19},
 crisantem:{f:'crisantem',pts:[[.5,.5]],R:.3},rosa:{f:'rosa',pts:[[.5,.5]],R:.28},rosa2:{f:'rosa',pts:[[.27,.48],[.73,.55]],R:.19},estrella:{f:'estrella',pts:[[.5,.5]],R:.3}});

export function mbNew(s){const first=Math.max(0,MB_TALLERS.findIndex(T=>T.id===s?.mbFirst));
 return {first,g:first,j:0,lap:0,step:0,phase:'rest',kind:null,at:0,end:0,t:0,wait:null,cues:['sheet'],ink:mbInk(MB_A),events:[],ev:0,falls:[],tools:[],hung:[],prints:0,presses:0,done:0,print:null,prevG:-1,changeAt:-1e9,bar:0,r0:.2,ghost:null};}
export function mbStart(game,s){game.marbre=mbNew(s);game.count=0;game.completed=0;return game.marbre;}

// a small random generator for each step of each sheet (the same sheet is drawn the same way on the same lap)
function mbRng(F,k){let x=((F.g*4+F.j)*977+F.lap*131+k*29+7)>>>0;return ()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
const mbX=(F,fx)=>(F.lap%2?1-fx:fx)*MB_A;
// Points spread over the bath (best candidate), then put in an order a hand would follow.
function mbScatter(n,rng,margin,avoid=[]){const pts=[];for(let i=0;i<n;i++){let best=null,bd=-1;for(let c=0;c<16;c++){const x=margin+rng()*(MB_A-2*margin),y=margin+rng()*(1-2*margin);let d=1e9;for(const p of pts)d=Math.min(d,(p[0]-x)**2+(p[1]-y)**2);for(const p of avoid)d=Math.min(d,((p[0]-x)**2+(p[1]-y)**2)*2);if(d>bd){bd=d;best=[x,y];}}pts.push(best);}
 return mbPath(pts);}
function mbPath(pts){if(pts.length<3)return pts;const left=pts.reduce((a,p)=>p[0]<a[0]?p:a,pts[0]),out=[left],rest=pts.filter(p=>p!==left);while(rest.length){const l=out[out.length-1];let k=0,d=1e9;rest.forEach((p,i)=>{const dd=(p[0]-l[0])**2+(p[1]-l[1])**2;if(dd<d){d=dd;k=i;}});out.push(rest.splice(k,1)[0]);}return out;}
function mbScatterIn(n,rng,x0,y0,x1,y1){const pts=[];for(let i=0;i<n;i++){let best=null,bd=-1;for(let c=0;c<16;c++){const x=x0+rng()*(x1-x0),y=y0+rng()*(y1-y0);let d=1e9;for(const p of pts)d=Math.min(d,(p[0]-x)**2+(p[1]-y)**2);if(d>bd){bd=d;best=[x,y];}}pts.push(best);}return mbPath(pts);}
// a point at distance d along a polyline
function mbAt(P,d){for(let i=1;i<P.length;i++){const L=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(d<=L||i===P.length-1){const u=L?Math.min(1,d/L):0;return [P[i-1][0]+(P[i][0]-P[i-1][0])*u,P[i-1][1]+(P[i][1]-P[i-1][1])*u];}d-=L;}return P[0];}
// N drops spread evenly along some lines (one after another, every other one the other way, as a hand would go); col(line, drop)
function mbLines(curves,N,col,rng){const len=curves.map(P=>{let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return L;}),tot=len.reduce((a,b)=>a+b,0)||1,out=[];let cum=0,k=0;
 curves.forEach((P0,ci)=>{const a=Math.round(N*cum/tot);cum+=len[ci];const n=Math.round(N*cum/tot)-a,P=ci%2?P0.slice().reverse():P0;
  for(let i=0;i<n;i++){const [x,y]=mbAt(P,(i+.5)/n*len[ci]);out.push({x:x+(rng()-.5)*.012,y:y+(rng()-.5)*.012,c:col(ci,k++),s:1,j:0});}});
 return out;}
// the part of a line (through p, along m) inside a rectangle
function mbClip(px,py,mx,my,x0,x1,y0,y1){let a=-1e9,b=1e9;for(const [p,d,lo,hi] of [[px,mx,x0,x1],[py,my,y0,y1]]){if(Math.abs(d)<1e-9){if(p<lo||p>hi)return null;continue;}let t1=(lo-p)/d,t2=(hi-p)/d;if(t1>t2)[t1,t2]=[t2,t1];a=Math.max(a,t1);b=Math.min(b,t2);}
 return b-a>.05?[[px+mx*a,py+my*a],[px+mx*b,py+my*b]]:null;}
function mbRoundRect(x,y,w,h,r){const P=[],arc=(cx,cy,a0)=>{for(let i=0;i<=6;i++){const a=a0+i/6*Math.PI/2;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}};
 arc(x+w-r,y+r,-Math.PI/2);arc(x+w-r,y+h-r,0);arc(x+r,y+h-r,Math.PI/2);arc(x+r,y+r,Math.PI);P.push(P[0].slice());return P;}
// The layout of the first rain: where its N drops fall (bath units, before the mirror of odd laps), in order, with their colours
// (c) and sizes (s, relative; j: a little uneven, like stones). The colours are the sheet's rain colours, in turn.
function mbLayout(L,N,rng,cols){const A=MB_A,C=i=>cols[((i%cols.length)+cols.length)%cols.length];let out=[];
 switch(L.k){
 case 'mixed':{// a few big stones first, then many small ones between them
  const nb=Math.max(2,Math.round(N/5)),big=mbScatter(nb,rng,.24);out=big.map(p=>({x:p[0],y:p[1],c:C(0),s:2,j:1}));
  mbScatter(N-nb,rng,.05,big).forEach((p,i)=>out.push({x:p[0],y:p[1],c:cols.length>1?C(1+i%(cols.length-1)):C(0),s:.72,j:1}));break;}
 case 'grid':{// rows (or a chequer, or rows set half a drop apart like a honeycomb); a grid as close to the shape of the bath as N allows
  const pairs=[];for(let r=1;r<=N;r++){const c=Math.ceil(N/r);pairs.push([c,r,(c*r-N)*.35+Math.abs(Math.log(c/r/A))]);}pairs.sort((a,b)=>a[2]-b[2]);const [nc,nr]=pairs[0];
  for(let r=0;r<nr;r++){const n=Math.min(nc,N-out.length),o=(nc-n)/2;for(let c=0;c<n;c++){const cc=r%2?n-1-c:c,hx=L.hex?(r%2?.25:-.25):0;
   out.push({x:(cc+o+.5+hx+(rng()-.5)*.16)*A/nc,y:(r+.5+(rng()-.5)*.16)/nr,c:L.chk?C(r+cc):C(r),s:1,j:1});}}break;}
 case 'bands':{// stripes: one colour per stripe, the drops close together along it
  const v=L.dir==='v',k=cols.length,nb=k*Math.max(1,Math.round((v?Math.sqrt(N*A):Math.sqrt(N/A))/k)),m=.06,cur=[];
  for(let b=0;b<nb;b++){const u=(b+.5)/nb;cur.push(v?[[u*A,m],[u*A,1-m]]:[[m,u],[A-m,u]]);}out=mbLines(cur,N,ci=>C(ci),rng);break;}
 case 'diag':{// slanting rows (th degrees), one colour per row
  const th=(L.th??-30)*Math.PI/180,mx=Math.cos(th),my=Math.sin(th),nx=-my,ny=mx,m=.06,qs=[[m,m],[A-m,m],[m,1-m],[A-m,1-m]].map(([x,y])=>x*nx+y*ny),q0=Math.min(...qs),q1=Math.max(...qs),n=L.n||5,cur=[];
  for(let l=0;l<n;l++){const q=q0+(l+.5)*(q1-q0)/n,sg=mbClip(nx*q,ny*q,mx,my,m,A-m,m,1-m);if(sg)cur.push(sg);}out=mbLines(cur,N,ci=>C(ci),rng);break;}
 case 'ones':{// wavy rows
  const n=L.n||4,m=.06,cur=[];for(let l=0;l<n;l++){const y0=(l+.5)/n,P=[];for(let i=0;i<=24;i++){const x=m+(A-2*m)*i/24;P.push([x,y0+(L.amp??.07)*Math.sin(2*Math.PI*x/(L.wl||.6))]);}cur.push(P);}
  out=mbLines(cur,N,ci=>C(ci),rng);break;}
 case 'spiral':{// one spiral from the centre outwards, the colours in turn along it
  const turns=L.turns||2.5,P=[];for(let i=0;i<=240;i++){const u=i/240,th=.4+u*turns*2*Math.PI,r=.03+.45*u;P.push([A/2+r*Math.cos(th)*1.5,.5+r*Math.sin(th)]);}out=mbLines([P],N,(ci,i)=>C(i),rng);break;}
 case 'frame':{// a few big drops in the middle, then stones all round the edge that close in on them like a frame
  const nC=Math.max(2,Math.round(N*.25));out=mbScatterIn(nC,rng,A*.32,.36,A*.68,.64).map(p=>({x:p[0],y:p[1],c:C(0),s:1.7,j:1}));
  out.push(...mbLines([mbRoundRect(.09,.09,A-.18,.82,.12)],N-nC,(ci,i)=>cols.length>1?C(1+i%(cols.length-1)):C(0),rng).map(d=>({...d,s:.85,j:1})));break;}
 case 'corona':{// one big drop in the middle and rings of drops round it, one colour per ring
  const cur=[.19,.34,.49].map(r=>{const P=[];for(let i=0;i<=48;i++){const a=i/48*2*Math.PI-Math.PI/2;P.push([A/2+r*1.25*Math.cos(a),.5+r*Math.sin(a)]);}return P;});
  out=[{x:A/2,y:.5,c:C(0),s:1.7,j:0}].concat(mbLines(cur,N-1,ci=>C(ci+1),rng));break;}
 case 'bull':{// targets: every drop falls on a centre (the centres in turn); each round of drops is the next colour
  const cs=L.cs.map(([fx,fy])=>[fx*A,fy]),nc=cs.length;for(let i=0;i<N;i++){const c=cs[i%nc];out.push({x:c[0],y:c[1],c:C(Math.floor(i/nc)),s:1,j:0});}out.centres=cs;break;}
 default:{mbScatter(N,rng,.06).forEach((p,i)=>out.push({x:p[0],y:p[1],c:C(i),s:1,j:1}));}}
 return out;}
// The colours of the steps of a sheet: the first rain takes the sheet's own (rc); the other steps take the colours the rain did not
// use, in order, and then the rain's again.
export function mbStepCols(F){const sh=mbSheet(F),n=mbPalette(F.g,F.j,F.lap).inks.length,r0=(sh.rc||[0]).filter(c=>c<n),rc=r0.length?r0:[0];return {rc,o:[...Array(n).keys()].filter(c=>!rc.includes(c)).concat(rc)};}

// ── Notes ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Every note is an event at a time of the model; the audio plays each one when its time comes (half a second ahead). Notes are
// fitted to the instrument as a group (escFit) so a phrase keeps its shape.
function mbFit(ms,inst){const sh=escFit(ms,inst);return ms.map(m=>escInto(m+sh,inst));}
function mbNotes(F,list){// list: [t, inst, midi, vel, len, pan]
 const by=new Map();for(const n of list){if(!by.has(n[1]))by.set(n[1],[]);by.get(n[1]).push(n);}
 for(const [inst,ns] of by){const ms=mbFit(ns.map(n=>n[2]),inst);ns.forEach((n,i)=>F.events.push({t:n[0],inst,midi:[ms[i]],vel:Math.min(1,n[3]*MB_LOUD),len:n[4],pan:n[5]||0}));}}
const mbFx=(F,t,bank,name,level,pan=0,rate=1,dur=0)=>F.events.push({t,fx:true,bank,name,level,pan,rate,dur});
const mbChordTones=T=>T.scale==='in'?[0,1,2,3,5,6]:[0,2,4,7,9,11];
// the notes of the arpeggio for n positions of a bar: up and back (flip: the next inversion, an octave up)
function mbArp(T,bar,n,flip=false){const root=T.prog[((bar%8)+8)%8],tones=mbChordTones(T),pat=n<=5?[0,1,2,3,1]:[0,1,2,3,2,1];
 return Array.from({length:n},(_,i)=>mbNote(T.key,T.scale,root+tones[Math.min(tones.length-1,pat[i%pat.length]+(flip?1:0))])+12);}
// the layers that go with a step: the bass on the bar, the tune of the clarinet (oboe, marimba…), the hand drum
function mbBass(T,bar,t0,out,vel=.2){const root=T.prog[((bar%8)+8)%8],mid=T.subs===9?4:T.subs/2,fifth=T.scale==='in'?3:4;out.push([t0,T.inst.bass,mbNote(T.key,T.scale,root)-12,vel,T.sub*T.subs*.55]);out.push([t0+mid*T.sub,T.inst.bass,mbNote(T.key,T.scale,root+fifth)-12,vel*.75,T.sub*T.subs*.4]);}
function mbMel(T,bar,t0,out,vel=.16){for(const [s0,d,l] of T.tune[((bar%8)+8)%8])out.push([t0+s0*T.sub,T.inst.mel,mbNote(T.key,T.scale,d)+12,vel,Math.max(.25,l*T.sub*.92)]);}
function mbPerc(F,T,bar,t0,k=1){for(const [s0,name,lv] of T.perc.hits)mbFx(F,t0+s0*T.sub,T.perc.bank,name,lv*k,.15);}
// a run on the gesture's instrument that follows the tool: one note on every subdivision, up and down
function mbGliss(T,t0,t1,out,{from=2,span=9,vel=.11,inst=T.inst.gliss}={}){const n=Math.max(2,Math.round((t1-t0)/T.sub));for(let i=0;i<n;i++){const u=i/(n-1),d=from+Math.round(span*(u<.6?u/.6:(1-u)/.4*.6));out.push([t0+i*(t1-t0)/n,inst,mbNote(T.key,T.scale,d)+12,vel*(i===0?1.2:1),.9]);}}

// ── The steps ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
function mbDrop(F,t,x,y,r,col,dur=.9,small=false){mbQueue(F.ink,{kind:'drop',cx:x,cy:y,r,col,t0:t,dur});F.falls.push({x,y,r,col,t0:t-(small?.22:MB_FALL),t1:t,small,g:F.g,j:F.j,lap:F.lap});}
function mbTimes(T,t0,bars,pos=T.arp){const out=[];for(let b=0;b<bars;b++)for(const p of pos)out.push([t0+(b*T.subs+p)*T.sub,b]);return out;}
const mbBrush=(F,pts,kind='brush')=>{if(pts.length)F.tools.push({kind,pts,t0:pts[0][2]-.6,t1:pts[pts.length-1][2]+.5});};

// The first rain (and the second, rain2): the drops land on the arpeggio, laid out as the sheet says, in the sheet's colours.
function mbRain(F,s,T0,{cols=[0],cover=1.25,k=0,mel=false,lay=null}={}){const T=mbTaller(F),rng=mbRng(F,k),bars=2,times=mbTimes(T,T0,bars),sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],brush=[],L=lay||{k:'scatter'};
 if(L.k==='rings'){// suminagashi: rings of ink and of clear water at a few centres, one drop at every centre on every note
  const cs=L.cs?L.cs.map(([fx,fy])=>[mbX(F,fx),fy]):mbScatter(sz.rings,rng,.22),nc=cs.length,rr=.46/Math.sqrt(times.length)*Math.sqrt(2/nc),st=nc>1?Math.min(.015,.04/(nc-1)):0;
  times.forEach(([t],i)=>{const col=i%2===0?cols[(i>>1)%cols.length]:-1;cs.forEach((c,ci)=>mbDrop(F,t+ci*st,c[0],c[1],rr,col,1.1));brush.push([cs[i%nc][0],cs[i%nc][1],t]);});
  F.r0=rr;F.centres=cs;}
 else if(L.k==='bands'){// stripes: on every note the brush lays a line of ink across the bath; it spreads into a stripe and pushes the
  // others aside. Each line is laid just past the last stripe (a hair beyond its edge, so the edge is not torn), so they lie in
  // order, centred on the bath.
  const v=L.dir==='v',per=sz.per,n=times.length*per,ext=v?MB_A:1,d=ext*(L.cover||cover)/n,sg=F.lap%2?-1:1,st=per>1?Math.min(.012,.04/(per-1)):0;
  for(let i=0;i<n;i++){const [t0]=times[Math.floor(i/per)],t=t0+(i%per)*st,u=ext/2+sg*(i*d/2+(i?.002:0)),x=v?u:MB_A/2,y=v?.5:u,col=cols[i%cols.length];
   mbQueue(F.ink,{kind:'band',bx:x,by:y,nx:v?1:0,ny:v?0:1,d,col,t0:t,dur:.9});
   for(let k=0;k<5;k++){const w=(k+.5)/5,fx=v?x:w*MB_A,fy=v?w:y;F.falls.push({x:fx,y:fy,r:d/2,col,t0:t-MB_FALL,t1:t,small:false,g:F.g,j:F.j,lap:F.lap});}
   if(i%per===0)brush.push([x,y,t]);}
  F.r0=d;F.centres=null;F.stripes={v,n,d};}
 else{const per=Math.max(sz.per,L.dpn||1),N=times.length*per,D=mbLayout(L,N,rng,cols),ss=D.reduce((a,d)=>a+d.s*d.s,0),r0=Math.sqrt(MB_A*(lay&&L.cover||cover)/(Math.PI*ss)),st=per>1?Math.min(.012,.04/(per-1)):0,mx=x=>F.lap%2?MB_A-x:x;
  D.forEach((d,i)=>{const [t]=times[Math.floor(i/per)],x=mx(d.x);mbDrop(F,t+(i%per)*st,x,d.y,r0*d.s*(d.j?.88+.24*rng():1),d.c);if(i%per===0)brush.push([x,d.y,t]);});
  F.r0=r0;F.centres=D.centres?D.centres.map(([x,y])=>[mx(x),y]):null;}
 const arp=[];for(let b=0;b<bars;b++)arp.push(...mbArp(T,F.bar+b,T.arp.length));
 times.forEach(([t],i)=>{notes.push([t,T.inst.arp,arp[i],i%T.arp.length===0?.22:.16,1.6,-.3+.6*(brush[i]?.[0]??MB_A/2)/MB_A]);mbFx(F,t,'pintaRec','gota',.1+.05*rng(),(brush[i]?.[0]??MB_A/2)/MB_A*1.2-.6,.85+.35*rng());});
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes);if(mel)mbMel(T,F.bar+b,t,notes,.13);}
 mbNotes(F,notes);mbBrush(F,brush);F.bar+=bars;return T0+bars*mbBarLen(T)+1;}

// A second colour that falls inside the first drops and makes rings (rings2: a third colour inside those); or between them, where it
// leaves fine veins (mode 'veins'); or again on the centres of the targets (mode 'same'), the new colour and the first in turn.
function mbRings(F,s,T0,{col=1,k=1,scale=.55,mode='in'}={}){const T=mbTaller(F),sh=mbSheet(F),rng=mbRng(F,k),bars=2,times=mbTimes(T,T0,bars),sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],brush=[];
 if(sh.lay?.k==='rings'){// new centres; or (mode 'same') the same centres again, water and ink in turn, so the middle ends in ink
  const same=mode==='same'&&F.centres?.length,cs=same?F.centres:mbScatter(Math.max(1,sz.rings-1),rng,.2,F.centres||[]),rr=(F.r0||.12)*(same?.7:.8);
  times.forEach(([t],i)=>{const c=cs[i%cs.length],k2=Math.floor(i/cs.length),ink=same?k2%2===1:k2%2===0;mbDrop(F,t,c[0],c[1],rr,ink?col:-1,1.1);brush.push([c[0],c[1],t]);});}
 else if(sh.lay?.k==='bands'){// on stripes: thin lines of the new colour between them, one on every note
  const v=sh.lay.dir==='v',N=times.length*sz.per,ext=v?MB_A:1,st=sz.per>1?Math.min(.012,.04/(sz.per-1)):0;
  for(let i=0;i<N;i++){const [t0]=times[Math.floor(i/sz.per)],t=t0+(i%sz.per)*st,u=ext*(i+.5)/N,x=v?u:MB_A/2,y=v?.5:u;mbQueue(F.ink,{kind:'band',bx:x,by:y,nx:v?1:0,ny:v?0:1,d:ext*scale*.06,col,t0:t,dur:.8});
   for(let k=0;k<4;k++){const w=(k+.5)/4;F.falls.push({x:v?x:w*MB_A,y:v?w:y,r:.02,col,t0:t-MB_FALL,t1:t,small:false,g:F.g,j:F.j,lap:F.lap});}if(i%sz.per===0)brush.push([x,y,t]);}}
 else{const N=times.length*sz.per,same=mode==='same'&&F.centres?.length,rc0=mbStepCols(F).rc[0];let pts;
  if(same)pts=Array.from({length:N},(_,i)=>F.centres[i%F.centres.length]);
  else if(mode==='veins')pts=mbScatter(N,rng,.06,F.ink.polys.filter(p=>p.col>=0).map(p=>[p.cx,p.cy]));
  else{const inView=F.ink.polys.filter(p=>p.col>=0&&p.cx>.06&&p.cx<MB_A-.06&&p.cy>.06&&p.cy<.94),cand=mbPath(inView.slice(-N).map(p=>[p.cx,p.cy]));pts=cand.concat(N>cand.length?mbScatter(N-cand.length,rng,.08,cand):[]);}
  const r=(F.r0||.15)*(same?.62:mode==='veins'?.45:scale),st=sz.per>1?Math.min(.012,.04/(sz.per-1)):0;
  pts.forEach((p,i)=>{const [t]=times[Math.floor(i/sz.per)],c=same&&Math.floor(i/F.centres.length)%2?rc0:col;mbDrop(F,t+(i%sz.per)*st,p[0],p[1],r*(same?1:.85+.3*rng()),c);if(i%sz.per===0)brush.push([p[0],p[1],t]);});}
 const arp=[];for(let b=0;b<bars;b++)arp.push(...mbArp(T,F.bar+b,T.arp.length,true));
 times.forEach(([t],i)=>{notes.push([t,T.inst.arp,arp[i],i%T.arp.length===0?.2:.15,1.6,-.3+.6*(brush[i]?.[0]??MB_A/2)/MB_A]);mbFx(F,t,'pintaRec','gota',.09+.04*rng(),0,1.1+.3*rng());});
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes);mbMel(T,F.bar+b,t,notes);}
 mbNotes(F,notes);mbBrush(F,brush);F.bar+=bars;return T0+bars*mbBarLen(T)+1.1;}

// The fine spray: the brush is tapped on a rod and a rain of small drops falls all over; each note of a quick run lets a few fall.
function mbSpray(F,s,T0,{col=2,k=2}={}){const T=mbTaller(F),sh=mbSheet(F),rng=mbRng(F,k),bars=2,n=T.subs*bars,sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],pts=[];
 const c=sh.lay?.k==='rings'?-1:col,x0=F.lap%2?MB_A*.85:MB_A*.15,x1=F.lap%2?MB_A*.15:MB_A*.85;
 for(let i=0;i<n;i++){const t=T0+i*T.sub,u=i/(n-1),bx=x0+(x1-x0)*u;pts.push([bx,.3,t]);
  for(let j=0;j<sz.spray;j++){const x=Math.max(.04,Math.min(MB_A-.04,bx+(rng()-.5)*MB_A*.55)),y=.05+rng()*.9;mbDrop(F,t+j*Math.min(.02,.04/Math.max(1,sz.spray-1)),x,y,.02+.022*rng(),c,.45,true);}
  const d=7+[0,1,2,3,4,3,2,1][i%8]+(Math.floor(i/8)%2?2:0);notes.push([t,T.inst.spark,mbNote(T.key,T.scale,d)+12,.075+(i%T.subs===0?.03:0),.6,-.5+u]);}
 mbFx(F,T0-.1,'pintaRec','pinzell2',.16,0,1.1);
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes,.18);mbMel(T,F.bar+b,t,notes,.14);}
 mbNotes(F,notes);F.tools.push({kind:'spray',pts,col:c,t0:T0-.5,t1:T0+n*T.sub+.4});F.bar+=bars;return T0+bars*mbBarLen(T)+.6;}

// The gesture: the passes of the sheet's stylus, comb or fan, each with its run of notes.
const mbPassBars=(T,n)=>Math.max(1,Math.round((n>=3?2.1:2.6)/mbBarLen(T)));
function mbGesture(F,s,T0,passes,k=3){const T=mbTaller(F),rng=mbRng(F,k),notes=[];let t=T0;
 for(const p of passes){const bars=p.k==='flower'?3:mbPassBars(T,passes.length),t1=t+bars*mbBarLen(T);
  if(p.k==='flower')mbFlower(F,T,{...MB_FLOWERS[p.f]||{},f:p.f,pts:[[p.x,p.y]],R:p.R},t,t1,notes,rng);else mbPass(F,T,p,t,t1,notes,rng);
  for(let b=0;b<bars;b++){const tb=t+b*mbBarLen(T);mbBass(T,F.bar+b,tb,notes,.19);mbMel(T,F.bar+b,tb,notes,.15);mbPerc(F,T,F.bar+b,tb);}
  F.bar+=bars;t=t1;}
 mbNotes(F,notes);return t+.6;}
function mbPass(F,T,p,t0,t1,notes,rng){const dur=t1-t0,mir=F.lap%2===1;
 switch(p.k){
 case 'comb':case 'gelgit':case 'wave':{const h=p.dir!=='v',o={kind:'tine',t0,dur,soft:.09,z:p.z,w:p.w,sp:p.sp,off:rng()*p.sp,alt:p.k==='gelgit'||!!p.alt,amp:p.amp||0,fr:p.wl?2*Math.PI/p.wl:0,ph:rng()*6.283,tri:!!p.tri};
  if(h)Object.assign(o,{bx:mir?MB_A+.15:-.15,by:0,mx:mir?-1:1,my:0,nx:0,ny:1,L:MB_A+.3});else Object.assign(o,{bx:0,by:-.15,mx:0,my:1,nx:1,ny:0,L:1.3});
  mbQueue(F.ink,o);F.tools.push({kind:o.alt?'comb2':'comb',op:o,t0:t0-.4,t1:t1+.3});mbGliss(T,t0,t1,notes,{from:p.k==='wave'?4:2});
  mbFx(F,t0,'pouRec','escombra',.08,0,.8+.2*rng(),Math.min(2.1,dur));break;}
 case 'curl':{const pts=[];for(let r=0;r<p.ny;r++)for(let c=0;c<p.nx;c++)pts.push([(c+.5)/p.nx,(r+.5)/p.ny,(r+c)%2?-1:1]);
  const step=dur/pts.length;pts.forEach(([fx,fy,sg],i)=>{const o={kind:'circle',cx:mbX(F,fx),cy:fy,r:0,z:p.z*sg,w:p.w,t0:t0+i*step,dur:Math.min(1.1,step*2.2)};mbQueue(F.ink,o);});
  F.tools.push({kind:'curl',pts:pts.map(([fx,fy],i)=>[mbX(F,fx),fy,t0+i*step]),r:p.w*.5,t0:t0-.3,t1:t1+.3});pts.forEach((_,i)=>{const d=4+[0,2,4,2][i%4]+Math.floor(i/4);notes.push([t0+i*step,T.inst.gliss,mbNote(T.key,T.scale,d)+12,.12,1]);});break;}
 case 'vortex':{const tl=[];for(const [fx,fy,sg] of p.pts){const o={kind:'circle',cx:mbX(F,fx),cy:fy,r:0,z:p.z*sg*(mir?-1:1),w:p.w,t0,dur};mbQueue(F.ink,o);tl.push([o.cx,o.cy,sg*(mir?-1:1)]);}
  F.tools.push({kind:'vortex',pts:tl,r:p.w*.55,t0:t0-.3,t1:t1+.3});mbGliss(T,t0,t1,notes,{from:0,span:11,vel:.1});mbFx(F,t0,'pouRec','tollOnes',.12,0,.8);break;}
 case 'spiral':{const n=p.rings.length,step=dur/n,sg=mir?-1:1;mbQueue(F.ink,{kind:'circle',cx:mbX(F,p.x),cy:p.y,r:0,z:p.vz*sg,w:p.vw,t0,dur});p.rings.forEach((r,i)=>{mbQueue(F.ink,{kind:'circle',cx:mbX(F,p.x),cy:p.y,r,z:p.z*sg,w:p.w,t0:t0+i*step,dur:step*1.15});});
  F.tools.push({kind:'spiral',cx:mbX(F,p.x),cy:p.y,rings:p.rings,t0,t1,step});mbGliss(T,t0,t1,notes,{from:9,span:-7,vel:.11});break;}
 case 'fan':{mbQueue(F.ink,{kind:'shear',axis:p.axis,amp:p.amp,fr:2*Math.PI/p.wl,ph:rng()*6.283,t0,dur});F.tools.push({kind:'fan',axis:p.axis,t0:t0-.4,t1:t1+.3});
  mbGliss(T,t0,t1,notes,{from:0,span:7,vel:.08,inst:T.inst.cad});mbFx(F,t0,'sabanaRec','aire',.16,0,.9);break;}
 // a comb drawn on a slant (th degrees from across, downwards positive): it starts outside one corner and crosses the whole bath
 case 'diag':{const th=p.th*Math.PI/180,mx=(mir?-1:1)*Math.cos(th),my=Math.sin(th),ss=[[0,0],[MB_A,0],[0,1],[MB_A,1]].map(([x,y])=>x*mx+y*my),s0=Math.min(...ss)-.15,s1=Math.max(...ss)+.15;
  const o={kind:'tine',t0,dur,soft:.09,z:p.z,w:p.w,sp:p.sp,off:rng()*p.sp,alt:!!p.alt,amp:p.amp||0,fr:p.wl?2*Math.PI/p.wl:0,ph:rng()*6.283,tri:!!p.tri,bx:mx*s0,by:my*s0,mx,my,nx:-my,ny:mx,L:s1-s0};
  mbQueue(F.ink,o);F.tools.push({kind:o.alt?'comb2':'comb',op:o,t0:t0-.4,t1:t1+.3});mbGliss(T,t0,t1,notes,{from:3});mbFx(F,t0,'pouRec','escombra',.08,0,.8+.2*rng(),Math.min(2.1,dur));break;}
 // a breath on a slant: the water slides along slanting rows
 case 'rock':{const th=p.th*Math.PI/180,mx=(mir?-1:1)*Math.cos(th),my=Math.sin(th);mbQueue(F.ink,{kind:'shear',axis:'d',mx,my,amp:p.amp,fr:2*Math.PI/p.wl,ph:rng()*6.283,t0,dur});
  F.tools.push({kind:'fan',axis:'d',t0:t0-.4,t1:t1+.3});mbGliss(T,t0,t1,notes,{from:1,span:8,vel:.08,inst:T.inst.cad});mbFx(F,t0,'sabanaRec','aire',.16,0,.9);break;}
 // the stylus drawn from side to side across the stripes in a zigzag: every stripe takes the zigzag
 case 'zig':{const ph=rng()*6.283,fr=2*Math.PI/p.wl;mbQueue(F.ink,{kind:'shear',axis:'y',tri:true,amp:p.amp,fr,ph,t0,dur});
  const n=Math.max(4,Math.round(MB_A/(p.wl/2))),strokes=[],xs=Array.from({length:n+1},(_,i)=>-.04+(MB_A+.08)*i/n),P=xs.map(x=>[x,.5+p.amp*1.6*Math.asin(.94*Math.sin(x*fr+ph))/Math.asin(.94)]);if(mir)P.reverse();
  for(let i=0;i<n;i++){const [ax,ay]=P[i],[bx,by]=P[i+1],L=Math.hypot(bx-ax,by-ay),d=dur/n;strokes.push({op:{bx:ax,by:ay,mx:(bx-ax)/L,my:(by-ay)/L,L,soft:.01,t0:t0+i*d,dur:d},t0:t0+i*d,t1:t0+(i+1)*d});notes.push([t0+i*d,T.inst.gliss,mbNote(T.key,T.scale,i%2?3:7)+12,.12,.9]);}
  F.tools.push({kind:'path',strokes,t0:t0-.4,t1:t1+.4});mbFx(F,t0,'pouRec','escombra',.07,0,.8,Math.min(2.4,dur));break;}
 // the stylus along a line: straight (through a row of targets: hearts) or an S across the bath, in short straight strokes
 case 'path':{const pts=(p.pts||mbCurve(p.curve)).map(([fx,fy])=>[mbX(F,fx),fy]),n=pts.length-1,lens=[];let tot=0;for(let i=0;i<n;i++){const L=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);lens.push(L);tot+=L;}
  const strokes=[];let a=t0;for(let i=0;i<n;i++){const d=dur*lens[i]/tot,[ax,ay]=pts[i],[bx,by]=pts[i+1],mx=(bx-ax)/lens[i],my=(by-ay)/lens[i],o={kind:'tine',bx:ax,by:ay,mx,my,nx:-my,ny:mx,L:lens[i],soft:n>1?.03:.06,z:p.z,w:p.w,t0:a,dur:d};
   mbQueue(F.ink,o);strokes.push({op:o,t0:a,t1:a+d});a+=d;}
  F.tools.push({kind:'path',strokes,t0:t0-.4,t1:t1+.4});mbGliss(T,t0,t1,notes,{from:2,span:10,vel:.1});mbFx(F,t0,'pouRec','escombra',.07,0,.7,Math.min(2.4,dur));break;}
 // the spokes of a star: one stroke after another round the centre, outwards (or from outside to the centre), each on its note
 case 'star':{const cx=mbX(F,p.x),cy=p.y,n=p.n||12,step=dur/n,R=p.R||1.1,out=p.dir!=='in',strokes=[];
  for(let i=0;i<n;i++){let a=((p.a0||0)+i*360/n)*Math.PI/180;if(mir)a=Math.PI-a;const ux=Math.cos(a),uy=Math.sin(a),t=t0+i*step;
   const o=out?{kind:'tine',bx:cx+ux*.02,by:cy+uy*.02,mx:ux,my:uy,L:R}:{kind:'tine',bx:cx+ux*R,by:cy+uy*R,mx:-ux,my:-uy,L:R-.05};Object.assign(o,{nx:-o.my,ny:o.mx,soft:.03,z:p.z,w:p.w,t0:t,dur:step*1.15});
   mbQueue(F.ink,o);strokes.push({op:o,t0:t,t1:t+o.dur});notes.push([t,T.inst.gliss,mbNote(T.key,T.scale,(out?3:10)+(out?1:-1)*[0,2,4,2,1,3][i%6])+12,.12,1.1]);}
  F.tools.push({kind:'path',strokes,t0:t0-.4,t1:t1+.4});mbFx(F,t0,'pouRec','escombra',.06,0,1.1,Math.min(2.4,dur));break;}
 // rings drawn round a centre one after another, each the other way round: a wheel of zigzags
 case 'rosette':{const n=p.rings.length,step=dur/n,sg=p.rings.map((_,i)=>(i%2?-1:1)*(mir?-1:1)),cx=mbX(F,p.x);
  p.rings.forEach((r,i)=>{mbQueue(F.ink,{kind:'circle',cx,cy:p.y,r,z:p.z*sg[i]*Math.max(.6,r/.25),w:p.w,t0:t0+i*step,dur:step*1.15});notes.push([t0+i*step,T.inst.gliss,mbNote(T.key,T.scale,2+2*i)+12,.13,1.4]);});
  F.tools.push({kind:'spiral',cx,cy:p.y,rings:p.rings,sg,t0,t1,step});mbGliss(T,t0+step*.5,t1,notes,{from:6,span:-5,vel:.07,inst:T.inst.cad});break;}}}
// an S across the bath (fractions of the bath)
const mbCurve=()=>Array.from({length:17},(_,i)=>{const u=i/16;return [-.04+1.08*u,.5+.3*Math.sin(2*Math.PI*1.15*u+.35)];});

// A flower: rings of colour dropped at each centre on the arpeggio, then the stylus draws through them on a run of notes.
function mbFlower(F,T,fl,t0,t1,notes,rng){const R=fl.R||.25,pts=(fl.pts||[[.5,.5]]).map(([fx,fy])=>[mbX(F,fx),fy]),C=mbStepCols(F),cols=[C.rc[0],C.o[0],C.o[1%C.o.length],C.o[0]],half=t0+(t1-t0)*.42,drops=[];
 for(let k=0;k<4;k++)for(const p of pts)drops.push([p,cols[k]]);
 const dt=(half-t0)/drops.length,brush=[];drops.forEach(([p,col],i)=>{const t=t0+i*dt;mbDrop(F,t,p[0],p[1],R/2,col,.8);brush.push([p[0],p[1],t]);});
 const arp=[];for(let b=0;b<3;b++)arp.push(...mbArp(T,F.bar+b,T.arp.length));drops.forEach((_,i)=>notes.push([t0+i*dt,T.inst.arp,arp[i%arp.length],.17,1.4]));mbBrush(F,brush);
 const strokes=[];for(const [x,y] of pts){const S=(ax,ay,bx,by,z,w)=>strokes.push({ax,ay,bx,by,z,w});
  switch(fl.f){
  case 'cor':S(x,y-R*1.35,x,y+R*1.3,R*.55,R*.18);break;
  case 'tulipa':S(x,y+R*1.6,x,y-R*.35,R*.6,R*.2);S(x-R*.34,y-R*1.5,x-R*.34,y-R*.28,R*.32,R*.11);S(x+R*.34,y-R*1.5,x+R*.34,y-R*.28,R*.32,R*.11);break;
  case 'rosa':strokes.push({vortex:true,x,y,z:R*.22,w:R*.35});for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;S(x+Math.cos(a)*R*1.35,y+Math.sin(a)*R*1.35,x+Math.cos(a)*R*.25,y+Math.sin(a)*R*.25,R*.3,R*.1);}break;
  case 'crisantem':for(let i=0;i<8;i++){const a=i*Math.PI/4+.2;S(x+Math.cos(a)*R*1.4,y+Math.sin(a)*R*1.4,x+Math.cos(a)*R*.15,y+Math.sin(a)*R*.15,R*.35,R*.08);}break;
  case 'estrella':for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3;S(x+Math.cos(a)*R*.05,y+Math.sin(a)*R*.05,x+Math.cos(a)*R*1.45,y+Math.sin(a)*R*1.45,R*.4,R*.1);}break;}}
 const sd=(t1-half)/Math.max(1,strokes.length),tl=[];
 strokes.forEach((st,i)=>{const a=half+i*sd,dur=sd*1.25;
  if(st.vortex){mbQueue(F.ink,{kind:'circle',cx:st.x,cy:st.y,r:0,z:st.z,w:st.w,t0:a,dur});tl.push({vortex:true,x:st.x,y:st.y,r:st.w*.4,t0:a,t1:a+dur});}
  else{const dx=st.bx-st.ax,dy=st.by-st.ay,L=Math.hypot(dx,dy),mx=dx/L,my=dy/L,o={kind:'tine',bx:st.ax,by:st.ay,mx,my,nx:-my,ny:mx,L,soft:.04,z:st.z,w:st.w,t0:a,dur};mbQueue(F.ink,o);tl.push({op:o,t0:a,t1:a+dur});}
  notes.push([a,T.inst.gliss,mbNote(T.key,T.scale,4+i%5+Math.floor(i/5)*2)+12,.12,1.1]);});
 F.tools.push({kind:'stylus',strokes:tl,t0:half-.3,t1:t1+.4});}

// The print: the paper comes down and touches the water on the downbeat, soaks, is lifted on the tune, is shown, flies to the line on
// the cadence (plucked and struck, ringing away), and a strip of paper skims the bath clean.
export const MB_SHOW=1.3,MB_HANG=1.25,MB_SKIM=1.5;
function mbPrint(F,s,T0){const T=mbTaller(F),B=mbBarLen(T),notes=[],touch=T0+B,lift=T0+2*B,shown=T0+3*B,hang=shown+MB_SHOW,skim=hang+MB_HANG,end=skim+MB_SKIM;
 F.print={uid:F.ink.uid,t0:T0,touch,lift,shown,hang,skim,end,polys:mbView(F.ink,F.t).map(p=>({p:p.p.slice(),col:p.col,id:p.id})),g:F.g,j:F.j,lap:F.lap,hungDone:false,skimDone:false};
 // the paper coming down: low plucked notes on the beats; the tune when it lifts
 for(let i=0;i<T.subs/T.beat;i++)notes.push([T0+i*T.beat*T.sub,T.inst.bass,mbNote(T.key,T.scale,T.prog[F.bar%8]+(i%2?4:0))-12,.16,T.beat*T.sub*1.4]);
 mbBass(T,F.bar+1,touch,notes,.18);
 const arp=mbArp(T,F.bar+2,T.arp.length);mbTimes(T,lift,1).forEach(([t],i)=>notes.push([t,T.inst.arp,arp[i],.15,1.5]));mbBass(T,F.bar+2,lift,notes,.2);mbMel(T,F.bar+2,lift,notes,.17);mbPerc(F,T,F.bar+2,lift,.9);
 const arp2=mbArp(T,F.bar+3,T.arp.length,true);mbTimes(T,shown,1).forEach(([t],i)=>notes.push([t,T.inst.arp,arp2[i],.13,1.5]));mbMel(T,7,shown,notes,.16);mbBass(T,7,shown,notes,.18);
 // the cadence as the print flies to the line: a harp roll down to the tonic, a plucked bass, a high struck note; all ring away
 const root=0;[14,11,9,7,4,2,0].forEach((d,i)=>notes.push([hang+i*.07,T.inst.cad,mbNote(T.key,T.scale,root+d)+12,.15-.01*i,3]));notes.push([hang,T.inst.bass,mbNote(T.key,T.scale,root)-12,.22,2.5]);notes.push([hang+.45,'glockRec',mbNote(T.key,T.scale,root+14)+12,.09,2.6]);
 mbFx(F,T0+.05,'sabanaRec','paperLlisca',.2,0,.8);mbFx(F,touch,'pintaRec','full',.22,0,.9);mbFx(F,lift+.1,'masiaRec','desenganxar',.24,0,1);mbFx(F,hang+MB_HANG*.85,'masiaRec','pinces',.2,.3,1);
 mbFx(F,skim,'sabanaRec','paperLlisca',.18,-.3,1.1);mbFx(F,skim+.2,'pouRec','tollOnes',.12,.2,1);
 mbNotes(F,notes);F.bar+=4;return end;}

// Begin a step of the sheet.
function mbStepBegin(F,s,kind){const T0=F.t+(kind==='print'?.1:MB_LEAD),n=mbStepsN(s),g=mbGestures(s),sh=mbSheet(F),fl=MB_FLOWERS[sh.flower]||MB_FLOWERS.cor;const first=F.events.length;let end;
 const C=mbStepCols(F),o=i=>C.o[i%C.o.length];
 switch(kind){
 case 'rain':end=mbRain(F,s,T0,{cols:n===3&&g!=='gotes'&&C.rc.length<2?[C.rc[0],o(0)]:C.rc,cover:1.25,k:0,lay:sh.lay});break;
 case 'rings':end=mbRings(F,s,T0,{col:o(0),k:1,mode:sh.rm||'in'});break;
 case 'spray':end=mbSpray(F,s,T0,{col:o(1),k:2});break;
 case 'rain2':end=mbRain(F,s,T0,{cols:[o(2)],cover:.55,k:4,mel:true});break;
 case 'rings2':end=mbRings(F,s,T0,{col:o(3),k:5,scale:.42});break;
 case 'spray2':end=mbSpray(F,s,T0,{col:o(4),k:6});break;
 case 'gesture':end=mbGesture(F,s,T0,sh.gesture,3);break;
 case 'gesture2':end=mbGesture(F,s,T0,sh.gesture2,7);break;
 case 'flower':{const T=mbTaller(F),notes=[],B=mbBarLen(T),bars=Math.max(2,Math.round(5.2/B)),t1=T0+bars*B;mbFlower(F,T,fl,T0,t1,notes,mbRng(F,8));for(let b=0;b<bars;b++){mbBass(T,F.bar+b,T0+b*B,notes,.18);mbMel(T,F.bar+b,T0+b*B,notes,.14);}mbNotes(F,notes);F.bar+=bars;end=t1+.8;break;}
 case 'print':end=mbPrint(F,s,T0);break;}
 // the new events in time order after the ones already played
 const fresh=F.events.splice(first).sort((a,b)=>a.t-b.t);F.events.push(...fresh);
 const opsEnd=F.ink.ops.reduce((m,o)=>Math.max(m,o.t0+o.dur),0);F.end=Math.max(end,opsEnd+.2);F.kind=kind;F.at=F.t;F.phase=kind==='print'?'print':'step';F.cues.push('step:'+kind);}

// A press during a step (when presses are not locked): what has not begun yet is dropped and the next step begins at once.
function mbCut(F){F.events=F.events.filter((e,i)=>i<F.ev||e.t<=F.t);F.ev=Math.min(F.ev,F.events.length);F.ink.ops=F.ink.ops.filter(o=>o.begun);F.falls=F.falls.filter(f=>f.t1<=F.t);for(const T of F.tools)T.t1=Math.min(T.t1,F.t+.3);}

export function mbBlocked(game,s){const F=game?.marbre;if(!F)return false;if(F.phase==='print')return true;if(F.phase==='step')return s?.lock!==false;return false;}
export function mbPress(game,s){const F=game?.marbre;if(!F||F.phase==='print')return false;
 if(F.phase==='step'){if(s?.lock!==false)return false;mbCut(F);}
 const plan=mbPlan(s);if(F.step>=plan.length)F.step=0;
 // a sheet that changed its number of steps half way finishes with its print
 const kind=F.step>0&&F.step===plan.length-1?'print':plan[F.step];
 F.presses++;mbStepBegin(F,s,kind);F.step++;game.count=F.step;F.wait=escWaitTurn(F.wait,'run',F.t);return true;}

export function mbTick(game,s,dt){const F=game?.marbre;if(!F)return;F.t+=dt;mbAdvance(F.ink,F.t);
 if(F.phase==='step'&&F.t>=F.end){F.phase='rest';F.wait=escWaitTurn(F.wait,'wait',F.t);F.done++;game.completed=F.done;}
 if(F.phase==='print'){const P=F.print;
  if(!P.hungDone&&F.t>=P.hang+MB_HANG){P.hungDone=true;F.hung.push({id:++F.prints,uid:P.uid,polys:P.polys,g:P.g,j:P.j,lap:P.lap,at:F.t});if(F.hung.length>8)F.hung.shift();F.cues.push('hang');}
  if(!P.skimDone&&F.t>=P.skim+MB_SKIM*.55){P.skimDone=true;F.ghost=null;F.ink=mbInk(MB_A);F.bar=0;F.j++;if(F.j>=4){F.j=0;F.prevG=F.g;F.g=(F.g+1)%MB_TALLERS.length;F.changeAt=F.t;if(F.g===F.first)F.lap++;}}
  if(F.t>=P.end){F.phase='rest';F.step=0;game.count=0;F.print=null;F.wait=escWaitTurn(F.wait,'wait',F.t);F.done++;game.completed=F.done;F.cues.push('sheet');}}
 if(F.falls.length>200||F.falls.length&&F.falls[0].t1<F.t-2)F.falls=F.falls.filter(f=>f.t1>F.t-1);
 if(F.tools.length&&F.tools[0].t1<F.t-1)F.tools=F.tools.filter(T=>T.t1>F.t-.5);
 if(F.ev>400){F.events.splice(0,F.ev);F.ev=0;}}

// The words for a screen reader (no words are ever drawn in the scene).
export function mbStatus(game,s){const F=game?.marbre;if(!F)return '';const T=mbTaller(F),sh=mbSheet(F);
 if(F.phase==='print')return `El paper s’endú l’estampa del full ${sh.name} i es penja a l’estenedor.`;
 if(F.phase==='step')return {rain:'Plouen gotes de color sobre l’aigua.',rain2:'Plouen gotes d’un altre color.',rings:'Gotes d’un altre color cauen dins les primeres i fan anells.',rings2:'Més anells, d’un altre color.',spray:'Una pluja fina esquitxa tot el bany.',spray2:'Una altra pluja fina.',gesture:`El punxó i la pinta dibuixen el full ${sh.name}.`,gesture2:'Un segon gest acaba el dibuix.',flower:'El punxó dibuixa una flor.'}[F.kind]||'';
 if(F.step===0)return `${T.name}, ${T.place}: el bany espera el full ${sh.name}.`;return `${T.name}: full ${sh.name}, pas ${F.step} de ${mbPlan(s).length}.`;}
export function mbProgress(game,s){const F=game?.marbre;if(!F)return '';const n=mbPlan(s).length,done=F.phase==='print'?n:F.step;return Array.from({length:n},(_,i)=>`<span class="${i<done?'done':''}"></span>`).join('');}

// ── Sounds ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Every note is a recording of a real instrument (plucked, struck or blown); the drops, the brush, the comb in the water, the paper,
// its peeling and the pegs are recordings of the collection's banks (CREDITS.md): pintaRec, pouRec, masiaRec, sabanaRec, natureRec.
class MbSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.loops=new Map();this.active=new Set();}
 zone(bank,name){const z=sampleZone(bank,0,name);return z&&z.buffer?z:null;}
 one(bank,name,level=1,pan=0,when=0,rate=1,dur=0){const z=this.zone(bank,name);if(!z)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift);if(dur>0){g.gain.setValueAtTime(level,t+dur*.7);g.gain.linearRampToValueAtTime(0,t+dur);o.stop(t+dur+.05);}
  this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 loop(key,bank,name,level,tc=.6){let L=this.loops.get(key);const c=this.context;
  if(!L){if(level<.002)return;const z=this.zone(bank,name);if(!z)return;const o=c.createBufferSource(),g=c.createGain();o.buffer=z.buffer;o.loop=true;const a=(z.loopStart??z.offset??0)+z.shift,e=(z.loopEnd??z.buffer.duration-z.shift)+z.shift;o.loopStart=a;o.loopEnd=Math.min(z.buffer.duration,e);g.gain.value=0;
   o.connect(g);g.connect(this.input);o.start(c.currentTime,a+Math.random()*Math.max(0,o.loopEnd-a));L={o,g};this.loops.set(key,L);}
  L.g.gain.setTargetAtTime(level,c.currentTime,tc);if(level<.002&&L.g.gain.value<.003){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();this.loops.delete(key);}}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();for(const [,L] of this.loops){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();}this.loops.clear();}}
let MB_BUS=null;
const mbBus=(ctx,out)=>{if(!ctx||!out)return null;if(!MB_BUS||MB_BUS.context!==ctx)MB_BUS=new MbSound(ctx,out);return MB_BUS;};
export function mbSilence(){MB_BUS?.stop();}
// Each frame: the events whose time comes within half a second are given to the audio at their exact delay, so a drop and its
// note meet; the air of the workshop goes on underneath, quieter while the bath waits.
export function mbAudio(game,s,ctx,out,play){const F=game?.marbre;if(!F)return;F.cues.splice(0);
 if(!s.sound||ctx?.state!=='running'){while(F.ev<F.events.length&&F.events[F.ev].t<F.t+.5)F.ev++;return;}
 const bus=mbBus(ctx,out);if(!bus)return;
 // the sound leaves the speakers a little after it is scheduled (the output latency of the device, often 10–40 ms): it is
 // scheduled that much earlier, so that it is heard at the moment the drop touches the water
 const lat=Math.min(.1,Math.max(0,ctx.outputLatency||ctx.baseLatency||0));
 while(F.ev<F.events.length&&F.events[F.ev].t<F.t+.5){const e=F.events[F.ev++];if(e.t<F.t-.12)continue;const d=Math.max(0,e.t-F.t-lat);if(e.fx)bus.one(e.bank,e.name,e.level,e.pan,d,e.rate,e.dur);else play(e,d,e.len);}
 const T=mbTaller(F),wk=F.wait?escWaitClock(F.wait,F.t):{dark:0},airK=1-.5*(wk.dark||0);
 bus.loop('air'+T.id,T.air[0],T.air[1],MB_AIR*T.air[2]*airK,.9);for(const o of MB_TALLERS)if(o.id!==T.id&&bus.loops.has('air'+o.id))bus.loop('air'+o.id,o.air[0],o.air[1],0,.9);}

// for the tests: the notes and drops of a step land together
export const mbDropTimes=F=>F.falls.map(f=>f.t1);

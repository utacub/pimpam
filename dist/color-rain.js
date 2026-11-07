// La nova Pluja de colors (CE03), 0.52 · the model: the steps of a sheet of marbled paper, the print, the clothesline, the change
// of workshop, the wait for the next press; and (further down) the music and the sounds, which drive the ink: every drop touches
// the water exactly on its note.
// Marc, 7 November 2026: plan «La nova Pluja de colors» approved («ja pots començar a programar la pluja de colors, una part molt
// bonica de l'activitat original era la sincronia entre les gotes i les notes, mira de mantenir-ho»).
// One press is one step of a sheet: the first rain, a second colour that makes rings, a fine spray, the stylus or the comb, and the
// print (a sheet of paper is laid on the water, lifted, shown and hung on the line). Settings: steps of a sheet (3, 5, 7), gestures
// (only drops, drops and combs, complete with flowers), size of the drops, colours, clothesline, first workshop.
import {escWaitTurn,escWaitClock,escFit,escInto} from './escenari.js';
import {sampleZone} from './sampler.js';
import {MB_TALLERS,mbNote} from './marbre-tallers.js';
import {mbInk,mbQueue,mbAdvance,mbView} from './marbre-tinta.js';

// The catalogue's card: the activity keeps its id, its name and its code (CE03) and goes to «Formes, llum i música».
export const PC_CAUSE=Object.freeze({id:'color-rain',code:'CE03',type:'ce',level:'01 · Descobrir',name:'Pluja de colors',desc:'Plou color sobre una cubeta d’aigua i es fa paper marbrejat: vint fulls de cinc tallers, amb música d’instruments reals.',tag:'20 fulls marbrejats · 5 tallers',time:'Al teu ritme',marbre:true,recorded:true});
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
function mbGrid(n,rng){const cols=Math.max(2,Math.round(Math.sqrt(n*MB_A))),rows=Math.ceil(n/cols),out=[];for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(out.length>=n)break;const cc=r%2?cols-1-c:c;out.push([(cc+.5+(rng()-.5)*.25)*MB_A/cols,(r+.5+(rng()-.5)*.25)/rows]);}return out;}

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
function mbDrop(F,t,x,y,r,col,dur=.9,small=false){mbQueue(F.ink,{kind:'drop',cx:x,cy:y,r,col,t0:t,dur});F.falls.push({x,y,r,col,t0:t-(small?.22:MB_FALL),t1:t,small,g:F.g,lap:F.lap});}
function mbTimes(T,t0,bars,pos=T.arp){const out=[];for(let b=0;b<bars;b++)for(const p of pos)out.push([t0+(b*T.subs+p)*T.sub,b]);return out;}
const mbBrush=(F,pts,kind='brush')=>{if(pts.length)F.tools.push({kind,pts,t0:pts[0][2]-.6,t1:pts[pts.length-1][2]+.5});};

// The first rain (and the second, rain2): the drops land on the arpeggio, one colour (or two, when the sheet has only three steps).
function mbRain(F,s,T0,{cols=[0],cover=1.25,k=0,mel=false}={}){const T=mbTaller(F),sh=mbSheet(F),rng=mbRng(F,k),bars=2,times=mbTimes(T,T0,bars),sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],brush=[];
 if(T.rings&&sh.layout==='rings'){// suminagashi: rings of ink and of clear water at a few centres, one drop at every centre on every note
  const nc=sz.rings,cs=mbScatter(nc,rng,.22),rr=.46/Math.sqrt(times.length)*Math.sqrt(2/nc);
  times.forEach(([t],i)=>{const ink=i%2===0,col=ink?(sh.two?cols.concat([1])[(i/2)%2|0]:cols[(i/2|0)%cols.length]):-1;cs.forEach((c,ci)=>mbDrop(F,t+ci*.015,c[0],c[1],rr,col,1.1));brush.push([cs[i%nc][0],cs[i%nc][1],t]);});
  F.r0=rr;F.centres=cs;}
 else{const N=times.length*sz.per,pts=sh.layout==='grid'?mbGrid(N,rng):mbScatter(N,rng,.06),r=Math.sqrt(MB_A*cover/(N*Math.PI));
  pts.forEach((p,i)=>{const [t]=times[Math.floor(i/sz.per)],x=F.lap%2?MB_A-p[0]:p[0];mbDrop(F,t+(i%sz.per)*.012,x,p[1],r*(.85+.3*rng()),cols[Math.floor(i/sz.per)%cols.length]);if(i%sz.per===0)brush.push([x,p[1],t]);});
  F.r0=r;}
 const arp=[];for(let b=0;b<bars;b++)arp.push(...mbArp(T,F.bar+b,T.arp.length));
 times.forEach(([t],i)=>{notes.push([t,T.inst.arp,arp[i],i%T.arp.length===0?.22:.16,1.6,-.3+.6*(brush[i]?.[0]??MB_A/2)/MB_A]);mbFx(F,t,'pintaRec','gota',.1+.05*rng(),(brush[i]?.[0]??MB_A/2)/MB_A*1.2-.6,.85+.35*rng());});
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes);if(mel)mbMel(T,F.bar+b,t,notes,.13);}
 mbNotes(F,notes);mbBrush(F,brush);F.bar+=bars;return T0+bars*mbBarLen(T)+1;}

// A second colour that falls inside the first drops and makes rings (rings2: a third colour inside those).
function mbRings(F,s,T0,{col=1,k=1,scale=.55}={}){const T=mbTaller(F),sh=mbSheet(F),rng=mbRng(F,k),bars=2,times=mbTimes(T,T0,bars),sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],brush=[];
 if(T.rings&&sh.layout==='rings'){const cs=mbScatter(Math.max(1,sz.rings-1),rng,.2,F.centres||[]),rr=(F.r0||.12)*.8;
  times.forEach(([t],i)=>{const c=cs[i%cs.length],ink=Math.floor(i/cs.length)%2===0;mbDrop(F,t,c[0],c[1],rr,ink?col:-1,1.1);brush.push([c[0],c[1],t]);});}
 else{const N=times.length*sz.per,inView=F.ink.polys.filter(p=>p.col>=0&&p.cx>.06&&p.cx<MB_A-.06&&p.cy>.06&&p.cy<.94),cand=mbPath(inView.slice(-N).map(p=>[p.cx,p.cy]));
  const extra=N>cand.length?mbScatter(N-cand.length,rng,.08,cand):[],pts=cand.concat(extra),r=(F.r0||.15)*scale;
  pts.forEach((p,i)=>{const [t]=times[Math.floor(i/sz.per)];mbDrop(F,t+(i%sz.per)*.012,p[0],p[1],r*(.85+.3*rng()),col);if(i%sz.per===0)brush.push([p[0],p[1],t]);});}
 const arp=[];for(let b=0;b<bars;b++)arp.push(...mbArp(T,F.bar+b,T.arp.length,true));
 times.forEach(([t],i)=>{notes.push([t,T.inst.arp,arp[i],i%T.arp.length===0?.2:.15,1.6,-.3+.6*(brush[i]?.[0]??MB_A/2)/MB_A]);mbFx(F,t,'pintaRec','gota',.09+.04*rng(),0,1.1+.3*rng());});
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes);mbMel(T,F.bar+b,t,notes);}
 mbNotes(F,notes);mbBrush(F,brush);F.bar+=bars;return T0+bars*mbBarLen(T)+1.1;}

// The fine spray: the brush is tapped on a rod and a rain of small drops falls all over; each note of a quick run lets a few fall.
function mbSpray(F,s,T0,{col=2,k=2}={}){const T=mbTaller(F),sh=mbSheet(F),rng=mbRng(F,k),bars=2,n=T.subs*bars,sz=MB_SIZE[s?.mbSize]||MB_SIZE.grans,notes=[],pts=[];
 const c=T.rings&&sh.layout==='rings'?-1:col,x0=F.lap%2?MB_A*.85:MB_A*.15,x1=F.lap%2?MB_A*.15:MB_A*.85;
 for(let i=0;i<n;i++){const t=T0+i*T.sub,u=i/(n-1),bx=x0+(x1-x0)*u;pts.push([bx,.3,t]);
  for(let j=0;j<sz.spray;j++){const x=Math.max(.04,Math.min(MB_A-.04,bx+(rng()-.5)*MB_A*.55)),y=.05+rng()*.9;mbDrop(F,t+j*.02,x,y,.02+.022*rng(),c,.45,true);}
  const d=7+[0,1,2,3,4,3,2,1][i%8]+(Math.floor(i/8)%2?2:0);notes.push([t,T.inst.spark,mbNote(T.key,T.scale,d)+12,.075+(i%T.subs===0?.03:0),.6,-.5+u]);}
 mbFx(F,T0-.1,'pintaRec','pinzell2',.16,0,1.1);
 for(let b=0;b<bars;b++){const t=T0+b*mbBarLen(T);mbBass(T,F.bar+b,t,notes,.18);mbMel(T,F.bar+b,t,notes,.14);}
 mbNotes(F,notes);F.tools.push({kind:'spray',pts,t0:T0-.5,t1:T0+n*T.sub+.4});F.bar+=bars;return T0+bars*mbBarLen(T)+.6;}

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
  mbGliss(T,t0,t1,notes,{from:0,span:7,vel:.08,inst:T.inst.cad});mbFx(F,t0,'sabanaRec','aire',.16,0,.9);break;}}}

// A flower: rings of colour dropped at each centre on the arpeggio, then the stylus draws through them on a run of notes.
function mbFlower(F,T,fl,t0,t1,notes,rng){const R=fl.R||.25,pts=(fl.pts||[[.5,.5]]).map(([fx,fy])=>[mbX(F,fx),fy]),cols=[0,1,2,1],half=t0+(t1-t0)*.42,drops=[];
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
 switch(kind){
 case 'rain':end=mbRain(F,s,T0,{cols:n===3&&g!=='gotes'?[0,1]:[0],cover:1.25,k:0});break;
 case 'rings':end=mbRings(F,s,T0,{col:1,k:1});break;
 case 'spray':end=mbSpray(F,s,T0,{col:2,k:2});break;
 case 'rain2':end=mbRain(F,s,T0,{cols:[3],cover:.55,k:4,mel:true});break;
 case 'rings2':end=mbRings(F,s,T0,{col:3,k:5,scale:.42});break;
 case 'spray2':end=mbSpray(F,s,T0,{col:3,k:6});break;
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

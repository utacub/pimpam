// Dibuixos que ballen (CE32, 0.25): the line drawings and how they are drawn. Each drawing is one thick line of colour on black
// (or with a dark edge on white): it draws itself in about a second and a half, dances on itself to its own music and stops.
// A drawing is made of parts. Units: the drawing is about 1000 units high, centred on (0, 0), with y downwards. A part has its lines
// (polylines) or a shape that changes with the music, dots (filled circles), a pivot and a movement; its children move with it. The
// lines are transformed point by point, so a part that is squashed or stretched keeps the thickness of its line.
// Only people have a face (Marc, 30 October 2026); vehicles and instruments have none.
import {Kclamp,Ksmooth,K_TAU} from './kaleido-base.js';

const DW_FLAT=10,DW_PI=Math.PI;
// ── Lines ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A polyline from a flat list of coordinates.
export const dwLine=(...p)=>{const out=[];for(let i=0;i+1<p.length;i+=2)out.push([p[i],p[i+1]]);return out;};
// An arc of an ellipse (a whole ellipse by default), turned by rot.
export function dwArc(cx,cy,rx,ry=rx,a0=0,a1=K_TAU,rot=0){const n=Math.max(6,Math.ceil(Math.abs(a1-a0)*Math.max(rx,ry)/DW_FLAT)),cr=Math.cos(rot),sr=Math.sin(rot),out=[];
 for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=Math.cos(a)*rx,y=Math.sin(a)*ry;out.push([cx+x*cr-y*sr,cy+x*sr+y*cr]);}return out;}
// A rectangle with round corners, drawn from the top edge clockwise.
export function dwRound(x,y,w,h,r){r=Math.min(r,w/2,h/2);return [[x+r,y],...dwArc(x+w-r,y+r,r,r,-DW_PI/2,0),...dwArc(x+w-r,y+h-r,r,r,0,DW_PI/2),...dwArc(x+r,y+h-r,r,r,DW_PI/2,DW_PI),...dwArc(x+r,y+r,r,r,DW_PI,1.5*DW_PI)];}
const dwBez=(out,p0,p1,p2,p3)=>{const n=Math.max(2,Math.ceil((Math.hypot(p1[0]-p0[0],p1[1]-p0[1])+Math.hypot(p2[0]-p1[0],p2[1]-p1[1])+Math.hypot(p3[0]-p2[0],p3[1]-p2[1]))/DW_FLAT));
 for(let i=1;i<=n;i++){const t=i/n,u=1-t;out.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]);}};
// SVG path data (M L H V C S Q T Z, absolute and relative) to polylines, one per subpath.
export function dwPath(d){const tok=d.match(/[MLHVCSQTZmlhvcsqtz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g)||[],out=[];let i=0,cmd='M',cur=[0,0],start=[0,0],line=null,prevC=null,prevQ=null;
 const num=()=>+tok[i++];
 while(i<tok.length){if(/[A-Za-z]/.test(tok[i]))cmd=tok[i++];const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase(),pt=()=>{const x=num(),y=num();return rel?[cur[0]+x,cur[1]+y]:[x,y];};
  if(C==='Z'){if(line){line.push([...start]);}cur=[...start];line=null;prevC=prevQ=null;continue;}
  if(C==='M'){cur=pt();start=[...cur];line=[[...cur]];out.push(line);cmd=rel?'l':'L';prevC=prevQ=null;continue;}
  if(!line){line=[[...cur]];out.push(line);}
  if(C==='L'){cur=pt();line.push([...cur]);prevC=prevQ=null;}
  else if(C==='H'){const x=num();cur=[rel?cur[0]+x:x,cur[1]];line.push([...cur]);prevC=prevQ=null;}
  else if(C==='V'){const y=num();cur=[cur[0],rel?cur[1]+y:y];line.push([...cur]);prevC=prevQ=null;}
  else if(C==='C'||C==='S'){const p1=C==='C'?pt():prevC?[2*cur[0]-prevC[0],2*cur[1]-prevC[1]]:[...cur],p2=pt(),p3=pt();dwBez(line,cur,p1,p2,p3);prevC=p2;prevQ=null;cur=p3;}
  else if(C==='Q'||C==='T'){const q=C==='Q'?pt():prevQ?[2*cur[0]-prevQ[0],2*cur[1]-prevQ[1]]:[...cur],p3=pt();dwBez(line,cur,[cur[0]+2/3*(q[0]-cur[0]),cur[1]+2/3*(q[1]-cur[1])],[p3[0]+2/3*(q[0]-p3[0]),p3[1]+2/3*(q[1]-p3[1])],p3);prevQ=q;prevC=null;cur=p3;}
  else i++;}
 return out.filter(l=>l.length>1);}
// A part: lines (or shape(m), lines that change with the music), dots [x, y, r], a pivot (at), a movement move(m) → {x, y, r, sx, sy}
// about the pivot, children (kids), the accent colour (acc) and the thickness of its line (lw, 1 = the drawing's line).
export const dwPart=o=>({lines:[],dots:[],kids:[],at:[0,0],lw:1,acc:false,...o});
// Movements, in beats of the music (m.b) and with their strength (m.e, from 0 at rest to 1 while dancing).
export const dwPeak=(b,sharp=2)=>Math.pow(Math.cos(DW_PI*b),2*sharp);             // 1 on every beat, 0 half way
export const dwHop=b=>Math.sin(DW_PI*(b-Math.floor(b)));                         // 0 on every beat, 1 half way: a hop that lands on the beat
export const dwSwing=(b,period=2,phase=0)=>Math.sin(K_TAU*(b/period+phase));      // a swing over a number of beats
export const dwLerp=(a,b,k)=>a+(b-a)*k;

// ── Matrices ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f.
const dwMul=(m,n)=>[m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
function dwLocal(at,p){if(!p)return null;const x=p.x||0,y=p.y||0,r=p.r||0,sx=p.sx??1,sy=p.sy??1;if(!x&&!y&&!r&&sx===1&&sy===1)return null;const c=Math.cos(r),s=Math.sin(r);
 // T(at + (x, y)) · R(r) · S(sx, sy) · T(-at)
 const a=c*sx,b=s*sx,cc=-s*sy,d=c*sy;return [a,b,cc,d,at[0]+x-(a*at[0]+cc*at[1]),at[1]+y-(b*at[0]+d*at[1])];}

// ── Preparing a drawing ──────────────────────────────────────────────────────────────────────────────────────────────────
// Once per drawing: the order in which the lines are drawn (as a pen would: part after part, in the order they are written) and
// the bounds at rest. Each line starts when the pen has drawn the lines before it (s, a fraction of the drawing time) and takes
// a share of it proportional to its length (d), with some overlap so that the drawing flows.
const DW_READY=new WeakMap();
const dwLen=l=>{let s=0;for(let i=1;i<l.length;i++)s+=Math.hypot(l[i][0]-l[i-1][0],l[i][1]-l[i-1][1]);return s;};
export function dwPrepare(art){let ready=DW_READY.get(art);if(ready)return ready;const rest=dwRest(art),items=[];
 const walk=(part,depth)=>{const lines=part.shape?part.shape(rest):part.lines;lines.forEach(l=>items.push({part,len:Math.max(1,dwLen(l))}));part.dots.forEach(d=>items.push({part,len:d[2]*2,dot:true}));part.kids.forEach(k=>walk(k,depth+1));};
 walk(art.root,0);const total=items.reduce((a,x)=>a+x.len,0);let acc=0;const order=new Map();
 for(const it of items){const s=.62*acc/total,d=Math.max(.12,.38+.62*it.len/total*1.5);acc+=it.len;if(!order.has(it.part))order.set(it.part,[]);order.get(it.part).push({s,d:Math.min(d,1-s)});}
 let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;if(art.box)[x0,y0,x1,y1]=art.box;else dwWalk(art,rest,false,(pts)=>{for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}},(x,y,r)=>{x0=Math.min(x0,x-r);x1=Math.max(x1,x+r);y0=Math.min(y0,y-r);y1=Math.max(y1,y+r);});
 ready={order,box:[x0,y0,x1,y1]};DW_READY.set(art,ready);return ready;}
// The rest pose: the moment before the dance starts.
export const dwRest=art=>({b:0,e:0,u:1,still:false,amp:1,art});
// Walks the parts with their movements: line(points, part, index) for each line in the units of the drawing, dot(x, y, r, part, index).
export function dwWalk(art,m,still,line,dot){
 const go=(part,M)=>{const L=dwLocal(part.at,part.move?part.move(m):null),N=L?(M?dwMul(M,L):L):M;
  const lines=part.shape?part.shape(m):part.lines;let k=0;
  for(const l of lines){line(N?l.map(p=>[N[0]*p[0]+N[2]*p[1]+N[4],N[1]*p[0]+N[3]*p[1]+N[5]]):l,part,k++);}
  for(const d of part.dots){const x=N?N[0]*d[0]+N[2]*d[1]+N[4]:d[0],y=N?N[1]*d[0]+N[3]*d[1]+N[5]:d[1],sc=N?Math.sqrt(Math.abs(N[0]*N[3]-N[1]*N[2])):1;dot(x,y,d[2]*sc,part,k++);}
  for(const kid of part.kids)go(kid,N);};
 const R=!still&&art.move?dwLocal(art.pivot||[0,0],art.move(m)):null;go(art.root,R);}

// ── Drawing ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// o: {cx, cy, S (pixels per unit), m (the moment: b, e, u, amp), still, colors: [main, accent], white (base), alpha, lw (pixels)}.
// Lines are gathered by colour and thickness and stroked together: first a soft wide stroke (a glow on black, a dark edge on white),
// then the line itself.
export function dwDraw(c,art,o){const {order}=dwPrepare(art),u=Kclamp(o.m.u),groups=new Map(),dots=[];
 const key=(part)=>`${part.acc?1:0}|${part.lw}`,tip=[];
 dwWalk(art,o.m,o.still,(pts,part,k)=>{const sch=order.get(part)?.[k]||{s:0,d:1},p=u>=1?1:Kclamp((u-sch.s)/sch.d);if(p<=0)return;
  let use=pts;if(p<1){const L=dwLen(pts)*p;let acc=0;use=[pts[0]];for(let i=1;i<pts.length;i++){const sl=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc+sl>=L){const f=sl?(L-acc)/sl:0;use.push([pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f]);break;}acc+=sl;use.push(pts[i]);}tip.push({at:use[use.length-1],part});}
  const g=key(part);if(!groups.has(g))groups.set(g,{part,lines:[]});groups.get(g).lines.push(use);},
  (x,y,r,part,k)=>{const sch=order.get(part)?.[k]||{s:0,d:1},p=u>=1?1:Kclamp((u-sch.s)/sch.d);if(p<=0)return;dots.push({x,y,r:r*Ksmooth(p*1.6),part});});
 const X=x=>o.cx+x*o.S,Y=y=>o.cy+y*o.S,col=part=>part.acc?o.colors[1]:o.colors[0];
 c.save();c.globalAlpha*=o.alpha??1;c.lineCap='round';c.lineJoin='round';
 const trace=(lines)=>{c.beginPath();for(const l of lines){c.moveTo(X(l[0][0]),Y(l[0][1]));for(let i=1;i<l.length;i++)c.lineTo(X(l[i][0]),Y(l[i][1]));}};
 // The soft stroke under the line: a glow of its own colour on black, a dark edge on white.
 for(const {part,lines} of groups.values()){trace(lines);const w=o.lw*part.lw;
  if(o.white){c.strokeStyle=o.edge;c.lineWidth=w+Math.max(3,w*.5);c.stroke();}else{c.save();c.globalAlpha*=.17;c.strokeStyle=col(part);c.lineWidth=w*2.5;c.stroke();c.restore();}
  c.strokeStyle=col(part);c.lineWidth=w;c.stroke();}
 for(const d of dots){const r=Math.max(1,d.r*o.S);if(o.white){c.fillStyle=o.edge;c.beginPath();c.arc(X(d.x),Y(d.y),r+Math.max(1.5,o.lw*.25),0,K_TAU);c.fill();}c.fillStyle=col(d.part);c.beginPath();c.arc(X(d.x),Y(d.y),r,0,K_TAU);c.fill();}
 // The tip of the pen while the drawing draws itself: a small round light where each line is growing.
 if(u<1&&!o.white)for(const t of tip.slice(0,24)){c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(X(t.at[0]),Y(t.at[1]),o.lw*t.part.lw*.42,0,K_TAU);c.fill();}
 c.restore();}

// ── The drawings ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each drawing: its parts (root), the movement of the whole (move, about pivot: the only movement that «Sense desplaçament» leaves
// out), its two colours (the line and the accent), how many beats there are between two of its moments (pulse: a wheel spoke at the
// top, a stick on the drum skin...), which the music marks with a note, the ground (y of what it stands on) and its surroundings
// (env, drawn only with the decor).
const P=dwPart;
// A wheel of radius r with n spokes and a hub, turning one spoke every `every` beats.
export function dwWheel(x,y,r,n,every,o={}){const spokes=[];for(let k=0;k<n;k++){const a=k*K_TAU/n+(o.a0||0);spokes.push(dwLine(x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.2,x+Math.cos(a)*r*.93,y+Math.sin(a)*r*.93));}
 return P({at:[x,y],lines:[dwArc(x,y,r),...spokes],dots:[[x,y,r*.17]],acc:o.acc??true,lw:o.lw??1,spin:K_TAU/n/every,move:m=>({r:m.b*K_TAU/n/every*(o.dir||1)})});}
// A face: two eyes and a smile (people only).
export const dwFace=(x,y,s=1,smile=1)=>({dots:[[x-22*s,y-6*s,8.5*s],[x+22*s,y-6*s,8.5*s]],lines:[dwArc(x,y+10*s,24*s,(14+6*smile)*s,.18*DW_PI,.82*DW_PI)]});
// Tram: a city tram with a lantern roof and a trolley pole. It rocks on its springs on every beat; the wheels turn a spoke every bar.
function dwTram(){const body=P({at:[0,250],move:m=>({y:13*m.e*dwPeak(m.b,2),r:.012*m.e*Math.sin(DW_PI*m.b)}),lines:[dwRound(-720,-230,1440,460,70),dwPath('M-690,-233 Q-672,-294 -580,-298 L580,-298 Q672,-294 690,-233')[0],dwRound(-470,-354,940,56,22),
  ...[0,1,2,3].map(i=>dwRound(-500+i*260,-180,220,150,26)),dwRound(-690,-190,140,400,22),dwRound(550,-190,140,400,22),dwRound(-668,-168,96,124,18),dwRound(572,-168,96,124,18),dwLine(-530,34,530,34),dwLine(-530,74,530,74)],
  dots:[[-720,140,24],[720,140,24]],
  kids:[P({at:[-150,-354],move:m=>({r:.08*m.e*dwSwing(m.b,4)}),lines:[dwLine(-150,-354,-372,-552)],dots:[[-380,-560,22]],acc:true})]});
 return {name:'tram',root:P({lines:[dwLine(-750,252,750,252)],kids:[body,...[-520,-330,330,520].map(x=>dwWheel(x,332,80,5,2))]}),pivot:[0,410],move:m=>({x:46*m.e*dwSwing(m.b,8)}),
  colors:['#ffc23d','#5fd3ff'],pulse:1,ground:412,env:'rails'};}
// Drum: a side drum with its ropes and two sticks. It hops and lands on every beat; the sticks strike the skin in turn.
function dwDrum(){const band=x=>92*Math.sqrt(Math.max(0,1-(x/330)**2)),zig=[];for(let i=0;i<=8;i++){const x=-300+i*75;zig.push([x,i%2?205+band(x)*.96:-86+band(x)*.96]);}
 const stick=side=>P({at:[side*560,-440],acc:true,lw:.9,move:m=>({r:-side*.5*m.e*(1-dwPeak((m.b-(side>0?1:0))/2,3))}),lines:[dwLine(side*560,-440,side*140,-205)],dots:[[side*128,-198,30]]});
 const shell=P({at:[0,342],move:m=>{const k=.075*m.e*dwPeak(m.b,3);return {sx:1+k,sy:1-k};},lines:[dwArc(0,-140,330,92),dwArc(0,-92,330,92,0,DW_PI),dwLine(-330,-140,-330,250),dwLine(330,-140,330,250),dwArc(0,200,330,92,0,DW_PI),dwArc(0,250,330,92,0,DW_PI),zig]});
 return {name:'drum',root:P({kids:[shell,stick(-1),stick(1)]}),pivot:[0,342],move:m=>({y:-80*m.e*dwHop(m.b)}),colors:['#ff5a4a','#ffd23f'],pulse:1,ground:342,env:'stage'};}
// Ballerina: she rises on her toes on the first beat of each bar, opens her arms over two bars and turns (seen flat, as a
// cut-out turns) once every four bars.
function dwBallerina(){const tutu=[];for(let i=0;i<=96;i++){const a=i/96*K_TAU,k=1+.075*Math.abs(Math.sin(8*a));tutu.push([Math.cos(a)*230*k,-52+Math.sin(a)*46*k]);}
 const arm=side=>P({shape:m=>{const k=m.e*(.5-.5*Math.cos(K_TAU*m.b/6)),sx=side*62,ex=side*dwLerp(150,165,k),ey=dwLerp(-165,-430,k),hx=side*dwLerp(175,46,k),hy=dwLerp(-50,-520,k);return [dwPath(`M${sx},-276 Q${ex},${ey} ${hx},${hy}`)[0]];}});
 const turn=m=>{const z=(m.b%12+12)%12;return z<9?1:Math.cos(DW_PI*2*Ksmooth((z-9)/3));};
 const face=dwFace(0,-368);
 const body=P({at:[0,0],move:m=>({sx:m.e>0?dwLerp(1,turn(m),m.e):1}),kids:[
   P({lines:[dwArc(0,-370,62),dwArc(0,-452,30),dwLine(0,-308,0,-283),...face.lines],dots:face.dots}),
   P({lines:dwPath('M-62,-280 Q0,-298 62,-280 C70,-200 48,-130 40,-74 M-62,-280 C-70,-200 -48,-130 -40,-74')}),
   P({at:[0,-52],acc:true,move:m=>({sy:1-.12*m.e*dwPeak(m.b/3,2)}),lines:[tutu]}),
   P({lines:dwPath('M-22,-12 L-18,402 L-12,446 M24,-12 L150,176 L-8,206')}),arm(-1),arm(1)]});
 return {name:'ballerina',root:P({kids:[body]}),pivot:[0,446],move:m=>({y:-26*m.e*dwPeak(m.b/3,2)}),colors:['#ff7ac8','#ffd6f0'],pulse:3,ground:446,env:'stage'};}
// Sailing boat: it rocks over the waves once a bar; the sails fill on the first beat and the pennant flutters.
function dwBoat(){const waves=y=>P({acc:true,shape:m=>{const out=[];for(let x=-660;x<=660;x+=20)out.push([x,y+16*Math.sin(x/62+DW_PI*m.b*.5+y)]);return [out];}});
 const sail=P({shape:m=>{const k=.5+.5*m.e*dwPeak(m.b/2,1);return [dwPath(`M-24,-455 Q${dwLerp(230,330,k)},${dwLerp(-150,-190,k)} 420,96 L-24,96 Z`)[0],dwPath(`M-62,-430 Q${dwLerp(-250,-330,k)},-150 -450,104 L-62,104 Z`)[0]];}});
 const flag=P({acc:true,shape:m=>{const f=Math.sin(K_TAU*m.b/2)*m.e;return [dwPath(`M-42,-500 Q30,${-512+26*f} 118,${-478+14*f} Q30,${-462+18*f} -42,-454`)[0]];}});
 const boat=P({lines:[dwPath('M-540,140 L540,140 Q488,300 310,322 L-330,322 Q-488,300 -540,140 Z')[0],dwLine(-42,140,-42,-500)],dots:[[-220,226,20],[0,226,20],[220,226,20]],kids:[sail,flag]});
 return {name:'boat',root:P({kids:[boat,waves(350),waves(420)]}),pivot:[0,320],move:m=>({r:.07*m.e*dwSwing(m.b,2,.25),y:14*m.e*dwSwing(m.b,2)}),colors:['#ffffff','#4fb6ff'],pulse:2,ground:420,env:'sea'};}
// Trumpet: the pistons go down one after another, one on every beat; the bell sways and rings of sound leave it.
function dwTrumpet(){const piston=(x,k)=>P({at:[x,-150],move:m=>({y:46*m.e*dwPeak((m.b-k)/3,4)}),lines:[dwLine(x,-150,x,-232)],dots:[],kids:[P({lines:[dwArc(x,-246,42,15)],acc:true})]});
 const rings=P({acc:true,lw:.7,shape:m=>{const out=[];for(let j=0;j<3;j++){const f=((m.b+j/3)%1+1)%1,r=230+f*230,span=(.42-.3*f)*m.e;if(span>.03)out.push(dwArc(720,0,r*.55,r,-span,span));}return out;}});
 const bell=P({at:[160,0],move:m=>({r:.06*m.e*dwSwing(m.b,4)}),lines:dwPath('M160,-26 L380,-26 C530,-30 610,-70 700,-196 M160,26 L380,26 C530,30 610,70 700,196').concat([dwArc(705,0,40,198)]),kids:[rings]});
 return {name:'trumpet',root:P({lines:dwPath('M-720,-36 L-690,-24 L-690,24 L-720,36 Z M-690,0 L-160,0 M-150,70 L-470,70 Q-560,70 -560,150 Q-560,230 -470,230 L130,230 Q200,230 200,160 L200,90').concat([dwRound(-156,-150,72,250,22),dwRound(-36,-150,72,250,22),dwRound(84,-150,72,250,22)]),
  kids:[piston(-120,0),piston(0,1),piston(120,2),bell]}),pivot:[0,120],move:m=>({y:-30*m.e*dwHop(m.b),r:-.05*m.e*Math.max(0,dwSwing(m.b,8))}),colors:['#ffc23d','#ff8a3d'],pulse:1,ground:300,env:'stage',box:[-720,-262,990,232]};}
// Juggler: three balls in a cascade, one throw on every beat, from one hand and then the other; he smiles.
function dwJuggler(){const hand=(side,b)=>{const th=DW_PI*(b-(side<0?0:1));return [side*(165+55*Math.cos(th)),-40+28*Math.sin(th)];};
 const ball=(i,b)=>{const k=Math.floor(b-i),phase=b-i-3*Math.floor((b-i)/3),thrown=Math.floor((b-i-phase)+.5),side=((thrown%2)+2)%2?1:-1;
  if(phase<2){const from=hand(side,thrown),to=hand(-side,thrown+2),f=phase/2;return [dwLerp(from[0],to[0],f),dwLerp(from[1],to[1],f)-1880*f*(1-f)];}return hand(-side,b);};
 const balls=P({acc:true,shape:m=>[0,1,2].map(i=>{const [x,y]=ball(i,m.b);return dwArc(x,y-42,40);})});
 const arms=P({shape:m=>[-1,1].map(side=>{const [hx,hy]=hand(side,m.b);return dwPath(`M${side*72},-262 Q${side*190},-170 ${hx},${hy}`)[0];})});
 const face=dwFace(0,-372);
 return {name:'juggler',root:P({lines:[dwArc(0,-372,64),...face.lines,dwLine(0,-308,0,-290),...dwPath('M-72,-262 L72,-262 L58,40 L-58,40 Z M-58,40 L-110,410 L-170,430 M58,40 L110,410 L170,430 M-40,-290 L0,-240 L40,-290'),dwPath('M-70,-430 Q0,-470 70,-430')[0]],dots:face.dots,kids:[arms,balls]}),
  pivot:[0,430],move:m=>({y:-14*m.e*dwPeak(m.b,2)}),colors:['#7dff7a','#ffd23f'],pulse:1,ground:432,env:'circus',box:[-300,-560,300,432]};}
// Hot-air balloon: it floats up and down over two bars; the burner puffs and the envelope fills on the first beat of each bar; the
// basket swings under it.
function dwBalloon(){const env=P({at:[0,20],move:m=>{const k=.035*m.e*dwPeak(m.b/3,2);return {sx:1+k,sy:1+k*.6};},lines:dwPath('M0,-500 C205,-500 340,-400 340,-250 C340,-120 205,-40 110,20 L-110,20 C-205,-40 -340,-120 -340,-250 C-340,-400 -205,-500 0,-500 Z M0,-500 C120,-470 175,-300 55,20 M0,-500 C-120,-470 -175,-300 -55,20 M-330,-200 Q0,-150 330,-200')});
 const flame=P({at:[0,232],acc:true,move:m=>({sy:1+.55*m.e*dwPeak(m.b/3,3),sx:1+.15*m.e*dwPeak(m.b/3,3)}),lines:dwPath('M0,236 C-34,214 -30,186 0,150 C30,186 34,214 0,236 Z')});
 const basket=P({at:[0,20],move:m=>({r:.06*m.e*dwSwing(m.b,6,.25)}),lines:[dwLine(-104,24,-92,262),dwLine(104,24,92,262),dwLine(-38,24,-34,262),dwLine(38,24,34,262),dwRound(-122,262,244,150,24),dwLine(-122,318,122,318)],kids:[flame]});
 return {name:'balloon',root:P({kids:[env,basket]}),pivot:[0,0],move:m=>({y:-60*m.e*dwSwing(m.b,6,.25)}),colors:['#ff8a3d','#ffd23f'],pulse:3,ground:412,env:'sky'};}
// Violin: the bow changes direction on every beat, as the violin plays each note of the tune; the violin leans with the phrase.
function dwViolin(){const d=[Math.cos(-.32),Math.sin(-.32)],c=[0,168],L=560;
 const bow=P({acc:true,move:m=>{const o=240*m.e*Math.cos(DW_PI*m.b)-60*m.e;return {x:o*d[0],y:o*d[1]};},lines:[dwLine(c[0]-L*d[0],c[1]-L*d[1],c[0]+L*d[0],c[1]+L*d[1]),dwRound(c[0]-L*d[0]-24,c[1]-L*d[1]-6,58,58,12)].concat(dwPath(`M${c[0]+L*d[0]},${c[1]+L*d[1]} l18,-44`))});
 const scroll=dwPath('M-30,-430 L-30,-520 M30,-430 L30,-505 C30,-540 64,-560 64,-590 C64,-628 28,-646 0,-640 C-30,-634 -42,-606 -30,-588 C-18,-570 12,-576 14,-596');
 const violin=P({at:[0,440],move:m=>({r:.05*m.e*dwSwing(m.b,6)}),lines:[dwPath('M0,-130 C120,-130 175,-100 175,-30 C175,30 120,50 120,110 C120,160 220,190 220,300 C220,400 120,440 0,440 C-120,440 -220,400 -220,300 C-220,190 -120,160 -120,110 C-120,50 -175,30 -175,-30 C-175,-100 -120,-130 0,-130 Z')[0],dwRound(-28,-430,56,560,24),...scroll,dwLine(-62,-470,-30,-470),dwLine(30,-488,62,-488),
  ...dwPath('M-86,150 C-116,200 -60,250 -92,306 M86,150 C116,200 60,250 92,306 M-60,226 Q0,204 60,226 M-34,330 L34,330 L22,420 L-22,420 Z')],dots:[[-86,150,9],[-92,306,9],[86,150,9],[92,306,9]],kids:[bow]});
 return {name:'violin',root:P({kids:[violin]}),pivot:[0,440],move:m=>({y:-18*m.e*dwPeak(m.b/3,2)}),colors:['#ffb15c','#ff6b8b'],pulse:1,ground:446,env:'notes'};}
// Giant (a gegant of a festa major): he sways from side to side on every beat, his arms swing a moment later, and every four bars
// he turns round (seen flat, as a cut-out turns) with his robe flying out.
function dwGiant(){const turn=m=>{const z=(m.b%16+16)%16;return z<14?0:Ksmooth((z-14)/2);};
 const hem=[];for(let i=0;i<=40;i++){const x=-330+i*16.5;hem.push([x,440+10*Math.sin(i*DW_PI/2.5)]);}
 const arm=side=>P({at:[side*168,-196],move:m=>({r:side*.06+.22*m.e*dwSwing(m.b-.3,2)}),lines:[dwPath(`M${side*168},-196 Q${side*232},-60 ${side*232},70`)[0]],dots:[[side*232,92,24]]});
 const face=dwFace(0,-318,1.45);
 const body=P({at:[0,440],move:m=>{const k=turn(m);return {sx:m.e>0?dwLerp(1,Math.cos(K_TAU*k),m.e):1,sy:1};},kids:[
  P({lines:[dwArc(0,-322,92),...face.lines,...dwPath('M-92,-340 C-110,-240 -80,-200 -150,-160 M92,-340 C110,-240 80,-200 150,-160')],dots:face.dots}),
  P({acc:true,lines:dwPath('M-82,-404 L-82,-484 L-42,-446 L0,-500 L42,-446 L82,-484 L82,-404 Z')}),
  P({at:[0,-210],move:m=>{const k=turn(m);return {sx:1+.16*m.e*Math.sin(DW_PI*k)};},lines:[...dwPath('M-170,-212 Q0,-236 170,-212 L330,440 M-170,-212 L-330,440 M-150,-60 Q0,-40 150,-60 M-60,-48 L-110,430 M60,-48 L110,430'),hem]}),
  P({acc:true,lines:dwPath('M-110,-222 Q0,-150 110,-222')}),arm(-1),arm(1)]});
 return {name:'giant',root:P({kids:[body]}),pivot:[0,440],move:m=>({r:.075*m.e*Math.sin(DW_PI*m.b)}),colors:['#5fd3ff','#ffd23f'],pulse:1,ground:452,env:'plaza'};}
// Bicycle: the wheels turn a spoke every two beats and the pedals once every eight beats; it bounces lightly on every beat and the
// bell on the handlebar rings now and then.
function dwBicycle(){const crank=P({at:[0,230],spin:K_TAU/8,move:m=>({r:m.b*K_TAU/8}),lines:[dwLine(-92,230,92,230)],kids:[]});
 const pedal=side=>P({shape:m=>{const a=m.b*K_TAU/8+(side>0?0:DW_PI),x=Math.cos(a)*92,y=230+Math.sin(a)*92;return [dwLine(x-44,y,x+44,y)];},acc:true});
 const bell=P({at:[300,-300],acc:true,move:m=>({r:.35*m.e*dwPeak(m.b/8,6)*Math.sin(DW_PI*m.b*4)}),lines:[dwArc(300,-326,26,22,DW_PI,K_TAU),dwLine(274,-326,326,-326)]});
 const frame=P({lines:[...dwPath('M-380,230 L-150,-120 L250,-120 L0,230 Z M0,230 L-185,-170 M-260,-176 Q-180,-196 -110,-176 M250,-120 L380,230 M222,-200 L250,-120 M170,-250 Q222,-208 300,-300 L330,-300'),dwArc(0,230,58)],kids:[crank,pedal(1),pedal(-1),bell]});
 return {name:'bicycle',root:P({kids:[dwWheel(-380,230,230,5,2,{lw:1}),dwWheel(380,230,230,5,2,{lw:1}),frame]}),pivot:[0,460],move:m=>({y:-16*m.e*dwHop(m.b)}),colors:['#7dff7a','#ff7ac8'],pulse:2,ground:462,env:'road',box:[-620,-340,620,462]};}
// Harp: one string is plucked on every beat (it shivers for a moment), going up and down the strings like the tune; the harp leans
// a little with the phrase.
function dwHarp(){const neck=x=>-405+38*Math.sin((x+300)/640*DW_PI*1.6)-0.12*(x+300),board=x=>420-(x+260)*1.48;
 const strings=[];for(let k=0;k<5;k++)strings.push(-220+k*105);
 const pluck=(k,b)=>{const order=[0,1,2,3,4,3,2,1],j=((Math.floor(b)%8)+8)%8;return order[j]===k?Math.max(0,1-(b-Math.floor(b))*1.3):0;};
 const str=P({lw:.42,acc:true,shape:m=>strings.map((x,k)=>{const top=neck(x)+14,bot=board(x)-12,a=pluck(k,m.b)*m.e*16,out=[];for(let i=0;i<=16;i++){const f=i/16;out.push([x+a*Math.sin(DW_PI*f)*Math.sin(DW_PI*f*7+m.b*40),top+(bot-top)*f]);}return out;})});
 const harp=P({at:[-300,440],move:m=>({r:.04*m.e*dwSwing(m.b,6)}),lines:[...dwPath('M-300,440 L-300,-380 M-330,-380 C-180,-520 30,-300 200,-410 C280,-460 320,-500 330,-540 C340,-580 290,-600 270,-560 M-250,440 L300,-370 C310,-390 300,-420 290,-430 M-360,440 L-180,440 M-330,470 L-220,470'),dwArc(-300,-400,30)],kids:[str]});
 return {name:'harp',root:P({kids:[harp]}),pivot:[-200,470],move:m=>({y:-10*m.e*dwPeak(m.b/3,2)}),colors:['#ffd23f','#ffffff'],pulse:1,ground:472,env:'notes'};}
// Sardana dancers: three dancers hand in hand with their arms raised; on every beat a foot taps, the arms rise on the first beat of each
// bar, and the round moves a little one way and the other.
function dwSardana(){const dancer=(x,k)=>{const face=dwFace(x,-292,.85);
  const leg=side=>P({at:[x+side*24,40],move:m=>({r:-side*.3*m.e*Math.max(0,Math.sin(DW_PI*(m.b+(side>0?1:0))/2))**2}),lines:[dwPath(`M${x+side*24},40 L${x+side*30},400 L${x+side*30+side*44},412`)[0]]});
  return P({kids:[P({lines:[dwArc(x,-296,54),...face.lines,...dwPath(`M${x-62},-210 Q${x},-232 ${x+62},-210 L${x+44},40 L${x-44},40 Z`)],dots:face.dots}),
   P({acc:true,lines:dwPath(`M${x-52},-340 Q${x},-${398+(k%2)*10} ${x+52},-340`)}),leg(-1),leg(1)]});};
 const arms=P({shape:m=>{const up=60*m.e*dwPeak(m.b/2,2),out=[];for(const x of [-420,0,420]){out.push(dwPath(`M${x-58},-206 Q${x-110},${-330-up*.5} ${x-205},${-430-up}`)[0],dwPath(`M${x+58},-206 Q${x+110},${-330-up*.5} ${x+205},${-430-up}`)[0]);}return out;},
  kids:[P({move:m=>({y:-60*m.e*dwPeak(m.b/2,2)}),dots:[[-210,-438,20],[210,-438,20]]})]});
 return {name:'sardana',root:P({kids:[dancer(-420,0),dancer(0,1),dancer(420,2),arms]}),pivot:[0,412],move:m=>({x:40*m.e*dwSwing(m.b,8)}),colors:['#ff7a6b','#5fd3ff'],pulse:1,ground:414,env:'plaza',box:[-640,-480,640,414]};}
// Steam train: a puff of smoke leaves the chimney on every beat; the driving wheels turn once every eight beats, with their rod.
// Like every wheel here, they have five spokes: no pattern has more than five pairs of light and dark stripes (Harding et al., 2005).
function dwTrain(){const turn=m=>m.b*K_TAU/8,rc=78;
 const rod=P({acc:true,shape:m=>{const a=turn(m),dx=rc*Math.cos(a),dy=rc*Math.sin(a);return [dwLine(-120+dx,300+dy,420+dx,300+dy),dwLine(420+dx,300+dy,600,292)];}});
 const smoke=P({lw:.8,shape:m=>{const out=[];for(let k=Math.floor(m.b)-2;k<=Math.floor(m.b);k++){const age=m.b-k;if(age<0||age>3||(m.e<=0&&k!==0))continue;const r=40+age*36,span=DW_PI*(1-Math.max(0,age-1.6)/1.4);if(span<=.05)continue;out.push(dwArc(470-age*90,-420-age*70,r,r*.82,-DW_PI/2-span,-DW_PI/2+span));}return out;}});
 const wheels=[-120,150,420].map(x=>P({at:[x,300],spin:K_TAU/8,move:m=>({r:turn(m)}),lines:[dwArc(x,300,130),...[0,1,2,3,4].map(k=>{const a=k*K_TAU/5;return dwLine(x+Math.cos(a)*26,300+Math.sin(a)*26,x+Math.cos(a)*120,300+Math.sin(a)*120);})],dots:[[x,300,20]],acc:false}));
 const body=P({at:[0,170],move:m=>({y:9*m.e*dwPeak(m.b,2)}),lines:[dwRound(-260,-170,880,300,150),...dwPath('M430,-170 L452,-330 L388,-392 L582,-392 L518,-330 L540,-170 M90,-170 Q150,-262 210,-170 M-740,-392 L-200,-392 M-720,-392 L-720,170 M-240,-392 L-240,170 M-740,170 L700,170 M640,170 L770,440 M640,250 L700,440'),dwRound(-640,-320,300,170,22),dwRound(560,250,110,90,22)],
  dots:[[700,-60,30]],kids:[smoke]});
 return {name:'train',root:P({kids:[body,...wheels,rod,dwWheel(620,372,66,5,2,{acc:false,lw:.9})]}),pivot:[0,440],move:m=>({x:24*m.e*dwSwing(m.b,8)}),colors:['#5fd3ff','#ffc23d'],pulse:1,ground:440,env:'track',box:[-760,-640,780,440],horizon:300};}
// Xylophone: two mallets strike its bars in turn, one bar on every beat, hopping along like the tune; the struck bar bounces.
function dwXylophone(){const bars=[0,1,2,3,4].map(k=>({x:-380+k*190,h:400-k*40})),seq=[0,1,2,4,3,2,1,0,1,2,3,4,3,1,2,0];
 const target=b=>seq[((Math.floor(b)%16)+16)%16];
 const head=(side,b)=>{const k=Math.floor(b);let last=k,next=k+1;if(((last%2)+2)%2!==(side<0?0:1))last=k-1;else next=k+2;if(((next%2)+2)%2!==(side<0?0:1))next++;
  const f=Kclamp((b-last)/(next-last)),ba=bars[target(last)],bb=bars[target(next)],x=dwLerp(ba.x,bb.x,Ksmooth(f))+side*18,y=-ba.h/2*0-30-190*Math.sin(DW_PI*f);return [x,y];};
 const mallets=P({acc:true,shape:m=>[-1,1].map(side=>{const [x,y]=m.e>0?head(side,m.b):[side*160,-220];const ex=x+side*120,ey=y-330;return dwLine(x,y-34,ex,ey);}),
  });
 const heads=P({acc:true,shape:m=>[-1,1].map(side=>{const [x,y]=m.e>0?head(side,m.b):[side*160,-220];return dwArc(x,y-34,34);})});
 const barParts=bars.map((bar,k)=>P({move:m=>({y:m.e>0&&target(Math.round(m.b))===k?10*m.e*dwPeak(m.b,3):0}),lines:[dwRound(bar.x-70,-bar.h/2-20,140,bar.h,26)],dots:[[bar.x,-bar.h/2+6,8],[bar.x,bar.h/2-46,8]]}));
 return {name:'xylophone',root:P({lines:dwPath('M-500,-150 L460,-104 M-500,150 L460,104 M-430,170 L-500,430 M-430,170 L-360,430 M400,130 L330,430 M400,130 L470,430 M-450,330 L430,330'),kids:[...barParts,mallets,heads]}),
  pivot:[0,430],move:m=>({y:-12*m.e*dwPeak(m.b,2)}),colors:['#ff8a3d','#5fd3ff'],pulse:1,ground:432,env:'notes',box:[-560,-600,560,432]};}
// Conductor: the baton beats the time, down on every beat; the left hand rises with the phrase and his hair bounces.
function dwConductor(){const hand=b=>[250+80*Math.cos(DW_PI*b),-110-210*dwHop(b)];
 const face=dwFace(0,-372,1,1.3);
 const right=P({shape:m=>{const [hx,hy]=m.e>0?hand(m.b):[250,-160],ang=-1.05-.35*(m.e>0?dwHop(m.b):0);return [dwPath(`M80,-240 Q${hx+20},-150 ${hx},${hy}`)[0]];}});
 const baton=P({acc:true,shape:m=>{const [hx,hy]=m.e>0?hand(m.b):[250,-160],ang=-1.0-.5*(m.e>0?dwHop(m.b):0);return [dwLine(hx,hy,hx+Math.cos(ang)*300,hy+Math.sin(ang)*300)];},dots:[]});
 const left=P({shape:m=>{const up=m.e*(.5-.5*Math.cos(K_TAU*m.b/8)),hx=dwLerp(-230,-260,up),hy=dwLerp(-60,-420,up);return [dwPath(`M-80,-240 Q-220,${dwLerp(-150,-300,up)} ${hx},${hy}`)[0]];}});
 const hair=P({at:[0,-430],move:m=>({sy:1+.18*m.e*dwPeak(m.b,2)}),lines:dwPath('M-60,-418 Q-90,-470 -40,-470 Q-20,-500 10,-468 Q50,-500 70,-450 Q96,-440 66,-410')});
 return {name:'conductor',root:P({lines:[dwArc(0,-372,62),...face.lines,...dwPath('M-82,-250 Q0,-270 82,-250 L110,120 L40,170 M-82,-250 L-110,120 L-40,170 M-30,-246 L0,-180 L30,-246 M-50,120 L-60,330 M50,120 L60,330 M-60,330 L-110,336 M60,330 L110,336'),dwRound(-270,336,540,104,14)],dots:[...face.dots,[0,-150,10],[0,-80,10]],
  kids:[P({acc:true,lines:dwPath('M-36,-236 L0,-218 L-36,-200 Z M36,-236 L0,-218 L36,-200 Z')}),hair,right,baton,left]}),pivot:[0,440],move:m=>({r:.025*m.e*dwSwing(m.b,4)}),colors:['#ffffff','#ffd23f'],pulse:1,ground:440,env:'stage',box:[-420,-620,600,440]};}
// Old car: it hops on its springs every two beats (the wheels turn a spoke at the same time), puffs from the exhaust and
// the rubber horn squeezes.
function dwCar(){const hop=m=>dwPeak(m.b/2,3);
 const body=P({at:[0,280],move:m=>{const k=.05*m.e*hop(m);return {sy:1-k,sx:1+k*.5,y:0};},lines:[...dwPath('M-650,160 L-650,-60 Q-650,-130 -580,-130 L-470,-130 L-470,-250 Q-470,-300 -410,-300 L-330,-300 Q-290,-300 -290,-250 L-290,-90 L-40,-90 L60,-260 M60,-260 L80,-90 L470,-90 Q520,-90 540,-40 L640,30 Q670,60 660,160 L-650,160 M-610,170 Q-600,10 -400,10 Q-200,10 -190,170 M190,170 Q200,10 400,10 Q600,10 610,170 M-190,200 L190,200'),
  dwRound(570,-90,70,190,14),dwArc(-60,-150,56,18,0,K_TAU,-.5),dwLine(-60,-150,-10,-60)],dots:[[690,-20,30]],
  kids:[P({at:[470,-110],acc:true,move:m=>({sx:1-.25*m.e*hop(m),sy:1+.1*m.e*hop(m)}),lines:dwPath('M420,-90 Q420,-200 520,-230 L560,-260 L560,-180 L520,-210'),dots:[[400,-110,34]]})]});
 const puffs=P({lw:.75,shape:m=>{const out=[];for(let k=Math.floor(m.b/2)-1;k<=Math.floor(m.b/2);k++){const age=m.b/2-k;if(age<0||age>2||(m.e<=0&&k!==0))continue;const r=26+age*30,span=DW_PI*(1-Math.max(0,age-1.2)/.8);if(span>.05)out.push(dwArc(-700-age*120,130-age*40,r,r,DW_PI/2-span,DW_PI/2+span));}return out;}});
 return {name:'car',root:P({kids:[body,puffs,dwWheel(-400,280,150,5,2),dwWheel(400,280,150,5,2)]}),pivot:[0,430],move:m=>({y:-34*m.e*dwHop(m.b/2),r:.02*m.e*dwSwing(m.b,4)}),colors:['#ff5a4a','#ffd23f'],pulse:2,ground:430,env:'road',box:[-940,-330,760,430]};}
// Gralla: the shawm of the colles, with its ribbons. On every beat its bell lifts and a finger closes or opens its holes, as the tune
// goes up and down; the ribbons tied under the bell fly.
function dwGralla(){const A=-.42,ca=Math.cos(A),sa=Math.sin(A),Rp=(x,y)=>[x*ca-y*sa,x*sa+y*ca],R=l=>l.map(([x,y])=>Rp(x,y));
 const shut=[5,4,3,4,2,1,3,5],holes=[-340,-250,-160,-40,60];
 const hole=(x,k)=>{const at=Rp(x,0);return P({at,move:m=>{if(m.e<=0)return null;const j=Math.floor(m.b),f=m.b-j,n=i=>shut[((i%8)+8)%8],was=k<n(j-1)?1:.5,now=k<n(j)?1:.5,s=dwLerp(was,now,Kclamp(f*7));return {sx:s,sy:s};},dots:[[at[0],at[1],25]]});};
 const tie=Rp(260,48);
 const ribbons=P({acc:true,lw:.8,shape:m=>[0,1,2].map(k=>{const len=[380,440,360][k],out=[];for(let i=0;i<=16;i++){const f=i/16,amp=(10+26*m.e)*f;out.push([tie[0]+(k-1)*120*f+amp*Math.sin(K_TAU*(f*.9-m.b/2)+k*1.1),tie[1]+len*f]);}return out;}),dots:[[tie[0],tie[1],22]]});
 const body=P({lines:[...dwPath('M-430,-24 L300,-50 C400,-56 470,-110 530,-176 M-430,24 L300,50 C400,56 470,110 530,176 M-430,-24 L-430,24 M200,-46 L200,46 M300,-50 L300,50 M-430,-12 L-530,-8 M-430,12 L-530,8'),dwArc(530,0,34,176)].map(R),
  kids:[P({acc:true,lines:[R(dwRound(-640,-17,110,34,14))]}),...holes.map(hole)]});
 return {name:'gralla',root:P({kids:[body,ribbons]}),pivot:Rp(-640,0),move:m=>({r:-.085*m.e*dwPeak(m.b,2)-.04*m.e*dwSwing(m.b,8),y:6*m.e*dwPeak(m.b,2)}),colors:['#c58cff','#ffd23f'],pulse:1,ground:460,env:'notes',box:[-620,-470,620,450]};}
// One-man band: he plays the accordion (its bellows open and close over four beats), and he stamps on every beat: his foot pulls the
// rope of a beater, which strikes the big drum beside him; the cymbal on the drum shakes at the start of every bar and the bell on
// his hat swings.
function dwOneManBand(){const X=-250,face=dwFace(X,-372),stamp=b=>1-dwPeak(b,2),open=m=>70*m.e*Math.sin(DW_PI*m.b/2),half=120;
 const ends=[P({move:m=>({x:-open(m)/2}),lines:[dwRound(X-half-74,-180,74,236,18)],dots:[[X-half-37,-130,11],[X-half-37,-80,11],[X-half-37,-30,11],[X-half-37,20,11]]}),
  P({move:m=>({x:open(m)/2}),lines:[dwRound(X+half,-180,74,236,18),...[0,1,2,3].map(k=>dwLine(X+half,-130+k*50,X+half+40,-130+k*50))]})];
 const bellows=P({acc:true,shape:m=>{const w=2*half+open(m),top=[],bot=[],folds=[];for(let i=0;i<=10;i++){const x=X-w/2+w*i/10,d=i%2?22:0;top.push([x,-170+d]);bot.push([x,46-d]);if(i%2)folds.push(dwLine(x,-148,x,24));}return [top,bot,...folds];}});
 const arms=P({shape:m=>{const o=open(m)/2;return [dwPath(`M${X-72},-262 Q${X-250-o},-230 ${X-half-74-o},-50`)[0],dwPath(`M${X+72},-262 Q${X+250+o},-230 ${X+half+74+o},-50`)[0]];}});
 const lift=m=>m.e*stamp(m.b);
 const leg=P({shape:m=>{const l=lift(m);return [dwPath(`M${X+50},90 L${X+62+60*l},${262-40*l} L${X+62},${420-80*l} L${X+124},${432-80*l}`)[0]];}});
 const hat=P({at:[X,-468],move:m=>({r:.3*m.e*dwSwing(m.b,2)}),lines:[dwLine(X,-468,X+40,-536)],dots:[[X+46,-548,18]],acc:true});
 const person=P({lines:[dwArc(X,-372,62),...face.lines,...dwPath(`M${X-84},-418 L${X+84},-418 M${X-60},-418 Q${X},-536 ${X+60},-418 M${X-72},-262 L${X+72},-262 M${X-72},-262 L${X-78},-175 M${X+72},-262 L${X+78},-175 M${X-74},55 L${X-80},90 L${X+80},90 L${X+74},55 M${X-50},90 L${X-58},420 L${X-120},432`)],dots:face.dots,
  kids:[P({acc:true,lines:[dwRound(X-48,-304,96,26,8),...dwPath(`M${X-48},-291 L${X-72},-262 M${X+48},-291 L${X+72},-262`)]}),hat,leg,arms,bellows,...ends]});
 const beat=m=>-.42*m.e*stamp(m.b),turn=(r,x,y)=>[x*Math.cos(r)-(y-430)*Math.sin(r),430+x*Math.sin(r)+(y-430)*Math.cos(r)];
 const beater=P({at:[0,430],move:m=>({r:beat(m)}),lines:[dwLine(0,430,32,226)],dots:[[38,196,34]],acc:true});
 const rope=P({lw:.55,shape:m=>{const l=lift(m),p=turn(beat(m),12,352);return [dwPath(`M${X+124},${432-80*l} Q${(X+124+p[0])/2},${(432-80*l+p[1])/2+30} ${p[0]},${p[1]}`)[0]];}});
 const ripple=P({acc:true,lw:.55,shape:m=>{const f=((m.b%1)+1)%1;return m.e>0&&f<.6?[dwArc(300,190,50+140*f)]:[];}});
 const drum=P({at:[300,430],move:m=>{const k=.04*m.e*dwPeak(m.b,3);return {sx:1+k,sy:1-k};},lines:[dwArc(300,190,240),dwArc(300,190,206)],
  kids:[P({acc:true,lines:[0,1,2,3,4].map(k=>{const a=k*K_TAU/5+DW_PI/10;return dwLine(300+Math.cos(a)*214,190+Math.sin(a)*214,300+Math.cos(a)*236,190+Math.sin(a)*236);})}),ripple,
   P({at:[300,-206],move:m=>{const f=((m.b/2)%1+1)%1;return {r:.16*m.e*Math.exp(-5*f)*Math.sin(K_TAU*f*3)};},lines:[dwLine(300,-50,300,-206),dwArc(300,-218,150,20),dwPath('M266,-232 Q300,-266 334,-232')[0]],acc:true})]});
 return {name:'onemanband',root:P({kids:[drum,beater,rope,person]}),pivot:[0,432],move:m=>({y:8*m.e*dwPeak(m.b,2)}),colors:['#4dd9c0','#ffd23f'],pulse:1,ground:434,env:'circus',box:[-520,-580,560,434]};}
// Small plane: its propeller turns (seen from the side: a blade that grows and shrinks, half a turn on every beat), it dips at the
// start of every bar and rises and falls over four bars; the pilot's scarf flies behind.
function dwPlane(){const face=dwFace(40,-170,.8);
 const blade=P({at:[496,-6],acc:true,move:m=>({sy:m.e>0?.16+.84*Math.abs(Math.cos(DW_PI*m.b)):1}),lines:[dwRound(484,-196,24,380,12)]});
 const scarf=P({acc:true,shape:m=>{const a=[];for(let i=0;i<=14;i++){const f=i/14;a.push([-4-200*f,-112-60*f+(8+22*m.e)*f*Math.sin(K_TAU*(f*1.2-m.b))]);}const e=a[a.length-1];return [a,dwLine(e[0]+30,e[1]-4,e[0]-10,e[1]+30)];}});
 const trail=P({acc:true,lw:.55,shape:m=>m.e<=0?[]:[-150,-40,80].map((y,k)=>{const x=-700-((m.b*130+k*110)%260+260)%260;return dwLine(x,y,x-150*m.e,y);})});
 const plane=P({lines:[...dwPath('M150,-86 L460,-74 Q514,-6 460,62 L-520,30 L-640,0 L-662,-230 L-604,-230 L-520,-40 L-62,-80 M150,-86 L192,-150 M380,-76 L380,60 M70,104 L94,196 M134,104 L110,196'),dwRound(-230,64,440,50,25),dwArc(102,236,44),dwArc(40,-170,52),...face.lines,
  ...dwPath('M8,-124 Q-34,-112 -40,-82 M72,-124 Q114,-112 120,-84')],dots:[...face.dots,[102,236,10],[496,-6,22]],kids:[P({acc:true,lines:dwPath('M-14,-182 Q40,-250 94,-182')}),scarf,blade,trail]});
 return {name:'plane',root:P({kids:[plane]}),pivot:[0,0],move:m=>({y:-36*m.e*dwSwing(m.b,8,.25)+18*m.e*dwPeak(m.b/2,3),r:.06*m.e*dwSwing(m.b,8)}),colors:['#ff7ac8','#5fd3ff'],pulse:2,ground:300,env:'air',box:[-860,-300,560,290]};}
// Tuba: oom-pah. On every beat it squashes down on its note and springs up again, a valve goes down (one after another) and a ring of
// sound rises from the bell.
function dwTuba(){const valve=(x,k)=>P({at:[x,-200],move:m=>({y:36*m.e*dwPeak((m.b-k)/3,4)}),lines:[dwLine(x,-200,x,-258)],kids:[P({acc:true,lines:[dwArc(x,-270,34,13)]})]});
 const rings=P({acc:true,lw:.7,shape:m=>{const out=[];for(let j=0;j<3;j++){const f=((m.b+j/3)%1+1)%1,r=230+f*190,span=(.5-.36*f)*m.e;if(span>.03)out.push(dwArc(120,-370,r,r*.7,-DW_PI/2-span,-DW_PI/2+span));}return out;}});
 const body=P({at:[45,440],move:m=>{const k=m.e*dwPeak(m.b,3);return {sy:1-.07*k,sx:1+.05*k};},lines:[...dwPath('M320,-470 C230,-390 210,-300 210,-160 L210,250 Q210,440 45,440 Q-120,440 -120,250 L-120,-40 Q-120,-80 -152,-80 M-80,-470 C20,-390 50,-300 50,-160 L50,250 Q50,320 5,320 Q-40,320 -40,250 L-40,-40 Q-40,-160 -152,-160 M-302,-120 L-283,-120 M-227,-120 L-208,-120 M-302,-20 L-283,-20 M-227,-20 L-208,-20 M-358,0 Q-470,0 -470,-140 Q-470,-290 -424,-334 M-330,30 Q-330,150 -255,150 Q-180,150 -180,30'),
   dwArc(120,-470,200,40),...[-330,-255,-180].map(x=>dwRound(x-28,-200,56,230,20)),dwArc(-412,-350,26,13,0,K_TAU,-.75)],kids:[...[-330,-255,-180].map(valve),rings]});
 return {name:'tuba',root:P({kids:[body]}),pivot:[45,440],move:m=>({y:-24*m.e*dwHop(m.b)}),colors:['#ffd23f','#ff8a3d'],pulse:1,ground:442,env:'stage',box:[-520,-690,340,442]};}
export const DW_ART=Object.freeze([dwTram(),dwDrum(),dwBallerina(),dwBoat(),dwTrumpet(),dwJuggler(),dwBalloon(),dwViolin(),dwGiant(),dwBicycle(),dwHarp(),dwSardana(),dwTrain(),dwXylophone(),dwConductor(),dwCar(),
 dwGralla(),dwOneManBand(),dwPlane(),dwTuba()]);
// What each drawing is: vehicles and instruments move with squash and stretch but have no face; only people have one.
export const DW_KIND=Object.freeze({tram:'vehicle',drum:'instrument',ballerina:'person',boat:'vehicle',trumpet:'instrument',juggler:'person',balloon:'vehicle',violin:'instrument',giant:'person',bicycle:'vehicle',
 harp:'instrument',sardana:'person',train:'vehicle',xylophone:'instrument',conductor:'person',car:'vehicle',gralla:'instrument',onemanband:'person',plane:'vehicle',tuba:'instrument'});

// ── Surroundings ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// What surrounds a drawing, drawn only with the decor («Decorat complet», or veiled with «Decorat atenuat»): a few thin lines of a
// quiet colour across the whole screen, which move with the music too (the sleepers go by, the clouds drift, the curtains sway).
// o: {w, h, S, cx, cy, gy (the ground on the screen), lw, b, e, color, art}.
const DW_BEHIND=new Set(['track','sky','air','playroom','beach','park','table','kitchen','stove','autumn']);
export function dwEnv(c,kind,o){const {w,h,S,gy,b}=o,lw=Math.max(2,o.lw*.45);c.save();c.strokeStyle=o.color;c.fillStyle=o.color;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';
 // Lines of the decor do not cross the drawing (it has no fill to hide them): the poles, wires and clouds stop where it is, as if
 // they went behind it. The ground stays.
 if(o.box&&DW_BEHIND.has(kind)){const [x0,y0,x1]=o.box,pad=60*S;c.beginPath();c.rect(0,0,w,h);c.rect(o.cx+x0*S-pad,o.cy+y0*S-pad,(x1-x0)*S+2*pad,Math.max(0,gy-lw*2-(o.cy+y0*S-pad)));c.clip('evenodd');}
 const line=(...p)=>{c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.stroke();};
 const wrap=(x,span)=>((x%span)+span)%span;
 const bunting=(y0,sag,flags,phase)=>{c.beginPath();for(let i=0;i<=40;i++){const x=w*i/40,y=y0+sag*4*(i/40)*(1-i/40);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
  for(let i=1;i<flags;i++){const f=i/flags,x=w*f,y=y0+sag*4*f*(1-f),sw=Math.sin(DW_PI*b/2+i+phase)*.12*o.e,s2=26*S*1.4;c.save();c.translate(x,y);c.rotate(sw);c.beginPath();c.moveTo(-s2*.6,0);c.lineTo(s2*.6,0);c.lineTo(0,s2*1.3);c.closePath();c.stroke();c.restore();}};
 if(kind==='rails'||kind==='track'){line(0,gy,w,gy);const sp=150*S,off=wrap(-b*40*S,sp);for(let x=off-sp;x<w+sp;x+=sp)line(x,gy+lw*2,x-28*S,gy+lw*2+40*S);
  if(kind==='rails'){const wy=o.cy+(o.art.wire??-600)*S;line(0,wy,w,wy);}
  else{const pp=w*.55,po=wrap(-b*24*S,pp);for(let x=po-pp;x<w+pp;x+=pp){line(x,gy,x,gy-620*S);line(x-60*S,gy-560*S,x+60*S,gy-560*S);}c.beginPath();for(let x=po-pp;x<w+pp;x+=pp){c.moveTo(x-60*S,gy-560*S);c.quadraticCurveTo(x-pp/2-30*S,gy-470*S,x-pp+60*S,gy-560*S);}c.stroke();}}
 else if(kind==='stage'||kind==='circus'){line(0,gy,w,gy);line(0,gy+46*S,w,gy+46*S);
  if(kind==='stage'){const sway=Math.sin(DW_PI*b/4)*10*S*o.e;for(const side of [0,1])for(let k=0;k<3;k++){const x=side?w-(k+1)*.035*w:(k+1)*.035*w;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+(side?-1:1)*(18*S+sway*(k+1)),(gy)*.5,x+(side?-1:1)*(k*14*S),gy);c.stroke();}
   c.beginPath();const n=9;for(let i=0;i<n;i++){const x0=w*i/n,x1=w*(i+1)/n;c.moveTo(x0,0);c.quadraticCurveTo((x0+x1)/2,h*.09,x1,0);}c.stroke();}
  else bunting(h*.04,h*.07,13,0);}
 else if(kind==='sea'){const hy=o.cy+(o.art.horizon??250)*S;line(0,hy,w,hy);const sp=210*S,off=wrap(-b*30*S,sp);
  for(let row=0;row<2;row++)for(let x=off-sp+row*sp/2;x<w+sp;x+=sp){const y=hy+(row+1)*48*S;c.beginPath();c.arc(x,y+14*S,28*S,1.15*DW_PI,1.85*DW_PI);c.stroke();}
  const sx=w*.13,sy=h*.18,r=Math.max(16,46*S);c.beginPath();c.arc(sx,sy,r,0,K_TAU);c.stroke();for(let k=0;k<8;k++){const a=k*K_TAU/8;line(sx+Math.cos(a)*r*1.45,sy+Math.sin(a)*r*1.45,sx+Math.cos(a)*r*1.85,sy+Math.sin(a)*r*1.85);}}
 else if(kind==='sky'||kind==='air'){const fast=kind==='air'?3:1,cl=(x,y,s)=>{c.beginPath();c.moveTo(x-90*s,y);c.lineTo(x+90*s,y);c.arc(x+50*s,y-10*s,36*s,.4,-1.9,true);c.arc(x-5*s,y-40*s,50*s,-.2,-2.9,true);c.arc(x-60*s,y-12*s,32*s,-1.2,-3.6,true);c.stroke();};
  for(let k=0;k<5;k++){const span=w+400*S,x=wrap(w*(.1+k*.23)-b*14*S*fast*(1+k%2*.4),span)-200*S,y=h*(.14+.17*(k%3))+(k%2)*h*.05;cl(x,y,S*(1.9-.25*(k%3)));}
  for(let k=0;k<3;k++){const x=w*(.72+.07*k),y=h*(.12+.05*(k%2)),f=Math.sin(DW_PI*b+k)*o.e,s2=26*S;c.beginPath();c.moveTo(x-s2*1.4,y-s2*(.5+.5*f));c.quadraticCurveTo(x-s2*.5,y-s2*.4,x,y);c.quadraticCurveTo(x+s2*.5,y-s2*.4,x+s2*1.4,y-s2*(.5+.5*f));c.stroke();}
  if(kind==='air'){c.beginPath();for(let i=0;i<=48;i++){const x=w*i/48,y=h*.9-Math.sin(i/48*DW_PI*3+.7)*h*.04-Math.sin(i/48*DW_PI*1.3)*h*.05;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}
 else if(kind==='notes'){line(0,gy,w,gy);for(let k=0;k<6;k++){const side=k%2?w-w*(.08+.06*(k>>1)):w*(.08+.06*(k>>1)),span=h+200*S,y=h+100*S-wrap(b*26*S+k*span/6,span),x=side+Math.sin(b*.8+k)*20*S,r=27*S;
   c.save();c.translate(x,y);c.rotate(-.35);c.beginPath();c.ellipse(0,0,r*1.25,r*.85,0,0,K_TAU);c.stroke();c.restore();line(x+r*1.1,y-r*.3,x+r*1.1,y-r*4.2);c.beginPath();c.moveTo(x+r*1.1,y-r*4.2);c.quadraticCurveTo(x+r*2.6,y-r*3.4,x+r*2.2,y-r*2.2);c.stroke();}}
 else if(kind==='plaza'){line(0,gy,w,gy);bunting(h*.03,h*.06,15,0);bunting(h*.10,h*.05,11,1.7);}
 // Joguines que ballen (0.26): a playroom (a window with the moon and stars, a mobile that swings), a beach (the sea, the sun and a
 // parasol), a park (grass, a tree that sways, clouds) and a table (its edge and legs, a lamp that swings, a picture).
 else if(kind==='playroom'){line(0,gy,w,gy);line(0,gy+40*S,w,gy+40*S);
  const wx=w*.06,wy=h*.1,ww=Math.min(w*.2,320*S),wh=ww*1.1;c.beginPath();c.roundRect?c.roundRect(wx,wy,ww,wh,14*S):c.rect(wx,wy,ww,wh);c.stroke();line(wx+ww/2,wy,wx+ww/2,wy+wh);line(wx,wy+wh/2,wx+ww,wy+wh/2);
  c.beginPath();c.arc(wx+ww*.3,wy+wh*.26,ww*.11,.5*DW_PI,1.5*DW_PI);c.arc(wx+ww*.26,wy+wh*.26,ww*.085,1.5*DW_PI,.5*DW_PI,true);c.stroke();
  for(let k=0;k<3;k++){const x=wx+ww*(.66+.12*(k%2)),y=wy+wh*(.18+.18*k)+(k===2?wh*.4:0),r=ww*.045*(1+.25*o.e*Math.max(0,Math.sin(DW_PI*b/2+k)));c.beginPath();for(let i=0;i<=8;i++){const a=i*DW_PI/4-DW_PI/2,q=i%2?r*.42:r;i?c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}c.stroke();}
  const mx=w*.84,my=h*.04,sw=.12*o.e*Math.sin(DW_PI*b/2),bar=Math.min(w*.12,200*S);line(mx,0,mx,my);c.save();c.translate(mx,my);c.rotate(sw);line(-bar,0,bar,0);
  for(const [x,len,shape] of [[-bar,h*.12,0],[0,h*.08,1],[bar,h*.14,2]]){const y=len,sz=26*S*1.3;line(x,0,x,y-sz);c.beginPath();if(shape===0){for(let i=0;i<=10;i++){const a=i*DW_PI/5-DW_PI/2,q=i%2?sz*.45:sz;i?c.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q):c.moveTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}}else if(shape===1){c.arc(x,y,sz,0,K_TAU);}else{c.moveTo(x-sz,y+sz*.4);c.lineTo(x+sz,y+sz*.4);c.arc(x+sz*.4,y,sz*.5,.4,-2.2,true);c.arc(x-sz*.3,y-sz*.1,sz*.55,-.4,-3.1,true);}c.stroke();}c.restore();}
 else if(kind==='beach'){line(0,gy,w,gy);const hy=gy-Math.max(h*.2,230*S);line(0,hy,w,hy);const sp=210*S,off=wrap(-b*24*S,sp);
  for(let row=0;row<2;row++)for(let x=off-sp+row*sp/2;x<w+sp;x+=sp){const y=hy+(row+1)*44*S;c.beginPath();c.arc(x,y+14*S,26*S,1.15*DW_PI,1.85*DW_PI);c.stroke();}
  const sx=w*.86,sy=h*.16,r=Math.max(16,46*S);c.beginPath();c.arc(sx,sy,r,0,K_TAU);c.stroke();for(let k=0;k<8;k++){const a=k*K_TAU/8+b*DW_PI/16;line(sx+Math.cos(a)*r*1.45,sy+Math.sin(a)*r*1.45,sx+Math.cos(a)*r*1.85,sy+Math.sin(a)*r*1.85);}
  const px=w*.1,pr=Math.min(w*.1,190*S),ptop=gy-Math.max(h*.42,520*S),tilt=.06*o.e*Math.sin(DW_PI*b/4);c.save();c.translate(px,gy);c.rotate(tilt);c.beginPath();c.moveTo(0,0);c.lineTo(0,ptop-gy);c.stroke();
  c.beginPath();c.moveTo(-pr,ptop-gy+pr*.42);c.quadraticCurveTo(0,ptop-gy-pr*.55,pr,ptop-gy+pr*.42);c.stroke();c.beginPath();for(let k=0;k<4;k++){const x0=-pr+k*pr/2,x1=x0+pr/2;c.moveTo(x0,ptop-gy+pr*.42);c.quadraticCurveTo((x0+x1)/2,ptop-gy+pr*.6,x1,ptop-gy+pr*.42);}c.stroke();c.restore();}
 else if(kind==='park'){line(0,gy,w,gy);const sp=120*S;for(let x=sp*.3;x<w;x+=sp){const k=Math.sin(x*1.7),sw=4*S*o.e*Math.sin(DW_PI*b/2+x*.01);line(x-10*S,gy,x-14*S+sw,gy-22*S);line(x,gy,x+sw,gy-32*S);line(x+10*S,gy,x+15*S+sw,gy-20*S*(1+.2*k));}
  const tx=w*.88,tw=Math.min(w*.07,110*S),th=Math.max(h*.34,420*S),sway=.03*o.e*Math.sin(DW_PI*b/4);c.save();c.translate(tx,gy);c.rotate(sway);line(-tw*.22,0,-tw*.16,-th*.62);line(tw*.22,0,tw*.16,-th*.62);
  c.beginPath();const cr=tw*1.15,cy=-th*.62-cr*.7;c.arc(-cr*.55,cy+cr*.25,cr*.6,.75*DW_PI,1.6*DW_PI);c.arc(0,cy-cr*.35,cr*.7,1.15*DW_PI,1.9*DW_PI);c.arc(cr*.6,cy+cr*.2,cr*.62,1.4*DW_PI,2.25*DW_PI);c.arc(0,cy+cr*.55,cr*.75,.2*DW_PI,.8*DW_PI);c.closePath();c.stroke();c.restore();
  const cl=(x,y,s)=>{c.beginPath();c.moveTo(x-90*s,y);c.lineTo(x+90*s,y);c.arc(x+50*s,y-10*s,36*s,.4,-1.9,true);c.arc(x-5*s,y-40*s,50*s,-.2,-2.9,true);c.arc(x-60*s,y-12*s,32*s,-1.2,-3.6,true);c.stroke();};
  for(let k=0;k<3;k++){const span=w+400*S,x=wrap(w*(.08+k*.3)-b*12*S*(1+k*.3),span)-200*S,y=h*(.12+.08*(k%2));cl(x,y,S*(1.6-.2*k));}}
 else if(kind==='table'){line(0,gy,w,gy);line(0,gy+44*S,w,gy+44*S);for(const x of [w*.06,w*.94])line(x,gy+44*S,x,h);
  const lx=w*.5,len=Math.max(h*.08,60*S),sw=.1*o.e*Math.sin(DW_PI*b/4);c.save();c.translate(lx,0);c.rotate(sw);line(0,0,0,len);c.beginPath();c.moveTo(-80*S,len+60*S);c.quadraticCurveTo(-60*S,len,0,len);c.quadraticCurveTo(60*S,len,80*S,len+60*S);c.closePath();c.stroke();c.restore();
  const fx=w*.06,fy=h*.12,fw=Math.min(w*.14,240*S),fh=fw*.8;c.strokeRect(fx,fy,fw,fh);c.beginPath();c.moveTo(fx+fw*.1,fy+fh*.85);c.lineTo(fx+fw*.4,fy+fh*.4);c.lineTo(fx+fw*.6,fy+fh*.65);c.lineTo(fx+fw*.75,fy+fh*.5);c.lineTo(fx+fw*.9,fy+fh*.85);c.stroke();c.beginPath();c.arc(fx+fw*.75,fy+fh*.27,fw*.08,0,K_TAU);c.stroke();}
 // La cuina que balla (0.26): a kitchen (the worktop and its cupboards, a window with curtains that sway, a shelf of jars, ladles that
 // swing), a stove (the hob, the oven and its knobs, a clock, an oven glove) and an autumn street at dusk (a lamp post, the moon, leaves
 // that fall).
 else if(kind==='kitchen'){line(0,gy,w,gy);line(0,gy+44*S,w,gy+44*S);const dy=gy+80*S;
  if(h-dy>50*S){const n=5,cw=w/n;for(let k=0;k<n;k++){const x=k*cw+18*S;c.beginPath();c.roundRect?c.roundRect(x,dy,cw-36*S,h-dy+40*S,12*S):c.rect(x,dy,cw-36*S,h-dy+40*S);c.stroke();c.beginPath();c.arc(x+(k%2?cw-80*S:44*S),dy+40*S,9*S,0,K_TAU);c.stroke();}}
  const wx=w*.05,wy=h*.1,ww=Math.min(w*.17,290*S),wh=ww*.95,sw=12*S*o.e*Math.sin(DW_PI*b/4);c.beginPath();c.roundRect?c.roundRect(wx,wy,ww,wh,10*S):c.rect(wx,wy,ww,wh);c.stroke();line(wx+ww/2,wy,wx+ww/2,wy+wh);line(wx,wy+wh*.45,wx+ww,wy+wh*.45);
  line(wx-40*S,wy-24*S,wx+ww+40*S,wy-24*S);for(const side of [0,1]){const x0=side?wx+ww+30*S:wx-30*S,d=side?-1:1;c.beginPath();c.moveTo(x0,wy-24*S);c.quadraticCurveTo(x0+d*(ww*.28)+sw,wy+wh*.35,x0+d*ww*.06+sw*.6,wy+wh+16*S);c.lineTo(x0-d*10*S+sw*.4,wy+wh+16*S);c.quadraticCurveTo(x0-d*16*S,wy+wh*.4,x0,wy-24*S);c.stroke();}
  const sx=w*.76,sy=h*.13,sl=Math.min(w*.2,330*S),j=sl/3.3;line(sx,sy,sx+sl,sy);line(sx+sl*.12,sy,sx+sl*.12,sy+22*S);line(sx+sl*.88,sy,sx+sl*.88,sy+22*S);
  for(let k=0;k<3;k++){const x=sx+sl*.06+k*sl*.31,hh=j*(1.2-.18*k),lid=4*S*o.e*Math.max(0,Math.sin(DW_PI*(b+k*.67)/1));c.beginPath();c.roundRect?c.roundRect(x,sy-hh,j,hh,10*S):c.rect(x,sy-hh,j,hh);c.stroke();line(x-6*S,sy-hh-8*S-lid,x+j+6*S,sy-hh-8*S-lid);}
  const ry=sy+54*S;line(sx+sl*.05,ry,sx+sl*.95,ry);for(let k=0;k<3;k++){const x=sx+sl*(.2+.3*k),len=h*(.13+.03*(k%2)),a=.1*o.e*Math.sin(DW_PI*b/2+k*1.3);c.save();c.translate(x,ry);c.rotate(a);c.beginPath();c.arc(0,10*S,10*S,0,K_TAU);c.stroke();line(0,20*S,0,len);
   c.beginPath();if(k===0){c.arc(0,len+22*S,26*S,1.1*DW_PI,1.9*DW_PI,true);}else if(k===1){c.roundRect?c.roundRect(-22*S,len,44*S,56*S,8*S):c.rect(-22*S,len,44*S,56*S);}else{c.moveTo(0,len);c.quadraticCurveTo(-34*S,len+40*S,0,len+70*S);c.quadraticCurveTo(34*S,len+40*S,0,len);}c.stroke();c.restore();}}
 else if(kind==='stove'){line(0,gy,w,gy);line(0,gy+36*S,w,gy+36*S);const cx=w/2,ky=gy+84*S;
  for(let k=0;k<5;k++){const x=cx+(k-2)*110*S,a=-DW_PI/2+.5*(k-2);c.beginPath();c.arc(x,ky,22*S,0,K_TAU);c.stroke();line(x,ky,x+Math.cos(a)*18*S,ky+Math.sin(a)*18*S);}
  const oy=ky+56*S;if(h-oy>60*S){c.beginPath();c.roundRect?c.roundRect(cx-340*S,oy,680*S,h-oy+40*S,18*S):c.rect(cx-340*S,oy,680*S,h-oy+40*S);c.stroke();line(cx-240*S,oy+36*S,cx+240*S,oy+36*S);if(h-oy>200*S){c.beginPath();c.roundRect?c.roundRect(cx-230*S,oy+80*S,460*S,Math.min(220*S,h-oy-110*S),20*S):c.rect(cx-230*S,oy+80*S,460*S,Math.min(220*S,h-oy-110*S));c.stroke();}}
  const clx=w*.12,cly=h*.2,cr=Math.min(w*.06,90*S);c.beginPath();c.arc(clx,cly,cr,0,K_TAU);c.stroke();for(let k=0;k<4;k++){const a=k*DW_PI/2;line(clx+Math.cos(a)*cr*.78,cly+Math.sin(a)*cr*.78,clx+Math.cos(a)*cr*.92,cly+Math.sin(a)*cr*.92);}
  const ma=-DW_PI/2+b*DW_PI/16;line(clx,cly,clx+Math.cos(ma)*cr*.7,cly+Math.sin(ma)*cr*.7);line(clx,cly,clx+Math.cos(-DW_PI/6)*cr*.45,cly+Math.sin(-DW_PI/6)*cr*.45);
  const mx=w*.88,my=h*.16,ma2=.12*o.e*Math.sin(DW_PI*b/2),mh=Math.min(h*.2,200*S);c.save();c.translate(mx,my);c.rotate(ma2);c.beginPath();c.arc(0,0,10*S,0,K_TAU);c.stroke();
  c.beginPath();c.moveTo(-50*S,30*S);c.lineTo(-50*S,mh*.8);c.quadraticCurveTo(-50*S,mh+20*S,0,mh+20*S);c.quadraticCurveTo(60*S,mh+20*S,60*S,mh*.7);c.lineTo(60*S,mh*.45);c.quadraticCurveTo(90*S,mh*.35,84*S,mh*.6);c.lineTo(84*S,mh*.4);c.quadraticCurveTo(84*S,mh*.2,60*S,mh*.25);c.lineTo(60*S,30*S);c.closePath();c.stroke();line(-50*S,mh*.4,60*S,mh*.4);c.restore();}
 else if(kind==='autumn'){line(0,gy,w,gy);
  const mx=w*.12,my=h*.16,mr=Math.min(w*.05,70*S);c.beginPath();c.arc(mx,my,mr,.5*DW_PI,1.5*DW_PI);c.arc(mx-mr*.35,my,mr*.78,1.5*DW_PI,.5*DW_PI,true);c.stroke();
  const lx=w*.9,lt=gy-Math.max(h*.6,700*S);line(lx,gy,lx,lt);line(lx-30*S,gy,lx+30*S,gy);c.beginPath();c.moveTo(lx,lt+30*S);c.quadraticCurveTo(lx,lt-30*S,lx-80*S,lt-20*S);c.stroke();
  c.beginPath();c.moveTo(lx-80*S,lt-20*S);c.lineTo(lx-80*S,lt-4*S);c.moveTo(lx-130*S,lt+50*S);c.lineTo(lx-30*S,lt+50*S);c.lineTo(lx-50*S,lt-4*S);c.lineTo(lx-110*S,lt-4*S);c.closePath();c.stroke();
  for(let k=0;k<8;k++){const span=h+200*S,y=wrap(b*22*S+k*span/8,span)-100*S,x=w*(.04+.92*((k*.37)%1))+Math.sin(b*.7+k*1.9)*60*S,rot=.7*Math.sin(b*.6+k),l=28*S*(1+.2*(k%3));c.save();c.translate(x,y);c.rotate(rot);c.beginPath();c.moveTo(-l,0);c.quadraticCurveTo(0,-l*.7,l,0);c.quadraticCurveTo(0,l*.7,-l,0);c.moveTo(-l*1.3,0);c.lineTo(l*.7,0);c.stroke();c.restore();}
  for(let k=0;k<5;k++){const x=w*(.06+.2*k)+60*S,l=24*S;c.save();c.translate(x,gy-6*S);c.rotate(.3*(k%2?1:-1));c.beginPath();c.moveTo(-l,0);c.quadraticCurveTo(0,-l*.7,l,0);c.quadraticCurveTo(0,l*.7,-l,0);c.stroke();c.restore();}}
 else if(kind==='road'){line(0,gy,w,gy);const sp=220*S,off=wrap(-b*60*S,sp);for(let x=off-sp;x<w+sp;x+=sp)line(x,gy+56*S,x+110*S,gy+56*S);
  c.beginPath();for(let i=0;i<=48;i++){const x=w*i/48,y=Math.min(gy-h*.2,o.cy+(o.box?.[1]??-400)*S)-h*.04-Math.sin(i/48*DW_PI*2.4+1)*h*.05;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 c.restore();}

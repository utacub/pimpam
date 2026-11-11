// Fractals a la natura (CE46, 0.73) · stimuli 5–12: lightning, a river basin, coral, romanesco, neurons, an island, leaf veins, frost.
// Each one is the result of its rule of growth, run when its press comes (a few hundredths of a second); its lines then grow in the
// order in which the model made them.
import {frSeg,frNoise,frIso,frChains} from './fractals-motor.js';
import {frPath,frLoop,frEvent,FR_TAU,FR_GOLD} from './fractals-formes.js';

// ── A tree of nodes (each with its parent) drawn as lines ──────────────────────────────────────────────────────────────
// nodes: [{x, y, p (parent index, −1 at a root), o (order of growth 0–1), c (place in the palette)}]. The width of each branch follows
// the pipe model (Murray, 1926): it grows with the number of tips it feeds, w ∝ n^(1/e).
export function frTreeLines(S,nodes,t0,dur,o={}){const n=nodes.length,tips=new Float32Array(n).fill(0),d=new Float32Array(n);
 for(let i=0;i<n;i++){const p=nodes[i].p;d[i]=p<0?0:d[p]+Math.hypot(nodes[i].x-nodes[p].x,nodes[i].y-nodes[p].y);}
 const kids=new Uint16Array(n);for(const q of nodes)if(q.p>=0)kids[q.p]++;for(let i=0;i<n;i++)if(!kids[i])tips[i]=1;
 for(let i=n-1;i>=0;i--){const p=nodes[i].p;if(p>=0)tips[p]+=tips[i];}
 const wt=o.wTip??.0008,wm=o.wMax??.008,ex=o.exp??2.5,lum=o.lum??1;let dm=1e-6;for(let i=0;i<n;i++)if(d[i]>dm)dm=d[i];
 for(let i=0;i<n;i++){const q=nodes[i];if(q.p<0)continue;const P=nodes[q.p],w=Math.min(wm,wt*Math.pow(tips[i],1/ex));
  const c=q.c??(o.c0??0)+(o.c1??1-(o.c0??0))*(d[i]/dm);
  frSeg(S.st,P.x,P.y,q.x,q.y,t0+(q.o??i/n)*dur,o.seg??.12,w,w*.94,c,lum*(o.dim?(.55+.45*Math.min(1,tips[i]/8)):1),d[q.p],d[i],{pal:S.lap%2,sway:o.sway||0,hot:o.hot??.6,tm:o.tm||0,vx:o.vx||0,vy:o.vy||0});}
 return {dmax:dm,tips};}

// ── 5 · Llamps ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// The dielectric breakdown model (Niemeyer, Pietronero & Wiesmann, 1984): the channel grows one step at a time towards the places where
// the electric potential is highest, with probability ∝ φ^η. The potential is the sum of the charges of the channel (the fast form of
// Kim et al., 2007) plus the field between the cloud and the ground. The channel that first reaches the ground becomes the return
// stroke: a wave of light runs up it.
function frBolt(S,x0,y0,scale,steps,eta,yEnd){const h=.0062*scale,nodes=[{x:x0,y:y0,p:-1,o:0}],cand=new Map(),R=frRandom2(S),key=(i,j)=>i*4096+j;
 const ix=Math.round(x0/h),iy=Math.round(y0/h),phi=(x,y)=>{let s=0;for(const q of nodes)s+=1-h/Math.max(h,Math.hypot(x-q.x,y-q.y));return s;};
 const field=y=>2.2*(y-y0)/Math.max(.1,yEnd-y0)*nodes.length*.08;
 const add=(i,j,p)=>{for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const a=i+di,b=j+dj,k=key(a,b);if(occ.has(k))continue;const c=cand.get(k);if(c){continue;}const x=a*h,y=b*h;if(y<y0-h*2||x<-.05||x>S.AR+.05)continue;cand.set(k,{i:a,j:b,x,y,p,ph:phi(x,y)});}};
 const occ=new Set([key(ix,iy)]);add(ix,iy,0);let hit=-1;
 for(let s=0;s<steps&&hit<0;s++){let tot=0;const arr=[];let mn=1e9,mx=-1e9;for(const c of cand.values()){const v=c.ph+field(c.y);c.v=v;if(v<mn)mn=v;if(v>mx)mx=v;arr.push(c);}
  for(const c of arr){c.w=Math.pow(Math.max(0,(c.v-mn)/Math.max(1e-9,mx-mn)),eta);tot+=c.w;}let r=R()*tot,pick=arr[arr.length-1];for(const c of arr){r-=c.w;if(r<=0){pick=c;break;}}
  const k=key(pick.i,pick.j);cand.delete(k);occ.add(k);const ni=nodes.length;nodes.push({x:pick.x,y:pick.y,p:pick.p,o:0});
  for(const c of cand.values())c.ph+=1-h/Math.max(h,Math.hypot(c.x-pick.x,c.y-pick.y));
  // a candidate keeps the parent it had, unless the new point is nearer
  for(const c of cand.values()){if(Math.abs(c.i-pick.i)<=1&&Math.abs(c.j-pick.j)<=1)c.p=ni;}
  add(pick.i,pick.j,ni);if(pick.y>=yEnd)hit=ni;}
 nodes.forEach((q,i)=>q.o=i/nodes.length);return {nodes,hit};}
function frRandom2(S){return S.rnd;}
function frBoltDraw(S,b,t0,dur,w){const main=new Set();for(let i=b.hit;i>=0;i=b.nodes[i].p)main.add(i);
 const r=frTreeLines(S,b.nodes,t0,dur,{wTip:w*.18,wMax:w*.7,exp:3,c0:.15,c1:.75,lum:.85,hot:.9,seg:.05,dim:true});
 // the return stroke: the main channel, wide and bright, appears all at once when the leader touches the ground
 if(b.hit>=0){const tr=t0+dur+.05;let d=0;const path=[...main].reverse();for(let k=1;k<path.length;k++){const P=b.nodes[path[k-1]],Q=b.nodes[path[k]],l=Math.hypot(Q.x-P.x,Q.y-P.y);
  frSeg(S.st,P.x,P.y,Q.x,Q.y,tr+k*.004,.04,w,w,.95,1.25,d,d+l,{pal:S.lap%2,hot:0});d+=l;}S.pulses.push(tr+.1);frEvent(S,'tro',b.nodes[b.hit].x,tr);}
 return r;}
export const FR_LLAMPS={id:'llamps',name:'Llamps',what:'llamps que es ramifiquen',
 pal:['#2a0f6b','#6a2bd9','#9b6bff','#7fe0ff','#ffffff'],pal2:['#0b2a6b','#1f6fd9','#3fd0ff','#d0b0ff','#ffffff'],look:{bloom:.85,glow:3.6,minW:.8},wind:0,pulseV:.9,
 acts:[(S,t)=>{const x=S.AR*(.42+S.rnd()*.16),b=frBolt(S,x,-.01,1,900,1.6,1.0);frBoltDraw(S,b,t,3.2,.0055);frEvent(S,'neix',x,t);},
  (S,t)=>{const x=S.AR*(.12+S.rnd()*.12),b=frBolt(S,x,-.01,.7,500,1.8,.72);frBoltDraw(S,b,t,2.4,.0035);frEvent(S,'neix',x,t);},
  (S,t)=>{const x=S.AR*(.78+S.rnd()*.12),b=frBolt(S,x,-.01,.55,380,2,.55);frBoltDraw(S,b,t,2,.0028);frEvent(S,'neix',x,t);}]};

// ── 6 · Riu i delta ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A river basin: water runs down a rough (fractal) land that falls towards the sea, each cell sends its water to its steepest neighbour,
// and the channels are the cells that gather enough of it. The tributaries repeat the shape of the whole (Rodríguez-Iturbe & Rinaldo,
// 1997). Drawn from the sea upstream, as the valleys are cut by the water that runs back into the land.
export const FR_RIU={id:'riu',name:'Riu i afluents',what:'els afluents d’un riu',
 pal:['#0a2d6b','#1565c0','#00b0d8','#4be0c0','#e0fff8'],pal2:['#2b1060','#5e35b1','#1e88e5','#26c6da','#e0f7ff'],look:{bloom:.6,glow:3,minW:.8},wind:0,pulseV:.5,
 acts:[(S,t)=>{const nx=200,ny=Math.round(200/S.AR),h=1/(ny-1),N=frNoise(S.seed),z=new Float32Array(nx*ny),mouth=.5+(S.rnd()-.5)*.3;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i/(nx-1),y=j/(ny-1);z[j*nx+i]=1.25*(1-y)+.32*N(x*4,y*4,6)+.25*Math.abs(x-mouth)*(1-y*.6);}
  const to=new Int32Array(nx*ny).fill(-1),acc=new Float32Array(nx*ny).fill(1),ord=[...z.keys()].sort((a,b)=>z[b]-z[a]);
  for(const k of ord){const i=k%nx,j=(k/nx)|0;if(j===ny-1)continue;let best=-1,bs=0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[1,1],[-1,1],[0,-1],[1,-1],[-1,-1]]){const a=i+di,b=j+dj;if(a<0||a>=nx||b<0||b>=ny)continue;const q=b*nx+a,sl=(z[k]-z[q])/Math.hypot(di,dj);if(sl>bs){bs=sl;best=q;}}
   if(best<0){best=Math.min(ny-1,j+1)*nx+i;}to[k]=best;}
  for(const k of ord)if(to[k]>=0)acc[to[k]]+=acc[k];
  // the channels, from each outlet upstream: the distance along the river sets when each piece appears
  const th=14,dist=new Float32Array(nx*ny).fill(-1),up=new Map();for(let k=0;k<nx*ny;k++)if(to[k]>=0&&acc[k]>=th){const l=up.get(to[k]);l?l.push(k):up.set(to[k],[k]);}
  const X=k=>(k%nx)*h*S.AR*(ny-1)/(nx-1)/S.AR*S.AR/(h*(ny-1))*h*(nx-1)/(nx-1),pos=k=>[(k%nx)/(nx-1)*S.AR,((k/nx)|0)/(ny-1)*1.02-.01];
  const stack=[];for(let k=(ny-1)*nx;k<nx*ny;k++)if(acc[k]>=th){dist[k]=0;stack.push(k);}let dm=1e-6;
  while(stack.length){const k=stack.pop();for(const u of up.get(k)||[]){const [x0,y0]=pos(k),[x1,y1]=pos(u);dist[u]=dist[k]+Math.hypot(x1-x0,y1-y0);if(dist[u]>dm)dm=dist[u];stack.push(u);}}
  const amax=Math.max(...acc);
  for(let u=0;u<nx*ny;u++){if(dist[u]<0||to[u]<0||dist[to[u]]<0)continue;const [x0,y0]=pos(to[u]),[x1,y1]=pos(u),a=acc[u],w=Math.min(.012,.0008*Math.pow(a/th,.42)),c=.15+.8*Math.pow(Math.log(a/th+1)/Math.log(amax/th+1),.8);
   frSeg(S.st,x0,y0,x1,y1,t+dist[to[u]]/dm*4.6,.18,w,w*.95,1-c,.6+.5*c,dist[to[u]],dist[u],{pal:S.lap%2,hot:.5});}
  frEvent(S,'neix',S.AR*mouth,t);for(let q=1;q<6;q++)frEvent(S,'afluent',S.AR*S.rnd(),t+q*.8);}]};

// ── 7 · Corall ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Diffusion-limited aggregation (Witten & Sander, 1981) on the sea floor: particles wander at random until they touch the colony and
// stick there; the tips catch more of them than the hollows, so the colony branches again and again, as accretive corals and sponges
// do (Kaandorp, 1994). Each particle is a line to the one it stuck to, drawn in the order they arrived.
function frDLA(S,nx,ny,seeds,count,o={}){const g=new Int32Array(nx*ny).fill(-1),nodes=[],R=S.rnd,stick=o.stick??1;
 for(const [i,j] of seeds){const k=j*nx+i;if(g[k]>=0)continue;g[k]=nodes.length;nodes.push({i,j,p:-1});}
 let top=Math.min(...seeds.map(s=>s[1]));const N8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
 const hits=new Uint8Array(nx*ny);
 for(let n=0;n<count;n++){let i=Math.floor(R()*nx),j=Math.max(1,top-6),steps=0;
  for(;;){if(++steps>6000)break;const r=R();if(r<.25)i++;else if(r<.5)i--;else if(r<.75+(o.bias||0))j++;else j--;
   if(i<0)i=nx-1;if(i>=nx)i=0;if(j<0){j=0;}if(j>=ny){j=ny-1;}if(j<top-14){j=top-6;continue;}
   let par=-1;for(const [di,dj] of N8){const a=i+di,b=j+dj;if(a<0||a>=nx||b<0||b>=ny)continue;const q=g[b*nx+a];if(q>=0){par=q;break;}}
   if(par>=0&&g[j*nx+i]<0){if(stick>1&&++hits[j*nx+i]<stick)continue;g[j*nx+i]=nodes.length;nodes.push({i,j,p:par});if(j<top)top=j;break;}}}
 return nodes;}
export const FR_CORALL={id:'corall',name:'Corall',what:'les branques d’un corall',
 pal:['#5a0f4a','#c2185b','#ff6f61','#ffb74d','#fff1c1'],pal2:['#103a5a','#00838f','#26c6da','#ff8a80','#fff0f0'],look:{bloom:.6,glow:3,minW:.8},wind:.003,pulseV:.5,
 acts:[(S,t)=>{const ny=150,nx=Math.round(ny*S.AR),h=1/ny,seeds=[];for(let s=0;s<9;s++)seeds.push([Math.floor((s+.5+(S.rnd()-.5)*.6)/9*nx),ny-1]);
  const nodes=frDLA(S,nx,ny,seeds,2700);const pts=nodes.map((q,i)=>({x:(q.i+.5)*h,y:(q.j+.5)*h,p:q.p,o:i/nodes.length}));
  frTreeLines(S,pts,t,4.8,{wTip:.0011,wMax:.0075,exp:2.4,c0:.05,c1:.95,hot:.5,sway:.6,seg:.1});frEvent(S,'neix',S.AR*.5,t);for(let q=1;q<7;q++)frEvent(S,'creix',S.AR*S.rnd(),t+q*.65);}]};

// ── 8 · Romanesco ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Romanesco broccoli: buds on Fibonacci spirals, each bud a small cone of buds on Fibonacci spirals, and so on (Azpeitia et al., 2021).
// Three levels, each drawn as the spiral lines (parastichies) that join neighbouring buds and the spiral outline of the smallest ones.
function frCone(S,cx,cy,R,N,lv,t0,dur,c0){const rot=S.rnd()*FR_TAU,pos=i=>{const r=R*Math.sqrt((i+.5)/N),a=i*FR_GOLD+rot;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r,r];};
 const fam=lv===0?[13,21]:lv===1?[8,13]:[5,8],w=[.0024,.0013,.0008][lv];
 fam.forEach((st,f)=>{for(let i=0;i+st<N;i++){const [x0,y0,r0]=pos(i),[x1,y1,r1]=pos(i+st);frSeg(S.st,x0,y0,x1,y1,t0+dur*Math.sqrt(i/N)+f*.2,.25,w,w,c0+.15*f+.2*r0/R,.75+.2*(1-r0/R),r0,r1,{pal:S.lap%2,hot:.3});}});
 if(lv>=2){for(let i=0;i<N;i++){const [x,y,r]=pos(i),br=R/Math.sqrt(N)*.55*(.5+r/R);const pts=[];for(let k=0;k<=14;k++){const a=k/14*FR_TAU*1.25,rr=br*(1-k/18);pts.push(x+Math.cos(a+i)*rr,y+Math.sin(a+i)*rr);}
   frPath(S,pts,t0+dur*Math.sqrt(i/N)+.3,br*8,{w0:.0009,c0:c0+.45,lum:.9,d0:r,hot:0,pal:S.lap%2});}return;}
 const nb=lv===0?34:21;for(let i=0;i<N;i+=Math.max(1,Math.floor(N/nb))){const [x,y,r]=pos(i);const br=R*.62/Math.sqrt(nb)*(.55+.6*r/R);frCone(S,x,y,br,lv===0?55:34,lv+1,t0+dur*Math.sqrt(i/N)*.9+.4,dur*.6,c0+.2);}}
export const FR_ROMANESCO={id:'romanesco',name:'Romanesco',what:'espirals dins d’espirals',
 pal:['#0b5d1e','#2e9e3a','#9be22d','#e6ff70','#ffffe0'],pal2:['#1a237e','#3949ab','#26a69a','#c6ff00','#f9fbe7'],look:{bloom:.5,glow:2.6,halo:.15,minW:.7},wind:0,
 acts:[(S,t)=>{frCone(S,S.AR*.5,.5,.47,240,0,t,3.4,0);frEvent(S,'neix',S.AR*.5,t);},
  (S,t)=>{frCone(S,S.AR*.1,.2,.19,140,1,t,2.2,.15);frEvent(S,'neix',S.AR*.1,t);},
  (S,t)=>{frCone(S,S.AR*.9,.8,.2,140,1,t,2.2,.15);frEvent(S,'neix',S.AR*.9,t);},
  (S,t)=>{frCone(S,S.AR*.92,.17,.12,90,2,t,1.6,.3);frCone(S,S.AR*.08,.84,.12,90,2,t+.3,1.6,.3);frEvent(S,'espiral',S.AR*.5,t);}]};

// ── 9 · Neurones ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// Dendritic trees after Cuntz et al. (2010): the points the neuron must reach are joined one by one to the tree, always by the link that
// costs least, where the cost is the length of the wire plus bf times the path from that point back to the cell body. That single rule
// gives the branching of real dendrites. Each neuron has its own field (a pyramidal cell has a long apical dendrite).
function frNeuron(S,cx,cy,R,n,bf,kind){const pts=[{x:cx,y:cy,p:-1,o:0,pl:0}],cand=[];
 for(let k=0;k<n;k++){let x,y;if(kind==='pyr'&&S.rnd()<.45){const u=S.rnd();x=cx+(S.rnd()-.5)*R*.5*(.3+u);y=cy-R*1.6*u-R*.1;}else{const a=S.rnd()*FR_TAU,r=R*Math.sqrt(S.rnd());x=cx+Math.cos(a)*r*1.1;y=cy+Math.sin(a)*r*(kind==='pyr'?.6:.9)+(kind==='pyr'?R*.25:0);}cand.push({x,y});}
 const best=cand.map(c=>({c,cost:Math.hypot(c.x-cx,c.y-cy)*(1+bf),p:0}));let order=0;
 while(best.length){let bi=0;for(let i=1;i<best.length;i++)if(best[i].cost<best[bi].cost)bi=i;const b=best.splice(bi,1)[0],P=pts[b.p],l=Math.hypot(b.c.x-P.x,b.c.y-P.y);
  const ni=pts.length;pts.push({x:b.c.x,y:b.c.y,p:b.p,o:++order/n,pl:P.pl+l});
  for(const q of best){const c=Math.hypot(q.c.x-b.c.x,q.c.y-b.c.y)+bf*(P.pl+l+Math.hypot(q.c.x-b.c.x,q.c.y-b.c.y));if(c<q.cost){q.cost=c;q.p=ni;}}}
 // each link bent slightly in the middle: real dendrites are not straight wires
 const out=[pts[0]];const map=[0];for(let i=1;i<pts.length;i++){const q=pts[i],P=pts[q.p],mx=(P.x+q.x)/2+(S.rnd()-.5)*.01,my=(P.y+q.y)/2+(S.rnd()-.5)*.01;out.push({x:mx,y:my,p:map[q.p],o:q.o-.5/n});map.push(out.length);out.push({x:q.x,y:q.y,p:out.length-1,o:q.o});}
 return out;}
export const FR_NEURONES={id:'neurones',name:'Neurones',what:'les branques de les neurones',
 pal:['#3a0ca3','#7209b7','#f72585','#ff8fd8','#fff0fb'],pal2:['#023e8a','#0077b6','#00b4d8','#90e0ef','#ffffff'],look:{bloom:.65,glow:3.2,minW:.8},wind:.002,pulseV:.55,
 acts:[[.5,.62,.3,420,.35,'pyr'],[.16,.42,.18,220,.45,'star'],[.84,.5,.2,240,.4,'pyr'],[.3,.88,.13,140,.5,'star'],[.72,.15,.13,140,.5,'star'],[.03,.9,.1,90,.5,'star'],[.97,.1,.1,90,.5,'star']]
  .map(([fx,fy,R,n,bf,k],j)=>(S,t)=>{const nodes=frNeuron(S,fx*S.AR,fy,R,n,bf,k);frTreeLines(S,nodes,t,2.6,{wTip:.0009,wMax:.006,exp:2.2,c0:.25+.08*(j%3),c1:.95,hot:.7,sway:.5});
   frLoop(S,fx*S.AR,fy,R*.07,R*.07,0,t,.4,{w0:.003,c0:.85,lum:1.2,pal:S.lap%2},12);frEvent(S,'neix',fx*S.AR,t);})};

// ── 10 · Illa i costa ────────────────────────────────────────────────────────────────────────────────────────────────────
// A coast is as long as the ruler that measures it is short (Mandelbrot, 1967): here the land is a fractal surface (sums of noise at
// every scale) and its level lines are drawn from the sea up to the peaks, as on a map. Every bay has smaller bays along it.
export const FR_COSTA={id:'costa',name:'Illa i costa',what:'les corbes de nivell d’una illa',
 pal:['#1a3a8f','#00a6a6','#7ed957','#ffd23f','#ff7aa8'],pal2:['#30106b','#8e24aa','#ff7043','#ffca28','#fffde7'],look:{bloom:.45,glow:2.6,halo:.15,minW:.8},wind:0,pulseV:.35,
 acts:[(S,t)=>{const nx=260,ny=Math.round(260/S.AR),h=1/(ny-1),N=frNoise(S.seed),f=new Float32Array(nx*ny),ox=.5+(S.rnd()-.5)*.2,oy=.5+(S.rnd()-.5)*.1;
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const x=i*h,y=j*h,dx=(x-S.AR*ox)/(S.AR*.5),dy=(y-oy)/.5,r=Math.hypot(dx*.78,dy*.92);f[j*nx+i]=.62*N(x*2.2,y*2.2,7,2,.55)+.55-.95*r*r+.1*N(x*7,y*7,3);}
  const L=14;for(let l=0;l<L;l++){const lv=-.05+l*.06,chains=frChains(frIso(f,nx,ny,lv,h,0,0),h*.01);const c=l/(L-1),t0=t+l*.27;
   for(const ch of chains){if(ch.length<8)continue;frPath(S,ch,t0,.5,{w0:l===2?.0024:.0012,c0:c,lum:l===2?1.25:.85,d0:l*.08,hot:.3,pal:S.lap%2});}
   if(l%3===0)frEvent(S,'nivell',S.AR*(.3+.4*S.rnd()),t0);}}]};

// ── 11 · Nervis d'una fulla ─────────────────────────────────────────────────────────────────────────────────────────────
// Leaf venation by space colonisation (Runions et al., 2005): the leaf blade is full of sources of auxin; each source pulls the vein
// nearest to it, the veins grow one step towards the sources they feel, and a source is used up when a vein reaches it. The large veins
// come first and the small ones fill the spaces between them, at every scale.
function frLeaf(S,cx,cy,L,ang,ns,t0,dur,c0){const W=L*.36,inside=(u,v)=>{if(u<0||u>1)return false;const half=W*Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.9)*(1-.15*u);return Math.abs(v)<half;};
 const ca=Math.cos(ang),sa=Math.sin(ang),toXY=(u,v)=>[cx+ca*u*L-sa*v,cy+sa*u*L+ca*v];
 const src=[];while(src.length<ns){const u=S.rnd(),v=(S.rnd()*2-1)*W;if(inside(u,v))src.push([u*L,v]);}
 const nodes=[{a:0,b:0,p:-1,o:0}],step=L*.012,kill=step*1.6;
 for(let it=0;it<240&&src.length;it++){const pull=new Map();
  for(const s of src){let bi=0,bd=1e9;for(let i=0;i<nodes.length;i++){const d=(nodes[i].a-s[0])**2+(nodes[i].b-s[1])**2;if(d<bd){bd=d;bi=i;}}const v=pull.get(bi)||[0,0,0];const l=Math.sqrt(bd)||1;v[0]+=(s[0]-nodes[bi].a)/l;v[1]+=(s[1]-nodes[bi].b)/l;v[2]++;pull.set(bi,v);}
  // the midrib keeps going along the leaf while sources remain ahead of it
  for(const [i,v] of pull){const l=Math.hypot(v[0],v[1])||1;nodes.push({a:nodes[i].a+v[0]/l*step,b:nodes[i].b+v[1]/l*step,p:i,o:it});}
  for(let k=src.length-1;k>=0;k--){const s=src[k];for(let i=nodes.length-1;i>=Math.max(0,nodes.length-pull.size*3);i--){if((nodes[i].a-s[0])**2+(nodes[i].b-s[1])**2<kill*kill){src.splice(k,1);break;}}}}
 const mo=nodes[nodes.length-1].o||1;const pts=nodes.map(q=>{const [x,y]=toXY(q.a/L,q.b);return {x,y,p:q.p,o:q.o/mo};});
 frTreeLines(S,pts,t0,dur,{wTip:.0007,wMax:.006,exp:2.3,c0,c1:c0+.45,hot:.4,sway:.4,seg:.1});
 // the margin of the blade, drawn round from the stalk
 const m=[];for(let k=0;k<=60;k++){const u=k/60,half=W*Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.9)*(1-.15*u);m.push(toXY(u,half));}const mm=[];for(let k=60;k>=0;k--)mm.push(toXY(k/60,-W*Math.pow(Math.sin(Math.PI*Math.pow(k/60,.8)),.9)*(1-.15*k/60)));
 frPath(S,[...m,...mm].flat(),t0+dur*.4,L*2.6/(dur*.8),{w0:.0018,c0:c0+.6,lum:.9,hot:.2,sway:.4,pal:S.lap%2});}
export const FR_FULLA={id:'fulla',name:'Nervis d’una fulla',what:'els nervis d’unes fulles',
 pal:['#0d4f2a','#2e9e4a','#a5d63f','#ffd54f','#fff3c4'],pal2:['#4a148c','#ab47bc','#ff7043','#ffca28','#fff8e1'],look:{bloom:.55,glow:2.8,minW:.75},wind:.006,pulseV:.5,
 acts:[(S,t)=>{frLeaf(S,S.AR*.2,.95,1.15,-.55,2200,t,3.6,.05);frEvent(S,'neix',S.AR*.3,t);},
  (S,t)=>{frLeaf(S,S.AR*.98,.1,.5,2.55,700,t,2.6,.15);frEvent(S,'neix',S.AR*.85,t);},
  (S,t)=>{frLeaf(S,S.AR*.02,.15,.38,.35,450,t,2.2,.2);frEvent(S,'neix',S.AR*.1,t);}]};

// ── 12 · Gel a la finestra ───────────────────────────────────────────────────────────────────────────────────────────────
// Frost on a window pane: ice grows from the frame inwards in needles that branch at 60°, as hexagonal ice does, and each branch
// branches again in the same way, smaller (dendritic growth: Libbrecht, 2005).
function frIce(S,x,y,a,l,lv,t0,c,o){const n=Math.max(2,Math.round(l/.012)),pts=[x,y];let px=x,py=y;for(let i=1;i<=n;i++){px+=Math.cos(a)*l/n;py+=Math.sin(a)*l/n;pts.push(px,py);}
 const sp=.22;frPath(S,pts,t0,sp,{w0:[.0026,.0016,.001,.0007][lv],w1:.0005,c0:c,c1:c+.25,lum:[1,.95,.85,.75][lv],d0:o.d||0,hot:lv<2?.7:0,pal:S.lap%2});if(lv>=3)return;
 const k=lv===0?11:lv===1?7:5;for(let i=1;i<k;i++){const u=i/k+(S.rnd()-.5)*.04,bx=x+Math.cos(a)*l*u,by=y+Math.sin(a)*l*u,bl=l*(1-u)*(.5+S.rnd()*.15);if(bl<.012)continue;
  for(const s of [-1,1])if(S.rnd()<.92)frIce(S,bx,by,a+s*Math.PI/3,bl,lv+1,t0+l*u/sp,c+.15,{d:(o.d||0)+l*u});}}
export const FR_GEL={id:'gel',name:'Gel a la finestra',what:'agulles de gel que es ramifiquen',
 pal:['#1a237e','#3f6fe0','#8ec9ff','#e3f6ff','#ffffff'],pal2:['#004d40','#00897b','#80deea','#e0f7fa','#ffffff'],look:{bloom:.7,glow:3.2,minW:.75},wind:0,pulseV:.45,
 acts:[...Array(12)].map((_,j)=>(S,t)=>{const side=j%4,u=(Math.floor(j/4)+.5+(S.rnd()-.5)*.6)/3;let x,y,a;
  if(side===0){x=u*S.AR;y=0;a=Math.PI/2;}else if(side===1){x=S.AR;y=u;a=Math.PI;}else if(side===2){x=u*S.AR;y=1;a=-Math.PI/2;}else{x=0;y=u;a=0;}
  a+=(S.rnd()-.5)*.9;frIce(S,x,y,a,.28+S.rnd()*.18,0,t,.05+.1*S.rnd(),{});frEvent(S,'gel',x,t);})};

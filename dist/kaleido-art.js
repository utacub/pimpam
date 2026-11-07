// Caleidoscopi (CE21): the twenty patterns, in the order of the plan. Each one draws a frame from the time alone (no stored state),
// so pausing, resizing or replaying gives the same image, and every moving part is a continuous function of time.
// Each entry gives its step grid and the steps of its visual events; kaleido.js turns them into seconds for the drawing and the music.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,KeaseInOut,KeaseBack,Krand,Kmix,Krgba,Kramp,Kloop,Kbump} from './kaleido-base.js';
const KL=o=>o.lit?'lighter':'source-over';
function Kglow(c,x,y,r,color,a){if(!(r>0)||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,Krgba(color,a));g.addColorStop(.4,Krgba(color,a*.45));g.addColorStop(1,Krgba(color,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,K_TAU);c.fill();}
function Kpath(c,pts,close){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);if(close)c.closePath();}
// Luminous line: a wide faint halo under a thin bright core.
function Kneon(c,o,pts,color,width,alpha,close=false){if(pts.length<2||alpha<=0)return;Kpath(c,pts,close);c.strokeStyle=Krgba(color,alpha*.14);c.lineWidth=width*4.5;c.stroke();c.strokeStyle=Krgba(color,alpha*.35);c.lineWidth=width*2;c.stroke();c.strokeStyle=Krgba(o.lit?Kmix(color,'#ffffff',.35):color,alpha);c.lineWidth=width;c.stroke();}
function Kring(c,x,y,r,width,color,a){if(a<=0||!(r>0))return;const inner=Math.max(0,r-width),g=c.createRadialGradient(x,y,inner,x,y,r+width);g.addColorStop(0,Krgba(color,0));g.addColorStop(inner>0?.5:Kclamp(r/(r+width)),Krgba(color,a));g.addColorStop(1,Krgba(color,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r+width,0,K_TAU);c.fill();}
const Krot=(cx,cy,x,y,a)=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)];

// 1 · Mandala que respira: eight rings of petals open from the centre, turn in opposite directions and breathe.
const MANDALA_PALETTES=[['#b14dff','#ff3d9a','#ff6f4a','#ff9f2e','#ffd23f'],['#7b5cff','#ff4fc3','#ff7a59','#ffc93c','#ffe873'],['#ff3fb4','#ff5c7a','#ff9a3c','#ffd75e','#fff1a8']];
const MANDALA_RINGS=8,MANDALA_TWIST=.25,MANDALA_HITS=[0,1,2,3,4,5,6,7],MANDALA_OPEN=MANDALA_HITS.map(s=>s/12);
export const KALEIDO_SPEEDS=Object.freeze({mandalaRing:.075,mandalaRingStep:.012,mandalaBreath:4.2,threadsTurn:.05,auroraTurn:.12});
// Ring k turns slowly in alternating directions; while it opens it untwists by a quarter of a radian.
export function mandalaRing(k,ph,n){const open=KeaseBack((ph.evolve-MANDALA_OPEN[k])/.17),dir=k%2?-1:1;return {open,spin:dir*ph.motion*(KALEIDO_SPEEDS.mandalaRing+k*KALEIDO_SPEEDS.mandalaRingStep)+dir*MANDALA_TWIST*(1-KeaseOut((ph.evolve-MANDALA_OPEN[k])/.17))+(k%2?Math.PI/n:0)};}
function Kpetal(c,len,width){c.beginPath();c.moveTo(0,0);c.bezierCurveTo(width,len*.22,width*.82,len*.72,0,len);c.bezierCurveTo(-width*.82,len*.72,-width,len*.22,0,0);c.closePath();}
function Kmandala(c,w,h,ph,o){const pal=MANDALA_PALETTES[o.seed%3],cx=w/2,cy=h/2,breath=1+(o.reduced?.012:.035)*Math.sin(ph.clock*K_TAU/KALEIDO_SPEEDS.mandalaBreath),R=Math.min(w,h)*.44*ph.grow*breath,extra=o.seed%2*2,shape=.9+Krand(3,o.seed)*.2;
 for(let k=MANDALA_RINGS-1;k>=0;k--){const n=6+2*k+extra,{open,spin}=mandalaRing(k,ph,n);if(open<=0)continue;
  const rk=R*(.17+.1*k),len=R*(.2+.018*k)*open,width=len*(.4-.014*k)*shape;
  const color=o.tone(Kramp(pal,k/(MANDALA_RINGS-1))),light=o.tone(Kmix(Kramp(pal,k/(MANDALA_RINGS-1)),'#ffffff',.45));
  if(o.lit){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(cx,cy,rk*.6,cx,cy,rk+len*.7);g.addColorStop(0,Krgba(color,0));g.addColorStop(.6,Krgba(color,.1*Kclamp(open)));g.addColorStop(1,Krgba(color,0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,rk+len*.7,0,K_TAU);c.fill();c.restore();}
  for(let i=0;i<n;i++){c.save();c.translate(cx,cy);c.rotate(spin+i*K_TAU/n);c.translate(0,rk-len*.5);const g=c.createLinearGradient(0,0,0,len);g.addColorStop(0,Kmix(color,o.lit?'#14051f':'#ffffff',.35));g.addColorStop(.55,color);g.addColorStop(1,light);c.globalAlpha*=.92;Kpetal(c,len,width);c.fillStyle=g;c.fill();
   c.strokeStyle=Krgba(o.lit?'#ffffff':'#1d2a55',.22);c.lineWidth=Math.max(.6,len*.02);c.beginPath();c.moveTo(0,len*.12);c.quadraticCurveTo(width*.08,len*.5,0,len*.86);c.stroke();c.restore();}}
 const core=Math.min(w,h)*.44*breath*.11*(.45+.55*Ksmooth(ph.t/.35)),g=c.createRadialGradient(cx,cy,0,cx,cy,core*1.6);g.addColorStop(0,o.tone('#fff4c2'));g.addColorStop(.45,o.tone(pal[4]));g.addColorStop(.75,o.tone(pal[2]));g.addColorStop(1,Krgba(pal[1],0));c.fillStyle=g;c.beginPath();c.arc(cx,cy,core*1.6,0,K_TAU);c.fill();
 for(let i=0;i<34;i++){const a=i*2.39996+ph.motion*.2,r=core*.9*Math.sqrt(i/34);c.fillStyle=Krgba(o.lit?'#7a1f4f':'#ffffff',.55);c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,Math.max(.6,core*.045),0,K_TAU);c.fill();}
}

// 2 · Gira-sol de punts: dots placed at the golden angle grow outwards; a soft wave of light crosses them at each visual event.
const SUN_PALETTES=[['#ff4f7b','#ff9d3d','#ffe14d','#6dff8a','#35e0ff','#6a7dff','#c46bff'],['#ff6bd5','#ff5f6d','#ffb13d','#e8ff4d','#4dffb0','#38c8ff','#8a6bff'],['#ffd23f','#ff8a3d','#ff4f8b','#c46bff','#5a7dff','#2fe6ff','#5dff8a']];
const SUN_N=460,SUN_GOLD=Math.PI*(3-Math.sqrt(5));
function Ksunflower(c,w,h,ph,o){const pal=SUN_PALETTES[o.seed%3],cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46*ph.grow,delta=o.reduced?0:.0012*Math.sin(ph.clock*.22),rot=ph.motion*.06+o.seed*.7,hue=o.seed*.13+ph.clock*.015,colors=[];
 for(let b=0;b<42;b++)colors.push(o.tone(Kloop(pal,b/42+hue)));
 Kglow(c,cx,cy,R*.24,o.tone(pal[2]),.28*Ksmooth(ph.t/.4));
 c.save();c.globalCompositeOperation=KL(o);
 for(let i=0;i<SUN_N;i++){const born=.85*i/SUN_N-.05,s=KeaseBack((ph.evolve-born)/.07);if(s<=0)continue;
  const f=i/SUN_N,r=R*Math.sqrt((i+.5)/SUN_N),a=i*(SUN_GOLD+delta)+rot,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
  let boost=0;for(const tb of o.hitT){const tau=ph.t-tb;if(tau>=0&&tau<2.6)boost+=Kbump(r,tau*S*.42,S*.06)*(1-tau/2.6);}boost=Math.min(1,boost);
  const size=S*.0082*(.55+.75*Math.sqrt(f))*s*(1+.4*boost),col=colors[Math.floor(f*41.99)];
  c.fillStyle=Krgba(col,.16+.14*boost);c.beginPath();c.arc(x,y,size*2.3,0,K_TAU);c.fill();
  c.fillStyle=Krgba(o.lit&&boost>.02?Kmix(col,'#ffffff',.25*boost):col,.95);c.beginPath();c.arc(x,y,size,0,K_TAU);c.fill();}
 c.restore();}

// 3 · Caleidoscopi de vidre: translucent shards reflected with sixfold mirror symmetry, joining in pairs and drifting across the mirrors.
const GLASS_PALETTES=[['#2445ff','#13d6c8','#3a5cff','#a6ff2e','#5a3cff'],['#2a5cff','#13d6c8','#4a3cff','#8cff3a','#1fa8ff'],['#4a3cff','#14c8e6','#2a7bff','#b6ff3b','#3d4bff']];
function Kglass(c,w,h,ph,o){const pal=GLASS_PALETTES[o.seed%3],cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.47*ph.grow,rot=ph.motion*.07+o.seed*.4,drift=o.reduced?.3:1,shards=[];
 for(let s=0;s<12;s++){const vis=KeaseOut((ph.t-o.hitT[s>>1]+.15)/.7);if(vis<=0)continue;
  const q=s*7,rc=R*(.12+.8*Krand(q+1,o.seed))*(1+.1*Math.sin(ph.clock*.31*drift+s)),ac=Krand(q+2,o.seed)*.8-.15+.22*drift*Math.sin(ph.clock*.19+s*1.7),n=3+Math.floor(Krand(q+3,o.seed)*3),size=R*(.12+.18*Krand(q+4,o.seed))*(.6+.4*vis),spin=Krand(q+5,o.seed)*K_TAU+ph.clock*.12*drift*(Krand(q+6,o.seed)-.5),x=Math.cos(ac)*rc,y=Math.sin(ac)*rc,pts=[];
  for(let v=0;v<n;v++){const an=spin+v*K_TAU/n+(Krand(s*13+v,o.seed)-.5)*.9,rr=size*(.6+.4*Krand(s*17+v,o.seed));pts.push([x+Math.cos(an)*rr,y+Math.sin(an)*rr]);}
  const col=o.tone(pal[s%5]),col2=o.tone(pal[(s+2)%5]),g=c.createLinearGradient(x-size,y-size,x+size,y+size);g.addColorStop(0,Krgba(col,.5*vis));g.addColorStop(1,Krgba(col2,.2*vis));
  shards.push({pts,g,edge:Krgba(Kmix(col,'#ffffff',.5),.55*vis)});}
 c.save();c.translate(cx,cy);c.globalCompositeOperation=KL(o);c.lineJoin='round';
 for(let k=0;k<6;k++)for(let mirror=0;mirror<2;mirror++){c.save();c.rotate(rot+k*Math.PI/3);if(mirror)c.scale(1,-1);c.beginPath();c.moveTo(0,0);c.arc(0,0,R,0,Math.PI/6);c.closePath();c.clip();
  for(const sh of shards){Kpath(c,sh.pts,true);c.fillStyle=sh.g;c.fill();c.strokeStyle=sh.edge;c.lineWidth=Math.max(.8,S*.0022);c.stroke();}c.restore();}
 Kring(c,0,0,R,R*.05,o.tone(pal[1]),.1*Ksmooth(ph.t/.5));
 const jewel=R*.075*(1+.05*Math.sin(ph.clock*1.2)),hex=Array.from({length:6},(_,i)=>[Math.cos(rot+i*Math.PI/3)*jewel,Math.sin(rot+i*Math.PI/3)*jewel]);Kglow(c,0,0,jewel*3,o.tone(pal[1]),.35);Kpath(c,hex,true);c.fillStyle=Krgba(o.tone(Kmix(pal[1],'#ffffff',.5)),.85);c.fill();
 c.restore();}

// 4 · Fil de llum: Lissajous figures of light; three pulses run along each figure, and the figure changes ratio at each visual event.
const LISSA_SETS=[[[1,2],[2,3],[3,4]],[[2,3],[3,4],[4,5]],[[1,2],[3,4],[3,5]]];
const LISSA_PALETTES=[['#29e7ff','#8a6bff','#ff3fd0'],['#ff3fd0','#b06bff','#29e7ff'],['#3fffe0','#29a8ff','#ff5fe0']];
function Klissajous(c,w,h,ph,o){const set=LISSA_SETS[o.seed%3],pal=LISSA_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.42*ph.grow,width=Math.max(1,S*.003),fade=1.5*o.step;
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineJoin='round';
 set.forEach(([a,b],f)=>{const inW=f===0?1:Ksmooth((ph.t-o.hitT[f])/fade),outW=f===set.length-1?1:1-Ksmooth((ph.t-o.hitT[f+1])/fade),wgt=inW*outW;if(wgt<=.004)return;
  [1,.72,.46].forEach((size,copy)=>{const delta=1.1+ph.motion*.12*(copy%2?-1:1)+o.seed*.9+copy*.7,xs=R*1.18*size,ys=R*size,col=pal[copy],P=s=>[cx+xs*Math.sin(a*s+delta),cy+ys*Math.sin(b*s)],full=[];
   for(let i=0;i<=360;i++)full.push(P(i/360*K_TAU));Kneon(c,o,full,col,width*(1-.2*copy),.26*wgt,true);
   const speed=(o.reduced?.5:1)*.95/Math.max(a,b)/(.6+.4*size),trail=K_TAU/2*.8,chunks=14;
   for(let j=0;j<2;j++){const head=ph.clock*speed*(copy%2?-1:1)+j*Math.PI+o.seed+copy;
    for(let q=0;q<chunks;q++){const s0=head-trail+q*trail/chunks,pts=[];for(let i=0;i<=6;i++)pts.push(P(s0+i*trail/chunks/6));const u=(q+1)/chunks;Kpath(c,pts);c.strokeStyle=Krgba(Kmix(col,pal[(copy+1)%3],1-u),.85*u*u*wgt);c.lineWidth=width*(1+1.8*u);c.stroke();}
    const hp=P(head);Kglow(c,hp[0],hp[1],S*.032*(.6+.4*size),o.lit?Kmix(col,'#ffffff',.45):col,.8*wgt);}});});
 c.restore();}

// 5 · Metaboles: luminous drops bud from a central mass, stretch a neck, let go and drift, joining and parting again (no blur filter).
const META_PALETTES=[['#ffb03d','#ff5f8a','#a35cff'],['#ff8a3d','#ff4fb0','#7b5cff'],['#ffd23f','#ff6f61','#c25cff']];
// Neck between two circles (after the "metaball" construction by Hiroyuki Sato). It narrows to a line before it vanishes, so it never snaps.
function Kneck(c,b1,b2){const {x:x1,y:y1,r:r1}=b1,{x:x2,y:y2,r:r2}=b2,d=Math.hypot(x2-x1,y2-y1),max=(r1+r2)*1.7;if(d>=max||d<=Math.abs(r1-r2)+1e-3)return;
 const v=.5*(1-Ksmooth((d-.82*max)/(.18*max)));if(v<.005)return;const PI=Math.PI;let u1=0,u2=0;
 if(d<r1+r2){u1=Math.acos(Kclamp((r1*r1+d*d-r2*r2)/(2*r1*d),-1,1));u2=Math.acos(Kclamp((r2*r2+d*d-r1*r1)/(2*r2*d),-1,1));}
 const a=Math.atan2(y2-y1,x2-x1),sp=Math.acos(Kclamp((r1-r2)/d,-1,1)),a1a=a+u1+(sp-u1)*v,a1b=a-u1-(sp-u1)*v,a2a=a+PI-u2-(PI-u2-sp)*v,a2b=a-PI+u2+(PI-u2-sp)*v;
 const pt=(x,y,an,r)=>[x+Math.cos(an)*r,y+Math.sin(an)*r],p1a=pt(x1,y1,a1a,r1),p1b=pt(x1,y1,a1b,r1),p2a=pt(x2,y2,a2a,r2),p2b=pt(x2,y2,a2b,r2);
 const hs=Math.min(v*2.4,Math.hypot(p2a[0]-p1a[0],p2a[1]-p1a[1])/(r1+r2))*Math.min(1,d*2/(r1+r2)),c1=pt(p1a[0],p1a[1],a1a-PI/2,r1*hs),c2=pt(p2a[0],p2a[1],a2a+PI/2,r2*hs),c3=pt(p2b[0],p2b[1],a2b-PI/2,r2*hs),c4=pt(p1b[0],p1b[1],a1b+PI/2,r1*hs);
 // Same winding as the circles, so the whole body fills once as a union.
 const q=[p1a,p2a,p2b,p1b],area=q.reduce((s,p,i)=>{const n=q[(i+1)%4];return s+p[0]*n[1]-n[0]*p[1];},0);
 if(area>=0){c.moveTo(p1a[0],p1a[1]);c.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],p2a[0],p2a[1]);c.lineTo(p2b[0],p2b[1]);c.bezierCurveTo(c3[0],c3[1],c4[0],c4[1],p1b[0],p1b[1]);}
 else{c.moveTo(p1b[0],p1b[1]);c.bezierCurveTo(c4[0],c4[1],c3[0],c3[1],p2b[0],p2b[1]);c.lineTo(p2a[0],p2a[1]);c.bezierCurveTo(c2[0],c2[1],c1[0],c1[1],p1a[0],p1a[1]);}
 c.closePath();}
function Kmeta(c,w,h,ph,o){const pal=META_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46*ph.grow,drift=o.reduced?.35:1,born=o.hitT.filter(t=>ph.t>t).length;
 const blobs=[{x:cx,y:cy,r:R*.26*(1+.05*Math.sin(ph.clock*.8*drift))*(1-.025*born)}];
 for(let k=0;k<6;k++){const u=KeaseInOut((ph.t-o.hitT[k])/(4*o.step));if(u<=0)continue;
  const ang=Krand(k+11,o.seed)*.5+k*K_TAU/6+ph.motion*.09,ro=R*(.56+.16*Math.sin(ph.clock*.45*drift+k*2.1)),rb=R*(.13+.06*Krand(k+5,o.seed))*(.35+.65*u);
  blobs.push({x:cx+Math.cos(ang)*ro*u,y:cy+Math.sin(ang)*ro*u,r:rb});}
 c.save();c.globalCompositeOperation=KL(o);
 for(const b of blobs)Kglow(c,b.x,b.y,b.r*2.4,Kramp(pal,Math.hypot(b.x-cx,b.y-cy)/R*1.4),.16);
 c.beginPath();for(const b of blobs){c.moveTo(b.x+b.r,b.y);c.arc(b.x,b.y,b.r,0,K_TAU);}
 for(let i=1;i<blobs.length;i++){Kneck(c,blobs[0],blobs[i]);const j=i===6&&blobs.length===7?1:i+1;if(j<blobs.length)Kneck(c,blobs[i],blobs[j]);}
 const g=c.createRadialGradient(cx,cy,0,cx,cy,R*.78);g.addColorStop(0,Krgba(pal[0],.92));g.addColorStop(.5,Krgba(pal[1],.88));g.addColorStop(1,Krgba(pal[2],.85));c.fillStyle=g;c.fill('nonzero');
 for(const b of blobs)Kglow(c,b.x-b.r*.3,b.y-b.r*.35,b.r*.75,'#ffffff',o.lit?.22:.12);
 c.restore();}

// 6 · Rosa matemàtica: three nested rose curves r = cos(kθ) with 3, 5 and 7 petals, traced one petal per visual event.
const ROSE_LAYERS=[{k:3,size:1,spin:.05,first:0},{k:5,size:.8,spin:-.04,first:3},{k:7,size:.6,spin:.03,first:8}];
const ROSE_PALETTES=[['#ff6f61','#ffd34d','#ff4f9a'],['#ffb13d','#ff5f7a','#ffe36b'],['#ff4f7b','#ffc94a','#ff8a5c']];
function Krose(c,w,h,ph,o){const pal=ROSE_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.45*ph.grow,width=Math.max(1,S*.0032),breath=1+(o.reduced?.01:.03)*Math.sin(ph.clock*K_TAU/5);
 Kglow(c,cx,cy,R*.25,pal[1],.25*Ksmooth(ph.t/.4));
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineJoin='round';
 ROSE_LAYERS.forEach((L,li)=>{const col=pal[li],rot=ph.motion*L.spin+o.seed*.5+li*.3,Rr=R*L.size*breath,half=Math.PI/(2*L.k),N=40;
  for(let q=0;q<L.k;q++){const t0=o.hitT[L.first+q],p=Ksmooth((ph.t-t0)/(o.step*1.15));if(!(p>0))continue;
   // Petals in star order (every other petal), so the flower fills evenly.
   const centre=rot+(q*((L.k+1)/2))%L.k*K_TAU/L.k,pts=[],M=Math.ceil(N*p);
   for(let i=0;i<=M;i++){const th=-half+Math.min(i/N,p)*2*half,r=Rr*Math.cos(L.k*th);pts.push([cx+Math.cos(centre+th)*r,cy+Math.sin(centre+th)*r]);}
   if(p>=1){const fill=Ksmooth((ph.t-t0-o.step*1.15)/.6);if(fill>0){Kpath(c,pts,true);const g=c.createRadialGradient(cx,cy,0,cx,cy,Rr);g.addColorStop(0,Krgba(col,.04));g.addColorStop(1,Krgba(col,.2*fill));c.fillStyle=g;c.fill();}}
   Kneon(c,o,pts,col,width,.9);if(p<1){const hp=pts[pts.length-1];Kglow(c,hp[0],hp[1],S*.03,Kmix(col,'#ffffff',.4),.8);}}});
 c.restore();}

// 7 · Constel·lació de fils: times table on a circle; point i joins point i·k. Steps of one keep each morph gentle.
const THREAD_PALETTES=[['#8a5cff','#c86bff','#ff7ad9','#ffb84d','#ffe07a'],['#3ad6ff','#7b8cff','#c86bff','#ff7ad9','#ffd06a'],['#ffb84d','#ff6f91','#c86bff','#6f8bff','#5ff0ff']];
const THREAD_STEPS=[[2,3,4,5],[3,4,5,6],[4,5,6,7]],THREAD_HITS=[3,7,11];
// The figure arrives at a whole multiplier exactly at each visual event (3/12, 7/12 and 11/12 of the evolution): cardioid, nephroid, 3 and 4 cusps.
export function threadMultiplier(e,seed=0){const ks=THREAD_STEPS[seed%3];if(e>=1)return ks[3];const seg=Kclamp(e)*3,i=Math.min(2,Math.floor(seg)),f=seg-i;return ks[i]+(ks[i+1]-ks[i])*Ksmooth((f-.05)/.7);}
function Kthreads(c,w,h,ph,o){const pal=THREAD_PALETTES[o.seed%3],cx=w/2,cy=h/2,R=Math.min(w,h)*.42*ph.grow,N=200,k=threadMultiplier(ph.evolve,o.seed),turn=ph.motion*KALEIDO_SPEEDS.threadsTurn-Math.PI/2,buckets=10,width=Math.max(1,R*.0042);
 if(o.lit){const g=c.createRadialGradient(cx,cy,0,cx,cy,R*1.1);g.addColorStop(0,Krgba(pal[2],.1));g.addColorStop(1,Krgba(pal[0],0));c.fillStyle=g;c.fillRect(cx-R*1.1,cy-R*1.1,R*2.2,R*2.2);}
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineWidth=width;
 for(let b=0;b<buckets;b++){c.beginPath();for(let i=b;i<N;i+=buckets){const a1=turn+i*K_TAU/N,a2=turn+i*k*K_TAU/N,reveal=KeaseOut((ph.t-i/N*.55)/.7);if(reveal<=0)continue;const x1=cx+Math.cos(a1)*R,y1=cy+Math.sin(a1)*R,x2=cx+Math.cos(a2)*R,y2=cy+Math.sin(a2)*R;c.moveTo(x1,y1);c.lineTo(x1+(x2-x1)*reveal,y1+(y2-y1)*reveal);}
  c.strokeStyle=Krgba(o.tone(Kramp(pal,b/(buckets-1))),o.lit?.46:.42);c.stroke();}
 c.restore();
 for(let i=0;i<N;i+=2){const a=turn+i*K_TAU/N,show=Ksmooth((ph.t-i/N*.55)/.25);if(show<=0)continue;c.fillStyle=Krgba(o.tone(Kramp(pal,i/N)),.85*show);c.beginPath();c.arc(cx+Math.cos(a)*R,cy+Math.sin(a)*R,i%20?width*1.1:width*2.4,0,K_TAU);c.fill();}
}

// 8 · Corrent d'aurora: ribbons of light on closed-form orbits around the centre. Every point of every ribbon is a smooth function of
// time (angle, wobble and trail length), with a fixed number of segments, so nothing can jump from one frame to the next.
const AURORA_PALETTES=[['#33f5a6','#21d4e8','#5a7dff','#b36bff','#ff6ad5'],['#7cff6b','#33f5a6','#1fd1ff','#6f7bff','#c86bff'],['#ff6ad5','#b36bff','#5a7dff','#21d4e8','#33f5a6']];
// Angular speed of a ribbon at base radius r0 (0.1 to 0.4 of the short side): inner ribbons turn faster, like a gentle vortex.
export const auroraOmega=r0=>KALEIDO_SPEEDS.auroraTurn*(1.7-(r0-.1)/.3);
export function auroraRibbon(j,ph,o,swell){const u=Krand(j+500,o.seed),r0=.1+.3*Math.sqrt(u),omega=auroraOmega(r0),tau=ph.clock*(o.reduced?.12:.32)+o.seed*3.1,amp=.75+.8*swell,head=Krand(j,o.seed)*K_TAU+omega*ph.motion,trail=omega*6*(.1+.9*KeaseOut(ph.t/1.4))+.04,own=Krand(j+40,o.seed)*K_TAU,spiral=(Krand(j+60,o.seed)-.5)*.3,pts=[];
 for(let i=0;i<=26;i++){const back=1-i/26,th=head-trail*back,r=r0*(1+amp*(.1*Math.sin(2*th+5*r0+.9*tau)+.07*Math.sin(3*th-7*r0-1.3*tau+1.7)+.04*Math.sin(5*th+11*r0+.5*tau+4.1))+.06*Math.sin(th+own)+spiral*back)*(1+.05*swell);pts.push([Math.cos(th)*r,Math.sin(th)*r]);}
 return {r0,pts};}
function Kaurora(c,w,h,ph,o){const pal=AURORA_PALETTES[o.seed%3],cx=w/2,cy=h/2,S=Math.min(w,h),scale=S*ph.grow,shift=ph.evolve*1.2,swell=o.hitE.reduce((m,e)=>Math.max(m,Kbump(ph.evolve,e,.09)),0);
 if(o.lit){const g=c.createRadialGradient(cx,cy,0,cx,cy,S*.55);g.addColorStop(0,Krgba(pal[1],.06+.04*swell));g.addColorStop(1,Krgba(pal[2],0));c.fillStyle=g;c.fillRect(0,0,w,h);}
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineJoin='round';
 for(let j=0;j<160;j++){const {r0,pts}=auroraRibbon(j,ph,o,swell),edge=1-Ksmooth((r0-.33)/.08);if(edge<=0)continue;
  const band=((r0*2.2+Krand(j+900,o.seed)*.18+shift)%1+1)%1,color=o.tone(Kramp(pal,Math.abs(band*2-1))),X=p=>cx+p[0]*scale,Y=p=>cy+p[1]*scale,p0=pts[0],p1=pts[pts.length-1];
  const g=c.createLinearGradient(X(p0),Y(p0),X(p1),Y(p1));g.addColorStop(0,Krgba(color,0));g.addColorStop(.6,Krgba(color,(o.lit?.32:.26)*edge));g.addColorStop(1,Krgba(color,(o.lit?.62:.5)*edge*(.8+.2*swell)));
  c.strokeStyle=g;c.lineWidth=S*(.0024+.0056*Krand(j+70,o.seed));c.beginPath();c.moveTo(X(p0),Y(p0));for(let i=1;i<pts.length;i++)c.lineTo(X(pts[i]),Y(pts[i]));c.stroke();
  c.fillStyle=Krgba(Kmix(color,'#ffffff',o.lit?.4:0),.6*edge);c.beginPath();c.arc(X(p1),Y(p1),c.lineWidth*.7,0,K_TAU);c.fill();}
 c.restore();}

// 9 · Espiròraf: three hypotrochoids with fivefold symmetry, each drawn by five pens at once; the layers enter one after another, like a canon.
const SPIRO_LAYERS=[{R:10,r:3,d:5,size:1,spin:.05},{R:10,r:7,d:4.5,size:.8,spin:-.06},{R:5,r:3,d:2.5,size:.55,spin:.04}];
const SPIRO_PALETTES=[['#22e3d3','#9b6bff','#ffc94a'],['#ffc94a','#22e3d3','#c46bff'],['#8a6bff','#ffcf5c','#2fe6c8']];
function Kspiro(c,w,h,ph,o){const pal=SPIRO_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.45*ph.grow,width=Math.max(1,S*.0028);
 Kglow(c,cx,cy,R*.3,pal[0],.18*Ksmooth(ph.t/.4));
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineJoin='round';
 SPIRO_LAYERS.forEach((L,li)=>{const f=KeaseInOut((ph.t-o.hitT[li]+(li===0?.4:0))/(4*o.step));if(f<=0)return;const col=pal[li],rot=ph.motion*L.spin+o.seed*.6+li,P=K_TAU*L.r,k=(L.R-L.r)/L.r,norm=R*L.size/(L.R-L.r+L.d),N=Math.ceil(60*L.r);
  const pos=t=>{const x=(L.R-L.r)*Math.cos(t)+L.d*Math.cos(k*t),y=(L.R-L.r)*Math.sin(t)-L.d*Math.sin(k*t);return Krot(cx,cy,x*norm,y*norm,rot);};
  for(let p=0;p<5;p++){const t0=p*P/5,M=Math.max(1,Math.ceil(N*f)),pts=[];for(let i=0;i<=M;i++)pts.push(pos(t0+f*P/5*i/M));Kneon(c,o,pts,col,width,.85);
   if(f<1){const hp=pts[pts.length-1];Kglow(c,hp[0],hp[1],S*.026,Kmix(col,'#ffffff',.5),.85);}}});
 c.restore();}

// 10 · Floc cristal·lí: a hexagonal crystal; the arms grow, side branches sprout pair by pair, then small twigs.
const FLAKE_AT=[.24,.44,.62,.78],FLAKE_LEN=[.36,.3,.22,.14];
const FLAKE_PALETTES=[['#8fd8ff','#b89cff','#fff1d6'],['#a8e6ff','#d0a8ff','#fff6e0'],['#7fc8ff','#c3b0ff','#ffe9cc']];
function Kflake(c,w,h,ph,o){const pal=FLAKE_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46*ph.grow,rot=ph.motion*.04+o.seed*.3,arm=.08+.92*KeaseOut(ph.evolve/.75),C60=.5,S60=Math.sqrt(3)/2;
 const levels=[[],[],[]],tips=[];levels[0].push([0,0,arm,0]);tips.push([arm,0,0]);
 FLAKE_AT.forEach((s,j)=>{const g=KeaseOut((ph.t-o.hitT[j+1])/(1.6*o.step));if(g<=0||arm<s)return;const b=FLAKE_LEN[j]*g;
  for(const side of [1,-1]){const ex=s+b*C60,ey=side*b*S60;levels[1].push([s,0,ex,ey]);tips.push([ex,ey,1]);
   const tw=KeaseOut((ph.t-o.hitT[5])/(2*o.step));if(tw>0){const bx=s+.55*b*C60,by=side*.55*b*S60,l=.38*FLAKE_LEN[j]*tw;levels[2].push([bx,by,bx+l,by],[bx,by,bx-l*C60,by+side*l*S60]);tips.push([bx+l,by,2]);}}});
 const width=[S*.0045,S*.0032,S*.0022],colors=[pal[0],pal[1],pal[2]];
 Kglow(c,cx,cy,R*.35,pal[0],.16);
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';
 levels.forEach((segs,l)=>{if(!segs.length)return;c.beginPath();for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;for(const [x1,y1,x2,y2] of segs){const p=Krot(cx,cy,x1*R,y1*R,a),q=Krot(cx,cy,x2*R,y2*R,a);c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);}}
  for(const [wd,al] of [[4.5,.14],[2,.35],[1,.95]]){c.strokeStyle=Krgba(al>.9&&o.lit?Kmix(colors[l],'#ffffff',.4):colors[l],al);c.lineWidth=width[l]*wd;c.stroke();}});
 for(let k=0;k<6;k++){const a=rot+k*Math.PI/3;tips.forEach(([x,y,l],i)=>{const p=Krot(cx,cy,x*R,y*R,a);Kglow(c,p[0],p[1],S*(.022-.005*l),colors[l],.45+.15*Math.sin(ph.clock*1.7+i+k));});}
 const plate=R*.09,hex=Array.from({length:6},(_,i)=>Krot(cx,cy,plate,0,rot+i*Math.PI/3));Kpath(c,hex,true);const g=c.createRadialGradient(cx,cy,0,cx,cy,plate);g.addColorStop(0,Krgba(pal[2],.9));g.addColorStop(1,Krgba(pal[0],.35));c.fillStyle=g;c.fill();Kneon(c,o,hex,pal[1],width[2],.8,true);
 c.restore();}

// 11 · Galàxia: spiral arms of stars around a warm core; the arms unwind a little and stars light up softly at each visual event.
const GALAXY_PALETTES=[['#fff0d6','#ff9ad5','#c46bff','#6f6bff','#4fb8ff'],['#fff4c2','#ffb36b','#ff5cc8','#9b5cff','#4f7bff'],['#ffe9f5','#ff7ab8','#b06bff','#5a7dff','#38d9ff']];
function KgalaxyAngle(rr,R,arm,arms,twist,rot){return rot+arm*K_TAU/arms+twist*Math.log(1+rr/R*5);}
function Kgalaxy(c,w,h,ph,o){const pal=GALAXY_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.52*ph.grow,arms=2+o.seed%2,rot=ph.motion*.06+o.seed,twist=2.7-.9*Ksmooth(ph.evolve),front=R*(.12+.88*KeaseOut(ph.t/(ph.appear+2.2)));
 c.save();c.globalCompositeOperation=KL(o);
 for(let a=0;a<arms;a++)for(let i=1;i<=12;i++){const rr=R*i/13;if(rr>front)break;const an=KgalaxyAngle(rr,R,a,arms,twist,rot);Kglow(c,cx+Math.cos(an)*rr,cy+Math.sin(an)*rr*.92,R*.16*(1-.45*i/13),Kramp(pal,i/13),.1);}
 const buckets=pal.map(()=>[[],[],[]]);
 for(let i=0;i<1000;i++){const u=Krand(i,o.seed),rr=R*(.04+.96*Math.pow(u,1.05));if(rr>front)continue;
  const an=KgalaxyAngle(rr,R,i%arms,arms,twist,rot)+(Krand(i+3000,o.seed)-.5)*(.35+.9*(1-u)),x=cx+Math.cos(an)*rr,y=cy+Math.sin(an)*rr*.92;
  const ci=Math.min(4,Math.floor(Kclamp(u+(Krand(i+77,o.seed)-.5)*.25)*4.99)),al=(.75+.25*Math.sin(ph.clock*(.6+Krand(i+5,o.seed))+i))*Ksmooth((front-rr)/(R*.08));
  buckets[ci][al>.8?2:al>.55?1:0].push(x,y,S*.0019*(1+2.6*Math.pow(Krand(i+9,o.seed),4)));}
 buckets.forEach((levels,ci)=>levels.forEach((arr,li)=>{if(!arr.length)return;c.fillStyle=Krgba(pal[ci],[.45,.7,.95][li]);c.beginPath();for(let j=0;j<arr.length;j+=3){c.moveTo(arr[j]+arr[j+2],arr[j+1]);c.arc(arr[j],arr[j+1],arr[j+2],0,K_TAU);}c.fill();}));
 o.hitT.forEach((tb,k)=>{const tau=ph.t-tb;if(tau<0)return;const nv=KeaseOut(tau/.35)*(.35+.65*(1-Ksmooth((tau-.35)/1.8))),rr=R*(.22+.1*k),an=KgalaxyAngle(rr,R,k%arms,arms,twist,rot)+.08,x=cx+Math.cos(an)*rr,y=cy+Math.sin(an)*rr*.92,col=pal[(k%3)+1],len=S*.05*nv;
  Kglow(c,x,y,S*.06*nv,col,.7);c.strokeStyle=Krgba(Kmix(col,'#ffffff',.5),.55*nv);c.lineWidth=Math.max(1,S*.0018);c.beginPath();c.moveTo(x-len,y);c.lineTo(x+len,y);c.moveTo(x,y-len);c.lineTo(x,y+len);c.stroke();});
 Kglow(c,cx,cy,R*.3,pal[1],.55*(.85+.15*Math.sin(ph.clock*.9)));Kglow(c,cx,cy,R*.08,'#ffffff',o.lit?.8:.4);
 c.restore();}

// 12 · Mosaic d'abella: hexagonal cells light up ring by ring from the centre, fade to a glow, and a second wave turns them green.
const HIVE_PALETTES=[[['#ffe14d','#ff9a2e','#ffc23f'],['#4dff9a','#d4ff4a','#8cff5d']],[['#ffd23f','#ff7a3d','#fff06b'],['#3fffb0','#c4ff4a','#6bff6b']],[['#fff06b','#ffb03a','#ff8a3d'],['#7bff7b','#e8ff4a','#4fffc0']]];
function Khex(c,x,y,r,a){c.beginPath();for(let i=0;i<6;i++){const an=a+Math.PI/6+i*Math.PI/3,px=x+Math.cos(an)*r,py=y+Math.sin(an)*r;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();}
function Khive(c,w,h,ph,o){const [warm,green]=HIVE_PALETTES[o.seed%3].map(p=>p.map(o.tone)),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.47*ph.grow,s=R/(5*Math.sqrt(3)+1),rot=ph.motion*.03+o.seed*.2;
 c.save();c.globalCompositeOperation=KL(o);c.lineJoin='round';
 for(let q=-5;q<=5;q++)for(let r=Math.max(-5,-q-5);r<=Math.min(5,-q+5);r++){const ring=(Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2,lx=s*Math.sqrt(3)*(q+r/2),ly=s*1.5*r,[x,y]=Krot(cx,cy,lx,ly,rot);
  const t1=ph.t-o.hitT[ring],t2=ph.t-o.hitT[ring+6],l1=t1>=0?KeaseOut(t1/.3)*(1-.3*Ksmooth((t1-.35)/1.3)):0,l2=t2>=0?KeaseOut(t2/.3)*(1-.15*Ksmooth((t2-.35)/1.3)):0;
  let b=Math.max(l1,l2,ring===0?.6*Ksmooth(ph.t/.3):0);if(b<=0)continue;b*=1+.08*Math.sin(ph.clock*1.1-ring*.9);
  const an=Math.atan2(ly,lx),base=Kramp(warm,ring/5*.6+.4*(.5+.5*Math.sin(an*3+o.seed))),col=t2>0?Kmix(base,Kramp(green,(.5+.5*Math.sin(an*2+ring))),.65*Ksmooth(t2/.6)*(ring%2?1:.6)):base,light=Kmix(col,'#ffffff',.35);
  Khex(c,x,y,s*.9,rot);c.fillStyle=Krgba(col,.68*b);c.fill();c.strokeStyle=Krgba(light,.75*b);c.lineWidth=Math.max(1,S*.002);c.stroke();
  Khex(c,x,y,s*.52,rot);c.fillStyle=Krgba(light,.32*b);c.fill();}
 c.restore();}

// 13 · Cinta infinita: three figure-of-eight ribbons twisted like a Möbius band; the twist rolls slowly along each ribbon.
const RIBBON_PALETTES=[[['#ff4f9a','#3b5bff'],['#ff7ac8','#2fa8ff'],['#ff5f6d','#6a4bff']],[['#3b5bff','#ff4f9a'],['#2fd0ff','#ff6fb0'],['#7b5cff','#ff8a6b']],[['#ff6fb5','#2f7bff'],['#ffb06b','#5a4bff'],['#ff4f7b','#22c8ff']]];
function Kribbon(c,w,h,ph,o){const sets=RIBBON_PALETTES[o.seed%3],cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46*ph.grow;
 c.save();c.lineJoin='round';
 for(let k=0;k<3;k++){const g=KeaseInOut((ph.t-o.hitT[k]+(k===0?.45:0))/(3*o.step));if(g<=0)continue;
  const [front,back]=sets[k].map(o.tone),orient=k*Math.PI/3+ph.motion*.04+o.seed*.4,scale=R*(1-.1*k)*1.08,W=S*.058*(1-.1*k),start=o.seed*1.3+k*2,len=K_TAU*g,N=Math.max(2,Math.ceil(150*g)),roll=ph.clock*(o.reduced?.25:.7)+k,P=[];
  for(let i=0;i<=N;i++){const s=start+len*i/N,den=1+Math.sin(s)**2,[x,y]=Krot(cx,cy,Math.cos(s)/den*scale,Math.sin(s)*Math.cos(s)/den*scale,orient),phi=1.5*s+roll,taper=g<1?Ksmooth(i/N*len/.5)*Ksmooth((1-i/N)*len/.5):1;P.push({x,y,hw:W/2*Math.cos(phi)*taper,phi});}
  P.forEach((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(N,i+1)],tx=b.x-a.x,ty=b.y-a.y,l=Math.hypot(tx,ty)||1;p.nx=-ty/l;p.ny=tx/l;p.tx=tx/l;p.ty=ty/l;});
  c.globalCompositeOperation='source-over';
  for(let i=0;i<N;i++){const p=P[i],q=P[i+1],cphi=Math.cos((p.phi+q.phi)/2),light=.4+.6*Math.abs(cphi),col=cphi>=0?front:back,ov=.8;
   c.beginPath();c.moveTo(p.x+p.nx*p.hw,p.y+p.ny*p.hw);c.lineTo(q.x+q.nx*q.hw+q.tx*ov,q.y+q.ny*q.hw+q.ty*ov);c.lineTo(q.x-q.nx*q.hw+q.tx*ov,q.y-q.ny*q.hw+q.ty*ov);c.lineTo(p.x-p.nx*p.hw,p.y-p.ny*p.hw);c.closePath();
   c.fillStyle=Krgba(Kmix(col,o.lit?'#ffffff':col,.22*light*light),.4+.5*light);c.fill();}
  c.globalCompositeOperation=KL(o);
  for(const side of [1,-1])Kneon(c,o,P.map(p=>[p.x+side*p.nx*p.hw,p.y+side*p.ny*p.hw]),Kmix(front,back,.5),Math.max(1,S*.0018),.5,g>=1);}
 c.restore();}

// 14 · Flor de cercles: circles appear one by one (centre, six, six more) and interlace into a flower; their overlaps glow.
const CIRCLE_PALETTES=[['#25e6d0','#ff7b6b','#ffd36b'],['#ff7b6b','#25d6e6','#ffe08a'],['#3df0c0','#ff6f91','#ffc46b']];
function Kcircles(c,w,h,ph,o){const pal=CIRCLE_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46*ph.grow*(1+(o.reduced?.004:.015)*Math.sin(ph.clock*K_TAU/5)),r=R/(1+Math.sqrt(3)),rot=ph.motion*.035+o.seed*.5,width=Math.max(1,S*.003);
 const centres=[[0,0]];for(let k=0;k<6;k++)centres.push([Math.cos(k*Math.PI/3)*r,Math.sin(k*Math.PI/3)*r]);for(let k=0;k<6;k++)centres.push([Math.cos(k*Math.PI/3+Math.PI/6)*r*Math.sqrt(3),Math.sin(k*Math.PI/3+Math.PI/6)*r*Math.sqrt(3)]);
 const circles=centres.map(([x,y],i)=>({x,y,r,i,col:pal[i===0?2:i<7?0:1]}));circles.push({x:0,y:0,r:R,i:13,col:pal[2]});
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';
 for(const C of circles){const dur=(C.i===13?2:1.6)*o.step,t0=o.hitT[C.i]-(C.i===0?.4:0),p=KeaseInOut((ph.t-t0)/dur);if(p<=0)continue;
  const [x,y]=Krot(cx,cy,C.x,C.y,rot),start=C.i===0||C.i===13?rot-Math.PI/2:Math.atan2(cy-y,cx-x);
  if(p>=1&&C.i<13){const f=Ksmooth((ph.t-t0-dur)/.5);if(f>0){c.fillStyle=Krgba(C.col,.08*f);c.beginPath();c.arc(x,y,C.r,0,K_TAU);c.fill();}}
  const pts=[],M=Math.ceil(90*p);for(let j=0;j<=M;j++){const a=start+Math.min(j/90,p)*K_TAU;pts.push([x+Math.cos(a)*C.r,y+Math.sin(a)*C.r]);}
  Kneon(c,o,pts,C.col,width,.85);if(p<1){const hp=pts[pts.length-1];Kglow(c,hp[0],hp[1],S*.028,Kmix(C.col,'#ffffff',.45),.85);}}
 c.restore();}

// 15 · Ones que es troben: two sources take turns sending a soft ring of colour; where rings cross, a warm light marks the meeting point.
// Low spatial frequency on purpose: wide soft bands, at most five rings per source.
const WAVE_PALETTES=[['#2fe6ff','#ff3fc8','#ffe14d'],['#ff3fc8','#2fd0ff','#fff06b'],['#3dffd8','#ff4f9a','#ffd23f']];
export function waveRings(ph,o,R){const speed=(o.reduced?.5:1)*.3*R,out=[];o.hitT.forEach((tb,k)=>{if(ph.t<tb)return;const rr=R*.03+speed*(ph.clock-o.hitC[k]),a=Ksmooth((ph.t-tb)/.35)*(1-Ksmooth((rr-R*.85)/(R*.55)));if(a>.005)out.push({source:k%2,rr,a});});return out;}
function Kwaves(c,w,h,ph,o){const pal=WAVE_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.5*ph.grow,ang=ph.motion*.05+o.seed*.8,d=R*.3,src=[[cx-Math.cos(ang)*d,cy-Math.sin(ang)*d],[cx+Math.cos(ang)*d,cy+Math.sin(ang)*d]],rings=waveRings(ph,o,R);
 c.save();c.globalCompositeOperation=KL(o);
 src.forEach(([x,y],s)=>{let pulse=0;o.hitT.forEach((tb,k)=>{if(k%2===s&&ph.t>=tb)pulse=Math.max(pulse,Math.exp(-(ph.t-tb)/.6));});Kglow(c,x,y,R*.16,pal[s],(.3+.35*pulse)*Ksmooth(ph.t/.3));});
 for(const g of rings){const [x,y]=src[g.source];Kring(c,x,y,g.rr,R*.075,pal[g.source],.5*g.a);}
 const D=2*d;for(const A of rings)if(A.source===0)for(const B of rings)if(B.source===1){if(D>=A.rr+B.rr||D<=Math.abs(A.rr-B.rr))continue;const a=(A.rr*A.rr-B.rr*B.rr+D*D)/(2*D),hh=Math.sqrt(Math.max(0,A.rr*A.rr-a*a)),ux=(src[1][0]-src[0][0])/D,uy=(src[1][1]-src[0][1])/D,mx=src[0][0]+ux*a,my=src[0][1]+uy*a;
  for(const sg of [1,-1])Kglow(c,mx-uy*hh*sg,my+ux*hh*sg,R*.07,pal[2],.75*Math.min(A.a,B.a));}
 Kglow(c,cx,cy,R*.22,pal[2],.18*Ksmooth((ph.t-ph.settleAt+1)/1.2));
 c.restore();}

// 16 · Arbre de llum: a branching tree of light grows level by level and blossoms in two waves (pink, then gold). No face, no figure.
const TREE_PALETTES=[['#1fbf8f','#8dff9a','#ff6fb5','#ffd24a'],['#22c7a0','#b4ff7a','#ff7ac8','#ffe066'],['#1aa7c4','#7dffb0','#ff5f9e','#ffc94a']];
function Ktree(c,w,h,ph,o){const pal=TREE_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),segs=[[],[],[],[],[],[],[]],tips=[],sway=o.reduced?.3:1;
 const branch=(x,y,a,len,d,idx)=>{const g=KeaseOut((ph.t-o.hitT[d]+(d===0?.45:0))/(1.5*o.step));if(g<=0)return;const an=a+sway*.05*Math.sin(ph.clock*.55+d*.8+idx*.37)*d/6,x2=x+Math.cos(an)*len*g,y2=y+Math.sin(an)*len*g;segs[d].push(x,y,x2,y2);
  if(d===6){tips.push([x2,y2,idx]);return;}const spread=.44+.18*(Krand(idx,o.seed)-.5),skew=(Krand(idx+500,o.seed)-.5)*.22,ratio=.8*(.92+.16*Krand(idx+900,o.seed));
  branch(x2,y2,an-spread+skew,len*ratio,d+1,idx*2+1);branch(x2,y2,an+spread+skew,len*ratio,d+1,idx*2+2);};
 const scale=o.reduced?1:.85+.15*ph.grow;branch(cx,cy+S*.46,-Math.PI/2+(Krand(1,o.seed)-.5)*.1,S*.2*scale,0,0);
 Kglow(c,cx,cy+S*.46,S*.12,pal[0],.25*Ksmooth(ph.t/.3));
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';
 segs.forEach((arr,d)=>{if(!arr.length)return;c.beginPath();for(let i=0;i<arr.length;i+=4){c.moveTo(arr[i],arr[i+1]);c.lineTo(arr[i+2],arr[i+3]);}const col=Kramp([pal[0],pal[1]],d/6),wd=S*.011*Math.pow(.72,d);
  for(const [k,al] of [[3.5,.12],[1.8,.3],[1,.95]]){c.strokeStyle=Krgba(al>.9&&o.lit?Kmix(col,'#ffffff',.25):col,al);c.lineWidth=Math.max(.8,wd*k);c.stroke();}});
 tips.forEach(([x,y,idx])=>{const wave=idx%2?8:7,tau=ph.t-o.hitT[wave]-Krand(idx+40,o.seed)*.35,s=KeaseBack(tau/.45);if(s<=0)return;const col=pal[wave===7?2:3],r=S*.011*(.7+.6*Krand(idx+60,o.seed))*s*(.92+.08*Math.sin(ph.clock*1.4+idx));
  Kglow(c,x,y,r*3.2,col,.3);c.fillStyle=Krgba(o.lit?Kmix(col,'#ffffff',.2):col,.92);c.beginPath();c.arc(x,y,r,0,K_TAU);c.fill();});
 c.restore();}

// 17 · Túnel suau: soft polygons are born at the centre and drift outwards, each turning gently; never more than five at once
// (with reduced motion they stay in place, and the oldest fades before a sixth appears).
const TUNNEL_PALETTES=[['#8a5cff','#22e3d3','#c46bff','#2fb8ff'],['#22e3d3','#9b6bff','#3fd0ff','#d06bff'],['#b06bff','#2fe6c8','#7b8cff','#5ff0ff']];
export function tunnelRings(ph,o,R){const out=[];o.hitT.forEach((tb,k)=>{if(ph.t<tb-.4*(k===0))return;const fade=Ksmooth((ph.t-tb+(k===0?.4:0))/.45),s=o.reduced?R*(1.05-.16*k):R*.06*Math.exp(.95*Math.max(0,ph.clock-o.hitC[k])),newer=o.hitT[k+5],a=fade*(1-Ksmooth((s-R*.95)/(R*.35)))*(newer===undefined?1:1-Ksmooth((ph.t-newer+.5)/.45));if(a>.003)out.push({k,s,a});});return out;}
function Ktunnel(c,w,h,ph,o){const pal=TUNNEL_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.5,sides=[6,5,8][o.seed%3];
 c.save();c.globalCompositeOperation=KL(o);c.lineJoin='round';
 Kglow(c,cx,cy,R*.28,pal[1],.3*Ksmooth(ph.t/.3));
 for(const {k,s,a} of tunnelRings(ph,o,R)){const rot=(k%2?-1:1)*ph.motion*.08+k*.21+o.seed,pts=Array.from({length:sides},(_,i)=>Krot(cx,cy,s,0,rot+i*K_TAU/sides)),col=Kloop(pal,k*.23+ph.clock*.02);
  Kpath(c,pts,true);const g=c.createRadialGradient(cx,cy,s*.3,cx,cy,s);g.addColorStop(0,Krgba(col,0));g.addColorStop(1,Krgba(col,.3*a));c.fillStyle=g;c.fill();
  for(const [wd,al] of [[.12,.12],[.05,.25],[.02,.5]]){c.strokeStyle=Krgba(col,al*a);c.lineWidth=S*.002+s*wd;c.stroke();}c.strokeStyle=Krgba(o.lit?Kmix(col,'#ffffff',.35):col,.85*a);c.lineWidth=S*.002+s*.008;c.stroke();}
 c.restore();}

// 18 · Pluja de confeti radial: bursts of confetti fly out from the centre, slow down and settle into rings that turn slowly.
const CONFETTI=['#ff4f7b','#ffb13d','#ffe14d','#4dff9a','#38d9ff','#7b6bff','#ff6bf0'],CONFETTI_RINGS=[.62,.82,.44,.98];
function Kconfetti(c,w,h,ph,o){const cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.46,size=S*.011;
 c.save();c.globalCompositeOperation=KL(o);
 for(let b=0;b<4;b++){const tau=ph.t-o.hitT[b]+(b===0?.45:0);if(tau<0)continue;const rf=R*CONFETTI_RINGS[(b+o.seed)%4],turn=(b%2?-1:1)*ph.motion*.05,out=1-Math.exp(-tau/.32);
  Kglow(c,cx,cy,R*.2,o.tone(CONFETTI[(b*2+o.seed)%7]),.45*Math.exp(-tau/.5));
  for(let i=0;i<64;i++){const id=b*64+i,a0=(i+Krand(id,o.seed)*.8)*K_TAU/64+turn,rr=rf*(.94+.12*Krand(id+300,o.seed))*out+(o.reduced?.003:.01)*R*Math.sin(ph.clock*1.3+id)*out,x=cx+Math.cos(a0)*rr,y=cy+Math.sin(a0)*rr;
   const flip=Krand(id+600,o.seed)*K_TAU+6.1*.32*out+ph.clock*(.5+.6*Krand(id+700,o.seed)),sx=size*(.6+.6*Krand(id+800,o.seed))*Math.abs(Math.cos(flip))+size*.12,sy=size*.5,head=a0+Krand(id+900,o.seed)*K_TAU,cs=Math.cos(head),sn=Math.sin(head),col=o.tone(CONFETTI[(id+o.seed)%7]);
   c.fillStyle=Krgba(col,.95);c.beginPath();c.moveTo(x+cs*sx-sn*sy,y+sn*sx+cs*sy);c.lineTo(x-cs*sx-sn*sy,y-sn*sx+cs*sy);c.lineTo(x-cs*sx+sn*sy,y-sn*sx-cs*sy);c.lineTo(x+cs*sx+sn*sy,y+sn*sx-cs*sy);c.closePath();c.fill();
   if(o.lit){c.fillStyle=Krgba(col,.13);c.beginPath();c.arc(x,y,size*1.8,0,K_TAU);c.fill();}}}
 c.restore();}

// 19 · Medusa de seda: an abstract radial form of silk that contracts softly at each visual event while its filaments wave outwards.
const SILK_PALETTES=[['#ff6fb5','#c49bff','#5ff0ff'],['#ff8ad0','#a98bff','#4fe0ff'],['#ff5fa0','#d0a0ff','#6ff7e8']];
const Kpulse=tau=>tau<0?0:tau<.4?Ksmooth(tau/.4):1-Ksmooth((tau-.4)/1.5);
function Ksilk(c,w,h,ph,o){const pal=SILK_PALETTES[o.seed%3].map(o.tone),cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.47*ph.grow,rot=ph.motion*.03+o.seed,soft=o.reduced?.5:1,pulse=t=>soft*o.hitT.reduce((m,tb)=>Math.max(m,Kpulse(t-tb)),0),now=pulse(ph.t),rb=R*.3*(1-.14*now);
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';c.lineJoin='round';
 for(let i=0;i<44;i++){const th=rot+i*K_TAU/44+(Krand(i,o.seed)-.5)*.05,len=R*(.5+.2*Krand(i+40,o.seed)),ph0=Krand(i+80,o.seed)*K_TAU,pts=[];
  for(let j=0;j<=22;j++){const s=j/22,late=pulse(ph.t-s*.6),rr=rb*1.02+s*len*(1+.08*late),amp=R*.045*Math.pow(s,1.3)*(1+.9*late),a=th+amp*Math.sin(5.5*s-ph.clock*(o.reduced?.6:1.5)+ph0)/Math.max(rr,1);pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr]);}
  const g=c.createLinearGradient(pts[0][0],pts[0][1],pts[22][0],pts[22][1]);g.addColorStop(0,Krgba(pal[0],.85));g.addColorStop(.55,Krgba(pal[1],.65));g.addColorStop(1,Krgba(pal[2],0));
  Kpath(c,pts);c.strokeStyle=g;c.lineWidth=Math.max(1,S*.005*(1-.3*Krand(i+120,o.seed)));c.stroke();c.fillStyle=Krgba(pal[2],.5);c.beginPath();c.arc(pts[16][0],pts[16][1],S*.003,0,K_TAU);c.fill();}
 const bell=[];for(let i=0;i<=96;i++){const a=i/96*K_TAU,r=rb*(1+.07*Math.cos(12*a+ph.clock*.5));bell.push([cx+Math.cos(a+rot)*r,cy+Math.sin(a+rot)*r]);}
 Kpath(c,bell,true);const g=c.createRadialGradient(cx,cy,0,cx,cy,rb*1.1);g.addColorStop(0,Krgba(Kmix(pal[0],'#ffffff',.4),.7));g.addColorStop(.5,Krgba(pal[1],.45));g.addColorStop(1,Krgba(pal[0],.18));c.fillStyle=g;c.fill();
 Kneon(c,o,bell,pal[0],Math.max(1,S*.003),.7,true);
 for(let k=0;k<4;k++){const a=rot*2+k*K_TAU/4;Kglow(c,cx+Math.cos(a)*rb*.42,cy+Math.sin(a)*rb*.42,rb*.42,pal[2],.25+.2*now);}
 c.restore();}

// 20 · Supernova tranquil·la: three gentle bursts leave shells of every colour of the series around a warm, steady light.
const NOVA_COLORS=['#ff4f7b','#ff9d3d','#ffe14d','#6dff8a','#35e0ff','#6a7dff','#c46bff','#ff6bd5'],NOVA_SHELLS=[.42,.66,.9];
function Knova(c,w,h,ph,o){const cx=w/2,cy=h/2,S=Math.min(w,h),R=S*.47*(o.reduced?ph.grow:1);let boost=0;
 o.hitT.forEach(tb=>{const tau=ph.t-tb;if(tau>=0)boost=Math.max(boost,KeaseOut(tau/.3)*Math.exp(-tau/.9));});
 c.save();c.globalCompositeOperation=KL(o);c.lineCap='round';
 Kglow(c,cx,cy,R*.42,o.tone('#ff9d6b'),.3*(.5+.35*boost)*Ksmooth(ph.t/.3));
 NOVA_SHELLS.forEach((frac,k)=>{const tau=ph.t-o.hitT[k]+(k===0?.4:0);if(tau<0)return;const Rk=R*frac*(1-Math.exp(-tau/.5)),turn=(k%2?-1:1)*ph.motion*.04+k*.2+o.seed*.3,stretch=1+2.2*Math.exp(-tau/.45),rays=112;
  Kring(c,cx,cy,Rk,R*.07,o.tone(Kloop(NOVA_COLORS,k*.33+o.seed*.1)),.16*Ksmooth(tau/.3));
  for(let bkt=0;bkt<16;bkt++){c.beginPath();for(let i=bkt*7;i<bkt*7+7;i++){const a=turn+i*K_TAU/rays+(Krand(i+k*200,o.seed)-.5)*.05,len=R*(.025+.05*Krand(i+k*200+50,o.seed))*stretch,r0=Rk*(.96+.06*Krand(i+k*200+90,o.seed));c.moveTo(cx+Math.cos(a)*Math.max(0,r0-len),cy+Math.sin(a)*Math.max(0,r0-len));c.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);}
   c.strokeStyle=Krgba(o.tone(Kloop(NOVA_COLORS,(bkt+.5)/16+k*.33+o.seed*.1)),.8*Ksmooth(tau/.2));c.lineWidth=Math.max(1,S*.004);c.stroke();}});
 for(let i=0;i<70;i++){const phase=((ph.clock*.07+Krand(i,o.seed))%1+1)%1,r=R*(.12+.85*phase),a=Krand(i+10,o.seed)*K_TAU+ph.motion*.03,al=Math.sin(Math.PI*phase)*.5*Ksmooth((ph.t-ph.appear)/1);if(al<=.01)continue;c.fillStyle=Krgba(o.tone(Kloop(NOVA_COLORS,i/70)),al);c.beginPath();c.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,S*.0025,0,K_TAU);c.fill();}
 Kglow(c,cx,cy,R*.14,o.tone('#fff4d6'),(o.lit?.9:.5)*(.55+.35*boost)*Ksmooth(ph.t/.2));
 c.restore();}

// steps: grid steps across the evolution; hits: the steps of the visual events; turn: fastest global rotation (rad/s), for the ceiling test.
const Kspan=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
export const KALEIDO_ART=Object.freeze([
 {draw:Kmandala,steps:12,hits:MANDALA_HITS,turn:KALEIDO_SPEEDS.mandalaRing+7*KALEIDO_SPEEDS.mandalaRingStep,accent:MANDALA_PALETTES.map(p=>p[3])},
 {draw:Ksunflower,steps:16,hits:[0,2,4,6,8,10,12,14],turn:.06+SUN_N*.0012*.22,accent:SUN_PALETTES.map(p=>p[2])},
 {draw:Kglass,steps:12,hits:[0,2,4,6,8,10],turn:.07,accent:GLASS_PALETTES.map(p=>p[1])},
 {draw:Klissajous,steps:12,hits:[0,4,8],turn:.12,accent:LISSA_PALETTES.map(p=>p[0])},
 {draw:Kmeta,steps:12,hits:[0,2,4,6,8,10],turn:.09,accent:META_PALETTES.map(p=>p[1])},
 {draw:Krose,steps:16,hits:[0,1,2,...Kspan(4,15)],turn:.05,accent:ROSE_PALETTES.map(p=>p[1])},
 {draw:Kthreads,steps:12,hits:THREAD_HITS,turn:KALEIDO_SPEEDS.threadsTurn,accent:THREAD_PALETTES.map(p=>p[2])},
 {draw:Kaurora,steps:12,hits:[2,6,10],turn:auroraOmega(.1),accent:AURORA_PALETTES.map(p=>p[1])},
 {draw:Kspiro,steps:12,hits:[0,4,8],turn:.06,accent:SPIRO_PALETTES.map(p=>p[0])},
 {draw:Kflake,steps:12,hits:[0,2,4,6,8,10],turn:.04,accent:FLAKE_PALETTES.map(p=>p[0])},
 // The galaxy's arms also unwind: at most 0.9 rad × ln 6 over the evolution, about 0.53 rad/s at its fastest on an 8 s effect.
 {draw:Kgalaxy,steps:16,hits:[1,3,5,7,9,11,13],turn:.06+.9*1.5*Math.log(6)/4.55,accent:GALAXY_PALETTES.map(p=>p[2])},
 {draw:Khive,steps:12,hits:Kspan(0,11),turn:.03,accent:HIVE_PALETTES.map(p=>p[0][0])},
 {draw:Kribbon,steps:12,hits:[0,4,8],turn:.04,accent:RIBBON_PALETTES.map(p=>p[0][0])},
 {draw:Kcircles,steps:16,hits:[...Kspan(0,12),14],turn:.035,accent:CIRCLE_PALETTES.map(p=>p[0])},
 {draw:Kwaves,steps:12,hits:[0,2,4,6,8,10],turn:.05,accent:WAVE_PALETTES.map(p=>p[2])},
 {draw:Ktree,steps:12,hits:[0,1,2,3,4,5,6,8,10],turn:.05*.55,accent:TREE_PALETTES.map(p=>p[1])},
 {draw:Ktunnel,steps:12,hits:[0,2,4,6,8,10],turn:.08,accent:TUNNEL_PALETTES.map(p=>p[1])},
 {draw:Kconfetti,steps:12,hits:[0,3,6,9],turn:.05,accent:[CONFETTI[2],CONFETTI[4],CONFETTI[6]]},
 {draw:Ksilk,steps:12,hits:[0,4,8],turn:.03,accent:SILK_PALETTES.map(p=>p[0])},
 {draw:Knova,steps:12,hits:[0,4,8],turn:.04,accent:['#ffe9b0','#ffd0e8','#d6f0ff']}
].map(Object.freeze));

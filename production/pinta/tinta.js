// Pinta el món · la línia de tinta (Canvas 2D, sobre un canvas transparent). Traços de gruix variable amb un tremolor lleu, com una
// ploma; opcionalment amb interrupcions (estil C). Un tall {cut} esborra la tinta del darrere. map = [sx, sy, ox, oy] full→canvas.
function tnoise(x,seed){const s=Math.sin(x*1.7+seed*12.9898)*43758.5453,a=s-Math.floor(s);const t=Math.sin(x*.53+seed*78.233)*23421.631,b=t-Math.floor(t);return (a*.6+b*.4);}
function resample(pts,step){const out=[pts[0]];let acc=0;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1e-6)continue;let s=step-acc;while(s<L){out.push([a[0]+(b[0]-a[0])*s/L,a[1]+(b[1]-a[1])*s/L]);s+=step;}acc=(L-(s-step));}
 const last=pts[pts.length-1],l2=out[out.length-1];if(Math.hypot(last[0]-l2[0],last[1]-l2[1])>.5)out.push(last);return out;}
export function inkDraw(c,strokes,map,st,seed=1){const [sx,sy,ox,oy]=map,k=(sx+sy)/2;c.save();c.setTransform(1,0,0,1,0,0);c.lineJoin='round';c.lineCap='round';
 let n=0;for(const S of strokes){n++;
  if(S.cut){c.save();c.globalCompositeOperation='destination-out';c.fillStyle='#000';c.beginPath();S.cut.forEach(([x,y],i)=>i?c.lineTo(x*sx+ox,y*sy+oy):c.moveTo(x*sx+ox,y*sy+oy));c.closePath();c.fill();c.restore();continue;}
  const base=S.w*st.width*k,hatch=S.k==='hatch',dot=S.k==='dot';
  const pts=resample(S.pts.map(([x,y])=>[x*sx+ox,y*sy+oy]),Math.max(1.5,2.2*k));if(pts.length<2)continue;
  const alpha=(hatch?.5:dot?.95:.9)*st.alpha;c.fillStyle=`rgba(${st.ink[0]},${st.ink[1]},${st.ink[2]},${alpha})`;
  const N=pts.length,segs=[];let cur=[];
  for(let i=0;i<N;i++){const u=i/(N-1),a=pts[Math.max(0,i-1)],b=pts[Math.min(N-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
   const tre=(tnoise(i*.11,seed+n)-.5)*2*st.tremor*k,w=base*(hatch?.7:1)*(.5+.5*Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,u))),.55))*(1+.3*(tnoise(i*.23,seed*3+n)-.5))+.35*k;
   if(st.gaps>0&&!hatch){const g=tnoise(i*.025,seed*7+n);if(g>1-st.gaps*.3&&i>3&&i<N-4){if(cur.length>1)segs.push(cur);cur=[];continue;}}
   cur.push([pts[i][0]+nx*tre,pts[i][1]+ny*tre,nx,ny,w]);}
  if(cur.length>1)segs.push(cur);
  for(const seg of segs){c.beginPath();for(let i=0;i<seg.length;i++){const [x,y,nx,ny,w]=seg[i];if(i===0)c.moveTo(x+nx*w/2,y+ny*w/2);else c.lineTo(x+nx*w/2,y+ny*w/2);}
   for(let i=seg.length-1;i>=0;i--){const [x,y,nx,ny,w]=seg[i];c.lineTo(x-nx*w/2,y-ny*w/2);}c.closePath();c.fill();
   if(!hatch&&st.pool>0){const [x,y,,,w]=seg[0];c.beginPath();c.arc(x,y,w*.6*st.pool+.3*k,0,Math.PI*2);c.fill();}}
 }
 c.restore();}

// Gotes de pintura (CE03; «La nova Pluja de colors» until 0.52.2, renamed in 0.52.3) · the scene: the workshop around the bath, the water and its ink, the drops in the air, the
// brush, the comb and the stylus, the sheet of paper that takes the print, the clothesline, and the wait for the next press.
// Materials: the ink has a slightly darker rim (the pigment gathers at its edge), which is also the dark contour of every colour;
// the water has a slow wet sheen (a window reflected, moving without any sudden change of light); the print is matte, on paper
// with fibres and a deckled edge. Canvas 2D only. While nothing moves, the bath is a picture kept from the last frame.
import {escDecor,escVeil,escBlit,escWaitClock,ESC_WAIT_START,escFrame,escCanvas,escGrain} from './escenari.js';
import {MB_TALLERS,MB_CONTRAST,mbPalette,mbContrastSet} from './marbre-tallers.js';
import {MB_A,MB_FALL,MB_HANG,MB_SKIM,mbStart,mbPress,mbTick} from './color-rain.js';
import {mbView,mbBusy} from './marbre-tinta.js';

const mbC=x=>x<=0?0:x>=1?1:x;
const mbS=x=>{x=mbC(x);return x*x*(3-2*x);};
const mbL=(a,b,t)=>a+(b-a)*t;
// ── Colours ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const mbRGB=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const mbHex=a=>'#'+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
export const mbMix=(a,b,f)=>{const A=mbRGB(a),B=mbRGB(b);return mbHex(A.map((v,i)=>v+(B[i]-v)*f));};
const mbRgba=(h,a)=>{const [r,g,b]=mbRGB(h);return `rgba(${r},${g},${b},${a})`;};
function mbHSL(hex){const [r,g,b]=mbRGB(hex).map(v=>v/255),mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return [h,s,l];}
function mbFromHSL(h,s,l){const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1));};return mbHex([f(0)*255,f(8)*255,f(4)*255]);}
// The colours of a sheet (g: workshop, j: sheet, lap): the water, the inks and their rims. Every sheet has its own palette; on
// light water the light inks become a dark ink of their own hue (nearly black, like sumi) and the others darker, keeping their
// order of lightness, so the contrast with the water stays high; «Sense decorat» puts the ink on the base colour itself. The high
// contrast colours are four of eight, a different four for every sheet.
export function mbColours(g,j,lap,s,decor){const P=mbPalette(g,j,lap),white=s?.base==='white',contrast=s?.mbColors==='contrast',water=decor?.mode==='none'?(white?'#ffffff':'#000000'):P.water[white?1:0];
 let cols=contrast?mbContrastSet(g,j,lap).map(i=>MB_CONTRAST[white?'light':'dark'][i]):P.inks.slice();
 if(white&&!contrast){let k=0;cols=cols.map(c=>{const [h,sa,l]=mbHSL(c);if(l>.8&&sa<.6||l>.86){const v=[[Math.min(.4,sa*.6+.1),.17],[.62,.3],[.35,.25]][Math.min(2,k++)];return mbFromHSL(h,v[0],v[1]);}
  let L=Math.min(l,.22+.24*mbC((l-.3)/.5)),out=mbFromHSL(h,Math.min(1,sa*1.08),L);while(mbContrast(out,water)<3&&L>.1){L-=.02;out=mbFromHSL(h,Math.min(1,sa*1.08),L);}return out;});
  // two inks of one sheet must not look alike once darkened: the later one goes lighter (or darker), keeping the contrast
  for(let i=1;i<cols.length;i++){const [h,sa,l0]=mbHSL(cols[i]);for(let n=1;n<=10&&cols.slice(0,i).some(c=>mbDE(c,cols[i])<13);n++){const L=l0+(n%2?1:-1)*.045*Math.ceil(n/2),o=mbFromHSL((h+(n>6?.04*(n-6):0))%1,Math.max(.35,sa),Math.max(.08,L));if(mbContrast(o,water)>=3)cols[i]=o;}}}
 const rims=cols.map(c=>{const [h,sa,l]=mbHSL(c);return mbFromHSL(h,sa*.75,white?l*.42:Math.min(l*.4,.2));});
 return {water,cols,rims,white,key:water+cols.join('')};}
// CIEDE2000 colour difference (Sharma, Wu & Dalal, 2005), from sRGB through CIELAB (D65): keeps two darkened inks apart
function mbLab(h){const c=mbRGB(h).map(v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}),X=(.4124564*c[0]+.3575761*c[1]+.1804375*c[2])/.95047,Y=.2126729*c[0]+.7151522*c[1]+.072175*c[2],Z=(.0193339*c[0]+.119192*c[1]+.9503041*c[2])/1.08883,g=t=>t>216/24389?Math.cbrt(t):(24389/27*t+16)/116;return [116*g(Y)-16,500*(g(X)-g(Y)),200*(g(Y)-g(Z))];}
export function mbDE(a,b){const [L1,a1,b1]=mbLab(a),[L2,a2,b2]=mbLab(b),d=Math.PI/180,C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cm=(C1+C2)/2,G=.5*(1-Math.sqrt(Cm**7/(Cm**7+25**7))),A1=(1+G)*a1,A2=(1+G)*a2,c1=Math.hypot(A1,b1),c2=Math.hypot(A2,b2),hh=(y,x)=>{if(!x&&!y)return 0;const v=Math.atan2(y,x)/d;return v<0?v+360:v;},h1=hh(b1,A1),h2=hh(b2,A2);
 let dh=0;if(c1*c2){dh=h2-h1;if(dh>180)dh-=360;else if(dh<-180)dh+=360;}const dH=2*Math.sqrt(c1*c2)*Math.sin(dh*d/2),Lm=(L1+L2)/2,cm=(c1+c2)/2;let hm=h1+h2;if(c1*c2)hm=Math.abs(h1-h2)<=180?(h1+h2)/2:(h1+h2+(h1+h2<360?360:-360))/2;
 const T=1-.17*Math.cos((hm-30)*d)+.24*Math.cos(2*hm*d)+.32*Math.cos((3*hm+6)*d)-.2*Math.cos((4*hm-63)*d),RC=2*Math.sqrt(cm**7/(cm**7+25**7)),SL=1+.015*(Lm-50)**2/Math.sqrt(20+(Lm-50)**2),SC=1+.045*cm,SH=1+.015*cm*T,RT=-Math.sin(60*Math.exp(-(((hm-275)/25)**2))*d)*RC;
 return Math.sqrt(((L2-L1)/SL)**2+((c2-c1)/SC)**2+(dH/SH)**2+RT*((c2-c1)/SC)*(dH/SH));}
// luminance contrast (WCAG) between two colours, for the tests
export function mbContrast(a,b){const L=h=>{const c=mbRGB(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];},x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}

// ── Geometry ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The bath fills the screen below a band for the clothesline; the ink (16:9) covers it.
export function mbBath(w,h){const top=h*.16,side=w*.025,bot=h*.03;return {x:side,y:top,w:w-2*side,h:h-top-bot,top};}
export function mbFitInk(B){const sc=Math.max(B.w/MB_A,B.h);return {sc,ox:B.x+(B.w-MB_A*sc)/2,oy:B.y+(B.h-sc)/2};}
const mbPt=(M,x,y)=>[M.ox+x*M.sc,M.oy+y*M.sc];

// ── The ink ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function mbPolys(c,polys,pal,lw,paper=null){for(const P of polys){const p=P.p,n=p.length;if(n<6)continue;c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<n;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();
  if(P.col<0){c.fillStyle=paper||pal.water;c.fill();continue;}const nc=pal.cols.length,col=pal.cols[P.col%nc];c.fillStyle=paper?mbMix(col,paper,.1):col;c.fill();c.strokeStyle=paper?mbMix(pal.rims[P.col%nc],paper,.25):pal.rims[P.col%nc];c.lineWidth=lw;c.stroke();}}
// a sheet the size of a rectangle, at the resolution of the screen, drawn again only when its key changes
const MB_CANVAS=new Map();
function mbSheetOf(c,name,key,w,h,draw){const m=c.getTransform?c.getTransform():null;if(!m||Math.abs(m.b)>1e-6||Math.abs(m.c)>1e-6)return null;const k=Math.hypot(m.a,m.b)||1,W=Math.max(1,Math.round(w*k)),H=Math.max(1,Math.round(h*k));
 let S=MB_CANVAS.get(name);if(!S||S.cv.width!==W||S.cv.height!==H){const cv=escCanvas(W,H),sc=cv?.getContext?.('2d');if(!sc||!sc.setTransform)return null;S={cv,key:null};MB_CANVAS.set(name,S);}
 if(S.key!==key){const sc=S.cv.getContext('2d');sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,W,H);sc.setTransform(k,0,0,k,0,0);draw(sc,w,h);S.key=key;}
 return S.cv;}
// The bath with its ink: water, polygons and their rims (no grain: the water is smooth; the grain belongs to the paper).
function mbBathInk(c,B,M,polys,pal,key,alpha=1){const draw=(sc,w,h)=>{sc.fillStyle=pal.water;sc.fillRect(0,0,w,h);sc.save();sc.translate(M.ox-B.x,M.oy-B.y);sc.scale(M.sc,M.sc);mbPolys(sc,polys,pal,1.7/M.sc);sc.restore();};
 const cv=mbSheetOf(c,'bath',key,B.w,B.h,draw);c.save();c.globalAlpha*=alpha;if(cv)c.drawImage(cv,B.x,B.y,B.w,B.h);else{c.beginPath();c.rect(B.x,B.y,B.w,B.h);c.clip();c.translate(B.x,B.y);draw(c,B.w,B.h);}c.restore();}
// The print: the same polygons on paper (matte: the colours a little paler, the clear water shows the paper).
const MB_PAPER='#f3ead6';
function mbPrintSheet(c,name,key,pw,ph,B,M,polys,pal){const draw=(sc,w,h)=>{sc.fillStyle=MB_PAPER;sc.fillRect(0,0,w,h);sc.save();const k=w/B.w;sc.scale(k,h/B.h);sc.translate(M.ox-B.x,M.oy-B.y);sc.scale(M.sc,M.sc);mbPolys(sc,polys,pal,1.4/M.sc,MB_PAPER);sc.restore();escGrain(sc,w,h,.3);};
 return mbSheetOf(c,name,key,pw,ph,draw)||null;}
// a deckled edge for a sheet of paper
function mbDeckle(c,x,y,w,h,seed){const pts=[],n=26,j=Math.min(w,h)*.006,r=i=>{const v=Math.sin(i*12.9898+seed*78.233)*43758.5453;return (v-Math.floor(v))-.5;};
 for(let i=0;i<n;i++)pts.push([x+w*i/n,y+r(i)*j]);for(let i=0;i<n;i++)pts.push([x+w+r(i+50)*j,y+h*i/n]);for(let i=0;i<n;i++)pts.push([x+w-w*i/n,y+h+r(i+100)*j]);for(let i=0;i<n;i++)pts.push([x+r(i+150)*j,y+h-h*i/n]);
 c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const p of pts)c.lineTo(p[0],p[1]);c.closePath();}

// ── The workshops ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each wall is quiet (low contrast) so the bath and the prints stand out; the band above the bath holds the clothesline.
function mbWall(c,w,h,T){const B=mbBath(w,h),W=T.wall;c.fillStyle=W.tone;c.fillRect(0,0,w,h);c.save();
 switch(T.id){
 case 'barcelona':{const n=Math.ceil(w/(h*.09));for(let i=0;i<n;i++){c.fillStyle=i%2?mbMix(W.tone,W.light,.12):mbMix(W.tone,W.dark,.1);c.fillRect(i*h*.09,0,h*.09,h);}
  c.fillStyle=W.dark;c.fillRect(0,B.top*.78,w,B.top*.08);const books=['#7a3b2e','#3e5a7a','#8a6a2e','#4e6b3c','#6b3d5e','#9a7a4a'];let x=w*.02;for(let i=0;x<w*.98;i++){const bw=h*(.012+.008*((i*7)%3)),bh=B.top*(.36+.12*((i*5)%4)/3);c.fillStyle=mbMix(books[i%books.length],W.tone,.45);c.fillRect(x,B.top*.78-bh,bw,bh);x+=bw+h*.002+(i%9===8?h*.08:0);}break;}
 case 'istanbul':{const s=h*.08;for(let y=0;y<h;y+=s)for(let x=0;x<w;x+=s){c.fillStyle=((x+y)/s)%2?mbMix(W.light,W.tone,.25):mbMix(W.light,W.tone,.12);c.fillRect(x,y,s,s);c.fillStyle=mbRgba(W.tone,.35);c.beginPath();c.arc(x+s/2,y+s/2,s*.22,0,7);c.fill();c.fillStyle=mbRgba(W.accent,.25);c.beginPath();c.arc(x+s/2,y+s/2,s*.08,0,7);c.fill();}
  c.strokeStyle=mbRgba(W.dark,.18);c.lineWidth=1;for(let y=0;y<h;y+=s){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}for(let x=0;x<w;x+=s){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}break;}
 case 'kyoto':{c.fillStyle=W.light;c.fillRect(0,0,w,h);const cw=h*.11,ch=h*.075;c.strokeStyle=mbRgba(W.dark,.5);c.lineWidth=Math.max(1,h*.004);for(let x=0;x<w;x+=cw){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=ch){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.fillStyle=mbRgba(W.dark,.55);c.fillRect(0,0,w,h*.012);for(let x=0;x<w;x+=cw*4)c.fillRect(x-h*.006,0,h*.012,h);break;}
 case 'paris':{const g=c.createRadialGradient(w*.5,-h*.2,h*.1,w*.5,-h*.2,h*1.1);g.addColorStop(0,W.light);g.addColorStop(1,W.tone);c.fillStyle=g;c.fillRect(0,0,w,h);
  c.strokeStyle=mbRgba(W.dark,.12);c.lineWidth=1;for(let i=0;i<40;i++){const x=(i*137)%w,y=(i*89)%h;c.beginPath();c.moveTo(x,y);c.lineTo(x+h*.03,y+h*.01);c.stroke();}
  c.fillStyle=mbRgba(W.accent,.25);for(let i=0;i<5;i++){const x=w*(.08+i*.21);c.fillRect(x,B.top*.62,h*.012,B.top*.3);c.beginPath();c.arc(x+h*.006,B.top*.62,h*.012,0,7);c.fill();}break;}
 case 'nuremberg':{const n=Math.ceil(w/(h*.07));for(let i=0;i<n;i++){c.fillStyle=i%2?mbMix(W.tone,W.light,.1):mbMix(W.tone,W.dark,.12);c.fillRect(i*h*.07,0,h*.07,h);}
  c.strokeStyle=mbRgba(W.dark,.55);c.fillStyle=mbRgba(W.light,.35);c.lineWidth=Math.max(1,h*.003);for(let i=0;i<4;i++){const x=w*(.1+i*.25),y=B.top*.55,L=w*.12;c.fillRect(x,y,L,h*.012);for(let j=0;j<=12;j++){c.beginPath();c.moveTo(x+L*j/12,y+h*.012);c.lineTo(x+L*j/12,y+h*.04);c.stroke();}}break;}}
 // a soft shade towards the corners
 const v=c.createRadialGradient(w/2,h*.6,h*.3,w/2,h*.6,h*1.1);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.28)');c.fillStyle=v;c.fillRect(0,0,w,h);c.restore();}
// the wooden edge of the bath
function mbTray(c,B,T,h){const th=h*.013;c.save();c.fillStyle=mbMix(T.wall.dark,'#6a4526',.55);c.fillRect(B.x-th,B.y-th,B.w+2*th,B.h+2*th);c.strokeStyle='#120c06';c.lineWidth=Math.max(1.5,h*.003);c.strokeRect(B.x-th,B.y-th,B.w+2*th,B.h+2*th);c.strokeRect(B.x,B.y,B.w,B.h);c.restore();}

// ── The tools ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// where a hand holding the brush would be at time t (pts: [x, y, time] of the drops it lets fall), in ink units
function mbAlong(pts,t){if(t<=pts[0][2])return pts[0];const L=pts[pts.length-1];if(t>=L[2])return L;for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];if(t<b[2]){const u=mbS((t-a[2])/Math.max(1e-6,b[2]-a[2]));return [mbL(a[0],b[0],u),mbL(a[1],b[1],u),t];}}return L;}
// The brush lean: the hand is above the bath and a little to the right, so the brush points down-left to its tip.
export const MB_TIP=Object.freeze([-.03,-.15]);
function mbBrushAt(c,x,y,h,col,a=1){const ang=-1.05,L=h*.34,tw=h*.024,tl=h*.055;c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(ang);
 c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(h*.03,h*.05,tw*.9,tl*.5,.3,0,7);c.fill();
 c.lineWidth=Math.max(1.4,h*.003);c.strokeStyle='#1d1209';
 c.fillStyle='#8c5a2c';c.beginPath();c.moveTo(tl+h*.02,-h*.008);c.lineTo(L,-h*.006);c.lineTo(L,h*.006);c.lineTo(tl+h*.02,h*.008);c.closePath();c.fill();c.stroke();
 c.fillStyle='#bdb7a8';c.fillRect(tl,-h*.011,h*.022,h*.022);c.strokeRect(tl,-h*.011,h*.022,h*.022);
 c.fillStyle='#3a291b';c.beginPath();c.moveTo(tl,-tw/2);c.quadraticCurveTo(tl*.35,-tw*.55,0,0);c.quadraticCurveTo(tl*.35,tw*.55,tl,tw/2);c.closePath();c.fill();c.stroke();
 c.fillStyle=col;c.beginPath();c.moveTo(tl*.45,-tw*.3);c.quadraticCurveTo(tl*.15,-tw*.25,0,0);c.quadraticCurveTo(tl*.15,tw*.25,tl*.45,tw*.3);c.closePath();c.fill();c.restore();}
function mbStylusAt(c,x,y,h,a=1){c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(-1.1);c.lineWidth=Math.max(1.3,h*.0026);c.strokeStyle='#1d1209';c.fillStyle='#c9a96a';
 c.beginPath();c.moveTo(0,0);c.lineTo(h*.04,-h*.006);c.lineTo(h*.36,-h*.007);c.lineTo(h*.36,h*.007);c.lineTo(h*.04,h*.006);c.closePath();c.fill();c.stroke();
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(0,0,h*.009,0,7);c.fill();c.restore();}
// The comb: a wooden bar across the bath (square to its way) with its pins in the water, at the tip of the stroke; it travels
// across, down or on a slant, and its pins follow the wave or the zigzag of the stroke.
function mbComb(c,M,o,k,h,a=1){const tip=k*(o.L+2*o.soft)-o.soft,bx=o.bx+o.mx*tip,by=o.by+o.my*tip;c.save();c.globalAlpha*=a;
 const [x0,y0]=mbPt(M,-.03,-.03),[x1,y1]=mbPt(M,MB_A+.03,1.03);c.beginPath();c.rect(x0,y0,x1-x0,y1-y0);c.clip();
 const qs=[[0,0],[MB_A,0],[0,1],[MB_A,1]].map(([x,y])=>(x-o.bx)*o.nx+(y-o.by)*o.ny),q0=Math.min(...qs)-.06,q1=Math.max(...qs)+.06,P=q=>mbPt(M,bx+o.nx*q,by+o.ny*q);
 const lw=Math.max(1.4,h*.003),bar=.02*M.sc,[ax,ay]=P(q0),[ex,ey]=P(q1);c.lineCap='butt';
 c.strokeStyle='#1d1209';c.lineWidth=bar+2*lw;c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,ey);c.stroke();c.strokeStyle='#9b6a37';c.lineWidth=bar;c.beginPath();c.moveTo(ax,ay);c.lineTo(ex,ey);c.stroke();
 const sn=Math.sin(tip*(o.fr||0)+(o.ph||0)),wave=o.amp?o.amp*(o.tri?Math.asin(.94*sn)/Math.asin(.94):sn):0;c.fillStyle='#2b241c';c.strokeStyle='#1d1209';c.lineWidth=lw;
 for(let i=Math.ceil((q0-o.off)/o.sp);i<=Math.floor((q1-o.off)/o.sp);i++){const q=o.off+i*o.sp+wave,px=bx+o.nx*q,py=by+o.ny*q;if(px<-.02||px>MB_A+.02||py<-.02||py>1.02)continue;const [x,y]=mbPt(M,px,py);c.beginPath();c.arc(x,y,Math.max(2,h*.0055),0,7);c.fill();c.stroke();}
 c.restore();}
// where the stylus of a straight stroke is at time t
const mbTipAt=(o,t)=>{const k=mbC((t-o.t0)/o.dur),tip=Math.max(0,Math.min(o.L,k*(o.L+2*o.soft)-o.soft));return [o.bx+o.mx*tip,o.by+o.my*tip];};
// The fan: a round paper fan at the side of the bath, waving slowly.
function mbFan(c,B,h,t,a=1){const x=B.x+B.w*.06,y=B.y+B.h*.55,ang=-.5+Math.sin(t*2.2)*.32,R=h*.1;c.save();c.globalAlpha*=a;c.translate(x,y);c.rotate(ang);c.lineWidth=Math.max(1.4,h*.003);c.strokeStyle='#1d1209';
 c.fillStyle='#7a5a32';c.fillRect(-h*.006,R*.6,h*.012,h*.2);c.strokeRect(-h*.006,R*.6,h*.012,h*.2);c.fillStyle='#efe2c4';c.beginPath();c.ellipse(0,-R*.15,R,R*.9,0,0,7);c.fill();c.stroke();
 c.strokeStyle='rgba(60,40,20,.45)';c.lineWidth=1;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(0,R*.6);c.lineTo(Math.sin(i*.33)*R*.95,-R*.15-Math.cos(i*.33)*R*.85);c.stroke();}c.restore();}

// ── The paper and the clothesline ───────────────────────────────────────────────────────────────────────────────────────────
// five pegs along the line, clear of the activity's buttons at the top right
const MB_SLOTS=5;
function mbSlot(w,h,B,i){const ph=B.top*.66,pw=ph*(B.w/B.h);return {x:w*(.1+i*.16)-pw/2,y:B.top*.2,w:pw,h:ph};}
function mbHungSheet(c,H,w,h,B,M,s,decor){const sl=mbSlot(w,h,B,0),pal=mbColours(H.g,H.j,H.lap,s,decor);return mbPrintSheet(c,'hung'+H.id,H.uid+'/'+pal.key,sl.w,sl.h,B,M,H.polys,pal);}
function mbDrawPaper(c,cv,x,y,pw,ph,seed,rot=0,shadow=.25){c.save();c.translate(x+pw/2,y+ph/2);c.rotate(rot);c.translate(-pw/2,-ph/2);
 if(shadow>0){c.fillStyle=`rgba(0,0,0,${shadow})`;mbDeckle(c,pw*.012,ph*.03,pw,ph,seed);c.fill();}
 mbDeckle(c,0,0,pw,ph,seed);c.save();c.clip();if(cv)c.drawImage(cv,0,0,pw,ph);else{c.fillStyle=MB_PAPER;c.fillRect(0,0,pw,ph);}c.restore();
 c.strokeStyle='#2a2116';c.lineWidth=Math.max(1.2,ph*.006);mbDeckle(c,0,0,pw,ph,seed);c.stroke();c.restore();}
function mbLine(c,w,h,B,F,s,decor,M,t){const y0=B.top*.2,sag=B.top*.08,light=decor.mode==='none'?decor.white:decor.fade>.5?['istanbul','kyoto','paris'].includes(MB_TALLERS[F.g].id):decor.white;c.save();c.strokeStyle=light?'#3a3226':'#d9cdb4';c.lineWidth=Math.max(1.5,h*.003);c.beginPath();c.moveTo(0,y0-sag*.4);c.quadraticCurveTo(w/2,y0+sag,w,y0-sag*.4);c.stroke();
 const list=F.hung.slice(-MB_SLOTS);list.forEach((H,i)=>{const sl=mbSlot(w,h,B,i),cv=mbHungSheet(c,H,w,h,B,M,s,decor),age=t-H.at,sw=Math.sin(age*3)*.05*Math.exp(-age*1.2);
  mbDrawPaper(c,cv,sl.x,sl.y,sl.w,sl.h,H.id,sw,.3);c.fillStyle='#b48a52';c.strokeStyle='#1d1209';c.lineWidth=1.2;for(const fx of [.18,.82]){const px=sl.x+sl.w*fx;c.fillRect(px-h*.005,sl.y-h*.014,h*.01,h*.03);c.strokeRect(px-h*.005,sl.y-h*.014,h*.01,h*.03);}});
 c.restore();}

// ── The scene ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
export function mbScene(c,w,h,G,s,preview=false){const F=G?.marbre||mbPreviewState(),t=F.t,decor=escDecor({background:s.background,base:s.base,opacity:s.opacity,preview});
 const B=mbBath(w,h),M=mbFitInk(B),T=MB_TALLERS[F.g],P=F.print,wk=preview||F.sim||s.waitCue===false?{dark:0}:escWaitClock(F.wait||ESC_WAIT_START,t),dark=preview?0:(wk.dark||0)*.7;
 c.save();c.fillStyle=decor.base;c.fillRect(0,0,w,h);
 // the workshop (and, for a moment after a change, the one before it)
 if(decor.mode!=='none'){escBlit(c,'mb-wall-'+T.id,w,h,(sc,sw,sh)=>mbWall(sc,sw,sh,T));const ch=t-F.changeAt;if(F.prevG>=0&&ch<1.8){const PT=MB_TALLERS[F.prevG];escBlit(c,'mb-wall-'+PT.id,w,h,(sc,sw,sh)=>mbWall(sc,sw,sh,PT),1-mbS(ch/1.8));}
  mbTray(c,B,T,h);escVeil(c,decor,0,0,w,h);}
 // the bath and its ink
 const pal=mbColours(P?P.g:F.g,P?P.j:F.j,P?P.lap:F.lap,s,decor),size=Math.round(B.w)+'x'+Math.round(B.h);
 if(P&&t>=P.lift){c.save();c.fillStyle=pal.water;c.fillRect(B.x,B.y,B.w,B.h);const sx=t<P.skim?-1:B.x-w*.05+(B.w+w*.1)*mbS((t-P.skim)/MB_SKIM);
  c.beginPath();c.rect(Math.max(B.x,sx),B.y,B.x+B.w-Math.max(B.x,sx),B.h);c.clip();mbBathInk(c,B,M,P.polys,pal,'p'+P.uid+'/'+P.t0+pal.key+size,.16);c.restore();
  if(sx>=B.x-w*.05&&t<P.end){c.save();c.fillStyle=MB_PAPER;c.strokeStyle='#2a2116';c.lineWidth=Math.max(1.2,h*.003);c.fillRect(sx-w*.018,B.y-h*.02,w*.036,B.h+h*.04);c.strokeRect(sx-w*.018,B.y-h*.02,w*.036,B.h+h*.04);c.restore();}}
 else{const polys=P?P.polys:mbView(F.ink,t),busy=!P&&mbBusy(F.ink,t),key=(P?'p'+P.uid+'/'+P.t0:busy?'t'+t.toFixed(4):'v'+F.ink.uid+'|'+F.ink.version+'|'+F.ink.polys.length+'|'+F.ink.seq)+pal.key+size;mbBathInk(c,B,M,polys,pal,key);}
 // the wet sheen of the water: a window reflected, drifting very slowly
 c.save();c.beginPath();c.rect(B.x,B.y,B.w,B.h);c.clip();const gx=B.x+B.w*(.3+(s.reduced?0:.08*Math.sin(t*.05))),gy=B.y+B.h*.28,gr=c.createRadialGradient(gx,gy,0,gx,gy,B.h*.6);gr.addColorStop(0,pal.white?'rgba(255,255,255,.18)':'rgba(255,255,255,.07)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(B.x,B.y,B.w,B.h);
 const ed=c.createLinearGradient(0,B.y,0,B.y+B.h*.08);ed.addColorStop(0,'rgba(0,0,0,.22)');ed.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=ed;c.fillRect(B.x,B.y,B.w,B.h*.08);c.restore();
 // the drops in the air (from the brush tip to the water) and their shadows
 // «Moviment reduït»: no drop falls through the air (each one just grows where it touches the water, on its note)
 for(const f of s.reduced?[]:F.falls){if(t<f.t0||t>=f.t1)continue;const u=(t-f.t0)/(f.t1-f.t0),e=u*u,fp=mbColours(f.g,f.j,f.lap,s,decor),col=f.col<0?(pal.white?'#bcd3e2':'#dfeaf2'):fp.cols[f.col%fp.cols.length],sx0=f.small?f.x:f.x+MB_TIP[0],sy0=f.small?f.y-.05:f.y+MB_TIP[1];
  const [lx,ly]=mbPt(M,f.x,f.y),[x,y]=mbPt(M,mbL(sx0,f.x,e),mbL(sy0,f.y,e)),r=h*(f.small?.0045:.009)*(1+.25*u);
  c.fillStyle=`rgba(0,0,0,${(.22*u).toFixed(3)})`;c.beginPath();c.ellipse(lx,ly,r*(.5+.6*u),r*(.35+.4*u),0,0,7);c.fill();
  c.save();c.translate(x,y);c.rotate(Math.atan2(ly-y,lx-x)-Math.PI/2);c.fillStyle=col;c.strokeStyle=f.col<0?'#3b5566':fp.rims[f.col%fp.rims.length];c.lineWidth=Math.max(1,h*.002);
  c.beginPath();c.moveTo(0,-r*1.8);c.quadraticCurveTo(r*1.05,-r*.2,0,r);c.quadraticCurveTo(-r*1.05,-r*.2,0,-r*1.8);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(-r*.3,0,r*.25,0,7);c.fill();c.restore();}
 // the tools
 for(const To of F.tools){if(t<To.t0||t>To.t1)continue;const fade=mbS((t-To.t0)/.35)*mbS((To.t1-t)/.35);
  switch(To.kind){
  case 'brush':{const p=mbAlong(To.pts,t+MB_FALL),[x,y]=mbPt(M,p[0]+MB_TIP[0],p[1]+MB_TIP[1]),col=pal.cols[Math.max(0,F.falls.find(f=>f.t1>=t&&!f.small)?.col??0)%pal.cols.length]||pal.cols[0];mbBrushAt(c,x,y,h,col,fade);break;}
  case 'spray':{const p=mbAlong(To.pts,t),[x,y]=mbPt(M,p[0],p[1]),tap=Math.abs(Math.sin((t-To.t0)*Math.PI/.28))*h*.01;mbBrushAt(c,x,y-tap,h,pal.cols[Math.max(0,To.col??2)%pal.cols.length],fade);c.save();c.globalAlpha*=fade;c.strokeStyle='#1d1209';c.fillStyle='#a9783f';c.lineWidth=Math.max(1.3,h*.0026);c.translate(x+h*.01,y+h*.02);c.rotate(.12);c.fillRect(-h*.12,-h*.005,h*.24,h*.01);c.strokeRect(-h*.12,-h*.005,h*.24,h*.01);c.restore();break;}
  case 'comb':case 'comb2':{const o=To.op,k=mbC((t-o.t0)/o.dur);mbComb(c,M,o,k,h,fade);break;}
  case 'stylus':{for(const st of To.strokes){if(t<st.t0-.25||t>st.t1+.25)continue;const a=mbS((t-st.t0+.25)/.25)*mbS((st.t1+.25-t)/.25);if(st.vortex){const ang=(t-st.t0)*6,[x,y]=mbPt(M,st.x+Math.cos(ang)*st.r,st.y+Math.sin(ang)*st.r);mbStylusAt(c,x,y,h,a);}else{const [x,y]=mbPt(M,...mbTipAt(st.op,t));mbStylusAt(c,x,y,h,a);}}break;}
  // one stylus that follows its strokes one after another (an S across the bath, the spokes of a star)
  case 'path':{let st=To.strokes[0];for(const q of To.strokes)if(t>=q.t0)st=q;const [x,y]=mbPt(M,...mbTipAt(st.op,t));mbStylusAt(c,x,y,h,fade);break;}
  case 'curl':{const p=mbAlong(To.pts,t),ang=(t-To.t0)*7,[x,y]=mbPt(M,p[0]+Math.cos(ang)*To.r,p[1]+Math.sin(ang)*To.r);mbStylusAt(c,x,y,h,fade);break;}
  case 'vortex':{for(const [cx,cy,sg] of To.pts){const ang=(t-To.t0)*3*sg,[x,y]=mbPt(M,cx+Math.cos(ang)*To.r,cy+Math.sin(ang)*To.r);mbStylusAt(c,x,y,h,fade);}break;}
  case 'spiral':{const i=Math.min(To.rings.length-1,Math.max(0,Math.floor((t-To.t0)/To.step))),r=To.rings[i],ang=(t-To.t0)*2.5*(To.sg?To.sg[i]:i%2?-1:1),[x,y]=mbPt(M,To.cx+Math.cos(ang)*r,To.cy+Math.sin(ang)*r);mbStylusAt(c,x,y,h,fade);break;}
  case 'fan':mbFan(c,B,h,t,fade);break;}}
 // the sheet of paper that takes the print
 if(P){const pw=B.w*.9,ph=B.h*.9,x0=B.x+(B.w-pw)/2,y0=B.y+(B.h-ph)/2,cv=mbPrintSheet(c,'print',P.uid+'/'+P.t0+pal.key+size,pw,ph,B,M,P.polys,pal);
  if(t<P.touch){const e=mbS((t-P.t0)/(P.touch-P.t0)),y=mbL(-ph-h*.05,y0,e);mbDrawPaper(c,null,x0,y,pw,ph,P.t0,0,.25*e);}
  else if(t<P.lift){const a=mbS((t-P.touch)/(P.lift-P.touch));mbDrawPaper(c,null,x0,y0,pw,ph,P.t0,0,.2);c.save();c.globalAlpha*=.92*a;mbDeckle(c,x0,y0,pw,ph,P.t0);c.clip();if(cv)c.drawImage(cv,x0,y0,pw,ph);c.restore();}
  else if(t<P.hang){const e=mbS((t-P.lift)/(P.shown-P.lift)),sc=1+.03*e,yy=y0-B.h*.05*e,rot=Math.sin((t-P.lift)*1.3)*.012*e;mbDrawPaper(c,cv,x0+pw*(1-sc)/2,yy+ph*(1-sc)/2,pw*sc,ph*sc,P.t0,rot,.3);}
  else if(t<P.hang+MB_HANG){const e=mbS((t-P.hang)/MB_HANG),sl=mbSlot(w,h,B,Math.min(F.hung.length,MB_SLOTS-1)),sc=1.03,ax=x0+pw*(1-sc)/2,ay=y0-B.h*.05+ph*(1-sc)/2;
   mbDrawPaper(c,cv,mbL(ax,sl.x,e),mbL(ay,sl.y,e)-Math.sin(e*Math.PI)*h*.06,mbL(pw*sc,sl.w,e),mbL(ph*sc,sl.h,e),P.t0,Math.sin(e*Math.PI)*.08,.3);}}
 // the clothesline with the prints of this session
 if(s.mbLine!==false&&!preview)mbLine(c,w,h,B,F,s,decor,M,t);
 if(dark>0){c.fillStyle=`rgba(0,0,0,${dark.toFixed(3)})`;c.fillRect(0,0,w,h);}
 c.restore();escFrame();if(MB_CANVAS.size>14){for(const [k] of MB_CANVAS){if(k.startsWith('hung')&&!F.hung.some(H=>'hung'+H.id===k)){MB_CANVAS.delete(k);}}}}

// ── A finished sheet, for the card, the home page and the ⓘ panel ──────────────────────────────────────────────────────────
// The model is run without sound up to the end of the gesture of one sheet (g: workshop, j: sheet), and kept.
const MB_PREV=new Map();
export function mbSimulate(g=0,j=3,{steps=4,lap=0,set=null}={}){const key=g+'/'+j+'/'+steps+'/'+lap+(set?JSON.stringify(set):'');if(MB_PREV.has(key))return MB_PREV.get(key);const s={mbSteps:5,mbGestures:'pintes',mbSize:'grans',...(set||{}),mbFirst:MB_TALLERS[g].id,lock:true},game={};mbStart(game,s);const F=game.marbre;F.j=j;F.lap=lap;
 for(let k=0;k<steps;k++){mbPress(game,s);let n=0;while(F.phase!=='rest'&&n++<3000)mbTick(game,s,1/30);}
 for(let n=0;n<30;n++)mbTick(game,s,1/30);F.wait=null;F.sim=true;F.cues.length=0;F.events.length=0;F.ev=0;F.falls=[];F.tools=[];MB_PREV.set(key,F);if(MB_PREV.size>48)MB_PREV.delete(MB_PREV.keys().next().value);return F;}
export const mbPreviewState=()=>mbSimulate(1,2);

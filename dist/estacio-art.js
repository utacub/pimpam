// On anem? (EN04), 0.16: the art of the station of the four doors, in the style of a lithographic travel poster (flat colours with soft
// gradients and a fine paper grain). The hall and the doors are painted once into a sheet; each frame adds the life of the door in focus,
// the light it throws on the floor, the veil over the rest and the contour of the focus. The trip fills the screen: the place at the
// time of day of the round, the vehicle that crosses it along one of four routes, and the discovery that appears at the end.
import {TL_STRIP,TL_TAU,tlVeil,tlRing,tlOpenBox,tlClipOpen,tlSheet,tlGrain,tlRng} from './tauler.js';
import {ET_TRIP,ET_ARRIVE,etRound} from './estacio.js';
import {escDecor,escDecorKey,escVeil} from './escenari.js';
const ET_FRAME={sea:'#2a78c4',forest:'#2f8f4e',snow:'#7fa6cf',space:'#5a2f8f'};
const ET_HALL={mati:['#f6dfb3','#f0cf96','#e7b978'],tarda:['#f7c98a','#efa86a','#e08a55'],nit:['#2c3a6c','#243059','#1b2447']};
const ET_FLOOR={mati:'#c98a52',tarda:'#b8703f',nit:'#3a3550'};
const ET_IRON={mati:'#1f6672',tarda:'#245a63',nit:'#152a44'};
const ET_SKY={sea:{mati:['#3b9be8','#8fd0f5','#fff0b8'],tarda:['#3d63c4','#f59a6b','#ffd27a'],nit:['#0d1640','#22306e','#46467e']},
 forest:{mati:['#fff3b8','#dff3c4','#b8e6bc'],tarda:['#ffd98a','#ffc27a','#f5a96a'],nit:['#0f2340','#1c3a52','#2a4a5a']},
 snow:{mati:['#6cb8f0','#bfe3fb','#eef8ff'],tarda:['#a98bd8','#f2a7b8','#ffe3c8'],nit:['#0c1a42','#1d3170','#33508f']},
 space:{mati:['#1a0f45','#3b1d77','#6b2a8f'],tarda:['#061a3a','#0d3a5e','#1a5a7a'],nit:['#05061a','#120f3a','#22195a']}};
const ET_SEA={mati:['#1b8ad8','#177bc8','#136cb6','#105ea4','#0c5092'],tarda:['#2a6fb8','#24619f','#1f548c','#1a4878','#153c66'],nit:['#1a2c66','#162659','#12204c','#0f1b40','#0b1534']};
const ET_PINES={mati:['#7cc47e','#4fa55e','#2f8a4c','#1b6a3c'],tarda:['#9bb35e','#6a9548','#467a40','#2c5e34'],nit:['#2f5c50','#254c44','#1b3d38','#13302c']};
const ET_PEAK={mati:['#ffffff','#c3d8ee'],tarda:['#ffe4ea','#caa8d8'],nit:['#cfdcf4','#8299cb']};
function etHex(h){const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];}
function etShade(h,k){const f=x=>Math.round(Math.max(0,Math.min(255,k>0?x+(255-x)*k:x*(1+k))));return 'rgb('+etHex(h).map(f).join(',')+')';}
function etV(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/Math.max(1,stops.length-1),s));return g;}
function etGlow(c,x,y,r,col,a=1){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(255,255,255,0)');c.save();c.globalAlpha*=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TL_TAU);c.fill();c.restore();}
function etDisc(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TL_TAU);c.fill();}
function etPoly(c,pts,col){c.fillStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();}
function etRect(c,x,y,w,h,r,col){r=Math.min(r,w/2,h/2);c.fillStyle=col;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();c.fill();}
const etSmooth=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
function etStars(c,x,y,w,h,n,seed,t,still){const r=tlRng(seed);n=Math.min(n,420);for(let i=0;i<n;i++){const sx=x+r()*w,sy=y+r()*h,sz=.5+r()*1.5,ph=r()*TL_TAU,a=still?.55:.45+.3*Math.sin(t*.9+ph);c.fillStyle=`rgba(255,250,230,${a.toFixed(3)})`;c.beginPath();c.arc(sx,sy,sz,0,TL_TAU);c.fill();}}
function etClouds(c,x,y,w,h,time,t,still,seed,top=.1,span=.22){if(time==='nit')return;const r=tlRng(seed),S=Math.min(w,h),n=Math.max(2,Math.round(w/(S*.55))),col=time==='tarda'?'rgba(255,226,214,.9)':'rgba(255,255,255,.92)';c.fillStyle=col;
 for(let k=0;k<n;k++){const cw=S*(.16+r()*.12),cy=y+h*(top+r()*span),cx=x+((k+r()*.6)/n*w+(still?0:t*S*.012*(1+r())))%(w+cw)-cw*.5;c.beginPath();c.ellipse(cx,cy,cw*.5,cw*.12,0,0,TL_TAU);c.fill();c.beginPath();c.ellipse(cx-cw*.12,cy-cw*.1,cw*.22,cw*.14,0,0,TL_TAU);c.fill();c.beginPath();c.ellipse(cx+cw*.14,cy-cw*.07,cw*.17,cw*.11,0,0,TL_TAU);c.fill();}}
function etMoon(c,x,y,r,bg){etDisc(c,x,y,r,'#f4efd8');etDisc(c,x+r*.38,y-r*.22,r*.92,bg);}
// ---------- places ----------
function etSea(c,x,y,w,h,time,t,still,door){const S=Math.min(w,h),hz=y+h*.6;c.fillStyle=etV(c,y,hz,ET_SKY.sea[time]);c.fillRect(x,y,w,h*.62);
 if(time==='mati'){etGlow(c,x+w*.76,y+h*.17,S*.2,'rgba(255,248,200,.8)');etDisc(c,x+w*.76,y+h*.17,S*.08,'#fff1a8');}
 else if(time==='tarda'){c.save();c.beginPath();c.rect(x,y,w,hz-y);c.clip();etGlow(c,x+w*.6,hz,S*.42,'rgba(255,190,120,.7)');etDisc(c,x+w*.6,hz,S*.16,'#ff7043');c.restore();}
 else{etStars(c,x,y,w,h*.5,Math.round(w*h/9000),11,t,still);etMoon(c,x+w*.74,y+h*.18,S*.07,ET_SKY.sea.nit[0]);}
 etClouds(c,x,y,w,h,time,t,still,door?5:6,.08,.24);
 c.fillStyle=time==='nit'?'#1d2450':time==='tarda'?'#6a4a7a':'#5a7fb0';c.beginPath();c.moveTo(x,hz);c.quadraticCurveTo(x+w*.14,hz-h*.06,x+w*.34,hz);c.fill();
 const bands=ET_SEA[time];bands.forEach((b,i)=>{const y0=hz+i*h*.083;c.fillStyle=b;c.fillRect(x,y0,w,h*.09);c.strokeStyle=etShade(b,.13);c.lineWidth=Math.max(1.5,S*.007);const sp=w/3.4,off=still?0:(t*(10+i*4))%sp;
  for(let k=-1;k<5;k++){const xx=x+((k*.29+i*.13)%1)*w+off,yy=y0+h*.03;c.beginPath();c.moveTo(xx,yy);c.quadraticCurveTo(xx+S*.03,yy-S*.012,xx+S*.06,yy);c.stroke();}});
 if(time!=='mati'){c.save();c.globalAlpha=.32;c.fillStyle=time==='tarda'?'#ffb070':'#e8e4ff';const mx=time==='tarda'?x+w*.6:x+w*.74;for(let i=0;i<6;i++){const wd=S*(.16-i*.02);c.fillRect(mx-wd/2+(i%2?S*.01:0),hz+h*.02+i*h*.055,wd,h*.012);}c.restore();}
 if(door)etBoat(c,x+w*.3,y+h*.67,S*.13,still?0:t);}
// part: 'static' paints what never moves (it can be kept in a sheet), 'live' what moves (drawn every frame on top), 'all' both.
function etForest(c,x,y,w,h,time,t,still,door,side=-1,part='all'){const S=Math.min(w,h),M=v=>side>0?1-v:v;
 if(part!=='live'){c.fillStyle=etV(c,y,y+h*.72,ET_SKY.forest[time]);c.fillRect(x,y,w,h);
 if(time==='nit'){etStars(c,x,y,w,h*.45,Math.round(w*h/12000),13,t,true);etMoon(c,x+w*M(.7),y+h*.18,S*.07,ET_SKY.forest.nit[0]);}
 else{const sx=x+w*M(time==='mati'?.68:.5),sy=y+h*(time==='mati'?.26:.5);etGlow(c,sx,sy,S*.3,time==='mati'?'rgba(255,250,210,.9)':'rgba(255,200,120,.8)');etDisc(c,sx,sy,S*(time==='mati'?.13:.16),time==='mati'?'#fff6c8':'#ffb15a');}
 const layers=[[.44,.62],[.54,.78],[.65,.95],[.77,1.15]],cols=ET_PINES[time];
 layers.forEach(([base,sc],li)=>{const r=tlRng(31+li),n=Math.max(3,Math.round(w/(S*.2)))+li,th=S*.3*sc,tw=S*.11*sc;c.fillStyle=cols[li];
  for(let k=0;k<=n;k++){const cx=x+(k+(li%2?.5:0))/n*w+(r()-.5)*S*.05,cy=y+h*base;c.beginPath();c.moveTo(cx,cy-th);for(let q=1;q<=3;q++){c.lineTo(cx+tw*q/3,cy-th+th*q/3);c.lineTo(cx+tw*q/3*.45,cy-th+th*q/3);}c.lineTo(cx+tw*.45,cy);c.lineTo(cx-tw*.45,cy);for(let q=3;q>=1;q--){c.lineTo(cx-tw*q/3*.45,cy-th+th*q/3);c.lineTo(cx-tw*q/3,cy-th+th*q/3);}c.closePath();c.fill();}
  c.fillRect(x,y+h*base-1,w,h*(1-base)+2);});
 c.fillStyle=etShade(cols[3],-.25);c.fillRect(x,y+h*.92,w,h*.08);}
 // shafts of light through the trees, swaying slowly
 if(part!=='static'&&time!=='nit'){c.save();c.globalAlpha=.16;c.fillStyle='#fff6c8';const drift=still?0:Math.sin(t*.4)*S*.02;for(let k=0;k<4;k++){const a=M(.5+k*.12),b=M(.2+k*.16),b2=M(.28+k*.16),a2=M(.58+k*.12);c.beginPath();c.moveTo(x+w*a+drift,y);c.lineTo(x+w*b+drift,y+h);c.lineTo(x+w*b2+drift,y+h);c.lineTo(x+w*a2+drift,y);c.fill();}c.restore();}}
function etSnow(c,x,y,w,h,time,t,still,door){const S=Math.min(w,h),base=y+h*.72;c.fillStyle=etV(c,y,y+h*.65,ET_SKY.snow[time]);c.fillRect(x,y,w,h);
 if(time==='nit')etStars(c,x,y,w,h*.45,Math.round(w*h/9000),17,t,still);if(time==='tarda')etGlow(c,x+w*.5,base,S*.6,'rgba(255,214,190,.5)');etClouds(c,x,y,w,h,time,t,still,door?8:9,.06,.16);
 const [lit,sh]=ET_PEAK[time],peak=(px,py,pw,a,b)=>{etPoly(c,[[px-pw,base],[px,py],[px+pw,base]],a);etPoly(c,[[px,py],[px+pw,base],[px+pw*.15,base]],b);};
 peak(x+w*.24,y+h*.3,w*.42,etShade(lit,-.04),sh);peak(x+w*.74,y+h*.22,w*.5,lit,etShade(sh,.06));peak(x+w*.48,y+h*.42,w*.36,etShade(lit,-.08),etShade(sh,-.08));
 c.fillStyle=time==='nit'?'#b8c8e8':'#f6fbff';c.fillRect(x,base,w,h-(base-y));c.fillStyle=time==='nit'?'#9fb2dc':time==='tarda'?'#f0d8e4':'#d6e7f6';c.beginPath();c.moveTo(x,y+h*.8);c.quadraticCurveTo(x+w*.5,y+h*.74,x+w,y+h*.84);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.fill();
 const r=tlRng(23),n=Math.max(4,Math.round(w/(S*.14)));for(let k=0;k<n;k++){const px=x+w*(.04+k/n)+r()*S*.03,py=base+h*(.02+(k%3)*.03),s=S*(.03+(k%3)*.01);etPoly(c,[[px,py-s*2.3],[px+s*.85,py],[px-s*.85,py]],time==='nit'?'#1f4a44':'#2f6f5a');}
 if(door){const hx=x+w*.62,hy=y+h*.8,s=S*.05;etRect(c,hx-s,hy-s*.9,s*2,s*1.1,2,'#c8442f');etPoly(c,[[hx-s*1.3,hy-s*.8],[hx,hy-s*1.7],[hx+s*1.3,hy-s*.8]],'#7a3b2a');etRect(c,hx-s*.3,hy-s*.6,s*.5,s*.45,1,time==='nit'?'#ffd36b':'#ffe9a8');}
 if(!still){c.fillStyle='rgba(255,255,255,.85)';const rr=tlRng(29);for(let i=0;i<Math.min(260,Math.round(w*h/5000));i++){const sx=x+((rr()*w+t*S*.03*(rr()-.3))%w+w)%w,sy=y+((rr()*h+t*S*(.04+rr()*.05))%h);c.beginPath();c.arc(sx,sy,S*(.003+rr()*.004),0,TL_TAU);c.fill();}}}
function etSpace(c,x,y,w,h,time,t,still,door,side=-1,part='all'){const S=Math.min(w,h);
 if(part!=='live'){c.fillStyle=etV(c,y,y+h,ET_SKY.space[time]);c.fillRect(x,y,w,h);
 const neb=time==='mati'?'rgba(255,120,200,.16)':time==='tarda'?'rgba(80,220,220,.14)':'rgba(140,120,255,.14)';etGlow(c,x+w*.3,y+h*.7,S*.55,neb);
 if(!door){c.save();c.translate(x+w*.5,y+h*.45);c.rotate(-.42);const mb=c.createLinearGradient(0,-S*.22,0,S*.22);mb.addColorStop(0,'rgba(255,255,255,0)');mb.addColorStop(.5,time==='tarda'?'rgba(150,240,230,.16)':'rgba(255,200,240,.16)');mb.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=mb;c.fillRect(-w,-S*.22,w*2,S*.44);c.restore();}
 if(!door){const pc=[['#4fc3a8','#2f8f7a'],['#ff7aa8','#c84a7a'],['#7aa8ff','#4a6ad8']][ET_TIMES_INDEX(time)];etDisc(c,x+w*.5,y+h*.13,S*.045,pc[0]);c.save();c.beginPath();c.arc(x+w*.5,y+h*.13,S*.045,0,TL_TAU);c.clip();etDisc(c,x+w*.5+S*.02,y+h*.13+S*.012,S*.045,pc[1]);c.restore();}}
 if(part==='static')return;
 etStars(c,x,y,w,h,Math.round(w*h/2600),37+ET_SKY.space[time][0].length,t,still);
 if(!door){const r=tlRng(43+ET_TIMES_INDEX(time)),q=Math.round(w*h/60000);for(let i=0;i<q;i++){const sx=x+r()*w,sy=y+r()*h,sz=S*(.006+r()*.006),tw=still?1:.75+.25*Math.sin(t*1.3+i);c.fillStyle='rgba(255,248,220,.9)';c.beginPath();c.moveTo(sx,sy-sz*3*tw);c.lineTo(sx+sz*.5,sy);c.lineTo(sx,sy+sz*3*tw);c.lineTo(sx-sz*.5,sy);c.closePath();c.fill();c.beginPath();c.moveTo(sx-sz*3*tw,sy);c.lineTo(sx,sy+sz*.5);c.lineTo(sx+sz*3*tw,sy);c.lineTo(sx,sy-sz*.5);c.closePath();c.fill();}}
 if(door){const px=x+w*.58,py=y+h*.44,pr=S*.2;etPlanet(c,px,py,pr,time);etDisc(c,x+w*.24,y+h*.2,S*.075,'#e9e2ff');etDisc(c,x+w*.27,y+h*.18,S*.07,ET_SKY.space[time][0]);
  c.strokeStyle='rgba(180,230,255,.6)';c.lineWidth=Math.max(2,S*.01);c.beginPath();c.moveTo(x+w*.15,y+h*.76);c.quadraticCurveTo(x+w*.4,y+h*.69,x+w*.62,y+h*.79);c.stroke();etDisc(c,x+w*.63,y+h*.79,S*.018,'#d8f3ff');}}
function etPlanet(c,px,py,pr,time){const body=time==='tarda'?'#ff9b4a':time==='nit'?'#f0b04a':'#ff8a6a',band=etShade(body,-.15);
 const ring=back=>{c.save();c.translate(px,py);c.rotate(-.35);c.strokeStyle='#ffd9a0';c.lineWidth=pr*.14;c.beginPath();c.ellipse(0,0,pr*1.7,pr*.38,0,back?Math.PI:0,back?TL_TAU:Math.PI);c.stroke();c.restore();};
 ring(true);etDisc(c,px,py,pr,body);c.save();c.beginPath();c.arc(px,py,pr,0,TL_TAU);c.clip();c.fillStyle=band;c.fillRect(px-pr,py-pr*.3,pr*2,pr*.2);c.fillRect(px-pr,py+pr*.2,pr*2,pr*.12);c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.arc(px+pr*.35,py+pr*.25,pr,0,TL_TAU);c.fill();c.restore();ring(false);}
// side: the side of the screen where the discovery of a trip will appear (1 right, -1 left), so that the sun or the moon keep away from it.
export function etPlace(c,place,x,y,w,h,time,{t=0,still=true,door=false,side=-1,part='all'}={}){const f={sea:etSea,forest:etForest,snow:etSnow,space:etSpace}[place]||etSea;f(c,x,y,w,h,time,t,still,door,side,part);}
// ---------- vehicles ----------
function etBoat(c,x,y,s,t){const bob=Math.sin(t*1.6)*s*.04;c.save();c.translate(x,y+bob);c.rotate(Math.sin(t*1.3)*.04);etPoly(c,[[-s*.5,0],[s*.5,0],[s*.34,s*.2],[-s*.34,s*.2]],'#d8352a');etPoly(c,[[-s*.04,-s*.06],[-s*.04,-s*1.05],[-s*.5,-s*.1]],'#fff8e8');etPoly(c,[[s*.04,-s*.06],[s*.04,-s*.9],[s*.4,-s*.1]],'#ffe9b8');c.fillStyle='#5a3a2a';c.fillRect(-s*.03,-s*1.08,s*.06,s*1.08);c.restore();}
function etTrainShape(c,x,y,s,dir=1,t=0,smoke=true){c.save();c.translate(x,y);c.scale(dir,1);const k=s/200;c.scale(k,k);
 etRect(c,-100,-46,70,42,8,'#d8352a');etRect(c,-24,-34,46,30,6,'#d8352a');etRect(c,28,-34,46,30,6,'#d8352a');etRect(c,-92,-40,24,16,4,'#ffd36b');c.fillStyle='#1f6672';c.fillRect(-56,-64,14,20);
 c.fillStyle='#2b2230';for(const wx of [-86,-46,-10,10,42,62]){c.beginPath();c.arc(wx,-2,8,0,TL_TAU);c.fill();}
 if(smoke)for(let i=0;i<3;i++){const u=((t*.5+i/3)%1);c.fillStyle=`rgba(255,255,255,${(.55*(1-u)).toFixed(3)})`;c.beginPath();c.arc(-49+u*30,-70-u*50,6+u*12,0,TL_TAU);c.fill();}c.restore();}
function etSled(c,x,y,s,ang){c.save();c.translate(x,y);c.rotate(ang);etRect(c,-s*.5,-s*.22,s,s*.16,s*.04,'#b8743a');c.strokeStyle='#c8352a';c.lineWidth=s*.05;c.lineCap='round';c.beginPath();c.moveTo(-s*.5,0);c.lineTo(s*.42,0);c.quadraticCurveTo(s*.62,0,s*.6,-s*.18);c.stroke();
 for(const k of [-.32,.25]){c.beginPath();c.moveTo(s*k,-s*.06);c.lineTo(s*k,0);c.stroke();}etRect(c,-s*.2,-s*.5,s*.36,s*.3,s*.06,'#2a78c4');etDisc(c,-s*.02,-s*.56,s*.1,'#ffd36b');c.restore();}
function etRocket(c,x,y,s,ang,t){c.save();c.translate(x,y);c.rotate(ang);const fl=.85+.15*Math.sin(t*9);c.fillStyle='rgba(255,170,70,.75)';c.beginPath();c.moveTo(-s*.42,-s*.1);c.quadraticCurveTo(-s*(.42+.42*fl),0,-s*.42,s*.1);c.fill();etDisc(c,-s*.5,0,s*.06,'rgba(255,230,160,.9)');
 etPoly(c,[[-s*.3,-s*.14],[-s*.48,-s*.3],[-s*.18,-s*.14]],'#d8352a');etPoly(c,[[-s*.3,s*.14],[-s*.48,s*.3],[-s*.18,s*.14]],'#d8352a');
 c.fillStyle='#f4f1ea';c.beginPath();c.moveTo(-s*.4,-s*.15);c.lineTo(s*.2,-s*.15);c.quadraticCurveTo(s*.5,-s*.1,s*.56,0);c.quadraticCurveTo(s*.5,s*.1,s*.2,s*.15);c.lineTo(-s*.4,s*.15);c.closePath();c.fill();
 etDisc(c,s*.1,0,s*.08,'#1f6672');etDisc(c,s*.1,0,s*.05,'#8fd0f5');c.fillStyle='#d8352a';c.beginPath();c.moveTo(s*.36,-s*.13);c.quadraticCurveTo(s*.5,-s*.1,s*.56,0);c.quadraticCurveTo(s*.5,s*.1,s*.36,s*.13);c.closePath();c.fill();c.restore();}
// ---------- discoveries ----------
function etFind(c,place,find,x,y,w,h,time,u,t,still){if(u<=0)return;const S=Math.min(w,h),a=etSmooth(u);c.save();c.globalAlpha*=a;
 if(place==='sea'){const hz=y+h*.6;
  if(find==='far'){const fx=x,fy=hz+h*.02,s=S*.32;etPoly(c,[[fx-s*.5,fy],[fx-s*.2,fy-s*.14],[fx+s*.25,fy-s*.1],[fx+s*.55,fy]],time==='nit'?'#2a2a44':'#6a5a5a');etPoly(c,[[fx-s*.1,fy-s*.1],[fx-s*.06,fy-s*.78],[fx+s*.06,fy-s*.78],[fx+s*.1,fy-s*.1]],'#f4f1ea');
   for(let k=0;k<3;k++){const yy=fy-s*(.2+k*.2);etPoly(c,[[fx-s*(.095-k*.012),yy],[fx-s*(.088-k*.012),yy-s*.09],[fx+s*(.088-k*.012),yy-s*.09],[fx+s*(.095-k*.012),yy]],'#d8352a');}
   etRect(c,fx-s*.08,fy-s*.92,s*.16,s*.14,3,'#2b3a4a');etDisc(c,fx,fy-s*.85,s*.05,'#fff3b0');etGlow(c,fx,fy-s*.85,s*.3,time==='nit'?'rgba(255,240,170,.55)':'rgba(255,240,170,.25)');
   if(time==='nit'){c.fillStyle='rgba(255,240,170,.14)';c.beginPath();c.moveTo(fx,fy-s*.85);c.lineTo(fx-S*.7,fy-s*1.1);c.lineTo(fx-S*.7,fy-s*.55);c.closePath();c.fill();}}
  else if(find==='illa'){const fx=x,fy=hz+h*.03,s=S*.4;c.fillStyle='#e8c46a';c.beginPath();c.ellipse(fx,fy,s*.6,s*.09,0,Math.PI,TL_TAU);c.fill();c.fillStyle=time==='nit'?'#1f4a3a':'#3f8f4e';c.beginPath();c.ellipse(fx-s*.05,fy-s*.05,s*.42,s*.16,0,Math.PI,TL_TAU);c.fill();
   for(const [dx,hh] of [[-.15,.42],[.12,.5]]){c.fillStyle='#6a4a2a';c.fillRect(fx+s*dx-2,fy-s*hh,4,s*hh);c.fillStyle=time==='nit'?'#1f4a3a':'#2f7a3e';c.beginPath();c.ellipse(fx+s*dx,fy-s*hh,s*.16,s*.07,0,0,TL_TAU);c.fill();}}
  else if(find==='posta'){const col=time==='nit'?'rgba(240,236,255,.5)':'rgba(255,214,140,.6)';c.fillStyle=col;for(let i=0;i<9;i++){const wd=S*(.3-i*.028),yy=hz+h*.015+i*h*.04;c.fillRect(x-wd/2+(still?0:Math.sin(t*1.2+i)*S*.01),yy,wd,h*.012);}etGlow(c,x,hz,S*.35,col);}
  else if(find==='velers'){[[-.12,0,.11],[.04,.02,.08],[.16,-.01,.06]].forEach(([dx,dy,sc],i)=>etBoat(c,x+S*dx,hz+h*(.04+dy),S*sc,still?0:t+i));}
  else{const fx=x,fy=hz+h*.06,s=S*.2;c.fillStyle=time==='nit'?'#3a4a7a':'#3a5a8a';c.beginPath();c.ellipse(fx,fy,s*.5,s*.14,0,Math.PI,TL_TAU);c.fill();etPoly(c,[[fx+s*.42,fy-s*.02],[fx+s*.62,fy-s*.16],[fx+s*.6,fy+s*.02]],c.fillStyle);
   const sp=still?.8:.6+.4*Math.abs(Math.sin(t*.8));c.strokeStyle='rgba(235,245,255,.85)';c.lineWidth=Math.max(2,S*.008);for(const d of [-1,0,1]){c.beginPath();c.moveTo(fx-s*.2,fy-s*.13);c.quadraticCurveTo(fx-s*.2+d*s*.05,fy-s*(.35*sp),fx-s*.2+d*s*.14,fy-s*(.4*sp));c.stroke();}}}
 else if(place==='forest'){const gy=y+h*.92;
  if(find==='cascada'){const fx=x,s=S*.5;etRect(c,fx-s*.35,gy-s*.95,s*.7,s*.95,s*.06,time==='nit'?'#3a3a4a':'#7a6a5a');const fall=time==='nit'?'#8fb4e0':'#bfe6ff';c.fillStyle=fall;c.fillRect(fx-s*.12,gy-s*.9,s*.24,s*.86);
   c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=Math.max(1.5,S*.006);for(let k=0;k<5;k++){const xx=fx-s*.1+k*s*.05,off=still?k*.2:(t*.8+k*.21)%1;c.beginPath();c.moveTo(xx,gy-s*.9+off*s*.3);c.lineTo(xx,gy-s*.9+off*s*.3+s*.35);c.stroke();}
   c.fillStyle=time==='nit'?'#4a6aa8':'#5ab0e8';c.beginPath();c.ellipse(fx,gy,s*.36,s*.07,0,0,TL_TAU);c.fill();etGlow(c,fx,gy-s*.04,s*.25,'rgba(255,255,255,.35)');}
  else if(find==='cabana'){const fx=x,s=S*.26;etRect(c,fx-s*.6,gy-s*.75,s*1.2,s*.75,3,'#9a5a2e');c.strokeStyle='#6a3a1a';c.lineWidth=2;for(let k=1;k<5;k++){c.beginPath();c.moveTo(fx-s*.6,gy-s*.15*k);c.lineTo(fx+s*.6,gy-s*.15*k);c.stroke();}
   etPoly(c,[[fx-s*.78,gy-s*.7],[fx,gy-s*1.25],[fx+s*.78,gy-s*.7]],'#c8442f');etRect(c,fx-s*.14,gy-s*.42,s*.28,s*.42,2,'#4a2a14');etRect(c,fx+s*.26,gy-s*.6,s*.2,s*.18,2,time==='nit'?'#ffd36b':'#bfe6ff');if(time==='nit')etGlow(c,fx+s*.36,gy-s*.51,s*.5,'rgba(255,210,110,.35)');}
  else if(find==='estany'){const fx=x,fy=gy-h*.03,s=S*.45;c.fillStyle=time==='nit'?'#2a4a7a':'#4aa8d8';c.beginPath();c.ellipse(fx,fy,s*.55,s*.12,0,0,TL_TAU);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(fx-s*.12,fy-s*.02,s*.22,s*.03,0,0,TL_TAU);c.fill();
   for(let k=0;k<7;k++){const rx=fx+s*(-.55+k*.06+(k>3?.7:0)),rh=s*(.18+(k%3)*.06);c.strokeStyle='#2e6b2a';c.lineWidth=2.5;c.beginPath();c.moveTo(rx,fy+s*.02);c.lineTo(rx+(still?0:Math.sin(t+k)*2),fy-rh);c.stroke();if(k%3===0){c.fillStyle='#7a4a2a';c.fillRect(rx-2,fy-rh-8,4,10);}}}
  else if(find==='globus'){const fx=x,fy=y+h*(.22-.05*a)+(still?0:Math.sin(t*.9)*S*.01),s=S*.13,cols=['#ff5a4a','#ffd34d','#2a9de8','#ff8ad8'];for(let k=0;k<4;k++){c.fillStyle=cols[k];c.beginPath();c.ellipse(fx,fy,s*(1-k*.25)*.5,s*.62,0,0,TL_TAU);c.fill();}
   c.strokeStyle='#5a3a2a';c.lineWidth=Math.max(1.5,S*.004);c.beginPath();c.moveTo(fx-s*.28,fy+s*.45);c.lineTo(fx-s*.12,fy+s*.85);c.moveTo(fx+s*.28,fy+s*.45);c.lineTo(fx+s*.12,fy+s*.85);c.stroke();etRect(c,fx-s*.14,fy+s*.82,s*.28,s*.2,3,'#9a5a2e');if(time==='nit')etGlow(c,fx,fy+s*.4,s*.6,'rgba(255,190,90,.4)');}
  else{const fx=x,fy=gy-h*.02,s=S*.5;etGlow(c,fx,fy-s*.4,s*.6,time==='nit'?'rgba(180,200,255,.25)':'rgba(255,250,200,.45)');c.fillStyle=time==='nit'?'#2a5a3a':'#8ccf6a';c.beginPath();c.ellipse(fx,fy,s*.6,s*.12,0,0,TL_TAU);c.fill();const r=tlRng(51);for(let k=0;k<26;k++){etDisc(c,fx+(r()-.5)*s*1.1,fy+(r()-.5)*s*.18,S*.008,['#ff5a7a','#ffd34d','#ffffff','#b07aff'][k%4]);}}}
 else if(place==='snow'){const gy=y+h*.8;
  if(find==='refugi'){const fx=x,s=S*.28;etRect(c,fx-s*.6,gy-s*.7,s*1.2,s*.7,3,'#8a8a96');c.fillStyle='#6a6a76';for(let k=0;k<4;k++)for(let q=0;q<3;q++)c.fillRect(fx-s*.55+k*s*.3+(q%2)*s*.15,gy-s*.65+q*s*.22,s*.12,s*.08);
   etPoly(c,[[fx-s*.8,gy-s*.66],[fx,gy-s*1.2],[fx+s*.8,gy-s*.66]],'#5a3a2a');etPoly(c,[[fx-s*.84,gy-s*.66],[fx,gy-s*1.24],[fx+s*.84,gy-s*.66],[fx+s*.7,gy-s*.6],[fx,gy-s*1.1],[fx-s*.7,gy-s*.6]],'#ffffff');
   for(const dx of [-.3,.22])etRect(c,fx+s*dx,gy-s*.45,s*.18,s*.18,2,time==='nit'||time==='tarda'?'#ffd36b':'#bfe6ff');if(time!=='mati')etGlow(c,fx,gy-s*.35,s*.8,'rgba(255,210,110,.3)');}
  else if(find==='glac'){const fx=x,fy=gy+h*.02,s=S*.5;c.fillStyle=time==='nit'?'#8aa8d8':'#bfe3f5';c.beginPath();c.ellipse(fx,fy,s*.6,s*.1,0,0,TL_TAU);c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=2;for(let k=0;k<4;k++){c.beginPath();c.moveTo(fx-s*(.4-k*.2),fy-s*.03);c.lineTo(fx-s*(.3-k*.2),fy+s*.03);c.stroke();}
   etGlow(c,fx-s*.15,fy-s*.02,s*.2,'rgba(255,255,255,.45)');}
  else if(find==='telecabina'){const x0=x-S*.5,y0=y+h*.25,x1=x+S*.5,y1=y+h*.6;c.strokeStyle='#3a3a4a';c.lineWidth=2;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
   for(let k=0;k<3;k++){const q=((still?k/3:(k/3+t*.04))%1),cx=x0+(x1-x0)*q,cy=y0+(y1-y0)*q;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx,cy+S*.05);c.stroke();etRect(c,cx-S*.035,cy+S*.05,S*.07,S*.06,4,'#d8352a');etRect(c,cx-S*.025,cy+S*.06,S*.05,S*.02,2,'#bfe6ff');}}
  else if(find==='nevada'){c.fillStyle='rgba(255,255,255,.9)';const r=tlRng(61);for(let i=0;i<Math.min(420,Math.round(w*h/2200));i++){const sx=x-S*.5+((r()*S+(still?0:t*S*.02))%S),sy=y+((r()*h+(still?0:t*S*.08*(.5+r())))%h);c.beginPath();c.arc(sx,sy,S*(.004+r()*.005),0,TL_TAU);c.fill();}
   for(let k=0;k<3;k++){const px=x+S*(-.2+k*.2),py=gy+h*.05,s=S*.06;etPoly(c,[[px,py-s*3],[px+s,py],[px-s,py]],'#2f6f5a');etPoly(c,[[px,py-s*3],[px+s*.5,py-s*1.6],[px-s*.5,py-s*1.6]],'#ffffff');}}
  else{const fx=x,s=S*.45;etPoly(c,[[fx-s*.5,gy-h*.08],[fx-s*.1,gy-s*1.05],[fx+s*.1,gy-s*.8],[fx+s*.5,gy-h*.08]],time==='nit'?'#a8bce6':'#f0f6ff');etPoly(c,[[fx-s*.1,gy-s*1.05],[fx+s*.1,gy-s*.8],[fx+s*.5,gy-h*.08],[fx+s*.05,gy-h*.08]],time==='tarda'?'#e8a8c0':'#b8cbe6');
   c.strokeStyle='#5a3a2a';c.lineWidth=2;c.beginPath();c.moveTo(fx-s*.1,gy-s*1.05);c.lineTo(fx-s*.1,gy-s*1.25);c.stroke();etPoly(c,[[fx-s*.1,gy-s*1.25],[fx+s*.06,gy-s*1.2],[fx-s*.1,gy-s*1.15]],'#d8352a');}}
 else{const s=S*.3;
  if(find==='anells')etPlanet(c,x+S*.05*Math.sign(x-w/2),y+h*.42,s*.45,time);
  else if(find==='cometa'){const cx=x,cy=y+h*.36;const g=c.createLinearGradient(cx,cy,cx-S*.6,cy-S*.25);g.addColorStop(0,'rgba(200,240,255,.85)');g.addColorStop(1,'rgba(200,240,255,0)');c.fillStyle=g;c.beginPath();c.moveTo(cx,cy-S*.02);c.lineTo(cx-S*.6,cy-S*.3);c.lineTo(cx-S*.6,cy-S*.16);c.lineTo(cx,cy+S*.02);c.fill();etGlow(c,cx,cy,S*.07,'rgba(230,250,255,.9)');etDisc(c,cx,cy,S*.018,'#ffffff');}
  else if(find==='lluna'){const cx=x,cy=y+h*.4,r=s*.6;etGlow(c,cx,cy,r*1.6,'rgba(240,240,255,.25)');etDisc(c,cx,cy,r,'#e8e4dc');for(const [dx,dy,k] of [[-.3,-.2,.16],[.25,.1,.22],[-.05,.35,.12],[.35,-.35,.1]])etDisc(c,cx+r*dx,cy+r*dy,r*k,'#cfc8bc');c.fillStyle='rgba(0,0,30,.22)';c.beginPath();c.arc(cx+r*.3,cy+r*.15,r,0,TL_TAU);c.save();c.clip();c.restore();}
  else if(find==='estel'){const cx=x,cy=y+h*.3,q=still?1:.5+.5*etSmooth(((t*.25)%1));c.strokeStyle='rgba(255,246,210,.85)';c.lineWidth=Math.max(2,S*.008);c.beginPath();c.moveTo(cx-S*.35*q,cy-S*.12*q);c.lineTo(cx,cy);c.stroke();etGlow(c,cx,cy,S*.05,'rgba(255,250,220,.9)');
   const r=tlRng(71);for(let k=0;k<14;k++)etDisc(c,cx+S*(.05+r()*.25),cy+S*(r()-.5)*.3,S*(.004+r()*.006),'#fff6d0');}
  else{const cx=x,cy=y+h*.42;[['rgba(255,110,190,.35)',-.12,0,.42],['rgba(120,200,255,.3)',.1,.06,.38],['rgba(255,210,120,.25)',0,-.1,.3]].forEach(([col,dx,dy,r])=>etGlow(c,cx+S*dx,cy+S*dy,S*r,col));}}
 c.restore();}
// The route of the vehicle (u from 0 to 1): four shapes; routes 1 and 3 go from right to left, with the discovery on the left.
export function etRoute(place,route,u){const dir=route%2?-1:1,X=v=>dir>0?v:1-v,x=X(.08+.46*u);let y;
 if(place==='sea')y=[.74,.74+.035*Math.sin(u*TL_TAU*1.5),.84-.14*u,.76+.05*Math.sin(u*Math.PI*2)][route];
 else if(place==='forest')y=[.66,.62,.7,.6][route];
 else if(place==='snow')y=[.62+.2*u,.6+.18*u+.03*Math.sin(u*9),.7+.12*u,.64+.16*u*u][route];
 else y=[.62-.3*u,.4+.12*Math.sin(u*Math.PI),.7-.36*u,.35+.25*u][route];
 return {x,y,dir};}
// The trip, full screen, at time T (seconds since the choice; ET_TRIP or more is the still end).
// d: the decor setting (escDecor, 0.17). The place is the decor of the trip: atenuat, under a veil; without it, the vehicle and the
// discovery travel on the base colour.
export function etTrip(c,x,y,w,h,place,round,T,s,trip=round,d=etDecor(s)){const R=etRound(round,place,trip),still=!!s.reduced,t=still?0:T,S=Math.min(w,h);
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 const u=etSmooth((T-.6)/(ET_ARRIVE-.6)),fu=etSmooth((T-3.6)/2.4),p=etRoute(place,R.route,u),dir=p.dir;
 // the forest and the space keep what never moves in a sheet; only the light, the stars and what travels are drawn each frame
 if(d.fade<=0){c.fillStyle=d.base;c.fillRect(x,y,w,h);}
 else if(!still&&(place==='forest'||place==='space')){tlSheet(c,['et-place',w,h,place,R.time,dir].join('|'),q=>etPlace(q,place,x,y,w,h,R.time,{t:0,still:true,door:false,side:dir,part:'static'}));etPlace(c,place,x,y,w,h,R.time,{t,still,door:false,side:dir,part:'live'});}
 else etPlace(c,place,x,y,w,h,R.time,{t,still,door:false,side:dir});
 const fx=x+w*(dir>0?.78:.22),bridge=()=>{if(place==='forest'){const by=y+h*p.y;c.fillStyle='#7a4a24';c.fillRect(x,by+S*.012,w,S*.02);c.strokeStyle='#6a3a1a';c.lineWidth=Math.max(2,S*.008);for(let k=0;k<=Math.ceil(w/(S*.12));k++){const bx=x+k*S*.12;c.beginPath();c.moveTo(bx,by+S*.03);c.lineTo(bx+S*.06,y+h);c.moveTo(bx+S*.12,by+S*.03);c.lineTo(bx+S*.06,y+h);c.stroke();}}};
 if(d.full){etFind(c,place,R.find,fx,y,w,h,R.time,fu,t,still);bridge();}else{if(d.fade>0){bridge();escVeil(c,d,x,y,w,h);}etFind(c,place,R.find,fx,y,w,h,R.time,fu,t,still);}
 const vx=x+w*p.x,vy=y+h*p.y,u0=Math.min(u,.99),q0=etRoute(place,R.route,u0),q1=etRoute(place,R.route,u0+.01),slope=Math.atan2((q1.y-q0.y)*h,Math.abs(q1.x-q0.x)*w||1e-6);
 c.save();c.translate(vx,vy);c.scale(dir,1);if(place==='sea')etBoat(c,0,0,S*.16,t);else if(place==='forest')etTrainShape(c,0,0,S*.34,-1,t,!still);else if(place==='snow')etSled(c,0,0,S*.16,slope);else etRocket(c,0,0,S*.2,slope,t);c.restore();
 if(d.full&&(still||T>=ET_TRIP))tlGrain(c,x,y,w,h,.12);c.restore();}
const etDecor=s=>escDecor({background:s.background,base:s.base,opacity:s.opacity});
// ---------- the hall ----------
// d: the decor setting. The hall is the decor of the board: atenuat, under a veil; without it, the base colour, and the doors stand on it.
function etHall(c,w,h,time,plain,zones,d){const H=h-TL_STRIP,top=zones.length?Math.min(...zones.map(z=>z.y)):H*.2,bottom=zones.length?Math.max(...zones.map(z=>z.y+z.h)):H*.85;
 if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,h);if(!plain){c.fillStyle='rgba(20,16,30,.88)';c.fillRect(0,H,w,h-H);}return {bottom};}
 c.fillStyle=plain?ET_HALL[time][1]:etV(c,0,H,ET_HALL[time]);c.fillRect(0,0,w,h);if(plain){escVeil(c,d,0,0,w,h);return {bottom};}
 c.fillStyle=etShade(ET_HALL[time][2],-.06);const pw=Math.max(8,w*.01);for(let k=0;k<=8;k++)c.fillRect(k*w/8-pw/2,0,pw,bottom);
 const iron=ET_IRON[time],roof=Math.max(40,top*.48);c.fillStyle=iron;c.beginPath();c.moveTo(0,0);c.lineTo(w,0);c.lineTo(w,roof);c.quadraticCurveTo(w/2,-roof*.15,0,roof);c.fill();
 c.strokeStyle=etShade(iron,.18);c.lineWidth=3;for(let k=1;k<12;k++){c.beginPath();c.moveTo(k*w/12,0);c.lineTo(k*w/12,roof*(1-.85*Math.sin(Math.PI*k/12)));c.stroke();}
 const cr=Math.max(18,Math.min(46,(top-roof)*.42)),cx=w/2,cy=roof+(top-roof)*.5;if(top-roof>cr*1.6){etDisc(c,cx,cy,cr,iron);etDisc(c,cx,cy,cr*.82,time==='nit'?'#ffeec0':'#fff3d6');c.strokeStyle=iron;c.lineWidth=Math.max(2,cr*.07);c.lineCap='round';
  for(let k=0;k<12;k++){const a=k*TL_TAU/12;c.beginPath();c.moveTo(cx+Math.cos(a)*cr*.64,cy+Math.sin(a)*cr*.64);c.lineTo(cx+Math.cos(a)*cr*.76,cy+Math.sin(a)*cr*.76);c.stroke();}
  c.lineWidth=Math.max(2.5,cr*.09);const hr=[8,3,10][ET_TIMES_INDEX(time)];c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.sin(hr/12*TL_TAU)*cr*.4,cy-Math.cos(hr/12*TL_TAU)*cr*.4);c.moveTo(cx,cy);c.lineTo(cx,cy-cr*.6);c.stroke();}
 if(time==='nit')for(let k=0;k<5;k++){const lx=w*(.1+k*.2),ly=roof+12;c.strokeStyle=etShade(iron,.2);c.lineWidth=2;c.beginPath();c.moveTo(lx,roof*.8);c.lineTo(lx,ly);c.stroke();etGlow(c,lx,ly+8,Math.max(30,w*.04),'rgba(255,214,140,.55)');etDisc(c,lx,ly+8,5,'#ffe6a8');}
 c.fillStyle=ET_FLOOR[time];c.fillRect(0,bottom,w,H-bottom);c.strokeStyle=etShade(ET_FLOOR[time],-.08);c.lineWidth=2;for(let k=-12;k<=12;k++){c.beginPath();c.moveTo(w/2+k*w*.047,bottom);c.lineTo(w/2+k*w*.117,H);c.stroke();}
 for(let k=0;k<4;k++){const yy=bottom+(H-bottom)*(k*k/16+k*.12);c.beginPath();c.moveTo(0,yy);c.lineTo(w,yy);c.stroke();}
 escVeil(c,d,0,0,w,H);c.fillStyle='rgba(20,16,30,.88)';c.fillRect(0,H,w,h-H);return {bottom};}
const ET_TIMES_INDEX=time=>time==='mati'?0:time==='tarda'?1:2;
function etDoor(c,zone,place,time,plain){const g=zone.inner,frame=ET_FRAME[place]||'#2a78c4';c.fillStyle=frame;c.beginPath();etPathPts(c,zone.pts);c.fill();
 c.fillStyle=etShade(frame,-.25);c.beginPath();c.moveTo(g.x-zone.frame*.4,g.y+g.h);c.lineTo(g.x-zone.frame*.4,g.y+g.w/2);c.arc(g.x+g.w/2,g.y+g.w/2,g.w/2+zone.frame*.4,Math.PI,0);c.lineTo(g.x+g.w+zone.frame*.4,g.y+g.h);c.closePath();c.fill();
 c.save();c.beginPath();etPathPts(c,zone.glass);c.clip();
 if(plain){c.fillStyle=etShade(frame,.25);c.fillRect(g.x,g.y,g.w,g.h);etSymbol(c,place,g.x,g.y,g.w,g.h,frame);}else{etPlace(c,place,g.x,g.y,g.w,g.h,time,{t:0,still:true,door:true});etGlassLines(c,g,frame);}
 c.restore();etHandles(c,g);}
function etGlassLines(c,g,frame){c.fillStyle='rgba(255,255,255,.12)';c.beginPath();c.moveTo(g.x+g.w*.15,g.y);c.lineTo(g.x+g.w*.35,g.y);c.lineTo(g.x+g.w*.05,g.y+g.h);c.lineTo(g.x-g.w*.15,g.y+g.h);c.fill();
 c.strokeStyle=etShade(frame,-.35);c.lineWidth=Math.max(3,g.w*.022);c.beginPath();c.moveTo(g.x+g.w/2,g.y+g.w/2);c.lineTo(g.x+g.w/2,g.y+g.h);c.moveTo(g.x,g.y+g.w/2);c.lineTo(g.x+g.w,g.y+g.w/2);c.stroke();}
function etHandles(c,g){const r=Math.max(3,g.w*.022);etDisc(c,g.x+g.w/2-r*2.4,g.y+g.h*.62,r,'#ffd36b');etDisc(c,g.x+g.w/2+r*2.4,g.y+g.h*.62,r,'#ffd36b');}
function etPathPts(c,pts){c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();}
// The simple scene: one flat symbol per door instead of the landscape.
function etSymbol(c,place,x,y,w,h,frame){const S=Math.min(w,h),cx=x+w/2,cy=y+h*.55,col=etShade(frame,-.3);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=Math.max(4,S*.05);c.lineCap='round';
 if(place==='sea')for(let k=0;k<3;k++){c.beginPath();for(let i=0;i<=20;i++){const xx=cx-S*.32+i*S*.032,yy=cy+(k-1)*S*.18+Math.sin(i*.9)*S*.035;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.stroke();}
 else if(place==='forest')etPoly(c,[[cx,cy-S*.38],[cx+S*.26,cy+S*.16],[cx-S*.26,cy+S*.16]],col);
 else if(place==='snow')etPoly(c,[[cx-S*.36,cy+S*.2],[cx,cy-S*.32],[cx+S*.36,cy+S*.2]],col);
 else{etDisc(c,cx,cy,S*.18,col);c.beginPath();c.ellipse(cx,cy,S*.36,S*.08,-.35,0,TL_TAU);c.stroke();}}
function etTrainOnFloor(c,w,H,bottom,time,t,still){const s=Math.min(w*.16,(H-bottom)*1.6);if(s<40)return;etTrainShape(c,w/2+s*.35,bottom+(H-bottom)*.72,s,1,t,!still&&time!=='x');c.fillStyle='rgba(40,30,30,.5)';c.fillRect(w/2-s*.4,bottom+(H-bottom)*.72+s*.05,s*1.05,Math.max(2,s*.02));}
// The board: hall and doors from the sheet; then the door in focus comes alive, throws its light on the floor, and the veil and the
// contour of the focus go on top.
export function etBoard(c,w,h,state,game,s,view){const R=etRound(state.round||0,'sea'),time=R.time,plain=!!s.plainScene,places=view.options.map(o=>o.value),zones=view.zones,H=h-TL_STRIP,t=s.reduced?0:view.clock||0,d=view.decor||etDecor(s);
 let floor={bottom:H*.85};tlSheet(c,['et',w,h,time,plain,places.join()].join('|')+escDecorKey(d)+(d.fade>0?'':'|none'+d.base),x=>{floor=etHall(x,w,h,time,plain,zones,d);zones.forEach((z,i)=>etDoor(x,z,places[i],time,plain));if(!plain)tlGrain(x,0,0,w,H,.14);});
 floor.bottom=zones.length?Math.max(...zones.map(z=>z.y+z.h)):H*.85;
 const f=view.focus;if(f>=0&&zones[f]&&!plain&&!s.reduced&&!view.waiting){const z=zones[f],g=z.inner;c.save();c.beginPath();etPathPts(c,z.glass);c.clip();etPlace(c,places[f],g.x,g.y,g.w,g.h,time,{t,still:false,door:true});etGlassLines(c,g,ET_FRAME[places[f]]);tlGrain(c,g.x,g.y,g.w,g.h,.12);c.restore();etHandles(c,g);}
 // the little train of the hall and the light of the doors on the floor belong to the hall
 if(d.fade>0){c.save();c.globalAlpha*=d.fade;etTrainOnFloor(c,w,H,floor.bottom,time,t,!!s.reduced||!!view.waiting);c.restore();}
 zones.forEach((z,i)=>{const l=((view.lights[i]??.6)-.6)*d.fade;if(l<=.002)return;const g=z.inner;c.save();c.globalCompositeOperation=time==='nit'?'lighter':'screen';const lg=c.createLinearGradient(0,g.y+g.h,0,H);lg.addColorStop(0,`rgba(255,232,160,${(l*1.3).toFixed(3)})`);lg.addColorStop(1,'rgba(255,232,160,0)');c.fillStyle=lg;c.beginPath();c.moveTo(g.x,g.y+g.h);c.lineTo(g.x+g.w,g.y+g.h);c.lineTo(g.x+g.w+g.w*.3,H);c.lineTo(g.x-g.w*.3,H);c.closePath();c.fill();c.restore();});
 tlVeil(c,w,H,zones,view.lights,.35*(view.wait??(view.waiting?1:0)));
 if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);}
// The chosen door opens to the whole screen and becomes the trip; at the end (and in the result kept on screen) the trip stays still.
export function etResult(c,w,h,state,game,s,view,T){const zones=view.zones,i=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[i],place=view.place;
 if(T<1&&z){etBoard(c,w,h,state,game,s,{...view,focus:-1,lights:view.lights.map((l,k)=>k===i?1:l),progress:null});const box=tlOpenBox(z,w,h,T);c.save();tlClipOpen(c,z,box);etTrip(c,0,0,w,h,place,state.round||0,T,s,view.trip??state.round??0,view.decor||etDecor(s));c.restore();return;}
 etTrip(c,0,0,w,h,place,state.round||0,T,s,view.trip??state.round??0,view.decor||etDecor(s));}

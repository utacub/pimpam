// Pinta el món (EN25), 0.38: the thirty gags. When a zone is painted, something happens in it once (a goat climbs the peak and a second
// one slips; the bell rings and the pigeons scatter; the scarecrow loses its hat and gets it back; the seal claps; the bear misses the
// trout; the tram startles the cat; the windmill turns the wrong way), and then its life goes on (pinta-vida.js). Each gag is a function
// of g, the seconds since the wash was mostly there (PT_GAG after the zone began to be painted), drawn in sheet units with the anchors
// of its landscape. ptGagSounds gives the sounds of each gag (pintaRec, seconds from the start of the result) and ptAmbience the
// loop that a painted zone adds (natureRec).
import {PTV,ptAmbient} from './pinta-vida.js';
export const PT_GAG=3.3;
const ptE=(a,b,g)=>Math.max(0,Math.min(1,(g-a)/(b-a))),ptSS=(a,b,g)=>{const u=ptE(a,b,g);return u*u*(3-2*u);},ptJump=u=>4*u*(1-u);
const ptAlong=(pts,u)=>{const k=Math.max(0,Math.min(pts.length-1.0001,u*(pts.length-1))),i=Math.floor(k),f=k-i,a=pts[i],b=pts[i+1]||a;return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];};
const ptV=PTV;
// ── La vall ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PT_G_VALL={
 cel(c,A,t,g,season,o){for(let i=0;i<7;i++){const u=ptE(i*.22,i*.22+5.2,g);if(u<=0||u>=1)continue;const x=-60+u*1400,y=130+i*14+Math.sin(u*9+i)*22;ptV.bird(c,x,y,.95,t*8+i,o,1);}
  const u2=ptE(5.6,11.5,g);if(u2>0&&u2<1){const x=1340-u2*1420,y=180+Math.sin(u2*14)*40;ptV.bird(c,x,y,1.05,t*9,o,-1);}},
 fons(c,A,t,g,season,o){const pk=A.peaks[3]||A.peaks[0];const u=ptSS(0,2.4,g);if(u>0){const x=pk[0]+48-u*42,y=pk[1]+40-u*42;ptV.goat(c,x,y,.9,-1,t,o);}
  const v=ptE(2.4,4,g),slip=ptE(4,4.9,g),again=ptSS(5.2,7,g);if(v>0){let x=pk[0]-62+v*36,y=pk[1]+42-v*28;if(slip>0){x-=slip*30*(1-again)+0;y+=slip*24*(1-again);x+=Math.sin(slip*40)*2*(1-slip);}if(again>0){x+=again*6;y-=again*4;}ptV.goat(c,x,y,.85,1,t+1.3,o);}},
 aigua(c,A,t,g,season,o){const bx=A.bridge.x+30,by=A.bridge.y+22;const j=ptE(.4,1.5,g);if(j>0&&j<1){ptV.fish(c,bx-30+j*60,by-ptJump(j)*55,1,(.5-j)*1.6,o);}
  if(g>1.3&&g<4)ptV.ripple(c,bx+30,by+4,8+(g-1.3)*22,Math.max(0,.6-(g-1.3)*.22),o);
  const r=A.river,u0=ptE(2,13,g);if(u0<=0)return;const lag=[0,.06,.11,.17+(Math.sin(g*2)>.3?.04:0)*ptE(5,7,g)];lag.forEach((L,i)=>{const u=Math.max(0,u0-L*(1-u0*.3)),p=ptAlong(r,.1+u*.72),w=i?.55:1,hurry=i===3&&g>7&&g<9?Math.sin(g*20)*2:0;ptV.duck(c,p[0]+Math.sin(g+i)*3+(i?12*i:0),p[1]+hurry,w,-1,t,o,i?ptV.YE:ptV.W);});},
 arbres(c,A,t,g,season,o){const p=A.pine;if(!p)return;const tx=p.x,ty=p.y-p.h*.5;const peck=g>0&&g<3.4?Math.max(0,Math.sin(g*22))*(Math.floor(g*1.2)%2?1:0):0;
  if(g>0){c.save();c.translate(tx-4,ty);ptV.ell(c,0,0,4,7,'rgba(60,54,52,.95)',o,1.1);ptV.ell(c,3-peck*2,-8,3,3,ptV.RD,o,1);c.beginPath();c.moveTo(5-peck*2,-8);c.lineTo(10-peck*3,-7.5);c.lineWidth=1.2;c.strokeStyle=ptV.ink(o);c.stroke();ptV.eye(c,3.5-peck*2,-8.6,.6,o);c.restore();}
  for(const [t0,dx] of [[1.1,12],[2.3,-10]]){const u=ptE(t0,t0+1,g);if(u>0&&u<1){const y=ty+u*u*(p.y-ty+10);ptV.ell(c,tx+dx+u*8,y,3,4.5,ptV.BR,o,1);}}
  const up=ptSS(3.6,5,g),down=ptE(5.3,6.6,g);if(up>0){const y=p.y-up*(p.h*.42)+down*(p.h*.42);ptV.squirrel(c,tx+9,y,.9,down>0?-1:1,o);}},
 poble(c,A,t,g,season,o){const ch=A.church;if(g>0&&g<4){ptV.bell(c,ch.bell[0],ch.bell[1]-14,1,Math.sin(g*7)*.5*(1-g/4),o);}
  for(let i=0;i<6;i++){const u=ptE(.3+i*.12,2.2+i*.3,g);if(u<=0)continue;const roof=A.roofs[i%A.roofs.length],x0=ch.top[0],y0=ch.top[1]+10,x1=roof.x+roof.w*(.2+.6*((i*.37)%1)),y1=roof.y-roof.h-4;
   const x=x0+(x1-x0)*u,y=y0+(y1-y0)*u-ptJump(u)*90;if(u<1)ptV.bird(c,x,y,.8,t*9+i,o,x1>x0?1:-1,ptV.GR);else{c.save();c.translate(x1,y1);ptV.ell(c,0,-4,5,3.2,ptV.GR,o,1);ptV.ell(c,4,-8,2.2,2,ptV.GR,o,.9);c.restore();}}
  const rf=A.roofs[0],cu=ptSS(4,5.2,g);if(cu>0){c.save();c.beginPath();c.rect(rf.x-10,rf.y-rf.h-80,rf.w+20,80);c.clip();const stretch=1+.15*Math.sin(ptE(5.2,6.2,g)*Math.PI);c.translate(rf.x+rf.w*.75,rf.y-rf.h+(1-cu)*30);c.scale(1,stretch);ptV.cat(c,0,0,.85,-1,t,o);c.restore();}},
 camp(c,A,t,g,season,o){const sc=A.scarecrow;const fly=ptE(.3,3,g),land=ptE(3,3.7,g);if(fly>0&&land<1){const x=sc.hat[0]+Math.sin(fly*Math.PI)*120+land*0,y=sc.hat[1]-Math.sin(fly*Math.PI)*90-fly*(1-fly)*40,a=fly*Math.PI*2*(1-land)+Math.sin(land*Math.PI*2)*.3;ptV.hat(c,x,y,sc.s,a,o);}
  else if(g>0){ptV.hat(c,sc.hat[0],sc.hat[1]+(g<=.3?0:Math.max(0,1-(g-3.7)*4)*3),sc.s,0,o);}
  const hay=A.hay[0];for(let i=0;i<4;i++){const u=ptE(1.5+i*.3,5+i*.3,g);if(u<=0)continue;let x=hay.x-10-u*300,dir=-1;if(i===3){const back=ptE(4.2,6.4,g);x=hay.x-10-u*300+back*260;dir=back>0&&back<1?1:-1;if(back>=1)x=hay.x-10-u*300+260-ptE(6.4,8,g)*200,dir=-1;}ptV.hen(c,x,hay.y+hay.r*.9+i*6,.85,dir,t,o,i%2?ptV.W:'rgba(190,120,70,.95)');}}
};
// ── La costa ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PT_G_COSTA={
 cel(c,A,t,g,season,o){const sea=A.water;for(let i=0;i<3;i++){const u=ptE(i*.3,i*.3+6,g);if(u<=0||u>=1)continue;let x=-60+u*1000,y=120+i*30+Math.sin(u*7+i)*20;
   if(i===1){const dive=ptE(2,3,g),up=ptE(3.4,6,g);if(dive>0){x=560+dive*120;y=150+dive*(sea.y0+20-150)-(up>0?up*(sea.y0+20-110):0);x+=up*140;}
    if(dive>=1&&up<=0)ptV.ripple(c,680,sea.y0+22,10+(g-3)*30,.6,o);if(up>0)ptV.fish(c,x+9,y+4,.5,.4,o);}
   ptV.gull(c,x,y,.9,t*6+i,o,1);}},
 fons(c,A,t,g,season,o){const L=A.lighthouse;if(!L)return;if(g>0){const a=.35+.15*Math.sin(t*3);c.save();c.globalAlpha*=a*2;ptV.dot(c,L.lamp[0],L.lamp[1],6,'rgba(255,236,160,.9)');c.restore();const ang=t*.9;ptV.beam(c,L.lamp[0],L.lamp[1],ang,420,.16);ptV.beam(c,L.lamp[0],L.lamp[1],ang+Math.PI,420,.16);}
  const u=ptE(1,2.6,g);if(u>0){const gx=L.lamp[0]+22,gy=L.lamp[1]+6;if(u<1){ptV.gull(c,gx-200+u*200,gy-120+u*120-ptJump(u)*30,.9,t*6,o,1);}else{const ang=(t*.9)%Math.PI,hop=ang<.25?Math.sin(ang/.25*Math.PI)*10:0;c.save();c.translate(gx,gy-hop);ptV.ell(c,0,-4,6,3.4,ptV.W,o,1.1);ptV.ell(c,5,-8,2.6,2.4,ptV.W,o,1);ptV.dot(c,8,-8,1.2,ptV.YE);ptV.eye(c,6,-8.6,.6,o);c.restore();}}},
 aigua(c,A,t,g,season,o){const sea=A.water,sx=sea.x0+(sea.x1-sea.x0)*.42,sy=sea.y0+(sea.y1-sea.y0)*.5;const bu=ptE(2,10,g),bx=sea.x1+60-bu*(sea.x1-sea.x0+160),near=Math.abs(bx-sx)<90;
  const up=ptSS(.4,1.2,g)*(1-ptSS(0,.5,near?1:0))*(near?0:1)+(g>6?1:0)*(near?0:1);const u=near?0:Math.min(1,up);const clap=g>1.2&&g<3.2?Math.abs(Math.sin(g*9)):0;ptV.seal(c,sx,sy,1,u*(g<9.5?1:Math.max(0,1-(g-9.5))),clap,o);
  if(bu>0&&bu<1)ptV.boat(c,bx,sy-6,46,t,o);},
 arbres(c,A,t,g,season,o){const p=A.crowns&&A.crowns[0];if(!p)return;const tx=p.x,base=p.y+p.r*1.3;const up=ptSS(0,1.5,g),down=ptE(2,3,g);if(up>0&&g<3.2){ptV.squirrel(c,tx+6,base-up*(p.r*1.2)+down*(p.r*1.2),.9,down>0?-1:1,o);}
  for(const [t0,dx] of [[1.5,2],[3.5,-14],[4.2,16]]){const u=ptE(t0,t0+.9,g);if(u>0&&u<1){ptV.ell(c,tx+dx,p.y+u*u*(base-p.y),3.5,5,ptV.BR,o,1);}}
  if(g>3.2){ptV.squirrel(c,tx+22,base,.9,1,o);}},
 poble(c,A,t,g,season,o){const ch=A.church;if(ch&&g>0&&g<3.5)ptV.bell(c,ch.bell[0],ch.bell[1]-12,.8,Math.sin(g*8)*.45*(1-g/3.5),o);
  const rf=A.roofs[0];if(!rf)return;const u=ptSS(1,5,g);if(u>0){const x=rf.x+rf.w-6-u*(rf.w*.7),y=rf.y-rf.h-2;c.save();c.beginPath();c.rect(rf.x-10,rf.y-rf.h-70,rf.w+20,70);c.clip();if(u<1){c.translate(x,y);c.scale(-1,1);ptV.cat(c,0,0,.8,1,t,o);}else ptV.cat(c,x,y,.8,-1,t,o);c.restore();}},
 camp(c,A,t,g,season,o){const um=A.umbrella;if(um){const open=ptSS(0,.7,g),gust=ptE(2,2.6,g)*(1-ptE(2.6,3.4,g));ptV.umbrella(c,um.x,um.y,1,open,-.35*gust,o);}
  const b=A.field,u=ptSS(.5,5,g);if(u>0){const x=b.x1-40-u*(b.x1-b.x0)*.5,y=b.y0+(b.y1-b.y0)*.55;ptV.crab(c,x,y,.9,u<1?t:0,o);}}
};
// ── L’alta muntanya ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const PT_G_MUNTANYA={
 cel(c,A,t,g,season,o){if(g<=0)return;const dive=ptE(4,5.2,g),up=ptE(5.2,7,g);const ph=t*.25,r=320;let x=640+Math.cos(ph)*r,y=130+Math.sin(ph*2)*40;if(dive>0&&up<1){y+=dive*150-up*150;x+=dive*80;}ptV.eagle(c,x,y,1.1-up*.15,t*2.2,o);},
 fons(c,A,t,g,season,o){const R=A.rocks||[];const duck=ptE(4.4,4.8,g)*(1-ptE(5.8,6.3,g));R.slice(0,2).forEach((r,i)=>{const up=ptSS(i*1.2,i*1.2+.6,g),wh=g>.6+i*1.2&&g<1.6+i*1.2?Math.sin(g*30)*.08:0;c.save();c.translate(0,wh*20);ptV.marmot(c,r[0],r[1],.9,up*(1-duck),o);c.restore();});},
 aigua(c,A,t,g,season,o){const p=A.pool,b=A.bear;if(!p)return;const j1=ptE(.3,1.3,g),j2=ptE(4,4.9,g);
  if(b){const walk=ptSS(1,3.5,g);if(walk>0){const x=b.x+(1-walk)*120,lift=ptE(3.5,4.3,g)*(1-ptE(4.9,5.6,g));ptV.bear(c,x,b.y,1,-1,lift,o);}}
  for(const [j,dx] of [[j1,0],[j2,-20]])if(j>0&&j<1)ptV.fish(c,p.x-40+dx+j*80,p.y-ptJump(j)*(dx?70:52),1,(.5-j)*1.6,o);
  if(g>1.3&&g<3)ptV.ripple(c,p.x+40,p.y,6+(g-1.3)*26,Math.max(0,.6-(g-1.3)*.3),o);if(g>4.9&&g<6.4)ptV.ripple(c,p.x+20,p.y,6+(g-4.9)*26,Math.max(0,.6-(g-4.9)*.3),o);},
 arbres(c,A,t,g,season,o){const f=A.crowns&&A.crowns[0];if(!f)return;const tx=f.x,ty=f.y-f.r*.2;const peck=g>0&&g<3.4?Math.max(0,Math.sin(g*22))*(Math.floor(g*1.2)%2?1:0):0;
  if(g>0){c.save();c.translate(tx+f.r*.3,ty);ptV.ell(c,0,0,4,7,'rgba(60,54,52,.95)',o,1.1);ptV.ell(c,-3+peck*2,-8,3,3,ptV.RD,o,1);c.beginPath();c.moveTo(-5+peck*2,-8);c.lineTo(-10+peck*3,-7.5);c.lineWidth=1.2;c.strokeStyle=ptV.ink(o);c.stroke();ptV.eye(c,-3.5+peck*2,-8.6,.6,o);c.restore();}
  for(const [t0,dx] of [[1.1,-18],[2.4,20],[2.7,-6]]){const u=ptE(t0,t0+.9,g);if(u>0&&u<1){const y=ty+u*u*(f.r*1.4);if(season===3)ptV.flake(c,tx+dx,y,5*(1-u*.5),.95);else ptV.ell(c,tx+dx,y,3,4.5,ptV.BR,o,1);}}},
 poble(c,A,t,g,season,o){const ch=A.church;if(ch&&g>0&&g<3.5)ptV.bell(c,ch.bell[0],ch.bell[1]-12,.8,Math.sin(g*8)*.45*(1-g/3.5),o);
  for(let i=0;i<2;i++){const u=ptE(.4+i*.3,3+i*.3,g);if(u>0&&u<1&&ch)ptV.bird(c,ch.top[0]-20+i*40+u*(i?260:-260),ch.top[1]-u*120-ptJump(u)*40,.8,t*9+i,o,i?1:-1);}},
 camp(c,A,t,g,season,o){const m=A.field;for(let i=0;i<2;i++){const u=ptSS(i*.6,4+i*.6,g);if(u<=0)continue;const x=m.x1+30-u*(m.x1-m.x0)*(.42+i*.16),y=m.y0+(m.y1-m.y0)*(.45+i*.25);const lie=i===0?ptSS(4.5,5.3,g):0;c.save();c.translate(x,y);c.scale(1,1-lie*.35);ptV.cow(c,0,0,1-i*.1,-1,t+i,o);c.restore();}}
};
// ── La ciutat vora el mar ────────────────────────────────────────────────────────────────────────────────────────────────────────
const PT_G_CIUTAT={
 cel(c,A,t,g,season,o){const pr=A.field;const rise=ptSS(0,3,g);if(rise<=0)return;const x=pr.x0+(pr.x1-pr.x0)*.3+rise*120+Math.sin(g*1.1)*40*rise,y=pr.y0-20-rise*(pr.y0-140)+Math.sin(g*2)*14*rise;ptV.kite(c,x,y,1.1,Math.sin(g*1.3)*.35,t,'rgba(80,150,220,.95)',o);
  c.save();c.globalAlpha*=.5;c.beginPath();c.moveTo(pr.x0+(pr.x1-pr.x0)*.3,pr.y0-6);c.quadraticCurveTo((x+pr.x0+(pr.x1-pr.x0)*.3)/2+20,(y+pr.y0)/2+40,x,y+16);c.lineWidth=.8;c.strokeStyle=ptV.ink(o);c.stroke();c.restore();},
 fons(c,A,t,g,season,o){const f=A.funicular;if(!f)return;const jolt=ptE(3,3.4,g)*(1-ptE(3.4,4.2,g));const u=Math.max(0,Math.min(1,ptE(0,8,g)-jolt*.03));for(const [k,w] of [[u,1],[1-u,-1]]){const x=f.x0+(f.x1-f.x0)*k,y=f.y0+(f.y1-f.y0)*k;ptV.cabin(c,x,y,22,o);}},
 aigua(c,A,t,g,season,o){const lane=A.shipLane;if(!lane)return;const u=ptSS(0,9,g);if(u>0){const x=lane.x1+120-u*(lane.x1-lane.x0+240),y=lane.y+Math.sin(t*1.1)*1.5;c.save();c.translate(x,y);ptV.poly(c,[[-60,0],[60,0],[52,-16],[-52,-16]],'rgba(70,80,110,.95)',o,1.3);ptV.poly(c,[[-26,-16],[26,-16],[26,-34],[-26,-34]],ptV.W,o,1.2);ptV.poly(c,[[6,-34],[18,-34],[18,-48],[6,-48]],ptV.RD,o,1.1);c.restore();if(g<6)ptV.smoke(c,x+12,y-48,t,.9,o,4,.4);}
  for(let i=0;i<5;i++){const v=ptE(.3+i*.15,2.5+i*.2,g);if(v>0&&v<1)ptV.gull(c,lane.x0+60+i*50+v*(i%2?200:-150),lane.y-20-v*150-ptJump(v)*40,.8,t*7+i,o,i%2?1:-1);}},
 arbres(c,A,t,g,season,o){const pk=A.field2||A.park;if(!pk)return;const gx=pk.x0+(pk.x1-pk.x0)*.5,gy=pk.y1-10;const run=ptSS(.5,3,g);
  for(let i=0;i<5;i++){const up=ptE(.6+i*.08,2.4+i*.1,g),dn=ptSS(3.6+i*.15,5.5+i*.15,g);let x=gx-40+i*20,y=gy-2;if(up>0){x+=up*(i%2?160:-160)*(1-dn*.5);y-=up*140-ptJump(up)*30;y+=dn*140*0;if(dn>0)y=gy-2-(1-dn)*(140-ptJump(up)*30);}
   if(up>0&&dn<1)ptV.bird(c,x,y,.8,t*9+i,o,i%2?1:-1,ptV.GR);else{c.save();c.translate(x,y);ptV.ell(c,0,-4,5,3.2,ptV.GR,o,1);ptV.ell(c,4,-8,2.2,2,ptV.GR,o,.9);c.restore();}}
  if(run>0){const x=pk.x0+20+run*(gx-pk.x0-40);ptV.dog(c,x,gy,1,1,run<1?t:0,o);}
  if(A.carousel&&g>0){const cz=A.carousel;c.save();c.translate(cz.x,cz.y);c.rotate(0);for(let k=0;k<6;k++){const a=t*1.2+k*Math.PI/3,x=Math.cos(a)*cz.r,y=Math.sin(a)*cz.r*.3;ptV.ell(c,x,y-8-Math.sin(a*2)*3,5,3,['rgba(230,90,70,.95)','rgba(80,150,220,.95)','rgba(242,200,70,.95)'][k%3],o,1);}c.restore();}},
 poble(c,A,t,g,season,o){const st=A.street;if(!st)return;const u=ptSS(0,5,g);if(u>0){ptV.tram(c,Math.max(st.x0+70,st.x1+80-u*(st.x1-st.x0+160)),st.y,80,o,o.dark||season===3);}
  const rf=A.roofs[0];if(rf){const startle=ptE(2,2.3,g)*(1-ptE(3.2,4,g));c.save();c.beginPath();c.rect(rf.x-10,rf.y-rf.h-80,rf.w+20,80);c.clip();c.translate(rf.x+rf.w*.5,rf.y-rf.h+(g>0?0:40)-startle*10);c.scale(1,1+startle*.25);ptV.cat(c,0,0,.85,1,t,o);c.restore();}},
 camp(c,A,t,g,season,o){const pr=A.field;const u=ptE(0,6.5,g);if(u>0&&u<1){const x=pr.x0-40+u*(pr.x1-pr.x0+80),y=pr.y0+(pr.y1-pr.y0)*.6;ptV.cyclist(c,x,y,1,t,o);const d=ptE(.5,7,g);ptV.dog(c,x-70+Math.sin(g*3)*10,y,.9,1,t,o);}}
};
// ── El llac i els volcans ────────────────────────────────────────────────────────────────────────────────────────────────────────
const PT_G_LLAC={
 cel(c,A,t,g,season,o){const rise=ptSS(0,5,g);if(rise<=0)return;const cl=A.clouds&&A.clouds[1];let x=300+rise*120+ptE(5,12,g)*500,y=(A.horizon||450)-40-rise*260;if(cl){const bump=ptE(5.5,6.3,g)*(1-ptE(6.3,7.2,g));y+=bump*22;}ptV.balloon(c,x,y+Math.sin(t)*5,.9,o);},
 fons(c,A,t,g,season,o){const vc=A.volcanoes&&A.volcanoes[0];if(!vc)return;for(let k=0;k<3;k++){const u=ptE(k*.8,k*.8+2.6,g);if(u>0&&u<1)ptV.puff(c,vc.x+Math.sin(u*4+k)*8,vc.y-10-u*70,6+u*14,.45*(1-u),o);}
  const big=ptE(2.4,5.6,g);if(big>0&&big<1)ptV.puff(c,vc.x,vc.y-14-big*110,12+big*40,.5*(1-big),o);const cr=ptE(3,5.5,g);if(cr>0&&cr<1)ptV.bird(c,vc.x+cr*260,vc.y-30-cr*150+Math.sin(cr*12)*10,1,t*9,o,1,'rgba(40,36,36,.95)');},
 aigua(c,A,t,g,season,o){const b=A.boat;if(!b)return;const j1=ptE(.5,1.3,g),rock=ptE(1.3,3.3,g)*(1-ptE(1.3,3.3,g))*4,j2=ptE(3.5,4.3,g);c.save();c.translate(b.x,b.y);c.rotate(Math.sin(g*14)*.12*rock);c.translate(-b.x,-b.y);
  ptV.poly(c,[[b.x-b.w/2,b.y-8],[b.x+b.w/2,b.y-8],[b.x+b.w*.36,b.y+4],[b.x-b.w*.36,b.y+4]],'rgba(150,100,60,.95)',o,1.3);ptV.stroke(c,[[b.x-b.w*.3,b.y-8],[b.x+b.w*.3,b.y-8]],o,1);c.restore();
  if(j1>0&&j1<1)ptV.fish(c,b.x-70+j1*70,b.y-ptJump(j1)*60-4,1,(.5-j1)*1.6,o);if(j2>0&&j2<1)ptV.fish(c,b.x+j2*70,b.y-ptJump(j2)*60-4,1,-(.5-j2)*1.6+.4,o);
  if(g>4.3&&g<6)ptV.ripple(c,b.x+70,b.y+2,6+(g-4.3)*26,Math.max(0,.6-(g-4.3)*.3),o);
  const du=ptE(5,14,g);if(du>0){const w=A.water;for(let i=0;i<3;i++){ptV.duck(c,w.x1-60-du*(w.x1-w.x0)*.6-i*22,w.y0+(w.y1-w.y0)*.6+i*5,i?.6:.9,-1,t,o,i?ptV.YE:ptV.W);}}},
 arbres(c,A,t,g,season,o){const wd=A.wood;if(!wd)return;const out=ptSS(0,1.8,g),back=ptSS(3,4.5,g);if(out<=0)return;const x=wd.x-out*160+back*160,snort=g>1.8&&g<3?Math.sin(g*18)*2:0;c.save();if(g>1.8&&g<3){c.translate(0,snort);}ptV.boar(c,x,wd.y,1,back>0?1:-1,out<1||back>0&&back<1?t:0,o);c.restore();},
 poble(c,A,t,g,season,o){const f=A.farm;if(!f)return;if(g>0){const crow=g<1.2?Math.sin(g*5)*.2:0;c.save();c.translate(f.roof[0],f.roof[1]);c.rotate(-crow);ptV.hen(c,0,0,.9,-1,0,o,'rgba(190,80,60,.95)');c.restore();}
  for(let i=0;i<3;i++){const sc=ptE(.6,1.6,g),rg=ptSS(3,5.5,g);const x=f.x+20+i*22+sc*(i-1)*60*(1-rg),y=f.y+10+i*4;if(g>0)ptV.hen(c,x,y,.8,i%2?1:-1,sc<1||rg>0&&rg<1?t:0,o,i===1?'rgba(190,120,70,.95)':ptV.W);}},
 camp(c,A,t,g,season,o){const ms=A.windmills||[];ms.forEach((m,i)=>{if(g<=0)return;const acc=ptSS(0,2.5,g);let ang;if(i===1){const stut=Math.floor(g*2)%3===0?.3:1;ang=-(acc*g*.9+Math.sin(g*6)*.08*(1-acc))*stut-acc*Math.PI*.1;}else ang=acc*g*1.1;ptV.windmillArms(c,m.hub[0],m.hub[1],m.arm,ang,o);});}
};
const PT_GAGS=[PT_G_VALL,PT_G_COSTA,PT_G_MUNTANYA,PT_G_CIUTAT,PT_G_LLAC];
// The life of a painted zone: its gag, then the life of the season.
export function ptVida(c,land,season,zone,A,t,age,o){const gag=PT_GAGS[land%5]?.[zone];const g=(o.reduced?Math.min(age,PT_GAG+12):age)-PT_GAG;
 if(gag&&g>0){c.save();gag(c,A,o.reduced?0:t,g,season,o);c.restore();}
 if(!o.plain||age>PT_GAG)ptAmbient(c,land,season,zone,A,t,age,o);}
// The sounds of a gag (pintaRec variants), at seconds from the start of the result (the wash starts at 0).
const ptSnd=(...l)=>l.map(([name,at,gain=.8])=>({name,at,gain}));
const PT_SOUNDS=[
 {cel:ptSnd(),fons:ptSnd(['cabra',4.2],['esquellots',5.6,.6]),aigua:ptSnd(['peix',3.9],['anec',6.2,.7]),arbres:ptSnd(['picot',3.5],['picot',4.7]),poble:ptSnd(['campana',3.4,.7],['coloms',3.9,.6],['gat',7.4,.7]),camp:ptSnd(['gallina',4.9,.8])},
 {cel:ptSnd(['gavines',3.5,.7]),fons:ptSnd(['gavines2',4.6,.6]),aigua:ptSnd(['foca',3.8]),arbres:ptSnd(['gota',5.0,.5]),poble:ptSnd(['ermita',3.4,.7],['gat',6.2,.6]),camp:ptSnd(['peix',3.9,.5])},
 {cel:ptSnd(),fons:ptSnd(['marmota',3.5],['marmota',4.8,.8]),aigua:ptSnd(['peix',3.6],['os',6.9,.8]),arbres:ptSnd(['picot',3.5],['picot',4.8]),poble:ptSnd(['ermita',3.4,.7]),camp:ptSnd(['vaca',3.6,.8],['esquellots',4.6,.7])},
 {cel:ptSnd(['gavines2',4.5,.5]),fons:ptSnd(['ermita',3.6,.5]),aigua:ptSnd(['sirena',3.4],['gavines',4.0,.6],['sirena',5.2,.7]),arbres:ptSnd(['coloms',4.0,.7]),poble:ptSnd(['tramvia',3.4],['gat',6.4,.7]),camp:ptSnd(['gavines2',4.0,.5])},
 {cel:ptSnd(),fons:ptSnd(['corb',5.8,.8]),aigua:ptSnd(['peix',3.8],['peix',6.8,.8],['anec',8.6,.6]),arbres:ptSnd(['senglar',3.6],['senglar',5.2,.8]),poble:ptSnd(['gallina',3.5,.8]),camp:ptSnd(['moli',3.4,.7])}];
export function ptGagSounds(land,zone,season){return PT_SOUNDS[land%5]?.[zone]||[];}
// The loop a painted zone adds to the air (natureRec variants with their level and low-pass), or null.
export function ptAmbience(land,season,zone){const L=land%5;const A=(name,level,lowpass=12000)=>({name,level,lowpass});
 if(zone==='aigua')return [A('brook',.3),A('waves',.32),A('ptTorrent',.32),A('waves',.2),season<2?A('frogs',.22):A('waves',.12,3000)][L];
 if(zone==='camp'){if(L===4)return A('ptMoli',.3);if(L===1)return season===3?A('wind',.18,600):A('waves',.14,2500);return [A('meadow',.28),A('ptCigales',.3,7000),A('crickets',.22),A('wind',.2,600)][season];}
 if(zone==='arbres')return [A('blackbird',.28),L===1||L===0?A('ptCigales',.26,7000):A('blackbird',.22),A('wind',.14,800),null][season];
 if(zone==='poble')return A('ptColoms',.22,6000);
 if(zone==='cel')return season===3||L===2?A('wind',.16,500):null;
 if(zone==='fons')return L===2&&season===3?A('wind',.14,500):null;
 return null;}

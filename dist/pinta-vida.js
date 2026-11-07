// Pinta el món (EN25), 0.38: the life of the painted page. A small library of ink-and-wash creatures and things (PTV), drawn in sheet
// units into a context already mapped to the sheet; the life of the seasons that every painted zone keeps (ptAmbient: birds, sparkles,
// smoke, leaves, snow); and the four finales of the seasons (ptFinal), over the whole page when the sixth zone is painted. The gags
// of the zones are in pinta-gags.js. Faces only on creatures, never on things.
import {PT_ZONES} from './pinta.js';
const PT_TAU=Math.PI*2;
export const PTV=(()=>{
 const ink=o=>o.dark?'rgba(222,216,205,.92)':'rgba(40,32,30,.92)';
 const line=(c,pts,close)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(close)c.closePath();};
 const stroke=(c,pts,o,w=1.3,close=false)=>{line(c,pts,close);c.lineWidth=w;c.strokeStyle=ink(o);c.stroke();};
 const poly=(c,pts,col,o,w=1.3)=>{line(c,pts,true);if(col){c.fillStyle=col;c.fill();}if(o){c.lineWidth=w;c.strokeStyle=ink(o);c.stroke();}};
 const ell=(c,x,y,rx,ry,col,o,w=1.3,rot=0)=>{c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,PT_TAU);if(col){c.fillStyle=col;c.fill();}if(o){c.lineWidth=w;c.strokeStyle=ink(o);c.stroke();}};
 const dot=(c,x,y,r,col)=>{c.beginPath();c.arc(x,y,r,0,PT_TAU);c.fillStyle=col;c.fill();};
 const eye=(c,x,y,r,o)=>dot(c,x,y,r,ink(o));
 const W='rgba(250,248,242,.96)',K='rgba(54,46,44,.92)',BR='rgba(132,88,52,.9)',OR='rgba(232,140,48,.95)',YE='rgba(242,200,70,.95)',GR='rgba(150,150,158,.92)',RD='rgba(206,70,52,.92)';
 const flap=(ph,a=.7)=>Math.sin(ph)*a;
 // a small bird in flight (swallow): two wing curves, a forked tail; dir ±1
 function bird(c,x,y,s,ph,o,dir=1,col=null){const f=flap(ph);c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.4/s;c.strokeStyle=ink(o);
  if(col){c.fillStyle=col;c.beginPath();c.ellipse(0,0,6,2.6,0,0,PT_TAU);c.fill();}
  c.beginPath();c.moveTo(-10,-f*7);c.quadraticCurveTo(-5,-f*2-1.5,0,0);c.quadraticCurveTo(5,-f*2-1.5,10,-f*7);c.stroke();c.beginPath();c.moveTo(-5,.5);c.lineTo(-10,3.5);c.moveTo(-5,.5);c.lineTo(-9,-1.5);c.stroke();c.restore();}
 // a gull: white body, long wings, yellow beak
 function gull(c,x,y,s,ph,o,dir=1){const f=flap(ph,.5);c.save();c.translate(x,y);c.scale(dir*s,s);ell(c,0,0,7,3,W,o,1.2/s);c.lineWidth=1.5/s;c.strokeStyle=ink(o);
  c.beginPath();c.moveTo(-3,-1);c.quadraticCurveTo(-10,-4-f*8,-18,-2-f*10);c.moveTo(3,-1);c.quadraticCurveTo(10,-4-f*8,18,-2-f*10);c.stroke();dot(c,7.5,-1.2,1.6,YE);eye(c,5.2,-1.6,.7,o);c.restore();}
 // an eagle, wide wings with fingers
 function eagle(c,x,y,s,ph,o){const f=flap(ph,.35);c.save();c.translate(x,y);c.scale(s,s);ell(c,0,0,9,3.4,K,o,1.2/s);c.fillStyle=K;c.lineWidth=1.3/s;c.strokeStyle=ink(o);
  for(const d of [-1,1]){c.beginPath();c.moveTo(d*4,-1);c.quadraticCurveTo(d*16,-6-f*10,d*30,-3-f*14);c.lineTo(d*28,2-f*10);c.quadraticCurveTo(d*16,2-f*6,d*4,2);c.closePath();c.fill();c.stroke();}
  c.beginPath();c.moveTo(-9,0);c.lineTo(-13,3);c.lineTo(-13,-3);c.closePath();c.fill();dot(c,10,-.5,1.4,YE);c.restore();}
 // a fish (a trout), tilted by a; silver blue
 function fish(c,x,y,s,a,o){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);ell(c,0,0,9,3.6,'rgba(170,196,212,.95)',o,1.2/s);poly(c,[[-8,0],[-14,-5],[-14,5]],'rgba(170,196,212,.95)',o,1.2/s);eye(c,5,-.8,.8,o);c.beginPath();c.moveTo(-2,-2.5);c.quadraticCurveTo(2,-4.5,5,-2.5);c.lineWidth=1/s;c.strokeStyle=ink(o);c.stroke();c.restore();}
 // a duck with its wake; dir ±1 (the way it swims); k scales ducklings
 function duck(c,x,y,s,dir,t,o,col=W){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);c.globalAlpha*=.6;c.beginPath();c.moveTo(-9,2);c.lineTo(-24,-3);c.moveTo(-9,3);c.lineTo(-22,7);c.stroke();c.globalAlpha/=.6;
  ell(c,0,0,9,4.5,col,o,1.2/s);ell(c,8,-7,3.6,3.4,col,o,1.2/s);poly(c,[[11,-7],[16,-6],[11,-5]],OR,o,1/s);eye(c,9,-8,.8,o);c.beginPath();c.moveTo(-8,-2);c.lineTo(-13,-6);c.stroke();c.restore();}
 // chimney smoke: puffs that rise, drift and fade
 function smoke(c,x,y,t,s,o,n=4,a=.4){for(let k=0;k<n;k++){const ph=((t*.3+k/n)%1),px=x+Math.sin(k*2.1+ph*4)*7*s*ph*2,py=y-ph*70*s,r=(3+ph*11)*s;c.globalAlpha*=a*(1-ph)*Math.min(1,ph*8);c.beginPath();c.arc(px,py,r,0,PT_TAU);c.fillStyle=o.dark?'rgba(200,200,210,1)':'rgba(120,112,118,1)';c.fill();c.globalAlpha/=Math.max(1e-6,a*(1-ph)*Math.min(1,ph*8));}}
 // a sitting cat seen from the side, tail swishing; dir ±1
 function cat(c,x,y,s,dir,t,o,col=K){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);
  c.beginPath();c.moveTo(-7,-2);c.quadraticCurveTo(-18,-4+Math.sin(t*2.2)*8,-14,-14+Math.sin(t*2.2)*5);c.lineWidth=2.6/s;c.stroke();c.lineWidth=1.2/s;
  ell(c,0,-8,7,8,col,o,1.2/s);ell(c,2,-18,5,4.6,col,o,1.2/s);poly(c,[[-2,-21],[-3.5,-26],[0,-22]],col,o,1/s);poly(c,[[4,-22],[6.5,-26.5],[7,-21]],col,o,1/s);
  const e=o.dark?'rgba(40,32,30,1)':'rgba(236,220,120,1)';dot(c,0,-19,1.1,e);dot(c,4.2,-19,1.1,e);c.restore();}
 // a goat on a rock, dir ±1; k: head nod
 function goat(c,x,y,s,dir,t,o){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);const nod=Math.sin(t*3)*1.5;
  for(const [lx,ly] of [[-6,0],[-3,0],[5,0],[8,0]]){c.beginPath();c.moveTo(lx,-6);c.lineTo(lx+ly,0);c.stroke();}
  ell(c,0,-10,10,5.5,W,o,1.2/s);ell(c,10,-14+nod,4,3.6,W,o,1.2/s);c.beginPath();c.moveTo(9,-17+nod);c.quadraticCurveTo(7,-23+nod,10,-25+nod);c.moveTo(12,-17+nod);c.quadraticCurveTo(13,-23+nod,15,-24+nod);c.stroke();
  c.beginPath();c.moveTo(12,-11+nod);c.lineTo(12,-7+nod);c.stroke();c.beginPath();c.moveTo(-10,-11);c.lineTo(-13,-15);c.stroke();eye(c,11,-15+nod,.7,o);c.restore();}
 // a marmot standing up out of a rock; u: how far out (0..1)
 function marmot(c,x,y,s,u,o){if(u<=0)return;c.save();c.beginPath();c.rect(x-40*s,y-60*s,80*s,60*s);c.clip();c.translate(x,y+(1-u)*26*s);c.scale(s,s);
  ell(c,0,-8,7,11,BR,o,1.2/s);ell(c,0,-20,5.5,5,BR,o,1.2/s);ell(c,-4,-24,1.6,1.6,BR,o,1/s);ell(c,4,-24,1.6,1.6,BR,o,1/s);eye(c,-2,-21,.8,o);eye(c,2,-21,.8,o);dot(c,0,-18.5,1,K);
  ell(c,-5,-9,2,3,BR,o,1/s);ell(c,5,-9,2,3,BR,o,1/s);c.restore();}
 // a seal out of the water; u: how far out; clap: flippers angle
 function seal(c,x,y,s,u,clap,o){if(u<=0)return;c.save();c.beginPath();c.rect(x-60*s,y-80*s,120*s,80*s);c.clip();c.translate(x,y+(1-u)*34*s);c.scale(s,s);
  c.beginPath();c.moveTo(-10,0);c.quadraticCurveTo(-12,-24,0,-30);c.quadraticCurveTo(12,-24,10,0);c.closePath();c.fillStyle=GR;c.fill();c.lineWidth=1.2/s;c.strokeStyle=ink(o);c.stroke();
  ell(c,0,-30,6,5.4,GR,o,1.2/s);eye(c,-2.4,-31,.9,o);eye(c,2.4,-31,.9,o);dot(c,0,-28,1.2,K);c.beginPath();c.moveTo(-3,-27.5);c.lineTo(-7,-26);c.moveTo(3,-27.5);c.lineTo(7,-26);c.lineWidth=.8/s;c.stroke();
  for(const d of [-1,1]){c.save();c.translate(d*9,-14);c.rotate(d*(.4-clap*.9));ell(c,d*5,0,6,2.4,GR,o,1.1/s);c.restore();}c.restore();}
 // a hen walking; dir ±1
 function hen(c,x,y,s,dir,t,o,col=W){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.1/s;c.strokeStyle=ink(o);const st=Math.sin(t*14);
  c.beginPath();c.moveTo(-2,-3);c.lineTo(-2+st*2,0);c.moveTo(2,-3);c.lineTo(2-st*2,0);c.stroke();ell(c,0,-8,7,5,col,o,1.1/s);poly(c,[[-6,-9],[-12,-14],[-9,-8]],col,o,1/s);
  ell(c,6,-14,3,3,col,o,1.1/s);poly(c,[[8.5,-14],[12,-13],[8.5,-12]],YE,o,.9/s);poly(c,[[4,-17],[6,-19.5],[8,-17]],RD,o,.9/s);dot(c,7,-12.5,1,RD);eye(c,6.6,-14.6,.7,o);c.restore();}
 // a cow, dir ±1; bell at the neck
 function cow(c,x,y,s,dir,t,o){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);const g=Math.sin(t*1.5)*1.2;
  for(const lx of [-9,-5,6,10]){c.beginPath();c.moveTo(lx,-8);c.lineTo(lx,0);c.stroke();}ell(c,0,-16,14,8,W,o,1.2/s);
  c.fillStyle=K;c.beginPath();c.ellipse(-4,-16,5,4,.3,0,PT_TAU);c.fill();c.beginPath();c.ellipse(7,-19,3.5,3,0,0,PT_TAU);c.fill();
  ell(c,15,-13+g,5,4,W,o,1.2/s);ell(c,18,-12+g,3,2.2,'rgba(230,190,180,.95)',o,1/s);c.beginPath();c.moveTo(12,-17+g);c.quadraticCurveTo(10,-21+g,13,-21+g);c.moveTo(17,-17+g);c.quadraticCurveTo(19,-21+g,16,-22+g);c.stroke();eye(c,15.5,-14.5+g,.7,o);
  c.beginPath();c.moveTo(-14,-17);c.quadraticCurveTo(-18,-12,-16,-5);c.stroke();poly(c,[[11,-10+g],[14,-10+g],[13.5,-6+g],[11.5,-6+g]],YE,o,.9/s);c.restore();}
 // a small sailing boat, bobbing
 function boat(c,x,y,w,t,o,sail=W,hull=RD){const b=Math.sin(t*1.3)*1.5,r=Math.sin(t*1.3+1)*.05;c.save();c.translate(x,y+b);c.rotate(r);
  poly(c,[[-w/2,0],[w/2,0],[w*.4,w*.16],[-w*.42,w*.16]],hull,o,1.2);stroke(c,[[0,0],[0,-w*.8]],o,1.4);poly(c,[[1,-w*.78],[w*.36,-w*.12],[1,-w*.12]],sail,o,1.1);poly(c,[[-1,-w*.7],[-w*.26,-w*.12],[-1,-w*.12]],sail,o,1.1);c.restore();}
 // a tram, dir ±1; windows lit at night
 function tram(c,x,y,w,o,lit=false){const h=w*.42;c.save();c.translate(x,y);poly(c,[[-w/2,-h],[w/2,-h],[w/2+3,-h*.4],[w/2,0],[-w/2,0],[-w/2-3,-h*.4]],'rgba(214,88,56,.95)',o,1.3);
  for(let i=0;i<5;i++){const wx=-w/2+w*.08+i*w*.17;c.fillStyle=lit?'rgba(255,224,150,.95)':'rgba(200,220,232,.9)';c.fillRect(wx,-h*.9,w*.13,h*.42);c.lineWidth=1;c.strokeStyle=ink(o);c.strokeRect(wx,-h*.9,w*.13,h*.42);}
  c.fillStyle=ink(o);c.fillRect(-w/2,-h*.38,w,h*.1);for(const wx of [-w*.3,w*.3]){ell(c,wx,2,w*.05,w*.05,K,o,1);}stroke(c,[[0,-h],[w*.08,-h*1.4],[w*.06,-h*1.55]],o,1.3);c.restore();}
 // a funicular cabin on a slope line from (x0,y0) to (x1,y1) at u
 function cabin(c,x,y,w,o){c.save();c.translate(x,y);poly(c,[[-w/2,-w*.5],[w/2,-w*.5],[w/2,0],[-w/2,0]],'rgba(232,180,70,.95)',o,1.2);c.fillStyle='rgba(200,222,236,.9)';c.fillRect(-w*.38,-w*.42,w*.76,w*.22);c.strokeStyle=ink(o);c.lineWidth=1;c.strokeRect(-w*.38,-w*.42,w*.76,w*.22);stroke(c,[[0,-w*.5],[0,-w*.75]],o,1.3);c.restore();}
 // a leaf (an ellipse with a midrib), a petal, a snowflake, a ripple
 function leaf(c,x,y,s,a,col,o){c.save();c.translate(x,y);c.rotate(a);ell(c,0,0,5*s,2.4*s,col,o,.8);c.beginPath();c.moveTo(-5*s,0);c.lineTo(5*s,0);c.lineWidth=.7;c.strokeStyle=ink(o);c.globalAlpha*=.7;c.stroke();c.restore();}
 function petal(c,x,y,s,a,col){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.ellipse(0,0,3.6*s,2.2*s,0,0,PT_TAU);c.fillStyle=col;c.fill();c.restore();}
 function flake(c,x,y,r,a=.85){c.beginPath();c.arc(x,y,r,0,PT_TAU);c.fillStyle=`rgba(255,255,255,${a})`;c.fill();}
 function ripple(c,x,y,r,a,o){c.beginPath();c.ellipse(x,y,r,r*.32,0,0,PT_TAU);c.lineWidth=1;c.strokeStyle=o.dark?`rgba(230,230,240,${a})`:`rgba(60,70,90,${a})`;c.stroke();}
 function sparkle(c,x,y,l,a){c.beginPath();c.moveTo(x-l,y);c.lineTo(x+l,y);c.lineWidth=1.2;c.strokeStyle=`rgba(255,255,255,${a})`;c.stroke();}
 // a butterfly: two pairs of wings flapping about the body
 function butterfly(c,x,y,s,t,col,o){const f=Math.abs(Math.cos(t*9));c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=.9/s;c.strokeStyle=ink(o);for(const d of [-1,1]){c.save();c.scale(d*Math.max(.15,f),1);ell(c,5,-3,5,4,col,o,.9/s);ell(c,4,3,3.6,3,col,o,.9/s);c.restore();}c.beginPath();c.moveTo(0,-5);c.lineTo(0,5);c.lineWidth=1.3/s;c.stroke();c.restore();}
 // the beam of a lighthouse from its lamp
 function beam(c,x,y,ang,len,a){c.save();c.translate(x,y);c.rotate(ang);const g=c.createLinearGradient(0,0,len,0);g.addColorStop(0,`rgba(255,240,170,${a})`);g.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(len,-len*.11);c.lineTo(len,len*.11);c.closePath();c.fill();c.restore();}
 // a straw hat (the scarecrow's), tilted by a
 function hat(c,x,y,s,a,o){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);ell(c,0,0,17,4,YE,o,1.2/s);poly(c,[[-9,-1],[-7,-12],[7,-12],[9,-1]],YE,o,1.2/s);c.beginPath();c.moveTo(-8,-4);c.lineTo(8,-4);c.lineWidth=1.6/s;c.strokeStyle=RD;c.stroke();c.restore();}
 // a kite with a wavy tail; a: tilt
 function kite(c,x,y,s,a,t,col,o){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);poly(c,[[0,-14],[9,0],[0,16],[-9,0]],col,o,1.2/s);stroke(c,[[0,-14],[0,16]],o,.9/s);stroke(c,[[-9,0],[9,0]],o,.9/s);
  c.beginPath();c.moveTo(0,16);for(let i=1;i<=6;i++)c.lineTo(Math.sin(t*6+i)*5,16+i*7);c.lineWidth=1.1/s;c.strokeStyle=ink(o);c.stroke();c.restore();}
 // a hot-air balloon with its basket
 function balloon(c,x,y,s,o,col='rgba(222,96,70,.95)',col2=YE){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(0,-62);c.bezierCurveTo(34,-62,34,-10,6,8);c.lineTo(-6,8);c.bezierCurveTo(-34,-10,-34,-62,0,-62);c.closePath();c.fillStyle=col;c.fill();c.lineWidth=1.3/s;c.strokeStyle=ink(o);c.stroke();
  c.save();c.clip();c.fillStyle=col2;c.fillRect(-9,-70,7,90);c.fillRect(5,-70,7,90);c.restore();c.stroke();stroke(c,[[-6,8],[-5,20],[5,20],[6,8]],o,1/s);poly(c,[[-6,20],[6,20],[5,28],[-5,28]],BR,o,1.1/s);c.restore();}
 // a puff of volcano smoke (a soft ring)
 function puff(c,x,y,r,a,o){c.beginPath();c.arc(x,y,r,0,PT_TAU);c.fillStyle=o.dark?`rgba(190,180,190,${a})`:`rgba(110,100,112,${a})`;c.fill();}
 // a crab walking sideways; legs stepping
 function crab(c,x,y,s,t,o){c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.1/s;c.strokeStyle=ink(o);const st=Math.sin(t*12)*2;for(let i=0;i<3;i++)for(const d of [-1,1]){c.beginPath();c.moveTo(d*6,-2+i*2);c.lineTo(d*(13+i*2),2+i*2+(i%2?st:-st)*d);c.stroke();}
  ell(c,0,-3,9,6,RD,o,1.2/s);for(const d of [-1,1]){ell(c,d*11,-9,3.6,3,RD,o,1.1/s);c.beginPath();c.moveTo(d*13,-11);c.lineTo(d*15,-13);c.stroke();}eye(c,-3,-7,1,o);eye(c,3,-7,1,o);c.restore();}
 // a beach umbrella; u: how open (0 closed, 1 open); a: tilt
 function umbrella(c,x,y,s,u,a,o){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);stroke(c,[[0,0],[0,-52]],o,1.4/s);const r=4+36*u;c.beginPath();c.moveTo(-r,-52+r*.18);for(let i=0;i<=6;i++){const px=-r+i*(r*2/6);c.quadraticCurveTo(px-r/6,-52+r*.18-Math.sqrt(Math.max(0,r*r-(px-r/6)**2))*.55,px,-52+r*.18-Math.sqrt(Math.max(0,r*r-px*px))*.5);}c.closePath();
  c.fillStyle=RD;c.fill();c.lineWidth=1.2/s;c.strokeStyle=ink(o);c.stroke();c.save();c.clip();c.fillStyle=W;for(let i=-3;i<=3;i+=2)c.fillRect(i*r/3.5-r/7,-100,r/3.5,100);c.restore();c.restore();}
 // a bell hanging from (x,y), swinging by a
 function bell(c,x,y,s,a,o){c.save();c.translate(x,y);c.rotate(a);c.scale(s,s);c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(-3,10,-9,16);c.lineTo(9,16);c.quadraticCurveTo(3,10,3,0);c.closePath();c.fillStyle=YE;c.fill();c.lineWidth=1.2/s;c.strokeStyle=ink(o);c.stroke();dot(c,0,17.5,2,K);c.restore();}
 // the arms of a windmill about its hub
 function windmillArms(c,x,y,r,ang,o){c.save();c.translate(x,y);c.rotate(ang);for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);stroke(c,[[0,0],[0,-r]],o,2);poly(c,[[2,-r*.2],[r*.22,-r*.3],[r*.2,-r*.92],[2,-r*.98]],'rgba(250,246,236,.9)',o,1.1);for(let k=1;k<4;k++)stroke(c,[[2,-r*(.2+k*.19)],[r*.21,-r*(.3+k*.16)]],o,.7);c.restore();}dot(c,0,0,3,K);c.restore();}
 // a squirrel on a trunk; dir ±1 (facing), up: tail up
 function squirrel(c,x,y,s,dir,o){c.save();c.translate(x,y);c.scale(dir*s,s);ell(c,0,-6,5,7,'rgba(178,96,52,.95)',o,1.1/s);ell(c,3,-14,3.6,3.2,'rgba(178,96,52,.95)',o,1.1/s);c.beginPath();c.moveTo(-5,-2);c.bezierCurveTo(-16,-4,-16,-22,-6,-20);c.bezierCurveTo(-10,-14,-9,-8,-5,-7);c.closePath();c.fillStyle='rgba(178,96,52,.95)';c.fill();c.lineWidth=1.1/s;c.strokeStyle=ink(o);c.stroke();eye(c,4,-15,.7,o);c.restore();}
 // a bear, dir ±1, standing on four paws; lift: a fore paw raised
 function bear(c,x,y,s,dir,lift,o){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);const B='rgba(104,72,46,.95)';for(const lx of [-10,-5,7]){ell(c,lx,-4,3,4.5,B,o,1.1/s);}ell(c,12,-4-lift*12,3,4.5,B,o,1.1/s);
  ell(c,0,-16,16,10,B,o,1.2/s);ell(c,16,-20,6.5,5.6,B,o,1.2/s);ell(c,13,-26,2,2,B,o,1/s);ell(c,19,-26,2,2,B,o,1/s);ell(c,21,-19,2.6,2,'rgba(60,40,30,.95)',o,.9/s);eye(c,17,-21.5,.8,o);c.restore();}
 // a wild boar running; dir ±1
 function boar(c,x,y,s,dir,t,o){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);const st=Math.sin(t*16)*3,B='rgba(92,78,66,.95)';for(const [lx,d] of [[-8,1],[-4,-1],[6,1],[9,-1]]){c.beginPath();c.moveTo(lx,-6);c.lineTo(lx+st*d,0);c.stroke();}
  c.beginPath();c.moveTo(-12,-10);c.quadraticCurveTo(-6,-20,8,-16);c.lineTo(16,-10);c.lineTo(14,-5);c.lineTo(-10,-5);c.closePath();c.fillStyle=B;c.fill();c.stroke();poly(c,[[10,-12],[18,-9],[17,-6],[10,-7]],B,o,1/s);c.beginPath();c.moveTo(17,-8);c.lineTo(20,-10);c.stroke();eye(c,13,-11,.7,o);c.beginPath();c.moveTo(-12,-9);c.quadraticCurveTo(-15,-12,-14,-16);c.stroke();c.restore();}
 // a dog running; dir ±1
 function dog(c,x,y,s,dir,t,o,col='rgba(200,150,90,.95)'){c.save();c.translate(x,y);c.scale(dir*s,s);c.lineWidth=1.1/s;c.strokeStyle=ink(o);const st=Math.sin(t*16)*4;for(const [lx,d] of [[-6,1],[-3,-1],[5,1],[8,-1]]){c.beginPath();c.moveTo(lx,-6);c.lineTo(lx+st*d,0);c.stroke();}
  ell(c,0,-9,9,4.5,col,o,1.1/s);ell(c,9,-13,4,3.4,col,o,1.1/s);poly(c,[[7,-16],[5,-20],[9,-15]],col,o,.9/s);c.beginPath();c.moveTo(-8,-10);c.quadraticCurveTo(-13,-16+Math.sin(t*12)*3,-10,-18);c.stroke();eye(c,10,-14,.6,o);dot(c,13,-12.5,1,K);c.restore();}
 // a cyclist; wheels turn with t
 function cyclist(c,x,y,s,t,o,col='rgba(60,110,170,.95)'){c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=1.2/s;c.strokeStyle=ink(o);for(const wx of [-9,9]){c.beginPath();c.arc(wx,0,7,0,PT_TAU);c.stroke();for(let k=0;k<3;k++){const a=t*7+k*Math.PI/3;c.beginPath();c.moveTo(wx+Math.cos(a)*7,Math.sin(a)*7);c.lineTo(wx-Math.cos(a)*7,-Math.sin(a)*7);c.lineWidth=.6/s;c.stroke();}c.lineWidth=1.2/s;}
  stroke(c,[[-9,0],[-2,-9],[8,-9],[9,0]],o,1.3/s);stroke(c,[[-2,-9],[0,-2],[8,-9]],o,1.3/s);stroke(c,[[0,-2],[0,-8]],o,1.3/s);
  const p=t*7;c.beginPath();c.moveTo(0,-2);c.lineTo(Math.cos(p)*3,-2+Math.sin(p)*3);c.stroke();
  poly(c,[[-6,-12],[-1,-14],[3,-24],[-2,-25]],col,o,1.1/s);stroke(c,[[-1,-13],[8,-10]],o,1.2/s);stroke(c,[[-2,-24],[2,-21],[8,-10]],o,1.1/s);ell(c,-1,-29,3.8,3.8,'rgba(236,200,170,.95)',o,1.1/s);eye(c,.6,-29.5,.6,o);poly(c,[[-4.5,-30],[-3,-34],[3,-34],[4,-30]],RD,o,1/s);c.restore();}
 // a ball
 function ball(c,x,y,r,o){ell(c,x,y,r,r,RD,o,1.2);c.beginPath();c.arc(x,y,r,-.6,.6);c.lineWidth=2;c.strokeStyle=W;c.stroke();}
 // a rainbow, centred at (x,y) with outer radius r; a: alpha
 function rainbow(c,x,y,r,a){const cols=['255,80,70','255,160,50','250,230,70','90,190,100','70,140,230','140,90,200'];c.save();c.lineWidth=Math.max(2,r*.028);cols.forEach((col,i)=>{c.beginPath();c.arc(x,y,r-i*c.lineWidth,Math.PI,0);c.strokeStyle=`rgba(${col},${a})`;c.stroke();});c.restore();}
 function star(c,x,y,r,a){c.beginPath();c.arc(x,y,r,0,PT_TAU);c.fillStyle=`rgba(255,250,220,${a})`;c.fill();}
 // a warm window glow
 function glow(c,x,y,w,h,a){c.fillStyle=`rgba(255,214,120,${a})`;c.fillRect(x,y,w,h);}
 return {ink,line,stroke,poly,ell,dot,eye,W,K,BR,OR,YE,GR,RD,bird,gull,eagle,fish,duck,smoke,cat,goat,marmot,seal,hen,cow,boat,tram,cabin,leaf,petal,flake,ripple,sparkle,butterfly,beam,hat,kite,balloon,puff,crab,umbrella,bell,windmillArms,squirrel,bear,boar,dog,cyclist,ball,rainbow,star,glow};})();
// A deterministic pseudo-random for the particles: the same index always falls the same way.
const ptH=(i,k=0)=>{let x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x);};
const PT_LEAF=['rgba(214,120,48,.92)','rgba(190,70,40,.9)','rgba(232,176,60,.92)','rgba(160,110,50,.9)'];
// ── The seasonal life every painted zone keeps ──────────────────────────────────────────────────────────────────────────────────
// Drawn in sheet units. A: the anchors of the landscape (pinta-terres*.js). t: the clock; age: seconds since the zone was painted.
export function ptAmbient(c,land,season,zone,A,t,age,o){const V=PTV,fade=Math.min(1,Math.max(0,(age-4)/3));if(fade<=0)return;c.save();c.globalAlpha*=fade;const T=o.reduced?0:t;
 if(zone==='cel'){const y0=Math.min(A.horizon||450,(A.skyLow||(A.horizon||450)));
  if(season===3){for(let i=0;i<48;i++){const sp=.35+ptH(i)*.5,x=((ptH(i,1)*1300+T*18*sp)%1340)-20,y=((ptH(i,2)*y0+T*26*sp)%(y0+10))-5;V.flake(c,x,y,1.4+ptH(i,3)*1.6,.7);}}
  else if(season===2){for(let i=0;i<3;i++){const ph=T*.08+i*.37,x=200+i*380+Math.sin(ph*2)*120,y=90+i*40+Math.sin(ph*3.1)*22;V.bird(c,x,y,.75,T*5+i,o,1);}}
  else{const n=season===0?5:3;for(let i=0;i<n;i++){const ph=T*.11+i*1.3,r=70+i*25,x=640+Math.cos(ph)*(260+i*60),y=120+i*30+Math.sin(ph*2)*r*.4;V.bird(c,x,y,.8+(i%2)*.2,T*7+i*2,o,Math.cos(ph)>0?-1:1);}}}
 else if(zone==='aigua'&&(A.waterLine||A.water)){for(let i=0;i<22;i++){const ph=(T*.25+ptH(i))%1,a=.65*Math.sin(ph*Math.PI);if(a<=0)continue;let x,y;if(A.waterLine){const wl=A.waterLine,q=wl[Math.floor(ptH(i,1)*(wl.length-1))];x=q.x+(ptH(i,2)-.5)*q.w*.8;y=q.y;}else{const w=A.water;x=w.x0+ptH(i,1)*(w.x1-w.x0);y=w.y0+ptH(i,2)*(w.y1-w.y0);}V.sparkle(c,x+ph*14,y,3+ptH(i,3)*5,a*(o.dark?.9:.75));}}
 else if(zone==='arbres'){if(season===2&&A.crowns){for(let i=0;i<10;i++){const cr=A.crowns[i%A.crowns.length],ph=(T*.14+ptH(i))%1,x=cr.x+(ptH(i,1)-.5)*cr.r*1.4+Math.sin(ph*6+i)*18,y=cr.y-cr.r*.4+ph*(cr.r*2.4+40);V.leaf(c,x,y,.9,ph*7+i,PT_LEAF[i%4],o);}}
  if(season===0&&A.crowns){for(let i=0;i<8;i++){const cr=A.crowns[i%A.crowns.length],ph=(T*.1+ptH(i,4))%1,x=cr.x+(ptH(i,5)-.5)*cr.r*2+Math.sin(ph*5+i)*25,y=cr.y-cr.r*.3+ph*(cr.r*2.4+40);V.petal(c,x,y,1,ph*5,'rgba(250,214,224,.92)');}}
  if(season===1&&A.crowns){for(let i=0;i<4;i++){const cr=A.crowns[(i*2)%A.crowns.length],x=cr.x+Math.sin(T*.9+i*2)*cr.r*.8,y=cr.y+Math.cos(T*.7+i)*cr.r*.5;V.butterfly(c,x,y,.8,T+i,['rgba(250,220,90,.95)','rgba(240,250,255,.95)','rgba(230,120,160,.95)','rgba(120,170,240,.95)'][i%4],o);}}}
 else if(zone==='poble'){const ch=(A.chimneys||[]).slice(0,season===1?1:3);ch.forEach((p,i)=>V.smoke(c,p[0],p[1],T+i*2.3,1,o,4,season===3?.5:.35));
  if(season===3&&A.windows&&(o.dark||true)){const lit=A.windows.filter((_,i)=>ptH(i,9)<.55);c.globalAlpha*=o.dark?.95:.55;for(const w of lit)V.glow(c,w[0],w[1],w[2]||8,w[3]||10,.8);c.globalAlpha/=o.dark?.95:.55;}}
 else if(zone==='camp'&&A.field){const f=A.field;
  if(season===1||season===0){const n=season===1?6:3;for(let i=0;i<n;i++){const x=f.x0+ptH(i,6)*(f.x1-f.x0)+Math.sin(T*.8+i*2)*40,y=f.y0+ptH(i,7)*(f.y1-f.y0)*.8+Math.cos(T*.6+i)*18;V.butterfly(c,x,y,.7+ptH(i,8)*.4,T*1.1+i,['rgba(250,220,90,.95)','rgba(240,250,255,.95)','rgba(230,120,160,.95)','rgba(120,170,240,.95)'][i%4],o);}}
  if(season===2){for(let i=0;i<16;i++){const sp=.6+ptH(i)*.6,x=((ptH(i,1)*1400+T*70*sp)%1400)-60,y=f.y0+ptH(i,2)*(f.y1-f.y0)+Math.sin(T*2+i)*12;if(x>f.x0-40&&x<f.x1+40)V.leaf(c,x,y,.9,T*3+i,PT_LEAF[i%4],o);}}
  if(season===3){for(let i=0;i<40;i++){const sp=.35+ptH(i)*.5,x=((ptH(i,1)*1400+T*16*sp)%1400)-60,y=f.y0-30+((ptH(i,2)*(f.y1-f.y0+30)+T*24*sp)%(f.y1-f.y0+30));if(x>f.x0-40&&x<f.x1+40)V.flake(c,x,y,1.3+ptH(i,3)*1.5,.7);}}}
 else if(zone==='fons'&&season===3&&A.ridge){for(let i=0;i<14;i++){const p=A.ridge[Math.floor(ptH(i,2)*(A.ridge.length-1))],a=.5+.5*Math.sin(T*2.5+i*1.7);V.flake(c,p[0]+(ptH(i,3)-.5)*30,p[1]+8+ptH(i,4)*30,1.2,a*.8);}}
 c.restore();}
// ── The finales of the seasons ──────────────────────────────────────────────────────────────────────────────────────────────────
// Over the whole page, when the sixth zone is painted: u runs 0..1 over the finale (fade in, hold, fade out before the page turn).
// Spring: a rainbow over the landscape and a drift of blossom with the swallows. Summer: the golden hour, butterflies everywhere and a
// kite (a balloon over the lake). Autumn: the wind takes the leaves across the page under a skein of geese. Winter: snow over
// everything, the windows light up one after another, and stars on a dark decor.
export function ptFinal(c,land,season,A,t,u,o){const V=PTV,m=o.m,env=Math.min(1,u*5,(1-u)*5),T=o.reduced?0:t;if(env<=0)return;c.save();c.transform(m[0],0,0,m[1],m[2],m[3]);c.globalAlpha*=env;const H=A.horizon||450;
 if(season===0){c.save();if(o.sky){c.beginPath();o.sky.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip();}V.rainbow(c,640,H+60,560,.42*env);c.restore();for(let i=0;i<70;i++){const sp=.5+ptH(i)*.7,x=((ptH(i,1)*1500+T*55*sp)%1500)-100,y=((ptH(i,2)*900+T*28*sp)%900)-40;V.petal(c,x,y,.9+ptH(i,3)*.6,T*2+i,i%3?'rgba(250,214,224,.9)':'rgba(255,255,255,.9)');}
  for(let i=0;i<6;i++){const ph=T*.35+i*1.05,x=640+Math.cos(ph)*(380+i*30),y=150+i*18+Math.sin(ph*2)*40;V.bird(c,x,y,1,T*8+i,o,Math.cos(ph)>0?-1:1);}}
 else if(season===1){const g=c.createRadialGradient(1000,60,20,1000,60,760);g.addColorStop(0,'rgba(255,214,120,.34)');g.addColorStop(1,'rgba(255,214,120,0)');c.fillStyle=g;c.fillRect(-20,-20,1340,860);
  const F=A.field||{y0:H,y1:800};for(let i=0;i<14;i++){const x=80+ptH(i,1)*1120+Math.sin(T*.8+i*2)*50,y=F.y0-50+ptH(i,2)*(F.y1-F.y0)+Math.cos(T*.6+i)*22;V.butterfly(c,x,y,.9+ptH(i,3)*.5,T*1.1+i,['rgba(250,220,90,.95)','rgba(240,250,255,.95)','rgba(230,120,160,.95)','rgba(120,170,240,.95)'][i%4],o);}
  const rise=Math.min(1,u*1.6);if(land===4)V.balloon(c,900-u*160,H-40-rise*300+Math.sin(T)*6,1,o);else V.kite(c,300+u*300+Math.sin(T*1.3)*30,H-80-rise*260+Math.sin(T*2)*14,1.1,Math.sin(T*1.3)*.3,T,'rgba(230,90,70,.95)',o);}
 else if(season===2){for(let i=0;i<110;i++){const sp=.7+ptH(i)*.8,x=((ptH(i,1)*1600+T*170*sp)%1600)-160,y=((ptH(i,2)*820+Math.sin(T*1.4+i)*30+T*20*sp)%860)-20;V.leaf(c,x,y,.9+ptH(i,3)*.6,T*4*sp+i,PT_LEAF[i%4],o);}
  for(let i=0;i<9;i++){const k=i-4,x=1500-u*1900+Math.abs(k)*34,y=120+Math.abs(k)*22;V.bird(c,x,y,1.1,T*5+i*.6,o,-1,'rgba(110,100,96,.9)');}}
 else{for(let i=0;i<170;i++){const sp=.35+ptH(i)*.5,x=((ptH(i,1)*1340+T*18*sp+Math.sin(T*.7+i)*8)%1340)-20,y=((ptH(i,2)*860+T*30*sp)%860)-20;V.flake(c,x,y,1.3+ptH(i,3)*2,.8);}
  if(A.windows){const n=A.windows.length;A.windows.forEach((w,i)=>{const on=Math.min(1,Math.max(0,(u*1.4-i/n)*6));if(on>0){c.globalAlpha*=on;V.glow(c,w[0],w[1],w[2]||8,w[3]||10,o.dark?.9:.6);c.globalAlpha/=on;}});}
  if(o.dark)for(let i=0;i<40;i++){const x=ptH(i,5)*1280,y=ptH(i,6)*H*.7,a=.4+.6*Math.abs(Math.sin(T*1.5+i));V.star(c,x,y,1+ptH(i,7)*1.4,a*.9);}}
 c.restore();}

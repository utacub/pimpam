// Flor de paper (CE02): twenty paper flowers that unfold, one at each press.
import {patternFor} from './patterns.js';

const V_PI=Math.PI,V_TAU=2*Math.PI;
const vClamp=x=>Math.max(0,Math.min(1,x));
const vSmooth=x=>{x=vClamp(x);return x*x*(3-2*x)};
const vRand=i=>{const n=Math.sin(i*127.1+311.7)*43758.5453;return n-Math.floor(n)};
function vMix(hex,to,amount){const a=hex.match(/\w\w/g).map(v=>parseInt(v,16)),b=to.match(/\w\w/g).map(v=>parseInt(v,16));return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*amount).toString(16).padStart(2,'0')).join('');}
function vEllipse(c,x,y,rx,ry,fill){c.fillStyle=fill;c.beginPath();c.ellipse(x,y,Math.max(.00001,rx),Math.max(.00001,ry),0,0,V_TAU);c.fill();}
function paperOutline(c,len,width,shape,seed=0,curl=0){
 c.beginPath();c.moveTo(0,0);
 switch(shape){
 case 'point':case 'lance':case 'filament':case 'ribbon':
  c.bezierCurveTo(-width*1.3,-len*.29,-width,-len*.8,curl*len,-len);c.bezierCurveTo(width,-len*.8,width*1.3,-len*.29,0,0);break;
 case 'round':case 'spoon':case 'orchid':
  c.bezierCurveTo(-width*.5,-len*.25,-width*1.15,-len*.7,-width*.65,-len*.9);c.bezierCurveTo(-width*.25,-len*1.04,width*.6,-len*1.04,width*.85,-len*.78);c.bezierCurveTo(width*1.05,-len*.46,width*.38,-len*.17,0,0);break;
 case 'curl':
  c.bezierCurveTo(-width*1.15,-len*.2,-width*1.2,-len*.86,-width*.1,-len);c.bezierCurveTo(width*.82,-len*1.13,width*1.05,-len*.72,width*.55,-len*.54);c.bezierCurveTo(width*.38,-len*.8,width*.02,-len*.4,0,0);break;
 case 'diamond':
  c.lineTo(-width,-len*.57);c.quadraticCurveTo(-width*.25,-len*.87,0,-len);c.quadraticCurveTo(width*.25,-len*.87,width,-len*.57);c.closePath();break;
 case 'tile':
  c.lineTo(-width*.65,-len*.28);c.lineTo(-width,-len*.78);c.lineTo(-width*.65,-len);c.lineTo(width*.55,-len);c.lineTo(width,-len*.78);c.lineTo(width*.62,-len*.3);c.closePath();break;
 case 'notch':
  c.bezierCurveTo(-width,-len*.35,-width*1.13,-len*.92,-width*.4,-len);c.quadraticCurveTo(0,-len*.9,width*.4,-len);c.bezierCurveTo(width*1.13,-len*.92,width,-len*.35,0,0);break;
 case 'ruffle':case 'crumple':case 'scallop':{
  const lobes=shape==='crumple'?5:shape==='scallop'?4:7;
  c.bezierCurveTo(-width,-len*.25,-width*1.03,-len*.57,-width*.89,-len*.72);
  for(let j=0;j<lobes;j++){const x=-width*.89+j/lobes*width*1.78,nx=-width*.89+(j+1)/lobes*width*1.78,yy=-len*(.79+.16*Math.sin((j+.5)/lobes*V_PI));c.quadraticCurveTo((x+nx)/2,yy-len*.13,nx,yy);}
  c.bezierCurveTo(width*1.15,-len*.5,width*.6,-len*.13,0,0);break;}
 case 'bell':
  c.bezierCurveTo(-width*.15,-len*.3,-width*.25,-len*.65,-width,-len*.86);c.quadraticCurveTo(-width*.55,-len*1.04,0,-len*.9);c.quadraticCurveTo(width*.55,-len*1.04,width,-len*.86);c.bezierCurveTo(width*.25,-len*.65,width*.15,-len*.3,0,0);break;
 case 'tulip':
  c.bezierCurveTo(-width*.8,-len*.23,-width,-len*.68,-width*.6,-len);c.lineTo(0,-len*.88);c.lineTo(width*.65,-len);c.bezierCurveTo(width,-len*.65,width*.72,-len*.23,0,0);break;
 default:c.quadraticCurveTo(-width,-len*.6,0,-len);c.quadraticCurveTo(width,-len*.6,0,0);
 }
 c.closePath();
}
function paperPetal(c,len,width,shape,color,seed,curl=0){
 c.save();const light=vMix(color,'#ffffff',.38),dark=vMix(color,'#493045',.37),g=c.createLinearGradient(-width,0,width,-len);g.addColorStop(0,dark);g.addColorStop(.43,color);g.addColorStop(.505,light);g.addColorStop(.83,color);g.addColorStop(1,vMix(color,'#ffffff',.2));
 paperOutline(c,len,width,shape,seed,curl);c.fillStyle=g;c.fill();c.strokeStyle=vMix(color,'#5e4653',.28)+'65';c.lineWidth=.0017;c.stroke();c.clip();
 c.fillStyle=dark+'24';c.beginPath();c.moveTo(0,0);c.lineTo(-width*.04,-len*.4);c.lineTo(curl*len,-len);c.lineTo(width*.26,-len*.62);c.closePath();c.fill();
 c.strokeStyle=light+'8c';c.lineWidth=.002;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(curl*len*.3,-len*.55,curl*len,-len);c.stroke();
 const veins=shape==='ribbon'||shape==='filament'?2:shape==='crumple'?9:5;
 for(let i=1;i<=veins;i++){const y=-len*i/(veins+1),reach=width*Math.sin(i/(veins+1)*V_PI);c.strokeStyle=dark+'35';c.lineWidth=.0012;c.beginPath();c.moveTo(0,y+len*.12);c.lineTo(-reach,y-len*.04);c.moveTo(0,y+len*.12);c.lineTo(reach,y-len*.04);c.stroke();}
 // Short fibres stay attached to the paper surface, rather than floating like glitter.
 for(let i=0;i<12;i++){const x=(vRand(seed*31+i)-.5)*width*1.4,y=-len*(.12+vRand(seed*19+i+100)*.8);c.strokeStyle=i%2?light+'28':dark+'18';c.lineWidth=.0009;c.beginPath();c.moveTo(x,y);c.lineTo(x+width*.07,y-len*.012);c.stroke();}
 c.restore();
}
function drawPaperFlower(c,w,h,time,duration,index=0,reduced=false,base='black'){
 if(time===null)return;const u=vClamp(time/duration),grow=vSmooth(u/.34),close=1-vSmooth((u-.69)/.31),open=grow*close;if(open<=0)return;const p=patternFor('flower',index),r=Math.min(w*.32,h*.36),movement=reduced?0:1;
 c.save();c.translate(w*.5,h*.5);c.scale(r,r);c.globalAlpha=Math.min(1,open*5);
 const haze=c.createRadialGradient(0,0,0,0,0,1.4);haze.addColorStop(0,p.palette[0]+'13');haze.addColorStop(1,p.palette[0]+'00');c.fillStyle=haze;c.fillRect(-1.4,-1.4,2.8,2.8);
 c.rotate(movement*Math.sin(u*V_PI)*[.1,-.12,.15,-.08,.07][index%5]);
 if(p.move==='tulip'){
  c.translate(0,.42);c.strokeStyle='#819e8a';c.lineWidth=.025;c.beginPath();c.moveTo(0,.5);c.quadraticCurveTo(-.08,.12,0,-.05);c.stroke();
  for(let layer=0;layer<2;layer++)for(let j=0;j<3;j++){const q=j-1,fold=vSmooth((open-layer*.1)/(.9-layer*.1));c.save();c.translate(q*.13,layer*.04);c.rotate(q*(.15+.42*fold));paperPetal(c,1.4*(.45+.55*fold),(.3+layer*.025)*(.3+.7*fold),'tulip',p.palette[(j+layer)%3],j+layer*3);c.restore();}
 }else if(p.move==='bells'){
  for(let j=0;j<6;j++){const a=j*V_TAU/6-V_PI/2,rr=.38*open;c.save();c.translate(Math.cos(a)*rr,Math.sin(a)*rr);c.rotate(a+V_PI/2+movement*Math.sin(u*7+j)*.1);paperPetal(c,.58*(.3+.7*open),.22*(.2+.8*open),'bell',p.palette[j%3],j);c.restore();}
 }else if(p.move==='seeds'){
  for(let j=0;j<48;j++){const a=j*2.39996,rr=Math.sqrt(j/48)*.89*open,drift=movement*Math.sin(u*V_PI)*.07;c.save();c.rotate(a+drift);c.strokeStyle=vMix(p.palette[0],'#597e6e',.3);c.lineWidth=.0025;c.beginPath();c.moveTo(0,0);c.lineTo(0,-rr);c.stroke();c.translate(0,-rr);for(let k=0;k<5;k++){c.save();c.rotate((k-2)*.3);paperPetal(c,.12*open,.013*open,'lance',p.palette[(j+k)%3],j+k);c.restore();}c.restore();}
 }else{
  for(let layer=0;layer<p.layers.length;layer++){const n=p.layers[layer],maxLen=1-layer*p.shrink;
   for(let j=0;j<n;j++){const stagger=p.move==='sunrise'?j/n*.13:p.move==='radial'?j/n*.08:p.move==='tiles'?((j+layer)%3)*.04:p.move==='ripple'?Math.sin(j*.7+layer)*.03:0;
    const unfold=vSmooth((u-stagger-layer*.025)/(.29-layer*.012)),refold=1-vSmooth((u-.69-stagger*.3)/(.31+stagger*.3)),fold=unfold*refold;
    let a=j*V_TAU/n+layer*(p.shape==='curl'?.69:.27),len=maxLen*(.16+.84*fold),wide=p.width*(1-layer*.11)*(.07+.93*fold),curl=0;
    if(p.move==='spiral')a+=movement*(1-fold)*(.9+layer*.28);
    if(p.move==='turn')a+=movement*(layer%2?1:-1)*(1-fold)*.45;
    if(p.move==='alternating')a+=layer*V_PI/3;
    if(p.move==='butterfly'){a+=layer*.21;len*=j%2?.84:1;wide*=j%2?1.12:.83;}
    if(p.move==='cup'){wide*=.48+.52*fold;len*=.91+.09*Math.cos(j*2);}
    if(p.move==='tide'){a+=movement*Math.sin(u*4-layer)*.09;wide*=1+movement*Math.sin(u*6+j)*.025;}
    if(p.move==='ribbons')curl=movement*Math.sin(u*5+j*.46+layer)*.14;
    if(p.move==='swirl')a+=movement*(1-fold)*.7;
    if(p.move==='star')a+=movement*(1-fold)*(layer%2?.3:-.3);
    if(p.move==='counter')a+=movement*(layer%2?1:-1)*Math.sin(u*V_PI)*.23;
    if(p.move==='breath'){len*=1+movement*Math.sin(u*7)*.035;wide*=1-movement*Math.sin(u*7)*.04;}
    c.save();c.rotate(a);if(p.move==='butterfly')c.scale(1,j%2?1:.86);c.translate(0,-layer*.025*fold);
    paperPetal(c,len,wide,p.shape==='filament'&&layer>0?'ribbon':p.shape,p.palette[(layer+Math.floor(j/(Math.max(1,n/3))))%3],j+layer*41,curl);c.restore();
   }
  }
 }
 const center=p.center*(.2+.8*open),dark=vMix(p.palette[0],'#363444',.65);vEllipse(c,0,0,center,center,dark);
 const seeds=p.center>.19?170:70;for(let i=0;i<seeds;i++){const a=i*2.39996,rr=Math.sqrt(i/seeds)*center;vEllipse(c,Math.cos(a)*rr,Math.sin(a)*rr,Math.max(.002,center*.045),Math.max(.002,center*.045),i%3?vMix(p.palette[2],'#fff1cb',.25):vMix(p.palette[1],'#79643f',.25));}
 if(p.stamen){c.save();c.rotate(-.3);c.strokeStyle=p.palette[2];c.lineWidth=.018;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(.1,-.2,.18,-.5*open);c.stroke();for(let j=0;j<9;j++)vEllipse(c,.18+(j%3-1)*.027,-.5*open+Math.floor(j/3)*.035,.018,.022,'#e5c789');c.restore();}
 c.restore();
}

export {drawPaperFlower};

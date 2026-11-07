// La fira de llauna (CE44), 0.47: the picture. A fair stall of printed tin seen from the front, the whole screen: the sky of the light
// of the round, the distant fair (a big wheel and tents), the ground, two stalls with striped awnings on the sides and the tin public
// in front of them, and across the top the arch of the stall, with a garland of little bulbs and, in the middle, the three big bulbs of
// the count. The attraction fills the middle half. The medals of the launches hang under the arch.
// Every launch is drawn from the seconds since the press (the same moments as the music, FI_T in fira.js). The figures only move,
// turn and copy pieces printed once (fira-llauna.js). Rotation is kept slow (at most a turn in four seconds): what would spin is drawn
// as a flip, a swing or a tilt instead. Nothing falls on anybody.
import {Kclamp,KeaseBack,KeaseInOut,KeaseOut,Kmix,Krgba,Ksmooth} from './kaleido-base.js';
import {escBlit,escCanvas,escDecor,escDecorKey,escFrame,escSheet,escVeiled} from './escenari.js';
import {FI_ATTRS,FI_FINAL,FI_FINAL_GAG,FI_GAG_NAMES,FI_SHOT,FI_T,FI_TURN,fiBulbs,fiEnsure,fiGagOf,fiRound,fiSteps} from './fira.js';
import {FI_INK,FI_TAU,fiBead,fiBulb,fiEll,fiHalftone,fiPoly,fiPrint,fiRR,fiRivet,fiSetRim,fiSprite,fiSpriteFrame,fiStarPath} from './fira-llauna.js';
import {FI_HEAD_Y,fiDog,fiElephant,fiHorse,fiPerson} from './fira-gent.js';

const faSeg=(t,a,b)=>Kclamp((t-a)/(b-a));
const faLerp=(a,b,u)=>a+(b-a)*u;
const faHop=(u,h)=>4*h*u*(1-u);
// The horizon of the fair ground and the ground line of the figures.
const FA_HOR=446;
// The light of each round: the sky (top, middle, horizon), the sun or the moon, and the tint laid over the whole picture.
const FA_LIGHTS=Object.freeze([
 Object.freeze({sky:['#4f9fbf','#86c9cf','#c9e8d8'],sun:'#f7e3a1',sunY:.25,cloud:'#fbf3df',tint:null,ground:FI_INK.ground,wheel:'#3d6f86',dots:'rgba(20,50,80,.32)'}),
 Object.freeze({sky:['#3f86b3','#8cc0c6','#f1d9a0'],sun:'#f8d27a',sunY:.42,cloud:'#fbeccc',tint:'#fff0d8',ground:'#cf8d48',wheel:'#4a6d80',dots:'rgba(40,40,70,.3)'}),
 Object.freeze({sky:['#3f3f7f','#c0627a','#f4a65e'],sun:'#f58a3c',sunY:.86,cloud:'#f6c1a0',tint:'#ffd9bd',ground:'#b97440',wheel:'#4a3a62',dots:'rgba(60,20,60,.3)'}),
 Object.freeze({sky:['#0e1534','#1d2c5c','#34497e'],sun:'#f3ecc8',sunY:.22,cloud:'#56628f',tint:'#b0b9e2',ground:'#8d6a4a',wheel:'#5b6f9a',dots:'rgba(0,0,20,.35)',night:true})]);
// The three rails of the horse race (back to front) and the size of the horses on them.
const FA_TRACKS=Object.freeze([488,572,664]),FA_HSCALE=Object.freeze([.78,.92,1.08]);
const FA_ATTR_COL=Object.freeze([FI_INK.teal,FI_INK.red,FI_INK.navy,FI_INK.green,FI_INK.plum]);
// The medals: one colour for each gag (the six), gold for the finale.
const FA_MEDAL=Object.freeze([FI_INK.red,FI_INK.teal,FI_INK.blue,FI_INK.green,FI_INK.plum,FI_INK.orange,FI_INK.gold]);

// ── The back: sky, distant fair, ground, stalls, the arch (drawn once per round, light and size) ────────────────────────────
function faSky(c,L,HW,top){const y0=top-10,h=FA_HOR-y0;const g=c.createLinearGradient(0,y0,0,FA_HOR);g.addColorStop(0,L.sky[0]);g.addColorStop(.55,L.sky[1]);g.addColorStop(1,L.sky[2]);c.fillStyle=g;c.fillRect(-HW-20,y0,2*HW+40,h+20);
 fiHalftone(c,cc=>cc.rect(-HW-20,y0,2*HW+40,h*.55),[-HW-20,y0,2*HW+40,h*.55],[0,y0+h*.55],[0,y0],.55,L.dots,8);
 const sx=HW*.62,sy=y0+40+(FA_HOR-y0-120)*L.sunY,sr=L.night?52:L.sunY>.8?84:66;
 if(L.night){c.save();c.fillStyle=Krgba('#fff6d0',.18);c.beginPath();c.arc(sx,sy,sr*1.9,0,FI_TAU);c.fill();c.restore();}
 fiPrint(c,fiEll(sx,sy,sr,sr),L.sun,[sx-sr,sy-sr,2*sr,2*sr],{ht:.35,wear:false,sheen:.6,key:4});
 if(L.night){c.fillStyle=L.sky[1];c.beginPath();c.arc(sx+sr*.42,sy-sr*.2,sr*.86,0,FI_TAU);c.fill();
  for(let i=0;i<16;i++){const x=-HW+((i*397)%1000)/1000*2*HW,y=y0+30+((i*211)%1000)/1000*(FA_HOR-y0-160),r=5+(i%3)*2.5;fiPrint(c,fiStarPath(x,y,r),i%4?'#f3ecc8':FI_INK.gold,[x-r,y-r,2*r,2*r],{ht:0,wear:false,sheen:0,key:1.8});}}
 const clouds=L.night?[[-.55,.18,.7]]:[[-.62,.2,1],[-.15,.08,.7],[.3,.3,.85],[.85,.45,.6]];
 for(const [fx,fy,s] of clouds){const x=fx*HW,y=y0+40+fy*(FA_HOR-y0-120),p=cc=>{for(const [dx,dy,r] of [[-60,10,40],[-20,-15,52],[30,-5,46],[70,12,34],[0,18,48]])fiEll(x+dx*s,y+dy*s,r*s*1.15,r*s*.8)(cc);};
  fiPrint(c,p,L.cloud,[x-110*s,y-70*s,220*s,120*s],{ht:.4,shade:[0,0,0,1],wear:false,sheen:.5,key:3});}}
function faDistant(c,L,HW){c.save();c.globalAlpha=.62;const wx=-HW*.42,wy=FA_HOR-150,R=150;c.strokeStyle=L.wheel;c.lineWidth=6;c.beginPath();c.arc(wx,wy,R,0,FI_TAU);c.stroke();c.lineWidth=3;
 for(let i=0;i<12;i++){const a=i/12*FI_TAU+.1;c.beginPath();c.moveTo(wx,wy);c.lineTo(wx+Math.cos(a)*R,wy+Math.sin(a)*R);c.stroke();c.fillStyle=[FI_INK.red,FI_INK.gold,FI_INK.teal][i%3];c.fillRect(wx+Math.cos(a)*R-11,wy+Math.sin(a)*R,22,18);}
 c.beginPath();c.moveTo(wx-80,FA_HOR);c.lineTo(wx,wy);c.lineTo(wx+80,FA_HOR);c.stroke();c.restore();
 if(L.night)for(let i=0;i<12;i++){const a=i/12*FI_TAU+.1;fiBulb(c,wx+Math.cos(a)*R,wy+Math.sin(a)*R,4,.8,'#ffd978',true);}
 for(const [fx,w,h,col] of [[.12,240,150,FI_INK.red],[.5,190,120,FI_INK.teal],[-.05,170,105,FI_INK.gold]]){const x=fx*HW*1.4,p=fiPoly([[x-w/2,FA_HOR],[x,FA_HOR-h],[x+w/2,FA_HOR]]);c.save();c.globalAlpha=.78;fiPrint(c,p,col,[x-w/2,FA_HOR-h,w,h],{ht:.6,shade:[1,0,0,0],wear:false,sheen:.5,key:3});c.restore();
  c.save();c.globalAlpha=.78;c.strokeStyle=FI_INK.key;c.lineWidth=2;c.beginPath();c.moveTo(x,FA_HOR-h);c.lineTo(x,FA_HOR-h-18);c.stroke();c.fillStyle=FI_INK.gold;c.fillRect(x,FA_HOR-h-18,14,9);c.restore();}}
function faGround(c,L,HW){fiPrint(c,cc=>cc.rect(-HW-20,FA_HOR,2*HW+40,300),L.ground,[-HW-20,FA_HOR,2*HW+40,280],{ht:.42,shade:[0,0,0,1],key:0,wear:false,sheen:.6});
 c.strokeStyle='rgba(120,70,30,.18)';c.lineWidth=2;for(let i=0;i<6;i++){const y=FA_HOR+30+i*i*9;c.beginPath();c.moveTo(-HW-20,y);c.lineTo(HW+20,y);c.stroke();}
 fiBead(c,-HW-20,FA_HOR,HW+20,FA_HOR,9);}
// The floor of each attraction.
function faFloor(c,a,L){
 if(a===0){const l=fiPoly([[-150,FA_HOR+6],[330,FA_HOR+6],[620,725],[-560,725]]);fiPrint(c,l,L.night?'#b99260':FI_INK.lane,[-560,FA_HOR,1180,280],{ht:.5,shade:[0,1,0,0],key:4,sheen:.7,wearN:8});
  c.strokeStyle='rgba(120,70,30,.3)';c.lineWidth=2;for(let i=1;i<4;i++){const t=i/4;c.beginPath();c.moveTo(-150+480*t,FA_HOR+8);c.lineTo(-560+1180*t,720);c.stroke();}}
 if(a===1){const p=fiEll(20,615,560,92);fiPrint(c,p,'#e6c48a',[-540,523,1120,184],{ht:.45,shade:[0,0,0,1],key:5,sheen:.6});c.save();c.lineWidth=10;c.strokeStyle=FI_INK.red;c.beginPath();c.ellipse(20,615,548,84,0,0,FI_TAU);c.stroke();c.restore();
  for(let i=0;i<10;i++){const a2=i/10*FI_TAU;fiRivet(c,20+Math.cos(a2)*548,615+Math.sin(a2)*84,5);}}
 if(a===2){fiPrint(c,fiEll(-60,622,120,24),FI_INK.grey,[-180,598,240,48],{ht:.5,shade:[0,0,1,1],key:4,sheen:1.1});fiPrint(c,fiEll(-60,616,84,15),FI_INK.tin,[-144,601,168,30],{ht:.3,wear:false,sheen:1.2,key:3});}
 if(a===3){fiPrint(c,fiRR(-200,592,520,44,6),'#9c6534',[-200,592,520,44],{ht:.5,shade:[0,0,0,1],key:4,sheen:.8});for(let i=0;i<6;i++){c.strokeStyle='rgba(60,30,10,.4)';c.lineWidth=2;c.beginPath();c.moveTo(-200+i*104,594);c.lineTo(-200+i*104,634);c.stroke();}
  fiBead(c,-200,592,320,592,6);}
 if(a===4){for(const [i,y] of FA_TRACKS.entries()){const s=FA_HSCALE[i];c.fillStyle='rgba(60,30,10,.35)';for(let x=-420;x<=440;x+=46)c.fillRect(x,y-4*s,14*s,16*s);fiBead(c,-440,y,460,y,9*s);}
  // the finish post with its flag
  fiPrint(c,fiRR(420,FA_HOR-40,12,320,4),FI_INK.cream,[420,FA_HOR-40,12,320],{ht:.3,sheen:1.2});fiPrint(c,fiPoly([[432,FA_HOR-38],[500,FA_HOR-22],[432,FA_HOR-4]]),FI_INK.red,[432,FA_HOR-38,68,34],{ht:.3,wear:false,key:3});}}
// A stall on one side: post, printed panel with its frame and stars, a medallion, the striped awning (four pairs of stripes).
function faStall(c,side,HW,top,a){const w=270,x=side<0?-HW-10:HW+10-w,y=Math.max(top+150,170);
 const px=side<0?x+w-44:x+20;fiPrint(c,fiRR(px,y+60,24,FA_HOR-y,4),FI_INK.navy,[px,y+60,24,FA_HOR-y],{shade:[0,0,1,0],sheen:.9});
 const by=FA_HOR-140,body=fiRR(x,by,w,170,6);fiPrint(c,body,FI_INK.cream,[x,by,w,170],{shade:[side<0?1:0,0,side<0?0:1,0],sheen:.8});
 c.strokeStyle=FI_INK.red2;c.lineWidth=5;c.strokeRect(x+14,by+14,w-28,142);c.strokeStyle=FI_INK.gold;c.lineWidth=2;c.strokeRect(x+22,by+22,w-44,126);
 for(const [rx,ry] of [[x+14,by+14],[x+w-14,by+14],[x+14,by+156],[x+w-14,by+156]])fiRivet(c,rx,ry,5);
 fiPrint(c,fiEll(x+w/2,by+50,40,26),FA_ATTR_COL[a],[x+w/2-40,by+24,80,52],{shade:[0,0,1,1],sheen:1.3,key:4});fiPrint(c,fiStarPath(x+w/2,by+50,16),FI_INK.cream,[x+w/2-16,by+34,32,32],{ht:0,wear:false,sheen:0,key:2});
 for(let i=0;i<4;i++){const sx=x+50+i*58,sy=by+108+(i%2)*20;fiPrint(c,fiStarPath(sx,sy,14),[FI_INK.red,FI_INK.gold,FI_INK.teal][i%3],[sx-14,sy-14,28,28],{ht:0,wear:false,sheen:0,key:1.8});}
 const aw=cc=>{cc.moveTo(x-10,y);cc.lineTo(x+w+10,y);cc.lineTo(x+w+10,y+90);for(let i=8;i>=0;i--){const xx=x-10+(w+20)*i/8;cc.quadraticCurveTo(xx+(w+20)/16,y+130,xx,y+90);}cc.closePath();};
 fiPrint(c,aw,FI_INK.cream,[x-10,y,w+20,140],{ht:0,sheen:0,wear:false,key:4,pattern:cc=>{cc.save();cc.beginPath();aw(cc);cc.clip();cc.fillStyle=FI_INK.red;for(let i=0;i<8;i+=2)cc.fillRect(x-10+(w+20)*i/8,y,(w+20)/8+1,140);cc.restore();}});
 fiHalftone(c,aw,[x-10,y,w+20,140],[x,y],[x,y+130],.6,'rgba(60,20,10,.32)',7);
 for(let i=0;i<=8;i++)fiRivet(c,x-10+(w+20)*i/8,y+8,4);fiBead(c,x-10,y,x+w+10,y,9);}
// The arch: a printed band that hangs across the top, a little lower in the middle, with three tin sockets for the big bulbs.
const faArchY=(x,HW,top)=>top+28+40*(1-Math.pow(x/HW,2));
function faArch(c,HW,top){const band=cc=>{cc.moveTo(-HW-20,top-6);for(let i=0;i<=24;i++){const x=-HW-20+(2*HW+40)*i/24;cc.lineTo(x,faArchY(x,HW,top)-26);}for(let i=24;i>=0;i--){const x=-HW-20+(2*HW+40)*i/24;cc.lineTo(x,faArchY(x,HW,top)+18);}cc.closePath();};
 fiPrint(c,band,FI_INK.red2,[-HW-20,top-6,2*HW+40,110],{shade:[0,0,0,1],sheen:.9,wearN:20});
 for(let i=0;i<=12;i++){const x=-HW+(2*HW)*i/12;fiRivet(c,x,faArchY(x,HW,top)-16,3.5);}
 for(let i=0;i<3;i++){const bx=(i-1)*110,by=faArchY(bx,HW,top)+4;fiPrint(c,fiRR(bx-22,by,44,30,6),FI_INK.grey,[bx-22,by,44,30],{sheen:1.3,key:4});fiRivet(c,bx-14,by+8,3);fiRivet(c,bx+14,by+8,3);}}
const faBigBulb=(i,HW,top)=>[(i-1)*110,faArchY((i-1)*110,HW,top)+70];
function faBack(c,w,v,k,HW,top){const r=fiRound(v),L=FA_LIGHTS[r.light];c.save();c.translate(w/2,720);c.scale(k,k);c.translate(0,-720);
 faSky(c,L,HW,top);faDistant(c,L,HW);faGround(c,L,HW);faFloor(c,r.attr,L);faStall(c,-1,HW,top,r.attr);faStall(c,1,HW,top,r.attr);faArch(c,HW,top);c.restore();}

// ── What moves: the garland, the three bulbs, the medals, the public ───────────────────────────────────────────────────────
function faGarland(c,HW,top,night,glow){for(let i=1;i<24;i++){const t=i/24,x=-HW+2*HW*t;if(Math.abs(x)<190)continue;const y=faArchY(x,HW,top)+2;fiBulb(c,x,y,8,night?.95:.45,'#ffd978',glow&&night);}}
// The three bulbs: lit in turn (n, the newest at u); off: fading out after a launch, a restart or a timeout. go: the third is lit and
// waits (the three breathe together, slowly).
function faBulbs(c,HW,top,B,go,now,glow){for(let i=0;i<3;i++){const [x,y]=faBigBulb(i,HW,top);let lit=i<B.n?(i===B.n-1?Ksmooth(B.u):1):0;lit*=1-B.off;
 if(go)lit*=.9+.1*Math.cos(now*FI_TAU*.5);fiBulb(c,x,y,32,lit,i===2?'#ffc24a':'#ffd978',glow);}}
// A medal of tin on a ribbon: the colour of its gag; the finale's, bigger and gold with a star.
function faMedal(c,x,y,gag,big,swing){const r=big?24:16,col=FA_MEDAL[gag];c.save();c.translate(x,y);c.rotate(swing);
 c.fillStyle=FI_INK.red;c.beginPath();c.moveTo(-7,0);c.lineTo(7,0);c.lineTo(5,30);c.lineTo(-5,30);c.closePath();c.fill();c.strokeStyle=FI_INK.key;c.lineWidth=2;c.stroke();
 fiSprite(c,`fa-medal|${gag}|${big?1:0}`,[-r-6,30-6,2*r+12,2*r+12],cc=>{fiPrint(cc,fiEll(0,30+r,r,r),col,[-r,30,2*r,2*r],{ht:.4,sheen:1.5,key:3.5,wear:false});fiPrint(cc,fiStarPath(0,30+r,r*.55),big?FI_INK.cream:FI_INK.gold,[-r*.6,30+r*.4,r*1.2,r*1.2],{ht:0,sheen:1.2,key:2,wear:false});});
 c.restore();}
const faMedalAt=(i,HW,top)=>{const side=i%2?1:-1,j=Math.floor(i/2),x=side*(230+j*62);return [x,faArchY(x,HW,top)+16];};
function faMedals(c,HW,top,out,cur,now,reduced){out.forEach((g,i)=>{const [x,y]=faMedalAt(i,HW,top);faMedal(c,x,y,g,g===FI_FINAL_GAG,reduced?0:.05*Math.sin(now*1.3+i));});
 if(cur){const [x,y]=faMedalAt(out.length,HW,top),u=cur.u;if(u>0){const drop=(1-KeaseOut(u))*-120,sw=(1-Ksmooth(u))*.5*Math.sin(u*12);faMedal(c,x,y+drop,cur.gag,cur.gag===FI_FINAL_GAG,sw);}}}
// The public: tin people at both sides, in front of the stalls. They lean in during the count, cheer at the end of a gag.
const FA_PUBLIC=Object.freeze([['public0',-1,0],['public1',-1,1],['public2',-1,2],['public3',1,0],['public4',1,1],['public5',1,2]]);
function faPublic(c,HW,S){for(const [who,side,j] of FA_PUBLIC){const x=side*(HW-58-j*70),y=598+(j%2)*16,s=.3+(j%2)*.02;
 const ch=S.cheer,hop=ch>0?Math.abs(Math.sin((S.now*2.6+j)*Math.PI))*14*ch:0,lift=ch*2.6;
 const blink=!S.reduced&&((S.now+j*1.9+(side>0?1:0))%4.6)<.12;
 faShadow(c,x,y,34,6,S);fiPerson(c,x,y,s,who,{la:.15+lift,ra:.15+lift,hop,mood:ch>.2?'grin':S.antic>.6?'o':'smile',blink,lean:-side*.06*S.antic,flip:side>0});}}
function faShadow(c,x,y,rx,ry,S){if(!S.decor.full)return;c.fillStyle='rgba(60,30,10,.22)';c.beginPath();c.ellipse(x,y+4,rx,ry,0,0,FI_TAU);c.fill();}
// A person flying: centred on its body (x, y), turned by rot.
function faFly(c,x,y,s,who,rot,pose){c.save();c.translate(x,y);c.rotate(rot);fiPerson(c,0,150*s,s,who,{...pose,noStand:true});c.restore();}
// Where a person's hand is, for a straight body (side 1, the right).
function faHand(px,py,s,side,a,wide=1,extra=0){const L=(86+extra)*s,sx=px+side*46*wide*s,sy=py-226*s;return [sx+side*L*Math.sin(a),sy+L*Math.cos(a)];}
// A puff of tin «cotton» (printed clouds, no fire).
function faPuff(c,x,y,u,size=1){if(u<=0||u>=1)return;const a=1-Ksmooth((u-.4)/.6),r=size*(18+40*KeaseOut(u));c.save();c.globalAlpha*=a;
 for(const [dx,dy,k] of [[-.6,.1,.8],[0,-.3,1],[.6,.05,.85],[0,.35,.7]])fiPrint(c,fiEll(x+dx*r,y+dy*r,r*k*.7,r*k*.6),FI_INK.white,[x+dx*r-r,y+dy*r-r,2*r,2*r],{ht:.35,sheen:0,wear:false,key:3});c.restore();}


// ── Les bitlles ──────────────────────────────────────────────────────────────────────────────────────────────────────────
// Six pins in two rows of three (the back row a little smaller), the player with the bitllot on the left, and the dog of the fair.
const FA_PINS=Object.freeze([[178,508,.6],[236,508,.6],[294,508,.6],[168,552,.68],[234,552,.68],[300,552,.68]]);
const FA_PLAYER=Object.freeze([-300,668,.95]),FA_DOGAT=Object.freeze([-470,706,.85]),FA_LAMP=Object.freeze([150,250]),FA_CANDY=Object.freeze([470,630]);
function faPinShape(c){const h=150,w=34;c.moveTo(-w*.55,0);c.bezierCurveTo(-w*.75,-h*.35,-w*.25,-h*.55,-w*.3,-h*.72);c.bezierCurveTo(-w*.45,-h*.85,-w*.35,-h,0,-h);c.bezierCurveTo(w*.35,-h,w*.45,-h*.85,w*.3,-h*.72);c.bezierCurveTo(w*.25,-h*.55,w*.75,-h*.35,w*.55,0);c.closePath();}
function faPin(c,x,y,s,ang=0,sx=1,dy=0){c.save();c.translate(x,y+dy);c.rotate(ang);c.scale(s*sx,s);
 fiSprite(c,'fa-pin',[-30,-158,60,164],cc=>fiPrint(cc,faPinShape,FI_INK.cream,[-26,-150,52,150],{shade:[0,0,1,0],sheen:1.1,key:5,pattern:c2=>{c2.save();c2.beginPath();faPinShape(c2);c2.clip();c2.fillStyle=FI_INK.red;c2.fillRect(-30,-99,60,9);c2.fillRect(-30,-78,60,6);c2.fillStyle='#5d6266';c2.fillRect(-30,-11,60,11);c2.restore();}}));c.restore();}
function faStick(c){fiSprite(c,'fa-stick',[-14,-6,28,96],cc=>{fiPrint(cc,c2=>{c2.moveTo(-5,0);c2.lineTo(5,0);c2.lineTo(10,84);c2.quadraticCurveTo(0,90,-10,84);c2.closePath();},'#a8703a',[-10,0,20,88],{ht:.45,shade:[0,0,1,0],sheen:1.2,key:4});cc.fillStyle='#6a3d22';cc.fillRect(-6,4,12,14);});}
// A pin knocked over: it falls to one side (dir) with a little bounce on the lane.
function faFall(t,t0,dir){if(t<t0)return 0;const u=(t-t0)/.32;if(u<1)return dir*1.5*u*u;return dir*(1.5-.1*Math.exp(-(t-t0-.32)*7)*Math.abs(Math.sin((t-t0-.32)*18)));}
// Standing up again with the spring of a tin toy.
const faUp=(t,t0)=>1-KeaseBack(faSeg(t,t0,t0+.42));
function faLampDraw(c,lit,glow){fiSprite(c,'fa-lamp',[-30,-6,60,92],cc=>{fiPrint(cc,fiPoly([[-18,6],[18,6],[24,20],[-24,20]]),FI_INK.navy,[-24,6,48,14],{ht:.3,sheen:1.2,key:3.5,wear:false});
  fiPrint(cc,fiRR(-20,20,40,44,6),'#f4ead0',[-20,20,40,44],{ht:.3,sheen:1.4,key:3.5,wear:false});fiPrint(cc,fiPoly([[-24,64],[24,64],[14,78],[-14,78]]),FI_INK.navy,[-24,64,48,14],{ht:.3,sheen:1.2,key:3.5,wear:false});fiRivet(cc,0,4,4);});
 if(lit>0){c.save();c.globalAlpha*=lit;fiBulb(c,0,42,13,1,'#ffd978',glow);c.restore();}}
function faCandy(c,s){c.save();c.scale(s,s);fiSprite(c,'fa-candy',[-80,-200,160,206],cc=>{fiPrint(cc,fiRR(-60,-70,120,64,8),FI_INK.cream,[-60,-70,120,64],{shade:[0,0,1,0],sheen:1,key:4,pattern:c2=>{c2.fillStyle=FI_INK.red;for(let i=0;i<3;i++)c2.fillRect(-52+i*40,-66,18,56);}});
  for(const dx of [-40,40]){fiPrint(cc,fiEll(dx,-6,14,14),'#5a5650',[dx-14,-20,28,28],{ht:0,sheen:1.4,key:3,wear:false});fiRivet(cc,dx,-6,3);}
  fiPrint(cc,fiRR(-4,-160,8,92,3),FI_INK.cream,[-4,-160,8,92],{ht:0,sheen:1,key:3,wear:false});
  const cl=c2=>{for(const [x,y,r] of [[-26,-160,30],[10,-178,34],[30,-150,28],[-4,-140,30]])fiEll(x,y,r,r)(c2);};fiPrint(cc,cl,FI_INK.pink,[-56,-212,116,104],{ht:.45,shade:[0,0,1,1],sheen:.6,key:4});});c.restore();}
function faBitlles(c,S){const T=FI_T.bitlles,t=S.t,n=S.name,G=n?T[n]||{}:{},[px,py,ps]=FA_PLAYER,prop=n||S.next;
 // the props of the gag that comes (they are there before the press, so the scene says what may happen)
 const pu=S.propU;
 if(prop==='fanal'){const [lx,ly]=FA_LAMP,ay=faArchY(lx,S.HW,S.top)+14,sw=t!=null&&t>G.lamp?.45*Math.exp(-(t-G.lamp)*.7)*Math.sin((t-G.lamp)*4):0,lit=t!=null?faSeg(t,G.lamp,G.lamp+.2)*(1-faSeg(t,T.reset,T.reset+.6)):0;
  c.save();c.translate(lx,ay);c.scale(1,KeaseBack(pu));c.rotate(sw);c.strokeStyle=FI_INK.key;c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(0,ly-ay);c.stroke();c.translate(0,ly-ay);faLampDraw(c,lit,false);c.restore();
  if(lit>0)S.glows.push(cc=>{cc.save();cc.translate(lx,ay);cc.rotate(sw);cc.translate(0,ly-ay);const g=cc.createRadialGradient(0,42,0,0,42,90);g.addColorStop(0,Krgba('#fff0be',.5*lit));g.addColorStop(1,Krgba('#ffd978',0));cc.fillStyle=g;cc.beginPath();cc.arc(0,42,90,0,FI_TAU);cc.fill();cc.restore();});}
 if(prop==='coto'){c.save();c.translate(FA_CANDY[0],FA_CANDY[1]);faShadow(c,0,0,70,10,S);faCandy(c,.9*KeaseBack(pu));c.restore();}
 // the pins
 const pins=FA_PINS.map(([x,y,s],i)=>({x,y,s,ang:0,sx:1,dy:0}));
 if(t!=null){const dirs=[1,-1,1,1,-1,1],R=T.reset;
  if(n==='domino'){const ord=[3,0,4,1,5,2];ord.forEach((i,k)=>{pins[i].ang=faFall(t,T.hit+k*G.fall,1)*faUp(t,R+k*.06);});}
  else if(n==='bitlla'){pins.forEach((p,i)=>{if(i===1){const w=t>T.hit?1-faSeg(t,G.still-.4,G.still):0;p.ang=.32*Math.sin((t-T.hit)*9)*Math.exp(-(t-T.hit)*.35)*w;p.sx=t>T.hit&&t<G.still?Math.max(.3,Math.abs(Math.cos((t-T.hit)*7))):1;}else p.ang=faFall(t,T.hit+i*.04,dirs[i])*faUp(t,R+i*.06);});}
  else if(n==='coto'){pins.forEach((p,i)=>{if(i!==5){p.ang=faFall(t,T.hit+i*.04,dirs[i])*faUp(t,R+i*.06);return;}
    const [cx,cy]=FA_CANDY,u=faSeg(t,G.roll,G.stick),back=faSeg(t,R,R+.7);
    if(t<G.roll){p.ang=faFall(t,T.hit+.2,1);}
    else if(t<G.stick){p.x=faLerp(p.x,cx-10,KeaseInOut(u));p.y=faLerp(p.y,cy-8,u);p.ang=1.5+.18*Math.sin(u*14);}
    else if(back<=0){p.x=cx-6;p.y=cy-110*.9;p.ang=.55+.08*Math.sin((t-G.stick)*6)*Math.exp(-(t-G.stick)*1.5);p.s=.6;}
    else{p.x=faLerp(cx-6,p.x,back);p.y=faLerp(cy-100,p.y,back)-faHop(back,120);p.ang=.55*(1-back);}});}
  else if(n==='tornen'){pins.forEach((p,i)=>{const t0=G.up+i*G.gap;p.ang=faFall(t,T.hit+i*.04,dirs[i])*faUp(t,t0);p.dy=-faHop(faSeg(t,t0,t0+.4),26);});}
  else if(n==='rotllana'){const cx=236,cy=530,D=G.dance,bw=faSeg(t,G.bow,G.bow+.5);pins.forEach((p,i)=>{const jump=faHop(faSeg(t,T.hit+i*.05,T.hit+i*.05+.5),40)+faHop(faSeg(t,G.rise+i*.05,G.rise+i*.05+.45),60);
    const m=KeaseInOut(faSeg(t,D,D+.9)),ph=i/6*FI_TAU+Math.max(0,t-D)*FI_TAU/6.4,ex=cx+Math.cos(ph)*150,ey=cy+Math.sin(ph)*34;
    p.x=faLerp(p.x,ex,m);p.y=faLerp(p.y,ey,m);p.s=faLerp(p.s,.6+.08*(Math.sin(ph)+1)/2,m);
    const beat=t>D?Math.abs(Math.sin((t-D)*Math.PI/.54))*16*(1-bw):0;p.dy=-jump-beat*m;p.ang=-.32*Ksmooth(bw)+(t>D&&t<G.bow?.12*Math.sin((t-D)*Math.PI/.54):0);});}
  else if(n!=='fanal'&&n!=='gos')pins.forEach((p,i)=>{p.ang=faFall(t,T.hit+i*.04,dirs[i])*faUp(t,R+i*.06);});}
 // a soft shadow under the rows, then the pins from the back
 faShadow(c,236,556,110,14,S);pins.map((p,i)=>i).sort((a,b)=>pins[a].y-pins[b].y).forEach(i=>{const p=pins[i];faPin(c,p.x,p.y,p.s,p.ang,p.sx,p.dy);});
 // the player
 let pose={ra:.5,la:.12,mood:'smile',blink:!S.reduced&&(S.now%4.1)<.12},hold=true,hop=0;
 if(t==null){if(S.antic>0){pose.ra=.5+2.0*Ksmooth(S.antic);pose.lean=-.07*S.antic;pose.mood=S.antic>.6?'effort':'smile';}else pose.ra=.5+.06*Math.sin(S.now*1.3);
  if(S.go){pose.ra=2.5+.02*Math.sin(S.now*30);pose.mood='effort';}}
 else{const sw=faSeg(t,0,T.rel);pose.ra=t<T.rel?faLerp(2.5,1.3,sw*sw):faLerp(1.3,.5,KeaseOut(faSeg(t,T.rel,T.rel+.6)));pose.lean=t<T.rel?.08*sw:.08*(1-faSeg(t,T.rel,T.rel+.6));pose.mood=t<T.hit+.2?'o':'smile';
  const ch=faSeg(t,T.cheer,T.cheer+.25)*(1-faSeg(t,T.cheer+1.4,T.cheer+1.8));if(ch>0&&!(n==='gos')){pose.ra=faLerp(pose.ra,2.7,ch);pose.la=faLerp(.12,2.7,ch);hop=faHop(faSeg(t,T.cheer,T.cheer+.5),26)+faHop(faSeg(t,T.cheer+.5,T.cheer+1),18);pose.mood='grin';}
  if(n==='bitlla'&&t>T.hit&&t<G.still){pose.mood='o';pose.ra=.4;pose.la=.4;}
  if(n==='fanal'){const c2=faSeg(t,G.catch-.3,G.catch);pose.ra=t<G.catch?faLerp(.5,2.2,c2):faLerp(2.2,.5,faSeg(t,G.catch+.6,G.catch+1.2));pose.mood=t<G.catch?'o':'grin';}
  if(n==='gos'){pose.mood=t<G.drop?'o':'grin';if(t>G.drop&&t<G.drop+1){pose.la=1.2;}}
  if(n==='rotllana'){const bw=faSeg(t,G.bow,G.bow+.5)*(1-faSeg(t,FI_FINAL-.6,FI_FINAL));if(t>G.dance&&t<G.bow){const cl=Math.abs(Math.sin((t-G.dance)*Math.PI/.54));pose.ra=1.2+.3*cl;pose.la=1.2+.3*cl;pose.mood='grin';hop=0;}
   if(bw>0){pose.tilt=.3*bw;pose.squash=1-.1*bw;pose.ra=faLerp(pose.ra,.3,bw);pose.la=faLerp(pose.la,.3,bw);pose.mood='closed';}}
  hold=t<T.rel||(n==='fanal'&&t>=G.catch)||t>=T.reset+.7;}
 pose.hop=hop;const [hx,hy]=faHand(px,py,ps,1,pose.ra);
 if(hold)pose.hold=cc=>{cc.rotate(-.35);faStick(cc);};
 faShadow(c,px,py,80,13,S);fiPerson(c,px,py,ps,'jugadora',pose);
 // the bitllot in the air, on the lane, with the dog, or hopping back to the hand
 if(t!=null&&!hold){const r=T.rel;let x,y,a;
  const lie=[330,590],held=[hx,hy-40];
  if(n==='fanal'){const [lx,ly]=FA_LAMP;if(t<G.lamp){const u=faSeg(t,r,G.lamp);x=faLerp(hx,lx-10,u);y=faLerp(hy-60,ly+30,u)-faHop(u,70);a=-.6+1.2*u;}else{const u=faSeg(t,G.lamp,G.catch);x=faLerp(lx-10,held[0],u);y=faLerp(ly+30,held[1],u)-faHop(u,120);a=.6-1.2*u;}}
  else if(n==='gos'){const land=[30,618],drop=[-230,668];
   if(t<G.land){const u=faSeg(t,r,G.land);x=faLerp(hx,land[0],u);y=faLerp(hy-60,land[1],u)-faHop(u,180);a=-.6+2*u;}
   else if(t<G.grab){x=land[0];y=land[1];a=1.5;}
   else if(t<G.drop){x=null;}
   else{const u=faSeg(t,T.reset,T.reset+.7);x=faLerp(drop[0],held[0],u);y=faLerp(drop[1],held[1],u)-faHop(u,120);a=faLerp(1.5,-.4,u);}}
  else{if(t<T.hit){const u=faSeg(t,r,T.hit);x=faLerp(hx,236,u);y=faLerp(hy-60,470,u)-faHop(u,170);a=-.6+1.3*u;}
   else if(t<T.reset){const u=faSeg(t,T.hit,T.hit+.45);x=faLerp(236,lie[0],u);y=faLerp(470,lie[1],u)-faHop(u,40);a=faLerp(.7,1.5,u);}
   else{const u=faSeg(t,T.reset,T.reset+.7);x=faLerp(lie[0],held[0],u);y=faLerp(lie[1],held[1],u)-faHop(u,160);a=faLerp(1.5,-.4,u);}}
  if(x!=null){c.save();c.translate(x,y);c.rotate(a);c.translate(0,-42);faStick(c);c.restore();}}
 // the dog: sits by the player, runs for the bitllot in its gag
 let dx=FA_DOGAT[0],dy=FA_DOGAT[1],flip=false,running=false,bone=null;
 if(n==='gos'&&t!=null){const land=[30,624],HX=S.HW+160,drop=[-230,676];
  if(t<G.run){}
  else if(t<G.grab){const u=KeaseInOut(faSeg(t,G.run,G.grab));dx=faLerp(FA_DOGAT[0],land[0]-70,u);dy=faLerp(FA_DOGAT[1],land[1],u);running=u<1;}
  else if(t<G.out){const u=faSeg(t,G.grab,G.out);dx=faLerp(land[0]-70,HX,u*u);dy=land[1];running=true;}
  else if(t<G.back){dx=HX;dy=land[1];}
  else if(t<G.drop){const u=KeaseOut(faSeg(t,G.back,G.drop));dx=faLerp(HX,drop[0]+40,u);dy=faLerp(land[1],drop[1],u);flip=true;running=u<1;}
  else if(t<T.reset+.2){dx=drop[0]+40;dy=drop[1];flip=true;}
  else{const u=KeaseInOut(faSeg(t,T.reset+.2,FI_SHOT-.1));dx=faLerp(drop[0]+40,FA_DOGAT[0],u);dy=faLerp(drop[1],FA_DOGAT[1],u);flip=true;running=u<1;}
  if(t>=G.grab&&t<G.drop)bone=cc=>{cc.rotate(1.45);cc.translate(0,-42);faStick(cc);};}
 faShadow(c,dx,dy,50,8,S);fiDog(c,dx,dy,FA_DOGAT[2],{flip,running,run:S.now*2.4,wag:S.now*(t!=null&&n==='gos'&&t>G.drop?2.2:.8),bone});}


// ── El canó de la bala humana ────────────────────────────────────────────────────────────────────────────────────────────
// The tin cannon on the left, the acrobat inside with only the helmet showing; the target of the gag on the right.
const FA_CANNON=Object.freeze([-300,598]),FA_BARREL=230,FA_AS=.55;
const faElev=S=>.5+.16*Ksmooth(S.antic);
function faCannon(c,e,shake,puff){const [x,y]=FA_CANNON;c.save();c.translate(x+shake,y);
 c.save();c.rotate(-e);fiSprite(c,'fa-barrel',[-70,-56,FA_BARREL+90,112],cc=>{const b=c2=>{c2.moveTo(-60,-42);c2.lineTo(FA_BARREL,-50);c2.lineTo(FA_BARREL,50);c2.lineTo(-60,42);c2.quadraticCurveTo(-78,0,-60,-42);c2.closePath();};
  fiPrint(cc,b,FI_INK.red,[-70,-50,FA_BARREL+70,100],{shade:[0,0,0,1],sheen:1.3,key:5,pattern:c2=>{c2.save();c2.beginPath();b(c2);c2.clip();c2.fillStyle=FI_INK.gold;c2.fillRect(40,-60,14,120);c2.fillRect(120,-60,14,120);for(let i=0;i<3;i++){c2.beginPath();fiStarPath(-10+i*80+47,0,12)(c2);c2.fillStyle=FI_INK.cream;c2.fill();}c2.restore();}});
  fiPrint(cc,fiEll(FA_BARREL,0,14,52),FI_INK.gold,[FA_BARREL-14,-52,28,104],{ht:.3,sheen:1.5,key:4});fiPrint(cc,fiEll(FA_BARREL+2,0,7,40),'#2a2522',[FA_BARREL-5,-40,14,80],{ht:0,sheen:0,wear:false,key:2});});
 c.restore();
 fiSprite(c,'fa-carriage',[-120,-40,240,110],cc=>{fiPrint(cc,fiPoly([[-100,40],[90,40],[60,-20],[-70,-20]]),FI_INK.navy,[-100,-20,190,60],{shade:[0,0,1,1],sheen:1,key:5});for(const dx of [-70,60]){fiPrint(cc,fiEll(dx,40,32,32),FI_INK.gold,[dx-32,8,64,64],{ht:.3,sheen:1.3,key:4});fiPrint(cc,fiEll(dx,40,10,10),FI_INK.grey,[dx-10,30,20,20],{ht:0,sheen:1.4,key:3,wear:false});fiRivet(cc,dx,40,4);}});
 c.restore();
 const m=faMouth(e);faPuff(c,m[0]+20,m[1]-20,puff,1.6);}
const faMouth=e=>[FA_CANNON[0]+Math.cos(e)*FA_BARREL,FA_CANNON[1]-Math.sin(e)*FA_BARREL];
// The prop each gag of the cannon lands on.
const FA_NET=Object.freeze([330,545]),FA_DRUM=Object.freeze([340,600]),FA_BALE=Object.freeze([330,612]),FA_TRAMP=Object.freeze([330,612]),FA_POLE=Object.freeze([330,300]),FA_ELE=Object.freeze([455,652]),FA_ES=1.05;
function faNet(c,dip){const [x,y]=FA_NET;for(const dx of [-120,120])fiPrint(c,fiRR(x+dx-6,y-10,12,90,4),FI_INK.navy,[x+dx-6,y-10,12,90],{ht:.3,sheen:1.2,key:4,wear:false});
 c.save();c.strokeStyle=FI_INK.key;c.lineWidth=7;c.beginPath();c.moveTo(x-120,y);c.quadraticCurveTo(x,y+30+dip*2,x+120,y);c.stroke();c.strokeStyle=FI_INK.cream;c.lineWidth=2;for(let i=-5;i<=5;i++){c.beginPath();c.moveTo(x+i*22,y+(1-(i/5.5)**2)*(15+dip));c.lineTo(x+i*20,y+20+(1-(i/5.5)**2)*(15+dip));c.stroke();}
 c.lineWidth=4;c.strokeStyle=FI_INK.red;c.beginPath();c.moveTo(x-120,y);c.quadraticCurveTo(x,y+30+dip*2,x+120,y);c.stroke();c.restore();}
function faDrum(c,dip){const [x,y]=FA_DRUM;c.save();c.translate(x,y);fiSprite(c,'fa-drum',[-110,-130,220,140],cc=>{fiPrint(cc,fiRR(-95,-110,190,110,10),FI_INK.red,[-95,-110,190,110],{shade:[0,0,1,0],sheen:1.2,key:5,pattern:c2=>{c2.strokeStyle=FI_INK.gold;c2.lineWidth=4;c2.beginPath();for(let i=0;i<6;i++){c2.moveTo(-95+i*38,-110);c2.lineTo(-76+i*38,0);}c2.stroke();}});fiBead(cc,-95,-108,95,-108,8);fiBead(cc,-95,-2,95,-2,8);});c.restore();
 c.save();c.translate(x,y-110);fiPrint(c,fiEll(0,dip*.5,92,18+dip*.4),FI_INK.cream,[-92,-18,184,36+dip],{ht:.3,sheen:.8,key:4,wear:false});c.restore();}
function faBale(c,squash){const [x,y]=FA_BALE;c.save();c.translate(x,y);c.scale(1+.06*squash,1-.08*squash);fiSprite(c,'fa-bale',[-110,-110,220,116],cc=>{fiPrint(cc,fiRR(-100,-100,200,100,14),FI_INK.gold,[-100,-100,200,100],{shade:[0,0,1,1],sheen:.6,key:5,pattern:c2=>{c2.strokeStyle='rgba(140,90,20,.6)';c2.lineWidth=2;for(let i=0;i<14;i++){c2.beginPath();c2.moveTo(-96+i*14,-96);c2.lineTo(-90+i*14,-4);c2.stroke();}c2.fillStyle=FI_INK.red2;c2.fillRect(-100,-70,200,7);c2.fillRect(-100,-34,200,7);}});});c.restore();}
function faTramp(c,dip){const [x,y]=FA_TRAMP;for(const dx of [-80,80])fiPrint(c,fiRR(x+dx-5,y-40,10,40,3),FI_INK.grey,[x+dx-5,y-40,10,40],{ht:0,sheen:1.3,key:3,wear:false});
 c.save();c.translate(x,y-42);fiPrint(c,fiEll(0,dip*.3,96,16+dip*.3),FI_INK.navy,[-96,-16,192,32+dip],{ht:.3,sheen:1,key:4,wear:false});fiPrint(c,fiEll(0,dip*.3,70,10+dip*.2),FI_INK.teal,[-70,-10,140,20+dip],{ht:0,sheen:.8,key:2,wear:false});c.restore();}
function faPole(c,sway){const [x,y]=FA_POLE;c.save();c.translate(x,620);c.rotate(sway);fiPrint(c,fiRR(-8,y-620,16,620-y,5),FI_INK.cream,[-8,y-620,16,620-y],{ht:.2,sheen:1.2,key:4,pattern:c2=>{c2.fillStyle=FI_INK.red;for(let j=y-620+30;j<0;j+=60)c2.fillRect(-9,j,18,26);}});
 c.translate(0,y-620);fiPrint(c,fiRR(-34,-6,68,12,4),FI_INK.gold,[-34,-6,68,12],{ht:0,sheen:1.3,key:4,wear:false});for(const dx of [-26,26])fiPrint(c,fiRR(dx-4,-6,8,44,3),FI_INK.gold,[dx-4,-6,8,44],{ht:0,sheen:1.2,key:3,wear:false});fiPrint(c,fiRR(-30,-60,8,56,3),FI_INK.gold,[-30,-60,8,56],{ht:0,sheen:1.2,key:3,wear:false});c.restore();
 fiPrint(c,fiRR(x-50,604,100,20,6),FI_INK.navy,[x-50,604,100,20],{ht:.3,sheen:1,key:4});}
// Where the pole's seat is (it sways from the foot).
const faSeat=sway=>[FA_POLE[0]+Math.sin(sway)*(620-FA_POLE[1]),620-Math.cos(sway)*(620-FA_POLE[1])-6];
const faUmbrella=(c,open)=>{c.save();c.strokeStyle=FI_INK.key;c.lineWidth=4;c.beginPath();c.moveTo(0,-20);c.lineTo(0,120);c.stroke();c.translate(0,120);c.scale(1,-1);const w=40+110*open;
 fiPrint(c,cc=>{cc.moveTo(-w,0);cc.quadraticCurveTo(0,-110*open-14,w,0);for(let i=4;i>=0;i--){const x=-w+2*w*i/4;cc.quadraticCurveTo(x+w/4,10,x,0);}cc.closePath();},FI_INK.red,[-w,-130,2*w,140],{ht:.4,sheen:1,key:4,wear:false,pattern:cc=>{cc.fillStyle=FI_INK.cream;cc.beginPath();cc.moveTo(0,-110*open-14);cc.lineTo(-w*.35,4);cc.lineTo(w*.35,4);cc.closePath();cc.fill();}});c.restore();};
function faCano(c,S){const T=FI_T.cano,t=S.t,n=S.name,G=n?T[n]||{}:{},prop=n||S.next,pu=KeaseBack(S.propU);
 const e=t==null?faElev(S):faElev({antic:1})-.08*faSeg(t,0,.15)*(1-faSeg(t,.3,.9)),shake=S.go?Math.sin(S.now*30)*1.2:t!=null&&t<.4?Math.sin(t*60)*3*(1-t/.4):0;
 const m=faMouth(e),dir=[Math.cos(e),-Math.sin(e)],H=FI_HEAD_Y*FA_AS;
 // the acrobat: inside, flying, on the target, or hopping back into the cannon
 let A=null;const fly=(p0,p1,h,u,rot0=.9,rot1=-.2)=>({x:faLerp(p0[0],p1[0],u),y:faLerp(p0[1],p1[1],u)-faHop(u,h),rot:faLerp(rot0,rot1,u),pose:{la:2.9,ra:2.9,mood:'grin'}});
 const out=[m[0]+dir[0]*40,m[1]+dir[1]*40];
 let dip=0,sway=0,squash=0;
 if(t!=null&&t>=T.rel){const R=T.reset,ret=faSeg(t,R-1,R);
  let land=null,stand=null;
  if(n==='xarxa'){const [x,y]=FA_NET,cy=y-FA_AS*150+10;if(t<G.b1)A=fly(out,[x,cy],260,faSeg(t,T.rel,G.b1));else if(t<G.stand){const bs=[[G.b1,G.b2,90],[G.b2,G.b3,40],[G.b3,G.stand,12]];for(const [a,b,h] of bs)if(t>=a&&t<b){const u=faSeg(t,a,b);A={x,y:cy-faHop(u,h),rot:0,pose:{la:2.4,ra:2.4,mood:'grin'}};dip=Math.max(0,24*(1-u*6))*(h/90);}}
   else stand=[x,y+10];}
  else if(n==='timbal'){const [x,y]=FA_DRUM,cy=y-110-FA_AS*150;if(t<G.b1)A=fly(out,[x,cy],260,faSeg(t,T.rel,G.b1));else if(t<G.stand){for(const [a,b,h] of [[G.b1,G.b2,80],[G.b2,G.b3,36],[G.b3,G.stand,10]])if(t>=a&&t<b){const u=faSeg(t,a,b);A={x,y:cy-faHop(u,h),rot:0,pose:{la:2.4,ra:2.4,mood:'o'}};dip=Math.max(0,22*(1-u*6))*(h/80);}}else stand=[x,y-110];}
  else if(n==='palla'){const [x,y]=FA_BALE;if(t<T.hit)A=fly(out,[x,y-80],240,faSeg(t,T.rel,T.hit),.9,2.6);else if(t<G.out){squash=Math.exp(-(t-T.hit)*5);A={x,y:y-30,rot:Math.PI,hidden:true,legs:true};}else{const u=faSeg(t,G.out,G.out+.4);stand=[x,y-100+20*(1-KeaseBack(u))];A={straw:true};}}
  else if(n==='trampoli'){const [x,y]=FA_TRAMP;if(t<T.hit)A=fly(out,[x,y-42-FA_AS*150],240,faSeg(t,T.rel,T.hit));else if(t<G.inside){const u=faSeg(t,T.hit,G.inside);dip=t<T.hit+.15?20:0;A={...fly([x,y-42-FA_AS*150],[m[0],m[1]],220,u,-.2,-1.4),pose:{la:2.9,ra:2.9,mood:'o'}};}else A={inside:true,dizzy:t>=G.dizzy};}
  else if(n==='elefant'){const tip=FA_TIP;if(t<G.catch)A=fly(out,[tip[0],tip[1]+44],230,faSeg(t,T.rel,G.catch));else if(t<G.down){A={x:tip[0],y:tip[1]+44,rot:.12*Math.sin((t-G.catch)*3),pose:{la:2.6,ra:.4,mood:'grin'}};}else{const u=KeaseInOut(faSeg(t,G.down,G.down+.8));if(u<1)A={x:faLerp(tip[0],250,u),y:faLerp(tip[1]+44,640-FA_AS*150,u),rot:0,pose:{la:2,ra:.4,mood:'grin'}};else stand=[250,640];}}
  else if(n==='paraigua'){const hi=[180,S.top-160];if(t<1.5)A=fly(out,hi,180,faSeg(t,T.rel,1.5),.9,.4);else if(t<G.open)A={x:180,y:S.top-200,rot:0,pose:{la:2.9,ra:2.9,mood:'o'}};else if(t<G.land){const u=faSeg(t,G.open,G.land);A={x:180+120*u+30*Math.sin(u*9),y:faLerp(S.top+60,640-FA_AS*150,u),rot:.12*Math.sin(u*9),pose:{ra:2.9,la:.4,mood:'smile'},umb:1};}else stand=[300,640];}
  else if(n==='cadira'){sway=t>G.wobble?.05*Math.sin((t-G.wobble)*5)*(1-faSeg(t,G.wobble,G.still)):0;const st=faSeat(sway);if(t<T.hit)A=fly(out,[st[0],st[1]-FA_AS*150],280,faSeg(t,T.rel,T.hit));else stand=st;}
  if(stand){const bw=n==='cadira'?faSeg(t,G.bow,G.bow+.5):0,still=n==='cadira'?faSeg(t,G.still,G.still+.3):1,ch=faSeg(t,T.cheer,T.cheer+.3);
   A={...(A||{}),stand,pose:{la:faLerp(.8,2.7,ch*still),ra:faLerp(.8,2.7,ch*still),mood:bw>0?'closed':'grin',straw:A?.straw,tilt:.3*bw,squash:1-.1*bw,lean:n==='cadira'?sway+(t<G.still&&t>G.wobble?.15*Math.sin((t-G.wobble)*7):0):0}};}
  // back into the cannon before the next launch (not after the finale)
  if(!S.shot?.final&&ret>0&&!(A&&A.inside)){const p0=A?.stand?[A.stand[0],A.stand[1]-FA_AS*150]:A?[A.x,A.y]:[m[0],m[1]];A={x:faLerp(p0[0],m[0],ret),y:faLerp(p0[1],m[1],ret)-faHop(ret,180),rot:faLerp(0,-1.3,ret),pose:{la:2.9,ra:2.9,mood:'grin'},fade:ret};}}
 // the props: the target of the gag
 c.save();
 if(prop==='xarxa'){c.translate(FA_NET[0],620);c.scale(pu,pu);c.translate(-FA_NET[0],-620);faNet(c,dip);}
 if(prop==='timbal'){c.translate(FA_DRUM[0],FA_DRUM[1]);c.scale(pu,pu);c.translate(-FA_DRUM[0],-FA_DRUM[1]);faShadow(c,FA_DRUM[0],FA_DRUM[1],100,10,S);faDrum(c,dip);}
 if(prop==='palla'){c.translate(FA_BALE[0],FA_BALE[1]);c.scale(pu,pu);c.translate(-FA_BALE[0],-FA_BALE[1]);faShadow(c,FA_BALE[0],FA_BALE[1],110,10,S);faBale(c,squash);}
 if(prop==='trampoli'){c.translate(FA_TRAMP[0],FA_TRAMP[1]);c.scale(pu,pu);c.translate(-FA_TRAMP[0],-FA_TRAMP[1]);faShadow(c,FA_TRAMP[0],FA_TRAMP[1],100,10,S);faTramp(c,dip);}
 if(prop==='cadira'){c.translate(FA_POLE[0],620);c.scale(pu,pu);c.translate(-FA_POLE[0],-620);faPole(c,sway);}
 c.restore();
 // the elephant (its gag): the trunk goes up for the catch and down to put the acrobat on the ground
 if(prop==='elefant'){const tr=t==null?.15+.1*Math.sin(S.now*.9):t<G.catch-.6?faSeg(t,0,G.catch-.6):t<G.down?1:1-faSeg(t,G.down,G.down+.8);c.save();c.translate(FA_ELE[0],FA_ELE[1]);c.scale(pu,pu);faShadow(c,0,0,110,12,S);fiElephant(c,0,0,FA_ES,{trunk:tr});c.restore();}
 // the acrobat behind the cannon's mouth (inside), then the cannon
 const inside=t==null||t<T.rel||(A&&A.inside),duck=t==null?-8+26*Ksmooth(S.antic):-8;
 const drawIn=(mood,stars)=>{const f=[m[0]-dir[0]*(H+duck),m[1]-dir[1]*(H+duck)];c.save();c.translate(f[0],f[1]);c.rotate(Math.PI/2-e);fiPerson(c,0,0,FA_AS,'acrobata',{noStand:true,la:2.9,ra:2.9,mood,stars,blink:!S.reduced&&(S.now%3.7)<.12});c.restore();};
 if(inside)drawIn(A?.dizzy?'dizzy':S.go?'effort':'smile',A?.dizzy?S.now:0);
 faShadow(c,FA_CANNON[0],FA_CANNON[1]+70,140,14,S);faCannon(c,e,shake,t==null?0:faSeg(t,.05,1.3));
 if(A&&!A.inside&&!A.hidden){if(A.stand)fiPerson(c,A.stand[0],A.stand[1],FA_AS,'acrobata',{...A.pose,noStand:true});
  else{const pose={...A.pose};if(A.umb)pose.hold=cc=>faUmbrella(cc,KeaseOut(faSeg(t,G.open,G.open+.4)));faFly(c,A.x,A.y,FA_AS,'acrobata',A.rot,pose);}}
 if(A&&A.legs){const [x,y]=FA_BALE;c.save();c.translate(x,y-100);c.rotate(Math.PI);fiPerson(c,0,-60,FA_AS,'acrobata',{noStand:true,la:0,ra:0});c.restore();faBale(c,squash);}}
// The tip of the elephant's raised trunk.
const FA_TIP=Object.freeze([FA_ELE[0]+(-220)*FA_ES,FA_ELE[1]+(-210)*FA_ES]);

// ── El coet de corda ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A tin rocket on its pad, the boy who winds it, the printed moon in the sky; the box of its gag on the right.
const FA_PAD=Object.freeze([-60,612]),FA_RH=190,FA_MOON=Object.freeze([290,255]),FA_BOX=Object.freeze([340,640]);
const FA_RC=Object.freeze([FA_PAD[0],FA_PAD[1]-FA_RH/2]);
function faRocket(c,x,y,a,sx=1,key=0){c.save();c.translate(x,y);c.rotate(a);c.scale(sx,1);
 fiSprite(c,'fa-rocket',[-62,-100,124,206],cc=>{
  for(const s of [-1,1])fiPrint(cc,fiPoly([[s*24,30],[s*58,86],[s*52,98],[s*20,80]]),FI_INK.red,[Math.min(s*58,s*20),30,38,68],{ht:.4,sheen:1.2,key:4,wear:false});
  const body=c2=>{c2.moveTo(-30,88);c2.lineTo(-30,-30);c2.quadraticCurveTo(-28,-70,0,-95);c2.quadraticCurveTo(28,-70,30,-30);c2.lineTo(30,88);c2.closePath();};
  fiPrint(cc,body,FI_INK.cream,[-30,-95,60,183],{shade:[0,0,1,0],sheen:1.3,key:5,pattern:c2=>{c2.save();c2.beginPath();body(c2);c2.clip();c2.fillStyle=FI_INK.red;c2.fillRect(-40,-100,80,48);c2.fillStyle=FI_INK.navy;c2.fillRect(-40,46,80,12);c2.fillStyle=FI_INK.gold;c2.fillRect(-40,62,80,6);c2.restore();}});
  fiPrint(cc,fiEll(0,0,15,15),FI_INK.navy,[-15,-15,30,30],{ht:.2,sheen:1.6,key:4,wear:false});fiRivet(cc,-22,20,3);fiRivet(cc,22,20,3);fiPrint(cc,fiRR(-14,88,28,10,3),FI_INK.grey,[-14,88,28,10],{ht:0,sheen:1.3,key:3,wear:false});});
 // the wind-up key on its side (it turns slowly)
 c.save();c.translate(-34,25);c.rotate(key);c.fillStyle=FI_INK.tin;c.strokeStyle=FI_INK.key;c.lineWidth=2.5;c.beginPath();c.ellipse(-10,0,9,6,0,0,FI_TAU);c.ellipse(-26,0,9,6,0,0,FI_TAU);c.fill();c.stroke();c.fillRect(-12,-2,12,4);c.restore();
 c.restore();}
function faMoon(c,lid){const [x,y]=FA_MOON,R=72,spr=cc=>fiSprite(cc,'fa-moon',[-R-8,-R-8,2*R+16,2*R+16],c2=>{fiPrint(c2,fiEll(0,0,R,R),'#f3e3a6',[-R,-R,2*R,2*R],{ht:.4,shade:[0,0,1,1],sheen:.9,key:5});for(const [dx,dy,r] of [[-24,-14,14],[18,20,10],[26,-28,8],[-12,32,7]])fiPrint(c2,fiEll(dx,dy,r,r),'#d9c27e',[dx-r,dy-r,2*r,2*r],{ht:0,sheen:0,key:2,wear:false});});
 c.save();c.translate(x,y);if(lid<=0){spr(c);c.restore();return;}
 // the moon is a round tin box: in the finale its lid (the top half) opens on a hinge
 c.save();c.beginPath();c.rect(-R-10,0,2*R+20,R+10);c.clip();spr(c);c.restore();c.fillStyle='#3a2a1e';c.beginPath();c.ellipse(0,0,R-4,10,0,0,FI_TAU);c.fill();
 c.translate(R,0);c.rotate(-1.25*lid);c.translate(-R,0);c.beginPath();c.rect(-R-10,-R-10,2*R+20,R+10);c.clip();spr(c);c.restore();}
function faBox(c,lid){const [x,y]=FA_BOX;c.save();c.translate(x,y);fiSprite(c,'fa-box',[-90,-120,180,126],cc=>fiPrint(cc,fiRR(-80,-110,160,110,4),'#c79a5e',[-80,-110,160,110],{shade:[0,0,1,1],sheen:.5,key:5,pattern:c2=>{c2.fillStyle='rgba(120,70,30,.5)';c2.fillRect(-80,-60,160,8);c2.save();c2.beginPath();fiStarPath(0,-34,14)(c2);c2.fillStyle=FI_INK.red;c2.fill();c2.restore();}}));
 for(const s of [-1,1]){c.save();c.translate(s*80,-110);c.rotate(s*(1.9-1.9*lid));fiPrint(c,fiRR(s>0?-80:0,-6,80,12,3),'#b88a50',[s>0?-80:0,-6,80,12],{ht:.3,sheen:.4,key:4,wear:false});c.restore();}c.restore();}
function faChute(c,x,y,u){if(u<=0)return;const w=30+90*u,h=20+70*u;c.save();c.strokeStyle=FI_INK.key;c.lineWidth=2;c.beginPath();c.moveTo(x-20,y-80);c.lineTo(x-w,y-80-h*.7);c.moveTo(x+20,y-80);c.lineTo(x+w,y-80-h*.7);c.moveTo(x,y-90);c.lineTo(x,y-80-h);c.stroke();
 fiPrint(c,cc=>{cc.moveTo(x-w,y-80-h*.7);cc.quadraticCurveTo(x,y-80-h*1.7,x+w,y-80-h*.7);cc.quadraticCurveTo(x,y-80-h*.95,x-w,y-80-h*.7);cc.closePath();},FI_INK.gold,[x-w,y-80-h*1.4,2*w,h*.8],{ht:.4,sheen:.8,key:4,wear:false,pattern:cc=>{cc.fillStyle=FI_INK.red;cc.fillRect(x-w*.3,y-80-h*1.5,w*.6,h*.9);}});c.restore();}
// The path of the rocket in a gag: centre x, y, tilt a, flip sx.
function faRocketAt(t,n,G,T,top){const [x0,y0]=FA_RC,rel=T.rel,up=(t1,y1,x1=x0)=>{const u=KeaseOut(faSeg(t,rel,t1));return [faLerp(x0,x1,u),faLerp(y0,y1,u)];},home=(t0,t1,p)=>{const u=KeaseInOut(faSeg(t,t0,t1));return [faLerp(p[0],x0,u),faLerp(p[1],y0,u)];};
 if(t<rel)return {x:x0,y:y0,a:0};
 if(n==='paracaigudes'){if(t<G.top){const [x,y]=up(G.top,300);return {x,y,a:0};}const u=faSeg(t,G.top,G.land);return {x:x0+30*Math.sin(u*7)*(1-u),y:faLerp(300,y0,Ksmooth(u)),a:.12*Math.sin(u*7)*(1-u),chute:Ksmooth(faSeg(t,G.open,G.open+.4))*(1-faSeg(t,G.land,G.land+.4))};}
 if(n==='lluna'){const [mx,my]=FA_MOON,R=130,st=[mx-R,my];if(t<G.moon){const u=KeaseInOut(faSeg(t,rel,G.moon));return {x:faLerp(x0,st[0],u),y:faLerp(y0,st[1],u)-faHop(u,120),a:.5*u};}
  if(t<G.down){const u=faSeg(t,G.moon,G.down),f=Math.PI+FI_TAU*u;return {x:mx+Math.cos(f)*R,y:my+Math.sin(f)*R*.75,a:.5*Math.cos(u*FI_TAU),sx:Math.sin(f)>0?-1:1,behind:Math.sin(f)>.2&&Math.cos(f)>-.5&&Math.cos(f)<.5};}
  const [x,y]=home(G.down,G.land,st);return {x,y,a:.5*(1-faSeg(t,G.down,G.land))};}
 if(n==='estrella'){if(t<G.out){const [x,y]=up(G.out,top-160,x0+60);return {x,y,a:.15};}if(t<G.back)return {x:-999,y:-999,a:0};const [x,y]=home(G.back,G.land,[x0+120,top-160]);return {x,y,a:-.15*(1-faSeg(t,G.back,G.land)),star:true};}
 if(n==='fum'){const cy=330,cx=x0+100;if(t<G.loop){const [x,y]=up(G.loop,cy);return {x,y,a:0};}const L1=G.loop+4;if(t<L1){const f=Math.PI+FI_TAU*faSeg(t,G.loop,L1);return {x:cx+Math.cos(f)*100,y:cy+Math.sin(f)*100,a:f-Math.PI,smoke:true};}
  const [x,y]=home(L1,G.land,[x0,cy]);return {x,y,a:0};}
 if(n==='tirabuixo'){if(t<G.top){const u=faSeg(t,rel,G.top);return {x:x0+70*Math.sin(u*FI_TAU*2),y:faLerp(y0,220,KeaseOut(u)),a:.25*Math.cos(u*FI_TAU*2),sx:Math.cos(u*FI_TAU*3)};}const [x,y]=home(G.top,G.land,[x0,220]);return {x,y,a:0};}
 if(n==='capsa'){const [bx,by]=FA_BOX;if(t<G.top){const [x,y]=up(G.top,220);return {x,y,a:0};}if(t<G.into){const u=KeaseInOut(faSeg(t,G.top,G.into));return {x:faLerp(x0,bx,u),y:faLerp(220,by-60,u)-faHop(u,100),a:.6*Math.sin(u*Math.PI)};}
  if(t<G.hop)return {x:bx,y:by-60,a:0,inBox:true};const u=faSeg(t,G.hop,G.hop+1.2);return {x:faLerp(bx,x0,KeaseInOut(u)),y:faLerp(by-60,y0,u)-faHop(u,220),a:-.5*Math.sin(u*Math.PI),inBox:u<.12};}
 if(n==='pluja'){const [mx,my]=FA_MOON,st=[mx-110,my+30];if(t<G.moon){const u=KeaseInOut(faSeg(t,rel,G.moon));return {x:faLerp(x0,st[0],u),y:faLerp(y0,st[1],u)-faHop(u,140),a:.5*u};}if(t<G.back)return {x:st[0],y:st[1]+4*Math.sin(t*3),a:.5};const [x,y]=home(G.back,G.land,st);return {x,y,a:.5*(1-faSeg(t,G.back,G.land))};}
 return {x:x0,y:y0,a:0};}
function faCoet(c,S){const T=FI_T.coet,t=S.t,n=S.name,G=n?T[n]||{}:{},prop=n||S.next,pu=KeaseBack(S.propU);
 // the moon (its box opens in the finale) and the rain of foil stars
 const lid=n==='pluja'&&t!=null?KeaseOut(faSeg(t,G.lid,G.lid+.6))*(1-KeaseInOut(faSeg(t,FI_FINAL-1.4,FI_FINAL-.6))):0;faMoon(c,lid);
 if(n==='pluja'&&t>G.rain){const [mx,my]=FA_MOON;for(let i=0;i<26;i++){const t0=G.rain+i*.15,u=(t-t0)/3.6;if(u<0)continue;const x=mx-60+((i*137)%120)+(-300+((i*71)%420))*u+18*Math.sin(t*2+i),y=my+u*(640-my)*(1-.1*(i%3)),fade=1-faSeg(t,FI_FINAL-1.6,FI_FINAL-.6);
  if(u>1.25||fade<=0)continue;c.save();c.globalAlpha*=fade*(u>1?1-(u-1)*4:1);c.translate(x,y);c.scale(Math.cos(t*2.2+i)*.8+.2*Math.sign(Math.cos(t*2.2+i)||1),1);fiPrint(c,fiStarPath(0,0,13),[FI_INK.gold,'#e9e4d8',FI_INK.gold,'#f0c7c7'][i%4],[-13,-13,26,26],{ht:0,sheen:1.6,key:2.5,wear:false});c.restore();}}
 if(prop==='capsa'){const L=t==null?1:t<G.shut?1:t<G.open?0:KeaseOut(faSeg(t,G.open,G.open+.3));c.save();c.translate(FA_BOX[0],FA_BOX[1]);c.scale(pu,pu);c.translate(-FA_BOX[0],-FA_BOX[1]);faShadow(c,FA_BOX[0],FA_BOX[1],90,10,S);faBox(c,L);c.restore();}
 // the boy: winds the key, steps back during the count, watches, cheers
 let bx=-190,pose={ra:.7+.1*Math.sin(S.now*4),la:.15,mood:'smile',blink:!S.reduced&&(S.now%3.9)<.12},hop=0;const key=t==null&&S.antic===0?S.now*1.4:0;
 if(t==null&&S.antic>0){const u=Ksmooth(Kclamp(S.antic*2));bx=faLerp(-190,-290,u);pose.ra=faLerp(.7,2.75,u);pose.la=faLerp(.15,2.75,u);pose.mood=S.antic>.6?'o':'smile';pose.lean=-.05*u;}
 if(S.go){pose.ra=pose.la=2.75+.02*Math.sin(S.now*30);}
 if(t!=null){bx=-290;const ch=faSeg(t,T.cheer,T.cheer+.25)*(1-faSeg(t,T.cheer+1.4,T.cheer+1.8));pose.ra=pose.la=faLerp(t<.6?2.75:faLerp(2.75,.4,faSeg(t,.6,1.2)),2.7,ch);pose.mood=ch>0?'grin':'o';
  hop=faHop(faSeg(t,T.cheer,T.cheer+.5),24)*(ch>0?1:0);const back=faSeg(t,T.reset-.4,T.reset+.4);if(!S.shot?.final){bx=faLerp(-290,-190,KeaseInOut(back));if(back>0)pose.ra=faLerp(pose.ra,.7,back);}
  if(n==='pluja'){const bw=faSeg(t,G.bow,G.bow+.5);if(t>G.rain&&t<G.bow){pose.ra=pose.la=2.6;pose.mood='grin';}if(bw>0){pose.tilt=.3*bw;pose.squash=1-.1*bw;pose.ra=pose.la=.3;pose.mood='closed';}}}
 pose.hop=hop;faShadow(c,bx,665,60,10,S);fiPerson(c,bx,665,.8,'nen',pose);
 // the rocket
 const R=t==null?{x:FA_RC[0],y:FA_RC[1],a:0}:faRocketAt(t,n,G,T,S.top),sh=S.go?Math.sin(S.now*31)*1.4:S.antic>0?Math.sin(S.now*27)*S.antic:0;
 if(R.smoke)for(let k=1;k<=14;k++){const tt=t-k*.16;if(tt<G.loop)break;const Q=faRocketAt(tt,n,G,T,S.top);faPuff(c,Q.x,Q.y+30,Kclamp(.35+k/24),.6);}
 if(t!=null&&t<1.2)faPuff(c,FA_PAD[0],FA_PAD[1]-20,faSeg(t,.15,1.2),1.3);
 if(t==null&&S.antic>.3)faPuff(c,FA_PAD[0]-40+((S.now*30)%30),FA_PAD[1]-14,(S.now*.9)%1,.5);
 if(R.chute)faChute(c,R.x,R.y,R.chute);
 if(!R.behind&&!R.inBox&&R.x>-900)faRocket(c,R.x+sh,R.y,R.a,R.sx??1,key);
 if(R.star){c.save();c.translate(R.x,R.y);c.rotate(R.a);fiPrint(c,fiStarPath(0,-104,30),FI_INK.gold,[-30,-134,60,60],{ht:.3,sheen:1.5,key:4,wear:false});c.restore();}}

// ── La força ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The strength tester: a tall printed tower with a bell on top and a tin puck on its rail; the lever at its foot; the strongman with
// his wooden mallet on the left.
const FA_TX=190,FA_TB=592,FA_TLEN=350,FA_PADX=99,FA_MAN=Object.freeze([-90,640,.95]),FA_STRIKE=.7;
const FA_BANDS=Object.freeze([FI_INK.teal,FI_INK.green,FI_INK.gold,FI_INK.orange,FI_INK.red]);
function faMallet(c){fiSprite(c,'fa-mallet',[-34,-6,68,152],cc=>{fiPrint(cc,fiRR(-5,0,10,112,4),'#c49058',[-5,0,10,112],{ht:.3,sheen:1,key:3.5,wear:false});fiPrint(cc,fiRR(-30,104,60,40,7),'#8a5a32',[-30,104,60,40],{ht:.5,shade:[0,0,1,1],sheen:1,key:4.5});fiBead(cc,-30,110,30,110,4);fiBead(cc,-30,138,30,138,4);});}
function faBell(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);fiSprite(c,'fa-bell',[-40,-12,80,72],cc=>{fiPrint(cc,c2=>{c2.moveTo(-30,52);c2.quadraticCurveTo(-28,4,0,0);c2.quadraticCurveTo(28,4,30,52);c2.closePath();},FI_INK.gold,[-30,0,60,52],{ht:.4,shade:[0,0,1,1],sheen:1.6,key:4.5});fiPrint(cc,fiEll(0,54,8,8),FI_INK.brown,[-8,46,16,16],{ht:0,sheen:1,key:3,wear:false});fiRivet(cc,0,-2,5);});c.restore();}
function faNest(c,x,y,s,bird){c.save();c.translate(x,y);c.scale(s,s);fiPrint(c,fiEll(0,0,34,14),'#9c6a34',[-34,-14,68,28],{ht:.5,sheen:.3,key:4,wear:false,pattern:cc=>{cc.strokeStyle='rgba(60,30,10,.6)';cc.lineWidth=2;for(let i=0;i<6;i++){cc.beginPath();cc.moveTo(-30+i*10,-8);cc.lineTo(-22+i*10,10);cc.stroke();}}});
 if(bird){c.save();c.translate(4,-16+bird);fiPrint(c,fiEll(0,0,16,12),FI_INK.blue,[-16,-12,32,24],{ht:.3,sheen:1,key:3,wear:false});fiPrint(c,fiEll(14,-10,9,9),FI_INK.blue,[5,-19,18,18],{ht:0,sheen:1,key:3,wear:false});c.fillStyle=FI_INK.key;c.beginPath();c.arc(17,-12,2.2,0,FI_TAU);c.fill();c.fillStyle=FI_INK.gold;c.beginPath();c.moveTo(22,-10);c.lineTo(30,-8);c.lineTo(22,-6);c.closePath();c.fill();c.restore();}
 c.restore();}
function faForca(c,S){const T=FI_T.forca,t=S.t,n=S.name,G=n?T[n]||{}:{},prop=n||S.next;
 // the tower's height (it stretches in the accordion), the puck (0 at the foot, 1 at the bell), the bell's swing, the lights
 let st=1,h=0,bell=0,lights=0,free=null,nest=0,bird=0;const down=(t0,t1)=>1-KeaseInOut(faSeg(t,t0,t1));
 if(t!=null){const R=T.reset;
  if(n==='mitja'){h=t<G.top?.5*KeaseOut(faSeg(t,T.hit,G.top)):t<G.down?.5:.5*(1-faSeg(t,G.down,G.down+1.8))+.02*Math.sin(t*14)*(t<G.down+1.8?1:0);}
  else if(n==='fluix'){h=.12*faHop(faSeg(t,G.creep,G.creep+1.4),1);}
  else if(n==='acordio'){st=1+.16*KeaseOut(faSeg(t,G.grow,G.ring))*(1-KeaseBack(faSeg(t,G.back,G.back+.5)));h=t<G.grow?.94*KeaseOut(faSeg(t,T.hit,G.grow)):t<G.ring?.94+.06*faSeg(t,G.grow,G.ring):down(G.back+.6,R);}
  else if(n==='niu'){if(t<T.hit+.3)h=KeaseOut(faSeg(t,T.hit,T.hit+.3));else if(t<G.out){h=1;free=faLerp(0,1,faSeg(t,T.hit+.3,G.out));}else if(t<G.back){free=1;}else if(t<G.nest){free=1-KeaseOut(faSeg(t,G.back,G.nest));h=1;}else h=down(G.nest+.6,R);
   nest=t>=G.back?1:0;bird=t>G.nest?faHop(((t-G.nest)*2.2)%1,8):0;}
  else{h=t<G.ring?KeaseOut(faSeg(t,T.hit,G.ring||1.25)):n==='llums'?1:down(T.cheer+.6,R);}
  if(G.ring!=null&&t>G.ring&&n!=='gronxa')bell=.3*Math.exp(-(t-G.ring)*1.5)*Math.sin((t-G.ring)*11);
  if(n==='gronxa'&&t>G.swing)bell=1.05*Math.exp(-(t-G.swing)*.45)*Math.sin((t-G.swing)*FI_TAU/1.6);
  if(n==='llums'){lights=Kclamp((t-G.lights)/.18+1);if(t>G.melody&&t<G.melody+4.5)bell=.12*Math.sin((t-G.melody)*FI_TAU/.6);}}
 const top=FA_TB-FA_TLEN*st;
 // the tower: printed bands, the rail, little bulbs on the left
 c.save();faShadow(c,FA_TX,FA_TB+10,70,10,S);
 const bandH=(FA_TB-14-top)/5;for(let i=0;i<5;i++){const y=FA_TB-14-(i+1)*bandH,sk=st>1.01?6*Math.sin(i*1.7+(t||0)*9)*(st-1)*5:0;fiPrint(c,fiRR(FA_TX-24+sk,y,48,bandH+1,3),FA_BANDS[i],[FA_TX-24,y,48,bandH],{ht:.35,shade:[0,0,1,0],sheen:1,key:4,wear:false});}
 fiPrint(c,fiRR(FA_TX-4,top+8,8,FA_TB-top-12,3),FI_INK.tin,[FA_TX-4,top,8,FA_TB-top],{ht:0,sheen:1.6,key:2.5,wear:false});
 fiPrint(c,fiRR(FA_TX-50,FA_TB-18,100,26,6),FI_INK.navy,[FA_TX-50,FA_TB-18,100,26],{sheen:1.2,key:4});fiRivet(c,FA_TX-38,FA_TB-5,4);fiRivet(c,FA_TX+38,FA_TB-5,4);
 fiPrint(c,fiRR(FA_TX-36,top-10,72,14,5),FI_INK.navy,[FA_TX-36,top-10,72,14],{sheen:1.2,key:4,wear:false});
 for(let i=0;i<8;i++){const y=FA_TB-40-i*(FA_TB-60-top)/7,on=Kclamp(lights-i);fiBulb(c,FA_TX-38,y,7,on,'#ffd978',false);if(on>0)S.glows.push(cc=>fiBulb(cc,FA_TX-38,y,7,on,'#ffd978',true));}
 if(nest&&t>=G.nest)faNest(c,FA_TX,top-30,.9,bird);
 faBell(c,FA_TX,top-6+ (n==='niu'&&t>=G.nest?0:0),bell);
 // the puck on its rail (or flying out of the top with the nest)
 const py=free!=null?faLerp(top+16,S.top-120,free):FA_TB-40-h*(FA_TB-58-top);
 fiPrint(c,fiRR(FA_TX-20,py-14,40,28,8),FI_INK.red,[FA_TX-20,py-14,40,28],{ht:.3,sheen:1.5,key:4,wear:false});fiRivet(c,FA_TX,py,4);
 if(nest&&t<G.nest)faNest(c,FA_TX,py-22,.9,0);
 // the lever: the pad where the mallet strikes, and the beam to the tower
 const hit=t!=null&&t>T.hit-.02&&t<T.hit+.25?1-faSeg(t,T.hit,T.hit+.25):0,fl=n==='fluix'&&t!=null?faHop(faSeg(t,T.hit,G.hop+.2),1):0;
 c.save();c.translate(FA_TX-30,FA_TB-6);c.rotate(-.12*hit+.25*fl);fiPrint(c,fiRR(FA_PADX-FA_TX+8,-6,FA_TX-FA_PADX-8,12,4),FI_INK.brown,[FA_PADX-FA_TX+8,-6,FA_TX-FA_PADX-8,12],{ht:.3,sheen:.8,key:4,wear:false});fiPrint(c,fiRR(FA_PADX-FA_TX+4,-16,40,12,4),FI_INK.red,[FA_PADX-FA_TX+4,-16,40,12],{ht:0,sheen:1.3,key:4,wear:false});c.restore();
 c.restore();
 // the strongman
 const [mx,my,ms]=FA_MAN;let pose={ra:.45,la:.2,mood:'smile',blink:!S.reduced&&(S.now%4.4)<.12},hop=0;
 if(t==null){if(S.antic>0){pose.ra=faLerp(.45,2.95,Ksmooth(S.antic));pose.lean=-.06*S.antic;pose.mood=S.antic>.6?'effort':'smile';}else pose.ra=.45+.05*Math.sin(S.now*1.2);if(S.go){pose.ra=2.95+.02*Math.sin(S.now*30);pose.mood='effort';}}
 else{const weak=n==='fluix';pose.ra=t<T.hit?faLerp(2.95,FA_STRIKE,Math.pow(faSeg(t,0,T.hit),2)):t<.9?FA_STRIKE:faLerp(FA_STRIKE,.45,faSeg(t,.9,1.4));pose.mood=t<T.hit+.1?'effort':'o';
  if(weak){pose.ra=t<T.hit?faLerp(2.95,1.3,faSeg(t,0,T.hit)):faLerp(1.3,.45,faSeg(t,T.hit,1));hop=faHop(faSeg(t,G.hop,G.land),150);pose.la=1+1.6*faHop(faSeg(t,G.hop,G.land),1);pose.mood=t<G.land+.3?'o':'grin';}
  const ch=faSeg(t,T.cheer,T.cheer+.25)*(1-faSeg(t,T.cheer+1.4,T.cheer+1.8));
  if(n==='mitja'){if(t>G.shrug&&t<G.shrug+1){const u=faSeg(t,G.shrug,G.shrug+1);pose.la=.2+.5*faHop(u,1);pose.ra=.45+.4*faHop(u,1);pose.mood='worried';}}
  else if(ch>0){pose.la=faLerp(pose.la,2.7,ch);hop=Math.max(hop,faHop(faSeg(t,T.cheer,T.cheer+.5),20));pose.mood='grin';}
  if(n==='llums'){if(t>G.melody&&t<G.bow){pose.la=2.4+.2*Math.sin(t*4);pose.mood='grin';}const bw=faSeg(t,G.bow,G.bow+.5);if(bw>0){pose.tilt=.3*bw;pose.squash=1-.1*bw;pose.la=.3;pose.mood='closed';}}}
 pose.hop=hop;pose.hold=cc=>faMallet(cc);
 faShadow(c,mx,my,90,13,S);fiPerson(c,mx,my,ms,'forcut',pose);
 // the nest's bird, back from the sky, sings on the bell
 if(n==='niu'&&t>=G.back&&t<G.nest){}}

// ── La cursa de cavallets ────────────────────────────────────────────────────────────────────────────────────────────────
// Three wind-up horses on three rails behind a starting gate; the girl who opens it; the finish post on the right.
const FA_START=-360,FA_FINISH=380,FA_GIRL=Object.freeze([-470,700,.72]),FA_HCOL=Object.freeze([1,2,0]);
// Where each horse is at time t of a gag (x on its rail, a jump, running, facing back, its head lowered).
function faHorses(t,n,G,T){const rel=T.rel,hit=T.hit,R=T.reset,L=FA_FINISH-FA_START,out=[0,1,2].map(i=>({x:FA_START,y:0,run:false,flip:false,head:0}));
 if(t==null||t<rel)return out;
 const run=(h,t0,t1,frac=1,x0=FA_START)=>{const u=faSeg(t,t0,t1),i=out.indexOf(h);h.x=x0+(FA_FINISH+20-x0)*frac*u+(n==='empat'?0:26*Math.sin(u*Math.PI)*Math.sin(u*7+i*2.1));h.run=u>0&&u<1;};
 if(n==='nas'){run(out[2],rel,hit);run(out[1],rel,hit,.975);run(out[0],rel,hit,.95);out[1].x=FA_START+(out[1].x-FA_START)*(t<hit?1:1);}
 else if(n==='flor'){run(out[2],rel,hit);run(out[0],rel,hit,.93);const h=out[1];if(t<G.stop){h.x=faLerp(FA_START,-40,faSeg(t,rel,G.stop));h.run=true;}else if(t<G.go){h.x=-40;h.head=.55*faSeg(t,G.stop,G.stop+.3)*(1-faSeg(t,G.go-.3,G.go));}else{const u=faSeg(t,G.go,hit+.9);h.x=faLerp(-40,FA_FINISH+20,u);h.run=u<1;}}
 else if(n==='empat'){for(const h of out)run(h,rel,hit);}
 else if(n==='salt'){run(out[2],rel,hit,.96);run(out[1],rel,hit,.93);const h=out[0];if(t<G.jump)run(h,rel,hit,.85);else{const x0=FA_START+(FA_FINISH+20-FA_START)*.85*faSeg(G.jump,rel,hit);const u=faSeg(t,G.jump,hit);h.x=faLerp(x0,FA_FINISH+20,u);h.y=-faHop(faSeg(t,G.jump,G.land),140);h.lane=faSeg(t,G.jump,G.land);h.run=u<1;}}
 else if(n==='enrere'){for(const h of out){if(t<G.turn){run(h,rel,hit);}else{const u=faSeg(t,G.turn,G.home);h.x=faLerp(FA_FINISH+20,FA_START,KeaseInOut(u));h.flip=true;h.run=u<1;}}}
 else if(n==='corda'){run(out[1],rel,hit,1);run(out[0],rel,hit,.96);const h=out[2];const xs=FA_START+(FA_FINISH+20-FA_START)*.38;if(t<G.slow)run(h,rel,rel+(hit-rel)*.6,.63);else if(t<G.push){h.x=faLerp(xs+30,xs+60,KeaseOut(faSeg(t,G.slow,G.stop)));h.run=t<G.stop;h.key=0;}else{const u=faSeg(t,G.push,hit+.6);h.x=faLerp(xs+60,FA_FINISH+20,u);h.y=-faHop(faSeg(t,G.push,G.push+.4),20);h.run=u<1;}}
 else if(n==='carrussel'){run(out[2],rel,hit);run(out[1],rel,hit,.97);run(out[0],rel,hit,.94);}
 // back to the gate before the next launch
 if(n!=='enrere'&&n!=='carrussel'&&t>R){const u=KeaseInOut(faSeg(t,R,R+.9));for(const h of out){h.x=faLerp(h.x,FA_START,u);h.flip=u<1;h.run=u<1;h.y=0;}}
 return out;}
function faGate(c,open){for(const [i,y] of FA_TRACKS.entries()){const s=FA_HSCALE[i],x=FA_START+70*s;fiPrint(c,fiRR(x-5*s,y-150*s,10*s,150*s,3),FI_INK.navy,[x-5*s,y-150*s,10*s,150*s],{ht:0,sheen:1.2,key:3.5,wear:false});
  c.save();c.translate(x,y-120*s);c.rotate(-1.35*open);fiPrint(c,fiRR(-4*s,-5*s,0+(-110)*s*-1,10*s,3),FI_INK.red,[-4*s,-5*s,110*s,10*s],{ht:0,sheen:1.2,key:3.5,wear:false,pattern:cc=>{cc.fillStyle=FI_INK.cream;for(let k=0;k<3;k++)cc.fillRect((10+k*34)*s,-5*s,14*s,10*s);}});c.restore();}}
function faCarousel(c,S,u,ph,horses){const cx=40,cy=600,top=cy-330;c.save();c.globalAlpha*=u;
 fiPrint(c,fiEll(cx,cy,280,44),FI_INK.navy,[cx-280,cy-44,560,88],{ht:.4,shade:[0,0,0,1],sheen:1,key:5});fiPrint(c,fiEll(cx,cy-12,270,38),FI_INK.gold,[cx-270,cy-50,540,76],{ht:.3,sheen:1.3,key:4});
 fiPrint(c,fiRR(cx-10,top,20,cy-top-20,4),FI_INK.cream,[cx-10,top,20,cy-top],{ht:.2,sheen:1.3,key:4});c.restore();
 // the horses behind the pole, then the pole, then those in front
 const dr=back=>horses.forEach(h=>{if((h.depth<0)===back)h.draw();});dr(true);
 c.save();c.globalAlpha*=u;const cp=cc=>{cc.moveTo(cx-300,top+40);cc.lineTo(cx,top-80);cc.lineTo(cx+300,top+40);for(let i=8;i>=0;i--){const x=cx-300+600*i/8;cc.quadraticCurveTo(x+600/16,top+80,x,top+40);}cc.closePath();};
 fiPrint(c,cp,FI_INK.cream,[cx-300,top-80,600,170],{ht:0,sheen:0,key:5,wear:false,pattern:cc=>{cc.save();cc.beginPath();cp(cc);cc.clip();cc.fillStyle=FI_INK.red;for(let i=0;i<8;i+=2){cc.beginPath();cc.moveTo(cx,top-80);cc.lineTo(cx-300+600*i/8,top+90);cc.lineTo(cx-300+600*(i+1)/8,top+90);cc.closePath();cc.fill();}cc.restore();}});
 fiHalftone(c,cp,[cx-300,top-80,600,170],[cx,top-80],[cx,top+80],.55,'rgba(60,20,10,.3)',7);fiBead(c,cx-300,top+40,cx+300,top+40,8);fiPrint(c,fiStarPath(cx,top-92,18),FI_INK.gold,[cx-18,top-110,36,36],{ht:0,sheen:1.5,key:3,wear:false});c.restore();
 dr(false);}
function faCavallets(c,S){const T=FI_T.cavallets,t=S.t,n=S.name,G=n?T[n]||{}:{};
 const open=t==null?0:t<T.rel?faSeg(t,0,T.rel):n==='carrussel'?1:1-faSeg(t,T.reset+.6,T.reset+.95),H=faHorses(t,n,G,T),tr=(S.now*2.2);
 const car=n==='carrussel'&&t!=null?faSeg(t,G.turn,G.ride):0;
 // the gate, the horses on their rails (from the back), the girl
 c.save();c.globalAlpha*=1-car;faGate(c,open);c.restore();
 // the flower by the middle rail (its gag): the horse stops and eats it
 if((n||S.next)==='flor'){const e=t==null?0:faSeg(t,G.stop+.4,G.go-.2),k=KeaseBack(S.propU)*(1-e);if(k>0){c.save();c.translate(58,FA_TRACKS[1]-4);c.scale(k,k);c.strokeStyle=FI_INK.green;c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(0,-40);c.stroke();for(let j=0;j<5;j++){const a=j/5*FI_TAU;fiPrint(c,fiEll(Math.cos(a)*11,-46+Math.sin(a)*11,9,9),FI_INK.pink,[Math.cos(a)*11-9,-55+Math.sin(a)*11,18,18],{ht:0,sheen:.6,key:2.5,wear:false});}fiPrint(c,fiEll(0,-46,7,7),FI_INK.gold,[-7,-53,14,14],{ht:0,sheen:1,key:2,wear:false});c.restore();}}
 const horseAt=(i,x,y,s,o)=>{faShadow(c,x,y+4,60*s,7*s,S);fiHorse(c,x,y,s,FA_HCOL[i],o);};
 if(car<1)[0,1,2].forEach(i=>{const h=H[i];let y=FA_TRACKS[i]+h.y,s=FA_HSCALE[i];if(h.lane!=null){y=faLerp(FA_TRACKS[0],FA_TRACKS[2],Ksmooth(h.lane))+h.y;s=faLerp(FA_HSCALE[0],FA_HSCALE[2],Ksmooth(h.lane));}
   const sh=S.go?Math.sin(S.now*30+i)*1:S.antic>0?Math.sin(S.now*24+i)*S.antic*.8:0;c.save();c.globalAlpha*=1-car;
   horseAt(i,h.x+sh,y,s,{running:h.run,trot:tr+i*.3,flip:h.flip,head:h.head,key:(h.run?S.now*3:S.antic*2)+i});c.restore();});
 if(car>0){const ride=t>G.ride?t-G.ride:0,ph=ride*FI_TAU/7,bw=faSeg(t,G.bow,G.bow+.5);
  const hs=[0,1,2].map(i=>{const f=ph+i*FI_TAU/3,x=40+Math.cos(f)*230,d=Math.sin(f),y=580+d*34-faHop(((ride*1.3+i/3)%1),20)*(1-bw*.5),s=.8+.12*d;
   const from=[H[i].x,FA_TRACKS[i]],u=KeaseInOut(car),X=faLerp(from[0],x,u),Y=faLerp(from[1],y,u),S2=faLerp(FA_HSCALE[i],s,u);
   return {depth:d,draw:()=>{c.save();c.strokeStyle=FI_INK.gold;c.lineWidth=5;c.beginPath();c.moveTo(X,Y-120*S2);c.lineTo(X,Y-300);c.stroke();c.restore();horseAt(i,X,Y,S2,{flip:d>0,running:false,key:ride*2});
    if(i===2){fiPerson(c,X-6*S2,Y-104*S2,.36*S2/.8,'nena',{noStand:true,la:2.5-1.6*bw,ra:.6,mood:bw>0?'closed':'grin',tilt:.25*bw});}}};});
  faCarousel(c,S,car,ph,hs);}
 // the girl: opens the gate with the lever, cheers her horse
 const [gx,gy,gs]=FA_GIRL;let pose={ra:.4,la:.15,mood:'smile',blink:!S.reduced&&(S.now%4.2)<.12},hop=0;
 if(t==null){pose.ra=.9+.6*Ksmooth(S.antic);pose.lean=.04*S.antic;pose.mood=S.antic>.6?'o':'smile';if(S.go)pose.ra=1.5+.02*Math.sin(S.now*30);}
 else{pose.ra=t<T.rel?faLerp(1.5,2.6,faSeg(t,0,T.rel)):faLerp(2.6,.6,faSeg(t,T.rel+.3,1));pose.mood=t<T.hit?'o':'grin';const ch=faSeg(t,T.cheer,T.cheer+.25)*(1-faSeg(t,T.cheer+1.4,T.cheer+1.8));
  if(ch>0){pose.la=pose.ra=faLerp(.6,2.7,ch);hop=faHop(faSeg(t,T.cheer,T.cheer+.5),22)+faHop(faSeg(t,T.cheer+.5,T.cheer+1),14);}}
 pose.hop=hop;if(car<1){c.save();c.globalAlpha*=1-car;faShadow(c,gx,gy,60,10,S);fiPerson(c,gx,gy,gs,'nena',pose);c.restore();}}
// ── The picture ──────────────────────────────────────────────────────────────────────────────────────────────────────────
const FA_DRAW={bitlles:faBitlles,cano:faCano,coet:faCoet,forca:faForca,cavallets:faCavallets};
// The home card: the bitlles (or the round of the card) with two bulbs lit and two medals hung.
function faPreview(o){const v=o.game?.variant??0;return {variant:v,fiNow:20,fiPhase:'count',fiAt:20-1.1*1.6,fiOut:[0,3],fiShot:null,fiFrom:null,fiOff:null,fiAgain:0,fiLooped:false};}
// The attraction of a round in a state: its figures, props and gag.
function faStage(c,v,st){const r=fiRound(v);(FA_DRAW[r.name]||faBitlles)(c,st);}
let FA_SCR=null;
function faScratch(w,h){if(!FA_SCR||FA_SCR.width!==w||FA_SCR.height!==h){if(FA_SCR)FA_SCR.width=FA_SCR.height=1;FA_SCR=escCanvas(w,h);}return FA_SCR;}
// o: game, settings, preview, reduced, background, base, opacity.
export function drawFira(c,w,h,o){escFrame();fiSpriteFrame();const Sc=h/720,W=w/Sc,decor=escDecor(o),k=Math.min(Kclamp(W/1280,.62,1),W/1000),HW=W/2/k,top=720-720/k,s=o.settings||{};
 const G=o.preview?faPreview(o):o.game&&o.game.fiNow!==undefined?o.game:fiEnsure({variant:o.game?.variant??0},s);
 const now=G.fiNow||0,shot=G.fiShot,ph=G.fiPhase,B=fiBulbs(G,s),r=fiRound(G.variant),L=FA_LIGHTS[r.light],reduced=!!o.reduced;
 const t=shot&&ph==='launch'?(now-shot.at)*(shot.speed||1):null,name=t!=null?FI_GAG_NAMES[r.name][shot.gag]:null,T=FI_T[r.name];
 const antic=ph==='count'?Kclamp((B.n-1+Ksmooth(B.u))/3):ph==='go'?1:0;
 const nextGag=fiGagOf(G.variant,(G.fiOut||[]).length,fiSteps(s)),next=FI_GAG_NAMES[r.name][nextGag];
 const cheer=t==null?0:shot.final?faSeg(t,T.cheer,T.cheer+.3)*(1-faSeg(t,FI_FINAL-1.2,FI_FINAL-.4)):faSeg(t,T.cheer,T.cheer+.3)*(1-faSeg(t,T.cheer+1.6,T.cheer+2.1));
 const propU=o.preview||ph!=='calm'||G.fiAgain>0?1:faSeg(now-G.fiAt,0,.5);
 const fr=G.fiFrom,fu=fr?Kclamp((now-fr.at)/FI_TURN):1,turning=fu<1;
 c.save();c.scale(Sc,Sc);if(decor.fade<1){c.fillStyle=decor.base;c.fillRect(0,0,W,720);}
 fiSetRim(null);
 const back=v=>escVeiled(decor,(sc,sw)=>faBack(sc,sw,v,k,HW,top)),backKey=v=>`fa-back|${fiRound(v).v}|${W.toFixed(1)}|${k.toFixed(3)}${escDecorKey(decor)}`;
 // Near the end of the finale the next round is prepared out of sight, in two frames (its back, then its printed pieces), so that the
 // turn of the tin stage does not stop to print them.
 if(!o.preview&&t!=null&&shot.final&&t>FI_FINAL-2.6){const nv=(r.v+1)%20,step=t>FI_FINAL-1.8?2:1,id=`${nv}|${step}`;if(G.fiWarm!==id&&!(step===1&&G.fiWarm===`${nv}|2`)){G.fiWarm=id;
  if(step===1){if(decor.fade>0)escSheet(c,backKey(nv),W,720,back(nv));}
  else if(c.getTransform&&c.canvas){const cv=faScratch(c.canvas.width,c.canvas.height),sc=cv?.getContext?.('2d');if(sc&&sc.setTransform){sc.setTransform(c.getTransform());sc.translate(W/2,720);sc.scale(k,k);sc.translate(0,-720);fiSetRim(!decor.white&&decor.fade<.5?'#f6e7c4':null);
   faStage(sc,nv,{HW,top,now,reduced,decor,glows:[],t:null,name:null,next:FI_GAG_NAMES[fiRound(nv).name][fiRound(nv).order[0]],antic:0,go:false,propU:1});fiSetRim(null);}}}}
 if(decor.fade>0){escBlit(c,backKey(r.v),W,720,back(r.v));
  if(turning)escBlit(c,backKey(fr.variant),W,720,back(fr.variant),1-Ksmooth(fu));}
 c.save();c.translate(W/2,720);c.scale(k,k);c.translate(0,-720);
 fiSetRim(!decor.white&&decor.fade<.5?'#f6e7c4':null);
 const base={HW,top,now,reduced,decor,glows:[]};
 const pubS={...base,cheer,antic};faPublic(c,HW,pubS);
 // waiting for the press: the fair dims a little around the figure and the bulbs
 const wait=ph==='go'&&s.waitCue!==false&&!o.preview?.34*faSeg(now-G.fiAt,0,.6)*decor.fade:0;
 if(wait>0){c.fillStyle=`rgba(0,0,0,${wait.toFixed(3)})`;c.fillRect(-HW-20,top-20,2*HW+40,760-top);}
 // the attraction (during the turn of the tin stage, the old one folds away and the new one unfolds)
 const showOld=turning&&fu<.5,sx=turning?Math.max(.02,Math.abs(Math.cos(Math.PI*fu))):1;
 c.save();c.scale(sx,1);
 if(showOld)faStage(c,fr.variant,{...base,t:null,name:null,next:null,antic:0,go:false,propU:1});
 else faStage(c,G.variant,{...base,t,name,shot,next,antic,go:ph==='go',propU:turning?1:propU});
 c.restore();
 // the light of the round over everything (the decor and the figures), then what gives light
 fiSetRim(null);
 if(L.tint&&decor.full){c.save();c.globalCompositeOperation='multiply';c.fillStyle=L.tint;c.fillRect(-HW-20,top-20,2*HW+40,760-top);c.restore();}
 const glow=decor.fade>0||!decor.white;
 if(decor.fade>0)faGarland(c,HW,top,!!L.night,glow);
 for(const g of base.glows)g(c);
 faMedals(c,HW,top,showOld?fr.out:(G.fiOut||[]),t!=null&&!showOld?{gag:shot.gag,u:faSeg(t,T.cheer,T.cheer+.8)}:null,now,reduced);
 faBulbs(c,HW,top,turning?{n:0,u:1,off:1}:B,ph==='go',now,glow);
 c.restore();c.restore();}

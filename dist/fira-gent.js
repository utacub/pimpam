// La fira de llauna (CE44), 0.47: the tin figures. People are tin toys seen from the front, printed in flat inks with halftone shading:
// a body like a tin can on a stand with two rivets, legs, arms on pivots at the shoulders (so they move like toys, stiffly, and with
// a little spring at the end) and a round head with a printed face: two eyes, rosy cheeks and a mouth that changes (people have faces;
// objects never do). The animals (the dog, the horses, the elephant) are tin toys seen from the side. Every part is a sprite printed
// once (fira-llauna.js) and then moved.
import {Kclamp} from './kaleido-base.js';
import {FI_INK,FI_TAU,fiBead,fiEll,fiPoly,fiPrint,fiRR,fiRivet,fiSprite,fiStarPath} from './fira-llauna.js';

// The people. skin, hair (colour and style), top (and its printed pattern), bottom (trousers or skirt), shoes, hat.
export const FI_PEOPLE=Object.freeze({
 jugadora:Object.freeze({skin:FI_INK.skin,hair:FI_INK.brown,style:'bun',top:FI_INK.red,pattern:'dots',bottom:'skirt',low:FI_INK.navy,shoe:'#3a2a1e',hat:'scarf',hatCol:FI_INK.teal,stand:'#4c6f62'}),
 acrobata:Object.freeze({skin:FI_INK.skin2,hair:'#2a1a12',style:'short',top:FI_INK.blue,pattern:'stars',bottom:'trousers',low:FI_INK.blue,shoe:FI_INK.red,hat:'helmet',hatCol:FI_INK.gold,stand:null}),
 nen:Object.freeze({skin:FI_INK.skin3,hair:'#1e1410',style:'curly',top:FI_INK.gold,pattern:'stripes',bottom:'shorts',low:FI_INK.navy,shoe:FI_INK.red,hat:'cap',hatCol:FI_INK.red,stand:'#4c6f62'}),
 forcut:Object.freeze({skin:FI_INK.skin,hair:'#3a2418',style:'bald',top:FI_INK.cream,pattern:'hoops',bottom:'trousers',low:FI_INK.navy,shoe:'#3a2a1e',hat:null,hatCol:null,stand:'#4c6f62',moustache:true,wide:1.25}),
 nena:Object.freeze({skin:FI_INK.skin2,hair:'#3a2418',style:'plaits',top:FI_INK.green,pattern:'dots',bottom:'skirt',low:FI_INK.plum,shoe:'#3a2a1e',hat:'bow',hatCol:FI_INK.red,stand:'#4c6f62'}),
 public0:Object.freeze({skin:FI_INK.skin,hair:'#5a3a22',style:'short',top:FI_INK.teal,pattern:null,bottom:'trousers',low:FI_INK.navy,shoe:'#3a2a1e',hat:'boater',hatCol:'#e8d9a8',stand:'#4c6f62'}),
 public1:Object.freeze({skin:FI_INK.skin3,hair:'#1e1410',style:'bun',top:FI_INK.gold,pattern:'dots',bottom:'skirt',low:FI_INK.red2,shoe:'#3a2a1e',hat:null,stand:'#4c6f62'}),
 public2:Object.freeze({skin:FI_INK.skin2,hair:'#2a1a12',style:'short',top:FI_INK.navy,pattern:null,bottom:'trousers',low:'#4a4458',shoe:'#3a2a1e',hat:'bowler',hatCol:'#2a2522',stand:'#4c6f62'}),
 public3:Object.freeze({skin:FI_INK.skin,hair:'#c58a3a',style:'plaits',top:FI_INK.pink,pattern:'dots',bottom:'skirt',low:FI_INK.navy,shoe:FI_INK.red,hat:null,stand:'#4c6f62'}),
 public4:Object.freeze({skin:FI_INK.skin3,hair:'#1e1410',style:'curly',top:FI_INK.green,pattern:'stripes',bottom:'shorts',low:FI_INK.navy,shoe:'#3a2a1e',hat:'cap',hatCol:FI_INK.blue,stand:'#4c6f62'}),
 public5:Object.freeze({skin:FI_INK.skin2,hair:'#8a8a8a',style:'bald',top:FI_INK.plum,pattern:null,bottom:'trousers',low:'#4a4458',shoe:'#3a2a1e',hat:'boater',hatCol:'#e8d9a8',stand:'#4c6f62',moustache:true})});
// The sizes of a person, in its own units (feet at 0): legs, body, head, arms.
const P_LEG=120,P_BODY=128,P_HEAD=40,P_ARM=92,P_SHOULDER=-226;

// ── The parts ────────────────────────────────────────────────────────────────────────────────────────────────────────────
function pStand(c,col){const p=fiRR(-64,-6,128,22,7);fiPrint(c,p,col,[-64,-6,128,22],{ht:.5,sheen:1.2,wearN:6});fiRivet(c,-50,5,4);fiRivet(c,50,5,4);fiBead(c,-58,-5,58,-5,4);}
function pLegs(c,P){const w=P.wide||1;
 if(P.bottom==='skirt'){for(const dx of [-17,17]){fiPrint(c,fiRR(dx-10,-62,20,60,7),P.skin,[dx-10,-62,20,60],{shade:[0,0,1,0],ht:.3,wear:false});}}
 else for(const dx of [-20*w,20*w]){const top=P.bottom==='shorts'?-P_LEG:-P_LEG,col=P.bottom==='shorts'?P.skin:P.low;fiPrint(c,fiRR(dx-12*w,top,24*w,P_LEG-4,9),col,[dx-12*w,top,24*w,P_LEG-4],{shade:[0,0,1,0],ht:.55});
  if(P.bottom==='shorts')fiPrint(c,fiRR(dx-14,-P_LEG,28,44,8),P.low,[dx-14,-P_LEG,28,44],{shade:[0,0,1,0]});}
 for(const dx of [-20*w,20*w])fiPrint(c,fiRR(dx-17,-16,36,17,7),P.shoe,[dx-17,-16,36,17],{ht:.3,sheen:1.3,wear:false});}
function pBody(c,P){const w=P.wide||1,top=-P_LEG-P_BODY+14,bot=-P_LEG+(P.bottom==='skirt'?50:8);
 const body=c2=>{c2.moveTo(-50*w,bot);c2.lineTo(50*w,bot);c2.lineTo(38*w,top+10);c2.quadraticCurveTo(0,top-8,-38*w,top+10);c2.closePath();};
 fiPrint(c,body,P.top,[-50*w,top-8,100*w,bot-top+8],{shade:[0,.1,1,.4],pattern:cc=>pPattern(cc,P,body,w,top,bot)});
 if(P.bottom!=='skirt'){fiPrint(c,fiRR(-46*w,bot-14,92*w,14,3),'#3a2a1e',[-46*w,bot-14,92*w,14],{ht:0,wear:false});fiPrint(c,fiRR(-9,bot-15,18,16,3),FI_INK.gold,[-9,bot-15,18,16],{ht:0,sheen:1.4,wear:false});}
 else fiPrint(c,fiRR(-34,-182,68,10,2),FI_INK.cream,[-34,-182,68,10],{ht:0,wear:false});
 fiPrint(c,fiRR(-10,top-18,20,18,4),P.skin,[-10,top-18,20,18],{ht:0,wear:false});}
function pPattern(c,P,body,w,top,bot){if(!P.pattern)return;c.save();c.beginPath();body(c);c.clip();
 if(P.pattern==='dots'){c.fillStyle=FI_INK.cream;c.beginPath();for(let i=0;i<10;i++)for(let j=0;j<8;j++){const x=-52*w+i*12+(j%2)*6,y=top+4+j*19;c.moveTo(x+3.2,y);c.arc(x,y,3.2,0,FI_TAU);}c.fill();}
 else if(P.pattern==='stars'){for(let i=0;i<4;i++)for(let j=0;j<4;j++){c.beginPath();fiStarPath(-36*w+i*24*w+(j%2)*12,top+20+j*28,7)(c);c.fillStyle=j%2?FI_INK.gold:FI_INK.cream;c.fill();}}
 else if(P.pattern==='stripes'){c.fillStyle=FI_INK.cream;for(let j=0;j<4;j++)c.fillRect(-60*w,top+18+j*28,120*w,10);}
 else if(P.pattern==='hoops'){c.fillStyle=FI_INK.red;for(let j=0;j<4;j++)c.fillRect(-60*w,top+10+j*30,120*w,12);}
 c.restore();}
function pArm(c,P){const w=P.wide||1;fiPrint(c,fiRR(-10*w,-4,20*w,P_ARM-12,10),P.top,[-10*w,-4,20*w,P_ARM-12],{shade:[0,0,1,0],ht:.5});fiPrint(c,fiEll(0,P_ARM-6,12*w,12*w),P.skin,[-12*w,P_ARM-18,24*w,24*w],{ht:.25,wear:false});}
// The head, without the mouth and the eyes, which change (drawn live).
function pHead(c,P){const R=P_HEAD,y=0;
 if(P.style==='plaits')for(const s of [-1,1]){fiPrint(c,fiEll(s*40,22,10,24,s*.3),P.hair,[s*40-12,-2,24,50],{ht:.3,wear:false});fiPrint(c,fiEll(s*44,48,8,8),P.hatCol||FI_INK.red,[s*44-8,40,16,16],{ht:0,wear:false});}
 if(P.style==='bun')fiPrint(c,fiEll(30,-30,16,16),P.hair,[14,-46,32,32],{ht:.3,wear:false});
 fiPrint(c,fiEll(0,y,R,R*1.04),P.skin,[-R,-R*1.04,2*R,2.08*R],{shade:[-.2,.1,1,.7],ht:.26,sheen:.7});
 if(P.style!=='bald'){const hp=c2=>{c2.ellipse(0,-14,R+2,R*.72,0,Math.PI*1.02,-Math.PI*.02);c2.closePath();};fiPrint(c,hp,P.hair,[-R-2,-44,2*R+4,32],{ht:.3,wear:false});
  if(P.style==='curly')for(let i=0;i<7;i++){const a=Math.PI*(1.08+i*.14);fiPrint(c,fiEll(Math.cos(a)*R*.95,-10+Math.sin(a)*R*.8,10,10),P.hair,[Math.cos(a)*R*.95-10,-20+Math.sin(a)*R*.8,20,20],{ht:0,wear:false,sheen:.4});}}
 else{c.fillStyle=P.hair;c.fillRect(-R-1,-6,9,16);c.fillRect(R-8,-6,9,16);}
 if(P.moustache){const m=c2=>{c2.moveTo(-26,14);c2.quadraticCurveTo(-13,4,0,12);c2.quadraticCurveTo(13,4,26,14);c2.quadraticCurveTo(14,20,0,16);c2.quadraticCurveTo(-14,20,-26,14);c2.closePath();};fiPrint(c,m,P.hair,[-26,4,52,16],{ht:0,wear:false,key:3});}
 if(P.hat==='scarf'){const s=c2=>{c2.moveTo(-R-1,-12);c2.quadraticCurveTo(0,-R-12,R+1,-12);c2.lineTo(R-4,-4);c2.quadraticCurveTo(0,-R+2,-R+4,-4);c2.closePath();};fiPrint(c,s,P.hatCol,[-R,-R-12,2*R,R],{ht:.3,wear:false});}
 if(P.hat==='helmet'){const s=c2=>{c2.ellipse(0,-12,R+4,R*.86,0,Math.PI,0);c2.closePath();};fiPrint(c,s,P.hatCol,[-R-4,-R-8,2*R+8,R],{shade:[0,0,1,1],sheen:1.4});fiPrint(c,fiRR(-R-6,-16,2*R+12,9,4),FI_INK.red,[-R-6,-16,2*R+12,9],{ht:0,wear:false});fiPrint(c,fiStarPath(0,-34,10),FI_INK.cream,[-10,-44,20,20],{ht:0,wear:false,key:2.5});}
 if(P.hat==='cap'){const s=c2=>{c2.ellipse(0,-16,R,R*.7,0,Math.PI,0);c2.closePath();};fiPrint(c,s,P.hatCol,[-R,-R-4,2*R,R],{ht:.4});fiPrint(c,fiEll(R*.55,-16,R*.6,8),P.hatCol,[0,-24,R*1.2,16],{ht:0,wear:false});}
 if(P.hat==='bow')fiPrint(c,c2=>{c2.moveTo(10,-38);c2.lineTo(34,-52);c2.lineTo(34,-24);c2.closePath();c2.moveTo(10,-38);c2.lineTo(-14,-52);c2.lineTo(-14,-24);c2.closePath();},P.hatCol,[-14,-52,48,28],{ht:0,wear:false,key:3.5});
 if(P.hat==='boater'){fiPrint(c,fiEll(0,-26,R+16,9),P.hatCol,[-R-16,-35,2*R+32,18],{ht:.3});fiPrint(c,fiRR(-R*.62,-50,R*1.24,26,4),P.hatCol,[-R*.62,-50,R*1.24,26],{ht:.3});fiPrint(c,fiRR(-R*.62,-34,R*1.24,7,2),FI_INK.red,[-R*.62,-34,R*1.24,7],{ht:0,wear:false,key:2});}
 if(P.hat==='bowler'){fiPrint(c,fiEll(0,-24,R+10,7),P.hatCol,[-R-10,-31,2*R+20,14],{ht:.2});fiPrint(c,c2=>{c2.ellipse(0,-26,R*.7,R*.62,0,Math.PI,0);c2.closePath();},P.hatCol,[-R*.7,-52,R*1.4,26],{ht:.2,sheen:1.3});}}
// The face: eyes (they close for a blink), cheeks and a mouth. mood: smile, grin, o, effort, closed, worried, dizzy, wink.
function pFace(c,mood,blink=0){const ey=-4,ex=13,r=4.3;c.fillStyle='rgba(235,110,110,.5)';c.beginPath();c.arc(-22,12,8,0,FI_TAU);c.arc(22,12,8,0,FI_TAU);c.fill();
 c.strokeStyle=FI_INK.key;c.fillStyle=FI_INK.key;c.lineWidth=3;c.lineCap='round';
 const shut=mood==='closed'||blink>.5;
 if(mood==='dizzy'){for(const s of [-1,1]){c.beginPath();c.arc(s*ex,ey,5,0,FI_TAU*.8);c.stroke();}}
 else if(shut){for(const s of [-1,1]){c.beginPath();c.arc(s*ex,ey-1,5,.15*Math.PI,.85*Math.PI);c.stroke();}}
 else for(const s of [-1,1]){if(mood==='wink'&&s>0){c.beginPath();c.moveTo(s*ex-5,ey);c.lineTo(s*ex+5,ey);c.stroke();continue;}c.beginPath();c.ellipse(s*ex,ey,r,r*(mood==='o'?1.5:1.3),0,0,FI_TAU);c.fill();}
 if(mood==='effort'||mood==='worried'){c.beginPath();const k=mood==='effort'?1:-1;c.moveTo(-19,-15+3*k);c.lineTo(-7,-15-3*k);c.moveTo(19,-15+3*k);c.lineTo(7,-15-3*k);c.stroke();}
 c.beginPath();
 if(mood==='o'){c.ellipse(0,16,6,8,0,0,FI_TAU);c.fillStyle='#7a2a22';c.fill();c.stroke();}
 else if(mood==='grin'){c.moveTo(-12,12);c.quadraticCurveTo(0,28,12,12);c.closePath();c.fillStyle='#7a2a22';c.fill();c.stroke();}
 else if(mood==='effort'){c.moveTo(-10,16);c.lineTo(10,16);c.stroke();}
 else if(mood==='worried'||mood==='dizzy'){c.moveTo(-9,18);c.quadraticCurveTo(-4,12,0,17);c.quadraticCurveTo(4,22,9,16);c.stroke();}
 else{c.arc(0,9,9,.25,Math.PI-.25);c.stroke();}}

// A person. x, y: the feet (the stand under them); s: scale. pose: {la, ra: how far each arm is raised, 0 down to π up, outwards},
// lean (radians), hop (lift in units), squash, mood, blink, hold (draw(c) at the right hand, in the hand's frame), holdL, flip (look
// the other way), noStand, rim (a light rim on a black base).
export function fiPerson(c,x,y,s,who,pose={}){const P=FI_PEOPLE[who]||FI_PEOPLE.public0,w=P.wide||1;c.save();c.translate(x,y);c.scale(s*(pose.flip?-1:1),s);
 const sq=pose.squash||1;
 if(P.stand&&!pose.noStand)fiSprite(c,`fi-stand|${P.stand}`,[-72,-14,144,40],cc=>pStand(cc,P.stand));
 c.translate(0,-(pose.hop||0));c.rotate(pose.lean||0);c.scale(1/Math.sqrt(sq),sq);
 const sh=P_SHOULDER,armX=46*w;
 const drawArm=(side,a,hold)=>{c.save();c.translate(side*armX,sh);c.rotate(-side*(a||0));fiSprite(c,`fi-arm|${who}`,[-16*w,-8,32*w,P_ARM+16],cc=>pArm(cc,P));if(hold){c.translate(0,P_ARM-6);hold(c);}c.restore();};
 fiSprite(c,`fi-legs|${who}`,[-60*w,-P_LEG-8,120*w,P_LEG+10],cc=>pLegs(cc,P));
 fiSprite(c,`fi-body|${who}`,[-58*w,-P_LEG-P_BODY-12,116*w,P_BODY+(P.bottom==='skirt'?72:30)],cc=>pBody(cc,P));
 drawArm(-1,pose.la,pose.holdL);drawArm(1,pose.ra,pose.hold);
 c.translate(0,-P_LEG-P_BODY-30+(pose.headDy||0));c.rotate(pose.tilt||0);
 fiSprite(c,`fi-head|${who}`,[-P_HEAD-24,-P_HEAD-40,2*P_HEAD+48,2*P_HEAD+80],cc=>pHead(cc,P));
 pFace(c,pose.mood||'smile',pose.blink||0);
 if(pose.straw){c.strokeStyle='#e8c35a';c.lineWidth=3;c.beginPath();for(let i=0;i<9;i++){const a=-Math.PI*(.15+.07*i);c.moveTo(Math.cos(a)*30,-20+Math.sin(a)*30);c.lineTo(Math.cos(a)*(52+(i%3)*8),-20+Math.sin(a)*(50+(i%2)*10));}c.stroke();}
 if(pose.stars){const t=pose.stars;for(let i=0;i<3;i++){const a=t*2.4+i*FI_TAU/3;c.save();c.translate(Math.cos(a)*48,-56+Math.sin(a)*12);c.beginPath();fiStarPath(0,0,9)(c);c.fillStyle=FI_INK.gold;c.fill();c.strokeStyle=FI_INK.key;c.lineWidth=2;c.stroke();c.restore();}}
 c.restore();}
// The height of a person's head centre above the feet (for things that land on it), in its units.
export const FI_HEAD_Y=P_LEG+P_BODY+30,FI_HAND_Y=-P_SHOULDER;

// ── Animals ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The tin dog, seen from the side, looking right (flip: left). run: 0..1 of a stride; wag: the tail.
function pDog(c){fiPrint(c,fiRR(-50,-4,100,14,5),'#4c6f62',[-50,-4,100,14],{ht:.4,sheen:1.2,wearN:4});
 fiPrint(c,fiEll(0,-44,42,20),FI_INK.white,[-42,-64,84,40],{shade:[0,0,1,.5],ht:.5,pattern:cc=>{cc.save();cc.beginPath();fiEll(0,-44,42,20)(cc);cc.clip();cc.fillStyle=FI_INK.brown;cc.beginPath();cc.ellipse(-8,-50,15,10,0,0,FI_TAU);cc.fill();cc.restore();}});
 fiPrint(c,fiEll(44,-66,20,17),FI_INK.white,[24,-83,40,34],{ht:.3,wear:false});fiPrint(c,fiEll(36,-72,8,15,.2),FI_INK.brown,[28,-87,16,30],{ht:0,wear:false,key:3});
 c.fillStyle=FI_INK.key;c.beginPath();c.arc(50,-70,3,0,FI_TAU);c.arc(63,-63,4,0,FI_TAU);c.fill();}
export function fiDog(c,x,y,s,o={}){c.save();c.translate(x,y);c.scale(s*(o.flip?-1:1),s);const st=o.run||0,b=Math.abs(Math.sin(st*FI_TAU))*6*(o.running?1:0);
 for(const [dx,ph] of [[-30,0],[-14,.5],[14,.5],[30,0]]){const a=o.running?Math.sin((st+ph)*FI_TAU)*.5:0;c.save();c.translate(dx,-30);c.rotate(a);fiSprite(c,'fi-dogleg',[-8,-6,16,40],cc=>fiPrint(cc,fiRR(-5,-4,10,32,4),FI_INK.white,[-5,-4,10,32],{ht:.2,wear:false}));c.restore();}
 c.translate(0,-b);fiSprite(c,'fi-dog',[-56,-92,128,104],pDog);
 c.strokeStyle=FI_INK.key;c.lineWidth=5;c.lineCap='round';c.beginPath();const wag=Math.sin((o.wag||0)*FI_TAU)*.6;c.moveTo(-42,-50);c.quadraticCurveTo(-58,-62+wag*8,-54+wag*10,-84);c.stroke();
 if(o.bone){c.save();c.translate(70,-56);c.rotate(-.2);o.bone(c);c.restore();}
 c.restore();}
// A tin horse on a rail with a wind-up key, seen from the side, looking right. trot: the rocking of the stride; head: lowered (eating).
const FI_HORSES=Object.freeze([Object.freeze({body:FI_INK.red,mane:FI_INK.gold,saddle:FI_INK.navy}),Object.freeze({body:FI_INK.white,mane:FI_INK.brown,saddle:FI_INK.red}),Object.freeze({body:FI_INK.gold,mane:FI_INK.red2,saddle:FI_INK.teal})]);
function pHorse(c,H){fiPrint(c,c2=>{c2.ellipse(0,-70,62,26,0,0,FI_TAU);},H.body,[-62,-96,124,52],{shade:[0,0,1,1],ht:.55,pattern:cc=>{cc.save();cc.beginPath();cc.ellipse(0,-70,62,26,0,0,FI_TAU);cc.clip();cc.fillStyle=H.saddle;cc.fillRect(-18,-98,40,32);cc.fillStyle=FI_INK.gold;cc.fillRect(-18,-70,40,5);cc.restore();}});
 fiPrint(c,c2=>{c2.ellipse(-62,-82,14,10,0,0,FI_TAU);},H.mane,[-76,-92,28,20],{ht:0,wear:false,key:3});}
function pHorseHead(c,H){fiPrint(c,c2=>{c2.moveTo(-10,0);c2.lineTo(8,-46);c2.quadraticCurveTo(20,-62,40,-54);c2.lineTo(52,-40);c2.quadraticCurveTo(50,-30,36,-32);c2.lineTo(22,-30);c2.lineTo(16,6);c2.closePath();},H.body,[-10,-62,62,68],{ht:.4,shade:[0,0,1,1]});
 fiPrint(c,c2=>{c2.moveTo(-6,-6);c2.lineTo(8,-48);c2.quadraticCurveTo(14,-58,24,-58);c2.lineTo(10,-40);c2.lineTo(2,-4);c2.closePath();},H.mane,[-6,-58,30,56],{ht:0,wear:false,key:3});
 c.fillStyle=FI_INK.key;c.beginPath();c.arc(32,-48,3.5,0,FI_TAU);c.fill();fiPrint(c,c2=>{c2.moveTo(18,-58);c2.lineTo(24,-74);c2.lineTo(28,-56);c2.closePath();},H.body,[18,-74,10,18],{ht:0,wear:false,key:3});}
export function fiHorse(c,x,y,s,i,o={}){const H=FI_HORSES[i%3];c.save();c.translate(x,y);c.scale(s*(o.flip?-1:1),s);
 // the rail stand with two wheels
 fiSprite(c,'fi-hstand',[-70,-26,140,34],cc=>{fiPrint(cc,fiRR(-60,-20,120,14,6),FI_INK.grey,[-60,-20,120,14],{ht:.3,sheen:1.3,wearN:5});for(const dx of [-40,40]){fiPrint(cc,fiEll(dx,-2,10,10),'#5a5650',[dx-10,-12,20,20],{ht:0,sheen:1.4,wear:false});fiRivet(cc,dx,-2,3);}});
 const rock=Math.sin((o.trot||0)*FI_TAU)*(o.running?.08:0);c.translate(0,-18);c.rotate(rock);
 for(const [dx,ph] of [[-40,0],[-26,.5],[30,.5],[44,0]]){const a=o.running?Math.sin(((o.trot||0)+ph)*FI_TAU)*.42:0;c.save();c.translate(dx,-56);c.rotate(a);fiSprite(c,`fi-hleg|${i%3}`,[-9,-6,18,64],cc=>{fiPrint(cc,fiRR(-6,-4,12,52,5),H.body,[-6,-4,12,52],{ht:.25,wear:false});fiPrint(cc,fiRR(-7,44,14,10,3),'#3a2a1e',[-7,44,14,10],{ht:0,wear:false,key:3});});c.restore();}
 fiSprite(c,`fi-horse|${i%3}`,[-84,-104,156,64],cc=>pHorse(cc,H));
 c.save();c.translate(48,-84);c.rotate(o.head||0);fiSprite(c,`fi-hhead|${i%3}`,[-14,-80,72,90],cc=>pHorseHead(cc,H));if(o.flower){c.translate(52,-30);o.flower(c);}c.restore();
 // the wind-up key on its side
 c.save();c.translate(-6,-72);c.rotate((o.key||0));c.fillStyle=FI_INK.tin;c.strokeStyle=FI_INK.key;c.lineWidth=2;c.beginPath();c.ellipse(-12,0,10,6,0,0,FI_TAU);c.ellipse(12,0,10,6,0,0,FI_TAU);c.fill();c.stroke();c.restore();
 c.strokeStyle=FI_INK.key;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(-62,-74);c.quadraticCurveTo(-82,-70+rock*40,-78,-46);c.strokeStyle=FI_HORSES[i%3].mane;c.stroke();
 c.restore();}
// The tin elephant, seen from the side, looking left. trunk: 0 down, 1 up and curled (holding).
function pElephant(c){fiPrint(c,c2=>{c2.ellipse(0,-110,92,64,0,0,FI_TAU);},FI_INK.grey,[-92,-174,184,128],{shade:[0,0,1,1],ht:.6,pattern:cc=>{cc.save();cc.beginPath();cc.ellipse(0,-110,92,64,0,0,FI_TAU);cc.clip();cc.fillStyle=FI_INK.red;cc.fillRect(-40,-176,90,56);cc.fillStyle=FI_INK.gold;for(let i=0;i<6;i++){cc.beginPath();cc.arc(-34+i*16,-122,5,0,FI_TAU);cc.fill();}cc.restore();}});
 for(const dx of [-58,-20,30,64])fiPrint(c,fiRR(dx-16,-70,32,70,8),FI_INK.grey,[dx-16,-70,32,70],{ht:.5,shade:[0,0,1,0]});
 fiPrint(c,fiEll(-92,-128,46,42),FI_INK.grey,[-138,-170,92,84],{ht:.5});fiPrint(c,fiEll(-74,-126,30,36,.2),'#9aa5a6',[-104,-162,60,72],{ht:.4,wear:false});
 c.fillStyle=FI_INK.key;c.beginPath();c.arc(-112,-138,5,0,FI_TAU);c.fill();fiPrint(c,c2=>{c2.moveTo(-124,-110);c2.quadraticCurveTo(-140,-104,-146,-96);c2.lineTo(-138,-104);c2.closePath();},FI_INK.cream,[-146,-110,22,14],{ht:0,wear:false,key:2.5});}
export function fiElephant(c,x,y,s,o={}){c.save();c.translate(x,y);c.scale(s,s);fiSprite(c,'fi-elephant',[-150,-182,256,190],pElephant);
 const u=Kclamp(o.trunk||0),ear=Math.sin((o.ear||0)*FI_TAU)*.25;
 // the trunk: a thick printed curve from the head, down (0) or up and curled forward (1)
 const p0=[-130,-120],p1=[-160,-90+(-80)*u],p2=[-170-50*u,-40-170*u];c.lineCap='round';
 const tr=w=>{c.beginPath();c.moveTo(...p0);c.quadraticCurveTo(...p1,...p2);c.lineWidth=w;c.stroke();};c.strokeStyle=FI_INK.key;tr(30);c.strokeStyle=FI_INK.grey;tr(22);
 c.save();c.translate(-74,-126);c.rotate(ear);c.restore();
 if(o.hold){c.save();c.translate(p2[0],p2[1]);o.hold(c);c.restore();}
 c.restore();return {x:x+p2[0]*s,y:y+p2[1]*s};}

// La cassola d'en Glups (EN23), 0.27: the scenes of the mythical creatures, a short comic version of each myth (about nine and a half
// seconds, u from 0 to MY_DUR). Each scene has its own place, painted once (myBackdrop), and moves its creature with smooth eases: no
// flash, no fast turn, no stripes. In «Moviment reduït» (o.still) the creature stays in its place and only the gentlest moves are kept.
// myScene returns where the creature is (screen units), for the puff of the hiccup at the end.
import {GR_PI,GR_TAU,GR_INK,grClamp,grSmooth,grOut,grIn,grBack,grLerp,grSpan,grBump,grMix,grShade,grRgba,grRand,grPath,grEll,grLW,grPart,grLine,grTube,grVGrad,grRGrad,grGlow,grShadow,grLeaf,grAt,grWing,grUnion,grLimb,grMane} from './grec-art.js';
import {myStage,myIn,myBackdrop,myCloud,mySpark,myEye,myBrow,myMoustache,myWreath,myAlong,myGait,myHorseBody,myHorseHead,MY_HORSE,myKeys,myAnchor,myLionBody,myEagleHead,myCoin,myPhiale,myBez,myRibbon,myBirdBody,myBirdHead,myFlames,MY_PHOENIX,mySnakeHead,myNote} from './grec-bestiari.js';
import {MY_SCENES_B} from './cassola-mites2.js';
import {MY_SCENES_C} from './cassola-mites3.js';
export const MY_DUR=9.5;
// ── Pegasus (the feather and the horse) ────────────────────────────────────────────────────────────────────────────────────
// High over the clouds, with Olympus far away. Pegasus-Glups looks at his new wings, tries them with two clumsy hops on his cloud, runs,
// jumps off and flies a big loop; he lands on a small cloud that bounces him up like a trampoline, and he glides back to his cloud,
// proud, with his wings spread.
function myOlympus(c,S){c.fillStyle=grVGrad(c,S.top,S.bottom,['#4f9fdc','#93cdee','#d8eef8','#f4fbff']);c.fillRect(S.left,S.top,S.right-S.left,S.bottom-S.top);
 grGlow(c,-380,-300,260,'#fff6d0',.6);
 for(const [i,col] of ['#ffb3b3','#ffd9a0','#fff3a8','#bfe8b0','#b8d4ff'].entries()){c.beginPath();c.arc(120,420,560-i*22,GR_PI*1.08,GR_PI*1.92);c.strokeStyle=grRgba(col,.38);c.lineWidth=22;c.stroke();}c.fillStyle='#fffbe8';c.beginPath();c.arc(-380,-300,54,0,GR_TAU);c.fill();
 // far clouds and the mountain of the gods with a little temple on the top
 for(let i=0;i<5;i++)myCloud(c,S.left+(S.right-S.left)*(.1+.2*i),-200+60*grRand(i,3),40+20*grRand(i,5),{col:'#f2f8ff',shade:'#c8dcf0',lw:2.5,ink:grRgba(GR_INK,.25)});
 const peaks='M-80 420L60 170L120 220L230 40L300 110L360 60L470 230L560 150L760 420Z';grPart(c,peaks,'#9db3d6',{tones:[['M230 40L250 120L200 200L120 220L60 170L-80 420L-200 420Z',grRgba('#7f97c2',.5)]],lw:4,ink:grRgba(GR_INK,.4)});
 grPart(c,'M196 98L230 40L272 82L254 100L236 88L220 108Z',"#ffffff",{lw:3,ink:grRgba(GR_INK,.35)});grPart(c,'M330 90L360 60L392 110L374 104L360 96L344 108Z','#ffffff',{lw:3,ink:grRgba(GR_INK,.35)});
 c.fillStyle='#fffaf0';c.fillRect(214,18,32,16);c.beginPath();c.moveTo(210,18);c.lineTo(230,4);c.lineTo(250,18);c.fill();
 // a sea of clouds below
 for(let i=0;i<9;i++)myCloud(c,S.left+(S.right-S.left)*(i/8),360+30*grRand(i,7),110+40*grRand(i,9),{col:'#ffffff',shade:'#cfdcf0',lw:3,ink:grRgba(GR_INK,.3)});
 c.fillStyle='#ffffff';c.fillRect(S.left,430,S.right-S.left,Math.max(0,S.bottom-430));}
// Pegasus at (x, y) (the middle of his belly), size k, facing right (dir 1) or left (-1), turned by rot. P: legs, wings (0 to 1
// open), wingBeat (an extra lift of the wings), and the head (look, lid, brow, mouth, turn).
export function myPegasus(c,x,y,k,dir,rot,P,t){grAt(c,x,y,k,-dir,dir*rot,()=>{const open=P.wings??.8;
 c.save();c.translate(-10,-150);c.rotate(-.5-.25*open);grWing(c,open,['#e8ecf8','#dfe4f4','#9aa6cc']);c.restore();
 myHorseBody(c,{legs:P.legs,tail:P.tail||0});myHorseHead(c,{...P,t});
 c.save();c.translate(-40,-120);c.scale(1.2,1.2);c.rotate(-.2-.3*open);grWing(c,open);c.restore();});}
const MY_TUCK=[myGait('tuck',0),myGait('tuck',0),myGait('tuck',0,false),myGait('tuck',0,false)],MY_STAND=[[0,0],[0,0],[0,0],[0,0]];
function myPegasusScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-olympus',o.decor,myOlympus);
 const K=.64,A={x:-230,y:290,r:165},B={x:310,y:310,r:92},onA=A.y-A.r*.85-354*K,onB=B.y-B.r*.85-354*K;
 const hop=still?0:Math.max(grBump(u,1.05,1.5),grBump(u,1.75,2.2)),flop=still?0:grBump(u,7.95,8.5),landB=still?0:grBump(u,5.95,6.5);
 let x=A.x,y=onA,k=K,dir=1,rot=0,P={legs:MY_STAND,wings:.55,look:[.6,0],brow:.4,mouth:'smile',tail:Math.sin(t*2)*.3};
 if(still){P.wings=.45+.45*grSmooth(grSpan(u,.5,2.5));P.look=[.4,-.2];P.mouth=u>2.5?'smile':'o';P.brow=u>2.5?.3:1;}
 else if(u<2.5){// he looks back at his wings, then two clumsy hops
  const back=grSmooth(grSpan(u,.1,.5))*(1-grSmooth(grSpan(u,.9,1.2)));P.turn=-.22*back;P.look=back>.5?[1,-.5]:[.6,0];P.brow=back>.3?1:.4;P.mouth=back>.3?'o':'smile';
  y=onA-75*hop;P.wings=hop>0?.3+.7*Math.abs(Math.sin(u*14)):.55+.4*back;if(hop>.15)P.legs=MY_TUCK;}
 else if(u<3.2){const v=grSpan(u,2.5,3.2),p=u*2.6;x=grLerp(A.x,A.x+150,v);y=onA-40*grSmooth(grSpan(u,3,3.2));P.legs=[myGait('gallop',p),myGait('gallop',p+.25),myGait('gallop',p+.5,false),myGait('gallop',p+.75,false)];P.wings=.35;P.look=[1,0];P.brow=-.3;}
 else if(u<6.4){// the flight: out to the right, far away round Olympus, back close to the camera, and down on the small cloud
  const m=myKeys([[3.2,A.x+150,onA-40,K,1],[3.7,330,-250,.62,1],[4.15,360,-330,.42,1],[4.5,170,-300,.28,-1],[4.95,-260,-250,.36,-1],[5.35,-340,-130,.55,1],[5.75,120,-60,.7,1],[6.0,B.x,onB,K,1],[6.4,B.x,onB,K,1]],u);
  x=m.x;y=m.y+(u>6?60*landB:0);k=m.k;dir=m.dir;rot=u<6?Math.max(-.45,Math.min(.45,Math.atan2(m.dy,Math.abs(m.dx)+1e-3)*.6)):0;
  P.legs=u<5.95?MY_TUCK:[[.3,.4],[.2,.5],[-.3,-.4],[-.2,-.5]];P.wings=u<5.9?.25+.75*Math.abs(Math.sin(u*7)):.2;P.look=[1,-.2];P.brow=u<5.9?.5:1;P.mouth=u<5.9?'open':'o';P.tail=-.6;}
 else if(u<8){// thrown up off the top of the screen, then down on his own cloud on his belly
  const m=myKeys([[6.4,B.x,onB+40,K,1],[6.95,160,-760,K,1],[7.3,-60,-760,K,-1],[7.95,A.x,onA+70,K,-1]],u);x=m.x;y=m.y;dir=m.dir;rot=.3*Math.sin(u*5);
  P.legs=[[-.7,.3],[.7,.5],[.8,-.2],[-.6,-.6]];P.wings=.3+.7*Math.abs(Math.sin(u*9));P.brow=1;P.mouth='open';P.look=[-.2,-1];}
 else{// flat on the cloud, he gets up and spreads his wings, proud
  const up=grSmooth(grSpan(u,8.45,8.9));dir=-1;x=A.x;y=onA+70*(1-up);P.legs=up<.5?[[-1.3,.2],[-1.1,.3],[1.2,-.2],[1.3,-.1]]:MY_STAND;P.wings=grLerp(.2,1,grSmooth(grSpan(u,8.7,9.1)));
  P.brow=up<.5?-.2:.3;P.mouth=up<.5?'o':'smile';P.look=up<.5?[0,.4]:[-1,0];P.lid=up<.5?.5:(u>9.05&&u<9.35?1:0);}
 myIn(c,S,c=>{myCloud(c,A.x,A.y,A.r,{squash:.12*hop*0+.1*Math.max(hop>0?grBump(u,1.4,1.6)+grBump(u,2.1,2.3):0,0)+.28*flop});myCloud(c,B.x,B.y,B.r,{squash:.4*landB,blobs:[[0,0,1],[-.8,.3,.7],[.85,.3,.7],[0,.35,.8]]});
  myPegasus(c,x,y,k,dir,rot,P,t);
  if(u>8.8)for(let i=0;i<6;i++)mySpark(c,A.x+Math.cos(i*1.05)*240,onA-60+Math.sin(i*1.05)*170,20,'#fff6c8',grBump(u,8.8+i*.08,9.6));});
 return myAnchor(S,x,y-60*k,260*k);}
// ── The griffin (the feather and the lion) ─────────────────────────────────────────────────────────────────────────────────
// Far in the north, among cold mountains, the griffins keep the gold. Griffin-Glups (a winged lion with an eagle's head) lies on his nest
// full of coins, proud. A little feather falls on his beak; he sneezes, his wings fly open and the coins go up like a fountain and rain
// all round. He sweeps them back into the nest with a wing, and the last thing to fall is a golden bowl, that lands on his head upside
// down. He peeps from under it and decides he likes his new hat.
function myScythia(c,S){c.fillStyle=grVGrad(c,S.top,S.bottom,['#8fa6dc','#c6c4e6','#f2d6cc','#e8d0c8']);c.fillRect(S.left,S.top,S.right-S.left,S.bottom-S.top);
 grGlow(c,300,-200,300,'#fff0dc',.6);c.fillStyle='#fff6e8';c.beginPath();c.arc(300,-200,50,0,GR_TAU);c.fill();
 if(S.top<-470)for(let i=0;i<4;i++)myCloud(c,-380+i*250+50*grRand(i,51),grLerp(-430,S.top+110,grRand(i,52)),50+30*grRand(i,53),{col:'#fbf6ff',shade:'#d8d0ec',lw:3,ink:grRgba(GR_INK,.3)});
 // the far mountains, with snow
 for(const [x0,h,col] of [[-700,330,'#9c9cd0'],[-260,420,'#8e8cc6'],[180,360,'#a6a2d4'],[600,300,'#9a98cc']]){const top=60-h;grPart(c,`M${x0-360} 80L${x0-90} ${top+70}L${x0} ${top}L${x0+110} ${top+90}L${x0+380} 80Z`,col,{tones:[[`M${x0} ${top}L${x0+110} ${top+90}L${x0+380} 80L${x0+40} 80Z`,grRgba('#6c6aa6',.4)]],lw:5,ink:grRgba(GR_INK,.5)});
  grPart(c,`M${x0-60} ${top+46}L${x0} ${top}L${x0+70} ${top+56}L${x0+40} ${top+46}L${x0+16} ${top+66}L${x0-14} ${top+44}L${x0-36} ${top+60}Z`,'#ffffff',{lw:3,ink:grRgba(GR_INK,.4)});}
 // the crag where the nest is, and rocks
 grPart(c,`M${S.left} 140C-500 70 -300 120 -100 110C150 96 400 120 ${S.right} 90L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#b8a4b8',{tones:[[`M${S.left} 380L${S.right} 380L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#8c7690',.35)],[`M${S.left} 120L${S.right} 100L${S.right} 160L${S.left} 170Z`,grRgba('#e2d4e2',.5)]],lw:6});
 for(let i=0;i<10;i++){const x=S.left+(S.right-S.left)*grRand(i,54),y=170+(Math.max(440,S.bottom-40)-170)*grRand(i,55),r=18+26*grRand(i,56);if(Math.abs(x)<520&&y<420)continue;grPart(c,`M${x-r*1.4} ${y}L${x-r} ${y-r}L${x+r*.3} ${y-r*1.3}L${x+r*1.4} ${y}Z`,'#a48ea8',{tones:[[`M${x} ${y-r*1.3}L${x+r*1.4} ${y}L${x} ${y}Z`,grRgba('#7a6680',.4)]],lw:5});}
 // dark pines on both sides
 for(const [x,y,h] of [[-560,150,230],[-470,170,180],[520,160,220],[600,180,170],[-660,190,200]]){grLine(c,`M${x} ${y}L${x} ${y-h*.2}`,12,'#5a4436');for(let j=0;j<4;j++){const yy=y-h*.15-j*h*.22,ww=h*.34*(1-j*.2);grPart(c,`M${x-ww} ${yy}L${x} ${yy-h*.34}L${x+ww} ${yy}Z`,'#3f6a5a',{tones:[[`M${x} ${yy-h*.34}L${x+ww} ${yy}L${x} ${yy}Z`,grRgba('#2a4a40',.45)]],lw:5});}}
 if(S.bottom>520)for(let i=0;i<9;i++){const x=S.left+(S.right-S.left)*((i+.5)/9),y=S.bottom-30-50*grRand(i,57),r=24+20*grRand(i,58);grPart(c,`M${x-r*1.4} ${y}L${x-r} ${y-r}L${x+r*.3} ${y-r*1.3}L${x+r*1.4} ${y}Z`,'#a48ea8',{lw:5});}}
const MY_NEST={x:-20,y:300,w:300,h:70};
function myNestBack(c,coins){const N=MY_NEST;grPart(c,grEll(N.x,N.y-30,N.w,N.h),'#8a6240',{tones:[[grEll(N.x,N.y-10,N.w,N.h*.6),grRgba('#5a3a20',.4)]],lw:7});
 if(coins>0){c.save();c.beginPath();grPath(c,grEll(N.x,N.y-30,N.w-20,N.h-10));c.rect(N.x-N.w,N.y-200,N.w*2,170);c.clip();const top=N.y-30-90*coins;grPart(c,`M${N.x-N.w+30} ${N.y-20}C${N.x-N.w+60} ${top} ${N.x+N.w-60} ${top} ${N.x+N.w-30} ${N.y-20}Z`,'#e8b23a',{tones:[[`M${N.x} ${top}L${N.x+N.w} ${top}L${N.x+N.w} ${N.y}L${N.x} ${N.y}Z`,grRgba('#b07a20',.35)]],lw:6});
  for(let i=0;i<26;i++){const v=i/25,x=N.x-N.w+50+v*(2*N.w-100),y=N.y-24-(top>N.y-40?0:(N.y-30-top)*Math.sin(GR_PI*v)*grRand(i,61));myCoin(c,x,y,13,.6*grRand(i,62));}c.restore();}}
function myNestFront(c){const N=MY_NEST;grPart(c,`M${N.x-N.w} ${N.y-30}C${N.x-N.w} ${N.y+40} ${N.x+N.w} ${N.y+40} ${N.x+N.w} ${N.y-30}C${N.x+N.w-30} ${N.y+4} ${N.x-N.w+30} ${N.y+4} ${N.x-N.w} ${N.y-30}Z`,'#a07448',{tones:[[grEll(N.x,N.y+30,N.w,20),grRgba('#5a3a20',.35)]],lw:7});
 for(let i=0;i<16;i++){const x=N.x-N.w+20+i*(2*N.w-40)/15,y=N.y-4+18*Math.sin(GR_PI*i/15);grLine(c,`M${x-30} ${y-10+(i%2)*14}Q${x} ${y+6} ${x+34} ${y-4-(i%2)*10}`,6,i%3?'#6a4628':'#c09060');}}
const MY_COINS=Array.from({length:34},(_,i)=>({vx:(grRand(i,63)-.5)*1100,vy:-700-500*grRand(i,64),gx:(grRand(i,65)-.5)*1000,gy:320+110*grRand(i,66),spin:1+2*grRand(i,67),d:.25*grRand(i,68)}));
function myGriffinScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-scythia',o.decor,myScythia);
 const BX=-110,BY=250,BK=1.08,HX=BX+200*BK,HY=BY-220*BK;
 // the feather that falls, the sneeze, the coins in the air, the sweep, the bowl
 const ah=grSpan(u,1.55,2.25),sneeze=still?grSmooth(grSpan(u,2.2,2.5))*(1-grSmooth(grSpan(u,2.8,3.4))):grBump(u,2.22,2.75),out=u>=2.3?grSmooth(grSpan(u,2.3,2.5)):0;
 const sweep=grSmooth(grSpan(u,4.6,6.2)),pile=u<2.3?1:u<4.6?.25:.25+.75*sweep;
 let head={x:HX,y:HY,r:0},P={t,look:[.5,0],brow:.4,beak:0,turn:.3};
 let wing=still?.15:.12+.05*Math.sin(t*1.2),hat=null;
 if(u<1.55){P.look=[.4,-.6+grSmooth(grSpan(u,.6,1.5))*1.4];P.brow=.6;}
 if(ah>0&&ah<1){P.look=[0,1];P.lid=.25+.45*ah;P.brow=1;P.beak=.2+.4*ah;head.y-=24*ah;head.r=-.12*ah;}
 if(sneeze>0){head.y+=36*sneeze;head.r=.1*sneeze;P.beak=1;P.lid=1;P.brow=-.6;wing=Math.max(wing,sneeze);}
 if(u>2.75&&u<4.5){P.lid=0;P.beak=.5;P.brow=1;P.look=[Math.sin(u*2.6),-.6];}
 const bonk=still?0:grBump(u,3.45,3.75);if(bonk>0){P.lid=.9;head.y+=14*bonk;}
 if(u>4.5&&u<6.3){P.look=[-1,.4];P.brow=-.2;P.beak=0;wing=Math.max(wing,.5*grBump(u,4.55,6.25));head.r=-.08*grBump(u,4.6,6.2);}
 // the bowl falls from the sky and lands upside down over his eyes
 const fall=grSpan(u,6.35,7.25),land=u>=7.25;
 if(u>6.35){const hx=head.x,hy=head.y-82;if(!land){const v=grIn(fall);hat={x:hx-120*(1-v),y:grLerp(S.top-200,hy+78,v),r:GR_PI+(1-v)*(still?0:1.2),s:120};}
  else{const up=grSmooth(grSpan(u,7.85,8.35)),wb=still?0:grBump(u,7.25,7.5);hat={x:hx+6*up,y:hy+78*(1-up)-8*wb,r:GR_PI-.22*up,s:124};}}
 if(u>6.3&&u<7.25){P.look=[0,-1];P.brow=1;P.beak=.6;}
 if(land&&u<7.95){P.lid=0;P.look=[0,0];P.beak=u<7.6?.4:0;}
 if(u>=7.95&&u<8.4){P.look=[-.4,-.8];P.brow=.6;}
 if(u>=8.4){P.look=[.5,0];P.brow=.6;P.beak=.25;wing=Math.max(wing,grSmooth(grSpan(u,8.45,8.95)));P.lid=u>9.1&&u<9.35?1:0;}
 const W=(front,k)=>{c.save();c.translate(front?20:60,-190);c.scale(-1,1);c.rotate(front?-.2:-.05);if(front)c.scale(1.15,1.15);grWing(c,k,front?undefined:['#e8e0cc','#e0d6c0','#b8a888']);c.restore();};
 const K=Math.max(.86,Math.min(1.15,(Math.min(-S.left,S.right)-50)/520)),Y0=330;
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  myNestBack(c,pile);
  grAt(c,BX,BY,BK,1,0,()=>{W(false,wing);myLionBody(c,{mane:false,breath:still?.5:.5+.5*Math.sin(t*1.4),col:'#e2ac56'});W(true,wing);});
  // the little feather: down onto his beak, and away with the sneeze
  if(u<2.9){let fx,fy,fr;if(u<1.55){const v=grSmooth(grSpan(u,0,1.55));fx=head.x+30+80*Math.sin(v*7)*(1-v);fy=grLerp(S.top-40,head.y+40,v);fr=.5*Math.sin(v*7);}
   else if(u<2.25){fx=head.x+30;fy=head.y+40+(head.y-HY);fr=.3;}else{const v=grOut(grSpan(u,2.25,2.9));fx=head.x+30+380*v;fy=head.y+40-260*v;fr=.3+4*v;}
   c.save();c.translate(fx,fy);c.rotate(fr);grPart(c,grLeaf(0,0,-GR_PI/2,96,26),'#d8eeff',{tones:[[grLeaf(6,0,-GR_PI/2,96,12),grRgba('#8fb8e8',.6)]],lw:5});grLine(c,'M0 10L0 -92',4,grRgba('#6a88c0',.9));c.restore();}
  grAt(c,head.x,head.y,1.1,1,head.r+(still?0:.03*Math.sin(t*.9)),()=>myEagleHead(c,P));
  if(hat)myPhiale(c,hat.x,hat.y,hat.s,hat.r);
  myNestFront(c);
  // the coins: up like a fountain, down all round, and back into the nest with the sweep
  if(u>=2.3&&u<6.4)for(const [i,q] of MY_COINS.entries()){const st=[MY_NEST.x+(i/MY_COINS.length-.5)*360,MY_NEST.y-50];let x,y,a=0;
   const T=u-2.3-q.d*.4;if(T<0)continue;const g=1500,tl=(-q.vy+Math.sqrt(q.vy*q.vy+2*g*(q.gy-st[1])))/g;
   if(still){const v=grSmooth(grSpan(u,2.3,3.4));x=grLerp(st[0],st[0]+q.gx*.6,v);y=grLerp(st[1],q.gy,v);}
   else if(T<tl){x=st[0]+q.vx*T*.9;y=st[1]+q.vy*T+g*T*T/2;a=(T*q.spin)%2;}else{x=st[0]+q.vx*tl*.9;y=q.gy;a=-1;}
   if(x<-560||x>560){x=Math.max(-560,Math.min(560,x));}
   const b=grSmooth(grSpan(u,4.7+i*.035,5.5+i*.035));if(b>0){x=grLerp(x,st[0],b);y=grLerp(y,st[1]+20,b)-60*Math.sin(GR_PI*b);}if(b>=1)continue;
   if(!still&&i===5&&u>3.2&&u<3.75){x=head.x+10;y=grLerp(S.top-60,head.y-90,grIn(grSpan(u,3.2,3.45)));if(u>3.45){x+=200*grSpan(u,3.45,3.75);y=head.y-90-120*Math.sin(GR_PI*grSpan(u,3.45,3.75));}}
   if(a<0&&b<=0)grPart(c,grEll(x,y,18,7),'#f0c040',{tones:[[grEll(x,y+3,18,4),grRgba('#c08a20',.5)]],lw:3});else myCoin(c,x,y,18,Math.max(0,a));}
  if(bonk>0)for(let i=0;i<4;i++)mySpark(c,head.x-60+i*40,head.y-120-10*i,16,'#fff6c8',bonk);
  if(!still&&u>8.95)for(let i=0;i<6;i++)mySpark(c,MY_NEST.x-280+i*112,-180+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.95+i*.06,9.5));});
 return myAnchor(S,head.x*K,Y0+(head.y-Y0)*K,280*K);}
// ── The phoenix (the feather and the bird) ─────────────────────────────────────────────────────────────────────────────────
// At dusk, on the top of a palm tree, by the far pyramids and the obelisk of the city of the sun. Phoenix-Glups, a bird of fire, preens
// on his nest of cinnamon sticks, yawns and settles down to sleep; gentle flames rise round the nest and he is gone. When they die there
// is only a heap of ash; the ash wobbles and out pops a chick with Glups's moustache, covered in ash. He coughs, shakes the ash off,
// grows a little, flaps his tiny wings, flies a hand above the nest and lands, proud.
function myHeliopolis(c,S){c.fillStyle=grVGrad(c,S.top,S.bottom,['#3c3a78','#7a5a96','#e88a6a','#f8c27a','#e8b07a']);c.fillRect(S.left,S.top,S.right-S.left,S.bottom-S.top);
 for(let i=0;i<26;i++){const x=S.left+(S.right-S.left)*grRand(i,71),y=S.top+(Math.max(-150,S.top+200)-S.top)*grRand(i,72);c.fillStyle=grRgba('#fff6e0',.5+.4*grRand(i,73));c.beginPath();c.arc(x,y,2+2.5*grRand(i,74),0,GR_TAU);c.fill();}
 grPart(c,'M372 -290C330 -300 300 -260 306 -220C312 -178 352 -158 384 -168C356 -180 340 -206 342 -232C344 -262 358 -282 372 -290Z','#fff2c8',{lw:4,ink:grRgba(GR_INK,.4)});
 grGlow(c,0,140,520,'#ffd08a',.45);
 // the pyramids, the obelisk and the temple, far away
 for(const [x,b,h] of [[-430,130,200],[-250,130,140],[420,130,170]]){grPart(c,`M${x-h*1.1} ${b}L${x} ${b-h}L${x+h*1.1} ${b}Z`,'#c88a6a',{tones:[[`M${x} ${b-h}L${x+h*1.1} ${b}L${x} ${b}Z`,grRgba('#9a5a4a',.45)]],lw:4,ink:grRgba(GR_INK,.45)});}
 grPart(c,'M238 130L246 -40L256 -60L266 -40L274 130Z','#d89a72',{tones:[['M256 -60L266 -40L274 130L256 130Z',grRgba('#9a5a4a',.4)]],lw:4,ink:grRgba(GR_INK,.45)});
 grPart(c,`M${S.left} 140C-500 100 -300 120 -100 110C150 100 380 126 ${S.right} 110L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#e8a86a',{tones:[[`M${S.left} 300C-200 260 200 280 ${S.right} 250L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#c47a50',.45)],[`M${S.left} 140L${S.right} 110L${S.right} 150L${S.left} 170Z`,grRgba('#ffd8a0',.5)]],lw:6});
 // two small palms far away, and grasses
 for(const [x,y,k] of [[-560,200,.55],[560,190,.6],[-680,260,.7]]){c.save();c.translate(x,y);c.scale(k,k);grLine(c,'M0 0Q10 -120 0 -240',22,'#8a5a3a');for(let j=0;j<6;j++){const a=-GR_PI/2+(j-2.5)*.5;grPart(c,grLeaf(0,-240,a,150,30),'#4f7a4a',{lw:5});}c.restore();}
 if(S.bottom>520)for(let i=0;i<10;i++){const x=S.left+(S.right-S.left)*((i+.5)/10),y=S.bottom-30-50*grRand(i,75);for(let j=-2;j<=2;j++)grLine(c,`M${x+j*8} ${y}Q${x+j*12} ${y-40} ${x+j*22} ${y-70-20*grRand(i+j,76)}`,6,'#9a8a50');}}
const MY_PNEST={x:0,y:236,w:200};
function myPalm(c,S,t,still){const N=MY_PNEST;grPart(c,`M${N.x-30} ${N.y}C${N.x-36} 300 ${N.x-10} 420 ${N.x-50} ${S.bottom+20}L${N.x+50} ${S.bottom+20}C${N.x+30} 420 ${N.x+36} 300 ${N.x+30} ${N.y}Z`,'#9a6a40',{tones:[[`M${N.x+6} ${N.y}L${N.x+60} ${N.y}L${N.x+60} ${S.bottom+20}L${N.x+10} ${S.bottom+20}Z`,grRgba('#6a4428',.4)]],lw:7});
 for(let y=N.y+30;y<S.bottom;y+=34)grLine(c,`M${N.x-36} ${y}Q${N.x} ${y+12} ${N.x+36} ${y-2}`,5,grRgba('#5a3a20',.6));
 for(let j=0;j<8;j++){const a=GR_PI*(.02+j/7*.96)+(still?0:.03*Math.sin(t*.8+j)),L=260+30*Math.sin(j*2);const ex=N.x+Math.cos(a)*L,ey=N.y+30+Math.sin(a)*L*.35+60;
  grPart(c,`M${N.x} ${N.y+20}Q${N.x+Math.cos(a)*L*.5} ${N.y-20+Math.sin(a)*L*.2} ${ex} ${ey}Q${N.x+Math.cos(a)*L*.55} ${N.y+40} ${N.x} ${N.y+40}Z`,j%2?'#5a8a4a':'#4a7a40',{lw:6});
  for(let q=1;q<6;q++){const v=q/6,x=grLerp(N.x,ex,v),y=grLerp(N.y+20,ey,v)-30*Math.sin(GR_PI*v);grLine(c,`M${x} ${y}l${Math.cos(a+1.2)*30} ${Math.sin(a+1.2)*30+20}`,6,'#3f6a38');}}}
function myPNestBack(c){const N=MY_PNEST;grPart(c,grEll(N.x,N.y-10,N.w,44),'#8a5030',{lw:7});}
function myPNestFront(c){const N=MY_PNEST;for(let i=0;i<9;i++){const y=N.y-10+i*5,w=N.w-6*Math.abs(i-3);grPart(c,`M${N.x-w} ${y}L${N.x+w} ${y-6+(i%2)*12}L${N.x+w} ${y+8+(i%2)*12}L${N.x-w} ${y+14}Z`,i%2?'#b8743c':'#9a5a30',{lw:5});}
 for(let i=0;i<10;i++){const x=N.x-N.w+20+i*(2*N.w-40)/9,y=N.y-12+20*Math.sin(GR_PI*i/9),a=(grRand(i,77)-.5)*1.4+(i<5?GR_PI:0);grLine(c,`M${x} ${y}l${Math.cos(a)*50} ${Math.sin(a)*24-8}`,7,i%2?'#7a4424':'#c88a4a');}}
function myPhoenixScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-heliopolis',o.decor,myHeliopolis);const N=MY_PNEST,E=still?grSmooth:grBack;
 const fk=grSmooth(grSpan(u,2.0,3.2))*(1-grSmooth(grSpan(u,3.9,4.6))),bA=1-grSmooth(grSpan(u,3.0,3.7)),ash=grSmooth(grSpan(u,3.6,4.2))*(1-grSmooth(grSpan(u,5.3,5.7))*.3);
 // the big bird
 const settle=grSmooth(grSpan(u,1.4,2.0)),yawn=grBump(u,.8,1.5);
 const BP={t,open:.15,tailL:1,sit:settle*.8},HP={t,look:[.4,0],turn:.3,wreath:true,brow:.4};
 if(u<.8){HP.look=[.6,-.2];HP.brow=.6;}if(yawn>0){HP.beak=yawn;HP.lid=.7*yawn;HP.brow=1;}if(settle>0){HP.lid=.95*settle;HP.look=[0,0];HP.brow=.2;}
 if(u>2.6&&u<3.4){HP.lid=.3;HP.brow=1;HP.look=[0,1];}
 // the chick
 const pop=E(grSpan(u,5.3,5.62)),grow=grSmooth(grSpan(u,6.6,7.2)),ashy=1-grSmooth(grSpan(u,6.3,6.6)),cs=grLerp(.52,.78,grow);
 const hover=still?grSmooth(grSpan(u,7.3,7.8))*(1-grSmooth(grSpan(u,8.3,8.7))):grSmooth(grSpan(u,7.3,7.9))*(1-grSmooth(grSpan(u,8.2,8.6))),landB=still?0:grBump(u,8.55,8.85);
 const flap=u>7.2&&u<8.65?(still?.5:Math.abs(Math.sin((u-7.2)*13))):0,shake=still?0:Math.sin((u-6.3)*20)*grBump(u,6.3,6.65)*.14;
 const CP={t,open:.25+.75*flap,flap:flap*.6,fluff:1-grow*.4,tailL:.3+.25*grow,sit:.6*(1-hover)},CH={t,look:[0,0],chick:1,wreath:true,brow:.4,turn:0};
 if(u<5.7){CH.look=[Math.sin(u*3)>0?-1:1,0];CH.brow=1;}
 const cough=grBump(u,5.75,6.25);if(cough>0){CH.beak=cough;CH.lid=.8*cough;CH.brow=-.4;}
 if(u>6.3&&u<6.65){CH.lid=1;CH.brow=-.2;}
 if(u>7.2&&u<8.6){CH.look=[.3,-.6];CH.brow=1;CH.beak=.4;}
 if(u>8.6){CH.look=[.4,0];CH.brow=.6;CH.beak=0;CH.lid=u>9.1&&u<9.32?1:0;}
 const ashC=(col)=>grMix(col,'#9a9490',ashy*.75);
 const cx=N.x+10,cy=N.y-14-170*hover-20*(1-pop)+10*landB;
 const K=Math.max(.86,Math.min(1.12,(Math.min(-S.left,S.right)-40)/440)),Y0=330;
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  myPalm(c,S,t,still);myPNestBack(c);
  if(bA>0){c.save();c.globalAlpha*=bA;grAt(c,N.x-10,N.y-6+30*settle,1.12,1,0,()=>{myBirdBody(c,BP);grAt(c,70,-300+30*settle,1,1,(still?0:.03*Math.sin(t*1.2))+.15*settle,()=>myBirdHead(c,HP));});c.restore();}
  // the heap of ash, and the chick out of it
  if(ash>0){c.save();c.globalAlpha*=ash;const wob=still?0:(grBump(u,4.85,5.05)+grBump(u,5.1,5.3))*.12;grPart(c,`M${N.x-130} ${N.y-6}C${N.x-110} ${N.y-80-30*wob} ${N.x+110} ${N.y-80+20*wob} ${N.x+130} ${N.y-6}Z`,'#a8a29c',{tones:[[grEll(N.x,N.y-6,130,20),grRgba('#7a746e',.4)],[grEll(N.x-30,N.y-56,40,10),grRgba('#ffffff',.3)]],lw:6});c.restore();}
  if(u>5.3){const P2={...CP,col:ashC(MY_PHOENIX.col),dark:ashC(MY_PHOENIX.dark),chest:ashC(MY_PHOENIX.chest),wing:MY_PHOENIX.wing.map(ashC),tail:MY_PHOENIX.tail.map(ashC)};
   c.save();if(u<5.62){c.beginPath();c.rect(N.x-300,S.top-400,600,N.y-6-(S.top-400));c.clip();}
   grAt(c,cx,cy+(1-pop)*90,cs,1,shake,()=>{myBirdBody(c,P2);grAt(c,40,-250,1.15,1,0,()=>myBirdHead(c,{...CH,col:ashC(MY_PHOENIX.col),dark:ashC(MY_PHOENIX.dark),crest:MY_PHOENIX.tail.map(ashC)}));});c.restore();}
  myPNestFront(c);
  // the flames: they rise slowly round the nest and hide him, and go down again
  if(fk>0){myFlames(c,N.x,N.y,9,330,320,t,still,fk);}
  // smoke, the cough, the ash shaken off
  for(let i=0;i<3;i++){const v=grSpan(u,4.0+i*.25,5.4+i*.25);if(v>0&&v<1)myCloud(c,N.x-60+60*i+30*v,N.y-120-260*v,30+30*v,{col:'#d8d2cc',shade:'#a8a29c',lw:2.5,ink:grRgba(GR_INK,.3*(1-v))});}
  if(cough>0&&!still){const v=grSpan(u,5.8,6.4);myCloud(c,cx+60*cs/.36+80*v,cy-250*cs-20-30*v,(20+30*v),{col:'#c8c2bc',shade:'#a8a29c',lw:2.5,ink:grRgba(GR_INK,.3*(1-v))});}
  if(!still&&u>6.3&&u<7.0){const v=grSpan(u,6.3,7.0);for(let i=0;i<12;i++){const a=GR_TAU*i/12;c.fillStyle=grRgba('#8a847e',1-v);c.beginPath();c.arc(cx+Math.cos(a)*(60+160*v),cy-60+Math.sin(a)*(60+120*v)+80*v*v,6,0,GR_TAU);c.fill();}}
  if(!still&&u>8.85)for(let i=0;i<6;i++)mySpark(c,N.x-260+i*104,N.y-260+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.85+i*.07,9.5));});
 return myAnchor(S,cx*K,Y0+(cy-120-Y0)*K,240*K);}
// ── The dragon of the golden apples (the feather and the snake) ────────────────────────────────────────────────────────────
// In the garden of the Hesperides, at the end of the world in the west, by the sea and the mountain of Atlas. Dragon-Glups (a long
// snake with small wings) is coiled round the tree of the golden apples, guarding it very seriously. An apple falls on his head; he
// looks round, nobody is watching, and he swallows it: a round lump goes down his long neck. He catches the next one in the air, and
// when the tree shakes and three more fall he catches them all. Now he is round as a ball: he flaps his little wings but cannot fly,
// lets out a tiny burp and smiles, a little ashamed.
function myHesperides(c,S){c.fillStyle=grVGrad(c,S.top,120,['#86c6ec','#c8e4f0','#ffe6cc']);c.fillRect(S.left,S.top,S.right-S.left,120-S.top);
 grGlow(c,-380,60,280,'#ffe2b0',.6);c.fillStyle='#fff2d0';c.beginPath();c.arc(-380,60,60,0,GR_TAU);c.fill();
 if(S.top<-470)for(let i=0;i<4;i++)myCloud(c,-380+i*250+50*grRand(i,81),grLerp(-430,S.top+110,grRand(i,82)),55+30*grRand(i,83),{col:'#fffaf4',shade:'#e0d8e8',lw:3,ink:grRgba(GR_INK,.3)});
 // the sea of the west, and the mountain of Atlas, far away, holding up the sky
 grPart(c,`M${S.left} 60L${S.right} 60L${S.right} 130L${S.left} 130Z`,'#4fa0d0',{tones:[[`M${S.left} 60L${S.right} 60L${S.right} 74L${S.left} 74Z`,grRgba('#ffffff',.35)]],lw:4,ink:grRgba(GR_INK,.4)});
 for(const [x,h] of [[380,190],[520,250],[660,170]])grPart(c,`M${x-220} 64L${x} ${64-h}L${x+220} 64Z`,'#9aaccc',{tones:[[`M${x} ${64-h}L${x+220} 64L${x} 64Z`,grRgba('#7a8cb0',.4)],[`M${x-50} ${64-h+46}L${x} ${64-h}L${x+50} ${64-h+46}L${x+20} ${64-h+36}L${x} ${64-h+52}L${x-24} ${64-h+36}Z`,'#ffffff']],lw:4,ink:grRgba(GR_INK,.4)});
 // the garden: grass, flowers, a low wall
 grPart(c,`M${S.left} 130C-300 110 0 140 300 120C460 112 ${S.right} 130 ${S.right} 130L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#8cc864',{tones:[[`M${S.left} 380L${S.right} 380L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#5a9a44',.35)],[`M${S.left} 130L${S.right} 130L${S.right} 170L${S.left} 170Z`,grRgba('#c4e89a',.5)]],lw:6});
 for(let x=S.left;x<S.right;x+=90){if(x>-560&&x<520)continue;grPart(c,`M${x} 150L${x+86} 150L${x+86} 100L${x} 100Z`,'#f0e6d0',{lw:4});}
 for(let i=0;i<30;i++){const x=S.left+(S.right-S.left)*grRand(i,84),y=170+(Math.max(440,S.bottom-30)-170)*grRand(i,85);if(Math.abs(x-40)<520&&y<400)continue;const col=['#ff9ab8','#fff07a','#ffffff','#c8a0f0'][i%4];
  for(let j=0;j<5;j++){const a=GR_TAU*j/5;c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(a)*9,y+Math.sin(a)*9,7,0,GR_TAU);c.fill();}c.fillStyle='#ffb43a';c.beginPath();c.arc(x,y,5,0,GR_TAU);c.fill();}
 for(const [x,y,k] of [[-620,180,1],[640,170,.9]]){c.save();c.translate(x,y);c.scale(k,k);grLine(c,'M0 0L0 -160',22,'#7a5a3a');grPart(c,grEll(0,-220,90,80),'#4f9a50',{tones:[[grEll(20,-190,80,50),grRgba('#2f7a3a',.4)]],lw:5});for(let j=0;j<5;j++)grPart(c,grEll(-50+j*25,-230+30*Math.sin(j*2),11,11),'#ffb43a',{lw:3});c.restore();}}
const MY_TREE={x:60,base:300,top:-90,cx:60,cy:-200,rx:300,ry:150};
const MY_APPLES=[[-190,-250],[-60,-300],[120,-310],[260,-250],[-120,-160],[200,-150],[20,-210],[310,-180],[-230,-180],[90,-240],[-20,-130],[160,-270]];
function myTreeTop(c,t,still,shake){const T=MY_TREE,sx=shake*12*Math.sin(t*20);c.save();c.translate(sx,0);
 for(const [x,y,r] of [[-160,-200,110],[0,-260,130],[160,-240,120],[260,-180,100],[-240,-150,90],[60,-150,130],[-80,-130,100],[200,-130,90]])grPart(c,grEll(T.cx+x-60,T.cy+y+200,r,r*.78),'#5aa850',{tones:[[grEll(T.cx+x-60,T.cy+y+200+r*.4,r,r*.4),grRgba('#2f7a3a',.4)],[grEll(T.cx+x-90,T.cy+y+170,r*.4,r*.2,-.3),grRgba('#ffffff',.25)]],lw:6});c.restore();}
function myApple(c,x,y,s=1,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);grPart(c,'M0 -18C-14 -30 -36 -24 -36 0C-36 22 -18 34 0 30C18 34 36 22 36 0C36 -24 14 -30 0 -18Z','#ffc43a',{tones:[[grEll(10,10,24,20),grRgba('#d88a20',.45)],[grEll(-14,-6,8,10,.3),grRgba('#ffffff',.6)]],lw:5});grLine(c,'M0 -18L4 -34',5,'#7a5030');grPart(c,grLeaf(4,-30,-.4,26,10),'#5aa850',{lw:3});c.restore();}
const myCR=(P,n=8)=>{const out=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;out.push([0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3)));}}out.push(P[P.length-1]);return out;};
const MY_DRAGON={col:'#52b56c',dark:'#2f7d4a',belly:'#f2e58a',spot:'#3a9a58'};
function myDragonScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-hesperides',o.decor,myHesperides);const D=MY_DRAGON,T=MY_TREE;
 // the head: where it is, and its face
 let hx=-270,hy=-70,hr=0;const P={t,col:D.col,dark:D.dark,belly:D.belly,look:[.5,0],brow:-.4,mouth:'flat',tuft:true,wreath:true,open:1};
 if(u<1.1&&!still){const v=Math.sin(u*4);hx+=30*v;P.look=[v>0?1:-1,0];}
 // apple 1: falls on his head; he looks round and swallows it
 const bonk=grBump(u,1.42,1.8);if(u>1.42&&u<2.0){P.lid=.85;P.brow=-.8;P.mouth='o';hy+=26*bonk;}
 if(u>2.0&&u<2.4){P.look=[-.2,1];P.brow=1;P.mouth='o';P.open=.5;}
 if(u>2.4&&u<2.6){P.look=[-1,0];P.brow=-.6;P.mouth='flat';}if(u>2.6&&u<2.8){P.look=[1,0];P.brow=-.6;P.mouth='flat';}
 const dip1=grSmooth(grSpan(u,2.8,3.02))*(1-grSmooth(grSpan(u,3.08,3.35)));hx=grLerp(hx,-300,dip1);hy=grLerp(hy,180,dip1);if(dip1>.3){P.mouth=u<3.04?'open':'chew';P.look=[0,1];}
 if(u>3.35&&u<4.25){P.look=[.3,-1];P.lid=.35;P.brow=.6;P.mouth='o';P.open=.3;}
 // apple 2: he catches it in the air, then sees what he did
 const reach2=grSmooth(grSpan(u,4.3,4.65))*(1-grSmooth(grSpan(u,4.9,5.2)));hx=grLerp(hx,-190,reach2);hy=grLerp(hy,-150,reach2);
 if(u>4.3&&u<4.68){P.look=[.4,-1];P.mouth='open';P.brow=1;}if(u>4.68&&u<5.0){P.mouth='grin';P.lid=.4;P.brow=.6;}if(u>5.0&&u<5.3){P.mouth='o';P.open=.6;P.brow=1;P.look=[1,0];}
 // the tree shakes and three fall: he catches them one by one
 const shake=grBump(u,5.5,6.2),catches=[[6.0,-140],[6.17,-280],[6.34,-200]];
 if(u>5.75&&u<6.45){const k=catches.findIndex(([a])=>u<a);const tx=k<0?-170:catches[k][1];hx=grLerp(hx,tx,still?.5:.8);hy=grLerp(hy,-140,grSmooth(grSpan(u,5.75,5.95)));P.mouth='open';P.open=1;P.brow=1;P.look=[0,-1];}
 if(u>6.45&&u<6.85){P.mouth='chew';P.lid=.5;P.brow=-.2;}
 const fat=grSmooth(grSpan(u,6.5,6.9));
 // he tries to fly with his little wings, and cannot
 const tryfly=u>6.9&&u<8.0,flap=tryfly?(still?.6:Math.abs(Math.sin((u-6.9)*13))):0,lift=still?0:grSmooth(grSpan(u,6.9,7.4))*(1-grSmooth(grSpan(u,7.75,8.0)));
 if(tryfly){P.brow=-1;P.lid=.6;P.mouth='flat';hy-=50*lift;}
 const plop=still?0:grBump(u,7.95,8.25);hy+=24*plop;
 const burp=grBump(u,8.2,8.6);if(burp>0){P.mouth='o';P.open=.8;P.lid=.6;P.brow=1;}
 if(u>8.6){P.mouth='grin';P.lid=.45;P.brow=.7;P.look=[.2,.1];}
 if(!still)hy+=6*Math.sin(t*1.5);
 // the body: from the tip of the tail, round the trunk, up to the head
 const neckBase=[150,120];const pts=myCR([[500,296],[400,304],[300,312],[200,320],[90,330],[-30,318],[-110,280],[-90,226],[0,196],[100,178],[190,150],[200,96],[130,60],[30,40],[-80,30],[(hx-80)/2-40,(hy+30)/2+10],[hx,hy+50]],7);
 const n=pts.length-1,front=[[0,42],[70,n]],bul=[];
 const ap=(a0,a1,end=.6)=>{const v=grSpan(u,a0,a1);if(v>0&&v<1)bul.push(grLerp(1,end,grSmooth(v)));};
 ap(3.1,4.4,.42);ap(5.3,6.3,.36);
 const W=v=>{let w=grLerp(30,108,Math.min(1,v/.3))*(1+1.1*fat*Math.pow(Math.sin(GR_PI*grClamp((v-.12)/.5)),2));if(v>.8)w=grLerp(108,90,(v-.8)/.2);for(const b of bul)w+=66*Math.exp(-Math.pow((v-b)/.04,2));return w;};
 const ribbon=(a,b)=>myRibbon(pts.slice(a,b+1),q=>W((a+q*(b-a))/n));
 const K=Math.max(.86,Math.min(1.12,(Math.min(-S.left,S.right)-50)/520)),Y0=320;
 // the apples in the air
 const falls=[];
 if(u>1.1&&u<1.45){const v=grIn(grSpan(u,1.1,1.45));falls.push([grLerp(MY_APPLES[0][0],hx,v),grLerp(MY_APPLES[0][1],hy-120,v),v*2]);}
 if(u>=1.45&&u<3.04){const v=grSpan(u,1.45,1.95);const e=[-300,240];falls.push(u<1.95?[grLerp(hx,e[0],v),grLerp(hy-120,e[1],v)-120*Math.sin(GR_PI*v),2+v*4]:[e[0],e[1],0]);}
 if(u>4.3&&u<4.68){const v=grIn(grSpan(u,4.3,4.68));falls.push([grLerp(MY_APPLES[1][0],-190,v),grLerp(MY_APPLES[1][1],-200,v),v*3]);}
 catches.forEach(([at,x],i)=>{const st=MY_APPLES[2+i];if(u>5.75+i*.05&&u<at){const v=grIn(grSpan(u,5.75+i*.05,at));falls.push([grLerp(st[0],x,v),grLerp(st[1],-190,v),v*3]);}});
 const gone=i=>(i===0&&u>1.1)||(i===1&&u>4.3)||(i>=2&&i<=4&&u>5.75+(i-2)*.05);
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(20,-Y0);
  // the trunk behind, the body, then the trunk over the parts of the body that go behind it
  const trunk=()=>grPart(c,`M${T.x-44} ${T.base-10}C${T.x-40} 200 ${T.x-50} 0 ${T.x-30} ${T.top}L${T.x+30} ${T.top}C${T.x+40} 0 ${T.x+50} 200 ${T.x+44} ${T.base-10}Z`,'#8a6040',{tones:[[`M${T.x+10} ${T.top}L${T.x+60} ${T.top}L${T.x+60} ${T.base+20}L${T.x+14} ${T.base+20}Z`,grRgba('#5a3a20',.4)]],lw:7});
  trunk();
  grPart(c,myRibbon(pts,q=>W(q)),D.col,{tones:[[myRibbon(pts.map(([x,y],i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(n,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,o=W(i/n)*.28;return [x+dy/m*o,y-dx/m*o];}),q=>W(q)*.45),grRgba(D.belly,.95)]],lw:7});
  for(let i=3;i<n-3;i+=4){const [x,y]=pts[i],a=pts[i-1],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1,w=W(i/n),o=w*.22;grPart(c,grEll(x-dy/m*o,y+dx/m*o,5+w*.09,4+w*.07,Math.atan2(dy,dx)),D.spot,{lw:0});}
  c.save();c.beginPath();c.rect(-2000,-2000,4000,4000);for(const [a,b] of front)grPath(c,ribbon(a,b));c.clip('evenodd');trunk();c.restore();
  // the little wings on the shoulders
  for(const s of [1,-1]){c.save();c.translate(neckBase[0]+30*s,neckBase[1]-40);c.scale(s*.62,.62);c.rotate(-.5-flap*.7+(s<0?.2:0));grWing(c,.4+.6*Math.max(flap,fat*.2),['#7cc87a','#a8dc94','#4a8a48'],'skin');c.restore();}
  myTreeTop(c,t,still,shake);
  MY_APPLES.forEach(([x,y],i)=>{if(!gone(i))myApple(c,x+(shake?12*shake*Math.sin(t*20):0),y,1.05);});
  for(const [x,y,r] of falls)myApple(c,x,y,1.05,still?0:r);
  // the head, with two little horns
  grAt(c,hx,hy,1.38,1,hr+(still?0:.04*Math.sin(t*1.1)),()=>{for(const s of [-1,1])grPart(c,`M${s*30} -60L${s*44} -112L${s*58} -54Z`,'#f2e58a',{lw:6});mySnakeHead(c,P);
   if(u>6.0&&u<6.85)for(const s of [-1,1])grPart(c,grEll(s*64,36,22,18),D.col,{lw:5});});
  if(bonk>0)for(let i=0;i<4;i++)mySpark(c,hx-70+i*46,hy-150-10*i,18,'#fff6c8',bonk);
  if(u>3.35&&u<4.25&&!still)myNote(c,hx+70,hy-60-60*grSpan(u,3.35,4.25),44,'#5fb8ff',Math.sin(GR_PI*grSpan(u,3.35,4.25)),.2*Math.sin(t*3));
  if(burp>0)myCloud(c,hx+50+40*grSpan(u,8.2,8.8),hy+20-50*grSpan(u,8.2,8.8),14+16*burp,{col:'#fff8e8',shade:'#e8dcc0',lw:2.5,ink:grRgba(GR_INK,.35*burp)});
  if(!still&&u>8.9)for(let i=0;i<5;i++)mySpark(c,-300+i*150,-60+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.9+i*.07,9.5));});
 return myAnchor(S,(hx+20)*K,Y0+(hy-Y0)*K,240*K);}
export const MY_SCENES_A={pegasus:myPegasusScene,griffin:myGriffinScene,phoenix:myPhoenixScene,dragon:myDragonScene};
export function myScene(c,w,h,id,u,o={}){const S=myStage(w,h,o.H||h),f=MY_SCENES_A[id]||MY_SCENES_B[id]||MY_SCENES_C[id];return f?f(c,S,u,o):null;}

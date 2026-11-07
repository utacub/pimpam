// La cassola d'en Glups (EN23), 0.27: the scenes of the creatures of the garlic (more heads): Cerberus, the Hydra and the Chimera.
// Same rules as cassola-mites.js: about nine and a half seconds each (u from 0 to MY_DUR), a decor painted once, smooth eases, no flash,
// and in «Moviment reduït» (o.still) the creature stays in its place. Each scene returns its anchor (screen units).
import {GR_PI,GR_TAU,GR_INK,GR_HAIR,grClamp,grSmooth,grOut,grIn,grBack,grLerp,grSpan,grBump,grMix,grShade,grRgba,grRand,grPath,grEll,grLW,grPart,grLine,grTube,grVGrad,grRGrad,grGlow,grShadow,grLeaf,grAt,grUnion,grLimb,grMane,grCurls} from './grec-art.js';
import {myStage,myIn,myBackdrop,myCloud,mySpark,myEye,myBrow,myWreath,myKeys,myAnchor,myFlames,myNote,myBubble,myMouth,myMoustache2,myBez,myRibbon,myDogHead,myDogBody,myPerson,myLyre,mySnakeHead,mySnakeNeck,myLily,MY_SNAKE,myLionHead,myLionBody,myGoatHead,myFurNeck,myBread,myBasket,myBreath} from './grec-bestiari.js';
// ── Cerberus (the garlic and the dog) ──────────────────────────────────────────────────────────────────────────────────────
// At the gate of the world below: a cave of violet stone, the river at the back with the ferry and its lantern, asphodels on the floor.
// Cerberus guards the gate, each head looking its own way, and the big one barks. Orpheus comes with his lyre and plays: the three heads
// turn to the music, sway, yawn one after the other and fall asleep leaning on each other, with a bubble of sleep each. Orpheus tiptoes
// through the gate; the little head opens one eye, sees him go, and winks.
const MY_GATE={x:-250,top:-290,ground:206,w:310,ow:186,otop:-186};
function myHades(c,S){c.fillStyle=grVGrad(c,S.top,S.bottom,['#2a2250','#41356c','#5a4a86','#6a5a92']);c.fillRect(S.left,S.top,S.right-S.left,S.bottom-S.top);
 grGlow(c,320,40,560,'#b89ae0',.32);
 // the river and the ferry, far away
 c.fillStyle=grVGrad(c,96,206,['#33597e','#4a7f9c']);c.fillRect(S.left,96,S.right-S.left,110);for(let i=0;i<14;i++){const x=S.left+(S.right-S.left)*grRand(i,4),y=110+86*grRand(i,6);grLine(c,`M${x} ${y}q16 -6 32 0`,4,grRgba('#b8e0f0',.5));}
 grPart(c,'M330 100C360 118 470 118 500 100L490 124C460 136 370 136 344 124Z','#4a3a52',{lw:5});grLine(c,'M420 104L420 20',5);grLine(c,'M420 24L452 32',4);grGlow(c,452,44,40,'#ffd890',.7);c.fillStyle='#ffe6a8';c.beginPath();c.arc(452,44,9,0,GR_TAU);c.fill();
 // the rock of the far wall above the river, and the stalactites
 grPart(c,`M${S.left} 100C-300 60 -100 90 100 70C300 50 420 80 ${S.right} 60L${S.right} ${S.top}L${S.left} ${S.top}Z`,'#352a5a',{tones:[[`M${S.left} 40C-200 0 200 20 ${S.right} 10L${S.right} 110L${S.left} 110Z`,grRgba('#52467e',.6)]],lw:6});
 grPart(c,`M${S.left} ${S.top}L${S.right} ${S.top}L${S.right} ${S.top+90}C300 ${S.top+130} 100 ${S.top+70} -100 ${S.top+110}C-300 ${S.top+140} -400 ${S.top+80} ${S.left} ${S.top+110}Z`,'#2e2552',{lw:6});
 for(let i=0;i<9;i++){const x=S.left+(S.right-S.left)*(i+.5)/9+60*(grRand(i,2)-.5),w=70+70*grRand(i,3),h=(i%3===1?220:90)+120*grRand(i,5),y=S.top+60;
  grPart(c,`M${x-w/2} ${y}C${x-w/3} ${y+h*.5} ${x-8} ${y+h} ${x} ${y+h}C${x+8} ${y+h} ${x+w/3} ${y+h*.5} ${x+w/2} ${y}Z`,i%2?'#3a2f62':'#45396f',{tones:[[`M${x} ${y}L${x+w} ${y}L${x+w} ${y+h}L${x} ${y+h}Z`,grRgba('#1d1838',.3)]],lw:6});}
 // the floor
 grPart(c,`M${S.left} 200C-200 186 200 214 ${S.right} 196L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#6c5f94',{tones:[[`M${S.left} 330C-100 300 200 340 ${S.right} 320L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#4f4478',.6)]],lw:7});
 for(let i=0;i<9;i++){const x=S.left+(S.right-S.left)*grRand(i,8),y=250+(S.bottom-260)*grRand(i,9),r=26+30*grRand(i,1);grPart(c,`M${x-r} ${y}C${x-r} ${y-r*.9} ${x+r} ${y-r} ${x+r*1.1} ${y}Z`,'#5a4e84',{tones:[[grEll(x-r*.3,y-r*.5,r*.4,r*.18),grRgba('#ffffff',.18)]],lw:5});}
 // asphodels: pale stars on thin stems
 for(let i=0;i<16;i++){const x=S.left+(S.right-S.left)*grRand(i,12),y=236+(S.bottom-250)*grRand(i,13),s=.6+.5*grRand(i,14);grLine(c,`M${x} ${y}L${x+4} ${y-60*s}`,5,'#7fa06a');
  for(let j=0;j<3;j++){const fx=x+4+(j-1)*16*s,fy=y-60*s-12*s*(j%2);c.save();c.translate(fx,fy);c.scale(s,s);grPart(c,'M0 -16L5 -5L16 -4L7 3L10 14L0 8L-10 14L-7 3L-16 -4L-5 -5Z','#f4ecd8',{tones:[[grEll(0,0,4,4),'#e7c86a']],lw:3});c.restore();}}
 // the gate: an arch of stone blocks; its doors are drawn over it (they open)
 const G=MY_GATE,x0=G.x-G.w/2,x1=G.x+G.w/2,o0=G.x-G.ow/2,o1=G.x+G.ow/2;
 grPart(c,`M${x0} ${G.ground}L${x0} ${G.top+120}C${x0} ${G.top-30} ${x1} ${G.top-30} ${x1} ${G.top+120}L${x1} ${G.ground}L${o1} ${G.ground}L${o1} ${G.otop+90}C${o1} ${G.otop-30} ${o0} ${G.otop-30} ${o0} ${G.otop+90}L${o0} ${G.ground}Z`,'#9c92c4',{tones:[[`M${x1-40} ${G.top}L${x1+10} ${G.top}L${x1+10} ${G.ground}L${x1-40} ${G.ground}Z`,grRgba('#5a4f84',.45)],[`M${x0} ${G.top+40}L${x0+30} ${G.top+40}L${x0+30} ${G.ground}L${x0} ${G.ground}Z`,grRgba('#ffffff',.18)]],lw:8});
 for(let i=1;i<6;i++){const y=G.top+120+i*(G.ground-G.top-120)/6;grLine(c,`M${x0} ${y}L${o0} ${y}M${o1} ${y}L${x1} ${y}`,4,grRgba(GR_INK,.45));}
 for(let i=0;i<7;i++){const a=GR_PI+GR_PI*(i+.5)/7,r0=G.ow/2+10,r1=G.w/2;grLine(c,`M${G.x+Math.cos(a)*r0} ${G.otop+90+Math.sin(a)*r0*1.2}L${G.x+Math.cos(a)*r1} ${G.top+120+Math.sin(a)*r1*1.2}`,4,grRgba(GR_INK,.45));}
 grPart(c,grEll(G.x,G.top-14,34,30),'#c8913a',{tones:[[grEll(G.x-8,G.top-22,12,8),grRgba('#fff',.4)]],lw:6});
 // the braziers on each side of the gate (their flames move: myHadesFire)
 for(const bx of [x0-34,x1+34]){grLine(c,`M${bx-40} ${G.ground+10}L${bx} ${G.ground-90}L${bx+40} ${G.ground+10}M${bx} ${G.ground-90}L${bx} ${G.ground+10}`,10,'#7a5a3a');grPart(c,`M${bx-56} ${G.ground-110}C${bx-50} ${G.ground-70} ${bx+50} ${G.ground-70} ${bx+56} ${G.ground-110}Z`,'#b47a3a',{tones:[[`M${bx-60} ${G.ground-100}L${bx+60} ${G.ground-100}L${bx+60} ${G.ground-80}L${bx-60} ${G.ground-80}Z`,'#8a5428']],lw:6});}}
function myHadesFire(c,t,still){const G=MY_GATE;for(const bx of [G.x-G.w/2-34,G.x+G.w/2+34])myFlames(c,bx,G.ground-108,3,70,90,t+bx,still,1);}
// The doorway (open 0 to 1): the dark inside with a warm light, the two bronze leaves (the right one turns inwards).
function myGateDoors(c,open,inside){const G=MY_GATE,o0=G.x-G.ow/2,o1=G.x+G.ow/2,arch=`M${o0} ${G.ground}L${o0} ${G.otop+90}C${o0} ${G.otop-30} ${o1} ${G.otop-30} ${o1} ${G.otop+90}L${o1} ${G.ground}Z`;
 c.save();c.beginPath();grPath(c,arch);c.clip();if(open>0){c.fillStyle='#1a1430';c.fillRect(o0,G.otop-40,G.ow,G.ground-G.otop+40);grGlow(c,G.x,G.ground-80,160,'#ffcf8a',.5*open);if(inside)inside(c);}
 const leaf=(x,w,flip)=>{if(w<2)return;grPart(c,`M${x} ${G.otop-40}L${x+w*flip} ${G.otop-40}L${x+w*flip} ${G.ground}L${x} ${G.ground}Z`,'#b8813e',{tones:[[`M${x+w*flip*.8} ${G.otop-40}L${x+w*flip} ${G.otop-40}L${x+w*flip} ${G.ground}L${x+w*flip*.8} ${G.ground}Z`,grRgba('#5a3418',.35)]],lw:6});
  for(let j=0;j<4;j++)for(let i=0;i<2;i++){const sx=x+w*flip*(.3+.4*i),sy=G.otop+40+j*70;c.fillStyle='#e8c070';c.beginPath();c.arc(sx,sy,6,0,GR_TAU);c.fill();}
  c.beginPath();c.arc(x+w*flip*.82,G.ground-150,13,0,GR_TAU);c.strokeStyle='#7a4a1a';c.lineWidth=grLW(c,6);c.stroke();};
 leaf(o0,G.ow/2,1);leaf(o1,G.ow/2*(1-.85*open),-1);c.restore();grPart(c,arch,null,{lw:7});}
function myCerberusScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-hades',o.decor,myHades);
 const X=172,Y=432,K=1.12,G=MY_GATE,OX=-392,OY=446,OK=.78;
 // Orpheus: he walks in, plays, and tiptoes to the gate while the dog sleeps
 const walkIn=still?1:grSmooth(grSpan(u,1.4,2.5)),sneak=still?0:grSpan(u,6.7,8.1),door=still?0:grSmooth(grSpan(u,7.25,7.65))*(1-grSmooth(grSpan(u,8.2,8.6)));
 let ox=grLerp(Math.min(-720,S.left-160),OX,walkIn),oy=OY,ok=OK;const sn=grSmooth(sneak);if(sneak>0){ox=grLerp(OX,G.x,sn);oy=grLerp(OY,G.ground+6,sn);ok=grLerp(OK,.42,sn);}
 const playing=still?u<6.6:u>2.4&&u<6.6,strum=playing?grClamp((u-2.4)*2)*(1-grSpan(u,6.3,6.6)):0;
 const orpheus=c=>{if(!still&&u>8.25)return;const walking=(u>1.4&&u<2.5)||(sneak>0&&sneak<1);grAt(c,ox,oy,ok,1,0,()=>myPerson(c,{walk:walking?(sneak>0?.7:1):0,p:sneak>0?u*1.1:u*1.7,tip:sneak>0?1:0,lean:sneak>0?.08:0,wreath:true,t,
  look:sneak>0?[1,-.1]:[1,.1],lid:playing&&u>3.2?.7:0,brow:sneak>0?1:.3,mouth:sneak>0?'o':'smile',open:.4,
  arms:playing||(!walking&&sneak<=0)?{front:[[70,-330],[46+10*Math.sin(u*9)*strum,-282]],back:[[-20,-330],[14,-290]]}:{front:[[44,-340],[30+30*Math.sin(u*6),-262]],back:[[-34,-340],[-40-30*Math.sin(u*6),-262]]},
  hold:c=>myLyre(c,40,-296,90,strum*(.5+.5*Math.sin(u*7)))}));};
 // the heads: [x, y, size, tilt] sitting, and lying down asleep
 const lie=still?grSmooth(grSpan(u,5,6.8)):grSmooth(grSpan(u,5.9,6.7)),sit=[[-212,-420,.82,-.25],[0,-506,1,0],[212,-420,.82,.25]],down=[[-176,-170,.82,.5],[0,-226,1,.06],[176,-170,.82,-.5]];
 const heads=sit.map((b,i)=>{const d=down[i],turn=still?grSmooth(grSpan(u,1+i*.4,1.6+i*.4)):grSmooth(grSpan(u,2.7+i*.3,3.05+i*.3)),g=1-turn;
  const sway=still?0:grSmooth(grSpan(u,3.5,3.9))*(1-grSmooth(grSpan(u,5.4,5.9))),sw=Math.sin(u*3.1-i*.7)*sway;
  let x=grLerp(b[0],d[0],lie)+28*sw,y=grLerp(b[1],d[1],lie)-(still?0:Math.abs(Math.sin(u*2.2+i*1.3))*12*g),r=grLerp(b[3],d[3],lie)+[-.18,0,.18][i]*g+(still?0:.1*Math.sin(u*1.8+i*2.1)*g)-.1*turn*(1-lie)+.2*sw;
  const sleepy=grSmooth(grSpan(u,4.5+i*.3,5.6+i*.3)),asleep=grSpan(u,6.1,6.5),yawn=still?0:grBump(u,4.8+i*.42,5.45+i*.42),bark=i===1&&!still?grBump(u,.45,1.05)+grBump(u,1.1,1.5)*.7:0;
  const P={t,ear:.6*turn*(1-sleepy),brow:g>.5?[-.7,.2,1][i]:.5*(1-sleepy)-.3*sleepy,look:g>.5?[[-1,.1],[0,.2],[1,-.2]][i]:[-1,.2],lid:Math.max(sleepy*.75,asleep),wreath:i===1,
   mouth:yawn>.05?'yawn':bark>.05?'open':asleep>0?'o':g>.5?['grin','smile','o'][i]:'smile',open:yawn>.05?yawn:bark>.05?bark:.35,droop:asleep,bubble:asleep*(still?.5:.55+.45*Math.sin(u*[2.3,1.7,3.1][i]+i))};
  if(i===2&&!still){const peek=grBump(u,8.45,9.35);if(peek>0){P.lid=[1,1-Math.min(1,peek*1.6)];P.look=[-1,0];P.bubble=0;P.mouth=peek>.6?'grin':'o';P.brow=.8;}if(u>8.45&&u<8.6)P.bubble=asleep*(1-grSpan(u,8.45,8.55));}
  return {x,y,s:b[2],r,P,bark};});
 const wag=still?0:Math.sin(u*7)*.9*(1-lie)+Math.sin(u*1.4)*.15*lie;
 myIn(c,S,c=>{myGateDoors(c,door,!still&&sneak>.86?c=>orpheus(c):null);myHadesFire(c,t,still);if(still||sneak<=.86)orpheus(c);
  // the notes of the lyre fly to the dog
  if(strum>0||(u>2.4&&u<7.6))for(let j=0;j<16;j++){const born=2.6+j*.26,v=(u-born)/2.2;if(v<=0||v>=1||born>6.4)continue;const x=grLerp(OX+40*OK,X-80,v)+30*Math.sin(j*1.7+v*5),y=grLerp(OY-300*OK,Y-560*K,grOut(v))-90*Math.sin(v*GR_PI);
   myNote(c,x,y,58,'#fff0c0',Math.sin(GR_PI*v),.25*Math.sin(j+v*4));}
  grShadow(c,X,Y+8,300*K,36*K,.3);
  grAt(c,X,Y,K,1,0,()=>{myDogBody(c,{lie,wag,necks:heads.map(h=>[h.x,h.y+40*h.s])});for(const i of [0,2,1]){const h=heads[i];grAt(c,h.x,h.y,h.s,1,h.r,()=>myDogHead(c,h.P));}
   const b=heads[1].bark;if(b>.05)for(let q=-1;q<=1;q++){const a=GR_PI/2+q*.5;grLine(c,`M${heads[1].x+Math.cos(a)*120} ${heads[1].y+60+Math.sin(a)*110}L${heads[1].x+Math.cos(a)*(120+60*b)} ${heads[1].y+60+Math.sin(a)*(110+60*b)}`,9,grRgba(GR_INK,b));}});
  if(!still&&u>8.6)for(let i=0;i<3;i++)mySpark(c,X+heads[2].x*K+60+i*30,Y+heads[2].y*K-90-i*20,18,'#fff6c8',grBump(u,8.7+i*.1,9.4));});
 return myAnchor(S,X,Y-260*K,300*K);}
// ── The Hydra (the garlic and the snake) ───────────────────────────────────────────────────────────────────────────────────
// In the marsh of Lerna, among reeds and the columns of an old temple sunk in the water. The Hydra has one head, Glups's. It smells a
// water lily, sneezes, and two more heads pop out; one of them smells the lily too, sneezes, and two more come out. The five heads look
// at each other, and then they sing as a choir, one after another; the littlest one sings out of tune and late, the others look at it,
// it smiles, and they all end together.
function myLerna(c,S){c.fillStyle=grVGrad(c,S.top,120,['#bfe0d0','#dcefd6','#f3f4d8']);c.fillRect(S.left,S.top,S.right-S.left,120-S.top);
 grGlow(c,260,-260,300,'#fff6c8',.5);c.fillStyle='#fffbe0';c.beginPath();c.arc(260,-260,60,0,GR_TAU);c.fill();
 grPart(c,`M${S.left} 90C-400 10 -260 30 -120 60C40 0 200 20 360 50C460 30 ${S.right} 40 ${S.right} 60L${S.right} 130L${S.left} 130Z`,'#8fb8a6',{tones:[[`M${S.left} 70L${S.right} 70L${S.right} 140L${S.left} 140Z`,grRgba('#6f9e8c',.35)]],lw:5,ink:grRgba(GR_INK,.5)});
 // a small temple on the far hill
 c.save();c.translate(-300,40);grPart(c,'M-60 0L-60 -40L60 -40L60 0Z','#f4efe2',{lw:4,ink:grRgba(GR_INK,.5)});grPart(c,'M-70 -40L0 -66L70 -40Z','#e9dcc4',{lw:4,ink:grRgba(GR_INK,.5)});for(let i=0;i<5;i++)grLine(c,`M${-48+i*24} -36L${-48+i*24} -2`,4,grRgba('#b9b0a0',.9));c.restore();
 // the water of the marsh
 grPart(c,`M${S.left} 120L${S.right} 120L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#4e9c8c',{tones:[[`M${S.left} 120L${S.right} 120L${S.right} 200L${S.left} 200Z`,grRgba('#8cc8b4',.5)],[`M${S.left} 360L${S.right} 360L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#2f7468',.5)]],lw:6});
 for(let i=0;i<22;i++){const x=S.left+(S.right-S.left)*grRand(i,3),y=140+(S.bottom-150)*grRand(i,4),L=30+50*grRand(i,5);grLine(c,`M${x-L} ${y}Q${x} ${y-8} ${x+L} ${y}`,4,grRgba('#d8f0e4',.45));}
 // the columns of the old temple, sunk in the water
 for(const [x,y,h,k] of [[-420,150,190,1],[-350,140,120,.8],[400,148,230,1]]){c.save();c.translate(x,y);c.scale(k,k);grPart(c,`M-34 0L-34 ${-h}L34 ${-h}L34 0Z`,'#efe7d6',{tones:[['M10 -400L34 -400L34 0L10 0Z',grRgba('#b9ae9a',.5)]],lw:6});for(let j=-2;j<=2;j++)grLine(c,`M${j*12} ${-h+14}L${j*12} -6`,3,grRgba('#b0a690',.8));grPart(c,`M-48 ${-h}L48 ${-h}L42 ${-h-22}L-42 ${-h-22}Z`,'#e6dcc6',{lw:6});
  if(h<150)grPart(c,`M-40 ${-h-22}L-10 ${-h-50}L20 ${-h-30}L44 ${-h-40}L42 ${-h-22}Z`,'#e6dcc6',{lw:5});grLine(c,'M-50 0Q0 10 50 0',4,grRgba('#d8f0e4',.7));c.restore();}
 // reeds and bulrushes at both sides
 for(let i=0;i<26;i++){const side=i%2?1:-1,x=side*(380+grRand(i,7)*Math.max(120,(side>0?S.right:-S.left)-380)),y=170+grRand(i,8)*160,h=150+150*grRand(i,9),b=(grRand(i,10)-.5)*60;
  grLine(c,`M${x} ${y}Q${x+b*.3} ${y-h*.5} ${x+b} ${y-h}`,9,'#4f8a46');if(i%3===0)grPart(c,grEll(x+b,y-h+26,11,30,b*.004),'#7a5032',{lw:4});else grPart(c,grLeaf(x,y,-GR_PI/2+b*.006,h*.8,10),'#6aa85a',{lw:4});}
 for(const [x,y,s] of [[-80,200,40],[260,220,50],[-330,260,60],[360,330,70],[120,410,60],[-420,420,70]]){c.save();c.translate(x,y);c.scale(s/100,s/100);grPart(c,'M-150 0C-150 -40 150 -40 150 0C150 40 -150 40 -150 0ZM0 0L40 -20L60 0Z','#5aa060',{tones:[[grEll(0,14,140,18),grRgba('#2f6f40',.35)]],lw:6,rule:'evenodd'});c.restore();}
 // on a tall screen: soft clouds above, and big lily pads and reeds close to us below
 if(S.top<-470)for(let i=0;i<4;i++)myCloud(c,-360+i*250+60*grRand(i,21),grLerp(-430,S.top+120,grRand(i,22)),60+30*grRand(i,23),{col:'#fbfdf6',shade:'#d6e8dc',lw:3,ink:grRgba(GR_INK,.3)});
 if(S.bottom>520){const n=Math.ceil((S.bottom-480)/150);for(let i=0;i<n*2;i++){const x=S.left+60+(S.right-S.left-120)*((i%2)*.8+.1+(grRand(i,24)-.5)*.2),y=520+(S.bottom-560)*((Math.floor(i/2)+.5)/n)+30*grRand(i,25),s=110+40*grRand(i,26);
  c.save();c.translate(x,y);c.scale(s/100,s/100);grPart(c,'M-150 0C-150 -40 150 -40 150 0C150 40 -150 40 -150 0ZM0 0L40 -20L60 0Z','#5aa060',{tones:[[grEll(0,14,140,18),grRgba('#2f6f40',.35)]],lw:6,rule:'evenodd'});c.restore();if(i%4===1)myLily(c,x-20,y-6,s*.6,0);}
  for(const side of [-1,1])for(let j=0;j<7;j++){const x=(side<0?S.left:S.right)-side*(30+40*j+20*grRand(j,27)),y=S.bottom-20,h=260+200*grRand(j,28)+(S.bottom-500)*.3,b=side*(20+40*grRand(j,29));
   grLine(c,`M${x} ${y}Q${x+b*.3} ${y-h*.5} ${x+b} ${y-h}`,12,'#467f3e');if(j%2===0)grPart(c,grEll(x+b,y-h+34,14,38,b*.004),'#7a5032',{lw:5});else grPart(c,grLeaf(x,y,-GR_PI/2+b*.006,h*.8,13),'#5f9e50',{lw:5});}}}
const MY_HYDRA={heads:[[0,-150,1.08],[-280,-70,.84],[285,-80,.84],[-445,70,.68],[440,60,.6]],bases:[[0,214],[-112,226],[112,226],[-196,252],[196,252]],flower:[-200,318,74]};
function myHydraScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-lerna',o.decor,myLerna);const H=MY_HYDRA,F=H.flower;
 const grow=(a,b)=>still?grSmooth(grSpan(u,a-.6,b)):grBack(grSpan(u,a,b)),g=[1,grow(2.42,2.95),grow(2.5,3.05),grow(5.0,5.55),grow(5.08,5.65)];
 // the two sniffs and the two sneezes
 const sn=[still?0:grSmooth(grSpan(u,1,1.6))*(1-grSmooth(grSpan(u,2.2,2.45))),still?0:grSmooth(grSpan(u,3.75,4.25))*(1-grSmooth(grSpan(u,4.8,5.05)))],ah=[grSpan(u,1.55,2.25),grSpan(u,4.25,4.85)],choo=[still?0:grBump(u,2.25,2.7),still?0:grBump(u,4.85,5.3)],sneezeAt=[2.3,4.9];
 const beats=[[6.3,3],[6.62,1],[6.94,0],[7.26,2]],sing=i=>{let v=0;for(const [b,j] of beats)if(j===i)v=Math.max(v,grBump(u,b,b+.55));if(i===4)v=Math.max(v,grBump(u,7.75,8.35));return Math.max(v,grBump(u,8.75,9.45)*1.0,grSmooth(grSpan(u,8.7,8.9))*(1-grSmooth(grSpan(u,9.3,9.5)))*.9);};
 const heads=H.heads.map(([hx,hy,hs],i)=>{const [bx,by]=H.bases[i],k=g[i];let x=grLerp(bx,hx,k),y=grLerp(by,hy,k),s=hs*Math.min(1,.25+.75*grClamp(k)),r=0;
  const P={t,look:[0,.25],brow:.2,mouth:'smile',open:1,wreath:i===0,tuft:i>0,lid:0};
  if(!still)r+=.06*Math.sin(t*1.3+i*1.7);
  const who=i===0?0:i===1?1:-1;if(who>=0){const q=sn[who];if(q>0){x=grLerp(x,F[0]+(who?-10:40),q);y=grLerp(y,F[1]-170*hs,q);r+=-.35*q*(who?1:-1)*0+(who?.25:-.25)*q;P.look=[who?.3:-.4,1];P.lid=.6*q;P.mouth='smile';P.sniff=q;}
   const a=ah[who];if(a>0&&a<1){r+=-.25*a*(who?-1:1)*0;y-=30*a;P.lid=.3+.5*a;P.mouth='o';P.open=.3+.7*a;P.sniff=1;P.brow=1;}
   const ch=choo[who];if(ch>0){y+=40*ch;s*=1+.06*ch;P.mouth='open';P.open=1;P.lid=1;P.brow=-.5;}}
  // the new heads look at the old ones, surprised; the old one looks round at them
  const born=[0,2.95,3.05,5.6,5.7][i];if(i>0&&u>born&&u<born+.9){P.mouth='o';P.open=.6;P.brow=1;P.look=[x>0?-1:1,0];}
  if(i===0&&((u>2.95&&u<3.75)||(u>5.6&&u<6.25))){P.look=[Math.sin(u*3)>0?-1:1,0];P.brow=1;P.mouth='o';P.open=.5;}
  // the choir
  const v=sing(i);if(u>6.2&&v>.02){P.mouth='open';P.open=.3+.7*v;P.lid=.5;P.brow=.5;y-=14*v;}
  if(u>7.85&&u<8.6&&i!==4){P.look=[1,.1];P.brow=-.4;P.mouth=v>.02?P.mouth:'flat';}
  if(i===4&&u>8.2&&u<8.7){P.mouth='grin';P.brow=1;P.look=[-1,0];}
  return {x,y,s,r,P,k,v};});
 // as big as the screen lets it be, grown from the water line
 const K=Math.max(.86,Math.min(1.2,(Math.min(-S.left,S.right)-60)/500)),Y0=330;
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  // the body in the water, and the necks from it
  grPart(c,'M-250 300C-250 210 -120 168 0 168C120 168 250 210 250 300Z',MY_SNAKE.col,{tones:[[grEll(-60,220,70,26,-.2),grRgba('#ffffff',.25)],[grEll(90,250,14,10),grRgba(MY_SNAKE.spot,1)],[grEll(-140,262,12,9),grRgba(MY_SNAKE.spot,1)],[grEll(30,200,10,8),grRgba(MY_SNAKE.spot,1)]],lw:8});
  for(const i of [3,4,1,2,0]){const h=heads[i];if(h.k<=.01&&i)continue;const [bx,by]=H.bases[i],hx=h.x,hy=h.y+44*h.s;mySnakeNeck(c,myBez([bx,by],[bx,by-120],[hx,hy+150*h.s],[hx,hy],18),82*Math.max(.5,H.heads[i][2]),60*h.s);}
  c.fillStyle=grRgba('#3f8a7c',.55);c.fillRect(-300,292,600,30);for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,300,280+40*j+(still?0:6*Math.sin(t*2+j)),26+8*j,0,0,GR_TAU);c.strokeStyle=grRgba('#d8f0e4',.6-.15*j);c.lineWidth=grLW(c,5);c.stroke();}
  myLily(c,F[0],F[1],F[2],still?0:t);
  // pollen into the nose, and the sneezes
  for(let w=0;w<2;w++){const a=ah[w];if(a>0&&a<1)for(let j=0;j<7;j++){const v=(a*1.6+j/7)%1,hh=heads[w],px=grLerp(F[0],hh.x,v)+12*Math.sin(j*2+v*6),py=grLerp(F[1]-20,hh.y+10*hh.s,v);c.fillStyle=grRgba('#ffd24a',Math.sin(GR_PI*v));c.beginPath();c.arc(px,py,6,0,GR_TAU);c.fill();}
   const ch=grSpan(u,sneezeAt[w],sneezeAt[w]+.7);if(!still&&ch>0&&ch<1){const hh=heads[w],q=grOut(ch);myCloud(c,hh.x,hh.y+70*hh.s+90*q,40+60*q,{col:'#fbfff4',shade:'#d8ecd0',squash:.2});c.save();c.globalAlpha*=1-ch;for(let j=0;j<8;j++){const a=GR_PI*(.15+.7*j/7);c.fillStyle='#ffd24a';c.beginPath();c.arc(hh.x+Math.cos(a)*170*q,hh.y+60*hh.s+Math.sin(a)*120*q,7,0,GR_TAU);c.fill();}c.restore();}}
  for(const i of [3,4,1,2,0]){const h=heads[i];if(h.k<=.01&&i)continue;grAt(c,h.x,h.y,h.s,1,h.r,()=>mySnakeHead(c,h.P));}
  // the notes of the choir rise from the mouths; the little one's note is out of tune: it wobbles
  const cols=['#ffcf3a','#ff8ab4','#5fb8ff','#7fd65a','#b48cff'];
  for(const [b,j] of [...beats,[7.75,4],[8.75,0],[8.75,1],[8.75,2],[8.75,3],[8.75,4]]){const v=(u-b)/1.4;if(v<=0||v>=1)continue;const h=heads[j],off=j===4&&b<8.5,wob=off&&!still?Math.sin(u*14)*.35:0;
   myNote(c,h.x+(off?Math.sin(u*9)*24:20*Math.sin(v*4+j))+40*h.s,h.y+50*h.s-200*v-60*h.s,off?46:54,cols[j],Math.sin(GR_PI*v),wob+.15*Math.sin(j+v*3));}
  if(!still&&u>8.95)for(let i=0;i<5;i++)mySpark(c,-420+i*210,-300+40*Math.sin(i*2),22,'#fff6c8',grBump(u,8.95+i*.06,9.5));});
 return myAnchor(S,0,Y0+(-60-Y0)*K,380*K);}
// ── The Chimera (the garlic and the lion) ──────────────────────────────────────────────────────────────────────────────────
// In Lycia, on a dry hill by the sea, under a cliff with tombs carved in the rock; on the slope behind, the small flames that never go
// out. The Chimera is a lion lying down (Glups's face in the mane), a goat's head on its back and a snake for a tail. The snake holds a
// loaf on a stick and the lion toasts it with a gentle breath of fire, but the goat stretches its neck and eats it; the lion toasts the
// second one watching the goat, and the snake eats it itself. The third time the snake brings three loaves, the lion toasts them all, and
// the snake throws one to each mouth: the three heads chew, happy.
function myLycia(c,S){c.fillStyle=grVGrad(c,S.top,80,['#7fbde6','#b8dcef','#f6e2bc']);c.fillRect(S.left,S.top,S.right-S.left,80-S.top);
 grGlow(c,-300,-240,260,'#fff3c8',.55);c.fillStyle='#fff8dc';c.beginPath();c.arc(-300,-240,56,0,GR_TAU);c.fill();
 if(S.top<-470)for(let i=0;i<4;i++)myCloud(c,-380+i*260+50*grRand(i,31),grLerp(-430,S.top+110,grRand(i,32)),55+30*grRand(i,33),{col:'#fffaf0',shade:'#e6d8c4',lw:3,ink:grRgba(GR_INK,.3)});
 // the sea far away, with two islands
 grPart(c,`M${S.left} 20L${S.right} 20L${S.right} 90L${S.left} 90Z`,'#4f9fcc',{tones:[[`M${S.left} 20L${S.right} 20L${S.right} 34L${S.left} 34Z`,grRgba('#ffffff',.3)]],lw:4,ink:grRgba(GR_INK,.4)});
 for(const [x,w,h] of [[120,140,40],[300,80,24]])grPart(c,`M${x-w} 22C${x-w*.4} ${22-h} ${x+w*.3} ${22-h*1.1} ${x+w} 22Z`,'#8fa6c4',{lw:3,ink:grRgba(GR_INK,.35)});
 // the slope of the mountain at the left, with the rocks where the little fires come out
 grPart(c,`M${S.left} -120C-520 -150 -380 -60 -200 40C-100 90 0 100 60 110L60 140L${S.left} 140Z`,'#c9a27a',{tones:[[`M${S.left} -40C-460 -60 -340 20 -200 70L-200 140L${S.left} 140Z`,grRgba('#9c7656',.4)]],lw:5});
 for(const [x,y,r] of [[-470,-40,46],[-400,-6,36],[-330,30,40],[-560,-80,40]])grPart(c,grEll(x,y,r,r*.6),'#b48a68',{tones:[[grEll(x,y+r*.3,r,r*.3),grRgba('#7a5a40',.4)]],lw:5});
 // the cliff with the tombs carved in the rock, at the right
 const cx=Math.min(S.right-40,560);grPart(c,`M${cx-260} 140L${cx-250} -60C${cx-230} -150 ${cx-140} -210 ${cx-40} -230L${S.right+10} -250L${S.right+10} 140Z`,'#dcb488',{tones:[[`M${cx-260} 60L${S.right+10} 40L${S.right+10} 140L${cx-260} 140Z`,grRgba('#a8805c',.4)],[`M${cx-120} -200L${cx-100} 140L${cx-60} 140L${cx-80} -210Z`,grRgba('#f4d8b0',.5)]],lw:6});
 for(const [x,y,k] of [[cx-150,-30,1],[cx-30,-110,.8]]){c.save();c.translate(x,y);c.scale(k,k);grPart(c,'M-60 0L-60 -90L60 -90L60 0Z','#e8c89c',{lw:5});grPart(c,'M-72 -90L0 -130L72 -90Z','#e8c89c',{tones:[['M-40 -98L0 -118L40 -98Z',grRgba('#a8805c',.4)]],lw:5});
  for(const q of [-40,40])grPart(c,`M${q-8} -84L${q+8} -84L${q+8} -4L${q-8} -4Z`,'#f4dcb4',{lw:4});grPart(c,'M-20 -4L-20 -60L20 -60L20 -4Z','#5a3a2a',{lw:4});c.restore();}
 // the dry meadow, with stones, bushes of thyme and an olive tree
 grPart(c,`M${S.left} 110C-300 90 0 120 300 104C460 96 ${S.right} 120 ${S.right} 110L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#d9c98c',{tones:[[`M${S.left} 380L${S.right} 380L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#b8a468',.35)],[`M${S.left} 110L${S.right} 110L${S.right} 160L${S.left} 160Z`,grRgba('#efe2b0',.5)]],lw:6});
 for(let i=0;i<14;i++){const x=S.left+(S.right-S.left)*grRand(i,34),y=150+(Math.max(420,S.bottom-40)-150)*grRand(i,35),r=10+16*grRand(i,36);if(Math.abs(x)<520&&y>200&&y<360)continue;grPart(c,grEll(x,y,r*1.6,r),'#c8b8a0',{tones:[[grEll(x,y+r*.4,r*1.6,r*.5),grRgba('#8a7a64',.4)]],lw:4});}
 for(let i=0;i<12;i++){const x=S.left+(S.right-S.left)*grRand(i,37),y=140+(Math.max(420,S.bottom-40)-140)*grRand(i,38);if(Math.abs(x)<540&&y>180&&y<360)continue;const r=22+14*grRand(i,39);grPart(c,`M${x-r} ${y}C${x-r} ${y-r*1.2} ${x+r} ${y-r*1.2} ${x+r} ${y}Z`,'#8a9a5a',{lw:4});for(let j=0;j<5;j++){c.fillStyle='#b48ad0';c.beginPath();c.arc(x-r*.6+j*r*.3,y-r*.5-6*Math.sin(j*2),5,0,GR_TAU);c.fill();}}
 const ox=Math.max(S.left+90,-640);grPart(c,`M${ox-20} 200C${ox-14} 120 ${ox-30} 40 ${ox-10} -20L${ox+14} -20C${ox+10} 60 ${ox+20} 140 ${ox+24} 200Z`,'#8a6a4a',{lw:6});
 for(const [x,y,r] of [[ox-60,-40,60],[ox+40,-60,64],[ox-10,-110,58],[ox+90,-10,44],[ox-110,10,40]])grPart(c,grEll(x,y,r,r*.62),'#8fa868',{tones:[[grEll(x,y+r*.3,r,r*.3),grRgba('#5f7a42',.45)]],lw:5});
 if(S.bottom>520)for(let i=0;i<10;i++){const x=S.left+(S.right-S.left)*((i+.5)/10),y=S.bottom-30-60*grRand(i,40),h=60+60*grRand(i,41);for(let j=-2;j<=2;j++)grLine(c,`M${x+j*8} ${y}Q${x+j*14} ${y-h*.6} ${x+j*22} ${y-h}`,6,'#9a9a50');}}
const MY_CHIM={bx:-150,by:300,lion:[50,80],goat:[-240,-100],goatBase:[-190,130],tail:[-450,190],snake:[330,-200],basket:[460,300],stick:262};
function myChimeraScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-lycia',o.decor,myLycia);const C=MY_CHIM,E=still?grSmooth:grBack;
 // the snake: where its head is, how it holds the stick (a: the angle of the stick), and what is on the stick
 const dip=v=>grSmooth(grSpan(u,v,v+.3))*(1-grSmooth(grSpan(u,v+.3,v+.6))),d1=dip(3.5),d2=dip(6.35),dp=Math.max(d1,d2);
 let sx=grLerp(C.snake[0],C.basket[0]-10,dp),sy=grLerp(C.snake[1],C.snake[1]+150,dp);if(!still)sy+=8*Math.sin(t*1.6);
 const flip=still?0:grSmooth(grSpan(u,5.3,5.55))*(1-grSmooth(grSpan(u,5.9,6.2))),a=GR_PI/2-flip*1.5+(still?0:.05*Math.sin(t*1.3));
 const mouth=[sx,sy+22],end=[mouth[0]+Math.cos(a)*C.stick,mouth[1]+Math.sin(a)*C.stick];
 // the loaves: [distance along the stick, toast, gone], one at a time, then three
 const lv=[];const tst=(a0,a1)=>grSmooth(grSpan(u,a0,a1));
 if(u<2.35)lv.push({d:240,toast:tst(.8,1.8)});
 if(u>=3.8&&u<5.45)lv.push({d:240,toast:tst(4.4,5.25)});
 if(u>=6.65)for(const [i,d] of [[0,240],[1,165],[2,90]]){const at=[8.0,8.25,8.5][i];if(u<at)lv.push({d,toast:tst(7.05+i*.3,7.5+i*.3),i});}
 // where the flying loaves go: the second to the snake, then one to each mouth
 const fly=[];
 // the heads
 const blow=[[.6,1.9],[4.2,5.3],[7.0,8.0]],bk=blow.map(([a0,a1])=>grSmooth(grSpan(u,a0,a0+.25))*(1-grSmooth(grSpan(u,a1-.2,a1)))),blowing=Math.max(...bk);
 const L={x:C.lion[0],y:C.lion[1],P:{t,turn:.5,look:[.6,.1],brow:.2,mouth:'smile',wreath:true}};
 if(blowing>.05){L.P.mouth='o';L.P.open=.5+.3*blowing;L.P.puff=blowing;L.P.look=[1,.3];L.P.brow=.1;if(bk[1]>.05){L.P.look=[-1,-.1];L.P.brow=-.7;}}
 if(u>2.4&&u<2.9){L.P.mouth='o';L.P.open=.8;L.P.brow=1;L.P.look=[1,.4];}
 if(u>2.9&&u<3.6){L.P.look=[-1,-.3];L.P.brow=-.8;L.P.mouth='flat';L.P.turn=-.3;}
 if(u>5.65&&u<6.5){L.P.look=[.7,-1];L.P.brow=1;L.P.mouth=u<6.1?'o':'flat';L.P.open=.7;}
 const G={base:C.goatBase,x:C.goat[0],y:C.goat[1],P:{t,turn:.3,look:[.4,.2],mouth:'smile'}};
 const reach=still?grSmooth(grSpan(u,1.9,2.35))*(1-grSmooth(grSpan(u,2.45,2.95))):E(grSpan(u,1.9,2.32))*(1-grSmooth(grSpan(u,2.45,2.9)));
 if(reach>0){const tx=end[0]-12,ty=end[1]-48;G.x=grLerp(C.goat[0],tx,reach);G.y=grLerp(C.goat[1],ty,reach);G.P.look=[1,.5];G.P.mouth=u<2.33?'open':'chew';G.P.open=.8;}
 const chew=(a0,a1)=>u>a0&&u<a1?(still?.5:.5+.5*Math.sin((u-a0)*15)):0;
 if(u>2.33&&u<3.6){G.P.mouth='chew';G.P.chew=chew(2.33,3.6);if(u>2.9){G.P.look=[.2,-1];G.P.lid=.35;}}
 if(bk[1]>.05){G.P.mouth='o';G.P.open=.4;G.P.look=[-.4,-1];G.P.lid=.2;}
 if(u>5.65&&u<6.5){G.P.look=[1,-.8];G.P.brow=1;G.P.mouth='o';G.P.open=.7;}
 const N={P:{t,look:[0,.7],mouth:'flat',open:1}};
 if(dp>.1)N.P.look=[.3,1];
 if(u>5.4&&u<5.85){N.P.mouth='open';N.P.open=.9;N.P.look=[0,-1];}
 if(u>=5.85&&u<6.5){N.P.mouth=u<6.1?'chew':'grin';N.P.brow=u<6.1?0:.8;N.P.lid=u<6.1?.6:0;}
 // the end: one loaf flies into each mouth, and the three chew
 const tosses=[[7.95,'lion'],[8.2,'goat'],[8.45,'snake']];
 const mouthOf={lion:()=>[L.x+16+5,L.y+70],goat:()=>[G.x+5,G.y+50],snake:()=>[sx,sy+26]};
 if(u>7.85&&u<8.6)for(const [at,who] of tosses){if(u>at-.15&&u<at+.12){const H=who==='lion'?L:who==='goat'?G:N;H.P.mouth='open';H.P.open=1;H.P.look=[who==='lion'?1:who==='goat'?1:0,who==='snake'?1:.6];}}
 if(u>8.0){L.P.mouth='chew';L.P.lid=.9;L.P.look=[0,0];L.P.brow=.3;}if(u>8.25){G.P.mouth='chew';G.P.chew=chew(8.25,9.5);G.P.lid=.9;G.P.look=[0,0];}if(u>8.5){N.P.mouth='chew';N.P.lid=.9;}
 if(u>8.0){L.P.puff=.35*(still?1:.5+.5*Math.sin(u*15));L.P.lid=.55;L.P.brow=.7;}if(u>8.9){L.P.mouth='grin';L.P.puff=0;G.P.mouth='grin';N.P.mouth='grin';G.P.lid=.5;N.P.lid=.5;}
 // the second loaf, thrown up by the snake into its own mouth
 if(!still&&u>=5.45&&u<5.85){const v=grSpan(u,5.45,5.85),p0=[mouth[0]+Math.cos(GR_PI/2-1.5)*240,mouth[1]+Math.sin(GR_PI/2-1.5)*240];fly.push({x:grLerp(p0[0],mouth[0],v),y:grLerp(p0[1],mouth[1]+4,v)-90*Math.sin(GR_PI*v),toast:1,r:v*4});}
 if(still&&u>=5.45&&u<5.85){const v=grSmooth(grSpan(u,5.45,5.85));fly.push({x:grLerp(end[0],mouth[0],v),y:grLerp(end[1],mouth[1],v),toast:1,r:0,a:1-v});}
 tosses.forEach(([at,who],i)=>{if(u>=at-.32&&u<at){const v=grSpan(u,at-.32,at),st=[mouth[0]+Math.cos(a)*[240,165,90][i],mouth[1]+Math.sin(a)*[240,165,90][i]],m=mouthOf[who]();fly.push({x:grLerp(st[0],m[0],v),y:grLerp(st[1],m[1],v)-(still?0:120*Math.sin(GR_PI*v)),toast:1,r:still?0:v*3});}});
 const K=Math.max(.84,Math.min(1.12,(Math.min(-S.left,S.right)-50)/540)),Y0=320;
 // the little fires of the mountain, that never go out
 myIn(c,S,c=>{for(const [x,y,h] of [[-470,-70,40],[-400,-30,32],[-330,4,36]])myFlames(c,x,y,2,24,h,t+x*.01,still,1);});
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(40,-Y0);
  myBasket(c,C.basket[0],C.basket[1],90,3);
  // the tail: a snake from the rump, over the back, its head over the front
  const tl=C.tail;mySnakeNeck(c,myBez(tl,[tl[0]-230,tl[1]-120],[sx-520,sy-300],[sx,sy+18],24),66,44);
  // the neck of the goat from the back
  myFurNeck(c,myBez(G.base,[G.base[0],G.base[1]-190],[G.x-(G.x-G.base[0])*.2-40*(1-reach),G.y-120+60*reach],[G.x,G.y+50],14),82,60);
  grAt(c,C.bx,C.by,1,1,0,()=>myLionBody(c,{breath:still?.5:.5+.5*Math.sin(t*1.4),paw:0}));
  grAt(c,G.x,G.y,.8,1,still?0:.05*Math.sin(t*1.1+1),()=>myGoatHead(c,G.P));
  grAt(c,L.x,L.y,1,1,still?0:.03*Math.sin(t*.9),()=>myLionHead(c,L.P));
  // the breath of fire, from the lion's mouth to the loaf (the third time it goes up the stick, over the three loaves)
  const lm=[L.x+22,L.y+70];if(blowing>0){let tg=end;if(bk[2]>.05){const v=grSmooth(grSpan(u,7.1,7.85)),d=grLerp(240,90,v);tg=[mouth[0]+Math.cos(a)*d,mouth[1]+Math.sin(a)*d];}myBreath(c,lm[0],lm[1],tg[0]-30,tg[1],blowing,t,still);}
  grAt(c,sx,sy,.62,1,still?0:.05*Math.sin(t*1.5),()=>mySnakeHead(c,N.P));
  if(u<5.4||u>5.95||still||true){grLine(c,`M${mouth[0]} ${mouth[1]}L${end[0]} ${end[1]}`,9,'#8a5a30');}
  for(const l of lv){const x=mouth[0]+Math.cos(a)*l.d,y=mouth[1]+Math.sin(a)*l.d;myBread(c,x,y,82,l.toast,0);}
  for(const f of fly){c.save();if(f.a!==undefined)c.globalAlpha*=f.a;c.translate(f.x,f.y);c.rotate(f.r);myBread(c,0,0,82,f.toast,0);c.restore();}
  // a little smoke when a loaf is toasted, crumbs when it is eaten
  const rest=[C.snake[0],C.snake[1]+22+C.stick];for(const [at,x,y] of [[1.8,...rest],[5.2,...rest]]){const v=grSpan(u,at,at+1.1);if(v>0&&v<1)myCloud(c,x-10+20*v,y-60-90*v,16+18*v,{col:'#f4efe6',shade:'#d8d0c4',lw:2.5,ink:grRgba(GR_INK,.3*(1-v))});}
  for(const [at,who] of [[2.33,'goat'],[5.85,'snake'],...tosses]){const v=grSpan(u,at,at+.6);if(v<=0||v>=1||still)continue;const m=who==='goat'&&at<3?[end[0]-12,end[1]]:mouthOf[who]();for(let j=0;j<6;j++){c.fillStyle=grRgba('#c9873a',1-v);c.beginPath();c.arc(m[0]+(j-2.5)*14*(.4+v),m[1]+10+70*v*v+8*Math.sin(j*3),5,0,GR_TAU);c.fill();}}
  if(!still&&u>9.0)for(let i=0;i<5;i++)mySpark(c,-300+i*170,-260+40*Math.sin(i*2),22,'#fff6c8',grBump(u,9.0+i*.06,9.5));
  if(!still&&bk[1]>.05)myNote(c,G.x+40+20*Math.sin(t*3),G.y-60-40*grSpan(u,4.3,5.3),40,'#5fb8ff',bk[1],.2*Math.sin(t*2));});
 return myAnchor(S,(C.lion[0]-60)*K,Y0+(C.lion[1]-80-Y0)*K,360*K);}
export const MY_SCENES_B={cerberus:myCerberusScene,hydra:myHydraScene,chimera:myChimeraScene};

// La cassola d'en Glups (EN23), 0.27: the scenes of the creatures of the bread (half of Glups stays): the Minotaur, the centaur, Medusa
// and the siren. Same rules as cassola-mites.js: about nine and a half seconds each (u from 0 to MY_DUR), a decor painted once, smooth
// eases, no flash, and in «Moviment reduït» (o.still) the creature stays in its place. Each scene returns its anchor (screen units).
import {GR_PI,GR_TAU,GR_INK,GR_HAIR,GR_SKIN,grClamp,grSmooth,grOut,grIn,grBack,grLerp,grSpan,grBump,grMix,grShade,grRgba,grRand,grPath,grEll,grLW,grPart,grLine,grTube,grVGrad,grRGrad,grGlow,grShadow,grLeaf,grAt,grUnion,grLimb,grMane,grGlups,grHead} from './grec-art.js';
import {myStage,myIn,myBackdrop,myCloud,mySpark,myEye,myBrow,myWreath,myKeys,myAnchor,myNote,myMouth,myMoustache2,myBez,myRibbon,myBullHead,myHorseBody,myLyre,myPerson,myBirdBody,mySnakeHead,mySnakeNeck,MY_SNAKE} from './grec-bestiari.js';
// ── The Minotaur (the bread and the bull) ──────────────────────────────────────────────────────────────────────────────────
// In the labyrinth of Knossos: walls of stone with a frieze of spirals, a fresco of dolphins, red columns, dark corridors. Minotaur-Glups
// (Glups with the head of a bull) walks one way and bumps into a wall, walks the other way and bumps into another: he is lost in his
// own labyrinth. A ball of red thread rolls in to his feet; he takes the end and follows it, turning and turning, until the thread has
// wrapped him up like a parcel; he hops along it, and a bow ties itself between his horns.
function myLabyrinth(c,S){c.fillStyle=grVGrad(c,S.top,S.bottom,['#c89a6a','#e2bc8a','#d8b080']);c.fillRect(S.left,S.top,S.right-S.left,S.bottom-S.top);
 // the stones of the back wall
 for(let y=S.top+10,r=0;y<200;y+=70,r++)for(let x=S.left-(r%2)*60;x<S.right;x+=120)grPart(c,`M${x+4} ${y+4}L${x+116} ${y+4}L${x+116} ${y+66}L${x+4} ${y+66}Z`,grMix('#e8c494','#d4a878',grRand(x*.1+r,91)),{lw:3,ink:grRgba(GR_INK,.35)});
 // the frieze of spirals, and the fresco of dolphins
 grPart(c,`M${S.left} -300L${S.right} -300L${S.right} -230L${S.left} -230Z`,'#c8503a',{lw:5});for(let x=Math.ceil(S.left/80)*80;x<S.right;x+=80){c.beginPath();c.arc(x,-265,22,0,GR_TAU);c.strokeStyle='#fff2dc';c.lineWidth=grLW(c,6);c.stroke();c.beginPath();c.arc(x,-265,9,0,GR_TAU);c.fillStyle='#fff2dc';c.fill();}
 grPart(c,'M-140 -190L140 -190L140 -30L-140 -30Z','#f4ecd8',{tones:[['M-140 -60L140 -60L140 -30L-140 -30Z',grRgba('#8cc8e8',.6)]],lw:6});
 for(const [x,y,s,f] of [[-70,-110,.8,1],[60,-130,.7,-1]]){c.save();c.translate(x,y);c.scale(s*f,s);grPart(c,'M-70 10C-40 -30 30 -36 64 -6C40 -6 30 4 40 20C20 10 -10 14 -40 26C-50 30 -66 22 -70 10Z','#4a90c8',{tones:[['M-70 10C-30 20 20 14 50 6L50 30L-70 30Z',grRgba('#f4ecd8',.8)]],lw:5});grPart(c,'M-10 -24L6 -46L16 -20Z','#4a90c8',{lw:4});c.fillStyle=GR_INK;c.beginPath();c.arc(42,-8,4,0,GR_TAU);c.fill();c.restore();}
 // two dark corridors, and red columns, narrow at the foot, with black capitals
 for(const x of [-310,310]){grPart(c,`M${x-90} 200L${x-90} -80C${x-90} -150 ${x+90} -150 ${x+90} -80L${x+90} 200Z`,'#4a3428',{tones:[[`M${x-90} -80L${x+90} -80L${x+90} 0L${x-90} 0Z`,grRgba('#2a1a14',.5)]],lw:6});}
 for(const x of [-178,178]){grPart(c,`M${x-34} -200L${x+34} -200L${x+24} 200L${x-24} 200Z`,'#c0402e',{tones:[[`M${x+6} -200L${x+40} -200L${x+30} 200L${x+4} 200Z`,grRgba('#7a2418',.4)]],lw:6});grPart(c,`M${x-50} -230L${x+50} -230L${x+44} -200L${x-44} -200Z`,'#2c2233',{lw:5});grPart(c,grEll(x,-238,46,14),'#2c2233',{lw:5});}
 // the floor of flagstones
 grPart(c,`M${S.left} 200L${S.right} 200L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#c9a478',{tones:[[`M${S.left} 200L${S.right} 200L${S.right} 230L${S.left} 230Z`,grRgba('#8a6440',.45)]],lw:6});
 for(let y=250,r=0;y<S.bottom;y+=70+r*14,r++)grLine(c,`M${S.left} ${y}L${S.right} ${y}`,4,grRgba('#8a6440',.4));
 for(let x=Math.ceil(S.left/140)*140;x<S.right;x+=140)grLine(c,`M${x*.6} 200L${x} ${S.bottom}`,4,grRgba('#8a6440',.35));
}
const MY_THREAD='#d8443a';
// the walls that close the corridor at both ends, at ±X (in the units of the scene)
function myDeadEnds(c,S,X,K,Y0){for(const sd of [-1,1]){const x0=sd*X,x1=sd*(X+800);grPart(c,`M${x0} ${(S.top-Y0)/K+Y0-20}L${x1} ${(S.top-Y0)/K+Y0-20}L${x1} ${(S.bottom-Y0)/K+Y0+20}L${x0} ${(S.bottom-Y0)/K+Y0+20}Z`,'#c4986a',{tones:[[`M${x0} -2000L${x0+sd*34} -2000L${x0+sd*34} 2000L${x0} 2000Z`,grRgba('#f0cc9c',.7)],[`M${x0} 334L${x1} 334L${x1} 2000L${x0} 2000Z`,grRgba('#8a6440',.4)]],lw:7});
 for(let y=-600,r=0;y<334;y+=76,r++)grLine(c,`M${x0} ${y}L${x1} ${y}`,4,grRgba('#8a6440',.5));for(let y=-600,r=0;y<334;y+=76,r++)for(let k=0;k<5;k++){const xx=x0+sd*(60+k*120+(r%2)*60);grLine(c,`M${xx} ${y}L${xx} ${y+76}`,4,grRgba('#8a6440',.4));}}}
function myMinotaurScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-labyrinth',o.decor,myLabyrinth);
 const s=.5,K=Math.max(.9,Math.min(1.1,(Math.min(-S.left,S.right)-40)/520)),Y0=330,X=Math.min(640,Math.min(-S.left,S.right)/K-24),B=X-200;
 const keys=[[0,0,1],[.4,0,-1],[1.45,B,-1],[1.75,B-30,-1],[2.2,B-30,1],[3.35,-B,1],[3.65,30-B,1],[5.0,30-B,1]];
 let x=0,flip=-1;for(let i=0;i<keys.length-1;i++){const [a0,x0,f0]=keys[i],[a1,x1]=keys[i+1];if(u>=a0&&u<a1){x=grLerp(x0,x1,still?grSmooth(grSpan(u,a0,a1)):grSpan(u,a0,a1));flip=f0;}}if(u>=5)x=30-B,flip=1;
 const walking=(u>.4&&u<1.45)||(u>2.2&&u<3.35),hop=u>7.0&&u<8.0;
 const bonk=Math.max(grBump(u,1.45,1.85),grBump(u,3.35,3.75));
 const H={t,look:[0,0],brow:.2,mouth:'smile',turn:.3};
 let arms=null,squash=1,lean=0,lift=0,kick=[0,0];
 if(walking&&!still){const ph=u*7;kick=[Math.max(0,Math.sin(ph))*60,Math.max(0,-Math.sin(ph))*60];lift=6*Math.abs(Math.sin(ph));H.brow=-.5;H.mouth='flat';H.look=[1,0];}
 if(bonk>0){squash=1-.12*bonk;H.lid=.9;H.brow=-.8;H.mouth='o';lean=-.08*bonk;}
 if(u>1.85&&u<2.2){arms={far:[[-260,-640],[-130,-900]],near:[[336,-470],[268,-396]]};H.look=[-1,-.4];H.brow=1;H.mouth='o';H.open=.5;}
 if(u>3.75&&u<4.5){H.look=[0,.3];H.brow=.8;H.mouth='flat';squash=.97;}
 // the ball of thread rolls in from the right corridor to his feet
 const roll=grSmooth(grSpan(u,3.8,4.6)),bx=grLerp(310,90-B,roll),by=330-24;
 if(u>4.3&&u<5.0){H.look=[-1,.8];H.brow=1;H.mouth='o';H.open=.5;}
 if(u>4.6&&u<5.0){const b=grBump(u,4.6,5.0);lean=.25*b;arms={far:[[-300,-420],[-320,-200]],near:[[336,-470],[268,-396]]};}
 // he follows the thread round and round, and it wraps him up
 const wrap=grSmooth(grSpan(u,5.0,6.9)),spin=u>5.0&&u<6.9&&!still?(Math.floor((u-5.0)*3.2)%2?1:-1):1;
 if(u>5.0&&u<6.9){flip=spin;H.brow=1;H.mouth='o';H.open=.6;H.look=[Math.sin(u*4),0];arms={far:[[-300,-560],[-360,-480]],near:[[300,-560],[360,-480]]};}
 if(u>=6.9){arms={far:[[-180,-500],[-120,-420]],near:[[180,-500],[120,-420]]};H.mouth='flat';H.brow=-.2;}
 const hx=u>7.0?grLerp(30-B,40,grSmooth(grSpan(u,7.0,8.0))):x;if(u>5)x=hx;
 if(hop&&!still){lift=60*Math.abs(Math.sin((u-7.0)*GR_PI*3));H.brow=.4;}
 const bow=still?grSmooth(grSpan(u,8.0,8.6)):grBack(grSpan(u,8.0,8.45));
 if(u>8.0){flip=-1;H.look=[0,-1];H.brow=1;H.mouth='o';H.open=.4;}if(u>8.6){H.look=[.3,0];H.mouth='grin';H.brow=.6;H.lid=u>9.1&&u<9.35?1:0;}
  myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  myDeadEnds(c,S,X,K,Y0);
  // the thread from the corridor
  if(u>3.8){const ex=u<5.0?bx:hx;grLine(c,`M${310} ${by-60}Q${(310+ex)/2} ${by+40} ${ex} ${by+10}`,7,MY_THREAD);}
  grShadow(c,x,334,200*s/.44,26);
  const loops=Math.floor(wrap*8),loop=(i,half)=>{const yy=334-s*(110+i*66),ww=s*(330-12*Math.abs(i-3));c.beginPath();c.ellipse(x,yy,ww,26,(i%2?.1:-.1),half?0:GR_PI,half?GR_PI:GR_TAU);c.strokeStyle=GR_INK;c.lineWidth=grLW(c,12);c.stroke();c.strokeStyle=MY_THREAD;c.lineWidth=grLW(c,7);c.stroke();};
  for(let i=0;i<loops;i++)loop(i,false);
  grGlups(c,{x,y:334,s,flip,squash,lean,lift,kick,arms:arms||undefined,head:c=>grAt(c,-24,-850,1.3,1,0,()=>myBullHead(c,{...H,bow}))},t);
  // the turns of thread round him (the back halves are behind him)
  for(let i=0;i<loops;i++)loop(i,true);
  if(u>3.8&&u<5.0){c.save();c.translate(bx,by);c.rotate(still?0:-roll*7);grPart(c,grEll(0,0,30,30),MY_THREAD,{lw:6});for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,0,30,12+i*4,i*.8,0,GR_TAU);c.strokeStyle=grRgba('#8a2a24',.7);c.lineWidth=grLW(c,4);c.stroke();}c.restore();}
  if(bonk>0)for(let i=0;i<4;i++)mySpark(c,x-80+i*54,334-s*1150-10*i,20,'#fff6c8',bonk);
  if(!still&&u>8.5)for(let i=0;i<5;i++)mySpark(c,-280+i*140,-140+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.5+i*.08,9.3));});
 return myAnchor(S,x*K,Y0+(334-s*650-Y0)*K,360*K);}
// ── The centaur (the bread and the horse) ──────────────────────────────────────────────────────────────────────────────────
// On Mount Pelion, in a clearing of the forest by the cave of the centaurs. Centaur-Glups (Glups from the belt up, a horse from the belt
// down) plays his lyre and dances: he taps with his front hooves, steps to one side and to the other, tries a fancy step with his four
// legs, gets them all in a knot, and sits down on his bottom like a dog. He looks at his legs, laughs, and goes on playing sitting down.
function myPelion(c,S){c.fillStyle=grVGrad(c,S.top,140,['#8cc4ea','#c4e2ee','#e8f4e0']);c.fillRect(S.left,S.top,S.right-S.left,140-S.top);
 grGlow(c,320,-250,240,'#fffbe0',.6);c.fillStyle='#fffbe8';c.beginPath();c.arc(320,-250,52,0,GR_TAU);c.fill();
 if(S.top<-470)for(let i=0;i<4;i++)myCloud(c,-380+i*250+50*grRand(i,101),grLerp(-430,S.top+110,grRand(i,102)),55+30*grRand(i,103),{col:'#ffffff',shade:'#d8e4ec',lw:3,ink:grRgba(GR_INK,.3)});
 for(let i=0;i<3;i++)myCloud(c,-500+i*380,-300+40*i,50+10*i,{col:'#ffffff',shade:'#d8e4ec',lw:3,ink:grRgba(GR_INK,.3)});
 // far wooded mountains, in layers of mist
 for(const [y,col,amp] of [[-20,'#9cc0b0',90],[40,'#7eae94',70],[100,'#629a78',50]]){let d=`M${S.left} ${y+80}`;for(let x=S.left;x<=S.right+40;x+=40)d+=`L${x} ${y-amp*Math.abs(Math.sin(x*.004+amp))-20*Math.sin(x*.02)}`;d+=`L${S.right+40} 160L${S.left} 160Z`;grPart(c,d,col,{lw:4,ink:grRgba(GR_INK,.35)});}
 // the rock with the cave, at the left
 const rx=Math.max(S.left+160,-620);grPart(c,`M${rx-260} 220C${rx-260} 0 ${rx-180} -160 ${rx-40} -190C${rx+80} -200 ${rx+170} -120 ${rx+180} 220Z`,'#b8a890',{tones:[[`M${rx+40} -190C${rx+120} -170 ${rx+170} -100 ${rx+180} 220L${rx+60} 220Z`,grRgba('#8a7a64',.4)]],lw:6});
 grPart(c,`M${rx-110} 220C${rx-110} 80 ${rx-60} 30 ${rx} 30C${rx+60} 30 ${rx+100} 80 ${rx+100} 220Z`,'#3a2e2a',{lw:6});for(const [x,y,r] of [[rx-150,-60,40],[rx+80,-120,34],[rx-40,-170,30]])grPart(c,grEll(x,y,r,r*.7),'#6a9a5a',{lw:4});
 // the clearing
 grPart(c,`M${S.left} 150C-300 130 0 160 300 140C460 132 ${S.right} 150 ${S.right} 150L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#9cd070',{tones:[[`M${S.left} 400L${S.right} 400L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#6aa050',.35)],[`M${S.left} 150L${S.right} 140L${S.right} 190L${S.left} 196Z`,grRgba('#d0eca0',.5)]],lw:6});
 // an oak at the right, and flowers
 const ox=Math.min(S.right-140,600);grPart(c,`M${ox-30} 240C${ox-24} 120 ${ox-40} 0 ${ox-14} -80L${ox+20} -80C${ox+24} 0 ${ox+30} 120 ${ox+40} 240Z`,'#7a5a3a',{lw:6});
 for(const [x,y,r] of [[-90,-140,90],[10,-200,100],[100,-150,90],[-40,-80,80],[70,-70,80],[150,-90,60],[-140,-70,60]])grPart(c,grEll(ox+x,y,r,r*.8),'#4f9048',{tones:[[grEll(ox+x,y+r*.4,r,r*.4),grRgba('#2f6a34',.4)]],lw:5});
 for(let i=0;i<26;i++){const x=S.left+(S.right-S.left)*grRand(i,104),y=180+(Math.max(440,S.bottom-30)-180)*grRand(i,105);if(Math.abs(x)<480&&y<400)continue;const col=['#ffffff','#ffe07a','#c8a0f0'][i%3];for(let j=0;j<5;j++){const a=GR_TAU*j/5;c.fillStyle=col;c.beginPath();c.arc(x+Math.cos(a)*8,y+Math.sin(a)*8,6,0,GR_TAU);c.fill();}c.fillStyle='#ffb43a';c.beginPath();c.arc(x,y,4,0,GR_TAU);c.fill();}}
const MY_CHORSE={col:'#c8864a',shade:'#8a5430',hair:'#2c2233',hoof:'#6a4a3a'};
function myCentaurScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-pelion',o.decor,myPelion);
 const HS=.74,gs=.62,ground=356;let bx=-40,rot=0,bob=0;
 const stand=[[0,0],[0,0],[0,0],[0,0]],cross=[[-.4,.22],[.46,.1],[.36,-.2],[-.36,-.1]],sit=[[-.15,.05],[.2,0],[1.0,-2.3],[1.0,-2.3]];
 let legs=stand,tail=still?0:.3*Math.sin(t*2.4),strum=still?.3:.5+.5*Math.sin(t*9);
 const F={look:[.6,0],lid:0,brows:.3,mouth:'smile',cheeks:.4};
 const playing=u<4.5||u>8.0;
 if(u<.8){F.lid=.85;F.mouth='smile';}
 if(u>=.8&&u<3.0&&!still){const ph=Math.floor((u-.8)*4);const up=Math.sin((u-.8)*GR_PI*4);legs=[ph%2?[-.5,1.1*Math.max(0,up)]:[0,0],ph%2?[0,0]:[-.5,1.1*Math.max(0,up)],[0,0],[0,0]];bob=8*Math.abs(up);F.lid=.5;F.mouth='grin';}
 if(u>=3.0&&u<4.5){const v=still?0:Math.sin((u-3.0)*GR_PI*1.4);bx=-40+60*v;legs=still?stand:[[.25*v,0],[.15*v,0],[.2*v,0],[.12*v,0]];F.look=[1,-.2];F.brows=.6;F.mouth='grin';}
 if(u>=4.5&&u<6.0){const k=grSmooth(grSpan(u,4.5,5.0));legs=cross.map((l,i)=>[l[0]*k,l[1]*k]);rot=still?0:.07*Math.sin(u*9)*grSpan(u,4.8,6.0);F.look=[0,1];F.brows=1;F.mouth='o';strum=0;}
 const fall=grSmooth(grSpan(u,6.0,6.4)),fb=still?0:grBump(u,6.35,6.6);
 if(u>=6.0){legs=fall<1?cross.map((l,i)=>[grLerp(l[0],sit[i][0],fall),grLerp(l[1],sit[i][1],fall)]):sit;rot=-.32*fall;bob=-10*fb;F.look=[0,1];F.brows=1;F.mouth='o';strum=0;}
 if(u>6.7&&u<8.0){F.look=[.2,1];F.brows=u<7.4?1:.4;F.mouth=u<7.4?'o':'grin';F.lid=u>7.4?.6:0;}
 if(u>=8.0){F.lid=.8;F.mouth='grin';F.brows=.4;strum=still?.3:.5+.5*Math.sin(t*9);}
 const arms=playing?{far:[[-300,-560],[-330,-700]],near:[[100,-520],[-200,-640+40*strum]]}:{far:[[-320,-620],[-360,-820]],near:[[300,-620],[340,-800]]};
 const K=Math.max(.88,Math.min(1.12,(Math.min(-S.left,S.right)-40)/440)),Y0=330;
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  grShadow(c,bx,ground+4,230,28);
  // the centaur faces right: his parts are drawn facing left, so they are turned round; when he sits, he turns about his back hooves
  grAt(c,bx+100*HS,ground,1,1,0,()=>{c.rotate(rot);grAt(c,-100*HS,-350*HS-bob,HS,-1,0,()=>{
   myHorseBody(c,{...MY_CHORSE,legs,noNeck:true,tail});
   grGlups(c,{x:-160,y:-150+474*gs,s:gs,upper:true,arms,look:F.look,lid:F.lid,brows:F.brows,mouth:F.mouth,cheeks:F.cheeks,hold:c=>myLyre(c,arms.far[1][0],arms.far[1][1]+40,190,strum)},t);});});
  // the notes of the lyre, and the dust when he sits down
  if(!still)for(let i=0;i<6;i++){const st=i*.7,v=((u-st)%1.4)/1.4;if(!playing||u<st)continue;myNote(c,bx+180+60*Math.sin(i*2+v*4),ground-430-220*v,40,['#ffcf3a','#ff8ab4','#5fb8ff'][i%3],Math.sin(GR_PI*v),.2*Math.sin(i+v*3));}
  if(!still){const v=grSpan(u,6.3,7.2);if(v>0&&v<1)for(let i=0;i<4;i++)myCloud(c,bx-80+i*70+40*v*(i-1.5),ground-10-30*v,18+20*v,{col:'#efe6d0',shade:'#d0c4a8',lw:2.5,ink:grRgba(GR_INK,.3*(1-v))});}
  if(!still&&u>8.9)for(let i=0;i<5;i++)mySpark(c,bx-260+i*130,ground-520+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.9+i*.07,9.5));});
 return myAnchor(S,bx*K,Y0+(ground-300-Y0)*K,330*K);}
// ── The siren (the bread and the bird) ─────────────────────────────────────────────────────────────────────────────────────
// At sea, by a small rocky island. Siren-Glups (a bird with Glups's head) sits on his rock and sings to a ship that goes by: Odysseus is
// tied to the mast and dances to the song; his sailors row, with wax in their ears, and hear nothing. The siren opens his wings for a
// great high note, so out of tune that Odysseus pulls a face and a gull loses its way; the ship rows away as fast as it can. The siren
// shrugs, and a gull lands by him and claps with its wings.
function mySeaSky(c,S){c.fillStyle=grVGrad(c,S.top,60,['#5fb2e6','#a8daf4','#e6f5fb']);c.fillRect(S.left,S.top,S.right-S.left,60-S.top);
 grGlow(c,360,-240,260,'#ffffff',.6);c.fillStyle='#fffdf0';c.beginPath();c.arc(360,-240,54,0,GR_TAU);c.fill();
 for(let i=0;i<3;i++)myCloud(c,-440+i*400,-300+50*(i%2),60+10*i,{col:'#ffffff',shade:'#d4e4f0',lw:3,ink:grRgba(GR_INK,.3)});
 if(S.top<-470)for(let i=0;i<3;i++)myCloud(c,-300+i*300,grLerp(-450,S.top+110,grRand(i,111)),55,{col:'#ffffff',shade:'#d4e4f0',lw:3,ink:grRgba(GR_INK,.3)});
 for(const [x,w,h] of [[120,160,40],[520,120,30],[-120,90,22]])grPart(c,`M${x-w} 62C${x-w*.4} ${62-h} ${x+w*.3} ${62-h*1.1} ${x+w} 62Z`,'#8fb4c8',{lw:3,ink:grRgba(GR_INK,.35)});
 grPart(c,`M${S.left} 60L${S.right} 60L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,'#2f86c0',{tones:[[`M${S.left} 60L${S.right} 60L${S.right} 120L${S.left} 120Z`,grRgba('#7cc0e8',.5)],[`M${S.left} 380L${S.right} 380L${S.right} ${S.bottom+10}L${S.left} ${S.bottom+10}Z`,grRgba('#1f6aa0',.4)]],lw:5});
 for(let i=0;i<28;i++){const x=S.left+(S.right-S.left)*grRand(i,112),y=90+(S.bottom-100)*grRand(i,113),L=24+30*grRand(i,114);grLine(c,`M${x-L} ${y}Q${x} ${y-8} ${x+L} ${y}`,4,grRgba('#d8f0ff',.5));}
}
function myGull(c,x,y,s,flap=0,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);const f=flap;grPart(c,`M-60 ${-10-30*f}Q-30 ${-20-10*f} 0 0Q30 ${-20-10*f} 60 ${-10-30*f}Q30 ${4-6*f} 0 10Q-30 ${4-6*f} -60 ${-10-30*f}Z`,'#e8eef4',{tones:[[`M-60 -60L-40 -60L-40 20L-60 20Z`,grRgba('#5a6470',.8)],[`M40 -60L60 -60L60 20L40 20Z`,grRgba('#5a6470',.8)]],lw:4});grPart(c,grEll(0,4,18,12),'#ffffff',{lw:4});grPart(c,'M14 2L28 6L14 10Z','#f0b030',{lw:3});c.restore();}
// a gull standing (on the rock)
function myGullStand(c,x,y,s,clap=0){c.save();c.translate(x,y);c.scale(s,s);for(const d of [-8,8])grLine(c,`M${d} -6L${d} 0`,4,'#f0a030');grPart(c,grEll(0,-40,30,34),'#ffffff',{lw:5});grPart(c,grEll(6,-82,18,17),'#ffffff',{lw:5});grPart(c,'M20 -84L40 -80L20 -74Z','#f0b030',{lw:3});c.fillStyle=GR_INK;c.beginPath();c.arc(10,-86,3,0,GR_TAU);c.fill();
 for(const sd of [-1,1]){c.save();c.translate(sd*20,-50);c.rotate(sd*(.4+clap*.9));grPart(c,`M0 0C${sd*20} 10 ${sd*24} 40 ${sd*10} 50C${sd*2} 30 0 10 0 0Z`,'#9aa4b0',{lw:4});c.restore();}c.restore();}
const MY_SIREN={col:'#7ab8d8',dark:'#4a88b0',chest:'#e8f4ff',wing:['#9ad0ec','#c8e8f8','#4a88b0'],tail:['#7ab8d8','#a8d8f0','#4a88b0']};
// The siren's rock (drawn with the scene, so that the siren sits on it in every decor), rx its middle.
function mySirenRock(c,rx){grPart(c,`M${rx-200} 330C${rx-210} 230 ${rx-150} 140 ${rx-60} 120C${rx+20} 104 ${rx+110} 150 ${rx+140} 230C${rx+160} 280 ${rx+170} 320 ${rx+170} 330Z`,'#a89a8c',{tones:[[`M${rx+20} 110C${rx+110} 150 ${rx+160} 260 ${rx+170} 330L${rx+40} 330Z`,grRgba('#7a6c60',.4)],[grEll(rx-80,150,40,14,-.3),grRgba('#ffffff',.3)]],lw:6});
 for(const [x,y] of [[rx-120,250],[rx+60,280],[rx-20,200]])grLine(c,`M${x-20} ${y}q20 -10 40 0`,4,grRgba('#5a4c40',.5));
 grLine(c,`M${rx-220} 330Q${rx} 300 ${rx+190} 330`,6,grRgba('#ffffff',.8));}
function mySirenScene(c,S,u,o){const still=!!o.still,t=o.t||0;myBackdrop(c,S,'my-sea',o.decor,mySeaSky);
 const rx=Math.max(S.left+170,-380)/1,sx=rx-30,sy=126;
 // the ship: slowly from the left past the rock, then away as fast as the oars can
 const away=still?grSmooth(grSpan(u,7.4,9.4)):grIn(grSpan(u,7.4,9.0)),shipX=grLerp(150,330,grSmooth(grSpan(u,0,7.4)))+900*away,bobS=still?0:6*Math.sin(t*1.6),rowP=(u<7.4?u*1.6:7.4*1.6+(u-7.4)*5);
 // the siren
 const sing=u>1.0&&u<6.2?(still?.6:.45+.45*Math.abs(Math.sin(u*5))):0,high=grSmooth(grSpan(u,6.2,6.35))*(1-grSmooth(grSpan(u,6.85,7.0))),wings=grSmooth(grSpan(u,5.0,5.4))*(1-grSmooth(grSpan(u,6.9,7.3)));
 const shrug=grBump(u,7.6,8.3);
 const F={look:u<1?[1,-.2]:[.8,0],lid:0,brows:.3,mouth:'smile',cheeks:.4,tilt:0};
 if(sing>0){F.mouth='open';F.lid=.5;F.brows=.6;F.tilt=still?0:.06*Math.sin(u*2.5);}
 if(high>0){F.mouth='open';F.lid=1;F.brows=1;F.tilt=-.12*high;}
 if(shrug>0){F.mouth='flat';F.brows=1;F.look=[1,0];}
 const clap=u>8.2?(still?.5:Math.abs(Math.sin((u-8.2)*9))):0;if(u>8.2){F.look=[-1,0];F.mouth='grin';F.brows=.6;F.lid=0;}
 // Odysseus at the mast, the sailors at the oars
 const dance=u>1.8&&u<6.2?(still?0:Math.sin(u*GR_PI*2)):0,OP={t,beard:true,hair:'#3a2a20',cloth:'#e8d8b8',border:'#b04a30',look:[1,0],brow:.5,mouth:'smile',lean:.12*dance,tilt:.15*dance,arms:{front:[[30,-360],[-10,-300]],back:[[-30,-360],[0,-300]]}};
 if(u>1.8&&u<6.2){OP.lid=.6;OP.mouth='grin';OP.brow=.8;}
 if(high>0||(u>6.35&&u<7.0)){OP.lid=1;OP.mouth='flat';OP.brow=-1;OP.lean=0;OP.tilt=.1;}
 if(u>7.0&&u<7.6){OP.look=[-1,0];OP.mouth='open';OP.open=1;OP.brow=1;OP.lid=0;OP.tilt=-.15;}
 const K=Math.max(.9,Math.min(1.1,(Math.min(-S.left,S.right)-40)/460)),Y0=300;
 myIn(c,S,c=>{mySirenRock(c,rx);
  // the siren on the rock (not scaled: the rock is in the decor)
  grAt(c,sx,sy,.95,1,0,()=>{myBirdBody(c,{...MY_SIREN,t,open:.15+.85*Math.max(wings,shrug*.5),flap:.3*high+.4*shrug,sit:.5});grAt(c,56,-250,.42,-1,0,()=>{c.translate(20,812);grHead(c,F,t);});});
  if(u>7.6){const ld=grSmooth(grSpan(u,7.6,8.15));if(ld<1)myGull(c,sx+150+120*(1-ld),sy+20-320*(1-ld),.8,still?.3:Math.abs(Math.sin(u*8)));else myGullStand(c,sx+150,sy+70,1,clap);}
  // the notes of the song fly to the ship; the high note wobbles
  if(!still)for(let i=0;i<7;i++){const st=1.0+i*.65,v=(u-st)/1.6;if(v<=0||v>=1||st>5.9)continue;myNote(c,grLerp(sx+120,shipX*K-60,v),sy-280-80*Math.sin(GR_PI*v)+20*Math.sin(i),46,['#ffcf3a','#ff8ab4','#b48cff'][i%3],Math.sin(GR_PI*v),.2*Math.sin(i+v*4));}
  if(high>0)myNote(c,sx+150+40*grSpan(u,6.2,7.0),sy-330,70+10*Math.sin(u*14),'#ff8ab4',high,still?0:.35*Math.sin(u*16));
  // a gull overhead loses its way at the high note
  if(u<7.8){const gv=grSpan(u,0,7.8),gx=grLerp(S.right+60,-100,gv),gy=-320+30*Math.sin(u*2),tumble=grSmooth(grSpan(u,6.3,6.9));myGull(c,gx-200*tumble,gy+140*tumble,.9,still?.3:Math.abs(Math.sin(u*6)),still?0:tumble*GR_PI*.8);}
  c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  // the ship
  grAt(c,shipX,250+bobS,1,1,0,()=>{c.save();c.beginPath();c.rect(-400,-900,800,830);c.clip();
   grLine(c,'M0 20L0 -600',18,'#8a5a30');grLine(c,'M-150 -540L150 -540',12,'#8a5a30');grPart(c,'M-150 -540C-100 -510 100 -510 150 -540L150 -520C100 -490 -100 -490 -150 -520Z','#f4ead4',{lw:5});
   // Odysseus tied to the mast, facing the siren
   grAt(c,10,-20,.6,-1,0,()=>myPerson(c,OP));for(const y of [-150,-200])grLine(c,`M-36 ${y}L44 ${y-6}`,8,'#c8a060');
   // the rowers behind the side of the ship, with wax in their ears
   for(const [x,k] of [[-170,.5],[160,.5]])grAt(c,x,-20,k,-1,0,()=>{myPerson(c,{t,hair:'#4a3020',cloth:'#e8e0c8',border:'#3a7ab0',look:[1,0],lid:.4,mouth:'smile',arms:{front:[[60,-330],[110,-300+20*Math.sin(rowP*GR_TAU)]],back:[[-20,-330],[60,-300+20*Math.sin(rowP*GR_TAU)]]}});grPart(c,grEll(-40,-514,12,10),'#ffe066',{lw:4});});c.restore();
   grPart(c,'M-320 -110C-250 -86 250 -86 310 -110L350 -190L372 -130C350 20 -330 40 -350 -110Z','#9a5a30',{tones:[['M-340 -10C-200 30 200 30 350 -10L350 60L-340 60Z',grRgba('#5a3018',.4)],['M-320 -110C-250 -80 250 -80 310 -110L306 -94C250 -66 -250 -66 -318 -94Z','#3a6ea8'],['M-330 -60C-200 -40 200 -40 340 -60L340 -48C200 -28 -200 -28 -330 -48Z',grRgba('#f4ead4',.6)]],lw:7});
   for(let i=0;i<6;i++){const ox=-230+i*90,a=.5+.25*Math.sin(rowP*GR_TAU+i*.4);grLine(c,`M${ox} -40L${ox-Math.sin(a)*150} ${-40+Math.cos(a)*150}`,8,'#c8a060');}
   grPart(c,grEll(310,-110,16,11),'#ffffff',{lw:4});c.fillStyle=GR_INK;c.beginPath();c.arc(312,-110,6,0,GR_TAU);c.fill();});
  if(!still&&u>8.9)for(let i=0;i<5;i++)mySpark(c,-300+i*150,-150+40*Math.sin(i*2),20,'#fff2b8',grBump(u,8.9+i*.07,9.5));});
 return myAnchor(S,sx,sy-260,240);}
// ── Medusa (the bread and the snake) ───────────────────────────────────────────────────────────────────────────────────────
// In Medusa's cave by the sea, among the stone statues of the ones who looked at her. Medusa-Glups (Glups with little snakes for hair)
// combs his snakes. A fly buzzes round his nose, looks him in the eye and drops as a little stone fly. Perseus tiptoes in with his eyes
// shut tight and holds up his bronze shield as a mirror: Glups admires himself... and turns to stone. Perseus peeks, is pleased and
// tiptoes away. A pigeon lands on the statue and pecks a stone snake; the stone shakes, cracks and falls off, the pigeon flies away in
// a fright, and Glups and his snakes grin.
// A rock with rounded corners round (x, y): rx and ry its size, seed its shape, n its corners.
function myRock(x,y,rx,ry,seed,n=7){const v=[];for(let i=0;i<n;i++){const a=(i+grRand(seed,i)*.6)/n*GR_TAU,r=.8+.28*grRand(seed+5,i);v.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}
 return c=>{const m=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2],s=m(v[n-1],v[0]);c.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const q=m(v[i],v[(i+1)%n]);c.quadraticCurveTo(v[i][0],v[i][1],q[0],q[1]);}c.closePath();};}
// The rock drawn: lit from the side lx (−1 left, 1 right) and from above, a crack.
function myRockAt(c,x,y,rx,ry,seed,col,lx=0,lw=5){grPart(c,myRock(x,y,rx,ry,seed),col,{tones:[[myRock(x+lx*rx*.22,y-ry*.28,rx*.72,ry*.58,seed+1),grRgba('#ffffff',.13)],[myRock(x-lx*rx*.25,y+ry*.42,rx*.85,ry*.5,seed+2),grRgba('#0c161c',.24)]],lw});
 if(rx>40)grLine(c,`M${x-rx*.25} ${y-ry*.45}l${rx*.14} ${ry*.3}l${-rx*.08} ${ry*.28}`,Math.max(2.5,lw*.6),grRgba(GR_INK,.45));}
const MY_CAVE={x:70,top:-310,l:-310,r:450,floor:170};
const MY_STONE={col:'#c4bfb3',dark:'#8e897e',light:'#e2ded4',plinth:'#aaa498'};
// A statue of someone who looked at Medusa, on its plinth, the foot of the plinth at (x, y): kind 'soldier' (crouching behind his
// shield, peeking) or 'cat' (its back up); s its size.
function myStatue(c,kind,x,y,s){const Z=MY_STONE,sd=grRgba(Z.dark,.55);c.save();c.translate(x,y);c.scale(s,s);
 grPart(c,'M-104 0L104 0L98 -50L-98 -50Z',Z.plinth,{tones:[['M40 -50L98 -50L104 0L48 0Z',sd]],lw:6});grPart(c,'M-118 -50L118 -50L118 -68L-118 -68Z',Z.col,{tones:[['M-118 -60L118 -60L118 -68L-118 -68Z',sd]],lw:6});
 if(kind==='soldier'){grTube(c,'M-34 -160L-58 -110L-30 -70',40,Z.col,6);grTube(c,'M8 -160L34 -112L12 -70',40,Z.col,6);
  grPart(c,grEll(-12,-196,58,62),Z.col,{tones:[[grEll(20,-180,40,60),sd]],lw:6});
  grPart(c,grEll(-6,-300,42,44),Z.col,{lw:6});grPart(c,'M-52 -298C-56 -360 40 -366 40 -300L28 -300C24 -330 -30 -330 -36 -298Z',Z.col,{tones:[['M10 -350C30 -340 40 -320 40 -300L24 -300Z',sd]],lw:6});
  grPart(c,'M-64 -330C-50 -392 30 -400 50 -350C30 -366 -30 -366 -64 -330Z',Z.light,{lw:5});
  myEye(c,4,-300,12,[.85,-.3],0,Z.col,Z.light);myEye(c,30,-300,11,[.85,-.3],0,Z.col,Z.light);myBrow(c,4,-322,24,1,.1);myBrow(c,30,-322,22,1,-.1);
  grPart(c,grEll(34,-200,72,86),Z.col,{tones:[[grEll(34,-200,54,66),grRgba(Z.light,.55)],[grEll(62,-180,42,66),sd]],lw:7});grPart(c,grEll(34,-200,18,20),Z.light,{lw:5});}
 else{grLine(c,'M50 -100C110 -120 110 -200 70 -230',18,GR_INK);grLine(c,'M50 -100C110 -120 110 -200 70 -230',8,Z.col);
  grPart(c,'M-66 -68C-80 -140 -30 -200 24 -186C70 -172 76 -110 62 -68Z',Z.col,{tones:[['M24 -186C70 -172 76 -110 62 -68L30 -68Z',sd]],lw:6});
  grLine(c,'M-40 -170L-30 -184L-20 -172L-8 -188L4 -174L16 -190L28 -176',5,grRgba(GR_INK,.7));
  for(const d of [-1,1])grPart(c,`M${-50+d*18} -186L${-50+d*30} -222L${-50+d*36} -180Z`,Z.col,{lw:5});
  grPart(c,grEll(-50,-170,38,32),Z.col,{tones:[[grEll(-34,-160,22,20),sd]],lw:6});
  myEye(c,-64,-174,11,[0,0],0,Z.col,Z.light);myEye(c,-38,-174,11,[0,0],0,Z.col,Z.light);grPart(c,'M-56 -156L-46 -156L-51 -150Z',Z.dark,{lw:2});
  for(const d of [-1,1])grLine(c,`M${-51+d*8} -152L${-51+d*34} ${-156+d*0}M${-51+d*8} -150L${-51+d*32} -142`,3,grRgba(GR_INK,.7));
  grTube(c,'M-40 -70L-40 -100',22,Z.col,5);grTube(c,'M30 -70L30 -100',22,Z.col,5);}
 c.restore();}
// A little stone crab on the floor at (x, y), its claws up in fright.
function myStoneCrab(c,x,y,s){const Z=MY_STONE;c.save();c.translate(x,y);c.scale(s,s);
 for(const d of [-1,1]){for(let i=0;i<3;i++)grLine(c,`M${d*20} ${-8+i*6}L${d*42} ${-2+i*8}L${d*48} ${10+i*4}`,6,GR_INK);grTube(c,`M${d*24} -20L${d*40} -46`,8,Z.col,4);grPart(c,`M${d*40} -46C${d*24} -60 ${d*34} -84 ${d*48} -76L${d*44} -64L${d*56} -62C${d*60} -50 ${d*52} -42 ${d*40} -46Z`,Z.col,{lw:4});}
 grPart(c,grEll(0,-14,34,20),Z.col,{tones:[[grEll(10,-6,26,12),grRgba(Z.dark,.5)]],lw:5});for(const d of [-1,1]){grLine(c,`M${d*8} -30L${d*10} -44`,4);myEye(c,d*10,-48,7,[0,-.5],0,Z.col,Z.light);}
 c.restore();}
// A bat asleep, hanging from the roof at (x, y).
function myBat(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);grLine(c,'M-6 0L-6 14M6 0L6 14',4);
 grPart(c,'M-30 14C-40 40 -30 80 0 90C30 80 40 40 30 14C20 22 -20 22 -30 14Z','#4a3a5a',{tones:[['M10 14L30 14C40 40 30 80 0 90Z',grRgba('#2a2036',.5)]],lw:5});
 grPart(c,grEll(0,76,20,18),'#5a4a6c',{lw:4});for(const d of [-1,1])grPart(c,`M${d*8} 90L${d*16} 106L${d*18} 88Z`,'#5a4a6c',{lw:3});
 for(const d of [-1,1])grLine(c,`M${d*12} 72Q${d*7} 66 ${d*2} 72`,3);grLine(c,'M-4 82Q0 86 4 82',2.5);c.restore();}
function myGrotto(c,S){const O=MY_CAVE,mid=O.floor-30;
 // through the mouth of the cave: the sky, the sun, the sea, an island with a little temple, a ship
 c.fillStyle=grVGrad(c,O.top,mid,['#6ec0ec','#a8dcf4','#f2f0da']);c.fillRect(S.left,S.top,S.right-S.left,mid-S.top+2);
 grGlow(c,300,-150,150,'#fff6c8',.7);grPart(c,grEll(300,-150,44,44),'#fff4c0',{lw:4,ink:grRgba('#e0b050',.8)});
 myCloud(c,-120,-210,36,{col:'#ffffff',shade:'#d6e8f2',lw:3,ink:grRgba(GR_INK,.35)});myCloud(c,160,-60,24,{col:'#ffffff',shade:'#d6e8f2',lw:2.5,ink:grRgba(GR_INK,.35)});
 c.fillStyle=grVGrad(c,mid,O.floor+30,['#3fa0d4','#2a7cb4']);c.fillRect(S.left,mid,S.right-S.left,O.floor+30-mid);
 for(let i=0;i<9;i++){const x=O.l+40+i*80+30*grRand(i,301),y=mid+16+(i%3)*22;grLine(c,`M${x} ${y}q14 -8 28 0`,4,grRgba('#ffffff',.55));}
 grPart(c,`M-230 ${mid+2}C-200 ${mid-46} -110 ${mid-58} -40 ${mid+2}Z`,'#6a9a5a',{tones:[[`M-120 ${mid-60}L-20 ${mid-60}L-20 ${mid+4}L-110 ${mid+4}Z`,grRgba('#3a6a3a',.4)]],lw:4});
 grPart(c,`M-142 ${mid-44}L-96 ${mid-44}L-100 ${mid-54}L-120 ${mid-62}L-138 ${mid-54}Z`,'#f4ecd8',{lw:3});for(const x of [-136,-126,-116,-106])grLine(c,`M${x} ${mid-44}L${x} ${mid-30}`,3,'#f4ecd8');grLine(c,`M-142 ${mid-30}L-98 ${mid-30}`,3);
 grPart(c,`M190 ${mid+4}L262 ${mid+4}L252 ${mid+18}L198 ${mid+18}Z`,'#8a5a30',{lw:3});grLine(c,`M226 ${mid+4}L226 ${mid-44}`,3);grPart(c,`M228 ${mid-42}C250 ${mid-30} 250 ${mid-12} 228 ${mid-2}Z`,'#fff8ec',{lw:3});
 // the cave: a wall of rock with its mouth, lit round the edge by the day
 const N=26,arch=[];for(let i=0;i<=N;i++){const a=GR_PI+i/N*GR_PI,j=.9+.14*grRand(i,311);arch.push([O.x+Math.cos(a)*(O.r-O.l)/2*j,O.floor+Math.sin(a)*(O.floor-O.top)*j]);}
 const hole=c=>{c.moveTo(arch[0][0],O.floor+60);for(const [x,y] of arch)c.lineTo(x,y);c.lineTo(arch[N][0],O.floor+60);c.closePath();};
 const wall=c=>{c.rect(S.left-20,S.top-20,S.right-S.left+40,O.floor+60-S.top+20);hole(c);};
 grPart(c,wall,grVGrad(c,S.top,O.floor,['#26383f','#344a52','#41595f']),{rule:'evenodd',tones:[[grEll(O.x,O.floor,(O.r-O.l)/2*1.32,(O.floor-O.top)*1.22),grRgba('#9ab8b4',.16)],[grEll(O.x,O.floor,(O.r-O.l)/2*1.12,(O.floor-O.top)*1.08),grRgba('#c8dcd0',.14)]],lw:7});
 // slabs of rock on the walls
 for(let i=0;i<40;i++){const x=S.left+(S.right-S.left)*grRand(i,321),y=S.top+(O.floor-S.top)*grRand(i,322),dx=(x-O.x)/((O.r-O.l)/2),dy=(y-O.floor)/(O.floor-O.top);
  if(dx*dx+dy*dy<1.5)continue;const r=60+60*grRand(i,323);myRockAt(c,x,y,r,r*.62,i*7+330,grMix('#2c4048','#405860',grRand(i,324)),-Math.sign(dx),5);}
 // the rocks round the mouth
 for(let i=0;i<=16;i++){const a=GR_PI*(1+i/16),x=O.x+Math.cos(a)*(O.r-O.l)/2*1.04,y=O.floor+Math.sin(a)*(O.floor-O.top)*1.04,r=46+26*grRand(i,331);
  myRockAt(c,x,y,r,r*.74,i*5+340,grMix('#3c565e','#56747a',grRand(i,332)),-Math.cos(a),5);}
 // the roof: stalactites, a drop of water at the tip of some
 for(let x=S.left+20,i=0;x<S.right;x+=58+36*grRand(i,341),i++){let L=30+120*grRand(i,342);const w=12+12*grRand(i,343),dx=(x-O.x)/((O.r-O.l)/2);
  if(Math.abs(dx)<1.15){const ya=O.floor-(O.floor-O.top)*Math.sqrt(Math.max(0,1-dx*dx/1.3))*1.04-60;L=Math.min(L,ya-S.top);}if(L<24)continue;
  grPart(c,`M${x-w} ${S.top-4}L${x+w} ${S.top-4}C${x+w*.6} ${S.top+L*.5} ${x+w*.2} ${S.top+L*.8} ${x} ${S.top+L}C${x-w*.2} ${S.top+L*.8} ${x-w*.6} ${S.top+L*.5} ${x-w} ${S.top-4}Z`,grMix('#3e565e','#52686e',grRand(i,344)),{tones:[[`M${x-w*.5} ${S.top}L${x-w*.1} ${S.top}L${x-w*.06} ${S.top+L*.7}Z`,grRgba('#ffffff',.14)]],lw:5});
  if(grRand(i,345)>.6)grPart(c,grEll(x,S.top+L+10,4,6),'#bfe6f2',{lw:2});}
 if(S.top<-470)for(const [x,y,s] of [[S.left*.55,S.top+50,.8],[S.right*.42,S.top+40,.7],[S.right*.55,S.top+44,.6]])myBat(c,x,y,s);
 // the floor, the light of the day on it, pebbles, cracks
 grPart(c,`M${S.left-10} ${O.floor}C-300 ${O.floor-8} 300 ${O.floor+8} ${S.right+10} ${O.floor}L${S.right+10} ${S.bottom+10}L${S.left-10} ${S.bottom+10}Z`,grVGrad(c,O.floor,Math.max(S.bottom,460),['#8a8a7a','#9c9886','#787668']),{tones:[[grEll(O.x,O.floor+110,470,100),grRgba('#fff2cc',.2)],[grEll(O.x,O.floor+40,380,40),grRgba('#fff2cc',.18)]],lw:6});
 for(let i=0;i<34;i++){const x=S.left+(S.right-S.left)*grRand(i,351),y=O.floor+24+(Math.max(S.bottom,450)-O.floor-30)*grRand(i,352),r=5+9*grRand(i,353);grPart(c,grEll(x,y,r*1.4,r*.8),grMix('#6a6a5e','#b4b0a0',grRand(i,354)),{lw:3});}
 for(let i=0;i<6;i++){const x=S.left+(S.right-S.left)*grRand(i,361),y=O.floor+50+260*grRand(i,362);grLine(c,`M${x} ${y}l40 6l30 -10l50 8`,3,grRgba(GR_INK,.3));}
 // the statues: a soldier hiding behind his shield, a cat with its back up, a little crab
 const wide=Math.min(-S.left,S.right);myStatue(c,'soldier',wide>620?Math.max(S.left+150,-640):S.left+110,300,wide>620?1:.8);myStatue(c,'cat',wide>620?Math.min(S.right-130,660):S.right-90,292,wide>620?.95:.75);
 myStoneCrab(c,Math.min(O.x+250,S.right-230),O.floor+34,.8);
 if(S.bottom>640){const x=S.right*.32,y=O.floor+(S.bottom-O.floor)*.5;for(let i=0;i<12;i++){const a=i/12*GR_TAU;myRockAt(c,x+Math.cos(a)*176,y+Math.sin(a)*52,30,20,i+400,'#7a786c',0,4);}
  grPart(c,grEll(x,y,170,46),grVGrad(c,y-46,y+46,['#7cc4dc','#3a90b8']),{tones:[[grEll(x-50,y-14,60,8,-.05),grRgba('#ffffff',.45)]],lw:5});
  for(const [dx,h] of [[-110,70],[-96,50],[120,60]])grLine(c,`M${x+dx} ${y+10}C${x+dx-14} ${y-h*.4} ${x+dx+14} ${y-h*.7} ${x+dx} ${y-h}`,8,'#4a8a4a');
  grPart(c,`M${x+30} ${y-6}l7 -18l7 18l18 1l-14 11l6 18l-17 -10l-17 10l6 -18l-14 -11Z`,'#f08a5a',{lw:3});}
 if(S.bottom>520){for(const [x,r,sd] of [[S.left+60,110,371],[S.right-80,130,372]])myRockAt(c,x,S.bottom-20,r,r*.6,sd,'#5a6660',x<0?1:-1,6);
  grPart(c,`M${S.left*.4} ${S.bottom-130}l10 -26l10 26l26 2l-20 16l8 26l-24 -14l-24 14l8 -26l-20 -16Z`,'#e89070',{lw:4});
  for(const [x,y] of [[S.right*.3,S.bottom-90],[S.left*.15,S.bottom-60]]){grPart(c,`M${x-20} ${y}C${x-20} ${y-30} ${x+20} ${y-30} ${x+20} ${y}Z`,'#f4dcc8',{lw:4});for(const d of [-10,0,10])grLine(c,`M${x} ${y}L${x+d} ${y-22}`,2.5,grRgba(GR_INK,.6));}}}
// Glups's little snakes for hair (in his units, drawn over his head): eight snakes in three greens. t the clock (they sway), still, F the
// face of all of them (look, lid, brow, mouth, open).
const MY_HAIR=[[1.27,140,0],[1.38,175,1],[1.49,155,2],[1.6,185,0],[1.71,160,1],[1.82,180,2],[1.92,150,0],[2.0,130,1]];
const MY_HAIRCOL=[{col:'#62b98c',dark:'#2f7d63',belly:'#e4eea6',spot:'#3f9474'},{col:'#9ac64e',dark:'#5e8a28',belly:'#f0f2b4',spot:'#6e9a34'},{col:'#4aaaa4',dark:'#287270',belly:'#d8f0d8',spot:'#338a86'}];
function mySnakeHair(c,t,still,F={}){const H={x:-14,y:-826};
 MY_HAIR.forEach(([a0,L,k],i)=>{const a=a0*GR_PI,sw=still?0:.15*Math.sin(t*2.1+i*1.7),C=MY_HAIRCOL[k],side=i%2?1:-1,a1=a+sw,
  b=[H.x+Math.cos(a)*140,H.y+Math.sin(a)*140],e=[H.x+Math.cos(a1)*(140+L),H.y+Math.sin(a1)*(140+L)],px=-Math.sin(a),py=Math.cos(a),q=L*.3*side;
  mySnakeNeck(c,myBez(b,[b[0]+Math.cos(a)*L*.42+px*q,b[1]+Math.sin(a)*L*.42+py*q],[e[0]-Math.cos(a1)*L*.42-px*q,e[1]-Math.sin(a1)*L*.42-py*q],e,12),54,36,C);
  grAt(c,e[0],e[1],.5,1,(a1-GR_PI*1.5)*.5,()=>mySnakeHead(c,{...C,look:F.look||[0,0],lid:F.lid||0,brow:F.brow||0,mouth:F.mouth||'smile',open:F.open??1,tongue:still||F.mouth==='o'?0:Math.max(0,Math.sin(t*2.6+i*2.3))*.7}));});}
// Two canvases of the size of the screen, for turning things to stone.
let myStoneA=null,myStoneB=null;
function myScreenCanvas(c,old){const W=c.canvas.width,H=c.canvas.height;if(old&&old.width===W&&old.height===H)return old;
 return typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(W,H):Object.assign(document.createElement('canvas'),{width:W,height:H});}
// Draws draw(x) turned to grey stone from the feet up: k from 0 (none) to 1 (all), in the box [x0, yTop, x1, yBot] (the feet at yBot),
// in the units of c now; over(x) is drawn on the stone only (the cracks). Only the box of the screen is copied and painted. key: while
// it stays the same (the statue does not change), the stone of the last time is used again; dx moves it (the shake).
let myStoneKey='';
function myStoned(c,k,box,draw,over,key='',dx=0){if(k<=0||typeof c.canvas?.width!=='number'||typeof c.getTransform!=='function'){draw(c);return;}myStoneA=myScreenCanvas(c,myStoneA);myStoneB=myScreenCanvas(c,myStoneB);
 const A=myStoneA.getContext('2d'),B=myStoneB.getContext('2d'),T=c.getTransform(),[x0,yTop,x1,yBot]=box,y=grLerp(yBot,yTop,grClamp(k)),W=myStoneA.width,H=myStoneA.height;
 const px=[x0,x1].map(x=>T.a*x+T.e),py=[yTop,yBot].map(v=>T.d*v+T.f),L=Math.max(0,Math.floor(Math.min(...px))-2),R=Math.min(W,Math.ceil(Math.max(...px))+2),U=Math.max(0,Math.floor(Math.min(...py))-2),D=Math.min(H,Math.ceil(Math.max(...py))+2);
 if(R<=L||D<=U){draw(c);return;}const w=R-L,h=D-U,full=key&&[key,W,H,T.a,T.d,T.e,T.f].join('|'),blit=()=>{c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(myStoneA,L,U,w,h,L+dx*T.a,U,w,h);c.restore();};
 if(full&&full===myStoneKey){blit();return;}myStoneKey=full||'';
 for(const x of [A,B]){x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.clearRect(L,U,w,h);}
 A.save();A.beginPath();A.rect(L,U,w,h);A.clip();A.setTransform(T);draw(A);A.restore();B.drawImage(myStoneA,L,U,w,h,L,U,w,h);
 A.save();A.setTransform(T);A.beginPath();A.rect(x0,y,x1-x0,yBot-y+2000);A.clip();A.globalCompositeOperation='saturation';A.fillStyle='#808080';A.fillRect(x0,y,x1-x0,yBot-y+2000);
 A.globalCompositeOperation='source-over';A.fillStyle='rgba(214,206,190,.42)';A.fillRect(x0,y,x1-x0,yBot-y+2000);if(over)over(A);A.restore();
 A.setTransform(1,0,0,1,0,0);A.globalCompositeOperation='destination-in';A.drawImage(myStoneB,L,U,w,h,L,U,w,h);A.globalCompositeOperation='source-over';
 blit();}
// Perseus, his feet at (x, y), s his size, facing left (dir −1) or right (1), with his winged helmet. P: walk, p, tip, arms, look, lid,
// brow, mouth, flap (the little wings).
function myPerseus(c,x,y,s,dir,P){grAt(c,x,y,s,dir,0,()=>{myPerson(c,{...P,skin:'#e8b48a',hair:'#3a2418',cloth:'#f4ead2',border:'#c84a3a'});
 c.save();c.translate(0,-520);const fl=P.flap||0;
 for(let i=0;i<3;i++){const a=-2.45+i*.34-fl*.25,L=80-i*14,cx=-56+Math.cos(a)*L*.5,cy=-74+Math.sin(a)*L*.5;grPart(c,grEll(cx,cy,L*.55,14,a),'#ffffff',{tones:[[grEll(cx,cy+6,L*.5,6,a),grRgba('#c4d4e6',.8)]],lw:5});}
 grPart(c,'M-74 -36C-80 -104 -40 -132 6 -132C52 -132 82 -102 76 -36C40 -52 -40 -52 -74 -36Z','#d9a441',{tones:[['M16 -132C54 -128 82 -100 76 -36L38 -46Z',grRgba('#9a6a24',.45)],[grEll(-24,-102,22,10,-.5),grRgba('#fff4c8',.7)]],lw:7});
 grTube(c,'M-76 -40Q0 -62 80 -40',8,'#b8862e',6);c.restore();});}
// The bronze shield at (x, y), r its radius, seen a little from the side; mirror(c) is drawn in its face (in the face's units).
function myShield(c,x,y,r,mirror,stone){c.save();c.translate(x,y);grPart(c,grEll(0,0,r*.86,r),'#c88a3a',{tones:[[grEll(r*.2,r*.1,r*.66,r*.9),grRgba('#8a5a24',.4)]],lw:8});
 const face=grEll(0,0,r*.7,r*.84);grPart(c,face,grRGrad(c,-r*.2,-r*.3,r*1.1,['#f8e6b0','#e2b868','#b88a40']),{lw:5});
 if(mirror){c.save();c.beginPath();grPath(c,face);c.clip();mirror(c);if(stone){c.globalCompositeOperation='saturation';c.fillStyle='#808080';c.fillRect(-r,-r,2*r,2*r);c.globalCompositeOperation='source-over';}
  c.fillStyle=grRgba('#f0c070',.22);c.fillRect(-r,-r,2*r,2*r);c.restore();}
 c.save();c.beginPath();grPath(c,face);c.clip();c.fillStyle=grRgba('#ffffff',.35);c.beginPath();c.moveTo(-r,-r*.2);c.lineTo(-r*.2,-r);c.lineTo(0,-r);c.lineTo(-r,0);c.closePath();c.fill();c.restore();
 for(let i=0;i<10;i++){const a=i/10*GR_TAU;grPart(c,grEll(Math.cos(a)*r*.78,Math.sin(a)*r*.92,r*.04,r*.04),'#f4d48a',{lw:2.5});}c.restore();}
// A fly at (x, y), s its size; fl the beat of the wings; stone: turned to stone.
function myFly(c,x,y,s,fl,stone){c.save();c.translate(x,y);c.scale(s,s);const k=stone?'#a8a49a':'#3a3450',w=stone?'#d4d0c6':grRgba('#e8f4ff',.8);
 for(const d of [-1,1])grPart(c,grEll(d*11,-14,15,6+5*fl,d*(.6+.3*fl)),w,{lw:3,ink:grRgba(GR_INK,.7)});
 grPart(c,grEll(0,0,15,12),k,{tones:[[grEll(-4,-5,6,4),grRgba('#ffffff',.35)],[grEll(5,5,10,6),grRgba(stone?'#8a867e':'#3a8a6a',.5)]],lw:3});
 for(const d of [-1,1])grPart(c,grEll(d*8,-7,7,7),stone?'#c8c4ba':'#d84a4a',{lw:2.5});c.restore();}
// A pigeon, its feet at (x, y), s its size, facing right (dir 1) or left; P: fly (the wings open), flap, peck (0 to 1, the head down),
// look, lid, rot.
function myPigeon(c,x,y,s,dir,P={}){c.save();c.translate(x,y);c.scale(s*dir,s);c.rotate(P.rot||0);const fl=P.flap??0,fly=!!P.fly;
 if(!fly)for(const d of [-8,12])grLine(c,`M${d} -10L${d+2} 4M${d-7} 4L${d+10} 4`,5,'#e07a5a');
 if(fly)grPart(c,`M-4 -40C-24 ${-86-40*fl} -64 ${-96-30*fl} -78 ${-74-50*fl}C-56 -58 -32 -44 -4 -34Z`,'#868ca2',{lw:5});
 grPart(c,'M-30 -30L-80 -18L-76 -2L-28 -14Z','#7c8296',{tones:[['M-80 -18L-62 -22L-58 -4L-76 -2Z',grRgba('#2c2233',.6)]],lw:5});
 grPart(c,'M-38 -26C-42 -52 -10 -64 20 -58C42 -52 48 -26 36 -12C22 0 -20 2 -38 -26Z','#aab0c4',{tones:[['M16 -58C36 -54 48 -30 36 -12L12 -30Z',grRgba('#7ac8a8',.55)],['M-38 -26C-20 -6 10 -2 32 -10L32 10L-42 10Z',grRgba('#7c8296',.45)]],lw:6});
 c.save();c.translate(22,-52);c.rotate((P.peck||0)*1.2);grPart(c,grEll(8,-16,19,18),'#9ca2b6',{tones:[[grEll(2,0,17,8),grRgba('#7ac8a8',.75)]],lw:5});
 grPart(c,'M25 -20L42 -13L25 -9Z','#e8a060',{lw:4});myEye(c,12,-22,6.5,P.look||[.6,0],P.lid||0,'#9ca2b6','#ffb04a');c.restore();
 if(fly)grPart(c,`M0 -36C10 ${-86-40*fl} 40 ${-100-36*fl} 58 ${-84-50*fl}C42 -60 22 -40 4 -28Z`,'#bcc2d4',{tones:[[`M40 ${-96-40*fl}L76 ${-96-40*fl}L62 -50Z`,grRgba('#2c2233',.5)]],lw:5});
 else grPart(c,'M-26 -36C-6 -48 22 -42 26 -26C10 -18 -14 -18 -32 -24Z','#bcc2d4',{tones:[['M-32 -30L-10 -30L-14 -18L-36 -22Z',grRgba('#2c2233',.5)]],lw:5});
 c.restore();}
const MY_MED={gx:-190,gy:338,gs:.58,px:280,ps:.74};
function myMedusaScene(c,S,u,o){const still=!!o.still,t=o.t||0,M=MY_MED;myBackdrop(c,S,'my-grotto',o.decor,myGrotto);
 const K=Math.max(.88,Math.min(1.06,(Math.min(-S.left,S.right)-40)/460)),Y0=330,{gx,gy,gs,ps}=M,R=(Math.min(-S.left,S.right)+60)/K+120;
 // where things are: his head, his eyes, the top of his hair (stage units)
 const hx=gx+20*gs,hy=gy-812*gs,ex=gx+60*gs,ey=gy-855*gs,top=[gx+10*gs,gy-985*gs];
 // the stone: rises from 5.1 to 5.55, shakes from 7.0, falls off (from the head down) from 7.7 to 7.95
 const stone=u<7.7?grSmooth(grSpan(u,5.1,5.55)):1-grSmooth(grSpan(u,7.7,7.95)),frozen=u>=5.55&&u<7.7,crack=grSpan(u,7.0,7.65),shake=still?0:grBump(u,7.0,7.7)*Math.sin(u*44)*5;
 // his face, his arms, the face of the snakes
 const F={look:[-.3,0],lid:0,brows:.3,mouth:'smile',cheeks:.4},SF={look:[-.3,0],mouth:'smile'};let arms,hold=null;
 const fly=u>1.1&&u<2.7,fp=u-1.1;let fx=hx+150+80*Math.sin(fp*4.6),fy=hy-10+46*Math.sin(fp*7.2);if(still){fx=hx+150;fy=hy-20;}
 if(u>2.3){const v=grSmooth(grSpan(u,2.3,2.6));fx=grLerp(fx,ex+64,v);fy=grLerp(fy,ey-4,v);}
 const fall=grSpan(u,2.7,3.0),stoneFly=[ex+64,u<3?grLerp(ey-4,gy-4,grIn(fall)):gy-4];
 if(u<1.15){const v=still?.5:Math.sin(u*7);arms={far:[[-300,-620],[-196+26*v,-930+16*Math.cos(u*7)]],near:[[336,-470],[268,-396]]};F.lid=.65;F.mouth='grin';F.brows=.5;F.look=[-.2,-.4];SF.lid=.55;SF.mouth='grin';
  hold=c=>{const [x,y]=arms.far[1];c.save();c.translate(x,y);c.rotate(-.35);grPart(c,'M-80 -16L80 -16L80 6L-80 6Z','#e6b440',{tones:[['M-80 -4L80 -4L80 6L-80 6Z',grRgba('#b8862e',.6)]],lw:6});for(let i=0;i<9;i++)grTube(c,`M${-68+i*17} 6L${-68+i*17} 34`,4,'#e6b440',3);c.restore();};}
 else if(u<2.7){const dx=(fx-hx)/120,dy=(fy-hy)/90;F.look=[-Math.max(-1,Math.min(1,dx)),Math.max(-1,Math.min(1,dy))];F.brows=.9;F.mouth='o';F.open=.45;SF.look=F.look;SF.mouth='o';SF.brow=.6;if(u>2.3){F.look=[-.6,-.2];F.lid=0;}}
 else if(u<3.05){F.look=[-.5,1];F.brows=1;F.mouth='o';F.open=.8;SF.look=[-.4,1];SF.mouth='o';SF.brow=1;}
 else if(u<3.6){arms={far:[[-360,-560],[-430,-700]],near:[[360,-560],[430,-700]]};F.look=[.2,.1];F.brows=.9;F.mouth='grin';SF.mouth='grin';SF.look=[.2,.2];}
 else if(u<4.25){F.look=u>3.95?[-1,.1]:[.1,0];F.brows=u>3.95?.8:.3;SF.look=F.look;}
 else if(u<5.1){arms={far:[[-310,-640],[-190,-920]],near:[[330,-480],[262,-404]]};F.look=[-1,0];F.brows=.55;F.mouth='grin';F.lid=.28;F.cheeks=.8;SF.look=[-1,0];SF.mouth='grin';SF.lid=.3;}
 else if(u<7.95){arms={far:[[-310,-640],[-190,-920]],near:[[330,-480],[262,-404]]};F.look=[-.3,1];F.brows=1;F.mouth='o';F.open=.9;SF.look=[-.3,1];SF.mouth='o';SF.brow=1;}
 else{const v=still?0:Math.sin((u-7.95)*9)*grClamp((9.3-u)/1);arms={far:[[-360,-560],[-440,-720+20*v]],near:[[360,-560],[440,-720-20*v]]};F.look=[.15,.1];F.brows=.7;F.mouth='grin';F.lid=u>8.9&&u<9.1?1:0;SF.mouth='grin';SF.look=[.2,.1];}
 // Perseus: tiptoes in from 3.4, his eyes shut; peeks from 5.6; tiptoes away from 6.0
 const pin=grSmooth(grSpan(u,3.4,4.3)),pout=grSmooth(grSpan(u,6.0,6.9)),pDir=u<6.0?-1:1,px=u<6.0?grLerp(R,M.px,pin):grLerp(M.px,R+60,pout),walking=(u>3.4&&u<4.3)||(u>6.0&&u<6.9);
 const PF={walk:walking&&!still?1:0,p:u*2.3,tip:walking?1:0,arms:{front:[[96,-420],[176,-470]],back:[[-30,-360],[-14,-292]]},lid:1,brow:-.5,mouth:'flat',flap:still?0:.5+.5*Math.sin(t*9)};
 if(u>5.6&&u<6.0){PF.lid=.5;PF.brow=.8;PF.mouth=u<5.78?'o':'grin';PF.look=[.9,0];}if(u>=6.0){PF.lid=0;PF.brow=.5;PF.mouth='grin';PF.look=[.6,0];}
 const sh={x:px+pDir*176*ps,y:gy-470*ps,r:118*ps};
 // the pigeon: lands on his head from 6.05, pecks a snake, flies off in a fright at 7.7
 const pIn=grSpan(u,6.05,6.5),pOff=grSpan(u,7.7,8.5),pig=u>6.05&&u<8.5,peck=still?0:Math.max(grBump(u,6.6,6.78),grBump(u,6.82,7.0));
 const pFrom=[S.left/K-80,-300];let pp=[top[0]+16,top[1]],pFly=false,pRot=0;
 if(u<6.5){const v=grSmooth(pIn);pp=[grLerp(pFrom[0],top[0]+16,v),grLerp(pFrom[1],top[1],v)-Math.sin(v*GR_PI)*60];pFly=pIn<.92;}
 if(u>=7.7){const v=grOut(pOff);pp=[top[0]+16+v*600,top[1]-v*560];pFly=true;pRot=-.2;}if(u>7.0&&u<7.7)pp=[pp[0]+shake*1.4,pp[1]];
 // the bits of stone that fly off, and lie on the floor after
 const bits=[];if(u>=7.7)for(let i=0;i<16;i++){const a=GR_PI*(.15+.7*grRand(i,381))+(grRand(i,382)>.5?GR_PI:0)*0,sx=gx+(grRand(i,383)-.5)*360*gs*1.1,sy=gy-(80+840*grRand(i,384))*gs,vx=(sx-gx)*2.2+(grRand(i,385)-.5)*180,
  floor=gy+6+30*grRand(i,386),T=still?1:grClamp((u-7.7)/.7),yy=Math.min(floor,sy-260*T+900*T*T),xx=sx+vx*Math.min(T,(floor>sy-260*T+900*T*T)?T:T);bits.push([xx,yy,i,yy>=floor]);}
 myIn(c,S,c=>{c.translate(0,Y0);c.scale(K,K);c.translate(0,-Y0);
  grShadow(c,gx,gy+4,210*gs/.58,26);if(px<R-40)grShadow(c,px,gy+4,110,18);
  const glups=c=>{grGlups(c,{x:gx+(stone>0?0:shake),y:gy,s:gs,flip:-1,arms,hold:hold||undefined,...F,head:c=>{grHead(c,F,t);mySnakeHair(c,t,still||frozen||stone>.99,SF);}},t);};
  myStoned(c,stone,[gx-560*gs,gy-1180*gs,gx+560*gs,gy+12],glups,crack>0?A=>{for(let i=0;i<7;i++){const x0=gx+(grRand(i,371)-.5)*260*gs,y0=gy-(120+780*grRand(i,372))*gs,L=(60+70*grRand(i,373))*crack;
   grLine(A,`M${x0} ${y0}l${L*.35} ${L*.25}l${-L*.2} ${L*.3}l${L*.3} ${L*.2}`,3.5,grRgba('#4a463e',.95));}}:null,frozen?'medusa|'+Math.round(crack*5):'',shake);
  for(const [x,y,i,rest] of bits){c.save();c.translate(x,y);c.rotate(rest?grRand(i,387)*3:(u-7.7)*8+i);grPart(c,`M-12 -8L10 -12L14 8L-8 12Z`,'#b4b0a6',{tones:[['M0 0L14 8L-8 12Z',grRgba('#7e7a70',.5)]],lw:3});c.restore();}
  if(!still&&u>7.72&&u<8.7){const v=grSpan(u,7.72,8.7);c.save();c.globalAlpha*=1-v;for(let i=0;i<5;i++)myCloud(c,gx-160*gs+i*80*gs,gy-20-40*v-30*grRand(i,391),20+20*v,{col:'#d8d4ca',shade:'#b8b4aa',lw:2,ink:grRgba(GR_INK,.25)});c.restore();}
  if(fly)myFly(c,fx,fy,1.4,still?.5:Math.abs(Math.sin(t*34)),false);else if(u>=2.7)myFly(c,stoneFly[0],stoneFly[1],1.05,.3,true);
  if(u>4.55&&u<5.05&&!still)mySpark(c,gx+110*gs,gy-735*gs,18,'#fffbe0',grBump(u,4.55,5.05));
  if(u>3.4&&u<6.9){myPerseus(c,px,gy,ps,pDir,PF);
   const ref=pDir<0&&pin>.85?c=>{c.translate(8,30);c.scale(.36,.36);c.translate(14,826);grHead(c,F,t);mySnakeHair(c,t,true,SF);}:null;myShield(c,sh.x,sh.y,sh.r,ref,stone>.5&&u<7.7);}
  if(pig)myPigeon(c,pp[0],pp[1],1.15,pFly?1:-1,{fly:pFly,flap:still?.5:Math.abs(Math.sin(u*(pFly?11:0))),peck,look:u>7.6?[0,-1]:[.6,.3],rot:pRot});
  if(u>7.7&&u<9.2)for(let i=0;i<3;i++){const v=grSpan(u,7.7+i*.1,9.2);if(v<=0||v>=1)continue;c.save();c.translate(top[0]+40+i*50+20*Math.sin(v*8+i),top[1]-40+300*v);c.rotate(Math.sin(v*6+i)*.8);grPart(c,'M0 -18C10 -8 10 8 0 18C-10 8 -10 -8 0 -18Z','#c8cede',{lw:3});c.restore();}
  if(!still&&u>8.6)for(let i=0;i<5;i++)mySpark(c,gx-240*gs*1.6+i*120*gs*1.6,gy-1180*gs+30*Math.sin(i*2),18,'#fff2b8',grBump(u,8.6+i*.07,9.4));});
 return myAnchor(S,hx*K,Y0+(hy-Y0)*K,300*K);}
export const MY_SCENES_C={minotaur:myMinotaurScene,centaur:myCentaurScene,siren:mySirenScene,medusa:myMedusaScene};

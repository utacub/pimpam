import {ESC_WAIT_START,escWaitClock,escWaitTurn} from './escenari.js';
import {sampleZone} from './sampler.js';

// ---------- Cinc petits mons (0.37): the five activities made by Marc with ChatGPT («Pim Pam 5 activitats v0.14») ----------
// Muntem el robot, La flor musical, La granota bombollaire (cause and effect) and La fàbrica dels disbarats (scanning); La caixa
// sorpresa was removed in 0.47.3. Their drawing, animation and timing are ChatGPT's code, kept as it was inside CINC (below), with its pictures and
// sounds. What changes: the pictures and sounds travel inside the HTML like the rest (CINC_IMAGES, the sample bank cincRec), the scene
// fills the screen, the common settings apply (decor, base colour, volume, «Moviment reduït», «Espera que acabi cada efecte», the
// steps, the duration, the waiting cue), the factory uses the scanning of the app, and the synthetic beeps are recorded sounds.
// The standalone build fills this table with the pictures (data: URLs); in development they are read from assets/cinc.
export const CINC_IMAGES=null;
const cincSrc=file=>{const name=file.replace(/\.png$/,'.webp');return CINC_IMAGES?.[name]||'./assets/cinc/'+name;};
const CINC=(()=>{
"use strict";
const offlineModules={};
const offlineSprites={"torso":{"file":"robot-atlas.png","rect":[48,56,392,372],"points":{"neck":[198,24],"shoulderL":[22,143],"shoulderR":[368,137],"hipL":[140,338],"hipR":[260,338]},"holes":{"neck":[198,24,61,14,0],"shoulderL":[22,143,11,35,0.26],"shoulderR":[368,137,10,36,-0.24]},"rims":{"neck":[198,24,82,30,0],"shoulderL":[22,143,42,70,0.26],"shoulderR":[368,137,32,65,-0.24]}},"head":{"file":"robot-atlas.png","rect":[472,24,464,408],"points":{"chin":[232,390]}},"handL":{"file":"robot-atlas.png","rect":[972,104,300,264],"points":{"socket":[30,185],"palm":[160,132]},"holes":{"socket":[30,185,17,41,-0.12]}},"handR":{"file":"robot-atlas.png","rect":[1384,104,304,264],"points":{"socket":[274,185],"palm":[140,132]},"holes":{"socket":[274,185,17,41,0.12]}},"bootL":{"file":"robot-atlas.png","rect":[44,464,360,372],"points":{"socket":[198,32],"sole":[180,365],"insert":[198,75]},"holes":{"socket":[198,32,60,15,-0.04]}},"bootR":{"file":"robot-atlas.png","rect":[552,464,352,376],"points":{"socket":[158,30],"sole":[176,369],"insert":[158,73]},"holes":{"socket":[158,30,60,15,0.04]}},"arm":{"file":"robot-atlas.png","rect":[1064,452,148,384],"points":{"start":[64,67],"end":[64,320]}},"leg":{"file":"robot-atlas.png","rect":[1456,452,164,384],"points":{"start":[96,65],"end":[96,315]}},"box":{"file":"props-atlas.png","rect":[24,92,272,232],"front":[[0,50],[191,72],[272,24],[272,232],[0,232]],"points":{"mouth":[137,43]}},"lid":{"file":"props-atlas.png","rect":[324,156,308,156]},"teapot":{"file":"props-atlas.png","rect":[652,68,320,260]},"clock":{"file":"props-atlas.png","rect":[992,36,232,296]},"toaster":{"file":"props-atlas.png","rect":[20,372,280,272]},"spring":{"file":"props-atlas.png","rect":[388,352,180,288]},"skate":{"file":"props-atlas.png","rect":[640,364,264,280]},"umbrella":{"file":"props-atlas.png","rect":[932,352,308,300],"points":{"grip":[102,270]}},"hat":{"file":"props-atlas.png","rect":[24,692,280,240]},"case":{"file":"props-atlas.png","rect":[336,664,292,256]},"balloon":{"file":"props-atlas.png","rect":[696,652,180,316]},"trumpet":{"file":"props-atlas.png","rect":[908,672,328,220]},"wagon":{"file":"props-atlas.png","rect":[364,1032,312,144],"front":[[0,25],[287,25],[303,10],[312,10],[312,144],[0,144]],"points":{"floor":[156,106],"mouth":[154,19]}},"wheel":{"file":"props-atlas.png","rect":[688,972,224,224]},"parcel":{"file":"props-atlas.png","rect":[952,920,276,288]},"machine":{"file":"machine.png","rect":[24,51,1219,1179],"front":[[0,100],[230,100],[275,131],[375,153],[520,168],[680,166],[820,146],[932,110],[1010,100],[1219,100],[1219,1179],[0,1179]],"points":{"mouth":[592,110],"window":[586,664]},"window":[[240,525],[865,544],[865,792],[233,766]]},"flowerPetal":{"file":"flower-atlas-v1.png","rect":[141,41,283,444],"points":{"root":[141,432]}},"flowerLeaf":{"file":"flower-atlas-v1.png","rect":[629,29,279,466],"points":{"root":[148,453]}},"flowerDisk":{"file":"flower-atlas-v1.png","rect":[1073,71,396,394]},"beeBody":{"file":"flower-atlas-v1.png","rect":[49,619,461,324]},"flowerPot":{"file":"flower-atlas-v1.png","rect":[554,556,442,415],"points":{"floor":[221,408],"soil":[221,76]},"mouth":[221,61,179,37]},"flowerStem":{"file":"flower-atlas-v1.png","rect":[1238,543,74,442]}};
offlineModules["flower-rig.js"]=(()=>{
// Geometry and score shared by animation, sound and review tools.
const bound=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>{x=bound(x);return x*x*x*(x*(x*6-15)+10);};
const ramp=(t,a,b)=>ease((t-a)/(b-a));
const pulse=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
const lerp=(a,b,t)=>a+(b-a)*t;
const flowerScore={length:12,finale:8,step:2.2,growth:1.9,notes:[2,2.5,3,3.5,4,4.5],answer:[8.5,9,9.5],petals:12,joke:6.65};
 function flowerTime(a){const concert=a.concertDuration||Math.min(a.duration||12,15);return a.elapsed<=concert?Math.min(a.elapsed,12):12+a.elapsed-concert;}
 function stemPoint(points,t){const u=1-t;return [0,1].map(k=>u*u*u*points[0][k]+3*u*u*t*points[1][k]+3*u*t*t*points[2][k]+t*t*t*points[3][k]);}
 function stemNormal(points,t){const u=1-t,d=[0,1].map(k=>3*u*u*(points[1][k]-points[0][k])+6*u*t*(points[2][k]-points[1][k])+3*t*t*(points[3][k]-points[2][k])),n=Math.hypot(...d)||1;return [-d[1]/n,d[0]/n];}
 function flowerPoint(head,point){const x=point[0]*head.sx,y=point[1]*head.sy,co=Math.cos(head.a),si=Math.sin(head.a);return [head.x+x*co-y*si,head.y+x*si+y*co];}
 function petalVertex(p,u,across){
 const co=Math.cos(p.angle),si=Math.sin(p.angle),sp=Math.sin(p.pitch),cp=Math.cos(p.pitch);
 const r=136*(u*cp+.08*u*(1-u)*sp),z=-10+136*u*sp+7*Math.sin(u*Math.PI)*(1-sp),width=.56+.44*cp;
 return {x:p.root[0]+si*r+co*across*width+.10*z,y:p.root[1]-co*r+si*across*width-.38*z,z};
}
 function flight(t,head,root,gag,finale,m){
 const hover=[root[0]+240,root[1]-370],bob=Math.sin(t*4.1)*6*m,move=bound((t-3)/2);
 let pos=stemPoint([[1395,hover[1]+25],[1190,hover[1]-100],[1000,hover[1]+48],hover],ease(move));
 pos[1]+=bob*ramp(t,3,5);
 pos[0]+=Math.sin(t*2.1)*7*m*ramp(t,3,5);
 if(t>=5){pos=[hover[0]+Math.sin(t*2.1)*7*m,hover[1]+bob];
  if(gag===0){const q=ramp(t,5.5,8.25);pos[0]+=Math.sin(q*Math.PI*2)*32*m;pos[1]+=(1-Math.cos(q*Math.PI*2))*20*m;}
  if(gag===1){const near=pulse(t,5,6.1,6.65,7.35),recoil=pulse(t,6.65,7.3,7.75,8.6);pos[0]=lerp(pos[0],head.x+115,near)+recoil*100*m;pos[1]=lerp(pos[1],head.y+16,near)-recoil*58*m;}
  if(gag===2){const q=ramp(t,6.65,8.55);pos[0]+=Math.sin(q*Math.PI*2)*66*m;pos[1]-=(1-Math.cos(q*Math.PI*2))*36*m;}
 }
 if(finale&&t>=12){
  const land=pulse(t,13.2,14.6,16.6,17.4),at=flowerPoint(head,[14,-65]);
  pos=[lerp(pos[0],at[0],land),lerp(pos[1],at[1]-28,land)];
  const out=ramp(t,17.4,19.6);pos=stemPoint([pos,[root[0]+330,root[1]-230],[1160,root[1]-490],[1400,root[1]-420]],out);
 }else if(!finale){const out=ramp(t,10.25,11.85);pos=stemPoint([pos,[root[0]+380,root[1]-440],[1190,root[1]-520],[1400,root[1]-440]],out);}
 return pos;
}
 function flowerPose(a,s,preview=false,root=[640,625]){
 const steps=s.steps||5,part=preview?steps:a.part||0,active=!preview&&a.busy&&part===steps;
 const t=preview?4.8:active?flowerTime(a):-1,clock=a.clock||0,m=s.reduced?.22:1,finale=active&&a.gag===2&&t>=12;
 const from=a.fromPart??Math.max(0,part-1),progress=preview||!a.busy?1:ramp(active?t:a.elapsed,0,flowerScore.growth);
 const growth=bound(lerp(from,part,progress)/steps),fold=finale?ramp(t,13.2,14.8):0,withdraw=finale?ramp(t,14.9,17.6):0;
 const bloom=ramp(growth,.59,1)*(1-fold),music=active?pulse(t,1.9,2.1,9.65,10):0;
 const anticipation=active&&a.gag===1?pulse(t,5.75,6.35,6.59,6.77):0;
 const sneeze=active&&a.gag===1&&t>6.65?Math.exp(-(t-6.65)*4.8)*Math.sin((t-6.65)*15)*(1-ramp(t,7.8,8.6)):0;
 const hiccup=active&&a.gag===2?pulse(t,6.4,6.65,6.95,7.35):0;
 const bow=active?pulse(t,10,10.45,10.9,11.7)+(finale?pulse(t,12,12.5,12.8,13.3):0):0;
 const sway=(Math.sin(clock*1.25)*3+Math.sin(t*Math.PI*4/3)*11*music-anticipation*17+sneeze*30+hiccup*7)*m*growth*(1-withdraw);
 const height=346*(.45*growth+.55*ease(growth))*(1-withdraw),headSize=(.2+.8*ramp(growth,.1,1))*(1-withdraw*.48);
 const head={x:root[0]+sway+bow*12*m,y:root[1]-height+45*(1-ramp(growth,0,.12))+withdraw*65+(bow*24-anticipation*9+sneeze*17)*m,a:(Math.sin(clock*1.25)*.012+Math.sin(t*Math.PI*4/3-.4)*.045*music+bow*.16+sneeze*.15-hiccup*.05)*m*(1-withdraw),sx:headSize,sy:headSize};
 const top=flowerPoint(head,[0,24]),stem=[root,[root[0]-sway*.18,root[1]-height*.36],[head.x+sway*.18,head.y+height*.28],top];
 const leaves=[-1,1].map((side,i)=>{
  const at=i?.39:.25,node=stemPoint(stem,at),n=stemNormal(stem,at),size=ramp(growth,i?.39:.16,i?.75:.48)*(1-withdraw),reach=11*size;
  const end=[node[0]+n[0]*side*reach,node[1]+n[1]*side*reach-8*size];
  const petiole=[node,[node[0]+side*5*size,node[1]-2*size],[end[0]-side*6*size,end[1]+3*size],end];
  const lean=Math.atan2(n[1],n[0]),flex=(Math.sin(clock*1.3-i*.5)*.025+Math.sin(t*Math.PI*4/3-i*.65)*.065*music)*m;
  return {side,t:at,node,root:end,petiole,size,angle:side*(1.22*(1-fold*.82)+flex)+lean};
 });
 const petals=Array.from({length:flowerScore.petals},(_,i)=>{const theta=i*Math.PI*2/flowerScore.petals,delay=(.5+.5*Math.cos(theta))*.13,opening=ramp(bloom,delay,.86+delay),beat=music*Math.sin(t*Math.PI*4/3-i*.2)*.025*m,r=18+27*opening;return {root:[Math.sin(theta)*r,-Math.cos(theta)*r],angle:theta+beat*.4,pitch:1.43*(1-opening)+beat+(i===4?hiccup*.18*m:0),opening};});
 let bee=null;
 if(preview)bee={x:head.x+235,y:head.y-50,a:-.08,wing:.7,land:0,flutter:0};
 else if(active&&t>=3){
  const pos=flight(t,head,root,a.gag,a.gag===2,m),before=flight(t-.012,head,root,a.gag,a.gag===2,m),after=flight(t+.012,head,root,a.gag,a.gag===2,m);
  const vx=(after[0]-before[0])/.024,vy=(after[1]-before[1])/.024,land=finale?pulse(t,13.7,14.6,16.6,17.4):0;
  bee={x:pos[0],y:pos[1],a:bound(vx*.0012+vy*.001,-.38,.38)*m,wing:land>.9?.18:s.reduced?.6:.5+.5*Math.sin(clock*92),land,flutter:Math.sin(clock*8)*.08*m*(1-land)};
 }
 const idleLook={x:Math.sin(clock*.42)*.16,y:0},returnGaze=active?ramp(t,a.gag===2?18.9:10.9,a.gag===2?19.6:11.85):0;
 const look=bee?{x:lerp(bound((bee.x-head.x)/180,-1,1),idleLook.x,returnGaze),y:lerp(bound((bee.y-head.y)/130,-1,1),0,returnGaze)}:idleLook;
 const seedT=finale?bound((t-17.15)/1.3):0,seed=finale&&t>=17.15?{x:root[0]+Math.sin(seedT*Math.PI)*28,y:root[1]-4-Math.sin(seedT*Math.PI)*92,a:Math.sin(seedT*Math.PI)*2.5}:null;
 return {growth,bloom,discSize:.28+.72*bloom,discLift:-30*(1-bloom),head,stem,leaves,petals,bee,look,t,active,music,anticipation,sneeze,hiccup,bow,root,m,clock,fold,withdraw,finale,seed,audioLevel:a.musicEnergy,yawn:finale?pulse(t,12.5,13,13.5,14):0};
}


return {get flowerScore(){return flowerScore},get flowerTime(){return flowerTime},get stemPoint(){return stemPoint},get stemNormal(){return stemNormal},get flowerPoint(){return flowerPoint},get petalVertex(){return petalVertex},get flowerPose(){return flowerPose}};
})();
offlineModules["bubbles-rig.js"]=(()=>{
const limit=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=limit(x);return x*x*x*(x*(x*6-15)+10);};
const ramp=(t,a,b)=>smooth((t-a)/(b-a));
const pulse=(t,a,b,c,d)=>ramp(t,a,b)*(1-ramp(t,c,d));
const mix=(a,b,t)=>a+(b-a)*t;
const bubbleGags=[
 {name:'El nas de pallassa',hue:350,music:0},
 {name:'La lupa entremaliada',hue:192,music:1},
 {name:'El bigoti esternudador',hue:290,music:2},
 {name:'La bombolla xiclet',hue:32,music:3},
 {name:'Un atac de singlot',hue:140,music:4},
 {name:'El barret que cau',hue:225,music:5},
 {name:'La gran traca de colors',hue:315,music:6}
];
const bubbleScore={minimum:.35,maximum:2.8,length:8.5,coda:4.5,count:bubbleGags.length,last:bubbleGags.length-1,pops:[[6.55],[6.5],[5.3,5.55],[6.65],[5.9,6.15,6.4,6.65],[6.3,6.55,6.8],[8.8,9.1,9.4,9.7,10,10.3,10.6,12]],sounds:[[[3.25,'croak'],[5.2,'croak']],[[3.8,'croak']],[[3.8,'tickle'],[4.95,'sneeze']],[[5.2,'stretch']],[[3.2,'hiccup'],[4.1,'hiccup'],[5,'hiccup']],[[4.1,'stretch']],[[11.15,'hiccup']]]};
const bertaAnchors={mouth:[636,382],eyes:[[516,171],[844,237]],floor:1220,scale:.43,center:600,ground:736};
// Even a brief accepted gesture creates a large, readable bubble.
 function bubbleRadius(charge){const t=limit(charge,0,bubbleScore.maximum);return 16+205*(1-Math.exp(-t/.22))+28*t/2.8;}
 function bubbleTime(a){const end=a.sceneDuration||bubbleScore.length;return a.elapsed<=end?Math.min(a.elapsed,bubbleScore.length):bubbleScore.length+a.elapsed-end;}
 function bertaBody(a,s){
 const active=a.phase==='effect',inflating=a.phase==='inflate',t=active?bubbleTime(a):-1,gag=a.gag||0,m=s.reduced?.28:1,clock=a.clock||0;
 let pressure=limit((inflating?a.elapsed:a.charge||0)/bubbleScore.maximum)*(inflating?1:active?1-ramp(t,0,.75):0),purse=inflating?ramp(a.elapsed,0,.14):active?1-ramp(t,.08,.62):0;
 let lean=0,bend=0,tilt=0,oh=0,laugh=0,wink=0,squeeze=0,cross=0;
 if(active){
  if(gag===0){const poke=pulse(t,2.55,2.85,3.05,3.6),again=pulse(t,4.0,4.2,4.35,4.9);lean=-95*poke+65*again;bend=30*poke-25*again;tilt=-.055*poke+.045*again;oh=.85*pulse(t,2.5,2.9,3.5,4);cross=pulse(t,2.65,3.2,5.7,6.4);laugh=pulse(t,5,5.3,6.05,6.45);}
  if(gag===1){const peek=pulse(t,2.8,3.3,5.8,6.4);lean=Math.sin(t*2)*25*peek;tilt=Math.sin(t*2)*.04*peek;wink=pulse(t,4.8,5.1,5.5,6.1);oh=pulse(t,3.05,3.3,3.9,4.4);laugh=pulse(t,5.8,6,6.4,6.8);}
  if(gag===2){const prepare=pulse(t,3.7,4.5,4.65,4.95),sneeze=pulse(t,4.85,5.04,5.15,5.65),tickle=pulse(t,3.1,3.5,3.9,4.4);lean=Math.sin(t*15)*22*tickle+95*sneeze;bend=-75*prepare+145*sneeze;tilt=-.025*prepare+.075*sneeze;oh=prepare*.6;laugh=pulse(t,5.8,6.2,7.1,7.7);squeeze=Math.max(prepare*.7,sneeze);purse=Math.max(purse,prepare*.4);}
  if(gag===3){const pull=pulse(t,.65,1.8,4.75,5.2),tug=Math.sin((t-1.8)*4)*pulse(t,1.8,2.1,4.6,5.2),snap=pulse(t,5.2,5.4,5.5,6.15);lean=-110*pull+45*tug+100*snap;tilt=-.04*pull+.06*snap;bend=-25*pull+45*snap;pressure=Math.max(pressure,.5*pull);purse=Math.max(purse,1-ramp(t,5.2,5.7));oh=pulse(t,5.55,5.8,6.3,6.8);laugh=pulse(t,6.8,7,7.3,7.8);}
  if(gag===4){const jolt=[3.2,4.1,5].reduce((n,at)=>n+pulse(t,at-.1,at,at+.07,at+.42),0);bend=-65*jolt;lean=Math.sin(t*5)*18*jolt;oh=jolt;pressure=Math.max(pressure,.4*jolt);laugh=pulse(t,6.8,7,7.4,8);}
  if(gag===5){const balance=pulse(t,2.5,2.8,3.6,4),drop=pulse(t,3.65,4.15,4.6,5.5);lean=Math.sin(t*4)*90*balance;bend=70*drop;tilt=Math.sin(t*4)*.09*balance;oh=.9*drop;squeeze=.85*pulse(t,4.0,4.2,4.5,4.9);laugh=pulse(t,6.9,7.2,7.5,8);}
  if(gag===6){const bow=pulse(t,6.5,7.2,7.55,8.2),dance=pulse(t,3.6,4.2,6,6.5);lean=Math.sin(t*3)*45*dance;bend=110*bow;tilt=.035*bow;oh=pulse(t,11.1,11.3,11.7,12.1);purse=Math.max(purse,pulse(t,11.12,11.2,11.6,11.8));laugh=Math.max(.65*dance,pulse(t,10.65,10.85,11.02,11.2),pulse(t,12.3,12.5,12.7,12.95));}
 }
 return {pressure,purse,shift:(Math.sin(clock*.8)*5+lean)*m,bend:bend*m-Math.sin(clock*1.9)*2.5*m-11*pressure,tilt:(Math.sin(clock*.8)*.008+tilt)*m,t,m,clock,oh,laugh,wink,squeeze,cross};
}
 function bertaPoint(point,b){
 const [x,y]=point,up=1-ramp(y,520,1080),bulge=Math.exp(-Math.pow((y-450)/310,2))*up;
 return [bertaAnchors.center+((x-630)*(1+b.pressure*.065*bulge)+b.shift*up)*bertaAnchors.scale,bertaAnchors.ground+(y-bertaAnchors.floor+b.bend*up+b.tilt*(x-630)*up)*bertaAnchors.scale];
}
 function path(points,t){const u=1-t;return [0,1].map(k=>u*u*u*points[0][k]+3*u*u*t*points[1][k]+3*u*t*t*points[2][k]+t*t*t*points[3][k]);}
 function splitCluster(center,radius,targets,amount){
 const s=smooth(amount),n=targets.length,child=radius*s/Math.cbrt(n),parent=radius*Math.cbrt(Math.max(0,1-s*s*s));
 return [{x:center[0],y:center[1],r:parent,part:-1},...targets.map((p,i)=>({x:mix(center[0],p[0],s),y:mix(center[1],p[1],s),r:child,part:i}))].filter(p=>p.r>.001);
}
 function breathBubble(mouth,r){return {x:mouth[0]+r*Math.cos(-.24),y:mouth[1]+r*Math.sin(-.24),r,part:0,pop:-1};}
 function bertaPose(a,s,preview=false){
 if(preview)a={...a,phase:'effect',elapsed:4,charge:1.4,gag:6,releaseClock:0,sceneDuration:bubbleScore.length};
 const b=bertaBody(a,s),t=b.t,gag=a.gag||0,mouth=bertaPoint(bertaAnchors.mouth,b),eyes=bertaAnchors.eyes.map(p=>bertaPoint(p,b)),radius=bubbleRadius(a.phase==='inflate'?a.elapsed:a.charge||0),bubbles=[];
 const hue=bubbleGags[gag].hue,pops=bubbleScore.pops[gag],add=(p,i=0,extra={})=>bubbles.push({...p,part:i,pop:t-pops[i],hue,...extra});
 if(a.phase==='inflate')bubbles.push({...breathBubble(mouth,radius),hue});
 else if(a.phase==='effect'){
  const initial=bertaBody({phase:'inflate',elapsed:a.charge,clock:a.releaseClock||0},s),origin=bertaPoint(bertaAnchors.mouth,initial),start=breathBubble(origin,radius),loft=[890,300],fly=path([[start.x,start.y],[start.x+45,start.y-15],[910,300],loft],ramp(t,0,1.65));
  const arrive=(target,from=1.65,to=2.8)=>t<from?fly:path([loft,[850,315],[target[0]+60,target[1]],target],ramp(t,from,to));
  if(gag===0){const target=[mouth[0],mouth[1]-22],at=arrive(target),poke=pulse(t,2.55,2.85,3.05,3.6)+pulse(t,4,4.2,4.35,4.9),sx=1-.2*poke;add({x:at[0],y:at[1],r:radius,sx,sy:1/Math.sqrt(sx)});}
  if(gag===1){const across=ramp(t,3.8,4.8),at=arrive([mix(eyes[0][0],eyes[1][0],across),Math.max(radius+24,mix(eyes[0][1],eyes[1][1],across))]);add({x:at[0],y:at[1],r:radius,lens:1+.65*pulse(t,2.6,3.2,5.9,6.5)});}
  if(gag===2){
   const kick=ramp(t,4.95,5.55),r=radius/Math.cbrt(2),targets=[[mouth[0]-r*.94-180*kick,mouth[1]+55-70*kick],[mouth[0]+r*.94+180*kick,mouth[1]+55-110*kick]],at=arrive([mouth[0],mouth[1]+55],1.65,3.0);
   if(t<1.65)add({x:fly[0],y:fly[1],r:radius},0,{pop:-1});else for(const p of splitCluster(at,radius,targets,(t-1.65)/1.35))add(p,Math.max(0,p.part),{pop:p.part<0?-1:t-pops[p.part],hue:p.part===1?35:hue,sx:1+.13*ramp(t,2,3),sy:1-.13*ramp(t,2,3),angle:(p.part===0?-.15:.15)*ramp(t,2,3)});
  }
  if(gag===3){
   const q=Math.min(t,5.2),body=q===t?b:bertaBody({...a,elapsed:q,clock:b.clock-(t-q)},s),atMouth=bertaPoint(bertaAnchors.mouth,body),pull=pulse(q,.65,1.8,4.75,5.2),sx=1+.31*pull,angle=-.24+.17*pull,rx=radius*sx,center=[atMouth[0]+Math.cos(angle)*rx,atMouth[1]+Math.sin(angle)*rx];
   if(t<=5.2)add({x:center[0],y:center[1],r:radius,sx,sy:1/Math.sqrt(sx),angle,attached:true});
   else{const flight=ramp(t,5.2,6.65),at=path([center,[1050,360],[990,180],[1170,165]],flight);add({x:at[0],y:at[1],r:radius*(1-.9*flight),sx:1+.25*Math.sin(Math.PI*flight),sy:1-.18*Math.sin(Math.PI*flight),angle:-.2});}
  }
  if(gag===4){
   const at=arrive([910,430]),jolt=[3.2,4.1,5].reduce((v,x)=>v+pulse(t,x-.1,x,x+.07,x+.42),0);add({x:at[0],y:at[1],r:radius,sx:1+.14*jolt,sy:1-.18*jolt},3);
   for(let i=0;i<3;i++){const born=3.2+i*.9,age=t-born;if(age<0)continue;const when=bertaBody({...a,elapsed:born,clock:b.clock-age},s),from=bertaPoint(bertaAnchors.mouth,when),target=[[310,270],[560,160],[795,185]][i],at=path([from,[from[0]-90+i*60,from[1]-70],[target[0],target[1]+40],target],ramp(age,0,1.15));add({x:at[0],y:at[1],r:radius*.34*ramp(age,0,.22)},i,{hue:[35,285,195][i]});}
  }
  if(gag===5){
   const drop=130*pulse(t,3.65,4.15,4.6,5.5),top=bertaPoint([630,22],b),center=[top[0],Math.max(174,top[1]-80)+drop],r=radius/Math.cbrt(3),targets=[[-1,0],[0,-40],[1,0]].map(([x,y])=>[center[0]+x*(r*1.15),center[1]+y]);
   const at=t<1.65?fly:path([loft,[840,320],[center[0]+70,320],center],ramp(t,1.65,3));
   if(t<1.65)add({x:fly[0],y:fly[1],r:radius},0,{pop:-1});else for(const p of splitCluster(at,radius,targets,(t-1.65)/1.35))add(p,Math.max(0,p.part),{pop:p.part<0?-1:t-pops[p.part],hue:hue+Math.max(0,p.part)*32,sx:1+.18*ramp(t,2,3),sy:1-.42*ramp(t,2,3)});
  }
  if(gag===6){
   const colors=[350,25,50,135,185,225,285],targets=[[260,265],[450,170],[660,170],[870,210],[1045,390],[915,580],[290,565]].map((p,i)=>[p[0]+Math.sin(t*1.8+i)*5*b.m*pulse(t,3.5,4.2,8.3,10.7),p[1]+Math.sin(t*1.4+i)*6*b.m*pulse(t,3.5,4.2,8.3,10.7)]),at=t<1.65?fly:path([loft,[880,350],[710,340],[640,335]],ramp(t,1.65,3.5));
   if(t<1.65)add({x:fly[0],y:fly[1],r:radius},0,{pop:-1});else for(const p of splitCluster(at,radius,targets,(t-1.65)/1.85))add(p,Math.max(0,p.part),{pop:p.part<0?-1:t-pops[p.part],hue:p.part<0?hue:colors[p.part]});
   if(t>=11.15){const age=t-11.15,r=36*ramp(age,0,.3),at=[mouth[0]+r+25*ramp(age,.3,.8),mouth[1]-r*.2-35*ramp(age,.3,.8)];add({x:at[0],y:at[1],r},7,{hue:350});}
  }
 }
 const visible=bubbles.filter(p=>p.pop<.55&&p.r>.01),focus=bubbles.find(p=>p.pop<0&&p.r>10)||bubbles.at(-1),returnLook=a.phase==='effect'?ramp(t,gag===bubbleScore.last?12.15:7.2,gag===bubbleScore.last?12.9:8.3):a.phase==='inflate'?0:1;
 const idleLook=Math.sin(b.clock*.3)*.12,look=focus?{x:mix(limit((focus.x-mouth[0])/260,-1,1),idleLook,returnLook),y:limit((focus.y-mouth[1])/220,-1,1)*(1-returnLook)}:{x:idleLook,y:0};
 const blinkCycle=b.clock%5.2,blink=blinkCycle<.17?Math.abs(blinkCycle/.085-1):1,popBlink=a.phase==='effect'?Math.max(0,...pops.map(at=>pulse(t,at-.04,at+.07,at+.16,at+.4))):0;
 return {...b,mouth,eyes,bubbles:visible,radius,look,blink:Math.max(.025,Math.min(blink,1-popBlink,1-b.squeeze)),gag};
}

return {get bubbleGags(){return bubbleGags},get bubbleScore(){return bubbleScore},get bertaAnchors(){return bertaAnchors},get bubbleRadius(){return bubbleRadius},get bubbleTime(){return bubbleTime},get bertaBody(){return bertaBody},get bertaPoint(){return bertaPoint},get bertaPose(){return bertaPose}};
})();
offlineModules["game-core.js"]=(()=>{
const {flowerScore}=offlineModules["flower-rig.js"];
const {bubbleScore,bubbleGags}=offlineModules["bubbles-rig.js"];
const catalog = [
 {id:'robot',name:'Muntem el robot',tag:'Peça a peça',description:'Un robot amb moltes ganes de posar-se dret.',category:'Construir',color:'#cce5dc'},
 {id:'factory',name:'La fàbrica dels disbarats',tag:'Tu tries què passa',description:'Barreja dues idees i inventa una cosa impossible.',category:'Triar',color:'#e3d8ef'},
 {id:'flower',name:'La flor musical',tag:'Un jardí amb molt de ritme',description:'Fes créixer la Flora. El borinot vol entrar al concert!',category:'Créixer i escoltar',color:'#eee5b9'},
 {id:'bubbles',name:'La granota bombollaire',tag:'Prem, bufa… i deixa anar!',description:'Set entremaliadures amb bombolles gegants de colors.',category:'Mantenir i alliberar',color:'#cfe5cf'}
];
const objects=['Una tetera','Un rellotge','Una torradora'];
const powers=['Una molla','Uns patins','Un paraigua'];
const flowerGags=['El duet del borinot','L’esternut musical','La nota entremaliada'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

// A single clock controls animation and sound. Pausing never advances either.
 class Activity {
 constructor(id,settings,emit=()=>{}){
  
  this.id=id;this.settings=settings;this.emit=emit;this.phase=id==='factory'?'choose':'ready';this.elapsed=0;this.clock=0;this.round=0;this.part=0;this.choice=[];this.scanIndex=0;this.scanElapsed=0;this.x=-240;this.paused=false;this.cues=new Set();this.duration=0;this.gag=0;this.message='';this.messageTime=0;
 }
 get busy(){return ['effect','build','inflate'].includes(this.phase);}
 get canSelect(){return this.id==='factory'&&this.phase==='choose';}
 effect(duration,phase='effect'){this.phase=phase;this.elapsed=0;this.duration=duration;this.cues.clear();this.emit(this.id==='flower'?'flora-start':this.id==='bubbles'?'berta-start':'start');}
 press(i=0){
  if(this.paused){this.paused=false;this.emit('resume');return true;}
  // Pim Pam 0.37: with «Espera que acabi cada efecte» off, a press during an effect goes on to the next one (the robot and the flower: the next step, never during the final; the frog: the next bubble,
  // never while it is being blown). With the setting on, nothing is kept for later.
  if(this.busy){
   if(this.settings.lock||this.phase==='inflate')return false;
   if(this.id==='robot'||this.id==='flower'){if(this.part>=this.settings.steps)return false;}
   else if(this.id==='bubbles'){if(this.phase!=='effect')return false;this.round=(this.round+1)%bubbleScore.count;if(this.round===0)this.cycles=(this.cycles||0)+1;}
   else return false;
  }
  if(this.id==='bubbles'){this.gag=this.round%bubbleScore.count;this.held=true;this.releasePending=false;this.charge=0;this.effect(bubbleScore.maximum,'inflate');}
  if(this.id==='robot'){
   this.rebuilding=this.part>=this.settings.steps;
   if(this.rebuilding)this.part=0;
   this.part++;this.effect(this.part===this.settings.steps?5.6:2.1);
  }
  if(this.id==='flower'){
   this.fromPart=this.part;this.part=Math.min(this.part+1,this.settings.steps);this.gag=this.round%flowerGags.length;
   this.concertDuration=Math.max(flowerScore.length,this.settings.duration);
   this.effect(this.part===this.settings.steps?this.concertDuration+(this.gag===2?flowerScore.finale:0):flowerScore.step);
  }
  return true;
 }
 release(i=0){
  if(this.id!=='bubbles'||i!==0||this.phase!=='inflate')return false;
  this.held=false;this.releasePending=true;
  if(!this.paused&&this.elapsed>=bubbleScore.minimum)this.launchBubble();
  return true;
 }
 launchBubble(){
  this.charge=this.elapsed;this.releaseClock=this.clock;this.held=false;this.releasePending=false;this.sceneDuration=Math.max(bubbleScore.length,this.settings.duration);
  this.effect(this.sceneDuration+(this.gag===bubbleScore.last?bubbleScore.coda:0));
 }
 choose(index){
  if(!this.canSelect||this.paused||!Number.isInteger(index)||index<0||index>2)return false;
  this.choice.push(index);this.scanIndex=0;this.scanElapsed=0;
  this.effect(this.choice.length===1?1.4:7,this.choice.length===1?'build':'effect');return true;
 }
 cue(key,at,sound){if(this.elapsed>=at&&!this.cues.has(key)){this.cues.add(key);this.emit(sound);}}
 tick(dt,pending=false){
  if(this.paused)return;
  dt=clamp(dt,0,.1);this.clock+=dt;this.messageTime=Math.max(0,this.messageTime-dt);
  if(this.canSelect&&this.settings.mode===1&&!pending){this.scanElapsed+=dt*1000;if(this.scanElapsed>=this.settings.scanTime){this.scanElapsed=0;this.scanIndex=(this.scanIndex+1)%3;this.emit('scan');}}
  if(!this.busy)return;
  this.elapsed+=dt;
  if(this.id==='bubbles'&&this.phase==='inflate'){
   if(this.elapsed>=bubbleScore.maximum){this.elapsed=bubbleScore.maximum;this.launchBubble();}
   else if(this.releasePending&&this.elapsed>=bubbleScore.minimum)this.launchBubble();
   return;
  }
  const f=this.elapsed/this.duration;
  if(this.id==='robot'){this.cue('join',this.part===this.settings.steps?1.1:.8,'click');if(this.part===this.settings.steps){this.cue('whoops',2.9,'boing');this.cue('ta-da',4.5,'twinkle');}}
  if(this.id==='flower'){
   if(this.fromPart<this.part)this.cue('grow',.06,'flora-grow');
   if(this.part===this.settings.steps){
    if(this.gag!==0)this.cue('joke',flowerScore.joke,this.gag===1?'flora-sneeze':'flora-hiccup');
    if(this.gag===2)this.cue('seed',this.concertDuration+5.3,'flora-grow');
   }
  }
  if(this.id==='bubbles'){
   const at=t=>t<bubbleScore.length?t:this.sceneDuration+t-bubbleScore.length;
   bubbleScore.pops[this.gag].forEach((t,i)=>this.cue('bubble-pop-'+i,at(t),this.gag===bubbleScore.last?'berta-note-'+i:'berta-pop'));
   bubbleScore.sounds[this.gag].forEach(([t,key],i)=>this.cue('bubble-sound-'+i,at(t),'berta-'+key));
  }
  if(this.id==='factory'){this.cue('machine',.45,'click');if(this.phase==='effect'){this.cue('out',2.15,'pop');this.cue('fun',3.5,'boing');this.cue('done',5.7,'twinkle');}}
  if(f<1)return;
  this.elapsed=this.duration;
  if(this.id==='factory'){
   if(this.phase==='build'){this.phase='choose';this.scanElapsed=0;}
   else{this.phase='choose';this.choice=[];this.round++;this.scanIndex=0;this.scanElapsed=0;}
  }else{this.phase='ready';if(this.id==='flower'&&this.part===this.settings.steps){this.round++;if(this.round===flowerGags.length){this.round=0;this.part=0;this.fromPart=0;this.cycles=(this.cycles||0)+1;}}}
  if(this.id==='bubbles'){this.round=(this.round+1)%bubbleScore.count;if(this.round===0)this.cycles=(this.cycles||0)+1;}
  this.emit('ready');
 }
 get instruction(){
  if(this.paused)return 'Fem una pausa. Prem per continuar.';
  if(this.messageTime)return this.message;
  if(this.id==='robot')return this.busy?(this.part===this.settings.steps?'Ara sí… ja tenim robot!':'Una peça més!'):this.part===this.settings.steps?'El tornem a muntar?':'Prem per afegir una peça.';
  if(this.id==='flower')return this.busy?(this.part===this.settings.steps?(this.gag===2&&this.elapsed>=this.concertDuration?'Una última reverència… i tornem a ser llavor!':flowerGags[this.gag]):'La Flora creix una mica més…'):this.part===this.settings.steps?'Prem per al següent concert.':this.part?'Prem per ajudar-la a créixer.':this.cycles?'Fi del concert! Prem per fer créixer una nova Flora.':'Prem i desperta la llavor.';
  if(this.id==='bubbles')return this.phase==='inflate'?'La bombolla creix… deixa anar per fer-la volar!':this.busy?(this.gag===bubbleScore.last&&this.elapsed>=this.sceneDuration+2.65?'Ep… encara en quedava una!':bubbleGags[this.gag].name):this.cycles&&this.round===0?'Fi de la funció! Prem i torna a bufar.':'Mantén premut per bufar. Deixa anar per jugar.';
  return this.phase==='build'?'Cap a dins!':this.phase==='effect'?'Mira què has inventat!':this.choice.length?'I ara, què li afegim?':'Què posem a la màquina?';
 }
}

return {get catalog(){return catalog},get objects(){return objects},get powers(){return powers},get flowerGags(){return flowerGags},get clamp(){return clamp},get Activity(){return Activity}};
})();
offlineModules["rig.js"]=(()=>{
// Geometry shared by the sprite rig and its checks. Points are image-space anchors.
 function transformPoint(point,pose,rect){
 const px=(point[0]-rect[2]/2)*pose.w/rect[2],py=(point[1]-rect[3]/2)*pose.h/rect[3];
 const co=Math.cos(pose.a||0),si=Math.sin(pose.a||0);
 return [pose.x+px*co-py*si,pose.y+px*si+py*co];
}
 function anchoredPose(point,target,w,h,rect,a=0){
 const offset=transformPoint(point,{x:0,y:0,w,h,a},rect);
 return {x:target[0]-offset[0],y:target[1]-offset[1],w,h,a};
}
 function twoBone(start,target,upper,lower,bend=1){
 const dx=target[0]-start[0],dy=target[1]-start[1],raw=Math.hypot(dx,dy),angle=Math.atan2(dy,dx);
 const distance=Math.min(upper+lower-.001,Math.max(Math.abs(upper-lower)+.001,raw));
 const along=(upper*upper-lower*lower+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upper*upper-along*along));
 const ux=Math.cos(angle),uy=Math.sin(angle);
 return {elbow:[start[0]+ux*along-uy*height*bend,start[1]+uy*along+ux*height*bend],end:[start[0]+ux*distance,start[1]+uy*distance]};
}
 function segmentMatrix(sourceA,sourceB,targetA,targetB,widthScale){
 const sx=sourceB[0]-sourceA[0],sy=sourceB[1]-sourceA[1],sl=Math.hypot(sx,sy);
 const tx=targetB[0]-targetA[0],ty=targetB[1]-targetA[1],tl=Math.hypot(tx,ty);
 if(sl<.001||tl<.001)throw Error('A sprite segment needs two distinct anchors');
 const ux=sx/sl,uy=sy/sl,vx=tx/tl,vy=ty/tl,lengthScale=tl/sl;
 const a=widthScale*vy*uy+lengthScale*vx*ux,b=-widthScale*vx*uy+lengthScale*vy*ux;
 const c=-widthScale*vy*ux+lengthScale*vx*uy,d=widthScale*vx*ux+lengthScale*vy*uy;
 return [a,b,c,d,targetA[0]-a*sourceA[0]-c*sourceA[1],targetA[1]-b*sourceA[0]-d*sourceA[1]];
}
 function triangleMatrix([s0,s1,s2],[t0,t1,t2]){
 const x1=s1[0]-s0[0],y1=s1[1]-s0[1],x2=s2[0]-s0[0],y2=s2[1]-s0[1],det=x1*y2-y1*x2;
 if(Math.abs(det)<.0001)throw Error('A projection needs three non-collinear anchors');
 const u1=t1[0]-t0[0],v1=t1[1]-t0[1],u2=t2[0]-t0[0],v2=t2[1]-t0[1];
 const a=(u1*y2-u2*y1)/det,b=(v1*y2-v2*y1)/det,c=(u2*x1-u1*x2)/det,d=(v2*x1-v1*x2)/det;
 return [a,b,c,d,t0[0]-a*s0[0]-c*s0[1],t0[1]-b*s0[0]-d*s0[1]];
}
// One ground plane for both rail heads and both sides of every axle.
const railway={nearY:680,farY:650,depthX:20,radius:36.5};
 function wheelPair(x){
 return {near:[x,railway.nearY-railway.radius],far:[x+railway.depthX,railway.farY-railway.radius]};
}
const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
 function suitcaseMotion(t){
 return {open:ease((t-.2)/1.05)*(1-ease((t-5.85)/.95)),contents:ease((t-1.5)/1.1)*(1-ease((t-4.75)/.9))};
}
// One physical model supplies every body, rim, lid and hardware vertex.
const suitcaseShape={width:142,depth:68,height:84,radius:11,thickness:13,angle:Math.PI*.58};
 function suitcaseProject([x,y,z]){return [x+y*.65,x*.16-y*.35-z];}
 function suitcaseOutline(inset=0,z=0){
 const w=suitcaseShape.width/2-inset,d=suitcaseShape.depth/2-inset,r=Math.max(2,suitcaseShape.radius-inset),out=[];
 for(const [cx,cy,a] of [[w-r,-d+r,-Math.PI/2],[w-r,d-r,0],[-w+r,d-r,Math.PI/2],[-w+r,-d+r,Math.PI]])for(let k=0;k<=5;k++){const t=a+k*Math.PI/10;out.push([cx+r*Math.cos(t),cy+r*Math.sin(t),z]);}
 return out;
}
 function suitcaseLidPoint([x,y,z],open){
 const hinge=suitcaseShape.depth/2-2,a=open*suitcaseShape.angle,dy=y-hinge;
 return [x,hinge+dy*Math.cos(a)+z*Math.sin(a),suitcaseShape.height-dy*Math.sin(a)+z*Math.cos(a)];
}
 function suitcaseLid(open){
 const x=suitcaseShape.width/2-2,y=suitcaseShape.depth/2-2;
 const corners=[[-x,y,0],[x,y,0],[x,-y,0],[-x,-y,0]];
 const points=corners.map(p=>suitcaseProject(suitcaseLidPoint(p,open))),outer=corners.map(([x,y])=>suitcaseProject(suitcaseLidPoint([x,y,suitcaseShape.thickness],open)));
 const normal=outer[0].map((v,i)=>v-points[0][i]),edge=points[1].map((v,i)=>v-points[0][i]),reach=points[3].map((v,i)=>v-points[0][i]);
 return {points,outer,normal,outside:edge[0]*reach[1]-edge[1]*reach[0]>=0};
}
 function toastRise(t,index=0){
 // Both slices start and finish fully below their slots; reduced motion still clears the rim.
 const start=.28+index*.13,end=2.28+index*.13,phase=Math.max(0,Math.min(1,(t-start)/(end-start)));
 return phase===0||phase===1?0:Math.sin(Math.PI*phase)**.85;
}
 function factoryMotion(t,base,power,mouth,window){
 const inside=.42,foot=(base===1?120:95)+(power===0?70:power===1?112:0);
 const rise=ease((t-1.15)/1.6),travel=ease((t-2.75)/.75),exit=ease((t-6.2)/.8);
 const high=mouth[1]-foot*inside-24,ground=47-foot*.78;
 return {x:window[0]+(326-window[0])*travel+450*exit,y:window[1]+(high-window[1])*rise+(ground-high)*travel-Math.sin(Math.PI*travel)*55,size:inside+(.78-inside)*travel,clear:t>=2.75,play:Math.max(0,t-3.5)};
}

return {get transformPoint(){return transformPoint},get anchoredPose(){return anchoredPose},get twoBone(){return twoBone},get segmentMatrix(){return segmentMatrix},get triangleMatrix(){return triangleMatrix},get railway(){return railway},get wheelPair(){return wheelPair},get suitcaseMotion(){return suitcaseMotion},get suitcaseShape(){return suitcaseShape},get suitcaseProject(){return suitcaseProject},get suitcaseOutline(){return suitcaseOutline},get suitcaseLidPoint(){return suitcaseLidPoint},get suitcaseLid(){return suitcaseLid},get toastRise(){return toastRise},get factoryMotion(){return factoryMotion}};
})();
offlineModules["flower-scene.js"]=(()=>{
const {flowerPose,flowerPoint,flowerScore,stemPoint,stemNormal,petalVertex}=offlineModules["flower-rig.js"];
const {anchoredPose,transformPoint,triangleMatrix}=offlineModules["rig.js"];
const ink='#173b48',TAU=Math.PI*2,faceDepth=32;
const solidAtlases=new WeakMap();
 function solidAtlas(image){
 if(solidAtlases.has(image))return solidAtlases.get(image);
 if(typeof document.createElement!=='function')return image;
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 // The generated painting has alpha 251–254 even inside solid petals. Make
 // those interiors opaque once, retaining the genuinely translucent edge pixels.
 // Otherwise mesh overlaps accumulate alpha into visible horizontal seams.
 for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]>=245)pixels.data[i]=255;
 ctx.putImageData(pixels,0,0);solidAtlases.set(image,canvas);return canvas;
}
 function group(c,x,y,a,draw,sx=1,sy=sx){c.save();c.translate(x,y);c.rotate(a);c.scale(sx,sy);draw();c.restore();}
 function oval(c,x,y,rx,ry,fill,edge=null,lw=2){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=lw;c.stroke();}}
 function curve(c,points,color,width){c.beginPath();c.moveTo(...points[0]);c.bezierCurveTo(...points[1],...points[2],...points[3]);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
 function draw(c,image,s,pose){group(c,pose.x,pose.y,pose.a||0,()=>c.drawImage(image,...s.rect,-pose.w/2,-pose.h/2,pose.w,pose.h));}
 function rooted(c,image,s,root,w,angle=0,length){const h=length??w*s.rect[3]/s.rect[2],pose=anchoredPose(s.points.root,root,w,h,s.rect,angle);draw(c,image,s,pose);}
 function petalSurfaces(s,petals){
 const [x,y,w,h]=s.rect,[rx,ry]=s.points.root,commands=[];
 for(const [layer,petal] of petals.entries()){
  const cuts=Array.from({length:9},(_,i)=>i*h/8);
  // Split exactly at the disc plane, so there is no depth pop through the face.
  for(let i=0;i<8;i++){let lo=cuts[i],hi=cuts[i+1],a=petalVertex(petal,(ry-lo)/ry,0).z-faceDepth,b=petalVertex(petal,(ry-hi)/ry,0).z-faceDepth;if(a*b<0){for(let j=0;j<18;j++){const mid=(lo+hi)/2,z=petalVertex(petal,(ry-mid)/ry,0).z-faceDepth;if(z*a>0)lo=mid;else hi=mid;}cuts.push((lo+hi)/2);}}
  cuts.sort((a,b)=>a-b);
  for(let i=0;i<cuts.length-1;i++){
   const top=cuts[i],bottom=cuts[i+1];if(bottom-top<.001)continue;
   const coords=[[0,top],[w,top],[w,bottom],[0,bottom]],points=coords.map(([u,v])=>petalVertex(petal,(ry-v)/ry,(u-rx)*80/w));
   commands.push({layer,z:points.reduce((n,p)=>n+p.z,0)/4,source:coords.map(([u,v])=>[x+u,y+v]),target:points.map(p=>[p.x,p.y])});
  }
 }
 return commands;
}
 function polygon(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();}
 function warp(c,image,source,target){
 for(const ids of [[0,1,2],[0,2,3]]){
  const a=ids.map(i=>source[i]),b=ids.map(i=>target[i]),center=[b.reduce((v,p)=>v+p[0],0)/3,b.reduce((v,p)=>v+p[1],0)/3];
  c.save();polygon(c,b.map(p=>{const d=Math.hypot(p[0]-center[0],p[1]-center[1])||1;return p.map((v,i)=>v+(v-center[i])/d*1.2);}));c.clip();c.transform(...triangleMatrix(a,b));c.drawImage(image,0,0);c.restore();
 }
}
 function stem(c,image,s,points){
 // One opaque curved shaft under the textured ribbon prevents joins exposing the background.
 curve(c,points,ink,23);curve(c,points,'#588d31',18);
 const [x,y,w,h]=s.rect,pad=Math.max(8,h*.08),N=20;
 for(let i=0;i<N;i++){
  const t=i/N,u=(i+1)/N,p=stemPoint(points,t),q=stemPoint(points,u),n=stemNormal(points,t),m=stemNormal(points,u);
  const half=11-1.5*t,next=11-1.5*u;
  const target=[[p[0]-n[0]*half,p[1]-n[1]*half],[p[0]+n[0]*half,p[1]+n[1]*half],[q[0]+m[0]*next,q[1]+m[1]*next],[q[0]-m[0]*next,q[1]-m[1]*next]];
  // Image is upright: the bottom of the texture is the base of the plant.
  const v=y+h-pad-t*(h-2*pad),z=y+h-pad-u*(h-2*pad);
  warp(c,image,[[x,v],[x+w,v],[x+w,z],[x,z]],target);
 }
}
 function face(c,p){
 const blinkPhase=p.clock%4.9,blink=blinkPhase<.16?Math.abs(blinkPhase/.08-1):1;
 const eyes=(p.bloom<.25?0:blink)*(1-p.anticipation*.8)*(1-Math.min(1,Math.abs(p.sneeze)*3))*(1-p.yawn*.85);
 const note=flowerScore.notes.concat(flowerScore.answer).reduce((v,t)=>Math.max(v,Math.max(0,1-Math.abs(p.t-t-.12)/.22)),0);
 const singing=p.active?(p.audioLevel??note)*p.music:0;
 for(const side of [-1,1]){
  const x=side*28,y=-15;
  const blush=c.createRadialGradient(x*1.9,18,2,x*1.9,18,20);blush.addColorStop(0,'#ec794f99');blush.addColorStop(1,'#ee8c5500');oval(c,x*1.9,18,20,14,blush);
  if(eyes<.24){curve(c,[[x-18,y],[x-9,y+10],[x+10,y+10],[x+18,y]],ink,4);}
  else {
   const eye=c.createLinearGradient(x-19,y-28,x+16,y+28);eye.addColorStop(0,'#fffdf0');eye.addColorStop(.65,'#fff5d6');eye.addColorStop(1,'#e6d0a2');
   oval(c,x,y,20,29*eyes,eye,'#815022',2.4);
   const px=x+p.look.x*6,py=y+4+p.look.y*5;
   c.save();c.beginPath();c.ellipse(x,y,18.8,27.8*eyes,0,0,TAU);c.clip();
   const iris=c.createRadialGradient(px-3,py-6,1,px,py,16);iris.addColorStop(0,'#457e94');iris.addColorStop(.7,'#174657');iris.addColorStop(1,'#102d3d');
   oval(c,px,py,11,17,iris,ink,1.5);oval(c,px,py+1,6.4,12,'#102334');oval(c,px-3.5,py-7,4.5,5.5,'#fff');oval(c,px+4,py+6,1.6,2,'#a3d9ec');c.restore();
   curve(c,[[x-19,y-6],[x-16,y-33*eyes],[x+12,y-34*eyes],[x+19,y-10]],'#7c491f',3.4);
  }
  const browY=-52-p.anticipation*5+(p.hiccup?side*6:0);
  curve(c,[[x-16,browY+5],[x-6,browY-8],[x+7,browY-8],[x+18,browY+2]],'#9c5d24',4.4);
 }
 const nose=c.createRadialGradient(-4,11,1,0,15,14);nose.addColorStop(0,'#fff0ac');nose.addColorStop(.4,'#efb841');nose.addColorStop(1,'#d89228');oval(c,0,14,12,8,nose);
 if(p.anticipation>.35||p.yawn>.15){oval(c,0,42,8+p.yawn*5,10+p.yawn*12,'#713c25','#8f5423',2);return;}
 if(p.hiccup>.3){curve(c,[[-22,42],[-8,40],[9,44],[24,41]],'#74401f',4);return;}
 const opening=.35+singing*.7+Math.abs(p.sneeze)*.8;
 c.beginPath();c.moveTo(-29,32);c.bezierCurveTo(-10,42,12,42,30,30);c.bezierCurveTo(25,45+30*opening,-20,58+30*opening,-29,32);c.closePath();
 const mouth=c.createLinearGradient(0,32,0,72);mouth.addColorStop(0,'#4a3028');mouth.addColorStop(1,'#9a432d');c.fillStyle=mouth;c.fill();c.strokeStyle='#8c501f';c.lineWidth=2.8;c.stroke();
 c.save();c.clip();oval(c,4,57+20*opening,19,10,'#ec8f61');curve(c,[[-24,35],[-6,45],[15,43],[25,34]],'#fff5cf',5);c.restore();
}
 function wing(c,x,y,angle,flap){
 group(c,x,y,angle,()=>{c.scale(.55+flap*.45,1);const g=c.createLinearGradient(-17,-55,14,0);g.addColorStop(0,'#effcffed');g.addColorStop(.5,'#a5ddebce');g.addColorStop(1,'#70b7cdcf');oval(c,0,-26,15,30,g,'#397b92',2);curve(c,[[0,1],[1,-14],[-3,-33],[0,-51]],'#f4feffb0',1.4);curve(c,[[0,-20],[7,-27],[10,-32],[10,-37]],'#f4feffb0',1.2);});
}
 function bee(c,p,image,s){
 group(c,p.x,p.y,p.a,()=>{
  wing(c,6,-12,-.5+p.flutter,p.wing);wing(c,14,-10,.46-p.flutter,1-p.wing*.55);
  for(const [x,y] of [[-7,22],[10,25],[25,20]]){const reach=8+p.land*9;curve(c,[[x,y-9],[x-3,y+7],[x-10,y+reach],[x-5,y+reach+2]],'#4d372b',3);}
  for(const [x,y,side] of [[-30,-20,-1],[-15,-24,1]]){const sway=p.flutter*35;curve(c,[[x,y],[x-2,y-14],[x+side*5+sway,y-24],[x+side*8+sway,y-27]],'#4d372b',2.8);oval(c,x+side*8+sway,y-27,4.2,4.2,'#865633','#4d372b',1.2);}
  const w=97,h=w*s.rect[3]/s.rect[2];draw(c,image,s,{x:0,y:0,w,h});
 });
}
 function note(c,x,y,angle,color){group(c,x,y,angle,()=>{oval(c,-3,4,7,5,color);curve(c,[[3,4],[3,-6],[3,-14],[3,-23]],color,3);curve(c,[[3,-23],[15,-17],[15,-11],[8,-9]],color,3);});}
 function accents(c,p,gag){
 if(!p.active)return;
 const beats=[...flowerScore.notes,...flowerScore.answer];
 beats.forEach((start,i)=>{const t=(p.t-start)/1.4;if(t<=0||t>=1)return;const side=i%2?-1:1,at=flowerPoint(p.head,[side*150,-60]);c.save();c.globalAlpha=Math.sin(t*Math.PI)*.85;note(c,at[0]+side*t*70*p.m,at[1]-t*85,side*.17,['#bf622f','#477f87','#b2872d'][i%3]);c.restore();});
 if(gag===1&&p.t>6.65&&p.t<7.85){const t=(p.t-6.65)/1.2,origin=flowerPoint(p.head,[55,20]);for(let i=0;i<(p.m<1?5:17);i++){const a=(i%7-3)*.18,speed=90+i*7;c.save();c.globalAlpha=Math.min(1,(1-t)*3);oval(c,origin[0]+Math.cos(a)*speed*t*p.m,origin[1]+Math.sin(a)*speed*t*p.m+t*t*50,2.5+i%3,2.5+i%3,'#f4ce50');c.restore();}}
}
 function flowerScene(c,a,s,preview,images,sprites){
 const original=images['flower-atlas-v1.png'],pot=sprites.flowerPot;
 if(!original||!pot)return;
 const image=solidAtlas(original);
 const w=264,h=w*pot.rect[3]/pot.rect[2],potPose=anchoredPose(pot.points.floor,[640,752],w,h,pot.rect);
 const root=transformPoint(pot.points.soil,potPose,pot.rect),p=flowerPose(a,s,preview,root);
 const shadow=c.createRadialGradient(640,748,5,640,748,130);shadow.addColorStop(0,'#58382348');shadow.addColorStop(1,'#58382300');oval(c,640,748,135,23,shadow);
 draw(c,image,pot,potPose);
 if(p.growth>.0001){
  // Leaf petioles disappear under the continuous stem, never beside it.
  for(const leaf of p.leaves)if(leaf.size>.001){curve(c,leaf.petiole,ink,11*leaf.size);curve(c,leaf.petiole,'#5e922b',7*leaf.size);curve(c,leaf.petiole,'#a8ba48',2*leaf.size);rooted(c,image,sprites.flowerLeaf,leaf.root,113*leaf.size,leaf.angle,174*leaf.size);}
  stem(c,image,sprites.flowerStem,p.stem);
  group(c,p.head.x,p.head.y,p.head.a,()=>{
   for(const side of [-1,1])rooted(c,image,sprites.flowerLeaf,[side*8,52],38,side*1.35,69);
   const surfaces=petalSurfaces(sprites.flowerPetal,p.petals);
   // Paint whole blades in a stable whorl. Only their overlap with the disc
   // changes depth; repainting front strips outside it would break other petals.
   for(const part of surfaces)warp(c,image,part.source,part.target);
   group(c,0,p.discLift,0,()=>{draw(c,image,sprites.flowerDisk,{x:0,y:0,w:160,h:160});face(c,p);},p.discSize);
   c.save();c.beginPath();c.arc(0,p.discLift,80*p.discSize,0,TAU);c.clip();
   for(const part of surfaces)if(part.z>=faceDepth)warp(c,image,part.source,part.target);
   c.restore();
  },p.head.sx,p.head.sy);
 }
 // Restore the original painted soil in front of the buried stem. An irregular
 // earth edge hides its round end without introducing flat, untextured patches.
 if(p.growth>.02){
  const reach=p.withdraw>0?110:24;c.save();polygon(c,[[-reach,0],[-13,-1],[-8,1],[-3,-2],[3,0],[8,-2],[14,1],[reach,-1],[reach,200],[-reach,200]].map(([x,y])=>[root[0]+x,root[1]+y]));c.clip();draw(c,image,pot,potPose);c.restore();
 }
 // Repaint ONLY the near rim and pot wall below its true inner ellipse.
 group(c,potPose.x,potPose.y,0,()=>{
  c.scale(w/pot.rect[2],h/pot.rect[3]);c.translate(-pot.rect[2]/2,-pot.rect[3]/2);
  const [cx,cy,rx,ry]=pot.mouth;c.beginPath();c.moveTo(-2000,cy);c.lineTo(cx-rx,cy);c.ellipse(cx,cy,rx,ry,0,Math.PI,0,true);c.lineTo(2000,cy);c.lineTo(2000,3000);c.lineTo(-2000,3000);c.closePath();c.clip();c.drawImage(image,...pot.rect,0,0,pot.rect[2],pot.rect[3]);
 });
 if(p.growth===0){oval(c,root[0],root[1]-4,10,6,'#bb8439','#795128',1.4);curve(c,[[root[0]-4,root[1]-6],[root[0],root[1]-8],[root[0]+3,root[1]-6],[root[0]+5,root[1]-5]],'#f1c77a',1.6);}
 if(p.seed)group(c,p.seed.x,p.seed.y,p.seed.a,()=>{oval(c,0,0,10,6,'#bb8439','#795128',1.4);curve(c,[[-4,-2],[0,-4],[3,-2],[5,-1]],'#f1c77a',1.6);});
 accents(c,p,a.gag||0);if(p.bee)bee(c,p.bee,image,sprites.beeBody);
}

return {get flowerScene(){return flowerScene}};
})();
offlineModules["bubbles-scene.js"]=(()=>{
const {bertaPose,bertaPoint}=offlineModules["bubbles-rig.js"];
const {triangleMatrix}=offlineModules["rig.js"];
const TAU=Math.PI*2,cache=new WeakMap(),lensCache=new WeakMap();
 function ellipse(c,x,y,rx,ry,fill,stroke,width=2,angle=0){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),angle,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 function prepare(image){
 if(cache.has(image))return cache.get(image);
 if(typeof document.createElement!=='function')return null;
 const base=document.createElement('canvas'),paint=document.createElement('canvas');base.width=paint.width=1254;base.height=paint.height=1254;
 const bc=base.getContext('2d');bc.drawImage(image,0,0,1254,1254);const pixels=bc.getImageData(0,0,1254,1254);for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i]>=245)pixels.data[i]=255;bc.putImageData(pixels,0,0);
 const value={base,paint,c:paint.getContext('2d')};cache.set(image,value);return value;
}
 function eye(c,center,pupil,rx,ry,p,side){
 const [x,y]=center,blink=Math.min(p.blink,side===1?1-p.wink*.98:1),angle=.26;
 c.save();c.beginPath();c.ellipse(x,y,rx,ry,angle,0,TAU);c.clip();
 const px=pupil[0]+p.look.x*18-side*p.cross*24,py=pupil[1]+p.look.y*17+p.cross*12;
 const iris=c.createRadialGradient(px-15,py-25,4,px,py,64);iris.addColorStop(0,'#4e9194');iris.addColorStop(.58,'#245961');iris.addColorStop(1,'#123740');
 ellipse(c,px,py,47,63,iris,'#1b4247',3,angle);ellipse(c,px+2,py+4,31,47,'#102e35',null,0,angle);ellipse(c,px-13,py-28,16,18,'#fff9df');ellipse(c,px+18,py+22,5,7,'#acd9d4');
 if(blink<.999){
  const lid=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);lid.addColorStop(0,'#d9ca42');lid.addColorStop(.55,'#b5ba32');lid.addColorStop(1,'#7d8e28');c.fillStyle=lid;
  const opening=ry*blink,bend=18*blink;c.save();c.translate(x,y);c.rotate(angle);
  c.beginPath();c.moveTo(-rx-20,-ry-20);c.lineTo(rx+20,-ry-20);c.lineTo(rx+20,-opening);c.quadraticCurveTo(0,-opening+bend,-rx-20,-opening);c.closePath();c.fill();
  c.beginPath();c.moveTo(-rx-20,ry+20);c.lineTo(rx+20,ry+20);c.lineTo(rx+20,opening);c.quadraticCurveTo(0,opening-bend*.4,-rx-20,opening);c.closePath();c.fill();
  c.strokeStyle='#405c2d';c.lineWidth=4;c.beginPath();c.moveTo(-rx-20,-opening);c.quadraticCurveTo(0,-opening+bend,rx+20,-opening);c.stroke();c.restore();
 }
 c.restore();
}
 function mouth(c,p){
 const u=p.purse,o=p.oh*(1-u),lerp=(a,b,h)=>a.map((v,i)=>(v+(h[i]-v)*o)*(1-u)+b[i]*u),open=85*p.laugh;
 const left=lerp([401,294],[614,382],[581,385]),right=lerp([864,369],[658,382],[691,385]),a=lerp([493,415],[618,361],[579,315]),b=lerp([742,449],[654,361],[692,315]),d=lerp([743,457+open],[656,405],[693,461]),e=lerp([483,423+open],[616,405],[579,461]);
 c.beginPath();c.moveTo(...left);c.bezierCurveTo(...a,...b,...right);c.bezierCurveTo(...d,...e,...left);c.closePath();
 const fill=c.createLinearGradient(630,360,630,490);fill.addColorStop(0,'#263e2b');fill.addColorStop(1,'#954c33');c.fillStyle=fill;c.fill();c.strokeStyle='#6c642c';c.lineWidth=5;c.stroke();
 c.save();c.clip();if(p.laugh>.05)ellipse(c,650,453+open*.6,60,17,'#db9870');if(u>.01)ellipse(c,629,400,15,5,'#e9c368');c.restore();
 if(u>.01){c.strokeStyle='#f9e398';c.globalAlpha=u;c.lineWidth=4;c.beginPath();c.ellipse(636,382,27,25,0,Math.PI*1.1,Math.PI*1.7);c.stroke();c.globalAlpha=1;}
}
 function triangle(c,image,from,to){
 // Offset every edge by a fixed distance. Radial vertex expansion leaves
 // subpixel gaps along the long edges of these very slender triangles.
 const normal=to.map((p,i)=>{const q=to[(i+1)%3],dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy);return [dy/length,-dx/length];});c.save();c.beginPath();
 to.forEach((p,i)=>{const a=normal[(i+2)%3],b=normal[i],scale=.85/(1+a[0]*b[0]+a[1]*b[1]),q=p.map((v,k)=>v+(a[k]+b[k])*scale);if(i)c.lineTo(...q);else c.moveTo(...q);});c.closePath();c.clip();c.transform(...triangleMatrix(from,to));c.drawImage(image,0,0);c.restore();
}
 function paintedActor(image,p){
 const prepared=prepare(image);let surface=image;
 if(prepared){const q=prepared.c;q.clearRect(0,0,1254,1254);q.drawImage(prepared.base,0,0);eye(q,[516,171],[534,187],71,81,p,-1);eye(q,[844,237],[823,250],69,81,p,1);mouth(q,p);surface=prepared.paint;}
 return surface;
}
 function actor(c,surface,p){const rows=28;for(let i=0;i<rows;i++){const y=i*1254/rows,z=(i+1)*1254/rows,source=[[0,y],[1254,y],[1254,z],[0,z]],target=source.map(v=>bertaPoint(v,p));for(const indices of [[0,1,2],[0,2,3]])triangle(c,surface,indices.map(k=>source[k]),indices.map(k=>target[k]));}}
 function bubble(c,p,clock,reduced){
 if(p.r<.1)return;
 const hue=p.hue||0,color=(offset,light,alpha)=>`hsla(${hue+offset},92%,${light}%,${alpha})`;
 if(p.pop>=0){const t=p.pop/.5;if(t>=1)return;const count=reduced?7:16;c.save();c.globalAlpha=1-t;for(let i=0;i<count;i++){const angle=i*TAU/count,spread=p.r+t*65,x=p.x+Math.cos(angle)*spread*(p.sx||1),y=p.y+Math.sin(angle)*spread*(p.sy||1)+t*t*48;ellipse(c,x,y,(4+i%3)*(1-t)+.5,(6+i%3)*(1-t)+.5,color(i*17,65,.8),'#fff9',.9,angle);}c.restore();return;}
 const r=p.r;c.save();c.translate(p.x,p.y);c.rotate(p.angle||0);c.scale(p.sx||1,(p.sy||1)*(1+Math.sin(clock*2.3+p.part)*.009*(reduced?.2:1)));
 const film=c.createRadialGradient(-r*.3,-r*.34,r*.08,0,0,r);film.addColorStop(0,color(20,83,.09));film.addColorStop(.48,color(0,60,.18));film.addColorStop(.8,color(0,57,.3));film.addColorStop(.94,color(25,62,.44));film.addColorStop(1,color(45,75,.55));
 const edge=c.createLinearGradient(-r,-r,r,r);edge.addColorStop(0,'#fffef6f2');edge.addColorStop(.24,color(0,65,.95));edge.addColorStop(.48,color(65,69,.9));edge.addColorStop(.7,color(170,75,.94));edge.addColorStop(1,color(270,68,.96));
 ellipse(c,0,0,r,r,film,color(0,25,.7),4.6);c.strokeStyle=edge;c.lineWidth=2.8;c.stroke();
 c.strokeStyle='#fffef2eb';c.lineWidth=Math.max(2,r*.024);c.lineCap='round';c.beginPath();c.arc(0,0,r*.88,Math.PI*1.07,Math.PI*1.48);c.stroke();
 c.strokeStyle=color(180,83,.72);c.lineWidth=Math.max(2,r*.016);c.beginPath();c.arc(0,0,r*.91,.05,1.2);c.stroke();ellipse(c,-r*.44,-r*.57,r*.1,r*.036,'#ffffffb8',null,0,-.6);c.restore();
}
 function bubblesScene(c,a,s,preview,images){
 const image=images['berta-base-v1.png'];if(!image)return;const p=bertaPose(a,s,preview);
 c.save();c.translate(600,735);c.scale(1,.09);const shadow=c.createRadialGradient(0,0,10,0,0,264);shadow.addColorStop(0,'#101c2270');shadow.addColorStop(1,'#101c2200');ellipse(c,0,0,264,264,shadow);c.restore();
 const surface=paintedActor(image,p);actor(c,surface,p);
 // Refraction replaces the complete view inside the membrane, including the
 // background. Painting a magnified actor over itself leaves a second silhouette.
 let view=null,matrix=null;if(p.bubbles.some(item=>item.lens>1&&item.pop<0)&&c.canvas&&typeof document.createElement==='function'){
  view=lensCache.get(c.canvas);if(!view){view=document.createElement('canvas');lensCache.set(c.canvas,view);}if(view.width!==c.canvas.width||view.height!==c.canvas.height){view.width=c.canvas.width;view.height=c.canvas.height;}view.getContext('2d').drawImage(c.canvas,0,0);matrix=c.getTransform();
 }
 for(const item of p.bubbles){
  if(view&&item.lens>1&&item.pop<0){c.save();c.beginPath();c.ellipse(item.x,item.y,item.r*.985,item.r*.985,0,0,TAU);c.clip();c.translate(item.x,item.y);c.scale(item.lens,item.lens);c.translate(-item.x,-item.y);c.drawImage(view,-matrix.e/matrix.a,-matrix.f/matrix.d,view.width/matrix.a,view.height/matrix.d);c.restore();}
  bubble(c,item,a.clock||0,s.reduced);
 }
}

return {get bubblesScene(){return bubblesScene}};
})();
offlineModules["scenes.js"]=(()=>{
const {clamp}=offlineModules["game-core.js"];
const {transformPoint,anchoredPose,twoBone,segmentMatrix,triangleMatrix,factoryMotion,toastRise}=offlineModules["rig.js"];
const {flowerScene}=offlineModules["flower-scene.js"];
const {bubblesScene}=offlineModules["bubbles-scene.js"];
const images={}, sprites={};
let loaded=false;
 function loadImage(file){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>{images[file]=im;resolve(im)};im.onerror=()=>reject(Error('No s’ha pogut carregar '+file));im.src=cincSrc(file);});}
let readyPromise=null;const ready=()=>readyPromise||(readyPromise=Promise.all([Promise.resolve(offlineSprites).then(s=>Object.assign(sprites,s)),...['robot-atlas.png','props-atlas.png','backgrounds.png','machine.png','garden-v1.png','flower-atlas-v1.png','pond-v1.png','berta-base-v1.png'].map(loadImage)]).then(()=>{loaded=true;}));
const TAU=Math.PI*2, ink='#173b48';
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=(v)=>{v=clamp(v);return v*v*(3-2*v)};
const seg=(t,a,b)=>smooth((t-a)/(b-a));
const back=t=>{t=clamp(t)-1;return 1+2.7*t*t*t+1.7*t*t};
 function group(c,x,y,a,fn,sx=1,sy=sx){c.save();c.translate(x,y);c.rotate(a);c.scale(sx,sy);fn();c.restore();}
 function sprite(c,name,x,y,w,h,angle=0,alpha=1){const s=sprites[name];if(!s||!images[s.file]||w<=0)return;h=h??w*s.rect[3]/s.rect[2];if(h<=0)return;group(c,x,y,angle,()=>{c.globalAlpha*=clamp(alpha);c.drawImage(images[s.file],...s.rect,-w/2,-h/2,w,h)});}
// Masks use coordinates in the original sprite, so their edges follow every pose.
 function polygon(c,points){c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();}
 function ovalPath(c,[x,y,rx,ry,a=0]){c.moveTo(x+Math.cos(a)*rx,y+Math.sin(a)*rx);c.ellipse(x,y,rx,ry,a,0,TAU);}
 function nearSocketClip(c,hole,axis){
 const [x,y,rx,ry,a=0]=hole;c.translate(x,y);c.rotate(a);c.beginPath();
 if(axis==='down'){
  c.moveTo(-2000,0);c.lineTo(-rx,0);c.ellipse(0,0,rx,ry,0,Math.PI,0,true);c.lineTo(2000,0);c.lineTo(2000,2000);c.lineTo(-2000,2000);
 }else if(axis==='right'){
  c.moveTo(0,-2000);c.lineTo(0,-ry);c.ellipse(0,0,rx,ry,0,-Math.PI/2,Math.PI/2);c.lineTo(0,2000);c.lineTo(2000,2000);c.lineTo(2000,-2000);
 }else{
  c.moveTo(0,2000);c.lineTo(0,ry);c.ellipse(0,0,rx,ry,0,Math.PI/2,Math.PI*1.5);c.lineTo(0,-2000);c.lineTo(-2000,-2000);c.lineTo(-2000,2000);
 }
 c.closePath();c.clip();c.rotate(-a);c.translate(-x,-y);
}
 function art(c,name,pose,layer='all'){
 const s=sprites[name],w=s.rect[2],h=s.rect[3];
 group(c,pose.x,pose.y,pose.a||0,()=>{
  c.scale(pose.w/w,pose.h/h);c.translate(-w/2,-h/2);
  // A recess is a solid, shaded surface. The atlas alpha is only the outer silhouette.
  if(layer==='all')for(const hole of Object.values(s.holes||{})){
   const [x,y,rx,ry]=hole,g=c.createLinearGradient(x-rx,y-ry,x+rx,y+ry);
   g.addColorStop(0,'#102f3c');g.addColorStop(.55,'#174b59');g.addColorStop(1,'#297b86');
   c.fillStyle=g;c.beginPath();ovalPath(c,[x,y,rx+2,ry+2,hole[4]||0]);c.fill();
  }
  if(layer==='front'){c.beginPath();polygon(c,s.front);c.clip();}
  // Only the near lip occludes an inserted shaft; the far lip stays behind it.
  if(layer==='shell')nearSocketClip(c,s.holes.socket,name.startsWith('boot')?'down':name==='handL'?'right':'left');
  if(layer.startsWith('rim:')){const key=layer.slice(4);if(key==='neck')nearSocketClip(c,s.holes[key],'down');c.beginPath();ovalPath(c,s.rims[key]);ovalPath(c,s.holes[key]);c.clip('evenodd');}
  // Medial half of the shoulder cup: the ball sits inside it, the arm exits outward.
  if(layer.startsWith('socket:')){const key=layer.slice(7);nearSocketClip(c,s.holes[key],key==='shoulderR'?'left':'right');c.beginPath();ovalPath(c,s.rims[key]);c.clip();}
  c.drawImage(images[s.file],...s.rect,0,0,w,h);
 });
}
 function attachment(name,key,pose){return transformPoint(sprites[name].points[key],pose,sprites[name].rect);}
 function attach(name,key,target,w,h,a=0){return anchoredPose(sprites[name].points[key],target,w,h,sprites[name].rect,a);}
 function masked(c,name,pose,trace,draw){
 const s=sprites[name],w=s.rect[2],h=s.rect[3];c.save();
 c.translate(pose.x,pose.y);c.rotate(pose.a||0);c.scale(pose.w/w,pose.h/h);c.translate(-w/2,-h/2);
 c.beginPath();trace(c);c.clip();
 c.translate(w/2,h/2);c.scale(w/pose.w,h/pose.h);c.rotate(-(pose.a||0));c.translate(-pose.x,-pose.y);draw();c.restore();
}
 function limb(c,name,from,to,width){const s=sprites[name];c.save();c.transform(...segmentMatrix(s.points.start,s.points.end,from,to,width/s.rect[2]));c.drawImage(images[s.file],...s.rect,0,0,s.rect[2],s.rect[3]);c.restore();}
// Only the painted shaft spans a bone. One separate pivot covers both shafts at the elbow.
 function armShaft(c,from,to,width){
 const s=sprites.arm;c.save();c.transform(...segmentMatrix([64,140],[64,262],from,to,width/s.rect[2]));
 c.drawImage(images[s.file],s.rect[0],s.rect[1]+126,s.rect[2],154,0,126,s.rect[2],154);c.restore();
}
 function elbowPivot(c,at,angle,width=32){
 const s=sprites.arm;group(c,...at,angle,()=>c.drawImage(images[s.file],s.rect[0],s.rect[1],148,132,-64*width/148,-67*width/148,width,132*width/148));
}
 function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fill();}
 function rr(c,x,y,w,h,r,fill,stroke=ink,lw=4){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
 function line(c,points,color,width=5){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
 function shadow(c,x,y,w,alpha=.17){ellipse(c,x,y,w,14,'rgba(24,48,54,'+alpha+')');}
 function star(c,x,y,r,angle=0,color='#ffcf62'){group(c,x,y,angle,()=>{c.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.44:r;i?c.lineTo(Math.cos(a)*d,Math.sin(a)*d):c.moveTo(Math.cos(a)*d,Math.sin(a)*d);}c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#c98438';c.lineWidth=2;c.stroke();});}
 function sparkles(c,x,y,t,strength=1){if(t<0||t>1)return;for(let i=0;i<9;i++){const a=i*2.4,d=(30+110*t)*(i%3*.3+.6);c.save();c.globalAlpha=(1-t)*strength;star(c,x+Math.cos(a)*d,y+Math.sin(a)*d+t*t*70,5+i%3*3,a+t);c.restore();}}
 function segment(c,asset,from,to,width){const dx=to[0]-from[0],dy=to[1]-from[1];sprite(c,asset,(from[0]+to[0])/2,(from[1]+to[1])/2,width,Math.hypot(dx,dy)+16,-Math.atan2(dx,dy));}
 function face(c,t,{look=0,surprise=0,joy=0}={}){
 const blink=t%4.7<.13?.12:1;const open=Math.max(blink,.2*surprise);
 for(const x of [-35,35]){
  ellipse(c,x,14,22,27*open,'#fffdf6');ellipse(c,x+look*7,16,10,16*open,ink);ellipse(c,x+look*7-3,10,3.5,4*open,'#fff');
  c.beginPath();c.moveTo(x-18,-19-surprise*8);c.quadraticCurveTo(x,-25-surprise*10-joy*4,x+17,-18-surprise*8);c.strokeStyle=ink;c.lineWidth=5;c.lineCap='round';c.stroke();
 }
 ellipse(c,-63,40,12,5,'#f69e6b77');ellipse(c,63,40,12,5,'#f69e6b77');
 if(surprise>.5)ellipse(c,0,56,11,14,ink);
 else{c.beginPath();c.moveTo(-24,48);c.quadraticCurveTo(0,68+joy*10,24,48);c.strokeStyle=ink;c.lineWidth=5;c.stroke();if(joy>.5){c.fillStyle=ink;c.fill();ellipse(c,2,60,11,5,'#f28c7a');}}
}
 function robot(c,x,y,size,t,opt={}){
 const m=opt.reduced?.18:1,count=opt.count??7,steps=opt.steps??5,e=opt.elapsed??2,busy=opt.busy??false,celebrate=opt.celebrate??false;
 const dance=celebrate?seg(e,1.6,2.2)*(1-seg(e,4.8,5.5)):0;
 const stumble=celebrate?seg(e,2.55,2.85)*(1-seg(e,3.35,3.85)):0;
 const bow=celebrate?seg(e,4.25,4.6)*(1-seg(e,4.95,5.45)):0;
 const wave=Math.max(opt.wave??0,dance),surprise=Math.max(opt.surprise??0,stumble);
 const bob=(Math.sin(t*2.4)*1.3+Math.abs(Math.sin(e*6))*8*dance)*m;
 const lean=(Math.sin(e*3.7)*.045*dance-.09*stumble+(opt.lean||0))*m;
 const thresholds=steps===3?[1,1,2,2,2,3]:steps===7?[1,2,3,4,5,6]:[1,2,3,4,4,5];
 const visible=n=>count>=thresholds[n];
 function part(n,draw){
  if(!visible(n))return;
  const fresh=busy&&count===thresholds[n],p=fresh?back(e/1.25):1,offset=(1-p)*m;
  group(c,n===5?0:(n%2?-330:330)*offset,n===5?-300*offset:-Math.sin(clamp(e/1.25)*Math.PI)*100*(fresh?m:0),n===5?offset*.6:offset*.25*(n%2?-1:1),()=>{if(fresh)c.globalAlpha*=seg(e,0,.18);draw();});
 }
 const torso={x:lean*75,y:-220-bob+bow*5*m,w:176,h:167,a:lean};
 const bootPoses=[-1,1].map(side=>attach(side<0?'bootL':'bootR','sole',[side*53+(side===1?stumble*28:0)*m,0],87,90,Math.sin(e*7+side)*dance*.045*m));
 const hips=[attachment('torso','hipL',torso),attachment('torso','hipR',torso)];
 const ankles=bootPoses.map((pose,i)=>attachment(i?'bootR':'bootL','insert',pose));
 shadow(c,x,y+4,91*size,.16);
 group(c,x,y,0,()=>{
  // A boot is a receptacle: rear shell, inserted leg, then the opaque cuff/forefoot.
  part(0,()=>bootPoses.forEach((pose,i)=>art(c,i?'bootR':'bootL',pose)));
  part(1,()=>hips.forEach((hip,i)=>limb(c,'leg',hip,ankles[i],32)));
  part(0,()=>bootPoses.forEach((pose,i)=>art(c,i?'bootR':'bootL',pose,'shell')));
  // The lower ends of the hip joints disappear inside the body shell.
  part(2,()=>art(c,'torso',torso));
  for(const side of [-1,1])part(side<0?3:4,()=>{
   const shoulder=attachment('torso',side<0?'shoulderL':'shoulderR',torso),waving=side>0?wave:wave*.3;
   const target=[side*(122+Math.sin(t*4)*waving*13*m),-146-bob-waving*160+Math.sin(t*7)*waving*8*m];
   const bones=twoBone(shoulder,target,57,58,-side),hand=side<0?'handL':'handR';
   const hp=sprites[hand].points,forearmAngle=Math.atan2(bones.end[1]-bones.elbow[1],bones.end[0]-bones.elbow[0]);
   const palmAngle=Math.atan2(hp.palm[1]-hp.socket[1],hp.palm[0]-hp.socket[0]);
   const handPose=attach(hand,'socket',bones.end,63,55,forearmAngle-palmAngle);
   // The wrist remains visible in the dark opening, with the painted cuff in front.
   art(c,hand,handPose);armShaft(c,shoulder,bones.elbow,29);armShaft(c,bones.elbow,bones.end,27);
   // The ball is between the rear cup and the medial front lip of the same socket.
   elbowPivot(c,shoulder,Math.atan2(bones.elbow[1]-shoulder[1],bones.elbow[0]-shoulder[0])-Math.PI/2,26);
   elbowPivot(c,bones.elbow,forearmAngle-Math.PI/2);art(c,hand,handPose,'shell');
  });
  part(2,()=>{art(c,'torso',torso,'socket:shoulderL');art(c,'torso',torso,'socket:shoulderR');});
  part(5,()=>{
   const neck=attachment('torso','neck',torso),a=lean+Math.sin(t*1.3)*.018*m+surprise*.055*m+bow*.08*m;
   group(c,...neck,lean,()=>{const g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,'#bb985e');g.addColorStop(.4,'#fff3ce');g.addColorStop(1,'#d0ab6d');rr(c,-15,-28,30,39,6,g,ink,2);});
   const headPose=attach('head','chin',[neck[0],neck[1]-14+bow*3*m],235,207,a);
   art(c,'head',headPose);group(c,headPose.x,headPose.y,a,()=>face(c,t,{look:opt.look??Math.sin(t*.55)*.5,surprise,joy:dance}));
  });
  part(2,()=>art(c,'torso',torso,'rim:neck'));
 },size);
}
 // Pim Pam 0.47.3: La caixa sorpresa (the box) was removed from the app; its scene, its lid and its scarf went with it.
 function steam(c,x,y,t,m){for(let i=0;i<3;i++){const p=(t*.7+i*.33)%1;c.save();c.globalAlpha=(1-p)*.6;c.beginPath();c.moveTo(x+p*10,y);c.bezierCurveTo(x-15*m,y-25*p,x+25*m,y-55*p,x,y-90*p);c.strokeStyle='#fff6da';c.lineWidth=6;c.lineCap='round';c.stroke();c.restore();}}
 function breadSlice(c,x,y,slope){
 group(c,x,y,0,()=>{
  // Bread plane follows the slot's diagonal; the short side face gives the crust thickness.
  c.transform(1,-slope,0,1,0,0);c.scale(.78,.9);
  const outline=()=>{c.moveTo(-34,0);c.quadraticCurveTo(-40,0,-40,-8);c.lineTo(-40,-51);c.bezierCurveTo(-55,-77,-32,-91,-15,-83);c.quadraticCurveTo(0,-91,15,-83);c.bezierCurveTo(32,-91,55,-77,40,-51);c.lineTo(40,-8);c.quadraticCurveTo(40,0,34,0);c.closePath();};
  c.save();c.translate(5,2);c.beginPath();outline();c.fillStyle='#a86231';c.fill();c.strokeStyle=ink;c.lineWidth=2.5;c.stroke();c.restore();
  const crust=c.createLinearGradient(-40,-80,40,0);crust.addColorStop(0,'#ffd68a');crust.addColorStop(.4,'#e8a452');crust.addColorStop(1,'#ba6e33');
  c.beginPath();outline();c.fillStyle=crust;c.fill();c.strokeStyle=ink;c.lineWidth=2.5;c.stroke();
  c.save();c.translate(0,-7);c.scale(.8,.82);c.beginPath();outline();const crumb=c.createLinearGradient(0,-85,0,0);crumb.addColorStop(0,'#fff3c9');crumb.addColorStop(.65,'#f9d996');crumb.addColorStop(1,'#edc27b');c.fillStyle=crumb;c.fill();c.restore();
  for(const [px,py,r] of [[-18,-56,2],[12,-66,1.7],[23,-38,2],[-5,-25,1.5],[-24,-14,1.2],[5,-48,1.3]])ellipse(c,px,py,r,r*.6,'#d6a45c66');
 });
}
 function toaster(c,t,m){
 const s=sprites.toaster;
 group(c,0,0,0,()=>{
  c.scale(205/s.rect[2],190/s.rect[3]);c.translate(-s.rect[2]/2,-s.rect[3]/2);
  c.drawImage(images[s.file],...s.rect,0,0,s.rect[2],s.rect[3]);
  // Each front lip clips its own slice; rear slice is behind the nearer one.
  for(const [i,x,y,slope] of [[0,129,29,.32],[1,174,40,.34]]){
   const rise=toastRise(t,i),bottom=y+103-(106+130*m)*rise;
   if(!rise)continue;
   c.save();c.beginPath();c.moveTo(-400,-700);c.lineTo(700,-700);c.lineTo(700,y-(700-x)*slope-.7);c.lineTo(-400,y-(-400-x)*slope-.7);c.closePath();c.clip();
   breadSlice(c,x,bottom,slope);c.restore();
  }
 });
}
 function invention(c,base,power,x,y,t,size,m){
 const p=clamp(t/3.2),bottom=base===1?120:95,bounce=power===0?Math.abs(Math.sin(p*Math.PI*4))*(1-p*.45):0;
 const hover=power===2?Math.sin(p*Math.PI)*90:0,travel=power===1?Math.sin(p*Math.PI*2)*85*m:0;
 const tilt=power===1?Math.sin(p*Math.PI*3)*.1*m:Math.sin(p*12)*.04*m;
 group(c,x+travel,y-bounce*90*m-hover*m,tilt,()=>{
  if(power===0){sprite(c,'spring',0,bottom+35,100,70+bounce*45);ellipse(c,0,bottom+2,31,6,'#1a576455');}
  if(power===1){sprite(c,'skate',0,bottom+47,180,130);ellipse(c,0,bottom+2,35,7,'#1a576455');}
  if(power===2){
   const top=base===1?-110:base===0?-82:-78,mount=[0,top-14];
   line(c,[[0,top+6],[0,top-10]],ink,10);line(c,[[0,top+6],[0,top-10]],'#e9be6b',6);
   ellipse(c,...mount,9,10,ink);ellipse(c,...mount,6,7,'#f7d781');
   art(c,'umbrella',attach('umbrella','grip',mount,240,234,Math.sin(p*10)*.035*m));
  }
  if(power!==2){const collar=c.createLinearGradient(0,bottom-13,0,bottom+8);collar.addColorStop(0,'#fff2c6');collar.addColorStop(.55,'#efc16b');collar.addColorStop(1,'#bb7d3e');rr(c,-23,bottom-13,46,21,8,collar,ink,2);}
  if(base===2)toaster(c,t,m);else sprite(c,['teapot','clock'][base],0,0,205,base===1?240:190);
  if(base===0)steam(c,-80,-73,t,m);
  if(base===1)for(const side of [-1,1])line(c,[[side*92,-95],[side*(100+Math.sin(t*25)*6),-114]],'#df853d',4);
 },size);
}
 function funnelSpace(c){
 c.moveTo(-1500,-1500);c.lineTo(2500,-1500);c.lineTo(2500,88);c.lineTo(929,88);
 c.bezierCurveTo(868,125,720,146,591,146);c.bezierCurveTo(500,146,350,133,255,91);c.lineTo(-1500,91);c.closePath();
}
 function glassSpace(c){
 c.moveTo(280,518);c.lineTo(808,530);c.bezierCurveTo(865,530,887,556,887,608);c.lineTo(887,746);
 c.bezierCurveTo(887,792,872,817,834,814);c.lineTo(284,795);c.bezierCurveTo(244,793,225,780,225,739);c.lineTo(225,579);c.bezierCurveTo(225,535,245,518,280,518);c.closePath();
}
 function machineWindow(c,pose,draw){
 masked(c,'machine',pose,glassSpace,()=>{
  const at=attachment('machine','window',pose),g=c.createLinearGradient(0,at[1]-65,0,at[1]+65);
  g.addColorStop(0,'#eed5a7');g.addColorStop(.6,'#fff0cf');g.addColorStop(1,'#dabb88');
  c.fillStyle=g;c.fillRect(-200,at[1]-100,400,200);draw();
  // Glass highlights are above the solid object, clipped to the exact curved pane.
  line(c,[[-137,at[1]-14],[-87,at[1]-65]],'#ffffff55',11);line(c,[[75,at[1]+65],[135,at[1]-8]],'#ffffff3a',13);
 });
}
 function factoryScene(c,a,s,preview){
 const m=s.reduced?.18:1,t=preview?4.2:a.elapsed,active=a.phase==='effect'||preview,working=a.busy&&!s.reduced;
 robot(c,234,692,.7,a.clock,{reduced:s.reduced,look:1,wave:active?.7:0,surprise:active&&t<2?1:0});
 const machinePose={x:0,y:-173,w:450,h:435},mouth=attachment('machine','mouth',machinePose),window=attachment('machine','window',machinePose);
 const base=preview?0:a.choice[0],power=preview?0:a.choice[1];
 const motion=active?factoryMotion(t,base,power,mouth,window):null;
 const drawInvention=()=>invention(c,base,power,motion.x,motion.y,motion.play,motion.size,m);
 const insideBase=(x,y)=>sprite(c,['teapot','clock','toaster'][base],x,y,205*.42,(base===1?240:190)*.42);
 const inputY=mix(mouth[1]-140,window[1],seg(t,.05,1.25));
 shadow(c,674,690,210,.15);
 group(c,674,643,working?Math.sin(a.clock*30)*.006*(1-seg(t,.75,1.15)):0,()=>{
  if(active&&motion.clear)shadow(c,motion.x,50,73,.12);
  art(c,'machine',machinePose);
  // The same opaque object travels through two visible apertures; the housing occludes the gap.
  masked(c,'machine',machinePose,funnelSpace,()=>{
   if(a.phase==='build')insideBase(window[0],inputY);
   if(active&&t<1.15)sprite(c,['spring','skate','umbrella'][power],mouth[0],mouth[1]-130+250*seg(t,.05,.85),80);
   if(active&&t>=1.15&&!motion.clear)drawInvention();
  });
  machineWindow(c,machinePose,()=>{
   if(a.phase==='build')insideBase(window[0],inputY);
   else if(active&&t>=1.15&&!motion.clear)drawInvention();
   else if((active&&t<1.15)||(!active&&a.choice.length))insideBase(...window);
   else if(!active)star(c,...window,24,.1,'#ffd267');
   if(active&&t>.65&&t<1.15)sparkles(c,...window,(t-.65)/.5,m);
  });
  if(working){const i=Math.floor(a.clock*7)%5;ellipse(c,-137+i*36,-50+i*2.6,9,11,'#fff5b5aa');}
  // Depth changes only once the lowest part has cleared the funnel rim.
  if(active&&motion.clear)drawInvention();
  if(active)sparkles(c,motion.x,motion.y,(t-2.75)/.6,m);
 });
}
 function robotScene(c,a,s,preview){robot(c,640,701,1.12,a.clock,{reduced:s.reduced,count:preview?s.steps:a.part,steps:s.steps,elapsed:preview?4:a.elapsed,busy:!preview&&a.busy,celebrate:!preview&&a.part===s.steps&&a.busy,wave:preview?.7:0});if(a.part===s.steps&&a.busy)sparkles(c,640,306,(a.elapsed-4.4)/1.1,s.reduced?.15:1);if(!a.part&&!preview){for(const [n,x,y,w] of [['bootL',460,660,84],['bootR',590,660,84],['torso',795,630,110],['head',940,615,120]])sprite(c,n,x,y,w);}}
const scene={robot:robotScene,factory:factoryScene,flower:(c,a,s,preview)=>flowerScene(c,a,s,preview,images,sprites),bubbles:(c,a,s,preview)=>bubblesScene(c,a,s,preview,images)};
// Pim Pam 0.37: draws on the app's canvas (c is already scaled to CSS pixels, w × h). The scene of 1280 × 800 fills the screen: it
// is enlarged to cover it, cutting at most a quarter of the picture at the edges; where it cannot cover (a tall screen) the rest is
// the base colour. What is cut is cut more from the sky than from the floor, where the figures stand (the flower, which grows to the top, is centred). The decor follows «Presentació del decorat» like every other activity: complete, veiled over the base colour by
// «Visibilitat del decorat», or none (only the figures, on black or white).
 function paintScene(c,w,h,a,s,preview=false){
 c.save();c.fillStyle=s.base==='white'?'#fff':'#000';c.fillRect(0,0,w,h);
 if(!loaded){c.restore();return false;}
 const cover=Math.max(w/1280,h/800),fit=Math.min(w/1280,h/800),scale=preview?cover:Math.min(cover,fit*1.34),ox=(w-1280*scale)/2,oy=(h-800*scale)*(preview||a.id==='flower'?.5:.75);
 c.translate(ox,oy);c.scale(scale,scale);c.beginPath();c.rect(0,0,1280,800);c.clip();
 const mode=preview?'full':s.background,bg=images['backgrounds.png'],idx=({robot:1,factory:3})[a.id],bw=bg.width/2,bh=bg.height/2;
 if(mode!=='none'){c.save();c.globalAlpha=mode==='full'?1:Math.max(0,Math.min(1,(s.opacity??25)/100));if(['flower','bubbles'].includes(a.id))c.drawImage(images[{flower:'garden-v1.png',bubbles:'pond-v1.png'}[a.id]],0,0,1280,800);else c.drawImage(bg,(idx%2)*bw,Math.floor(idx/2)*bh,bw,bh,0,0,1280,800);c.restore();}
 scene[a.id](c,a,s,preview);c.restore();return true;
}
 function paintIcon(c,w,h,name){if(!loaded)return false;const s=sprites[name];if(!s)return false;const ratio=Math.min(w*.84/s.rect[2],h*.84/s.rect[3]);sprite(c,name,w/2,h/2,s.rect[2]*ratio,s.rect[3]*ratio);return true;}


return {get loaded(){return loaded},get ready(){return ready},get paintScene(){return paintScene},get paintIcon(){return paintIcon}};
})();
return {Activity:offlineModules["game-core.js"].Activity,flowerScore:offlineModules["flower-rig.js"].flowerScore,bubbleScore:offlineModules["bubbles-rig.js"].bubbleScore,bubbleGags:offlineModules["bubbles-rig.js"].bubbleGags,bubbleTime:offlineModules["bubbles-rig.js"].bubbleTime,flowerGags:offlineModules["game-core.js"].flowerGags,scenes:offlineModules["scenes.js"]};
})();
// ---------- The five activities in the app ----------
// Their ids in Pim Pam (the ids of ChatGPT's file, box, robot, flower and bubbles, were taken or had been used by other activities).
const CINC_INNER=Object.freeze({robotbuild:'robot',flora:'flower',frog:'bubbles',inventions:'factory'});
export const isCinc=id=>Object.prototype.hasOwnProperty.call(CINC_INNER,id);
const cincItem=(id,code,name,desc,kind,level,tag,extra={})=>Object.freeze({id,code,name,desc,kind,continuous:false,type:'ce',level,tag,time:'Al teu ritme',cinc:true,recorded:true,...extra});
export const CINC_CAUSES=Object.freeze([
 cincItem('robotbuild','CE40','Muntem el robot','Les peces d’un robot escampades per una habitació de joguines. Cada pulsació hi encaixa una peça (les botes, les cames, el cos, els braços i el cap). A la darrera el robot es posa dret, fa una ensopegada i ho celebra. La ronda següent es torna a muntar.','sequence','03 · Pas a pas','3, 5 o 7 peces'),
 cincItem('flora','CE41','La flor musical','Una llavor en un test, en un jardí mediterrani. Cada pulsació fa créixer la Flora una mica més. Quan s’obre del tot, canta un concert i un borinot hi vol participar: un duet, un esternut musical o una nota entremaliada. Després de tres concerts, la flor torna a ser llavor.','sequence','03 · Pas a pas','3, 5 o 7 passos · 3 concerts'),
 cincItem('frog','CE42','La granota bombollaire','La Berta, una granota vora un estany. Mentre mantens premut el commutador bufa una bombolla, i com més estona, més grossa; en deixar-lo anar, la bombolla vola i fa una entremaliadura: el nas de pallassa, la lupa entremaliada, el bigoti que esternuda, la bombolla xiclet, un atac de singlot, el barret que cau i, per acabar, la gran traca de colors, amb una nota a cada bombolla que esclata.','hold','01 · Descobrir','7 entremaliadures · mantenir i deixar anar'),
]);
// Each activity uses its own one of ChatGPT's four boings, as in its file.
const CINC_BOING=Object.freeze({robot:1,factory:2,flower:3,bubbles:4});
const cincNow=()=>typeof performance!=='undefined'?performance.now()/1000:0;

// A game of the four cause activities: ChatGPT's Activity (the phases, the steps, the clock and the cues), with the settings of the app.
export function cincStart(game,s){const cues=[];const a=new CINC.Activity(CINC_INNER[game.item.id],s,cue=>cues.push(cue));game.cinc=a;game.cincCues=cues;game.wait=ESC_WAIT_START;game.count=0;game.completed=0;return a;}
// While the effect runs the switch is blocked (nothing is kept for later), except: the second press that lets the bubble go with
// «Una pulsació inicia · la següent atura», and, with «Espera que acabi cada efecte» off, a press that starts the next effect.
export function cincBlocked(game,s){const a=game?.cinc;if(!a||!a.busy)return false;if(a.phase==='inflate')return s.interaction!=='toggle';if(s.lock)return true;
 if(a.id==='bubbles')return a.phase!=='effect';return a.part>=s.steps;}
export function cincPress(game,s,now=cincNow()){const a=game?.cinc;if(!a)return false;a.settings=s;
 if(a.phase==='inflate'){if(s.interaction!=='toggle')return false;a.release(0);return true;}
 if(!a.press(0))return false;game.wait=escWaitTurn(game.wait??ESC_WAIT_START,'run',now);game.count=cincCount(a,s);return true;}
// The frog: letting go of the switch (with «Mentre premo» and «Efecte complet»; a click is a press and a release, the smallest bubble).
export function cincRelease(game){const a=game?.cinc;if(!a||a.phase!=='inflate'||!a.release(0))return false;return true;}
export function cincReleasing(game,s){return !!game?.cinc&&game.cinc.phase==='inflate'&&s.interaction!=='toggle';}
function cincCount(a,s){return a.id==='robot'||a.id==='flower'?a.part:a.id==='bubbles'?(a.busy?a.gag+1:a.round):a.round;}
// A change of the steps starts the robot and the flower again (as in ChatGPT's file).
export function cincReset(game,s){const a=game?.cinc;if(!a||!['robot','flower'].includes(a.id))return;a.part=0;a.fromPart=0;a.phase='ready';a.elapsed=0;a.cues.clear();game.count=0;game.wait=escWaitTurn(game.wait??ESC_WAIT_START,'wait',cincNow());}
export function cincTick(game,s,dt,now=cincNow()){const a=game?.cinc;if(!a)return;a.settings=s;const was=a.busy;a.tick(dt);
 // «Escena aturada i enfosquida quan toca prémer» (waitCue): when an effect ends the scene slows to a stop and darkens until the next
 // press, as in the other step-by-step activities; the clock of the gestures at rest (blinks, breathing, swaying) is that waiting clock.
 if(was&&!a.busy){game.wait=escWaitTurn(game.wait??ESC_WAIT_START,'wait',now);if(a.id==='flower'&&a.part===0||a.id==='robot'&&a.part===s.steps||a.id==='bubbles'&&a.round===0)game.completed=(game.completed||0)+1;}
 if(s.waitCue!==false)a.clock=escWaitClock(game.wait||ESC_WAIT_START,now).idle;
 game.count=cincCount(a,s);}
// The state of the game for the screen readers and the progress bar.
export function cincStatus(game,s){const a=game?.cinc;if(!a)return '';
 if(a.id==='robot')return a.busy?(a.part===s.steps?'El robot ja està muntat.':'Una peça més.'):`${a.part} de ${s.steps} peces.`;
 if(a.id==='flower')return a.busy?(a.part===s.steps?CINC.flowerGags[a.gag]+'.':'La flor creix.'):`${a.part} de ${s.steps} passos.`;
 return a.phase==='inflate'?'La bombolla creix.':a.busy?CINC.bubbleGags[a.gag].name+'.':'Bufa una bombolla.';}
export function cincProgress(game,s){const a=game?.cinc;if(!a)return '';const dots=(n,d)=>Array.from({length:n},(_,i)=>`<span class="${i<d?'done':''}"></span>`).join('');
 if(a.id==='robot'||a.id==='flower')return dots(s.steps,a.part);
 const n=CINC.bubbleScore.count,i=a.busy?a.gag+1:a.round;return dots(n,i);}

// ---------- La fàbrica dels disbarats (EN24): the scanning of the app ----------
// Two choices, the thing and then what it gets; each choice is a picture of ChatGPT's file. With «Opcions de contingut» at two, which
// two show changes from round to round (they keep their order); at three or four, the three.
export const CINC_BASES=Object.freeze([['teapot','Tetera'],['clock','Rellotge'],['toaster','Torradora']]);
export const CINC_POWERS=Object.freeze([['spring','Molla'],['skate','Patins'],['umbrella','Paraigua']]);
export function cincFactoryOptions(stage,round,n){const list=stage?CINC_POWERS:CINC_BASES,k=Math.min(3,Math.max(2,n||3)),keep=new Set(Array.from({length:k},(_,i)=>(round+stage+i)%3));
 return list.map(([id,word],i)=>({id,label:word,kind:stage?'cinc-power':'cinc-base',value:i,color:null})).filter(x=>keep.has(x.value));}
// The times of ChatGPT's factory: the thing goes into the machine (1.4 s); the invention comes out and plays (7 s).
export const CINC_FACTORY_STEP=1.4,CINC_FACTORY_FINAL=7;
function factoryState(game,s,preview,now){if(preview)return {id:'factory',clock:2,busy:false,phase:'choose',gag:0,part:0,elapsed:0,choice:[]};
 const st=game.scanState,running=game.time!==null,list=(st?.pending?.correct?[...st.picks,st.pending.option]:st?.picks||[]).map(o=>o.value);
 const o=game.cincFactory||(game.cincFactory={id:'factory'});
 return Object.assign(o,{phase:!running?'choose':list.length>=2?'effect':'build',choice:list,elapsed:running?game.time:0,duration:game.duration||CINC_FACTORY_FINAL,busy:running,clock:s.reduced?0:now});}
// Before the start of the scanning («Inici de l’encercament» manual), the factory waits dark like On anem? and Detectius de sons.
function factoryDark(game,s,preview,now){if(preview||s.waitCue===false||!game?.scanState)return 0;const armed=!!game.scanState.armed;
 if(game.cincArmed!==armed){game.cincArmed=armed;game.cincFactoryWait=escWaitTurn(game.cincFactoryWait??ESC_WAIT_START,armed?'run':'wait',now);}
 return escWaitClock(game.cincFactoryWait||ESC_WAIT_START,now).dark;}

// ---------- Drawing ----------
export function cincLoaded(){return CINC.scenes.loaded;}
export function cincReady(){return CINC.scenes.ready();}
const CINC_PREVIEW={robot:{},flower:{},bubbles:{}};
export function cincRender(c,w,h,id,game,s,preview=false){const inner=CINC_INNER[id];if(!inner)return false;const sc=CINC.scenes,now=cincNow();
 if(!sc.loaded){sc.ready().catch(()=>{});c.fillStyle=s.base==='white'?'#fff':'#000';c.fillRect(0,0,w,h);return true;}
 let a,dark=0;
 if(inner==='factory'){a=factoryState(game,s,preview,now);dark=factoryDark(game,s,preview,now);}
 else if(preview||!game?.cinc)a={id:inner,clock:2,busy:false,phase:'ready',gag:0,part:s.steps,elapsed:0,choice:[],round:0,...CINC_PREVIEW[inner]};
 else{a=game.cinc;if(s.waitCue!==false)dark=escWaitClock(game.wait||ESC_WAIT_START,now).dark;}
 sc.paintScene(c,w,h,a,s,preview);
 if(dark>.002){c.save();c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle=`rgba(3,5,14,${dark.toFixed(3)})`;c.fillRect(0,0,w,h);c.restore();}
 return true;}
// The picture of an option of the factory, on its card.
export function cincToken(c,w,h,option){const name=(option.kind==='cinc-power'?CINC_POWERS:CINC_BASES)[option.value]?.[0];if(!name)return false;c.save();const ok=CINC.scenes.paintIcon(c,w,h,name);c.restore();return ok;}

// ---------- Sound ----------
// ChatGPT's sounds (its music, the voices of the Flora and the Berta, the bee, the breath, the pops and its four boings) are in the
// sample bank cincRec, embedded and decoded with the other recordings. The synthetic beeps of its file are recorded sounds here: the
// pop of the lid is the puff of El mag desastrós, the clicks are the claves, the twinkle is the glockenspiel and the notes of the last
// bubbles are the marimba. Everything goes through a gentle compressor (as in ChatGPT's file) to the volume of the app.
const CINC_LEVELS=new WeakMap();
function cincLevel(b){let v=CINC_LEVELS.get(b);if(v!==undefined)return v;let peak=0,sum=0,n=0;for(let ch=0;ch<b.numberOfChannels;ch++){const d=b.getChannelData(ch);for(let i=0;i<d.length;i+=2){const x=d[i];if(Math.abs(x)>peak)peak=Math.abs(x);sum+=x*x;n++;}}
 v=Math.min(2.5,.85/Math.max(peak,.01),.18/Math.max(Math.sqrt(sum/Math.max(1,n)),.015));CINC_LEVELS.set(b,v);return v;}
let CINC_BUS=null;
class CincSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();const k=ctx.createDynamicsCompressor();k.threshold.value=-18;k.ratio.value=5;this.input.gain.value=1.09;this.input.connect(k);k.connect(out);this.active=new Set();this.layers=new Map();}
 zone(name){const z=sampleZone('cincRec',0,name);return z&&z.buffer?z:null;}
 source(buffer,level,when=0,rate=1,offset=0){const c=this.context,o=c.createBufferSource(),g=c.createGain();o.buffer=buffer;o.playbackRate.value=rate;g.gain.value=level;o.connect(g);g.connect(this.input);o.start(c.currentTime+when,Math.max(0,offset));this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();};}
 named(name,level=1){const z=this.zone(name);if(z)this.source(z.buffer,cincLevel(z.buffer)*level,0,1,(z.offset||0)+z.shift);}
 bank(inst,name,level=1,when=0){const z=sampleZone(inst,0,name);if(z?.buffer)this.source(z.buffer,cincLevel(z.buffer)*level,when,1,(z.offset||0)+z.shift);}
 note(inst,midi,level=1,when=0){const z=sampleZone(inst,midi);if(!z?.buffer)return;this.source(z.buffer,cincLevel(z.buffer)*level,when,2**((midi-z.midi-(z.tune||0)/100)/12),(z.offset||0)+z.shift);}
 stopLayer(key){const layer=this.layers.get(key);if(layer){try{layer.source.stop();}catch{}layer.source.disconnect();layer.gain.disconnect();layer.panner.disconnect();this.layers.delete(key);}}
 // A long recording (the concert, the bee, the breath, the replies of the Berta) follows the clock of the activity: after a pause or a
 // late decoding it starts again where the scene is, never from the beginning.
 layer(key,name,offset,level,loop=false,pan=0){const z=this.zone(name);if(!z)return;const item={buffer:z.buffer,level:cincLevel(z.buffer)},shift=(z.offset||0)+z.shift,length=item.buffer.duration-shift;
  let old=this.layers.get(key);const c=this.context;
  if(offset<0||(!loop&&offset>=length)){this.stopLayer(key);return;}
  if(old&&(old.name!==name||Math.abs(old.offset+(c.currentTime-old.started)-offset)>.22)){this.stopLayer(key);old=null;}
  if(!old){const source=c.createBufferSource(),gain=c.createGain(),panner=c.createStereoPanner();source.buffer=item.buffer;source.loop=loop;if(loop){source.loopStart=shift;source.loopEnd=item.buffer.duration;}gain.gain.value=0;panner.pan.value=pan;source.connect(gain);gain.connect(panner);panner.connect(this.input);source.start(0,shift+(loop?offset%length:offset));old={source,gain,panner,name,offset,started:c.currentTime,buffer:item.buffer,shift};this.layers.set(key,old);source.onended=()=>{if(this.layers.get(key)===old)this.layers.delete(key);source.disconnect();gain.disconnect();panner.disconnect();};}
  old.gain.gain.setTargetAtTime(level*item.level,c.currentTime,.035);old.panner.pan.setTargetAtTime(pan,c.currentTime,.05);}
 energy(key){const l=this.layers.get(key);if(!l)return 0;const b=l.buffer,data=b.getChannelData(0),at=l.offset+(this.context.currentTime-l.started),start=Math.floor((at+l.shift)*b.sampleRate);let sum=0,n=0;for(let i=start;i<Math.min(start+900,data.length);i+=8){sum+=data[i]*data[i];n++;}return n?Math.min(1,Math.sqrt(sum/n)*cincLevel(b)*5):0;}
 sync(a,s){
  if(a.id==='bubbles'){this.syncBubbles(a,s);return;}this.stopLayer('breath');
  if(a.id!=='flower'||!a.busy||a.part!==s.steps){this.stopLayer('music');this.stopLayer('bee');a.musicEnergy=undefined;return;}
  const e=a.elapsed,concert=a.concertDuration||12,curtain=e>=concert&&a.gag===2,at=curtain?e-concert:e,name=curtain?'flora-curtain-v1':'flora-concert-'+a.gag;
  const duck=!curtain&&a.gag!==0&&e>6.35&&e<7.8?.48:1;
  this.layer('music',name,at,1.8*duck);a.musicEnergy=(a.musicEnergy||0)*.62+this.energy('music')*.38;
  const end=a.gag===2?concert+7.6:11.85;
  if(e>3&&e<end){const fade=Math.min(1,(e-3)/.6,(end-e)/.5),land=curtain&&at>1.8&&at<4.9;this.layer('bee','flora-bee-v1',e-3,(land?.035:.14)*Math.max(0,fade),true,.25);}else this.stopLayer('bee');}
 syncBubbles(a){const S=CINC.bubbleScore;this.stopLayer('bee');
  if(!a.busy){this.stopLayer('music');this.stopLayer('breath');return;}
  if(a.phase==='inflate'){this.stopLayer('music');this.layer('breath','berta-breath-v1',a.elapsed,.55+Math.min(1,a.elapsed/2.8)*.15,true,.1);return;}
  this.stopLayer('breath');const coda=a.gag===S.last&&a.elapsed>=a.sceneDuration,at=coda?a.elapsed-a.sceneDuration:a.elapsed,t=CINC.bubbleTime(a);
  const duck=S.sounds[a.gag].some(([cue])=>t>cue-.12&&t<cue+1.25)?.38:1,end=coda?S.coda:S.length,fade=Math.min(1,Math.max(0,(end-at)/.5));
  this.layer('music',coda?'berta-finale-v2':'berta-reply-'+a.gag,at,1.65*duck*fade);}
 play(cue,inner){
  if(cue.startsWith('flora-')){const key={'flora-grow':'flora-grow-v1','flora-sneeze':'flora-sneeze-v1','flora-hiccup':'flora-hiccup-v1'}[cue];if(key)this.named(key,.8);return;}
  if(cue.startsWith('berta-note-')){this.named('berta-pop-v1',.6);this.note('marimbaRec',[65,67,69,70,72,74,77,84][+cue.slice(11)]||72,.42);return;}
  if(cue.startsWith('berta-')){const key={'berta-pop':'berta-pop-v1','berta-croak':'berta-croak-v1','berta-tickle':'berta-tickle-v1','berta-sneeze':'berta-sneeze-v2','berta-stretch':'berta-stretch-v2','berta-hiccup':'berta-hiccup-v2'}[cue];if(key)this.named(key,cue==='berta-pop'?.7:1);return;}
  if(cue==='boing')this.named('boing-'+(CINC_BOING[inner]%4),.75);
  if(cue==='pop')this.bank('toonRec','poof',.42);
  if(cue==='click'){this.bank('woodblockRec','claves',.3);this.bank('woodblockRec','claves',.2,.08);}
  if(cue==='twinkle')[84,88,91,96].forEach((m,i)=>this.note('glockRec',m,.2,i*.1));}
 stop(){for(const source of this.active){try{source.stop();}catch{}}this.active.clear();for(const key of [...this.layers.keys()])this.stopLayer(key);}
}
function cincBus(ctx,out){if(!ctx||!out)return null;if(!CINC_BUS||CINC_BUS.context!==ctx)CINC_BUS=new CincSound(ctx,out);return CINC_BUS;}
// Each frame of a running game: the cues of the frame, then the long recordings at the clock of the activity. Without sound, nothing.
export function cincAudio(game,s,ctx,out){const a=game?.cinc,cues=game?.cincCues?game.cincCues.splice(0):[];if(!a)return;const bus=s.sound&&ctx?.state==='running'?cincBus(ctx,out):null;if(!bus)return;
 for(const cue of cues)bus.play(cue,a.id);bus.sync(a,s);}
// The factory: the claves when the machine swallows the thing, and, with the invention, the puff, the boing and the glockenspiel.
export function cincFactoryAudio(game,s,ctx,out){if(game?.time===null||game?.time===undefined){game.cincFired=null;return;}const bus=s.sound&&ctx?.state==='running'?cincBus(ctx,out):null;
 const st=game.scanState,final=(st?.pending?.correct&&st.picks.length+1>=2),fired=game.cincFired||(game.cincFired=new Set()),t=game.time;
 const cue=(key,at,sound)=>{if(t>=at&&!fired.has(key)){fired.add(key);if(bus)bus.play(sound,'factory');}};
 cue('machine',.45,'click');if(final){cue('out',2.15,'pop');cue('fun',3.5,'boing');cue('done',5.7,'twinkle');}}
export function cincSilence(){CINC_BUS?.stop();}

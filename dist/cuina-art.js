// La cuina que balla (CE34, 0.26): twenty things of the kitchen, each one thick line of colour on black (or with a dark edge on white),
// drawn and danced like the drawings of Dibuixos que ballen (dibuixos-art.js: the same parts, movements, line and surroundings). The
// same units: about 1000 high, centred on (0, 0), y downwards.
// Things have no face (Marc, 30 October 2026); only the two people do, the pizza maker and the chestnut seller.
import {Kclamp,Ksmooth,K_TAU} from './kaleido-base.js';
import {dwLine,dwArc,dwRound,dwPath,dwPart,dwPeak,dwHop,dwSwing,dwLerp,dwFace} from './dibuixos-art.js';

const CN_PI=Math.PI,KQ=dwPart;
// A jump that lands on every beat (a parabola, 1 half way), and the squash of the landing (1 on the beat, 0 an eighth of a beat away).
const cnArc=b=>{const f=b-Math.floor(b);return 4*f*(1-f);};
const cnLand=b=>{const d=Math.abs(b-Math.round(b));return Math.max(0,1-d*8);};
const cnFrac=(b,n=1)=>((b%n)+n)%n;
// Keeps only the parts of the lines where keep(x, y) holds (the edge found by halving), so that a thing can go behind another one
// although nothing is filled: a toast inside the toaster, a fruit inside the bowl.
function cnClip(lines,keep){const out=[];for(const l of lines){let cur=[];for(let i=0;i<l.length;i++){const p=l[i],k=keep(p[0],p[1]);
  if(i>0){const q=l[i-1],kq=keep(q[0],q[1]);if(k!==kq){let a=q,b=p;for(let j=0;j<10;j++){const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(keep(mid[0],mid[1])===kq)a=mid;else b=mid;}const e=kq?a:b;if(kq){cur.push(e);if(cur.length>1)out.push(cur);cur=[];}else cur=[e];}}
  if(k)cur.push(p);}if(cur.length>1)out.push(cur);}return out;}
// A fluffy blob (a piece of popcorn, a cloud of cream) of radius r.
const cnPuff=(x,y,r)=>dwPath(`M${x-r},${y} C${x-1.7*r},${y-r} ${x-.7*r},${y-1.8*r} ${x},${y-1.3*r} C${x+.7*r},${y-2*r} ${x+1.7*r},${y-r} ${x+r},${y} C${x+1.5*r},${y+.8*r} ${x+.3*r},${y+1.3*r} ${x},${y+.8*r} C${x-.5*r},${y+1.3*r} ${x-1.5*r},${y+.8*r} ${x-r},${y} Z`)[0];
// A rising curl of steam, f from 0 (born) to 1 (gone).
const cnSteam=(x,y,f,h=160)=>{const out=[],n=10,a=Math.max(.05,1-f);for(let i=0;i<=n*a;i++){const t=i/n,yy=y-f*h*.6-t*h;out.push([x+28*Math.sin(t*5+f*4),yy]);}return out.length>1?out:[];};

// Teapot: once a bar of its minuet it tips forward and pours tea into the cup; the lid rattles on the first beat, steam rises from the cup.
function cnTeapot(){const pv=[-40,410],pour=m=>m.e*Math.sin(CN_PI*cnFrac(m.b,3)/3)**2,th=m=>-.34*pour(m);
 const rot=(p,t)=>{const c=Math.cos(t),s=Math.sin(t),x=p[0]-pv[0],y=p[1]-pv[1];return [pv[0]+x*c-y*s,pv[1]+x*s+y*c];};
 const lid=KQ({at:[150,-30],move:m=>({y:-22*m.e*dwPeak(m.b/3,4),r:.06*m.e*dwPeak(m.b/3,4)}),lines:[dwPath('M50,-30 Q150,-140 250,-30')[0],dwLine(36,-30,264,-30)],kids:[KQ({acc:true,dots:[[150,-118,26]]})]});
 const pot=KQ({at:pv,move:m=>({r:th(m)}),lines:[dwArc(150,170,260,210),dwRound(40,374,220,36,14),...dwPath('M-104,214 C-200,190 -250,60 -330,-40 M-82,112 C-170,96 -212,26 -300,-62 M-330,-40 L-300,-62 M400,60 C524,36 548,284 376,292 M404,112 C474,110 486,232 394,242')],
  kids:[KQ({acc:true,lines:[dwPath('M-60,250 Q-10,214 40,250 Q90,286 140,250 Q190,214 240,250 Q290,286 340,250')[0],dwArc(150,110,22),...[0,1,2,3,4,5].map(k=>{const a=k*CN_PI/3;return dwArc(150+56*Math.cos(a),110+56*Math.sin(a),30,15,0,K_TAU,a);})]}),lid]});
 const stream=KQ({acc:true,lw:.6,shape:m=>{const p=pour(m);if(p<.4)return [];const T=rot([-318,-48],th(m)),k=Kclamp((p-.4)/.3);return [dwPath(`M${T[0]},${T[1]} Q${T[0]-60},${T[1]+90} ${dwLerp(T[0],-440,k)},${dwLerp(T[1],290,k)}`)[0]];}});
 const steam=KQ({acc:true,lw:.55,shape:m=>[0,1].map(k=>cnSteam(-470+60*k,250,cnFrac(m.b/3+k*.5))).filter(l=>l.length)});
 const cup=KQ({lines:[dwPath('M-560,300 C-560,396 -520,404 -440,404 C-360,404 -320,396 -320,300')[0],dwArc(-440,300,120,24),dwPath('M-558,322 C-636,320 -636,390 -546,384')[0],dwArc(-440,414,176,20)]});
 return {name:'teapot',root:KQ({kids:[cup,steam,pot,stream]}),pivot:[0,430],move:null,colors:['#ffffff','#5fd3ff'],pulse:3,ground:432,env:'table',box:[-660,-200,560,432]};}

// Toaster: on the first beat of every bar two slices of toast pop up, turn over a little in the air and fall back in; the lever goes up
// and down with them.
function cnToaster(){const top=-20,fly=(m,d)=>{const z=cnFrac(m.b-d,2);return z<1.3?m.e*Math.sin(CN_PI*z/1.3):0;};
 const bread=(x,Y,o)=>`M${x-96+o},230 L${x-96+o},${Y+70+o} C${x-136+o},${Y+58+o} ${x-146+o},${Y-8+o} ${x-108+o},${Y-30+o} C${x-60},${Y-56+o} ${x+60},${Y-56+o} ${x+108-o},${Y-30+o} C${x+146-o},${Y-8+o} ${x+136-o},${Y+58+o} ${x+96-o},${Y+70+o} L${x+96-o},230`;
 const slice=(x,d,sgn)=>KQ({acc:true,shape:m=>{const f=fly(m,d),y=-330*f,r=sgn*.22*f*Math.sin(CN_PI*f),c=Math.cos(r),s=Math.sin(r);
   const raw=dwPath(bread(x,-110,0)+' '+bread(x,-110,22));
   const lines=raw.map(l=>l.map(([px,py])=>{const dx=px-x,dy=py-60;return [x+dx*c-dy*s,60+dx*s+dy*c+y];}));return cnClip(lines,(px,py)=>py<top-6);}});
 const lever=KQ({acc:true,shape:m=>{const up=Math.max(fly(m,0),fly(m,.08)),y=dwLerp(220,40,Kclamp(up*3));return [dwRound(304,y,78,40,14)];}});
 const body=KQ({lines:[dwRound(-310,top,620,400,90),dwRound(-250,380,80,30,10),dwRound(170,380,80,30,10),dwLine(314,40,314,260),dwLine(-310,300,310,300),...dwPath('M-310,260 C-400,270 -380,404 -500,406')],kids:[KQ({acc:true,lines:[dwArc(-190,206,36),dwLine(-190,206,-170,180)]})]});
 return {name:'toaster',root:KQ({kids:[slice(-140,0,-1),slice(140,.08,1),body,lever]}),pivot:[0,410],move:m=>({y:-12*m.e*dwPeak(m.b/2,3)}),colors:['#ff8a3d','#ffd23f'],pulse:2,ground:410,env:'kitchen',box:[-500,-560,420,410]};}

// Frying pan and pancake: every bar the pancake is tossed, turns over in the air and lands in the pan on the first beat of the next.
function cnPancake(){const air=m=>{const z=cnFrac(m.b+1.2,2);return z<1.2?m.e*z/1.2:0;};
 const spots=[[-60,-10],[30,6],[100,-8],[-120,8],[-10,14]];
 const cake=KQ({shape:m=>{const f=air(m),y=140-430*Math.sin(CN_PI*f),sy=Math.cos(K_TAU*f),flop=12*Math.sin(CN_PI*f),out=[];
   const ring=[];for(let i=0;i<=48;i++){const a=i/48*K_TAU;ring.push([-60+210*Math.cos(a),y+(34*Math.abs(sy)+3)*Math.sin(a)+flop*Math.cos(2*a)]);}out.push(ring);return out;},
  kids:[KQ({acc:true,shape:m=>{const f=air(m),y=140-430*Math.sin(CN_PI*f),sy=Math.cos(K_TAU*f);if(Math.abs(sy)<.3)return [];return sy>0?spots.map(([x,v])=>dwArc(-60+x,y+v*sy,13,13*sy)):spots.slice(0,3).map(([x,v])=>dwLine(-60+x-20,y-v*sy,-60+x+20,y-v*sy));}})]});
 const pan=KQ({at:[600,96],move:m=>{const z=cnFrac(m.b+1.2,2),toss=z<.25?Math.sin(CN_PI*z/.25):0,land=cnLand(m.b/2);return {r:.08*m.e*toss,y:16*m.e*land};},
  lines:[dwArc(-60,150,270,60),...dwPath('M-330,150 L-290,250 M210,150 L170,250 M200,140 L560,70 Q610,62 616,96 Q620,124 572,132 L212,168'),dwArc(-60,250,230,40,0,CN_PI),dwArc(586,98,12)]});
 const steam=KQ({acc:true,lw:.55,shape:m=>air(m)>.02?[]:[0,1,2].map(k=>cnSteam(-160+100*k,110,cnFrac(m.b/2+k*.33),120)).filter(l=>l.length)});
 return {name:'pancake',root:KQ({kids:[pan,cake,steam]}),pivot:[100,300],move:null,colors:['#5fd3ff','#ffd23f'],pulse:2,ground:300,env:'stove',box:[-360,-360,640,300]};}

// Whisk and bowl: the whisk goes round the bowl once every two beats and the cream flies up in drops on every beat; the bowl rocks.
function cnWhisk(){const H=[300,-560],N=[170,-280],T=[40,60],phi=m=>CN_PI*m.b;
 const dir=[T[0]-N[0],T[1]-N[1]],len=Math.hypot(...dir),u=[dir[0]/len,dir[1]/len],n=[-u[1],u[0]];
 const loop=w=>{const p=(t,o)=>[N[0]+u[0]*len*t+n[0]*o,N[1]+u[1]*len*t+n[1]*o];const a=p(.55,w),b=p(.55,-w),t1=p(1.08,w*.5),t2=p(1.08,-w*.5);return dwPath(`M${N[0]},${N[1]} Q${a[0]},${a[1]} ${t1[0]},${t1[1]} Q${T[0]+u[0]*60},${T[1]+u[1]*60} ${t2[0]},${t2[1]} Q${b[0]},${b[1]} ${N[0]},${N[1]}`)[0];};
 const whisk=KQ({at:H,move:m=>({r:.2*m.e*Math.cos(phi(m)),sx:1-.08*m.e*Math.sin(phi(m))}),lines:[...dwPath(`M${H[0]-16},${H[1]-14} L${N[0]-14},${N[1]-8} M${H[0]+16},${H[1]+14} L${N[0]+14},${N[1]+8} M${H[0]-16},${H[1]-14} Q${H[0]+10},${H[1]-40} ${H[0]+16},${H[1]+14}`),...[40,80,120,160].map(loop)],kids:[KQ({acc:true,dots:[[H[0]+4,H[1]-6,14]]})]});
 const bowl=KQ({at:[0,410],move:m=>({r:.025*m.e*Math.sin(phi(m))}),lines:[dwArc(0,40,330,64),dwPath('M-330,40 C-330,300 -180,380 0,380 C180,380 330,300 330,40')[0],dwPath('M-110,380 L-130,410 L130,410 L110,380')[0]],
  kids:[KQ({acc:true,shape:m=>{const out=[],l=[];for(let i=0;i<=40;i++){const a=CN_PI+i/40*CN_PI,x=290*Math.cos(a);l.push([x,44+48*Math.sin(a)+10*m.e*Math.sin(x/50+phi(m)*2)]);}out.push(l);return out;}})]});
 const drops=KQ({acc:true,shape:m=>{if(m.e<=0)return [];const f=cnFrac(m.b);if(f>.8)return [];const tx=40+150*Math.cos(phi(m)-f*CN_PI);return [-1,1].map(s=>{const x=tx+s*(60+160*f),y=20-260*Math.sin(CN_PI*f/.8);return dwArc(x,y,16,20);});}});
 return {name:'whisk',root:KQ({kids:[bowl,whisk,drops]}),pivot:[0,410],move:null,colors:['#c58cff','#ffffff'],pulse:1,ground:410,env:'kitchen',box:[-360,-600,380,410]};}

// Fruit bowl: the apple, the pear, the orange and the grapes hop in turn, one on each beat; the leaves flutter.
function cnFruit(){const rim=x=>60+40*Math.sqrt(Math.max(0,1-(x/380)**2)),inBowl=(x,y)=>Math.abs(x)>372||y<rim(x)-4;
 const hop=(m,k)=>{const z=cnFrac(m.b,4);return Math.floor(z)===k?m.e*Math.sin(CN_PI*(z-k)):0;};
 const fruit=(k,acc,lines,x0,y0)=>KQ({acc,shape:m=>{const y=-70*hop(m,k);return cnClip(lines.map(l=>l.map(([x,yy])=>[x,yy+y])),inBowl);}});
 const apple=(x,y)=>[dwPath(`M${x},${y-80} C${x+60},${y-120} ${x+120},${y-70} ${x+110},${y+10} C${x+100},${y+90} ${x+40},${y+110} ${x},${y+95} C${x-40},${y+110} ${x-100},${y+90} ${x-110},${y+10} C${x-120},${y-70} ${x-60},${y-120} ${x},${y-80} Z`)[0]];
 const pear=(x,y)=>[dwPath(`M${x},${y-190} C${x+34},${y-190} ${x+44},${y-120} ${x+54},${y-80} C${x+124},${y-36} ${x+134},${y+90} ${x},${y+96} C${x-134},${y+90} ${x-124},${y-36} ${x-54},${y-80} C${x-44},${y-120} ${x-34},${y-190} ${x},${y-190} Z`)[0]];
 const grapes=[[300,-40],[372,-40],[264,22],[336,22],[408,22],[300,84],[372,84],[336,146]];
 const leaves=KQ({acc:true,shape:m=>{const ya=-70*hop(m,0),yp=-70*hop(m,1),w=m.e*Math.sin(K_TAU*m.b/2)*8;return [dwPath(`M-210,${-100+ya} Q-204,${-140+ya} -190,${-160+ya}`)[0],dwPath(`M-192,${-140+ya} Q${-140+w},${-172+ya} -110,${-140+ya} Q-150,${-118+ya} -192,${-140+ya} Z`)[0],dwPath(`M-20,${-210+yp} Q-16,${-240+yp} -4,${-252+yp}`)[0],dwPath(`M340,-96 Q${380+w},-126 420,-100 Q380,-80 340,-96 Z`)[0]];}});
 const orange=KQ({shape:m=>{const y=-70*hop(m,2);return cnClip([dwArc(170,-10+y,100)],inBowl);},dots:[]});
 const grape=KQ({acc:true,shape:m=>{const h=hop(m,3);return grapes.map(([x,y],i)=>dwArc(x+6*h*Math.sin(i*2.1+m.b*CN_PI*2),y-40*h+4*h*Math.cos(i*1.3+m.b*CN_PI*2),36));}});
 const bowl=KQ({lines:[dwArc(0,60,380,40,0,CN_PI),dwArc(0,60,380,40,CN_PI,K_TAU),dwPath('M-380,60 C-360,220 -200,260 0,260 C200,260 360,220 380,60 M-40,258 L-30,350 M40,258 L30,350')[0],...dwPath('M-40,258 L-30,350 M40,258 L30,350'),dwArc(0,370,150,30)]});
 return {name:'fruit',root:KQ({kids:[fruit(1,true,pear(-20,-30)),fruit(0,false,apple(-210,-20)),orange,KQ({acc:true,dots:[]}),grape,leaves,bowl]}),pivot:[0,400],move:null,colors:['#ffd23f','#7dff7a'],pulse:1,ground:400,env:'kitchen',box:[-400,-280,460,400]};}

// Ice cream: three scoops on a cone sway one after another like a wave, the cherry on top hops on every beat and a drip runs down
// the cone every two bars.
function cnIceCream(){const scoop=(y,r)=>{const out=[],a0=CN_PI-.4,a1=K_TAU+.4;for(let i=0;i<=40;i++){const a=a0+(a1-a0)*i/40;out.push([r*Math.cos(a),y+r*Math.sin(a)]);}const L=out[out.length-1],R=out[0];const n=5,sc=[];for(let i=0;i<=n*8;i++){const t=i/(n*8),x=dwLerp(L[0],R[0],t),bump=Math.abs(Math.sin(CN_PI*t*n))*r*.16;sc.push([x,L[1]+bump+r*.06*Math.sin(CN_PI*t)]);}return [out,sc];};
 const cone=[];for(const t of [.25,.5,.75]){cone.push(dwLine(-140+280*t,-10,140*t,-10+430*(1-t)),dwLine(140-280*t,-10,-140*t,-10+430*(1-t)));}
 const sprinkles=[[-60,-520,.4],[0,-560,-.6],[60,-520,1.1],[-30,-480,-1.2],[40,-470,.3],[-80,-460,.9]].map(([x,y,a])=>dwLine(x-14*Math.cos(a),y-14*Math.sin(a),x+14*Math.cos(a),y+14*Math.sin(a)));
 const cherry=KQ({move:m=>({y:-70*m.e*cnArc(m.b)}),lines:[dwArc(0,-610,40)],kids:[KQ({acc:true,lines:[dwPath('M6,-648 Q20,-700 60,-716')[0]]})]});
 const s3=KQ({at:[0,-400],move:m=>({r:.1*m.e*dwSwing(m.b-.3,2)}),lines:scoop(-470,118),kids:[KQ({acc:true,lines:sprinkles}),cherry]});
 const s2=KQ({at:[0,-210],move:m=>({r:.08*m.e*dwSwing(m.b-.15,2)}),lines:scoop(-290,132),kids:[s3]});
 const s1=KQ({at:[0,-20],move:m=>({r:.06*m.e*dwSwing(m.b,2)}),lines:scoop(-100,150),kids:[s2]});
 const drip=KQ({shape:m=>{if(m.e<=0)return [];const f=cnFrac(m.b,4)/4;if(f>.9)return [];const y=-10+f*330,x=-130+f*120;return [dwPath(`M${x},${y-30} Q${x-14},${y} ${x},${y+16} Q${x+14},${y} ${x},${y-30}`)[0]];}});
 return {name:'icecream',root:KQ({lines:[dwPath('M-140,-10 L0,420 L140,-10')[0]],kids:[KQ({acc:true,lines:cone}),s1,drip]}),pivot:[0,420],move:m=>({r:.04*m.e*dwSwing(m.b,4)}),colors:['#ff7ac8','#ffd23f'],pulse:1,ground:420,env:'beach',box:[-260,-720,260,420]};}

// Crème caramel: it wobbles like jelly on every beat (it squashes, then sways from side to side and settles), with its caramel and
// its cherry; the plate stays still.
function cnFlan(){const base=360,top=40,hgt=base-top;
 const body=[...dwPath(`M-230,${base} C-216,250 -170,120 -150,${top} M230,${base} C216,250 170,120 150,${top}`),dwArc(0,top,150,28),dwArc(0,base,230,40,0,CN_PI)];
 // The caramel runs over the edge of the top in three short drips.
 const edge=[];for(let x=-152;x<=152;x+=4){const k=Math.max(0,1-(x/152)**2);edge.push([x,top+26*Math.sqrt(k)+[[-92,46],[8,64],[98,40]].reduce((a,[cx,len])=>a+len*Math.exp(-(((x-cx)/16)**2)),0)*Math.min(1,k*3)]);}
 const caramel=[edge,dwArc(0,top,120,18)];
 const cherry=[dwArc(0,top-60,40),dwPath(`M8,${top-98} Q30,${top-150} 70,${top-160}`)[0]];
 const warp=(lines,m)=>{const f=cnFrac(m.b),sh=70*m.e*Math.exp(-3*f)*Math.sin(K_TAU*2*f),sq=.14*m.e*Math.exp(-6*f)*Math.cos(K_TAU*2*f);return lines.map(l=>l.map(([x,y])=>{const k=Kclamp((base-y)/hgt);return [x*(1+sq*.6*k)+sh*k*k,base-(base-y)*(1-sq)];}));};
 const flan=KQ({shape:m=>warp(body,m),kids:[KQ({acc:true,shape:m=>warp([...caramel,cherry[1]],m)}),KQ({shape:m=>warp([cherry[0]],m)})]});
 return {name:'flan',root:KQ({lines:[dwArc(0,382,360,46),dwArc(0,382,270,30,0,CN_PI)],kids:[flan]}),pivot:[0,430],move:null,colors:['#ffd23f','#ff8a3d'],pulse:1,ground:430,env:'table',box:[-380,-160,380,430]};}

// Birthday cake: the cake squashes on the first beat of each bar of its waltz, the top tier jumps on the second and the five candles
// sway on the third; the flames flicker (their shape, not their light).
function cnCake(){const z=m=>cnFrac(m.b,3);
 const flame=x=>{const out=[];return out;};
 const candles=KQ({at:[0,-90],move:m=>{const q=z(m);return {r:q>=2?.06*m.e*Math.sin(CN_PI*(q-2)):0};},lines:[-160,-80,0,80,160].flatMap(x=>[dwRound(x-16,-230,32,140,10),dwLine(x,-230,x,-248)]),
  kids:[KQ({acc:true,shape:m=>[-160,-80,0,80,160].map((x,k)=>{const fl=1+.18*m.e*Math.sin(K_TAU*m.b+k*1.7),sw=10*m.e*Math.sin(K_TAU*m.b*.5+k);return dwPath(`M${x},-252 C${x-26},-270 ${x-20+sw*.5},${-252-58*fl} ${x+sw},${-252-90*fl} C${x+20+sw*.5},${-252-58*fl} ${x+26},-270 ${x},-252 Z`)[0];})})]});
 const icing=(y,x0,x1,n)=>{const l=[];for(let i=0;i<=n*10;i++){const t=i/(n*10),x=dwLerp(x0,x1,t);l.push([x,y+22*Math.max(0,Math.sin(CN_PI*t*n))**3]);}return l;};
 const topTier=KQ({at:[0,120],move:m=>{const q=z(m);return {y:q>=1&&q<2?-34*m.e*Math.sin(CN_PI*(q-1)):0};},lines:[dwRound(-210,-90,420,210,26)],kids:[KQ({acc:true,lines:[icing(-56,-206,206,6)]}),candles]});
 const cake=KQ({at:[0,380],move:m=>{const q=z(m),k=q<1?.05*m.e*Math.sin(CN_PI*q):0;return {sx:1+k,sy:1-k};},lines:[dwRound(-320,120,640,260,30)],kids:[KQ({acc:true,lines:[icing(152,-316,316,8)],dots:[-240,-160,-80,0,80,160,240].map(x=>[x,330,13])}),topTier]});
 return {name:'cake',root:KQ({lines:[dwArc(0,388,390,40),...dwPath('M-50,428 L-80,460 L80,460 L50,428')],kids:[cake]}),pivot:[0,460],move:null,colors:['#ff7ac8','#ffd23f'],pulse:1,ground:460,env:'plaza',box:[-400,-380,400,460]};}

// Banana: it stands on its end, half peeled, and dances, bending one way and the other; on every beat the two side flaps of its peel
// fly up like arms, and the front one swings.
function cnBanana(){const bend=m=>.25+.45*m.e*dwSwing(m.b,2);
 const warp=(lines,m)=>{const k=bend(m);return lines.map(l=>l.map(([x,y])=>{const t=(400-y)/800;return [x+k*300*t*t,y];}));};
 const flap=(hx,hy,a,len,w,curl)=>{const d=[Math.cos(a),Math.sin(a)],n=[-d[1],d[0]],P=(t,o)=>[hx+d[0]*len*t+n[0]*o,hy+d[1]*len*t+n[1]*o];
  const a1=P(0,w),a2=P(0,-w),c1=P(.55,w*1.25),c2=P(.55,-w*1.25),tip=P(1,curl);return dwPath(`M${a1} Q${c1} ${tip} Q${c2} ${a2}`)[0];};
 const lift=m=>.75+.75*m.e*dwPeak(m.b,2);
 const peel=KQ({shape:m=>{const al=lift(m),sw=.14*m.e*dwSwing(m.b,1);return warp([...dwPath('M-16,400 L-16,362 C-70,322 -104,240 -104,150 L-104,12 M16,400 L16,362 C70,322 104,240 104,150 L104,12 M-16,400 L16,400'),
   flap(-76,12,CN_PI/2+al,250,30,-24),flap(76,12,CN_PI/2-al,250,30,24),flap(0,14,CN_PI/2+sw,190,30,0)],m);},
  kids:[KQ({acc:true,shape:m=>warp([dwPath('M-88,12 C-98,-150 -72,-300 0,-392 C72,-300 98,-150 88,12')[0]],m)})]});
 return {name:'banana',root:KQ({kids:[peel]}),pivot:[0,400],move:m=>({r:.04*m.e*dwSwing(m.b,4)}),colors:['#ffd23f','#ffffff'],pulse:1,ground:404,env:'beach',box:[-380,-420,420,404]};}

// Popcorn: the pot on the ring pops on every beat, two pieces of popcorn jump out from under its lid and fall away; every four bars
// a big pop throws the lid up and three fly out.
const cnCorn=(x,y,R,ph)=>{const out=[];for(let i=0;i<=72;i++){const a=i/72*K_TAU,r=R*(.78+.26*Math.abs(Math.sin(2.5*a+ph))+.07*Math.sin(4*a+2*ph));out.push([x+r*Math.cos(a),y+r*Math.sin(a)]);}return out;};
function cnPopcorn(){const lidUp=m=>{const z=cnFrac(m.b,8),f=cnFrac(m.b);return m.e*(z>=7?220*Math.sin(CN_PI*(z-7)):26*Math.max(0,1-f*4));};
 const rnd=k=>{const v=Math.sin(k*91.7+3.1)*43758.5453;return v-Math.floor(v);};
 const pieces=KQ({acc:true,shape:m=>{if(m.e<=0)return [];const out=[],b=m.b;for(let k=Math.floor(b)-1;k<=Math.floor(b);k++){const age=b-k;if(age<0||age>1.6)continue;const n=cnFrac(k,8)>=7?3:2;
   for(let j=0;j<n;j++){const s=j===2?.15:(j%2?1:-1),v=rnd(k*3+j),x=s*(150+60*v)+s*age*(200+120*v),y=-40-560*age+360*age*age;out.push(cnCorn(x,y,62+18*v,v*6+age*.8));}}return out;}});
 const lid=KQ({at:[0,0],move:m=>({y:-lidUp(m),r:.0015*lidUp(m)}),lines:[dwPath('M-270,0 Q0,-110 270,0')[0],dwLine(-284,0,284,0)],kids:[KQ({acc:true,lines:[dwRound(-32,-96,64,40,14)]})]});
 const pot=KQ({lines:[dwRound(-260,0,520,330,40),...dwPath('M-260,70 L-330,70 L-330,110 L-260,110 M260,70 L330,70 L330,110 L260,110'),dwArc(0,350,230,24)]});
 return {name:'popcorn',root:KQ({kids:[pot,lid,pieces]}),pivot:[0,380],move:m=>({y:-8*m.e*dwPeak(m.b,3)}),colors:['#5fd3ff','#ffffff'],pulse:1,ground:376,env:'stove',box:[-420,-560,420,376]};}

// A point p turned by r about c.
const cnTurn=(p,c,r)=>{const cs=Math.cos(r),sn=Math.sin(r),x=p[0]-c[0],y=p[1]-c[1];return [c[0]+x*cs-y*sn,c[1]+x*sn+y*cs];};

// Moka pot: it sways to its bossa nova, and on every beat its lid flaps open and a puff of steam leaves the spout.
function cnMoka(){const lid=KQ({at:[-150,-206],move:m=>({r:-.5*m.e*dwPeak(m.b,3)}),lines:[dwPath('M-158,-204 Q0,-262 158,-204')[0],dwLine(-158,-204,158,-204)],kids:[KQ({acc:true,lines:[dwRound(-28,-268,56,40,12)]})]});
 const steam=KQ({acc:true,lw:.55,shape:m=>[0,1].map(k=>cnSteam(250+30*k,-250,cnFrac(m.b+k*.5),200)).filter(l=>l.length)});
 const body=KQ({lines:[dwPath('M-180,400 L-128,150 L128,150 L180,400 Z')[0],dwRound(-138,112,276,40,10),...dwPath('M-110,112 L-150,-196 M110,112 L150,-196 M150,-196 L238,-240 L216,-180 L140,-120 M-142,-170 L-250,-186 Q-282,-186 -280,-150 L-262,50 Q-258,80 -226,72 L-124,52')],
  kids:[KQ({acc:true,lw:.55,lines:[dwLine(-52,150,-74,400),dwLine(52,150,74,400),dwLine(-44,112,-62,-196),dwLine(44,112,62,-196)]}),lid,steam]});
 return {name:'moka',root:body,pivot:[0,400],move:m=>({r:.035*m.e*dwSwing(m.b,2),sy:1-.03*m.e*dwPeak(m.b,3)}),colors:['#4dd9c0','#ffffff'],pulse:1,ground:400,env:'stove',box:[-300,-480,340,400]};}

// Salt and pepper: they take turns, one on each beat of their polka: the salt jumps, leans over and salts the pepper, then the pepper
// peppers the salt.
function cnShakers(){const S=-200,P=200,hop=(m,k)=>{const z=cnFrac(m.b,2);return Math.floor(z)===k?m.e*Math.sin(CN_PI*(z-k)):0;};
 const pose=(m,k,sgn)=>{const h=hop(m,k);return {y:-160*h,r:sgn*.45*h*h};};
 const salt=KQ({at:[S,400],move:m=>pose(m,0,1),lines:[dwRound(S-95,-110,190,510,40),dwPath(`M${S-100},-110 C${S-100},-236 ${S+100},-236 ${S+100},-110`)[0],dwLine(S-108,-110,S+108,-110),dwPath(`M${S-95},90 Q${S-50},70 ${S},90 Q${S+50},110 ${S+95},90`)[0]],dots:[[S-44,-162,10],[S,-180,10],[S+44,-162,10]]});
 const pepper=KQ({acc:true,at:[P,400],move:m=>pose(m,1,-1),lines:[dwPath(`M${P-70},400 C${P-160},380 ${P-170},200 ${P-110},100 C${P-80},50 ${P-80},-20 ${P-90},-60 L${P+90},-60 C${P+80},-20 ${P+80},50 ${P+110},100 C${P+170},200 ${P+160},380 ${P+70},400 Z`)[0],dwRound(P-100,-150,200,90,30)],dots:[[P-44,-104,10],[P,-104,10],[P+44,-104,10]]});
 const grains=(k,X,sgn,acc)=>KQ({acc,shape:m=>{const z=cnFrac(m.b,2);if(Math.floor(z)!==k||m.e<=0)return [];const f=z-k;if(f<.35)return [];const t=(f-.35)/.65,{y,r}=pose(m,k,sgn),top=cnTurn([X,-200],[X,400],r);
   return [0,1,2,3,4].map(j=>dwArc(top[0]+(j-2)*16+sgn*70*t,top[1]+y+30+300*t*t*(1+j*.15),7));}});
 return {name:'shakers',root:KQ({kids:[salt,pepper,grains(0,S,1,false),grains(1,P,-1,true)]}),pivot:[0,400],move:null,colors:['#5fd3ff','#ffd23f'],pulse:1,ground:400,env:'table',box:[-330,-440,330,400]};}

// Burger: on every beat the layers bounce one after the other from the bottom up, like an accordion; every two bars the top bun lifts
// like a hat, with its flag.
function cnBurger(){const lay=(k,amp)=>m=>{const f=cnFrac(m.b-k*.07);return {y:-amp*m.e*Math.sin(CN_PI*f)};};
 const drip=[[228,290],[16,300],[-214,284]],inDrip=(x,y)=>drip.some(([cx,ty])=>y>226&&y<ty&&Math.abs(x-cx)<22*(1-(y-226)/(ty-226)));
 const bun=KQ({at:[0,400],lines:[dwPath('M-300,330 L300,330 Q312,400 240,400 L-240,400 Q-312,400 -300,330 Z')[0]]});
 const patty=KQ({at:[0,330],move:lay(1,26),lines:[...cnClip([dwRound(-320,232,640,92,46)],(x,y)=>!inDrip(x,y)),dwArc(-170,278,46,12,.2*CN_PI,.8*CN_PI),dwArc(20,286,46,12,.2*CN_PI,.8*CN_PI),dwArc(200,276,46,12,.2*CN_PI,.8*CN_PI),
   dwPath('M-312,214 L312,214 L312,226 L250,226 L228,290 L206,226 L38,226 L16,300 L-6,226 L-192,226 L-214,284 L-236,226 L-312,226 Z')[0]]});
 const tomato=KQ({at:[0,200],move:lay(2,34),lines:[dwRound(-280,160,250,30,14),dwRound(30,160,250,30,14)]});
 const lettuce=KQ({acc:true,at:[0,190],move:lay(3,42),shape:m=>{const top=[],bot=[],w=m.b*CN_PI;for(let i=0;i<=68;i++){const x=-340+i*10;top.push([x,184+10*Math.sin(x*.05+w)]);bot.push([x,206+16*Math.abs(Math.sin(x*.035))]);}return [[...top,...bot.reverse(),top[0]]];}});
 const flag=KQ({acc:true,shape:m=>{const wv=24*Math.sin(K_TAU*m.b/2);return [dwLine(0,-120,0,-340),dwPath(`M0,-340 Q60,${-336+wv*.5} 120,${-312+wv} Q60,${-296+wv*.5} 0,-280`)[0]];}});
 const top=KQ({at:[0,150],move:m=>{const z=cnFrac(m.b,8);if(z>=7)return {y:-180*m.e*Math.sin(CN_PI*(z-7)),r:.22*m.e*Math.sin(K_TAU*(z-7))};const f=cnFrac(m.b-.3);return {y:-50*m.e*Math.sin(CN_PI*f)};},
  lines:[dwPath('M-312,150 C-312,-50 -170,-122 0,-122 C170,-122 312,-50 312,150 Z')[0]],kids:[KQ({lw:.6,lines:[[-180,0,.4],[-70,-66,-.3],[80,-62,.5],[200,-8,-.5],[-120,72,.1],[10,24,.7],[150,74,-.2]].map(([x,y,a])=>dwArc(x,y,17,7,0,K_TAU,a))}),flag]});
 return {name:'burger',root:KQ({kids:[bun,patty,tomato,lettuce,top]}),pivot:[0,400],move:null,colors:['#ffb15c','#7dff7a'],pulse:1,ground:400,env:'plaza',box:[-360,-360,360,400]};}

// Honey pot: every two beats the dipper rises out of the pot, a thread of honey stretches from it and falls back; the drips on the
// pot grow and shrink.
function cnHoney(){const D=[60,110],lift=m=>{const z=cnFrac(m.b,2);return m.e*(z<.6?Math.sin(CN_PI/2*z/.6):z<1.3?1:Math.cos(CN_PI/2*(z-1.3)/.7));};
 const pose=m=>({y:-250*lift(m),r:.3-.22*lift(m)}),hide=(x,y)=>y<-62||Math.abs(x)>284;
 const groove=[-36,0,36].map(y=>{const w=54*Math.sqrt(1-(y/72)**2);return dwLine(D[0]-w,D[1]+y,D[0]+w,D[1]+y);});
 const dipper=KQ({shape:m=>{const {y,r}=pose(m),raw=[dwArc(D[0],D[1],54,72),...groove,dwLine(D[0],D[1]-72,D[0],D[1]-400),dwArc(D[0],D[1]-424,24)];
   return cnClip(raw.map(l=>l.map(p=>{const q=cnTurn(p,D,r);return [q[0],q[1]+y];})),hide);}});
 const thread=KQ({acc:true,shape:m=>{const z=cnFrac(m.b,2);if(m.e<=0||z<.6||z>1.75)return [];const {y,r}=pose(m),B=cnTurn([D[0],D[1]+68],D,r),bx=B[0],by=B[1]+y;
   if(z<1.3){const L=40+200*(z-.6)/.7;return [dwPath(`M${bx-14},${by-4} C${bx-4},${by+L*.5} ${bx-26},${by+L} ${bx},${by+L+14} C${bx+26},${by+L} ${bx+4},${by+L*.5} ${bx+14},${by-4}`)[0]];}
   const t=(z-1.3)/.45,yy=by+240+t*(-60-by-240+40);return cnClip([dwPath(`M${bx},${yy-40} C${bx-24},${yy} ${bx-20},${yy+20} ${bx},${yy+24} C${bx+20},${yy+20} ${bx+24},${yy} ${bx},${yy-40}`)[0]],hide);}});
 const drips=KQ({acc:true,shape:m=>{const d=k=>48+20*Math.sin(CN_PI*m.b/2+k*2.1);return [dwPath(`M-280,-4 L-226,-4 Q-216,${d(0)} -200,${d(0)+6} Q-184,${d(0)} -176,-4 L40,-4 Q50,${d(1)+30} 66,${d(1)+36} Q82,${d(1)+30} 88,-4 L176,-4 Q186,${d(2)-10} 198,${d(2)-6} Q210,${d(2)-10} 216,-4 L280,-4`)[0]];}});
 const pot=KQ({lines:[dwPath('M-252,-4 C-340,90 -330,330 -190,390 L190,390 C330,330 340,90 252,-4')[0],dwRound(-284,-62,568,58,26)]});
 return {name:'honey',root:KQ({kids:[pot,drips,dipper,thread]}),pivot:[0,390],move:m=>({r:.03*m.e*dwSwing(m.b,4)}),colors:['#ffc23d','#ff8a3d'],pulse:2,ground:390,env:'kitchen',box:[-340,-600,340,390]};}

// Pizza maker: with one hand on his hip he throws the dough up every two beats and catches it on the beat, spinning, to his tarantella.
function cnPizza(){const X=-120,toss=m=>{const z=cnFrac(m.b,2)/2;return 270*m.e*4*z*(1-z);},push=m=>{const z=cnFrac(m.b,2);return 60*m.e*Math.max(0,1-z*3);};
 const hand=m=>[150,-360-push(m)];
 const face={dots:[[X-32,-318,10],[X+32,-318,10]],lines:[dwPath(`M${X},-306 Q${X+16},-290 ${X-2},-282`)[0],dwArc(X,-244,26,14,.15*CN_PI,.85*CN_PI)]};
 const man=KQ({lines:[dwArc(X,-300,90,90,-.285*CN_PI,1.285*CN_PI),...face.lines,...dwPath(`M${X-80},-372 L${X+80},-372 L${X+80},-410 L${X-80},-410 Z M${X-80},-410 C${X-150},-420 ${X-160},-560 ${X-70},-560 C${X-60},-650 ${X+60},-650 ${X+70},-560 C${X+160},-560 ${X+150},-420 ${X+80},-410`),
   ...dwPath(`M${X-110},120 L${X-90},-180 Q${X},-215 ${X+90},-180 L${X+110},120 M${X-90},300 L${X-94},415 M${X-20},300 L${X-20},415 M${X+20},300 L${X+20},415 M${X+90},300 L${X+94},415 M${X-94},415 Q${X-140},418 ${X-140},432 L${X-20},432 L${X-20},415 M${X+20},415 L${X+20},432 L${X+140},432 Q${X+140},418 ${X+94},415`),
   dwPath(`M${X-90},-170 L${X-200},-40 L${X-112},40`)[0]],dots:face.dots,
  kids:[KQ({lw:.55,lines:[dwLine(X-40,-414,X-48,-470),dwLine(X,-414,X,-480),dwLine(X+40,-414,X+48,-470)]}),
   KQ({acc:true,lines:[dwPath(`M${X-60},-264 Q${X-30},-292 ${X},-270 Q${X+30},-292 ${X+60},-264 Q${X+32},-252 ${X},-262 Q${X-32},-252 ${X-60},-264 Z`)[0],dwPath(`M${X-50},-212 L${X+50},-212 L${X},-160 Z`)[0],dwPath(`M${X-104},40 L${X+104},40 L${X+124},300 L${X-124},300 Z`)[0]],
    dots:[[X-34,-120,9],[X+34,-120,9],[X-34,-50,9],[X+34,-50,9]]})]});
 const arm=KQ({shape:m=>{const [hx,hy]=hand(m);return [dwPath(`M${X+90},-170 Q${X+190},${-190-push(m)*.4} ${hx},${hy}`)[0],dwArc(hx,hy,26)];}});
 const dough=KQ({acc:true,shape:m=>{const [hx,hy]=hand(m),cy=hy-50-toss(m),ph=m.b*CN_PI*.5,out=[],inner=[];for(let i=0;i<=56;i++){const a=i/56*K_TAU,rip=9*Math.sin(3*a+ph);out.push([hx+10+170*Math.cos(a),cy+(32+rip*.4)*Math.sin(a)+rip*.5]);inner.push([hx+10+130*Math.cos(a),cy+22*Math.sin(a)+rip*.35]);}return [out,inner];}});
 return {name:'pizza',root:KQ({kids:[man,arm,dough]}),pivot:[0,432],move:m=>({y:-12*m.e*dwPeak(m.b,3)}),colors:['#ffffff','#ff5a4a'],pulse:2,ground:432,env:'kitchen',box:[-340,-700,360,432]};}

// Chestnut seller: behind her brazier, in her headscarf, she shakes the pan on every beat and the chestnuts jump; smoke rises.
function cnChestnut(){const X=-300,shake=m=>({x:14*m.e*Math.sin(CN_PI*m.b),y:-20*m.e*dwPeak(m.b,3)}),H=[-150,60];
 const face=dwFace(X,-288,.8);
 const woman=KQ({at:[X,430],move:m=>({r:.015*m.e*dwSwing(m.b,2)}),lines:[dwArc(X,-290,64),...face.lines,...dwPath(`M${X-80},-180 Q${X},-205 ${X+80},-180 L${X+120},-40 C${X+140},150 ${X+170},330 ${X+180},420 L${X-180},420 C${X-170},330 ${X-140},150 ${X-120},-40 Z`)],dots:face.dots,
  kids:[KQ({acc:true,lines:[dwPath(`M${X-76},-246 C${X-104},-360 ${X-60},-404 ${X},-404 C${X+60},-404 ${X+104},-360 ${X+76},-246 Q${X+40},-212 ${X},-216 Q${X-40},-212 ${X-76},-246 Z`)[0],dwArc(X,-214,14),...dwPath(`M${X-6},-202 L${X-30},-150 L${X},-158 M${X+6},-202 L${X+32},-148 L${X+6},-158 M${X-96},-176 L${X},-90 L${X+96},-176 M${X-60},60 L${X+60},60 L${X+80},380 L${X-80},380 Z`)]})]});
 const arms=KQ({shape:m=>{const s=shake(m),hx=H[0]+s.x,hy=H[1]+s.y;return [dwPath(`M${X+76},-170 Q${X+130},-10 ${hx},${hy}`)[0],dwPath(`M${X-76},-170 Q${X-30},60 ${hx-10},${hy+12}`)[0],dwArc(hx-4,hy+4,22)];}});
 const nut=(x,y)=>dwPath(`M${x-44},${y} C${x-54},${y-44} ${x-24},${y-62} ${x-4},${y-62} L${x},${y-72} L${x+4},${y-62} C${x+24},${y-62} ${x+54},${y-44} ${x+44},${y} Q${x},${y+14} ${x-44},${y} Z`)[0];
 const pan=KQ({move:m=>shake(m),lines:[dwPath('M-20,90 Q0,150 60,150 L300,150 Q360,150 380,90')[0],dwLine(-24,90,384,90),dwLine(-20,94,-150,60)],dots:[[80,128,7],[150,134,7],[220,134,7],[290,128,7]],
  kids:[KQ({shape:m=>[30,100,170,240,310].map((x,k)=>{const h=-80*m.e*cnArc(m.b-k*.09)*(k%2?.8:1),tilt=.2*m.e*Math.sin(CN_PI*(m.b-k*.09))*(k%2?1:-1);return cnClip([nut(x,86+h).map(p=>cnTurn(p,[x,60+h],tilt))],(px,py)=>py<88);}).flat()}),
   KQ({acc:true,lw:.6,shape:m=>[30,100,170,240,310].flatMap((x,k)=>{const h=-80*m.e*cnArc(m.b-k*.09)*(k%2?.8:1);return cnClip([dwArc(x,80+h,30,8,0,CN_PI)],(px,py)=>py<88);})})]});
 const smoke=KQ({acc:true,lw:.55,shape:m=>[0,1,2].map(k=>cnSteam(80+110*k,30,cnFrac(m.b/2+k*.33),260)).filter(l=>l.length)});
 const brazier=KQ({lines:[dwRound(20,150,340,250,30),dwLine(50,400,40,430),dwLine(330,400,340,430),dwRound(120,250,140,96,22)],kids:[KQ({acc:true,shape:m=>[0,1,2].map(k=>{const x=150+40*k,fl=1+.2*m.e*Math.sin(K_TAU*m.b+k*2);return dwPath(`M${x-18},336 C${x-22},${336-30*fl} ${x-4},${336-50*fl} ${x},${336-66*fl} C${x+6},${336-46*fl} ${x+20},${336-30*fl} ${x+18},336 Z`)[0];})})]});
 return {name:'chestnut',root:KQ({kids:[brazier,woman,arms,pan,smoke]}),pivot:[0,430],move:null,colors:['#ff8a3d','#ffd23f'],pulse:1,ground:430,env:'autumn',box:[-500,-430,420,430]};}

// Spaghetti: on the first beat of each bar of its waltz the fork rises with a ball of spaghetti wound round it and the strands stretch,
// on the third it goes down again; the three meatballs jump, one on each beat.
function cnSpaghetti(){const lift=m=>{const z=cnFrac(m.b,3);return m.e*(z<1?Math.sin(CN_PI/2*z):z<2?1:Math.cos(CN_PI/2*(z-2)));};
 const sauce=(x,y)=>((x-0)/180)**2+((y-186)/64)**2<1;
 const heap=KQ({shape:m=>{const out=[],w=.25*Math.sin(CN_PI*m.b/3);for(let r=0;r<5;r++){const y0=378-r*50,hw=340-r*58,n=Math.round(hw/50),l=[];for(let i=0;i<=n*16;i++){const t=i/(n*16),a=t*n*K_TAU+r+w;l.push([-hw+2*hw*t+42*Math.cos(a),y0-30*Math.sin(a)]);}out.push(l);}return cnClip(out,(x,y)=>!sauce(x,y));}});
 const meat=KQ({acc:true,shape:m=>{const z=cnFrac(m.b,3);return [[-96,170],[10,140],[110,176]].flatMap(([x,y],k)=>{const h=Math.floor(z)===k?-80*m.e*Math.sin(CN_PI*(z-k)):0;return [dwArc(x,y+h,46),dwArc(x-12,y-14+h,20,12,1.1*CN_PI,1.7*CN_PI)];});},
  lines:[dwPath('M-176,206 C-196,146 -100,116 -40,134 C0,106 100,114 142,152 C204,170 176,244 112,240 C60,262 -40,254 -82,240 C-142,254 -196,244 -176,206 Z')[0]]});
 const fork=KQ({shape:m=>{const L=lift(m),dy=-230*L,x=236,y=120+dy;return [dwLine(x-36,y,x-36,y-110),dwLine(x-12,y,x-12,y-110),dwLine(x+12,y,x+12,y-110),dwLine(x+36,y,x+36,y-110),dwPath(`M${x-36},${y-110} Q${x-36},${y-150} ${x},${y-150} Q${x+36},${y-150} ${x+36},${y-110}`)[0],dwPath(`M${x-8},${y-150} L${x+60},${y-560} Q${x+76},${y-600} ${x+96},${y-560} L${x+10},${y-150}`)[0]];}});
 const wound=KQ({lw:.8,shape:m=>{const L=lift(m),dy=-230*L,x=236,y=120+dy,ph=m.b*CN_PI*.6,out=[];if(L<.05)return [];for(let k=0;k<2;k++){const yy=y-40-28*k;out.push(dwArc(x,yy,(60-8*k)*Math.min(1,L*2),18,ph+k,ph+k+1.7*CN_PI));}
   for(let k=0;k<3;k++){const x0=x-30+30*k,x1=170+40*k,y1=230,len=y1-(y-20);if(len<20)continue;const l=[];for(let i=0;i<=16;i++){const t=i/16;l.push([dwLerp(x0,x1,t)+12*Math.sin(t*CN_PI*3+k+ph)*(1-Math.abs(2*t-1)),dwLerp(y-20,y1,t)]);}out.push(l);}return out;}});
 const plate=KQ({lines:[dwArc(0,392,430,56),dwArc(0,386,330,34,0,CN_PI)]});
 return {name:'spaghetti',root:KQ({kids:[plate,heap,meat,wound,fork]}),pivot:[0,448],move:null,colors:['#ffd23f','#ff5a4a'],pulse:1,ground:448,env:'table',box:[-450,-560,460,448]};}

// Hot chocolate and churros: to its pasodoble the two churros dunk in turn, one on each beat, with a splash; steam rises from the cup.
function cnChurros(){const surf=x=>54-34*Math.sqrt(Math.max(0,1-(x/222)**2)),inCup=(x,y)=>Math.abs(x)<222&&y>surf(x)-2;
 const dunk=(m,k)=>{const z=cnFrac(m.b,2);return Math.floor(z)===k?m.e*Math.sin(CN_PI*(z-k)):0;};
 const churro=(k,T,B)=>{const len=Math.hypot(B[0]-T[0],B[1]-T[1]),u=[(B[0]-T[0])/len,(B[1]-T[1])/len],n=[-u[1],u[0]];
  const at=(s,o,d)=>[T[0]+u[0]*(s+d)+n[0]*o,T[1]+u[1]*(s+d)+n[1]*o];
  return [KQ({shape:m=>{const d=130*dunk(m,k),side=o=>{const l=[];for(let i=0;i<=20;i++)l.push(at(len*i/20,o,d));return l;};
    const top=[];for(let i=0;i<=24;i++){const a=i/24*CN_PI,q=i%2?24:34;top.push(at(-q*Math.sin(a),q*Math.cos(a),d));}
    return cnClip([side(32),side(-32),top,[at(len,32,d),at(len,-32,d)]],(x,y)=>!inCup(x,y));}}),
   KQ({lw:.55,shape:m=>{const d=130*dunk(m,k),l=o=>{const out=[];for(let i=0;i<=20;i++)out.push(at(-24+(len+24)*i/20,o,d));return out;};return cnClip([l(12),l(-12),...[[60,-22],[130,20],[200,-18],[270,22],[330,-4]].map(([q,o])=>dwArc(...at(q,o,d),5))],(x,y)=>!inCup(x,y));}}),
   KQ({acc:true,shape:m=>{const d=130*dunk(m,k);return cnClip([dwPath(`M${at(len-170,-34,d)} Q${at(len-150,0,d)} ${at(len-176,34,d)}`)[0]],(x,y)=>!inCup(x,y));}})];};
 const L=churro(0,[-360,-520],[-80,40]),R=churro(1,[360,-500],[90,40]);
 const choc=KQ({acc:true,shape:m=>{const out=[dwArc(0,54,222,34)];for(const [k,x] of [[0,-96],[1,100]]){const z=cnFrac(m.b,2);if(Math.floor(z)!==k||m.e<=0)continue;const f=z-k;out.push(dwArc(x,58,40+80*f,10+14*f));
   if(f>.3&&f<.95){const t=(f-.3)/.65;for(const s of [-1,1])out.push(dwArc(x+s*(50+90*t),40-200*t+240*t*t,12,15));}}return out;}});
 const steam=KQ({acc:true,lw:.55,shape:m=>[0,1].map(k=>cnSteam(-20+50*k,30,cnFrac(m.b/2+k*.5),180)).filter(l=>l.length)});
 const cup=KQ({lines:[dwPath('M-250,40 C-250,300 -160,370 0,370 C160,370 250,300 250,40')[0],dwArc(0,40,250,44),...dwPath('M238,110 C360,100 360,262 212,252 M242,150 C300,150 300,214 228,210'),dwArc(0,394,380,44),dwArc(0,390,250,24,0,CN_PI)]});
 return {name:'churros',root:KQ({kids:[cup,choc,steam,...L,...R]}),pivot:[0,438],move:null,colors:['#ffb15c','#ff8a3d'],pulse:1,ground:438,env:'autumn',box:[-420,-580,420,438]};}

// Milkshake: the glass sways to its cha-cha-cha, the cream sways after it, the cherry jumps on every beat, the straw bends and
// bubbles rise.
function cnShake(){const tiers=[[-224,200,80],[-290,150,70],[-350,92,60]],inCream=(x,y)=>tiers.some(([b,w,h])=>y<b+4&&Math.abs(x)<w+4&&y>b-h*1.15*Math.sqrt(Math.max(0,1-(x/(w+4))**2))-4);
 const cream=KQ({acc:true,at:[0,-224],move:m=>({r:.06*m.e*dwSwing(m.b-.25,2)}),lines:[...tiers.map(([y,w,h])=>dwPath(`M${-w},${y} C${-w},${y-h} ${-w*.3},${y-h*1.2} 0,${y-h} C${w*.3},${y-h*1.2} ${w},${y-h} ${w},${y}`)[0]),dwPath('M-24,-408 Q0,-452 24,-440')[0]],
  kids:[KQ({move:m=>({y:-60*m.e*cnArc(m.b)}),lines:[dwArc(34,-450,40)],kids:[KQ({acc:true,lines:[dwPath('M40,-488 Q50,-540 90,-560')[0]]})]})]});
 const hw=y=>y<-150?165:165-(y+150)/400*130;
 const bubbles=KQ({acc:true,shape:m=>[0,1,2,3,4].map(k=>{const f=cnFrac(m.b*.5+k*.2),y=260-f*390;return dwArc(Math.sin(k*2.3+m.b*.8)*hw(y)*.55,y,10+3*(k%3));})});
 const straw=KQ({shape:m=>{const bnd=.25*m.e*dwSwing(m.b,2),P0=[100,-80],P1=[250,-560],a=Math.atan2(P1[1]-P0[1],P1[0]-P0[0])+1.1+bnd,P2=[P1[0]+120*Math.cos(a),P1[1]+120*Math.sin(a)];
   const off=(A,B,o)=>{const l=Math.hypot(B[0]-A[0],B[1]-A[1]),n=[-(B[1]-A[1])/l*o,(B[0]-A[0])/l*o];return [[A[0]+n[0],A[1]+n[1]],[B[0]+n[0],B[1]+n[1]]];};
   const s1=off(P0,P1,16),s2=off(P0,P1,-16),t1=off(P1,P2,16),t2=off(P1,P2,-16);return cnClip([[...s1,t1[1]],[...s2,t2[1]],[t1[1],t2[1]]],(x,y)=>!inCream(x,y));}});
 const glass=KQ({lines:[dwPath('M-170,-220 C-160,80 -70,290 -24,300 L-24,400 L-150,412 Q-150,430 -120,430 L120,430 Q150,430 150,412 L24,400 L24,300 C70,290 160,80 170,-220')[0],dwArc(0,-220,170,24)],
  kids:[KQ({acc:true,shape:m=>{const l=[],tl=12*m.e*dwSwing(m.b,2);for(let i=0;i<=30;i++){const x=-160+i*320/30;l.push([x,-150+tl*x/160+8*Math.sin(x*.04+m.b*CN_PI)]);}return [l];}}),bubbles,straw,cream]});
 return {name:'milkshake',root:glass,pivot:[0,430],move:m=>({r:.045*m.e*dwSwing(m.b,2),y:-10*m.e*dwPeak(m.b,3)}),colors:['#ff7ac8','#ffffff'],pulse:1,ground:430,env:'plaza',box:[-260,-640,400,430]};}

// Boiled egg: the spoon taps it on three beats and a crack runs round it; on the fourth the top comes off like a hat and the yolk
// bubbles, then it closes again.
function cnEgg(){const CY=-170,egg='M0,-330 C110,-330 180,-160 180,-30 C180,90 100,160 0,160 C-100,160 -180,90 -180,-30 C-180,-160 -110,-330 0,-330 Z';
 const zig=[];for(let i=0;i<=8;i++)zig.push([-150+i*300/8,CY+(i%2?14:-14)]);
 const crack=n=>n>=8?zig:zig.slice(0,n+1),cracked=m=>{const z=cnFrac(m.b,4);return m.e<=0?0:z<1?3:z<2?6:8;};
 const open=m=>{const z=cnFrac(m.b,4);return z>=2.8&&z<3.7?m.e*Math.sin(CN_PI*(z-2.8)/.9):0;};
 const body=KQ({at:[0,380],move:m=>({sy:1-.03*m.e*dwPeak(m.b,4)*(cnFrac(m.b,4)<2.5?1:0)}),shape:m=>{const l=cnClip(dwPath(egg),(x,y)=>y>CY&&(y<18||Math.abs(x)>202)),c=crack(cracked(m));return c.length>1?[...l,c]:l;},
  kids:[KQ({acc:true,shape:m=>{const o=open(m);if(o<.05)return [];return [dwArc(0,CY+2,110*o+20,12*o+4),dwPath(`M-90,${CY} Q0,${CY-70*o} 90,${CY}`)[0]];}}),
   KQ({acc:true,lines:[dwPath('M-200,20 C-200,150 -120,210 -60,220 L-60,300 Q-170,320 -170,380 L170,380 Q170,320 60,300 L60,220 C120,210 200,150 200,20 Z')[0]]})]});
 const cap=KQ({at:[-120,CY],move:m=>{const o=open(m);return {y:-150*o,r:-.45*o};},shape:m=>{const l=cnClip(dwPath(egg),(x,y)=>y<CY);return cracked(m)>=8?[...l,zig]:l;}});
 const spoon=KQ({at:[560,-500],move:m=>{const z=cnFrac(m.b,4),up=z>=2.5&&z<3.5?1:Math.sin(CN_PI*z)**2,away=Ksmooth(z<2.5?0:z<2.8?(z-2.5)/.3:z<3.7?1:(4-z)/.3);return {r:.3*m.e*up,x:240*m.e*away};},lines:[dwPath('M560,-500 Q380,-440 196,-360')[0],dwArc(130,-336,68,40,0,K_TAU,Math.atan2(140,-430)+CN_PI)]});
 return {name:'egg',root:KQ({kids:[body,cap,spoon]}),pivot:[0,380],move:null,colors:['#ffffff','#ffd23f'],pulse:1,ground:380,env:'kitchen',box:[-260,-580,840,380]};}

export const CN_ART=Object.freeze([cnTeapot(),cnToaster(),cnPancake(),cnWhisk(),cnFruit(),cnIceCream(),cnFlan(),cnCake(),cnBanana(),cnPopcorn(),
 cnMoka(),cnShakers(),cnBurger(),cnHoney(),cnPizza(),cnChestnut(),cnSpaghetti(),cnChurros(),cnShake(),cnEgg()]);

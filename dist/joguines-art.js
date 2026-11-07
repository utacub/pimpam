// Joguines que ballen (CE33, 0.26): twenty toys, each one thick line of colour on black (or with a dark edge on white), drawn and
// danced like the drawings of Dibuixos que ballen (dibuixos-art.js: the same parts, movements, line and surroundings). The same units:
// about 1000 high, centred on (0, 0), y downwards.
// Toys have no face. The characters among them (the clown of the jack-in-the-box, the robot, the puppet, the dolls, the roly-poly) and
// the children who play have one (Marc, 30 October 2026).
import {Kclamp,Ksmooth,K_TAU} from './kaleido-base.js';
import {dwLine,dwArc,dwRound,dwPath,dwPart,dwPeak,dwHop,dwSwing,dwLerp,dwWheel,dwFace} from './dibuixos-art.js';

const JG_PI=Math.PI,JQ=dwPart;
// A star of n points (radii R and r), as a closed line.
const jgStar=(x,y,R,r,n=5,rot=-JG_PI/2)=>{const out=[];for(let i=0;i<=2*n;i++){const a=rot+i*JG_PI/n,k=i%2?r:R;out.push([x+Math.cos(a)*k,y+Math.sin(a)*k]);}return out;};
// A point of a cubic Bézier curve.
const jgBez=(p0,p1,p2,p3,t)=>{const u=1-t;return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];};
// A robot's step: it holds still for most of the beat and moves quickly at the start of it (-1 and 1 on alternate beats).
const jgTick=b=>{const k=Math.floor(b),f=b-k;return Math.cos(JG_PI*(k+Ksmooth(Math.min(1,f/.28))));};

// A jump that lands on every beat (a parabola, 1 half way), and the squash of the landing (1 on the beat, 0 an eighth of a beat away).
const jgArc=b=>{const f=b-Math.floor(b);return 4*f*(1-f);};
const jgLand=b=>{const d=Math.abs(b-Math.round(b));return Math.max(0,1-d*8);};

// Jack-in-the-box: the crank turns, and the clown on his spring bobs up on every beat and sways; his hat and arms flop a moment later.
function jgJack(){const B=[40,120],L0=170,Z=1.4,cx=40,by=B[1]-L0,sc=l=>l.map(([x,y])=>[cx+(x-cx)*Z,by+(y-by)*Z]),sd=d=>d.map(([x,y,r])=>[cx+(x-cx)*Z,by+(y-by)*Z,r*Z]);
 // The clown is drawn at 1/Z of its size about his feet (cx, by) and scaled up: hy is a height on that small drawing.
 const hy=y=>by+(y-by);
 const pose=m=>{const L=L0+80*m.e*dwPeak(m.b,1.5)-20*m.e,r=.16*m.e*dwSwing(m.b,4);return {L,r,top:[B[0]+Math.sin(r)*L,B[1]-Math.cos(r)*L]};};
 const spring=JQ({shape:m=>{const {L,r}=pose(m),c=Math.cos(r),s=Math.sin(r),out=[];for(let i=0;i<=10;i++){const a=i/10*L,o=i===0||i===10?0:(i%2?1:-1)*44;out.push([B[0]+s*a+c*o,B[1]-c*a+s*o]);}return [out];}});
 const y0=by;// the clown's own coordinates: feet at y0, everything above it
 const Y=d=>y0-d,face=dwFace(cx,Y(215),1.15),ruff=[];for(let i=0;i<=80;i++){const a=i/80*K_TAU,k=1+.14*Math.abs(Math.sin(5*a));ruff.push([cx+Math.cos(a)*100*k,Y(135)+Math.sin(a)*24*k]);}
 const flop=m=>m.e*dwPeak(m.b-.22,1);
 const arm=side=>JQ({shape:m=>{const f=flop(m);return [sc(dwPath(`M${cx+side*68},${Y(113)} Q${cx+side*150},${Y(147)-30*f} ${cx+side*(178+12*f)},${Y(35)-95*f}`)[0])];},
  kids:[JQ({move:m=>{const f=flop(m);return {x:side*12*f*Z,y:-95*f*Z};},dots:sd([[cx+side*178,Y(35),27]])})]});
 const hat=JQ({at:sc([[cx,Y(280)]])[0],move:m=>({r:.22*m.e*dwSwing(m.b-.3,2)}),lines:[sc(dwPath(`M${cx-58},${Y(277)} L${cx+14},${Y(433)} L${cx+58},${Y(277)}`)[0]),sc(dwPath(`M${cx-54},${Y(289)} Q${cx},${Y(273)} ${cx+54},${Y(289)}`)[0])],kids:[JQ({acc:true,dots:sd([[cx+16,Y(453),26]])})]});
 const clown=JQ({at:[cx,by],move:m=>{const p=pose(m);return {x:p.top[0]-B[0],y:p.top[1]-by,r:p.r*.6};},
  lines:[dwRound(cx-72,Y(123),144,124,40),ruff,dwArc(cx,Y(215),72),...face.lines].map(sc),dots:sd(face.dots),
  kids:[JQ({acc:true,dots:sd([[cx,Y(203),14],[cx,Y(81),11],[cx,Y(41),11]]),lines:dwPath(`M${cx-68},${Y(241)} C${cx-114},${Y(261)} ${cx-120},${Y(203)} ${cx-92},${Y(183)} M${cx+68},${Y(241)} C${cx+114},${Y(261)} ${cx+120},${Y(203)} ${cx+92},${Y(183)}`).map(sc)}),hat,arm(-1),arm(1)]});
 const box=JQ({at:[0,440],move:m=>{const k=.035*m.e*dwPeak(m.b,3);return {sx:1+k,sy:1-k};},lines:[dwRound(-210,170,400,270,16),...dwPath('M-210,170 L-130,100 L270,100 L190,170 M190,440 L270,370 L270,100 M232,270 L305,270')],dots:[[305,270,14]],
  kids:[JQ({acc:true,lines:[jgStar(-10,305,92,39)]})]});
 const lid=JQ({at:[70,100],move:m=>({sy:1+.2*m.e*dwPeak(m.b/2,2)}),lines:dwPath('M-130,100 L-62,-50 L338,-50 L270,100')});
 const crank=JQ({at:[305,270],spin:K_TAU/8,acc:true,move:m=>({r:m.b*K_TAU/8}),lines:[dwLine(305,270,305,210)],dots:[[305,200,22]]});
 return {name:'jack',root:JQ({kids:[box,crank,lid,spring,clown]}),pivot:[0,440],move:m=>({x:18*m.e*dwSwing(m.b,8)}),colors:['#ffd23f','#ff5a4a'],pulse:1,ground:440,env:'playroom'};}

// Beach ball: it bounces on every beat, squashing as it lands, and turns slowly; its shadow grows and shrinks on the sand.
function jgBall(){const R=200,cy=220,n0=[-.36,-.46,.81],l=Math.hypot(...n0),p=n0.map(v=>v/l);
 const u0=[p[2],0,-p[0]],lu=Math.hypot(...u0),u=u0.map(v=>v/lu),v=[p[1]*u[2]-p[2]*u[1],p[2]*u[0]-p[0]*u[2],p[0]*u[1]-p[1]*u[0]];
 const on=(t,f)=>{const c=Math.cos(t),s=Math.sin(t);return [0,1,2].map(i=>c*p[i]+s*(Math.cos(f)*u[i]+Math.sin(f)*v[i]));};
 const vis=(pts)=>{const out=[];let cur=[];for(const q of pts){if(q[2]>.02)cur.push([q[0]*R,cy+q[1]*R]);else{if(cur.length>1)out.push(cur);cur=[];}}if(cur.length>1)out.push(cur);return out;};
 const seams=JQ({acc:true,spin:K_TAU/16,shape:m=>{const a=m.b*K_TAU/16,out=[];for(let k=0;k<6;k++){const pts=[];for(let i=0;i<=40;i++)pts.push(on(.2+i/40*(JG_PI-.2),a+k*JG_PI/3));out.push(...vis(pts));}return out;}});
 const cap=JQ({shape:m=>{const pts=[];for(let i=0;i<=40;i++)pts.push(on(.2,i/40*K_TAU));return vis(pts);}});
 const ball=JQ({at:[0,cy+R],move:m=>{const k=m.e*jgLand(m.b);return {y:-330*m.e*jgArc(m.b),sx:1+.2*k,sy:1-.2*k};},lines:[dwArc(0,cy,R),dwArc(-92,cy-96,62,62,JG_PI*1.08,JG_PI*1.42)],kids:[cap,seams]});
 const shadow=JQ({acc:true,lw:.6,shape:m=>{const k=1-.5*m.e*jgArc(m.b);return [dwArc(0,cy+R+16,160*k,16*k)];}});
 return {name:'ball',root:JQ({kids:[ball,shadow]}),pivot:[0,cy+R],move:m=>({x:70*m.e*dwSwing(m.b,8)}),colors:['#ffffff','#ff5a4a'],pulse:1,ground:cy+R,env:'beach',box:[-280,-340,280,440]};}

// Rocking horse: it rocks on its rockers, nose down on one beat and tail down on the next; the mane and the tail fly a moment later.
// No face: it is a toy.
function jgRocking(){const C=[0,-1100],R1=1520,R2=1478,ry=(R,x)=>C[1]+Math.sqrt(R*R-x*x);
 const arc=(R,x0,x1)=>{const out=[];for(let x=x0;x<=x1+1e-6;x+=20)out.push([x,ry(R,x)]);return out;};
 const neck=[[190,-200],[215,-250],[225,-310],[250,-360]];
 const mane=JQ({acc:true,lw:.8,shape:m=>[.12,.36,.6,.84].map((t,i)=>{const [x,y]=jgBez(...neck,t),f=m.e*dwSwing(m.b-.3-i*.12,2),ex=x-120-24*f,ey=y+30+18*f;return dwPath(`M${x},${y} Q${x-50},${y-40+24*f} ${ex},${ey}`)[0];})
  .concat([dwPath('M318,-402 Q352,-382 344,-344')[0]])});
 const tail=JQ({acc:true,lw:.85,shape:m=>[0,1,2].map(k=>{const f=m.e*dwSwing(m.b-.35-k*.1,2);return dwPath(`M-256,-104 Q${-380-20*k},${-130+40*k+30*f} ${-420-30*k+20*f},${40+50*k}`)[0];})});
 const horse=JQ({lines:[...dwPath('M-250,-110 C-180,-150 -60,-120 60,-125 C120,-128 160,-150 190,-200 C215,-250 225,-310 250,-360 C265,-395 300,-420 340,-405 L455,-325 C478,-305 470,-265 438,-258 L380,-262 C345,-265 320,-285 305,-300 C290,-250 265,-160 230,-110 C215,-70 200,-40 170,-30 C100,-10 -120,-10 -200,-30 C-260,-45 -280,-90 -250,-110 Z M332,-410 L346,-470 L364,-412'),
   ...dwPath('M165,-32 L290,350 M120,-22 L235,352 M-150,-22 L-275,350 M-195,-30 L-345,345')],
  kids:[JQ({acc:true,lw:.8,lines:[...dwPath('M-80,-120 Q5,-152 92,-124 L82,-48 Q0,-32 -72,-48 Z M302,-300 L446,-306 M440,-292 Q300,-206 96,-124')]}),mane,tail]});
 const rockers=JQ({lines:[arc(R1,-580,580),arc(R2,-560,560),...dwPath('M580,305 C640,292 652,228 612,214 C582,204 566,236 586,252 M-580,305 C-640,292 -652,228 -612,214 C-582,204 -566,236 -586,252 M-560,316 L-580,305 M560,316 L580,305 M-150,404 L150,404')]});
 const th=m=>.1*m.e*dwSwing(m.b,2,.25);
 return {name:'rocking',root:JQ({kids:[rockers,horse]}),pivot:[0,C[1]+R1],move:m=>{const t=th(m);return {r:t,y:-R1*(1-Math.cos(t))};},colors:['#ffb15c','#ff6b8b'],pulse:1,ground:C[1]+R1,env:'playroom',box:[-660,-480,660,420]};}

// Wind-up robot: it marches on the spot with stiff, quick steps, one on every beat; its arms swing, the lights on its chest go along
// one by one, its antenna wobbles, its eyes look from side to side and the key in its back turns.
function jgRobot(){const S=m=>m.e*jgTick(m.b);
 const leg=side=>JQ({move:m=>({y:-46*Math.max(0,side*S(m))}),lines:[dwRound(side*95-38,160,76,200,18),dwRound(side*95-82,360,164,60,22)]});
 const arm=side=>JQ({at:[side*175,-130],move:m=>({r:side*.12+.42*S(m)*side*-1}),lines:[dwLine(side*175,-130,side*255,-10)],dots:[[side*175,-130,20]],
  kids:[JQ({at:[side*255,-10],move:m=>({r:-side*.35*m.e*(1+S(m)*side)/2}),lines:[dwLine(side*255,-10,side*268,96),dwArc(side*270,138,42,42,side>0?-.45*JG_PI:.45*JG_PI,side>0?1.05*JG_PI:-.05*JG_PI)],dots:[[side*255,-10,16]]})]});
 const light=k=>JQ({at:[-60+k*60,-45],acc:true,move:m=>{const on=m.e>0&&((Math.floor(m.b)%3)+3)%3===k?1+.45*m.e*dwPeak(m.b,1):1;return {sx:on,sy:on};},dots:[[-60+k*60,-45,22]]});
 const face=JQ({lines:[dwArc(-58,-310,34),dwArc(58,-310,34),dwArc(0,-268,50,24,.15*JG_PI,.85*JG_PI)],kids:[JQ({move:m=>({x:12*m.e*dwSwing(m.b,4)}),dots:[[-58,-310,13],[58,-310,13]]})]});
 const antenna=JQ({at:[0,-400],move:m=>({r:.26*m.e*dwSwing(m.b-.2,2)}),lines:[dwLine(0,-400,0,-500)],kids:[JQ({acc:true,dots:[[0,-518,26]]})]});
 const key=JQ({at:[262,10],acc:true,move:m=>({sy:Math.cos(m.b*K_TAU/8)}),lines:[dwArc(262,-24,28),dwArc(262,44,28)],dots:[[262,10,12]]});
 const body=JQ({at:[0,420],move:m=>({r:.035*S(m),y:-8*m.e*dwPeak(m.b,2)}),lines:[dwRound(-175,-170,350,330,40),dwRound(-110,-120,220,150,22),dwRound(-135,-400,270,200,40),...dwPath('M-35,-200 L-35,-170 M35,-200 L35,-170 M175,10 L234,10 M-150,-300 L-135,-300 M150,-300 L135,-300')],
  dots:[[-160,-300,16],[160,-300,16]],kids:[light(0),light(1),light(2),face,antenna,key,arm(-1),arm(1)]});
 return {name:'robot',root:JQ({kids:[leg(-1),leg(1),body]}),pivot:[0,420],move:m=>({x:24*m.e*dwSwing(m.b,8)}),colors:['#5fd3ff','#ffd23f'],pulse:1,ground:420,env:'playroom',box:[-340,-560,340,420]};}

// Kite: it sways in the wind and climbs a little on a gust at the start of every bar of its waltz; its tail of bows waves behind it. The string runs down to a
// stake in the grass.
function jgKite(){const A=[0,-370],pose=m=>({x:70*m.e*dwSwing(m.b,12),y:-56*m.e*dwPeak(m.b/3,2)+24*m.e,r:.13*m.e*dwSwing(m.b,6)});
 const tp=(f,m)=>{const a=(14+46*f)*(.25+.75*m.e);return [a*Math.sin(K_TAU*(f*1.1-m.b/2))+90*f*f,40+f*370];};
 const tail=JQ({lw:.8,shape:m=>{const out=[];for(let i=0;i<=30;i++)out.push(tp(i/30,m));return [out];}});
 const bows=JQ({acc:true,lw:.8,shape:m=>[.3,.64,.98].flatMap(f=>{const [x,y]=tp(f,m);return dwPath(`M${x},${y} L${x-38},${y-23} L${x-38},${y+23} Z M${x},${y} L${x+38},${y-23} L${x+38},${y+23} Z`);})});
 const kite=JQ({at:A,move:pose,lines:[...dwPath('M0,-600 L230,-370 L0,40 L-230,-370 Z M-230,-370 Q0,-428 230,-370')],kids:[JQ({acc:true,lw:.75,lines:[dwLine(0,-600,0,40),...dwPath('M-115,-485 L115,-255 M115,-485 L-115,-255')]}),tail,bows]});
 const string=JQ({lw:.5,shape:m=>{const p=pose(m),x=A[0]+p.x,y=A[1]+p.y;return [dwPath(`M${x},${y} Q${x-230},${y+520} -540,404`)[0]];}});
 return {name:'kite',root:JQ({kids:[kite,string,JQ({lines:dwPath('M-540,404 L-540,360 M-580,424 L-500,424')})]}),pivot:[0,424],move:null,colors:['#ff7ac8','#5fd3ff'],pulse:3,ground:424,env:'sky',box:[-580,-640,330,424]};}

// Russian dolls: three dolls, big, middle and small, hop in turn, one on each beat of the waltz; every second bar the big one lifts
// her top half instead, and a tiny doll peeps out.
function jgDolls(){const g=420,seam=-.52;
 const outline=(x,H)=>{const f=(a,b)=>`${x+a*H},${g+b*H}`;return dwPath(`M${f(0,-1)} C${f(.17,-1)} ${f(.25,-.88)} ${f(.24,-.72)} C${f(.23,-.66)} ${f(.31,-.55)} ${f(.31,-.35)} C${f(.31,-.15)} ${f(.29,-.02)} ${f(.26,0)} L${f(-.26,0)} C${f(-.29,-.02)} ${f(-.31,-.15)} ${f(-.31,-.35)} C${f(-.31,-.55)} ${f(-.23,-.66)} ${f(-.24,-.72)} C${f(-.25,-.88)} ${f(-.17,-1)} ${f(0,-1)}`)[0];};
 // The outline cut at the seam: the top (over the head, from the seam on the left to the seam on the right) and the bottom.
 const cut=(x,H)=>{const l=outline(x,H),ys=g+seam*H,i=l.findIndex(p=>p[1]>ys),j=l.length-1-[...l].reverse().findIndex(p=>p[1]>ys);return {top:[...l.slice(j+1),...l.slice(1,i)],bottom:l.slice(i-1,j+2),half:Math.abs(l[i][0]-x)};};
 const lift=m=>{const z=((m.b%6)+6)%6;return z<3?0:m.e*Math.sin(JG_PI*(z-3)/3)**2;};
 const hop=(m,k)=>{const z=((m.b%6)+6)%6;if(k===0&&z>=3)return 0;return Math.floor(z)%3===k?m.e*Math.sin(JG_PI*(z-Math.floor(z))):0;};
 const doll=(x,H,k)=>{const c=cut(x,H),f=dwFace(x,g-.79*H,H/560,1.1),ys=g+seam*H;
  const top=JQ({at:[x+c.half,ys],move:k===0?m=>{const L=lift(m);return {y:-.2*H*L,r:.2*L};}:null,
   lines:[c.top,dwLine(x-c.half,ys,x+c.half,ys),dwArc(x,g-.8*H,.15*H,.14*H),...f.lines,dwPath(`M${x-.13*H},${g-.86*H} Q${x},${g-.97*H} ${x+.13*H},${g-.86*H}`)[0]],dots:f.dots,
   kids:[JQ({acc:true,dots:[[x-.105*H,g-.755*H,.027*H],[x+.105*H,g-.755*H,.027*H]]})]});
  const apron=JQ({acc:true,lines:[...[0,1,2,3,4].map(a=>dwArc(x+Math.cos(a*K_TAU/5-JG_PI/2)*.08*H,g-.3*H+Math.sin(a*K_TAU/5-JG_PI/2)*.08*H,.045*H)),dwPath(`M${x},${g-.21*H} Q${x+.03*H},${g-.12*H} ${x-.05*H},${g-.07*H}`)[0]],dots:[[x,g-.3*H,.03*H]]});
  const peep=JQ({shape:m=>{const L=k===0?lift(m):0;if(L<.15)return [];const r=.085*H,y=ys-r*1.5*L+r*.2;return [dwArc(x,y,r,r,JG_PI,K_TAU),dwArc(x-r*.38,y-r*.15,r*.1),dwArc(x+r*.38,y-r*.15,r*.1),dwArc(x,y+r*.05,r*.4,r*.32,.15*JG_PI,.85*JG_PI)];}});
  return JQ({at:[x,g],move:m=>({y:-(30+.12*H)*hop(m,k)}),kids:[JQ({lines:[c.bottom,dwArc(x,g-.3*H,.19*H,.2*H)]}),apron,peep,top]});};
 return {name:'dolls',root:JQ({kids:[doll(-330,720,0),doll(90,520,1),doll(390,360,2)]}),pivot:[0,420],move:m=>({r:.025*m.e*dwSwing(m.b,6)}),colors:['#ff6b8b','#ffd23f'],pulse:1,ground:420,env:'stage',box:[-560,-320,520,420]};}

// Spinning top (a baldufa): seen a little from above, it spins (the marks on its top go round, at most a quarter of a turn a second),
// leans and circles slowly on its point, and on every beat a ring of dust spreads from the point.
function jgTop(){const Rr=y=>y<-230?300*Math.sqrt(Math.max(0,1-((y+230)/80)**2)):dwLerp(300,40,Ksmooth(Math.min(1,(y+230)/470))**.8);
 const side=[];for(let y=-300;y<=240;y+=10)side.push([Rr(y),y]);const outline=[...side,[16,320],[0,400],[-16,320],...side.reverse().map(([x,y])=>[-x,y])];
 const marks=JQ({acc:true,spin:K_TAU/8,shape:m=>{const out=[];for(let k=0;k<3;k++){const a=k*K_TAU/3+m.b*K_TAU/8,l=[];for(let i=0;i<=8;i++){const f=a+i*.09,r=110+i*14;l.push([r*Math.cos(f),-300+.2*r*Math.sin(f)]);}out.push(l);}return out;}});
 const top=JQ({at:[0,400],move:m=>({r:.1*m.e*dwSwing(m.b,4)}),lines:[outline,dwArc(0,-300,300,60),dwRound(-28,-470,56,170,24),dwArc(0,-302,28,8,0,JG_PI),dwArc(0,240,40,9,0,JG_PI)],
  kids:[marks,JQ({acc:true,lines:[dwArc(0,-150,Rr(-150),40,.02*JG_PI,.98*JG_PI),dwArc(0,-40,Rr(-40),30,.02*JG_PI,.98*JG_PI)]})]});
 const dust=JQ({acc:true,lw:.6,shape:m=>{if(m.e<=0)return [];const f=((m.b%1)+1)%1;if(f>.8)return [];return [dwArc(0,404,50+190*f,12+30*f,f*.9,JG_PI-f*.9)];}});
 return {name:'top',root:JQ({kids:[top,dust]}),pivot:[0,404],move:m=>({x:40*m.e*dwSwing(m.b,8)}),colors:['#ff8a3d','#5fd3ff'],pulse:1,ground:404,env:'playroom',box:[-340,-480,340,404]};}

// Skipping rope: the girl jumps on every beat as the rope goes over her head and under her feet; her bunches bounce.
function jgRope(){const jump=m=>-130*m.e*jgArc(m.b),phase=m=>m.b;
 const hand=(side,m)=>[side*205,-40-22*Math.cos(K_TAU*phase(m))+jump(m)];
 const face=dwFace(0,-336,1.15);
 const bunch=side=>JQ({at:[side*74,-366],move:m=>({r:-side*.25*m.e*Math.cos(K_TAU*(m.b-.2))}),lines:[dwPath(`M${side*72},-368 Q${side*146},-378 ${side*140},-290`)[0]],kids:[JQ({acc:true,lines:dwPath(`M${side*78},-380 L${side*112},-404 L${side*118},-358 Z M${side*78},-380 L${side*50},-414 L${side*40},-374 Z`)})]});
 const girl=JQ({move:m=>({y:jump(m)}),lines:[dwArc(0,-336,76),...face.lines,dwArc(0,-344,84,88,JG_PI*1.08,JG_PI*1.92),...dwPath('M0,-260 L0,-250 M-62,-250 L62,-250 L172,40 L-172,40 Z M-48,40 L-48,398 L-94,410 M48,40 L48,398 L94,410')],dots:face.dots,
  kids:[JQ({acc:true,lines:dwPath('M-30,-250 L0,-216 L30,-250')}),bunch(-1),bunch(1)]});
 const arms=JQ({shape:m=>[-1,1].map(side=>{const [hx,hy]=hand(side,m);return dwPath(`M${side*56},${-238+jump(m)} Q${side*150},${-180+jump(m)} ${hx},${hy}`)[0];})});
 const handles=JQ({acc:true,shape:m=>[-1,1].map(side=>{const [hx,hy]=hand(side,m);return dwLine(hx,hy-34,hx+side*6,hy+44);})});
 const rope=JQ({acc:true,lw:.55,shape:m=>{const L=hand(-1,m),R=hand(1,m),L2=[L[0],L[1]+44],R2=[R[0]+6,R[1]+44],My=-70-490*Math.cos(K_TAU*phase(m)),cx=0,cyc=2*My-(L2[1]+R2[1])/2;return [dwPath(`M${L2[0]},${L2[1]} Q${cx},${cyc} ${R2[0]},${R2[1]}`)[0]];}});
 return {name:'rope',root:JQ({kids:[girl,arms,handles,rope]}),pivot:[0,420],move:null,colors:['#c58cff','#7dff7a'],pulse:1,ground:420,env:'park',box:[-300,-580,300,420]};}

// Pinwheel: its four sails turn in the wind (at most a quarter of a turn a second), it leans with the gusts, every two beats, and lines
// of wind blow past.
function jgPinwheel(){const C=[0,-230];
 const sail=a=>{const T=[C[0]+290*Math.cos(a),C[1]+290*Math.sin(a)],Qc=[C[0]+330*Math.cos(a+.72),C[1]+330*Math.sin(a+.72)],E=[C[0]+46*Math.cos(a+JG_PI/2),C[1]+46*Math.sin(a+JG_PI/2)];
  return dwPath(`M${C[0]},${C[1]} L${T[0]},${T[1]} Q${Qc[0]},${Qc[1]} ${E[0]},${E[1]}`)[0];};
 const sails=JQ({at:C,spin:K_TAU/8,move:m=>({r:m.b*K_TAU/8}),lines:[0,1,2,3].map(k=>sail(k*JG_PI/2-JG_PI/4))});
 const folds=JQ({at:C,acc:true,lw:.7,spin:K_TAU/8,move:m=>({r:m.b*K_TAU/8}),lines:[0,1,2,3].map(k=>{const a=k*JG_PI/2-JG_PI/4;return dwLine(C[0]+40*Math.cos(a+.5),C[1]+40*Math.sin(a+.5),C[0]+210*Math.cos(a+.42),C[1]+210*Math.sin(a+.42));})});
 const wind=JQ({acc:true,lw:.55,shape:m=>{if(m.e<=0)return [];const f=((m.b/2)%1+1)%1;if(f>.7)return [];const out=[];for(let k=0;k<3;k++){const y=-420+k*170,x=560-f*900-k*40,len=200*m.e;out.push(dwPath(`M${x},${y} Q${x-len/2},${y-26} ${x-len},${y}`)[0]);}return out;}});
 return {name:'pinwheel',root:JQ({lines:[dwPath('M0,-210 Q16,100 0,430')[0]],dots:[[0,-230,20]],kids:[sails,folds,JQ({acc:true,dots:[[0,-230,20]]}),wind]}),pivot:[0,430],move:m=>({r:.05*m.e*dwSwing(m.b,4)+.03*m.e*dwPeak(m.b/2,2)}),
  colors:['#7dff7a','#ff7ac8'],pulse:2,ground:430,env:'park',box:[-360,-560,360,430]};}

// Puppet on strings, in a barretina: on every beat one leg kicks and the other arm goes up, the cross of the strings tips from side to
// side and the strings follow the hands and the knees.
function jgPuppet(){const pose=m=>{const kL=m.e*dwPeak(m.b/2,2),kR=m.e*dwPeak((m.b-1)/2,2),dy=-26*m.e*dwHop(m.b),r=.14*m.e*dwSwing(m.b,2);
  const L=(a,b,k)=>[dwLerp(a[0],b[0],k),dwLerp(a[1],b[1],k)+dy];
  const legs=[-1,1].map(s=>{const k=s<0?kL:kR;return {hip:[s*38,40+dy],knee:L([s*46,215],[s*120,120],k),foot:L([s*50,385],[s*178,240],k)};});
  const arms=[-1,1].map(s=>{const k=s<0?kR:kL;return {sh:[s*66,-196+dy],elbow:L([s*112,-110],[s*196,-170],k),hand:L([s*128,-24],[s*226,-262],k)};});
  return {legs,arms,dy,r};};
 const ctrl=(m,x)=>{const {r}=pose(m),y=-640-18*m.e*dwPeak(m.b,2);return [x*Math.cos(r),y+x*Math.sin(r)];};
 const bar=JQ({acc:true,shape:m=>{const a=ctrl(m,-250),b=ctrl(m,250),c=ctrl(m,0);return [dwLine(a[0],a[1],b[0],b[1]),dwLine(c[0],c[1]-60,c[0],c[1]+60)];},dots:[]});
 const strings=JQ({lw:.35,shape:m=>{const p=pose(m),out=[];[-1,1].forEach((s,i)=>{const h=ctrl(m,s*250),k=ctrl(m,s*120);out.push(dwLine(h[0],h[1],p.arms[i].hand[0],p.arms[i].hand[1]),dwLine(k[0],k[1],p.legs[i].knee[0],p.legs[i].knee[1]));});const c=ctrl(m,0);out.push(dwLine(c[0],c[1]+60,0,-388+p.dy));return out;}});
 const limbs=JQ({shape:m=>{const p=pose(m),out=[];for(const l of p.legs)out.push([l.hip,l.knee,l.foot],dwLine(l.foot[0]-4,l.foot[1],l.foot[0]+Math.sign(l.foot[0])*52,l.foot[1]+6));for(const a of p.arms)out.push([a.sh,a.elbow,a.hand]);return out;},
  kids:[JQ({acc:true,shape:m=>{const p=pose(m);return [...p.legs.map(l=>dwArc(l.knee[0],l.knee[1],14)),...p.arms.map(a=>dwArc(a.elbow[0],a.elbow[1],12))];}}),JQ({shape:m=>pose(m).arms.map(a=>dwArc(a.hand[0],a.hand[1],22))})]});
 const face=dwFace(0,-280);
 const head=JQ({at:[0,-214],move:m=>({y:pose(m).dy,r:.6*pose(m).r}),lines:[dwArc(0,-280,64),...face.lines,dwLine(0,-216,0,-200)],dots:face.dots,
  kids:[JQ({acc:true,lines:dwPath('M-66,-300 C-72,-366 -18,-398 42,-390 C96,-384 132,-344 124,-296 C108,-330 84,-344 62,-306 M-66,-300 Q0,-322 66,-300')})]});
 const body=JQ({move:m=>({y:pose(m).dy}),lines:dwPath('M-66,-200 L66,-200 L92,40 L-92,40 Z'),kids:[JQ({acc:true,lines:[dwLine(-80,-60,80,-60)],dots:[[0,-130,10],[0,-20,10]]})]});
 return {name:'puppet',root:JQ({kids:[bar,strings,body,limbs,head]}),pivot:[0,420],move:m=>({x:30*m.e*dwSwing(m.b,8)}),colors:['#ffc23d','#ff5a4a'],pulse:1,ground:420,env:'stage',box:[-320,-720,320,420]};}

// Yo-yo: it runs down its string and climbs back to the hand, which catches it with a flick every two beats; the string swings a
// little to the sides, and the yo-yo turns slowly.
function jgYoyo(){const F=[21,-462],pos=m=>{const s=(1-Math.cos(JG_PI*m.b))/2,len=160+560*s*m.e,a=.2*m.e*dwSwing(m.b,8),hy=-26*m.e*dwPeak(m.b/2,3);return {x:F[0]+Math.sin(a)*len,y:F[1]+hy+Math.cos(a)*len,hy,s:s*m.e};};
 const hand=JQ({move:m=>({y:pos(m).hy}),lines:[dwRound(-96,-760,192,56,20),...dwPath('M-84,-704 L-84,-572 M84,-704 L84,-586 M-84,-660 Q-150,-636 -138,-584 Q-128,-552 -86,-566'),...[-63,-21,21,63].map((x,k)=>dwPath(`M${x-18},-574 L${x-18},${k%3?-488:-506} Q${x-18},${k%3?-466:-484} ${x},${k%3?-466:-484} Q${x+18},${k%3?-466:-484} ${x+18},${k%3?-488:-506} L${x+18},-574`)[0])]});
 const yoyo=JQ({at:[0,-232],move:m=>{const p=pos(m);return {x:p.x,y:p.y+232,sy:1+.06*p.s,sx:1-.03*p.s};},lines:[dwArc(0,-232,125),dwArc(0,-232,92)],dots:[[0,-232,20]],
  kids:[JQ({at:[0,-232],acc:true,spin:K_TAU/8,move:m=>({r:m.b*K_TAU/8}),lines:[dwArc(0,-232,60,60,0,.9),dwArc(0,-232,60,60,JG_PI,JG_PI+.9)]})]});
 const string=JQ({lw:.45,shape:m=>{const p=pos(m);return [dwLine(F[0],F[1]+p.hy,p.x,p.y-20)];}});
 return {name:'yoyo',root:JQ({kids:[hand,string,yoyo]}),pivot:[0,0],move:null,colors:['#4dd9c0','#ff5a4a'],pulse:2,ground:470,env:'notes',box:[-330,-760,330,420]};}

// Dominoes: on every beat one more falls onto the next, from left to right, until the last lies flat; then they all stand up again.
// Each one stops where it touches the next.
function jgDominoes(){const g=420,H=380,W=100,xs=[-560,-300,-40,220,480],PIP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]},faces=[[1,3],[2,5],[4,2],[6,1],[3,3]];
 const quad=(k,t)=>{const c=Math.cos(t),s=Math.sin(t),px=xs[k]+W;return [[-W,0],[0,0],[0,-H],[-W,-H]].map(([x,y])=>[px+x*c-y*s,g+x*s+y*c]);};
 const apart=(A,B)=>{for(const P of [A,B])for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],nx=b[1]-a[1],ny=a[0]-b[0];let a0=Infinity,a1=-Infinity,b0=Infinity,b1=-Infinity;for(const p of A){const d=p[0]*nx+p[1]*ny;a0=Math.min(a0,d);a1=Math.max(a1,d);}for(const p of B){const d=p[0]*nx+p[1]*ny;b0=Math.min(b0,d);b1=Math.max(b1,d);}if(a1<=b0+1e-6||b1<=a0+1e-6)return true;}return false;};
 const lean=Math.asin((xs[1]-xs[0]-W)/H);
 let lastM=null,lastT=null;
 const angles=m=>{if(m===lastM)return lastT;const z=((m.b%8)+8)%8,free=k=>{const start=k+1-(k<4?.45*Math.sqrt(lean/(JG_PI/2)):.45);return JG_PI/2*Kclamp((z-start)/.45)**2;};
  const fall=z0=>{const t=[0,0,0,0,0];t[4]=free(4);for(let k=3;k>=0;k--){const want=free(k);if(want<=0){t[k]=0;continue;}let lo=0,hi=Math.min(want,JG_PI/2);if(!apart(quad(k,hi),quad(k+1,t[k+1]))){for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(apart(quad(k,mid),quad(k+1,t[k+1])))lo=mid;else hi=mid;}t[k]=lo;}else t[k]=hi;}return t;};
  let t;if(z<6||m.e<=0)t=fall(z);else{const s=Ksmooth(Kclamp((z-6)/1.5));t=fall(5.99).map(a=>a*(1-s));}
  lastM=m;lastT=t.map(a=>a*Math.min(1,m.e*1.5));return lastT;};
 const domino=k=>{const x=xs[k],pts=(n,top)=>PIP[n].map(i=>[x+22+(i%3)*28,(top?g-H:g-H/2)+34+Math.floor(i/3)*61,13]);
  return JQ({at:[x+W,g],move:m=>({r:angles(m)[k]}),lines:[dwRound(x,g-H,W,H,14),dwLine(x+12,g-H/2,x+W-12,g-H/2)],kids:[JQ({acc:true,dots:[...pts(faces[k][0],true),...pts(faces[k][1],false)]})]});};
 return {name:'dominoes',root:JQ({kids:[0,1,2,3,4].map(domino)}),pivot:[200,g],move:null,colors:['#ffffff','#ff8a3d'],pulse:1,ground:g,env:'table',box:[-580,-400,900,g]};}

// Hula hoop: the hoop goes round her waist once on every beat while her hips sway the other way; her arms wave and her ponytail swings.
function jgHula(){const ph=m=>K_TAU*m.b,hip=m=>-26*m.e*Math.cos(ph(m));
 const face=dwFace(0,-372);
 const upper=JQ({at:[0,-70],move:m=>({x:hip(m)*.45,r:.04*m.e*Math.cos(ph(m))}),lines:[dwArc(0,-372,62),...face.lines,dwArc(0,-380,70,72,JG_PI*1.1,JG_PI*1.9),...dwPath('M0,-310 L0,-292 M-58,-286 L58,-286 L46,-70 L-46,-70 Z')],dots:face.dots,
  kids:[JQ({at:[56,-410],acc:true,move:m=>({r:.35*m.e*Math.sin(ph(m)-1)}),lines:dwPath('M52,-418 Q120,-430 138,-360 Q150,-300 120,-270')}),
   JQ({shape:m=>[-1,1].map(s=>{const w=m.e*Math.sin(ph(m)/2+(s>0?JG_PI:0)),hx=s*(190+20*w),hy=-500-50*w;return dwPath(`M${s*56},-276 Q${s*130},-330 ${hx},${hy}`)[0];}),dots:[]}),
   JQ({acc:true,shape:m=>[-1,1].map(s=>{const w=m.e*Math.sin(ph(m)/2+(s>0?JG_PI:0));return dwArc(s*(190+20*w),-500-50*w,20);})})]});
 const lower=JQ({shape:m=>{const h=hip(m);return [dwPath(`M${h-50},-70 L${h+50},-70 L${h+60},40 L${h+6},40 L${h},4 L${h-6},40 L${h-60},40 Z`)[0],dwPath(`M${h-34},40 L-72,404 L-116,412 M${h+34},40 L72,404 L116,412`)[0]];}});
 const hoop=JQ({acc:true,shape:m=>{const h=hip(m),a=ph(m),e=m.e;return [dwArc(h-80*e*Math.cos(a),-62+10*e*Math.sin(a),232,48,0,K_TAU,.1*e*Math.sin(a))];}});
 return {name:'hula',root:JQ({kids:[lower,upper,hoop]}),pivot:[0,412],move:null,colors:['#c58cff','#7dff7a'],pulse:1,ground:412,env:'beach',box:[-340,-600,340,412]};}

// Castle of blocks: on every beat one block hops, from the bottom row up to the roof, and at the end of the turn they all hop together;
// the flag on top waves.
function jgBlocks(){const S=190,cells=[[-200,230],[0,230],[200,230],[-100,40],[100,40],[0,-150]];
 const sym=(i,x,y)=>{const c=[x,y+S/2];switch(i){case 0:return [jgStar(c[0],c[1],62,26)];case 1:return [dwArc(c[0],c[1],52)];case 2:return [dwPath(`M${c[0]},${c[1]-56} L${c[0]+58},${c[1]+44} L${c[0]-58},${c[1]+44} Z`)[0]];
  case 3:return dwPath(`M${c[0]},${c[1]+50} C${c[0]-80},${c[1]-10} ${c[0]-50},${c[1]-70} ${c[0]},${c[1]-30} C${c[0]+50},${c[1]-70} ${c[0]+80},${c[1]-10} ${c[0]},${c[1]+50} Z`);
  case 4:return [dwArc(c[0],c[1],52,52,.25*JG_PI,1.75*JG_PI),dwArc(c[0]+30,c[1],40,40,.62*JG_PI,1.38*JG_PI)];default:return [dwPath(`M${c[0]},${c[1]-60} L${c[0]+46},${c[1]} L${c[0]},${c[1]+60} L${c[0]-46},${c[1]} Z`)[0]];}};
 const up=(m,k)=>{const z=((m.b%8)+8)%8,beat=Math.floor(z),f=z-beat;return m.e*(beat===k||beat===7?Math.sin(JG_PI*f)*(beat===7?1.4:1):0);};
 const block=(k)=>{const [x,y]=cells[k];return JQ({at:[x,y+S],move:m=>{const h=up(m,k);return {y:-40*h,sx:1+.04*h,sy:1-.02*h};},lines:[dwRound(x-S/2+6,y,S-12,S,18)],kids:[JQ({acc:true,lines:sym(k,x,y)})]});};
 const flag=JQ({acc:true,shape:m=>{const w=m.e*Math.sin(K_TAU*m.b/2);return [dwPath(`M0,-470 Q60,${-490+18*w} 130,${-462+10*w} Q60,${-440+14*w} 0,-420`)[0]];}});
 const roof=JQ({at:[0,-150],move:m=>{const h=up(m,6);return {y:-40*h};},lines:[...dwPath('M-130,-150 L0,-330 L130,-150 Z M0,-330 L0,-470')],kids:[flag]});
 return {name:'blocks',root:JQ({kids:[0,1,2,3,4,5].map(block).concat([roof])}),pivot:[0,420],move:m=>({r:.018*m.e*dwSwing(m.b,4)}),colors:['#ff8a3d','#5fd3ff'],pulse:1,ground:420,env:'playroom',box:[-320,-480,320,420]};}

// Soap bubbles: on every beat the wand blows a bubble, which grows, floats up and away and pops three beats later.
function jgBubbles(){const L=[-120,-112],rnd=k=>{const v=Math.sin(k*78.233+12.9)*43758.5453;return v-Math.floor(v);};
 const bubble=(k,b)=>{const age=b-k,v=rnd(k),w=rnd(k+31);return {x:L[0]+age*(140+70*v)+28*Math.sin(age*2.2+k),y:L[1]-age*(150+40*w)-14*age*age,r:(26+54*Math.min(1,age*1.6))*(.85+.35*w),age};};
 const list=m=>{const out=[],b=m.b;for(let k=Math.floor(b)-3;k<=Math.floor(b);k++){const q=bubble(k,b);if(q.age>=0&&q.age<3.35)out.push(q);}return out;};
 const bubbles=JQ({shape:m=>list(m).filter(q=>q.age<3).map(q=>dwArc(q.x,q.y,q.r))});
 const shine=JQ({acc:true,lw:.6,shape:m=>list(m).flatMap(q=>{if(q.age<3)return q.r>34?[dwArc(q.x,q.y,q.r*.66,q.r*.66,JG_PI*1.1,JG_PI*1.42)]:[];const f=(q.age-3)/.35,out=[];for(let i=0;i<6;i++){const a=i*K_TAU/6+.3;out.push(dwLine(q.x+Math.cos(a)*q.r*(.7+.5*f),q.y+Math.sin(a)*q.r*(.7+.5*f),q.x+Math.cos(a)*q.r*(1+.6*f),q.y+Math.sin(a)*q.r*(1+.6*f)));}return out;})});
 const wand=JQ({at:[-430,430],move:m=>({r:-.07*m.e*dwPeak(m.b,2)}),lines:[dwLine(-430,430,-170,-40),dwArc(L[0],L[1],88)],kids:[JQ({acc:true,lines:[dwRound(-452,300,58,140,20)]})]});
 const bottle=JQ({lines:[...dwPath('M270,430 L270,210 Q270,166 312,156 L312,112 L372,112 L372,156 Q414,166 414,210 L414,430 Z'),dwRound(300,80,84,34,10)],kids:[JQ({acc:true,lines:[dwArc(342,300,44,56)]})]});
 return {name:'bubbles',root:JQ({kids:[bottle,wand,bubbles,shine]}),pivot:[0,430],move:null,colors:['#4dd9c0','#ff7ac8'],pulse:1,ground:430,env:'park',box:[-470,-620,500,430]};}

// Pogo stick: the boy bounces on every beat; the spring squashes as he lands and his knees bend. The pole goes behind his shirt.
function jgPogo(){const sq=m=>m.e*jgLand(m.b);
 const spring=JQ({shape:m=>{const c=sq(m),top=300+70*c,out=[];for(let i=0;i<=8;i++){const y=dwLerp(top,412,i/8),o=i===0||i===8?0:(i%2?1:-1)*34;out.push([o,y]);}return [out,dwLine(0,412,0,430)];}});
 const face=dwFace(0,-424,1.15);
 const rider=JQ({move:m=>({y:70*sq(m)}),lines:[dwLine(0,-30,0,150),dwLine(0,-196,0,-178),dwLine(-128,-196,128,-196),dwRound(-24,150,48,152,18),dwLine(-104,150,104,150),dwArc(0,-424,74),...face.lines,...dwPath('M0,-350 L0,-336 M-82,-334 L82,-334 L76,-96 L-76,-96 Z M-76,-96 L76,-96 L82,-30 L-82,-30 Z')],dots:face.dots,
  kids:[JQ({acc:true,lines:[...dwPath('M-78,-436 Q-74,-516 0,-518 Q74,-516 78,-436 L150,-426'),dwRound(-150,-208,56,24,10),dwRound(94,-208,56,24,10),dwLine(-76,-220,76,-220)]}),
   JQ({shape:m=>{const c=sq(m);return [-1,1].map(s=>dwPath(`M${s*50},-30 L${s*(96+40*c)},${60+20*c} L${s*86},150`)[0]).concat([-1,1].map(s=>dwPath(`M${s*78},-318 Q${s*150},-290 ${s*122},-204`)[0]));}})]});
 return {name:'pogo',root:JQ({kids:[spring,rider]}),pivot:[0,430],move:m=>({y:-150*m.e*jgArc(m.b)}),colors:['#7dff7a','#ffd23f'],pulse:1,ground:430,env:'park',box:[-280,-530,280,430]};}

// Carousel: three horses on their poles go up and down one after another, one on each beat of the waltz; the lights along the canopy
// go along and the flag on top waves. The horses have no face: they are toys.
function jgCarousel(){const xs=[-300,0,300],horse=(x,y)=>{const f=(a,b)=>`${x+a*.5},${y+b*.5}`;return dwPath(`M${f(-250,-110)} C${f(-180,-150)} ${f(-60,-120)} ${f(60,-125)} C${f(120,-128)} ${f(160,-150)} ${f(190,-200)} C${f(215,-250)} ${f(225,-310)} ${f(250,-360)} C${f(265,-395)} ${f(300,-420)} ${f(340,-405)} L${f(455,-325)} C${f(478,-305)} ${f(470,-265)} ${f(438,-258)} L${f(380,-262)} C${f(345,-265)} ${f(320,-285)} ${f(305,-300)} C${f(290,-250)} ${f(265,-160)} ${f(230,-110)} C${f(215,-70)} ${f(200,-40)} ${f(170,-30)} C${f(100,-10)} ${f(-120,-10)} ${f(-200,-30)} C${f(-260,-45)} ${f(-280,-90)} ${f(-250,-110)} Z M${f(332,-410)} L${f(346,-470)} L${f(364,-412)} M${f(160,-30)} L${f(250,120)} L${f(330,90)} M${f(110,-20)} L${f(170,140)} M${f(-150,-22)} L${f(-250,130)} M${f(-200,-30)} L${f(-330,100)}`);};
 const bob=(m,k)=>60*m.e*dwSwing(m.b-k,3,.25);
 const rider=k=>JQ({move:m=>({y:bob(m,k)}),lines:horse(xs[k]-20,80),kids:[JQ({acc:true,lines:dwPath(`M${xs[k]-50},${80-62} Q${xs[k]-17},${80-80} ${xs[k]+20},${80-62} M${xs[k]+120},${80-188} Q${xs[k]+90},${80-150} ${xs[k]+70},${80-120}`)})]});
 const lights=JQ({acc:true,shape:m=>{const out=[];for(let j=0;j<7;j++){const on=m.e>0&&((Math.floor(m.b)%7)+7)%7===j,r=on?20:13;out.push(dwArc(-450+j*150,-300,r));}return out;}});
 const flag=JQ({acc:true,shape:m=>{const w=m.e*Math.sin(K_TAU*m.b/3);return [dwPath(`M0,-690 Q60,${-706+16*w} 120,${-680+10*w} Q60,${-664+12*w} 0,-650`)[0]];}});
 const valance=[];for(let j=0;j<6;j++)valance.push(...dwArc(-375+j*150,-360,75,58,0,JG_PI).map(p=>p));
 return {name:'carousel',root:JQ({lines:[...dwPath('M-450,-360 L0,-600 L450,-360 Z M0,-600 L0,-690'),valance,...xs.map(x=>dwLine(x,-302,x,330)),dwRound(-480,330,960,80,30)],kids:[JQ({acc:true,lw:.7,lines:[dwLine(0,-600,-225,-360),dwLine(0,-600,225,-360)]}),flag,lights,...[0,1,2].map(rider)]}),
  pivot:[0,410],move:m=>({y:-6*m.e*dwPeak(m.b/3,2)}),colors:['#ffc23d','#ff7ac8'],pulse:1,ground:410,env:'circus',box:[-500,-700,500,410]};}

// Roly-poly: it rocks from side to side on its round bottom, one way on each beat, and never falls; its head nods a moment later.
function jgRoly(){const face=dwFace(0,-172,1.1);
 const head=JQ({at:[0,-58],move:m=>({r:-.14*m.e*dwSwing(m.b-.25,2,.25)}),lines:[dwArc(0,-170,120,120,.62*JG_PI,2.38*JG_PI),...face.lines],dots:face.dots,
  kids:[JQ({acc:true,lines:[dwPath('M-70,-266 L-10,-400 L54,-276')[0]],dots:[[-10,-412,22],[-62,-138,16],[62,-138,16]]})]});
 const body=JQ({lines:[dwPath('M44,-59 C50,-40 52,-28 55,-13')[0],dwArc(0,200,220,220,-.42*JG_PI,1.42*JG_PI),dwPath('M-55,-13 C-52,-28 -50,-40 -44,-59')[0],...dwPath('M-150,30 Q-190,170 -74,224 M150,30 Q190,170 74,224')],dots:[[-66,226,24],[66,226,24]],
  kids:[JQ({acc:true,lines:dwPath('M0,300 C-80,240 -56,176 0,212 C56,176 80,240 0,300 Z')})]});
 const th=m=>.3*m.e*dwSwing(m.b,2,.25);
 return {name:'roly',root:JQ({kids:[body,head]}),pivot:[0,200],move:m=>{const t=th(m);return {r:t,x:220*t};},colors:['#ff7ac8','#ffd23f'],pulse:1,ground:420,env:'playroom',box:[-300,-430,300,420]};}

// Diabolo: two hands with their sticks; the diabolo rolls along the string as the hands rise in turn, and every four bars it is thrown
// high and caught again on the first beat.
function jgDiabolo(){const pose=m=>{const z=((m.b%8)+8)%8,air=z>=5.5?Math.sin(JG_PI*(z-5.5)/2.5)*m.e:0,taut=z>=5.2?Math.min(1,(z-5.2)/.3)*(z<7.8?1:Math.max(0,(8-z)/.2))*m.e:0;
  const lu=m.e*(1-taut)*dwPeak(m.b/2,2),ru=m.e*(1-taut)*dwPeak((m.b-1)/2,2);
  const tl=[-460-60*taut,-60-70*lu],tr=[460+60*taut,-60-70*ru],dx=60*m.e*(1-taut)*Math.sin(JG_PI*m.b)*.8,dy=150*(1-taut)-60*taut-520*air;return {tl,tr,hl:[-330-50*taut,262-70*lu],hr:[330+50*taut,262-70*ru],d:[dx,dy],air,taut};};
 const hands=JQ({shape:m=>{const p=pose(m),out=[];for(const [h,s] of [[p.hl,-1],[p.hr,1]]){out.push(dwRound(h[0]-40,h[1]-50,80,100,32),...dwPath(`M${h[0]-30},${h[1]+50} L${h[0]-40+s*40},440 M${h[0]+30},${h[1]+50} L${h[0]+40+s*40},440`));}return out;}});
 const sticks=JQ({acc:true,shape:m=>{const p=pose(m),st=(h,t)=>{const dx=t[0]-h[0],dy=t[1]-h[1],l=Math.hypot(dx,dy);return dwLine(h[0]+dx/l*52,h[1]+dy/l*52,t[0],t[1]);};return [st(p.hl,p.tl),st(p.hr,p.tr)];}});
 const string=JQ({lw:.4,shape:m=>{const p=pose(m),[dx,dy]=p.d;if(p.air>0.02||p.taut>.9)return [dwPath(`M${p.tl[0]},${p.tl[1]} Q0,${(p.tl[1]+p.tr[1])/2+40*(1-p.taut)} ${p.tr[0]},${p.tr[1]}`)[0]];return [[p.tl,[dx,dy+20],p.tr]];}});
 const diabolo=JQ({at:[0,170],move:m=>{const p=pose(m);return {x:p.d[0],y:p.d[1]-170};},lines:[...dwPath('M-150,62 L-18,150 L18,150 L150,62 M-150,278 L-18,190 L18,190 L150,278'),dwArc(-150,170,30,108),dwArc(150,170,30,108)],kids:[JQ({acc:true,lw:.7,lines:[dwArc(-150,170,14,62),dwArc(150,170,14,62)]})]});
 return {name:'diabolo',root:JQ({kids:[hands,sticks,string,diabolo]}),pivot:[0,440],move:null,colors:['#4fb6ff','#ff8a3d'],pulse:2,ground:440,env:'circus',box:[-540,-480,540,440]};}

// Party blower: the girl in her party hat blows on every second beat and the paper tube unrolls with a toot, then curls up again;
// her cheeks puff.
function jgBlower(){const ext=m=>{const z=((m.b%2)+2)%2;return m.e*(z<.22?Ksmooth(z/.22):z<.9?1:Math.max(0,1-Ksmooth((z-.9)/.7)));};
 const tube=m=>{const f=ext(m),Lt=640,s0=f*Lt,pts=[],x0=6,y0=-140;let x=x0,y=y0,a=0;pts.push([x,y]);for(let s=0;s<Lt;s+=10){if(s>=s0){const k=(s-s0)/Math.max(1,Lt-s0),r=dwLerp(84,20,k);a+=10/r;}x+=10*Math.cos(a);y+=10*Math.sin(a);pts.push([x,y]);}return pts;};
 const paper=JQ({lw:1.5,shape:m=>[tube(m)]});
 const tassel=JQ({acc:true,lw:.6,shape:m=>{const p=tube(m),e=p[p.length-1],q=p[p.length-2],a=Math.atan2(e[1]-q[1],e[0]-q[0]);return [-.5,0,.5].map(d=>dwLine(e[0],e[1],e[0]+Math.cos(a+d)*50,e[1]+Math.sin(a+d)*50));}});
 const cheek=JQ({at:[-96,-150],acc:true,move:m=>{const k=1+.35*ext(m);return {sx:k,sy:k};},lines:[dwArc(-96,-150,30)]});
 const head=JQ({at:[-180,-60],move:m=>({r:.05*m.e*dwSwing(m.b,4),x:6*ext(m)}),lines:[dwArc(-180,-180,126,126,-1.4,.7*JG_PI),dwPath('M-180,-54 Q-310,-60 -306,-180 Q-306,-250 -270,-286')[0],...dwPath('M-58,-198 Q-36,-184 -56,-166 M-134,-252 Q-112,-266 -90,-252 M-222,-200 Q-246,-178 -222,-156'),dwRound(-62,-158,70,36,14)],dots:[[-112,-222,11]],
  kids:[cheek,JQ({acc:true,lines:dwPath('M-292,-262 L-262,-462 L-150,-296'),dots:[[-262,-476,22]]}),JQ({lines:dwPath('M-300,-214 Q-336,-236 -322,-276 Q-350,-300 -318,-330 M-206,-306 Q-180,-340 -140,-318')})]});
 return {name:'blower',root:JQ({lines:dwPath('M-400,250 Q-390,60 -270,44 L-110,44 Q-10,56 0,250 M-210,-56 L-212,44 M-152,-62 L-150,44'),kids:[JQ({acc:true,lines:dwPath('M-216,44 L-180,96 L-146,44')}),head,paper,tassel]}),pivot:[-200,250],move:m=>({y:-10*m.e*dwPeak(m.b,2)}),colors:['#ffd23f','#ff7ac8'],pulse:2,ground:250,env:'plaza',box:[-420,-500,660,250]};}

export const JG_ART=Object.freeze([jgJack(),jgBall(),jgRocking(),jgRobot(),jgKite(),jgDolls(),jgTop(),jgRope(),jgPinwheel(),jgPuppet(),jgYoyo(),jgDominoes(),jgHula(),jgBlocks(),jgBubbles(),jgPogo(),jgCarousel(),jgRoly(),jgDiabolo(),jgBlower()]);

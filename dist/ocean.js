import {createSynth} from './synth.js';

/* Fons marí de vidre · CE06 · Pim Pam 0.10
 * Original analytic glass animals and an independent chamber-ocean score/synth.
 * Every frame is a pure function of time: no simulation state or external assets.
 */
const O_TAU=Math.PI*2,O_MIN=12;
const Oclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const Oease=x=>{x=Oclamp(x);return x*x*(3-2*x)};
const Oout=x=>1-(1-Oclamp(x))**3;
const Orand=(i,s=0)=>{const v=Math.sin(i*71.763+s*53.291+7.18)*43758.5453;return v-Math.floor(v)};
const Omix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-Oclamp(t))+parseInt(b.slice(i,i+2),16)*Oclamp(t)).toString(16).padStart(2,'0')).join('');
const Orgba=(hex,a=1)=>{const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${Oclamp(a)})`};
function Opath(c,pts,closed=false){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(closed)c.closePath()}
function Oline(c,pts,col,width=.006,alpha=1){Opath(c,pts);c.strokeStyle=Orgba(col,alpha);c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke()}
function Oellipse(c,x,y,rx,ry,col,alpha=1){c.beginPath();c.ellipse(x,y,Math.max(.0001,rx),Math.max(.0001,ry),0,0,O_TAU);c.fillStyle=Orgba(col,alpha);c.fill()}
function Ohalo(c,x,y,r,col,a){if(a<=0||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,Orgba(col,a));g.addColorStop(.32,Orgba(col,a*.4));g.addColorStop(1,Orgba(col,0));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,O_TAU);c.fill()}
function Opearl(c,x,y,r,p,a=1){Ohalo(c,x,y,r*4,p[0],a*.11);const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.05,x,y,r);g.addColorStop(0,Orgba('#ffffff',a*.9));g.addColorStop(.22,Orgba(p[2],a*.8));g.addColorStop(.55,Orgba(p[0],a*.45));g.addColorStop(1,Orgba(p[1],a*.06));c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,O_TAU);c.fill()}
function Oeye(c,x,y,r,p){Oellipse(c,x,y,r*1.65,r*1.7,p[0],.2);Oellipse(c,x,y,r,r,'#071521',.9);Oellipse(c,x-r*.22,y-r*.25,r*.35,r*.35,'#f6fcff',.9);Oellipse(c,x+r*.4,y+r*.3,r*.14,r*.14,p[2],.7)}
function Obezier(a,b,c,d,n=48){const pts=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;pts.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]])}return pts}
function Ospline(nodes,n=7){const pts=[];for(let k=0;k<nodes.length-1;k++){const a=nodes[Math.max(0,k-1)],b=nodes[k],c=nodes[k+1],d=nodes[Math.min(nodes.length-1,k+2)];for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t;pts.push([0,1].map(axis=>.5*((2*b[axis])+(-a[axis]+c[axis])*t+(2*a[axis]-5*b[axis]+4*c[axis]-d[axis])*t2+(-a[axis]+3*b[axis]-3*c[axis]+d[axis])*t3)))}}pts.push(nodes.at(-1));return pts}
function Oskin(c,path,p,q,alpha=.6,texture=true){
 path();const g=c.createLinearGradient(-.7,-.75,.6,.8);g.addColorStop(0,Orgba(p[2],alpha*.75));g.addColorStop(.19,Orgba(p[0],alpha*.42));g.addColorStop(.47,Orgba(p[1],alpha*.4));g.addColorStop(.74,Orgba(p[0],alpha*.92));g.addColorStop(1,Orgba(p[2],alpha*.3));c.fillStyle=g;c.fill();
 c.save();c.clip();if(q.lit)c.globalCompositeOperation='screen';
 Ohalo(c,-.35,-.4,.7,p[0],alpha*.55);Ohalo(c,.34,.32,.65,p[1],alpha*.5);Ohalo(c,-.27,-.48,.24,p[2],alpha*.36);
 if(texture){
  for(let j=0;j<15;j++){const y=-.92+j*.14,pts=[];for(let k=0;k<=42;k++){const x=-1.25+k/42*2.5;pts.push([x,y+.068*Math.sin(x*6+j*.7+q.clock*.21)+.036*Math.sin(x*13-j*.3-q.clock*.12)])}Oline(c,pts,j%3===0?p[2]:p[0],j%3===0?.0035:.002,j%3===0?.22:.1)}
  for(let k=0;k<64;k++){const x=(Orand(k,18)-.5)*2,y=(Orand(k,46)-.5)*2,light=.12+.22*(.5+.5*Math.sin(q.clock*.38+k));Oellipse(c,x,y,.002+Orand(k,11)*.0035,.002+Orand(k,11)*.0035,p[k%3],light)}
 }
 // A travelling refraction, aligned with the score's main accents, crosses the glass.
 if(!q.reduced)for(const hit of q.hits||[]){const age=q.t-hit;if(age>=0&&age<1.7){const x=-.95+age/1.7*1.9;Ohalo(c,x,-.15+Math.sin(age)*.25,.32,p[2],Math.sin(Math.PI*age/1.7)*.14)}}
 c.restore();path();c.strokeStyle=Orgba(p[0],.14);c.lineWidth=.039;c.stroke();path();c.strokeStyle=Orgba(p[0],.45);c.lineWidth=.011;c.stroke();path();c.strokeStyle=Orgba(p[2],q.lit?.76:.5);c.lineWidth=.0035;c.stroke();
}
function Oribbon(c,pts,width,p,q,alpha=.65){
 const left=[],right=[],norm=[];for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,u=i/(pts.length-1),ww=typeof width==='function'?width(u):width*(1-u*.8);norm.push([-dy/l,dx/l]);left.push([pts[i][0]-dy/l*ww,pts[i][1]+dx/l*ww]);right.push([pts[i][0]+dy/l*ww,pts[i][1]-dx/l*ww])}
 const shape=()=>Opath(c,[...left,...right.slice().reverse()],true);Oskin(c,shape,p,q,alpha,false);Oline(c,pts,p[0],.004,.25);return {left,right,norm};
}
function Ofan(c,root,edge,p,q,alpha=.4,fold=.06){
 const shape=()=>{c.beginPath();c.moveTo(...root);edge.forEach(v=>c.lineTo(...v));c.closePath()};Oskin(c,shape,p,q,alpha,false);
 for(let i=0;i<edge.length;i+=Math.max(1,Math.floor(edge.length/22))){const e=edge[i],pts=Obezier(root,[root[0]*.65+e[0]*.35+fold,root[1]*.65+e[1]*.35],[root[0]*.3+e[0]*.7-fold,root[1]*.3+e[1]*.7],e,20);Oline(c,pts,i%3?p[0]:p[2],i%3?.0025:.004,i%3?.23:.4)}
}
function oceanPhase(t,duration=12,reduced=false){const D=Math.max(O_MIN,duration),settleAt=D-2.9,fadeAt=D-1.1,x=Oclamp((t-settleAt)/.8),motion=t-.82*(.8*(x*x*x-x*x*x*x/2)+Math.max(0,t-settleAt-.8));return {D,t,settleAt,fadeAt,alpha:t>=D?0:(.28+.72*Oease(t/.45))*(1-Oease((t-fadeAt)/1.1)),grow:reduced?.94+.06*Oout(t/.9):.72+.28*Oout(t/1.1),clock:reduced?0:motion,evolve:Oclamp(t/settleAt)};}
function oceanEvents(index,duration=12){const D=Math.max(O_MIN,duration),a=OCEAN_PATTERNS[((index%20)+20)%20];return a.accents.map(x=>.65+x*(D-3.65));}
function Obeat(q,width=.24){if(q.reduced)return 0;let n=0;for(const t of q.hits){const age=q.t-t;n+=Math.exp(-((age/width)**2))}return Math.min(1,n)}


// 01 · Moon jelly: a layered bell, gonad rosette, ciliary rim and silk oral arms.
function Omedusa(c,p,q){const b=Obeat(q),pulse=q.reduced?1:1-.055*b,sway=q.clock*.8;c.save();c.translate(0,-.22);c.scale(pulse,1/pulse);
 for(let k=0;k<36;k++){const root=(k/35-.5)*1.25,len=.7+.5*Orand(k,7),pts=[];for(let j=0;j<=54;j++){const u=j/54;pts.push([root+(.05+.1*u)*Math.sin(u*7-sway+k*.49)*u,.1+u*len])}Oline(c,pts,p[k%2],k%4?.0028:.006,k%4?.38:.66)}
 for(let k=0;k<5;k++){const pts=[];for(let j=0;j<=60;j++){const u=j/60;pts.push([(k-2)*.17+Math.sin(u*10-sway+k)*.13*u,.08+u*.92])}Oribbon(c,pts,u=>.028*(1-u)+.016*Math.sin(u*9+q.clock*.8+k)**2*(1-u),[p[k%2],p[1],p[2]],q,.38)}
 const bell=()=>{c.beginPath();c.moveTo(-.72,.03);c.bezierCurveTo(-.76,-.81,.65,-.94,.75,.02);c.bezierCurveTo(.49,.25,-.5,.25,-.72,.03);c.closePath()};Oskin(c,bell,p,q,.7);
 for(let k=0;k<23;k++){const x=(k/22-.5)*1.42;Oline(c,Obezier([0,-.65],[x*.46,-.61],[x*.93,-.21],[x,.06],38),k%3?p[0]:p[2],k%3?.003:.005,.24)}
 c.save();c.translate(.01,-.15);for(let k=0;k<4;k++){c.rotate(Math.PI/2);const pts=[];for(let j=0;j<=50;j++){const a=j/50*O_TAU;pts.push([.095+.1*Math.cos(a),.065*Math.sin(a)])}Oline(c,pts,p[1],.024,.5);Oline(c,pts,p[2],.004,.55)}c.restore();
 for(let k=0;k<56;k++){const a=Math.PI*k/55;Opearl(c,Math.cos(a)*.72,.04+Math.sin(a)*.105,.0065,p,.7)}Oline(c,Obezier([-.53,-.28],[-.46,-.6],[.0,-.76],[.38,-.5],44),p[2],.012,.65);c.restore();}
// 02 · Manta: broad thin wings, flexing leading edges and a translucent dorsal keel.
function Omanta(c,p,q){const flap=Math.sin(q.clock*.85)*.16;for(const side of [-1,1]){
 const point=(u,v)=>[side*(.13+u*.9),-.36+.15*u+.62*u*u+v*(.79-.65*u)+Math.sin(v*Math.PI)*.08+flap*u*u];
 for(let i=0;i<27;i++)for(let j=0;j<14;j++){const u=i/27,v=j/14,pts=[point(u,v),point((i+1)/27,v),point((i+1)/27,(j+1)/14),point(u,(j+1)/14)];Opath(c,pts,true);c.fillStyle=Orgba(Omix(p[0],p[1],v),.16+.39*Math.sin(Math.PI*v)**2*(1-u*.5));c.fill()}
 const edge=[];for(let i=0;i<=40;i++)edge.push(point(i/40,0));for(let i=40;i>=0;i--)edge.push(point(i/40,1));Oline(c,edge,p[2],.006,.6);
 for(let j=0;j<=14;j++){const pts=[];for(let i=0;i<=40;i++)pts.push(point(i/40,j/14));Oline(c,pts,j%3?p[0]:p[2],.003,j%3?.16:.34)}
 for(let k=0;k<27;k++){const a=point(Orand(k,2)*.83,Orand(k,8));Opearl(c,a[0],a[1],.003+Orand(k,4)*.008,p,.45)}}
 Oribbon(c,Obezier([0,.36],[.1,.65],[-.2,.91],[.05,1.16],54),u=>.027*(1-u)+.002,p,q,.7);
 Oskin(c,()=>{c.beginPath();c.moveTo(0,-.5);c.bezierCurveTo(-.22,-.51,-.22,.18,0,.56);c.bezierCurveTo(.22,.18,.22,-.51,0,-.5);c.closePath()},p,q,.65);
 for(const side of [-1,1]){Oribbon(c,Obezier([side*.1,-.38],[side*.3,-.64],[side*.06,-.66],[side*.05,-.48],30),.025,p,q,.6);Oeye(c,side*.15,-.25,.018,p)}Oline(c,Obezier([0,-.38],[-.04,-.2],[.03,.2],[0,.43],30),p[2],.005,.65);}
// 03 · Octopus: eight independently curling muscular arms, pearly suckers and a blown-glass mantle.
function Ooctopus(c,p,q){for(let k=0;k<8;k++){const side=k<4?-1:1,j=k%4,sw=Math.sin(q.clock*.7+k)*.07,pts=Ospline([[side*.08,.01],[side*(.18+j*.08),.3],[side*(.34+j*.12),.56-j*.1],[side*(.56+j*.09),.63-j*.16+sw],[side*(.7+j*.07),.49-j*.16+sw],[side*(.63+j*.08),.4-j*.12]],8);const band=Oribbon(c,pts,u=>.07*(1-u)**.8+.004,[p[k%2],p[1],p[2]],q,.65);for(let j=5;j<pts.length-2;j+=3){const u=j/(pts.length-1),n=band.norm[j],x=pts[j][0]+n[0]*(.046*(1-u)),y=pts[j][1]+n[1]*(.046*(1-u));Oellipse(c,x,y,.011*(1-u)+.003,.013*(1-u)+.003,p[2],.47)}}
 const breath=1+.025*Math.sin(q.clock*.8);c.save();c.scale(breath,1/breath);Oskin(c,()=>{c.beginPath();c.moveTo(-.21,.14);c.bezierCurveTo(-.54,-.28,-.35,-.83,.04,-.84);c.bezierCurveTo(.57,-.8,.43,-.1,.22,.17);c.quadraticCurveTo(0,.27,-.21,.14);c.closePath()},p,q,.72);
 for(let k=0;k<42;k++){const a=Orand(k,22)*O_TAU,r=Math.sqrt(Orand(k,11));Opearl(c,Math.cos(a)*.27*r,Math.sin(a)*.36*r-.38,.003+Orand(k,8)*.007,p,.45)}
 for(const side of [-1,1]){Oeye(c,side*.18,-.08,.031,p);Oline(c,Obezier([side*.12,-.17],[side*.2,-.21],[side*.26,-.16],[side*.25,-.11],20),p[2],.009,.5)}Oline(c,Obezier([-.23,-.35],[-.32,-.65],[-.12,-.77],[.04,-.73],30),p[2],.014,.55);c.restore();}
// 04 · Seahorse: crowned profile, articulated armour and a smoothly coiled tail.
function Oseahorse(c,p,q){const spine=Ospline([[.12,-.6],[-.08,-.31],[-.01,-.04],[.04,.2],[-.1,.43],[-.37,.59],[-.48,.43],[-.35,.3],[-.22,.4],[-.31,.48]],10);Oribbon(c,spine,u=>.135*(1-u)**1.25+.009,p,q,.68);
 const head=()=>{c.beginPath();c.moveTo(-.03,-.5);c.bezierCurveTo(-.27,-.64,-.14,-.91,.13,-.91);c.quadraticCurveTo(.34,-.9,.35,-.77);c.lineTo(.61,-.69);c.lineTo(.57,-.59);c.lineTo(.28,-.64);c.quadraticCurveTo(.18,-.46,.07,-.35);c.closePath()};Oskin(c,head,p,q,.75);Oeye(c,.2,-.77,.027,p);
 for(let k=0;k<5;k++)Oribbon(c,Obezier([-.04+k*.065,-.86],[.02+k*.06,-1.02],[.1+k*.035,-1.07],[.1+k*.035,-.94],18),.013,p,q,.55);
 for(let k=7;k<spine.length-4;k+=5){const pt=spine[k],next=spine[k+1],a=Math.atan2(next[1]-pt[1],next[0]-pt[0])+Math.PI/2,u=k/spine.length,r=.11*(1-u)+.012;Oline(c,[[pt[0]+Math.cos(a)*r,pt[1]+Math.sin(a)*r],[pt[0],pt[1]],[pt[0]-Math.cos(a)*r,pt[1]-Math.sin(a)*r]],p[2],.004,.55)}
 const edge=[];for(let k=0;k<=32;k++){const a=-1.4+k/32*2.7;edge.push([-.19-.25*Math.cos(a)*(1+.09*Math.sin(k*.7-q.clock*3)),-.15+.31*Math.sin(a)])}Ofan(c,[-.08,-.12],edge,p,q,.34);Oline(c,Obezier([.14,-.5],[.25,-.3],[.27,-.06],[.07,.15],30),p[2],.004,.6);}
// 05 · Turtle: a translucent scuted carapace and four long rowing flippers.
function Oturtle(c,p,q){for(const side of [-1,1]){const a=Math.sin(q.clock*.8+side*.2)*.17;for(const rear of [false,true]){
 const pts=rear?Obezier([side*.25,.36],[side*.45,.48],[side*.64,.63],[side*.57,.83],36):Obezier([side*.3,-.28],[side*.65,-.46+a],[side*.93,-.18+a],[side*.97,.15+a],44);
 const band=Oribbon(c,pts,u=>(rear?.083:.13)*Math.sin(Math.PI*(.12+u*.88))+.004,p,q,.61);
 for(let k=1;k<5;k++){const off=(k/5-.5)*.7;Oline(c,pts.map((pt,j)=>[pt[0]+band.norm[j][0]*off*.13*Math.sin(j/(pts.length-1)*Math.PI),pt[1]+band.norm[j][1]*off*.13*Math.sin(j/(pts.length-1)*Math.PI)]),p[2],.0025,.27)}
 }}
 Oribbon(c,Obezier([0,.61],[.04,.75],[-.03,.82],[0,.88],20),.04,p,q,.6);Oskin(c,()=>{c.beginPath();c.ellipse(0,-.77,.17,.22,0,0,O_TAU)},p,q,.67);for(const side of [-1,1])Oeye(c,side*.1,-.85,.016,p);
 Oskin(c,()=>{c.beginPath();c.ellipse(0,0,.51,.69,0,0,O_TAU)},p,q,.7);
 c.save();c.beginPath();c.ellipse(0,0,.46,.64,0,0,O_TAU);c.clip();for(let row=-2;row<=2;row++)for(let col=-2;col<=2;col++){const x=col*.3+(row%2)*.15,y=row*.25,pts=[];for(let j=0;j<6;j++){const a=j*O_TAU/6;pts.push([x+Math.cos(a)*.173,y+Math.sin(a)*.185])}Opath(c,pts,true);c.fillStyle=Orgba(p[(row+col+8)%2],.1);c.fill();Oline(c,[...pts,pts[0]],p[2],.008,.42);Ohalo(c,x-.02,y-.03,.16,p[0],.12)}c.restore();
 for(let k=0;k<44;k++){const a=k/44*O_TAU;Oline(c,[[Math.cos(a)*.465,Math.sin(a)*.64],[Math.cos(a)*.51,Math.sin(a)*.69]],p[2],.003,.5)}Oline(c,Obezier([-.34,-.25],[-.32,-.56],[.05,-.66],[.26,-.44],40),p[2],.012,.65);}
// 06 · Leafy sea dragon: an S-shaped spine and suspended, veined glass leaves.
function Odragon(c,p,q){const spine=Ospline([[.36,-.65],[.12,-.51],[-.1,-.2],[.1,.12],[-.04,.4],[-.4,.64],[-.61,.5]],10);Oribbon(c,spine,u=>.065*(1-u*.8),p,q,.7);
 for(let k=0;k<10;k++){const pos=spine[6+k*5],side=k%2?-1:1,a=side*(.4+Orand(k,5)*.7)+Math.sin(q.clock*.55+k)*.1;c.save();c.translate(...pos);c.rotate(a);const leaf=()=>{c.beginPath();c.moveTo(0,0);c.bezierCurveTo(side*.2,-.2,side*.32,-.13,side*.36,-.45);c.bezierCurveTo(side*.58,-.16,side*.28,.08,0,0);c.closePath()};Oskin(c,leaf,[p[k%2],p[1],p[2]],q,.47);Oline(c,Obezier([0,0],[side*.28,-.04],[side*.34,-.17],[side*.36,-.45],30),p[2],.004,.5);c.restore()}
 Oskin(c,()=>{c.beginPath();c.moveTo(.21,-.6);c.quadraticCurveTo(.26,-.85,.43,-.8);c.lineTo(.72,-.66);c.lineTo(.69,-.6);c.lineTo(.43,-.65);c.quadraticCurveTo(.3,-.46,.21,-.6);c.closePath()},p,q,.65);Oeye(c,.4,-.72,.018,p);for(let k=4;k<spine.length;k+=4)Opearl(c,spine[k][0],spine[k][1],.014,p,.65);}
// 07 · Nautilus: logarithmic mother-of-pearl chambers and a fan of delicate arms.
function Onautilus(c,p,q){c.save();c.translate(-.18,-.05);Oskin(c,()=>{c.beginPath();c.ellipse(0,0,.66,.69,-.2,0,O_TAU)},p,q,.68);const pts=[];for(let k=0;k<=160;k++){const a=k/160*Math.PI*5,r=.028*Math.exp(a*.201);pts.push([Math.cos(a+.2)*r,Math.sin(a+.2)*r])}Oline(c,pts,p[2],.014,.7);for(let k=25;k<pts.length;k+=6){const a=k/160*Math.PI*5+.2,r=.028*Math.exp((a-.2)*.201),r0=r*.31;Oline(c,Obezier([Math.cos(a)*r0,Math.sin(a)*r0],[Math.cos(a+.2)*r*.65,Math.sin(a+.2)*r*.65],[Math.cos(a+.11)*r*.9,Math.sin(a+.11)*r*.9],[Math.cos(a)*r,Math.sin(a)*r],24),p[0],.005,.55)}c.restore();
 for(let k=0;k<22;k++){const u=k/21,a=-.8+u*1.4,pts=Obezier([.31,.22],[.62,.12+u*.3],[.9,.15+Math.sin(q.clock*.6+k)*.07],[.8+Math.cos(a)*.25,.3+Math.sin(a)*.35],40);Oline(c,pts,p[k%2],k%4?.004:.009,.6)}
 Oskin(c,()=>{c.beginPath();c.ellipse(.37,.12,.24,.2,.4,0,O_TAU)},p,q,.7);Oeye(c,.46,.06,.022,p);Oline(c,Obezier([-.62,-.28],[-.66,-.64],[-.18,-.82],[.16,-.58],44),p[2],.013,.65);}
// 08 · Squid: a fluted torpedo mantle, diaphanous fins and ten fluid arms.
function Osquid(c,p,q){for(const side of [-1,1]){const edge=Obezier([0,-.93],[side*.64,-.55],[side*.65,-.05],[side*.1,-.18],40);Ofan(c,[0,-.36],edge,p,q,.4,side*.08)}for(let k=0;k<10;k++){const u=(k-4.5)/4.5,pts=Obezier([u*.11,.2],[u*.28,.52],[u*.52+Math.sin(q.clock*.7+k)*.08,.8],[u*.46+Math.sin(q.clock*.6+k)*.08,1.03-Math.abs(u)*.2],42);Oribbon(c,pts,t=>(k%4?.021:.037)*(1-t)+.002,p,q,.5)}
 Oskin(c,()=>{c.beginPath();c.moveTo(0,-.93);c.bezierCurveTo(-.4,-.5,-.3,.08,-.15,.3);c.quadraticCurveTo(0,.4,.15,.3);c.bezierCurveTo(.3,.08,.4,-.5,0,-.93);c.closePath()},p,q,.65);
 for(let k=-5;k<=5;k++)Oline(c,Obezier([0,-.84],[k*.045,-.4],[k*.047,-.05],[k*.027,.28],40),k%2?p[0]:p[2],.003,.32);for(let k=0;k<38;k++){const y=-.6+k/38*.83,x=(k%2?1:-1)*(.15+.035*Math.sin(k));Opearl(c,x,y,.005+Obeat(q)*.003,p,.7)}for(const side of [-1,1])Oeye(c,side*.16,.22,.031,p);}
// 09 · Sea star: five sculpted glass arms, each with a beaded ambulacral seam.
function Ostarfish(c,p,q){const petals=[];for(let k=0;k<5;k++){const a=-Math.PI/2+k*O_TAU/5,tip=.91+.045*Math.sin(q.clock*.42+k);for(let j=0;j<22;j++){const u=j/22,th=a-Math.PI/5+u*O_TAU/5,r=.26+(tip-.26)*Math.sin(Math.PI*u)**3;petals.push([Math.cos(th)*r,Math.sin(th)*r])}}Oskin(c,()=>Opath(c,petals,true),p,q,.72);for(let k=0;k<5;k++){const a=-Math.PI/2+k*O_TAU/5;for(let j=1;j<17;j++){const r=j/17*.83,x=Math.cos(a)*r,y=Math.sin(a)*r;for(const side of [-1,1]){const off=(.09*(1-r)+.015)*side;Opearl(c,x+Math.cos(a+Math.PI/2)*off,y+Math.sin(a+Math.PI/2)*off,.009*(1-r)+.004,p,.7)}}Oline(c,[[0,0],[Math.cos(a)*.82,Math.sin(a)*.82]],p[2],.004,.4)}Ohalo(c,0,0,.35,p[1],.38);Opearl(c,0,0,.06,p,.8);}
// 10 · Cuttlefish: a continuous undulating fin skirt and iridescent chromatophore mosaics.
function Ocuttle(c,p,q){for(const side of [-1,1]){const edge=[];for(let k=0;k<=64;k++){const u=k/64,a=-Math.PI/2+u*Math.PI;edge.push([side*(.33+Math.sin(a+Math.PI/2)*.29+.035*Math.sin(k*.5-q.clock*2.2)),-.1+Math.sin(a)*.67])}Ofan(c,[side*.15,-.08],edge,p,q,.43,side*.09)}
 for(let k=0;k<8;k++){const u=(k-3.5)/3.5;Oribbon(c,Obezier([u*.11,.48],[u*.4,.64],[u*.28,.9],[u*.41,.93+Math.sin(q.clock*.7+k)*.07],32),t=>.036*(1-t)+.003,p,q,.58)}Oskin(c,()=>{c.beginPath();c.ellipse(0,-.12,.39,.64,0,0,O_TAU)},p,q,.72);
 for(let row=0;row<12;row++){const y=-.61+row*.087,width=.34*Math.sqrt(Math.max(0,1-((y+.12)/.64)**2));for(let k=-3;k<=3;k++){const x=k/3*width*.83;Oellipse(c,x,y,.018+.01*Math.sin(row),.009,p[(row+k+10)%2],.38+.12*Math.sin(q.clock*.7+row*.6));Oline(c,[[x-.012,y-.012],[x+.01,y-.016]],p[2],.003,.45)}}for(const side of [-1,1])Oeye(c,side*.25,.43,.035,p);}
// 11 · Lantern fish: a clear cranial dome, ribbed fins and a slow luminous lure.
function Oangler(c,p,q){const y=-.78+.04*Math.sin(q.clock*.7);Oline(c,Obezier([-.2,-.25],[-.54,-1],[.37,-1.07],[.4,y],55),p[2],.012,.65);Ohalo(c,.4,y,.25,p[1],.2);Opearl(c,.4,y,.062,[p[1],p[0],p[2]],1);
 for(const side of [-1,1]){const edge=Obezier([side*.27,.1],[side*.89,-.25],[side*.86,.48],[side*.28,.4],40);Ofan(c,[side*.25,.14],edge,p,q,.38)}Ofan(c,[.23,.3],[[.64,.54],[.88,.7],[.92,.3],[.6,.22]],p,q,.48);
 Oskin(c,()=>{c.beginPath();c.ellipse(-.04,.02,.52,.48,-.15,0,O_TAU)},p,q,.65);Oeye(c,-.27,-.05,.047,p);Oline(c,Obezier([-.51,.15],[-.35,.3],[-.12,.25],[-.04,.15],30),p[2],.006,.6);for(let k=0;k<17;k++)Opearl(c,-.26+k*.039,.3+.045*Math.sin(k*.27),.008,p,.7);}
// 12 · Whale: a single broad silhouette, ventral pleats and slow articulated flukes.
function Owhale(c,p,q){const sw=Math.sin(q.clock*.65)*.09;Ofan(c,[.61,.05],[...Obezier([.62,.02],[.78,-.32+sw],[1.02,-.34+sw],[1.15,-.4+sw],32),...Obezier([1.15,-.4+sw],[1.09,-.1+sw],[.88,-.02],[.76,.06],24)],p,q,.62);Ofan(c,[.61,.05],[...Obezier([.64,.07],[.82,.29+sw],[1.1,.34+sw],[1.16,.4+sw],32),...Obezier([1.16,.4+sw],[1.03,.13+sw],[.91,.08],[.76,.06],24)],p,q,.62);
 Oribbon(c,Obezier([-.17,.13],[-.1,.36],[.09,.62],[.24,.56],40),u=>.1*Math.sin(Math.PI*u)**.7+.01,p,q,.55);
 Oskin(c,()=>{c.beginPath();c.moveTo(.79,.06);c.bezierCurveTo(.3,-.27,-.45,-.43,-.82,-.24);c.bezierCurveTo(-1,-.17,-1,.13,-.77,.25);c.bezierCurveTo(-.42,.49,.33,.34,.79,.06);c.closePath()},p,q,.7);Oeye(c,-.69,.04,.019,p);
 for(let k=0;k<9;k++)Oline(c,Obezier([-.84,.13+k*.009],[-.7,.27+k*.015],[-.36,.25+k*.017],[.16+k*.024,.25-k*.012],44),p[2],.004,.32);Oline(c,Obezier([-.88,-.09],[-.66,-.37],[-.17,-.26],[.18,-.16],44),p[2],.012,.58);
 for(let k=0;k<48;k++){const x=-.65+Orand(k,8)*1.1,y=-.1+Orand(k,10)*.24;Opearl(c,x,y,.002+Orand(k,4)*.006,p,.3)}Oskin(c,()=>{c.beginPath();c.moveTo(.18,-.16);c.quadraticCurveTo(.22,-.47,.37,-.22);c.closePath()},p,q,.5,false);}
// 13 · Butterfly fish: a curved glass fan, enamel tracery and trailing pelvic ribbons.
function Obutterfly(c,p,q){const fin=Math.sin(q.clock*1.3)*.035;Ofan(c,[.37,.08],[[.88,-.39+fin],[.98,-.08],[.91,.35+fin],[.46,.18]],p,q,.5);Ofan(c,[-.15,.02],Obezier([-.44,-.18],[-.2,-1],[.44,-.85],[.39,-.25],50),p,q,.46);Ofan(c,[-.05,.12],Obezier([-.3,.27],[-.03,.86],[.4,.66],[.39,.21],45),p,q,.48);
 Oskin(c,()=>{c.beginPath();c.moveTo(-.65,.02);c.bezierCurveTo(-.46,-.08,-.4,-.5,-.05,-.49);c.bezierCurveTo(.32,-.48,.44,-.12,.44,.05);c.bezierCurveTo(.4,.47,-.2,.58,-.5,.15);c.closePath()},p,q,.7);Oeye(c,-.38,-.07,.025,p);
 c.save();c.beginPath();c.ellipse(-.05,.01,.42,.43,0,0,O_TAU);c.clip();for(let k=0;k<7;k++){const x=-.45+k*.13;Oline(c,Obezier([x,-.5],[x+.2,-.3],[x-.2,.2],[x+.1,.5],45),k%2?p[0]:p[2],k%2?.018:.006,k%2?.45:.5)}c.restore();for(let k=0;k<2;k++)Oline(c,Obezier([-.1+k*.13,.34],[-.16+k*.15,.65],[.2,.86],[.45,.77],45),p[2],.006,.6);}
// 14 · Nudibranch: a low opalescent body with rows of soft, individually swaying cerata.
function Onudi(c,p,q){c.save();c.rotate(-.17);Oskin(c,()=>{c.beginPath();c.moveTo(-.83,.22);c.bezierCurveTo(-.71,-.06,.54,-.1,.81,.18);c.bezierCurveTo(.72,.48,-.63,.5,-.83,.22);c.closePath()},p,q,.7);
 for(let row=2;row>=0;row--)for(let k=0;k<12;k++){const x=-.55+k*.095,root=[x,.17+row*.065],len=.3+.26*Math.sin(Math.PI*k/13),sw=Math.sin(q.clock*.8+k*.5+row)*.05,tip=[x+sw-(k-5)*.012,root[1]-len-row*.02],pts=Obezier(root,[x-.07,root[1]-.2],[tip[0]+.04,tip[1]+.08],tip,28);Oribbon(c,pts,u=>.031*Math.sin(Math.PI*(.1+u*.9))+.002,[p[row%2],p[0],p[2]],q,.6);Opearl(c,tip[0],tip[1],.016,[p[1],p[0],p[2]],.8)}
 for(let k=0;k<2;k++){const x=-.62+k*.15,pts=Obezier([x,.16],[x-.04,-.18],[x+.04,-.34],[x,-.4],30);Oribbon(c,pts,u=>.027*(1-u)+.006,p,q,.7);for(let j=4;j<pts.length-4;j+=3)Oline(c,[[pts[j][0]-.023,pts[j][1]],[pts[j][0]+.023,pts[j][1]-.008]],p[2],.003,.7)}c.restore();}
// 15 · Anemone: a living crown of independently curved glass tentacles.
function Oanemone(c,p,q){Oskin(c,()=>{c.beginPath();c.moveTo(-.37,.19);c.bezierCurveTo(-.44,.42,-.31,.78,0,.8);c.bezierCurveTo(.31,.78,.44,.42,.37,.19);c.closePath()},p,q,.6);
 for(let layer=0;layer<3;layer++)for(let k=0;k<16;k++){const a=k/16*O_TAU+layer*.23,r=.21+layer*.06,dx=Math.cos(a),dy=Math.sin(a)*.7,sw=Math.sin(q.clock*.7+k*.7+layer)*.05,pts=Obezier([dx*r,dy*r],[dx*.52+sw,dy*.53-.2],[dx*(.7+layer*.04)+sw,dy*.72-.2],[dx*(.69+layer*.08),dy*.83-.25],38);Oribbon(c,pts,u=>(.026-layer*.003)*(1-u*.55),[p[layer%2],p[1],p[2]],q,.42);const e=pts.at(-1);Opearl(c,e[0],e[1],.018,p,.65)}Oskin(c,()=>{c.beginPath();c.ellipse(0,0,.24,.15,0,0,O_TAU)},p,q,.58);Oline(c,Obezier([-.09,0],[-.02,.04],[.05,.04],[.11,0],20),p[2],.01,.7);}
// 16 · Feather star: ten feathered arms; hundreds of paired pinnules form the lace.
function Ocrinoid(c,p,q){for(let k=0;k<10;k++){const a=-Math.PI/2+k*O_TAU/10,pts=[];for(let j=0;j<=55;j++){const u=j/55,theta=a+.38*u+Math.sin(q.clock*.45+k)*.12*u;pts.push([Math.cos(theta)*u*.88,Math.sin(theta)*u*.88])}Oline(c,pts,p[0],.017,.65);Oline(c,pts,p[2],.004,.7);for(let j=7;j<53;j+=2){const u=j/55,a2=a+.38*u,len=.105*Math.sin(Math.PI*u)**.6;for(const side of [-1,1]){const x=pts[j][0],y=pts[j][1],v=a2+side*1.1;Oline(c,Obezier([x,y],[x+Math.cos(v)*len*.5,y+Math.sin(v)*len*.5],[x+Math.cos(v)*len,y+Math.sin(v)*len],[x+Math.cos(v+.22)*len*1.25,y+Math.sin(v+.22)*len*1.25],12),j%4?p[0]:p[2],.0035,j%4?.48:.7)}}}for(let j=0;j<12;j++){const a=j*O_TAU/12;Opearl(c,Math.cos(a)*.1,Math.sin(a)*.1,.02,p,.65)}Opearl(c,0,0,.075,p,.85);}
// 17 · Comb jelly: a glass ellipsoid with eight rainbow ciliary combs and internal canals.
function Octenophore(c,p,q){const breathe=1+.035*Math.sin(q.clock*.85);c.save();c.scale(breathe,1/breathe);Oskin(c,()=>{c.beginPath();c.ellipse(0,-.05,.59,.79,0,0,O_TAU)},p,q,.38);
 for(let k=0;k<8;k++){const a=k*O_TAU/8,pts=[];for(let j=0;j<=60;j++){const v=-Math.PI/2+j/60*Math.PI;pts.push([Math.cos(a)*Math.cos(v)*.58,Math.sin(v)*.77-.05])}Oline(c,pts,p[0],.005,.3);for(let j=3;j<57;j++){const pt=pts[j],col=Omix(p[j%2],p[2],.45+.4*Math.sin(j*.3-q.clock*1.1+k));Oline(c,[[pt[0]-.015,pt[1]],[pt[0]+.015,pt[1]-.006]],col,.006,.25+.5*(.5+.5*Math.sin(j*.23-q.clock*.9+k)))}}
 for(const side of [-1,1]){Oribbon(c,Obezier([side*.08,-.6],[side*.27,-.1],[side*.05,.25],[side*.12,.55],40),u=>.023*Math.sin(Math.PI*u)+.004,p,q,.4);Oline(c,Obezier([side*.33,.52],[side*.68,.69],[side*.38,.99],[side*.69,1.08],50),p[2],.003,.65)}Oline(c,Obezier([-.36,-.36],[-.39,-.67],[-.1,-.84],[.17,-.66],40),p[2],.011,.55);c.restore();}
// 18 · Sea angel: translucent body, two beating wings and a warm luminous core.
function Oangel(c,p,q){const flap=Math.sin(q.clock*1.05)*.12;for(const side of [-1,1]){const edge=Obezier([side*.1,-.25],[side*.62,-.75+flap],[side*1.02,-.26-flap],[side*.3,.15],50);Ofan(c,[side*.1,-.05],edge,p,q,.42,side*.13)}
 Oskin(c,()=>{c.beginPath();c.moveTo(0,-.66);c.bezierCurveTo(-.33,-.6,-.24,.14,-.05,.77);c.quadraticCurveTo(0,.92,.05,.77);c.bezierCurveTo(.24,.14,.33,-.6,0,-.66);c.closePath()},p,q,.5);Ohalo(c,0,-.16,.27,p[1],.42);Oskin(c,()=>{c.beginPath();c.ellipse(0,-.18,.095,.22,0,0,O_TAU)},[p[1],p[0],p[2]],q,.55,false);
 for(const side of [-1,1])Oribbon(c,Obezier([side*.08,-.55],[side*.15,-.77],[side*.22,-.89],[side*.13,-.91],24),u=>.018*(1-u)+.005,p,q,.55);Oline(c,Obezier([0,.04],[-.05,.25],[.06,.49],[0,.76],40),p[2],.004,.62);}
// 19 · Glass shrimp: segmented carapace, walking legs, swimmerets and long antennae.
function Oshrimp(c,p,q){const body=Ospline([[-.64,-.2],[-.32,-.37],[.02,-.3],[.32,-.12],[.47,.17],[.31,.37],[.13,.35]],9);Oribbon(c,body,u=>.15*(1-u*.6),p,q,.6);
 for(let j=8;j<body.length-5;j+=6){const a=body[j],b=body[j+1],angle=Math.atan2(b[1]-a[1],b[0]-a[0])+Math.PI/2,r=.13*(1-j/body.length*.6);Oline(c,Obezier([a[0]+Math.cos(angle)*r,a[1]+Math.sin(angle)*r],[a[0]-.04,a[1]+.03],[a[0]+.02,a[1]-.04],[a[0]-Math.cos(angle)*r,a[1]-Math.sin(angle)*r],18),p[2],.005,.7)}
 for(let k=0;k<7;k++){const x=-.48+k*.115,sw=Math.sin(q.clock*1.4+k*.8)*.035,pts=Ospline([[x,-.14+k*.02],[x-.04,.13],[x-.23+sw,.42],[x-.08+sw,.62]],8);Oribbon(c,pts,u=>.012*(1-u)+.002,p,q,.5)}Ofan(c,[.17,.33],[[.33,.6],[.03,.65],[-.03,.4]],p,q,.6);
 for(let k=0;k<4;k++)Oline(c,Obezier([-.65,-.24],[-.9,-.55+k*.1],[-.32,-.95+k*.09],[.05+Math.sin(q.clock*.5+k)*.04,-.9+k*.07],70),p[k%2],.0035,.7);Oskin(c,()=>{c.beginPath();c.moveTo(-.65,-.33);c.lineTo(-.9,-.4);c.lineTo(-.71,-.14);c.closePath()},p,q,.55,false);for(let k=0;k<2;k++){Oline(c,[[-.6+k*.08,-.27],[-.68+k*.12,-.48]],p[2],.007,.6);Oeye(c,-.68+k*.12,-.48,.023,p)}}
// 20 · School of silvery fish: a braided current with near and distant layers.
function OsmallFish(c,p,q,phase){const w=Math.sin(q.clock*1.8+phase)*.09;Ofan(c,[.36,0],[[.73,-.27+w],[.64,.02],[.73,.25+w]],p,q,.5);Ofan(c,[.0,-.06],[[-.16,-.15],[.11,-.4],[.22,-.07]],p,q,.4);Oskin(c,()=>{c.beginPath();c.moveTo(-.55,0);c.bezierCurveTo(-.25,-.31,.14,-.19,.4,0);c.bezierCurveTo(.14,.19,-.25,.31,-.55,0);c.closePath()},p,q,.65,false);Oline(c,Obezier([-.4,0],[-.1,-.03],[.16,.03],[.35,0],22),p[2],.008,.7);Oeye(c,-.34,-.025,.022,p)}
function Oschool(c,p,q){for(let layer=0;layer<3;layer++)for(let k=0;k<9;k++){const u=k/8,a=u*2.3+layer*.54+q.clock*.07,x=-1.02+u*2.04,y=Math.sin(a*2.15)*(.25+layer*.1)+(layer-1)*.14;const size=(.14+layer*.035)*(1+.18*Math.sin(k));c.save();c.translate(x,y);c.rotate(Math.cos(a*2.15)*.2);c.scale(size,size);c.globalAlpha*=.65+layer*.175;OsmallFish(c,[p[(k+layer)%2],p[1],p[2]],q,k);c.restore()}}

const OCEAN_PATTERNS=Object.freeze([
 ['Medusa de lluna',Omedusa,['#63dfe9','#b685f4','#e1fff5'],.85,[.04,.22,.43,.65,.88]],
 ['Manta de safir',Omanta,['#5298ef','#7266dc','#9ef5ed'],.88,[.03,.24,.48,.69,.91]],
 ['Pop d’òpal',Ooctopus,['#ea7aab','#845ee3','#ffdbb2'],.92,[.06,.2,.38,.6,.82]],
 ['Cavallet d’ambre',Oseahorse,['#ffd77b','#ee8ead','#fff1b8'],.92,[.04,.25,.45,.67,.89]],
 ['Tortuga d’esmeralda',Oturtle,['#57d1b3','#4d83d1','#d7f3a4'],.92,[.08,.27,.47,.7,.9]],
 ['Drac de mar',Odragon,['#a0d982','#51bcae','#f8e3a6'],.92,[.02,.19,.4,.62,.87]],
 ['Nautil de nacre',Onautilus,['#eeb388','#b472bd','#fff0c9'],.94,[.05,.26,.49,.71,.92]],
 ['Calamar de robí',Osquid,['#f17c97','#9d63e2','#ffceb0'],.88,[.04,.2,.41,.63,.84]],
 ['Estrella de corall',Ostarfish,['#ef8f87','#cc5fb1','#f7d49a'],1,[.06,.25,.44,.68,.9]],
 ['Sèpia d’ametista',Ocuttle,['#ab8fe8','#56b7d1','#e8cbff'],.94,[.02,.23,.45,.66,.88]],
 ['Peix llanterna',Oangler,['#4ba1c7','#d8b868','#b2f0ed'],1,[.05,.3,.51,.7,.91]],
 ['Balena de cristall',Owhale,['#5abed4','#596dc4','#b8e5f7'],1.24,[.08,.26,.48,.7,.9]],
 ['Peix papallona',Obutterfly,['#edb45c','#d271ab','#fff2b8'],1,[.04,.22,.42,.61,.85]],
 ['Nudibranqui de seda',Onudi,['#83d3c7','#ce83bd','#f1d9aa'],1.18,[.03,.23,.46,.68,.91]],
 ['Anemone de perles',Oanemone,['#d087cc','#61bfbe','#ffddb5'],1,[.06,.24,.46,.67,.88]],
 ['Estrella de plomes',Ocrinoid,['#ffcf93','#eaa3d6','#fff0c9'],1,[.04,.23,.45,.64,.87]],
 ['Ctenòfor irisat',Octenophore,['#74c7e2','#c28cde','#d4f3c9'],.88,[.03,.24,.44,.66,.9]],
 ['Àngel de mar',Oangel,['#95cfee','#f2a77d','#e3f7ff'],1,[.07,.26,.48,.69,.92]],
 ['Gamba de vidre',Oshrimp,['#80d5c4','#cb92ab','#f8e0b0'],1,[.04,.21,.43,.64,.86]],
 ['El corrent de plata',Oschool,['#73c5d4','#6f83cb','#dce9ec'],1.13,[.02,.22,.42,.65,.89]]
].map(([name,draw,palette,scale,accents],i)=>Object.freeze({id:`ocean-${String(i+1).padStart(2,'0')}`,name,draw,palette:Object.freeze(palette),scale,accents:Object.freeze(accents)})));
function drawOcean(c,w,h,{index=0,t,duration=12,reduced=false,base='black',background='none',opacity=25,seed=0,density=65}={}){
 if(t===null||t===undefined||t<0)return false;const ph=oceanPhase(t,duration,reduced);if(ph.alpha<=0)return false;const art=OCEAN_PATTERNS[((index%20)+20)%20],lit=base!=='white'||background==='full'||background==='dim'&&opacity>=60,p=art.palette.map(col=>lit?col:Omix(col,'#173c63',.28));
 const size=Math.min(w*.39,h*.41)*art.scale,hits=oceanEvents(index,ph.D),clock=ph.clock,tilt=reduced?0:Math.sin(clock*.27+index)*.035,x=w*.5+(reduced?0:Math.sin(clock*.32+index)*size*.035),y=h*.49+(reduced?0:Math.sin(clock*.38+index*.7)*size*.03);
 c.save();c.globalAlpha*=ph.alpha;c.translate(x,y);c.scale(size*ph.grow,size*ph.grow);c.rotate(tilt);c.lineCap='round';c.lineJoin='round';
 // Sparse dust sets scale and depth. It belongs to the effect and vanishes at rest.
 Ohalo(c,0,0,1.48,p[0],lit?.055:.018);Ohalo(c,-.33,-.12,.8,p[1],lit?.055:.018);
 const amount=Math.round(25+(density-25)*.4);for(let i=0;i<amount;i++){const a=Orand(i,3+index)*O_TAU,r=.65+Orand(i,18)*.8,xx=Math.cos(a)*r*(w/h>1.4?1.25:1),yy=Math.sin(a)*r*.84+(reduced?0:Math.sin(clock*.24+i)*.018),fade=(.15+.35*Orand(i,5))*Oease((t-Orand(i,7)*1.2)/.8);Oellipse(c,xx,yy,.0018+Orand(i,11)*.003,.0018+Orand(i,11)*.003,p[i%3],fade)}
 const q={...ph,clock,hits,reduced,lit,seed,index};art.draw(c,p,q);c.restore();return true;
}
function Cocean(c,w,h,g,s,p,clock){if(clock.running)drawOcean(c,w,h,{index:g.variant||0,t:clock.t,duration:g.audioDuration||Math.max(O_MIN,s.duration),reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,density:s.density,seed:Math.floor((g.completed||0)/20)})}


/* Twenty chamber miniatures, with a separate melody/countermelody, compound rhythms,
 * extended voicings, delayed imitation and a slow pedal. No composeKaleido or old score data.
 */
const O_SCALES={dorian:[0,2,3,5,7,9,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],aeolian:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11]};
const OCEAN_MUSIC=Object.freeze([
 [50,'dorian',[0,3,5,0],[7,9,8,6,4,5,7,9,11,10,7,6,4,2,4,5,7,6,4,2,1,0],[4,6,7,4,2,3,5,4,2,0],[3,1,2,2,1,3],'sea-glass','sea-flute'],
 [51,'lydian',[0,1,4,0],[0,4,6,7,9,7,6,4,2,4,7,11,9,6,7,4,6,2,4,1,2,0],[7,6,4,2,3,6,7,4,2,0],[2,2,3,1,2,2],'sea-cello','sea-glass'],
 [55,'dorian',[0,6,3,4],[4,2,0,2,3,5,4,7,6,4,2,1,3,4,6,9,7,5,4,2,3,0],[0,2,4,6,5,3,4,2,1,0],[2,1,1,3,2,3],'sea-flute','sea-celeste'],
 [52,'mixolydian',[0,4,6,3],[0,2,4,3,5,4,2,6,7,9,8,6,4,5,7,6,3,2,4,2,1,0],[4,5,7,6,4,2,3,5,2,0],[3,2,1,2,3,1],'sea-harp','sea-bow'],
 [48,'lydian',[0,4,1,5],[7,6,4,2,0,2,4,6,7,9,11,9,7,8,6,4,2,3,4,2,1,0],[0,4,6,9,7,4,6,2,1,0],[4,2,1,1,2,2],'sea-bow','sea-flute'],
 [57,'dorian',[0,3,6,2],[2,4,5,7,6,4,2,3,5,6,9,7,4,6,5,3,2,4,2,1,0],[7,5,4,2,3,4,6,4,2,0],[1,2,3,2,1,3],'sea-celeste','sea-glass'],
 [49,'major',[0,5,1,4],[0,4,7,9,7,4,5,8,10,8,5,3,4,7,9,11,9,6,4,2,4,0],[4,7,6,4,2,5,4,3,1,0],[3,1,1,3,2,2],'sea-glass','sea-cello'],
 [54,'aeolian',[0,5,3,6],[7,6,4,5,3,2,0,2,4,7,9,8,6,4,5,7,6,3,2,4,1,0],[0,2,5,4,3,6,4,2,1,0],[2,1,3,1,2,3],'sea-flute','sea-harp'],
 [53,'lydian',[0,2,1,4],[0,2,6,4,7,6,2,4,9,7,11,9,6,7,4,2,3,4,2,1,0],[4,6,9,7,4,2,6,4,2,0],[2,3,2,1,3,1],'sea-harp','sea-celeste'],
 [56,'dorian',[0,4,3,6],[4,7,6,4,2,3,5,4,7,9,7,6,5,3,2,4,6,4,2,1,0],[0,3,4,6,5,2,4,3,1,0],[3,2,2,1,1,3],'sea-bow','sea-glass'],
 [47,'aeolian',[0,3,5,4],[7,9,11,9,7,4,6,5,3,4,7,9,8,6,4,2,3,5,4,2,0],[0,2,3,5,6,4,2,3,1,0],[4,1,1,2,2,2],'sea-glass','sea-cello'],
 [48,'dorian',[0,3,4,0],[0,2,4,7,6,4,5,7,9,7,4,2,3,5,7,6,4,2,1,0],[7,6,4,2,4,5,3,2,1,0],[4,2,3,1,2,4],'sea-cello','sea-flute'],
 [58,'major',[0,1,5,4],[4,2,5,4,7,9,7,6,4,3,5,8,7,5,4,2,4,7,4,2,1,0],[0,2,4,5,7,4,3,5,2,0],[1,2,2,3,1,3],'sea-celeste','sea-harp'],
 [51,'mixolydian',[0,6,4,3],[2,3,4,6,7,6,4,2,1,3,4,7,9,7,5,4,6,3,2,1,0],[4,6,7,5,3,2,4,6,2,0],[2,2,1,3,3,1],'sea-flute','sea-celeste'],
 [54,'lydian',[0,1,5,4],[0,4,6,9,7,6,4,2,4,7,11,9,6,4,5,7,6,3,2,4,0],[7,6,4,2,5,6,7,4,2,0],[3,3,2,1,1,2],'sea-glass','sea-bow'],
 [55,'mixolydian',[0,3,2,6],[4,7,9,7,4,6,5,3,2,4,6,9,7,5,3,4,2,3,1,2,0],[0,2,4,6,5,7,4,3,1,0],[2,1,2,3,1,3],'sea-harp','sea-flute'],
 [50,'lydian',[0,4,2,1],[7,11,9,7,6,4,2,4,6,9,11,13,11,9,7,6,4,2,3,4,0],[0,4,6,7,9,6,4,2,1,0],[3,1,3,2,1,2],'sea-celeste','sea-glass'],
 [52,'major',[0,5,3,1],[0,2,4,7,9,7,6,4,5,8,7,5,3,4,7,6,4,2,3,1,0],[7,5,4,2,4,6,5,3,2,0],[4,1,2,1,3,1],'sea-bow','sea-flute'],
 [53,'dorian',[0,2,6,3],[2,4,7,5,4,2,3,6,7,9,6,4,5,7,6,3,4,2,1,0],[0,3,5,4,2,6,4,3,1,0],[1,1,3,2,2,3],'sea-harp','sea-celeste'],
 [57,'lydian',[0,1,4,5],[0,2,4,6,7,9,11,9,6,7,4,2,4,6,9,7,6,4,2,3,1,0],[7,6,4,2,3,5,6,4,2,0],[2,1,2,1,3,3],'sea-flute','sea-glass']
].map(([key,mode,roots,melody,counter,rhythm,lead,answer],i)=>Object.freeze({key,mode,roots,melody,counter,rhythm,lead,answer,canonDelay:1.1+(i%4)*.17,arp:[0,4,6,8,4,2,6,9],pan:(i%2?1:-1)*.3})));
function oceanScore(index,duration=12,round=0){
 const i=((index%20)+20)%20,s=OCEAN_MUSIC[i],D=Math.max(O_MIN,duration),L=oceanPhase(0,D),end=L.settleAt,span=end-.65,shift=[0,2,-3][Math.floor(Math.max(0,round)/20)%3],scale=O_SCALES[s.mode],degree=d=>s.key+shift+12*Math.floor(d/7)+scale[((d%7)+7)%7],out=[];
 const add=(time,len,inst,midi,vel,pan=0,extra={})=>{if(time<0||time>=D-.08)return;out.push({at:time/D,length:Math.min(len,D-time)/D,inst,midi,vel,pan,...extra})};
 const roots=[...s.roots,0],starts=[0,.65+span*.24,.65+span*.5,.65+span*.76,end],voicing=(root,j)=>[degree(root-7),degree(root+2),degree(root+6),degree(root+8),degree(root+11)-(j%2?12:0)];
 for(let j=0;j<5;j++){const a=starts[j],b=j<4?starts[j+1]:D,root=roots[j];add(a,b-a+.28,'sea-choir',voicing(root,j),.54,0,{spread:.45,drift:j%2?.22:-.16,role:'harmony'});add(a,b-a,'sea-bass',[degree(root-7)],.63,-.07,{role:'bass'});if(j<4)add(a+.3,(b-a)*.8,'sea-bow',[degree(root+4)],.3,s.pan,{role:'inner'});}
 // Immediate voiced answer, without a percussive thump.
 add(0,2.3,'sea-glass',[degree(0)+12,degree(6)+12,degree(9)+12],.48,-.18,{strum:.09,role:'onset'});
 const weights=s.melody.map((_,j)=>s.rhythm[j%s.rhythm.length]),sum=weights.reduce((a,b)=>a+b,0);let acc=0;
 s.melody.forEach((d,j)=>{const t=.65+acc/sum*span,len=weights[j]/sum*span*1.38;add(t,Math.max(.2,len),s.lead,[degree(d)+12],.6+(j%5===0?.1:0),s.pan,{role:'melody',glide:s.lead==='sea-cello'||s.lead==='sea-bow'?degree(s.melody[Math.min(j+1,s.melody.length-1)])+12:undefined});
  // A delayed answer takes selected notes through inversion and a different timbre.
  if(j%3===1&&t+s.canonDelay<end+.3)add(t+s.canonDelay,Math.max(.45,len*1.3),s.answer,[degree(7-d%7)+12],.32,-s.pan,{role:'canon'});acc+=weights[j];});
 // A second independently authored line breathes across the lead, rather than doubling it.
 s.counter.forEach((d,j)=>{const t=.85+j/s.counter.length*(span+.35),next=s.counter[Math.min(j+1,s.counter.length-1)];add(t,span/s.counter.length*1.25,s.answer,[degree(d)],.49,-s.pan,{role:'counter',glide:(s.answer==='sea-cello'||s.answer==='sea-flute')?degree(next):undefined});});
 // Broken extended chords, with holes in the ostinato, use unequal durations.
 const arpCount=i%3===0?27:i%3===1?22:25;for(let j=0;j<arpCount;j++){if((j+i)%7===5)continue;const t=.42+j/arpCount*(end-.3),ch=Math.min(3,Math.floor((t/(end||1))*4)),d=s.roots[ch]+s.arp[(j+i)%s.arp.length];add(t,.7+(j%3)*.18,'sea-harp',[degree(d)+12],.2+(j%4===0?.07:0),Math.sin(j*.79)*.55,{role:'arpeggio'});}
 const hits=oceanEvents(i,D);hits.forEach((t,j)=>{const ch=Math.min(3,Math.floor(j/hits.length*4));add(t,1.5,'sea-droplet',[degree(s.roots[ch]+7)],.36,Math.sin(j*1.8)*.4,{role:'visual-accent'});});
 // Long low calls and filtered tides give the set a distinct submerged acoustic space.
 for(let j=0;j<2;j++){const t=.8+j*span*.49;add(t,2.6+i%3*.15,'sea-whale',[degree(j?3:0)-7],.28,j?-.3:.3,{glide:degree(j?0:4)-7,role:'call'});add(t-.4,3.1,'sea-tide',[48],.34,0,{role:'water'});}
 add(end,2.7,s.answer,[degree(2)+12,degree(6)+12,degree(8)+12],.42,-s.pan,{strum:.13,role:'cadence'});add(end+.48,1.8,'sea-glass',[degree(7)+12],.35,.1,{role:'cadence'});
 return out.sort((a,b)=>a.at-b.at);
}


/* A separate underwater instrument family. Oscillators, slowly changing filters,
 * breath, frequency modulation and a dark stereo reverberation, all synthesized locally.
 */
const OCEAN_SUSTAINED=Object.freeze(['sea-choir','sea-bow','sea-cello','sea-bass','sea-flute','sea-whale','sea-tide']);
const OCEAN_SYN_CACHE=new WeakMap();
function oceanBuffers(ctx){let v=OCEAN_SYN_CACHE.get(ctx);if(v)return v;const rate=ctx.sampleRate,ir=ctx.createBuffer(2,Math.ceil(rate*3.1),rate),noise=ctx.createBuffer(1,rate*2,rate);let seed=92117,rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1};for(let ch=0;ch<2;ch++){const a=ir.getChannelData(ch);let low=0;for(let i=0;i<a.length;i++){low=.84*low+.16*rnd();const u=i/a.length;a[i]=low*(1-u)**2.5*Math.min(1,i/(rate*.04))*.95;}}const a=noise.getChannelData(0);let low=0;for(let i=0;i<a.length;i++){low=.8*low+.2*rnd();a[i]=low;}v={ir,noise};OCEAN_SYN_CACHE.set(ctx,v);return v;}
function createOceanSynth(ctx,destination){
 let group=null;const groups=new Set(),buffers=oceanBuffers(ctx),freq=m=>440*2**((m-69)/12);
 function open(){if(group)return group;const input=ctx.createGain(),out=ctx.createGain(),comp=ctx.createDynamicsCompressor(),rev=ctx.createConvolver(),wet=ctx.createGain(),revFilter=ctx.createBiquadFilter();comp.threshold.value=-18;comp.knee.value=18;comp.ratio.value=2.8;comp.attack.value=.025;comp.release.value=.45;input.connect(comp);rev.buffer=buffers.ir;revFilter.type='lowpass';revFilter.frequency.value=2200;input.connect(revFilter);revFilter.connect(rev);rev.connect(wet);wet.gain.value=.85;wet.connect(comp);const nodes=[input,out,comp,rev,wet,revFilter];for(const [time,pan] of [[.43,-.6],[.71,.6]]){const delay=ctx.createDelay(2),filter=ctx.createBiquadFilter(),fb=ctx.createGain(),panner=ctx.createStereoPanner(),send=ctx.createGain();send.gain.value=.15;delay.delayTime.value=time;filter.type='lowpass';filter.frequency.value=1700;fb.gain.value=.23;panner.pan.value=pan;input.connect(send);send.connect(delay);delay.connect(filter);filter.connect(fb);fb.connect(delay);filter.connect(panner);panner.connect(comp);nodes.push(delay,filter,fb,panner,send)}comp.connect(out);out.connect(destination);group={input,out,sources:new Set(),nodes,stopAt:Infinity};groups.add(group);return group;}
 function voice(g,e,m,t,len,fadeIn){const local=[],sources=[],make=(kind)=>{const n=ctx[kind]();local.push(n);return n},amp=make('createGain'),pan=make('createStereoPanner'),lp=make('createBiquadFilter'),f=freq(m),vel=Oclamp(e.vel??.5),inst=e.inst;pan.pan.value=Oclamp(e.pan||0,-.8,.8);lp.type='lowpass';lp.frequency.value=inst==='sea-bass'?360:inst==='sea-cello'?1500:inst==='sea-whale'?650:inst==='sea-choir'?1800:4200;lp.Q.value=.3;lp.connect(amp);amp.connect(pan);pan.connect(g.input);
  let attack=['sea-glass','sea-celeste','sea-harp','sea-droplet'].includes(inst)?.035:.28,release=inst==='sea-bass'?.65:1.1,level=inst==='sea-bass'?.22:inst==='sea-choir'?.07:inst==='sea-whale'?.13:inst==='sea-tide'?.04:.14;
  attack=Math.min(len*.3,Math.max(attack,fadeIn||0));const end=t+len+release;
  amp.gain.setValueAtTime(0,t);amp.gain.linearRampToValueAtTime(level*vel,t+attack);
  if(['sea-glass','sea-celeste','sea-harp','sea-droplet'].includes(inst)){amp.gain.exponentialRampToValueAtTime(Math.max(.0001,level*vel*.16),t+Math.max(attack+.01,len*.8));amp.gain.exponentialRampToValueAtTime(.0001,end);}
  else {amp.gain.linearRampToValueAtTime(level*vel*.82,t+Math.max(attack,len*.72));amp.gain.linearRampToValueAtTime(0,end);}
  const osc=(type,harm=1,gain=1,detune=0)=>{const o=make('createOscillator'),n=make('createGain');o.type=type;o.frequency.setValueAtTime(f*harm,t);o.detune.value=detune;n.gain.value=gain;o.connect(n);n.connect(lp);if(e.glide!==undefined){o.frequency.exponentialRampToValueAtTime(freq(e.glide)*harm,t+Math.max(.2,len*.9));}o.start(t);o.stop(end+.03);sources.push(o);g.sources.add(o);return o};
  if(inst==='sea-tide'){const src=make('createBufferSource');src.buffer=buffers.noise;src.loop=true;src.connect(lp);lp.type='bandpass';lp.Q.value=.7;lp.frequency.setValueAtTime(230,t);lp.frequency.exponentialRampToValueAtTime(750,t+len*.56);lp.frequency.exponentialRampToValueAtTime(280,end);src.start(t);src.stop(end+.03);sources.push(src);g.sources.add(src);}
  else if(inst==='sea-glass'||inst==='sea-celeste'||inst==='sea-droplet'){const carrier=osc('sine',1,.82),mod=make('createOscillator'),depth=make('createGain'),ratio=inst==='sea-glass'?2.006:inst==='sea-celeste'?3.003:1.51;mod.frequency.value=f*ratio;depth.gain.setValueAtTime(f*(inst==='sea-glass'?.9:.4),t);depth.gain.exponentialRampToValueAtTime(f*.015,t+Math.max(.2,len));mod.connect(depth);depth.connect(carrier.frequency);mod.start(t);mod.stop(end+.03);sources.push(mod);g.sources.add(mod);osc('sine',2,.09,3);if(inst==='sea-droplet'){carrier.frequency.setValueAtTime(f*1.24,t);carrier.frequency.exponentialRampToValueAtTime(f,t+.16);}}
  else if(inst==='sea-harp'){osc('sine',1,.8);osc('sine',2.01,.15);osc('sine',3.99,.035);}
  else if(inst==='sea-bass'){osc('sine',1,.84);osc('triangle',2,.16);}
  else {const lead=osc(inst==='sea-cello'?'triangle':'sine',1,.82,-3);osc('sine',1,.25,3);osc('sine',inst==='sea-choir'?3:2,inst==='sea-choir'?.1:.15);const lfo=make('createOscillator'),depth=make('createGain');lfo.frequency.value=inst==='sea-whale'?.43:inst==='sea-flute'?4.6:3.2;depth.gain.setValueAtTime(0,t);depth.gain.linearRampToValueAtTime(inst==='sea-whale'?f*.026:f*.0035,t+.65);lfo.connect(depth);depth.connect(lead.frequency);lfo.start(t);lfo.stop(end+.03);sources.push(lfo);g.sources.add(lfo);if(inst==='sea-bow'||inst==='sea-cello'){lp.frequency.setValueAtTime(600,t);lp.frequency.linearRampToValueAtTime(1800,t+len*.6);lp.frequency.linearRampToValueAtTime(700,end);}}
  let remaining=sources.length;for(const source of sources)source.onended=()=>{g.sources.delete(source);if(--remaining===0)for(const n of local){try{n.disconnect()}catch{}}};return sources.length;
 }
 return {play(e,when,length,{fadeIn=0}={}){if(!e.inst?.startsWith('sea-')||!(length>0))return 0;const g=open(),n=e.midi.length;for(let j=0;j<n;j++){const pan=(e.pan||0)+(n>1?(j/(n-1)-.5)*(e.spread||.3):0);voice(g,{...e,pan},e.midi[j],when+(e.strum||0)*j,Math.max(.04,length-(e.strum||0)*j),fadeIn)}return n},stop(fade=.04,at=ctx.currentTime){group=null;for(const g of groups){const stopAt=at+fade;if(stopAt>=g.stopAt)continue;g.stopAt=stopAt;g.out.gain.cancelScheduledValues(at);g.out.gain.setValueAtTime(g.out.gain.value,at);g.out.gain.linearRampToValueAtTime(0,stopAt);for(const s of g.sources){try{s.stop(stopAt+.04)}catch{}}const timer=ctx.createBufferSource();timer.buffer=ctx.createBuffer(1,1,ctx.sampleRate);timer.onended=()=>{for(const n of g.nodes){try{n.disconnect()}catch{}}groups.delete(g);};timer.start(stopAt+.15)}},active:()=>[...groups].reduce((n,g)=>n+g.sources.size,0)};
}
function createPimPamSynth(ctx,destination){const original=createSynth(ctx,destination);let ocean=null;return {play(e,...args){if(e.inst?.startsWith('sea-')){ocean??=createOceanSynth(ctx,destination);return ocean.play(e,...args)}return original.play(e,...args)},stop(...args){original.stop(...args);ocean?.stop(...args)},active(){return original.active()+(ocean?.active()||0)}};}

export {Cocean,OCEAN_PATTERNS,OCEAN_SUSTAINED,O_MIN,createPimPamSynth,oceanScore};

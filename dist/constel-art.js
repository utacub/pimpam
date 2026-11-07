// El cel de les constel·lacions (CE10), 0.14: the sky, drawn from code. A night sky over one of four landscapes (a coast with a
// lighthouse, mountains with a lake and a viaduct, fields with a farmhouse and a railway, a village on a hill) in one of four seasons.
// Each press lights a big star, joins it to the stars before with threads of light, and brings something into the landscape that
// stays: windows light up, the lighthouse turns, the moon rises, a shooting star leaves new stars, fireflies, snow, leaves, lanterns,
// an aurora, boats, the Milky Way, a comet, a train or mist. The landscape gets brighter with every star. At the final the figure fills
// with colour, comes alive, crosses the sky and breaks up into shooting stars; then the sky goes quiet for the next round.
// What does not move is drawn once into sheets (escenari.js); soft light is drawn at a quarter of the resolution.
import {K_TAU,Kclamp,Ksmooth,KeaseOut,KeaseInOut,KeaseBack,Krand,Kmix,Krgb,Krgba} from './kaleido-base.js';
import {escAges,escBlit,escCanvas,escDecor,escDecorKey,escFrame,escGrain,escGlow,escGlowLayer,escGroups,escVeiled} from './escenari.js';
import {Ovpoly,Ovcircle,Ovell,Ovrect,Ovline,Ovpaper} from './orquestra-art.js';
import {skPlan,skRound,SK_STEP_MIN,SK_STAGGER} from './constel.js';

// The screen is 1000 units high and x = 0 is its centre, as on the orchestra's stage.
function Svgeo(w,h){const u=h/1000,hw=w/(2*u);return {w,h,u,hw};}
const Svunits=(c,G,fn)=>{c.save();c.translate(G.w/2,0);c.scale(G.u,G.u);fn(c);c.restore();};
// The seasons: the night sky (from the top to the horizon), the tint of the night over the landscape, and the colours of the land.
const SV_SEASONS=Object.freeze([
 {sky:['#0e1550','#262f8c','#5a45ad','#c76bb9','#ffa3bf'],night:'#a49ef0',far:'#8a78d8',mid:'#47b77d',near:'#2f9e66',tree:['#2fb36b','#4cc57c','#1f9a5c'],bloom:['#ffb3d1','#fff0a8','#ffffff'],field:['#8fd16a','#ffe27a','#ff9fc4','#6cc46f'],rock:'#b0688f',sand:'#f4c27a'},
 {sky:['#0a1a4a','#15408a','#2c6db4','#d98aa0','#ffb36e'],night:'#98a6f0',far:'#6a80d0',mid:'#36a46e',near:'#25915e',tree:['#1f9a5c','#33b06a','#178650'],bloom:['#ffd23f','#ff7aa8','#ffffff'],field:['#ffcf4a','#f2a33a','#ffe27a','#9ccf55'],rock:'#b8705a',sand:'#f7cf86'},
 {sky:['#160e3c','#33206f','#6b3592','#c9568b','#ff8d5c'],night:'#a692e6',far:'#8364c0',mid:'#d0773a',near:'#b2582e',tree:['#ff7b2e','#ffb12e','#e5482e'],bloom:['#ffcf4a','#ff7b2e'],field:['#e8a03a','#cf6a30','#ffd26b','#b8542c'],rock:'#9a5a7a',sand:'#e8b070'},
 {sky:['#07133a','#113577','#2a64a8','#6aaee0','#c4ecff'],night:'#a6baf2',far:'#a8b4ea',mid:'#e4ecfa',near:'#f6f9ff',tree:['#1f6b5c','#2a7d68','#185a4c'],bloom:['#ffffff'],field:['#f4f8ff','#e4edf9','#ffffff','#dbe6f7'],rock:'#7f86b8',sand:'#e8e4f4',snow:true}
]);
const SV_VIVID=Object.freeze(['#ff4d6d','#ff9f1c','#ffd23f','#3bceac','#2ec4f1','#5a7bff','#b15cff','#ff6fb5']);
const SV_STARC=Object.freeze(['#fff1a8','#ffc2e8','#b8f0ff','#ffe08a','#d8c8ff','#c4ffd8','#ffd0a8']);
// The same stars in ink, for a white base without the full decor (light added to white would not show).
const SV_STARI=Object.freeze(['#d89a00','#d9468f','#1593c4','#d97b00','#6d4fd6','#1c9a5c','#d9622a']);
// The colours of the landscape at night: each colour multiplied by the night tint of the season (the same shapes as by day, so that
// the night sheet and the lit sheet match exactly and can be crossfaded).
function Svtone(tint){const b=Krgb(tint),memo=new Map();return col=>{let r=memo.get(col);if(!r){r='#'+Krgb(col).map((v,i)=>Math.round(v*b[i]/255).toString(16).padStart(2,'0')).join('');memo.set(col,r);}return r;};}
const Svsame=col=>col;
// Soft round light: one small picture of a glow per colour, stretched where it is needed (far cheaper than a gradient each time).
const SV_SPR=new Map();
function Svspr(color){if(SV_SPR.has(color))return SV_SPR.get(color);const cv=escCanvas(64,64),x=cv?.getContext?.('2d');let s=null;
 if(x&&x.createRadialGradient){const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,Krgba(color,1));g.addColorStop(.35,Krgba(color,.45));g.addColorStop(1,Krgba(color,0));x.fillStyle=g;x.fillRect(0,0,64,64);s=cv;}SV_SPR.set(color,s);return s;}
function Svglow(c,x,y,rx,color,a,ry=rx){if(!(a>.003)||!(rx>0)||!(ry>0))return;const s=Svspr(color);if(!s){escGlow(c,x,y,Math.max(rx,ry),color,a);return;}const k=c.globalAlpha;c.globalAlpha=k*Kclamp(a);c.drawImage(s,x-rx,y-ry,2*rx,2*ry);c.globalAlpha=k;}
// A star with four long rays and four short ones.
function Svsparkle(c,x,y,r,color,a,inner=.16){if(!(a>.003)||!(r>0))return;c.globalAlpha=Kclamp(a);c.fillStyle=color;c.beginPath();for(let j=0;j<8;j++){const ang=j*Math.PI/4,rr=j%2?r*inner:r;c.lineTo(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr);}c.closePath();c.fill();c.globalAlpha=1;}
// Seconds since an event started, kept running between presses: the engine settles old moments at a large age, so the time an event
// started is remembered (in the idle clock) while its age is known, and used afterwards, so that loops (lanterns, the train) never jump.
const SV_LIFE=new Map();
function Svlife(key,age,idle){if(age<0)return -1;if(age<900){SV_LIFE.set(key,idle-age);if(SV_LIFE.size>80)SV_LIFE.delete(SV_LIFE.keys().next().value);return age;}const s=SV_LIFE.get(key);return s===undefined?age:Math.max(0,idle-s);}

// ── The five figures ─────────────────────────────────────────────────────────────────────────────────────────────────────
// The seven stars of each figure in figure units (y down), in the order they light up, the threads between them, the rings (the wheels
// of the bicycle) and the height the figure takes. A thread appears with the later of its two stars and grows from the earlier one.
const SV_FIG=Object.freeze([
 {stars:[[0,-1],[.62,-.3],[0,.55],[-.62,-.3],[.2,.78],[-.04,.98],[.22,1.16]],edges:[[0,1],[1,2],[2,3],[3,0],[2,4],[4,5],[5,6]],box:[-1,1.16]},
 {stars:[[-.92,.36],[-.55,.72],[.55,.72],[.92,.36],[.08,.36],[.08,-1],[.8,.2]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[4,5],[5,0],[5,6],[6,4]],box:[-1,.76]},
 {stars:[[-.62,.42],[-.04,.42],[-.26,-.16],[.42,-.16],[.64,.42],[.3,-.48],[-.36,-.3]],edges:[[0,1],[1,2],[2,0],[2,3],[3,1],[3,4],[3,5],[2,6]],rings:[[0,.4],[4,.4]],box:[-.52,.84]},
 {stars:[[0,-1],[.66,-.42],[.4,.2],[.17,.66],[-.17,.66],[-.4,.2],[-.66,-.42]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[2,5]],box:[-1,.88]},
 {stars:[[-.95,.04],[-.52,-.46],[0,-.64],[.52,-.46],[.95,.04],[0,.74],[-.26,.76]],edges:[[0,1],[1,2],[2,3],[3,4],[4,0],[2,5],[5,6]],box:[-.8,.9]}
]);
// The figures in colour (figure units; p are the stars, which may move; spin turns the wheels).
const Svoutline=(c,w=.012)=>{c.strokeStyle='rgba(255,246,224,.85)';c.lineWidth=w;c.lineJoin='round';c.stroke();};
const SV_FILL=[
 // The kite: four coloured panels, the two sticks, and a tail with bows.
 (c,p)=>{const m=[(p[0][0]+p[2][0])/2,(p[1][1]+p[3][1])/2];[[0,1,'#ff4d6d'],[1,2,'#ffd23f'],[2,3,'#2ec4f1'],[3,0,'#3bceac']].forEach(([a,b,col])=>{Ovpoly(c,[p[a],p[b],m],col);Svoutline(c);});
  Ovline(c,[p[0],p[2]],'#7a3f24',.025);Ovline(c,[p[1],p[3]],'#7a3f24',.025);
  c.beginPath();c.moveTo(p[2][0],p[2][1]);for(let i=3;i<6;i++){const a=p[i===3?2:i],b=p[i+1];c.quadraticCurveTo(a[0]+(b[0]-a[0])*.5+.08,a[1]+(b[1]-a[1])*.5,b[0],b[1]);}c.strokeStyle='#fff3d6';c.lineWidth=.014;c.stroke();
  [[4,'#ff6fb5'],[5,'#b15cff'],[6,'#ff9f1c']].forEach(([i,col])=>{const [x,y]=p[i];Ovpoly(c,[[x-.09,y-.05],[x,y],[x-.09,y+.05]],col);Ovpoly(c,[[x+.09,y-.05],[x,y],[x+.09,y+.05]],col);});},
 // The sailing boat: a red hull with a yellow band and portholes, the mast, a striped mainsail, a blue jib and a flag.
 (c,p)=>{Ovpoly(c,[p[0],p[1],p[2],p[3]],'#ff4d6d');Svoutline(c);Ovpoly(c,[[p[0][0]+.06,p[0][1]+.09],[p[3][0]-.06,p[3][1]+.09],[p[3][0]-.1,p[3][1]+.17],[p[0][0]+.1,p[0][1]+.17]],'#ffd23f');
  for(let i=0;i<3;i++)Ovcircle(c,-.36+i*.36,p[0][1]+.25,.045,'#fff3d6');
  const foot=[p[4][0],p[4][1]-.07];Ovpoly(c,[p[5],p[6],[foot[0]+.03,foot[1]]],'#fff6e6');Svoutline(c);
  c.save();c.clip();for(let i=0;i<3;i++){const y=p[5][1]+.38+i*.38;Ovrect(c,-.2,y,1.2,.12,'#2ec4f1');}c.restore();
  Ovpoly(c,[p[5],[p[0][0]+.14,p[0][1]-.05],[foot[0]-.03,foot[1]]],'#2ec4f1');Svoutline(c);
  Ovline(c,[p[4],p[5]],'#7a3f24',.03);Ovpoly(c,[[p[5][0],p[5][1]-.02],[p[5][0]+.22,p[5][1]+.04],[p[5][0],p[5][1]+.1]],'#3bceac');},
 // The bicycle: wheels with coloured spokes that turn, a blue frame, a red saddle, the handlebar and the pedals.
 (c,p,spin)=>{for(const w of [p[0],p[4]]){for(let i=0;i<6;i++){c.beginPath();c.moveTo(w[0],w[1]);c.arc(w[0],w[1],.37,spin+i*Math.PI/3,spin+(i+1)*Math.PI/3);c.closePath();c.fillStyle=Krgba(SV_VIVID[(i*3)%8],.62);c.fill();}
   c.beginPath();c.arc(w[0],w[1],.4,0,K_TAU);c.strokeStyle='#ff9f1c';c.lineWidth=.05;c.stroke();Ovcircle(c,w[0],w[1],.055,'#fff3d6');}
  for(const [a,b] of [[0,1],[1,2],[2,0],[2,3],[3,1],[3,4]])Ovline(c,[p[a],p[b]],'#5a7bff',.055);
  Ovline(c,[p[2],p[6]],'#2b2d58',.035);Ovline(c,[p[3],p[5]],'#2b2d58',.04);Ovline(c,[[p[5][0]-.14,p[5][1]-.03],p[5],[p[5][0]+.08,p[5][1]+.05]],'#2b2d58',.04);Ovell(c,p[6][0],p[6][1],.15,.05,'#ff4d6d');
  for(const sg of [1,-1]){const x=p[1][0]+Math.cos(spin)*.14*sg,y=p[1][1]+Math.sin(spin)*.14*sg;Ovline(c,[p[1],[x,y]],'#2b2d58',.03);Ovrect(c,x-.06,y-.018,.12,.036,'#ffd23f');}},
 // The balloon: an envelope with coloured gores, the skirt, the ropes, the basket and a little flame.
 (c,p,spin,live)=>{c.save();c.beginPath();c.moveTo(-.22,.45);c.bezierCurveTo(-.78,.05,-.86,-.95,p[0][0],p[0][1]);c.bezierCurveTo(.86,-.95,.78,.05,.22,.45);c.closePath();Svoutline(c,.02);c.clip();
  ['#ff4d6d','#ff9f1c','#ffd23f','#3bceac','#2ec4f1','#5a7bff','#b15cff'].forEach((col,i)=>Ovell(c,0,-.3,.92*(1-i/7)+.02,1.3,col));c.restore();
  Ovpoly(c,[[-.22,.45],[.22,.45],[.16,.56],[-.16,.56]],'#c8763a');Ovline(c,[[-.16,.56],p[4]],'#fff3d6',.012);Ovline(c,[[.16,.56],p[3]],'#fff3d6',.012);
  if(live>0)Ovpoly(c,[[-.05,.6],[0,.5-.04*live*(1+Math.sin(spin*7))],[.05,.6]],Krgba('#ffb347',live));
  Ovrect(c,p[4][0],p[4][1],p[3][0]-p[4][0],.2,'#d9843e',.03);for(let i=1;i<4;i++)Ovline(c,[[p[4][0]+.02,p[4][1]+i*.05],[p[3][0]-.02,p[3][1]+i*.05]],'#a65a2a',.008);},
 // The umbrella: a canopy with four coloured panels and a scalloped hem, the ribs, the shaft and the hooked handle.
 (c,p)=>{const top=p[2],hem=.06;c.save();c.beginPath();c.moveTo(p[0][0],p[0][1]);c.bezierCurveTo(-.92,-.5,-.45,-.66,top[0],top[1]);c.bezierCurveTo(.45,-.66,.92,-.5,p[4][0],p[4][1]);
  for(let i=0;i<4;i++){const x0=p[4][0]-(p[4][0]-p[0][0])*i/4,x1=p[4][0]-(p[4][0]-p[0][0])*(i+1)/4,y0=p[4][1]+(p[0][1]-p[4][1])*i/4,y1=p[4][1]+(p[0][1]-p[4][1])*(i+1)/4;c.quadraticCurveTo((x0+x1)/2,(y0+y1)/2-hem*2,x1,y1);}
  c.closePath();Svoutline(c,.02);c.clip();['#ff4d6d','#ffd23f','#2ec4f1','#3bceac'].forEach((col,i)=>{const xa=p[0][0]+(p[4][0]-p[0][0])*i/4,xb=p[0][0]+(p[4][0]-p[0][0])*(i+1)/4;Ovpoly(c,[[top[0],top[1]-.1],[xa*1.3,.2],[xb*1.3,.2]],col);});
  for(let i=1;i<4;i++){const x=p[0][0]+(p[4][0]-p[0][0])*i/4;Ovline(c,[top,[x*1.05,.05]],'rgba(255,246,224,.8)',.012);}c.restore();
  Ovline(c,[[top[0],top[1]-.13],p[5]],'#4a2e1c',.03);c.beginPath();c.arc((p[5][0]+p[6][0])/2,p[5][1],Math.abs(p[5][0]-p[6][0])/2,0,Math.PI);c.strokeStyle='#4a2e1c';c.lineWidth=.03;c.stroke();}
];

// ── The four landscapes ──────────────────────────────────────────────────────────────────────────────────────────────────
// Drawn with their main features on the right (s = 1) and mirrored when s = -1. Each one gives its houses (whose windows light up),
// where the lighthouse, the water, the railway, the valleys (mist), the grass (fireflies) and the release spots of the lanterns are,
// and where the moon and the comet go.
// The windows of a house, in a grid; the door takes the place of a window at one end of the bottom row (never in the middle, so that
// two windows and a door never read as a face).
const Svdoor=H=>{const cols=Math.max(1,Math.floor((H.wd-12)/28));return Math.floor(Math.abs(H.x)/9)%2?0:cols-1;};
function Svwins(H){const cols=Math.max(1,Math.floor((H.wd-12)/28)),rows=Math.max(1,Math.floor((H.ht-20)/36)),out=[],x0=H.x-cols*28/2+6;
 for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){if(H.door&&r===rows-1&&k===Svdoor(H))continue;out.push({x:x0+k*28,y:H.y-H.ht+12+r*36,w:16,h:20});}return out;}
function Svhouse(c,T,H){const {x,y,wd,ht}=H,top=y-ht;Ovpaper(c,()=>{c.beginPath();c.rect(x-wd/2,top,wd,ht+44);},T(H.col),5);
 const roof=H.snow?'#f4f8ff':H.roof;if(H.kind===0){Ovpoly(c,[[x-wd/2-7,top+3],[x,top-wd*.36],[x+wd/2+7,top+3]],T(roof));if(H.snow)Ovline(c,[[x-wd/2-7,top+3],[x+wd/2+7,top+3]],T(H.roof),4);}
 else{Ovrect(c,x-wd/2-5,top-9,wd+10,12,T(roof),3);}
 for(const W of Svwins(H)){Ovrect(c,W.x-2,W.y-2,W.w+4,W.h+4,T(Kmix(H.col,'#ffffff',.5)),2);Ovrect(c,W.x,W.y,W.w,W.h,T('#2b2552'),2);}
 if(H.door){const cols=Math.max(1,Math.floor((wd-12)/28)),dx=x-cols*28/2+6+Svdoor(H)*28,dh=Math.min(30,ht*.55);Ovrect(c,dx-1,y-dh,18,dh+2,T(Kmix(H.col,'#ffffff',.5)),2);Ovrect(c,dx+1,y-dh+2,14,dh,T('#5b3a8a'),1);}}
function Svpine(c,T,x,y,hgt,col,snow){Ovrect(c,x-3,y-hgt*.22,6,hgt*.24,T('#5a3a28'));for(let i=0;i<3;i++){const yy=y-hgt*.16-i*hgt*.25,wd=hgt*(.34-.07*i);Ovpoly(c,[[x-wd,yy],[x,yy-hgt*.44],[x+wd,yy]],T(col));if(snow)Ovpoly(c,[[x-wd*.42,yy-hgt*.25],[x,yy-hgt*.44],[x+wd*.42,yy-hgt*.25]],T('#f4f8ff'));}}
function Svtree(c,T,x,y,r,col,bloom,seed){Ovrect(c,x-4,y-r*.95,8,r,T('#6b4a32'));Ovpaper(c,()=>{c.beginPath();for(const [dx,dy,k] of [[0,-1.45,1],[-.62,-1.05,.7],[.62,-1.1,.72]]){c.moveTo(x+dx*r+k*r,y+dy*r);c.arc(x+dx*r,y+dy*r,k*r,0,K_TAU);}},T(col),4);
 if(bloom)for(let i=0;i<8;i++)Ovcircle(c,x+(Krand(i,seed)-.5)*r*1.9,y-r*1.4+(Krand(i,seed+1)-.5)*r*1.4,r*.1,T(bloom));}
const Svridge=(x,y,amp,seed,f=1)=>y+amp*(Math.sin(x*.004*f+seed)*.6+Math.sin(x*.011*f+seed*2.3)*.3+Math.sin(x*.023*f+seed*.7)*.1);
function Svband(c,G,T,fy,col,lift=6){Ovpaper(c,()=>{c.beginPath();c.moveTo(-G.hw-12,1010);for(let x=-G.hw-12;x<=G.hw+12;x+=16)c.lineTo(x,fy(x));c.lineTo(G.hw+12,1010);c.closePath();},T(col),lift);}
const Svat=(pts,x)=>{for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1];if((x-x0)*(x-x1)<=0)return y0+(y1-y0)*((x-x0)/((x1-x0)||1));}return pts[x<pts[0][0]===pts[0][0]<pts[pts.length-1][0]?0:pts.length-1][1];};

const SV_LAND=new Map();
function Svland(land,season,G){const id=`${land}|${season}|${Math.round(G.hw)}`;if(SV_LAND.has(id))return SV_LAND.get(id);
 const hw=G.hw,SE=SV_SEASONS[season],snow=!!SE.snow,houses=[],L={houses,spots:[],grass:[],valleys:[],water:null,track:null,lamp:null,moon:[hw*.56,170],comet:[hw*.22,96]};let draw;
 const HC=['#ff7a59','#ffc145','#35c4a6','#f0609a','#5b8def','#ffd166','#a06bd8','#ff9f43'];
 if(land===0){
  // The coast: the sea in bands, a headland with a lighthouse and its keeper's house, and white houses on a hill by a beach.
  const top=[[hw*.4,1010],[hw*.43,770],[hw*.47,694],[hw*.55,612],[hw*.68,570],[hw+14,556]],hill=x=>575+130*Ksmooth((x+hw)/(hw*.9)),LX=Math.min(hw-90,hw*.8),LB=Svat(top,LX)+8;
  L.lamp={x:LX,y:LB-182};L.moon=[hw*.26,180];L.comet=[hw*.64,100];L.water={x0:-hw*.04,x1:hw*.38,y0:750,y1:930};
  const cols=['#fff6e6','#ffd166','#ff9fb8','#7fe0d0','#ffffff','#ffb36e','#a8d8ff','#ffe0f0'];
  for(let i=0;i<9;i++){const x=-hw+46+i*(hw*.78-40)/8+(Krand(i,61)-.5)*16,back=i%2===0;houses.push({x,y:hill(x)+(back?20:56),wd:56+Krand(i,62)*24,ht:44+Krand(i,63)*22,col:cols[i%8],roof:'#d9573a',kind:Krand(i,64)<.6?1:0,door:!back,snow,back});}
  houses.sort((a,b)=>a.y-b.y);houses.push({x:LX-66,y:Svat(top,LX-66)+34,wd:62,ht:44,col:'#ffffff',roof:'#d9573a',kind:0,door:true,snow});
  L.spots=[...houses.filter(H=>!H.back).map(H=>[H.x,H.y-H.ht]),[-hw*.55,930],[-hw*.32,965]];L.grass=[[-hw,-hw*.25,640,820],[hw*.5,hw,620,720]];
  draw=(c,T)=>{
   [[688,'#6aa6f2',3],[726,'#4f8de6',5],[776,'#3d78d8',6],[842,'#2e64c6',8],[918,'#2353b0',9]].forEach(([y,col,a],i)=>Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-12,1010);for(let x=-hw-12;x<=hw+12;x+=18)c.lineTo(x,y+a*Math.sin(x*.05+i*1.7));c.lineTo(hw+12,1010);c.closePath();},T(col),i?4:0));
   for(let i=0;i<14;i++){const x=(Krand(i,66)*2-1)*hw,y=700+Krand(i,67)*260;Ovline(c,[[x-18,y],[x+18,y]],T('#9cc8ff'),2);}
   Ovpaper(c,()=>{c.beginPath();top.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineTo(hw+14,1010);c.closePath();},T(SE.rock),8);
   for(let i=0;i<5;i++)Ovline(c,[[hw*(.45+i*.025),640+i*70],[hw+14,610+i*72]],T(Kmix(SE.rock,'#2b2552',.18)),5);
   c.beginPath();for(let i=2;i<top.length;i++)c.lineTo(top[i][0],top[i][1]);for(let i=top.length-1;i>=2;i--)c.lineTo(top[i][0]+(i===2?8:0),top[i][1]+26);c.closePath();c.fillStyle=T(SE.mid);c.fill();
   for(const [x,y,r] of [[hw*.41,900,30],[hw*.36,950,22],[hw*.45,980,26]])Ovpaper(c,()=>{c.beginPath();c.ellipse(x,y,r*1.4,r,0,0,K_TAU);},T('#6a4a7a'),4);
   const hwAt=y=>28-9*(LB-y)/160;Ovpaper(c,()=>{c.beginPath();c.moveTo(LX-28,LB);c.lineTo(LX-19,LB-160);c.lineTo(LX+19,LB-160);c.lineTo(LX+28,LB);c.closePath();},T('#ffffff'),6);
   for(let b=0;b<2;b++){const y0=LB-34-b*64,y1=y0-30;Ovpoly(c,[[LX-hwAt(y0),y0],[LX-hwAt(y1),y1],[LX+hwAt(y1),y1],[LX+hwAt(y0),y0]],T('#e0443e'));}
   Ovrect(c,LX-27,LB-168,54,9,T('#2b2d58'),3);Ovrect(c,LX-15,LB-198,30,31,T('#2b3a6a'),3);for(const dx of [-5,5])Ovline(c,[[LX+dx,LB-197],[LX+dx,LB-168]],T('#1d1838'),2);
   c.beginPath();c.arc(LX,LB-198,16,Math.PI,0);c.closePath();c.fillStyle=T('#e0443e');c.fill();Ovline(c,[[LX,LB-214],[LX,LB-226]],T('#2b2d58'),3);Ovrect(c,LX-8,LB-26,16,26,T('#5b3a8a'),8);
   Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-12,1010);for(let x=-hw-12;x<=-hw*.08;x+=16)c.lineTo(x,hill(x));c.lineTo(-hw*.03,760);c.lineTo(-hw*.1,880);c.lineTo(-hw*.22,1010);c.closePath();},T(SE.mid),8);
   for(const [x,k] of [[-hw*.86,1],[-hw*.3,.85]]){const y=hill(x)+10;Ovline(c,[[x,y],[x+6*k,y-60*k],[x+14*k,y-96*k]],T('#6b4a32'),8*k);Ovpaper(c,()=>{c.beginPath();c.ellipse(x+14*k,y-104*k,62*k,20*k,0,0,K_TAU);c.moveTo(x-20*k,y-118*k);c.ellipse(x-4*k,y-118*k,36*k,14*k,0,0,K_TAU);},T(SE.tree[2]),5);}
   for(const H of houses)Svhouse(c,T,H);
   Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-12,1010);c.lineTo(-hw-12,880);c.quadraticCurveTo(-hw*.6,880,-hw*.38,936);c.quadraticCurveTo(-hw*.26,970,-hw*.18,1010);c.closePath();},T(SE.sand),6);
   for(let i=0;i<10;i++)Ovcircle(c,-hw+Krand(i,68)*hw*.7,920+Krand(i,69)*70,2.4,T('#ffffff'));};
 }else if(land===1){
  // The mountains: a far range with snowy peaks, a viaduct between two tunnels, wooded slopes with cabins and a lake.
  const peaks=[];for(let x=-hw-80,i=0;x<hw+120;i++){peaks.push([x,x>0?425+Krand(i,71)*85:478+Krand(i,71)*64]);x+=130+Krand(i,72)*90;}
  const vall=peaks.slice(0,-1).map(([x,y],i)=>[(x+peaks[i+1][0])/2+(Krand(i,73)-.5)*30,585+Krand(i,74)*25]);
  const right=[[hw*.38,1010],[hw*.5,760],[hw*.56,650],[hw*.6,575],[hw*.66,548],[hw*.8,522],[hw+14,500]],left=[[-hw*.4,1010],[-hw*.5,770],[-hw*.56,662],[-hw*.6,585],[-hw*.7,566],[-hw*.85,548],[-hw-14,532]];
  for(const [x,side] of [[hw*.72,1],[hw*.9,1],[-hw*.76,-1],[-hw*.92,-1]])houses.push({x,y:Svat(side>0?right:left,x)+16,wd:66,ht:44,col:side>0?'#c8763a':'#e0a050',roof:'#b3122e',kind:0,door:true,snow});
  houses.push({x:hw*.81,y:Svat(right,hw*.81)+30,wd:50,ht:58,col:'#fff1d6',roof:'#5b3a8a',kind:0,door:true,snow});houses.sort((a,b)=>a.y-b.y);
  L.moon=[hw*.3,170];L.comet=[hw*.66,100];L.water={x0:-hw*.3,x1:hw*.3,y0:815,y1:905,lake:true};
  L.track={y:632,x0:-hw*.57,x1:hw*.57,clip:true,lamps:[[-hw*.3,604],[0,604],[hw*.3,604]]};L.valleys=[600,770];
  L.spots=[...houses.map(H=>[H.x,H.y-H.ht]),[-hw*.25,820],[hw*.18,830]];L.grass=[[-hw,-hw*.45,700,980],[hw*.45,hw,700,980],[-hw*.4,hw*.4,940,995]];
  draw=(c,T)=>{
   Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-90,1010);peaks.forEach((p,i)=>{c.lineTo(p[0],p[1]);if(vall[i])c.lineTo(vall[i][0],vall[i][1]);});c.lineTo(hw+130,1010);c.closePath();},T(SE.far),6);
   peaks.forEach((p,i)=>{const l=vall[i-1]||[p[0]-90,600],r=vall[i]||[p[0]+90,600],f=.3,pt=(q,k)=>[p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k];Ovpoly(c,[p,pt(r,f),[...pt(r,f*.55)].map((v,j)=>j?v+10:v-6),pt([p[0],p[1]+80],f),pt(l,f*.6),pt(l,f)],T('#f4f8ff'));});
   Svband(c,G,T,x=>Svridge(x,606,26,1.7),Kmix(SE.far,SE.mid,.5),6);
   // The viaduct: a stone band with its arches cut out (even-odd fill).
   const xa=-hw*.6,xb=hw*.6;c.save();c.shadowColor='rgba(18,10,40,.38)';c.shadowBlur=10;c.shadowOffsetY=4;c.beginPath();c.rect(xa,624,xb-xa,150);for(let x=xa+20;x<xb-60;x+=92){c.moveTo(x+12,780);c.lineTo(x+12,684);c.arc(x+46,684,34,Math.PI,0);c.lineTo(x+80,780);c.closePath();}c.fillStyle=T('#c99a6e');c.fill('evenodd');c.restore();
   Ovrect(c,xa,620,xb-xa,8,T('#8a6248'));Ovline(c,[[xa,618],[xb,618]],T('#3a2a40'),3);for(const [x,y] of L.track.lamps){Ovline(c,[[x,618],[x,y+6]],T('#3a2a40'),3);Ovcircle(c,x,y,6,T('#3a3450'));}
   Ovpaper(c,()=>{c.beginPath();c.ellipse(0,866,hw*.47,92,0,0,K_TAU);},T(snow?'#e8eef9':SE.sand),4);Ovell(c,0,862,hw*.44,78,T('#3172d8'));Ovell(c,0,846,hw*.36,40,T('#4a8be6'));Ovell(c,0,836,hw*.26,18,T('#5d9cf0'));
   for(const pts of [left,right]){Ovpaper(c,()=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineTo(pts[pts.length-1][0],1010);c.closePath();},T(SE.near),8);
    const sg=Math.sign(pts[pts.length-1][0]),px=sg*hw*.585,py=Svat(pts,px)+22;c.beginPath();c.moveTo(px-24*sg,632);c.lineTo(px-24*sg,py+20);c.arc(px,py+20,24,Math.PI,0);c.lineTo(px+24*sg,632);c.closePath();c.fillStyle=T('#8a6248');c.fill();
    c.beginPath();c.moveTo(px-17,632);c.lineTo(px-17,py+24);c.arc(px,py+24,17,Math.PI,0);c.lineTo(px+17,632);c.closePath();c.fillStyle=T('#1d1838');c.fill();}
   for(const H of houses)Svhouse(c,T,H);
   const pines=[];for(const pts of [left,right])for(let i=0;i<11;i++){const sg=Math.sign(pts[pts.length-1][0]),x=sg*(hw*.47+Krand(i,sg+76)*hw*.53),yt=Svat(pts,x);pines.push([x,yt+40+Krand(i,sg+77)*(1000-yt-60),54+Krand(i,sg+78)*40]);}
   pines.sort((a,b)=>a[1]-b[1]).forEach(([x,y,s],i)=>Svpine(c,T,x,y,s,SE.tree[i%3],snow));
   Svband(c,G,T,x=>Svridge(x,958,10,.4,3),SE.near,5);if(!snow)for(let i=0;i<26;i++)Ovcircle(c,(Krand(i,79)*2-1)*hw,968+Krand(i,80)*26,3,T(SE.bloom[i%SE.bloom.length]));};
 }else if(land===2){
  // The fields: rolling bands of crops, a farmhouse with a barn and cypresses, a railway with telegraph poles, trees and haystacks.
  const r0=x=>Svridge(x,596,24,.6),r1=x=>Svridge(x,652,20,1.3),r2=x=>Svridge(x,706,10,.4),r3=x=>Svridge(x,786,20,2.1),r4=x=>Svridge(x,884,14,.9);
  const FX=hw*.42;houses.push({x:FX,y:r1(FX)+56,wd:168,ht:96,col:'#ffd8a0',roof:'#d9573a',kind:0,door:true,snow},{x:FX+136,y:r1(FX+136)+58,wd:92,ht:70,col:'#e0443e',roof:'#7a2a2a',kind:0,door:false,snow},{x:-hw*.62,y:r3(-hw*.62)+40,wd:84,ht:62,col:'#7fd0ff',roof:'#d9573a',kind:0,door:true,snow});
  L.track={y:734,x0:-hw-40,x1:hw+40,clip:false,lamps:[[-hw*.55,694],[hw*.05,694],[hw*.7,694]]};L.valleys=[640,770];
  L.spots=[[FX,620],[FX+136,640],[-hw*.62,760],[-hw*.2,900],[hw*.2,930],[hw*.75,900],[-hw*.85,920]];L.grass=[[-hw,hw,800,990]];
  draw=(c,T)=>{
   Svband(c,G,T,r0,SE.far,6);
   for(const [fy,col,k] of [[r1,SE.field[0],0],[r2,SE.field[1],1]]){Svband(c,G,T,fy,col,6);for(let j=1;j<5;j++)Ovline(c,Array.from({length:Math.ceil(2*hw/24)+2},(_,i)=>[-hw-12+i*24,fy(-hw-12+i*24)+j*13]),T(Kmix(col,'#5b3a2a',.22)),2);}
   Ovpaper(c,()=>{c.beginPath();c.ellipse(FX-120,r1(FX-120)+40,12,64,0,0,K_TAU);c.moveTo(FX-96+14,r1(FX-96)+30);c.ellipse(FX-96,r1(FX-96)+36,10,52,0,0,K_TAU);},T(SE.tree[2]),5);
   for(const H of houses.slice(0,2))Svhouse(c,T,H);const B=houses[1];Ovrect(c,B.x-20,B.y-36,40,38,T('#fff1d6'),2);Ovline(c,[[B.x-18,B.y-34],[B.x+18,B.y]],T('#e0443e'),3);Ovline(c,[[B.x+18,B.y-34],[B.x-18,B.y]],T('#e0443e'),3);
   const poles=[];for(let x=-hw-40;x<hw+60;x+=170)poles.push(x);for(let i=0;i<poles.length-1;i++)Ovline(c,Array.from({length:11},(_,k)=>{const x=poles[i]+k*17;return [x,652+14*(1-Math.pow(k/5-1,2))];}),T('#3a2a40'),1.5);
   for(const x of poles){Ovline(c,[[x,738],[x,646]],T('#6b4a32'),5);Ovline(c,[[x-12,652],[x+12,652]],T('#6b4a32'),4);}
   Ovrect(c,-hw-14,724,2*hw+28,22,T('#b98a6a'));for(let x=-hw-10;x<hw+12;x+=16)Ovrect(c,x,728,8,10,T('#7a5236'));Ovline(c,[[-hw-14,728],[hw+14,728]],T('#3a2a40'),3);
   for(const [x,y] of L.track.lamps){Ovline(c,[[x,728],[x,y+6]],T('#3a2a40'),3);Ovcircle(c,x,y,6,T('#3a3450'));}
   Svband(c,G,T,r3,SE.field[2],7);for(let j=1;j<4;j++)Ovline(c,Array.from({length:Math.ceil(2*hw/24)+2},(_,i)=>[-hw-12+i*24,r3(-hw-12+i*24)+j*18]),T(Kmix(SE.field[2],'#5b3a2a',.2)),2);
   Svhouse(c,T,houses[2]);
   for(let i=0;i<3;i++){const x=(-.3+i*.42)*hw,y=r3(x)+30;Svtree(c,T,x,y,34,SE.tree[i%3],season===0?SE.bloom[0]:null,90+i);}
   if(season===1||season===2)for(let i=0;i<4;i++){const x=(-.85+i*.3)*hw+60,y=r3(x)+60;Ovpaper(c,()=>{c.beginPath();c.ellipse(x,y,36,30,0,Math.PI,0);c.closePath();},T('#ffd166'),4);Ovline(c,[[x-30,y-10],[x+30,y-10]],T('#e8a03a'),2);}
   Svband(c,G,T,r4,SE.field[3],7);if(!snow)for(let i=0;i<34;i++)Ovcircle(c,(Krand(i,92)*2-1)*hw,915+Krand(i,93)*80,3.2,T(SE.bloom[i%SE.bloom.length]));};
 }else{
  // The village on a hill: houses in rows up the slope, a church with a bell tower at the top, cypresses and trees.
  const xc=hw*.3,hill=x=>520+300*Math.pow(Math.min(1,Math.abs(x-xc)/(hw*1.15)),1.25);
  for(let r=0;r<5;r++){const y=574+r*70,reach=100+r*hw*.19;let i=0;for(let x=xc-reach;x<xc+reach;i++){const wd=58+Krand(i+r*20,95)*30;if(!(r===0&&Math.abs(x+wd/2-xc)<80))houses.push({x:x+wd/2,y:y+Krand(i+r*20,96)*10,wd,ht:56+Krand(i+r*20,97)*30,col:HC[(i*3+r)%8],roof:['#d9573a','#b3122e','#7a3f24'][(i+r)%3],kind:Krand(i+r*20,98)<.75?0:1,door:Krand(i+r*20,99)<.6,snow,row:r});x+=wd+2+Krand(i+r*20,100)*18;}}
  L.spots=houses.filter((H,i)=>i%5===2).map(H=>[H.x,H.y-H.ht]);L.grass=[[-hw,hw,905,990],[-hw,-hw*.2,640,880]];L.moon=[hw*.58,170];L.comet=[hw*.2,96];
  draw=(c,T)=>{
   Svband(c,G,T,x=>Svridge(x,590,30,2.6),SE.far,6);
   Ovpaper(c,()=>{c.beginPath();c.moveTo(-hw-12,1010);for(let x=-hw-12;x<=hw+12;x+=16)c.lineTo(x,hill(x));c.lineTo(hw+12,1010);c.closePath();},T(SE.mid),8);
   Ovpaper(c,()=>{c.beginPath();c.rect(xc+20,474,140,90);},T('#fff1d6'),5);Ovpoly(c,[[xc+14,478],[xc+90,430],[xc+166,478]],T(snow?'#f4f8ff':'#d9573a'));Ovrect(c,xc+70,500,40,62,T('#5b3a8a'),20);
   Ovpaper(c,()=>{c.beginPath();c.rect(xc-28,380,56,190);},T('#ffe0a0'),6);Ovpoly(c,[[xc-34,384],[xc,316],[xc+34,384]],T(snow?'#f4f8ff':'#2f78b8'));Ovline(c,[[xc,316],[xc,296]],T('#3a2a40'),3);
   Ovrect(c,xc-14,398,28,40,T('#2b2552'),14);Ovcircle(c,xc,470,14,T('#ff9fb8'));Ovcircle(c,xc,470,7,T('#5b8def'));
   for(const dx of [-150,-118,184])Ovpaper(c,()=>{c.beginPath();c.ellipse(xc+dx,hill(xc+dx)-40,13,58,0,0,K_TAU);},T(SE.tree[2]),4);
   houses.forEach((H,i)=>{Svhouse(c,T,H);if(i%6===3)Svtree(c,T,H.x+H.wd/2+6,H.y+26,22,SE.tree[i%3],season===0?SE.bloom[0]:null,120+i);});
   Svband(c,G,T,x=>Svridge(x,912,12,.5,2),SE.near,7);Ovrect(c,-hw-12,948,2*hw+24,14,T('#c9a27a'));for(let x=-hw;x<hw;x+=46)Ovrect(c,x,950,40,10,T('#b48a64'),2);
   if(!snow)for(let i=0;i<30;i++)Ovcircle(c,(Krand(i,101)*2-1)*hw,972+Krand(i,102)*24,3,T(SE.bloom[i%SE.bloom.length]));};
 }
 L.windows=houses.flatMap(H=>Svwins(H));L.windows.forEach((W,i)=>{W.r=Krand(i,57);});L.draw=draw;SV_LAND.set(id,L);if(SV_LAND.size>16)SV_LAND.delete(SV_LAND.keys().next().value);return L;}

// The night sky of a season: a gradient down to a coloured horizon and many small stars, fewer near the horizon.
function Svsky(c,G,season){const hw=G.hw,SE=SV_SEASONS[season],g=c.createLinearGradient(0,0,0,730);SE.sky.forEach((col,i)=>g.addColorStop(i/(SE.sky.length-1),col));c.fillStyle=g;c.fillRect(-hw-2,-2,2*hw+4,1004);
 for(let i=0;i<200;i++){const x=(Krand(i,season*7+201)*2-1)*hw,y=8+Math.pow(Krand(i,season*7+202),1.5)*650,r=.7+Math.pow(Krand(i,season*7+203),3)*2.2;Ovcircle(c,x,y,r,Krgba(['#ffffff','#fff3c8','#d8e8ff','#ffd8f0'][i%4],(.35+Krand(i,season*7+204)*.6)*(1-y/900)));}}
// The Milky Way: a band of fine dust (sharp) and a soft glow (drawn at a quarter of the resolution), from one side of the sky to the other.
function Svmilky(G,s){const P0=[-s*G.hw*1.05,600],P1=[s*G.hw*1.05,40],dx=P1[0]-P0[0],dy=P1[1]-P0[1],len=Math.hypot(dx,dy);return {P0,P1,len,ang:Math.atan2(dy,dx),nx:-dy/len,ny:dx/len};}
function Svmilkydust(c,G,M){for(let i=0;i<620;i++){const q=Krand(i,111),g=(Krand(i,112)+Krand(i,113)+Krand(i,114)-1.5)*90,x=M.P0[0]+(M.P1[0]-M.P0[0])*q+M.nx*g,y=M.P0[1]+(M.P1[1]-M.P0[1])*q+M.ny*g;
  Ovcircle(c,x,y,.6+Math.pow(Krand(i,115),4)*2,Krgba(['#ffffff','#e8dcff','#d0f0ff','#ffe0f4'][i%4],.35+Krand(i,116)*.55));}}
function Svmilkyglow(c,G,M){for(let i=0;i<26;i++){const q=i/25,x=M.P0[0]+(M.P1[0]-M.P0[0])*q+M.nx*(Krand(i,117)-.5)*50,y=M.P0[1]+(M.P1[1]-M.P0[1])*q+M.ny*(Krand(i,117)-.5)*50;Svglow(c,x,y,150+Krand(i,118)*60,['#b8a0ff','#ffb0e0','#a0d8ff'][i%3],.16,90);}}
// Clips to the part of the screen up to the fraction p along a line from P0 at the angle ang (the Milky Way and the aurora appear this way).
function Svreveal(c,G,P0,ang,len,p){c.translate(G.w/2,0);c.scale(G.u,G.u);c.translate(P0[0],P0[1]);c.rotate(ang);c.beginPath();c.rect(-400,-1200,400+len*p,2400);c.rotate(-ang);c.translate(-P0[0],-P0[1]);c.scale(1/G.u,1/G.u);c.translate(-G.w/2,0);c.clip();}

export function drawConstel(c,w,h,o){escFrame();const d=escDecor(o),vk=escDecorKey(d),G=Svgeo(w,h),round=skRound(o.variant),steps=o.steps||5,count=Math.max(0,Math.min(o.count||0,steps)),t=o.t??1e3,running=t<1e3,hw=G.hw;
 const plan=count?skPlan(o.variant,count,steps,o.duration||SK_STEP_MIN):null,ages=escAges(count,steps,t,o.held,SK_STAGGER),final=!!plan?.final&&ages[6]>=0;
 const idle=o.reduced?0:o.idle||0,mo=o.reduced?0:1,s=round.v%2?1:-1,fs=-s,SE=SV_SEASONS[round.season],LD=Svland(round.land,round.season,G),fig=SV_FIG[round.figure];
 const key=`${Math.round(hw)}`,X=x=>x*s;
 // The final: the figure fills (F), comes alive, crosses the sky, breaks up into shooting stars, and the sky goes quiet again (R).
 const aF=final?ages[6]:-1,R=final?Ksmooth((aF-(plan.close+.6))/Math.max(.6,plan.D-plan.close-1.2)):0,F=final?Ksmooth((aF-plan.fillAt)/1.5)*(1-R):0,fade=1-R;
 // The events of the round, each with its own clock (seconds since it started).
 const E={};if(fade>.001)for(let k=0;k<6;k++){if(ages[k]<0)continue;const id=round.events[k],e=Svlife(`${o.preview?'p':'m'}|${round.v}|${k}`,ages[k]-.55,idle);if(e>=0)E[id]=e;}
 const moonA=E.lluna!==undefined?Ksmooth(E.lluna/.5)*fade:0;
 let lit=0;for(let k=0;k<6;k++)if(ages[k]>=0)lit+=Ksmooth(ages[k]/.8);const L=Kclamp((.075*lit+.08*moonA)*fade+.42*F);
 // The music box makes each star sparkle with its note.
 const pulse=new Array(7).fill(0);if(plan&&running)for(const p of plan.pulses){const d=t-p.time;if(d>0&&d<1)pulse[p.star]=Math.max(pulse[p.star],p.vel*Ksmooth(d/.09)*Math.exp(-d*4.5));}
 // Where the figure is, and how it moves at the final.
 const S=Math.min(220,hw*.28),FX=fs*hw*.18,FY=305-S*(fig.box[0]+fig.box[1])/2;let cx=FX,cy=FY,rot=0,bob=0,spin=0,live=0;const off=fig.stars.map(()=>[0,0]);
 let dis=-1;if(final){const ph=aF-plan.aliveAt,al=Ksmooth(ph/.8)*mo,p=KeaseInOut(Kclamp(ph/(plan.dissolveAt-plan.aliveAt)))*mo;live=al;dis=aF-plan.dissolveAt;
  cx=FX+(s*hw*.3-FX)*p;cy=FY-15*p-30*Math.sin(Math.PI*p);const q=Math.max(0,ph);
  if(round.figure===0){rot=al*.12*Math.sin(q*2.2);for(let k=4;k<7;k++)off[k][0]=al*.08*Math.sin(q*4.2-k*1.1);}
  else if(round.figure===1){rot=al*.07*Math.sin(q*2.4);bob=al*.04*Math.sin(q*2.4+1);}
  else if(round.figure===2){spin=al*q*4.5;bob=al*.015*Math.sin(q*9);}
  else if(round.figure===3){bob=al*.05*Math.sin(q*1.8);rot=al*.05*Math.sin(q*1.3);spin=q;}
  else{rot=al*.15*Math.sin(q*1.6);bob=al*.06*Math.sin(q*1.6+1.2);}}
 const fp=fig.stars.map((p,k)=>[p[0]+off[k][0],p[1]+off[k][1]+bob]),cr=Math.cos(rot),sr=Math.sin(rot),place=([x,y])=>[cx+(cr*x-sr*y)*S,cy+(sr*x+cr*y)*S],pts=fp.map(place);
 // At the dissolve each star flies away as a shooting star.
 const ctr=fig.stars.reduce((a,p)=>[a[0]+p[0]/7,a[1]+p[1]/7],[0,0]),fly=fig.stars.map(([x,y],k)=>{const dx=x-ctr[0],dy=y-ctr[1]+.7,n=Math.hypot(dx,dy)||1;return [dx/n,dy/n,330+Krand(k,121)*160];});
 const flown=k=>{if(dis<0)return pts[k];const [vx,vy,sp]=fly[k];return [pts[k][0]+vx*sp*dis,pts[k][1]+vy*sp*dis+90*dis*dis];};
 const thA=dis<0?1:1-Ksmooth(dis/.35),starA=dis<0?1:1-Ksmooth((dis-.5)/1.1);
 // The landscape changes at the first press of a new round: the new sky and landscape fade in over the old ones.
 const from=o.from!==undefined&&count===1?skRound(o.from):null,swap=from&&(from.land!==round.land||from.season!==round.season||from.v%2!==round.v%2)?Ksmooth(t/1.8):1;
 // The decor (escDecor) is the sky and the landscape. Atenuat, each sheet has its own veil (the moon still rises from behind the hills);
 // without the decor the stars, the figure and what happens in the night are drawn on the base colour.
 const skySheet=(season,alpha)=>{if(d.fade>0)escBlit(c,`sk-sky${season}-${key}${vk}`,w,h,escVeiled(d,(sc,sw,sh)=>{Svunits(sc,G,cc=>Svsky(cc,G,season));escGrain(sc,sw,sh,.14);}),alpha);};
 const landSheet=(rd,night,alpha)=>{if(d.fade<=0)return;const ld=Svland(rd.land,rd.season,G),sg=rd.v%2?1:-1,T=night?Svtone(SV_SEASONS[rd.season].night):Svsame;escBlit(c,`sk-land${rd.land}-${rd.season}-${sg}-${night?'n':'l'}-${key}${vk}`,w,h,escVeiled(d,sc=>Svunits(sc,G,cc=>{if(sg<0)cc.scale(-1,1);ld.draw(cc,T);})),alpha);};
 c.save();if(d.fade<=0){c.fillStyle=d.base;c.fillRect(0,0,w,h);}
 // The old round (sky and landscape) stays underneath while the new sky fades in over it.
 if(swap<1){skySheet(from.season,1);landSheet(from,true,1);}skySheet(round.season,swap);
 // ── The sky, behind the landscape ──
 const M=E.viaLactia!==undefined?Svmilky(G,s):null,mwA=M?Ksmooth(E.viaLactia/1.2)*fade:0,mwP=M?Ksmooth(E.viaLactia/2.6):0;
 if(M&&mwA>0){c.save();if(c.getTransform)Svreveal(c,G,M.P0,M.ang,M.len,mwP);escBlit(c,`sk-dust${s}-${key}`,w,h,sc=>Svunits(sc,G,cc=>Svmilkydust(cc,G,M)),mwA);c.restore();}
 c.globalCompositeOperation='lighter';Svunits(c,G,cc=>{for(let i=0;i<26;i++){const x=(Krand(i,131)*2-1)*hw*.98,y=20+Krand(i,132)*560,a=mo?Math.pow(.5+.5*Math.sin(idle*(.7+Krand(i,133)*.9)+i*2.3),3):.35;Svsparkle(cc,x,y,4+Krand(i,134)*5,'#fff6dc',a*.8*(1-.3*L)*d.fade);}});c.globalCompositeOperation='source-over';
 const moon=E.lluna!==undefined?(()=>{const e=E.lluna,r=KeaseOut(e/3.2),mx=X(LD.moon[0]),my=760-(760-LD.moon[1])*r;return {x:mx,y:my,a:moonA,r:64};})():null;
 const comet=E.cometa!==undefined?(()=>{const e=E.cometa,dir=[s*.82,-.57],H=[X(LD.comet[0]),LD.comet[1]],p=KeaseOut(e/2.8),st=[H[0]+dir[0]*760,H[1]+dir[1]*760];return {x:st[0]+(H[0]-st[0])*p,y:st[1]+(H[1]-st[1])*p,dir,a:Ksmooth(e/.4)*fade,len:330*(1+.05*Math.sin(idle*1.3))*(.6+.4*p)};})():null;
 const shoot=E.estelFugac!==undefined?(()=>{const e=E.estelFugac,A=[X(hw*.98),210],B=[X(hw*.4),410],q=Math.pow(Kclamp(e/1.2),1.4);return {e,A,B,x:A[0]+(B[0]-A[0])*q,y:A[1]+(B[1]-A[1])*q,on:e<1.25};})():null;
 const aur=E.aurora!==undefined?{a:Ksmooth(E.aurora/1.4)*fade,p:Ksmooth(E.aurora/2.6)}:null;
 escGlowLayer(c,w,h,gc=>{
  Svunits(gc,G,cc=>{Svglow(cc,0,720,hw*1.25,SE.sky[4],(.1+.28*L)*d.fade,260);
   // The aurora unfolds from one side: its curtains grow from nothing at the moving front.
   if(aur&&aur.a>0){cc.save();const grow=x=>Ksmooth((aur.p*2.4*hw-(s>0?hw-x:x+hw))/260);
    [['#2dff8f',300,210,.42],['#3dffd2',246,170,.3],['#ff5ac8',208,130,.26]].forEach(([col,yb,H,a],j)=>{const g=cc.createLinearGradient(0,yb+40,0,yb-H-40);g.addColorStop(0,Krgba(col,0));g.addColorStop(.18,Krgba(col,a*aur.a));g.addColorStop(.5,Krgba(col,a*.4*aur.a));g.addColorStop(1,Krgba(col,0));
     cc.beginPath();const yy=x=>yb+34*Math.sin(x*.006+idle*.25+j*1.3)+16*Math.sin(x*.017-idle*.4+j),top=x=>yy(x)-H*(.75+.25*Math.sin(x*.01+idle*.3+j));for(let x=-hw-20;x<=hw+20;x+=24)cc.lineTo(x,yy(x)+30*grow(x));for(let x=hw+20;x>=-hw-20;x-=24)cc.lineTo(x,yy(x)-(yy(x)-top(x))*grow(x));cc.closePath();cc.fillStyle=g;cc.fill();
     // Rays: thin vertical strokes along the curtain, brighter in some places, that drift slowly.
     cc.lineWidth=7;for(let x=-hw-10+j*7;x<=hw+10;x+=19){const r=(.5+.5*Math.sin(x*.05+idle*.6*(j%2?1:-1)+j*2))*grow(x);if(r<.35)continue;const y0=yy(x)+18;cc.beginPath();cc.moveTo(x,y0);cc.lineTo(x,y0-(y0-top(x))*.95*grow(x));cc.strokeStyle=Krgba(col,a*.38*r*aur.a);cc.stroke();}});cc.restore();}
   if(moon)Svglow(cc,moon.x,moon.y,230,'#fff0c0',.55*moon.a);
   if(comet&&comet.a>0){const {x,y,dir,len}=comet,nx=-dir[1],ny=dir[0];for(const [col,l,wd,a,tw] of [['#ffe9b0',len,44,.5,0],['#9fd8ff',len*1.3,16,.4,.12]]){const ex=x+(dir[0]+nx*tw)*l,ey=y+(dir[1]+ny*tw)*l,g=cc.createLinearGradient(x,y,ex,ey);g.addColorStop(0,Krgba(col,a*comet.a));g.addColorStop(1,Krgba(col,0));cc.beginPath();cc.moveTo(x+nx*6,y+ny*6);cc.lineTo(ex+nx*wd,ey+ny*wd);cc.lineTo(ex-nx*wd,ey-ny*wd);cc.lineTo(x-nx*6,y-ny*6);cc.closePath();cc.fillStyle=g;cc.fill();}
    Svglow(cc,x,y,70,'#fff6dc',.7*comet.a);}
   if(shoot){if(shoot.on)Svglow(cc,shoot.x,shoot.y,70,'#fff6dc',.7);for(let i=0;i<13;i++){const a=Ksmooth((shoot.e-1-i*.09)/.3)*fade;if(a>0)Svglow(cc,shoot.B[0]+(Krand(i,142)-.5)*190,shoot.B[1]+(Krand(i,143)-.5)*110,30,'#fff6dc',.35*a);}}});
  if(M&&mwA>0){gc.save();if(gc.getTransform)Svreveal(gc,G,M.P0,M.ang,M.len,mwP);escBlit(gc,`sk-mwglow${s}-${key}`,w,h,sc=>Svunits(sc,G,cc=>Svmilkyglow(cc,G,M)),mwA);gc.restore();}});
 Svunits(c,G,cc=>{
  if(moon&&moon.a>0){const {x,y,r}=moon;cc.save();cc.globalAlpha=moon.a;cc.beginPath();cc.arc(x,y,r,0,K_TAU);cc.clip();cc.fillStyle='#fff3c4';const ph=round.v%3;
   if(ph===0)cc.fillRect(x-r,y-r,2*r,2*r);else{cc.beginPath();cc.rect(x-r-2,y-r-2,2*r+4,2*r+4);cc.arc(x+s*r*(ph===1?.7:.42),y-r*.12,r*(ph===1?1:.95),0,K_TAU,true);cc.fill('evenodd');}
   for(const [dx,dy,rr] of [[-.3,-.2,.18],[.25,.2,.13],[-.05,.38,.1],[.3,-.35,.08]])Ovcircle(cc,x+dx*r,y+dy*r,rr*r,'rgba(255,214,140,.45)');cc.restore();
   if(d.white&&!d.full){cc.save();cc.globalAlpha=moon.a;cc.beginPath();cc.arc(x,y,r,0,K_TAU);cc.strokeStyle='#8a7f5c';cc.lineWidth=3;cc.stroke();cc.restore();}}
  cc.globalCompositeOperation='lighter';
  if(comet&&comet.a>0){const {x,y,dir}=comet,g=cc.createLinearGradient(x,y,x+dir[0]*200,y+dir[1]*200);g.addColorStop(0,Krgba('#ffffff',.8*comet.a));g.addColorStop(1,Krgba('#ffffff',0));Ovline(cc,[[x,y],[x+dir[0]*200,y+dir[1]*200]],g,2.5);Ovcircle(cc,x,y,6,Krgba('#ffffff',comet.a));}
  if(shoot){if(shoot.on){const {x,y,A}=shoot,dx=A[0]-x,dy=A[1]-y,n=Math.hypot(dx,dy)||1,l=Math.min(240,n),g=cc.createLinearGradient(x,y,x+dx/n*l,y+dy/n*l);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');Ovline(cc,[[x,y],[x+dx/n*l,y+dy/n*l]],g,3);Ovcircle(cc,x,y,4.5,'#ffffff');}
   for(let i=0;i<13;i++){const t0=1+i*.09,a=Ksmooth((shoot.e-t0)/.3)*fade*(mo?.55+.45*Math.sin(idle*(1.3+Krand(i,141))+i*2):.8),gx=shoot.B[0]+(Krand(i,142)-.5)*190,gy=shoot.B[1]+(Krand(i,143)-.5)*110;Svsparkle(cc,gx,gy,8+Krand(i,144)*9,['#fff6dc','#ffd8f0','#d8f0ff'][i%3],a);}}
  cc.globalCompositeOperation='source-over';});
 // ── The landscape: the night sheet, and the lit sheet over it as the stars light up ──
 landSheet(round,true,swap);if(L>0)landSheet(round,false,L*.8*swap);
 // ── What happens in the landscape ──
 const W=LD.windows,winA=E.finestres!==undefined?W.map(V=>Ksmooth((E.finestres-V.r*2.4)/.25)*fade):null;
 const lamp=E.far!==undefined&&LD.lamp?{x:X(LD.lamp.x),y:LD.lamp.y,on:Ksmooth(E.far/.6)*fade,th:1+(mo?idle:0)*1.25}:null;
 const tr=E.tren!==undefined&&LD.track?(()=>{const T0=LD.track,e=E.tren,tau=e%22,span=T0.x1-T0.x0+460,head=T0.x0-60+span*(tau/7);return {T0,e,tau,head,on:tau<7.6,speed:span/7};})():null;
 const boats=E.barques!==undefined&&LD.water?[0,1,2].map(i=>{const Wt=LD.water,e=E.barques-i*.5,tx=Wt.x0+(Wt.x1-Wt.x0)*[.16,.55,.86][i],ty=Wt.y0+(Wt.y1-Wt.y0)*[.3,.78,.48][i],sx=Kclamp(tx+(i%2?150:-150),Wt.x0-40,Wt.x1+40),p=KeaseOut(e/3);
  return e<0?null:{x:X(sx+(tx-sx)*p)+mo*8*Math.sin(idle*.3+i),y:ty+mo*3*Math.sin(idle*1.4+i*2),rot:mo*.05*Math.sin(idle*1.2+i),k:1.1+.6*(ty-Wt.y0)/(Wt.y1-Wt.y0),a:Ksmooth(e/.6)*fade,col:SV_VIVID[(i*3+round.v)%8]};}).filter(Boolean):[];
 const lanterns=E.fanalets!==undefined?Array.from({length:10},(_,i)=>{const sp=LD.spots[i%LD.spots.length],v=20+Krand(i,151)*14,e=E.fanalets-i*.32;if(e<0)return null;const span=sp[1]+40,rise=mo?(v*e)%span:Math.min(60+Krand(i,152)*300,v*e),y=sp[1]-rise;
  return {x:X(sp[0])+mo*26*Math.sin(e*.6+i)+(Krand(i,153)-.5)*60*Kclamp(rise/200),y,a:Ksmooth(rise/40)*Ksmooth((y-20)/120)*fade,col:['#ff9f1c','#ff4d6d','#ffd23f','#ff6fb5'][i%4]};}).filter(Boolean):[];
 const flies=E.cuques!==undefined?Array.from({length:28},(_,i)=>{const z=LD.grass[i%LD.grass.length],e=E.cuques-i*.06;if(e<0)return null;const bx=z[0]+Krand(i,161)*(z[1]-z[0]),by=z[3]-Krand(i,162)*(z[3]-z[2])*.35,up=(40+Krand(i,163)*130)*KeaseOut(e/2.5);
  return {x:X(bx)+mo*22*Math.sin(idle*.5+i*1.3),y:by-up+mo*12*Math.sin(idle*.8+i*2.1),a:Ksmooth(e/.5)*fade*(mo?.3+.7*Math.pow(.5+.5*Math.sin(idle*2.4+i*2.7),2):.8)};}).filter(Boolean):[];
 Svunits(c,G,cc=>{
  if(winA){cc.save();if(s<0)cc.scale(-1,1);W.forEach((V,i)=>{const a=winA[i];if(a<=.01)return;cc.globalAlpha=a;Ovrect(cc,V.x,V.y,V.w,V.h,'#ffd36b',2);Ovrect(cc,V.x+3,V.y+3,V.w-6,V.h-8,'#fff4c4',2);});cc.restore();cc.globalAlpha=1;}
  if(lamp&&lamp.on>0){cc.globalAlpha=lamp.on;Ovrect(cc,lamp.x-13,lamp.y-14,26,28,'#fff1b0',3);cc.globalAlpha=1;}
  if(LD.track&&tr){const T0=LD.track;T0.lamps.forEach(([x,y],i)=>{const a=Ksmooth((tr.e-(x-(T0.x0-60))/tr.speed)/.3)*fade;if(a>0)Ovcircle(cc,X(x),y,5.5,Krgba(i%2?'#7dffb0':'#ff6b6b',a));});
   if(tr.on){cc.save();if(T0.clip){cc.beginPath();cc.rect(Math.min(X(T0.x0),X(T0.x1)),0,Math.abs(X(T0.x1)-X(T0.x0)),1000);cc.clip();}if(s<0)cc.scale(-1,1);const y=T0.y-4,cars=['#2ec4f1','#ffd23f','#3bceac','#ff6fb5'];
    for(let j=0;j<4;j++){const x1=tr.head-96-j*78,x0=x1-70;Ovrect(cc,x0,y-34,70,30,cars[(j+round.v)%4],6);for(let k=0;k<3;k++)Ovrect(cc,x0+9+k*20,y-28,13,12,'#ffe08a',2);for(const wx of [x0+14,x1-14])Ovcircle(cc,wx,y-2,6,'#2b2552');}
    const hx=tr.head;Ovrect(cc,hx-86,y-40,30,36,'#b3122e',4);Ovrect(cc,hx-58,y-28,52,24,'#e0443e',8);Ovrect(cc,hx-38,y-44,10,18,'#2b2552',2);Ovrect(cc,hx-80,y-35,16,12,'#ffe08a',2);Ovcircle(cc,hx-4,y-18,5,'#fff1b0');for(const wx of [hx-74,hx-48,hx-20])Ovcircle(cc,wx,y-2,7,'#2b2552');
    for(let j=1;j<7;j++){const tj=tr.tau-j*.35;if(tj<0)continue;const px=T0.x0-60+tr.speed*tj-33,py=y-50-j*12;Ovcircle(cc,px-j*4,py,7+j*4,Krgba('#e9e4ff',.5*(1-j/7)));}cc.restore();}}
  for(const B of boats){cc.save();cc.globalAlpha=B.a;cc.translate(B.x,B.y);cc.rotate(B.rot);cc.scale(B.k,B.k);Ovpoly(cc,[[-36,-8],[36,-8],[26,6],[-26,6]],B.col);Ovline(cc,[[0,-8],[0,-56]],'#4a2e1c',2.5);Ovpoly(cc,[[2,-54],[26,-12],[2,-12]],'#fff6e6');Ovline(cc,[[-26,-8],[-26,-30]],'#4a2e1c',2);Ovrect(cc,-31,-40,10,12,'#ffe08a',2);cc.restore();}
  cc.globalAlpha=1;
  for(const Ln of lanterns){cc.globalAlpha=Ln.a;Ovpoly(cc,[[Ln.x-10,Ln.y-17],[Ln.x+10,Ln.y-17],[Ln.x+13,Ln.y+15],[Ln.x-13,Ln.y+15]],Ln.col);Ovrect(cc,Ln.x-7,Ln.y-9,14,19,'#fff1c4',5);Ovrect(cc,Ln.x-4,Ln.y+15,8,4,'#ffd23f',1);}cc.globalAlpha=1;
  cc.globalCompositeOperation='lighter';
  if(moon&&LD.water&&moon.a>0){const Wt=LD.water;if(moon.x>Math.min(X(Wt.x0),X(Wt.x1))&&moon.x<Math.max(X(Wt.x0),X(Wt.x1))){for(let i=0;i<9;i++){const y=Wt.y0+8+i*(Wt.y1-Wt.y0-10)/8,wd=46-i*3.4,dx=mo?Math.sin(idle*2+i*1.3)*6:0;Ovline(cc,[[moon.x-wd/2+dx,y],[moon.x+wd/2+dx,y]],Krgba('#fff0c0',.5*moon.a*Ksmooth((LD.moon[1]+200-moon.y)/150)),3);}}}
  for(const B of boats)for(let i=1;i<5;i++)Ovline(cc,[[B.x-26*B.k-5,B.y+6+i*7],[B.x-26*B.k+5,B.y+6+i*7]],Krgba('#ffe08a',.35*B.a*(1-i/5)),2);
  for(const f of flies)Ovcircle(cc,f.x,f.y,2.6,Krgba('#eaff8a',f.a));
  cc.globalCompositeOperation='source-over';});
 // ── Soft light in front: windows, lamps, lanterns, fireflies, the beam of the lighthouse, mist, and the halos of the stars ──
 escGlowLayer(c,w,h,gc=>Svunits(gc,G,cc=>{
  if(winA)W.forEach((V,i)=>{if(winA[i]>.01)Svglow(cc,X(V.x+V.w/2),V.y+V.h/2,34,'#ffc35a',.5*winA[i]);});
  if(lamp&&lamp.on>0){const cth=Math.cos(lamp.th),sth=Math.sin(lamp.th),len=1000*Math.abs(cth),dirx=Math.sign(cth)||1;if(len>20){const g=cc.createLinearGradient(lamp.x,lamp.y,lamp.x+dirx*len,lamp.y);g.addColorStop(0,Krgba('#fff1b0',.32*lamp.on));g.addColorStop(1,Krgba('#fff1b0',0));cc.beginPath();cc.moveTo(lamp.x,lamp.y-8);cc.lineTo(lamp.x+dirx*len,lamp.y-60);cc.lineTo(lamp.x+dirx*len,lamp.y+70);cc.lineTo(lamp.x,lamp.y+8);cc.closePath();cc.fillStyle=g;cc.fill();}
   Svglow(cc,lamp.x,lamp.y,60+150*Math.pow(Math.max(0,sth),6),'#fff1b0',(.6+.4*Math.pow(Math.max(0,sth),6))*lamp.on);}
  if(tr&&LD.track){const T0=LD.track;T0.lamps.forEach(([x,y],i)=>{const a=Ksmooth((tr.e-(x-(T0.x0-60))/tr.speed)/.3)*fade;Svglow(cc,X(x),y,30,i%2?'#7dffb0':'#ff6b6b',.6*a);});
   if(tr.on){cc.save();if(T0.clip){cc.beginPath();cc.rect(Math.min(X(T0.x0),X(T0.x1)),0,Math.abs(X(T0.x1)-X(T0.x0)),1000);cc.clip();}for(let j=0;j<4;j++)Svglow(cc,X(tr.head-96-j*78-35),T0.y-26,56,'#ffcf70',.4,26);Svglow(cc,X(tr.head+30),T0.y-18,90,'#fff1b0',.5,30);cc.restore();}}
  for(const B of boats)Svglow(cc,B.x-26*B.k*Math.cos(B.rot),B.y-34*B.k,40,'#ffcf70',.6*B.a);
  for(const Ln of lanterns)Svglow(cc,Ln.x,Ln.y,62,'#ffb347',.6*Ln.a);
  for(const f of flies)Svglow(cc,f.x,f.y,24,'#c6ff5a',.6*f.a);
  if(E.boira!==undefined){const e=E.boira,a=Ksmooth(e/2.5)*fade,sl=fs*(1-KeaseOut(e/3))*hw*.8;LD.valleys.forEach((y,j)=>{for(let i=0;i<8;i++){const span=2*hw+600,x=((-hw-300+i*span/8+(mo?idle*12*(j%2?1:-1):0)+sl)%span+span)%span-hw-300;Svglow(cc,x,y+Math.sin(i*1.7+j)*12,280+Krand(i+j*9,171)*90,'#e4ecff',.24*a,40+Krand(i+j*9,172)*18);}});}
  // The halos of the stars, and the hint of where the next star will be.
  for(let k=0;k<7;k++){if(ages[k]<0)continue;const [x,y]=flown(k),g=KeaseBack(Kclamp(ages[k]/.5));Svglow(cc,x,y,(78+40*pulse[k])*g,SV_STARC[k],(.38+.45*pulse[k]+(ages[k]<1?.5*(1-ages[k]):0))*starA*fade);}
  if(count&&count<steps&&!running){const m=escGroups(steps)[count]?.[0];if(m!==undefined&&m<6){const [x,y]=pts[m];Svglow(cc,x,y,46,'#fff6dc',.2+(mo?.1*Math.sin(idle*1.8):0));}}
  if(final){Svglow(cc,cx,cy,S*1.7,'#ffe6b0',.28*F*(dis<0?1:1-Ksmooth(dis/.5)));const cl=aF-plan.close,bloom=cl>0?Ksmooth(cl/.3)*Math.exp(-Math.max(0,cl-.3)*1.3):0;if(bloom>0)Svglow(cc,0,360,hw*1.15,'#ffe6b0',.3*bloom,520);}}));
 // ── The figure: its colours at the final, the threads and the stars ──
 const ink=d.white&&!d.full,SC=ink?SV_STARI:SV_STARC,TH=ink?'#7a5a1e':'#ffefc0',HOT=ink?'#3b2a12':'#ffffff';
 Svunits(c,G,cc=>{
  if(final&&F>0){const fA=F*(dis<0?1:1-Ksmooth(dis/.45)),sc=KeaseBack(Kclamp((aF-plan.fillAt)/1.4))*(dis<0?1:1+.2*Ksmooth(dis/.45));if(fA>.01){cc.save();cc.globalAlpha=fA;cc.translate(cx,cy);cc.rotate(rot);cc.scale(S*sc,S*sc);SV_FILL[round.figure](cc,fp,spin,live);cc.restore();}}
  cc.globalCompositeOperation=ink?'source-over':'lighter';
  if(thA*fade>.005){for(const [a,b] of fig.edges){const k=Math.max(a,b),j=Math.min(a,b);if(ages[k]<0)continue;const g=Ksmooth((ages[k]-.15)/.75);if(g<=0)continue;const A=pts[j],B=pts[k],P=[A[0]+(B[0]-A[0])*g,A[1]+(B[1]-A[1])*g],tw=thA*fade;
    Ovline(cc,[A,P],Krgba(TH,.16*tw),8);Ovline(cc,[A,P],Krgba(TH,.85*tw),2.4);if(g<1)Ovcircle(cc,P[0],P[1],4,Krgba(HOT,tw));}
   for(const [k,r] of fig.rings||[]){if(ages[k]<0)continue;const g=Ksmooth((ages[k]-.15)/.9);if(g<=0)continue;cc.beginPath();cc.arc(pts[k][0],pts[k][1],r*S,rot-Math.PI/2,rot-Math.PI/2+K_TAU*g);cc.strokeStyle=Krgba(TH,.8*thA*fade);cc.lineWidth=2.4;cc.stroke();}}
  for(let k=0;k<7;k++){if(ages[k]<0)continue;const a=ages[k],g=KeaseBack(Kclamp(a/.5)),[x,y]=flown(k),sz=g*(1+(mo?.07*Math.sin(idle*2.1+k*1.7):0))+.55*pulse[k],al=starA*fade;if(al<=.01)continue;
   if(a<1.1){cc.beginPath();cc.arc(x,y,14+110*KeaseOut(a/1.1),0,K_TAU);cc.strokeStyle=Krgba(SC[k],.6*(1-a/1.1)*al);cc.lineWidth=2.5;cc.stroke();}
   if(dis>0){const [vx,vy]=fly[k],l=Math.min(220,(fly[k][2]+180*dis)*dis*.8),gg=cc.createLinearGradient(x,y,x-vx*l,y-vy*l);gg.addColorStop(0,Krgba(SC[k],.9*al));gg.addColorStop(1,Krgba(SC[k],0));Ovline(cc,[[x,y],[x-vx*l,y-vy*l]],gg,3.5);}
   Svsparkle(cc,x,y,32*sz,SC[k],.9*al);cc.save();cc.translate(x,y);cc.rotate(Math.PI/4);Svsparkle(cc,0,0,15*sz,SC[k],.7*al);cc.restore();Ovcircle(cc,x,y,6.5*Math.max(.2,sz),Krgba(HOT,al));}
  if(dis>0&&dis<2){const n=24;for(let i=0;i<n;i++){const ang=i/n*K_TAU+Krand(i,181),sp=160+Krand(i,182)*260,x=cx+Math.cos(ang)*sp*dis,y=cy+Math.sin(ang)*sp*dis+60*dis*dis;Svsparkle(cc,x,y,7+Krand(i,183)*6,SV_VIVID[i%8],(1-Ksmooth(dis/1.6))*.9);}}
  cc.globalCompositeOperation='source-over';
  // Snow and leaves fall in front of everything.
  if(E.neu!==undefined){const e=E.neu,a=Ksmooth(e/.8)*fade;cc.fillStyle=ink?'#8fa6c8':'#ffffff';for(let i=0;i<110;i++){const dl=Krand(i,191)*2.5;if(e<dl)continue;const sp=30+Krand(i,192)*40,y=mo?-20+((sp*(e-dl))%1050):30+Krand(i,193)*940,x=(Krand(i,194)*2-1)*(hw+20)+(mo?14*Math.sin(idle*.7+i):0);
    cc.globalAlpha=a*(.6+.4*Krand(i,195));cc.beginPath();cc.arc(x,y,2+Krand(i,196)*3.2,0,K_TAU);cc.fill();}cc.globalAlpha=1;}
  if(E.fulles!==undefined){const e=E.fulles,span=2*hw+140;for(let i=0;i<22;i++){const tau=e-i*.09;if(tau<0)continue;const d=mo?70*tau+260*(1-Math.exp(-tau/1.1)):Krand(i,201)*span*Ksmooth(tau/.6),x=X(-hw-70+(d+Krand(i,202)*span*.4)%span),y=380+Krand(i,203)*520+(mo?30*Math.sin(tau*1.3+i):0);
    cc.save();cc.globalAlpha=Ksmooth(tau/.3)*fade;cc.translate(x,y);cc.rotate((mo?tau*2.2:1)*(Krand(i,204)>.5?1:-1)+i);const k=1.5+Krand(i,205)*.9;cc.scale(k,k);cc.beginPath();cc.moveTo(-11,0);cc.quadraticCurveTo(0,-7,11,0);cc.quadraticCurveTo(0,7,-11,0);cc.fillStyle=[...SE.tree,'#ffd23f'][i%4];cc.fill();Ovline(cc,[[-13,0],[8,0]],'rgba(90,40,20,.6)',1.2);cc.restore();}}
 });
 c.restore();return true;}

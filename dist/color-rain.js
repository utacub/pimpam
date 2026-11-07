import {kaleidoGrid,kaleidoPhase} from './kaleido-base.js';
import {composeKaleido} from './kaleido-music.js';

/* Pluja de colors · CE03 · Pim Pam 0.9
 * Twenty original constellations of tangible coloured objects.
 * Analytic choreography; no live random state, assets, fonts, requests or particles
 * retained between frames. Common CE21 music composer/synth retained with attribution.
 */
const PC_TAU=Math.PI*2,PC_MIN=8;
const PCclamp=x=>Math.max(0,Math.min(1,x));
const PCease=x=>{x=PCclamp(x);return x*x*(3-2*x)};
const PCout=x=>1-(1-PCclamp(x))**3;
const PCrand=(i,s=0)=>{const v=Math.sin(i*127.1+s*63.71+79)*43758.5453;return v-Math.floor(v)};
const PCmix=(a,b,f)=>{f=PCclamp(f);return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-f)+parseInt(b.slice(i,i+2),16)*f).toString(16).padStart(2,'0')).join('')};
const PCrgba=(col,a)=>{const n=parseInt(col.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${PCclamp(a)})`};
function PCpath(c,pts,close=true){c.beginPath();for(let i=0;i<pts.length;i++)i?c.lineTo(...pts[i]):c.moveTo(...pts[i]);if(close)c.closePath()}
function PCpoly(n,r=1,a=0){return Array.from({length:n},(_,i)=>[Math.cos(a+i*PC_TAU/n)*r,Math.sin(a+i*PC_TAU/n)*r])}
function PCgradient(c,col,x=-.55,y=-.7,x2=.65,y2=.8){const g=c.createLinearGradient(x,y,x2,y2);g.addColorStop(0,PCmix(col,'#ffffff',.48));g.addColorStop(.3,col);g.addColorStop(1,PCmix(col,'#12234b',.32));return g}
function PCcoat(c,col,edge=true){c.fillStyle=PCgradient(c,col);c.fill();if(edge){c.strokeStyle=PCrgba(PCmix(col,'#ffffff',.75),.42);c.lineWidth=.025;c.stroke()}}
function PCellipse(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,Math.max(.001,rx),Math.max(.001,ry),0,0,PC_TAU);c.fillStyle=col;c.fill()}
function PCline(c,pts,col,width=.025){PCpath(c,pts,false);c.strokeStyle=col;c.lineWidth=width;c.stroke()}
function PCglow(c,x,y,r,col,alpha){if(r<=0||alpha<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,PCrgba(col,alpha));g.addColorStop(.35,PCrgba(col,alpha*.6));g.addColorStop(1,PCrgba(col,0));PCellipse(c,x,y,r,r,g)}
function PCshine(c,x=-.26,y=-.4,rx=.22,ry=.09){PCellipse(c,x,y,rx,ry,'#ffffff76');PCellipse(c,x-rx*.65,y+ry*.1,rx*.25,ry*.6,'#ffffffa0')}
function PCstarPath(c,points=5){const a=[];for(let i=0;i<points*2;i++){const r=i%2?.47:1,th=-Math.PI/2+i*Math.PI/points;a.push([Math.cos(th)*r,Math.sin(th)*r])}c.beginPath();for(let i=0;i<a.length;i++){const prev=a[(i+a.length-1)%a.length],p=a[i],next=a[(i+1)%a.length],q=[p[0]*.84+prev[0]*.16,p[1]*.84+prev[1]*.16],r=[p[0]*.84+next[0]*.16,p[1]*.84+next[1]*.16];i?c.lineTo(...q):c.moveTo(...q);c.quadraticCurveTo(...p,...r)}c.closePath()}
// 01 · Rounded enamel stars: beveled body and an inset echo of the silhouette.
function PCstars(c,p,q){PCstarPath(c,5);PCcoat(c,p[0]);c.save();c.scale(.65,.65);PCstarPath(c,5);c.strokeStyle=PCrgba(p[1],.65);c.lineWidth=.06;c.stroke();c.restore();PCshine(c,-.18,-.35,.18,.065)}
// 02 · Twisted two-sided ribbon. Quads expose the reverse as the ribbon turns.
function PCribbons(c,p,q){const N=22;for(let i=0;i<N;i++){const u=i/N,v=Math.min(1,(i+1.04)/N),point=t=>{const a=t*6+q.clock*.65+q.phase,ww=.22*Math.cos(a),x=.29*Math.sin(t*5+q.phase),y=(t-.5)*1.9;return [x,y,ww]};const a=point(u),b=point(v),front=a[2]+b[2]>=0;PCpath(c,[[a[0]-a[2],a[1]],[b[0]-b[2],b[1]],[b[0]+b[2],b[1]],[a[0]+a[2],a[1]]]);c.fillStyle=PCgradient(c,front?p[0]:p[1]);c.fill();PCline(c,[[a[0]-a[2],a[1]],[b[0]-b[2],b[1]]],'#ffffff75',.016)}}
// 03 · Folded four-vane pinwheels, each vane has a lit face and a folded return.
function PCpinwheels(c,p,q){for(let k=0;k<4;k++){c.save();c.rotate(k*Math.PI/2);c.beginPath();c.moveTo(0,0);c.lineTo(.08,-.95);c.quadraticCurveTo(.75,-.82,.79,-.28);c.closePath();PCcoat(c,p[k%3]);PCpath(c,[[0,0],[.08,-.95],[.36,-.44]]);c.fillStyle=PCrgba(PCmix(p[k%3],'#132f52',.4),.8);c.fill();c.restore()}PCellipse(c,0,0,.13,.13,PCgradient(c,p[2]));PCshine(c,-.035,-.035,.045,.025)}
// 04 · Coloured glass drops with a meniscus and a suspended colour core.
function PCdrops(c,p,q){c.beginPath();c.moveTo(0,-1);c.bezierCurveTo(.23,-.62,.73,-.18,.62,.3);c.bezierCurveTo(.46,.98,-.46,.98,-.62,.3);c.bezierCurveTo(-.73,-.18,-.23,-.62,0,-1);c.closePath();PCcoat(c,p[0]);c.save();c.clip();PCellipse(c,.17,.25,.35,.39,PCgradient(c,p[1]));PCellipse(c,-.11,.46,.4,.15,PCrgba(p[2],.36));c.restore();c.beginPath();c.moveTo(-.09,-.58);c.bezierCurveTo(-.22,-.31,-.46,-.07,-.4,.18);c.strokeStyle='#ffffff9c';c.lineWidth=.075;c.stroke();PCellipse(c,.2,.55,.13,.035,'#ffffff67')}
// 05 · Thick torus bands with real empty centres, shaded segment by segment.
function PCrings(c,p,q){c.beginPath();c.arc(0,0,.93,0,PC_TAU);c.arc(0,0,.55,0,PC_TAU,true);c.fillStyle=p[0];c.fill('evenodd');const N=48;for(let i=0;i<N;i++){const a=i*PC_TAU/N,b=(i+1.05)*PC_TAU/N;PCpath(c,[[Math.cos(a)*.93,Math.sin(a)*.93],[Math.cos(b)*.93,Math.sin(b)*.93],[Math.cos(b)*.55,Math.sin(b)*.55],[Math.cos(a)*.55,Math.sin(a)*.55]]);const light=.25+.32*(.5+.5*Math.cos(a+2));c.fillStyle=PCmix(p[Math.floor(i/12)%3],'#ffffff',light);c.fill()}c.beginPath();c.arc(0,0,.82,-2.7,-1.05);c.strokeStyle='#ffffff9c';c.lineWidth=.035;c.stroke();c.beginPath();c.arc(0,0,.56,0,PC_TAU);c.strokeStyle=PCrgba(p[1],.5);c.lineWidth=.025;c.stroke()}
// 06 · Layered geometric rosettes. Individual lobes unfold in a short canon.
function PCrosettes(c,p,q){for(let ring=1;ring>=0;ring--)for(let j=0;j<7;j++){const f=.7+.3*PCout((q.age-j*.025)/.45);c.save();c.rotate(j*PC_TAU/7+ring*.38);c.scale(f*(ring?1:.64),f*(ring?1:.64));c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-.5,-.3,-.28,-.99,0,-1);c.bezierCurveTo(.28,-.99,.5,-.3,0,0);PCcoat(c,p[(ring+j)%3]);c.restore()}PCellipse(c,0,0,.17,.17,PCgradient(c,p[2]));PCshine(c,-.04,-.06,.055,.025)}
// 07 · Origami diamonds with a segmented paper tail and contrasting facets.
function PCkites(c,p,q){PCpath(c,[[0,-.94],[.7,-.12],[0,.58],[-.7,-.12]]);PCcoat(c,p[0]);for(const [pts,col] of [[[[0,-.94],[.7,-.12],[0,-.12]],p[1]],[[[0,-.12],[.7,-.12],[0,.58]],p[2]],[[[0,-.94],[0,-.12],[-.7,-.12]],PCmix(p[0],'#ffffff',.35)]]){PCpath(c,pts);c.fillStyle=col;c.fill()}PCline(c,[[0,-.94],[0,.58]],'#ffffff78',.022);c.beginPath();c.moveTo(0,.58);c.bezierCurveTo(.3,.8,-.3,1,.03,1.2);c.strokeStyle=PCrgba(p[1],.8);c.lineWidth=.022;c.stroke();for(let j=0;j<2;j++){const y=.76+j*.26;PCpath(c,[[-.13,y-.07],[.1,y+.07],[.1,y-.07],[-.13,y+.07]]);c.fillStyle=p[j+1];c.fill()}}
// 08 · Isometric cubes with a recessed inset on each of the three faces.
function PCcubes(c,p,q){const top=[[0,-.9],[.8,-.43],[0,.04],[-.8,-.43]],left=[[-.8,-.43],[0,.04],[0,.94],[-.8,.45]],right=[[0,.04],[.8,-.43],[.8,.45],[0,.94]];[left,right,top].forEach((poly,i)=>{PCpath(c,poly);PCcoat(c,p[i]);const cx=poly.reduce((s,v)=>s+v[0],0)/4,cy=poly.reduce((s,v)=>s+v[1],0)/4;PCpath(c,poly.map(v=>[cx+(v[0]-cx)*.56,cy+(v[1]-cy)*.56]));c.fillStyle=PCrgba(PCmix(p[i],'#ffffff',.5),.32);c.fill();c.strokeStyle='#ffffff55';c.lineWidth=.018;c.stroke()})}
// 09 · Comets with broad coloured tails and a rounded star head.
function PCcomets(c,p,q){for(let j=2;j>=0;j--){c.beginPath();c.moveTo(.2,0);c.bezierCurveTo(-.35,-.22-j*.08,-.85,-.12+j*.09,-1.25,.3+j*.17);c.bezierCurveTo(-.72,.02+j*.1,-.35,.14+j*.07,.2,.18);c.closePath();PCcoat(c,p[j],false)}c.save();c.translate(.27,.01);c.scale(.57,.57);PCstars(c,p,q);c.restore()}
// 10 · Unfurling spring ribbons with coloured edges and a small terminal bead.
function PCspirals(c,p,q){const pts=[],end=(.55+.45*PCout(q.age/.9))*Math.PI*4.7;for(let j=0;j<=88;j++){const u=j/88,a=u*end+q.phase,r=.1+.78*u;pts.push([Math.cos(a)*r,Math.sin(a)*r])}PCline(c,pts,PCmix(p[0],'#122247',.2),.14);PCline(c,pts,PCgradient(c,p[1]),.085);PCline(c,pts.map(v=>[v[0]-.015,v[1]-.015]),'#ffffff72',.018);const z=pts.at(-1);PCellipse(c,z[0],z[1],.075,.075,p[2])}
// 11 · Transparent globes containing a small mobile of solid confetti.
function PCglobes(c,p,q){const g=c.createRadialGradient(-.35,-.4,.05,0,0,1);g.addColorStop(0,PCrgba(p[0],.28));g.addColorStop(.63,PCrgba(p[1],.09));g.addColorStop(.9,PCrgba(p[2],.32));g.addColorStop(1,PCrgba(p[0],.75));PCellipse(c,0,0,.91,.91,g);for(let j=0;j<7;j++){const a=j*2.399+q.clock*.17,r=.12+.38*Math.sqrt(j/7);c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r);c.rotate(a);PCpath(c,PCpoly(j%2?3:4,.1+j%3*.015));PCcoat(c,p[j%3]);c.restore()}c.beginPath();c.arc(0,0,.84,-2.8,-1.25);c.strokeStyle='#ffffffb0';c.lineWidth=.04;c.stroke();PCshine(c,-.3,-.49,.17,.065)}
// 12 · Asymmetric leaves with curved veins and a fine contrasting edge.
function PCleaves(c,p,q){c.beginPath();c.moveTo(-.15,.95);c.bezierCurveTo(-1.1,.05,-.6,-.92,.72,-.95);c.bezierCurveTo(.9,.35,.32,.84,-.15,.95);c.closePath();PCcoat(c,p[0]);c.save();c.clip();for(let j=0;j<6;j++){const y=.65-j*.25,x=.08-y*.25;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-.12,y-.24,x-.52,y-.34);c.moveTo(x,y);c.quadraticCurveTo(x+.27,y-.05,x+.54,y-.36);c.strokeStyle=PCrgba(p[1],.72);c.lineWidth=.025;c.stroke()}c.restore();c.beginPath();c.moveTo(-.21,1.08);c.quadraticCurveTo(-.03,-.1,.55,-.76);c.strokeStyle=PCrgba(p[2],.85);c.lineWidth=.036;c.stroke()}
// 13 · Pearlescent buttons, concentric glaze and four recessed holes.
function PCbuttons(c,p,q){PCellipse(c,0,0,.9,.9,PCgradient(c,p[0]));c.beginPath();c.arc(0,0,.69,0,PC_TAU);c.strokeStyle=PCrgba(p[2],.8);c.lineWidth=.075;c.stroke();PCellipse(c,0,0,.57,.57,PCgradient(c,p[1]));for(let x of [-.2,.2])for(let y of [-.2,.2]){PCellipse(c,x,y,.095,.105,PCmix(p[1],'#102349',.62));PCellipse(c,x,y+.04,.067,.022,'#ffffff58')}PCshine(c,-.23,-.69,.22,.05)}
// 14 · Faceted crystal shards, deliberately crisp rather than spherical.
function PCcrystals(c,p,q){const vertices=[[0,-1],[-.68,-.3],[-.52,.6],[0,1],[.56,.52],[.7,-.31]],center=[.07,-.14];for(let j=0;j<6;j++){PCpath(c,[center,vertices[j],vertices[(j+1)%6]]);c.fillStyle=PCmix(p[j%3],j%2?'#163163':'#ffffff',j%2?.16:.33);c.fill();c.strokeStyle='#ffffff65';c.lineWidth=.018;c.stroke()}PCline(c,[vertices[0],center,vertices[3]],'#ffffffb0',.028);PCline(c,[vertices[1],center,vertices[5]],'#ffffff65',.023)}
// 15 · Silk feathers: tinted body and many tapered individual barbs.
function PCfeathers(c,p,q){c.beginPath();c.moveTo(0,.95);c.bezierCurveTo(-.75,.5,-.58,-.72,.17,-1);c.bezierCurveTo(.7,-.4,.66,.5,0,.95);c.closePath();PCcoat(c,p[0],false);for(let j=0;j<21;j++){const u=j/20,y=.82-u*1.65,x=.1*Math.sin(u*3),width=.48*Math.sin(Math.PI*u)**.65;for(let side of [-1,1]){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+side*width*.5,y-.04,x+side*width,y-.22);c.strokeStyle=PCrgba(j%3? p[1]:'#ffffff',j%3?.68:.55);c.lineWidth=.025*(1-u*.55);c.stroke()}}PCline(c,[[0,1.05],[.02,.4],[.11,-.2],[.17,-.92]],p[2],.026)}
// 16 · Rounded tiles with a graphic motif, alternating orientation and depth.
function PCtiles(c,p,q){c.beginPath();c.roundRect(-.75,-.75,1.5,1.5,.25);PCcoat(c,p[0]);c.save();c.clip();for(let j=0;j<3;j++){c.beginPath();c.arc(-.66,.66,.36+j*.4,-Math.PI/2,0);c.strokeStyle=p[(j+1)%3];c.lineWidth=.2;c.stroke()}PCellipse(c,.4,-.4,.14,.14,p[2]);c.restore();PCline(c,[[-.48,-.67],[.35,-.67]],'#ffffff70',.035)}
// 17 · Small ringed worlds. Back orbit, shaded sphere, then front orbit.
function PCworlds(c,p,q){c.save();c.rotate(-.35);c.beginPath();c.ellipse(0,0,1.18,.38,0,Math.PI,PC_TAU);c.strokeStyle=PCrgba(p[1],.65);c.lineWidth=.15;c.stroke();PCellipse(c,0,0,.68,.68,PCgradient(c,p[0]));c.save();c.beginPath();c.arc(0,0,.68,0,PC_TAU);c.clip();for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,-.3+j*.28,.8,.13,0,0,PC_TAU);c.strokeStyle=PCrgba(p[2],.55);c.lineWidth=.1;c.stroke()}c.restore();PCshine(c,-.2,-.35,.15,.055);c.beginPath();c.ellipse(0,0,1.18,.38,0,0,Math.PI);c.strokeStyle=PCgradient(c,p[1]);c.lineWidth=.15;c.stroke();c.beginPath();c.ellipse(0,0,1.18,.38,0,.1,2.7);c.strokeStyle='#ffffff80';c.lineWidth=.024;c.stroke();PCellipse(c,1.12,.12,.09,.09,p[2]);c.restore()}
// 18 · Three folded petals, each shows a different face of the same paper.
function PCpetals(c,p,q){for(let j=0;j<3;j++){c.save();c.rotate(j*PC_TAU/3);c.beginPath();c.moveTo(0,.08);c.bezierCurveTo(-.65,-.22,-.47,-.9,.05,-1);c.bezierCurveTo(.7,-.5,.5,-.12,0,.08);c.closePath();PCcoat(c,p[j]);c.beginPath();c.moveTo(0,.08);c.quadraticCurveTo(-.02,-.55,.05,-1);c.quadraticCurveTo(.18,-.6,0,.08);c.fillStyle=PCrgba('#ffffff',.25);c.fill();c.restore()}PCellipse(c,0,0,.1,.1,p[1])}
// 19 · Satin bows: two hollow loops and hanging ends with specular seams.
function PCbows(c,p,q){for(let side of [-1,1]){c.save();c.scale(side,1);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(.25,-.91,1.09,-.78,.92,-.03);c.bezierCurveTo(.83,.5,.36,.25,0,0);c.closePath();PCcoat(c,p[0]);c.beginPath();c.moveTo(.14,-.04);c.bezierCurveTo(.4,-.5,.77,-.6,.77,-.19);c.bezierCurveTo(.62,-.35,.4,-.21,.14,-.04);c.fillStyle=PCmix(p[1],'#25375c',.12);c.fill();PCpath(c,[[.02,.05],[.29,.08],[.52,.88],[.2,.69],[.02,.95]]);PCcoat(c,p[1]);c.restore()}c.beginPath();c.roundRect(-.16,-.18,.32,.4,.09);PCcoat(c,p[2]);PCshine(c,-.07,-.1,.04,.08)}
function PCfestival(c,p,q){const drawers=[PCstars,PCpinwheels,PCribbons,PCcrystals,PCrings,PCrosettes,PCtiles];drawers[q.i%drawers.length](c,p,q)}

const PC_PATTERNS=Object.freeze([
 ['Estels de gelatina',PCstars,'fall',['#ff626d','#ffc94a','#5bd9e9','#a88bff','#ff9fd3']],
 ['Confeti de seda',PCribbons,'flutter',['#fd448c','#ff9863','#ffe396','#62cbbf','#727df0']],
 ['Molinets de festa',PCpinwheels,'spin',['#ff8040','#f9cf4c','#51d9b0','#48a5ee','#b88cff']],
 ['Gotes de vitrall',PCdrops,'drops',['#277edc','#37cee5','#83f0d0','#ab8efa','#fa92c9']],
 ['Anells saltarins',PCrings,'bounce',['#f75670','#ffa53f','#d8eb64','#50ceca','#727fe0']],
 ['Rosasses de color',PCrosettes,'bloom',['#e84b98','#f79bc6','#ffc87b','#b5d876','#8988e5']],
 ['Estels de paper',PCkites,'gust',['#f75d62','#f3ba4e','#83d4d9','#6586df','#c594dd']],
 ['Daus de caramel',PCcubes,'stack',['#3ba4bc','#74d5ac','#e9df75','#f49879','#cf79bf']],
 ['Cometes de confeti',PCcomets,'comet',['#fc5a8d','#ffac59','#fff0a2','#75dccb','#8c84ed']],
 ['Espirals de regal',PCspirals,'unroll',['#9860d5','#ee78b7','#ffbf92','#a7e4cc','#589ed5']],
 ['Bombolles farcides',PCglobes,'float',['#48cbd7','#a1ecdf','#c49ce7','#ff9fc3','#ffd491']],
 ['Fulles de colors',PCleaves,'leaf',['#27bfa8','#8ce29d','#e4ee81','#ffa37a','#db76b1']],
 ['Botons de nacre',PCbuttons,'pop',['#716ce3','#af9dee','#f2b2da','#ffc68f','#67d4cb']],
 ['Cristalls de gel',PCcrystals,'crystal',['#42b4e7','#8ce3f3','#a2a7f3','#df9ada','#ffb7bc']],
 ['Plomes de seda',PCfeathers,'feather',['#2babbd','#6bdcc2','#cce79e','#fdb9a3','#d28fca']],
 ['Mosaics que ballen',PCtiles,'tiles',['#fc685f','#ffb14c','#f4df8a','#57c3b2','#568bd0']],
 ['Petits mons',PCworlds,'orbit',['#8b60dd','#d383e4','#ffa9c4','#ffd279','#64cdd5']],
 ['Pètals de festa',PCpetals,'swirl',['#f65c9c','#ff9fbd','#ffcfa4','#a9e1cb','#81b7e7']],
 ['Llaços de colors',PCbows,'bows',['#f76b86','#f9b772','#ece98e','#7dd6c5','#9d97e1']],
 ['Gran festa de formes',PCfestival,'celebrate',['#fd5681','#ffad41','#f5e58b','#32d1be','#5784ec','#b582ed']]
].map(([name,draw,motion,palette],i)=>Object.freeze({id:`pluja-${String(i+1).padStart(2,'0')}`,name,draw,motion,palette:Object.freeze(palette),steps:i%3===0?16:12,hits:Object.freeze(i%3===0?[0,2,4,6,8,10,12]:[0,2,4,6,8,10])})));
const PC_CAUSE=Object.freeze({id:'color-rain',code:'CE03',name:'Pluja de colors',desc:'Vint festes de formes escampades: peces amb volum, coreografies diferents i música pròpia. Una composició per pulsació.',kind:'burst',continuous:true,type:'ce',level:'01 · Descobrir',tag:'20 composicions noves · en seqüència',time:'Al teu ritme',seed:23,variants:20,minDuration:PC_MIN,ownPhases:true});
function pcMoments(index,D){const art=PC_PATTERNS[((index%20)+20)%20],grid=kaleidoGrid(Math.max(PC_MIN,D),art.steps);return {art,grid,times:art.hits.map(k=>grid.time(k*grid.m))}}
const PC_LAYOUT_CACHE=new Map();
function pcLayout(index,w,h,density=65,seed=0){
 const n=Math.round(11+PCclamp((density-25)/75)*17),key=[index,w,h,n,seed].join('/');if(PC_LAYOUT_CACHE.has(key))return PC_LAYOUT_CACHE.get(key);
 const S=Math.min(w,h),radius=Math.min(S*.075,Math.sqrt(w*h/n)*.27),items=[],salt=index*17+seed*71;
 // Best-candidate spacing makes an organic field without overlaps or an underlying visible grid.
 // Three larger pieces lead the composition; smaller pieces balance the spaces between them.
 for(let i=0;i<n;i++){
  const r=radius*(i<3?1.15+PCrand(i+47,salt)*.14:.66+PCrand(i+57,salt)*.39),margin=r*1.45+S*.025;
  let best=null,bestScore=-Infinity;
  for(let j=0;j<112;j++){
   const k=i*149+j,x=margin+PCrand(k+41,salt)*(w-2*margin),y=margin+PCrand(k+99,salt+3)*(h-2*margin);
   const clearance=items.length?Math.min(...items.map(o=>Math.hypot(x-o.x,y-o.y)-(r+o.r)*1.2)):-Math.hypot(x-w*(.35+.25*PCrand(index,2)),y-h*(.36+.2*PCrand(index,4)));
   if(clearance>bestScore){bestScore=clearance;best={x,y};}
  }
  items.push({i,...best,r,phase:PCrand(i+1,salt)*PC_TAU,rot:(PCrand(i+8,salt)-.5)*1.1});
 }
 if(PC_LAYOUT_CACHE.size>64)PC_LAYOUT_CACHE.clear();PC_LAYOUT_CACHE.set(key,items);return items;
}
function pcPose(item,motion,age,clock,reduced,S,progress){const {x,y,r,phase,i,rot}=item,enter=PCout(age/.65);let dx=0,dy=0,angle=rot,scale=.18+.82*enter,sx=1,sy=1;
 if(!reduced){const wave=Math.sin(clock*.72+phase),drift=Math.cos(clock*.48+phase);switch(motion){
 case 'fall':dy=-S*.09*(1-enter)+S*.012*wave;angle+=Math.sin(clock*.65+phase)*.25;break;
 case 'flutter':dx=S*.025*wave;dy=-S*.08*(1-enter)+S*.016*drift;angle+=Math.sin(clock*.8+phase)*.45;break;
 case 'spin':angle+=clock*.46*(i%2?-1:1);scale*=1+.025*wave;break;
 case 'drops':dy=-S*.12*(1-enter);sy=1+.18*(1-enter);sx=1-.12*(1-enter);break;
 case 'bounce':{const bounce=Math.exp(-Math.max(0,age)*1.45)*Math.sin(Math.max(0,age)*7);dy=-S*.09*(1-enter)-r*.55*Math.abs(bounce);sx=1+.08*bounce;sy=1-.08*bounce;break}
 case 'bloom':scale*=1+.025*wave;angle+=Math.sin(clock*.35+phase)*.12;break;
 case 'gust':dx=-S*.08*(1-enter)+S*.024*wave;dy=S*.018*drift;angle+=Math.sin(clock*.8+phase)*.25;break;
 case 'stack':dy=-S*.08*(1-enter);angle=rot*(1-enter)+.05*wave;break;
 case 'comet':dx=-S*.13*(1-enter)+S*.018*wave;dy=S*.06*(1-enter);angle=-.3+.15*drift;break;
 case 'unroll':angle+=clock*.2*(i%2?-1:1);break;
 case 'float':dy=S*.06*(1-enter)-S*.018*wave;dx=S*.014*drift;break;
 case 'leaf':dy=-S*.08*(1-enter)+S*.02*wave;angle+=Math.sin(clock*.75+phase)*.38;break;
 case 'pop':scale*=1+.08*Math.exp(-age*2)*Math.sin(age*7);angle+=.1*wave;break;
 case 'crystal':dy=-S*.04*(1-enter);angle+=.16*Math.sin(clock*.5+phase);break;
 case 'feather':dx=S*.028*wave;dy=-S*.045*(1-enter)+S*.018*drift;angle+=.32*wave;break;
 case 'tiles':angle=rot*(1-enter)+.18*Math.sin(clock*.8+phase);scale*=1+.03*wave;break;
 case 'orbit':dx=S*.017*Math.cos(clock*.6+phase);dy=S*.017*Math.sin(clock*.6+phase);angle+=.1*wave;break;
 case 'swirl':dx=S*.022*Math.cos(clock*.5+phase);dy=S*.022*Math.sin(clock*.5+phase);angle+=clock*.25*(i%2?-1:1);break;
 case 'bows':angle+=.19*wave;dy=-S*.05*(1-enter)+S*.014*drift;break;
 default:dx=S*.018*wave;dy=-S*.07*(1-enter)+S*.018*drift;angle+=Math.sin(clock*.7+phase)*.22;}
 }else scale=.78+.22*PCease(age/.5);
 // A quiet ending: drifting and turns slow with the integrated common clock.
 return {x:x+dx,y:y+dy,angle,scale,sx,sy};
}
function drawPlujaColors(c,w,h,{index=0,t,duration=8,density=65,reduced=false,base='black',background='none',opacity=25,seed=0,continuous=false,releaseTime=null}={}){
 if(t===null||t===undefined||t<0)return false;const D=Math.max(PC_MIN,duration),released=releaseTime!==null&&releaseTime!==undefined,displayT=released?releaseTime:t,cycle=continuous?Math.floor(displayT/D):0,local=continuous?displayT%D:displayT;
 if(!continuous&&local>=D)return false;
 const {art,grid,times}=pcMoments(index,D),ph=kaleidoPhase(local,D,reduced),fade=ph.alpha*(released?1-PCease((t-releaseTime)/.85):1);if(fade<=0)return false;
 const lit=base!=='white'||background==='full'||background==='dim'&&opacity>=60,palette=art.palette.map(col=>lit?col:PCmix(col,'#163f66',.12)),S=Math.min(w,h),items=pcLayout(index,w,h,density,seed),clock=reduced?0:ph.motion;
 c.save();c.globalAlpha*=fade;c.lineCap='round';c.lineJoin='round';
 for(const item of items){const birth=item.i===0?0:times[(item.i-1)%times.length],age=local-birth;if(age<0)continue;const pose=pcPose(item,art.motion,age,clock,reduced,S,ph.evolve),p=[0,1,2].map(k=>palette[(item.i+k)%palette.length]),growth=PCease(age/.18),radius=item.r;
  // A soft tinted penumbra separates each object from either base. No frame-wide flashes.
  PCglow(c,pose.x,pose.y,radius*1.85,p[0],(lit?.15:.045)*growth);
  c.save();c.globalAlpha*=Math.max(item.i===0&&local===0?.25:0,growth);c.translate(pose.x,pose.y);c.rotate(pose.angle);c.scale(radius*pose.scale*pose.sx,radius*pose.scale*pose.sy);
  art.draw(c,p,{i:item.i,age,clock,phase:item.phase,lit,reduced,cycle});c.restore();
  // Brief soft satellite dots mark the appearance group and then settle away.
  const dust=PCout(age/.18)*(1-PCease((age-.25)/1.1));if(dust>0)for(let j=0;j<3;j++){const a=item.phase+j*PC_TAU/3,rr=radius*(1.1+.35*PCout(age/.8));PCellipse(c,pose.x+Math.cos(a)*rr,pose.y+Math.sin(a)*rr,radius*.035,radius*.035,PCrgba(p[j],dust*.65))}
 }
 c.restore();return true;
}
function CplujaColors(c,w,h,g,s,p,clock){if(clock.running)drawPlujaColors(c,w,h,{index:g.variant||0,t:clock.t,duration:g.audioDuration||Math.max(8,s.duration),density:s.density,reduced:s.reduced,base:s.base,background:s.background,opacity:s.opacity,seed:Math.floor((g.completed||0)/20),continuous:['hold','toggle'].includes(g.control),releaseTime:g.releaseTime})}
const PCM=(key,mode,prog,lead,line,arp,shape,extra={})=>({key,mode,prog,pad:{inst:'pad',center:key+12,vel:.36},bass:{inst:'bass',rhythm:[0,2],notes:[0,4],vel:.36},arp:{inst:arp,shape,per:1,penta:true,center:key+24,vel:.22},lead:{inst:lead,line,oct:1,harm:true,len:2.5,vel:.58,strum:.035},onset:{inst:lead,center:key+24,vel:.6,size:3},final:{inst:'chime',center:key+24,vel:.4},perc:{shaker:.12},...extra});
const PC_MUSIC=Object.freeze([
 PCM(55,'ionian',[0,3,4,0],'celesta',[0,2,4,7,4,2,0],'harp','up',{shimmer:true}),
 PCM(53,'mixolydian',[0,6,3,0],'marimba',[4,2,5,7,4,0],'pluck','wave',{counter:{inst:'flute',notes:[[4,6],[2,6]],vel:.25}}),
 PCM(58,'lydian',[0,1,4,0],'kalimba',[0,4,6,9,7,4],'harp','updown',{phrases:[{at:3,line:[4,6,7],inst:'celesta',every:.5,len:2,vel:.28}]}),
 PCM(50,'dorian',[0,3,6,0],'glass',[7,4,2,0,2,4,7],'harp','down',{pad:{inst:'choir',vowel:'u',center:62,vel:.32},breath:true}),
 PCM(60,'ionian',[0,5,3,4],'marimba',[0,4,2,5,7,0],'kalimba','broken',{perc:{shaker:.15,thump:true},counter:{inst:'flute',notes:[[4,4],[5,4],[7,4]],vel:.23}}),
 PCM(52,'lydian',[0,4,1,0],'bell',[0,4,6,7,9,7],'harp','wave',{pad:{inst:'choir',vowel:'a',center:64,vel:.31},shimmer:true}),
 PCM(57,'mixolydian',[0,3,6,0],'pluck',[4,7,6,4,2,0,4],'celesta','up',{counter:{inst:'flute',notes:[[4,8],[7,8]],vel:.27,glide:true}}),
 PCM(48,'ionian',[0,3,5,4],'kalimba',[0,2,4,7,9,0],'marimba','broken',{perc:{shaker:.16,tick:'x...'},phrases:[{at:4,line:[7,4,2],inst:'harp',every:.5,len:2,vel:.28}]}),
 PCM(54,'lydian',[0,1,4,0],'glass',[0,4,6,9,7,4],'harp','up',{counter:{inst:'flute',notes:[[4,6],[7,6]],vel:.24},swell:true}),
 PCM(56,'dorian',[0,3,6,0],'celesta',[0,2,4,6,7,9,7],'pluck','updown',{phrases:[{at:2,line:[0,2,4,7],inst:'harp',every:.5,len:2,vel:.26}]}),
 PCM(51,'lydian',[0,4,1,0],'chime',[7,6,4,2,4,7],'harp','wave',{pad:{inst:'choir',vowel:'u',center:63,vel:.29},shimmer:true}),
 PCM(55,'dorian',[0,3,6,0],'marimba',[4,2,0,2,4,7],'pluck','down',{counter:{inst:'flute',notes:[[7,4],[6,4],[4,4]],vel:.27,glide:true}}),
 PCM(59,'ionian',[0,5,3,4],'kalimba',[0,4,7,9,7,4,0],'celesta','broken',{pad:{inst:'choir',vowel:'e',center:66,vel:.31},perc:{shaker:.13,tick:'x..'}}),
 PCM(53,'lydian',[0,1,4,0],'glass',[0,2,4,6,9,7],'harp','updown',{shimmer:true,phrases:[{at:3,line:[6,7,9],inst:'bell',every:.5,len:2,vel:.25}]}),
 PCM(50,'mixolydian',[0,6,3,0],'harp',[7,4,2,0,4,7],'pluck','wave',{pad:{inst:'choir',vowel:'o',center:62,vel:.3},counter:{inst:'flute',notes:[[4,6],[2,6]],vel:.28}}),
 PCM(57,'ionian',[0,3,5,4],'marimba',[0,2,4,5,7,9,7],'kalimba','broken',{perc:{shaker:.17,thump:true},counter:{inst:'flute',notes:[[4,8],[7,8]],vel:.24}}),
 PCM(49,'dorian',[0,3,6,0],'bell',[0,4,6,7,4,2],'harp','wave',{pad:{inst:'choir',vowel:'u',center:61,vel:.32},shimmer:true}),
 PCM(52,'ionian',[0,5,3,4],'celesta',[0,4,7,9,7,4],'pluck','up',{counter:{inst:'flute',notes:[[4,4],[7,4],[9,4]],vel:.26}}),
 PCM(54,'mixolydian',[0,3,6,0],'kalimba',[4,2,0,4,7,6,4],'harp','updown',{pad:{inst:'choir',vowel:'a',center:66,vel:.3},perc:{shaker:.13,tick:'x...'}}),
 PCM(60,'ionian',[0,5,3,4],'bell',[0,2,4,7,9,7],'marimba','up',{phrases:[{at:2,line:[0,2,4,7],inst:'harp',every:.5,len:2,vel:.3}],counter:{inst:'flute',notes:[[4,6],[7,6]],vel:.27},shimmer:true,final:{inst:'bell',center:79,vel:.48,size:4}})
]);
function pcScore(index,duration,round=0){const {art,grid,times}=pcMoments(index,duration);return composeKaleido(PC_MUSIC[((index%20)+20)%20],{D:grid.L.D,L:grid.L,n:grid.n,m:grid.m,step:grid.step,time:grid.time,hits:times.map((time,i)=>({time,step:art.hits[i]*grid.m})),seed:Math.floor(Math.max(0,round)/20)})}

export {CplujaColors,PC_CAUSE,PC_MIN,PC_PATTERNS,pcScore};

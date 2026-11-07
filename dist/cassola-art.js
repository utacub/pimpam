// La cassola d'en Glups (EN23), 0.27: the board and the results. The decor is a portico over the sea: a wall of warm stone at the top,
// with one small temple-shaped niche (a naiskos) for each option, and under its beam the view of the terrace, the parapet, the sea, the
// islands and the sky between two Doric columns. Glups and his bronze cauldron stand on the terrace. The niches hold the magic
// ingredients (a feather, three heads of garlic, a loaf) and then the honey biscuits in the shape of an animal. The time of day changes
// from round to round. Nothing flashes: every change of light takes at least half a second, the steam never covers the whole screen,
// and the patterns of the decor are soft (dark on dark, light on light).
import {GP_MAGICS,GP_ANIMALS,GP_LADLE,GP_STEP,GP_SHOW,GP_T,gpDay,gpRecipe,gpCreature} from './cassola.js';
import {TL_DIM,TL_STRIP,tlVeil,tlRing} from './tauler.js';
import {escDecor,escDecorKey,escSheet,escVeiled} from './escenari.js';
import {GR_PI,GR_TAU,GR_INK,GR_BRONZE,grClamp,grSmooth,grOut,grIn,grBack,grLerp,grSpan,grBump,grMix,grShade,grRgba,grRand,grPath,grEll,grLW,grPart,grLine,grTube,grVGrad,grRGrad,grGlow,grShadow,grCurls,grLeaf,grAt,grGlups,grCauldron,grSteam,grLadle,grPoly,GR_ARMS_REST,GR_POT,grHead,grWing} from './grec-art.js';
import {myScene} from './cassola-mites.js';
const CS_STONE='#efe2c8',CS_MARBLE='#f7f0e2',CS_TERRA='#c9623a',CS_BLUE='#2f6aa6';
// ── Where things are ───────────────────────────────────────────────────────────────────────────────────────────────────────
// zb: the bottom of the niches; wall: the bottom of the wall (the ledge); beam: the bottom of the beam of the portico; horizon,
// parapet, back (the back of the terrace) and floor (where the feet are). G: the height of Glups; s: screen units per unit of Glups;
// gx: his feet; px, py: the centre of the rim of the cauldron; ps: its scale.
export function csGeo(w,h,zones,strip=TL_STRIP){const H=Math.max(1,h-strip),zb=zones&&zones.length?Math.max(...zones.map(z=>z.y+z.h)):H*.46,portrait=w<H*.9;
 const wall=zb+Math.max(8,H*.022),beam=wall+Math.max(12,H*.034),floor=H-Math.max(6,H*.024),span=floor-beam,back=floor-span*.3,parapet=back-span*.13,horizon=beam+(parapet-beam)*.52;
 const G=Math.max(40,Math.min(floor-wall-Math.max(6,H*.012),portrait?w*.62:w*.32)),s=G/1010,gx=portrait?w*.64:w*.5+G*.36,ps=s*1.05,px=gx-G*.84,py=floor-GR_POT.feet*ps;
 const colW=Math.max(16,Math.min(G*.17,w*.06)),cols=portrait?[colW*.55,w-colW*.55]:[Math.max(colW*.8,w*.045),w-Math.max(colW*.8,w*.045)];
 return {w,h,H,zb,wall,beam,floor,back,parapet,horizon,G,s,gx,ps,px,py,colW,cols,portrait};}
// ── The view: sky, sea, islands ────────────────────────────────────────────────────────────────────────────────────────────
function csCloud(c,x,y,r,col,alpha=1){c.save();c.globalAlpha*=alpha;const blobs=[[0,0,1],[-.9,.25,.7],[.95,.22,.75],[-.4,-.35,.72],[.45,-.3,.66]];
 c.beginPath();for(const [dx,dy,k] of blobs){c.moveTo(x+dx*r+k*r,y+dy*r);c.arc(x+dx*r,y+dy*r,k*r,0,GR_TAU);}c.strokeStyle=grRgba(GR_INK,.35);c.lineWidth=grLW(c,Math.max(1.5,r*.06));c.stroke();c.fillStyle=col;c.fill();
 c.beginPath();for(const [dx,dy,k] of blobs){c.moveTo(x+dx*r+k*r,y+dy*r+r*.2);c.arc(x+dx*r,y+dy*r+r*.2,k*r*.8,0,GR_PI);}c.fillStyle=grRgba('#c8d4e6',.35);c.fill();c.restore();}
function csView(c,geo,D){const {w,beam,horizon,parapet,G}=geo,night=D.id==='night';
 c.fillStyle=grVGrad(c,beam,horizon,D.sky);c.fillRect(0,beam,w,horizon-beam+1);
 // the sun (or the moon) and its light
 const sx=w*.24,sy=beam+(horizon-beam)*.32,sr=Math.max(10,G*.06);grGlow(c,sx,sy,sr*5,D.sun,night?.25:.45);c.fillStyle=D.sun;c.beginPath();c.arc(sx,sy,sr,0,GR_TAU);c.fill();
 if(night){c.fillStyle=D.sky[0];c.beginPath();c.arc(sx+sr*.45,sy-sr*.2,sr*.85,0,GR_TAU);c.fill();for(let i=0;i<26;i++){const x=grRand(i,4)*w,y=beam+grRand(i,7)*(horizon-beam)*.8,r=.8+grRand(i,9)*1.6;c.fillStyle=grRgba('#fff8e0',.5+.4*grRand(i,2));c.beginPath();c.arc(x,y,r,0,GR_TAU);c.fill();}}
 else for(let i=0;i<4;i++)csCloud(c,w*(.12+.26*i)+G*.1*grRand(i,3),beam+(horizon-beam)*(.25+.35*grRand(i,5)),G*(.05+.03*grRand(i,8)),D.id==='evening'?'#ffe7cf':'#ffffff',.92);
 // islands and a small white temple on a headland
 const isl=(x0,x1,hh,col)=>{c.beginPath();c.moveTo(x0,horizon+1);c.bezierCurveTo(x0+(x1-x0)*.25,horizon-hh,x0+(x1-x0)*.6,horizon-hh*1.1,x1,horizon+1);c.closePath();c.fillStyle=col;c.fill();c.strokeStyle=grRgba(GR_INK,.25);c.lineWidth=grLW(c,1.4);c.stroke();};
 isl(w*.52,w*.9,G*.09,D.isles);isl(w*.04,w*.3,G*.05,grMix(D.isles,D.sky[2],.35));isl(w*.78,w*1.05,G*.13,grShade(D.isles,-.08));
 const tx=w*.84,ty=horizon-G*.115,tw=G*.07;c.fillStyle=night?'#c8cbe0':'#fbf6ea';c.fillRect(tx-tw/2,ty,tw,G*.03);c.beginPath();c.moveTo(tx-tw*.6,ty);c.lineTo(tx,ty-G*.022);c.lineTo(tx+tw*.6,ty);c.fill();
 for(let i=0;i<4;i++){c.fillStyle=grRgba('#8a8fb0',.5);c.fillRect(tx-tw*.4+i*tw*.26,ty+G*.004,Math.max(1,tw*.06),G*.024);}
 // the sea, with a few soft glints
 c.fillStyle=grVGrad(c,horizon,parapet,[D.sea[1],D.sea[0]]);c.fillRect(0,horizon,w,parapet-horizon+1);
 for(let i=0;i<22;i++){const y=horizon+(parapet-horizon)*grRand(i,11),x=grRand(i,13)*w,L=G*(.02+.05*grRand(i,17))*(1+(y-horizon)/(parapet-horizon));c.strokeStyle=grRgba(night?'#c8d8ff':'#ffffff',.18+.25*grRand(i,19));c.lineWidth=Math.max(1,G*.006);c.beginPath();c.moveTo(x,y);c.lineTo(x+L,y);c.stroke();}
 if(night){c.fillStyle=grRgba('#fff2c4',.18);c.beginPath();c.ellipse(sx,(horizon+parapet)/2,G*.08,(parapet-horizon)/2,0,0,GR_TAU);c.fill();}
 // a little boat with a white sail
 const bx=w*.66,by=horizon+(parapet-horizon)*.3,bs=G*.05;c.fillStyle='#7a4a2a';c.beginPath();c.moveTo(bx-bs,by);c.lineTo(bx+bs,by);c.lineTo(bx+bs*.7,by+bs*.32);c.lineTo(bx-bs*.7,by+bs*.32);c.closePath();c.fill();c.fillStyle='#fffaf0';c.beginPath();c.moveTo(bx-bs*.1,by-bs*1.3);c.lineTo(bx+bs*.7,by-bs*.15);c.lineTo(bx-bs*.1,by-bs*.15);c.closePath();c.fill();}
// The parapet, the terrace and its plants.
function csTerrace(c,geo,D){const {w,H,parapet,back,floor,G}=geo,night=D.id==='night',lit=night?.78:1;
 c.fillStyle=grVGrad(c,parapet,back,[grShade('#f4ecdc',night?-.35:0),grShade('#e4d6bb',night?-.35:0)]);c.fillRect(0,parapet,w,back-parapet);
 c.fillStyle=grShade(CS_TERRA,night?-.35:0);c.fillRect(0,parapet-Math.max(3,G*.016),w,Math.max(3,G*.02));c.fillStyle=grRgba(GR_INK,.5);c.fillRect(0,back-1,w,Math.max(1.5,G*.006));
 c.fillStyle=grVGrad(c,back,H,[grShade('#d9a878',night?-.4:-.02),grShade('#c48a5c',night?-.4:0)]);c.fillRect(0,back,w,H-back);
 // the slabs: lines that meet far away, soft
 c.strokeStyle=grRgba('#7a4a2a',.22*lit);c.lineWidth=Math.max(1,G*.004);for(let i=-8;i<=8;i++){c.beginPath();c.moveTo(w/2+i*w*.06,back);c.lineTo(w/2+i*w*.16,H);c.stroke();}
 for(const k of [.3,.62])c.beginPath(),c.moveTo(0,back+(H-back)*k),c.lineTo(w,back+(H-back)*k),c.stroke();
 // pots of basil on the parapet
 for(const x of [w*.16,w*.88]){const r=G*.05;grPart(c,`M${x-r*.75} ${parapet-r*.1}L${x+r*.75} ${parapet-r*.1}L${x+r} ${parapet-r*1.5}L${x-r} ${parapet-r*1.5}Z`,grShade(CS_TERRA,night?-.3:0),{lw:Math.max(1.4,G*.006)});
  for(let i=0;i<7;i++){const a=-GR_PI/2+(i-3)*.32;grPart(c,grLeaf(x+Math.cos(a)*r*.3,parapet-r*1.6,a,r*1.1,r*.32),grShade('#5f9a3a',night?-.3:(i%2)*.15),{lw:Math.max(1.2,G*.005)});}}}
// A Doric column from y0 (under the beam) to y1 (the floor), centred on x: the shaft swells a little, with soft flutes.
function csColumn(c,x,y0,y1,W,night){const cap=W*.32,lw=Math.max(1.4,W*.035),col=night?'#bdb6c8':CS_MARBLE;
 const shaft=`M${x-W*.42} ${y0+cap}C${x-W*.47} ${(y0+y1)/2} ${x-W*.5} ${y1-W*.3} ${x-W*.5} ${y1-W*.12}L${x+W*.5} ${y1-W*.12}C${x+W*.5} ${y1-W*.3} ${x+W*.47} ${(y0+y1)/2} ${x+W*.42} ${y0+cap}Z`;
 grPart(c,shaft,col,{tones:[[`M${x+W*.08} ${y0}L${x+W*.6} ${y0}L${x+W*.6} ${y1}L${x+W*.12} ${y1}Z`,grRgba('#8c7a64',.32)],[`M${x-W*.36} ${y0}L${x-W*.22} ${y0}L${x-W*.24} ${y1}L${x-W*.38} ${y1}Z`,grRgba('#ffffff',.45)]],lw});
 c.save();c.beginPath();grPath(c,shaft);c.clip();for(let i=-2;i<=2;i++){c.strokeStyle=grRgba('#8c7a64',.16);c.lineWidth=Math.max(1,W*.03);c.beginPath();c.moveTo(x+i*W*.17,y0+cap);c.lineTo(x+i*W*.19,y1);c.stroke();}c.restore();
 grPart(c,`M${x-W*.58} ${y0+cap}C${x-W*.56} ${y0+cap*.45} ${x-W*.7} ${y0+cap*.4} ${x-W*.72} ${y0+cap*.36}L${x+W*.72} ${y0+cap*.36}C${x+W*.7} ${y0+cap*.4} ${x+W*.56} ${y0+cap*.45} ${x+W*.58} ${y0+cap}Z`,col,{lw});
 grPart(c,`M${x-W*.76} ${y0}L${x+W*.76} ${y0}L${x+W*.76} ${y0+cap*.36}L${x-W*.76} ${y0+cap*.36}Z`,col,{tones:[[`M${x-W} ${y0+cap*.22}L${x+W} ${y0+cap*.22}L${x+W} ${y0+cap}L${x-W} ${y0+cap}Z`,grRgba('#8c7a64',.25)]],lw});
 grPart(c,`M${x-W*.64} ${y1-W*.14}L${x+W*.64} ${y1-W*.14}L${x+W*.68} ${y1}L${x-W*.68} ${y1}Z`,col,{lw});}
// The wall of the niches (from the top to the ledge) and the beam of the portico under it.
function csWall(c,geo,D){const {w,wall,beam,G}=geo,night=D.id==='night',stone=night?grShade(CS_STONE,-.32):CS_STONE;
 c.fillStyle=grVGrad(c,0,wall,[grShade(stone,.1),stone,grShade(stone,-.05)]);c.fillRect(0,0,w,wall);
 // a few soft patches of plaster and the shadow of a vine at the top corners
 for(let i=0;i<14;i++){const x=grRand(i,21)*w,y=grRand(i,23)*wall,r=G*(.04+.08*grRand(i,25));c.fillStyle=grRgba(grRand(i,27)<.5?'#ffffff':'#b89f78',.06);c.beginPath();c.ellipse(x,y,r*1.6,r,0,0,GR_TAU);c.fill();}
 for(const [x0,dir] of [[0,1],[w,-1]])for(let i=0;i<9;i++){const x=x0+dir*G*(.05+.5*grRand(i,31)),y=G*(.04+.36*grRand(i,33));c.fillStyle=grRgba('#5a4a3a',.07);c.beginPath();grPath(c,grLeaf(x,y,GR_PI*(.3+grRand(i,35)),G*.13,G*.05));c.fill();}
 // the ledge
 const lh=Math.max(4,(beam-wall)*.45);c.fillStyle=grShade(stone,.12);c.fillRect(0,wall-lh*.5,w,lh);c.fillStyle=grRgba(GR_INK,.55);c.fillRect(0,wall+lh*.5,w,Math.max(1,lh*.18));
 // the beam: in the shade of the portico, with a soft band of waves (dark on dark)
 c.fillStyle=grVGrad(c,wall,beam,[grShade(stone,-.28),grShade(stone,-.45)]);c.fillRect(0,wall+lh*.5,w,beam-wall-lh*.5);
 const bh=beam-wall-lh*.5;for(let x=bh*.6;x<w;x+=bh*1.4){c.strokeStyle=grRgba('#ffffff',.08);c.lineWidth=Math.max(1,bh*.08);c.beginPath();c.arc(x,wall+lh*.5+bh*.55,bh*.24,GR_PI*.9,GR_PI*2.3);c.stroke();}
 c.fillStyle=grRgba(GR_INK,.6);c.fillRect(0,beam-1,w,Math.max(1.5,G*.006));}
// ── The niches ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A naiskos: a small marble temple front with a terracotta pediment, two columns and a blue recess where the ingredient sits on a plate.
export function csNaiskos(z){const ph=Math.min(z.w*.22,z.h*.2);return {ph,ent:z.y+ph,ent2:z.y+ph+Math.max(4,z.h*.06),base:z.y+z.h-Math.max(5,z.h*.07),cw:Math.max(5,z.w*.085)};}
function csNiche(c,z,o={}){const N=csNaiskos(z),lw=Math.max(1.4,Math.min(z.w,z.h)*.012),x0=z.x,x1=z.x+z.w,night=!!o.night,marble=night?grShade(CS_MARBLE,-.25):CS_MARBLE;
 // the recess
 const rx0=x0+N.cw*1.1,rx1=x1-N.cw*1.1;c.fillStyle=grVGrad(c,N.ent2,N.base,[grShade(CS_BLUE,-.25),CS_BLUE,grShade(CS_BLUE,.12)]);c.fillRect(rx0,N.ent2,rx1-rx0,N.base-N.ent2);
 grGlow(c,(x0+x1)/2,N.base,z.w*.45,'#bfe2ff',.35);c.fillStyle=grRgba('#0c1a3a',.3);c.fillRect(rx0,N.ent2,rx1-rx0,Math.max(3,z.h*.04));
 // columns, entablature, pediment and base
 for(const cx of [x0+N.cw*.6,x1-N.cw*.6])grPart(c,`M${cx-N.cw*.5} ${N.ent2}L${cx+N.cw*.5} ${N.ent2}L${cx+N.cw*.55} ${N.base}L${cx-N.cw*.55} ${N.base}Z`,marble,{tones:[[`M${cx+N.cw*.1} ${N.ent2}L${cx+N.cw} ${N.ent2}L${cx+N.cw} ${N.base}L${cx+N.cw*.12} ${N.base}Z`,grRgba('#8c7a64',.3)]],lw});
 grPart(c,`M${x0} ${N.ent}L${x1} ${N.ent}L${x1} ${N.ent2}L${x0} ${N.ent2}Z`,marble,{tones:[[`M${x0} ${(N.ent+N.ent2)/2}L${x1} ${(N.ent+N.ent2)/2}L${x1} ${N.ent2}L${x0} ${N.ent2}Z`,grRgba('#8c7a64',.22)]],lw});
 grPart(c,`M${x0-lw} ${N.ent}L${(x0+x1)/2} ${z.y+lw}L${x1+lw} ${N.ent}Z`,marble,{lw});
 const ins=Math.max(3,N.ph*.18);grPart(c,`M${x0+ins*1.8} ${N.ent-ins*.5}L${(x0+x1)/2} ${z.y+ins*1.3}L${x1-ins*1.8} ${N.ent-ins*.5}Z`,night?grShade(CS_TERRA,-.25):CS_TERRA,{lw:lw*.8});
 grPart(c,grEll((x0+x1)/2,N.ent-N.ph*.36,N.ph*.12,N.ph*.12),'#f6dcb8',{lw:lw*.7});
 for(const [x,y] of [[x0,N.ent],[x1,N.ent],[(x0+x1)/2,z.y+lw]]){const r=Math.max(3,N.ph*.16);for(let i=-2;i<=2;i++)grPart(c,grLeaf(x,y,-GR_PI/2+i*.38,r*1.6,r*.4),night?grShade(CS_TERRA,-.25):CS_TERRA,{lw:lw*.6});}
 grPart(c,`M${x0-lw} ${N.base}L${x1+lw} ${N.base}L${x1+lw*2} ${z.y+z.h}L${x0-lw*2} ${z.y+z.h}Z`,marble,{tones:[[`M${x0-lw*3} ${(N.base+z.y+z.h)/2}L${x1+lw*3} ${(N.base+z.y+z.h)/2}L${x1+lw*3} ${z.y+z.h}L${x0-lw*3} ${z.y+z.h}Z`,grRgba('#8c7a64',.25)]],lw});
 if(!o.noPlate)csPlate(c,z);}
// The plate in a niche: a terracotta dish seen from the front, with a black band.
function csPlateGeo(z){const N=csNaiskos(z),S=Math.min(z.w-2*N.cw*1.1,N.base-N.ent2);return {x:z.x+z.w/2,y:N.base-S*.1,rx:S*.42,ry:S*.1,S};}
function csPlate(c,z){const P=csPlateGeo(z),lw=Math.max(1.2,P.S*.012);grPart(c,`M${P.x-P.rx} ${P.y-P.ry*.4}C${P.x-P.rx*.8} ${P.y+P.ry*1.3} ${P.x+P.rx*.8} ${P.y+P.ry*1.3} ${P.x+P.rx} ${P.y-P.ry*.4}Z`,CS_TERRA,{tones:[[`M${P.x-P.rx} ${P.y+P.ry*.2}L${P.x+P.rx} ${P.y+P.ry*.2}L${P.x+P.rx} ${P.y+P.ry*.6}L${P.x-P.rx} ${P.y+P.ry*.6}Z`,'#2a1810']],lw});
 grPart(c,grEll(P.x,P.y-P.ry*.4,P.rx,P.ry*.55),grShade(CS_TERRA,.15),{lw});}
// ── The ingredients ────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each one is drawn around (0, 0), about 200 units wide, standing on y = 90.
const CS_ICONS={
 // a big white feather with a golden shine
 feather(c,t){c.save();c.translate(0,-10);c.rotate(-.42);const vane='M0 110C-10 60 -60 20 -58 -40C-56 -90 -20 -120 6 -140C20 -100 56 -60 52 -10C50 40 20 80 0 110Z';
  grPart(c,vane,grVGrad(c,-140,110,['#ffffff','#eef2ff','#d6dcf6']),{tones:[['M4 -140C20 -100 56 -60 52 -10C50 40 20 80 0 110L0 -140Z',grRgba('#aab4e0',.45)]],lw:7});
  for(const [x,y,a] of [[-50,-30,.5],[-56,20,.3],[48,-20,-.4],[40,30,-.3]])grLine(c,`M${x} ${y}l${-Math.sin(a)*14} ${16}`,5,'#ffffff');
  grLine(c,'M6 -140C2 -60 0 20 0 130',7);grLine(c,'M6 -136C2 -60 0 20 0 128',3,'#fff8e0');
  for(const [x,y] of [[-40,-80],[44,-70],[-30,40]]){grGlow(c,x,y,22,'#ffe38a',.7);grLine(c,`M${x-12} ${y}L${x+12} ${y}M${x} ${y-12}L${x} ${y+12}`,4,'#fff4c0');}c.restore();},
 // three heads of garlic tied together
 garlic(c,t){const bulb=(x,y,r)=>{grPart(c,`M${x} ${y-r*1.3}C${x+r*.2} ${y-r*.9} ${x+r*1.1} ${y-r*.6} ${x+r*1.1} ${y}C${x+r*1.1} ${y+r*.8} ${x+r*.5} ${y+r} ${x} ${y+r}C${x-r*.5} ${y+r} ${x-r*1.1} ${y+r*.8} ${x-r*1.1} ${y}C${x-r*1.1} ${y-r*.6} ${x-r*.2} ${y-r*.9} ${x} ${y-r*1.3}Z`,grRGrad(c,x,y,r*1.3,['#ffffff','#f3ece4','#d9c4d8'],x-r*.4,y-r*.4,2),{lw:7});
   for(const k of [-.55,0,.55])grLine(c,`M${x+k*r*.4} ${y-r*1.1}C${x+k*r*1.3} ${y-r*.4} ${x+k*r*1.3} ${y+r*.5} ${x+k*r*.6} ${y+r*.95}`,4,grRgba('#b88ab8',.7));
   grLine(c,`M${x-r*.3} ${y+r}l-8 14M${x} ${y+r}l0 16M${x+r*.3} ${y+r}l8 14`,4,'#c9b08a');};
  grLine(c,'M0 -70C-30 -50 -56 -40 -58 -14M0 -70C0 -40 0 -20 0 0M0 -70C30 -50 56 -40 58 -14',12,'#c9b08a');grPart(c,grEll(0,-72,14,10),'#9a6b3a',{lw:5});
  bulb(-58,34,46);bulb(58,34,46);bulb(0,46,52);},
 // a round loaf with sesame seeds
 bread(c,t){const d='M-100 60C-110 0 -70 -70 0 -72C70 -70 110 0 100 60C70 84 -70 84 -100 60Z';grPart(c,d,grRGrad(c,-20,-20,140,['#f6c776','#d98d3c','#9a5422'],-40,-50,4),{tones:[['M40 -60C100 -20 110 40 96 64L120 64L120 -80Z',grRgba('#7a3e18',.4)],['M-70 -30C-50 -56 -20 -64 10 -64L-10 -40C-30 -36 -50 -26 -66 -12Z',grRgba('#fff2cc',.5)]],lw:7});
  grLine(c,'M-50 -36C-20 -10 20 -10 50 -36M-60 10C-20 36 20 36 60 10',7,'#8a4a1c');for(let i=0;i<14;i++){const x=(grRand(i,41)-.5)*150,y=-50+grRand(i,43)*90;grPart(c,grEll(x,y,6,3.4,grRand(i,47)*3),'#fff3d6',{lw:2});}},
 ladle(c,t){c.save();c.rotate(-.7);grTube(c,'M0 -130L0 60',22,'#b47b45',7);grPart(c,'M-56 50C-56 120 56 120 56 50C30 66 -30 66 -56 50Z',GR_BRONZE,{lw:7});c.restore();}};
// ── The honey biscuits ─────────────────────────────────────────────────────────────────────────────────────────────────────
// Each biscuit is a union of simple shapes (ellipses and thick strokes): all are first outlined in ink, then filled with the same
// baked gradient, so the outline goes round the whole animal. Then the icing (white lines), the raisin eye and the sesame seeds.
function csUnion(c,prims,fill,lw=7){for(const p of prims){c.beginPath();if(p.line){grPath(c,p.line);c.strokeStyle=GR_INK;c.lineWidth=p.w+2*lw;c.lineCap='round';c.lineJoin='round';c.stroke();}else{grPath(c,p.d);c.strokeStyle=GR_INK;c.lineWidth=2*lw;c.lineJoin='round';c.stroke();}}
 for(const p of prims){c.beginPath();if(p.line){grPath(c,p.line);c.strokeStyle=fill;c.lineWidth=p.w;c.lineCap='round';c.lineJoin='round';c.stroke();}else{grPath(c,p.d);c.fillStyle=fill;c.fill();}}}
const CS_COOKIE={
 horse:{prims:[{d:grEll(16,8,62,32)},{line:'M-28 -4L-56 -50',w:46},{d:grEll(-70,-58,28,23,-.5)},{line:'M-80 -52L-108 -26',w:30},{line:'M-58 -76L-52 -98',w:13},{line:'M-30 26L-34 82',w:20},{line:'M-10 30L-8 82',w:20},{line:'M44 28L46 82',w:20},{line:'M62 22L70 82',w:20},{line:'M70 -12C98 -6 106 24 98 58',w:20},{line:'M76 -6C96 10 92 40 80 60',w:12}],
  icing:['M-50 -82C-58 -66 -40 -60 -46 -46C-52 -34 -34 -30 -36 -16C-38 -6 -24 -2 -22 6'],eye:[-74,-62],nose:[-106,-28],seeds:[[4,0],[30,-6],[34,16],[-6,16]]},
 lion:{prims:[{d:grEll(16,10,60,32)},{d:grEll(-50,-30,50,50)},{line:'M-30 30L-32 82',w:20},{line:'M-6 34L-4 82',w:20},{line:'M44 30L46 82',w:20},{line:'M64 24L70 82',w:20},{line:'M72 0C100 -10 104 -40 96 -56',w:12},{d:grEll(96,-62,13,13)}],
  icing:[grCurls(-50,-30,38,38,0,GR_TAU,10,.1,true)],eye:[-62,-38],nose:[-82,-24],seeds:[[20,0],[40,14],[0,16]]},
 bird:{prims:[{d:grEll(6,10,58,40,-.12)},{d:grEll(-48,-36,27,26)},{d:'M-68 -44L-98 -32L-70 -24Z'},{d:'M40 -10L100 -46L104 6L52 22Z'},{line:'M-8 48L-12 80',w:10},{line:'M14 48L16 80',w:10}],
  icing:['M-14 -4C10 -20 40 -12 54 6','M-10 14C14 0 40 6 50 22','M-4 30C16 20 34 24 44 34'],eye:[-54,-42],seeds:[[-20,24]]},
 snake:{prims:[{line:'M-70 70C-110 40 -70 -10 -20 10C30 30 70 0 50 -40C36 -66 0 -70 -6 -48',w:34},{d:grEll(-10,-56,30,22,.3)}],
  icing:['M-74 54C-90 34 -66 10 -36 18','M8 26C40 30 56 6 46 -22'],eye:[-14,-62],tongue:'M-36 -48L-56 -44M-56 -44L-64 -50M-56 -44L-62 -36',seeds:[[-60,40],[20,22]]},
 dog:{prims:[{d:grEll(16,14,54,30)},{d:grEll(-46,-30,32,30)},{line:'M-70 -20L-98 -12',w:28},{d:grEll(-32,-30,13,27,.35)},{line:'M-24 30L-28 82',w:18},{line:'M-4 34L-2 82',w:18},{line:'M42 34L44 82',w:18},{line:'M60 26L66 82',w:18},{line:'M66 2C92 -6 96 -34 84 -50',w:15}],
  icing:['M-40 -50C-28 -40 -24 -20 -28 -6'],eye:[-58,-38],nose:[-104,-14],seeds:[[16,6],[36,18]]},
 bull:{prims:[{d:grEll(18,6,70,40)},{d:grEll(-18,-22,44,30)},{d:grEll(-66,-2,34,30)},{d:grEll(-88,16,22,18)},{line:'M-62 -26C-66 -52 -88 -62 -100 -54',w:13},{line:'M-48 -28C-42 -52 -22 -60 -12 -52',w:13},{line:'M-26 36L-28 82',w:24},{line:'M-2 40L0 82',w:24},{line:'M50 38L52 82',w:24},{line:'M70 30L76 82',w:24},{line:'M84 -12C98 -2 100 22 98 40',w:9},{d:grEll(98,46,9,11)}],
  icing:['M-80 -24C-74 -16 -60 -14 -52 -20'],eye:[-70,-14],nose:[-96,20],seeds:[[24,-4],[50,10],[4,18]]}};
function csCookie(c,id,t=0){const k=CS_COOKIE[id];if(!k)return;const fill=grRGrad(c,-20,-30,170,['#f7c879','#dc964a','#b0652e'],-40,-50,6);csUnion(c,k.prims,fill,7);
 for(const d of k.icing)grLine(c,d,7,'#fff6e8');if(k.tongue)grLine(c,k.tongue,5,'#c94a3a');
 if(k.nose)grPart(c,grEll(k.nose[0],k.nose[1],7,6),'#4a2a1c',{lw:0});
 grPart(c,grEll(k.eye[0],k.eye[1],8,9),'#3a1f28',{lw:0});grPart(c,grEll(k.eye[0]-2,k.eye[1]-3,2.5,2.5),'#fff',{lw:0});
 for(const [x,y] of k.seeds)grPart(c,grEll(x,y,6,3.4,.5),'#fff3d6',{lw:2});}
// Draws an option (an ingredient or a biscuit) centred on (x, y) with size S (about its width); lift raises it, squash presses it.
export function csDrawItem(c,id,x,y,S,o={}){c.save();c.translate(x,y-(o.lift||0)*S*.08);const k=S/220;c.scale(k*(1+(o.squash||0)),k*(1-(o.squash||0)));if(o.rot)c.rotate(o.rot);
 if(CS_ICONS[id])CS_ICONS[id](c,o.t||0);else csCookie(c,id,o.t||0);c.restore();}
// The item on the plate of a niche.
function csNicheItem(c,z,id,o={}){const P=csPlateGeo(z),S=P.S*.86;csDrawItem(c,id,P.x,P.y-P.ry*.4-S*.42,S,o);}
// ── Glups at the cauldron ──────────────────────────────────────────────────────────────────────────────────────────────────
// The cauldron in the units of Glups (from his feet): where its rim is, and the point of the soup where the ladle stirs.
function csPotIn(geo){return {x:(geo.px-geo.gx)/geo.s,y:(geo.py-geo.floor)/geo.s,k:geo.ps/geo.s};}
// At rest: he stirs the soup slowly with the long ladle in his right hand (the far one, partly behind his belly), and the body goes
// a little with each turn; he breathes, blinks now and then (sometimes twice), looks at the niche in focus (look: [x, y]) and, with
// his left hand, now pats his belly and now strokes his beard while he thinks. still: the same drawing without movement.
const CS_NEAR_REST=[[302,-462],[132,-432]],CS_NEAR_BEARD=[[300,-520],[30,-596]];
// An arm (elbow and wrist) part of the way from A to B.
const csArmLerp=(A,B,k)=>A.map((p,i)=>[grLerp(p[0],B[i][0],k),grLerp(p[1],B[i][1],k)]);
function csRest(geo,t,still,look=[-.4,-.8]){const s=still?0:t,a=s*1.7,pot=csPotIn(geo),hx=-440+36*Math.cos(a),hy=-560+12*Math.sin(a),tip=[pot.x+60*pot.k*Math.cos(a),pot.y+8*pot.k*Math.sin(a)];
 const blink=still?0:((s%4.3)<.14||((s+1.9)%9.7)<.14||((s+2.15)%9.7)<.12)?1:0,p=s%10,beard=still?0:grSmooth(grSpan(p,6.2,6.8))*(1-grSmooth(grSpan(p,8.4,9))),
  stroke=beard*(still?0:.5-.5*Math.cos(grSpan(p,6.8,8.4)*GR_PI*4)),pat=still?0:grBump(p,1.6,1.95)+grBump(p,2.05,2.4),
  near=[[grLerp(CS_NEAR_REST[0][0],CS_NEAR_BEARD[0][0],beard),grLerp(CS_NEAR_REST[0][1],CS_NEAR_BEARD[0][1],beard)+10*pat],[grLerp(CS_NEAR_REST[1][0],CS_NEAR_BEARD[1][0],beard)-6*stroke,grLerp(CS_NEAR_REST[1][1],CS_NEAR_BEARD[1][1],beard)+34*stroke-26*pat]];
 return {x:geo.gx,y:geo.floor,s:geo.s,look:beard>.5?[grLerp(look[0],-.2,beard),grLerp(look[1],-1,beard)]:look,lid:blink,brows:.4*beard+.12*Math.sin(s*.9),mouth:beard>.5?'smileShut':'smile',
  tilt:look[0]*.06+.025*Math.sin(a+.7)-.04*beard,lean:.014*Math.sin(a),squash:1+.01*Math.sin(s*2.2),
  arms:{far:[[-352+14*Math.cos(a),-470+8*Math.sin(a)],[hx,hy]],near},hands:{near:beard>.3?'rest':'flat'},
  hold:c=>{grTube(c,grPoly([tip,[hx+(hx-tip[0])*.12,hy+(hy-tip[1])*.12]]),22,'#b47b45',7);}};}
// Where Glups looks: at the niches that are lit (the one in focus), weighted by their light.
function csLookAt(geo,zones,lights){let sx=0,sy=0,sw=0;zones.forEach((z,i)=>{const k=Math.max(0,((lights?.[i]??TL_DIM)-TL_DIM)/(1-TL_DIM));sx+=k*(z.x+z.w/2);sy+=k*(z.y+z.h/2);sw+=k;});
 if(sw<.05)return [-.5,.3];const hx=geo.gx-geo.G*.03,hy=geo.floor-geo.G*.82,dx=sx/sw-hx,dy=sy/sw-hy,L=Math.hypot(dx,dy)||1;return [Math.max(-1,Math.min(1,dx/L*1.3)),Math.max(-1,Math.min(1,dy/L*1.2))];}
// The soup: broth, then the colour of the magic ingredient, then the glow of the creature.
const CS_BROTH='#e9d7a8';
export function csSoup(picks=[]){const r=gpRecipe(picks);return r.magic?GP_MAGICS.find(x=>x.id===r.magic).soup:CS_BROTH;}
// Shadows, the cauldron, the steam and Glups. o: t, still, soup, glow, ring, steam, pose (the drawing of Glups).
function csGroup(c,geo,o){grShadow(c,geo.px,geo.floor,geo.G*.32,geo.G*.045);if(o.pose)grShadow(c,o.pose.x,geo.floor,geo.G*.28*(o.pose.shadow??1),geo.G*.04*(o.pose.shadow??1));
 grAt(c,geo.px,geo.py,geo.ps,1,0,()=>{grCauldron(c,o.soup,o.t,{still:o.still,glow:o.glow||0,ring:o.ring||0});grSteam(c,o.t,o.still,o.steam??1,o.steamCol||'#ffffff');});
 if(o.splash)o.splash();if(o.pose)grGlups(c,o.pose,o.t);}
// ── Drawing a whole board ──────────────────────────────────────────────────────────────────────────────────────────────────
function csDecorOf(s,view){return view?.decor||escDecor({background:s.background,base:s.base,opacity:s.opacity});}
const csKey=d=>escDecorKey(d)+(d.fade>0?'':'|none'+d.base);
// The static layer: the decor (with its veil), then the niches with what they hold. empty: the niches whose plate is empty ('all', or
// an index).
function csStatic(c,geo,D,zones,ids,d,empty=-1){const {w,h}=geo,night=D.id==='night';c.fillStyle=d.base;c.fillRect(0,0,w,h);
 if(d.fade>0)escVeiled(d,x=>{csWall(x,geo,D);csView(x,geo,D);csTerrace(x,geo,D);for(const cx of geo.cols)csColumn(x,cx,geo.beam,geo.back+(geo.floor-geo.back)*.15,geo.colW,night);})(c,w,h);
 zones.forEach((z,i)=>{csNiche(c,z,{night});if(ids[i]&&empty!=='all'&&empty!==i)csNicheItem(c,z,ids[i]);});}
function csSheet(c,key,geo,paint){const cv=escSheet(c,key,geo.w,geo.h,sc=>paint(sc));if(cv)c.drawImage(cv,0,0,geo.w,geo.h);else paint(c);}
function csIds(view){return (view.options||[]).map(o=>o.value??o.id??o);}
function csPicks(view,state){return (view.picks||(state.picks||[]).map(p=>p?.value??p)).filter(Boolean);}
// The board: the niches with the options, Glups stirring the cauldron, the light on the niche in focus and its contour.
export function gpBoard(c,w,h,state,game,s,view){if(view.preview&&!(view.picks||[]).length){csCard(c,w,h);return;}
 const r=state.round||0,D=gpDay(r),still=!!s.reduced,d=csDecorOf(s,view),zones=view.zones,ids=csIds(view),geo=csGeo(w,h,zones),t=still?0:view.clock||0,picks=csPicks(view,state);
 const key=['gp',D.id,ids.join(),zones.length,csKey(d)].join('|');csSheet(c,key,geo,x=>csStatic(x,geo,D,zones,ids,d));
 const f=view.focus;
 // the item in the focus bobs on its plate: the niche comes from a second sheet, with the plates empty, and only the item is drawn
 if(f>=0&&zones[f]&&!still&&!view.waiting){const z=zones[f],u=(view.clock||0)%1.6/1.6;c.save();c.beginPath();grPath(c,z.pts);c.clip();
  const cv=escSheet(c,['gp-empty',D.id,ids.join(),zones.length,csKey(d)].join('|'),geo.w,geo.h,x=>csStatic(x,geo,D,zones,ids,d,'all'));
  if(cv){const k=cv.width/geo.w,x0=Math.max(0,Math.floor(z.x)),y0=Math.max(0,Math.floor(z.y)),x1=Math.min(geo.w,Math.ceil(z.x+z.w)),y1=Math.min(geo.h,Math.ceil(z.y+z.h));c.drawImage(cv,x0*k,y0*k,(x1-x0)*k,(y1-y0)*k,x0,y0,x1-x0,y1-y0);}
  csNicheItem(c,z,ids[f],{lift:Math.sin(GR_PI*u),squash:.03*Math.sin(GR_TAU*u),t});c.restore();}
 csGroup(c,geo,{t,still,soup:csSoup(picks),pose:csRest(geo,t,still,csLookAt(geo,zones,view.lights))});
 tlVeil(c,w,geo.H,zones,view.lights,.35*(view.wait??(view.waiting?1:0)));
 if(f>=0&&zones[f]&&!view.waiting)tlRing(c,zones[f].pts,view.progress,1,Math.max(.6,Math.min(1.2,w/1280)),view.ring);}
// ── A choice that is not the last one ──────────────────────────────────────────────────────────────────────────────────────
// The flight of an item from its niche into the cauldron (T from 0 to GP_T.fly): an arc, turning, getting smaller.
function csFlight(c,geo,z,id,T){const u=grClamp(T/GP_T.fly);if(u>=1)return;const P=csPlateGeo(z),S=P.S*.86,x0=P.x,y0=P.y-P.ry*.4-S*.42,x1=geo.px,y1=geo.py-GR_POT.ry*geo.ps*.2,
 e=u*u*(3-2*u),x=grLerp(x0,x1,e),y=grLerp(y0,y1,e)-Math.sin(GR_PI*u)*geo.G*.35,k=grLerp(1,.42,e);csDrawItem(c,id,x,y,S*k,{rot:u*GR_PI*.9*(x1<x0?-1:1)});}
// The splash of a plop: drops that jump and fall back (k from 0 to 1, in half a second).
function csSplash(c,geo,col,k){if(k<=0||k>=1)return;for(let i=0;i<9;i++){const a=-GR_PI*(.1+.8*i/8),v=geo.G*(.14+.08*grRand(i,8)),x=geo.px+Math.cos(a)*v*k*1.3,y=geo.py+Math.sin(a)*v*k*2.2+geo.G*.9*k*k,r=geo.G*.016*(1-k*.4);
 c.beginPath();c.arc(x,y,r,0,GR_TAU);c.fillStyle=col;c.fill();c.strokeStyle=GR_INK;c.lineWidth=grLW(c,Math.max(1,r*.25));c.stroke();}}
// A puff of magic steam (k from 0 to 1): soft round clouds that turn about (cx, cy) and grow, with sparkles; never the whole screen.
function csSwirl(c,cx,cy,R,k,col,still){if(k<=0||k>=1)return;const grow=grOut(k/.45),fade=1-grSmooth((k-.55)/.45),n=9;c.save();c.globalAlpha*=fade;
 grGlow(c,cx,cy,R*1.5*grow,col,.55);
 for(let i=0;i<n;i++){const a=i/n*GR_TAU+(still?0:k*3.2),rr=R*(.35+.55*grow),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.75,r=R*(.26+.1*Math.sin(i*1.7))*grow;
  c.beginPath();c.arc(x,y,r,0,GR_TAU);c.fillStyle=grMix('#ffffff',col,.35);c.fill();c.strokeStyle=grRgba(GR_INK,.35);c.lineWidth=grLW(c,Math.max(1,r*.05));c.stroke();}
 c.beginPath();c.arc(cx,cy,R*.55*grow,0,GR_TAU);c.fillStyle=grMix('#ffffff',col,.2);c.fill();
 for(let i=0;i<7;i++){const a=i*2.4+k*5,rr=R*(.3+.8*grRand(i,3))*grow,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.8,q=R*.06*(1-k);grLine(c,`M${x-q} ${y}L${x+q} ${y}M${x} ${y-q}L${x} ${y+q}`,Math.max(1.5,q*.25),'#fff8d8');}
 c.restore();}
// What the magic ingredient does to Glups when he tries it (u from 0 to 1 over GP_T.tryIn … GP_T.tryOut):
// the feather: two little wings that flap three times and lift him a little; the garlic: two more heads that pop out of his shoulders,
// look at each other and go back; the bread: the lower half of him dances on its own while the upper half wonders.
function csTry(pose,magic,u,still,t){if(u<=0||u>=1)return pose;const on=grBack(grSpan(u,0,.18))*(1-grSmooth(grSpan(u,.82,1)));
 if(magic==='feather'){const flap=still?.6:.5+.5*Math.sin(grSpan(u,.15,.8)*GR_PI*6-GR_PI/2),lift=still?0:70*grBump(u,.2,.85);
  return {...pose,lift,brows:1,mouth:'grin',cheeks:.8,look:[.6,-.4],arms:{...pose.arms,near:csArmLerp(pose.arms.near,[[340,-560],[430,-600+60*flap]],on)},hands:{near:on>.5?'open':'flat'},behind:c=>{for(const [x,y,r,k] of [[150,-660,-.75,1.05],[220,-610,-.4,1.15]]){c.save();c.translate(x,y);c.scale(on*k,on*k);c.rotate(r);grWing(c,.25+.75*flap);c.restore();}}};}
 if(magic==='garlic'){const pop=k=>grBack(grSpan(u,k,k+.14))*(1-grSmooth(grSpan(u,.78,.95))),eyes=u<.5?[-1,-.2]:[1,-.2];
  return {...pose,brows:.6,mouth:u>.4&&u<.7?'o':'smile',look:[0,-.6],mid:c=>{for(const [x,y,k,lk] of [[-300,-600,.08,[1,0]],[250,-610,.16,[-1,0]]]){const p=pop(k);if(p<=0)continue;c.save();c.translate(x,y);c.scale(.6*p,.6*p);c.translate(20,700);
    grTube(c,'M-20 -640L-20 -560',90,'#e3a77a',7);grHead(c,{look:u<.5?lk:eyes,mouth:u>.45?'grin':'smile',brows:.8,tilt:lk[0]*.15},t);c.restore();}}};}
 // bread: the hips sway and the feet kick, in time
 const b=still?0:Math.sin(grSpan(u,.15,.85)*GR_PI*6);
 return {...pose,brows:-.4,mouth:'flat',look:[.2,1],arms:{...pose.arms,near:csArmLerp(pose.arms.near,[[340,-520],[236,-520]],grSmooth(grSpan(u,0,.12))*(1-grSmooth(grSpan(u,.88,1))))},hands:{near:u>.06&&u<.94?'grip':pose.hands.near},dance:[on*70*b,on*.08*b],kick:[on*95*Math.max(0,b),on*95*Math.max(0,-b)]};}
// While a choice is answered the niches rest in the shade and the terrace is lit (k from 0 to 1).
function csNichesVeil(c,zones,k){if(k<=0)return;c.save();c.fillStyle=`rgba(8,6,20,${(1-TL_DIM)*k})`;c.beginPath();for(const z of zones)grPath(c,z.pts);c.fill();c.restore();}
// The steam of an animal biscuit (in «Un ingredient sorpresa»): its shape rises from the soup as a white cloud and fades.
function csGhost(c,geo,id,u){if(u<=0||u>=1)return;const S=geo.G*.5,y=geo.py-geo.G*(.2+.45*grOut(u));c.save();c.globalAlpha=.75*Math.sin(GR_PI*u);c.translate(geo.px,y);c.scale(S/220,S/220);
 const k=CS_COOKIE[id];if(k)csUnion(c,k.prims,'#ffffff',4);c.restore();}
export function gpResult(c,w,h,state,game,s,view,T){const zones=view.zones,ci=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[ci],r=state.round||0,D=gpDay(r),still=!!s.reduced,d=csDecorOf(s,view),ids=csIds(view),geo=csGeo(w,h,zones),t=still?0:(view.clock||T),picks=(view.picks||[]).filter(Boolean),id=ids[ci];
 if(view.final){gpShow(c,w,h,state,game,s,view,T);return;}
 const key=['gp',D.id,ids.join(),zones.length,csKey(d),'e'+ci].join('|');csSheet(c,key,geo,x=>csStatic(x,geo,D,zones,ids,d,ci));
 const before=picks.slice(0,-1),colIn=grSmooth(grSpan(T,GP_T.plop,GP_T.plop+.6)),soup=grMix(csSoup(before),csSoup(picks),colIn),magic=gpRecipe(picks).magic,isMagic=id===magic;
 let pose=csRest(geo,t,still,T<GP_T.fly?[-.6,-1]:[-.8,.6]);
 if(isMagic)pose=csTry(pose,magic,grSpan(T,GP_T.tryIn,GP_T.tryOut),still,t);
 else{const sn=grBump(T,1,2.6);if(sn>0)pose={...pose,lid:grLerp(pose.lid,.85,sn),mouth:'grin',cheeks:.6*sn,tilt:-.08*sn};}
 csGroup(c,geo,{t,still,soup,ring:grSpan(T,GP_T.plop,GP_T.plop+.7),pose,splash:()=>csSplash(c,geo,soup,grSpan(T,GP_T.plop,GP_T.plop+.5))});
 if(!isMagic&&id!==GP_LADLE.id)csGhost(c,geo,id,grSpan(T,1,2.8));
 csNichesVeil(c,zones,grSmooth(grSpan(T,0,.4))*(1-grSmooth(grSpan(T,GP_STEP-.5,GP_STEP))));
 csFlight(c,geo,z,id,T);}
// ── The show ───────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The last choice: the biscuit flies into the cauldron and plops, the soup shines, Glups tastes it with the ladle, opens his eyes wide,
// and a puff of magic steam turns about him; under it the terrace gives way to the place of the creature, and the scene of the creature
// is played (cassola-mites.js). Then the creature hiccups, a puff, and Glups is back on his terrace, a little dizzy.
// A round window that opens from (x, y) (k from 0 to 1) to the whole screen: draw() paints what is seen through it, and a ring of
// soft puffs of the magic colour runs round its edge (the ring fades as it reaches the corners). Smooth, never a flash.
function csIris(c,w,h,x,y,k,col,G,draw){if(k<=0)return;const far=Math.max(Math.hypot(x,y),Math.hypot(w-x,y),Math.hypot(x,h-y),Math.hypot(w-x,h-y)),R=grLerp(G*.12,far+G*.2,grIn(k));
 c.save();c.beginPath();c.arc(x,y,R,0,GR_TAU);c.clip();draw();c.restore();
 const fade=1-grSmooth(grSpan(k,.7,1)),r=Math.max(G*.05,R*.11),n=Math.max(8,Math.min(44,Math.round(GR_TAU*R/(r*1.3))));if(fade<=0)return;
 c.save();c.globalAlpha*=fade;c.beginPath();for(let i=0;i<n;i++){const a=i/n*GR_TAU+k*.6,q=r*(.8+.35*grRand(i,11));c.moveTo(x+Math.cos(a)*R+q,y+Math.sin(a)*R);c.arc(x+Math.cos(a)*R,y+Math.sin(a)*R,q,0,GR_TAU);}
 c.strokeStyle=grRgba(GR_INK,.4);c.lineWidth=grLW(c,Math.max(1.5,r*.06));c.stroke();c.fillStyle=grMix('#ffffff',col,.3);c.fill();c.restore();}
const CS_SCENE=GP_T.sceneEnd-GP_T.scene;
function csZoom(c,geo,z,draw){if(z<=1.0005){draw();return;}const cx=(geo.px+geo.gx)/2,cy=geo.floor-geo.G*.55;c.save();c.translate(cx,cy);c.scale(z,z);c.translate(-cx,-cy);draw();c.restore();}
// The terrace of the show. The painted terrace is kept in a sheet: one already close while the view is still (zoom 1 or 1.16), and
// one at zoom 1, scaled, while the view comes close or goes back (a sheet per zoom would be painted again at every frame).
function csTerraceShow(c,geo,D,zones,ids,d,ci,T,o){const e=o.emptyAll?'all':ci,key=['gp',D.id,ids.join(),zones.length,csKey(d),'e'+e].join('|'),paint=x=>csStatic(x,geo,D,zones,ids,d,e),z=o.zoom;
 if(z<=1.0005||Math.abs(z-1.16)<1e-4)csSheet(c,key+'|z'+z.toFixed(2),geo,x=>csZoom(x,geo,z,()=>paint(x)));
 else{const cv=escSheet(c,key+'|z1',geo.w,geo.h,paint);csZoom(c,geo,z,()=>{if(cv)c.drawImage(cv,0,0,geo.w,geo.h);else paint(c);});}
 csZoom(c,geo,z,()=>{csGroup(c,geo,o.group);csNichesVeil(c,zones,o.veil);if(o.flight)o.flight();});}
export function gpShow(c,w,h,state,game,s,view,T){const zones=view.zones,ci=Math.max(0,Math.min(zones.length-1,view.chosen??0)),z=zones[ci],D=gpDay(state.round||0),still=!!s.reduced,d=csDecorOf(s,view),ids=csIds(view),geo=csGeo(w,h,zones),t=still?0:(view.clock||T),picks=(view.picks||[]).filter(Boolean),id=ids[ci];
 const rec=gpRecipe(picks),cr=rec.creature||gpCreature('feather','horse'),T1=GP_T,ladleOnly=id===GP_LADLE.id;
 const glow=grSmooth(grSpan(T,T1.glow,T1.glow+.5));
 // the scene, from the puff to the hiccup and the way back
 if(T>=T1.cross&&T<T1.home){const u=T-T1.scene,k=grSmooth(grSpan(T,T1.cross,T1.scene)),back=grSmooth(grSpan(T,T1.back,T1.home));
  const terrace=()=>{const pose=back>0?csDizzy(geo,t,still,0):csTaste(geo,T,t,still,cr);csTerraceShow(c,geo,D,zones,ids,d,ci,T,{zoom:still?1:1.16,veil:1,emptyAll:true,group:{t,still,soup:csSoup(picks),glow:back>0?0:1,pose}});};
  const scene=()=>myScene(c,w,h,cr.id,Math.max(-.6,Math.min(CS_SCENE+.6,u)),{still,decor:d,t,H:geo.H});
  // the scene opens from the magic cloud like a round window of puffs, and the terrace opens again from the creature at the end
  const cx=geo.gx-geo.G*.05,cy=geo.floor-geo.G*.52;let anchor=null;
  if(back>0){anchor=scene();const A=anchor||{x:w/2,y:geo.H/2,r:geo.G*.6};csIris(c,w,geo.H,A.x,A.y,back,cr.glow,geo.G,terrace);}
  else if(k<1){terrace();csIris(c,w,geo.H,cx,cy,k,cr.glow,geo.G,()=>{anchor=scene();});}
  else anchor=scene();
  // the puff over the change, and the one of the hiccup
  if(T<T1.scene+.6)csSwirl(c,cx,cy,geo.G*.62,grSpan(T,T1.swirl,T1.scene+.6),cr.glow,still);
  if(T>=T1.hic&&back<.5){const A=anchor||{x:w/2,y:geo.H/2,r:geo.G*.6};csSwirl(c,A.x,A.y,A.r,grSpan(T,T1.hic,T1.home+.2),cr.glow,still);}
  return;}
 if(T>=T1.home){// back on the terrace: the view comes back from close, and Glups shakes his head and smiles
  const zb=still?1:grLerp(1.16,1,grSmooth(grSpan(T,T1.home,T1.home+.9)));csTerraceShow(c,geo,D,zones,ids,d,ci,T,{zoom:zb,veil:1-grSmooth(grSpan(T,GP_SHOW-.8,GP_SHOW)),emptyAll:true,group:{t,still,soup:csSoup(picks),pose:csDizzy(geo,t,still,grSpan(T,T1.home,T1.rest))}});
  csSwirl(c,geo.gx-geo.G*.05,geo.floor-geo.G*.52,geo.G*.62,grSpan(T,T1.hic,T1.home+.2),cr.glow,still);return;}
 // before the puff: the biscuit (or the ladle) flies in, the soup shines, Glups tastes
 const zoom=still?1:grLerp(1,1.16,grSmooth(grSpan(T,.6,2.6))),soup=grMix(csSoup(picks),grMix(csSoup(picks),cr.glow,.6),glow);
 csTerraceShow(c,geo,D,zones,ids,d,ci,T,{zoom,veil:grSmooth(grSpan(T,0,.5)),group:{t,still,soup,glow,ring:ladleOnly?0:grSpan(T,T1.plop,T1.plop+.7),steamCol:grMix('#ffffff',cr.glow,glow),pose:csTaste(geo,T,t,still,cr),
  splash:()=>{if(!ladleOnly)csSplash(c,geo,soup,grSpan(T,T1.plop,T1.plop+.5));}},flight:()=>{if(!ladleOnly)csFlight(c,geo,z,id,T);}});
 csSwirl(c,geo.gx-geo.G*.05,geo.floor-geo.G*.52,geo.G*.62,grSpan(T,T1.swirl,T1.scene+.6),cr.glow,still);}
// Glups tastes: he lifts the ladle to his mouth and blows on it, sips with his eyes shut, swallows (the beard goes up and down), and
// then opens his eyes wide, throws up his left hand and gives a little hop.
function csTaste(geo,T,t,still,cr){const P=csRest(geo,still?0:T<GP_T.lift?t:t-(T-GP_T.lift),still,[-.8,.5]),T1=GP_T,up=grSmooth(grSpan(T,T1.lift,T1.sip)),sip=grBump(T,T1.sip,T1.wow),wow=grSmooth(grSpan(T,T1.wow,T1.wow+.25));
 const pre=grBump(T,T1.glow,T1.lift+.2);if(up<=0)return {...P,brows:.5*pre,mouth:pre>.3?'grin':P.mouth,arms:{...P.arms,near:csArmLerp(P.arms.near,CS_NEAR_REST,grSmooth(grSpan(T,T1.glow,T1.lift)))}};
 const pot=csPotIn(geo),blow=grBump(T,T1.lift+.3,T1.sip),gulp=still?0:grBump(T,T1.sip+.38,T1.wow-.02),hop=still?0:grBump(T,T1.wow,T1.wow+.38);
 const [e0,h0]=P.arms.far,ex=grLerp(e0[0],-392,up)+20*wow,ey=grLerp(e0[1],-566,up)+30*wow,hx=grLerp(h0[0],-300,up)-40*wow,hy=grLerp(h0[1],-650,up)+20*wow,bx=grLerp(pot.x,-178,up)-90*wow,by=grLerp(pot.y,-716,up)+40*wow;
 return {...P,farFore:true,lean:-.03*up*(1-wow),lift:26*hop,squash:1+.04*gulp-.03*hop,arms:{far:[[ex,ey],[hx,hy]],near:csArmLerp(csArmLerp(P.arms.near,CS_NEAR_REST,grSmooth(grSpan(T,T1.glow,T1.lift))),[[340,-560],[410,-720]],wow)},hands:{near:wow>.4?'open':grSpan(T,T1.glow,T1.lift)>.5?'flat':P.hands.near},
  look:wow>0?[0,-1]:[-1,.25],lid:sip>.2&&wow<=0?.9:0,mouth:wow>0?'open':sip>0?'chew':blow>.2?'blow':'smileShut',jaw:sip>0&&wow<=0?5-6*gulp:undefined,brows:wow>0?1:.3*blow,cheeks:Math.max(sip,blow*.8),
  tilt:-.1*sip+.05*gulp-.05*hop,hold:c=>{grLadle(c,bx,by,hx+(hx-bx)*.15,hy+(hy-by)*.15);}};}
// Back from the creature: he sways a little with his eyes half shut and his mouth wobbly, then smiles and pats his belly (u from 0 to 1).
function csDizzy(geo,t,still,u){const P=csRest(geo,t,still,[-.3,-.3]),k=1-grSmooth(grSpan(u,.2,.8)),pat=still?0:grBump(u,.62,.74)+grBump(u,.78,.9);
 return {...P,tilt:(still?0:.12*Math.sin(t*5))*k,lean:(still?0:.03*Math.sin(t*5+1))*k,lid:Math.max(P.lid,.5*k),mouth:k>.3?'flat':'grin',cheeks:1-k,brows:.3*(1-k),
  arms:{...P.arms,near:csArmLerp([CS_NEAR_REST[0],[CS_NEAR_REST[1][0],CS_NEAR_REST[1][1]-26*pat]],P.arms.near,grSmooth(grSpan(u,.9,1)))},hands:{near:u>.95?P.hands.near:'flat'}};}
// ── The card of the home page ──────────────────────────────────────────────────────────────────────────────────────────────
function csCard(c,w,h){const zones=[],geo=csGeo(w,h,zones,0),D=gpDay(0),d=escDecor({preview:true});geo.wall=geo.beam=0;
 csSheet(c,'gp-card',geo,x=>{x.fillStyle='#000';x.fillRect(0,0,w,h);csView(x,{...geo,beam:0,horizon:h*.55,parapet:h*.72},D);csTerrace(x,{...geo,parapet:h*.72,back:h*.8,H:h},D);});
 csGroup(c,geo,{t:1.2,still:true,soup:'#eef0ff',glow:.6,steam:0,pose:{...csRest(geo,0,true,[0,-1]),brows:1,mouth:'open',arms:{far:[[-330,-560],[-400,-700]],near:[[340,-560],[410,-720]]},hands:{far:'open',near:'open'},hold:null}});}

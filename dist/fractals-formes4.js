// Fractals a la natura (CE46, 0.73) · stimuli 16–20: ploma de paó, serralades, arrels, petxina de triangles, dent de lleó. As in
// fractals-formes1.js: each one follows its concept picture (ChatGPT, 2026-11-11), in its units (1672 × 941), and grows order by order.
import {frEvent,frTraced,frDrawTraced,frGrow,frSpline} from './fractals-formes.js';
import {FR_TR_PAO,FR_TR_SERRA,FR_TR_ARRELS,FR_TR_PETXINA,FR_TR_DENT} from './fractals-traces.js';

// ── 16 · Ploma de paó ─────────────────────────────────────────────────────────────────────────────────────────────────────
// A feather is a shaft (the rachis) with a row of barbs on each side, and every barb is a small shaft with a row of barbules on
// each side: the same comb twice, one inside the other, which is what makes a feather soft and light. In the eye of a peacock's
// train feather the barbules are coloured not by pigment but by the light that their layers of keratin and melanin reflect
// (structural colour); the rings of the eye are bands along the barbs where the spacing of those layers changes (Zi, Yu, Li, Li,
// Hu & Wang, 2003; Yoshioka & Kinoshita, 2002). Concept 16: a fan of seven feathers, cyan shafts, barbs of cyan, blue, violet and
// gold, eyes of purple, blue, cyan and gold rings. The shafts, the barbs, the rings and the coarser barbules are the network traced
// from the concept (tools/fractals-traca.py: FR_TR_PAO), timed to grow from the base of each shaft, the shafts first, then the barbs,
// then the barbules; each fine barbule leaves its barb along it and turns away (as the skeleton of the picture cannot show).
// the bases of the seven shafts on the bottom edge (x), for the sound of each feather
const FR_FEATHERS=[747,675,852,548,1000,416,1255];
export const FR_PAO={id:'pao',name:'Ploma de paó',what:'les plomes del paó, l’eix, les barbes i les barbetes',
 pal:['#a050ff','#3c64ff','#18eeff','#30ffa8','#ffd23c'],pal2:['#ff50d8','#8a5cff','#30c8ff','#50ff90','#ffb030'],
 look:{bloom:.14,glow:1.1,halo:.16,core:.8,tubeW:1.2,tubeP:1.5,spread:.3,minW:.4,gsat:1.5,sat:1.1,white:1.9,exp:1.7},wind:.003,
 acts:[(S,t0)=>{const k=S.k,P=frTraced(FR_TR_PAO),lv=[.9,2,.15];
  frDrawTraced(S,P,t0,{wk:.65,wpow:1,wmin:.8,lumw:[.9,.7,2],tipx:[14,.6,.2],taper:.3,lumv:lv,lum:1,hot:.35,sway:.1});
  for(const x of FR_FEATHERS)frEvent(S,'tronc',x/941,t0);
  frEvent(S,'branca',.4,t0+.7*k);frEvent(S,'branca',1.3,t0+.9*k);for(let i=0;i<5;i++)frEvent(S,'fulla',.2+i*.33,t0+(1.4+i*.3)*k);}]};

// ── 17 · Serralades ───────────────────────────────────────────────────────────────────────────────────────────────────────
// The outline of a mountain range is rough at every scale: a stretch of a few hundred metres has the same kind of jaggedness as the
// whole range, in proportion (it is self-affine, with a fractal dimension of the profile of about 1.1–1.3), because uplift and
// erosion work alike at all scales; and the ridges branch as the valleys between them do, each spur shedding smaller spurs (Mandelbrot,
// 1982; Turcotte, 1997; Rodríguez-Iturbe & Rinaldo, 1997). Concept 17: ranges one behind another, blue far away through violet and
// magenta to pink and gold near by. The network is traced from the concept (FR_TR_SERRA): it grows from each summit, the farthest
// first, along its crest down both sides; then the spurs leave the crests, and the smaller spurs leave them.
const FR_SERRA_X=[170,607,1244,463,1186,922,123,1593];
export const FR_SERRA={id:'serra',name:'Serralades',what:'les carenes de les muntanyes, els contraforts i els petits esperons',
 pal:['#5a9cff','#9a72ff','#e048e8','#ff5aa0','#ffd030'],pal2:['#50d0ff','#7a7cff','#c858ff','#ff5878','#ffb428'],
 look:{bloom:.18,glow:1.3,halo:.2,core:.9,tubeW:3,tubeP:2,spread:.3,minW:.6,gsat:1.5,sat:1.1,white:1.7,exp:1.3},wind:0,
 acts:[(S,t0)=>{const k=S.k;frDrawTraced(S,frTraced(FR_TR_SERRA),t0,{wk:.8,wpow:1,wmin:.6,lumw:[.7,.8,2.5],tipx:[10,.5,.2],taper:.4,lumv:[.8,1.2,.25],lum:1,hot:.5,sway:0});
  FR_SERRA_X.forEach((x,i)=>frEvent(S,'tronc',x/941,t0+i*.28*k));
  frEvent(S,'branca',.5,t0+1.2*k);frEvent(S,'branca',1.2,t0+1.8*k);for(let i=0;i<5;i++)frEvent(S,'fulla',.2+i*.33,t0+(1.9+i*.35)*k);}]};

// ── 18 · Arrels ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// A root system branches again and again, each root sending out finer roots that branch in their turn, down to root hairs a fraction
// of a millimetre wide: the same pattern at every scale, which packs an enormous length of absorbing surface into the soil (the
// root systems of plants have fractal dimensions of about 1.4–1.8 in a plane; Fitter & Stickland, 1992; Tatsumi, Yamauchi & Kono,
// 1989; Lynch, 1995). Concept 18: five root systems hanging from the top, gold at the collar, orange, then pink towards the tips.
// The network is traced from the concept (FR_TR_ARRELS): the main roots grow down first, the laterals leave them as they pass, and
// the finest rootlets last.
const FR_ARRELS_X=[257,464,843,1221,1450];
export const FR_ARRELS={id:'arrels',name:'Arrels',what:'les arrels principals, les laterals i les arrels més fines',
 pal:['#ff40c8','#ff5cac','#ff8070','#ffa448','#ffd450'],pal2:['#e070ff','#ff70d8','#ff7a68','#ff9c40','#ffe468'],
 look:{bloom:.18,glow:1.2,halo:.18,core:.75,tubeW:1.3,tubeP:3,spread:.3,minW:.45,gsat:1.5,sat:1.1,white:2.5,exp:1.3},wind:.002,
 acts:[(S,t0)=>{const k=S.k;frDrawTraced(S,frTraced(FR_TR_ARRELS),t0,{wk:.7,wpow:1,wmin:1,lumw:[.9,.8,2.5],tipx:[6,.4,.3],taper:.4,fork:[10,.2,1,.6,.95],lumv:[.6,1,.5],lum:1,hot:.5,sway:.1});
  FR_ARRELS_X.forEach((x,i)=>frEvent(S,'tronc',x/941,t0+i*.1*k));
  frEvent(S,'branca',.5,t0+.9*k);frEvent(S,'branca',1.3,t0+1.3*k);for(let i=0;i<5;i++)frEvent(S,'fulla',.2+i*.33,t0+(1.6+i*.35)*k);}]};

// ── 19 · Petxina de triangles ─────────────────────────────────────────────────────────────────────────────────────────────
// A shell grows only at its lip, adding a band of new shell at a time, so its pattern is laid down line by line, like a printer's:
// along the lip, a pigment that excites its own making and a slower substance that stops it (an activator and an inhibitor) switch
// cells on and off, and the record of those switchings, band after band, is a field of triangles of every size, a big one holding
// smaller ones as in the cone shells (Meinhardt & Klingler, 1987; Meinhardt, 1995). Concept 19: a cone shell drawn as a lattice of
// cream lines, each cell holding nested triangles, orange outside and tan within. The lattice and the rings are traced from the
// concept (tools/fractals-petxina.py: FR_TR_PETXINA): the lattice grows from the apex (the oldest part of the shell) towards the
// lip, and in each cell, once the lattice has closed round it, its triangles appear from the outside in.
export const FR_PETXINA={id:'petxina',name:'Petxina de triangles',what:'la xarxa de la closca i els triangles dins de triangles',
 pal:['#f06a00','#d8b488','#ff8c14','#ffbc50','#fff8cc'],pal2:['#f03a50','#e8b0b8','#ff5878','#ffa8a0','#fff4ee'],
 look:{bloom:.26,glow:1.7,halo:.32,core:.6,tubeW:7,tubeP:2,spread:.3,minW:.6,gsat:1.25,sat:1.05,white:2.4,exp:1.2},wind:0,
 acts:[(S,t0)=>{const k=S.k;frDrawTraced(S,frTraced(FR_TR_PETXINA),t0,{wk:.9,wpow:1,wmin:1.2,lum:1,hot:.6,sway:0,under:[0,2.6,.14,-.45,.95]});
  frEvent(S,'tronc',1645/941,t0);frEvent(S,'tronc',1200/941,t0+.9*k);frEvent(S,'tronc',500/941,t0+2*k);
  for(let i=0;i<6;i++)frEvent(S,i%2?'branca':'fulla',.2+i*.27,t0+(1.6+i*.45)*k);}]};

// ── 20 · Dent de lleó ─────────────────────────────────────────────────────────────────────────────────────────────────────
// The seed head of a dandelion is a sphere of fruits, each an achene on a long beak crowned by a pappus, a parachute of some hundred
// bristles; and each bristle bears finer barbs. Beaks radiating from the centre, bristles radiating from the top of each beak, barbs
// along each bristle: a branching repeated at three scales, and so light that the seed flies on the wind, held up by a ring of air
// that the bristles, spaced just so, keep spinning above the pappus (a separated vortex ring; Cummins et al., 2018). Concept 20: a gold
// stem from the bottom left to a head of about forty-five white pappi on gold beaks, and eight seeds flying away to the right, each a
// gold achene, its beak and its pappus. The stem is drawn here, from the ground up; the head and the seeds are traced from the concept
// (FR_TR_DENT): from the centre the beaks grow out, then each pappus opens its bristles and their barbs; then, one after another, the
// seeds that the wind has taken grow from the achene along the beak to their pappus.
const FR_DENT_STEM=[360,941,364,900,374,850,384,800,396,750,408,700,423,650,439,600,452,560,467,520,478,490,486,462];
// the hubs of the pappi (where their bristles leave the beak; the brightest points of the concept), [x, y, size]
const FR_DENT_HUBS=[[642,646,1],[297,669,1],[235,189,1],[1272,524,1.2],[241,476,1],[824,319,1],[136,343,1],[761,184,1],[1528,135,1.1],
 [858,435,1],[797,565,1],[512,91,1],[459,249,.9],[490,750,1],[580,147,.9],[403,153,.9],[85,501,.9],[587,263,.9],[683,230,.9],[943,513,.9],
 [827,692,.9],[1432,741,1],[576,808,.9],[354,58,.9],[682,76,.9],[688,367,.9],[104,625,.9],[310,359,.8],[225,303,.8],[326,234,.8],[693,487,.8],
 [910,586,.8],[972,388,.8],[539,657,.8],[687,799,.8],[946,268,.8],[770,749,.8],[365,298,.8],[910,181,.8],[357,458,.7],
 [326,563,.7],[134,723,.7],[261,93,.7],[1219,217,.7],[758,427,.7],[384,652,.7],[484,601,.6],[764,502,.6],[791,125,.6],[1043,114,.5],
 [975,790,.5],[1602,374,.5],[1623,600,.5]];
let FR_DENT_HT=null,FR_DENT_P=null;
// the white lines brightest at their hub and dimmer out towards the tips of the bristles, as in the concept (each path's brightness by
// the distance of its middle from the nearest hub; the gold beaks keep the brightness they have in the picture)
function frDentLum(P){if(FR_DENT_P)return FR_DENT_P;FR_DENT_P=P.map(p=>{const n=p.w.length,m=n>>1;let cm=0;for(let i=0;i<n;i++)cm+=p.c[i];if(cm/n<.7)return p;
 const x=p.pts[m*2],y=p.pts[m*2+1];let d=1e9;for(const [hx,hy,z] of FR_DENT_HUBS)d=Math.min(d,Math.hypot(x-hx,y-hy)/z);
 // and the bristles wider as they leave their hub, where they crowd into one bright point
 const w=Float32Array.from(p.w,(v,i)=>{let e=1e9;for(const [hx,hy,z] of FR_DENT_HUBS)e=Math.min(e,Math.hypot(p.pts[i*2]-hx,p.pts[i*2+1]-hy)/z);return v*(1+.9*Math.max(0,1-e/24));});
 return {...p,w,b:Math.max(.55,1-.45*Math.min(1,Math.max(0,d-8)/85))};});return FR_DENT_P;}
// the moment the tracing reaches each hub
function frDentHubT(P){if(FR_DENT_HT)return FR_DENT_HT;FR_DENT_HT=FR_DENT_HUBS.map(([x,y])=>{let t=1e9;
 for(const p of P)for(let i=0;i<p.w.length;i++){const dx=p.pts[i*2]-x,dy=p.pts[i*2+1]-y;if(dx*dx+dy*dy<144&&p.ts[i]<t)t=p.ts[i];}return t<1e9?t:2;});return FR_DENT_HT;}
const FR_DENT_SEEDS=[[1080,1.9],[1395,2],[1315,2.2],[1188,2.3],[1578,2.4],[940,2.5],[1015,2.6],[1597,2.7]];
export const FR_DENT={id:'dent',name:'Dent de lleó',what:'el capítol, els becs, els plomalls i les seves barbes',
 pal:['#e0aa48','#f2c668','#f6deaa','#eceff6','#ffffff'],pal2:['#e8b050','#f8cc70','#f8e2b4','#eef2f8','#ffffff'],
 look:{bloom:.22,glow:1.6,halo:.28,core:.8,tubeW:2,tubeP:2,spread:.3,minW:.4,gsat:1.3,sat:1,white:2,exp:1.45},wind:.003,
 acts:[(S,t0)=>{const k=S.k;
  frGrow(S,frSpline(FR_DENT_STEM,8).pts,t0,.42*k,{w0:16,w1:11,c0:.04,c1:.16,lum:1,hot:.8,sway:.05,seed:3.6});
  // the glow where the beaks meet, under them
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;frGrow(S,[485,456,485+Math.cos(a)*26,456+Math.sin(a)*26],t0+.38*k,.12*k,{w0:16,w1:6,c0:.3,c1:.15,lum:.55,hot:.3,sway:0});}
  const P=frDentLum(frTraced(FR_TR_DENT)),HT=frDentHubT(P);
  // each hub a point of light, lit as the bristles leave it
  FR_DENT_HUBS.forEach(([x,y,z],j)=>frGrow(S,[x-1,y,x+1,y],t0+HT[j]*k,.1*k,{w0:4.5*z,c0:1,lum:.9,hot:0,sway:.1,seed:j}));
  frDrawTraced(S,P,t0,{wk:.7,wpow:1,wmin:.45,wmax:3,tipx:[8,.5,.2],taper:.4,fork:[7,.35,1,.6,.85],lumv:[1,1,.3],lum:1,hot:.6,sway:.1});
  frEvent(S,'tronc',360/941,t0);frEvent(S,'branca',485/941,t0+.4*k);for(let i=0;i<4;i++)frEvent(S,'fulla',.15+i*.3,t0+(.9+i*.25)*k);
  for(const [x,t] of FR_DENT_SEEDS)frEvent(S,'fulla',x/941,t0+t*k);}]};

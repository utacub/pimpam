// Fractals a la natura (CE46, 0.73) · stimuli 16–20: ploma de paó, serralades, arrels, petxina de triangles, dent de lleó. As in
// fractals-formes1.js: each one follows its concept picture (ChatGPT, 2026-11-11), in its units (1672 × 941), and grows order by order.
import {frEvent,frTraced,frDrawTraced} from './fractals-formes.js';
import {FR_TR_PAO,FR_TR_SERRA} from './fractals-traces.js';

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

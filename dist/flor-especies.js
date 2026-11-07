// La nova Flor de paper (CE02), 0.51 · the twenty real flowers and the five gardens.
// Every flower is a real species, interpreted in paper: the number and the shape of its petals, its colours, its stamens and the way
// it opens follow the plant (most flowers open because the two faces of the petal grow unequally; the lily opens because the edges of
// its tepals grow more than the middle, which ruffles them: van Doorn & van Meeteren 2003, van Doorn & Kamdee 2014, Liang & Mahadevan
// 2011). Units: the radius of the open flower is 1. Angles in radians. A whorl is a ring of petals; each petal is a curved sheet that
// leaves the axis of the flower at an angle phi, bends by curl towards its tip and cups its two edges by cup.
//   n, th0 (start azimuth), len, wid (half width / len), prof {w0 base width, um place of the widest part, tip round|point|blunt|teeth}
//   r0 (base ring), lift (base along the axis), phi/curl/cup/twist/grow: [closed, open], rf {a amplitude, f waves, crumple}
//   col [base, middle, tip] (front), back (optional), marks, delay/stagger/dur (in the opening window, 0..1), order (opening order),
//   sepal (green, behind), fall (drops when the flower opens).
// The colours of the second lap (var) are real colour forms of the same species.

export const FP_D=Math.PI/180;
const fpD=FP_D;

// ── The five gardens ─────────────────────────────────────────────────────────────────────────────────────────────────────────
// key: the root of the piece (MIDI), mode, beat (seconds), metre (beats in a bar), the paper technique and the ambience.
// slots: where the four flowers stand: x and y of the head (fractions of the width and the height), R the radius of the open head
// (fraction of the height), z the depth (0 near, 1 far) and sx where the stem enters at the bottom.
export const FP_GARDENS=Object.freeze([
 {id:'prat',name:'El prat',hour:'matí d’estiu',tech:'crepe',key:62,mode:'major',beat:60/138,metre:6,wall:'#8d8676',ground:'#6f7a4a',
  amb:[['natureRec','meadow',.2],['natureRec','ptCigales',.16]],
  slots:[{x:.27,y:.5,R:.21,z:.25,sx:.3},{x:.55,y:.36,R:.16,z:.55,sx:.52},{x:.79,y:.33,R:.22,z:.35,sx:.83},{x:.09,y:.63,R:.12,z:.15,sx:.07}]},
 {id:'estany',name:'L’estany',hour:'alba',tech:'tissue',key:65,mode:'lydian',beat:60/66,metre:3,wall:'#7b8a90',ground:'#3d5a66',
  amb:[['natureRec','pouLlacuna',.2],['natureRec','brook',.12]],
  slots:[{x:.3,y:.6,R:.2,z:.3,sx:.3},{x:.63,y:.55,R:.17,z:.5,sx:.63},{x:.84,y:.38,R:.18,z:.4,sx:.86},{x:.1,y:.4,R:.16,z:.35,sx:.12}]},
 {id:'bosc',name:'El bosc',hour:'tarda',tech:'card',key:57,mode:'dorian',beat:60/76,metre:4,wall:'#7d7466',ground:'#4a5a3a',
  amb:[['natureRec','pouBosc',.2],['natureRec','wind',.08]],
  slots:[{x:.2,y:.36,R:.3,z:.3,sx:.2},{x:.46,y:.64,R:.13,z:.2,sx:.47},{x:.66,y:.66,R:.11,z:.25,sx:.66},{x:.83,y:.45,R:.2,z:.4,sx:.84}]},
 {id:'nit',name:'El jardí de nit',hour:'lluna',tech:'tissue',key:64,mode:'pent',beat:60/58,metre:4,wall:'#5e6680',ground:'#2f3d48',
  amb:[['natureRec','nit',.2],['natureRec','crickets',.14]],
  slots:[{x:.24,y:.42,R:.2,z:.35,sx:.26},{x:.52,y:.4,R:.19,z:.45,sx:.52},{x:.77,y:.55,R:.17,z:.3,sx:.77},{x:.92,y:.3,R:.14,z:.55,sx:.93}]},
 {id:'hivernacle',name:'L’hivernacle',hour:'pluja càlida',tech:'water',key:67,mode:'mixolydian',beat:60/100,metre:4,wall:'#6f8270',ground:'#3c5236',
  amb:[['natureRec','rain',.18],['natureRec','drops',.12]],
  slots:[{x:.22,y:.45,R:.2,z:.3,sx:.24},{x:.5,y:.56,R:.19,z:.25,sx:.5},{x:.74,y:.36,R:.18,z:.45,sx:.76},{x:.9,y:.6,R:.15,z:.3,sx:.9}]}]);

// ── The species ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
const fpSepals=(n,col,o={})=>({n,th0:o.th0??0,len:o.len??.42,wid:o.wid??.42,prof:{w0:.5,um:.45,tip:o.tip||'point'},lift:-.05,phi:o.phi||[.08,1.9],curl:o.curl||[0,.4],cup:o.cup||[1.1,.3],
 grow:[1,1],col,sepal:true,fall:!!o.fall,delay:0,stagger:0,dur:o.dur??.35,rf:{a:0,f:0}});

export const FP_SPECIES=Object.freeze({
 // Rosella (Papaver rhoeas): two outer and two inner petals, scarlet, crumpled in the bud, with a dark blotch at the base; black
 // stamens around a green capsule with a dark stigma disc. The bud hangs down and straightens before opening; the two hairy sepals fall.
 rosella:{name:'Rosella',sci:'Papaver rhoeas',tech:'crepe',light:'#ff3d24',pool:['#ff2a1a','#ff7a32','#d01848'],tilt:1.3,nod:2.95,
  whorls:[fpSepals(2,['#2f4a1e','#4f7330','#6d8f3c'],{fall:true,len:.5,wid:.5,cup:[1.4,.6]}),
   {n:2,th0:20*fpD,len:.95,wid:.66,prof:{w0:.16,um:.66,tip:'round'},r0:.05,phi:[.04,1.46],curl:[-.5,-.08],cup:[1.25,.3],grow:[.4,1],rf:{a:.05,f:4,crumple:.16},
    col:['#5a0a0e','#d61f1a','#ff4b2e'],back:['#7a1414','#c8281e','#ff6a48'],marks:[{k:'blotch',col:'#16080b',u:.24,edge:'#f2e6d8'},{k:'veins',col:'#8c0f12',n:7,a:.22}],delay:.08,stagger:.12,dur:.62},
   {n:2,th0:110*fpD,len:.88,wid:.64,prof:{w0:.16,um:.64,tip:'round'},r0:.04,phi:[.02,1.36],curl:[-.55,-.06],cup:[1.35,.36],grow:[.38,1],rf:{a:.06,f:4,crumple:.18},
    col:['#4e080c','#c91b18','#ff3f28'],back:['#6e1212','#c02520','#ff5c40'],marks:[{k:'blotch',col:'#16080b',u:.26},{k:'veins',col:'#8c0f12',n:6,a:.22}],delay:.22,stagger:.12,dur:.58}],
  center:{k:'poppy',r:.26,lift:.12},stem:{col:'#4f7a33',w:.035,hair:true},leaves:[{k:'pinnate',at:.55,side:-1,len:.9,lobes:5},{k:'pinnate',at:.8,side:1,len:.75,lobes:4}],
  creature:'abella',var:{col:{1:['#5a1028','#e2557a','#ffb0c0'],2:['#4e1228','#d44a72','#ffa0b6']},pool:['#ff5a8a','#ffb0a0','#e03070'],light:'#ff6a90'}},

 // Nenúfar blanc (Nymphaea alba): many white petals in spirals, larger outside, with a crown of yellow stamens; it floats on its round
 // pad. It opens ring by ring, from the outside in.
 nenufar:{name:'Nenúfar blanc',sci:'Nymphaea alba',tech:'tissue',light:'#fff2d8',pool:['#fff4e0','#ffe28a','#b8e0f0'],tilt:1.12,nod:0,
  whorls:[fpSepals(4,['#2c4b2e','#4f7a4c','#7da26a'],{len:.62,wid:.32,phi:[.05,1.62],cup:[1.2,.35]}),
   {n:8,th0:22*fpD,len:.98,wid:.3,prof:{w0:.32,um:.42,tip:'round'},phi:[.06,1.42],curl:[.15,.1],cup:[1.1,.55],grow:[.6,1],rf:{a:.01,f:2},
    col:['#e8dfc6','#fbf7ee','#ffffff'],back:['#d6dccd','#eef1e8','#ffffff'],marks:[{k:'veins',col:'#c9c2ad',n:5,a:.25}],delay:.05,stagger:.03,dur:.42},
   {n:8,th0:0,len:.82,wid:.3,prof:{w0:.32,um:.42,tip:'round'},phi:[.04,1.1],curl:[.12,.12],cup:[1.15,.6],grow:[.55,1],rf:{a:.01,f:2},
    col:['#efe6cd','#fdfaf2','#ffffff'],marks:[{k:'veins',col:'#cdc6b0',n:5,a:.22}],delay:.28,stagger:.03,dur:.4},
   {n:8,th0:22*fpD,len:.62,wid:.3,prof:{w0:.32,um:.42,tip:'round'},phi:[.02,.72],curl:[.1,.14],cup:[1.2,.7],grow:[.5,1],rf:{a:.01,f:2},
    col:['#f2ead0','#fffbf2','#ffffff'],delay:.5,stagger:.03,dur:.38}],
  center:{k:'stamens',r:.24,lift:.22,col:'#f2b51c',tip:'#ffd84a',n:46},stem:{col:'#3e6b4a',w:.03,water:true},leaves:[{k:'pad',at:0,side:-1,len:1.15},{k:'pad',at:0,side:1,len:.9}],
  creature:'libellula',var:{col:{1:['#d98fa0','#f6d2da','#ffeef2'],2:['#e0a0b0','#f8dce2','#fff2f5'],3:['#e6b0bc','#fae4e8','#fff5f7']},pool:['#ffd0dc','#ffe28a','#f0a8c0'],light:'#ffd8e2'}},

 // Didalera (Digitalis purpurea): a one-sided spike of hanging purple bells, spotted inside, which open from the bottom up.
 didalera:{k:'spike',name:'Didalera',sci:'Digitalis purpurea',tech:'card',light:'#e070d0',pool:['#d050c0','#ff90e0','#8040c0'],tilt:.2,nod:0,
  bells:9,spike:{len:1.9,lean:.12},bell:{n:5,len:.34,wid:.62,prof:{w0:.75,um:.7,tip:'round'},phi:[.04,.3],curl:[0,.62],cup:[1.4,1.05],grow:[.45,1],
   col:['#7a2a76','#c457b4','#e48ad2'],back:['#5e1f5c','#a8449c','#d071c0'],marks:[{k:'spots',col:'#4a0c3a',ring:'#f4e4ee',n:9}]},
  stem:{col:'#4c6b3a',w:.03},leaves:[{k:'ovate',at:.05,side:-1,len:1,wid:.34},{k:'ovate',at:.08,side:1,len:.9,wid:.32},{k:'ovate',at:.25,side:-1,len:.6,wid:.3}],
  creature:'borinot',var:{bellCol:['#b9a8a0','#efe6dc','#ffffff'],pool:['#fff0e6','#f0c0d0','#d8b8e8'],light:'#fff0f0'}},

 // Orquídia (Phalaenopsis): three sepals, two wide petals like wings and the lip (labellum) below, with a yellow callus and spots.
 orquidia:{name:'Orquídia',sci:'Phalaenopsis',tech:'water',light:'#ff80d8',pool:['#ff70d0','#ffd0f0','#a050e0'],tilt:1.42,nod:.5,
  whorls:[{n:3,dirs:[-90,142,38],len:.86,wid:.26,prof:{w0:.3,um:.55,tip:'point'},phi:[.06,1.5],curl:[.4,-.04],cup:[1.2,.12],grow:[.5,1],rf:{a:0,f:0},
    col:['#c22e8e','#ee7ac6','#f8b2de'],back:['#a83a86','#e08ac4','#f4c6e2'],marks:[{k:'veins',col:'#b0207a',n:5,a:.18}],delay:.05,stagger:.08,dur:.55},
   {n:2,dirs:[-162,-18],len:.9,wid:.72,prof:{w0:.22,um:.55,tip:'round'},phi:[.04,1.52],curl:[.5,-.02],cup:[1.3,.1],grow:[.5,1],rf:{a:.02,f:3},
    col:['#b81e86','#f070c4','#ffc0e6'],back:['#a02a7c','#e284c0','#f8cce8'],marks:[{k:'veins',col:'#a8187a',n:9,a:.2}],delay:.3,stagger:.06,dur:.5},
   {n:1,dirs:[90],len:.58,wid:.55,prof:{w0:.35,um:.6,tip:'teeth',teeth:2},phi:[.08,1.15],curl:[.6,.5],cup:[1.4,1.05],grow:[.5,1],rf:{a:.03,f:3},lift:.06,
    col:['#7e0c56','#c21c84','#e04aa2'],marks:[{k:'callus',col:'#ffd23a'},{k:'spots',col:'#5a0636',n:7}],delay:.6,stagger:0,dur:.4}],
  center:{k:'column',r:.12,lift:.1,col:'#fbe9f4'},stem:{col:'#5a6a3a',w:.022,arch:true},leaves:[{k:'broad',at:0,side:-1,len:.95,wid:.4},{k:'broad',at:0,side:1,len:.85,wid:.38}],
  creature:'morfo',var:{col:{0:['#c8a018','#f4d850','#fff0a0'],1:['#c49010','#f2d040','#ffec90'],2:['#8a1a2a','#d0402a','#f08a3a']},pool:['#ffe08a','#fff2c0','#ff9a50'],light:'#ffe6a0'}},

 // ── El prat ──
 // Margarida (Leucanthemum vulgare): a head of 20–30 white ligules (three small teeth at the tip) round a yellow disc of florets in
 // spirals; the ligules unfold in a fan from their curled bud. No colour form: the second lap brings an evening light.
 margarida:{name:'Margarida',sci:'Leucanthemum vulgare',tech:'crepe',light:'#fff3c8',pool:['#fffbe6','#ffe066','#d8f0a0'],tilt:1.28,nod:.3,up:.5,
  whorls:[fpSepals(16,['#3c5a26','#5c7c34','#7a9a44'],{len:.3,wid:.3,phi:[.2,1.45],cup:[.8,.2]}),
   {n:26,th0:0,len:1,wid:.11,prof:{w0:.5,um:.55,tip:'teeth',teeth:3},r0:.27,phi:[.18,1.5],curl:[-.9,.06],cup:[.7,.2],grow:[.45,1],rf:{a:.02,f:2},jit:.04,
    col:['#d8d4c0','#f8f6ee','#ffffff'],back:['#d0d2c4','#ecece4','#f8f8f4'],marks:[{k:'veins',col:'#c8c4b0',n:2,a:.25}],delay:.05,stagger:.016,dur:.55,order:'spiral'}],
  center:{k:'fib',r:.3,lift:.05,col:'#f0b818',inner:'#a07a10',ring:'#7a5a08',pollen:'#ffe060',n:150},stem:{col:'#4f7a33',w:.022},
  leaves:[{k:'lance',at:.25,side:1,len:.55,wid:.18,lobes:5},{k:'lance',at:.5,side:-1,len:.45,wid:.16,lobes:4}],creature:'papallona',
  var:{pool:['#ffd8a0','#ffb060','#ffe8c0'],light:'#ffe0b0'}},
 // Gira-sol (Helianthus annuus): two rings of broad yellow ray florets round a large disc whose florets make the Fibonacci spirals
 // (Swinton et al. 2016); the head lifts and turns to face us, the rays rise and the disc ripens from the edge in.
 girasol:{name:'Gira-sol',sci:'Helianthus annuus',tech:'crepe',light:'#ffbf1a',pool:['#ffb000','#ffe070','#c86a10'],tilt:1.2,nod:.5,up:.45,
  whorls:[fpSepals(18,['#3a5a24','#557a30','#6f9a3c'],{len:.42,wid:.3,phi:[.25,1.5],cup:[.9,.25]}),
   {n:21,th0:0,len:.62,wid:.2,prof:{w0:.35,um:.5,tip:'point'},r0:.46,phi:[.25,1.52],curl:[-.7,.12],cup:[.8,.25],grow:[.5,1],rf:{a:.03,f:3},col:['#c47a08','#f2b414','#ffd84a'],marks:[{k:'veins',col:'#b07008',n:4,a:.25}],delay:.05,stagger:.012,dur:.55,order:'spiral'},
   {n:13,th0:.12,len:.56,wid:.21,prof:{w0:.35,um:.5,tip:'point'},r0:.44,phi:[.2,1.32],curl:[-.7,.1],cup:[.8,.3],grow:[.5,1],rf:{a:.03,f:3},col:['#b86e08','#e8a812','#ffcc3a'],delay:.18,stagger:.012,dur:.5,order:'spiral'}],
  center:{k:'fib',r:.5,lift:.06,col:'#5a3410',inner:'#8a6a1a',ring:'#2a1608',pollen:'#e8b030',n:300},stem:{col:'#4a6e2c',w:.05,hair:true},
  leaves:[{k:'heart',at:.35,side:-1,len:.8,wid:.42},{k:'heart',at:.6,side:1,len:.7,wid:.4}],creature:'borinot',
  var:{col:{1:['#4a1408','#a8381a','#e0702a'],2:['#3e1206','#963018','#d0602a']},pool:['#ff6a20','#ffb060','#a02a10'],light:'#ff8a3a'}},
 // Blauet (Centaurea cyanus): a corona of funnel-shaped florets, each with a toothed open end, round a few small dark ones.
 blauet:{name:'Blauet',sci:'Centaurea cyanus',tech:'crepe',light:'#4c88ff',pool:['#3a6cff','#90b8ff','#7040e0'],tilt:1.3,nod:.25,
  whorls:[fpSepals(10,['#5a6a50','#7a8a68','#9aa888'],{len:.24,wid:.34,phi:[.1,.8],cup:[1.1,.7]}),
   {n:12,th0:0,len:.96,wid:.2,prof:{w0:.1,um:.9,tip:'teeth',teeth:5,ext:.75},r0:.12,phi:[.12,1.22],curl:[-.2,.08],cup:[1.4,1.05],grow:[.4,1],rf:{a:0,f:0},jit:.14,order:'spiral',
    col:['#1a3a9a','#2f62d8','#5a8cff'],back:['#22408a','#3a62c0','#6088e0'],marks:[{k:'veins',col:'#163088',n:3,a:.3}],delay:.08,stagger:.035,dur:.42},
   {n:14,th0:.2,len:.4,wid:.22,prof:{w0:.15,um:.85,tip:'teeth',teeth:3,ext:.6},r0:.05,phi:[.05,.66],curl:[0,.1],cup:[1.3,1],grow:[.4,1],col:['#24124e','#432680','#6646a8'],delay:.5,stagger:.02,dur:.4,order:'spiral'}],
  center:{k:'stamens',r:.12,lift:.12,col:'#3a2a6a',tip:'#b0a0e0',n:16},stem:{col:'#6a8060',w:.018},leaves:[{k:'linear',at:.3,side:-1,len:.6,wid:.08},{k:'linear',at:.55,side:1,len:.5,wid:.08}],creature:'marieta',
  var:{col:{1:['#8a2050','#d0507a','#ff9ab8'],2:['#5a1838','#9a3a60','#c86a8a']},pool:['#ff70a0','#ffb0c8','#c04080'],light:'#ff80a8'}},

 // ── L'estany ──
 // Lotus (Nelumbo nucifera): broad petals, white at the base and pink at the tips, in a deep bowl round the flat-topped receptacle
 // with its ring of yellow stamens; it stands above the water on its stem, beside its round raised leaf.
 lotus:{name:'Lotus',sci:'Nelumbo nucifera',tech:'tissue',light:'#ff8ab4',pool:['#ff7aac','#ffe0ea','#f0d060'],tilt:.85,nod:.2,
  whorls:[fpSepals(3,['#4a6a40','#6a8a5a','#8aa878'],{len:.4,wid:.4,phi:[.06,1.5]}),
   {n:6,th0:0,len:1,wid:.5,prof:{w0:.2,um:.52,tip:'point'},phi:[.04,1.3],curl:[-.1,.05],cup:[1.25,.7],grow:[.55,1],rf:{a:.01,f:2},col:['#f6ead6','#f6c4d4','#e2508a'],back:['#eed2da','#eca4bc','#d84a80'],marks:[{k:'veins',col:'#e090b0',n:9,a:.3}],delay:.04,stagger:.04,dur:.45},
   {n:5,th0:.9,len:.86,wid:.5,prof:{w0:.2,um:.52,tip:'point'},phi:[.03,1.02],curl:[-.1,.05],cup:[1.3,.8],grow:[.5,1],col:['#f8eedc','#f8ccda','#e85e92'],back:['#eed0da','#eaa0ba','#e05a8e'],marks:[{k:'veins',col:'#e090b0',n:9,a:.28}],delay:.28,stagger:.04,dur:.42}],
  center:{k:'receptacle',r:.36,lift:.12,wall:.7,col:'#d8d860',tip:'#ffe060',n:44},stem:{col:'#5a7a4a',w:.03},leaves:[{k:'pad',at:.62,side:1,len:1.25,flat:.42}],creature:'granota',
  var:{col:{1:['#f4f0e6','#faf6ee','#f2e6ee'],2:['#f6f2ea','#fcf8f2','#f4ecf2']},pool:['#fff6ea','#ffe8b0','#f0e0f0'],light:'#fff4e6'}},
 // Lliri groc (Iris pseudacorus): three broad falls that turn down, veined in brown with a darker patch, three small upright standards
 // and three style arms over the falls.
 iris:{name:'Lliri groc',sci:'Iris pseudacorus',tech:'tissue',light:'#ffd21a',pool:['#ffd000','#fff0a0','#a0d040'],tilt:.9,nod:.1,
  whorls:[{n:3,th0:Math.PI/2,len:1,wid:.5,prof:{w0:.18,um:.7,tip:'round'},phi:[.06,1.95],curl:[0,.45],cup:[1.2,.2],grow:[.45,1],rf:{a:.04,f:3},col:['#b88008','#f0c416','#ffe24a'],back:['#c09010','#e8c030','#f8e070'],
    marks:[{k:'veins',col:'#6a4008',n:7,a:.5},{k:'throat',col:'#8a5a08',u:.32}],delay:.05,stagger:.08,dur:.6},
   {n:3,th0:Math.PI/2+Math.PI/3,len:.62,wid:.28,prof:{w0:.2,um:.6,tip:'round'},phi:[.03,.42],curl:[0,-.1],cup:[1.1,.6],grow:[.45,1],col:['#c09010','#f2cc2a','#ffe25a'],delay:.32,stagger:.06,dur:.45},
   {n:3,th0:Math.PI/2,len:.5,wid:.22,prof:{w0:.3,um:.6,tip:'teeth',teeth:2},lift:.05,phi:[.05,1.15],curl:[0,.25],cup:[1,.7],grow:[.45,1],col:['#d0a020','#f8dc50','#fff090'],delay:.45,stagger:.05,dur:.4}],
  center:null,stem:{col:'#4a6a34',w:.026},leaves:[{k:'sword',at:.0,side:-1,len:1.6,wid:.1},{k:'sword',at:.02,side:1,len:1.4,wid:.1},{k:'sword',at:.05,side:-1,len:1.1,wid:.09}],creature:'cavallserp',
  var:{col:{0:['#c0a860','#f0e2a0','#fff4d0'],1:['#c8b070','#f4e8b0','#fff8e0'],2:['#d0c080','#faf0c0','#fffbe8']},pool:['#fff0b0','#fffbe0','#c0e090'],light:'#fff4c0'}},
 // Cala (Zantedeschia aethiopica): one white spathe rolled round a yellow spadix; it unrolls in a spiral and its tip turns back.
 cala:{k:'funnel',name:'Cala',sci:'Zantedeschia aethiopica',tech:'tissue',light:'#f2fff0',pool:['#f0fff4','#ffe870','#a0e0c0'],tilt:1,nod:0,
  spathe:['#9cbc84','#f2f6ec','#ffffff'],throat:'#6a8a4a',spadix:'#f2c41a',
  stem:{col:'#4e7440',w:.03},leaves:[{k:'heart',at:.05,side:-1,len:1.1,wid:.36},{k:'heart',at:.08,side:1,len:.95,wid:.34}],creature:'gotes',
  var:{spathe:['#7a9a50','#dce8c4','#f0f6e4'],pool:['#e0ffd8','#ffe870','#90d070'],light:'#e8ffd8'}},

 // ── El bosc ──
 // Ciclamen (Cyclamen): a nodding flower whose five petals turn right back and up, twisted, magenta with a darker mouth.
 ciclamen:{name:'Ciclamen',sci:'Cyclamen',tech:'card',light:'#ff48a8',pool:['#ff40a0','#ffa0d0','#a040c0'],tilt:2.75,nod:2.95,up:2.85,
  whorls:[{n:5,th0:0,len:1.05,wid:.3,prof:{w0:.25,um:.55,tip:'round'},phi:[.06,2.3],curl:[0,.3],cup:[1.1,.3],twist:[.1,.9],grow:[.45,1],col:['#5a0636','#c8307e','#f088bc'],back:['#6a0a40','#d04088','#f494c4'],
    marks:[{k:'throat',col:'#3a0224',u:.3}],delay:.05,stagger:.06,dur:.65}],
  center:{k:'eye',r:.1,lift:-.02,col:'#2a0218'},stem:{col:'#7a3a3a',leaf:'#3a5a34',w:.016,arch:true},leaves:[{k:'heart',at:.02,side:-1,len:1.2,wid:.45,marble:true,spread:1.38},{k:'heart',at:.03,side:1,len:1.05,wid:.42,marble:true,spread:1.3},{k:'heart',at:.04,side:-1,len:.9,wid:.42,marble:true,spread:.75}],creature:'cargol',
  var:{col:{0:['#a07888','#f0e2ea','#ffffff']},pool:['#fff0f6','#ffc0dc','#e0b0d0'],light:'#fff0f6'}},
 // Violeta (Viola odorata): five unequal petals, two up, two at the sides and a broader lower one with dark lines and a pale throat.
 violeta:{name:'Violeta',sci:'Viola odorata',tech:'card',light:'#9a5cff',pool:['#8040ff','#c0a0ff','#4020a0'],tilt:1.32,nod:1.9,
  whorls:[fpSepals(5,['#3a5a2a','#5a7a40','#7a9a58'],{len:.36,wid:.25}),
   {n:2,dirs:[-118,-62],len:.86,wid:.4,prof:{w0:.25,um:.6,tip:'round'},phi:[.05,1.4],curl:[-.2,-.15],cup:[1.1,.25],grow:[.45,1],col:['#2a0a4a','#5a2296','#7e44c0'],delay:.05,stagger:.1,dur:.5},
   {n:2,dirs:[160,20],len:.8,wid:.38,prof:{w0:.25,um:.6,tip:'round'},phi:[.04,1.42],curl:[-.2,-.1],cup:[1.1,.3],grow:[.45,1],col:['#2e0c50','#6026a0','#8448c8'],marks:[{k:'throat',col:'#f0e8f8',u:.22}],delay:.28,stagger:.1,dur:.48},
   {n:1,dirs:[90],len:.88,wid:.5,prof:{w0:.25,um:.6,tip:'round'},lift:.02,phi:[.04,1.45],curl:[-.2,-.05],cup:[1.1,.3],grow:[.45,1],col:['#2a0a48','#5c249a','#8244c4'],marks:[{k:'throat',col:'#f4ecfa',u:.3},{k:'veins',col:'#1a0430',n:7,a:.6}],delay:.5,stagger:0,dur:.45}],
  center:{k:'eye',r:.07,lift:.04,col:'#f0d040'},stem:{col:'#4a6a34',w:.014,arch:true},leaves:[{k:'heart',at:.02,side:-1,len:1,wid:.5,spread:1.35},{k:'heart',at:.04,side:1,len:.9,wid:.48,spread:1.3}],creature:'papallonaMarro',
  var:{col:{1:['#9890a8','#ece8f2','#ffffff'],2:['#a098b0','#f0ecf6','#ffffff'],3:['#9088a0','#eae6f0','#ffffff']},pool:['#f4f0ff','#e0d8ff','#c0b0e0'],light:'#f4f0ff'}},
 // Peònia (Paeonia officinalis, wild in the Catalan mountains): a large bowl of many crêpe petals that opens layer by layer, magenta
 // red round a crown of yellow stamens.
 peonia:{name:'Peònia',sci:'Paeonia officinalis',tech:'crepe',light:'#ff3a6c',pool:['#ff3060','#ff90a8','#ffd040'],tilt:1.0,nod:.2,
  whorls:[fpSepals(5,['#3a5428','#557038','#6f8a48'],{len:.42,wid:.42}),
   {n:8,th0:0,len:1,wid:.62,prof:{w0:.2,um:.62,tip:'round'},phi:[.05,1.25],curl:[-.4,-.05],cup:[1.3,.55],grow:[.45,1],rf:{a:.07,f:5},col:['#6a0828','#cc1c52','#ff5a84'],back:['#741030','#c42a58','#ff6a8e'],marks:[{k:'veins',col:'#8a0a34',n:7,a:.22}],delay:.04,stagger:.04,dur:.45},
   {n:7,th0:.42,len:.84,wid:.62,prof:{w0:.2,um:.62,tip:'round'},phi:[.04,.95],curl:[-.4,.02],cup:[1.35,.7],grow:[.45,1],rf:{a:.09,f:5},col:['#70092c','#d42458','#ff6890'],back:['#7a1236','#cc305e','#ff7096'],delay:.26,stagger:.03,dur:.42}],
  center:{k:'stamens',r:.34,lift:.1,wall:.62,col:'#f0c020',tip:'#ffe060',n:70},stem:{col:'#4a6a34',w:.03},leaves:[{k:'lance',at:.4,side:-1,len:.75,wid:.18,lobes:3},{k:'lance',at:.6,side:1,len:.65,wid:.18,lobes:3}],creature:'merla',
  var:{col:{1:['#9a3a5e','#e888a6','#ffc4d6'],2:['#a04064','#ee92ae','#ffccdc']},pool:['#ff90b8','#ffd0e0','#ffe080'],light:'#ffa0c0'}},

 // ── El jardí de nit ──
 // Flor de lluna (Ipomoea alba): a white funnel with five folds; it opens at dusk, unrolling and turning like a paper umbrella.
 lluna:{name:'Flor de lluna',sci:'Ipomoea alba',tech:'tissue',light:'#e6f2ff',pool:['#e0f0ff','#fffbe0','#b0d0ff'],tilt:1.3,nod:.4,
  whorls:[fpSepals(5,['#4a6a40','#6a8a58','#8aa870'],{len:.24,wid:.3}),
   {n:5,th0:-Math.PI/2,len:.95,wid:.8,prof:{w0:.1,um:.6,tip:'blunt'},phi:[.03,1.42],curl:[0,.05],cup:[1.3,.22],twist:[1.3,0],spin:[1.1,0],grow:[.55,1],rf:{a:.02,f:2},
    col:['#cfe0c0','#f4f8ee','#ffffff'],back:['#c0d4b4','#e8f0e0','#f8fbf4'],marks:[{k:'veins',col:'#d8e8c4',n:1,a:.8}],delay:.05,stagger:0,dur:.85}],
  center:{k:'tube',r:.18,lift:-.05,col:'#c8dca0'},stem:{col:'#4a6a3a',w:.016,arch:true},leaves:[{k:'heart',at:.4,side:-1,len:.6,wid:.42},{k:'heart',at:.65,side:1,len:.55,wid:.42}],creature:'arna',
  var:{pool:['#d8e4ff','#fff0d0','#c0c8ff'],light:'#dce6ff'}},
 // Lliri blanc (Lilium candidum): a trumpet of six white tepals whose edges ruffle as they grow and whose tips turn back (Liang &
 // Mahadevan 2011); long stamens with golden anthers.
 lliri:{name:'Lliri blanc',sci:'Lilium candidum',tech:'tissue',light:'#fffae6',pool:['#fff8e0','#ffe080','#e0e8ff'],tilt:.85,nod:.4,
  whorls:[{n:3,th0:0,len:1,wid:.24,prof:{w0:.25,um:.5,tip:'point'},phi:[.03,.62],curl:[-.05,1.35],cup:[1,.42],grow:[.5,1],rf:{a:.06,f:6,grow:true},col:['#d0e0c0','#f8f8f0','#ffffff'],back:['#c8d8b8','#eef2e6','#fafbf6'],marks:[{k:'veins',col:'#dce6cc',n:1,a:.6}],delay:.04,stagger:.04,dur:.75},
   {n:3,th0:Math.PI/3,len:.96,wid:.27,prof:{w0:.25,um:.5,tip:'point'},phi:[.02,.58],curl:[-.05,1.3],cup:[1,.45],grow:[.5,1],rf:{a:.07,f:6,grow:true},col:['#d4e2c4','#fafaf2','#ffffff'],marks:[{k:'veins',col:'#dce6cc',n:1,a:.6}],delay:.1,stagger:.04,dur:.72}],
  center:{k:'lily',r:.06,lift:0,len:.78,col:'#e8a020'},stem:{col:'#4a6a34',w:.024},leaves:[{k:'lance',at:.3,side:-1,len:.5,wid:.12},{k:'lance',at:.45,side:1,len:.45,wid:.12},{k:'lance',at:.6,side:-1,len:.4,wid:.1}],creature:'lluernes',
  var:{pool:['#fff0d0','#ffd080','#ffe8f0'],light:'#fff0d8'}},
 // Camèlia (Camellia japonica, formal double): rounded petals in a perfect spiral that open from the outside in.
 camelia:{name:'Camèlia',sci:'Camellia japonica',tech:'tissue',light:'#ff3044',pool:['#ff2a3a','#ff8a8a','#ffd0a0'],tilt:1.25,nod:.3,
  whorls:[{n:8,th0:0,len:1,wid:.55,prof:{w0:.3,um:.55,tip:'round'},phi:[.08,1.45],curl:[-.2,-.06],cup:[1.1,.3],grow:[.5,1],col:['#6a0812','#c41a2a','#f04a52'],back:['#741018','#c8262e','#f25a5e'],delay:.04,stagger:.025,dur:.4},
   {n:8,th0:.39,len:.8,wid:.55,prof:{w0:.3,um:.55,tip:'round'},phi:[.06,1.2],curl:[-.2,-.04],cup:[1.15,.35],grow:[.5,1],col:['#700a16','#cc1e2e','#f45458'],delay:.22,stagger:.025,dur:.38},
   {n:8,th0:.2,len:.6,wid:.55,prof:{w0:.3,um:.55,tip:'round'},phi:[.04,.92],curl:[-.2,-.02],cup:[1.2,.45],grow:[.5,1],col:['#760c1a','#d42434','#f65e60'],delay:.4,stagger:.025,dur:.36},
   {n:6,th0:.6,len:.4,wid:.55,prof:{w0:.3,um:.55,tip:'round'},phi:[.03,.6],curl:[-.2,0],cup:[1.25,.6],grow:[.5,1],col:['#7a0e1c','#d82a38','#f86668'],delay:.56,stagger:.025,dur:.34}],
  center:null,stem:{col:'#3a5a2a',w:.022},leaves:[{k:'ovate',at:.35,side:-1,len:.55,wid:.26},{k:'ovate',at:.5,side:1,len:.5,wid:.26},{k:'ovate',at:.7,side:-1,len:.45,wid:.24}],creature:'lluernes',
  var:{col:{0:['#c8c0b8','#f6f2ec','#ffffff'],1:['#ccc4bc','#f8f4ee','#ffffff'],2:['#d0c8c0','#faf6f0','#ffffff'],3:['#d4ccc4','#fbf8f2','#ffffff']},pool:['#fff6f0','#ffe0d0','#e8e0ff'],light:'#fff4ec'}},
 // Gessamí (Jasminum officinale): a branch with clusters of small white five-petalled stars that open one after another.
 gessami:{k:'cluster',name:'Gessamí',sci:'Jasminum officinale',tech:'tissue',light:'#fffaf0',pool:['#fffaf0','#f0e8ff','#ffe8c0'],tilt:1.2,nod:.3,stars:9,
  star:{n:5,len:1,wid:.42,prof:{w0:.25,um:.6,tip:'round'},phi:[.04,1.52],curl:[0,-.05],cup:[1,.15],twist:[.9,0],grow:[.5,1],col:['#e8b8c8','#fbf6f2','#ffffff'],back:['#e0a0b8','#f4e0e8','#fff8fa']},
  stem:{col:'#4a6a34',w:.016},leaves:[{k:'lance',at:.2,side:-1,len:.35,wid:.2},{k:'lance',at:.4,side:1,len:.3,wid:.2},{k:'lance',at:.6,side:-1,len:.3,wid:.2}],creature:'lluernes',
  var:{pool:['#fff0f4','#ffe0ec','#ffe8c8'],light:'#fff2f6'}},

 // ── L'hivernacle ──
 // Hibisc (Hibiscus rosa-sinensis): five broad overlapping petals that unroll in a spiral, a dark eye, and the long column of stamens
 // with five red stigmas at its end.
 hibisc:{name:'Hibisc',sci:'Hibiscus rosa-sinensis',tech:'water',light:'#ff2a3c',pool:['#ff2030','#ff9a50','#ffd040'],tilt:1.05,nod:.35,yaw:.55,
  whorls:[fpSepals(5,['#3a5a28','#557a38','#6f9a48'],{len:.3,wid:.32}),
   {n:5,th0:0,len:1,wid:.68,prof:{w0:.16,um:.62,tip:'round'},phi:[.04,1.42],curl:[-.2,-.05],cup:[1.25,.25],twist:[1.1,.05],spin:[.75,0],grow:[.5,1],rf:{a:.05,f:4},
    col:['#8a0a1c','#f02a38','#ff7060'],back:['#801020','#e03a46','#ff7a6a'],marks:[{k:'throat',col:'#4a0010',u:.3},{k:'veins',col:'#a0101e',n:9,a:.25}],delay:.05,stagger:0,dur:.75}],
  center:{k:'column',r:.065,lift:0,len:1.1,col:'#ff5a50',pollen:'#ffd02a',hib:true},stem:{col:'#3e5a2c',w:.022},leaves:[{k:'ovate',at:.4,side:-1,len:.55,wid:.3,serr:.25},{k:'ovate',at:.6,side:1,len:.5,wid:.3,serr:.25}],creature:'colibri',
  var:{col:{1:['#b05a06','#f4ae1a','#ffd860']},pool:['#ffb020','#ffe070','#ff6020'],light:'#ffb43a'}},
 // Passiflora (Passiflora caerulea): ten flat white pieces (five sepals and five petals), the corona of banded filaments (purple,
 // white, blue) and the central structure with five anthers and three stigmas.
 passiflora:{name:'Passiflora',sci:'Passiflora caerulea',tech:'water',light:'#5a8cff',pool:['#4a80ff','#d0c0ff','#a040e0'],tilt:1.3,nod:.4,
  whorls:[{n:5,th0:0,len:1,wid:.24,prof:{w0:.3,um:.5,tip:'round'},phi:[.08,1.55],curl:[-.3,0],cup:[1.1,.3],grow:[.5,1],col:['#a8c0a8','#e8f0ea','#f8fbf8'],back:['#6a8a60','#9ab088','#b8c8a8'],delay:.05,stagger:.03,dur:.45},
   {n:5,th0:Math.PI/5,len:.94,wid:.24,prof:{w0:.3,um:.5,tip:'round'},phi:[.06,1.52],curl:[-.3,0],cup:[1.1,.3],grow:[.5,1],col:['#c8d4d0','#f2f6f4','#ffffff'],delay:.2,stagger:.03,dur:.42}],
  center:{k:'corona',r:.72,lift:.04,n:96},stem:{col:'#4a6a34',w:.016},leaves:[{k:'palm',at:.4,side:-1,len:.55,wid:.4},{k:'palm',at:.6,side:1,len:.5,wid:.4}],creature:'fusteria',
  var:{center:{white:true},pool:['#f0f4ff','#ffffff','#d8e0ff'],light:'#eef2ff'}},
 // Ocell del paradís (Strelitzia reginae): a green-purple beak from which the orange sepals rise one after another, with the blue
 // arrow of the petals.
 strelitzia:{k:'bird',name:'Ocell del paradís',sci:'Strelitzia reginae',tech:'water',light:'#ff8a1a',pool:['#ff7a10','#ffc040','#3a70ff'],tilt:1,nod:0,
  sepals:['#c84a08','#ff8a1a','#ffc04a'],tongue:['#1a3aa0','#3a6ae0','#7aa0ff'],beak:['#2a4a2a','#5a7a40','#8a3a6a'],
  stem:{col:'#4a6a3a',w:.03},leaves:[{k:'paddle',at:.05,side:-1,len:1.1,wid:.26},{k:'paddle',at:.08,side:1,len:1,wid:.24}],creature:'gotes',
  var:{sepals:['#b88a08','#f2c830','#ffe070'],pool:['#ffd030','#fff0a0','#3a70ff'],light:'#ffd440'}}
});

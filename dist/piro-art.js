// The twenty shows of Piromusical (CE24). Each is a plan of shells on its visual events (at: the event, dt: a small delay in seconds),
// drawn by firework.js; x runs across from the middle of the screen and y up from the ground (1 is about the height of the sky).
// Colours are slots in the palette of the round, so each new round lights the same show in other colours.

// Firework colours: bright and clean, no saturated red (no colour has more than four fifths of its light in the red channel).
const PC={red:'#ff4d5e',coral:'#ff7a5c',orange:'#ff9b2f',amber:'#ffb72e',gold:'#ffd447',lemon:'#fff27a',lime:'#b6ff5c',green:'#4dff8a',mint:'#7dffd4',
 aqua:'#4ff2ff',sky:'#5ec8ff',blue:'#5a86ff',violet:'#a070ff',purple:'#c95cff',magenta:'#ff52d9',pink:'#ff94d1',rose:'#ffbfe0',white:'#fff6e8',silver:'#e8efff'};
const P_RAINBOW=[PC.red,PC.orange,PC.gold,PC.green,PC.aqua,PC.blue,PC.purple];
// A shell rising on its rocket, and a piece on the ground.
const Pb=(kind,at,x,y,o={})=>({kind,at,x,y,rise:.7,...o});
const Pg=(kind,at,x,o={})=>({kind,at,x,...o});
// The same shell on both sides of the screen, mirrored.
const Ppair=(kind,at,x,y,c1,c2,o={})=>[Pb(kind,at,-x,y,{...o,c:c1}),Pb(kind,at,x,y,{...o,c:c2,rot:-(o.rot??0),salt:(o.salt??7)+3})];

export const PIRO_ART=Object.freeze([
 // 1 · Palmeres de llum: palms open in a fan and droop, ground mines answer, and a great willow closes the show.
 {hits:[0,2,4,6,9,12],land:'hills',pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.orange,PC.violet],[PC.amber,PC.sky,PC.pink,PC.green,PC.coral,PC.purple],[PC.lemon,PC.purple,PC.mint,PC.coral,PC.gold,PC.blue]],
  shells:[Pb('palm',0,0,.62,{c:0}),...Ppair('palm',1,.42,.56,1,2),Pg('mine',2,-.26,{c:[3,4]}),Pg('mine',2,.26,{c:[4,3],salt:9}),
   Pb('palm',3,0,.7,{r:.27,c:0,n:12}),Pb('small',3,-.5,.45,{c:1,dt:.25}),Pb('small',3,.5,.45,{c:2,dt:.25}),
   ...Ppair('palm',4,.5,.6,3,4),Pb('ring',4,0,.66,{r:.14,c:5,tilt:1}),
   Pb('willow',5,0,.72,{r:.28,c:1,life:3.9}),...Ppair('palm',5,.45,.56,2,3,{n:9})]},
 // 2 · Peònies de colors: round peonies of every colour open from left to right, then a double peony with a ring.
 {hits:[0,2,4,6,8,10,13],moon:[-.7,.86,.045],pal:[[PC.red,PC.orange,PC.gold,PC.green,PC.sky,PC.purple],[PC.pink,PC.lemon,PC.mint,PC.aqua,PC.violet,PC.coral],[PC.magenta,PC.amber,PC.lime,PC.blue,PC.rose,PC.aqua]],
  shells:[Pb('peony',0,-.5,.55,{c:0}),Pb('peony',1,-.17,.66,{c:1}),Pb('peony',2,.17,.66,{c:2}),Pb('peony',3,.5,.55,{c:3}),
   Pb('peony',4,0,.5,{c:4,pistil:0}),Pb('small',4,-.3,.66,{c:5,dt:.2}),Pb('small',4,.3,.66,{c:1,dt:.3}),
   ...Ppair('peony',5,.35,.68,5,0),
   Pb('peony',6,0,.66,{r:.26,n:96,c:[1,2],pistil:3,change:4}),Pb('ring',6,0,.66,{r:.33,c:5,n:60})]},
 // 3 · Crisantems: chrysanthemums with long trails whose stars change colour as they fall.
 {hits:[0,3,5,8,10,13],land:'hills',pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.white,PC.pink,PC.green,PC.sky,PC.amber,PC.purple],[PC.lemon,PC.coral,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pb('chrys',0,0,.64,{c:0,change:1}),Pb('chrys',1,-.45,.58,{c:2,change:3}),Pb('chrys',1,.45,.58,{c:3,change:2,salt:4}),
   Pb('chrys',2,0,.72,{r:.18,c:4,pistil:0}),...Ppair('chrys',3,.3,.5,1,5,{r:.17}),
   Pb('chrys',4,0,.66,{r:.26,c:[0,4],change:5,n:80}),
   Pb('chrys',5,-.5,.6,{c:1,change:2}),Pb('chrys',5,0,.74,{c:2,change:3,salt:8}),Pb('chrys',5,.5,.6,{c:3,change:1,salt:5})]},
 // 4 · Salzes de colors: weeping willows of every colour with golden tails hang over the sky, and glittering crowns.
 {hits:[0,3,6,9,12],land:'hills',sky:['#05031c','#1c1650'],pal:[[PC.magenta,PC.aqua,PC.lime,PC.violet,PC.orange,PC.pink],[PC.sky,PC.pink,PC.gold,PC.green,PC.purple,PC.coral],[PC.lime,PC.purple,PC.coral,PC.aqua,PC.amber,PC.blue]],
  shells:[Pb('willow',0,0,.7,{c:0}),...Ppair('willow',1,.45,.64,1,2),
   Pb('kamuro',2,0,.76,{r:.2,c:3}),Pb('small',2,-.3,.42,{c:4,dt:.3}),Pb('small',2,.3,.42,{c:5,dt:.3}),
   ...Ppair('willow',3,.55,.6,5,0,{r:.2}),Pb('peony',3,0,.55,{r:.15,c:1}),
   Pb('willow',4,0,.74,{r:.3,c:2,life:4}),...Ppair('kamuro',4,.4,.66,3,4,{r:.2})]},
 // 5 · Planetes i anells: rings at every tilt, planets with their rings and two crossed rings.
 {hits:[0,2,5,8,11,13],moon:[.72,.88,.05],pal:[[PC.gold,PC.aqua,PC.magenta,PC.lime,PC.violet,PC.orange],[PC.sky,PC.pink,PC.amber,PC.mint,PC.purple,PC.coral],[PC.lime,PC.purple,PC.aqua,PC.gold,PC.pink,PC.blue]],
  shells:[Pb('saturn',0,0,.64,{c:[0,1],tilt:1.1,rot:.3}),Pb('ring',1,-.45,.6,{c:2,tilt:.3}),Pb('ring',1,.45,.6,{c:3,tilt:.3,salt:5}),
   Pb('saturn',2,-.3,.7,{r:.18,c:[4,5],tilt:1.2,rot:-.4}),Pb('saturn',2,.35,.52,{r:.16,c:[1,2],tilt:1,rot:.5}),
   Pb('ring',3,0,.66,{r:.22,c:0,tilt:1.2,rot:0}),Pb('ring',3,0,.66,{r:.22,c:1,tilt:1.2,rot:Math.PI/2,salt:4}),
   Pb('ring',4,-.5,.58,{c:2,tilt:.9,rot:.6}),Pb('ring',4,0,.74,{c:3,tilt:1.3}),Pb('ring',4,.5,.58,{c:4,tilt:.9,rot:-.6}),
   Pb('saturn',5,0,.66,{r:.27,n:96,c:[2,3],ringC:4,tilt:1.15,rot:.25}),Pb('willow',5,0,.66,{r:.2,c:5,dt:.4})]},
 // 6 · Cors i estrelles: shells that draw hearts, stars, flowers and clovers in the sky.
 {hits:[0,2,5,7,10,13],moon:[-.72,.86,.045],pal:[[PC.pink,PC.gold,PC.lime,PC.aqua,PC.violet,PC.orange],[PC.magenta,PC.lemon,PC.sky,PC.mint,PC.coral,PC.purple],[PC.rose,PC.amber,PC.green,PC.blue,PC.pink,PC.gold]],
  shells:[Pb('shape',0,0,.62,{shape:'heart',c:0}),...Ppair('shape',1,.45,.6,1,1,{shape:'star',rot:.3}),
   Pb('shape',2,0,.68,{shape:'flower',c:2,pistil:1,n:64}),...Ppair('shape',3,.4,.55,0,3,{shape:'heart',r:.15}),
   Pb('shape',4,0,.66,{shape:'clover',c:4}),Pb('small',4,-.42,.72,{c:5,dt:.3}),Pb('small',4,.42,.72,{c:1,dt:.3}),
   Pb('shape',5,0,.64,{shape:'heart',r:.26,n:72,c:0}),Pb('ring',5,0,.64,{r:.34,c:1,n:56}),...Ppair('shape',5,.55,.74,1,2,{shape:'star',r:.12,dt:.35})]},
 // 7 · Cascada de llum: a curtain of falling light opens from the middle, with peonies and rings above it and a golden curtain below.
 {hits:[0,2,4,7,10,13],land:'hills',pal:[[PC.red,PC.orange,PC.gold,PC.green,PC.sky,PC.purple],[PC.pink,PC.amber,PC.lime,PC.aqua,PC.blue,PC.magenta],[PC.coral,PC.lemon,PC.mint,PC.sky,PC.violet,PC.rose]],
  shells:[Pg('cascade',0,0,{y:.6,c:[0,1,2,3,4,5],until:-1,dur:.8}),...Ppair('peony',1,.38,.82,1,4,{r:.14}),
   Pg('fountain',2,-.45,{c:[2,3],h:.24,until:-1,dur:.6}),Pg('fountain',2,.45,{c:[3,2],h:.24,until:-1,dur:.6,salt:6}),
   Pb('peony',3,0,.84,{r:.17,c:4,pistil:0}),Pg('cascade',3,0,{y:.36,x0:-.36,x1:.36,cols:9,c:[2],until:-1,dur:.8,salt:11}),
   ...Ppair('ring',4,.45,.8,5,0,{r:.13,tilt:.4}),
   Pb('kamuro',5,0,.84,{r:.22,c:1}),...Ppair('small',5,.55,.72,2,3,{dt:.3})]},
 // 8 · Rodes de foc: Catherine wheels turn slowly over the town, throwing sparks of three colours, under peonies and a ring.
 {hits:[0,3,6,9,12],land:'town',pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.orange,PC.violet],[PC.amber,PC.pink,PC.sky,PC.green,PC.coral,PC.purple],[PC.lemon,PC.violet,PC.mint,PC.orange,PC.rose,PC.blue]],
  shells:[Pg('wheel',0,0,{y:.42,c:[0,1,2],until:-1,dur:.9}),Pg('wheel',1,-.5,{y:.32,c:[3,4,5],dir:-1,until:-1,dur:.9}),Pg('wheel',1,.5,{y:.32,c:[1,3,5],until:-1,dur:.9,salt:5}),
   Pb('peony',2,0,.76,{r:.18,c:0}),...Ppair('small',2,.4,.7,2,4,{dt:.3}),
   Pg('wheel',3,-.28,{y:.62,c:[2,4],R:.04,until:-1,dur:.9}),Pg('wheel',3,.28,{y:.62,c:[4,2],R:.04,dir:-1,until:-1,dur:.9,salt:8}),
   Pb('ring',4,0,.7,{r:.28,c:1,n:60}),Pb('chrys',4,0,.7,{r:.16,c:2})]},
 // 9 · Fonts que ballen: seven fountains light up from the middle outwards and rise and fall like dancing water; peonies crown them.
 {hits:[0,2,4,6,8,10,12],land:'town',pal:[[PC.aqua,PC.pink,PC.gold,PC.lime,PC.violet,PC.orange],[PC.sky,PC.magenta,PC.amber,PC.mint,PC.purple,PC.coral],[PC.mint,PC.rose,PC.lemon,PC.blue,PC.magenta,PC.gold]],
  shells:[Pg('fountain',0,0,{c:[0],h:.5,dance:.22,until:-1,dur:1.4}),Pg('fountain',1,-.2,{c:[1],h:.44,dance:.22,until:-1,dur:1.4}),Pg('fountain',1,.2,{c:[1],h:.44,dance:.22,until:-1,dur:1.4,salt:3}),
   Pg('fountain',2,-.4,{c:[2],h:.38,dance:.22,until:-1,dur:1.4}),Pg('fountain',2,.4,{c:[2],h:.38,dance:.22,until:-1,dur:1.4,salt:5}),
   Pg('fountain',3,-.6,{c:[3],h:.32,dance:.22,until:-1,dur:1.4}),Pg('fountain',3,.6,{c:[3],h:.32,dance:.22,until:-1,dur:1.4,salt:7}),
   Pg('mine',4,-.3,{c:[4,5],h:.46}),Pg('mine',4,.3,{c:[5,4],h:.46,salt:9}),Pb('peony',4,0,.8,{c:5}),
   ...Ppair('peony',5,.45,.76,1,2),Pb('peony',6,0,.8,{r:.25,n:90,c:[3,4],pistil:0}),Pb('willow',6,0,.8,{r:.18,c:0,dt:.45})]},
 // 10 · Candeles romanes: four Roman candles fire coloured balls in fans that end in little puffs of stars, under peonies and brocade.
 {hits:[0,2,4,6,8,10,13],land:'hills',pal:[[PC.magenta,PC.gold,PC.aqua,PC.lime,PC.orange,PC.violet],[PC.pink,PC.amber,PC.sky,PC.green,PC.coral,PC.purple],[PC.rose,PC.lemon,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pg('candle',0,-.16,{c:[0,1,2],shots:6}),Pg('candle',1,.16,{c:[3,4,5],shots:6,salt:3}),
   Pg('candle',2,-.48,{c:[1,3],fan:.26}),Pg('candle',2,.48,{c:[2,4],fan:.26,salt:5}),Pb('peony',3,0,.74,{c:0}),
   Pg('candle',4,-.16,{c:[5,0],shots:5}),Pg('candle',4,.16,{c:[0,5],shots:5,salt:7}),...Ppair('peony',5,.4,.7,1,2),
   Pb('brocade',6,0,.72,{r:.24,c:3}),...Ppair('small',6,.45,.55,4,5,{dt:.3})]},
 // 11 · Creuetes: crossettes split their stars in four, and two comets cross the sky and open into little stars.
 {hits:[0,3,5,8,10,13],moon:[.7,.88,.045],pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.amber,PC.pink,PC.sky,PC.green,PC.purple,PC.coral],[PC.lemon,PC.purple,PC.mint,PC.coral,PC.blue,PC.gold]],
  shells:[Pb('crossette',0,0,.62,{c:0}),...Ppair('crossette',1,.4,.58,1,2,{rot:.3}),
   Pb('comet',2,-.1,.78,{lx:-.6,c:3,split:6,rise:1}),Pb('comet',2,.1,.78,{lx:.6,c:4,split:6,rise:1,salt:5}),
   Pb('crossette',3,0,.72,{r:.2,n:12,c:5}),Pb('small',3,0,.72,{c:0,dt:.15}),
   Pb('crossette',4,-.5,.6,{c:0}),Pb('crossette',4,0,.66,{c:1,salt:4}),Pb('crossette',4,.5,.6,{c:2,salt:6}),
   Pb('crossette',5,0,.66,{r:.22,n:14,c:[3,4]}),Pb('peony',5,0,.66,{r:.12,c:5}),Pb('willow',5,0,.7,{r:.2,c:0,dt:.5})]},
 // 12 · Arc de Sant Martí: seven slow peonies, one of each colour of the rainbow, build an arc; then seven rings open one inside the other.
 {hits:[0,2,4,6,8,10,12,14],land:'hills',pal:[P_RAINBOW,[...P_RAINBOW].reverse(),[PC.pink,PC.coral,PC.lemon,PC.mint,PC.aqua,PC.sky,PC.violet]],
  shells:[...P_RAINBOW.map((_,k)=>{const a=Math.PI*(.88-.76*k/6);return Pb('peony',k,.74*Math.cos(a),.18+.5*Math.sin(a),{r:.11,n:48,c:k,life:4.2,grav:.05,trail:.1});}),
   ...P_RAINBOW.map((_,k)=>Pb('ring',7,0,.46,{r:.07+.036*k,n:24+5*k,c:k,salt:20+k,rise:k?0:.7}))]},
 // 13 · Peixets de llum: over a lake, shells whose stars swim like little fish, mirrored in the water.
 {hits:[0,3,6,9,12],land:'lake',pal:[[PC.aqua,PC.gold,PC.pink,PC.lime,PC.violet,PC.orange],[PC.mint,PC.amber,PC.magenta,PC.sky,PC.purple,PC.coral],[PC.sky,PC.lemon,PC.rose,PC.green,PC.blue,PC.gold]],
  shells:[Pb('fish',0,0,.6,{c:[0,1]}),...Ppair('fish',1,.42,.56,2,3),Pb('peony',2,0,.72,{r:.17,c:4}),...Ppair('fish',2,.3,.5,0,5,{r:.12,dt:.3}),
   Pb('fish',3,-.5,.6,{c:1}),Pb('fish',3,0,.7,{c:2,salt:5}),Pb('fish',3,.5,.6,{c:3,salt:7}),
   Pb('fish',4,0,.64,{r:.26,n:44,c:[5,0]}),Pb('kamuro',4,0,.64,{r:.18,c:1,dt:.4})]},
 // 14 · Dàlies: dahlias of few, big stars that change colour, with pistils and glitter.
 {hits:[0,2,5,8,11,13],moon:[-.74,.88,.05],pal:[[PC.magenta,PC.gold,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.pink,PC.lemon,PC.sky,PC.green,PC.purple,PC.coral],[PC.rose,PC.amber,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pb('dahlia',0,0,.62,{c:0,change:1}),...Ppair('dahlia',1,.42,.58,2,3,{change:1}),
   Pb('dahlia',2,0,.7,{r:.18,c:4,pistil:1}),...Ppair('dahlia',3,.32,.52,5,0,{r:.17,change:2}),
   Pb('dahlia',4,0,.66,{r:.25,n:32,c:[1,3],change:0}),Pb('brocade',4,0,.66,{r:.14,c:1,n:40,dt:.35}),
   Pb('dahlia',5,-.48,.6,{c:2,change:4}),Pb('dahlia',5,0,.72,{c:3,change:5,salt:6}),Pb('dahlia',5,.48,.6,{c:4,change:2,salt:8})]},
 // 15 · Ram de flors: green comets rise like stems and open into flowers, until the sky holds a whole bouquet.
 {hits:[0,2,4,6,9,12],land:'hills',pal:[[PC.green,PC.pink,PC.gold,PC.violet,PC.aqua,PC.orange],[PC.lime,PC.magenta,PC.lemon,PC.purple,PC.sky,PC.coral],[PC.mint,PC.rose,PC.amber,PC.blue,PC.pink,PC.gold]],
  shells:[Pb('comet',0,0,.6,{c:0,lx:0,size:1}),Pb('shape',0,0,.6,{shape:'flower',c:1,pistil:2,rise:0}),
   ...[-1,1].flatMap(sd=>[Pb('comet',1,.35*sd,.52,{c:0,lx:.1*sd,size:1,salt:3+sd}),Pb('shape',1,.35*sd,.52,{shape:'flower',c:sd<0?3:4,pistil:2,rise:0,r:.16,rot:.3*sd,salt:5+sd})]),
   ...[-1,1].flatMap(sd=>[Pb('comet',2,.18*sd,.74,{c:0,lx:.05*sd,size:1,salt:7+sd}),Pb('peony',2,.18*sd,.74,{c:sd<0?5:1,pistil:2,rise:0,r:.15,salt:9+sd})]),
   ...[-1,1].flatMap(sd=>[Pb('comet',3,.5*sd,.62,{c:0,lx:.2*sd,size:1,salt:11+sd}),Pb('shape',3,.5*sd,.62,{shape:'clover',c:sd<0?4:3,rise:0,r:.15,salt:13+sd})]),
   Pb('comet',4,0,.7,{c:0,lx:0,size:1.1}),Pb('shape',4,0,.7,{shape:'flower',r:.26,n:72,c:1,pistil:3,rise:0}),Pb('ring',4,0,.7,{r:.32,c:0,n:56,rise:0}),
   ...[-.42,0,.42].flatMap((x,k)=>[Pb('comet',5,x,k===1?.76:.6,{c:0,lx:x*.3,size:1,salt:15+k}),Pb('shape',5,x,k===1?.76:.6,{shape:'flower',c:[3,5,4][k],pistil:2,rise:0,r:.17,salt:17+k})]),
   Pb('willow',5,0,.7,{r:.22,c:1,dt:.45})]},
 // 16 · Pluja d'estrelles: brocade and glittering crowns let a slow rain of twinkling stars fall over the town.
 {hits:[0,3,6,9,12],land:'town',sky:['#06041e','#1a1a52'],pal:[[PC.gold,PC.aqua,PC.pink,PC.lime,PC.violet,PC.white],[PC.amber,PC.sky,PC.magenta,PC.mint,PC.purple,PC.silver],[PC.lemon,PC.mint,PC.rose,PC.blue,PC.coral,PC.white]],
  shells:[Pb('brocade',0,0,.7,{c:0}),...Ppair('brocade',1,.42,.64,1,2),Pb('kamuro',2,0,.76,{c:3}),...Ppair('small',2,.3,.5,4,5,{dt:.3}),
   ...Ppair('brocade',3,.5,.62,4,0,{r:.18}),Pb('peony',3,0,.56,{r:.14,c:5}),
   Pb('kamuro',4,0,.74,{r:.3,n:76,c:0,life:4.2}),...Ppair('brocade',4,.45,.64,1,2,{r:.18})]},
 // 17 · Espirals: shells whose stars fly out along curved arms and turn slowly, over a wheel that keeps turning.
 {hits:[0,2,5,8,11,13],moon:[.74,.88,.045],pal:[[PC.magenta,PC.aqua,PC.gold,PC.lime,PC.violet,PC.orange],[PC.pink,PC.sky,PC.amber,PC.green,PC.purple,PC.coral],[PC.rose,PC.mint,PC.lemon,PC.blue,PC.magenta,PC.gold]],
  shells:[Pb('spiral',0,0,.62,{c:[0,1,2]}),...Ppair('spiral',1,.42,.58,[3,4],[4,3],{curl:-.2}),Pg('wheel',2,0,{y:.3,c:[0,2,4],until:-1,dur:.9}),
   Pb('spiral',2,0,.74,{r:.18,arms:6,c:[5,1]}),...Ppair('spiral',3,.35,.56,[1,2],[2,1],{r:.17,arms:4}),
   Pb('spiral',4,0,.68,{r:.26,arms:7,n:63,c:[0,1,2,3,4,5,0],curl:.24}),
   Pb('spiral',5,-.48,.6,{c:[2,3]}),Pb('spiral',5,0,.72,{c:[4,5],curl:-.2,salt:6}),Pb('spiral',5,.48,.6,{c:[0,1],salt:8})]},
 // 18 · Mines i cometes: cones of stars shoot up from the ground and comets cross the sky and open into stars.
 {hits:[0,2,4,6,9,12],land:'hills',pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.amber,PC.pink,PC.sky,PC.green,PC.purple,PC.coral],[PC.lemon,PC.rose,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pg('mine',0,0,{c:[0,1]}),Pb('comet',1,.2,.74,{lx:-.65,c:1,split:8,rise:1}),Pb('comet',1,-.2,.74,{lx:.65,c:2,split:8,rise:1,salt:4}),
   Pg('mine',2,-.4,{c:[3,4]}),Pg('mine',2,.4,{c:[4,3],salt:6}),Pb('comet',3,0,.8,{lx:0,c:5,split:10,rise:.9}),Pb('peony',3,0,.8,{r:.14,c:0,rise:0}),
   Pg('mine',4,-.5,{c:[1,2],h:.45}),Pg('mine',4,0,{c:[2,3],h:.55,salt:8}),Pg('mine',4,.5,{c:[3,1],h:.45,salt:10}),
   Pb('comet',4,-.35,.7,{lx:.5,c:4,split:7,rise:1.1}),Pb('comet',4,.35,.7,{lx:-.5,c:5,split:7,rise:1.1,salt:12}),
   ...[-.6,-.3,0,.3,.6].map((x,k)=>Pg('mine',5,x,{c:[k%6,(k+2)%6],h:.4+.06*(2-Math.abs(k-2)),salt:20+k})),Pb('palm',5,0,.7,{c:0})]},
 // 19 · Reflexos al llac: peonies, willows and rings over a lake that mirrors every one of them.
 {hits:[0,3,5,8,10,13],land:'lake',pal:[[PC.pink,PC.gold,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.magenta,PC.amber,PC.sky,PC.mint,PC.purple,PC.coral],[PC.rose,PC.lemon,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pb('peony',0,0,.58,{c:0}),...Ppair('willow',1,.42,.6,1,1,{r:.2}),Pb('ring',2,0,.66,{r:.18,c:2,tilt:.2}),...Ppair('small',2,.25,.48,3,4,{dt:.3}),
   ...Ppair('peony',3,.4,.52,3,4,{pistil:1}),Pb('chrys',4,0,.7,{c:5,change:2}),
   Pb('willow',5,0,.68,{r:.27,c:0,life:4}),...Ppair('peony',5,.45,.56,2,3,{r:.15})]},
 // 20 · Gran final: everything at once, growing to the end: fountains, palms, rings, crossettes, chrysanthemums, brocade, stars and a
 // great golden crown.
 {hits:[0,2,4,6,8,10,12,14],land:'town',pal:[[PC.gold,PC.magenta,PC.aqua,PC.lime,PC.violet,PC.orange],[PC.amber,PC.pink,PC.sky,PC.green,PC.purple,PC.coral],[PC.lemon,PC.rose,PC.mint,PC.blue,PC.magenta,PC.gold]],
  shells:[Pb('peony',0,0,.62,{c:0}),Pg('fountain',0,-.5,{c:[1,2],h:.22,until:-1,dur:1.2}),Pg('fountain',0,.5,{c:[2,1],h:.22,until:-1,dur:1.2,salt:4}),
   ...Ppair('palm',1,.42,.58,1,2),Pb('ring',2,0,.72,{c:3,tilt:1}),...Ppair('crossette',2,.55,.62,4,5,{dt:.3,r:.1}),
   ...Ppair('chrys',3,.3,.66,4,5,{change:0}),Pb('brocade',4,0,.74,{c:0}),Pg('mine',4,-.25,{c:[1,3]}),Pg('mine',4,.25,{c:[3,1],salt:6}),
   ...Ppair('shape',5,.45,.62,1,2,{shape:'star'}),Pb('small',5,0,.5,{c:3,dt:.2}),Pb('saturn',6,0,.68,{c:[3,4],tilt:1.1}),
   Pb('kamuro',7,0,.74,{r:.3,n:76,c:0,life:4.2}),...Ppair('peony',7,.5,.62,1,2),Pb('ring',7,0,.74,{r:.34,c:5,n:64})]}
]);

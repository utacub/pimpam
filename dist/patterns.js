// The twenty palettes of the old ink patterns colour the effects of causa-efecte (causePalette in cause-catalog.js); the names stay as
// the names of the palettes.
const INK_PALETTES=[
 ['#00dfcd','#3984ff','#aa61ff','#ffcb38'],
 ['#13d9f2','#148fc4','#6b58e8','#ff914d'],
 ['#ff5d99','#ab5ef1','#08cbbb','#ffe15b'],
 ['#ff9641','#fa4777','#815af1','#37e2cf'],
 ['#ffd332','#ae65ee','#ff7350','#3bd6e8'],
 ['#ff53ba','#6874f3','#ffb742','#cc68f2'],
 ['#57e68b','#00bda9','#c2ed41','#ffad57'],
 ['#9a62ff','#f55bca','#2cc2f5','#ffdb71'],
 ['#ffb62e','#ff705a','#638ff1','#ffe058'],
 ['#678dff','#20c6ef','#e66bda','#ffd250'],
 ['#a2e132','#20bd83','#ffcd3e','#68dcf0'],
 ['#e354dc','#ff6ca0','#7b81ef','#ffbd35'],
 ['#28d8ff','#059dc7','#a594ff','#b5e94e'],
 ['#ff8a42','#ffd24a','#e8539d','#d2e849'],
 ['#7868f3','#1fa4e4','#d381ed','#ffac66'],
 ['#c2e23a','#43c593','#ffc542','#31d7d0'],
 ['#fa637d','#ff9770','#b771d8','#ffe054'],
 ['#27dbac','#359bdd','#b7e556','#b47bf5'],
 ['#cb55bc','#f675c2','#3baee8','#ffbd62'],
 ['#64ccfa','#ffda62','#778ae8','#25d5ba']
];
const inkDefinitions=[
 ['Filaments vius','filaments','cinc ventalls que se separen i tornen al centre'],
 ['Espiral de nacre','spiral','una doble espiral que es desenrotlla'],
 ['Nus de seda','knot','llaços entrellaçats que es deformen suaument'],
 ['Òrbites de vidre','orbits','anells inclinats amb perles orbitals'],
 ['Ones de marea','waves','bandes horitzontals que s’obren en onades'],
 ['Rosassa de tinta','rosette','una corol·la geomètrica de set lòbuls'],
 ['Cristalls hexagonals','hexagons','una xarxa de cel·les que s’expandeix des del centre'],
 ['Ventall de seda','fan','un ventall asimètric que s’obre i es plega'],
 ['Dos remolins','vortices','dos vòrtexs que s’acosten i s’allunyen'],
 ['Cintes trenades','braid','tres cintes que es creuen com una trena'],
 ['Estrella de neu','snowflake','sis braços ramificats que creixen per etapes'],
 ['Nautilus de llum','nautilus','cambres corbes que despleguen una conquilla'],
 ['Teler circular','torus','un volum anular teixit amb fils que giren'],
 ['Mandala angular','polygons','capes de triangles i quadrats que s’obren en contrapunt'],
 ['Mar de rombes','lattice','una malla ondulada de rombes que respira'],
 ['Anells d’aigua','ripples','cercles que neixen successivament i es fonen'],
 ['Ales de tinta','wings','dos ventalls bilaterals que baten suaument'],
 ['Arbre de corall','coral','branques geomètriques que creixen des de baix'],
 ['Cometes de seda','comets','quatre esteles que recorren un camí quadrilobulat'],
 ['Calidoscopi','kaleidoscope','sis sectors de motius triangulars que es despleguen']
];
const INK_PATTERNS=Object.freeze(inkDefinitions.map(([name,kind,movement],i)=>Object.freeze({id:`ink-${String(i+1).padStart(2,'0')}`,name,kind,movement,palette:INK_PALETTES[i]})));
// The geometry of these flowers is stylised paper art, not a botanical identification key.
const flowerDefinitions=[
 {name:'Lotus de plecs',shape:'point',layers:[12,10,8],width:.16,shrink:.23,move:'layers',palette:['#e8a8b7','#f4cfa1','#fff0c9'],center:.11},
 {name:'Margarida de ventall',shape:'round',layers:[18,18],width:.09,shrink:.18,move:'radial',palette:['#fff0ce','#f7dcae'],center:.2},
 {name:'Rosa en espiral',shape:'curl',layers:[9,8,7,6,5],width:.32,shrink:.16,move:'spiral',palette:['#d97091','#efa7b3','#f7c4c4'],center:.035},
 {name:'Dàlia estrellada',shape:'diamond',layers:[16,16,14,12],width:.12,shrink:.17,move:'turn',palette:['#db9274','#f0b98d','#f9d9a9'],center:.07},
 {name:'Iris de tres ales',shape:'ruffle',layers:[3,3],width:.39,shrink:.26,move:'alternating',palette:['#9e9cde','#d4c1ef','#e8c7a8'],center:.06},
 {name:'Orquídia de seda',shape:'orchid',layers:[5,3],width:.33,shrink:.38,move:'butterfly',palette:['#e8cfeb','#ba92bf','#f1d9ac'],center:.09},
 {name:'Rosella de paper',shape:'crumple',layers:[4,4],width:.57,shrink:.23,move:'cup',palette:['#df806d','#f4a68d'],center:.17},
 {name:'Gira-sol de plecs',shape:'lance',layers:[28,24],width:.075,shrink:.15,move:'sunrise',palette:['#e6b768','#f5d795'],center:.31},
 {name:'Magnòlia de porcellana',shape:'spoon',layers:[9,6],width:.3,shrink:.34,move:'cup',palette:['#f4e6d7','#e5c6c8','#f6d9c7'],center:.07},
 {name:'Nenúfar de cristall',shape:'lance',layers:[12,12,10,8],width:.105,shrink:.17,move:'tide',palette:['#a9d0d4','#d7e5e2','#f6e7c8'],center:.1},
 {name:'Camèlia de volants',shape:'scallop',layers:[7,7,6,5],width:.36,shrink:.2,move:'ripple',palette:['#e3a1a6','#f2c4c2','#f7ded0'],center:.055},
 {name:'Crisantem de cintes',shape:'ribbon',layers:[26,24,20,16],width:.065,shrink:.16,move:'ribbons',palette:['#dbb1d4','#bb9fcf','#f2d4df'],center:.09},
 {name:'Hibisc de cinc plecs',shape:'ruffle',layers:[5],width:.5,shrink:.2,move:'swirl',palette:['#e5a579','#f2c89c','#dc8987'],center:.07,stamen:true},
 {name:'Campanetes de paper',shape:'bell',layers:[6],width:.25,shrink:.2,move:'bells',palette:['#a9b5df','#d8d0ed','#eee1d5'],center:.06},
 {name:'Tulipa desplegable',shape:'tulip',layers:[3,3],width:.35,shrink:.24,move:'tulip',palette:['#e4a1b0','#f4c8bd','#e1b28f'],center:.03},
 {name:'Estrella de cinc pètals',shape:'notch',layers:[5,5],width:.33,shrink:.32,move:'star',palette:['#91bda5','#cce1bb','#ede4ba'],center:.13},
 {name:'Passiflora de fils',shape:'filament',layers:[10,40,36],width:.12,shrink:.16,move:'counter',palette:['#c8bce7','#a6a7da','#ede2cf'],center:.13},
 {name:'Anemone de vellut',shape:'round',layers:[8,8],width:.34,shrink:.16,move:'breath',palette:['#9e9cd2','#c1bbe9','#e3d4e7'],center:.2},
 {name:'Zínnia de mosaics',shape:'tile',layers:[12,12,10,8],width:.21,shrink:.18,move:'tiles',palette:['#e0a383','#f0c39c','#edceb8'],center:.1},
 {name:'Esfera de llavors',shape:'seed',layers:[32],width:.1,shrink:.2,move:'seeds',palette:['#e4dac4','#fff2d4','#bed7d0'],center:.075}
];
const PAPER_PALETTES=[
 ['#f53f91','#ff8b51','#ffdf59'],
 ['#ffffff','#fff0a1','#ffc52d'],
 ['#cd226c','#f3529a','#ff9bc4'],
 ['#fa6d39','#ffa64e','#ffe080'],
 ['#7051e8','#ad7bfa','#ffcf58'],
 ['#d99af5','#9848c5','#ffd976'],
 ['#ef3f45','#ff7559','#ffb16f'],
 ['#ffbf20','#ffdb49','#fff09b'],
 ['#f6fcff','#ffa9cd','#ffc9df'],
 ['#18b8d0','#78e2e6','#e4ffff'],
 ['#14b87c','#71dda9','#ffc65e'],
 ['#a658d7','#d78af4','#f8bce7'],
 ['#f87a37','#ffb856','#ffdf85'],
 ['#5276ea','#9cb5ff','#e0ebff'],
 ['#d941ad','#f37aca','#ffd1e9'],
 ['#2fb95e','#8bd96d','#d4ef63'],
 ['#9a67df','#c59bfa','#ffda6a'],
 ['#506ee2','#92b2ff','#d8e8ff'],
 ['#00bbaa','#6bdfc0','#ffe374'],
 ['#3ccdb1','#a0edd2','#f0fff8']
];
const FLOWER_PATTERNS=Object.freeze(flowerDefinitions.map((p,i)=>Object.freeze({...p,id:`flower-${String(i+1).padStart(2,'0')}`,layers:Object.freeze(p.layers),palette:Object.freeze(PAPER_PALETTES[i])})));
function patternFor(id,index=0){return FLOWER_PATTERNS[((index%20)+20)%20];}
function advancePattern(game){const current=Number.isInteger(game.nextPattern)?game.nextPattern:0;game.pattern=((current%20)+20)%20;game.nextPattern=(game.pattern+1)%20;game.patternActivations=(game.patternActivations||0)+1;game.soundEvent=0;return game.pattern;}
const roots=[48,50,53,55,57,52,48,55,53,50,57,48,52,55,50,53,57,52,48,55];
const chordVoicings=[[0,4,7,14],[0,3,7,12],[0,5,7,12],[0,4,9,12],[0,3,7,14]];
// All onsets are relative to visual progress, so changing duration preserves coordination.
function patternScore(id,index=0){const n=((index%20)+20)%20,root=roots[n]+(id==='flower'?12:0),steps=chordVoicings[n%5],voices=['glass','harp','flute','celesta','velvet'],voice=voices[(n+(id==='flower'?1:0))%5];
 const melody=Array.from({length:6},(_,i)=>steps[(i*(n%3+1)+Math.floor(n/4))%4]+(i%3===0?12:0));
 const positions=[[.02,.16,.29,.43,.58,.73],[.02,.12,.32,.48,.61,.79],[.02,.2,.33,.46,.62,.77],[.02,.18,.36,.49,.65,.8]][n%4];
 const events=[{at:0,midi:[root-12,root+steps[2]],length:.27,level:.045,voice:'velvet'}];
 melody.forEach((step,i)=>events.push({at:positions[i],midi:[root+step],length:.14+(i%2)*.045,level:.085,voice}));
 events.push({at:.41,midi:[root+steps[1],root+steps[2]],length:.22,level:.042,voice:'velvet'});
 events.push({at:.84,midi:[root,root+12],length:.15,level:.04,voice:'glass'});
 return events.sort((a,b)=>a.at-b.at);
}

export {FLOWER_PATTERNS,INK_PATTERNS,advancePattern,patternFor,patternScore};

// Gotes de pintura (CE03; «La nova Pluja de colors» until 0.52.2, renamed in 0.52.3) · the five workshops of marbled paper and their twenty sheets.
// Each workshop has its tradition, its scenery, its music (key, scale, metre, tempo, instruments: all recordings of real
// instruments, nothing held) and four sheets. A sheet says how the first rain is laid out on the water (lay: stones, rows,
// stripes, targets, a spiral, a frame…), which of its colours fall in it (rc), what the stylus or the comb draws, and its own
// two palettes (the second for the second lap). Positions are fractions of the bath (x across, y down).
// Marc, 7 November 2026: «a pluja de colors hi hauria d'haver molta més diversitat de colors i de motius, que no hi hagi quatre
// dibuixos seguits amb els mateixos colors, cada dibuix ha de tenir colors diferents, no es poden repetir en cap cas». So each of
// the 40 sheets of the two laps has a palette of its own (no ink is used twice), and two sheets that follow each other are far
// apart in colour (CIEDE2000; tests/marbre.test.mjs); from the third lap on, the palettes turn round the hue circle (OKLCH).
// The pattern names Turc, Espanyol, Pentinat (nonpareil), Rodet francès (French curl), Cua de paó (peacock), Ram (bouquet) and
// Holandès antic are the classified European patterns (University of Washington Libraries, n.d.; Wolfe, 1990); the rings of
// suminagashi are made by alternating ink and water and are moved by fanning (Carey, 2014). The other names are descriptions.

// the scales as steps from the key: major, phrygian dominant (with the augmented second), the Japanese «in» scale (five notes)
export const MB_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],hijaz:[0,1,4,5,7,8,10],in:[0,1,5,7,8]});
export const mbNote=(key,scale,d)=>{const S=MB_SCALES[scale]||MB_SCALES.major,n=S.length,o=Math.floor(d/n);return key+S[((d%n)+n)%n]+12*o;};

// A pass of the gesture: comb (all tines the same way), gelgit (back and forth: alternate tines the other way), wave (a comb on a
// wavy or zigzag path), diag (a comb drawn on a slant, th degrees), curl (small whirls on a grid), vortex (whirls at points),
// spiral (rings round a centre), rosette (rings round a centre, each the other way), star (strokes from the centre outwards or
// from outside to the centre), path (the stylus following a line: straight through a row of targets, or an S across the bath),
// zig (the stylus from side to side across the stripes: they take its zigzag),
// fan (a breath of wind over the water), rock (a breath on a slant). dir 'h': the tool travels across; 'v': it travels down.
// sp: spacing of the tines, z: how far the ink is carried, w: how wide the pull is (fractions of the bath height).
const mbP=(k,o={})=>Object.freeze({k,...o});
// The two palettes of a sheet: 'water on dark, water on light, inks…' (three to five inks each).
const mbPals=(...ps)=>Object.freeze(ps.map(p=>{const a=p.split(' ').map(x=>'#'+x);return Object.freeze({water:Object.freeze(a.slice(0,2)),inks:Object.freeze(a.slice(2))});}));

export const MB_TALLERS=Object.freeze([
 {id:'barcelona',name:'Barcelona',place:'el taller d’enquadernació',key:57,scale:'major',subs:6,beat:2,sub:.2,arp:[0,1,2,3,4,5],
  inst:{arp:'guitarRec',bass:'dsBaix',mel:'clarinetRec',spark:'violinsPizzRec',gliss:'dsArpa',cad:'harpRec'},perc:{bank:'dsPandereta',hits:[[2,'hit',.12],[4,'hit',.1]]},
  prog:[0,3,4,0,5,3,4,0],tune:[[[0,4,2],[2,2,2],[4,4,2]],[[0,5,3],[3,3,1],[4,1,2]],[[0,4,2],[2,6,2],[4,8,2]],[[0,7,4],[4,4,2]],[[0,5,2],[2,4,2],[4,2,2]],[[0,3,3],[3,5,1],[4,7,2]],[[0,6,2],[2,4,2],[4,1,2]],[[0,0,6]]],
  wall:{tone:'#5a3b24',light:'#8a6040',dark:'#2c1b10',accent:'#b8873f'},air:['natureRec','ptCigales',.05],
  sheets:[
   {id:'turc',name:'Turc',desc:'Pedres grans i petites i, entre elles, vetes fines d’un altre color: el patró europeu més antic.',lay:{k:'mixed'},rc:[0],rm:'veins',
    gesture:[mbP('diag',{th:-32,sp:.3,z:.075,w:.04})],gesture2:[mbP('fan',{axis:'y',amp:.015,wl:.6})],flower:'cor',
    pal:mbPals('0a1030 eef1fa 2f56d0 f2a516 f4ead2 d0506a','140810 faf0f4 c03a62 3fae8a fbe0ea 9a7ad8')},// lapislàtzuli i safrà · granat i jade
   {id:'espanyol',name:'Espanyol',desc:'Pedres de dos colors travessades per ones fines en diagonal.',lay:{k:'scatter',cover:1.4},rc:[0,1],
    gesture:[mbP('rock',{th:35,amp:.045,wl:.2})],gesture2:[mbP('gelgit',{dir:'v',sp:.32,z:.04,w:.03})],flower:'cor',
    pal:mbPals('1c0d07 f8efe4 c8502c 6f9a52 7ec4cf a585d0','06101c eef4fa 3a7cbc f6efd8 e05050 9ad0e8')},// terra de Siena · blau de Prússia
   {id:'pentinat',name:'Pentinat',desc:'Franges verticals que el punxó fa anar i venir i una pinta fina pentina.',lay:{k:'bands',dir:'v',dpn:2},rc:[0,1,2,3],
    gesture:[mbP('gelgit',{dir:'h',sp:.16,z:.12,w:.03}),mbP('comb',{dir:'v',sp:.05,z:.05,w:.012})],gesture2:[mbP('comb',{dir:'v',sp:.05,z:-.03,w:.01})],flower:'cor',
    pal:mbPals('04140f eef7f2 1fa07a ff7f66 e04a9a f6e7b0','0e0c04 fbf8ea f2c230 e0427a 6a4ad8 46b04a')},// maragda, corall i fúcsia · fauve
   {id:'pao',name:'Cua de paó',desc:'Un escaquer de dos colors pentinat que acaba en plomes de paó.',lay:{k:'grid',chk:true},rc:[0,1],
    gesture:[mbP('gelgit',{dir:'v',sp:.14,z:.11,w:.03}),mbP('comb',{dir:'h',sp:.06,z:.05,w:.012}),mbP('wave',{dir:'v',sp:.09,z:.035,w:.02,amp:.045,wl:.18})],gesture2:[mbP('fan',{axis:'x',amp:.015,wl:.5})],flower:'cor',
    pal:mbPals('050a14 eef3f6 d7a52b 1676b8 8d5cc4 9ae0d6','120509 fbf0f2 a8264a e8a0b8 40c8b8 f2e8c8')}]},// paó · robí,
 {id:'istanbul',name:'Istanbul',place:'el taller d’ebru',key:50,scale:'hijaz',subs:9,beat:2,sub:.19,arp:[0,2,4,6,7],
  inst:{arp:'dsArpa',bass:'uduRec',mel:'oboeRec',spark:'dsArpa',gliss:'harpRec',cad:'dsArpa'},perc:{bank:'tamborRec',hits:[[0,'baix',.2],[2,'vora',.1],[4,'mig',.13],[6,'vora',.1],[7,'alt',.08]]},
  prog:[0,1,0,6,0,1,6,0],tune:[[[0,4,2],[2,5,2],[4,4,2],[6,2,3]],[[0,1,4],[4,2,2],[6,1,3]],[[0,0,2],[2,2,2],[4,3,2],[6,4,3]],[[0,6,4],[4,5,2],[6,4,3]],[[0,7,2],[2,8,2],[4,7,2],[6,5,3]],[[0,4,4],[4,5,2],[6,2,3]],[[0,1,2],[2,2,2],[4,1,2],[6,-1,3]],[[0,0,9]]],
  wall:{tone:'#1f5d7a',light:'#e9e2cf',dark:'#123445',accent:'#c7962f'},air:['natureRec','brook',.035],
  sheets:[
   {id:'vora',name:'Pedres amb vora',desc:'Pedres de tres colors amb vora fosca i un traç lliure del punxó en forma d’essa.',lay:{k:'scatter',cover:1.45},rc:[0,1,2],
    gesture:[mbP('path',{curve:'s',z:.15,w:.06})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.6})],flower:'tulipa',
    pal:mbPals('0a0e1c f6f4ee d8452f 2aa6b8 f3f0e6 3a5cc0 4fa860','0e0a06 faf5ec e8e0f8 a3c43a c0408a f08a5a')},// rajola d’Iznik · lilà clar, llima i gerani
   {id:'anada',name:'Anada i tornada',desc:'Files de gotes en diagonal que el punxó travessa amunt i avall.',lay:{k:'diag',th:-28,n:5,dpn:2},rc:[0,1],
    gesture:[mbP('gelgit',{dir:'v',sp:.12,z:.14,w:.03})],gesture2:[mbP('gelgit',{dir:'h',sp:.2,z:.06,w:.03})],flower:'tulipa',
    pal:mbPals('170a12 fbf0ef f0b62b b8306e 7a62d8 f4c6b0','04120e eef8f4 5cc9a4 b07448 f4e3c1 e8506a')},// safrà i magrana · menta i cacau
   {id:'cors',name:'Cadena de cors',desc:'Una filera de dianes de colors: un sol traç del punxó les converteix en cors.',lay:{k:'bull',cs:[[.14,.5],[.38,.5],[.62,.5],[.86,.5]]},rc:[0,1],rm:'same',
    gesture:[mbP('path',{pts:[[-.04,.5],[1.04,.5]],z:.24,w:.06})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.4})],flower:'tulipa',
    pal:mbPals('030b1a eaf2fb 3a8fdc e4e9f2 ff6f8a 9be05a','12060c fcf0f4 e05a8a f6d6e0 5aa0f0 f2b84a')},// nit del Bòsfor · rosa de Damasc
   {id:'tulipa',name:'Tulipa',desc:'Un marc de pedres al voltant i una tulipa gran dibuixada al mig.',lay:{k:'frame',dpn:2},rc:[0,1,2],
    gesture:[mbP('flower',{f:'tulipa',x:.5,y:.56,R:.3})],gesture2:[mbP('gelgit',{dir:'v',sp:.3,z:.03,w:.03})],flower:'tulipa2',
    pal:mbPals('0d150a f3f7ee 43963e e2343c f7d23e f2a7bf','0c0814 f6f2fa ff7a3a d8ef5a 9b6fd0 2ab0a0')}]},// tulipa · taronja, llima i lila,
 {id:'kyoto',name:'Kyoto',place:'el taller de suminagashi',key:52,scale:'in',subs:8,beat:2,sub:.28,arp:[0,2,4,5,6],
  inst:{arp:'harpRec',bass:'dsArpa',mel:'marimbaRec',spark:'marimbaRec',gliss:'dsArpa',cad:'harpRec'},perc:{bank:'woodblockRec',hits:[[6,'claves',.08]]},
  prog:[0,3,2,0,4,3,1,0],tune:[[[0,5,3],[3,4,1],[4,3,4]],[[0,2,4],[4,3,2],[6,1,2]],[[0,2,3],[3,3,1],[4,4,4]],[[0,5,8]],[[0,6,3],[3,5,1],[4,4,2],[6,3,2]],[[0,2,4],[4,1,4]],[[0,2,2],[2,3,2],[4,1,4]],[[0,0,8]]],
  rings:true,
  wall:{tone:'#c9b48a',light:'#efe6d0',dark:'#5b4a32',accent:'#6e8a3c'},air:['natureRec','wind',.03],
  sheets:[
   {id:'anells',name:'Anells',desc:'Anells de tinta i d’aigua al voltant de pocs centres, moguts per un ventall.',lay:{k:'rings'},rc:[0],
    gesture:[mbP('fan',{axis:'x',amp:.025,wl:.8})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.7})],flower:'crisantem',
    pal:mbPals('070a12 f6f3ec e9edf5 5a7fe0 9aa7b8','0a0806 f8f4ea f6f0e4 e3bf5a 7fa8c8')},// plata i indi · paper, or i pissarra
   {id:'ventall',name:'Ventall',desc:'Tres centres d’anells de dos colors que un buf de vent ondula com una tela.',lay:{k:'rings',cs:[[.24,.34],[.74,.3],[.5,.74]]},rc:[0,1],
    gesture:[mbP('fan',{axis:'x',amp:.05,wl:.55}),mbP('fan',{axis:'y',amp:.04,wl:.65})],gesture2:[mbP('fan',{axis:'x',amp:-.03,wl:.4})],flower:'crisantem',
    pal:mbPals('120806 f8f1ea e0603a f3ebe0 a0c860','050e0a f0f6f2 59b38c dfe6f0 c86ab0')},// bengala, arròs i bambú · jade, perla i peònia
   {id:'ondulacio',name:'Ondulació',desc:'Centres en diagonal i el punxó que passa a poc a poc fent ones.',lay:{k:'rings',cs:[[.14,.22],[.38,.42],[.62,.6],[.86,.8]]},rc:[0,2],
    gesture:[mbP('wave',{dir:'h',sp:.3,z:.06,w:.05,amp:.07,wl:.6})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.5})],flower:'crisantem',
    pal:mbPals('0b0816 f4f1f8 a78bd8 cfe8a8 6fc29a','100a06 fbf3ea f0a070 f6e8d8 c04a6a')},// glicina, brot i jade · albercoc
   {id:'roda',name:'Roda',desc:'Un sol centre gran amb anells de tres colors, i el punxó que hi dona voltes, cada vegada en sentit contrari.',lay:{k:'rings',cs:[[.5,.5]]},rc:[0,1,2],rm:'same',
    gesture:[mbP('rosette',{x:.5,y:.5,rings:[.1,.2,.3,.4,.5],z:.12,w:.045})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.6})],flower:'crisantem',
    pal:mbPals('14060c fbf1f4 2aa8d8 f8f0e4 f08aa8','060a12 f0f5fa 9fd4ec f2f6fa 8a6ae0 e9a3c0')}]},// blauet i cirerer · gel,
 {id:'paris',name:'París',place:'el taller de la claraboia',key:53,scale:'major',subs:6,beat:2,sub:.18,arp:[0,2,3,4,5],
  inst:{arp:'dsPiano',bass:'celliPizzRec',mel:'violinsPizzRec',spark:'dsGlock',gliss:'dsPiano',cad:'dsArpa'},perc:{bank:'triangleRec',hits:[[2,'hit',.05],[4,'hit',.04]]},
  prog:[0,4,0,3,1,4,4,0],tune:[[[0,4,2],[2,5,1],[3,4,1],[4,2,2]],[[0,6,2],[2,4,2],[4,1,2]],[[0,2,2],[2,4,2],[4,7,2]],[[0,5,4],[4,3,2]],[[0,1,2],[2,3,2],[4,5,2]],[[0,8,2],[2,6,2],[4,4,2]],[[0,4,2],[2,3,1],[3,2,1],[4,1,2]],[[0,0,6]]],
  wall:{tone:'#d8cfc0',light:'#f3eee4',dark:'#7a6e60',accent:'#3d5f8c'},air:['natureRec','ptColoms',.03],
  sheets:[
   {id:'rodet',name:'Rodet francès',desc:'Files encavalcades de gotes de tres colors, una pinta fina i, a sobre, petits caragols arrenglerats.',lay:{k:'grid',hex:true},rc:[0,1,2],
    gesture:[mbP('comb',{dir:'h',sp:.05,z:.05,w:.012}),mbP('curl',{nx:6,ny:3,z:.1,w:.07})],gesture2:[mbP('fan',{axis:'y',amp:.015,wl:.5})],flower:'rosa',
    pal:mbPals('0d0b10 f9f5ef e9b949 3f8f8a c06a98 d8c8f0','0c0a06 f8f4e8 c89a3a 7aa874 b07aa8 ece2cc')},// Belle Époque · art nouveau
   {id:'ram',name:'Ram',desc:'Files ondulades de gotes, un pentinat fi i una pinta ampla que fa rams.',lay:{k:'ones',n:4,amp:.07,wl:.6,dpn:2},rc:[0,1,2],
    gesture:[mbP('gelgit',{dir:'v',sp:.14,z:.11,w:.03}),mbP('comb',{dir:'h',sp:.05,z:.05,w:.012}),mbP('wave',{dir:'v',sp:.16,z:.06,w:.03,amp:.05,wl:.25})],gesture2:[mbP('fan',{axis:'x',amp:.015,wl:.4})],flower:'rosa',
    pal:mbPals('0a1008 f5f8ef 8fcf6a f2994a b48ee0 bfe6ff','10060a fbf0f2 d8344e f7c6cf 3ab0a8 f6e27a')},// ram de primavera · cirera
   {id:'estel',name:'Estel',desc:'Una diana enorme de colors i el punxó que hi traça raigs del centre cap enfora i de fora cap al centre.',lay:{k:'bull',cs:[[.5,.5]]},rc:[0,1,2,3],rm:'same',
    gesture:[mbP('star',{x:.5,y:.5,n:12,z:.15,w:.04,dir:'out'})],gesture2:[mbP('star',{x:.5,y:.5,n:12,z:.08,w:.03,dir:'in',a0:15})],flower:'rosa',
    pal:mbPals('050816 eef0f8 3552c0 f7d94a 58c8f0 f4f4f0 e85a3a','020a10 ecf6f6 2fd0a0 8a8ff4 e070c8 d8f4f0')},// nit estrellada · aurora boreal
   {id:'rosa',name:'Rosa',desc:'Una corona de gotes al voltant del centre i una rosa gran dibuixada amb el punxó.',lay:{k:'corona'},rc:[0,1,2],
    gesture:[mbP('flower',{f:'rosa',x:.5,y:.5,R:.3})],gesture2:[mbP('gelgit',{dir:'h',sp:.3,z:.03,w:.03})],flower:'rosa2',
    pal:mbPals('120a0c faf4f2 d94f7c 8fb59a f4c7a8 9a78c8','0e0a0c fcf4ee f4a582 2a9a9a c45a7a fff0a0')}]},// rosa i sàlvia · préssec i verd blau,
 {id:'nuremberg',name:'Nuremberg',place:'el taller de l’impressor',key:55,scale:'major',subs:8,beat:4,sub:.13,arp:[0,2,3,4,6,7],
  inst:{arp:'marimbaRec',bass:'dsFagot',mel:'fluteRec',spark:'glockRec',gliss:'dsMarimba',cad:'dsMarimba'},perc:{bank:'woodblockRec',hits:[[4,'claves',.06]]},
  prog:[0,4,0,4,3,0,4,0],tune:[[[0,4,2],[2,2,2],[4,0,2],[6,2,2]],[[0,6,2],[2,4,2],[4,1,4]],[[0,4,2],[2,5,2],[4,4,2],[6,2,2]],[[0,1,4],[4,4,4]],[[0,7,2],[2,6,2],[4,5,2],[6,4,2]],[[0,3,4],[4,5,4]],[[0,4,2],[2,3,2],[4,1,2],[6,-1,2]],[[0,0,8]]],
  wall:{tone:'#6b4a2e',light:'#a07a52',dark:'#33220f',accent:'#4f6f3a'},air:['natureRec','ptMoli',.03],
  sheets:[
   {id:'holandes',name:'Holandès antic',desc:'Files de gotes de colors alterns, el punxó que va i ve, una pinta i una altra de través.',lay:{k:'grid'},rc:[0,1],
    gesture:[mbP('gelgit',{dir:'v',sp:.15,z:.12,w:.03}),mbP('comb',{dir:'h',sp:.07,z:.05,w:.015})],gesture2:[mbP('comb',{dir:'v',sp:.08,z:.035,w:.012})],flower:'estrella',
    pal:mbPals('0c0c08 f7f5ec e3b22e 2f9a62 d6402f f1ece0','060a18 eff2fa 3d5cc4 e34a2a f0a0c0 e8d8b0')},// groc, verd i vermell · indi i cinabri
   {id:'zigazaga',name:'Ziga-zaga',desc:'Franges de quatre colors que el punxó, d’un costat a l’altre, converteix en ziga-zagues.',lay:{k:'bands',dir:'h',dpn:2},rc:[0,1,2,3],
    gesture:[mbP('zig',{amp:.085,wl:.42})],gesture2:[mbP('wave',{dir:'h',sp:.12,z:.04,w:.02,amp:.03,wl:.16,tri:true})],flower:'estrella',
    pal:mbPals('0a0a0a f7f7f7 ff5fa2 29c7e0 c9ef3a 8a5fe8','0c0c04 fbfbea f7d23a ff8a2a 9ccf3a e94a6a')},// pop · cítrics
   {id:'espiral',name:'Espiral',desc:'Gotes en espiral des del centre i el punxó que hi dona voltes fins que tot gira.',lay:{k:'spiral',turns:2.6},rc:[0,1],
    gesture:[mbP('spiral',{x:.5,y:.5,rings:[.4,.3,.2,.1],z:.08,w:.06,vz:.26,vw:.2})],gesture2:[mbP('fan',{axis:'y',amp:.015,wl:.5})],flower:'estrella',
    pal:mbPals('08101c f4f6fa f2782a 4a6ee0 f7e7c4 26a69a','020c12 ecf6f8 1f9ac0 7fe0d0 f0a8a0 a87ad8')},// taronja i blau nit · fons marí
   {id:'remoli',name:'Remolí',desc:'Dues dianes de colors i tres remolins que se les enduen.',lay:{k:'bull',cs:[[.3,.42],[.7,.58]]},rc:[0,1,2],
    gesture:[mbP('vortex',{pts:[[.22,.45,1],[.52,.6,-1],[.8,.4,1]],z:.2,w:.19})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.45})],flower:'estrella',
    pal:mbPals('0b0f06 f4f5ec 7da03a b0503a e7d27e 7aa6e8','0e0604 fbf2ee f2c14a e2502a a8a8b8 7a4a3a')}]}]);// molsa, rovell i cel · volcà

export const MB_SHEETS=Object.freeze(MB_TALLERS.flatMap((T,g)=>T.sheets.map((sh,j)=>({...sh,taller:T.id,g,j}))));
// ── The colours of a sheet ─────────────────────────────────────────────────────────────────────────────────────────────────
// Turning a colour round the hue circle keeps its lightness and its chroma (as far as the screen can show it) in OKLab
// (Ottosson, 2020): the palettes of the third lap on are those of the first two turned by 60° per pair of laps, so they keep the
// harmony and the contrast of the originals but are new colours.
const mbLin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);},mbEnc=v=>v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055;
function mbOk(hex){const n=parseInt(hex.slice(1),16),r=mbLin(n>>16&255),g=mbLin(n>>8&255),b=mbLin(n&255);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),q=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return [.2104542553*l+.793617785*m-.0040720468*q,1.9779984951*l-2.428592205*m+.4505937099*q,.0259040371*l+.7827717662*m-.808675766*q];}
function mbOkRgb(L,a,b){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,q=(L-.0894841775*a-1.291485548*b)**3;
 return [4.0767416621*l-3.3077115913*m+.2309699292*q,-1.2684380046*l+2.6097574011*m-.3413193965*q,-.0041960863*l-.7034186147*m+1.707614701*q];}
export function mbTurn(hex,deg){const [L,a,b]=mbOk(hex),C=Math.hypot(a,b),H=Math.atan2(b,a)+deg*Math.PI/180,out=k=>mbOkRgb(L,C*k*Math.cos(H),C*k*Math.sin(H)),bad=c=>c.some(v=>v<-1e-4||v>1+1e-4);
 let rgb=out(1);if(bad(rgb)){let lo=0,hi=1;for(let i=0;i<20;i++){const k=(lo+hi)/2;if(bad(out(k)))hi=k;else lo=k;}rgb=out(lo);}// less chroma until the screen can show it
 return '#'+rgb.map(v=>Math.round(Math.max(0,Math.min(1,mbEnc(Math.max(0,v))))*255).toString(16).padStart(2,'0')).join('');}
const MB_TURNED=new Map();
// The palette of sheet j of workshop g on a lap: {water:[on dark, on light], inks:[…]}.
export function mbPalette(g,j,lap=0){const p=MB_TALLERS[g].sheets[j].pal[lap%2],k=Math.floor(Math.max(0,lap)/2);if(!k)return p;const key=g+'/'+j+'/'+lap;
 if(!MB_TURNED.has(key)){const deg=60*(k%6)+17*Math.floor(k/6);MB_TURNED.set(key,Object.freeze({water:Object.freeze(p.water.map(c=>mbTurn(c,deg))),inks:Object.freeze(p.inks.map(c=>mbTurn(c,deg)))}));}
 return MB_TURNED.get(key);}

// The high contrast colours (setting «Colors»): eight on dark water and eight on light water; every sheet takes four of them, a set
// that shares at most one colour with the sheet before it (two where a sheet has two neighbours that already use seven of the
// eight) and starts with a colour that sheet does not have. The two closest of each eight
// (3 and 6: pink and lilac, purple and wine) never go together.
export const MB_CONTRAST=Object.freeze({dark:Object.freeze(['#ffd400','#18c8ff','#ffffff','#ff6fd8','#ff8c1a','#8cff4a','#b9a0ff','#ff6b6b']),
 light:Object.freeze(['#14141a','#0b3fd6','#0a6a32','#a0198a','#b3261e','#7a4a00','#6a1030','#00707a'])});
const MB_HC_SETS=(()=>{const out=[];for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)for(let c=b+1;c<8;c++)for(let d=c+1;d<8;d++){const S=[a,b,c,d];if(S.includes(3)&&S.includes(6))continue;out.push(S);}
 // a fixed shuffle, so neighbouring sheets do not get neighbouring sets
 for(let i=out.length-1,x=12345;i>0;i--){x=(x*1103515245+12345)>>>0;const k=x%(i+1);[out[i],out[k]]=[out[k],out[i]];}return out;})();
// the sheets just before sheet N (N = 20·lap + 4·g + j) in some order of play: the one before it, and where a workshop ends
const mbBefore=N=>{const L=Math.floor(N/20),r=N%20,g=r>>2,j=r&3,o=[];if(N>0)o.push(N-1);if(j===0&&g>0&&L>0)o.push(N-21);if(g===4&&j===3)o.push(N-19);return o;};
const MB_HC=[];
export function mbContrastSet(g,j,lap=0){const N=20*Math.max(0,lap)+4*g+j;
 while(MB_HC.length<=N){const n=MB_HC.length,pre=mbBefore(n).map(m=>MB_HC[m]),recent=MB_HC.slice(-12).map(S=>[...S].sort().join(''));let pick=null;
  for(const most of [1,2])for(let i=0;i<MB_HC_SETS.length&&!pick;i++){const S=MB_HC_SETS[(n*7+i)%MB_HC_SETS.length];if(recent.includes(S.join('')))continue;if(pre.some(P=>S.filter(c=>P.includes(c)).length>most))continue;
   const firsts=S.filter(c=>!pre.some(P=>P.includes(c)));if(!firsts.length)continue;const f=firsts[n%firsts.length];pick=[f,...S.filter(c=>c!==f)];}
  MB_HC.push(pick||MB_HC_SETS[n%MB_HC_SETS.length]);}
 return MB_HC[N];}

// La nova Pluja de colors (CE03), 0.52 · the five workshops of marbled paper and their twenty sheets.
// Each workshop has its tradition, its scenery, two palettes (the second for the second lap), its music (key, scale, metre,
// tempo, instruments: all recordings of real instruments, nothing held) and four sheets. A sheet says which colours fall at each
// step and what the stylus or the comb draws. Positions are fractions of the bath (x across, y down).
// The pattern names Turc, Espanyol, Pentinat (nonpareil), Rodet francès (French curl), Cua de paó (peacock), Ram (bouquet) and
// Holandès antic are the classified European patterns (University of Washington Libraries, n.d.; Wolfe, 1990); the rings of
// suminagashi are made by alternating ink and water and are moved by fanning (Carey, 2014). The other names are descriptions.

// the scales as steps from the key: major, phrygian dominant (with the augmented second), the Japanese «in» scale (five notes)
export const MB_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],hijaz:[0,1,4,5,7,8,10],in:[0,1,5,7,8]});
export const mbNote=(key,scale,d)=>{const S=MB_SCALES[scale]||MB_SCALES.major,n=S.length,o=Math.floor(d/n);return key+S[((d%n)+n)%n]+12*o;};

// A pass of the gesture: comb (all tines the same way), gelgit (back and forth: alternate tines the other way), wave (a comb on a
// wavy or zigzag path), curl (small whirls on a grid), vortex (whirls at points), spiral (rings round a centre, each the other way),
// fan (a breath of wind over the water). dir 'h': the tool travels across; 'v': it travels down. sp: spacing of the tines,
// z: how far the ink is carried, w: how wide the pull is (fractions of the bath height).
const mbP=(k,o={})=>Object.freeze({k,...o});

export const MB_TALLERS=Object.freeze([
 {id:'barcelona',name:'Barcelona',place:'el taller d’enquadernació',key:57,scale:'major',subs:6,beat:2,sub:.2,arp:[0,1,2,3,4,5],
  inst:{arp:'guitarRec',bass:'dsBaix',mel:'clarinetRec',spark:'violinsPizzRec',gliss:'dsArpa',cad:'harpRec'},perc:{bank:'dsPandereta',hits:[[2,'hit',.12],[4,'hit',.1]]},
  prog:[0,3,4,0,5,3,4,0],tune:[[[0,4,2],[2,2,2],[4,4,2]],[[0,5,3],[3,3,1],[4,1,2]],[[0,4,2],[2,6,2],[4,8,2]],[[0,7,4],[4,4,2]],[[0,5,2],[2,4,2],[4,2,2]],[[0,3,3],[3,5,1],[4,7,2]],[[0,6,2],[2,4,2],[4,1,2]],[[0,0,6]]],
  water:['#0b0d14','#f7f3ea'],pal:[['#6f86ff','#e0a43a','#f3e6c8','#d0566e'],['#3fb0a6','#e8c35a','#f1efe6','#b75bd0']],
  wall:{tone:'#5a3b24',light:'#8a6040',dark:'#2c1b10',accent:'#b8873f'},air:['natureRec','ptCigales',.05],
  sheets:[
   {id:'turc',name:'Turc',desc:'Pedres de color amb vetes fines: el patró europeu més antic.',layout:'scatter',gesture:[mbP('gelgit',{dir:'v',sp:.3,z:.075,w:.06})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.7})],flower:'cor'},
   {id:'espanyol',name:'Espanyol',desc:'Pedres travessades per ones d’ombra en diagonal.',layout:'scatter',gesture:[mbP('wave',{dir:'h',sp:.22,z:.085,w:.06,amp:.06,wl:.5})],gesture2:[mbP('fan',{axis:'y',amp:.025,wl:.9})],flower:'cor'},
   {id:'pentinat',name:'Pentinat',desc:'El punxó va i ve i després una pinta fina ho pentina tot.',layout:'scatter',gesture:[mbP('gelgit',{dir:'v',sp:.16,z:.12,w:.03}),mbP('comb',{dir:'h',sp:.05,z:.05,w:.012})],gesture2:[mbP('comb',{dir:'h',sp:.05,z:-.03,w:.01})],flower:'cor'},
   {id:'pao',name:'Cua de paó',desc:'Sobre les pedres, la pinta dibuixa plomes de paó.',layout:'scatter',gesture:[mbP('gelgit',{dir:'v',sp:.14,z:.11,w:.03}),mbP('comb',{dir:'h',sp:.06,z:.05,w:.012}),mbP('wave',{dir:'v',sp:.09,z:.035,w:.02,amp:.045,wl:.18})],gesture2:[mbP('fan',{axis:'x',amp:.015,wl:.5})],flower:'cor'}]},
 {id:'istanbul',name:'Istanbul',place:'el taller d’ebru',key:50,scale:'hijaz',subs:9,beat:2,sub:.19,arp:[0,2,4,6,7],
  inst:{arp:'dsArpa',bass:'uduRec',mel:'oboeRec',spark:'dsArpa',gliss:'harpRec',cad:'dsArpa'},perc:{bank:'tamborRec',hits:[[0,'baix',.2],[2,'vora',.1],[4,'mig',.13],[6,'vora',.1],[7,'alt',.08]]},
  prog:[0,1,0,6,0,1,6,0],tune:[[[0,4,2],[2,5,2],[4,4,2],[6,2,3]],[[0,1,4],[4,2,2],[6,1,3]],[[0,0,2],[2,2,2],[4,3,2],[6,4,3]],[[0,6,4],[4,5,2],[6,4,3]],[[0,7,2],[2,8,2],[4,7,2],[6,5,3]],[[0,4,4],[4,5,2],[6,2,3]],[[0,1,2],[2,2,2],[4,1,2],[6,-1,3]],[[0,0,9]]],
  water:['#08121a','#f4f7f6'],pal:[['#2fc6c0','#4f7cff','#f2b632','#f07aa8'],['#7fd36b','#ff9a4d','#f4e9d0','#9fb8ff']],
  wall:{tone:'#1f5d7a',light:'#e9e2cf',dark:'#123445',accent:'#c7962f'},air:['natureRec','brook',.035],
  sheets:[
   {id:'vora',name:'Pedres amb vora',desc:'Gotes que es toquen i deixen una vora fosca entre elles.',layout:'scatter',rim:2,gesture:[mbP('vortex',{pts:[[.3,.4,1],[.7,.6,-1]],z:.15,w:.19})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.6})],flower:'tulipa'},
   {id:'anada',name:'Anada i tornada',desc:'El punxó travessa el bany amunt i avall, una vegada i una altra.',layout:'scatter',gesture:[mbP('gelgit',{dir:'v',sp:.12,z:.14,w:.03})],gesture2:[mbP('gelgit',{dir:'h',sp:.2,z:.06,w:.03})],flower:'tulipa'},
   {id:'onades',name:'Onades',desc:'El punxó fa ones d’un costat a l’altre del bany.',layout:'scatter',gesture:[mbP('wave',{dir:'h',sp:.12,z:.1,w:.03,amp:.05,wl:.3,alt:true})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.4})],flower:'tulipa'},
   {id:'tulipa',name:'Tulipa',desc:'Una tulipa gran dibuixada amb el punxó sobre les pedres.',layout:'scatter',gesture:[mbP('flower',{f:'tulipa',x:.5,y:.56,R:.3})],gesture2:[mbP('gelgit',{dir:'v',sp:.3,z:.03,w:.03})],flower:'tulipa2'}]},
 {id:'kyoto',name:'Kyoto',place:'el taller de suminagashi',key:52,scale:'in',subs:8,beat:2,sub:.28,arp:[0,2,4,5,6],
  inst:{arp:'harpRec',bass:'dsArpa',mel:'marimbaRec',spark:'marimbaRec',gliss:'dsArpa',cad:'harpRec'},perc:{bank:'woodblockRec',hits:[[6,'claves',.08]]},
  prog:[0,3,2,0,4,3,1,0],tune:[[[0,5,3],[3,4,1],[4,3,4]],[[0,2,4],[4,3,2],[6,1,2]],[[0,2,3],[3,3,1],[4,4,4]],[[0,5,8]],[[0,6,3],[3,5,1],[4,4,2],[6,3,2]],[[0,2,4],[4,1,4]],[[0,2,2],[2,3,2],[4,1,4]],[[0,0,8]]],
  water:['#0a0c10','#f6f3ec'],pal:[['#eef1f7','#6c8cff','#d9b25a','#9fb3c8'],['#f2d7e2','#7cc4e8','#e6c15c','#c9d6e3']],rings:true,
  wall:{tone:'#c9b48a',light:'#efe6d0',dark:'#5b4a32',accent:'#6e8a3c'},air:['natureRec','wind',.03],
  sheets:[
   {id:'anells',name:'Anells',desc:'Anells de tinta i d’aigua, l’un dins de l’altre.',layout:'rings',gesture:[mbP('fan',{axis:'x',amp:.025,wl:.8})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.7})],flower:'crisantem'},
   {id:'ventall',name:'Ventall',desc:'Un buf de vent deforma els anells com una tela.',layout:'rings',gesture:[mbP('fan',{axis:'x',amp:.05,wl:.55}),mbP('fan',{axis:'y',amp:.04,wl:.65})],gesture2:[mbP('fan',{axis:'x',amp:-.03,wl:.4})],flower:'crisantem'},
   {id:'ondulacio',name:'Ondulació',desc:'El punxó passa a poc a poc i ondula els anells.',layout:'rings',gesture:[mbP('wave',{dir:'h',sp:.3,z:.06,w:.05,amp:.07,wl:.6})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.5})],flower:'crisantem'},
   {id:'ombra',name:'Ombra doble',desc:'Dos colors de tinta en anells que giren lentament.',layout:'rings',two:true,gesture:[mbP('vortex',{pts:[[.5,.5,1]],z:.06,w:.2})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.6})],flower:'crisantem'}]},
 {id:'paris',name:'París',place:'el taller de la claraboia',key:53,scale:'major',subs:6,beat:2,sub:.18,arp:[0,2,3,4,5],
  inst:{arp:'dsPiano',bass:'celliPizzRec',mel:'violinsPizzRec',spark:'dsGlock',gliss:'dsPiano',cad:'dsArpa'},perc:{bank:'triangleRec',hits:[[2,'hit',.05],[4,'hit',.04]]},
  prog:[0,4,0,3,1,4,4,0],tune:[[[0,4,2],[2,5,1],[3,4,1],[4,2,2]],[[0,6,2],[2,4,2],[4,1,2]],[[0,2,2],[2,4,2],[4,7,2]],[[0,5,4],[4,3,2]],[[0,1,2],[2,3,2],[4,5,2]],[[0,8,2],[2,6,2],[4,4,2]],[[0,4,2],[2,3,1],[3,2,1],[4,1,2]],[[0,0,6]]],
  water:['#0c0b12','#f8f4f0'],pal:[['#d8607e','#e8c15a','#4b86d8','#9cc59a'],['#e98b5d','#5ec3d6','#f2e8cf','#c79be8']],
  wall:{tone:'#d8cfc0',light:'#f3eee4',dark:'#7a6e60',accent:'#3d5f8c'},air:['natureRec','ptColoms',.03],
  sheets:[
   {id:'rodet',name:'Rodet francès',desc:'La pinta fina i després petits caragols arrenglerats.',layout:'scatter',gesture:[mbP('comb',{dir:'h',sp:.05,z:.05,w:.012}),mbP('curl',{nx:6,ny:3,z:.1,w:.07})],gesture2:[mbP('fan',{axis:'y',amp:.015,wl:.5})],flower:'rosa'},
   {id:'ram',name:'Ram',desc:'Un pentinat fi que una pinta ampla converteix en un ram.',layout:'scatter',gesture:[mbP('gelgit',{dir:'v',sp:.14,z:.11,w:.03}),mbP('comb',{dir:'h',sp:.05,z:.05,w:.012}),mbP('wave',{dir:'v',sp:.16,z:.06,w:.03,amp:.05,wl:.25})],gesture2:[mbP('fan',{axis:'x',amp:.015,wl:.4})],flower:'rosa'},
   {id:'plomes',name:'Plomes',desc:'El punxó va amunt i avall alternant, com les barbes d’una ploma.',layout:'scatter',gesture:[mbP('gelgit',{dir:'h',sp:.16,z:.1,w:.03}),mbP('gelgit',{dir:'v',sp:.07,z:.06,w:.015})],gesture2:[mbP('fan',{axis:'y',amp:.02,wl:.5})],flower:'rosa'},
   {id:'rosa',name:'Rosa',desc:'Una rosa gran feta amb anells i el punxó.',layout:'scatter',gesture:[mbP('flower',{f:'rosa',x:.5,y:.5,R:.3})],gesture2:[mbP('gelgit',{dir:'h',sp:.3,z:.03,w:.03})],flower:'rosa2'}]},
 {id:'nuremberg',name:'Nuremberg',place:'el taller de l’impressor',key:55,scale:'major',subs:8,beat:4,sub:.13,arp:[0,2,3,4,6,7],
  inst:{arp:'marimbaRec',bass:'dsFagot',mel:'fluteRec',spark:'glockRec',gliss:'dsMarimba',cad:'dsMarimba'},perc:{bank:'woodblockRec',hits:[[4,'claves',.06]]},
  prog:[0,4,0,4,3,0,4,0],tune:[[[0,4,2],[2,2,2],[4,0,2],[6,2,2]],[[0,6,2],[2,4,2],[4,1,4]],[[0,4,2],[2,5,2],[4,4,2],[6,2,2]],[[0,1,4],[4,4,4]],[[0,7,2],[2,6,2],[4,5,2],[6,4,2]],[[0,3,4],[4,5,4]],[[0,4,2],[2,3,2],[4,1,2],[6,-1,2]],[[0,0,8]]],
  water:['#0a0f0c','#f5f5ee'],pal:[['#5cc46e','#f39a3d','#4f8ef0','#efe0a0'],['#d65fa0','#46c1b8','#f2c94c','#e9edf2']],
  wall:{tone:'#6b4a2e',light:'#a07a52',dark:'#33220f',accent:'#4f6f3a'},air:['natureRec','ptMoli',.03],
  sheets:[
   {id:'holandes',name:'Holandès antic',desc:'Gotes en files, el punxó que va i ve i una pinta.',layout:'grid',gesture:[mbP('gelgit',{dir:'v',sp:.15,z:.12,w:.03}),mbP('comb',{dir:'h',sp:.07,z:.05,w:.015})],gesture2:[mbP('fan',{axis:'x',amp:.015,wl:.5})],flower:'estrella'},
   {id:'zigazaga',name:'Ziga-zaga',desc:'La pinta fa ziga-zaga i deixa puntes de colors.',layout:'scatter',gesture:[mbP('wave',{dir:'h',sp:.1,z:.07,w:.025,amp:.06,wl:.22,tri:true})],gesture2:[mbP('wave',{dir:'v',sp:.2,z:.04,w:.025,amp:.04,wl:.3,tri:true})],flower:'estrella'},
   {id:'espiral',name:'Espiral',desc:'El punxó dona voltes al centre i tot es torna una espiral.',layout:'scatter',gesture:[mbP('spiral',{x:.5,y:.5,rings:[.4,.3,.2,.1],z:.08,w:.06,vz:.26,vw:.2})],gesture2:[mbP('fan',{axis:'y',amp:.015,wl:.5})],flower:'estrella'},
   {id:'remoli',name:'Remolí',desc:'Tres remolins que s’enduen els colors.',layout:'scatter',gesture:[mbP('vortex',{pts:[[.22,.45,1],[.52,.6,-1],[.8,.4,1]],z:.2,w:.19})],gesture2:[mbP('fan',{axis:'x',amp:.02,wl:.45})],flower:'estrella'}]}]);

export const MB_SHEETS=Object.freeze(MB_TALLERS.flatMap((T,g)=>T.sheets.map((sh,j)=>({...sh,taller:T.id,g,j}))));
// the high contrast colours (setting «Colors»): on dark water and on light water
export const MB_CONTRAST=Object.freeze({dark:['#ffd400','#18c8ff','#ffffff','#ff6fd8'],light:['#14141a','#0b3fd6','#a0198a','#0a6a32']});

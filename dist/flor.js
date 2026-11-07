// La nova Flor de paper (CE02), 0.51 · the model: gardens, presses, the opening of each flower, the finale, the change of garden,
// the wait for the next press, and (further down) the music and the sounds.
// Marc, 7 November 2026: «refer Flor de paper, amb el mateix concepte, però molt més elaborat i bonic, generant flors de paper que
// s'obren sobre un fons negre, i que quan estan obertes tenyeixen el seu entorn dels seus colors… flors de diferents tipus que es
// basin en flors reals… un univers musical… sons de natura al voltant de les flors». Plan approved the same day.
// A garden is five presses: four flowers open one at a time (each stays open, casts its light, brings its creature and adds a voice
// to the garden's piece) and the fifth press plays the finale; then the next garden. The second lap mirrors the gardens and uses a real
// colour form of every species. Setting «Una flor cada vegada»: one large flower at each press, the previous one folding away.
import {Kclamp,Ksmooth,Krand} from './kaleido-base.js';
import {escWaitTurn,escWaitClock,escFit,escInto,escRange} from './escenari.js';
import {sampleZone} from './sampler.js';
import {FP_GARDENS,FP_SPECIES} from './flor-especies.js';
import {fpLook} from './flor-art.js';

export const FP_ORDER=Object.freeze([['rosella','margarida','girasol','blauet'],['nenufar','lotus','iris','cala'],['didalera','ciclamen','violeta','peonia'],['lluna','lliri','camelia','gessami'],['orquidia','hibisc','passiflora','strelitzia']]);
export const FP_ALL=Object.freeze(FP_ORDER.flat());
// The opening of a flower lasts this long (setting «Durada de l'obertura»); the finale and the change of garden have their own.
export const FP_OPEN=Object.freeze({curta:6,mitjana:9,llarga:13});
export const FP_FINALE=12,FP_CHANGE=3.6,FP_APPEAR=1.6,FP_SWAP=1.4;
export const fpNowOf=F=>F?.t??0;
export const fpOpenSpan=s=>FP_OPEN[s?.flOpen]||FP_OPEN.mitjana;
const fpCount=s=>[2,3,4].includes(+s?.flCount)?+s.flCount:4;
// which of the four slots of a garden are used with 2, 3 or 4 flowers
const FP_SLOTS={2:[0,2],3:[0,1,2],4:[0,1,2,3]};
export const fpSpecies=id=>FP_SPECIES[id]||null;
export const fpGardenOf=F=>F.mode==='una'?Math.floor(((F.single%20)+20)%20/4):F.g;

// The catalogue's card: the activity keeps its id and code (CE02) and goes to «Formes, llum i música».
export const FP_CAUSE=Object.freeze({id:'flower',code:'CE02',type:'ce',level:'01 · Descobrir',name:'Flor de paper',desc:'Flors reals de paper que s’obren sobre el negre i tenyeixen l’entorn dels seus colors, amb música i sons de natura.',tag:'20 flors reals · 5 jardins',time:'Al teu ritme',flor:true,recorded:true});

export function fpNew(s){const first=Math.max(0,FP_GARDENS.findIndex(g=>g.id===s?.flFirst));
 return {mode:s?.flMode==='una'?'una':'jardi',g:first,lap:0,n:fpCount(s),opened:[null,null,null,null],count:0,phase:'rest',at:0,t:0,appear:0,wait:null,cues:['garden'],single:first*4,prev:null,presses:0,done:0};}
export function fpStart(game,s){game.flor=fpNew(s);game.count=0;game.completed=0;return game.flor;}

// The opening of flower k now: wake (the bud stirs), p (the petals open), tint (its light spreads), visit (its creature), breath.
export function fpBloom(F,k,s,t=F.t){const t0=F.opened[k];if(t0==null||t<t0)return {wake:0,p:0,tint:0,visit:0,breath:0,tl:-1};const D=fpOpenSpan(s),tl=t-t0;
 return {tl,wake:Kclamp(tl/(.13*D)),p:Kclamp((tl-.13*D)/(.52*D)),tint:Ksmooth((tl-.33*D)/(.67*D)),visit:Kclamp((tl-.55*D)/(.45*D)),breath:Ksmooth((tl-.6*D)/(.4*D))};}
export const fpFinaleT=F=>F.phase==='finale'?F.t-F.at:-1;
export function fpBlocked(game,s){const F=game?.flor;if(!F)return false;if(F.phase==='finale'||F.phase==='change')return true;if(F.phase==='bloom'||F.phase==='swap')return s?.lock!==false;return false;}

export function fpPress(game,s){const F=game?.flor;if(!F)return false;if(F.phase==='finale'||F.phase==='change')return false;const D=fpOpenSpan(s);
 if(F.phase==='bloom'||F.phase==='swap'){if(s?.lock!==false)return false;const k=F.mode==='una'?0:F.count-1;F.opened[k]=Math.min(F.opened[k],F.t-D);F.phase='rest';}
 F.presses++;game.count=F.mode==='una'?1:F.count;
 if(F.mode==='una'){if(F.opened[0]!=null){F.prev={id:FP_ALL[((F.single%20)+20)%20],lap:F.lap,t0:F.t};F.single++;if(F.single%20===0)F.lap++;}F.opened=[F.t+(F.prev?.6:0),null,null,null];F.phase='swap';F.at=F.t;F.cues.push('open:0');F.wait=escWaitTurn(F.wait,'run',F.t);return true;}
 if(F.count<F.n){F.opened[F.count]=F.t;F.count++;F.phase='bloom';F.at=F.t;F.cues.push('open:'+(F.count-1));game.count=F.count;F.wait=escWaitTurn(F.wait,'run',F.t);return true;}
 F.phase='finale';F.at=F.t;F.cues.push('finale');F.wait=escWaitTurn(F.wait,'run',F.t);return true;}

export function fpTick(game,s,dt){const F=game?.flor;if(!F)return;F.t+=dt;const D=fpOpenSpan(s);if(F.n!==fpCount(s)&&F.phase==='rest'&&F.count===0)F.n=fpCount(s);
 // cues of the light and the visitors, once each
 for(let k=0;k<4;k++){const b=fpBloom(F,k,s);if(b.tl<0)continue;F.seen=F.seen||{};const key=F.g+'/'+F.lap+'/'+k+'/'+F.opened[k];
  if(b.tint>0&&!F.seen[key+'t']){F.seen[key+'t']=1;F.cues.push('tint:'+k);}if(b.visit>0&&!F.seen[key+'v']){F.seen[key+'v']=1;F.cues.push('visit:'+k);}}
 if(F.phase==='bloom'&&F.t-F.at>=D){F.phase='rest';F.wait=escWaitTurn(F.wait,'wait',F.t);F.done++;game.completed=F.done;}
 if(F.phase==='swap'&&F.t-F.at>=D+.6){F.phase='rest';F.prev=null;F.wait=escWaitTurn(F.wait,'wait',F.t);F.done++;game.completed=F.done;}
 if(F.phase==='finale'&&F.t-F.at>=FP_FINALE){F.phase='change';F.at=F.t;F.cues.push('change');}
 if(F.phase==='change'&&F.t-F.at>=FP_CHANGE){F.g=(F.g+1)%5;if(F.g===0)F.lap++;F.opened=[null,null,null,null];F.count=0;game.count=0;F.n=fpCount(s);F.phase='rest';F.appear=F.t;F.at=F.t;F.seen={};F.cues.push('garden');F.wait=escWaitTurn({mode:'run',at:F.t,idle:F.wait?escWaitTurn(F.wait,'run',F.t).idle:F.t,rate:1,dark:0},'wait',F.t+.01);}}

// Where everything is now (pixels), for the painting.
export function fpLayout(F,s,w,h,t=F.t){const U=Math.min(h,w*.5625),out={flowers:[],finale:0,finT:0,garden:fpGardenOf(F),mirror:false};
 if(F.mode==='una'){const add=(id,lap,k,b,extra)=>{const sp0=fpSpecies(id);if(!sp0)return;const i=FP_ALL.indexOf(id),side=i%2?-1:1,sp=fpLook(sp0,lap%2===1);
   out.flowers.push({sp,id,x:w*(.5+.07*side),y:h*.52,R:U*(sp.k==='spike'?.36:.4),z:.3,sx:w*(.5+.12*side),seed:i*7.3+lap,yaw:-side*.12,...b,fold:0,alpha:1,sway:Math.sin(t*.45+i)*.4,lean:side,...extra});};
  out.garden=fpGardenOf(F);out.mirror=F.lap%2===1;const cur=FP_ALL[((F.single%20)+20)%20],b=fpBloom(F,0,s,t);
  if(F.prev){const x=Ksmooth((t-F.prev.t0)/FP_SWAP),pb={wake:1,p:1-x*.75,tint:1-x,visit:0,breath:0};add(F.prev.id,F.prev.lap,0,pb,{alpha:1-x,fold:x,z:.6});}
  add(cur,F.lap,0,b,{alpha:F.prev?Ksmooth((t-F.prev.t0-.3)/.8):Ksmooth((t-F.appear)/FP_APPEAR+(F.presses?1:0))});return out;}
 const G=FP_GARDENS[F.g],slots=FP_SLOTS[F.n]||FP_SLOTS[4],mirror=F.lap%2===1,alt=F.lap%2===1;out.mirror=mirror;
 const ch=F.phase==='change'?Ksmooth((t-F.at)/2.2):0,fade=F.phase==='change'?1-Ksmooth((t-F.at-1.4)/1.8):1,appear=F.presses||F.g!==0||F.lap?Ksmooth((t-F.appear)/FP_APPEAR):1;
 const ft=fpFinaleT(F);if(ft>=0){out.finT=ft;out.finale=Ksmooth(ft/1.6)*(1-Ksmooth((ft-(FP_FINALE-2.2))/2.2));}
 slots.forEach((si,k)=>{const id=FP_ORDER[F.g][k],sp0=fpSpecies(id);if(!sp0)return;const sl=G.slots[si],sp=fpLook(sp0,alt),b=fpBloom(F,k,s,t),x=mirror?1-sl.x:sl.x,sx=mirror?1-sl.sx:sl.sx,seed=F.g*31+k*7.7+F.lap*3;
  const fin=out.finale,breath=Math.max(b.breath,fin)*(1+fin*.8);
  out.flowers.push({sp,id,k,x:x*w,y:sl.y*h,R:sl.R*U,z:sl.z,sx:sx*w,seed,yaw:(.5-x)*.5,wake:b.wake,p:b.p*(1-.7*ch),tint:b.tint*(1-ch),visit:b.visit*(1-ch),breath,fold:ch,alpha:fade*appear,sway:Math.sin(t*.55+seed)*(.4+fin*.6),lean:mirror?-1:1});});
 return out;}

// The words for a screen reader (no words are ever drawn in the scene).
export function fpStatus(game,s){const F=game?.flor;if(!F)return '';const G=FP_GARDENS[fpGardenOf(F)];
 if(F.mode==='una'){const sp=fpSpecies(FP_ALL[((F.single%20)+20)%20]);return F.opened[0]!=null?`S’obre la flor: ${sp?.name||''}. ${G.name}.`:`Una poncella espera: ${sp?.name||''}.`;}
 if(F.phase==='finale')return `${G.name}: el jardí sencer s’encén i sona la seva música.`;if(F.phase==='change')return 'El jardí es plega i n’arriba un altre.';
 if(F.count===0)return `${G.name}. Les poncelles esperen.`;const sp=fpSpecies(FP_ORDER[F.g][F.count-1]);return `S’obre ${sp?.name?.toLowerCase()||'una flor'}. Flor ${F.count} de ${F.n} de ${G.name.replace(/^El |^L’/,'').toLowerCase()}.`;}
export function fpProgress(game,s){const F=game?.flor;if(!F)return '';if(F.mode==='una')return `${(((F.single%20)+20)%20)+1} / 20`;const n=F.n+1,done=F.phase==='finale'||F.phase==='change'?n:F.count;
 return Array.from({length:n},(_,i)=>`<span class="${i<done?'done':''}"></span>`).join('');}

// ── Music ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Each garden has its own piece (key, mode, tempo, metre) made of four layers, one for each of its flowers: a layer joins the piece
// when its flower's light begins to spread, so the garden's music grows voice by voice. Each opening has its own motif, rising with
// the petals; the light spreading brings a quick shimmer; the fifth press plays the whole piece and ends on a struck chord. Every
// instrument is a recording of a real instrument (plucked, struck or blown); nothing is held as a pad: every note ends.
const FP_SCALES={major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],dorian:[0,2,3,5,7,9,10],pent:[0,2,4,7,9],mixolydian:[0,2,4,5,7,9,10]};
export function fpNote(key,mode,d){const S=FP_SCALES[mode]||FP_SCALES.major,n=S.length,o=Math.floor(d/n);return key+S[((d%n)+n)%n]+12*o;}
// chord roots (scale degrees), two progressions that take turns every four bars, so the cycles are never identical
const FP_PROG={prat:[[0,3,5,4],[0,5,3,4]],estany:[[0,1,0,4],[5,1,3,0]],bosc:[[0,3,0,6],[0,2,3,4]],nit:[[0,3,1,4],[0,2,3,0]],hivernacle:[[0,6,3,0],[0,6,4,3]]};
// the layer of each flower, in the order the flowers open
export const FP_LAYERS=Object.freeze({
 prat:[{role:'arp',inst:'guitarRec',pan:-.25},{role:'mel',inst:'fluteRec',pan:.1},{role:'bass',inst:'violinsPizzRec',pan:.15},{role:'spark',inst:'glockRec',pan:-.1}],
 estany:[{role:'arp',inst:'dsArpa',pan:-.25},{role:'chord',inst:'vibRec',pan:.2},{role:'mel',inst:'clarinetRec',pan:.05},{role:'bass',inst:'celliPizzRec',pan:.1}],
 bosc:[{role:'arp',inst:'marimbaRec',pan:-.2},{role:'mel',inst:'oboeRec',pan:.1},{role:'bass',inst:'celliPizzRec',pan:.1},{role:'counter',inst:'dsFagot',pan:-.1}],
 nit:[{role:'arp',inst:'dsPiano',pan:-.15},{role:'spark',inst:'kalimbaRec',pan:.2},{role:'chime',inst:'glockRec',pan:-.2},{role:'harp',inst:'dsArpa',pan:.1}],
 hivernacle:[{role:'arp',inst:'marimbaRec',pan:-.2},{role:'udu',inst:'uduRec',pan:.15},{role:'spark',inst:'kalimbaRec',pan:-.1},{role:'mel',inst:'fluteRec',pan:.1}]});
// the subdivisions of a bar (6 in 6/8 and 3/4, 8 in 4/4) and their length in beats
const fpSubs=G=>G.metre===6?{n:6,len:G.beat}:G.metre===3?{n:6,len:G.beat/2}:{n:8,len:G.beat/2};
export const fpBarLen=G=>G.metre*G.beat;
// The tunes: eight bars, [subdivision, scale degree from the key, length in subdivisions]; the second half answers the first.
const FP_TUNES={
 prat:[[[0,4,2],[2,5,1],[3,4,3]],[[0,3,2],[2,5,1],[3,7,3]],[[0,7,2],[2,6,1],[3,5,3]],[[0,4,3],[3,1,3]],[[0,2,2],[2,4,1],[3,7,3]],[[0,8,2],[2,7,1],[3,5,3]],[[0,6,2],[2,5,1],[3,3,3]],[[0,4,3],[3,4,1],[4,1,1],[5,2,1]]],
 estany:[[[0,4,2],[2,6,2],[4,7,2]],[[0,8,3],[3,6,1],[4,5,2]],[[0,4,4],[4,2,2]],[[0,1,4],[4,2,2]],[[0,4,2],[2,6,2],[4,9,2]],[[0,8,2],[2,6,2],[4,5,2]],[[0,5,3],[3,6,1],[4,5,2]],[[0,4,6]]],
 bosc:[[[0,4,3],[3,5,1],[4,6,2],[6,4,2]],[[0,5,4],[4,3,2],[6,2,2]],[[0,4,3],[3,2,1],[4,0,4]],[[0,1,2],[2,2,2],[4,3,2],[6,1,2]],[[0,7,3],[3,6,1],[4,4,4]],[[0,2,2],[2,4,2],[4,5,4]],[[0,3,3],[3,2,1],[4,3,2],[6,4,2]],[[0,4,8]]],
 nit:[[[0,4,4],[4,3,4]],[[0,5,6],[6,4,2]],[[0,3,4],[4,2,4]],[[0,4,8]],[[0,6,4],[4,5,4]],[[0,7,6],[6,5,2]],[[0,4,4],[4,3,2],[6,2,2]],[[0,0,8]]],
 hivernacle:[[[0,4,1],[1,4,1],[2,6,2],[4,7,2],[6,6,2]],[[0,4,3],[3,2,1],[4,1,4]],[[0,3,2],[2,4,2],[4,5,2],[6,4,2]],[[0,2,6],[6,1,2]],[[0,7,1],[1,7,1],[2,8,2],[4,9,2],[6,8,2]],[[0,7,3],[3,6,1],[4,4,4]],[[0,5,2],[2,4,2],[4,3,2],[6,2,2]],[[0,0,6]]]};
export const FP_LOUD=2.6;
// One bar of the layers that sound now. n: the bar of the piece; layers: their indices; k: 1 normal, less while the garden waits; full:
// the finale (every layer, a little denser).
export function fpBar(G,n,layers,o={}){const out=[],key=G.key,mode=G.mode,S=fpSubs(G),u=S.len,P=FP_PROG[G.id][Math.floor(n/4)%2],root=P[n%4],L=FP_LOUD*(o.k??1),v=Math.floor(n/8)%2;
 const put=(t,len,inst,ds,vel,pan=0)=>{const notes=ds.map(d=>fpNote(key,mode,d)),sh=escFit(notes,inst);out.push({t,len,inst,midi:notes.map(m=>escInto(m+sh,inst)),vel:Math.min(1,vel*L),pan});};
 const one=(t,len,inst,d,vel,pan,shift=0)=>{const m=fpNote(key,mode,d)+shift;out.push({t,len,inst,midi:[escInto(m,inst)],vel:Math.min(1,vel*L),pan});};
 for(const li of layers){const Ly=FP_LAYERS[G.id][li];if(!Ly)continue;const I=Ly.inst,pan=Ly.pan;
  switch(Ly.role){
  case 'arp':{const pat=S.n===6?(v?[0,4,7,9,7,4]:[0,2,4,7,4,2]):(v?[0,4,7,4,9,4,7,4]:[0,4,2,4,7,4,2,4]),dense=o.full||n%4!==3;
   for(let i=0;i<S.n;i++){if(!dense&&i%2)continue;one(i*u,u*2.2,I,root+pat[i],(i===0?.2:.14)+(o.full?.03:0),pan,i===0?0:12);}break;}
  case 'mel':{const bar=FP_TUNES[G.id][n%8];const ds=bar.map(x=>x[1]),sh=escFit(ds.map(d=>fpNote(key,mode,d)),I);for(const [s0,d,l] of bar)out.push({t:s0*u,len:l*u*.92,inst:I,midi:[escInto(fpNote(key,mode,d)+sh,I)],vel:Math.min(1,(.17+(o.full?.03:0))*L),pan});break;}
  case 'bass':{one(0,u*2.5,I,root,.2,pan,-12);one(S.n/2*u,u*2,I,root+4,.15,pan,-12);if(o.full||n%2)one((S.n-1)*u,u,I,root+(S.n===6?2:5),.11,pan,-12);break;}
  case 'spark':{const k=o.full?3:2;for(let i=0;i<k;i++){const step=Math.floor(Krand(n*7+i,G.key)*S.n),d=root+[7,9,11,14][Math.floor(Krand(n*7+i,G.key+1)*4)];one(step*u,1.6,I,d,.1+.03*Krand(n+i,5),pan);}break;}
  case 'chord':{put(0,fpBarLen(G)*.9,I,[root,root+2,root+4],.12,pan);if(n%2||o.full)put(S.n/2*u,fpBarLen(G)*.45,I,[root+2,root+4],.08,pan);break;}
  case 'counter':{one(0,u*S.n/2*.9,I,root+2,.13,pan,-12);one(S.n/2*u,u*S.n/2*.9,I,root+(v?5:4),.12,pan,-12);break;}
  case 'chime':{one(S.n/2*u,2.4,I,root+14,.08,pan);if(o.full)one(u*(S.n-2),2,I,root+16,.07,pan);break;}
  case 'harp':{if(n%2===0||o.full)for(let i=0;i<5;i++)one(i*.13,2.2,I,root+[0,2,4,7,9][i],.11,pan);break;}
  case 'udu':{for(const [s0,d,vel] of [[0,0,.26],[3,4,.16],[4,0,.2],[6,4,.14]])if(s0<S.n)one(s0*u,.8,I,root+d,vel,pan,-12);break;}
  }}
 return out;}
// The motif of an opening: a phrase on the flower's instrument that rises with the petals (D: the opening, in seconds).
// (the vibraphone and the udu reach too few notes for a rising phrase: their flowers' motifs are played on the harp and the kalimba)
const FP_MOTIF_INST={vibRec:'dsArpa',uduRec:'kalimbaRec'};
export function fpMotif(G,k,D){const Ly=FP_LAYERS[G.id][k],I=FP_MOTIF_INST[Ly.inst]||Ly.inst,out=[],key=G.key,mode=G.mode,t0=.13*D,span=.52*D,[lo,hi]=escRange(I);let ds=[0,2,4,7,9].map(d=>d+k%2*2),notes=ds.map(d=>fpNote(key,mode,d));let sh=escFit(notes,I);if(notes[0]+sh<lo||notes[4]+sh>hi){ds=ds.slice(0,4);notes=notes.slice(0,4);sh=escFit(notes,I);if(notes[0]+sh<lo||notes[3]+sh>hi){ds=[-3,0,2,4];notes=ds.map(d=>fpNote(key,mode,d));sh=escFit(notes,I);}}
 const sustained=['fluteRec','clarinetRec','oboeRec','dsFagot'].includes(I);ds.forEach((d,i)=>{const t=t0+span*Math.pow(i/(ds.length-1),.9);out.push({t,len:sustained?span/ds.length*.9:2,inst:I,midi:[escInto(notes[i]+sh,I)],vel:Math.min(1,(.13+.025*i)*FP_LOUD),pan:Ly.pan});});
 return out;}
// The shimmer when a flower's light begins to spread: a quick run up the scale, harp or glockenspiel.
export function fpShimmer(G,k){const I=G.id==='estany'||G.id==='nit'?'dsArpa':'harpRec',out=[];for(let i=0;i<8;i++){const d=7+i+(k%2),m=fpNote(G.key,G.mode,d);out.push({t:i*.075,len:1.6,inst:I,midi:[escInto(m,I)],vel:Math.min(1,(.06+.012*i)*FP_LOUD),pan:-.3+.6*i/7});}
 out.push({t:.65,len:2.2,inst:'glockRec',midi:[escInto(fpNote(G.key,G.mode,14+k%3*2),'glockRec')],vel:.1*FP_LOUD,pan:.2});return out;}
// The end of the finale: a struck chord that rings away; and the soft greeting of a new garden.
export function fpCadence(G){const out=[],key=G.key,mode=G.mode,put=(t,len,inst,d,vel,pan,shift=0)=>out.push({t,len,inst,midi:[escInto(fpNote(key,mode,d)+shift,inst)],vel:Math.min(1,vel*FP_LOUD),pan});
 [0,2,4,7,9,11,14].forEach((d,i)=>put(i*.06,3.4,'harpRec',d,.16-.008*i,-.3+i*.1));put(0,3,'celliPizzRec',0,.22,0,-12);put(.42,3,'glockRec',14,.1,.25);put(.42,3,'glockRec',18,.08,-.25);return out;}
export function fpGreeting(G){const out=[];[0,4,7].forEach((d,i)=>out.push({t:i*.22,len:2,inst:'kalimbaRec',midi:[escInto(fpNote(G.key,G.mode,d),'kalimbaRec')],vel:.1*FP_LOUD,pan:-.2+.2*i}));return out;}

// ── Sounds ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The garden's air (two nature loops, louder as flowers open, quieter while the garden waits), the paper (unfolding, sliding, the wings
// of paper), and the visitors. All from the collection's banks (CREDITS.md): natureRec, sabanaRec (paper), masiaRec (bees, frog),
// selvaRec (hummingbird), pouRec (drops). The bees play the same recording at other speeds: the bumblebee and the carpenter bee lower.
class FpSound{
 constructor(ctx,out){this.context=ctx;this.input=ctx.createGain();this.input.gain.value=1;this.input.connect(out);this.loops=new Map();this.active=new Set();}
 zone(bank,name){const z=sampleZone(bank,0,name);return z&&z.buffer?z:null;}
 one(bank,name,level=1,pan=0,when=0,rate=1,dur=0){const z=this.zone(bank,name);if(!z)return;const c=this.context,o=c.createBufferSource(),g=c.createGain(),p=c.createStereoPanner(),t=c.currentTime+when;o.buffer=z.buffer;o.playbackRate.value=rate;g.gain.value=level;p.pan.value=Math.max(-1,Math.min(1,pan));
  o.connect(g);g.connect(p);p.connect(this.input);o.start(t,(z.offset||0)+z.shift);if(dur>0){g.gain.setValueAtTime(level,t+dur*.7);g.gain.linearRampToValueAtTime(0,t+dur);o.stop(t+dur+.05);}
  this.active.add(o);o.onended=()=>{this.active.delete(o);o.disconnect();g.disconnect();p.disconnect();};}
 loop(key,bank,name,level,tc=.6){let L=this.loops.get(key);const c=this.context;
  if(!L){if(level<.002)return;const z=this.zone(bank,name);if(!z)return;const o=c.createBufferSource(),g=c.createGain();o.buffer=z.buffer;o.loop=true;const a=(z.loopStart??z.offset??0)+z.shift,e=(z.loopEnd??z.buffer.duration-z.shift)+z.shift;o.loopStart=a;o.loopEnd=Math.min(z.buffer.duration,e);g.gain.value=0;
   o.connect(g);g.connect(this.input);o.start(c.currentTime,a+Math.random()*Math.max(0,o.loopEnd-a));L={o,g};this.loops.set(key,L);}
  L.g.gain.setTargetAtTime(level,c.currentTime,tc);if(level<.002&&L.g.gain.value<.003){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();this.loops.delete(key);}}
 stop(){for(const o of this.active){try{o.stop();}catch{}}this.active.clear();for(const [,L] of this.loops){try{L.o.stop();}catch{}L.o.disconnect();L.g.disconnect();}this.loops.clear();}}
let FP_BUS=null;
const fpBus=(ctx,out)=>{if(!ctx||!out)return null;if(!FP_BUS||FP_BUS.context!==ctx)FP_BUS=new FpSound(ctx,out);return FP_BUS;};
export function fpSilence(){FP_BUS?.stop();}
export const FP_AIR=6;
// The sound of the paper of each technique as a flower unfolds (sabanaRec: paper unfolding, sliding, paper wings), and its speed.
const FP_PAPER={crepe:['paperDesplega',.85],tissue:['paperLlisca',1.15],card:['paperDesplega',.75],water:['paperLlisca',.95]};
// The voice of each visitor: [bank, name, level, rate] (null: a silent visitor)
export const FP_VOICE=Object.freeze({abella:['masiaRec','abelles',.22,1.15],borinot:['masiaRec','abelles',.26,.72],fusteria:['masiaRec','abelles',.24,.62],papallona:['sabanaRec','paperAles',.14,1.25],
 papallonaMarro:['sabanaRec','paperAles',.14,1.1],morfo:['sabanaRec','paperAles',.16,.95],arna:['sabanaRec','paperAles',.12,1.4],libellula:['sabanaRec','paperAles',.12,1.6],cavallserp:['sabanaRec','paperAles',.12,1.5],
 colibri:['selvaRec','colibri',.3,1],granota:['masiaRec','granota',.3,1],gotes:['pouRec','gotes',.3,1],merla:['natureRec','blackbird',.5,1],marieta:null,cargol:null,lluernes:null});
// Each frame: the cues of the model, the air, and the music bar by bar, half a second ahead through «play».
export function fpAudio(game,s,ctx,out,play){const F=game?.flor;if(!F)return;const cues=F.cues.splice(0);if(!s.sound||ctx?.state!=='running')return;const bus=fpBus(ctx,out);if(!bus)return;
 const now=ctx.currentTime,G=FP_GARDENS[fpGardenOf(F)],D=fpOpenSpan(s),wk=F.wait?escWaitClock(F.wait,F.t):{rate:1,dark:0,still:false},M=F.music||(F.music={at:now+.4,n:0,g:-1});
 const fid=k=>F.mode==='una'?FP_ALL[((F.single%20)+20)%20]:FP_ORDER[F.g][k],layerOf=k=>F.mode==='una'?FP_ORDER[fpGardenOf(F)].indexOf(fid(0)):k;
 for(const cue of cues){
  if(cue==='garden'){M.g=-1;M.n=0;for(const e of fpGreeting(G))play(e,.3+e.t,e.len);}
  else if(cue.startsWith('open:')){const k=+cue.slice(5),sp=fpSpecies(fid(k)),pp=FP_PAPER[sp?.tech||G.tech]||FP_PAPER.tissue,pan=F.mode==='una'?0:(G.slots[k]?.x??.5)*1.2-.6;
   bus.one('sabanaRec',pp[0],.32,pan,.13*D,pp[1]);bus.one('sabanaRec','paperLlisca',.2,pan,.4*D,pp[1]*.9);for(const e of fpMotif(G,layerOf(k),D))play(e,e.t,e.len);M.held=now;}
  else if(cue.startsWith('tint:')){const k=+cue.slice(5);for(const e of fpShimmer(G,layerOf(k)))play(e,e.t,e.len);}
  else if(cue.startsWith('visit:')){const k=+cue.slice(6),sp=fpSpecies(fid(k)),V=sp&&FP_VOICE[sp.creature];if(V&&s.flCreatures!==false){const pan=F.mode==='una'?.2:(G.slots[k]?.x??.5)*1.2-.6;
    if(V[0]==='natureRec'){M.bird=now+6;M.birdLevel=V[2];}else bus.one(V[0],V[1],V[2],pan,0,V[3],V[0]==='masiaRec'&&V[1]==='abelles'?4:0);}}
  else if(cue==='finale'){M.finale=now;M.cadence=now+FP_FINALE-3.6;M.cadenceDone=false;}
  else if(cue==='change'){bus.one('sabanaRec','paperLlisca',.28,0,0,.8);bus.one('sabanaRec','paperDesplega',.22,.2,.5,.7);}}
 // the air of the garden: louder with every open flower, quieter while the garden waits
 const open=F.opened.filter(x=>x!=null).length,airK=s.flNature===false?0:(.55+.45*Math.min(1,open/4))*(1-.45*(wk.dark||0));
 for(let i=0;i<2;i++){const A=G.amb[i];bus.loop('air'+i+G.id,A[0],A[1],FP_AIR*A[2]*airK,.8);}
 for(const g of FP_GARDENS)if(g.id!==G.id)for(let i=0;i<2;i++)if(bus.loops.has('air'+i+g.id))bus.loop('air'+i+g.id,g.amb[i][0],g.amb[i][1],0,.8);
 bus.loop('bird','natureRec','blackbird',M.bird&&now<M.bird?FP_AIR*.12*(M.birdLevel||.5):0,.7);
 // the cadence of the finale
 if(M.cadence&&!M.cadenceDone&&now>=M.cadence-.5){M.cadenceDone=true;for(const e of fpCadence(G))play(e,Math.max(0,M.cadence-now)+e.t,e.len);M.at=M.cadence+4;}
 if(F.phase==='change')return;
 // the piece: the layers whose flowers are casting their light; it thins and stops as the garden waits, and starts again at a press
 if(M.g!==fpGardenOf(F)){M.g=fpGardenOf(F);M.n=0;M.at=Math.max(M.at,now+.3);}
 const finale=F.phase==='finale'&&!(M.cadence&&now>=M.cadence-.5);
 while(M.at<now+.5){const t=F.t+(M.at-now),layers=[];if(finale)layers.push(0,1,2,3);else for(let k=0;k<4;k++){if(F.mode==='una'&&k>0)break;const b=fpBloom(F,k,s,t);if(b.tint>0)layers.push(layerOf(k));}
  if(F.mode==='una'&&layers.length&&layers[0]!==0)layers.unshift(0);
  const kk=finale?1.08:wk.still?0:.45+.55*Kclamp(wk.rate??1);
  if(layers.length&&kk>0){const use=kk<.7?layers.slice(0,1):layers;for(const e of fpBar(G,M.n,use,{k:kk,full:finale}))play(e,Math.max(0,M.at+e.t-now),e.len);}
  else if(!layers.length&&F.count===0&&F.mode!=='una'&&M.n%2===0&&!wk.still){const I=FP_LAYERS[G.id][0].inst;play({inst:I,midi:[escInto(fpNote(G.key,G.mode,7),I)],vel:.07*FP_LOUD,pan:-.1},Math.max(0,M.at-now),2);}
  M.at+=fpBarLen(G);M.n++;if(finale)M.lastFull=M.n;}}

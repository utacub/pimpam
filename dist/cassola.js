// La cassola d'en Glups (EN23), 0.27: rebuilt from the start in ancient Greece. Glups, a cook with a curly beard and an olive wreath,
// stirs a bronze cauldron on a terrace over the sea. The child makes a recipe of two choices, from the niches of the wall: first a
// magic ingredient (a feather, heads of garlic or a loaf of bread), which Glups tries at once (a pair of little wings, two more heads,
// half of him dancing on its own), and then an animal biscuit of honey. Glups tastes the soup and becomes a mythical creature of the
// Greeks, made of the two: the feather gives wings (Pegasus, the griffin, the phoenix, the dragon of the golden apples), the garlic gives
// more heads (Cerberus, the Hydra, the Chimera) and the bread keeps half of Glups (the Minotaur, the centaur, Medusa, the siren). Each
// creature has its own short comic scene, in its own place, about its myth; then a hiccup brings Glups back to his terrace. The same
// recipe always gives the same creature and the same scene. With «Un ingredient sorpresa» (potPick 'one') each turn shows one option,
// chosen by the round, and a third press, on the ladle, is the tasting.
import {SAMPLE_BANK} from './sampler.js';
const gpFreeze=list=>Object.freeze(list.map(x=>Object.freeze(x)));
// The magic ingredients (first turn). word is what the assistive technologies say (nothing is written on the board); soup is the
// colour the soup takes.
export const GP_MAGICS=gpFreeze([{id:'feather',word:'Ploma',soup:'#eef0ff'},{id:'garlic',word:'All',soup:'#cfe0a0'},{id:'bread',word:'Pa',soup:'#f2c47a'}]);
// The honey biscuits in the shape of an animal (second turn).
export const GP_ANIMALS=gpFreeze([{id:'horse',word:'Cavall'},{id:'lion',word:'Lleó'},{id:'bird',word:'Ocell'},{id:'snake',word:'Serp'},{id:'dog',word:'Gos'},{id:'bull',word:'Brau'}]);
// The biscuits that go with each magic ingredient, in the order they are shown.
export const GP_TREE=Object.freeze({feather:Object.freeze(['horse','lion','bird','snake']),garlic:Object.freeze(['dog','snake','lion']),bread:Object.freeze(['bull','horse','snake','bird'])});
// The creatures: a magic ingredient and a biscuit each. glow: the colour of the magic steam when Glups changes.
export const GP_CREATURES=gpFreeze([
 {id:'pegasus',name:'Pègas',magic:'feather',animal:'horse',glow:'#bfe4ff'},
 {id:'griffin',name:'El grifó',magic:'feather',animal:'lion',glow:'#ffe08a'},
 {id:'phoenix',name:'El fènix',magic:'feather',animal:'bird',glow:'#ffb35c'},
 {id:'dragon',name:'El drac de les pomes d’or',magic:'feather',animal:'snake',glow:'#b9ef8f'},
 {id:'cerberus',name:'Cèrber',magic:'garlic',animal:'dog',glow:'#c9b3ff'},
 {id:'hydra',name:'La hidra',magic:'garlic',animal:'snake',glow:'#9fe6c8'},
 {id:'chimera',name:'La quimera',magic:'garlic',animal:'lion',glow:'#ffc28a'},
 {id:'minotaur',name:'El minotaure',magic:'bread',animal:'bull',glow:'#ffd0a0'},
 {id:'centaur',name:'El centaure',magic:'bread',animal:'horse',glow:'#d8f0a0'},
 {id:'medusa',name:'Medusa',magic:'bread',animal:'snake',glow:'#c8f0b0'},
 {id:'siren',name:'La sirena',magic:'bread',animal:'bird',glow:'#a8e8ff'}]);
// The ladle: the last press of «Un ingredient sorpresa».
export const GP_LADLE=Object.freeze({id:'ladle',word:'Cullerot'});
export const gpCreature=(magic,animal)=>GP_CREATURES.find(x=>x.magic===magic&&x.animal===animal)||null;
// Four times of day, one per round in turn: what changes is the light of the sky and the sea.
export const GP_DAYS=gpFreeze([
 {id:'morning',sky:['#9fd3ee','#d9eef6','#fbefd8'],sea:['#3d8fc4','#76b9dc'],sun:'#fff3c8',light:.12,isles:'#9fb6cf'},
 {id:'noon',sky:['#5fb2e6','#a8daf4','#e6f5fb'],sea:['#1f74b8','#4aa3d8'],sun:'#ffffff',light:.08,isles:'#86a6c4'},
 {id:'evening',sky:['#f59a6a','#fbc68a','#fde6b4'],sea:['#3a6f9e','#c98a78'],sun:'#ffe0a0',light:.18,isles:'#b58aa0'},
 {id:'night',sky:['#1d2c58','#34487c','#5d6c9a'],sea:['#1c3360','#2e4c80'],sun:'#fff2c4',light:.22,isles:'#3a4a78'}]);
const gpR=round=>Math.max(0,round|0);
export const gpDay=round=>GP_DAYS[gpR(round)%GP_DAYS.length];
// Seconds. GP_STEP: the first choice (the ingredient flies into the cauldron, plops, and Glups tries it). GP_SHOW: the last one (the
// biscuit, the tasting, the change, the scene of the creature and the way back).
export const GP_STEP=3.2,GP_SHOW=16;
export const GP_T=Object.freeze({fly:.75,plop:.75,glow:.9,lift:1.25,sip:1.85,slurp:1.9,wow:2.45,swirl:2.75,poof:2.85,cross:3.05,scene:3.7,sceneEnd:13.2,hic:13.2,back:13.35,home:13.95,cadence:14.4,rest:15.4,
 // the step: the plop, then Glups tries the ingredient
 tryIn:1.0,tryOut:2.9});
const gpHash=(i,s)=>{let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
// «Un ingredient sorpresa»: the option of each turn changes from round to round, never the same as in the round before.
export function gpSurprise(round,stage,count){const r=gpR(round)%400,n=Math.max(1,count|0);if(n===1)return 0;let k=Math.floor(gpHash(stage+7,3)*n);for(let i=1;i<=r;i++)k=(k+1+Math.floor(gpHash(i,stage*31+5)*(n-1)))%n;return k;}
export const gpStageCount=mode=>mode==='one'?3:2;
// The choices of a turn as ids. With n options and a longer list, the list turns from round to round (n at a time), so that every
// ingredient and every biscuit comes in its turn; a recipe always gives the same creature. With «Un ingredient sorpresa», one option
// chosen by the round, and then the ladle. picks: the choices already made (the biscuits depend on the magic ingredient).
export function gpOptions(stage,n=3,round=0,mode='choose',picks=[]){const k=Math.max(0,stage|0),v=(picks||[]).map(p=>p?.value??p),magic=v.find(id=>GP_TREE[id])||GP_MAGICS[0].id;
 if(mode==='one'){if(k>=2)return [GP_LADLE.id];const list=k===0?GP_MAGICS.map(x=>x.id):GP_TREE[magic];return [list[gpSurprise(round,k*7+list.length,list.length)]];}
 const list=k===0?GP_MAGICS.map(x=>x.id):GP_TREE[magic],m=Math.max(2,Math.min(4,n|0));if(list.length<=m)return [...list];
 const off=(gpR(round)*m)%list.length;return Array.from({length:m},(_,i)=>list[(off+i)%list.length]);}
export const gpItem=id=>id===GP_LADLE.id?GP_LADLE:[...GP_MAGICS,...GP_ANIMALS].find(x=>x.id===id)||null;
// A recipe from the picks (ids or the options of the scanning catalogue): the magic ingredient, the biscuit and the creature (null
// while it is not complete).
export function gpRecipe(picks=[]){const v=picks.map(p=>p?.value??p).filter(x=>x&&x!==GP_LADLE.id),magic=v.find(id=>GP_TREE[id])||null,animal=v.find(id=>GP_ANIMALS.some(a=>a.id===id))||null;
 return {magic,animal,creature:magic&&animal?gpCreature(magic,animal):null};}
// ── The music ───────────────────────────────────────────────────────────────────────────────────────────────────────────
// Recorded acoustic instruments only, and every piece ends on plucked or struck notes; a held note (the winds, the roll of the snare)
// never lasts a second. Each magic ingredient has its key and its band: the feather, D major, the harp with the flute and the
// glockenspiel (air); the garlic, G major, plucked strings with the oboe (a little grumpy); the bread, F major, the marimba with the
// clarinet (the dance of the half of Glups that dances on its own). The scene of each creature has its own cue (GP_CUES): a soft groove
// of the band under the jokes, the music the scene plays itself (the lyre of Orpheus and of the centaur, the choir of the Hydra, the
// song of the siren) and the sounds of the jokes, each at its moment.
export const GP_BANDS=Object.freeze({
 feather:Object.freeze({root:62,lead:'harpRec',bass:'celliPizzRec',wind:'fluteRec',bell:'glockRec'}),
 garlic:Object.freeze({root:55,lead:'violinsPizzRec',bass:'celliPizzRec',wind:'oboeRec',bell:'glockRec'}),
 bread:Object.freeze({root:65,lead:'marimbaRec',bass:'celliPizzRec',wind:'clarinetRec',bell:'glockRec'})});
// Loudness (review copies, EBU R128; the sampler's gain goes with the square of the velocity, so ×1.3 is +4.6 dB). GP_LOUD: the whole
// show (−34 → about −29.5 LUFS, like the other scanning shows); GP_STEPLOUD: the answer to a choice; GP_TASTE: the taste of an option
// in the focus, 2–4 dB under the answers.
export const GP_LOUD=1.3,GP_STEPLOUD=1.18,GP_TASTE=1.15;
// The trim of a show in dB (measured: the centaur and Medusa came out about 1.5 dB under the others, the minotaur 0.6 dB).
const GP_TRIM=Object.freeze({centaur:1.3,medusa:1.3,minotaur:.6});
const GP_MAJ=[0,2,4,5,7,9,11];
// A degree of the major scale over root (0 the tonic, 7 an octave up); a half degree (4.5) is a semitone over the degree: out of tune.
const gpDeg=(root,d)=>{const f=Math.floor(d);return root+GP_MAJ[((f%7)+7)%7]+12*Math.floor(f/7)+(d-f>0?1:0);};
export function gpFit(inst,m){const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;}
const gpNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>gpFit(inst,m)),t,len,vel:Math.min(1,vel),...x});
// A writer of notes for a band, t0 the time of u = 0: n (notes on degrees; inst is a part of the band or an instrument), fx (a sound by
// its name), arp (one note after another), bed (the soft groove: a plucked bass on beats 1 and 3 and the chords of the lead between).
function gpWriter(magic,t0,out){const B=GP_BANDS[magic]||GP_BANDS.feather,W={B,
 n:(inst,degs,u,len,vel,oct=0,x={})=>out.push(gpNote(B[inst]||inst,[].concat(degs).map(d=>gpDeg(B.root+oct,d)),t0+u,len,vel,x)),
 fx:(inst,variant,u,len,vel)=>out.push(gpNote(inst,[0],t0+u,len,vel,variant?{variant}:{})),
 arp:(inst,degs,u,step,len,vel,oct=0)=>degs.forEach((d,i)=>W.n(inst,d,u+i*step,len,vel,oct)),
 bed:(u0,u1,bpm,prog=[0,3,4,0],vel=1)=>{const b=60/bpm;for(let i=0,u=u0;u<u1-.05;i++,u+=b){const ch=prog[Math.floor(i/4)%prog.length],beat=i%4;
  if(beat%2===0)W.n('bass',ch+(beat?4:0),u,.45,.3*vel,-12);else W.n('lead',[ch,ch+2,ch+4],u,.3,.14*vel);}}};return W;}
// The cue of each creature: u from 0 to 9.5, the time of its scene (cassola-mites*.js).
export const GP_CUES=Object.freeze({
 pegasus(W){W.bed(0,2.5,112,[0,3,4,0]);W.n('lead',4,1.05,.4,.28);W.fx('woodblockRec','claves',1.48,.2,.28);W.n('lead',5,1.75,.4,.28);W.fx('woodblockRec','claves',2.18,.2,.28);
  for(let i=0;i<6;i++)W.fx('woodblockRec','claves',2.5+i*.12,.15,i%3?.14:.22);W.fx('toonRec','slideUp',3.12,1,.42);W.fx('natureRec','wind',3.3,2.3,.22);
  W.arp('lead',[0,1,2,3,4,5,6,7,8,9],3.3,.07,.6,.22);W.n('wind',4,3.95,.7,.28,12);W.n('wind',6,4.65,.6,.26,12);W.n('wind',7,5.25,.7,.28,12);W.arp('lead',[9,8,7,6,5,4,3,2],5.4,.06,.5,.2);
  W.fx('toonRec','boing',5.95,1,.45);W.n('wind',4,6.7,.5,.22,12);W.n('wind',2,7.25,.6,.22,12);W.fx('toonRec','plop',7.97,.5,.45);
  W.n('lead',[0,4,7],8.5,1.2,.3,0,{strum:.04});W.arp('bell',[0,2,4,7],8.5,.09,.8,.26,12);W.n('bell',9,9.1,.5,.16,12);},
 griffin(W){W.bed(0,1.5,96,[0,4,0,4],.8);W.arp('lead',[9,7,5,4],.2,.35,.7,.2);W.arp('oboeRec',[2,3,4],1.6,.24,.2,.28);W.fx('toonRec','poof',2.24,1.48,.55);
  W.fx('toonRec','clink',2.35,.5,.45);W.arp('bell',[7,11,9,12,10,14,8,13],2.42,.11,.4,.15,12);for(const u of [2.72,3.05,3.3])W.fx('toonRec','clink',u,.5,.3);
  W.fx('toonRec','clink',3.46,.5,.5);W.n('bell',4,3.48,.6,.24,12);W.fx('toonRec','clatter',4.65,1.6,.36);W.arp('lead',[0,1,2,3,4,5,6,7],4.7,.06,.5,.2);W.arp('lead',[7,6,5,4,3,2,1,0],5.5,.06,.5,.18);
  W.fx('toonRec','slideDown',6.35,1.48,.36);W.fx('triangleRec','hit',7.25,1,.36);W.fx('toonRec','clink',7.26,.5,.45);W.arp('bell',[4,2],7.9,.15,.5,.2,12);
  W.arp('lead',[0,2,4,7],8.45,.08,1,.3);W.arp('bell',[7,9,11,14],8.5,.08,.8,.22,12);W.bed(8.0,9.4,108,[0,4,0,0],.7);},
 phoenix(W){W.bed(0,2.0,84,[0,5,3,4],.8);W.arp('wind',[4,2],.85,.3,.32,.24,12);W.arp('lead',[4,2,0,2],1.4,.22,.6,.18);
  W.fx('fireRec','bloom',2.0,1.5,.36);W.fx('fireRec','crackle',2.4,1.2,.3);W.fx('fireRec','shimmer',3.0,1,.26);W.fx('toonRec','poof',3.6,1.48,.42);W.n('bell',0,4.3,.6,.12,12);
  W.fx('woodblockRec','claves',4.86,.15,.18);W.fx('woodblockRec','claves',4.98,.15,.18);W.fx('toonRec','plop',5.3,.5,.55);W.n('bell',7,5.34,.5,.2,12);
  W.fx('toonRec','poof',5.8,.5,.2);W.fx('toonRec','poof',6.05,.5,.18);W.fx('toonRec','jelly',6.3,1,.32);W.fx('toonRec','inflate',6.6,.85,.36);
  W.arp('lead',[0,2,4,7,9],7.3,.07,.6,.22);W.n('wind',7,7.6,.5,.22,12);W.fx('woodblockRec','claves',8.56,.2,.28);W.arp('bell',[0,4,7,11],8.72,.08,.8,.24,12);W.bed(8.9,9.4,96,[0],.6);},
 dragon(W){W.bed(0,1.4,100,[0,3,4,0]);W.fx('woodblockRec','claves',1.42,.2,.36);W.fx('toonRec','boing',1.45,1,.32);W.arp('violinsPizzRec',[4,3,4,3],1.9,.2,.2,.22);
  W.fx('toonRec','slurp',2.8,.85,.42);W.fx('toonRec','slideDown',3.02,1.48,.3);W.bed(3.6,4.2,100,[4]);W.fx('toonRec','plop',4.62,.5,.42);W.fx('toonRec','slurp',4.78,.5,.32);
  for(let i=0;i<7;i++)W.fx('woodblockRec','claves',5.5+i*.1,.12,.12+.04*(i%2));W.fx('toonRec','clatter',5.6,1.6,.22);for(const u of [6.0,6.2,6.4])W.fx('toonRec','plop',u,.5,.36);
  W.fx('toonRec','inflate',6.5,.85,.46);W.fx('toonRec','cards',6.9,.5,.26);W.fx('toonRec','plop',7.95,.5,.38);W.n('tubaRec',0,7.95,.3,.28,-24);W.fx('toonRec','blub',8.25,.6,.36);W.arp('lead',[2,0],8.7,.2,.7,.2);},
 cerberus(W){W.n('tubaRec',4,.62,.25,.46,-12);W.n('tubaRec',0,1.22,.3,.46,-12);W.bed(.2,2.4,92,[0,4,0,4],.8);
  for(let k=0;k<4;k++){const ch=[0,3,4,0][k],u=2.4+k*1.2;W.n('lead',ch,u,.6,.26,-12);W.arp('harpRec',[ch+2,ch+4,ch+7],u+.4,.4,.8,.24);}W.n('harpRec',[0,4,7],6.6,1.2,.26,-12,{strum:.05});
  for(let i=0;i<3;i++){W.n('wind',4,4.85+i*.3,.3,.2,12);W.n('wind',1,5.1+i*.3,.35,.18,12);}W.n('bell',7,6.45,.6,.1,12);W.n('bell',9,6.95,.6,.1,12);
  W.arp('lead',[4,2,4,2,4,2,4,2],6.75,.17,.12,.18);W.fx('toonRec','doorOpen',7.25,1,.32);W.fx('toonRec','doorClose',8.2,.6,.32);W.fx('triangleRec','hit',8.5,1,.28);W.n('bell',7,8.52,.5,.2,12);},
 hydra(W){W.fx('natureRec','frogs',.1,2.4,.22);W.arp('wind',[2,3,4],1.6,.22,.2,.26,12);W.fx('toonRec','poof',2.27,1.48,.5);W.fx('toonRec','plop',2.55,.5,.4);W.fx('toonRec','plop',2.7,.5,.4);
  W.arp('wind',[4,5,6],4.3,.2,.18,.28,12);W.fx('toonRec','poof',4.87,1.48,.5);W.fx('toonRec','plop',5.15,.5,.4);W.fx('toonRec','plop',5.3,.5,.4);W.arp('lead',[4,2,4],5.65,.2,.2,.2);
  [[6.3,0,'clarinetRec'],[6.62,2,'oboeRec'],[6.94,4,'fluteRec'],[7.26,7,'clarinetRec']].forEach(([u,d,i])=>{W.n(i,d,u,.5,.3,12);W.n('harpRec',d,u,.6,.14);});
  W.n('oboeRec',8.5,7.78,.5,.3,12);W.n('harpRec',[0,4,7],8.75,1.2,.26,-12,{strum:.04});for(const [d,i] of [[0,'clarinetRec'],[4,'oboeRec'],[7,'fluteRec'],[9,'clarinetRec']])W.n(i,d,8.75,.6,.22,12);W.n('bell',[7,14],8.8,.8,.2,12);},
 chimera(W){W.bed(0,.8,104,[0]);W.fx('fireRec','crackle',.85,1,.28);W.fx('woodblockRec','claves',1.95,.15,.2);W.fx('toonRec','yank',1.98,.6,.32);for(let i=0;i<5;i++)W.fx('woodblockRec','claves',2.4+i*.24,.12,.16);
  W.n('wind',6,2.45,.3,.28,12);W.arp('lead',[4,1],2.95,.22,.2,.22);W.bed(3.6,4.4,104,[3,4]);W.fx('fireRec','crackle',4.45,1,.28);W.fx('toonRec','yank',5.3,.6,.3);W.fx('toonRec','slurp',5.6,.5,.3);W.n('wind',5,5.72,.3,.26,12);
  W.arp('bell',[0,2,4],6.7,.12,.5,.18,12);W.fx('fireRec','bloom',7.1,1.5,.3);W.fx('fireRec','crackle',7.3,1,.24);for(const u of [8.0,8.2,8.4])W.fx('toonRec','plop',u,.5,.34);
  for(let i=0;i<5;i++)W.fx('woodblockRec','claves',8.55+i*.16,.12,.14);W.arp('lead',[0,2,4,7],8.9,.08,.5,.28);},
 minotaur(W){for(const u of [.45,.9])W.fx('woodblockRec','claves',u,.15,.2);W.arp('bass',[0,2,4],.45,.45,.4,.26,-12);W.n('timpaniRec',0,1.45,.6,.38,-12);W.fx('woodblockRec','claves',1.45,.2,.36);W.arp('bell',[7,9],1.55,.1,.4,.16,12);
  W.arp('wind',[4,3],1.9,.2,.2,.24);for(const u of [2.3,2.75,3.2])W.fx('woodblockRec','claves',u,.15,.2);W.arp('bass',[4,2,0],2.3,.45,.4,.26,-12);W.n('timpaniRec',0,3.35,.6,.38,-12);W.fx('woodblockRec','claves',3.35,.2,.36);
  W.arp('lead',[7,6,5,4,3,2,1,0],3.85,.09,.3,.2);W.fx('toonRec','yank',4.75,.6,.32);W.fx('toonRec','stretch',5.1,.9,.26);W.arp('lead',[0,1,2,3,4,5],5.0,.31,.3,.22);
  for(const [u,d] of [[7.33,0],[7.67,2],[8.0,4]]){W.fx('woodblockRec','claves',u,.15,.24);W.n('wind',d,u-.15,.2,.22);}W.fx('toonRec','yank',8.02,.6,.28);W.arp('bell',[4,7,9],8.15,.09,.6,.22,12);W.arp('lead',[0,4,7],8.65,.08,.6,.26);},
 centaur(W){const dance=(u0,u1)=>{for(let i=0,u=u0;u<u1-.05;i++,u+=.5){const ch=[0,4,0,3][Math.floor(i/2)%4];W.n('harpRec',i%2?[ch+2,ch+4]:ch,u,.5,i%2?.2:.26,i%2?0:-12);W.fx('woodblockRec','claves',u+.25,.12,.14);}};
  dance(.2,4.5);W.arp('wind',[0,1,2,3,4,5,6,7],4.6,.18,.16,.22);W.fx('toonRec','slideDown',6.0,1,.32);W.fx('toonRec','plop',6.4,.5,.46);W.n('timpaniRec',0,6.4,.5,.3,-12);
  W.arp('wind',[4,3],6.8,.2,.2,.22);W.arp('bell',[7,9,7,9,7],7.45,.1,.3,.18,12);dance(8.0,9.3);W.n('harpRec',[0,4,7],9.3,1,.24,-12,{strum:.04});},
 siren(W){W.fx('natureRec','waves',0,2.5,.22);for(let u=.2;u<7.3;u+=.8)W.fx('woodblockRec','claves',u,.12,.1);
  const song=[[4,.4],[5,.4],[4,.4],[2,.8],[0,.4],[2,.4],[4,.4],[7,.8],[6,.4],[4,.4],[5,.4],[4,.8]];let u=1.1;for(const [d,L] of song){W.n('fluteRec',d,u,L*.9,.26,12);u+=L;}
  for(let k=0;k<5;k++)W.n('harpRec',[[0,4,0,3,4][k],[0,4,0,3,4][k]+4],1.1+k*1.2,.8,.14,-12,{strum:.05});W.arp('harpRec',[0,1,2,3,4,5,6,7,8,9],5.0,.05,.5,.2);
  W.n('fluteRec',7.5,6.2,.7,.36,12);W.n('clarinetRec',7,6.22,.6,.2,0);W.fx('toonRec','slideDown',6.3,1,.28);W.fx('natureRec','waves',7.0,2.4,.2);for(let u=7.4;u<8.9;u+=.25)W.fx('woodblockRec','claves',u,.1,.12);
  W.arp('lead',[4,0],7.65,.2,.3,.22);W.fx('toonRec','cards',7.6,.5,.22);for(const u of [8.3,8.55,8.8,9.05])W.fx('woodblockRec','claves',u,.15,.26);W.arp('bell',[0,4,7],9.1,.08,.6,.2,12);},
 medusa(W){W.fx('natureRec','drips',0,2.5,.24);W.arp('harpRec',[0,1,2,3,4,5,6,7],.15,.04,.4,.18);W.arp('harpRec',[7,6,5,4,3,2,1,0],.62,.04,.4,.16);
  for(let i=0;i<16;i++)W.n('wind',i%2?4:3,1.15+i*.07,.08,.13);W.n('bell',7,2.7,.5,.24,12);W.fx('triangleRec','hit',2.71,1,.16);W.fx('woodblockRec','claves',3.0,.15,.3);W.arp('lead',[4,2],3.1,.2,.3,.22);
  W.arp('violinsPizzRec',[4,5,4,5,4],3.45,.18,.12,.2,12);W.n('lead',[0,4,7],4.35,.8,.2);W.arp('bell',[7,11],4.6,.12,.5,.22,12);
  W.fx('toonRec','stretch',5.1,.9,.32);W.arp('bass',[4,3,2,1,0],5.12,.08,.3,.26,-12);W.n('timpaniRec',0,5.55,.6,.32,-12);W.arp('bell',[4,7],5.75,.12,.4,.16,12);
  W.arp('violinsPizzRec',[5,4,5,4,5],6.05,.18,.12,.18,12);W.fx('toonRec','cards',6.1,.5,.22);W.fx('woodblockRec','claves',6.7,.15,.32);W.fx('woodblockRec','claves',6.92,.15,.32);
  W.fx('snareRollRec',null,7.02,.65,.16);W.fx('toonRec','clatter',7.7,1.6,.42);W.fx('toonRec','cards',7.8,.5,.22);W.arp('lead',[0,2,4,7],8.0,.07,.6,.3);W.arp('bell',[7,9,11,14],8.05,.07,.6,.2,12);W.bed(8.5,9.4,112,[0,4],.7);}});
// The whole show (seconds from the last press). ladle: the last press was the ladle (nothing falls in).
export function gpPiece(recipe,ladle=false){const cr=recipe?.creature||gpCreature(recipe?.magic,recipe?.animal)||GP_CREATURES[0],T=GP_T,out=[],W=gpWriter(cr.magic,0,out),S=gpWriter(cr.magic,T.scene,out);
 if(ladle)W.fx('woodblockRec','claves',T.fly,.2,.3);else W.fx('toonRec','plop',T.fly,.5,.7);
 W.arp('bell',[0,2,4],T.glow,.1,.6,.2,12);W.fx('toonRec','slurp',T.slurp,.85,.7);W.arp('bell',[0,2,4,7],T.wow,.08,.7,.3,12);W.fx('toonRec','poof',T.poof,1.48,.42);W.arp('lead',[0,1,2,3,4,5,6,7],T.cross,.05,.5,.22);
 GP_CUES[cr.id](S);
 W.fx('toonRec','hiccup',T.hic,.32,.8);W.arp('bell',[7,4,2,0],T.back,.09,.7,.26,12);
 const c=T.cadence;W.n('lead',[0,4],c,1.4,.42);W.n('harpRec',[0,2,4,7],c,1.4,.38,-12,{strum:.06});W.n('celliPizzRec',0,c,1.2,.42,-24);W.n('bell',0,c+.2,1.2,.26,12);
 const g=GP_LOUD*10**((GP_TRIM[cr.id]||0)/40);return out.map(n=>({...n,vel:Math.min(1,n.vel*g)})).sort((a,b)=>a.t-b.t);}
const gpScoreOf=(notes,D)=>notes.map(n=>({inst:n.inst,midi:n.midi,at:n.t/D,length:n.len/D,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})})).filter(e=>e.at<1);
export const gpScore=(recipe,ladle=false)=>gpScoreOf(gpPiece(recipe,ladle),GP_SHOW);
// A choice that is not the last one: the plop and a note of the band, going up with each turn; then, for a magic ingredient, the sound
// of what it does to Glups (GP_T.tryIn … tryOut): the wings open and beat, two more heads pop out and go, the hips dance.
export function gpStep(stage,id,picks=[],ladle=false){const rec=gpRecipe([...picks,id]),magic=rec.magic||'feather',out=[],W=gpWriter(magic,0,out),T=GP_T,k=Math.min(2,stage|0);
 if(ladle)W.fx('woodblockRec','claves',T.fly,.2,.3);else W.fx('toonRec','plop',T.fly,.5,.7);
 W.n('lead',[0,2,4][k],T.fly+.04,.7,.42);W.n('bell',[0,2,4][k],T.fly+.04,.8,.18,12);
 const u=x=>T.tryIn+(T.tryOut-T.tryIn)*x;
 if(GP_TREE[id]){if(id==='feather'){W.fx('toonRec','slideUp',u(.02),1,.3);W.arp('lead',[0,2,4,7],u(.05),.06,.6,.22);for(let i=0;i<3;i++){W.fx('toonRec','cards',u(.26+i*.217),.4,.18);W.n('wind',[4,5,7][i],u(.26+i*.217),.25,.2,12);}}
  else if(id==='garlic'){W.fx('toonRec','plop',u(.08),.5,.4);W.fx('toonRec','plop',u(.16),.5,.4);W.arp('wind',[4,2],u(.45),.2,.2,.24,12);W.fx('toonRec','poof',u(.8),.5,.22);}
  else{for(let i=0;i<6;i++){W.fx('woodblockRec','claves',u(.15+.7*(i+.5)/6),.12,.2);W.n('lead',[0,2,4,2,4,7][i],u(.15+.7*(i+.5)/6),.3,.24);}}}
 else W.fx('toonRec','blub',T.tryIn+.2,1.1,.3);
 return out.map(n=>({...n,vel:Math.min(1,n.vel*GP_STEPLOUD)})).sort((a,b)=>a.t-b.t);}
export const gpStepScore=(stage,id,picks=[])=>gpScoreOf(gpStep(stage,id,picks),GP_STEP);
// The taste of an option in the focus (about a second): a magic ingredient plays its band; a biscuit, the sound of its animal on the
// band of the magic already chosen (the hooves of the horse, the paws of the lion, the trill of the bird, the slide of the snake, the
// woof of the dog, the steps of the bull); the ladle, three notes going up.
export const gpTaste=(stage,id,picks=[])=>gpTasteNotes(stage,id,picks).map(n=>({...n,vel:Math.min(1,n.vel*GP_TASTE)}));
const GP_ANIMAL_TASTE=Object.freeze({
 horse:W=>{for(let i=0;i<3;i++)W.fx('woodblockRec','claves',i*.16,.12,.3);W.n('lead',4,.5,.6,.36);},
 lion:W=>{W.n('celliPizzRec',0,0,.5,.44,-12);W.n('celliPizzRec',4,.22,.5,.4,-12);W.n('lead',[0,4],.5,.6,.32);},
 bird:W=>W.arp('bell',[7,9,7,9,11],0,.1,.5,.3,12),
 snake:W=>{W.arp('wind',[4,3],0,.3,.3,.3,12);W.n('lead',0,.6,.5,.3);},
 dog:W=>{W.n('tubaRec',4,0,.22,.5,-12);W.n('tubaRec',4,.3,.22,.5,-12);W.n('lead',2,.65,.5,.3);},
 bull:W=>{W.n('timpaniRec',0,0,.5,.36,-12);W.n('timpaniRec',0,.36,.5,.36,-12);W.n('lead',4,.7,.5,.3);}});
function gpTasteNotes(stage,id,picks){const rec=gpRecipe(picks),out=[];
 if(id===GP_LADLE.id){gpWriter(rec.magic||'feather',0,out).arp('bell',[0,2,4],0,.16,.8,.5,12);return out;}
 if(GP_TREE[id]){const W=gpWriter(id,0,out);W.arp('lead',[4,2,0],0,.18,.5,.46,12);W.n('wind',4,.56,.4,.3,12);return out;}
 const W=gpWriter(rec.magic||'feather',0,out);(GP_ANIMAL_TASTE[id]||GP_ANIMAL_TASTE.horse)(W);return out;}

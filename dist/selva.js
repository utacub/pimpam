import {escScore} from './escenari.js';
/* Selva de llum · CE35 · Pim Pam 0.29 (after Fons marí de vidre, 0.28): the poses, the camera and the clocks of the jungle dive, from the
 * dawn sky above the canopy to the bed of the river, and the climb back to the sky. Same rules as fons.js: each press, a travelling of
 * SELVA_TRAVEL s to the next scene, then the stimulus; at its end the scene slows to a stop and darkens until the next press.
 */
export const SELVA_TRAVEL=2,SELVA_STIM=12,SELVA_RETURN=5,SELVA_N=20;
export const selvaDuration=(i,duration=SELVA_STIM)=>SELVA_TRAVEL+Math.max(SELVA_STIM,duration)+(i===SELVA_N-1?SELVA_RETURN:0);
// World: x to the right, y up; the tops of the crowns near y=0, the river surface at y=-10.55. The start: in the sky, above the clouds.
export const SELVA_START=Object.freeze([.2,3.05,1.2]);
// [x, y, height, pull back in the middle of the travelling (log of the zoom), drift during the stimulus: dx, dy, change of height]
export const SELVA_POSES=Object.freeze([
 [.40,.66,1.2,.25,.06,0,-.04],        // 1 the river in the mist: down from the sky, through the clouds
 [1.50,.31,.55,.05,-.05,.02,-.05],    // 2 the macaws: closer, to the emergent tree
 [3.10,.18,.9,.12,.08,0,-.04],        // 3 toucans: horizontal over the crowns
 [3.90,-.75,.6,.15,-.05,-.03,-.05],   // 4 hummingbirds: diagonal, down to the flowers
 [3.60,-2.0,.8,.25,.04,-.04,-.04],    // 5 the sloth: vertical, through the leaves
 [1.90,-2.6,1.0,.12,-.08,0,-.04],     // 6 morphos and glasswings: horizontal between rays
 [.60,-3.4,.9,.15,.06,-.03,-.04],     // 7 emperor tamarins: diagonal, after a jump
 [.75,-3.7,.45,0,-.05,.02,-.05],      // 8 the red-eyed frog: closer, to a leaf
 [-.60,-5.45,.75,.3,.04,-.03,-.05],   // 9 the dew web: down to the understory, and closer
 [.95,-5.75,.7,.12,.07,0,-.04],       // 10 glass frogs: horizontal, along the stream
 [.90,-7.4,.8,.25,-.05,.03,-.04],     // 11 poison frogs: vertical, to the floor
 [-.60,-7.7,.8,.1,.07,0,-.04],        // 12 leafcutter ants: horizontal, along the log
 [-3.0,-9.70,1.0,.1,-.04,.02,-.03],   // 13 glowing mushrooms: wider, while night comes
 [-4.3,-9.75,1.1,.1,.07,0,-.04],      // 14 fireflies: horizontal, between ferns
 [-.20,-9.95,1.0,.15,.06,-.02,-.04],  // 15 capybaras: diagonal, down to the bank
 [2.60,-10.32,1.2,.2,-.04,0,-.03],    // 16 the giant water lily: wider, over the river
 [2.45,-10.98,1.0,.15,.06,-.02,-.04], // 17 neon tetras: down, through the surface
 [3.90,-12.0,1.1,.2,-.06,0,-.04],     // 18 the pink river dolphin: between roots
 [4.30,-15.0,.9,.3,.05,0,-.04],       // 19 river stingrays: down to the bed
 [3.20,-11.05,1.2,.15,-.03,.03,-.03]  // 20 the arapaima: up, after it; then the climb out
].map(Object.freeze));
export const SELVA_NAMES=Object.freeze(['El riu entre la boira','Els guacamais','Els tucans','Colibrís a les heliconies','El peresós','Morfos i papallones de vidre','Tamarins emperador','La granota d’ulls vermells','La teranyina de rosada','Granotes de vidre','Granotes punta de fletxa','Formigues talladores','Bolets que brillen','Cuques de llum','Capibares','Victòria amazònica','Tetres neó','El dofí rosat','Les rajades','L’arapaima']);
const SVclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const SVsmooth=x=>{x=SVclamp(x);return x*x*(3-2*x);};
const SVsmoother=x=>{x=SVclamp(x);return x*x*x*(x*(x*6-15)+10);};
export function selvaRest(i){if(i<0||i>=SELVA_N)return SELVA_START;const p=SELVA_POSES[i];return [p[0]+p[4]*p[2],p[1]+p[5]*p[2],p[2]*(1+p[6])];}
function selvaDrift(i,t,stim){const p=SELVA_POSES[i],u=SVsmooth((t-SELVA_TRAVEL)/stim);return [p[0]+p[4]*p[2]*u,p[1]+p[5]*p[2]*u,p[2]*(1+p[6]*u)];}
function selvaTravel(a,b,u,bump){const e=SVsmoother(u),lz=Math.log(a[2])+(Math.log(b[2])-Math.log(a[2]))*e+bump*Math.sin(Math.PI*e);
 return [a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e,Math.exp(lz)];}
export function selvaCamera(i,t,stim=SELVA_STIM,from=selvaRest(i-1)){stim=Math.max(SELVA_STIM,stim);
 if(t<SELVA_TRAVEL)return selvaTravel(from,selvaDrift(i,SELVA_TRAVEL,stim),t/SELVA_TRAVEL,SELVA_POSES[i][3]);
 if(i===SELVA_N-1&&t>SELVA_TRAVEL+stim)return selvaTravel(selvaRest(i),SELVA_START,(t-SELVA_TRAVEL-stim)/SELVA_RETURN,1.25);
 return selvaDrift(i,Math.min(t,SELVA_TRAVEL+stim),stim);}
export function selvaLayers(i,t,tau,prevTau,stim=SELVA_STIM){const out=[];if(i<0)return out;stim=Math.max(SELVA_STIM,stim);
 const climb=i===SELVA_N-1?SVsmooth((t-SELVA_TRAVEL-stim-.4)/2):0;if(climb<1)out.push({scene:i,tau,alpha:1-climb});
 if(i>0&&prevTau!==null&&prevTau!==undefined&&t<SELVA_TRAVEL+.2)out.unshift({scene:i-1,tau:prevTau,alpha:1-SVsmooth((t-.5)/1.5)});
 return out;}
// Glow: a little in the daylight, more at night (the floor and the river).
export const selvaBloom=cam=>.08+.14*SVsmooth((-cam[1]-7)/4)-.09*SVsmooth((-cam[1]-10.6)/.6);

/* The music: one piece for each scene, played by recorded instruments (sampler.js) and natural sounds, as in the Fons marí: a sound
 * for the travelling (leaves brushed past through the canopy, a dive through the surface of the river), then bass, a broken chord
 * pattern, a melody and its answer, notes and animal sounds on the gestures of the animals at the moment they happen (SV_CUES), and a
 * plucked or struck end. The marimba is the voice of the jungle. The animal sounds and three ambiences (dawn, night, under the river)
 * were generated with ElevenLabs (CREDITS.md).
 */
const SV_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
const SV_P=(root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct)=>Object.freeze({root,mode,bpm,lead,answer,arp,bass,spark,chords,motif,figure,arpOct,leadOct});
const SV_PIECES=Object.freeze([
 SV_P(62,'lydian',80,'fluteRec','marimbaRec','harpRec','celliPizzRec','glockRec',[0,4,5,1],[[4,1],[6,.5],[7,.5],[9,2],[7,1],[4,2]],[0,4,7,9,11,9,7,4],0,1),
 SV_P(67,'major',92,'marimbaRec','fluteRec','marimbaRec','celliPizzRec','glockRec',[0,3,4,0],[[7,.5],[9,.5],[7,.5],[4,.5],[5,1],[4,1],[2,1],[0,1]],[0,4,7,4],0,0),
 SV_P(65,'mixolydian',96,'marimbaRec','oboeRec','marimbaRec','celliPizzRec','glockRec',[0,6,3,4],[[4,.5],[2,.5],[4,1],[7,1],[6,.5],[4,.5],[2,1]],[0,4,7,4],0,0),
 SV_P(69,'lydian',100,'fluteRec','glockRec','harpRec','celliPizzRec','glockRec',[0,1,4,0],[[7,.25],[9,.25],[11,.25],[9,.25],[7,1],[4,1],[6,.5],[7,1.5]],[0,2,4,7,9,7,4,2],1,1),
 SV_P(58,'major',60,'clarinetRec','marimbaRec','harpRec','celliPizzRec','glockRec',[0,3,0,4],[[4,2],[2,1],[0,1],[2,2],[4,2]],[0,4,7,4],0,1),
 SV_P(63,'lydian',70,'fluteRec','harpRec','harpRec','celliPizzRec','glockRec',[0,1,0,4],[[7,1.5],[6,.5],[4,1],[2,1],[4,3]],[0,4,7,11,14,11,7,4],0,1),
 SV_P(67,'major',108,'violinsPizzRec','marimbaRec','marimbaRec','celliPizzRec','glockRec',[0,3,4,0],[[0,.5],[2,.5],[4,.5],[7,.5],[9,1],[7,.5],[4,.5],[2,1]],[0,4,7,9],0,1),
 SV_P(62,'dorian',84,'oboeRec','marimbaRec','harpRec','celliPizzRec','glockRec',[0,3,4,0],[[2,1],[4,.5],[5,.5],[4,1],[2,1],[0,2]],[0,2,4,7,4,2],0,1),
 SV_P(64,'lydian',72,'violinsPizzRec','glockRec','harpRec','celliPizzRec','glockRec',[0,1,5,4],[[4,1],[6,1],[7,2],[11,1],[9,1],[7,2]],[0,4,7,11,7,4],0,1),
 SV_P(60,'dorian',84,'marimbaRec','clarinetRec','harpRec','celliPizzRec','glockRec',[0,3,6,4],[[2,1],[4,1],[3,1],[1,1],[0,2],[4,2]],[0,4,7,4,9,4],0,0),
 SV_P(64,'mixolydian',104,'marimbaRec','clarinetRec','marimbaRec','celliPizzRec','glockRec',[0,6,3,4],[[4,.5],[4,.5],[6,.5],[7,.5],[9,1],[7,1],[4,2]],[0,4,7,4,9,4],0,0),
 SV_P(60,'dorian',112,'violinsPizzRec','marimbaRec','violinsPizzRec','celliPizzRec','glockRec',[0,3,4,0],[[0,.5],[0,.5],[4,.5],[0,.5],[5,.5],[4,.5],[2,1]],[0,7,4,7],0,1),
 SV_P(61,'lydian',64,'glockRec','harpRec','harpRec','celliPizzRec','glockRec',[0,1,5,4],[[4,2],[6,1],[7,1],[11,2],[9,2]],[0,7,11,14,11,7],0,0),
 SV_P(66,'lydian',72,'fluteRec','glockRec','harpRec','celliPizzRec','glockRec',[0,4,1,0],[[7,1],[11,1],[9,1],[7,1],[6,2],[4,2]],[0,4,7,11,7,4],0,1),
 SV_P(58,'major',66,'clarinetRec','marimbaRec','harpRec','celliPizzRec','glockRec',[0,3,0,4],[[4,1],[5,1],[4,1],[2,1],[0,3]],[0,4,7,4],0,0),
 SV_P(61,'lydian',66,'clarinetRec','harpRec','harpRec','celliPizzRec','glockRec',[0,1,5,4],[[4,3],[6,1],[7,2],[11,2],[9,4]],[0,4,7,11,7,4],0,0),
 SV_P(57,'dorian',88,'marimbaRec','fluteRec','marimbaRec','celliPizzRec','glockRec',[0,3,4,6],[[4,1],[7,1],[9,1],[7,1],[6,.5],[4,.5],[3,1],[4,2]],[0,4,7,9,7,4],0,1),
 SV_P(62,'dorian',76,'fluteRec','harpRec','harpRec','celliPizzRec','glockRec',[0,3,6,4],[[4,1.5],[5,.5],[7,1],[9,1],[7,2],[4,2]],[0,4,7,9,11,9,7,4],0,1),
 SV_P(57,'aeolian',70,'marimbaRec','clarinetRec','harpRec','celliPizzRec','glockRec',[0,5,3,4],[[0,1],[2,1],[4,2],[5,1],[4,1],[2,2]],[0,4,7,4,9,4],0,0),
 SV_P(55,'dorian',64,'clarinetRec','marimbaRec','harpRec','celliPizzRec','glockRec',[0,3,4,0],[[0,2],[2,1],[3,1],[4,2],[2,2]],[0,4,7,9,7,4],0,0)]);
const SV_RANGE=Object.freeze({harpRec:[36,100],marimbaRec:[45,96],glockRec:[79,108],fluteRec:[60,96],oboeRec:[58,91],clarinetRec:[50,89],violinsRec:[55,98],celliRec:[36,72],violinsPizzRec:[55,96],celliPizzRec:[33,70],woodblockRec:[60,84]});
const svFit=(inst,m)=>{const r=SV_RANGE[inst];if(!r)return m;while(m<r[0])m+=12;while(m>r[1])m-=12;return m;};
export const SELVA_LOUD=1.68;
const SV_TRIM=Object.freeze([.955,1.035,1.090,1.029,1.011,.955,1.047,1.023,1.162,1.078,1.072,1.041,1.273,.939,1.029,1.017,1.059,.955,1.142,1.065]);
// The gestures of each scene at their own moments (seconds after the press; the scene clock is about t − 0.3). n: notes (degrees of the
// piece's scale); fx: a natural sound (natureRec, the default) or an animal sound (selvaRec).
const SV_CUES=Object.freeze([
 // 1 · the river in the mist: the dawn, two macaws crossing
 (n,fx,S)=>{fx('alba',.3,S*.9,.07);fx('wind',.5,S*.9,.10);fx('guacamai',3.0,1,.12,'selvaRec');for(const t of [2.9,3.6,6.4])for(let j=0;j<3;j++)n(t+j*.09,.25,'fluteRec',[[9,11,9][j]],.16,1);},
 // 2 · the macaws on the emergent tree: they preen, one sidles closer, they touch beaks
 (n,fx,S)=>{fx('alba',.3,S*.9,.07);fx('wind',.3,S*.9,.06);fx('guacamai',2.3,1,.12,'selvaRec');for(const t of [3.0,3.3,3.6,4.3,4.6])n(t,.2,'woodblockRec',[4],.10,0);
  for(let j=0;j<10;j++)n(6.1+j*.1,1,'harpRec',[j],.16,0);n(7.1,1.6,'glockRec',[7,11],.14,1,{strum:.06});for(let j=0;j<6;j++)n(8.3+j*.12,.8,'harpRec',[9-j],.13,0);
  n(9.6,.8,'marimbaRec',[4],.2,1);n(9.85,.8,'marimbaRec',[7],.18,1);},
 // 3 · the toucans: hops, picks a fruit, tosses it up and catches it, the other one hops up, both bow
 (n,fx,S)=>{fx('alba',.3,S*.9,.07);for(const t of [1.3,1.75,2.2])n(t,.2,'woodblockRec',[2],.10,0);n(3.0,.6,'marimbaRec',[4],.18,1);
  for(let j=0;j<5;j++)n(3.85+j*.1,.8,'harpRec',[4+j],.15,1);for(let j=0;j<4;j++)n(4.35+j*.08,.8,'harpRec',[8-j],.13,1);n(4.75,1.6,'glockRec',[7],.16,1);
  n(5.3,.4,'marimbaRec',[2],.14,0);n(5.6,.4,'marimbaRec',[0],.14,0);fx('tuca',6.1,2,.13,'selvaRec');for(const t of [7.7,7.9,8.1])n(t,.2,'woodblockRec',[4],.09,0);
  n(8.5,1.2,'glockRec',[4,7],.12,1,{strum:.05});for(let j=0;j<3;j++)n(9.8+j*.3,.6,'marimbaRec',[4-j*2],.16,1);},
 // 4 · the hummingbirds: hum, the throat lights up, it drinks, the other darts in, it flies off
 (n,fx,S)=>{fx('alba',.3,S*.9,.06);fx('colibri',1.0,1,.11,'selvaRec');n(2.9,1.8,'glockRec',[7,9,11,14],.15,1,{strum:.07});for(let j=0;j<6;j++)n(3.1+j*.09,1,'harpRec',[7+j],.12,1);
  for(let k=0;k<8;k++)n(4.8+k*.27,.3,'fluteRec',[k%2?11:9],.09,1);fx('colibri',7.3,1,.11,'selvaRec');n(7.4,.8,'glockRec',[4],.13,1);
  n(8.0,1.4,'glockRec',[2,6,9],.11,1,{strum:.06});for(let j=0;j<8;j++)n(9.7+j*.07,.8,'harpRec',[j*2],.13,1);},
 // 5 · the sloth: turns its head slowly, blinks, moths fly out, its baby peeks out
 (n,fx,S)=>{fx('alba',.3,S*.9,.05);fx('drips',.3,S*.9,.05);for(let j=0;j<4;j++)n(2.7+j*.7,1.2,'clarinetRec',[j],.12,1);n(5.3,.8,'marimbaRec',[4],.14,1);
  for(let k=0;k<8;k++)n(4.9+k*.38,.6,'glockRec',[[7,9,11,9,7,11,14,9][k]],.06,1);n(7.7,.5,'violinsPizzRec',[4],.10,1);n(8.0,.5,'violinsPizzRec',[7],.10,1);
  for(let j=0;j<3;j++)n(8.4+j*.25,.6,'marimbaRec',[7+j],.14,1);n(9.6,1.4,'glockRec',[11],.10,1);},
 // 6 · the morphos: the blue lights up in the shaft of sun, the glasswings flutter, the second morpho
 (n,fx,S)=>{fx('alba',.3,S*.9,.05);for(let k=0;k<6;k++)n(1.6+k*.8,.5,'glockRec',[[9,11,14][k%3]],.05,1);
  for(let j=0;j<10;j++)n(3.3+j*.15,1.4,'harpRec',[j],.12+j*.006,0);n(4.6,2.2,'glockRec',[4,7,11,14],.15,1,{strum:.09});for(let j=0;j<5;j++)n(6.5+j*.3,.6,'fluteRec',[11-j],.10,1);},
 // 7 · the emperor tamarins: one crouches and jumps down, lands, the branch bounces; the other strokes its moustache; both look at us
 (n,fx,S)=>{fx('alba',.3,S*.9,.06);fx('tamari',1.0,1,.12,'selvaRec');n(2.9,.3,'violinsPizzRec',[0],.12,0);for(let j=0;j<6;j++)n(3.3+j*.12,.8,'harpRec',[11-j*2],.14,1);
  n(4.1,.2,'woodblockRec',[0],.13,0);for(let j=0;j<3;j++)n(4.15+j*.22,.6,'marimbaRec',[[4,2,4][j]],.16-j*.03,1);
  for(let k=0;k<3;k++){n(6.4+k*1.25,.3,'violinsPizzRec',[7],.08,1);n(6.75+k*1.25,.3,'violinsPizzRec',[4],.07,1);}fx('tamari',9.9,1,.11,'selvaRec');n(10.0,1.4,'glockRec',[4,9],.12,1,{strum:.05});},
 // 8 · the red-eyed frog: asleep, opens its red eyes, breathes, jumps to the other leaf
 (n,fx,S)=>{fx('drops',.3,S*.9,.07);fx('alba',.3,S*.9,.04);n(3.2,1.6,'glockRec',[0,4,7,11],.17,1,{strum:.035});n(3.25,.8,'marimbaRec',[7],.18,1);
  for(let k=0;k<4;k++)n(4.4+k*.6,.6,'marimbaRec',[k%2?2:0],.07,0);n(6.4,.6,'glockRec',[9],.08,1);
  for(let j=0;j<8;j++)n(8.3+j*.1,.9,'harpRec',[j],.15,1);n(9.3,.2,'woodblockRec',[4],.12,0);n(9.4,1.6,'glockRec',[7,11],.13,1,{strum:.05});},
 // 9 · the dew web
 (n,fx,S)=>{fx('drips',.5,S*.9,.08);for(let k=0;k<10;k++)n(2.2+((k*.618)%1)*(S-1),.8,'glockRec',[7+(k*3)%5],.07,1);
  for(let k=0;k<6;k++)n(2.4+k*.3,.25,'violinsPizzRec',[k%2?4:2],.10,1);for(let k=0;k<8;k++)n(4.3+k*.57,1,'harpRec',[k],.15,0);
  for(let j=0;j<8;j++)n(8.6+j*.1,1.4,'glockRec',[j*2],.10,0);for(let k=0;k<6;k++)n(8.9+k*.33,.25,'violinsPizzRec',[4-k%2*2],.09,1);},
 // 10 · the glass frogs by the stream
 (n,fx,S)=>{fx('brook',.3,S*.9,.10);for(const t of [3.8,7.6,11.4])n(t,1.2,'glockRec',[9],.12,1);
  for(let t=.6;t<4.5;t+=1.43)n(t,.5,'celliPizzRec',[0],.12,-1);for(let j=0;j<7;j++)n(4.5+j*.28,.8,'marimbaRec',[j],.12+j*.012,0);
  n(5.6,2,'glockRec',[0,4,7],.15,1,{strum:.07});n(7.5,.2,'woodblockRec',[7],.10,0);n(8.3,.5,'marimbaRec',[4],.2,1);n(8.75,.6,'marimbaRec',[0],.2,1);},
 // 11 · the poison frogs: hops with the tadpole, into the pool, the other one calls
 (n,fx,S)=>{fx('drips',.3,S*.9,.06);fx('frogs',.3,S*.9,.04);n(1.85,.2,'woodblockRec',[2],.10,0);n(2.95,.2,'woodblockRec',[4],.10,0);
  for(let j=0;j<4;j++)n(4.2+j*.12,.6,'marimbaRec',[7-j],.15,1);n(4.75,1.8,'glockRec',[0,4,7],.15,1,{strum:.06});for(let k=0;k<5;k++)n(5.2+k*.4,.5,'harpRec',[[7,9,11,9,7][k]],.08,1);
  for(let k=0;k<3;k++){fx('granota',8.1+k,1.9,.11,'selvaRec');}n(11.0,.8,'marimbaRec',[4],.12,1);},
 // 12 · the leafcutter ants: snips, the piece lifted up, the turn, the line; the rider looks up
 (n,fx,S)=>{fx('drips',.3,S*.9,.04);for(const t of [.8,1.9,2.9])fx('talla',t,1.8,.13,'selvaRec');for(let j=0;j<4;j++)n(3.7+j*.18,.6,'marimbaRec',[j*2],.15,1);
  n(4.5,1.4,'glockRec',[7,11],.13,1,{strum:.05});n(4.65,.2,'woodblockRec',[4],.10,0);for(let k=0;k<12;k++)n(5.2+k*.5,.15,'woodblockRec',[k%2?2:0],.05,0);n(8.4,.8,'glockRec',[14],.10,1);},
 // 13 · the glowing mushrooms: the clusters light up one by one, spores, insects come to the light
 (n,fx,S)=>{fx('nit',.3,S*.9,.05);fx('crickets',.3,S*.9,.04);for(const [t,d] of [[2.9,0],[3.5,2],[4.1,4]]){n(t,2,'glockRec',[d,d+4,d+7],.12,1,{strum:.08});for(let j=0;j<4;j++)n(t+.05+j*.08,1,'harpRec',[d+j*2],.10,1);}
  for(let k=0;k<7;k++)n(5.0+k*.7,.8,'glockRec',[[11,9,14,11,7,9,11][k]],.05,1);fx('escarabat',5.8,2,.08,'selvaRec');fx('escarabat',7.0,2,.07,'selvaRec');},
 // 14 · the fireflies and the headlight beetle: it takes off, flies across, lands
 (n,fx,S)=>{fx('nit',.3,S*.9,.07);for(let k=0;k<9;k++)n(1.0+k*1.15,.8,'glockRec',[[7,11,9,14,11,7,9,11,14][k]],.05,1);
  fx('escarabat',3.3,2,.10,'selvaRec');for(let j=0;j<8;j++)n(3.3+j*.1,1,'harpRec',[j],.13,1);for(let j=0;j<5;j++)n(5.4+j*.45,.6,'fluteRec',[[7,9,11,9,7][j]],.09,1);
  n(9.2,.6,'marimbaRec',[4],.14,1);n(9.45,.8,'marimbaRec',[0],.13,1);},
 // 15 · the capybaras: the young one climbs onto its mother's back, she turns to us, a firefly lands on its nose
 (n,fx,S)=>{fx('nit',.3,S*.9,.05);fx('waves',.3,S*.9,.03);fx('capibara',1.4,2,.09,'selvaRec');for(let j=0;j<5;j++)n(2.9+j*.3,.4,'violinsPizzRec',[j],.11,0);
  for(let j=0;j<6;j++)n(4.2+j*.08,.9,'harpRec',[4+j],.12,1);n(5.2,1.2,'clarinetRec',[4],.10,1);n(6.4,1.2,'clarinetRec',[2],.09,1);fx('capibara',7.0,2,.08,'selvaRec');
  n(8.9,1.6,'glockRec',[7,11],.12,1,{strum:.05});for(let j=0;j<6;j++)n(10.9+j*.08,.8,'harpRec',[7+j],.10,1);},
 // 16 · the giant water lily
 (n,fx,S)=>{fx('crickets',.3,S*.9,.10);for(let j=0;j<12;j++)n(2.8+j*.21,1.4,'harpRec',[j],.13+j*.006,0);n(5.3,2,'glockRec',[4,7,11],.15,1,{strum:.08});
  for(let k=0;k<3;k++)for(let j=0;j<4;j++)n(5.4+k*.8+j*.06,.2,'violinsPizzRec',[7+j],.07,1);for(let j=0;j<6;j++)n(7.7+j*.15,1,'harpRec',[9-j],.12,0);
  for(let j=0;j<10;j++)n(8.8+j*.2,1.3,'harpRec',[j+2],.13,0);n(10.8,2,'glockRec',[2,6,9],.13,1,{strum:.08});for(let j=0;j<4;j++)n(10.9+j*.07,.2,'violinsPizzRec',[7+j],.07,1);},
 // 17 · the neon tetras
 (n,fx,S)=>{fx('bubbles',.3,S*.9,.08);for(const t0 of [5.1,9.6]){for(let j=0;j<8;j++)n(t0+j*.1,.5,'marimbaRec',[t0<7?j:7-j],.14,1);for(let j=0;j<5;j++)n(t0+.4+j*.15,1.4,'glockRec',[4+j*2],.09,0);}},
 // 18 · the pink river dolphin: comes closer, looks, clicks, bubbles, glides off
 (n,fx,S)=>{fx('riu',.3,S*.9,.10);for(let j=0;j<6;j++)n(1.2+j*.4,1.2,'harpRec',[j*2],.09,0);fx('dofi',3.4,1,.12,'selvaRec');n(3.6,1.8,'glockRec',[4,7,11],.13,1,{strum:.06});
  fx('dofi',5.1,1,.10,'selvaRec');fx('bubbles',5.2,2.2,.06);for(let j=0;j<6;j++)n(5.3+j*.16,.5,'marimbaRec',[j*2],.10,1);for(let j=0;j<5;j++)n(7.8+j*.4,.8,'fluteRec',[9-j],.09,1);},
 // 19 · the river stingrays: the big one shakes off the sand and rises, glides away; catfish peck
 (n,fx,S)=>{fx('riu',.3,S*.9,.09);fx('bubbles',3.2,2,.05);for(let j=0;j<8;j++)n(3.3+j*.12,1.2,'harpRec',[j],.12,-1);n(4.3,1.8,'glockRec',[0,4,7],.12,1,{strum:.06});
  for(let j=0;j<4;j++)n(5.0+j*.9,1,'clarinetRec',[[4,5,4,2][j]],.09,1);for(let k=0;k<8;k++)n(6.0+k*.62,.15,'woodblockRec',[k%3],.05,0);},
 // 20 · the arapaima: rises, gulps air at the surface, bubbles, goes down; then the climb out to the sky
 (n,fx,S)=>{fx('riu',.3,S*.9,.09);for(let j=0;j<4;j++)n(.9+j*.8,1.2,'clarinetRec',[j],.10,0);fx('glup',4.05,1,.14,'selvaRec');n(4.15,2,'glockRec',[0,4,7,11],.14,1,{strum:.05});
  for(let j=0;j<6;j++)n(4.9+j*.2,.5,'marimbaRec',[7-j],.10,1);for(let j=0;j<6;j++)n(6.6+j*.5,1,'harpRec',[6-j],.09,0);}
]);
export function selvaScore(i,duration=SELVA_STIM){i=((i%SELVA_N)+SELVA_N)%SELVA_N;const S=Math.max(SELVA_STIM,duration),D=selvaDuration(i,duration),M=SV_PIECES[i],sc=SV_SCALES[M.mode],E=escScore(D),T0=SELVA_TRAVEL,L=SELVA_LOUD*SV_TRIM[i];
 const deg=(d,o=0)=>M.root+12*(o+Math.floor(d/7))+sc[((d%7)+7)%7];
 const n=(t,len,inst,ds,vel,o=0,x={})=>E.add(t,len,inst,[...new Set([].concat(ds).map(d=>svFit(inst,deg(d,o))))],vel*L,x);
 const fx=(variant,t,len,vel,inst='natureRec')=>E.add(t,len,inst,[60],vel*L,{variant});
 // the travelling: through the clouds and the leaves the harp goes down; closer, sparks; sideways, a wave; into the river, bubbles
 const a=i>0?SELVA_POSES[i-1]:SELVA_START,b=SELVA_POSES[i],dy=b[1]-a[1],closer=b[2]<a[2]*.7;
 if(i===16){fx('capbussada',.7,2,.16,'selvaRec');fx('bubbles',1.1,2,.12);}else if(i>16)fx('bubbles',.4,2,.12);else if(i>1&&i<12)fx('fulles',.25,2,.11,'selvaRec');else fx('wind',0,2.4,.12);
 if(closer)for(let j=0;j<6;j++)n(.3+j*.22,1.2,'glockRec',[j*2],.12,0);
 else if(dy<-.4)for(let j=0;j<14;j++)n(.15+j*.11,.9,'harpRec',[13-j],.2-j*.006,1);
 else for(let j=0;j<10;j++)n(.2+j*.15,.9,'harpRec',[[4,6,7,9,11,9,7,6,4,2][j]],.17,1);
 const beat=60/M.bpm,B=4*beat,bars=Math.max(2,Math.floor(S/B)),cad=T0+S-B;
 for(let k=0;k<bars-1;k++){const t=T0+k*B,r=M.chords[k%M.chords.length];
  n(t,B*.5,M.bass,[r],.32,M.bass==='harpRec'||M.bass==='marimbaRec'?-1:-2);n(t+2*beat,B*.4,M.bass,[r+4],.24,M.bass==='harpRec'||M.bass==='marimbaRec'?-1:-2);
  M.figure.forEach((f,j)=>{const u=t+j*B/M.figure.length;if((j+k)%7===6||u>=cad)return;n(u,beat*1.4,M.arp,[r+f],j%4===0?.20:.15,M.arpOct);});
  if(k%2===0)n(t+.02,1.6,M.spark,[r+7],.10,1);}
 const phrase=(t0,inst,shift,vel,oct)=>{let u=t0;for(const [d,bt] of M.motif){if(u>=cad-.2)break;if(d!==null)n(u,Math.min(bt*beat*1.15,cad-u),inst,[d+shift],vel,oct);u+=bt*beat;}};
 phrase(T0+B*.5,M.lead,0,.30,M.leadOct);if(bars>3)phrase(T0+B*2.5,M.answer,-2,.24,M.answer==='glockRec'?0:M.leadOct);if(bars>5)phrase(T0+B*4.5,M.lead,0,.27,M.leadOct);
 SV_CUES[i](n,(v,t,len,vel,inst)=>fx(v,t,len,vel,inst),S);
 // the end: a plucked chord on the marimba and the harp, a struck bell, the bass, all dying away
 n(cad,2.6,'harpRec',[0,4,7,9,14],.26,0,{strum:.07});n(cad+.05,1.6,'marimbaRec',[0,4,7],.2,0,{strum:.05});n(cad+.35,2.2,'glockRec',[7],.13,1);n(cad,1.2,M.bass==='harpRec'?'celliPizzRec':M.bass,[0],.3,-2);
 // after the twentieth, the climb back to the sky: up through the water, the trees and the clouds, the harp rising, the dawn again
 if(i===SELVA_N-1){const c0=T0+S;fx('bubbles',c0,1.6,.10);fx('fulles',c0+1.3,2,.09,'selvaRec');fx('alba',c0+1.5,3.4,.07);for(let j=0;j<16;j++)n(c0+.2+j*.18,1,'harpRec',[j],.12+j*.004,0);
  n(c0+3.3,2,'glockRec',[0,4,7,11],.13,1,{strum:.07});n(c0+3.35,1.6,'marimbaRec',[0,4,7],.15,1,{strum:.05});}
 return E.done();}

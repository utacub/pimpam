import {escScore} from './escenari.js';
/* Sabana de paper · CE36 · Pim Pam 0.30 (after Selva de llum, 0.29): the poses, the camera, the hours and the clocks of a day on the
 * savanna of East Africa, a diorama of paper, from the dawn over Kilimanjaro to the starry night, and the climb back to the sky. Same
 * rules as fons.js and selva.js: each press, a travelling of SABANA_TRAVEL s to the next scene, then the stimulus; at its end the scene
 * slows to a stop and darkens until the next press. New here: the camera carries the hour of the day (a fourth number), so the one sun
 * of the diorama moves on, and with it the colour of the sky and the direction of every shadow.
 */
export const SABANA_TRAVEL=2,SABANA_STIM=12,SABANA_RETURN=5,SABANA_N=20;
export const sabanaDuration=(i,duration=SABANA_STIM)=>SABANA_TRAVEL+Math.max(SABANA_STIM,duration)+(i===SABANA_N-1?SABANA_RETURN:0);
// World: x along the route (the backdrop repeats every 46), y up, the ground at y=0 (the lake at x 1–8, the river at x 17–24). The
// start: high above the sea of clouds, at the end of the night ([x, y, height, hour]).
export const SABANA_START=Object.freeze([-.6,5.4,1.25,0]);
// [x, y, height, pull back in the middle of the travelling (log of the zoom), drift during the stimulus: dx, dy, change of height]
export const SABANA_POSES=Object.freeze([
 [0.0,3.4,1.2,.2,.05,-.02,-.04],  // 1 Kilimanjaro at dawn: down from the sky, through the sea of clouds
 [2.8,.18,.75,.15,.06,0,-.04],    // 2 the flamingos: diagonal, down to the lake (eye level over the water)
 [5.0,.28,.70,.1,-.05,0,-.04],    // 3 the crowned cranes: horizontal, along the lake
 [7.3,.52,1.10,.2,.04,.02,-.04],  // 4 the giraffes: up, to the crown of the acacia
 [9.6,.32,.95,.25,-.05,0,-.04],   // 5 the elephants at the waterhole: down
 [12.0,.30,.90,.1,.06,0,-.04],    // 6 the zebras: horizontal, over the plain
 [14.4,.45,1.25,.1,.05,0,0],      // 7 the impalas: wider, to see the leaps
 [16.2,.16,.45,.05,-.05,0,-.05],  // 8 the warthogs: closer, down to the ground
 [18.8,.25,1.0,.2,.05,0,-.04],    // 9 the wildebeest at the river: horizontal
 [21.0,0.,.70,.15,.05,0,-.04],    // 10 the hippos: into the river, half above and half below the water
 [22.6,.32,.55,.1,-.04,.02,-.04], // 11 the kingfishers: up out of the water, to the reed
 [25.0,.30,.85,.15,.05,0,-.04],   // 12 the rhinos and the oxpeckers: horizontal
 [27.4,.14,.78,.15,.03,0,-.03],   // 13 inside the termite mound: through its wall of paper
 [29.2,.55,.70,.1,-.04,0,-.04],   // 14 the mongooses and the hornbills: out, onto the top of the mound
 [31.4,1.15,.55,.2,.04,.02,-.04], // 15 the weavers: up, into the crown of a tree
 [33.8,.40,.90,.15,-.05,0,-.04],  // 16 the cheetahs: diagonal, down to their mound
 [36.4,.38,1.0,.1,.05,0,-.04],    // 17 the lions at sunset: horizontal, to the rocks
 [38.8,1.2,1.0,.25,.03,.02,-.04], // 18 the baobab: up, to its flowers
 [41.0,.12,.40,.2,-.04,0,-.05],   // 19 the dung beetles: down to the ground, at night
 [43.0,.25,.75,.1,.05,0,-.04]     // 20 the aardvark: horizontal; then the climb to the stars
].map(Object.freeze));
// The hour at the start of each stimulus and how far it moves on during it (the sun rises in the first scene).
export const SABANA_HOURS=Object.freeze([.012,.08,.12,.16,.24,.29,.33,.37,.43,.47,.51,.55,.59,.62,.65,.69,.745,.82,.90,.95]);
const SB_HDRIFT=Object.freeze([.033,.012,.012,.012,.012,.01,.01,.01,.01,.01,.01,.01,.01,.01,.01,.01,.012,.012,.01,.01]);
// When the hour moves on during a stimulus (seconds after the press, and how long): the sun rises over the clouds at the key moment of
// the first scene and sets behind the lions; in the others it moves on slowly through the whole stimulus.
const SB_HTIME=Object.freeze({0:[2.6,3.6],16:[2.4,9]});
const sbHour=(i,t,stim)=>{const w=SB_HTIME[i];return SABANA_HOURS[i]+SB_HDRIFT[i]*SBsmooth(w?(t-w[0])/w[1]:(t-SABANA_TRAVEL)/stim);};
export const SABANA_NAMES=Object.freeze(['El Kilimanjaro a l’alba','Els flamencs','Les grues coronades','Les girafes de l’acàcia','Els elefants a la bassa','Les zebres','Els impales','Els facoquers','El riu dels nyus','Els hipopòtams','Els blauets','Els rinoceronts i els picabous','El termiter per dins','Les mangostes i els càlaus','Els teixidors','Els guepards','Els lleons a la posta','El baobab','Els escarabats piloters','L’oricteròp']);
const SBclamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const SBsmooth=x=>{x=SBclamp(x);return x*x*(3-2*x);};
const SBsmoother=x=>{x=SBclamp(x);return x*x*x*(x*(x*6-15)+10);};
export function sabanaRest(i){if(i<0||i>=SABANA_N)return SABANA_START;const p=SABANA_POSES[i];return [p[0]+p[4]*p[2],p[1]+p[5]*p[2],p[2]*(1+p[6]),SABANA_HOURS[i]+SB_HDRIFT[i]];}
function sabanaDrift(i,t,stim){const p=SABANA_POSES[i],u=SBsmooth((t-SABANA_TRAVEL)/stim);return [p[0]+p[4]*p[2]*u,p[1]+p[5]*p[2]*u,p[2]*(1+p[6]*u),sbHour(i,t,stim)];}
function sabanaTravel(a,b,u,bump){const e=SBsmoother(u),lz=Math.log(a[2])+(Math.log(b[2])-Math.log(a[2]))*e+bump*Math.sin(Math.PI*e);
 return [a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e,Math.exp(lz),(a[3]??0)+((b[3]??0)-(a[3]??0))*e];}
// The end of the day: from the aardvark up past the trees to the stars, over the sea of clouds, to where the first press started (x 46
// on, which looks the same as the start, the backdrop repeating), and the light of a new dawn on the horizon.
// The backdrop repeats every SABANA_PERIOD along x (SB_PERIOD in the shaders): the climb after the twentieth scene ends in the sky one
// period on from the start, at the hour after the last (1, the night again), and the renderer dissolves it into the start (sabana-gl.js).
export const SABANA_PERIOD=46;
const SB_END=Object.freeze([SABANA_START[0]+SABANA_PERIOD,SABANA_START[1],SABANA_START[2],1]);
export function sabanaCamera(i,t,stim=SABANA_STIM,from=sabanaRest(i-1)){stim=Math.max(SABANA_STIM,stim);
 if(t<SABANA_TRAVEL)return sabanaTravel(from,sabanaDrift(i,SABANA_TRAVEL,stim),t/SABANA_TRAVEL,SABANA_POSES[i][3]);
 if(i===SABANA_N-1&&t>SABANA_TRAVEL+stim)return sabanaTravel(sabanaRest(i),SB_END,(t-SABANA_TRAVEL-stim)/SABANA_RETURN,.6);
 return sabanaDrift(i,Math.min(t,SABANA_TRAVEL+stim),stim);}
export function sabanaLayers(i,t,tau,prevTau,stim=SABANA_STIM){const out=[];if(i<0)return out;stim=Math.max(SABANA_STIM,stim);
 const climb=i===SABANA_N-1?SBsmooth((t-SABANA_TRAVEL-stim-.4)/2):0,rise=i===0?SBsmooth(t/.8):1;if(climb<1)out.push({scene:i,tau,alpha:(1-climb)*rise});
 if(i>0&&prevTau!==null&&prevTau!==undefined&&t<SABANA_TRAVEL+.2)out.unshift({scene:i-1,tau:prevTau,alpha:1-SBsmooth((t-.5)/1.5)});
 return out;}
// Glow: low by day (paper does not shine), more at dawn, at sunset and at night (the sun disc, the lanterns, the stars).
export const sabanaBloom=cam=>{const h=((cam[3]??0)%1+1)%1;return .035+.05*SBsmooth((.10-h)/.08)+.06*SBsmooth((h-.70)/.08);};

/* The music of the savanna: a sound world of its own, generated with ElevenLabs (CREDITS.md). A kalimba is the voice (six plucked tines
 * at their measured pitches, sampler.js kalimbaRec); a small wooden hand drum and a seed shaker keep the pulse (tamborRec); the paper of
 * the diorama sounds in the travellings (a sheet sliding past, a sheet unfolding, the air when the camera rises); the hour has its
 * ambience (dawn, midday, the river, dusk, night: natureRec) and the animals call at the moment they act (sabanaRec). Each scene has its
 * own piece, as a thumb piano is played: a low tine on the beats, an interlocking pattern over a cycle of four chords, a melody and its
 * answer, the drum and the shaker; then the notes and the sounds of the gestures of the animals (SB_CUES), and a struck end. Everything
 * is plucked or struck: no held notes, no synthesised sound.
 */
const SB_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
// root, mode, tempo, the four chords (degrees), the interlocking figure (degrees over the chord, one bar), the melody ([degree, beats]),
// the drum (one bar of eighths: B low, M middle, A high, V the rim) and the shaker (s soft, S stronger), and the ambience of the hour.
const SB_P=(root,mode,bpm,chords,figure,motif,drum,shake,amb)=>Object.freeze({root,mode,bpm,chords,figure,motif,drum,shake,amb});
const SB_PIECES=Object.freeze([
 SB_P(62,'lydian',66,[0,4,5,3],[0,2,4,7,4,2,9,4],[[4,1],[5,.5],[7,1.5],[9,1],[7,2]],'B.......','....s...','sbAlba'),
 SB_P(64,'major',84,[0,3,4,0],[0,4,2,4,7,4,2,4],[[7,.5],[9,.5],[7,.5],[4,.5],[5,1],[4,1],[2,2]],'B...M...','..s...s.','sbAlba'),
 SB_P(60,'mixolydian',92,[0,6,3,4],[0,2,4,2,7,4,2,4],[[4,.5],[2,.5],[4,1],[7,1],[6,.5],[4,.5],[2,1]],'B..AM...','.s.s.s.s','sbAlba'),
 SB_P(62,'major',72,[0,3,4,3],[0,4,7,9,7,4,2,4],[[4,1.5],[5,.5],[7,1],[9,1],[7,2]],'B...M...','....s...','sbMigdia'),
 SB_P(57,'major',63,[0,3,0,4],[0,4,7,4],[[4,2],[2,1],[0,1],[2,2],[4,2]],'B.....M.','........','sbRiu'),
 SB_P(64,'mixolydian',96,[0,6,3,0],[0,2,4,7,4,2,4,2],[[0,.5],[2,.5],[4,.5],[7,.5],[9,1],[7,.5],[4,.5],[2,1]],'B.A.M.A.','s.s.s.s.','sbMigdia'),
 SB_P(67,'major',104,[0,4,5,3],[0,4,7,4,9,4,7,4],[[7,.5],[9,.5],[11,.5],[9,.5],[7,1],[4,1],[7,2]],'B..MA.M.','.s.S.s.s','sbMigdia'),
 SB_P(60,'dorian',100,[0,3,4,0],[0,2,4,2,0,4,2,4],[[2,.5],[4,.5],[5,.5],[4,.5],[2,1],[0,2]],'B.VMB.V.','..s...s.','sbMigdia'),
 SB_P(57,'dorian',88,[0,3,4,6],[0,4,7,4,2,4,7,4],[[4,1],[7,1],[9,1],[7,1],[4,2]],'B..BM...','s.s.s.s.','sbRiu'),
 SB_P(55,'major',60,[0,3,0,4],[0,4,7,4],[[4,2],[5,1],[4,1],[2,2],[0,2]],'B.......','........','sbRiu'),
 SB_P(65,'lydian',80,[0,1,4,0],[0,4,7,9,11,9,7,4],[[7,1],[9,.5],[11,.5],[9,1],[7,1],[4,2]],'B...M.V.','...s...s','sbRiu'),
 SB_P(58,'mixolydian',76,[0,6,3,4],[0,2,4,7,4,2,4,2],[[4,1],[5,.5],[4,.5],[2,1],[0,1],[2,2]],'B..VM...','..s...s.','sbMigdia'),
 SB_P(61,'lydian',64,[0,1,5,4],[0,4,7,11,7,4],[[4,2],[6,1],[7,1],[11,2],[9,2]],'B.......','.s...s..',null),
 SB_P(64,'major',108,[0,3,4,0],[0,2,4,2,7,4,2,4],[[0,.5],[0,.5],[4,.5],[2,.5],[5,.5],[4,.5],[2,1]],'B.A.MA.A','s.s.s.s.','sbMigdia'),
 SB_P(67,'major',96,[0,4,5,3],[0,4,2,4,7,4,2,4],[[4,.5],[5,.5],[7,.5],[9,.5],[7,1],[4,1],[2,2]],'B...M.A.','.s.s.s.s','sbMigdia'),
 SB_P(62,'mixolydian',92,[0,6,3,4],[0,4,7,4,2,4,7,9],[[7,1],[6,.5],[4,.5],[2,1],[4,1],[0,2]],'B..AM..A','..s...s.','sbMigdia'),
 SB_P(57,'dorian',66,[0,3,6,4],[0,4,7,4,9,4],[[4,1.5],[5,.5],[7,1],[9,1],[7,2],[4,2]],'B.....M.','........','sbVespre'),
 SB_P(60,'lydian',70,[0,1,0,4],[0,4,7,11,9,7,4,2],[[7,1.5],[6,.5],[4,1],[2,1],[4,3]],'B.......','....s...','sbVespre'),
 SB_P(58,'aeolian',64,[0,5,3,4],[0,4,7,4,9,4],[[0,1],[2,1],[4,2],[5,1],[4,1],[2,2]],'B...V...','........','sbNit'),
 SB_P(55,'dorian',72,[0,3,4,0],[0,4,7,9,7,4],[[0,2],[2,1],[3,1],[4,2],[2,2]],'B..VM...','..s...s.','sbNit')]);
const SB_RANGE=Object.freeze({kalimbaRec:[50,81]});
const sbFit=(inst,m)=>{const r=SB_RANGE[inst];if(!r)return m;while(m<r[0])m+=12;while(m>r[1])m-=12;return m;};
const SB_DRUM=Object.freeze({B:'baix',M:'mig',A:'alt',V:'vora'});
export const SABANA_LOUD=2.69;
const SB_TRIM=Object.freeze([.994,1.006,.994,1.017,.966,1.012,1.029,.955,1.017,.955,1.047,.95,.989,.989,1.041,1.041,.994,.977,.994,1.065]);
// The gestures of each scene at their moments (seconds after the press; the scene clock is about t − 0.3). n: kalimba notes (degrees of
// the piece's scale); fx: an animal or a sound of the diorama (sabanaRec); dr: the drum or the shaker (tamborRec).
const K='kalimbaRec';
const SB_CUES=Object.freeze([
 // 1 · Kilimanjaro at dawn: the sun rises behind the clouds and the snow turns pink; flamingos cross the sky far away
 (n,fx,dr)=>{for(let j=0;j<7;j++)n(3.9+j*.3,1.4,K,[[0,2,4,7,9,11,14][j]],.10+j*.008,0);dr(4.0,'baix',.14);n(5.4,1.6,K,[0,4,7,9],.15,1,{strum:.07});
  fx('flamencs',7.2,2,.05);for(let k=0;k<3;k++)n(7.4+k*.5,.6,K,[[9,7,9][k]],.07,1);},
 // 2 · the flamingos: they march, turn their heads together, feed upside down, one opens its wings, one tucks a leg
 (n,fx,dr)=>{fx('flamencs',1.0,2,.08);for(let k=0;k<7;k++)dr(.7+k*.45,'vora',.05);fx('flamencs',3.8,2,.11);n(3.9,.6,K,[7,9],.15,1);n(4.6,.6,K,[9,7],.14,1);
  for(let k=0;k<4;k++)n(5.9+k*.7,.8,K,[[4,2,4,0][k]],.10,1);fx('paperAles',8.9,1,.10);n(9.0,1.6,K,[0,2,4,7],.16,1,{strum:.06});n(10.9,.6,K,[4],.10,1);},
 // 3 · the crowned cranes: one steps closer, the other bobs; the jump with open wings; the bows; a hop
 (n,fx,dr)=>{dr(1.5,'vora',.06);n(2.4,.4,K,[4],.09,1);n(2.7,.4,K,[2],.09,1);fx('grua',3.35,2,.12);fx('paperAles',3.55,1,.12);
  for(let j=0;j<7;j++)n(3.6+j*.08,.8,K,[[0,2,4,7,9,11,14][j]],.11,0);dr(4.95,'mig',.14);n(5.8,1.1,K,[0],.14,0);n(6.6,1.1,K,[-3],.12,0);
  fx('grua',8.2,2,.08);fx('paperAles',8.3,1,.07);dr(9.5,'alt',.08);},
 // 4 · the giraffes: the calf walks up; the tongue pulls a twig in; oxpeckers hop up and down the neck; she looks at us
 (n,fx,dr)=>{for(let k=0;k<6;k++)dr(1.5+k*.8,'vora',.05);for(let j=0;j<5;j++)n(3.7+j*.12,.6,K,[7-j],.10,1);fx('fulles',4.4,1,.11);n(5.6,.3,K,[2],.07,1);n(6.0,.3,K,[0],.07,1);
  for(let k=0;k<8;k++)n(6.4+k*.42,.3,K,[[9,11,9,7,9,11,14,11][k]],.08,1);n(9.9,1.6,K,[0,4,7],.15,1,{strum:.06});dr(9.9,'alt',.08);},
 // 5 · the elephants at the waterhole: the mother drinks; the calf sprays its back; the mother's trunk touches it
 (n,fx,dr)=>{n(1.5,1.2,K,[0],.12,0);n(2.6,1.2,K,[4],.11,0);dr(3.9,'mig',.12);fx('esquitx',3.95,1,.13);for(let j=0;j<8;j++)n(4.0+j*.1,.8,K,[14-j],.11,1);
  fx('elefant',6.3,1,.12);n(6.6,1.5,K,[0,4],.14,0,{strum:.05});},
 // 6 · the zebras: the foal runs out, kicks up its heels and comes back; the group lifts its heads and ears
 (n,fx,dr)=>{for(let k=0;k<9;k++){dr(3.3+k*.33,k%2?'alt':'mig',.07);n(3.4+k*.33,.3,K,[k%2?7:4],.06,1);}dr(4.55,'vora',.12);n(4.55,.5,K,[11],.13,1);
  fx('zebra',8.35,1,.11);n(8.5,1.6,K,[0,4,7,9],.15,1,{strum:.06});},
 // 7 · the impalas: four leaps over the bush, one after another; the grazing ones lift their heads
 (n,fx,dr)=>{n(3.7,.8,K,[0],.08,0);for(let k=0;k<4;k++){const T=3.6+k*1.25,land=T+1-.067*k*(1-0);fx('paperLlisca',T-.05,1,.06);
  for(let j=0;j<5;j++)n(T+j*.07,.6,K,[j*2+k],.10,1);dr(land,'mig',.11);dr(land+.25,'vora',.06);}},
 // 8 · the warthogs: grazing on their wrists; the mother trots off, tail up, the piglets after her; she turns her face; tails wag
 (n,fx,dr)=>{fx('facoquer',1.2,1,.10);n(3.7,.5,K,[0,4],.12,0);for(let k=0;k<11;k++)dr(3.9+k*.28,k%2?'alt':'vora',.06);for(let k=0;k<3;k++)n(4.2+k*.3,.3,K,[9+k],.09,1);
  fx('facoquer',5.0,1,.08);dr(6.95,'mig',.11);n(7.3,1.4,K,[0,2,4],.14,1,{strum:.06});for(let k=0;k<6;k++)n(7.9+k*.22,.25,K,[[9,11][k%2]],.06,1);},
 // 9 · the wildebeest at the river: grunts; four leaps into the water, the first the biggest; they swim across and climb out
 (n,fx,dr)=>{fx('nyus',1.6,2,.10);for(let k=0;k<4;k++){const T=3.3+k*1.6;for(let j=0;j<5;j++)n(T+j*.07,.6,K,[11-j*2],.09,1);fx('salt',T+.8,2,[.14,.10,.09,.08][k]);}
  fx('nyus',9.6,2,.07);for(let k=0;k<5;k++)dr(9.8+k*.45,'vora',.05);},
 // 10 · the hippos: the camera at the waterline; the one behind walks along the bottom in bounds; the big one yawns and sinks back
 (n,fx,dr)=>{for(let k=0;k<5;k++)dr(2.4+k*1.7,'baix',.07);fx('hipopotam',3.75,2,.13);n(3.8,2.2,K,[0,4,7],.15,0,{strum:.12});dr(5.9,'baix',.12);
  n(6.5,.3,K,[9],.08,1);n(6.7,.3,K,[9],.08,1);},
 // 11 · the kingfishers: it bobs on the branch; flies out and hovers; dives; comes back and shakes the water off
 (n,fx,dr)=>{n(1.5,.3,K,[7],.06,1);n(2.3,.3,K,[7],.06,1);fx('blauet',3.6,2.2,.11);for(let k=0;k<12;k++)n(4.0+k*.1,.2,K,[k%2?11:9],.05,1);
  for(let j=0;j<6;j++)n(5.25+j*.06,.6,K,[14-j*2],.10,1);fx('capbussada',5.6,1.5,.13);n(7.05,.8,K,[4,7],.12,1);dr(7.3,'sonall',.12);dr(7.65,'sonall2',.08);
  for(let k=0;k<4;k++)n(7.4+k*.16,.4,K,[[14,11,9,11][k]],.06,1);},
 // 12 · the rhinos and the oxpeckers: the birds walk on the backs; all at once they fly up calling; the rhinos lift their heads; the
 // birds come back
 (n,fx,dr)=>{for(let k=0;k<4;k++)n(1.4+k*.7,.3,K,[[7,9,7,4][k]],.05,1);fx('picabous',4.85,1,.12);for(let j=0;j<8;j++)n(4.9+j*.06,.5,K,[j],.09,1);
  dr(5.3,'baix',.12);fx('rinoceront',5.6,1,.12);for(let j=0;j<6;j++)n(8.6+j*.12,.5,K,[11-j],.07,1);},
 // 13 · inside the termite mound: through the paper wall; the workers in the galleries; the warm air rises along the wall and sinks down the chimney
 (n,fx,dr)=>{fx('termits',1.6,1,.08);for(let k=0;k<5;k++)dr(1.8+k*.5,'vora',.035);fx('termitsAire',4.1,2,.13);
  for(let j=0;j<8;j++)n(4.2+j*.16,1,K,[j],.10,0);for(let j=0;j<7;j++)n(5.75+j*.18,1,K,[7-j],.08,0);n(7.0,1.6,K,[0,4,7],.11,1,{strum:.08});fx('termits',8.0,1,.07);fx('termitsAire',8.7,2,.07);fx('termits',11.0,1,.05);},
 // 14 · the mongooses and the hornbills: foraging; the shadow of a bird of prey: the sentinel calls and all dive in; heads come out
 (n,fx,dr)=>{fx('mangostes',1.4,2,.09);fx('calau',2.9,1,.10);dr(4.65,'baix',.14);fx('mangostes',4.75,2,.12);for(let j=0;j<5;j++)n(4.85+j*.07,.5,K,[9-j*2],.10,1);
  for(let k=0;k<4;k++){n(6.7+k*.7,.4,K,[[4,7,9,11][k]],.11,1);dr(6.7+k*.7,'vora',.05);}fx('calau',9.6,1,.09);},
 // 15 · the weavers: he weaves; he hangs under his nest and flaps; the female comes and goes in; he sings
 (n,fx,dr)=>{fx('teixidors',.9,2,.08);for(let k=0;k<4;k++){dr(2.4+k*.55,'sonall',.07);n(2.5+k*.55,.3,K,[[4,2,4,7][k]],.06,1);}
  fx('paperAles',4.9,1,.12);n(4.9,1.4,K,[0,4,7],.14,1,{strum:.05});for(let k=0;k<12;k++)n(5.1+k*.12,.2,K,[k%2?9:7],.06,1);
  fx('paperAles',7.7,1,.06);n(7.8,.6,K,[4],.11,1);n(8.2,.6,K,[7],.11,1);fx('teixidors',9.4,2,.09);},
 // 16 · the cheetahs: a cub stalks the white tip of the tail and pounces; the mother chirps; the cubs tumble and climb up to her
 (n,fx,dr)=>{for(let k=0;k<3;k++)n(2.6+k*.4,.4,K,[[0,2,0][k]],.06,0);for(let j=0;j<4;j++)n(4.0+j*.06,.5,K,[4+j*2],.10,1);dr(4.2,'alt',.12);
  fx('guepard',4.8,2,.12);for(let k=0;k<4;k++)dr(6.2+k*.3,'vora',.06);for(let j=0;j<6;j++)n(8.0+j*.25,.6,K,[j*2],.08,1);},
 // 17 · the lions at sunset: the lion yawns; a soft roar, chin up; the cubs bat at the tuft of the lioness's tail
 (n,fx,dr)=>{for(let j=0;j<6;j++)n(4.1+j*.24,1.2,K,[9-j],.09,1);fx('lleo',6.7,2,.12);dr(6.7,'baix',.13);for(let k=0;k<3;k++)n(9.0+k*.8,.4,K,[11,9],.08,1);},
 // 18 · the baobab at dusk: the flowers open one after another; the fruit bats come; a galago leaps
 (n,fx,dr)=>{fx('paperDesplega',3.3,2,.10);for(let k=0;k<5;k++)n(3.4+k*.7,1.2,K,[[0,4,7,9,11][k]],.13,1);fx('ratpenats',7.0,1,.10);fx('paperAles',7.3,1,.07);
  fx('ratpenats',8.8,1,.08);fx('galag',9.4,1,.10);dr(9.6,'alt',.08);},
 // 19 · the dung beetles at night: it rolls its ball; climbs on top and dances, looking up at the sky; rolls the ball away
 (n,fx,dr)=>{fx('escarabat',1.0,1,.12);for(let k=0;k<6;k++)dr(.5+k*.55,'vora',.045);for(let k=0;k<8;k++)n(4.8+k*.26,1.2,K,[[0,2,4,7,4,2,0,4][k]],.10,1);
  n(5.85,1.6,K,[11,14],.12,1,{strum:.08});n(6.65,1.6,K,[9,11],.10,1,{strum:.08});fx('escarabat',8.0,1,.10);fx('escarabat',10.0,1,.08);for(let k=0;k<6;k++)dr(7.9+k*.55,'vora',.04);},
 // 20 · the aardvark: its ears come up out of the hole; it sniffs and climbs out; ambles to a termite mound; digs, the clods fly; it
 // sits up and turns its face to us; its ears move
 (n,fx,dr)=>{n(2.5,.4,K,[9],.10,1);n(2.8,.4,K,[11],.10,1);fx('oricterop',3.0,2,.09);for(let j=0;j<5;j++)n(3.9+j*.2,.8,K,[j*2],.09,0);
  for(let k=0;k<4;k++)dr(5.5+k*.42,k%2?'vora':'mig',.06);fx('oricterop',7.5,2,.12);dr(7.3,'mig',.10);for(let k=0;k<12;k++)dr(7.5+k*.21,k%2?'sonall2':'sonall',.05);
  n(10.3,1.6,K,[0,4,7],.14,1,{strum:.06});n(11.3,.3,K,[9],.08,1);n(11.6,.3,K,[11],.08,1);n(11.9,.3,K,[9],.08,1);}
]);
export function sabanaScore(i,duration=SABANA_STIM){i=((i%SABANA_N)+SABANA_N)%SABANA_N;const S=Math.max(SABANA_STIM,duration),D=sabanaDuration(i,duration),M=SB_PIECES[i],sc=SB_SCALES[M.mode],E=escScore(D),T0=SABANA_TRAVEL,L=SABANA_LOUD*SB_TRIM[i];
 const deg=(d,o=0)=>M.root+12*(o+Math.floor(d/7))+sc[((d%7)+7)%7];
 const n=(t,len,inst,ds,vel,o=0,x={})=>E.add(t,len,inst,[...new Set([].concat(ds).map(d=>sbFit(inst,deg(d,o))))],vel*L,x);
 const fx=(variant,t,len,vel,inst='sabanaRec')=>E.add(t,len,inst,[60],vel*L,{variant});
 const dr=(t,variant,vel)=>E.add(t,variant.startsWith('sonall')?.8:1.2,'tamborRec',[60],vel*L,{variant});
 // the travelling: the paper of the diorama sliding past, or the air when the camera rises, the sheet unfolding into the termite mound,
 // the water at the waterline; the kalimba runs up, down, or in an arch
 const a=i>0?SABANA_POSES[i-1]:SABANA_START,b=SABANA_POSES[i],dy=b[1]-a[1];
 if(i===12)fx('paperDesplega',.1,2,.10);else if(i===9)fx('capbussada',1.2,1.5,.09);else if(dy>.35)fx('aire',.1,2,.10);else fx('paperLlisca',.15,1,.09);
 if(dy>.35)for(let j=0;j<10;j++)n(.2+j*.15,.9,K,[j],.12,0);
 else if(dy<-.35)for(let j=0;j<10;j++)n(.2+j*.15,.9,K,[11-j],.12,0);
 else for(let j=0;j<8;j++)n(.25+j*.17,.9,K,[[0,2,4,7,9,7,4,2][j]],.11,0);
 if(M.amb)fx(M.amb,.3,S*.9,.07,'natureRec');
 const beat=60/M.bpm,B=4*beat,bars=Math.max(2,Math.floor(S/B)),cad=T0+S-B;
 for(let k=0;k<bars-1;k++){const t=T0+k*B,r=M.chords[k%M.chords.length];
  n(t,B*.5,K,[r],.20,-1);n(t+2*beat,B*.4,K,[r+4],.14,-1);
  M.figure.forEach((f,j)=>{const u=t+j*B/M.figure.length;if((j+k)%7===6||u>=cad)return;n(u,beat*1.2,K,[r+f],j%4===0?.11:.08,0);});
  [...M.drum].forEach((c,j)=>{const u=t+j*B/8;if(c!=='.'&&u<cad)dr(u,SB_DRUM[c],c==='B'?.10:.06);});
  [...M.shake].forEach((c,j)=>{const u=t+j*B/8;if(c!=='.'&&u<cad)dr(u,j%4===1?'sonall2':'sonall',c==='S'?.05:.03);});}
 const phrase=(t0,shift,vel,oct)=>{let u=t0;for(const [d,bt] of M.motif){if(u>=cad-.2)break;if(d!==null)n(u,Math.min(bt*beat*1.15,cad-u),K,[d+shift],vel,oct);u+=bt*beat;}};
 phrase(T0+B*.5,0,.20,1);if(bars>3)phrase(T0+B*2.5,-2,.16,0);if(bars>5)phrase(T0+B*4.5,0,.18,1);
 SB_CUES[i](n,fx,dr);
 // the end: a chord struck on the kalimba, the low drum and a tap on the rim, dying away
 n(cad,2.4,K,[0,4,7,9],.22,0,{strum:.07});n(cad+.05,1.6,K,[7,11],.14,1,{strum:.05});n(cad,1.4,K,[0],.20,-1);dr(cad,'baix',.12);dr(cad+.35,'vora',.07);
 // after the twentieth, the climb back to the sky: the air rises, the paper slides past, the kalimba climbs, the dawn again
 if(i===SABANA_N-1){const c0=T0+S;fx('aire',c0,2,.10);fx('paperLlisca',c0+1.5,1,.07);fx('sbAlba',c0+1.4,3.5,.06,'natureRec');for(let j=0;j<16;j++)n(c0+.2+j*.17,1,K,[j],.10+j*.003,0);
  n(c0+3.2,1.6,K,[0,4,7,11],.14,1,{strum:.07});dr(c0+3.2,'baix',.10);}
 return E.done();}

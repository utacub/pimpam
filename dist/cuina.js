// La cuina que balla (CE34, 0.26): a press brings one big thing of the kitchen drawn with a single thick line on black; it draws
// itself, dances on itself to its own music and stops, like Dibuixos que ballen (dibuixos.js), which draws, dances and composes it.
// Here: the music of each thing and the collection.
import {CN_ART} from './cuina-art.js';
// ── The music ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The notation of Dibuixos que ballen (dibuixos.js): eight bars, A (bars 1–4) and B (bars 5–8, the ending); degree:beats, r a rest;
// prog, the chord of each bar. Recorded acoustic instruments only, and the tunes end on struck and plucked notes. Each piece is a
// dance of its own (a minuet, a ragtime, a tango, a pasodoble, a tarantella, a bossa nova, a cha-cha-cha...), all of them original.
const CN_OOM={bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.58},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.3}};
const CN_WALTZ={bass:{inst:'celliPizzRec',pat:[[0,0]],center:45,vel:.58},comp:{inst:'violinsPizzRec',pat:[1,2],center:64,size:3,vel:.3}};
export const CN_MUSIC=Object.freeze([
 // Tetera: a minuet on the flute over the harp; the teapot pours on the first beat of every bar, with a glockenspiel note.
 {bpm:108,meter:3,key:55,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:1 2:.5 3:.5 4:1|6:1 4:.5 5:.5 6:1|7:1 4:1 2:1|1:2 r:1|5:1 3:.5 4:.5 5:1|4:1 2:1 0:1|1:1 4:.5 3:.5 1:1|0:3',
  mel:{inst:'fluteRec',target:79,vel:.52},par:{inst:'harpRec',shift:-7,target:67,vel:.28},bass:{inst:'celliPizzRec',pat:[[0,0]],center:43,vel:.54},comp:{inst:'harpRec',pat:[1,2],center:62,size:3,vel:.26},
  pulse:{inst:'glockRec',center:86,vel:.24}},
 // Torradora: a ragtime two-step on the clarinet and the marimba; the toast pops up on the first beat of every bar (the woodblock), and
 // every four bars it rings like the toaster's bell.
 {bpm:112,meter:2,key:53,mode:'ionian',prog:[0,0,4,4,3,0,4,0],tune:'2:.5 4:.25 7:.75 4:.5|9:.5 7:.5 4:.5 2:.5|1:.5 4:.25 6:.75 4:.5|8:.5 6:.5 4:1|3:.5 5:.25 7:.75 5:.5|4:.5 2:.5 0:1|6:.25 6:.25 8:.5 6:.5 4:.5|7:1 r:1',
  mel:{inst:'clarinetRec',target:72,vel:.56},par:{inst:'marimbaRec',shift:0,target:72,vel:.3},...CN_OOM,perc:[{inst:'triangleRec',variant:'hit',pat:[0],every:4,vel:.2}],pulse:{inst:'woodblockRec',vel:.48}},
 // Paella i crep: a quick French two-four on the flute and the clarinet; the pancake lands in the pan on the first beat of every bar,
 // on the marimba.
 {bpm:104,meter:2,key:60,mode:'ionian',prog:[0,3,4,0,0,3,4,0],tune:'0:.5 2:.5 4:.5 7:.5|5:1 3:.5 5:.5|4:.5 6:.5 8:.5 6:.5|7:1.5 r:.5|7:.5 9:.5 11:.5 9:.5|10:1 8:.5 7:.5|6:.5 4:.5 1:.5 4:.5|0:1.5 r:.5',
  mel:{inst:'fluteRec',target:81,vel:.52},par:{inst:'clarinetRec',shift:-2,target:70,vel:.26},bass:CN_OOM.bass,comp:{inst:'harpRec',pat:[.5,1.5],center:64,size:3,vel:.26},pulse:{inst:'marimbaRec',center:60,alt:[0,4],vel:.42}},
 // Varetes: a perpetual motion in the dorian mode, running semiquavers on the marimba; drops fly from the bowl on every beat (a muted
 // triangle).
 {bpm:120,meter:2,key:57,mode:'dorian',prog:[0,3,0,3,6,3,4,0],tune:'4:.25 2:.25 0:.25 2:.25 4:.25 2:.25 0:.25 2:.25|5:.25 3:.25 0:.25 3:.25 5:.25 3:.25 0:.25 3:.25|7:.25 4:.25 2:.25 4:.25 7:.25 4:.25 2:.25 4:.25|5:.5 7:.5 10:1|6:.25 8:.25 10:.25 8:.25 6:.25 8:.25 10:.25 8:.25|5:.25 7:.25 10:.25 7:.25 5:.25 3:.25 5:.25 7:.25|4:.25 6:.25 8:.25 6:.25 4:.5 1:.5|0:1 r:1',
  mel:{inst:'marimbaRec',target:74,vel:.58},bass:{inst:'celliPizzRec',pat:[[0,0],[1,0]],center:45,vel:.56},comp:{inst:'harpRec',pat:[.5,1.5],center:62,size:3,vel:.24},pulse:{inst:'triangleRec',variant:'muted',vel:.24,accent:2}},
 // Fruitera: a samba on the flute and the marimba; the fruits hop in turn, one on every beat, each on its note (the apple low, the
 // grapes high).
 {bpm:104,meter:2,key:63,mode:'ionian',prog:[0,5,1,4,0,5,4,0],tune:'4:.75 2:.25 r:.25 4:.25 7:.5|5:.75 2:.25 r:.25 5:.25 7:.5|3:.75 1:.25 r:.25 3:.25 5:.5|6:.5 4:.5 1:1|7:.75 4:.25 r:.25 7:.25 9:.5|9:.75 7:.25 r:.25 5:.25 7:.5|8:.5 6:.5 4:.5 1:.5|0:1.5 r:.5',
  mel:{inst:'fluteRec',target:81,vel:.52},par:{inst:'marimbaRec',shift:0,target:72,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0],[.75,0],[1,4]],center:43,vel:.56},comp:{inst:'violinsPizzRec',pat:[.5,1.25,1.75],center:64,size:3,vel:.24},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[0,.75,1.5],vel:.18}],pulse:{inst:'marimbaRec',center:67,alt:[0,2,4,7],vel:.36}},
 // Gelat: a lazy soft-shoe on the clarinet, swung, over plucked strings and the harp; the cherry hops on every beat (the glockenspiel).
 {bpm:96,meter:2,key:58,mode:'ionian',prog:[0,3,0,4,0,3,4,0],tune:'2:.667 3:.333 4:1|5:.667 4:.333 3:1|2:.667 4:.333 7:.667 4:.333|6:2|7:.667 6:.333 7:.667 9:.333|10:.667 9:.333 7:1|8:.667 6:.333 4:.667 1:.333|0:1.5 r:.5',
  mel:{inst:'clarinetRec',target:70,vel:.56},bass:CN_OOM.bass,comp:{inst:'harpRec',pat:[.667,1.667],center:64,size:3,vel:.26},pulse:{inst:'glockRec',center:84,alt:[0,2,4,2],vel:.22}},
 // Flam: a tango in a minor key on the violins over plucked chords; it wobbles on every beat, on the plucked bass, and every four
 // bars it goes boing like a jelly.
 {bpm:116,meter:2,key:62,mode:'harmonic',prog:[0,0,4,4,3,0,4,0],tune:'4:.75 3:.25 4:.5 7:.5|6:.5 4:.5 2:1|1:.75 0:.25 1:.5 4:.5|6:.5 4:.5 1:1|5:.75 4:.25 5:.5 7:.5|9:.5 7:.5 4:1|6:.5 4:.25 6:.25 8:.5 6:.5|7:.5 r:.5 0:.5 r:.5',
  mel:{inst:'violinsRec',target:74,vel:.48},bass:{inst:'celliPizzRec',pat:[[0,0],[.75,4],[1,0]],center:43,vel:.58},comp:{inst:'violinsPizzRec',pat:[0,.75,1.5],center:62,size:3,vel:.28},perc:[{inst:'toonRec',variant:'jelly',pat:[0],every:4,vel:.26}],
  pulse:{inst:'celliPizzRec',bass:true}},
 // Pastís: a party waltz on the clarinet, the marimba an octave up; the cake squashes, the top tier jumps and the candles sway, one on each
 // beat of the bar, on the marimba.
 {bpm:132,meter:3,key:53,mode:'ionian',prog:[0,4,4,0,3,0,4,0],tune:'0:1 2:1 4:1|6:2 4:1|8:1 6:1 4:1|7:3|5:1 7:1 10:1|9:2 7:1|6:1 8:1 11:1|7:2 r:1',
  mel:{inst:'clarinetRec',target:72,vel:.56},par:{inst:'marimbaRec',shift:7,target:82,vel:.2},...CN_WALTZ,perc:[{inst:'triangleRec',variant:'hit',pat:[0],every:4,vel:.16}],pulse:{inst:'marimbaRec',center:72,alt:[0,2,4],vel:.32}},
 // Plàtan: a conga in the mixolydian mode on the trumpet and the trombone; the flaps of the peel fly up on every beat, on the timpani.
 {bpm:120,meter:2,key:55,mode:'mixolydian',prog:[0,6,3,0,0,6,3,0],tune:'4:.5 4:.25 2:.25 r:.5 4:.5|3:.5 3:.25 1:.25 r:.5 6:.5|5:.5 7:.5 5:.5 3:.5|4:1.5 r:.5|7:.5 7:.25 9:.25 r:.5 7:.5|8:.5 6:.5 3:.5 6:.5|5:.5 3:.5 2:.25 3:.25 5:.5|7:.5 r:.5 0:.5 r:.5',
  mel:{inst:'trumpetRec',target:72,vel:.5},par:{inst:'tromboneRec',shift:-2,target:60,vel:.28},bass:{inst:'celliPizzRec',pat:[[0,0],[.75,4],[1.5,0]],center:43,vel:.56},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.26},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[0,.75,1.5],vel:.16}],pulse:{inst:'timpaniRec',center:48,alt:[0,4],vel:.36}},
 // Crispetes: a pizzicato polka, staccato like the popping corn; a pop on every beat (the claves), and the big pop that throws the
 // lid up, with a soft cymbal.
 {bpm:132,meter:2,key:57,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'4:.25 r:.25 4:.25 r:.25 2:.5 4:.5|7:.5 r:.25 4:.25 2:.5 0:.5|1:.25 r:.25 1:.25 r:.25 4:.5 6:.5|4:.5 2:.5 0:.5 r:.5|5:.25 r:.25 5:.25 r:.25 7:.5 10:.5|9:.5 7:.5 4:.5 2:.5|4:.25 6:.25 8:.25 6:.25 4:.25 6:.25 8:.25 11:.25|7:.5 r:.5 0:.5 r:.5',
  mel:{inst:'violinsPizzRec',target:79,vel:.52},par:{inst:'marimbaRec',shift:-2,target:72,vel:.28},...CN_OOM,comp:{inst:'harpRec',pat:[.5,1.5],center:64,size:3,vel:.24},
  perc:[{inst:'cymbalRec',variant:'soft',pat:[1],every:4,at:3,vel:.14}],pulse:{inst:'woodblockRec',variant:'claves',vel:.44,accent:2}},
 // Cafetera: a bossa nova on the flute and the clarinet over the harp; the lid flaps on every beat, on a soft glockenspiel note.
 {bpm:116,meter:2,key:51,mode:'ionian',prog:[0,1,4,0,0,1,4,0],tune:'2:.75 4:.75 2:.5|3:.75 5:.75 3:.5|1:.75 4:.75 6:.5|4:1.5 r:.5|7:.75 6:.25 7:.5 9:.5|8:.75 5:.75 3:.5|4:.5 6:.5 8:.5 6:.5|7:1 r:1',
  mel:{inst:'fluteRec',target:79,vel:.48},par:{inst:'clarinetRec',shift:-2,target:70,vel:.24},bass:{inst:'celliPizzRec',pat:[[0,0],[1.5,4]],center:43,vel:.54},comp:{inst:'harpRec',pat:[0,.75,1.5],center:62,size:3,vel:.24},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[.75,1.5],vel:.14}],pulse:{inst:'glockRec',center:84,alt:[0,4],vel:.2}},
 // Salers: a polka on the oboe and the flute; the salt and the pepper take turns, one on each beat, high and low on the glockenspiel.
 {bpm:120,meter:2,key:55,mode:'ionian',prog:[0,0,4,4,3,0,4,0],tune:'0:.5 2:.5 4:.5 4:.5|7:.5 4:.5 2:1|1:.5 4:.5 6:.5 6:.5|8:.5 6:.5 4:1|3:.5 5:.5 7:.5 5:.5|4:.5 7:.5 9:1|8:.25 9:.25 8:.25 6:.25 4:.5 1:.5|0:.5 4:.5 0:.5 r:.5',
  mel:{inst:'oboeRec',target:74,vel:.52},par:{inst:'fluteRec',shift:2,target:84,vel:.2},...CN_OOM,perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.1}],pulse:{inst:'glockRec',center:86,alt:[4,0],vel:.22}},
 // Hamburguesa: a shuffle in the mixolydian mode on the clarinet and the trombone; the layers bounce on every beat, on a walking bass,
 // and every four bars the top bun lifts with a soft cymbal.
 {bpm:112,meter:2,key:60,mode:'mixolydian',prog:[0,0,3,0,4,3,4,0],tune:'4:.667 4:.333 2:.667 0:.333|2:.667 4:.333 7:1|5:.667 5:.333 3:.667 0:.333|4:1.5 r:.5|6:.667 6:.333 4:.667 1:.333|5:.667 3:.333 0:1|1:.333 4:.333 6:.333 8:.667 6:.333|7:.667 4:.333 0:1',
  mel:{inst:'clarinetRec',target:70,vel:.56},par:{inst:'tromboneRec',shift:-7,target:58,vel:.24},bass:{inst:'celliPizzRec',pat:[[0,0],[1,2]],center:43,vel:.6},comp:{inst:'violinsPizzRec',pat:[.667,1.667],center:64,size:3,vel:.26},
  perc:[{inst:'snareRec',variant:'hit',pat:[1],vel:.14},{inst:'cymbalRec',variant:'soft',pat:[1],every:4,at:3,vel:.12}],pulse:{inst:'celliPizzRec',bass:true}},
 // Pot de mel: a slow barcarolle on the cello, the flute an octave above it; the dipper rises from the pot on the first beat of every
 // bar (the harp).
 {bpm:80,meter:2,key:53,mode:'ionian',prog:[0,3,0,4,5,3,4,0],tune:'4:.667 2:.333 4:.667 7:.333|5:1 3:.667 5:.333|4:.667 2:.333 0:.667 2:.333|1:2|2:.667 5:.333 7:.667 9:.333|10:1 7:.667 5:.333|6:.667 4:.333 1:.667 6:.333|7:1.667 r:.333',
  mel:{inst:'celliRec',target:62,vel:.5},par:{inst:'fluteRec',shift:7,target:84,vel:.16},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:41,vel:.54},arp:{inst:'harpRec',every:1/3,center:62,vel:.24},
  pulse:{inst:'harpRec',center:55,vel:.44}},
 // Pizzer: a tarantella in a minor key, the flute doubled by plucked violins like a mandolin; he catches the dough on the first beat
 // of every bar (the bass drum).
 {bpm:132,meter:2,key:57,mode:'harmonic',prog:[0,0,4,4,0,3,4,0],tune:'4:.333 4:.333 4:.333 7:.667 4:.333|2:.333 4:.333 2:.333 0:1|6:.333 6:.333 6:.333 8:.667 6:.333|4:.333 6:.333 4:.333 1:1|7:.333 6:.333 7:.333 9:.333 7:.333 4:.333|5:.333 4:.333 5:.333 7:.333 5:.333 3:.333|4:.333 6:.333 8:.333 6:.333 4:.333 1:.333|0:.333 4:.333 7:.333 0:1',
  mel:{inst:'fluteRec',target:81,vel:.5},par:{inst:'violinsPizzRec',shift:0,target:76,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:45,vel:.56},comp:{inst:'harpRec',pat:[.667,1.667],center:62,size:3,vel:.24},
  perc:[{inst:'snareRec',variant:'hit',pat:[1],vel:.12}],pulse:{inst:'bassdrumRec',variant:'soft',vel:.42}},
 // Castanyera: an autumn song in six-eight in the dorian mode, on the oboe over the harp; she shakes the pan on every beat (the
 // claves, our castanets).
 {bpm:92,meter:2,key:64,mode:'dorian',prog:[0,3,0,6,0,3,4,0],tune:'0:.667 2:.333 4:.667 2:.333|3:.667 5:.333 7:1|4:.667 2:.333 4:.667 7:.333|6:1.667 r:.333|7:.667 9:.333 7:.667 4:.333|5:.667 7:.333 10:.667 7:.333|6:.667 4:.333 1:.667 4:.333|0:1.667 r:.333',
  mel:{inst:'oboeRec',target:72,vel:.52},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.54},arp:{inst:'harpRec',every:1/3,center:62,vel:.26},pulse:{inst:'woodblockRec',variant:'claves',vel:.36,accent:2}},
 // Espaguetis: an Italian waltz on the clarinet, plucked violins an octave up like a mandolin; the meatballs jump one on each beat, on
 // the marimba.
 {bpm:138,meter:3,key:60,mode:'ionian',prog:[0,3,4,0,5,3,4,0],tune:'4:1.5 5:.5 4:1|5:2 3:1|4:1.5 6:.5 8:1|7:2 r:1|9:1.5 7:.5 5:1|7:1.5 5:.5 3:1|4:1 6:1 1:1|0:2 r:1',
  mel:{inst:'clarinetRec',target:72,vel:.56},par:{inst:'violinsPizzRec',shift:7,target:84,vel:.22},...CN_WALTZ,pulse:{inst:'marimbaRec',center:67,alt:[0,2,4],vel:.32}},
 // Xocolata amb xurros: a pasodoble on the trumpet, the clarinet a third under it; the churros dunk in turn, one on every beat, on the timpani.
 {bpm:120,meter:2,key:62,mode:'harmonic',prog:[0,0,4,4,3,0,4,0],tune:'4:.25 4:.25 4:.5 7:.5 4:.5|6:.25 4:.25 2:.5 0:1|1:.25 1:.25 1:.5 4:.5 6:.5|8:.5 6:.5 4:1|5:.25 5:.25 5:.5 7:.5 10:.5|9:.5 7:.5 4:1|6:.5 4:.25 6:.25 8:.5 6:.5|7:.5 r:.5 0:.5 r:.5',
  mel:{inst:'trumpetRec',target:72,vel:.5},par:{inst:'clarinetRec',shift:-2,target:66,vel:.26},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.5,len:.45},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.28},
  perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.12},{inst:'cymbalRec',variant:'soft',pat:[0],every:4,vel:.12}],pulse:{inst:'timpaniRec',center:48,alt:[0,4],vel:.34}},
 // Batut: a cha-cha-cha on the flute and the marimba; the cherry hops on every beat (the glockenspiel), the claves play the cha-cha.
 {bpm:120,meter:2,key:55,mode:'ionian',prog:[0,3,4,0,0,3,4,0],tune:'4:.5 2:.5 4:.25 4:.25 4:.5|5:.5 3:.5 5:.25 5:.25 5:.5|6:.5 4:.5 1:.25 1:.25 1:.5|2:.5 4:.5 7:1|7:.5 9:.5 7:.25 7:.25 7:.5|10:.5 7:.5 5:.25 5:.25 5:.5|8:.5 6:.5 4:.25 4:.25 4:.5|7:.5 r:.5 0:.5 r:.5',
  mel:{inst:'fluteRec',target:79,vel:.52},par:{inst:'marimbaRec',shift:0,target:72,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0],[1.5,4]],center:43,vel:.56},comp:{inst:'harpRec',pat:[.5,1.5],center:64,size:3,vel:.24},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[1.5,1.75],vel:.18}],pulse:{inst:'glockRec',center:84,alt:[0,4],vel:.22}},
 // Ou a la coqueta: a pastoral in six-eight on the flute over the harp; the spoon taps on three beats and the top comes off on the
 // fourth, on the glockenspiel, climbing.
 {bpm:84,meter:2,key:53,mode:'ionian',prog:[0,3,4,0,5,3,4,0],tune:'2:.667 4:.333 7:.667 4:.333|5:.667 7:.333 5:.667 3:.333|4:.667 6:.333 8:.667 6:.333|7:1.667 r:.333|9:.667 7:.333 5:.667 7:.333|10:.667 9:.333 7:.667 5:.333|4:.667 6:.333 1:.667 4:.333|0:1.667 r:.333',
  mel:{inst:'fluteRec',target:79,vel:.5},bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.52},arp:{inst:'harpRec',every:1/3,center:62,vel:.26},pulse:{inst:'glockRec',center:84,alt:[0,2,4,7],vel:.22}}
]);
// The level of each piece, in dB, so that the twenty sound about equally loud (measured offline as the app plays them, 0.26: from
// −24.2…−28.6 LUFS to about −24.7 in the review copy, like Dibuixos que ballen). Velocity is quadratic, so dB/40 (dibuixos.js).
const CN_LOUD=Object.freeze([1.7,1.3,1.1,-0.5,0.6,1.2,1.7,1.7,1.4,0.6,1.6,1.2,1.3,2.0,1.1,1.9,1.5,3.1,1.4,2.1]);
export const CN_SET=Object.freeze({id:'kitchen',art:CN_ART,music:CN_MUSIC,loud:CN_LOUD});

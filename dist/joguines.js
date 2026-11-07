// Joguines que ballen (CE33, 0.26): a press brings one big toy drawn with a single thick line on black; it draws itself, dances on
// itself to its own music and stops, like Dibuixos que ballen (dibuixos.js), which draws, dances and composes it. Here: the music of
// each toy and the collection.
import {JG_ART} from './joguines-art.js';
// ── The music ────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The notation of Dibuixos que ballen (dibuixos.js): eight bars, A (bars 1–4, repeated) and B (bars 5–8, the ending); degree:beats,
// r a rest; prog, the chord of each bar. Recorded acoustic instruments only, and the tunes end on struck and plucked notes. A few
// cartoon noises of the collection (toonRec: the boing of a spring) mark the start of a phrase now and then.
const JG_OOM={bass:{inst:'celliPizzRec',pat:[[0,0],[1,4]],center:43,vel:.6},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.34}};
const JG_WALTZ={bass:{inst:'celliPizzRec',pat:[[0,0]],center:45,vel:.6},comp:{inst:'violinsPizzRec',pat:[1,2],center:64,size:3,vel:.32}};
export const JG_MUSIC=Object.freeze([
 // Caixa sorpresa: a jig on the clarinet, the marimba an octave up; the clown springs up on every beat (a plucked note), with a boing
 // at the start of every phrase.
 {bpm:108,meter:2,key:53,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'0:.333 2:.333 4:.333 7:.667 4:.333|5:.667 4:.333 2:.667 0:.333|1:.333 4:.333 6:.333 8:.667 6:.333|4:.667 2:.333 0:1|3:.333 5:.333 7:.333 10:.667 7:.333|9:.667 7:.333 4:.667 2:.333|1:.333 3:.333 4:.333 6:.333 8:.333 6:.333|7:1.5 r:.5',
  mel:{inst:'clarinetRec',target:72,vel:.58},par:{inst:'marimbaRec',shift:7,target:82,vel:.2},bass:JG_OOM.bass,comp:{inst:'violinsPizzRec',pat:[.667,1.667],center:64,size:3,vel:.32},
  perc:[{inst:'toonRec',variant:'boing',pat:[0],every:4,vel:.3}],pulse:{inst:'violinsPizzRec',center:67,alt:[0,2,4,2],vel:.4}},
 // Pilota: a bouncing two-four in arpeggios on the flute and the marimba; the ball lands on every beat, on the plucked bass.
 {bpm:116,meter:2,key:55,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:.5 2:.5 4:.5 7:.5|6:.5 4:.5 1:1|4:.5 2:.5 4:.5 9:.5|8:.5 6:.5 4:1|5:.5 7:.5 10:.5 7:.5|9:.5 7:.5 4:1|6:.5 8:.5 6:.5 4:.5|7:1.5 r:.5',
  mel:{inst:'fluteRec',target:81,vel:.52},par:{inst:'marimbaRec',shift:0,target:72,vel:.34},...JG_OOM,pulse:{inst:'celliPizzRec',center:43,vel:.6,bass:true}},
 // Cavallet: a lilting six-eight on the flute and the clarinet; the claves go clip-clop as the horse rocks, one on every beat.
 {bpm:92,meter:2,key:62,mode:'ionian',prog:[0,3,4,0,0,3,4,0],tune:'0:.667 2:.333 4:.667 2:.333|3:.667 5:.333 7:1|6:.667 4:.333 1:.667 2:.333|0:2|4:.667 7:.333 9:.667 7:.333|8:.667 7:.333 5:1|4:.667 3:.333 1:.667 6:.333|7:1.667 r:.333',
  mel:{inst:'fluteRec',target:79,vel:.54},par:{inst:'clarinetRec',shift:-2,target:68,vel:.3},bass:JG_OOM.bass,comp:{inst:'violinsPizzRec',pat:[.667,1.667],center:64,size:3,vel:.3},
  pulse:{inst:'woodblockRec',variant:'claves',vel:.44,accent:2}},
 // Robot: a clockwork march on the marimba, short notes; the woodblock ticks on every step and the claves tock between.
 {bpm:112,meter:2,key:60,mode:'ionian',prog:[0,0,4,4,3,3,4,0],tune:'0:.25 0:.25 4:.5 0:.25 0:.25 4:.5|5:.5 4:.5 2:.5 0:.5|1:.25 1:.25 4:.5 1:.25 1:.25 4:.5|6:.5 4:.5 1:1|3:.25 3:.25 5:.5 7:.5 5:.5|3:.5 5:.5 10:1|8:.5 6:.5 4:.5 1:.5|0:.5 4:.5 7:.5 r:.5',
  mel:{inst:'marimbaRec',target:74,vel:.62},...JG_OOM,perc:[{inst:'woodblockRec',variant:'claves',pat:[.5,1.5],vel:.2}],pulse:{inst:'woodblockRec',vel:.48,accent:2}},
 // Estel: an airy waltz in the lydian mode on the flute, the violins a third under it; a gust lifts the kite on the first beat of every
 // bar, with the harp.
 {bpm:120,meter:3,key:57,mode:'lydian',prog:[0,1,0,1,5,0,4,0],tune:'4:2 2:1|5:2 3:1|4:1 7:1 9:1|8:3|9:2 7:1|7:1 4:1 2:1|6:2 8:1|7:3',
  mel:{inst:'fluteRec',target:81,vel:.52},par:{inst:'violinsRec',shift:-2,target:72,vel:.26},bass:{inst:'celliPizzRec',pat:[[0,0]],center:45,vel:.56},comp:{inst:'harpRec',pat:[1,2],center:64,size:3,vel:.28},
  pulse:{inst:'harpRec',center:62,vel:.42}},
 // Nines russes: a waltz in a minor key on the clarinet, doubled by plucked violins an octave up like a balalaika; each doll hops on
 // her beat of the bar, on a marimba note that climbs from the big one to the small one.
 {bpm:144,meter:3,key:62,mode:'harmonic',prog:[0,0,4,0,3,0,4,0],tune:'0:1 2:1 4:1|7:2 4:1|6:1 4:1 1:1|2:2 0:1|5:1 3:1 5:1|7:2 4:1|6:1 8:1 6:1|7:3',
  mel:{inst:'clarinetRec',target:70,vel:.58},par:{inst:'violinsPizzRec',shift:7,target:82,vel:.26},...JG_WALTZ,pulse:{inst:'marimbaRec',center:72,alt:[0,2,4],vel:.4}},
 // Baldufa: a smooth waltz that turns on itself (turns of the tune), on the flute with a glockenspiel; a soft marimba note on every beat,
 // where the ring of dust spreads.
 {bpm:112,meter:3,key:51,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:1 5:.5 4:.5 3:.5 4:.5|1:1 2:.5 1:.5 0:.5 1:.5|4:1 5:.5 4:.5 7:.5 9:.5|8:2 r:1|7:1 8:.5 7:.5 5:.5 3:.5|4:1 2:.5 4:.5 7:1|6:.5 8:.5 6:.5 4:.5 1:1|0:3',
  mel:{inst:'fluteRec',target:79,vel:.5},par:{inst:'glockRec',shift:7,target:93,vel:.15},bass:{inst:'celliPizzRec',pat:[[0,0]],center:43,vel:.56},comp:{inst:'harpRec',pat:[1,2],center:62,size:3,vel:.28},
  pulse:{inst:'marimbaRec',center:62,alt:[0,2,4],vel:.34}},
 // Corda: a skipping chant on the clarinet (sol, mi, la), with a glockenspiel; the rope taps the ground on every beat (the claves).
 {bpm:104,meter:2,key:57,mode:'ionian',prog:[0,0,4,0,0,3,4,0],tune:'4:.5 2:.5 5:.5 4:.5|2:.5 4:.5 2:1|4:.5 1:.5 4:.5 6:.5|4:.5 2:.5 0:1|7:.5 7:.5 5:.5 4:.5|5:.5 3:.5 5:1|4:.5 6:.5 8:.5 6:.5|7:1 0:1',
  mel:{inst:'clarinetRec',target:70,vel:.58},par:{inst:'glockRec',shift:7,target:91,vel:.18},...JG_OOM,perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.12}],
  pulse:{inst:'woodblockRec',variant:'claves',vel:.44,accent:2}},
 // Molinet: a breezy six-eight on the flute and the clarinet over harp arpeggios; every two beats a gust, with the glockenspiel.
 {bpm:96,meter:2,key:53,mode:'ionian',prog:[0,3,0,3,5,3,4,0],tune:'4:.667 5:.333 7:1|5:.667 4:.333 3:1|4:.667 5:.333 7:.667 9:.333|7:2|9:.667 8:.333 7:1|10:.667 9:.333 7:1|6:.667 8:.333 4:1|7:2',
  mel:{inst:'fluteRec',target:81,vel:.52},par:{inst:'clarinetRec',shift:-2,target:70,vel:.28},bass:JG_OOM.bass,arp:{inst:'harpRec',every:1/3,center:62,vel:.26},
  pulse:{inst:'glockRec',center:86,vel:.24}},
 // Titella: a country dance in the mixolydian mode on the clarinet with the marimba; a kick on every beat, on the small drum.
 {bpm:116,meter:2,key:55,mode:'mixolydian',prog:[0,0,6,0,3,0,6,0],tune:'4:.5 3:.25 2:.25 1:.5 0:.5|4:.5 4:.5 7:1|8:.5 6:.5 3:.5 6:.5|4:.5 2:.5 0:1|7:.5 5:.5 3:.5 5:.5|4:.25 5:.25 4:.25 2:.25 4:1|6:.5 8:.5 10:.5 8:.5|7:1.5 r:.5',
  mel:{inst:'clarinetRec',target:72,vel:.58},par:{inst:'marimbaRec',shift:0,target:72,vel:.32},...JG_OOM,perc:[{inst:'bassdrumRec',variant:'soft',pat:[0],vel:.3}],pulse:{inst:'snareRec',variant:'hit',vel:.34,accent:2}},
 // Io-io: every bar the tune runs down and up again, like the yo-yo, on the marimba; the hand catches it every two beats (a high
 // glockenspiel note).
 {bpm:96,meter:2,key:58,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'7:.5 4:.5 2:.5 4:.5|8:.5 6:.5 4:.5 6:.5|9:.5 7:.5 4:.5 7:.5|8:1 6:1|10:.5 7:.5 5:.5 7:.5|9:.5 7:.5 4:.5 2:.5|1:.5 4:.5 6:.5 8:.5|7:2',
  mel:{inst:'marimbaRec',target:76,vel:.6},bass:JG_OOM.bass,comp:{inst:'harpRec',pat:[.5,1.5],center:64,size:3,vel:.26},pulse:{inst:'glockRec',center:86,vel:.26}},
 // Dòminos: the tune goes down the scale as the dominoes fall, one click of the claves on every beat, and climbs again as they stand
 // up; plucked violins and the marimba.
 {bpm:100,meter:2,key:60,mode:'ionian',prog:[0,0,4,0,0,3,4,0],tune:'7:1 6:.5 5:.5|4:.5 3:.5 2:.5 1:.5|0:.5 -1:.5 1:.5 4:.5|2:.5 4:.5 7:1|9:.5 8:.5 7:.5 6:.5|5:.5 3:.5 5:.5 7:.5|8:.5 6:.5 4:.5 1:.5|0:1.5 r:.5',
  mel:{inst:'violinsPizzRec',target:76,vel:.5},par:{inst:'marimbaRec',shift:0,target:76,vel:.32},bass:JG_OOM.bass,pulse:{inst:'woodblockRec',variant:'claves',vel:.46,accent:2}},
 // Cèrcol: a calypso on the marimba with the flute, over a tresillo in the bass and the claves; a muted triangle on every turn of the
 // hoop.
 {bpm:108,meter:2,key:60,mode:'ionian',prog:[0,3,4,0,0,3,4,0],tune:'4:.75 4:.75 2:.5|3:.5 5:.5 7:.75 5:.25|6:.75 4:.75 1:.5|2:.5 0:1.5|7:.75 7:.75 9:.5|10:.5 9:.5 7:.75 5:.25|6:.5 8:.5 6:.5 4:.5|7:1.5 r:.5',
  mel:{inst:'marimbaRec',target:76,vel:.6},par:{inst:'fluteRec',shift:7,target:86,vel:.18},bass:{inst:'celliPizzRec',pat:[[0,0],[.75,4],[1.5,0]],center:43,vel:.58},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.26},
  perc:[{inst:'woodblockRec',variant:'claves',pat:[0,.75,1.5],vel:.24}],pulse:{inst:'triangleRec',variant:'muted',vel:.22,accent:2}},
 // Castell de cubs: each block hops on its note of the marimba, the tune climbing from the bottom row to the flag; the cellos underneath.
 {bpm:104,meter:2,key:62,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'0:1 2:1|4:1 5:1|6:1 8:1|9:1 7:1|3:1 5:1|7:1 9:1|8:1 11:1|7:1.5 r:.5',
  mel:{inst:'marimbaRec',target:74,vel:.64,pulse:true},par:{inst:'celliRec',shift:-7,target:52,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0]],center:43,vel:.56},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.28}},
 // Bombolles: a dreamy waltz on the flute over the harp; a bubble leaves the wand on every beat, with a high glockenspiel note.
 {bpm:104,meter:3,key:64,mode:'ionian',prog:[0,5,3,4,0,5,4,0],tune:'4:2 2:1|5:2 4:1|3:1 5:1 7:1|6:3|7:2 9:1|9:1 7:1 5:1|8:2 6:1|7:3',
  mel:{inst:'fluteRec',target:81,vel:.48},par:{inst:'harpRec',shift:-2,target:70,vel:.3},bass:{inst:'celliPizzRec',pat:[[0,0]],center:45,vel:.54},comp:{inst:'harpRec',pat:[1,2],center:62,size:3,vel:.24},
  pulse:{inst:'glockRec',center:88,alt:[0,2,4,2],vel:.2}},
 // Pal saltador: a jumping galop on the trumpet and the clarinet; every landing is a note of the tuba, and a boing starts every phrase.
 {bpm:120,meter:2,key:58,mode:'ionian',prog:[0,0,4,4,3,0,4,0],tune:'0:.5 4:.5 7:.5 4:.5|5:.5 4:.5 2:1|1:.5 4:.5 6:.5 4:.5|6:.5 4:.5 1:1|3:.5 5:.5 10:.5 7:.5|9:.5 7:.5 4:1|8:.5 6:.5 4:.5 1:.5|7:.5 0:.5 7:1',
  mel:{inst:'trumpetRec',target:72,vel:.52},par:{inst:'clarinetRec',shift:-2,target:64,vel:.26},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.56,len:.45},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.3},
  perc:[{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.12},{inst:'toonRec',variant:'boing',pat:[0],every:4,vel:.26}],pulse:{inst:'tubaRec',center:41,vel:.56,bass:true}},
 // Carrusel: a fairground-organ waltz, flute pipes with a glockenspiel over oom-pah-pah; a marimba note on every beat, as the lights
 // go along.
 {bpm:150,meter:3,key:60,mode:'ionian',prog:[0,4,4,0,3,0,4,0],tune:'0:1 4:1 7:1|8:2 6:1|11:2 8:1|7:3|10:2 9:1|7:1 9:1 11:1|8:1 6:1 4:1|7:3',
  mel:{inst:'fluteRec',target:79,vel:.5},par:{inst:'glockRec',shift:7,target:91,vel:.18},...JG_WALTZ,perc:[{inst:'triangleRec',variant:'hit',pat:[0],every:4,vel:.16}],pulse:{inst:'marimbaRec',center:72,alt:[0,2,4],vel:.32}},
 // Ninot que no cau: a wobbly two-four, the tuba with the clarinet high above it; a marimba tick on each side it rocks to.
 {bpm:88,meter:2,key:53,mode:'ionian',prog:[0,4,0,4,3,0,4,0],tune:'4:.5 2:.5 4:.5 2:.5|4:.5 1:.5 4:.5 1:.5|7:.5 4:.5 7:.5 4:.5|8:1 6:1|5:.5 3:.5 5:.5 7:.5|9:.5 7:.5 4:1|6:.5 4:.5 1:.5 -1:.5|0:2',
  mel:{inst:'tubaRec',target:50,vel:.54},par:{inst:'clarinetRec',shift:7,target:74,vel:.26},bass:JG_OOM.bass,comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.26},pulse:{inst:'marimbaRec',center:60,alt:[0,4],vel:.4}},
 // Diàbolo: the flute and the marimba; the tune runs up the scale as the diabolo is thrown (the end of every four bars) and lands with
 // it; the timpani on every catch.
 {bpm:100,meter:2,key:62,mode:'ionian',prog:[0,3,4,0,0,3,4,0],tune:'4:.5 5:.5 4:.5 2:.5|3:.5 5:.5 7:.5 5:.5|4:.5 1:.5 6:.5 4:.5|0:.5 2:.5 4:.25 5:.25 6:.25 7:.25|9:1 7:.5 4:.5|5:.5 7:.5 10:.5 7:.5|8:.5 6:.5 4:.5 1:.5|7:1.5 r:.5',
  mel:{inst:'fluteRec',target:79,vel:.52},par:{inst:'marimbaRec',shift:0,target:76,vel:.3},bass:JG_OOM.bass,comp:{inst:'harpRec',pat:[.5,1.5],center:64,size:3,vel:.24},pulse:{inst:'timpaniRec',center:48,alt:[0,4],vel:.36}},
 // Espantasogres: a party fanfare on the clarinet over the tuba; every two beats the blower toots (a short trumpet note).
 {bpm:112,meter:2,key:53,mode:'ionian',prog:[0,0,4,0,3,0,4,0],tune:'0:.5 0:.25 2:.25 4:.5 7:.5|9:.5 7:.5 4:1|1:.5 1:.25 4:.25 6:.5 8:.5|7:1.5 r:.5|10:.5 9:.5 8:.5 7:.5|9:.5 7:.5 4:.5 2:.5|1:.5 4:.5 6:.5 8:.5|7:1 0:1',
  mel:{inst:'clarinetRec',target:72,vel:.56},bass:{inst:'tubaRec',pat:[[0,0],[1,4]],center:41,vel:.5,len:.45},comp:{inst:'violinsPizzRec',pat:[.5,1.5],center:64,size:3,vel:.3},
  perc:[{inst:'cymbalRec',variant:'soft',pat:[0],every:4,vel:.14},{inst:'snareRec',variant:'hit',pat:[.5,1.5],vel:.12}],pulse:{inst:'trumpetRec',center:72,deg:4,vel:.4}}
]);
// The level of each piece, in dB, so that the twenty sound about equally loud (measured offline as the app plays them, 0.26: from
// −24.2…−27.7 LUFS to about −24.7 in the review copy, like Dibuixos que ballen). Velocity is quadratic, so dB/40 (dibuixos.js).
const JG_LOUD=Object.freeze([0.7,0.5,0.6,-0.5,1.5,0.4,1.5,0.8,0.9,0.2,0.6,1.6,0.3,1.1,2.2,3.0,1.4,1.4,0.9,2.7]);
export const JG_SET=Object.freeze({id:'toys',art:JG_ART,music:JG_MUSIC,loud:JG_LOUD});

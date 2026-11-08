// La nova Pluja de colors (CE45, 0.55) · the ten scenes: each has its seven inks (one for each degree of its scale) and the pale ink of
// the lace of the cells, its instrument (a real one, plucked or struck: every note ends), the instrument of its low notes, its key and
// mode, its pulse, and its melody: ten phrases, one for each press (the last one closes on the keynote). An original melody for each
// scene, written for this activity. A phrase is «b<root>|<beat>:<degree> …»: the low note of the chord's root falls first (beat 0, the
// biggest drop) and the melody follows on the beats given. Degree 0 is the keynote; 7 is the keynote an octave up.
// The colour of a drop is the colour of its degree, so the same note always paints the same colour. The low notes fall as big drops and
// the high ones as small drops (Spence, 2011: pitch matches size; a design choice, not a measured effect for these users).
export const PJ_SCALES=Object.freeze({major:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10],aeolian:[0,2,3,5,7,8,10]});
export const PJ_SCENES=Object.freeze([
 {id:'llum',name:'Primera llum',what:'magenta, taronja, cian i groc, els colors del primer dibuix',inst:'harpRec',bass:'harpRec',key:62,mode:'major',beat:.32,bassOct:-2,
  pal:['#ff1f9e','#8b3dff','#ff7417','#2f5cff','#16dcd6','#36e05c','#ffc414','#f4eefc'],
  phrases:['b0|1:4 1.5:2 2:4 3:7','b5|1:7 1.5:5 2:4 2.5:5 3:2','b3|1:5 2:3 2.5:4 3:5','b4|1:6 1.5:5 2:4 3:1','b0|1:2 1.5:4 2:7 3:9',
   'b4|1:8 2:6 2.5:4 3:1','b5|1:7 1.5:5 2:2 3:4','b3|1:3 1.5:5 2:7 2.5:8 3:7','b4|1:6 1.5:8 2:6 3:4','b0|1:4 1.5:2 2:1 3:0']},
 {id:'mar',name:'Mar endins',what:'blaus i turqueses de mar fonda, amb escuma blanca',inst:'dsMarimba',bass:'celliPizzRec',key:69,mode:'dorian',beat:.22,bassOct:-2,
  pal:['#0fa3b1','#1d4ed8','#2ee6d6','#3d7bff','#7af0c8','#14b87a','#5b3df5','#e8fbff'],
  phrases:['b0|2:0 3:2 5:4 6:7 8:4','b6|3:6 5:8 6:9 9:8','b3|2:5 3:3 5:5 6:7 8:5','b0|3:4 5:2 6:0 9:-1','b3|2:3 4:5 6:7 8:8 9:7',
   'b6|3:8 5:6 6:4 9:6','b0|2:7 3:9 5:7 6:4 8:2','b4|3:4 5:6 6:8 9:6','b6|2:6 4:8 6:6 9:8','b0|2:7 3:4 5:2 8:0']},
 {id:'nit',name:'Jardí de nit',what:'violetes, verds foscos i el groc pàl·lid de la lluna',inst:'kalimbaRec',bass:'celliPizzRec',key:57,mode:'aeolian',beat:.36,bassOct:-2,
  pal:['#7c3aed','#0f9d58','#ffe08a','#2546c9','#c084fc','#34d399','#c026d3','#f5f3ff'],
  phrases:['b0|1:4 2.5:2 3:0','b5|1:5 2:7 3.5:5','b2|1:4 1.5:2 3:4','b6|1:6 2.5:8 3:6','b0|1.5:7 2:9 3.5:7',
   'b6|1:8 1.5:6 3:4','b3|1:3 2.5:5 3:7','b5|1:7 1.5:5 3:2','b4|1:4 2:6 3.5:8','b0|1:7 2:4 3:2 4.5:0']},
 {id:'foc',name:'Foc lent',what:'taronges, ambres, daurats i roses de brasa',inst:'guitarRec',bass:'celliPizzRec',key:64,mode:'dorian',beat:.42,bassOct:-2,
  pal:['#ff6a13','#e0405a','#ffb21a','#a3204a','#ffd34d','#d9692b','#ff8a7a','#fff3e0'],
  phrases:['b0|1:0 1.75:2 2:4 3:2','b3|1:3 1.75:5 2:3 3:2','b6|1:-1 2:1 3:3','b0|1:4 1.75:2 2.5:1 3:0','b3|1.5:5 2:3 3:0',
   'b6|1:1 1.75:3 2:4 3:3','b2|1:2 1.75:4 2.5:2 3:-1','b3|1:3 2:5 3:4','b6|1:3 1.75:1 2.5:-1 3:1','b0|1:4 1.75:2 2:1 3.5:0']},
 {id:'estiu',name:'Pluja d’estiu',what:'verds de fulla, blau de cel i groc de llimona',inst:'glockRec',bass:'marimbaRec',key:84,mode:'major',beat:.22,bassOct:-2,
  pal:['#3ddc4a','#38bdf8','#fde047','#14b8a6','#a3e635','#3b82f6','#fb923c','#f0fdf4'],
  phrases:['b0|1:4 2:4 2.5:2 3:4 4:7','b3|1:5 1.5:5 2:3 3:5 3.5:7','b4|1:6 2:4 2.5:6 3:8 4:6','b0|2:7 2.5:4 3:2 4:0','b3|1:3 1.5:5 2:7 3:5 3.5:3',
   'b4|1:4 2:6 2.5:8 3:6 4:4','b5|1:7 1.5:5 2:2 3:5 3.5:7','b1|2:3 2.5:5 3:8 4:5','b4|1:8 2:6 2.5:4 3:1 4:6','b0|1:4 1.5:2 2:4 3:7']},
 {id:'aurora',name:'Aurora',what:'verds d’aurora, turqueses, violetes i magentes',inst:'dsPiano',bass:'dsPiano',key:65,mode:'lydian',beat:.4,bassOct:-2,
  pal:['#22e88a','#14c8c8','#8b5cf6','#1e40af','#e340c8','#86efac','#4f46e5','#ecfdf5'],
  phrases:['b0|.5:2 1:4 1.5:7 2.5:9','b1|.5:3 1:5 1.5:8 2.5:10','b0|1:9 1.5:7 2:4 3:6','b5|.5:5 1:7 1.5:9 2.5:12','b2|.5:4 1:6 2:9 2.5:8',
   'b1|.5:5 1:8 1.5:10 2.5:8','b4|1:4 1.5:6 2:8 3:11','b5|.5:9 1:7 2:5 2.5:7','b1|.5:5 1:8 1.5:10 2.5:8','b0|.5:4 1:7 1.5:9 3:7']},
 {id:'caramel',name:'Caramel',what:'colors de caramel: rosa, menta, llimona, lila i préssec',inst:'marimbaRec',bass:'dsMarimba',key:67,mode:'major',beat:.26,bassOct:-1,
  pal:['#ff8fc7','#7ff0c4','#fff07a','#c4a7ff','#ffb38a','#8fd3ff','#ff5c8a','#fff7fb'],
  phrases:['b0|1:2 1.5:4 2.5:4 3:7','b3|1:5 2:3 2.5:5 3.5:7','b4|.5:6 1.5:4 2:6 3:8 3.5:6','b0|1:7 1.5:4 2.5:2 3:0','b5|1:5 2:7 2.5:9 3.5:7',
   'b4|.5:8 1.5:6 2:4 3:6 3.5:8','b3|1:3 1.5:5 2.5:7 3:9','b1|1:8 2:5 2.5:3 3.5:1','b4|.5:4 1.5:6 2:8 3:6','b0|1:4 1.5:2 2.5:4 3:7']},
 {id:'tempesta',name:'Tempesta suau',what:'blaus elèctrics, plates i violetes de tempesta, amb un llamp groc pàl·lid',inst:'violinsPizzRec',bass:'celliPizzRec',key:62,mode:'aeolian',beat:.2,bassOct:-2,
  pal:['#3b82f6','#64748b','#cbd5e1','#4338ca','#22d3ee','#6d28d9','#fef08a','#f8fafc'],
  phrases:['b0|2:4 3:4 4:4 6:5 7:4','b5|2:5 3:5 5:7 6:9 8:7','b2|1:4 2:4 3:2 4:4 6:7','b6|2:6 3:6 4:8 6:10 7:8','b3|2:3 3:5 4:7 6:5 7:3',
   'b6|1:8 2:8 3:10 4:8 6:6','b0|2:7 3:7 4:9 6:11 7:9','b5|2:9 3:7 5:5 6:7 8:5','b4|1:4 2:6 3:8 4:6 6:4','b0|2:4 3:2 4:1 6:0']},
 {id:'fruites',name:'Fruites',what:'maduixa, raïm, taronja, nabiu, llimona i kiwi',inst:'dsArpa',bass:'celliPizzRec',key:69,mode:'mixolydian',beat:.28,bassOct:-2,
  pal:['#f43f5e','#7e22ce','#fb8c00','#3949ab','#fde047','#7cb342','#ff7aa8','#fffbea'],
  phrases:['b0|.5:4 1:2 2:4 2.5:7 3.5:4','b6|1:6 1.5:8 2:10 3:8','b3|.5:5 1.5:3 2.5:5 3:7','b0|.5:7 1:6 2:4 2.5:2 3.5:0','b3|1:3 1.5:5 2:7 3:10',
   'b6|.5:8 1.5:6 2.5:10 3:8','b4|.5:4 1:6 2:8 2.5:6 3.5:4','b3|1:5 1.5:7 2:10 3:7','b6|.5:10 1.5:8 2.5:6','b0|.5:4 1:2 2:4 3:7']},
 {id:'estrelles',name:'Pols d’estrelles',what:'or, plata, blau de nit i violeta, amb espurnes blanques',inst:'dsGlock',bass:'harpRec',key:88,mode:'major',beat:.3,bassOct:-3,
  pal:['#ffcc33','#1e3a8a','#e5e7eb','#6d28d9','#fde68a','#60a5fa','#f472b6','#ffffff'],
  phrases:['b0|1:4 1.25:5 1.5:7 3:4','b4|1.5:6 2:8 3.5:11','b5|1:7 2:9 2.25:7 2.5:5 3.5:9','b3|1:5 1.25:7 1.5:10 3:7','b0|1.5:9 2:7 3.5:4',
   'b4|1:6 2:8 2.25:6 2.5:4 3.5:8','b3|1:10 1.25:9 1.5:7 3:5','b1|1.5:3 2:5 3.5:8','b4|1:8 2:6 2.25:8 2.5:11 3.5:6','b0|1:4 1.25:5 1.5:7 3:7']}]);
export const PJ_IDS=Object.freeze(PJ_SCENES.map(x=>x.id));
// a phrase read: [{beat, deg, bass}] (the low note first)
export function pjParse(str){const [b,m]=str.split('|'),out=[{beat:0,deg:+b.slice(1),bass:true}];for(const x of m.trim().split(/\s+/)){const [bt,d]=x.split(':');out.push({beat:+bt,deg:+d,bass:false});}return out;}
// the note of a degree in a scene (MIDI)
export function pjNote(S,deg,oct=0){const sc=PJ_SCALES[S.mode]||PJ_SCALES.major,n=sc.length,o=Math.floor(deg/n);return S.key+sc[((deg%n)+n)%n]+12*(o+oct);}

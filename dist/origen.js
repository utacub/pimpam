// D'on ve aquest so? (EN21), 0.18: a nature sound plays and the board shows two to four landscapes of painted paper; the child finds the
// place the sound comes from. Nine places, each with its own nature sound of the collection (nature/*.mp3, the same as Natura): the brook,
// the beach, the forest in the rain, the meadow at night, the pond, the garden, the summit, under the sea and the cave. While a landscape
// has the focus it sounds briefly. The right one opens to the whole screen and comes alive with its sound and a little piece of plucked
// strings and harp; another one sounds briefly and the model plays again, with no sign of a mistake. Rounds change the model, the other
// landscapes, their order, the time of day and the paper leaf that flies to the focus.
import {SAMPLE_BANK} from './sampler.js';
// family: sounds of the same family are easier to confuse (broad noise of water and air; animals; separate drops and bubbles). The
// distractors of every round come first from other families. level: loudness of each recording against the others. The files are
// already matched (EBU R128, about -32 LUFS each; the frogs -31), so the levels are equal but for the frogs.
export const OG_PLACES=Object.freeze([
 {id:'brook',word:'Rierol',nature:'brook',family:'noise',level:.58},
 {id:'beach',word:'Platja',nature:'waves',family:'noise',level:.58},
 {id:'rain',word:'Bosc',nature:'rain',family:'noise',level:.58},
 {id:'night',word:'Prat',nature:'crickets',family:'animal',level:.58},
 {id:'pond',word:'Estany',nature:'frogs',family:'animal',level:.55},
 {id:'garden',word:'Jardí',nature:'blackbird',family:'animal',level:.58},
 {id:'summit',word:'Cim',nature:'wind',family:'noise',level:.58},
 {id:'sea',word:'Fons',nature:'bubbles',family:'drop',level:.58},
 {id:'cave',word:'Cova',nature:'drips',family:'drop',level:.58}].map(x=>Object.freeze(x)));
const OG_INDEX=Object.fromEntries(OG_PLACES.map((x,i)=>[x.id,i]));
export const ogPlace=id=>OG_PLACES[OG_INDEX[id]??0];
// Twenty rounds: the model and three other landscapes, in the order they join the board (two options: the model and the first; three:
// the first two). The first two always come from other families than the model's.
const OG_ROUNDS=[[1,5,8,3],[4,6,7,0],[0,3,8,5],[5,2,8,6],[7,6,4,1],[2,5,7,3],[3,1,8,0],[6,4,8,5],[8,1,3,6],[1,4,7,5],
 [5,0,7,1],[2,3,7,4],[4,2,8,6],[0,4,8,3],[3,6,7,1],[6,3,7,4],[8,5,1,4],[7,3,2,5],[2,4,7,5],[4,1,7,0]];
export const OG_MOMENTS=Object.freeze(['mati','tarda','vespre']);
// Seconds: the model (the sound alone), the taste in the focus, the result of the right landscape, and the answer to another one.
export const OG_CLUE=4.6,OG_TASTE=1.3,OG_RESULT=9,OG_WRONG=1.6;
// Loudness of the music against the other activities (measured on the review video, EBU R128).
export const OG_LOUD=.95;
const ogR=round=>Math.max(0,round|0);
export function ogRound(round,n=3){const r=ogR(round),row=OG_ROUNDS[r%20],k=Math.max(2,Math.min(4,n|0)),ids=row.slice(0,k).map(i=>OG_PLACES[i].id),turn=(r*2+1)%k;
 return {target:ids[0],options:ids.slice(turn).concat(ids.slice(0,turn)),moment:OG_MOMENTS[(r+Math.floor(r/20))%3],leaf:(r*3+Math.floor(r/20))%4};}
export const ogTarget=round=>OG_PLACES[OG_ROUNDS[ogR(round)%20][0]];
const ogNat=(id,t,len,vel,x={})=>({inst:'natureRec',midi:[60],t,len,vel,variant:ogPlace(id).nature,...x});
// The model: the sound of the place alone, with a short fade at both ends (the sampler fades the nature sounds in and out).
export function ogClue(round){const p=ogTarget(round),r=ogR(round);return {notes:[ogNat(p.id,0,OG_CLUE,Math.min(1,p.level*1.33),{start:(r*3.7)%9})],length:OG_CLUE};}
// The taste of a landscape in the focus (and the answer to another one): its sound, played by the app with a short fade (tasteNature,
// whose level is about that of the tastes of On anem?).
export function ogTaste(id,length=OG_TASTE){const p=ogPlace(id);return {nature:p.nature,length,level:Math.min(1,p.level*1.5)};}
export function ogFit(inst,m){const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;}
const OG_PENTA=[0,2,4,7,9];
const ogDeg=(root,d)=>root+OG_PENTA[((d%5)+5)%5]+12*Math.floor(d/5);
const ogRoot=round=>[62,65,60,67,64][ogR(round)%5];
const ogNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>ogFit(inst,m)),t,len,vel:Math.min(1,vel*OG_LOUD),...x});
// The voice of each place in its piece: the instrument that sings over the harp, its register and its motif (pentatonic degrees, one
// per half beat; null is a rest). Water ripples on the harp, the beach rocks on the marimba, the rain drops on the glockenspiel, the
// meadow chirps on plucked violins, the pond hops on the marimba, the garden sings on the flute, the summit too, but in long notes cut
// short; the sea bubbles up on the glockenspiel, the cave rings on high harp notes.
const OG_VOICE={brook:['harpRec',12,[0,1,2,4,3,2,1,null,2,3,4,6,5,4,2,null]],beach:['marimbaRec',12,[4,null,2,null,0,1,2,null,4,null,5,null,4,2,1,null]],
 rain:['glockRec',24,[4,3,2,null,4,3,2,null,6,5,4,null,3,2,0,null]],night:['violinsPizzRec',12,[0,0,4,null,0,0,5,null,0,0,6,null,5,4,2,null]],
 pond:['marimbaRec',12,[0,null,0,4,null,null,2,null,0,null,0,5,null,null,4,null]],garden:['fluteRec',12,[4,5,4,2,null,null,4,null,5,6,5,4,null,2,null,null]],
 summit:['fluteRec',12,[0,null,2,null,4,null,null,null,5,null,4,null,2,null,null,null]],sea:['glockRec',24,[0,2,4,5,null,null,4,5,6,7,null,null,6,4,2,null]],
 cave:['harpRec',24,[4,null,null,2,null,null,0,null,4,null,null,5,null,null,4,null]]};
// The piece of the right landscape (seconds from the choice): the landscape's own sound all through it, from the opening, and over it,
// after a second, two bars of harp arpeggios and plucked cellos with the voice of the place, and a closing chord of harp and glockenspiel
// that rings out. Every note is plucked or struck except the flute, whose notes are short; it is all over by 6.6 s and the rest is the
// last notes and the sound of the place fading.
export function ogPiece(id,round){const r=ogR(round),root=ogRoot(r),p=ogPlace(id),[inst,reg,motif]=OG_VOICE[id]||OG_VOICE.brook,beat=.62,t0=1.05,out=[];
 out.push(ogNat(id,0,OG_RESULT-.2,Math.min(1,p.level*1.26),{start:(r*5.3)%9}));
 const chords=[0,3,1,0];
 for(let bar=0;bar<2;bar++){const tb=t0+bar*beat*4,ch=chords[(bar+r)%4];out.push(ogNote('celliPizzRec',[ogDeg(root-24,ch)],tb,1,.5),ogNote('celliPizzRec',[ogDeg(root-24,ch+3)],tb+beat*2,1,.42));
  for(let q=0;q<8;q++)out.push(ogNote('harpRec',[ogDeg(root-12,ch+[0,2,3,5,4,3,2,1][q])],tb+q*beat/2,.8,.3+(q%4===0?.06:0)));}
 motif.forEach((d,i)=>{if(d===null)return;const sustain=SAMPLE_BANK[inst]?.sustain,len=sustain?(id==='summit'?.5:.3):.9;out.push(ogNote(inst,[ogDeg(root+reg,d)],t0+i*beat/2,len,id==='rain'||id==='sea'?.42:.5));});
 const end=t0+beat*8+.05;[0,2,3,5].forEach((d,i)=>out.push(ogNote('harpRec',[ogDeg(root-12,d)],end+i*.06,1.8,.46)));out.push(ogNote('glockRec',[ogDeg(root+24,2)],end+.22,1.6,.36));out.push(ogNote('celliPizzRec',[ogDeg(root-24,0)],end,1.2,.5));
 return out.sort((a,b)=>a.t-b.t);}
// As playPatternAudio wants it: fractions of OG_RESULT.
export function ogScore(id,round){return ogPiece(id,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/OG_RESULT,length:n.len/OG_RESULT,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.start!==undefined?{start:n.start}:{})})).filter(e=>e.at<1);}
// For the picture: the times (s) of the notes of the voice, so the landscape answers them (a ripple, a hop, a drop).
export function ogBeats(id,round){const [,,motif]=OG_VOICE[id]||OG_VOICE.brook;return motif.map((d,i)=>d===null?null:1.05+i*.31).filter(x=>x!==null);}

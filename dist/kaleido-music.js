// Music for Caleidoscopi, Vitralls, Natura and Piromusical: each pattern gets a short piece (harmony, bass, arpeggio, melody, counter-melody, percussion and texture)
// on the same step grid as its visual events, so every visual event has its note at the same instant.
// Each collection has its own style. The layers a piece does not name are simply left out, so a new style never changes an older piece.
export const MUSIC_MODES=Object.freeze({ionian:[0,2,4,5,7,9,11],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],dorian:[0,2,3,5,7,9,10],aeolian:[0,2,3,5,7,8,10],harmonic:[0,2,3,5,7,8,11]});
const M_PENTA={ionian:[0,1,2,4,5],lydian:[0,1,2,4,5],mixolydian:[0,1,2,4,5],dorian:[0,2,3,4,6],aeolian:[0,2,3,4,6]};
// Round variation: the same piece a tone higher or a minor third lower, so a pattern keeps its identity but never repeats exactly.
export const MUSIC_TRANSPOSE=Object.freeze([0,2,-3]);
const Mclamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const Mfloor=(a,b)=>Math.floor(a/b);
// Scale degree (0 = tonic, 7 = tonic an octave up) to MIDI. Pentatonic lines index the five-note subset instead.
export function musicNote(key,mode,d,penta=false){if(penta){const s=M_PENTA[mode],o=Mfloor(d,5),i=d-5*o;return musicNote(key,mode,s[i]+7*o);}const s=MUSIC_MODES[mode],o=Mfloor(d,7),i=d-7*o;return key+12*o+s[i];}
const Mfold=(m,range)=>{if(!range)return m;while(m>range[1])m-=12;while(m<range[0])m+=12;return m;};
// The range in which a note can be placed by octaves so that, in every round, it stays within four semitones of a recorded note.
export function musicWindow(zones,margin=4){return [Math.min(...zones)-margin-Math.min(...MUSIC_TRANSPOSE),Math.max(...zones)+margin-Math.max(...MUSIC_TRANSPOSE)];}
// A kit for a recorded orchestration (spec.kit) from a table {built-in instrument: [recording, amp, variant] or null}.
export function musicKit(table){return Object.freeze(Object.fromEntries(Object.entries(table).map(([name,x])=>[name,x&&Object.freeze({inst:x[0],amp:x[1],variant:x[2]})])));}
const Mnear=(m,center)=>{while(m<center-6)m+=12;while(m>center+6)m-=12;return m;};
// Chord on a scale degree: stacked thirds up to the ninth, voiced close to a centre pitch.
function Mchord(key,mode,root,center,size=4){const tones=[];for(let i=0;i<size;i++)tones.push(Mnear(musicNote(key,mode,root+2*i),center));return [...new Set(tones)].sort((a,b)=>a-b);}
// Pentatonic notes from a fifth below the centre to an octave above it.
function Mpenta(key,mode,center){const out=[];for(let d=-10;d<15;d++){const x=musicNote(key,mode,d,true);if(x>=center-7&&x<=center+12)out.push(x);}return out;}
function Mshape(shape,i,n){
 if(shape==='down')return n-1-i%n;
 if(shape==='updown'){const p=2*n-2,j=i%p;return j<n?j:p-j;}
 if(shape==='broken'){const j=i%(2*n-2);return Math.min(n-1,(j>>1)+(j&1)*2);}
 if(shape==='wave')return Math.round((n-1)*(.5+.5*Math.sin(i*Math.PI*2/(2*n-1))));
 if(shape==='random'){const v=Math.sin(i*12.9898+n*78.233)*43758.5453;return Math.floor((v-Math.floor(v))*n);}
 return i%n;
}
// spec: the pattern's piece. frame: {D, L, n (grid steps), m (repeat factor), step (s), time(i), hits:[{step,time}], seed}.
export function composeKaleido(spec,frame){
 const {D,L,n,m,step}=frame,T=frame.time,seed=frame.seed||0,key=spec.key,shift=MUSIC_TRANSPOSE[seed%3],mode=spec.mode,deg=(d,penta)=>musicNote(key,mode,d,penta);
 const out=[],add=(time,length,inst,midi,opts={})=>{if(time>=D-.02)return;const len=Math.min(length,D-time);if(len<=.01)return;out.push({time,length:len,inst,midi:midi.slice(),...opts});};
 // Explicit chord changes follow the visual events (scaled with the grid); otherwise the progression repeats on longer effects.
 const prog=spec.prog||[0],chords=[];
 if(spec.changes)spec.changes.forEach((c,i)=>chords.push({deg:prog[i],start:c*m}));
 else for(let r=0;r<m;r++)prog.forEach((d,i)=>chords.push({deg:d,start:r*n/m+Math.round(i*n/m/prog.length)}));
 chords.forEach((ch,i)=>{ch.t0=i===0?0:T(ch.start);ch.t1=i+1<chords.length?T(chords[i+1].start):L.settleAt;});
 const settle={deg:spec.settle??0,t0:L.settleAt,t1:D},all=[...chords,settle];
 const chordAt=t=>all.find(c=>t>=c.t0-1e-9&&t<c.t1)||settle;
 const progress=t=>Mclamp((t-L.appear)/(L.settleAt-L.appear),0,1);
 // Onset: the press is answered at once by a struck chord over a soft low thump.
 const on=spec.onset||{};
 add(0,1.6,on.inst||'harp',Mchord(key,mode,chords[0].deg,on.center||74,on.size||4),{vel:on.vel??.7,strum:on.strum??.035,spread:.5});
 // The low note is a soft thump, or a recorded instrument (on.low) an octave or two higher.
 if(on.thump!==false)add(0,on.low?1.2:.5,on.low||'thump',[Mfold(deg(-14)+12*(on.lowOct||0),on.lowFold)],{vel:on.lowVel??.55});
 // Pad (or choir): one sustained chord per harmony span, slightly overlapped so chords melt into each other.
 // A tail (s) lets the last chord go soon after the settle, under the closing chord, instead of holding it to the end.
 if(spec.pad){const p=spec.pad;all.forEach((c,i)=>{const open=p.open?[300+2200*progress(c.t0),400+3800*progress(c.t1)]:p.cut,last=i===all.length-1;add(c.t0,last&&p.tail?Math.min(p.tail,c.t1-c.t0):c.t1-c.t0+(last?0:.3),p.inst,Mchord(key,mode,c.deg,p.center||62,4),{vel:p.vel??.55,spread:.6,vowel:p.vowel,cut:open});});}
 // Bass: rhythm in steps from the start of each chord; the last note of the piece holds through the dissolve (or lasts endLen s).
 if(spec.bass){const b=spec.bass,rh=b.rhythm||[0],notes=b.notes||[0];chords.forEach((c,i)=>{const span=(i+1<chords.length?chords[i+1].start:n)-c.start;const hits=rh.filter(x=>x<span);hits.forEach((x,j)=>{const t=i===0&&x===0?0:T(c.start+x),next=j+1<hits.length?T(c.start+hits[j+1]):c.t1;add(t,Math.max(.12,next-t-.04),b.inst||'bass',[deg(c.deg+notes[j%notes.length]-14)+12*(b.oct||0)],{vel:b.vel??.6,pan:-.1});});});
  add(settle.t0,b.endLen?Math.min(b.endLen,D-settle.t0):D-settle.t0,b.end||(b.inst==='bass'?'sub':(b.inst||'sub')),[deg(settle.deg-14)+12*(b.oct||0)],{vel:(b.vel??.6)*.9});}
 // Arpeggio on the grid, louder on each step, thinning out and fading during the settle.
 if(spec.arp){const a=spec.arp,per=a.per||2,dt=step/per,start=T((a.from||0)*m),end=L.fadeAt-.1;let i=0;
  for(let t=start;t<end;t+=dt,i++){const c=chordAt(t),inSettle=t>=L.settleAt;if(inSettle&&i%2)continue;const size=a.size||4,center=(a.center||72)+(a.climb||0)*progress(t);
   const tones=a.penta?Mpenta(key,mode,center):(base=>base.concat(base.map(x=>x+12)).slice(0,a.range||size+2))(Mchord(key,mode,c.deg,center,size));
   if(a.mask&&a.mask[i%a.mask.length]==='.')continue;
   const idx=Mshape(a.shape||'up',i,tones.length),fade=inSettle?1-Mclamp((t-L.settleAt)/(L.fadeAt-L.settleAt),0,1):.65+.35*progress(t);
   add(t,dt*(a.hold||1.6),a.inst,[tones[idx]],{vel:(a.vel??.4)*(i%per===0?1:.72)*fade,pan:Math.sin(i*.7)*(a.pan??.55)});}}
 // Melody on the visual events: one note (or a small chord) exactly where the pattern changes.
 if(spec.lead){const l=spec.lead,line=l.line||frame.hits.map((_,i)=>i);frame.hits.forEach((h,i)=>{if(l.until!==undefined&&i>=l.until)return;const alt=l.alt&&i>=l.alt.from?l.alt:null,d=line[i%line.length],top=deg(d,l.penta)+12*((alt?.oct??l.oct)||0),c=chordAt(h.time);
  let midi=[top];if(l.harm&&(l.harmFrom===undefined||i>=l.harmFrom))midi=[Mnear(deg(d-2,l.penta),top-4),top];if(l.cluster)midi=Array.from({length:l.cluster},(_,j)=>deg(d+j,true)+12*(l.oct||0));if(l.chord)midi=Mchord(key,mode,c.deg,top,l.chord);if(l.beat)midi=midi.flatMap(x=>[x,x+l.beat]);
  add(h.time,step*(l.len||3),alt?.inst||l.inst,midi,{vel:l.vel??.75,strum:l.strum||0,pan:l.pan?(i%2?l.pan:-l.pan):0,spread:midi.length>1?.4:0});});}
 // Phrases: short melodies that start on a visual event (canons, cascades).
 for(const p of spec.phrases||[]){const h=frame.hits[p.at];if(!h)continue;p.line.forEach((d,j)=>{const t=h.time+j*step*(p.every||1);if(t<D-.3)add(t,step*(p.len||2),p.inst,[deg(d,p.penta)+12*(p.oct||0)],{vel:(p.vel??.6)*(1-.25*j/p.line.length),pan:p.pan||0});});}
 // Drone (bourdon): open fifths held under the whole piece, as in early dance music. A bowed bourdon (every: beats) is bowed again
 // on each bar instead of held, as a player would (in two or more strokes where a bar is longer than maxBow s), and can stop at the
 // settle (stop) and leave a plucked note there (end).
 if(spec.drone){const d=spec.drone,t=T((d.from||0)*m),notes=d.notes.map(x=>deg(x)+12*(d.oct??-1)),stop=d.stop?L.settleAt:D;
  if(d.every){let bar=d.every*m*step;if(d.maxBow)bar/=Math.ceil(bar/d.maxBow-1e-9);for(let s=t;s<stop-.1;s+=bar){const last=s+bar*1.5>stop;add(s,last?stop-s:bar*.96,d.inst||'organ',notes,{vel:d.vel??.4,spread:.3});if(last)break;}}
  else add(t,stop-t,d.inst||'organ',notes,{vel:d.vel??.4,spread:.3});
  if(d.end)add(settle.t0,d.endLen||1.5,d.end,notes.slice(0,1),{vel:d.endVel??.6,pan:-.1});}
 // Melody from the collection's motifs: each phrase names a motif and how it is varied (moved up or down the scale, inverted, played
 // backwards, twice as slow or twice as fast). Pieces that share motifs sound like one family of melodies.
 if(spec.melody){const me=spec.melody,motifs=spec.motifs||{};let s=(me.from||0)*m;const notes=[];
  for(const [name,shift=0,flags=''] of me.phrases){const mot=motifs[name];if(!mot)continue;let ds=mot.n.slice(),rs=mot.r.slice();
   if(flags.includes('i'))ds=ds.map(x=>2*ds[0]-x);if(flags.includes('r')){ds.reverse();rs.reverse();}const k=flags.includes('a')?2:flags.includes('h')?.5:1;
   ds.forEach((d,j)=>{notes.push({s,d:d+shift,len:rs[j]*k});s+=rs[j]*k*m;});s+=(mot.rest||0)*k*m;}
  notes.forEach((x,j)=>{const t=T(x.s);if(t>=L.fadeAt-.1)return;const len=Math.min(x.len*m*step*.94,D-t),top=deg(x.d)+12*(me.oct||0);
   add(t,len,me.inst,[top],{vel:(me.vel??.6)*(j===0||Number.isInteger(x.s/((spec.meter||4)*m))?1:.82),pan:me.pan||0,glide:me.glide&&notes[j+1]&&x.len>=2?deg(notes[j+1].d)+12*(me.oct||0):undefined});
   // A quick upper neighbour before the long notes, the usual ornament of the style.
   if(me.grace&&x.len>=2&&t>.1)add(t-Math.min(.07,step*.25),.08,me.inst,[deg(x.d+1)+12*(me.oct||0)],{vel:(me.vel??.6)*.5,pan:me.pan||0});
   // A second voice in parallel (a fifth below, a third above...), from a given note onwards.
   if(me.par&&j>=(me.par.from||0))add(t,len,me.par.inst||me.inst,[deg(x.d+me.par.shift)+12*(me.par.oct??me.oct??0)],{vel:me.par.vel??.4,pan:-(me.pan||0)||-.25});});}
 // Counter-melody: long notes, optionally gliding to the next one; with a tail (s), it lets go that long after the settle.
 if(spec.counter){const k=spec.counter,endBy=k.tail?L.settleAt+k.tail:D;let s=(k.from||0)*m;k.notes.forEach(([d,len],j)=>{const t=T(s),nextD=k.notes[j+1]?.[0];if(t<Math.min(L.fadeAt,endBy-.1))add(t,Math.min(step*len*m+.15,endBy-t),k.inst,[deg(d)+12*(k.oct||0)],{vel:k.vel??.45,glide:k.glide&&nextD!==undefined?deg(nextD)+12*(k.oct||0):undefined,vowel:k.vowel,pan:k.pan??.25});s+=len*m;});}
 // Percussion: offbeat shaker, ticks and soft kicks on chord changes, only during the evolution.
 if(spec.perc){const q=spec.perc,from=(q.from||0)*m;for(let s=from;s<n;s++){const t=T(s);if(q.shaker)add(t+step/2,.12,'shaker',[90],{vel:q.shaker*(s%2?.7:1),pan:.35});if(q.tick&&q.tick[s%q.tick.length]==='x')add(t,.1,'tick',[deg(14)],{vel:.5,pan:-.3});
   // Dance percussion, one character per beat of the melody: a capital letter is the accented beat.
   if(s%m===0)for(const [inst,pat,pan] of [['tabor',q.tabor,-.15],['jingle',q.jingle,.4]]){const ch=pat?.[(s/m)%pat.length];if(ch==='x'||ch==='X')add(t,.3,inst,[deg(-7)],{vel:(ch==='X'?1:.62)*(q.level??.8),pan});}}
  if(q.thump)chords.forEach((c,i)=>{if(i>0)add(T(c.start),.4,'thump',[deg(-14)],{vel:.45});});}
 // Light percussion of recorded instruments (claves, triangle): one character per beat, a capital letter for the accented beat.
 for(const b of spec.beats||[]){const from=(b.from||0)*m;for(let s=from;s<n;s+=m){const ch=b.pat[Mfloor(s-from,m)%b.pat.length];if(ch==='x'||ch==='X')add(T(s),b.len||.4,b.inst,[deg(b.deg||0)+12*(b.oct||0)],{vel:(ch==='X'?1:.7)*(b.vel??.5),pan:b.pan||0,variant:b.variant});}}
 // Nature sounds: recorded ambiences under the whole piece, each played by two voices from different points of the loop, panned apart.
 for(const a of spec.nature||[])for(const [side,start] of [[-1,0],[1,a.half??4.3]])add(0,D,a.inst||'natureRec',[60],{vel:a.vel??.5,pan:side*(a.width??.55),variant:a.sound,start:start+(seed%3)*1.7});
 // Imitations of nature on acoustic instruments, for the sounds no recording supplies: drops of rain or water (scattered high notes),
 // waves (harp runs that rise and break), birdcalls (quick calls high up), bubbles (quick rising runs), crickets (a muted triangle in
 // threes) and frogs (claves in pairs). The notes come from the chord of the moment (or the pentatonic scale) inside a given range;
 // times, notes and places come from a fixed hash, so a piece always sounds the same.
 for(const [k,a] of (spec.mimic||[]).entries()){const salt=k+1+(a.salt||0),h=(j,x)=>{const v=Math.sin(j*127.1+salt*311.7+x*74.7)*43758.5453;return v-Math.floor(v);};
  const [lo,hi]=a.range||[72,88],vel=a.vel??.25,w=a.width??.75,every=a.every||1.5,end=L.fadeAt-.25;
  const pool=t=>{const c=chordAt(t),out=[];for(let d=-21;d<35;d++){const x=deg(d,a.penta);if(x>=lo&&x<=hi&&(a.penta||[0,2,4].includes(((d-c.deg)%7+7)%7)))out.push(x);}return [...new Set(out)].sort((p,q)=>p-q);};
  for(let j=0,t=Math.max(L.appear,T((a.from||0)*m))+every*h(0,1);t<end;j++,t+=every*(.55+.9*h(j,2))){const pan=(2*h(j,3)-1)*w,notes=pool(t),pick=x=>notes[Math.floor(h(j,x)*notes.length)];
   if(!notes.length&&!['crickets','frogs'].includes(a.kind))continue;
   if(a.kind==='drops')add(t,.5,a.inst||'marimbaRec',[pick(4)],{vel:vel*(.55+.45*h(j,5)),pan,rev:a.rev});
   else if(a.kind==='waves'){const up=Math.min(a.count||8,notes.length),dt=a.speed||.07;
    for(let i=0;i<up;i++)add(t+i*dt,.3,a.inst||'harpRec',[notes[i]],{vel:vel*(.5+.5*i/Math.max(1,up-1)),pan:-w+2*w*i/Math.max(1,up-1)});
    for(let i=1;i<=Math.min(4,up-1);i++)add(t+(up-1+i)*dt*1.3,.3,a.inst||'harpRec',[notes[up-1-i]],{vel:vel*(.6-.08*i),pan:w-.2*i});}
   else if(a.kind==='calls'){const i=Math.min(notes.length-2,Math.floor(h(j,4)*(notes.length-1))),pair=i<0?[notes[0],notes[0]]:h(j,6)<.5?[notes[i],notes[i+1]]:[notes[i+1],notes[i]],count=(a.count||3)+Math.floor(h(j,7)*2);
    for(let q=0;q<count;q++)add(t+q*(a.speed||.075),.07,a.inst||'fluteRec',[pair[q%2]],{vel:vel*(q===count-1?.7:1),pan});}
   else if(a.kind==='bubbles'){const count=Math.min(a.count||4,notes.length),i0=Math.floor(h(j,4)*(notes.length-count+1));
    for(let q=0;q<count;q++)add(t+q*(a.speed||.04),.25,a.inst||'marimbaRec',[notes[i0+q]],{vel:vel*(.7+.3*q/count),pan});}
   else if(a.kind==='crickets')for(let q=0;q<(a.count||3);q++)add(t+q*(a.speed||.07),.15,a.inst||'triangleRec',[60],{vel:vel*(q?.8:1),pan,variant:a.variant||'muted'});
   else if(a.kind==='frogs')for(let q=0;q<(a.count||2);q++)add(t+q*(a.speed||.13),.2,a.inst||'woodblockRec',[60],{vel:vel*(q?.75:1),pan,variant:a.variant||'claves'});}}
 // Accompaniment chords on a beat pattern (one character per beat, a capital letter for the accented beat): the "pah" of a band's
 // oom-pah, played by the horns on the chord of the moment, only during the evolution.
 if(spec.comp){const k=spec.comp,from=(k.from||0)*m;for(let s=from;s<n;s+=m){const ch=k.pat[Mfloor(s-from,m)%k.pat.length];if(ch!=='x'&&ch!=='X')continue;const t=T(s);
  add(t,step*m*(k.len||.55),k.inst,Mchord(key,mode,chordAt(t).deg,k.center||58,k.size||3),{vel:(ch==='X'?1:.8)*(k.vel??.35),pan:k.pan??.2,spread:.35});}}
 // Accents at given instants (the timpani under each firework): the root of the chord of the moment, in the octave that brings it
 // inside a given range (fold), as a timpanist retunes the drums; the range is chosen so that every round stays inside it.
 for(const a of spec.accents||[]){const c=chordAt(a.time);add(a.time,a.len||1.2,a.inst,[Mfold(deg(c.deg-14)+12*(a.oct||0),a.fold)],{vel:a.vel??.5,pan:a.pan||0,variant:a.variant});}
 // Sound effects at given instants (soft bursts, crackles, the whoosh of a rocket): unpitched recordings, in a variant.
 for(const f of spec.fx||[])add(f.time,f.len||1,f.inst,[60],{vel:f.vel??.4,pan:f.pan||0,variant:f.variant});
 // Breath: a soft noise swell into each visual event (inhale before the pulse).
 if(spec.breath)frame.hits.forEach(h=>{const s=Math.max(0,h.time-step*1.5);if(h.time-s>.15)add(s,h.time-s,'swell',[60],{vel:.5});});
 if(spec.swell){const s=Math.max(L.appear,L.settleAt-step*3);add(s,L.settleAt-s,'swell',[60],{vel:.6});}
 // Settle: the resolving chord, held light above it, and a last sparkle as the pattern dissolves.
 const fin=spec.final||{};add(settle.t0,Math.min(3,D-settle.t0),fin.inst||'bell',Mchord(key,mode,settle.deg,fin.center||79,fin.size||4),{vel:fin.vel??.6,strum:fin.strum??.06,spread:.6});
 if(spec.shimmer)add(settle.t0,D-settle.t0,'shimmer',Mchord(key,mode,settle.deg,86,3),{vel:.6});
 add(L.fadeAt,Math.min(1.2,D-L.fadeAt),spec.sparkle||'celesta',[deg(spec.sparkleDeg??14)+12],{vel:.35,pan:.3});
 // Recorded orchestration (spec.kit): a piece written for the built-in instruments is played by recordings. Each built-in instrument
 // names its recording, at the level that matches it (amp: the built-in level over the recorded one, as the recordings' velocity is
 // quadratic), and an instrument set to null is left out. The notes of each built-in instrument move together by the octaves that
 // put most of them in the range of their recording (spec.fold), and the few left outside are folded in one by one. All this is done
 // on the notes before the round's transposition, so every round is still exactly the same piece in another key.
 const kit=spec.kit,fold=spec.fold||{},played=!kit?out:out.filter(e=>kit[e.inst]!==null).map(e=>{const k=kit[e.inst];return k?{...e,inst:k.inst,source:e.inst,vel:Math.min(1,Math.sqrt(e.vel*(k.amp??1))),...(k.variant?{variant:k.variant}:{})}:e;});
 const octave={};if(kit)for(const e of played){const w=fold[e.inst];if(!w||!e.source||e.source in octave)continue;const notes=played.filter(x=>x.source===e.source).flatMap(x=>x.midi);let best=0,most=-1;
  for(const o of [0,1,-1,2,-2]){const inside=notes.filter(x=>x+12*o>=w[0]&&x+12*o<=w[1]).length;if(inside>most){best=o;most=inside;}}octave[e.source]=best;}
 if(kit)for(const e of played){const w=fold[e.inst];if(w){const o=12*(octave[e.source]||0),first=Mfold(e.midi[0]+o,w);if(e.glide!==undefined)e.glide+=first-e.midi[0];e.midi=[...new Set(e.midi.map(x=>Mfold(x+o,w)))].sort((a,b)=>a-b);}delete e.source;}
 // The round's transposition moves the whole piece, voicings included, so it stays exactly the same piece in another key.
 return played.sort((a,b)=>a.time-b.time).map(({time,length,...e})=>({at:time/D,length:length/D,...e,midi:e.midi.map(x=>x+shift),glide:e.glide===undefined?undefined:e.glide+shift}));
}

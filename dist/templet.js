// Detectius de sons (EN11). 0.16: a bandstand with eight recorded instruments; a short phrase (the clue) is played by one of them and
// the child finds which one among two, three or four on the stage. 0.48 (Marc, 6 November 2026): twenty real instruments in five
// families, recorded note by note (VSCO-2 CE, CC0; the guitar of Pinta el món), each with its own idiomatic clues: a glissando on the
// harp, chords on the piano and the guitar, long singing notes on the horn and the cello, a roll on the tambourine, one long stroke on
// the gong. The adult chooses how many instruments can appear (8, 14 or 20) and whether the others on the stage may be of the same
// family. While an instrument has the focus it plays a short taste of its own sound. The right one plays a little piece with soft
// accompaniment, ending on plucked and struck notes that decay by themselves; another one plays its taste and then the clue sounds
// again, with no penalty. Every instrument is the target once before any is the target again.
import {SAMPLE_BANK} from './sampler.js';
// level: the smallest pool that has it (8: the instruments of 0.16, 14, 20). reg: the register of degree 0 above the root of the round.
// kind: melody (sustained), harp, pluck, keys, chord (piano, guitar), or the unpitched timbal, pandereta, triangle and gong.
const tmI=(id,label,word,family,level,inst,kind,reg=0)=>Object.freeze({id,label,word,family,level,inst,kind,reg});
export const TM_INSTRUMENTS=Object.freeze([
 tmI('violi','El violí','Violí','corda',8,'dsVioli','melody',12),
 tmI('arpa','L’arpa','Arpa','corda',8,'dsArpa','harp',0),
 tmI('flauta','La flauta','Flauta','fusta',8,'dsFlauta','melody',12),
 tmI('trompeta','La trompeta','Trompeta','metall',8,'dsTrompeta','melody',0),
 tmI('marimba','La marimba','Marimba','laminat',8,'dsMarimba','keys',12),
 tmI('glock','El glockenspiel','Glockenspiel','laminat',8,'dsGlock','keys',24),
 tmI('timbal','El timbal','Timbal','percussio',8,'dsTimbal','timbal'),
 tmI('triangle','El triangle','Triangle','percussio',8,'dsTriangle','triangle'),
 tmI('piano','El piano','Piano','laminat',14,'dsPiano','chord',0),
 tmI('guitarra','La guitarra','Guitarra','corda',14,'guitarRec','chord',0),
 tmI('violoncel','El violoncel','Violoncel','corda',14,'dsCello','melody',-12),
 tmI('clarinet','El clarinet','Clarinet','fusta',14,'dsClarinet','melody',0),
 tmI('trombo','El trombó','Trombó','metall',14,'dsTrombo','melody',-12),
 tmI('pandereta','La pandereta','Pandereta','percussio',14,'dsPandereta','pandereta'),
 tmI('contrabaix','El contrabaix','Contrabaix','corda',20,'dsBaix','pluck',-24),
 tmI('oboe','L’oboè','Oboè','fusta',20,'dsOboe','melody',12),
 tmI('fagot','El fagot','Fagot','fusta',20,'dsFagot','melody',-12),
 tmI('trompa','La trompa','Trompa','metall',20,'dsTrompa','melody',-12),
 tmI('tuba','La tuba','Tuba','metall',20,'dsTuba','melody',-24),
 tmI('gong','El gong','Gong','percussio',20,'dsGong','gong')]);
export const TM_FAMILIES=Object.freeze(['corda','fusta','metall','laminat','percussio']);
export const TM_POOLS=Object.freeze([8,14,20]);
export const TM_TIMES=Object.freeze(['tarda','mati','nit']);
// Seconds of the result for the right instrument (the piece and its last notes ringing out) and for another one (its taste).
export const TM_PIECE=8.5,TM_WRONG=1.6;
// Loudness of the music against the other activities (measured offline, EBU R128; tools/detectius-audio.mjs).
export const TM_LOUD=.82;
// Level of each instrument (the recordings all share one momentary loudness; these even out how present each one sounds in a phrase).
const TM_VEL={violi:.6,arpa:.45,flauta:.63,trompeta:.56,marimba:.56,glock:.54,timbal:.55,triangle:.51,piano:.47,guitarra:.48,violoncel:.59,clarinet:.65,trombo:.58,pandereta:.53,contrabaix:.58,oboe:.59,fagot:.59,trompa:.57,tuba:.59,gong:.44};
const TM_LONGS=['violoncel','fagot','trompa','tuba','trombo'];
export const tmInstrument=id=>TM_INSTRUMENTS.find(x=>x.id===id)||TM_INSTRUMENTS[0];
// The pool of the setting dsPool ('8', '14' or '20'; 20 by default).
export function tmPool(s){const n=+(s?.dsPool||20);return TM_INSTRUMENTS.filter(x=>x.level<=(TM_POOLS.includes(n)?n:20));}
// The order of the targets: a fixed shuffle of the pool in which two targets in a row are never of the same family, so every
// instrument is the target once before any is the target again.
const TM_ORDERS=new Map();
function tmOrder(pool){const key=pool.map(x=>x.id).join();if(TM_ORDERS.has(key))return TM_ORDERS.get(key);
 let seed=pool.length*977+13;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647,left=[...pool],out=[];
 while(left.length){const prev=out[out.length-1],ok=left.filter(x=>!prev||x.family!==prev.family),list=ok.length?ok:left,pick=list[Math.floor(rnd()*list.length)];out.push(pick);left.splice(left.indexOf(pick),1);}
 TM_ORDERS.set(key,out);return out;}
export function tmTarget(round,s){const order=tmOrder(tmPool(s));return order[Math.max(0,round|0)%order.length];}
// The instruments on the stage: the target and n-1 others. By default (dsFamily 'altres') the others are of other families, and of
// different families from each other while there are enough; with 'barreja' the same family comes first (a harder listening).
// Their places change from round to round; the order on the stage is the order of the scan, from left to right.
export function tmStage(round,n,s){const r=Math.max(0,round|0),target=tmTarget(r,s),pool=tmPool(s),same=s?.dsFamily==='barreja',k=Math.max(1,Math.min(4,n|0||3))-1;
 const rest=pool.filter(x=>x!==target),rot=(r*5+3)%Math.max(1,rest.length),ring=rest.slice(rot).concat(rest.slice(0,rot)),others=[];
 const take=list=>{for(const x of list){if(others.length>=k)return;if(!others.includes(x)&&(same||!others.some(o=>o.family===x.family)))others.push(x);}};
 if(same)take(ring.filter(x=>x.family===target.family));take(ring.filter(x=>x.family!==target.family));
 for(const x of ring){if(others.length>=k)break;if(!others.includes(x)&&(same||x.family!==target.family))others.push(x);}
 const opts=[...others],at=(r*3+1)%(others.length+1);opts.splice(at,0,target);return opts;}
export const tmTime=round=>TM_TIMES[Math.max(0,round|0)%3];
export function tmFit(inst,m){const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-3,hi=Math.max(...ns)+3;while(m>hi)m-=12;while(m<lo)m+=12;return m;}
const TM_SCALE=[0,2,4,5,7,9,11];
const tmDeg=(root,d)=>root+TM_SCALE[((d%7)+7)%7]+12*Math.floor(d/7);
const tmRoot=round=>[60,62,65,67,64][Math.max(0,round|0)%5];
// Five clue phrases for the melodic instruments: [time (s), degree, length (s)].
const TM_PHRASES=[[[0,0,.3],[.25,2,.3],[.5,4,.3],[.75,7,.6]],[[0,4,.3],[.3,3,.3],[.6,2,.3],[.9,0,.6]],[[0,0,.2],[.2,0,.2],[.4,4,.4],[.8,2,.2],[1,4,.5]],[[0,2,.3],[.3,4,.3],[.6,2,.3],[.9,5,.3],[1.2,4,.5]],[[0,7,.25],[.25,4,.25],[.5,2,.25],[.75,4,.25],[1,0,.6]]];
// Long, singing phrases for the low winds and strings and the horn (fewer, longer notes).
const TM_LONG=[[[0,0,.55],[.55,4,.55],[1.1,2,.8]],[[0,4,.5],[.5,2,.5],[1,0,.9]],[[0,0,.4],[.4,2,.4],[.8,4,.9]],[[0,2,.5],[.5,4,.5],[1,5,.35],[1.35,4,.6]],[[0,7,.45],[.45,4,.45],[.9,0,.9]]];
const TM_TIMPANI=[[[0,0],[.4,7],[.8,0]],[[0,7],[.2,7],[.4,7],[.6,0],[.9,0]],[[0,0],[.3,5],[.6,7],[.9,12]],[[0,0,.55],[.08,0,.62],[.16,0,.7],[.24,0,.78],[.32,0,.86],[.4,0,.94],[.8,7]],[[0,12],[.3,7],[.6,5],[.9,0]]];
const TM_TRIANGLE=[[[0,'gran'],[.5,'gran'],[1,'gran']],[[0,'petit'],[.25,'petit'],[.5,'petit'],[.75,'gran']],[[0,'gran'],[.4,'petit'],[.6,'petit'],[.9,'gran']],[[0,'petit'],[.15,'petit'],[.3,'petit'],[.45,'petit'],[.8,'gran']],[[0,'gran'],[.3,'gran'],[1,'gran']]];
const TM_TAMB=[[[0,'hit'],[.3,'hit'],[.6,'shake'],[1,'hit']],[[0,'roll',.9],[1,'hit']],[[0,'shake'],[.25,'shake'],[.5,'hit'],[.9,'hit']],[[0,'hit'],[.2,'hit'],[.4,'hit'],[.7,'roll',.6]],[[0,'roll',.6],[.7,'hit'],[1,'shake']]];
const TM_GONG=[[[0,'mf']],[[0,'p'],[1,'mf']],[[0,'f']],[[0,'p'],[.6,'p']],[[0,'mf']]];
const tmNote=(inst,midi,t,len,vel,extra={})=>({inst,midi:[].concat(midi).map(m=>tmFit(inst,m)),t,len,vel:Math.min(1,vel*TM_LOUD),...extra});
const tmTimp=round=>[43,45,41,43,48][Math.max(0,round|0)%5];
const tmTriad=(root,d)=>[tmDeg(root,d),tmDeg(root,d+2),tmDeg(root,d+4)];
// The chord under a melody note: the tonic for degrees 0, 2 and 4 (and their octaves), the dominant for the others.
const tmChordOf=d=>[0,2,4].includes(((d%7)+7)%7)?0:4;
// The notes of a phrase of one instrument, in seconds from its start.
function tmPhraseNotes(id,round,k,at=0,scale=1){const I=tmInstrument(id),inst=I.inst,root=tmRoot(round),out=[],v=TM_VEL[id]||.6,kk=((k%5)+5)%5;
 if(I.kind==='timbal'){const r=tmTimp(round);for(const [t,d,vv] of TM_TIMPANI[kk])out.push(tmNote(inst,[r+d],at+t*scale,.9,v*(vv??1)));return out;}
 if(I.kind==='triangle'){for(const [t,variant] of TM_TRIANGLE[kk])out.push(tmNote(inst,[0],at+t*scale,variant==='gran'?1.4:.6,variant==='gran'?v:v*.85,{variant}));return out;}
 if(I.kind==='pandereta'){for(const [t,variant,len] of TM_TAMB[kk])out.push(tmNote(inst,[0],at+t*scale,len||.5,variant==='shake'?v*.85:v,{variant}));return out;}
 if(I.kind==='gong'){for(const [t,variant] of TM_GONG[kk])out.push(tmNote(inst,[0],at+t*scale,2.4,v,{variant}));return out;}
 const base=root+I.reg,long=TM_LONGS.includes(id),phr=(long?TM_LONG:TM_PHRASES)[kk];
 if(I.kind==='harp'){// each note with its lower octave, and a glissando up to the last one
  phr.forEach(([t,d],i)=>{if(i===phr.length-1){for(let g=0;g<6;g++)out.push(tmNote(inst,[tmDeg(base,d-6+g)],at+(t-.18+g*.03)*scale,1.2,v*(.6+g*.07)));}else out.push(tmNote(inst,[tmDeg(base,d),tmDeg(base-12,d)],at+t*scale,1.1,v,{strum:.025}));});return out;}
 if(I.kind==='chord'){// the melody on top, with the chord under the first and the last notes (piano: the left hand; guitar: a strum)
  phr.forEach(([t,d,len],i)=>{const m=tmDeg(base,d),strong=i===0||i===phr.length-1,under=tmTriad(base-12,tmChordOf(d));out.push(tmNote(inst,strong?[m,...(id==='guitarra'?under:under.slice(0,2))]:[m],at+t*scale,Math.max(.5,len*1.6),v,strong&&id==='guitarra'?{strum:.04}:{}));});return out;}
 if(I.kind==='pluck'){phr.forEach(([t,d])=>out.push(tmNote(inst,[tmDeg(base,d)],at+t*scale*1.1,.7,v)));return out;}
 const cap={trompeta:.38,flauta:.55,violi:.6,oboe:.5,clarinet:.55}[id]||9,slow=long?1.1:1;
 for(const [t,d,len] of phr)out.push(tmNote(inst,[tmDeg(base,d)],at+t*scale*slow,Math.min(cap,len*scale*slow),v));
 return out;}
// The clue of a round (seconds from its start) and how long it lasts.
export function tmClue(round,s){const target=tmTarget(round,s),notes=tmPhraseNotes(target.id,round,(Math.max(0,round|0)*2)%5);return {notes,length:Math.max(...notes.map(e=>e.t+e.len))};}
// The taste of an instrument while it has the focus (at most 1.2 s): a few notes in its own register.
export function tmTaste(id,round=0){const I=tmInstrument(id),inst=I.inst,root=tmRoot(round),v=(TM_VEL[id]||.6)*.9,base=root+I.reg;
 if(I.kind==='timbal'){const r=tmTimp(round);return [tmNote(inst,[r],0,.8,v),tmNote(inst,[r+7],.28,.8,v*.9)];}
 if(I.kind==='triangle')return [tmNote(inst,[0],0,1,v,{variant:'gran'})];
 if(I.kind==='pandereta')return [tmNote(inst,[0],0,.5,v,{variant:'shake'}),tmNote(inst,[0],.35,.5,v,{variant:'hit'})];
 if(I.kind==='gong')return [tmNote(inst,[0],0,1.2,v,{variant:'mf'})];
 if(I.kind==='harp')return [tmNote(inst,[tmDeg(base-12,0),tmDeg(base-12,2),tmDeg(base-12,4),tmDeg(base,0)],0,1,v,{strum:.07})];
 if(I.kind==='chord')return [tmNote(inst,[...tmTriad(base-12,0),tmDeg(base,0)],0,1,v,{strum:id==='guitarra'?.05:.012})];
 if(I.kind==='melody')return TM_LONGS.includes(id)?[tmNote(inst,[tmDeg(base,0)],0,.5,v),tmNote(inst,[tmDeg(base,4)],.5,.55,v)]:[tmNote(inst,[tmDeg(base,4)],0,.42,v),tmNote(inst,[tmDeg(base,2)],.42,.45,v*.95)];
 return [tmNote(inst,[tmDeg(base,0)],0,.5,v),tmNote(inst,[tmDeg(base,2)],.22,.5,v*.95),tmNote(inst,[tmDeg(base,4)],.44,.6,v*.9)];}
const tmEv=(n,period)=>({inst:n.inst,midi:n.midi,at:n.t/period,length:n.len/period,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})});
// The lead of the piece: the clue, then two answers of the same instrument.
const tmLead=(id,r,k)=>[...tmPhraseNotes(id,r,k,.15),...tmPhraseNotes(id,r,(k+1)%5,2.1),...tmPhraseNotes(id,r,(k+3)%5,4.0)];
// The piece of the right instrument (fractions of TM_PIECE, as playPatternAudio wants): the lead over a light accompaniment of plucked
// strings (a bass of plucked cellos, none under the double bass and the tuba; chords on the harp, or on plucked violins when the harp,
// the guitar or the piano leads) and a closing chord that rings out, with the last note of the lead. The unpitched instruments carry
// the rhythm, and a marimba (a harp under the gong) answers them with a melody. Over by 6.5 s; the rest is the last notes fading.
export function tmScore(id,round){const r=Math.max(0,round|0),root=tmRoot(r),k=(r*2)%5,beat=.5,out=[],I=tmInstrument(id),perc=['timbal','triangle','pandereta','gong'].includes(I.kind);
 const lead=tmLead(id,r,k),accInst=['arpa','guitarra','piano'].includes(id)?'violinsPizzRec':'dsArpa',chords=[0,3,4,0],accVel=perc?.42:.28;
 for(let bar=0;bar<3;bar++){const t0=.15+bar*1.95,ch=chords[(bar+r)%4];
  if(id!=='contrabaix'&&id!=='tuba')out.push(tmNote('celliPizzRec',[tmDeg(root-24,ch)],t0,.9,.5));
  for(let q=0;q<4;q++)out.push(tmNote(accInst,[tmDeg(root-12,ch+[0,2,4,2][q])],t0+q*beat,.6,accVel));}
 if(perc){const mel=id==='gong'?'dsArpa':'dsMarimba';for(const [t,d] of [[.3,4],[.8,2],[2.3,5],[2.8,4],[4.2,7],[4.7,4],[5.2,2]])out.push(tmNote(mel,[tmDeg(root+12,d)],t,.45,.45));}
 const end=6.0;[0,2,4,7].forEach((d,i)=>out.push(tmNote(id==='arpa'?'violinsPizzRec':'dsArpa',[tmDeg(root-12,d)],end+i*.05,1.6,.48)));if(id!=='glock')out.push(tmNote('dsGlock',[tmDeg(root+24,4)],end+.2,1.4,.36));
 const v=TM_VEL[id]||.6;
 if(I.kind==='timbal')out.push(tmNote(I.inst,[tmTimp(r)],end,1.4,v));
 else if(I.kind==='triangle')out.push(tmNote(I.inst,[0],end+.05,1.6,v,{variant:'gran'}));
 else if(I.kind==='pandereta')out.push(tmNote(I.inst,[0],end,.6,v,{variant:'hit'}));
 else if(I.kind==='gong')out.push(tmNote(I.inst,[0],end,2.4,v*.9,{variant:'p'}));
 else if(I.kind==='melody')out.push(tmNote(I.inst,[tmDeg(root+I.reg,0)],end,.45,v*.85));
 else if(I.kind==='chord')out.push(tmNote(I.inst,[...tmTriad(root+I.reg-12,0),tmDeg(root+I.reg,0)],end,1.4,v,{strum:id==='guitarra'?.05:.015}));
 else if(id!=='arpa')out.push(tmNote(I.inst,[tmDeg(root+I.reg,0)],end,1.2,v));
 return [...lead,...out].map(n=>tmEv(n,TM_PIECE)).filter(e=>e.at<1).sort((a,b)=>a.at-b.at);}
// For the picture: the times (s) at which the lead instrument of the piece strikes or starts a note, so the instrument moves with them.
export function tmBeats(id,round){const r=Math.max(0,round|0),k=(r*2)%5;return tmLead(id,r,k).map(n=>n.t).sort((a,b)=>a-b);}

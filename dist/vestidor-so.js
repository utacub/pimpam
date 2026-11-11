// El vestidor fantàstic (EN06, 0.73): the sound. A little variety band in F major, 2/4 at 112, that grows with the outfit. Each costume
// has its instrument (the pirate the tuba, the ballerina the glockenspiel, the diver the clarinet, the astronaut the harp, the pastry chef
// the bassoon, the royal costume the trumpet), and the place of the piece decides what it plays: the head the tune, the body the chords
// off the beat in the middle, the feet the bass; the object adds a little fill every two bars. The piano (oom-pah) and the tambourine are
// always there, and the timpani mark the phrases of the show. The notes are the real instruments of Detectius de sons (VSCO-2 CE, CC0).
// The foley, the audience, Pipa and the parrot, and the wordless voices of the four artists (exclamations, laughs, a «ta-da») were
// generated with ElevenLabs on 2026-11-11 (CREDITS.md of the samples): their rights of use have not been verified.
import {SAMPLE_BANK} from './sampler.js';
import {VS_FLY,VS_STEP,VS_SLIP,VS_ACTS,vsTimeline,vsRoundOf,vsSlip,vsSlots,vsNumber,vsMirror} from './vestidor.js';
export const VS_BPM=112,VS_BEAT=60/VS_BPM,VS_BAR=VS_BEAT*2;
export const VS_INST=Object.freeze({pirata:'dsTuba',ballarina:'dsGlock',bus:'dsClarinet',astronauta:'dsArpa',pastisser:'dsFagot',reialesa:'dsTrompeta'});
const VS_MODE=[0,2,4,5,7,9,11];
export const vsDeg=(d,oct=0)=>65+VS_MODE[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
const vsFit=(inst,m)=>{const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;};
const vsN=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>vsFit(inst,m)),t,len,vel:Math.min(1,vel),...x});
// The lengths of the sounds of the bank (s), so that each plays whole.
export const VS_SFX=Object.freeze({aletes:.71,aplaudiments:4.21,armariTanca:.63,awwPublic:3.45,badumtss:1.28,barretPosa:.26,barretVola:1.07,bombolles:.63,botesLluna:.5,botesPirata:1.1,capaEnrotlla:.81,capaGira:1.65,casc:.63,cinta:2.04,confeti:1.02,corona:1.57,esclops:1.31,farina:.86,focus:.55,globus:1.54,gorroCreix:2.04,gosBorda:.52,gosCanta:.94,gosEsternuda:1.2,gosPotes:.86,gosSacseja:1.31,gosYip:.39,lloroAles:1.72,lloroCrida:.47,lloroXerra:1.65,lloroXiula:.76,mirall:1.18,neda:1.49,neopre:1.23,oohPublic:2.59,ovacio:5.46,paraigua:.5,passosMitjons:1.41,pirueta:.84,puntetes:1.04,regadora:1.04,rellisca:1.04,riallesPublic:2.64,robaPosa:.47,robaVola:1.78,sabatesPosa:.99,teloner:1.72,tuba:1.54,tutuPop:.26,ventada:2.06,ventall:.99,vestitInfla:1.65});
const vsX=(variant,t,vel=.5,len=null)=>({inst:'vestidorRec',midi:[0],t,len:len??VS_SFX[variant]??1,vel:Math.min(1,vel),variant});
// The voices: two takes of each exclamation by artist (one for a few), played in turn.
export const VS_VOICES=Object.freeze(['Tada','Ooh','Uau','Rialleta','Ups','Esforc','Oh','Iupi','Riure']);
const vsV=(who,kind,t,vel=.62)=>({inst:'vestidorVeu',midi:[0],t,len:2.2,vel,variant:who+kind});
const vsHit=(inst,variant,t,vel,len=.4)=>({inst,midi:[0],t,len,vel,variant});
// The tune (eight bars of four quavers, scale degrees; null holds) and the chord of each bar (the root, as a degree).
export const VS_TUNE=Object.freeze([[0,null,2,4],[7,null,4,null],[5,4,3,2],[4,null,null,null],[0,null,2,4],[5,null,7,null],[8,7,6,4],[7,null,null,null]]);
export const VS_CHORDS=Object.freeze([0,0,4,0,0,3,4,0]);
const vsPlucked=inst=>inst==='dsArpa'||inst==='dsGlock';
// One bar of the band from tb (s), bar index b of the tune, with the costume of each place (P: cap, cos, peus, objecte; missing ones are silent).
function vsBar(P,tb,b,vel=1,{full=false,tune=true}={}){const out=[],ch=VS_CHORDS[b%8],q=VS_BEAT/2,at=x=>tb+x*VS_BEAT;
 // the piano: the bass on one, the chord on two
 out.push(vsN('dsPiano',vsDeg(ch,-2),at(0),VS_BEAT*.5,.34*vel),vsN('dsPiano',[vsDeg(ch,-1),vsDeg(ch+2,-1),vsDeg(ch+4,-1)],at(1),VS_BEAT*.4,.24*vel));
 out.push(vsHit('dsPandereta','hit',at(1),.13*vel));if(full&&b%2)out.push(vsHit('dsPandereta','shake',at(.5),.09*vel,.6));
 if(full&&b%4===0)out.push(vsN('dsTimbal',vsDeg(0,-2),at(0),VS_BEAT,.32*vel));
 // the feet: the bass, root and fifth (bouncing)
 if(P.peus){const I=VS_INST[P.peus];out.push(vsN(I,vsDeg(ch,-2),at(0),VS_BEAT*.5,.4*vel),vsN(I,vsDeg(ch+4,-2),at(1),VS_BEAT*.5,.34*vel));}
 // the body: the chord off the beat (a broken chord on the vsPlucked ones)
 if(P.cos){const I=VS_INST[P.cos];if(vsPlucked(I))[0,2,4,2].forEach((d,i)=>out.push(vsN(I,vsDeg(ch+d,0),at(i*.5),q*1.6,.22*vel)));else{out.push(vsN(I,[vsDeg(ch+2,0),vsDeg(ch+4,0)],at(.5),q*.7,.22*vel),vsN(I,[vsDeg(ch+2,0),vsDeg(ch+4,0)],at(1.5),q*.7,.2*vel));}}
 // the head: the tune (the bassoon always short)
 if(P.cap&&tune){const I=VS_INST[P.cap],line=VS_TUNE[b%8];line.forEach((d,i)=>{if(d===null)return;let n=1;for(let k=i+1;k<line.length&&line[k]===null;k++)n++;const len=I==='dsFagot'?q*.6:q*n*.92;out.push(vsN(I,vsDeg(d,0),at(i*.5),len,(.36+(i===0?.05:0))*vel));});}
 // the object: a fill on the second beat of every other bar
 if(P.objecte&&b%2)out.push(...vsFill(P.objecte,at(1),ch,vel));
 return out;}
function vsFill(obj,t,ch,vel=1){const o=[];
 if(obj==='paraigua')[0,2,4].forEach((d,i)=>o.push(vsN('dsArpa',vsDeg(ch+d,1),t+i*VS_BEAT/3,.5,.22*vel)));
 else if(obj==='tuba')[4,2,0].forEach((d,i)=>o.push(vsN('dsTuba',vsDeg(ch+d,-1),t+i*VS_BEAT/4,VS_BEAT*.22,.3*vel)));
 else if(obj==='globus')[4,7].forEach((d,i)=>o.push(vsN('dsGlock',vsDeg(ch+d,1),t+i*VS_BEAT/2,.6,.16*vel)));
 else if(obj==='regadora')[0,.5].forEach(d=>o.push(vsHit('dsTriangle','petit',t+d*VS_BEAT,.12*vel,.8)));
 else if(obj==='ventall')[0,1,2,3,4].forEach(i=>o.push(vsN('dsFlauta',vsDeg(ch+i,1),t+i*VS_BEAT/6,VS_BEAT/6,.18*vel)));
 else if(obj==='cinta')[0,1,2,3,4,5,6].forEach(i=>o.push(vsN('dsArpa',vsDeg(ch+i,0),t+i*.055,.5,.16*vel)));
 return o;}
// Bars of the band from `from` for n bars, the bar index of the tune of each one given by first + j.
function vsBand(P,from,n,first,vel=1,o={}){const out=[];for(let j=0;j<n;j++)out.push(...vsBar(P,from+j*VS_BAR,((first+j)%8+8)%8,vel,o));return out;}
// The final chord: the tonic on the piano and on every costume of the outfit, the timpani and a soft cymbal.
function vsStinger(P,t,vel=1){const out=[vsN('dsPiano',[vsDeg(0,-2),vsDeg(0,-1),vsDeg(2,-1),vsDeg(4,-1),vsDeg(7,-1)],t,1.6,.36*vel,{strum:.02}),vsN('dsTimbal',vsDeg(0,-2),t,1.4,.36*vel),vsHit('cymbalRec','soft',t,.16*vel,2.4)];
 if(P.peus)out.push(vsN(VS_INST[P.peus],vsDeg(0,-2),t,1.2,.4*vel));if(P.cos)out.push(vsN(VS_INST[P.cos],[vsDeg(2,0),vsDeg(4,0)],t,1.2,.26*vel));if(P.cap)out.push(vsN(VS_INST[P.cap],vsDeg(7,0),t,1.3,.36*vel));return out;}
// The sound of the piece landing on the artist, by place and piece.
function vsLand(slot,id,t){
 if(slot==='cap')return id==='reialesa'?[vsX('corona',t,.45)]:id==='astronauta'?[vsX('casc',t,.5)]:[vsX('barretPosa',t,.42)];
 if(slot==='cos')return id==='ballarina'?[vsX('tutuPop',t,.5),vsX('robaPosa',t+.02,.3)]:id==='bus'?[vsX('neopre',t,.45)]:[vsX('robaPosa',t,.48)];
 if(slot==='peus')return id==='bus'?[vsX('aletes',t,.5)]:id==='astronauta'?[vsX('botesLluna',t,.5)]:[vsX('sabatesPosa',t,.45)];
 return [vsX(id,t,.5),vsN('dsGlock',vsDeg(4,1),t,.6,.16),vsN('dsGlock',vsDeg(7,1),t+.12,.6,.16)];}
// The gag of the piece (g = 0 when it lands): its sounds and one exclamation of the artist, timed to the drawing (vestidor-gags.js).
function vsGagSounds(slot,id,who,t0){const o=[],x=(v,g,vel,len)=>o.push(vsX(v,t0+g,vel,len)),v=(k,g,vel)=>o.push(vsV(who,k,t0+g,vel));
 if(slot==='cap'){
  if(id==='pirata'){x('lloroAles',.15,.42);x('lloroXerra',1.15,.38);v('Rialleta',1.9);}
  else if(id==='ballarina'){[7,9,11,14].forEach((d,i)=>o.push(vsN('dsGlock',vsDeg(d,1),t0+.2+i*.3,.8,.13)));v('Ooh',.3,.5);}
  else if(id==='bus'){x('bombolles',.2,.4);x('bombolles',1.1,.32);v('Riure',1.5);}
  else if(id==='astronauta'){[0,2,4,7].forEach((d,i)=>o.push(vsN('dsArpa',vsDeg(d,1),t0+.3+i*.35,.8,.16)));v('Uau',.4);}
  else if(id==='pastisser'){x('gorroCreix',.05,.42);v('Esforc',.45,.5);x('farina',2.1,.45);v('Ups',2.25);}
  else if(id==='reialesa'){v('Ups',.55);o.push(vsN('dsGlock',vsDeg(4,1),t0+2.1,.7,.14));}}
 else if(slot==='cos'){
  if(id==='pirata'){o.push(vsHit('natureRec','vaixell',t0+.05,.5,2.9));v('Riure',1.3);}
  else if(id==='ballarina'){x('pirueta',.1,.42);x('pirueta',.95,.36);v('Iupi',.3);}
  else if(id==='bus'){x('neda',.5,.42);x('bombolles',1.1,.34);v('Iupi',.55);x('aletes',2.75,.36);}
  else if(id==='astronauta'){x('vestitInfla',0,.45);v('Ooh',.5);o.push(vsHit('toonRec','poof',t0+2.25,.22,.5));}
  else if(id==='pastisser'){x('farina',.1,.42);x('farina',1.2,.34);v('Riure',2.2);}
  else if(id==='reialesa'){x('capaEnrotlla',.3,.48);v('Oh',.35,.55);x('capaGira',1.5,.42);}}
 else if(slot==='peus'){
  if(id==='pirata'){x('botesPirata',0,.42);x('botesPirata',.84,.38);v('Rialleta',1.9);}
  else if(id==='ballarina'){x('puntetes',.4,.4);x('puntetes',1.45,.36);v('Rialleta',2.7);}
  else if(id==='bus'){for(let k=1;k<5;k++)x('aletes',k*.56,.34);v('Riure',1.2);}
  else if(id==='astronauta'){x('botesLluna',.2,.45);v('Uau',.5);x('botesLluna',2.65,.42);}
  else if(id==='pastisser'){x('rellisca',.15,.48);v('Ups',.35);}
  else if(id==='reialesa'){o.push(vsHit('toonRec','boing',t0+.19,.28,.5),vsHit('toonRec','boing',t0+1.24,.24,.5));v('Iupi',.3);}}
 else v('Ooh',.2,.55);
 return o;}
// Pipa copies the piece (g 1.85 to 2.9): a hop and its own noise.
function vsPipaSounds(slot,id,t0){if(slot==='objecte')return [vsX('gosYip',t0+2.05,.36)];if(slot==='cos'&&id==='pastisser')return [vsX('gosEsternuda',t0+2.05,.42)];
 if(slot==='cap'&&id==='bus')return [vsX('gosSacseja',t0+2.0,.36)];return [vsX(slot==='cap'?'gosYip':slot==='cos'?'gosBorda':'gosPotes',t0+2.05,.38)];}
// A pick that is not the last: the wardrobe closes, the piece flies (to the wrong place first with «Despistes»), lands with its sound and
// its gag, Pipa copies it, the mirror plays its trick and the artist looks at it; the band plays three bars with the layers so far and a chord.
export function vsStepScore(s,round,stage,picks,id){const slots=vsSlots(s),slot=slots[Math.min(stage|0,slots.length-1)],who=vsRoundOf(round,s).artist,slip=vsSlip(round,stage,s),D=slip?VS_SLIP:0,land=VS_FLY+D,dur=VS_STEP+D,out=[];
 out.push(vsX('armariTanca',.5,.32),vsX(slot==='cap'?'barretVola':'robaVola',.04,.34,.8));
 if(slip){out.push(...vsLand(slip==='peus'?'peus':'cap',slip==='peus'?'pirata':'pirata',VS_FLY).map(e=>({...e,vel:e.vel*.8})),vsV(who,'Ups',VS_FLY+.35),vsX('robaVola',VS_FLY+1,.3,.6));}
 out.push(...vsLand(slot,id,land),...vsGagSounds(slot,id,who,land),...vsPipaSounds(slot,id,land));
 const m=vsMirror(round,stage,s,id);out.push(m.kind==='peca'?vsX('mirall',land+.45,.3):vsX('badumtss',land+.5,.26));out.push(vsV(who,'Uau',dur-1,.5));
 const bars=3,from=land+.06;out.push(...vsBand(picks,from,bars,stage%2?4:0,.95),...vsStinger(picks,from+bars*VS_BAR,.8));
 return out.filter(e=>e.t<dur-.05).sort((a,b)=>a.t-b.t);}
// The gait of the feet on the stage (the walk of the number), from a to b.
function vsGaitSounds(feet,a,b){const o=[],every=(v,per,vel,off=0)=>{for(let t=a+off;t<b-.2;t+=per)o.push(vsX(v,t,vel));};
 if(feet==='pirata')every('botesPirata',1,.28);else if(feet==='ballarina')every('puntetes',1.04,.26);else if(feet==='bus')every('aletes',.62,.24);
 else if(feet==='astronauta')every('botesLluna',1.45,.32);else if(feet==='pastisser'){every('esclops',1.31,.24);o.push(vsX('rellisca',a+.9,.32));}
 else if(feet==='reialesa')for(let t=a+.14;t<b-.2;t+=.72)o.push(vsHit('toonRec','boing',t,.14,.5));
 return o;}
// The body's way of moving (the middle of the number), from a to b.
function vsMoveSounds(body,a,b){const o=[];
 if(body==='pirata')o.push(vsHit('natureRec','vaixell',a,.4,b-a));else if(body==='ballarina'){for(let t=a;t<b-.4;t+=1.1)o.push(vsX('pirueta',t,.26));}
 else if(body==='bus'){o.push(vsX('neda',a,.36),vsX('bombolles',a+.8,.3),vsX('neda',a+2,.3),vsX('bombolles',b-.8,.26));}else if(body==='astronauta')o.push(vsX('vestitInfla',a,.4));
 else if(body==='pastisser'){for(let t=a;t<b-.4;t+=1.1)o.push(vsX('farina',t,.26));}else if(body==='reialesa')o.push(vsX('capaGira',a,.36),vsX('capaGira',a+2.2,.3));
 return o;}
// What happens above the head along the number.
function vsHeadSounds(head,t0,W,M,Nn){const o=[];
 if(head==='pirata')o.push(vsX('lloroXiula',t0+W*.5,.32),vsX('lloroXerra',t0+M-1.2,.3));else if(head==='bus')o.push(vsX('bombolles',t0+2,.26),vsX('bombolles',t0+M-1,.24));
 else if(head==='astronauta'){for(let t=1;t<Nn-.5;t+=1.6)o.push(vsN('dsGlock',vsDeg([7,9,11,14][Math.round(t)%4],1),t0+t,.7,.09));}
 else if(head==='pastisser')o.push(vsX('gorroCreix',t0+W,.34),vsX('farina',t0+M,.36));else if(head==='reialesa')o.push(vsX('corona',t0+1,.22));
 return o;}
// The magic object (from M, for L seconds), with the surprise of its pair.
function vsMagicSounds(obj,pair,t0,L){const o=[],x=(v,g,vel=.4)=>{if(g<L-.1)o.push(vsX(v,t0+g,vel));};
 if(obj==='paraigua'){x('paraigua',.05,.48);x('ventada',.25,.22);if(pair==='planeja'){x('aletes',1.8,.3);x('aletes',2.3,.28);x('aletes',2.8,.26);}if(pair==='vela'){x('ventada',.3,.36);x('capaGira',.5,.34);}}
 else if(obj==='tuba'){x('tuba',.6,.46);x('tuba',2.2,.36);if(pair==='lloro'){x('lloroCrida',.7,.42);x('lloroAles',.8,.38);x('lloroXerra',L-1.6,.34);}else x('barretVola',.8,.36);}
 else if(obj==='globus'){x('globus',.05,.46);for(let i=0;i<5;i++)o.push(vsN('dsArpa',vsDeg(i*2,0),t0+.2+i*.12,.6,.14));if(pair==='espai'||pair==='flota')x('globus',1.6,.3);}
 else if(obj==='regadora'){x('regadora',.1,.44);x('regadora',1.2,.36);[0,2,4,7,9].forEach((d,i)=>o.push(vsN('dsGlock',vsDeg(d,1),t0+.8+i*.16,.8,.12)));if(pair==='dutxa')x('neda',.5,.36);if(pair==='flors')x('awwPublic',.9,.3);}
 else if(obj==='ventall'){x('ventall',.05,.44);x('ventada',.4,.36);if(pair==='gorro'||pair==='farina')x('barretVola',.6,.36);if(pair==='farina'){x('farina',.5,.36);x('farina',1.3,.32);x('gosEsternuda',1.6,.4);}}
 else if(obj==='cinta'){x('cinta',.05,.44);if(pair==='doble'){x('pirueta',.3,.32);x('pirueta',1.4,.3);}else if(L>2.6)x('cinta',2.1,.34);if(pair==='corona')x('corona',.5,.3);}
 return o;}
// The last pick: the piece and its gag as a step, the drum roll as the wall goes up, the whole band for the number with the gait, the
// body, the head and the magic, the audience, the final chord with «ta-da» and the ovation, every fourth show the four artists together,
// the curtain and the next artist coming down in socks.
export function vsFinalScore(s,round,stage,picks,id){const R=vsRoundOf(round,s),who=R.artist,slots=vsSlots(s),slot=slots[Math.min(stage|0,slots.length-1)],slip=vsSlip(round,stage,s),D=slip?VS_SLIP:0,land=VS_FLY+D,TL=vsTimeline(s,round,D),out=[];
 out.push(vsX('armariTanca',.5,.32),vsX(slot==='cap'?'barretVola':'robaVola',.04,.34,.8));
 if(slip)out.push(...vsLand(slip==='peus'?'peus':'cap','pirata',VS_FLY).map(e=>({...e,vel:e.vel*.8})),vsV(who,'Ups',VS_FLY+.35),vsX('robaVola',VS_FLY+1,.3,.6));
 out.push(...vsLand(slot,id,land),...vsGagSounds(slot,id,who,land).filter(e=>e.t<TL.put-.1),...vsPipaSounds(slot,id,land).filter(e=>e.t<TL.put-.1));
 const fb=Math.max(1,Math.floor((TL.put-.25-land)/VS_BAR));out.push(...vsBand(picks,land+.06,fb,0,.9));
 // the wall goes up
 out.push(vsHit('snareRollRec','roll',TL.put-.2,.22,TL.up-TL.put+.15),vsX('teloner',TL.put+.05,.4),vsX('focus',TL.up-.06,.42),vsN('dsTimbal',vsDeg(0,-2),TL.up,1,.36),vsX('oohPublic',TL.up+.15,.3));
 // the number: the bars end on the tonic at numEnd
 const nb=vsNumber(picks),Nn=TL.N,W=VS_ACTS.walk[1]*Nn,M=VS_ACTS.move[1]*Nn,bars=Math.floor((TL.numEnd-TL.num-.1)/VS_BAR),start=TL.numEnd-bars*VS_BAR;
 out.push(...vsBand(picks,start,bars,-bars,1,{full:true}));
 out.push(...vsGaitSounds(nb.feet,TL.num,TL.num+W),vsX('gosPotes',TL.num+.3,.3),vsX('gosYip',TL.num+W*.7,.3),vsV(who,'Rialleta',TL.num+1.5,.55));
 out.push(...vsMoveSounds(nb.body,TL.num+W,TL.num+M),vsX('riallesPublic',TL.num+W+1,.28),vsV(who,'Riure',TL.num+W+1.2,.55));
 out.push(...vsHeadSounds(nb.head,TL.num,W,M,Nn));
 if(nb.object){out.push(...vsMagicSounds(nb.object,nb.pair,TL.num+M,Nn-M),vsV(who,'Uau',TL.num+M+.5),vsX('oohPublic',TL.num+M+.3,.32));}else out.push(vsV(who,'Iupi',TL.num+M+.3));
 if(nb.full)out.push(vsX('confeti',TL.num+M,.4),vsX('awwPublic',TL.num+M+.6,.28));
 // the bow
 out.push(...vsStinger(picks,TL.numEnd),vsV(who,'Tada',TL.numEnd+.05,.7),vsV(who,'Iupi',TL.numEnd+1.7,.5),vsX('ovacio',TL.numEnd+.1,.5),vsX('aplaudiments',TL.numEnd+1.6,.36),vsX('gosCanta',TL.numEnd+.9,.42));if(nb.full)out.push(vsX('confeti',TL.numEnd,.42));
 // every fourth show: the four artists together, the band once more
 if(TL.group){const g0=TL.groupStart,gb=Math.floor((TL.groupEnd-g0-.9)/VS_BAR);out.push(vsX('aplaudiments',g0,.42),vsX('confeti',g0+.2,.4));
  [3,2,1,0].forEach((k,i)=>{const r=round-k;if(r<0)return;out.push(vsV(vsRoundOf(r,s).artist,i%2?'Tada':'Iupi',g0+.3+i*.38,.5));});
  out.push(...vsBand(picks,g0+.5,gb,4,.9,{full:true}),...vsStinger(picks,g0+.5+gb*VS_BAR,.9),vsX('ovacio',TL.groupEnd-1.1,.42));}
 // the curtain, and the next artist
 // a few steps back upstage (vestidor-art.js VS_RETREAT), then the curtain
 out.push(...vsGaitSounds(nb.feet,TL.groupEnd-.3,TL.groupEnd+.9).filter(e=>e.variant!=='rellisca').map(e=>({...e,vel:e.vel*.8})),vsX('teloner',TL.groupEnd+.45,.38),vsX('passosMitjons',TL.close+.1,.28));
 return out.filter(e=>e.t<TL.end-.05).sort((a,b)=>a.t-b.t);}
// From seconds to the fractions of the effect that app.js plays (at and length over its duration).
export const vsPattern=(events,D)=>events.filter(e=>e.t<D-.02).map(e=>({inst:e.inst,midi:e.midi,at:Math.max(0,e.t)/D,length:Math.max(.01,Math.min(e.len,D-e.t))/D,vel:e.vel,...(e.variant?{variant:e.variant}:{}),...(e.strum?{strum:e.strum}:{})}));
// The taste of a piece in focus (under 1.2 s): its costume's instrument in the place's register (the head a little tune, the body a
// chord twice, the feet the bass twice), or the object's own sound.
export function vsTaste(slot,id){if(slot==='objecte')return [vsX(id,0,.45,Math.min(1.1,VS_SFX[id]||1))];const I=VS_INST[id];if(!I)return [];
 if(slot==='cap')return [vsN(I,vsDeg(4,0),0,.3,.36),vsN(I,vsDeg(7,0),.3,.6,.38)];
 if(slot==='cos')return vsPlucked(I)?[0,2,4,7].map((d,i)=>vsN(I,vsDeg(d,0),i*.14,.6,.26)):[vsN(I,[vsDeg(2,0),vsDeg(4,0)],0,.25,.28),vsN(I,[vsDeg(2,0),vsDeg(4,0)],.32,.4,.28)];
 return [vsN(I,vsDeg(0,-2),0,.3,.42),vsN(I,vsDeg(4,-2),.32,.45,.38)];}
// The air: the audience murmuring behind the wall of the dressing room, louder on the opening night.
export function vsAmbience(light){return [{name:'murmuri',level:light==='nit'?.075:.06,lowpass:light==='nit'?4200:3600}];}

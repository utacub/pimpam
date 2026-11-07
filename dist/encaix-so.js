// Encaixos de fusta (EN12, 0.45): the sound. Every sound comes from the banks the suite already has (sampler.js): the music of each world
// with the recorded instruments, the wooden noises of the pieces with the drums, claves and stones, and the voice of each figure with the
// animals and the foley of the other activities (gulls, a tram bell, an owl, a dog, a cat, bubbles, snow…). Nothing new was generated.
// Each piece fitted adds a layer to the music of its board: with one figure only the percussion plays, with two the bass comes in, with
// three the harmony and with four the whole melody; the party of the board has everything, fuller. Every phrase ends plucked or struck.
import {SAMPLE_BANK} from './sampler.js';
import {EX_FLY,EX_STEP,EX_PARTY,EX_FINAL,EX_OUT,exWorldOf} from './encaix.js';
export const EX_LOUD=1,EX_GAG_LOUD=.85;
const exFit=(inst,m)=>{const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;};
export const exNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>exFit(inst,m)),t,len,vel:Math.min(1,vel*EX_LOUD),...x});
// The piece of each world: key, scale, tempo, beats per bar, chords by bar (scale degrees), and the four layers: the percussion, the bass,
// the harmony and the melody (bars of degrees on a grid of half beats; null is a rest; melody degrees are of the key, octaves by 7).
export const EX_PIECE=Object.freeze({
 port:{root:62,mode:[0,2,4,5,7,9,11],bpm:176,beats:6,grid:1,chords:[0,3,4,0,5,3,4,0],perc:'port',bass:'celliPizzRec',harm:'guitarRec',mel:'marimbaRec',
  tune:[[0,2,4,7,null,4],[5,null,3,4,null,2],[0,2,4,7,9,7],[4,null,2,0,null,null],[4,5,7,9,null,7],[5,3,5,7,null,4],[2,4,5,4,2,1],[0,null,null,0,null,null]]},
 circ:{root:60,mode:[0,2,4,5,7,9,11],bpm:118,beats:4,grid:2,chords:[0,0,4,4,0,0,4,0],perc:'circ',bass:'tubaRec',harm:'marimbaRec',mel:'trumpetRec',
  tune:[[0,null,0,2,4,null,2,4],[5,null,4,2,0,null,null,null],[4,null,4,5,7,null,5,4],[2,null,4,2,1,null,null,null],[7,null,7,9,7,null,5,4],[5,null,4,5,7,null,null,null],[4,null,2,4,5,null,4,2],[0,null,null,null,0,null,null,null]]},
 ciutat:{root:67,mode:[0,2,4,5,7,9,11],bpm:150,beats:3,grid:2,chords:[0,0,4,4,4,4,0,0,3,3,0,0,4,4,0,0],perc:'ciutat',bass:'celliPizzRec',harm:'guitarRec',mel:'clarinetRec',
  tune:[[4,null,4,5,4,2],[0,null,null,null,null,null],[2,null,2,4,2,1],[-1,null,null,null,null,null],[4,null,4,5,7,5],[4,null,null,2,null,null],[2,null,4,2,1,-1],[0,null,null,null,null,null]]},
 bosc:{root:65,mode:[0,2,4,5,7,9,11],bpm:84,beats:4,grid:2,chords:[0,5,3,4,0,5,3,0],perc:'bosc',bass:'celliPizzRec',harm:'kalimbaRec',mel:'fluteRec',
  tune:[[7,null,9,7,4,null,null,null],[2,null,4,2,0,null,null,null],[4,null,5,7,9,null,7,null],[4,null,null,null,null,null,null,null],[7,null,9,11,9,null,7,null],[4,null,7,4,2,null,null,null],[0,null,2,4,2,null,0,null],[-3,null,null,null,null,null,null,null]]},
 espai:{root:69,mode:[0,2,3,5,7,9,10],bpm:72,beats:4,grid:2,chords:[0,6,2,4,0,6,3,4],perc:'espai',bass:'harpRec',harm:'vibRec',mel:'glockRec',
  tune:[[0,null,4,null,7,null,null,null],[6,null,null,null,4,null,null,null],[2,null,4,null,6,null,7,null],[4,null,null,null,null,null,null,null],[7,null,9,null,7,null,4,null],[6,null,4,null,2,null,null,null],[0,null,2,null,4,null,2,null],[0,null,null,null,null,null,null,null]]}});
export const exDeg=(P,d,oct=0)=>P.root+P.mode[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
// The percussion of each world, one bar (times in beats): claves and a drum at the port; snare, bass drum and a soft cymbal at the circus;
// rim taps and claves in the city; the log drum and the stones in the forest; triangle and a shaker in space.
function exPerc(world,bar,beats,full){const out=[];const H=(inst,variant,t,vel)=>out.push({inst,variant,t,vel});
 if(world==='port'){H('woodblockRec','claves',0,.34);H('tamborRec','alt',2,.26);H('tamborRec','mig',3,.3);H('tamborRec','alt',5,.24);if(full)H('tamborRec','sonall',1,.22);}
 else if(world==='circ'){H('bassdrumRec','soft',0,.5);H('snareRec','hit',1,.28);H('bassdrumRec','soft',2,.42);H('snareRec','hit',3,.3);if(full){H('cymbalRec','soft',bar%2?2:0,.22);H('snareRec','hit',3.5,.2);}}
 else if(world==='ciutat'){H('tamborRec','vora',0,.34);H('woodblockRec','claves',1,.24);H('woodblockRec','claves',2,.22);if(full)H('tamborRec','alt',2.5,.2);}
 else if(world==='bosc'){H('pouPerc','tronc',0,.4);H('pouPerc','pedra',1.5,.24);H('pouPerc','pedra2',2.5,.22);if(full)H('tamborRec','sonall2',3,.24);}
 else{H('triangleRec','muted',0,.3);H('tamborRec','sonall',2,.22);if(full)H('triangleRec','hit',3,.22);}
 return out.filter(e=>e.t<beats);}
// The bass: the root and the fifth of the chord, plucked (or the tuba of the circus band).
function exBass(P,world,ch,beats){const out=[];const n=(d,t,len,vel)=>out.push({midi:exDeg(P,ch+d,-2),t,len,vel});
 if(world==='port'){n(0,0,1.2,.5);n(4,3,1,.42);}else if(world==='circ'){n(0,0,.8,.46);n(4,2,.8,.42);}else if(world==='ciutat'){n(0,0,1.2,.5);}else if(world==='bosc'){n(0,0,2,.48);n(4,2,1.6,.4);}else{n(0,0,2.5,.44);n(4,2,2,.36);}
 return out.filter(e=>e.t<beats);}
// The harmony: a guitar arpeggio on the waltz of the port, offbeat marimba chords at the circus, the mandolin-like plucks of the city, the
// kalimba of the forest, the vibraphone of space.
function exHarm(P,world,ch,beats,bar){const out=[];const n=(d,t,len,vel,x={})=>out.push({midi:[].concat(d).map(k=>exDeg(P,ch+k,-1)),t,len,vel,...x});
 if(world==='port'){[0,2,4,7,4,2].forEach((d,i)=>n(d,i,.9,.3));}
 else if(world==='circ'){n([0,2,4],1,.4,.36);n([0,2,4],3,.4,.34);if(bar%2)n([2,4,7],3.5,.3,.26);}
 else if(world==='ciutat'){n([0,2,4],0,.5,.3,{strum:.03});n([0,2,4],1,.4,.24,{strum:.03});n([2,4,7],2,.4,.26,{strum:.03});}
 else if(world==='bosc'){[0,4,7,9,7,4,2,4].forEach((d,i)=>n(d,i*.5,.6,.3));}
 else{n([0,4],0,2,.3);n([2,7],2,1.8,.26);}
 return out.filter(e=>e.t<beats);}
// A bar of the melody, on the grid of the piece (grid steps per beat).
function exMel(P,bar,beats){const line=P.tune[bar%P.tune.length],out=[];line.forEach((d,i)=>{if(d===null)return;let len=1;for(let k=i+1;k<line.length&&line[k]===null;k++)len++;out.push({midi:exDeg(P,d,P.mel==='glockRec'?1:0),t:i/P.grid,len:Math.min(len/P.grid,beats-i/P.grid),vel:.42+(i===0?.06:0)});});return out;}
// The score of a pick: k is the number of figures on the board with this one (1..4), the layers that play. Final: the party, everything,
// with the melody doubled a third below by the harmony's instrument and the percussion fuller, and a plucked cadence before the board goes.
const EX_LIFT=Object.freeze({port:[1.22,1.08,1.06,1],circ:[1.26,1.18,1.08,1],ciutat:[1.14,1.04,1,.91],bosc:[1.1,1.13,1.12,.94],espai:[1.21,1.21,1.21,1.22]});
export function exScore(world,k,final,round=0){const P=EX_PIECE[world]||EX_PIECE.port,beat=60/P.bpm,barLen=beat*P.beats,out=[];
 const D=final?EX_FINAL:EX_STEP,t0=EX_FLY+.12,end=final?EX_FLY+EX_PARTY-1.1:EX_STEP-.55,off=final?0:(round*2)%P.chords.length;let bars=Math.max(1,Math.round((end-t0)/barLen));while(bars>1&&t0+bars*barLen+.7>D)bars--;// the cadence always falls inside the effect
 const perc=k>=1,bass=k>=2,harm=k>=3,mel=k>=4||final;
 for(let bar=0;bar<bars;bar++){const tb=t0+bar*barLen,ch=P.chords[(bar+off)%P.chords.length];
  if(perc)for(const e of exPerc(world,bar,P.beats,final))out.push(exNote(e.inst,[0],tb+e.t*beat,.3,e.vel,{variant:e.variant}));
  if(bass)for(const e of exBass(P,world,ch,P.beats))out.push(exNote(P.bass,e.midi,tb+e.t*beat,e.len*beat,e.vel));
  if(harm)for(const e of exHarm(P,world,ch,P.beats,bar))out.push(exNote(P.harm,e.midi,tb+e.t*beat,e.len*beat,e.vel,e.strum?{strum:e.strum}:{}));
  if(mel)for(const e of exMel(P,bar+off,P.beats)){out.push(exNote(P.mel,e.midi,tb+e.t*beat,e.len*beat,e.vel));if(final&&bar>=2)out.push(exNote(P.harm,e.midi-(P.mode.includes(3)?3:4),tb+e.t*beat,Math.min(e.len*beat,.5),e.vel*.6));}}
 // the cadence, plucked and struck, never a held wind note
 const te=t0+bars*barLen+.04,cad=[0,2,4,7];cad.forEach((d,i)=>out.push(exNote('harpRec',exDeg(P,d,-1),te+i*.06,1.8,.42)));out.push(exNote(P.bass==='tubaRec'?'celliPizzRec':P.bass,exDeg(P,0,-2),te,1.4,.5));
 if(final)out.push(exNote(P.mel==='trumpetRec'||P.mel==='clarinetRec'||P.mel==='fluteRec'?'glockRec':P.mel,exDeg(P,4,1),te+.2,1.6,.3));else out.push(exNote('woodblockRec',[0],te+.12,.2,.26,{variant:'claves'}));
 // nothing sounds past the end of the effect: a note that would is shortened (the sampler releases it), one that would start there is left out
 // the level of the music by world and step (velocity is quadratic in the sampler), measured with tools/encaix-audio.mjs so that every
 // effect sits near −30 LUFS: a step with one voice is lifted, a full board of loud instruments is held back a little
 const G=(EX_LIFT[world]||EX_LIFT.port)[final?3:Math.min(2,k-1)],Dm=D-.08;return out.filter(n=>n.t<Dm-.25).map(n=>({...n,vel:Math.min(1,n.vel*G),len:n.t+n.len>Dm?Dm-n.t:n.len})).sort((a,b)=>a.t-b.t);}
export function exPatternScore(world,k,final,round=0){const D=final?EX_FINAL:EX_STEP;return exScore(world,k,final,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/D,length:n.len/D,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})})).filter(e=>e.at<1);}
// ── The wooden noises and the voices of the figures ──────────────────────────────────────────────────────────────────────────────
// Each sound: bank, variant, time (seconds from the start of the effect), gain (quadratic, as every velocity), and a length when the
// recording has to be cut. The flight ends at EX_FLY with the «clac» of the piece in its hole (claves over a low drum beat).
const exG=(inst,variant,t,gain,len)=>({inst,variant,t,gain,...(len?{len}:{})});
export const EX_CLAC=[exG('woodblockRec','claves',EX_FLY,.5),exG('tamborRec','baix',EX_FLY+.005,.46),exG('tamborRec','sonall',EX_FLY+.08,.16,.3)];
// A piece that does not fit: it lifts, tries the hole (two taps on the rim), and hops back to the tray (a short wooden tap and a soft boing).
export const EX_WRONG_SOUNDS=[exG('tamborRec','vora',.72,.3),exG('woodblockRec','claves',.9,.3),exG('woodblockRec','claves',1.04,.26),exG('toonRec','boing',1.18,.22,.6),exG('tamborRec','alt',1.5,.3)];
// The board goes: the figures hop into the tray, the board slides out and the next one in (paper sliding, then a low knock when it lands).
const exOutSounds=t=>[exG('tamborRec','alt',t,.3),exG('tamborRec','alt',t+.12,.26),exG('tamborRec','alt',t+.22,.24),exG('tamborRec','alt',t+.3,.22),exG('sabanaRec','paperLlisca',t+.45,.34),exG('tamborRec','baix',t+EX_OUT-.12,.44)];
// The voice of each figure when the focus reaches it in the tray, and the sounds of its two gags (times from the start of its life).
const EX_VOICE={
 barca:{taste:exG('vgRec','barca',0,.5,1.3),life:[[exG('vgRec','barca',.2,.5,1.6),exG('natureRec','waves',1.2,.14,2)],[exG('pintaRec','sirena',.3,.3),exG('vgRec','vela',1.6,.4,1.5)]]},
 gavina:{taste:exG('pintaRec','gavines2',0,.5,1.3),life:[[exG('pintaRec','gavines2',.1,.5,1.6),exG('pintaRec','peix',2.4,.5)],[exG('pintaRec','gavines',.2,.45,1.8),exG('masiaRec','esquitxpetit',2.6,.4)]]},
 pescadora:{taste:exG('masiaRec','canya',0,.45,1.2),life:[[exG('masiaRec','canya',.2,.45),exG('masiaRec','suro',1.1,.4),exG('masiaRec','fil',2.3,.4),exG('masiaRec','bota',2.8,.45)],[exG('masiaRec','canya',.2,.45),exG('masiaRec','suro',1.1,.4),exG('pintaRec','peix',2.6,.5),exG('masiaRec','esquitxgran',3.2,.4)]]},
 pop:{taste:exG('masiaRec','bombolles',0,.5,1.3),life:[[exG('masiaRec','bombolles',.3,.5),exG('selvaRec','glup',2.2,.45),exG('masiaRec','bombolles',3.2,.4)],[exG('natureRec','bubbles',.2,.3,1.6),exG('masiaRec','esquitxpetit',2.4,.4),exG('selvaRec','glup',3.4,.4)]]},
 cranc:{taste:exG('masiaRec','pinces',0,.5,1),life:[[exG('masiaRec','pinces',.3,.5),exG('masiaRec','pinces',1.3,.45),exG('woodblockRec','claves',2.6,.3),exG('woodblockRec','claves',2.75,.3)],[exG('masiaRec','pinces',.3,.5),exG('pouRec','passesLleugeres',1,.4,1.5),exG('masiaRec','pinces',2.8,.45)]]},
 monocicle:{taste:exG('masiaRec','gronxador',0,.45,1.2),life:[[exG('masiaRec','gronxador',.2,.45),exG('masiaRec','gronxador',1.6,.4),exG('toonRec','boing',3.1,.26,.6)],[exG('masiaRec','gronxador',.2,.45),exG('masiaRec','whoosh',2.2,.4),exG('tamborRec','mig',3.4,.36)]]},
 malabarista:{taste:exG('toonRec','plop',0,.45),life:[[exG('toonRec','plop',.3,.42),exG('toonRec','plop',.75,.4),exG('toonRec','plop',1.2,.42),exG('toonRec','plop',1.65,.4),exG('toonRec','plop',2.1,.42),exG('toonRec','plop',2.55,.4),exG('toonRec','clatter',3.3,.38)],[exG('toonRec','plop',.3,.42),exG('toonRec','plop',.75,.4),exG('toonRec','plop',1.2,.42),exG('toonRec','boing',2.2,.3,.6),exG('toonRec','plop',3,.42),exG('toonRec','plop',3.4,.4)]]},
 pallassa:{taste:exG('toonRec','hiccup',0,.5),life:[[exG('toonRec','squirt',.4,.4),exG('toonRec','clatter',1.8,.45),exG('toonRec','hiccup',3,.5)],[exG('toonRec','hiccup',.3,.5),exG('toonRec','yank',1.6,.4),exG('toonRec','poof',2.4,.4),exG('toonRec','hiccup',3.5,.45)]]},
 trapezi:{taste:exG('masiaRec','whoosh',0,.4),life:[[exG('masiaRec','gronxador',.2,.4),exG('masiaRec','whoosh',1.4,.4),exG('masiaRec','whoosh',2.6,.4),exG('cymbalRec','soft',3.6,.3)],[exG('masiaRec','gronxador',.3,.4),exG('masiaRec','whoosh',1.8,.42),exG('snareRollRec','roll',2.4,.24,1),exG('cymbalRec','soft',3.5,.32)]]},
 gos:{taste:exG('vgRec','lladruc',0,.5),life:[[exG('vgRec','lladruc',.2,.5),exG('masiaRec','whoosh',1.6,.38),exG('masiaRec','aterratge',2.2,.42),exG('vgRec','lladruc',3.2,.45)],[exG('vgRec','lladruc',.3,.5),exG('masiaRec','whoosh',1.9,.38),exG('toonRec','boing',2.4,.26,.6),exG('vgRec','badall',3.4,.4)]]},
 tramvia:{taste:exG('pintaRec','tramvia',0,.5),life:[[exG('pintaRec','tramvia',.2,.5),exG('vgRec','tren',.9,.26,2.4),exG('pintaRec','tramvia',3,.45)],[exG('pintaRec','tramvia',.3,.5),exG('pintaRec','tramvia',.7,.4),exG('vgRec','tren',1.2,.26,2.4),exG('masiaRec','campaneta',3.4,.4)]]},
 bombera:{taste:exG('pintaRec','sirena',0,.3,1.2),life:[[exG('woodblockRec','claves',.6,.3),exG('woodblockRec','claves',1.1,.3),exG('woodblockRec','claves',1.6,.3),exG('pintaRec','gat',2.6,.45),exG('masiaRec','gatsalt',3.4,.4)],[exG('woodblockRec','claves',.6,.3),exG('woodblockRec','claves',1.1,.3),exG('masiaRec','whoosh',2,.4),exG('masiaRec','esquitxgran',2.6,.4),exG('pintaRec','coloms',3.2,.4,1.2)]]},
 forner:{taste:exG('masiaRec','plat',0,.45),life:[[exG('masiaRec','terraobre',.3,.4),exG('masiaRec','focllar',.6,.3,2),exG('masiaRec','plat',2.4,.45),exG('masiaRec','mastegar',3.4,.4)],[exG('masiaRec','terraobre',.3,.4),exG('toonRec','inflate',1.4,.38),exG('toonRec','poof',2.6,.4),exG('masiaRec','riallagrup',3.2,.3,1.2)]]},
 gat:{taste:exG('pintaRec','gat',0,.5),life:[[exG('masiaRec','gratar',.3,.3,1),exG('pintaRec','gat',1.4,.5),exG('masiaRec','gatsalt',2.8,.45),exG('masiaRec','aterratge',3.3,.36)],[exG('pintaRec','gat',.3,.5),exG('pintaRec','coloms',1.6,.45,1.4),exG('masiaRec','gatsalt',2.6,.45),exG('masiaRec','gatxiscle',3.2,.4)]]},
 paraigua:{taste:exG('masiaRec','telainfla',0,.45),life:[[exG('masiaRec','telainfla',.3,.45),exG('masiaRec','rafega',1.2,.36,1.6),exG('masiaRec','polIiih',1.6,.3),exG('masiaRec','aterratge',3.6,.4)],[exG('masiaRec','telainfla',.3,.45),exG('masiaRec','pluja',.8,.26,2.4),exG('masiaRec','ninaRialla',2.4,.34),exG('masiaRec','esquitxpetit',3.4,.4)]]},
 esquirol:{taste:exG('pouRec','mastega',0,.45,1.2),life:[[exG('pouRec','passesLleugeres',.2,.4,1),exG('pouRec','mastega',1.4,.45,1.2),exG('pouRec','herba',3,.4)],[exG('pouRec','passesLleugeres',.3,.4,1),exG('pouRec','branca',1.6,.4),exG('toonRec','plop',2.9,.38),exG('pouRec','falgueres',3.3,.4)]]},
 mussol:{taste:exG('vgRec','mussol',0,.5),life:[[exG('vgRec','mussol',.3,.5),exG('pouRec','becClic',2,.4),exG('vgRec','mussol',3.1,.45)],[exG('pouRec','plomes',.3,.4),exG('vgRec','mussol',1.5,.5),exG('pouRec','alesPetites',3,.4)]]},
 cervol:{taste:exG('pouRec','cervol',0,.4,1.3),life:[[exG('pouRec','herba',.3,.36),exG('pouRec','cervol',1.4,.42),exG('pouRec','passesLleugeres',3.2,.36,1)],[exG('pouRec','mastega',.3,.4,1.2),exG('pouRec','cervol',2,.42),exG('pouRec','branca',3.4,.36)]]},
 erico:{taste:exG('pouRec','herba',0,.45),life:[[exG('pouRec','herba',.3,.45),exG('pouRec','falgueres',1.3,.4),exG('toonRec','plop',2.9,.4),exG('pouRec','herba',3.5,.4)],[exG('pouRec','herba',.3,.45),exG('pouRec','passesLleugeres',1.4,.36,1),exG('toonRec','boing',2.6,.24,.6),exG('pouRec','falgueres',3.3,.4)]]},
 guineu:{taste:exG('pouRec','passesNeu',0,.45,1.2),life:[[exG('pouRec','passesNeu',.2,.45,1.3),exG('masiaRec','whoosh',1.8,.36),exG('pouRec','cascadaNeu',2.2,.45),exG('pouRec','sacseja',3.4,.4)],[exG('pouRec','passesLleugeres',.2,.4,1.2),exG('masiaRec','whoosh',1.6,.36),exG('pouRec','herba',2.1,.4),exG('pouRec','sacseja',3.2,.4)]]},
 coet:{taste:exG('masiaRec','whoosh',0,.4),life:[[exG('fireRec','crackle',.2,.3,1.4),exG('fireRec','launch',1.4,.4),exG('masiaRec','whoosh',1.5,.4),exG('fireRec','shimmer',3.2,.3)],[exG('woodblockRec','claves',.4,.3),exG('woodblockRec','claves',.8,.3),exG('woodblockRec','claves',1.2,.3),exG('fireRec','launch',1.6,.4),exG('masiaRec','whoosh',1.7,.4)]]},
 astronauta:{taste:exG('pouRec','gegantRespira',0,.4,1.4),life:[[exG('pouRec','gegantRespira',.2,.4,2.4),exG('triangleRec','hit',2.6,.3),exG('pouRec','gegantRespira',3,.34,1.5)],[exG('pouRec','gegantRespira',.2,.4,2.4),exG('toonRec','clink',2.2,.36),exG('triangleRec','hit',3.4,.3)]]},
 planeta:{taste:null,life:[[exG('triangleRec','muted',.4,.3),exG('triangleRec','hit',2,.3),exG('triangleRec','muted',3.4,.26)],[exG('tamborRec','sonall',.4,.26),exG('triangleRec','hit',1.8,.3),exG('tamborRec','sonall2',3.2,.26)]]},
 alien:{taste:null,life:[[exG('toonRec','blub',.6,.4),exG('toonRec','blub',1.3,.4),exG('toonRec','blub',2,.4),exG('toonRec','hiccup',3.2,.4)],[exG('toonRec','inflate',.5,.36),exG('toonRec','blub',1.8,.4),exG('toonRec','blub',2.3,.4),exG('toonRec','squirt',3.3,.36)]]},
 cometa:{taste:exG('fireRec','shimmer',0,.4),life:[[exG('fireRec','shimmer',.3,.4),exG('masiaRec','whoosh',1.6,.38),exG('triangleRec','hit',3.2,.3)],[exG('masiaRec','whoosh',.4,.38),exG('fireRec','shimmer',1.2,.4),exG('triangleRec','muted',3.4,.3)]]}};
// The notes of the figures without a voice of their own: the planet rings, the alien sings on the kalimba.
const EX_NOTES={planeta:[exNote('vibRec',67,0,1.2,.4),exNote('vibRec',71,.35,1.2,.36),exNote('glockRec',86,.7,1.2,.3)],alien:[exNote('kalimbaRec',65,0,.5,.44),exNote('kalimbaRec',70,.22,.5,.44),exNote('kalimbaRec',67,.44,.6,.44)]};
// The taste in the tray: the voice of the figure (1 to 1.4 s) or its notes.
export function exTaste(id){const v=EX_VOICE[id];const out=[];if(v?.taste)out.push({inst:v.taste.inst,midi:[0],t:0,len:v.taste.len||1.3,vel:v.taste.gain,variant:v.taste.variant});
 for(const n of EX_NOTES[id]||[])out.push({...n});if(!out.length)out.push({inst:'woodblockRec',midi:[0],t:0,len:.2,vel:.32,variant:'claves'});return out;}
// The sounds of a pick: the «clac» and the gag of the figure (or the try and the hop back of a piece that does not fit); the final adds the
// gags of the four figures in turn through the party and the change of board.
export function exGagEvents(id,variant,final,correct,placed=[]){if(!correct)return EX_WRONG_SOUNDS.slice();const out=EX_CLAC.slice();const v=EX_VOICE[id];
 const life=(fig,vv,t0,gain=1)=>{const L=EX_VOICE[fig]?.life?.[vv]||[];for(const e of L)out.push({...e,t:t0+e.t,gain:e.gain*gain});for(const n of EX_NOTES[fig]||[])out.push({...n,inst:n.inst,t:t0+n.t,note:true});};
 life(id,variant,EX_FLY+.05);
 if(final){const all=[...placed,id];all.forEach((fig,i)=>{if(fig!==id)life(fig,(variant+i)%2,EX_FLY+1.8+i*2.2,.8);});life(id,1-variant,EX_FLY+7.4,.8);out.push(...exOutSounds(EX_FLY+EX_PARTY));}
 return out.sort((a,b)=>a.t-b.t);}
export function exGagPattern(id,variant,final,correct,placed=[]){const D=!correct?1.6:final?EX_FINAL:EX_STEP;return exGagEvents(id,variant,final,correct,placed).filter(e=>e.t<D-.1).map(e=>e.note?{inst:e.inst,midi:e.midi,at:e.t/D,length:Math.min(e.len,D-e.t)/D,vel:e.vel}:{inst:e.inst,midi:[0],at:e.t/D,length:Math.min(e.len||4,D-e.t)/D,vel:Math.min(1,e.gain*EX_GAG_LOUD),variant:e.variant});}
// The air of each world, by its light (natureRec loops): the waves of the port, the pigeons and the rain of the city, the birds and the
// wind of the forest, a very low wind in space. The circus has none: its band is enough.
export function exAmbience(world,light){const A=(name,level,lowpass=9000)=>({name,level,lowpass});
 if(world==='port')return [A('waves',light==='nit'?.2:.26,light==='nit'?3500:6000)];
 if(world==='ciutat')return light==='pluja'?[A('rain',.22,5000)]:light==='nit'?[A('crickets',.16,6000)]:[A('ptColoms',.22,7000)];
 if(world==='bosc')return light==='primavera'?[A('dawn',.26)]:light==='estiu'?[A('meadow',.22,7000),A('ptCigales',.18,6000)]:light==='tardor'?[A('wind',.16,2500),A('blackbird',.18,7000)]:[A('wind',.18,1800)];
 if(world==='espai')return [A('wind',.1,700)];return [];}
export const exVoiceOf=id=>EX_VOICE[id]||null;
export const exWorldPiece=id=>EX_PIECE[exWorldOf(id)];

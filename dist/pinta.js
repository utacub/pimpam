// Pinta el món (EN25), 0.38: the first exploration board of Pim Pam. A landscape drawn in ink fills the screen; the pupil paints its
// six zones (the sky, the background, the water, the trees, the village and the field) one by one, in any order, and every painted
// zone comes alive and adds its voice to the music. With the sixth, the whole page celebrates the season and the sheet turns to the
// next landscape. Twenty pages: five landscapes by four seasons. This module is the model (pages, zones, order, palettes, timings and
// the music); pinta-art.js draws, pinta-gl.js paints the watercolour.
import {SAMPLE_BANK} from './sampler.js';
export const PT_SHEET=Object.freeze([1280,800]);
export const PT_ZONES=Object.freeze(['cel','fons','aigua','arbres','poble','camp']);
// The five landscapes, with the word the voice says for each zone («Locució de les opcions»); nothing is ever written on the board.
export const PT_LANDS=Object.freeze([
 {id:'vall',name:'La vall',words:{cel:'el cel',fons:'les muntanyes',aigua:'el riu',arbres:'el bosc',poble:'el poble',camp:'els camps'}},
 {id:'costa',name:'La costa',words:{cel:'el cel',fons:'el far',aigua:'el mar',arbres:'els pins',poble:'el poble',camp:'la platja'}},
 {id:'muntanya',name:'L’alta muntanya',words:{cel:'el cel',fons:'els cims',aigua:'el torrent',arbres:'els avets',poble:'el poble',camp:'els prats'}},
 {id:'ciutat',name:'La ciutat vora el mar',words:{cel:'el cel',fons:'els turons',aigua:'el port',arbres:'el parc',poble:'les teulades',camp:'el passeig'}},
 {id:'llac',name:'El llac i els volcans',words:{cel:'el cel',fons:'els volcans',aigua:'el llac',arbres:'la fageda',poble:'el poble',camp:'els camps'}}].map(x=>Object.freeze(x)));
export const PT_SEASONS=Object.freeze(['primavera','estiu','tardor','hivern']);
// Round r paints landscape r mod 5 in season r mod 4: 5 and 4 share no divisor, so every pair comes once in twenty rounds and two rounds
// in a row share neither the landscape nor the season.
export const ptPage=round=>{const r=Math.max(0,round|0);return {land:r%5,season:r%4,round:r};};
// Seconds: the wash of a zone reaches its edge (the brush works until then), a step (one zone painted, then the scanning goes on), the
// final (the last zone, the season's finale and the turn of the page), and the turn of the page itself at the end of the final.
export const PT_PAINT=4.2,PT_STEP=6.4,PT_FINAL=16,PT_TURN=1.8;
// The order the zones join the scanning in a round: all six come round, from a different start and in a different direction each round.
export function ptOrder(round){const r=Math.max(0,round|0),start=(r*5+Math.floor(r/4))%6,dir=r%2?-1:1;return Array.from({length:6},(_,i)=>PT_ZONES[((start+i*dir)%6+6)%6]);}
// The zones offered now: the unpainted ones in the order of the round, up to «Opcions de contingut» (2, 3 or 4). When one is painted,
// the next unpainted one joins; with one left, it is offered alone.
export function ptOptions(state,n){const picked=new Set((state?.picks||[]).map(p=>p?.value??p?.id??p));const k=Math.max(1,Math.min(4,(n|0)||3));return ptOrder(state?.round).filter(z=>!picked.has(z)).slice(0,k);}
// The word of a zone (one word, no article: the labels are spoken or read by a screen reader, never written on the board).
export const ptWord=(land,zone)=>{const w=(PT_LANDS[land%5].words[zone]||zone).replace(/^(els|les|el|la|l’|l')\s*/,'');return w.charAt(0).toUpperCase()+w.slice(1);};
// ── Palettes ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Every zone of every landscape has its spring colours: the wash (col), the glaze that comes over it (glaze) and the accent layer
// (accent), as transmittances (1 is paper). fade: the wash thins along a direction (x, y, strength). The seasons change these colours
// by rule (ptPalette), so the same ink drawing is cerulean in spring and indigo in winter.
const ptC=(col,glaze,accent,fade=[0,0,0])=>({col,glaze,accent,fade});
const PT_PAL={
 vall:{cel:ptC([.44,.66,.88],[.88,.86,.94],[.62,.68,.82],[0,1,.6]),fons:ptC([.56,.58,.80],[.70,.74,.66],[.40,.42,.64],[0,1,.3]),aigua:ptC([.64,.81,.92],[.46,.68,.86],[.34,.54,.76],[0,-1,.3]),
  arbres:ptC([.50,.66,.34],[.30,.48,.26],[.42,.30,.18],[0,1,.25]),poble:ptC([.93,.82,.62],[.86,.70,.52],[.78,.42,.30],[0,1,.2]),camp:ptC([.90,.82,.48],[.66,.72,.34],[.84,.22,.16],[0,-1,.25])},
 costa:{cel:ptC([.52,.72,.90],[.92,.88,.90],[.66,.72,.84],[0,1,.6]),fons:ptC([.64,.58,.58],[.48,.44,.46],[.86,.30,.24],[0,1,.2]),aigua:ptC([.42,.68,.86],[.28,.52,.76],[.22,.42,.68],[0,-1,.35]),
  arbres:ptC([.36,.54,.36],[.24,.40,.28],[.46,.32,.20],[0,1,.2]),poble:ptC([.95,.93,.87],[.86,.86,.82],[.40,.60,.80],[0,1,.1]),camp:ptC([.94,.87,.66],[.86,.75,.54],[.90,.40,.30],[0,-1,.3])},
 muntanya:{cel:ptC([.40,.62,.90],[.86,.88,.96],[.60,.70,.86],[0,1,.6]),fons:ptC([.70,.72,.86],[.52,.56,.76],[.42,.44,.62],[0,1,.3]),aigua:ptC([.60,.78,.90],[.44,.64,.84],[.32,.50,.74],[0,-1,.3]),
  arbres:ptC([.28,.46,.36],[.18,.32,.26],[.40,.28,.18],[0,1,.2]),poble:ptC([.82,.76,.68],[.64,.58,.52],[.52,.46,.48],[0,1,.2]),camp:ptC([.64,.78,.42],[.46,.62,.32],[.82,.28,.22],[0,-1,.25])},
 ciutat:{cel:ptC([.56,.70,.86],[.94,.84,.78],[.68,.70,.80],[0,1,.6]),fons:ptC([.66,.72,.54],[.50,.58,.44],[.86,.36,.30],[0,1,.25]),aigua:ptC([.46,.62,.78],[.32,.48,.66],[.82,.36,.26],[0,-1,.3]),
  arbres:ptC([.56,.70,.42],[.36,.52,.30],[.88,.62,.26],[0,1,.2]),poble:ptC([.88,.68,.50],[.74,.50,.38],[.92,.92,.96],[0,1,.2]),camp:ptC([.88,.82,.72],[.72,.64,.56],[.26,.58,.48],[0,-1,.25])},
 llac:{cel:ptC([.62,.74,.88],[.92,.90,.92],[.72,.76,.86],[0,1,.55]),fons:ptC([.54,.50,.58],[.38,.36,.44],[.64,.62,.72],[0,1,.25]),aigua:ptC([.60,.76,.86],[.46,.62,.78],[.36,.48,.68],[0,-1,.25]),
  arbres:ptC([.58,.72,.38],[.36,.54,.28],[.48,.34,.20],[0,1,.2]),poble:ptC([.86,.78,.64],[.68,.58,.48],[.76,.46,.34],[0,1,.2]),camp:ptC([.92,.86,.78],[.74,.78,.46],[.90,.66,.30],[0,-1,.25])}};
const ptMix3=(a,b,t)=>a.map((x,i)=>x+(b[i]-x)*t);
const PT_EVERGREEN=new Set(['costa','muntanya']);
export function ptPalette(season,land,zone){const L=PT_LANDS[land%5].id,p=PT_PAL[L][zone];let col=p.col,glaze=p.glaze,accent=p.accent;const s=PT_SEASONS[season%4];
 if(s==='estiu'){ // a late afternoon that ends in a sunset: cobalt turning gold, ochre fields, darker greens, violet shadows
  if(zone==='cel'){col=ptMix3(col,[.34,.54,.86],.5);glaze=[.97,.92,.78];accent=[.86,.62,.62];}
  else if(zone==='fons'){col=ptMix3(col,[.52,.48,.72],.35);glaze=ptMix3(glaze,[.82,.58,.60],.5);}
  else if(zone==='aigua'){glaze=ptMix3(glaze,[.92,.74,.50],.45);}
  else if(zone==='arbres'){col=ptMix3(col,[.30,.46,.24],.45);glaze=ptMix3(glaze,[.18,.30,.18],.4);}
  else if(zone==='poble'){col=ptMix3(col,[.94,.80,.56],.3);glaze=ptMix3(glaze,[.90,.62,.40],.4);}
  else if(zone==='camp'){col=L==='costa'?ptMix3(col,[.96,.86,.58],.4):L==='ciutat'?ptMix3(col,[.90,.80,.62],.4):[.92,.74,.30];glaze=L==='ciutat'||L==='costa'?glaze:[.80,.58,.26];accent=L==='vall'||L==='llac'?[.98,.72,.18]:accent;}}
 else if(s==='tardor'){ // a golden afternoon with wind: pearl grey, ochres, burnt sienna, cherry reds, olive greens
  if(zone==='cel'){col=ptMix3(col,[.78,.78,.80],.65);glaze=[.92,.82,.68];accent=ptMix3(accent,[.62,.62,.66],.5);}
  else if(zone==='fons'){col=ptMix3(col,[.62,.56,.56],.35);glaze=ptMix3(glaze,[.74,.60,.48],.5);}
  else if(zone==='aigua'){col=ptMix3(col,[.62,.70,.74],.45);glaze=ptMix3(glaze,[.56,.60,.62],.4);}
  else if(zone==='arbres'){const k=PT_EVERGREEN.has(L)?.3:.85;col=ptMix3(col,[.88,.58,.26],k);glaze=ptMix3(glaze,[.70,.36,.18],k);accent=ptMix3(accent,[.64,.20,.14],k*.8);}
  else if(zone==='poble'){glaze=ptMix3(glaze,[.78,.58,.40],.4);}
  else if(zone==='camp'){col=ptMix3(col,[.82,.68,.38],.5);glaze=ptMix3(glaze,[.58,.56,.30],.5);accent=ptMix3(accent,[.64,.40,.20],.6);}}
 else if(s==='hivern'){ // a snowy evening: indigo and Prussian blue, snow left as paper, warm ochre lights in the windows
  const snow=[.86,.88,.94];
  if(zone==='cel'){col=[.40,.46,.70];glaze=[.28,.36,.62];accent=[.70,.74,.86];}
  else if(zone==='fons'){const k=L==='costa'?.35:L==='ciutat'?.6:.8;col=ptMix3(col,snow,k);glaze=ptMix3(glaze,[.58,.64,.82],.6);accent=ptMix3(accent,[.46,.52,.74],.5);}
  else if(zone==='aigua'){const k=L==='llac'?.8:.5;col=ptMix3(col,[.52,.60,.76],k);glaze=ptMix3(glaze,[.34,.44,.66],.5);accent=L==='llac'?[.80,.86,.94]:ptMix3(accent,[.40,.50,.70],.5);}
  else if(zone==='arbres'){const k=PT_EVERGREEN.has(L)?.35:.8;col=ptMix3(col,[.56,.56,.66],k);glaze=ptMix3(glaze,[.38,.42,.56],k);accent=[.88,.90,.96];}
  else if(zone==='poble'){col=ptMix3(col,[.80,.80,.88],.55);glaze=ptMix3(glaze,[.58,.60,.74],.5);accent=[.98,.80,.42];}
  else if(zone==='camp'){const k=L==='ciutat'?.5:L==='costa'?.45:.85;col=ptMix3(col,snow,k);glaze=ptMix3(glaze,[.72,.76,.88],.6);accent=ptMix3(accent,[.62,.66,.80],.7);}}
 return {col,glaze,accent,fade:p.fade};}
// The style chosen in the style tests (D: the washes of B with the line of A).
export const PT_STYLE=Object.freeze({dens:.78,edge:.9,gran:.26,bleed:0,grain:1,bloom:.5,glaze:1,warm:.35,ink:{width:1.1,tremor:.7,alpha:.92,gaps:0,pool:.5}});
export const ptEase=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
// The growth of a wash: a little faster at first (the water runs) and slow at the edge; with reduced motion, slower all through.
export function ptWash(T,still=false){const u=Math.max(0,Math.min(1,T/(PT_PAINT*(still?1.35:1))));return 1-Math.pow(1-u,1.7);}
// ── The music ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Four pieces, one per season, written so that the six voices sound well in any combination and in any order: they share a key, a
// tempo and the same eight-bar progression. Each zone painted adds its voice; the final brings in the whole and ends on plucked notes.
// Voices (zone → instrument): sky flute, background horn, water harp (the handpan joins it when its bank is ready), trees marimba and
// claves, village guitar (recorded VSCO instruments until the generated guitar is in), field plucked cellos and udu.
export const PT_LOUD=.92;
const PT_PIECES=[
 {name:'Dansa de primavera',root:62,mode:[0,2,4,5,7,9,11],bpm:108,beats:6,chords:[0,3,4,0,5,3,4,0]},  // D major, 6/8
 {name:'Tarda d’estiu',root:67,mode:[0,2,4,5,7,9,11],bpm:84,beats:4,chords:[0,5,3,4,0,5,3,4]},        // G major, 4/4
 {name:'Vals de tardor',root:69,mode:[0,2,3,5,7,9,10],bpm:108,beats:3,chords:[0,6,0,4,0,6,4,0]},      // A dorian, 3/4
 {name:'Neu d’hivern',root:65,mode:[0,2,4,5,7,9,11],bpm:72,beats:4,chords:[0,3,5,4,0,3,4,0]}];        // F major, 4/4
export const ptPiece=season=>PT_PIECES[season%4];
const ptFit=(inst,m)=>{const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;};
const ptDeg=(piece,d,oct=0)=>piece.root+piece.mode[((d%7)+7)%7]+12*(Math.floor(d/7)+oct);
const ptNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>ptFit(inst,m)),t,len,vel:Math.min(1,vel*PT_LOUD),...x});
// What each voice plays in a bar (chord degree ch): one pattern per voice per metre, in half beats; null is a rest.
function ptVoice(zone,piece,bar,ch,tb,beat,out,season,strong){const half=beat/2;
 if(zone==='cel'){const mel=piece.beats===6?[2,null,4,null,5,4,2,null,4,null,null,null]:piece.beats===3?[4,null,2,null,null,null]:[4,null,null,2,null,null,5,4];
  mel.forEach((d,i)=>{if(d===null)return;out.push(ptNote('fluteRec',ptDeg(piece,ch+d,1),tb+i*half,.42,.46+(i===0?.08:0)));});}
 else if(zone==='fons'){if(bar%2===0)out.push(ptNote('hornRec',ptDeg(piece,ch,-1),tb,beat*1.6,.34));if(bar%4===3)out.push(ptNote('hornRec',ptDeg(piece,ch+4,-1),tb+beat*2,beat*1.4,.3));}
 else if(zone==='aigua'){const arp=[0,2,4,7,4,2];for(let i=0;i<piece.beats*2;i++){const d=arp[i%6];out.push(ptNote('harpRec',ptDeg(piece,ch+d,0),tb+i*half,.9,.3+(i%2===0?.06:0)));}}
 else if(zone==='arbres'){const pat=piece.beats===6?[2,null,4,2,null,0,null,2,null,4,null,null]:piece.beats===3?[4,null,2,null,0,null]:[null,2,null,4,null,2,0,null];
  pat.forEach((d,i)=>{if(d===null)return;out.push(ptNote('marimbaRec',ptDeg(piece,ch+d,1),tb+i*half,.35,.42));});if(bar%2===1)out.push(ptNote('woodblockRec',[0],tb+beat*(piece.beats-1),.2,.28,{variant:'claves'}));}
 else if(zone==='poble'){out.push(ptNote('celliPizzRec',ptDeg(piece,ch,-2),tb,1,.5));out.push(ptNote('guitarRec',[ptDeg(piece,ch,-1),ptDeg(piece,ch+2,-1),ptDeg(piece,ch+4,-1)],tb+beat,.9,.3,{strum:.04}));if(piece.beats>3)out.push(ptNote('guitarRec',[ptDeg(piece,ch+2,-1),ptDeg(piece,ch+4,-1)],tb+beat*(piece.beats-1),.8,.26,{strum:.04}));}
 else if(zone==='camp'){for(let b=0;b<piece.beats;b++){if(b===0||b===Math.floor(piece.beats/2))out.push(ptNote('celliPizzRec',ptDeg(piece,ch+(b?4:0),-2),tb+b*beat,.8,.44));if(b%2===1)out.push(ptNote('uduRec',[b===1?47:52],tb+b*beat,.4,.34));}}}
// The score of a step (the zone just painted joins the voices already there, two bars) or of the final (the whole piece over all six
// voices, with the melody of the sky over it, and a cadence of plucked strings; it is all over well before the page turns).
export function ptScore(season,voices,final,round=0){const piece=ptPiece(season),beat=60/piece.bpm,barLen=beat*piece.beats,out=[],t0=.55;
 // As many whole bars as start before the end of the effect (the closing notes ring on while the page turns), 8 at most.
 const bars=final?Math.min(8,Math.max(1,Math.floor((PT_FINAL-PT_TURN-.3-t0)/barLen))):Math.max(1,Math.floor((PT_STEP-t0-.3)/barLen)),voicesNow=[...new Set(voices)];
 for(let bar=0;bar<bars;bar++){const tb=t0+bar*barLen,ch=piece.chords[(bar+(final?0:round*2))%8];for(const z of voicesNow)ptVoice(z,piece,bar,ch,tb,beat,out,season,bar===0);
  if(final&&!voicesNow.includes('cel'))ptVoice('cel',piece,bar,ch,tb,beat,out,season,false);}
 const end=t0+bars*barLen+.05;[0,2,4,7].forEach((d,i)=>out.push(ptNote('harpRec',ptDeg(piece,d,-1),end+i*.07,2,.46)));out.push(ptNote('celliPizzRec',ptDeg(piece,0,-2),end,1.4,.5));out.push(ptNote('glockRec',ptDeg(piece,4,2),end+.25,1.8,.32));
 return out.sort((a,b)=>a.t-b.t);}
// As playPatternAudio wants it: fractions of the effect.
export function ptPatternScore(season,voices,final,round=0){const D=final?PT_FINAL:PT_STEP;return ptScore(season,voices,final,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/D,length:n.len/D,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})})).filter(e=>e.at<1);}
// The taste of a zone in the focus: a short motif of its voice (the place sounds join once the generated bank is in).
export function ptTaste(zone,season,land){const piece=ptPiece(season),beat=60/piece.bpm,out=[];
 const inst={cel:'fluteRec',fons:'hornRec',aigua:'harpRec',arbres:'marimbaRec',poble:'guitarRec',camp:'celliPizzRec'}[zone]||'harpRec',oct={cel:1,fons:-1,aigua:0,arbres:1,poble:-1,camp:-2}[zone]||0;
 [0,2,4].forEach((d,i)=>out.push(ptNote(inst,ptDeg(piece,d,oct),i*beat*.5,inst==='fluteRec'?.35:inst==='hornRec'?.6:.8,.4)));return out;}

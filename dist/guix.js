// El meu espectacle de llum (EN22), 0.18: the child chooses the colour, the shape and the music of a fireworks show drawn in coloured
// chalk on a blackboard, and then watches it. There is no right answer. Three choices (two to four options each): the colour (gold and
// red, blue and white, green and violet, pink and yellow), the shape (palm, flower, spiral, waterfall) and the music (harp, band, marimba,
// plucked strings). The show lasts eleven seconds: eight rockets leave from the boat on the water, open one after another in the sky
// with the music, and a slow rain of gold closes it. Rounds change the place drawn on the blackboard (a bay, a mountain, a village
// square, a lake, a beach), the key, and where and when each rocket opens, so the same choices never make the same show.
import {SAMPLE_BANK} from './sampler.js';
export const GX_COLORS=Object.freeze([{id:'gold',word:'Or',cols:['#ffd25a','#ff6a50']},{id:'blue',word:'Blau',cols:['#7cc8ff','#f4f8ff']},{id:'green',word:'Verd',cols:['#8eea7a','#c79cff']},{id:'pink',word:'Rosa',cols:['#ff8fd0','#ffe98a']}].map(x=>Object.freeze(x)));
export const GX_SHAPES=Object.freeze([{id:'palm',word:'Palmera'},{id:'peony',word:'Flor'},{id:'spiral',word:'Espiral'},{id:'willow',word:'Cascada'}].map(x=>Object.freeze(x)));
export const GX_MUSIC=Object.freeze([{id:'harp',word:'Arpa'},{id:'band',word:'Banda'},{id:'marimba',word:'Marimba'},{id:'strings',word:'Cordes'}].map(x=>Object.freeze(x)));
export const GX_STAGES=Object.freeze([GX_COLORS,GX_SHAPES,GX_MUSIC]);
export const GX_PLACES=Object.freeze(['bay','mountain','square','lake','beach']);
// Seconds: the show, a choice that is not the last one (its rocket opens big), the rise of a rocket and how long a burst lasts (it draws
// itself in 0.5 s, holds and fades in 1 s: never faster than 0.3 s up and 0.6 s down).
export const GX_SHOW=11,GX_STEP=1.7,GX_RISE=.75,GX_DRAW=.5,GX_HOLD=1.1,GX_FADE=1;
// Loudness of the music against the other activities (measured on the review video, EBU R128), and of each music against the others.
export const GX_LOUD=.9;
const GX_MIX={harp:1,band:1.12,marimba:1,strings:.88};
const gxR=round=>Math.max(0,round|0);
export const gxPlace=round=>GX_PLACES[gxR(round)%5];
const gxRoot=round=>[60,62,65,57,64][gxR(round)%5];
const gxHash=(i,s)=>{let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
// A choice, as the scanning catalogue has it, or its id: the option of each stage, with the defaults of a show not chosen yet.
export function gxPicks(picks=[]){const id=(p,list,d)=>{const v=p?.value??p;return list.find(x=>x.id===v)?.id||d;};return {color:id(picks[0],GX_COLORS,'gold'),shape:id(picks[1],GX_SHAPES,'peony'),music:id(picks[2],GX_MUSIC,'harp')};}
export const gxColors=id=>(GX_COLORS.find(x=>x.id===id)||GX_COLORS[0]).cols;
// The rockets of a show: when each opens (s), where (x from 0 to 1 across, y from 0 at the top), how big (0 to 1) and in which of the
// two colours. Two bursts never start less than half a second apart (at most two a second).
export function gxShow(round){const r=gxR(round),times=[1.15,2.25,2.8,3.9,5,5.55,6.65,7.75],out=[];
 times.forEach((t,i)=>{const lane=[.5,.26,.74,.38,.62,.18,.82,.5][(i+r*3)%8],jx=(gxHash(i,r+11)-.5)*.08,y=.2+gxHash(i,r+17)*.18+(i===7?-.04:0);out.push({t,x:Math.max(.12,Math.min(.88,lane+jx)),y,size:i===7?1:.62+gxHash(i,r+23)*.3,col:i%2,seed:r*31+i});});
 return out;}
// The gold rain at the end: when it starts and how long it falls.
export const GX_RAIN=[8.5,2.4];
export function gxFit(inst,m){const b=SAMPLE_BANK[inst];if(!b?.pitched)return m;const ns=b.zones.map(z=>z[1]),lo=Math.min(...ns)-4,hi=Math.max(...ns)+4;while(m>hi)m-=12;while(m<lo)m+=12;return m;}
const GX_MAJ=[0,2,4,5,7,9,11];
const gxDeg=(root,d)=>root+GX_MAJ[((d%7)+7)%7]+12*Math.floor(d/7);
const gxNote=(inst,midi,t,len,vel,x={})=>({inst,midi:[].concat(midi).map(m=>gxFit(inst,m)),t,len,vel:inst==='fireRec'?vel:Math.min(1,vel*GX_LOUD),...x});
// The melody of the show (two bars of eight half beats, degrees of the major scale; null is a rest) and the chords under it.
const GX_TUNE=[[4,null,4,5,7,null,5,4],[2,null,2,4,5,4,2,null],[4,5,7,9,7,null,5,4],[2,4,2,1,0,null,null,null]],GX_CHORDS=[0,4,5,3];
const GX_BEAT=.53,GX_T0=.6;
// The music of a show (seconds from its start): the melody on the chosen instrument over its accompaniment, a soft firework sound at
// each launch and burst, and a last chord that rings out while the gold falls. Every note is plucked or struck, or short (the trumpet).
export function gxPiece(music,round){const r=gxR(round),root=gxRoot(r),out=[],mix=GX_MIX[music]||1,add=(inst,midi,t,len,vel,x)=>out.push(gxNote(inst,midi,t,len,inst==='fireRec'?vel:vel*mix,x));
 for(let bar=0;bar<4;bar++){const tb=GX_T0+bar*GX_BEAT*4,ch=GX_CHORDS[(bar+r)%4],tune=GX_TUNE[bar];
  tune.forEach((d,i)=>{if(d===null)return;const t=tb+i*GX_BEAT/2,m=gxDeg(root+12,d);
   if(music==='harp')add('harpRec',[m],t,1,.5);else if(music==='band')add('trumpetRec',[m],t,.24,.46);else if(music==='marimba')add('marimbaRec',[m],t,.6,.55);else add('violinsPizzRec',[m],t,.5,.6);});
  for(let q=0;q<4;q++){const t=tb+q*GX_BEAT,bass=gxDeg(root-24,ch),chord=[0,2,4].map(k=>gxDeg(root-12,ch+k));
   if(music==='harp'){add('celliPizzRec',[bass],t,.9,q%2?.36:.48);add('harpRec',chord,t+GX_BEAT/2,1,.3,{strum:.05});}
   else if(music==='band'){if(q%2===0)add('timpaniRec',[gxDeg(root-24,ch%7===4?4:0)],t,.9,.55);else add('snareRec',[0],t,.3,.32);add('glockRec',[chord[2]+24],t+GX_BEAT/2,.6,.2);}
   else if(music==='marimba'){add('marimbaRec',[bass+12],t,.5,.42);add('marimbaRec',chord.slice(1),t+GX_BEAT/2,.4,.3);if(q===0)add('triangleRec',[0],t,1,.4,{variant:'hit'});}
   else{add('celliPizzRec',[bass],t,.8,.5);add('violinsPizzRec',chord.slice(1),t+GX_BEAT/2,.4,.34);}}}
 // the fireworks: a soft launch and a bloom for each rocket, and the crackle of the gold rain
 for(const b of gxShow(r)){add('fireRec',[0],b.t-GX_RISE,.8,.16,{variant:'launch',pan:(b.x-.5)*1.2});add('fireRec',[0],b.t,1.2,.2,{variant:'bloom',pan:(b.x-.5)*1.2});}
 add('fireRec',[0],GX_RAIN[0],2.4,.16,{variant:'shimmer'});
 const end=GX_T0+16*GX_BEAT+.15;[0,2,4,7].forEach((d,i)=>add('harpRec',[gxDeg(root-12,d)],end+i*.06,2,.48));add('glockRec',[gxDeg(root+24,4)],end+.25,1.8,.36);add('celliPizzRec',[gxDeg(root-24,0)],end,1.4,.5);
 if(music==='band'){add('timpaniRec',[gxDeg(root-24,0)],end,1.4,.6);add('cymbalRec',[0],end+.02,2,.32,{variant:'soft'});}else if(music==='marimba')add('marimbaRec',[gxDeg(root,0),gxDeg(root,4)],end,1.2,.5);
 return out.sort((a,b)=>a.t-b.t);}
export function gxScore(music,round){return gxPiece(music,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/GX_SHOW,length:n.len/GX_SHOW,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{}),...(n.pan!==undefined?{pan:n.pan}:{})})).filter(e=>e.at<1);}
// The taste of an option in the focus (seconds): a glockenspiel note for a colour, two for a shape, and one second of its music for a
// music. The glockenspiel notes are short, so they are louder than the music to sound as present (review video, EBU R128 momentary).
export function gxTaste(stage,id,round=0){const root=gxRoot(round),i=Math.max(0,GX_STAGES[Math.min(2,stage)].findIndex(x=>x.id===id));
 if(stage===0)return [gxNote('glockRec',[gxDeg(root+24,[0,2,4,7][i])],0,1,.66)];
 if(stage===1)return [gxNote('glockRec',[gxDeg(root+24,[4,7,2,9][i])],0,.8,.63),gxNote('glockRec',[gxDeg(root+24,[7,11,4,7][i])],.22,1,.57)];
 const m=d=>gxDeg(root+12,d);
 if(id==='harp')return [gxNote('harpRec',[gxDeg(root-12,0),gxDeg(root-12,2),gxDeg(root-12,4),m(0)],0,1.1,.5,{strum:.08})];
 if(id==='band')return [gxNote('trumpetRec',[m(4)],0,.2,.44),gxNote('trumpetRec',[m(7)],.24,.26,.44),gxNote('timpaniRec',[gxDeg(root-24,0)],0,.8,.5)];
 if(id==='marimba')return [gxNote('marimbaRec',[m(0)],0,.5,.55),gxNote('marimbaRec',[m(2)],.18,.5,.52),gxNote('marimbaRec',[m(4)],.36,.6,.5)];
 return [gxNote('violinsPizzRec',[m(4)],0,.4,.58),gxNote('violinsPizzRec',[m(2)],.2,.4,.55),gxNote('celliPizzRec',[gxDeg(root-24,0)],0,.8,.5)];}
// A choice that is not the last one: its rocket opens big over the board, with a soft bloom and the glockenspiel.
export function gxStep(stage,id,round=0){return [gxNote('fireRec',[0],0,.7,.16,{variant:'launch'}),gxNote('fireRec',[0],GX_RISE*.8,1,.2,{variant:'bloom'}),...gxTaste(stage,id,round).map(n=>({...n,t:n.t+GX_RISE*.8}))];}
export function gxStepScore(stage,id,round){return gxStep(stage,id,round).map(n=>({inst:n.inst,midi:n.midi,at:n.t/GX_STEP,length:n.len/GX_STEP,vel:n.vel,...(n.variant?{variant:n.variant}:{}),...(n.strum?{strum:n.strum}:{})})).filter(e=>e.at<1);}

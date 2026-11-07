// Encaixos de fusta (EN12, 0.45): a painted wooden peg puzzle that fills the screen. Twenty boards (five worlds by four lights), four holes and
// a guest piece per board, a marked hole per round and the piece that fits it, chosen among the pieces of the tray; the piece flies in,
// «clac», comes alive; the fourth throws the party of the board and the next board slides in. Every sound comes from the banks already in the
// suite (no new recordings): the wood foley of the tambor and the woodblock, the voices of the figures, and a music per world that grows a
// voice with every piece placed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {EX_WORLDS,EX_FIGS,EX_LIGHTS,EX_BOARDS,EX_WORD,EX_FLY,EX_LIFE,EX_STEP,EX_PARTY,EX_OUT,EX_FINAL,EX_WRONG,exBoardOf,exVariant,exTarget,exOptions,exHelp,exTimes,exPace,exWorldOf} from '../dist/encaix.js';
import {EX_CLAC,EX_WRONG_SOUNDS,exScore,exPatternScore,exTaste,exGagEvents,exGagPattern,exAmbience} from '../dist/encaix-so.js';
import {EX_FIGURES,exFigure} from '../dist/encaix-figures.js';
import {exScene} from '../dist/encaix-mons.js';
import {exGeom,exSlots,exLayout,exBoard,exResult} from '../dist/encaix-art.js';
import {SCAN_ACTIVITIES,createScanState,scanChoices,scanContent,scanTarget,chooseScan,finishScan} from '../dist/scan-catalog.js';
import {renderScanActivity} from '../dist/scan-art.js';
import {escDecor} from '../dist/escenari.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
import {defaults,validateProfile} from '../dist/input.js';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
const names=bank=>new Set(SAMPLE_BANK[bank].zones.map(z=>z[9]));
const ALL=Object.values(EX_FIGS).flat();
const S=(o={})=>({...defaults,...o});
const stateAt=(round,stage,errors=0)=>{const B=exBoardOf(round);return {id:'encaix',round,stage,picks:B.order.slice(0,stage).map(value=>({value})),errors};};
// the mock of the tests of the decor: every call is counted and every coordinate must be finite
function ctx(){const calls=[],fills=[],gradient={addColorStop(){}};return new Proxy({calls,fills},{get(o,k){if(k in o)return o[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);if(k==='fillRect')fills.push(o.fillStyle);return k.startsWith('create')?gradient:undefined;};},set(o,k,v){o[k]=v;return true;}});}

test('EN12 is «Encaixos de fusta», guided, in the folder of relating; «Puzles que cobren vida» is gone from the code',()=>{
 const row=SCAN_ACTIVITIES.find(a=>a.id==='encaix');assert.ok(row);assert.equal(row.code,'EN12');assert.equal(row.name,'Encaixos de fusta');assert.equal(row.task,'guided');
 assert.ok(!SCAN_ACTIVITIES.some(a=>a.id==='puzzle'));
 const app=read('../dist/app.js');assert.match(app,/ids:\['sounds','sources','encaix'\]/);assert.doesNotMatch(app,/'puzzle'/);
 for(const f of ['../dist/scan-catalog.js','../dist/scan-art.js'])assert.doesNotMatch(read(f),/puzzle/,f);
 assert.match(read('../build_standalone.py'),/'encaix\.js','encaix-figures\.js','encaix-mons\.js','encaix-so\.js','encaix-art\.js'/);
 assert.match(app,/LOAD_HEAVY=\[[^\]]*'encaix'/);});

test('twenty boards: every world under each of its four lights once; four holes and a guest from the five figures of the world; the order of the holes is a tour of them',()=>{
 assert.equal(EX_BOARDS,20);assert.equal(EX_WORLDS.length,5);for(const w of EX_WORLDS){assert.equal(EX_FIGS[w].length,5);assert.equal(EX_LIGHTS[w].length,4);}
 const seen=new Set();for(let b=0;b<EX_BOARDS;b++){const B=exBoardOf(b);assert.equal(B.b,b);assert.equal(B.visit,0);seen.add(B.world+'|'+B.light);assert.ok(EX_LIGHTS[B.world].includes(B.light));
  assert.equal(B.holes.length,4);assert.ok(!B.holes.includes(B.guest));assert.deepEqual([...B.holes,B.guest].sort(),[...EX_FIGS[B.world]].sort());
  assert.deepEqual([...B.order].sort(),[...B.holes].sort());}
 assert.equal(seen.size,20);
 // after the twenty, the tour starts again: the same boards, the second gag of every figure
 const again=exBoardOf(23);assert.equal(again.b,3);assert.equal(again.visit,1);assert.equal(exVariant(23,0),1);assert.equal(exVariant(3,0),0);assert.equal(exVariant(3,1),1);
 // every figure is in the four boards of its world, as a hole or (at most once) as the guest; four of the five are the guest once
 for(const w of EX_WORLDS){let guests=0;for(const id of EX_FIGS[w]){let holes=0,guest=0;for(let b=0;b<EX_BOARDS;b++){const B=exBoardOf(b);if(B.holes.includes(id))holes++;if(B.guest===id)guest++;}assert.equal(holes+guest,4,id);assert.ok(guest<=1,id);guests+=guest;}assert.equal(guests,4,w);}
 for(const id of ALL)assert.match(EX_WORD[id],/^[A-ZÀ-Ú][a-zà-ú]+$/);});

test('the round: one marked hole, the piece that fits it among the pieces of the tray (two to four), the pieces placed left out, and the rest of the board before any stranger',()=>{
 for(let b=0;b<EX_BOARDS;b++){const B=exBoardOf(b);for(let stage=0;stage<4;stage++){const st=stateAt(b,stage),placed=B.order.slice(0,stage),target=exTarget(st,S());assert.equal(target,B.order[stage]);
  for(const n of [2,3,4]){const opts=exOptions(st,S({scanOptions:n}));assert.equal(opts.length,n,`board ${b} stage ${stage} n ${n}`);assert.equal(opts.filter(x=>x===target).length,1);assert.equal(new Set(opts).size,n);
   for(const p of placed)assert.ok(!opts.includes(p),'a piece placed is not offered again');
   const own=[...B.holes,B.guest].filter(id=>!placed.includes(id)),strangers=opts.filter(id=>exWorldOf(id)!==B.world);
   assert.equal(strangers.length,Math.max(0,n-own.length),`board ${b} stage ${stage}: a stranger only when the board and its guest are not enough`);}}}
 // «Semblants»: the tray favours the pieces of a shape like the target's; «Diferents», the ones unlike it; both keep the target
 let differ=0;for(let b=0;b<EX_BOARDS;b++){const st=stateAt(b,0),a=exOptions(st,S({exLike:'diferents'})),c=exOptions(st,S({exLike:'semblants'}));assert.ok(a.includes(exTarget(st,S()))&&c.includes(exTarget(st,S())));if(a.join()!==c.join())differ++;}
 assert.ok(differ>=10,`the similarity setting changes the tray (${differ} boards of 20)`);
 // the same round always offers the same tray (nothing changes under the pupil's eyes)
 assert.deepEqual(exOptions(stateAt(7,2),S()),exOptions(stateAt(7,2),S()));});

test('«Lliure»: no hole is marked, nothing is wrong, and the round ends with the fourth piece all the same',()=>{
 const s=S({exMode:'lliure'});for(let b=0;b<EX_BOARDS;b+=3){const st=stateAt(b,1);assert.equal(exTarget(st,s),null);const opts=exOptions(st,s);assert.equal(opts.length,3);assert.ok(opts.every(id=>!exBoardOf(b).order.slice(0,1).includes(id)));}
 const state=createScanState('encaix',s);for(let i=0;i<4;i++){const r=chooseScan(state,s,0);assert.ok(r.accepted&&state.pending.correct,'in lliure every piece fits');assert.equal(!!state.pending.final,i===3);finishScan(state,s);}
 assert.equal(state.round,1);assert.equal(state.picks.length,0);
 // guided: the wrong piece is refused with no change of stage, the errors are counted and the help comes after two (or three, or never)
 const g=S(),st=createScanState('encaix',g),target=scanTarget(st,g);assert.equal(target.id,exBoardOf(0).order[0]);
 const wrongIndex=scanChoices(st,g).findIndex(o=>o.id!==target.id);const r=chooseScan(st,g,wrongIndex);assert.ok(r.accepted&&!st.pending.correct);assert.equal(r.duration,EX_WRONG);finishScan(st,g);assert.equal(st.stage,0);assert.equal(st.errors,1);
 assert.equal(exHelp(st,g),false);st.errors=2;assert.equal(exHelp(st,g),true);assert.equal(exHelp(st,S({exHelp:'3'})),false);st.errors=3;assert.equal(exHelp(st,S({exHelp:'3'})),true);assert.equal(exHelp(st,S({exHelp:'mai'})),false);assert.equal(exHelp(st,S({exMode:'lliure'})),false);
 const right=scanChoices(st,g).findIndex(o=>o.id===target.id);chooseScan(st,g,right);assert.equal(st.pending.final,false);finishScan(st,g);assert.equal(st.stage,1);assert.equal(st.errors,0,'a piece that fits forgets the errors');
 // the fourth piece is the final of the board (the party), and the round moves on to the next board
 for(let i=1;i<4;i++){const t=scanTarget(st,g);chooseScan(st,g,scanChoices(st,g).findIndex(o=>o.id===t.id));assert.equal(!!st.pending.final,i===3);finishScan(st,g);}
 assert.equal(st.round,1);assert.equal(exBoardOf(st.round).world,'circ');
 // the content of the scanning: pieces with the name of the figure, never the words on the screen
 const content=scanContent(createScanState('encaix',g),g);assert.equal(content.length,3);for(const c of content){assert.equal(c.kind,'encaix');assert.equal(c.value,c.id);assert.equal(c.label,EX_WORD[c.id]);}});

test('the settings: mode, hint, similarity, help, glow and pace are validated; «Ritme calmat» stretches every time of the result by the same factor',()=>{
 assert.deepEqual([defaults.exMode,defaults.exHint,defaults.exLike,defaults.exHelp,defaults.exGlow,defaults.exPace],['encaixa','imatge','diferents','2',true,'normal']);
 const ok=validateProfile(S({exMode:'lliure',exHint:'silueta',exLike:'semblants',exHelp:'mai',exGlow:false,exPace:'calmat'}));assert.deepEqual([ok.exMode,ok.exHint,ok.exLike,ok.exHelp,ok.exGlow,ok.exPace],['lliure','silueta','semblants','mai',false,'calmat']);
 for(const bad of [{exMode:'x'},{exHint:'none'},{exLike:'igual'},{exHelp:'4'},{exHelp:2},{exGlow:'yes'},{exPace:'lent'}])assert.throws(()=>validateProfile(S(bad)),JSON.stringify(bad));
 assert.equal(EX_FINAL,EX_FLY+EX_PARTY+EX_OUT);assert.ok(EX_PARTY>=12&&EX_PARTY<=14);assert.equal(EX_WRONG,1.6);assert.ok(EX_LIFE>=4&&EX_LIFE<=6);
 assert.deepEqual(exTimes(S()),{wrong:EX_WRONG,final:EX_FINAL,step:EX_STEP});assert.equal(exPace(S({exPace:'calmat'})),.72);
 const calm=exTimes(S({exPace:'calmat'}));for(const k of ['wrong','final','step'])assert.ok(Math.abs(calm[k]*.72-exTimes(S())[k])<1e-9,k);
 assert.equal(chooseScan(Object.assign(createScanState('encaix',S({exPace:'calmat'})),{}),S({exPace:'calmat'}),0).duration,EX_STEP/.72);});

test('the 25 figures: parts on pivots, two gags each that keep every part finite and settle back to rest, and a hole in every scene of their world',()=>{
 assert.equal(Object.keys(EX_FIGURES).length,25);
 for(const id of ALL){const fig=exFigure(id);assert.equal(fig.id,id);assert.ok(fig.w>0&&fig.h>0&&fig.parts.length>=2,id);
  for(const p of fig.parts){assert.ok(p.n&&Array.isArray(p.pv)&&p.pv.length===2&&typeof p.paint==='function',`${id} ${p.n}`);}
  for(const v of [0,1])for(const party of [false,true]){let moved=false;for(let t=0;t<=EX_LIFE+.01;t+=.1){const A=fig.anim(t,v,{T:EX_LIFE,party,pace:1});assert.ok(A&&typeof A==='object',`${id} ${v} ${t}`);
    for(const [k,o] of Object.entries(A)){for(const key of ['r','x','y','s','a'])if(o[key]!==undefined)assert.ok(Number.isFinite(o[key]),`${id} ${v} t=${t.toFixed(1)} ${k}.${key}`);if(k!=='_'&&(Math.abs(o.r||0)>1e-3||Math.abs(o.x||0)>1e-3||Math.abs(o.y||0)>1e-3))moved=true;}}
   assert.ok(moved,`${id} gag ${v}: something moves`);}
  const w=exWorldOf(id);for(const light of EX_LIGHTS[w]){const sc=exScene(w,light);assert.ok(sc.holes[id],`${id} has a hole in ${w}/${light}`);const [x,y,k]=sc.holes[id];assert.ok(x>=170&&x<=1430&&y>=40&&y<=600&&k>.3&&k<=1.1,`${id} ${w}/${light}: inside the safe area`);}}
 // the twenty scenes: a palette, statics and slow movers, each with a sprite box, a pivot and a path
 for(let b=0;b<EX_BOARDS;b++){const B=exBoardOf(b),sc=exScene(B.world,B.light);assert.ok(typeof sc.statics==='function');assert.ok(sc.movers.length>=1,`${B.world}/${B.light}: something moves`);
  for(const mv of sc.movers){assert.ok(mv.w>0&&mv.h>0&&mv.pv&&typeof mv.paint==='function'&&typeof mv.path==='function',mv.id);for(const u of [0,.3,1])for(const t of [0,7.3]){const p=mv.path(u,t);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),`${mv.id} ${u} ${t}`);}}}});

test('the sound, from the banks of the suite: the «clac» and the refusal are wood; every voice and every gag event names a sample that exists and falls inside its effect',()=>{
 const bank=(e)=>{const b=SAMPLE_BANK[e.inst];assert.ok(b,`bank ${e.inst}`);if(!b.pitched&&e.variant)assert.ok(names(e.inst).has(e.variant),`${e.inst}/${e.variant}`);};
 for(const e of EX_CLAC){bank(e);assert.ok(e.t>=EX_FLY&&e.t<EX_FLY+.2&&['woodblockRec','tamborRec'].includes(e.inst));}
 for(const e of EX_WRONG_SOUNDS){bank(e);assert.ok(e.t>.5&&e.t<EX_WRONG&&e.gain<=.3);}
 for(const id of ALL){const taste=exTaste(id);assert.ok(taste.length>=1&&taste.length<=4,id);for(const n of taste){bank(n);assert.ok(n.t>=0&&n.t+n.len<=2&&n.vel>0&&n.vel<=1,`${id} taste`);}
  for(const v of [0,1])for(const final of [false,true]){const ev=exGagEvents(id,v,final,true,[]);assert.ok(ev.length>=4,`${id} ${v}`);for(let i=1;i<ev.length;i++)assert.ok(ev[i].t>=ev[i-1].t-1e-9,`${id}: in order`);
   for(const e of ev){bank(e);const g=e.note?e.vel:e.gain;assert.ok(e.t>=EX_FLY-1e-9&&g>0&&g<=(e.note?1:.85),`${id} ${e.inst} ${e.t}`);}
   const D=final?EX_FINAL:EX_STEP,pat=exGagPattern(id,v,final,true,[]);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0&&e.at+e.length<=1+1e-9&&e.inst),`${id} pattern`);assert.ok(pat.every(e=>e.at*D<D-.1));}
  const no=exGagEvents(id,0,false,false,[]);assert.deepEqual(no,EX_WRONG_SOUNDS);assert.ok(exGagPattern(id,0,false,false,[]).every(e=>e.at<1));}});

test('the music of every world: a voice more with every piece, the end plucked inside the effect, and the air of the scene from the nature loops',()=>{
 const nat=names('natureRec'),pt=names('pintaRec');
 for(const w of EX_WORLDS){let last=0;for(let k=1;k<=4;k++)for(const final of [false,true]){if(final&&k<4)continue;const sc=exScore(w,k,final,0),D=final?EX_FINAL:EX_STEP;assert.ok(sc.length>=6,`${w} ${k}`);
   for(const n of sc){assert.ok(SAMPLE_BANK[n.inst],`${w} ${n.inst}`);assert.ok(n.t>=0&&n.len>0&&n.t+n.len<D,`${w} k=${k} final=${final}: ${n.inst} ends at ${(n.t+n.len).toFixed(2)} of ${D}`);assert.ok(n.vel>0&&n.vel<=1);}
   if(!final){const insts=new Set(sc.map(n=>n.inst));assert.ok(insts.size>=last,`${w}: a voice more at ${k}`);last=insts.size;}
   const pat=exPatternScore(w,k,final,0);assert.equal(pat.length,sc.length);assert.ok(pat.every(e=>e.at>=0&&e.at<1&&e.length>0&&e.at+e.length<=1+1e-9));}
  assert.ok(new Set(exScore(w,4,true,0).map(n=>n.inst)).size>new Set(exScore(w,1,false,0).map(n=>n.inst)).size,`${w}: the board full has more voices than the first piece`);
  // the second visit of a board plays the tune another way, with the same instruments
  const a=exScore(w,2,false,0),b=exScore(w,2,false,20);assert.deepEqual([...new Set(a.map(n=>n.inst))].sort(),[...new Set(b.map(n=>n.inst))].sort());
  for(const light of EX_LIGHTS[w]){const air=exAmbience(w,light);assert.ok(air.length<=2);for(const x of air){assert.ok(nat.has(x.name)||pt.has(x.name),`${w}/${light} ${x.name}`);assert.ok(x.level>0&&x.level<=.3&&x.lowpass>=700,`${w}/${light} ${x.name} level`);}}}
 assert.equal(exAmbience('circ','final').length,0,'the circus has its band and no air');});

test('the geometry: the plank fills the stage, the scene keeps its safe area on every screen, the tray has one slot per piece and the boards paint outside a browser too',()=>{
 for(const [w,h] of [[1280,720],[1024,768],[1920,1080],[2560,1080],[800,600],[1280,1024],[1366,768]]){const G=exGeom(w,h,false);assert.ok(G.panel.w>0&&G.panel.h>0&&G.tray.h>=60,`${w}x${h}`);
  // the safe area of the scene (x 170–1430, y 40–600 of 1600×640) stays inside the panel
  const X=u=>G.ox+u*G.k,Y=v=>G.oy+v*G.k;assert.ok(X(170)>=G.panel.x-1&&X(1430)<=G.panel.x+G.panel.w+1&&Y(40)>=G.panel.y-1&&Y(600)<=G.panel.y+G.panel.h+1,`${w}x${h}: the safe area`);
  for(const n of [2,3,4]){const z=exSlots(G,n);assert.equal(z.length,n);for(const s of z)assert.ok(s.x>=G.tray.x&&s.x+s.w<=G.tray.x+G.tray.w+1&&s.y>=G.tray.y&&s.pts.length>=4,`${w}x${h} slot`);}}
 const st=createScanState('encaix',S()),content=scanContent(st,S()),zones=exLayout(st,content,1280,720);assert.equal(zones.length,3);assert.deepEqual(zones.map(z=>z.zone),content.map(c=>c.value));
 // the board at rest, the flight of a piece that fits, a refusal, the party, the slide of the boards, with and without the decor, with reduced motion: finite everywhere
 const item=SCAN_ACTIVITIES.find(a=>a.id==='encaix');const draw=(o,time,pending)=>{const s=S(o),state=createScanState('encaix',s);state.round=o.round||0;if(pending){state.pending=pending;state.status='effect';}
  const c=ctx();renderScanActivity(c,1280,720,'encaix',{item,scanState:state,time,focusedChoice:scanChoices(state,s)[0],board:{focus:0,lights:[1,.6,.6],clock:3.2}},s);return c;};
 const rest=draw({background:'full'},null),none=draw({background:'none',base:'black'},null),dim=draw({background:'dim',opacity:40},null);assert.ok(rest.calls.length>none.calls.length&&dim.calls.length>none.calls.length);assert.equal(none.fills[0],'#000000');
 const t0=exBoardOf(0).order[0],opt={id:t0,value:t0,label:EX_WORD[t0],kind:'encaix'};
 for(const time of [.3,.8,1.2,3,5.9])draw({},time,{option:opt,correct:true,final:false});
 const wrong=exBoardOf(0).order[1];for(const time of [.2,.5,.9,1.3,1.59])draw({},time,{option:{id:wrong,value:wrong,label:EX_WORD[wrong],kind:'encaix'},correct:false,final:false});
 for(const time of [.5,2,6,12.5,13.4,14.4]){draw({},time,{option:opt,correct:true,final:true});draw({reduced:true},time,{option:opt,correct:true,final:true});draw({background:'none',base:'white',exHint:'silueta',exGlow:false},time,{option:opt,correct:true,final:true});}
 for(let round=1;round<EX_BOARDS;round+=4)draw({round,exMode:'lliure'},null);
 // the card of the home screen
 const card=ctx();renderScanActivity(card,320,180,'encaix',{item,scanState:null,time:null},S({background:'none'}),true);assert.ok(card.calls.length>50);
 assert.ok(typeof exBoard==='function'&&typeof exResult==='function');assert.equal(escDecor(S({background:'none',base:'white'})).white,true);});

test('the «Informació» panel and the catalogue: twenty entries, one per board in order, with the name of the world and of its light',async()=>{
 const {SCENE_INFO,SCENE_INFO_HEAD}=await import('../dist/info-escenes.js');const {EX_WORLD_NAME,EX_LIGHT_NAME}=await import('../dist/encaix.js');
 assert.equal(SCENE_INFO.encaix.length,20);assert.ok(SCENE_INFO_HEAD.encaix.length>10);
 SCENE_INFO.encaix.forEach((e,b)=>{const B=exBoardOf(b);assert.equal(e.t,`${EX_WORLD_NAME[B.world]} · ${EX_LIGHT_NAME[B.light]}`);assert.equal(e.l.length,3);for(const id of B.holes)assert.ok(e.l[0].toLowerCase().includes(EX_WORD[id].toLowerCase().slice(0,4))||e.l[0].includes(id.slice(0,4)),`${b} ${id}`);});
 const act=read('../ACTIVITATS.md');assert.match(act,/\| EN12 \| Encaixos de fusta \|/);assert.doesNotMatch(act,/Puzles que cobren vida \| Correspondència guiada/);
 assert.match(read('../package.json'),/"version":\s*"0\.(4[5-9]|[5-9]\d)/);});

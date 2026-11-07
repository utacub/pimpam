// El viatge en globus (CE43, 0.43): the card, the dynamics of the height, the twenty journeys, the day, the music and the sounds.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {VG_CAUSE,VG_ROUTES,vgNext,vgJourney,vgNewFlight,vgPress,vgRelease,vgTick,vgBar,vgCoda,VG_MARK_SOUND,vgTotal,VG_LAND_AT,vgStart,vgBlocked,vgStatus} from '../dist/viatge.js';
import {SAMPLE_BANK} from '../dist/sampler.js';
const S={vgDay:'normal',interaction:'hold',waitCue:true,sound:true};
const run=(game,s,sec,dt=1/30)=>{for(let t=0;t<sec;t+=dt)vgTick(game,s,dt);};
test('the card: CE43, a hold activity with recorded sounds, in no other activity\'s place',()=>{assert.equal(VG_CAUSE.code,'CE43');assert.equal(VG_CAUSE.kind,'hold');assert.ok(VG_CAUSE.recorded&&VG_CAUSE.viatge);assert.equal(VG_CAUSE.type,'ce');});
test('twenty journeys: five routes by four seasons, the next one changes both and all twenty come in twenty landings',()=>{const seen=new Set();let v=0;for(let i=0;i<20;i++){seen.add(v);const a=vgJourney(v),b=vgJourney(vgNext(v));assert.notEqual(a.route,b.route);assert.notEqual(a.season,b.season);v=vgNext(v);}assert.equal(seen.size,20);
 for(const R of VG_ROUTES){assert.equal(R.marks.length,6);for(const id of R.marks)assert.ok(VG_MARK_SOUND[id],id);}});
test('holding climbs from the treetops to the clouds in about ten seconds; letting go sinks back in about twenty-four; a tap burns two seconds',()=>{
 const game={viatge:{...vgNewFlight(0,S),phase:'fly',a:0}};vgPress(game,S);let t=0;while(game.viatge.a<.9&&t<30){vgTick(game,S,1/30);t+=1/30;}assert.ok(t>8&&t<13,`climb ${t}`);
 run(game,S,4);vgRelease(game);t=0;while(game.viatge.a>.08&&t<60){vgTick(game,S,1/30);t+=1/30;}assert.ok(t>19&&t<30,`sink ${t}`);
 const g2={viatge:{...vgNewFlight(0,S),phase:'fly',a:.3}};vgPress(g2,S);run(g2,S,.2);vgRelease(g2);assert.ok(g2.viatge.burn);run(g2,S,1.5);assert.ok(g2.viatge.burn,'still burning at 1.7 s');run(g2,S,.6);assert.ok(!g2.viatge.burn,'off after 2 s');});
test('toggle: one press lights the burner, the next puts it out; while the switch is held a hold press is blocked',()=>{const T={...S,interaction:'toggle'},g={viatge:{...vgNewFlight(3,T),phase:'fly',a:.2}};
 vgPress(g,T);assert.ok(g.viatge.burn);run(g,T,3);vgPress(g,T);assert.ok(!g.viatge.burn);const h={viatge:{...vgNewFlight(3,S),phase:'fly',a:.2}};vgPress(h,S);assert.ok(vgBlocked(h,S));vgRelease(h);assert.ok(!vgBlocked(h,S));});
test('a whole day flown low: the six landmarks are passed, the balloon lands, waits and the next journey is asked for',()=>{const W={...S,waitCue:false},game={};vgStart(game,{...W,vgRoute:'costa',vgSeason:'tardor'});const f=game.viatge;assert.equal(f.v,6);
 run(game,W,vgTotal(W)/70*1.02+40,1/20);assert.equal(game.viatge.phase,'next');assert.equal(game.completed,1);assert.equal(f.marksDone.size,6);assert.ok(vgStatus(game,S).length>0);
 assert.ok(vgBlocked(game,S),'no press between journeys');});
test('the music: recorded instruments only, and every phrase and the coda end on a plucked or struck note',()=>{const ok=new Set(Object.keys(SAMPLE_BANK)),plucked=['harpRec','glockRec','celliPizzRec','violinsPizzRec','marimbaRec','vibRec','kalimbaRec'];
 for(let st=0;st<8;st++)for(const theme of [null,'up','down'])for(let n=0;n<4;n++){const bar=vgBar(n,{stage:st,a:.5,key:62,theme,night:st===6});for(const e of bar){assert.ok(ok.has(e.inst),e.inst);assert.ok(e.vel>0&&e.vel<=1);}
  if(bar.length){const last=bar.reduce((a,b)=>b.t>=a.t?b:a);assert.ok(plucked.includes(last.inst)||theme===null,`${st} ${theme}: ${last.inst}`);}}
 const coda=vgCoda(62),last=coda.reduce((a,b)=>b.t>=a.t?b:a);assert.ok(plucked.includes(last.inst));});
test('the sounds: every recording of vgRec on disk, normalised and credited with its prompt; every landmark sound exists',()=>{const B=SAMPLE_BANK.vgRec,root=new URL('../dist/assets/samples/',import.meta.url),cred=fs.readFileSync(new URL('CREDITS.md',root),'utf8');
 assert.equal(B.zones.length,20);for(const z of B.zones){assert.ok(fs.existsSync(new URL(z[0],root)),z[0]);assert.ok(cred.includes('`'+z[0]+'`'),z[0]);}
 for(const [bank,name] of Object.values(VG_MARK_SOUND))assert.ok(SAMPLE_BANK[bank].zones.some(z=>z[9]===name),`${bank} ${name}`);
 const loops=B.zones.filter(z=>z[7]!==null);assert.deepEqual(loops.map(z=>z[9]).sort(),['cremador','ventalt']);});
test('the model works without a document (no drawing at import)',()=>{assert.equal(typeof globalThis.document,'undefined');});

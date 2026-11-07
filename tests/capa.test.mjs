// The colour layer of the scanning focus (0.40, at Marc's request of 3 November 2026): besides the frame, the focus can carry a
// semi-transparent layer in the colour of the highlight over the whole inside of the frame, whole from the start or growing from left to
// right with the time of the option; the frame and the layer are independent (either, or both), and one of them is always there.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TL_RING,tlRing,tlFill,tlLayout} from '../dist/tauler.js';
import {defaults,validateProfile,scanRing,SCAN_COLORS} from '../dist/input.js';
const read=f=>fs.readFileSync(new URL(f,import.meta.url),'utf8');
// the mock records every call, with the alpha and colour of every fill and the width of every clip rectangle
function ctx(){const calls=[],fills=[],clips=[];let pendingRect=null;const o={calls,fills,clips,globalAlpha:1,fillStyle:'#000'};
 return new Proxy(o,{get(t,k){if(k in t)return t[k];return(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),`${k}: non-finite coordinate`);calls.push(k);
  if(k==='rect')pendingRect=args;if(k==='clip')clips.push(pendingRect?pendingRect[2]:null);if(k==='fill')fills.push({alpha:t.globalAlpha,color:t.fillStyle});return undefined;};},set(t,k,v){t[k]=v;return true;}});}
const pts=tlLayout('destinations',4,1280,720)[1].pts,xs=pts.map(p=>p[0]),width=Math.max(...xs)-Math.min(...xs);

test('the settings: no layer by default; the frame can be left out; a whole or a growing layer at 20 to 70 % opacity',()=>{
 assert.equal(defaults.scanFill,'none');assert.equal(defaults.scanFillAlpha,40);assert.equal(defaults.scanFrame,'progress');
 const s=validateProfile({...defaults,scanFrame:'none',scanFill:'grow',scanFillAlpha:55});assert.deepEqual([s.scanFrame,s.scanFill,s.scanFillAlpha],['none','grow',55]);
 for(const bad of [{scanFill:'half'},{scanFill:true},{scanFillAlpha:10},{scanFillAlpha:80},{scanFillAlpha:'40'}])assert.throws(()=>validateProfile({...defaults,...bad}),JSON.stringify(bad));
 // the focus is never invisible: no frame and no layer bring the frame back, whole
 const lost=validateProfile({...defaults,scanFrame:'none',scanFill:'none'});assert.equal(lost.scanFrame,'whole');
 const ring=scanRing(s);assert.deepEqual([ring.frame,ring.fill,ring.fillAlpha,ring.color],['none','grow',.55,SCAN_COLORS.orange]);
 assert.equal(scanRing(defaults).fill,'none');assert.equal(scanRing({...defaults,scanFillAlpha:undefined}).fillAlpha,.4);
 // an old profile (before 0.40) has neither key and keeps its frame with no layer
 const old={...defaults};delete old.scanFill;delete old.scanFillAlpha;const o=validateProfile(old);assert.deepEqual([o.scanFill,o.scanFillAlpha],['none',40]);});

test('on a board, the layer fills the zone in the colour of the highlight, under the frame or alone, whole or growing with the time',()=>{
 const style={...TL_RING,color:'#2fd36b',fill:'whole',fillAlpha:.5};
 const whole=ctx();tlRing(whole,pts,.3,1,1,style);assert.equal(whole.fills.length,1);assert.equal(whole.fills[0].color,'#2fd36b');assert.ok(Math.abs(whole.fills[0].alpha-.5)<1e-9);
 assert.ok(whole.calls.indexOf('fill')<whole.calls.indexOf('stroke'),'the layer goes under the frame');
 // with no frame only the layer is drawn
 const alone=ctx();tlRing(alone,pts,.3,1,1,{...style,frame:'none'});assert.equal(alone.calls.filter(k=>k==='stroke').length,0);assert.equal(alone.fills.length,1);
 // growing: a pale track over the whole zone, then the part of the time gone by, from the left edge
 const grow=ctx();tlRing(grow,pts,.3,1,1,{...style,fill:'grow'});assert.equal(grow.fills.length,2);assert.ok(Math.abs(grow.fills[0].alpha-.15)<1e-9,'the track at 30 % of the layer');
 assert.equal(grow.clips.length,1);assert.ok(Math.abs(grow.clips[0]-(width*.3+1))<1e-6,'the clip is 30 % of the zone wide');
 const start=ctx();tlFill(start,pts,0,1,{...style,fill:'grow'});assert.equal(start.fills.length,1,'at the start of an option only the track shows');
 // in step-by-step scanning (no time) the growing layer is whole
 const step=ctx();tlRing(step,pts,null,1,1,{...style,fill:'grow'});assert.equal(step.fills.length,1);assert.equal(step.clips.length,0);
 // the alpha of the board (a fading focus) scales the layer; no layer, nothing filled
 const half=ctx();tlRing(half,pts,.3,.5,1,style);assert.ok(Math.abs(half.fills[0].alpha-.25)<1e-9);
 const none=ctx();tlRing(none,pts,.3,1,1,TL_RING);assert.equal(none.fills.length,0);});

test('the cards, the commands, the menu and the sample of the settings carry the layer (CSS), and the settings offer it',()=>{
 const app=read('../dist/app.js'),css=read('../dist/style.css');
 assert.match(app,/const RING_SVG='<span class="ring-fill"/,'every scan card and command has a layer before its frame');
 for(const rule of ['.fill-on .scanned>.ring-fill{display:block}','.fill-grow .ring-fill::after{clip-path:inset(0 calc(100% - var(--ring-p,0)*1%) 0 0)}','.ring-none .scanned>.scan-ring{display:none}','.menu-fill-on .card.scan-target::after','.menu-ring-none .card.scan-target'])assert.ok(css.includes(rule),rule);
 for(const label of ['Sense marc','Capa de color','Sense capa','Sencera','Creix d’esquerra a dreta','Opacitat de la capa'])assert.ok(app.includes(label),label);
 // never both off from the settings: «Sense marc» with no layer turns the layer on, «Sense capa» with no frame brings the frame back
 assert.match(app,/scanFrame'&&v==='none'&&settings\.scanFill==='none'\)changeSetting\('scanFill','whole'\)/);assert.match(app,/scanFill'&&v==='none'&&settings\.scanFrame==='none'\)changeSetting\('scanFrame','whole'\)/);
 // the menu cards carry the time of the option for the growing layer
 assert.match(app,/el\.classList\.toggle\('scan-target',on\);if\(on\)el\.style\.setProperty\('--ring-p',p\)/);});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// 0.46 · Usuaris, the settings inside each activity and «Vídeo a poc a poc».
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const U=await import('../dist/usuaris.js');
const D=await import('../dist/persona-dades.js');
const P=await import('../dist/persona.js');
const E=await import('../dist/persona-editor.js');

test('the guest keeps the keys of always; a user has its own, and is only a name', ()=>{
 store.clear();assert.equal(U.usBoot(),U.US_GUEST);assert.equal(U.usKey('profile'),'pimpam-profile');assert.equal(U.usKey('common-bg'),'pimpam-common-bg');assert.equal(U.usName(),'Convidat');
 localStorage.setItem('pimpam-profile',JSON.stringify({name:'x',mode:2}));localStorage.setItem('pimpam-favorites','["kaleido"]');
 const a=U.usCreate('  Martina ',U.US_GUEST);assert.equal(a.name,'Martina');assert.match(a.id,/^u[a-z0-9]+$/);assert.deepEqual(Object.keys(a).sort(),['color','created','id','name']);
 assert.equal(JSON.parse(localStorage.getItem(U.usKey('profile',a.id))).mode,2,'copied from who plays');assert.equal(JSON.parse(localStorage.getItem(U.usKey('profile',a.id))).name,'Martina');
 assert.deepEqual(JSON.parse(localStorage.getItem(U.usKey('favorites',a.id))),['kaleido']);
 const b=U.usCreate('martina');assert.equal(b.name,'martina (2)','names are unique on the device');assert.equal(localStorage.getItem(U.usKey('profile',b.id)),null,'a user made without a copy starts from the defaults');
 assert.equal(U.usCreate('Convidat').name,'Convidat (2)');});
test('Pim Pam opens as the guest unless the device remembers the last user', ()=>{
 store.clear();const a=U.usCreate('Pau');assert.ok(U.usSwitch(a.id));assert.equal(U.usCurrent(),a.id);assert.equal(U.usBoot(),U.US_GUEST);
 U.usSetRemember(true);U.usSwitch(a.id);assert.equal(U.usBoot(),a.id);assert.ok(!U.usSwitch('nobody'));
 U.usDelete(a.id);assert.equal(U.usBoot(),U.US_GUEST);assert.equal([...store.keys()].filter(k=>k.includes(a.id)).length,0,'its data go with it');});
test('the record: only users keep it, it is capped, summed by activity and exported for a spreadsheet', ()=>{
 store.clear();U.usBoot();assert.equal(U.usLogAdd({t:1,id:'kaleido',d:30}),false,'the guest keeps no record');
 const a=U.usCreate('Laia');U.usSwitch(a.id);const t0=Date.UTC(2026,10,6,10);
 U.usLogAdd({t:t0,id:'kaleido',code:'CE21',name:'Caleidoscopi',type:'ce',d:61.4,n:12});U.usLogAdd({t:t0+6e4,id:'masia',code:'EN26',name:'Estiu; a "la" masia',type:'scan',d:200,n:30,p:5});U.usLogAdd({t:t0+9e4,id:'kaleido',code:'CE21',name:'Caleidoscopi',type:'ce',d:10,n:2,evil:'<x>'});
 const log=U.usLog();assert.equal(log.length,3);assert.ok(!('evil' in log[2]));const S=U.usSummary(log);assert.equal(S.sessions,3);assert.equal(S.time,271);assert.equal(S.presses,44);
 assert.equal(S.activities[0].id,'masia');assert.equal(S.activities[1].times,2);assert.equal(S.activities[1].d,71);
 const csv=U.usCsv(log,'Laia');assert.ok(csv.startsWith('﻿Usuari;Data'));assert.match(csv,/"Estiu; a ""la"" masia"/);assert.equal(csv.split('\r\n').length,4);
 for(let i=0;i<U.US_LOG_MAX+5;i++)U.usLogAdd({t:t0+i,id:'x',d:1});assert.equal(U.usLog().length,U.US_LOG_MAX);
 assert.equal(U.usDuration(42),'42 s');assert.equal(U.usDuration(125),'2 min 5 s');assert.equal(U.usDuration(3700),'1 h 01 min');});
test('a user goes out and comes back: the same id replaces its data and joins the records', ()=>{
 store.clear();U.usBoot();const a=U.usCreate('Nil');U.usSwitch(a.id);U.usWrite('profile',{mode:2,name:'Nil'});U.usLogAdd({t:5,id:'kaleido',d:4});
 const snap=JSON.parse(JSON.stringify(U.usSnapshot(a.id)));assert.equal(snap.data.profile.mode,2);assert.equal(snap.data.log.length,1);
 U.usLogAdd({t:9,id:'pinta',d:8});const back=U.usRestore({...snap,data:{...snap.data,profile:{mode:1},log:[...snap.data.log,{t:7,id:'masia',d:3}]}});
 assert.equal(back.replaced,true);assert.equal(U.usRead('profile',null,a.id).mode,1);assert.deepEqual(U.usLog(a.id).map(e=>e.t),[5,7,9]);
 U.usDelete(a.id);const again=U.usRestore(snap);assert.equal(again.replaced,false);assert.equal(again.user.id,a.id);assert.equal(U.usList().length,1);
 const other=U.usRestore({...snap,id:'uzzz',name:'Nil'});assert.equal(other.user.name,'Nil (2)');assert.throws(()=>U.usRestore(null));});
test('the personalised activities keep their owner and the pauses of «Vídeo a poc a poc»', ()=>{
 const a=D.pdClean({id:'pp-1',tpl:'video',owner:'uabc',pauseMode:'marks',pauseEvery:7,dark:'x',items:[{id:'i',media:'m',marks:[12,'3',3.04,0,-2,'x',12]}]});
 assert.equal(a.owner,'uabc');assert.equal(a.pauseMode,'marks');assert.equal(a.pauseEvery,5);assert.equal(a.dark,'mitja');assert.deepEqual(a.items[0].marks,[3,12]);
 assert.ok(!('owner' in D.pdClean({id:'pp-2',owner:'guest',items:[]})));assert.ok(D.PD_TEMPLATES.includes('video'));assert.deepEqual(Object.keys(P.PS_TEMPLATES),D.PD_TEMPLATES);
 assert.equal(P.PS_TEMPLATES.video.type,'ce');});
test('Vídeo a poc a poc stops every few seconds or at the marks, always at the end, never twice in 0.6 s', ()=>{
 assert.deepEqual(P.psVideoStops(20,{pauseMode:'every',pauseEvery:5}),[5,10,15,20]);
 assert.deepEqual(P.psVideoStops(20.3,{pauseMode:'every',pauseEvery:5}),[5,10,15,20.3]);
 assert.deepEqual(P.psVideoStops(4,{pauseMode:'every',pauseEvery:5}),[4]);
 assert.deepEqual(P.psVideoStops(30,{pauseMode:'marks'},{marks:[3,3.4,10,29.8,40]}),[3,10,30]);
 assert.deepEqual(P.psVideoStops(30,{pauseMode:'marks'},{}),[30]);assert.deepEqual(P.psVideoStops(0,{}),[]);
 assert.ok(P.psDarkOf({dark:'suau'})<P.psDarkOf({dark:'mitja'})&&P.psDarkOf({dark:'mitja'})<P.psDarkOf({dark:'fort'}));
 assert.deepEqual(E.peParseMarks('0:05, 0:12 1:02;7,5 hola 0:05'),[5,7,12,62]);assert.deepEqual(E.peParseMarks("0:03'5"),[3.5]);assert.equal(E.peMarkText(62.5),"1:02'5");assert.equal(E.peMarkText(5),'0:05');});
test('the settings of each activity are only in the menu inside it', ()=>{
 const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8'),line=name=>{const i=app.indexOf(`function ${name}(`);return app.slice(i,app.indexOf('\n',i));};
 const general=line('generalSettings'),scanning=line('scanSettings'),display=line('displaySettings');
 for(const key of ['farSpeed','tcWait','dbColor','kaleidoContrast','femShirt','ggCamera','vgRoute','exMode','repeatScene','dayMoments','interaction'])assert.ok(!general.includes(key),key+' left the general tab');
 assert.ok(!general.includes('femSettings')&&!general.includes('exSettings')&&!general.includes('vgSettings'));assert.ok(!scanning.includes('potPick')&&!scanning.includes('visualHint'));assert.ok(!display.includes('plainScene'));
 const act=app.slice(app.indexOf('function activitySettings('),app.indexOf('function activityPanel('));for(const key of ['farFields','tocFields','dbFields','kaleidoFields','femSettings','ggSettings','vgSettings','exSettings','dayMoments','potPick','visualHint','plainField','interactionField'])assert.ok(act.includes(key),key+' in the activity tab');
 assert.match(app,/\['activity','Aquesta activitat'\]/);assert.match(app,/modalTab=tab\|\|\(settingsHasActivity\(\)\?'activity':'general'\)/);
 assert.ok(!/localStorage/.test(app),'every key goes through the user');});

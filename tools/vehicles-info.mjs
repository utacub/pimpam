// El taller de vehicles (0.53; eighteen pieces per corner since 0.54; two corners since 0.56): the pictures of the «Informació» panel (the pieces on the bench, each room at its four lights) and of
// the home card (the finished family car on the bench), into production/info/. Rendered with three.js in headless Chromium (SwiftShader).
// Usage: node tools/vehicles-info.mjs  (then python3 production/info/make_info.py)
import {openVh} from './vehicles-frames.mjs';
import {VH_BODIES,VH_WHEELS,VH_TOPS,VH_CORNERS} from '../dist/vehicles.js';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),tmp=mkdtempSync(join(tmpdir(),'vehicles-info-'))+'/';
// {kind,round,picks,id (the option to show),t,flag}: a piece settled on the chassis at the end of its snap; the room in the ride or at the garage
const GO=2.6,START=3.1,RIDE=14,PARK=17.1;
// the eighteen pieces (0.54), each settled on the chassis at the end of its snap: a body on the bare chassis, wheels under a body, an accessory on a
// vehicle with four steps (so the accessory is a step, not the final); no round given: the first round that offers the piece is used
const SHOTS=[];
const WHEEL_ON={tacs:'familiar',primes:'curses',fusta:'autobus',amples:'escarabat',radis:'camioneta',tapacubs:'furgoneta',
 bessones:'bombers',erugues:'totterreny',balons:'furgo',ferro:'plataforma'};
const TOP_ON={baca:'familiar+tacs',remolc:'furgoneta+fusta',bandera:'curses+primes',sirena:'autobus+tapacubs',escala:'camioneta+radis',globus:'escarabat+amples',
 brac:'plataforma+bessones',cano:'bombers+erugues',campana:'ambulancia+balons',manega:'furgo+ferro'};
// the pieces of the sala sit on its own bodies (0.56); the shared wheels and accessories are shown on the sala's vehicles there
const WHEEL_ON_SALA={...WHEEL_ON,tacs:'totterreny',tapacubs:'policia'},TOP_ON_SALA={...TOP_ON,escala:'bombers+bessones',sirena:'policia+tapacubs'};
// each corner is shown as the first corner («Primer racó», flag sala), so its rounds are 0 to 3
for(const corner of VH_CORNERS){const flag=corner==='sala'?'sala':'',W=corner==='sala'?WHEEL_ON_SALA:WHEEL_ON,T=corner==='sala'?TOP_ON_SALA:TOP_ON;
 for(const id of VH_BODIES[corner])SHOTS.push({kind:'result',picks:'-',id,t:2.35,flag});
 for(const id of VH_WHEELS[corner])SHOTS.push({kind:'result',picks:W[id],id,t:2.35,flag});
 for(const id of VH_TOPS[corner])SHOTS.push({kind:'result',picks:T[id],id,t:2.35,flag:flag?'steps4,sala':'steps4'});
 if(corner==='habitacio')// the room at its four lights: morning on the ride with the balloon, afternoon with the roof box, dusk arriving with the trailer, night in the garage
  SHOTS.push({kind:'final',round:0,picks:'familiar+tacs',id:'globus',t:START+RIDE*.62,flag:`go=${GO},tranquila`},
   {kind:'final',round:1,picks:'autobus+fusta',id:'baca',t:START+RIDE*.42,flag:`go=${GO},tranquila`},
   {kind:'final',round:2,picks:'curses+primes',id:'remolc',t:START+RIDE*.9,flag:`go=${GO}`},
   {kind:'final',round:3,picks:'furgoneta+fusta',id:'remolc',t:PARK+1.6,flag:`go=${GO}`});
 else// the sala: morning crossing the books with the bell, afternoon under the table with the ladder, dusk watering the pot, night with the crane at the garage
  SHOTS.push({kind:'final',round:0,picks:'ambulancia+balons',id:'campana',t:START+RIDE*.3,flag:`go=${GO},sala`},
   {kind:'final',round:1,picks:'totterreny+tapacubs',id:'escala',t:START+RIDE*.6,flag:`go=${GO},tranquila,sala`},
   {kind:'final',round:2,picks:'bombers+erugues',id:'cano',t:START+RIDE*.5,flag:`go=${GO},tranquila,sala`},
   {kind:'final',round:3,picks:'plataforma+bessones',id:'brac',t:PARK+1.4,flag:`go=${GO},sala`});}

const {browser,page,errors}=await openVh(768,432,1);
console.log('load',await page.evaluate(()=>load()));
const paint=async(o)=>{for(const round of(o.round===undefined?[0,1,2,3]:[o.round])){const first=await page.evaluate(o=>paint(o),{...o,round,a:0});const a=first.ids.indexOf(o.id);if(a>=0)return page.evaluate(o=>paint(o),{...o,round,a});}throw new Error(`${o.id} is not offered${o.round===undefined?'':' at round '+o.round} with ${o.picks}`);};
const shot=async(o,file)=>{const r=await paint(o);writeFileSync(file,await page.locator('#c').screenshot({type:'png'}));return r;};
for(let i=0;i<SHOTS.length;i++){const o=SHOTS[i];const r=await shot({kind:o.kind,round:o.round,picks:o.picks,b:o.t,flag:o.flag||'',id:o.id},tmp+`vehicles_${String(i+1).padStart(2,'0')}.png`);console.log(i+1,o.id,r.kind,r.ms.toFixed(0)+'ms');}
await browser.close();
const card=await openVh(976,546,1);console.log('load',await card.page.evaluate(()=>load()));
{const o={kind:'result',round:1,picks:'familiar+tacs',b:2.35,flag:'steps4',id:'baca'};const first=await card.page.evaluate(o=>paint(o),{...o,a:0});await card.page.evaluate(o=>paint(o),{...o,a:first.ids.indexOf('baca')});writeFileSync(tmp+'card.png',await card.page.locator('#c').screenshot({type:'png'}));}
{const o={kind:'final',round:0,picks:'familiar+tacs',b:START+RIDE*.5,flag:`go=${GO}`};const first=await card.page.evaluate(o=>paint(o),{...o,a:0});await card.page.evaluate(o=>paint(o),{...o,a:first.ids.indexOf('globus')});writeFileSync(tmp+'card_ride.png',await card.page.locator('#c').screenshot({type:'png'}));}
await card.browser.close();
if(errors.length)console.log('ERRORS',errors);
if(process.env.KEEP)console.log('frames kept in',tmp);
execFileSync('python3',['-c',`
from PIL import Image
import os
d='${tmp}';out='${root}production/info/'
for i in range(1,${SHOTS.length+1}):
    im=Image.open(d+'vehicles_%02d.png'%i).convert('RGB').resize((384,216),Image.LANCZOS)
    q=84
    while True:
        im.save(out+'img/vehicles_%02d.jpg'%i,quality=q,optimize=True)
        if os.path.getsize(out+'img/vehicles_%02d.jpg'%i)<28500 or q<=60:break
        q-=4
im=Image.open(d+'card.png').convert('RGB').resize((488,273),Image.LANCZOS);im.save(out+'cards/vehicles.jpg',quality=84,optimize=True)
print('ok',[os.path.getsize(out+'img/vehicles_%02d.jpg'%i) for i in range(1,${SHOTS.length+1})],os.path.getsize(out+'cards/vehicles.jpg'))
`],{stdio:'inherit'});
if(!process.env.KEEP)rmSync(tmp,{recursive:true,force:true});

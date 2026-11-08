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
// the yard (0.57): its pieces on its own works vehicles
const WHEEL_ON_PATI={...WHEEL_ON,corrons:'piconadora',grans:'tractor',massisses:'carreto',gegants:'buldozer',tacs:'bolquet',erugues:'excavadora'},TOP_ON_PATI={...TOP_ON,pala:'excavadora+erugues',caixa:'bolquet+grans',tambor:'piconadora+corrons',cons:'carreto+massisses',remolc:'tractor+gegants',sirena:'buldozer+tacs'};
// the hallway (0.58): its pieces on its own train bodies (each body and wheel set is offered in the round the tool finds for the shot)
const WHEEL_ON_PASSADIS={...WHEEL_ON,pestanya:'mercaderies',bieles:'locomotora',vagoneta:'vago',faldons:'tramvia',fusta:'cua',radis:'maniobres'},TOP_ON_PASSADIS={...TOP_ON,xemeneia:'locomotora+bieles',xiulet:'tramvia+faldons',fanal:'vago+vagoneta',troncs:'mercaderies+vagoneta',campana:'cua+fusta',bandera:'maniobres+radis'};
// the bathroom (0.59): its pieces on its own water and air bodies
const WHEEL_ON_BANY={...WHEEL_ON,flotadors:'hidroavio',pales:'barca',salvavides:'submari',boies:'helicopter',amples:'avioneta',balons:'vapor'},TOP_ON_BANY={...TOP_ON,helix:'avioneta+amples',periscopi:'submari+boies',ancora:'barca+pales',bombolles:'hidroavio+salvavides',bandera:'vapor+balons',globus:'helicopter+boies'};
// each corner is shown as the first corner («Primer racó», flag sala), so its rounds are 0 to 3
for(const corner of VH_CORNERS){const flag=corner==='habitacio'?'':corner,W={habitacio:WHEEL_ON,sala:WHEEL_ON_SALA,pati:WHEEL_ON_PATI,passadis:WHEEL_ON_PASSADIS,bany:WHEEL_ON_BANY}[corner],T={habitacio:TOP_ON,sala:TOP_ON_SALA,pati:TOP_ON_PATI,passadis:TOP_ON_PASSADIS,bany:TOP_ON_BANY}[corner];
 for(const id of VH_BODIES[corner])SHOTS.push({kind:'result',picks:'-',id,t:2.35,flag});
 for(const id of VH_WHEELS[corner])SHOTS.push({kind:'result',picks:W[id],id,t:2.35,flag});
 for(const id of VH_TOPS[corner])SHOTS.push({kind:'result',picks:T[id],id,t:2.35,flag:flag?`steps4,${flag}`:'steps4'});
 if(corner==='habitacio')// the room at its four lights: morning on the ride with the balloon, afternoon with the roof box, dusk arriving with the trailer, night in the garage
  SHOTS.push({kind:'final',round:0,picks:'familiar+tacs',id:'globus',t:START+RIDE*.62,flag:`go=${GO},tranquila`},
   {kind:'final',round:1,picks:'autobus+fusta',id:'baca',t:START+RIDE*.42,flag:`go=${GO},tranquila`},
   {kind:'final',round:2,picks:'curses+primes',id:'remolc',t:START+RIDE*.9,flag:`go=${GO}`},
   {kind:'final',round:3,picks:'furgoneta+fusta',id:'remolc',t:PARK+1.6,flag:`go=${GO}`});
 else if(corner==='pati')// the yard (the tops a round offers: 0 tambor/cons/remolc/sirena, 1 +pala, 2 pala/caixa, 3 caixa/tambor): morning out of the pipe with the cones, afternoon digging in the sandpit, dusk tipping the box at the garage, night with the drum at the garage
  SHOTS.push({kind:'final',round:0,picks:'carreto+massisses',id:'cons',t:START+RIDE*.48,flag:`go=${GO},pati`},
   {kind:'final',round:1,picks:'excavadora+erugues',id:'pala',t:START+RIDE*.58,flag:`go=${GO},tranquila,pati`},
   {kind:'final',round:2,picks:'bolquet+grans',id:'caixa',t:PARK+1.5,flag:`go=${GO},tranquila,pati`},
   {kind:'final',round:3,picks:'piconadora+corrons',id:'tambor',t:PARK+1.4,flag:`go=${GO},pati`});
 else if(corner==='passadis')// the hallway (the tops a round offers: 0 fanal/troncs/campana/bandera, 1 troncs…xemeneia, 2 campana…xiulet, 3 bandera/xemeneia/xiulet/fanal): morning on the bridge, afternoon with the smoke, dusk whistling, night in the garage with the lantern lit
  SHOTS.push({kind:'final',round:0,picks:'tramvia+faldons',id:'campana',t:START+RIDE*.6,flag:`go=${GO},tranquila,passadis`},
   {kind:'final',round:1,picks:'maniobres+radis',id:'xemeneia',t:START+RIDE*.35,flag:`go=${GO},passadis`},
   {kind:'final',round:2,picks:'cua+pestanya',id:'xiulet',t:START+RIDE*.53,flag:`go=${GO},tranquila,passadis`},
   {kind:'final',round:3,picks:'locomotora+bieles',id:'fanal',t:PARK+1.4,flag:`go=${GO},passadis`});
 else if(corner==='bany')// the bathroom (the tops a round offers: 0 ancora/bombolles/bandera/globus, 1 bombolles…helix, 2 bandera…periscopi, 3 globus/helix/periscopi/ancora): morning blowing bubbles on the mat, afternoon with the propeller, dusk with the periscope up on the duckboard, night with the anchor down at the garage
  SHOTS.push({kind:'final',round:0,picks:'hidroavio+pales',id:'bombolles',t:START+RIDE*.5,flag:`go=${GO},tranquila,bany`},
   {kind:'final',round:1,picks:'avioneta+salvavides',id:'helix',t:START+RIDE*.4,flag:`go=${GO},bany`},
   {kind:'final',round:2,picks:'submari+flotadors',id:'periscopi',t:START+RIDE*.55,flag:`go=${GO},tranquila,bany`},
   {kind:'final',round:3,picks:'vapor+pales',id:'ancora',t:PARK+1.4,flag:`go=${GO},bany`});
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

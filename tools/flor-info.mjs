// La nova Flor de paper (0.51): the pictures of the «Informació» panel (one per flower, open on its garden, as «Una flor cada vegada»
// shows it) and of the home card (the meadow with three flowers open, as the card's preview), into production/info/.
// Usage: node tools/flor-info.mjs  (then python3 production/info/make_info.py)
import {openFp} from './flor-frames.mjs';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),tmp=mkdtempSync(join(tmpdir(),'flor-info-'))+'/';
const {browser,page,errors}=await openFp(768,432,1);
const shot=async(order,file)=>{await page.evaluate(o=>window.paint(o),order);writeFileSync(file,await page.locator('#c').screenshot({type:'png'}));};
const ALL=['rosella','margarida','girasol','blauet','nenufar','lotus','iris','cala','didalera','ciclamen','violeta','peonia','lluna','lliri','camelia','gessami','orquidia','hibisc','passiflora','strelitzia'];
for(let i=0;i<20;i++){const game={flor:{mode:'una',g:Math.floor(i/4),lap:0,n:4,opened:[60,null,null,null],count:1,phase:'rest',at:60,t:100,appear:0,wait:null,cues:[],single:i,prev:null,presses:1,done:1,seen:{}}};
 await shot({name:'i',scene:{s:{background:'full',waitCue:false},game}},tmp+`flower_${String(i+1).padStart(2,'0')}.png`);}
await browser.close();
const card=await openFp(976,546,1);await card.page.evaluate(o=>window.paint(o),{name:'c',scene:{s:{background:'full',waitCue:false},game:null,preview:true}});writeFileSync(tmp+'card.png',await card.page.locator('#c').screenshot({type:'png'}));await card.browser.close();
if(errors.length)console.log('ERRORS',errors);
execFileSync('python3',['-c',`
from PIL import Image
import os
d='${tmp}';out='${root}production/info/'
for i in range(1,21):
    im=Image.open(d+'flower_%02d.png'%i).convert('RGB').resize((384,216),Image.LANCZOS)
    q=84
    while True:
        im.save(out+'img/flower_%02d.jpg'%i,quality=q,optimize=True)
        if os.path.getsize(out+'img/flower_%02d.jpg'%i)<28500 or q<=60:break
        q-=4
im=Image.open(d+'card.png').convert('RGB').resize((488,273),Image.LANCZOS);im.save(out+'cards/flower.jpg',quality=84,optimize=True)
print('ok',[os.path.getsize(out+'img/flower_%02d.jpg'%i) for i in range(1,21)],os.path.getsize(out+'cards/flower.jpg'))
`],{stdio:'inherit'});
rmSync(tmp,{recursive:true,force:true});

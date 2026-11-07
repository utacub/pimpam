// Orientative flash audit for Caleidoscopi (CE21), Vitralls (CE22) or Natura (CE23), after the WCAG 2.2 definitions of general and red flash.
// Not a certified analyser (such as the Harding test): it renders every pattern frame by frame at 60 fps on a
// 1024×768 canvas, where WCAG takes 341×256 px as the 10° field at a typical viewing distance.
// Usage: node tools/flash-audit.mjs [output.md] [kaleido|vitrall|natura|piro]
import {openHarness,root} from './kaleido-harness.mjs';
import {writeFileSync} from 'node:fs';
const W=1024,H=768,FPS=60,CELL=8,COLS=W/CELL,ROWS=H/CELL,FIELD=[Math.round(341/CELL),Math.round(256/CELL)];
const COLL=process.argv[3]||'kaleido',out=process.argv[2]||root+(COLL==='vitrall'?'AUDITORIA_FLAIXOS_VITRALLS.md':COLL==='natura'?'AUDITORIA_FLAIXOS_NATURA.md':COLL==='piro'?'AUDITORIA_FLAIXOS_PIROMUSICAL.md':'AUDITORIA_FLAIXOS.md');
const {browser,page}=await openHarness(W,H);
// Per 8×8 cell (sampled every 2 px): mean relative luminance and WCAG red value; a transition is an opposing change
// of at least 0.1 luminance with the darker state below 0.8, or of at least 20 in the red value.
await page.addScriptTag({content:`
const LIN=new Float32Array(256).map((_,i)=>{const c=i/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4;});
// Controls that validate the detector: a full-screen 5 Hz black/white or red/black flicker must fail.
window.paintControl=o=>{const cv=document.getElementById('c'),c=cv.getContext('2d',{willReadFrequently:true});c.fillStyle=Math.floor(o.t*10)%2?(o.control==='red'?'#ff0000':'#ffffff'):'#000000';c.fillRect(0,0,cv.width,cv.height);return c;};
window.audit=(o,frames,fps)=>{const W=${W},H=${H},CELL=${CELL},COLS=${COLS},ROWS=${ROWS},N=COLS*ROWS;
 const lum=new Float32Array(N),red=new Float32Array(N),state=[...Array(N)].map(()=>({lo:null,hi:null,last:0,rlo:null,rhi:null,rlast:0}));
 const general=[...Array(N)].map(()=>[]),reds=[...Array(N)].map(()=>[]);let prevMean=null,maxMeanStep=0,maxCellStep=0,prev=null,peakMean=0;
 for(let f=0;f<frames;f++){const c=o.control?paintControl({...o,t:f/fps}):paint({...o,t:f/fps});const d=c.getImageData(0,0,W,H).data;lum.fill(0);red.fill(0);
  for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4,r=d[i],g=d[i+1],b=d[i+2],k=((y/CELL)|0)*COLS+((x/CELL)|0);lum[k]+=.2126*LIN[r]+.7152*LIN[g]+.0722*LIN[b];const s=r+g+b;if(s>0&&r/s>=.8)red[k]+=Math.max(0,(r-g-b)/255)*320;}
  const per=(CELL/2)*(CELL/2);let mean=0;
  for(let k=0;k<N;k++){const L=lum[k]/per,R=red[k]/per,st=state[k];mean+=L;
   if(prev){maxCellStep=Math.max(maxCellStep,Math.abs(L-prev[k]));}
   if(st.lo===null){st.lo=st.hi=L;st.rlo=st.rhi=R;}
   st.lo=Math.min(st.lo,L);st.hi=Math.max(st.hi,L);
   if(st.last!==1&&L-st.lo>=.1&&st.lo<.8){general[k].push(f);st.last=1;st.lo=st.hi=L;}
   else if(st.last!==-1&&st.hi-L>=.1&&L<.8){general[k].push(f);st.last=-1;st.lo=st.hi=L;}
   st.rlo=Math.min(st.rlo,R);st.rhi=Math.max(st.rhi,R);
   if(st.rlast!==1&&R-st.rlo>=20){reds[k].push(f);st.rlast=1;st.rlo=st.rhi=R;}
   else if(st.rlast!==-1&&st.rhi-R>=20){reds[k].push(f);st.rlast=-1;st.rlo=st.rhi=R;}}
  mean/=N;peakMean=Math.max(peakMean,mean);if(prevMean!==null)maxMeanStep=Math.max(maxMeanStep,Math.abs(mean-prevMean));prevMean=mean;prev=Float32Array.from(lum,v=>v/per);}
 const sparse=a=>a.map((t,k)=>t.length?[k,t]:null).filter(Boolean);
 return {general:sparse(general),red:sparse(reds),maxMeanStep,maxCellStep,peakMean};
};`});
// More than three flashes (seven or more transitions) within one second, over more than 25% of any 10° field.
function evaluate(list,frames){const counts=new Map(list),transitions=new Uint16Array(COLS*ROWS);let worstCell=0,worstCellAt=null,worstArea=0,worstAt=null;
 for(const [k,t] of list)transitions[k]=t.length;
 for(let start=0;start<frames;start+=3){const grid=new Uint8Array(COLS*ROWS);for(const [k,t] of counts){const n=t.filter(f=>f>=start&&f<start+FPS).length;if(n>worstCell){worstCell=n;worstCellAt=start/FPS;}if(n>=7)grid[k]=1;}
  const sum=new Uint32Array((COLS+1)*(ROWS+1));for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)sum[(y+1)*(COLS+1)+x+1]=grid[y*COLS+x]+sum[y*(COLS+1)+x+1]+sum[(y+1)*(COLS+1)+x]-sum[y*(COLS+1)+x];
  const [fw,fh]=FIELD;for(let y=0;y+fh<=ROWS;y++)for(let x=0;x+fw<=COLS;x++){const a=sum[(y+fh)*(COLS+1)+x+fw]-sum[y*(COLS+1)+x+fw]-sum[(y+fh)*(COLS+1)+x]+sum[y*(COLS+1)+x];const area=a/(fw*fh);if(area>worstArea){worstArea=area;worstAt=start/FPS;}}}
 return {worstCell,worstCellAt,worstArea,worstAt,cells:list.length};}
const K=await page.evaluate(name=>{const C=COLLECTION(name);return {patterns:C.patterns,min:C.min,code:C.code};},COLL);
const controls=[];
for(const control of ['white','red']){const frames=2*FPS,r=await page.evaluate(({o,frames,fps})=>audit(o,frames,fps),{o:{control},frames,fps:FPS});controls.push({control,g:evaluate(r.general,frames),red:evaluate(r.red,frames)});}
const detectorOk=controls[0].g.worstArea>.25&&controls[1].red.worstArea>.25;
console.log('Detector validat amb els controls:',detectorOk);
const rows=[];
for(let index=0;index<K.patterns.length;index++)for(const seed of [0,1,2])for(const reduced of [false,true]){
 const duration=K.min,frames=Math.ceil(duration*FPS)+1;
 const r=await page.evaluate(({o,frames,fps})=>audit(o,frames,fps),{o:{index,seed,reduced,duration,collection:COLL},frames,fps:FPS});
 const g=evaluate(r.general,frames),red=evaluate(r.red,frames);
 rows.push({pattern:K.patterns[index].name,plan:K.patterns[index].plan,seed,reduced,g,red,maxMeanStep:r.maxMeanStep,maxCellStep:r.maxCellStep,peakMean:r.peakMean,pass:g.worstArea<=.25&&red.worstArea<=.25});
 process.stdout.write(`${K.patterns[index].name} · ronda ${seed} · ${reduced?'reduït':'normal'}: ${rows.at(-1).pass?'sense incidències':'REVISAR'}\n`);
}
await browser.close();
const pct=x=>(x*100).toFixed(1)+' %',f3=x=>x.toFixed(3);
const md=`# Auditoria orientativa de flaixos · ${COLL==='vitrall'?'Vitralls':COLL==='natura'?'Natura':COLL==='piro'?'Piromusical':'Caleidoscopi'} (${K.code})

Generat per \`tools/flash-audit.mjs\` el ${new Date().toISOString().slice(0,10)}. Durada analitzada: ${K.min} s per patró (la mínima, és a dir, la més ràpida), a ${FPS} fotogrames per segon, en un llenç de ${W}×${H} px.

**Mètode.** Adaptació dels criteris de flaix general i de flaix vermell de WCAG 2.2 (criteri 2.3.1). Per a cada cel·la de ${CELL}×${CELL} px es calcula la lluminància relativa mitjana i el valor de vermell saturat. Es compta una transició quan hi ha un canvi oposat d'almenys 0,1 de lluminància (amb l'estat fosc per sota de 0,8), o d'almenys 20 en el valor de vermell. Una cel·la es marca si té set transicions o més (més de tres flaixos) dins d'un segon. Després es busca el pitjor camp de 10° (341×256 px), i el criteri falla si més del 25 % d'aquest camp està marcat.

**Límits.** És una comprovació d'enginyeria, no una certificació. No substitueix una eina reconeguda (per exemple, el Harding Test), no analitza el risc dels patrons espacials regulars (bandes o reixes) i no té en compte la mida real de la pantalla ni la distància de visió de cada infant.

## Validació del detector

Abans d'analitzar els patrons, el mateix detector s'aplica a dos controls que han de fallar: una pantalla completa que alterna negre i blanc a 5 Hz, i una altra que alterna negre i vermell saturat a 5 Hz.

| Control | Pitjor àrea de flaix general | Pitjor àrea de flaix vermell | Detectat |
|---|---|---|---|
${controls.map(c=>`| ${c.control==='white'?'Negre/blanc a 5 Hz':'Negre/vermell a 5 Hz'} | ${pct(c.g.worstArea)} | ${pct(c.red.worstArea)} | ${(c.control==='white'?c.g.worstArea:c.red.worstArea)>.25?'Sí':'**No**'} |`).join('\n')}

## Patrons

| Patró (núm. del pla) | Ronda | Moviment | Màx. transicions d'una cel·la en 1 s (moment) | Pitjor àrea de flaix general | Pitjor àrea de flaix vermell | Salt màx. de lluminància mitjana entre fotogrames | Resultat |
|---|---|---|---|---|---|---|---|
${rows.map(r=>`| ${r.pattern} (${r.plan}) | ${r.seed} | ${r.reduced?'reduït':'normal'} | ${r.g.worstCell} (${r.g.worstCellAt.toFixed(2)} s) | ${pct(r.g.worstArea)} | ${pct(r.red.worstArea)} | ${f3(r.maxMeanStep)} | ${r.pass?'Sense incidències':'**Revisar**'} |`).join('\n')}

Llindar per marcar una cel·la: 7 transicions en 1 s. Llindar d'àrea: 25 % del camp de 10°. La columna «moment» indica l'inici de la finestra d'1 s amb més transicions en una sola cel·la.
`;
writeFileSync(out,md);console.log('\n'+out);

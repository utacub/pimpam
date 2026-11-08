// La nova Pluja de colors (CE45, 0.55) · the picture: the floor of liquid paint (pluja-gl.js) brought to the time of the activity each
// frame, the drops of each press placed where the paint really lies, and the picture copied into the canvas of the app.
// Marc, 8 November 2026: «Aquesta activitat no ha de tenir l'opció d'eliminar o atenuar fons, sempre serà igual»: the black floor and
// its lights are always the same (the settings of the decor and the base do not apply), and «de moment no busquis alternatives a
// WebGL»: without WebGL2 the screen stays black and the help says why.
// Where a phrase falls (criteria of design, tuned in the style trial of phase 1): before each press the coverage of the floor is read
// back (pljCoverage, a 48 × 27 grid of the screen). The first press falls in the middle, every drop inside the one before (a target:
// rings that the liquid turns into bands). Then each phrase falls where the paint meets the black, turning around the middle, as a
// target, a chain along the edge or a pair of centres taking turns; once a third of the screen or less is black, it falls inside the
// black holes. The paint of a phrase is the black that is left divided by the presses left. The last press drops into the biggest holes,
// and then the paint flows on into the black that is left until the floor is full.
import {PLJ,PLJ_LOOK,pljSetup,pljPalette,pljClear,pljDrop,pljAdvance,pljRender,pljDilute,pljCoverage,pljFill,pljScreenToFloor,pljFloorToClip,pljPrograms_list,pljSettle,pljReady} from './pluja-gl.js';
import {glLoadShare,glAdapt} from './carrega.js';
import {escWaitClock,ESC_WAIT_START} from './escenari.js';
import {PJ_SCENES} from './pluja-escenes.js';
import {pjScene} from './pluja-colors.js';
const PJR={st:{scale:1,ema:16,slow:0,fast:0,last:0},F:null,scene:-1,top:null,sent:new Set(),dyeH:0,grid:null,fixed:0};
// the loading cover: the programs, compiled together (1 without WebGL2: the activity then only plays its notes)
export function pjLoad(){if(typeof document==='undefined')return 1;const list=pljPrograms_list();if(!list.length)return 1;return glLoadShare(PLJ.gl,list,PLJ.par,pljSettle);}
// from the home page, where the browser compiles in the background
export function pjPrewarm(){if(typeof document==='undefined'||!pljReady()||!PLJ.par)return false;pljPrograms_list();return true;}
export const pjGlFailed=()=>typeof document!=='undefined'&&!pljReady();
// for the review tools: a fixed scale of the picture
export function pjFixedScale(k,dyeH=0){PJR.fixed=k||0;if(dyeH)PJR.dyeH=dyeH;}
// the liquid: «Moviment del líquid» and «Moviment reduït»
export function pjLookFor(s){const f=s?.pjFlow||'lent',o={};
 if(f==='quiet'){o.drift=0;o.swirl=.06;o.rim=.03;}else if(f==='viu'){o.drift=.07;o.swirl=.18;o.damp=1;}
 if(s?.reduced){o.drift=0;o.swirl=Math.min(o.swirl??PLJ_LOOK.swirl,.05);o.rim=.02;o.ripAmp=.025;}return o;}

// ── Where the drops fall ────────────────────────────────────────────────────────────────────────────────────────────────────
const PJ_G=48,PJ_GH=27;
function pjGrid(V){const key=[V.top,V.W,V.H,V.AR.toFixed(4)].join();if(PJR.grid?.key===key)return PJR.grid;const S2F=[];
 for(let j=0;j<PJ_GH;j++)for(let i=0;i<PJ_G;i++)S2F.push(pljScreenToFloor(V,(i+.5)/PJ_G,(j+.5)/PJ_GH));
 PJR.grid={key,S2F,vis:null,top:V.top?0:3};return PJR.grid;}
// the state of the floor: the black share of the screen (the top rows fade into the dark far away and do not count in perspective)
function pjState(V,Gd){const cv=pljCoverage(5);if(!cv)return null;const {S2F}=Gd,G=PJ_G,Hs=PJ_GH;
 const sc=new Float32Array(G*Hs),ink=new Int8Array(G*Hs).fill(-1);S2F.forEach((f,i)=>{if(!f){sc[i]=1;return;}const x=Math.min(cv.w-1,Math.max(0,Math.floor(f[0]/V.AR*cv.w))),y=Math.min(cv.h-1,Math.max(0,Math.floor(f[1]*cv.h)));sc[i]=cv.c[y*cv.w+x];ink[i]=cv.c[y*cv.w+x]>=.5?cv.ink[y*cv.w+x]:-1;});
 let bn=0,nn=0;for(let j=Gd.top;j<Hs;j++)for(let i=0;i<G;i++){if(!S2F[j*G+i])continue;nn++;if(sc[j*G+i]<.5)bn++;}
 return {sc,ink,bs:bn/Math.max(1,nn),cells:nn};}
// the floor area of one screen cell around cell (i, j)
function pjCellArea(Gd,i,j){const G=PJ_G,S2F=Gd.S2F,i2=Math.min(G-1,i+1),i1=i2-1,j2=Math.max(0,j-1),j1=j2+1,a=S2F[j*G+i1],b=S2F[j*G+i2],c=S2F[j2*G+i],d=S2F[j1*G+i];if(!a||!b||!c||!d)return 1e-4;return Math.abs(b[0]-a[0])*Math.abs(c[1]-d[1]);}
// the black cell farthest from the paint
function pjFar(Gd,sc){const G=PJ_G,Hs=PJ_GH;let best=null;for(let j=Gd.top;j<Hs;j++)for(let i=0;i<G;i++){if(sc[j*G+i]>=.5||!Gd.S2F[j*G+i])continue;let d=99;
  for(let q=-10;q<=10;q++)for(let r=-10;r<=10;r++){const ii=i+r,jj=j+q;if(ii<0||jj<0||ii>=G||jj>=Hs)continue;if(sc[jj*G+ii]>=.5){const dd=Math.hypot(r,q);if(dd<d)d=dd;}}
  if(!best||d>best.d)best={d,i,j};}return best;}
const pjShapes=['diana','cadena','diana','parella','diana','cadena','diana','parella','cadena'];
// Places the drops of phrase ph (all at once, at its first frame): x, y (floor), R, under (the colour below), seed, size, sx (screen).
function pjPlace(F,ph){const V=PLJ.view,Gd=pjGrid(V),G=PJ_G,Hs=PJ_GH,ds=F.drops.filter(d=>d.ph===ph.id).sort((a,b)=>a.i-b.i);ph.placed=true;if(!ds.length)return;
 let seed=(ph.id*7919+F.scene*104729+(F.seed||0))%2147483647||7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const st=pjState(V,Gd);const S2F=Gd.S2F;
 const put=(d,f,R,under)=>{f=[Math.min(V.AR-.01,Math.max(.01,f[0])),Math.min(.99,Math.max(.01,f[1]))];R=Math.min(.24,Math.max(.022,R));const c=pljFloorToClip(V,f[0],f[1],0);
  Object.assign(d,{x:f[0],y:f[1],R,under,seed:rnd(),size:Math.min(1.6,Math.max(.4,R/.07)),sx:(c[0]+1)/2,placed:true});};
 const cellR=b=>{const f=S2F[b.j*G+b.i],c=pljFloorToClip(V,f[0],f[1],0);return (b.d+.8)/G*2*V.asp/c[2];};
 const ws=ds.reduce((a,d)=>a+d.w,0),P=ph.P,left=P-ph.k;
 if(!st){ds.forEach((d,n)=>put(d,pljScreenToFloor(V,.5,.55)||[V.AR/2,.5],.05,-1));return;}
 // the first press: in the middle, every drop inside the one before
 if(ph.first){const jc=Math.floor(.55*Hs),f=S2F[jc*G+G/2]||[V.AR/2,.5],A=st.cells/P*.5*pjCellArea(Gd,G/2,jc);let under=-1;
  for(const d of ds){const R=Math.sqrt(A*d.w/ws/Math.PI);put(d,[f[0]+(rnd()-.5)*.25*R,f[1]+(rnd()-.5)*.25*R],R,under);under=d.ink;}return;}
 // the last press: into the biggest holes, one after another (then the paint flows into the rest)
 if(ph.last){const sc=st.sc.slice();let prev=null;
  for(const d of ds){const b=pjFar(Gd,sc);if(!b){// no hole left: inside the drop before
    const f=prev?[prev.x+(rnd()-.5)*.02,prev.y+(rnd()-.5)*.02]:pljScreenToFloor(V,.3+.4*rnd(),.4+.4*rnd())||[V.AR/2,.5];put(d,f,prev?prev.R*.6:.05,prev?prev.ink:0);prev=d;continue;}
   const f=S2F[b.j*G+b.i];put(d,f,Math.max(.03,Math.min(.2,cellR(b)*1.3)),-1);prev=d;const rs=b.d+1.5;
   for(let q=-12;q<=12;q++)for(let r=-12;r<=12;r++){const ii=b.i+r,jj=b.j+q;if(ii>=0&&jj>=0&&ii<G&&jj<Hs&&Math.hypot(r,q)<=rs)sc[jj*G+ii]=1;}}
  return;}
 // the anchor: a painted cell at the edge of the paint with much black around it, turning around the middle (golden angle, from a turn of its own for each scene); once
 // little black is left, the black cell farthest from the paint
 const late=st.bs<.4,k=ph.k;let best=late?pjFar(Gd,st.sc):null;const ta=k*2.4+(F.rot||0);
 if(!best)for(let j=0;j<Hs;j++)for(let i=0;i<G;i++){if(st.sc[j*G+i]<.6||!S2F[j*G+i])continue;let b=0,n=0;
  for(let q=-5;q<=5;q++)for(let r=-5;r<=5;r++){const ii=i+r,jj=j+q;if(ii<0||jj<0||ii>=G||jj>=Hs||r*r+q*q>25)continue;n++;if(st.sc[jj*G+ii]<.4)b++;}
  if(!b)continue;const a=Math.atan2(((j+.5)/Hs-.55)*9/16,(i+.5)/G-.5),da=Math.abs(Math.atan2(Math.sin(a-ta),Math.cos(a-ta))),sco=b/n-da*.12+rnd()*.15;if(!best||sco>best.s)best={s:sco,i,j};}
 if(!best){for(let j=0;j<Hs&&!best;j++)for(let i=0;i<G;i++)if(st.sc[j*G+i]<.4&&S2F[j*G+i]){best={i,j,d:1};break;}}
 if(!best)best={i:G>>1,j:Math.floor(.55*Hs),d:1};
 const shape=late?(k%2?'diana':'parella'):pjShapes[(k-1)%pjShapes.length];
 const A=Math.max(1e-4,Math.min(st.bs*st.cells/Math.max(1,left-1)*1.5*pjCellArea(Gd,best.i,best.j),late&&best.d!=null?Math.PI*cellR(best)**2*2.2:9));
 const f0=S2F[best.j*G+best.i]||[V.AR/2,.5];let cen=[0,0],cn=0;st.sc.forEach((v,i)=>{if(v>.6&&S2F[i]){cen[0]+=S2F[i][0];cen[1]+=S2F[i][1];cn++;}});cen=cn?[cen[0]/cn,cen[1]/cn]:f0;
 let out=[f0[0]-cen[0],f0[1]-cen[1]];const ol=Math.hypot(...out)||1;out=[out[0]/ol,out[1]/ol];const tan=[-out[1],out[0]],sg=rnd()<.5?-1:1;
 let cx=f0[0],cy=f0[1],prevR=0,prev=null;const R0=Math.sqrt(A*ds[0].w/ws/Math.PI),other=[f0[0]+tan[0]*R0*1.3*sg,f0[1]+tan[1]*R0*1.3*sg],u0=st.ink[best.j*G+best.i];
 ds.forEach((d,n)=>{const Rn=Math.sqrt(A*d.w/ws/Math.PI);let f;
  if(shape==='diana')f=[cx+(rnd()-.5)*.25*Rn,cy+(rnd()-.5)*.25*Rn];
  else if(shape==='cadena'){if(n>0){cx+=tan[0]*sg*(prevR*.55+Rn*.35)+out[0]*(rnd()-.5)*.3*Rn;cy+=tan[1]*sg*(prevR*.55+Rn*.35)+out[1]*(rnd()-.5)*.3*Rn;}f=[cx,cy];}
  else{const q=n%2?other:[f0[0],f0[1]];f=[q[0]+(rnd()-.5)*.2*Rn,q[1]+(rnd()-.5)*.2*Rn];}
  const under=n===0?u0:shape==='parella'?(n>=2?ds[n-2].ink:u0):prev.ink;put(d,f,Rn,under);prevR=Rn;prev=d;});}

// ── The picture ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The floor of the activity brought to its time: a new scene (or a new floor) gets its inks, the phrases are placed, their drops sent,
// the fill and the dilution set, and the liquid stepped to F.t. rw × rh: the size of the picture. False when WebGL cannot draw.
export function pjFloor(F,s,rw,rh){const top=s?.pjView==='dalt',S=pjScene(F);if(!PJR.dyeH)PJR.dyeH=PJR.st.scale<.7?576:864;
 const r=pljSetup(rw,rh,{top,look:pjLookFor(s),dyeH:PJR.dyeH,pal:S.pal});if(!r)return false;
 if(r==='new'||PJR.F!==F||PJR.scene!==F.scene||PJR.top!==top){if(r!=='new'){pljPalette(S.pal);pljClear();}PJR.F=F;PJR.scene=F.scene;PJR.top=top;PJR.sent.clear();PLJ.t=F.t;
  // a floor made again in the middle of a scene (a new size or view) gets back the drops that are still spreading
  for(const d of F.drops)if(d.placed&&d.t0<F.t-PJ_KEEP)PJR.sent.add(d.id);}
 for(const ph of F.phrases)if(!ph.placed&&ph.scene===F.scene)pjPlace(F,ph);
 const alive=new Set(F.drops.map(d=>d.id));PLJ.drops=PLJ.drops.filter(x=>x.id==null||x.hit||alive.has(x.id));
 for(const d of F.drops)if(d.placed&&!PJR.sent.has(d.id)&&d.scene===F.scene){PJR.sent.add(d.id);pljDrop({id:d.id,x:d.x,y:d.y,R:d.R,ink:d.ink,under:d.under,t0:d.t0,seed:d.seed,size:d.size});}
 if(PJR.sent.size>400)PJR.sent=new Set([...PJR.sent].filter(id=>alive.has(id)));
 pljFill(F.fill&&F.phase!=='dilute');pljDilute(F.phase==='dilute'?PJ_DIL_KEEP:1);
 if(F.phase!=='change')pljAdvance(F.t);return true;}
export function pjDraw(c,w,h,G,s,preview=false){const F=G?.pluja,cv=c.canvas,W=cv.width,H=cv.height;
 c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,W,H);
 // the card shows its picture (CARD_IMG); without WebGL2 the screen stays black
 if(!F||preview||!pljReady()){c.restore();return;}
 const scale=glAdapt(PJR.st,PJR.fixed,'pluja-colors'),rw=Math.max(64,Math.round(W*scale)),rh=Math.max(36,Math.round(H*scale));
 if(!pjFloor(F,s,rw,rh)||F.phase==='change'){c.restore();return;}
 pljRender({sprites:!s?.reduced});c.imageSmoothingEnabled=true;c.drawImage(PLJ.cv,0,0,rw,rh,0,0,W,H);
 // the wait: the floor darkens a little while the activity waits for a press (as in the other activities)
 if(s?.waitCue!==false){const wk=escWaitClock(F.wait||ESC_WAIT_START,F.t),dark=(wk.dark||0)*.7;if(dark>.005){c.fillStyle=`rgba(0,0,0,${dark.toFixed(3)})`;c.fillRect(0,0,W,H);}}
 c.restore();}
// the part of the paint kept each second while it dilutes (5.5 s: down to about 4 %, then black)
export const PJ_DIL_KEEP=.55;
const PJ_KEEP=1.2;
export const pjSceneCount=()=>PJ_SCENES.length;

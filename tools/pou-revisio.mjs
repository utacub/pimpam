// El pou del temps (CE37): a small page for reviewing ONE scene on a real graphics card (0.44.7), without the rest of the app: it opens
// on that scene with its clocks as the app keeps them, the switch (space or a click) presses on to the next, and the digit keys turn
// parts of the parasaurolophus drawing off one at a time, so that the part that makes an artefact can be found on the screen
// that shows it. No sound. Usage: node tools/pou-revisio.mjs OUT.html [SCENE=11]
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const [out='Pou_escena_11_revisio.html',sceneArg='11']=process.argv.slice(2),SCENE=+sceneArg;
let code=['carrega.js','pou-shaders.js','pou.js','pou-gl.js'].map(n=>readFileSync(root+'dist/'+n,'utf8')).join('\n').replace(/^import .*;$/gm,'').replace(/^export\s+(?=(const|function|class))/gm,'');
// the scene sources stay editable here (the variants below replace the parasaur scene's source and compile it again)
if(!code.includes('scenes:Object.freeze(['))throw new Error('scenes list not found');code=code.replace('scenes:Object.freeze([','scenes:([');
const s10=readFileSync(root+'production/pou/scene_10.glsl','utf8');
// Each variant: a name and the exact replacements in the source of scene 11 (checked here, so a changed source fails loudly).
const V=[
 ['0 · tot (0.44.6)',[]],
 ['1 · sense la llum de vora (dFdx)',[["alb=mix(alb,alb*1.45+vec3(.05,.04,.02),ss(-.22*rw,.0,d)*sat(gD.y*1.3-.2)*(1.-hz)*.5*up);\n  alb=mix(alb,alb*1.3+.03,ss(-.30*rw,0.,d)*sat(dot(gD,normalize(SUNL.xy)))*.30*up);",""]]],
 ['2 · sense textura de pell (K_SKIN → llis; ja és així des de la 0.44.7)',[["K_SKIN,m*900.,","K_SMOOTH,vec2(0.),"],["K_SKIN,h*900.,","K_SMOOTH,vec2(0.),"]]],
 ['3 · sense volums (paDome)',[["alb*=1.+.5*paDome(m-vec2(.15,2.15),mat2(1.),vec2(2.5,1.10),flip)+.55*paDome(m-mix(H,K,.45),mat2(hk.y,hk.x,-hk.x,hk.y),vec2(.62,.86),flip)+.40*paDome(m-mix(S,E,.30)-vec2(.0,.06),mat2(1.),vec2(.34,.46),flip);",""]]],
 ['4 · sense franges ni taques',[["vec2 pb=paBars(ax,vy,ppm,seed);","vec2 pb=vec2(0.);"]]],
 ['5 · cos pla, sense llum ni relleu (K_FLAT)',[["K_SKIN,m*900.,vec2(1,0),Rb*s,","K_FLAT,m*900.,vec2(1,0),Rb*s,"]]],
 ['6 · sense la barreja de gradients del cap',[["mix(vec2(dFdx(ds),dFdy(ds)),vec2(dFdx(dl),dFdy(dl)),ss(.45,.10,min(dTh,dFace)))","vec2(dFdx(ds),dFdy(ds))"]]],
 ['7 · sense ossos (needB)',[["bool needB=G<1.1;","bool needB=false;"]]],
 ['8 · sense el tall de l’aigua',[["if(wet>0.){float wl=wet-m.y;","if(false){float wl=wet-m.y;"]]],
 ['9 · 1+2+3+4+6 alhora',null]];
V[9][1]=[...V[1][1],...V[2][1],...V[3][1],...V[4][1],...V[6][1]];
const sources=V.map(([name,reps])=>{let s=s10;for(const [a,b] of reps){if(!s.includes(a)){console.warn(name+': not in the source any more (skipped): '+a.slice(0,50));continue;}s=s.split(a).join(b);}return s;});
const page=`<!doctype html><html lang="ca"><head><meta charset="utf-8"><title>El pou del temps · revisió de l’escena ${SCENE}</title>
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden;font:14px/1.4 system-ui,sans-serif;color:#eee}canvas{display:block;width:100vw;height:100vh}
#o{position:fixed;left:12px;top:10px;background:rgba(0,0,0,.55);padding:8px 12px;border-radius:8px;max-width:60vw}#o b{color:#ffd37a}#o small{color:#bbb}</style></head>
<body><canvas id="c"></canvas><div id="o"></div><script>
(()=>{${code}
window.PG=PG;window.POU_GLSL=POU_GLSL;window.F={drawPou,pouDuration,POU_N,POU_STIM,pouAvailable};})();
(()=>{
const SRC=${JSON.stringify(sources)},NAMES=${JSON.stringify(V.map(v=>v[0]))};
const cv=document.getElementById('c'),o=document.getElementById('o'),c=cv.getContext('2d');
const wake=t=>{const u=Math.min(1,t/.6);return t<.6?.6*(u*u*u-u*u*u*u/2):t-.3;};
let v=${SCENE}-1,pressAt=null,variant=0,hidden=false;   // (the clock starts at the first frame drawn: the first compile can take seconds)
function setVariant(k){variant=k;pressAt=null;POU_GLSL.scenes[${SCENE}-1]=SRC[k];const old=PG.scene[${SCENE}-1];if(old&&old.p){try{PG.gl.deleteProgram(old.p);}catch{}}PG.scene[${SCENE}-1]=null;}
setVariant(0);
function press(){v=(v+1)%F.POU_N;pressAt=performance.now();}
addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();press();}else if(e.key==='r'||e.key==='R')pressAt=performance.now();
 else if(e.key==='PageUp'||e.key==='ArrowLeft'){v=(v+F.POU_N-1)%F.POU_N;pressAt=performance.now();}else if(e.key==='PageDown'||e.key==='ArrowRight')press();
 else if(e.key>='0'&&e.key<='9')setVariant(+e.key);else if(e.key==='h'||e.key==='H')hidden=!hidden;
 else if(e.key==='s'||e.key==='S'){const a=document.createElement('a');a.download='pou_escena_'+(v+1)+'_variant_'+variant+'.png';a.href=cv.toDataURL('image/png');a.click();}});
addEventListener('pointerdown',e=>{if(e.target===cv)press();});
function frame(){const dpr=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
 const D=F.pouDuration(v),T=pressAt===null?0:(performance.now()-pressAt)/1000,wait=T>D;if(wait&&T>D+1.5)pressAt=performance.now();/* the scene plays again on its own */let sea=0;for(let j=0;j<v;j++)sea+=wake(F.pouDuration(j));
 const tau=wake(wait?D:T),prevTau=v>0?wake(F.pouDuration(v-1))+tau:null;
 const opt={variant:v,t:wait?null:T,tau,prevTau,stim:F.POU_STIM,sea:sea+tau,dark:wait?.85:0,background:'full',opacity:25,base:'black',done:false,scale:1};
 c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#000';c.fillRect(0,0,w,h);let ok=false;try{ok=F.drawPou(c,w,h,opt);}catch(e){o.textContent='Error: '+e;}if(ok&&pressAt===null)pressAt=performance.now();
 o.style.display=hidden?'none':'';
 o.innerHTML='<b>Escena '+(v+1)+'</b> · '+(wait?'final (torna a començar sola)':T.toFixed(1)+' s')+(ok?'':' · <b>no es pot dibuixar (WebGL2)</b>')+'<br><b>Variant '+NAMES[variant]+'</b><br><small>Espai o clic: següent escena · ←/→: escena anterior/següent · R: repetir · 0–9: variants del dibuix dels parasaurolophus · S: desar imatge · H: amagar això</small>';
 requestAnimationFrame(frame);}
requestAnimationFrame(frame);})();
</script></body></html>`;
writeFileSync(out,page);console.log(out,page.length,'bytes');

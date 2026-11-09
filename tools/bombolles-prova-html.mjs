// Bombolles sense pes: the style trial as one page to open in a browser (no app, no sound). The real engine (dist/bombolles-*.js)
// with the eight stimuli; each press of the space bar (or a click) is a press of the switch.
// Usage: node tools/bombolles-prova-html.mjs OUT.html
import {writeFileSync} from 'node:fs';
import {bmbSource} from './bombolles-prova.mjs';
const page=`<!doctype html><html lang="ca"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bombolles sense pes · prova d'estil</title>
<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}canvas{position:fixed;inset:0;width:100vw;height:100vh;display:block}
#nota{position:fixed;left:16px;bottom:14px;font:15px/1.4 system-ui,sans-serif;color:#9a9a9a;transition:opacity 1.2s}#err{position:fixed;inset:0;display:none;place-items:center;color:#ddd;font:20px system-ui,sans-serif;text-align:center;padding:2em}</style></head>
<body><div id="nota"><b id="nom">1 · Bombolles de sabó</b><br>Espai o clic: prem el commutador · tecles 1 a 8: tria l'estímul · P: 4, 8 o 12 pulsacions (ara <span id="np">8</span>)</div>
<div id="err">Aquest navegador no pot dibuixar la prova (cal WebGL2 amb textures de coma flotant).</div>
<script>${bmbSource()}</script>
<script>(()=>{const B=window.BM,nota=document.getElementById('nota'),NOMS=[['sabo','Bombolles de sabó'],['mel','Mel i caramel'],['plasma','Plasma'],['aigua',"Esferes d'aigua"],['fum','Anells de fum'],['ferro','Ferrofluid'],['oli','Oli i aigua'],['nebulosa','Nebulosa']];let quin='sabo',P=8,S=null,k=0,lap=0,seed=11,last=0,cv=null,W=0,H=0;
 const mida=()=>{const d=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;if(!B.bmbSetup(W*d,H*d)){document.getElementById('err').style.display='grid';return false;}
  if(!cv){cv=B.bmbCanvas();document.body.insertBefore(cv,document.body.firstChild);}return true;};
 const nou=()=>{S=B.stim[quin].nou({seed,lap,AR:W/H,presses:P});k=0;};
 const prem=()=>{if(!S)return;const ST=B.stim[quin];if(k>=P){if(!ST.buit(S))return;lap++;seed=(seed*7+3)%9973;nou();}k++;ST.prem(S,k,P);nota.style.opacity=0;};
 const tria=q=>{quin=q;lap=0;nou();nota.style.opacity=1;const i=NOMS.findIndex(n=>n[0]===q);document.getElementById('nom').textContent=(i+1)+' · '+NOMS[i][1];};
 addEventListener('keydown',e=>{if(e.repeat)return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();prem();}else if(e.key>='1'&&e.key<='8'){if(B.stim[NOMS[+e.key-1][0]])tria(NOMS[+e.key-1][0]);}
  else if(e.key==='p'||e.key==='P'){P=P===8?12:P===12?4:8;document.getElementById('np').textContent=P;tria(quin);}});
 addEventListener('pointerdown',e=>{e.preventDefault();prem();});addEventListener('resize',()=>{if(mida())nou();});
 if(!mida())return;nou();
 const pas=t=>{requestAnimationFrame(pas);const dt=Math.min(.05,Math.max(0,(t-last)/1000));last=t;if(!S||B.BMB.lost)return;const ST=B.stim[quin];
  // the simulation runs in steps of 1/60 s at most
  let r=dt;while(r>1e-5){const h=Math.min(r,1/60);ST.pas(S,h);r-=h;}
  if(B.bmbBegin(S.t)){B.bmbRopeReset();ST.pinta(S);B.bmbEnd(S.post||{});}};
 requestAnimationFrame(t=>{last=t;requestAnimationFrame(pas);});})();</script></body></html>`;
const out=process.argv[2]||'Bombolles_prova_estil.html';writeFileSync(out,page);console.log(out,(page.length/1024).toFixed(0)+' KB');

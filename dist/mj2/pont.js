/* =========================================================
   Pim Pam · pont amb Mira i Juga 2 (0.78)
   Aquest fitxer s'afegeix al final de l'index.html de Mira i Juga 2 que escriu tools/mj2-import.py. L'escenari de Mira i
   Juga 2 corre sencer dins d'un iframe de Pim Pam (el contingut, l'art, els sons i les veus són els de Mira i Juga 2); el
   que canvia és la forma d'accés i la gestió:
   - no hi ha portada, menú, barra de navegació, botons de mode ni finestra d'opcions de Mira i Juga 2 (els posa Pim Pam);
   - no s'activa res amb la mirada, el ratolí ni el tacte (mode «clic» de Mira i Juga 2 i iframe sense punter): Pim Pam
     demana els objectius que es poden triar (PP.targets), hi fa córrer el focus d'encercament i en tria un (PP.pick);
   - sense rètols escrits durant l'activitat (norma de l'encercament de Pim Pam); les veus es mantenen;
   - el so surt pel context d'àudio de Pim Pam (ja desbloquejat per la pulsació de l'adult).
   ========================================================= */
(()=>{
  const ACTS={
    'mj-ou':     {sid:'ous',mode:1,i:1},
    'mj-nenufars':{sid:'granotes',mode:0,i:4},
    'mj-robot':  {sid:'robots',mode:0,i:11},
    'mj-planol': {sid:'robots',mode:1,i:11},
    'mj-conte':  {sid:'conte',mode:0,i:14},
    'mj-escolta':{sid:'conte',mode:1,i:14}};
  const MOD={ous:OUS,granotes:ESTANY,robots:ROBOTS,conte:CONTE};
  let act=null,paused=false,bus=null,boost=1;
  /* el so: el context de Pim Pam, amb un bus propi que es desconnecta en sortir */
  const host=window.parent&&window.parent!==window?window.parent:null;
  if(host&&host.__mjAudio){const Real=window.AudioContext||window.webkitAudioContext;
    window.AudioContext=window.webkitAudioContext=function(){const ac=host.__mjAudio();if(!ac)return new Real();
      bus=ac.createGain();bus.gain.value=paused?0:boost;bus.connect(ac.destination);
      return new Proxy(ac,{get(t,k){if(k==='destination')return bus;const v=t[k];return typeof v==='function'?v.bind(t):v}})}}
  /* identitat estable de cada objectiu (perquè Pim Pam vegi quan canvien les opcions) */
  const ids=new WeakMap();let nid=1;const idOf=o=>{if(typeof o==='string')return o;let v=ids.get(o);if(!v){v='t'+(nid++);ids.set(o,v)}return v};
  const box=(o,x,y,w,h,shape)=>({o,id:idOf(o),x:OX+(x-w/2)*SC,y:OY+(y-h/2)*SC,w:w*SC,h:h*SC,shape:shape||'rect'});
  /* els objectius que es poden triar ara, en coordenades de la pantalla (px CSS de l'iframe) */
  function raw(){if(!act||view!=='scene'||paused)return [];const M=MOD[act.sid];
    if(act.sid==='robots'){const st=M.st;if(!st||!M.ready)return [];
      if(st.ph==='ask'&&st.opts)return st.opts.filter(o=>M.actionable({k:'opt',o})).map(o=>box(o,o.x,o.y,o.w,o.h));
      if(st.ph==='lever'&&M.actionable({k:'lev'})){const b={x:968,y:560-80-10,w:150,h:200};return [box('lev',b.x,b.y,b.w,b.h)]}return []}
    if(act.sid==='conte'){const st=M.st;if(!st||!M.ready||st.ph!=='ask')return [];return st.flaps.filter(f=>M.actionable(f)).map(f=>box(f,f.x,f.y,f.w+16,f.h+20))}
    if(act.sid==='granotes'){if(!M.ready||M.mode!==0)return [];return M.reachable().map(p=>{if(p==='bank'){const n=M.family.length;return box('bank',640,161,(n*40+95)*2,122)}return box(p,p.x,p.y,p.w*1.24,p.h*1.24+44,'ellipse')})}
    if(act.sid==='ous'){const G=M.G;if(!M.ready||!G||G.ph!=='pick')return [];return M.eggs.filter(e=>e.st==='egg'&&e.pop>=1&&!(e.no>0)).map(e=>box(e,e.x,e.y-e.H*.5,e.H*.92,e.H*1.18,'ellipse'))}
    return []}
  function targets(){return raw().sort((a,b)=>a.x+a.w/2-(b.x+b.w/2)||a.y-b.y)}
  function pick(id){const t=raw().find(x=>x.id===id);if(!t)return false;const M=MOD[act.sid];
    if(act.sid==='robots')M.activate(t.o==='lev'?{k:'lev'}:{k:'opt',o:t.o});
    else if(act.sid==='conte')M.activate(t.o);
    else if(act.sid==='granotes')M.act1(t.o);
    else if(act.sid==='ous')M.activate(t.o);
    return true}
  /* la configuració que ve de Pim Pam: mida (2, 3 o 4 opcions), so, volum, música, velocitat, idioma */
  function cfg(c){if(c.boost)boost=c.boost;if(bus)bus.gain.value=paused?0:boost;if(c.lang&&I18N[c.lang]&&c.lang!==LANG){LANG=c.lang;applyLang()}
    const old=CFG.size;Object.assign(CFG,{mode:2,cursor:2,trail:false,navGaze:false},c.cfg||{});setVol();updLoops();
    if(CFG.size!==old&&act&&view==='scene'){const M=MOD[act.sid];M.layout&&M.layout()}}
  function open(id,c){const a=ACTS[id];if(!a)return false;act={...a,id};if(c)cfg(c);try{audioInit()}catch(e){}
    openScene0(a.i);MOD[a.sid].setMode(a.mode);$('#nav').classList.remove('on');document.body.classList.add('nocur');return true}
  function close(){if(act)try{goMenu0()}catch(e){}act=null;view='start';try{updLoops()}catch(e){}
    if(bus)try{bus.disconnect()}catch(e){}bus=null}
  function pause(p){paused=!!p;if(bus)bus.gain.value=paused?0:boost}
  /* res escrit a la pantalla durant l'activitat: els rètols de les preguntes s'esborren (les veus continuen) */
  for(const M of [ROBOTS,CONTE]){const s=M.step;M.step=function(dt){if(paused)return;s.call(M,dt);const st=M.st;if(st&&st.cap)st.cap=null}}
  for(const M of [OUS,ESTANY]){const s=M.step;M.step=function(dt){if(paused)return;s.call(M,dt)}}
  /* estat de càrrega: preparat quan l'escena 3D és a punt */
  function ready(){if(!act)return false;const M=MOD[act.sid];return !!M.ready}
  window.PP={open,close,cfg,targets,pick,pause,ready,get act(){return act&&act.id}};
  try{host&&host.postMessage({mj2:'ready'},location.origin)}catch(e){}
})();

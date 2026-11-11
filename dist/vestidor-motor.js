// El vestidor fantàstic (EN06, 0.73): the engine of the drawings. The pictures (dist/assets/vestidor, made by tools/vestidor-assets.py)
// are ChatGPT's whole drawings and the layers lifted from edits of the same drawing, each cropped with its box in the source picture
// (vestidor-dades.js). A figure (an artist or Pipa) is composed like the stills of the art thread (combina3.dress): the cape behind, the
// master drawing with the places the clothes cover erased, the face, the body garment, the collar, the feet, the head and the object
// held up; the composition is kept in a small cache at the scale of the screen and drawn as a sheet of paper that bends: the bottom stays
// on the floor and the top leans, sways or swings (strips of the sheet, each moved a little), and it can squash, stretch, turn round like
// a cut-out on a stick, and jump. Nothing is rebuilt per frame unless the clothes or the face change.
import {VS_BOX} from './vestidor-dades.js';
import {VS_COSTUMES,vsCode} from './vestidor.js';
import {escCanvas,escScale} from './escenari.js';
// The standalone build fills this table with the pictures (data: URLs); in development they are read from assets/vestidor.
const VS_IMAGES=null;
const vsSrc=name=>VS_IMAGES?.[name]||'./assets/vestidor/'+name+'.webp';
const VS_PICS=new Map();let VS_DONE=0;
export const vsBox=name=>VS_BOX[name]||null;
// A picture, once it is decoded (createImageBitmap decodes away from the drawing); asking for one starts loading it.
export function vsPic(name){if(!VS_BOX[name])return null;let e=VS_PICS.get(name);
 if(!e){if(typeof Image==='undefined')return null;e={bmp:null,done:false};VS_PICS.set(name,e);const img=new Image();try{img.decoding='async';}catch{}
  const fin=b=>{e.bmp=b;e.done=true;VS_DONE++;};img.onload=()=>{if(typeof createImageBitmap==='function')createImageBitmap(img).then(fin,()=>fin(img));else fin(img);};img.onerror=()=>{e.done=true;e.failed=true;VS_DONE++;};img.src=vsSrc(name);}
 return e.bmp;}
export const vsReady=name=>!!VS_PICS.get(name)?.bmp;
export function vsWant(names){for(const n of names)vsPic(n);}
// The share of a set that has arrived (the loading cover waits for the dressing room, the stage, Pipa and the first artists).
export function vsShare(names){if(typeof Image==='undefined')return 1;vsWant(names);let k=0;for(const n of names){const e=VS_PICS.get(n);if(!e||e.done)k++;}return names.length?k/names.length:1;}
export const vsNamesOf=prefix=>Object.keys(VS_BOX).filter(n=>n.startsWith(prefix+'-'));
export const VS_COMMON=Object.freeze(['cam-1','cam-2','esc-1','esc-2','public','mans','vidre',...Object.keys(VS_BOX).filter(n=>/^(pipa|lloro|obj|fons|peca)-/.test(n))]);
// Where each figure stands in its drawing (the middle of the feet on the floor) and its size against Hug's, as on the stage stills
// (escenari5.py: Rita is the smallest, Hug the tallest; Pipa is a small dog).
export const VS_FOOT=Object.freeze({rita:[512,1364],hug:[512,1410],quim:[512,1376],ona:[512,1376],pipa:[540,895]});
export const VS_REL=Object.freeze({hug:1,rita:.854,quim:.935,ona:.884,pipa:.69});
export const VS_TOP=Object.freeze({rita:298,hug:227,quim:287,ona:220,pipa:401});
// The order of the layers (combina3.rank): the cape behind everything, the face, the body garment, the collar, the feet, the head, the
// object held up. Pipa's: the face, the body, the feet, the hat.
export function vsRank(code,pipa=false){if(pipa){if(code[0]==='E')return 0;return code.length===1?3:code[1]==='2'?1:2;}
 if(code==='62c')return -1;if(code[0]==='E')return 0;if(code[0]==='O')return 4;if(code==='62k')return 1.5;if(code[0]==='B'||code==='62r')return 1;if(code==='41t')return 3;return {'2':1,'3':2,'1':3}[code[1]]??1;}
// The codes of an outfit: what is worn ({cap, cos, peus, objecte}), in the rest pose (0) or with the arms up (1), with the cape rolled up
// (roll) and without the slots in skip (they are drawn apart when they move on their own).
export function vsOutfit(P,pose=0,o={}){const out=[],skip=o.skip||{};
 if(P.cap&&!skip.cap)out.push(P.cap==='astronauta'&&pose?'41t':vsCode('cap',P.cap));
 if(P.cos&&!skip.cos){const i=VS_COSTUMES.indexOf(P.cos)+1;if(o.roll&&P.cos==='reialesa')out.push('62r');else{out.push(pose?`B${i}2`:`${i}2`);if(P.cos==='reialesa')out.push('62c','62k');}}
 if(P.peus&&!skip.peus)out.push(vsCode('peus',P.peus));
 if(P.objecte&&pose&&!skip.objecte)out.push(vsCode('objecte',P.objecte));
 return out;}
// Pipa's outfit: the same costumes, his own hat, coat and boots.
export function vsPipaOutfit(P){const out=[],i=x=>VS_COSTUMES.indexOf(x)+1;if(P.cos)out.push(`${i(P.cos)}2`);if(P.peus)out.push(`${i(P.peus)}3`);if(P.cap)out.push(`${i(P.cap)}`);return out;}
// ── the figures ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// A composition: a canvas with the whole drawing (1024 wide) at kc canvas pixels per drawing pixel. The cache keeps the last twelve.
const VS_FIG=new Map();let VS_TMP=null;
const vsName=(who,code)=>`${who}-${code}`;
// Whether every picture of a figure has arrived (until then the figure is not drawn, rather than drawn half dressed).
export function vsFigureReady(who,pose,codes){const base=who==='pipa'?'pipa-r':`${who}-${pose?'t':'r'}`;if(!vsReady(base))return false;for(const c of codes){if(VS_BOX[vsName(who,c)]&&!vsReady(vsName(who,c)))return false;}return true;}
export function vsFigure(who,pose,codes,face,kc){const pipa=who==='pipa',W=1024,H=pipa?1024:1536,faceCode=face>0?(pipa?'E1':'E'+face):null;
 const list=[...codes,...(faceCode?[faceCode]:[])].filter(c=>VS_BOX[vsName(who,c)]),q=Math.max(.12,Math.min(.75,Math.round(kc*32)/32));
 const key=`${who}|${pose}|${list.slice().sort().join(',')}|${q}`;let e=VS_FIG.get(key);if(e){VS_FIG.delete(key);VS_FIG.set(key,e);return e;}
 if(!vsFigureReady(who,pose,list))return null;
 const cw=Math.ceil(W*q),ch=Math.ceil(H*q),cv=escCanvas(cw,ch),x=cv?.getContext?.('2d');if(!x)return null;
 if(!VS_TMP||VS_TMP.width<cw||VS_TMP.height<ch)VS_TMP=escCanvas(Math.max(cw,VS_TMP?.width||0),Math.max(ch,VS_TMP?.height||0));const tc=VS_TMP?.getContext?.('2d');if(!tc)return null;
 const put=(g,name,mode='source-over')=>{const b=VS_BOX[name],im=vsPic(name);if(!b||!im)return;g.globalCompositeOperation=mode;g.drawImage(im,b[0]*q,b[1]*q,b[2]*q,b[3]*q);g.globalCompositeOperation='source-over';};
 const order=list.slice().sort((a,b)=>vsRank(a,pipa)-vsRank(b,pipa));
 // the master with the places of the clothes erased (only the master: a layer never erases another)
 tc.setTransform(1,0,0,1,0,0);tc.clearRect(0,0,VS_TMP.width,VS_TMP.height);put(tc,pipa?'pipa-r':`${who}-${pose?'t':'r'}`);
 for(const c of order){if(c==='62c')continue;const er=vsName(who,c)+'-e';if(VS_BOX[er])put(tc,er,'destination-out');}
 if(list.includes('62c'))put(x,vsName(who,'62c'));
 x.drawImage(VS_TMP,0,0,cw,ch,0,0,cw,ch);
 for(const c of order)if(c!=='62c')put(x,vsName(who,c));
 e={cv,kc:q,W,H};VS_FIG.set(key,e);while(VS_FIG.size>12){const k0=VS_FIG.keys().next().value,o=VS_FIG.get(k0);VS_FIG.delete(k0);if(o?.cv){o.cv.width=o.cv.height=1;}}
 return e;}
// The transform of a figure on the screen: its feet at (x, y) in CSS pixels, k screen pixels per drawing pixel, turned by rot about the
// feet, squashed or stretched (sx, sy: a negative sx is the cut-out seen from behind, turning round), lifted by lift drawing pixels, the
// top leaning by lean drawing pixels and swaying with a wave (amplitude wa, phase wp) that grows from the feet up.
export function vsT(o){return {x:0,y:0,k:1,rot:0,sx:1,sy:1,lift:0,lean:0,wa:0,wp:0,alpha:1,...o};}
export function vsDrawFigure(c,F,who,T){if(!F?.cv||!(T.alpha>0))return;const [ax,ay]=VS_FOOT[who],top=VS_TOP[who]-40,kc=F.kc,cv=F.cv;
 c.save();if(T.alpha<1)c.globalAlpha*=T.alpha;c.translate(T.x,T.y);if(T.rot)c.rotate(T.rot);c.scale(T.k*T.sx,T.k*T.sy);c.translate(0,-T.lift);
 if(!T.lean&&!T.wa){c.drawImage(cv,-ax,-ay,F.W,F.H);c.restore();return;}
 // the sheet bends: strips from the feet to the top, each moved by the lean and the wave at its height (a pixel of overlap hides seams)
 const n=36,y0=Math.max(0,top),y1=F.H,span=Math.max(1,ay-y0);
 if(y1>ay){c.drawImage(cv,0,ay*kc,cv.width,Math.max(1,(y1-ay)*kc),-ax,0,F.W,y1-ay);}
 for(let i=0;i<n;i++){const a=y0+(ay-y0)*i/n,b=y0+(ay-y0)*(i+1)/n,v=Math.max(0,(ay-(a+b)/2)/span),dx=T.lean*Math.pow(v,1.5)+T.wa*Math.sin(T.wp+v*3.2)*v;
  c.drawImage(cv,0,a*kc,cv.width,Math.max(1,(b-a)*kc+1),-ax+dx,a-ay,F.W,b-a+1/kc);}
 if(y0>0)c.drawImage(cv,0,0,cv.width,y0*kc,-ax+T.lean+T.wa*Math.sin(T.wp+3.2),-ay,F.W,y0);
 c.restore();}
// Where a point of the drawing lands on the screen with a transform (for a hat that moves on its own, the parrot, the particles).
export function vsAt(who,T,px,py){const [ax,ay]=VS_FOOT[who],top=VS_TOP[who]-40,span=Math.max(1,ay-top),v=Math.max(0,Math.min(1.2,(ay-py)/span)),dx=T.lean*Math.pow(v,1.5)+T.wa*Math.sin(T.wp+v*3.2)*v;
 const lx=(px-ax+dx)*T.k*T.sx,ly=(py-ay-T.lift)*T.k*T.sy,cs=Math.cos(T.rot),sn=Math.sin(T.rot);return [T.x+lx*cs-ly*sn,T.y+lx*sn+ly*cs];}
// One layer drawn by itself with the figure's transform, moved within the drawing: offset (dx, dy), turned by rot and scaled (sx, sy)
// about the point (px, py) of the drawing (the bottom of a chef's hat that grows, the crown that slides).
export function vsDrawLayer(c,who,code,T,m={}){const name=vsName(who,code),b=VS_BOX[name],im=vsPic(name);if(!b||!im)return;const [ax,ay]=VS_FOOT[who];
 const px=m.px??b[0]+b[2]/2,py=m.py??b[1]+b[3],[sx,sy]=vsAt(who,{...T,rot:T.rot},px,py);
 c.save();if((m.alpha??1)<1)c.globalAlpha*=m.alpha;c.translate(sx,sy);if(T.rot)c.rotate(T.rot);c.scale(T.k*T.sx,T.k*T.sy);c.translate((m.dx||0),(m.dy||0));if(m.rot)c.rotate(m.rot);c.scale(m.sx??1,m.sy??1);
 c.drawImage(im,b[0]-px,b[1]-py,b[2],b[3]);c.restore();}
// A picture drawn whole, its box in its source picture mapped with scale k from (ox, oy).
export function vsDrawPic(c,name,ox,oy,k,alpha=1){const b=VS_BOX[name],im=vsPic(name);if(!b||!im||!(alpha>0))return false;if(alpha<1){c.save();c.globalAlpha*=alpha;}c.drawImage(im,ox+b[0]*k,oy+b[1]*k,b[2]*k,b[3]*k);if(alpha<1)c.restore();return true;}
// ── the cards of the choice: the piece cut out with the white margin of a cut-out sheet ───────────────────────────────────────────
const VS_STICK=new Map();
export function vsSticker(names,px){const boxes=names.map(n=>VS_BOX[n]).filter(Boolean);if(!boxes.length)return null;if(!names.every(vsReady))return null;
 const x0=Math.min(...boxes.map(b=>b[0])),y0=Math.min(...boxes.map(b=>b[1])),x1=Math.max(...boxes.map(b=>b[0]+b[2])),y1=Math.max(...boxes.map(b=>b[1]+b[3])),w=x1-x0,h=y1-y0;
 const q=Math.max(.1,Math.min(1,Math.round(px/Math.max(w,h)*24)/24)),key=names.join('+')+'|'+q;let e=VS_STICK.get(key);if(e)return e;
 const m=Math.ceil(14),cw=Math.ceil(w*q)+2*m,ch=Math.ceil(h*q)+2*m,cv=escCanvas(cw,ch),x=cv?.getContext?.('2d'),tmp=escCanvas(cw,ch),t=tmp?.getContext?.('2d');if(!x||!t)return null;
 const paint=g=>{for(const n of names){const b=VS_BOX[n];g.drawImage(vsPic(n),m+(b[0]-x0)*q,m+(b[1]-y0)*q,b[2]*q,b[3]*q);}};
 paint(t);t.globalCompositeOperation='source-in';t.fillStyle='#fffaf0';t.fillRect(0,0,cw,ch);
 // the white margin: the silhouette drawn round a circle, then a soft shadow under it, then the piece
 x.save();x.shadowColor='rgba(60,30,20,.28)';x.shadowBlur=10;x.shadowOffsetY=4;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.drawImage(tmp,Math.cos(a)*9,Math.sin(a)*9);}x.restore();
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2;x.drawImage(tmp,Math.cos(a)*9,Math.sin(a)*9);}
 // the astronaut helmet is a bubble of clear glass: on its own it would read as an empty ring, so the sticker gets a pale-blue glass
 if(names.length===1&&/^(rita|hug|quim|ona)-41$/.test(names[0])){const g=x.createRadialGradient(cw*.4,ch*.36,0,cw/2,ch*.46,Math.max(cw,ch)*.46);g.addColorStop(0,'rgba(236,248,255,.95)');g.addColorStop(1,'rgba(176,214,238,.95)');x.fillStyle=g;x.beginPath();x.ellipse(cw/2,ch*.46,cw*.4,ch*.4,0,0,Math.PI*2);x.fill();}
 paint(x);e={cv,w:cw/q,h:ch/q,q,x0:x0-m/q,y0:y0-m/q};VS_STICK.set(key,e);if(VS_STICK.size>40){const k0=VS_STICK.keys().next().value;VS_STICK.delete(k0);}return e;}
// The pictures behind a piece of a choice: a head, body or feet layer of the artist (the royal cape with its collar), or the object alone.
export function vsPieceNames(who,slot,id){if(slot==='objecte')return ['obj-'+(['paraigua','tuba','globus','regadora','ventall','cinta'].indexOf(id)+1)];const code=vsCode(slot,id);
 if(code==='62')return [`${who}-62c`,`${who}-62`,`${who}-62k`];return [`${who}-${code}`];}
// The picture of a card: the garment drawn alone and whole (lot 9, peca-<code>, the same for every artist) when there is one; the object
// alone; else the layers lifted from the artist, which miss what the body hid (Marc, 0.75.1).
export function vsCardNames(who,slot,id){if(slot!=='objecte'){const n='peca-'+vsCode(slot,id);if(VS_BOX[n])return [n];}return vsPieceNames(who,slot,id);}
// ── the scale of the screen ───────────────────────────────────────────────────────────────────────────────────────────────────────
export const vsDevice=c=>{try{return escScale(c)||1;}catch{return 1;}};

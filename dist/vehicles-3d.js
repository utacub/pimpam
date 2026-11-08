// El taller de vehicles (EN07, 0.53): the three-dimensional workshop, built and drawn with three.js (globalThis.PP3, dist/vendor/
// three-taller.js). Everything is procedural: no model or texture file travels with the app. The style is Marc's concept art of
// 8 November 2026 («Joguina de vinil tou»): matte soft-vinyl toys of big rounded forms in a closed palette, a cream bench with a teal rim,
// a pegboard with tools and a shelf with boxes, soft studio light. The picture is rendered into an offscreen canvas and copied into the
// canvas of the app, under the highlight of the scanning (vehicles-art.js), as Pinta el món does with its WebGL painter. Without WebGL,
// or when the context is lost, vhRender returns false and vehicles-art.js draws a flat version of the bench.
import {VH_PALETTE,VH_BODY_COLOR,VH_ROLL,VH_GAG,vhClamp,vhEase,vhOut,vhIn,vhSettle,vhPathOf} from './vehicles.js';
const vhP3=()=>globalThis.PP3||null;
export const vhGLAvailable=()=>!!vhP3()&&typeof document!=='undefined';
// The world (units of a toy world, like centimetres): the bench top is y=0, the floor FLOOR_Y below; the toy group is TOY times a chassis of 30.
export const VH_TOY=2.9,VH_FLOOR=-200,VH_BENCH=Object.freeze({w:560,d:230,z:30});
const VH_3D={r:null,cv:null,failed:false,lost:false,step:0,scene:null,tray:null,cam:null,tcam:null,mats:new Map(),decorMats:[],built:{},parts:{},lights:null,scale:1,shadow:'alta',frames:0,slow:0,fast:0,tier:'alta',compiled:false,size:[0,0],quality:'auto',lastLight:'',lastDecor:'',sheet:null};
const VH_STEPS_TOTAL=8;
// ── the renderer ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────
function vhR(){if(VH_3D.r||VH_3D.failed)return VH_3D.r;const T=vhP3();if(!T||typeof document==='undefined')return null;
 try{const cv=document.createElement('canvas');cv.width=8;cv.height=8;const r=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:false,stencil:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!r.capabilities.isWebGL2){VH_3D.failed=true;return null;}
  r.toneMapping=T.NeutralToneMapping;r.toneMappingExposure=1;r.shadowMap.enabled=true;r.shadowMap.type=T.VSMShadowMap;r.setPixelRatio(1);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();VH_3D.lost=true;},false);cv.addEventListener('webglcontextrestored',()=>{VH_3D.lost=false;VH_3D.compiled=false;},false);
  VH_3D.r=r;VH_3D.cv=cv;return r;}catch{VH_3D.failed=true;return null;}}
export const vhLost=()=>VH_3D.lost||VH_3D.failed;
// ── materials ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Soft vinyl: matte, with a faint clearcoat sheen. Decor materials (D) remember their colour, so «Presentació del decorat» can fade them.
function vhV(col,r=.55){const k=col+':'+r;let m=VH_3D.mats.get(k);if(!m){const T=vhP3();m=new T.MeshPhysicalMaterial({color:col,roughness:r,clearcoat:.25,clearcoatRoughness:.55});VH_3D.mats.set(k,m);}return m;}
function vhD(col,r=.9){const T=vhP3(),m=new T.MeshStandardMaterial({color:col,roughness:r});m.userData.base=new T.Color(col);VH_3D.decorMats.push(m);return m;}
function vhDV(col,r=.6){const T=vhP3(),m=new T.MeshPhysicalMaterial({color:col,roughness:r,clearcoat:.2,clearcoatRoughness:.6});m.userData.base=new T.Color(col);VH_3D.decorMats.push(m);return m;}
function vhM(g,m,parent,{cast=true,recv=true}={}){const T=vhP3(),o=new T.Mesh(g,m);o.castShadow=cast;o.receiveShadow=recv;if(parent)parent.add(o);return o;}
const vhRB=(w,h,d,r,s=4)=>{const T=vhP3();return new T.RoundedBoxGeometry(w,h,d,s,Math.max(.01,Math.min(r,Math.min(w,h,d)/2-.01)));};
function vhRRShape(w,h,r){const T=vhP3(),s=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2,h/2);s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
const vhC=VH_PALETTE;
// ── the pieces ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// The chassis: a grey plate with four peg bosses and two axles with their caps (in chassis units: 30 long, 14 wide, y up).
function vhChassis(){const T=vhP3(),g=new T.Group();vhM(vhRB(30,3.2,14,1.4),vhV(vhC.gris,.6),g).position.y=3.6;
 for(const x of[-11,11])for(const z of[-4.8,4.8]){vhM(new T.CylinderGeometry(2.3,2.5,2.4,28),vhV(vhC.gris,.6),g).position.set(x,5.6,z);vhM(new T.CylinderGeometry(1.25,1.25,.6,24),vhV(0x6f7386,.8),g,{cast:false}).position.set(x,6.6,z);}
 for(const x of[-11,11]){const a=vhM(new T.CylinderGeometry(.9,.9,22,20),vhV(vhC.gris,.45),g);a.rotation.x=Math.PI/2;a.position.set(x,3.6,0);for(const z of[-11,11])vhM(new T.SphereGeometry(.9,16,10),vhV(vhC.gris,.45),g).position.set(x,3.6,z);}
 return g;}
// A wheel: the tyre is a lathe with rounded shoulders, the hub a short cylinder with a cap; knobbly tyres get their lugs.
function vhWheel(col,hub,{r=3.6,w=2.8,lug=false,spokes=0}={}){const T=vhP3(),g=new T.Group(),p=[],rr=w*.42;p.push(new T.Vector2(r*.55,-w/2));for(let i=0;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI/2;p.push(new T.Vector2(r-rr+Math.cos(a)*rr,-w/2+rr+Math.sin(a)*rr));}for(let i=0;i<=8;i++){const a=i/8*Math.PI/2;p.push(new T.Vector2(r-rr+Math.cos(a)*rr,w/2-rr+Math.sin(a)*rr));}p.push(new T.Vector2(r*.55,w/2));
 const t=vhM(new T.LatheGeometry(p,40),vhV(col,.72),g);t.rotation.x=Math.PI/2;
 if(lug)for(let i=0;i<12;i++){const k=vhM(vhRB(1.3,1,w*.95,.4,2),vhV(col,.72),g),a=i/12*Math.PI*2;k.position.set(Math.cos(a)*(r+.2),Math.sin(a)*(r+.2),0);k.rotation.z=a;}
 const h=vhM(new T.CylinderGeometry(r*.56,r*.58,w*.9,32),vhV(hub),g);h.rotation.x=Math.PI/2;
 if(spokes)for(let i=0;i<spokes;i++){const k=vhM(vhRB(r*.9,1.1,w*.5,.4,2),vhV(col,.6),g);k.rotation.z=i/spokes*Math.PI;k.position.z=w*.46;}
 const c=vhM(new T.CylinderGeometry(r*.24,r*.26,w*.9+.9,24),vhV(hub),g);c.rotation.x=Math.PI/2;return g;}
export const VH_WHEEL_SPEC=Object.freeze({tacs:{col:vhC.marina,hub:vhC.groc,r:3.6,w:2.9,lug:true},primes:{col:vhC.marina,hub:vhC.corall,r:3.3,w:1.9},fusta:{col:vhC.fusta,hub:vhC.verd,r:3.4,w:3.4,spokes:3}});
function vhWheelSet(kind){const T=vhP3(),g=new T.Group(),S=VH_WHEEL_SPEC[kind]||VH_WHEEL_SPEC.tacs;[[-11,-11.8],[11,-11.8],[-11,11.8],[11,11.8]].forEach(([x,z])=>{const w=vhWheel(S.col,S.hub,S);w.position.set(x,3.6,z);if(z<0)w.rotation.y=Math.PI;w.userData.wheel=true;g.add(w);});g.userData.r=S.r;return g;}
// The side profile of each body (x along the vehicle, y up; the two wheel arches are cut out) and where its roof is for the accessory.
export const VH_BODY_SPEC=Object.freeze({familiar:{roof:[-5.5,13.6],glass:'familiar'},autobus:{roof:[0,15.8],glass:'autobus'},furgoneta:{roof:[-2,15.2],glass:'furgoneta'},curses:{roof:[-5.5,10.6],glass:'curses'}});
function vhBodyShape(kind){const T=vhP3(),s=new T.Shape(),ar=4.3,arches=()=>{s.absarc(-11,0,ar,Math.PI,0,true);s.lineTo(6.7,0);s.absarc(11,0,ar,Math.PI,0,true);};
 if(kind==='autobus'){s.moveTo(-17,0);s.lineTo(-15.4,0);arches();s.lineTo(17,0);s.quadraticCurveTo(18.6,0,18.4,3);s.lineTo(17.8,12);s.quadraticCurveTo(17.4,15.6,14,15.8);s.lineTo(-15,15.8);s.quadraticCurveTo(-18,15.8,-18,12.8);s.lineTo(-18,1.6);s.quadraticCurveTo(-18,0,-17,0);}
 else if(kind==='furgoneta'){s.moveTo(-16,0);s.lineTo(-15.4,0);arches();s.lineTo(16.4,0);s.quadraticCurveTo(17.6,0,17.4,3);s.lineTo(16.6,8.5);s.quadraticCurveTo(15,15,11,15.2);s.lineTo(-15,15.2);s.quadraticCurveTo(-17,15.2,-17,13);s.lineTo(-17,1.5);s.quadraticCurveTo(-17,0,-16,0);}
 else if(kind==='curses'){s.moveTo(-17,0);s.lineTo(-15.4,0);arches();s.lineTo(17.8,0);s.quadraticCurveTo(19.4,0,19,2.2);s.quadraticCurveTo(17.6,5,12,5.4);s.lineTo(4.5,5.6);s.quadraticCurveTo(2.6,10.5,-3,10.6);s.lineTo(-8,10.6);s.quadraticCurveTo(-12,10.4,-13,7.2);s.lineTo(-17.4,7.2);s.quadraticCurveTo(-18.6,7.2,-18.4,5);s.quadraticCurveTo(-18.2,1,-17,0);}
 else{s.moveTo(-16.6,0);s.lineTo(-15.4,0);arches();s.lineTo(16,0);s.quadraticCurveTo(17.4,0,17.2,2.4);s.quadraticCurveTo(17,6.2,13.5,6.8);s.lineTo(7.5,7.4);s.quadraticCurveTo(5,13.4,0,13.6);s.lineTo(-11,13.6);s.quadraticCurveTo(-17.6,13.4,-18.4,7.5);s.quadraticCurveTo(-18.8,1.2,-16.6,0);}
 return s;}
// The glass is one continuous dark band (never two round lamps or two windows that read as eyes): a wrap-around strip on the car, a wide
// windscreen on the van, a band of windows on the bus, a low visor on the racer. The front has a single yellow bumper bar.
function vhGlassShape(kind){const T=vhP3(),q=new T.Shape();
 if(kind==='autobus'){q.moveTo(16.9,8.6);q.lineTo(16.6,13.6);q.lineTo(11,13.6);q.lineTo(11,8.6);q.closePath();}
 else if(kind==='furgoneta'){q.moveTo(15.4,9);q.quadraticCurveTo(14,13.6,10.8,13.8);q.lineTo(5,13.8);q.lineTo(5,9);q.closePath();}
 else if(kind==='curses'){q.moveTo(3.4,6.4);q.quadraticCurveTo(2.2,9.4,-2.4,9.5);q.lineTo(-6,9.5);q.lineTo(-6,6.4);q.closePath();}
 else{q.moveTo(6.2,7.9);q.quadraticCurveTo(4.3,12.3,0,12.5);q.lineTo(-9.6,12.5);q.quadraticCurveTo(-14.2,12.3,-15.2,8.1);q.closePath();}
 return q;}
const vhBodyGeo={},vhGlassGeo={};
function vhBody(kind,colorKey){const T=vhP3(),g=new T.Group(),depth=14,bev=2.6;
 if(!vhBodyGeo[kind]){const geo=new T.ExtrudeGeometry(vhBodyShape(kind),{depth:depth-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev*.85,bevelSegments:8,curveSegments:32});geo.translate(0,0,-(depth-2*bev)/2);geo.computeVertexNormals();vhBodyGeo[kind]=geo;
  const gd=depth+1.2-1.6,gg=new T.ExtrudeGeometry(vhGlassShape(kind),{depth:gd,bevelEnabled:true,bevelThickness:.8,bevelSize:.6,bevelSegments:3,curveSegments:16});gg.translate(0,0,-gd/2);vhGlassGeo[kind]=gg;}
 const body=vhM(vhBodyGeo[kind],vhV(vhC[colorKey]||vhC.blau,.55).clone(),g);body.userData.paint=true;vhM(vhGlassGeo[kind],vhV(vhC.marina,.35),g);
 if(kind==='autobus')for(let i=0;i<3;i++)vhM(vhRB(6,4.6,depth+1.4,1.3),vhV(vhC.marina,.35),g).position.set(5-i*8,11.1,0);
 if(kind==='furgoneta'){vhM(vhRB(.8,8,10,.3,2),vhV(vhC.marina,.35),g).position.set(-16.8,8.6,0);}
 if(kind==='curses'){for(const z of[-4,4])vhM(vhRB(1.6,4.2,1.6,.5,2),vhV(vhC.marina,.5),g).position.set(-16,9.3,z);vhM(vhRB(5,1.6,15.6,.7,3),vhV(vhC.marina,.5),g).position.set(-16.4,11.8,0);}
 vhM(vhRB(2.4,2.4,depth-1,1.1),vhV(vhC.groc),g).position.set(kind==='autobus'?18.2:kind==='curses'?19:17.2,1.8,0);
 return g;}
// The accessories: the roof box with its lid and the three balls inside; the trailer with its three blocks; the flag on its pole.
function vhTop(kind){const T=vhP3(),g=new T.Group();
 if(kind==='baca'){for(const z of[-5,5]){const r=vhM(new T.CapsuleGeometry(.9,18,4,12),vhV(vhC.verd),g);r.rotation.z=Math.PI/2;r.position.set(0,1.1,z);}for(const x of[-7,7]){const r=vhM(new T.CapsuleGeometry(.75,9,4,10),vhV(vhC.verd),g);r.rotation.x=Math.PI/2;r.position.set(x,1.1,0);}
  const box=new T.Group();box.position.y=1.6;g.add(box);vhM(vhRB(13,3.2,8.4,1.1),vhV(vhC.corall),box).position.y=1.6;const lid=new T.Group();lid.position.set(0,3.2,-4.2);box.add(lid);vhM(vhRB(13.2,1.4,8.6,.7),vhV(vhC.corall),lid).position.set(0,.7,4.3);vhM(vhRB(5,.8,1.6,.3,2),vhV(vhC.groc),lid).position.set(0,1.6,8.2);lid.userData.lid=true;
  const balls=new T.Group();balls.position.set(0,3.3,0);g.add(balls);[[vhC.blau,-3],[vhC.groc,0],[vhC.verd,3]].forEach(([col,x],i)=>{const b=vhM(new T.SphereGeometry(1.7,20,14),vhV(col,.5),balls);b.position.set(x,0,0);b.userData.ball=i;b.visible=false;});g.userData.balls=balls;g.userData.lid=lid;}
 else if(kind==='remolc'){const tr=new T.Group();tr.position.set(-29,0,0);g.add(tr);vhM(vhRB(16,2.6,13,1.2),vhV(vhC.gris,.6),tr).position.y=3.6;vhM(vhRB(2,1.6,2,.6,2),vhV(vhC.gris,.6),g).position.set(-20,4.2,0);vhM(new T.CylinderGeometry(.7,.7,8,12),vhV(vhC.gris,.45),g).rotation.z=Math.PI/2;g.children[g.children.length-1].position.set(-21,4.2,0);
  const ax=vhM(new T.CylinderGeometry(.8,.8,20,16),vhV(vhC.gris,.45),tr);ax.rotation.x=Math.PI/2;ax.position.set(-1,3.4,0);for(const z of[-10.6,10.6]){const w=vhWheel(vhC.marina,vhC.groc,{r:3.1,w:2.4});w.position.set(-1,3.4,z);if(z<0)w.rotation.y=Math.PI;tr.add(w);w.userData.wheel=true;}
  const blocks=new T.Group();tr.add(blocks);blocks.position.y=4.9;[[vhC.corall,-4,0],[vhC.groc,2.5,0],[vhC.blau,-1,4.4]].forEach(([col,x,y],i)=>{const b=vhM(vhRB(4.4,4.4,4.4,.9),vhV(col),blocks);b.position.set(x,2.2+y,0);b.userData.block=i;b.userData.home=b.position.clone();});g.userData.blocks=blocks;g.userData.trailer=tr;}
 else{vhM(new T.CylinderGeometry(.55,.65,11,12),vhV(vhC.crema,.7),g).position.y=5.5;vhM(new T.SphereGeometry(.9,14,10),vhV(vhC.groc),g).position.y=11.2;const fs=new T.Shape();fs.moveTo(0,0);fs.lineTo(7.5,-1.6);fs.lineTo(0,-4.2);fs.closePath();const fg=new T.ExtrudeGeometry(fs,{depth:.5,bevelEnabled:true,bevelThickness:.3,bevelSize:.3,bevelSegments:2});fg.translate(0,0,-.25);const flag=vhM(fg,vhV(vhC.corall,.7),g);flag.position.set(-.5,10.8,0);flag.rotation.y=Math.PI;flag.userData.flag=true;g.userData.flag=flag;}
 return g;}
// The paint tin of a colour pick: a cream tin with the colour on its band and lid, and a drip.
function vhTin(colorKey){const T=vhP3(),g=new T.Group(),col=vhC[colorKey]||vhC.blau;vhM(new T.CylinderGeometry(4.6,4.3,7.5,32),vhV(vhC.crema,.75),g).position.y=3.75;vhM(new T.CylinderGeometry(4.7,4.7,2.2,32),vhV(col,.5),g).position.y=3.2;vhM(new T.CylinderGeometry(4.2,4.2,1,32),vhV(col,.45),g).position.y=7.9;vhM(new T.TorusGeometry(4.4,.45,10,32),vhV(vhC.gris,.5),g).rotation.x=Math.PI/2;g.children[3].position.y=7.5;const d=vhM(new T.CapsuleGeometry(.7,2.4,4,10),vhV(col,.45),g);d.position.set(4.4,5.4,1.2);return g;}
// A piece for the tray by stage and id: a body in its colour, the four wheels on a small stand, an accessory, a paint tin.
export function vhPiece(kind,id){const T=vhP3(),g=new T.Group();if(kind==='body'){g.add(vhBody(id,VH_BODY_COLOR[id]||'blau'));}else if(kind==='wheels'){const S=VH_WHEEL_SPEC[id]||VH_WHEEL_SPEC.tacs;[[-4.6,4.2],[4.6,4.2],[-4.6,-4.2],[4.6,-4.2]].forEach(([x,y],i)=>{const w=vhWheel(S.col,S.hub,S);w.position.set(x,y,(i%2)*1.5);w.rotation.y=.35;g.add(w);});g.userData.display=true;}else if(kind==='top'){const t=vhTop(id);if(id==='remolc')t.position.x=22;g.add(t);}else g.add(vhTin(id));return g;}
// ── the workshop and the room ────────────────────────────────────────────────────────────────────────────────────────────────────
function vhPlanks(){const cv=document.createElement('canvas');cv.width=512;cv.height=512;const g=cv.getContext('2d');g.fillStyle='#d9b27e';g.fillRect(0,0,512,512);for(let i=0;i<8;i++){const y=i*64;g.fillStyle=i%2?'#d4ab76':'#dcb684';g.fillRect(0,y,512,64);g.fillStyle='#c79c69';g.fillRect(0,y,512,2);const off=(i*181)%512;g.fillRect(off,y,2,64);for(let k=0;k<6;k++){g.fillStyle=`rgba(170,125,80,${.06+.05*((i*7+k*3)%3)})`;g.fillRect(0,y+8+k*9,512,1.5);}}const T=vhP3(),t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,2.6);t.anisotropy=4;return t;}
function vhWorkshop(scene){const T=vhP3(),DEC=new T.Group();DEC.name='decor';scene.add(DEC);VH_3D.parts.decor=DEC;
 // the wall with its skirting board and window, the hills of the frieze
 vhM(new T.PlaneGeometry(1500,520),vhD(vhC.paret,1),DEC,{cast:false,recv:true}).position.set(0,60,-100);vhM(vhRB(1500,14,6,2),vhD(vhC.crema,.8),DEC,{cast:false}).position.set(0,VH_FLOOR+7,-96);
 let hz=0;for(const [x,r,col] of [[-250,80,vhC.menta],[260,120,0x8fdcc4],[120,50,0x9fe3cd],[-520,95,0x9fe3cd],[520,70,vhC.menta]]){hz+=.4;vhM(new T.CircleGeometry(r,48),vhD(col,1),DEC,{cast:false,recv:false}).position.set(x,10,-98+hz);}
 const win=new T.Group();win.position.set(-430,150,-97);DEC.add(win);vhM(vhRB(150,190,6,4),vhD(vhC.crema,.8),win,{cast:false});const glass=vhM(new T.PlaneGeometry(130,170),new T.MeshBasicMaterial({color:0xeaf2ff}),win,{cast:false,recv:false});glass.position.z=3.2;VH_3D.parts.glass=glass;vhM(vhRB(4,170,3,1),vhD(vhC.crema,.8),win,{cast:false}).position.z=4;vhM(vhRB(130,4,3,1),vhD(vhC.crema,.8),win,{cast:false}).position.z=4;
 const moon=vhM(new T.CircleGeometry(16,32),new T.MeshBasicMaterial({color:0xfff6d0}),win,{cast:false,recv:false});moon.position.set(28,46,3.6);moon.visible=false;VH_3D.parts.moon=moon;
 // the pegboard with its tools, the shelf with its boxes
 const peg=new T.Group();DEC.add(peg);peg.position.set(-160,44,-90);peg.scale.setScalar(1.25);vhM(vhRB(70,40,4,4),vhDV(vhC.menta,.7),peg);
 const holeG=new T.CylinderGeometry(.9,.9,1,10),holes=new T.InstancedMesh(holeG,vhD(0x4d9e8a,1),50);let hi=0;for(let ix=0;ix<10;ix++)for(let iy=0;iy<5;iy++){holes.setMatrixAt(hi++,new T.Matrix4().makeRotationX(Math.PI/2).setPosition(-29+ix*6.4,-15+iy*7.5,2.05));}holes.count=hi;peg.add(holes);
 const ws=new T.Shape();ws.moveTo(-1.6,-12);ws.lineTo(1.6,-12);ws.lineTo(1.6,6);ws.absarc(0,9,4.2,-Math.PI/2+.45,Math.PI*1.5-.45,false);ws.closePath();const wg=new T.ExtrudeGeometry(ws,{depth:1.2,bevelEnabled:true,bevelThickness:.8,bevelSize:.8,bevelSegments:4});const wrench=vhM(wg,vhDV(vhC.corall),peg);wrench.position.set(-18,0,2.5);const hook=new T.Group();hook.position.set(-18,10.5,2.5);peg.add(hook);peg.remove(wrench);wrench.position.set(0,-10.5,0);hook.add(wrench);VH_3D.parts.wrench=hook;
 vhM(vhRB(2.8,20,2.4,1.2),vhDV(vhC.groc),peg).position.set(0,-3,3.2);vhM(vhRB(11,5.5,4,2.2),vhDV(vhC.blau),peg).position.set(0,8,3.6);vhM(vhRB(3.6,11,3.6,1.7),vhDV(vhC.blau),peg).position.set(18,-7,3.4);vhM(new T.CylinderGeometry(.8,.8,13,12),vhDV(vhC.groc),peg).position.set(18,5,3.4);
 const sh=new T.Group();DEC.add(sh);sh.position.set(150,30,-88);sh.scale.setScalar(1.3);vhM(vhRB(56,5,12,2.4),vhDV(vhC.prestatge),sh);for(const x of[-18,18])vhM(vhRB(4,9,4,1.8),vhDV(vhC.groc),sh).position.set(x,-6,0);vhM(vhRB(22,13,11,2),vhDV(vhC.groc),sh).position.set(-8,9,0);vhM(vhRB(12,8,9,1.8),vhDV(vhC.corall),sh).position.set(13,6.5,0);vhM(new T.SphereGeometry(4,20,14),vhDV(vhC.blau),sh).position.set(22,6.5,0);
 // the desk lamp (lit at night)
 const lamp=new T.Group();lamp.position.set(238,0,-40);DEC.add(lamp);vhM(new T.CylinderGeometry(9,10,2.4,24),vhDV(vhC.verd),lamp).position.y=1.2;vhM(new T.CylinderGeometry(1.1,1.1,60,12),vhDV(vhC.verd),lamp).position.y=31;const shade=vhM(new T.CylinderGeometry(5,12,14,28,1,true),vhDV(vhC.verd),lamp);shade.position.set(-10,62,0);shade.rotation.z=.6;shade.material.side=T.DoubleSide;const bulb=new T.PointLight(0xffd9a0,0,900,2);bulb.position.set(-16,54,0);lamp.add(bulb);VH_3D.parts.bulb=bulb;
 // the bench: a teal slab with a cream top, and its legs
 const bench=new T.Group();scene.add(bench);VH_3D.parts.bench=bench;vhM(vhRB(VH_BENCH.w,12,VH_BENCH.d,10),vhV(vhC.verd,.6),bench).position.set(0,-7,VH_BENCH.z);vhM(vhRB(VH_BENCH.w-20,2,VH_BENCH.d-16,6),vhV(vhC.crema,.82),bench).position.set(0,-1,VH_BENCH.z);
 for(const x of[-250,250])for(const z of[-70,130])vhM(vhRB(18,VH_FLOOR*-1-12,18,5),vhV(vhC.verd,.6),bench).position.set(x,(VH_FLOOR-12)/2,z);
 // the floor (planks) and, for the decor without the room, a shadow catcher
 const floor=vhM(new T.PlaneGeometry(1800,1400),new T.MeshStandardMaterial({map:vhPlanks(),roughness:.85}),DEC,{cast:false});floor.rotation.x=-Math.PI/2;floor.position.set(0,VH_FLOOR,350);floor.material.userData.base=new T.Color(0xffffff);VH_3D.decorMats.push(floor.material);
 const catcher=vhM(new T.PlaneGeometry(1800,1400),new T.ShadowMaterial({opacity:.22}),scene,{cast:false});catcher.rotation.x=-Math.PI/2;catcher.position.set(0,VH_FLOOR+.3,350);catcher.visible=false;VH_3D.parts.catcher=catcher;
 // the rug, the bed, the blocks and the ball of the room
 const rug=vhM(new T.CylinderGeometry(1,1,1.6,64),vhDV(vhC.menta,.95),DEC,{cast:false});rug.scale.set(240,1,180);rug.position.set(-40,VH_FLOOR+.8,430);const rim=vhM(new T.TorusGeometry(1,.035,8,72),vhDV(vhC.corall,.9),DEC,{cast:false});rim.scale.set(226,170,1);rim.rotation.x=Math.PI/2;rim.position.set(-40,VH_FLOOR+1.9,430);
 const bed=new T.Group();bed.position.set(690,VH_FLOOR,120);DEC.add(bed);vhM(vhRB(230,60,420,12),vhDV(vhC.fusta,.7),bed).position.y=30;vhM(vhRB(222,34,410,14),vhDV(vhC.blau,.85),bed).position.y=76;vhM(vhRB(214,16,120,8),vhDV(vhC.crema,.9),bed).position.set(0,100,-130);vhM(vhRB(240,180,20,8),vhDV(vhC.fusta,.7),bed).position.set(0,90,-215);
 const blocks=new T.Group();blocks.position.set(-40,VH_FLOOR,430);DEC.add(blocks);[[vhC.corall,0,0,0],[vhC.groc,0,26,0],[vhC.blau,0,52,0],[vhC.verd,34,0,10]].forEach(([col,x,y,z])=>vhM(vhRB(26,26,26,4.5),vhDV(col),blocks).position.set(x,13+y,z));
 vhM(new T.SphereGeometry(22,28,20),vhDV(vhC.groc,.5),DEC).position.set(300,VH_FLOOR+22,760);
 // the ramp from the bench to the floor, and the garage shelf where the vehicle parks
 const path=vhPathOf('habitacio'),a=new T.Vector3(265,2,86),b=new T.Vector3(492,-200,352);const ramp=new T.Group();scene.add(ramp);VH_3D.parts.ramp=ramp;const len=a.distanceTo(b)+40,mid=a.clone().add(b).multiplyScalar(.5);ramp.position.copy(mid);ramp.lookAt(b);const bed2=vhM(vhRB(60,6,len,3),vhV(vhC.verd,.6),ramp);bed2.position.y=-6;for(const x of[-31,31])vhM(vhRB(5,10,len,2),vhV(vhC.groc,.6),ramp).position.set(x,-3,0);
 const gar=new T.Group();gar.position.set(-690,VH_FLOOR,420);scene.add(gar);VH_3D.parts.garage=gar;vhM(vhRB(170,8,150,4),vhV(vhC.verd,.6),gar).position.y=4;vhM(vhRB(170,8,150,4),vhV(vhC.verd,.6),gar).position.y=118;vhM(vhRB(8,118,150,3),vhV(vhC.verd,.6),gar).position.set(-81,61,0);vhM(vhRB(170,118,8,3),vhV(vhC.crema,.8),gar).position.set(0,61,-71);vhM(vhRB(150,26,6,3),vhV(vhC.corall,.6),gar).position.set(0,100,74);}
// ── the lights of the day ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const VH_LIGHT_SET=Object.freeze({mati:{sky:0xdfe4ff,ground:0xf2d9c0,hemi:1.5,key:0xfff1dc,keyI:2.1,pos:[-90,220,160],bg:0xa7b2f3,wall:1,exposure:1,glass:0xeaf2ff,bulb:0},
 tarda:{sky:0xffffff,ground:0xf5e3cf,hemi:1.7,key:0xffffff,keyI:2.3,pos:[70,240,150],bg:0xb3c0f5,wall:1.04,exposure:1.02,glass:0xf7fbff,bulb:0},
 capvespre:{sky:0xffd3b0,ground:0xe8b592,hemi:1.25,key:0xffa868,keyI:2.5,pos:[240,110,80],bg:0xd7a2b9,wall:.92,exposure:.98,glass:0xffc48a,bulb:0},
 nit:{sky:0x7a8ad8,ground:0x3a3f70,hemi:1,key:0xcfdcff,keyI:1.05,pos:[-60,210,120],bg:0x3b4280,wall:.55,exposure:.95,glass:0x6f86d8,bulb:70000}});
function vhLights(scene){const T=vhP3(),hemi=new T.HemisphereLight(0xdfe4ff,0xf2d9c0,1.5);scene.add(hemi);const key=new T.DirectionalLight(0xffffff,2.1);key.position.set(-90,220,160);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-760,right:760,top:520,bottom:-520,near:10,far:1600});key.shadow.radius=10;key.shadow.blurSamples=12;key.shadow.bias=-.0008;key.target.position.set(-60,-100,250);scene.add(key.target);scene.add(key);
 const rim=new T.DirectionalLight(0xcfe0ff,.6);rim.position.set(80,60,-120);scene.add(rim);VH_3D.lights={hemi,key,rim};}
function vhApplyLight(name){const T=vhP3(),L=VH_LIGHT_SET[name]||VH_LIGHT_SET.mati,{hemi,key}=VH_3D.lights;hemi.color.set(L.sky);hemi.groundColor.set(L.ground);hemi.intensity=L.hemi;key.color.set(L.key);key.intensity=L.keyI;key.position.set(...L.pos);VH_3D.r.toneMappingExposure=L.exposure;VH_3D.scene.environmentIntensity=name==='nit'?.18:.35;
 VH_3D.parts.glass.material.color.set(L.glass);VH_3D.parts.moon.visible=name==='nit';VH_3D.parts.bulb.intensity=L.bulb;VH_3D.bg=new T.Color(L.bg);VH_3D.wallK=L.wall;}
// «Presentació del decorat»: the room and the workshop (the decor) fade towards the base colour, or go; the bench, the ramp, the garage and
// the toys stay whole. Without the decor the floor becomes a shadow catcher on the base colour.
function vhApplyDecor(decor){const T=vhP3(),base=new T.Color(decor.base),fade=decor.fade,tmp=new T.Color();for(const m of VH_3D.decorMats){const b=m.userData.base;if(!b)continue;tmp.copy(b);if(VH_3D.wallK!==1&&m.map===undefined&&b.getHex()===vhC.paret)tmp.multiplyScalar(VH_3D.wallK);m.color.copy(tmp).lerp(base,1-fade);}
 VH_3D.parts.decor.visible=fade>0;VH_3D.parts.catcher.visible=fade<=0;VH_3D.scene.background=fade<=0?base:VH_3D.bg.clone().lerp(base,1-fade);}
// ── the tray (its own scene, drawn with an orthographic camera in the pixels of the screen) ─────────────────────────────────────
function vhTrayScene(){const T=vhP3(),s=new T.Scene();s.add(new T.HemisphereLight(0xdfe4ff,0xf2d9c0,1.5));const k=new T.DirectionalLight(0xffffff,1.9);k.position.set(-80,160,220);s.add(k);const cam=new T.OrthographicCamera(0,100,0,-100,-900,900);cam.position.set(0,0,300);cam.lookAt(0,0,0);VH_3D.tray=s;VH_3D.tcam=cam;VH_3D.trayParts={frame:null,cells:[],pieces:[],shadows:[]};}
// ── building, step by step under the loading cover ───────────────────────────────────────────────────────────────────────────────
export function vhLoad(){if(!vhGLAvailable())return 1;const r=vhR();if(!r||VH_3D.lost)return 1;const T=vhP3();
 try{switch(VH_3D.step){
  case 0:{const scene=new T.Scene();VH_3D.scene=scene;const pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(new T.RoomEnvironment(),.04).texture;pm.dispose();scene.environmentIntensity=.35;VH_3D.cam=new T.PerspectiveCamera(26,16/9,2,4000);vhLights(scene);VH_3D.bg=new T.Color(vhC.paret);VH_3D.wallK=1;break;}
  case 1:vhWorkshop(VH_3D.scene);break;
  case 2:{const toy=new T.Group();toy.scale.setScalar(VH_TOY);VH_3D.scene.add(toy);VH_3D.parts.toy=toy;const ch=vhChassis();toy.add(ch);VH_3D.parts.chassis=ch;VH_3D.parts.bodies={};for(const k of ['familiar','autobus'])VH_3D.parts.bodies[k]=vhBodyCached(k,VH_BODY_COLOR[k]);break;}
  case 3:for(const k of ['furgoneta','curses'])VH_3D.parts.bodies[k]=vhBodyCached(k,VH_BODY_COLOR[k]);VH_3D.parts.wheels={};for(const k of ['tacs','primes','fusta']){const w=vhWheelSet(k);w.visible=false;VH_3D.parts.toy.add(w);VH_3D.parts.wheels[k]=w;}break;
  case 4:VH_3D.parts.tops={};for(const k of ['baca','remolc','bandera']){const t=vhTop(k);t.visible=false;VH_3D.parts.toy.add(t);VH_3D.parts.tops[k]=t;}VH_3D.parts.flyer=new T.Group();VH_3D.scene.add(VH_3D.parts.flyer);VH_3D.parts.meta=vhMeta();VH_3D.parts.meta.visible=false;VH_3D.scene.add(VH_3D.parts.meta);break;
  case 5:vhTrayScene();vhApplyLight('mati');vhApplyDecor({fade:1,base:'#000000'});break;
  case 6:{// every program is compiled now (the tray's too), so no pick waits for a shader; the invisible pieces are shown for the compile
   const shown=[];VH_3D.scene.traverse(o=>{if(o.visible===false){o.visible=true;shown.push(o);}});for(const n of ['mati','nit'])vhApplyLight(n);r.compile(VH_3D.scene,VH_3D.cam);for(const o of shown)o.visible=false;vhApplyLight('mati');
   const t=vhPiece('body','familiar');VH_3D.tray.add(t);const cell=vhM(vhRB(40,30,3,4),vhV(vhC.crema,.85).clone(),VH_3D.tray);const fr=vhM(vhRB(60,40,5,4),vhV(vhC.verd,.6),VH_3D.tray);r.compile(VH_3D.tray,VH_3D.tcam);VH_3D.tray.remove(t,cell,fr);break;}
  case 7:{r.setSize(64,36,false);r.render(VH_3D.scene,VH_3D.cam);VH_3D.compiled=true;break;}}
 }catch(e){if(typeof console!=='undefined')console.warn('El taller de vehicles: three.js',e);VH_3D.failed=true;return 1;}
 VH_3D.step++;return Math.min(1,VH_3D.step/VH_STEPS_TOTAL);}
export const vhReady=()=>VH_3D.compiled&&!vhLost();
const vhBodyCache={};
function vhBodyCached(kind,colorKey){const k=kind+'/'+colorKey;if(!vhBodyCache[k]){const b=vhBody(kind,colorKey);b.visible=false;VH_3D.parts.toy.add(b);vhBodyCache[k]=b;}return vhBodyCache[k];}
// The finish banner of the flag's gag: two posts and a banner in front of the garage.
function vhMeta(){const T=vhP3(),g=new T.Group();g.position.set(-540,VH_FLOOR,450);for(const z of[-70,70]){vhM(new T.CylinderGeometry(3,3.4,120,14),vhV(vhC.crema,.7),g).position.set(0,60,z);vhM(new T.SphereGeometry(5,16,12),vhV(vhC.groc),g).position.set(0,122,z);}const ban=vhM(vhRB(4,22,146,1.5),vhV(vhC.corall,.7),g);ban.position.y=104;g.userData.banner=ban;for(let i=0;i<6;i++){vhM(vhRB(5,16,16,1,2),vhV(i%2?vhC.crema:vhC.marina,.7),ban).position.set(.6,0,-60+i*24);}return g;}
// ── drawing a frame ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
// view: {w,h,dpr, phase:'choose'|'snap'|'wait'|'ride'|'park', picks:{body,wheels,top,color}, pending:{kind,id,u}, kind, options:[ids],
// lights:[0.6..1], tray:{x,y,w,h,cells:[{x,y,w,h}]}, light:'mati'…, decor, t (clock), reduced, ride:{u,roll,gag,camera}, park:{u},
// quality, surprise}. Returns false when nothing could be drawn (no WebGL, context lost, not built yet).
const vhTmp={v:null,v2:null,box:null,q:null,m:null};
function vhTmps(){const T=vhP3();if(!vhTmp.v){vhTmp.v=new T.Vector3();vhTmp.v2=new T.Vector3();vhTmp.box=new T.Box3();vhTmp.q=new T.Quaternion();vhTmp.m=new T.Matrix4();vhTmp.up=new T.Vector3(0,1,0);vhTmp.col=new T.Color();}return vhTmp;}
export function vhRender(c,view){if(!vhGLAvailable()||vhLost()||!VH_3D.compiled)return false;const r=VH_3D.r,T=vhP3(),{w,h}=view,dpr=view.dpr||1;
 try{const scale=vhScaleFor(view.quality),W=Math.max(2,Math.round(w*dpr*scale)),H=Math.max(2,Math.round(h*dpr*scale));if(VH_3D.size[0]!==W||VH_3D.size[1]!==H){r.setSize(W,H,false);VH_3D.size=[W,H];}
  vhShadowFor(view.quality);
  if(view.light!==VH_3D.lastLight){VH_3D.lastLight=view.light;vhApplyLight(view.light);VH_3D.lastDecor='';}
  const dk=`${view.decor.fade}|${view.decor.base}`;if(dk!==VH_3D.lastDecor){VH_3D.lastDecor=dk;vhApplyDecor(view.decor);}
  vhPose(view);vhCamera(view);
  r.setScissorTest(false);r.setViewport(0,0,W,H);r.autoClear=true;r.render(VH_3D.scene,VH_3D.cam);
  const trayOn=view.tray&&(view.phase==='choose'||view.phase==='snap');if(trayOn)vhTrayDraw(view,W,H,scale*dpr);
  c.drawImage(VH_3D.cv,0,0,W,H,0,0,w,h);
  vhMeasure(view);return true;}
 catch(e){if(typeof console!=='undefined')console.warn('El taller de vehicles: frame',e);return false;}}
// «Qualitat»: the size of the picture and of the shadows. Automàtica starts high and comes down if the frames are slow.
const VH_TIERS=Object.freeze({alta:{scale:1,shadow:2048},mitjana:{scale:.75,shadow:1024},baixa:{scale:.55,shadow:0}});
function vhTier(q){return q&&q!=='auto'?q:VH_3D.tier;}
function vhScaleFor(q){return VH_TIERS[vhTier(q)]?.scale??1;}
function vhShadowFor(q){const t=vhTier(q),want=VH_TIERS[t]?.shadow??2048;if(VH_3D.shadowNow===want)return;VH_3D.shadowNow=want;const key=VH_3D.lights.key;key.castShadow=want>0;VH_3D.r.shadowMap.enabled=want>0;if(want>0&&key.shadow.mapSize.x!==want){key.shadow.mapSize.set(want,want);if(key.shadow.map){key.shadow.map.dispose();key.shadow.map=null;}}}
function vhMeasure(view){if(view.quality&&view.quality!=='auto')return;const now=performance.now();if(VH_3D.lastFrame){const dt=now-VH_3D.lastFrame;if(dt<250){VH_3D.frames++;if(dt>30)VH_3D.slow++;else VH_3D.fast++;}}VH_3D.lastFrame=now;
 if(VH_3D.frames>=90){if(VH_3D.slow>VH_3D.frames*.4&&VH_3D.tier!=='baixa'){VH_3D.tier=VH_3D.tier==='alta'?'mitjana':'baixa';}VH_3D.frames=VH_3D.slow=VH_3D.fast=0;}}
export const vhTierNow=()=>VH_3D.tier;
// The toy on the chassis: which body, wheels and accessory are on, the pending piece on its flight, the paint of the colour pick.
function vhPose(view){const T=vhP3(),tmp=vhTmps(),P=view.picks||{},pend=view.pending,toy=VH_3D.parts.toy,t=view.t||0;
 for(const k in VH_3D.parts.bodies)VH_3D.parts.bodies[k].visible=false;for(const k in vhBodyCache)vhBodyCache[k].visible=false;for(const k in VH_3D.parts.wheels)VH_3D.parts.wheels[k].visible=false;for(const k in VH_3D.parts.tops)VH_3D.parts.tops[k].visible=false;
 const flyer=VH_3D.parts.flyer;while(flyer.children.length)flyer.remove(flyer.children[0]);
 const color=P.color||(P.body?VH_BODY_COLOR[P.body]:'blau');let body=null;if(P.body){body=vhBodyCached(P.body,color);body.visible=true;body.position.set(0,6.9,0);body.rotation.set(0,0,0);body.scale.setScalar(1);}
 let wheels=null;if(P.wheels){wheels=VH_3D.parts.wheels[P.wheels];wheels.visible=true;wheels.position.set(0,0,0);}
 let top=null;if(P.top&&P.body){top=VH_3D.parts.tops[P.top];top.visible=true;const R=VH_BODY_SPEC[P.body].roof;top.position.set(P.top==='remolc'?0:R[0],P.top==='remolc'?0:6.9+R[1],0);top.rotation.set(0,0,0);vhGagRest(top);}
 // the ride: the toy along the circuit; otherwise at rest on the bench
 toy.position.set(0,0,0);toy.rotation.set(0,0,0);VH_3D.parts.meta.visible=false;if(VH_3D.parts.balls)for(const b of VH_3D.parts.balls)b.visible=false;
 if(view.phase==='ride'||view.phase==='park')vhRideStep(view,top);
 // the pending piece flies from the tray to its place (or the tin paints the body)
 if(pend&&view.phase==='snap'){vhFlight(view,pend,body,wheels);}
 // idle life of the workshop: the wrench swings on its hook
 if(VH_3D.parts.wrench)VH_3D.parts.wrench.rotation.z=view.reduced?0:Math.sin(t*1.1)*.06;}
function vhGagRest(top){if(top.userData.lid)top.userData.lid.rotation.x=0;if(top.userData.balls)for(const b of top.userData.balls.children){b.visible=false;}if(top.userData.blocks)for(const b of top.userData.blocks.children){b.position.copy(b.userData.home);b.rotation.set(0,0,0);}if(top.userData.flag){top.userData.flag.rotation.y=Math.PI;top.userData.flag.scale.x=1;}}
// Where a tray cell's centre is in the world of the bench scene, at the depth of the chassis: the start of a flight.
function vhTrayWorld(view,i){const tmp=vhTmps(),cell=view.tray.cells[i]||view.tray.cells[0],x=(cell.x+cell.w/2)/view.w*2-1,y=-((cell.y+cell.h/2)/view.h*2-1);const ref=tmp.v2.set(0,8*VH_TOY,0).project(VH_3D.cam);return tmp.v.set(x,y,ref.z).unproject(VH_3D.cam);}
function vhFlight(view,pend,body,wheels){const T=vhP3(),tmp=vhTmps(),u=vhClamp(pend.u),toy=VH_3D.parts.toy,from=vhTrayWorld(view,pend.index|0).clone();
 const settle=vhSettle(vhClamp((u-.62)/.38),1.6),fly=vhEase(vhClamp(u/.68)),arc=Math.sin(Math.PI*vhClamp(u/.68))*40;
 const place=(obj,targetLocal,rot0)=>{const tgt=toy.localToWorld(targetLocal.clone());const p=from.clone().lerp(tgt,fly);p.y+=arc+(1-fly)*0;obj.position.copy(toy.worldToLocal(p));const bob=(1-settle)*(u>.62?1:0);obj.position.y+=bob*1.2;obj.rotation.y=rot0*(1-fly);obj.rotation.x=(.42)*(1-fly);obj.scale.setScalar(1);};
 if(pend.kind==='body'){const b=vhBodyCached(pend.id,VH_BODY_COLOR[pend.id]);b.visible=true;place(b,new T.Vector3(0,6.9,0),-.4);}
 else if(pend.kind==='wheels'){const ws=VH_3D.parts.wheels[pend.id];ws.visible=true;place(ws,new T.Vector3(0,0,0),-.3);}
 else if(pend.kind==='top'&&body){const tp=VH_3D.parts.tops[pend.id],R=VH_BODY_SPEC[view.picks.body].roof;tp.visible=true;vhGagRest(tp);place(tp,new T.Vector3(pend.id==='remolc'?0:R[0],pend.id==='remolc'?0:6.9+R[1],0),-.3);}
 else if(pend.kind==='color'&&body){// the tin flies over the body, tips, and the paint runs over it from front to back
  let tin=VH_3D.parts.tins?.[pend.id];if(!tin){VH_3D.parts.tins=VH_3D.parts.tins||{};tin=vhTin(pend.id);VH_3D.parts.tins[pend.id]=tin;}VH_3D.parts.flyer.add(tin);const over=toy.localToWorld(new T.Vector3(0,30,0));const p=from.clone().lerp(over,vhEase(vhClamp(u/.45)));tin.position.copy(p);tin.scale.setScalar(VH_TOY);tin.rotation.z=vhEase(vhClamp((u-.4)/.25))*1.9;tin.rotation.y=-.4;tin.visible=u<.95;
  const k=vhEase(vhClamp((u-.45)/.45));const paint=body.children.find(o=>o.userData.paint);if(paint){const a=new T.Color(vhC[VH_BODY_COLOR[view.picks.body]||'blau']),b2=new T.Color(vhC[pend.id]||vhC.blau);paint.material.color.copy(a).lerp(b2,k);paint.material.clearcoat=.25+.5*Math.sin(Math.PI*k);}}}
// The camera: over the bench for the choices, closer for the wait, the shots of the ride, back to the bench for the garage.
const VH_CAM=Object.freeze({bench:{p:[0,205,345],l:[0,-22,-24]},wait:{p:[50,160,300],l:[0,8,-6]},room:{p:[0,520,1500],l:[-150,-150,380]},ramp:{p:[660,-30,640],l:[380,-100,250]},garage:{p:[-140,-30,920],l:[-580,-170,430]}});
function vhCamera(view){const T=vhP3(),tmp=vhTmps(),cam=VH_3D.cam;cam.aspect=view.w/view.h;cam.fov=view.w/view.h<1.1?34:26;
 const set=(S)=>{cam.position.set(...S.p);cam.lookAt(...S.l);};
 if(view.phase==='choose'||view.phase==='snap'){set(VH_CAM.bench);}
 else if(view.phase==='wait'){const k=vhEase(vhClamp(view.waitU*3));cam.position.set(...VH_CAM.bench.p).lerp(tmp.v.set(...VH_CAM.wait.p),k);tmp.v2.set(...VH_CAM.bench.l).lerp(tmp.v.set(...VH_CAM.wait.l),k);cam.lookAt(tmp.v2);}
 else if(view.phase==='ride'){const R=view.ride||{u:0},u=R.u,toyPos=VH_3D.parts.toy.position;
  if(R.camera==='tranquila'){set(VH_CAM.room);}
  else if(u<.22){set(VH_CAM.ramp);cam.lookAt(toyPos.x*.5+VH_CAM.ramp.l[0]*.5,toyPos.y+20,toyPos.z*.5+VH_CAM.ramp.l[2]*.5);}
  else if(u<.78){const dir=VH_3D.parts.toyDir||tmp.up,back=tmp.v.copy(dir).multiplyScalar(-370);cam.position.set(toyPos.x+back.x,toyPos.y+185,toyPos.z+back.z);cam.lookAt(toyPos.x+dir.x*90,toyPos.y+16,toyPos.z+dir.z*90);}
  else set(VH_CAM.garage);}
 else{// park: the garage, then back to the bench for the next round
  const u=view.park?.u||0;if(u<.62)set(VH_CAM.garage);else set(VH_CAM.bench);}
 cam.updateProjectionMatrix();}
// The ride: the toy follows the circuit of the room with the pace of its wheels; the wheels turn; the accessory plays its gag.
let vhCurve=null,vhCurveLen=0;
function vhRideStep(view,top){const T=vhP3(),tmp=vhTmps(),toy=VH_3D.parts.toy,R=view.ride||{u:0,roll:'tacs'},park=view.phase==='park';
 if(!vhCurve){vhCurve=new T.CatmullRomCurve3(vhPathOf('habitacio').map(p=>new T.Vector3(...p)),false,'centripetal',.5);vhCurveLen=vhCurve.getLength();}
 const roll=VH_ROLL[R.roll]||VH_ROLL.tacs;let u=park?1:vhClamp(R.u);let d=u-.085*Math.sin(2*Math.PI*u);d=vhClamp(d);
 const pos=vhCurve.getPointAt(d),tan=vhCurve.getTangentAt(d);VH_3D.parts.toyDir=(VH_3D.parts.toyDir||new T.Vector3()).copy(tan);
 toy.position.copy(pos);if(toy.position.y<VH_FLOOR)toy.position.y=VH_FLOOR;const yaw=Math.atan2(tan.x,tan.z)-Math.PI/2;const pitch=Math.asin(vhClamp(tan.y,-1,1));
 const dist=d*vhCurveLen,speed=(1-.085*2*Math.PI*Math.cos(2*Math.PI*u));
 toy.rotation.set(0,0,0);toy.rotateY(yaw);toy.rotateZ(pitch);
 if(!view.reduced&&!park){toy.position.y+=Math.abs(Math.sin(dist/(2*Math.PI*3.6*VH_TOY)*Math.PI*2))*2.2*roll.bounce;toy.rotateX(Math.sin(dist/40)*.05*roll.wobble);
  const d2=vhCurve.getTangentAt(vhClamp(d+.01)),curv=Math.atan2(d2.x,d2.z)-Math.atan2(tan.x,tan.z);toy.rotateX(-vhClamp(curv*speed*3,-.3,.3)*roll.lean);}
 if(park){const pu=vhClamp(view.park?.u||0);toy.position.x-=vhOut(vhClamp(pu/.5))*70;}
 // the wheels turn with the distance gone; the trailer's too
 const r=(VH_3D.parts.wheels[R.roll]?.userData.r||3.6)*VH_TOY,ang=dist/r;toy.traverse(o=>{if(o.userData.wheel)o.rotation.z=-ang*(o.rotation.y?-1:1)*(o.parent?.userData?.trailer?-1:1);});
 if(top)vhGag(view,top,u,park);}
// The gags: the lid opens and the three balls hop out and roll; the blocks jump off the trailer into a tower at the garage; the finish
// banner is up in front of the garage and the flag waves.
function vhGag(view,top,u,park){const G=VH_GAG[view.picks.top];if(!G)return;const t=view.t||0,T=vhP3(),tmp=vhTmps();
 if(G.kind==='pilotes'){const k=vhClamp((u-G.at)/.08);top.userData.lid.rotation.x=-vhOut(k)*1.6;for(const b of top.userData.balls.children)b.visible=false;
  if(!VH_3D.parts.balls){VH_3D.parts.balls=[vhC.blau,vhC.groc,vhC.verd].map(col=>{const b=vhM(new T.SphereGeometry(1.7*VH_TOY,20,14),vhV(col,.5),VH_3D.scene);b.visible=false;return b;});}
  const d0=vhClamp(G.at-.085*Math.sin(2*Math.PI*G.at)),p0=vhCurve.getPointAt(d0),tn=vhCurve.getTangentAt(d0),side=tmp.v2.set(-tn.z,0,tn.x);
  VH_3D.parts.balls.forEach((b,i)=>{const kb=vhClamp((u-G.at-.02-i*.03)/.16);if(kb<=0&&!park){b.visible=false;return;}const kk=park?1:kb;b.visible=true;const land=tmp.v.copy(p0).addScaledVector(side,(i-1)*70).addScaledVector(tn,-90-i*40);land.y=VH_FLOOR+1.7*VH_TOY;
   b.position.set(p0.x,VH_FLOOR+(6.9+13.6+6)*VH_TOY,p0.z).lerp(land,vhEase(kk));b.position.y+=Math.sin(Math.PI*kk)*90*(1-kk*.4)+(kk>.8?Math.abs(Math.sin((kk-.8)*Math.PI*5))*12*(1-kk):0);b.rotation.z=kk*4;});}
 else if(G.kind==='torre'){const pu=park?vhClamp(view.park?.u||0):0;top.userData.blocks.children.forEach((b,i)=>{const kb=vhClamp((pu-.08-i*.14)/.22);if(kb<=0){b.position.copy(b.userData.home);return;}const home=b.userData.home,to=[14,4.9+i*4.4-4.9,-10];b.position.set(home.x+(to[0]-home.x)*vhEase(kb),home.y+(to[1]-home.y)*kb+Math.sin(Math.PI*kb)*7,home.z+(to[2]-home.z)*vhEase(kb));b.rotation.y=vhEase(kb)*Math.PI/2*(i%2?1:-1);});}
 else{const f=top.userData.flag;if(f&&!view.reduced){f.rotation.y=Math.PI+Math.sin(t*5.2)*.18;f.scale.x=1-.08*Math.abs(Math.sin(t*5.2+1));}VH_3D.parts.meta.visible=u>G.at-.12||park;const k=vhClamp((u-(G.at-.12))/.1);VH_3D.parts.meta.userData.banner.position.y=180-vhSettle(k,1.5)*76;}}
// ── the tray ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// Its scene is drawn with an orthographic camera whose frustum is the tray's rectangle in CSS pixels: a unit is a pixel, so the cells sit
// exactly under the zones of the scanning (vehicles-art.js), and the ring of the focus drawn in 2D fits them.
function vhTrayDraw(view,W,H,k){const T=vhP3(),r=VH_3D.r,tray=view.tray,TP=VH_3D.trayParts,cam=VH_3D.tcam;cam.left=tray.x;cam.right=tray.x+tray.w;cam.top=-tray.y;cam.bottom=-(tray.y+tray.h);cam.updateProjectionMatrix();
 const key=`${tray.w}|${tray.h}|${tray.cells.length}|${view.kind}|${(view.options||[]).join(',')}`;if(TP.key!==key){TP.key=key;vhTrayBuild(view);}
 const t=view.t||0;TP.cells.forEach((cell,i)=>{const light=view.lights?.[i]??1,kk=vhClamp((light-.6)/.4),lift=4+vhEase(kk)*8,pc=TP.pieces[i];if(!pc)return;pc.position.y=cell.position.y+(view.reduced?6:lift);pc.rotation.y=(pc.children[0]?.userData.display?0:-.42)+(view.reduced?0:Math.sin(t*.9+i)*.03*kk);
  const hidden=view.pending&&view.phase==='snap'&&(view.pending.index|0)===i;pc.visible=!hidden;TP.shadows[i].visible=!hidden;TP.shadows[i].scale.setScalar(1-(lift-4)/40);
  cell.material.color.copy(vhTmps().col.set(vhC.crema)).lerp(vhTmps().col.set(view.decor.white?0xffffff:0x2a2f45),(1-kk)*(view.surprise?0:.16));});
 r.autoClear=false;r.setScissorTest(true);const sx=Math.round(tray.x*k),sy=Math.round(H-(tray.y+tray.h)*k),sw=Math.round(tray.w*k),sh=Math.round(tray.h*k);r.setViewport(sx,sy,sw,sh);r.setScissor(sx,sy,sw,sh);r.clearDepth();r.render(VH_3D.tray,cam);r.setScissorTest(false);r.setViewport(0,0,W,H);r.autoClear=true;}
function vhTrayBuild(view){const T=vhP3(),TP=VH_3D.trayParts,s=VH_3D.tray,tray=view.tray;for(const o of [TP.frame,...TP.cells,...TP.pieces,...TP.shadows])if(o)s.remove(o);TP.cells=[];TP.pieces=[];TP.shadows=[];
 const cx=tray.x+tray.w/2,cy=-(tray.y+tray.h/2);TP.frame=vhM(vhRB(tray.w,tray.h,10,Math.min(26,tray.h*.12)),vhV(vhC.verd,.6),s,{cast:false,recv:false});TP.frame.position.set(cx,cy,-40);
 const opts=view.options||[];tray.cells.forEach((cell,i)=>{const cc=vhM(vhRB(cell.w,cell.h,6,Math.min(18,cell.h*.1)),vhV(vhC.crema,.85).clone(),s,{cast:false,recv:false});cc.position.set(cell.x+cell.w/2,-(cell.y+cell.h/2),-30);TP.cells.push(cc);
  const sh=vhM(new T.CircleGeometry(1,32),new T.MeshBasicMaterial({color:0x4a4030,transparent:true,opacity:.16,depthWrite:false}),s,{cast:false,recv:false});sh.scale.set(cell.w*.3,cell.h*.14,1);sh.position.set(cc.position.x,cc.position.y-cell.h*.22,-26);TP.shadows.push(sh);
  const id=opts[i];if(id===undefined){TP.pieces.push(null);return;}const piv=new T.Group();piv.position.set(cc.position.x,cc.position.y,0);const pc=vhPiece(view.kind,id);if(pc.userData.display){piv.rotation.x=.12;piv.rotation.y=0;}else{piv.rotation.x=.42;piv.rotation.y=-.42;}const fit=vhPieceFit(view.kind,id,cell);pc.scale.setScalar(fit.k);pc.position.set(0,fit.y,0);piv.add(pc);s.add(piv);TP.pieces.push(piv);});}
// The scale of a piece in a cell (pixels per chassis unit) and its vertical offset, so that every option reads the same size.
function vhPieceFit(kind,id,cell){const base=Math.min(cell.w/44,cell.h/30);if(kind==='body')return {k:base*(id==='autobus'?.92:1),y:-cell.h*.2};if(kind==='wheels')return {k:base*1.55,y:0};if(kind==='top')return {k:base*(id==='remolc'?.95:1.35),y:-cell.h*(id==='bandera'?.34:.2)};return {k:base*1.35,y:-cell.h*.3};}
// The rectangle of the vehicle on the screen (CSS pixels), for the ring of the wait; null when it cannot be known.
export function vhVehicleRect(view){if(!VH_3D.parts?.toy||!VH_3D.cam)return null;const T=vhP3(),tmp=vhTmps(),box=tmp.box.makeEmpty(),b2=new T.Box3();VH_3D.parts.toy.updateWorldMatrix(true,true);VH_3D.parts.toy.traverseVisible(o=>{if(o.isMesh&&!o.userData.ball){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();b2.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);box.union(b2);}});if(box.isEmpty())return null;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
 for(const x of[box.min.x,box.max.x])for(const y of[box.min.y,box.max.y])for(const z of[box.min.z,box.max.z]){const v=tmp.v.set(x,y,z).project(VH_3D.cam);const sx=(v.x+1)/2*view.w,sy=(1-v.y)/2*view.h;x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy);}
 return {x:x0,y:y0,w:x1-x0,h:y1-y0};}
export const vhDebug=()=>VH_3D;

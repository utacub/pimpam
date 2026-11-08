// Review tool for El taller de vehicles (0.60.2): sweeps the footprint of the toy along the ride circuit of every corner and along the parade
// route, and lists the room objects it passes through. The footprint of each body is its box joined with the boxes of every wheel set and every
// accessory of the corner (the widest the toy can be), turned with the tangent of the circuit. Objects the circuits are meant to climb or cross
// (books, sandpit, pipe, bridge, track, duckboard) carry userData.drive and are left out. A box that touches is confirmed with the vertices of
// large meshes, so a long curved mesh does not count for its whole bounding box. Exits with 1 when anything is touched.
// Usage: node tools/vehicles-sweep.mjs [step]   (step: distance between two tests along a route, 4 by default)
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {vhSource} from './vehicles-frames.mjs';
const require=createRequire(import.meta.url);
let playwright;try{playwright=require('playwright');}catch{playwright=require('/opt/node-tools/node_modules/playwright');}
const root=fileURLToPath(new URL('..',import.meta.url)),STEP=+(process.argv[2]||4);
const src=vhSource().replace('window.VH={','window.VH={VH_3D,vhRoomShow,vhCurveOf,vhParadeCurve,vhBodyCached,vhPiecesEnsure,VH_CORNERS,VH_BODIES,VH_WHEELS,VH_TOPS,VH_BODY_COLOR,vhP3,VH_FLOOR,');
const browser=await playwright.chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:320,height:180}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
await page.setContent('<!doctype html><canvas id="c" width="320" height="180"></canvas>');
await page.addScriptTag({path:root+'dist/vendor/three-taller.js'});await page.addScriptTag({content:src});
const out=await page.evaluate(STEP=>{let n=0;while(VH.vhLoad()<1&&n++<40);const T=VH.vhP3(),V=VH.VH_3D,F=VH.VH_FLOOR,toy=V.parts.toy,res=[];
 toy.position.set(0,0,0);toy.rotation.set(0,0,0);toy.updateMatrixWorld(true);
 const inside=(fp,pos,fx,fz,x,z)=>{const dx=x-pos.x,dz=z-pos.z,l=dx*fx.x+dz*fx.y,w=dx*fz.x+dz*fz.y;return l>=fp.min[0]&&l<=fp.max[0]&&w>=fp.min[2]&&w<=fp.max[2];};
 // separating axes between the turned footprint and the box of an object, in the floor plane; then the heights
 const touch=(B,pos,fx,fz,fp)=>{const cs=[];for(const a of[fp.min[0],fp.max[0]])for(const b of[fp.min[2],fp.max[2]])cs.push([pos.x+fx.x*a+fz.x*b,pos.z+fx.y*a+fz.y*b]);
  const bs=[[B.min.x,B.min.z],[B.max.x,B.min.z],[B.max.x,B.max.z],[B.min.x,B.max.z]];
  for(const ax of[[1,0],[0,1],[fx.x,fx.y],[fz.x,fz.y]]){const p1=cs.map(p=>p[0]*ax[0]+p[1]*ax[1]),p2=bs.map(p=>p[0]*ax[0]+p[1]*ax[1]);if(Math.max(...p1)<Math.min(...p2)||Math.max(...p2)<Math.min(...p1))return false;}
  const y0=Math.max(pos.y,F)+3,y1=Math.max(pos.y,F)+fp.max[1];return !(y1<B.min.y||B.max.y<y0);};
 const exact=(m,pos,fx,fz,fp)=>{const S=m.B.getSize(new T.Vector3());if(S.x<160&&S.z<160)return true;const a=m.o.geometry.attributes.position,v=new T.Vector3(),y0=Math.max(pos.y,F)+3,y1=Math.max(pos.y,F)+fp.max[1];
  for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(m.o.matrixWorld);if(v.y>=y0&&v.y<=y1&&inside(fp,pos,fx,fz,v.x,v.z))return true;}return false;};
 for(const c of VH.VH_CORNERS){VH.vhPiecesEnsure(c);VH.vhRoomShow(c);V.scene.updateMatrixWorld(true);
  const extra=new T.Box3();for(const k of VH.VH_WHEELS[c]||[])if(V.parts.wheels[k])extra.union(new T.Box3().setFromObject(V.parts.wheels[k]));for(const k of VH.VH_TOPS[c]||[])if(V.parts.tops[k])extra.union(new T.Box3().setFromObject(V.parts.tops[k]));
  const feet=VH.VH_BODIES[c].map(k=>{const b=new T.Box3().setFromObject(VH.vhBodyCached(k,VH.VH_BODY_COLOR[k]));if(!extra.isEmpty())b.union(extra);return {k,min:b.min.toArray(),max:b.max.toArray()};});
  // the objects of the room (and of the bench and garage) that stand above the floor, without the walls, the floor and what is driven over
  const meshes=[];V.parts.decor.traverse(o=>{if(!o.isMesh||!o.geometry||o.isInstancedMesh&&o.userData.drive)return;for(let p=o;p;p=p.parent){if(p.visible===false||p.userData?.drive)return;}
   const B=new T.Box3().setFromObject(o),S=B.getSize(new T.Vector3());if(B.max.y<=F+2.5||S.x>1400||S.z>1400||S.y>1400)return;let g=o;while(g.parent&&g.parent!==V.parts.decor&&!/^room-/.test(g.parent.name))g=g.parent;meshes.push({o,B,g});});
  for(const [route,CU] of [['circuit',VH.vhCurveOf(c)],['desfilada',VH.vhParadeCurve()]]){const N=Math.ceil(CU.len/STEP),hits=new Map();
   for(let i=0;i<=N;i++){const d=i/N,pos=CU.curve.getPointAt(d),tan=CU.curve.getTangentAt(d),fl=Math.hypot(tan.x,tan.z)||1,fx={x:tan.x/fl,y:tan.z/fl},fz={x:-fx.y,y:fx.x};
    for(const fp of feet)for(const m of meshes)if(touch(m.B,pos,fx,fz,fp)&&exact(m,pos,fx,fz,fp)){const gp=m.g.getWorldPosition(new T.Vector3()),key=gp.toArray().map(Math.round).join(',');const h=hits.get(key)||{at:key,d0:d,d1:d,bodies:new Set()};h.d1=d;h.bodies.add(fp.k);hits.set(key,h);}}
   for(const h of hits.values())res.push({corner:c,route,object:h.at,d0:+h.d0.toFixed(3),d1:+h.d1.toFixed(3),bodies:[...h.bodies].join(' ')});}}
 return res;},STEP);
for(const h of out)console.log(`${h.corner} · ${h.route}: object at (${h.object}) from d ${h.d0} to ${h.d1} · ${h.bodies}`);
console.log(out.length?`${out.length} contacts`:'no contacts');if(errors.length)console.log('errors\n'+errors.join('\n'));
await browser.close();process.exit(out.length||errors.length?1:0);

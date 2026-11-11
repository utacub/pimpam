# Fractals a la natura · 19 Petxina de triangles: the concept picture → the lattice of the shell (traced as a network with
# (19: tpar = {"rootext":0,"roots":[[1645,48]],"cwid":[[0,1],[99,1]],"dim":[0,0],"wo":[5,2.5],"T":[0,0,0],"sp":[650,500,400],"smooth":4,"core":0.6,"fine":0.5,"vmin":0.6}; params {"pad":3,"minCell":300,"ctan":0.25,"corange":0.5,"wk":1.8,"wmax":8,"wmin":2.4,"vo":0.6})
# tools/fractals-traca.py, from the apex) and, in each cell of the lattice, its nested triangles (each ring of orange or tan fitted
# with a triangle), all packed in one base64 for frTraced() (fractals-formes.js), the triangles timed to appear order by order after
# the lattice has closed round their cell.
# python3 tools/fractals-petxina.py <concept.png> <out prefix> '<params of the tracer for the lattice>' '{"lag":[.25,.6,.95],"dur":.45}'
# Needs numpy, scipy, scikit-image, pillow.
import numpy as np, sys, json, base64, struct, subprocess, os
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull
src,out=sys.argv[1],sys.argv[2];TP=sys.argv[3];Q=json.loads(sys.argv[4]) if len(sys.argv)>4 else {}
im=Image.open(src).convert('RGB');a=np.asarray(im).astype(float)/255;hsv=np.asarray(im.convert('HSV')).astype(float)/255
S=hsv[...,1];V=hsv[...,2];H_,W_=V.shape
cream=(V>.72)&(S<.38);cream=ndi.binary_opening(cream,iterations=1)
crd=ndi.binary_dilation(cream,iterations=Q.get('pad',4))
orange=(V>Q.get('vo',.4))&(S>=.6)&~crd;tan=(V>Q.get('vo',.4))&(S>=.3)&(S<.6)&~crd
# ── the lattice: the picture with only its cream lines, traced
lat=(a*ndi.binary_dilation(cream,iterations=1)[...,None]*255).astype(np.uint8);Image.fromarray(lat).save(out+'_lat.png')
r=subprocess.run([sys.executable,os.path.join(os.path.dirname(__file__),'fractals-traca.py'),out+'_lat.png',out+'_lat',TP],capture_output=True,text=True)
print(r.stdout.strip().split('\n')[-2:],r.stderr[-400:])
def unpack(b):
  v2=struct.unpack_from('<H',b,0)[0]==65535;o=4 if v2 else 0;P=[]
  while o<len(b):
    n0,X,Y,d0,t0,sp=struct.unpack_from('<HHHHHH',b,o);o+=12;br=1.
    if v2: br=struct.unpack_from('<H',b,o)[0]/1000;o+=2
    n=n0&32767;pts=[];w=[];c=[]
    for i in range(n):
      dx,dy,ww,cc=struct.unpack_from('<bbBB',b,o);o+=4;X+=dx;Y+=dy;pts.append((X/2-64,Y/2-64));w.append(ww/10);c.append(cc/255)
    P.append(dict(pts=np.array(pts),w=np.array(w),c=np.array(c),t0=t0/1000,sp=sp,d0=d0,tip=n0>32767,b=br))
  return P
L=unpack(base64.b64decode(open(out+'_lat.b64').read()))
# the moment the lattice reaches each pixel: every point of every path at its time, spread to its neighbourhood
pt=[];tt=[]
for p in L:
  s=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(p['pts'],axis=0).T))]);pt.append(p['pts']);tt.append(p['t0']+s/p['sp'])
pt=np.vstack(pt);tt=np.concatenate(tt)
from scipy.spatial import cKDTree
tree=cKDTree(pt)
# ── the cells: the dark regions inside the shell, between the cream lines
inside=ndi.binary_fill_holes(ndi.binary_closing(crd,iterations=3))
cells,nc=ndi.label(inside&~crd)
print('cells',nc)
if Q.get('dbg'):
  rng=np.random.default_rng(1);col=rng.integers(60,255,(nc+1,3));col[0]=0;dim=(a*80).astype(np.uint8);ci_=col[cells].astype(np.uint8)
  Image.fromarray(np.where(cells[...,None]>0,ci_,dim)).save(out+'_cells.png')
def tri_fit(mask):
  ys,xs=np.nonzero(mask)
  if len(xs)<12: return None
  P=np.c_[xs,ys].astype(float)
  try: h=ConvexHull(P)
  except Exception: return None
  Hp=P[h.vertices];n=len(Hp);best=(0,None)
  for i in range(n):
    for j in range(i+1,n):
      for k in range(j+1,n):
        u_=Hp[j]-Hp[i];v_=Hp[k]-Hp[i];A=abs(u_[0]*v_[1]-u_[1]*v_[0])/2
        if A>best[0]: best=(A,(Hp[i],Hp[j],Hp[k]))
  return best[1]
from skimage.measure import find_contours
def rdp(Q,eps):
  if len(Q)<3: return [0,len(Q)-1]
  a_,b_=Q[0],Q[-1];ab=b_-a_;L=np.hypot(*ab);q=Q-a_
  dd=np.hypot(*q.T) if L<1e-9 else np.abs(ab[0]*q[:,1]-ab[1]*q[:,0])/L
  i=int(np.argmax(dd))
  if dd[i]>eps: l=rdp(Q[:i+1],eps);r=rdp(Q[i:],eps);return l[:-1]+[x+i for x in r]
  return [0,len(Q)-1]
def ring_line(m):
  """the middle line of a closed ring (a loop), or None: the zero line between the distance to its hole and to its outside"""
  ys,xs=np.nonzero(m);y0,x0=max(0,ys.min()-4),max(0,xs.min()-4);mm=m[y0:ys.max()+5,x0:xs.max()+5]
  F=ndi.binary_fill_holes(mm);hole=F&~mm
  for it in (2,4):  # a ring broken by a gap (where it touches the lattice): closed over the gap
    if hole.sum()>=6: break
    mm=ndi.binary_closing(np.pad(mm,it+1),iterations=it)[it+1:-it-1,it+1:-it-1];F=ndi.binary_fill_holes(mm);hole=F&~mm
  if hole.sum()<6: return None
  hl,nh=ndi.label(hole)
  if nh>1: hole=hl==np.argmax(np.bincount(hl.ravel())[1:])+1
  fld=ndi.distance_transform_edt(~hole)-ndi.distance_transform_edt(F)
  cs=[c for c in find_contours(fld,0) if np.hypot(*(c[0]-c[-1]))<2 and len(c)>12]
  if not cs: return None
  c=max(cs,key=len);P=np.c_[c[:,1]+x0,c[:,0]+y0]
  q=P.copy()
  for _ in range(2): q=(np.roll(q,1,0)+q+np.roll(q,-1,0))/3
  return q
def tri_fit_pts(P):
  try: h=ConvexHull(P)
  except Exception: return None
  Hp=P[h.vertices];n=len(Hp);best=(0,None)
  for i in range(n):
    for j in range(i+1,n):
      for k in range(j+1,n):
        u_=Hp[j]-Hp[i];v_=Hp[k]-Hp[i];A=abs(u_[0]*v_[1]-u_[1]*v_[0])/2
        if A>best[0]: best=(A,(Hp[i],Hp[j],Hp[k]))
  return best[1]
def seg_dist(P,A,B):
  ab=B-A;t=np.clip(((P-A)@ab)/max(1e-9,ab@ab),0,1);return np.hypot(*(P-(A+np.outer(t,ab))).T)
def tri_ok(T,m,sw):
  """the fitted triangle lies on the ring (most of its outline near ring pixels) and is not a sliver"""
  d=ndi.distance_transform_edt(~m);ok=0;n=0
  for q in range(3):
    for z in np.linspace(0,1,20,endpoint=False):
      p=T[q]+(T[(q+1)%3]-T[q])*z;x,y=int(round(p[0])),int(round(p[1]))
      if 0<=x<W_ and 0<=y<H_: n+=1;ok+=d[y,x]<=sw*.7+2
  ang=[]
  for q in range(3):
    u=T[q-1]-T[q];v=T[(q+1)%3]-T[q];ang.append(np.degrees(np.arccos(np.clip(np.dot(u,v)/max(1e-6,np.hypot(*u)*np.hypot(*v)),-1,1))))
  return n>0 and ok/n>=.75 and min(ang)>=24
tris=[];nloop=0;ntri=0;nskip=0
for ci in range(1,nc+1):
  cm=cells==ci;area=cm.sum()
  if area<Q.get('minCell',150): continue
  ring=(orange|tan)&cm
  lab,nr=ndi.label(ring,structure=np.ones((3,3)))
  # rings that touch (the small triangles packed along the lip) make one piece that is no ring: such a piece is thinned by a pixel,
  # which parts the rings where they only touch, and each part grown back within the piece
  comps=[lab==ri for ri in range(1,nr+1)]
  def split(m):
    if m.sum()<200 or ring_line(m) is not None: return [m]
    for it in (1,2):
      e=ndi.binary_erosion(m,iterations=it);l2,n2=ndi.label(e,structure=np.ones((3,3)))
      if n2>1:
        parts=[ndi.binary_dilation(l2==q,iterations=it)&m for q in range(1,n2+1)]
        return [p for p in parts if p.sum()>=15]
    return [m]
  comps=[p for m in comps for p in split(m)]
  rings=[]
  for m in comps:
    npx=m.sum()
    if npx<Q.get('minRing',25): continue
    # tan or orange: by the saturation of its brightest pixels (the edges of a thin tan line are mixed with the dark and look orange)
    sv=S[m];vv=V[m];is_tan=np.median(sv[vv>=np.percentile(vv,70)])<Q.get('tanS',.72);line=ring_line(m)
    if line is not None:
      xs_,ys_=line[:,0],line[:,1];A=abs(np.dot(xs_,np.roll(ys_,-1))-np.dot(ys_,np.roll(xs_,-1)))/2
      if A<Q.get('smallTri',700) and A>=30:
        # a small ring: its shape in the picture too coarse; a clean triangle through the corners of its middle line, if it fits
        T=tri_fit_pts(line)
        if T is not None:
          dd=np.min([seg_dist(line,T[q],T[(q+1)%3]) for q in range(3)],axis=0)
          if np.mean(dd)<Q.get('triFit',2.2):
            per=sum(np.hypot(*(T[(q+1)%3]-T[q])) for q in range(3));sw=max(1.2,npx/max(1,per))
            rings.append(dict(T=list(T),A=A,w=sw,tan=is_tan,cen=(T[0]+T[1]+T[2])/3));ntri+=1;continue
    if line is not None:
      per=np.hypot(*np.diff(np.vstack([line,line[:1]]),axis=0).T).sum();sw=max(1.2,npx/max(1,per))
      xs_,ys_=line[:,0],line[:,1];A=abs(np.dot(xs_,np.roll(ys_,-1))-np.dot(ys_,np.roll(xs_,-1)))/2
      if A<30: continue
      rings.append(dict(line=line,A=A,w=sw,tan=is_tan,cen=line.mean(0)));nloop+=1;continue
    T=tri_fit(ndi.binary_fill_holes(ndi.binary_closing(np.pad(m,3),iterations=2))[3:-3,3:-3])
    if T is None:
      if Q.get('dbg'): print('skip none',int(m.sum()))
      nskip+=1;continue
    u_=T[1]-T[0];v_=T[2]-T[0];A=abs(u_[0]*v_[1]-u_[1]*v_[0])/2
    per=sum(np.hypot(*(T[(q+1)%3]-T[q])) for q in range(3));sw=max(1.5,npx/max(1,per))
    if A<40 or not tri_ok(T,m,sw):
      if Q.get('dbg'): print('skip tri',int(m.sum()),int(A),[tuple(np.round(v).astype(int)) for v in T])
      nskip+=1;continue
    cen=(T[0]+T[1]+T[2])/3;inr=2*A/per;f=max(.2,1-(sw*.5)/max(1e-6,inr));T2=[cen+(v-cen)*f for v in T]
    rings.append(dict(T=T2,A=A,w=sw,tan=is_tan,cen=cen));ntri+=1
  if not rings: continue
  rings.sort(key=lambda r:-r['A'])
  # the rings of a cell are nested in groups (a big cell may hold several sets): each ring belongs to the smallest bigger ring that
  # holds its centre; a set whose outer ring is tiny is a speck of glow where lattice lines meet, and is dropped
  def inpoly(P,x,y):
    c=False;n=len(P)
    for i in range(n):
      (x1,y1),(x2,y2)=P[i],P[i-1]
      if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
  poly=lambda r:r['line'] if 'line' in r else np.array(r['T'])
  for i,r in enumerate(rings):
    r['par']=-1;r['lv']=0
    for j in range(i-1,-1,-1):
      if inpoly(poly(rings[j]),*r['cen']): r['par']=j;r['lv']=rings[j]['lv']+1;break
  top=lambda i:i if rings[i]['par']<0 else top(rings[i]['par'])
  rings=[r for i,r in enumerate(rings) if rings[top(i)]['A']>=Q.get('minTop',110)]
  if Q.get('dbg'): print('cell',ci,int(area),'kept',len(rings),[(int(r['A']),r['lv']) for r in rings])
  if not rings: continue
  # the moment the cell is closed: the latest moment of the lattice round it (its border, a little outside)
  bd=ndi.binary_dilation(cm,iterations=Q.get('pad',4)+3)&~cm
  ys,xs=np.nonzero(bd);d,ix=tree.query(np.c_[xs,ys][::3]);tcell=np.percentile(tt[ix][d<12],90) if (d<12).any() else tt.max()
  for rg in rings: rg['t']=tcell;tris.append(rg)
print('rings as loops',nloop,'as fitted triangles',ntri,'skipped',nskip)
print('triangles',len(tris),'levels',np.bincount([t['lv'] for t in tris]))
# ── each ring: two halves, from its point nearest the apex round both sides to the opposite point
LAG=Q.get('lag',[.25,.6,.95,1.3]);DUR=Q.get('dur',.45);RC=Q.get('round',.16);apex=np.array(Q.get('apex',[1645,48]))
paths=[]
for tr in tris:
  if 'line' in tr: pts=tr['line']
  else:
    T=tr['T'];pts=[]
    for q in range(3):
      A_,B_,C_=T[q-1],T[q],T[(q+1)%3];u=(A_-B_)/max(1e-6,np.hypot(*(A_-B_)));v=(C_-B_)/max(1e-6,np.hypot(*(C_-B_)))
      r=RC*min(np.hypot(*(A_-B_)),np.hypot(*(C_-B_)));P0=B_+u*r;P1=B_+v*r
      for z in np.linspace(0,1,5): pts.append((1-z)**2*P0+2*(1-z)*z*B_+z*z*P1)
    pts=np.array(pts)
  k0=int(np.argmin(np.hypot(*(pts-apex).T)));pts=np.roll(pts,-k0,0);n=len(pts)
  s_=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(np.vstack([pts,pts[:1]]),axis=0).T))]);per=s_[-1];h=int(np.searchsorted(s_,per/2))
  halves=[np.vstack([pts[:h+1]]),np.vstack([pts[h:],pts[:1]])[::-1]]
  lvi=min(tr['lv'],len(LAG)-1);c=Q.get('ctan',.3) if tr['tan'] else Q.get('corange',.62)
  w=min(Q.get('wmax',7),max(Q.get('wmin',1.6),tr['w']*Q.get('wk',.8)))
  for hv in halves:
    keep=rdp(hv,Q.get('eps',.6));hv=hv[keep]
    # no step longer than 25 px (the packing stores a step in a signed byte of half pixels)
    sub=[hv[0]]
    for q in hv[1:]:
      L_=np.hypot(*(q-sub[-1]));k_=int(np.ceil(L_/25))
      for z in range(1,k_): sub.append(sub[-1]+(q-sub[-1])*(1/(k_-z+1)))
      sub.append(q)
    hv=np.array(sub)
    paths.append(dict(pts=hv,w=np.full(len(hv),w),c=np.full(len(hv),c),t0=tr['t']+LAG[lvi],sp=max(40,per/2/DUR),d0=0,tip=False,b=1.))
allp=L+paths
b=bytearray(struct.pack('<HH',65535,2))
for p in allp:
  n=len(p['pts']);x0=int(round((p['pts'][0,0]+64)*2));y0=int(round((p['pts'][0,1]+64)*2))
  b+=struct.pack('<HHHHHH',n|(32768 if p['tip'] else 0),x0,y0,int(min(65535,p['d0'])),int(round(p['t0']*1000)),int(p['sp']))
  b+=struct.pack('<H',int(round(min(1,p['b'])*1000)));px,py=x0,y0
  for i in range(n):
    X=int(round((p['pts'][i,0]+64)*2));Y=int(round((p['pts'][i,1]+64)*2));dx=max(-127,min(127,X-px));dy=max(-127,min(127,Y-py));px+=dx;py+=dy
    b+=struct.pack('<bbBB',dx,dy,int(min(255,round(p['w'][i]*10))),int(round(p['c'][i]*255)))
open(out+'.b64','w').write(base64.b64encode(bytes(b)).decode())
print('paths',len(allp),'bytes',len(b),'grown at',round(max(p['t0']+np.hypot(*np.diff(p['pts'],axis=0).T).sum()/p['sp'] for p in allp),2))
# preview: the triangles over the concept
pv=Image.fromarray((a*120).astype(np.uint8));dr=ImageDraw.Draw(pv)
for p in paths: dr.line([tuple(q) for q in p['pts']],fill=(255,200,0) if p['c'][0]>.5 else (80,160,255),width=2)
pv.save(out+'_tri.png')

# Fractals a la natura: traces a concept picture of lines of light into a network that grows (for the stimuli whose concept is one
# whole network, such as the mycelium). The bright cores of the lines → their skeleton → the edges between forks → short spurs pruned →
# the moment each point grows: from the roots (the wide free ends at the border), along the network, each order of line (by its width)
# starting no earlier than its own moment and at its own speed, so that the cords grow first, then the hyphae, then the fine tips, and
# two fronts that meet on a loop fuse there. Out: the paths packed in base64 for frTraced() (fractals-formes.js) and previews.
# python3 tools/fractals-traca.py <concept.png> <out prefix> '{"wo":[6,3],"T":[0,.8,1.5],"sp":[800,350,160]}'
# Needs numpy, scipy, scikit-image, pillow.
import numpy as np, sys, json, colorsys, heapq, base64, struct
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage.morphology import skeletonize, remove_small_objects
src,out=sys.argv[1],sys.argv[2];P=json.loads(sys.argv[3]) if len(sys.argv)>3 else {}
a=np.asarray(Image.open(src).convert('RGB')).astype(float)/255
V=a.max(2);H,W=V.shape
# ── the skeleton of the bright lines
bl=ndi.gaussian_filter(V,4)
mask=(V>P.get('core',.5))|(((V-bl)>P.get('fine',.13))&(V>P.get('vmin',.22)))
mask=remove_small_objects(mask,max_size=30);mask=ndi.binary_closing(mask,iterations=1)
sk=skeletonize(mask);pd=12;dt=ndi.distance_transform_edt(np.pad(V>P.get('core',.5),pd))[pd:-pd,pd:-pd]  # padded: a line cut by the border is not wider there
ys,xs=np.nonzero(sk);N=len(xs);idx=-np.ones((H,W),int);idx[ys,xs]=np.arange(N)
nb=[[] for _ in range(N)]
for i in range(N):
  x,y=xs[i],ys[i]
  for dy in (-1,0,1):
    for dx in (-1,0,1):
      xx,yy=x+dx,y+dy
      if (dx or dy) and 0<=xx<W and 0<=yy<H and idx[yy,xx]>=0: nb[i].append(idx[yy,xx])
isnode=np.array([len(n)!=2 for n in nb])
cl=-np.ones(N,int);nc=0
for i in range(N):
  if isnode[i] and cl[i]<0:
    st=[i];cl[i]=nc
    while st:
      j=st.pop()
      for k in nb[j]:
        if isnode[k] and cl[k]<0: cl[k]=nc;st.append(k)
    nc+=1
cpos=np.zeros((nc,2));cnt=np.zeros(nc)
for i in range(N):
  if cl[i]>=0: cpos[cl[i]]+=(xs[i],ys[i]);cnt[cl[i]]+=1
cpos/=cnt[:,None]
vis=np.zeros(N,bool);raw=[]
for i in range(N):
  if cl[i]<0: continue
  for k in nb[i]:
    if cl[k]==cl[i]: continue
    if cl[k]>=0:
      if cl[k]>cl[i]: raw.append([cl[i],cl[k],[i,k]])
      continue
    if vis[k]: continue
    path=[i,k];vis[k]=True;prev=i;cur=k;end=-1
    while True:
      nxt=[m for m in nb[cur] if m!=prev and not (cl[m]==cl[i] and len(path)<3)]
      nn=[m for m in nxt if cl[m]>=0]
      if nn: path.append(nn[0]);end=cl[nn[0]];break
      nxt=[m for m in nxt if not vis[m]]
      if not nxt: break
      prev,cur=cur,nxt[0];vis[cur]=True;path.append(cur)
    if end>=0: raw.append([cl[i],end,path])
def wid(i):
  d=dt[ys[i],xs[i]];v=P.get('wmin',.7)+V[ys[i],xs[i]]*P.get('wv',.8)
  return max(2*d*P.get('wk',.8),v) if d>0 else v
def col(i):
  x,y=xs[i],ys[i];bx,by=x,y
  for dy in (-1,0,1):
    for dx in (-1,0,1):
      xx,yy=min(W-1,max(0,x+dx)),min(H-1,max(0,y+dy))
      if V[yy,xx]>V[by,bx]: bx,by=xx,yy
  h,s,v=colorsys.rgb_to_hsv(*a[by,bx]);return h*360,v
E=[]
for u,v,path in raw:
  pts=np.array([(xs[i],ys[i]) for i in path],float);pts[0]=cpos[u];pts[-1]=cpos[v];hv=np.array([col(i) for i in path])
  E.append(dict(u=u,v=v,pts=pts,w=np.array([wid(i) for i in path]),h=hv[:,0],val=hv[:,1],L=np.hypot(*np.diff(pts,axis=0).T).sum()))
Bd=P.get('border',25);atB=lambda q:q[0]<Bd or q[0]>W-Bd or q[1]<Bd or q[1]>H-Bd
# ── short spurs (bits of skeleton sticking out of a wide line) pruned; a line cut by the border of the picture is not one
for it in range(4):
  deg=np.zeros(nc,int)
  for e in E: deg[e['u']]+=1;deg[e['v']]+=1
  wmax=np.zeros(nc)
  for e in E: wmax[e['u']]=max(wmax[e['u']],e['w'].max());wmax[e['v']]=max(wmax[e['v']],e['w'].max())
  keep=[]
  for e in E:
    spur=any(deg[a_]==1 and deg[b_]>=3 and not atB(cpos[a_]) and e['L']<max(P.get('spur',5),wmax[b_]*.75) for a_,b_ in ((e['u'],e['v']),(e['v'],e['u'])))
    if not spur: keep.append(e)
  if len(keep)==len(E): break
  E=keep
# ── two edges that meet at a node of only two (where a spur was cut) become one
def ends():
  inc=[[] for _ in range(nc)]
  for j,e in enumerate(E): inc[e['u']].append(j);inc[e['v']].append(j)
  return inc
while True:
  inc=ends();m=next((i for i in range(nc) if len(inc[i])==2 and inc[i][0]!=inc[i][1]),None)
  if m is None: break
  e1,e2=E[inc[m][0]],E[inc[m][1]]
  def towards(e,node):# the edge oriented to end at node
    return e if e['v']==node else dict(e,u=e['v'],v=e['u'],pts=e['pts'][::-1],w=e['w'][::-1],h=e['h'][::-1],val=e['val'][::-1])
  A=towards(e1,m);Bq=towards(e2,m);Bq=dict(Bq,u=Bq['v'],v=Bq['u'],pts=Bq['pts'][::-1],w=Bq['w'][::-1],h=Bq['h'][::-1],val=Bq['val'][::-1])
  ne=dict(u=A['u'],v=Bq['v'],pts=np.vstack([A['pts'],Bq['pts'][1:]]),w=np.concatenate([A['w'],Bq['w'][1:]]),h=np.concatenate([A['h'],Bq['h'][1:]]),val=np.concatenate([A['val'],Bq['val'][1:]]))
  ne['L']=np.hypot(*np.diff(ne['pts'],axis=0).T).sum()
  E=[e for j,e in enumerate(E) if j not in inc[m]]+[ne]
inc=ends()
# ── a fork of the skeleton sits off the line it leaves (pulled towards the branch): each fork is moved onto the line through its two
# widest edges, and the bent pixels near it dropped, so that a cord runs smooth through the places where its hyphae leave it
newpos=cpos.copy();rad=np.zeros(nc)
def at_len(pts,r):
  s_=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(pts,axis=0).T))]);return np.array([np.interp(r,s_,pts[:,0]),np.interp(r,s_,pts[:,1])])
for i in range(nc):
  if len(inc[i])<3: continue
  es=sorted(inc[i],key=lambda j:-np.median(E[j]['w']));wm=np.median(E[es[0]]['w']);r=max(4,wm*.75);rad[i]=r
  q=[at_len(E[j]['pts'] if E[j]['u']==i else E[j]['pts'][::-1],min(r,E[j]['L']*.45)) for j in es[:2]];newpos[i]=(q[0]+q[1])/2
for e in E:
  pts=e['pts'];s_=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(pts,axis=0).T))]);L=s_[-1];keep=np.ones(len(pts),bool)
  ru=min(rad[e['u']],L*.4);rv=min(rad[e['v']],L*.4)
  keep[1:-1]&=(s_[1:-1]>ru)&(s_[1:-1]<L-rv)
  for k_ in ('pts','w','h','val'): e[k_]=e[k_][keep]
  e['pts']=e['pts'].copy();e['pts'][0]=newpos[e['u']];e['pts'][-1]=newpos[e['v']]
cpos=newpos
# ── the steps of the pixels smoothed away (the ends kept where they are)
K=P.get('smooth',4)
for e in E:
  pts=e['pts']
  if len(pts)>2*K+2:
    for _ in range(2):
      q=pts.copy();cs_=np.cumsum(np.vstack([[0,0],pts]),axis=0)
      for j in range(1,len(pts)-1):
        r=min(K,j,len(pts)-1-j);q[j]=(cs_[j+r+1]-cs_[j-r])/(2*r+1)
      pts=q
  e['pts']=pts;e['L']=np.hypot(*np.diff(pts,axis=0).T).sum()
# ── each edge: its order (by its width), its widths smoothed, its colours (the place along the palette, from the hue and the dimness)
WO=P.get('wo',[6,3]);T0=P.get('T',[0,.8,1.5]);SP=P.get('sp',[800,350,160])
HUE=P.get('hue',[[90,0],[125,.2],[156,.45],[175,.65],[182,.72]]);DIM=P.get('dim',[.9,.9])
def smooth(x,k):return np.convolve(np.pad(x,k,mode='edge'),np.ones(2*k+1)/(2*k+1),mode='same')[k:-k]
for e in E:
  w=e['w'];n=len(w);mw=np.median(w[n//5:max(n//5+1,4*n//5)]);e['mw']=mw;e['o']=0 if mw>=WO[0] else 1 if mw>=WO[1] else 2
  e['s']=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(e['pts'],axis=0).T))]);e['L']=e['s'][-1]
  # the width: a straight taper through the middle of the edge (the skeleton is wider where it crosses a fork, and that is not the line)
  if n>=8:
    wa=np.median(w[int(n*.15):max(int(n*.15)+1,int(n*.45))]);wb=np.median(w[int(n*.55):max(int(n*.55)+1,int(n*.85))])
    ws=np.clip(wa+(wb-wa)*(e['s']/max(1e-6,e['L'])-.3)/.4,min(wa,wb)*.85,max(wa,wb)*1.15)
  else: ws=np.full(n,np.median(w))
  e['ws']=ws
  c=np.interp(e['h'],[h for h,_ in HUE],[c for _,c in HUE])+np.clip(DIM[0]-e['val'],0,1)*DIM[1];e['cs']=np.clip(smooth(c,5),0,1)
nc_=nc;adj=[[] for _ in range(nc_)]
for j,e in enumerate(E): adj[e['u']].append(j);adj[e['v']].append(j)
# a line that runs on through a fork keeps its width there: the two widest edges of each fork meet at the mean of their widths, the
# change spread over their first stretch (no step where a hypha leaves a cord)
for i in range(nc_):
  if len(adj[i])<2: continue
  es=sorted(adj[i],key=lambda j:-np.median(E[j]['ws']))[:2]
  ends=[(E[j],0 if E[j]['u']==i else -1) for j in es];m=np.mean([e['ws'][k] for e,k in ends])
  for e,k in ends:
    s_=e['s'] if k==0 else e['L']-e['s'];f=np.clip(1-s_/min(40,e['L']*.5),0,1)
    e['ws']=e['ws']+(m-e['ws'][k])*f
deg=np.array([len(x) for x in adj])
B=P.get('border',25)
# the colour by the width of the line (P.cwid: [[width, c], …], the widest first or not)
if 'cwid' in P:
  tw=sorted(P['cwid'])
  for e in E: e['cs']=np.clip(np.interp(e['ws'],[a for a,_ in tw],[b for _,b in tw]),0,1)
# the colour by the distance along the network from the nearest cord (P.cd: [cord c at its widest, at its thinnest, a hypha at the
# cord, a hypha far away, how far (px), the dimming of the finest lines, their width]): green cords, hyphae that turn cyan as they go
if 'cd' in P:
  cd=P['cd'];dc=np.full(nc_,np.inf);pq=[]
  cw=P.get('cw',WO[0]);cord=lambda e:np.median(e['ws'])>=cw
  for e in E:
    if cord(e):
      for x_ in (e['u'],e['v']): dc[x_]=0;pq.append((0,x_))
  heapq.heapify(pq)
  while pq:
    du,u=heapq.heappop(pq)
    if du>dc[u]: continue
    for j in adj[u]:
      e=E[j];v=e['v'] if e['u']==u else e['u']
      if du+e['L']<dc[v]: dc[v]=du+e['L'];heapq.heappush(pq,(dc[v],v))
  for e in E:
    if cord(e): e['cs']=np.clip(cd[0]+(cd[1]-cd[0])*np.clip((14-e['ws'])/(14-cw),0,1),0,1);continue
    dd=np.minimum(dc[e['u']]+e['s'],dc[e['v']]+e['L']-e['s']);dd=np.where(np.isfinite(dd),dd,cd[4]);f=np.clip(dd/cd[4],0,1);f=f*f*(3-2*f)
    e['cs']=np.clip(cd[2]+(cd[3]-cd[2])*f+cd[5]*np.clip((cd[6]-e['ws'])/cd[6],0,1)*2,0,1)
roots=[int(np.argmin(np.hypot(*(cpos-np.array(r)).T)+(deg==0)*1e9)) for r in P['roots']] if 'roots' in P else [i for i in range(nc_) if deg[i]==1 and (cpos[i,0]<B or cpos[i,0]>W-B or cpos[i,1]<B or cpos[i,1]>H-B) and E[adj[i][0]]['mw']>=P.get('rootw',8)]
print('border ends',[(int(cpos[i,0]),int(cpos[i,1]),round(E[adj[i][0]]['mw'],1)) for i in range(nc_) if deg[i]==1 and (cpos[i,0]<B or cpos[i,0]>W-B or cpos[i,1]<B or cpos[i,1]>H-B) and E[adj[i][0]]['mw']>=3]);print('roots',[(int(cpos[i,0]),int(cpos[i,1])) for i in roots])
# a root near the border is carried out past it along its line, so that the cord comes in from outside the picture
for r in roots:
  for jj in adj[r]:
    e=E[jj];fw=e['u']==r;pts=e['pts'] if fw else e['pts'][::-1]
    q=pts[min(len(pts)-1,np.searchsorted(np.concatenate([[0],np.cumsum(np.hypot(*np.diff(pts,axis=0).T))]),25))];p0=pts[0];dv=p0-q;dv/=max(1e-6,np.hypot(*dv))
    dist=min([(-p0[0])/dv[0] if dv[0]<-1e-3 else 1e9,(W-p0[0])/dv[0] if dv[0]>1e-3 else 1e9,(-p0[1])/dv[1] if dv[1]<-1e-3 else 1e9,(H-p0[1])/dv[1] if dv[1]>1e-3 else 1e9])
    if dist>60: continue
    ext=np.array([p0+dv*(dist+20)]);n0=1
    if fw:
      e['pts']=np.vstack([ext,e['pts']]);e['ws']=np.concatenate([[e['ws'][0]],e['ws']]);e['cs']=np.concatenate([[e['cs'][0]],e['cs']])
    else:
      e['pts']=np.vstack([e['pts'],ext]);e['ws']=np.concatenate([e['ws'],[e['ws'][-1]]]);e['cs']=np.concatenate([e['cs'],[e['cs'][-1]]])
    e['s']=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(e['pts'],axis=0).T))]);e['L']=e['s'][-1]
t=np.full(nc_,np.inf);d=np.full(nc_,np.inf)
def spread(pq):
  while pq:
    tu,u=heapq.heappop(pq)
    if tu>t[u]: continue
    for j in adj[u]:
      e=E[j];v=e['v'] if e['u']==u else e['u'];ta=max(tu,T0[e['o']])+e['L']/SP[e['o']]
      if ta<t[v]: t[v]=ta;d[v]=d[u]+e['L'];heapq.heappush(pq,(ta,v))
for r in roots: t[r]=0;d[r]=0
spread([(0,r) for r in roots])
# pieces not joined to the network start from the nearest point that is
for i in range(nc_):
  if np.isfinite(t[i]) or deg[i]==0: continue
  rr=np.nonzero(np.isfinite(t))[0];dd=np.hypot(*(cpos[rr]-cpos[i]).T);j=rr[np.argmin(dd)]
  t[i]=max(t[j],T0[2])+dd.min()/SP[2];d[i]=d[j]+dd.min();spread([(t[i],i)])
def rdp(Q,eps):
  if len(Q)<3: return [0,len(Q)-1]
  a_,b_=Q[0],Q[-1];ab=b_-a_;L=np.hypot(*ab);q=Q-a_
  dd=np.hypot(*q.T) if L<1e-9 else np.abs(ab[0]*q[:,1]-ab[1]*q[:,0])/L
  i=int(np.argmax(dd))
  if dd[i]>eps: l=rdp(Q[:i+1],eps);r=rdp(Q[i:],eps);return l[:-1]+[x+i for x in r]
  return [0,len(Q)-1]
# the parts that grow: each edge from the end reached first, or from both ends when the two fronts meet on it
parts_=[]
for e in E:
  if not (np.isfinite(t[e['u']]) and np.isfinite(t[e['v']])): continue
  s=e['s'];L=e['L'];sp=SP[e['o']];st=T0[e['o']];I=np.arange(len(s))
  tu=max(t[e['u']],st)+s/sp;tv=max(t[e['v']],st)+(L-s)/sp
  if np.all(tu<=tv+1e-6): parts_.append((e,I,tu[0],d[e['u']],e['u'],e['v']))
  elif np.all(tv<=tu+1e-6): parts_.append((e,I[::-1],tv[-1],d[e['v']],e['v'],e['u']))
  else: m=int(np.argmin(np.abs(tu-tv)));parts_+= [(e,I[:m+1],tu[0],d[e['u']],e['u'],-1),(e,I[m:][::-1],tv[-1],d[e['v']],e['v'],-1)]
# the width of the fine lines (too fine to be measured in the picture) by Leonardo's rule: a line is as wide as the number of tips it
# feeds, to a power (P.lw: [factor, power, least, most, the width under which a measured line is replaced]); the last piece before a
# free tip narrows towards it
out_=[[] for _ in range(nc_)]
for q in parts_: out_[q[4]].append(q)
ntip=np.ones(nc_)
for i in sorted(range(nc_),key=lambda i:-t[i] if np.isfinite(t[i]) else 0):
  if out_[i]: ntip[i]=sum(ntip[q[5]] if q[5]>=0 and out_[q[5]] else 1 for q in out_[i])
LW=P.get('lw')
paths=[]
for e,ii,ts0,d0,a_,b_ in parts_:
  if len(ii)<2: continue
  s=e['s'];sp=SP[e['o']];tip=b_>=0 and deg[b_]==1
  pts=e['pts'][ii];keep=rdp(pts,P.get('eps',.6)*(.5 if e['o']==0 else 1));k2=[keep[0]]  # finer on the wide lines, whose corners show
  for q in keep[1:]:
    a0=k2[-1];nn=int(np.ceil(abs(s[ii[q]]-s[ii[a0]])/(P.get('maxseg',30)*(.6 if e['o']==0 else 1))))
    for z in range(1,nn): k2.append(a0+int(round((q-a0)*z/nn)))
    k2.append(q)
  k2=sorted(set(k2));w=e['ws'][ii][k2].copy()
  if LW:
    n_=ntip[b_] if b_>=0 and out_[b_] else 1;ws_=np.clip(LW[0]*n_**LW[1],LW[2],LW[3])*np.ones(len(k2))
    if tip: ws_*=np.linspace(1,.6,len(k2))
    w=np.where(w<LW[4],np.minimum(ws_,LW[4]),w)
  paths.append(dict(x=pts[k2,0],y=pts[k2,1],w=w,c=e['cs'][ii][k2],t0=ts0,sp=sp,d0=d0,o=e['o'],tip=bool(tip) and P.get('tips',0)))
paths.sort(key=lambda p:p['t0'])
np_=sum(len(p['x']) for p in paths);tend=max(p['t0']+np.hypot(np.diff(p['x']),np.diff(p['y'])).sum()/p['sp'] for p in paths)
print('paths',len(paths),'points',np_,'grown at',round(tend,2),'s')
# ── packed: per path n (+32768 when it ends in a free tip), x0, y0 (½ px, from −64), d0 (px), t0 (ms), speed (px/s) as u16; per point dx, dy (½ px, i8), w (0.1 px), c (/255) as u8
b=bytearray()
for p in paths:
  n=len(p['x']);x0=int(round((p['x'][0]+64)*2));y0=int(round((p['y'][0]+64)*2))
  b+=struct.pack('<HHHHHH',n|(32768 if p['tip'] else 0),x0,y0,int(min(65535,p['d0'])),int(round(p['t0']*1000)),int(p['sp']));px,py=x0,y0
  for i in range(n):
    X=int(round((p['x'][i]+64)*2));Y=int(round((p['y'][i]+64)*2));dx=max(-127,min(127,X-px));dy=max(-127,min(127,Y-py));px+=dx;py+=dy
    b+=struct.pack('<bbBB',dx,dy,int(min(255,round(p['w'][i]*10))),int(round(p['c'][i]*255)))
s64=base64.b64encode(bytes(b)).decode();print('bytes',len(b),'base64',len(s64))
open(out+'.b64','w').write(s64)
im=Image.new('RGB',(W,H));dr=ImageDraw.Draw(im)
for p in paths:
  s_=np.concatenate([[0],np.cumsum(np.hypot(np.diff(p['x']),np.diff(p['y'])))])
  for i in range(1,len(p['x'])):
    r,g,bb=colorsys.hsv_to_rgb(min(.8,(p['t0']+s_[i]/p['sp'])/tend*.8),1,1)
    dr.line([(p['x'][i-1],p['y'][i-1]),(p['x'][i],p['y'][i])],fill=(int(r*255),int(g*255),int(bb*255)),width=max(1,int(p['w'][i])))
im.save(out+'_temps.png')

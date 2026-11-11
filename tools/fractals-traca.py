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
_im=Image.open(src).convert('RGB')
if 'mask' in P:  # (P.mask: polygons [[x, y, …], …] blanked before tracing: a part drawn otherwise, such as a stem)
  _d=ImageDraw.Draw(_im)
  for pg in P['mask']: _d.polygon(list(zip(pg[0::2],pg[1::2])),fill=(0,0,0))
a=np.asarray(_im).astype(float)/255
V=a.max(2);H,W=V.shape
# ── the skeleton of the bright lines
bl=ndi.gaussian_filter(V,4)
mask=(V>P.get('core',.5))|(((V-bl)>P.get('fine',.13))&(V>P.get('vmin',.22)))
mask=remove_small_objects(mask,max_size=30);mask=ndi.binary_closing(mask,iterations=1)
HUBS=([P['hub']] if not isinstance(P['hub'][0],list) else P['hub']) if 'hub' in P else []
if HUBS:  # (P.hub: [x, y, r, reach], or a list of them: the discs where many lines meet, left out of the skeleton; see below)
  _yy,_xx=np.mgrid[0:H,0:W]
  for h_ in HUBS: mask[(_xx-h_[0])**2+(_yy-h_[1])**2<h_[2]**2]=False
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
# the colour of a line: of its brightest pixel, or (P.hb: σ px) of the picture blurred with the bright pixels weighing most, which
# keeps the colour of a fine line (whose pixels are mixed with the dark) as steady as that of its neighbours
if 'hb' in P:
  wv_=V**2;den=ndi.gaussian_filter(wv_,P['hb'])+1e-6;ab=np.stack([ndi.gaussian_filter(a[...,c]*wv_,P['hb'])/den for c in range(3)],2)
def col(i):
  x,y=xs[i],ys[i]
  if 'hb' in P:
    h,s,v=colorsys.rgb_to_hsv(*ab[y,x]);return h*360,V[y,x]
  bx,by=x,y
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
for it in range(P.get('spurit',4)):  # (P.spurit: 1 when the spur is long, else each round eats the end of a line back to its next fork)
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
K0=P.get('smooth',4)
for e in E:
  pts=e['pts'];K=K0+(int(round(np.median(e['w'])*P['smoothw'])) if 'smoothw' in P else 0)
  if 'smoothw' in P: K=min(K,max(1,(len(pts)-3)//2))  # a short edge (between two forks of a wide line) smoothed as far as it can be
  if len(pts)>2*K+2:
    for _ in range(2):
      q=pts.copy();cs_=np.cumsum(np.vstack([[0,0],pts]),axis=0)
      for j in range(1,len(pts)-1):
        r=min(K,j,len(pts)-1-j);q[j]=(cs_[j+r+1]-cs_[j-r])/(2*r+1)
      pts=q
  e['pts']=pts;e['L']=np.hypot(*np.diff(pts,axis=0).T).sum()
# ── small loops (a hole in a wide line, which the skeleton goes round on both sides) opened (P.loop: the longest loop, px): the
# narrower of two edges that close a loop that short is dropped
if 'loop' in P:
  nl=0
  for it in range(3):
    inc_=[[] for _ in range(len(cpos))]
    for j,e in enumerate(E): inc_[e['u']].append(j);inc_[e['v']].append(j)
    order=sorted(range(len(E)),key=lambda j:np.median(E[j]['w']));drop=set()
    for j in order:
      e=E[j]
      if e['L']>P['loop'] or len(inc_[e['u']])<3 or len(inc_[e['v']])<3: continue
      # the shortest way from u to v without this edge, no longer than the loop allows
      dist={e['u']:0.};pq=[(0.,e['u'])];found=False
      while pq:
        du,u=heapq.heappop(pq)
        if du>dist[u]: continue
        if u==e['v']: found=du+e['L']<=P['loop'];break
        for k in inc_[u]:
          if k==j or k in drop: continue
          q=E[k];v=q['v'] if q['u']==u else q['u'];nd=du+q['L']
          if nd+e['L']<=P['loop'] and nd<dist.get(v,1e18): dist[v]=nd;heapq.heappush(pq,(nd,v))
      if found: drop.add(j);inc_[e['u']].remove(j);inc_[e['v']].remove(j)
    if not drop: break
    E=[e for j,e in enumerate(E) if j not in drop];nl+=len(drop)
  print('loops opened',nl)
# ── a wide line onto its ridge (P.snap: [the least width, the power of the brightness]): the skeleton of a wide line and its glow may
# run off its middle (pulled by the lines that leave it on one side); each point moves across the line to the middle of its bright
# core, the moves smoothed along it, its ends kept
if 'snap' in P:
  Vs=ndi.gaussian_filter(V,1);inc_=[[] for _ in range(len(cpos))]
  for j,e in enumerate(E): inc_[e['u']].append(j);inc_[e['v']].append(j)
  # the forks and ends first, across their widest line (no farther than a third of its width)
  for i in range(len(cpos)):
    if not inc_[i]: continue
    j=max(inc_[i],key=lambda j:np.median(E[j]['w']));e=E[j];mw=np.median(e['w'])
    if mw<P['snap'][0] or len(e['pts'])<3: continue
    q=e['pts'] if e['u']==i else e['pts'][::-1];tg=q[min(len(q)-1,4)]-q[0];tg/=max(1e-6,np.hypot(*tg));nr=np.array([-tg[1],tg[0]])
    off=np.linspace(-mw*.9,mw*.9,15);X=cpos[i,0]+nr[0]*off;Y=cpos[i,1]+nr[1]*off
    v=ndi.map_coordinates(Vs,[Y,X],order=1,mode='nearest')**(P['snap'][1]*2);sh=np.clip((v*off).sum()/max(1e-6,v.sum()),-mw/3,mw/3)
    cpos[i]=cpos[i]+nr*sh
    for j in inc_[i]:
      if E[j]['u']==i: E[j]['pts'][0]=cpos[i]
      if E[j]['v']==i: E[j]['pts'][-1]=cpos[i]
  for e in E:
    mw=np.median(e['w']);pts=e['pts'];n=len(pts)
    if mw<P['snap'][0] or n<5: continue
    tg=np.gradient(pts,axis=0);tg/=np.maximum(1e-6,np.hypot(*tg.T))[:,None];nr=np.stack([-tg[:,1],tg[:,0]],1)
    off=np.linspace(-mw*.9,mw*.9,15);X=pts[:,0,None]+nr[:,0,None]*off;Y=pts[:,1,None]+nr[:,1,None]*off
    v=ndi.map_coordinates(Vs,[Y.ravel(),X.ravel()],order=1,mode='nearest').reshape(X.shape)**P['snap'][1]
    sh=(v*off).sum(1)/np.maximum(1e-6,v.sum(1));sh=np.convolve(np.pad(sh,6,mode='edge'),np.ones(13)/13,mode='same')[6:-6]
    sh[0]=sh[-1]=0;sh[1:-1]*=np.clip(np.minimum(np.arange(1,n-1),np.arange(n-2,0,-1))/4,0,1)
    e['pts']=pts+nr*sh[:,None];e['L']=np.hypot(*np.diff(e['pts'],axis=0).T).sum()
# ── a hub (P.hub: [x, y, r, reach]): round a point where many lines meet (the centre of a dandelion head) the skeleton can only make a
# tangle of them, so that disc is left out of the skeleton, and the lines are cut at the reach and drawn on to the point straight,
# all of them meeting there at one node
for h_ in HUBS:
  hx_,hy_,hr_=h_[:3];reach_=h_[3] if len(h_)>3 else hr_*1.2;hm_=len(cpos);cpos=np.vstack([cpos,[[hx_,hy_]]])
  # every line is cut where it comes within the reach (the knots and Us that the lines make where they crowd in are left out) and each
  # cut end is drawn on straight to the point
  E2_=[];cut_=[]
  for e in E:
    ins_=np.hypot(e['pts'][:,0]-hx_,e['pts'][:,1]-hy_)<reach_
    if not ins_.any(): E2_.append(e);continue
    n_=len(ins_);i_=0
    while i_<n_:
      if ins_[i_]: i_+=1;continue
      j_=i_
      while j_<n_ and not ins_[j_]: j_+=1
      if j_-i_>=3:
        q_={k_:e[k_][i_:j_] for k_ in ('pts','w','h','val')}
        if i_==0: q_['u']=e['u']
        else: q_['u']=len(cpos);cpos=np.vstack([cpos,q_['pts'][0]]);cut_.append((q_['u'],q_,0))
        if j_==n_: q_['v']=e['v']
        else: q_['v']=len(cpos);cpos=np.vstack([cpos,q_['pts'][-1]]);cut_.append((q_['v'],q_,-1))
        q_['L']=np.hypot(*np.diff(q_['pts'],axis=0).T).sum();E2_.append(q_)
      i_=j_
  E=E2_;nh_=0
  # and the free ends a little farther out that point at it (a line whose last stretch the glow of the hub swallowed)
  dg_=np.zeros(len(cpos),int)
  for e in E: dg_[e['u']]+=1;dg_[e['v']]+=1
  cn_={c_[0] for c_ in cut_}
  for e in E:
    for nd_,k_ in ((e['u'],0),(e['v'],-1)):
      if dg_[nd_]!=1 or nd_ in cn_ or len(e['pts'])<6: continue
      q_=e['pts'][k_];dq_=np.hypot(q_[0]-hx_,q_[1]-hy_)
      if dq_>reach_*1.8: continue
      tg_=q_-(e['pts'][5] if k_==0 else e['pts'][-6]);tg_/=max(1e-6,np.hypot(*tg_))
      if np.dot(tg_,(np.array([hx_,hy_])-q_)/max(1e-6,dq_))>.6: cut_.append((nd_,e,k_));cn_.add(nd_)
  for nd_,e,k_ in cut_:
    L_=np.hypot(cpos[nd_,0]-hx_,cpos[nd_,1]-hy_);ns_=max(3,int(L_/2));tt_=np.linspace(0,1,ns_)[:,None]
    pts_=np.array([[hx_,hy_]])*(1-tt_)+cpos[nd_][None,:]*tt_
    E.append(dict(u=hm_,v=nd_,pts=pts_,w=np.full(ns_,e['w'][k_]),h=np.full(ns_,e['h'][k_]),val=np.full(ns_,e['val'][k_]),L=L_));nh_+=1
  nc=len(cpos)
if HUBS: print('hubs',len(HUBS))
# ── the pieces cut off from the network (a fine line fades where it leaves a wider one, so the picture shows a gap there) joined
# back to it (P.join: the farthest gap, px; needs P.roots): from its end nearest to the network, a curve that leaves the line it
# meets along that line, forwards, and turns into the piece, as a barbule leaves its barb
if 'join' in P and 'roots' in P:
  from scipy.spatial import cKDTree
  JM=P['join'];cpos=np.vstack([cpos,np.zeros((0,2))])
  for it in range(4):
    nc=len(cpos);adj=[[] for _ in range(nc)]
    for j,e in enumerate(E): adj[e['u']].append(j);adj[e['v']].append(j)
    comp=-np.ones(nc,int);nco=0
    for i in range(nc):
      if comp[i]>=0 or not adj[i]: continue
      st=[i];comp[i]=nco
      while st:
        x_=st.pop()
        for j in adj[x_]:
          for y_ in (E[j]['u'],E[j]['v']):
            if comp[y_]<0: comp[y_]=nco;st.append(y_)
      nco+=1
    dg=np.array([len(a_) for a_ in adj]);live=np.nonzero(dg>0)[0]
    main={comp[live[np.argmin(np.hypot(*(cpos[live]-np.array(r)).T))]] for r in P['roots']}
    sx=[];sj=[];si=[]
    for j,e in enumerate(E):
      if comp[e['u']] in main:
        sx.append(e['pts']);sj+= [j]*len(e['pts']);si+=list(range(len(e['pts'])))
    tree=cKDTree(np.vstack(sx));sj=np.array(sj);si=np.array(si);best={}
    for n_ in live:
      c_=comp[n_]
      if c_ in main or dg[n_]!=1: continue
      dd,q=tree.query(cpos[n_])
      if dd<=JM and (c_ not in best or dd<best[c_][0]): best[c_]=(dd,n_,sj[q],si[q])
    if not best: break
    used=set();nj=0
    for dd,n_,j,i_ in sorted(best.values()):
      if j in used: continue
      used.add(j);e=E[j];pts=e['pts'];m=len(cpos)
      if i_<=1: m=e['u']
      elif i_>=len(pts)-2: m=e['v']
      else:
        a1=dict(u=e['u'],v=m,**{k_:e[k_][:i_+1] for k_ in ('pts','w','h','val')});a2=dict(u=m,v=e['v'],**{k_:e[k_][i_:] for k_ in ('pts','w','h','val')})
        for a_ in (a1,a2): a_['L']=np.hypot(*np.diff(a_['pts'],axis=0).T).sum()
        E[j]=a1;E.append(a2);cpos=np.vstack([cpos,pts[i_]])
      Pp=pts[i_];tg=pts[min(len(pts)-1,i_+3)]-pts[max(0,i_-3)];tg=tg/max(1e-6,np.hypot(*tg))
      e2=E[adj[n_][0]];q2=e2['pts'] if e2['u']==n_ else e2['pts'][::-1];w2=e2['w'] if e2['u']==n_ else e2['w'][::-1]
      h2=e2['h'] if e2['u']==n_ else e2['h'][::-1];v2=e2['val'] if e2['u']==n_ else e2['val'][::-1]
      Q=cpos[n_];dq=q2[min(len(q2)-1,5)]-q2[0];dq=dq/max(1e-6,np.hypot(*dq));L=np.hypot(*(Q-Pp))
      if np.dot(tg,Q-Pp)<0: tg=-tg
      ns=max(3,int(L));tt=np.linspace(0,1,ns)[:,None];c1=Pp+tg*L*.5;c2=Q-dq*L*.4
      bz=(1-tt)**3*Pp+3*(1-tt)**2*tt*c1+3*(1-tt)*tt**2*c2+tt**3*Q
      E.append(dict(u=m,v=n_,pts=bz,w=np.full(ns,w2[0]),h=np.full(ns,h2[0]),val=np.full(ns,v2[0]),L=np.hypot(*np.diff(bz,axis=0).T).sum()));nj+=1
    print('join round',it,'joined',nj)
  nc=len(cpos)
# ── a fine line leaves a wider one along it, forwards, and turns away from it gradually (P.tang: [the most width of the fine line,
# the ratio of widths, the share of its length that turns, the least px]): the skeleton makes it leave square
if 'tang' in P:
  TW,TR,TF,TM=P['tang'];inc_=[[] for _ in range(len(cpos))]
  for j,e in enumerate(E): inc_[e['u']].append(j);inc_[e['v']].append(j)
  mws=[np.median(e['w']) for e in E];nt=0
  for j,e in enumerate(E):
    if mws[j]>TW or len(e['pts'])<6: continue
    for end in ('u','v'):
      m=e[end];oth=[k for k in inc_[m] if k!=j]
      if not oth: continue
      k=max(oth,key=lambda k:mws[k])
      if mws[k]<mws[j]*TR: continue
      fw=end=='u';q=e['pts'] if fw else e['pts'][::-1];sq=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(q,axis=0).T))]);L=sq[-1]
      iq=int(np.searchsorted(sq,max(TM,L*TF)));
      if iq>=len(q)-2: continue
      pe=E[k]['pts'] if E[k]['u']==m else E[k]['pts'][::-1];tg=pe[min(len(pe)-1,4)]-pe[0];tg/=max(1e-6,np.hypot(*tg))
      Q=q[iq];dq=q[min(len(q)-1,iq+3)]-q[max(0,iq-3)];dq/=max(1e-6,np.hypot(*dq));A=q[0];D=np.hypot(*(Q-A))
      if np.dot(tg,Q-A)<0:
        # the other side of the fork: the wider line runs on beyond it (its other edge) or this is its end
        tg=-tg
      tt=np.linspace(0,1,iq+1)[:,None];c1=A+tg*D*.45;c2=Q-dq*D*.35
      bz=(1-tt)**3*A+3*(1-tt)**2*tt*c1+3*(1-tt)*tt**2*c2+tt**3*Q;q=np.vstack([bz,q[iq+1:]])
      e['pts']=q if fw else q[::-1];nt+=1
      break
    e['L']=np.hypot(*np.diff(e['pts'],axis=0).T).sum()
  print('tangent starts',nt)
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
  hh=np.where(e['h']<P['hwrap'],e['h']+360,e['h']) if 'hwrap' in P else e['h']  # (P.hwrap: hues below it go on past 360, for a palette that runs through red)
  c=np.interp(hh,[h for h,_ in HUE],[c for _,c in HUE])+np.clip(DIM[0]-e['val'],0,1)*DIM[1];e['cs']=np.clip(smooth(c,P.get('csm',5)),0,1)
# (P.peaks: [the least fall, px; the reach, px; the least width]): the summits of the wide lines become nodes to grow from. A summit is
# a point higher on the screen than every point of the wide lines within the reach along them, from which they fall by the least fall
PEAKS=[]
if 'peaks' in P:
  PR,PWN,PMW=P['peaks'];wide=[j for j,e in enumerate(E) if e['mw']>=PMW]
  # the points of the wide lines, every ~3 px, as a graph (the nodes shared)
  gp=[];gadj=[];key={}
  def gnode(x_,y_,k_=None):
    if k_ is not None and k_ in key: return key[k_]
    gp.append((x_,y_));gadj.append([]);i_=len(gp)-1
    if k_ is not None: key[k_]=i_
    return i_
  own=[]
  for j in wide:
    e=E[j];n_=len(e['pts']);idx_=list(range(0,n_,3))
    if idx_[-1]!=n_-1: idx_.append(n_-1)
    prev=None
    for q_ in idx_:
      k_=('n',e['u']) if q_==0 else ('n',e['v']) if q_==n_-1 else None;g=gnode(*e['pts'][q_],k_);own.append((g,j,q_))
      if prev is not None: d_=np.hypot(gp[g][0]-gp[prev][0],gp[g][1]-gp[prev][1]);gadj[g].append((prev,d_));gadj[prev].append((g,d_))
      prev=g
  gp=np.array(gp);where={}
  for g,j,q_ in own: where.setdefault(g,(j,q_))
  found=[]
  for g in range(len(gp)):
    if any(gp[h][1]<gp[g][1] for h,_ in gadj[g]): continue
    dist={g:0.};pq=[(0.,g)];ok=True;fall=0.
    while pq:
      du,u=heapq.heappop(pq)
      if du>dist[u]: continue
      if gp[u][1]<gp[g][1]-1e-6: ok=False;break
      fall=max(fall,gp[u][1]-gp[g][1])
      for v_,dl in gadj[u]:
        if du+dl<=PWN and du+dl<dist.get(v_,1e18): dist[v_]=du+dl;heapq.heappush(pq,(du+dl,v_))
    if ok and fall>=PR and all(np.hypot(*(gp[g]-gp[f_]))>PWN*.5 for f_ in found): found.append(g)
  # each summit: the node it is, or a new node where its line is cut
  cuts={}
  for g in found:
    j,q_=where[g];e=E[j]
    if q_==0: PEAKS.append(e['u'])
    elif q_==len(e['pts'])-1: PEAKS.append(e['v'])
    else: cuts.setdefault(j,[]).append(q_)
  newE=[]
  for j,e in enumerate(E):
    if j not in cuts: newE.append(e);continue
    cut=sorted(cuts[j]);b_=[0]+cut+[len(e['pts'])-1];ids=[e['u']]
    for i in cut: cpos=np.vstack([cpos,e['pts'][i]]);ids.append(len(cpos)-1);PEAKS.append(len(cpos)-1)
    ids.append(e['v'])
    for a_ in range(len(b_)-1):
      i0,i1=b_[a_],b_[a_+1];q=dict(e);q['u']=ids[a_];q['v']=ids[a_+1]
      for k_ in ('pts','w','h','val','ws','cs'): q[k_]=e[k_][i0:i1+1]
      q['s']=e['s'][i0:i1+1]-e['s'][i0];q['L']=q['s'][-1];newE.append(q)
  E=newE;nc=len(cpos);print('peaks',len(PEAKS),[(int(cpos[r,0]),int(cpos[r,1])) for r in PEAKS])
# (P.relw: [w0, w1]: the order of an edge by its width over the width of the widest lines of its network (their 90th percentile))
if 'relw' in P:
  nn_=len(cpos);par=list(range(nn_))
  def fd(x_):
    while par[x_]!=x_: par[x_]=par[par[x_]];x_=par[x_]
    return x_
  for e in E: par[fd(e['u'])]=fd(e['v'])
  cw_={}
  for e in E: cw_.setdefault(fd(e['u']),[]).append(e['mw'])
  cw_={k_:np.percentile(v_,90) for k_,v_ in cw_.items()}
  for e in E: r_=e['mw']/cw_[fd(e['u'])];e['o']=0 if r_>=P['relw'][0] else 1 if r_>=P['relw'][1] else 2
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
# the colour by the saturation of the line (P.csat: [[saturation, c], …]; from the blurred colour of P.hb): white lines and gold ones
if 'csat' in P:
  ts_=sorted(P['csat']);mx_=ab.max(2);sat_=np.where(mx_>1e-6,(mx_-ab.min(2))/np.maximum(mx_,1e-6),0)
  for e in E:
    q_=np.round(e['pts']).astype(int);e['sat']=sat_[np.clip(q_[:,1],0,H-1),np.clip(q_[:,0],0,W-1)]
  for e in E: e['cs']=np.clip(smooth(np.interp(e['sat'],[a for a,_ in ts_],[b for _,b in ts_]),P.get('csm',5)),0,1)
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
    if dist>P.get('rootext',60): continue
    ext=np.array([p0+dv*(dist+20)]);n0=1
    if fw:
      e['pts']=np.vstack([ext,e['pts']]);e['ws']=np.concatenate([[e['ws'][0]],e['ws']]);e['cs']=np.concatenate([[e['cs'][0]],e['cs']])
    else:
      e['pts']=np.vstack([e['pts'],ext]);e['ws']=np.concatenate([e['ws'],[e['ws'][-1]]]);e['cs']=np.concatenate([e['cs'],[e['cs'][-1]]])
    e['s']=np.concatenate([[0],np.cumsum(np.hypot(*np.diff(e['pts'],axis=0).T))]);e['L']=e['s'][-1]
t=np.full(nc_,np.inf);d=np.full(nc_,np.inf)
# (P.lag: [0, lag1, lag2]: a line of a higher order than the lowest at its fork waits that long before it leaves)
LAG=P.get('lag',[0,0,0]);mo=[min([E[j]['o'] for j in adj[i]],default=0) for i in range(nc_)]
def spread(pq):
  while pq:
    tu,u=heapq.heappop(pq)
    if tu>t[u]: continue
    for j in adj[u]:
      e=E[j];v=e['v'] if e['u']==u else e['u'];ta=max(tu+(LAG[e['o']] if e['o']>mo[u] else 0),T0[e['o']])+e['L']/SP[e['o']]
      if ta<t[v]: t[v]=ta;d[v]=d[u]+e['L'];heapq.heappush(pq,(ta,v))
# (P.top: [the span of the start times, s; the least length of a network, px]): each separate network (a mountain range) grows from its
# highest point, the ranges higher in the picture (farther) first, the start times spread over the span by height
rt={r:0. for r in roots}
if PEAKS:
  roots=PEAKS;ys_=cpos[roots,1];y0_,y1_=ys_.min(),ys_.max();rt={r:P.get('peakT',2.5)*(cpos[r,1]-y0_)/max(1,y1_-y0_) for r in roots}
if 'top' in P:
  comp=-np.ones(nc_,int);nco=0;roots=[]
  for i in range(nc_):
    if comp[i]>=0 or deg[i]==0: continue
    st=[i];comp[i]=nco;mem=[i]
    while st:
      x_=st.pop()
      for j in adj[x_]:
        for y_ in (E[j]['u'],E[j]['v']):
          if comp[y_]<0: comp[y_]=nco;st.append(y_);mem.append(y_)
    if sum(E[j]['L'] for m_ in mem for j in adj[m_])/2>=P['top'][1]: roots.append(min(mem,key=lambda m_:cpos[m_,1]))
    nco+=1
  ys_=np.array([cpos[r,1] for r in roots]);y0_,y1_=ys_.min(),ys_.max()
  rt={r:P['top'][0]*(cpos[r,1]-y0_)/max(1,y1_-y0_) for r in roots}
  print('ranges',len(roots),'summits',[(int(cpos[r,0]),int(cpos[r,1]),round(rt[r],2)) for r in roots])
if 'rootT' in P and 'roots' in P and not PEAKS and 'top' not in P: rt={r:P['rootT'][i] for i,r in enumerate(roots)}  # (P.rootT: the start time of each root)
for r in roots: t[r]=rt[r];d[r]=0
spread(sorted((rt[r],r) for r in roots))
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
  lu=LAG[e['o']] if e['o']>mo[e['u']] else 0;lv_=LAG[e['o']] if e['o']>mo[e['v']] else 0
  tu=max(t[e['u']]+lu,st)+s/sp;tv=max(t[e['v']]+lv_,st)+(L-s)/sp
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
LW=P.get('lw');CF=P.get('cfeed')
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
  c_=e['cs'][ii][k2]
  # (P.cfeed: [[tips, c], …], the least length, px): the colour by the number of tips a line feeds, so that the lines that carry a
  # whole crown (the beak of a dandelion seed) keep a colour of their own whatever the glow of their crown does to it (no shorter ones)
  if CF and e['L']>=CF[1]: n_=ntip[b_] if b_>=0 and out_[b_] else 1;c_=np.minimum(c_,np.interp(n_,[a for a,_ in CF[0]],[v for _,v in CF[0]]))
  paths.append(dict(x=pts[k2,0],y=pts[k2,1],w=w,c=c_,t0=ts0,sp=sp,d0=d0,o=e['o'],tip=bool(tip) and P.get('tips',0),b=float(np.median(e['val']))))
paths.sort(key=lambda p:p['t0'])
np_=sum(len(p['x']) for p in paths);tend=max(p['t0']+np.hypot(np.diff(p['x']),np.diff(p['y'])).sum()/p['sp'] for p in paths)
print('paths',len(paths),'points',np_,'grown at',round(tend,2),'s')
# ── packed: per path n (+32768 when it ends in a free tip), x0, y0 (½ px, from −64), d0 (px), t0 (ms), speed (px/s) as u16; per point dx, dy (½ px, i8), w (0.1 px), c (/255) as u8
# (P.lumv: the packing starts with 65535, 2 and each path carries one more u16, its brightness in the picture, ‰: the median of its pixels)
b=bytearray(struct.pack('<HH',65535,2) if P.get('lumv') else b'')
for p in paths:
  n=len(p['x']);x0=int(round((p['x'][0]+64)*2));y0=int(round((p['y'][0]+64)*2))
  b+=struct.pack('<HHHHHH',n|(32768 if p['tip'] else 0),x0,y0,int(min(65535,p['d0'])),int(round(p['t0']*1000)),int(p['sp']));px,py=x0,y0
  if P.get('lumv'): b+=struct.pack('<H',int(round(min(1,p['b'])*1000)))
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

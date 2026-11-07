import sys,glob,os,subprocess,json,numpy as np
sys.path.insert(0,'/tmp/w/v/02_CODI/tools')
from make_oneshot import decode, steady_tones, RATE
LOOP={'cremador','ventalt'}
res={}
for f in sorted(glob.glob('/tmp/w/viatge/sons/raw/*.mp3')):
    n=os.path.basename(f)[:-4]; name,k=n.rsplit('_',1)
    x=decode(f); hop=int(RATE*.05)
    env=np.array([np.sqrt(np.mean(x[i:i+hop]**2)) for i in range(0,len(x)-hop,hop)])+1e-9
    db=20*np.log10(env); top=db.max()
    active=(db>top-30).mean()
    clip=(np.abs(x)>.99).mean()*1e4
    tones=len(steady_tones(x[:RATE*4]))
    # spectral centroid (harsh vs dull)
    sp=np.abs(np.fft.rfft(x)); fr=np.fft.rfftfreq(len(x),1/RATE); cen=float((sp*fr).sum()/sp.sum())
    floor=np.percentile(db,10)-top   # quiet parts relative to loud
    steady=np.std(db[db>top-30])
    if name in LOOP: score=-steady*2-tones*3-clip+active*10
    else: score=-tones*3-clip*2+min(active,.8)*6-abs(cen-2500)/1500
    res.setdefault(name,[]).append(dict(k=k,score=round(score,2),active=round(active,2),tones=tones,clip=round(clip,1),cen=int(cen),steady=round(steady,1),dur=round(len(x)/RATE,2)))
pick={}
for name,v in res.items():
    v.sort(key=lambda d:-d['score']); pick[name]=v[0]['k']
    print(name, ' | '.join(f"{d['k']}:{d['score']} a{d['active']} t{d['tones']} c{d['cen']} s{d['steady']}" for d in v))
json.dump(pick,open('/tmp/w/viatge/sons/tria.json','w'))

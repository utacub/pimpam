import json,subprocess,sys,numpy as np,os,tempfile
sys.path.insert(0,'/tmp/w/v/02_CODI/tools')
from make_oneshot import decode,loudness,RATE
P=json.load(open('/tmp/w/viatge/sons/tria.json'))
OUT='/tmp/w/v/02_CODI/dist/assets/samples/viatge/'
# name: (fade, level, highpass, lowpass)
ONE={'encesa':(.3,-18,60,None),'apagada':(.4,-18,60,None),'lladruc':(.2,-18,120,None),'badall':(.3,-19,120,None),'udol':(.4,-19,120,None),
 'cistella':(.3,-18,50,None),'festa':(.8,-19,80,None),'ovelles':(.8,-18,80,None),'tren':(.9,-18,40,None),'barca':(.9,-19,40,None),
 'canalla':(.8,-20,120,None),'vela':(.8,-19,60,None),'mussol':(.6,-18,None,None),'isard':(.6,-18,60,None),'telecabina':(.9,-19,40,None),
 'flamencs':(.8,-18,80,None),'dofins':(.8,-18,80,None),'oques':(.9,-18,80,None)}
zones={}
for n,(fade,lev,hp,lp) in ONE.items():
    src=f'/tmp/w/viatge/sons/raw/{n}_{P[n]}.mp3';a=['python3','/tmp/w/v/02_CODI/tools/make_oneshot.py',src,OUT+n+'.mp3','--fade',str(fade),'--level',str(lev)]
    if hp:a+=['--highpass',str(hp)]
    r=json.loads(subprocess.run(a,check=True,capture_output=True,text=True).stdout);zones[n]=[f"viatge/{n}.mp3",0,0,round(r['duration'],2),0,0,1,None,None,n];print(n,r)
def loop(n,lev,xf=1.0,hp=None):
    src=f'/tmp/w/viatge/sons/raw/{n}_{P[n]}.mp3';x=decode(src,[f'highpass=f={hp}'] if hp else [])
    x=x[int(.15*RATE):len(x)-int(.1*RATE)];k=int(xf*RATE);L=len(x)-k
    w=np.sin(np.linspace(0,np.pi/2,k))**2;y=x[:L].copy();y[:k]=x[:k]*w+x[L:]*(1-w)   # end crossfades into start
    # level: integrated-ish (use momentary max-3)
    m,pk=loudness(y);g=min(lev-m,-1-pk);y*=10**(g/20)
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        y.astype('<f4').tofile(t.name);subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(RATE),'-ac','1','-i',t.name,'-c:a','libmp3lame','-q:a','3',OUT+n+'.mp3'],check=True)
    # mp3 encoder delay: loop on the decoded length
    d=len(decode(OUT+n+'.mp3'))/RATE;zones[n]=[f"viatge/{n}.mp3",0,0,round(d,3),0,0,1,0.05,round(L/RATE+0.025,3),n];print(n,round(L/RATE,3),d,m+g)
loop('cremador',-20,1.0,50);loop('ventalt',-22,1.5,30)
json.dump(zones,open('/tmp/w/viatge/sons/zones.json','w'))

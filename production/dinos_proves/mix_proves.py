# El pou del temps, style tests: the provisional sound of the test video (29.5 s). Recorded instruments (VSCO-2 CE, CC0, as in the
# app) and the ElevenLabs takes of the flow «El pou del temps · proves d'estil». Not heard by anyone yet: levels are measured only.
import numpy as np,subprocess,json,sys,os
R=44100;S='/home/claude/w28/02_CODI/dist/assets/samples';E='/tmp/dp/el/raw'
def load(p):
    x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(R),'-f','f32le','-'],capture_output=True,check=True).stdout,dtype='<f4').astype(np.float64)
    return x
NOTE={'C':0,'Cs':1,'D':2,'Ds':3,'E':4,'F':5,'Fs':6,'G':7,'Gs':8,'A':9,'As':10,'B':11}
def midi(n):
    import re;m=re.match(r'([A-G]s?)(-?\d)',n);return 12*(int(m.group(2))+1)+NOTE[m.group(1)]
cache={}
def inst(name,note):
    fs=[f[:-4] for f in os.listdir(f'{S}/{name}') if f.endswith('.mp3')];t=midi(note)
    best=min(fs,key=lambda f:abs(midi(f)-t));k=(name,best)
    if k not in cache:cache[k]=load(f'{S}/{name}/{best}.mp3')
    x=cache[k];ratio=2**((t-midi(best))/12)
    if abs(ratio-1)>1e-6:
        n=int(len(x)/ratio);x=np.interp(np.arange(n)*ratio,np.arange(len(x)),x)
    return x
T=29.5;N=int(T*R);L=np.zeros(N);Rr=np.zeros(N)
def put(x,t,g=1.,pan=0.,dur=None,fade=.15):
    if dur:n=int(dur*R);x=x[:n].copy();f=int(fade*R);x[-f:]*=np.linspace(1,0,f) if len(x)>f else 1
    a=int(t*R);b=min(N,a+len(x));x=x[:b-a]*g;l=np.cos((pan+1)*np.pi/4);r=np.sin((pan+1)*np.pi/4)
    L[a:b]+=x*l*1.414;Rr[a:b]+=x*r*1.414
def db(x):return 10**(x/20)
def el(name,i):return load(f'{E}/{name}_{i}.mp3')
def norm(x,lufs):  # rough loudness by RMS of the loud part
    rms=np.sqrt(np.mean(x[np.abs(x)>np.max(np.abs(x))*.05]**2)+1e-12);return x/rms*db(lufs+3)
# ---- travelling 1 (0–2 s): a marimba run going down, the rock rustling ----
for i,n in enumerate(['A5','G5','E5','D5','C5','A4','G4','E4']):put(inst('marimba',n),.05+i*.21,db(-20-i*.4),pan=.4-i*.1)
put(norm(el('roca_sorra',2),-30),0.,1.,0.,2.,.6)
# ---- the fossil wakes (1.8–3.6): a harp going up, two soft glockenspiel notes ----
for i,n in enumerate(['D3','A3','D4','F4','A4','D5']):put(inst('harp',n),1.75+i*.17,db(-19),pan=-.3+i*.12)
put(inst('glockenspiel','A6'),2.9,db(-30),.3);put(inst('glockenspiel','D7'),3.3,db(-32),-.2)
# ---- mammoths (2–14): the steppe; slow plucked cello bass, flute phrases; the calf's snow, the trumpet, the shake, the answer ----
amb=el('estepa_llarg',int(sys.argv[1]) if len(sys.argv)>1 else 0) if os.path.exists(f'{E}/estepa_llarg_0.mp3') else np.zeros(R)
amb=norm(amb,-34);put(amb,1.6,1.,0.,12.6,1.5);
for i,n in enumerate(['D2','A2','F2','C3','D2','A2','G2','C3','D2']):put(inst('celliPizz',n),2.2+i*1.3,db(-21),-.2)
for t0,n in [(2.85,0),(3.45,0),(4.05,0)]:put(norm(el('neu_trompa',3),-29),t0,1.,-.4,1.,.3)
put(norm(el('mamut_barrit',2),-29),5.0,1.,.15,1.04,.25)
put(norm(el('llana_sacseja',0),-28),6.1,1.,.15,2.,.5)
for i,(n,d) in enumerate([('A4',.55),('D5',.55),('C5',.5),('A4',.9)]):put(inst('flute',n),7.4+i*.55,db(-27),.1,d,.2)
put(norm(el('cria_barrit',1),-27),9.5,1.,-.35,1.04,.25)
put(inst('marimba','D5'),10.05,db(-21),-.1);put(inst('marimba','A5'),10.3,db(-23),.1)
for i,(n,d) in enumerate([('F4',.5),('E4',.5),('D4',1.)]):put(inst('flute',n),11.0+i*.5,db(-28),.1,d,.25)
for i,n in enumerate(['D3','F3','A3','D4']):put(inst('harp',n),13.0+i*.06,db(-22),0.)
# ---- travelling 2 (14–16): down through the end of the Cretaceous; one soft timpani note at the dark clay ----
for i,n in enumerate(['E5','D5','C5','A4','G4','E4','D4','C4']):put(inst('marimba',n),14.05+i*.21,db(-20-i*.4),pan=.4-i*.1)
put(norm(el('roca_sorra',2),-30),14.,1.,0.,2.,.6);put(inst('timpani','F2'),15.0,db(-24),0.)
# ---- the fossil wakes ----
for i,n in enumerate(['C3','G3','C4','E4','G4','C5']):put(inst('harp',n),15.75+i*.17,db(-19),pan=-.3+i*.12)
put(inst('glockenspiel','G6'),16.9,db(-30),.3)
# ---- tyrannosaurs (16–28): the swamp; a slow low marimba; three booms with ripples; the chicks; the end ----
amb2=el('aiguamoll_llarg',int(sys.argv[2]) if len(sys.argv)>2 else 0) if os.path.exists(f'{E}/aiguamoll_llarg_0.mp3') else np.zeros(R)
amb2=norm(amb2,-34);put(amb2,15.6,1.,0.,12.6,1.5)
for i,n in enumerate(['C3','G3','E3','G3','C3','G3','F3','G3']):put(inst('marimba',n),17.0+i*1.3,db(-25),-.2)
for k,tb in enumerate([18.9,19.9,20.9]):
    b=norm(el('rex_retruny',0),-24)*db(-k*.8);put(b,tb,1.,.1,1.04,.3);put(norm(el('toll_ones',3),-33),tb+.15,1.,-.5,1.04,.3)
put(inst('timpani','F2'),18.9,db(-30),0.)
put(norm(el('cries_piulen',1),-28),23.4,1.,-.55,2.04,.3)
for i,n in enumerate(['C5','E5','G5']):put(inst('violinsPizz',n),23.6+i*.35,db(-27),-.3)
for i,n in enumerate(['G4','E4','C4']):put(inst('violinsPizz',n),25.2+i*.35,db(-28),-.3)
for i,n in enumerate(['C3','E3','G3','C4']):put(inst('harp',n),27.0+i*.06,db(-22),0.)
# ---- a small room so it all sits together, then the level ----
ir=np.random.default_rng(3).standard_normal(int(.9*R))*np.exp(-np.arange(int(.9*R))/R/.22);ir[:int(.012*R)]=0
from numpy.fft import rfft,irfft
def conv(x):n=1<<int(np.ceil(np.log2(len(x)+len(ir))));return irfft(rfft(x,n)*rfft(ir,n),n)[:len(x)]
wl,wr=conv(L),conv(Rr);s=.012;L2=L+wl*s;R2=Rr+wr*s
# the waiting: everything fades in the last 1.5 s
f=np.ones(N);a=int(28.*R);f[a:]=np.linspace(1,0,N-a)**2;L2*=f;R2*=f
st=np.stack([L2,R2],1);pk=np.max(np.abs(st));
open('/tmp/dp/audio/raw.f32','wb').write(st.astype('<f4').tobytes())
print('peak',20*np.log10(pk))

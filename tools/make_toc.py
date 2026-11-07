#!/usr/bin/env python3
"""Fem castells, 0.45.8: the real toc de castells, cut into seven pieces, one per press.

Source: «Primer 5 de 8 descarregat pels Marrecs de Salt» (JordiGran, 2015, Wikimedia Commons, CC BY-SA 4.0), the sound track of the
video. The gralles and the timbal start playing at 120.4 s, when the castell begins to rise; at 3:24 (204 s) the castell is crowned
(Marc): the gralles end their toc and the square applauds; what follows goes with the castell coming down.
The two long rests inside the toc (144.6-149.1 s and 161.3-166.9 s, the crowd only) are shortened to a short crossfade.
Pieces 1-3 (the pinya with the baixos, the segons, the terços) follow the toc from its start; pieces 4-6 (the quarts, the dosos, the
aixecador) are the stretch of toc that ends at 195.8 s, just before the last rest of the gralles. Each ends at the quietest moment of the
gralles between 6.0 and 7.6 s from its start (pieces 4-6 are found backwards from 195.8 s), so it fits a press of 8 s and a pause falls
between two notes. The seventh (the enxaneta) starts at 3:20 (200.0 s, Marc): the last phrase of the gralles (202-206 s) as the enxaneta climbs and makes
the aleta (3 s into the press, FEM_ALETA, 203 s), then the applause of the square (from 206 s) while the castell comes down, to 214.5 s.
Every piece starts with a 60 ms fade and ends with a 0.6 s one (1.2 s the seventh).
Treatment: a 120 Hz high-pass filter (rumble and wind), mono, one gain for all the pieces (-20 LUFS integrated over the whole toc),
peaks under -1 dBFS; MP3 at 96 kb/s, 44.1 kHz.
Usage: python3 tools/make_toc.py <source video or audio> <output folder>
"""
import sys,os,json,subprocess,numpy as np
SR=44100
def load(src):
    raw=subprocess.run(['ffmpeg','-v','error','-i',src,'-vn','-ac','1','-ar',str(SR),'-af','highpass=f=120','-f','f32le','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).copy()
def seg(x,a,b):return x[int(a*SR):int(b*SR)].copy()
def join(parts,xf=.6):
    n=int(xf*SR);out=parts[0]
    for p in parts[1:]:
        r=np.linspace(0,1,n,dtype=np.float32);mid=out[-n:]*np.sqrt(1-r)+p[:n]*np.sqrt(r);out=np.concatenate([out[:-n],mid,p[n:]])
    return out
def tonal(x):
    hop=int(.05*SR);w=4096;f=np.fft.rfftfreq(w,1/SR);band=(f>1300)&(f<4200);v=[]
    for i in range(0,len(x)-w,hop):
        s=np.abs(np.fft.rfft(x[i:i+w]*np.hanning(w)))[band];v.append(np.mean(np.sort(s)[-10:])/(np.median(s)+1e-9))
    v=np.convolve(np.array(v),np.ones(3)/3,'same');return v,hop
def fades(p,i=.06,o=.6):
    p=p.copy();a=int(i*SR);b=int(o*SR);p[:a]*=np.linspace(0,1,a);p[-b:]*=np.linspace(1,0,b)**1.5;return p
def lufs(x):
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        t.write(x.astype(np.float32).tobytes());t.flush()
        r=subprocess.run(['ffmpeg','-hide_banner','-f','f32le','-ar',str(SR),'-ac','1','-i',t.name,'-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
    import re;return float(re.findall(r'I:\s+(-?[\d.]+) LUFS',r)[-1])
def main(src,out):
    x=load(src)
    body=join([seg(x,120.4,144.9),seg(x,148.8,161.6),seg(x,166.6,195.8)])
    final=seg(x,200.0,214.5)
    v,hop=tonal(body);n=len(body)/SR
    quiet=lambda a,b:(int(a*SR/hop)+int(np.argmin(v[int(a*SR/hop):int(b*SR/hop)])))*hop/SR
    pieces=[];t=0.0
    for k in range(3):e=quiet(t+6.0,t+7.6);pieces.append((t,e));t=e
    tail=[];e=n
    for k in range(3):s0=quiet(e-7.6,e-6.0);tail.insert(0,(s0,e));e=s0
    assert e>=pieces[-1][1],'the two stretches overlap'
    pieces+=tail
    clips=[fades(body[int(a*SR):int(b*SR)]) for a,b in pieces]+[fades(final,.06,1.2)]
    whole=np.concatenate(clips);g=10**((-20-lufs(whole))/20)
    peak=max(np.max(np.abs(c)) for c in clips)*g
    if peak>10**(-1/20):g*=10**(-1/20)/peak
    os.makedirs(out,exist_ok=True);info=[]
    for k,c in enumerate(clips,1):
        y=(c*g).astype(np.float32);fn=os.path.join(out,f'toc{k}.mp3')
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','1','-i','-','-c:a','libmp3lame','-b:a','96k',fn],input=y.tobytes(),check=True)
        info.append({'file':f'toc{k}.mp3','seconds':round(len(y)/SR,3),'bodyStart':round(pieces[k-1][0],2) if k<=len(pieces) else None})
    print(json.dumps({'gain_dB':round(20*np.log10(g),2),'pieces':info},indent=1))
if __name__=='__main__':main(sys.argv[1],sys.argv[2])

import numpy as np,subprocess,re
R=44100;TARGET=-29.6
def lufs(f,a,d):
    r=subprocess.run(['ffmpeg','-hide_banner','-nostats','-ss',str(a),'-t',str(d),'-i',f,'-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS',r)[-1])
g1=TARGET-lufs('mix_raw.wav',0,14);g2=TARGET-lufs('mix_raw.wav',14,14)
x=np.fromfile('raw.f32',dtype='<f4').reshape(-1,2).astype(np.float64);t=np.arange(len(x))/R
g=np.interp(t,[0,13.5,14.5,40],[g1,g1,g2,g2]);x*=10**(g/20)[:,None];x.astype('<f4').tofile('final.f32')
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar','44100','-ac','2','-i','final.f32','mix.wav'])
print('gains %.1f %.1f'%(g1,g2),'press1 %.1f press2 %.1f'%(lufs('mix.wav',0,14),lufs('mix.wav',14,14)))

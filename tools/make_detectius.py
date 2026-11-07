#!/usr/bin/env python3
"""Prepares the recorded notes of Detectius de sons (0.48, dist/assets/samples/detectius/) from the original files of
VS Chamber Orchestra: Community Edition (VSCO-2 CE, CC0 1.0, https://github.com/sgossner/VSCO-2-CE).

For each instrument it takes the chosen articulation and dynamic, finds the onset, measures the pitch of the note (the file
names of several sections are an octave off; the measured pitch decides the MIDI note and the tuning in cents), keeps the
natural tail up to a length per instrument with a short fade-out, sets every note to a common loudness (its loudest 400 ms,
EBU R 128 momentary, at --level LUFS, never above -1 dBFS) and encodes it as mono MP3. Prints the SAMPLE_BANK zones as JSON.

    python3 tools/make_detectius.py <vsco folder> <pick list tsv> <out folder> > zones.json
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
RATE = 44100
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
# per instrument: kept MIDI range (actual pitch), length (s), fade (s), dynamic to prefer (regex on the file name), pitched
SPEC = {
 'violi': (55, 93, 2.6, .35, r'_f$', True), 'violoncel': (36, 72, 2.6, .35, r'', True), 'contrabaix': (28, 55, 2.6, .5, r'_v3_', True),
 'fagot': (36, 67, 2.4, .3, r'', True), 'oboe': (58, 89, 2.4, .3, r'_v1_', True), 'clarinet': (50, 84, 2.4, .3, r'_v2_', True),
 'flauta': (60, 96, 2.4, .3, r'', True), 'trompa': (41, 77, 2.4, .3, r'', True), 'trombo': (40, 72, 2.4, .3, r'', True),
 'tuba': (28, 58, 2.4, .3, r'', True), 'trompeta': (52, 84, 2.4, .3, r'_v1_', True), 'piano': (36, 96, 3.6, .8, r'', True),
 'arpa': (36, 96, 3.6, .8, r'', True), 'glock': (72, 108, 3.0, .8, r'', True), 'marimba': (45, 96, 2.6, .6, r'', True),
 'timbal': (36, 60, 3.4, .9, r'', True), 'pandereta': (0, 0, 2.4, .4, r'', False), 'gong': (0, 0, 7.0, 2.0, r'', False),
 'triangle': (0, 0, 4.0, 1.2, r'', False)}

def decode(path):
    cmd = ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype='<f4').astype(np.float64)

def onset(x, below=40):
    hop = int(RATE * .005)
    env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]) + 1e-12
    db = 20 * np.log10(env)
    return max(0, int(np.argmax(db > db.max() - below)) * hop - int(RATE * .004))

def nominal(name):
    m = re.search(r'_([A-G])(#?)(-?\d)(?:_|$)', name)
    if not m: return None
    return 12 * (int(m.group(3)) + 1) + NOTE[m.group(1)] + (1 if m.group(2) else 0)

def f0(x, guess):
    """Pitch by autocorrelation near each octave of the nominal note; the octave whose period correlates best wins."""
    seg = x[int(.08 * RATE):int(.6 * RATE)]
    if len(seg) < 2048: seg = x[:int(.5 * RATE)]
    seg = seg * np.hanning(len(seg))
    n = 1 << (len(seg) * 2 - 1).bit_length()
    sp = np.fft.rfft(seg, n); ac = np.fft.irfft(np.abs(sp) ** 2)[:len(seg)]; ac /= ac[0] + 1e-12
    cands = []
    for octv in (-24, -12, 0, 12, 24):
        m = guess + octv
        if m < 20 or m > 110: continue
        per = RATE / (440 * 2 ** ((m - 69) / 12))
        lo, hi = int(per * .94), int(per * 1.06) + 2
        if hi >= len(ac) or lo < 2: continue
        k = lo + int(np.argmax(ac[lo:hi]))
        if 1 <= k < len(ac) - 1:  # parabolic interpolation
            a, b, c = ac[k - 1], ac[k], ac[k + 1]; k = k + .5 * (a - c) / (a - 2 * b + c + 1e-12)
        score = ac[int(round(k))]
        midi = 69 + 12 * np.log2(RATE / k / 440)
        if np.isfinite(midi): cands.append((score, midi))
    # a note also correlates at two and four times its period: the highest octave that correlates nearly as well as the best wins
    top = max(c[0] for c in cands)
    return max(c[1] for c in cands if c[0] >= top - .1)

def loudness(x):
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        np.concatenate([x, np.zeros(RATE // 2)]).astype('<f4').tofile(t.name)
        cmd = ['ffmpeg', '-hide_banner', '-nostats', '-v', 'verbose', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name,
               '-af', 'ebur128=peak=sample:framelog=verbose', '-f', 'null', '-']
        log = subprocess.run(cmd, check=True, capture_output=True, text=True).stderr
    return max(float(m) for m in re.findall(r'\bM:\s*(-?[\d.]+)', log))

def main():
    src, picks, out = sys.argv[1:4]; level = -18.0
    os.makedirs(out, exist_ok=True)
    rows = [l.rstrip('\n').split('\t') for l in open(picks) if l.strip()]
    zones = {}
    for inst in SPEC:
        lo, hi, length, fade, pref, pitched = SPEC[inst]
        files = [p for i, p in rows if i == inst]
        chosen = {}
        for p in sorted(files):
            name = os.path.splitext(os.path.basename(p))[0]
            x = decode(os.path.join(src, p)); x = x[onset(x):]
            if pitched:
                nom = nominal(name)
                if inst == 'piano': nom = 21 + 2 * int(name[-3:])
                if inst == 'timbal': nom = 45
                if nom is None: nom = 60
                m = f0(x, nom)
                # timpani: the principal tone (the (1,1) mode, measured on the spectrum: the fifth above it is louder in these
                # recordings, so autocorrelation is unreliable); glockenspiel: sounds an octave above the note in the name of its file (measured on the clean upper bars), bars
                # are inharmonic, so the name decides and the library's tuning is trusted
                if inst == 'timbal': m = {1: 41.4, 2: 46.8, 3: 49.5, 4: 52.4, 5: 54.6}[int(name[7])]
                if inst == 'glock': m = nominal(name) + 12
                midi = int(round(m)); cents = int(round((m - midi) * 100))
                # the measured pitch is used as it is (the MIDI note it rounds to plus the tuning in cents)
                if not (lo <= midi <= hi): continue
                key = midi
            else:
                key = name
                midi, cents = 0, 0
            good = re.search(pref, name) is not None if pref else True
            if key in chosen and not (good and not chosen[key][3]): continue
            chosen[key] = (p, name, x, good, midi, cents)
        out_z = []
        for key, (p, name, x, good, midi, cents) in sorted(chosen.items(), key=lambda kv: (kv[1][4], kv[1][1])):
            L = min(len(x), int(length * RATE)); y = x[:L].copy(); f = min(int(fade * RATE), L // 2)
            y[:int(.003 * RATE)] *= np.linspace(0, 1, int(.003 * RATE))
            y[L - f:] *= np.cos(np.linspace(0, np.pi / 2, f)) ** 2
            g = 10 ** ((level - loudness(y)) / 20); y *= g; pk = np.max(np.abs(y))
            if pk > 10 ** (-1 / 20): y *= 10 ** (-1 / 20) / pk
            short = (re.sub(r'[^A-Za-z0-9]', '', name.split('_')[0])[:6] + str(midi)) if pitched else re.sub(r'[^A-Za-z0-9]', '', name)[:20]
            fn = f'{inst}_{midi}.mp3' if pitched else f'{inst}_{short}.mp3'
            with tempfile.NamedTemporaryFile(suffix='.f32') as t:
                y.astype('<f4').tofile(t.name)
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name, '-c:a', 'libmp3lame', '-b:a', '96k', os.path.join(out, fn)], check=True)
            out_z.append([f'detectius/{fn}', midi, 0, round(L / RATE, 3), 0, cents, 1, None, None] + ([] if pitched else [name]))
            print(inst, name, midi, cents, round(L / RATE, 2), file=sys.stderr)
        zones[inst] = out_z
    print(json.dumps(zones))
main()

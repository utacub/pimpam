#!/usr/bin/env python3
"""Turns a field recording into a seamless mono loop for Natura (dist/assets/samples/nature/).

The excerpt [start, end] is folded into a loop: its last `fade` seconds are crossfaded (equal power) into its first ones, so the
end runs into the beginning without a seam. The file holds the loop with `guard` seconds of the loop on each side, so a browser
that skips more or less MP3 priming still loops on matching sound. An optional high-pass filter removes rumble below the audible
range, an optional low-pass softens a bright sound (cicadas, crickets), and --detone notches out steady tones at multiples of 100 Hz (a hum some generated sounds carry). Rare spikes are lowered to 20 dB above the RMS level (--crest none keeps them, for sparse sounds such as drops, whose peaks
are the sound itself). The loop is set to a common loudness (EBU R 128, measured with ffmpeg) and encoded as mono MP3. Prints the
zone values for SAMPLE_BANK.natureRec: duration, loop start and loop end.

    python3 tools/make_ambience.py <source> <out.mp3> [--start S] [--end S] [--fade S] [--guard S] [--lufs L] [--crest dB|none] [--highpass Hz] [--lowpass Hz] [--detone]
"""
import argparse, json, os, re, subprocess, sys, tempfile

import numpy as np

RATE = 44100


def decode(path, start, end, highpass=None, notches=(), lowpass=None):
    filters = ([f'highpass=f={highpass}'] if highpass else []) + ([f'lowpass=f={lowpass}'] if lowpass else []) + [f'bandreject=f={f}:t=q:w=25' for f in notches]
    af = ['-af', ','.join(filters)] if filters else []
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + af + ['-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype='<f4').astype(np.float64)
    a = int(round(start * RATE))
    b = len(x) if end is None else min(len(x), int(round(end * RATE)))
    return x[a:b]


def steady_tones(x, step=100, top=4000, prominence=6):
    """Steady tones at multiples of `step` Hz that stand out of the sound around them (a generator can leave such a hum)."""
    power = np.abs(np.fft.rfft(x)) ** 2
    freq = np.fft.rfftfreq(len(x), 1 / RATE)
    found = []
    for f in range(step, top + 1, step):
        tone = power[(freq >= f - 1.5) & (freq <= f + 1.5)].mean()
        near = np.r_[power[(freq >= f - 40) & (freq < f - 10)], power[(freq > f + 10) & (freq <= f + 40)]].mean()
        if 10 * np.log10(tone / near) > prominence:
            found.append(f)
    return found


def fold(x, fade):
    """A loop of len(x) - fade samples whose end crossfades into its beginning."""
    n, f = len(x), int(round(fade * RATE))
    if f <= 0 or 2 * f >= n:
        raise SystemExit('the fade must be shorter than half the excerpt')
    k = (np.arange(f) + .5) / f
    tail = x[n - f:] * np.cos(k * np.pi / 2) + x[:f] * np.sin(k * np.pi / 2)
    return np.concatenate([x[f:n - f], tail])


def tame(x, crest, ms=3):
    """Lowers the rare spikes (a splash, a click) to `crest` dB above the RMS level, with a smooth look-ahead gain.
    The loop is treated as circular, so the seam stays seamless."""
    if crest is None:
        return x
    ceiling = np.sqrt(np.mean(x ** 2)) * 10 ** (crest / 20)
    g = np.minimum(1, ceiling / np.maximum(np.abs(x), 1e-12))
    if g.min() >= 1:
        return x
    w = int(round(ms / 1000 * RATE))
    low = g.copy()
    for k in range(1, w + 1):  # the lowest gain within w samples on either side...
        low = np.minimum(low, np.minimum(np.roll(g, k), np.roll(g, -k)))
    c = np.cumsum(np.concatenate([low[-w:], low, low[:w]]))  # ...then averaged over the same span, so it ramps in and out
    smooth = (c[2 * w:] - np.concatenate([[0], c[:-2 * w - 1]])) / (2 * w + 1)
    return x * np.minimum(smooth, 1)


def loudness(x):
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        x.astype('<f4').tofile(t.name)
        cmd = ['ffmpeg', '-hide_banner', '-nostats', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name,
               '-af', 'ebur128=peak=true', '-f', 'null', '-']
        log = subprocess.run(cmd, check=True, capture_output=True, text=True).stderr
    summary = log[log.rfind('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', summary).group(1)), float(re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', summary).group(1))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('source'); p.add_argument('out')
    p.add_argument('--start', type=float, default=0); p.add_argument('--end', type=float)
    p.add_argument('--fade', type=float, default=2); p.add_argument('--guard', type=float, default=.5)
    p.add_argument('--lufs', type=float, default=-32); p.add_argument('--quality', default='3')
    p.add_argument('--crest', type=lambda v: None if v == 'none' else float(v), default=20)
    p.add_argument('--highpass', type=float)
    p.add_argument('--lowpass', type=float, help='soften a bright sound (cicadas, crickets) above this frequency')
    p.add_argument('--detone', action='store_true', help='notch out steady tones at multiples of 100 Hz')
    a = p.parse_args()
    notches = steady_tones(decode(a.source, a.start, a.end, a.highpass, (), a.lowpass)) if a.detone else []
    loop = tame(fold(decode(a.source, a.start, a.end, a.highpass, notches, a.lowpass), a.fade), a.crest)
    g = int(round(a.guard * RATE))
    body = np.concatenate([loop[-g:], loop, loop[:g]]) if g else loop
    level, peak = loudness(loop)
    gain = a.lufs - level
    gain = min(gain, -1 - peak)  # never above -1 dBFS (sample peak)
    body *= 10 ** (gain / 20)
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        body.astype('<f4').tofile(t.name)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name,
                        '-c:a', 'libmp3lame', '-q:a', a.quality, a.out], check=True)
    out = {'duration': round(len(body) / RATE, 4), 'loopStart': round(g / RATE, 4), 'loopEnd': round((g + len(loop)) / RATE, 4),
           'loop': round(len(loop) / RATE, 3), 'sourceLUFS': level, 'gain_dB': round(gain, 2), 'notches': notches, 'bytes': os.path.getsize(a.out)}
    print(json.dumps(out))


if __name__ == '__main__':
    sys.exit(main())

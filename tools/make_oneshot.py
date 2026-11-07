#!/usr/bin/env python3
"""Prepares a short generated sound (a soft burst, a crackle, a rocket's whoosh) for Piromusical (dist/assets/samples/fire/).

The sound starts at its onset (the first 10 ms louder than 40 dB below its loudest), with a short fade-in that rounds off the
attack, so no burst arrives as a click. Optional filters: a high-pass (rumble), a low-pass (a softer, rounder boom) and --detone,
which notches out the steady tones at multiples of 100 Hz that some generated sounds carry. The tail is cut at --length seconds
with a fade-out of --fade seconds. The result is set to a common loudness: its loudest 400 ms (the EBU R 128 momentary
loudness, measured with ffmpeg) reach --level LUFS, never above -1 dBFS sample peak, and it is encoded as mono MP3.
Prints the zone values for SAMPLE_BANK.fireRec: duration and the measured levels.

    python3 tools/make_oneshot.py <source> <out.mp3> [--attack MS] [--length S] [--fade S] [--level L] [--highpass Hz] [--lowpass Hz] [--detone]
"""
import argparse, json, os, re, subprocess, sys, tempfile

import numpy as np

RATE = 44100


def decode(path, filters=()):
    af = ['-af', ','.join(filters)] if filters else []
    cmd = ['ffmpeg', '-v', 'error', '-i', path] + af + ['-ac', '1', '-ar', str(RATE), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype='<f4').astype(np.float64)


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


def onset(x, below=40):
    hop = int(RATE * .01)
    env = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)]) + 1e-12
    db = 20 * np.log10(env)
    return int(np.argmax(db > db.max() - below)) * hop


def loudness(x):
    """Largest momentary loudness (400 ms, EBU R 128) and the sample peak, both measured by ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        np.concatenate([x, np.zeros(RATE // 2)]).astype('<f4').tofile(t.name)
        cmd = ['ffmpeg', '-hide_banner', '-nostats', '-v', 'verbose', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name,
               '-af', 'ebur128=peak=sample:framelog=verbose', '-f', 'null', '-']
        log = subprocess.run(cmd, check=True, capture_output=True, text=True).stderr
    momentary = [float(m) for m in re.findall(r'\bM:\s*(-?[\d.]+)', log)]
    summary = log[log.rfind('Summary:'):]
    return max(momentary), float(re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', summary).group(1))


def main():
    p = argparse.ArgumentParser()
    p.add_argument('source'); p.add_argument('out')
    p.add_argument('--attack', type=float, default=20, help='fade-in at the onset, in ms')
    p.add_argument('--length', type=float, help='cut the sound at this length (s)')
    p.add_argument('--fade', type=float, default=.4, help='fade-out at the end (s)')
    p.add_argument('--level', type=float, default=-18, help='loudest momentary loudness (LUFS)')
    p.add_argument('--highpass', type=float); p.add_argument('--lowpass', type=float)
    p.add_argument('--detone', action='store_true', help='notch out steady tones at multiples of 100 Hz')
    p.add_argument('--quality', default='3')
    a = p.parse_args()
    filters = ([f'highpass=f={a.highpass}'] if a.highpass else []) + ([f'lowpass=f={a.lowpass}'] if a.lowpass else [])
    notches = steady_tones(decode(a.source, filters)) if a.detone else []
    x = decode(a.source, filters + [f'bandreject=f={f}:t=q:w=25' for f in notches])
    start = max(0, onset(x) - int(RATE * .005))
    x = x[start:]
    if a.length:
        x = x[:int(a.length * RATE)]
    n = len(x)
    ramp_in = max(1, int(a.attack / 1000 * RATE))
    x[:ramp_in] *= np.sin(np.linspace(0, np.pi / 2, ramp_in)) ** 2
    ramp_out = min(n, max(1, int(a.fade * RATE)))
    x[n - ramp_out:] *= np.cos(np.linspace(0, np.pi / 2, ramp_out)) ** 2
    level, peak = loudness(x)
    gain = min(a.level - level, -1 - peak)  # never above -1 dBFS (sample peak)
    x *= 10 ** (gain / 20)
    with tempfile.NamedTemporaryFile(suffix='.f32') as t:
        x.astype('<f4').tofile(t.name)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(RATE), '-ac', '1', '-i', t.name,
                        '-c:a', 'libmp3lame', '-q:a', a.quality, a.out], check=True)
    out = {'duration': round(n / RATE, 4), 'trimmed': round(start / RATE, 3), 'momentaryMax': round(level + gain, 1),
           'gain_dB': round(gain, 2), 'notches': notches, 'bytes': os.path.getsize(a.out)}
    print(json.dumps(out))


if __name__ == '__main__':
    sys.exit(main())

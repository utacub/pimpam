#!/usr/bin/env python3
"""Flash analyser for tools/flash-audit-app.mjs (0.77 audit).

Reads JPEG frames from stdin (4-byte big-endian length + bytes), all of one capture at a fixed frame rate,
and prints one JSON line with the result. Criteria adapted from WCAG 2.2, success criterion 2.3.1 and its
definitions of general flash and red flash:
- per cell of CELL x CELL px, mean relative luminance and the WCAG red value;
- a transition is an opposing change of at least 0.1 relative luminance with the darker state below 0.8,
  or of at least 20 in the red value (only for saturated red, R/(R+G+B) >= 0.8);
- a cell is flagged in a one-second window when it has 7 transitions or more (more than three flashes);
- the worst 10-degree field (341 x 256 px at 1024 px wide) is searched; the criterion fails when more than
  25 % of that field is flagged at the same time.
It is an engineering check, not a certified analyser (such as the Harding test).
The cell test above also counts moving edges (a camera travelling over a detailed scene, or the legs of an animal that walks,
change small cells many times a second without anything flashing over a large area). So the verdict uses a second test that
follows the WCAG definition more closely: for every 10-degree field (sliding by four cells), a transition is counted when at least
25 % of the field's cells have changed together, in the same direction, by 0.1 relative luminance or more (the darker state below
0.8) since the field's previous transition, while at most half as many cells changed the other way (a flash brightens or
darkens its area as a whole; a moving scene brightens some cells and darkens as many others); for red, 25 % of the cells changing by 20 or more in the red value. A field fails with
7 transitions or more within one second (more than three flashes).
Usage: python3 flash-analyze.py FPS WIDTH HEIGHT [raw] < frames
With «raw», stdin carries plain RGB24 frames of WIDTH x HEIGHT (for example from ffmpeg -f rawvideo).
"""
import io
import json
import struct
import sys

import numpy as np
from PIL import Image

FPS, W, H = int(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
CELL = 8
COLS, ROWS = W // CELL, H // CELL
FW, FH = round(341 / CELL), round(256 / CELL)
LIN = np.array([(c / 12.92) if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in (np.arange(256) / 255)], dtype=np.float32)


RAW = len(sys.argv) > 4 and sys.argv[4] == 'raw'


def cells(img):
    a = img if isinstance(img, np.ndarray) else np.asarray(img.convert('RGB').resize((W, H)), dtype=np.uint8)
    a = a[: ROWS * CELL, : COLS * CELL]
    r, g, b = a[..., 0].astype(np.int32), a[..., 1].astype(np.int32), a[..., 2].astype(np.int32)
    lum = 0.2126 * LIN[r] + 0.7152 * LIN[g] + 0.0722 * LIN[b]
    s = r + g + b
    sat = (s > 0) & (r >= 0.8 * s)
    red = np.where(sat, np.maximum(0, (r - g - b) / 255.0) * 320, 0)
    shape = (ROWS, CELL, COLS, CELL)
    return lum.reshape(shape).mean(axis=(1, 3)), red.reshape(shape).mean(axis=(1, 3))


def track(series, step, dark_limit):
    """Transition frames per cell with the hysteresis of tools/flash-audit.mjs."""
    n = series.shape[0]
    flat = series.reshape(n, -1)
    out = [[] for _ in range(flat.shape[1])]
    lo = flat[0].copy(); hi = flat[0].copy(); last = np.zeros(flat.shape[1], dtype=np.int8)
    for f in range(n):
        v = flat[f]
        lo = np.minimum(lo, v); hi = np.maximum(hi, v)
        up = (last != 1) & (v - lo >= step) & ((lo < dark_limit) if dark_limit is not None else True)
        down = (~up) & (last != -1) & (hi - v >= step) & ((v < dark_limit) if dark_limit is not None else True)
        for k in np.nonzero(up | down)[0]:
            out[k].append(f)
        last = np.where(up, 1, np.where(down, -1, last)).astype(np.int8)
        hit = up | down
        lo = np.where(hit, v, lo); hi = np.where(hit, v, hi)
    return out


def evaluate(trans, n):
    worst_cell, worst_cell_at, worst_area, worst_at = 0, None, 0.0, None
    arr = [np.array(t, dtype=np.int32) for t in trans]
    active = [(k, t) for k, t in enumerate(arr) if len(t) >= 7]
    for k, t in enumerate(arr):
        if len(t):
            # max transitions in any FPS-frame window
            j = np.searchsorted(t, t + FPS)
            m = int((j - np.arange(len(t))).max())
            if m > worst_cell:
                worst_cell, worst_cell_at = m, float(t[int(np.argmax(j - np.arange(len(t))))]) / FPS
    if not active:
        return dict(worstCell=worst_cell, worstCellAt=worst_cell_at, worstArea=0.0, worstAt=None)
    for start in range(0, max(1, n - FPS + 1), 3):
        grid = np.zeros(ROWS * COLS, dtype=np.int32)
        for k, t in active:
            c = np.count_nonzero((t >= start) & (t < start + FPS))
            if c >= 7:
                grid[k] = 1
        if not grid.any():
            continue
        g = grid.reshape(ROWS, COLS)
        s = np.zeros((ROWS + 1, COLS + 1), dtype=np.int32)
        s[1:, 1:] = g.cumsum(0).cumsum(1)
        areas = (s[FH:, FW:] - s[:-FH, FW:] - s[FH:, :-FW] + s[:-FH, :-FW]) / (FW * FH)
        a = float(areas.max())
        if a > worst_area:
            worst_area, worst_at = a, start / FPS
    return dict(worstCell=worst_cell, worstCellAt=worst_cell_at, worstArea=worst_area, worstAt=worst_at)


def field_eval(series, step, dark_limit):
    """Coherent-area transitions per 10-degree field (FH x FW cells, step 4)."""
    n = series.shape[0]
    worst, at = 0, None
    for y in range(0, ROWS - FH + 1, 4):
        for x in range(0, COLS - FW + 1, 4):
            v = series[:, y:y + FH, x:x + FW].reshape(n, -1)
            ref, last, trans = 0, 0, []
            for f in range(1, n):
                d = v[f] - v[ref]
                ok = (np.minimum(v[f], v[ref]) < dark_limit) if dark_limit is not None else True
                up = np.mean((d >= step) & ok); down = np.mean((d <= -step) & ok)
                if last != 1 and up >= 0.25 and down <= 0.5 * up:
                    trans.append(f); last = 1; ref = f
                elif last != -1 and down >= 0.25 and up <= 0.5 * down:
                    trans.append(f); last = -1; ref = f
            if len(trans) >= 2:
                t = np.array(trans); j = np.searchsorted(t, t + FPS); c = j - np.arange(len(t)); m = int(c.max())
                if m > worst:
                    worst, at = m, float(t[int(np.argmax(c))]) / FPS
    return dict(worstTransitions=worst, worstAt=at, flashesPerSecond=worst / 2)


def main():
    lums, reds = [], []
    data = sys.stdin.buffer
    while RAW:
        b = data.read(W * H * 3)
        if len(b) < W * H * 3:
            break
        L, R = cells(np.frombuffer(b, dtype=np.uint8).reshape(H, W, 3))
        lums.append(L); reds.append(R)
    while not RAW:
        h = data.read(4)
        if len(h) < 4:
            break
        (n,) = struct.unpack('>I', h)
        L, R = cells(Image.open(io.BytesIO(data.read(n))))
        lums.append(L); reds.append(R)
    if not lums:
        print(json.dumps({'frames': 0})); return
    lum, red = np.stack(lums), np.stack(reds)
    n = lum.shape[0]
    mean = lum.mean(axis=(1, 2))
    g = evaluate(track(lum, 0.1, 0.8), n)
    r = evaluate(track(red, 20, None), n)
    fg = field_eval(lum, 0.1, 0.8)
    fr = field_eval(red, 20, None)
    res = dict(frames=n, general=g, red=r, fieldGeneral=fg, fieldRed=fr,
               passedCells=bool(g['worstArea'] <= 0.25 and r['worstArea'] <= 0.25),
               maxMeanStep=float(np.abs(np.diff(mean)).max()) if n > 1 else 0.0,
               maxCellStep=float(np.abs(np.diff(lum, axis=0)).max()) if n > 1 else 0.0,
               peakMean=float(mean.max()),
               passed=bool(fg['worstTransitions'] < 7 and fr['worstTransitions'] < 7))
    print(json.dumps(res))


if __name__ == '__main__':
    main()

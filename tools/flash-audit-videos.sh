#!/bin/bash
# Flash audit of every video of dist/videos (0.77 audit): each MP4 is decoded at its own frame rate, scaled to 1024x576 and
# analysed by tools/flash-analyze.py (WCAG 2.3.1 general and red flash). One JSON line per file.
# Usage: tools/flash-audit-videos.sh dist/videos > out.jsonl
here=$(dirname "$0")
for f in $(find "$1" -name '*.mp4' | sort); do
  fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$f" | awk -F/ '{printf "%d", $1/$2+0.5}')
  r=$(ffmpeg -v error -i "$f" -vf scale=1024:576 -pix_fmt rgb24 -f rawvideo - | python3 -I "$here/flash-analyze.py" "$fps" 1024 576 raw)
  echo "{\"file\":\"$f\",\"fps\":$fps,\"r\":$r}"
done

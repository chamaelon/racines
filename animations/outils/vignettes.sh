#!/bin/bash
# Produit site/commun/vignettes/<histoire>.jpg (640×360) et site/commun/durees.txt
# usage : ./vignettes.sh [instant en secondes, défaut 4]
ICI="$(cd "$(dirname "$0")/.." && pwd)"
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
FF="${FFMPEG:-$USERPROFILE/outils/ffmpeg/bin/ffmpeg.exe}"
T=${1:-4}
WIN=$(cygpath -m "$ICI" 2>/dev/null || echo "$ICI")
: > "$ICI/site/commun/durees.txt"
for d in "$ICI"/histoires/*/; do
  h=$(basename "$d"); [ -f "$d/scenes.js" ] || continue
  url="file:///${WIN// /%20}/histoires/$h/index.html"
  dur=$("$EDGE" --headless=new --disable-gpu --virtual-time-budget=4000 --dump-dom "$url?auto=0" 2>/dev/null | grep -oE 'max="[0-9.]+"' | grep -oE '[0-9.]+')
  echo "$h $dur" >> "$ICI/site/commun/durees.txt"
  tmp="$TEMP/vign-$h.png"
  "$EDGE" --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 --virtual-time-budget=4000 --screenshot="$(cygpath -w "$tmp" 2>/dev/null || echo "$tmp")" "$url?capture=1&t=$T" 2>/dev/null
  "$FF" -y -v error -i "$tmp" -vf scale=640:360 -q:v 4 "$ICI/site/commun/vignettes/$h.jpg" && rm -f "$tmp"
  echo "$h $dur"
done

#!/usr/bin/env bash
# Update game portal preview screenshots automatically
set -e

PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -f "$CHROME" ]; then
    echo "Chrome not found at $CHROME"
    exit 1
fi

echo "Updating preview screenshots..."
mkdir -p "$PORTAL_DIR/assets"

"$CHROME" --headless=new --disable-gpu --virtual-time-budget=2500 \
    --screenshot="$PORTAL_DIR/assets/suika-preview.png" --window-size=960,780 \
    "http://localhost:3030/games/suika-game/index.html?preview=1"

"$CHROME" --headless=new --disable-gpu --virtual-time-budget=1000 \
    --screenshot="$PORTAL_DIR/assets/2048-preview.png" --window-size=960,640 \
    "http://localhost:3030/games/game-2048/index.html?preview=1"

"$CHROME" --headless=new --disable-gpu \
    --screenshot="$PORTAL_DIR/assets/bubble-preview.png" --window-size=960,780 \
    "http://localhost:3030/games/bubble-shooter/index.html"

"$CHROME" --headless=new --disable-gpu \
    --screenshot="$PORTAL_DIR/assets/oneline-preview.png" --window-size=960,640 \
    "http://localhost:3030/games/one-stroke-puzzle/index.html"

# Crop outer empty margins
sips --cropToHeightWidth 760 760 "$PORTAL_DIR/assets/suika-preview.png" > /dev/null 2>&1 || true
sips --cropToHeightWidth 520 760 "$PORTAL_DIR/assets/2048-preview.png" > /dev/null 2>&1 || true
sips --cropToHeightWidth 760 760 "$PORTAL_DIR/assets/bubble-preview.png" > /dev/null 2>&1 || true
sips --cropToHeightWidth 520 760 "$PORTAL_DIR/assets/oneline-preview.png" > /dev/null 2>&1 || true

echo "All previews successfully updated!"

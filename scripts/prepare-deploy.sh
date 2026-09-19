#!/usr/bin/env bash
# Prepare game-portal for deployment by converting symlinks into real files
set -e

PORTAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "Preparing files for deployment in $PORTAL_DIR..."

cd "$PORTAL_DIR"

# 1. Remove symlinks in games/ and copy actual directories
rm -rf games
mkdir -p games

cp -r "$PORTAL_DIR/../suika-game" "$PORTAL_DIR/games/suika-game"
cp -r "$PORTAL_DIR/../game-2048" "$PORTAL_DIR/games/game-2048"
cp -r "$PORTAL_DIR/../bubble-shooter" "$PORTAL_DIR/games/bubble-shooter"
cp -r "$PORTAL_DIR/../one-stroke-puzzle" "$PORTAL_DIR/games/one-stroke-puzzle"

# Remove any nested .git folders from copied games to keep repo clean
rm -rf games/*/.git

echo "Deployment bundle is ready! All games are now packaged directly inside games/."

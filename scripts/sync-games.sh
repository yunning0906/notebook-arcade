#!/usr/bin/env bash
# Sync games from parent scratch folders into game-portal/games
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Syncing games..."
for g in suika-game game-2048 bubble-shooter one-stroke-puzzle; do
    if [ -d "$DIR/../$g" ]; then
        echo "Syncing $g..."
        mkdir -p "$DIR/games/$g"
        rsync -av --exclude '.git' --exclude '.gitignore' --exclude 'node_modules' "$DIR/../$g/" "$DIR/games/$g/"
    fi
done

echo "Games successfully synced!"

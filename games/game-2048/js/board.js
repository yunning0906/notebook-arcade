/**
 * Core 2048 Engine
 * Supports 3x3 (Challenge), 4x4 (Classic), 5x5 (Relax) grid sizes,
 * precise sliding and merging rules, score tracking, combo calculation,
 * and persistent high scores per difficulty.
 */

class Board {
    constructor(size = 4) {
        this.size = size;
        this.tiles = [];
        this.score = 0;
        this.highScore = this.loadHighScore(size);
        this.tileCounter = 1;
        this.won = false;
        this.keepPlaying = false;
        this.over = false;
        this.lastMoveTime = 0;
        this.combo = 0;

        this.init();
    }

    loadHighScore(size) {
        const saved = localStorage.getItem(`suika2048_best_${size}`);
        return saved ? parseInt(saved, 10) || 0 : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(`suika2048_best_${this.size}`, this.highScore);
        }
    }

    init() {
        this.tiles = [];
        this.score = 0;
        this.won = false;
        this.keepPlaying = false;
        this.over = false;
        this.combo = 0;

        // Spawn 2 initial tiles
        this.spawnTile();
        this.spawnTile();
    }

    setSize(newSize) {
        this.size = newSize;
        this.highScore = this.loadHighScore(newSize);
        this.init();
    }

    getGrid() {
        const grid = Array.from({ length: this.size }, () => Array(this.size).fill(null));
        for (const t of this.tiles) {
            grid[t.row][t.col] = t;
        }
        return grid;
    }

    getEmptyPositions() {
        const grid = this.getGrid();
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!grid[r][c]) {
                    empty.push({ row: r, col: c });
                }
            }
        }
        return empty;
    }

    spawnTile() {
        const empty = this.getEmptyPositions();
        if (empty.length === 0) return null;

        const pos = empty[Math.floor(Math.random() * empty.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        const tile = {
            id: this.tileCounter++,
            value: value,
            row: pos.row,
            col: pos.col,
            isNew: true,
            isMerged: false,
            combo: 1
        };
        this.tiles.push(tile);
        return tile;
    }

    /**
     * Move in direction: 'up', 'down', 'left', 'right'
     * Returns: { moved: boolean, scoreGained: number, mergedValues: number[], combo: number }
     */
    move(direction) {
        if (this.over) return { moved: false };

        const vectors = {
            up: { r: -1, c: 0 },
            down: { r: 1, c: 0 },
            left: { r: 0, c: -1 },
            right: { r: 0, c: 1 }
        };
        const vector = vectors[direction];
        if (!vector) return { moved: false };

        // Reset flags
        this.tiles.forEach(t => {
            t.isNew = false;
            t.isMerged = false;
        });

        // Determine traversal order
        const rowIndices = Array.from({ length: this.size }, (_, i) => i);
        const colIndices = Array.from({ length: this.size }, (_, i) => i);
        if (vector.r === 1) rowIndices.reverse();
        if (vector.c === 1) colIndices.reverse();

        let moved = false;
        let scoreGained = 0;
        const mergedValues = [];
        let mergeCountThisMove = 0;

        // Track merged positions in this slide to prevent chaining merges
        const mergedGrid = Array.from({ length: this.size }, () => Array(this.size).fill(false));

        // Create coordinate lookup
        const grid = this.getGrid();

        for (const r of rowIndices) {
            for (const c of colIndices) {
                const tile = grid[r][c];
                if (!tile) continue;

                // Find farthest reachable position in direction
                let currR = r;
                let currC = c;
                let nextR = currR + vector.r;
                let nextC = currC + vector.c;

                while (
                    nextR >= 0 && nextR < this.size &&
                    nextC >= 0 && nextC < this.size &&
                    !grid[nextR][nextC]
                ) {
                    currR = nextR;
                    currC = nextC;
                    nextR = currR + vector.r;
                    nextC = currC + vector.c;
                }

                // Check if target cell has a tile to merge with
                if (
                    nextR >= 0 && nextR < this.size &&
                    nextC >= 0 && nextC < this.size &&
                    grid[nextR][nextC] &&
                    grid[nextR][nextC].value === tile.value &&
                    !mergedGrid[nextR][nextC]
                ) {
                    // Merge!
                    const targetTile = grid[nextR][nextC];
                    const newValue = tile.value * 2;
                    scoreGained += newValue;
                    mergedValues.push(newValue);
                    mergeCountThisMove++;

                    // Mark as merged
                    mergedGrid[nextR][nextC] = true;

                    // Update target tile
                    targetTile.value = newValue;
                    targetTile.isMerged = true;

                    // Remove current tile from board
                    this.tiles = this.tiles.filter(t => t.id !== tile.id);
                    grid[r][c] = null;

                    moved = true;
                } else if (currR !== r || currC !== c) {
                    // Slide to empty spot
                    grid[r][c] = null;
                    grid[currR][currC] = tile;
                    tile.row = currR;
                    tile.col = currC;
                    moved = true;
                }
            }
        }

        if (moved) {
            // Update Combo
            const now = Date.now();
            if (now - this.lastMoveTime < 750 && mergeCountThisMove > 0) {
                this.combo += mergeCountThisMove;
            } else if (mergeCountThisMove > 0) {
                this.combo = mergeCountThisMove;
            } else {
                this.combo = 0;
            }
            this.lastMoveTime = now;

            // Set combo on merged tiles for animation
            if (mergeCountThisMove > 0) {
                this.tiles.forEach(t => {
                    if (t.isMerged) t.combo = this.combo;
                });
            }

            // Update scores
            this.score += scoreGained;
            this.saveHighScore();

            // Spawn next tile
            this.spawnTile();

            // Check 2048 milestone
            if (!this.won && !this.keepPlaying) {
                const has2048 = this.tiles.some(t => t.value >= 2048);
                if (has2048) {
                    this.won = true;
                }
            }

            // Check game over
            if (!this.canMove()) {
                this.over = true;
            }
        }

        return {
            moved,
            scoreGained,
            mergedValues,
            combo: this.combo,
            won: this.won,
            over: this.over
        };
    }

    canMove() {
        // If there are empty cells, moves are available
        if (this.getEmptyPositions().length > 0) return true;

        const grid = this.getGrid();
        // Check horizontally and vertically for adjacent matching pairs
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = grid[r][c].value;
                if (r + 1 < this.size && grid[r + 1][c].value === val) return true;
                if (c + 1 < this.size && grid[r][c + 1].value === val) return true;
            }
        }
        return false;
    }
}

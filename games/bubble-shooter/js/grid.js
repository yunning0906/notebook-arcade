/**
 * Hexagonal Grid System, Collision Snapping, Match-3 Cluster Flood-Fill,
 * Floating Island Detection, and Ceiling Pressure Logic.
 */

class HexGrid {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;

        this.colsEven = 8;
        this.colsOdd = 7;
        this.maxRows = 14;

        this.radius = canvasWidth / (this.colsEven * 2); // 22.5px for 360w
        this.rowHeight = this.radius * Math.sqrt(3);     // ~38.97px
        this.dangerLineY = canvasHeight - 96;             // Danger deadline

        this.grid = []; // 2D array: grid[row][col] = Bubble or null
        this.ceilingOffset = 0; // Visual/logical shift if needed
        this.reset();
    }

    reset(initialRows = 5) {
        this.grid = [];
        for (let r = 0; r < this.maxRows; r++) {
            const cols = (r % 2 === 0) ? this.colsEven : this.colsOdd;
            const rowArr = [];
            for (let c = 0; c < cols; c++) {
                if (r < initialRows) {
                    // Random color from 4 initial colors for balanced start
                    const colorIdx = Math.floor(Math.random() * 4);
                    const b = new Bubble(colorIdx, r, c);
                    const pos = this.getCoords(r, c);
                    b.x = pos.x;
                    b.y = pos.y;
                    rowArr.push(b);
                } else {
                    rowArr.push(null);
                }
            }
            this.grid.push(rowArr);
        }
    }

    getCols(r) {
        return (r % 2 === 0) ? this.colsEven : this.colsOdd;
    }

    /**
     * Convert grid (row, col) to canvas pixel coordinates (x, y)
     */
    getCoords(r, c) {
        const isEven = (r % 2 === 0);
        const x = isEven 
            ? (c + 0.5) * (this.radius * 2) 
            : (c + 1.0) * (this.radius * 2);
        const y = this.radius + r * this.rowHeight;
        return { x, y };
    }

    /**
     * Check if (r, c) is a valid slot
     */
    isValidSlot(r, c) {
        if (r < 0 || r >= this.maxRows) return false;
        const cols = this.getCols(r);
        return c >= 0 && c < cols;
    }

    getBubble(r, c) {
        if (!this.isValidSlot(r, c)) return null;
        return this.grid[r][c];
    }

    /**
     * Find 6 hexagonal neighbors of (r, c)
     */
    getNeighbors(r, c) {
        const neighbors = [];
        const isEven = (r % 2 === 0);

        const offsets = isEven ? [
            { r: 0, c: -1 }, // Left
            { r: 0, c: 1 },  // Right
            { r: -1, c: -1 },// Top-Left
            { r: -1, c: 0 }, // Top-Right
            { r: 1, c: -1 }, // Bottom-Left
            { r: 1, c: 0 }   // Bottom-Right
        ] : [
            { r: 0, c: -1 }, // Left
            { r: 0, c: 1 },  // Right
            { r: -1, c: 0 }, // Top-Left
            { r: -1, c: 1 }, // Top-Right
            { r: 1, c: 0 },  // Bottom-Left
            { r: 1, c: 1 }   // Bottom-Right
        ];

        offsets.forEach(off => {
            const nr = r + off.r;
            const nc = c + off.c;
            if (this.isValidSlot(nr, nc)) {
                neighbors.push({ r: nr, c: nc });
            }
        });

        return neighbors;
    }

    /**
     * Find best empty slot in grid closest to projectile (x, y)
     * Must be in row 0 or adjacent to an existing bubble
     */
    findSnapSlot(px, py) {
        let bestSlot = null;
        let minDist = Infinity;

        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                if (this.grid[r][c] === null) {
                    // Empty slot: check if adjacent to ceiling or existing bubble
                    const isCeiling = (r === 0);
                    let hasAdjacentBubble = false;

                    const neighbors = this.getNeighbors(r, c);
                    for (const n of neighbors) {
                        if (this.grid[n.r][n.c] !== null) {
                            hasAdjacentBubble = true;
                            break;
                        }
                    }

                    if (isCeiling || hasAdjacentBubble) {
                        const coords = this.getCoords(r, c);
                        const dist = Math.hypot(coords.x - px, coords.y - py);
                        if (dist < minDist) {
                            minDist = dist;
                            bestSlot = { r, c, x: coords.x, y: coords.y };
                        }
                    }
                }
            }
        }

        return bestSlot;
    }

    /**
     * Snap a bubble into (r, c)
     */
    placeBubble(bubble, r, c) {
        if (!this.isValidSlot(r, c)) return false;
        bubble.row = r;
        bubble.col = c;
        const coords = this.getCoords(r, c);
        bubble.x = coords.x;
        bubble.y = coords.y;
        this.grid[r][c] = bubble;
        return true;
    }

    /**
     * Find connected cluster of same color using BFS
     */
    findMatches(startR, startC) {
        const startBubble = this.getBubble(startR, startC);
        if (!startBubble) return [];

        const targetColor = startBubble.color;
        const queue = [{ r: startR, c: startC }];
        const visited = new Set([`${startR},${startC}`]);
        const matches = [];

        while (queue.length > 0) {
            const current = queue.shift();
            const b = this.getBubble(current.r, current.c);
            if (b && b.color === targetColor) {
                matches.push(b);

                const neighbors = this.getNeighbors(current.r, current.c);
                neighbors.forEach(n => {
                    const key = `${n.r},${n.c}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        const nb = this.getBubble(n.r, n.c);
                        if (nb && nb.color === targetColor) {
                            queue.push(n);
                        }
                    }
                });
            }
        }

        return matches;
    }

    /**
     * Remove given bubbles from grid and return them
     */
    removeBubbles(bubbleList) {
        bubbleList.forEach(b => {
            if (this.isValidSlot(b.row, b.col)) {
                this.grid[b.row][b.col] = null;
            }
        });
    }

    /**
     * Find floating / orphaned bubbles (bubbles not connected to row 0 ceiling)
     */
    findFloatingBubbles() {
        const anchored = new Set();
        const queue = [];

        // Start BFS from all non-null bubbles in row 0
        const cols0 = this.getCols(0);
        for (let c = 0; c < cols0; c++) {
            if (this.grid[0][c] !== null) {
                const key = `0,${c}`;
                anchored.add(key);
                queue.push({ r: 0, c: c });
            }
        }

        // BFS traverse connected cluster
        while (queue.length > 0) {
            const cur = queue.shift();
            const neighbors = this.getNeighbors(cur.r, cur.c);
            neighbors.forEach(n => {
                const key = `${n.r},${n.c}`;
                if (!anchored.has(key)) {
                    if (this.grid[n.r][n.c] !== null) {
                        anchored.add(key);
                        queue.push(n);
                    }
                }
            });
        }

        // Any bubble currently in grid not in anchored set is an orphan
        const floating = [];
        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid[r][c];
                if (b !== null && !anchored.has(`${r},${c}`)) {
                    floating.push(b);
                    this.grid[r][c] = null; // Detach from grid
                }
            }
        }

        return floating;
    }

    /**
     * Shift entire grid down by 1 row and insert a new ceiling row
     */
    advanceCeiling() {
        // Move all rows down from bottom to top
        for (let r = this.maxRows - 1; r > 0; r--) {
            const cols = this.getCols(r);
            const prevCols = this.getCols(r - 1);
            for (let c = 0; c < cols; c++) {
                if (c < prevCols && this.grid[r - 1][c] !== null) {
                    const b = this.grid[r - 1][c];
                    b.row = r;
                    b.col = c;
                    const coords = this.getCoords(r, c);
                    b.x = coords.x;
                    b.y = coords.y;
                    this.grid[r][c] = b;
                } else {
                    this.grid[r][c] = null;
                }
            }
        }

        // Populate new row 0
        const activeColors = this.getActiveColors();
        const fallbackColors = activeColors.length > 0 ? activeColors : [0, 1, 2, 3];
        const cols0 = this.getCols(0);
        for (let c = 0; c < cols0; c++) {
            const colorIdx = fallbackColors[Math.floor(Math.random() * fallbackColors.length)];
            const b = new Bubble(colorIdx, 0, c);
            const coords = this.getCoords(0, c);
            b.x = coords.x;
            b.y = coords.y;
            this.grid[0][c] = b;
        }
    }

    /**
     * Check if any bubble has touched or exceeded the danger foul line
     */
    checkGameOver() {
        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid[r][c];
                if (b !== null) {
                    if (b.y + this.radius >= this.dangerLineY) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Get list of colors currently present on the board
     */
    getActiveColors() {
        const colors = new Set();
        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid[r][c];
                if (b !== null) {
                    colors.add(b.color);
                }
            }
        }
        return Array.from(colors);
    }

    update() {
        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid[r][c];
                if (b) {
                    b.update();
                }
            }
        }
    }

    draw(ctx) {
        for (let r = 0; r < this.maxRows; r++) {
            const cols = this.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid[r][c];
                if (b) {
                    b.draw(ctx, b.x, b.y, this.radius);
                }
            }
        }
    }
}

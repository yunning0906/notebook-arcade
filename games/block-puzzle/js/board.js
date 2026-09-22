/**
 * Notebook Block Puzzle - Board Logic
 * Manages grid state (10x10 / 8x8), placement validation,
 * downward gravity drop-row calculation, and clearing logic.
 */

class PuzzleBoard {
    constructor(size = 10) {
        this.size = size;
        this.grid = [];
        this.initGrid();
    }

    initGrid() {
        this.grid = [];
        for (let r = 0; r < this.size; r++) {
            const row = [];
            for (let c = 0; c < this.size; c++) {
                row.push(null); // null = empty, or { color, colorSub, colorHighlight, symbolSvg }
            }
            this.grid.push(row);
        }
    }

    reset(size = this.size) {
        this.size = size;
        this.initGrid();
    }

    isInBounds(r, c) {
        return r >= 0 && r < this.size && c >= 0 && c < this.size;
    }

    canPlaceShape(shape, startR, startC) {
        const matrix = shape.matrix;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    const targetR = startR + r;
                    const targetC = startC + c;

                    if (!this.isInBounds(targetR, targetC)) {
                        return false;
                    }

                    if (this.grid[targetR][targetC] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Compute the landing row when a shape drops vertically from above at column startC.
     * Starts from row 0 and drops down until it hits an obstacle or the bottom.
     */
    getDropRow(shape, startC) {
        if (startC < 0 || startC + shape.width > this.size) {
            return null;
        }

        // Must at least be placeable at row 0 (the top entrance)
        if (!this.canPlaceShape(shape, 0, startC)) {
            return null; // Top is blocked
        }

        let bestRow = 0;
        const maxRow = this.size - shape.height;

        for (let r = 1; r <= maxRow; r++) {
            if (this.canPlaceShape(shape, r, startC)) {
                bestRow = r;
            } else {
                // Hit obstacle, stop here
                break;
            }
        }

        return bestRow;
    }

    placeShape(shape, startR, startC) {
        if (!this.canPlaceShape(shape, startR, startC)) {
            return false;
        }

        const matrix = shape.matrix;
        const placedCells = [];

        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    const targetR = startR + r;
                    const targetC = startC + c;
                    this.grid[targetR][targetC] = {
                        color: shape.color,
                        colorSub: shape.colorSub,
                        colorHighlight: shape.colorHighlight,
                        symbolSvg: shape.symbolSvg
                    };
                    placedCells.push({ r: targetR, c: targetC });
                }
            }
        }

        return placedCells;
    }

    findClears() {
        const fullRows = [];
        const fullCols = [];

        for (let r = 0; r < this.size; r++) {
            let rowFull = true;
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === null) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) fullRows.push(r);
        }

        for (let c = 0; c < this.size; c++) {
            let colFull = true;
            for (let r = 0; r < this.size; r++) {
                if (this.grid[r][c] === null) {
                    colFull = false;
                    break;
                }
            }
            if (colFull) fullCols.push(c);
        }

        return { rows: fullRows, cols: fullCols, totalLines: fullRows.length + fullCols.length };
    }

    clearLines(rows, cols) {
        const clearedCells = [];
        const cellMap = new Set();

        rows.forEach(r => {
            for (let c = 0; c < this.size; c++) {
                const key = `${r},${c}`;
                if (!cellMap.has(key) && this.grid[r][c]) {
                    cellMap.add(key);
                    clearedCells.push({
                        r,
                        c,
                        color: this.grid[r][c].color
                    });
                }
            }
        });

        cols.forEach(c => {
            for (let r = 0; r < this.size; r++) {
                const key = `${r},${c}`;
                if (!cellMap.has(key) && this.grid[r][c]) {
                    cellMap.add(key);
                    clearedCells.push({
                        r,
                        c,
                        color: this.grid[r][c].color
                    });
                }
            }
        });

        clearedCells.forEach(cell => {
            this.grid[cell.r][cell.c] = null;
        });

        return clearedCells;
    }

    canShapeFitAnywhere(shape) {
        for (let c = 0; c <= this.size - shape.width; c++) {
            if (this.getDropRow(shape, c) !== null) {
                return true;
            }
        }
        return false;
    }
}

window.PuzzleBoard = PuzzleBoard;

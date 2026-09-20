/**
 * Notebook Block Puzzle - Board Logic
 * Manages grid state (10x10 / 8x8), placement validation,
 * row/column line completion checks, and clearing logic.
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
                row.push(null); // null = empty, or { color, colorSub, colorHighlight }
            }
            this.grid.push(row);
        }
    }

    reset(size = this.size) {
        this.size = size;
        this.initGrid();
    }

    // Check if cell is in bounds
    isInBounds(r, c) {
        return r >= 0 && r < this.size && c >= 0 && c < this.size;
    }

    // Check if a shape can be placed at (startR, startC)
    canPlaceShape(shape, startR, startC) {
        const matrix = shape.matrix;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    const targetR = startR + r;
                    const targetC = startC + c;

                    // Out of bounds
                    if (!this.isInBounds(targetR, targetC)) {
                        return false;
                    }

                    // Already occupied
                    if (this.grid[targetR][targetC] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Place shape on the board
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
                        colorHighlight: shape.colorHighlight
                    };
                    placedCells.push({ r: targetR, c: targetC });
                }
            }
        }

        return placedCells;
    }

    // Find all full rows and columns
    findClears() {
        const fullRows = [];
        const fullCols = [];

        // Check rows
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

        // Check columns
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

    // Clear marked rows and columns, return list of cleared cell coordinates and their colors
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

        // Set cells to null
        clearedCells.forEach(cell => {
            this.grid[cell.r][cell.c] = null;
        });

        return clearedCells;
    }

    // Check if the shape can fit anywhere on the current board
    canShapeFitAnywhere(shape) {
        for (let r = 0; r <= this.size - shape.height; r++) {
            for (let c = 0; c <= this.size - shape.width; c++) {
                if (this.canPlaceShape(shape, r, c)) {
                    return true;
                }
            }
        }
        return false;
    }
}

window.PuzzleBoard = PuzzleBoard;

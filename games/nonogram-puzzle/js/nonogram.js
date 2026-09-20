/**
 * Nonogram Logic and Rule Solver
 * Handles:
 * - Line clues extraction (rows and cols)
 * - Row / Col satisfaction verification
 * - Win condition check
 * - Safe hint generator
 */

class NonogramLogic {
    /**
     * Compute clues for a 2D binary grid (target 1s)
     */
    static computeClues(grid) {
        const height = grid.length;
        const width = grid[0].length;

        const rowClues = [];
        for (let r = 0; r < height; r++) {
            const clues = [];
            let count = 0;
            for (let c = 0; c < width; c++) {
                if (grid[r][c] > 0) {
                    count++;
                } else if (count > 0) {
                    clues.push(count);
                    count = 0;
                }
            }
            if (count > 0) clues.push(count);
            rowClues.push(clues.length > 0 ? clues : [0]);
        }

        const colClues = [];
        for (let c = 0; c < width; c++) {
            const clues = [];
            let count = 0;
            for (let r = 0; r < height; r++) {
                if (grid[r][c] > 0) {
                    count++;
                } else if (count > 0) {
                    clues.push(count);
                    count = 0;
                }
            }
            if (count > 0) clues.push(count);
            colClues.push(clues.length > 0 ? clues : [0]);
        }

        return { rowClues, colClues };
    }

    /**
     * Check if a single row matches its clue
     */
    static isRowSatisfied(playerRow, targetRowClue) {
        const clues = [];
        let count = 0;
        for (let c = 0; c < playerRow.length; c++) {
            if (playerRow[c] === 1) { // 1 = filled
                count++;
            } else if (count > 0) {
                clues.push(count);
                count = 0;
            }
        }
        if (count > 0) clues.push(count);
        const actual = clues.length > 0 ? clues : [0];

        if (actual.length !== targetRowClue.length) return false;
        return actual.every((val, idx) => val === targetRowClue[idx]);
    }

    /**
     * Check if a single column matches its clue
     */
    static isColSatisfied(playerBoard, colIdx, targetColClue) {
        const clues = [];
        let count = 0;
        for (let r = 0; r < playerBoard.length; r++) {
            if (playerBoard[r][colIdx] === 1) {
                count++;
            } else if (count > 0) {
                clues.push(count);
                count = 0;
            }
        }
        if (count > 0) clues.push(count);
        const actual = clues.length > 0 ? clues : [0];

        if (actual.length !== targetColClue.length) return false;
        return actual.every((val, idx) => val === targetColClue[idx]);
    }

    /**
     * Check if the entire player board satisfies the puzzle
     * Rule: All target cells (grid[r][c] > 0) must be filled (playerBoard[r][c] === 1),
     * and NO non-target cells (grid[r][c] === 0) may be filled (playerBoard[r][c] === 1).
     * Crosses (2) or Empty (0) on empty target cells are both accepted.
     */
    static checkVictory(playerBoard, targetGrid) {
        const height = targetGrid.length;
        const width = targetGrid[0].length;

        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                const targetIsFilled = targetGrid[r][c] > 0;
                const playerIsFilled = playerBoard[r][c] === 1;

                if (targetIsFilled && !playerIsFilled) {
                    return false;
                }
                if (!targetIsFilled && playerIsFilled) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Count filled tiles remaining
     */
    static getRemainingTargetCount(playerBoard, targetGrid) {
        let remaining = 0;
        const height = targetGrid.length;
        const width = targetGrid[0].length;
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (targetGrid[r][c] > 0 && playerBoard[r][c] !== 1) {
                    remaining++;
                }
            }
        }
        return remaining;
    }

    /**
     * Provide a smart hint: finds a cell that needs to be filled or crossed out
     */
    static getSmartHint(playerBoard, targetGrid) {
        const height = targetGrid.length;
        const width = targetGrid[0].length;

        // 1. First priority: fix an error (a cell incorrectly filled with 1)
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (playerBoard[r][c] === 1 && targetGrid[r][c] === 0) {
                    return { r, c, type: 2, reason: 'erase_or_cross' };
                }
            }
        }

        // 2. Second priority: find an unfilled target cell
        const unfilled = [];
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (targetGrid[r][c] > 0 && playerBoard[r][c] !== 1) {
                    unfilled.push({ r, c, type: 1, reason: 'fill' });
                }
            }
        }

        if (unfilled.length > 0) {
            // Pick one randomly or in natural reading order
            return unfilled[Math.floor(Math.random() * unfilled.length)];
        }

        // 3. Mark a cross on an unmarked blank cell
        for (let r = 0; r < height; r++) {
            for (let c = 0; c < width; c++) {
                if (targetGrid[r][c] === 0 && playerBoard[r][c] === 0) {
                    return { r, c, type: 2, reason: 'cross' };
                }
            }
        }

        return null;
    }
}

window.NonogramLogic = NonogramLogic;

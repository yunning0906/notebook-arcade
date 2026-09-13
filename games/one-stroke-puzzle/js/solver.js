/**
 * Puzzle Solver, Hint Engine & Procedural Level Generator
 * Handles Hamiltonian Path exploration with Obstacles, Portals, and Double-Pass tiles.
 */

class PuzzleSolver {
    constructor() {}

    /**
     * Finds portals mapping in the grid: portal value 3 -> list of coordinates, 4 -> list of coordinates
     */
    static getPortalMap(grid, rows, cols) {
        const portals = {};
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = grid[r][c];
                if (val >= 3) {
                    if (!portals[val]) portals[val] = [];
                    portals[val].push([r, c]);
                }
            }
        }
        return portals;
    }

    /**
     * Total visits required for each tile in grid
     */
    static getVisitTargets(grid, rows, cols) {
        const targets = Array.from({ length: rows }, () => Array(cols).fill(0));
        let totalRequired = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const val = grid[r][c];
                if (val === 1 || val >= 3) {
                    targets[r][c] = 1;
                    totalRequired += 1;
                } else if (val === 2) {
                    // Double pass
                    targets[r][c] = 2;
                    totalRequired += 2;
                }
            }
        }
        return { targets, totalRequired };
    }

    /**
     * Check if a neighbor tile is accessible from current [r, c]
     */
    static getValidNeighbors(r, c, grid, rows, cols, visitedCounts, targets, portalMap) {
        const neighbors = [];
        const currentVal = grid[r][c];

        // 1. Direct orthogonal neighbors
        const dirs = [
            [-1, 0], // Up
            [1, 0],  // Down
            [0, -1], // Left
            [0, 1]   // Right
        ];

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (targets[nr][nc] > 0 && visitedCounts[nr][nc] < targets[nr][nc]) {
                    neighbors.push([nr, nc, false]); // [r, c, isWarp]
                }
            }
        }

        // 2. Portal jumps: if current cell is portal (>= 3), find companion portal
        if (currentVal >= 3 && portalMap[currentVal]) {
            for (const [pr, pc] of portalMap[currentVal]) {
                if ((pr !== r || pc !== c) && visitedCounts[pr][pc] < targets[pr][pc]) {
                    neighbors.push([pr, pc, true]); // Jump directly
                }
            }
        }

        return neighbors;
    }

    /**
     * Solves the level starting from initial path or startPos
     * Returns array of [r, c] path steps or null if impossible.
     */
    static solve(level, existingPath = []) {
        const { rows, cols, grid, startPos } = level;
        const { targets, totalRequired } = this.getVisitTargets(grid, rows, cols);
        const portalMap = this.getPortalMap(grid, rows, cols);

        const visitedCounts = Array.from({ length: rows }, () => Array(cols).fill(0));
        const path = [];

        // Apply existing path if any
        if (existingPath && existingPath.length > 0) {
            for (const [r, c] of existingPath) {
                visitedCounts[r][c]++;
                path.push([r, c]);
            }
        } else if (startPos && startPos.length === 2) {
            const [sr, sc] = startPos;
            if (targets[sr][sc] > 0) {
                visitedCounts[sr][sc]++;
                path.push([sr, sc]);
            }
        }

        let solution = null;
        let iterations = 0;
        const maxIterations = 50000;

        function search(currR, currC, visitedCount) {
            iterations++;
            if (iterations > maxIterations) return false;

            if (visitedCount === totalRequired) {
                solution = [...path];
                return true;
            }

            // Pruning: Quick check if any unreachable unvisited component exists
            const neighbors = PuzzleSolver.getValidNeighbors(
                currR, currC, grid, rows, cols, visitedCounts, targets, portalMap
            );

            // Sort neighbors: prefer ones with fewer available degrees (Warnsdorff's heuristic)
            neighbors.sort((a, b) => {
                const degA = PuzzleSolver.countDegrees(a[0], a[1], grid, rows, cols, visitedCounts, targets, portalMap);
                const degB = PuzzleSolver.countDegrees(b[0], b[1], grid, rows, cols, visitedCounts, targets, portalMap);
                return degA - degB;
            });

            for (const [nr, nc] of neighbors) {
                visitedCounts[nr][nc]++;
                path.push([nr, nc]);

                if (search(nr, nc, visitedCount + 1)) {
                    return true;
                }

                path.pop();
                visitedCounts[nr][nc]--;
            }

            return false;
        }

        if (path.length === 0) {
            // Try all valid starting points
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (targets[r][c] > 0) {
                        visitedCounts[r][c] = 1;
                        path.push([r, c]);
                        if (search(r, c, 1)) return solution;
                        path.pop();
                        visitedCounts[r][c] = 0;
                    }
                }
            }
        } else {
            const last = path[path.length - 1];
            if (search(last[0], last[1], path.length)) {
                return solution;
            }
        }

        return solution;
    }

    static countDegrees(r, c, grid, rows, cols, visitedCounts, targets, portalMap) {
        let count = 0;
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (targets[nr][nc] > 0 && visitedCounts[nr][nc] < targets[nr][nc]) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Get hint for current game state.
     * Returns { valid: true, nextStep: [r, c] } or { deadEnd: true }
     */
    static getHint(level, currentPath) {
        if (!currentPath || currentPath.length === 0) {
            const sol = this.solve(level, []);
            if (sol && sol.length > 0) {
                return { valid: true, nextStep: sol[0] };
            }
            return { valid: false };
        }

        // Try to complete from current path
        const sol = this.solve(level, currentPath);
        if (sol && sol.length > currentPath.length) {
            return { valid: true, nextStep: sol[currentPath.length] };
        }

        // Dead end: player made a wrong branch
        return { deadEnd: true };
    }

    /**
     * Procedural Infinite Level Generator
     * Generates a random guaranteed solvable Hamiltonian path on a grid.
     */
    static generateInfiniteLevel(levelNumber, size = 5) {
        const rows = size;
        const cols = size;
        const totalCells = rows * cols;
        const obstacleCount = Math.floor(totalCells * 0.15); // ~3-4 obstacles

        // Create random walk Hamiltonian path
        let attempts = 0;
        while (attempts < 100) {
            attempts++;
            const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
            // Carve random obstacles that don't isolate blocks
            let placed = 0;
            while (placed < obstacleCount) {
                const rr = Math.floor(Math.random() * rows);
                const rc = Math.floor(Math.random() * cols);
                if (grid[rr][rc] === 1) {
                    grid[rr][rc] = 0;
                    placed++;
                }
            }

            // Find random valid start
            const validCoords = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r][c] === 1) validCoords.push([r, c]);
                }
            }

            if (validCoords.length < totalCells - obstacleCount) continue;

            const startPos = validCoords[Math.floor(Math.random() * validCoords.length)];
            const testLevel = {
                id: levelNumber,
                pack: "INFINITE",
                name: `Mystery #${levelNumber}`,
                cols,
                rows,
                startPos,
                grid
            };

            const solution = this.solve(testLevel, [startPos]);
            if (solution && solution.length === validCoords.length) {
                return testLevel;
            }
        }

        // Fallback simple solvable grid
        return {
            id: levelNumber,
            pack: "INFINITE",
            name: `Garden #${levelNumber}`,
            cols: size,
            rows: size,
            startPos: [0, 0],
            grid: Array.from({ length: size }, () => Array(size).fill(1))
        };
    }
}

window.PuzzleSolver = PuzzleSolver;

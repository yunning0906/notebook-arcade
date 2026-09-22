/**
 * Notebook One-Stroke Line Puzzle Main Game Controller
 * Manages dragging interaction, grid setup, moves, undo, hints, scoring, and level progression.
 */

class OneStrokeGame {
    constructor() {
        this.levels = window.LEVEL_PACKS || [];
        this.currentLevelIndex = 0;
        this.isInfiniteMode = false;
        this.infiniteLevelNum = 31;

        // Current level state
        this.level = null;
        this.path = [];
        this.visitedCounts = [];
        this.targets = [];
        this.totalRequired = 0;
        this.totalVisited = 0;
        this.portalMap = {};
        this.isDragging = false;
        this.isCompleted = false;
        this.hintStep = null;

        // Stats & Tracking
        this.score = 0;
        this.bestLevel = 1;
        this.stars = {}; // levelId -> stars (1-3)
        this.moves = 0;
        this.hintUsed = false;

        // DOM elements
        this.boardContainer = document.getElementById('boardContainer');
        this.boardElement = document.getElementById('gameBoard');
        this.svgLayer = document.getElementById('svgLineLayer');
        this.fxCanvas = document.getElementById('fxCanvas');

        this.levelTitleEl = document.getElementById('levelTitle');
        this.packTagEl = document.getElementById('packTag');
        this.scoreEl = document.getElementById('scoreValue');
        this.bestEl = document.getElementById('bestValue');
        this.progressEl = document.getElementById('progressText');
        this.progressBar = document.getElementById('progressBarFill');

        // Modal elements
        this.winModal = document.getElementById('winModal');
        this.levelSelectModal = document.getElementById('levelSelectModal');
        this.levelsGridEl = document.getElementById('levelsGrid');

        this.renderer = new PuzzleRenderer(this.boardElement, this.svgLayer, this.fxCanvas);

        this.loadSavedData();
        this.bindEvents();
        this.loadLevel(this.currentLevelIndex);

        if (new URLSearchParams(window.location.search).has('demo')) {
            this.setupDemoState();
        }
    }

    setupDemoState() {
        this.score = 420;
        this.bestLevel = 6;
        this.scoreEl.textContent = '420';
        this.bestEl.textContent = '6';
        
        // Connect consecutive steps on Level 1 (3x3 grid)
        const moves = [[0, 0], [0, 1], [0, 2], [1, 2], [1, 1], [1, 0]];
        moves.forEach(([r, c]) => {
            this.addStepToPath(r, c);
        });
    }

    loadSavedData() {
        try {
            const savedBest = localStorage.getItem('oneline_best_level');
            if (savedBest) this.bestLevel = parseInt(savedBest, 10);
            const savedScore = localStorage.getItem('oneline_score');
            if (savedScore) this.score = parseInt(savedScore, 10);
            const savedStars = localStorage.getItem('oneline_stars');
            if (savedStars) this.stars = JSON.parse(savedStars);
        } catch (e) {}

        this.updateStatsUI();
    }

    saveData() {
        try {
            localStorage.setItem('oneline_best_level', this.bestLevel.toString());
            localStorage.setItem('oneline_score', this.score.toString());
            localStorage.setItem('oneline_stars', JSON.stringify(this.stars));
        } catch (e) {}
    }

    updateStatsUI() {
        if (this.scoreEl) this.scoreEl.textContent = this.score;
        if (this.bestEl) this.bestEl.textContent = this.bestLevel;
    }

    bindEvents() {
        // Global pointer up to end dragging
        window.addEventListener('pointerup', () => {
            this.isDragging = false;
        });
        window.addEventListener('pointercancel', () => {
            this.isDragging = false;
        });

        // Board pointer move handler for touch devices (where pointerenter doesn't fire as easily)
        this.boardElement.addEventListener('pointermove', (e) => {
            if (!this.isDragging || this.isCompleted) return;
            const target = document.elementFromPoint(e.clientX, e.clientY);
            if (target) {
                const cell = target.closest('.cell');
                if (cell && cell.dataset.row !== undefined) {
                    const r = parseInt(cell.dataset.row);
                    const c = parseInt(cell.dataset.col);
                    this.handlePointerEnterCell(r, c);
                }
            }
        });

        // Sound Toggle
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = window.soundEngine.toggleMute();
                soundBtn.classList.toggle('muted', muted);
                const onIcon = soundBtn.querySelector('.icon-sound-on');
                const offIcon = soundBtn.querySelector('.icon-sound-off');
                if (onIcon) onIcon.classList.toggle('hidden', muted);
                if (offIcon) offIcon.classList.toggle('hidden', !muted);
            });
        }

        // Action Buttons
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.restartLevel();
        });

        document.getElementById('undoBtn')?.addEventListener('click', () => {
            this.undoStep();
        });

        document.getElementById('hintBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.provideHint();
        });

        document.getElementById('levelsBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.openLevelSelect();
        });

        document.getElementById('closeModalBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.closeLevelSelect();
        });

        // Victory Modal Buttons
        document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.nextLevel();
        });

        document.getElementById('replayLevelBtn')?.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.hideWinModal();
            this.restartLevel();
        });

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'z' || e.key === 'Z') {
                this.undoStep();
            } else if (e.key === 'r' || e.key === 'R') {
                this.restartLevel();
            } else if (e.key === 'h' || e.key === 'H') {
                this.provideHint();
            }
        });
    }

    loadLevel(index) {
        if (this.isInfiniteMode) {
            this.level = PuzzleSolver.generateInfiniteLevel(this.infiniteLevelNum, 5);
        } else {
            this.currentLevelIndex = Math.max(0, Math.min(index, this.levels.length - 1));
            this.level = this.levels[this.currentLevelIndex];
        }

        this.path = [];
        this.moves = 0;
        this.hintUsed = false;
        this.hintStep = null;
        this.isCompleted = false;
        this.isDragging = false;

        const { rows, cols, grid, startPos } = this.level;
        const { targets, totalRequired } = PuzzleSolver.getVisitTargets(grid, rows, cols);
        this.targets = targets;
        this.totalRequired = totalRequired;
        this.totalVisited = 0;
        this.portalMap = PuzzleSolver.getPortalMap(grid, rows, cols);

        this.visitedCounts = Array.from({ length: rows }, () => Array(cols).fill(0));

        this.renderer.setTheme(this.level.id);
        this.renderBoard();

        // Update Level Labels
        if (this.levelTitleEl) {
            this.levelTitleEl.textContent = `LEVEL ${this.level.id}`;
        }
        if (this.packTagEl) {
            this.packTagEl.textContent = `${this.level.pack} • ${this.level.name}`;
        }
        this.updateProgressUI();

        // Auto-seed fixed start tile if specified
        if (startPos && startPos.length === 2 && this.targets[startPos[0]][startPos[1]] > 0) {
            this.addStepToPath(startPos[0], startPos[1], true);
        }

        this.hideWinModal();
    }

    renderBoard() {
        const { rows, cols, grid, startPos } = this.level;
        this.boardElement.innerHTML = '';

        // Configure CSS Grid
        this.boardElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.boardElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Calculate aspect ratio & sizing
        const maxDimension = Math.max(rows, cols);
        const cellSize = Math.min(68, Math.floor(380 / maxDimension));
        const boardWidth = cols * cellSize + (cols - 1) * 8;
        const boardHeight = rows * cellSize + (rows - 1) * 8;

        this.boardElement.style.width = `${boardWidth}px`;
        this.boardElement.style.height = `${boardHeight}px`;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                const val = grid[r][c];
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (val === 0) {
                    cell.classList.add('cell-void');
                } else {
                    cell.classList.add('cell-active');

                    // Double-pass tile
                    if (val === 2) {
                        cell.classList.add('cell-double');
                        const badge = document.createElement('span');
                        badge.className = 'cell-double-badge';
                        badge.textContent = '2';
                        cell.appendChild(badge);
                    }

                    // Warp portal tile
                    if (val >= 3) {
                        cell.classList.add('cell-portal');
                        const icon = document.createElement('span');
                        icon.className = 'cell-portal-icon';
                        icon.innerHTML = '✦';
                        cell.appendChild(icon);
                    }

                    // Start tile pulse tag
                    if (startPos && startPos[0] === r && startPos[1] === c) {
                        cell.classList.add('cell-start-seed');
                    }

                    // Attach pointer events for drawing
                    cell.addEventListener('pointerdown', (e) => {
                        e.preventDefault();
                        this.handlePointerDownCell(r, c);
                    });

                    cell.addEventListener('pointerenter', () => {
                        if (this.isDragging && !this.isCompleted) {
                            this.handlePointerEnterCell(r, c);
                        }
                    });
                }

                this.boardElement.appendChild(cell);
            }
        }

        this.renderer.resizeFxCanvas();
        this.renderer.renderPath(this.path, this.level, this.hintStep);
    }

    handlePointerDownCell(r, c) {
        if (this.isCompleted) return;
        if (this.targets[r][c] === 0) return;

        // If path is empty, can start here (if no fixed start or this is fixed start)
        if (this.path.length === 0) {
            this.isDragging = true;
            this.addStepToPath(r, c);
            return;
        }

        // If clicking on current head of stroke, resume dragging
        const head = this.path[this.path.length - 1];
        if (head[0] === r && head[1] === c) {
            this.isDragging = true;
            return;
        }

        // If clicking on an adjacent tile to head, extend
        if (this.isValidMove(r, c)) {
            this.isDragging = true;
            this.addStepToPath(r, c);
            return;
        }

        // If clicking on an earlier step in the path, backtrack to it!
        const stepIdx = this.findLastIndexInPath(r, c);
        if (stepIdx !== -1) {
            this.isDragging = true;
            this.backtrackTo(stepIdx);
        }
    }

    handlePointerEnterCell(r, c) {
        if (!this.isDragging || this.isCompleted) return;
        if (this.targets[r][c] === 0) return;

        const head = this.path[this.path.length - 1];
        if (head[0] === r && head[1] === c) return;

        // 1. Natural Backtrack: If moving back to the previous tile in path
        if (this.path.length > 1) {
            const prev = this.path[this.path.length - 2];
            if (prev[0] === r && prev[1] === c) {
                this.popLastStep();
                window.soundEngine.playUndoSound();
                return;
            }
        }

        // 2. Extend path forward if valid move
        if (this.isValidMove(r, c)) {
            this.addStepToPath(r, c);
        }
    }

    isValidMove(r, c) {
        if (this.path.length === 0) return true;
        const head = this.path[this.path.length - 1];
        const [hr, hc] = head;

        // Check remaining visits
        if (this.visitedCounts[r][c] >= this.targets[r][c]) {
            return false;
        }

        // Direct orthogonal neighbor
        const dr = Math.abs(r - hr);
        const dc = Math.abs(c - hc);
        if (dr + dc === 1) return true;

        // Portal leap: if head is portal and (r,c) is matching portal
        const headVal = this.level.grid[hr][hc];
        const targetVal = this.level.grid[r][c];
        if (headVal >= 3 && headVal === targetVal) {
            return true;
        }

        return false;
    }

    addStepToPath(r, c, silent = false) {
        this.path.push([r, c]);
        this.visitedCounts[r][c]++;
        this.totalVisited++;
        this.moves++;

        // Clear hint if answered correctly
        if (this.hintStep && this.hintStep[0] === r && this.hintStep[1] === c) {
            this.hintStep = null;
        }

        if (!silent) {
            window.soundEngine.playWaterDrop();
            window.soundEngine.playXylophoneTone(this.path.length);
        }

        this.updateCellVisuals(r, c);
        this.renderer.renderPath(this.path, this.level, this.hintStep);
        this.updateProgressUI();

        // Check if finished!
        if (this.totalVisited === this.totalRequired) {
            this.handleVictory();
        }
    }

    popLastStep() {
        if (this.path.length <= 1 && this.level.startPos) {
            return; // keep start tile
        }
        if (this.path.length === 0) return;

        const [r, c] = this.path.pop();
        this.visitedCounts[r][c]--;
        this.totalVisited--;

        this.updateCellVisuals(r, c);
        this.renderer.renderPath(this.path, this.level, this.hintStep);
        this.updateProgressUI();
    }

    backtrackTo(index) {
        while (this.path.length - 1 > index) {
            this.popLastStep();
        }
        window.soundEngine.playUndoSound();
    }

    findLastIndexInPath(r, c) {
        for (let i = this.path.length - 1; i >= 0; i--) {
            if (this.path[i][0] === r && this.path[i][1] === c) return i;
        }
        return -1;
    }

    undoStep() {
        if (this.path.length <= 1 && this.level.startPos) return;
        if (this.path.length > 0) {
            this.popLastStep();
            window.soundEngine.playUndoSound();
        }
    }

    restartLevel() {
        this.path = [];
        this.moves = 0;
        this.hintStep = null;
        this.isCompleted = false;
        this.isDragging = false;
        this.totalVisited = 0;

        const { rows, cols, startPos } = this.level;
        this.visitedCounts = Array.from({ length: rows }, () => Array(cols).fill(0));

        // Reset visual classes
        this.boardElement.querySelectorAll('.cell-active').forEach(cell => {
            cell.classList.remove('cell-visited', 'cell-visited-once', 'cell-visited-twice', 'cell-hint');
            cell.style.backgroundColor = '';
        });

        // Re-add start tile
        if (startPos && startPos.length === 2 && this.targets[startPos[0]][startPos[1]] > 0) {
            this.addStepToPath(startPos[0], startPos[1], true);
        }

        this.renderer.renderPath(this.path, this.level, null);
        this.updateProgressUI();
    }

    updateCellVisuals(r, c) {
        const cell = this.boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (!cell) return;

        const count = this.visitedCounts[r][c];
        const target = this.targets[r][c];

        cell.classList.remove('cell-visited', 'cell-visited-once', 'cell-visited-twice');

        if (target === 1) {
            if (count === 1) {
                cell.classList.add('cell-visited');
                cell.style.backgroundColor = this.renderer.currentPalette.fill;
            } else {
                cell.style.backgroundColor = '';
            }
        } else if (target === 2) {
            // Double pass tile
            if (count === 1) {
                cell.classList.add('cell-visited-once');
                cell.style.backgroundColor = this.renderer.currentPalette.fill;
                cell.style.opacity = '0.75';
            } else if (count === 2) {
                cell.classList.add('cell-visited-twice');
                cell.style.backgroundColor = this.renderer.currentPalette.fill;
                cell.style.opacity = '1.0';
            } else {
                cell.style.backgroundColor = '';
                cell.style.opacity = '1.0';
            }
        }
    }

    updateProgressUI() {
        if (this.progressEl) {
            this.progressEl.textContent = `${this.totalVisited} / ${this.totalRequired}`;
        }
        if (this.progressBar) {
            const pct = this.totalRequired > 0 ? (this.totalVisited / this.totalRequired) * 100 : 0;
            this.progressBar.style.width = `${pct}%`;
        }
    }

    provideHint() {
        if (this.isCompleted) return;

        const res = PuzzleSolver.getHint(this.level, this.path);
        if (res.deadEnd) {
            // Player reached a dead end branch!
            this.showHintNotice("Path blocked! Undo steps to branch out.");
            window.soundEngine.playUndoSound();
            return;
        }

        if (res.valid && res.nextStep) {
            this.hintStep = res.nextStep;
            this.hintUsed = true;
            this.renderer.renderPath(this.path, this.level, this.hintStep);

            // Highlight target cell with pulsing class
            const [hr, hc] = this.hintStep;
            const hintCell = this.boardElement.querySelector(`.cell[data-row="${hr}"][data-col="${hc}"]`);
            if (hintCell) {
                hintCell.classList.add('cell-hint');
                setTimeout(() => hintCell.classList.remove('cell-hint'), 2500);
            }
            this.showHintNotice("Follow the sparkling path!");
        }
    }

    showHintNotice(msg) {
        let notice = document.getElementById('gameNotice');
        if (!notice) {
            notice = document.createElement('div');
            notice.id = 'gameNotice';
            notice.className = 'game-notice';
            this.boardContainer.appendChild(notice);
        }
        notice.textContent = msg;
        notice.classList.add('active');
        setTimeout(() => notice.classList.remove('active'), 2000);
    }

    handleVictory() {
        this.isCompleted = true;
        this.isDragging = false;

        // Calculate stars: 3 stars for no hint, 2 stars if hint used
        const earnedStars = this.hintUsed ? 2 : 3;
        const currentStars = this.stars[this.level.id] || 0;
        if (earnedStars > currentStars) {
            this.stars[this.level.id] = earnedStars;
        }

        // Score update
        const levelPoints = 100 + (this.totalRequired * 10);
        this.score += levelPoints;
        if (!this.isInfiniteMode && this.level.id >= this.bestLevel) {
            this.bestLevel = this.level.id + 1;
        }
        this.saveData();
        this.updateStatsUI();

        // Audio & Visual celebratory fanfare
        window.soundEngine.playFairyArpeggio();
        this.renderer.triggerVictoryCelebration();

        // Show Modal after brief satisfaction delay
        setTimeout(() => {
            this.showWinModal(earnedStars, levelPoints);
        }, 500);
    }

    showWinModal(stars, points) {
        if (!this.winModal) return;
        const winTitle = document.getElementById('winTitle');
        const winScore = document.getElementById('winScoreText');
        const winStars = document.getElementById('winStarsContainer');

        if (winTitle) winTitle.textContent = `LEVEL ${this.level.id} CLEAR!`;
        if (winScore) winScore.textContent = `+${points} PTS • ${this.moves} MOVES`;

        if (winStars) {
            winStars.innerHTML = '';
            for (let i = 1; i <= 3; i++) {
                const star = document.createElement('span');
                star.className = `star-icon ${i <= stars ? 'filled' : ''}`;
                star.innerHTML = '★';
                winStars.appendChild(star);
            }
        }

        this.winModal.classList.add('active');
    }

    hideWinModal() {
        if (this.winModal) this.winModal.classList.remove('active');
    }

    nextLevel() {
        this.hideWinModal();
        if (this.isInfiniteMode) {
            this.infiniteLevelNum++;
            this.loadLevel(this.infiniteLevelNum);
        } else {
            if (this.currentLevelIndex < this.levels.length - 1) {
                this.loadLevel(this.currentLevelIndex + 1);
            } else {
                // Completed all handcrafted levels! Turn on infinite mode
                this.isInfiniteMode = true;
                this.infiniteLevelNum = 31;
                this.loadLevel(this.infiniteLevelNum);
            }
        }
    }

    openLevelSelect() {
        if (!this.levelSelectModal || !this.levelsGridEl) return;
        this.levelsGridEl.innerHTML = '';

        this.levels.forEach((lvl, idx) => {
            const card = document.createElement('button');
            const isUnlocked = lvl.id <= this.bestLevel;
            const isCurrent = !this.isInfiniteMode && idx === this.currentLevelIndex;
            const starCount = this.stars[lvl.id] || 0;

            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
            
            let starsHtml = '';
            if (starCount > 0) {
                starsHtml = `<div class="level-card-stars">${'★'.repeat(starCount)}</div>`;
            }

            card.innerHTML = `
                <span class="level-card-num">${lvl.id}</span>
                <span class="level-card-name">${lvl.name}</span>
                ${starsHtml}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    window.soundEngine.playClick();
                    this.isInfiniteMode = false;
                    this.loadLevel(idx);
                    this.closeLevelSelect();
                });
            }

            this.levelsGridEl.appendChild(card);
        });

        // Add Infinite Mode Button at bottom
        const infiniteBtn = document.createElement('button');
        infiniteBtn.className = `level-card infinite-card ${this.isInfiniteMode ? 'current' : ''}`;
        infiniteBtn.innerHTML = `
            <span class="level-card-num">∞</span>
            <span class="level-card-name">Infinite Endless</span>
        `;
        infiniteBtn.addEventListener('click', () => {
            window.soundEngine.playClick();
            this.isInfiniteMode = true;
            this.loadLevel(this.infiniteLevelNum);
            this.closeLevelSelect();
        });
        this.levelsGridEl.appendChild(infiniteBtn);

        this.levelSelectModal.classList.add('active');
    }

    closeLevelSelect() {
        if (this.levelSelectModal) this.levelSelectModal.classList.remove('active');
    }
}

// Start Game on DOM Load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new OneStrokeGame();
});

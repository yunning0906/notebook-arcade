/**
 * Garden Sweeper (花園掃雷 / 溫馨掃雷)
 * Cozy, gentle, non-frustrating Minesweeper with flower seedlings and weeds.
 */

(function () {
    'use strict';

    // Difficulty Presets
    const DIFFICULTIES = {
        easy: { id: 'easy', name: '盆栽小角', rows: 8, cols: 8, flowers: 10, label: '8 × 8' },
        medium: { id: 'medium', name: '庭院花壇', rows: 12, cols: 12, flowers: 20, label: '12 × 12' },
        hard: { id: 'hard', name: '秘密花園', rows: 16, cols: 16, flowers: 40, label: '16 × 16' }
    };

    // Clean SVGs for flowers, weeds, and seedlings (zero emojis)
    const SEEDLING_SVG = '<svg class="seedling-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#43A047" stroke-width="2"><path d="M12 22V12"></path><path d="M12 12C9 7 4 8 4 8s0 5 8 4z" fill="#A5D6A7"></path><path d="M12 14c3-4 8-3 8-3s0 5-8 3z" fill="#A5D6A7"></path></svg>';
    
    const BLOOM_FLOWERS = [
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#E57373" stroke-width="2"><circle cx="12" cy="12" r="3" fill="#FFE082"></circle><path d="M12 4a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill="#FFCDD2"></path><path d="M12 14a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z" fill="#FFCDD2"></path><path d="M4 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill="#FFCDD2"></path><path d="M14 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill="#FFCDD2"></path></svg>',
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#BA68C8" stroke-width="2"><circle cx="12" cy="12" r="4" fill="#E1BEE7"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path></svg>',
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#F06292" stroke-width="2"><path d="M12 7c-2-3-6-2-6 2 0 4 6 7 6 7s6-3 6-7c0-4-4-5-6-2z" fill="#F8BBD0"></path><path d="M12 16v6" stroke="#81C784"></path></svg>',
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#FFB74D" stroke-width="2"><circle cx="12" cy="12" r="4" fill="#FFE082"></circle><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"></path></svg>'
    ];

    const WEED_ICONS = [
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#689F38" stroke-width="2"><path d="M12 22V10"></path><path d="M12 14c-4-1-6-4-6-6 4 0 6 3 6 6z" fill="#DCEDC8"></path><path d="M12 12c4-1 6-4 6-6-4 0-6 3-6 6z" fill="#DCEDC8"></path></svg>',
        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#558B2F" stroke-width="2"><path d="M12 22V6"></path><path d="M12 10C8 8 7 4 7 4s4 1 5 6z" fill="#C5E1A5"></path><path d="M12 14c4-2 5-6 5-6s-4 1-5 6z" fill="#C5E1A5"></path></svg>'
    ];

    class GardenGame {
        constructor() {
            this.currentDifficulty = 'easy';
            this.rows = 8;
            this.cols = 8;
            this.totalFlowers = 10;

            this.grid = [];
            this.isFirstClick = true;
            this.isGameOver = false;
            this.isWon = false;

            // Stats
            this.timer = 0;
            this.timerInterval = null;
            this.flaggedCount = 0;
            this.revealedCount = 0;

            // Tool mode: 'dig' or 'flag'
            this.activeTool = 'dig';

            // Last hit weed cell for gentle revive
            this.lastWeedCell = null;

            // DOM Elements
            this.gridElement = document.getElementById('gardenGrid');
            this.flowerCountElement = document.getElementById('flowerCount');
            this.timerElement = document.getElementById('timerValue');
            this.gardenTitleBadge = document.getElementById('gardenTitleBadge');
            this.gardenMoodText = document.getElementById('gardenMoodText');

            // Modals
            this.weedModal = document.getElementById('weedModal');
            this.victoryModal = document.getElementById('victoryModal');
            this.winTimeElement = document.getElementById('winTime');
            this.winFlowersElement = document.getElementById('winFlowers');

            // Buttons
            this.soundToggleBtn = document.getElementById('soundToggle');
            this.toolDigBtn = document.getElementById('toolDig');
            this.toolFlagBtn = document.getElementById('toolFlag');
            this.resetBtn = document.getElementById('resetBtn');
            this.hintBtn = document.getElementById('hintBtn');

            // Modal Buttons
            this.weedReviveBtn = document.getElementById('weedReviveBtn');
            this.weedRestartBtn = document.getElementById('weedRestartBtn');
            this.nextGardenBtn = document.getElementById('nextGardenBtn');

            this.init();
        }

        init() {
            this.bindEvents();
            this.updateSoundIcon();
            this.setDifficulty('easy');
        }

        bindEvents() {
            // Audio toggle
            if (this.soundToggleBtn) {
                this.soundToggleBtn.addEventListener('click', () => {
                    const isMuted = window.gardenAudio.toggleMute();
                    this.updateSoundIcon();
                    if (!isMuted) window.gardenAudio.playTap();
                });
            }

            // Difficulty buttons
            document.querySelectorAll('.diff-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const diffKey = e.currentTarget.getAttribute('data-diff');
                    if (diffKey && DIFFICULTIES[diffKey]) {
                        window.gardenAudio.playTap();
                        this.setDifficulty(diffKey);
                    }
                });
            });

            // Mobile / Tool Switcher
            if (this.toolDigBtn) {
                this.toolDigBtn.addEventListener('click', () => {
                    this.setTool('dig');
                    window.gardenAudio.playTap();
                });
            }
            if (this.toolFlagBtn) {
                this.toolFlagBtn.addEventListener('click', () => {
                    this.setTool('flag');
                    window.gardenAudio.playTap();
                });
            }

            // Reset
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', () => {
                    window.gardenAudio.playTap();
                    this.startNewGame();
                });
            }

            // Hint
            if (this.hintBtn) {
                this.hintBtn.addEventListener('click', () => {
                    this.provideHint();
                });
            }

            // Modal Actions
            if (this.weedReviveBtn) {
                this.weedReviveBtn.addEventListener('click', () => {
                    this.reviveFromWeed();
                });
            }
            if (this.weedRestartBtn) {
                this.weedRestartBtn.addEventListener('click', () => {
                    this.closeWeedModal();
                    this.startNewGame();
                });
            }
            if (this.nextGardenBtn) {
                this.nextGardenBtn.addEventListener('click', () => {
                    this.closeVictoryModal();
                    // Advance to next difficulty or restart
                    const diffs = ['easy', 'medium', 'hard'];
                    const nextIdx = (diffs.indexOf(this.currentDifficulty) + 1) % diffs.length;
                    this.setDifficulty(diffs[nextIdx]);
                });
            }

            // Keyboard shortcuts (Space/F to toggle tool, R to restart)
            window.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
                    this.setTool(this.activeTool === 'dig' ? 'flag' : 'dig');
                } else if (e.key === 'r' || e.key === 'R') {
                    this.startNewGame();
                }
            });
        }

        updateSoundIcon() {
            const isMuted = window.gardenAudio.isMuted;
            const iconOn = document.querySelector('.icon-sound-on');
            const iconOff = document.querySelector('.icon-sound-off');
            if (iconOn && iconOff) {
                if (isMuted) {
                    iconOn.classList.add('hidden');
                    iconOff.classList.remove('hidden');
                } else {
                    iconOn.classList.remove('hidden');
                    iconOff.classList.add('hidden');
                }
            }
        }

        setTool(tool) {
            this.activeTool = tool;
            if (this.toolDigBtn && this.toolFlagBtn) {
                this.toolDigBtn.classList.toggle('active', tool === 'dig');
                this.toolFlagBtn.classList.toggle('active', tool === 'flag');
            }
        }

        setDifficulty(diffKey) {
            this.currentDifficulty = diffKey;
            const diff = DIFFICULTIES[diffKey];
            this.rows = diff.rows;
            this.cols = diff.cols;
            this.totalFlowers = diff.flowers;

            // Update UI buttons
            document.querySelectorAll('.diff-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-diff') === diffKey);
            });

            if (this.gardenTitleBadge) {
                this.gardenTitleBadge.textContent = `${diff.name} (${diff.label})`;
            }

            this.startNewGame();
        }

        startNewGame() {
            this.stopTimer();
            this.timer = 0;
            this.updateTimerDisplay();

            this.isFirstClick = true;
            this.isGameOver = false;
            this.isWon = false;
            this.flaggedCount = 0;
            this.revealedCount = 0;
            this.lastWeedCell = null;

            this.updateFlowerCounter();
            this.setGardenMood('泥土已翻鬆，正在等待播種...');

            this.closeWeedModal();
            this.closeVictoryModal();
            this.clearPetals();

            this.buildBoard();

            if (new URLSearchParams(window.location.search).get('demo') === '1') {
                this.setupDemoState();
            }
        }

        buildBoard() {
            this.grid = [];
            this.gridElement.innerHTML = '';
            this.gridElement.style.gridTemplateColumns = `repeat(${this.cols}, auto)`;

            for (let r = 0; r < this.rows; r++) {
                this.grid[r] = [];
                for (let c = 0; c < this.cols; c++) {
                    const cell = {
                        row: r,
                        col: c,
                        isMine: false,
                        neighborCount: 0,
                        isRevealed: false,
                        isFlagged: false,
                        isWeed: false,
                        element: null
                    };

                    const cellEl = document.createElement('div');
                    cellEl.className = 'cell';
                    cellEl.setAttribute('role', 'button');
                    cellEl.setAttribute('aria-label', `花圃座標 ${r + 1}, ${c + 1}`);

                    // Mouse Events
                    cellEl.addEventListener('click', (e) => this.handleCellClick(r, c, e));
                    cellEl.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this.handleRightClick(r, c);
                    });

                    // Mobile Long Press for Flagging
                    let pressTimer = null;
                    cellEl.addEventListener('touchstart', (e) => {
                        pressTimer = setTimeout(() => {
                            this.handleRightClick(r, c);
                            pressTimer = null;
                        }, 400);
                    }, { passive: true });

                    cellEl.addEventListener('touchend', () => {
                        if (pressTimer) {
                            clearTimeout(pressTimer);
                            pressTimer = null;
                        }
                    });

                    cell.element = cellEl;
                    this.grid[r][c] = cell;
                    this.gridElement.appendChild(cellEl);
                }
            }
        }

        generateMines(firstRow, firstCol) {
            // Guarantee that first clicked cell AND all its adjacent cells are NOT mines
            const forbidden = new Set();
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = firstRow + dr;
                    const nc = firstCol + dc;
                    if (this.isValid(nr, nc)) {
                        forbidden.add(`${nr},${nc}`);
                    }
                }
            }

            let planted = 0;
            while (planted < this.totalFlowers) {
                const r = Math.floor(Math.random() * this.rows);
                const c = Math.floor(Math.random() * this.cols);
                const key = `${r},${c}`;

                if (!this.grid[r][c].isMine && !forbidden.has(key)) {
                    this.grid[r][c].isMine = true;
                    planted++;
                }
            }

            // Calculate neighbor flower counts
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c].isMine) continue;
                    let count = 0;
                    this.forEachNeighbor(r, c, (nr, nc) => {
                        if (this.grid[nr][nc].isMine) count++;
                    });
                    this.grid[r][c].neighborCount = count;
                }
            }
        }

        handleCellClick(r, c, event) {
            if (this.isGameOver || this.isWon) return;
            const cell = this.grid[r][c];

            // If player clicked with flag tool active, handle as flag toggle
            if (this.activeTool === 'flag' && !cell.isRevealed) {
                this.toggleFlag(r, c);
                return;
            }

            // If already revealed: attempt Chord Reveal
            if (cell.isRevealed) {
                this.handleChordReveal(r, c);
                return;
            }

            // If flagged: ignore dig
            if (cell.isFlagged) return;

            // First click safety
            if (this.isFirstClick) {
                this.isFirstClick = false;
                this.startTimer();
                this.generateMines(r, c);
                this.setGardenMood('陽光正好，花苗正在悄悄生長...');
            }

            this.revealCell(r, c);
        }

        handleRightClick(r, c) {
            if (this.isGameOver || this.isWon) return;
            const cell = this.grid[r][c];
            if (cell.isRevealed) return;
            this.toggleFlag(r, c);
        }

        toggleFlag(r, c) {
            const cell = this.grid[r][c];
            if (cell.isRevealed) return;

            cell.isFlagged = !cell.isFlagged;

            if (cell.isFlagged) {
                this.flaggedCount++;
                cell.element.classList.add('flagged');
                cell.element.innerHTML = `<span class="seedling-icon">${SEEDLING_SVG}</span>`;
                window.gardenAudio.playFlag();
            } else {
                this.flaggedCount--;
                cell.element.classList.remove('flagged');
                cell.element.innerHTML = '';
                window.gardenAudio.playUnflag();
            }

            this.updateFlowerCounter();
        }

        revealCell(r, c) {
            const cell = this.grid[r][c];
            if (cell.isRevealed || cell.isFlagged) return;

            // Hit a mine -> Cute little weed encounter!
            if (cell.isMine) {
                this.encounterWeed(cell);
                return;
            }

            // Safe reveal
            cell.isRevealed = true;
            this.revealedCount++;
            cell.element.classList.add('revealed');

            if (cell.neighborCount > 0) {
                cell.element.textContent = cell.neighborCount;
                cell.element.classList.add(`num-${cell.neighborCount}`);
                window.gardenAudio.playNumber(cell.neighborCount);
            } else {
                // Empty clearing
                cell.element.classList.add('empty');
                window.gardenAudio.playDig();
                this.floodFill(r, c);
            }

            this.checkWinCondition();
        }

        floodFill(startR, startC) {
            const queue = [[startR, startC]];
            let step = 0;

            while (queue.length > 0) {
                const [curR, curC] = queue.shift();
                step++;

                this.forEachNeighbor(curR, curC, (nr, nc) => {
                    const neighbor = this.grid[nr][nc];
                    if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                        neighbor.isRevealed = true;
                        this.revealedCount++;
                        neighbor.element.classList.add('revealed');

                        if (neighbor.neighborCount > 0) {
                            neighbor.element.textContent = neighbor.neighborCount;
                            neighbor.element.classList.add(`num-${neighbor.neighborCount}`);
                        } else {
                            neighbor.element.classList.add('empty');
                            queue.push([nr, nc]);
                        }
                    }
                });
            }

            if (step > 1) {
                window.gardenAudio.playCascade(step);
            }
        }

        handleChordReveal(r, c) {
            const cell = this.grid[r][c];
            if (cell.neighborCount === 0) return;

            let flagCount = 0;
            this.forEachNeighbor(r, c, (nr, nc) => {
                if (this.grid[nr][nc].isFlagged) flagCount++;
            });

            if (flagCount === cell.neighborCount) {
                // Safe to open all unflagged neighbors
                this.forEachNeighbor(r, c, (nr, nc) => {
                    const neighbor = this.grid[nr][nc];
                    if (!neighbor.isRevealed && !neighbor.isFlagged) {
                        this.revealCell(nr, nc);
                    }
                });
            } else {
                // Gentle visual bounce hint
                this.forEachNeighbor(r, c, (nr, nc) => {
                    const neighbor = this.grid[nr][nc];
                    if (!neighbor.isRevealed && !neighbor.isFlagged) {
                        neighbor.element.classList.add('chord-highlight');
                        setTimeout(() => neighbor.element.classList.remove('chord-highlight'), 220);
                    }
                });
            }
        }

        encounterWeed(cell) {
            this.isGameOver = true;
            this.stopTimer();
            this.lastWeedCell = cell;

            const randomWeed = WEED_ICONS[Math.floor(Math.random() * WEED_ICONS.length)];
            cell.element.classList.add('revealed', 'weed');
            cell.element.innerHTML = `<span class="weed-icon">${randomWeed}</span>`;

            window.gardenAudio.playWeed();
            this.setGardenMood('發現了一株充滿生命力的小雜草～');

            setTimeout(() => {
                this.openWeedModal();
            }, 350);
        }

        openWeedModal() {
            if (this.weedModal) {
                this.weedModal.classList.add('show');
            }
        }

        closeWeedModal() {
            if (this.weedModal) {
                this.weedModal.classList.remove('show');
            }
        }

        reviveFromWeed() {
            // Gentle revive: undo the weed step!
            if (this.lastWeedCell) {
                const cell = this.lastWeedCell;
                cell.element.classList.remove('revealed', 'weed');
                cell.element.innerHTML = '';
                // Automatically plant a seedling flag on it so the player knows!
                cell.isFlagged = true;
                this.flaggedCount++;
                cell.element.classList.add('flagged');
                cell.element.innerHTML = `<span class="seedling-icon">${SEEDLING_SVG}</span>`;
                this.updateFlowerCounter();

                window.gardenAudio.playFlag();
                this.lastWeedCell = null;
            }

            this.isGameOver = false;
            this.startTimer();
            this.closeWeedModal();
            this.setGardenMood('輕輕拔除雜草，換上小花苗籤繼續培育囉！');
        }

        checkWinCondition() {
            const totalCells = this.rows * this.cols;
            const nonMineCells = totalCells - this.totalFlowers;

            if (this.revealedCount >= nonMineCells) {
                this.triggerVictory();
            }
        }

        triggerVictory() {
            this.isWon = true;
            this.stopTimer();
            window.gardenAudio.playBloom();

            this.setGardenMood('整座花園綻放啦！萬紫千紅～');

            // Bloom all flowers on the board!
            let flowerIdx = 0;
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    if (cell.isMine) {
                        cell.element.classList.remove('flagged');
                        cell.element.classList.add('revealed', 'bloomed');
                        const blossom = BLOOM_FLOWERS[flowerIdx % BLOOM_FLOWERS.length];
                        flowerIdx++;
                        setTimeout(() => {
                            cell.element.innerHTML = `<span class="bloom-flower">${blossom}</span>`;
                        }, (r * this.cols + c) * 15);
                    }
                }
            }

            this.flaggedCount = this.totalFlowers;
            this.updateFlowerCounter();

            // Spawn floating falling petals
            this.spawnPetals();

            // Show Victory Modal
            setTimeout(() => {
                if (this.winTimeElement) this.winTimeElement.textContent = this.formatTime(this.timer);
                if (this.winFlowersElement) this.winFlowersElement.textContent = `${this.totalFlowers} 朵花`;
                if (this.victoryModal) this.victoryModal.classList.add('show');
            }, 1200);
        }

        spawnPetals() {
            for (let i = 0; i < 24; i++) {
                setTimeout(() => {
                    const petal = document.createElement('div');
                    petal.className = 'petal-particle';
                    petal.innerHTML = `<svg viewBox="0 0 20 20" width="16" height="16" fill="none"><path d="M10 2 C15 5 18 10 10 18 C2 10 5 5 10 2 Z" fill="#FFB7B2" opacity="0.8"></path></svg>`;
                    petal.style.left = `${Math.random() * 96}vw`;
                    petal.style.animationDuration = `${2.5 + Math.random() * 2}s`;
                    document.body.appendChild(petal);
                    setTimeout(() => petal.remove(), 4500);
                }, i * 90);
            }
        }

        setupDemoState() {
            this.timer = 45;
            this.updateTimerDisplay();
            this.isFirstClick = false;

            // Fixed mines layout for 8x8 (10 mines)
            const mines = [[0, 2], [1, 5], [2, 1], [3, 7], [4, 3], [5, 0], [6, 4], [6, 6], [7, 2], [7, 7]];
            mines.forEach(([r, c]) => {
                if (this.grid[r] && this.grid[r][c]) this.grid[r][c].isMine = true;
            });

            // Calculate neighbor counts
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (this.grid[r][c].isMine) continue;
                    let count = 0;
                    this.forEachNeighbor(r, c, (nr, nc) => {
                        if (this.grid[nr][nc].isMine) count++;
                    });
                    this.grid[r][c].neighborCount = count;
                }
            }

            // Reveal safe cells in the center & left
            const toReveal = [
                [0, 0], [0, 1], [1, 0], [1, 1], [1, 2], [2, 2], [2, 3], [3, 2], [3, 3], [3, 4],
                [4, 0], [4, 1], [4, 4], [4, 5], [5, 4], [5, 5], [5, 6]
            ];
            toReveal.forEach(([r, c]) => {
                const cell = this.grid[r][c];
                if (!cell.isMine) {
                    cell.isRevealed = true;
                    cell.element.classList.add('revealed');
                    if (cell.neighborCount > 0) {
                        cell.element.classList.add(`num-${cell.neighborCount}`);
                        cell.element.textContent = cell.neighborCount;
                    }
                }
            });

            // Flag 3 cells
            const toFlag = [[0, 2], [2, 1], [4, 3]];
            toFlag.forEach(([r, c]) => {
                const cell = this.grid[r][c];
                cell.isFlagged = true;
                cell.element.classList.add('flagged');
                cell.element.innerHTML = `<span class="seedling-icon">${SEEDLING_SVG}</span>`;
            });
            this.flaggedCount = 3;
            this.updateFlowerCounter();
            this.setGardenMood('陽光正好，花苗正在悄悄生長...');
        }

        clearPetals() {
            document.querySelectorAll('.petal-particle').forEach(p => p.remove());
        }

        closeVictoryModal() {
            if (this.victoryModal) {
                this.victoryModal.classList.remove('show');
            }
        }

        provideHint() {
            if (this.isGameOver || this.isWon) return;
            if (this.isFirstClick) {
                // If haven't clicked yet, highlight the center
                const midR = Math.floor(this.rows / 2);
                const midC = Math.floor(this.cols / 2);
                this.highlightCellHint(midR, midC);
                return;
            }

            // Find an obvious 100% safe unrevealed cell or obvious mine
            // 1. Look for revealed cell where unrevealed neighbors == neighborCount - flags (guaranteed flowers)
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    if (!cell.isRevealed || cell.neighborCount === 0) continue;

                    let flags = 0;
                    const unrevealed = [];
                    this.forEachNeighbor(r, c, (nr, nc) => {
                        const n = this.grid[nr][nc];
                        if (n.isFlagged) flags++;
                        else if (!n.isRevealed) unrevealed.push(n);
                    });

                    // If flags match neighborCount, all unrevealed are 100% SAFE
                    if (flags === cell.neighborCount && unrevealed.length > 0) {
                        const target = unrevealed[0];
                        this.highlightCellHint(target.row, target.col);
                        this.setGardenMood('園藝小精靈：這塊土底下很安全，翻開看看吧！✨');
                        window.gardenAudio.playTap();
                        return;
                    }

                    // If unrevealed + flags == neighborCount, all unrevealed are FLOWERS
                    if (unrevealed.length > 0 && unrevealed.length + flags === cell.neighborCount) {
                        const target = unrevealed[0];
                        this.highlightCellHint(target.row, target.col);
                        this.setGardenMood('園藝小精靈：這裡埋著一株小花苗喔，標記它吧！');
                        window.gardenAudio.playTap();
                        return;
                    }
                }
            }

            // Fallback: highlight any safe non-mine unrevealed cell
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const cell = this.grid[r][c];
                    if (!cell.isRevealed && !cell.isFlagged && !cell.isMine) {
                        this.highlightCellHint(r, c);
                        this.setGardenMood('園藝小精靈：這塊土底下很安全喔！');
                        window.gardenAudio.playTap();
                        return;
                    }
                }
            }
        }

        highlightCellHint(r, c) {
            const cell = this.grid[r][c];
            cell.element.classList.add('chord-highlight');
            setTimeout(() => {
                cell.element.classList.remove('chord-highlight');
            }, 800);
        }

        setGardenMood(text) {
            if (this.gardenMoodText) {
                this.gardenMoodText.textContent = text;
            }
        }

        updateFlowerCounter() {
            const remaining = Math.max(0, this.totalFlowers - this.flaggedCount);
            if (this.flowerCountElement) {
                this.flowerCountElement.textContent = remaining;
            }
        }

        startTimer() {
            this.stopTimer();
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateTimerDisplay();
            }, 1000);
        }

        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }

        updateTimerDisplay() {
            if (this.timerElement) {
                this.timerElement.textContent = this.formatTime(this.timer);
            }
        }

        formatTime(sec) {
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        forEachNeighbor(r, c, cb) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr;
                    const nc = c + dc;
                    if (this.isValid(nr, nc)) {
                        cb(nr, nc);
                    }
                }
            }
        }

        isValid(r, c) {
            return r >= 0 && r < this.rows && c >= 0 && c < this.cols;
        }
    }

    // Launch game when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        window.gardenGame = new GardenGame();
    });
})();

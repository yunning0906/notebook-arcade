/**
 * Nonogram Game Controller
 * Manages grid rendering, mouse/touch drag strokes, undo stack,
 * clue verification, sound triggers, and pastel blossom celebration.
 */

class NonogramGame {
    constructor() {
        this.currentPuzzleIndex = 0;
        this.currentPuzzle = null;
        this.playerBoard = []; // 0 = empty, 1 = filled (pencil), 2 = crossed (X)
        this.clues = { rowClues: [], colClues: [] };

        this.currentTool = 'pencil'; // 'pencil' or 'cross'
        this.isDragging = false;
        this.dragMode = null; // { tool: 'pencil'|'cross', targetState: 0|1|2 }
        this.currentStrokeChanges = []; // For 1-step undo of an entire drag
        this.undoStack = [];

        this.isSolved = false;
        this.timer = null;
        this.secondsElapsed = 0;

        // DOM elements
        this.boardContainer = document.getElementById('nonogramBoard');
        this.rowCluesContainer = document.getElementById('rowClues');
        this.colCluesContainer = document.getElementById('colClues');
        this.gridContainer = document.getElementById('gridCells');

        this.toolPencilBtn = document.getElementById('toolPencil');
        this.toolCrossBtn = document.getElementById('toolCross');
        this.undoBtn = document.getElementById('undoBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.hintBtn = document.getElementById('hintBtn');
        this.timerDisplay = document.getElementById('timerValue');
        this.levelTitleDisplay = document.getElementById('levelTitle');
        this.levelSizeDisplay = document.getElementById('levelSize');

        // Modals
        this.victoryModal = document.getElementById('victoryModal');
        this.galleryModal = document.getElementById('galleryModal');
        this.galleryGrid = document.getElementById('galleryGrid');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPuzzle(0);

        if (new URLSearchParams(window.location.search).has('demo')) {
            this.setupDemoState();
        }
    }

    setupDemoState() {
        this.secondsElapsed = 28;
        if (this.timerDisplay) {
            this.timerDisplay.textContent = '0:28';
        }

        // Partially shade cells and place crosses to show game in action
        const shade = [[0, 1], [0, 3], [1, 0], [1, 1], [1, 3], [1, 4], [2, 0], [2, 1], [2, 3]];
        const cross = [[0, 0], [0, 2], [0, 4], [4, 0], [4, 4]];

        shade.forEach(([r, c]) => {
            this.playerBoard[r][c] = 1;
            this.updateCellVisual(r, c);
        });
        cross.forEach(([r, c]) => {
            this.playerBoard[r][c] = 2;
            this.updateCellVisual(r, c);
        });

        this.updateCluesStatus();
    }

    setupEventListeners() {
        // Tool buttons
        this.toolPencilBtn.addEventListener('click', () => this.setTool('pencil'));
        this.toolCrossBtn.addEventListener('click', () => this.setTool('cross'));

        // Control buttons
        this.undoBtn.addEventListener('click', () => this.undo());
        this.resetBtn.addEventListener('click', () => this.resetCurrentPuzzle());
        this.hintBtn.addEventListener('click', () => this.giveHint());

        // Navigation
        const prevBtn = document.getElementById('prevPuzzleBtn');
        const nextBtn = document.getElementById('nextPuzzleBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevPuzzle());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextPuzzle());

        // Sound Toggle
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isMuted = window.soundEngine.toggleMute();
                soundBtn.querySelector('.icon-sound-on').classList.toggle('hidden', isMuted);
                soundBtn.querySelector('.icon-sound-off').classList.toggle('hidden', !isMuted);
            });
        }

        // Gallery Modal
        const galleryOpenBtn = document.getElementById('openGalleryBtn');
        const galleryCloseBtn = document.getElementById('closeGalleryBtn');
        if (galleryOpenBtn) {
            galleryOpenBtn.addEventListener('click', () => this.openGallery());
        }
        if (galleryCloseBtn) {
            galleryCloseBtn.addEventListener('click', () => this.closeGallery());
        }

        // Victory Modal Buttons
        const nextFromVictory = document.getElementById('victoryNextBtn');
        const galleryFromVictory = document.getElementById('victoryGalleryBtn');
        if (nextFromVictory) {
            nextFromVictory.addEventListener('click', () => {
                this.closeVictory();
                this.nextPuzzle();
            });
        }
        if (galleryFromVictory) {
            galleryFromVictory.addEventListener('click', () => {
                this.closeVictory();
                this.openGallery();
            });
        }

        // Global Mouseup / Touchend
        window.addEventListener('mouseup', () => this.endDrag());
        window.addEventListener('touchend', () => this.endDrag());
        window.addEventListener('touchcancel', () => this.endDrag());

        // Prevent context menu on grid
        if (this.gridContainer) {
            this.gridContainer.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === '1' || e.key === 'p' || e.key === 'P') this.setTool('pencil');
            if (e.key === '2' || e.key === 'x' || e.key === 'X') this.setTool('cross');
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
        });

        // Start BGM on first user interaction
        const startAudioOnce = () => {
            window.soundEngine.init();
            window.soundEngine.startBGM();
            window.removeEventListener('pointerdown', startAudioOnce);
            window.removeEventListener('keydown', startAudioOnce);
        };
        window.addEventListener('pointerdown', startAudioOnce);
        window.addEventListener('keydown', startAudioOnce);
    }

    setTool(tool) {
        this.currentTool = tool;
        if (tool === 'pencil') {
            this.toolPencilBtn.classList.add('active');
            this.toolCrossBtn.classList.remove('active');
        } else {
            this.toolCrossBtn.classList.add('active');
            this.toolPencilBtn.classList.remove('active');
        }
    }

    loadPuzzle(index) {
        if (index < 0) index = window.PUZZLES.length - 1;
        if (index >= window.PUZZLES.length) index = 0;
        this.currentPuzzleIndex = index;
        this.currentPuzzle = window.PUZZLES[index];
        this.isSolved = false;
        this.undoStack = [];
        this.currentStrokeChanges = [];

        // Initialize blank player board
        const size = this.currentPuzzle.size;
        this.playerBoard = Array.from({ length: size }, () => Array(size).fill(0));

        // Compute Clues
        this.clues = window.NonogramLogic.computeClues(this.currentPuzzle.grid);

        // Update Headers
        const isSolved = window.galleryManager.isCompleted(this.currentPuzzle.id);
        this.levelTitleDisplay.textContent = isSolved
            ? this.currentPuzzle.nameZh
            : `${this.currentPuzzle.size}×${this.currentPuzzle.size} 謎題 #${index + 1}`;
        this.levelSizeDisplay.textContent = `${this.currentPuzzle.size} × ${this.currentPuzzle.size}`;

        // Reset and start timer
        this.resetTimer();
        this.startTimer();

        // Render Board Grid and Clues
        this.renderBoard();
        this.updateCluesStatus();
    }

    renderBoard() {
        const size = this.currentPuzzle.size;

        // Configure CSS grid columns & rows
        this.gridContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        this.gridContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        this.gridContainer.className = `grid-cells size-${size}`;

        // Clear existing elements
        this.rowCluesContainer.innerHTML = '';
        this.colCluesContainer.innerHTML = '';
        this.gridContainer.innerHTML = '';

        // 1. Column Clues (Top headers)
        this.colCluesContainer.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        for (let c = 0; c < size; c++) {
            const colHeader = document.createElement('div');
            colHeader.className = `col-clue-item col-${c}`;
            if ((c + 1) % 5 === 0 && c !== size - 1) {
                colHeader.classList.add('border-right-thick');
            }
            const numbers = this.clues.colClues[c];
            numbers.forEach(num => {
                const numSpan = document.createElement('span');
                numSpan.className = 'clue-num';
                numSpan.textContent = num;
                colHeader.appendChild(numSpan);
            });
            this.colCluesContainer.appendChild(colHeader);
        }

        // 2. Row Clues (Left headers)
        this.rowCluesContainer.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        for (let r = 0; r < size; r++) {
            const rowHeader = document.createElement('div');
            rowHeader.className = `row-clue-item row-${r}`;
            if ((r + 1) % 5 === 0 && r !== size - 1) {
                rowHeader.classList.add('border-bottom-thick');
            }
            const numbers = this.clues.rowClues[r];
            numbers.forEach(num => {
                const numSpan = document.createElement('span');
                numSpan.className = 'clue-num';
                numSpan.textContent = num;
                rowHeader.appendChild(numSpan);
            });
            this.rowCluesContainer.appendChild(rowHeader);
        }

        // 3. Grid Cells
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;

                // Thick 5-grid borders
                if ((c + 1) % 5 === 0 && c !== size - 1) {
                    cell.classList.add('border-right-thick');
                }
                if ((r + 1) % 5 === 0 && r !== size - 1) {
                    cell.classList.add('border-bottom-thick');
                }

                // Mouse Events
                cell.addEventListener('mousedown', (e) => this.handlePointerDown(r, c, e));
                cell.addEventListener('mouseenter', (e) => this.handlePointerEnter(r, c, e));

                // Touch Events (using elementFromPoint for smooth drag)
                cell.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handlePointerDown(r, c, { button: 0 });
                }, { passive: false });

                this.gridContainer.appendChild(cell);
            }
        }

        // Global touchmove on grid container
        this.gridContainer.addEventListener('touchmove', (e) => {
            if (!this.isDragging || this.isSolved) return;
            const touch = e.touches[0];
            const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
            if (targetEl && targetEl.classList.contains('grid-cell')) {
                const r = parseInt(targetEl.dataset.r, 10);
                const c = parseInt(targetEl.dataset.c, 10);
                this.applyCellAction(r, c);
            }
        }, { passive: true });
    }

    handlePointerDown(r, c, e) {
        if (this.isSolved) return;

        // Right-click always acts as Cross
        let activeTool = this.currentTool;
        if (e.button === 2) {
            activeTool = 'cross';
        }

        this.isDragging = true;
        this.currentStrokeChanges = [];

        const currentVal = this.playerBoard[r][c];
        let targetState;

        if (activeTool === 'pencil') {
            // If empty (0) or cross (2), fill it (1). If already filled (1), clear it (0).
            targetState = currentVal === 1 ? 0 : 1;
        } else {
            // Cross tool: if empty (0) or filled (1), cross it (2). If already crossed (2), clear it (0).
            targetState = currentVal === 2 ? 0 : 2;
        }

        this.dragMode = {
            tool: activeTool,
            targetState: targetState
        };

        this.applyCellAction(r, c);
    }

    handlePointerEnter(r, c, e) {
        if (!this.isDragging || this.isSolved) return;
        this.applyCellAction(r, c);
    }

    applyCellAction(r, c) {
        if (!this.dragMode) return;
        const currentVal = this.playerBoard[r][c];
        const nextVal = this.dragMode.targetState;

        // If cell is already at target state, do nothing
        if (currentVal === nextVal) return;

        // Record for undo
        this.currentStrokeChanges.push({ r, c, prevVal: currentVal, nextVal });
        this.playerBoard[r][c] = nextVal;

        // Update UI
        this.updateCellVisual(r, c);

        // Sound trigger
        if (nextVal === 1) {
            window.soundEngine.playPencilScratch();
        } else if (nextVal === 2) {
            window.soundEngine.playCrossTick();
        } else {
            window.soundEngine.playEraser();
        }

        // Check Row & Col satisfaction for clue indicators
        this.updateCluesStatus();

        // Check Victory
        if (window.NonogramLogic.checkVictory(this.playerBoard, this.currentPuzzle.grid)) {
            this.handleVictory();
        }
    }

    endDrag() {
        if (this.isDragging && this.currentStrokeChanges.length > 0) {
            this.undoStack.push(this.currentStrokeChanges);
        }
        this.isDragging = false;
        this.dragMode = null;
        this.currentStrokeChanges = [];
    }

    updateCellVisual(r, c) {
        const cell = this.getCellElement(r, c);
        if (!cell) return;

        const val = this.playerBoard[r][c];
        cell.classList.remove('filled', 'crossed', 'hint-highlight');
        cell.innerHTML = '';

        if (val === 1) {
            cell.classList.add('filled');
        } else if (val === 2) {
            cell.classList.add('crossed');
            cell.innerHTML = '<span class="pencil-x">✕</span>';
        }
    }

    getCellElement(r, c) {
        return this.gridContainer.querySelector(`.grid-cell[data-r="${r}"][data-c="${c}"]`);
    }

    updateCluesStatus() {
        const size = this.currentPuzzle.size;

        // Check Rows
        for (let r = 0; r < size; r++) {
            const isRowDone = window.NonogramLogic.isRowSatisfied(this.playerBoard[r], this.clues.rowClues[r]);
            const rowHeader = this.rowCluesContainer.querySelector(`.row-clue-item.row-${r}`);
            if (rowHeader) {
                rowHeader.classList.toggle('completed', isRowDone);
            }
        }

        // Check Cols
        for (let c = 0; c < size; c++) {
            const isColDone = window.NonogramLogic.isColSatisfied(this.playerBoard, c, this.clues.colClues[c]);
            const colHeader = this.colCluesContainer.querySelector(`.col-clue-item.col-${c}`);
            if (colHeader) {
                colHeader.classList.toggle('completed', isColDone);
            }
        }
    }

    undo() {
        if (this.undoStack.length === 0 || this.isSolved) return;
        const lastStroke = this.undoStack.pop();

        lastStroke.forEach(change => {
            this.playerBoard[change.r][change.c] = change.prevVal;
            this.updateCellVisual(change.r, change.c);
        });

        window.soundEngine.playEraser();
        this.updateCluesStatus();
    }

    resetCurrentPuzzle() {
        if (this.isSolved) return;
        const size = this.currentPuzzle.size;
        this.playerBoard = Array.from({ length: size }, () => Array(size).fill(0));
        this.undoStack = [];

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                this.updateCellVisual(r, c);
            }
        }

        window.soundEngine.playEraser();
        this.updateCluesStatus();
    }

    giveHint() {
        if (this.isSolved) return;

        const hint = window.NonogramLogic.getSmartHint(this.playerBoard, this.currentPuzzle.grid);
        if (!hint) return;

        const { r, c, type } = hint;
        const cell = this.getCellElement(r, c);

        // Pencil wiggle hint animation
        if (cell) {
            cell.classList.add('hint-highlight');
            setTimeout(() => cell.classList.remove('hint-highlight'), 1200);
        }

        // Apply correct action
        const prevVal = this.playerBoard[r][c];
        this.playerBoard[r][c] = type;
        this.undoStack.push([{ r, c, prevVal, nextVal: type }]);
        this.updateCellVisual(r, c);

        if (type === 1) {
            window.soundEngine.playPencilScratch(1.2);
        } else {
            window.soundEngine.playCrossTick();
        }

        this.updateCluesStatus();

        if (window.NonogramLogic.checkVictory(this.playerBoard, this.currentPuzzle.grid)) {
            this.handleVictory();
        }
    }

    handleVictory() {
        this.isSolved = true;
        this.stopTimer();

        // Save progress to gallery
        window.galleryManager.saveProgress(this.currentPuzzle.id, this.secondsElapsed);

        // Update Title to reveal authentic illustration name
        this.levelTitleDisplay.textContent = this.currentPuzzle.nameZh;

        // Play victory arpeggio & chime
        window.soundEngine.playVictoryArpeggio();

        // Trigger Pastel Blossom Ripple
        this.triggerPastelBlossom();

        // Open Victory Modal after animation completes
        setTimeout(() => {
            this.showVictoryModal();
        }, 1500);
    }

    triggerPastelBlossom() {
        const size = this.currentPuzzle.size;
        this.gridContainer.classList.add('blossom-active');

        // Hide all crosses
        this.gridContainer.querySelectorAll('.pencil-x').forEach(el => el.remove());

        // Blossom ripple from center outward
        const center = (size - 1) / 2;

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = this.getCellElement(r, c);
                const colorId = this.currentPuzzle.grid[r][c];

                if (colorId > 0 && cell) {
                    const pastelColor = this.currentPuzzle.palette[colorId] || '#FF8A80';
                    const dist = Math.hypot(r - center, c - center);
                    const delay = dist * 80;

                    setTimeout(() => {
                        cell.style.backgroundColor = pastelColor;
                        cell.style.borderColor = 'rgba(82, 67, 56, 0.4)';
                        cell.classList.add('blossomed');
                    }, delay);
                } else if (cell) {
                    // Empty cells fade cleanly
                    cell.style.backgroundColor = 'transparent';
                    cell.style.borderColor = 'rgba(185, 168, 145, 0.15)';
                }
            }
        }
    }

    showVictoryModal() {
        const nameEl = document.getElementById('victoryArtName');
        const timeEl = document.getElementById('victoryTime');
        const artPreviewCanvas = document.getElementById('victoryCanvas');

        if (nameEl) nameEl.textContent = this.currentPuzzle.nameZh;
        if (timeEl) {
            const min = Math.floor(this.secondsElapsed / 60);
            const sec = this.secondsElapsed % 60;
            timeEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        }

        // Draw lovely preview on modal canvas
        if (artPreviewCanvas) {
            const size = this.currentPuzzle.size;
            const cellSize = Math.floor(180 / size);
            artPreviewCanvas.width = size * cellSize;
            artPreviewCanvas.height = size * cellSize;
            const ctx = artPreviewCanvas.getContext('2d');

            ctx.fillStyle = '#FFFDF9';
            ctx.fillRect(0, 0, artPreviewCanvas.width, artPreviewCanvas.height);

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const colorId = this.currentPuzzle.grid[r][c];
                    if (colorId > 0) {
                        ctx.fillStyle = this.currentPuzzle.palette[colorId] || '#FF8A80';
                        ctx.fillRect(c * cellSize + 0.5, r * cellSize + 0.5, cellSize - 1, cellSize - 1);
                    }
                }
            }
        }

        this.victoryModal.classList.remove('hidden');
    }

    closeVictory() {
        this.victoryModal.classList.add('hidden');
    }

    openGallery() {
        this.closeVictory();
        window.galleryManager.renderGalleryGrid(this.galleryGrid, (selectedIndex) => {
            this.closeGallery();
            this.loadPuzzle(selectedIndex);
        });
        this.galleryModal.classList.remove('hidden');
    }

    closeGallery() {
        this.galleryModal.classList.add('hidden');
    }

    nextPuzzle() {
        this.loadPuzzle(this.currentPuzzleIndex + 1);
    }

    prevPuzzle() {
        this.loadPuzzle(this.currentPuzzleIndex - 1);
    }

    // Timer helpers
    startTimer() {
        this.stopTimer();
        this.timer = setInterval(() => {
            this.secondsElapsed++;
            const min = Math.floor(this.secondsElapsed / 60);
            const sec = this.secondsElapsed % 60;
            this.timerDisplay.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.secondsElapsed = 0;
        this.timerDisplay.textContent = '0:00';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new NonogramGame();
});

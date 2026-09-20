/**
 * Notebook Block Puzzle - Main Game Controller
 * Handles pointer drag-and-drop, touch vertical offset compensation,
 * ghost preview snapping, arpeggio clears, particle explosions,
 * combo streaks, and game over validation.
 */

class BlockPuzzleGame {
    constructor() {
        this.boardSize = 10; // Default 10x10, supports 8x8
        this.board = new PuzzleBoard(this.boardSize);
        this.generator = new ShapeGenerator();
        this.audio = window.puzzleAudio;

        // Game State
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('notebook_puzzle_best_' + this.boardSize) || '0', 10);
        this.combo = 0;
        this.handShapes = [null, null, null]; // 3 current shapes
        this.selectedHandIndex = null; // for tap-to-select mode

        // Drag state
        this.isDragging = false;
        this.dragIndex = null;
        this.dragShape = null;
        this.dragGhostElement = null;
        this.dragTouchOffset = 0; // vertical offset for touch
        this.activeSnap = null; // { r, c, valid }

        // DOM elements
        this.domBoard = document.getElementById('puzzleBoard');
        this.domHand = document.getElementById('handSlots');
        this.domScore = document.getElementById('currentScore');
        this.domBest = document.getElementById('bestScore');
        this.domCanvas = document.getElementById('particleCanvas');
        this.domGameOverModal = document.getElementById('gameOverModal');
        this.domFinalScore = document.getElementById('finalScore');
        this.domBestRecord = document.getElementById('bestRecord');

        // Particle System
        this.particles = new ParticleSystem(this.domCanvas);

        this.initDOM();
        this.initEvents();
        this.startNewGame();
    }

    initDOM() {
        this.updateScoreDisplay();
        this.renderBoardGrid();
    }

    renderBoardGrid() {
        this.domBoard.innerHTML = '';
        this.domBoard.style.setProperty('--grid-size', this.boardSize);

        for (let r = 0; r < this.boardSize; r++) {
            for (let c = 0; c < this.boardSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                this.domBoard.appendChild(cell);
            }
        }
        this.syncBoardView();
    }

    // Sync visual cells with board.grid state
    syncBoardView() {
        const cells = this.domBoard.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.r, 10);
            const c = parseInt(cell.dataset.c, 10);
            const val = this.board.grid[r][c];

            cell.className = 'grid-cell';
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';

            if (val) {
                cell.classList.add('occupied');
                cell.style.backgroundColor = val.color;
                cell.style.boxShadow = `inset 0 -2px 0 ${val.colorSub}, inset 0 2px 0 ${val.colorHighlight}`;
            }
        });
    }

    startNewGame() {
        this.board.reset(this.boardSize);
        this.score = 0;
        this.combo = 0;
        this.updateScoreDisplay();
        this.syncBoardView();
        this.hideGameOver();
        this.dealNewHand();
    }

    setBoardSize(size) {
        if (this.boardSize === size) return;
        this.boardSize = size;
        this.bestScore = parseInt(localStorage.getItem('notebook_puzzle_best_' + this.boardSize) || '0', 10);
        this.startNewGame();
        this.renderBoardGrid();
    }

    dealNewHand() {
        const hand = this.generator.getHandOfThree();
        this.handShapes = hand;
        this.renderHandSlots();
        this.checkHandFitStatus();
    }

    renderHandSlots() {
        this.domHand.innerHTML = '';

        this.handShapes.forEach((shape, index) => {
            const slot = document.createElement('div');
            slot.className = 'hand-slot';
            slot.dataset.slotIndex = index;

            if (shape) {
                const shapeContainer = this.createShapeElement(shape, index);
                slot.appendChild(shapeContainer);
            }

            this.domHand.appendChild(slot);
        });
    }

    createShapeElement(shape, index, isPreview = false) {
        const container = document.createElement('div');
        container.className = 'shape-container' + (isPreview ? ' is-preview' : '');
        container.dataset.shapeIndex = index;
        container.style.gridTemplateColumns = `repeat(${shape.width}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${shape.height}, 1fr)`;

        for (let r = 0; r < shape.matrix.length; r++) {
            for (let c = 0; c < shape.matrix[r].length; c++) {
                const cell = document.createElement('div');
                cell.className = 'shape-cell';
                if (shape.matrix[r][c] === 1) {
                    cell.classList.add('filled');
                    cell.style.backgroundColor = shape.color;
                    cell.style.boxShadow = `inset 0 -2px 0 ${shape.colorSub}, inset 0 2px 0 ${shape.colorHighlight}`;
                } else {
                    cell.classList.add('empty');
                }
                container.appendChild(cell);
            }
        }

        return container;
    }

    // Check which shapes in hand can currently fit, dim ones that cannot
    checkHandFitStatus() {
        let anyFit = false;
        const slots = this.domHand.querySelectorAll('.hand-slot');

        this.handShapes.forEach((shape, index) => {
            const slot = slots[index];
            if (!shape) return;

            const canFit = this.board.canShapeFitAnywhere(shape);
            if (slot) {
                if (canFit) {
                    slot.classList.remove('disabled');
                    anyFit = true;
                } else {
                    slot.classList.add('disabled');
                }
            }
        });

        // Check if hand still has pieces
        const remainingShapes = this.handShapes.filter(Boolean);
        if (remainingShapes.length > 0 && !anyFit) {
            // GAME OVER!
            setTimeout(() => this.triggerGameOver(), 350);
        }
    }

    initEvents() {
        // Drag events using Pointer Events
        this.domHand.addEventListener('pointerdown', (e) => this.handleHandPointerDown(e));
        window.addEventListener('pointermove', (e) => this.handleWindowPointerMove(e));
        window.addEventListener('pointerup', (e) => this.handleWindowPointerUp(e));
        window.addEventListener('pointercancel', (e) => this.handleWindowPointerUp(e));

        // Click on board to place selected shape (click-to-place fallback)
        this.domBoard.addEventListener('click', (e) => this.handleBoardClick(e));

        // Restart button in Game Over modal
        document.getElementById('btnRestart').addEventListener('click', () => {
            this.startNewGame();
        });

        // Restart button in top header
        document.getElementById('btnHeaderRestart').addEventListener('click', () => {
            if (confirm('確定要重新開始新的一局手帳拼圖嗎？')) {
                this.startNewGame();
            }
        });

        // Mode Switch (10x10 / 8x8)
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.currentTarget.dataset.size, 10);
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.setBoardSize(size);
            });
        });

        // Audio controls
        const btnBGM = document.getElementById('btnToggleBGM');
        const btnSFX = document.getElementById('btnToggleSFX');

        if (btnBGM) {
            btnBGM.addEventListener('click', () => {
                const active = this.audio.toggleBGM();
                btnBGM.classList.toggle('active', active);
                btnBGM.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
        }

        if (btnSFX) {
            btnSFX.addEventListener('click', () => {
                const active = this.audio.toggleSFX();
                btnSFX.classList.toggle('active', active);
                btnSFX.setAttribute('aria-pressed', active ? 'true' : 'false');
            });
        }

        // Reroll Hand Button (bonus feature: 1 free reroll per game)
        const btnReroll = document.getElementById('btnReroll');
        if (btnReroll) {
            btnReroll.addEventListener('click', () => {
                this.audio.playPickup();
                this.dealNewHand();
                this.particles.addFloatingText(
                    window.innerWidth / 2,
                    window.innerHeight / 2,
                    'REFRESHED!',
                    '#4A8B71',
                    24,
                    true
                );
            });
        }
    }

    // Drag Start
    handleHandPointerDown(e) {
        const slot = e.target.closest('.hand-slot');
        if (!slot) return;

        const slotIndex = parseInt(slot.dataset.slotIndex, 10);
        const shape = this.handShapes[slotIndex];
        if (!shape) return;

        // Initialize audio on first gesture
        this.audio.init();

        this.isDragging = true;
        this.dragIndex = slotIndex;
        this.dragShape = shape;

        // Sound
        this.audio.playPickup();

        // Check if touch device: add vertical offset so finger does not cover shape
        const isTouch = e.pointerType === 'touch';
        this.dragTouchOffset = isTouch ? 72 : 0;

        // Hide original slot piece visually
        slot.classList.add('is-dragging');

        // Create floating drag clone
        this.createFloatingDragClone(shape, e.clientX, e.clientY);

        // Capture pointer
        if (e.target.setPointerCapture) {
            try {
                e.target.setPointerCapture(e.pointerId);
            } catch (err) {
                // Ignore
            }
        }
    }

    createFloatingDragClone(shape, clientX, clientY) {
        if (this.dragGhostElement) {
            this.dragGhostElement.remove();
        }

        const clone = this.createShapeElement(shape, this.dragIndex, true);
        clone.id = 'floatingDragShape';
        clone.classList.add('floating-drag');

        // Match cell size of the actual board
        const boardCellSize = this.getBoardCellSize();
        clone.style.setProperty('--cell-size', `${boardCellSize}px`);
        clone.style.left = `${clientX}px`;
        clone.style.top = `${clientY - this.dragTouchOffset}px`;

        document.body.appendChild(clone);
        this.dragGhostElement = clone;
    }

    getBoardCellSize() {
        const firstCell = this.domBoard.querySelector('.grid-cell');
        return firstCell ? firstCell.getBoundingClientRect().width : 34;
    }

    // Drag Move
    handleWindowPointerMove(e) {
        if (!this.isDragging || !this.dragGhostElement) return;

        const posX = e.clientX;
        const posY = e.clientY - this.dragTouchOffset;

        this.dragGhostElement.style.left = `${posX}px`;
        this.dragGhostElement.style.top = `${posY}px`;

        // Calculate snap coordinate on board
        this.updateSnapPreview(posX, posY);
    }

    updateSnapPreview(posX, posY) {
        const boardRect = this.domBoard.getBoundingClientRect();
        const cellSize = this.getBoardCellSize();

        // Calculate center of the dragging shape to find top-left grid cell
        const shapeWidthPx = this.dragShape.width * cellSize;
        const shapeHeightPx = this.dragShape.height * cellSize;

        const shapeTopLeftX = posX - (shapeWidthPx / 2);
        const shapeTopLeftY = posY - (shapeHeightPx / 2);

        // Approximate row & col
        const col = Math.round((shapeTopLeftX - boardRect.left) / cellSize);
        const row = Math.round((shapeTopLeftY - boardRect.top) / cellSize);

        this.clearGhostPreview();

        if (this.board.isInBounds(row, col) || 
            (row >= -1 && row < this.boardSize && col >= -1 && col < this.boardSize)) {
            
            const canPlace = this.board.canPlaceShape(this.dragShape, row, col);

            this.activeSnap = {
                r: row,
                c: col,
                valid: canPlace
            };

            this.renderGhostPreview(this.dragShape, row, col, canPlace);
        } else {
            this.activeSnap = null;
        }
    }

    renderGhostPreview(shape, startR, startC, isValid) {
        const matrix = shape.matrix;
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    const targetR = startR + r;
                    const targetC = startC + c;

                    if (this.board.isInBounds(targetR, targetC)) {
                        const cell = this.domBoard.querySelector(`[data-r="${targetR}"][data-c="${targetC}"]`);
                        if (cell) {
                            if (isValid) {
                                cell.classList.add('ghost-valid');
                                cell.style.setProperty('--ghost-color', shape.color);
                            } else {
                                cell.classList.add('ghost-invalid');
                            }
                        }
                    }
                }
            }
        }
    }

    clearGhostPreview() {
        const cells = this.domBoard.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('ghost-valid', 'ghost-invalid');
            cell.style.removeProperty('--ghost-color');
        });
    }

    // Drag End
    handleWindowPointerUp(e) {
        if (!this.isDragging) return;

        const slotIndex = this.dragIndex;
        const shape = this.dragShape;
        const snap = this.activeSnap;

        // Remove floating drag piece
        if (this.dragGhostElement) {
            this.dragGhostElement.remove();
            this.dragGhostElement = null;
        }

        this.clearGhostPreview();

        let placed = false;
        if (snap && snap.valid) {
            placed = this.executePlacement(shape, snap.r, snap.c, slotIndex);
        }

        if (!placed) {
            // Snap back animation & sound
            this.audio.playInvalidBounce();
            const slot = this.domHand.querySelector(`[data-slot-index="${slotIndex}"]`);
            if (slot) {
                slot.classList.remove('is-dragging');
                slot.classList.add('bounce-back');
                setTimeout(() => slot.classList.remove('bounce-back'), 300);
            }
        }

        this.isDragging = false;
        this.dragIndex = null;
        this.dragShape = null;
        this.activeSnap = null;
    }

    // Click to Place fallback
    handleBoardClick(e) {
        if (this.selectedHandIndex === null) return;

        const cell = e.target.closest('.grid-cell');
        if (!cell) return;

        const r = parseInt(cell.dataset.r, 10);
        const c = parseInt(cell.dataset.c, 10);
        const shape = this.handShapes[this.selectedHandIndex];

        if (shape && this.board.canPlaceShape(shape, r, c)) {
            this.executePlacement(shape, r, c, this.selectedHandIndex);
            this.selectedHandIndex = null;
            document.querySelectorAll('.hand-slot').forEach(s => s.classList.remove('selected'));
        }
    }

    // Execute the shape placement
    executePlacement(shape, row, col, slotIndex) {
        const placedCells = this.board.placeShape(shape, row, col);
        if (!placedCells) return false;

        // Clear shape from hand
        this.handShapes[slotIndex] = null;
        const slot = this.domHand.querySelector(`[data-slot-index="${slotIndex}"]`);
        if (slot) {
            slot.classList.remove('is-dragging');
            slot.innerHTML = '';
        }

        // Placement sound
        this.audio.playPlaceBlock();

        // Placement score: 1 point per cell
        const shapeScore = shape.cellCount;
        this.score += shapeScore;

        // Visual sync
        this.syncBoardView();

        // Check for full rows/columns
        const clears = this.board.findClears();
        if (clears.totalLines > 0) {
            this.combo++;
            this.handleLineClears(clears);
        } else {
            // Reset combo streak if no line was cleared
            this.combo = 0;
            this.updateScoreDisplay();
            this.checkHandCompletion();
        }

        return true;
    }

    // Handle line clears with continuous xylophone arpeggio & sparkles
    handleLineClears(clears) {
        const { rows, cols, totalLines } = clears;

        // Play wood xylophone arpeggio (C-D-E-F-G-A-B-C) with combo elevation
        this.audio.playClearArpeggio(totalLines, this.combo);

        // Shake board slightly for juice
        this.domBoard.classList.add('board-shake');
        setTimeout(() => this.domBoard.classList.remove('board-shake'), 350);

        // Score calculation:
        // Base line score: 10 * size per line
        // Multiplier: 1 line = 1x, 2 lines = 2.5x, 3 lines = 4x, etc.
        const lineBase = totalLines * this.boardSize * 10;
        const comboBonus = Math.floor(lineBase * (1 + (this.combo - 1) * 0.5) * (totalLines > 1 ? 1.5 : 1));
        this.score += comboBonus;

        // Highlight cells before clearing
        const clearedCells = this.board.clearLines(rows, cols);

        // Explode sparkles from each cleared cell
        clearedCells.forEach((cellData, i) => {
            const cellElem = this.domBoard.querySelector(`[data-r="${cellData.r}"][data-c="${cellData.c}"]`);
            if (cellElem) {
                cellElem.classList.add('clearing');
                const rect = cellElem.getBoundingClientRect();
                const parentRect = this.domCanvas.getBoundingClientRect();

                const centerX = rect.left - parentRect.left + rect.width / 2;
                const centerY = rect.top - parentRect.top + rect.height / 2;

                // Delayed sparkling for xylophone cadence sync
                setTimeout(() => {
                    this.particles.explodeCell(centerX, centerY, cellData.color);
                }, i * 18);
            }
        });

        // Floating combo text
        const boardRect = this.domBoard.getBoundingClientRect();
        const canvasRect = this.domCanvas.getBoundingClientRect();
        const textX = boardRect.left - canvasRect.left + boardRect.width / 2;
        const textY = boardRect.top - canvasRect.top + boardRect.height / 2 - 20;

        let bannerText = `+${comboBonus}`;
        if (totalLines === 2) bannerText += ' • DOUBLE!';
        else if (totalLines === 3) bannerText += ' • TRIPLE!';
        else if (totalLines >= 4) bannerText += ' • FABULOUS!';

        if (this.combo > 1) {
            bannerText += ` (x${this.combo} STREAK)`;
        }

        this.particles.addFloatingText(textX, textY, bannerText, '#2A2421', 22, true);

        // Remove clearing classes and refresh board after animation
        setTimeout(() => {
            this.syncBoardView();
            this.updateScoreDisplay();
            this.checkHandCompletion();
        }, 320);
    }

    // Check if hand is fully emptied, if so deal new hand
    checkHandCompletion() {
        const remaining = this.handShapes.filter(Boolean);
        if (remaining.length === 0) {
            setTimeout(() => {
                this.dealNewHand();
            }, 180);
        } else {
            this.checkHandFitStatus();
        }
    }

    updateScoreDisplay() {
        this.domScore.textContent = this.score;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('notebook_puzzle_best_' + this.boardSize, this.bestScore.toString());
        }

        this.domBest.textContent = this.bestScore;
    }

    triggerGameOver() {
        this.audio.playGameOver();

        this.domFinalScore.textContent = this.score;
        this.domBestRecord.textContent = this.bestScore;

        if (this.score >= this.bestScore && this.score > 0) {
            this.audio.playNewBest();
            document.getElementById('newBestBadge').style.display = 'inline-block';
        } else {
            document.getElementById('newBestBadge').style.display = 'none';
        }

        this.domGameOverModal.classList.add('show');
    }

    hideGameOver() {
        this.domGameOverModal.classList.remove('show');
    }
}

// Start game on window load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new BlockPuzzleGame();
});

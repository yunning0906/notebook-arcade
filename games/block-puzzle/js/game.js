/**
 * Notebook Block Puzzle - Main Game Controller
 * Features:
 * 1. Clean stationery geometric icon symbols on every block (no bitmaps/stickers).
 * 2. Downward gravity drop: when the block is held over a column, it snaps to the bottom landing row
 *    and drops down with crisp tactile impact.
 * 3. Continuous xylophone arpeggio (C-D-E-F-G-A-B-C) on line clears with sparkle explosions.
 */

class BlockPuzzleGame {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSize = parseInt(urlParams.get('size'), 10);
        this.boardSize = (initialSize === 8) ? 8 : 10;
        this.board = new PuzzleBoard(this.boardSize);
        this.generator = new ShapeGenerator();
        this.audio = window.puzzleAudio;

        // State
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('notebook_puzzle_best_' + this.boardSize) || '0', 10);
        this.combo = 0;
        this.handShapes = [null, null, null];
        this.selectedHandIndex = null;

        // Drag & Drop
        this.isDragging = false;
        this.dragIndex = null;
        this.dragShape = null;
        this.dragGhostElement = null;
        this.dragTouchOffset = 0;
        this.activeSnap = null; // { r, c, valid }

        // DOM
        this.domBoard = document.getElementById('puzzleBoard');
        this.domHand = document.getElementById('handSlots');
        this.domScore = document.getElementById('currentScore');
        this.domBest = document.getElementById('bestScore');
        this.domCanvas = document.getElementById('particleCanvas');
        this.domGameOverModal = document.getElementById('gameOverModal');
        this.domFinalScore = document.getElementById('finalScore');
        this.domBestRecord = document.getElementById('bestRecord');

        this.particles = new ParticleSystem(this.domCanvas);

        this.initDOM();
        this.initEvents();
        this.startNewGame();

        if (new URLSearchParams(window.location.search).has('demo')) {
            this.setupDemoState();
        }
    }

    setupDemoState() {
        this.score = 840;
        this.bestScore = 1520;
        this.updateScoreDisplay();
        
        const palette = MORANDI_PALETTE;
        const placeCell = (r, c, colKey) => {
            const pal = palette[colKey];
            if (this.board.isInBounds(r, c)) {
                this.board.grid[r][c] = {
                    color: pal.bg,
                    colorSub: pal.sub,
                    colorHighlight: pal.highlight,
                    symbolSvg: pal.symbolSvg
                };
            }
        };

        // Place beautiful Morandi blocks in progress
        placeCell(4, 2, 'pistachio'); placeCell(4, 3, 'pistachio'); placeCell(4, 4, 'pistachio');
        placeCell(5, 3, 'pistachio');
        
        placeCell(6, 1, 'rose'); placeCell(7, 1, 'rose'); placeCell(8, 1, 'rose'); placeCell(8, 2, 'rose');
        
        placeCell(7, 4, 'mistBlue'); placeCell(7, 5, 'mistBlue'); placeCell(8, 4, 'mistBlue'); placeCell(8, 5, 'mistBlue');
        
        placeCell(9, 3, 'vanilla'); placeCell(9, 4, 'vanilla'); placeCell(9, 5, 'vanilla'); placeCell(9, 6, 'vanilla'); placeCell(9, 7, 'vanilla');
        
        placeCell(5, 7, 'apricot'); placeCell(6, 6, 'apricot'); placeCell(6, 7, 'apricot'); placeCell(6, 8, 'apricot');

        placeCell(2, 6, 'lavender'); placeCell(3, 6, 'lavender'); placeCell(4, 6, 'lavender');

        this.syncBoardView();
    }

    initDOM() {
        this.updateScoreDisplay();
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === this.boardSize);
        });
        this.renderBoardGrid();
    }

    renderBoardGrid() {
        this.domBoard.innerHTML = '';
        this.domBoard.style.setProperty('--grid-size', this.boardSize);
        this.domBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        this.domBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

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

    syncBoardView() {
        const cells = this.domBoard.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.r, 10);
            const c = parseInt(cell.dataset.c, 10);
            if (!this.board.grid[r] || this.board.grid[r][c] === undefined) return;
            const val = this.board.grid[r][c];

            cell.className = 'grid-cell';
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
            cell.innerHTML = '';

            if (val) {
                cell.classList.add('occupied');
                cell.style.backgroundColor = val.color;
                cell.style.boxShadow = `inset 0 -2px 0 ${val.colorSub}, inset 0 2px 0 ${val.colorHighlight}`;
                cell.innerHTML = val.symbolSvg || '';
            }
        });
    }

    startNewGame() {
        this.board.reset(this.boardSize);
        this.score = 0;
        this.combo = 0;
        this.updateScoreDisplay();
        this.renderBoardGrid();
        this.hideGameOver();
        this.dealNewHand();
    }

    setBoardSize(size) {
        if (this.boardSize === size) return;
        this.boardSize = size;
        this.bestScore = parseInt(localStorage.getItem('notebook_puzzle_best_' + this.boardSize) || '0', 10);
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.size, 10) === this.boardSize);
        });
        this.startNewGame();
    }

    dealNewHand() {
        this.handShapes = this.generator.getHandOfThree();
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
                    cell.innerHTML = shape.symbolSvg || '';
                } else {
                    cell.classList.add('empty');
                }
                container.appendChild(cell);
            }
        }

        return container;
    }

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

        const remainingShapes = this.handShapes.filter(Boolean);
        if (remainingShapes.length > 0 && !anyFit) {
            setTimeout(() => this.triggerGameOver(), 350);
        }
    }

    initEvents() {
        this.domHand.addEventListener('pointerdown', (e) => this.handleHandPointerDown(e));
        window.addEventListener('pointermove', (e) => this.handleWindowPointerMove(e));
        window.addEventListener('pointerup', (e) => this.handleWindowPointerUp(e));
        window.addEventListener('pointercancel', (e) => this.handleWindowPointerUp(e));

        // Click-to-place fallback: click slot then click board column
        this.domHand.addEventListener('click', (e) => {
            const slot = e.target.closest('.hand-slot');
            if (!slot) return;
            const slotIndex = parseInt(slot.dataset.slotIndex, 10);
            if (!this.handShapes[slotIndex]) return;

            this.selectedHandIndex = slotIndex;
            document.querySelectorAll('.hand-slot').forEach(s => s.classList.remove('selected'));
            slot.classList.add('selected');
        });

        this.domBoard.addEventListener('click', (e) => this.handleBoardClick(e));

        document.getElementById('btnRestart').addEventListener('click', () => this.startNewGame());

        document.getElementById('btnHeaderRestart').addEventListener('click', () => {
            if (confirm('確定要重新開始新的一局手帳拼圖嗎？')) {
                this.startNewGame();
            }
        });

        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.currentTarget.dataset.size, 10);
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.setBoardSize(size);
            });
        });

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

    handleHandPointerDown(e) {
        const slot = e.target.closest('.hand-slot');
        if (!slot) return;

        const slotIndex = parseInt(slot.dataset.slotIndex, 10);
        const shape = this.handShapes[slotIndex];
        if (!shape) return;

        this.audio.init();

        this.isDragging = true;
        this.dragIndex = slotIndex;
        this.dragShape = shape;

        this.audio.playPickup();

        const isTouch = e.pointerType === 'touch';
        this.dragTouchOffset = isTouch ? 76 : 0;

        slot.classList.add('is-dragging');
        this.createFloatingDragClone(shape, e.clientX, e.clientY);

        if (e.target.setPointerCapture) {
            try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
        }
    }

    createFloatingDragClone(shape, clientX, clientY) {
        if (this.dragGhostElement) {
            this.dragGhostElement.remove();
        }

        const clone = this.createShapeElement(shape, this.dragIndex, true);
        clone.id = 'floatingDragShape';
        clone.classList.add('floating-drag');

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

    handleWindowPointerMove(e) {
        if (!this.isDragging || !this.dragGhostElement) return;

        const posX = e.clientX;
        const posY = e.clientY - this.dragTouchOffset;

        this.dragGhostElement.style.left = `${posX}px`;
        this.dragGhostElement.style.top = `${posY}px`;

        this.updateSnapPreview(posX, posY);
    }

    /**
     * Compute downward gravity drop landing position
     * When block is positioned above any grid columns, calculate the lowest valid drop row.
     */
    updateSnapPreview(posX, posY) {
        const boardRect = this.domBoard.getBoundingClientRect();
        const cellSize = this.getBoardCellSize();

        // Calculate horizontal alignment to find target column
        const shapeWidthPx = this.dragShape.width * cellSize;
        const shapeTopLeftX = posX - (shapeWidthPx / 2);

        const col = Math.round((shapeTopLeftX - boardRect.left) / cellSize);

        this.clearGhostPreview();

        // Check if pointer is in or directly above the board horizontally
        const isInHorizontalReach = col >= 0 && col <= (this.boardSize - this.dragShape.width);
        const isNearBoardVertically = posY >= (boardRect.top - 180) && posY <= (boardRect.bottom + 80);

        if (isInHorizontalReach && isNearBoardVertically) {
            const dropRow = this.board.getDropRow(this.dragShape, col);

            if (dropRow !== null) {
                this.activeSnap = {
                    r: dropRow,
                    c: col,
                    valid: true
                };
                this.renderDropPreview(this.dragShape, dropRow, col);
            } else {
                // Column is completely full at top
                this.activeSnap = {
                    r: 0,
                    c: col,
                    valid: false
                };
                this.renderInvalidPreview(this.dragShape, 0, col);
            }
        } else {
            this.activeSnap = null;
        }
    }

    renderDropPreview(shape, dropRow, startC) {
        const matrix = shape.matrix;

        // 1. Highlight vertical guide beam through the columns
        for (let c = 0; c < shape.width; c++) {
            const beamC = startC + c;
            for (let r = 0; r <= dropRow; r++) {
                const cell = this.domBoard.querySelector(`[data-r="${r}"][data-c="${beamC}"]`);
                if (cell && !cell.classList.contains('occupied')) {
                    cell.classList.add('drop-beam');
                }
            }
        }

        // 2. Render bottom landing ghost
        for (let r = 0; r < matrix.length; r++) {
            for (let c = 0; c < matrix[r].length; c++) {
                if (matrix[r][c] === 1) {
                    const targetR = dropRow + r;
                    const targetC = startC + c;

                    const cell = this.domBoard.querySelector(`[data-r="${targetR}"][data-c="${targetC}"]`);
                    if (cell) {
                        cell.classList.add('ghost-landing');
                        cell.style.setProperty('--ghost-color', shape.color);
                        cell.innerHTML = shape.symbolSvg || '';
                    }
                }
            }
        }
    }

    renderInvalidPreview(shape, startR, startC) {
        for (let c = 0; c < shape.width; c++) {
            const targetC = startC + c;
            if (targetC >= 0 && targetC < this.boardSize) {
                const cell = this.domBoard.querySelector(`[data-r="0"][data-c="${targetC}"]`);
                if (cell) cell.classList.add('ghost-invalid');
            }
        }
    }

    clearGhostPreview() {
        const cells = this.domBoard.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('drop-beam', 'ghost-landing', 'ghost-invalid');
            cell.style.removeProperty('--ghost-color');
            if (!cell.classList.contains('occupied')) {
                cell.innerHTML = '';
            }
        });
    }

    handleWindowPointerUp(e) {
        if (!this.isDragging) return;

        const slotIndex = this.dragIndex;
        const shape = this.dragShape;
        const snap = this.activeSnap;
        const ghostElement = this.dragGhostElement;

        this.clearGhostPreview();

        if (snap && snap.valid) {
            // Animate shape dropping vertically down into landing target!
            this.animateDropAndPlace(shape, snap.r, snap.c, slotIndex, ghostElement);
        } else {
            // Snap back
            if (ghostElement) ghostElement.remove();
            this.dragGhostElement = null;
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

    /**
     * Animate shape dropping vertically down into landing row (方塊落下去)
     */
    animateDropAndPlace(shape, dropRow, startC, slotIndex, floatingEl) {
        const boardRect = this.domBoard.getBoundingClientRect();
        const cellSize = this.getBoardCellSize();

        const targetX = boardRect.left + (startC * cellSize) + (shape.width * cellSize) / 2;
        const targetY = boardRect.top + (dropRow * cellSize) + (shape.height * cellSize) / 2;

        if (floatingEl) {
            floatingEl.style.transition = 'top 0.16s cubic-bezier(0.55, 0.055, 0.675, 0.19), left 0.16s ease, transform 0.16s ease';
            floatingEl.style.left = `${targetX}px`;
            floatingEl.style.top = `${targetY}px`;
            floatingEl.style.transform = 'translate(-50%, -50%) scale(1)';
        }

        setTimeout(() => {
            if (floatingEl) floatingEl.remove();
            this.dragGhostElement = null;
            this.executePlacement(shape, dropRow, startC, slotIndex);
        }, 150);
    }

    handleBoardClick(e) {
        if (this.selectedHandIndex === null) return;

        const cell = e.target.closest('.grid-cell');
        if (!cell) return;

        const c = parseInt(cell.dataset.c, 10);
        const shape = this.handShapes[this.selectedHandIndex];

        if (shape) {
            const dropRow = this.board.getDropRow(shape, c);
            if (dropRow !== null) {
                this.executePlacement(shape, dropRow, c, this.selectedHandIndex);
                this.selectedHandIndex = null;
                document.querySelectorAll('.hand-slot').forEach(s => s.classList.remove('selected'));
            }
        }
    }

    executePlacement(shape, row, col, slotIndex) {
        const placedCells = this.board.placeShape(shape, row, col);
        if (!placedCells) return false;

        this.handShapes[slotIndex] = null;
        const slot = this.domHand.querySelector(`[data-slot-index="${slotIndex}"]`);
        if (slot) {
            slot.classList.remove('is-dragging', 'selected');
            slot.innerHTML = '';
        }

        this.audio.playPlaceBlock();

        this.score += shape.cellCount;
        this.syncBoardView();

        // Add landing squash animation to newly placed cells
        placedCells.forEach(coord => {
            const cell = this.domBoard.querySelector(`[data-r="${coord.r}"][data-c="${coord.c}"]`);
            if (cell) {
                cell.classList.add('landed');
                setTimeout(() => cell.classList.remove('landed'), 240);
            }
        });

        const clears = this.board.findClears();
        if (clears.totalLines > 0) {
            this.combo++;
            this.handleLineClears(clears);
        } else {
            this.combo = 0;
            this.updateScoreDisplay();
            this.checkHandCompletion();
        }

        return true;
    }

    handleLineClears(clears) {
        const { rows, cols, totalLines } = clears;

        // Xylophone arpeggio (C-D-E-F-G-A-B-C)
        this.audio.playClearArpeggio(totalLines, this.combo);

        this.domBoard.classList.add('board-shake');
        setTimeout(() => this.domBoard.classList.remove('board-shake'), 350);

        const lineBase = totalLines * this.boardSize * 10;
        const comboBonus = Math.floor(lineBase * (1 + (this.combo - 1) * 0.5) * (totalLines > 1 ? 1.5 : 1));
        this.score += comboBonus;

        const clearedCells = this.board.clearLines(rows, cols);

        clearedCells.forEach((cellData, i) => {
            const cellElem = this.domBoard.querySelector(`[data-r="${cellData.r}"][data-c="${cellData.c}"]`);
            if (cellElem) {
                cellElem.classList.add('clearing');
                const rect = cellElem.getBoundingClientRect();
                const parentRect = this.domCanvas.getBoundingClientRect();

                const centerX = rect.left - parentRect.left + rect.width / 2;
                const centerY = rect.top - parentRect.top + rect.height / 2;

                setTimeout(() => {
                    this.particles.explodeCell(centerX, centerY, cellData.color);
                }, i * 18);
            }
        });

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

        setTimeout(() => {
            this.syncBoardView();
            this.updateScoreDisplay();
            this.checkHandCompletion();
        }, 320);
    }

    checkHandCompletion() {
        const remaining = this.handShapes.filter(Boolean);
        if (remaining.length === 0) {
            setTimeout(() => this.dealNewHand(), 180);
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

window.addEventListener('DOMContentLoaded', () => {
    window.game = new BlockPuzzleGame();
});

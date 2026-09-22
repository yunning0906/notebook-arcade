/**
 * Main Game Controller
 * Connects Board, Audio, Renderer, Input, and UI Modals.
 */

class Game2048 {
    constructor() {
        this.currentSize = 4;
        this.hasTriggeredWinThisSession = false;

        // Elements
        this.boardContainer = document.getElementById('boardContainer');
        this.gridLayer = document.getElementById('gridLayer');
        this.tileLayer = document.getElementById('tileLayer');
        this.scoreEl = document.getElementById('currentScore');
        this.highScoreEl = document.getElementById('highScore');

        this.restartBtn = document.getElementById('restartBtn');
        this.modalRestartBtn = document.getElementById('modalRestartBtn');
        this.keepGoingBtn = document.getElementById('keepGoingBtn');
        this.soundToggleBtn = document.getElementById('soundToggleBtn');
        this.soundIconOn = document.getElementById('soundIconOn');
        this.soundIconOff = document.getElementById('soundIconOff');

        this.gameOverModal = document.getElementById('gameOverModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalSubtext = document.getElementById('modalSubtext');
        this.finalScoreEl = document.getElementById('finalScore');
        this.bestScoreModalEl = document.getElementById('bestScoreModal');

        this.diffButtons = document.querySelectorAll('.diff-btn');

        // Subsystems
        this.fx = new ParticleAndFXSystem('fxCanvas');
        this.renderer = new TileRenderer(this.boardContainer, this.gridLayer, this.tileLayer, this.fx);
        this.board = new Board(this.currentSize);
        this.input = new InputManager(this.boardContainer, (dir) => this.handleMove(dir));

        this.init();
    }

    init() {
        this.bindUI();
        this.setupBoard(this.currentSize);

        if (new URLSearchParams(window.location.search).has('demo')) {
            this.setupDemoState();
        }

        // Handle window resize to re-align tiles
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.renderer.renderTiles(this.board.tiles, this.board.size);
            }, 100);
        });
    }

    setupDemoState() {
        this.board.tiles = [];
        const add = (r, c, val) => {
            this.board.tiles.push({ id: this.board.tileCounter++, row: r, col: c, value: val });
        };
        add(0, 0, 128); add(0, 1, 64); add(0, 2, 32); add(0, 3, 16);
        add(1, 0, 64);  add(1, 1, 32); add(1, 2, 16); add(1, 3, 8);
        add(2, 0, 16);  add(2, 1, 8);  add(2, 2, 4);  add(2, 3, 2);
        add(3, 0, 4);   add(3, 1, 2);

        this.score = 2480;
        this.scoreEl.textContent = '2480';
        this.renderer.renderTiles(this.board.tiles, this.board.size);
    }

    bindUI() {
        // Restart buttons
        this.restartBtn.addEventListener('click', () => {
            this.soundEngineAction(() => window.soundEngine.playSlide());
            this.restartGame();
        });

        this.modalRestartBtn.addEventListener('click', () => {
            this.soundEngineAction(() => window.soundEngine.playSlide());
            this.hideModal();
            this.restartGame();
        });

        this.keepGoingBtn.addEventListener('click', () => {
            this.soundEngineAction(() => window.soundEngine.playSlide());
            this.board.keepPlaying = true;
            this.hideModal();
        });

        // Sound Toggle
        this.soundToggleBtn.addEventListener('click', () => {
            const isMuted = window.soundEngine.toggleMute();
            if (isMuted) {
                this.soundIconOn.classList.add('hidden');
                this.soundIconOff.classList.remove('hidden');
            } else {
                this.soundIconOn.classList.remove('hidden');
                this.soundIconOff.classList.add('hidden');
            }
        });

        // Difficulty Buttons (3x3, 4x4, 5x5)
        this.diffButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const newSize = parseInt(btn.dataset.size, 10);
                if (newSize === this.currentSize) return;

                this.soundEngineAction(() => window.soundEngine.playSlide());
                this.diffButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.currentSize = newSize;
                this.setupBoard(newSize);
            });
        });
    }

    soundEngineAction(action) {
        if (window.soundEngine) {
            window.soundEngine.init();
            action();
        }
    }

    setupBoard(size) {
        this.hasTriggeredWinThisSession = false;
        this.board.setSize(size);
        this.renderer.setupGrid(size);
        this.renderer.renderTiles(this.board.tiles, size);
        this.updateScoreDisplay();
        this.hideModal();
    }

    restartGame() {
        this.hasTriggeredWinThisSession = false;
        this.board.init();
        this.renderer.setupGrid(this.currentSize);
        this.renderer.renderTiles(this.board.tiles, this.currentSize);
        this.updateScoreDisplay();
    }

    handleMove(direction) {
        if (this.board.over && !this.gameOverModal.classList.contains('hidden')) return;

        const result = this.board.move(direction);

        if (result.moved) {
            // 1. Play Slide Bloop Sound
            if (window.soundEngine) {
                window.soundEngine.playSlide();

                // 2. Play Merge Glockenspiel Bells & Combo Arpeggios
                if (result.mergedValues && result.mergedValues.length > 0) {
                    result.mergedValues.forEach((val, idx) => {
                        setTimeout(() => {
                            window.soundEngine.playMerge(val, result.combo);
                        }, idx * 45);
                    });
                }
            }

            // 3. Update Tiles in DOM
            this.renderer.renderTiles(this.board.tiles, this.board.size);
            this.updateScoreDisplay();

            // 4. Milestone Check (2048 Reached)
            if (result.won && !this.hasTriggeredWinThisSession) {
                this.hasTriggeredWinThisSession = true;
                setTimeout(() => {
                    if (window.soundEngine) {
                        window.soundEngine.playVictory();
                    }
                    this.fx.spawnVictoryConfetti();
                    this.showWinModal();
                }, 300);
            }

            // 5. Game Over Check
            if (result.over) {
                setTimeout(() => {
                    if (window.soundEngine) {
                        window.soundEngine.playGameOver();
                    }
                    this.showGameOverModal();
                }, 400);
            }
        }
    }

    updateScoreDisplay() {
        this.scoreEl.textContent = this.board.score;
        this.highScoreEl.textContent = this.board.highScore;
    }

    showWinModal() {
        this.modalTitle.textContent = 'YOU WIN!';
        this.modalSubtext.textContent = 'You reached the 2048 tile!';
        this.finalScoreEl.textContent = this.board.score;
        this.bestScoreModalEl.textContent = this.board.highScore;
        this.keepGoingBtn.classList.remove('hidden');
        this.modalRestartBtn.textContent = 'PLAY AGAIN';
        this.gameOverModal.classList.remove('hidden');
    }

    showGameOverModal() {
        this.modalTitle.textContent = 'GAME OVER';
        this.modalSubtext.textContent = 'No more moves available!';
        this.finalScoreEl.textContent = this.board.score;
        this.bestScoreModalEl.textContent = this.board.highScore;
        this.keepGoingBtn.classList.add('hidden');
        this.modalRestartBtn.textContent = 'TRY AGAIN';
        this.gameOverModal.classList.remove('hidden');
    }

    hideModal() {
        this.gameOverModal.classList.add('hidden');
    }
}

// Start game on DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game2048();
});

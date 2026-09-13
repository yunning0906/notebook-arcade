/**
 * Main Bubble Shooter Game Controller
 * Manages game loop, scoring, fouls / ceiling drop, controls (mouse, touch, keys),
 * audio triggers, and UI synchronization.
 */

class BubbleShooterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.nextCanvas = document.getElementById('nextBubbleCanvas');
        this.nextCtx = this.nextCanvas ? this.nextCanvas.getContext('2d') : null;

        this.width = 360;
        this.height = 540;

        this.grid = new HexGrid(this.width, this.height);
        this.shooter = new Shooter(this.width, this.height, this.grid);
        this.renderer = new GameRenderer(this.canvas, this.grid, this.shooter);

        // Game State
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('bubble_shooter_best_score') || '0', 10);
        this.combo = 1;
        this.fouls = 0;
        this.maxFouls = 5;
        this.isGameOver = false;
        this.isAiming = true;

        // Key states
        this.keys = { left: false, right: false };

        this.initDOM();
        this.initInputs();
        this.updateUI();
        this.updateNextBubblePreview();

        // Start Loop
        this.lastFrameTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    initDOM() {
        this.scoreEl = document.getElementById('currentScore');
        this.highScoreEl = document.getElementById('highScore');
        this.modalEl = document.getElementById('gameOverModal');
        this.finalScoreEl = document.getElementById('finalScore');
        this.bestScoreModalEl = document.getElementById('bestScoreModal');
        this.foulDots = document.querySelectorAll('.foul-dot');

        this.soundBtn = document.getElementById('soundToggleBtn');
        this.soundIconOn = document.getElementById('soundIconOn');
        this.soundIconOff = document.getElementById('soundIconOff');

        const restartBtn = document.getElementById('restartBtn');
        const modalRestartBtn = document.getElementById('modalRestartBtn');
        const swapBtn = document.getElementById('swapBtn');

        if (restartBtn) restartBtn.addEventListener('click', () => this.restart());
        if (modalRestartBtn) modalRestartBtn.addEventListener('click', () => this.restart());
        if (swapBtn) {
            swapBtn.addEventListener('click', () => {
                this.shooter.swap();
                this.updateNextBubblePreview();
            });
        }

        if (this.soundBtn) {
            this.soundBtn.addEventListener('click', () => {
                if (window.soundEngine) {
                    const isMuted = window.soundEngine.toggleMute();
                    if (isMuted) {
                        this.soundIconOn.classList.add('hidden');
                        this.soundIconOff.classList.remove('hidden');
                    } else {
                        this.soundIconOn.classList.remove('hidden');
                        this.soundIconOff.classList.add('hidden');
                    }
                }
            });
        }
    }

    initInputs() {
        // --- Mouse Controls ---
        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.width / rect.width;
            const scaleY = this.height / rect.height;
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isGameOver) return;
            const pos = getCanvasCoords(e);
            this.shooter.aimAt(pos.x, pos.y);
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.isGameOver) return;
            const pos = getCanvasCoords(e);
            // Clicking near shooter barrel triggers bubble swap as handy shortcut
            if (Math.hypot(pos.x - this.shooter.x, pos.y - this.shooter.y) < this.grid.radius * 1.6) {
                this.shooter.swap();
                this.updateNextBubblePreview();
                return;
            }

            this.shooter.aimAt(pos.x, pos.y);
            this.handleShoot();
        });

        // --- Touch Controls (Swipe / Drag to aim, release to shoot) ---
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isGameOver) return;
            e.preventDefault();
            const touch = e.touches[0];
            const pos = getCanvasCoords(touch);
            this.shooter.aimAt(pos.x, pos.y);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (this.isGameOver) return;
            e.preventDefault();
            const touch = e.touches[0];
            const pos = getCanvasCoords(touch);
            this.shooter.aimAt(pos.x, pos.y);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.isGameOver) return;
            e.preventDefault();
            this.handleShoot();
        }, { passive: false });

        // --- Keyboard Controls ---
        window.addEventListener('keydown', (e) => {
            if (this.isGameOver) {
                if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'r') {
                    this.restart();
                }
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = true;
                    break;
                case 'ArrowUp':
                case ' ':
                    e.preventDefault();
                    this.handleShoot();
                    break;
                case 'ArrowDown':
                case 'c':
                case 'C':
                    e.preventDefault();
                    this.shooter.swap();
                    this.updateNextBubblePreview();
                    break;
                case 'r':
                case 'R':
                    this.restart();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
            }
        });
    }

    handleShoot() {
        if (this.isGameOver || this.shooter.projectile) return;
        const projectile = this.shooter.shoot();
        if (projectile) {
            // Update next preview when current moves to shooter barrel
            this.updateNextBubblePreview();
        }
    }

    onBubbleSnapped(result) {
        const { r, c, bubble } = result;

        // 1. Find 3+ connected matches
        const matches = this.grid.findMatches(r, c);

        if (matches.length >= 3) {
            // Success! Pop the matches
            this.grid.removeBubbles(matches);

            const pointsPerBubble = 10;
            const matchScore = matches.length * pointsPerBubble * this.combo;
            this.addScore(matchScore);

            // Compute center of popped cluster for effects
            let avgX = 0;
            let avgY = 0;
            matches.forEach(m => {
                avgX += m.x;
                avgY += m.y;
            });
            avgX /= matches.length;
            avgY /= matches.length;

            if (window.soundEngine) {
                window.soundEngine.playPop(this.combo);
                if (matches.length >= 5 || this.combo >= 2) {
                    window.soundEngine.playFairyCombo(this.combo);
                }
            }

            this.renderer.spawnPopFX(avgX, avgY, matchScore, this.combo, bubble.color);

            // 2. Check for orphaned / floating bubbles
            const floating = this.grid.findFloatingBubbles();
            if (floating.length > 0) {
                const dropBonus = floating.length * 20 * this.combo;
                this.addScore(dropBonus);

                this.renderer.addFallingBubbles(floating);

                if (window.soundEngine) {
                    window.soundEngine.playDrop();
                }

                // Extra bonus score popup for dropped bubbles
                setTimeout(() => {
                    this.renderer.spawnPopFX(avgX, avgY + 30, dropBonus, this.combo + 1);
                }, 220);
            }

            this.combo++;
            // Successful pop does not increment foul counter!
        } else {
            // Miss: broke combo and increment foul counter
            this.combo = 1;
            this.fouls++;

            if (this.fouls >= this.maxFouls) {
                this.fouls = 0;
                this.grid.advanceCeiling();
                if (window.soundEngine) {
                    window.soundEngine.playCeilingDrop();
                }
            }
        }

        this.updateFoulIndicators();

        // 3. Check for Game Over condition
        if (this.grid.checkGameOver()) {
            this.triggerGameOver();
            return;
        }

        // 4. Reload shooter
        this.shooter.reload();
        this.updateNextBubblePreview();
    }

    addScore(pts) {
        this.score += pts;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('bubble_shooter_best_score', this.highScore.toString());
        }
        this.updateUI();
    }

    updateUI() {
        if (this.scoreEl) this.scoreEl.textContent = this.score;
        if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
    }

    updateFoulIndicators() {
        const remaining = this.maxFouls - this.fouls;
        this.foulDots.forEach((dot, idx) => {
            if (idx < remaining) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    updateNextBubblePreview() {
        if (!this.nextCtx || !this.shooter.nextBubble) return;
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        Bubble.drawBubble(
            this.nextCtx,
            this.nextCanvas.width / 2,
            this.nextCanvas.height / 2,
            16,
            this.shooter.nextBubble.color,
            false,
            1.0,
            1.0
        );
    }

    triggerGameOver() {
        this.isGameOver = true;
        if (window.soundEngine) {
            window.soundEngine.playGameOver();
        }

        if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
        if (this.bestScoreModalEl) this.bestScoreModalEl.textContent = this.highScore;
        if (this.modalEl) {
            this.modalEl.classList.remove('hidden');
        }
    }

    restart() {
        this.score = 0;
        this.combo = 1;
        this.fouls = 0;
        this.isGameOver = false;

        this.grid.reset();
        this.shooter.reload(true);
        this.renderer.clearFX();

        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
        }

        this.updateUI();
        this.updateFoulIndicators();
        this.updateNextBubblePreview();

        if (window.soundEngine) {
            window.soundEngine.startBGM();
        }
    }

    loop(timestamp) {
        // Keyboard continuous rotation
        if (this.keys.left) {
            this.shooter.rotate(-0.04);
        }
        if (this.keys.right) {
            this.shooter.rotate(0.04);
        }

        // Projectile physics update
        if (this.shooter.projectile) {
            const snapResult = this.shooter.updateProjectile();
            if (snapResult && snapResult.snapped) {
                this.onBubbleSnapped(snapResult);
            }
        }

        // Grid & shooter updates (blinking, reload animation)
        this.grid.update();
        this.shooter.update();
        this.renderer.update();

        // Render full scene
        this.renderer.render(!this.isGameOver);

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.bubbleGame = new BubbleShooterGame();
});

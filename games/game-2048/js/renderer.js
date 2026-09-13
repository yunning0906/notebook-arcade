/**
 * Visual Effects, Particle System, and Tile DOM Renderer
 * Implements:
 * - Floating score text in pure orange (#F37021) with long hover time (~2.4s)
 * - Pastel crayon sparkles & doodle stars
 * - Milestone victory confetti
 * - Tile blinking state management & DOM tile positioning
 */

class ParticleAndFXSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.particles = [];
        this.floatingTexts = [];
        this.confetti = [];
        this.maxParticles = 50;
        this.maxConfetti = 80;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.loop();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.resetTransform && this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
        this.width = rect.width;
        this.height = rect.height;
    }

    // Spawn cute merge sparkles (pastel colored pencil dots and stars)
    spawnMergeFX(x, y, score = 0, combo = 1) {
        // Crayon dots & doodle stars (Soft Morandi / Macaron, Zero Neon)
        const colors = ['#F5D6CE', '#D4E5CC', '#F6E6BA', '#D2ECE5', '#D8C8EA', '#F7D9C8', '#97BCDB'];
        const particleCount = 7 + Math.min(combo * 3, 12);

        for (let i = 0; i < particleCount; i++) {
            if (this.particles.length >= this.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.8;
            const life = 35 + Math.random() * 25;
            const isStar = Math.random() < 0.35;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                size: isStar ? 5 + Math.random() * 4 : 3 + Math.random() * 3,
                type: isStar ? 'doodle_star' : 'crayon_dot',
                rotation: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                life: life,
                maxLife: life,
                gravity: 0.05
            });
        }

        // Floating pure vibrant orange score popup (stays ~2.4 seconds, no white border)
        if (score > 0) {
            this.floatingTexts.push({
                x: x,
                y: y - 10,
                text: `+${score}`,
                color: '#F37021', // Pure vibrant orange
                alpha: 1,
                scale: 0.6,
                targetScale: 1.15 + Math.min(combo * 0.1, 0.35),
                vy: -2.2,
                life: 140,         // ~2.33s total duration (at 60fps)
                maxLife: 140,
                fadeThreshold: 45  // Only fade in the last 0.75 seconds
            });
        }
    }

    spawnVictoryConfetti() {
        const colors = ['#F5D6CE', '#D4E5CC', '#F6E6BA', '#D2ECE5', '#D8C8EA', '#F7D9C8', '#97BCDB', '#ECA89C'];
        for (let i = 0; i < 50; i++) {
            if (this.confetti.length >= this.maxConfetti) break;
            this.confetti.push({
                x: Math.random() * this.width,
                y: -10 - Math.random() * 50,
                vx: (Math.random() - 0.5) * 2.5,
                vy: 2 + Math.random() * 3,
                width: 6 + Math.random() * 6,
                height: 9 + Math.random() * 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.12,
                alpha: 1,
                life: 130 + Math.random() * 50,
                maxLife: 180
            });
        }
    }

    update() {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity || 0;
            p.life--;
            p.alpha = p.life / p.maxLife;

            if (p.type === 'doodle_star') {
                p.rotation += p.rotSpeed;
            }

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating score texts (smooth hover up, prolonged hold)
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.vy *= 0.94; // Gentle decelerate to hover

            t.scale += (t.targetScale - t.scale) * 0.22;
            t.life--;

            // Fully solid for ~1.6 seconds, then smooth fade
            if (t.life <= t.fadeThreshold) {
                t.alpha = t.life / t.fadeThreshold;
            } else {
                t.alpha = 1.0;
            }

            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update confetti
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const c = this.confetti[i];
            c.x += c.vx + Math.sin(c.life * 0.08) * 0.6;
            c.y += c.vy;
            c.rotation += c.rotSpeed;
            c.life--;
            c.alpha = c.life / c.maxLife;

            if (c.life <= 0) {
                this.confetti.splice(i, 1);
            }
        }
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, p.alpha);

            if (p.type === 'crayon_dot') {
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, Math.max(0.5, p.size * (p.life / p.maxLife)), 0, Math.PI * 2);
                this.ctx.fill();
            } else if (p.type === 'doodle_star') {
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rotation);
                this.ctx.fillStyle = p.color;
                this.drawStarShape(this.ctx, 0, 0, 4, p.size, p.size * 0.35);
            }

            this.ctx.restore();
        }

        // 2. Draw confetti
        for (let i = 0; i < this.confetti.length; i++) {
            const c = this.confetti[i];
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, c.alpha);
            this.ctx.translate(c.x, c.y);
            this.ctx.rotate(c.rotation);
            this.ctx.fillStyle = c.color;
            this.ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
            this.ctx.restore();
        }

        // 3. Draw Floating Score Text: Pure Orange (#F37021), NO white stroke/outline
        for (let i = 0; i < this.floatingTexts.length; i++) {
            const t = this.floatingTexts[i];
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, t.alpha);
            this.ctx.translate(t.x, t.y);
            this.ctx.scale(t.scale, t.scale);

            this.ctx.font = '600 24px "Segoe UI", "Microsoft JhengHei", "微軟正黑體", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Pure Orange fill only - no white outline
            this.ctx.fillStyle = t.color;
            this.ctx.fillText(t.text, 0, 0);

            this.ctx.restore();
        }
    }

    drawStarShape(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.confetti = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }
}

/**
 * Tile Renderer & DOM Manager
 */
class TileRenderer {
    constructor(boardContainer, gridLayer, tileLayer, fxSystem) {
        this.boardContainer = boardContainer;
        this.gridLayer = gridLayer;
        this.tileLayer = tileLayer;
        this.fxSystem = fxSystem;
        this.tilesDOM = new Map(); // tile.id -> DOM element
    }

    // Build the background empty cells based on current grid size (3, 4, or 5)
    setupGrid(size) {
        this.boardContainer.className = `board-container size-${size}`;
        this.gridLayer.innerHTML = '';
        this.tileLayer.innerHTML = '';
        this.tilesDOM.clear();
        this.fxSystem.resize();

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                this.gridLayer.appendChild(cell);
            }
        }
    }

    // Calculate tile bounding position and size inside tileLayer
    getCellMetrics(size) {
        const boardRect = this.tileLayer.getBoundingClientRect();
        const totalW = boardRect.width || this.tileLayer.offsetWidth || 416;
        const totalH = boardRect.height || this.tileLayer.offsetHeight || 416;
        
        const computedGap = parseFloat(getComputedStyle(this.boardContainer).getPropertyValue('--grid-gap')) || (size === 5 ? 8 : 12);
        const cellW = (totalW - (size - 1) * computedGap) / size;
        const cellH = (totalH - (size - 1) * computedGap) / size;
        return { cellW, cellH, gap: computedGap };
    }

    getTilePosition(row, col, metrics) {
        // Try reading corresponding grid-cell directly for 100% pixel alignment
        const cell = this.gridLayer.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
        if (cell && cell.offsetWidth > 0) {
            return {
                x: cell.offsetLeft,
                y: cell.offsetTop,
                w: cell.offsetWidth,
                h: cell.offsetHeight
            };
        }
        // Fallback formula
        const x = col * (metrics.cellW + metrics.gap);
        const y = row * (metrics.cellH + metrics.gap);
        return { x, y, w: metrics.cellW, h: metrics.cellH };
    }

    // Render active tiles with transition animation
    renderTiles(tiles, size, moves = []) {
        const metrics = this.getCellMetrics(size);
        const activeIds = new Set(tiles.map(t => t.id));

        // Remove old DOM elements that no longer exist
        for (const [id, element] of this.tilesDOM.entries()) {
            if (!activeIds.has(id)) {
                element.remove();
                this.tilesDOM.delete(id);
            }
        }

        // Update or create each active tile
        tiles.forEach(tile => {
            let el = this.tilesDOM.get(tile.id);
            const pos = this.getTilePosition(tile.row, tile.col, metrics);
            const width = pos.w || metrics.cellW;
            const height = pos.h || metrics.cellH;

            if (!el) {
                // New Tile
                el = document.createElement('div');
                el.id = `tile-${tile.id}`;
                el.style.width = `${width}px`;
                el.style.height = `${height}px`;
                el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

                el.className = `tile tile-${tile.value <= 8192 ? tile.value : 'super'} ${tile.isNew ? 'tile-new' : ''} ${tile.isMerged ? 'tile-merged' : ''}`;
                if (tile.value >= 1024) {
                    el.classList.add('milestone');
                }

                // Inner content: Crisp Pure Black Number Only (No Eyes)
                el.innerHTML = `<div class="tile-number">${tile.value}</div>`;

                this.tileLayer.appendChild(el);
                this.tilesDOM.set(tile.id, el);

                // If merged, trigger cute sparkle FX on fxCanvas
                if (tile.isMerged) {
                    const centerX = pos.x + width / 2;
                    const centerY = pos.y + height / 2;
                    this.fxSystem.spawnMergeFX(centerX, centerY, tile.value, tile.combo || 1);
                }
            } else {
                // Existing Tile: update position with smooth transform
                el.style.width = `${width}px`;
                el.style.height = `${height}px`;
                el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;

                // Update classes and content if value changed
                el.className = `tile tile-${tile.value <= 8192 ? tile.value : 'super'} ${tile.isMerged ? 'tile-merged' : ''}`;
                if (tile.value >= 1024) {
                    el.classList.add('milestone');
                }
                const numEl = el.querySelector('.tile-number');
                if (numEl && numEl.textContent !== String(tile.value)) {
                    numEl.textContent = tile.value;
                }

                if (tile.isMerged) {
                    const centerX = pos.x + width / 2;
                    const centerY = pos.y + height / 2;
                    this.fxSystem.spawnMergeFX(centerX, centerY, tile.value, tile.combo || 1);
                }
            }
        });
    }

    clear() {
        this.tileLayer.innerHTML = '';
        this.tilesDOM.clear();
        this.fxSystem.clear();
    }
}

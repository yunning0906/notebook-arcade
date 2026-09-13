/**
 * Game Board Renderer, Visual Effects, Particle Sparkles,
 * Falling Orphan Bubble Physics, and Pure Orange (#F37021) Floating Scores.
 */

class GameRenderer {
    constructor(canvas, hexGrid, shooter) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = hexGrid;
        this.shooter = shooter;

        this.particles = [];
        this.floatingTexts = [];
        this.fallingBubbles = [];
        this.maxParticles = 60;

        this.dangerPulse = 0;
    }

    /**
     * Spawn cute pop sparkles and pure orange floating score
     */
    spawnPopFX(x, y, score = 0, combo = 1, colorIdx = 0) {
        const colors = ['#F49AA9', '#9CD7B5', '#9BC6F2', '#F6D673', '#C2ADE8', '#F6AE7D'];
        const count = 8 + Math.min(combo * 3, 14);

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 3.2;
            const life = 35 + Math.random() * 25;
            const isStar = Math.random() < 0.35;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.6,
                size: isStar ? 5 + Math.random() * 4 : 3 + Math.random() * 3,
                type: isStar ? 'doodle_star' : 'crayon_dot',
                rotation: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                life: life,
                maxLife: life,
                gravity: 0.06
            });
        }

        // Pure Vibrant Orange (#F37021) Floating Score - NO white stroke/border!
        // Lingers for ~2.33 seconds (140 frames at 60fps)
        if (score > 0) {
            this.floatingTexts.push({
                x: x,
                y: y - 8,
                text: `+${score}`,
                color: '#F37021', // Pure vibrant orange
                alpha: 1.0,
                scale: 0.6,
                targetScale: 1.15 + Math.min(combo * 0.12, 0.4),
                vy: -2.0,
                life: 140,        // ~2.33s total duration
                maxLife: 140,
                fadeThreshold: 45 // Only fade out in the last 0.75s
            });
        }
    }

    /**
     * Add detached orphan bubbles to falling physics list
     */
    addFallingBubbles(bubbleList) {
        bubbleList.forEach((b, idx) => {
            this.fallingBubbles.push({
                bubble: b,
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 3.5,
                vy: -2.0 - Math.random() * 3.0,
                rotation: 0,
                rotSpeed: (Math.random() - 0.5) * 0.1,
                alpha: 1.0,
                life: 70,
                maxLife: 70,
                gravity: 0.28
            });
        });
    }

    /**
     * Draw trajectory guide line with soft pencil style
     */
    drawTrajectory(points) {
        if (!points || points.length < 2) return;

        this.ctx.save();
        this.ctx.strokeStyle = '#8E7D6F';
        this.ctx.lineWidth = 2.0;
        this.ctx.setLineDash([4, 6]);

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();

        // Target landing circle indicator at final point
        const last = points[points.length - 1];
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = '#524338';
        this.ctx.lineWidth = 1.6;
        this.ctx.beginPath();
        this.ctx.arc(last.x, last.y, this.grid.radius * 0.75, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw danger deadline line
     */
    drawDangerLine(isNearDanger = false) {
        const y = this.grid.dangerLineY;
        this.ctx.save();

        if (isNearDanger) {
            this.dangerPulse += 0.08;
            const alpha = 0.5 + Math.sin(this.dangerPulse) * 0.4;
            this.ctx.strokeStyle = `rgba(255, 110, 110, ${alpha})`;
            this.ctx.lineWidth = 2.2;
        } else {
            this.ctx.strokeStyle = 'rgba(185, 168, 145, 0.45)';
            this.ctx.lineWidth = 1.6;
        }

        this.ctx.setLineDash([6, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(10, y);
        this.ctx.lineTo(this.canvas.width - 10, y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    /**
     * Draw star shape helper
     */
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
            t.vy *= 0.93; // Gentle decelerate to hover

            t.scale += (t.targetScale - t.scale) * 0.2;
            t.life--;

            // Fully solid for ~1.6s, then smooth fade in last 0.75s
            if (t.life <= t.fadeThreshold) {
                t.alpha = t.life / t.fadeThreshold;
            } else {
                t.alpha = 1.0;
            }

            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update falling orphan bubbles
        for (let i = this.fallingBubbles.length - 1; i >= 0; i--) {
            const fb = this.fallingBubbles[i];
            fb.x += fb.vx;
            fb.y += fb.vy;
            fb.vy += fb.gravity;
            fb.rotation += fb.rotSpeed;
            fb.life--;
            fb.alpha = fb.life / fb.maxLife;

            if (fb.life <= 0 || fb.y > this.canvas.height + 40) {
                this.fallingBubbles.splice(i, 1);
            }
        }
    }

    render(isAiming = true) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Danger Deadline
        let isNearDanger = false;
        for (let r = 0; r < this.grid.maxRows; r++) {
            const cols = this.grid.getCols(r);
            for (let c = 0; c < cols; c++) {
                const b = this.grid.grid[r][c];
                if (b && b.y + this.grid.radius >= this.grid.dangerLineY - 45) {
                    isNearDanger = true;
                    break;
                }
            }
            if (isNearDanger) break;
        }
        this.drawDangerLine(isNearDanger);

        // 2. Draw Trajectory Line (if not currently firing)
        if (isAiming && !this.shooter.projectile) {
            const trajectory = this.shooter.calculateTrajectory();
            this.drawTrajectory(trajectory);
        }

        // 3. Draw Grid Bubbles
        this.grid.draw(this.ctx);

        // 4. Draw Falling Orphan Bubbles
        this.fallingBubbles.forEach(fb => {
            this.ctx.save();
            this.ctx.translate(fb.x, fb.y);
            this.ctx.rotate(fb.rotation);
            // Draw cute falling bubble with scared/blinking face
            Bubble.drawBubble(this.ctx, 0, 0, this.grid.radius, fb.bubble.color, true, 1.0, fb.alpha);
            this.ctx.restore();
        });

        // 5. Draw Cannon Shooter
        this.shooter.draw(this.ctx);

        // 6. Draw Sparkles & Stars
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

        // 7. Draw Pure Orange Floating Score Texts: #F37021, NO white border/outline
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

    clearFX() {
        this.particles = [];
        this.floatingTexts = [];
        this.fallingBubbles = [];
    }
}

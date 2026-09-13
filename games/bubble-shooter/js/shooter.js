/**
 * Cannon Shooter, Dotted Aiming Trajectory with Wall Reflection,
 * Fast Projectile Physics with Sub-stepping, and Bubble Swap logic.
 */

class Shooter {
    constructor(canvasWidth, canvasHeight, hexGrid) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.grid = hexGrid;

        this.x = canvasWidth / 2;
        this.y = canvasHeight - 38;
        this.radius = hexGrid.radius;

        this.angle = -Math.PI / 2; // Default straight up (-90 deg)
        this.minAngle = -Math.PI * 0.92; // ~-165 deg
        this.maxAngle = -Math.PI * 0.08; // ~-15 deg

        this.currentBubble = null;
        this.nextBubble = null;
        this.projectile = null; // Active flying bubble
        this.reloadAnimation = 0;

        this.reload(true);
    }

    /**
     * Pick a random color from colors currently on the grid
     */
    pickColor() {
        const active = this.grid.getActiveColors();
        if (active.length > 0) {
            return active[Math.floor(Math.random() * active.length)];
        }
        return Math.floor(Math.random() * 4);
    }

    /**
     * Reload current and next bubbles
     */
    reload(initial = false) {
        if (initial) {
            this.currentBubble = new Bubble(this.pickColor());
            this.nextBubble = new Bubble(this.pickColor());
        } else {
            this.currentBubble = this.nextBubble || new Bubble(this.pickColor());
            this.nextBubble = new Bubble(this.pickColor());
        }
        this.reloadAnimation = 1.0;
    }

    /**
     * Swap current bubble with next bubble
     */
    swap() {
        if (this.projectile) return false; // Cannot swap while firing
        const temp = this.currentBubble;
        this.currentBubble = this.nextBubble;
        this.nextBubble = temp;
        this.reloadAnimation = 1.0;
        if (window.soundEngine) {
            window.soundEngine.playSwap();
        }
        return true;
    }

    /**
     * Set aim target coordinate (from mouse or touch)
     */
    aimAt(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        let ang = Math.atan2(dy, dx);

        // Clamp to allowed upper semi-circle range
        if (ang > 0) {
            ang = dx < 0 ? this.minAngle : this.maxAngle;
        } else {
            ang = Math.max(this.minAngle, Math.min(this.maxAngle, ang));
        }

        if (Math.abs(this.angle - ang) > 0.04 && window.soundEngine) {
            window.soundEngine.playAimTick();
        }

        this.angle = ang;
    }

    /**
     * Adjust aim angle with keyboard (delta in radians)
     */
    rotate(delta) {
        const newAngle = Math.max(this.minAngle, Math.min(this.maxAngle, this.angle + delta));
        if (Math.abs(this.angle - newAngle) > 0.01 && window.soundEngine) {
            window.soundEngine.playAimTick();
        }
        this.angle = newAngle;
    }

    /**
     * Fire active bubble along current angle
     */
    shoot() {
        if (this.projectile || !this.currentBubble) return null;

        const speed = 16.0;
        this.projectile = {
            bubble: this.currentBubble,
            x: this.x,
            y: this.y,
            vx: Math.cos(this.angle) * speed,
            vy: Math.sin(this.angle) * speed,
            radius: this.radius
        };

        if (window.soundEngine) {
            window.soundEngine.playShoot();
        }

        this.currentBubble = null;
        return this.projectile;
    }

    /**
     * Calculate trajectory points with wall bounces and collision preview
     */
    calculateTrajectory() {
        const points = [{ x: this.x, y: this.y }];
        let currX = this.x;
        let currY = this.y;
        let vx = Math.cos(this.angle);
        let vy = Math.sin(this.angle);
        const r = this.radius;
        const stepSize = 7.0;
        const maxSteps = 160;

        for (let i = 0; i < maxSteps; i++) {
            currX += vx * stepSize;
            currY += vy * stepSize;

            // Bounce off left wall
            if (currX - r <= 0) {
                currX = r;
                vx = -vx;
                points.push({ x: currX, y: currY });
            }
            // Bounce off right wall
            else if (currX + r >= this.width) {
                currX = this.width - r;
                vx = -vx;
                points.push({ x: currX, y: currY });
            }

            // Check collision with ceiling
            if (currY - r <= 0) {
                points.push({ x: currX, y: currY });
                break;
            }

            // Check collision with any existing bubble in grid
            let collided = false;
            for (let row = 0; row < this.grid.maxRows; row++) {
                const cols = this.grid.getCols(row);
                for (let col = 0; col < cols; col++) {
                    const b = this.grid.grid[row][col];
                    if (b !== null) {
                        const dist = Math.hypot(b.x - currX, b.y - currY);
                        if (dist <= r * 1.88) {
                            collided = true;
                            break;
                        }
                    }
                }
                if (collided) break;
            }

            if (collided) {
                points.push({ x: currX, y: currY });
                break;
            }
        }

        return points;
    }

    /**
     * Update active projectile physics and check for grid snapping
     */
    updateProjectile() {
        if (!this.projectile) return null;

        const p = this.projectile;
        const subSteps = 3;
        const r = this.radius;

        for (let s = 0; s < subSteps; s++) {
            p.x += p.vx / subSteps;
            p.y += p.vy / subSteps;

            // Left wall bounce
            if (p.x - r <= 0) {
                p.x = r;
                p.vx = -p.vx;
            }
            // Right wall bounce
            else if (p.x + r >= this.width) {
                p.x = this.width - r;
                p.vx = -p.vx;
            }

            // Check ceiling hit
            let snapNeeded = false;
            if (p.y - r <= 0) {
                snapNeeded = true;
            }

            // Check grid bubble collision
            if (!snapNeeded) {
                for (let row = 0; row < this.grid.maxRows; row++) {
                    const cols = this.grid.getCols(row);
                    for (let col = 0; col < cols; col++) {
                        const b = this.grid.grid[row][col];
                        if (b !== null) {
                            const dist = Math.hypot(b.x - p.x, b.y - p.y);
                            if (dist <= r * 1.88) {
                                snapNeeded = true;
                                break;
                            }
                        }
                    }
                    if (snapNeeded) break;
                }
            }

            if (snapNeeded) {
                // Find closest slot
                const slot = this.grid.findSnapSlot(p.x, p.y);
                const movingBubble = p.bubble;
                this.projectile = null;

                if (slot) {
                    this.grid.placeBubble(movingBubble, slot.r, slot.c);
                    if (window.soundEngine) {
                        window.soundEngine.playSnap();
                    }
                    return { snapped: true, r: slot.r, c: slot.c, bubble: movingBubble };
                } else {
                    return { snapped: false, bubble: movingBubble };
                }
            }
        }

        return null;
    }

    update() {
        if (this.currentBubble) {
            this.currentBubble.update();
        }
        if (this.nextBubble) {
            this.nextBubble.update();
        }
        if (this.reloadAnimation > 0) {
            this.reloadAnimation = Math.max(0, this.reloadAnimation - 0.08);
        }
    }

    /**
     * Draw cannon base, barrel, pointer, and loaded bubble
     */
    draw(ctx) {
        ctx.save();

        // 1. Cannon Base (Clean sketch circle, no shadow)
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 2.0;
        ctx.fillStyle = '#FFFDF9';

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. Cannon Barrel pointer
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Hand-drawn arrow indicator
        ctx.beginPath();
        ctx.moveTo(this.radius * 1.4, 0);
        ctx.lineTo(this.radius * 2.2, 0);
        ctx.lineTo(this.radius * 1.9, -6);
        ctx.moveTo(this.radius * 2.2, 0);
        ctx.lineTo(this.radius * 1.9, 6);
        ctx.stroke();

        ctx.restore();

        // 3. Current Loaded Bubble
        if (this.currentBubble) {
            const scale = 1.0 - this.reloadAnimation * 0.25;
            this.currentBubble.draw(ctx, this.x, this.y, this.radius * scale);
        }

        // 4. Flying Projectile Bubble
        if (this.projectile) {
            this.projectile.bubble.draw(ctx, this.projectile.x, this.projectile.y, this.radius);
        }

        ctx.restore();
    }
}

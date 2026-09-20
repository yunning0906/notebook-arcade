/**
 * Notebook Block Puzzle - Canvas Particle and Floating Text System
 * Renders Morandi-colored sparkling stars, gentle paper confetti,
 * expanding shockwaves, and floating celebratory combo text.
 */

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.texts = [];
        this.animating = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    // Explode sparkles & paper scraps from a cleared cell
    explodeCell(x, y, color) {
        const count = 12;
        const morandiColors = [
            color,
            '#F6D887', // Vanilla
            '#95D5B2', // Pistachio
            '#F8B4B4', // Rose
            '#95B8D1', // Mist blue
            '#CDB4DB', // Lavender
            '#FFF4D2'  // Warm glitter
        ];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 2.5 + Math.random() * 4.5;
            const chosenColor = morandiColors[Math.floor(Math.random() * morandiColors.length)];

            // Mix of sparkles, circles, and paper rectangles
            const type = Math.random() > 0.4 ? 'star' : (Math.random() > 0.5 ? 'rect' : 'circle');

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2, // slightly floating upwards
                color: chosenColor,
                size: 4 + Math.random() * 5,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.2,
                alpha: 1,
                decay: 0.016 + Math.random() * 0.018,
                gravity: 0.12,
                type: type
            });
        }

        // Add soft shockwave ring
        this.particles.push({
            x: x,
            y: y,
            radius: 4,
            maxRadius: 36,
            color: color,
            alpha: 0.8,
            decay: 0.04,
            type: 'ring'
        });

        this.start();
    }

    // Add floating score / combo text
    addFloatingText(x, y, text, color = '#2A2421', fontSize = 20, isBig = false) {
        this.texts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            fontSize: fontSize,
            isBig: isBig,
            alpha: 1,
            yOffset: 0,
            vy: -1.6,
            decay: isBig ? 0.015 : 0.022
        });
        this.start();
    }

    start() {
        if (!this.animating) {
            this.animating = true;
            requestAnimationFrame(() => this.loop());
        }
    }

    loop() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);

        // Update & draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (p.type === 'ring') {
                p.radius += (p.maxRadius - p.radius) * 0.18;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.globalAlpha = p.alpha * 0.6;
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();
                this.ctx.restore();
                continue;
            }

            // Normal particle physics
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.98;
            p.rotation += p.vRot;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = Math.max(0, p.alpha);
            this.ctx.fillStyle = p.color;

            if (p.type === 'star') {
                this._drawStar(this.ctx, 0, 0, 4, p.size, p.size * 0.45);
            } else if (p.type === 'rect') {
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        // Update & draw floating text
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.y += t.vy;
            t.vy *= 0.96;
            t.alpha -= t.decay;

            if (t.alpha <= 0) {
                this.texts.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.font = `900 ${t.fontSize}px 'Segoe UI', 'Microsoft JhengHei', sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.globalAlpha = Math.max(0, t.alpha);

            // Paper shadow
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            this.ctx.shadowBlur = 6;
            this.ctx.shadowOffsetY = 1;

            this.ctx.fillStyle = t.color;
            this.ctx.fillText(t.text, t.x, t.y);

            this.ctx.restore();
        }

        if (this.particles.length > 0 || this.texts.length > 0) {
            requestAnimationFrame(() => this.loop());
        } else {
            this.animating = false;
        }
    }

    _drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
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
}

window.ParticleSystem = ParticleSystem;

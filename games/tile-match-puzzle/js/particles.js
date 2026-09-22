/**
 * Paper Tile Match 3 - Confetti & Paper Scraps Particle Engine
 * Creates delightful, realistic paper shreds, floating stamps, and sparkle stars.
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animId = null;
        this.lastTime = 0;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'particleCanvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth * window.devicePixelRatio;
        this.canvas.height = window.innerHeight * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Burst paper shreds and sparkles at target screen coordinates (x, y)
     */
    burstAt(x, y, options = {}) {
        const count = options.count || 28;
        const colors = [
            '#FF8A80', '#FFD54F', '#81C784', '#4FC3F7', 
            '#BA68C8', '#FFB74D', '#A1887F', '#E0E0E0'
        ];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2.5 + Math.random() * 6.5;
            const isStar = Math.random() > 0.65;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (1.5 + Math.random() * 3), // Initial upward pop
                gravity: 0.18 + Math.random() * 0.08,
                drag: 0.96,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 14,
                width: 7 + Math.random() * 8,
                height: 5 + Math.random() * 7,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: 0.016 + Math.random() * 0.02,
                isStar: isStar
            });
        }

        // Add 1 gentle expanding circle ripple
        this.particles.push({
            type: 'ripple',
            x: x,
            y: y,
            radius: 8,
            maxRadius: 55,
            alpha: 0.8,
            color: '#FFB74D',
            decay: 0.035
        });

        if (!this.animId) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    }

    /**
     * Full-screen celebratory shower (Victory!)
     */
    celebrateShower() {
        const width = window.innerWidth;
        const colors = ['#FF8A80', '#FFD54F', '#81C784', '#4FC3F7', '#FFB74D', '#BA68C8'];

        for (let i = 0; i < 90; i++) {
            setTimeout(() => {
                this.particles.push({
                    x: Math.random() * width,
                    y: -20,
                    vx: (Math.random() - 0.5) * 3,
                    vy: 2 + Math.random() * 4,
                    gravity: 0.06,
                    drag: 0.98,
                    rotation: Math.random() * 360,
                    rotationSpeed: (Math.random() - 0.5) * 10,
                    width: 9 + Math.random() * 8,
                    height: 7 + Math.random() * 7,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1,
                    decay: 0.005 + Math.random() * 0.006,
                    isStar: Math.random() > 0.7
                });

                if (!this.animId) {
                    this.lastTime = performance.now();
                    this.loop(this.lastTime);
                }
            }, i * 25);
        }
    }

    loop(timestamp) {
        if (!this.ctx) return;
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            if (p.type === 'ripple') {
                p.radius += (p.maxRadius - p.radius) * 0.15;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }

                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = 2.5;
                this.ctx.globalAlpha = p.alpha;
                this.ctx.stroke();
                this.ctx.restore();
                continue;
            }

            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;

            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.alpha);

            if (p.isStar) {
                // Draw 4-point twinkle star
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                const r = p.width * 0.6;
                this.ctx.moveTo(0, -r);
                this.ctx.quadraticCurveTo(0, 0, r, 0);
                this.ctx.quadraticCurveTo(0, 0, 0, r);
                this.ctx.quadraticCurveTo(0, 0, -r, 0);
                this.ctx.quadraticCurveTo(0, 0, 0, -r);
                this.ctx.fill();
            } else {
                // Draw folded paper scrap rectangle
                this.ctx.fillStyle = p.color;
                this.ctx.strokeStyle = '#4A3728';
                this.ctx.lineWidth = 0.8;
                this.ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                this.ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
            }

            this.ctx.restore();
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame((t) => this.loop(t));
        } else {
            this.animId = null;
        }
    }
}

window.ParticleSystem = ParticleSystem;

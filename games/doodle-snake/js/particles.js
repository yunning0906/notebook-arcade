/**
 * Doodle Snake - Particle System
 * 手繪彩色鉛筆碎屑、花瓣、星星與漂浮得分文字特效
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
    }

    /**
     * 在指定像素位置迸發彩色彩屑或小花瓣
     * @param {number} x
     * @param {number} y
     * @param {string} type 'cherry' | 'strawberry' | 'bonus'
     */
    burst(x, y, type = 'cherry') {
        let colors = ['#FF8A80', '#FF5252', '#FF80AB', '#FFCDD2', '#81C784'];
        if (type === 'strawberry') {
            colors = ['#E57373', '#EF5350', '#FFCDD2', '#FFF59D', '#66BB6A'];
        } else if (type === 'bonus') {
            colors = ['#FFD54F', '#FFCA28', '#FFF59D', '#4FC3F7', '#BA68C8'];
        }

        const count = 18 + Math.floor(Math.random() * 8);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const speed = 1.5 + Math.random() * 3.5;
            const size = 3 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const isStar = type === 'bonus' && Math.random() > 0.5;

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.8, // 微微向上飄
                size,
                color,
                alpha: 1,
                decay: 0.02 + Math.random() * 0.02,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.2,
                isStar
            });
        }
    }

    /**
     * 飄浮加分文字
     * @param {number} x
     * @param {number} y
     * @param {string} text
     * @param {string} color
     */
    addText(x, y, text, color = '#E65100') {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1,
            vy: -1.2,
            scale: 0.7,
            scaleMax: 1.15
        });
    }

    update() {
        // 更新碎屑
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06; // 輕微重力
            p.vx *= 0.98;
            p.rotation += p.vRot;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 更新飄浮文字
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.alpha -= 0.022;
            if (t.scale < t.scaleMax) {
                t.scale += 0.06;
            }

            if (t.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    render(ctx) {
        ctx.save();

        // 繪製彩色鉛筆小碎屑
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = p.color;

            if (p.isStar) {
                // 畫小星星
                ctx.beginPath();
                for (let s = 0; s < 5; s++) {
                    ctx.lineTo(Math.cos((18 + s * 72) * 0.01745) * p.size, -Math.sin((18 + s * 72) * 0.01745) * p.size);
                    ctx.lineTo(Math.cos((54 + s * 72) * 0.01745) * (p.size * 0.5), -Math.sin((54 + s * 72) * 0.01745) * (p.size * 0.5));
                }
                ctx.closePath();
                ctx.fill();
            } else {
                // 畫圓形色鉛筆點或花瓣橢圓
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.65, 0, 0, Math.PI * 2);
                ctx.fill();
                // 筆觸邊框
                ctx.strokeStyle = '#524338';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
            ctx.restore();
        });

        // 繪製飄浮得分字
        this.floatingTexts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.translate(t.x, t.y);
            ctx.scale(t.scale, t.scale);

            ctx.font = 'bold 18px "Segoe UI", "Comic Sans MS", cursive, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 白色描邊提高易讀性
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 4;
            ctx.strokeText(t.text, 0, 0);

            // 主體文字
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, 0, 0);

            ctx.restore();
        });

        ctx.restore();
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
    }
}

window.ParticleSystem = ParticleSystem;

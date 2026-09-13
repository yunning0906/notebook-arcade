/**
 * Bubble definitions, pastel colored pencil palette, and facial expression renderer
 * - Borderless pure matte color fill (box-shadow: none, no black border around bubble)
 * - Small solid black dot eyes (no reflections, no blush)
 * - Natural blinking animation & hand-drawn pencil curve smile
 */

const BUBBLE_COLORS = [
    '#F49AA9', // 0: Macaron Rose Pink (法式玫瑰粉)
    '#9CD7B5', // 1: Macaron Pistachio Mint (開心果薄荷綠)
    '#9BC6F2', // 2: Macaron Powder Blue (海鹽粉藍)
    '#F6D673', // 3: Macaron Cream Lemon (香草檸檬黃)
    '#C2ADE8', // 4: Macaron Taro Lavender (芋泥薰衣草紫)
    '#F6AE7D'  // 5: Macaron Peach Apricot (杏桃奶霜橘)
];

const COLOR_NAMES = ['Rose', 'Mint', 'Blue', 'Lemon', 'Lavender', 'Peach'];

class Bubble {
    constructor(colorIdx, row = -1, col = -1) {
        this.color = colorIdx;
        this.row = row;
        this.col = col;
        this.x = 0;
        this.y = 0;
        this.scale = 1.0;
        this.alpha = 1.0;

        // Blinking state
        this.isBlinking = false;
        this.blinkTimer = 120 + Math.floor(Math.random() * 240); // Random blink every 2-6s
        this.blinkDuration = 0;
    }

    update() {
        this.blinkTimer--;
        if (this.blinkTimer <= 0) {
            this.isBlinking = true;
            this.blinkDuration = 9; // ~150ms blink
            this.blinkTimer = 180 + Math.floor(Math.random() * 300);
        }

        if (this.isBlinking) {
            this.blinkDuration--;
            if (this.blinkDuration <= 0) {
                this.isBlinking = false;
            }
        }
    }

    draw(ctx, x, y, radius) {
        Bubble.drawBubble(ctx, x, y, radius, this.color, this.isBlinking, this.scale, this.alpha);
    }

    /**
     * Static helper to draw a kawaii bubble anywhere
     */
    static drawBubble(ctx, x, y, radius, colorIdx, isBlinking = false, scale = 1.0, alpha = 1.0) {
        if (alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.translate(x, y);
        if (scale !== 1.0) {
            ctx.scale(scale, scale);
        }

        const r = radius;
        const color = BUBBLE_COLORS[colorIdx % BUBBLE_COLORS.length];

        // 1. Bubble Body: Pure Borderless Matte Color (No black stroke border, no heavy shadow)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // 2. Matte Face: Small pure solid black dot eyes (no specular reflections, no blush)
        const eyeOffsetX = r * 0.32;
        const eyeOffsetY = -r * 0.05;
        const eyeRadius = Math.max(1.8, r * 0.075);
        const pencilColor = '#222222';

        if (isBlinking) {
            // Blinking curved eye line
            ctx.strokeStyle = pencilColor;
            ctx.lineWidth = Math.max(1.5, r * 0.06);
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.arc(-eyeOffsetX, eyeOffsetY + 1, eyeRadius * 1.1, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(eyeOffsetX, eyeOffsetY + 1, eyeRadius * 1.1, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else {
            // Solid Pure Black Dots (No highlight reflections, no blush)
            ctx.fillStyle = pencilColor;

            ctx.beginPath();
            ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Hand-drawn Pencil Smile
        ctx.strokeStyle = pencilColor;
        ctx.lineWidth = Math.max(1.6, r * 0.06);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, eyeOffsetY + r * 0.22, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Doodle Snake - Food System
 * 手繪風櫻桃 (Cherries)、草莓 (Strawberry) 與金色幸運果 (Bonus Fruit)
 */

class FoodManager {
    constructor(gridSize) {
        this.gridSize = gridSize; // 網格像素大小
        this.items = []; // [{x, y, type: 'cherry'|'strawberry'|'bonus', spawnTime, scale}]
        this.bobbingAngle = 0;
    }

    /**
     * 生成新果實
     * @param {Array<{x, y}>} snakeSegments 蛇身佔用的座標列表
     * @param {number} gridWidth
     * @param {number} gridHeight
     * @param {string} forcedType
     */
    spawn(snakeSegments, gridWidth, gridHeight, forcedType = null) {
        // 尋找空閒方格
        const occupied = new Set();
        snakeSegments.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
        this.items.forEach(item => occupied.add(`${item.x},${item.y}`));

        const freeCells = [];
        for (let x = 1; x < gridWidth - 1; x++) {
            for (let y = 1; y < gridHeight - 1; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    freeCells.push({ x, y });
                }
            }
        }

        if (freeCells.length === 0) return null;

        const cell = freeCells[Math.floor(Math.random() * freeCells.length)];

        // 決定果實種類 (70% 櫻桃，25% 草莓，5% 金色幸運果)
        let type = forcedType;
        if (!type) {
            const rand = Math.random();
            if (rand < 0.65) type = 'cherry';
            else if (rand < 0.92) type = 'strawberry';
            else type = 'bonus';
        }

        const foodItem = {
            x: cell.x,
            y: cell.y,
            type: type,
            spawnTime: Date.now(),
            scale: 0.1, // 剛出現時從小放大
            points: type === 'cherry' ? 10 : (type === 'strawberry' ? 20 : 35),
            bobOffset: Math.random() * Math.PI * 2
        };

        this.items.push(foodItem);
        return foodItem;
    }

    /**
     * 檢查蛇頭是否吃到果實
     * @param {{x, y}} head
     * @returns {Object|null}
     */
    checkCollision(head) {
        const idx = this.items.findIndex(item => item.x === head.x && item.y === head.y);
        if (idx !== -1) {
            const eaten = this.items[idx];
            this.items.splice(idx, 1);
            return eaten;
        }
        return null;
    }

    update() {
        this.bobbingAngle += 0.05;

        // 彈跳放大入場
        this.items.forEach(item => {
            if (item.scale < 1) {
                item.scale += (1 - item.scale) * 0.25;
                if (item.scale > 0.98) item.scale = 1;
            }
        });
    }

    /**
     * 繪製所有手繪果實
     * @param {CanvasRenderingContext2D} ctx
     */
    render(ctx) {
        this.items.forEach(item => {
            const centerX = item.x * this.gridSize + this.gridSize / 2;
            // 輕微上下浮動 (紙上微風呼吸感)
            const bobY = Math.sin(this.bobbingAngle + item.bobOffset) * 2.5;
            const centerY = item.y * this.gridSize + this.gridSize / 2 + bobY;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(item.scale, item.scale);

            // 柔和手繪底影 (Paper Drop Shadow)
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, this.gridSize * 0.42 - bobY * 0.5, this.gridSize * 0.35, this.gridSize * 0.15, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(82, 67, 56, 0.14)';
            ctx.fill();
            ctx.restore();

            if (item.type === 'cherry') {
                this._renderCherry(ctx);
            } else if (item.type === 'strawberry') {
                this._renderStrawberry(ctx);
            } else if (item.type === 'bonus') {
                this._renderBonusFruit(ctx);
            }

            ctx.restore();
        });
    }

    /**
     * 繪製手繪雙櫻桃 (Cherries)
     */
    _renderCherry(ctx) {
        const r = this.gridSize * 0.28;
        const stemTopX = 0;
        const stemTopY = -r * 1.5;
        const leftX = -r * 0.72;
        const leftY = r * 0.45;
        const rightX = r * 0.75;
        const rightY = r * 0.2;

        // 1. 綠色果梗與小嫩葉
        ctx.strokeStyle = '#558B2F';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';

        // 左梗 (自然弧線)
        ctx.beginPath();
        ctx.moveTo(stemTopX, stemTopY);
        ctx.quadraticCurveTo(-r * 0.3, -r * 0.5, leftX, leftY - r * 0.5);
        ctx.stroke();

        // 右梗
        ctx.beginPath();
        ctx.moveTo(stemTopX, stemTopY);
        ctx.quadraticCurveTo(r * 0.5, -r * 0.4, rightX, rightY - r * 0.5);
        ctx.stroke();

        // 梗頂端連接點
        ctx.beginPath();
        ctx.arc(stemTopX, stemTopY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#33691E';
        ctx.fill();

        // 小綠葉 (手繪粉彩葉片)
        ctx.save();
        ctx.translate(stemTopX + 2, stemTopY + 2);
        ctx.rotate(0.35);
        ctx.beginPath();
        ctx.ellipse(6, -2, 7, 3.8, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#81C784';
        ctx.fill();
        ctx.strokeStyle = '#33691E';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // 2. 左櫻桃主體
        this._drawCherryGlobe(ctx, leftX, leftY, r);

        // 3. 右櫻桃主體
        this._drawCherryGlobe(ctx, rightX, rightY, r);
    }

    _drawCherryGlobe(ctx, cx, cy, r) {
        ctx.save();
        // 柔和粉彩紅底色
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5252';
        ctx.fill();

        // 頂部小凹槽
        ctx.beginPath();
        ctx.arc(cx, cy - r * 0.85, 2.5, 0, Math.PI);
        ctx.strokeStyle = '#7f0000';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 柔亮高光 (Watercolor Shine)
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        // 第二小高光點
        ctx.beginPath();
        ctx.arc(cx - r * 0.15, cy - r * 0.5, r * 0.14, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // 手繪鉛筆邊框
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 繪製手繪草莓 (Strawberry)
     */
    _renderStrawberry(ctx) {
        const s = this.gridSize * 0.72;

        ctx.save();
        ctx.translate(0, 2);

        // 1. 草莓果肉輪廓 (心型圓滑倒三角)
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.32);
        ctx.bezierCurveTo(s * 0.45, -s * 0.35, s * 0.5, s * 0.1, 0, s * 0.48);
        ctx.bezierCurveTo(-s * 0.5, s * 0.1, -s * 0.45, -s * 0.35, 0, -s * 0.32);
        ctx.closePath();

        // 草莓紅漸層
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();

        // 柔光反射
        ctx.beginPath();
        ctx.ellipse(-s * 0.18, -s * 0.08, s * 0.12, s * 0.22, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        // 邊框
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // 2. 草莓小金籽點 (Seeds)
        const seedCoords = [
            [-0.15, 0.05], [0.15, 0.05], [0, 0.22],
            [-0.22, -0.15], [0.22, -0.15], [0, -0.1]
        ];
        seedCoords.forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.ellipse(sx * s, sy * s, 1.4, 2.2, 0.1, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF59D';
            ctx.fill();
            ctx.strokeStyle = '#BF360C';
            ctx.lineWidth = 0.6;
            ctx.stroke();
        });

        // 3. 頂部草莓綠萼 (Green Calyx)
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.32);
        // 5片小葉片
        const leaves = [-0.35, -0.18, 0, 0.18, 0.35];
        leaves.forEach(lx => {
            ctx.lineTo(lx * s, -s * 0.48 - Math.abs(lx) * s * 0.15);
            ctx.lineTo(lx * s * 0.6, -s * 0.32);
        });
        ctx.fillStyle = '#66BB6A';
        ctx.fill();
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 小短梗
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.38);
        ctx.lineTo(1, -s * 0.58);
        ctx.strokeStyle = '#33691E';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 繪製金色幸運星果 (Lucky Bonus Fruit)
     */
    _renderBonusFruit(ctx) {
        const r = this.gridSize * 0.38;

        ctx.save();
        // 閃爍外光暈
        ctx.beginPath();
        ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 238, 88, 0.35)';
        ctx.fill();

        // 金黃星星本體
        ctx.beginPath();
        for (let s = 0; s < 5; s++) {
            const outAngle = (18 + s * 72) * (Math.PI / 180);
            const inAngle = (54 + s * 72) * (Math.PI / 180);
            ctx.lineTo(Math.cos(outAngle) * r, -Math.sin(outAngle) * r);
            ctx.lineTo(Math.cos(inAngle) * (r * 0.52), -Math.sin(inAngle) * (r * 0.52));
        }
        ctx.closePath();
        ctx.fillStyle = '#FFD54F';
        ctx.fill();

        // 星星邊框
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 星星萌臉 (大眼微笑)
        ctx.beginPath();
        ctx.arc(-r * 0.2, -r * 0.08, 1.8, 0, Math.PI * 2);
        ctx.arc(r * 0.2, -r * 0.08, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#524338';
        ctx.fill();

        // 腮紅
        ctx.beginPath();
        ctx.arc(-r * 0.28, r * 0.1, 2, 0, Math.PI * 2);
        ctx.arc(r * 0.28, r * 0.1, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8A80';
        ctx.fill();

        ctx.restore();
    }

    clear() {
        this.items = [];
    }
}

window.FoodManager = FoodManager;

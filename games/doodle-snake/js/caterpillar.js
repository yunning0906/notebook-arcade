/**
 * Doodle Snake - Cute Pastel Caterpillar (手繪粉彩毛毛蟲)
 * 特色：
 * 1. 糖果粉彩圓點連綴而成 (Pastel Circles)
 * 2. 蠕動彈性動態 (Squish & Stretch / Smooth Crawling)
 * 3. 靈動大眼睛 (跟隨前進方向看、偶發可愛眨眼)
 * 4. 粉嫩腮紅、微笑表情與晃動的雙觸角
 * 5. 吃掉果子時身體各節依次膨脹傳遞的吞嚥波浪
 */

class Caterpillar {
    constructor(gridSize) {
        this.gridSize = gridSize;

        // 柔和糖果粉彩配色盤
        this.palette = [
            '#A8E6CF', // 薄荷嫩綠 (頭部預設基調)
            '#FFD3B6', // 蜜桃粉橘
            '#FFAAA6', // 櫻花柔粉
            '#FFF4A3', // 奶油粉黃
            '#BFE3F7', // 晴空粉藍
            '#D5C6E8'  // 薰衣草紫
        ];

        // 網格座標陣列：[head, body1, body2, ..., tail]
        this.segments = [];
        // 前一個位置陣列 (用於幀間平滑插值滑行)
        this.prevSegments = [];

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        // 表情狀態
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.antennaWobble = 0;

        // 消化波浪效果 (吃東西時圓點依序放大)
        this.bulges = []; // [{segmentIndex: 0, scale: 1.35, progress: 0}]

        // 步調計時器
        this.crawlPhase = 0;
    }

    /**
     * 重設毛毛蟲初始狀態
     * @param {number} startX
     * @param {number} startY
     * @param {number} initialLength
     */
    reset(startX = 6, startY = 8, initialLength = 4) {
        this.segments = [];
        this.prevSegments = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        for (let i = 0; i < initialLength; i++) {
            const pos = { x: startX - i, y: startY };
            this.segments.push({ ...pos });
            this.prevSegments.push({ ...pos });
        }

        this.bulges = [];
        this.blinkTimer = 0;
        this.isBlinking = false;
    }

    /**
     * 設定轉向（包含防止反向倒退自撞）
     */
    setDirection(dx, dy) {
        // 不能直接轉向 180 度 (除非長度只有 1)
        if (this.segments.length > 1) {
            if (this.direction.x + dx === 0 && this.direction.y + dy === 0) {
                return false;
            }
        }
        // 如果方向未改變，忽略
        if (this.nextDirection.x === dx && this.nextDirection.y === dy) {
            return false;
        }

        this.nextDirection = { x: dx, y: dy };
        return true;
    }

    /**
     * 單步格點前進
     * @param {boolean} grow 是否吃了果實身體變長
     * @param {boolean} wrapMode 是否穿越邊界
     * @param {number} gridWidth
     * @param {number} gridHeight
     * @returns {{x, y}} 新的蛇頭座標
     */
    step(grow = false, wrapMode = true, gridWidth = 20, gridHeight = 20) {
        this.direction = { ...this.nextDirection };

        // 記錄舊位置以供平滑動畫插值
        this.prevSegments = this.segments.map(seg => ({ ...seg }));

        // 計算新頭部位置
        let newX = this.segments[0].x + this.direction.x;
        let newY = this.segments[0].y + this.direction.y;

        if (wrapMode) {
            if (newX < 0) newX = gridWidth - 1;
            else if (newX >= gridWidth) newX = 0;
            if (newY < 0) newY = gridHeight - 1;
            else if (newY >= gridHeight) newY = 0;
        }

        const newHead = { x: newX, y: newY };
        this.segments.unshift(newHead);

        if (!grow) {
            this.segments.pop();
        } else {
            // 吃到東西，在頭部觸發一個消化膨脹波
            this.bulges.push({ segmentIndex: 0, life: 1 });
            // 舊位置對應補上尾端
            const lastPrev = this.prevSegments[this.prevSegments.length - 1];
            this.prevSegments.push({ ...lastPrev });
        }

        // 更新消化膨脹波浪往下傳遞
        for (let i = this.bulges.length - 1; i >= 0; i--) {
            const b = this.bulges[i];
            b.segmentIndex += 1;
            if (b.segmentIndex >= this.segments.length) {
                this.bulges.splice(i, 1);
            }
        }

        return newHead;
    }

    /**
     * 每幀更新動畫狀態
     * @param {number} deltaTime
     */
    update(deltaTime = 0.016) {
        // 觸角微晃動
        this.antennaWobble += 0.12;

        // 隨機眨眼機制 (每 3~5 秒眨眼一次)
        this.blinkTimer += deltaTime;
        if (!this.isBlinking && this.blinkTimer > 2.8 + Math.random() * 2) {
            this.isBlinking = true;
            this.blinkTimer = 0;
        } else if (this.isBlinking && this.blinkTimer > 0.18) {
            this.isBlinking = false;
            this.blinkTimer = 0;
        }
    }

    /**
     * 平滑插值繪製毛毛蟲
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} progress 本次網格步調行進進度 (0.0 ~ 1.0)
     * @param {boolean} wrapMode
     * @param {number} gridWidth
     * @param {number} gridHeight
     */
    render(ctx, progress = 1.0, wrapMode = true, gridWidth = 20, gridHeight = 20) {
        if (this.segments.length === 0) return;

        // 計算各節平滑插值像素座標
        const interpolated = [];
        for (let i = 0; i < this.segments.length; i++) {
            const curr = this.segments[i];
            const prev = this.prevSegments[i] || curr;

            // 處理穿牆模式跨界問題 (如果距離超過 1 格，直接不插值防止飛過整個螢幕)
            let dx = curr.x - prev.x;
            let dy = curr.y - prev.y;

            if (wrapMode) {
                if (Math.abs(dx) > 1) dx = dx > 0 ? -1 : 1;
                if (Math.abs(dy) > 1) dy = dy > 0 ? -1 : 1;
            }

            const interpX = (prev.x + dx * progress) * this.gridSize + this.gridSize / 2;
            const interpY = (prev.y + dy * progress) * this.gridSize + this.gridSize / 2;

            interpolated.push({ x: interpX, y: interpY });
        }

        // 柔和陰影 (Paper Drop Shadow)
        ctx.save();
        for (let i = interpolated.length - 1; i >= 0; i--) {
            const p = interpolated[i];
            const r = (this.gridSize * 0.44) * (i === 0 ? 1.08 : (i === interpolated.length - 1 ? 0.75 : 0.95));
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 3.5, r * 0.95, r * 0.45, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(82, 67, 56, 0.12)';
            ctx.fill();
        }
        ctx.restore();

        // 繪製身體 (從尾巴往頭部畫，確保頭部在最上層)
        for (let i = interpolated.length - 1; i >= 1; i--) {
            const curr = interpolated[i];
            const prev = interpolated[i - 1];
            this._renderBodySegment(ctx, curr, prev, i, interpolated.length);
        }

        // 繪製毛毛蟲頭部
        this._renderHead(ctx, interpolated[0], this.direction);
    }

    /**
     * 繪製毛毛蟲身體單節圓點與小短腿
     */
    _renderBodySegment(ctx, pt, nextPt, index, totalLength) {
        const color = this.palette[index % this.palette.length];

        // 檢查是否有吞嚥波浪膨脹
        let scale = 1.0;
        const bulge = this.bulges.find(b => b.segmentIndex === index);
        if (bulge) scale = 1.28;

        // 尾端自然收尖縮小
        if (index === totalLength - 1) {
            scale *= 0.72;
        } else if (index === totalLength - 2) {
            scale *= 0.88;
        }

        const radius = (this.gridSize * 0.42) * scale;

        ctx.save();
        ctx.translate(pt.x, pt.y);

        // 身體微小可愛的小腳 (Caterpillar Tiny Feet)
        const angle = Math.atan2(nextPt.y - pt.y, nextPt.x - pt.x);
        const footDist = radius * 0.85;
        const footWobble = Math.sin(this.antennaWobble * 2 + index) * 2;

        ctx.save();
        ctx.rotate(angle);
        // 左腳與右腳
        ctx.beginPath();
        ctx.arc(footWobble, -footDist, 3.2, 0, Math.PI * 2);
        ctx.arc(-footWobble, footDist, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFB74D';
        ctx.fill();
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // 身體粉彩圓點本體
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // 柔和水彩光澤 (Watercolor Glow)
        ctx.beginPath();
        ctx.arc(-radius * 0.28, -radius * 0.28, radius * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();

        // 手繪色鉛筆手感輪廓
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 繪製毛毛蟲頭部 (靈動萌眼、觸角、腮紅與笑容)
     */
    _renderHead(ctx, pt, dir) {
        const radius = this.gridSize * 0.48;
        const headColor = this.palette[0]; // 薄荷粉綠

        ctx.save();
        ctx.translate(pt.x, pt.y);

        // 1. 雙觸角 (Antennae)
        const wobble = Math.sin(this.antennaWobble) * 4;
        this._renderAntenna(ctx, -radius * 0.45, -radius * 0.7, -0.3 + wobble * 0.05, radius);
        this._renderAntenna(ctx, radius * 0.45, -radius * 0.7, 0.3 - wobble * 0.05, radius);

        // 2. 頭部圓形本體
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = headColor;
        ctx.fill();

        // 頂部高光
        ctx.beginPath();
        ctx.arc(-radius * 0.25, -radius * 0.3, radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // 鉛筆邊框
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // 3. 視線微移 (Eyes Look In Movement Direction)
        const eyeLookX = dir.x * 2.8;
        const eyeLookY = dir.y * 2.8;
        const eyeSpacing = radius * 0.38;
        const eyeY = -radius * 0.12;
        const eyeR = radius * 0.22;

        if (this.isBlinking) {
            // 眨眼閉眼弧線 (^ ^)
            ctx.strokeStyle = '#524338';
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';

            // 左眼
            ctx.beginPath();
            ctx.arc(-eyeSpacing + eyeLookX, eyeY + eyeLookY, eyeR * 0.9, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

            // 右眼
            ctx.beginPath();
            ctx.arc(eyeSpacing + eyeLookX, eyeY + eyeLookY, eyeR * 0.9, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();
        } else {
            // 睜開的大眼睛
            this._drawEye(ctx, -eyeSpacing + eyeLookX, eyeY + eyeLookY, eyeR, dir);
            this._drawEye(ctx, eyeSpacing + eyeLookX, eyeY + eyeLookY, eyeR, dir);
        }

        // 4. 粉嫩腮紅 (Rosy Cheeks)
        ctx.beginPath();
        ctx.arc(-radius * 0.55, radius * 0.18, radius * 0.16, 0, Math.PI * 2);
        ctx.arc(radius * 0.55, radius * 0.18, radius * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 138, 128, 0.65)';
        ctx.fill();

        // 5. 可愛微笑 (Happy Mouth)
        ctx.beginPath();
        ctx.arc(eyeLookX * 0.5, radius * 0.24 + eyeLookY * 0.5, radius * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
    }

    _drawEye(ctx, ex, ey, er, dir) {
        ctx.save();
        // 眼睛眼白
        ctx.beginPath();
        ctx.arc(ex, ey, er, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 黑色眼珠 (瞳孔偏向視線)
        const pupilR = er * 0.65;
        const px = ex + dir.x * 1.5;
        const py = ey + dir.y * 1.5;
        ctx.beginPath();
        ctx.arc(px, py, pupilR, 0, Math.PI * 2);
        ctx.fillStyle = '#3E2723';
        ctx.fill();

        // 瞳孔白色大高光點 (少女動漫水汪汪大眼)
        ctx.beginPath();
        ctx.arc(px - pupilR * 0.35, py - pupilR * 0.35, pupilR * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // 第二小高光點
        ctx.beginPath();
        ctx.arc(px + pupilR * 0.3, py + pupilR * 0.3, pupilR * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.restore();
    }

    _renderAntenna(ctx, ax, ay, baseAngle, headRadius) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(baseAngle);

        const len = headRadius * 0.62;

        // 彎曲觸角梗
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.2, -len * 0.5, 0, -len);
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // 觸角頂端可愛粉彩小球球
        ctx.beginPath();
        ctx.arc(0, -len, headRadius * 0.16, 0, Math.PI * 2);
        ctx.fillStyle = '#FF8A80';
        ctx.fill();
        ctx.strokeStyle = '#524338';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        ctx.restore();
    }
}

window.Caterpillar = Caterpillar;

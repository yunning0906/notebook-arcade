/**
 * Doodle Snake - Main Game Controller (手繪毛毛蟲貪吃蛇)
 */

class DoodleSnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // 網格設定
        this.gridSize = 28; // 每格像素 (預設基準)
        this.cols = 20;
        this.rows = 20;

        // 子系統
        this.audio = window.snakeAudio;
        this.caterpillar = new Caterpillar(this.gridSize);
        this.food = new FoodManager(this.gridSize);
        this.particles = new ParticleSystem();

        // 遊戲狀態
        this.state = 'ready'; // 'ready' | 'playing' | 'paused' | 'gameover'
        this.score = 0;
        this.bestScore = 0;
        this.cherriesCount = 0;
        this.strawberriesCount = 0;

        // 步調與速度控制 (溫暖慢速紙上漫步)
        // 'stroll': 220ms, 'wander': 165ms, 'brisk': 120ms
        this.speedMode = 'wander';
        this.speedIntervals = {
            stroll: 230,
            wander: 170,
            brisk: 125
        };
        this.stepInterval = this.speedIntervals[this.speedMode];

        // 邊界模式：true = 穿牆自由漫步 (Infinite Wrap), false = 方格紙邊框邊界 (Notebook Margin)
        this.wrapMode = true;

        // 時間推進
        this.lastTime = 0;
        this.accumulator = 0;

        // 輸入緩衝隊列 (防止快速連按轉向自撞)
        this.inputQueue = [];

        // UI 元素
        this._initDOMElements();
        this._loadStorage();
        this._setupEventListeners();
        this._resizeCanvas();

        // 初始繪製
        this.resetGame();
        this._renderInitialScreen();

        if (new URLSearchParams(window.location.search).get('demo') === '1') {
            if (this.elStartHint) this.elStartHint.style.display = 'none';
            this.state = 'playing';
            this.score = 380;
            this.bestScore = 520;
            this.cherriesCount = 12;
            this.strawberriesCount = 5;
            if (this.elCurrentScore) this.elCurrentScore.textContent = '380';
            if (this.elBestScore) this.elBestScore.textContent = '520';
            if (this.elCherryCount) this.elCherryCount.textContent = '12';
            if (this.elStrawberryCount) this.elStrawberryCount.textContent = '5';
            this.caterpillar.segments = [
                { x: 12, y: 8 },
                { x: 11, y: 8 },
                { x: 10, y: 8 },
                { x: 10, y: 9 },
                { x: 10, y: 10 },
                { x: 9, y: 10 },
                { x: 8, y: 10 },
                { x: 7, y: 10 }
            ];
            this.caterpillar.prevSegments = JSON.parse(JSON.stringify(this.caterpillar.segments));
            this.caterpillar.direction = { x: 1, y: 0 };
            this.food.items = [
                { x: 15, y: 8, type: 'cherry', spawnTime: Date.now() - 5000, scale: 1, points: 10, bobOffset: 0 },
                { x: 6, y: 5, type: 'strawberry', spawnTime: Date.now() - 5000, scale: 1, points: 20, bobOffset: 0 },
                { x: 14, y: 14, type: 'cherry', spawnTime: Date.now() - 5000, scale: 1, points: 10, bobOffset: 0 }
            ];
            this._render(1.0);
        }

        // 啟動動畫幀循環
        requestAnimationFrame((t) => this._loop(t));
    }

    _initDOMElements() {
        this.elCurrentScore = document.getElementById('currentScore');
        this.elBestScore = document.getElementById('bestScore');
        this.elCherryCount = document.getElementById('cherryCount');
        this.elStrawberryCount = document.getElementById('strawberryCount');

        this.elBtnPause = document.getElementById('btnPause');
        this.elBtnRestart = document.getElementById('btnRestart');
        this.elSoundToggle = document.getElementById('soundToggle');
        this.elBgmToggle = document.getElementById('bgmToggle');

        this.elGameOverModal = document.getElementById('gameOverModal');
        this.elFinalScore = document.getElementById('finalScore');
        this.elFinalBest = document.getElementById('finalBest');
        this.elBtnPlayAgain = document.getElementById('btnPlayAgain');

        this.elPauseOverlay = document.getElementById('pauseOverlay');
        this.elStartHint = document.getElementById('startHint');

        // 速度切換按鈕
        this.speedButtons = document.querySelectorAll('.speed-btn');
        // 邊界模式切換按鈕
        this.wallButtons = document.querySelectorAll('.wall-mode-btn');
    }

    _loadStorage() {
        try {
            const savedBest = localStorage.getItem('doodle_snake_best_score');
            if (savedBest) {
                this.bestScore = parseInt(savedBest, 10) || 0;
                this.elBestScore.textContent = this.bestScore;
            }
            const savedSpeed = localStorage.getItem('doodle_snake_speed');
            if (savedSpeed && this.speedIntervals[savedSpeed]) {
                this.setSpeedMode(savedSpeed);
            }
            const savedWrap = localStorage.getItem('doodle_snake_wrap');
            if (savedWrap !== null) {
                this.setWrapMode(savedWrap === 'true');
            }
        } catch (e) {}
    }

    _saveStorage() {
        try {
            localStorage.setItem('doodle_snake_best_score', this.bestScore);
            localStorage.setItem('doodle_snake_speed', this.speedMode);
            localStorage.setItem('doodle_snake_wrap', this.wrapMode);
        } catch (e) {}
    }

    _setupEventListeners() {
        // 視窗縮放
        window.addEventListener('resize', () => {
            this._resizeCanvas();
        });

        // 鍵盤控制
        window.addEventListener('keydown', (e) => {
            // 空白鍵暫停/繼續
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
                return;
            }

            // 方向控制
            let dir = null;
            switch (e.key) {
                case 'ArrowUp':
                case 'KeyW':
                case 'w':
                case 'W':
                    dir = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                case 'KeyS':
                case 's':
                case 'S':
                    dir = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                case 'a':
                case 'A':
                    dir = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                case 'KeyD':
                case 'd':
                case 'D':
                    dir = { x: 1, y: 0 };
                    break;
                case 'KeyR':
                case 'r':
                case 'R':
                    this.resetGame();
                    this.startGame();
                    return;
            }

            if (dir) {
                e.preventDefault();
                if (this.state === 'ready') {
                    this.startGame();
                } else if (this.state === 'paused') {
                    this.togglePause();
                }
                this._queueDirection(dir);
            }
        });

        // 虛擬 D-pad 控制按鈕
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        dpadButtons.forEach(btn => {
            const handleDirectionPress = (e) => {
                e.preventDefault();
                const dirType = btn.getAttribute('data-dir');
                let dir = null;
                if (dirType === 'up') dir = { x: 0, y: -1 };
                else if (dirType === 'down') dir = { x: 0, y: 1 };
                else if (dirType === 'left') dir = { x: -1, y: 0 };
                else if (dirType === 'right') dir = { x: 1, y: 0 };

                if (dir) {
                    if (this.state === 'ready') this.startGame();
                    else if (this.state === 'paused') this.togglePause();
                    this._queueDirection(dir);
                }
            };
            btn.addEventListener('pointerdown', handleDirectionPress);
        });

        // 手勢滑動支援 (Swipe)
        let touchStartX = 0;
        let touchStartY = 0;
        const canvasContainer = document.querySelector('.canvas-container');

        canvasContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        canvasContainer.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const dx = e.changedTouches[0].clientX - touchStartX;
                const dy = e.changedTouches[0].clientY - touchStartY;
                const minSwipe = 24;

                if (Math.abs(dx) > minSwipe || Math.abs(dy) > minSwipe) {
                    let dir = null;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        dir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
                    } else {
                        dir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
                    }

                    if (dir) {
                        if (this.state === 'ready') this.startGame();
                        else if (this.state === 'paused') this.togglePause();
                        this._queueDirection(dir);
                    }
                }
            }
        }, { passive: true });

        // 速度切換
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playPaperClick();
                const mode = btn.getAttribute('data-speed');
                this.setSpeedMode(mode);
            });
        });

        // 邊界模式切換
        this.wallButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.audio.playPaperClick();
                const wrap = btn.getAttribute('data-wrap') === 'true';
                this.setWrapMode(wrap);
            });
        });

        // 按鈕控制
        this.elBtnPause.addEventListener('click', () => {
            this.audio.playPaperClick();
            this.togglePause();
        });

        this.elBtnRestart.addEventListener('click', () => {
            this.audio.playPaperClick();
            this.resetGame();
            this.startGame();
        });

        this.elBtnPlayAgain.addEventListener('click', () => {
            this.audio.playPaperClick();
            this.elGameOverModal.classList.add('hidden');
            this.resetGame();
            this.startGame();
        });

        // 音效開關
        this.elSoundToggle.addEventListener('click', () => {
            const muted = this.audio.toggleMute();
            this._updateSoundIcons(muted);
        });

        // 背景音樂開關
        this.elBgmToggle.addEventListener('click', () => {
            this.audio.playPaperClick();
            const bgmOn = this.audio.toggleBgm();
            this._updateBgmIcons(bgmOn);
        });

        // 點擊畫布若在 ready 狀態則開始
        this.canvas.addEventListener('click', () => {
            if (this.state === 'ready') {
                this.startGame();
            }
        });
    }

    _resizeCanvas() {
        const wrapper = document.querySelector('.canvas-card');
        if (!wrapper) return;

        // 計算最適方格大小
        const maxW = Math.min(wrapper.clientWidth - 32, 560);
        const maxH = Math.min(window.innerHeight - 340, 560);
        const size = Math.max(300, Math.min(maxW, maxH));

        this.cols = 18;
        this.rows = 18;
        this.gridSize = Math.floor(size / this.cols);

        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = (this.cols * this.gridSize) * dpr;
        this.canvas.height = (this.rows * this.gridSize) * dpr;
        this.canvas.style.width = `${this.cols * this.gridSize}px`;
        this.canvas.style.height = `${this.rows * this.gridSize}px`;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 重設
        this.ctx.scale(dpr, dpr);

        // 同步各子模組的格子尺寸
        this.caterpillar.gridSize = this.gridSize;
        this.food.gridSize = this.gridSize;
    }

    _queueDirection(dir) {
        if (this.inputQueue.length >= 2) return; // 緩衝上限 2 個輸入

        const lastDir = this.inputQueue.length > 0 
            ? this.inputQueue[this.inputQueue.length - 1] 
            : this.caterpillar.nextDirection;

        // 不允許 180 度直接掉頭
        if (lastDir.x + dir.x === 0 && lastDir.y + dir.y === 0) {
            return;
        }

        // 不重複相同方向
        if (lastDir.x === dir.x && lastDir.y === dir.y) {
            return;
        }

        this.inputQueue.push(dir);

        // 立即觸發轉彎的彈性水滴噗嚕音！
        this.audio.playTurnSound();
    }

    setSpeedMode(mode) {
        if (!this.speedIntervals[mode]) return;
        this.speedMode = mode;
        this.stepInterval = this.speedIntervals[mode];
        this.speedButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-speed') === mode);
        });
        this._saveStorage();
    }

    setWrapMode(wrap) {
        this.wrapMode = wrap;
        this.wallButtons.forEach(btn => {
            btn.classList.toggle('active', (btn.getAttribute('data-wrap') === 'true') === wrap);
        });
        this._saveStorage();
    }

    _updateSoundIcons(muted) {
        const onIcon = this.elSoundToggle.querySelector('.icon-sound-on');
        const offIcon = this.elSoundToggle.querySelector('.icon-sound-off');
        if (onIcon && offIcon) {
            onIcon.classList.toggle('hidden', muted);
            offIcon.classList.toggle('hidden', !muted);
        }
    }

    _updateBgmIcons(bgmOn) {
        const onIcon = this.elBgmToggle.querySelector('.icon-bgm-on');
        const offIcon = this.elBgmToggle.querySelector('.icon-bgm-off');
        if (onIcon && offIcon) {
            onIcon.classList.toggle('hidden', !bgmOn);
            offIcon.classList.toggle('hidden', bgmOn);
        }
    }

    resetGame() {
        this.state = 'ready';
        this.score = 0;
        this.cherriesCount = 0;
        this.strawberriesCount = 0;
        this.accumulator = 0;
        this.inputQueue = [];

        this._updateScoreUI();

        // 重新初始化毛毛蟲與食物
        const startX = Math.floor(this.cols * 0.35);
        const startY = Math.floor(this.rows * 0.5);
        this.caterpillar.reset(startX, startY, 4);

        this.food.clear();
        this.particles.clear();

        // 生成初始 2 顆果實 (一顆櫻桃、一顆草莓)
        this.food.spawn(this.caterpillar.segments, this.cols, this.rows, 'cherry');
        this.food.spawn(this.caterpillar.segments, this.cols, this.rows, 'strawberry');

        this.elGameOverModal.classList.add('hidden');
        this.elPauseOverlay.classList.add('hidden');
        this.elStartHint.classList.remove('hidden');
    }

    startGame() {
        if (this.state === 'playing') return;
        this.state = 'playing';
        this.elStartHint.classList.add('hidden');
        this.elPauseOverlay.classList.add('hidden');

        this.audio.init();
        if (this.audio.bgmEnabled && !this.audio.isMuted) {
            this.audio.startBgm();
        }
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.elPauseOverlay.classList.remove('hidden');
            this.elBtnPause.querySelector('span').textContent = '繼續 (RESUME)';
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.elPauseOverlay.classList.add('hidden');
            this.elBtnPause.querySelector('span').textContent = '暫停 (PAUSE)';
        }
    }

    _updateScoreUI() {
        this.elCurrentScore.textContent = this.score;
        this.elCherryCount.textContent = this.cherriesCount;
        this.elStrawberryCount.textContent = this.strawberriesCount;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.elBestScore.textContent = this.bestScore;
            this._saveStorage();
        }
    }

    /**
     * 核心邏輯步進 (每隔 stepInterval ms 執行一次)
     */
    _gameStep() {
        // 從輸入緩衝隊列取出下一個方向
        if (this.inputQueue.length > 0) {
            const nextDir = this.inputQueue.shift();
            this.caterpillar.setDirection(nextDir.x, nextDir.y);
        }

        // 預檢測是否會撞牆 (在非穿牆模式下)
        if (!this.wrapMode) {
            const head = this.caterpillar.segments[0];
            const nextX = head.x + this.caterpillar.nextDirection.x;
            const nextY = head.y + this.caterpillar.nextDirection.y;
            if (nextX < 0 || nextX >= this.cols || nextY < 0 || nextY >= this.rows) {
                this._handleGameOver('撞到筆記本邊界啦！');
                return;
            }
        }

        // 預測新頭部座標以檢查是否吃到果實
        let nextHeadX = this.caterpillar.segments[0].x + this.caterpillar.nextDirection.x;
        let nextHeadY = this.caterpillar.segments[0].y + this.caterpillar.nextDirection.y;

        if (this.wrapMode) {
            if (nextHeadX < 0) nextHeadX = this.cols - 1;
            else if (nextHeadX >= this.cols) nextHeadX = 0;
            if (nextHeadY < 0) nextHeadY = this.rows - 1;
            else if (nextHeadY >= this.rows) nextHeadY = 0;
        }

        const eaten = this.food.checkCollision({ x: nextHeadX, y: nextHeadY });
        const willGrow = !!eaten;

        // 推進毛毛蟲身體
        const newHead = this.caterpillar.step(willGrow, this.wrapMode, this.cols, this.rows);

        // 自撞檢測 (頭部撞到身體非尾端的任何一節)
        for (let i = 1; i < this.caterpillar.segments.length; i++) {
            const seg = this.caterpillar.segments[i];
            if (seg.x === newHead.x && seg.y === newHead.y) {
                this._handleGameOver('哎呀，小毛毛蟲撞到自己的身體了！');
                return;
            }
        }

        // 處理吃到果實獎勵
        if (eaten) {
            // 播放清脆鈴鐺音
            this.audio.playEatSound(eaten.type);

            // 增加分數
            this.score += eaten.points;
            if (eaten.type === 'cherry') this.cherriesCount++;
            else if (eaten.type === 'strawberry') this.strawberriesCount++;

            this._updateScoreUI();

            // 觸發彩色彩屑與漂浮得分文字特效
            const pixelX = eaten.x * this.gridSize + this.gridSize / 2;
            const pixelY = eaten.y * this.gridSize + this.gridSize / 2;
            this.particles.burst(pixelX, pixelY, eaten.type);
            this.particles.addText(pixelX, pixelY - 10, `+${eaten.points}`, eaten.type === 'cherry' ? '#FF5252' : (eaten.type === 'strawberry' ? '#E91E63' : '#FFB300'));

            // 補生成新的果實 (場上保持 2 顆果實)
            setTimeout(() => {
                if (this.food.items.length < 2) {
                    this.food.spawn(this.caterpillar.segments, this.cols, this.rows);
                }
            }, 300);
        }
    }

    _handleGameOver(reason) {
        this.state = 'gameover';
        this.audio.playGameOverSound();

        this.elFinalScore.textContent = this.score;
        this.elFinalBest.textContent = this.bestScore;
        const msgEl = document.getElementById('gameOverReason');
        if (msgEl) msgEl.textContent = reason;

        setTimeout(() => {
            this.elGameOverModal.classList.remove('hidden');
        }, 350);
    }

    _loop(currentTime) {
        if (!this.lastTime) this.lastTime = currentTime;
        const delta = Math.min(currentTime - this.lastTime, 100);
        this.lastTime = currentTime;

        if (this.state === 'playing') {
            this.accumulator += delta;
            while (this.accumulator >= this.stepInterval) {
                this._gameStep();
                this.accumulator -= this.stepInterval;
                if (this.state !== 'playing') break;
            }
        }

        // 動畫進度 (0.0 ~ 1.0) 用於身體在格子間平滑滑行蠕動
        const progress = this.state === 'playing' ? Math.min(this.accumulator / this.stepInterval, 1.0) : 1.0;

        // 更新子系統動畫
        this.caterpillar.update(delta / 1000);
        this.food.update();
        this.particles.update();

        // 渲染畫布
        this._render(progress);

        requestAnimationFrame((t) => this._loop(t));
    }

    _render(progress) {
        this.ctx.clearRect(0, 0, this.cols * this.gridSize, this.rows * this.gridSize);

        // 1. 繪製手帳方格底紋 (Notebook Grid Lines)
        this._renderGridPaper();

        // 2. 繪製果實 (櫻桃、草莓、金星果)
        this.food.render(this.ctx);

        // 3. 繪製粉彩毛毛蟲
        this.caterpillar.render(this.ctx, progress, this.wrapMode, this.cols, this.rows);

        // 4. 繪製粒子與飄浮文字
        this.particles.render(this.ctx);
    }

    _renderGridPaper() {
        const w = this.cols * this.gridSize;
        const h = this.rows * this.gridSize;

        // 畫方格細線
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(185, 168, 145, 0.28)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, h);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(w, y * this.gridSize);
            this.ctx.stroke();
        }

        // 如果不是穿牆模式，畫紅色手帳邊界裝飾線 (Notebook Margin Line)
        if (!this.wrapMode) {
            this.ctx.strokeStyle = 'rgba(239, 83, 80, 0.65)';
            this.ctx.lineWidth = 2.5;
            this.ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
        }

        this.ctx.restore();
    }

    _renderInitialScreen() {
        this._render(1.0);
    }
}

// 頁面載入完成後啟動
window.addEventListener('DOMContentLoaded', () => {
    window.game = new DoodleSnakeGame();
});

/**
 * Doodle Snake - Web Audio Sound & BGM Engine
 * 專為手繪毛毛蟲設計的專屬溫暖音效：
 * 1. 轉彎：彈性的小小水滴噗嚕音 (Elastic Water Drop / Bubbly Plop)
 * 2. 吃果子：清脆鈴鐺與水晶琴音 (Crystal Bell Chime / Glockenspiel)
 * 3. 獎勵果：晶亮琶音 (Sparkle Arpeggio)
 * 4. 撞擊/結束：溫和撫慰的和弦 (Soft Gentle Chord)
 * 5. BGM：八音盒/木琴療癒慢速背景旋律 (Music Box Lullaby)
 */

class SnakeAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmEnabled = true;
        this.masterVolume = 0.75;

        // BGM Timing & Sequence (Cozy Healing Progression: Fmaj7 -> G -> Em7 -> Am7)
        this.bgmTimer = null;
        this.bgmStep = 0;
        this.tempo = 68; // 溫暖慢速
        this.stepDuration = 60 / this.tempo / 2; // ~0.44s 每半拍
        this.nextNoteTime = 0;

        // 八音盒音高頻率 (Hz)
        this.bgmMelody = [
            // Bar 1: Fmaj7 (F4, A4, C5, E5)
            698.46, 880.00, 1046.50, 1318.51, 1046.50, 880.00, 698.46, 880.00,
            // Bar 2: G (G4, B4, D5, G5)
            783.99, 987.77, 1174.66, 1567.98, 1174.66, 987.77, 783.99, 987.77,
            // Bar 3: Em7 (E4, G4, B4, D5)
            659.25, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25, 783.99,
            // Bar 4: Am7 (A4, C5, E5, A5)
            880.00, 1046.50, 1318.51, 1760.00, 1318.51, 1046.50, 880.00, 1046.50
        ];

        this.bgmBass = [
            174.61, 0, 261.63, 0, 174.61, 0, 261.63, 0, // F3, C4
            196.00, 0, 293.66, 0, 196.00, 0, 293.66, 0, // G3, D4
            164.81, 0, 246.94, 0, 164.81, 0, 246.94, 0, // E3, B3
            220.00, 0, 329.63, 0, 220.00, 0, 329.63, 0  // A3, E4
        ];

        this._loadSettings();
    }

    _loadSettings() {
        try {
            const savedMute = localStorage.getItem('doodle_snake_muted');
            if (savedMute !== null) this.isMuted = savedMute === 'true';
            const savedBgm = localStorage.getItem('doodle_snake_bgm');
            if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
        } catch (e) {
            console.warn('Storage unavailable:', e);
        }
    }

    _saveSettings() {
        try {
            localStorage.setItem('doodle_snake_muted', this.isMuted);
            localStorage.setItem('doodle_snake_bgm', this.bgmEnabled);
        } catch (e) {}
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * 轉彎時的彈性水滴噗嚕音 (Elastic Water Drop / Bubbly Plop)
     * 特點：圓潤的正弦波，帶有彈性音高微躍與低通濾波，軟萌可愛
     */
    playTurnSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // 柔和低通濾波，去除生硬刺耳感
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(4, now); // 輕微共振增加水滴彈性

        osc.type = 'sine';
        // 音高先快速上升後平滑下降，形成水滴「噗嚕~」彈跳聲
        const baseFreq = 380 + Math.random() * 40; // 微妙音高隨機性
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.035);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.12);

        // 音量包絡：快速起始，柔和短促淡出
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.24 * this.masterVolume, now + 0.018);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    /**
     * 吃果子時的清脆鈴鐺聲 (Crystal Bell Chime)
     * 特點：高頻水晶泛音，雙音琶音快速疊加，清亮悅耳
     * @param {string} fruitType 'cherry' | 'strawberry' | 'bonus'
     */
    playEatSound(fruitType = 'cherry') {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // 依據果實類型定義音階
        let freqs = [1046.50, 1567.98]; // C6, G6 (清澈鈴鐺)
        if (fruitType === 'strawberry') {
            freqs = [1174.66, 1760.00]; // D6, A6 (甜美草莓)
        } else if (fruitType === 'bonus') {
            freqs = [1318.51, 1975.53, 2637.02]; // E6, B6, E7 (金星果)
        }

        freqs.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.04;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            // 晶瑩高音泛音振盪器
            const oscHarmonic = this.ctx.createOscillator();
            const gainHarmonic = this.ctx.createGain();
            oscHarmonic.type = 'sine';
            oscHarmonic.frequency.setValueAtTime(freq * 2.756, noteStart); // 非整數鈴鐺泛音

            // 主音包絡
            gain.gain.setValueAtTime(0.001, noteStart);
            gain.gain.linearRampToValueAtTime(0.3 * this.masterVolume, noteStart + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.42);

            // 泛音包絡（衰減較快）
            gainHarmonic.gain.setValueAtTime(0.001, noteStart);
            gainHarmonic.gain.linearRampToValueAtTime(0.09 * this.masterVolume, noteStart + 0.005);
            gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            oscHarmonic.connect(gainHarmonic);
            gainHarmonic.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.45);
            oscHarmonic.start(noteStart);
            oscHarmonic.stop(noteStart + 0.22);
        });
    }

    /**
     * 遊戲結束溫柔音 (Soft Gentle Sigh)
     */
    playGameOverSound() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [659.25, 587.33, 440.00]; // E5 -> D5 -> A4 溫柔下滑

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.12;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.95, startTime + 0.3);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(0.18 * this.masterVolume, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    /**
     * 點擊按鈕紙張輕觸聲 (Paper Click)
     */
    playPaperClick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.04);

        gain.gain.setValueAtTime(0.12 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // ==========================================
    // BGM 排程與生成 (八音盒 / 木琴風格)
    // ==========================================

    startBgm() {
        if (!this.bgmEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        if (this.bgmTimer) return;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this._scheduleBgm();
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    _scheduleBgm() {
        if (!this.bgmEnabled || this.isMuted || !this.ctx) {
            this.stopBgm();
            return;
        }

        const scheduleAhead = 0.2;
        while (this.nextNoteTime < this.ctx.currentTime + scheduleAhead) {
            this._playBgmStep(this.nextNoteTime, this.bgmStep);
            this.nextNoteTime += this.stepDuration;
            this.bgmStep = (this.bgmStep + 1) % this.bgmMelody.length;
        }

        this.bgmTimer = setTimeout(() => this._scheduleBgm(), 80);
    }

    _playBgmStep(time, step) {
        if (!this.ctx) return;

        // 主旋律音
        const melFreq = this.bgmMelody[step];
        if (melFreq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(melFreq, time);

            // 輕柔八音盒包絡
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.linearRampToValueAtTime(0.075 * this.masterVolume, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.38);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.4);
        }

        // 低音和弦基礎音
        const bassFreq = this.bgmBass[step];
        if (bassFreq > 0) {
            const oscB = this.ctx.createOscillator();
            const gainB = this.ctx.createGain();

            oscB.type = 'triangle';
            oscB.frequency.setValueAtTime(bassFreq, time);

            gainB.gain.setValueAtTime(0.0001, time);
            gainB.gain.linearRampToValueAtTime(0.06 * this.masterVolume, time + 0.02);
            gainB.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

            oscB.connect(gainB);
            gainB.connect(this.ctx.destination);

            oscB.start(time);
            oscB.stop(time + 0.65);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this._saveSettings();
        if (this.isMuted) {
            this.stopBgm();
        } else {
            this.playPaperClick();
            if (this.bgmEnabled) this.startBgm();
        }
        return this.isMuted;
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        this._saveSettings();
        if (this.bgmEnabled && !this.isMuted) {
            this.startBgm();
        } else {
            this.stopBgm();
        }
        return this.bgmEnabled;
    }
}

// 導出全局單例
window.snakeAudio = new SnakeAudio();

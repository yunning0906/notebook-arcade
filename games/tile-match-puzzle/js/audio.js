/**
 * Paper Tile Match 3 - Audio Synthesis Engine (Web Audio API)
 * High-fidelity procedural sound effects matching the notebook/stationery aesthetic:
 * - Crisp "Snap/Pa!" (啪) card tap & flip sound
 * - Card whoosh & glide into tray
 * - Triple Match crystalline chime & pop (叮鈴鈴~✨)
 * - Paper shuffle flutter & rustle
 * - Undo flick & bookmark extract
 * - Cozy warm acoustic Kalimba background music (76 BPM)
 */

class PaperAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmEnabled = true;
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 76;
        this.stepDuration = 60 / this.tempo / 2; // ~0.395s per note
        this.noiseBuffer = null;

        // Warm Kalimba progression: Cmaj7 -> Fmaj7 -> Am7 -> G7
        this.melodyTrack = [
            // Bar 1: Cmaj7
            523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 523.25, 659.25,
            // Bar 2: Fmaj7
            698.46, 880.00, 1046.5, 1318.5, 1046.5, 880.00, 698.46, 880.00,
            // Bar 3: Am7
            440.00, 523.25, 659.25, 783.99, 659.25, 523.25, 440.00, 523.25,
            // Bar 4: G(add9)
            783.99, 987.77, 1174.6, 987.77, 783.99, 587.33, 493.88, 587.33
        ];

        this.bassTrack = [
            130.81, 0, 196.00, 0, 130.81, 0, 196.00, 0, // C3, G3
            174.61, 0, 220.00, 0, 174.61, 0, 220.00, 0, // F3, A3
            110.00, 0, 164.81, 0, 110.00, 0, 164.81, 0, // A2, E3
            98.00,  0, 146.83, 0, 98.00,  0, 196.00, 0  // G2, D3
        ];
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this._generateNoiseBuffer();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _generateNoiseBuffer() {
        if (!this.ctx) return;
        const bufferSize = this.ctx.sampleRate * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Crisp Card "Pa!" (清脆啪聲翻牌/敲擊聲)
     * High-speed transient impulse + tuned acoustic wood/cardboard resonance
     */
    playCardSnap(pitch = 1.0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const pitchMod = pitch * (0.96 + Math.random() * 0.08);

        // 1. Sharp click impulse (High frequencies)
        const oscClick = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        oscClick.type = 'triangle';
        oscClick.frequency.setValueAtTime(1400 * pitchMod, now);
        oscClick.frequency.exponentialRampToValueAtTime(320 * pitchMod, now + 0.028);

        clickGain.gain.setValueAtTime(0.38, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

        oscClick.connect(clickGain);
        clickGain.connect(this.ctx.destination);
        oscClick.start(now);
        oscClick.stop(now + 0.03);

        // 2. Paper slap noise transient
        if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(2600 * pitchMod, now);
            bandpass.Q.setValueAtTime(3.0, now);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.28, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);
            noise.start(now);
            noise.stop(now + 0.045);
        }

        // 3. Subtle body resonance of card stock
        const bodyOsc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();
        bodyOsc.type = 'sine';
        bodyOsc.frequency.setValueAtTime(460 * pitchMod, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);

        bodyGain.gain.setValueAtTime(0.25, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(this.ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.055);
    }

    /**
     * Card Flying Whoosh (卡片快速滑動聲)
     */
    playCardSlide() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx || !this.noiseBuffer) return;

        const now = this.ctx.currentTime;
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(2200, now + 0.08);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.16);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.17);
    }

    /**
     * Triple Match Pop & Chime (3 連消除悅耳和弦鈴聲)
     */
    playTripleMatch() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Warm C6 Major Arpeggio: G5 -> C6 -> E6 -> G6
        const notes = [783.99, 1046.50, 1318.51, 1567.98];

        notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.055;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            // Shimmering overtone
            const overtone = this.ctx.createOscillator();
            const overtoneGain = this.ctx.createGain();
            overtone.type = 'triangle';
            overtone.frequency.setValueAtTime(freq * 2, noteTime);

            gain.gain.setValueAtTime(0.24, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

            overtoneGain.gain.setValueAtTime(0.08, noteTime);
            overtoneGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

            osc.connect(gain);
            overtone.connect(overtoneGain);
            gain.connect(this.ctx.destination);
            overtoneGain.connect(this.ctx.destination);

            osc.start(noteTime);
            overtone.start(noteTime);
            osc.stop(noteTime + 0.48);
            overtone.stop(noteTime + 0.32);
        });

        // Soft cheerful bubble pop
        const popOsc = this.ctx.createOscillator();
        const popGain = this.ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(320, now);
        popOsc.frequency.exponentialRampToValueAtTime(840, now + 0.08);

        popGain.gain.setValueAtTime(0.2, now);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        popOsc.connect(popGain);
        popGain.connect(this.ctx.destination);
        popOsc.start(now);
        popOsc.stop(now + 0.09);
    }

    /**
     * Reshuffle Flutter (快速洗牌紙片翻飛刷聲)
     */
    playShuffle() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const count = 6;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.playCardSnap(0.85 + (i / count) * 0.4);
            }, i * 45);
        }
    }

    /**
     * Undo / Backtrack sound (回溯時光柔和反向翻牌)
     */
    playUndo() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    /**
     * Bookmark Extract sound (書籤暫存滑出)
     */
    playExtract() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [659.25, 880.00, 1174.66]; // E5, A5, D6
        notes.forEach((freq, idx) => {
            const time = now + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.18, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.26);
        });
    }

    /**
     * Tray Full Warning (托盤接近滿格警示)
     */
    playTrayWarning() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(311.13, now + 0.08);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.19);
    }

    /**
     * Victory Fanfare (通關印章慶祝)
     */
    playVictory() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Joyous chord sequence: C5, E5, G5, C6, E6
        const fanfare = [
            { f: 523.25, d: 0.12, t: 0.0 },
            { f: 659.25, d: 0.12, t: 0.12 },
            { f: 783.99, d: 0.12, t: 0.24 },
            { f: 1046.50, d: 0.35, t: 0.36 },
            { f: 1318.51, d: 0.55, t: 0.52 }
        ];

        fanfare.forEach(note => {
            const t = now + note.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, t);

            gain.gain.setValueAtTime(0.25, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + note.d + 0.05);
        });
    }

    /**
     * Game Over gentle sigh (遊戲結束)
     */
    playGameOver() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 523.25, 493.88, 440.00];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.14;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        });
    }

    /**
     * Background Music Loop - Warm Kalimba
     */
    startBgm() {
        if (!this.bgmEnabled || this.bgmTimer) return;
        this.init();
        this._scheduleNextBgmNote();
    }

    _scheduleNextBgmNote() {
        if (!this.bgmEnabled || this.isMuted || !this.ctx) {
            this.bgmTimer = setTimeout(() => this._scheduleNextBgmNote(), 500);
            return;
        }

        const melodyFreq = this.melodyTrack[this.currentStep % this.melodyTrack.length];
        const bassFreq = this.bassTrack[this.currentStep % this.bassTrack.length];
        const now = this.ctx.currentTime;

        if (melodyFreq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melodyFreq, now);

            // Kalimba decay
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + this.stepDuration * 1.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + this.stepDuration * 1.6);
        }

        if (bassFreq > 0) {
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'triangle';
            bOsc.frequency.setValueAtTime(bassFreq, now);

            bGain.gain.setValueAtTime(0.04, now);
            bGain.gain.exponentialRampToValueAtTime(0.0001, now + this.stepDuration * 2);

            bOsc.connect(bGain);
            bGain.connect(this.ctx.destination);
            bOsc.start(now);
            bOsc.stop(now + this.stepDuration * 2.1);
        }

        this.currentStep++;
        this.bgmTimer = setTimeout(() => {
            this._scheduleNextBgmNote();
        }, this.stepDuration * 1000);
    }

    stopBgm() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
        } else {
            this.startBgm();
        }
        return this.isMuted;
    }
}

window.PaperAudio = PaperAudio;

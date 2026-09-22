/**
 * Watercolor Sort Puzzle - Web Audio API Sound Engine
 * Features:
 * - Procedural "Glug-Glug" Liquid Bubbling & Pouring Stream sound
 * - Thin Glass Tube Selection / Clink sound
 * - Wooden Cork Stopper Pop / Seal sound
 * - Victory Arpeggio Chimes
 * - Gentle Music Box / Kalimba BGM (68 BPM healing progression)
 */

class WatercolorAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmEnabled = true;
        this.sfxEnabled = true;
        
        // BGM Sequencer
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 68;
        this.stepDuration = (60 / this.tempo) / 2; // ~0.44s per eighth note
        this.scheduleAheadTime = 0.2;
        this.nextNoteTime = 0;

        // Healing progression: Cmaj9 -> Am9 -> Fmaj7 -> G7sus4 -> Em7 -> A7 -> Dm9 -> G13
        this.musicBoxMelody = [
            // Bar 1: Cmaj9 (C - G - B - E - D - B - G - E)
            523.25, 783.99, 987.77, 1318.51, 1174.66, 987.77, 783.99, 659.25,
            // Bar 2: Am9 (A - E - G - C - B - G - E - C)
            440.00, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25,
            // Bar 3: Fmaj7 (F - C - E - A - G - E - C - A)
            349.23, 523.25, 659.25, 880.00, 783.99, 659.25, 523.25, 440.00,
            // Bar 4: G7 (G - D - F - B - A - F - D - B)
            392.00, 587.33, 698.46, 987.77, 880.00, 698.46, 587.33, 493.88,
            // Bar 5: Em7 (E - B - D - G - F# - D - B - G)
            329.63, 493.88, 587.33, 783.99, 739.99, 587.33, 493.88, 392.00,
            // Bar 6: Am7 (A - E - G - C - B - G - E - C)
            440.00, 659.25, 783.99, 1046.50, 987.77, 783.99, 659.25, 523.25,
            // Bar 7: Dm9 (D - A - C - F - E - C - A - F)
            293.66, 440.00, 523.25, 698.46, 659.25, 523.25, 440.00, 349.23,
            // Bar 8: G13 (G - D - F - B - E - D - B - G)
            392.00, 587.33, 698.46, 987.77, 1318.51, 1174.66, 987.77, 783.99
        ];

        this.musicBoxBass = [
            130.81, 0, 196.00, 0, 130.81, 0, 196.00, 0, // C3, G3
            110.00, 0, 164.81, 0, 110.00, 0, 164.81, 0, // A2, E3
            87.31,  0, 174.61, 0, 87.31,  0, 174.61, 0, // F2, F3
            98.00,  0, 196.00, 0, 98.00,  0, 196.00, 0, // G2, G3
            82.41,  0, 164.81, 0, 82.41,  0, 164.81, 0, // E2, E3
            110.00, 0, 164.81, 0, 110.00, 0, 164.81, 0, // A2, E3
            73.42,  0, 146.83, 0, 73.42,  0, 146.83, 0, // D2, D3
            98.00,  0, 196.00, 0, 98.00,  0, 196.00, 0  // G2, G3
        ];

        // Active pouring sound loop tracker
        this.currentPouringInterval = null;
        this.noiseBuffer = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this._createNoiseBuffer();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    _createNoiseBuffer() {
        if (!this.ctx) return;
        const length = this.ctx.sampleRate * 2;
        this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }

    // ==========================================
    // PROCEDURAL SOUND EFFECTS
    // ==========================================

    /**
     * Laboratory Thin Glass Clink (點擊試管的輕脆玻璃微音)
     */
    playGlassClink(isLift = true) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        // High glass resonant harmonic pairs
        const baseFreq = isLift ? 1850 : 1600;
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.58, now);

        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.004);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.2);
        osc2.stop(now + 0.2);
    }

    /**
     * Single Water Bubble "Bloop" / "Glug" (單次水泡咕嚕音)
     */
    playSingleBubble(time, pitchMod = 1) {
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Rapid upward frequency slide creates characteristic liquid bubble bloop
        const startFreq = (240 + Math.random() * 120) * pitchMod;
        const endFreq = (480 + Math.random() * 180) * pitchMod;
        const duration = 0.05 + Math.random() * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.14, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + duration + 0.02);
    }

    /**
     * Continuous Realistic "Glug-Glug" Water Pouring Sound (倒水咕嚕水流聲)
     * Plays filtered continuous liquid flow + repeating rapid gurgling bubbles
     * @param {number} durationMs Duration of the pour in milliseconds
     */
    startPouringStream(durationMs = 800) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const totalDurationSec = durationMs / 1000;

        // 1. Continuous liquid rushing sound (Filtered noise)
        if (this.noiseBuffer) {
            const noiseSource = this.ctx.createBufferSource();
            noiseSource.buffer = this.noiseBuffer;
            noiseSource.loop = true;

            const bandpass = this.ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(750, now);
            bandpass.Q.setValueAtTime(4.0, now);

            // Modulate filter frequency gently like rushing water
            bandpass.frequency.linearRampToValueAtTime(950, now + totalDurationSec * 0.5);
            bandpass.frequency.linearRampToValueAtTime(700, now + totalDurationSec);

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.setValueAtTime(0.001, now);
            noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.08);
            noiseGain.gain.setValueAtTime(0.09, now + totalDurationSec - 0.08);
            noiseGain.gain.linearRampToValueAtTime(0.0001, now + totalDurationSec);

            noiseSource.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(this.ctx.destination);

            noiseSource.start(now);
            noiseSource.stop(now + totalDurationSec + 0.05);
        }

        // 2. Sequence of procedural bubble "glug-glug" bloops
        const bubbleCount = Math.floor((durationMs / 1000) * 11); // ~11 bubbles per second
        for (let i = 0; i < bubbleCount; i++) {
            const bubbleTime = now + 0.04 + (i * 0.085) + (Math.random() - 0.5) * 0.03;
            // Rising pitch as tube fills up
            const fillPitch = 1.0 + (i / bubbleCount) * 0.45;
            this.playSingleBubble(bubbleTime, fillPitch);
        }
    }

    /**
     * Wooden Cork Stopper Pop / Seal (試管集滿蓋上軟木塞聲)
     */
    playCorkPop() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Low frequency thud/pop
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.09);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);

        // Gentle wooden friction click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(420, now);
        clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
        clickGain.gain.setValueAtTime(0.12, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickOsc.start(now);
        clickOsc.stop(now + 0.06);
    }

    /**
     * Level Victory Sparkling Chime Arpeggio (通關音效)
     */
    playVictory() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6

        notes.forEach((freq, idx) => {
            const noteTime = now + idx * 0.1;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0.001, noteTime);
            gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.85);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.9);
        });
    }

    /**
     * Undo Step Sound (復原輕拂聲)
     */
    playUndo() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.1);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    // ==========================================
    // GENTLE MUSIC BOX BGM ENGINE
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

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this._playBgmNote(this.nextNoteTime, this.currentStep);
            this.nextNoteTime += this.stepDuration;
            this.currentStep = (this.currentStep + 1) % this.musicBoxMelody.length;
        }

        this.bgmTimer = setTimeout(() => {
            this._scheduleBgm();
        }, 120);
    }

    _playBgmNote(time, stepIndex) {
        if (!this.ctx) return;

        // 1. Play Kalimba / Music box melody note
        const melodyFreq = this.musicBoxMelody[stepIndex];
        if (melodyFreq && melodyFreq > 0) {
            const osc = this.ctx.createOscillator();
            const oscHarmonic = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(melodyFreq, time);

            // Subtle bell harmonic
            oscHarmonic.type = 'sine';
            oscHarmonic.frequency.setValueAtTime(melodyFreq * 3.01, time);

            // Music box envelope: instant chime attack + slow exponential fade
            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.linearRampToValueAtTime(0.065, time + 0.006);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.7);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2400, time);

            osc.connect(gain);
            oscHarmonic.connect(gain);
            gain.connect(filter);
            filter.connect(this.ctx.destination);

            osc.start(time);
            oscHarmonic.start(time);
            osc.stop(time + 0.75);
            oscHarmonic.stop(time + 0.75);
        }

        // 2. Play warm acoustic bass note
        const bassFreq = this.musicBoxBass[stepIndex];
        if (bassFreq && bassFreq > 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();

            bassOsc.type = 'triangle';
            bassOsc.frequency.setValueAtTime(bassFreq, time);

            bassGain.gain.setValueAtTime(0.0001, time);
            bassGain.gain.linearRampToValueAtTime(0.05, time + 0.02);
            bassGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);

            bassOsc.start(time);
            bassOsc.stop(time + 0.85);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBgm();
        } else if (this.bgmEnabled) {
            this.startBgm();
        }
        return this.isMuted;
    }

    toggleBgm() {
        this.bgmEnabled = !this.bgmEnabled;
        if (!this.bgmEnabled) {
            this.stopBgm();
        } else if (!this.isMuted) {
            this.startBgm();
        }
        return this.bgmEnabled;
    }
}

window.WatercolorAudio = WatercolorAudio;

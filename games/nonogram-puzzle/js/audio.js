/**
 * Nonogram / Picross - Sound & BGM Engine (Web Audio API)
 * Features:
 * - Procedural "Pencil on Paper" scritch-scratch sound using filtered noise envelopes
 * - Pencil Cross 'X' tick
 * - Soft eraser sweep sound
 * - Victory pastel blossom arpeggio & chime
 * - Continuous gentle 76 BPM Kalimba / Music Box background music
 */

class NonogramAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.bgmEnabled = true;
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 76;
        this.stepDuration = 60 / this.tempo / 2; // ~0.395s per note
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.25;

        // Warm, cozy chord progression: Cmaj7 -> Am7 -> Dm7 -> G7 (Healing Notebook Vibe)
        this.melodyTrack = [
            // Bar 1: Cmaj7
            523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 523.25, 659.25,
            // Bar 2: Am7
            440.00, 523.25, 659.25, 783.99, 659.25, 523.25, 440.00, 523.25,
            // Bar 3: Dm7
            587.33, 698.46, 880.00, 1046.50, 880.00, 698.46, 587.33, 698.46,
            // Bar 4: G7
            783.99, 987.77, 1174.66, 987.77, 783.99, 698.46, 587.33, 493.88
        ];

        this.bassTrack = [
            130.81, 0, 196.00, 0, 130.81, 0, 196.00, 0, // C3, G3
            110.00, 0, 164.81, 0, 110.00, 0, 164.81, 0, // A2, E3
            146.83, 0, 220.00, 0, 146.83, 0, 220.00, 0, // D3, A3
            98.00,  0, 196.00, 0, 98.00,  0, 196.00, 0  // G2, G3
        ];

        // Noise buffer cache for pencil scratches
        this.noiseBuffer = null;
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
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    }

    /**
     * Procedural Pencil Scratch (鉛筆沙沙聲)
     * High-pass + Bandpass filtered noise with rapid decay and slight randomized frequency
     */
    playPencilScratch(pitchMod = 1) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx || !this.noiseBuffer) return;

        const now = this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        // Bandpass filter to mimic pencil graphite on textured fiber paper
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        // Randomize center frequency slightly (1800Hz - 2600Hz)
        const centerFreq = (2000 + (Math.random() - 0.5) * 600) * pitchMod;
        filter.frequency.setValueAtTime(centerFreq, now);
        filter.Q.setValueAtTime(3.5, now);

        // High shelf for crispness
        const highShelf = this.ctx.createBiquadFilter();
        highShelf.type = 'highshelf';
        highShelf.frequency.setValueAtTime(3000, now);
        highShelf.gain.setValueAtTime(3, now);

        const gainNode = this.ctx.createGain();
        const duration = 0.07 + Math.random() * 0.04; // 70ms - 110ms stroke

        // Subtle, tactile envelope
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.18, now + 0.015);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        source.connect(filter);
        filter.connect(highShelf);
        highShelf.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        // Offset into noise buffer
        const startOffset = Math.random() * 1.5;
        source.start(now, startOffset, duration);
        source.stop(now + duration);
    }

    /**
     * Pencil Cross 'X' Tick (鉛筆打叉輕點聲)
     */
    playCrossTick() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Crisp two-part click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);

        // Accompanying tiny paper tap
        this.playPencilScratch(1.4);
    }

    /**
     * Eraser / Undo Sound (柔和橡皮擦聲)
     */
    playEraser() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx || !this.noiseBuffer) return;

        const now = this.ctx.currentTime;
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);
        filter.frequency.linearRampToValueAtTime(450, now + 0.12);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.14, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        source.start(now, Math.random(), 0.12);
        source.stop(now + 0.13);
    }

    /**
     * Line / Column Completed Sound (行列線索完成輕輕打勾聲)
     */
    playLineCompleted() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [659.25, 880.00]; // E5 -> A5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteTime = now + idx * 0.06;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            gain.gain.setValueAtTime(0.08, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.2);
        });
    }

    /**
     * Pastel Blossom Victory Arpeggio (通關粉彩綻放八音盒華彩)
     */
    playVictoryArpeggio() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Pentatonic joyful sparkle: C5, E5, G5, A5, C6, E6, G6
        const arpeggio = [523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51, 1567.98];

        arpeggio.forEach((freq, i) => {
            const noteTime = now + i * 0.08;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteTime);

            // Shimmering vibrato
            gain.gain.setValueAtTime(0.16, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.5);
        });

        // Warm chord wash in background
        const chord = [261.63, 329.63, 392.00, 523.25]; // C major
        chord.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const chordStart = now + 0.2;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, chordStart);

            gain.gain.setValueAtTime(0.06, chordStart);
            gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(chordStart);
            osc.stop(chordStart + 1.3);
        });
    }

    /**
     * Continuous 76 BPM Music Box BGM Loop
     */
    startBGM() {
        if (!this.bgmEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;
        if (this.bgmTimer) return;

        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.currentStep = 0;

        const schedule = () => {
            if (!this.bgmEnabled || this.isMuted) return;
            while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
                this._playBGMStep(this.currentStep, this.nextNoteTime);
                this.nextNoteTime += this.stepDuration;
                this.currentStep = (this.currentStep + 1) % this.melodyTrack.length;
            }
            this.bgmTimer = setTimeout(schedule, 60);
        };
        schedule();
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    _playBGMStep(step, time) {
        if (!this.ctx) return;

        // 1. Melody Note (Music Box / Kalimba)
        const melodyFreq = this.melodyTrack[step];
        if (melodyFreq) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(melodyFreq, time);

            // Music box chime decay
            gain.gain.setValueAtTime(0.035, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.3);
        }

        // 2. Bass Note
        const bassFreq = this.bassTrack[step];
        if (bassFreq) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bassFreq, time);

            gain.gain.setValueAtTime(0.03, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.4);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.init();
            this.startBGM();
        }
        return this.isMuted;
    }
}

window.soundEngine = new NonogramAudio();

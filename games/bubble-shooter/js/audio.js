/**
 * Kawaii Sound & Continuous Background Music Synthesizer (Web Audio API)
 * Plays a warm, charming Music Box / Kalimba melody (80 BPM) that loops continuously,
 * with cute water drop, shooting pops, wooden bell xylophone pops, and fairy combo arpeggios.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.isMuted = false;
        this.lastAimTickTime = 0;

        // BGM Sequencer State (80 BPM Healing Music Box)
        this.bgmTimer = null;
        this.currentStep = 0;
        this.nextNoteTime = 0;
        this.tempo = 80;
        this.stepDuration = 60 / this.tempo / 2; // Eighth notes (~0.375s per step)
        this.scheduleAheadTime = 0.2; // 200ms lookahead

        // Kawaii Music Box Frequencies (Fmaj7 -> G7 -> Em7 -> Am7 Royal Road Loop)
        this.melodyTrack = [
            // Bar 1: Fmaj7 (Sweet & cozy)
            523.25, 659.25, 783.99, 880.00,  659.25, 783.99, 1046.50, 880.00,
            // Bar 2: G7 (Playful lift)
            783.99, 880.00, 987.77, 1046.50, 880.00, 783.99, 659.25,  587.33,
            // Bar 3: Em7 (Dreamy warmth)
            659.25, 783.99, 880.00, 1046.50, 783.99, 659.25, 587.33,  523.25,
            // Bar 4: Am7 (Gentle resolution)
            587.33, 659.25, 783.99, 659.25,  587.33, 523.25, 440.00,  523.25
        ];

        // Bassline chords (Root + Fifth pulse)
        this.bassTrack = [
            174.61, 0, 261.63, 0,  174.61, 0, 261.63, 0, // F3, C4
            196.00, 0, 293.66, 0,  196.00, 0, 293.66, 0, // G3, D4
            164.81, 0, 246.94, 0,  164.81, 0, 246.94, 0, // E3, B3
            220.00, 0, 261.63, 0,  220.00, 0, 329.63, 0  // A3, C4, E4
        ];

        // Soft arpeggio accompaniment
        this.harmonyTrack = [
            349.23, 440.00, 523.25, 659.25, // F4, A4, C5, E5
            392.00, 493.88, 587.33, 783.99, // G4, B4, D5, G5
            329.63, 392.00, 493.88, 659.25, // E4, G4, B4, E5
            440.00, 523.25, 659.25, 880.00  // A4, C5, E5, A5
        ];

        this.setupAutoPlay();
    }

    setupAutoPlay() {
        this.init();
        if (this.ctx && this.ctx.state === 'running') {
            this.startBGM();
        }

        const startAudio = () => {
            this.init();
            if (this.ctx && this.ctx.state === 'running') {
                this.startBGM();
            }
        };

        const events = ['click', 'touchstart', 'pointerdown', 'keydown', 'mousemove', 'wheel'];
        const triggerOnce = () => {
            startAudio();
            events.forEach(evt => document.removeEventListener(evt, triggerOnce));
        };
        events.forEach(evt => document.addEventListener(evt, triggerOnce, { passive: true }));

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.init();
                if (this.bgmEnabled && !this.isMuted) {
                    this.startBGM();
                }
            }
        });
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().then(() => {
                if (this.bgmEnabled && !this.isMuted) {
                    this.startBGM();
                }
            }).catch(() => {});
        }
    }

    startBGM() {
        if (this.bgmTimer) return;
        if (!this.ctx) this.init();
        if (!this.ctx) return;

        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this.currentStep = 0;

        const scheduler = () => {
            if (!this.bgmEnabled || this.isMuted) {
                this.bgmTimer = null;
                return;
            }
            while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
                this.scheduleBGMStep(this.currentStep, this.nextNoteTime);
                this.nextNoteTime += this.stepDuration;
                this.currentStep = (this.currentStep + 1) % 32;
            }
            this.bgmTimer = setTimeout(scheduler, 50);
        };
        scheduler();
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduleBGMStep(step, time) {
        if (!this.ctx || !this.bgmEnabled || this.isMuted) return;

        // 1. Bassline note
        const bassFreq = this.bassTrack[step];
        if (bassFreq > 0) {
            this.playMusicBoxPluck(bassFreq, time, 0.08, 0.45, 'triangle');
        }

        // 2. Main melody note
        const melodyFreq = this.melodyTrack[step];
        if (melodyFreq > 0) {
            this.playMusicBoxPluck(melodyFreq, time, 0.07, 0.5, 'sine');
            this.playMusicBoxPluck(melodyFreq * 2, time, 0.02, 0.25, 'sine'); // chime overtone
        }

        // 3. Harmony arpeggios
        if (step % 2 === 1) {
            const harmonyIdx = (Math.floor(step / 2)) % this.harmonyTrack.length;
            const harmFreq = this.harmonyTrack[harmonyIdx];
            if (harmFreq > 0) {
                this.playMusicBoxPluck(harmFreq, time, 0.04, 0.35, 'sine');
            }
        }
    }

    playMusicBoxPluck(freq, time, volume = 0.08, decay = 0.4, type = 'sine') {
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.0001, time);
            gain.gain.exponentialRampToValueAtTime(volume, time + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + decay + 0.05);
        } catch (e) {}
    }

    // --- Cute Sound Effects ---

    /**
     * Sliding / Aiming Water Droplet Tick (Throttled)
     */
    playAimTick() {
        if (!this.sfxEnabled || this.isMuted) return;
        const now = performance.now();
        if (now - this.lastAimTickTime < 65) return;
        this.lastAimTickTime = now;

        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400 + Math.random() * 200, t);
            osc.frequency.exponentialRampToValueAtTime(800, t + 0.035);

            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.04);
        } catch (e) {}
    }

    /**
     * Shooting Cannon Bubble Pop
     */
    playShoot() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(740, t + 0.08);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.11);
        } catch (e) {}
    }

    /**
     * Bubble Swap Sound
     */
    playSwap() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.linearRampToValueAtTime(900, t + 0.05);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.08);
        } catch (e) {}
    }

    /**
     * Bubble Snap to Grid Sound
     */
    playSnap() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, t);
            osc.frequency.exponentialRampToValueAtTime(260, t + 0.06);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.08);
        } catch (e) {}
    }

    /**
     * Crisp Wooden Bell / Xylophone Match Pop Sound
     */
    playPop(combo = 1) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            // Pentatonic scale notes rising with combo
            const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
            const baseFreq = scale[Math.min(combo - 1, scale.length - 1)];

            // Primary chime
            const osc1 = this.ctx.createOscillator();
            const gain1 = this.ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(baseFreq, t);

            gain1.gain.setValueAtTime(0.18, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

            osc1.connect(gain1);
            gain1.connect(this.ctx.destination);
            osc1.start(t);
            osc1.stop(t + 0.3);

            // Wood / glass bell overtone
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(baseFreq * 2.756, t);

            gain2.gain.setValueAtTime(0.06, t);
            gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);
            osc2.start(t);
            osc2.stop(t + 0.15);
        } catch (e) {}
    }

    /**
     * Cute Fairy Arpeggio on Combos or Multidrops
     */
    playFairyCombo(combo = 2) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
        const count = Math.min(notes.length, 3 + combo);

        for (let i = 0; i < count; i++) {
            const noteTime = this.ctx.currentTime + i * 0.045;
            this.playMusicBoxPluck(notes[i], noteTime, 0.09, 0.35, 'sine');
            this.playMusicBoxPluck(notes[i] * 2, noteTime, 0.03, 0.18, 'sine');
        }
    }

    /**
     * Soft Thud When Orphan Bubbles Drop
     */
    playDrop() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(340, t);
            osc.frequency.exponentialRampToValueAtTime(140, t + 0.1);

            gain.gain.setValueAtTime(0.1, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.13);
        } catch (e) {}
    }

    /**
     * Ceiling Drop Shift Sound
     */
    playCeilingDrop() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, t);
            osc.frequency.exponentialRampToValueAtTime(110, t + 0.22);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.26);
        } catch (e) {}
    }

    /**
     * Game Over Nostalgic Chime
     */
    playGameOver() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const notes = [587.33, 523.25, 440.00, 349.23];
        notes.forEach((freq, idx) => {
            const time = this.ctx.currentTime + idx * 0.15;
            this.playMusicBoxPluck(freq, time, 0.1, 0.55, 'sine');
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }
}

window.soundEngine = new SoundEngine();

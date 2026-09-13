/**
 * Kawaii Sound & Continuous Background Music Synthesizer (Web Audio API)
 * Plays a warm, charming Music Box / Kalimba melody that loops continuously
 * at 80 BPM, with adorable interactive sound effects (Water drop slide,
 * Xylophone/Glockenspiel bells, Combo fairy arpeggios).
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.isMuted = false;
        this.lastSlideTime = 0;

        // BGM Sequencer State (80 BPM Slow Healing Music Box)
        this.bgmTimer = null;
        this.currentStep = 0;
        this.nextNoteTime = 0;
        this.tempo = 80; // Slow, relaxing Kawaii Music Box tempo
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
        // Resume / Start on ANY user interaction if suspended by browser policy
        const startAudio = () => {
            this.init();
            if (this.ctx && this.ctx.state === 'running' && !this.isMuted) {
                this.startBGM();
            }
        };

        const events = ['click', 'touchstart', 'pointerdown', 'keydown', 'mousedown'];
        const triggerOnce = () => {
            startAudio();
            events.forEach(evt => document.removeEventListener(evt, triggerOnce));
        };
        events.forEach(evt => document.addEventListener(evt, triggerOnce, { passive: true }));

        // Tab visibility handler
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

    toggleMute() {
        this.init();
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return this.isMuted;
    }

    startBGM() {
        this.bgmEnabled = true;
        if (!this.ctx || this.isMuted) return;
        if (this.bgmTimer) return; // Already playing

        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.currentStep = 0;

        // Rock-solid lookahead scheduler: runs every 35ms
        this.bgmTimer = setInterval(() => {
            if (!this.bgmEnabled || this.isMuted || !this.ctx) return;
            this.scheduler();
        }, 35);
    }

    scheduler() {
        if (!this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.playBGMStep(this.currentStep, this.nextNoteTime);
            this.nextNoteTime += this.stepDuration;
            this.currentStep = (this.currentStep + 1) % this.melodyTrack.length;
        }
    }

    playBGMStep(step, time) {
        if (!this.ctx) return;

        // 1. Kawaii Music Box Melody Note
        const melFreq = this.melodyTrack[step];
        if (melFreq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // Blend triangle for sweet kalimba/music box warmth
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(melFreq, time);

            // Gentle soothing volume
            gain.gain.setValueAtTime(0.045, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.52);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.55);

            // Shimmer overtone
            const osc2 = this.ctx.createOscillator();
            const gain2 = this.ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(melFreq * 2, time);

            gain2.gain.setValueAtTime(0.015, time);
            gain2.gain.exponentialRampToValueAtTime(0.0001, time + 0.32);

            osc2.connect(gain2);
            gain2.connect(this.ctx.destination);

            osc2.start(time);
            osc2.stop(time + 0.35);
        }

        // 2. Gentle Bass Note
        const bassFreq = this.bassTrack[step];
        if (bassFreq > 0) {
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();

            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(bassFreq, time);

            bGain.gain.setValueAtTime(0.038, time);
            bGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.65);

            bOsc.connect(bGain);
            bGain.connect(this.ctx.destination);

            bOsc.start(time);
            bOsc.stop(time + 0.7);
        }

        // 3. Soft Arpeggio Accent every 2 steps
        if (step % 2 === 1) {
            const chordIdx = Math.floor(step / 8);
            const harmFreq = this.harmonyTrack[(chordIdx * 4 + ((step % 8) >> 1)) % this.harmonyTrack.length];
            if (harmFreq > 0) {
                const hOsc = this.ctx.createOscillator();
                const hGain = this.ctx.createGain();

                hOsc.type = 'sine';
                hOsc.frequency.setValueAtTime(harmFreq, time);

                hGain.gain.setValueAtTime(0.018, time);
                hGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

                hOsc.connect(hGain);
                hGain.connect(this.ctx.destination);

                hOsc.start(time);
                hOsc.stop(time + 0.48);
            }
        }
    }

    stopBGM() {
        this.bgmEnabled = false;
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    /* -------------------------------------------------------------
     * INTERACTIVE CUTE SOUND EFFECTS (SFX)
     * ------------------------------------------------------------- */

    // 1. Water Drop / Bloop on Slide (滑動水滴音)
    playSlide() {
        if (!this.sfxEnabled || this.isMuted) return;
        const nowMs = Date.now();
        if (nowMs - this.lastSlideTime < 80) return;
        this.lastSlideTime = nowMs;

        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.08);

        gain.gain.setValueAtTime(0.20, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    // 2. Cute Glockenspiel / Marimba Bell on Merge (方塊合成清脆木琴鈴鐺音)
    playMerge(value = 4, combo = 1) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Base pentatonic / major chime frequencies scaling with tile value
        const tierFrequencies = {
            4: 440.00,    // A4
            8: 493.88,    // B4
            16: 554.37,   // C#5
            32: 659.25,   // E5
            64: 739.99,   // F#5
            128: 880.00,  // A5
            256: 987.77,  // B5
            512: 1108.73, // C#6
            1024: 1318.51,// E6
            2048: 1479.98,// F#6
            4096: 1760.00 // A6
        };

        const baseFreq = tierFrequencies[value] || (440 * Math.pow(1.06, Math.log2(value)));

        // Primary Bell Tone
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now);

        const bellVol = Math.min(0.35, 0.22 + combo * 0.03);
        gain1.gain.setValueAtTime(bellVol, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.6);

        // Crisp Glockenspiel Harmonic overtone
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 2.756, now);

        gain2.gain.setValueAtTime(bellVol * 0.45, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.25);

        // If combo >= 2, trigger fairy arpeggio
        if (combo >= 2) {
            this.playCombo(combo);
        }
    }

    // 3. Cute Fairy Combo Arpeggio (連擊小精靈琶音)
    playCombo(combo = 2) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [880.00, 1108.73, 1318.51, 1661.22, 1975.53]; // A5, C#6, E6, G#6, B6
        const count = Math.min(notes.length, 2 + combo);

        for (let i = 0; i < count; i++) {
            const noteTime = now + 0.05 + i * 0.045;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], noteTime);

            gain.gain.setValueAtTime(0.12, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
        }
    }

    // 4. Milestone 2048 Victory Fanfare (達成 2048 歡慶鈴鐺)
    playVictory() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const fanfare = [
            { f: 587.33, t: 0.00 }, // D5
            { f: 739.99, t: 0.12 }, // F#5
            { f: 880.00, t: 0.24 }, // A5
            { f: 1174.66, t: 0.36 },// D6
            { f: 1479.98, t: 0.52 },// F#6
            { f: 1760.00, t: 0.70 } // A6
        ];

        fanfare.forEach(n => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.f, now + n.t);

            gain.gain.setValueAtTime(0.24, now + n.t);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + 0.65);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + n.t);
            osc.stop(now + n.t + 0.7);
        });
    }

    // 5. Game Over Gentle Chord
    playGameOver() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 392, 349.23, 329.63]; // A4 -> G4 -> F4 -> E4

        notes.forEach((freq, idx) => {
            const time = now + idx * 0.14;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.18, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.5);
        });
    }
}

window.soundEngine = new SoundEngine();

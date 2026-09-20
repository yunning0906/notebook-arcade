/**
 * Notebook Block Puzzle - Web Audio API Sound Engine
 * Provides crisp wooden block taps, xylophone arpeggios (C-D-E-F-G-A-B-C),
 * fairy combo chimes, bounce-back pops, and a relaxing music box background melody.
 */

class PuzzleAudio {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = false; // off by default or on with gentle volume
        this.isMuted = false;

        // C Major Scale frequencies for line clear xylophone arpeggio (C4 to C6)
        this.scalePitches = [
            261.63, // C4
            293.66, // D4
            329.63, // E4
            349.23, // F4
            392.00, // G4
            440.00, // A4
            493.88, // B4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            698.46, // F5
            783.99, // G5
            880.00, // A5
            987.77, // B5
            1046.50 // C6
        ];

        // Music Box BGM state
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 72; // calming relaxed tempo
        this.stepDuration = 60 / this.tempo / 2; // ~0.416s
        this.nextNoteTime = 0;

        // Healing Pentatonic Music Box Notes
        this.bgmMelody = [
            523.25, 659.25, 783.99, 1046.50,  659.25, 783.99, 880.00, 659.25,
            587.33, 783.99, 880.00, 1174.66,  783.99, 880.00, 987.77, 783.99,
            440.00, 659.25, 783.99, 880.00,   659.25, 523.25, 659.25, 587.33,
            392.00, 523.25, 659.25, 783.99,   587.33, 523.25, 440.00, 523.25
        ];

        this.bgmBass = [
            261.63, 0, 392.00, 0,  261.63, 0, 392.00, 0, // C
            293.66, 0, 440.00, 0,  293.66, 0, 440.00, 0, // D
            220.00, 0, 329.63, 0,  220.00, 0, 329.63, 0, // A
            196.00, 0, 293.66, 0,  196.00, 0, 261.63, 0  // G
        ];

        this.initOnUserGesture();
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnUserGesture() {
        const unlock = () => {
            this.init();
            if (this.ctx && this.ctx.state === 'running') {
                if (this.bgmEnabled) {
                    this.startBGM();
                }
                window.removeEventListener('pointerdown', unlock);
                window.removeEventListener('keydown', unlock);
            }
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    // Play crisp woodblock / paper placement tap
    playPlaceBlock() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Wooden acoustic click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.linearRampToValueAtTime(300, now + 0.07);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Play soft pickup sound
    playPickup() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.06);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.07);
    }

    // Soft spring bounce when placement is invalid
    playInvalidBounce() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    /**
     * Clear sound: Continuous, crisp Xylophone Arpeggio (C-D-E-F-G-A-B-C)
     * linesCount: number of lines cleared simultaneously
     * combo: consecutive clearing streak
     */
    playClearArpeggio(linesCount = 1, combo = 1) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const baseIndex = Math.min(combo - 1, 4); // combo shifts pitch up
        const totalNotes = 7 + Math.min(linesCount * 2, 8); // 8-12 crisp notes
        const noteInterval = 0.045; // rapid, sparkling cascade

        for (let i = 0; i < totalNotes; i++) {
            const pitchIndex = (baseIndex + i) % this.scalePitches.length;
            const freq = this.scalePitches[pitchIndex] * (i >= 7 ? 2 : 1);
            const noteTime = now + i * noteInterval;

            this._playXylophoneBar(freq, noteTime, 0.28 + (i * 0.01));
        }

        // Add a sparkling shimmer bell for multiple lines or high combo
        if (linesCount > 1 || combo > 2) {
            const chimeTime = now + (totalNotes * noteInterval) * 0.7;
            this._playChimeChord(baseIndex, chimeTime);
        }
    }

    // Synthesize a single clear Xylophone bar
    _playXylophoneBar(freq, time, volume = 0.3) {
        if (!this.ctx) return;

        // Primary bell tone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator(); // harmonic overtone
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, time);

        // Natural metallic/wood xylophone overtone (roughly 3x-4x fundamental)
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 3.01, time);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, time);
        filter.Q.setValueAtTime(2.0, time);

        // Percussive ADSR envelope with crisp attack and short sweet ring
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0005, time + 0.28);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.3);
        osc2.stop(time + 0.3);
    }

    // Sparkling Chime Chord on Multi-clear
    _playChimeChord(baseIndex, time) {
        if (!this.ctx) return;
        const root = this.scalePitches[(baseIndex + 7) % this.scalePitches.length];
        const chordPitches = [root, root * 1.25, root * 1.5, root * 2];

        chordPitches.forEach((freq, idx) => {
            const t = time + idx * 0.03;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.001, t);
            gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.48);
        });
    }

    // Game Over soothing melody
    playGameOver() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 493.88, 440.00, 392.00, 349.23]; // Descending C5 -> F4
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.16;
            this._playXylophoneBar(freq, t, 0.22);
        });
    }

    // High Score fanfare
    playNewBest() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const t = now + idx * 0.12;
            this._playXylophoneBar(freq * 1.5, t, 0.3);
        });
    }

    // Continuous Relaxing Music Box BGM
    startBGM() {
        this.bgmEnabled = true;
        this.init();
        if (!this.ctx || this.bgmTimer) return;

        this.currentStep = 0;
        this.nextNoteTime = this.ctx.currentTime + 0.1;
        this._scheduleBGM();
    }

    stopBGM() {
        this.bgmEnabled = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    toggleBGM() {
        if (this.bgmEnabled) {
            this.stopBGM();
            return false;
        } else {
            this.startBGM();
            return true;
        }
    }

    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }

    _scheduleBGM() {
        if (!this.bgmEnabled || !this.ctx) return;

        while (this.nextNoteTime < this.ctx.currentTime + 0.3) {
            const step = this.currentStep % this.bgmMelody.length;

            // Play melody note
            const melFreq = this.bgmMelody[step];
            if (melFreq > 0 && !this.isMuted) {
                this._playMusicBoxNote(melFreq, this.nextNoteTime, 0.07);
            }

            // Play soft bass pulse on every 2nd step
            const bassFreq = this.bgmBass[step];
            if (bassFreq > 0 && !this.isMuted) {
                this._playSoftBass(bassFreq, this.nextNoteTime, 0.05);
            }

            this.nextNoteTime += this.stepDuration;
            this.currentStep++;
        }

        this.bgmTimer = setTimeout(() => this._scheduleBGM(), 100);
    }

    _playMusicBoxNote(freq, time, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.52);
    }

    _playSoftBass(freq, time, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.65);
    }
}

// Global instance
window.puzzleAudio = new PuzzleAudio();

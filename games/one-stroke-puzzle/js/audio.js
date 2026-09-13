/**
 * Notebook One-Stroke Line Puzzle - Sound & Continuous BGM Engine (Web Audio API)
 * Plays an 80 BPM healing Music Box / Kalimba melody continuously,
 * with cute water drops, crisp xylophone bell tones (ascending with stroke length),
 * fairy arpeggio on victory, and soft pops on undo.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.bgmEnabled = true;
        this.isMuted = false;

        // 80 BPM Healing Music Box Sequencer
        this.bgmTimer = null;
        this.currentStep = 0;
        this.tempo = 80;
        this.stepDuration = 60 / this.tempo / 2; // ~0.375s per eighth note
        this.nextNoteTime = 0;
        this.scheduleAheadTime = 0.25;

        // Fmaj7 -> G7 -> Em7 -> Am7 Royal Road Loop
        this.melodyTrack = [
            // Bar 1: Fmaj7
            523.25, 659.25, 783.99, 880.00,  659.25, 783.99, 1046.50, 880.00,
            // Bar 2: G7
            783.99, 880.00, 987.77, 1046.50, 880.00, 783.99, 659.25,  587.33,
            // Bar 3: Em7
            659.25, 783.99, 880.00, 1046.50, 783.99, 659.25, 587.33,  523.25,
            // Bar 4: Am7
            587.33, 659.25, 783.99, 659.25,  587.33, 523.25, 440.00,  523.25
        ];

        this.bassTrack = [
            174.61, 0, 261.63, 0,  174.61, 0, 261.63, 0, // F3, C4
            196.00, 0, 293.66, 0,  196.00, 0, 293.66, 0, // G3, D4
            164.81, 0, 246.94, 0,  164.81, 0, 246.94, 0, // E3, B3
            220.00, 0, 261.63, 0,  220.00, 0, 329.63, 0  // A3, C4
        ];

        this.harmonyTrack = [
            349.23, 440.00, 523.25, 659.25,
            392.00, 493.88, 587.33, 783.99,
            329.63, 392.00, 493.88, 659.25,
            440.00, 523.25, 659.25, 880.00
        ];

        // Ascending pentatonic/major scale for path steps
        this.stepPitches = [
            261.63, // C4
            293.66, // D4
            329.63, // E4
            392.00, // G4
            440.00, // A4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99, // G5
            880.00, // A5
            1046.50,// C6
            1174.66,// D6
            1318.51,// E6
            1567.98,// G6
            1760.00 // A6
        ];

        this.setupAutoPlay();
    }

    setupAutoPlay() {
        const startAudio = () => {
            this.init();
            if (this.ctx && this.ctx.state === 'running') {
                this.startBGM();
            }
        };

        const events = ['click', 'touchstart', 'pointerdown', 'keydown', 'mousemove'];
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
        if (!this.ctx || this.isMuted || !this.bgmEnabled) return;
        if (this.bgmTimer) return;

        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.scheduler();
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    scheduler() {
        if (!this.ctx || !this.bgmEnabled || this.isMuted) return;

        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleMusicBoxStep(this.currentStep, this.nextNoteTime);
            this.nextNoteTime += this.stepDuration;
            this.currentStep = (this.currentStep + 1) % this.melodyTrack.length;
        }

        this.bgmTimer = setTimeout(() => this.scheduler(), 50);
    }

    scheduleMusicBoxStep(step, time) {
        if (!this.ctx || this.isMuted || !this.bgmEnabled) return;

        const melodyFreq = this.melodyTrack[step];
        if (melodyFreq) {
            this.playMusicBoxNote(melodyFreq, time, 0.038, 0.45);
        }

        const bassFreq = this.bassTrack[step];
        if (bassFreq) {
            this.playWarmBassNote(bassFreq, time, 0.045, 0.6);
        }

        if (step % 2 === 0) {
            const chordIdx = Math.floor(step / 8) * 4 + ((step / 2) % 4);
            const harmFreq = this.harmonyTrack[chordIdx];
            if (harmFreq) {
                this.playMusicBoxNote(harmFreq, time + 0.04, 0.018, 0.35);
            }
        }
    }

    playMusicBoxNote(freq, time, volume = 0.04, duration = 0.5) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            const oscHarmonic = this.ctx.createOscillator();
            const gainHarmonic = this.ctx.createGain();
            oscHarmonic.type = 'triangle';
            oscHarmonic.frequency.setValueAtTime(freq * 2.001, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            gainHarmonic.gain.setValueAtTime(0, time);
            gainHarmonic.gain.linearRampToValueAtTime(volume * 0.28, time + 0.006);
            gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            oscHarmonic.connect(gainHarmonic);
            gainHarmonic.connect(this.ctx.destination);

            osc.start(time);
            oscHarmonic.start(time);
            osc.stop(time + duration + 0.05);
            oscHarmonic.stop(time + duration + 0.05);
        } catch (e) {}
    }

    playWarmBassNote(freq, time, volume = 0.04, duration = 0.6) {
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(volume, time + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + duration + 0.05);
        } catch (e) {}
    }

    // Sound Effect: Cute Water Drop Swipe
    playWaterDrop() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.exponentialRampToValueAtTime(500, now + 0.09);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.11);
        } catch (e) {}
    }

    // Sound Effect: Crisp Wooden Bell / Xylophone Tone (Ascending with path length)
    playXylophoneTone(stepIndex = 0) {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const pitchIndex = stepIndex % this.stepPitches.length;
            const octaveOffset = Math.floor(stepIndex / this.stepPitches.length);
            let freq = this.stepPitches[pitchIndex];
            if (octaveOffset > 0) {
                freq *= Math.pow(1.2, octaveOffset);
            }

            // Primary Bell/Xylophone Bar Oscillator
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Metallic/Wooden Click overtone
            const overtone = this.ctx.createOscillator();
            const overGain = this.ctx.createGain();
            overtone.type = 'triangle';
            overtone.frequency.setValueAtTime(freq * 3.01, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

            overGain.gain.setValueAtTime(0, now);
            overGain.gain.linearRampToValueAtTime(0.05, now + 0.003);
            overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            overtone.connect(overGain);
            overGain.connect(this.ctx.destination);

            osc.start(now);
            overtone.start(now);
            osc.stop(now + 0.35);
            overtone.stop(now + 0.15);
        } catch (e) {}
    }

    // Sound Effect: Level Complete Fairy Arpeggio
    playFairyArpeggio() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            // Shimmering Cmaj9 -> Fmaj9 fairy chord
            const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98, 2093.00];

            notes.forEach((freq, idx) => {
                const noteTime = now + idx * 0.065;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.11, noteTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.65);
            });
        } catch (e) {}
    }

    // Sound Effect: Soft Undo Pop
    playUndoSound() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(260, now + 0.07);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    // Sound Effect: Button Click
    playClick() {
        if (!this.sfxEnabled || this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.06);
        } catch (e) {}
    }

    // Toggle Audio Mute
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
}

window.soundEngine = new SoundEngine();

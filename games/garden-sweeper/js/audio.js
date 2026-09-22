/**
 * Garden Sweeper - Cozy Synthesized Web Audio System
 * Uses pure Web Audio API without external assets.
 */

class GardenAudio {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('garden_sweeper_muted') === 'true';
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

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('garden_sweeper_muted', this.isMuted);
        return this.isMuted;
    }

    // Dig sound: gentle soil rustle / soft scoop
    playDig() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
    }

    // Planting seedling marker: sweet wooden tap + gentle bell chime
    playFlag() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Wooden tap
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(420, now);
        osc1.frequency.exponentialRampToValueAtTime(140, now + 0.06);

        gain1.gain.setValueAtTime(0.22, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.07);

        // Gentle high chime
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.02);
        osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.14);

        gain2.gain.setValueAtTime(0.12, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.02);
        osc2.stop(now + 0.19);
    }

    // Unflag: gentle pop
    playUnflag() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    // Number reveal: Music box note according to number value (1 to 8)
    playNumber(num) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        // Pentatonic music box scale
        const scale = [
            523.25, // C5 (0/blank)
            587.33, // D5 (1)
            659.25, // E5 (2)
            783.99, // G5 (3)
            880.00, // A5 (4)
            1046.50,// C6 (5)
            1174.66,// D6 (6)
            1318.51,// E6 (7)
            1567.98 // G6 (8)
        ];

        const freq = scale[Math.min(num, scale.length - 1)] || 523.25;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    // Cascade / Flood Fill chime: playful water ripple
    playCascade(step = 0) {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const baseScale = [440, 523.25, 587.33, 659.25, 783.99, 880];
        const freq = baseScale[step % baseScale.length];
        const now = this.ctx.currentTime + (step * 0.035);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Encountering cute weed: Soft warm marimba / cute cartoon "wobble"
    playWeed() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const tones = [
            { f: 330, t: 0 },
            { f: 293.66, t: 0.1 },
            { f: 349.23, t: 0.2 }
        ];

        tones.forEach(tone => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(tone.f, now + tone.t);
            osc.frequency.exponentialRampToValueAtTime(tone.f * 1.05, now + tone.t + 0.12);

            gain.gain.setValueAtTime(0.18, now + tone.t);
            gain.gain.exponentialRampToValueAtTime(0.001, now + tone.t + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + tone.t);
            osc.stop(now + tone.t + 0.22);
        });
    }

    // Victory Bloom: Sweet harp arpeggio
    playBloom() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

        notes.forEach((freq, idx) => {
            const startT = now + (idx * 0.08);
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startT);

            gain.gain.setValueAtTime(0.14, startT);
            gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startT);
            osc.stop(startT + 0.65);
        });
    }

    // Button click / UI tap
    playTap() {
        if (this.isMuted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
    }
}

window.gardenAudio = new GardenAudio();

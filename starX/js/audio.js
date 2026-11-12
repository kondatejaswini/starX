/**
 * Cosmic Audio Synthesizer (Web Audio API)
 * Space drone, crystal star chimes, target lock beeps, comet whooshes,
 * and astronaut radio telemetry comms.
 */

class CosmicAudio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.isMuted = true;
    this.isInitialized = false;

    // Harmonic pentatonic frequencies for celestial chimes (in Hz)
    this.scale = [
      261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
      523.25, 587.33, 659.25, 783.99, 880.00, // C5 - A5
      1046.50, 1174.66, 1318.51, 1567.98       // C6 - G6
    ];
  }

  init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient Space Drone
      this.setupDrone();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  setupDrone() {
    if (!this.ctx) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    const freqs = [55, 110, 164.81, 220];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 1.5, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + idx * 0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      oscGain.gain.setValueAtTime(0.06 / (idx + 1), this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.droneGain);
      osc.start();
    });
  }

  toggleMute() {
    if (!this.isInitialized) {
      this.init();
      this.isMuted = false;
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.masterGain) {
      const targetGain = this.isMuted ? 0 : 0.8;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.5);
    }

    return !this.isMuted;
  }

  playTargetLockSound(index = 0) {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 880 + (index % 8) * 120;
      osc.frequency.setValueAtTime(baseFreq * 0.7, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  playCometFlybySound() {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.7);
      filter.frequency.exponentialRampToValueAtTime(150, now + 1.5);
      filter.Q.value = 3.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 1.5);
    } catch (e) {}
  }

  playAstronautRadioChirp() {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.setValueAtTime(1800, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  playStarChime(index = 0, pitchVariation = 0) {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;

    try {
      const now = this.ctx.currentTime;
      const noteIdx = (index + pitchVariation) % this.scale.length;
      const freq = this.scale[noteIdx];

      const carrier = this.ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, now);

      const mod = this.ctx.createOscillator();
      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 2.76, now);

      const modGain = this.ctx.createGain();
      modGain.gain.setValueAtTime(freq * 0.6, now);
      modGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      mod.connect(modGain);
      modGain.connect(carrier.frequency);

      const chimeGain = this.ctx.createGain();
      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      let outNode = chimeGain;
      if (this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime((Math.random() - 0.5) * 0.8, now);
        chimeGain.connect(panner);
        outNode = panner;
      }

      carrier.connect(chimeGain);
      outNode.connect(this.masterGain);

      mod.start(now);
      carrier.start(now);
      mod.stop(now + 2.0);
      carrier.stop(now + 2.0);
    } catch (e) {}
  }

  playConstellationCompleteChord() {
    if (this.isMuted || !this.ctx || this.ctx.state === 'suspended') return;

    const chordNotes = [0, 4, 7, 11, 14];
    chordNotes.forEach((offset, idx) => {
      setTimeout(() => {
        this.playStarChime(offset + 3, idx);
      }, idx * 110);
    });
  }
}

window.cosmicAudio = new CosmicAudio();

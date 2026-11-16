class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.droneOsc = null;
    this.subOsc = null;
    this.filter = null;
    this.masterGain = null;
  }

  toggle() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this._setupDrone();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.enabled = !this.enabled;
    const now = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.055 : 0.0, now, 0.18);
    }

    if (this.enabled) {
      this.playClick(720);
    }
    return this.enabled;
  }

  _setupDrone() {
    const now = this.ctx.currentTime;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, now);
    this.filter.Q.setValueAtTime(1.8, now);

    // Subtle deep orbital engine hum (55 Hz + 82.4 Hz fifth)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.setValueAtTime(55, now);

    this.subOsc = this.ctx.createOscillator();
    this.subOsc.type = 'sine';
    this.subOsc.frequency.setValueAtTime(82.41, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.45, now);

    this.droneOsc.connect(this.filter);
    this.subOsc.connect(subGain);
    subGain.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.droneOsc.start();
    this.subOsc.start();
  }

  updateFromScroll(velocity, progress) {
    if (!this.enabled || !this.ctx || !this.filter || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const speed = Math.min(Math.abs(velocity), 40);
    // Cutoff opens smoothly with scroll speed and proximity to the Sun
    const targetFreq = 120 + speed * 14 + progress * 110;
    const targetGain = 0.045 + Math.min(speed * 0.0015, 0.04);

    this.filter.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.masterGain.gain.setTargetAtTime(targetGain, now, 0.1);
  }

  playClick(freq = 860) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.55, now + 0.045);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } catch {
      // Safe no-op if audio blocked
    }
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();

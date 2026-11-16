class Soundscape {
  constructor() {
    this.ctx = null;
    this.active = false;
    this.gain = null;
    this.filter = null;
  }

  toggle() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();

      this.gain = this.ctx.createGain();
      this.gain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(110, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.6, this.ctx.currentTime);

      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(48, this.ctx.currentTime);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(72, this.ctx.currentTime);

      const g2 = this.ctx.createGain();
      g2.gain.setValueAtTime(0.5, this.ctx.currentTime);

      osc1.connect(this.filter);
      osc2.connect(g2);
      g2.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.active = !this.active;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setTargetAtTime(this.active ? 0.045 : 0, now, 0.22);

    if (this.active) this.tick(760);
    return this.active;
  }

  modulate(velocity, progress) {
    if (!this.active || !this.ctx || !this.filter || !this.gain) return;
    const now = this.ctx.currentTime;
    const v = Math.min(Math.abs(velocity), 45);
    this.filter.frequency.setTargetAtTime(110 + v * 12 + progress * 140, now, 0.08);
    this.gain.gain.setTargetAtTime(0.04 + Math.min(v * 0.0012, 0.035), now, 0.12);
  }

  tick(freq = 840) {
    if (!this.active || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.52, now + 0.04);
      g.gain.setValueAtTime(0.045, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Safe fallback
    }
  }

  dispose() {
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const soundscape = new Soundscape();

/**
 * ROAD TO PRO — SYNTHESIZER AUDIO ENGINE (Web Audio API)
 */

class AudioFXEngine {
  constructor() {
    this.ctx = null;
    this.isEnabled = true;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTaskComplete() {
    if (!this.isEnabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator(), osc2 = this.ctx.createOscillator(), gain = this.ctx.createGain();

    osc1.type = 'sine'; osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain); osc2.connect(gain); gain.connect(this.ctx.destination);
    osc1.start(now); osc2.start(now);
    osc1.stop(now + 0.25); osc2.stop(now + 0.25);
  }

  playLevelUp() {
    if (!this.isEnabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, index) => {
      const startTime = now + (index * 0.08);
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(startTime); osc.stop(startTime + 0.25);
    });
  }

  playButtonClick() {
    if (!this.isEnabled) return;
    this.initContext();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(now); osc.stop(now + 0.03);
  }

  toggleAudio() {
    this.isEnabled = !this.isEnabled;
    const icon = document.getElementById('audioToggleIcon');
    if (icon) {
      icon.className = this.isEnabled ? 'fa-solid fa-volume-high text-gold-400' : 'fa-solid fa-volume-xmark text-slate-500';
    }
    return this.isEnabled;
  }
}

window.audioFX = new AudioFXEngine();

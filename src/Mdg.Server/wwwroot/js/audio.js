/**
 * Web Audio API Sound Synthesizer
 */

export const AudioEngine = {
  ctx: null,
  masterVolume: 1.0,
  sfxVolume: 1.0,
  isMuted: false,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
  },

  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  },

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  },

  setMuted(muted) {
    this.isMuted = !!muted;
  },

  playTone(freq, type, duration, gain = 0.1) {
    if (this.isMuted) return;
    const effectiveGain = gain * this.masterVolume * this.sfxVolume;
    if (effectiveGain <= 0.0001) return;

    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gNode = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gNode.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
      gNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gNode);
      gNode.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  playLootDrop(rarity) {
    this.init();
    if (rarity === 'Unique' || rarity === 'Set') {
      this.playTone(880, 'sine', 0.4, 0.18);
      setTimeout(() => this.playTone(1174.66, 'triangle', 0.45, 0.18), 60);
      setTimeout(() => this.playTone(1320, 'sine', 0.6, 0.2), 120);
    } else if (rarity === 'Rare' || rarity === 'Currency' || rarity === 'Consumable') {
      this.playTone(720, 'triangle', 0.3, 0.15);
      setTimeout(() => this.playTone(1080, 'sine', 0.4, 0.15), 60);
    } else {
      this.playTone(440, 'triangle', 0.2, 0.08);
    }
  },
  playPickup() {
    this.init();
    this.playTone(580, 'sine', 0.15, 0.12);
    setTimeout(() => this.playTone(880, 'sine', 0.25, 0.15), 50);
  },
  playHit(isCrit) {
    this.init();
    if (isCrit) {
      this.playTone(180, 'sawtooth', 0.25, 0.2);
      setTimeout(() => this.playTone(360, 'sine', 0.3, 0.15), 30);
    } else {
      this.playTone(120, 'square', 0.12, 0.08);
    }
  },
  playLevelUp() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((note, idx) => {
      setTimeout(() => this.playTone(note, 'triangle', 0.35, 0.15), idx * 100);
    });
  },
  playSkillLevelUp() {
    this.init();
    this.playTone(659.25, 'sine', 0.2, 0.15);
    setTimeout(() => this.playTone(987.77, 'sine', 0.3, 0.18), 70);
  },
  playPortal() {
    this.init();
    this.playTone(320, 'sine', 0.2, 0.15);
    setTimeout(() => this.playTone(480, 'sine', 0.25, 0.15), 100);
    setTimeout(() => this.playTone(640, 'sine', 0.35, 0.2), 200);
  }
};

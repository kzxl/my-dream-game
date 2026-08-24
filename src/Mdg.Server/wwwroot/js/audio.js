/**
 * Web Audio API Sound Synthesizer
 */

export const AudioEngine = {
  ctx: null,
  masterVolume: 1.0,
  sfxVolume: 1.0,
  isMuted: false,
  lastHitSoundTime: 0,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
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
        this.ctx.resume().catch(() => {});
      }
      const curTime = this.ctx.currentTime || 0;
      const osc = this.ctx.createOscillator();
      const gNode = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, curTime);
      gNode.gain.setValueAtTime(Math.max(0.0001, effectiveGain), curTime);
      gNode.gain.linearRampToValueAtTime(0.0001, curTime + duration);
      osc.connect(gNode);
      gNode.connect(this.ctx.destination);

      osc.onended = () => {
        try {
          osc.disconnect();
          gNode.disconnect();
        } catch (e) {}
      };

      osc.start(curTime);
      osc.stop(curTime + duration);
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
    const now = performance.now();
    if (now - this.lastHitSoundTime < 40) return; // Throttled to prevent audio graph flooding on AoE hits
    this.lastHitSoundTime = now;
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

// Auto-unlock AudioContext on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    AudioEngine.init();
    if (AudioEngine.ctx && AudioEngine.ctx.state === 'suspended') {
      AudioEngine.ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
}

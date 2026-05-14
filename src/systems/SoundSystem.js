/**
 * Simple Web Audio API sound system.
 * Generates dynamic beeps and tones for game events.
 */
export class SoundSystem {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.masterGain = null;
    this.init();
  }

  init() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn("Web Audio API not supported");
        this.enabled = false;
        return;
      }
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.15;
    } catch (e) {
      console.warn("Failed to initialize audio:", e);
      this.enabled = false;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = enabled ? 0.15 : 0;
    }
  }

  playBeep(frequency, duration, volume = 0.2) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.frequency.value = frequency;
      osc.type = "sine";

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Silently fail if audio context is closed or suspended
    }
  }

  playDestruction() {
    // Higher pitched explosion: 420 Hz, quick
    this.playBeep(420, 0.15, 0.3);
    setTimeout(() => this.playBeep(320, 0.1, 0.2), 50);
  }

  playStarPickup() {
    // Ascending happy tones
    this.playBeep(330, 0.12, 0.25);
    setTimeout(() => this.playBeep(440, 0.12, 0.25), 80);
    setTimeout(() => this.playBeep(550, 0.15, 0.3), 160);
  }

  playNearMiss() {
    // Quick sharp beep
    this.playBeep(280, 0.08, 0.2);
  }

  playGameOver() {
    // Descending sad tone
    this.playBeep(440, 0.15, 0.3);
    setTimeout(() => this.playBeep(330, 0.2, 0.3), 100);
    setTimeout(() => this.playBeep(220, 0.3, 0.3), 250);
  }

  playModeToggle() {
    // Simple confirmation beep
    this.playBeep(500, 0.1, 0.25);
  }

  playCollision() {
    // Missile-to-missile collision: punchy double beep
    this.playBeep(380, 0.1, 0.25);
    setTimeout(() => this.playBeep(280, 0.12, 0.2), 60);
  }
}

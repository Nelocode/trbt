// Utilidad de audio sintetizado con Web Audio API (Sin archivos externos, 100% ligero y nativo)
class AudioFeedbackService {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('rocketbot_sound_enabled');
        this.isEnabled = stored !== 'false';
      } catch {
        this.isEnabled = true;
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(): boolean {
    this.isEnabled = !this.isEnabled;
    try {
      localStorage.setItem('rocketbot_sound_enabled', String(this.isEnabled));
    } catch {}
    if (this.isEnabled) {
      this.playChimeSuccess();
    }
    return this.isEnabled;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  // Tono ascendente armónico agradable de ganancia / profit
  public playChimeSuccess() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Acorde mayor)

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.36);
      });
    } catch {}
  }

  // Tono suave y protector de defensa / stop loss seguro
  public playShieldTone() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440.0, 329.63]; // A4 -> E4 (calmante)

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.06, now + index * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.42);
      });
    } catch {}
  }

  // Tono sutil táctil de click
  public playClickTick() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Tono triunfal icónico estilo Xbox / Steam Achievement Unlocked
  public playAchievementFanfare() {
    if (!this.isEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Secuencia armónica brillante: F5, G5, A5, C6, D6, F6
      const notes = [698.46, 783.99, 880.00, 1046.50, 1174.66, 1396.91];

      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Mezcla onda triangular y senoidal para un brillo campana metálica
        osc.type = index === notes.length - 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.065);

        const duration = index === notes.length - 1 ? 0.75 : 0.28;
        const noteStart = now + index * 0.065;

        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0005, noteStart + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + duration);
      });
    } catch {}
  }
}

export const audioFeedback = new AudioFeedbackService();

export type SFXType =
  | 'chop'
  | 'mine'
  | 'harvest'
  | 'pickup'
  | 'unlock_tile'
  | 'deposit'
  | 'attack'
  | 'hit_enemy'
  | 'player_hurt'
  | 'dash'
  | 'boss_roar'
  | 'boss_slam'
  | 'level_up'
  | 'ui_click'
  | 'quest_complete'
  | 'heal';

export type MusicTheme = 'peaceful_meadow' | 'mystic_forest' | 'crystal_echoes' | 'molten_fury' | 'boss_battle';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;

  private currentTheme: MusicTheme = 'peaceful_meadow';
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    const resumeAudio = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.setupGainNodes();
        if (this.isMusicPlaying) {
          this.startMusic();
        }
      } else if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
      window.removeEventListener('touchstart', resumeAudio);
    };

    window.addEventListener('click', resumeAudio);
    window.addEventListener('keydown', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);
  }

  private setupGainNodes(): void {
    if (!this.ctx) return;
    this.masterGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();

    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, now);
    this.musicGain.gain.setValueAtTime(this.musicVolume, now);
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, now);
  }

  public setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  public setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  public setSFXVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.applyVolumes();
    return this.isMuted;
  }

  public getSettings() {
    return {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted
    };
  }

  // --- SÍNTESIS PROCEDURAL DE EFECTOS DE SONIDO ---
  public playSFX(type: SFXType, pitchMod: number = 1.0): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const t = this.ctx.currentTime;

    switch (type) {
      case 'chop': {
        // Impacto sordo con resonancia de madera
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const freq = (140 + Math.random() * 30) * pitchMod;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);

        // Ruido para el crujido
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }

      case 'mine': {
        // Tintineo metálico agudo + golpe rocoso
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const freq = (580 + Math.random() * 80) * pitchMod;
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.15);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }

      case 'harvest': {
        // Pop brillante
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(700 * pitchMod, t + 0.08);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }

      case 'pickup': {
        // Campanita aguda y agradable
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const note = (880 + Math.random() * 120) * pitchMod;
        osc.frequency.setValueAtTime(note, t);
        osc.frequency.exponentialRampToValueAtTime(note * 1.5, t + 0.1);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.11);
        break;
      }

      case 'deposit': {
        // Clic rítmico suave de transferencia
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(260, t + 0.04);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }

      case 'unlock_tile': {
        // Fanfarria arpegiada mágica de emergencia de losa
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C E G C E
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * pitchMod, t + idx * 0.06);

          gain.gain.setValueAtTime(0.0, t + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.06 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);

          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(t + idx * 0.06);
          osc.stop(t + idx * 0.06 + 0.36);
        });
        break;
      }

      case 'attack': {
        // Whoosh de espada
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'hit_enemy': {
        // Impacto y crujido
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180 * pitchMod, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }

      case 'player_hurt': {
        // Golpe profundo
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.2);

        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.22);
        break;
      }

      case 'dash': {
        // Ráfaga de aire rápida
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.15);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }

      case 'boss_roar': {
        // Rugido colosal con osciladores dobles modulados
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(90, t);
        osc1.frequency.linearRampToValueAtTime(160, t + 0.4);
        osc1.frequency.exponentialRampToValueAtTime(45, t + 1.2);

        osc2.frequency.setValueAtTime(60, t);
        osc2.frequency.linearRampToValueAtTime(110, t + 0.5);
        osc2.frequency.exponentialRampToValueAtTime(30, t + 1.2);

        gain.gain.setValueAtTime(0.0, t);
        gain.gain.linearRampToValueAtTime(0.7, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 1.25);
        osc2.stop(t + 1.25);
        break;
      }

      case 'boss_slam': {
        // Golpe sísmico
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(20, t + 0.4);

        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.46);
        break;
      }

      case 'level_up': {
        // Triunfal acorde de poder
        const chord = [329.63, 415.30, 493.88, 659.25]; // E major
        chord.forEach((f, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + i * 0.08);

          gain.gain.setValueAtTime(0, t + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.3, t + i * 0.08 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(t + i * 0.08);
          osc.stop(t + i * 0.08 + 0.65);
        });
        break;
      }

      case 'ui_click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }

      case 'heal': {
        // Tono ascendente relajante
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.26);
        break;
      }
    }
  }

  // --- MÚSICA AMBIENTAL PROCEDURAL DINÁMICA ---
  public playMusicTheme(theme: MusicTheme): void {
    if (this.currentTheme === theme && this.isMusicPlaying) return;
    this.currentTheme = theme;
    this.startMusic();
  }

  public startMusic(): void {
    this.isMusicPlaying = true;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    if (!this.ctx || !this.musicGain) return;

    // Escalas y progresiones por bioma
    const themes: Record<MusicTheme, { scale: number[]; tempo: number; instrument: OscillatorType }> = {
      peaceful_meadow: {
        scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // C Major Pentatonic
        tempo: 650,
        instrument: 'sine'
      },
      mystic_forest: {
        scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00], // A Minor Pentatonic
        tempo: 750,
        instrument: 'triangle'
      },
      crystal_echoes: {
        scale: [277.18, 329.63, 369.99, 415.30, 493.88, 554.37], // C# Minor Pentatonic
        tempo: 850,
        instrument: 'sine'
      },
      molten_fury: {
        scale: [146.83, 174.61, 196.00, 220.00, 261.63, 293.66], // D Minor
        tempo: 500,
        instrument: 'sawtooth'
      },
      boss_battle: {
        scale: [110.00, 130.81, 146.83, 164.81, 196.00, 220.00], // Fast driving battle
        tempo: 320,
        instrument: 'triangle'
      }
    };

    let step = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      if (this.ctx.state === 'suspended') return;

      const conf = themes[this.currentTheme] || themes.peaceful_meadow;
      const t = this.ctx.currentTime;

      // Note selection with subtle algorithm
      const noteIdx = (step % 2 === 0)
        ? Math.floor(Math.random() * conf.scale.length)
        : (step % conf.scale.length);
      const freq = conf.scale[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = conf.instrument;
      osc.frequency.setValueAtTime(freq, t);

      // Warm ambient envelope
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (conf.tempo / 1000) * 1.6);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + (conf.tempo / 1000) * 1.8);

      // Bass drone every 4 steps
      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(conf.scale[0] * 0.5, t);

        bassGain.gain.setValueAtTime(0.001, t);
        bassGain.gain.linearRampToValueAtTime(0.12, t + 0.15);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, t + (conf.tempo / 1000) * 3.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(t);
        bassOsc.stop(t + (conf.tempo / 1000) * 3.8);
      }

      step++;
    }, themes[this.currentTheme]?.tempo || 650);
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const AudioSys = new AudioManager();


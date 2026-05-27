import type { MusicState, AudioSettings } from './types';
import { DEFAULT_AUDIO_SETTINGS } from './types';
import { loadAudioSettings, saveAudioSettings } from './settings';
import { getSharedContext } from './oscillator';
import { stopMusic } from './music';
import { playSfx, setSfxVolume, type SfxType } from './sfx';
import { playAmbience, stopAmbience, setAmbienceVolume } from './ambience';

class AudioManager {
  private settings: AudioSettings;
  private initialized = false;
  private _lastHeatLevel: string = 'low';
  private _lastCountryId: string = 'colombia';
  private _lastWealthTier: number = 0;

  constructor() {
    this.settings = loadAudioSettings();
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.applySettings();

    // Resume AudioContext on first user interaction
    const resume = () => {
      const ctx = getSharedContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          // Context is now running — safe to start audio
        });
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
  }

  // Explicit resume for button-triggered audio (waits for context to be ready)
  async resumeAudioFromUserGesture(): Promise<void> {
    const ctx = getSharedContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  private applySettings(): void {
    // Music intentionally disabled; keep setting for backward compatibility only.
    stopMusic();
    setSfxVolume(this.settings.sfxVolume * this.settings.masterVolume);
    setAmbienceVolume(this.settings.ambienceVolume * this.settings.masterVolume);
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  updateSettings(partial: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.applySettings();
    saveAudioSettings(this.settings);
  }

  toggleMute(): void {
    this.updateSettings({ muted: !this.settings.muted });
    if (this.settings.muted) {
      this.stopAll();
    } else {
      this.applySettings();
    }
  }

  isMuted(): boolean {
    return this.settings.muted;
  }

  // Music control
  playMusic(state: MusicState): void {
    void state;
    // Intentionally disabled.
  }

  stopMusic(): void {
    stopMusic();
  }

  // SFX
  playSfx(type: SfxType): void {
    if (this.settings.muted) return;
    playSfx(type);
  }

  // Ambience
  playAmbience(countryId: string): void {
    if (this.settings.muted) return;
    playAmbience(countryId);
    this._lastCountryId = countryId;
  }

  stopAmbience(): void {
    stopAmbience();
  }

  // Adaptive state based on game state
  updateFromGameState(gameState: {
    heat: number;
    currentCountryId: string;
    cash: number;
    pendingEvent: boolean;
    runActive: boolean;
  }): void {
    if (this.settings.muted) return;

    const heatLevel = gameState.heat >= 80 ? 'critical' : gameState.heat >= 50 ? 'high' : gameState.heat >= 25 ? 'medium' : 'low';
    const wealthTier = gameState.cash >= 50000 ? 5 : gameState.cash >= 20000 ? 4 : gameState.cash >= 10000 ? 3 : gameState.cash >= 5000 ? 2 : 1;

    // Music intentionally disabled.

    // Ambience changes
    if (gameState.currentCountryId !== this._lastCountryId) {
      this.playAmbience(gameState.currentCountryId);
    }

    // Heat-based siren SFX
    if (heatLevel === 'critical' && this._lastHeatLevel !== 'critical') {
      this.playSfx('siren');
    }
    if (heatLevel === 'high' && this._lastHeatLevel !== 'high') {
      this.playSfx('alert');
    }

    this._lastHeatLevel = heatLevel;
    this._lastCountryId = gameState.currentCountryId;
    this._lastWealthTier = wealthTier;
  }

  playMenuMusic(): void {
    // Intentionally disabled.
  }

  stopAll(): void {
    this.stopMusic();
    this.stopAmbience();
  }
}

export const audioManager = new AudioManager();

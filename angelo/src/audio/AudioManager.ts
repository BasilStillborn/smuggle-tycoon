import type { AudioSettings } from './types';
import { DEFAULT_AUDIO_SETTINGS } from './types';
import { loadAudioSettings, saveAudioSettings } from './settings';
import { getSharedContext } from './oscillator';
import { playSfx, setSfxVolume, type SfxType } from './sfx';
import { playAmbience, stopAmbience, setAmbienceVolume } from './ambience';

class AudioManager {
  private settings: AudioSettings;
  private initialized = false;
  private _lastHeatLevel: string = 'low';
  private _lastCountryId: string = 'colombia';

  constructor() {
    this.settings = loadAudioSettings();
  }

  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.applySettings();

    const resume = () => {
      const ctx = getSharedContext();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {});
      }
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
  }

  async resumeAudioFromUserGesture(): Promise<void> {
    const ctx = getSharedContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  private applySettings(): void {
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

  playSfx(type: SfxType): void {
    if (this.settings.muted) return;
    playSfx(type);
  }

  playAmbience(countryId: string): void {
    if (this.settings.muted) return;
    playAmbience(countryId);
    this._lastCountryId = countryId;
  }

  stopAmbience(): void {
    stopAmbience();
  }

  updateFromGameState(gameState: {
    heat: number;
    currentCountryId: string;
    cash: number;
    pendingEvent: boolean;
    runActive: boolean;
  }): void {
    if (this.settings.muted) return;

    const heatLevel = gameState.heat >= 80 ? 'critical' : gameState.heat >= 50 ? 'high' : gameState.heat >= 25 ? 'medium' : 'low';

    if (gameState.currentCountryId !== this._lastCountryId) {
      this.playAmbience(gameState.currentCountryId);
    }

    if (heatLevel === 'critical' && this._lastHeatLevel !== 'critical') {
      this.playSfx('siren');
    }
    if (heatLevel === 'high' && this._lastHeatLevel !== 'high') {
      this.playSfx('alert');
    }

    this._lastHeatLevel = heatLevel;
    this._lastCountryId = gameState.currentCountryId;
  }

  stopAll(): void {
    this.stopAmbience();
  }
}

export const audioManager = new AudioManager();

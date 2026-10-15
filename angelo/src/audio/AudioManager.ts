import type { AudioSettings } from './types';
import { DEFAULT_AUDIO_SETTINGS } from './types';
import { loadAudioSettings, saveAudioSettings } from './settings';
import { getSharedContext } from './oscillator';
import { playSfx, setSfxVolume, type SfxType } from './sfx';

class AudioManager {
  private settings: AudioSettings;
  private initialized = false;
  private _lastHeatLevel: string = 'low';

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
      document.removeEventListener('touchstart', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('keydown', resume);
    document.addEventListener('touchstart', resume);
  }

  async resumeAudioFromUserGesture(): Promise<void> {
    const ctx = getSharedContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  private applySettings(): void {
    setSfxVolume(this.settings.sfxVolume * this.settings.masterVolume);
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
  }

  isMuted(): boolean {
    return this.settings.muted;
  }

  playSfx(type: SfxType): void {
    if (this.settings.muted) return;
    playSfx(type);
  }

  updateFromGameState(gameState: { heat: number; pendingEvent: boolean; runActive: boolean }): void {
    if (this.settings.muted) return;

    const heatLevel = gameState.heat >= 80 ? 'critical' : gameState.heat >= 50 ? 'high' : gameState.heat >= 25 ? 'medium' : 'low';

    if (heatLevel === 'critical' && this._lastHeatLevel !== 'critical') {
      this.playSfx('siren');
    } else if (heatLevel === 'high' && this._lastHeatLevel !== 'high') {
      this.playSfx('alert');
    }

    this._lastHeatLevel = heatLevel;
  }

  stopAll(): void {
    /* SFX are one-shots; nothing to stop */
  }
}

export const audioManager = new AudioManager();

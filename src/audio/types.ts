export type MusicState = 'menu' | 'normal' | 'high_heat' | 'encounter' | 'luxury' | 'arrest';

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  muted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0,
  sfxVolume: 0.8,
  ambienceVolume: 0.3,
  muted: false,
};

export interface AudioNodeRef {
  source: OscillatorNode | AudioBufferSourceNode | null;
  gain: GainNode;
  stop: () => void;
}

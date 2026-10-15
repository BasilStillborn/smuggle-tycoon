export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
};

export interface AudioNodeRef {
  source: OscillatorNode | AudioBufferSourceNode | null;
  gain: GainNode;
  stop: () => void;
}

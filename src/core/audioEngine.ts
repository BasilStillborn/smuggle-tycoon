import type { ElementCategory } from '../data/elements';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private initialized = false;
  private lastTempThreshold = 0;
  private lastPressureThreshold = 0;
  private lastColdness = 0;
  private lastHeat = 0;

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
    } catch {
      console.warn('AudioEngine: Web Audio API not available');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  isMuted() {
    return this.muted;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playNoise(duration: number, freqRange: [number, number] = [2000, 6000], gain = 0.15) {
    if (!this.ctx || this.muted) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freqRange[0] + Math.random() * (freqRange[1] - freqRange[0]);
    filter.Q.value = 2;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  elementSelect(category: ElementCategory) {
    const freqMap: Record<ElementCategory, number> = {
      'alkali-metal': 520, 'alkaline-earth-metal': 580, 'transition-metal': 640,
      'post-transition-metal': 700, metalloid: 760, 'reactive-nonmetal': 820,
      'noble-gas': 880, halogen: 940, lanthanide: 1000, actinide: 1060, unknown: 1120
    };
    const freq = freqMap[category] ?? 440;
    this.playTone(freq, 0.12, 'sine', 0.25);
    this.playTone(freq * 1.5, 0.08, 'sine', 0.1);
  }

  elementDeselect() {
    this.playTone(400, 0.1, 'sine', 0.2);
    this.playTone(300, 0.08, 'sine', 0.1);
  }

  buttonClick() {
    this.playTone(800, 0.04, 'sine', 0.3);
    this.playNoise(0.02, [4000, 6000], 0.08);
  }

  reactionFire(animation: string) {
    this.playTone(200, 0.3, 'sawtooth', 0.4);
    setTimeout(() => this.playTone(400, 0.2, 'sawtooth', 0.3), 50);
    setTimeout(() => this.playTone(800, 0.15, 'square', 0.25), 120);
    if (animation === 'flame' || animation === 'storm' || animation === 'spark') {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => this.playNoise(0.15, [2000, 5000], 0.12), i * 30);
      }
    }
  }

  reactionSuccess() {
    this.playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 200);
    setTimeout(() => this.playTone(1047, 0.25, 'sine', 0.4), 300);
  }

  leverDrag() {
    this.playTone(600, 0.02, 'square', 0.08);
  }

  updateEnvironment(tempK: number, pressureAtm: number) {
    if (!this.ctx || this.muted) return;

    const coldness = Math.max(0, Math.min(1, (273 - tempK) / 233));
    const heat = Math.max(0, Math.min(1, (tempK - 320) / 420));
    const extreme = Math.max(0, Math.min(1, (tempK - 720) / 180));
    const pressureNorm = Math.max(0, Math.min(1, pressureAtm / 7));

    // Frost forming - trigger when coldness crosses thresholds (0.3, 0.6)
    const coldThresholds = [0.3, 0.6];
    for (const t of coldThresholds) {
      if (this.lastColdness < t && coldness >= t) {
        this.frostForming();
      }
    }
    this.lastColdness = coldness;

    // Heat intensifying - trigger when heat crosses thresholds (0.3, 0.6)
    const heatThresholds = [0.3, 0.6];
    for (const t of heatThresholds) {
      if (this.lastHeat < t && heat >= t) {
        this.heatIntensifying();
      }
    }
    this.lastHeat = heat;

    // Pressure change ratchet at 1 atm increments
    const pressureSteps = Math.floor(pressureAtm);
    if (pressureSteps !== this.lastPressureThreshold) {
      if (pressureSteps > this.lastPressureThreshold) {
        this.playTone(400 + pressureSteps * 50, 0.03, 'square', 0.1);
      } else {
        this.playTone(300 + pressureSteps * 50, 0.03, 'square', 0.1);
      }
      this.lastPressureThreshold = pressureSteps;
    }
  }

  frostForming() {
    if (!this.ctx || this.muted) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.playTone(2000 + i * 400 + Math.random() * 300, 0.1, 'sine', 0.15), i * 40);
    }
  }

  heatIntensifying() {
    if (!this.ctx || this.muted) return;
    this.playNoise(0.4, [800, 3000], 0.1);
    this.playTone(100, 0.3, 'sine', 0.15);
  }
}

export const audioEngine = new AudioEngine();
function getAudioContext(): AudioContext {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

let sharedCtx: AudioContext | null = null;

export function getSharedContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = getAudioContext();
  }
  if (sharedCtx.state === 'suspended') {
    sharedCtx.resume();
  }
  return sharedCtx;
}

export function playTone(
  ctx: AudioContext,
  dest: GainNode,
  frequency: number,
  type: OscillatorType,
  duration: number,
  startTime: number,
  volume: number,
  rampDown?: boolean
): OscillatorNode {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(volume, startTime);
  if (rampDown !== false) {
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  }

  osc.connect(gain);
  gain.connect(dest);

  osc.start(startTime);
  osc.stop(startTime + duration);

  return osc;
}

export function playNoise(
  ctx: AudioContext,
  dest: GainNode,
  duration: number,
  startTime: number,
  volume: number
): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  source.connect(gain);
  gain.connect(dest);

  source.start(startTime);
  source.stop(startTime + duration);

  return source;
}

export function createContinuousOscillator(
  ctx: AudioContext,
  dest: GainNode,
  frequency: number,
  type: OscillatorType,
  volume: number
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);

  osc.connect(gain);
  gain.connect(dest);

  osc.start();

  return { osc, gain };
}

export function createLFO(
  ctx: AudioContext,
  frequency: number,
  amplitude: number
): { osc: OscillatorNode; gain: GainNode } {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(amplitude, ctx.currentTime);

  osc.connect(gain);
  osc.start();

  return { osc, gain };
}

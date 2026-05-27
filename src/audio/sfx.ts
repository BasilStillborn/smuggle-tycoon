import { getSharedContext, playTone, playNoise } from './oscillator';
import cashRegisterUrl from './assets/cash-register.wav';

export type SfxType =
   | 'click' | 'hover'
   | 'buy' | 'sell'
   | 'travel_depart' | 'travel_arrive'
   | 'customs_clear'
   | 'success' | 'failure'
   | 'siren' | 'alert'
   | 'cash'
   | 'cash_register'
   | 'bust'
   | 'event_appear';

let volume = 0.8;
let cashRegisterBuffer: AudioBuffer | null = null;
let cashRegisterLoad: Promise<void> | null = null;

async function ensureCashRegisterBuffer(ctx: AudioContext): Promise<void> {
  if (cashRegisterBuffer) return;
  if (cashRegisterLoad) return cashRegisterLoad;
  cashRegisterLoad = (async () => {
    const res = await fetch(cashRegisterUrl);
    const arr = await res.arrayBuffer();
    cashRegisterBuffer = await ctx.decodeAudioData(arr.slice(0));
  })().finally(() => {
    cashRegisterLoad = null;
  });
  return cashRegisterLoad;
}

function playBuffer(ctx: AudioContext, gain: GainNode, buffer: AudioBuffer, when: number, amp = 1): void {
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  g.gain.setValueAtTime(amp, when);
  src.buffer = buffer;
  src.connect(g);
  g.connect(gain);
  src.start(when);
}

export function setSfxVolume(v: number): void {
  volume = v;
}

export function playSfx(type: SfxType): void {
  const ctx = getSharedContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

    switch (type) {
    case 'click':
      // Softer modern UI tap: short thock + tiny bright tick
      playTone(ctx, masterGain, 220, 'triangle', 0.10, now, 0.045);
      playTone(ctx, masterGain, 1500, 'sine', 0.025, now + 0.01, 0.03);
      playNoise(ctx, masterGain, 0.018, now, 0.02);
      break;

    case 'hover':
      playTone(ctx, masterGain, 980, 'sine', 0.02, now, 0.035);
      break;

    case 'buy':
      playTone(ctx, masterGain, 523, 'triangle', 0.08, now, 0.2);
      playTone(ctx, masterGain, 659, 'triangle', 0.08, now + 0.06, 0.15);
      playTone(ctx, masterGain, 784, 'triangle', 0.12, now + 0.12, 0.12);
      break;

    case 'sell':
      playTone(ctx, masterGain, 784, 'triangle', 0.1, now, 0.2);
      playTone(ctx, masterGain, 659, 'triangle', 0.1, now + 0.08, 0.18);
      playTone(ctx, masterGain, 523, 'triangle', 0.15, now + 0.16, 0.15);
      break;

    case 'travel_depart':
      playNoise(ctx, masterGain, 0.3, now, 0.12);
      playTone(ctx, masterGain, 200, 'sawtooth', 0.4, now, 0.1, true);
      break;

    case 'travel_arrive':
      playTone(ctx, masterGain, 300, 'sine', 0.15, now, 0.15);
      playTone(ctx, masterGain, 400, 'sine', 0.15, now + 0.1, 0.12);
      playTone(ctx, masterGain, 500, 'sine', 0.2, now + 0.2, 0.1);
      break;

    case 'customs_clear':
      // Softer "approved" checkpoint sound: stamp tick + warm chime
      playTone(ctx, masterGain, 260, 'triangle', 0.065, now, 0.04);
      playTone(ctx, masterGain, 780, 'sine', 0.04, now + 0.03, 0.06);
      playTone(ctx, masterGain, 980, 'sine', 0.03, now + 0.08, 0.05);
      break;

    case 'success':
      playTone(ctx, masterGain, 523, 'sine', 0.12, now, 0.2);
      playTone(ctx, masterGain, 659, 'sine', 0.12, now + 0.1, 0.2);
      playTone(ctx, masterGain, 784, 'sine', 0.12, now + 0.2, 0.2);
      playTone(ctx, masterGain, 1047, 'sine', 0.25, now + 0.3, 0.25);
      break;

    case 'failure':
      playTone(ctx, masterGain, 400, 'sawtooth', 0.15, now, 0.2);
      playTone(ctx, masterGain, 300, 'sawtooth', 0.15, now + 0.12, 0.2);
      playTone(ctx, masterGain, 200, 'sawtooth', 0.3, now + 0.24, 0.2);
      break;

    case 'siren': {
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.25;
        playTone(ctx, masterGain, 800, 'square', 0.12, t, 0.15);
        playTone(ctx, masterGain, 600, 'square', 0.12, t + 0.12, 0.15);
      }
      break;
    }

    case 'alert':
      playTone(ctx, masterGain, 1000, 'square', 0.08, now, 0.2);
      playTone(ctx, masterGain, 800, 'square', 0.08, now + 0.1, 0.2);
      playTone(ctx, masterGain, 1000, 'square', 0.08, now + 0.2, 0.2);
      break;

    case 'cash':
      playTone(ctx, masterGain, 1200, 'sine', 0.05, now, 0.1);
      playTone(ctx, masterGain, 1400, 'sine', 0.05, now + 0.05, 0.1);
      playTone(ctx, masterGain, 1600, 'sine', 0.05, now + 0.1, 0.1);
      break;

    case 'cash_register':
      if (cashRegisterBuffer) {
        playBuffer(ctx, masterGain, cashRegisterBuffer, now, 0.9);
      } else {
        void ensureCashRegisterBuffer(ctx);
        // fallback "cha-ching" synth for first play or load failure
        playTone(ctx, masterGain, 1050, 'triangle', 0.08, now, 0.09);
        playTone(ctx, masterGain, 1450, 'triangle', 0.08, now + 0.05, 0.08);
        playTone(ctx, masterGain, 2200, 'sine', 0.05, now + 0.1, 0.06);
      }
      break;

    case 'bust':
      playTone(ctx, masterGain, 200, 'sawtooth', 0.3, now, 0.3);
      playTone(ctx, masterGain, 150, 'sawtooth', 0.4, now + 0.2, 0.3);
      playNoise(ctx, masterGain, 0.5, now, 0.15);
      break;

    case 'event_appear':
      playTone(ctx, masterGain, 440, 'triangle', 0.1, now, 0.15);
      playTone(ctx, masterGain, 660, 'triangle', 0.1, now + 0.1, 0.12);
      playTone(ctx, masterGain, 880, 'triangle', 0.15, now + 0.2, 0.1);
      break;
  }

  setTimeout(() => masterGain.disconnect(), 2000);
}

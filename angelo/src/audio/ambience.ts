import { getSharedContext, createContinuousOscillator, createLFO } from './oscillator';

interface AmbienceNode {
  stop: () => void;
}

let currentAmbience: AmbienceNode | null = null;
let volume = 0.3;

export function setAmbienceVolume(v: number): void {
  volume = v;
}

export function stopAmbience(): void {
  if (currentAmbience) {
    currentAmbience.stop();
    currentAmbience = null;
  }
}

function wrapStop(objs: { osc: OscillatorNode; gain: GainNode }[]): AmbienceNode {
  return {
    stop: () => {
      objs.forEach((o) => {
        try { o.osc.stop(); } catch {}
        o.gain.disconnect();
      });
    },
  };
}

export function playAmbience(countryId: string): void {
  stopAmbience();

  const ctx = getSharedContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const objs: { osc: OscillatorNode; gain: GainNode }[] = [];

  switch (countryId) {
    case 'colombia': {
      objs.push(createContinuousOscillator(ctx, masterGain, 55, 'sine', 0.04));
      const d2 = createContinuousOscillator(ctx, masterGain, 65, 'triangle', 0.025);
      const lfo = createLFO(ctx, 0.3, 0.02);
      lfo.gain.connect(d2.osc.frequency);
      objs.push(d2, lfo);
      break;
    }
    case 'usa': {
      objs.push(createContinuousOscillator(ctx, masterGain, 60, 'sine', 0.03));
      const u2 = createContinuousOscillator(ctx, masterGain, 70, 'sawtooth', 0.015);
      const lfo2 = createLFO(ctx, 0.5, 0.01);
      lfo2.gain.connect(u2.osc.frequency);
      objs.push(u2, lfo2);
      break;
    }
    case 'morocco': {
      objs.push(
        createContinuousOscillator(ctx, masterGain, 80, 'sine', 0.035),
        createContinuousOscillator(ctx, masterGain, 100, 'triangle', 0.02),
        createContinuousOscillator(ctx, masterGain, 120, 'sine', 0.015),
      );
      break;
    }
    case 'netherlands': {
      objs.push(createContinuousOscillator(ctx, masterGain, 45, 'sine', 0.03));
      const n2 = createContinuousOscillator(ctx, masterGain, 75, 'triangle', 0.02);
      const lfo3 = createLFO(ctx, 0.15, 0.015);
      lfo3.gain.connect(n2.osc.frequency);
      objs.push(n2, lfo3);
      break;
    }
    case 'thailand': {
      const t1 = createContinuousOscillator(ctx, masterGain, 90, 'sine', 0.03);
      const lfo4 = createLFO(ctx, 0.4, 0.01);
      lfo4.gain.connect(t1.osc.frequency);
      objs.push(t1, createContinuousOscillator(ctx, masterGain, 110, 'triangle', 0.02), lfo4);
      break;
    }
    case 'london': {
      const l1 = createContinuousOscillator(ctx, masterGain, 65, 'sine', 0.035);
      const lfoL = createLFO(ctx, 0.25, 0.015);
      lfoL.gain.connect(l1.osc.frequency);
      objs.push(l1, createContinuousOscillator(ctx, masterGain, 80, 'triangle', 0.025), lfoL);
      break;
    }
    case 'spain': {
      const s1 = createContinuousOscillator(ctx, masterGain, 50, 'sine', 0.03);
      const lfo5 = createLFO(ctx, 0.2, 0.02);
      lfo5.gain.connect(s1.osc.frequency);
      objs.push(s1, createContinuousOscillator(ctx, masterGain, 65, 'triangle', 0.025), lfo5);
      break;
    }
    default: {
      objs.push(createContinuousOscillator(ctx, masterGain, 60, 'sine', 0.02));
      break;
    }
  }

  currentAmbience = {
    stop: () => {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        objs.forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
        masterGain.disconnect();
      }, 600);
    },
  };
}

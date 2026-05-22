import type { MusicState } from './types';
import { getSharedContext, createContinuousOscillator, playTone } from './oscillator';

interface MusicNode {
  stop: () => void;
}

let currentMusic: MusicNode[] = [];
let volume = 0.5;
let currentState: MusicState | null = null;

export function setMusicVolume(v: number): void {
  volume = v;
}

export function getCurrentMusicState(): MusicState | null {
  return currentState;
}

function stopAll(): void {
  currentMusic.forEach((n) => n.stop());
  currentMusic = [];
}

export function playMusic(state: MusicState): void {
  if (state === currentState) return;

  const ctx = getSharedContext();
  const now = ctx.currentTime;

  stopAll();

  currentState = state;
  const nodes: { stop: () => void }[] = [];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(volume, now + 0.5);
  masterGain.connect(ctx.destination);

  switch (state) {
    case 'menu': {
      const p1 = createContinuousOscillator(ctx, masterGain, 130.81, 'sine', 0.06);
      const p2 = createContinuousOscillator(ctx, masterGain, 164.81, 'sine', 0.04);
      const p3 = createContinuousOscillator(ctx, masterGain, 196.00, 'sine', 0.035);

      const arpGain = ctx.createGain();
      arpGain.gain.setValueAtTime(0.03, now);
      arpGain.connect(masterGain);

      const notes = [261.63, 329.63, 392.00, 329.63];
      const arpTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        notes.forEach((freq, i) => {
          playTone(ctx, arpGain, freq, 'sine', 0.3, t + i * 0.15, 0.03);
        });
      }, 2000);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(arpTimer);
          [p1, p2, p3].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
          arpGain.disconnect();
        },
      };
      nodes.push(wrap);
      break;
    }

    case 'normal': {
      const b1 = createContinuousOscillator(ctx, masterGain, 55, 'triangle', 0.04);
      const b2 = createContinuousOscillator(ctx, masterGain, 65, 'triangle', 0.03);

      const percGain = ctx.createGain();
      percGain.gain.setValueAtTime(0.02, now);
      percGain.connect(masterGain);

      const percTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        playTone(ctx, percGain, 8000, 'square', 0.02, t, 0.015);
        playTone(ctx, percGain, 6000, 'square', 0.02, t + 0.25, 0.01);
      }, 500);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(percTimer);
          [b1, b2].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
          percGain.disconnect();
        },
      };
      nodes.push(wrap);
      break;
    }

    case 'high_heat': {
      const d1 = createContinuousOscillator(ctx, masterGain, 110, 'sawtooth', 0.05);
      const d2 = createContinuousOscillator(ctx, masterGain, 112, 'sawtooth', 0.04);
      const d3 = createContinuousOscillator(ctx, masterGain, 55, 'sine', 0.06);

      const alarmGain = ctx.createGain();
      alarmGain.gain.setValueAtTime(0.06, now);
      alarmGain.connect(masterGain);

      const alarmTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        playTone(ctx, alarmGain, 440, 'square', 0.08, t, 0.08);
        playTone(ctx, alarmGain, 550, 'square', 0.08, t + 0.15, 0.08);
      }, 600);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(alarmTimer);
          [d1, d2, d3].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
          alarmGain.disconnect();
        },
      };
      nodes.push(wrap);
      break;
    }

    case 'encounter': {
      const eGain = ctx.createGain();
      eGain.gain.setValueAtTime(0.07, now);
      eGain.connect(masterGain);

      const e1 = createContinuousOscillator(ctx, eGain, 180, 'square', 0.04);
      const e2 = createContinuousOscillator(ctx, eGain, 270, 'sawtooth', 0.03);

      const stabTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        playTone(ctx, eGain, 300, 'square', 0.1, t, 0.1);
        playTone(ctx, eGain, 400, 'square', 0.1, t + 0.2, 0.08);
        playTone(ctx, eGain, 500, 'square', 0.15, t + 0.4, 0.06);
      }, 800);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(stabTimer);
          [e1, e2].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
          eGain.disconnect();
        },
      };
      nodes.push(wrap);
      break;
    }

    case 'luxury': {
      const j1 = createContinuousOscillator(ctx, masterGain, 196.00, 'sine', 0.04);
      const j2 = createContinuousOscillator(ctx, masterGain, 246.94, 'sine', 0.035);
      const j3 = createContinuousOscillator(ctx, masterGain, 293.66, 'sine', 0.03);

      const pulseGain = ctx.createGain();
      pulseGain.gain.setValueAtTime(0.02, now);
      pulseGain.connect(masterGain);

      const pulseTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        playTone(ctx, pulseGain, 350, 'triangle', 0.2, t, 0.02);
      }, 1500);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(pulseTimer);
          [j1, j2, j3].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
          pulseGain.disconnect();
        },
      };
      nodes.push(wrap);
      break;
    }

    case 'arrest': {
      const a1 = createContinuousOscillator(ctx, masterGain, 80, 'sine', 0.04);
      const a2 = createContinuousOscillator(ctx, masterGain, 75, 'sine', 0.03);

      const bellTimer = window.setInterval(() => {
        const t = ctx.currentTime;
        playTone(ctx, masterGain, 200, 'triangle', 0.5, t, 0.04);
        playTone(ctx, masterGain, 150, 'triangle', 0.5, t + 0.3, 0.03);
      }, 2000);

      const wrap: MusicNode = {
        stop: () => {
          clearInterval(bellTimer);
          [a1, a2].forEach((o) => { try { o.osc.stop(); } catch {}; o.gain.disconnect(); });
        },
      };
      nodes.push(wrap);
      break;
    }
  }

  currentMusic = nodes.map((n) => ({
    stop: () => {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      setTimeout(() => {
        n.stop();
        masterGain.disconnect();
      }, 600);
    },
  }));
}

export function stopMusic(): void {
  stopAll();
  currentState = null;
}

import type { Environment } from '../data/reactions';

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export type EnvironmentVisuals = {
  coldness: number;
  heat: number;
  extreme: number;
  vacuum: number;
  compression: number;
  particleSpread: number;
  particleSpeed: number;
  particleJitter: number;
  particleOpacity: number;
  thermalLabel: string;
  pressureLabel: string;
  chamberTone: string;
};

export function getEnvironmentVisuals(environment: Environment): EnvironmentVisuals {
  const coldness = clamp((273 - environment.temperature) / 233);
  const heat = clamp((environment.temperature - 320) / 420);
  const extreme = clamp((environment.temperature - 720) / 180);
  const vacuum = clamp((0.6 - environment.pressureAtm) / 0.6);
  const compression = clamp((environment.pressureAtm - 1.2) / 5.8);

  return {
    coldness,
    heat,
    extreme,
    vacuum,
    compression,
    particleSpread: 1.35 - compression * 0.72 + vacuum * 0.28,
    particleSpeed: 1 + heat * 1.75 + extreme * 1.2 - compression * 0.34,
    particleJitter: compression * 22,
    particleOpacity: 0.22 + clamp(environment.pressureAtm / 7) * 0.58 + heat * 0.12,
    thermalLabel: extreme > 0.55 ? 'white hot' : heat > 0.58 ? 'red hot' : heat > 0.15 ? 'warming' : coldness > 0.6 ? 'frosted' : 'clear',
    pressureLabel: compression > 0.78 ? 'crushed tight' : compression > 0.38 ? 'compressed' : vacuum > 0.55 ? 'wide open' : 'balanced',
    chamberTone: extreme > 0.55 ? '#fff7ed' : heat > 0.35 ? '#fb7185' : coldness > 0.35 ? '#67e8f9' : '#5eead4',
  };
}

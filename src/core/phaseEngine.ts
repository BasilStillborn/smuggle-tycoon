import type { Element } from '../data/elements';
import { compoundPhysicalData, elementPhysicalData, type PhysicalSample } from '../data/physicalProperties';
import type { Environment } from '../data/reactions';

export type PhaseState = 'solid' | 'liquid' | 'gas' | 'plasma' | 'frozen' | 'melting' | 'boiling' | 'condensing' | 'supercritical' | 'unstable';

export type MatterSampleState = {
  id: string;
  label: string;
  symbol: string;
  kind: PhysicalSample['kind'];
  phase: PhaseState;
  motion: number;
  pressureEffect: 'expanded' | 'normal' | 'compressed';
  detail: string;
};

function fallbackSample(element: Element): PhysicalSample {
  const base: PhysicalSample = {
    id: element.symbol,
    label: element.name,
    kind: 'element',
    roomState: element.state,
    category: element.category,
    note: element.fact,
  };

  if (element.category === 'noble-gas' || element.state === 'gas') return { ...base, meltingPointK: 80, boilingPointK: 110 };
  if (element.state === 'liquid') return { ...base, meltingPointK: 260, boilingPointK: 630 };
  if (element.state === 'synthetic' || element.category === 'unknown') return { ...base, note: 'This synthetic sample is unstable and represented as a protected lab trace.' };
  return { ...base, meltingPointK: 950, boilingPointK: 1800 };
}

function pressureAdjustedBoilingPoint(sample: PhysicalSample, pressureAtm: number) {
  if (!sample.boilingPointK) return undefined;
  const pressureShift = Math.log10(Math.max(0.05, pressureAtm)) * 38;
  return sample.boilingPointK + pressureShift;
}

function calculatePhase(sample: PhysicalSample, environment: Environment): PhaseState {
  const temperature = environment.temperature;
  const boilingPoint = pressureAdjustedBoilingPoint(sample, environment.pressureAtm);
  const meltingPoint = sample.meltingPointK;

  if (sample.roomState === 'synthetic') return 'unstable';
  if (temperature > 850 && sample.kind === 'element' && sample.category === 'noble-gas') return 'plasma';
  if (temperature > 850 && sample.kind !== 'alloy' && sample.boilingPointK && temperature > sample.boilingPointK + 160) return 'plasma';
  if (boilingPoint && temperature > boilingPoint + 8) return 'gas';
  if (boilingPoint && Math.abs(temperature - boilingPoint) <= 8) return 'boiling';
  if (meltingPoint && temperature < meltingPoint - 12) return sample.id === 'H2O' ? 'frozen' : 'solid';
  if (meltingPoint && Math.abs(temperature - meltingPoint) <= 12) return 'melting';
  if (meltingPoint && temperature > meltingPoint && (!boilingPoint || temperature < boilingPoint)) return 'liquid';
  if (sample.roomState === 'gas' || sample.roomState === 'compound-gas') return environment.pressureAtm > 1.6 && temperature < 320 ? 'condensing' : 'gas';
  if (sample.roomState === 'liquid' || sample.roomState === 'compound-liquid') return 'liquid';
  return 'solid';
}

function phaseDetail(sample: PhysicalSample, phase: PhaseState, environment: Environment) {
  if (sample.id === 'H2O') {
    if (phase === 'frozen') return 'Ice crystals are locking the water molecules in place.';
    if (phase === 'liquid') return 'Liquid water is sloshing and flowing in the chamber.';
    if (phase === 'boiling' || phase === 'gas') return 'Water is escaping as steam and mist.';
  }
  if (phase === 'solid') return `${sample.label} is holding a solid structure.`;
  if (phase === 'frozen') return `${sample.label} is frozen into a rigid crystal-like state.`;
  if (phase === 'melting') return `${sample.label} is right at its melting point and starting to soften.`;
  if (phase === 'liquid') return `${sample.label} is flowing as a liquid sample.`;
  if (phase === 'boiling') return `${sample.label} is bubbling at its boiling point.`;
  if (phase === 'condensing') return `${sample.label} is being squeezed toward condensation by pressure.`;
  if (phase === 'plasma') return `${sample.label} is extremely energetic, with plasma-like glow effects.`;
  if (phase === 'unstable') return `${sample.label} is shown as an unstable protected lab trace.`;
  const pressureText = environment.pressureAtm < 0.4 ? 'expanding in thin pressure' : environment.pressureAtm > 1.5 ? 'compressed by the chamber pressure' : 'moving freely';
  return `${sample.label} is a gas, ${pressureText}.`;
}

export function simulateMatterStates(elements: Element[], productIds: string[], environment: Environment): MatterSampleState[] {
  const elementSamples = elements.map((element) => ({
    ...fallbackSample(element),
    ...(elementPhysicalData[element.symbol] ?? {}),
    id: element.symbol,
    label: element.name,
    kind: 'element' as const,
    roomState: element.state,
    category: element.category,
  }));

  const productSamples = productIds
    .map((product) => compoundPhysicalData[product])
    .filter((sample): sample is PhysicalSample => Boolean(sample));

  return [...elementSamples, ...productSamples].slice(0, 6).map((sample) => {
    const phase = calculatePhase(sample, environment);
    const heatMotion = Math.min(1, environment.temperature / 900);
    const pressureEffect = environment.pressureAtm < 0.55 ? 'expanded' : environment.pressureAtm > 1.35 ? 'compressed' : 'normal';
    return {
      id: sample.id,
      label: sample.label,
      symbol: sample.id,
      kind: sample.kind,
      phase,
      motion: phase === 'solid' || phase === 'frozen' ? heatMotion * 0.35 : phase === 'liquid' ? 0.45 + heatMotion * 0.35 : 0.65 + heatMotion * 0.45,
      pressureEffect,
      detail: phaseDetail(sample, phase, environment),
    };
  });
}

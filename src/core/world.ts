import type { Country } from './types';

export const COUNTRIES: Country[] = [
  {
    id: 'london',
    name: 'England',
    city: 'London',
    region: 'Europe',
    policeIntensity: 16,
    demandModifiers: { cocaine: 4.0, heroin: 3.5, hashish: 3.5, weed: 3.5, meth: 3.0, ecstasy: 4.0 },
    basePriceRange: [0.9, 1.6],
    riskModifier: 1.0,
  },
  {
    id: 'colombia',
    name: 'Colombia',
    city: 'Medellín',
    region: 'South America',
    policeIntensity: 5,
    demandModifiers: { cocaine: 0.1, heroin: 0.2, hashish: 0.5, weed: 0.4, meth: 0.4, ecstasy: 0.6 },
    basePriceRange: [0.3, 0.6],
    riskModifier: 1.3,
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    city: 'Amsterdam',
    region: 'Europe',
    policeIntensity: 8,
    demandModifiers: { cocaine: 0.4, heroin: 0.4, hashish: 0.2, weed: 0.1, meth: 0.5, ecstasy: 0.3 },
    basePriceRange: [0.8, 1.5],
    riskModifier: 0.9,
  },
  {
    id: 'spain',
    name: 'Spain',
    city: 'Barcelona',
    region: 'Europe',
    policeIntensity: 10,
    demandModifiers: { cocaine: 0.5, heroin: 0.5, hashish: 0.4, weed: 0.4, meth: 0.2, ecstasy: 0.1 },
    basePriceRange: [0.7, 1.3],
    riskModifier: 1.0,
  },
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    city: 'Kabul',
    region: 'Asia',
    policeIntensity: 4,
    demandModifiers: { cocaine: 0.6, heroin: 0.1, hashish: 0.1, weed: 0.5, meth: 0.3, ecstasy: 0.6 },
    basePriceRange: [0.2, 0.5],
    riskModifier: 1.4,
  },
];

export function getCountry(id: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === id);
}

export function getLocationLabel(country: Country): string {
  return `${country.city}, ${country.name}`;
}

export type TemperatureUnit = 'K' | 'C' | 'F';
export type PressureUnit = '%' | 'atm' | 'bar' | 'psi' | 'kPa';

export type UserPreferences = {
  temperatureUnit: TemperatureUnit;
  pressureUnit: PressureUnit;
};

export const defaultPreferences: UserPreferences = {
  temperatureUnit: 'C',
  pressureUnit: 'atm',
};

export function formatTemperature(kelvin: number, unit: TemperatureUnit) {
  if (unit === 'C') return `${(kelvin - 273.15).toFixed(1)} °C`;
  if (unit === 'F') return `${(((kelvin - 273.15) * 9) / 5 + 32).toFixed(1)} °F`;
  return `${Math.round(kelvin)} K`;
}

export function formatPressure(pressureAtm: number, unit: PressureUnit) {
  if (unit === '%') return `${Math.round(pressureAtm * 100)}%`;
  if (unit === 'bar') return `${(pressureAtm * 1.01325).toFixed(2)} bar`;
  if (unit === 'psi') return `${(pressureAtm * 14.6959).toFixed(2)} psi`;
  if (unit === 'kPa') return `${(pressureAtm * 101.325).toFixed(1)} kPa`;
  return `${pressureAtm.toFixed(2)} atm`;
}

export function pressureLabel(pressureAtm: number) {
  if (pressureAtm < 0.12) return 'near vacuum';
  if (pressureAtm < 0.55) return 'thin air';
  if (pressureAtm < 1.25) return 'Earth-like';
  if (pressureAtm < 2) return 'dense';
  if (pressureAtm < 4) return 'pressurised';
  if (pressureAtm < 6) return 'high pressure';
  return 'extreme pressure';
}

export function temperatureLabel(kelvin: number) {
  if (kelvin < 180) return 'cryogenic';
  if (kelvin < 273) return 'cold';
  if (kelvin < 420) return 'room temperature';
  if (kelvin < 700) return 'hot';
  return 'extreme';
}

export function pressureToAirDensity(pressureAtm: number) {
  return pressureAtm * 100;
}

import type { Environment } from '../data/reactions';
import type { PressureUnit, TemperatureUnit, UserPreferences } from '../core/units';
import { formatPressure, formatTemperature, pressureLabel, temperatureLabel } from '../core/units';
import type { CSSProperties, PointerEvent, KeyboardEvent } from 'react';

type EnvironmentRailProps = {
  type: 'temperature' | 'pressure';
  environment: Environment;
  preferences: UserPreferences;
  onEnvironmentChange: (environment: Environment) => void;
  onPreferencesChange: (preferences: UserPreferences) => void;
};

const pressureTicks = [
  { label: '100', value: 7 },
  { label: '60', value: 4.08 },
  { label: '15', value: 1 },
  { label: '0', value: 0 },
];

const temperatureTicks = [
  { label: '900K', value: 900 },
  { label: '700K', value: 700 },
  { label: '273K', value: 273 },
  { label: '40K', value: 40 },
];

export function EnvironmentRail({ type, environment, preferences, onEnvironmentChange, onPreferencesChange }: EnvironmentRailProps) {
  const isTemperature = type === 'temperature';
  const value = isTemperature ? environment.temperature : environment.pressureAtm;
  const min = isTemperature ? 40 : 0;
  const max = isTemperature ? 900 : 7;
  const percent = ((value - min) / (max - min)) * 100;
  const displayValue = isTemperature
    ? formatTemperature(environment.temperature, preferences.temperatureUnit)
    : formatPressure(environment.pressureAtm, preferences.pressureUnit);
  const status = isTemperature ? temperatureLabel(environment.temperature) : pressureLabel(environment.pressureAtm);
  const ticks = isTemperature ? temperatureTicks : pressureTicks;

  function valueFromPointer(clientY: number, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const ratio = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
    const next = min + ratio * (max - min);
    return isTemperature ? Math.round(next) : Math.round(next * 100) / 100;
  }

  function updateValue(nextValue: number) {
    if (isTemperature) onEnvironmentChange({ ...environment, temperature: nextValue });
    else onEnvironmentChange({ ...environment, pressureAtm: nextValue });
  }

  function updateUnit(nextUnit: string) {
    if (isTemperature) onPreferencesChange({ ...preferences, temperatureUnit: nextUnit as TemperatureUnit });
    else onPreferencesChange({ ...preferences, pressureUnit: nextUnit as PressureUnit });
  }

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    updateValue(valueFromPointer(event.clientY, target));
  }

  function continueDrag(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    updateValue(valueFromPointer(event.clientY, event.currentTarget));
  }

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const step = isTemperature ? 10 : 0.1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
      event.preventDefault();
      updateValue(Math.min(max, value + step));
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
      event.preventDefault();
      updateValue(Math.max(min, value - step));
    }
  }

  return (
    <aside className={`environment-rail ${isTemperature ? 'temperature-rail' : 'pressure-rail'}`}>
      <div className="rail-cap">
        <span>{isTemperature ? 'Temp' : 'Pressure'}</span>
        <strong>{displayValue}</strong>
      </div>

      <div
        className="rail-meter"
        role="slider"
        tabIndex={0}
        aria-label={isTemperature ? 'Temperature' : 'Pressure'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={startDrag}
        onPointerMove={continueDrag}
        onKeyDown={handleKey}
        style={{ '--rail-percent': `${percent}%` } as CSSProperties}
      >
        <div className="rail-ticks" aria-hidden="true">
          {ticks.map((tick) => <i key={tick.label} style={{ bottom: `${((tick.value - min) / (max - min)) * 100}%` }}>{tick.label}</i>)}
        </div>
        <div className="rail-thumb" aria-hidden="true" />
      </div>

      <div className="rail-footer">
        <em>{status}</em>
        <select
          value={isTemperature ? preferences.temperatureUnit : preferences.pressureUnit}
          aria-label={isTemperature ? 'Temperature unit' : 'Pressure unit'}
          onChange={(event) => updateUnit(event.target.value)}
        >
          {isTemperature ? (
            <>
              <option value="C">°C</option>
              <option value="K">K</option>
              <option value="F">°F</option>
            </>
          ) : (
            <>
              <option value="atm">atm</option>
              <option value="%">%</option>
              <option value="bar">bar</option>
              <option value="psi">psi</option>
              <option value="kPa">kPa</option>
            </>
          )}
        </select>
      </div>
    </aside>
  );
}

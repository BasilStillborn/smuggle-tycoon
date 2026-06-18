import { useRef, useCallback, useEffect, useState } from 'react';
import type { Environment } from '../data/reactions';
import type { PressureUnit, TemperatureUnit, UserPreferences } from '../core/units';
import { formatPressure, formatTemperature, pressureLabel, temperatureLabel } from '../core/units';
import { audioEngine } from '../core/audioEngine';

type EnvironmentLeverProps = {
  type: 'temperature' | 'pressure';
  environment: Environment;
  preferences: UserPreferences;
  onEnvironmentChange: (environment: Environment) => void;
  onPreferencesChange: (preferences: UserPreferences) => void;
};

const TICKS_TEMP = [
  { label: '900K', value: 900 },
  { label: '700K', value: 700 },
  { label: '273K', value: 273 },
  { label: '40K', value: 40 },
];

const TICKS_PRESSURE = [
  { label: '7atm', value: 7 },
  { label: '4atm', value: 4.08 },
  { label: '1atm', value: 1 },
  { label: '0atm', value: 0 },
];

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

export function EnvironmentLever({ type, environment, preferences, onEnvironmentChange, onPreferencesChange }: EnvironmentLeverProps) {
  const isTemperature = type === 'temperature';
  const value = isTemperature ? environment.temperature : environment.pressureAtm;
  const min = isTemperature ? 40 : 0;
  const max = isTemperature ? 900 : 7;
  const percent = clamp((value - min) / (max - min), 0, 1);
  const displayValue = isTemperature
    ? formatTemperature(environment.temperature, preferences.temperatureUnit)
    : formatPressure(environment.pressureAtm, preferences.pressureUnit);
  const status = isTemperature ? temperatureLabel(environment.temperature) : pressureLabel(environment.pressureAtm);
  const ticks = isTemperature ? TICKS_TEMP : TICKS_PRESSURE;

  const grooveRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const velocityRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef(0);
  const momentumRef = useRef<{ active: boolean; vel: number }>({ active: false, vel: 0 });

  function valueFromY(clientY: number) {
    const groove = grooveRef.current;
    if (!groove) return value;
    const rect = groove.getBoundingClientRect();
    const ratio = 1 - clamp((clientY - rect.top) / rect.height, 0, 1);
    const raw = min + ratio * (max - min);
    return isTemperature ? Math.round(raw) : Math.round(raw * 100) / 100;
  }

  function updateValue(next: number) {
    const clamped = clamp(next, min, max);
    if (isTemperature) {
      const nextEnv = { ...environment, temperature: clamped };
      onEnvironmentChange(nextEnv);
      audioEngine.updateEnvironment(nextEnv.temperature, nextEnv.pressureAtm);
    } else {
      const nextEnv = { ...environment, pressureAtm: clamped };
      onEnvironmentChange(nextEnv);
      audioEngine.updateEnvironment(nextEnv.temperature, nextEnv.pressureAtm);
    }
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    momentumRef.current = { active: false, vel: 0 };
    cancelAnimationFrame(animFrameRef.current);
    lastYRef.current = e.clientY;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    updateValue(valueFromY(e.clientY));
  }, [value, min, max, isTemperature]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const dy = e.clientY - lastYRef.current;
    velocityRef.current = (dy / dt) * 16;
    lastYRef.current = e.clientY;
    lastTimeRef.current = now;
    updateValue(valueFromY(e.clientY));
    if (Math.abs(dy) > 2) audioEngine.leverDrag();
  }, [value, min, max, isTemperature]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);

    const vel = velocityRef.current;
    if (Math.abs(vel) > 0.5) {
      const groove = grooveRef.current;
      const grooveHeight = groove ? groove.getBoundingClientRect().height : 260;
      const momentumDivisor = grooveHeight * 1.15;

      momentumRef.current = { active: true, vel: vel * 2 };
      function tick() {
        if (!momentumRef.current.active) return;
        momentumRef.current.vel *= 0.94;
        if (Math.abs(momentumRef.current.vel) < 0.3) {
          momentumRef.current.active = false;
          return;
        }
        const range = max - min;
        const deltaRatio = -momentumRef.current.vel / momentumDivisor;
        const delta = deltaRatio * range;
        const current = isTemperature ? environment.temperature : environment.pressureAtm;
        updateValue(current + delta);
        animFrameRef.current = requestAnimationFrame(tick);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [value, min, max, isTemperature]);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const step = isTemperature ? 10 : 0.1;
    const fineStep = isTemperature ? 1 : 0.01;
    const effectiveStep = e.shiftKey ? fineStep : step;
    const dir = e.deltaY < 0 ? 1 : -1;
    updateValue(value + dir * effectiveStep);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const step = isTemperature ? 10 : 0.1;
    const bigStep = isTemperature ? 50 : 0.5;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      updateValue(value + (e.shiftKey ? bigStep : step));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      updateValue(value - (e.shiftKey ? bigStep : step));
    } else if (e.key === 'Home') {
      e.preventDefault();
      updateValue(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      updateValue(max);
    }
  }

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  function updateUnit(nextUnit: string) {
    if (isTemperature) onPreferencesChange({ ...preferences, temperatureUnit: nextUnit as TemperatureUnit });
    else onPreferencesChange({ ...preferences, pressureUnit: nextUnit as PressureUnit });
  }

  const isHot = isTemperature && value > 400;
  const isCold = isTemperature && value < 200;
  const isExtreme = isTemperature && value > 700;
  const isHighPressure = !isTemperature && value > 4;

  // LED color based on level
  const ledClass = isExtreme ? 'lever-led-led-white'
    : isHot ? 'lever-led-led-red'
    : isCold ? 'lever-led-led-blue'
    : isHighPressure ? 'lever-led-led-red'
    : 'lever-led-led-green';

  return (
    <div className={`environment-lever ${isTemperature ? 'lever-temperature' : 'lever-pressure'} ${dragging ? 'lever-dragging' : ''}`}>
      {/* Warning stripes */}
      <div className="lever-warning-top" aria-hidden="true" />
      <div className="lever-warning-bottom" aria-hidden="true" />

      {/* LED indicator */}
      <div className={`lever-led ${ledClass}`} aria-hidden="true" />

      <div className="lever-track-label">
        <span>{isTemperature ? 'TEMP' : 'PRESS'}</span>
        <strong>{displayValue}</strong>
      </div>

      <div
        className={`lever-track ${isHot ? 'lever-hot' : ''} ${isCold ? 'lever-cold' : ''} ${isExtreme ? 'lever-extreme' : ''} ${isHighPressure ? 'lever-high-pressure' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label={isTemperature ? 'Temperature' : 'Pressure'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        onWheel={handleWheel}
      >
        <div ref={grooveRef} className="lever-track-groove">
          <div className="lever-track-fill" style={{ height: `${percent * 100}%` }} />
          <div className="lever-track-glow" style={{ bottom: `${percent * 100}%` }} />
        </div>

        <div className="lever-ticks" aria-hidden="true">
          {ticks.map((tick) => (
            <div
              key={tick.label}
              className="lever-tick"
              style={{ bottom: `${((tick.value - min) / (max - min)) * 100}%` }}
            >
              <div className="lever-tick-line" />
              <span>{tick.label}</span>
            </div>
          ))}
        </div>

        <div
          className="lever-handle"
          style={{ bottom: `calc(${percent * 100}% - 24px)` }}
          aria-hidden="true"
        >
          <div className="lever-handle-body">
            <div className="lever-handle-cap" />
            <div className="lever-handle-grip" />
            <div className="lever-handle-face">
              <span>{isTemperature ? `${Math.round(value)}K` : `${Math.round(value * 100)}%`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lever-footer">
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
    </div>
  );
}

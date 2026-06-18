import type { Environment } from '../data/reactions';
import type { EnvironmentVisuals } from '../core/environmentVisuals';
import type { CSSProperties } from 'react';

type AtmosphereLayerProps = {
  environment: Environment;
  visuals: EnvironmentVisuals;
  palette: string[];
};

const particleCount = 86;

export function AtmosphereLayer({ environment, visuals, palette }: AtmosphereLayerProps) {
  return (
    <div
      className="atmosphere-layer"
      aria-hidden="true"
      style={{
        '--coldness': visuals.coldness,
        '--heat-level': visuals.heat,
        '--extreme-level': visuals.extreme,
        '--vacuum-level': visuals.vacuum,
        '--compression-level': visuals.compression,
        '--particle-spread': visuals.particleSpread,
        '--particle-speed': visuals.particleSpeed,
        '--particle-jitter': `${visuals.particleJitter}px`,
        '--particle-opacity': visuals.particleOpacity,
        '--thermal-tone': visuals.chamberTone,
        '--pressure-atm': environment.pressureAtm,
      } as CSSProperties}
    >
      <div className="thermal-wash" />
      <div className="frost-veil" />
      <div className="heat-haze" />
      <div className="compression-rings" />
      <div className="atmosphere-particles">
        {Array.from({ length: particleCount }, (_, index) => (
          <i
            key={index}
            className={index % 13 === 0 ? 'atmosphere-particle spark-dot' : 'atmosphere-particle'}
            style={{
              '--a': index,
              '--tone': palette[index % Math.max(1, palette.length)] ?? '#67e8f9',
              '--radius': `${28 + (index % 19) * 5}px`,
              '--dot-size': `${3 + (index % 5)}px`,
              '--delay': `${index * -0.091}s`,
            } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

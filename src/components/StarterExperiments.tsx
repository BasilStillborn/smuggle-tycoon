import type { StarterExperiment } from '../data/starterExperiments';
import { getElement } from '../data/elements';
import { formatPressure, formatTemperature, type UserPreferences } from '../core/units';
import type { CSSProperties } from 'react';

type StarterExperimentsProps = {
  experiments: StarterExperiment[];
  preferences: UserPreferences;
  onLoad: (experiment: StarterExperiment) => void;
};

export function StarterExperiments({ experiments, preferences, onLoad }: StarterExperimentsProps) {
  return (
    <section className="panel missions-panel">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">New here?</p>
          <h2>Starter experiments</h2>
        </div>
      </div>
      <div className="mission-list">
        {experiments.map((experiment) => (
          <article key={experiment.id} className={`mission-card mission-${experiment.animation}`}>
            <div className="mission-title-row">
              <strong>{experiment.title}</strong>
              <span>{experiment.difficulty}</span>
            </div>
            <div className="mission-elements">
              {experiment.symbols.map((symbol) => {
                const element = getElement(symbol);
                return <b key={symbol} style={{ '--tone': element?.tone ?? '#67e8f9' } as CSSProperties}>{symbol}</b>;
              })}
            </div>
            <p>{experiment.clue}</p>
            <small>
              {formatTemperature(experiment.environment.temperature, preferences.temperatureUnit)} · {formatPressure(experiment.environment.pressureAtm, preferences.pressureUnit)}
            </small>
            <button type="button" className="ghost-button" onClick={() => onLoad(experiment)}>Load experiment</button>
          </article>
        ))}
      </div>
    </section>
  );
}

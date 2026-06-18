import type { Element } from '../data/elements';
import type { Environment, ReactionResult } from '../data/reactions';
import type { UserPreferences } from '../core/units';
import { formatPressure, formatTemperature } from '../core/units';
import { simulateMatterStates } from '../core/phaseEngine';
import { ChamberCanvas } from './ChamberCanvas';
import { EnvironmentLever } from './EnvironmentLever';

type ReactionChamberProps = {
  staged: Element[];
  loaded: Element[];
  products: string[];
  result: ReactionResult;
  environment: Environment;
  preferences: UserPreferences;
  onEnvironmentChange: (environment: Environment) => void;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onLoadIntoChamber: () => void;
  runId: number;
};

export function ReactionChamber({
  staged,
  loaded,
  products,
  result,
  environment,
  preferences,
  onEnvironmentChange,
  onPreferencesChange,
  onLoadIntoChamber,
  runId,
}: ReactionChamberProps) {
  const matterStates = simulateMatterStates(loaded, products, environment);
  const dominantPhase = matterStates[0]?.phase ?? 'gas';

  return (
    <section className={`panel chamber-panel result-${result.reactionType} phase-${dominantPhase}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live chamber</p>
          <h2>{result.title}</h2>
        </div>
        {staged.length > 0 && (
          <button type="button" className="react-button chamber-load-btn" onClick={onLoadIntoChamber}>
            Mix Elements
          </button>
        )}
      </div>

      <div className="chamber-instrument-frame">
        <EnvironmentLever
          type="temperature"
          environment={environment}
          preferences={preferences}
          onEnvironmentChange={onEnvironmentChange}
          onPreferencesChange={onPreferencesChange}
        />

        <div
          key={runId}
          className={`chamber live-${dominantPhase}`}
        >
          <ChamberCanvas
            selected={loaded}
            products={products}
            result={result}
            environment={environment}
            matterStates={matterStates}
            runId={runId}
          />
          <div className="chamber-glass" />
          <div className="chamber-readout">
            <span>{formatTemperature(environment.temperature, preferences.temperatureUnit)}</span>
            <span>{formatPressure(environment.pressureAtm, preferences.pressureUnit)}</span>
          </div>
        </div>

        <EnvironmentLever
          type="pressure"
          environment={environment}
          preferences={preferences}
          onEnvironmentChange={onEnvironmentChange}
          onPreferencesChange={onPreferencesChange}
        />
      </div>

      <div className="matter-state-strip" aria-label="Live matter states">
        {matterStates.length === 0 ? (
          <span className="matter-state-idle">No elements in chamber</span>
        ) : (
          matterStates.map((sample) => (
            <article key={sample.id} className={`matter-chip matter-${sample.phase} pressure-${sample.pressureEffect}`}>
              <b>{sample.symbol}</b>
              <div>
                <strong>{sample.phase}</strong>
                <span>{sample.detail}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

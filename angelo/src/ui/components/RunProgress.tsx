import type { GameState } from '../../core';
import { RUN_STEPS, currentStepIndex } from '../flow/steps';

interface Props {
  state: GameState;
}

/** Slim Plan · Flight · Deal · Home progress spine, shown only mid-run. */
export function RunProgress({ state }: Props) {
  const idx = currentStepIndex(state);
  if (idx < 0) return null;

  return (
    <div className="runprogress">
      {RUN_STEPS.map((step, i) => {
        const cls = i < idx ? ' is-done' : i === idx ? ' is-current' : '';
        return (
          <div key={step.id} className={`runprogress__step${cls}`}>
            <span className="runprogress__dot" />
            <span className="runprogress__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

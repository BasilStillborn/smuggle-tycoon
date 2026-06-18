import type { MatterSampleState } from '../core/phaseEngine';
import type { ReactionResult } from '../data/reactions';

type MaterialSceneProps = {
  samples: MatterSampleState[];
  result: ReactionResult;
};

function hasProduct(samples: MatterSampleState[], id: string) {
  return samples.some((sample) => sample.id === id);
}

export function MaterialScene({ samples, result }: MaterialSceneProps) {
  const phases = new Set(samples.map((sample) => sample.phase));
  const showIce = samples.some((sample) => sample.id === 'H2O' && (sample.phase === 'frozen' || sample.phase === 'solid'));
  const showWater = samples.some((sample) => sample.id === 'H2O' && sample.phase === 'liquid');
  const showSteam = samples.some((sample) => sample.id === 'H2O' && ['gas', 'boiling', 'condensing'].includes(sample.phase));
  const showCrystal = result.animation === 'crystal' || hasProduct(samples, 'NaCl') || hasProduct(samples, 'KCl') || hasProduct(samples, 'CaCl2');
  const showRust = hasProduct(samples, 'Fe2O3');
  const showMolten = phases.has('liquid') || phases.has('melting') || result.reactionType === 'alloy';
  const showFlare = result.animation === 'flame' || result.animation === 'storm' || result.animation === 'spark';

  return (
    <div className="material-scene" aria-hidden="true">
      {showIce ? <div className="scene-ice">{Array.from({ length: 9 }, (_, index) => <i key={index} />)}</div> : null}
      {showWater ? <div className="scene-water"><span /><span /><span /></div> : null}
      {showSteam ? <div className="scene-steam">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div> : null}
      {showCrystal ? <div className="scene-salt">{Array.from({ length: 16 }, (_, index) => <i key={index} />)}</div> : null}
      {showRust ? <div className="scene-rust">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</div> : null}
      {showMolten ? <div className="scene-molten"><span /><span /></div> : null}
      {showFlare ? <div className="scene-flare">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div> : null}
    </div>
  );
}

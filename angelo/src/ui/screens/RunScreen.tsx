import type { GameState, GameAction } from '../../core';
import { getCountry, getLocationLabel } from '../../core';

type Haptic = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface Props {
  state: GameState;
  send: (action: GameAction, style?: Haptic) => void;
}

export function RunScreen({ state, send }: Props) {
  const country = getCountry(state.player.currentCountryId);
  const place = country ? getLocationLabel(country) : 'Transit';

  let title = 'In transit';
  let sub = 'The flight is underway.';
  let cta: { label: string; action: GameAction; haptic: Haptic } | null = null;

  switch (state.gamePhase) {
    case 'flying_out':
    case 'flying_back':
      title = 'In the air';
      sub = `Heading for ${place}. Nothing to do now but sit tight.`;
      break;
    case 'arrived':
      title = `Arrived in ${place}`;
      sub = 'You are through the terminal. Time to find your contact.';
      cta = { label: 'Walk through customs', action: { type: 'AFTER_CUSTOMS' }, haptic: 'medium' };
      break;
    case 'buying':
      title = `At the meet in ${place}`;
      sub = state.selectedDealer ? `Dealing with ${state.selectedDealer.name}.` : 'Looking for your contact.';
      cta = { label: 'Fly home empty-handed', action: { type: 'FLY_HOME' }, haptic: 'warning' };
      break;
    default:
      break;
  }

  return (
    <div className="run">
      <div className="run__card">
        <div className="run__eyebrow">En route</div>
        <h2 className="run__title">{title}</h2>
        <p className="run__sub">{sub}</p>
        {cta && (
          <button className="btn btn-primary plan__cta" onClick={() => send(cta!.action, cta!.haptic)}>
            {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}

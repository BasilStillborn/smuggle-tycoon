import type { GameState } from '../../core';
import { getInventoryValue } from '../../core';

interface Props {
  state: GameState;
  day: number;
  onPress?: () => void;
}

export function HubStatBar({ state, day, onPress }: Props) {
  const invValue = getInventoryValue(state.player, state.currentMarketPrices);
  const netWorth = state.player.cash + state.player.bank + invValue;

  const items: { label: string; value: string; tone?: string }[] = [
    { label: 'Cash', value: `$${state.player.cash.toLocaleString()}`, tone: state.player.cash < 0 ? 'danger' : 'accent' },
    { label: 'Bank', value: `$${state.player.bank.toLocaleString()}`, tone: state.player.bank <= 0 ? 'danger' : 'success' },
    { label: 'Worth', value: `$${netWorth.toLocaleString()}` },
    { label: 'Day', value: String(day) },
  ];

  return (
    <div className="statbar" onClick={onPress}>
      {items.map((it) => (
        <div key={it.label} className="statbar__cell">
          <span className="statbar__label">{it.label}</span>
          <span className={`statbar__value${it.tone ? ` tone-${it.tone}` : ''}`}>{it.value}</span>
        </div>
      ))}
    </div>
  );
}

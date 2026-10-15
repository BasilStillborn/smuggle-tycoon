import { useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { getLocationLabel, getCountry } from '../../core';
import { HubInfoWindow } from '../components/HubInfoWindow';

export type HubSheetId = 'bank' | 'safehouse' | 'assets';

interface Props {
  state: GameState;
  send: (action: GameAction, style?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => void;
  onOpenSheet: (sheet: HubSheetId) => void;
}

export function HubScreen({ state, send, onOpenSheet }: Props) {
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState(Math.max(100, state.player.bank));

  const country = getCountry(state.player.currentCountryId);
  const maxWithdraw = state.player.bank;
  const clamp = (n: number) => Math.max(1, Math.min(maxWithdraw, n));

  const startRun = () => {
    send({ type: 'START_TRIP', amount: clamp(amount) });
    setWithdrawing(false);
  };

  return (
    <div className="hub">
      <div className="hub__hero">
        <div className="hub__eyebrow">{country ? getLocationLabel(country) : 'London'}</div>
        <h1 className="hub__name">◈ Angelo</h1>
        <p className="hub__tag">The network is waiting. Plan a run, move product, keep your head down.</p>
      </div>

      <HubInfoWindow state={state} />

      <div className="hub__actions">
        <button className="hub__sheet-btn" onClick={() => onOpenSheet('bank')}>Bank</button>
        <button className="hub__sheet-btn" onClick={() => onOpenSheet('safehouse')}>Safehouse</button>
        <button className="hub__sheet-btn" onClick={() => onOpenSheet('assets')}>Assets</button>
      </div>

      {!withdrawing ? (
        <button className="hub__cta" onClick={() => setWithdrawing(true)} disabled={maxWithdraw < 1}>
          <span className="hub__cta-play">▶</span> Start a Run
        </button>
      ) : (
        <div className="hub__withdraw">
          <div className="hub__withdraw-title">How much do you take with you?</div>
          <div className="hub__withdraw-stepper">
            <button className="hub__step" onClick={() => setAmount((a) => clamp(a - 100))}>−</button>
            <div className="hub__withdraw-amt">${clamp(amount).toLocaleString()}</div>
            <button className="hub__step" onClick={() => setAmount((a) => clamp(a + 100))}>+</button>
          </div>
          <div className="hub__withdraw-quick">
            <button className="hub__quick" onClick={() => setAmount(clamp(maxWithdraw))}>All</button>
            <button className="hub__quick" onClick={() => setAmount(clamp(1000))}>$1K</button>
            <button className="hub__quick" onClick={() => setAmount(clamp(5000))}>$5K</button>
          </div>
          <div className="hub__withdraw-buttons">
            <button className="btn btn-primary hub__cta" onClick={startRun}>Withdraw &amp; Plan</button>
            <button className="btn btn-secondary hub__cta" onClick={() => setWithdrawing(false)}>Back</button>
          </div>
          <div className="hub__withdraw-note">Keep some in the bank — you can always come back if it goes wrong.</div>
        </div>
      )}
    </div>
  );
}

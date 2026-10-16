import { useMemo, useState } from 'react';
import type { GameState, GameAction } from '../../core';
import { getLocationLabel, getCountry, getTicketCost } from '../../core';
import { HubInfoWindow } from '../components/HubInfoWindow';
import { StatusStrip } from '../components/StatusStrip';
import { Tap } from '../components/Tap';

export type HubSheetId = 'bank' | 'safehouse' | 'assets';

interface Props {
  state: GameState;
  send: (action: GameAction) => void;
  onOpenSheet: (sheet: HubSheetId) => void;
}

const DEAL_BUFFER = 2000;

export function HubScreen({ state, send, onOpenSheet }: Props) {
  const [withdrawing, setWithdrawing] = useState(false);

  const country = getCountry(state.player.currentCountryId);
  const maxWithdraw = state.player.bank;
  const clamp = (n: number) => Math.max(1, Math.min(maxWithdraw, Math.round(n)));

  const suggested = useMemo(() => {
    const dests = state.world.filter((c) => c.id !== state.player.currentCountryId);
    const cheapestTicket = dests.length && country
      ? Math.min(...dests.map((c) => getTicketCost(country, c, 'economy')))
      : 0;
    return clamp(Math.round((cheapestTicket + DEAL_BUFFER) / 100) * 100);
  }, [state.world, state.player.currentCountryId, country, maxWithdraw]);

  const [amount, setAmount] = useState(() => suggested);

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

      <StatusStrip state={state} />

      <div className="hub__actions">
        <Tap className="hub__sheet-btn" onTap={() => onOpenSheet('bank')}>Bank</Tap>
        <Tap className="hub__sheet-btn" onTap={() => onOpenSheet('safehouse')}>Safehouse</Tap>
        <Tap className="hub__sheet-btn" onTap={() => onOpenSheet('assets')}>Assets</Tap>
      </div>

      {!withdrawing ? (
        <Tap
          className="hub__cta"
          onTap={() => setWithdrawing(true)}
          disabled={maxWithdraw < 1}
        >
          <span className="hub__cta-play">▶</span> Start a Run
        </Tap>
      ) : (
        <div className="hub__withdraw">
          <div className="hub__withdraw-title">How much do you take with you?</div>
          <div className="hub__withdraw-stepper">
            <Tap className="hub__step" onTap={() => setAmount((a) => clamp(a - 100))}>−</Tap>
            <div className="hub__withdraw-amt">${clamp(amount).toLocaleString()}</div>
            <Tap className="hub__step" onTap={() => setAmount((a) => clamp(a + 100))}>+</Tap>
          </div>
          <div className="hub__withdraw-quick">
            <Tap className="hub__quick is-suggested" onTap={() => setAmount(suggested)}>Suggested ${suggested.toLocaleString()}</Tap>
            <Tap className="hub__quick" onTap={() => setAmount(clamp(maxWithdraw))}>All</Tap>
            <Tap className="hub__quick" onTap={() => setAmount(clamp(1000))}>$1K</Tap>
            <Tap className="hub__quick" onTap={() => setAmount(clamp(5000))}>$5K</Tap>
          </div>
          <div className="hub__withdraw-buttons">
            <Tap className="btn btn-primary hub__cta" haptic="medium" onTap={startRun}>Withdraw &amp; Plan</Tap>
            <Tap className="btn btn-secondary hub__cta" onTap={() => setWithdrawing(false)}>Back</Tap>
          </div>
          <div className="hub__withdraw-note">Enough for a ticket and a deal, with a buffer. Keep the rest banked — you can always come back if it goes wrong.</div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { GameState, GameAction, TravelClass } from '../../core';
import { getCountry, getLocationLabel, getTicketCost } from '../../core';
import { audioManager } from '../../audio';

interface Props {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const ORIGIN_COUNTRY = 'london';

export const TravelPanel: React.FC<Props> = ({ state, dispatch }) => {
  const [selectedClass, setSelectedClass] = useState<TravelClass>('economy');
  const [showNoFunds, setShowNoFunds] = useState(false);
  const [showFirstWarning, setShowFirstWarning] = useState(false);

  const currentCountry = getCountry(state.player.currentCountryId)!;
  const productSelected = state.selectedProductId !== null;
  const selectedProductName = productSelected
    ? state.goods.find(g => g.id === state.selectedProductId)?.name
    : null;

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 className="page-title">Travel</h2>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>
            Currently in: <strong>{getLocationLabel(currentCountry)}</strong> · {currentCountry.region}
          </p>
        </div>
        {state.headingToAirport && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: '6px 12px' }}
            onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'CANCEL_AIRPORT' }); }}
          >
            Cancel Flight
          </button>
        )}
      </div>

      {/* Product gate */}
      {!productSelected && !state.headingToAirport && (
        <div
          className="card"
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderLeft: '3px solid var(--accent)',
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Select a product from the <strong>Market</strong> tab, then choose a destination to fly to.
        </div>
      )}
      {productSelected && selectedProductName && (
        <div
          className="card"
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderLeft: '3px solid var(--success)',
            fontSize: 13,
            color: 'var(--success)',
          }}
        >
          Buying: <strong>{selectedProductName}</strong> — choose a destination to fly to.
        </div>
      )}

      {/* Flight class toggle */}
      <div
        className="card"
        style={{
          display: 'flex',
          padding: 4,
          marginBottom: 16,
        }}
      >
        <button
          className="btn"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            background: selectedClass === 'economy' ? 'var(--accent)' : 'transparent',
            color: selectedClass === 'economy' ? '#000' : 'var(--text-muted)',
            border: 'none',
          }}
          onClick={() => { audioManager.playSfx('click'); setSelectedClass('economy'); }}
        >
          Economy
        </button>
        <button
          className="btn"
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 700,
            background: selectedClass === 'first_class' ? 'var(--accent)' : 'transparent',
            color: selectedClass === 'first_class' ? '#000' : 'var(--text-muted)',
            border: 'none',
          }}
          onClick={() => {
            audioManager.playSfx('click');
            if (!state.firstClassWarningShown) {
              setShowFirstWarning(true);
            } else {
              setSelectedClass('first_class');
            }
          }}
        >
          First Class
        </button>
      </div>

      {/* Destinations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state.world.filter(c => c.id !== ORIGIN_COUNTRY).map((country) => {
          const isCurrent = country.id === state.player.currentCountryId;
          const econPrice = getTicketCost(getCountry(state.player.currentCountryId)!, country, 'economy');
          const firstPrice = getTicketCost(getCountry(state.player.currentCountryId)!, country, 'first_class');
          const ticketPrice = selectedClass === 'first_class' ? firstPrice : econPrice;
          const canGo = !isCurrent && productSelected && state.player.cash >= ticketPrice;

          return (
            <div
              key={country.id}
              className={`card-highlight${isCurrent ? ' card-selected' : ''}`}
              style={{
                padding: '14px 16px',
                cursor: isCurrent ? 'default' : canGo ? 'pointer' : 'pointer',
                opacity: isCurrent ? 0.6 : canGo ? 1 : 1,
              }}
              onClick={() => {
                if (isCurrent) return;
                audioManager.playSfx('click');
                if (canGo) {
                  dispatch({ type: 'CONFIRM_FLIGHT', toCountryId: country.id, travelClass: selectedClass });
                } else {
                  setShowNoFunds(true);
                }
              }}
            >
              {/* Country name + region */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: isCurrent ? 'var(--accent)' : 'var(--text)' }}>
                  {getLocationLabel(country)}
                  {isCurrent && <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>(here)</span>}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 6 }}>
                  {country.region}
                </span>
              </div>

              {/* Details row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  Police: {Math.round((country.policeIntensity / 30) * 100)}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: canGo ? 'var(--accent)' : 'var(--danger)' }}>
                  ${ticketPrice.toLocaleString()}
                </div>
              </div>

              {/* Both class prices */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                <span>Economy ${econPrice.toLocaleString()}</span>
                <span>First ${firstPrice.toLocaleString()}</span>
              </div>

              {/* Disabled reason */}
              {!canGo && !isCurrent && (
                <div style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)' }}>
                  {!productSelected ? 'Select a product first' : 'Insufficient funds'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No funds dialog */}
      {showNoFunds && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowNoFunds(false)}
        >
          <div className="card" style={{ padding: 24, maxWidth: 360, width: '90%', margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Flight Booking</div>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 16 }}>
              How are you going to book a flight if you don't even know what country you're flying to or which product you're going to buy, a retard could work that out!
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { audioManager.playSfx('click'); setShowNoFunds(false); }}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* First class warning dialog */}
      {showFirstWarning && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowFirstWarning(false)}
        >
          <div className="card" style={{ padding: 24, maxWidth: 360, width: '90%', margin: '0 auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Upgrade</div>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5, marginBottom: 16 }}>
              First class? You pretentious little prick. Fine, you've got less chance of being collared by customs as a VIP, but the ticket price is almost double. Ask yourself if it's worth it.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                audioManager.playSfx('click');
                setShowFirstWarning(false);
                setSelectedClass('first_class');
                dispatch({ type: 'FIRST_CLASS_WARNING_SHOWN' });
              }}
            >
              I'm sure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

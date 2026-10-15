import type { GameState, GameAction } from '../../core';
import { getUsedCapacity, getRemainingCapacity, getInventoryValue, KINGPIN_POOL, getLocationLabel, getCountry } from '../../core';

type Haptic = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface Props {
  state: GameState;
  send: (action: GameAction, style?: Haptic) => void;
}

export function StashSellScreen({ state, send }: Props) {
  const { player, goods } = state;
  const country = getCountry(player.currentCountryId);
  const invValue = getInventoryValue(player, state.currentMarketPrices);
  const used = getUsedCapacity(player);
  const remaining = getRemainingCapacity(player);

  const goodName = (id: string) => goods.find((g) => g.id === id)?.name ?? id;
  const sellValue = (goodId: string, qty: number) => {
    const p = state.currentMarketPrices.find((x) => x.goodId === goodId);
    return (p?.sellPrice ?? 0) * qty;
  };

  const stashAll = () => send({ type: 'STASH_GOODS' }, 'medium');
  const retrieve = (goodId: string, quantity: number) => send({ type: 'RETRIEVE_GOODS', goodId, quantity });

  const invTypes = player.inventory.length;
  const canEnd = player.inventory.length === 0;

  return (
    <div className="stash">
      <div className="plan__head">
        <div className="plan__step">Home</div>
        <h2 className="plan__title">Back in {country ? getLocationLabel(country) : 'London'}</h2>
        <p className="plan__sub">Stash your product, then sell to a kingpin — or bank your money and end the run.</p>
      </div>

      {/* On-hand */}
      <div className="stash__section">
        <div className="stash__section-head">
          <span>On you</span>
          <span className="stash__cap">{used.toFixed(1)}/{player.inventoryCapacity}kg · ${invValue.toLocaleString()}</span>
        </div>
        {player.inventory.length === 0 ? (
          <div className="stash__empty">Empty pockets. Retrieve product from your stash to sell it.</div>
        ) : (
          <>
            {player.inventory.map((item) => (
              <div key={item.goodId} className="stash__line">
                <span>{goodName(item.goodId)}</span>
                <span className="stash__qty">{item.quantity}x · ${sellValue(item.goodId, item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <button className="btn btn-secondary stash__btn" onClick={stashAll}>Stash everything</button>
          </>
        )}
      </div>

      {/* Stash */}
      <div className="stash__section">
        <div className="stash__section-head">
          <span>Stash</span>
          <span className="stash__cap">{player.stashCapacity}kg capacity</span>
        </div>
        {player.stash.length === 0 ? (
          <div className="stash__empty">Your stash is empty.</div>
        ) : (
          player.stash.map((item) => (
            <div key={item.goodId} className="stash__line">
              <span>{goodName(item.goodId)}</span>
              <button className="stash__retrieve" onClick={() => retrieve(item.goodId, item.quantity)}>
                Bring out {item.quantity}x
              </button>
            </div>
          ))
        )}
        <div className="stash__free">Free space: {Math.max(0, remaining).toFixed(1)}kg</div>
      </div>

      {/* Kingpins */}
      <div className="stash__section">
        <div className="stash__section-head">
          <span>Kingpins</span>
          <span className="stash__cap">{invTypes === 1 ? 'Ready to call' : 'One product at a time'}</span>
        </div>
        {KINGPIN_POOL.map((kp) => {
          const single = player.inventory.length === 1 ? player.inventory[0] : null;
          const buysIt = single ? kp.buys.includes(single.goodId) : false;
          const meetsMin = single ? sellValue(single.goodId, single.quantity) >= kp.minStashValue : false;
          const ok = invTypes === 1 && buysIt && meetsMin;
          const reason = invTypes !== 1
            ? (player.inventory.length === 0 ? 'Bring product out first' : 'Stash down to one product')
            : !buysIt ? `Doesn't buy ${single ? goodName(single.goodId) : 'that'}`
              : !meetsMin ? `Needs $${kp.minStashValue.toLocaleString()}+`
                : 'Tap to deal';
          return (
            <button
              key={kp.id}
              className={`plan__dest${ok ? '' : ' is-disabled'}`}
              disabled={!ok}
              onClick={() => send({ type: 'CONTACT_KINGPIN', kingpinId: kp.id }, 'heavy')}
            >
              <span className="plan__dest-name">{kp.name}</span>
              <span className={`plan__dest-cost${ok ? '' : ' danger'}`}>{reason}</span>
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-primary plan__cta"
        disabled={!canEnd}
        onClick={() => send({ type: 'END_TRIP' }, 'success')}
      >
        {canEnd ? 'Bank the money & end the run' : 'Stash your product first'}
      </button>
    </div>
  );
}

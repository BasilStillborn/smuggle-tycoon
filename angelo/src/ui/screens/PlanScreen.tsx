import { useMemo, useState } from 'react';
import type { GameState, GameAction, TravelClass } from '../../core';
import { getCountry, getTicketCost } from '../../core';
import { Tap } from '../components/Tap';

interface Props {
  state: GameState;
  send: (action: GameAction) => void;
  destinationFirst?: boolean;
}

export function PlanScreen({ state, send, destinationFirst = false }: Props) {
  const [step, setStep] = useState<'product' | 'destination'>(destinationFirst ? 'destination' : 'product');
  const [travelClass, setTravelClass] = useState<TravelClass>('economy');

  const origin = getCountry(state.player.currentCountryId);
  const selectedGood = state.goods.find((g) => g.id === state.selectedProductId) ?? null;

  const destinations = useMemo(
    () => state.world.filter((c) => c.id !== state.player.currentCountryId),
    [state.world, state.player.currentCountryId],
  );

  const book = (toCountryId: string) => {
    send({ type: 'CONFIRM_FLIGHT', toCountryId, travelClass });
  };

  if (step === 'product') {
    return (
      <div className="plan">
        <div className="plan__head">
          <div className="plan__step">Step 1 of 2</div>
          <h2 className="plan__title">What are you moving?</h2>
          <p className="plan__sub">Pick your product. Your contact abroad will quote you a price.</p>
        </div>

        <div className="plan__list">
          {state.goods.map((good) => {
            const price = state.currentMarketPrices.find((p) => p.goodId === good.id);
            const active = state.selectedProductId === good.id;
            return (
              <Tap
                key={good.id}
                className={`plan__good${active ? ' is-active' : ''}`}
                onTap={() => send({ type: 'SELECT_PRODUCT', goodId: good.id })}
              >
                <span className="plan__good-name">{good.name}</span>
                <span className="plan__good-meta">
                  {price ? `~$${price.buyPrice.toLocaleString()}/${good.unitOfMeasure}` : good.unitOfMeasure}
                </span>
              </Tap>
            );
          })}
        </div>

        <Tap
          className="btn btn-primary plan__cta"
          disabled={!selectedGood}
          onTap={() => setStep('destination')}
        >
          {selectedGood ? `Continue with ${selectedGood.name}` : 'Select a product'}
        </Tap>
      </div>
    );
  }

  return (
    <div className="plan">
      <div className="plan__head">
        <div className="plan__step">Step 2 of 2</div>
        <h2 className="plan__title">Where are you flying?</h2>
        {selectedGood && <p className="plan__sub">Buying {selectedGood.name} from {origin?.city ?? 'home'}.</p>}
      </div>

      <div className="plan__class">
        {(['economy', 'first_class'] as TravelClass[]).map((c) => (
          <Tap
            key={c}
            className={`plan__class-btn${travelClass === c ? ' is-active' : ''}`}
            onTap={() => setTravelClass(c)}
          >
            {c === 'economy' ? 'Economy' : 'First Class'}
          </Tap>
        ))}
      </div>

      <div className="plan__list">
        {destinations.map((country) => {
          const cost = origin ? getTicketCost(origin, country, travelClass) : 0;
          const affordable = state.player.cash >= cost;
          return (
            <Tap
              key={country.id}
              className={`plan__dest${affordable ? '' : ' is-disabled'}`}
              disabled={!affordable}
              haptic="medium"
              onTap={() => book(country.id)}
            >
              <span className="plan__dest-name">{country.city}, {country.name}</span>
              <span className={`plan__dest-cost${affordable ? '' : ' danger'}`}>${cost.toLocaleString()}</span>
            </Tap>
          );
        })}
      </div>

      <Tap className="btn btn-secondary plan__cta" onTap={() => setStep('product')}>
        Back
      </Tap>
    </div>
  );
}

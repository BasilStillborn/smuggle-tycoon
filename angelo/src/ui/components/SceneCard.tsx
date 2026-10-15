import { useEffect, useState } from 'react';
import type { ChoiceEvent } from '../../core';

interface Props {
  event: ChoiceEvent;
  onChoose: (choiceId: string) => void;
}

function categoryFor(id: string): string {
  if (id.startsWith('dealer_intro_') || id.startsWith('custom_qty_')) return 'The Deal';
  if (id.startsWith('dealer_select_')) return 'Your Contact';
  if (id.startsWith('traveler_') || id.startsWith('enc_') || id.startsWith('doc_check_') || id.startsWith('travel_sniff')) return 'Customs';
  if (id.startsWith('arrival_')) return 'Arrival';
  if (id.startsWith('summary_') || id.startsWith('return_summary_') || id.startsWith('sell_summary_') || id.startsWith('bust_summary_')) return 'Debrief';
  if (id.startsWith('chance_card_')) return 'A Turn of Fate';
  if (id.startsWith('safehouse_')) return 'Safehouse';
  if (id.startsWith('high_cap_')) return 'Risk Warning';
  return 'Encounter';
}

export function SceneCard({ event, onChoose }: Props) {
  const isCustomQty = event.id.startsWith('custom_qty_');
  const buyPrice = isCustomQty ? ((event as any)._buyPrice as number) || 100 : 0;
  const maxQty = isCustomQty ? ((event as any)._maxQty as number) || 1 : 1;
  const unit = isCustomQty ? ((event as any)._unit as string) || 'x' : 'x';
  const playerCash = isCustomQty ? ((event as any)._cash as number) || 0 : 0;

  const [customQty, setCustomQty] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  useEffect(() => {
    setEditing(false);
    if (isCustomQty) setCustomQty(Math.max(1, Math.min(10, maxQty)));
  }, [event.id, isCustomQty, maxQty]);

  const adjustQty = (delta: number) => setCustomQty((q) => Math.max(1, Math.min(maxQty, q + delta)));

  const commitEdit = () => {
    const n = parseInt(editVal, 10);
    if (!isNaN(n) && n >= 1 && n <= maxQty) setCustomQty(n);
    setEditing(false);
  };

  return (
    <div className="scene-card">
      <div className="scene-card__inner">
        <div className="scene-card__head">
          <div className="scene-card__eyebrow">
            <span className="scene-card__dot" />
            {categoryFor(event.id)}
          </div>
          <h1 className="scene-card__title">{event.title}</h1>
        </div>

        <div className="scene-card__body">
          <p className="scene-card__text">{event.context}</p>
        </div>

        <div className="scene-card__foot">
          {isCustomQty ? (
            <>
              <div className="qtystep">
                <button className="qtystep__btn" onClick={() => adjustQty(-1)} disabled={customQty <= 1}>−</button>
                {editing ? (
                  <input
                    className="input qtystep__input"
                    type="number"
                    min={1}
                    max={maxQty}
                    value={editVal}
                    autoFocus
                    onChange={(e) => setEditVal(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
                  />
                ) : (
                  <button className="qtystep__value" onClick={() => { setEditVal(String(customQty)); setEditing(true); }}>
                    <span className="qtystep__num">{customQty}</span>
                    <span className="qtystep__unit">{unit}{customQty !== 1 ? 's' : ''}</span>
                  </button>
                )}
                <button className="qtystep__btn" onClick={() => adjustQty(1)} disabled={customQty >= maxQty}>+</button>
              </div>

              <div className="qtystep__breakdown">
                <div><span>Price per {unit}</span><span>${buyPrice.toLocaleString()}</span></div>
                <div><span>Total cost</span><span className="accent">${(buyPrice * customQty).toLocaleString()}</span></div>
                <div>
                  <span>Remaining cash</span>
                  <span className={playerCash - buyPrice * customQty < 0 ? 'danger' : 'success'}>
                    ${(playerCash - buyPrice * customQty).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary scene-card__cta"
                disabled={customQty < 1 || customQty > maxQty}
                onClick={() => onChoose('qty_' + customQty)}
              >
                Confirm — {customQty} {unit}{customQty !== 1 ? 's' : ''}
              </button>
              <button className="btn btn-secondary scene-card__cta" onClick={() => onChoose('cancel')}>
                Walk away
              </button>
            </>
          ) : (
            event.choices.map((choice) => (
              <button
                key={choice.id}
                className="btn btn-secondary scene-card__choice"
                onClick={() => onChoose(choice.id)}
              >
                <span>{choice.text || choice.id}</span>
                <span className="scene-card__arrow">→</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

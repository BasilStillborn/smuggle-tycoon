import { useState, useEffect, useCallback } from 'react';
import type { GameState, GameAction, ChoiceEvent } from '../../core';
import { audioManager } from '../../audio';

interface Props {
  event: ChoiceEvent;
  dispatch: (action: GameAction) => void;
}

export function EventModal({ event, dispatch }: Props) {
  const [customQty, setCustomQty] = useState(1);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');
  const isCustomQty = event.id.startsWith('custom_qty_');
  const buyPrice = isCustomQty ? ((event as any)._buyPrice as number) || 100 : 0;
  const maxQty = isCustomQty ? ((event as any)._maxQty as number) || 1 : 1;
  const unit = isCustomQty ? ((event as any)._unit as string) || 'x' : 'x';
  const playerCash = isCustomQty ? ((event as any)._cash as number) || 0 : 0;

  useEffect(() => {
    setEditing(false);
    if (isCustomQty) {
      const defQty = Math.min(10, maxQty);
      setCustomQty(Math.max(1, defQty));
    }
  }, [event.title, event.id, isCustomQty]);

  const adjustQty = useCallback((delta: number) => {
    setCustomQty(prev => Math.max(1, Math.min(maxQty, prev + delta)));
  }, [maxQty]);

  const handleConfirmCustom = () => {
    if (customQty < 1 || customQty > maxQty) return;
    audioManager.playSfx('click');
    dispatch({ type: 'RESPOND_EVENT', choiceId: 'qty_' + customQty });
  };

  const startEditing = () => {
    setEditVal(String(customQty));
    setEditing(true);
  };

  const commitEdit = () => {
    const n = parseInt(editVal, 10);
    if (!isNaN(n) && n >= 1 && n <= maxQty) {
      setCustomQty(n);
    }
    setEditing(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }} />

      <div className="card" style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', zIndex: 1 }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600 }}>
              Encounter
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{event.title}</div>
        </div>

        {/* Context */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', maxHeight: 220, overflowY: 'auto', fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
          {event.context}
        </div>

        {/* Choices or Custom Input */}
        {isCustomQty ? (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--accent)' }}>▶</span> Select Quantity
            </div>

            {/* Quick-jump row */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 12 }}>
              {[
                { label: 'MIN', fn: () => setCustomQty(1) },
                { label: '−10', fn: () => adjustQty(-10) },
                { label: '+10', fn: () => adjustQty(10) },
                { label: 'MAX', fn: () => setCustomQty(maxQty) },
              ].map(b => (
                <button key={b.label} className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }} onClick={b.fn}>{b.label}</button>
              ))}
            </div>

            {/* Arrow controls + quantity */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
              <button
                className="btn btn-secondary"
                style={{ width: 44, height: 44, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                onClick={() => adjustQty(-1)}
                disabled={customQty <= 1}
              >▼</button>

              {editing ? (
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={editVal}
                  onChange={(e) => setEditVal(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
                  autoFocus
                  className="input"
                  style={{ width: 100, fontSize: 24, fontWeight: 800, textAlign: 'center', color: 'var(--accent)' }}
                />
              ) : (
                <button onClick={startEditing} style={{ textAlign: 'center', minWidth: 80, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text)' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{customQty}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{unit}{customQty !== 1 ? 's' : ''}</div>
                </button>
              )}

              <button
                className="btn btn-secondary"
                style={{ width: 44, height: 44, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                onClick={() => adjustQty(1)}
                disabled={customQty >= maxQty}
              >▲</button>
            </div>

            {/* Price breakdown */}
            <div className="card" style={{ padding: '12px 16px', marginBottom: 16, background: 'var(--bg)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Price per {unit}:</span>
                <span>${buyPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total cost:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${(buyPrice * customQty).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Remaining cash:</span>
                <span style={{ color: playerCash - buyPrice * customQty < 0 ? 'var(--danger)' : 'var(--success)' }}>
                  ${(playerCash - buyPrice * customQty).toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max affordable:</span>
                <span style={{ color: 'var(--text-dim)' }}>{maxQty} {unit}s</span>
              </div>
            </div>

            {/* Confirm / Cancel */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleConfirmCustom}
                disabled={customQty < 1 || customQty > maxQty}
              >
                Confirm
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'RESPOND_EVENT', choiceId: 'cancel' }); }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--accent)' }}>▶</span> Available Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {event.choices.map((choice, idx) => (
                <button
                  key={choice.id}
                  className="btn btn-secondary"
                  style={{
                    textAlign: 'left',
                    padding: '14px 18px',
                    fontSize: 13,
                    lineHeight: 1.4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--border-light)',
                  }}
                  onClick={() => {
                    audioManager.playSfx('click');
                    dispatch({ type: 'RESPOND_EVENT', choiceId: choice.id });
                  }}
                >
                  <span style={{ flex: 1 }}>
                    <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>[{idx + 1}]</span>
                    {choice.text}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '10px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.5 }}>
            — Your choice will have consequences —
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import type { GameState, GameAction, ChoiceEvent } from '../../core';
import { audioManager } from '../../audio';

interface EventModalProps {
  event: ChoiceEvent;
  dispatch: (action: GameAction) => void;
}

function TypewriterText({ text, speed = 20 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && <span className="animate-pulse text-retro-accent">▌</span>}
    </span>
  );
}

export function EventModal({ event, dispatch }: EventModalProps) {
  const [revealed, setRevealed] = useState(false);
  const [customQty, setCustomQty] = useState(1);
  const isCustomQty = event.id.startsWith('custom_qty_');
  const buyPrice = isCustomQty ? ((event as any)._buyPrice as number) || 100 : 0;
  const maxQty = isCustomQty ? ((event as any)._maxQty as number) || 1 : 1;
  const unit = isCustomQty ? ((event as any)._unit as string) || 'x' : 'x';

  useEffect(() => {
    setRevealed(false);
    if (isCustomQty) {
      const defQty = Math.min(10, maxQty);
      setCustomQty(Math.max(1, defQty));
    }
    const t = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(t);
  }, [event.title, event.id, isCustomQty]);

  const adjustQty = useCallback((delta: number) => {
    setCustomQty(prev => Math.max(1, Math.min(maxQty, prev + delta)));
  }, [maxQty]);

  const handleConfirmCustom = () => {
    if (customQty < 1 || customQty > maxQty) return;
    audioManager.playSfx('click');
    dispatch({ type: 'RESPOND_EVENT', choiceId: 'qty_' + customQty });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scanline backdrop */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.015) 2px, rgba(0,255,0,0.015) 4px)',
        }} />
      </div>

      <div className="relative border-2 border-retro-border bg-retro-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_30px_rgba(0,255,0,0.1)]">
        {/* Header */}
        <div className="border-b-2 border-retro-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-retro-accent rounded-full animate-pulse" />
            <div className="text-retro-accent text-[10px] uppercase tracking-[0.2em] glow-text">
              Encounter Logged
            </div>
          </div>
          <div className="text-xl font-bold tracking-wide">{event.title}</div>
          <div className="w-16 h-[1px] bg-retro-accent/30 mt-3" />
        </div>

        {/* Context with typewriter */}
        <div className="p-6 text-sm text-gray-300 leading-relaxed border-b-2 border-retro-border min-h-[80px] whitespace-pre-wrap">
          {revealed ? (
            <TypewriterText text={event.context} speed={15} />
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <span className="animate-pulse">⟐</span> Initializing transmission...
            </div>
          )}
        </div>

        {/* Choices or Custom Input */}
        {isCustomQty ? (
          <div className="p-6 space-y-4">
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="text-retro-accent">▶</span> Select Quantity
            </div>

            {/* Arrow controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => adjustQty(-1)}
                onDoubleClick={() => adjustQty(-5)}
                disabled={customQty <= 1}
                className="touch-target w-12 h-12 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 hover:text-retro-accent text-lg flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >▼</button>
              <div className="text-center min-w-[80px]">
                <div className="text-3xl font-bold text-retro-accent tabular-nums">{customQty}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{unit}{customQty !== 1 ? 's' : ''}</div>
              </div>
              <button
                onClick={() => adjustQty(1)}
                onDoubleClick={() => adjustQty(5)}
                disabled={customQty >= maxQty}
                className="touch-target w-12 h-12 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-300 hover:text-retro-accent text-lg flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >▲</button>
            </div>

            {/* Price breakdown */}
            <div className="border border-retro-border bg-[#0a0a0a] p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Price per {unit}:</span>
                <span className="text-gray-300">${buyPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total cost:</span>
                <span className="text-retro-accent font-bold">${(buyPrice * customQty).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-retro-border pt-1 mt-1">
                <span className="text-gray-500">Max affordable:</span>
                <span className="text-gray-400">{maxQty} {unit}s</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmCustom}
                disabled={customQty < 1 || customQty > maxQty}
                className="touch-target flex-1 border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs font-bold uppercase transition-colors disabled:opacity-30"
              >Confirm</button>
              <button
                onClick={() => { audioManager.playSfx('click'); dispatch({ type: 'RESPOND_EVENT', choiceId: 'cancel' }); }}
                className="touch-target flex-1 border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-4 py-3 text-xs uppercase transition-colors"
              >Cancel</button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-3">
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="text-retro-accent">▶</span> Available Actions
            </div>
            {event.choices.map((choice, idx) => (
              <button
                key={choice.id}
                onClick={() => {
                  audioManager.playSfx('click');
                  dispatch({ type: 'RESPOND_EVENT', choiceId: choice.id });
                }}
                className="touch-target w-full text-left border-2 border-retro-border bg-[#111] hover:bg-[#222] hover:border-retro-accent px-5 py-4 text-xs transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-retro-text font-bold mb-2 group-hover:text-retro-accent transition-colors">
                      <span className="text-gray-600 mr-2">[{idx + 1}]</span>
                      {choice.text}
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-700 shrink-0 self-center group-hover:text-retro-accent transition-colors">
                    [SELECT]
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-retro-border p-3 text-center">
          <div className="text-[8px] text-gray-800 tracking-[0.3em] uppercase">
            — Your choice will have consequences —
          </div>
        </div>
      </div>
    </div>
  );
}

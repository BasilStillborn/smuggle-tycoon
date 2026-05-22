import { useState, useCallback, useEffect } from 'react';
import { submitScore } from '../../supabase';
import { audioManager } from '../../audio';

interface ScoreSubmitModalProps {
  state: {
    characterName: string;
    cash: number;
    bank: number;
    peakNetWorth: number;
    totalProfit: number;
    totalTrips: number;
    totalBusts: number;
    reputation: number;
    survivalTime: number;
    countriesVisited: number;
  };
  onDone: () => void;
}

export function ScoreSubmitModal({ state, onDone }: ScoreSubmitModalProps) {
  const [alias, setAlias] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState('');

  const score = state.cash + state.peakNetWorth + state.totalProfit;

  const handleSubmit = useCallback(async () => {
    if (alias.trim().length === 0) {
      setError('Alias is required.');
      return;
    }
    if (alias.trim().length > 15) {
      setError('Alias must be 15 characters or less.');
      return;
    }

    audioManager.playSfx('click');
    setSubmitting(true);
    setError('');

    const res = await submitScore(alias.trim(), state);
    setResult({ success: res.success, message: res.message });
    setSubmitting(false);
  }, [alias, state]);

  const handleSkip = useCallback(() => {
    audioManager.playSfx('click');
    onDone();
  }, [onDone]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !submitting && !result) {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleSubmit, submitting, result]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="border-2 border-retro-border bg-retro-panel max-w-lg w-full">
        {/* Header */}
        <div className="border-b-2 border-retro-border p-5 text-center">
          <div className="text-retro-accent text-xs uppercase tracking-widest mb-1 glow-text">
            Run Complete
          </div>
          <div className="text-lg font-bold">Submit Your Score</div>
        </div>

        {/* Score summary */}
        <div className="p-5 border-b-2 border-retro-border">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-500">Final Cash</div>
            <div className="text-right text-retro-success">${state.cash.toLocaleString()}</div>
            <div className="text-gray-500">Peak Net Worth</div>
            <div className="text-right text-retro-accent">${state.peakNetWorth.toLocaleString()}</div>
            <div className="text-gray-500">Total Profit</div>
            <div className="text-right text-retro-success">${state.totalProfit.toLocaleString()}</div>
            <div className="text-gray-500">Survival Time</div>
            <div className="text-right">{state.survivalTime} turns</div>
            <div className="text-gray-500">Countries Visited</div>
            <div className="text-right">{state.countriesVisited}/7</div>
            <div className="text-gray-500">Busts</div>
            <div className="text-right text-retro-danger">{state.totalBusts}</div>
            <div className="text-gray-500">Reputation</div>
            <div className="text-right">{state.reputation}/100</div>
          </div>
          <div className="mt-3 pt-3 border-t border-retro-border flex justify-between text-sm">
            <span className="text-gray-400 font-bold">Score</span>
            <span className="text-retro-accent font-bold glow-text">${score.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit form */}
        <div className="p-5">
          {result ? (
            <div className="text-center">
              <div className={`text-sm mb-3 ${result.success ? 'text-retro-success' : 'text-retro-danger'}`}>
                {result.message}
              </div>
              <button
                onClick={handleSkip}
                className="touch-target border-2 border-retro-accent text-retro-accent bg-[#111] hover:bg-[#222] px-8 py-3 text-sm transition-colors"
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                Enter your alias
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => { setAlias(e.target.value); setError(''); }}
                maxLength={15}
                placeholder="e.g., GhostRunner"
                className="w-full bg-[#0a0a0a] border-2 border-retro-border p-3 text-sm text-retro-text mb-3 placeholder-gray-700"
                autoFocus
                disabled={submitting}
              />
              {error && (
                <div className="text-retro-danger text-[10px] mb-3">{error}</div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || alias.trim().length === 0}
                  className={`touch-target flex-1 border-2 px-5 py-3 text-xs transition-colors ${
                    submitting || alias.trim().length === 0
                      ? 'border-retro-border bg-[#111] text-gray-600 cursor-not-allowed opacity-50'
                      : 'border-retro-accent text-retro-accent bg-[#111] hover:bg-[#222]'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </button>
                <button
                  onClick={handleSkip}
                  disabled={submitting}
                  className="touch-target border-2 border-retro-border bg-[#111] hover:bg-[#222] px-5 py-3 text-xs text-gray-400 transition-colors"
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

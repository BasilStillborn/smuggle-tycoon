import { useState, useCallback, useEffect } from 'react';
import { submitScore } from '../../supabase';
import { audioManager } from '../../audio';

interface Props {
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

export function ScoreSubmitModal({ state, onDone }: Props) {
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Run Complete</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Submit Your Score</div>
        </div>

        {/* Score summary */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>Final Cash</span>
            <span style={{ textAlign: 'right', color: 'var(--success)' }}>${state.cash.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Peak Net Worth</span>
            <span style={{ textAlign: 'right', color: 'var(--accent)' }}>${state.peakNetWorth.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Total Profit</span>
            <span style={{ textAlign: 'right', color: 'var(--success)' }}>${state.totalProfit.toLocaleString()}</span>
            <span style={{ color: 'var(--text-muted)' }}>Survival Time</span>
            <span style={{ textAlign: 'right' }}>{state.survivalTime} turns</span>
            <span style={{ color: 'var(--text-muted)' }}>Countries</span>
            <span style={{ textAlign: 'right' }}>{state.countriesVisited}/7</span>
            <span style={{ color: 'var(--text-muted)' }}>Busts</span>
            <span style={{ textAlign: 'right', color: 'var(--danger)' }}>{state.totalBusts}</span>
            <span style={{ color: 'var(--text-muted)' }}>Reputation</span>
            <span style={{ textAlign: 'right' }}>{state.reputation}/100</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 15, fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Score</span>
            <span style={{ color: 'var(--accent)' }}>${score.toLocaleString()}</span>
          </div>
        </div>

        {/* Submit */}
        <div style={{ padding: '20px 24px' }}>
          {result ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, marginBottom: 12, color: result.success ? 'var(--success)' : 'var(--danger)' }}>
                {result.message}
              </div>
              <button className="btn btn-primary" onClick={handleSkip}>Continue</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Enter your alias
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => { setAlias(e.target.value); setError(''); }}
                maxLength={15}
                placeholder="e.g., GhostRunner"
                className="input"
                style={{ marginBottom: 12 }}
                autoFocus
                disabled={submitting}
              />
              {error && <div style={{ fontSize: 11, color: 'var(--danger)', marginBottom: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleSubmit}
                  disabled={submitting || alias.trim().length === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSkip}
                  disabled={submitting}
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

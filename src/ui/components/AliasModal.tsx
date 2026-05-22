import { useState, useEffect } from 'react';
import { audioManager } from '../../audio';

interface AliasModalProps {
  onDone: () => void;
  onLoadSave: () => void;
}

const hasSavedGame = (): boolean => {
  try { return !!localStorage.getItem('angelo_save'); } catch { return false; }
};

export function AliasModal({ onDone, onLoadSave }: AliasModalProps) {
  const [alias, setAlias] = useState(() => localStorage.getItem('angelo_alias') ?? '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = alias.trim();
    if (trimmed.length === 0) {
      setError('Enter a name.');
      return;
    }
    if (trimmed.length > 15) {
      setError('Max 15 characters.');
      return;
    }
    audioManager.playSfx('click');
    localStorage.setItem('angelo_alias', trimmed);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-sm w-full p-6">
        <div className="text-retro-accent text-xs uppercase tracking-widest mb-4 glow-text text-center">Enter Your Alias</div>
        <div className="text-sm text-gray-400 mb-4 text-center leading-relaxed">
          The underworld will know your name. Scores are tracked globally.
        </div>
        <input
          type="text"
          maxLength={15}
          value={alias}
          onChange={(e) => { setAlias(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Your alias..."
          autoFocus
          className="w-full bg-[#0a0a0a] border border-retro-border text-gray-300 px-3 py-2 text-xs mb-2 outline-none focus:border-retro-accent"
        />
        {error && <div className="text-retro-danger text-[10px] mb-2">{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={alias.trim().length === 0}
          className="touch-target w-full border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-4 py-3 text-xs transition-colors font-bold uppercase disabled:opacity-30"
        >
          Enter the Network
        </button>
        {hasSavedGame() && (
          <button
            onClick={() => {
              if (alias.trim()) localStorage.setItem('angelo_alias', alias.trim());
              onLoadSave();
            }}
            className="touch-target w-full border-2 border-retro-border bg-[#111] hover:bg-[#222] text-gray-400 px-4 py-3 text-xs transition-colors mt-2 uppercase"
          >
            Load Saved Game
          </button>
        )}
        <div className="text-[8px] text-gray-700 text-center mt-3">
          You can change this later in Game Options
        </div>
      </div>
    </div>
  );
}

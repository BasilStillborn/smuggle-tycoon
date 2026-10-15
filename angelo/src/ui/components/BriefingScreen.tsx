import { useState, useCallback } from 'react';
import { audioManager } from '../../audio';

interface BriefingScreenProps {
  onContinue: () => void;
}

export function BriefingScreen({ onContinue }: BriefingScreenProps) {
  const [alias, setAlias] = useState(() => localStorage.getItem('angelo_alias') ?? '');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const trimmed = alias.trim();
    if (trimmed.length === 0) {
      setError('You need a name, you daft prick.');
      return;
    }
    if (trimmed.length > 15) {
      setError('Keep it under 15 characters, it\'s not your full CV.');
      return;
    }
    audioManager.playSfx('click');
    localStorage.setItem('angelo_alias', trimmed);
    onContinue();
  }, [alias, onContinue]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)',
      }}
    >
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" />

      <div className="relative z-10 max-w-lg w-full text-center animate-fadeIn max-h-[85vh] overflow-y-auto">
        <div className="border border-retro-border bg-retro-panel p-6">
          <div className="text-retro-accent text-xs uppercase tracking-widest mb-4 glow-text">
            Your First Move
          </div>

          <div className="text-xs text-gray-300 leading-relaxed space-y-3 font-mono text-left">
            <p>
              There's a leaderboard out there, Angelo. Real names. Real money. The only question is: can you be the baddest motherfucker in the world and hold the highest score? Because that's the whole point of this — everything else is just noise.
            </p>
            <p>
              You start with <span className="text-retro-success">£5,000</span> in the bank. You're nobody.
            </p>

            <div className="border-t border-retro-border pt-3">
              <div className="text-retro-accent text-[10px] uppercase tracking-widest mb-3">How It Works</div>

              <p>
                <span className="text-retro-accent font-bold">1. THE MONEY</span> — Click <span className="text-retro-accent">[BANK]</span> at the top. Withdraw cash. Every pound you carry is product money and bribe money. Don't leave home skint.
              </p>

              <p>
                <span className="text-retro-accent font-bold">2. THE PRODUCT</span> — Pick something in the Market panel. Check the demand. Check who buys it back in London. Don't buy something if nobody wants it, you daft prick.
              </p>

              <p>
                <span className="text-retro-accent font-bold">3. THE FLIGHT</span> — Book a ticket. Colombia for cocaine. Afghanistan for heroin. Spain for ecstasy. Netherlands for weed, etc. Pick your destination, pack your cash, get on the plane.
              </p>

              <p>
                <span className="text-retro-accent font-bold">4. THE DEAL</span> — Meet the local dealer. Some of these dealers are good men trying to make an honest living, just in a dishonest way. Others are complete cunts who don't fuck around. And some are basically just fucking warlords. So be very careful who you choose to deal with. Try to make it out of there alive.
              </p>

              <p>
                <span className="text-retro-accent font-bold">5. CUSTOMS</span> — This is where it gets tasty. Bribe the officer. Bluff your way through. Or walk straight past like you own the terminal. Acting cocky gets you searched. Acting scared gets you searched faster. Find the middle ground. Keep £500 spare for bribes — minimum.
              </p>

              <p>
                <span className="text-retro-accent font-bold">6. LUXURY</span> — A gold watch gets you respect. A tailored suit opens doors. But walking through Heathrow looking like a Saudi prince draws attention. Dress for the occasion, not the catwalk.
              </p>

              <p>
                <span className="text-retro-accent font-bold">7. BACK HOME</span> — Stash your product in the Inventory panel. Build up enough and the kingpins start answering your calls. Get it right and your score climbs. Get it wrong and you're back in mum's basement.
              </p>
            </div>
          </div>

          {/* Alias input */}
          <div className="border-t border-retro-border pt-4 mt-4">
            <input
              type="text"
              maxLength={15}
              value={alias}
              onChange={(e) => { setAlias(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
              placeholder="Enter your alias..."
              autoFocus
              className="w-full bg-[#0a0a0a] border border-retro-border text-gray-300 px-3 py-2 text-xs outline-none focus:border-retro-accent text-center"
            />
            {error && <div className="text-retro-danger text-[10px] mt-1">{error}</div>}
            <div className="text-[8px] text-gray-700 mt-1">Max 15 characters — the underworld will know your name</div>
          </div>

          <button
            onClick={handleContinue}
            disabled={alias.trim().length === 0}
            className="touch-target mt-4 border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-8 py-3 text-sm transition-all duration-300 font-bold tracking-widest uppercase shrink-0 disabled:opacity-30"
          >
            Right, now fuck off
          </button>
        </div>
      </div>
    </div>
  );
}

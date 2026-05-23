import { useCallback } from 'react';
import { audioManager } from '../../audio';

interface BriefingScreenProps {
  onContinue: () => void;
}

export function BriefingScreen({ onContinue }: BriefingScreenProps) {
  const handleContinue = useCallback(() => {
    audioManager.playSfx('click');
    onContinue();
  }, [onContinue]);

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
          <div className="text-retro-accent text-xs uppercase tracking-widest mb-6 glow-text">
            Your First Move
          </div>

          <div className="text-xs text-gray-300 leading-relaxed space-y-3 font-mono">
            <p>
              You have <span className="text-retro-success">$5,000</span> to your name.
            </p>
            <p>
              Withdraw cash using the <span className="text-retro-accent">ATM</span> at the top.
              Every dollar you carry is product money — and bribe money at customs.
            </p>
            <p>
              Pick a product in the <span className="text-retro-accent">Market</span> — notice when demand
              is higher for each product — then book a flight. Colombia is best for cocaine. Afghanistan
              for heroin. The Netherlands for weed. etc
            </p>
            <p>
              At your destination, meet a dealer. Negotiate. Buy your product. Then fly home — through
              customs. Bribe the officer, bluff your way past, or walk straight through. Try not to act
              suspicious. Luxury personal items will give you extra street cred — a gold watch or a
              tailored suit will get you noticed.
            </p>
            <p>
              Back in London, stash your goods, there are three dealers in your area who will buy your product..
              <span className="text-retro-accent">Avi</span>, the Hatton Garden Jew — typically greedy
              but when he gets to know you, good deals can make you a lot of money. <span className="text-retro-accent">Sergio</span>{' '}the Albanian — you can't trust him, but you may not have a choice.                <span className="text-retro-accent">Quentin</span>,
               gay as a rainbow in a grubby flat above a Dalston launderette. Thinks he's Russell Brand but looks like Keith Chegwin. Snorts gear constantly, calls you "chocolate boy." Don't let him touch you — he WILL try. These lot won't meet for
               pocket change deals though — build up your stash before giving them a call.
            </p>
            <p className="text-retro-accent text-xs italic pt-2">
              Why not GO BIG on your first few deals? You might just have beginner's luck
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="touch-target mt-6 border-2 border-retro-accent bg-retro-accent/10 hover:bg-retro-accent/20 text-retro-accent px-8 py-3 text-sm transition-all duration-300 font-bold tracking-widest uppercase shrink-0"
          >
            (Let's go!)
          </button>
        </div>
      </div>
    </div>
  );
}

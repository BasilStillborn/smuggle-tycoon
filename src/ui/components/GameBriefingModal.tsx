import { audioManager } from '../../audio';

interface GameBriefingModalProps {
  onClose: () => void;
}

export function GameBriefingModal({ onClose }: GameBriefingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%)' }}>
      <div className="relative z-10 border-2 border-retro-border bg-retro-panel max-w-lg w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-retro-border pb-2">
          <div className="text-retro-accent text-xs uppercase tracking-widest glow-text">
            Game Briefing
          </div>
          <button
            onClick={() => { audioManager.playSfx('click'); onClose(); }}
            className="text-gray-500 hover:text-gray-300 text-xs border border-retro-border px-2 py-0.5"
          >
            ✕
          </button>
        </div>

        <div className="text-xs text-gray-300 leading-relaxed space-y-3 font-mono">
          <p>
            You have <span className="text-retro-success">$5,000</span> in the bank.
          </p>
          <p>
            <span className="text-retro-accent font-bold">1. Withdraw cash</span> — use the Bank box in the header.
            Every dollar you carry is product money and bribe money at customs.
          </p>
          <p>
            <span className="text-retro-accent font-bold">2. Pick a product</span> in the Market panel.
            Colombia is best for cocaine. Afghanistan for heroin. Netherlands for weed/hash. Spain for meth/ecstasy.
          </p>
          <p>
            <span className="text-retro-accent font-bold">3. Book a flight</span> to your destination.
            You need enough cash for the ticket + minimum product + $500 customs reserve.
          </p>
          <p>
            <span className="text-retro-accent font-bold">4. Meet a dealer</span> — each country has three.
            Select how much to buy. Beginner's luck gives you 100% success on your first three deals.
          </p>
          <p>
            <span className="text-retro-accent font-bold">5. Fly home through customs</span> — bribe the officer,
            bluff your way past, or walk straight through. Keep $500 spare for bribes.
          </p>
          <p>
            <span className="text-retro-accent font-bold">6. Stash your goods</span> in the Inventory panel.
            Retrieve them when you're ready to sell.
          </p>

          <div className="border-t border-retro-border pt-3 mt-3">
            <div className="text-retro-accent text-[10px] uppercase tracking-wider mb-2">The Kingpins</div>
            <p>
              <span className="text-retro-accent">Quentin</span> — the queen above a Dalston launderette.
              Minimum <span className="text-retro-success">$750</span> stash value.
            </p>
            <p>
              <span className="text-retro-accent">Sergio</span> — Albanian car wash in Barking.
              Minimum <span className="text-retro-success">$2,000</span> stash value.
            </p>
            <p>
              <span className="text-retro-accent">Avi</span> — Hatton Garden jeweller.
              Minimum <span className="text-retro-success">$5,000</span> stash value. Best margins but highest entry.
            </p>
            <p className="text-gray-500 italic text-[10px]">
              Each kingpin pays a different rate. Build up your stash before calling.
            </p>
          </div>

          <div className="border-t border-retro-border pt-3">
            <div className="text-retro-accent text-[10px] uppercase tracking-wider mb-2">Tips</div>
            <p className="text-gray-400">
              Fly first class for credibility bonuses. Buy assets — a gold watch or tailored suit gives street cred.
              Check the Market panel before booking — demand changes with each flight.
              High heat draws more customs attention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

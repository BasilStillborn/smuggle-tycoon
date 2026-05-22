import { getSafehouseLevel, getSafehouseProgress } from '../visual/SafehouseState';

interface SafehousePanelProps {
  netWorth: number;
}

export function SafehousePanel({ netWorth }: SafehousePanelProps) {
  const { current, next, progress } = getSafehouseProgress(netWorth);

  const getLevelDots = () => {
    const dots = [];
    for (let i = 1; i <= 5; i++) {
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-500 ${
            i <= current.level
              ? 'bg-retro-accent shadow-[0_0_4px_rgba(212,160,23,0.5)]'
              : 'bg-gray-700'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="border border-retro-border bg-retro-panel p-3">
      <div className="text-retro-accent text-xs uppercase tracking-widest mb-2 border-b border-retro-border pb-1">
        Safehouse
      </div>

      <div className="flex gap-1 mb-2">{getLevelDots()}</div>

      <div className={`text-xs font-bold mb-1 ${current.level >= 3 ? 'text-retro-accent' : 'text-gray-400'}`}>
        {current.name}
      </div>
      <div className="text-[10px] text-gray-500 leading-relaxed mb-2">
        {current.description}
      </div>

      {next && (
        <div>
          <div className="text-[10px] text-gray-600 mb-1">
            Next: {next.name} (${next.minNetWorth.toLocaleString()})
          </div>
          <div className="h-1.5 bg-[#0a0a0a] border border-retro-border overflow-hidden">
            <div
              className="h-full bg-retro-accent transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {!next && (
        <div className="text-[10px] text-retro-accent italic">
          Maximum safehouse level achieved.
        </div>
      )}
    </div>
  );
}

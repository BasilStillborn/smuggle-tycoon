interface HeatMeterProps {
  heat: number;
  maxHeat: number;
}

export function HeatMeter({ heat, maxHeat }: HeatMeterProps) {
  const pct = Math.min(100, (heat / maxHeat) * 100);

  const color =
    pct >= 80 ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.6)]' :
    pct >= 55 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
    pct >= 30 ? 'bg-yellow-500 shadow-[0_0_4px_rgba(234,179,8,0.3)]' :
    'bg-green-500 shadow-[0_0_2px_rgba(34,197,94,0.2)]';

  const pulse = pct >= 70 ? 'animate-pulse' : '';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-[#0a0a0a] border border-retro-border relative overflow-hidden">
        <div
          className={`h-full ${color} ${pulse} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs w-8 text-right tabular-nums">{Math.round(pct)}</span>
    </div>
  );
}

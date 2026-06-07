type CategoryTileProps = {
  title: string;
  summary: string;
  icon: string;
  accent: string;
  badge?: string;
  openLabel?: string;
  onClick: () => void;
};

function CategoryTile({ title, summary, icon, accent, badge, openLabel = 'Open', onClick }: CategoryTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring group min-h-36 rounded-[1.5rem] border border-britain-ink/10 bg-white p-4 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${accent}`} aria-hidden="true">
          {icon}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] transition ${badge ? 'bg-britain-red text-white' : 'bg-britain-cream text-britain-ink/45 group-hover:bg-britain-mist group-hover:text-britain-navy'}`}>
          {badge ?? openLabel}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-black leading-tight text-britain-ink">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-britain-ink/60">{summary}</p>
    </button>
  );
}

export default CategoryTile;

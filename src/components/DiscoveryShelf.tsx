import type { ReactionResult } from '../data/reactions';
import type { CSSProperties } from 'react';

type DiscoveryShelfProps = {
  discoveries: ReactionResult[];
};

export function DiscoveryShelf({ discoveries }: DiscoveryShelfProps) {
  return (
    <section className="panel discovery-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Discoveries</p>
          <h2>{discoveries.length} logged</h2>
        </div>
      </div>
      <div className="discovery-list">
        {discoveries.length === 0 ? (
          <p>Run your first experiment to earn a discovery card.</p>
        ) : (
          discoveries.slice(0, 8).map((discovery) => (
            <article key={discovery.id} style={{ '--tone': discovery.palette[0] ?? '#67e8f9' } as CSSProperties}>
              <span>{discovery.reactionType}</span>
              <strong>{discovery.title}</strong>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

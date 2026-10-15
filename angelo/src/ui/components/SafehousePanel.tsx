import React from 'react';
import { getSafehouseProgress } from '../visual/SafehouseState';

interface Props {
  netWorth: number;
  currentTier: number;
}

const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

export const SafehousePanel: React.FC<Props> = ({ netWorth, currentTier }) => {
  const { current, next, progress } = getSafehouseProgress(netWorth, currentTier);

  return (
    <div className="page">
      <h2 className="page-title">Safehouse</h2>
      <p className="page-subtitle">Your current living situation</p>

      {/* Level indicator dots */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: i <= current.level
                  ? 'var(--accent)'
                  : 'var(--bg)',
                border: '2px solid',
                borderColor: i <= current.level ? 'var(--accent)' : 'var(--border-light)',
                transition: 'all 0.4s ease',
                boxShadow: i <= current.level ? '0 0 6px rgba(212,160,23,0.4)' : 'none',
              }}
            />
          ))}
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>
            Tier {current.level}/5
          </span>
        </div>

        {/* Current level name */}
        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: current.level >= 3 ? 'var(--accent)' : 'var(--text)',
              marginBottom: 4,
            }}
          >
            {current.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.4 }}>
            {current.description}
          </div>
        </div>

        {/* Progress to next level */}
        {next && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--text-muted)',
                marginBottom: 6,
              }}
            >
              <span>Next: {next.name} ({fmt(next.advanceAt)})</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div
              style={{
                height: 8,
                background: 'var(--bg)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  height: '100%',
                  background: 'var(--accent)',
                  borderRadius: 4,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>
          </div>
        )}
        {!next && (
          <div style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic' }}>
            Maximum safehouse level achieved.
          </div>
        )}
      </div>

      {/* Safehouse benefits info */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 8,
          }}
        >
          Benefits
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
          Higher tiers unlock more stash space, increased carry capacity, and greater respect on the streets.
        </div>
      </div>
    </div>
  );
};

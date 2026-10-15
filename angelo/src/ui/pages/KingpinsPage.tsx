import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Kingpin {
  id: number;
  username: string;
  level: number;
  net_worth: number;
  influence: number;
}

export const KingpinsPage: React.FC = () => {
  const api = useApi();
  const [kingpins, setKingpins] = useState<Kingpin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/kingpins/leaderboard')
      .then((res) => res.json())
      .then((data) => setKingpins(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2 className="page-title">Kingpins</h2>
      <p className="page-subtitle">The most powerful players in the city</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {kingpins.map((kp, i) => (
          <div
            key={kp.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: i < 3 ? 'var(--accent)' : 'var(--bg-secondary)',
                color: i < 3 ? '#000' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{kp.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Level {kp.level} · Influence {kp.influence.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, fontWeight: 600 }}>
              ${kp.net_worth.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

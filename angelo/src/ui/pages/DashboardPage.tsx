import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface DashboardData {
  username: string;
  level: number;
  cash: number;
  bank: number;
  net_worth: number;
  influence: number;
  heat: number;
  item_count: number;
  listing_count: number;
}

export const DashboardPage: React.FC = () => {
  const api = useApi();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api('/api/user/profile')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  const stats = [
    { label: 'Cash', value: `$${data.cash.toLocaleString()}`, accent: true },
    { label: 'Bank', value: `$${data.bank.toLocaleString()}`, accent: false },
    { label: 'Net Worth', value: `$${data.net_worth.toLocaleString()}`, accent: true },
    { label: 'Level', value: String(data.level), accent: false },
    { label: 'Influence', value: data.influence.toLocaleString(), accent: false },
  ];

  return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{data.username}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Level {data.level} · {data.item_count} items · {data.listing_count} listings
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: s.accent ? 'var(--accent)' : 'var(--text)',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {data.heat > 0 && (
        <div
          className="card"
          style={{
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderColor: data.heat > 50 ? 'rgba(220,38,38,0.4)' : undefined,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Heat Level</div>
            <div
              style={{
                height: 6,
                background: 'var(--bg)',
                borderRadius: 3,
                marginTop: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(data.heat, 100)}%`,
                  height: '100%',
                  background: data.heat > 50 ? 'var(--danger)' : 'var(--accent)',
                  borderRadius: 3,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: data.heat > 50 ? 'var(--danger)' : 'var(--text)',
            }}
          >
            {data.heat}%
          </span>
        </div>
      )}
    </div>
  );
};

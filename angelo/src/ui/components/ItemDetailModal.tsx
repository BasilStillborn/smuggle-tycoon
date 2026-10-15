import React from 'react';

interface Item {
  id: number;
  name: string;
  description: string;
  category: string;
  rarity: string;
  base_value: number;
  image_url?: string;
}

interface Props {
  item: Item;
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#4ade80',
  rare: '#60a5fa',
  epic: '#a78bfa',
  legendary: '#fbbf24',
};

export const ItemDetailModal: React.FC<Props> = ({ item, onClose, actionLabel, onAction }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 400,
          margin: '0 auto',
          padding: 24,
          borderRadius: '16px 16px 0 0',
          animation: 'slideUp 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{item.name}</div>
            <span
              style={{
                display: 'inline-block',
                fontSize: 11,
                fontWeight: 600,
                color: RARITY_COLORS[item.rarity] || '#9ca3af',
                background: `${RARITY_COLORS[item.rarity] || '#9ca3af'}20`,
                padding: '2px 8px',
                borderRadius: 4,
                marginTop: 4,
                textTransform: 'uppercase',
              }}
            >
              {item.rarity}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              width: 32,
              height: 32,
              borderRadius: '50%',
              fontSize: 18,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {item.category}
        </div>

        <p style={{ fontSize: 14, margin: '16px 0', lineHeight: 1.5, color: 'var(--text-muted)' }}>
          {item.description}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            fontSize: 14,
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>Base Value</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
            ${item.base_value.toLocaleString()}
          </span>
        </div>

        {actionLabel && onAction && (
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

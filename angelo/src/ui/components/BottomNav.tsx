import React from 'react';

export type TabId = 'dashboard' | 'market' | 'travel' | 'safehouse' | 'kingpins';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Home', icon: '◆' },
  { id: 'market', label: 'Market', icon: '▲' },
  { id: 'travel', label: 'Travel', icon: '●' },
  { id: 'safehouse', label: 'Safehouse', icon: '■' },
  { id: 'kingpins', label: 'Kingpins', icon: '★' },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  badge?: Partial<Record<TabId, number>>;
}

export const BottomNav: React.FC<Props> = ({ activeTab, onTabChange, badge }) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'var(--safe-bottom)',
        minHeight: 64,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              background: 'transparent',
              border: 'none',
              padding: '6px 0',
              cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.15s',
              position: 'relative',
              WebkitTapHighlightColor: 'transparent',
            }}
            className="tap-highlight"
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.02em' }}>
              {tab.label}
            </span>
            {badge?.[tab.id] ? (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: '50%',
                  marginRight: -20,
                  background: 'var(--badge-bg, var(--danger))',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 8,
                  minWidth: 16,
                  textAlign: 'center',
                  lineHeight: '14px',
                }}
              >
                {badge[tab.id]}
              </span>
            ) : null}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '25%',
                  right: '25%',
                  height: 2,
                  background: 'var(--accent)',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

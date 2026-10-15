import React, { useState } from 'react';
import { BottomNav, type TabId } from './BottomNav';
import { DashboardPage } from '../pages/DashboardPage';
import { MarketPage } from '../pages/MarketPage';
import { TravelPage } from '../pages/TravelPage';
import { SafehousePage } from '../pages/SafehousePage';
import { KingpinsPage } from '../pages/KingpinsPage';
import { LoginPage } from '../pages/LoginPage';

export const MobileApp: React.FC = () => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('angelo_token') ?? '');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const handleLogin = (newToken: string) => {
    localStorage.setItem('angelo_token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('angelo_token');
    setToken('');
  };

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />;
      case 'market': return <MarketPage />;
      case 'travel': return <TravelPage />;
      case 'safehouse': return <SafehousePage />;
      case 'kingpins': return <KingpinsPage />;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          paddingTop: 'calc(var(--safe-top) + 4px)',
          background: 'var(--bg-panel)',
          borderBottom: '1px solid var(--border)',
          minHeight: 48,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>◆ Angelo</span>
        <button
          onClick={handleLogout}
          style={{
            background: 'var(--bg-secondary)',
            border: 'none',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </header>

      <main style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {renderPage()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

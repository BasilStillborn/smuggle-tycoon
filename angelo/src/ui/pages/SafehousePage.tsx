import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ListingForm } from '../components/ListingForm';

interface InventoryItem {
  id: number;
  item_id: number;
  name: string;
  quantity: number;
}

interface SafehouseData {
  capacity: number;
  used: number;
  items: InventoryItem[];
}

export const SafehousePage: React.FC = () => {
  const api = useApi();
  const [data, setData] = useState<SafehouseData | null>(null);
  const [showListing, setShowListing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchSafehouse = () => {
    api('/api/inventory')
      .then((r) => r.json())
      .then((res) =>
        setData({
          capacity: res.capacity ?? 100,
          used: res.items?.length ?? 0,
          items: res.items ?? [],
        }),
      )
      .catch(() => {});
  };

  useEffect(() => { fetchSafehouse(); }, []);

  const handleCreateListing = async (form: { item_id: number; quantity: number; price: number }) => {
    setMsg(null);
    try {
      const res = await api('/api/market/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg('Item listed on market');
        setShowListing(false);
        fetchSafehouse();
      } else {
        setMsg(d.error || 'Failed to list');
      }
    } catch {
      setMsg('Network error');
    }
  };

  if (!data) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2 className="page-title">Safehouse</h2>

      <div
        className="card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Storage</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {data.used} / {data.capacity}
        </span>
      </div>

      {msg && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: msg.includes('listed') ? 'var(--success-dim)' : 'var(--danger-dim)',
            color: msg.includes('listed') ? 'var(--success)' : 'var(--danger)',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}

      {showListing && (
        <div style={{ marginBottom: 12 }}>
          <ListingForm
            inventory={data.items}
            onSubmit={handleCreateListing}
            onCancel={() => setShowListing(false)}
          />
        </div>
      )}

      {!showListing && data.items.length > 0 && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 12 }}
          onClick={() => setShowListing(true)}
        >
          List Item on Market
        </button>
      )}

      {data.items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
          Your safehouse is empty
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.items.map((inv) => (
            <div key={inv.id} className="card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{inv.name}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>x{inv.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ItemDetailModal } from '../components/ItemDetailModal';

interface Listing {
  id: number;
  item_id: number;
  item_name: string;
  item_rarity: string;
  item_description: string;
  item_base_value: number;
  quantity: number;
  unit_price: number;
  seller_name: string;
  created_at: string;
}

export const MarketPage: React.FC = () => {
  const api = useApi();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchListings = () => {
    setLoading(true);
    api('/api/market/listings')
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : data.listings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleBuy = async (listingId: number) => {
    setMsg(null);
    try {
      const res = await api(`/api/market/buy/${listingId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Purchased successfully`);
        setSelected(null);
        fetchListings();
      } else {
        setMsg(data.error || 'Purchase failed');
      }
    } catch {
      setMsg('Network error');
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Market</h2>
      <p className="page-subtitle">Buy and sell goods with other players</p>

      {msg && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: msg === 'Purchased successfully' ? 'var(--success-dim)' : 'var(--danger-dim)',
            color: msg === 'Purchased successfully' ? 'var(--success)' : 'var(--danger)',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {msg}
        </div>
      )}

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : listings.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 32 }}>
          No active listings
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {listings.map((l) => (
            <div
              key={l.id}
              className="card card-highlight"
              style={{ padding: '12px 14px' }}
              onClick={() => setSelected(l)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.item_name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                    {l.seller_name} · {l.quantity}x
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>
                    ${l.unit_price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    ${(l.unit_price * l.quantity).toLocaleString()} total
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ItemDetailModal
          item={{
            id: selected.item_id,
            name: selected.item_name,
            description: selected.item_description,
            category: 'Goods',
            rarity: selected.item_rarity,
            base_value: selected.item_base_value,
          }}
          onClose={() => setSelected(null)}
          actionLabel={`Buy for $${selected.unit_price.toLocaleString()}`}
          onAction={() => handleBuy(selected.id)}
        />
      )}
    </div>
  );
};

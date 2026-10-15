import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ItemDetailModal } from '../components/ItemDetailModal';

interface Item {
  id: number;
  item_id: number;
  name: string;
  description: string;
  category: string;
  rarity: string;
  base_value: number;
  quantity: number;
}

export const InventoryPage: React.FC = () => {
  const api = useApi();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Item | null>(null);

  useEffect(() => {
    api('/api/inventory')
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2 className="page-title">Inventory</h2>
      <p className="page-subtitle">{items.length} items stored</p>

      {items.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 32 }}>
          No items in inventory
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item) => (
            <div
              key={item.id}
              className="card card-highlight"
              style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => setSelected(item)}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.category}</div>
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>x{item.quantity}</span>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ItemDetailModal
          item={{
            id: selected.item_id,
            name: selected.name,
            description: selected.description,
            category: selected.category,
            rarity: selected.rarity,
            base_value: selected.base_value,
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

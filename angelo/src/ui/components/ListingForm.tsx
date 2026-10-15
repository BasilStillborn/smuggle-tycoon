import React, { useState } from 'react';

interface InventoryItem {
  id: number;
  item_id: number;
  name: string;
  quantity: number;
}

interface Props {
  inventory: InventoryItem[];
  onSubmit: (data: { item_id: number; quantity: number; price: number }) => Promise<void>;
  onCancel: () => void;
}

export const ListingForm: React.FC<Props> = ({ inventory, onSubmit, onCancel }) => {
  const [selectedId, setSelectedId] = useState<number>(inventory[0]?.item_id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  const selected = inventory.find((i) => i.item_id === selectedId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit({ item_id: selectedId, quantity, price });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        background: 'var(--bg-secondary)',
        borderRadius: 12,
      }}
    >
      <h3 style={{ margin: 0, fontSize: 15 }}>New Listing</h3>

      <select
        className="input"
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        required
      >
        <option value={0} disabled>Select item</option>
        {inventory.map((inv) => (
          <option key={inv.id} value={inv.item_id}>
            {inv.name} (x{inv.quantity})
          </option>
        ))}
      </select>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="number"
          className="input"
          placeholder="Quantity"
          min={1}
          max={selected?.quantity ?? 1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
          style={{ flex: 1 }}
        />
        <input
          type="number"
          className="input"
          placeholder="Price"
          min={1}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          style={{ flex: 2 }}
        />
      </div>

      {selected && quantity > selected.quantity && (
        <div style={{ fontSize: 12, color: '#f87171' }}>
          Not enough in inventory (have {selected.quantity})
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || !selectedId || quantity > (selected?.quantity ?? 0)}
          style={{ flex: 1 }}
        >
          {saving ? 'Creating...' : 'List Item'}
        </button>
      </div>
    </form>
  );
};

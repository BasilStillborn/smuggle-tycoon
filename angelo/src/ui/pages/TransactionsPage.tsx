import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Transaction {
  id: number;
  type: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  counterparty: string;
  created_at: string;
}

export const TransactionsPage: React.FC = () => {
  const api = useApi();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/transactions')
      .then((res) => res.json())
      .then((data) => setTxns(Array.isArray(data) ? data : data.transactions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2 className="page-title">Transaction History</h2>

      {txns.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 32 }}>
          No transactions yet
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {txns.map((tx) => (
          <div
            key={tx.id}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: tx.type === 'purchase' ? 'var(--danger)' : 'var(--success, #4ade80)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {tx.type === 'purchase' ? 'Bought' : 'Sold'} {tx.item_name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {tx.quantity}x @ ${tx.unit_price} · {tx.counterparty}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: tx.type === 'purchase' ? 'var(--danger)' : 'var(--success, #4ade80)',
                }}
              >
                {tx.type === 'purchase' ? '-' : '+'}${tx.total.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {new Date(tx.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

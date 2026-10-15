import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

interface Location {
  id: number;
  name: string;
  description: string;
  cost: number;
  level_required: number;
}

export const TravelPage: React.FC = () => {
  const api = useApi();
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>('New York');
  const [loading, setLoading] = useState(true);
  const [travelMsg, setTravelMsg] = useState<string | null>(null);

  useEffect(() => {
    api('/api/travel/locations')
      .then((res) => res.json())
      .then((data) => {
        setLocations(data.locations ?? []);
        setCurrentLocation(data.current ?? 'New York');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleTravel = async (loc: Location) => {
    setTravelMsg(null);
    try {
      const res = await api('/api/travel/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: loc.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentLocation(loc.name);
        setTravelMsg(`Arrived in ${loc.name}`);
      } else {
        setTravelMsg(data.error || 'Travel failed');
      }
    } catch {
      setTravelMsg('Network error');
    }
  };

  if (loading) {
    return <div className="page-center"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <h2 className="page-title">Travel</h2>
      <p className="page-subtitle">
        Current location: <strong>{currentLocation}</strong>
      </p>

      {travelMsg && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: travelMsg.startsWith('Arrived')
              ? 'var(--success-bg, #1a3a2a)'
              : 'var(--danger-bg, #3a1a1a)',
            color: travelMsg.startsWith('Arrived') ? '#4ade80' : '#f87171',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {travelMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {locations.map((loc) => {
          const isHere = currentLocation === loc.name;
          return (
            <div
              key={loc.id}
              className="card"
              style={{
                padding: '14px 16px',
                opacity: isHere ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{loc.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {loc.description}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Level required: {loc.level_required}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
                    ${loc.cost.toLocaleString()}
                  </div>
                </div>
              </div>
              {!isHere && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 10, width: '100%' }}
                  onClick={() => handleTravel(loc)}
                >
                  Travel
                </button>
              )}
              {isHere && (
                <div
                  style={{
                    marginTop: 10,
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  Already here
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

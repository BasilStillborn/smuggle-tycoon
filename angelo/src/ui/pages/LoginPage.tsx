import React, { useState } from 'react';

interface Props {
  onLogin: (token: string) => void;
}

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onLogin(data.token);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 8 }}>◆</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
        Angelo
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
        Underground empire simulator
      </p>

      <div
        style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 20,
          width: '100%',
          maxWidth: 320,
        }}
      >
        <button
          onClick={() => setTab('login')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            background: tab === 'login' ? 'var(--bg-panel)' : 'transparent',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            color: tab === 'login' ? 'var(--text)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          Login
        </button>
        <button
          onClick={() => setTab('register')}
          style={{
            flex: 1,
            padding: '8px 0',
            border: 'none',
            background: tab === 'register' ? 'var(--bg-panel)' : 'transparent',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            color: tab === 'register' ? 'var(--text)' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          Register
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input"
          required
          minLength={3}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
          minLength={4}
        />
        {error && (
          <div style={{ fontSize: 13, color: '#f87171', textAlign: 'center' }}>{error}</div>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? '...' : tab === 'login' ? 'Login' : 'Register'}
        </button>
      </form>
    </div>
  );
};

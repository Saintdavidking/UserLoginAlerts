import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export default function Home() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${API_URL}/api/auth/local`, {
        identifier,
        password,
      });
      setMessage(`Logged in as ${res.data?.user?.email || 'unknown'}. Check your email/SMS alerts.`);
    } catch (err: any) {
      setMessage(err?.response?.data?.error?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} style={{ border: '1px solid #ddd', padding: 24, borderRadius: 8, width: 360 }}>
        <h2>Login (Strapi)</h2>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Identifier (email or username)
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: 8 }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </label>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, marginTop: 12 }}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
        <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
          Successfull! <code></code> Check your Email and SMS for login information.
        </p>
      </form>
    </div>
  );
}

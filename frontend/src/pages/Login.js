import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SpendlyLogo = () => (
  <img src="/spendly_logo.png" alt="Spendly" width="48" height="48" style={{ borderRadius: 12, objectFit: 'cover' }} />
);

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob" />
      <div className="auth-bg-blob" style={{ bottom: -100, right: -100, top: 'auto', left: 'auto' }} />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><SpendlyLogo /></div>
          <div className="auth-title">Welcome back</div>
          <div className="auth-subtitle">Sign in to your Spendly account</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input className="input" type="password" placeholder="Your password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 12 }}>
          <span className="auth-link" style={{ fontSize: 12 }}
           onClick={() => navigate('/forgot-password')}>
          Forgot Password?
          </span>
          </div>



          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <a href="https://spendly-production-1721.up.railway.app/api/google/login"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', padding: '12px',
            background: 'white', color: '#333',
            borderRadius: 10, border: '1px solid #ddd',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            textDecoration: 'none', marginBottom: 16,
            fontFamily: 'Sora, sans-serif'
          }}>
          <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" />
          Continue with Google
        </a>

        <div className="auth-footer">
          Don't have an account? <span className="auth-link" onClick={() => navigate('/register')}>Create one</span>
        </div>
      </div>
    </div>
  );
}

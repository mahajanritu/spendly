import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Spendly 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <div className="auth-logo-icon" style={{ background: 'none', boxShadow: 'none', padding: 0 }}>
            <img src="/logo.jpg" alt="Spendly" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
          </div>
          <div className="auth-title">Create account</div>
          <div className="auth-subtitle">Start tracking your finances with Spendly</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input className="input" placeholder="John Doe" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input className="input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="Min 6 chars" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm</label>
              <input className="input" type="password" placeholder="Repeat it" value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <a href="https://spendly-ib4j.onrender.com/api/google/login"
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
          Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

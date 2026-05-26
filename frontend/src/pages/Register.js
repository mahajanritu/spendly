import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SpendlyLogo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.2)"/>
    <path d="M12 6v2M12 16v2M8 12h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill="white"/>
  </svg>
);

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
          <div className="auth-logo-icon"><SpendlyLogo /></div>
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

        <div className="auth-footer">
          Already have an account? <span className="auth-link" onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';



export default function ResetPassword() {
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirm) return toast.error('Please fill all fields');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob" />
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/spendly_logo.png" alt="Spendly" style={{ width: 90, height: 90, borderRadius: 22, objectFit: 'contain', marginBottom: 16 }} />
          <div className="auth-title">Reset Password</div>
          <div className="auth-subtitle">Enter your new password</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">New Password</label>
            <input className="input" type="password" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input className="input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}
            disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 16 }}>
          <span className="auth-link" onClick={() => navigate('/login')}>Back to Login</span>
        </div>
      </div>
    </div>
  );
}
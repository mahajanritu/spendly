import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blob" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'none', boxShadow: 'none', padding: 0 }}>
            <img src="/logo.jpg" alt="Spendly" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
          </div>
          <div className="auth-title">Forgot Password</div>
          <div className="auth-subtitle">
            {sent ? 'Check your email for reset link' : 'Enter your email to reset password'}
          </div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              We sent a password reset link to <strong>{email}</strong>. Check your inbox and click the link to reset your password.
            </p>
            <p style={{ color: 'var(--text3)', fontSize: 12, marginBottom: 24 }}>Link expires in 15 minutes</p>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: 8 }}
              disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: 16 }}>
          Remember password? <span className="auth-link" onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </div>
    </div>
  );
}

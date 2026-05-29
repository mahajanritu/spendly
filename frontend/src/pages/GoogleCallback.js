import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');

    if (token && userStr) {
      const user = JSON.parse(decodeURIComponent(userStr));
      localStorage.setItem('spendly_token', token);
      localStorage.setItem('spendly_user', JSON.stringify(user));
      updateUser(user);
      navigate('/dashboard');
    } else {
      navigate('/login?error=google_failed');
    }
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16
    }}>
      <div style={{ fontSize: 36 }}>⚡</div>
      <div style={{ color: 'var(--text2)', fontSize: 16 }}>Signing you in with Google...</div>
    </div>
  );
}
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text3)', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 36 }}>⚡</div>
      <span>Loading Spendly...</span>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

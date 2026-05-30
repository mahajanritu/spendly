import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PieChart, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SpendlyLogo = () => (
  <img src="/spendly_logo.jpg" alt="Spendly" width="72" height="72" style={{ borderRadius: 16, objectFit: 'contain' }} />
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { to: '/analytics', icon: PieChart, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const navContent = (
    <>
      <div className="logo-wrap">
        <div className="auth-logo-icon" style={{ background: 'none', boxShadow: 'none', width: 72, height: 72 }}>
  <SpendlyLogo />
</div>
        <span className="logo-text">Spendly</span>
      </div>
      <nav className="nav-section">
        <div className="nav-label">Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #5b4fcf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button className="nav-item btn" style={{ width: '100%', background: 'none', border: 'none', color: 'var(--red2)' }} onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="logo-icon" style={{ width: 34, height: 34, borderRadius: 10 }}>
            <SpendlyLogo />
          </div>
          <span className="logo-text" style={{ fontSize: 20 }}>Spendly</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 6 }}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {navContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 150, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside style={{
        position: 'fixed', top: 0,
        left: mobileOpen ? 0 : '-280px',
        width: 260, height: '100vh',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 0',
        transition: 'left 0.3s ease',
        zIndex: 200,
      }}>
        {navContent}
      </aside>
    </>
  );
}
import React from 'react';
import { useState } from "react";

import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PieChart, Settings, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SpendlyLogo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.2)"/>
    <path d="M12 6v2M12 16v2M8 12h8M9.5 9.5l1 1M13.5 13.5l1 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="3" fill="white"/>
  </svg>
);

export default function Sidebar() {
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

 return (
  
  <>
    <button
      className="menu-btn"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      ☰
    </button>

    {
    sidebarOpen && (<div
    className="overlay"
    onClick={() => setSidebarOpen(false)}/>)
  }

    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="logo-wrap">
        <div className="logo-icon"><SpendlyLogo /></div>
        <span className="logo-text">Spendly</span>
      </div>

      <nav className="nav-section">
        <div className="nav-label">Menu</div>

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item${isActive ? ' active' : ''}`
            }
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
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          className="nav-item btn"
          style={{ width: '100%', background: 'none', border: 'none', color: 'var(--red2)' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  </>
);}
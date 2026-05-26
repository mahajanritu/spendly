import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Wallet } from 'lucide-react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', currency: user?.currency || 'INR', monthlyBudget: user?.monthlyBudget || '' });
  const [password, setPassword] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({ name: profile.name, currency: profile.currency, monthlyBudget: parseFloat(profile.monthlyBudget) || 0 });
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (password.newPass !== password.confirm) return toast.error('Passwords do not match');
    if (password.newPass.length < 6) return toast.error('Password must be at least 6 characters');
    setSaving(true);
    try {
      await authAPI.updateProfile({ password: password.newPass });
      setPassword({ current: '', newPass: '', confirm: '' });
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Manage your account preferences</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
        {/* Profile */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(124,107,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Profile</h3>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Your personal information</p>
            </div>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <div className="grid-2">
              <div className="input-group">
                <label className="input-label">Currency</label>
                <select className="input" value={profile.currency} onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}>
                  <option value="INR">₹ INR - Indian Rupee</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                  <option value="JPY">¥ JPY - Japanese Yen</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Monthly Budget (₹)</label>
                <input className="input" type="number" min="0" placeholder="e.g. 50000" value={profile.monthlyBudget} onChange={e => setProfile(p => ({ ...p, monthlyBudget: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(239,68,68,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} color="var(--red2)" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Security</h3>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>Change your password</p>
            </div>
          </div>
          <form onSubmit={handlePasswordSave}>
            <div className="input-group">
              <label className="input-label">New Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={password.newPass} onChange={e => setPassword(p => ({ ...p, newPass: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm New Password</label>
              <input className="input" type="password" placeholder="Repeat password" value={password.confirm} onChange={e => setPassword(p => ({ ...p, confirm: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-ghost" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>

        {/* Account Info */}
        <div className="card" style={{ border: '1px solid rgba(124,107,255,0.2)', background: 'rgba(124,107,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Wallet size={18} color="var(--accent2)" />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>About Spendly</h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
            Spendly helps you track your income and expenses, visualize spending patterns, and stay within your monthly budget goals. Your data is stored securely in MongoDB.
          </p>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>Version 1.0.0 · Built with React + Node.js + MongoDB</div>
        </div>
      </div>
    </div>
  );
}

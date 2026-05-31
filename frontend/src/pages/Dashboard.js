import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { expenseAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import TransactionModal, { CATEGORY_EMOJI } from '../components/TransactionModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { generatePDF } from '../utils/generatePDF';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
            {p.dataKey === 'income' ? '↑' : '↓'} {fmt(p.value)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const load = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        expenseAPI.getStats(),
        expenseAPI.getAll({ limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecent(txRes.data.expenses);

      // Build chart from trend
      const trend = statsRes.data.trend || [];
      const monthMap = {};
      trend.forEach(t => {
        const key = `${MONTHS[t._id.month - 1]} ${t._id.year}`;
        if (!monthMap[key]) monthMap[key] = { month: key, income: 0, expense: 0 };
        monthMap[key][t._id.type] = t.total;
      });
      setChartData(Object.values(monthMap).slice(-6));
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const budgetUsed = stats ? (stats.totalExpense / (user?.monthlyBudget || 1)) * 100 : 0;
  const budgetColor = budgetUsed > 90 ? 'var(--red)' : budgetUsed > 70 ? 'var(--amber)' : 'var(--green)';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
        Loading your data...
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={() => generatePDF(user, stats, recent)}>📄 Download PDF</button>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
    <Plus size={16} /> Add Transaction
  </button>
</div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card income">
          <div className="stat-label">💰 Monthly Income</div>
          <div className="stat-value green">{fmt(stats?.totalIncome)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>This month</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">💸 Monthly Expenses</div>
          <div className="stat-value red">{fmt(stats?.totalExpense)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>This month</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">🏦 Balance</div>
          <div className="stat-value purple">{fmt(stats?.balance)}</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Net savings</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Cash Flow</h3>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>Last 6 months</span>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#income)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon">📊</div>
              <div className="empty-title">No data yet</div>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Monthly Budget</h3>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>
              {user?.monthlyBudget ? `Set at ${fmt(user.monthlyBudget)}` : 'No budget set yet'}
            </p>
          </div>

          {user?.monthlyBudget ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'var(--text2)' }}>Spent</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: budgetColor }}>{budgetUsed.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(budgetUsed, 100)}%`, background: budgetColor }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                <span>{fmt(stats?.totalExpense)} spent</span>
                <span>{fmt(user.monthlyBudget - (stats?.totalExpense || 0))} left</span>
              </div>
              {budgetUsed > 90 && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--red2)' }}>
                  ⚠️ You've used {budgetUsed.toFixed(0)}% of your budget!
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💡</div>
              <div className="empty-title">Set a monthly budget</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('/settings')}>
                Go to Settings
              </button>
            </div>
          )}

          {/* Top categories */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>Top Categories</div>
            {(stats?.categoryStats || [])
              .filter(c => c._id.type === 'expense')
              .sort((a, b) => b.total - a.total)
              .slice(0, 3)
              .map(c => (
                <div key={c._id.category} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_EMOJI[c._id.category]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text2)' }}>{c._id.category}</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{fmt(c.total)}</span>
                    </div>
                    <div className="progress-bar" style={{ height: 4 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((c.total / (stats?.totalExpense || 1)) * 100, 100)}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Transactions</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/transactions')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <div className="empty-title">No transactions yet</div>
            <p style={{ fontSize: 13 }}>Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="tx-list">
            {recent.map(tx => (
              <div key={tx._id} className="tx-item">
                <div className={`tx-icon ${tx.type}`}>{CATEGORY_EMOJI[tx.category]}</div>
                <div className="tx-info">
                  <div className="tx-title">{tx.title}</div>
                  <div className="tx-meta">{tx.category} · {format(new Date(tx.date), 'MMM d, yyyy')}</div>
                </div>
                <div className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TransactionModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}

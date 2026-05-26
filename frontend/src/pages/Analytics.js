import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { expenseAPI } from '../utils/api';
import { CATEGORY_EMOJI } from '../components/TransactionModal';
import toast from 'react-hot-toast';

const COLORS = ['#7c6bff','#a78bfa','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#06b6d4','#84cc16'];
const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await expenseAPI.getStats({ month: selectedMonth, year: selectedYear });
      setStats(data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedMonth, selectedYear]);

  const expenseByCategory = (stats?.categoryStats || [])
    .filter(c => c._id.type === 'expense')
    .map(c => ({ name: c._id.category, value: c.total, emoji: CATEGORY_EMOJI[c._id.category] }))
    .sort((a, b) => b.value - a.value);

  const incomeByCategory = (stats?.categoryStats || [])
    .filter(c => c._id.type === 'income')
    .map(c => ({ name: c._id.category, value: c.total, emoji: CATEGORY_EMOJI[c._id.category] }));

  const trendData = (() => {
    const map = {};
    (stats?.trend || []).forEach(t => {
      const key = `${MONTHS[t._id.month - 1]} ${t._id.year}`;
      if (!map[key]) map[key] = { month: key, income: 0, expense: 0 };
      map[key][t._id.type] = t.total;
    });
    return Object.values(map).slice(-6);
  })();

  const CustomLabel = ({ cx, cy, midAngle, outerRadius, value, name, index }) => {
    const RADIAN = Math.PI / 180;
    const r = outerRadius + 20;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return null;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{d.emoji} {d.name}</div>
          <div style={{ fontSize: 13, color: 'var(--accent3)', marginTop: 4 }}>{fmt(d.value)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visual breakdown of your finances</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="input" style={{ width: 'auto' }} value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select className="input" style={{ width: 'auto' }} value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2022, 2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card income">
          <div className="stat-label">💰 Total Income</div>
          <div className="stat-value green">{fmt(stats?.totalIncome)}</div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">💸 Total Expenses</div>
          <div className="stat-value red">{fmt(stats?.totalExpense)}</div>
        </div>
        <div className="stat-card balance">
          <div className="stat-label">🏦 Net Savings</div>
          <div className={`stat-value ${(stats?.balance || 0) >= 0 ? 'green' : 'red'}`}>{fmt(stats?.balance)}</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Expense Pie */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Expenses by Category</h3>
          {expenseByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                    {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {expenseByCategory.slice(0, 5).map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text2)' }}>{c.emoji} {c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(c.value)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text3)', width: 40, textAlign: 'right' }}>
                      {((c.value / (stats?.totalExpense || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No expense data</div></div>
          )}
        </div>

        {/* Income Pie */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Income by Source</h3>
          {incomeByCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incomeByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                    {incomeByCategory.map((_, i) => <Cell key={i} fill={['#22c55e', '#4ade80', '#86efac', '#14b8a6'][i % 4]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {incomeByCategory.map((c, i) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: ['#22c55e','#4ade80','#86efac','#14b8a6'][i % 4], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text2)' }}>{c.emoji} {c.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><div className="empty-icon">💰</div><div className="empty-title">No income data</div></div>
          )}
        </div>
      </div>

      {/* Trend Bar Chart */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>6-Month Income vs Expense Trend</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '₹' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text2)' }} />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[6,6,0,0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state"><div className="empty-icon">📈</div><div className="empty-title">Not enough data for trend</div></div>
        )}
      </div>
    </div>
  );
}

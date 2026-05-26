import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { expenseAPI } from '../utils/api';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health & Medical', 'Education', 'Travel', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

const CATEGORY_EMOJI = {
  'Food & Dining': '🍔', 'Transportation': '🚗', 'Shopping': '🛍️', 'Entertainment': '🎬',
  'Bills & Utilities': '⚡', 'Health & Medical': '💊', 'Education': '📚', 'Travel': '✈️',
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈', 'Gift': '🎁', 'Other': '📦'
};

export { CATEGORY_EMOJI };

export default function TransactionModal({ onClose, onSaved, editData }) {
  const [type, setType] = useState(editData?.type || 'expense');
  const [form, setForm] = useState({
    title: editData?.title || '',
    amount: editData?.amount || '',
    category: editData?.category || '',
    note: editData?.note || '',
    date: editData?.date ? new Date(editData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (!categories.includes(form.category)) setForm(f => ({ ...f, category: '' }));
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) return toast.error('Please fill all required fields');
    if (parseFloat(form.amount) <= 0) return toast.error('Amount must be positive');
    setLoading(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), type };
      if (editData) {
        await expenseAPI.update(editData._id, payload);
        toast.success('Transaction updated!');
      } else {
        await expenseAPI.create(payload);
        toast.success('Transaction added!');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{editData ? 'Edit' : 'Add'} Transaction</h3>
          <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="type-toggle">
          <button className={`type-btn ${type === 'expense' ? 'active expense' : ''}`} onClick={() => setType('expense')}>
            💸 Expense
          </button>
          <button className={`type-btn ${type === 'income' ? 'active income' : ''}`} onClick={() => setType('income')}>
            💰 Income
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Title *</label>
            <input className="input" placeholder="e.g. Coffee at Starbucks" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="input-group">
              <label className="input-label">Amount (₹) *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Date *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select a category</option>
              {categories.map(c => <option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Note (optional)</label>
            <input className="input" placeholder="Any additional notes..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : editData ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Filter } from 'lucide-react';
import { expenseAPI } from '../utils/api';
import TransactionModal, { CATEGORY_EMOJI } from '../components/TransactionModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const fmt = (n) => '₹' + (n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

const CATEGORIES = ['All', 'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities', 'Health & Medical', 'Education', 'Travel', 'Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 20, page };
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      const { data } = await expenseAPI.getAll(params);
      setTransactions(data.expenses);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter, categoryFilter, page]);

  const handleDelete = async (id) => {
    try {
      await expenseAPI.delete(id);
      toast.success('Transaction deleted');
      setDeleteConfirm(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = search
    ? transactions.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} transactions total</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData(null); setShowModal(true); }}>
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto', minWidth: 140 }} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <select className="input" style={{ width: 'auto', minWidth: 160 }} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(typeFilter || (categoryFilter && categoryFilter !== 'All') || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setTypeFilter(''); setCategoryFilter(''); setSearch(''); setPage(1); }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-icon">📂</div>
          <div className="empty-title">No transactions found</div>
          <p>Try adjusting your filters or add a new transaction</p>
        </div>
      ) : (
        <div className="card">
          <div className="tx-list">
            {filtered.map(tx => (
              <div key={tx._id} className="tx-item" style={{ position: 'relative' }}>
                <div className={`tx-icon ${tx.type}`}>{CATEGORY_EMOJI[tx.category]}</div>
                <div className="tx-info">
                  <div className="tx-title">{tx.title}</div>
                  <div className="tx-meta">
                    <span className={`badge badge-${tx.type}`}>{tx.type}</span>
                    <span style={{ margin: '0 6px' }}>·</span>
                    {tx.category}
                    <span style={{ margin: '0 6px' }}>·</span>
                    {format(new Date(tx.date), 'MMM d, yyyy')}
                    {tx.note && <span style={{ margin: '0 6px' }}>· {tx.note}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={`tx-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}
                      onClick={() => { setEditData(tx); setShowModal(true); }}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ padding: '6px 8px' }}
                      onClick={() => setDeleteConfirm(tx._id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text2)' }}>Page {page} of {totalPages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Delete Transaction</h3>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 24 }}>Are you sure? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <TransactionModal
          editData={editData}
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSaved={() => { setShowModal(false); setEditData(null); load(); }}
        />
      )}
    </div>
  );
}

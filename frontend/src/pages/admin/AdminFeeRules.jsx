import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetFeeRules, adminCreateFeeRule, adminUpdateFeeRule, adminDeleteFeeRule, adminToggleFeeRule } from '../../api/admin.api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', type: 'tiered', feeAmount: 0, percentage: 0, priority: 1,
  tiers: [{ minAmount: 0, maxAmount: 20, fee: 1 }, { minAmount: 21, maxAmount: 50, fee: 3 }, { minAmount: 51, maxAmount: null, fee: 5 }] };

export default function AdminFeeRules() {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const loadRules = () =>
    adminGetFeeRules()
      .then((r) => setRules(r.data.data.rules))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load fee rules.'));

  useEffect(() => { loadRules(); }, []);

  const handleTierChange = (i, field, value) => {
    const tiers = [...form.tiers];
    tiers[i] = { ...tiers[i], [field]: value === '' ? null : Number(value) };
    setForm({ ...form, tiers });
  };

  const addTier = () => setForm({ ...form, tiers: [...form.tiers, { minAmount: 0, maxAmount: null, fee: 0 }] });
  const removeTier = (i) => setForm({ ...form, tiers: form.tiers.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await adminUpdateFeeRule(editId, form); toast.success('Rule updated.'); }
      else { await adminCreateFeeRule(form); toast.success('Rule created.'); }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM); loadRules();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (r) => {
    setEditId(r._id);
    setForm({ name: r.name, type: r.type, feeAmount: r.feeAmount, percentage: r.percentage, priority: r.priority, tiers: r.tiers || [] });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    await adminDeleteFeeRule(id); toast.success('Rule deleted.'); loadRules();
  };

  const handleToggle = async (id) => {
    await adminToggleFeeRule(id); loadRules();
  };

  return (
    <AdminLayout title="Platform Fee Rules">
      <button className="btn btn-primary btn-sm" style={{ marginBottom: 16 }}
        onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
        + Add Fee Rule
      </button>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? 'Edit Rule' : 'New Fee Rule'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Rule Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="tiered">Tiered</option>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority (lower = applied first)</label>
                <input className="form-input" type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
              </div>
            </div>

            {form.type === 'fixed' && (
              <div className="form-group">
                <label className="form-label">Fixed Fee Amount (₹)</label>
                <input className="form-input" type="number" value={form.feeAmount} onChange={(e) => setForm({ ...form, feeAmount: Number(e.target.value) })} />
              </div>
            )}

            {form.type === 'percentage' && (
              <div className="form-group">
                <label className="form-label">Percentage (%)</label>
                <input className="form-input" type="number" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })} />
              </div>
            )}

            {form.type === 'tiered' && (
              <div className="form-group">
                <label className="form-label">Tiers</label>
                {form.tiers.map((tier, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <input className="form-input" type="number" placeholder="Min ₹" value={tier.minAmount}
                      onChange={(e) => handleTierChange(i, 'minAmount', e.target.value)} style={{ width: 100 }} />
                    <span>–</span>
                    <input className="form-input" type="number" placeholder="Max ₹ (blank=∞)" value={tier.maxAmount ?? ''}
                      onChange={(e) => handleTierChange(i, 'maxAmount', e.target.value)} style={{ width: 120 }} />
                    <span>→ Fee:</span>
                    <input className="form-input" type="number" placeholder="₹" value={tier.fee}
                      onChange={(e) => handleTierChange(i, 'fee', e.target.value)} style={{ width: 80 }} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeTier(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={addTier}>+ Add Tier</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>Name</th><th>Type</th><th>Details</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r._id}>
              <td><strong>{r.name}</strong></td>
              <td><span className="badge badge-blue">{r.type}</span></td>
              <td style={{ fontSize: '0.82rem' }}>
                {r.type === 'fixed' && `₹${r.feeAmount} flat`}
                {r.type === 'percentage' && `${r.percentage}%`}
                {r.type === 'tiered' && `${r.tiers?.length} tiers`}
              </td>
              <td>{r.priority}</td>
              <td><span className={`badge badge-${r.isActive ? 'green' : 'gray'}`}>{r.isActive ? 'Active' : 'Disabled'}</span></td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(r)}>Edit</button>
                  <button className={`btn btn-sm ${r.isActive ? 'btn-danger' : 'btn-outline'}`} onClick={() => handleToggle(r._id)}>
                    {r.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {rules.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No fee rules configured.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}

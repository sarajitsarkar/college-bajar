import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../api/admin.api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', icon: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const loadCategories = () =>
    adminGetCategories()
      .then((r) => setCategories(r.data.data.categories))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load categories.'));

  useEffect(() => { loadCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) { await adminUpdateCategory(editId, form); toast.success('Category updated.'); }
      else { await adminCreateCategory(form); toast.success('Category created.'); }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM); loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (c) => {
    setEditId(c._id); setForm({ name: c.name, icon: c.icon || '' }); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await adminDeleteCategory(id); toast.success('Category deleted.'); loadCategories(); }
    catch { toast.error('Failed.'); }
  };

  return (
    <AdminLayout title="Category Management">
      <button className="btn btn-primary btn-sm" style={{ marginBottom: 16 }}
        onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
        + Add Category
      </button>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 20, maxWidth: 440 }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input className="form-input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Icon (emoji or name)</label>
              <input className="form-input" value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 📚" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <table className="admin-table" style={{ maxWidth: 600 }}>
        <thead>
          <tr><th>Icon</th><th>Name</th><th>Slug</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c._id}>
              <td style={{ fontSize: '1.4rem' }}>{c.icon || '—'}</td>
              <td><strong>{c.name}</strong></td>
              <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.slug}</span></td>
              <td><span className={`badge badge-${c.isActive ? 'green' : 'gray'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {categories.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No categories.</td></tr>}
        </tbody>
      </table>
    </AdminLayout>
  );
}

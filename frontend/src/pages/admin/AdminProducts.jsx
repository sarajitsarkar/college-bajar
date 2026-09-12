import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetProducts, adminApproveProduct, adminDeleteProduct } from '../../api/admin.api';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    adminGetProducts({ limit: 50 })
      .then((r) => setProducts(r.data.data.products))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const handleApprove = async (id, isApproved) => {
    try {
      await adminApproveProduct(id, { isApproved: !isApproved });
      toast.success(isApproved ? 'Product rejected.' : 'Product approved.');
      loadProducts();
    } catch { toast.error('Failed.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product?')) return;
    try { await adminDeleteProduct(id); toast.success('Product removed.'); loadProducts(); }
    catch { toast.error('Failed.'); }
  };

  return (
    <AdminLayout title="Product Management">
      {loading ? <div className="loader-overlay"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr><th>Product</th><th>Owner</th><th>Category</th><th>Price/day</th><th>Condition</th><th>Approved</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {p.images?.[0] && <img src={p.images[0]} alt={p.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                    <div>
                      <strong>{p.title}</strong>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p._id}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{p.ownerId?.name}</strong>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p.ownerId?.phone}</p>
                </td>
                <td>{p.categoryId?.name}</td>
                <td><strong>{formatCurrency(p.pricePerDay)}</strong></td>
                <td><span className="badge badge-blue">{p.condition}</span></td>
                <td><span className={`badge badge-${p.isApproved ? 'green' : 'red'}`}>{p.isApproved ? 'Approved' : 'Pending'}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className={`btn btn-sm ${p.isApproved ? 'btn-danger' : 'btn-outline'}`}
                      onClick={() => handleApprove(p._id, p.isApproved)}>
                      {p.isApproved ? 'Reject' : 'Approve'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Remove</button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No products.</td></tr>}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetOrders, adminUpdateOrderStatus } from '../../api/admin.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ALL_STATUSES = ['order_placed','payment_pending','confirmed','preparing','out_for_delivery','delivered','rental_active','return_pending','returned','completed','cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = () => {
    setLoading(true);
    adminGetOrders({ status: statusFilter || undefined, limit: 50 })
      .then((r) => setOrders(r.data.data.orders))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await adminUpdateOrderStatus(id, { status });
      toast.success('Order status updated.');
      loadOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  return (
    <AdminLayout title="Order Management">
      <div style={{ marginBottom: 16 }}>
        <select className="form-select" style={{ maxWidth: 220 }} value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      {loading ? <div className="loader-overlay"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Product</th><th>Renter</th><th>Owner</th><th>Dates</th><th>Total</th><th>Status</th><th>Update Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{o.orderId}</span></td>
                <td>{o.productId?.title}</td>
                <td>
                  <strong>{o.renterId?.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.renterId?.phone}</p>
                </td>
                <td>
                  <strong>{o.ownerId?.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{o.ownerId?.phone}</p>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{formatDate(o.rentalStartDate)} → {formatDate(o.rentalEndDate)}</td>
                <td><strong>{formatCurrency(o.totalAmount)}</strong></td>
                <td><OrderStatusBadge status={o.status} /></td>
                <td>
                  <select className="form-select" style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                    value={o.status} onChange={(e) => handleStatusUpdate(o._id, e.target.value)}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders.</td></tr>}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

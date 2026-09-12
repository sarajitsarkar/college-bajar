import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetPayments } from '../../api/admin.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetPayments({ limit: 50 })
      .then((r) => setPayments(r.data.data.payments))
      .catch((err) => console.error('Failed to load payments:', err))
      .finally(() => setLoading(false));
  }, []);

  const STATUS_COLORS = { pending: 'yellow', captured: 'green', failed: 'red', refunded: 'orange' };

  return (
    <AdminLayout title="Payment Management">
      {loading ? <div className="loader-overlay"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr><th>Order ID</th><th>Renter</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{p.orderId?.orderId}</span></td>
                <td>
                  <strong>{p.renterId?.name}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.renterId?.phone}</p>
                </td>
                <td><strong>{formatCurrency(p.amount)}</strong></td>
                <td><span className="badge badge-blue">{p.method.toUpperCase()}</span></td>
                <td><span className={`badge badge-${STATUS_COLORS[p.status] || 'gray'}`}>{p.status}</span></td>
                <td style={{ fontSize: '0.82rem' }}>{formatDate(p.createdAt)}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No payments.</td></tr>}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

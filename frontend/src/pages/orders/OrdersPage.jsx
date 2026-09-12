import { useState, useEffect } from 'react';
import { getMyOrders } from '../../api/orders.api';
import OrderCard from '../../components/order/OrderCard';

const ORDER_STATUSES = [
  '', 'order_placed', 'payment_pending', 'confirmed', 'preparing',
  'out_for_delivery', 'delivered', 'rental_active', 'return_pending',
  'returned', 'completed', 'cancelled',
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getMyOrders({ status: statusFilter || undefined, limit: 20 })
      .then((res) => setOrders(res.data.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700 }}>My Orders</h2>
          <select className="form-select" style={{ width: 'auto', minWidth: 180 }}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {ORDER_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loader-overlay"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Your rental orders will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((o) => <OrderCard key={o._id} order={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}

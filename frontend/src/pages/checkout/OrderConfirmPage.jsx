import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../../api/orders.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';

export default function OrderConfirmPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrderById(id).then((res) => setOrder(res.data.data.order)).catch(() => {});
  }, [id]);

  if (!order) return <div className="loader-overlay"><div className="spinner" /></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card" style={{ padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 20 }}>
            Your order <strong>{order.orderId}</strong> has been placed.
          </p>
          <OrderStatusBadge status={order.status} />

          <div style={{ margin: '20px 0', textAlign: 'left', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Rental Amount</span><strong>{formatCurrency(order.rentalAmount)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Platform Fee</span><strong>{formatCurrency(order.platformFee)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: 8 }}>
              <strong>Total Paid</strong><strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(order.totalAmount)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to={`/orders/${order._id}`} className="btn btn-primary">View Order</Link>
            <Link to="/" className="btn btn-secondary">Continue Browsing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

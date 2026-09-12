import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../api/orders.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    getOrderById(id)
      .then((res) => setOrder(res.data.data.order))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await cancelOrder(id, { reason: 'Cancelled by renter' });
      toast.success('Order cancelled.');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order.');
    }
  };

  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;
  if (!order) return null;

  const cancellable = ['order_placed', 'payment_pending', 'confirmed'].includes(order.status);
  const addr = order.deliveryAddress;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="card" style={{ padding: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <p style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{order.orderId}</p>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{order.productId?.title}</h2>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Product Image */}
          {order.productId?.images?.[0] && (
            <img src={order.productId.images[0]} alt={order.productId.title}
              style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 20 }} />
          )}

          {/* Rental Dates */}
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
            <h4 style={{ marginBottom: 12 }}>Rental Details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Start Date', formatDate(order.rentalStartDate)],
                ['End Date', formatDate(order.rentalEndDate)],
                ['Rental Days', order.rentalDays],
                ['Payment Method', order.paymentMethod.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ fontWeight: 600 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
            <h4 style={{ marginBottom: 12 }}>Payment Summary</h4>
            {[
              ['Rental Amount', formatCurrency(order.rentalAmount)],
              ['Platform Fee', formatCurrency(order.platformFee)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '0.9rem' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', marginTop: 8, paddingTop: 10, fontWeight: 700 }}>
              <span>Total</span><span style={{ color: 'var(--color-primary)' }}>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          {addr && (
            <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 8 }}>Delivery Address</h4>
              <p><strong>{addr.fullName}</strong> · {addr.phone}</p>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                {addr.hostelBlock && `${addr.hostelBlock}, `}{addr.addressLine}, {addr.city} - {addr.pinCode}
              </p>
            </div>
          )}

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 12 }}>Order Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.statusHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)' }}>
                    <OrderStatusBadge status={h.status} />
                    <span style={{ color: 'var(--color-text-muted)' }}>{formatDate(h.changedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cancellable && (
            <button className="btn btn-danger" onClick={handleCancel}>Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  );
}

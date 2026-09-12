import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusBadge from './OrderStatusBadge';
import './OrderCard.css';

export default function OrderCard({ order }) {
  const product = order.productId;
  const image = product?.images?.[0] || '';

  return (
    <Link to={`/orders/${order._id}`} className="order-card card">
      <div className="order-card-img">
        {image
          ? <img src={image} alt={product?.title} />
          : <div className="order-card-placeholder">📦</div>
        }
      </div>
      <div className="order-card-body">
        <div className="order-card-top">
          <span className="order-card-id">{order.orderId}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="order-card-title">{product?.title || 'Product'}</p>
        <div className="order-card-meta">
          <span>📅 {formatDate(order.rentalStartDate)} → {formatDate(order.rentalEndDate)}</span>
          <span>💰 {formatCurrency(order.totalAmount)}</span>
        </div>
        <p className="order-card-date">Ordered: {formatDate(order.createdAt)}</p>
      </div>
    </Link>
  );
}

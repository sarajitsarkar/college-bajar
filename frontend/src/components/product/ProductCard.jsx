import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import './ProductCard.css';

const CONDITION_LABELS = { new: 'New', 'like-new': 'Like New', good: 'Good', fair: 'Fair' };
const CONDITION_COLORS = { new: 'green', 'like-new': 'blue', good: 'yellow', fair: 'orange' };

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const available = product.isAvailable && product.availableQuantity > 0;

  return (
    <Link to={`/product/${product._id}`} className="product-card card">
      <div className="product-card-img">
        {image
          ? <img src={image} alt={product.title} loading="lazy" />
          : <div className="product-card-no-img">📷</div>
        }
        {!available && <div className="product-card-unavailable">Unavailable</div>}
      </div>
      <div className="product-card-body">
        <p className="product-card-category">{product.categoryId?.name || 'General'}</p>
        <h3 className="product-card-title">{product.title}</h3>
        <div className="product-card-footer">
          <div className="product-card-price">
            <strong>{formatCurrency(product.pricePerDay)}</strong>
            <span>/day</span>
          </div>
          <span className={`badge badge-${CONDITION_COLORS[product.condition] || 'gray'}`}>
            {CONDITION_LABELS[product.condition] || product.condition}
          </span>
        </div>
        <div className={`product-card-avail ${available ? 'avail-yes' : 'avail-no'}`}>
          {available ? '✔ Available' : '✖ Unavailable'}
        </div>
      </div>
    </Link>
  );
}

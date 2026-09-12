import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts, deleteProduct, toggleAvailability } from '../../api/products.api';
import { getIncomingOrders } from '../../api/orders.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import toast from 'react-hot-toast';
import './MyListingsPage.css';

export default function MyListingsPage() {
  const [products, setProducts] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');

  const fetchData = () => {
    Promise.all([getMyProducts(), getIncomingOrders()])
      .then(([pRes, oRes]) => {
        setProducts(pRes.data.data.products);
        setIncomingOrders(oRes.data.data.orders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAvailability(id);
      toast.success('Availability updated.');
      fetchData();
    } catch {
      toast.error('Failed to update availability.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700 }}>My Listings</h2>
          <Link to="/my-listings/add" className="btn btn-primary">+ List New Product</Link>
        </div>

        {/* Tabs */}
        <div className="listings-tabs">
          <button className={`listings-tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
            My Products ({products.length})
          </button>
          <button className={`listings-tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
            Incoming Orders ({incomingOrders.length})
          </button>
        </div>

        {loading ? (
          <div className="loader-overlay"><div className="spinner" /></div>
        ) : tab === 'products' ? (
          products.length === 0 ? (
            <div className="empty-state">
              <h3>No listings yet</h3>
              <p>Start earning by listing a product you own.</p>
              <Link to="/my-listings/add" className="btn btn-primary" style={{ marginTop: 16 }}>List a Product</Link>
            </div>
          ) : (
            <div className="listings-grid">
              {products.map((p) => (
                <div key={p._id} className="listing-item card">
                  <div className="listing-img">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.title} />
                      : <div className="listing-no-img">📷</div>
                    }
                  </div>
                  <div className="listing-body">
                    <h4>{p.title}</h4>
                    <p className="listing-price">{formatCurrency(p.pricePerDay)}/day</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span className={`badge badge-${p.isAvailable ? 'green' : 'red'}`}>
                        {p.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="badge badge-gray">{p.availableQuantity}/{p.totalQuantity || 1} units</span>
                    </div>
                    <div className="listing-actions">
                      <Link to={`/my-listings/edit/${p._id}`} className="btn btn-outline btn-sm">Edit</Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(p._id)}>
                        {p.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          incomingOrders.length === 0 ? (
            <div className="empty-state"><h3>No incoming orders</h3><p>Orders for your products will appear here.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {incomingOrders.map((o) => (
                <div key={o._id} className="card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{o.orderId}</p>
                    <p style={{ fontWeight: 600 }}>{o.productId?.title}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {new Date(o.rentalStartDate).toLocaleDateString()} → {new Date(o.rentalEndDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <OrderStatusBadge status={o.status} />
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatCurrency(o.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/users.api';
import { formatCurrency } from '../../utils/formatCurrency';
import OrderStatusBadge from '../../components/order/OrderStatusBadge';
import ProductCard from '../../components/product/ProductCard';
import './DashboardPage.css';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;

  return (
    <div className="dashboard page-wrapper">
      <div className="container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-actions">
            <Link to="/my-listings/add" className="btn btn-primary">+ List a Product</Link>
            <Link to="/orders" className="btn btn-outline">My Orders</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="stat-card card">
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value">{formatCurrency(data?.totalEarnings || 0)}</p>
          </div>
          <div className="stat-card card">
            <p className="stat-label">Active Rentals</p>
            <p className="stat-value">{data?.activeRentals?.length || 0}</p>
          </div>
          <div className="stat-card card">
            <p className="stat-label">My Listings</p>
            <p className="stat-value">{data?.myListings?.length || 0}</p>
          </div>
          <div className="stat-card card">
            <p className="stat-label">Recent Orders</p>
            <p className="stat-value">{data?.recentOrders?.length || 0}</p>
          </div>
        </div>

        {/* Active Rentals */}
        {data?.activeRentals?.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Active Rentals</h3>
              <Link to="/orders" className="btn-link">View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.activeRentals.map((o) => (
                <Link key={o._id} to={`/orders/${o._id}`} className="dashboard-order-item card">
                  {o.productId?.images?.[0] && (
                    <img src={o.productId.images[0]} alt={o.productId.title} />
                  )}
                  <div>
                    <p className="doi-title">{o.productId?.title}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <span className="doi-price">{formatCurrency(o.productId?.pricePerDay)}/day</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* My Listings */}
        {data?.myListings?.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h3>My Listings</h3>
              <Link to="/my-listings" className="btn-link">View all</Link>
            </div>
            <div className="dashboard-product-grid">
              {data.myListings.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* Recent Orders */}
        {data?.recentOrders?.length > 0 && (
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <Link to="/orders" className="btn-link">View all</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.recentOrders.map((o) => (
                <Link key={o._id} to={`/orders/${o._id}`} className="dashboard-order-item card">
                  {o.productId?.images?.[0] && (
                    <img src={o.productId.images[0]} alt={o.productId.title} />
                  )}
                  <div>
                    <p className="doi-title">{o.productId?.title}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <span className="doi-price">{formatCurrency(o.totalAmount)}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

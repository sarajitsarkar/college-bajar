import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetAnalytics } from '../../api/admin.api';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminGetAnalytics().then((r) => setStats(r.data.data)).catch(() => {});
  }, []);

  const tiles = stats ? [
    { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
    { label: 'Total Products', value: stats.totalProducts, color: 'green' },
    { label: 'Total Orders', value: stats.totalOrders, color: 'purple' },
    { label: 'Active Rentals', value: stats.activeRentals, color: 'orange' },
    { label: 'Completed Rentals', value: stats.completedRentals, color: 'green' },
    { label: 'Cancelled Orders', value: stats.cancelledOrders, color: 'red' },
    { label: 'Pending Orders', value: stats.pendingOrders, color: 'yellow' },
    { label: 'Platform Revenue', value: formatCurrency(stats.platformRevenue), color: 'blue' },
  ] : [];

  return (
    <AdminLayout title="Dashboard">
      {!stats ? (
        <div className="loader-overlay"><div className="spinner" /></div>
      ) : (
        <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {tiles.map((t) => (
            <div key={t.label} className="admin-stat-card card">
              <p className="admin-stat-label">{t.label}</p>
              <p className="admin-stat-value" style={{ fontSize: typeof t.value === 'string' ? '1.3rem' : '1.8rem' }}>
                {t.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

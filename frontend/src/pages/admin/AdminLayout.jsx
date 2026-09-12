import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', label: '📊 Dashboard', exact: true },
  { path: '/admin/users', label: '👥 Users' },
  { path: '/admin/products', label: '📦 Products' },
  { path: '/admin/orders', label: '🛒 Orders' },
  { path: '/admin/payments', label: '💳 Payments' },
  { path: '/admin/fee-rules', label: '⚙️ Fee Rules' },
  { path: '/admin/categories', label: '🏷️ Categories' },
];

export default function AdminLayout({ title, children }) {
  const { pathname } = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">Admin Panel</div>
        <nav className="admin-nav">
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.path : pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`admin-nav-link ${active ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{title}</h1>
          <Link to="/" className="btn btn-secondary btn-sm">← Back to Site</Link>
        </div>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetUsers, adminUpdateUserStatus } from '../../api/admin.api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = () => {
    setLoading(true);
    adminGetUsers({ search: search || undefined, limit: 50 })
      .then((r) => setUsers(r.data.data.users))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleStatus = async (id, isActive) => {
    try {
      await adminUpdateUserStatus(id, { isActive: !isActive });
      toast.success(`User ${isActive ? 'suspended' : 'activated'}.`);
      loadUsers();
    } catch { toast.error('Failed.'); }
  };

  return (
    <AdminLayout title="User Management">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input className="form-input" style={{ maxWidth: 300 }} placeholder="Search by name, email, phone..."
          value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadUsers()} />
        <button className="btn btn-primary btn-sm" onClick={loadUsers}>Search</button>
      </div>

      {loading ? <div className="loader-overlay"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>College</th><th>Role</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.collegeName || '—'}</td>
                <td><span className={`badge badge-${u.role === 'admin' ? 'purple' : 'blue'}`}>{u.role}</span></td>
                <td><span className={`badge badge-${u.isActive ? 'green' : 'red'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                <td>
                  <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-outline'}`}
                    onClick={() => handleStatus(u._id, u.isActive)}>
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No users found.</td></tr>}
          </tbody>
        </table>
      )}
    </AdminLayout>
  );
}

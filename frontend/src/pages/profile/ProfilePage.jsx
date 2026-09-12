import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api/users.api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', collegeName: '', collegeId: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      const u = res.data.data.user;
      setForm({ name: u.name || '', collegeName: u.collegeName || '', collegeId: u.collegeId || '' });
    }).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 560 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 24 }}>My Profile</h2>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={user?.email || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={user?.phone || ''} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">College Name</label>
              <input className="form-input" type="text" value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 16 }}>
          <Link to="/profile/addresses" className="btn btn-outline btn-block">
            Manage Delivery Addresses
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../api/users.api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { fullName: '', phone: '', collegeName: '', hostelBlock: '', roomNumber: '', addressLine: '', city: '', pinCode: '', isDefault: false };

export default function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = () =>
    getAddresses().then((r) => setAddresses(r.data.data.addresses)).catch(() => {});

  useEffect(() => { fetchAddresses(); }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateAddress(editId, form);
        toast.success('Address updated.');
      } else {
        await addAddress(form);
        toast.success('Address added.');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setEditId(addr._id);
    setForm({ fullName: addr.fullName, phone: addr.phone, collegeName: addr.collegeName || '',
      hostelBlock: addr.hostelBlock || '', roomNumber: addr.roomNumber || '',
      addressLine: addr.addressLine, city: addr.city, pinCode: addr.pinCode, isDefault: addr.isDefault });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    await deleteAddress(id);
    toast.success('Address deleted.');
    fetchAddresses();
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    toast.success('Default address set.');
    fetchAddresses();
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700 }}>My Addresses</h2>
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
            + Add Address
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16 }}>{editId ? 'Edit Address' : 'New Address'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['fullName', 'Full Name', 'text', true],
                  ['phone', 'Phone', 'tel', true],
                  ['collegeName', 'College Name', 'text', false],
                  ['hostelBlock', 'Hostel / Block', 'text', false],
                  ['roomNumber', 'Room Number', 'text', false],
                  ['city', 'City', 'text', true],
                  ['pinCode', 'PIN Code', 'text', true],
                ].map(([name, label, type, req]) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">{label}</label>
                    <input className="form-input" type={type} name={name} value={form[name]}
                      onChange={handleChange} required={req} />
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Full Address</label>
                <input className="form-input" type="text" name="addressLine" value={form.addressLine}
                  onChange={handleChange} required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
                Set as default address
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editId ? 'Update' : 'Save Address'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditId(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {addresses.map((addr) => (
            <div key={addr._id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong>{addr.fullName}</strong>
                  {addr.isDefault && <span className="badge badge-blue" style={{ marginLeft: 8 }}>Default</span>}
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                    {addr.phone}
                  </p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    {addr.hostelBlock && `${addr.hostelBlock}, `}{addr.addressLine}, {addr.city} - {addr.pinCode}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {!addr.isDefault && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleSetDefault(addr._id)}>
                      Set Default
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(addr)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(addr._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <div className="empty-state"><h3>No addresses saved</h3><p>Add a delivery address to rent products.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

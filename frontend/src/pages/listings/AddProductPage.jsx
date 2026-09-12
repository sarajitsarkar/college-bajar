import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../api/products.api';
import { getCategories } from '../../api/admin.api';
import toast from 'react-hot-toast';
import './ProductForm.css';

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export default function AddProductPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', pricePerDay: '',
    minRentalDays: 1, maxRentalDays: 30, condition: 'good', totalQuantity: 1,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data.data.categories)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) return toast.error('Please select a category.');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      await createProduct(fd);
      toast.success('Product listed successfully!');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 680 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 24 }}>List a Product for Rent</h2>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input className="form-input" type="text" name="title" value={form.title}
                onChange={handleChange} placeholder="e.g. Casio Scientific Calculator" required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" name="description" value={form.description}
                onChange={handleChange} placeholder="Describe your product..." required rows={4} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select className="form-select" name="condition" value={form.condition} onChange={handleChange}>
                  {CONDITION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price Per Day (₹) *</label>
                <input className="form-input" type="number" name="pricePerDay" value={form.pricePerDay}
                  onChange={handleChange} min="1" placeholder="e.g. 10" required />
              </div>

              <div className="form-group">
                <label className="form-label">Available Quantity</label>
                <input className="form-input" type="number" name="totalQuantity" value={form.totalQuantity}
                  onChange={handleChange} min="1" />
              </div>

              <div className="form-group">
                <label className="form-label">Min Rental Days</label>
                <input className="form-input" type="number" name="minRentalDays" value={form.minRentalDays}
                  onChange={handleChange} min="1" />
              </div>

              <div className="form-group">
                <label className="form-label">Max Rental Days</label>
                <input className="form-input" type="number" name="maxRentalDays" value={form.maxRentalDays}
                  onChange={handleChange} min="1" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Images (up to 5)</label>
              <input className="form-input" type="file" accept="image/*" multiple onChange={handleImages} />
              {previews.length > 0 && (
                <div className="img-previews">
                  {previews.map((src, i) => <img key={i} src={src} alt={`Preview ${i + 1}`} />)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Listing...' : 'List Product'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

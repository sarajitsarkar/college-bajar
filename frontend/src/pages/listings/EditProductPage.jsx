import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct } from '../../api/products.api';
import { getCategories } from '../../api/admin.api';
import toast from 'react-hot-toast';

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', categoryId: '', pricePerDay: '',
    minRentalDays: 1, maxRentalDays: 30, condition: 'good', totalQuantity: 1, isAvailable: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getProductById(id), getCategories()])
      .then(([pRes, cRes]) => {
        const p = pRes.data.data.product;
        setForm({
          title: p.title, description: p.description,
          categoryId: p.categoryId?._id || p.categoryId,
          pricePerDay: p.pricePerDay, minRentalDays: p.minRentalDays,
          maxRentalDays: p.maxRentalDays, condition: p.condition,
          totalQuantity: p.totalQuantity, isAvailable: p.isAvailable,
        });
        setExistingImages(p.images || []);
        setCategories(cRes.data.data.categories);
      })
      .catch(() => navigate('/my-listings'));
  }, [id, navigate]);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newImages.forEach((img) => fd.append('images', img));
      await updateProduct(id, fd);
      toast.success('Product updated!');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 680 }}>
        <h2 style={{ fontWeight: 700, marginBottom: 24 }}>Edit Product</h2>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input className="form-input" type="text" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" name="description" value={form.description} onChange={handleChange} required />
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
                <input className="form-input" type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Total Quantity</label>
                <input className="form-input" type="number" name="totalQuantity" value={form.totalQuantity} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Min Rental Days</label>
                <input className="form-input" type="number" name="minRentalDays" value={form.minRentalDays} onChange={handleChange} min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Rental Days</label>
                <input className="form-input" type="number" name="maxRentalDays" value={form.maxRentalDays} onChange={handleChange} min="1" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} style={{ marginRight: 8 }} />
                Mark as Available
              </label>
            </div>

            {existingImages.length > 0 && !previews.length && (
              <div className="form-group">
                <label className="form-label">Current Images</label>
                <div className="img-previews">
                  {existingImages.map((src, i) => <img key={i} src={src} alt={`Image ${i + 1}`} />)}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Replace Images (optional)</label>
              <input className="form-input" type="file" accept="image/*" multiple onChange={handleImages} />
              {previews.length > 0 && (
                <div className="img-previews">
                  {previews.map((src, i) => <img key={i} src={src} alt={`Preview ${i + 1}`} />)}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

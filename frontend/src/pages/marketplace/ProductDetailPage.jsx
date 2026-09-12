import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, checkAvailability } from '../../api/products.api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const CONDITION_LABELS = { new: 'New', 'like-new': 'Like New', good: 'Good', fair: 'Fair' };

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);

  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    getProductById(id)
      .then((res) => {
        setProduct(res.data.data.product);
        setLoading(false);
      })
      .catch(() => { toast.error('Product not found.'); navigate('/'); });
  }, [id, navigate]);

  const handleCheckAvailability = async () => {
    if (!endDate) return toast.error('Please select an end date.');
    setCheckingAvail(true);
    try {
      const res = await checkAvailability(id, { startDate, endDate });
      setAvailability(res.data.data);
    } catch {
      toast.error('Could not check availability.');
    } finally {
      setCheckingAvail(false);
    }
  };

  const getRentalDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  const handleRentNow = () => {
    if (!isAuthenticated) return navigate('/login');
    if (!endDate) return toast.error('Please select rental dates.');
    const days = getRentalDays();
    if (days < 1) return toast.error('End date must be after start date.');
    navigate('/checkout', {
      state: { productId: id, startDate, endDate, rentalDays: days, product },
    });
  };

  if (loading) return <div className="loader-overlay"><div className="spinner" /></div>;
  if (!product) return null;

  const rentalDays = getRentalDays();
  const estimatedCost = rentalDays > 0 ? product.pricePerDay * rentalDays : 0;
  const isAvail = product.isAvailable && product.availableQuantity > 0;

  return (
    <div className="product-detail page-wrapper">
      <div className="container">
        <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="product-detail-layout">
          {/* Images */}
          <div className="product-images">
            <div className="product-main-img">
              {product.images?.length > 0
                ? <img src={product.images[selectedImg]} alt={product.title} />
                : <div className="product-no-img">📷</div>
              }
            </div>
            {product.images?.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb-btn ${selectedImg === i ? 'active' : ''}`}
                    onClick={() => setSelectedImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Booking */}
          <div className="product-info">
            <span className="product-category-tag">{product.categoryId?.name}</span>
            <h1 className="product-title">{product.title}</h1>

            <div className="product-price-row">
              <div className="product-price">
                <strong>{formatCurrency(product.pricePerDay)}</strong>
                <span>/ day</span>
              </div>
              <span className={`badge badge-${isAvail ? 'green' : 'red'}`}>
                {isAvail ? '✔ Available' : '✖ Unavailable'}
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-meta-grid">
              <div className="product-meta-item">
                <span className="meta-label">Condition</span>
                <span className="meta-value">{CONDITION_LABELS[product.condition] || product.condition}</span>
              </div>
              <div className="product-meta-item">
                <span className="meta-label">Min Rental</span>
                <span className="meta-value">{product.minRentalDays} day(s)</span>
              </div>
              <div className="product-meta-item">
                <span className="meta-label">Max Rental</span>
                <span className="meta-value">{product.maxRentalDays} day(s)</span>
              </div>
            </div>

            {/* Date picker */}
            <div className="booking-box card">
              <h3>Select Rental Period</h3>
              <div className="date-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" value={startDate} min={today}
                    onChange={(e) => { setStartDate(e.target.value); setAvailability(null); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" type="date" value={endDate} min={startDate || today}
                    onChange={(e) => { setEndDate(e.target.value); setAvailability(null); }} />
                </div>
              </div>

              {rentalDays > 0 && (
                <div className="rental-estimate">
                  <div className="estimate-row">
                    <span>{formatCurrency(product.pricePerDay)} × {rentalDays} day(s)</span>
                    <strong>{formatCurrency(estimatedCost)}</strong>
                  </div>
                  <p className="estimate-note">+ platform fee will be calculated at checkout</p>
                </div>
              )}

              <div className="booking-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleCheckAvailability}
                  disabled={checkingAvail || !endDate}
                >
                  {checkingAvail ? 'Checking...' : 'Check Availability'}
                </button>

                {availability && (
                  <span className={`badge badge-${availability.available ? 'green' : 'red'}`}>
                    {availability.available ? '✔ Available for these dates' : `✖ ${availability.reason}`}
                  </span>
                )}
              </div>

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handleRentNow}
                disabled={!isAvail}
              >
                {isAvail ? 'Rent Now' : 'Currently Unavailable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

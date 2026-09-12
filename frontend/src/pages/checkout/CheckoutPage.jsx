import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAddresses } from '../../api/users.api';
import { placeOrder } from '../../api/orders.api';
import { createPaymentOrder, verifyPayment } from '../../api/payments.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null);

  useEffect(() => {
    if (!state?.productId) { navigate('/'); return; }
    getAddresses()
      .then((res) => {
        const addrs = res.data.data.addresses;
        setAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddress(def._id);
      })
      .catch(() => {});
  }, [state, navigate]);

  // Calculate estimated amounts
  const rentalDays = state?.rentalDays || 0;
  const pricePerDay = state?.product?.pricePerDay || 0;
  const rentalAmount = pricePerDay * rentalDays;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) return toast.error('Please select a delivery address.');
    setLoading(true);
    try {
      const orderRes = await placeOrder({
        productId: state.productId,
        rentalStartDate: state.startDate,
        rentalEndDate: state.endDate,
        addressId: selectedAddress,
        paymentMethod,
      });

      const order = orderRes.data.data.order;
      setOrderSummary(order);

      if (paymentMethod === 'upi') {
        await handleRazorpayPayment(order);
      } else {
        toast.success('Order placed successfully!');
        navigate(`/order-confirm/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (order) => {
    try {
      const payRes = await createPaymentOrder({ orderId: order._id });
      const { razorpayOrderId, amount, keyId } = payRes.data.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'College Bajar',
        description: `Rental: ${state.product?.title}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            toast.success('Payment successful! Order confirmed.');
            navigate(`/order-confirm/${order._id}`);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        theme: { color: '#2563eb' },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway not loaded. Please try COD.');
        return;
      }
      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.');
    }
  };

  if (!state?.productId) return null;

  return (
    <div className="checkout-page page-wrapper">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Left: Address + Payment */}
          <div className="checkout-left">
            {/* Address Section */}
            <div className="card checkout-section">
              <h3>Delivery Address</h3>
              {addresses.length === 0 ? (
                <div>
                  <p className="text-muted">No addresses saved.</p>
                  <a href="/profile/addresses" className="btn btn-outline btn-sm" style={{marginTop:8}}>
                    + Add Address
                  </a>
                </div>
              ) : (
                <div className="address-list">
                  {addresses.map((addr) => (
                    <label key={addr._id} className={`address-option ${selectedAddress === addr._id ? 'selected' : ''}`}>
                      <input type="radio" name="address" value={addr._id}
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)} />
                      <div className="address-option-body">
                        <strong>{addr.fullName}</strong>
                        <span>{addr.phone}</span>
                        <p>{addr.hostelBlock && `${addr.hostelBlock}, `}{addr.addressLine}, {addr.city} - {addr.pinCode}</p>
                        {addr.isDefault && <span className="badge badge-blue">Default</span>}
                      </div>
                    </label>
                  ))}
                  <a href="/profile/addresses" className="btn-link" style={{display:'block',marginTop:8}}>
                    + Add New Address
                  </a>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card checkout-section">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')} />
                  <div>
                    <strong>💵 Cash on Delivery</strong>
                    <p>Pay cash when the product is delivered</p>
                  </div>
                </label>
                <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')} />
                  <div>
                    <strong>📱 UPI / Online Payment</strong>
                    <p>Pay securely via Razorpay (UPI, cards, wallets)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-right">
            <div className="card checkout-summary">
              <h3>Order Summary</h3>
              <div className="summary-product">
                {state.product?.images?.[0] && (
                  <img src={state.product.images[0]} alt={state.product.title} />
                )}
                <div>
                  <p className="summary-product-title">{state.product?.title}</p>
                  <p className="summary-product-price">{formatCurrency(pricePerDay)}/day</p>
                </div>
              </div>

              <div className="summary-dates">
                <span>📅 {formatDate(state.startDate)} → {formatDate(state.endDate)}</span>
                <span>{rentalDays} day(s)</span>
              </div>

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Rental Amount</span>
                  <span>{formatCurrency(rentalAmount)}</span>
                </div>
                <div className="summary-row muted">
                  <span>Platform Fee</span>
                  <span>Calculated at server</span>
                </div>
                <div className="summary-row total">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(rentalAmount)}+</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-block btn-lg"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : paymentMethod === 'upi' ? 'Pay Now' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

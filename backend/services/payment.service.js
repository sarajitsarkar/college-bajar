const crypto = require('crypto');
const getRazorpay = require('../config/razorpay');

/**
 * Creates a Razorpay order for UPI payment.
 * Amount must be in paise (multiply ₹ by 100).
 */
const createRazorpayOrder = async (amountInRupees, orderId) => {
  const razorpay = getRazorpay();
  const options = {
    amount: amountInRupees * 100, // paise
    currency: 'INR',
    receipt: orderId,
    notes: { platform: 'College Bajar' },
  };
  return razorpay.orders.create(options);
};

/**
 * Verifies Razorpay payment signature.
 * @returns {boolean}
 */
const verifySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === razorpaySignature;
};

module.exports = { createRazorpayOrder, verifySignature };

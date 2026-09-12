const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const sendResponse = require('../utils/sendResponse');
const { createRazorpayOrder, verifySignature } = require('../services/payment.service');
const { decrementAvailability } = require('../services/rentalAvailability.service');

// POST /api/payments/create-order — create Razorpay order for UPI
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, renterId: req.user._id });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    if (order.paymentMethod !== 'upi') {
      return sendResponse(res, 400, false, 'This order uses Cash on Delivery.');
    }

    if (order.paymentStatus === 'paid') {
      return sendResponse(res, 400, false, 'This order is already paid.');
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(order.totalAmount, order.orderId);

    // Create payment record
    const payment = await Payment.create({
      orderId: order._id,
      renterId: req.user._id,
      amount: order.totalAmount,
      method: 'upi',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    // Link payment to order
    order.paymentId = payment._id;
    await order.save();

    return sendResponse(res, 200, true, 'Payment order created.', {
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.orderId,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify — verify Razorpay signature after payment
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return sendResponse(res, 400, false, 'Payment verification failed. Invalid signature.');
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'captured',
      }
    );

    // Update order
    const order = await Order.findOne({ _id: orderId, renterId: req.user._id });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', changedBy: req.user._id });
    await order.save();

    // Decrement product availability
    await decrementAvailability(order.productId);

    return sendResponse(res, 200, true, 'Payment verified. Order confirmed.', {
      orderId: order.orderId,
      status: order.status,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/:orderId — payment detail for own order
const getPaymentDetail = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, renterId: req.user._id });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    const payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      return sendResponse(res, 404, false, 'Payment record not found.');
    }

    // Strip sensitive Razorpay signature from response
    const paymentObj = payment.toObject();
    delete paymentObj.razorpaySignature;

    return sendResponse(res, 200, true, 'Payment detail fetched.', { payment: paymentObj });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentOrder, verifyPayment, getPaymentDetail };

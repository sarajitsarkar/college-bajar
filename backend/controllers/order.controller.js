const { validationResult } = require('express-validator');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Address = require('../models/Address.model');
const sendResponse = require('../utils/sendResponse');
const { checkAvailability, decrementAvailability, incrementAvailability } = require('../services/rentalAvailability.service');
const { calculatePlatformFee } = require('../services/feeCalculator.service');

// Helper: fields to exclude from order response for non-admins
const PRIVATE_ORDER_FIELDS = '-ownerId';

// POST /api/orders — place rental order
const placeOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, errors.array()[0].msg);
    }

    const { productId, rentalStartDate, rentalEndDate, addressId, paymentMethod } = req.body;

    // Validate dates
    const start = new Date(rentalStartDate);
    const end = new Date(rentalEndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return sendResponse(res, 400, false, 'Rental start date cannot be in the past.');
    }
    if (end <= start) {
      return sendResponse(res, 400, false, 'End date must be after start date.');
    }

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found.');
    }

    // Prevent renting own product
    if (product.ownerId.toString() === req.user._id.toString()) {
      return sendResponse(res, 400, false, 'You cannot rent your own product.');
    }

    // Calculate rental days
    const msPerDay = 24 * 60 * 60 * 1000;
    const rentalDays = Math.ceil((end - start) / msPerDay);

    if (rentalDays < product.minRentalDays) {
      return sendResponse(res, 400, false, `Minimum rental period is ${product.minRentalDays} day(s).`);
    }
    if (rentalDays > product.maxRentalDays) {
      return sendResponse(res, 400, false, `Maximum rental period is ${product.maxRentalDays} day(s).`);
    }

    // Check availability
    const { available, reason } = await checkAvailability(productId, start, end);
    if (!available) {
      return sendResponse(res, 400, false, reason);
    }

    // Fetch delivery address
    const address = await Address.findOne({ _id: addressId, userId: req.user._id });
    if (!address) {
      return sendResponse(res, 404, false, 'Delivery address not found.');
    }

    // Calculate amounts
    const rentalAmount = product.pricePerDay * rentalDays;
    const { platformFee } = await calculatePlatformFee(rentalAmount);
    const totalAmount = rentalAmount + platformFee;

    // Determine initial status
    const initialStatus = paymentMethod === 'upi' ? 'payment_pending' : 'confirmed';

    const order = await Order.create({
      renterId: req.user._id,
      productId,
      ownerId: product.ownerId,
      rentalStartDate: start,
      rentalEndDate: end,
      rentalDays,
      rentalAmount,
      platformFee,
      totalAmount,
      deliveryAddress: {
        fullName: address.fullName,
        phone: address.phone,
        collegeName: address.collegeName,
        hostelBlock: address.hostelBlock,
        roomNumber: address.roomNumber,
        addressLine: address.addressLine,
        city: address.city,
        pinCode: address.pinCode,
      },
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      status: initialStatus,
      statusHistory: [{ status: initialStatus, changedBy: req.user._id }],
    });

    // Decrement availability for COD orders immediately on confirm
    if (paymentMethod === 'cod') {
      await decrementAvailability(productId);
    }

    // Populate product info
    await order.populate('productId', 'title images pricePerDay');

    // Strip ownerId from response
    const orderObj = order.toObject();
    delete orderObj.ownerId;

    return sendResponse(res, 201, true, 'Order placed successfully.', { order: orderObj });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders — my orders as renter
const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { renterId: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(PRIVATE_ORDER_FIELDS)
        .populate('productId', 'title images pricePerDay categoryId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Orders fetched.', {
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id — order detail
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      renterId: req.user._id,
    })
      .select(PRIVATE_ORDER_FIELDS)
      .populate('productId', 'title images pricePerDay categoryId description');

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    return sendResponse(res, 200, true, 'Order fetched.', { order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/orders/:id/cancel — cancel order
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, renterId: req.user._id });
    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    const cancellableStatuses = ['order_placed', 'payment_pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      return sendResponse(res, 400, false, 'This order cannot be cancelled at its current stage.');
    }

    order.status = 'cancelled';
    order.cancellationReason = req.body.reason || 'Cancelled by renter';
    order.statusHistory.push({ status: 'cancelled', changedBy: req.user._id });
    await order.save();

    // Release availability
    if (order.paymentMethod === 'cod' || order.paymentStatus === 'paid') {
      await incrementAvailability(order.productId);
    }

    return sendResponse(res, 200, true, 'Order cancelled.', { order });
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/incoming — orders for my listed products (owner view)
const getIncomingOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { ownerId: req.user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(query)
        .select(PRIVATE_ORDER_FIELDS) // still strip ownerId
        .populate('productId', 'title images pricePerDay')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Incoming orders fetched.', {
      orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// Allowed status transitions for owner
const OWNER_ALLOWED_TRANSITIONS = {
  confirmed: ['preparing'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['rental_active'],
  rental_active: ['return_pending'],
  return_pending: ['returned'],
  returned: ['completed'],
};

// PUT /api/orders/:id/status — owner updates order status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ _id: req.params.id, ownerId: req.user._id });

    if (!order) {
      return sendResponse(res, 404, false, 'Order not found.');
    }

    const allowedNext = OWNER_ALLOWED_TRANSITIONS[order.status];
    if (!allowedNext || !allowedNext.includes(status)) {
      return sendResponse(res, 400, false, `Cannot transition from '${order.status}' to '${status}'.`);
    }

    order.status = status;
    order.statusHistory.push({ status, changedBy: req.user._id });

    // On completed — release product availability
    if (status === 'completed') {
      await incrementAvailability(order.productId);
    }

    await order.save();

    return sendResponse(res, 200, true, 'Order status updated.', { status: order.status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getIncomingOrders,
  updateOrderStatus,
};

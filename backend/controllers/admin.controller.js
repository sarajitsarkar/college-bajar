const User = require('../models/User.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const Category = require('../models/Category.model');
const FeeRule = require('../models/FeeRule.model');
const sendResponse = require('../utils/sendResponse');

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'suspended') query.isActive = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Users fetched.', {
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, 404, false, 'User not found.');
    return sendResponse(res, 200, true, 'User fetched.', { user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/status — suspend or activate
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) return sendResponse(res, 404, false, 'User not found.');
    return sendResponse(res, 200, true, `User ${isActive ? 'activated' : 'suspended'}.`, { user });
  } catch (error) {
    next(error);
  }
};

// ─── PRODUCT MANAGEMENT ──────────────────────────────────────────────────────

// GET /api/admin/products
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, category, isApproved } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (category) query.categoryId = category;
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('ownerId', 'name email phone collegeName') // Full owner info for admin
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Products fetched.', {
      products,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('ownerId', 'name email phone collegeName')
      .populate('categoryId', 'name slug');
    if (!product) return sendResponse(res, 404, false, 'Product not found.');
    return sendResponse(res, 200, true, 'Product fetched.', { product });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/products/:id/approve
const approveProduct = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
    if (!product) return sendResponse(res, 404, false, 'Product not found.');
    return sendResponse(res, 200, true, `Product ${isApproved ? 'approved' : 'rejected'}.`, { product });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return sendResponse(res, 404, false, 'Product not found.');
    return sendResponse(res, 200, true, 'Product removed.');
  } catch (error) {
    next(error);
  }
};

// ─── CATEGORY MANAGEMENT ─────────────────────────────────────────────────────

// GET /api/admin/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return sendResponse(res, 200, true, 'Categories fetched.', { categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name) return sendResponse(res, 400, false, 'Category name is required.');
    const category = await Category.create({ name, icon });
    return sendResponse(res, 201, true, 'Category created.', { category });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, isActive } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, icon, isActive },
      { new: true, runValidators: true }
    );
    if (!category) return sendResponse(res, 404, false, 'Category not found.');
    return sendResponse(res, 200, true, 'Category updated.', { category });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return sendResponse(res, 404, false, 'Category not found.');
    return sendResponse(res, 200, true, 'Category deleted.');
  } catch (error) {
    next(error);
  }
};

// ─── ORDER MANAGEMENT ────────────────────────────────────────────────────────

// GET /api/admin/orders
const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('renterId', 'name email phone')
        .populate('ownerId', 'name email phone')
        .populate('productId', 'title images pricePerDay')
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

// GET /api/admin/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('renterId', 'name email phone collegeName')
      .populate('ownerId', 'name email phone collegeName')
      .populate('productId', 'title images pricePerDay description')
      .populate('paymentId');
    if (!order) return sendResponse(res, 404, false, 'Order not found.');
    return sendResponse(res, 200, true, 'Order fetched.', { order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return sendResponse(res, 404, false, 'Order not found.');

    const { incrementAvailability } = require('../services/rentalAvailability.service');

    const prevStatus = order.status;
    order.status = status;
    if (reason) order.cancellationReason = reason;
    order.statusHistory.push({ status, changedBy: req.user._id });

    // If cancelling or completing, restore availability
    if (status === 'cancelled' || status === 'completed') {
      const wasActive = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'rental_active', 'return_pending'].includes(prevStatus);
      if (wasActive) {
        await incrementAvailability(order.productId);
      }
    }

    await order.save();
    return sendResponse(res, 200, true, 'Order status updated.', { status: order.status });
  } catch (error) {
    next(error);
  }
};

// ─── PAYMENT MANAGEMENT ──────────────────────────────────────────────────────

// GET /api/admin/payments
const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      Payment.find()
        .populate('renterId', 'name email phone')
        .populate('orderId', 'orderId totalAmount rentalAmount platformFee paymentMethod')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(),
    ]);

    return sendResponse(res, 200, true, 'Payments fetched.', {
      payments,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/payments/:id
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('renterId', 'name email phone')
      .populate('orderId');
    if (!payment) return sendResponse(res, 404, false, 'Payment not found.');
    return sendResponse(res, 200, true, 'Payment fetched.', { payment });
  } catch (error) {
    next(error);
  }
};

// ─── FEE RULE MANAGEMENT ─────────────────────────────────────────────────────

// GET /api/admin/fee-rules
const getFeeRules = async (req, res, next) => {
  try {
    const rules = await FeeRule.find().sort({ priority: 1 });
    return sendResponse(res, 200, true, 'Fee rules fetched.', { rules });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/fee-rules
const createFeeRule = async (req, res, next) => {
  try {
    const { name, type, feeAmount, percentage, tiers, priority } = req.body;
    const rule = await FeeRule.create({ name, type, feeAmount, percentage, tiers, priority });
    return sendResponse(res, 201, true, 'Fee rule created.', { rule });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/fee-rules/:id
const updateFeeRule = async (req, res, next) => {
  try {
    const { name, type, feeAmount, percentage, tiers, priority, isActive } = req.body;
    const rule = await FeeRule.findByIdAndUpdate(
      req.params.id,
      { name, type, feeAmount, percentage, tiers, priority, isActive },
      { new: true, runValidators: true }
    );
    if (!rule) return sendResponse(res, 404, false, 'Fee rule not found.');
    return sendResponse(res, 200, true, 'Fee rule updated.', { rule });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/fee-rules/:id
const deleteFeeRule = async (req, res, next) => {
  try {
    const rule = await FeeRule.findByIdAndDelete(req.params.id);
    if (!rule) return sendResponse(res, 404, false, 'Fee rule not found.');
    return sendResponse(res, 200, true, 'Fee rule deleted.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/fee-rules/:id/toggle
const toggleFeeRule = async (req, res, next) => {
  try {
    const rule = await FeeRule.findById(req.params.id);
    if (!rule) return sendResponse(res, 404, false, 'Fee rule not found.');
    rule.isActive = !rule.isActive;
    await rule.save();
    return sendResponse(res, 200, true, `Fee rule ${rule.isActive ? 'enabled' : 'disabled'}.`, { isActive: rule.isActive });
  } catch (error) {
    next(error);
  }
};

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

// GET /api/admin/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      activeRentals,
      completedRentals,
      cancelledOrders,
      pendingOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Product.countDocuments({ isApproved: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'rental_active' }),
      Order.countDocuments({ status: 'completed' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ status: { $in: ['order_placed', 'payment_pending', 'confirmed', 'preparing'] } }),
      Order.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } },
      ]),
    ]);

    return sendResponse(res, 200, true, 'Analytics fetched.', {
      totalUsers,
      totalProducts,
      totalOrders,
      activeRentals,
      completedRentals,
      cancelledOrders,
      pendingOrders,
      platformRevenue: revenueResult[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Users
  getUsers,
  getUserById,
  updateUserStatus,
  // Products
  getProducts,
  getProductById,
  approveProduct,
  deleteProduct,
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  // Orders
  getOrders,
  getOrderById,
  updateOrderStatus,
  // Payments
  getPayments,
  getPaymentById,
  // Fee Rules
  getFeeRules,
  createFeeRule,
  updateFeeRule,
  deleteFeeRule,
  toggleFeeRule,
  // Analytics
  getAnalytics,
};

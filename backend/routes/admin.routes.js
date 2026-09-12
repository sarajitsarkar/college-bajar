const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const {
  getUsers, getUserById, updateUserStatus,
  getProducts, getProductById, approveProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  getOrders, getOrderById, updateOrderStatus,
  getPayments, getPaymentById,
  getFeeRules, createFeeRule, updateFeeRule, deleteFeeRule, toggleFeeRule,
  getAnalytics,
} = require('../controllers/admin.controller');

const router = express.Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);

// Products
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.put('/products/:id/approve', approveProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// Payments
router.get('/payments', getPayments);
router.get('/payments/:id', getPaymentById);

// Fee Rules
router.get('/fee-rules', getFeeRules);
router.post('/fee-rules', createFeeRule);
router.put('/fee-rules/:id', updateFeeRule);
router.delete('/fee-rules/:id', deleteFeeRule);
router.put('/fee-rules/:id/toggle', toggleFeeRule);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;

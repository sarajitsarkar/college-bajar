const express = require('express');
const { body } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getMyProducts,
  checkProductAvailability,
} = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const privacyFilter = require('../middleware/privacyFilter.middleware');

const router = express.Router();

// Optional auth middleware — passes req.user if token present, but doesn't block
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const jwt = require('jsonwebtoken');
  const User = require('../models/User.model');
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.userId)
      .select('-passwordHash')
      .then((user) => {
        req.user = user;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
};

// Public routes (with optional auth for admin detection)
router.get('/', optionalAuth, privacyFilter, getProducts);
router.get('/my', authMiddleware, getMyProducts);
router.get('/:id/availability-check', checkProductAvailability);
router.get('/:id', optionalAuth, privacyFilter, getProductById);

// Protected routes
router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  [
    body('title').trim().notEmpty().withMessage('Product title is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('categoryId').notEmpty().withMessage('Category is required.'),
    body('pricePerDay').isNumeric().withMessage('Price per day must be a number.'),
    body('condition').isIn(['new', 'like-new', 'good', 'fair']).withMessage('Invalid condition.'),
  ],
  createProduct
);

router.put('/:id', authMiddleware, upload.array('images', 5), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.put('/:id/availability', authMiddleware, toggleAvailability);

module.exports = router;

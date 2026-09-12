const express = require('express');
const { body } = require('express-validator');
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getIncomingOrders,
  updateOrderStatus,
} = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('Product ID is required.'),
    body('rentalStartDate').isISO8601().withMessage('Valid start date is required.'),
    body('rentalEndDate').isISO8601().withMessage('Valid end date is required.'),
    body('addressId').notEmpty().withMessage('Delivery address is required.'),
    body('paymentMethod').isIn(['upi', 'cod']).withMessage('Payment method must be upi or cod.'),
  ],
  placeOrder
);

router.get('/', getMyOrders);
router.get('/incoming', getIncomingOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;

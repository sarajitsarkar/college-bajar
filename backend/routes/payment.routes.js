const express = require('express');
const { createPaymentOrder, verifyPayment, getPaymentDetail } = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.get('/:orderId', getPaymentDetail);

module.exports = router;

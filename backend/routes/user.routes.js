const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDashboard,
  getEarnings,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/addresses', getAddresses);
router.post(
  '/addresses',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('addressLine').trim().notEmpty().withMessage('Address is required.'),
    body('city').trim().notEmpty().withMessage('City is required.'),
    body('pinCode').trim().notEmpty().withMessage('PIN code is required.'),
  ],
  addAddress
);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

router.get('/dashboard', getDashboard);
router.get('/earnings', getEarnings);

module.exports = router;

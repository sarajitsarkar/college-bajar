const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const Address = require('../models/Address.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const sendResponse = require('../utils/sendResponse');

// GET /api/users/profile
const getProfile = async (req, res) => {
  return sendResponse(res, 200, true, 'Profile fetched.', { user: req.user });
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, collegeName, collegeId, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, collegeName, collegeId, profileImage },
      { new: true, runValidators: true }
    );
    return sendResponse(res, 200, true, 'Profile updated.', { user });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/addresses
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1 });
    return sendResponse(res, 200, true, 'Addresses fetched.', { addresses });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/addresses
const addAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, errors.array()[0].msg);
    }

    const { fullName, phone, collegeName, hostelBlock, roomNumber, addressLine, city, pinCode, isDefault } = req.body;

    // If new address is default, unset previous default
    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      fullName,
      phone,
      collegeName,
      hostelBlock,
      roomNumber,
      addressLine,
      city,
      pinCode,
      isDefault: isDefault || false,
    });

    return sendResponse(res, 201, true, 'Address added.', { address });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/addresses/:id
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return sendResponse(res, 404, false, 'Address not found.');
    }

    const { fullName, phone, collegeName, hostelBlock, roomNumber, addressLine, city, pinCode, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const updated = await Address.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, collegeName, hostelBlock, roomNumber, addressLine, city, pinCode, isDefault },
      { new: true, runValidators: true }
    );

    return sendResponse(res, 200, true, 'Address updated.', { address: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/addresses/:id
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return sendResponse(res, 404, false, 'Address not found.');
    }
    await address.deleteOne();
    return sendResponse(res, 200, true, 'Address deleted.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/addresses/:id/default
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      return sendResponse(res, 404, false, 'Address not found.');
    }

    await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    return sendResponse(res, 200, true, 'Default address set.', { address });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/dashboard
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [
      activeRentals,
      recentOrders,
      myListings,
      totalEarnings,
    ] = await Promise.all([
      // Orders where I am the renter and rental is active
      Order.find({
        renterId: userId,
        status: { $in: ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'rental_active'] },
      })
        .populate('productId', 'title images pricePerDay')
        .sort({ createdAt: -1 })
        .limit(5),

      // My recent orders
      Order.find({ renterId: userId })
        .populate('productId', 'title images pricePerDay')
        .sort({ createdAt: -1 })
        .limit(5),

      // Products I listed
      Product.find({ ownerId: userId, isApproved: true })
        .select('title images pricePerDay isAvailable availableQuantity')
        .sort({ createdAt: -1 })
        .limit(5),

      // Total earnings: sum of rentalAmount from orders where I am owner and status = completed
      Order.aggregate([
        { $match: { ownerId: userId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$rentalAmount' } } },
      ]),
    ]);

    return sendResponse(res, 200, true, 'Dashboard data fetched.', {
      activeRentals,
      recentOrders,
      myListings,
      totalEarnings: totalEarnings[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/earnings
const getEarnings = async (req, res, next) => {
  try {
    const earnings = await Order.aggregate([
      { $match: { ownerId: req.user._id, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$rentalAmount' },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    return sendResponse(res, 200, true, 'Earnings fetched.', {
      earnings: earnings[0] || { totalEarnings: 0, totalOrders: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getDashboard,
  getEarnings,
};

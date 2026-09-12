const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

// Statuses that indicate an active/ongoing rental booking
const BLOCKING_STATUSES = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'rental_active',
  'return_pending',
];

/**
 * Checks whether a product is available for the given date range.
 *
 * @param {string} productId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {string|null} excludeOrderId - Exclude a specific order (for edits)
 * @returns {Promise<{ available: boolean, reason: string|null }>}
 */
const checkAvailability = async (productId, startDate, endDate, excludeOrderId = null) => {
  const product = await Product.findById(productId);

  if (!product) {
    return { available: false, reason: 'Product not found.' };
  }

  if (!product.isAvailable) {
    return { available: false, reason: 'Product is currently unavailable.' };
  }

  if (!product.isApproved) {
    return { available: false, reason: 'Product is not approved for rental.' };
  }

  if (product.availableQuantity < 1) {
    return { available: false, reason: 'No units currently available.' };
  }

  // Count overlapping active bookings
  const query = {
    productId,
    status: { $in: BLOCKING_STATUSES },
    rentalStartDate: { $lte: new Date(endDate) },
    rentalEndDate: { $gte: new Date(startDate) },
  };

  if (excludeOrderId) {
    query._id = { $ne: excludeOrderId };
  }

  const overlappingCount = await Order.countDocuments(query);

  if (overlappingCount >= product.totalQuantity) {
    return {
      available: false,
      reason: 'Product is already booked for the selected dates.',
    };
  }

  return { available: true, reason: null };
};

/**
 * Decrements available quantity when an order is confirmed.
 */
const decrementAvailability = async (productId) => {
  await Product.findByIdAndUpdate(productId, {
    $inc: { availableQuantity: -1 },
  });
};

/**
 * Increments available quantity when an order is completed or cancelled.
 */
const incrementAvailability = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) return;

  const newQty = Math.min(product.availableQuantity + 1, product.totalQuantity);
  await Product.findByIdAndUpdate(productId, { availableQuantity: newQty });
};

module.exports = { checkAvailability, decrementAvailability, incrementAvailability };

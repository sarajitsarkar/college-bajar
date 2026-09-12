const Category = require('../models/Category.model');
const sendResponse = require('../utils/sendResponse');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendResponse(res, 200, true, 'Categories fetched.', { categories });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories };

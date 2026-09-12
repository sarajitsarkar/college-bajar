const { validationResult } = require('express-validator');
const Product = require('../models/Product.model');
const sendResponse = require('../utils/sendResponse');

// Helper: build product query — strips ownerId for non-admins at DB level
const PUBLIC_PRODUCT_FIELDS = '-ownerId';

// GET /api/products — browse marketplace
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      availability,
      college,
      sort = 'createdAt',
    } = req.query;

    const query = { isApproved: true };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    if (category) query.categoryId = category;
    if (condition) query.condition = condition;
    if (availability === 'true') {
      query.isAvailable = true;
      query.availableQuantity = { $gt: 0 };
    }
    if (college) query.collegeScope = { $regex: college, $options: 'i' };

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Sort options
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { pricePerDay: 1 };
    else if (sort === 'price_desc') sortObj = { pricePerDay: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };

    const isAdmin = req.user && req.user.role === 'admin';
    const fields = isAdmin ? '' : PUBLIC_PRODUCT_FIELDS;

    const [products, total] = await Promise.all([
      Product.find(query)
        .select(fields)
        .populate('categoryId', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return sendResponse(res, 200, true, 'Products fetched.', {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id — product detail
const getProductById = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const fields = isAdmin ? '' : PUBLIC_PRODUCT_FIELDS;

    const product = await Product.findOne({ _id: req.params.id, isApproved: true })
      .select(fields)
      .populate('categoryId', 'name slug');

    if (!product) {
      return sendResponse(res, 404, false, 'Product not found.');
    }

    return sendResponse(res, 200, true, 'Product fetched.', { product });
  } catch (error) {
    next(error);
  }
};

// POST /api/products — list a product
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, errors.array()[0].msg);
    }

    const {
      title,
      description,
      categoryId,
      pricePerDay,
      minRentalDays,
      maxRentalDays,
      condition,
      totalQuantity,
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map((f) => f.path) : [];

    const qty = Number(totalQuantity) || 1;

    const product = await Product.create({
      ownerId: req.user._id,
      title,
      description,
      categoryId,
      images,
      pricePerDay: Number(pricePerDay),
      minRentalDays: Number(minRentalDays) || 1,
      maxRentalDays: Number(maxRentalDays) || 30,
      condition,
      totalQuantity: qty,
      availableQuantity: qty,
      collegeScope: req.user.collegeName || '',
    });

    await product.populate('categoryId', 'name slug');

    // Strip ownerId for response (non-admin lister still shouldn't see raw ownerId field)
    const productObj = product.toObject();

    return sendResponse(res, 201, true, 'Product listed successfully.', { product: productObj });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id — edit own product
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found.');
    }

    // Only owner or admin can edit
    if (product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Not authorised to edit this product.');
    }

    const {
      title,
      description,
      categoryId,
      pricePerDay,
      minRentalDays,
      maxRentalDays,
      condition,
      totalQuantity,
      isAvailable,
    } = req.body;

    // New images if uploaded
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => f.path);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        categoryId,
        images,
        pricePerDay: Number(pricePerDay),
        minRentalDays: Number(minRentalDays) || 1,
        maxRentalDays: Number(maxRentalDays) || 30,
        condition,
        totalQuantity: Number(totalQuantity),
        isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable,
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug');

    return sendResponse(res, 200, true, 'Product updated.', { product: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found.');
    }

    if (product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Not authorised to delete this product.');
    }

    await product.deleteOne();
    return sendResponse(res, 200, true, 'Product deleted.');
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id/availability — toggle availability
const toggleAvailability = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found.');
    }

    if (product.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Not authorised.');
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return sendResponse(res, 200, true, `Product marked as ${product.isAvailable ? 'available' : 'unavailable'}.`, {
      isAvailable: product.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/my — my listed products
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ ownerId: req.user._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, true, 'My products fetched.', { products });
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id/availability-check
const checkProductAvailability = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return sendResponse(res, 400, false, 'startDate and endDate are required.');
    }

    const { checkAvailability } = require('../services/rentalAvailability.service');
    const result = await checkAvailability(req.params.id, new Date(startDate), new Date(endDate));

    return sendResponse(res, 200, true, 'Availability checked.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getMyProducts,
  checkProductAvailability,
};

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // ownerId is NEVER sent to non-admin API consumers
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Rental price per day is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    minRentalDays: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxRentalDays: {
      type: Number,
      default: 30,
    },
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair'],
      required: [true, 'Product condition is required'],
    },
    totalQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    collegeScope: {
      type: String,
      trim: true,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approved; admin can revoke
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ title: 'text', description: 'text' });
// Index for college scoping
productSchema.index({ collegeScope: 1 });
// Index for category filtering
productSchema.index({ categoryId: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

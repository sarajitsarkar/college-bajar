const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema(
  {
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, default: null }, // null = unlimited
    fee: { type: Number, required: true },
  },
  { _id: false }
);

const feeRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fee rule name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['fixed', 'percentage', 'tiered'],
      required: true,
    },
    // For 'fixed' type
    feeAmount: {
      type: Number,
      default: 0,
    },
    // For 'percentage' type
    percentage: {
      type: Number,
      default: 0,
    },
    // For 'tiered' type
    tiers: {
      type: [tierSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const FeeRule = mongoose.model('FeeRule', feeRuleSchema);
module.exports = FeeRule;

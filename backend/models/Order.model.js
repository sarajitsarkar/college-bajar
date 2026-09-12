const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'order_placed',
  'payment_pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'rental_active',
  'return_pending',
  'returned',
  'completed',
  'cancelled',
];

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Stored for admin use only; never exposed to non-admin API
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    rentalStartDate: {
      type: Date,
      required: true,
    },
    rentalEndDate: {
      type: Date,
      required: true,
    },
    rentalDays: {
      type: Number,
      required: true,
    },

    rentalAmount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Snapshot of address at time of order
    deliveryAddress: {
      fullName: String,
      phone: String,
      collegeName: String,
      hostelBlock: String,
      roomNumber: String,
      addressLine: String,
      city: String,
      pinCode: String,
    },

    paymentMethod: {
      type: String,
      enum: ['upi', 'cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },

    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'order_placed',
    },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Auto-generate orderId before save
orderSchema.pre('save', function () {
  if (!this.orderId) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderId = `CB-${year}-${random}`;
  }
});

orderSchema.index({ renterId: 1 });
orderSchema.index({ ownerId: 1 });
orderSchema.index({ productId: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

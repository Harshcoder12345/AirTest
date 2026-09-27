import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Voucher code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Voucher name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Value is required'],
      min: [0, 'Value must be positive'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['available', 'assigned', 'redeemed', 'revoked'],
      default: 'available',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    redeemedAt: {
      type: Date,
      default: null,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound indexes for optimized queries with pagination & filtering
voucherSchema.index({ status: 1, expiryDate: 1 });
voucherSchema.index({ assignedTo: 1, status: 1 });

const Voucher = mongoose.model('Voucher', voucherSchema);
export default Voucher;

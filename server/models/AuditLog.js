import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
      required: true,
      index: true,
    },
    voucherCode: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATED', 'ASSIGNED', 'REDEEMED', 'REVOKED'],
      required: true,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
    performedByRole: {
      type: String,
      required: true,
    },
    targetEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetEmployeeName: {
      type: String,
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

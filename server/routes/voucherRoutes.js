import express from 'express';
import {
  getVoucherStats,
  createVoucher,
  getVouchers,
  assignVoucher,
  getMyVouchers,
  redeemVoucher,
  revokeVoucher,
} from '../controllers/voucherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getVoucherStats);
router.get('/', protect, authorize('manager'), getVouchers);
router.post('/', protect, authorize('manager'), createVoucher);
router.post('/assign', protect, authorize('manager'), assignVoucher);
router.get('/my-vouchers', protect, authorize('employee'), getMyVouchers);
router.post('/:id/redeem', protect, authorize('employee'), redeemVoucher);
router.post('/:id/revoke', protect, authorize('manager'), revokeVoucher);

export default router;

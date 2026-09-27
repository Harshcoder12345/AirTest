import mongoose from 'mongoose';
import Voucher from '../models/Voucher.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Helper to generate unique voucher code if not provided
const generateVoucherCode = (category = 'CERT') => {
  const prefix = category.substring(0, 3).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomStr}-${timestamp}`;
};

// @desc    Get Voucher Stats & Available Count
// @route   GET /api/vouchers/stats
// @access  Private (Manager & Employee)
export const getVoucherStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [total, available, assigned, redeemed, revoked, expired] = await Promise.all([
      Voucher.countDocuments(),
      Voucher.countDocuments({ status: 'available', expiryDate: { $gt: now } }),
      Voucher.countDocuments({ status: 'assigned' }),
      Voucher.countDocuments({ status: 'redeemed' }),
      Voucher.countDocuments({ status: 'revoked' }),
      Voucher.countDocuments({ status: 'available', expiryDate: { $lte: now } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        available,
        assigned,
        redeemed,
        revoked,
        expired,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Single or Batch Vouchers
// @route   POST /api/vouchers
// @access  Private (Manager only)
export const createVoucher = async (req, res, next) => {
  try {
    const { name, category, value, expiryDate, count = 1, code } = req.body;

    // Case 8: Missing required information
    if (!name || !category || !value || !expiryDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide voucher name, category, value, and expiryDate.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid expiry date format.',
        code: 'INVALID_DATE',
      });
    }

    if (count > 1) {
      // Batch creation
      const vouchersToCreate = [];
      for (let i = 0; i < count; i++) {
        vouchersToCreate.push({
          code: generateVoucherCode(category),
          name: `${name} #${i + 1}`,
          category,
          value: Number(value),
          expiryDate: expiry,
          status: 'available',
          createdBy: req.user._id,
        });
      }

      const createdVouchers = await Voucher.insertMany(vouchersToCreate);

      // Audit logs for batch
      const auditLogs = createdVouchers.map((v) => ({
        voucher: v._id,
        voucherCode: v.code,
        action: 'CREATED',
        performedBy: req.user._id,
        performedByName: req.user.name,
        performedByRole: req.user.role,
        details: `Batch created ${count} vouchers under category '${category}'`,
      }));
      await AuditLog.insertMany(auditLogs);

      return res.status(201).json({
        success: true,
        message: `Successfully created ${count} vouchers.`,
        vouchers: createdVouchers,
      });
    }

    // Single creation
    const voucherCode = code ? code.toUpperCase() : generateVoucherCode(category);
    
    // Check code uniqueness
    const existing = await Voucher.findOne({ code: voucherCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Voucher code '${voucherCode}' already exists.`,
        code: 'DUPLICATE_VOUCHER_CODE',
      });
    }

    const voucher = await Voucher.create({
      code: voucherCode,
      name,
      category,
      value: Number(value),
      expiryDate: expiry,
      status: 'available',
      createdBy: req.user._id,
    });

    await AuditLog.create({
      voucher: voucher._id,
      voucherCode: voucher.code,
      action: 'CREATED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      details: `Created voucher '${voucher.name}' ($${voucher.value})`,
    });

    res.status(201).json({
      success: true,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Vouchers (Manager view with Search, Filter, Pagination)
// @route   GET /api/vouchers
// @access  Private (Manager only)
export const getVouchers = async (req, res, next) => {
  try {
    const { status, category, search, page = 1, limit = 10 } = req.query;

    let query = {};

    if (status) {
      if (status === 'available_valid') {
        query.status = 'available';
        query.expiryDate = { $gt: new Date() };
      } else if (status === 'expired') {
        query.expiryDate = { $lte: new Date() };
      } else {
        query.status = status;
      }
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [vouchers, total] = await Promise.all([
      Voucher.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Voucher.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an available voucher to an employee
// @route   POST /api/vouchers/assign
// @access  Private (Manager only)
export const assignVoucher = async (req, res, next) => {
  try {
    const { voucherId, employeeId } = req.body;

    // Case 8: Missing required information
    if (!voucherId || !employeeId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both voucherId and employeeId.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    // Case 7: Invalid ObjectId format check
    if (!mongoose.Types.ObjectId.isValid(voucherId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid voucher ID format: '${voucherId}'`,
        code: 'INVALID_VOUCHER_ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({
        success: false,
        error: `Invalid employee ID format: '${employeeId}'`,
        code: 'INVALID_EMPLOYEE_ID',
      });
    }

    // Check Employee exists & is an employee
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({
        success: false,
        error: 'Employee not found or specified user is not an employee.',
        code: 'EMPLOYEE_NOT_FOUND',
      });
    }

    // Check Voucher
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found.',
        code: 'VOUCHER_NOT_FOUND',
      });
    }

    // Case 1: Voucher already assigned or not available
    if (voucher.status !== 'available' || voucher.assignedTo !== null) {
      return res.status(400).json({
        success: false,
        error: `Cannot assign voucher. Current status is '${voucher.status}' and it is already assigned or revoked.`,
        code: 'VOUCHER_ALREADY_ASSIGNED',
      });
    }

    // Case 2: Cannot assign expired voucher
    if (new Date(voucher.expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: `Cannot assign expired voucher (Expired on ${new Date(voucher.expiryDate).toLocaleDateString()}).`,
        code: 'VOUCHER_EXPIRED',
      });
    }

    // Perform Assignment atomically
    voucher.status = 'assigned';
    voucher.assignedTo = employee._id;
    voucher.assignedAt = new Date();
    await voucher.save();

    // Audit Log
    await AuditLog.create({
      voucher: voucher._id,
      voucherCode: voucher.code,
      action: 'ASSIGNED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      targetEmployee: employee._id,
      targetEmployeeName: employee.name,
      details: `Assigned voucher '${voucher.code}' to employee ${employee.name} (${employee.email})`,
    });

    res.status(200).json({
      success: true,
      message: `Voucher '${voucher.code}' successfully assigned to ${employee.name}.`,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get vouchers assigned to current employee
// @route   GET /api/vouchers/my-vouchers
// @access  Private (Employee only)
export const getMyVouchers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    let query = { assignedTo: req.user._id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [vouchers, total] = await Promise.all([
      Voucher.find(query)
        .sort({ assignedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Voucher.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: vouchers.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      vouchers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Redeem a valid voucher assigned to logged-in employee
// @route   POST /api/vouchers/:id/redeem
// @access  Private (Employee only)
export const redeemVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Case 7: Invalid voucher ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid voucher ID format: '${id}'`,
        code: 'INVALID_VOUCHER_ID',
      });
    }

    const voucher = await Voucher.findById(id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found.',
        code: 'VOUCHER_NOT_FOUND',
      });
    }

    // Case 3: Employee tries to redeem another employee's voucher
    if (!voucher.assignedTo || voucher.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized action. You can only redeem vouchers assigned to your account.',
        code: 'UNAUTHORIZED_VOUCHER_REDEMPTION',
      });
    }

    // Case 4: Attempt to redeem already redeemed voucher
    if (voucher.status === 'redeemed') {
      return res.status(400).json({
        success: false,
        error: 'Voucher has already been redeemed previously.',
        code: 'VOUCHER_ALREADY_REDEEMED',
      });
    }

    // Check if revoked
    if (voucher.status === 'revoked') {
      return res.status(400).json({
        success: false,
        error: 'Voucher has been revoked by the manager and cannot be redeemed.',
        code: 'VOUCHER_REVOKED',
      });
    }

    // Case 5: Attempt to redeem an expired voucher
    if (new Date(voucher.expiryDate) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: `Cannot redeem expired voucher (Expired on ${new Date(voucher.expiryDate).toLocaleDateString()}).`,
        code: 'VOUCHER_EXPIRED',
      });
    }

    // Atomic update
    voucher.status = 'redeemed';
    voucher.redeemedAt = new Date();
    await voucher.save();

    // Audit Log
    await AuditLog.create({
      voucher: voucher._id,
      voucherCode: voucher.code,
      action: 'REDEEMED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      targetEmployee: req.user._id,
      targetEmployeeName: req.user.name,
      details: `Employee ${req.user.name} successfully redeemed voucher '${voucher.code}'`,
    });

    res.status(200).json({
      success: true,
      message: `Voucher '${voucher.code}' successfully redeemed!`,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke an assigned or available voucher (Manager only)
// @route   POST /api/vouchers/:id/revoke
// @access  Private (Manager only)
export const revokeVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Case 7: Invalid voucher ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid voucher ID format: '${id}'`,
        code: 'INVALID_VOUCHER_ID',
      });
    }

    const voucher = await Voucher.findById(id).populate('assignedTo', 'name email');

    if (!voucher) {
      return res.status(404).json({
        success: false,
        error: 'Voucher not found.',
        code: 'VOUCHER_NOT_FOUND',
      });
    }

    // Case 6: Manager tries to revoke a voucher that has already been redeemed
    if (voucher.status === 'redeemed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot revoke a voucher that has already been redeemed by an employee.',
        code: 'CANNOT_REVOKE_REDEEMED_VOUCHER',
      });
    }

    if (voucher.status === 'revoked') {
      return res.status(400).json({
        success: false,
        error: 'Voucher is already revoked.',
        code: 'VOUCHER_ALREADY_REVOKED',
      });
    }

    const previousStatus = voucher.status;
    const assignedEmpName = voucher.assignedTo ? voucher.assignedTo.name : 'Unassigned';

    voucher.status = 'revoked';
    voucher.revokedAt = new Date();
    await voucher.save();

    // Audit Log
    await AuditLog.create({
      voucher: voucher._id,
      voucherCode: voucher.code,
      action: 'REVOKED',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByRole: req.user.role,
      targetEmployee: voucher.assignedTo ? voucher.assignedTo._id : null,
      targetEmployeeName: assignedEmpName,
      details: `Revoked voucher '${voucher.code}' (Previous status: ${previousStatus})`,
    });

    res.status(200).json({
      success: true,
      message: `Voucher '${voucher.code}' has been revoked successfully.`,
      voucher,
    });
  } catch (error) {
    next(error);
  }
};

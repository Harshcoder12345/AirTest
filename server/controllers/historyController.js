import AuditLog from '../models/AuditLog.js';

// @desc    Get Voucher Audit History
// @route   GET /api/history
// @access  Private (Manager & Employee)
export const getAuditHistory = async (req, res, next) => {
  try {
    const { action, search, page = 1, limit = 15 } = req.query;

    let query = {};

    // Employees can only view logs where they are targetEmployee or performedBy
    if (req.user.role === 'employee') {
      query.$or = [
        { targetEmployee: req.user._id },
        { performedBy: req.user._id },
      ];
    }

    if (action) {
      query.action = action.toUpperCase();
    }

    if (search) {
      const searchReg = { $regex: search, $options: 'i' };
      if (query.$or) {
        query = {
          $and: [
            query,
            {
              $or: [
                { voucherCode: searchReg },
                { performedByName: searchReg },
                { targetEmployeeName: searchReg },
                { details: searchReg },
              ],
            },
          ],
        };
      } else {
        query.$or = [
          { voucherCode: searchReg },
          { performedByName: searchReg },
          { targetEmployeeName: searchReg },
          { details: searchReg },
        ];
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

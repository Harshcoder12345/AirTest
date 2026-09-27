import User from '../models/User.js';

// @desc    Get all employees (for manager selection)
// @route   GET /api/users/employees
// @access  Private (Manager only)
export const getEmployees = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = { role: 'employee' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await User.find(query).select('id name email createdAt').sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

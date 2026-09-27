import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT Token
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_token_key_2026_aixperts',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Case 8: Missing required information
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists.',
        code: 'EMAIL_EXISTS',
      });
    }

    const userRole = role === 'manager' ? 'manager' : 'employee';
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Case 8: Missing required information
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password.',
        code: 'MISSING_REQUIRED_FIELDS',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User not found.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Password incorrect.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

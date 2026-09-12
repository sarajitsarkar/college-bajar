const { validationResult } = require('express-validator');
const User = require('../models/User.model');
const generateToken = require('../utils/generateToken');
const sendResponse = require('../utils/sendResponse');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, errors.array()[0].msg);
    }

    const { name, email, phone, password, collegeName, collegeId } = req.body;

    // Check if email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Phone number';
      return sendResponse(res, 400, false, `${field} is already registered.`);
    }

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: password, // pre-save hook hashes it
      collegeName: collegeName || '',
      collegeId: collegeId || '',
    });

    const token = generateToken(user._id, user.role);

    return sendResponse(res, 201, true, 'Registration successful.', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        collegeName: user.collegeName,
        collegeId: user.collegeId,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, errors.array()[0].msg);
    }

    const { identifier, password } = req.body; // identifier = email or phone

    // Find user by email or phone, select passwordHash explicitly
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+passwordHash');

    if (!user) {
      return sendResponse(res, 401, false, 'Invalid credentials.');
    }

    if (!user.isActive) {
      return sendResponse(res, 403, false, 'Your account has been suspended. Contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendResponse(res, 401, false, 'Invalid credentials.');
    }

    const token = generateToken(user._id, user.role);

    return sendResponse(res, 200, true, 'Login successful.', {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        collegeName: user.collegeName,
        collegeId: user.collegeId,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return sendResponse(res, 200, true, 'Profile fetched.', { user: req.user });
};

module.exports = { register, login, getMe };
